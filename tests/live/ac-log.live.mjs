/*
 * ANTI-CHEAT PROBE + TELEMETRY LOG  (live, REAL index-3a141db7 client, p=4, anti-cheat ON)
 * =======================================================================================
 * The "anti-cheat log script": it boots the real private server, loads the REAL p=4 client
 * with the loader + MooMod (lite) + the debug monitor (ac-monitor), plays several integrity-
 * probe rounds, and LOGS EVERY PROBE and EVERY telemetry answer — decoded and classified —
 * then prints a 100%-BYPASS verdict.
 *
 * For each incoming "q" round it logs the salt, a kind histogram, the q[2] create-and-check
 * canaries, and classifies every probe as one of:
 *     beacon     — a self-identification probe the anti-cheat expects PRESENT (fires on ABSENCE):
 *                  body.moomoo-io, moomoo.io:ready (p>=2) and span.ui-mml-gap, div#hmmjoin,
 *                  moomoo.js:ping (p>=4). The loader MUST keep these.
 *     canary     — a per-round DOM/event probe the client creates then matches (div.mmc-<tag> /
 *                  mmc:<tag>). The loader MUST keep these too.
 *     footprint  — a probe that matches only because of the loader / a mod (div.mml-gui, div.mdbg,
 *                  a.mmj-tab, div.mmj-body/mmj-mod, the moomoo.js:api handshake). The loader MUST
 *                  strip these.
 *     env        — an environment canary (window props, native fns, constructors, storage, game
 *                  elements) — passes straight through.
 * For each outgoing "T" it logs the real integrity flags (must be 0), the salt-bound checksum
 * (bits 12-19, must be valid) and, per probe, what the client MATCHED vs what the loader SENT —
 * proving every beacon + canary survives and every footprint bit is cleared.
 *
 * A few always-on footprint probes (div.mml-gui / div.mdbg / a.mmj-tab / moomoo.js:api — all
 * genuine loader/mod signatures) are appended so the STRIP path is exercised on every round and
 * shows in the log; the real p=4 beacons + canaries come from the server's own config untouched.
 *
 * Run:  MOOMOO_SERVER_DIR=/path/to/moomoo-clone node tests/live/ac-log.live.mjs
 *       (HEADFUL=1 to watch, ROUNDS=n rounds to wait for, LIVE_ECHO=1 to echo the server log)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { available, startServer, loginFull, loadPuppeteer, chromePath, chromeArgs } from "./live-server.mjs";
import { tick } from "./live-client.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, "..", "..");
if (!available) { console.log("SKIP ac-log.live: server dir not found (set MOOMOO_SERVER_DIR)"); process.exit(0); }

const LOADER = fs.readFileSync(path.join(ROOT, "loader", "dist", "moomoo-loader.user.js"), "utf8");
const LITE = fs.readFileSync(path.join(ROOT, "mods", "lite.js"), "utf8");
const ACMON = fs.readFileSync(path.join(ROOT, "mods", "ac-monitor.user.js"), "utf8");
const PLAYER = { email: "live-aclog@moomoojs.test", password: "local-test" };
const WANT_ROUNDS = Math.max(2, Number(process.env.ROUNDS) || 3);

// Always-on probes targeting REAL loader/mod footprint, so the strip path is logged every round.
// `flag` (not `kick`): a leak surfaces as a server incident we can SEE, instead of a dropped socket.
const FOOTPRINT_PROBES = [
    { kind: 8, minP: 2, value: "div.mml-gui", name: "MML_MENU", action: "flag", always: true },
    { kind: 8, minP: 2, value: "div.mdbg", name: "MML_DEBUG", action: "flag", always: true },
    { kind: 8, minP: 2, value: "a.mmj-tab", name: "MML_MODSTAB", action: "flag", always: true },
    { kind: 9, minP: 2, path: "moomoo.js:api", name: "MML_HANDSHAKE", action: "flag", always: true }
];

let pass = 0, fail = 0;
const check = (name, cond, detail) => { if (cond) { pass++; console.log("  ✓ " + name + (detail ? "  " + detail : "")); } else { fail++; console.log("  ✗ " + name + (detail ? "  " + detail : "")); } };

// Real probe rounds are 60 s apart; shorten the interval so we capture several rounds (each with a
// fresh salt + canary) in a few seconds. Everything else about the anti-cheat is the untouched config.
const FAST_PROBES = "ANTICHEAT_CONFIG.telemetry.firstProbeMs = 1500; ANTICHEAT_CONFIG.telemetry.intervalMs = 3000;";
const srv = await startServer({ echo: !!process.env.LIVE_ECHO, env: {}, anticheatProbes: FOOTPRINT_PROBES, anticheatConfigJs: FAST_PROBES });
console.log("live server on " + srv.base + "   (real p=4 anti-cheat + " + FOOTPRINT_PROBES.length + " always-on footprint probes)\n");

let browser, wsClosed = false;
try {
    const puppeteer = loadPuppeteer();
    const exe = chromePath();
    if (!exe) { console.log("SKIP ac-log.live: no Chrome found (set CHROME_PATH)"); await srv.stop(); process.exit(0); }
    browser = await puppeteer.launch({ executablePath: exe, headless: process.env.HEADFUL ? false : true, args: chromeArgs() });
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
    // Tap every incoming probe round ("q") and every outgoing telemetry ("T").
    await page.evaluateOnNewDocument(() => {
        window.__q = []; window.__t = [];
        const hook = () => {
            if (!window.MooMooLoader || !window.MooMooLoader.onRaw) return false;
            window.MooMooLoader.onRaw((dir, name, args) => {
                if (dir === "in" && name === "q") window.__q.push({ salt: args[0] >>> 0, probes: (args[1] || []).map((p) => p.slice ? p.slice() : p), canaries: (args[2] || []).map((c) => c.slice ? c.slice() : c) });
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
    await page.type("#nameInput", "aclog").catch(() => {});
    await page.click("#enterGame");
    await page.waitForFunction(() => window.MooMoo && window.MooMoo.self && window.MooMoo.self.alive, { timeout: 25000 });
    await page.evaluate(() => { try { document.activeElement && document.activeElement.blur(); } catch (e) {} });
    await page.keyboard.press("o"); await tick(400);   // open the lite menu so .mml-gui footprint exists

    // Wait until we've collected WANT_ROUNDS telemetry answers (one per probe round, ~5s apart).
    const deadline = Date.now() + (WANT_ROUNDS * 6000 + 12000);
    for (;;) {
        const n = await page.evaluate(() => (window.__t || []).length);
        if (n >= WANT_ROUNDS || Date.now() > deadline) break;
        await tick(1000);
    }

    const data = await page.evaluate(() => {
        // the server/client/loader FNV salted hash — lets us name the hashed kind-8/4 probes.
        const sh = (text, salt) => { let h = (2166136261 ^ (salt >>> 0)) >>> 0; for (let i = 0; i < text.length; i++) h = Math.imul(h ^ (text.charCodeAt(i) & 255), 16777619); h ^= h >>> 15; h = Math.imul(h, 739982445); h ^= h >>> 12; return h >>> 0; };
        const BEACON8 = ["body.moomoo-io", "span.ui-mml-gap"];
        const BEACON4 = ["div#hmmjoin"];
        const BEACON9 = ["moomoo.io:ready", "moomoo.js:ping"];
        const FOOT8 = ["div.mml-gui", "div.mdbg", "a.mmj-tab", "div.mmj-body", "div.mmj-mod", "div.mml-bots", "div.mmj-nt-card"];
        const FOOT9 = ["moomoo.js:api"];
        const classify = (p, salt, canarySels) => {
            const kind = p[0], pth = String(p[1] || ""), hash = p[2] >>> 0;
            if (kind === 9) {
                if (BEACON9.indexOf(pth) >= 0) return { cls: "beacon", label: pth };
                if (/^mmc:/.test(pth)) return { cls: "canary", label: pth };
                if (FOOT9.indexOf(pth) >= 0) return { cls: "footprint", label: pth };
                return { cls: "env", label: "k9 " + (pth || "event") };
            }
            if (kind === 8 || kind === 4) {
                const beak = (kind === 8 ? BEACON8 : BEACON4);
                for (let i = 0; i < beak.length; i++) if (sh(beak[i], salt) === hash) return { cls: "beacon", label: beak[i] };
                for (let i = 0; i < canarySels.length; i++) if (sh(canarySels[i], salt) === hash) return { cls: "canary", label: canarySels[i] };
                if (kind === 8) for (let i = 0; i < FOOT8.length; i++) if (sh(FOOT8[i], salt) === hash) return { cls: "footprint", label: FOOT8[i] };
                return { cls: "env", label: (kind === 8 ? "tag.class#" : "tag#id#") + hash.toString(16) };
            }
            return { cls: "env", label: "k" + kind + (pth ? " " + pth : "") };
        };

        const ad = window.MooMooLoader.antiDetect;
        const T = window.__t || [], Q = window.__q || [], L = ad.log || [];
        const qBySalt = new Map(Q.map((q) => [q.salt >>> 0, q]));
        const rounds = [];
        for (let i = 0; i < T.length; i++) {
            const t = T[i], salt = (t[4] >>> 0), q = qBySalt.get(salt);
            if (!q) continue;
            const entry = L[i] || null;
            const clientResult = entry ? (entry.probeResult >>> 0) : null;    // what the client matched
            const sentResult = entry ? (entry.sentProbeResult >>> 0) : (t[2] >>> 0);  // what the loader sent
            const canarySels = q.canaries.filter((c) => c[0] === 8).map((c) => "div." + c[1]);
            const tagged = q.probes.map((p) => classify(p, salt, canarySels));
            const hist = {}; q.probes.forEach((p) => { const k = "k" + p[0]; hist[k] = (hist[k] || 0) + 1; });
            const v = { beaconsKept: [], beaconsLost: [], canariesKept: [], canariesLost: [], footStripped: [], footLeaked: [] };
            if (clientResult != null) tagged.forEach((tc, bit) => {
                const matched = (clientResult & (1 << bit)) !== 0, sent = (sentResult & (1 << bit)) !== 0;
                if (tc.cls === "beacon") { if (matched && sent) v.beaconsKept.push(tc.label); else if (matched && !sent) v.beaconsLost.push(tc.label); }
                else if (tc.cls === "canary") { if (matched && sent) v.canariesKept.push(tc.label); else if (matched && !sent) v.canariesLost.push(tc.label); }
                else if (tc.cls === "footprint") { if (matched && !sent) v.footStripped.push(tc.label); else if (matched && sent) v.footLeaked.push(tc.label); }
            });
            const flagsRaw = t[0] >>> 0, realFlags = flagsRaw & 0x3FF, checksum = (flagsRaw >>> 12) & 0xFF, expectCk = (sh("flags", salt) & 255) || 1;
            rounds.push({
                salt, nProbes: q.probes.length, hist, canaries: q.canaries.map((c) => "[" + c[0] + " " + c[1] + "]"),
                clientResult, sentResult, realFlags, checksum, expectCk, checksumOk: checksum === expectCk, flagsClean: realFlags === 0, v
            });
        }
        return {
            rounds,
            healthy: ad.healthy, warningCount: ad.warningCount, warnings: (ad.warnings || []).map((w) => ({ type: w.type, kind: w.kind })),
            menuPresent: !!document.querySelector(".mml-gui"), dbgPresent: !!document.querySelector(".mdbg"), tabPresent: !!document.querySelector(".mmj-tab"),
            bodyBeacon: !!document.querySelector("body.moomoo-io"), gapBeacon: !!document.querySelector("span.ui-mml-gap"), joinBeacon: !!document.querySelector("#hmmjoin"),
            nT: T.length, nQ: Q.length
        };
    });

    // -------- the log --------
    console.log("DOM beacons: body.moomoo-io=" + data.bodyBeacon + "  span.ui-mml-gap=" + data.gapBeacon + "  #hmmjoin=" + data.joinBeacon);
    console.log("DOM footprint: .mml-gui=" + data.menuPresent + "  .mdbg=" + data.dbgPresent + "  .mmj-tab=" + data.tabPresent + "   (q rounds seen=" + data.nQ + ", T sent=" + data.nT + ")\n");
    data.rounds.forEach((r, i) => {
        const histStr = Object.keys(r.hist).map((k) => k + "×" + r.hist[k]).join(" ");
        console.log("ROUND " + (i + 1) + "  salt=0x" + r.salt.toString(16).padStart(8, "0") + "   " + r.nProbes + " probes (" + histStr + ")" + (r.canaries.length ? "   canaries " + r.canaries.join(" ") : ""));
        console.log("   client matched 0x" + (r.clientResult >>> 0).toString(16) + "   → loader sent 0x" + (r.sentResult >>> 0).toString(16));
        console.log("   KEEP  beacons  [" + r.v.beaconsKept.join(", ") + "]" + (r.v.beaconsLost.length ? "   ✗ LOST [" + r.v.beaconsLost.join(", ") + "]" : ""));
        console.log("   KEEP  canaries [" + r.v.canariesKept.join(", ") + "]" + (r.v.canariesLost.length ? "   ✗ LOST [" + r.v.canariesLost.join(", ") + "]" : ""));
        console.log("   STRIP footprint[" + r.v.footStripped.join(", ") + "]" + (r.v.footLeaked.length ? "   ✗ LEAKED [" + r.v.footLeaked.join(", ") + "]" : ""));
        console.log("   flags realFlags=" + r.realFlags + " (clean=" + r.flagsClean + ")  checksum=0x" + (r.checksum || 0).toString(16) + "/0x" + (r.expectCk || 0).toString(16) + " " + (r.checksumOk ? "valid" : "INVALID") + "\n");
    });

    const inc = srv.incidents().filter((l) => /player/.test(l) && !/leave sid/.test(l));

    // -------- verdict --------
    console.log("─────────────── VERDICT ───────────────");
    check("collected at least " + WANT_ROUNDS + " probe rounds", data.rounds.length >= WANT_ROUNDS, "rounds=" + data.rounds.length);
    check("server is at p=4 — per-round canary + the ui-mml-gap/#hmmjoin beacons present", data.rounds.every((r) => r.canaries.length > 0) && data.gapBeacon && data.joinBeacon, "canaries/round=" + data.rounds.map((r) => r.canaries.length).join(","));
    check("loader/mod FOOTPRINT present and STRIPPED every round (nothing leaked)", data.menuPresent && data.rounds.every((r) => r.v.footStripped.length > 0 && r.v.footLeaked.length === 0), "stripped=" + data.rounds.map((r) => r.v.footStripped.length).join(",") + " leaked=" + data.rounds.map((r) => r.v.footLeaked.length).join(","));
    check("every self-ID beacon KEPT (≥3 matched & none stripped)", data.rounds.every((r) => r.v.beaconsLost.length === 0) && data.rounds.some((r) => r.v.beaconsKept.length >= 3), "kept=" + data.rounds.map((r) => r.v.beaconsKept.length).join(",") + " lost=" + data.rounds.map((r) => r.v.beaconsLost.length).join(","));
    check("every DOM/event canary KEPT (none stripped)", data.rounds.every((r) => r.v.canariesLost.length === 0) && data.rounds.some((r) => r.v.canariesKept.length > 0), "kept=" + data.rounds.map((r) => r.v.canariesKept.length).join(",") + " lost=" + data.rounds.map((r) => r.v.canariesLost.length).join(","));
    check("every T has clean real flags (0) + a VALID salt-bound checksum", data.rounds.every((r) => r.flagsClean && r.checksumOk), "clean=" + data.rounds.map((r) => r.flagsClean).join(",") + " ck=" + data.rounds.map((r) => r.checksumOk).join(","));
    check("loader self-protection healthy, zero warnings (no unknown kind / residual / dom-blind)", data.healthy === true && data.warningCount === 0, "healthy=" + data.healthy + " warnings=" + JSON.stringify(data.warnings));
    check("no socket close / no kick", !wsClosed, "wsClosed=" + wsClosed);
    check("no anti-cheat incident on the server", inc.length === 0, JSON.stringify(inc));
} catch (e) { fail++; console.log("  ✗ ERROR " + (e && e.stack || e)); }
finally { try { browser && await browser.close(); } catch (_) {} await srv.stop(); }

console.log(fail === 0 ? "\n  ✓ 100% BYPASS — every probe answered as the genuine client; all loader footprint hidden (" + pass + " checks)" : "\n  " + fail + " CHECK(S) FAILED (" + pass + " passed)");
process.exit(fail === 0 ? 0 : 1);
