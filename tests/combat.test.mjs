/*
 * Combat engine unit tests — the bundle's player model + tick pipeline, 1-1.
 * Each test drives the runtime with the same packets the server sends, in the
 * server's order (a tick's K / L / O arrive before that tick's "a").
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
require(path.join(here, "..", "shared", "vocabulary.js"));
const data = require(path.join(here, "..", "shared", "gamedata.js"));
const Runtime = require(path.join(here, "..", "loader", "src", "runtime.js"));
const OM = require(path.join(here, "..", "loader", "src", "objectmanager.js"));
const Combat = require(path.join(here, "..", "loader", "src", "combat.js"));

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function setup(selfInput) {
    const MooMoo = Runtime.createRuntime({ sink: { sendAction() {}, sendRaw() {} } });
    const objects = OM.createObjectManager({ MooMoo, data });
    const combat = Combat.createCombat({ MooMoo, data, objects, win: null, selfInput: selfInput || { moveDir: null, aimDir: 0 } });
    MooMoo._dispatch("setup", { sid: 1 });
    add(MooMoo, 1, true);
    MooMoo._dispatch("inventory", { list: [0, 10], isWeapon: true });        // hammer(0), great hammer(10)
    MooMoo._dispatch("inventory", { list: [0, 3, 6, 10], isWeapon: false });  // apple, wood wall, spikes, windmill
    return { MooMoo, combat };
}
// "D": [id, sid, name, x, y, dir, health, maxHealth, scale, skinColor, aura, boss, clan]
function add(MooMoo, sid, isYou, x = 0, y = 0) {
    MooMoo._dispatch("playerAdd", { data: ["id" + sid, sid, "p" + sid, x, y, 0, 100, 100, 35, 0, 0, 0, null], isYou: !!isYou });
}
// one tick: an "a" packet, then let the pipeline's wx(1) + frame run
async function pu(MooMoo, players) {
    MooMoo._dispatch("playersUpdate", {
        positions: players.map((p) => ({ sid: p.sid, x: p.x, y: p.y, dir: p.dir || 0 })),
        attributes: players.map((p) => ({
            sid: p.sid, buildIndex: p.buildIndex != null ? p.buildIndex : -1,
            weaponIndex: p.weaponIndex || 0, variant: p.variant || 0, team: p.team != null ? p.team : null,
            isLeader: false, skin: p.skin || 0, tail: p.tail || 0, icon: 0, zIndex: 0
        })),
        hidden: []
    });
    await wait(5);
}

test("loadout resolves weapon + item slots from inventory", async () => {
    const { MooMoo, combat } = setup();
    await pu(MooMoo, [{ sid: 1, x: 0, y: 0 }]);
    const lo = combat.loadout;
    assert.equal(lo.ee, 0);
    assert.equal(lo.A, 10);
    assert.equal(lo.ry, 0);
    assert.equal(lo.ay, 3);
    assert.equal(lo.ly, 6);
    assert.equal(lo.cy, 10);
    assert.equal(lo.spike.name, "spikes");
});

test("addPlayer seeds the bundle's per-player state", () => {
    const { MooMoo, combat } = setup();
    add(MooMoo, 2, false, 500, 0);
    const e = combat.Hg(2);
    assert.ok(e, "player tracked");
    assert.strictEqual(e, MooMoo.players.get(2), "one object shared with the runtime");
    assert.equal(e.pr, 1); assert.equal(e.sr, 1); assert.equal(e.tr, 1);
    assert.equal(e.primaryVar, 3);
    assert.equal(e.loadout.spike.name, "spinning spikes", "enemies are assumed to carry the worst spike");
    assert.deepEqual(e.noAntiList, new Array(10).fill(0));
    assert.equal(e.Alive, true);
});

test("reconstruction: velocity, movDir and np are derived from position deltas", async () => {
    const { MooMoo, combat } = setup();
    add(MooMoo, 2, false, 500, 0);
    await pu(MooMoo, [{ sid: 1, x: 0, y: 0 }, { sid: 2, x: 500, y: 0 }]);
    await pu(MooMoo, [{ sid: 1, x: 100, y: 0 }, { sid: 2, x: 500, y: 0 }]);
    const z = combat.self;
    assert.equal(z.x2, 100);
    assert.equal(z.preX, 0);
    assert.equal(z.xVel, 100);
    assert.ok(Math.abs(z.movSpd - 100) < 1e-6);
    assert.ok(Math.abs(z.movDir - 0) < 1e-6);
    assert.ok(z.np && z.np.accel && z.np.decel && z.np.real, "np prediction present");
    assert.ok(z.np.accel.x > z.x2);
});

test("a swing's reload reset is deferred: applied after the next tick's fill", async () => {
    const { MooMoo, combat } = setup();
    await pu(MooMoo, [{ sid: 1, x: 0, y: 0 }]);
    const z = combat.self;
    assert.equal(z.pr, 1);
    // tick T: the server sends our swing (K) before the tick's "a"
    MooMoo._dispatch("gatherAnimation", { args: [1, 1, 0] });
    assert.equal(z.pr, 1, "K alone changes nothing (k2 is queued)");
    await pu(MooMoo, [{ sid: 1, x: 0, y: 0 }]);
    assert.equal(z.pr, 0, "frame of tick T sees pr = 0 (fill first, then the queued reset)");
    // hammer speed 300ms: three ticks of ~111ms refill it
    await wait(100); await pu(MooMoo, [{ sid: 1, x: 0, y: 0 }]);
    assert.ok(z.pr > 0 && z.pr < 1, "partially refilled: " + z.pr);
    await wait(100); await pu(MooMoo, [{ sid: 1, x: 0, y: 0 }]);
    await wait(100); await pu(MooMoo, [{ sid: 1, x: 0, y: 0 }]);
    assert.equal(z.pr, 1, "fully reloaded");
});

test("health is analysed in the next frame: bull cadence lands on that tick", async () => {
    const { MooMoo, combat } = setup();
    add(MooMoo, 2, false, 100, 0);
    for (let i = 0; i < 5; i++) await pu(MooMoo, [{ sid: 1, x: 0, y: 0 }, { sid: 2, x: 100, y: 0, skin: 7 }]);
    const enemy = combat.Hg(2);
    const vBefore = combat.tick;
    MooMoo._dispatch("health", { sid: 2, value: 95 });   // -5: bull drain
    assert.equal(enemy.lastBull, undefined, "not analysed on arrival");
    await pu(MooMoo, [{ sid: 1, x: 0, y: 0 }, { sid: 2, x: 100, y: 0, skin: 7 }]);
    assert.equal(enemy.lastBull, vBefore, "lastBull = v - 1 with v already advanced to this tick");
    assert.equal(enemy.bleed, 1);
    const seen = new Set();
    for (let i = 0; i < 9; i++) { await pu(MooMoo, [{ sid: 1, x: 0, y: 0 }, { sid: 2, x: 100, y: 0, skin: 7 }]); seen.add(enemy.bleed); }
    assert.equal(seen.size, 9, "bleed walks the whole 9-tick cycle");
});

test("shame tracking: a heal within 120ms of a hit raises shameCount, a late one lowers it", async () => {
    const { MooMoo, combat } = setup();
    add(MooMoo, 2, false, 100, 0);
    await pu(MooMoo, [{ sid: 1, x: 0, y: 0 }, { sid: 2, x: 100, y: 0 }]);
    const e = combat.Hg(2);
    MooMoo._dispatch("health", { sid: 2, value: 60 });    // hit
    MooMoo._dispatch("health", { sid: 2, value: 80 });    // healed immediately (<120ms)
    await pu(MooMoo, [{ sid: 1, x: 0, y: 0 }, { sid: 2, x: 100, y: 0 }]);
    assert.equal(e.shameCount, 1);
    MooMoo._dispatch("health", { sid: 2, value: 50 });    // hit
    await wait(150);
    MooMoo._dispatch("health", { sid: 2, value: 70 });    // healed after 120ms
    await pu(MooMoo, [{ sid: 1, x: 0, y: 0 }, { sid: 2, x: 100, y: 0 }]);
    assert.equal(e.shameCount, 0, "late heal leaks 2 (floored at 0)");
});

test("targeting: Y is the nearest visible non-clan player; _y/Vy/o4 predicates work", async () => {
    const { MooMoo, combat } = setup();
    add(MooMoo, 2, false, 300, 0); add(MooMoo, 3, false, 120, 0);
    await pu(MooMoo, [
        { sid: 1, x: 0, y: 0 },
        { sid: 2, x: 300, y: 0, weaponIndex: 0 },
        { sid: 3, x: 120, y: 0, weaponIndex: 0 }
    ]);
    assert.equal(combat.target.sid, 3);
    assert.equal(combat._y(combat.target), 1);
    assert.equal(combat.Vy(combat.self, combat.target, 150, false), true);
    assert.equal(combat.Vy(combat.self, combat.target, 50, false), false);
    assert.equal(combat.o4(combat.self, combat.target), true);
});

test("clan members (te) are excluded from enemy targeting", async () => {
    const { MooMoo, combat } = setup();
    add(MooMoo, 2, false, 100, 0); add(MooMoo, 3, false, 400, 0);
    MooMoo._dispatch("tribeMembers", { args: [[1, "p1", 2, "p2"]] });
    await pu(MooMoo, [{ sid: 1, x: 0, y: 0 }, { sid: 2, x: 100, y: 0 }, { sid: 3, x: 400, y: 0 }]);
    assert.equal(combat.te(2), true);
    assert.equal(combat.target.sid, 3, "clan member (closer) skipped");
    assert.deepEqual(combat.Sn.map((p) => p.sid).sort(), [1, 2]);
});

test("A4 resolves at the next tick, after the per-tick lists are rebuilt", async () => {
    const { MooMoo, combat } = setup();
    await pu(MooMoo, [{ sid: 1, x: 0, y: 0 }]);
    let resolvedAt = null;
    combat.A4().then(() => { resolvedAt = combat.tick; });
    const t0 = combat.tick;
    await wait(5);
    assert.equal(resolvedAt, null);
    await pu(MooMoo, [{ sid: 1, x: 0, y: 0 }]);
    assert.equal(resolvedAt, t0 + 1);
});

test("building damage is inferred from a wiggle matched to the swing that caused it", async () => {
    const { MooMoo, combat } = setup();
    add(MooMoo, 2, false, 100, 0);
    await pu(MooMoo, [{ sid: 1, x: 0, y: 0 }, { sid: 2, x: 100, y: 0, dir: Math.PI }]);
    // an enemy wood wall (id 3, 380 hp) right next to player 2, owned by player 9
    MooMoo._dispatch("objectsLoad", { args: [[500, 40, 0, 0, 50, null, 3, 9]] });
    // tick T: player 2 swings hammer at it: server sends L (wiggle) then K (swing)
    const dir = Math.round(Math.atan2(0 - 0, 40 - 100) * 10) / 10;
    MooMoo._dispatch("wiggle", { args: [dir, 500] });
    MooMoo._dispatch("gatherAnimation", { args: [2, 1, 0] });
    await pu(MooMoo, [{ sid: 1, x: 0, y: 0 }, { sid: 2, x: 100, y: 0, dir: Math.PI }]);   // A4 #1: O3 created
    await pu(MooMoo, [{ sid: 1, x: 0, y: 0 }, { sid: 2, x: 100, y: 0, dir: Math.PI }]);
    await wait(130);
    const obj = combat.Xt.find((o) => o.sid === 500);
    assert.ok(obj, "wall tracked");
    assert.ok(obj.health < 380, "health reduced by the inferred hit: " + obj.health);
});
