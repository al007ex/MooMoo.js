/*
 * Combat engine unit tests — proves the loader reconstructs per-player prediction,
 * reload clocks, loadout, bull cadence and targeting exactly like the bundle.
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

function setup(selfInput) {
    const MooMoo = Runtime.createRuntime({ sink: { sendAction() {}, sendRaw() {} } });
    const objects = OM.createObjectManager({ MooMoo, data });
    const combat = Combat.createCombat({ MooMoo, data, objects, selfInput: selfInput || { moveDir: null, aimDir: 0 } });
    MooMoo._dispatch("setup", { sid: 1 });
    MooMoo._dispatch("inventory", { list: [0, 10], isWeapon: true });   // primary hammer(0), secondary great hammer(10)
    MooMoo._dispatch("inventory", { list: [0, 3, 6, 10], isWeapon: false }); // apple, wood wall, spikes, windmill
    return { MooMoo, combat };
}

// a playersUpdate with explicit positions + attributes
function pu(MooMoo, players) {
    MooMoo._dispatch("playersUpdate", {
        positions: players.map(p => ({ sid: p.sid, x: p.x, y: p.y, dir: p.dir || 0 })),
        attributes: players.map(p => ({
            sid: p.sid, buildIndex: p.buildIndex != null ? p.buildIndex : -1,
            weaponIndex: p.weaponIndex || 0, variant: p.variant || 0, team: p.team != null ? p.team : null,
            isLeader: false, skin: p.skin || 0, tail: p.tail || 0, icon: 0, zIndex: 0
        })),
        hidden: []
    });
}

test("loadout resolves weapon + item slots from inventory", () => {
    const { MooMoo, combat } = setup();
    pu(MooMoo, [{ sid: 1, x: 0, y: 0 }]);   // a tick triggers the loadout resolve
    const lo = combat.loadout;
    assert.equal(lo.ee, 0);       // primary = hammer
    assert.equal(lo.A, 10);       // secondary = great hammer
    assert.equal(lo.ry, 0);       // food = apple
    assert.equal(lo.ay, 3);       // wall = wood wall
    assert.equal(lo.ly, 6);       // spike = spikes
    assert.equal(lo.cy, 10);      // mill = windmill
    assert.equal(lo.spike.name, "spikes");
});

test("reconstruction: velocity, movDir and np are derived from position deltas", () => {
    const { MooMoo, combat } = setup();
    // tick 1 at origin, tick 2 moved +100 in x
    pu(MooMoo, [{ sid: 1, x: 0, y: 0 }, { sid: 2, x: 500, y: 0, team: null }]);
    pu(MooMoo, [{ sid: 1, x: 100, y: 0 }, { sid: 2, x: 500, y: 0 }]);
    const z = combat.self;
    assert.equal(z.x2, 100);
    assert.equal(z.preX, 0);
    assert.equal(z.xVel, 100);
    assert.ok(Math.abs(z.movSpd - 100) < 1e-6);
    assert.ok(Math.abs(z.movDir - 0) < 1e-6);        // moved east -> dir 0
    assert.ok(z.np && z.np.accel && z.np.decel && z.np.real, "np prediction present");
    // accel prediction should be further east than current when velocity is +x
    assert.ok(z.np.accel.x > z.x2);
});

test("reload: a swing zeroes pr, then it refills over the weapon's speed", async () => {
    const { MooMoo, combat } = setup();
    pu(MooMoo, [{ sid: 1, x: 0, y: 0 }]);
    const z = combat.self;
    MooMoo._dispatch("gatherAnimation", { args: [1, 1, 0] });   // we swung primary (hammer)
    assert.equal(z.pr, 0, "pr reset to 0 on swing");
    // tick with real elapsed time so delta fills pr. hammer speed=300ms.
    await new Promise(r => setTimeout(r, 160));
    pu(MooMoo, [{ sid: 1, x: 0, y: 0 }]);
    assert.ok(z.pr > 0 && z.pr < 1, "pr partially filled after one tick: " + z.pr);
    await new Promise(r => setTimeout(r, 160));
    pu(MooMoo, [{ sid: 1, x: 0, y: 0 }]);
    await new Promise(r => setTimeout(r, 160));
    pu(MooMoo, [{ sid: 1, x: 0, y: 0 }]);
    assert.equal(z.pr, 1, "pr fully reloaded after ~weapon speed elapsed");
});

test("bull cadence: a bull-reflect hit sets lastBull and bleed cycles mod 9", () => {
    const { MooMoo, combat } = setup();
    // advance several ticks so the tick counter v is realistic (lastBull = v-1 > 0)
    for (let i = 0; i < 5; i++) pu(MooMoo, [{ sid: 1, x: 0, y: 0 }, { sid: 2, x: 100, y: 0, skin: 7 }]);
    // enemy sid 2 wears Bull (skin 7); it reflects -5 to us -> marks lastBull
    MooMoo._dispatch("health", { sid: 2, value: 100 });   // seed
    MooMoo._dispatch("health", { sid: 2, value: 95 });    // -5 bull reflect
    const enemy = MooMoo.players.get(2);
    assert.ok(enemy.lastBull > 0, "lastBull set by the -5 bull reflect");
    // advance ticks; bleed should walk through the 9 cycle
    const seen = new Set();
    for (let i = 0; i < 9; i++) { pu(MooMoo, [{ sid: 1, x: 0, y: 0 }, { sid: 2, x: 100, y: 0, skin: 7 }]); seen.add(enemy.bleed); }
    assert.ok(seen.size >= 2, "bleed phase advances across ticks");
});

test("targeting: Y is the nearest visible enemy; _y/Vy/o4 predicates work", () => {
    const { MooMoo, combat } = setup();
    pu(MooMoo, [
        { sid: 1, x: 0, y: 0, team: null },
        { sid: 2, x: 300, y: 0, team: null, weaponIndex: 0 },
        { sid: 3, x: 120, y: 0, team: null, weaponIndex: 0 }
    ]);
    assert.ok(combat.target, "a target is chosen");
    assert.equal(combat.target.sid, 3);   // nearest enemy
    // _y of a freshly-reloaded enemy is 1 (ready)
    assert.equal(combat._y(combat.target), 1);
    // Vy: target at 120px is within a 150-range weapon
    assert.equal(combat.Vy(combat.self, combat.target, 150, false), true);
    assert.equal(combat.Vy(combat.self, combat.target, 50, false), false);
    // o4: non-shield target -> always true
    assert.equal(combat.o4(combat.self, combat.target), true);
});

test("teammates are excluded from enemy targeting", () => {
    const { MooMoo, combat } = setup();
    pu(MooMoo, [
        { sid: 1, x: 0, y: 0, team: "A" },
        { sid: 2, x: 100, y: 0, team: "A" },   // teammate
        { sid: 3, x: 400, y: 0, team: "B" }    // enemy, further
    ]);
    assert.equal(combat.target.sid, 3);        // teammate (closer) skipped
});
