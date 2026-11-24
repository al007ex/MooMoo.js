/*
 * USER SCRIPT UNDETECTION (live, real index-3a141db7 client, p=4, anti-cheat ON)
 * =============================================================================
 * Loads the loader + a user mod script (SCRIPT_PATH, default ~/Downloads/message.txt) + the real
 * p=4 client, then makes the anti-cheat HUNT the script's own footprint: an always-on kind-1
 * window-property probe for every global the script exposes (plus a kind-3 probe for its diagnostics
 * storage key). A probe that MATCHES and reaches the server flags the client, so this proves whether
 * the loader hides the script's footprint. It also logs each probe round and checks the real p=4
 * beacons/canaries/checksum stay clean.
 *
 * Run:  MOOMOO_SERVER_DIR=/path/to/moomoo-clone \
 *       SCRIPT_PATH=/Users/.../Downloads/message.txt node tests/live/ac-script.live.mjs
 *       (HEADFUL=1 to watch, ROUNDS=n, LIVE_ECHO=1 to echo the server log)
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { available, startServer, loginFull, loadPuppeteer, chromePath, chromeArgs } from "./live-server.mjs";
import { tick } from "./live-client.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, "..", "..");
if (!available) { console.log("SKIP ac-script.live: server dir not found (set MOOMOO_SERVER_DIR)"); process.exit(0); }

const SCRIPT_PATH = process.env.SCRIPT_PATH || path.join(os.homedir(), "Downloads", "message.txt");
if (!fs.existsSync(SCRIPT_PATH)) { console.log("SKIP ac-script.live: script not found at " + SCRIPT_PATH + " (set SCRIPT_PATH)"); process.exit(0); }

const LOADER = fs.readFileSync(path.join(ROOT, "loader", "dist", "moomoo-loader.user.js"), "utf8");
const SCRIPT = fs.readFileSync(SCRIPT_PATH, "utf8");
const PLAYER = { email: "live-acscript@moomoojs.test", password: "local-test" };
const WANT_ROUNDS = Math.max(2, Number(process.env.ROUNDS) || 3);

// The window globals this script exposes — the anti-cheat hunts every one with an always-on kind-1
// probe. The loader must hide them (none may reach the server's probe result).
const SCRIPT_GLOBALS = [
    "AntimoocheatCore", "AntimoocheatCombat", "AntimoocheatBots", "AntimoocheatDefense",
    "AntimoocheatEquipment", "AntimoocheatBasePlacement", "AntimoocheatPlacementHost", "AntimoocheatWorld",
    "AntimoocheatIndicators", "AntimoocheatVisuals", "AntimoocheatConnectionLog", "AntimoocheatDiagnostics",
    "AntimoocheatActionFlow", "AntimoocheatLiveClock", "AntimoocheatPacketBudget", "AntimoocheatPathVisual",
    "AntimoocheatResourceBalance", "AntimoocheatSwapPlanners", "AntimoocheatVisualMotion",
    "MooMooCombatMacros", "MooMooThreats", "MooMooAutoReload", "MooMooAutomation", "MooMooBaseClicks",
    "MooMooCombatDefense", "MooMooActionIntent", "MooMooOpportunities", "MooMooSafewalk", "MooMooPlacers",
    "MooMooManualAutoaim", "MooMooDefenses", "MooMooFacing", "MooMooPerfectBoostTick", "MooMooRangedAutoSync",
    "MooMooAutoGrind", "MooMooHealObserver", "MooMooAutomaticFacing", "MooMooNativeCombat", "MooMooMisc",
    "MooMooAutoGrind"
];
const GLOBAL_PROBES = SCRIPT_GLOBALS.map((name) => ({ kind: 1, path: "window", value: name, name: "SCRIPT_GLOBAL:" + name, action: "flag", always: true, minP: 2 }));
const STORE_PROBE = [{ kind: 3, value: "antimoocheat.connection.v1", name: "SCRIPT_STORE", action: "flag", minP: 2 }];
const HUNT = [...GLOBAL_PROBES, ...STORE_PROBE];

let pass = 0, fail = 0;
const check = (name, cond, detail) => { if (cond) { pass++; console.log("  ✓ " + name + (detail ? "  " + detail : "")); } else { fail++; console.log("  ✗ " + name + (detail ? "  " + detail : "")); } };
const FAST = "ANTICHEAT_CONFIG.telemetry.firstProbeMs = 1500; ANTICHEAT_CONFIG.telemetry.intervalMs = 3000;";

const srv = await startServer({ echo: !!process.env.LIVE_ECHO, env: {}, anticheatProbes: HUNT, anticheatConfigJs: FAST });
console.log("live server on " + srv.base + "   (real p=4 anti-cheat + " + HUNT.length + " footprint-hunting probes)\n");

let browser, wsClosed = false;
try {
    const puppeteer = loadPuppeteer();
    const exe = chromePath();
    if (!exe) { console.log("SKIP ac-script.live: no Chrome found (set CHROME_PATH)"); await srv.stop(); process.exit(0); }
    browser = await puppeteer.launch({ executablePath: exe, headless: process.env.HEADFUL ? false : true, args: chromeArgs() });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push(String(e && e.message || e).slice(0, 160)));
    const cdp = await page.createCDPSession();
    await cdp.send("Network.enable");
    const socks = new Map();
    cdp.on("Network.webSocketCreated", (e) => socks.set(e.requestId, e.url));
    cdp.on("Network.webSocketClosed", (e) => { if ((socks.get(e.requestId) || "").includes("/s/")) wsClosed = true; });

    const session = await loginFull(srv, PLAYER.email, PLAYER.password);
    await page.evaluateOnNewDocument((s) => { try { localStorage.setItem("moo_local_frvr_session", JSON.stringify(s)); } catch (e) {} }, session);
    await page.evaluateOnNewDocument(LOADER);
    await page.evaluateOnNewDocument(() => { function g() { try { window.dispatchEvent(new CustomEvent("moomoo.js:api", { detail: { resolve: (m, l) => { window.MooMoo = m; window.MooMooLoader = l; } } })); } catch (e) {} } g(); if (!window.MooMoo) window.addEventListener("moomoo.js:ready", g, false); });
    await page.evaluateOnNewDocument(SCRIPT);   // the user's mod script
    await page.evaluateOnNewDocument(() => {
        window.__q = []; window.__t = [];
        const hook = () => {
            if (!window.MooMooLoader || !window.MooMooLoader.onRaw) return false;
            window.MooMooLoader.onRaw((dir, name, args) => {
                if (dir === "in" && name === "q") window.__q.push({ salt: args[0] >>> 0, probes: (args[1] || []).map((p) => p.slice ? p.slice() : p) });
                if (dir === "out" && name === "T") window.__t.push(args.slice());
            });
            return true;
        };
        if (!hook()) { const iv = setInterval(() => { if (hook()) clearInterval(iv); }, 30); }
    });

    await page.goto(srv.base + "/", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#enterGame", { visible: true, timeout: 20000 });
    await tick(1500);
    await page.click("#nameInput", { clickCount: 3 }).catch(() => {});
    await page.type("#nameInput", "acs").catch(() => {});
    await page.click("#enterGame");
    await page.waitForFunction(() => window.MooMoo && window.MooMoo.self && window.MooMoo.self.alive, { timeout: 25000 });
    await page.evaluate(() => { try { document.activeElement && document.activeElement.blur(); } catch (e) {} });
    await tick(500);

    const deadline = Date.now() + (WANT_ROUNDS * 6000 + 12000);
    for (;;) { const n = await page.evaluate(() => (window.__t || []).length); if (n >= WANT_ROUNDS || Date.now() > deadline) break; await tick(1000); }

    const data = await page.evaluate((globals) => {
        const sh = (text, salt) => { let h = (2166136261 ^ (salt >>> 0)) >>> 0; for (let i = 0; i < text.length; i++) h = Math.imul(h ^ (text.charCodeAt(i) & 255), 16777619); h ^= h >>> 15; h = Math.imul(h, 739982445); h ^= h >>> 12; return h >>> 0; };
        const ad = window.MooMooLoader.antiDetect;
        const T = window.__t || [], Q = window.__q || [], L = ad.log || [];
        const qBySalt = new Map(Q.map((q) => [q.salt >>> 0, q]));
        const presentGlobals = globals.filter((g) => { try { return g in window; } catch (e) { return false; } });
        const rounds = [];
        for (let i = 0; i < T.length; i++) {
            const t = T[i], salt = t[4] >>> 0, q = qBySalt.get(salt); if (!q) continue;
            const entry = L[i] || null;
            const clientResult = entry ? (entry.probeResult >>> 0) : null;
            const sentResult = entry ? (entry.sentProbeResult >>> 0) : (t[2] >>> 0);
            // which script-global probes did the client match, and did the loader strip them?
            const leaked = [], hiddenCount = { v: 0 };
            if (clientResult != null) q.probes.forEach((p, bit) => {
                if (p[0] !== 1) return;
                const matchedGlobal = globals.find((g) => sh(g, salt) === (p[2] >>> 0));
                if (!matchedGlobal) return;
                const matched = (clientResult & (1 << bit)) !== 0, sent = (sentResult & (1 << bit)) !== 0;
                if (matched && sent) leaked.push(matchedGlobal);
                else if (matched && !sent) hiddenCount.v++;
            });
            const flagsRaw = t[0] >>> 0, realFlags = flagsRaw & 0x3FF, checksum = (flagsRaw >>> 12) & 0xFF, expectCk = (sh("flags", salt) & 255) || 1;
            rounds.push({ salt, nProbes: q.probes.length, clientResult, sentResult, leaked, hidden: hiddenCount.v, realFlags, checksum, expectCk, checksumOk: checksum === expectCk, flagsClean: realFlags === 0 });
        }
        return {
            rounds, presentGlobals, nGlobals: globals.length,
            healthy: ad.healthy, warningCount: ad.warningCount, warnings: (ad.warnings || []).map((w) => ({ type: w.type, kind: w.kind })),
            hasHideGlobals: typeof window.MooMooLoader.hideGlobals === "function",
            modsRegistered: (() => { try { return (window.MooMoo.getMods() || []).length; } catch (e) { return -1; } })()
        };
    }, SCRIPT_GLOBALS);

    console.log("script loaded: " + data.presentGlobals.length + "/" + data.nGlobals + " hunted globals present on window; " + data.modsRegistered + " mods registered; loader.hideGlobals=" + data.hasHideGlobals);
    console.log("page errors: " + (pageErrors.length ? JSON.stringify(pageErrors.slice(0, 4)) : "none") + "\n");
    data.rounds.forEach((r, i) => {
        console.log("ROUND " + (i + 1) + "  salt=0x" + r.salt.toString(16).padStart(8, "0") + "  " + r.nProbes + " probes   client=0x" + (r.clientResult >>> 0).toString(16) + " → sent=0x" + (r.sentResult >>> 0).toString(16));
        console.log("   script globals: hidden=" + r.hidden + (r.leaked.length ? "   ✗ LEAKED [" + r.leaked.join(", ") + "]" : "   leaked=0"));
        console.log("   flags realFlags=" + r.realFlags + " checksum " + (r.checksumOk ? "valid" : "INVALID") + "\n");
    });

    const inc = srv.incidents().filter((l) => /player/.test(l) && !/leave sid/.test(l));

    console.log("─────────────── VERDICT ───────────────");
    check("the script loaded (globals present + mods registered, no fatal page error)", data.presentGlobals.length > 5 && data.modsRegistered > 0, "globals=" + data.presentGlobals.length + " mods=" + data.modsRegistered + " errors=" + pageErrors.length);
    check("collected at least " + WANT_ROUNDS + " probe rounds", data.rounds.length >= WANT_ROUNDS, "rounds=" + data.rounds.length);
    check("the client MATCHED the hunted globals (the hunt is real)", data.rounds.some((r) => r.hidden > 0 || r.leaked.length > 0), "hidden/round=" + data.rounds.map((r) => r.hidden).join(","));
    check("NONE of the script's window globals leaked to the server", data.rounds.every((r) => r.leaked.length === 0), "leaked/round=" + data.rounds.map((r) => r.leaked.length).join(","));
    check("every T: clean real flags (0) + valid salt-bound checksum", data.rounds.every((r) => r.flagsClean && r.checksumOk), "");
    check("loader self-protection healthy, no residual-footprint / unknown-kind warnings", data.healthy === true && !data.warnings.some((w) => w.type === "residual-footprint" || w.type === "dom-blind"), "warnings=" + JSON.stringify(data.warnings));
    check("no socket close / no kick", !wsClosed, "wsClosed=" + wsClosed);
    check("no anti-cheat incident on the server (script fully hidden)", inc.length === 0, JSON.stringify(inc.slice(0, 6)));
} catch (e) { fail++; console.log("  ✗ ERROR " + (e && e.stack || e)); }
finally { try { browser && await browser.close(); } catch (_) {} await srv.stop(); }

console.log(fail === 0 ? "\n  ✓ SCRIPT UNDETECTED — every hunted global hidden, telemetry clean (" + pass + " checks)" : "\n  " + fail + " CHECK(S) FAILED (" + pass + " passed)");
process.exit(fail === 0 ? 0 : 1);
