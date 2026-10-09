// ==UserScript==
// @name         moomoo.js Loader
// @namespace    moomoo.js
// @version      1.0.0
// @description  moomoo.js mod loader — hooks the game socket and exposes window.MooMoo for mods. Update this file when the server's packets change.
// @author       you
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
//
// EDIT @match to your private server's origin, e.g.  // @match https://play.myserver.io/*
// Host this file somewhere your plugins can @require it (or paste it as its own
// userscript). See extension/README.md.

(function bootstrap(){
  function core(){
  "use strict";
  if (window.__MOOMOO_LOADER__) return;   // a plugin may @require us more than once
  window.__MOOMOO_LOADER__ = "1.0.0";
/* ===== module: vocabulary (shared/vocabulary.js) ===== */
/*
 * moomoo.js — PACKET VOCABULARY  (the stable contract)
 * ====================================================
 * This file is the "language" half of the extension: it names every semantic
 * packet the game has (a health update, a chat message, a spawn, ...) and the
 * shape of its payload. It knows NOTHING about the wire: no packet letters, no
 * crypto, no argument order on the socket.
 *
 * Mods are written against the names in here. Because this file never changes,
 * a mod written today keeps working forever. When the private server changes
 * its wire protocol, only the LOADER's binding (loader/src/binding.js) is
 * updated to keep pointing the same wire packet at the same name below.
 *
 *   wire bytes  --(loader: binding)-->  semantic name + payload  --(mod)-->
 *
 * Universal module: works as an ES import, a CommonJS require, or a plain
 * <script> (attaches window.MooMooVocabulary).
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooVocabulary = value;
    /* eslint-disable no-undef */
    if (typeof globalThis !== "undefined") globalThis.MooMooVocabulary = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    // Helper to describe a parameter: name + type + human description.
    const p = (name, type, desc) => ({ name, type, desc });

    /*
     * INCOMING packets (server -> client). Mods subscribe to these with
     *   on <event>(<params...>) { ... }        // moomoo.js language
     *   MooMoo.on("<event>", handler)           // hand-written JS
     *
     * `normalized: true`  -> the loader hands you tidy named fields; the loader
     *                        insulates you from wire changes. Safe to rely on.
     * `normalized: false`  -> "passthrough": you receive the raw decoded argument
     *                        array as `args`. Full access to every packet, but
     *                        the shape can shift between server builds.
     */
    const EVENTS = {
        setup: {
            summary: "You joined / spawned. Carries YOUR own player slot id (sid).",
            normalized: true,
            params: [p("sid", "number", "your own player slot id")]
        },
        init: {
            summary: "Initial game data sent right after connecting.",
            normalized: false,
            params: [p("data", "any", "raw init payload")]
        },
        disconnect: {
            summary: "The server is dropping you. Carries a reason string.",
            normalized: true,
            params: [p("reason", "string", "why you were disconnected")]
        },
        health: {
            summary: "A player's health changed. Fires for you and for others in view.",
            normalized: true,
            params: [
                p("sid", "number", "whose health changed"),
                p("value", "number", "the new health value")
            ]
        },
        playerAdd: {
            summary: "A player entered your view (or you spawned).",
            normalized: true,
            params: [
                p("data", "array", "raw player data array"),
                p("isYou", "boolean", "true if this player is you")
            ]
        },
        playerRemove: {
            summary: "A player left your view.",
            normalized: true,
            params: [p("sid", "number", "the player that left")]
        },
        playersUpdate: {
            summary: "Per-tick movement + attribute update for everyone in view.",
            normalized: true,
            params: [
                p("positions", "array", "[{sid,x,y,dir}] current positions"),
                p("attributes", "array", "[{sid,buildIndex,weaponIndex,variant,team,isLeader,skin,tail,icon,zIndex}] (only changed)"),
                p("hidden", "array", "sids that are no longer visible")
            ]
        },
        playerValue: {
            summary: "A named value about you changed (points, kills, wood, food, ...).",
            normalized: true,
            params: [
                p("key", "string", "which value, e.g. 'points', 'kills', 'wood'"),
                p("value", "number", "the new value"),
                p("updateView", "boolean", "whether the HUD should flash it")
            ]
        },
        health_regen: { // reserved alias slot; kept for forward-compat, maps to nothing by default
            summary: "(reserved)",
            normalized: false,
            params: [p("args", "array", "raw arguments")],
            hidden: true
        },
        upgrades: {
            summary: "Your available upgrade points / current upgrade age.",
            normalized: true,
            params: [
                p("points", "number", "upgrade points available"),
                p("age", "number", "current upgrade age")
            ]
        },
        inventory: {
            summary: "Your item list or weapon list was replaced.",
            normalized: true,
            params: [
                p("list", "array", "the ids you now own"),
                p("isWeapon", "boolean", "true = weapons list, false = items list")
            ]
        },
        age: {
            summary: "Your XP / age progress.",
            normalized: false,
            params: [p("args", "array", "[xp, maxXp?, age?]")]
        },
        died: {
            summary: "You died. No payload.",
            normalized: true,
            params: []
        },
        chat: {
            summary: "A chat message was said by a player.",
            normalized: true,
            params: [
                p("sid", "number", "who said it"),
                p("message", "string", "the chat text")
            ]
        },
        showText: {
            summary: "Floating world text (damage numbers, gold gained, ...).",
            normalized: true,
            params: [
                p("x", "number", "world x"),
                p("y", "number", "world y"),
                p("value", "number", "the number shown"),
                p("type", "number", "text type/colour hint")
            ]
        },
        mapPing: {
            summary: "A teammate pinged the map.",
            normalized: true,
            params: [p("x", "number", "ping x"), p("y", "number", "ping y")]
        },
        leaderboard: { summary: "Leaderboard refresh.", normalized: false, params: [p("args", "array", "raw arguments; args[0] is flat [sid,name,score,...]")] },
        objectsLoad: { summary: "New world objects entered view.", normalized: false, params: [p("args", "array", "raw arguments; args[0] is flat object data, 8 fields each")] },
        animalsUpdate: { summary: "Animal/AI movement + state update.", normalized: false, params: [p("args", "array", "raw arguments; args[0] is flat animal data")] },
        animalAttack: { summary: "An animal played its attack animation.", normalized: false, params: [p("args", "array", "raw arguments")] },
        gatherAnimation: { summary: "A player played a gather/attack swing.", normalized: false, params: [p("args", "array", "raw arguments")] },
        wiggle: { summary: "An object wiggled (was hit).", normalized: false, params: [p("args", "array", "raw arguments")] },
        turretShoot: { summary: "A turret fired.", normalized: false, params: [p("args", "array", "raw arguments")] },
        objectKilled: { summary: "One object was destroyed.", normalized: false, params: [p("args", "array", "raw arguments")] },
        objectsKilled: { summary: "Several objects were destroyed.", normalized: false, params: [p("args", "array", "raw arguments")] },
        itemCount: { summary: "Placed-item count changed (e.g. windmills).", normalized: false, params: [p("args", "array", "raw arguments")] },
        projectileAdd: { summary: "A projectile spawned.", normalized: false, params: [p("args", "array", "raw arguments")] },
        projectileRemove: { summary: "A projectile despawned.", normalized: false, params: [p("args", "array", "raw arguments")] },
        shutdownNotice: { summary: "Server shutdown countdown.", normalized: false, params: [p("args", "array", "raw arguments")] },
        tribeAdd: { summary: "A tribe was created.", normalized: false, params: [p("args", "array", "raw arguments")] },
        tribeDelete: { summary: "A tribe was deleted.", normalized: false, params: [p("args", "array", "raw arguments")] },
        tribeJoinRequest: { summary: "Someone asked to join your tribe.", normalized: false, params: [p("args", "array", "raw arguments")] },
        tribeSet: { summary: "Your tribe membership changed.", normalized: false, params: [p("args", "array", "raw arguments")] },
        tribeMembers: { summary: "Your tribe's member list.", normalized: false, params: [p("args", "array", "raw arguments")] },
        storeUpdate: { summary: "A hat/accessory was bought or equipped.", normalized: false, params: [p("args", "array", "raw arguments")] },
        minimap: { summary: "Minimap dots for your tribe.", normalized: false, params: [p("args", "array", "raw arguments")] },
        pong: { summary: "Reply to your ping (latency probe).", normalized: true, params: [] },
        effect: { summary: "A visual effect was triggered.", normalized: false, params: [p("args", "array", "raw arguments")] },
        stats: { summary: "Live stats card for a watched player.", normalized: false, params: [p("args", "array", "raw arguments")] }
    };

    /*
     * OUTGOING packets (client -> server). Mods trigger these with
     *   send <action>(<params...>)              // moomoo.js language
     *   MooMoo.send.<action>(<params...>)        // hand-written JS
     */
    const ACTIONS = {
        spawn: {
            summary: "Spawn into the game.",
            params: [
                p("name", "string", "display name"),
                p("moofoll", "boolean", "the pre-game 'moofoll' toggle"),
                p("skin", "number", "chosen skin colour index")
            ]
        },
        aim: { summary: "Face a direction (radians).", params: [p("dir", "number", "aim angle in radians")] },
        move: { summary: "Move in a direction (radians), or null to stop.", params: [p("dir", "number", "move angle in radians, or null")] },
        stopMove: { summary: "Stop moving (window-blur style reset).", params: [] },
        mouse: {
            summary: "Press/release the attack button, optionally with a build direction.",
            params: [p("down", "boolean", "is the button held"), p("dir", "number", "build/aim direction or null")]
        },
        selectItem: {
            summary: "Select a weapon or buildable item.",
            params: [p("index", "number", "item/weapon id"), p("isWeapon", "boolean", "true = weapon")]
        },
        upgrade: { summary: "Choose an upgrade.", params: [p("index", "number", "upgrade index")] },
        toggle: { summary: "Toggle 0 = lock rotation, 1 = auto gather.", params: [p("which", "number", "0 or 1")] },
        createTribe: { summary: "Create a tribe.", params: [p("name", "string", "tribe name")] },
        leaveTribe: { summary: "Leave your tribe.", params: [] },
        joinTribe: { summary: "Ask to join a tribe.", params: [p("name", "string", "tribe name")] },
        answerJoin: { summary: "Accept/deny a join request.", params: [p("sid", "number", "requester"), p("accept", "boolean", "accept?")] },
        kickMember: { summary: "Kick a tribe member.", params: [p("sid", "number", "member sid")] },
        store: {
            summary: "Buy (0) or equip (1) a hat/accessory.",
            params: [p("action", "number", "0 buy, 1 equip"), p("id", "number", "hat/accessory id"), p("isAccessory", "boolean", "true = accessory/tail")]
        },
        chat: { summary: "Say something in chat.", params: [p("message", "string", "chat text")] },
        pingMap: { summary: "Ping the map for your tribe.", params: [] },
        ping: { summary: "Latency probe; replies with `pong`.", params: [] },
        watchStats: { summary: "Watch another player's live stats card (-1 = none).", params: [p("sid", "number", "player to watch, or -1")] },
        report: { summary: "Report / staff action (advanced).", params: [p("args", "array", "raw report arguments")], advanced: true },
        admin: { summary: "Admin command (requires admin role).", params: [p("args", "array", "raw admin arguments")], advanced: true }
    };

    return {
        version: 1,
        events: EVENTS,
        actions: ACTIONS,
        // Convenience lists used by the compiler + website palette.
        eventNames: Object.keys(EVENTS).filter((k) => !EVENTS[k].hidden),
        actionNames: Object.keys(ACTIONS),
        isEvent: (name) => Object.prototype.hasOwnProperty.call(EVENTS, name) && !EVENTS[name].hidden,
        isAction: (name) => Object.prototype.hasOwnProperty.call(ACTIONS, name)
    };
});


/* ===== module: msgpack (loader/src/msgpack.js) ===== */
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


/* ===== module: sha256 (loader/src/sha256.js) ===== */
/*
 * moomoo.js loader — synchronous SHA-256 + HMAC-SHA256
 * ====================================================
 * The client->server transport prepends a truncated HMAC-SHA256 tag to every
 * frame. Decoding/re-encoding a frame must happen synchronously inside the
 * WebSocket send hook, so we cannot use the async SubtleCrypto API — we ship a
 * small, standard SHA-256 here. Output is byte-identical to Node's
 * crypto.createHmac("sha256", key), which is what the server uses.
 *
 * Part of the LOADER (the volatile half).
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooSha256 = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooSha256 = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const K = new Uint32Array([
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ]);

    function sha256(msg) {
        const h = new Uint32Array([
            0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
        ]);

        const len = msg.length;
        const bitLen = len * 8;
        // Padded length: message + 0x80 + zeros + 8-byte length, multiple of 64.
        const total = ((len + 8) >> 6 << 6) + 64;
        const data = new Uint8Array(total);
        data.set(msg);
        data[len] = 0x80;
        // 64-bit big-endian bit length in the last 8 bytes.
        const dv = new DataView(data.buffer);
        dv.setUint32(total - 4, bitLen >>> 0, false);
        dv.setUint32(total - 8, Math.floor(bitLen / 0x100000000) >>> 0, false);

        const w = new Uint32Array(64);
        for (let off = 0; off < total; off += 64) {
            for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4, false);
            for (let i = 16; i < 64; i++) {
                const a = w[i - 15], b = w[i - 2];
                const s0 = ((a >>> 7) | (a << 25)) ^ ((a >>> 18) | (a << 14)) ^ (a >>> 3);
                const s1 = ((b >>> 17) | (b << 15)) ^ ((b >>> 19) | (b << 13)) ^ (b >>> 10);
                w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
            }
            let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
            for (let i = 0; i < 64; i++) {
                const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
                const ch = (e & f) ^ (~e & g);
                const t1 = (hh + S1 + ch + K[i] + w[i]) >>> 0;
                const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
                const maj = (a & b) ^ (a & c) ^ (b & c);
                const t2 = (S0 + maj) >>> 0;
                hh = g; g = f; f = e;
                e = (d + t1) >>> 0;
                d = c; c = b; b = a;
                a = (t1 + t2) >>> 0;
            }
            h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + b) >>> 0; h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0;
            h[4] = (h[4] + e) >>> 0; h[5] = (h[5] + f) >>> 0; h[6] = (h[6] + g) >>> 0; h[7] = (h[7] + hh) >>> 0;
        }

        const out = new Uint8Array(32);
        const odv = new DataView(out.buffer);
        for (let i = 0; i < 8; i++) odv.setUint32(i * 4, h[i], false);
        return out;
    }

    const BLOCK = 64;

    function hmacSha256(key, data) {
        let k = key instanceof Uint8Array ? key : new Uint8Array(key);
        if (k.length > BLOCK) k = sha256(k);
        const ipad = new Uint8Array(BLOCK + data.length);
        const opadKey = new Uint8Array(BLOCK);
        for (let i = 0; i < BLOCK; i++) {
            const kb = i < k.length ? k[i] : 0;
            ipad[i] = kb ^ 0x36;
            opadKey[i] = kb ^ 0x5c;
        }
        ipad.set(data, BLOCK);
        const inner = sha256(ipad);
        const opad = new Uint8Array(BLOCK + 32);
        opad.set(opadKey);
        opad.set(inner, BLOCK);
        return sha256(opad);
    }

    return { sha256, hmacSha256 };
});


/* ===== module: protocol (loader/src/protocol.js) ===== */
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


/* ===== module: binding (loader/src/binding.js) ===== */
/*
 * moomoo.js loader — BINDING  (the part you update when the server changes)
 * =========================================================================
 * This is the ONLY place that knows which wire packet letter means what. It
 * translates between raw frames and the stable vocabulary that mods speak:
 *
 *   incoming[<wire>] = { event, parse(args) -> payload }
 *   outgoing[<action>] = { wire, build(payload) -> args }
 *
 * When the private server renames a packet, reorders its arguments, or adds a
 * new one, you edit THIS file (and bump the loader). Every mod ever written
 * keeps working, because the vocabulary names on the left never move.
 *
 * Part of the LOADER (the volatile half).
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooBinding = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooBinding = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const bool = (v) => (v ? 1 : 0);
    const passthrough = (event) => ({ event, parse: (args) => ({ args }) });

    // Parse the modernised "a" (playersUpdate): three arrays.
    function parsePlayersUpdate(args) {
        const positions = [];
        const pos = args[0] || [];
        for (let i = 0; i + 3 < pos.length; i += 4) {
            positions.push({ sid: pos[i], x: pos[i + 1], y: pos[i + 2], dir: pos[i + 3] / 100 });
        }
        const attributes = [];
        const at = args[1] || [];
        for (let i = 0; i + 9 < at.length; i += 10) {
            attributes.push({
                sid: at[i], buildIndex: at[i + 1], weaponIndex: at[i + 2], variant: at[i + 3],
                team: at[i + 4], isLeader: !!at[i + 5], skin: at[i + 6], tail: at[i + 7],
                icon: at[i + 8], zIndex: at[i + 9]
            });
        }
        return { positions, attributes, hidden: args[2] || [] };
    }

    // ---- INCOMING: wire letter -> semantic event + payload parser ----
    const incoming = {
        A: passthrough("init"),
        B: { event: "disconnect", parse: (a) => ({ reason: a[0] }) },
        C: { event: "setup", parse: (a) => ({ sid: a[0] }) },
        D: { event: "playerAdd", parse: (a) => ({ data: a[0], isYou: !!a[1] }) },
        E: { event: "playerRemove", parse: (a) => ({ sid: a[0] }) },
        a: { event: "playersUpdate", parse: parsePlayersUpdate },
        G: passthrough("leaderboard"),
        H: passthrough("objectsLoad"),
        I: passthrough("animalsUpdate"),
        J: passthrough("animalAttack"),
        K: passthrough("gatherAnimation"),
        L: passthrough("wiggle"),
        M: passthrough("turretShoot"),
        N: { event: "playerValue", parse: (a) => ({ key: a[0], value: a[1], updateView: !!a[2] }) },
        O: { event: "health", parse: (a) => ({ sid: a[0], value: a[1] }) },
        P: { event: "died", parse: () => ({}) },
        Q: passthrough("objectKilled"),
        R: passthrough("objectsKilled"),
        S: passthrough("itemCount"),
        T: passthrough("age"),
        U: { event: "upgrades", parse: (a) => ({ points: a[0], age: a[1] }) },
        V: { event: "inventory", parse: (a) => ({ list: a[0], isWeapon: !!a[1] }) },
        X: passthrough("projectileAdd"),
        Y: passthrough("projectileRemove"),
        Z: passthrough("shutdownNotice"),
        g: passthrough("tribeAdd"),
        1: passthrough("tribeDelete"),
        2: passthrough("tribeJoinRequest"),
        3: passthrough("tribeSet"),
        4: passthrough("tribeMembers"),
        5: passthrough("storeUpdate"),
        6: { event: "chat", parse: (a) => ({ sid: a[0], message: a[1] }) },
        7: passthrough("minimap"),
        8: { event: "showText", parse: (a) => ({ x: a[0], y: a[1], value: a[2], type: a[3] }) },
        9: { event: "mapPing", parse: (a) => ({ x: a[0], y: a[1] }) },
        0: { event: "pong", parse: () => ({}) },
        W: passthrough("effect"),
        F: passthrough("stats")
    };

    // ---- OUTGOING: semantic action -> wire letter + argument builder ----
    const outgoing = {
        spawn: { wire: "M", build: (d) => [{ name: d.name == null ? "" : String(d.name), moofoll: d.moofoll ? 1 : 0, skin: d.skin | 0 }] },
        aim: { wire: "D", build: (d) => [d.dir] },
        move: { wire: "9", build: (d) => [d.dir === undefined ? null : d.dir] },
        stopMove: { wire: "e", build: () => [] },
        mouse: { wire: "F", build: (d) => [bool(d.down), d.dir === undefined ? null : d.dir] },
        selectItem: { wire: "z", build: (d) => [d.index, bool(d.isWeapon)] },
        upgrade: { wire: "H", build: (d) => [d.index] },
        toggle: { wire: "K", build: (d) => [d.which] },
        createTribe: { wire: "L", build: (d) => [d.name] },
        leaveTribe: { wire: "N", build: () => [] },
        joinTribe: { wire: "b", build: (d) => [d.name] },
        answerJoin: { wire: "P", build: (d) => [d.sid, bool(d.accept)] },
        kickMember: { wire: "Q", build: (d) => [d.sid] },
        store: { wire: "c", build: (d) => [d.action, d.id, bool(d.isAccessory)] },
        chat: { wire: "6", build: (d) => [d.message == null ? "" : String(d.message)] },
        pingMap: { wire: "S", build: () => [] },
        ping: { wire: "0", build: () => [] },
        watchStats: { wire: "V", build: (d) => [d.sid] },
        report: { wire: "R", build: (d) => d.args || [] },
        admin: { wire: "A", build: (d) => d.args || [] }
    };

    return {
        version: 1,
        incoming,
        outgoing,
        // Used by the anti-cheat bypass: the outgoing packet that carries the
        // anti-tamper telemetry (flags bitfield + untrusted-event count).
        telemetry: {
            wire: "T",
            // Given the decoded telemetry args, return a clean version.
            //   flags: clear every tamper bit (loader hooking is expected here).
            //   untrusted: clamp to 0.
            scrub: (args) => [0, 0]
        }
    };
});


/* ===== module: runtime (loader/src/runtime.js) ===== */
/*
 * moomoo.js loader — RUNTIME  (the stable API mods speak to)
 * ==========================================================
 * This is the "executor" surface: window.MooMoo. It is the half that NEVER
 * changes. It knows the vocabulary of semantic packets but nothing about the
 * wire. The loader feeds it decoded events and it:
 *   - tracks a tidy game state (self, players)
 *   - lets mods subscribe:   MooMoo.on("health", ({sid, value}) => ...)
 *   - lets mods act:         MooMoo.send.chat("gg")
 *   - lets mods run on join:  MooMoo.onReady(() => ...)
 *
 * Mods only ever see this object. Compiled moomoo.js plugins target it too.
 */
(function (root, factory) {
    const vocab = (typeof require === "function") ? require("../../shared/vocabulary.js") : root.MooMooVocabulary;
    const value = factory(vocab);
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooRuntime = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooRuntime = value;
})(typeof self !== "undefined" ? self : this, function (vocab) {
    "use strict";

    function createRuntime(options) {
        const opts = options || {};
        // The loader supplies this sink to actually put packets on the wire.
        const sink = opts.sink || { sendAction() {}, sendRaw() {} };
        const logPrefix = opts.logPrefix || "%c[moomoo.js]";
        const logStyle = opts.logStyle || "color:#7cc;font-weight:bold";

        const listeners = new Map();   // event -> Set<handler>
        const readyCbs = [];
        let ready = false;

        // ---- game state ----
        const players = new Map();     // sid -> player object
        const self = { sid: -1, alive: false, health: 0, x: 0, y: 0, dir: 0 };

        function playerFor(sid) {
            let pl = players.get(sid);
            if (!pl) { pl = { sid }; players.set(sid, pl); }
            return pl;
        }

        // Keep the convenience state in sync with incoming events. This is best
        // effort and additive: it never blocks a mod's own handler.
        function updateState(event, payload) {
            switch (event) {
                case "setup":
                    self.sid = payload.sid;
                    self.alive = true;
                    playerFor(payload.sid);
                    break;
                case "health": {
                    const pl = playerFor(payload.sid);
                    pl.health = payload.value;
                    if (payload.sid === self.sid) self.health = payload.value;
                    break;
                }
                case "playerAdd":
                    if (payload.isYou && Array.isArray(payload.data)) self.alive = true;
                    break;
                case "playerRemove":
                    players.delete(payload.sid);
                    break;
                case "playersUpdate":
                    for (const pos of payload.positions) {
                        const pl = playerFor(pos.sid);
                        pl.x = pos.x; pl.y = pos.y; pl.dir = pos.dir; pl.visible = true;
                        if (pos.sid === self.sid) { self.x = pos.x; self.y = pos.y; self.dir = pos.dir; }
                    }
                    for (const sid of payload.hidden) {
                        const pl = players.get(sid);
                        if (pl) pl.visible = false;
                    }
                    break;
                case "playerValue":
                    // points, kills, wood, food, stone, gold, ...
                    self[payload.key] = payload.value;
                    break;
                case "died":
                    self.alive = false;
                    break;
                default:
                    break;
            }
        }

        // ---- event plumbing ----
        function on(event, handler) {
            if (!vocab.isEvent(event)) console.warn(logPrefix + " unknown event: " + event, logStyle);
            let set = listeners.get(event);
            if (!set) { set = new Set(); listeners.set(event, set); }
            set.add(handler);
            return () => off(event, handler);
        }
        function off(event, handler) {
            const set = listeners.get(event);
            if (set) set.delete(handler);
        }
        function once(event, handler) {
            const wrap = (payload) => { off(event, wrap); handler(payload); };
            return on(event, wrap);
        }

        // Called by the loader for every decoded incoming packet.
        function _dispatch(event, payload) {
            updateState(event, payload);
            const set = listeners.get(event);
            if (set) {
                for (const h of Array.from(set)) {
                    try { h(payload); }
                    catch (e) { console.error(logPrefix + " handler for '" + event + "' threw", logStyle, e); }
                }
            }
            const star = listeners.get("*");
            if (star) for (const h of Array.from(star)) { try { h(event, payload); } catch (e) { /* ignore */ } }
        }

        function _setReady(value) {
            if (ready) return;
            ready = value !== false;
            if (!ready) return;
            while (readyCbs.length) {
                const cb = readyCbs.shift();
                try { cb(); } catch (e) { console.error(logPrefix + " onReady callback threw", logStyle, e); }
            }
        }

        function onReady(cb) {
            if (ready) { try { cb(); } catch (e) { console.error(e); } }
            else readyCbs.push(cb);
        }

        // Called by the loader when a brand-new connection is adopted, so stale
        // players from a previous life don't linger. Keeps the same `self` and
        // `players` objects alive (mods may hold references to them).
        function _reset() {
            players.clear();
            self.sid = -1; self.alive = false; self.health = 0; self.x = 0; self.y = 0; self.dir = 0;
        }

        // ---- outgoing: build send.<action>(...) from the vocabulary ----
        const send = {};
        for (const action of vocab.actionNames) {
            const spec = vocab.actions[action];
            const pnames = spec.params.map((x) => x.name);
            send[action] = function () {
                const a = arguments;
                let payload;
                // Accept either positional args or a single {named} object.
                if (a.length === 1 && a[0] && typeof a[0] === "object" && !Array.isArray(a[0]) &&
                    pnames.some((n) => n in a[0])) {
                    payload = a[0];
                } else {
                    payload = {};
                    for (let i = 0; i < pnames.length; i++) payload[pnames[i]] = a[i];
                }
                return sink.sendAction(action, payload);
            };
        }
        // Escape hatch: send a raw wire packet by letter (advanced / debugging).
        send.raw = (wire, args) => sink.sendRaw(wire, args || []);

        // ---- MOD REGISTRY (enable/disable at runtime + per-mod settings) ----
        const mods = new Map();          // id -> record
        const modListeners = new Set();  // fn(getMods())
        const STORE_PREFIX = "moomoojs:mod:";
        const mem = {};                  // fallback store when localStorage is unavailable

        function loadPersist(id) {
            try { if (typeof localStorage !== "undefined") { const v = localStorage.getItem(STORE_PREFIX + id); return v ? JSON.parse(v) : {}; } } catch (e) { /* ignore */ }
            return mem[id] || {};
        }
        function savePersist(id, data) {
            mem[id] = data;
            try { if (typeof localStorage !== "undefined") localStorage.setItem(STORE_PREFIX + id, JSON.stringify(data)); } catch (e) { /* ignore */ }
        }
        const slug = (s) => String(s || "mod").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "mod";
        const titleCase = (s) => String(s).replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

        function normalizeSetting(s) {
            const type = s.type || (typeof s.default === "boolean" ? "boolean" : typeof s.default === "number" ? "number" : s.options ? "select" : "string");
            return {
                key: s.key, type,
                default: s.default !== undefined ? s.default : (type === "boolean" ? false : type === "number" ? 0 : ""),
                label: s.label || titleCase(s.key),
                options: s.options || null,
                min: s.min, max: s.max, step: s.step
            };
        }

        function emitModsChanged() {
            const list = getMods();
            for (const fn of Array.from(modListeners)) { try { fn(list); } catch (e) { /* ignore */ } }
        }

        function buildCtx(rec) {
            const active = { unsubs: [], timers: [], cleanups: [] };
            const settings = {};
            for (const s of rec.schema) Object.defineProperty(settings, s.key, { get: () => rec.values[s.key], enumerable: true });
            rec._active = active;
            return {
                mod: { id: rec.id, name: rec.name, version: rec.version },
                settings,
                self, players,
                player: (sid) => players.get(sid),
                send,
                on: (ev, h) => { const un = on(ev, h); active.unsubs.push(un); return un; },
                once: (ev, h) => { const un = once(ev, h); active.unsubs.push(un); return un; },
                every: (ms, fn) => { const t = setInterval(fn, ms); active.timers.push(t); return t; },
                onCleanup: (fn) => { active.cleanups.push(fn); },
                log: function () { console.log(logPrefix + " " + rec.name, logStyle, ...arguments); }
            };
        }

        function teardown(rec) {
            const a = rec._active;
            if (!a) return;
            for (const un of a.unsubs) { try { un(); } catch (e) { /* ignore */ } }
            for (const t of a.timers) { try { clearInterval(t); } catch (e) { /* ignore */ } }
            for (const c of a.cleanups) { try { c(); } catch (e) { /* ignore */ } }
            rec._active = null;
        }

        function runSetup(rec) {
            const ctx = buildCtx(rec);
            try {
                const cleanup = rec.setup(ctx);
                if (typeof cleanup === "function") rec._active.cleanups.push(cleanup);
                return true;
            } catch (e) {
                console.error(logPrefix + " mod '" + rec.id + "' setup threw", logStyle, e);
                teardown(rec);
                return false;
            }
        }

        function register(meta, setup) {
            meta = meta || {};
            const id = meta.id || slug(meta.name);
            if (mods.has(id)) { console.warn(logPrefix + " mod already registered: " + id, logStyle); return mods.get(id); }
            const schema = (meta.settings || []).map(normalizeSetting);
            const persisted = loadPersist(id);
            const values = {};
            for (const s of schema) values[s.key] = (persisted.settings && s.key in persisted.settings) ? persisted.settings[s.key] : s.default;
            const rec = {
                id, name: meta.name || id, version: meta.version || "1.0.0",
                description: meta.description || "", schema, setup, values,
                enabled: false, _active: null
            };
            mods.set(id, rec);
            const startEnabled = persisted.enabled !== undefined ? persisted.enabled : (meta.defaultEnabled !== false);
            if (startEnabled && runSetup(rec)) rec.enabled = true;
            savePersist(id, { enabled: rec.enabled, settings: rec.values });
            emitModsChanged();
            return rec;
        }

        function enable(id) {
            const rec = mods.get(id);
            if (!rec || rec.enabled) return;
            if (runSetup(rec)) { rec.enabled = true; savePersist(id, { enabled: true, settings: rec.values }); emitModsChanged(); }
        }
        function disable(id) {
            const rec = mods.get(id);
            if (!rec || !rec.enabled) return;
            teardown(rec);
            rec.enabled = false;
            savePersist(id, { enabled: false, settings: rec.values });
            emitModsChanged();
        }
        function setModEnabled(id, on_) { on_ ? enable(id) : disable(id); }

        function setSetting(id, key, value) {
            const rec = mods.get(id);
            if (!rec) return;
            rec.values[key] = value;
            savePersist(id, { enabled: rec.enabled, settings: rec.values });
            if (rec.enabled) { teardown(rec); runSetup(rec); } // re-apply with the new value
            emitModsChanged();
        }

        function getMods() {
            return Array.from(mods.values()).map((rec) => ({
                id: rec.id, name: rec.name, version: rec.version, description: rec.description,
                enabled: rec.enabled, hasSettings: rec.schema.length > 0,
                settings: rec.schema.map((s) => ({ key: s.key, type: s.type, label: s.label, options: s.options, min: s.min, max: s.max, step: s.step, value: rec.values[s.key] }))
            }));
        }
        function onModsChanged(cb) { modListeners.add(cb); return () => modListeners.delete(cb); }

        // Tear down and forget every mod (used by the playground preview to
        // re-register a freshly compiled mod without an "already registered" clash).
        function _clearMods() {
            for (const rec of mods.values()) teardown(rec);
            mods.clear();
            emitModsChanged();
        }

        function log() {
            const args = Array.prototype.slice.call(arguments);
            console.log(logPrefix, logStyle, ...args);
        }

        const MooMoo = {
            version: opts.version || "0.0.0",
            vocabulary: vocab,
            loader: opts.loaderInfo || {},
            // state
            state: { self, players },
            get self() { return self; },
            get players() { return players; },
            player: (sid) => players.get(sid),
            isReady: () => ready,
            // events
            on, off, once, onReady,
            // actions
            send,
            // mods (managed units with enable/disable + settings)
            register, enable, disable, setModEnabled, setSetting, getMods, onModsChanged,
            isModEnabled: (id) => { const r = mods.get(id); return !!(r && r.enabled); },
            // logging
            log,
            // internal hooks used by the loader (underscore-prefixed)
            _dispatch, _setReady, _reset, _clearMods
        };
        return MooMoo;
    }

    return { createRuntime };
});


/* ===== module: anticheat (loader/src/anticheat.js) ===== */
/*
 * moomoo.js loader — ANTI-CHEAT BYPASS  (undetectable WebSocket hook)
 * ===================================================================
 * FOR USE ON YOUR OWN PRIVATE SERVER / EDUCATIONAL USE ONLY.
 *
 * The server's anti-tamper (see server/src/anticheat) relies on the official
 * client reporting a telemetry packet "T" = [flags, untrustedEvents]. The
 * SOCKET_HOOKED bit (value 2) is set by this exact client check:
 *
 *     ( window.WebSocket !== pr )                 // pr = ref captured at client init
 *   || !looksNative( WebSocket.prototype.send )   // Function.prototype.toString must say [native code]
 *
 * So a hook is invisible if BOTH stay false. We achieve that by:
 *   1. Replacing window.WebSocket with a Proxy of the NATIVE constructor, and
 *      installing it at document-start — BEFORE the client captures `pr`. The
 *      client therefore captures OUR proxy as `pr`, and later `window.WebSocket
 *      === pr` holds.
 *   2. Forwarding every `get` to the native target via Reflect and NEVER
 *      touching WebSocket.prototype. `WebSocket.prototype.send` stays the real
 *      native function, so looksNative() is satisfied.
 *   3. Intercepting per-SOCKET inside the `construct` trap, never via the
 *      prototype.
 *
 * As a deterministic safety net, the loader also scrubs the outgoing "T" packet
 * (see binding.telemetry.scrub) so even an unforeseen detection path reports
 * clean flags. That part lives in the loader's c2s pipeline; this file only
 * installs the hook.
 *
 * Part of the LOADER (the volatile half).
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooAnticheat = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooAnticheat = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    /*
     * Install the undetectable WebSocket proxy on `win`.
     *   onSocket(ws, url)  -> called for every new socket so the loader can
     *                         attach its (passive) read + (active) send hooks.
     *   onError(err)       -> optional error reporter.
     * Returns the native WebSocket constructor (handy for the loader).
     */
    function installWebSocketProxy(win, onSocket, onError) {
        const NativeWebSocket = win.WebSocket;
        if (!NativeWebSocket) throw new Error("no WebSocket to hook");
        // Idempotent: if we already installed, don't double-wrap.
        if (NativeWebSocket.__moomooWrapped) return NativeWebSocket.__moomooNative || NativeWebSocket;

        const report = (e) => { try { onError && onError(e); } catch (_) {} };

        // Wrap one socket's send() in a Proxy of the NATIVE send so that, even if
        // some check ever inspects it, Function.prototype.toString unwraps to the
        // native source. The loader's transform decides what actually goes out.
        function wrapSend(ws) {
            const nativeSend = ws.send.bind(ws);
            let transform = null; // set by the loader via ws.__moomooSetTransform
            const sendProxy = new Proxy(ws.send, {
                apply(target, thisArg, args) {
                    const data = args[0];
                    if (transform) {
                        try {
                            const out = transform(data, (d) => nativeSend(d));
                            // transform returns:
                            //   undefined -> it already sent (or dropped); do nothing
                            //   a value   -> send that value natively
                            if (out !== undefined) nativeSend(out);
                            return undefined;
                        } catch (e) {
                            report(e);
                            return nativeSend(data); // fail open: never break the game
                        }
                    }
                    return Reflect.apply(target, thisArg === sendProxy ? ws : thisArg, args);
                }
            });
            try {
                Object.defineProperty(ws, "send", { value: sendProxy, writable: true, configurable: true });
            } catch (e) {
                ws.send = sendProxy;
            }
            // The loader installs its transform here once the session is ready.
            ws.__moomooSetTransform = (fn) => { transform = fn; };
            ws.__moomooNativeSend = nativeSend;
        }

        const handler = {
            construct(target, args, newTarget) {
                const ws = Reflect.construct(target, args, newTarget === Proxied ? target : newTarget);
                try { wrapSend(ws); } catch (e) { report(e); }
                try { onSocket && onSocket(ws, args && args[0]); } catch (e) { report(e); }
                return ws;
            },
            // Pass-through for everything. receiver=target keeps native getter
            // semantics and avoids proxy-as-receiver edge cases.
            get(target, prop, receiver) {
                if (prop === "__moomooWrapped") return true;
                if (prop === "__moomooNative") return NativeWebSocket;
                return Reflect.get(target, prop, target);
            },
            set(target, prop, value) { return Reflect.set(target, prop, value); },
            has(target, prop) { return Reflect.has(target, prop); },
            deleteProperty(target, prop) { return Reflect.deleteProperty(target, prop); },
            defineProperty(target, prop, desc) { return Reflect.defineProperty(target, prop, desc); },
            getOwnPropertyDescriptor(target, prop) { return Reflect.getOwnPropertyDescriptor(target, prop); },
            ownKeys(target) { return Reflect.ownKeys(target); },
            getPrototypeOf(target) { return Reflect.getPrototypeOf(target); },
            setPrototypeOf(target, proto) { return Reflect.setPrototypeOf(target, proto); },
            // WebSocket must be called with `new`; forward apply anyway so the
            // native "Failed to construct" error is produced, not a proxy error.
            apply(target, thisArg, args) { return Reflect.apply(target, thisArg, args); }
        };

        const Proxied = new Proxy(NativeWebSocket, handler);

        // Replace the global. Define it the same way the platform does so a
        // descriptor probe sees nothing unusual.
        try {
            Object.defineProperty(win, "WebSocket", {
                value: Proxied, writable: true, enumerable: false, configurable: true
            });
        } catch (e) {
            win.WebSocket = Proxied;
        }
        return NativeWebSocket;
    }

    return { installWebSocketProxy };
});


