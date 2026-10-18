/*
 * LIVE (REAL CLIENT): MooMoo Lite running in the official client in headless Chrome,
 * against an isolated copy of the server with the anti-cheat on. It proves every
 * feature actually reaches the wire AND that the whole thing stays undetected while
 * they run:
 *   - instakill equips a hat + accessory for the primary & secondary, then restores
 *   - hold-a-mouse-button (left / right) wears a hat+accessory combo and reverts on
 *     release   (driven with REAL trusted mouse events)
 *   - auto heal recovers from an admin bot's hits with no shame
 *   - a place spammer, a hat hotkey, and the menu's new Clicks tab
 *   - the loader's telemetry keeps its flags masked and matches no integrity probe
 *   - no anti-cheat action, no socket close, no page errors
 *
 * Run:  node tests/live/lite.live.test.mjs      (HEADFUL=1 to watch, LIVE_ECHO=1)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { available, startServer, login, loginFull, joinTicket, loadProtocolModule, gameUrl, loadWs, loadPuppeteer, chromePath, chromeArgs } from "./live-server.mjs";
import { createBot, tick, waitFor } from "./live-client.mjs";

if (!available) { console.log("SKIP lite.live: server not found"); process.exit(0); }
const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..", "..");
const LOADER = fs.readFileSync(path.join(ROOT, "loader", "dist", "moomoo-loader.user.js"), "utf8");
const MOD = fs.readFileSync(path.join(ROOT, "mods", "lite.js"), "utf8");

const ATTACKER = { email: "live-attacker@moomoojs.test", password: "local-test" };
const PLAYER = { email: "live-lite@moomoojs.test", password: "local-test" };

// Deterministic config: free hats 51 (Moo Cap) / 28 (Moo Head); accessories 9 (Tree
// Cape) / 12 (Snowball) are bought in-test (points are unlimited on this server).
const LITE_CFG = {
    menuKey: "o",
    insta: { key: "r", mode: "timed", swapDelay: 70, autoAim: false, switchBack: true,
             primaryHat: 51, secondaryHat: 28, primaryAcc: 9, secondaryAcc: 12 },
    clicks: {
        left:  { on: true, hat: 51, acc: 9 },
        right: { on: true, hat: 28, acc: 12 }
    },
    heal: { on: true, legit: true, healAt: 75, showInHand: 0, jitter: 0, maxPerSec: 10, shameSafe: true },
    autogg: { on: true, message: "gg ez" },
    // arrows on, "off-screen only" off so any visible enemy/animal draws (deterministic to check)
    arrows: { on: true, players: true, animals: true, offscreen: false, radius: 120, size: 18 },
    // minimap on with every marker + biomes, so the overlay is deterministic to verify
    minimap: { on: true, items: true, trees: true, bushes: true, stones: true, gold: true, biomes: true, key: "m" },
    hats: [{ key: "k", id: 51 }, { key: "", id: 6 }, { key: "", id: 40 }, { key: "", id: 11 }, { key: "", id: 0 }, { key: "", id: 0 }]
};

const srv = await startServer({ echo: !!process.env.LIVE_ECHO, env: { OWNER_EMAIL: ATTACKER.email } });
console.log("live server on " + srv.base);
const T0 = Date.now();
const log = [], errors = [];
const note = (m) => { const l = `${((Date.now() - T0) / 1000).toFixed(2)}s  ${m}`; log.push(l); if (process.env.LIVE_ECHO) console.log("  " + l); };
const checks = [];
const check = (name, ok, detail) => { checks.push({ name, ok: !!ok, detail }); note(`${ok ? "✓" : "✗"} ${name}${detail ? "  " + detail : ""}`); };

let browser, bot, failed = false, wsClosed = null, gameKey = "LC";
try {
    const puppeteer = loadPuppeteer();
    browser = await puppeteer.launch({ executablePath: chromePath(), headless: process.env.HEADFUL ? false : true, args: chromeArgs() });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    const cdp = await page.createCDPSession();
    await cdp.send("Network.enable");
    const sockets = new Map();
    cdp.on("Network.webSocketCreated", (e) => { sockets.set(e.requestId, e.url); const m = /\/s\/([A-Za-z0-9]+)/.exec(e.url); if (m) gameKey = m[1]; });
    cdp.on("Network.webSocketClosed", (e) => { if ((sockets.get(e.requestId) || "").includes("/s/")) wsClosed = Date.now(); });
    page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !/favicon|Failed to load resource|ERR_|net::/.test(t)) errors.push(t.slice(0, 300)); });
    page.on("pageerror", (e) => errors.push("PAGE ERROR " + (e.message || "").slice(0, 300)));

    const session = await loginFull(srv, PLAYER.email, PLAYER.password);
    await page.evaluateOnNewDocument((s, cfg) => {
        try { localStorage.setItem("moo_local_frvr_session", JSON.stringify(s)); localStorage.setItem("mml_v1", cfg); } catch (e) {}
    }, session, JSON.stringify(LITE_CFG));
    await page.evaluateOnNewDocument(LOADER);
    // The loader has no window.MooMoo (event handshake). Re-expose it for the test's assertions.
    await page.evaluateOnNewDocument(() => {
        function grab() { try { window.dispatchEvent(new CustomEvent("moomoo.js:api", { detail: { resolve: function (m, l) { window.MooMoo = m; window.MooMooLoader = l; } } })); } catch (e) {} }
        grab(); if (!window.MooMoo) window.addEventListener("moomoo.js:ready", grab, false);
    });
    await page.evaluateOnNewDocument(MOD);
    await page.goto(srv.base + "/", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#enterGame", { visible: true, timeout: 20000 });
    await tick(1500);
    await page.click("#nameInput", { clickCount: 3 }).catch(() => {});
    await page.type("#nameInput", "lite").catch(() => {});
    await page.click("#enterGame");
    await page.waitForFunction(() => window.MooMoo && window.MooMoo.self && window.MooMoo.self.sid >= 0 && window.MooMoo.self.alive, { timeout: 25000 });
    const vsid = await page.evaluate(() => window.MooMoo.self.sid);
    await tick(1500);
    await page.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur(); window.__raw = []; window.MooMooLoader.onRaw((dir, name, args) => { if (dir === "out") window.__raw.push({ t: Date.now(), name, args }); }); });
    note("player spawned sid " + vsid);

    // capture helper: store ("c") frames since a time -> [{action,id,acc}]   (wire action 0 = equip)
    const storeSince = (since) => page.evaluate((s) => window.__raw.filter(f => f.name === "c" && f.t >= s).map(f => ({ action: f.args[0], id: f.args[1], acc: !!f.args[2] })), since);
    const worn = () => page.evaluate(() => ({ hat: (window.MooMooLoader.store && window.MooMooLoader.store.hat) || 0, tail: (window.MooMooLoader.store && window.MooMooLoader.store.tail) || 0 }));

    // 1. registered + enabled
    check("MooMoo Lite enabled", await page.evaluate(() => { const m = window.MooMoo.getMods().find(x => x.id === "moomoo-lite"); return m && m.enabled; }));

    // 2. buy the two accessories so the combos can equip them (points are unlimited on this server)
    await page.evaluate(() => { window.MooMoo.send.store(0, 9, true); window.MooMoo.send.store(0, 12, true); });
    await tick(600);
    const own = await page.evaluate(() => ({ a9: window.MooMooLoader.store.ownsTail(9), a12: window.MooMooLoader.store.ownsTail(12), h51: window.MooMooLoader.store.ownsHat(51), h28: window.MooMooLoader.store.ownsHat(28) }));
    check("owns test hats + accessories", own.a9 && own.a12 && own.h51 && own.h28, JSON.stringify(own));

    // 3. INSTAKILL — equips hat+accessory for primary & secondary, then restores
    let mark = Date.now();
    await page.keyboard.press("r"); await tick(600);
    let fr = await storeSince(mark);
    const hatEquips = fr.filter(f => f.action === 0 && !f.acc).map(f => f.id);
    const accEquips = fr.filter(f => f.action === 0 && f.acc).map(f => f.id);
    check("insta equips primary+secondary hats", hatEquips.includes(51) && hatEquips.includes(28), "hatEquips=" + JSON.stringify(hatEquips));
    check("insta equips primary+secondary accessories", accEquips.includes(9) && accEquips.includes(12), "accEquips=" + JSON.stringify(accEquips));
    const instaWorn = await worn();
    check("insta restored the previous loadout (none)", instaWorn.hat === 0 && instaWorn.tail === 0, JSON.stringify(instaWorn));

    // 4. CLICKS LEFT — hold the left button (trusted mouse): wears hat 51 + acc 9 for the
    //    whole hold, then restores the loadout on release.
    await page.mouse.move(640, 360);
    mark = Date.now();
    await page.mouse.down({ button: "left" });
    await tick(1400);
    const duringWorn = await worn();
    await page.mouse.up({ button: "left" });
    await tick(500);
    fr = await storeSince(mark);
    const leftHats = fr.filter(f => f.action === 0 && !f.acc).map(f => f.id);
    const leftAccs = fr.filter(f => f.action === 0 && f.acc).map(f => f.id);
    check("left-hold wears the hold hat (51)", leftHats.includes(51), "hats=" + JSON.stringify(leftHats));
    check("left-hold wears the hold accessory (9)", leftAccs.includes(9), "accs=" + JSON.stringify(leftAccs));
    check("left-hold wears the combo once, no mid-hold flicker", leftHats.filter(id => id === 51).length === 1 && leftAccs.filter(id => id === 9).length === 1 && !leftHats.slice(0, -1).includes(0), "hats=" + JSON.stringify(leftHats) + " accs=" + JSON.stringify(leftAccs));
    check("left-hold keeps the hold hat on the whole time (no reload swap)", duringWorn.hat === 51, "during=" + JSON.stringify(duringWorn));
    const afterLeft = await worn();
    check("left release restored the previous loadout", afterLeft.hat === 0 && afterLeft.tail === 0, JSON.stringify(afterLeft) + " during=" + JSON.stringify(duringWorn));

    // 5. CLICKS RIGHT — hold right button: wears hat 28 + acc 12 (reload off -> no swap)
    await page.mouse.move(640, 360);
    mark = Date.now();
    await page.mouse.down({ button: "right" });
    await tick(500);
    await page.mouse.up({ button: "right" });
    await tick(400);
    fr = await storeSince(mark);
    const rightHats = fr.filter(f => f.action === 0 && !f.acc).map(f => f.id);
    const rightAccs = fr.filter(f => f.action === 0 && f.acc).map(f => f.id);
    check("right-hold wears hat 28 + accessory 12", rightHats.includes(28) && rightAccs.includes(12), `hats=${JSON.stringify(rightHats)} accs=${JSON.stringify(rightAccs)}`);

    // 5b. a click on a UI element (not the game area) must NOT trigger the hold-hat
    const uiBox = await page.evaluate(() => { const b = document.getElementById("actionBarItem0"); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; });
    let uiHats = ["(no actionBarItem0)"];
    if (uiBox && uiBox.w > 0) {
        mark = Date.now();
        await page.mouse.move(uiBox.x, uiBox.y);
        await page.mouse.down({ button: "left" }); await tick(300); await page.mouse.up({ button: "left" });
        await tick(300);
        uiHats = (await storeSince(mark)).filter(f => f.action === 0).map(f => f.id);
    }
    check("hold-hat ignores clicks on UI (action bar), only the game area", uiBox ? !uiHats.includes(51) : true, JSON.stringify(uiHats));

    // 6. place spammer (spike on V): holding puts place frames on the wire
    mark = Date.now();
    await page.keyboard.down("v"); await tick(800); await page.keyboard.up("v"); await tick(200);
    const placeFrames = await page.evaluate((s) => window.__raw.filter(f => f.t >= s && (f.name === "F" || f.name === "z")).length, mark);
    check("spike spammer puts frames on the wire while held", placeFrames >= 4, "frames=" + placeFrames);

    // 6b. item counter: placing spikes puts a count on the spike action-bar icon (slot 16+6),
    //     as a class-only badge with no id (so a kind-4 probe never sees it).
    await tick(500);
    const spikeBadge = await page.evaluate(() => { const s = document.getElementById("actionBarItem22"); const b = s && s.querySelector(".mml-cnt"); return { n: b ? +b.textContent : null, id: b ? !!b.id : null, shown: b ? b.style.display !== "none" : null }; });
    check("item counter shows on the spike icon (no id)", spikeBadge.n > 0 && spikeBadge.id === false && spikeBadge.shown === true, JSON.stringify(spikeBadge));

    // 7. hat hotkey K: equip toggle 51
    await page.keyboard.press("k"); await tick(350);
    const kOn = (await worn()).hat;
    await page.keyboard.press("k"); await tick(350);
    const kOff = (await worn()).hat;
    check("hat hotkey equips then unequips", kOn === 51 && kOff === 0, `on=${kOn} off=${kOff}`);

    // 8. menu opens on O, has the new Clicks tab
    await page.keyboard.press("o"); await tick(300);
    const menu = await page.evaluate(() => ({ open: !!document.querySelector(".mml-gui.open"), tabs: [...document.querySelectorAll(".mml-panel .navitem")].map(n => n.textContent.trim()) }));
    check("menu opens with Clicks + Visual tabs", menu.open && menu.tabs.some(t => /Clicks/i.test(t)) && menu.tabs.some(t => /Visual/i.test(t)), JSON.stringify(menu.tabs));
    // Auto GG lives in the Combat tab with a text input for the message
    const ggCard = await page.evaluate(() => {
        const combat = [...document.querySelectorAll(".mml-gui .navitem")].find(n => /combat/i.test(n.textContent));
        if (combat) combat.click();
        const card = [...document.querySelectorAll(".mml-gui .mod")].find(c => /Auto GG/i.test((c.querySelector(".modtitle") || {}).textContent || ""));
        return { present: !!card, input: card ? !!card.querySelector("input[type=text]") : false };
    });
    check("Combat tab has an Auto GG card with a message input", ggCard.present && ggCard.input, JSON.stringify(ggCard));
    await page.keyboard.press("o"); await tick(200);

    // 8a. AUTO GG — a rising kill count (server sends the killer "N kills <n>") fires one
    //     custom chat message ("6"), once, respecting the anti-spam cooldown.
    const ggFrom = await page.evaluate(() => window.__raw.length);
    await page.evaluate(() => { window.MooMoo._dispatch("playerValue", { key: "kills", value: 1, updateView: true }); });
    await tick(150);
    await page.evaluate(() => { window.MooMoo._dispatch("playerValue", { key: "kills", value: 2, updateView: true }); });  // within cooldown -> no second message
    await tick(250);
    const ggMsgs = await page.evaluate((from) => window.__raw.slice(from).filter(x => x.name === "6").map(x => x.args[0]), ggFrom);
    check("auto GG sends the custom message once per kill (cooldown)", ggMsgs.length === 1 && ggMsgs[0] === "gg ez", JSON.stringify(ggMsgs));

    // 9. AUTO HEAL — an admin bot walks up and hits; auto-heal should keep the player recovering, no shame
    const WS = loadWs();
    const mod = await loadProtocolModule(srv);
    bot = await createBot({ WS, srv, mod, name: "attacker", url: gameUrl(srv, await joinTicket(srv, await login(srv, ATTACKER.email, ATTACKER.password), gameKey), mod.BUILD_ID, gameKey) });
    bot.admin("give", 1, 1000, vsid); bot.admin("goto", vsid); await tick(800);
    await waitFor(() => bot.client.players.has(vsid), 5000, "attacker to see player").catch(() => {});

    // 8b. ARROWS — with an enemy (the attacker) and animals in view, the overlay should carry
    //     a red enemy arrow and a blue animal arrow at the fixed ring distance.
    await tick(600);
    const arrowPx = await page.evaluate(() => {
        const r = window.MooMooLoader.render, cv = r && r.layerCanvas;
        if (!cv || !cv.width) return { err: "no overlay canvas" };
        const d = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height).data;
        let any = 0, red = 0, green = 0, blue = 0, relYellow = 0;
        for (let i = 0; i < d.length; i += 4) {
            if (d[i + 3] < 40) continue; any++;
            const rr = d[i], gg = d[i + 1], bb = d[i + 2];
            if (rr > 230 && gg > 160 && gg < 220 && bb < 110) relYellow++;   // secondary reload bar (#ffc24a)
            else if (rr > 150 && gg < 120 && bb < 120) red++;
            else if (gg > 140 && rr < 130 && bb < 150) green++;
            else if (bb > 150 && rr < 130 && gg < 190) blue++;
        }
        return { any, red, green, blue, relYellow, players: r.players.size, animals: r.animals.size };
    });
    check("arrows: overlay carries arrows (ring drawn)", arrowPx.any > 0, JSON.stringify(arrowPx));
    check("arrows: enemy arrow is red", arrowPx.red > 0, JSON.stringify(arrowPx));
    check("arrows: animal arrow is blue (when animals are in range)", arrowPx.animals === 0 || arrowPx.blue > 0, JSON.stringify(arrowPx));
    // reload bars render under each visible player (the secondary bar's amber is unique to them)
    check("reload bars drawn under players", arrowPx.relYellow > 0, JSON.stringify(arrowPx));
    // the reload value now comes from the combat engine (per-weapon, swap-aware, projectile-aware):
    // a primary swing drops its reload below full, confirming the bar tracks the engine not a timer.
    const selfReload = await page.evaluate(async () => {
        const sleep = (ms) => new Promise(r => setTimeout(r, ms));
        const C = window.MooMooLoader.combat;
        try { window.MooMoo.send.selectItem(window.MooMoo.self.weapons[0], true); } catch (e) {}
        const before = C.self.pr;
        try { window.MooMoo.send.mouse(true, 0); } catch (e) {}
        await sleep(70);
        try { window.MooMoo.send.mouse(false); } catch (e) {}
        await sleep(170);
        return { before, after: C.self.pr, wi: C.self.weaponIndex };
    });
    check("reload bar tracks the combat engine (a swing drops the primary reload)", selfReload.after < 0.99, JSON.stringify(selfReload));

    // 8c. MINIMAP — its own id-less overlay canvas (z 9000) draws biomes + markers over
    //     #mapDisplay; pressing M expands it full-screen. Both states carry no id (kind-4 safe).
    const mini = await page.evaluate(() => {
        const cv = [...document.querySelectorAll("canvas")].find(c => c.style.zIndex === "9000");
        if (!cv || !cv.width) return { err: "no minimap canvas" };
        const d = cv.getContext("2d").getImageData(0, 0, cv.width, cv.height).data;
        let drawn = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 30) drawn++;
        return { hasId: !!cv.id, w: cv.width, drawn };
    });
    check("minimap: id-less overlay present, drawing content", !mini.err && mini.hasId === false && mini.drawn > 0, JSON.stringify(mini));
    await page.keyboard.press("m"); await tick(250);
    const bigMap = await page.evaluate(() => {
        const cv = [...document.querySelectorAll("canvas")].find(c => c.style.zIndex === "9000");
        return cv ? { w: cv.width, big: cv.width > 800, hasId: !!cv.id } : { err: "none" };
    });
    check("minimap: M expands to a full-screen map (no id)", bigMap.big === true && bigMap.hasId === false, JSON.stringify(bigMap));
    await page.keyboard.press("m"); await tick(150);   // close it again
    if (process.env.LITE_SHOT) { try { await page.screenshot({ path: process.env.LITE_SHOT }); } catch (e) {} }

    const hpBefore = await page.evaluate(() => window.MooMoo.self.health);
    for (let i = 0; i < 5 && !wsClosed; i++) { bot.admin("goto", vsid); await tick(60); const d = bot.aimAt(vsid); if (d != null) { bot.client.send("F", [1, d]); await tick(90); bot.client.send("F", [0, d]); } await tick(900); }
    await tick(1500);
    const hpAfter = await page.evaluate(() => window.MooMoo.self.health);
    check("auto heal keeps the player alive and recovering", hpAfter > 0 && hpAfter >= hpBefore - 40, `before=${hpBefore} after=${hpAfter}`);

    // 10. UNDETECTED — no socket close, no anti-cheat action, telemetry masked, no footprint matched
    const inc = srv.incidents().filter((l) => /player/.test(l) && !/leave sid/.test(l));
    check("no socket close / no anti-cheat action", !wsClosed && !inc.length, JSON.stringify(inc));
    const tel = await page.evaluate(() => window.__raw.filter(f => f.name === "T").map(f => f.args));
    const flagsSeen = [...new Set(tel.map(a => a[0]))];
    const probeSeen = [...new Set(tel.map(a => a[2]))];
    check("telemetry flags stay masked (0) while hooked", tel.length === 0 || tel.every(a => a[0] === 0), `T=${tel.length} flags=${JSON.stringify(flagsSeen)}`);
    check("no integrity probe matched the loader/mods", tel.length === 0 || tel.every(a => a[2] === 0), `probeResults=${JSON.stringify(probeSeen)}`);
    // kind 3: nothing of ours is in localStorage mid-session (config lives in the loader's
    // hidden store; the seeded legacy "mml_v1" was migrated + wiped at startup).
    const lsOurs = await page.evaluate(() => Object.keys(localStorage).filter((k) => /^moomoojs:|^mml_v1$/.test(k)));
    check("no moomoo.js localStorage key mid-session (kind-3 clean)", lsOurs.length === 0, JSON.stringify(lsOurs));
    check("no page errors", !errors.length, errors.slice(0, 3).join(" | "));
    note("telemetry rounds observed: " + tel.length);

    const bad = checks.filter(c => !c.ok);
    if (bad.length) throw new Error(bad.map(c => c.name).join("; "));
    console.log("  ✓ ALL LITE LIVE CHECKS PASSED (" + checks.length + ")");
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
