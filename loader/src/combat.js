/*
 * moomoo.js loader — COMBAT ENGINE  (the bundle's player model + tick pipeline, 1-1)
 * ==============================================================================
 * The bundle runs its whole combat brain inside one server-tick handler,
 * `updatePlayers` (the "a" packet), and keeps a rich model of every player that
 * its packet handlers feed. This engine is that model and that pipeline, ported
 * from the bundle line for line, so a mod that hooks in sees exactly the state
 * the bundle saw, at exactly the moment it saw it.
 *
 * Ordering is the whole point. The bundle does NOT apply most packets when they
 * arrive:
 *   - a swing ("K")       -> reload reset k2() is queued (pn) and applied on the
 *                            next tick, AFTER that tick's reload fill;
 *   - a projectile ("X")  -> owner detection tg() is queued (pn) the same way;
 *   - a health change     -> only recorded (healArr); the shame / bull-cadence
 *     ("O")                  analysis l5() runs in the next tick's frame, when the
 *                            tick counter has already advanced;
 *   - a wiggle ("L")      -> waits for the next tick (A4) before a building-damage
 *                            resolver (O3) is created, and a swing that hit
 *                            something resolves it one tick later still.
 * The server sends a tick's K / L / O / X before that tick's "a" (server.js:
 * update everyone, then sync), and eating sends O between ticks, so these
 * queues decide which tick a reload / bull / health event lands on.
 *
 * Tick pipeline (bundle updatePlayers, ~line 15985):
 *   [hooks.preTick]  -> v++ -> reset per-tick lists -> reconstruct every visible
 *   player -> [hooks.postReconstruct] -> await 1ms (wx(1): let the rest of this
 *   tick's packets land) -> Xt / Q object windows -> resolve A4 (Ve) -> run
 *   deferred handlers (pn) -> per-player frame upkeep (poison, deaths, health
 *   analysis l5, bleed) -> [hooks.frame]  (where the bundle's features run)
 *
 * Player objects ARE the runtime's (MooMoo.self / MooMoo.players), enriched with
 * the bundle's fields. x/y are the rendered (interpolated) position, maintained
 * every animation frame with the bundle's own interpolation; x2/y2 are the latest
 * server position, x1/y1 the rendered position at the last tick.
 *
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
        mapScale: 14400, riverWidth: 724, snowBiomeTop: 2400, snowSpeed: 0.75,
        playerScale: 35, playerSpeed: 0.0016, gatherAngle: Math.PI / 2.6, gatherWiggle: 10,
        maxScreenWidth: 1920, maxScreenHeight: 1080, serverUpdateRate: 9, clientSendRate: 5,
        shieldAngle: Math.PI / 3, hitReturnRatio: 0.25, hitAngle: Math.PI / 2,
        weaponVariants: [{ id: 0, src: "", xp: 0, val: 1 }, { id: 1, src: "_g", xp: 3000, val: 1.1 },
            { id: 2, src: "_d", xp: 7000, val: 1.18 }, { id: 3, src: "_r", poison: true, xp: 12000, val: 1.18 },
            { id: 4, src: "_e", xp: 20000, val: 1.18, lifesteal: 0.15, membersOnly: true }]
    };
    const ce = 1000 / 9;                 // server tick ms
    const u = ce * 2;                    // two ticks (combo length)
    const r3 = Math.pow(0.993, 111);     // decel constant used by l4's T()
    const EN = [1, 1.1, 1.18, 1.18];     // En: weapon-variant damage multipliers as the bundle used them
    const h = Math.PI / 2.6;             // gather angle (bundle `h`)

    // ---- math primitives (bundle aliases) ----
    const U = Math.cos, V = Math.sin, P = Math.atan2, S = Math.abs;
    const D = Math.sqrt;
    const re = (a, b) => Math.pow(a, b);
    const H = Math.round, j = Math.min, oe = Math.max;
    const TAU = Math.PI * 2, W = Math.PI;
    const getDistance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
    const getDirection = (x1, y1, x2, y2) => Math.atan2(y1 - y2, x1 - x2);
    function getAngleDist(a, b) { const d = S(b - a) % TAU; return d > W ? TAU - d : d; }
    function Ay(e, t) { let n = S(e - t); n = n % TAU; if (n > W) n = TAU - n; return n; }
    function lerpAngle(e, t, n) {   // Math.lerpAngle as the client defines it
        if (S(t - e) > W) { if (e > t) t += TAU; else e += TAU; }
        const i = t + (e - t) * n;
        return i >= 0 && i <= TAU ? i : i % TAU;
    }
    const Ne = (t, n) => { const e = Math.SQRT2 - 1; t = S(t); n = S(n); if (t > n) { const x = t; t = n; n = x; } return e * t + n; };
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    function createCombat(env) {
        const MooMoo = env.MooMoo;
        const data = env.data;
        const objects = env.objects || null;
        const selfInput = env.selfInput || { moveDir: null, aimDir: 0 };
        const win = env.win || (typeof window !== "undefined" ? window : null);
        if (objects && objects.setDriven) objects.setDriven(true);
        if (objects && objects.setFriendlyTest) objects.setFriendlyTest((sid) => te(sid));
        if (objects && objects.setTickSource) objects.setTickSource(() => v);

        const x = { list: data.items, weapons: data.weapons, projectiles: data.projectiles, groups: data.groups };
        const C0 = data.hats, B0 = data.accessories;
        const hatOf = (id) => data.hat(id), accOf = (id) => data.accessory(id);

        const z = MooMoo.self;               // our own player (the bundle's `z`)
        let v = 0;                           // tick counter
        let et = 0;                          // self bull-cycle offset
        let tn = 0;                          // time of this tick
        let en = false;                      // in game (setupGame .. died)
        let Y = null;                        // current target (nearest visible enemy / !target)
        const xi = { ID: null, player: null };   // manual target (!target)
        const J = [];                        // every player we know, self included (bundle J)
        let vn = [], Sn = [];                // visible enemies / visible friends this tick
        let Xt = [], Q = [];                 // objects within 2000 / 800 this tick
        const bh = [];                       // animals (bundle bh)
        let bosses = { Xi: null, Ji: null, qi: null };
        const Ln = [];                       // tracked live projectiles (bundle Ln)
        let ng = [];                         // per-player projectile volleys this tick
        const ft = [];                       // pending building-damage resolvers (O3)
        let py = [];                         // clan members [sid, name, sid, name, ...]
        const rn = [], an = [], ln = [];     // per-sid reload mirrors (bundle rn/an/ln)
        const Xe = {};                       // sid -> player (bundle Xe)
        let Ve = [];                         // A4() resolvers
        let pn = [];                         // deferred packet handlers (run next tick)
        const hooks = {
            preTick: new Set(), postReconstruct: new Set(), frame: new Set(), framePlayer: new Set(),
            projectile: new Set(), playerAdded: new Set(), playerLeft: new Set(), buildingDamage: new Set(),
            died: new Set(), setup: new Set()
        };
        const runHooks = (set, a, b, c) => {
            for (const fn of Array.from(set)) { try { fn(a, b, c); } catch (e) { console.error("[moomoo.js] combat hook threw", e); } }
        };

        // ---- A4(): resolves at the next tick, at the exact point the bundle did ----
        function A4() { return new Promise((e) => { Ve[Ve.length] = e; }); }

        // ---- te(sid): me or a clan member ----
        function te(t) {
            if (t == z.sid) return true;
            for (let e = 0; e < py.length; e += 2) if (t == py[e]) return true;
            return false;
        }

        // ---- player lookup ----
        function Hg(t) { for (let e = 0; e < J.length; ++e) if (J[e].sid == t) return J[e]; return null; }
        function jg(t) { for (let e = 0; e < J.length; ++e) if (J[e].id == t) return J[e]; return null; }
        function Wg(t) { for (let e = 0; e < bh.length; ++e) if (bh[e].sid == t) return bh[e]; return null; }

        // ---- geometry on predicted positions (se / B / S4 / L3), ported 1-1 ----
        const gx = (e) => (e.x2 || e.x);
        const gy = (e) => (e.y2 || e.y);
        function S4(e, t) { return getDistance(gx(e), gy(e), gx(t), gy(t)); }
        function se(e, t, n) {
            const i = n === "player" ? -1.8 * 35 : n === "object" ? -(t && t.scale) : 0;
            return getDistance(gx(e), gy(e), gx(t), gy(t)) + i;
        }
        function B(e, t) { return P((t.y2 || t.y) - (e.y2 || e.y), (t.x2 || t.x) - (e.x2 || e.x)); }
        function Dy(e, t) { return Math.hypot((e.x2 || e.x) - (t.x2 || t.x), (e.y2 || e.y) - (t.y2 || t.y)); }
        function P3(e, t, n, i) { if (n == undefined) return { x: z.x, y: z.y }; return { x: e + i * U(n), y: t + i * V(n) }; }
        function L3(e, t) {
            const n = S((e.x2 || e.x) - (t.x2 || t.x));
            const i = S((e.y2 || e.y) - (t.y2 || t.y));
            return n <= K.maxScreenWidth / 2 * 1.3 && i <= K.maxScreenHeight / 2 * 1.3;
        }
        const X5 = (e, t) => D(e * e + t * t);

        // ---- game-data helpers ----
        const weapon = (id) => data.weapon(id);
        const weaponSpeed = (id) => { const w = weapon(id); return (w && w.speed != null) ? w.speed : undefined; };
        const weaponRange = (id) => { const w = weapon(id); return (w && w.range != null) ? w.range : 0; };
        const variantVal = (vi) => EN[vi] || 1;

        // ---- x4: movement-speed multiplier (bundle x4) ----
        function x4(t) {
            const w = weapon(t.weaponIndex);
            const sh = t.skinIndex ? hatOf(t.skinIndex) : null, ta = t.tailIndex ? accOf(t.tailIndex) : null;
            let e = ((t.buildIndex < 0) + 1) / 2 * ((w && w.spdMult) || 1) * ((t.skinIndex && sh && sh.spdMult) || 1)
                * ((t.tailIndex && ta && ta.spdMult) || 1)
                * (t.y2 <= K.snowBiomeTop ? ((t.skinIndex && sh && sh.coldM) ? 1 : 0.75) : 1) * 1;
            if (!t.zIndex && t.y2 >= K.mapScale / 2 - K.riverWidth / 2 && t.y2 <= K.mapScale / 2 + K.riverWidth / 2) {
                e *= (t.skinIndex && sh && sh.watrImm) ? 0.75 : 0.33;
            }
            return e;
        }
        // ---- w4: per-tick movement distance for a loadout (bundle w4) ----
        function w4(t, e) {
            t = {
                buildIndex: t?.buildIndex ?? e?.buildIndex ?? -1,
                weaponIndex: t?.weaponIndex ?? e?.weaponIndex ?? null,
                skinIndex: t?.skinIndex ?? e?.skinIndex ?? null,
                tailIndex: t?.tailIndex ?? e?.tailIndex ?? null,
                y2: t?.y2 ?? e?.y2 ?? 0,
                zIndex: t?.zIndex ?? e?.zIndex ?? false
            };
            return (ce / 2) * x4(t);
        }

        // ---- l4: next-position prediction (accel / decel / real), ported 1-1 ----
        // `Nt` (standing in an enemy trap) and `Dn` (our move dir) are read the way
        // the bundle read them: Nt as last tick's value, Dn = what we last sent.
        function l4(e, t, n, i, s) {
            if (s == null) s = 111;
            if (!i) {
                if (e.sid == z.sid && t !== 0 && !t) t = selfInput.moveDir;
                else if (state.Nt && e.sid == z.sid) t = undefined;
                else if (!t && t !== 0) t = e.movDir;
            }
            let o = U(t), r = V(t);
            const a = D(o * o + r * r);
            a != 0 && (o /= a, r /= a);
            if (!n) n = e;
            const l = x4(n);
            e.speedXD = 0; e.speedYD = 0; e.predY = 0; e.predX = 0;
            o && (e.speedXD += o * 0.0016 * l * s);
            r && (e.speedYD += r * 0.0016 * l * s);
            e.speedXD && (e.predX += e.speedXD * s);
            e.speedYD && (e.predY += e.speedYD * s);
            const f = e.xVel * re(0.993, s), hh = e.yVel * re(0.993, s);
            const p = f + e.predX, m = hh + e.predY;
            const g = { x: e.x2 + p, y: e.y2 + m, type: "accel" };
            const y = { x: e.x2 + f, y: e.y2 + hh, type: "decel" };
            const xx = T(p, m, { x: e.x2 + p, y: e.y2 + m });
            const w = { x: e.x2, y: e.y2, type: "current" };
            const b = { x: p, y: m, type: "nextVel" };
            let real = g;
            const k = H(D(p * p + m * m));
            const I = s * 1.5 * U(t), So = s * 1.5 * V(t);
            const E = { x: e.x2 + I, y: e.y2 + So };
            if (Xe[e.sid]?.np != undefined && e.sid != z.sid) real = se(e, Xe[e.sid]?.np?.accel) > se(e, Xe[e.sid]?.np?.decel) && Ay(e.movDir, e.pmovDir) <= 0.3 ? y : g;
            if (e.sid == z.sid) real = (selfInput.moveDir == undefined || selfInput.moveDir == null) ? y : g;
            return { accel: g, decel: y, boostCoords: E, boostVel: { x: I, y: So }, nextVel: b, real, current: w, fullDecel: xx, xVel: p, spd: l, yVel: m, vel: k };

            function T(e, t, n, i, s) {
                if (isNaN(e) || isNaN(t)) return;
                try {
                    i = e * r3; s = t * r3;
                    if (e != i) { e = i; n.x += e; }
                    if (t != s) { t = s; n.y += t; }
                    if (e == i && t == s) return { x: n.x, y: n.y, type: "full decel" };
                    return T(e, t, n);
                } catch (err) { /* deep recursion: bundle swallows */ }
            }
        }
        // ---- a4: n-tick prediction chain (bundle a4) ----
        function a4(e, t, n, i, s = [], o, r, a) {
            r = { ...e };
            if (e.sid == z.sid && n !== 0 && !n) n = selfInput.moveDir;
            else if (state.Nt && e.sid == z.sid) n = undefined;
            else if (!n && n !== 0) n = e.movDir;
            a = l4(r, n);
            r.xVel = a.xVel; r.yVel = a.yVel; r.x2 = a.real.x; r.y2 = a.real.y;
            s.push(a);
            if (t - 1 <= 0) return s;
            return a4(r, t - 1, n, r, s);
        }

        // ---- b4: learn a player's loadout from what they build (bundle b4) ----
        function b4(e, t) {
            const i = x.list[t];
            if (!i || !e) return;
            if (i.group.name == "mill") e.windmill = i;
            if (i.group.name == "spikes") e.spike = i;
            if (i.name == "boost pad") e.spike = false;
            if (i.age == 7) e.utility = i;
            if (i.group.name == "walls") e.wall = i;
            if (i.group.name == "food") e.food = i;
            if (i.name == "spawn pad") e.spawnpad = true;
        }
        // ---- g4: assumeAge, the highest age a player has revealed (bundle g4) ----
        function g4(e) {
            let t = 0;
            const n = e.loadout;
            if (n?.spawnpad || weapon(e?.secondary)?.age == 9 || n?.spike?.age == 9) return 9;
            n.utility && (t = 7);
            t < weapon(e?.secondary)?.age && (t = weapon(e?.secondary)?.age);
            t < weapon(e?.primary)?.age && (t = weapon(e?.primary)?.age);
            t < n?.spike?.age && (t = n.spike.age);
            t < n?.food?.age && (t = n.food.age);
            t < n?.windmill?.age && (t = n.windmill.age);
            t < n?.wall?.age && (t = n.wall.age);
            e?.weaponIndex == 0 && (t = 1);
            if (e?.primary == 0 && t > 1) e.primary = undefined;
            return t;
        }

        // ---- self loadout (bundle yy(), which read the action bar) ----
        // Action-bar slot k shows item k-16, so each slot range is an item-id range.
        const loadout = {
            ee: null, A: null, ry: null, ay: null, ly: null, cy: null, dy: null, uy: null, fy: null, hy: null,
            spike: null, wall: null, food: null, windmill: null, utility: null, spawnpad: false
        };
        function yy() {
            const weapons = z.weapons || [], items = z.items || [];
            loadout.ee = null; loadout.ry = null; loadout.A = null; loadout.dy = null; loadout.ay = null;
            loadout.ly = null; loadout.cy = null; loadout.fy = null; loadout.hy = null; loadout.uy = null;
            for (const id of weapons) { if (id != null && id < 9) loadout.ee = id; else if (id != null) loadout.A = id; }
            for (const id of items) {
                if (id >= 0 && id <= 2) loadout.ry = id;
                else if (id >= 3 && id <= 5) loadout.ay = id;
                else if (id >= 6 && id <= 9) loadout.ly = id;
                else if (id >= 10 && id <= 12) loadout.cy = id;
                else if (id >= 13 && id <= 14) loadout.dy = id;
                else if (id >= 15 && id <= 16) loadout.uy = id;
                else if (id === 20) loadout.fy = id;
                else if (id >= 17 && id <= 22) loadout.hy = id;
            }
            loadout.spike = loadout.ly != null ? x.list[loadout.ly] : null;
            loadout.wall = loadout.ay != null ? x.list[loadout.ay] : null;
            loadout.food = loadout.ry != null ? x.list[loadout.ry] : null;
            loadout.windmill = loadout.cy != null ? x.list[loadout.cy] : null;
            loadout.utility = loadout.hy != null ? x.list[loadout.hy] : null;
            loadout.spawnpad = loadout.fy != null;
            return loadout;
        }

        // ---- reload fill (xy) / fill while invisible (by), ported 1-1 ----
        function xy(t, e) {
            if (t.buildIndex == -1) {
                if (t.weaponIndex <= 8) {
                    const sp = weaponSpeed(t.primary);
                    t.pr = j(1, t.pr + (t.delta > 190 ? t.delta : ce) / (sp * t.samRP));
                } else if (t.weaponIndex > 8) {
                    const sp = weaponSpeed(t.secondary);
                    t.sr = j(1, t.sr + (t.delta > 190 ? t.delta : ce) / (sp * t.samRS));
                }
            }
            t.tr = j(1, t.tr + t.delta / 2400);
            rn[t.sid] = t.pr; an[t.sid] = t.sr; ln[t.sid] = t.tr;
            if (t.sid != z.sid) {
                if (!t.hasSoldier && t.skinIndex == 6) t.hasSoldier = true;
                if (!t.hasTank && t.skinIndex == 40) t.hasTank = true;
            }
        }
        function by() {
            for (let e = 0; e < J.length; e++) {
                const t = J[e];
                if (!t.visible && t.sid != z.sid) {
                    t.pr != undefined && t.pr !== 1 && (t.pr = j(1, t.pr + ce / (weaponSpeed(t?.primary) * t.samRP)));
                    t.sr != undefined && t.sr !== 1 && (t.sr = j(1, t.sr + ce / (weaponSpeed(t?.secondary) * t.samRS)));
                    t.tr != undefined && t.tr !== 1 && (t.tr = j(1, t.tr + ce / 2500));
                    rn[t.sid] = t.pr; an[t.sid] = t.sr; ln[t.sid] = t.tr;
                }
            }
        }

        // ---- addPlayer ("D"): vanilla spawn/setData + the bundle's per-player state ----
        function spawnFields(e) {
            Object.assign(e, {
                active: true, alive: true, lockMove: false, lockDir: false, minimapCounter: 0, chatCountdown: 0,
                shameCount: 0, shameTimer: 0, gathering: 0, autoGather: 0, animTime: 0, animSpeed: 0, mouseState: 0,
                buildIndex: -1, weaponIndex: 0, noMovTimer: 0, maxXP: 300, deathCount: 0, XP: 0, age: 1, kills: 0,
                upgrAge: 2, upgradePoints: 0, zIndex: 0, xVel: 0, yVel: 0, slowMult: 1, dir: 0, dirPlus: 0, targetDir: 0,
                targetAngle: 0, maxHealth: 100, health2: 0, samRP: 1, samRS: 1, pr: 1, sr: 1, hasSoldier: false,
                hasTank: false, scale: K.playerScale, speed: K.playerSpeed, shootCount: 0, timeSpentNearVolcano: 0
            });
            e.health = e.maxHealth;
            if (!e.weaponXP) e.weaponXP = [];
            e.dmgOverTime = {};
            e.reloads = {};
        }
        function onPlayerAdd(p) {
            const t = p.data, isYou = !!p.isYou;
            if (!Array.isArray(t)) return;
            let e = jg(t[0]);
            const fresh = !e;
            if (!e) {
                if (t[1] === z.sid || isYou) e = z;
                else {
                    e = MooMoo.players.get(t[1]);
                    if (!e) { e = { sid: t[1] }; MooMoo.players.set(t[1], e); }   // one object shared with the runtime
                }
                if (J.indexOf(e) < 0) J.push(e);
                e.id = t[0];
                e.tmpScore = 0; e.team = e.team ?? null; e.skinIndex = e.skinIndex || 0; e.tailIndex = e.tailIndex || 0;
                e.hitTime = 0; e.points = e.points || 0; e.dt = 0; e.hidden = false; e.itemCounts = e.itemCounts || {};
                e.isPlayer = true; e.pps = 0; e.moveDir = undefined; e.skinRot = 0; e.lastPing = 0; e.iconIndex = 0;
                e.deaths = 0; e.skinColor = 0;
            }
            spawnFields(e);
            e.visible = false;
            e.x2 = undefined; e.y2 = undefined;
            // setData (bundle-modified)
            e.id = t[0]; e.sid = t[1]; e.name = t[2]; e.x = t[3]; e.y = t[4]; e.dir = t[5]; e.bot = false;
            e.health = t[6]; e.maxHealth = t[7]; e.scale = t[8]; e.skinColor = t[9];
            e.__hp = t[6];
            e.rx = t[3]; e.ry = t[4]; e.rdir = t[5];
            e.pr = 1; e.sr = 1; e.tr = 1; e.hitProjs = 0; e.primary = undefined; e.secondary = undefined;
            e.shameCount = 0; e.primaryVar = 3; e.secondaryVar = 3; e.lastx = 0; e.tick = v; e.lasty = 0;
            e.aura = !!t[10]; e.bossMode = !!t[11]; e.clan = t[12] || null;
            if (isYou) { e.weapons = [0]; e.items = [0, 3, 6, 10]; }
            // the bundle's own per-player state (addPlayer, ~line 15555)
            rn[t[1]] = 1; an[t[1]] = 1; e.pr = 1; e.sr = 1;
            !e.seenCount ? e.seenCount = 1 : e.seenCount++;
            e.primary = null; e.secondary = null;
            e.samRP = 1; e.didDeath = false; e.samRS = 1;
            e.noAntiList = e.noAntiList ?? new Array(10).fill(0);
            e.healArr = [];
            e.loadout = { spike: x.list[9], spawnpad: false, utility: undefined, windmill: undefined, trap: true, wall: x.list[3], food: x.list[0] };
            ln[t[1]] = 1;
            e.deathDmgs = []; e.dmgsNow = [];
            !e.trackLeak && (e.trackLeak = []);
            !e.trackGain && (e.trackGain = []);
            e.tr = 1; e.shameCount = 0; e.healTrack = []; e.Alive = true;
            if (isYou) { e.loadout = loadout; }
            runHooks(hooks.playerAdded, e, { fresh, isYou, seenCount: e.seenCount });
        }
        // ---- playerRemove ("E" -> ug): forget the player and their projectiles ----
        function onPlayerRemove(p) {
            const sid = p.sid;
            for (let i = Ln.length - 1; i >= 0; i--) if (Ln[i].owner.sid == sid) Ln.splice(i, 1);
            for (let e = 0; e < J.length; e++) {
                if (J[e].sid == sid && J[e] !== z) { const gone = J[e]; J.splice(e, 1); runHooks(hooks.playerLeft, gone); break; }
            }
        }

        // ---- health ("O" -> updateHealth): record only; l5 runs in the next frame ----
        function onHealth(p) {
            const q = Hg(p.sid);
            if (!q) return;
            const n = Date.now();
            // the runtime already wrote the new value into q.health; the bundle's
            // delta is against the value it held before this packet
            const prevHealth = q.__hp != null ? q.__hp : q.health;
            const i = p.value - prevHealth;
            q.isPlayer && q.healArr && q.healArr.push([i, p.value, n]);
            q.lastHealth = prevHealth;
            q.animatedHealth = Date.now();
            q.health = p.value;
            q.__hp = p.value;
        }

        // ---- l5: health-change analysis (shame count, bull cadence, spike hits) ----
        function l5(e, t, n, i) {
            let r;
            const o = Hg(e);
            if (!o) return;
            if (o.health <= 0 && o.vis2 && !o.visible && !o.didDeath) { runHooks(hooks.framePlayer, o, "deathAnim"); o.deaths++; o.didDeath = true; }
            if (!z.healths) z.healths = [];
            if (o.sid == z.sid) {
                if (z.healths.length >= 8) z.healths.pop();
                if (o.sid == z.sid) z.healths.push({ hp: o.health, tick: v });
            }
            if (t == -5 * (o.skinIndex == 6 ? 0.75 : 1) && o.poison) o.lastBull = v - 1;
            if (o.health <= 0) { o.Alive = false; o.Alive2 = false; }
            if (t < 0) {
                if (o.sid != z.sid && o.dmgs == "XD") o.dmgs = 0;
                if (o.sid != z.sid) o.dmgs += S(t);
                if (o == z) z.lastDamage3 = i;
            }
            o.dmgsNow.unshift(H(t * 100) / 100);
            if (t > 0) {
                if (o.skinIndex == 13) {
                    if (o.tailIndex == 13) { t == 6 && (o.lastBull = v - 1); z == o && (et = 0); return; }
                    else { t == 3 && (o.lastBull = v - 1); z == o && (et = 0); return; }
                }
                if (!isNaN(o.shameCount) && o.lastDamage) {
                    if (i - o.lastDamage <= 120) {
                        o.healTime = i - o.lastDamage2;
                        o.shameCount >= 8 && o.assumeAge >= 7 && S(tn - i) <= 2 && t <= 10 && o.loadout.utility == undefined && (o.loadout.utility = x.list[2]);
                        r = o.assumeAge >= 7 && o.loadout?.utility?.name == "cheese" && S(tn - i) <= 2 && t <= 10 ? true : false;
                        if (!r) {
                            o.noAntiList = o.noAntiList.map((x2) => x2 * 0.95);
                            !o.shameUp && (o.shameUp = []);
                            o.shameUp.length >= 5 && o.shameUp.shift();
                            o.shameUp.push(o.healTime);
                            o.gainSpeed = o.shameUp.reduce((a, b) => a + b, 0) / o.shameUp.length;
                            o.prevShameUp = o.shameCount;
                            if (o.lowHealth <= 40) o.noAntiList[o.shameCount]--;
                            o.shameCount = j(8, o.shameCount + 1);
                        }
                    } else {
                        r = o.assumeAge >= 7 && o.loadout?.utility?.name == "cheese" && S(tn - i) <= 2 && t <= 10 ? true : false;
                        if (!r) {
                            o.healTime = i - o.lastDamage2;
                            !o.shameDown && (o.shameDown = []);
                            o.shameDown.length >= 5 && o.shameDown.shift();
                            o.shameDown.push(o.healTime);
                            o.leakSpeed = o.shameDown.reduce((a, b) => a + b, 0) / o.shameDown.length;
                            o.prevShameDown = o.shameCount;
                            if (o.lowHealth <= 60) {
                                o.noAntiList[o.shameCount]++;
                                const tt = o.noAntiList.reduce((a, b) => a + (b > 0 ? b : 0), 0);
                                if (tt >= 3) {
                                    const ix = o.noAntiList.indexOf(Math.max(...o.noAntiList));
                                    if (o.noAntiList[ix] * 2 > tt) o.noAnti = ix;
                                }
                            }
                            o.shameCount = oe(0, o.shameCount - 2);
                        }
                    }
                    o.lastDamage = 0; o.lastDamage2 = 0; o.thisHealth = undefined;
                }
            } else {
                o.lowHealth = n;
                o.lastDamage = i;
                o.lastDamage2 = i;
                o.dmgDate = i;
                o.thisHealth = o.health;
                if (!te(o.sid) && Y?.inTrap) {
                    const ee = Xt.filter((e2) => se(Y.inTrap, e2) <= 50 + e2.scale + 35 && (te(e2?.owner?.sid) && e2?.group?.name == "spikes" || Y && !Y.team && e2?.group?.name == "spikes" && e2?.owner?.sid != Y.sid || e2?.type == 1 && e2.y >= 12e3));
                    if (ee.length && t == -(ee[0]?.type != 1 ? ee[0]?.dmg : 35) * (o.skinIndex == 6 ? 0.75 : 1)) o.hitSpike = true;
                }
                if (o.sid === z.sid) {
                    const ee = Xt.filter((e2) => se(z, e2) <= e2.scale + 35 && (!te(e2?.owner?.sid) && e2?.group?.name == "spikes" || e2?.type == 1 && e2.y >= 12e3));
                    if (ee.length && t == -(ee[0]?.type != 1 ? ee[0]?.dmg : 35) * (o.skinIndex == 6 ? 0.75 : 1)) o.hitSpike = ee[0];
                }
                if (o.skinIndex == 7) {
                    if (o.tailIndex == 13) {
                        if (t == -2) { o.lastBull = v - 1; o.lastBull2 = Date.now(); o.bTT = 1e3; return; }
                    } else if (t == -5) {
                        if (o == z) et = 0;
                        o.lastBull2 = Date.now(); o.bTT = 1e3; o.lastBull = v - 1;
                        return;
                    }
                }
            }
        }

        // ---- swing ("K" -> gatherAnimation): reload reset deferred to next tick ----
        function k2(e, n, t, i, s, o) {
            if (!i) return pn.push({ id: k2, data: [e, t, n, true] });
            o = Hg(e);
            if (o === null) return;
            n > 9 ? o.sr = 0 : o.pr = 0;
            o.slowMult -= weapon(n)?.hitSlow || 0.3;
            if (o.slowMult < 0) o.slowMult = 0;
            o.sid == z.sid && (z.invisTime = 1e3);
            o.skinIndex == 20 && n > 9 ? o.samRS = 0.78 : o.samRS = 1;
            o.skinIndex == 20 && n < 9 ? o.samRP = 0.78 : o.samRP = 1;
            s = Hg(e);
            const r = J.concat(bh);
            r.filter((e2) => {
                const tt = e2.sid != s.sid && se(s, e2, "player") <= weapon(n).range && (s.team && s.team != e2.team || !s.team) && getAngleDist(B(s, e2), s.d2) <= h ? true : false;
                if (!e2.isAI && tt) {
                    if (n >= 9 && (s.secondaryVar === 3 || s.skinIndex == 21) || n < 9 && (s.primaryVar === 3 || s.skinIndex == 21)) e2.poison = 5;
                }
                if (tt) {
                    if (s.skinIndex == 58 || s.skinIndex == 55 || s.tailIndex == 18) s.gatherHeal = { dmg: weapon(n).dmg, tick: v };
                }
                return false;
            });
        }
        async function onGather(p) {
            const a = p && p.args; if (!a) return;
            const e = a[0], t = a[1], n = a[2];
            let s = Hg(e);
            if (s) {
                s.lastSwing = { didHit: t, weaponIndex: n, at: Date.now() };    // for the swing animation visuals
                k2(e, t, n, false);
                s.hitBuild = t;
            }
            await A4();
            if (t) {
                s = Hg(e);
                if (s) ft.slice().forEach((r) => r.attemptResolve(s, s.skinIndex, v));
            }
        }

        // ---- building damage inference (O3): match a wiggle to the hit behind it ----
        class O3 {
            constructor(e, t) {
                this.dir = e;
                this.building = t;
                this.building.players = [];
                const n = this;
                new Promise(function (res, rej) {
                    n.resolve = res;
                    setTimeout(function () { rej(); }, 111);
                }).then(function (dmg) {
                    n.building.health -= dmg;
                    n.remove();
                }).catch(function () { n.remove(); });
            }
            remove() { const i = ft.indexOf(this); if (i >= 0) ft.splice(i, 1); }
            attemptResolve(s, o, r, e, t) {
                if (e && this.building.sid == e.building.sid && r === this.building.tick) {
                    this.resolve(this.building.projDmg ? e.dmg : 0);
                } else if (t && !e && r === this.building.tick) {
                    this.resolve(200);
                    runHooks(hooks.buildingDamage, this.building, 200, null);
                } else if (!e && this.building.owner != null && this.building.name != "mine" && this.building.name != "sapling") {
                    const ang = P(this.building.y - s.y2, this.building.x - s.x2);
                    const tt = B(s, this.building);
                    if ((H(ang * 10) / 10 == this.dir || Ay(H(ang * 10) / 10, this.dir) <= 0.1005) && r == this.building.tick && se(s, this.building, "object") <= weapon(s.weaponIndex).range && getAngleDist(tt, s.d2) <= h && !this.building.players.includes(s.sid)) {
                        const dmg = EN[s.weaponVariant] * (o == 40 ? 3.3 : 1) * weapon(s.weaponIndex).dmg * (s.weaponIndex == 10 ? 7.5 : 1);
                        this.resolve(dmg);
                        this.building.players.push(s.sid);
                        runHooks(hooks.buildingDamage, this.building, dmg, s);
                    }
                }
            }
        }
        async function onWiggle(p) {
            const a = p && p.args; if (!a) return;
            const e = a[0], t = a[1];
            await A4();
            const q = objects && objects.get(t);
            if (q) {
                q.tick = v;
                ft.push(new O3(e, q));
                q.lastHealth = q.health;
                q.animatedHealth = Date.now();
            }
        }
        function onTurretShoot(p) {
            const a = p && p.args; if (!a) return;
            const q = objects && objects.get(a[0]);
            if (q) { q.xWiggle += K.gatherWiggle * U(a[1] + W); q.yWiggle += K.gatherWiggle * V(a[1] + W); }
        }

        // ---- animals ("I" -> og) + animal attack ("J" -> sg) ----
        function onAnimals(p) {
            const args = (p && p.args) || [];
            const n = args[0] || [];
            const hidden = args[1] || [];
            bosses = { Xi: null, Ji: null, qi: null };
            for (let e = bh.length; e--;) { bh[e].forcePos = !bh[e].visible; bh[e].visible = false; }
            for (let e = 0, t = Date.now(); e < n.length; e += 8) {
                let q = Wg(n[e]);
                const dir = n[e + 4] / 100;
                if (q) {
                    q.index = n[e + 1];
                    q.t1 = q.t2 === undefined ? t : q.t2; q.t2 = t;
                    q.x1 = q.x; q.y1 = q.y;
                    q.x2 = n[e + 2]; q.y2 = n[e + 3];
                    q.d1 = q.d2 === undefined ? dir : q.d2; q.d2 = dir;
                    q.health = n[e + 5];
                    q.dt = 0; q.visible = true;
                } else {
                    const type = data.animal(n[e + 1]) || {};
                    q = {
                        sid: n[e], index: n[e + 1], isAI: true, active: true, src: type.src, name: type.name || "",
                        scale: type.scale, maxHealth: type.health, killScore: type.killScore, hostile: !!type.hostile,
                        weightM: type.weightM || 1, spriteMlt: type.spriteMlt, nameScale: type.nameScale,
                        x: n[e + 2], y: n[e + 3], dir, startX: n[e + 2], startY: n[e + 3], xVel: 0, yVel: 0, zIndex: 0
                    };
                    bh.push(q);
                    q.x2 = q.x; q.y2 = q.y; q.d2 = q.dir;
                    q.health = n[e + 5];
                    if (!type.name) q.name = ["Steph", "Bessie", "Wilfred", "Emily", "Hugo", "Sue", "Tim", "Zeus", "Mira", "Frank"][n[e + 6]] || q.name;
                    q.forcePos = true; q.visible = true;
                }
                q.state = n[e + 7];
                if (q.index < 6) continue;
                if (q.name === "MOOSTAFA") bosses.Xi = q;
                else if (q.name === "MOOFIE") bosses.Ji = q;
                else if (q.name === "Treasure") bosses.qi = q;
            }
            for (const sid of hidden) { const q = Wg(sid); if (q) q.visible = false; }
        }
        async function onAnimalAttack(p) {
            const q = Wg(p && p.args && p.args[0]);
            if (q) {
                q.lastAttack = Date.now();
                await A4();
                ft.slice().forEach((r) => r.attemptResolve(1, 1, v, 0, q));
            }
        }

        // ---- projectiles ("X" -> addProjectile -> tg, deferred one tick) ----
        function eg(t) {
            const n = Xt.filter((e) => e.name == "platform");
            for (let e = 0; e < n.length; e++) if (S4(n[e], t) <= 35 + n[e].scale) return 1;
            return 0;
        }
        function v4(t, n) {
            const e = objects && objects._list.find((o) => o.name == "turret" && o.x == t && o.y == n);
            if (e) { e.time = 2200; e.NOW = false; e.shot = Date.now(); return e; }
            return false;
        }
        function tg(i, s, o, e, t, n, r, a, l, c) {
            if (!r && !a && !l) return pn.push({ id: tg, data: [i, s, o, e, t, n, false, true] });
            if (n == 1) {
                const tur = v4(i, s);
                if (l && tur) return tur;
                if (tur) return;
            }
            let f = null;
            const hp = P3(i, s, o + W, 70);
            for (let k = 0; k < J.length; k++) {
                c = J[k];
                if (t == 1.5 && n == 1) {
                    if (c.visible && c.skinIndex == 53 && se({ x: i, y: s }, c) <= 2) { f = c; break; }
                }
                if (!(t == 1.5 && n == 1)) {
                    if (c.visible && c?.weaponIndex == c?.secondary && c.d2 === o && weapon(c.weaponIndex)?.projectile == n && S4(hp, c) <= 20) { f = c; break; }
                }
            }
            if (l) return f;
            if (f) {
                Ln.push({
                    x: f.x2, y: f.y2, dir: o, spd: t * (f.skinIndex === 1 ? 1.3 : 1),
                    avoid: t == 1.5 || eg(f) ? 1 : 0, max: x.projectiles[n].range, dmg: x.projectiles[n].dmg,
                    traveled: 0, owner: f, building: null, hit: null, info: x.projectiles[n]
                });
                const vol = ng.find((g) => g.player.sid === f.sid);
                if (!vol) ng.push({ player: f, projs: [n], amt: 1, tick: v });
                else { if (!vol.projs.includes(n)) vol.amt++; vol.projs.push(n); vol.tick = v; }
            }
            let turretGearShot = false;
            if (t == 1.5 && n == 1 && f) {
                if (rn[f.sid] === 1 && !te(f.sid) && se(f, z) <= 300 && (f.primary === 5 && f.primaryVar >= 2 || f.primary === undefined)) turretGearShot = true;
                f.tr = 0;
            }
            if (t != 1.5 && n != 1 && f) { f.skinIndex == 20 ? f.samRS = 0.78 : f.samRS = 1; f.sr = 0; }
            runHooks(hooks.projectile, { x: i, y: s, dir: o, range: e, speed: t, index: n, owner: f, turretGearShot, volley: f ? ng.find((g) => g.player?.sid == f.sid) : null });
        }
        function onProjectileAdd(p) {
            const a = p && p.args; if (!a) return;
            // server "X": [x, y, dir, range, speed, index, layer, sid]
            tg(a[0], a[1], a[2], a[3], a[4], a[5]);
        }
        // Rg (engine part): step every tracked projectile one tick and predict who
        // it hits next tick (feeds hitProjs into the damage potentials).
        function stepProjectiles(onFutureHit) {
            const nAnimals = bh.filter((e) => e.visible);
            for (let c = 0; c < Ln.length; c++) {
                let s = Infinity, o2 = Infinity;
                const rr = [];
                const a = Ln[c];
                const owner = Hg(a.owner.sid);
                if (!owner) { Ln.splice(c, 1); c--; continue; }
                const e = J.filter((e2) => e2.visible && !(typeof owner.team == "string" && e2.team == owner.team) && e2.sid != owner.sid);
                const l = Xt.filter((e2) => !e2.ignoreCollision && e2.elevation > a.avoid).concat(nAnimals, e);
                for (let i = 0; i < l.length; i++) {
                    const q = l[i];
                    const sc = q.realScale ? q.realScale : q.scale;
                    const dd = S4(a, q);
                    rr[0] = lineInRect((q.x2 || q.x) - sc, (q.y2 || q.y) - sc, (q.x2 || q.x) + sc, (q.y2 || q.y) + sc, a.owner.x2, a.owner.y2, a.x + a.spd * ce * U(a.dir), a.y + a.spd * ce * V(a.dir));
                    rr[1] = lineInRect((q.x2 || q.x) - sc, (q.y2 || q.y) - sc, (q.x2 || q.x) + sc, (q.y2 || q.y) + sc, a.owner.x2, a.owner.y2, a.x + a.spd * u * U(a.dir), a.y + a.spd * u * V(a.dir));
                    if (rr[0] && dd < s) { s = dd; Ln[c].hit = q; Ln[c].building = q.realScale ? q : null; }
                    if (rr[1] && dd < o2) { o2 = dd; Ln[c].futureHit = q; }
                }
                if (Ln[c].futureHit && !Ln[c].hit) {
                    if (Ln[c].futureHit.isPlayer) {
                        const fh = Hg(Ln[c].futureHit.sid);
                        if (fh) fh.hitProjs += Ln[c].dmg;
                        if (onFutureHit) onFutureHit(Ln[c]);
                    }
                }
                Ln[c].x += a.spd * ce * U(a.dir);
                Ln[c].y += a.spd * ce * V(a.dir);
                Ln[c].traveled += a.spd * ce;
                if (Ln[c].hit && onFutureHit) onFutureHit(Ln[c], true);
            }
            Ln.forEach((t) => {
                if (t.building) setTimeout(() => { ft.slice().forEach((r) => r.attemptResolve(1, 1, v, t)); }, 10);
            });
            for (let i = Ln.length - 1; i >= 0; i--) {
                const e = Ln[i];
                if (e.hit || e.traveled >= e.max) Ln.splice(i, 1);
            }
        }
        // UTILS.lineInRect (client)
        function lineInRect(recX, recY, recX2, recY2, x1, y1, x2, y2) {
            let minX = x1, maxX = x2;
            if (x1 > x2) { minX = x2; maxX = x1; }
            if (maxX > recX2) maxX = recX2;
            if (minX < recX) minX = recX;
            if (minX > maxX) return false;
            let minY = y1, maxY = y2;
            const dx = x2 - x1;
            if (Math.abs(dx) > 0.0000001) {
                const a = (y2 - y1) / dx, b = y1 - a * x1;
                minY = a * minX + b; maxY = a * maxX + b;
            }
            if (minY > maxY) { const tmp = maxY; maxY = minY; minY = tmp; }
            if (maxY > recY2) maxY = recY2;
            if (minY < recY) minY = recY;
            if (minY > maxY) return false;
            return true;
        }

        // ---- player values ("N"): resources + the weapon-XP the bundle tracked ----
        const lastRes = {};
        async function onPlayerValue(p) {
            const e = p.key, t = p.value;
            if (["food", "stone", "wood"].includes(String(e))) {
                const prevV = lastRes[e] != null ? lastRes[e] : 0;
                lastRes[e] = t;
                const s = t - prevV;
                await A4();
                if (s > 0) {
                    if (!z.weaponXP) z.weaponXP = [];
                    if (!z.weaponXP[z.weaponIndex]) z.weaponXP[z.weaponIndex] = 0;
                    z.weaponXP[z.weaponIndex] += s;
                }
            }
        }
        // ---- objects ("H" -> J2): learn a visible owner's loadout from what they built ----
        function onObjectsLoad(p) {
            const e = (p && p.args && p.args[0]) || [];
            for (let n = 0; n + 7 < e.length; n += 8) {
                const t = Hg(e[n + 7]);
                if (e[n + 7] !== null && t != null && L3(z, t)) b4(t.loadout, e[n + 6]);
            }
        }
        function onItemCount(p) {
            const a = p && p.args; if (!a) return;
            if (!z.itemCounts) z.itemCounts = {};
            z.itemCounts[a[0]] = a[1];
        }
        function onInventory(p) {
            if (p.isWeapon) z.weapons = p.list || [];
            else z.items = p.list || [];
            yy();
        }
        function onTribeMembers(p) {
            const a = p && p.args; if (!a) return;
            py = Array.isArray(a[0]) ? a[0].slice() : [];
        }
        function onTribeSet(p) {
            const a = p && p.args;
            if (a && (a[0] == null || a[0] === "")) py = [];
        }

        // ---- the bundle's own canBuild / hasRes for self (Player.canBuild) ----
        let sandbox = !!env.sandbox;
        function hasRes(t, n) {
            for (let e = 0; e < t.req.length;) { if ((z[t.req[e]] || 0) < H(t.req[e + 1] * (n || 1))) return false; e += 2; }
            return true;
        }
        function canBuild(e) {
            if (!e) return false;
            const t = sandbox ? e.group.sandboxLimit || oe(e.group.limit * 3, 99) : e.group.limit;
            return t && (z.itemCounts || {})[e.group.id] >= t ? false : sandbox ? true : hasRes(e);
        }
        z.canBuild = canBuild;
        z.hasRes = hasRes;

        // ---- rendered position (the bundle's render-loop interpolation) ----
        let lastFrame = 0, rafId = null;
        function interpolate(now) {
            const mh = lastFrame ? now - lastFrame : 16;
            lastFrame = now;
            const xT = Date.now() - ce;
            const list = J.concat(bh);
            for (let s = 0; s < list.length; s++) {
                const q = list[s];
                if (!q || !q.visible || q.x2 == null) continue;
                if (q.forcePos) { q.x = q.x2; q.y = q.y2; q.dir = q.d2; q.rx = q.x; q.ry = q.y; q.rdir = q.dir; continue; }
                const rr = q.t2 - q.t1, a = (xT - q.t1) / rr, l = 170;
                q.dt = (q.dt || 0) + mh;
                const c = j(1.7, q.dt / l);
                if (q.x1 == null) { q.x1 = q.x2; q.y1 = q.y2; }
                q.x = q.x1 + (q.x2 - q.x1) * c; q.y = q.y1 + (q.y2 - q.y1) * c;
                q.lastx = q.x; q.lasty = q.y;
                if (q.d1 != null && q.d2 != null && rr > 0) q.dir = lerpAngle(q.d2, q.d1, j(1.2, a));
                q.rx = q.x; q.ry = q.y; q.rdir = q.dir;
            }
        }
        function frameLoop() {
            if (!win || typeof win.requestAnimationFrame !== "function") return;
            const step = (t) => { try { interpolate(Date.now()); } catch (e) { /* ignore */ } rafId = win.requestAnimationFrame(step); };
            rafId = win.requestAnimationFrame(step);
        }

        // ---- shared per-tick state the bundle's features read/write ----
        // (exposed so a feature layer can drive it exactly like the bundle)
        const state = {
            Nt: false,              // standing in an enemy pit trap (bundle Nt), recomputed each frame
            ns: [], is: [], ss: [], // nearby damaging objects / traps / enemies <= 275
            spikeTrap: null
        };

        // ---- the tick ("a") ----
        async function updatePlayers(payload) {
            runHooks(hooks.preTick, payload);
            tn = Date.now();
            v++;
            state.ss.length = state.ns.length = state.is.length = vn.length = Sn.length = 0;
            vn = []; Sn = [];
            for (let e = J.length; e--;) {
                const q = J[e];
                q.vis2 = !!q.visible;
                q.forcePos = !q.visible;
                q.visible = false;
            }
            const positions = (payload && payload.positions) || [];
            const t = Date.now();
            for (const pos of positions) {
                const q = Hg(pos.sid);
                if (!q) continue;
                q.t1 = void 0 === q.t2 ? t : q.t2; Xe[q.sid] = q; q.t2 = t;
                // x/y were just overwritten with the server position by the runtime;
                // the bundle's x1 is the RENDERED position at this moment.
                q.x1 = q.rx != null ? q.rx : q.x; q.y1 = q.ry != null ? q.ry : q.y;
                q.preX = q.x2; q.preY = q.y2;
                q.pmovDir = q.movDir;
                q.x2 = pos.x; q.y2 = pos.y;
                q.d1 = void 0 === q.d2 ? pos.dir : q.d2; q.d2 = pos.dir;
                q.delta = q.dt; q.dt = 0;
                if (q.delta == null || isNaN(q.delta)) q.delta = ce;
                // attributes: the runtime keeps the last ones the server sent
                const isSelf = q === z;
                q.buildIndex = isSelf ? z.buildIndex : q.buildIndex;
                q.weaponIndex = isSelf ? z.weaponIndex : q.weaponIndex;
                q.weaponVariant = isSelf ? (z.weaponVariant || 0) : (q.variant || 0);
                q.isLeader = !!q.isLeader;
                q.skinIndex = isSelf ? (z.hat || 0) : (q.skin || 0);
                if (q.skinIndex != 45) { q.shameTimer = 30; q.clowned = false; }
                q.tailIndex = isSelf ? (z.accessory || 0) : (q.tail || 0);
                q.iconIndex = q.icon != null ? q.icon : q.iconIndex;
                q.visible = true;
                if (q.x1 == null || isNaN(q.x1)) { q.x1 = q.x2; q.y1 = q.y2; }
                if (q.preX == null) { q.preX = q.x2; q.preY = q.y2; }
                q.xVel = q.x2 - q.preX; q.xVel2 = q.x2 - q.x1; q.yVel = q.y2 - q.preY; q.yVel2 = q.x2 - q.x1;
                q.slowMult = oe(1, (q.slowMult || 1) + 8e-4 * ce);
                q.movSpd = D((q.preY - q.y2) ** 2 + (q.preX - q.x2) ** 2);
                q.movSpd2 = D((q.y1 - q.y2) ** 2 + (q.x1 - q.x2) ** 2);
                q.movDir = P(q.y2 - q.preY, q.x2 - q.preX);
                (q.movDir == 0 && q.movSpd == 0 || q.preX == q.x2 && q.preY == q.y2) && (q.movDir = undefined);
                q.weaponIndex >= 9 ? q.secondary = q.weaponIndex : q.primary = q.weaponIndex;
                q.weaponIndex == q.primary && (q.primaryVar = q.weaponVariant);
                q.weaponIndex == q.secondary && (q.secondaryVar = q.weaponVariant);
                q.lastpr = q.pr; q.lastsr = q.sr; q.lasttr = q.tr;
                q.tick = v;
                xy(q);
                q.weaponE = q.weaponIndex == q.secondary ? q.sr : q.pr;
                q.multpr = q.lastpr == q.pr && q.pr == 0 ? (q.multpr = 0.015, q.lastpr = 0.015) : q.pr;
                q.multsr = q.lastsr == q.sr && q.sr == 0 ? (q.multsr = 0.015, q.lastsr = 0.015) : q.sr;
                q.hitProjs = 0; q.hitSpike = false;
                q.np = l4(q);
                q.inWater = q.y2 >= K.mapScale / 2 - K.riverWidth / 2 && q.y2 <= K.mapScale / 2 + K.riverWidth / 2;
                q.buildIndex != -1 && q.loadout && b4(q.loadout, q.buildIndex);
                q.assumeAge = g4(q);
                // the runtime set x/y to the server position; the bundle's x/y is the
                // rendered position, which the frame loop keeps updating from x1.
                q.x = q.x1; q.y = q.y1; q.dir = q.rdir != null ? q.rdir : q.d2;
                if (te(q.sid)) Sn.push(q); else vn.push(q);
            }
            yy();
            runHooks(hooks.postReconstruct, payload);
            await sleep(1);                                   // wx(1)
            // ---- object windows ----
            if (objects) {
                const list = objects._list;
                Xt = list.filter((e) => (e.distance = X5(e.x - z.x2, e.y - z.y2)) <= 2e3);
                Q = Xt.filter((e) => e.distance <= 800);
            }
            // ---- A4 + deferred handlers ----
            const ve = Ve; Ve = [];
            ve.forEach((e) => e());
            const pq = pn; pn = [];
            pq.forEach((e) => e.id(...e.data));
            // ---- per-player frame upkeep (bundle ~16037-16073) ----
            for (let e = J.length; e--;) {
                const i = J[e];
                if (!i) continue;
                i.visible && (i.weaponR = i.weaponIndex == i.secondary ? i.sr : i.pr);
                if (isNaN(i.poison)) i.poison = 0;
                i.poison > 0 && (i.poison = oe(0, i.poison - (i.delta || ce) / 1e3));
                if (!i?.Alive2 && !i?.Alive) { runHooks(hooks.framePlayer, i, "died"); i.deaths++; }
                i.Alive2 = true;
                runHooks(hooks.framePlayer, i, "damage");     // stacked damages (visual) reads i.dmgs here
                i.dmgs = "XD";
                if (i.vis2 == false && i.visible && i.buildIndex == -1) {
                    if (i.weaponIndex != i?.primary && i.primaryVar <= 2) i.primaryVar = 3;
                    else if (i.weaponIndex != i?.secondary && i.secondaryVar <= 2 && (i.secondary == 10 || i.secondary == 14)) i.secondaryVar = 3;
                }
                if (i.healArr && i.healArr.length) { i.healArr.forEach((h2) => l5(i.sid, h2[0], h2[1], h2[2])); i.healArr = []; }
                if (!i.deathDmgs) i.deathDmgs = [];
                if (!i.dmgsNow) i.dmgsNow = [];
                if (i.dmgsNow.length) i.deathDmgs.push(i.dmgsNow);
                i.dmgsNow = [];
                if (i.health === 100) i.deathDmgs = [];
                i.bleed = i.lastBull ? ((v - i.lastBull + (i.sid === z.sid ? et : 0)) % 9 + 9) % 9 : undefined;
            }
            // ---- target ----
            for (let e = vn.length; e--;) vn[e].distance = D((vn[e].x2 - z.x2) ** 2 + (vn[e].y2 - z.y2) ** 2);
            vn = vn.sort((a, b) => a.distance - b.distance);
            Y = vn[0] || null;
            xi.player = J.find((e) => e.sid === xi.ID && e.visible) || null;
            if (xi.player) xi.player.positions = a4(xi.player, 6);
            else if (Y) { xi.player = Y; xi.player.positions = a4(xi.player, 6); }
            by();
            if (objects) objects.update(z.delta || ce);
            runHooks(hooks.frame, payload);
        }

        // ---- lifecycle ----
        function onSetup(p) {
            en = true;
            const q = z;
            if (J.indexOf(q) < 0) J.push(q);
            q.sid = p.sid;
        }
        function onDied() {
            en = false;
            runHooks(hooks.died);
        }

        MooMoo.on("setup", onSetup);
        MooMoo.on("playerAdd", onPlayerAdd);
        MooMoo.on("playerRemove", onPlayerRemove);
        MooMoo.on("playersUpdate", (p) => { updatePlayers(p).catch((e) => console.error("[moomoo.js] tick threw", e)); });
        MooMoo.on("gatherAnimation", (p) => { onGather(p); });
        MooMoo.on("health", onHealth);
        MooMoo.on("wiggle", (p) => { onWiggle(p); });
        MooMoo.on("turretShoot", onTurretShoot);
        MooMoo.on("animalsUpdate", onAnimals);
        MooMoo.on("animalAttack", (p) => { onAnimalAttack(p); });
        MooMoo.on("projectileAdd", onProjectileAdd);
        MooMoo.on("playerValue", (p) => { onPlayerValue(p); });
        MooMoo.on("itemCount", onItemCount);
        MooMoo.on("objectsLoad", onObjectsLoad);
        MooMoo.on("inventory", onInventory);
        MooMoo.on("tribeMembers", onTribeMembers);
        MooMoo.on("tribeSet", onTribeSet);
        MooMoo.on("died", onDied);
        frameLoop();

        function hookAdder(name) { return (fn) => { hooks[name].add(fn); return () => hooks[name].delete(fn); }; }

        return {
            // state
            get z() { return z; }, get self() { return z; },
            get tick() { return v; }, get v() { return v; },
            get et() { return et; }, set et(n) { et = n; },
            get tn() { return tn; }, get en() { return en; }, set en(b) { en = b; },
            get target() { return Y; }, set target(t) { Y = t; },
            get Y() { return Y; }, set Y(t) { Y = t; },
            xi,
            get visibleEnemies() { return vn; }, get vn() { return vn; }, set vn(a) { vn = a; },
            get visibleFriends() { return Sn; }, get Sn() { return Sn; },
            get players() { return J; }, get J() { return J; },
            get animals() { return bh; }, get bh() { return bh; }, get bosses() { return bosses; },
            get projectiles() { return Ln; }, get Ln() { return Ln; },
            get volleys() { return ng; }, set volleys(a) { ng = a; }, get ng() { return ng; }, set ng(a) { ng = a; },
            get ft() { return ft; },
            get Xt() { return Xt; }, get Q() { return Q; },
            get py() { return py; },
            get loadout() { return loadout; },
            rn, an, ln, Xe, state,
            get sandbox() { return sandbox; }, set sandbox(b) { sandbox = !!b; },
            selfInput,
            // timing
            A4, nextTick: A4, defer: (fn, ...args) => pn.push({ id: fn, data: args }),
            // geometry + predicates
            se, B, S4, Dy, P3, L3, X5, Ne, Ay, angleDist: getAngleDist, getDirection, getDistance, lerpAngle, lineInRect,
            _y, Vy, o4, l4, a4, x4, w4, b4, g4, xy, l5, te, Hg, jg, Wg, yy, canBuild, hasRes,
            stepProjectiles,
            variantVal, weaponSpeed, weaponRange,
            visiblePlayers: () => J.filter((p) => p !== z && p.visible),
            K, ce, u, EN, h, O3,
            // hooks (feature layers run here, in the bundle's order)
            onPreTick: hookAdder("preTick"),
            onPostReconstruct: hookAdder("postReconstruct"),
            onFrame: hookAdder("frame"),
            onFramePlayer: hookAdder("framePlayer"),
            onProjectile: hookAdder("projectile"),
            onPlayerAdded: hookAdder("playerAdded"),
            onPlayerLeft: hookAdder("playerLeft"),
            onBuildingDamage: hookAdder("buildingDamage"),
            onDied: hookAdder("died"),
            // for tests / advanced
            _updatePlayers: updatePlayers, _interpolate: interpolate,
            get _pn() { return pn; }, get _Ve() { return Ve; }
        };

        // ---- combat predicates ported 1-1 ----
        function _y(e, t) {
            if (!e) return;
            !t && (t = 111);
            return j(1, e.weaponR + t / weapon(e.weaponIndex)?.speed);
        }
        function Vy(e, t, n, i) {
            return se(e, t, "player") <= n || i && se(e?.np?.real, t?.np?.real, "player") <= n;
        }
        function o4(e, t, n) {
            if (t.weaponIndex != 11) return true;
            n = B(e, t);
            return getAngleDist(n + W, t.dir) > W / 3;
        }
    }

    return { createCombat, K, ce, EN, r3 };
});
