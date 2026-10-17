/*
 * LIVE (REAL CLIENT + EXAMPLESCRIPT): the bundle port running in the official
 * client in Chrome, against an isolated copy of the server.
 * =============================================================================
 * Checks, phase by phase, that the transplanted bundle behaves like the bundle:
 *   0  boot     : spawns, the mod's tick runs every server tick, no errors thrown,
 *                 the chat log and the overlay canvas exist
 *   1  idle     : what the player sends on its own (aim, auto-gather toggles, ping
 *                 rate) stays inside every server bucket
 *   2  damage   : an admin bot hits the player; auto heal eats, health recovers,
 *                 the death log / encountered log lines appear
 *   3  anti-cheat: across the whole run the server never closes, kicks, strikes or
 *                 shames the player
 *
 * Run:  node tests/live/moomooplus.live.test.mjs     (HEADFUL=1 to watch, LIVE_ECHO=1)
 * A screenshot of the last frame is written to $SHOT (default /tmp/mmj-es.png).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { available, startServer, login, loginFull, joinTicket, loadProtocolModule, gameUrl, loadWs, loadPuppeteer, chromePath, chromeArgs } from "./live-server.mjs";
import { createBot, tick, waitFor } from "./live-client.mjs";

if (!available) { console.log("SKIP moomooplus.live: server not found"); process.exit(0); }
const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..", "..");
const LOADER = fs.readFileSync(process.env.LOADER_PATH || path.join(ROOT, "loader", "dist", "moomoo-loader.user.js"), "utf8");
const MOD = fs.readFileSync(path.join(ROOT, "mods", "moomooplus.js"), "utf8");
const SHOT = process.env.SHOT || "/tmp/mmj-es.png";

const ATTACKER = { email: "live-attacker@moomoojs.test", password: "local-test" };
const PLAYER = { email: "live-player@moomoojs.test", password: "local-test" };

const srv = await startServer({ echo: !!process.env.LIVE_ECHO, env: { OWNER_EMAIL: ATTACKER.email } });
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
    cdp.on("Network.webSocketClosed", (e) => { const u = sockets.get(e.requestId) || ""; if (u.includes("/s/")) { wsClosed = { at: Date.now() }; note("GAME SOCKET CLOSED"); } });
    page.on("console", async (m) => {
        let t = m.text();
        if (m.type() === "error" || /threw|Error|error/.test(t)) {
            try { const parts = await Promise.all(m.args().map((a) => a.evaluate((v) => (v && v.stack) ? v.stack : String(v)))); t = parts.join(" "); } catch (_) {}
            const loc = m.location ? m.location() : {};
            if (!t.trim()) t = `(empty) raw=${JSON.stringify(m.text())} at ${loc.url || "?"}:${loc.lineNumber}:${loc.columnNumber}`;
            if (!/favicon|Failed to load resource|ERR_|net::/.test(t)) { errors.push(t.slice(0, 900)); note(`console.${m.type()}: ${t.slice(0, 400)}`); }
        } else if (/moomoo/i.test(t)) note(`console.${m.type()}: ${t.slice(0, 200)}`);
    });
    page.on("pageerror", (err) => { errors.push("PAGE ERROR " + (err.stack || err.message).slice(0, 900)); note(`PAGE ERROR: ${err.message.slice(0, 300)}`); });

    const session = await loginFull(srv, PLAYER.email, PLAYER.password);
    await page.evaluateOnNewDocument((s) => { try { localStorage.setItem("moo_local_frvr_session", JSON.stringify(s)); localStorage.setItem("mmj_debug", "1"); } catch (e) {} }, session);
    await page.evaluateOnNewDocument(LOADER);
    await page.evaluateOnNewDocument(() => {
        function grab() { try { window.dispatchEvent(new CustomEvent("moomoo.js:api", { detail: { resolve: function (m, l) { window.MooMoo = m; window.MooMooLoader = l; } } })); } catch (e) {} }
        grab();
        if (!window.MooMoo) window.addEventListener("moomoo.js:ready", grab, false);
    });
    await page.evaluateOnNewDocument(MOD);
    await page.goto(srv.base + "/", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#enterGame", { visible: true, timeout: 20000 });
    await tick(1500);
    await page.click("#nameInput", { clickCount: 3 }).catch(() => {});
    await page.type("#nameInput", "player").catch(() => {});
    await page.click("#enterGame");
    await page.waitForFunction(() => window.MooMoo && window.MooMoo.self && window.MooMoo.self.sid >= 0 && window.MooMoo.self.alive, { timeout: 25000 });
    const vsid = await page.evaluate(() => window.MooMoo.self.sid);
    note(`player spawned sid ${vsid}`);
    await page.evaluate(() => {
        window.__out = [];
        window.__ticks = 0;
        window.MooMooLoader.onRaw((d, n, a) => { if (d === "out") window.__out.push([Date.now(), n, JSON.stringify(a).slice(0, 80)]); });
        window.MooMoo.on("playersUpdate", () => { window.__ticks++; });
        window.MooMoo.on("health", (p) => { if (p.sid === window.MooMoo.self.sid) console.log("[moomoo-test] health " + p.value); });
        // shame: the hat (45) means 8 eats landed inside the server's 120 ms window
        window.__shamed = false; window.__maxShame = 0;
        setInterval(() => { const me = window.MooMoo.self; if (me.skinIndex === 45) window.__shamed = true; window.__maxShame = Math.max(window.__maxShame, me.shameCount || 0); }, 50);
    });

    // ---- 0: boot ----
    await tick(3000);
    const boot = await page.evaluate(() => {
        const ex = window.MooMoo.getMods().find((m) => m.id === "moomooplus");
        return {
            enabled: ex && ex.enabled,
            ticks: window.__ticks,
            chatLog: !!document.querySelector(".chat-container .chat-history"),
            chatLines: document.querySelectorAll(".chat-container .chat-history > div").length,
            overlay: [...document.querySelectorAll("canvas")].filter((c) => c.style.pointerEvents === "none").length,
            menuKey: window.__mmp && window.__mmp.menu && window.__mmp.menu() ? "m" : null,
            dmgpot: !!(window.MooMoo.self.dmgpot),
            loadout: window.MooMooLoader.combat ? JSON.stringify(window.MooMooLoader.combat.loadout) : null
        };
    });
    check("moomooplus enabled", boot.enabled);
    check("ticks flowing", boot.ticks > 15, `ticks=${boot.ticks}`);
    check("chat log mounted", boot.chatLog, `lines=${boot.chatLines}`);
    check("overlay canvas mounted", boot.overlay >= 1);
    check("M menu wired up", boot.menuKey === "m", `menuApi=${boot.menuKey}`);
    check("tail ran (z.dmgpot set by p5)", boot.dmgpot);
    note("bundle state: " + JSON.stringify(await page.evaluate(() => window.__mmp && window.__mmp.state())));

    // ---- 1: idle traffic ----
    const out1 = await page.evaluate(() => window.__out.slice());
    const per = {};
    for (const f of out1) per[f[1]] = (per[f[1]] || 0) + 1;
    note("idle frames by type: " + JSON.stringify(per));

    // ---- 2: damage + auto heal ----
    const WS = loadWs();
    const mod = await loadProtocolModule(srv);
    bot = await createBot({ WS, srv, mod, name: "attacker", url: gameUrl(srv, await joinTicket(srv, await login(srv, ATTACKER.email, ATTACKER.password), gameKey), mod.BUILD_ID, gameKey) });
    note(`attacker joined as sid ${bot.client.sid}`);
    bot.admin("give", 1, 1000, vsid);
    bot.admin("goto", vsid);
    await tick(500);
    await waitFor(() => bot.client.players.has(vsid), 5000, "attacker to see player");
    async function hit() {
        bot.admin("goto", vsid); await tick(60);
        const dir = bot.aimAt(vsid); if (dir == null) return;
        bot.client.send("F", [1, dir]); await tick(90); bot.client.send("F", [0, dir]);
    }
    const hp = [];
    page.on("console", (m) => { const r = /\[moomoo-test\] health (-?\d+)/.exec(m.text()); if (r) hp.push(+r[1]); });
    for (let i = 0; i < 8 && !wsClosed; i++) { await hit(); await tick(1300); }
    await tick(2000);
    let rises = 0; for (let i = 1; i < hp.length; i++) if (hp[i] > hp[i - 1]) rises++;
    check("auto heal raised health after hits", rises > 0, `health trace ${hp.join(",")}`);
    const shame = await page.evaluate(() => ({ shamed: window.__shamed, max: window.__maxShame }));
    check("auto heal never earned the shame hat", !shame.shamed, `max shame count ${shame.max}`);
    const logText = await page.evaluate(() => [...document.querySelectorAll(".chat-container .chat-history > div")].map((d) => d.textContent).slice(-30));
    check("encountered log line", logText.some((t) => /Encountered attacker\[/.test(t)), logText.slice(-6).join(" | "));

    await page.screenshot({ path: SHOT });
    note("screenshot " + SHOT);

    // ---- 2b: the combo watchdog recovers a stranded busy flag ----
    // Movement is gated on !jt, aim/hitting on !p && !gt. If an async combo throws
    // before clearing its flag it strands true and freezes input until the mod is
    // toggled; the watchdog must clear a stuck flag on its own within a couple seconds.
    await page.evaluate(() => window.__mmp.eval("p = true; gt = true; jt = true; Ht = true; hn = true"));
    const stuck = await page.evaluate(() => window.__mmp.eval("[p, gt, jt].every(Boolean)"));
    await tick(3000);
    const cleared = await page.evaluate(() => window.__mmp.eval("![p, gt, Mt, Ot, hn, ct, jt, Ht].some(Boolean)"));
    check("watchdog clears a stranded combo flag", stuck && cleared, `stuck=${stuck} cleared=${cleared}`);

    // ---- 3: anti-cheat + errors ----
    const inc = srv.incidents().filter((l) => /player/.test(l) && !/leave sid/.test(l));
    check("no anti-cheat action against the player", !wsClosed && !inc.length, JSON.stringify(inc));
    check("no errors in the page", !errors.length, errors.slice(0, 3).join("\n---\n"));
    const all = await page.evaluate(() => window.__out.slice());
    const per2 = {};
    for (const f of all) per2[f[1]] = (per2[f[1]] || 0) + 1;
    note("all frames by type: " + JSON.stringify(per2));
    if (checks.some((c) => !c.ok)) throw new Error(checks.filter((c) => !c.ok).map((c) => c.name).join("; "));
    console.log("  ✓ all checks passed");
} catch (e) {
    failed = true;
    console.log("  ✗ " + (e && e.message));
} finally {
    console.log("\n  --- timeline ---\n  " + log.join("\n  "));
    if (errors.length) console.log("\n  --- page errors ---\n  " + errors.slice(0, 8).join("\n  ---\n  "));
    console.log("\n  --- server incidents ---\n  " + (srv.incidents().join("\n  ") || "(none)"));
    if (failed) console.log("\n  --- server log tail ---\n  " + srv.lines.slice(-30).join("\n  "));
    try { bot && bot.stop(); } catch (_) {}
    try { browser && await browser.close(); } catch (_) {}
    await srv.stop();
    process.exit(failed ? 1 : 0);
}
