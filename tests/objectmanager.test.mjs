/*
 * Object manager unit tests — proves the loader reconstructs the world exactly
 * from the wire packets, with the bundle's GameObject field model.
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

// item ids we use: 6 = spikes, 15 = turret (age 7), 13 = pit trap, 3 = wood wall.
const SPIKE = data.itemByName("spikes").id;
const TURRET = data.itemByName("turret").id;
const PIT = data.itemByName("pit trap").id;
const WALL = data.itemByName("wood wall").id;

function setup() {
    const MooMoo = Runtime.createRuntime({ sink: { sendAction() {}, sendRaw() {} } });
    const objects = OM.createObjectManager({ MooMoo, data });
    MooMoo._dispatch("setup", { sid: 1 });
    // give self a team + make player 2 an enemy, player 3 a teammate
    MooMoo._dispatch("playersUpdate", {
        positions: [{ sid: 1, x: 0, y: 0, dir: 0 }, { sid: 2, x: 0, y: 0, dir: 0 }, { sid: 3, x: 0, y: 0, dir: 0 }],
        attributes: [
            { sid: 1, team: "me", buildIndex: -1, weaponIndex: 0, variant: 0, skin: 0, tail: 0 },
            { sid: 2, team: "them", buildIndex: -1, weaponIndex: 0, variant: 0, skin: 0, tail: 0 },
            { sid: 3, team: "me", buildIndex: -1, weaponIndex: 0, variant: 0, skin: 0, tail: 0 }
        ],
        hidden: []
    });
    return { MooMoo, objects };
}

// one object as the 8-field wire tuple: [sid,x,y,dir,scale,type,id,ownerSid]
// buildings send type=null (server uses item.type, undefined for most); natural
// resources send their real type (0=tree,1=bush,2=stone,3=gold).
const obj = (sid, x, y, id, owner, type) => [
    sid, x, y, 0,
    id != null ? data.item(id).scale : 100,
    type != null ? type : null,
    id == null ? null : id,
    owner == null ? -1 : owner
];

test("objectsLoad parses the flat 8-field tuples into GameObjects", () => {
    const { MooMoo, objects } = setup();
    const flat = [].concat(
        obj(100, 200, 200, SPIKE, 2),   // enemy spike
        obj(101, 0, 0, null, -1, 0)      // a natural resource (tree, type 0) at origin
    );
    MooMoo._dispatch("objectsLoad", { args: [flat] });
    assert.equal(objects.count(), 2);

    const spike = objects.get(100);
    assert.equal(spike.name, "spikes");
    assert.equal(spike.group.name, "spikes");
    assert.equal(spike.dmg, 20);
    assert.equal(spike.health, 400);
    assert.equal(spike.ownerSid, 2);
    assert.equal(spike.owner.sid, 2);
    assert.equal(spike.realScale, data.item(SPIKE).scale); // building -> full scale
    assert.ok(spike.isItem);

    const tree = objects.get(101);
    assert.equal(tree.name, "Tree");
    assert.equal(tree.ownerSid, null);
    assert.equal(tree.isItem, false);
});

test("objectKilled removes one; objectsKilled removes every object of an owner", () => {
    const { MooMoo, objects } = setup();
    MooMoo._dispatch("objectsLoad", { args: [[].concat(
        obj(10, 10, 0, SPIKE, 2),
        obj(11, 20, 0, WALL, 2),
        obj(12, 30, 0, SPIKE, 3)   // teammate's spike
    )] });
    assert.equal(objects.count(), 3);

    MooMoo._dispatch("objectKilled", { args: [10] });
    assert.equal(objects.get(10), null);
    assert.equal(objects.count(), 2);

    MooMoo._dispatch("objectsKilled", { args: [2] });  // owner 2 wiped
    assert.equal(objects.get(11), null);
    assert.equal(objects.count(), 1);
    assert.equal(objects.get(12).ownerSid, 3);         // teammate's survives
});

test("near()/spikes()/turrets() filter + sort by distance and set .distance", () => {
    const { MooMoo, objects } = setup();
    MooMoo._dispatch("objectsLoad", { args: [[].concat(
        obj(1, 100, 0, SPIKE, 2),
        obj(2, 300, 0, SPIKE, 2),
        obj(3, 50, 0, TURRET, 2)
    )] });
    const near = objects.near(0, 0, 250);
    assert.deepEqual(near.map(o => o.sid), [3, 1]);     // 50 then 100, 300 excluded
    assert.equal(near[0].distance, 50);

    const sp = objects.spikes(0, 0, 1000);
    assert.deepEqual(sp.map(o => o.sid), [1, 2]);
    const tr = objects.turrets(0, 0, 1000);
    assert.deepEqual(tr.map(o => o.sid), [3]);
});

test("isEnemyObject honours team (self + teammate friendly, others enemy)", () => {
    const { MooMoo, objects } = setup();
    MooMoo._dispatch("objectsLoad", { args: [[].concat(
        obj(1, 0, 0, SPIKE, 2),   // enemy
        obj(2, 0, 0, SPIKE, 3),   // teammate
        obj(3, 0, 0, SPIKE, 1)    // mine
    )] });
    assert.equal(objects.isEnemyObject(objects.get(1)), true);
    assert.equal(objects.isEnemyObject(objects.get(2)), false);
    assert.equal(objects.isEnemyObject(objects.get(3)), false);
});

test("turret .time counts down each tick and resets, and turretShoot refills it", () => {
    const { MooMoo, objects } = setup();
    MooMoo._dispatch("objectsLoad", { args: [[].concat(obj(5, 0, 0, TURRET, 2))] });
    const t = objects.get(5);
    assert.equal(t.time, OM.TURRET_RELOAD);
    // a tick after ~some delay decrements time
    const before = t.time;
    objects.update(111);               // explicit server-tick delta
    assert.ok(t.time < before, "time should decrease on tick");
    // a turret shoot refills the reload timer
    MooMoo._dispatch("turretShoot", { args: [5, 1.57] });
    assert.equal(t.time, OM.TURRET_RELOAD);
    assert.equal(t.dir, 1.57);
    assert.ok(t.shot > 0);
});

test("trapAt finds a pit trap covering a point; wiggle marks a hit", () => {
    const { MooMoo, objects } = setup();
    MooMoo._dispatch("objectsLoad", { args: [[].concat(obj(9, 500, 500, PIT, 2))] });
    assert.equal(objects.trapAt(500, 500), objects.get(9));
    assert.equal(objects.trapAt(900, 900), null);

    MooMoo._dispatch("wiggle", { args: [0, 9] });
    assert.ok(objects.get(9).lastHit > 0);
});

test("setup/died clear the world", () => {
    const { MooMoo, objects } = setup();
    MooMoo._dispatch("objectsLoad", { args: [[].concat(obj(1, 0, 0, SPIKE, 2))] });
    assert.equal(objects.count(), 1);
    MooMoo._dispatch("died", {});
    assert.equal(objects.count(), 0);
});