/* ===== module: menu (loader/src/menu.js) ===== */
/*
 * moomoo.js loader — IN-GAME MODS MENU
 * ====================================
 * Injects a "Mods" tab into the game's pause menu (#gameMenuTabs) that matches
 * the native Settings / Friends / Clan / Report tabs, plus a panel where every
 * registered mod can be toggled on/off at runtime and expanded to reveal its
 * own settings.
 *
 * The native tab bar captures its <a> elements once at startup, so our added
 * tab is managed entirely by us: we show/hide our panel and keep the active
 * state mutually exclusive with the native tabs by watching their bodies.
 *
 * This is part of the LOADER (volatile): the element ids and classes below
 * mirror this build's client. If the menu markup changes, update this file.
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooMenu = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooMenu = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    // Native menu anchors for THIS build.
    const SEL = {
        tabs: "#gameMenuTabs",
        card: "#gameSettings",
        bodies: ["#gameSettingsBody", "#gameFriendsBody", "#reportMenu"]
    };

    const STYLE = `
    #gameModsBody.mmj-body{ color:#5a5a5a; max-height:340px; overflow-y:auto; overflow-x:hidden; margin:0 -4px; padding:0 4px; }
    #gameModsBody .mmj-empty{ padding:26px 8px; text-align:center; color:#9a9a9a; font-size:15px; line-height:1.5; }
    #gameModsBody .mmj-empty code{ background:#f0f0f0; border-radius:4px; padding:1px 5px; color:#6cc24a; }
    #gameModsBody .mmj-mod{ border-bottom:1px solid #eee; }
    #gameModsBody .mmj-row{ display:flex; align-items:center; gap:10px; padding:11px 4px; }
    #gameModsBody .mmj-head{ cursor:default; }
    #gameModsBody .mmj-head.mmj-has-settings{ cursor:pointer; border-radius:6px; }
    #gameModsBody .mmj-head.mmj-has-settings:hover{ background:#f3f3f3; }
    #gameModsBody .mmj-name{ flex:1 1 auto; min-width:0; font-size:16px; color:#2f2f2f; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    #gameModsBody .mmj-ver{ font-size:11px; color:#b4b4b4; margin-left:6px; }
    #gameModsBody .mmj-chev{ width:10px; height:10px; border-right:2px solid #c0c0c0; border-bottom:2px solid #c0c0c0; transform:rotate(-45deg); transition:transform .18s ease; flex:0 0 auto; margin-right:2px; }
    #gameModsBody .mmj-mod.mmj-open .mmj-chev{ transform:rotate(45deg); }
    #gameModsBody .mmj-settings{ display:none; padding:2px 6px 12px 6px; }
    #gameModsBody .mmj-mod.mmj-open .mmj-settings{ display:block; }
    #gameModsBody .mmj-set{ display:flex; align-items:center; gap:10px; padding:7px 0; font-size:14px; color:#6a6a6a; }
    #gameModsBody .mmj-set-label{ flex:1 1 auto; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    #gameModsBody .mmj-set input[type=text], #gameModsBody .mmj-set input[type=number], #gameModsBody .mmj-set select{
        font-family:inherit; font-size:13px; color:#333; border:1px solid #dcdcdc; border-radius:6px; padding:4px 7px; width:96px; background:#fff; }
    #gameModsBody .mmj-set input[type=range]{ -webkit-appearance:none; appearance:none; width:110px; height:5px; border-radius:3px; background:#e2e2e2; outline:none; }
    #gameModsBody .mmj-set input[type=range]::-webkit-slider-thumb{ -webkit-appearance:none; width:15px; height:15px; border-radius:50%; background:#6cc24a; cursor:pointer; box-shadow:0 1px 2px rgba(0,0,0,.25); }
    #gameModsBody .mmj-set input[type=range]::-moz-range-thumb{ width:15px; height:15px; border:none; border-radius:50%; background:#6cc24a; cursor:pointer; }
    #gameModsBody .mmj-set-val{ font-size:12px; color:#9a9a9a; min-width:30px; text-align:right; }
    /* toggle switch */
    .mmj-switch{ position:relative; display:inline-block; width:40px; height:22px; flex:0 0 auto; }
    .mmj-switch input{ opacity:0; width:0; height:0; position:absolute; }
    .mmj-switch .mmj-slider{ position:absolute; inset:0; background:#d2d2d2; border-radius:22px; transition:background .18s ease; cursor:pointer; }
    .mmj-switch .mmj-slider:before{ content:""; position:absolute; width:16px; height:16px; left:3px; top:3px; background:#fff; border-radius:50%; transition:transform .18s ease; box-shadow:0 1px 2px rgba(0,0,0,.3); }
    .mmj-switch input:checked + .mmj-slider{ background:#6cc24a; }
    .mmj-switch input:checked + .mmj-slider:before{ transform:translateX(18px); }
    .mmj-switch.mmj-small{ width:34px; height:19px; }
    .mmj-switch.mmj-small .mmj-slider:before{ width:13px; height:13px; }
    .mmj-switch.mmj-small input:checked + .mmj-slider:before{ transform:translateX(15px); }
    `;

    function installMenu(win, MooMoo) {
        const doc = win.document;
        if (!doc || typeof doc.querySelector !== "function" || typeof doc.createElement !== "function") return null;

        function el(tag, cls, attrs) {
            const n = doc.createElement(tag);
            if (cls) n.className = cls;
            if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
            return n;
        }

        function ensureStyle() {
            if (doc.getElementById("mmj-style")) return;
            const s = el("style"); s.id = "mmj-style"; s.textContent = STYLE;
            (doc.head || doc.documentElement).appendChild(s);
        }

        let panel = null;      // #gameModsBody
        let tab = null;        // our <a data-tab="mods">
        const openState = {};  // id -> expanded?

        function nativeBodies() { return SEL.bodies.map((s) => doc.querySelector(s)).filter(Boolean); }
        function nativeTabs() { const bar = doc.querySelector(SEL.tabs); return bar ? Array.from(bar.querySelectorAll("a")).filter((a) => a !== tab) : []; }

        function showMods() {
            for (const b of nativeBodies()) b.style.display = "none";
            if (panel) panel.style.display = "";
            if (tab) tab.classList.add("active");
            for (const a of nativeTabs()) a.classList.remove("active");
        }
        function hideMods() {
            if (panel) panel.style.display = "none";
            if (tab) tab.classList.remove("active");
        }

        function inject() {
            const bar = doc.querySelector(SEL.tabs);
            const card = doc.querySelector(SEL.card);
            if (!bar || !card || doc.getElementById("gameModsBody")) return Boolean(doc.getElementById("gameModsBody"));

            ensureStyle();

            tab = el("a", "mmj-tab", { "data-tab": "mods" });
            tab.textContent = "Mods";
            tab.addEventListener("click", (e) => { if (e.isTrusted === false) return; showMods(); });
            bar.appendChild(tab);

            panel = el("div", "mmj-body");
            panel.id = "gameModsBody";
            panel.style.display = "none";
            // place it right after the last native body so close button stays last
            card.appendChild(panel);

            // Mutual exclusivity: when a native body becomes visible, drop out of Mods.
            try {
                const obs = new win.MutationObserver(() => {
                    if (!panel || panel.style.display === "none") return;
                    for (const b of nativeBodies()) { if (b.style.display !== "none") { hideMods(); break; } }
                });
                for (const b of nativeBodies()) obs.observe(b, { attributes: true, attributeFilter: ["style"] });
            } catch (e) { /* no MutationObserver: the per-tab click handlers still cover the common case */ }
            for (const a of nativeTabs()) a.addEventListener("click", (e) => { if (e.isTrusted === false) return; hideMods(); });

            render();
            return true;
        }

        function makeSetting(mod, s) {
            const row = el("div", "mmj-set");
            const label = el("div", "mmj-set-label");
            label.textContent = s.label;
            const commit = (v) => MooMoo.setSetting(mod.id, s.key, v);

            let control, valueTag;
            if (s.type === "boolean") {
                control = el("label", "mmj-switch mmj-small");
                const input = el("input", null, { type: "checkbox" });
                input.checked = !!s.value;
                input.addEventListener("change", () => commit(input.checked));
                control.appendChild(input); control.appendChild(el("span", "mmj-slider"));
            } else if (s.type === "number" && s.min !== undefined && s.max !== undefined) {
                control = el("input", null, { type: "range", min: s.min, max: s.max, step: s.step != null ? s.step : 1 });
                control.value = s.value;
                valueTag = el("div", "mmj-set-val"); valueTag.textContent = String(s.value);
                control.addEventListener("input", () => { valueTag.textContent = String(control.value); });
                control.addEventListener("change", () => commit(parseFloat(control.value)));
            } else if (s.type === "number") {
                control = el("input", null, { type: "number" });
                control.value = s.value;
                if (s.min !== undefined) control.min = s.min;
                if (s.max !== undefined) control.max = s.max;
                if (s.step != null) control.step = s.step;
                control.addEventListener("change", () => commit(parseFloat(control.value)));
            } else if (s.type === "select") {
                control = el("select");
                for (const opt of (s.options || [])) {
                    const o = el("option"); o.value = String(opt); o.textContent = String(opt);
                    if (String(opt) === String(s.value)) o.selected = true;
                    control.appendChild(o);
                }
                control.addEventListener("change", () => commit(control.value));
            } else {
                control = el("input", null, { type: "text" });
                control.value = s.value == null ? "" : s.value;
                control.addEventListener("change", () => commit(control.value));
            }
            row.appendChild(label);
            if (valueTag) row.appendChild(valueTag);
            row.appendChild(control);
            return row;
        }

        function render() {
            if (!panel) return;
            const mods = MooMoo.getMods();
            panel.textContent = "";
            if (!mods.length) {
                const empty = el("div", "mmj-empty");
                empty.innerHTML = "No mods installed yet.<br>Add a mod userscript that <code>@require</code>s this loader.";
                panel.appendChild(empty);
                return;
            }
            for (const mod of mods) {
                const wrap = el("div", "mmj-mod");
                if (openState[mod.id]) wrap.classList.add("mmj-open");

                const head = el("div", "mmj-row mmj-head" + (mod.hasSettings ? " mmj-has-settings" : ""));
                const sw = el("label", "mmj-switch");
                const input = el("input", null, { type: "checkbox" });
                input.checked = mod.enabled;
                input.addEventListener("click", (e) => e.stopPropagation());
                input.addEventListener("change", () => MooMoo.setModEnabled(mod.id, input.checked));
                sw.appendChild(input); sw.appendChild(el("span", "mmj-slider"));

                const name = el("div", "mmj-name");
                name.textContent = mod.name;
                const ver = el("span", "mmj-ver"); ver.textContent = "v" + mod.version; name.appendChild(ver);

                head.appendChild(sw);
                head.appendChild(name);
                if (mod.hasSettings) {
                    head.appendChild(el("div", "mmj-chev"));
                    head.addEventListener("click", () => {
                        openState[mod.id] = !openState[mod.id];
                        wrap.classList.toggle("mmj-open", openState[mod.id]);
                    });
                }
                wrap.appendChild(head);

                if (mod.hasSettings) {
                    const box = el("div", "mmj-settings");
                    for (const s of mod.settings) box.appendChild(makeSetting(mod, s));
                    wrap.appendChild(box);
                }
                panel.appendChild(wrap);
            }
        }

        // Re-render whenever the mod set or any setting changes.
        MooMoo.onModsChanged(() => { if (panel) render(); });

        // The menu markup may not exist at document-start; wait for it.
        if (!inject()) {
            try {
                const obs = new win.MutationObserver(() => { if (inject()) obs.disconnect(); });
                obs.observe(doc.documentElement || doc, { childList: true, subtree: true });
                // Safety timeout in case observation misses it.
                let tries = 0;
                const iv = win.setInterval(() => { if (inject() || ++tries > 120) win.clearInterval(iv); }, 500);
            } catch (e) { /* ignore */ }
        }

        return { render, inject, showMods, hideMods };
    }

    return { installMenu };
});


/* ===== module: loader (loader/src/loader.js) ===== */
/*
 * moomoo.js loader — CORE
 * =======================
 * Wires everything together, in the page's own JS context:
 *   - installs the undetectable WebSocket proxy (anticheat.js)
 *   - on the game socket: reads the io-init handshake, derives the session keys
 *     from the page's moomoo-protocol module (exactly like the client), then
 *   - decodes server->client frames and hands them to the runtime as events
 *   - OWNS the client->server stream: re-encodes every frame with its own gap-
 *     free sequence (so mods can inject packets) and scrubs the "T" telemetry
 *     (the anti-cheat bypass safety net)
 *   - exposes window.MooMoo (the stable API) and window.MooMooLoader (diagnostics)
 *
 * Buffering: if a frame arrives before the keys are ready, it is queued and
 * processed in order the moment the session is set up — the game never stalls
 * and the sequence never desyncs. If the protocol module can't be resolved at
 * all, the loader falls back to pure pass-through so the game still works.
 */
(function (root, factory) {
    const deps = (typeof require === "function" && typeof module === "object")
        ? {
            Protocol: require("./protocol.js"),
            Msgpack: require("./msgpack.js"),
            Binding: require("./binding.js"),
            Runtime: require("./runtime.js"),
            Anticheat: require("./anticheat.js"),
            Menu: require("./menu.js")
        }
        : null;
    const value = factory(deps);
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooLoaderCore = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooLoaderCore = value;
})(typeof self !== "undefined" ? self : this, function (nodeDeps) {
    "use strict";

    const VERSION = "1.0.0";

    // Resolve dependencies either from Node require (tests) or page globals (bundle).
    function resolveDeps(win) {
        if (nodeDeps) return nodeDeps;
        const g = win || (typeof globalThis !== "undefined" ? globalThis : {});
        return {
            Protocol: g.MooMooProtocol,
            Msgpack: g.MooMooMsgpack,
            Binding: g.MooMooBinding,
            Runtime: g.MooMooRuntime,
            Anticheat: g.MooMooAnticheat,
            Menu: g.MooMooMenu
        };
    }

    // Default: resolve the per-deploy module the same way the client does.
    function defaultResolveProtocol(win) {
        const doc = win.document;
        // 1) bare specifier through the page's import map
        const tryBare = () => win.eval
            ? win.eval('import("moomoo-protocol")')
            : import(/* webpackIgnore: true */ "moomoo-protocol");
        // 2) read the import map ourselves and import the resolved URL
        const tryMap = () => {
            try {
                const tags = doc.querySelectorAll('script[type="importmap"]');
                for (const tag of tags) {
                    const map = JSON.parse(tag.textContent || "{}");
                    const spec = map && map.imports && map.imports["moomoo-protocol"];
                    if (spec) {
                        const url = new URL(spec, doc.baseURI).href;
                        return win.eval ? win.eval('import("' + url + '")') : import(/* webpackIgnore: true */ url);
                    }
                }
            } catch (e) { /* fall through */ }
            return Promise.reject(new Error("moomoo-protocol not in any import map"));
        };
        return Promise.resolve().then(tryBare).catch(tryMap);
    }

    function toBytes(data) {
        if (data instanceof Uint8Array) return data;
        if (data instanceof ArrayBuffer) return new Uint8Array(data);
        if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView && ArrayBuffer.isView(data)) {
            return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        }
        // Duck-type an ArrayBuffer (covers cross-realm buffers: a typed-array
        // ctor accepts any real ArrayBuffer regardless of which realm it came
        // from, even though `instanceof` is realm-specific).
        const tag = Object.prototype.toString.call(data);
        if (tag === "[object ArrayBuffer]") return new Uint8Array(data);
        if (data && data.buffer && Object.prototype.toString.call(data.buffer) === "[object ArrayBuffer]") {
            return new Uint8Array(data.buffer, data.byteOffset || 0, data.byteLength);
        }
        return null; // strings / Blobs -> not our binary protocol
    }

    function createLoader(win, options) {
        const opts = options || {};
        const D = resolveDeps(win);
        if (!D.Protocol || !D.Binding || !D.Runtime || !D.Anticheat) {
            throw new Error("moomoo.js loader: missing dependencies (bundle not assembled?)");
        }
        // Protocol resolution precedence: explicit option > page-provided hook
        // (window.__moomooResolveProtocol, handy if the server doesn't name the
        // import-map module "moomoo-protocol") > default import-map lookup.
        const resolveProtocol = opts.resolveProtocol
            || (typeof win.__moomooResolveProtocol === "function" ? win.__moomooResolveProtocol : null)
            || (() => defaultResolveProtocol(win));
        const binding = D.Binding;
        const telemetry = binding.telemetry;

        const diag = { version: VERSION, buildId: null, resolvedProtocol: false, sockets: 0, failedProtocol: false };
        const rawTaps = new Set();      // fn(dir, name, args)
        const errorSink = (e) => { try { console.error("%c[moomoo.js]", "color:#e66", "loader error:", e); } catch (_) {} };

        let modPromise = null;
        function getProtocolModule() {
            if (modPromise) return modPromise;
            modPromise = Promise.resolve().then(resolveProtocol).then((mod) => {
                diag.resolvedProtocol = true;
                diag.buildId = mod && mod.BUILD_ID || null;
                return mod;
            });
            // Do not cache a rejection: allow a later attempt to retry.
            modPromise.catch(() => { modPromise = null; });
            return modPromise;
        }

        let active = null; // the adopted game socket's state

        // ---- runtime + sink ----
        const sink = {
            sendAction(action, payload) {
                const bind = binding.outgoing[action];
                if (!bind) { console.warn("%c[moomoo.js]", "color:#e66", "unknown action: " + action); return false; }
                return sendWire(active, bind.wire, bind.build(payload || {}));
            },
            sendRaw(wire, args) { return sendWire(active, wire, args || []); }
        };
        const MooMoo = D.Runtime.createRuntime({
            version: VERSION,
            sink,
            loaderInfo: diag
        });

        function tapRaw(dir, name, args) {
            if (!rawTaps.size) return;
            for (const fn of rawTaps) { try { fn(dir, name, args); } catch (e) { /* ignore */ } }
        }

        // ---- outgoing (client -> server), loader-owned ----
        function sendWire(st, wire, args) {
            if (!st || st.ignore) { console.warn("%c[moomoo.js]", "color:#e66", "no active game socket to send on"); return false; }
            if (st.ready) {
                const bytes = st.session.encodeC2S(wire, args);
                tapRaw("out", wire, args);
                st.nativeSend(bytes);
                return true;
            }
            if (st.failed) { console.warn("%c[moomoo.js]", "color:#e66", "cannot inject packets without the protocol key"); return false; }
            st.outQueue.push({ kind: "inject", wire, args });
            return true;
        }

        // Transform applied to every frame the client tries to send.
        function makeSendTransform(st) {
            return function (data /*, nativeSend */) {
                if (st.ignore || !st.handshaked) return data;       // not the game socket yet -> pass through
                if (st.failed) return data;                          // no keys -> pass through
                if (!st.ready) { st.outQueue.push({ kind: "client", data: toBytes(data) || data }); return undefined; }
                return reencodeClientFrame(st, toBytes(data) || data);
            };
        }

        function reencodeClientFrame(st, bytes) {
            try {
                const dec = st.session.decodeC2S(bytes);
                let name = dec.name, args = dec.args;
                if (name === telemetry.wire) args = telemetry.scrub(args); // ANTI-CHEAT BYPASS
                tapRaw("out", name, args);
                return st.session.encodeC2S(name, args);               // our own gap-free seq
            } catch (e) {
                errorSink(e);
                return bytes; // fail open
            }
        }

        // ---- incoming (server -> client), read-only observer ----
        function handleIncoming(st, rawData) {
            if (st.ignore) return;
            const bytes = toBytes(rawData);
            if (!bytes) { if (!st.handshaked) st.ignore = true; return; }

            if (!st.handshaked) {
                const hs = D.Protocol.isHandshake(bytes);
                if (!hs) { st.ignore = true; return; }                 // some other socket
                st.handshaked = true;
                adopt(st, hs[1]);
                return;
            }
            if (!st.ready) { st.inQueue.push(bytes.slice()); return; }  // keys not ready yet -> buffer
            processS2C(st, bytes);
        }

        function processS2C(st, bytes) {
            let dec;
            try { dec = st.session.decodeS2C(bytes); }
            catch (e) { errorSink(e); return; }
            const bind = binding.incoming[dec.name];
            tapRaw("in", dec.name, dec.args);
            if (!bind) return; // unknown packet: still visible via raw tap
            let payload;
            try { payload = bind.parse(dec.args); }
            catch (e) { errorSink(e); return; }
            MooMoo._dispatch(bind.event, payload);
        }

        // Called when a socket's first frame is an io-init: set up the session.
        function adopt(st, payload) {
            active = st;
            if (MooMoo._reset) MooMoo._reset();
            getProtocolModule().then((mod) => {
                try {
                    st.session = new D.Protocol.ClientSession(payload, mod);
                } catch (e) {
                    errorSink(e);
                    becomeFailed(st);
                    return;
                }
                st.ready = true;
                // Drain buffered incoming frames in order (advances the s2c counter correctly).
                const inq = st.inQueue; st.inQueue = [];
                for (const f of inq) processS2C(st, f);
                // Drain buffered outgoing (client frames + injected) in call order.
                const outq = st.outQueue; st.outQueue = [];
                for (const item of outq) {
                    if (item.kind === "client") { const b = reencodeClientFrame(st, item.data); if (b !== undefined) st.nativeSend(b); }
                    else { try { st.nativeSend(st.session.encodeC2S(item.wire, item.args)); tapRaw("out", item.wire, item.args); } catch (e) { errorSink(e); } }
                }
                MooMoo._setReady(true);
                try { win.dispatchEvent(new win.Event("moomoo:ready")); } catch (e) { /* non-DOM env */ }
            }).catch((e) => {
                errorSink(e);
                becomeFailed(st);
            });
        }

        // Protocol module unavailable: give up owning the stream, keep the game alive.
        function becomeFailed(st) {
            diag.failedProtocol = true;
            st.failed = true;
            // Flush any buffered client frames as ORIGINAL bytes (keeps client seq intact).
            const outq = st.outQueue; st.outQueue = [];
            for (const item of outq) if (item.kind === "client") st.nativeSend(item.data);
            // Injected packets can't be sent without the key; drop them.
            console.warn("%c[moomoo.js]", "color:#e66", "protocol module unavailable; mods are read-disabled on this connection");
        }

        // ---- socket adoption plumbing ----
        function onSocket(ws) {
            diag.sockets++;
            const st = {
                ws, handshaked: false, ready: false, failed: false, ignore: false,
                session: null, inQueue: [], outQueue: [],
                nativeSend: (d) => ws.__moomooNativeSend ? ws.__moomooNativeSend(d) : ws.send(d)
            };
            // passive read hook
            try { ws.addEventListener("message", (ev) => handleIncoming(st, ev.data)); }
            catch (e) { errorSink(e); }
            // active send hook (installed by anticheat.wrapSend)
            if (ws.__moomooSetTransform) ws.__moomooSetTransform(makeSendTransform(st));
        }

        const native = D.Anticheat.installWebSocketProxy(win, onSocket, errorSink);

        // ---- diagnostics surface ----
        const MooMooLoader = {
            version: VERSION,
            native,
            diag,
            onRaw(fn) { rawTaps.add(fn); return () => rawTaps.delete(fn); },
            sendRaw: (wire, args) => sink.sendRaw(wire, args),
            active: () => active && { ready: active.ready, failed: active.failed, buildId: diag.buildId }
        };

        win.MooMoo = MooMoo;
        win.MooMooLoader = MooMooLoader;

        // In-game Mods menu (only in a real page; skipped in headless tests).
        if (D.Menu && win.document) {
            try { MooMooLoader.menu = D.Menu.installMenu(win, MooMoo); }
            catch (e) { errorSink(e); }
        }
        // Warm up the protocol module resolution so the first connection is instant.
        try { getProtocolModule().catch(() => {}); } catch (e) { /* ignore */ }

        return { MooMoo, MooMooLoader };
    }

    return { createLoader, VERSION };
});

  try {
    MooMooLoaderCore.createLoader(window);
    console.log("%c[moomoo.js]", "color:#7cc;font-weight:bold", "loader 1.0.0 installed — window.MooMoo is ready for mods");
  } catch (e) {
    console.error("%c[moomoo.js]", "color:#e66", "loader failed to install:", e);
  }
}
  // Run core in the PAGE context. Under a userscript sandbox we inject a <script>;
  // if we are already in the page (e.g. @grant none page-context, or a bookmarklet)
  // we just call it.
  var inPage;
  try { inPage = (typeof unsafeWindow === "undefined") || (window === unsafeWindow); }
  catch (e) { inPage = true; }
  if (inPage) {
    core();
  } else {
    try {
      var s = document.createElement("script");
      s.textContent = "(" + core.toString() + ")();";
      (document.head || document.documentElement).appendChild(s);
      s.remove();
    } catch (e) {
      // Last resort: run in whatever context we are in.
      core();
    }
  }
})();
