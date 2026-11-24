/*
 * KIND 8 + 9 UNDETECTION + SELF-PROTECTION (live, real bundle index-3a141db7, p=4)
 * ===========================================================================
 * The anticheat added two probe kinds that target the loader's evasion tricks:
 *   kind 8 — elements by class ("tag.class"): our class-only menu / debug panel
 *   kind 9 — CustomEvent(path) a listener resolves: the loader's "moomoo.js:api" handshake
 * We add real kind-8/9 probes (action: kick) for our own signatures, then prove the client
 * MATCHES them (so the footprint is real) but the loader STRIPS those bits from "T", so the
 * server sees a clean probe result and never kicks. This also guards the telemetryGlobal fix
 * (the loader's bundle wrapper shadows self/globalThis, so the sanitiser must reach the real
 * window to enumerate our elements).
 *
 * It ALSO exercises the loader's self-protection: we add a probe of an UNKNOWN kind (10) the
 * sanitiser has no rule for, and prove the loader notices — antiDetect raises an "unknown-kind"
 * warning — while staying `healthy` (its telemetry global still sees the page), so next time the
 * anticheat ships a new trick the loader shouts instead of silently leaking footprint.
 *
 * Run:  MOOMOO_SERVER_DIR=/path/to/moomoo-clone-main node tests/live/kind89.live.test.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { available, startServer, loginFull, loadPuppeteer, chromePath, chromeArgs } from "./live-server.mjs";
import { tick } from "./live-client.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, "..", "..");
if (!available) { console.log("SKIP (no server dir)"); process.exit(0); }

const LOADER = fs.readFileSync(path.join(ROOT, "loader", "dist", "moomoo-loader.user.js"), "utf8");
const LITE = fs.readFileSync(path.join(ROOT, "mods", "lite.js"), "utf8");
const ACMON = fs.readFileSync(path.join(ROOT, "mods", "ac-monitor.user.js"), "utf8");
const PLAYER = { email: "live-lite@moomoojs.test", password: "local-test" };
// Footprint probes that exist because of the loader/lite — the loader must STRIP every one so none
// reaches the server. `always: true` (minP: 2, so a p>=2 client rides EVERY round) so the stripping
// is reliably exercised instead of being lost in the shuffle. action "kick": if the loader leaks ANY
// of these the server drops the socket — a hard bypass proof. They ride alongside the real config's
// p=4 self-ID beacons (body.moomoo-io, moomoo.io:ready, span.ui-mml-gap, div#hmmjoin, moomoo.js:ping)
// and the per-round DOM/event canary, all of which the loader must KEEP — a stripped beacon/canary
// fires the server's `expect` check and raises an incident, so "no incident" guards that side.
const PROBES = [
    { kind: 8, minP: 2, value: "div.mml-gui", name: "MML_MENU", action: "kick", always: true },
    { kind: 8, minP: 2, value: "div.mdbg", name: "MML_DEBUG", action: "kick", always: true },
    { kind: 8, minP: 2, value: "a.mmj-tab", name: "MML_MODSTAB", action: "kick", always: true },
    { kind: 8, minP: 2, value: "div.mmj-body", name: "MML_MODMENU", action: "kick", always: true },
    { kind: 9, minP: 2, path: "moomoo.js:api", name: "MML_HANDSHAKE", action: "kick", always: true },
    // A probe KIND the loader has no rule for (a stand-in for the next anticheat trick). The client
    // can't evaluate it either, so it never matches — but the loader must still NOTICE it. `always`
    // so the self-protection warning fires reliably every round.
    { kind: 10, path: "future.sig", value: "div.mml-gui", name: "FUTURE_PROBE", action: "flag", always: true }
];

let pass = 0, fail = 0;
const check = (name, cond, detail) => { if (cond) { pass++; console.log("  ✓ " + name); } else { fail++; console.log("  ✗ " + name + (detail ? "  " + detail : "")); } };
// the server/client/loader FNV salted hash — to verify the salt-bound flags checksum in each "T".
const sh = (text, salt) => { let h = (2166136261 ^ (salt >>> 0)) >>> 0; for (let i = 0; i < text.length; i++) h = Math.imul(h ^ (text.charCodeAt(i) & 255), 16777619); h ^= h >>> 15; h = Math.imul(h, 739982445); h ^= h >>> 12; return h >>> 0; };

// Shorten the 60 s probe interval so a couple of rounds ride through in the test window.
const srv = await startServer({ env: {}, anticheatProbes: PROBES, anticheatConfigJs: "ANTICHEAT_CONFIG.telemetry.firstProbeMs = 1500; ANTICHEAT_CONFIG.telemetry.intervalMs = 3000;" });
let browser, wsClosed = false;
try {
    const puppeteer = loadPuppeteer();
    browser = await puppeteer.launch({ executablePath: chromePath(), headless: process.env.HEADFUL ? false : true, args: chromeArgs() });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    const cdp = await page.createCDPSession();
    await cdp.send("Network.enable");
    const socks = new Map();
    cdp.on("Network.webSocketCreated", (e) => socks.set(e.requestId, e.url));
    cdp.on("Network.webSocketClosed", (e) => { if ((socks.get(e.requestId) || "").includes("/s/")) wsClosed = true; });
    const session = await loginFull(srv, PLAYER.email, PLAYER.password);
    await page.evaluateOnNewDocument((s) => { try { localStorage.setItem("moo_local_frvr_session", JSON.stringify(s)); } catch (e) {} }, session);
    await page.evaluateOnNewDocument(LOADER);
    await page.evaluateOnNewDocument(() => { function g() { try { window.dispatchEvent(new CustomEvent("moomoo.js:api", { detail: { resolve: (m, l) => { window.MooMoo = m; window.MooMooLoader = l; } } })); } catch (e) {} } g(); if (!window.MooMoo) window.addEventListener("moomoo.js:ready", g, false); });
    await page.evaluateOnNewDocument(LITE);
    await page.evaluateOnNewDocument(ACMON);
    await page.evaluateOnNewDocument(() => { window.__q = []; window.__t = []; const hook = () => { if (!window.MooMooLoader || !window.MooMooLoader.onRaw) return false; window.MooMooLoader.onRaw((dir, name, args) => { if (dir === "in" && name === "q") window.__q.push(args); if (dir === "out" && name === "T") window.__t.push(args); }); return true; }; if (!hook()) { const iv = setInterval(() => { if (hook()) clearInterval(iv); }, 30); } });
    await page.goto(srv.base + "/", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#enterGame", { visible: true, timeout: 20000 });
    await tick(1500);
    await page.click("#nameInput", { clickCount: 3 }).catch(() => {});
    await page.type("#nameInput", "k89").catch(() => {});
    await page.click("#enterGame");
    await page.waitForFunction(() => window.MooMoo && window.MooMoo.self && window.MooMoo.self.alive, { timeout: 25000 });
    await page.evaluate(() => { try { document.activeElement && document.activeElement.blur(); } catch (e) {} });
    await page.keyboard.press("o"); await tick(400);   // open the lite menu so .mml-gui exists
    await tick(10000);                                  // first probe round ~5s after spawn + its "T"

    const r = await page.evaluate(() => {
        const ad = window.MooMooLoader.antiDetect;
        const rounds = (window.__q || []).map((a) => { const p = a[1] || []; return { k8: p.filter(x => x[0] === 8).length, k9: p.filter(x => x[0] === 9).length, k10: p.filter(x => x[0] === 10).length }; });
        return {
            probedK8: rounds.some(r => r.k8 > 0), probedK9: rounds.some(r => r.k9 > 0), probedK10: rounds.some(r => r.k10 > 0),
            menu: !!document.querySelector(".mml-gui"), panel: !!document.querySelector(".mdbg"),
            modsTab: !!document.querySelector(".mmj-tab"),
            seen: (ad.log || []).map(e => e.probeResult), sent: (ad.log || []).map(e => e.sentProbeResult),
            stripped: (ad.log || []).map(e => e.strippedProbe),
            outFlags: (window.__t || []).map(a => a[0]), salts: (window.__t || []).map(a => a[4]),
            healthy: ad.healthy, warningCount: ad.warningCount,
            warnings: (ad.warnings || []).map(w => ({ type: w.type, kind: w.kind }))
        };
    });
    const inc = srv.incidents().filter((l) => /player/.test(l) && !/leave sid/.test(l));

    check("server sends kind-8 probes (class signatures)", r.probedK8, JSON.stringify(r));
    check("server sends a kind-9 probe (handshake event)", r.probedK9);
    check("our footprint is present (.mml-gui + .mdbg + the mmj- Mods tab)", r.menu && r.panel && r.modsTab, "menu=" + r.menu + " panel=" + r.panel + " modsTab=" + r.modsTab);
    check("the client matched our footprint, so stripping is really exercised", r.stripped.length > 0 && r.stripped.some((s) => (s >>> 0) !== 0), "stripped=" + JSON.stringify(r.stripped.map((s) => (s >>> 0).toString(16))));
    // A leaked footprint bit (kick-action probes) would drop the socket; a stripped beacon/canary
    // (the config's `expect` probes) would raise a server incident. So "no kick" + "no incident"
    // together prove the loader kept every beacon/canary and stripped every footprint bit.
    check("the loader strips ALL footprint — no kick from the kick-action probes", !wsClosed, "wsClosed=" + wsClosed);
    check("every outgoing T reports clean real flags (0) + a VALID salt-bound checksum (p=4)", r.outFlags.length > 0 && r.outFlags.every((f, i) => ((f >>> 0) & 0x3FF) === 0 && (((f >>> 0) >>> 12) & 0xFF) === ((sh("flags", r.salts[i] >>> 0) & 255) || 1)), "flags=" + JSON.stringify(r.outFlags.map((f) => (f >>> 0).toString(16))) + " salts=" + JSON.stringify(r.salts.map((s) => (s >>> 0).toString(16))));
    check("the loader kept every self-ID beacon + canary — no anti-cheat incident on the server", inc.length === 0, JSON.stringify(inc));
    // self-protection
    check("server sends the unknown-kind (10) probe", r.probedK10, JSON.stringify(r));
    check("the loader NOTICED the unknown kind (self-protection warning)", r.warnings.some((w) => w.type === "unknown-kind" && w.kind === 10), "warnings=" + JSON.stringify(r.warnings));
    check("the sanitiser stayed healthy (telemetry global still sees the page)", r.healthy === true, "healthy=" + r.healthy);
    check("no residual-footprint warning (every known-kind bit was stripped)", !r.warnings.some((w) => w.type === "residual-footprint"), "warnings=" + JSON.stringify(r.warnings));
} catch (e) { fail++; console.log("  ✗ ERROR " + (e && e.stack || e)); }
finally { try { browser && await browser.close(); } catch (_) {} await srv.stop(); }

console.log(fail === 0 ? "\n  ✓ KIND 8/9 UNDETECTION OK (" + pass + ")" : "\n  " + fail + " FAILED (" + pass + " passed)");
process.exit(fail === 0 ? 0 : 1);
