// PROTOCOL CRYPTO
// Server-side counterparts of the transport helpers in the official client.
// Every function keeps the exact arithmetic of its client twin (named in brackets)
// so both ends derive identical tables, tags and masks.

import { createHmac } from "node:crypto";
import {
    C2S_PACKETS, S2C_PACKETS, LEGACY_SALT, LEGACY_C2S_COUNT, LEGACY_S2C_COUNT, BASE_C2S_COUNT, BASE_S2C_COUNT,
    TABLE_SIZE, MAC_LENGTH, FNV_OFFSET, FNV_PRIME, FNV_FINAL_MULT,
    TABLE_SALT_MULT, TABLE_S2C_XOR, MASK_C2S_XOR, MASK_S2C_XOR, MASK_COUNTER_MULT, MASK_ZERO_SEED
} from "./constants.js";

// FNV-1a with a seeded offset and a final avalanche. The client uses this one shape for
// packet ids [i0], integrity probes [ch] and the seal report [Dx].
function fnvStep(hash, byte) {
    return Math.imul(hash ^ byte, FNV_PRIME);
}
function fnvFinish(hash) {
    hash ^= hash >>> 15;
    hash = Math.imul(hash, FNV_FINAL_MULT);
    hash ^= hash >>> 12;
    return hash >>> 0;
}

// [ch] hash of a string (low byte of every UTF-16 unit) under a salt.
export function saltedHash(text, salt) {
    let h = (FNV_OFFSET ^ salt) >>> 0;
    for (let i = 0; i < text.length; i++) h = fnvStep(h, text.charCodeAt(i) & 255);
    return fnvFinish(h);
}

// [Dx] hash of a byte array under a seed.
export function bytesHash(bytes, seed) {
    let h = (FNV_OFFSET ^ seed) >>> 0;
    for (let i = 0; i < bytes.length; i++) h = fnvStep(h, bytes[i]);
    return fnvFinish(h);
}

// [Dh] the client's frame "ledger": a rolling FNV-1a hash of every client -> server body
// it sends (no final avalanche), started at FNV_OFFSET. The client reports it, with its
// sequence number, in "T", so the server can confirm it received the exact same frame
// stream (a forged / replayed / dropped frame changes the running hash).
export function fnvLedger(hash, bytes) {
    let h = hash >>> 0;
    for (let i = 0; i < bytes.length; i++) h = Math.imul(h ^ bytes[i], FNV_PRIME);
    return h >>> 0;
}

