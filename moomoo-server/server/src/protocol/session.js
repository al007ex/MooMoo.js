// PROTOCOL SESSION
// One instance per WebSocket. Implements the server half of the client's
// K.connect / K.send transport:
//
//   handshake   server -> client  ["io-init", [socketId, seed, keyHex, MODE_KEYED, pinned]]
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

import { randomBytes, timingSafeEqual } from "node:crypto";
import msgpack from "msgpack-lite";
import { MODE_KEYED, MAC_LENGTH } from "./constants.js";
import {
    buildTables, hmacTag, xorMask, deriveMaskSeeds, s2cMaskSeed, c2sMaskSeed, bytesToHex
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

    constructor(build, socketId, { pinned = true } = {}) {
        this.build = build;
        this.socketId = socketId;
        this.pinned = pinned;
        this.seed = randomBytes(4).readUInt32LE(0);
        this.rawKey = new Uint8Array(randomBytes(16));
        this.key = pinned ? build.mixKey(this.rawKey, this.seed) : this.rawKey;
        this.tables = buildTables(this.seed, pinned ? build.BUILD_SALT : null);
        this.mask = pinned ? deriveMaskSeeds(this.key) : null;
        this.lastSeq = 0;
        this.sent = 0;
    }

    // ["io-init", [socketId, seed, keyHex, mode, pinned]]
    handshakeFrame() {
        return encode(["io-init", [this.socketId, this.seed, bytesToHex(this.rawKey), MODE_KEYED, this.pinned ? 1 : 0]]);
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
        return { name, args, seq };
    }
}
