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
ok("disabled: the client's real detection is let through (own-server testing), seq/ledger still ours", () => {
    const ad = AntiDetect.create({ telemetry: tel });
    ad.setEnabled(false);
    const out = ad.handle(DIRTY, CTX);
    assert.deepStrictEqual(out, [3, 12, 5, 123456, 777, 42, 0xABCDEF]);
    assert.strictEqual(ad.last.neutralised, false);
});
ok("a clean client T is counted but not flagged as 'caught'", () => {
    const ad = AntiDetect.create({ telemetry: tel });
    ad.handle([0, 0, 0, 0, 777, 41, 0], CTX);
    assert.strictEqual(ad.count, 1);
    assert.strictEqual(ad.caughtCount, 0);
    assert.strictEqual(ad.last.caught, false);
});

console.log("\n----------------------------------------");
console.log("ANTIDETECT:  " + pass + " passed, " + fail + " failed");
process.exit(fail === 0 ? 0 : 1);
