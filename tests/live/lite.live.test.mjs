/*
 * LIVE (REAL CLIENT): the MooMoo Lite mod running in the official client in Chrome
 * against an isolated copy of the server. It proves the mod's headline features
 * actually reach the server and that it coexists with normal play:
 *   - the mod registers + enables
 *   - its menu opens / closes on the menu key
 *   - a place spammer (spike on V) puts place frames on the wire while held
 *   - a hat hotkey equips a hat (a store frame goes out)
 *   - no anti-cheat action, no page errors
 *
 * Run:  node tests/live/lite.live.test.mjs   (HEADFUL=1 to watch, LIVE_ECHO=1)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { available, startServer, loginFull, loadPuppeteer, chromePath, chromeArgs } from "./live-server.mjs";
import { tick } from "./live-client.mjs";

if (!available) { console.log("SKIP lite.live: server not found"); process.exit(0); }
const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..", "..");
const LOADER = fs.readFileSync(path.join(ROOT, "loader", "dist", "moomoo-loader.user.js"), "utf8");
const MOD = fs.readFileSync(path.join(ROOT, "mods", "lite.js"), "utf8");
const PLAYER = { email: "live-lite@moomoojs.test", password: "local-test" };

const srv = await startServer({ echo: !!process.env.LIVE_ECHO, env: { DEBUG_PACKETS: "1" } });
console.log("live server on " + srv.base);
const T0 = Date.now();
const log = [], errors = [];
const note = (m) => { const l = `${((Date.now() - T0) / 1000).toFixed(2)}s  ${m}`; log.push(l); if (process.env.LIVE_ECHO) console.log("  " + l); };
const checks = [];
const check = (name, ok, detail) => { checks.push({ name, ok: !!ok, detail }); note(`${ok ? "✓" : "✗"} ${name}${detail ? "  " + detail : ""}`); };

// count decoded c2s frames the server logs (DEBUG_PACKETS): "[LC] <- F [...]"
const seen = {};
srv.onLine((l) => { const m = /<- ([A-Za-z0-9]) /.exec(l); if (m) seen[m[1]] = (seen[m[1]] || 0) + 1; });

let browser, failed = false, wsClosed = null;
try {
    const puppeteer = loadPuppeteer();
    browser = await puppeteer.launch({ executablePath: chromePath(), headless: process.env.HEADFUL ? false : true, args: chromeArgs() });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    const cdp = await page.createCDPSession();
    await cdp.send("Network.enable");
    const sockets = new Map();
    cdp.on("Network.webSocketCreated", (e) => sockets.set(e.requestId, e.url));
    cdp.on("Network.webSocketClosed", (e) => { if ((sockets.get(e.requestId) || "").includes("/s/")) wsClosed = Date.now(); });
    page.on("console", (m) => { const t = m.text(); if (m.type() === "error" && !/favicon|Failed to load resource|ERR_|net::/.test(t)) errors.push(t.slice(0, 300)); });
    page.on("pageerror", (e) => errors.push("PAGE ERROR " + (e.message || "").slice(0, 300)));

    const session = await loginFull(srv, PLAYER.email, PLAYER.password);
    // seed the mod's config so the test keys are deterministic (spike on V, a hat on K)
    await page.evaluateOnNewDocument((s) => {
        try {
            localStorage.setItem("moo_local_frvr_session", JSON.stringify(s));
            localStorage.setItem("mml_v1", JSON.stringify({ menuKey: "o", hats: [{ key: "k", id: 51 }] }));   // 51 = Moo Cap (free, owned)
        } catch (e) {}
    }, session);
    await page.evaluateOnNewDocument(LOADER);
    await page.evaluateOnNewDocument(MOD);
    await page.goto(srv.base + "/", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#enterGame", { visible: true, timeout: 20000 });
    await tick(1500);
    await page.click("#nameInput", { clickCount: 3 }).catch(() => {});
    await page.type("#nameInput", "lite").catch(() => {});
    await page.click("#enterGame");
    await page.waitForFunction(() => window.MooMoo && window.MooMoo.self && window.MooMoo.self.alive, { timeout: 25000 });
    await tick(2000);
    await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());

    // 1. registered + enabled
    const enabled = await page.evaluate(() => { const m = window.MooMoo.getMods().find((x) => x.id === "moomoo-lite"); return m && m.enabled; });
    check("MooMoo Lite enabled", enabled);

    const wornHat = () => page.evaluate(() => (window.MooMooLoader.store && window.MooMooLoader.store.hat) || 0);

    // 2. hat hotkey actually equips AND unequips (K -> Moo Cap 51 -> off)
    await page.keyboard.press("k"); await tick(400);
    const onHat = await wornHat();
    await page.keyboard.press("k"); await tick(400);
    const offHat = await wornHat();
    check("hat hotkey equips the hat", onHat === 51, `worn=${onHat}`);
    check("hat hotkey unequips (toggle)", offHat === 0, `worn=${offHat}`);

    // 3. spike spammer on V: holding it puts place frames on the wire
    const fBefore = seen.F || 0, zBefore = seen.z || 0;
    await page.keyboard.down("v"); await tick(900); await page.keyboard.up("v"); await tick(200);
    const placed = (seen.F || 0) - fBefore, selects = (seen.z || 0) - zBefore;
    check("spike spammer places while held", placed >= 3 && selects >= 3, `F+${placed} z+${selects}`);

    // 4. menu: opens on O, is opaque (light card), and the hat picker shows icons you can pick
    await page.keyboard.press("o"); await tick(250);
    check("menu opens on its key", await page.evaluate(() => !!document.querySelector("#mml-gui.open")));
    const bg = await page.evaluate(() => getComputedStyle(document.getElementById("mml-card")).backgroundColor);
    check("menu card is opaque", /^rgb\(/.test(bg) && !/rgba/.test(bg), bg);
    const pickInfo = await page.evaluate(() => {
        const btn = document.querySelector("#mml-card .hatbtn");
        if (!btn) return { err: "no hat button" };
        btn.click();
        const pick = document.getElementById("mml-pick");
        if (!pick) return { err: "picker did not open" };
        const imgs = [...pick.querySelectorAll(".tile img")];
        const icons = imgs.filter((i) => /\/img\/hats\/hat_\d+\.png$/.test(i.getAttribute("src") || "")).length;
        const soldier = imgs.find((i) => /hat_6\.png$/.test(i.getAttribute("src") || ""));
        if (soldier) soldier.closest(".tile").click();   // pick Soldier Helmet (id 6)
        const stored = JSON.parse(localStorage.getItem("mml_v1") || "{}");
        return { icons, pickedId: stored.hats && stored.hats[0] && stored.hats[0].id, btnImg: (btn.querySelector("img") || {}).getAttribute ? btn.querySelector("img").getAttribute("src") : null };
    });
    check("hat picker shows hat icons", (pickInfo.icons || 0) >= 10, JSON.stringify(pickInfo));
    check("picking a hat updates the row + saves", pickInfo.pickedId === 6 && /hat_6\.png$/.test(pickInfo.btnImg || ""), JSON.stringify(pickInfo));
    // the title is gone from the menu
    check("menu has no 'MooMoo Lite' title", await page.evaluate(() => !/MooMoo Lite/.test(document.getElementById("mml-card").textContent)));
    // any key can be bound to a hat hotkey (a non-letter: Backspace)
    await page.evaluate(() => { const row = [...document.querySelectorAll("#mml-card .row")].find((r) => r.querySelector(".hatbtn")); row.querySelector(".kb").click(); });
    await page.keyboard.press("Backspace"); await tick(200);
    const boundKey = await page.evaluate(() => { const s = JSON.parse(localStorage.getItem("mml_v1") || "{}"); return s.hats && s.hats[0] && s.hats[0].key; });
    check("can bind any key (Backspace) to a hat", boundKey === "Backspace", `key=${boundKey}`);
    await page.keyboard.press("o"); await tick(250);
    check("menu closes on its key", await page.evaluate(() => !document.querySelector("#mml-gui.open")));

    // 5. clean
    await tick(400);
    const inc = srv.incidents().filter((l) => /player/.test(l) && !/leave sid/.test(l));
    check("no anti-cheat action", !wsClosed && !inc.length, JSON.stringify(inc));
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
    try { browser && await browser.close(); } catch (_) {}
    await srv.stop();
    process.exit(failed ? 1 : 0);
}
