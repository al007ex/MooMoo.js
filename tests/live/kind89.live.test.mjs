/*
 * KIND 8 + 9 UNDETECTION + SELF-PROTECTION (live, real bundle index-332036b9)
 * ===========================================================================
 * The 1.9.4 anticheat added two probe kinds that target the loader's evasion tricks:
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
const PROBES = [
    { kind: 8, path: "", value: "div.mml-gui", name: "MML_MENU", action: "kick" },
    { kind: 8, path: "", value: "div.mdbg", name: "MML_DEBUG", action: "kick" },
    { kind: 9, path: "moomoo.js:api", name: "MML_LOADER", action: "kick" },
    // A probe KIND the loader has no rule for (a stand-in for the next anticheat trick). The
    // client can't evaluate it either, so it never matches — but the loader must still NOTICE it.
    { kind: 10, path: "future.sig", value: "div.mml-gui", name: "FUTURE_PROBE", action: "flag" }
];

let pass = 0, fail = 0;
const check = (name, cond, detail) => { if (cond) { pass++; console.log("  ✓ " + name); } else { fail++; console.log("  ✗ " + name + (detail ? "  " + detail : "")); } };

const srv = await startServer({ env: {}, anticheatProbes: PROBES });
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
            seen: (ad.log || []).map(e => e.probeResult), sent: (ad.log || []).map(e => e.sentProbeResult),
            outT: (window.__t || []).map(a => a[2]),
            healthy: ad.healthy, warningCount: ad.warningCount,
            warnings: (ad.warnings || []).map(w => ({ type: w.type, kind: w.kind }))
        };
    });
    const inc = srv.incidents().filter((l) => /player/.test(l) && !/leave sid/.test(l));

    check("server sends kind-8 probes (class signatures)", r.probedK8, JSON.stringify(r));
    check("server sends a kind-9 probe (handshake event)", r.probedK9);
    check("our footprint is present (.mml-gui + .mdbg)", r.menu && r.panel);
    check("the client DID match our footprint (test is meaningful)", r.seen.some((x) => x && x !== 0), "seen=" + JSON.stringify(r.seen));
    check("the loader strips it: every outgoing T probeResult is 0", r.outT.length > 0 && r.outT.every((p) => p === 0), "outT=" + JSON.stringify(r.outT));
    check("antiDetect reports a clean sent probe result", r.sent.every((p) => p === 0), "sent=" + JSON.stringify(r.sent));
    check("no socket close / no kick", !wsClosed, "wsClosed=" + wsClosed);
    check("no anti-cheat incident on the server", inc.length === 0, JSON.stringify(inc));
    // self-protection
    check("server sends the unknown-kind (10) probe", r.probedK10, JSON.stringify(r));
    check("the loader NOTICED the unknown kind (self-protection warning)", r.warnings.some((w) => w.type === "unknown-kind" && w.kind === 10), "warnings=" + JSON.stringify(r.warnings));
    check("the sanitiser stayed healthy (telemetry global still sees the page)", r.healthy === true, "healthy=" + r.healthy);
    check("no residual-footprint warning (every known-kind bit was stripped)", !r.warnings.some((w) => w.type === "residual-footprint"), "warnings=" + JSON.stringify(r.warnings));
} catch (e) { fail++; console.log("  ✗ ERROR " + (e && e.stack || e)); }
finally { try { browser && await browser.close(); } catch (_) {} await srv.stop(); }

console.log(fail === 0 ? "\n  ✓ KIND 8/9 UNDETECTION OK (" + pass + ")" : "\n  " + fail + " FAILED (" + pass + " passed)");
process.exit(fail === 0 ? 0 : 1);
