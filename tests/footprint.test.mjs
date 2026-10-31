/*
 * Unit test for the kind-8 (elements-by-class) footprint stripper in binding.js.
 *
 * The server can probe "does any element carry class X" (a salted hash of "tag.class"). The loader
 * must clear the bit for OUR classes and keep it for a GAME class (which could be a canary the real
 * client must match). This proves it strips:
 *   - the in-game Mods tab ("a.mmj-tab") and other mmj-* / mmj-nt-* classes
 *   - unprefixed inner classes scoped under one of our containers (e.g. "div.bbtn" inside .mml-bots)
 * and does NOT clear a genuine game class.
 *
 * Run:  node tests/footprint.test.mjs
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import assert from "node:assert";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const binding = require(path.join(here, "..", "loader", "src", "net", "binding.js"));
const { cleanProbeResult } = binding.telemetry;

let pass = 0, fail = 0;
const ok = (name, fn) => {
    try { fn(); pass++; console.log("  ✓ " + name); }
    catch (e) { fail++; console.log("  ✗ " + name + "\n      " + (e && e.stack || e)); }
};

// the exact salted FNV-1a the server/client/loader use for probe hashes (binding.js telemetrySaltedHash)
function saltedHash(text, salt) {
    let h = (2166136261 ^ salt) >>> 0;
    for (let i = 0; i < text.length; i++) h = Math.imul(h ^ (text.charCodeAt(i) & 255), 16777619);
    h ^= h >>> 15; h = Math.imul(h, 739982445); h ^= h >>> 12; return h >>> 0;
}

// A loader/game element stub with the bits the stripper reads (tagName/className/id/closest).
const LOADER = /mml-|mmj-|mdbg|moomoo/;
function mkEl(tag, cls, parent) {
    const e = { tagName: tag, className: cls, id: "" };
    e.closest = () => (LOADER.test(cls) ? e : (parent && LOADER.test(parent.className) ? parent : null));
    return e;
}
// Scene: the Mods tab <a class="mmj-tab">, a notice card <div class="mmj-nt-card">, the bots panel
// <div class="mml-bots"> with an unprefixed <div class="bbtn go"> inside it, and a pure game element.
const modsTab = mkEl("A", "mmj-tab");
const noticeCard = mkEl("DIV", "mmj-nt-card");
const botsRoot = mkEl("DIV", "mml-bots");
const botsBtn = mkEl("DIV", "bbtn go", botsRoot);
const LOADER_ELS = [modsTab, noticeCard, botsRoot, botsBtn];

// telemetryGlobal() returns whichever global carries a document; give it a stub that serves our
// loader elements for the class query (and [id] query). Game elements are simply not in it.
const prevDoc = Object.getOwnPropertyDescriptor(globalThis, "document");
globalThis.document = { querySelectorAll: () => LOADER_ELS };

const SALT = 0x12345678 >>> 0;
const probe8 = (cls) => [8, "", saltedHash(cls, SALT)];

try {
    ok("strips the in-game Mods tab class (a.mmj-tab)", () => {
        const probes = [probe8("a.mmj-tab")];
        assert.strictEqual(cleanProbeResult(0b1, probes, SALT), 0);
    });

    ok("strips a notice-card class (div.mmj-nt-card)", () => {
        const probes = [probe8("div.mmj-nt-card")];
        assert.strictEqual(cleanProbeResult(0b1, probes, SALT), 0);
    });

    ok("strips an UNPREFIXED inner class scoped under our container (div.bbtn in .mml-bots)", () => {
        const probes = [probe8("div.bbtn")];
        assert.strictEqual(cleanProbeResult(0b1, probes, SALT), 0);
    });

    ok("KEEPS a genuine game class (div.gameCanvas) — a canary must survive", () => {
        const probes = [probe8("div.gameCanvas")];
        assert.strictEqual(cleanProbeResult(0b1, probes, SALT), 1);
    });

    ok("mixed round: strips ours, keeps the game canary", () => {
        // bit0 mmj-tab (ours), bit1 bbtn (ours), bit2 gameCanvas (game) — all matched by the client
        const probes = [probe8("a.mmj-tab"), probe8("div.bbtn"), probe8("div.gameCanvas")];
        assert.strictEqual(cleanProbeResult(0b111, probes, SALT), 0b100);
    });
} finally {
    if (prevDoc) Object.defineProperty(globalThis, "document", prevDoc); else delete globalThis.document;
}

console.log(fail === 0 ? "\n  ✓ FOOTPRINT OK (" + pass + ")" : "\n  " + fail + " FAILED (" + pass + " passed)");
process.exit(fail === 0 ? 0 : 1);
