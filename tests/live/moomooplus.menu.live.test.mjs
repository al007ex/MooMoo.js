/*
 * LIVE (REAL CLIENT): moomooplus's look on join, its M menu and the visual modes.
 * ================================================================================
 * The official client in Chrome with the loader + moomooplus, against an
 * isolated copy of the server. Checks:
 *   join      the stock moomoo.io look: nothing drawn over it, no gear button,
 *             no chat log, the menu shut
 *   M         opens the menu (panels by category), M / Escape close it, and M
 *             never reaches the bundle (it was the spawn pad key there)
 *   overlay   "all visuals" from the menu draws on the stock picture, at you
 *   hotkeys   G is fed to the bundle as its spawn pad key while held
 *   binds     a key bound in the menu toggles its setting
 *   renderer  "bundle renderer" swaps in moomooplus's whole frame, the stock
 *             preset brings the plain look back
 *   always    no page errors, no anti-cheat action, the socket stays up
 *
 * Run:  node tests/live/moomooplus.menu.live.test.mjs   (HEADFUL=1 to watch)
 * Screenshots go to $SHOT_DIR (default: the OS temp dir).
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { available, startServer, loginFull, loadPuppeteer, chromePath, chromeArgs } from "./live-server.mjs";
import { tick } from "./live-client.mjs";

if (!available) { console.log("SKIP moomooplus.menu.live: server not found"); process.exit(0); }
const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..", "..");
const LOADER = fs.readFileSync(process.env.LOADER_PATH || path.join(ROOT, "loader", "dist", "moomoo-loader.user.js"), "utf8");
const MOD = fs.readFileSync(path.join(ROOT, "mods", "moomooplus.js"), "utf8");
const SHOT_DIR = process.env.SHOT_DIR || os.tmpdir();
const PLAYER = { email: "live-menu@moomoojs.test", password: "local-test" };

const srv = await startServer({ echo: !!process.env.LIVE_ECHO });
console.log("live server on " + srv.base);
const T0 = Date.now();
const log = [];
const errors = [];
const note = (m) => { const l = `${((Date.now() - T0) / 1000).toFixed(2)}s  ${m}`; log.push(l); if (process.env.LIVE_ECHO) console.log("  " + l); };
const checks = [];
const check = (name, ok, detail) => { checks.push({ name, ok: !!ok, detail }); note(`${ok ? "✓" : "✗"} ${name}${detail ? "  " + detail : ""}`); };

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
    cdp.on("Network.webSocketClosed", (e) => { if ((sockets.get(e.requestId) || "").includes("/s/")) { wsClosed = Date.now(); note("GAME SOCKET CLOSED"); } });
    page.on("console", (m) => {
        const t = m.text();
        if (m.type() === "error" && !/favicon|Failed to load resource|ERR_|net::/.test(t)) { errors.push(t.slice(0, 600)); note("console.error: " + t.slice(0, 300)); }
    });
    page.on("pageerror", (err) => { errors.push("PAGE ERROR " + (err.stack || err.message).slice(0, 600)); note("PAGE ERROR: " + err.message.slice(0, 300)); });

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
    await page.type("#nameInput", "menu").catch(() => {});
    await page.click("#enterGame");
    await page.waitForFunction(() => window.MooMoo && window.MooMoo.self && window.MooMoo.self.alive, { timeout: 25000 });
    await tick(2500);
    // a real player's focus is on the page after Enter Game, not the name box
    await page.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());

    const shot = async (name) => { const p = path.join(SHOT_DIR, "mmj-" + name + ".png"); await page.screenshot({ path: p }); note("screenshot " + p); };
    const setting = (key) => page.evaluate((k) => window.MooMoo.getMods().find((m) => m.id === "moomooplus").settings.find((s) => s.key === k).value, key);
    const bundle = (src) => page.evaluate((s) => window.__mmp.eval(s), src);
    const guiOpen = () => page.evaluate(() => !!document.querySelector(".mmjp-gui.open"));
    // pixels drawn on the overlay layer within r px of where you are
    const layerInkAtMe = (r = 40) => page.evaluate((r) => {
        const rd = window.MooMooLoader.render;
        const c = rd.layerCanvas;
        if (!c || c.style.display === "none" || !rd.me) return 0;
        const p = rd.worldToScreen(rd.me.x, rd.me.y);
        const k = c.width / window.innerWidth;
        const d = c.getContext("2d").getImageData(Math.round((p.x - r) * k), Math.round((p.y - r) * k), Math.round(2 * r * k), Math.round(2 * r * k)).data;
        let n = 0;
        for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++;
        return n;
    }, r);
    async function rowBox(label) {
        return page.evaluate((label) => {
            const r = [...document.querySelectorAll(".mmjp-gui .mm")].find((x) => { const n = x.querySelector(".mm-name"); return n && n.textContent === label; });
            if (!r) return null;
            const panel = r.closest(".mp");
            if (panel && panel.classList.contains("folded")) panel.querySelector(".mp-head").dispatchEvent(new MouseEvent("mousedown", { button: 0, bubbles: true, clientX: 0, clientY: 0 })), window.dispatchEvent(new MouseEvent("mouseup", { button: 0, clientX: 0, clientY: 0 }));
            r.scrollIntoView({ block: "nearest" });
            if (panel) panel.style.zIndex = "9999";            // a user would see it on top before clicking
            const b = r.getBoundingClientRect();
            if (!b.width) return null;
            const at = { x: b.left + b.width / 2, y: b.top + b.height / 2 };
            const hit = document.elementFromPoint(at.x, at.y);
            return hit && r.contains(hit) ? at : null;
        }, label);
    }
    async function clickRow(label, button = "left") {
        const b = await rowBox(label);
        if (!b) throw new Error("menu row not visible: " + label);
        await page.mouse.click(b.x, b.y, { button });
        await tick(120);
    }

    // ---- join: the stock look ----
    const v0 = await page.evaluate(() => {
        const rd = window.MooMooLoader.render;
        const fab = document.getElementById("mmj-cfg-fab");
        const gc = document.getElementById("gameCanvas");
        const hist = document.querySelector(".chat-container .chat-history");
        return {
            replacing: rd.replacing,
            layer: rd.layerCanvas ? rd.layerCanvas.style.display : "(none)",
            stockShown: gc ? gc.style.visibility !== "hidden" : null,
            fab: fab ? getComputedStyle(fab).display : "(none)",
            chatLog: hist ? hist.style.display : "(none)"
        };
    });
    check("join: stock picture, nothing replaced", !v0.replacing && v0.stockShown, JSON.stringify(v0));
    check("join: nothing drawn over it", v0.layer === "none" || v0.layer === "(none)");
    check("join: no gear button", v0.fab === "none" || v0.fab === "(none)");
    check("join: chat log hidden", v0.chatLog === "none");
    check("join: menu shut", !(await guiOpen()));
    await shot("1-join-stock");

    // ---- M opens the menu ----
    await page.keyboard.press("m");
    await tick(300);
    const v1 = await page.evaluate(() => ({
        open: !!document.querySelector(".mmjp-gui.open"),
        heads: [...document.querySelectorAll(".mmjp-gui .mp")].filter((p) => p.style.display !== "none").map((p) => p.querySelector(".mp-head").textContent)
    }));
    check("M opens the menu", v1.open);
    check("panels by category", v1.heads.length >= 10, v1.heads.join(" · "));
    check("M never reaches the bundle (its spawn pad key)", (await bundle("m.m")) == null);
    await shot("2-menu");

    // ---- all visuals from the menu: drawn on the stock picture, at you ----
    await clickRow("Info Overlay");
    check("click turns all visuals on", (await setting("all visuals")) === true);
    check("its row lights up", await page.evaluate(() => [...document.querySelectorAll(".mmjp-gui .mm.on .mm-name")].some((n) => n.textContent === "Info Overlay")));
    await page.keyboard.press("m");
    await tick(700);
    check("M closes the menu", !(await guiOpen()));
    const ink = await layerInkAtMe();
    check("overlay draws on the stock picture, at you", ink > 20, `ink pixels=${ink}`);
    check("still the stock picture underneath", !(await page.evaluate(() => window.MooMooLoader.render.replacing)));
    await shot("3-all-visuals-on-stock");

    // ---- Escape closes the M menu; with it shut, Escape doesn't reopen it (it's the game's own) ----
    await page.keyboard.press("m");
    await tick(200);
    check("M reopens the menu", await guiOpen());
    await page.keyboard.press("Escape");
    await tick(200);
    check("Escape closes the M menu", !(await guiOpen()));
    await page.keyboard.press("Escape");
    await tick(200);
    check("Escape with the menu shut doesn't open it", !(await guiOpen()));

    // ---- G = the bundle's spawn pad key while held ----
    await page.keyboard.down("g");
    await tick(200);
    const held = await bundle("m.m");
    await page.keyboard.up("g");
    await tick(150);
    const released = await bundle("m.m");
    check("holding G holds the bundle's spawn pad key", held >= 1 && released === 0, `held=${held} released=${released}`);

    // ---- a key bound in the menu ----
    await page.keyboard.press("m");
    await tick(200);
    await clickRow("Auto Heal", "right");
    const bindBtn = await page.evaluate(() => {
        const r = [...document.querySelectorAll(".mmjp-gui .mm")].find((x) => x.querySelector(".mm-name").textContent === "Auto Heal");
        const b = r.parentNode.querySelector(".mm-bindbtn");
        if (!b) return null;
        const bb = b.getBoundingClientRect();
        const at = { x: bb.left + bb.width / 2, y: bb.top + bb.height / 2 };
        return document.elementFromPoint(at.x, at.y) === b ? at : null;   // on top, clickable
    });
    check("right click opens the options", !!bindBtn);
    if (bindBtn) {
        await page.mouse.click(bindBtn.x, bindBtn.y);
        await tick(350);   // longer than the menu's 200 ms refresh
        const waiting = await page.evaluate(() => { const b = document.querySelector(".mmjp-gui .mm-bindbtn.grab"); return b ? b.textContent : null; });
        check("bind button waits for a key", waiting === "press a key…", String(waiting));
        const overlap = await page.evaluate(() => {
            // docked panels never overlap, even with a module's options open
            const boxes = [...document.querySelectorAll(".mmjp-gui .mp")].filter((p) => p.style.display !== "none").map((p) => p.getBoundingClientRect());
            for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
                const a = boxes[i], b = boxes[j];
                if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) return true;
            }
            return false;
        });
        check("panels don't overlap with options open", !overlap);
        await shot("2b-options-open");
        await page.keyboard.press("k");
        await tick(150);
        const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("mmp_menu_v2") || "{}").binds);
        check("bind saved", stored && stored["auto heal"] === "k", JSON.stringify(stored));
        await page.keyboard.press("m");
        await tick(150);
        const before = await setting("auto heal");
        await page.keyboard.press("k");
        await tick(150);
        const after = await setting("auto heal");
        await page.keyboard.press("k");
        await tick(150);
        const back = await setting("auto heal");
        check("the bound key toggles it", before === true && after === false && back === true, `${before} -> ${after} -> ${back}`);
    }

    // a Hotkeys row does what its key does (auto hit = the bundle's E)
    await page.keyboard.press("m");
    await tick(200);
    const ctBefore = await bundle("Ct");
    await clickRow("Auto Hit");
    const ctAfter = await bundle("Ct");
    await clickRow("Auto Hit");
    const ctBack = await bundle("Ct");
    check("clicking a hotkey row presses its key", ctBefore === false && ctAfter === true && ctBack === false, `${ctBefore} -> ${ctAfter} -> ${ctBack}`);
    await page.keyboard.press("m");
    await tick(150);
    check("menu key still M", await page.evaluate(() => JSON.parse(localStorage.getItem("mmp_menu_v2") || "{}").menuKey === "m"));

    // ---- bundle renderer from the menu ----
    await page.keyboard.press("m");
    await tick(200);
    await clickRow("Custom Renderer");
    await tick(600);
    const v4 = await page.evaluate(() => {
        const rd = window.MooMooLoader.render;
        const gc = document.getElementById("gameCanvas");
        return { replacing: rd.replacing, frame: rd.frameCanvas && rd.frameCanvas.style.display, stockHidden: gc && gc.style.visibility === "hidden" };
    });
    check("bundle renderer takes over the frame", v4.replacing && v4.frame === "block" && v4.stockHidden, JSON.stringify(v4));
    await shot("4-menu-over-bundle-renderer");
    await page.keyboard.press("m");
    await tick(500);
    await shot("5-bundle-renderer");

    // ---- the stock preset brings the plain look back ----
    await page.keyboard.press("m");
    await tick(200);
    const stockBtn = await page.evaluate(() => {
        const b = [...document.querySelectorAll(".mmjp-gui .mm-btn")].find((x) => x.textContent === "stock look");
        if (!b) return null;
        const r = b.getBoundingClientRect();
        return r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
    });
    check("stock preset button shown", !!stockBtn);
    if (stockBtn) await page.mouse.click(stockBtn.x, stockBtn.y);
    await page.keyboard.press("m");
    await tick(600);
    const v5 = await page.evaluate(() => {
        const rd = window.MooMooLoader.render;
        const gc = document.getElementById("gameCanvas");
        return { replacing: rd.replacing, layer: rd.layerCanvas ? rd.layerCanvas.style.display : "(none)", stockShown: gc && gc.style.visibility !== "hidden" };
    });
    check("stock preset: plain look again", !v5.replacing && v5.stockShown && (v5.layer === "none" || v5.layer === "(none)"), JSON.stringify(v5));
    check("stock preset: all visuals off", (await setting("all visuals")) === false);

    // ---- overlay lines up at another aspect ratio ----
    await page.setViewport({ width: 1000, height: 800 });
    await page.evaluate(() => window.MooMoo.setSetting("moomooplus", "all visuals", true));
    await tick(800);
    const ink2 = await layerInkAtMe();
    check("overlay at you at 1000x800 too", ink2 > 20, `ink pixels=${ink2}`);
    await shot("6-all-visuals-1000x800");
    await page.evaluate(() => window.MooMoo.setSetting("moomooplus", "all visuals", false));

    // ---- always ----
    await tick(500);
    const inc = srv.incidents().filter((l) => !/leave sid/.test(l));
    check("no anti-cheat action", !inc.length, JSON.stringify(inc));
    check("socket stayed up", !wsClosed);
    check("no errors in the page", !errors.length, errors.slice(0, 3).join("\n---\n"));
    if (checks.some((c) => !c.ok)) throw new Error(checks.filter((c) => !c.ok).map((c) => c.name).join("; "));
    console.log("  ✓ all checks passed");
} catch (e) {
    failed = true;
    console.log("  ✗ " + (e && e.message));
} finally {
    console.log("\n  --- timeline ---\n  " + log.join("\n  "));
    if (errors.length) console.log("\n  --- page errors ---\n  " + errors.slice(0, 8).join("\n  ---\n  "));
    console.log("\n  --- server incidents ---\n  " + (srv.incidents().join("\n  ") || "(none)"));
    try { browser && await browser.close(); } catch (_) {}
    await srv.stop();
    process.exit(failed ? 1 : 0);
}
