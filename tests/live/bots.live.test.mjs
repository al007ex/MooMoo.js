/*
 * LIVE (REAL CLIENT): MooMod Bots multi-boxing against an isolated copy of the private
 * server, anti-cheat ON. Proves the whole feature end to end:
 *   - the bot panel signs an account in (/api/auth/password), gets a join ticket
 *     (/api/join), and opens its OWN native WebSocket to the SAME world
 *   - each bot speaks the real wire (sealed/keyed/masked/sequenced frames via the
 *     loader's ClientSession) and answers the integrity probe "q" with a clean "T",
 *     so the server SPAWNS it and never kicks it (undetected)
 *   - the bots walk to exactly where the cursor points (mouse -> world follow)
 *   - the raised per-IP limit lets 10 bots connect from one IP (old limit was 4)
 *
 * Run:  MOOMOO_SERVER_DIR=/path/to/moomoo-clone-main node tests/live/bots.live.test.mjs
 *       (HEADFUL=1 to watch, LIVE_ECHO=1 to echo the server log)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { available, startServer, loginFull, loadPuppeteer, chromePath, chromeArgs } from "./live-server.mjs";
import { tick } from "./live-client.mjs";

if (!available) { console.log("SKIP bots.live: server not found"); process.exit(0); }
const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..", "..");
const LOADER = fs.readFileSync(path.join(ROOT, "loader", "dist", "moomoo-loader.user.js"), "utf8");
const LITE = fs.readFileSync(path.join(ROOT, "mods", "lite.js"), "utf8");
const BOTS = fs.readFileSync(path.join(ROOT, "mods", "bots.js"), "utf8");

const PLAYER = { email: "live-botmaster@moomoojs.test", password: "local-test" };
const BOT_ACCT = { email: "fleet@moomoojs.test", password: "local-test" };

const T0 = Date.now();
const note = (m) => { if (process.env.LIVE_ECHO) console.log("  " + ((Date.now() - T0) / 1000).toFixed(2) + "s  " + m); };
let pass = 0, fail = 0;
const check = (name, ok, detail) => { if (ok) { pass++; console.log("  ✓ " + name + (detail ? "  " + detail : "")); } else { fail++; console.log("  ✗ " + name + (detail ? "  " + detail : "")); } note((ok ? "✓ " : "✗ ") + name); };

const srv = await startServer({ echo: !!process.env.LIVE_ECHO });
console.log("live server on " + srv.base);
let browser, wsClosed = 0;
try {
    const puppeteer = loadPuppeteer();
    browser = await puppeteer.launch({ executablePath: chromePath(), headless: process.env.HEADFUL ? false : true, args: chromeArgs() });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    const cdp = await page.createCDPSession();
    await cdp.send("Network.enable");
    const socks = new Map();
    cdp.on("Network.webSocketCreated", (e) => socks.set(e.requestId, e.url));
    cdp.on("Network.webSocketClosed", (e) => { if ((socks.get(e.requestId) || "").includes("/s/")) wsClosed++; });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push(String(e && e.message || e).slice(0, 200)));

    const session = await loginFull(srv, PLAYER.email, PLAYER.password);
    await page.evaluateOnNewDocument((s) => { try { localStorage.setItem("moo_local_frvr_session", JSON.stringify(s)); } catch (e) {} }, session);
    await page.evaluateOnNewDocument(LOADER);
    await page.evaluateOnNewDocument(() => {
        function grab() { try { window.dispatchEvent(new CustomEvent("moomoo.js:api", { detail: { resolve: function (m, l) { window.MooMoo = m; window.MooMooLoader = l; } } })); } catch (e) {} }
        grab(); if (!window.MooMoo) window.addEventListener("moomoo.js:ready", grab, false);
    });
    await page.evaluateOnNewDocument(LITE);
    await page.evaluateOnNewDocument(BOTS);
    await page.goto(srv.base + "/", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#enterGame", { visible: true, timeout: 20000 });
    await tick(1200);
    await page.click("#nameInput", { clickCount: 3 }).catch(() => {});
    await page.type("#nameInput", "botmaster").catch(() => {});
    await page.click("#enterGame");
    await page.waitForFunction(() => window.MooMoo && window.MooMoo.self && window.MooMoo.self.sid >= 0 && window.MooMoo.self.alive, { timeout: 25000 });
    await page.evaluate(() => { try { document.activeElement && document.activeElement.blur(); } catch (e) {} });
    await tick(1200);
    note("botmaster spawned");

    // loader accessors the bots rely on
    const ep = await page.evaluate(() => { const e = window.MooMooLoader.endpoint && window.MooMooLoader.endpoint(); return e; });
    check("loader exposes the active endpoint (host/key/build)", !!(ep && ep.host && ep.serverKey && ep.buildId), JSON.stringify(ep));
    const sealOk = await page.evaluate(async () => { try { const s = await window.MooMooLoader.seal(); return !!(s && s.length === 16); } catch (e) { return false; } });
    check("loader exposes the code seal (16 bytes, bind mode)", sealOk);

    // the bots panel is present + id-less (undetection: no id'd element)
    const panel = await page.evaluate(() => ({ launcher: !!document.querySelector(".mml-blauncher"), ided: document.querySelectorAll(".mml-bots [id], .mml-blauncher[id]").length }));
    check("bots launcher present, panel is id-less", panel.launcher && panel.ided === 0, JSON.stringify(panel));

    // ---- drive the GUI: open, enter the bot account, spawn 5 ----
    await page.click(".mml-blauncher");
    await tick(300);
    await page.type('.mml-bots input[placeholder="you@example.com"]', BOT_ACCT.email);
    await page.type('.mml-bots input[placeholder="account password"]', BOT_ACCT.password);
    await page.evaluate(() => { const i = document.querySelector('.mml-bots input[type=number]'); if (i) { i.value = "5"; i.dispatchEvent(new Event("input", { bubbles: true })); } });
    const clickSpawn = () => page.evaluate(() => { const b = [...document.querySelectorAll(".mml-bots .bbtn.go")].find(x => /spawn/i.test(x.textContent)); if (b) b.click(); return !!b; });
    await clickSpawn();

    const aliveCount = () => page.evaluate(() => document.querySelectorAll(".mml-bots .bitem .bst.alive").length);
    const statuses = () => page.evaluate(() => [...document.querySelectorAll(".mml-bots .bitem")].map(r => ({ n: r.querySelector(".bn") && r.querySelector(".bn").textContent, s: r.querySelector(".bst") && r.querySelector(".bst").textContent, e: r.querySelector(".bst") && r.querySelector(".bst").title })));
    // wait up to 25s for all 5 to spawn
    let n5 = 0;
    for (let i = 0; i < 50 && n5 < 5; i++) { await tick(500); n5 = await aliveCount(); }
    check("5 bots authenticated + joined + spawned (alive)", n5 === 5, "alive=" + n5 + " " + JSON.stringify(await statuses()));
    check("no bot socket was closed/kicked while spawning", wsClosed === 0, "wsClosed=" + wsClosed);

    // ---- follow: point the cursor at the player; bots walk in and become visible ----
    const playersInfo = () => page.evaluate(() => {
        const me = window.MooMoo.self, v = window.MooMooLoader.render.view;
        const others = [];
        for (const [sid, p] of window.MooMoo.players) if (sid !== me.sid && p.visible) others.push({ sid, x: p.x, y: p.y });
        return { selfSid: me.sid, me: { x: me.x, y: me.y }, others, view: { left: v.left, top: v.top, scale: v.scale } };
    });
    // cursor a little LEFT of the player (still on-screen, so the bots stay in the user's view)
    await page.mouse.move(440, 360);
    let conv = await playersInfo();
    for (let i = 0; i < 90 && conv.others.length < 2; i++) { await tick(500); conv = await playersInfo(); }
    check("bots follow the cursor into view (walk to the player)", conv.others.length >= 2, "visible bots=" + conv.others.length);

    // ---- follow direction: move the cursor to the other side of the player; bots follow ----
    const avgX = (info) => info.others.length ? info.others.reduce((a, p) => a + p.x, 0) / info.others.length : null;
    const leftX = avgX(await playersInfo());
    await page.mouse.move(840, 360);            // a little RIGHT of the player (still in view)
    await tick(8000);
    const rightX = avgX(await playersInfo());
    check("bots track the cursor to a new point (avg X moves right)", leftX != null && rightX != null && rightX > leftX + 80, "avgX " + Math.round(leftX) + " -> " + Math.round(rightX));

    // ---- IP limit: spawn 5 more. The per-IP cap is 10 and it counts YOUR client too, so
    //      user(1) + 9 bots = 10 fit and the 10th bot correctly hits the cap. (Old cap: 4.) ----
    await page.mouse.move(640, 360);
    await clickSpawn();
    let n9 = 0;
    for (let i = 0; i < 50 && n9 < 9; i++) { await tick(500); n9 = await aliveCount(); }
    const sts = await statuses();
    const failed = sts.filter((s) => s.s !== "alive");
    check("9 bots alive from one IP; the 10th hits the per-IP cap (limit 10, incl. your client)", n9 === 9 && failed.length === 1, "alive=" + n9 + " failed=" + JSON.stringify(failed));

    // ---- the GUI won't list more than 10 bots ----
    await clickSpawn();
    await tick(800);
    const total = await page.evaluate(() => document.querySelectorAll(".mml-bots .bitem").length);
    const flash = await page.evaluate(() => { const f = document.querySelector(".mml-bots .bflash"); return f ? f.textContent : ""; });
    check("spawning past the 10-bot list cap is blocked", total === 10 && /limit/i.test(flash), "total=" + total + " flash=" + JSON.stringify(flash));

    // ---- undetected throughout (the per-IP rejection is the connection gate, NOT the
    //      anti-cheat flagging a bot as a cheater — so it is excluded here) ----
    const inc = srv.incidents().filter((l) => !/leave sid/.test(l) && !/too many connections/.test(l));
    check("no anti-cheat incident on the server (bots undetected)", inc.length === 0, JSON.stringify(inc));
    check("no page errors", pageErrors.length === 0, JSON.stringify(pageErrors));
} catch (e) { fail++; console.log("  ✗ ERROR " + (e && e.stack || e)); }
finally { try { browser && await browser.close(); } catch (_) {} await srv.stop(); }

console.log(fail === 0 ? "\n  ✓ BOTS LIVE OK (" + pass + ")" : "\n  " + fail + " FAILED (" + pass + " passed)");
process.exit(fail === 0 ? 0 : 1);