// [ou] mulberry32 PRNG.
export function mulberry32(seed) {
    return function () {
        seed |= 0;
        seed = seed + 1831565813 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// [gs] Fisher-Yates shuffle of packet names -> numeric ids.
export function shuffleTable(names, seed) {
    const count = names.length;
    const ids = names.map((_, i) => i);
    const rand = mulberry32(seed >>> 0);
    for (let i = count - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        const tmp = ids[i];
        ids[i] = ids[j];
        ids[j] = tmp;
    }
    const enc = {};
    const dec = {};
    for (let i = 0; i < count; i++) {
        enc[names[i]] = ids[i];
        dec[ids[i]] = names[i];
    }
    return { enc, dec };
}

// [i0] names past `base` get ids in [base, TABLE_SIZE): salted hash of the name, then
// linear probing on collisions.
export function extendTable(table, names, base, salt) {
    const span = TABLE_SIZE - base;
    const taken = {};
    for (let i = base; i < names.length; i++) {
        let h = (FNV_OFFSET ^ salt) >>> 0;
        for (let j = 0; j < names[i].length; j++) h = fnvStep(h, names[i].charCodeAt(j) & 255);
        let slot = fnvFinish(h) % span;
        while (taken[slot]) slot = (slot + 1) % span;
        taken[slot] = true;
        table.enc[names[i]] = base + slot;
        table.dec[base + slot] = names[i];
    }
    return table;
}

// [s0] per-connection packet tables. `salt` is BUILD_SALT for pinned connections.
export function buildTables(seed, salt) {
    const legacy = salt == null;
    const tableSeed = (seed ^ Math.imul(legacy ? LEGACY_SALT : salt, TABLE_SALT_MULT)) >>> 0;
    if (legacy) {
        return {
            c2s: shuffleTable(C2S_PACKETS.slice(0, LEGACY_C2S_COUNT), tableSeed),
            s2c: shuffleTable(S2C_PACKETS.slice(0, LEGACY_S2C_COUNT), (tableSeed ^ TABLE_S2C_XOR) >>> 0)
        };
    }
    const s2cSeed = (tableSeed ^ TABLE_S2C_XOR) >>> 0;
    return {
        c2s: extendTable(shuffleTable(C2S_PACKETS.slice(0, BASE_C2S_COUNT), tableSeed), C2S_PACKETS, BASE_C2S_COUNT, tableSeed),
        s2c: extendTable(shuffleTable(S2C_PACKETS.slice(0, BASE_S2C_COUNT), s2cSeed), S2C_PACKETS, BASE_S2C_COUNT, s2cSeed)
    };
}

// [Sd] the code seal both ends compute: seal bytes (from the page's "moomoo-seal" import)
// XOR the first 16 bytes of SHA-256(bundle). The client also XORs 165 into every byte
// when one of its guarded functions no longer matches the bundle's source.
export function sealValue(sealBytes, bundleDigest) {
    const out = new Uint8Array(sealBytes.length);
    for (let i = 0; i < out.length; i++) out[i] = sealBytes[i] ^ bundleDigest[i];
    return out;
}

// [su] + [ru] truncated HMAC-SHA256 tag. (The client ships its own SHA-256 [za];
// node:crypto produces byte-identical output.)
export function hmacTag(key, data) {
    return createHmac("sha256", key).update(data).digest().subarray(0, MAC_LENGTH);
}

// [Kc] little-endian uint32 read.
export function readU32LE(bytes, offset) {
    return (bytes[offset] | bytes[offset + 1] << 8 | bytes[offset + 2] << 16 | bytes[offset + 3] << 24) >>> 0;
}

// [a0] xorshift32 keystream, applied in place.
export function xorMask(bytes, seed) {
    let s = seed >>> 0;
    if (s === 0) s = MASK_ZERO_SEED;
    for (let i = 0; i < bytes.length; i += 4) {
        s ^= s << 13;
        s >>>= 0;
        s ^= s >>> 17;
        s ^= s << 5;
        s >>>= 0;
        bytes[i] ^= s & 255;
        if (i + 1 < bytes.length) bytes[i + 1] ^= s >>> 8 & 255;
        if (i + 2 < bytes.length) bytes[i + 2] ^= s >>> 16 & 255;
        if (i + 3 < bytes.length) bytes[i + 3] ^= s >>> 24 & 255;
    }
    return bytes;
}

// [Rx] mask base seeds derived from the session key.
export function deriveMaskSeeds(key) {
    return {
        c2s: (readU32LE(key, 0) ^ MASK_C2S_XOR) >>> 0,
        s2c: (readU32LE(key, 4) ^ MASK_S2C_XOR) >>> 0
    };
}

// [Ox] seed for the n-th server -> client frame.
export function s2cMaskSeed(base, counter) {
    return (base ^ Math.imul(counter, MASK_COUNTER_MULT)) >>> 0;
}

// [Bx] seed for a client -> server frame (keyed by that frame's tag).
export function c2sMaskSeed(base, tag) {
    return (base ^ readU32LE(tag, 0)) >>> 0;
}

// [wd] hex string -> bytes (the io-init key travels as hex).
export function hexToBytes(hex) {
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
    return out;
}

export function bytesToHex(bytes) {
    return Buffer.from(bytes).toString("hex");
}
