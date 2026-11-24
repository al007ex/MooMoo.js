/*
 * Unit test for the kind-8 (elements-by-class) footprint stripper in binding.js.
 *
 * The server can probe "does any element carry class X" (a salted hash of "tag.class"). The loader
 * must clear the bit for OUR classes and keep it for a GAME class (which could be a canary the real
 * client must match). This proves it strips:
 *   - the in-game Mods tab ("a.mmj-tab") and other mmj-* / mmj-nt-* classes
 *   - unprefixed inner classes scoped under one of our containers (e.g. "div.bbtn" inside .mml-bots)
 *   - our own id'd elements (kind 4, "div#mml-gui") and the API handshake event (kind 9)
 * and does NOT clear a genuine game class, a self-ID beacon, or a per-round canary. The
 * index-3a141db7 (p=4) update makes the KEEP side the dangerous one: it ships beacons crafted to
 * look like ours — <span class="ui-mml-gap">, <div id="hmmjoin">, CustomEvent "moomoo.js:ping" —
 * plus create-and-check DOM/event canaries (div.mmc-<tag> / mmc:<tag>). The anti-cheat EXPECTS all
 * of these PRESENT, so a stripper that over-matches our namespace would flag the real client. These
 * tests pin both sides: footprint stripped, every beacon + canary kept.
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
// `closest(sel)` walks self -> parentElement returning the first node whose className LOOSELY
// contains one of our namespace fragments — exactly what the browser does for the loader's
// substring container selector "[class*='mml-'],[class*='mmj-'],...". The stripper then re-verifies
// each hit with the STRICT token/id-start predicate (ownClassOrId), so this loose closest is what
// lets the test prove the strict re-check (the ui-mml-gap / hmmjoin fix) actually matters.
const LOADER = /mml-|mmj-|mdbg|moomoojs/;   // loose substring (mirrors the CSS [class*=] container selector)
function mkEl(tag, cls, parent, id) {
    const e = { tagName: tag, className: cls || "", id: id || "", parentElement: parent || null };
    e.closest = () => { let n = e; while (n) { if (LOADER.test(String(n.className || ""))) return n; n = n.parentElement; } return null; };
    return e;
}
// Scene: the Mods tab <a class="mmj-tab">, a notice card <div class="mmj-nt-card">, the bots panel
// <div class="mml-bots"> with an unprefixed <div class="bbtn go"> inside it, and a pure game element.
const modsTab = mkEl("A", "mmj-tab");
const noticeCard = mkEl("DIV", "mmj-nt-card");
const botsRoot = mkEl("DIV", "mml-bots");
const botsBtn = mkEl("DIV", "bbtn go", botsRoot);
const mmjBody = mkEl("DIV", "mmj-body");    // the Mods tab panel (new server probe: div.mmj-body)
const mmjMod = mkEl("DIV", "mmj-mod");      // a Mods tab entry   (new server probe: div.mmj-mod)
const guiById = mkEl("DIV", "", null, "mml-gui");   // one of OUR id'd elements (kind-4 strip target)
// The GENUINE client's <body class="moomoo-io"> — a kind-8 self-ID beacon the anti-cheat EXPECTS
// present. It carries "moomoo" but is NOT ours (no mml-/mmj-/mdbg/moomoojs), so its closest() to a
// loader container is null: the stripper must leave it alone or the real client gets flagged fake.
const bodyBeacon = mkEl("BODY", "moomoo-io");
// index-3a141db7 (p=4) self-ID beacons crafted to look like ours — the stripper must KEEP them all:
//   <span class="ui-mml-gap">  CONTAINS "mml-" (so the loose container selector enumerates it) but
//                              NOT at a token start, so ownClassOrId says "not ours" -> bit kept.
//   <div id="hmmjoin">         id CONTAINS "mmj" but not at the start -> not ours -> bit kept.
//   plus a per-round DOM canary <div class="mmc-<tag>"> the real client creates and matches.
const gapBeacon = mkEl("SPAN", "ui-mml-gap");
const joinBeacon = mkEl("DIV", "", null, "hmmjoin");
const canaryDiv = mkEl("DIV", "mmc-abc123");
const LOADER_ELS = [modsTab, noticeCard, botsRoot, botsBtn, mmjBody, mmjMod, guiById, bodyBeacon, gapBeacon, joinBeacon, canaryDiv];

// telemetryGlobal() returns whichever global carries a document; give it a stub that serves our
// loader elements for the class query (and [id] query). Game elements are simply not in it.
const prevDoc = Object.getOwnPropertyDescriptor(globalThis, "document");
globalThis.document = { querySelectorAll: () => LOADER_ELS };

const SALT = 0x12345678 >>> 0;
const probe8 = (cls) => [8, "", saltedHash(cls, SALT)];        // kind 8: "tag.class", hashed
const probe4 = (sel) => [4, "", saltedHash(sel, SALT)];        // kind 4: "tag#id", hashed
const probe9 = (ev) => [9, ev, 0];                             // kind 9: CustomEvent name, cleartext

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

    // --- the index-0e02c00e anti-cheat update: direct mod-menu probes + self-ID beacons ---
    ok("strips the new mod-menu class probes (div.mmj-body, div.mmj-mod)", () => {
        assert.strictEqual(cleanProbeResult(0b1, [probe8("div.mmj-body")], SALT), 0);
        assert.strictEqual(cleanProbeResult(0b1, [probe8("div.mmj-mod")], SALT), 0);
    });

    ok("KEEPS the kind-8 client beacon body.moomoo-io — stripping it would flag the real client fake", () => {
        // <body class="moomoo-io"> is in the DOM, but it is NOT ours, so the bit must survive
        assert.strictEqual(cleanProbeResult(0b1, [probe8("body.moomoo-io")], SALT), 1);
    });

    ok("KEEPS the kind-9 client beacon moomoo.io:ready, strips only our own moomoo.js: events", () => {
        assert.strictEqual(cleanProbeResult(0b1, [probe9("moomoo.io:ready")], SALT), 1);   // beacon kept
        assert.strictEqual(cleanProbeResult(0b1, [probe9("moomoo.js:api")], SALT), 0);     // our handshake stripped
    });

    ok("full p=2 round: strip the mod menu, keep BOTH self-ID beacons", () => {
        // bit0 div.mmj-body (ours -> strip), bit1 body.moomoo-io (beacon -> keep), bit2 moomoo.io:ready (beacon -> keep)
        const probes = [probe8("div.mmj-body"), probe8("body.moomoo-io"), probe9("moomoo.io:ready")];
        assert.strictEqual(cleanProbeResult(0b111, probes, SALT), 0b110);
    });

    // --- index-3a141db7 (p=4): beacon traps crafted to look like ours + create-and-check canaries ---
    // The three new self-ID beacons sit RIGHT in the loader's namespace as traps; the anti-cheat
    // EXPECTS them present (an `expect` probe fires on ABSENCE). A loose matcher would strip them, the
    // server would see them missing, and the real client gets flagged fake. The strict token/id-start
    // predicate (plus the ancestor re-check in loaderOwnedElement) must leave every one in place.
    ok("KEEPS the p=4 beacon span.ui-mml-gap — 'mml-' is a substring, not a token start", () => {
        assert.strictEqual(cleanProbeResult(0b1, [probe8("span.ui-mml-gap")], SALT), 1);
    });

    ok("KEEPS the p=4 beacon div#hmmjoin (kind 4) — id contains 'mmj' but not at the start", () => {
        assert.strictEqual(cleanProbeResult(0b1, [probe4("div#hmmjoin")], SALT), 1);
    });

    ok("KEEPS the p=4 beacon moomoo.js:ping (kind 9) — our namespace, but not the api handshake", () => {
        assert.strictEqual(cleanProbeResult(0b1, [probe9("moomoo.js:ping")], SALT), 1);
    });

    ok("KEEPS the per-round DOM canary div.mmc-<tag> (k8) + event canary mmc:<tag> (k9)", () => {
        assert.strictEqual(cleanProbeResult(0b1, [probe8("div.mmc-abc123")], SALT), 1);
        assert.strictEqual(cleanProbeResult(0b1, [probe9("mmc:abc123")], SALT), 1);
    });

    ok("STILL strips our own id'd element div#mml-gui (k4) and the api handshake moomoo.js:api (k9)", () => {
        assert.strictEqual(cleanProbeResult(0b1, [probe4("div#mml-gui")], SALT), 0);
        assert.strictEqual(cleanProbeResult(0b1, [probe9("moomoo.js:api")], SALT), 0);
    });

    ok("full p=4 round: strip ONLY the mod menu, keep all 5 beacons + both canaries", () => {
        // bit0 div.mmj-body (ours -> strip); bits 1-5 the five beacons; bits 6-7 the two canaries.
        const probes = [
            probe8("div.mmj-body"),     // 0  ours        -> strip
            probe8("body.moomoo-io"),   // 1  beacon p>=2 -> keep
            probe9("moomoo.io:ready"),  // 2  beacon p>=2 -> keep
            probe8("span.ui-mml-gap"),  // 3  beacon p>=4 -> keep
            probe4("div#hmmjoin"),      // 4  beacon p>=4 -> keep
            probe9("moomoo.js:ping"),   // 5  beacon p>=4 -> keep
            probe8("div.mmc-abc123"),   // 6  DOM canary  -> keep
            probe9("mmc:abc123")        // 7  event canary-> keep
        ];
        // client matched all eight (0xFF); the loader clears only bit0 -> 0xFE
        assert.strictEqual(cleanProbeResult(0xFF, probes, SALT), 0xFE);
    });
} finally {
    if (prevDoc) Object.defineProperty(globalThis, "document", prevDoc); else delete globalThis.document;
}

console.log(fail === 0 ? "\n  ✓ FOOTPRINT OK (" + pass + ")" : "\n  " + fail + " FAILED (" + pass + " passed)");
process.exit(fail === 0 ? 0 : 1);
