/*
 * moomoo.js loader — PROTOCOL codec (client side)
 * ===============================================
 * The exact mirror of the server's protocol/crypto.js + protocol/session.js,
 * but running in the browser. Given the io-init handshake the server sends, it
 * derives the same per-connection packet tables and masks, then:
 *   - decodeS2C(frame)  -> { name, args }   (read incoming packets)
 *   - encodeC2S(name, args, seq) -> bytes   (send / re-send outgoing packets)
 *   - decodeC2S(frame)  -> { name, args, seq } (inspect what the client sent)
 *
 * The STABLE constants below mirror the client's constants block. The per-DEPLOY
 * secrets (mixKey, BUILD_SALT) are NOT here — the loader fetches them at runtime
 * from the page's `moomoo-protocol` module, exactly like the official client, so
 * this file does not need editing when the server re-deploys.
 *
 * Part of the LOADER (the volatile half). Mods never touch this.
 */
(function (root, factory) {
    const deps = (typeof require === "function")
        ? { sha256: require("./sha256.js"), msgpack: require("./msgpack.js") }
        : { sha256: root.MooMooSha256, msgpack: root.MooMooMsgpack };
    const value = factory(deps);
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooProtocol = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooProtocol = value;
})(typeof self !== "undefined" ? self : this, function (deps) {
    "use strict";

    const { hmacSha256 } = deps.sha256;
    const msgpack = deps.msgpack;

    // ---- STABLE CONSTANTS (mirror of the client's constants block) ----
    // If the official client bundle ever changes these, update them here (loader side).
    const MODE_KEYED = 1;
    const MAC_LENGTH = 6;
    const LEGACY_SALT = 1;
    const LEGACY_C2S_COUNT = 17;
    const LEGACY_S2C_COUNT = 36;
    const C2S_PACKETS = ["M", "D", "9", "e", "F", "z", "H", "K", "L", "N", "b", "P", "Q", "c", "6", "S", "0", "T", "R", "A", "V"];
    const S2C_PACKETS = ["A", "B", "C", "D", "E", "a", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "X", "Y", "Z", "g", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "W", "F"];
    const TABLE_SALT_MULT = 2654435761;
    const TABLE_S2C_XOR = 2246822507;
    const MASK_C2S_XOR = 3266489909;
    const MASK_S2C_XOR = 668265263;
    const MASK_COUNTER_MULT = 2654435761;
    const MASK_ZERO_SEED = 1831565813;

    // ---- algorithms (mirror of protocol/crypto.js) ----
    function mulberry32(seed) {
        return function () {
            seed |= 0;
            seed = (seed + 1831565813) | 0;
            let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function shuffleTable(names, seed) {
        const count = names.length;
        const ids = names.map((_, i) => i);
        const rand = mulberry32(seed >>> 0);
        for (let i = count - 1; i > 0; i--) {
            const j = Math.floor(rand() * (i + 1));
            const tmp = ids[i]; ids[i] = ids[j]; ids[j] = tmp;
        }
        const enc = {}, dec = {};
        for (let i = 0; i < count; i++) { enc[names[i]] = ids[i]; dec[ids[i]] = names[i]; }
        return { enc, dec };
    }

    function buildTables(seed, salt) {
        const legacy = salt == null;
        const mixedSalt = legacy ? LEGACY_SALT : salt;
        const tableSeed = (seed ^ Math.imul(mixedSalt, TABLE_SALT_MULT)) >>> 0;
        return {
            c2s: shuffleTable(legacy ? C2S_PACKETS.slice(0, LEGACY_C2S_COUNT) : C2S_PACKETS, tableSeed),
            s2c: shuffleTable(legacy ? S2C_PACKETS.slice(0, LEGACY_S2C_COUNT) : S2C_PACKETS, (tableSeed ^ TABLE_S2C_XOR) >>> 0)
        };
    }

    function hmacTag(key, data) {
        return hmacSha256(key, data).subarray(0, MAC_LENGTH);
    }

    function readU32LE(bytes, offset) {
        return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
    }

    function xorMask(bytes, seed) {
        let s = seed >>> 0;
        if (s === 0) s = MASK_ZERO_SEED;
        for (let i = 0; i < bytes.length; i += 4) {
            s ^= s << 13; s >>>= 0;
            s ^= s >>> 17;
            s ^= s << 5; s >>>= 0;
            bytes[i] ^= s & 255;
            if (i + 1 < bytes.length) bytes[i + 1] ^= (s >>> 8) & 255;
            if (i + 2 < bytes.length) bytes[i + 2] ^= (s >>> 16) & 255;
            if (i + 3 < bytes.length) bytes[i + 3] ^= (s >>> 24) & 255;
        }
        return bytes;
    }

    function deriveMaskSeeds(key) {
        return {
            c2s: (readU32LE(key, 0) ^ MASK_C2S_XOR) >>> 0,
            s2c: (readU32LE(key, 4) ^ MASK_S2C_XOR) >>> 0
        };
    }

    const s2cMaskSeed = (base, counter) => (base ^ Math.imul(counter, MASK_COUNTER_MULT)) >>> 0;
    const c2sMaskSeed = (base, tag) => (base ^ readU32LE(tag, 0)) >>> 0;

    function hexToBytes(hex) {
        const out = new Uint8Array(hex.length / 2);
        for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
        return out;
    }

    // Is this msgpack frame the plaintext io-init handshake?  ["io-init", [...]]
    function isHandshake(frame) {
        try {
            const msg = msgpack.decode(frame);
            return Array.isArray(msg) && msg[0] === "io-init" ? msg : null;
        } catch {
            return null;
        }
    }

    /*
     * One live connection. Built from the io-init payload + the per-deploy module.
     *   payload = [socketId, seed, keyHex, mode, pinned]
     */
    class ClientSession {
        constructor(payload, mod) {
            const [socketId, seed, keyHex, mode, pinned] = payload;
            this.socketId = socketId;
            this.seed = seed >>> 0;
            this.mode = mode;
            this.pinned = Boolean(pinned);
            this.keyed = mode === MODE_KEYED;

            const rawKey = hexToBytes(keyHex);
            if (this.pinned) {
                if (!mod || typeof mod.mixKey !== "function") throw new Error("pinned connection needs the moomoo-protocol module (mixKey)");
                this.key = mod.mixKey(rawKey, this.seed);
                this.tables = buildTables(this.seed, mod.BUILD_SALT);
                this.maskSeeds = deriveMaskSeeds(this.key);
            } else {
                this.key = rawKey;
                this.tables = buildTables(this.seed, null);
                this.maskSeeds = null;
            }

            this.received = 0; // s2c frames seen after io-init
            this.lastSeq = 0;  // c2s seq we have assigned
        }

        // Decode one incoming server->client frame. Consumes the s2c counter.
        decodeS2C(frame) {
            const bytes = new Uint8Array(frame.length);
            bytes.set(frame);
            if (this.maskSeeds) xorMask(bytes, s2cMaskSeed(this.maskSeeds.s2c, ++this.received));
            const msg = msgpack.decode(bytes);
            if (!Array.isArray(msg)) throw new Error("s2c frame is not an array");
            const name = typeof msg[0] === "number" ? this.tables.s2c.dec[msg[0]] : msg[0];
            return { id: msg[0], name, args: Array.isArray(msg[1]) ? msg[1] : [] };
        }

        // Encode one outgoing client->server frame. `seq` is the sequence number
        // to stamp; when omitted we auto-assign the next one.
        encodeC2S(name, args, seq) {
            const id = this.tables.c2s.enc[name];
            if (id === undefined) throw new Error('packet "' + name + '" is not in the c2s table');
            if (seq === undefined) seq = ++this.lastSeq; else this.lastSeq = seq;
            const body = msgpack.encode([id, args, seq]);
            const tag = hmacTag(this.key, body);
            const masked = new Uint8Array(body.length);
            masked.set(body);
            if (this.maskSeeds) xorMask(masked, c2sMaskSeed(this.maskSeeds.c2s, tag));
            const out = new Uint8Array(MAC_LENGTH + masked.length);
            out.set(tag, 0);
            out.set(masked, MAC_LENGTH);
            return out;
        }

        // Inspect what the client encoded (does NOT touch the seq counter).
        decodeC2S(frame) {
            const bytes = new Uint8Array(frame.length);
            bytes.set(frame);
            if (bytes.length <= MAC_LENGTH) throw new Error("short c2s frame");
            const tag = bytes.subarray(0, MAC_LENGTH);
            const body = bytes.subarray(MAC_LENGTH);
            if (this.maskSeeds) xorMask(body, c2sMaskSeed(this.maskSeeds.c2s, tag));
            const msg = msgpack.decode(body);
            if (!Array.isArray(msg) || msg.length !== 3) throw new Error("malformed c2s body");
            const name = typeof msg[0] === "number" ? this.tables.c2s.dec[msg[0]] : msg[0];
            return { id: msg[0], name, args: Array.isArray(msg[1]) ? msg[1] : [], seq: msg[2] };
        }
    }

    return {
        MODE_KEYED, MAC_LENGTH,
        C2S_PACKETS, S2C_PACKETS,
        mulberry32, shuffleTable, buildTables,
        hmacTag, xorMask, deriveMaskSeeds, s2cMaskSeed, c2sMaskSeed,
        readU32LE, hexToBytes, isHandshake,
        ClientSession
    };
});
