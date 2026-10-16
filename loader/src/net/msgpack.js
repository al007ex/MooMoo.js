/*
 * moomoo.js loader — MessagePack codec
 * ====================================
 * A dependency-free MessagePack encoder/decoder, byte-compatible with the
 * `msgpack-lite` the server uses. The game only needs: nil, bool, int, float64,
 * string, array and map, but the decoder understands every standard format so
 * it never chokes on a frame.
 *
 * Encoding choices match msgpack-lite so round-trips are exact:
 *   - integers use the smallest signed/unsigned format that fits
 *   - non-integer numbers are written as float64 (0xcb)
 *   - strings are UTF-8, arrays are arrays, plain objects are maps
 *   - Uint8Array is written as bin; null/undefined as nil
 *
 * Part of the LOADER (the volatile half). Mods never touch this.
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooMsgpack = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooMsgpack = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const textEncoder = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
    const textDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder() : null;

    function utf8Encode(str) {
        if (textEncoder) return textEncoder.encode(str);
        // Minimal fallback.
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            let c = str.charCodeAt(i);
            if (c < 0x80) bytes.push(c);
            else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
            else if (c >= 0xd800 && c <= 0xdbff) {
                const c2 = str.charCodeAt(++i);
                c = 0x10000 + ((c & 0x3ff) << 10) + (c2 & 0x3ff);
                bytes.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 0x3f), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
            } else bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
        }
        return new Uint8Array(bytes);
    }

    function utf8Decode(bytes) {
        if (textDecoder) return textDecoder.decode(bytes);
        let str = "";
        for (let i = 0; i < bytes.length;) {
            const b = bytes[i++];
            if (b < 0x80) str += String.fromCharCode(b);
            else if (b < 0xe0) str += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i++] & 0x3f));
            else if (b < 0xf0) str += String.fromCharCode(((b & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f));
            else {
                const cp = ((b & 0x07) << 18) | ((bytes[i++] & 0x3f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f);
                const off = cp - 0x10000;
                str += String.fromCharCode(0xd800 + (off >> 10), 0xdc00 + (off & 0x3ff));
            }
        }
        return str;
    }

    // ---- WRITER (growing byte buffer) ----
    class Writer {
        constructor() {
            this.buf = new Uint8Array(64);
            this.len = 0;
        }
        ensure(n) {
            if (this.len + n <= this.buf.length) return;
            let cap = this.buf.length * 2;
            while (cap < this.len + n) cap *= 2;
            const next = new Uint8Array(cap);
            next.set(this.buf.subarray(0, this.len));
            this.buf = next;
        }
        u8(v) { this.ensure(1); this.buf[this.len++] = v & 0xff; }
        u16(v) { this.ensure(2); this.buf[this.len++] = (v >> 8) & 0xff; this.buf[this.len++] = v & 0xff; }
        u32(v) { this.ensure(4); this.buf[this.len++] = (v >>> 24) & 0xff; this.buf[this.len++] = (v >>> 16) & 0xff; this.buf[this.len++] = (v >>> 8) & 0xff; this.buf[this.len++] = v & 0xff; }
        bytes(arr) { this.ensure(arr.length); this.buf.set(arr, this.len); this.len += arr.length; }
        f64(v) {
            this.ensure(8);
            const dv = new DataView(this.buf.buffer, this.len, 8);
            dv.setFloat64(0, v, false);
            this.len += 8;
        }
        result() { return this.buf.slice(0, this.len); }
    }

    function encodeInt(w, n) {
        if (n >= 0) {
            if (n < 0x80) { w.u8(n); return; }                       // positive fixint
            if (n < 0x100) { w.u8(0xcc); w.u8(n); return; }           // uint8
            if (n < 0x10000) { w.u8(0xcd); w.u16(n); return; }        // uint16
            if (n < 0x100000000) { w.u8(0xce); w.u32(n); return; }    // uint32
            // uint64
            w.u8(0xcf);
            const hi = Math.floor(n / 0x100000000);
            w.u32(hi); w.u32(n >>> 0);
            return;
        }
        if (n >= -0x20) { w.u8(0xe0 | (n + 0x20)); return; }          // negative fixint
        if (n >= -0x80) { w.u8(0xd0); w.u8(n & 0xff); return; }       // int8
        if (n >= -0x8000) { w.u8(0xd1); w.u16(n & 0xffff); return; }  // int16
        if (n >= -0x80000000) { w.u8(0xd2); w.u32(n >>> 0); return; } // int32
        // int64
        w.u8(0xd3);
        const hi = Math.floor(n / 0x100000000);
        w.u32(hi >>> 0); w.u32(n >>> 0);
    }

    function encodeValue(w, v) {
        if (v === null || v === undefined) { w.u8(0xc0); return; }
        const t = typeof v;
        if (t === "boolean") { w.u8(v ? 0xc3 : 0xc2); return; }
        if (t === "number") {
            if (Number.isInteger(v)) encodeInt(w, v);
            else { w.u8(0xcb); w.f64(v); }
            return;
        }
        if (t === "string") {
            const bytes = utf8Encode(v);
            const n = bytes.length;
            if (n < 0x20) w.u8(0xa0 | n);
            else if (n < 0x100) { w.u8(0xd9); w.u8(n); }
            else if (n < 0x10000) { w.u8(0xda); w.u16(n); }
            else { w.u8(0xdb); w.u32(n); }
            w.bytes(bytes);
            return;
        }
        if (v instanceof Uint8Array || (typeof ArrayBuffer !== "undefined" && v instanceof ArrayBuffer)) {
            const bytes = v instanceof ArrayBuffer ? new Uint8Array(v) : v;
            const n = bytes.length;
            if (n < 0x100) { w.u8(0xc4); w.u8(n); }
            else if (n < 0x10000) { w.u8(0xc5); w.u16(n); }
            else { w.u8(0xc6); w.u32(n); }
            w.bytes(bytes);
            return;
        }
        if (Array.isArray(v)) {
            const n = v.length;
            if (n < 0x10) w.u8(0x90 | n);
            else if (n < 0x10000) { w.u8(0xdc); w.u16(n); }
            else { w.u8(0xdd); w.u32(n); }
            for (let i = 0; i < n; i++) encodeValue(w, v[i]);
            return;
        }
        if (t === "object") {
            const keys = Object.keys(v);
            const n = keys.length;
            if (n < 0x10) w.u8(0x80 | n);
            else if (n < 0x10000) { w.u8(0xde); w.u16(n); }
            else { w.u8(0xdf); w.u32(n); }
            for (let i = 0; i < n; i++) { encodeValue(w, keys[i]); encodeValue(w, v[keys[i]]); }
            return;
        }
        throw new Error("msgpack: cannot encode value of type " + t);
    }

    function encode(value) {
        const w = new Writer();
        encodeValue(w, value);
        return w.result();
    }

    // ---- READER ----
    class Reader {
        constructor(bytes) {
            this.b = bytes;
            this.pos = 0;
            this.dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        }
        u8() { return this.b[this.pos++]; }
        i8() { return (this.b[this.pos++] << 24) >> 24; }
        u16() { const v = this.dv.getUint16(this.pos, false); this.pos += 2; return v; }
        i16() { const v = this.dv.getInt16(this.pos, false); this.pos += 2; return v; }
        u32() { const v = this.dv.getUint32(this.pos, false); this.pos += 4; return v; }
        i32() { const v = this.dv.getInt32(this.pos, false); this.pos += 4; return v; }
        u64() { const hi = this.u32(), lo = this.u32(); return hi * 0x100000000 + lo; }
        i64() { const hi = this.i32(), lo = this.u32(); return hi * 0x100000000 + lo; }
        f32() { const v = this.dv.getFloat32(this.pos, false); this.pos += 4; return v; }
        f64() { const v = this.dv.getFloat64(this.pos, false); this.pos += 8; return v; }
        str(n) { const s = utf8Decode(this.b.subarray(this.pos, this.pos + n)); this.pos += n; return s; }
        bin(n) { const s = this.b.slice(this.pos, this.pos + n); this.pos += n; return s; }
    }

    function decodeValue(r) {
        const c = r.u8();
        if (c < 0x80) return c;                     // positive fixint
        if (c >= 0xe0) return c - 0x100;            // negative fixint
        if (c >= 0x80 && c <= 0x8f) return readMap(r, c & 0x0f);
        if (c >= 0x90 && c <= 0x9f) return readArray(r, c & 0x0f);
        if (c >= 0xa0 && c <= 0xbf) return r.str(c & 0x1f);
        switch (c) {
            case 0xc0: return null;
            case 0xc2: return false;
            case 0xc3: return true;
            case 0xc4: return r.bin(r.u8());
            case 0xc5: return r.bin(r.u16());
            case 0xc6: return r.bin(r.u32());
            case 0xca: return r.f32();
            case 0xcb: return r.f64();
            case 0xcc: return r.u8();
            case 0xcd: return r.u16();
            case 0xce: return r.u32();
            case 0xcf: return r.u64();
            case 0xd0: return r.i8();
            case 0xd1: return r.i16();
            case 0xd2: return r.i32();
            case 0xd3: return r.i64();
            case 0xd9: return r.str(r.u8());
            case 0xda: return r.str(r.u16());
            case 0xdb: return r.str(r.u32());
            case 0xdc: return readArray(r, r.u16());
            case 0xdd: return readArray(r, r.u32());
            case 0xde: return readMap(r, r.u16());
            case 0xdf: return readMap(r, r.u32());
            default:
                throw new Error("msgpack: unsupported format 0x" + c.toString(16));
        }
    }

    function readArray(r, n) {
        const out = new Array(n);
        for (let i = 0; i < n; i++) out[i] = decodeValue(r);
        return out;
    }

    function readMap(r, n) {
        const out = {};
        for (let i = 0; i < n; i++) {
            const k = decodeValue(r);
            out[k] = decodeValue(r);
        }
        return out;
    }

    function decode(bytes) {
        return decodeValue(new Reader(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)));
    }

    return { encode, decode };
});
