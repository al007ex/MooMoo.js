/*
 * LIVE: enable autohat + auto-attack + auto-heal on the real client and run
 * sustained combat against the real server. Verifies the combat subsystem
 * (reload tracking, hat swaps, attacks) never trips the anti-cheat: no close,
 * no kick, no shame, no strikes, and hat-swap packets ("c") stay under the rate.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { available, startServer, login, loginFull, joinTicket, loadProtocolModule, gameUrl, loadWs, loadPuppeteer, chromePath, chromeArgs } from "./live-server.mjs";
import { createBot, tick, waitFor } from "./live-client.mjs";

if (!available) { console.log("SKIP combat.live: server not found"); process.exit(0); }
const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..", "..");
const LOADER = fs.readFileSync(path.join(ROOT, "loader", "dist", "moomoo-loader.user.js"), "utf8");
const MOD = fs.readFileSync(path.join(ROOT, "mods", "examplescript.js"), "utf8");
const ATTACKER = { email: "live-attacker@moomoojs.test", password: "x" };
const PLAYER = { email: "live-player@moomoojs.test", password: "x" };

const srv = await startServer({ echo: !!process.env.LIVE_ECHO, env: { OWNER_EMAIL: ATTACKER.email } });
console.log("live server on " + srv.base);
const T0 = Date.now();
const log = []; const note = (m) => { const l = `${((Date.now()-T0)/1000).toFixed(2)}s  ${m}`; log.push(l); if (process.env.LIVE_ECHO) console.log("  "+l); };
let browser, bot, failed = false, wsClosed = false;
try {
    const pp = loadPuppeteer();
    browser = await pp.launch({ executablePath: chromePath(), headless: process.env.HEADFUL ? false : true, args: chromeArgs() });
    const page = await browser.newPage();
    const cdp = await page.createCDPSession(); await cdp.send("Network.enable");
    let gameKey = "LC";
    cdp.on("Network.webSocketCreated", (e) => { const m=/\/s\/([A-Za-z0-9]+)/.exec(e.url); if(m) gameKey=m[1]; });
    cdp.on("Network.webSocketClosed", (e) => { if ((e.url||"").includes("/s/")) wsClosed = true; });
    page.on("pageerror", (err) => note("PAGE ERROR: " + err.message.slice(0,160)));

    const session = await loginFull(srv, PLAYER.email, PLAYER.password);
    await page.evaluateOnNewDocument((s) => { try { localStorage.setItem("moo_local_frvr_session", JSON.stringify(s)); } catch(e){} }, session);
    await page.evaluateOnNewDocument(LOADER);
    await page.evaluateOnNewDocument(MOD);
    await page.goto(srv.base + "/", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#enterGame", { visible: true, timeout: 20000 });
    await tick(1500);
    await page.click("#nameInput", { clickCount: 3 }).catch(() => {});
    await page.type("#nameInput", "player").catch(() => {});
    await page.click("#enterGame");
    await page.waitForFunction(() => window.MooMoo && window.MooMoo.self && window.MooMoo.self.sid >= 0 && window.MooMoo.self.alive, { timeout: 25000 });
    const vsid = await page.evaluate(() => window.MooMoo.self.sid);
    // turn ON autohat + auto-attack + auto-heal
    await page.evaluate(() => {
        const M = window.MooMoo;
        M.setSetting("examplescript","autoHeal",true);
        M.setSetting("examplescript","autohat",true);
        M.setSetting("examplescript","autoAttack",true);
        window.__c = 0; window.MooMooLoader.onRaw((d,n)=>{ if(d==="out"&&n==="c") window.__c++; });
    });
    note(`player sid ${vsid}; autohat+autoAttack+autoHeal ON`);

    const WS = loadWs(); const mod = await loadProtocolModule(srv);
    bot = await createBot({ WS, srv, mod, name: "attacker", url: gameUrl(srv, await joinTicket(srv, await login(srv, ATTACKER.email, ATTACKER.password), gameKey), mod.BUILD_ID, gameKey) });
    bot.admin("give", 1, 1000, vsid); bot.admin("goto", vsid);
    await tick(500);
    await waitFor(() => bot.client.players.has(vsid) && bot.client.sid !== vsid, 5000, "attacker sees player");

    note("sustained combat: hitting every ~500ms for 12s");
    for (let i = 0; i < 24 && !wsClosed; i++) {
        bot.admin("goto", vsid); await tick(60);
        const dir = bot.aimAt(vsid); if (dir != null) { bot.client.send("F",[1,dir]); await tick(90); bot.client.send("F",[0,dir]); }
        await tick(350);
    }
    await tick(1500);

    const cCount = await page.evaluate(() => window.__c || 0).catch(() => 0);
    const alive = await page.evaluate(() => window.MooMoo.self.alive).catch(() => false);
    note(`hat-swap ("c") packets sent: ${cCount}, player alive: ${alive}, deaths handled by respawn`);
    const inc = srv.incidents().filter((l) => /player/.test(l) && !/leave sid/.test(l));
    if (wsClosed || inc.length) throw new Error("anti-cheat acted: " + JSON.stringify(inc) + (wsClosed ? " [socket closed]" : ""));
    console.log("  ✓ sustained combat (autohat+autoattack+autoheal) survived with no anti-cheat action; " + cCount + " hat swaps");
} catch (e) { failed = true; console.log("  ✗ " + (e && e.message)); }
finally {
    console.log("\n  --- timeline ---\n  " + log.join("\n  "));
    console.log("\n  --- server incidents ---\n  " + (srv.incidents().join("\n  ") || "(none)"));
    try { bot && bot.stop(); } catch(_){}
    try { browser && await browser.close(); } catch(_){}
    await srv.stop();
    process.exit(failed ? 1 : 0);
}
