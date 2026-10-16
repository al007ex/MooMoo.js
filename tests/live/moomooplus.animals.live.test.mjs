/*
 * LIVE (REAL CLIENT): auto heal against animals.
 * ===============================================
 * An admin bot spawns hostile animals (boars, then wolves) right next to a player
 * running the loader + moomooplus in the official client. The player stands
 * still; auto heal has to keep them alive. Traces health, shame and every food
 * use, and checks the player never dies, never gets the shame hat and the
 * server never acts against them.
 *
 * Run:  node tests/live/moomooplus.animals.live.test.mjs   (HEADFUL=1, LIVE_ECHO=1)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { available, startServer, login, loginFull, joinTicket, loadProtocolModule, gameUrl, loadWs, loadPuppeteer, chromePath, chromeArgs } from "./live-server.mjs";
import { createBot, tick, waitFor } from "./live-client.mjs";

if (!available) { console.log("SKIP moomooplus.animals.live: server not found"); process.exit(0); }
const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..", "..");
const LOADER = fs.readFileSync(process.env.LOADER_PATH || path.join(ROOT, "loader", "dist", "moomoo-loader.user.js"), "utf8");
const MOD = fs.readFileSync(path.join(ROOT, "mods", "moomooplus.js"), "utf8");
const ADMIN = { email: "live-zoo@moomoojs.test", password: "local-test" };
const PLAYER = { email: "live-prey@moomoojs.test", password: "local-test" };
const BOAR = 9, WOLF = 4;   // aiTypes index (the server's aiManager AI_TYPES)

const srv = await startServer({ echo: !!process.env.LIVE_ECHO, env: { OWNER_EMAIL: ADMIN.email } });
console.log("live server on " + srv.base);
const T0 = Date.now();
const log = [];
const errors = [];
const note = (m) => { const l = `${((Date.now() - T0) / 1000).toFixed(2)}s  ${m}`; log.push(l); if (process.env.LIVE_ECHO) console.log("  " + l); };
const checks = [];
const check = (name, ok, detail) => { checks.push({ name, ok: !!ok, detail }); note(`${ok ? "✓" : "✗"} ${name}${detail ? "  " + detail : ""}`); };

let browser, bot, failed = false, wsClosed = null;
try {
    const puppeteer = loadPuppeteer();
    browser = await puppeteer.launch({ executablePath: chromePath(), headless: process.env.HEADFUL ? false : true, args: chromeArgs() });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    const cdp = await page.createCDPSession();
    await cdp.send("Network.enable");
    const sockets = new Map();
    let gameKey = "LC";
    cdp.on("Network.webSocketCreated", (e) => { sockets.set(e.requestId, e.url); const m = /\/s\/([A-Za-z0-9]+)/.exec(e.url); if (m) gameKey = m[1]; });
    cdp.on("Network.webSocketClosed", (e) => { if ((sockets.get(e.requestId) || "").includes("/s/")) { wsClosed = Date.now(); note("GAME SOCKET CLOSED"); } });
    page.on("console", (m) => {
        const t = m.text();
        if (/^\[trace\]/.test(t)) { note(t.slice(8)); return; }
        if (m.type() === "error" && !/favicon|Failed to load resource|ERR_|net::/.test(t)) { errors.push(t.slice(0, 600)); note("console.error: " + t.slice(0, 300)); }
    });
    page.on("pageerror", (err) => { errors.push("PAGE ERROR " + (err.stack || err.message).slice(0, 600)); note("PAGE ERROR: " + err.message.slice(0, 300)); });

    const session = await loginFull(srv, PLAYER.email, PLAYER.password);
    await page.evaluateOnNewDocument((s) => { try { localStorage.setItem("moo_local_frvr_session", JSON.stringify(s)); localStorage.setItem("mmj_debug", "1"); } catch (e) {} }, session);
    await page.evaluateOnNewDocument(LOADER);
    await page.evaluateOnNewDocument(MOD);
    await page.goto(srv.base + "/", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#enterGame", { visible: true, timeout: 20000 });
    await tick(1500);
    await page.click("#nameInput", { clickCount: 3 }).catch(() => {});
    await page.type("#nameInput", "prey").catch(() => {});
    await page.click("#enterGame");
    await page.waitForFunction(() => window.MooMoo && window.MooMoo.self && window.MooMoo.self.alive, { timeout: 25000 });
    const psid = await page.evaluate(() => window.MooMoo.self.sid);
    await page.evaluate(() => {
        const me = window.MooMoo.self;
        window.__deaths = 0;
        window.__eats = 0;
        window.MooMoo.on("health", (p) => { if (p.sid === me.sid) console.log("[trace] health " + p.value + " hat " + me.skinIndex + " shame " + (me.shameCount || 0)); });
        window.MooMoo.on("died", () => { window.__deaths++; console.log("[trace] DIED"); });
        window.MooMooLoader.onRaw((d, n, a) => { if (d === "out" && n === "F" && a && a[0] === 1) { window.__eats++; } });
    });
    note(`player sid ${psid}`);

    const WS = loadWs();
    const mod = await loadProtocolModule(srv);
    bot = await createBot({ WS, srv, mod, name: "zookeeper", url: gameUrl(srv, await joinTicket(srv, await login(srv, ADMIN.email, ADMIN.password), gameKey), mod.BUILD_ID, gameKey) });
    note(`admin bot sid ${bot.client.sid}`);
    // the bot stands next to the player and lets animals out right beside them
    async function release(kind, n) {
        bot.admin("goto", psid);
        await tick(200);
        for (let i = 0; i < n; i++) { bot.admin("spawn", kind); await tick(60); }
        // then steps away so the animals go for the player
        bot.admin("tp", 100, 100);
    }
    const alive = () => page.evaluate(() => window.MooMoo.self.alive);
    const state = () => page.evaluate(() => { const me = window.MooMoo.self; return { alive: me.alive, health: me.health, hat: me.skinIndex, shame: me.shameCount || 0, deaths: window.__deaths, eats: window.__eats }; });

    note("boars");
    await release(BOAR, 3);
    for (let i = 0; i < 20 && await alive(); i++) await tick(500);
    note("after boars: " + JSON.stringify(await state()));
    note("wolves");
    await release(WOLF, 3);
    for (let i = 0; i < 20 && await alive(); i++) await tick(500);
    const end = await state();
    note("after wolves: " + JSON.stringify(end));

    check("never died", end.deaths === 0 && end.alive, JSON.stringify(end));
    check("never shamed", end.hat !== 45);
    check("ate", end.eats > 0, `food uses ${end.eats}`);
    const inc = srv.incidents().filter((l) => !/leave sid/.test(l));
    check("no anti-cheat action", !inc.length && !wsClosed, JSON.stringify(inc));
    check("no errors in the page", !errors.length, errors.slice(0, 3).join("\n---\n"));
    if (checks.some((c) => !c.ok)) throw new Error(checks.filter((c) => !c.ok).map((c) => c.name).join("; "));
    console.log("  ✓ all checks passed");
} catch (e) {
    failed = true;
    console.log("  ✗ " + (e && e.message));
} finally {
    console.log("\n  --- timeline ---\n  " + log.join("\n  "));
    console.log("\n  --- server incidents ---\n  " + (srv.incidents().join("\n  ") || "(none)"));
    try { bot && bot.stop(); } catch (_) {}
    try { browser && await browser.close(); } catch (_) {}
    await srv.stop();
    process.exit(failed ? 1 : 0);
}
