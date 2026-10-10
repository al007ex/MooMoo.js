/*
 * LIVE (REAL CLIENT): the official game client in headless Chrome, with the
 * built loader userscript + mods/examplescript.js injected at document-start
 * (exactly what Tampermonkey does), against an isolated copy of the server.
 * An admin bot walks up and hits the player. We record:
 *   - every WebSocket frame the browser actually sends + the close code (CDP)
 *   - page console output / errors (loader errors show up here)
 *   - the server's own anti-cheat log
 *
 * The player is a signed-in local test account: the official client lets
 * signed-in players skip its human check by design, so no captcha is involved.
 *
 * Run:  node tests/live/realclient.live.test.mjs      (HEADFUL=1 to watch)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { available, startServer, login, loginFull, joinTicket, loadProtocolModule, gameUrl, loadWs, loadPuppeteer, chromePath } from "./live-server.mjs";
import { createBot, tick, waitFor } from "./live-client.mjs";

if (!available) { console.log("SKIP realclient.live: server not found"); process.exit(0); }
const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..", "..");
const LOADER = fs.readFileSync(path.join(ROOT, "loader", "dist", "moomoo-loader.user.js"), "utf8");
const MOD = fs.readFileSync(path.join(ROOT, "mods", "examplescript.js"), "utf8");

const ATTACKER = { email: "live-attacker@moomoojs.test", password: "local-test" };
const PLAYER = { email: "live-player@moomoojs.test", password: "local-test" };

const srv = await startServer({ echo: !!process.env.LIVE_ECHO, env: { OWNER_EMAIL: ATTACKER.email } });
console.log("live server on " + srv.base);
const T0 = Date.now();
const log = [];
const note = (m) => { const l = `${((Date.now() - T0) / 1000).toFixed(2)}s  ${m}`; log.push(l); if (process.env.LIVE_ECHO) console.log("  " + l); };

let browser, bot, failed = false, wsClosed = null;
try {
    const puppeteer = loadPuppeteer();
    browser = await puppeteer.launch({ executablePath: chromePath(), headless: process.env.HEADFUL ? false : true, args: ["--no-first-run", "--mute-audio"] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    const cdp = await page.createCDPSession();
    await cdp.send("Network.enable");
    const sockets = new Map();
    let gameKey = "LC";
    cdp.on("Network.webSocketCreated", (e) => { sockets.set(e.requestId, e.url); const m = /\/s\/([A-Za-z0-9]+)/.exec(e.url); if (m) gameKey = m[1]; note(`ws created ${e.url.replace(/token=[^&]+/, "token=…")}`); });
    cdp.on("Network.webSocketClosed", (e) => { const u = sockets.get(e.requestId) || ""; if (u.includes("/s/")) { wsClosed = { at: Date.now() }; note(`GAME SOCKET CLOSED`); } });
    cdp.on("Network.webSocketFrameError", (e) => note(`ws frame error: ${e.errorMessage}`));
    page.on("console", async (m) => {
        let t = m.text();
        if (!/moomoo|error|Error|kicked|disconnect/i.test(t)) return;
        try { const parts = await Promise.all(m.args().map((a) => a.evaluate((v) => (v && v.stack) ? v.stack : String(v)))); t = parts.join(" "); } catch (_) {}
        note(`console.${m.type()}: ${t.replace(/%c|color:[^ ]+;?font-weight:bold|color:#[0-9a-f]+/g, "").slice(0, 600)}`);
    });
    page.on("pageerror", (err) => note(`PAGE ERROR: ${err.message.slice(0, 200)}`));

    const session = await loginFull(srv, PLAYER.email, PLAYER.password);
    await page.evaluateOnNewDocument((s) => { try { localStorage.setItem("moo_local_frvr_session", JSON.stringify(s)); } catch (e) {} }, session);
    await page.evaluateOnNewDocument(LOADER);
    await page.evaluateOnNewDocument(MOD);

    await page.goto(srv.base + "/", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#enterGame", { visible: true, timeout: 20000 });
    await tick(1500);
    await page.click("#nameInput", { clickCount: 3 }).catch(() => {});
    await page.type("#nameInput", "player").catch(() => {});
    await page.click("#enterGame");
    note("clicked Enter Game");
    await page.waitForFunction(() => window.MooMoo && window.MooMoo.self && window.MooMoo.self.sid >= 0 && window.MooMoo.self.alive, { timeout: 25000 });
    const vsid = await page.evaluate(() => window.MooMoo.self.sid);
    const modState = await page.evaluate(() => (window.MooMoo.getMods().find((m) => m.id === "examplescript") || {}).enabled);
    note(`player spawned sid ${vsid}, examplescript enabled=${modState}`);
    await page.evaluate(() => {
        window.__out = [];
        window.MooMooLoader.onRaw((d, n, a) => { if (d === "out" && n !== "D") window.__out.push([Date.now(), n, JSON.stringify(a).slice(0, 80)]); });
        window.MooMoo.on("health", (p) => { if (p.sid === window.MooMoo.self.sid) console.log("[moomoo-test] health " + p.value); });
        window.MooMoo.on("disconnect", (p) => console.log("[moomoo-test] disconnect " + p.reason));
    });

    const WS = loadWs();
    const mod = await loadProtocolModule(srv);
    bot = await createBot({ WS, srv, mod, name: "attacker", url: gameUrl(srv, await joinTicket(srv, await login(srv, ATTACKER.email, ATTACKER.password), gameKey), mod.BUILD_ID, gameKey) });
    note(`attacker joined ${gameKey} as sid ${bot.client.sid}`);
    bot.admin("give", 1, 1000, vsid);
    bot.admin("goto", vsid);
    await tick(500);
    await waitFor(() => bot.client.players.has(vsid) && vsid !== bot.client.sid, 5000, "attacker to see player");

    async function hit() {
        bot.admin("goto", vsid); await tick(60);
        const dir = bot.aimAt(vsid); if (dir == null) return;
        bot.client.send("F", [1, dir]); await tick(90); bot.client.send("F", [0, dir]);
    }
    note("hitting the player 8x");
    for (let i = 0; i < 8 && !wsClosed; i++) { await hit(); await tick(1300); }
    await tick(2500);

    const out = await page.evaluate(() => window.__out || []);
    note("frames the page sent (excluding aim): " + out.slice(-30).map((f) => `${((f[0] - T0) / 1000).toFixed(2)}:${f[1]}${f[2]}`).join("  "));
    const health = await page.evaluate(() => window.MooMoo.self.health).catch(() => "n/a");
    note(`final player health ${health}`);
    const menuOk = await page.evaluate(() => ({ fab: !!document.getElementById("mmj-cfg-fab"), card: !!document.getElementById("mmj-cfg"), style: !!document.getElementById("mmj-cfg-style") }));
    note("config menu mounted: " + JSON.stringify(menuOk));
    const cfgErr = log.some((l) => /appendChild|installConfigMenu/.test(l));
    const inc = srv.incidents().filter((l) => /player/.test(l) && !/leave sid/.test(l));
    if (wsClosed || inc.length) throw new Error("player was disconnected / acted on. incidents: " + JSON.stringify(inc));
    if (cfgErr) throw new Error("config menu threw at document-start");
    if (!menuOk.fab || !menuOk.card || !menuOk.style) throw new Error("config menu did not fully mount: " + JSON.stringify(menuOk));
    console.log("  ✓ real client survived 8 hits with examplescript, no anti-cheat action");
} catch (e) {
    failed = true;
    console.log("  ✗ " + (e && e.message));
} finally {
    console.log("\n  --- timeline ---\n  " + log.join("\n  "));
    console.log("\n  --- server incidents ---\n  " + (srv.incidents().join("\n  ") || "(none)"));
    if (failed) console.log("\n  --- server log tail ---\n  " + srv.lines.slice(-30).join("\n  "));
    try { bot && bot.stop(); } catch (_) {}
    try { browser && await browser.close(); } catch (_) {}
    await srv.stop();
    process.exit(failed ? 1 : 0);
}
