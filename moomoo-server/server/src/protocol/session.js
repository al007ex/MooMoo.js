// PROTOCOL SESSION
// One instance per WebSocket. Implements the server half of the client's
// K.connect / K.send transport:
//
//   handshake   server -> client  ["io-init", [socketId, seed, keyHex, MODE_KEYED, pinned, sealMode]]
//                                 (plain msgpack, the only frame that is neither masked nor keyed)
//   c2s frame   tag(6) || mask(msgpack([packetId, args, seq]))
//               tag  = HMAC-SHA256(sessionKey, msgpackBody)[0..6]
//               mask = xorshift keystream seeded by (mask.c2s ^ u32(tag))
//               seq  = 1, 2, 3 ... (strictly increasing, no gaps, no replays)
//   s2c frame   mask(msgpack([packetId, args])) seeded by (mask.s2c ^ imul(n, 2654435761))
//               where n counts the frames sent after io-init (1, 2, 3 ...)
//
// sessionKey = mixKey(rawKey, seed) for build-pinned clients (the build module's mixer),
// packet ids come from buildTables(seed, BUILD_SALT).
//
// Code seal (sealMode 1 or 2): the client derives seal = sealBytes ^ SHA-256(bundle)[0..16]
// from the page's "moomoo-seal" import and the bundle it is running. With sealMode 2 the
// first 16 bytes of the session key are XORed with it; with either mode the client reports
// bytesHash(seal, seed) in every "T". The server computes the same values from the bundle
// it serves, so a modified bundle (or a replaced guarded function) can't connect in mode 2
// and is reported in mode 1.

import { randomBytes, timingSafeEqual } from "node:crypto";
import msgpack from "msgpack-lite";
import { MODE_KEYED, MAC_LENGTH, SEAL_OFF, SEAL_BIND, FNV_OFFSET } from "./constants.js";
import {
    buildTables, hmacTag, xorMask, deriveMaskSeeds, s2cMaskSeed, c2sMaskSeed, bytesToHex, bytesHash, fnvLedger
} from "./crypto.js";

const { encode, decode } = msgpack;

export const DECODE_ERROR = {
    SHORT_FRAME: "short frame",
    BAD_TAG: "bad tag",
    MALFORMED: "malformed body",
    BAD_SEQUENCE: "bad sequence",
    UNKNOWN_PACKET: "unknown packet id",
    BAD_ARGS: "bad arguments"
};

export class ProtocolSession {

    // seal: { mode, value } where value is the seal this client should end up with
    // (sealBytes ^ digest of the bundle it says it runs), or null when it can't have one.
    constructor(build, socketId, { pinned = true, seal = null } = {}) {
        this.build = build;
        this.socketId = socketId;
        this.pinned = pinned;
        this.seed = randomBytes(4).readUInt32LE(0);
        this.rawKey = new Uint8Array(randomBytes(16));
        this.sealMode = pinned && seal && seal.value ? seal.mode : SEAL_OFF;
        this.key = pinned ? build.mixKey(this.rawKey, this.seed) : this.rawKey;
        if (this.sealMode === SEAL_BIND) {
            this.key = this.key.map((byte, i) => i < seal.value.length ? byte ^ seal.value[i] : byte);
        }
        // What the client reports in "T" when its seal matches.
        this.sealReport = this.sealMode !== SEAL_OFF ? bytesHash(seal.value, this.seed) : null;
        this.tables = buildTables(this.seed, pinned ? build.BUILD_SALT : null);
        this.mask = pinned ? deriveMaskSeeds(this.key) : null;
        this.lastSeq = 0;
        this.sent = 0;
        // Frame ledger (pinned clients only): the running FNV-1a hash of every c2s body,
        // and its value just before the most recent frame — which is what a "T" frame reports.
        this.ledger = pinned ? FNV_OFFSET : 0;
        this.ledgerBefore = this.ledger;
    }

    // ["io-init", [socketId, seed, keyHex, mode, pinned, sealMode]]
    handshakeFrame() {
        return encode(["io-init", [this.socketId, this.seed, bytesToHex(this.rawKey), MODE_KEYED, this.pinned ? 1 : 0, this.sealMode]]);
    }

    canSend(name) {
        return this.tables.s2c.enc[name] !== undefined;
    }

    encode(name, args) {
        const id = this.tables.s2c.enc[name];
        if (id === undefined) {
            throw new Error(`packet "${name}" is not in this session's s2c table`);
        }
        const frame = new Uint8Array(encode([id, args]));
        this.sent++;
        if (this.mask) {
            xorMask(frame, s2cMaskSeed(this.mask.s2c, this.sent));
        }
        return frame;
    }

    decode(data) {
        const bytes = new Uint8Array(data.length);
        bytes.set(data);
        if (bytes.length <= MAC_LENGTH) {
            return { error: DECODE_ERROR.SHORT_FRAME };
        }

        const tag = bytes.subarray(0, MAC_LENGTH);
        const body = bytes.subarray(MAC_LENGTH);
        if (this.mask) {
            xorMask(body, c2sMaskSeed(this.mask.c2s, tag));
        }

        const expected = hmacTag(this.key, body);
        if (!timingSafeEqual(Buffer.from(tag), expected)) {
            return { error: DECODE_ERROR.BAD_TAG };
        }

        let message;
        try {
            message = decode(body);
        } catch {
            return { error: DECODE_ERROR.MALFORMED };
        }
        if (!Array.isArray(message) || message.length !== 3) {
            return { error: DECODE_ERROR.MALFORMED };
        }

        const [id, args, seq] = message;
        if (seq !== this.lastSeq + 1) {
            return { error: DECODE_ERROR.BAD_SEQUENCE, detail: `expected ${this.lastSeq + 1}, got ${seq}` };
        }
        this.lastSeq = seq;

        const name = typeof id === "number" ? this.tables.c2s.dec[id] : undefined;
        if (name === undefined) {
            return { error: DECODE_ERROR.UNKNOWN_PACKET, detail: String(id) };
        }
        if (!Array.isArray(args)) {
            return { error: DECODE_ERROR.BAD_ARGS };
        }
        // Fold this body into the ledger, keeping the value from just before: a "T" frame
        // reports the ledger / seq as they were before itself, so anticheat compares against
        // `ledgerBefore` and `lastSeq - 1`.
        if (this.pinned) {
            this.ledgerBefore = this.ledger;
            this.ledger = fnvLedger(this.ledger, body);
        }
        return { name, args, seq };
    }
}
