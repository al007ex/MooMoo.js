/*
 * Unit test for the detection-packet canceller (loader/src/core/antidetect.js).
 *
 * Proves it cancels the client's "T" and builds an empty replacement: the detection
 * fields (flags / untrusted / probe result) are zeroed while the crypto/transport
 * envelope (seal, probe salt, seq, ledger) carries the real values the server validates.
 *
 * Run:  node tests/antidetect.test.mjs
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import assert from "node:assert";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const binding = require(path.join(here, "..", "loader", "src", "net", "binding.js"));
const AntiDetect = require(path.join(here, "..", "loader", "src", "core", "antidetect.js"));

let pass = 0, fail = 0;
const ok = (name, fn) => {
    try { fn(); pass++; console.log("  ✓ " + name); }
    catch (e) { fail++; console.log("  ✗ " + name + "\n      " + (e && e.message)); }
};

const tel = binding.telemetry;
const CTX = { sealReport: 123456, probeSalt: 777, seq: 42, ledger: 0xABCDEF };
// A "dirty" client "T": flags USERSCRIPT_MANAGER(1)|SOCKET_HOOKED(2) = 3, 12 untrusted events,
// a matched probe bit, and the client's OWN seal / salt / seq / ledger (all to be discarded).
const DIRTY = [3, 12, 5, 999999, 42, 41, 0x11111111];

console.log("\n== telemetry.inspect decodes what the client would report ==");
ok("flag bits -> names", () => {
    const s = tel.inspect(DIRTY);
    assert.deepStrictEqual(s.flagNames.slice().sort(), ["SOCKET_HOOKED", "USERSCRIPT_MANAGER"]);
    assert.strictEqual(s.untrusted, 12);
    assert.strictEqual(s.probeResult, 5);
});

console.log("\n== telemetry.construct builds an empty T with the real envelope ==");
ok("empty detection, correct seal/salt/seq/ledger", () => {
    assert.deepStrictEqual(tel.construct(CTX), [0, 0, 0, 123456, 777, 42, 0xABCDEF]);
});
ok("5-field form when the connection carries no ledger", () => {
    assert.deepStrictEqual(tel.construct({ sealReport: 1, probeSalt: 2 }), [0, 0, 0, 1, 2]);
});
ok("construct(ctx, det) can carry detection (the disabled path)", () => {
    assert.deepStrictEqual(tel.construct(CTX, { flags: 3, untrusted: 12, probeResult: 5 }), [3, 12, 5, 123456, 777, 42, 0xABCDEF]);
});

console.log("\n== antiDetect cancels the client T and sends an empty one ==");
ok("enabled: output is empty no matter how dirty the client's T is", () => {
    const ad = AntiDetect.create({ telemetry: tel });
    ad.setEnabled(true);   // the fallback canceller is opt-in now (default is honest passthrough)
    const out = ad.handle(DIRTY, CTX);
    assert.deepStrictEqual(out, [0, 0, 0, 123456, 777, 42, 0xABCDEF]);
    assert.strictEqual(ad.count, 1);
    assert.strictEqual(ad.caughtCount, 1);
    assert.strictEqual(ad.last.neutralised, true);
    assert.deepStrictEqual(ad.last.flagNames.slice().sort(), ["SOCKET_HOOKED", "USERSCRIPT_MANAGER"]);
});
ok("onDetection reports what was cancelled", () => {
    const ad = AntiDetect.create({ telemetry: tel });
    let got = null;
    const un = ad.onDetection((e) => { got = e; });
    ad.handle(DIRTY, CTX);
    assert.ok(got && got.caught && got.flags === 3, "listener saw the caught detection");
    un();
    ad.handle(DIRTY, CTX);  // listener removed, but the packet is still handled
    assert.strictEqual(ad.count, 2);
});
ok("default: flags + untrusted masked (the irreducible socket hook), probe result passed through", () => {
    const ad = AntiDetect.create({ telemetry: tel });   // default: enabled=false
    const out = ad.handle(DIRTY, CTX);
    // flags/untrusted -> 0 (a clean client reports 0 and the socket hook forces them), but the
    // probe bit is passed through unchanged so a canary probe still reads true.
    assert.deepStrictEqual(out, [0, 0, 5, 123456, 777, 42, 0xABCDEF]);
    assert.strictEqual(ad.last.neutralised, false);
});
ok("a clean client T is counted but not flagged as 'caught'", () => {
    const ad = AntiDetect.create({ telemetry: tel });
    ad.handle([0, 0, 0, 0, 777, 41, 0], CTX);
    assert.strictEqual(ad.count, 1);
    assert.strictEqual(ad.caughtCount, 0);
    assert.strictEqual(ad.last.caught, false);
});

console.log("\n== cleanProbeResult strips loader/mod footprint, keeps canaries ==");
// FNV salted hash, identical to the server / client / binding.
const sh = (text, salt) => { let h = (2166136261 ^ salt) >>> 0; for (let i = 0; i < text.length; i++) h = Math.imul(h ^ (text.charCodeAt(i) & 255), 16777619); h ^= h >>> 15; h = Math.imul(h, 739982445); h ^= h >>> 12; return h >>> 0; };
const SALT = 12345;
// Set up a world with loader/mod artifacts AND clean "canary" equivalents for every probe kind.
globalThis.__ad = {};
globalThis.__ad.hooked = function hooked() {};          // kind 7: non-native fn (a hook)
globalThis.__ad.nativeFn = Array.prototype.slice;       // kind 7: native (a real client has it)
function Wrapped() {} Wrapped.prototype.constructor = Object;  // kind 5: swapped constructor
globalThis.__ad.Wrapped = Wrapped;
function Intact() {}                                     // kind 5: constructor intact
globalThis.__ad.Intact = Intact;
globalThis.localStorage = {};
globalThis.localStorage["moomoojs:cfg:lite"] = "x";     // kind 3: a loader storage key
globalThis.localStorage["playerName"] = "bob";          // kind 3: a normal key (canary)
globalThis.document = { querySelectorAll: (s) => {
    if (s === "[id]") return [
        { tagName: "DIV", id: "panel", className: "mdbg" },   // kind 4: a mod element (mdbg class)
        { tagName: "DIV", id: "mainMenu", className: "menu" } // kind 4: a game element (canary)
    ];
    if (/class/.test(s)) return [                              // kind 8: our classed elements
        { tagName: "DIV", id: "", className: "mml-gui open" },
        { tagName: "DIV", id: "", className: "mdbg" }
    ];
    return [];
} };
// bit:  0 hook   1 native  2 swapped  3 intact  4 kind1-canary  5 loaderLS  6 LScanary  7 modEl  8 gameEl
const PROBES = [
    [7, "__ad.hooked", 0], [7, "__ad.nativeFn", 0], [5, "__ad.Wrapped", 0], [5, "__ad.Intact", 0],
    [1, "window", sh("document", SALT)], [3, "", sh("moomoojs:cfg:lite", SALT)], [3, "", sh("playerName", SALT)],
    [4, "", sh("div#panel", SALT)], [4, "", sh("div#mainMenu", SALT)]
];
const CLEARED = (1 << 0) | (1 << 2) | (1 << 5) | (1 << 7);   // the four loader/mod bits
ok("clears exactly the loader/mod bits (hook, swap, our LS key, our element)", () => {
    const outp = tel.cleanProbeResult(0x1FF, PROBES, SALT);     // client matched all 9
    assert.strictEqual(outp, (0x1FF & ~CLEARED) >>> 0, "kept canaries, cleared the 4 loader bits");
});
ok("a canary-only answer passes through untouched", () => {
    const canaries = (1 << 1) | (1 << 3) | (1 << 4) | (1 << 6) | (1 << 8);
    assert.strictEqual(tel.cleanProbeResult(canaries, PROBES, SALT), canaries);
});
ok("no probe round -> unchanged (back-compat)", () => {
    assert.strictEqual(tel.cleanProbeResult(0x1FF, undefined, SALT), 0x1FF);
});
// kind 8 (elements by class) + kind 9 (CustomEvent handshake) — the updated anticheat's new probes
ok("kind 8: clears our class signatures, keeps a game class (canary)", () => {
    const P = [
        [8, "", sh("div.mml-gui", SALT)],   // bit 0: our menu class -> clear
        [8, "", sh("div.gameUI", SALT)],    // bit 1: a game class -> keep
        [8, "", sh("div.mdbg", SALT)]       // bit 2: our panel class -> clear
    ];
    assert.strictEqual(tel.cleanProbeResult(0b111, P, SALT), 0b010);
});
ok("kind 9: clears the loader handshake event, keeps another event", () => {
    const P = [
        [9, "moomoo.js:api", 0],   // bit 0: the loader's handshake -> clear
        [9, "some.other.evt", 0]   // bit 1: unrelated event -> keep
    ];
    assert.strictEqual(tel.cleanProbeResult(0b11, P, SALT), 0b10);
});
ok("default handle() with a probe round sends the original-client answer (footprint stripped)", () => {
    const ad = AntiDetect.create({ telemetry: tel });            // default: enabled = false
    const out = ad.handle([3, 2, 0x1FF, 777, SALT, 5, 9], { sealReport: 1, probeSalt: SALT, probes: PROBES, seq: 5, ledger: 9 });
    assert.deepStrictEqual(out, [0, 0, (0x1FF & ~CLEARED) >>> 0, 1, SALT, 5, 9]);
    assert.strictEqual(ad.last.sentProbeResult, (0x1FF & ~CLEARED) >>> 0);
    assert.strictEqual(ad.last.strippedProbe, CLEARED);
    assert.ok(ad.last.caught, "masked flags + stripped bits count as a catch");
});
ok("a pure-canary client T is NOT counted as caught", () => {
    const ad = AntiDetect.create({ telemetry: tel });
    const canaries = (1 << 4) | (1 << 8);
    ad.handle([0, 0, canaries, 0, SALT, 5, 9], { sealReport: 1, probeSalt: SALT, probes: PROBES, seq: 5, ledger: 9 });
    assert.strictEqual(ad.last.caught, false, "canaries pass through, nothing neutralised");
    assert.strictEqual(ad.last.sentProbeResult, canaries);
});
console.log("\n== self-protection: auditProbeResult flags what the sanitiser cannot handle ==");
ok("a clean round (all known kinds, properly stripped) raises no warning", () => {
    const clean = tel.cleanProbeResult(0x1FF, PROBES, SALT);
    const w = tel.auditProbeResult(0x1FF, clean, PROBES, SALT);
    assert.strictEqual(w.length, 0, JSON.stringify(w));
});
ok("a brand-new probe KIND the sanitiser has no rule for is flagged (matched)", () => {
    const P = [[10, "future.path", sh("x", SALT)]];
    const w = tel.auditProbeResult(0b1, 0b1, P, SALT);     // client matched the unknown probe
    assert.strictEqual(w.length, 1);
    assert.strictEqual(w[0].type, "unknown-kind");
    assert.strictEqual(w[0].kind, 10);
    assert.strictEqual(w[0].matched, true);
});
ok("an unknown kind present but not matched this round is still flagged (warn early)", () => {
    const w = tel.auditProbeResult(0, 0, [[11, "", 0]], SALT);
    assert.strictEqual(w.length, 1);
    assert.strictEqual(w[0].type, "unknown-kind");
    assert.strictEqual(w[0].matched, false);
});
ok("a strip that SILENTLY FAILED (our footprint bit still set) is flagged as residual", () => {
    // simulate cleanProbeResult having left bit 0 (our hooked fn) set — the telemetryGlobal bug
    const w = tel.auditProbeResult(0b1, 0b1, [[7, "__ad.hooked", 0]], SALT);
    assert.strictEqual(w.length, 1);
    assert.strictEqual(w[0].type, "residual-footprint");
    assert.strictEqual(w[0].index, 0);
});
ok("a canary bit left set is NOT a residual-footprint warning", () => {
    const w = tel.auditProbeResult(0b1, 0b1, [[7, "__ad.nativeFn", 0]], SALT);   // native fn = canary
    assert.strictEqual(w.length, 0);
});
ok("telemetryGlobalHealthy() is true when the sanitiser can see the page", () => {
    assert.strictEqual(tel.telemetryGlobalHealthy(), true);
});
ok("knownProbeKinds covers 1..9", () => {
    assert.deepStrictEqual(tel.knownProbeKinds.slice().sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

console.log("\n== self-protection: handle() surfaces warnings WITHOUT changing what is sent ==");
ok("handle() warns on an unknown kind, exposes it, still sends the honest answer", () => {
    const ad = AntiDetect.create({ telemetry: tel });
    const probes = [[7, "__ad.hooked", 0], [10, "future", sh("x", SALT)]];
    const warns = [];
    const origWarn = console.warn;
    console.warn = (m) => warns.push(String(m));
    try {
        // client matched our hooked fn (bit 0) + the unknown kind (bit 1)
        const out = ad.handle([3, 0, 0b11, 0, SALT, 5, 9], { sealReport: 1, probeSalt: SALT, probes, seq: 5, ledger: 9 });
        assert.strictEqual(out[2], 0b10, "our hook bit stripped, the unknown bit passes through unchanged");
        assert.ok(ad.warningCount >= 1 && ad.warnings.some((w) => w.type === "unknown-kind" && w.kind === 10), "exposed on ad.warnings");
        assert.ok(ad.last.warnings && ad.last.warnings.length >= 1, "attached to the log entry");
        assert.ok(warns.some((m) => /SELF-PROTECTION/.test(m) && /kind 10/i.test(m)), "console.warn fired: " + JSON.stringify(warns));
    } finally { console.warn = origWarn; }
});
ok("handle() stays healthy and warning-free on a normal known-kind round", () => {
    const ad = AntiDetect.create({ telemetry: tel });
    ad.handle([3, 2, 0x1FF, 0, SALT, 5, 9], { sealReport: 1, probeSalt: SALT, probes: PROBES, seq: 5, ledger: 9 });
    assert.strictEqual(ad.healthy, true);
    assert.strictEqual(ad.warningCount, 0);
    assert.strictEqual(ad.last.warnings, null);
});

delete globalThis.__ad; delete globalThis.localStorage; delete globalThis.document;

console.log("\n----------------------------------------");
console.log("ANTIDETECT:  " + pass + " passed, " + fail + " failed");
process.exit(fail === 0 ? 0 : 1);
