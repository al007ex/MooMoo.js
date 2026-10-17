/*
 * LIVE (REAL CLIENT): proves the loader's OBJECT MANAGER tracks the real world.
 * The official client in headless Chrome, loader + moomooplus injected. We:
 *   1. assert natural resources populate on spawn (real "H" packets parsed), and
 *   2. place a spike from the player and assert the object manager reports it as
 *      a spike building owned by the player, then break nothing — just read back
 *      the exact derived fields (name/group/dmg/owner/realScale) live.
 *
 * Run:  node tests/live/objects.live.test.mjs      (HEADFUL=1 to watch)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { available, startServer, loginFull, gameUrl, loadPuppeteer, chromePath, chromeArgs } from "./live-server.mjs";
import { tick } from "./live-client.mjs";

if (!available) { console.log("SKIP objects.live: server not found"); process.exit(0); }
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
    await page.waitForFunction(() => window.MooMoo && window.MooMoo.self && window.MooMoo.self.sid >= 0 && window.MooMoo.self.alive, { timeout: 25000 });
    const vsid = await page.evaluate(() => window.MooMoo.self.sid);
    note(`player spawned sid ${vsid}`);

    // 1) Natural resources should already be tracked from the spawn "H" packets.
    await page.waitForFunction(() => window.MooMooLoader.objects && window.MooMooLoader.objects.count() > 0, { timeout: 8000 });
    const resourceCount = await page.evaluate(() => window.MooMooLoader.objects.count());
    const sampleNames = await page.evaluate(() => window.MooMooLoader.objects.all().slice(0, 6).map((o) => o.name));
    note(`objects on spawn: ${resourceCount}  (e.g. ${JSON.stringify(sampleNames)})`);
    if (!resourceCount) throw new Error("object manager saw no world objects on spawn");

    // 2) Place a spike (item id 6). The spawn is crowded, so sweep directions
    //    (the F packet's dir sets the build angle) until one lands.
    const weapon = await page.evaluate(() => window.MooMoo.self.weaponIndex | 0);
    for (let i = 0; i < 16; i++) {
        const dir = (i / 16) * Math.PI * 2;
        await page.evaluate((d) => {
            window.MooMoo.send.selectItem(6, false);       // select spikes (buildIndex=6)
            window.MooMoo.send.mouse(true, d);             // F[1,dir] -> set dir + build
            window.MooMoo.send.mouse(false, d);
        }, dir);
        await tick(120);
        const got = await page.evaluate((sid) => window.MooMooLoader.objects.all().some((o) => o.group && o.group.name === "spikes" && o.ownerSid === sid), vsid);
        if (got) { note(`spike placed toward ${dir.toFixed(2)} rad`); break; }
    }
    await page.evaluate((w) => window.MooMoo.send.selectItem(w, true), weapon); // weapon back

    const spike = await page.evaluate((sid) => {
        const om = window.MooMooLoader.objects;
        const s = om.all().find((o) => o.group && o.group.name === "spikes" && o.ownerSid === sid);
        if (!s) return null;
        return { name: s.name, group: s.group.name, dmg: s.dmg, health: s.health, ownerSid: s.ownerSid, realScale: s.realScale, scale: s.scale, isItem: s.isItem, isEnemy: om.isEnemyObject(s) };
    }, vsid);
    note("placed spike as seen by object manager: " + JSON.stringify(spike));
    if (!spike) throw new Error("object manager did not track the placed spike");
    if (spike.name !== "spikes" || spike.dmg !== 20 || spike.ownerSid !== vsid) throw new Error("placed spike fields wrong: " + JSON.stringify(spike));
    if (spike.isEnemy !== false) throw new Error("own spike must not read as enemy");
    if (spike.realScale !== spike.scale) throw new Error("building realScale should equal scale");

    // the spike must be queryable by position too
    const nearOk = await page.evaluate((sid) => {
        const om = window.MooMooLoader.objects;
        const me = window.MooMoo.self;
        return om.spikes(me.x, me.y, 400).some((o) => o.ownerSid === sid);
    }, vsid);
    if (!nearOk) throw new Error("spikes() spatial query did not find the placed spike");

    console.log("  ✓ object manager tracks real world objects + a placed spike (fields, owner, spatial query) live");
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
