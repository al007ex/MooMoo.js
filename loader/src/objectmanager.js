/*
 * moomoo.js loader — OBJECT MANAGER  (world buildings / resources tracking)
 * ========================================================================
 * The bundle's combat features (auto place / replace / push, break spike,
 * auto emp, spike sync, insta combos) all read the world's OBJECTS: the walls,
 * spikes, traps, turrets, mills and the natural trees/stones around you. The
 * official client keeps these in an ObjectManager; the loader never ran one, so
 * we rebuild an equivalent here from the wire packets the loader already decodes.
 *
 * It mirrors the bundle's GameObject model EXACTLY (same derived fields — name,
 * group, realScale, pathScale, trap, dmg, pDmg, owner, …) so a ported feature
 * reads an object the same way it did in the bundle. The bundle calls its master
 * building list `kh`; this is that list, kept current from:
 *
 *   objectsLoad  ("H")  flat [sid,x,y,dir,scale,type,id,ownerSid] * N  -> add
 *   objectKilled ("Q")  [sid]                                          -> remove one
 *   objectsKilled("R")  [ownerSid]                                     -> remove all of an owner
 *   wiggle       ("L")  [dir,sid]                                      -> object was hit
 *   turretShoot  ("M")  [sid,dir]                                      -> turret fired (reload timer)
 *   itemCount    ("S")  [groupId,count]                               -> your placed-count per group
 *   setup/died                                                         -> clear (new life)
 *
 * Mechanics copied from the server (server/src/moomoo/modules/gameObject.js +
 * objectManager.js + server.js syncObjects) and the client bundle's GameObject.
 *
 * Part of the LOADER (volatile). Exposed on every mod's ctx as `ctx.objects`.
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooObjectManager = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooObjectManager = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const TURRET_RELOAD = 2200;          // turret shootRate (ms) — item 90 shootRate
    const GATHER_WIGGLE = 10;            // K.gatherWiggle — wiggle px on hit

    const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

    // A world object, modelled exactly like the bundle's GameObject so features
    // can read the same fields. `data` is the item definition (gameData.item(id))
    // for placed buildings, or null for a natural resource (tree/bush/stone).
    // The engine's "is this sid me or my clan" test (the bundle's te) and its tick
    // counter, injected by the combat engine; until then, plain self/team checks.
    const hooksRef = { te: null, tick: () => 0, millRotate: () => false };

    class GameObject {
        constructor(sid) { this.sid = sid; }

        // The bundle's Gl.init (3022-3025), argument for argument:
        //   init(x, y, dir, scale, type, data, owner, bot, _, fake, restricter, preplace)
        // owner is {sid} (or null / undefined), like the bundle's.
        init(x, y, dir, scale, type, data, owner, bot, _unused, fake, restricter, preplace) {
            const o = data || {};
            this.sentTo = {};
            this.gridLocations = [];
            this.active = true;
            this.doUpdate = o.doUpdate;
            this.x = x;
            this.y = y;
            this.dir = dir;
            this.xWiggle = 0;
            this.yWiggle = 0;
            this.scale = scale;
            this.type = type;
            this.id = o.id;
            this.owner = owner;
            this.ownerSid = owner && owner.sid != null ? owner.sid : null;
            this.name = o.name ? o.name : this.type === 0 ? "Tree" : this.type === 1 && this.y >= 12e3 ? "Cactus" : this.type === 1 ? "Bush" : this.type === 2 ? "Stone" : this.type === 3 ? "Gold Stone" : null;
            this.isItem = this.id != null;
            this.group = o.group;
            this.health = this.maxHealth = o.health;
            this.health2 = 0;
            this.buildingID = o.buildingID;
            this.setType = o.setType;
            this.layer = 2;
            this.group != null ? this.layer = this.group.layer : this.type == 0 ? this.layer = 3 : this.type == 2 ? this.layer = 0 : this.type == 4 && (this.layer = -1);
            this.colDiv = o.colDiv || 1;
            this.blocker = o.blocker;
            this.ignoreCollision = o.ignoreCollision;
            this.dontGather = o.dontGather;
            this.hideFromEnemy = o.hideFromEnemy;
            this.friction = o.friction;
            this.projDmg = o.projDmg;
            this.dmg = o.dmg;
            this.pDmg = o.pDmg;
            this.pps = o.pps;
            this.zIndex = o.zIndex || 0;
            this.turnSpeed = o.turnSpeed;
            this.req = o.req;
            this.trap = o.trap;
            this.healCol = o.healCol;
            this.teleport = o.teleport;
            this.boostSpeed = o.boostSpeed;
            this.projectile = o.projectile;
            this.opacity = o.name == "pit trap" ? 1 : 1;
            this.opacity2 = 1;
            this.fadingOut = false;
            this.dmgpot = 0;
            this.assumeBreak = false;
            this.ignoreWiggleDirs = [];
            this.wiggleDirs = [];
            this.shootRange = o.shootRange;
            this.shootRate = o.shootRate;
            this.shootCount = this.shootRate;
            this.spawnPoint = o.spawnPoint;
            this.tick = hooksRef.tick();
            this.preplace = preplace;
            this.fake = fake;
            this.bot = bot;
            this.elevation = typeof this.type === "number" && this.owner === null || this.name == "turret" || this?.group?.name === "mill" ? 2 : 1;
            this.restricter = restricter;
            this.realScale = this.type <= 1 && this.type !== null ? this.scale * 0.6 : this.scale;
            const te = hooksRef.te || (() => false);
            this.pathScale = this.type === 1 && this.y <= 12e3 ? this.scale * 0.6 + 15 : this.type === 0 ? this.scale * 0.7 + 10 : this.dmg && !te(this?.owner?.sid) || this.teleport || this.boostSpeed ? this.scale + 47 : this.type === 1 && this.y >= 12e3 ? this.scale * 0.55 + 47 : this.name == "pit trap" && !te(this?.owner?.sid) ? this.scale + 38 : this.ignoreCollision ? 0 : this.scale + 10;
            // loader runtime fields
            this.time = this.name === "turret" ? TURRET_RELOAD : undefined;
            this.shot = 0;
            this.lastHit = 0;
            this.distance = 0;
            return this;
        }

        changeHealth(e) { this.health += e; return this.health <= 0; }

        // Gl.update (bundle 3032): per render frame, the hit wiggle eases out and
        // spinning things turn (windmills only with the mod's "mill rotate").
        update(e) {
            this.active && (this.xWiggle && (this.xWiggle *= Math.pow(0.99, e)), this.yWiggle && (this.yWiggle *= Math.pow(0.99, e)), (hooksRef.millRotate() && this?.group?.name == "mill" || this?.group?.name != "mill") && this.turnSpeed && (this.dir += this.turnSpeed * e));
        }

        getScale(e, t) {
            e = e || 1;
            return this.scale * (this.isItem || this.type == 2 || this.type == 3 || this.type == 4 ? 1 : 0.6 * e) * (t ? 1 : this.colDiv);
        }

        visibleToPlayer(e) {
            return !this.hideFromEnemy || this.owner && (this.owner == e || this.owner.team && e.team == this.owner.team);
        }
    }

    function createObjectManager(env) {
        const MooMoo = env.MooMoo;
        const data = env.data;
        const S = () => MooMoo.self;

        const byId = new Map();     // sid -> GameObject
        const list = [];            // active objects (the bundle's `kh`)
        const itemCounts = {};      // groupId -> your placed count (from "S")

        function indexOfSid(sid) {
            for (let i = 0; i < list.length; i++) if (list[i].sid === sid) return i;
            return -1;
        }

        const removeTaps = new Set();   // fn(obj, cause) just before an object is forgotten
        function tapRemove(o, cause) { for (const fn of Array.from(removeTaps)) { try { fn(o, cause); } catch (e) { /* ignore */ } } }
        function removeSid(sid) {
            const o = byId.get(sid);
            if (!o) return;
            tapRemove(o, "killed");
            byId.delete(sid);
            const i = indexOfSid(sid);
            if (i >= 0) list.splice(i, 1);
        }

        function clearAll() {
            byId.clear();
            list.length = 0;
        }

        // Owner/team resolution (needs the live player table).
        function myTeam() { const s = S(); return s ? s.team : null; }
        function isSelf(sid) { const s = S(); return s != null && sid === s.sid; }
        function isTeammate(sid) {
            if (sid == null) return false;
            if (isSelf(sid)) return true;
            const me = S(); if (!me || me.team == null) return false;
            const p = MooMoo.players && MooMoo.players.get(sid);
            return !!(p && p.team != null && p.team === me.team);
        }
        // te() in the bundle: sid is me or a teammate.
        function isFriendly(sid) { return isSelf(sid) || isTeammate(sid); }
        // Is this object owned by an enemy (not me, not my team)? Unowned natural
        // resources count as non-enemy.
        function isEnemyObject(o) { return o != null && o.ownerSid != null && !isFriendly(o.ownerSid); }

        // ---- add one object (from "H"), mirroring the bundle's objectManager.add ----
        function addObject(sid, x, y, dir, scale, type, id, ownerSid) {
            const def = (id != null && id >= 0) ? data.item(id) : null;
            // The bundle's objectManager.add always creates a NEW object (no reuse
            // by sid) and pushes it to kh.
            const o = new GameObject(sid);
            const old = byId.get(sid);
            if (old) { const k = list.indexOf(old); if (k >= 0) list.splice(k, 1); }
            byId.set(sid, o); list.push(o);
            // The bundle's J2 (s2c "H"): add(sid, x, y, dir, scale, type, item, true, owner >= 0 ? {sid} : null)
            o.init(x, y, dir, scale, type, def, ownerSid >= 0 && ownerSid != null ? { sid: ownerSid } : null);
            return o;
        }

        // ---- wire handlers ----
        function onObjectsLoad(p) {
            const flat = (p && p.args && p.args[0]) || [];
            for (let n = 0; n + 7 < flat.length; n += 8) {
                addObject(flat[n], flat[n + 1], flat[n + 2], flat[n + 3], flat[n + 4], flat[n + 5], flat[n + 6], flat[n + 7]);
            }
        }
        function onObjectKilled(p) {
            const sid = p && p.args && p.args[0];
            if (sid != null) removeSid(sid);
        }
        function onObjectsKilled(p) {
            // "R" carries an OWNER sid: every object that owner placed is gone.
            const owner = p && p.args && p.args[0];
            if (owner == null) return;
            for (let i = list.length - 1; i >= 0; i--) {
                if (list[i].ownerSid === owner) { tapRemove(list[i], "ownerLeft"); byId.delete(list[i].sid); list.splice(i, 1); }
            }
        }
        function onWiggle(p) {
            const a = p && p.args; if (!a) return;
            const dir = a[0], sid = a[1];
            const o = byId.get(sid);
            if (!o) return;
            o.xWiggle += GATHER_WIGGLE * Math.cos(dir);
            o.yWiggle += GATHER_WIGGLE * Math.sin(dir);
            o.lastHit = Date.now();
        }
        function onTurretShoot(p) {
            const a = p && p.args; if (!a) return;
            const sid = a[0], dir = a[1];
            const o = byId.get(sid);
            if (!o) return;
            if (dir != null) o.dir = dir;
            o.time = TURRET_RELOAD;     // just fired -> reload is full (bundle v4())
            o.shot = Date.now();
            o.NOW = false;
        }
        function onItemCount(p) {
            const a = p && p.args; if (!a) return;
            itemCounts[a[0]] = a[1];
        }

        // Per-tick upkeep: turret reload countdown + spinning dir, mirroring the
        // bundle's k4() and GameObject.update. Call once per playersUpdate.
        let lastTick = 0;
        function update(deltaOverride) {
            const now = Date.now();
            const delta = deltaOverride != null ? deltaOverride : (lastTick ? (now - lastTick) : 111);
            lastTick = now;
            for (let i = 0; i < list.length; i++) {
                const o = list[i];
                if (o.name === "turret" && o.time) {
                    o.time -= delta;
                    if (o.time <= 0) o.time = TURRET_RELOAD;
                }
                if (!driven && o.turnSpeed) o.dir += o.turnSpeed * delta;   // driven: GameObject.update per frame
            }
        }

        MooMoo.on("objectsLoad", onObjectsLoad);
        MooMoo.on("objectKilled", onObjectKilled);
        MooMoo.on("objectsKilled", onObjectsKilled);
        MooMoo.on("wiggle", onWiggle);
        MooMoo.on("turretShoot", onTurretShoot);
        MooMoo.on("itemCount", onItemCount);
        // Turret countdowns + spin advance once per tick. The combat engine drives
        // this at the bundle's point in the tick (k4); without it, the "a" packet does.
        let driven = false;
        MooMoo.on("playersUpdate", () => { if (!driven) update(); });
        MooMoo.on("setup", clearAll);
        MooMoo.on("died", clearAll);

        // ---- query API (what features call) ----
        function get(sid) { return byId.get(sid) || null; }
        function all() { return list.slice(); }
        function count() { return list.length; }

        // Objects within `range` of (x,y), optionally filtered, sorted nearest
        // first. Sets `.distance` (center distance) on each returned object, like
        // the bundle does before reading `e.distance`.
        function near(x, y, range, filter) {
            const out = [];
            for (let i = 0; i < list.length; i++) {
                const o = list[i];
                if (!o.active) continue;
                const d = dist(x, y, o.x, o.y);
                o.distance = d;
                if (range != null && d > range) continue;
                if (filter && !filter(o)) continue;
                out.push(o);
            }
            out.sort((a, b) => a.distance - b.distance);
            return out;
        }

        const byGroup = (gname) => (o) => o.group && o.group.name === gname;
        function spikes(x, y, range) { return near(x, y, range, byGroup("spikes")); }
        function walls(x, y, range) { return near(x, y, range, byGroup("walls")); }
        function mills(x, y, range) { return near(x, y, range, byGroup("mill")); }
        function traps(x, y, range) { return near(x, y, range, (o) => o.name === "pit trap"); }
        function turrets(x, y, range) { return near(x, y, range, (o) => o.name === "turret"); }
        function buildings(x, y, range) { return near(x, y, range, (o) => o.ownerSid != null); }

        // A pit trap whose radius covers (x,y) — used by trap detection. `pad`
        // widens the test (the bundle uses <= 47 around a player).
        function trapAt(x, y, pad) {
            pad = pad == null ? 47 : pad;
            let best = null, bd = Infinity;
            for (let i = 0; i < list.length; i++) {
                const o = list[i];
                if (!o.active || o.name !== "pit trap") continue;
                const d = dist(x, y, o.x, o.y);
                if (d <= pad && d < bd) { bd = d; best = o; }
            }
            return best;
        }

        return {
            GameObject,
            // direct access for advanced features
            _list: list, _byId: byId,
            get, all, count, near, trapAt,
            spikes, walls, mills, traps, turrets, buildings,
            isEnemyObject, isFriendly, isTeammate, isSelf,
            itemCount: (gid) => itemCounts[gid] || 0,
            clear: clearAll,
            update,
            setDriven: (b) => { driven = !!b; },
            setFriendlyTest: (fn) => { hooksRef.te = fn; },
            onRemove: (fn) => { removeTaps.add(fn); return () => removeTaps.delete(fn); },
            setTickSource: (fn) => { hooksRef.tick = fn; },
            setMillRotate: (fn) => { hooksRef.millRotate = typeof fn === "function" ? fn : () => false; },
            TURRET_RELOAD
        };
    }

    return { createObjectManager, GameObject, TURRET_RELOAD };
});
