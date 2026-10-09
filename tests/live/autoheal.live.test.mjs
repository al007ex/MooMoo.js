/*
 * LIVE: take real damage on a real server with examplescript running.
 * ====================================================================
 * Boots an isolated copy of the moomoo-clone server, connects:
 *   - an attacker bot (admin test account -> /goto + /give)
 *   - a victim running the real loader + mods/examplescript.js
 * then hits the victim and checks that the server's anti-cheat never closes,
 * kicks or shames it, and that auto-heal actually heals.
 *
 * Phases:
 *   A  auto-heal OFF, 2 hits      -> isolates the loader itself
 *   B  auto-heal ON, pulsed hits  -> the normal case
 *   C  auto-heal ON, held attack  -> stress (hits every swing)
 *
 * Run:  node tests/live/autoheal.live.test.mjs        (LIVE_ECHO=1 to see the server log)
 * Test accounts are local-only (the server's auth stand-in accepts any password).
 */
import assert from "node:assert";
import { available, startServer, login, joinTicket, loadProtocolModule, gameUrl, loadWs } from "./live-server.mjs";
import { createVictim, createBot, tick, waitFor } from "./live-client.mjs";

if (!available) { console.log("SKIP autoheal.live: moomoo-clone server not found (set MOOMOO_SERVER_DIR)"); process.exit(0); }

// Local test accounts (only ever exist in the isolated server copy).
const ATTACKER = { email: "live-attacker@moomoojs.test", password: "local-test" };
const VICTIM = { email: "live-victim@moomoojs.test", password: "local-test" };

const WS = loadWs();
const srv = await startServer({ echo: !!process.env.LIVE_ECHO, env: { OWNER_EMAIL: ATTACKER.email, DEBUG_PACKETS: process.env.LIVE_DEBUG ? "1" : "" } });
console.log("live server on " + srv.base);

let victim, bot, failed = false;
const timeline = [];
const note = (msg) => { const line = `${((Date.now() - T0) / 1000).toFixed(2)}s  ${msg}`; timeline.push(line); if (process.env.LIVE_ECHO) console.log("  " + line); };
let T0 = Date.now();

try {
    const mod = await loadProtocolModule(srv);
    const victimToken = await login(srv, VICTIM.email, VICTIM.password);
    const botToken = await login(srv, ATTACKER.email, ATTACKER.password);

    victim = await createVictim({
        WS, srv, mod, name: "victim",
        url: gameUrl(srv, await joinTicket(srv, victimToken), mod.BUILD_ID),
        configure: (MooMoo) => MooMoo.setSetting("examplescript", "autoHeal", false)
    });
    bot = await createBot({ WS, srv, mod, name: "attacker", url: gameUrl(srv, await joinTicket(srv, botToken), mod.BUILD_ID) });
    T0 = Date.now();
    const vsid = victim.client.sid;
    note(`victim sid ${vsid}, attacker sid ${bot.client.sid}`);

    victim.MooMoo.on("health", (p) => { if (p.sid === vsid) note(`victim health -> ${p.value}`); });
    victim.MooMoo.on("disconnect", (p) => note(`victim got disconnect packet: ${p.reason}`));

    bot.admin("give", 1, 1000, vsid);      // food so auto-heal can eat
    bot.admin("goto", vsid);
    await tick(400);
    await waitFor(() => bot.client.players.has(vsid), 4000, "attacker to see victim");

    async function hit() {
        bot.admin("goto", vsid);
        await tick(60);
        const dir = bot.aimAt(vsid);
        if (dir == null) return;
        bot.client.send("F", [1, dir]);
        await tick(90);
        bot.client.send("F", [0, dir]);
    }
    const victimDown = () => victim.client.closed || victim.client.disconnectReason;

    // ---- A: auto-heal OFF ----
    note("PHASE A: auto-heal off, 2 hits");
    for (let i = 0; i < 2 && !victimDown(); i++) { await hit(); await tick(1200); }
    await tick(800);
    assert.ok(!victimDown(), "victim dropped with auto-heal OFF (loader problem): " + JSON.stringify(victim.client.closed || victim.client.disconnectReason));

    // ---- B: auto-heal ON, pulsed ----
    note("PHASE B: auto-heal on, pulsed hits");
    victim.MooMoo.setSetting("examplescript", "autoHeal", true);
    const healthLow = [];
    for (let i = 0; i < 6 && !victimDown(); i++) { await hit(); healthLow.push(victim.client.health); await tick(1400); }
    await tick(800);
    assert.ok(!victimDown(), "victim dropped with auto-heal ON (pulsed): " + JSON.stringify(victim.client.closed || victim.client.disconnectReason));

    // ---- C: held attack ----
    note("PHASE C: held attack for 4s");
    bot.admin("goto", vsid);
    await tick(80);
    let dir = bot.aimAt(vsid);
    bot.client.send("F", [1, dir]);
    for (let i = 0; i < 16 && !victimDown(); i++) { await tick(250); bot.admin("goto", vsid); dir = bot.aimAt(vsid) ?? dir; }
    bot.client.send("F", [0, dir]);
    await tick(1500);
    assert.ok(!victimDown(), "victim dropped with auto-heal ON (held attack): " + JSON.stringify(victim.client.closed || victim.client.disconnectReason));

    // ---- healing actually happened ----
    const ups = timeline.filter((l) => /victim health -> (\d+)/.test(l)).map((l) => +/-> (\d+)/.exec(l)[1]);
    let rises = 0; for (let i = 1; i < ups.length; i++) if (ups[i] > ups[i - 1]) rises++;
    note(`health changes: ${ups.join(",")}  (rises: ${rises})`);
    assert.ok(rises > 0, "auto-heal never raised health");

    // ---- server-side: nothing against the victim ----
    const vIncidents = srv.incidents().filter((l) => /victim/.test(l) && !/leave sid/.test(l));
    assert.deepStrictEqual(vIncidents, [], "server anti-cheat acted against the victim");
    console.log("  ✓ victim survived all phases, healed " + rises + "x, no anti-cheat action");
} catch (e) {
    failed = true;
    console.log("  ✗ " + (e && e.message));
} finally {
    const out = victim ? victim.outLog : [];
    if (failed || process.env.LIVE_ECHO) {
        console.log("\n  --- timeline ---\n  " + timeline.join("\n  "));
        console.log("\n  --- server incidents ---\n  " + (srv.incidents().join("\n  ") || "(none)"));
        const tail = out.slice(-40).map((o) => `${((o.t - T0) / 1000).toFixed(2)}s ${o.name} ${JSON.stringify(o.args).slice(0, 60)}`);
        console.log("\n  --- last frames the victim sent (after the loader) ---\n  " + tail.join("\n  "));
        if (victim && victim.client.closed) console.log("\n  victim socket closed: " + JSON.stringify(victim.client.closed));
        console.log("\n  --- server log tail ---\n  " + srv.lines.slice(-40).join("\n  "));
    }
    try { victim && victim.stop(); } catch (_) {}
    try { bot && bot.stop(); } catch (_) {}
    await srv.stop();
    process.exit(failed ? 1 : 0);
}
