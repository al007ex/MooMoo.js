// PROTOCOL CRYPTO
// Server-side counterparts of the transport helpers in the official client.
// Every function keeps the exact arithmetic of its client twin (named in brackets)
// so both ends derive identical tables, tags and masks.

import { createHmac } from "node:crypto";
import {
    C2S_PACKETS, S2C_PACKETS, LEGACY_SALT, LEGACY_C2S_COUNT, LEGACY_S2C_COUNT, MAC_LENGTH,
    TABLE_SALT_MULT, TABLE_S2C_XOR, MASK_C2S_XOR, MASK_S2C_XOR, MASK_COUNTER_MULT, MASK_ZERO_SEED
} from "./constants.js";

// [wf] mulberry32 PRNG.
export function mulberry32(seed) {
    return function () {
        seed |= 0;
        seed = seed + 1831565813 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

// [Vl] Fisher-Yates shuffle of packet names -> numeric ids.
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

// [Ql] per-connection packet tables. `salt` is BUILD_SALT for pinned connections.
export function buildTables(seed, salt) {
    const legacy = salt == null;
    const mixedSalt = legacy ? LEGACY_SALT : salt;
    const tableSeed = (seed ^ Math.imul(mixedSalt, TABLE_SALT_MULT)) >>> 0;
    return {
        c2s: shuffleTable(legacy ? C2S_PACKETS.slice(0, LEGACY_C2S_COUNT) : C2S_PACKETS, tableSeed),
        s2c: shuffleTable(legacy ? S2C_PACKETS.slice(0, LEGACY_S2C_COUNT) : S2C_PACKETS, (tableSeed ^ TABLE_S2C_XOR) >>> 0)
    };
}

// [vf] + [Wf] truncated HMAC-SHA256 tag. (The client ships its own SHA-256 [Ts];
// node:crypto produces byte-identical output.)
export function hmacTag(key, data) {
    return createHmac("sha256", key).update(data).digest().subarray(0, MAC_LENGTH);
}

// [la] little-endian uint32 read.
export function readU32LE(bytes, offset) {
    return (bytes[offset] | bytes[offset + 1] << 8 | bytes[offset + 2] << 16 | bytes[offset + 3] << 24) >>> 0;
}

// [Kl] xorshift32 keystream, applied in place.
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

// [Sf] mask base seeds derived from the session key.
export function deriveMaskSeeds(key) {
    return {
        c2s: (readU32LE(key, 0) ^ MASK_C2S_XOR) >>> 0,
        s2c: (readU32LE(key, 4) ^ MASK_S2C_XOR) >>> 0
    };
}

// [Ef] seed for the n-th server -> client frame.
export function s2cMaskSeed(base, counter) {
    return (base ^ Math.imul(counter, MASK_COUNTER_MULT)) >>> 0;
}

// [Cf] seed for a client -> server frame (keyed by that frame's tag).
export function c2sMaskSeed(base, tag) {
    return (base ^ readU32LE(tag, 0)) >>> 0;
}

// [Mf] hex string -> bytes (the io-init key travels as hex).
export function hexToBytes(hex) {
    const out = new Uint8Array(hex.length / 2);
    for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
    return out;
}

export function bytesToHex(bytes) {
    return Buffer.from(bytes).toString("hex");
}
