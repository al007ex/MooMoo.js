/*
 * LIVE (REAL CLIENT): MooMod (Nuro's script, ported) in the official client in Chrome
 * against an isolated copy of the server, with an admin bot as the "enemy".
 *
 * It loads exactly what Tampermonkey would (the loader, then mods/moomod.js — which carries
 * its own jQuery + jquery-confirm)
 * and checks the look and the in-game behaviour:
 *   - main menu: red "MooMod" logo, texts, "Open MooMod menu" button, Featured Hacker, FPS
 *   - menus: "-" MooMod menu (+ tabs), F2 auto placement, ESC hat menu
 *   - the frames it puts on the wire: biome hats, hold-V spikes, L ring, swing hats,
 *     R insta, right click insta, K auto trap, P bot mode, arrow spams, Shift biome hat
 *   - with an enemy: bull helmet / soldier, red HUD, auto heal after a hit, anti-trap ring
 *   - minimap autopilot box, minimap markers for your buildings
 *   - every frame valid for this server, no anti-cheat action, no page errors
 *   - disabling it in the Mods tab removes everything
 *
 * Run:  node tests/live/moomod.live.test.mjs   (HEADFUL=1 to watch, LIVE_ECHO=1)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { available, startServer, loginFull, login, joinTicket, loadProtocolModule, gameUrl, loadWs, loadPuppeteer, chromePath, chromeArgs } from "./live-server.mjs";
import { createBot, tick, waitFor } from "./live-client.mjs";

if (!available) { console.log("SKIP moomod.live: server not found"); process.exit(0); }
const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..", "..");
const read = (...p) => fs.readFileSync(path.join(ROOT, ...p), "utf8");
const LOADER = read("loader", "dist", "moomoo-loader.user.js");
const MOD = read("mods", "moomod.js");
const PLAYER = { email: "live-moomod@moomoojs.test", password: "local-test" };
const ENEMY = { email: "live-moomod-enemy@moomoojs.test", password: "local-test" };

const WS = loadWs();
const srv = await startServer({ echo: !!process.env.LIVE_ECHO, env: { OWNER_EMAIL: ENEMY.email } });
console.log("live server on " + srv.base);
const T0 = Date.now();
const log = [], errors = [];
const note = (m) => { const l = `${((Date.now() - T0) / 1000).toFixed(2)}s  ${m}`; log.push(l); if (process.env.LIVE_ECHO) console.log("  " + l); };
const checks = [];
const check = (name, ok, detail) => { checks.push({ name, ok: !!ok, detail }); note(`${ok ? "✓" : "✗"} ${name}${detail !== undefined ? "  " + (typeof detail === "string" ? detail : JSON.stringify(detail)) : ""}`); };

let browser, bot, failed = false, wsClosed = null;
try {
    const puppeteer = loadPuppeteer();
    browser = await puppeteer.launch({ executablePath: chromePath(), headless: process.env.HEADFUL ? false : true, args: chromeArgs() });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 760 });
    const cdp = await page.createCDPSession();
    await cdp.send("Network.enable");
    const sockets = new Map();
    cdp.on("Network.webSocketCreated", (e) => sockets.set(e.requestId, e.url));
    cdp.on("Network.webSocketClosed", (e) => { if ((sockets.get(e.requestId) || "").includes("/s/")) wsClosed = Date.now(); });
    page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !/favicon|Failed to load resource|ERR_|net::|cursors-4u|imgur/.test(t)) errors.push(t.slice(0, 300)); });
    page.on("pageerror", (e) => errors.push("PAGE ERROR " + (e.stack || e.message || "").split("\n").slice(0, 4).join(" | ").slice(0, 400)));

    const session = await loginFull(srv, PLAYER.email, PLAYER.password);
    await page.evaluateOnNewDocument((s) => { try { localStorage.setItem("moo_local_frvr_session", JSON.stringify(s)); } catch (e) {} }, session);
    // exactly what Tampermonkey runs: the @requires in order, then the mod
    await page.evaluateOnNewDocument(LOADER);
    await page.evaluateOnNewDocument(() => {
        function grab() { try { window.dispatchEvent(new CustomEvent("moomoo.js:api", { detail: { resolve: function (m, l) { window.MooMoo = m; window.MooMooLoader = l; } } })); } catch (e) {} }
        grab();
        if (!window.MooMoo) window.addEventListener("moomoo.js:ready", grab, false);
    });
    await page.evaluateOnNewDocument(() => {
        // record every frame that leaves the socket (after the loader), for the checks
        window.__out = [];
        const tap = () => { if (window.MooMooLoader) window.MooMooLoader.onRaw((dir, name, args) => { if (dir === "out") window.__out.push([performance.now(), name, args]); }); else setTimeout(tap, 5); };
        tap();
    });
    await page.evaluateOnNewDocument(MOD);
    await page.goto(srv.base + "/", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#enterGame", { visible: true, timeout: 20000 });
    await tick(1500);

    const now = () => page.evaluate(() => performance.now());
    const framesSince = (t) => page.evaluate((t) => window.__out.filter((f) => f[0] >= t).map((f) => [Math.round(f[0] - t), f[1], f[2]]), t);
    const has = (frames, name, args) => frames.some((f) => f[1] === name && JSON.stringify(f[2]) === JSON.stringify(args));
    const count = (frames, name, pred) => frames.filter((f) => f[1] === name && (!pred || pred(f[2]))).length;

    // ---------------- main menu ----------------
    const menu = await page.evaluate(() => {
        const btn = [...document.querySelectorAll("button.open-menu-button")][0];
        const name = document.getElementById("gameName");
        const cs = getComputedStyle(name);
        const yt = document.getElementById("youtuberOf");
        const fps = [...document.body.children].find((el) => /FPS|Calculating/.test(el.textContent) && el.style.position === "fixed");
        return {
            registered: !!(window.MooMoo.getMods().find((m) => m.id === "moomod") || {}).enabled,
            title: document.title,
            logo: name.textContent, logoSize: cs.fontSize, logoColor: cs.color, logoShadow: cs.textShadow.slice(0, 30),
            loading: document.getElementById("loadingText").innerHTML,
            placeholder: document.getElementById("nameInput").placeholder,
            button: btn ? btn.textContent : null, buttonInCard: !!(btn && btn.closest("#menuDialog")),
            featured: yt ? yt.textContent.replace(/\s+/g, " ").trim() : null, ytLink: !!(yt && yt.querySelector("a.ytLink")),
            fps: fps ? fps.textContent : null,
            built: ["atS", "simpleModal", "hatChangeAlert", "tbtn", "mm-menu-container"].filter((id) => document.getElementById(id)).length
        };
    });
    check("MooMod registered + enabled", menu.registered);
    check("title is MooMod", menu.title === "MooMod", menu.title);
    check("logo reads MooMod, 140px, black with the red 3D shadow", menu.logo === "MooMod" && menu.logoSize === "140px" && menu.logoColor === "rgb(0, 0, 0)" && /rgb\(231, 76, 60\)/.test(menu.logoShadow), menu);
    check("loading text + name placeholder", menu.loading === "Hack Made By Nuro." && menu.placeholder === "Nuro.");
    check("'Open MooMod menu' button on the play card", menu.button === "Open MooMod menu" && menu.buttonInCard);
    check("Featured Hacker: Nuro.", /Nuro\./.test(menu.featured || "") && /Featured Hacker:/.test(menu.featured || "") && menu.ytLink, menu.featured);
    check("FPS counter", /FPS|Calculating/.test(menu.fps || ""), menu.fps);
    check("menus built (F2, ESC, - menu, alert, marker)", menu.built === 5, menu.built);
    const display = (id) => page.evaluate((id) => { const el = document.getElementById(id); return el ? el.style.display : null; }, id);
    await page.click("button.open-menu-button"); await tick(150);
    const openedByButton = await display("mm-menu-container");
    await page.click("button.open-menu-button"); await tick(150);
    check("menu button opens / closes the MooMod menu", openedByButton === "block" && (await display("mm-menu-container")) === "none");

    // ---------------- spawn ----------------
    await page.click("#nameInput", { clickCount: 3 }).catch(() => {});
    await page.type("#nameInput", "moomod").catch(() => {});
    await page.click("#enterGame");
    await page.waitForFunction(() => window.MooMoo && window.MooMoo.self && window.MooMoo.self.alive, { timeout: 25000 });
    await tick(1500);
    await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
    const sid = await page.evaluate(() => window.MooMoo.self.sid);
    note("player sid " + sid);

    // the enemy: an admin bot (gives us stuff, walks up, hits us, drops a trap on us)
    // same game server as the page (its server picker chose one)
    const pageSocket = [...sockets.values()].find((u) => /\/s\//.test(u)) || "";
    const serverKey = (/\/s\/([^?/]+)/.exec(pageSocket) || [])[1] || "LC";
    note("page plays on " + serverKey);
    const mod = await loadProtocolModule(srv);
    const botToken = await login(srv, ENEMY.email, ENEMY.password);
    bot = await createBot({ WS, srv, mod, name: "enemy", url: gameUrl(srv, await joinTicket(srv, botToken, serverKey), mod.BUILD_ID, serverKey) });
    note("enemy sid " + bot.client.sid);
    bot.admin("tp", 7000, 4500);                                  // park it far away for now (middle biome)
    for (const [type, amount] of [[0, 5000], [1, 5000], [2, 5000], [3, 100000]]) bot.admin("give", type, amount, sid);
    bot.admin("weapon", 5, 0, sid);                               // polearm
    bot.admin("weapon", 15, 0, sid);                              // musket
    bot.admin("item", 15, null, sid);                             // pit trap
    bot.admin("item", 17, null, sid);                             // turret
    bot.admin("summon", sid);                                     // ... and bring us next to the bot's spot
    await tick(800);
    bot.admin("tp", 7000, 4500);
    await tick(300);
    // own the hats we'll check (the mod never buys; the store would)
    for (const id of [12, 7, 6, 40, 53, 15, 31]) { await page.evaluate((id) => window.MooMoo.send.store(0, id, false), id); await tick(140); }
    for (const id of [11, 21]) { await page.evaluate((id) => window.MooMoo.send.store(0, id, true), id); await tick(140); }
    await tick(600);
    bot.admin("tp", 1000, 1000);                                  // enemy out of the way
    await tick(1200);
    // bar slots the mod reads off the action bar
    const slots = await page.evaluate(() => [...document.querySelectorAll("#actionBar > div")].filter((d) => d.style.display !== "none").map((d) => +d.id.replace("actionBarItem", "")));
    note("action bar: " + JSON.stringify(slots));

    // ---------------- the 25 ms hat loop ----------------
    let t = await now();
    await page.evaluate(() => { window.MooMoo.send.store(1, 0, false); });   // take the hat off: the loop only re-applies on change...
    await tick(300);
    const me = await page.evaluate(() => ({ x: window.MooMoo.self.x, y: window.MooMoo.self.y }));
    const expectBiome = me.y < 2400 ? 15 : me.y > 6850 && me.y < 7550 ? 31 : 12;
    const hud = await page.evaluate(() => document.getElementById("scoreDisplay").style.color);
    check("HUD coloured by biome", /green|white|blue/i.test(hud), hud);
    const hatFrames = (await page.evaluate(() => window.__out.filter((f) => f[1] === "c").map((f) => f[2]))).map((a) => JSON.stringify(a));
    check("biome hat + monkey tail were put on", hatFrames.includes(JSON.stringify([0, expectBiome, 0])) && hatFrames.includes(JSON.stringify([0, 11, 1])), { expectBiome, sample: hatFrames.slice(0, 8) });

    // ---------------- menus ----------------
    await page.keyboard.press("Minus"); await tick(200);
    const minusOpen = await display("mm-menu-container");
    await page.evaluate(() => document.getElementById("mm-help-menu-item").click()); await tick(100);
    const helpShown = await page.evaluate(() => document.getElementById("mm-help-menu").style.display === "block" && /pro insta/.test(document.getElementById("mm-help-menu").textContent));
    await page.keyboard.press("Minus"); await tick(200);
    check("- opens the MooMod menu (Help tab shows the controls), - closes it", minusOpen === "block" && helpShown && (await display("mm-menu-container")) === "none");
    await page.keyboard.press("F2"); await tick(200);
    const f2 = await display("atS");
    await page.keyboard.press("F2"); await tick(150);
    const f2Again = await display("atS");
    await page.evaluate(() => document.querySelector("#atS .closeit").click()); await tick(150);
    check("F2 opens Auto placement Settings (only opens, x closes)", f2 === "block" && f2Again === "block" && (await display("atS")) === "none");
    await page.keyboard.press("Escape"); await tick(200);
    const esc = await display("simpleModal");
    const hatMenu = await page.evaluate(() => {
        const m = document.getElementById("simpleModal");
        return { title: (m.querySelector("#settingsTitle") || {}).textContent, boxes: m.querySelectorAll("input.keyPressLow").length, spike: document.getElementById("spikeControl").value, bull: document.getElementById("bullHelm").value };
    });
    await page.evaluate(() => document.querySelector("#simpleModal .closeBtn").click()); await tick(150);
    check("ESC opens the MooMod Hat settings (x closes)", esc === "block" && /MooMod Hat settings/.test(hatMenu.title || "") && hatMenu.boxes === 13 && hatMenu.spike === "V" && hatMenu.bull === "�" && (await display("simpleModal")) === "none", hatMenu);

    // ---------------- V: spikes ----------------
    t = await now();
    await page.keyboard.down("v"); await tick(700); await page.keyboard.up("v"); await tick(400);
    let fr = await framesSince(t);
    const spikePicks = count(fr, "z", (a) => a[0] === 6 && a[1] === 0);
    check("hold V places spikes (select spike, click, back to weapon)", spikePicks >= 3 && has(fr, "F", [1, null]) && count(fr, "z", (a) => a[1] === 1) >= 3, { spikePicks });
    await tick(500);
    const markers = await page.evaluate(() => document.querySelectorAll(".mapTarget").length);
    check("your spikes show up on the minimap", markers >= 1, markers);

    // ---------------- L: a ring of four ----------------
    t = await now();
    await page.keyboard.press("l"); await tick(500);
    fr = await framesSince(t);
    check("L: four spikes around you (+4 more from the 'l' keypress)", count(fr, "F", (a) => a[0] === 1 && typeof a[1] === "number") >= 4 && count(fr, "D", (a) => a[0] === 0) >= 1, { F: count(fr, "F") });
    await tick(600);

    // ---------------- a swing: hit hat on, then back ----------------
    await page.evaluate(() => window.MooMoo.send.selectItem(window.MooMoo.self.weapons[0], true)); await tick(300);
    t = await now();
    await page.mouse.move(700, 380);
    await page.mouse.down(); await tick(300); await page.mouse.up(); await tick(400);
    fr = await framesSince(t);
    check("click: tank gear + corrupt wings on, then your own back", has(fr, "c", [0, 40, 0]) && has(fr, "c", [0, 21, 1]) && count(fr, "c") >= 5, fr.filter((f) => f[1] !== "D").slice(0, 14));

    // ---------------- R: the insta ----------------
    await tick(1500);
    t = await now();
    await page.keyboard.press("r"); await tick(600);
    fr = await framesSince(t);
    check("R insta: bull + wings + swing, turret gear + secondary, soldier", has(fr, "c", [0, 7, 0]) && has(fr, "c", [0, 21, 1]) && has(fr, "c", [0, 53, 0]) && has(fr, "z", [15, 1]) && has(fr, "c", [0, 6, 0]) && has(fr, "F", [0, null]), fr.slice(0, 16));

    // ---------------- right click insta ----------------
    await tick(1500);
    t = await now();
    await page.mouse.click(700, 380, { button: "right" }); await tick(900);
    fr = await framesSince(t);
    check("right click insta: turret gear, swing facing 0, secondary at 130 ms", has(fr, "c", [0, 53, 0]) && has(fr, "D", [0]) && has(fr, "F", [1, null]) && has(fr, "z", [15, 1]), fr.slice(0, 14));
    await tick(1200);

    // ---------------- K: auto trap ----------------
    t = await now();
    await page.keyboard.press("k"); await tick(450); await page.keyboard.press("k"); await tick(300);
    fr = await framesSince(t);
    check("K: traps around you every 100 ms", count(fr, "z", (a) => a[0] === 15 && a[1] === 0) >= 4, count(fr, "z", (a) => a[0] === 15));
    await tick(800);

    // ---------------- P: bot mode ----------------
    t = await now();
    await page.keyboard.press("p"); await tick(500); await page.keyboard.press("p"); await tick(300);
    fr = await framesSince(t);
    check("P bot mode: auto gather on/off, 'BotMode By Nuro.', walking", count(fr, "K", (a) => a[0] === 1) === 2 && has(fr, "6", ["BotMode By Nuro."]) && count(fr, "9") >= 3 && has(fr, "9", [null]), { K: count(fr, "K"), moves: count(fr, "9"), chat: fr.filter((f) => f[1] === "6").map((f) => f[2][0]) });
    await tick(800);

    // ---------------- arrows ----------------
    t = await now();
    await page.keyboard.press("ArrowUp"); await tick(700); await page.keyboard.press("ArrowUp"); await tick(200);
    fr = await framesSince(t);
    check("arrow up: chat spam", has(fr, "6", ["Nuro best hacker"]), fr.filter((f) => f[1] === "6").map((f) => f[2][0]));
    await tick(1500);
    t = await now();
    await page.keyboard.press("ArrowDown"); await tick(900); await page.keyboard.press("ArrowDown"); await tick(200);
    fr = await framesSince(t);
    check("arrow down: tribe 'MooMod' scroll", has(fr, "L", ["MooMod"]), fr.filter((f) => /^[LN]$/.test(f[1])).map((f) => f[1] + (f[2][0] || "")));
    await tick(1500);

    // ---------------- Shift: biome hat ----------------
    t = await now();
    await page.keyboard.press("Shift"); await tick(400);
    fr = await framesSince(t);
    check("Shift: biome hat + monkey tail", has(fr, "c", [0, expectBiome, 0]) && has(fr, "c", [0, 11, 1]), fr.filter((f) => f[1] === "c").map((f) => f[2]));
    await tick(500);
    const worn = await page.evaluate(() => window.MooMoo.self.hat);
    check("the hat is actually on (server agrees)", worn === expectBiome || worn === 40, worn);

    // ---------------- an enemy walks up ----------------
    bot.admin("goto", sid); await tick(700);
    const near = await page.evaluate(() => document.getElementById("scoreDisplay").style.color);
    check("enemy close: HUD turns red", /red/i.test(near), near);
    await tick(400);
    const nearHats = (await page.evaluate(() => window.__out.slice(-40).filter((f) => f[1] === "c").map((f) => JSON.stringify(f[2]))));
    check("enemy close: soldier helmet + corrupt wings", nearHats.includes("[0,6,0]") && nearHats.includes("[0,21,1]"), nearHats);

    // auto heal: get hit, eat 120 ms later
    t = await now();
    bot.admin("goto", sid); await tick(80);
    const dir = bot.aimAt(sid);
    bot.client.send("z", [5, 1]);
    bot.client.send("F", [1, dir]); await tick(250); bot.client.send("F", [0, dir]);
    await tick(900);
    fr = await framesSince(t);
    const health = await page.evaluate(() => window.MooMoo.self.health);
    check("auto heal: eats after being hit", has(fr, "z", [0, 0]) && has(fr, "F", [1, null]), { health, food: count(fr, "z", (a) => a[0] === 0 && a[1] === 0) });

    // anti-trap: the enemy drops a pit trap on us -> ring of spikes
    t = await now();
    bot.admin("item", 15, null, null);
    bot.admin("give", 0, 5000, null); bot.admin("give", 2, 5000, null);
    await tick(200);
    bot.admin("goto", sid); await tick(150);
    const tdir = bot.aimAt(sid);
    bot.client.send("z", [15, 0]); await tick(60);
    bot.client.send("F", [1, tdir]); await tick(60); bot.client.send("F", [0, tdir]);
    await tick(800);
    fr = await framesSince(t);
    check("enemy trap next to you: four spikes around you", count(fr, "z", (a) => a[0] === 6 && a[1] === 0) >= 4, count(fr, "z", (a) => a[0] === 6));
    bot.admin("tp", 1000, 1000);
    await tick(800);

    // ---------------- minimap autopilot ----------------
    await page.click("#mapDisplay", { offset: { x: 40, y: 40 } }); await tick(900);
    const trip = await page.evaluate(() => ({ info: !!document.getElementById("infoDiv") && /auto-pilot/.test(document.getElementById("infoDiv").textContent), spots: document.querySelectorAll(".spotDiv").length }));
    await page.evaluate(() => document.getElementById("cancelTrip").click()); await tick(700);
    const tripOff = await page.evaluate(() => getComputedStyle(document.getElementById("infoDiv")).opacity);
    check("minimap click: auto-pilot box + pulses, Cancel fades it", trip.info && trip.spots >= 1 && +tripOff < 0.2, { trip, tripOff });

    // ---------------- every frame was valid for this server ----------------
    const all = await page.evaluate(() => window.__out.map((f) => [f[1], f[2]]));
    const isNum = (v) => typeof v === "number" && isFinite(v);
    const bad = all.filter(([n, a]) => {
        switch (n) {
            case "D": return !isNum(a[0]);
            case "9": return !(a[0] == null || isNum(a[0]));
            case "F": return !(a[1] == null || isNum(a[1]));
            case "z": return !Number.isInteger(a[0]);
            case "c": return !Number.isInteger(a[1]) || (a[0] !== 0 && a[0] !== 1);
            case "K": return a[0] !== 0 && a[0] !== 1;
            case "6": case "L": case "b": return typeof a[0] !== "string";
            default: return false;
        }
    });
    check("every frame was valid (no strikes)", bad.length === 0, bad.slice(0, 5));
    note("frames sent: " + all.length);

    // ---------------- disabling removes everything ----------------
    await page.evaluate(() => window.MooMoo.disable("moomod")); await tick(400);
    const gone = await page.evaluate(() => ({
        left: ["atS", "simpleModal", "hatChangeAlert", "tbtn", "mm-menu-container", "youtuberOf", "infoDiv"].filter((id) => document.getElementById(id)),
        markers: document.querySelectorAll(".mapTarget, .spotDiv").length,
        button: !!document.querySelector("button.open-menu-button"),
        logo: document.getElementById("gameName").textContent,
        title: document.title,
        fps: [...document.body.children].some((el) => /FPS|Calculating/.test(el.textContent) && el.style.position === "fixed")
    }));
    await page.keyboard.press("Minus"); await tick(150);
    check("disabling removes everything and puts the page back", !gone.left.length && !gone.markers && !gone.button && !gone.fps && gone.logo !== "MooMod" && gone.title !== "MooMod", gone);

    // ---------------- clean ----------------
    await tick(400);
    const inc = srv.incidents().filter((l) => !/leave sid/.test(l));
    check("no anti-cheat action", !wsClosed && !inc.length, inc);
    check("no page errors", !errors.length, errors.slice(0, 3).join(" | "));

    if (checks.some((c) => !c.ok)) throw new Error(checks.filter((c) => !c.ok).map((c) => c.name).join("; "));
    console.log("  ✓ all checks passed");
} catch (e) {
    failed = true;
    console.log("  ✗ " + (e && e.message));
} finally {
    console.log("\n  --- timeline ---\n  " + log.join("\n  "));
    if (errors.length) console.log("\n  --- page errors ---\n  " + errors.slice(0, 6).join("\n  "));
    console.log("\n  --- server incidents ---\n  " + (srv.incidents().join("\n  ") || "(none)"));
    try { bot && bot.stop(); } catch (_) {}
    try { browser && await browser.close(); } catch (_) {}
    await srv.stop();
    process.exit(failed ? 1 : 0);
}
