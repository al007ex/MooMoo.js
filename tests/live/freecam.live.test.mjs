/*
 * LIVE (REAL CLIENT): Freecam + Zoom against an isolated copy of the private server,
 * anti-cheat ON. Proves the feature end to end AND that it stays undetected:
 *   - toggling freecam (F) detaches the stock + overlay camera from your body and WASD
 *     flies it around the map (render.view.camX/Y pans while render.me — your true
 *     server position — stays put)
 *   - while freecam is on the client's own "move"/"stopMove" frames are DROPPED (they
 *     never reach the wire), so the server keeps your body parked; with freecam off the
 *     same keys DO send moves
 *   - the whole time the loader's outgoing telemetry "T" reports probeResult 0 — the
 *     freecam touches nothing the anti-cheat can see, and the server logs no incident
 *   - zoom widens the live cull box and (on a localhost build) wraps the client renderer
 *
 * Run:  MOOMOO_SERVER_DIR=/path/to/moomoo-clone-main node tests/live/freecam.live.test.mjs
 *       (HEADFUL=1 to watch, LIVE_ECHO=1 to echo the server log, SHOT=1 to save a screenshot)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { available, startServer, loginFull, loadPuppeteer, chromePath, chromeArgs } from "./live-server.mjs";
import { tick } from "./live-client.mjs";

if (!available) { console.log("SKIP freecam.live: server not found"); process.exit(0); }
const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..", "..");
const LOADER = fs.readFileSync(path.join(ROOT, "loader", "dist", "moomoo-loader.user.js"), "utf8");
const FREECAM = fs.readFileSync(path.join(ROOT, "mods", "freecam.js"), "utf8");

const PLAYER = { email: "live-freecam@moomoojs.test", password: "local-test" };

let pass = 0, fail = 0;
const check = (name, ok, detail) => { if (ok) { pass++; console.log("  ✓ " + name + (detail ? "  " + detail : "")); } else { fail++; console.log("  ✗ " + name + (detail ? "  " + detail : "")); } };

const srv = await startServer({ echo: !!process.env.LIVE_ECHO, env: { IS_SANDBOX: "1", SANDBOX_UNLIMITED: "1" } });
console.log("live server on " + srv.base);
let browser;
try {
    const puppeteer = loadPuppeteer();
    browser = await puppeteer.launch({ executablePath: chromePath(), headless: process.env.HEADFUL ? false : true, args: chromeArgs() });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push(String(e && e.message || e).slice(0, 200)));
    const modLogs = [];
    page.on("console", (m) => { const t = m.text(); if (/Freecam|freecam/.test(t)) modLogs.push(t.replace(/%c|color:[^ ]+|font-weight:bold/g, "").trim().slice(0, 100)); });

    const session = await loginFull(srv, PLAYER.email, PLAYER.password);
    await page.evaluateOnNewDocument((s) => { try { localStorage.setItem("moo_local_frvr_session", JSON.stringify(s)); } catch (e) {} }, session);
    await page.evaluateOnNewDocument(LOADER);
    await page.evaluateOnNewDocument(() => {
        function grab() { try { window.dispatchEvent(new CustomEvent("moomoo.js:api", { detail: { resolve: function (m, l) { window.MooMoo = m; window.MooMooLoader = l; } } })); } catch (e) {} }
        grab(); if (!window.MooMoo) window.addEventListener("moomoo.js:ready", grab, false);
    });
    await page.evaluateOnNewDocument(FREECAM);
    // Tap the wire: collect outgoing packet names, and every outgoing telemetry "T".
    await page.evaluateOnNewDocument(() => {
        window.__out = []; window.__T = [];
        const hook = () => {
            if (!window.MooMooLoader || !window.MooMooLoader.onRaw) return false;
            window.MooMooLoader.onRaw((dir, name, args) => {
                if (dir !== "out") return;
                window.__out.push(name);
                if (name === "T") window.__T.push(args);
            });
            return true;
        };
        if (!hook()) { const iv = setInterval(() => { if (hook()) clearInterval(iv); }, 30); }
    });
    await page.goto(srv.base + "/", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#enterGame", { visible: true, timeout: 20000 });
    await tick(1200);
    await page.click("#nameInput", { clickCount: 3 }).catch(() => {});
    await page.type("#nameInput", "scout").catch(() => {});
    await page.click("#enterGame");
    await page.waitForFunction(() => window.MooMoo && window.MooMoo.self && window.MooMoo.self.sid >= 0 && window.MooMoo.self.alive, { timeout: 35000 });
    await tick(1500);
    // Make sure no menu input keeps focus, so the loader doesn't treat keys as "typing"
    // (a real player clicking into the game gets this for free).
    const defocus = async () => { await page.mouse.click(640, 400); await page.evaluate(() => { try { document.activeElement && document.activeElement.blur && document.activeElement.blur(); } catch (e) {} }); };
    await defocus();
    await tick(200);

    // the mod registered + its settings surface in the Mods tab
    const mod = await page.evaluate(() => (window.MooMoo.getMods() || []).find((m) => m.id === "freecam") || null);
    check("Freecam mod registered with Mods-tab settings", !!(mod && mod.enabled && mod.settings && mod.settings.length >= 5), mod ? (mod.settings.map((s) => s.key).join(",")) : "missing");

    // ---------- Phase A: freecam OFF -> WASD moves the body + sends "move" ----------
    await page.evaluate(() => { window.__out.length = 0; });
    await page.keyboard.down("KeyW");
    await tick(900);
    await page.keyboard.up("KeyW");
    await tick(400);
    const moveWhenOff = await page.evaluate(() => window.__out.filter((n) => n === "9").length);
    check("freecam OFF: holding W sends move frames (\"9\")", moveWhenOff > 0, "moveFrames=" + moveWhenOff);

    // record where my body is now, and the camera, right before detaching
    const before = await page.evaluate(() => {
        const v = window.MooMooLoader.render.view, me = window.MooMooLoader.render.me;
        return { camX: v.camX, camY: v.camY, bodyX: me ? me.x : null, bodyY: me ? me.y : null, override: window.MooMooLoader.render.cameraOverride };
    });
    check("before freecam: overlay camera follows the body (no override)", before.override == null && before.bodyX != null);

    // ---------- toggle freecam ON ----------
    await defocus();
    const typing = await page.evaluate(() => window.MooMooLoader.input.isTyping());
    await page.keyboard.press("KeyF");
    await tick(400);
    const overridden = await page.evaluate(() => window.MooMooLoader.render.cameraOverride);
    check("freecam ON: overlay camera is overridden (detached)", !!(overridden && typeof overridden.x === "number"), JSON.stringify(overridden) + " typing=" + typing + " modLogs=" + JSON.stringify(modLogs.slice(-3)));

    // ---------- Phase B: freecam ON -> WASD flies the camera, body stays, no move sent ----------
    await page.evaluate(() => { window.__out.length = 0; });
    await page.keyboard.down("KeyW");          // fly up
    await tick(1500);
    const flying = await page.evaluate(() => {
        const v = window.MooMooLoader.render.view, me = window.MooMooLoader.render.me;
        return { camX: v.camX, camY: v.camY, bodyX: me ? me.x : null, bodyY: me ? me.y : null };
    });
    await page.keyboard.up("KeyW");
    const moveWhenOn = await page.evaluate(() => window.__out.filter((n) => n === "9" || n === "e").length);

    const camPanned = Math.hypot(flying.camX - before.camX, flying.camY - before.camY);
    const bodyDrift = Math.hypot((flying.bodyX || 0) - (before.bodyX || 0), (flying.bodyY || 0) - (before.bodyY || 0));
    check("freecam ON: the camera flew with WASD", camPanned > 300, "camMoved=" + Math.round(camPanned) + "px (W pushes -Y: " + Math.round(before.camY) + " -> " + Math.round(flying.camY) + ")");
    check("freecam ON: your body stayed parked on the server", bodyDrift < 80, "bodyDrift=" + Math.round(bodyDrift));
    check("freecam ON: the client's move/stopMove frames were dropped", moveWhenOn === 0, "leaked=" + moveWhenOn);

    // ---------- toggle OFF -> camera reattaches ----------
    await page.keyboard.press("KeyF");
    await tick(800);
    const after = await page.evaluate(() => window.MooMooLoader.render.cameraOverride);
    check("freecam OFF again: camera reattaches to the body", after == null);

    // ---------- zoom ----------
    const zoom = await page.evaluate(() => {
        window.MooMoo.setSetting("freecam", "zoom", 60);   // 60% = zoomed out
        const cfg = window.config || {};
        return { cull: cfg.maxScreenWidth, renderer: typeof (window.__renderer && window.__renderer.setTransform) === "function" };
    });
    check("zoom out widens the live cull box (config.maxScreenWidth grows)", zoom.cull > 1920, "maxScreenWidth=" + zoom.cull);
    // The actual render-scale change rides on the client renderer (window.__renderer),
    // which only exists with WebGL. Report it rather than fail — a headless box without
    // WebGL has no renderer, but a real browser on localhost does.
    console.log("  · renderer reachable for zoom-scale (needs WebGL): " + zoom.renderer);

    // ---------- undetected throughout ----------
    const Tbad = await page.evaluate(() => window.__T.filter((a) => Array.isArray(a) && a[2] !== 0).length);
    check("every outgoing telemetry T reports probeResult 0 (undetected)", Tbad === 0, "T frames with a set probe bit=" + Tbad);
    const inc = srv.incidents().filter((l) => !/leave sid/.test(l));
    check("no anti-cheat incident on the server", inc.length === 0, JSON.stringify(inc));
    check("no page errors", pageErrors.length === 0, JSON.stringify(pageErrors));

    // ---------- optional screenshot (visual proof): freecam on, flown up-left, zoomed out ----------
    if (process.env.SHOT) {
        await page.keyboard.press("KeyF"); await tick(300);
        await page.keyboard.down("KeyW"); await page.keyboard.down("KeyA"); await tick(900);
        await page.keyboard.up("KeyW"); await page.keyboard.up("KeyA");
        const shot = path.join(ROOT, "freecam-shot.png");
        await page.screenshot({ path: shot });
        console.log("  · screenshot -> " + shot);
    }
} catch (e) { fail++; console.log("  ✗ ERROR " + (e && e.stack || e)); }
finally { try { browser && await browser.close(); } catch (_) {} await srv.stop(); }

console.log(fail === 0 ? "\n  ✓ FREECAM LIVE OK (" + pass + ")" : "\n  " + fail + " FAILED (" + pass + " passed)");
process.exit(fail === 0 ? 0 : 1);
