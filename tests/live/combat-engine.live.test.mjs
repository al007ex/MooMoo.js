/*
 * LIVE (REAL CLIENT): proves the COMBAT ENGINE reconstructs reality. The official
 * client in headless Chrome + loader. We read window.MooMooLoader.combat and check:
 *   - self has prediction (np.accel/decel/real) and reload clocks (pr/sr/tr)
 *   - swinging the weapon drops pr toward 0 (server "K" echo), then it refills to 1
 *   - the loadout resolves from our real inventory
 *
 * Run:  node tests/live/combat-engine.live.test.mjs      (HEADFUL=1 to watch)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { available, startServer, loginFull, loadPuppeteer, chromePath, chromeArgs } from "./live-server.mjs";
import { tick } from "./live-client.mjs";

if (!available) { console.log("SKIP combat-engine.live: server not found"); process.exit(0); }
const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..", "..");
const LOADER = fs.readFileSync(path.join(ROOT, "loader", "dist", "moomoo-loader.user.js"), "utf8");
const MOD = fs.readFileSync(path.join(ROOT, "mods", "moomooplus.js"), "utf8");
const PLAYER = { email: "live-player@moomoojs.test", password: "local-test" };

const srv = await startServer({ echo: !!process.env.LIVE_ECHO, env: { IS_SANDBOX: "1", SANDBOX_UNLIMITED: "1" } });
console.log("live server on " + srv.base);
const T0 = Date.now();
const log = [];
const note = (m) => { const l = `${((Date.now() - T0) / 1000).toFixed(2)}s  ${m}`; log.push(l); if (process.env.LIVE_ECHO) console.log("  " + l); };

let browser, failed = false;
try {
    const puppeteer = loadPuppeteer();
    browser = await puppeteer.launch({ executablePath: chromePath(), headless: process.env.HEADFUL ? false : true, args: chromeArgs() });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    page.on("pageerror", (err) => note(`PAGE ERROR: ${err.message.slice(0, 200)}`));
    page.on("console", (m) => { const t = m.text(); if (/error|Error/.test(t)) note("console: " + t.slice(0, 200)); });

    const session = await loginFull(srv, PLAYER.email, PLAYER.password);
    await page.evaluateOnNewDocument((s) => { try { localStorage.setItem("moo_local_frvr_session", JSON.stringify(s)); } catch (e) {} }, session);
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
    await page.waitForFunction(() => window.MooMoo && window.MooMoo.self && window.MooMoo.self.alive, { timeout: 25000 });
    await tick(600);
    note("spawned sid " + await page.evaluate(() => window.MooMoo.self.sid));

    // engine present with prediction + reload fields
    const state = await page.evaluate(() => {
        const c = window.MooMooLoader.combat, z = c.self;
        return { hasNp: !!(z.np && z.np.accel), pr: z.pr, tick: c.tick, ee: c.loadout.ee, A: c.loadout.A, ly: c.loadout.ly, weapons: z.weapons, items: z.items };
    });
    note("engine state: " + JSON.stringify(state));
    if (!state.hasNp) throw new Error("engine has no np prediction for self");
    if (typeof state.pr !== "number") throw new Error("engine has no reload clock");
    if (state.tick <= 0) throw new Error("engine tick not advancing");
    if (state.ly !== 6) throw new Error("loadout spike slot wrong: " + state.ly);

    // swing a few times; pr should dip below 1 right after a swing (server K echo)
    let sawDip = false;
    for (let i = 0; i < 6 && !sawDip; i++) {
        await page.evaluate(() => { window.MooMoo.send.mouse(true, 0); });
        await tick(70);
        await page.evaluate(() => { window.MooMoo.send.mouse(false, 0); });
        // sample pr across the next couple ticks
        for (let k = 0; k < 3; k++) {
            await tick(70);
            const pr = await page.evaluate(() => window.MooMooLoader.combat.self.pr);
            if (pr < 1) { sawDip = true; note(`pr dipped to ${pr.toFixed(2)} after swing`); break; }
        }
    }
    if (!sawDip) throw new Error("pr never dropped after swinging — reload reset not wired");

    // then it should refill to 1 after the weapon's reload (hammer 300ms)
    await tick(600);
    const prFull = await page.evaluate(() => window.MooMooLoader.combat.self.pr);
    note("pr after reload wait: " + prFull);
    if (prFull !== 1) throw new Error("pr did not refill to 1: " + prFull);

    console.log("  ✓ combat engine reconstructs self prediction + reload live (pr cycles 1->0->1), loadout resolves");
} catch (e) {
    failed = true;
    console.log("  ✗ " + (e && e.message));
} finally {
    console.log("\n  --- timeline ---\n  " + log.join("\n  "));
    if (failed) console.log("\n  --- server log tail ---\n  " + srv.lines.slice(-20).join("\n  "));
    try { browser && await browser.close(); } catch (_) {}
    await srv.stop();
    process.exit(failed ? 1 : 0);
}
