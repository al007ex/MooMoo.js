/*
 * moomoo.js loader — COMBAT ENGINE  (the bundle's updatePlayers, ported 1-1)
 * =========================================================================
 * The bundle runs its WHOLE combat brain inside one server-tick handler,
 * `updatePlayers(i)` (the "a" packet). Every tick it, for every player:
 *   - shifts predicted position (x2/y2 = this tick's server pos, preX/preY = last)
 *   - derives velocity, move dir/speed, primary/secondary + their variants
 *   - fills the reload clocks pr (primary), sr (secondary), tr (turret gear)
 *   - computes the next-position prediction np = l4(player)  (accel/decel/real)
 * and separately, on each health change, tracks the 9-tick "bull" cadence
 * (lastBull/bleed) the insta combos time themselves against.
 *
 * The loader already decodes the "a" packet into tidy positions+attributes and
 * keeps MooMoo.self / MooMoo.players, so this engine ENRICHES those same objects
 * with the combat fields (pr, sr, tr, x2, y2, np, primaryVar, lastBull, …). A mod
 * then reads them exactly like the bundle did: `z` is MooMoo.self, `Y` is the
 * current target, `vn` is the sorted visible enemies.
 *
 * Constants + formulas are copied verbatim from the bundle / shared/config.js.
 * Part of the LOADER (volatile). Exposed on ctx as `ctx.combat`.
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooCombat = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooCombat = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    // ---- constants (shared/config.js + bundle) ----
    const K = {
        mapScale: 14400, riverWidth: 724, snowBiomeTop: 2400,
        playerScale: 35, playerSpeed: 0.0016, gatherAngle: Math.PI / 2.6, gatherWiggle: 10
    };
    const ce = 1000 / 9;                 // server tick ms
    const r3 = Math.pow(0.993, 111);     // decel constant used by l4's T()
    const EN = [1, 1.1, 1.18, 1.18];     // weapon-variant damage multipliers (En)
    const VARIANT_VAL = EN;              // K.weaponVariants[i].val

    // ---- math primitives (bundle aliases) ----
    const U = Math.cos, V = Math.sin, P = Math.atan2, S = Math.abs;
    const D = (a, b) => Math.hypot(a, b);
    const re = (a, b) => Math.pow(a, b);
    const H = Math.round, j = Math.min, oe = Math.max;
    const TAU = Math.PI * 2, W = Math.PI;
    const getDistance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
    const getDirection = (x1, y1, x2, y2) => Math.atan2(y1 - y2, x1 - x2);
    function getAngleDist(a, b) { let n = S(a - b) % TAU; if (n > W) n = TAU - n; return n; }
    const Ay = getAngleDist;

    function createCombat(env) {
        const MooMoo = env.MooMoo;
        const data = env.data;
        const objects = env.objects || null;
        const selfInput = env.selfInput || { moveDir: null, aimDir: 0 };

        const z = MooMoo.self;               // our own player (the bundle's `z`)
        let v = 0;                           // tick counter
        let et = 0;                          // self bull-cycle offset
        let lastTickTime = 0;                // for delta
        let Y = null;                        // current target
        let vn = [];                         // visible enemies sorted nearest-first
        let manualTargetSid = null;          // xi.ID
        const prev = new Map();              // sid -> { x2, y2, movDir, np }  (last tick)

        // ---- geometry on predicted positions (se / B / S4), ported 1-1 ----
        const gx = (e) => (e && e.x2 != null ? e.x2 : (e ? e.x : 0)) || 0;
        const gy = (e) => (e && e.y2 != null ? e.y2 : (e ? e.y : 0)) || 0;
        function S4(e, t) { return getDistance(gx(e), gy(e), gx(t), gy(t)); }
        function se(e, t, n) {
            const off = n === "player" ? -1.8 * 35 : n === "object" ? -(t && t.scale || 0) : 0;
            return getDistance(gx(e), gy(e), gx(t), gy(t)) + off;
        }
        function B(e, t) { return P(gy(t) - gy(e), gx(t) - gx(e)); }

        // ---- game-data helpers ----
        const weapon = (id) => data.weapon(id);
        const item = (id) => data.item(id);
        const hat = (id) => data.hat(id);
        const acc = (id) => data.accessory(id);
        const weaponSpeed = (id) => { const w = weapon(id); return (w && w.speed != null) ? w.speed : 300; };
        const weaponRange = (id) => { const w = weapon(id); return (w && w.range != null) ? w.range : 0; };
        const variantVal = (vi) => VARIANT_VAL[vi] || 1;

        // ---- x4: movement-speed multiplier (bundle x4) ----
        function x4(t) {
            const w = weapon(t.weaponIndex);
            const sh = hat(t.skinIndex), ta = acc(t.tailIndex);
            let e = ((t.buildIndex < 0) + 1) / 2
                * ((w && w.spdMult) || 1)
                * ((t.skinIndex && sh && sh.spdMult) || 1)
                * ((t.tailIndex && ta && ta.spdMult) || 1)
                * (t.y2 <= K.snowBiomeTop ? ((t.skinIndex && sh && sh.coldM) ? 1 : 0.75) : 1)
                * 1;
            if (!t.zIndex && t.y2 >= K.mapScale / 2 - K.riverWidth / 2 && t.y2 <= K.mapScale / 2 + K.riverWidth / 2) {
                e *= ((t.skinIndex && sh && sh.watrImm) ? 0.75 : 0.33);
            }
            return e;
        }

        // ---- l4: next-position prediction (accel / decel / real), ported 1-1 ----
        function l4(e, t, n, i, s) {
            if (s == null) s = 111;
            if (!i) {
                if (e.sid === z.sid && t !== 0 && !t) t = selfInput.moveDir;
                else if (selfInSpike && e.sid === z.sid) t = undefined;
                else if (!t && t !== 0) t = e.movDir;
            }
            let o = U(t), r = V(t);
            const a = D(o, r);
            if (a !== 0) { o /= a; r /= a; }
            if (!n) n = e;
            const l = x4(n);
            let speedXD = 0, speedYD = 0, predX = 0, predY = 0;
            if (o) speedXD += o * 0.0016 * l * s;
            if (r) speedYD += r * 0.0016 * l * s;
            if (speedXD) predX += speedXD * s;
            if (speedYD) predY += speedYD * s;
            const f = e.xVel * re(0.993, s), h = e.yVel * re(0.993, s);
            const p = f + predX, m = h + predY;
            const g = { x: e.x2 + p, y: e.y2 + m, type: "accel" };
            const y = { x: e.x2 + f, y: e.y2 + h, type: "decel" };
            const w = { x: e.x2, y: e.y2, type: "current" };
            const b = { x: p, y: m, type: "nextVel" };
            const I = s * 1.5 * U(t), So = s * 1.5 * V(t);
            const E = { x: e.x2 + I, y: e.y2 + So };
            const x = T(p, m, { x: e.x2 + p, y: e.y2 + m });
            let real = g;
            const pnp = prev.get(e.sid) && prev.get(e.sid).np;
            if (pnp != null && e.sid !== z.sid) {
                real = (se(e, pnp.accel) > se(e, pnp.decel) && Ay(e.movDir, e.pmovDir) <= 0.3) ? y : g;
            }
            if (e.sid === z.sid) real = (selfInput.moveDir == null) ? y : g;
            const k = H(D(p, m));
            return { accel: g, decel: y, boostCoords: E, boostVel: { x: I, y: So }, nextVel: b, real, current: w, fullDecel: x, xVel: p, spd: l, yVel: m, vel: k };

            function T(e, t, n) {
                if (isNaN(e) || isNaN(t)) return;
                const i = e * r3, sv = t * r3;
                if (e !== i) { e = i; n.x += e; }
                if (t !== sv) { t = sv; n.y += t; }
                if (e === i && t === sv) return { x: n.x, y: n.y, type: "full decel" };
                return T(e, t, n);
            }
        }

        // ---- loadout resolver (yy): map self.items/weapons -> slot ids ----
        // Action-bar index e maps to item id e-16, so each group's owned item is
        // simply the self.items entry whose id falls in that group's id range.
        let selfInSpike = false;         // z in an enemy spike/trap (Nt analogue)
        const loadout = {
            ee: null, A: null, ry: null, ay: null, ly: null, cy: null, dy: null, uy: null, fy: null, hy: null,
            spike: null, wall: null, food: null, windmill: null, utility: null, spawnpad: false
        };
        function inRange(id, lo, hi) { return id >= lo && id <= hi; }
        function resolveLoadout() {
            const weapons = z.weapons || [], items = z.items || [];
            loadout.ee = weapons[0] != null ? weapons[0] : null;        // primary weapon id
            loadout.A = weapons[1] != null ? weapons[1] : null;         // secondary weapon id
            loadout.ry = loadout.ay = loadout.ly = loadout.cy = loadout.dy = loadout.uy = loadout.fy = loadout.hy = null;
            for (const id of items) {
                if (inRange(id, 0, 2)) loadout.ry = id;
                else if (inRange(id, 3, 5)) loadout.ay = id;
                else if (inRange(id, 6, 9)) loadout.ly = id;
                else if (inRange(id, 10, 12)) loadout.cy = id;
                else if (inRange(id, 13, 14)) loadout.dy = id;
                else if (inRange(id, 15, 16)) loadout.uy = id;
                else if (id === 20) loadout.fy = id;
                else if (inRange(id, 17, 22) && id !== 20) loadout.hy = id;
            }
            // b4: classify the spike/wall/food/windmill/utility item defs for dmgpot.
            loadout.spike = loadout.ly != null ? item(loadout.ly) : null;
            loadout.wall = loadout.ay != null ? item(loadout.ay) : null;
            loadout.food = loadout.ry != null ? item(loadout.ry) : null;
            loadout.windmill = loadout.cy != null ? item(loadout.cy) : null;
            loadout.utility = loadout.hy != null ? item(loadout.hy) : null;
            loadout.spawnpad = loadout.fy != null;
        }

        // ---- reload fill (xy): fill pr/sr/tr for a visible player, one tick ----
        function xy(t) {
            if (t.buildIndex === -1) {
                if (t.weaponIndex <= 8) {
                    const e = weaponSpeed(t.primary);
                    t.pr = j(1, t.pr + (t.delta > 190 ? t.delta : ce) / (e * t.samRP));
                } else if (t.weaponIndex > 8) {
                    const e = weaponSpeed(t.secondary);
                    t.sr = j(1, t.sr + (t.delta > 190 ? t.delta : ce) / (e * t.samRS));
                }
            }
            t.tr = j(1, t.tr + t.delta / 2400);
        }
        // by: keep filling reload for players no longer visible (bundle by()).
        function by(t) {
            if (t.pr != null && t.pr !== 1) t.pr = j(1, t.pr + ce / (weaponSpeed(t.primary) * t.samRP));
            if (t.sr != null && t.sr !== 1) t.sr = j(1, t.sr + ce / (weaponSpeed(t.secondary) * t.samRS));
            if (t.tr != null && t.tr !== 1) t.tr = j(1, t.tr + ce / 2500);
        }

        // ---- per-player state init (new player) ----
        function initPlayerState(q) {
            if (q.__combatInit) return;
            q.__combatInit = true;
            q.pr = 1; q.sr = 1; q.tr = 1;
            q.samRP = 1; q.samRS = 1;
            q.primaryVar = 3; q.secondaryVar = 3;
            q.primary = undefined; q.secondary = undefined;
            q.x2 = q.x; q.y2 = q.y; q.preX = q.x; q.preY = q.y;
            q.xVel = 0; q.yVel = 0; q.movSpd = 0; q.movDir = undefined; q.pmovDir = undefined;
            q.delta = ce; q.hitProjs = 0; q.visible = false;
            q.lastBull = 0; q.bleed = undefined; q.poison = 0;
            q.slowMult = 1; q.shameCount = 0; q.weaponR = 1;
        }

        // ---- the "a" tick: reconstruct everyone (bundle updatePlayers) ----
        function updatePlayers(payload) {
            const now = Date.now();
            const dt = lastTickTime ? (now - lastTickTime) : ce;
            lastTickTime = now;
            v++;
            if (v % 9 === 0) { /* packet-count bucket upkeep (visual only) */ }

            // self is tracked as MooMoo.self; ensure it has combat fields.
            initPlayerState(z);
            resolveLoadout();

            // snapshot which players came in this tick's position list
            const positions = (payload && payload.positions) || [];
            const freshSids = new Set();

            // everyone starts invisible this tick (bundle sets visible=false then true)
            for (const p of MooMoo.players.values()) { initPlayerState(p); p.vis2 = p.visible; p.visible = false; }
            z.vis2 = z.visible; z.visible = false;

            for (const pos of positions) {
                const q = (pos.sid === z.sid) ? z : MooMoo.players.get(pos.sid);
                if (!q) continue;
                initPlayerState(q);
                freshSids.add(pos.sid);
                const pv = prev.get(pos.sid) || {};
                // shift prediction window
                q.x1 = q.x; q.y1 = q.y;
                q.preX = q.x2 != null ? q.x2 : pos.x;
                q.preY = q.y2 != null ? q.y2 : pos.y;
                q.pmovDir = q.movDir;
                q.x2 = pos.x; q.y2 = pos.y;
                q.x = pos.x; q.y = pos.y; q.dir = pos.dir;
                q.delta = dt;
                // Normalise the runtime's attribute names (variant/skin/tail, and
                // self's hat/accessory/weaponVariant) onto the bundle's names so every
                // feature reads q.skinIndex / q.tailIndex / q.weaponVariant uniformly.
                q.weaponVariant = (q === z) ? (z.weaponVariant || 0) : (q.variant || 0);
                q.skinIndex = (q === z) ? (z.hat || 0) : (q.skin || 0);
                q.tailIndex = (q === z) ? (z.accessory || 0) : (q.tail || 0);
                q.loadout = (q === z) ? loadout : (q.loadout || {});
                // attributes (weaponIndex/buildIndex/variant/team/skin/tail/zIndex) are
                // kept current on the player object by the runtime; read them back.
                q.xVel = q.x2 - q.preX; q.yVel = q.y2 - q.preY;
                q.movSpd = D(q.preY - q.y2, q.preX - q.x2);
                q.movSpd2 = D(q.y1 - q.y2, q.x1 - q.x2);
                q.movDir = P(q.y2 - q.preY, q.x2 - q.preX);
                if ((q.movDir === 0 && q.movSpd === 0) || (q.preX === q.x2 && q.preY === q.y2)) q.movDir = undefined;
                // weapon / variant
                if (q.weaponIndex >= 9) q.secondary = q.weaponIndex; else q.primary = q.weaponIndex;
                const wvar = q.weaponVariant != null ? q.weaponVariant : 3;
                if (q.weaponIndex === q.primary) q.primaryVar = wvar;
                if (q.weaponIndex === q.secondary) q.secondaryVar = wvar;
                // shame/samurai reset for visibility
                q.lastpr = q.pr; q.lastsr = q.sr; q.lasttr = q.tr;
                q.tick = v;
                q.visible = true;
                xy(q);
                q.weaponR = (q.weaponIndex === q.secondary) ? q.sr : q.pr;
                q.hitProjs = 0; q.hitSpike = false;
                q.np = l4(q);
                q.inWater = q.y2 >= K.mapScale / 2 - K.riverWidth / 2 && q.y2 <= K.mapScale / 2 + K.riverWidth / 2;
                q.assumeAge = g4(q);
                // bleed (bull-cycle phase)
                q.bleed = q.lastBull ? ((v - q.lastBull + (q.sid === z.sid ? et : 0)) % 9 + 9) % 9 : undefined;
                prev.set(pos.sid, { x2: q.x2, y2: q.y2, movDir: q.movDir, np: q.np });
                pv.seen = v;
            }
            // players still invisible: keep their reload filling (by)
            for (const p of MooMoo.players.values()) { if (!p.visible && p.sid !== z.sid) by(p); }

            // target selection: manual target, else nearest visible enemy (vn[0])
            vn = visibleEnemies();
            for (const e of vn) e.distance = S4(z, e);
            vn.sort((a, b) => a.distance - b.distance);
            if (manualTargetSid != null) {
                const t = vn.find((e) => e.sid === manualTargetSid);
                Y = t || vn[0] || null;
            } else Y = vn[0] || null;
        }

        // ---- g4: assumeAge (highest age gear a player reveals) ----
        function g4(e) {
            let t = 0; const n = e.loadout || {};
            if (n.spawnpad || (weapon(e.secondary) && weapon(e.secondary).age === 9) || (n.spike && n.spike.age === 9)) return 9;
            if (n.utility) t = 7;
            const sa = weapon(e.secondary), pa = weapon(e.primary);
            if (sa && t < sa.age) t = sa.age;
            if (pa && t < pa.age) t = pa.age;
            if (n.spike && t < n.spike.age) t = n.spike.age;
            if (n.food && t < n.food.age) t = n.food.age;
            if (n.windmill && t < n.windmill.age) t = n.windmill.age;
            if (n.wall && t < n.wall.age) t = n.wall.age;
            if (e.weaponIndex === 0) t = 1;
            if (e.primary === 0 && t > 1) e.primary = undefined;
            return t;
        }

        // ---- K (gatherAnimation): a swing resets the swung weapon's reload ----
        function onGather(p) {
            const a = p && p.args; if (!a) return;
            const sid = a[0], weaponIndex = a[2];
            if (typeof weaponIndex !== "number") return;
            const o = (sid === z.sid) ? z : MooMoo.players.get(sid);
            if (!o) return;
            initPlayerState(o);
            if (weaponIndex > 9) o.sr = 0; else o.pr = 0;
            const w = weapon(weaponIndex);
            o.slowMult -= (w && w.hitSlow) || 0.3;
            if (o.slowMult < 0) o.slowMult = 0;
            o.samRS = (o.skinIndex === 20 && weaponIndex > 9) ? 0.78 : 1;
            o.samRP = (o.skinIndex === 20 && weaponIndex < 9) ? 0.78 : 1;
        }

        // ---- health: track damage + the 9-tick bull cadence (lastBull/bleed) ----
        const lastHealth = new Map();
        function onHealth(p) {
            const sid = p.sid, value = p.value;
            const o = (sid === z.sid) ? z : MooMoo.players.get(sid);
            if (!o) { lastHealth.set(sid, value); return; }
            initPlayerState(o);
            const prevH = lastHealth.has(sid) ? lastHealth.get(sid) : value;
            const t = value - prevH;             // damage (<0) or heal (>0)
            lastHealth.set(sid, value);
            // bull-helmet reflect cadence: a bull (skin 7) dealing its periodic hit
            // marks the cycle. poison tick (-5) also marks it.
            if (t === -5 * (o.skinIndex === 6 ? 0.75 : 1) && o.poison) o.lastBull = v - 1;
            if (t > 0) {
                if (o.skinIndex === 13) {
                    if (o.tailIndex === 13) { if (t === 6) { o.lastBull = v - 1; if (o === z) et = 0; } }
                    else { if (t === 3) { o.lastBull = v - 1; if (o === z) et = 0; } }
                }
            } else if (t < 0) {
                if (o.skinIndex === 7) {
                    if (o.tailIndex === 13) { if (t === -2) { o.lastBull = v - 1; o.lastBull2 = Date.now(); } }
                    else { if (t === -5) { o.lastBull = v - 1; o.lastBull2 = Date.now(); if (o === z) et = 0; } }
                }
            }
            o.bleed = o.lastBull ? ((v - o.lastBull + (o.sid === z.sid ? et : 0)) % 9 + 9) % 9 : undefined;
        }

        function onDied() { v = 0; et = 0; Y = null; vn = []; prev.clear(); lastHealth.clear(); }
        function onSetup() { onDied(); }

        // ---- targeting ----
        function visiblePlayers() {
            const out = [];
            for (const p of MooMoo.players.values()) if (p.sid !== z.sid && p.visible) out.push(p);
            return out;
        }
        function visibleEnemies() {
            return visiblePlayers().filter((p) => !(z.team != null && p.team != null && p.team === z.team));
        }

        // ---- combat predicates ported 1-1 ----
        // _y: a player's reload readiness after `t` ms (default 111). ==1 means ready.
        function _y(e, t) {
            if (!e) return;
            if (!t) t = 111;
            return j(1, e.weaponR + t / weaponSpeed(e.weaponIndex));
        }
        // Vy: is t within range n of e (now or on predicted-real positions)?
        function Vy(e, t, n, i) {
            return se(e, t, "player") <= n || (i && se(e.np && e.np.real, t.np && t.np.real, "player") <= n);
        }
        // o4: not shielded against us (weapon 11 = shield; must hit their back).
        function o4(e, t) {
            if (t.weaponIndex !== 11) return true;
            const n = B(e, t);
            return getAngleDist(n + W, t.dir) > W / 3;
        }

        MooMoo.on("playersUpdate", updatePlayers);
        MooMoo.on("gatherAnimation", onGather);
        MooMoo.on("health", onHealth);
        MooMoo.on("died", onDied);
        MooMoo.on("setup", onSetup);

        return {
            // state
            get z() { return z; }, get self() { return z; },
            get tick() { return v; }, get et() { return et; },
            get target() { return Y; }, set target(sid) { manualTargetSid = sid; },
            get visibleEnemies() { return vn; },
            get loadout() { return loadout; },
            setSelfInSpike(b) { selfInSpike = b; },
            get selfInSpike() { return selfInSpike; },
            // geometry + predicates
            se, B, S4, angleDist: getAngleDist, getDirection,
            _y, Vy, o4, l4, x4,
            variantVal, weaponSpeed, weaponRange,
            visiblePlayers, visibleEnemies,
            K, ce, EN,
            // for tests / advanced
            _updatePlayers: updatePlayers, _prev: prev
        };
    }

    return { createCombat, K, ce, EN, r3 };
});
