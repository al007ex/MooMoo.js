/*
 * moomoo.js loader — GAME HELPERS  (combat / placement / hats / targeting)
 * ========================================================================
 * These are the game-specific verbs the old bundle's features are built from,
 * ported to packets the loader already speaks. They're injected into every mod's
 * `ctx` (see runtime.js `ctxExtensions`), so a mod can just call `ctx.place(...)`,
 * `ctx.eat()`, `ctx.setHat(...)`, `ctx.nearestEnemy()`, etc.
 *
 * Mechanics are taken straight from the server's packet handler
 * (server/src/network/packets.js):
 *   - select an item/weapon:  selectItem(index, isWeapon)      ->  wire "z"
 *   - place OR eat the selected item:  mouse(true, dir)        ->  wire "F" (buildItem)
 *   - attack (no item selected):       mouse(true, dir)        ->  wire "F" (hits++)
 *   - equip hat/accessory:   store(1, id, isAccessory)         ->  wire "c"
 *
 * Part of the LOADER (volatile).
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooHelpers = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooHelpers = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const SERVER_TICK = 1000 / 9;   // ~111.11ms — one server tick (combo timing unit)

    // Build the ctxExtensions function. `env` = { MooMoo, input, data, objects }.
    function createHelpers(env) {
        const MooMoo = env.MooMoo;
        const data = env.data;
        const input = env.input;
        const objects = env.objects || null;
        const combatEngine = env.combat || null;
        const net = env.net || null;
        const S = () => MooMoo.self;

        // ---- combat state: weapon reload + variants (reconstructed from packets) ----
        // Mirrors the client's model: a weapon's reload fills over weapon.speed (ms),
        // scaled by samRP (Samurai Armor = hat 20 -> 0.78). It resets on every swing,
        // which the server echoes as the gather-animation packet "K" =
        // [sid, didHit, weaponIndex, (1/atkSpd)?]. So we read our own swings off "K"
        // and a weapon is "ready" once weapon.speed*samRP ms have passed.
        const WEAPON_VARIANT = [1, 1.1, 1.18, 1.18];   // damage multiplier by variant (gold/diamond/ruby)
        let serverTick = 0;
        let lastPrimarySwing = 0, lastSecondarySwing = 0;
        MooMoo.on("playersUpdate", () => { serverTick++; });
        MooMoo.on("gatherAnimation", (p) => {
            const a = p && p.args;
            if (!a || a[0] !== S().sid) return;
            const w = a[2];
            if (typeof w !== "number") return;
            if (w > 8) lastSecondarySwing = Date.now(); else lastPrimarySwing = Date.now();
        });
        const samRP = () => (S().hat === 20 ? 0.78 : 1);   // Samurai Armor attack-speed bonus
        const weaponSpeed = (id) => { const w = data.weapon(id); return (w && w.speed != null) ? w.speed : 300; };
        const primaryId = () => (S().weapons || [])[0];
        const secondaryId = () => (S().weapons || [])[1];
        function primaryReady() { const id = primaryId(); return id != null && (Date.now() - lastPrimarySwing) >= weaponSpeed(id) * samRP(); }
        function secondaryReady() { const id = secondaryId(); return id != null && (Date.now() - lastSecondarySwing) >= weaponSpeed(id) * samRP(); }
        const variantVal = (v) => WEAPON_VARIANT[v] || 1;
        // Mark a swing optimistically the instant we send an attack, so back-to-back
        // combo decisions don't fire before the server's "K" echo arrives.
        function markSwing() { if (S().weaponIndex > 8) lastSecondarySwing = Date.now(); else lastPrimarySwing = Date.now(); }

        // ---- geometry ----
        // The bundle's combat math works on PREDICTED positions (x2/y2) and falls
        // back to the live position when there's no prediction. These primitives
        // are ported 1-1 from the bundle so features behave identically:
        //   S4(a,b)        center distance            -> centerDist
        //   se(a,b,type)   edge distance (+offset)    -> edgeDist   (player -63, object -scale)
        //   B(a,b)         angle a->b                 -> angleBetween
        //   getAngleDist   smallest angle between     -> angleDist
        const TAU = Math.PI * 2;
        const px = (e) => (e && e.x2 != null ? e.x2 : (e ? e.x : 0)) || 0;
        const py = (e) => (e && e.y2 != null ? e.y2 : (e ? e.y : 0)) || 0;
        const dist = (a, b) => Math.hypot(px(b) - px(a), py(b) - py(a));
        const centerDist = dist;
        const edgeDist = (a, b, type) => {
            const off = type === "player" ? -1.8 * 35 : type === "object" ? -(b && b.scale || 0) : 0;
            return Math.hypot(px(b) - px(a), py(b) - py(a)) + off;
        };
        const angle = (from, to) => Math.atan2(py(to) - py(from), px(to) - px(from));
        const angleBetween = angle;
        function angleDist(a, b) {
            let n = Math.abs(a - b) % TAU;
            if (n > Math.PI) n = TAU - n;
            return n;
        }
        const toRad = (deg) => deg * (Math.PI / 180);

        // ---- targeting ----
        function visiblePlayers() {
            const out = [];
            for (const p of MooMoo.players.values()) if (p.sid !== S().sid && p.visible) out.push(p);
            return out;
        }
        function enemies() {
            const me = S();
            return visiblePlayers().filter((p) => !(me.team != null && p.team != null && p.team === me.team));
        }
        function nearestEnemy(maxRange) {
            const me = S();
            let best = null, bd = Infinity;
            for (const p of enemies()) {
                const d = dist(me, p);
                if (d < bd && (maxRange == null || d <= maxRange)) { bd = d; best = p; }
            }
            return best;
        }
        // Worst-case melee damage an in-range enemy could land this tick (enemies are
        // assumed max variant, like the client's dmgpot). Used for soldier/heal logic.
        function predictedDamage(range) {
            let worst = 0;
            for (const p of enemies()) {
                const w = data.weapon(p.weaponIndex);
                if (!w || w.dmg == null) continue;
                if (dist(S(), p) > (range != null ? range : (w.range || 0) + 70)) continue;
                const d = w.dmg * variantVal(p.weaponVariant != null ? p.weaponVariant : 3);
                if (d > worst) worst = d;
            }
            return worst;
        }

        // ---- inventory resolution ----
        function ownedItemsInGroup(groupName) {
            const out = [];
            for (const id of S().items) { const it = data.item(id); if (it && it.group.name === groupName) out.push(it); }
            return out;
        }
        // Resolve `which` (item id | item name | group name) to an owned item id, or -1.
        function resolvePlaceable(which) {
            if (typeof which === "number") return which;
            const named = data.itemByName(which);
            if (named) return named.id;
            const owned = ownedItemsInGroup(which).sort((a, b) => b.id - a.id); // most advanced first
            return owned.length ? owned[0].id : -1;
        }

        // ---- actions ----
        function selectWeapon(id) { MooMoo.send.selectItem(id, true); }
        function equipWeapon(id) { if (id != null) selectWeapon(id); }

        // Place a building toward `dir` (defaults to the current facing), then put
        // the weapon back so attacking resumes. One F-down = one placed object.
        function place(which, dir) {
            const id = resolvePlaceable(which);
            if (id < 0) return false;
            const d = dir == null ? (S().dir || 0) : dir;
            MooMoo.send.selectItem(id, false);
            MooMoo.send.mouse(true, d);
            selectWeapon(S().weaponIndex);
            return true;
        }

        // Eat food (apple by default). Same mechanic as placing, but food items are
        // `consume` so the server heals you instead of building.
        function eat(which) {
            let id;
            if (typeof which === "number") id = which;
            else { const f = data.itemByName(which || "apple"); id = f ? f.id : 0; }
            MooMoo.send.selectItem(id, false);
            MooMoo.send.mouse(true, S().dir || 0);
            selectWeapon(S().weaponIndex);
            return true;
        }

        // Attacking. If a buildable is selected, reselect the weapon first so the
        // mouse-down is an attack, not a placement.
        function ensureWeapon() { if (S().buildIndex >= 0) selectWeapon(S().weaponIndex); }
        function startAttack(dir) { ensureWeapon(); MooMoo.send.mouse(true, dir == null ? undefined : dir); markSwing(); }
        function stopAttack() { MooMoo.send.mouse(false); }
        function attackOnce(dir) { ensureWeapon(); MooMoo.send.mouse(true, dir == null ? undefined : dir); MooMoo.send.mouse(false); markSwing(); }

        // Aiming.
        function aim(dir) { MooMoo.send.aim(dir); }
        function aimAt(x, y) { MooMoo.send.aim(Math.atan2(y - S().y, x - S().x)); }
        function aimAtPlayer(p) { if (p) aimAt(p.x, p.y); }
        function aimAtMouse() { if (input) MooMoo.send.aim(input.aimAngle()); }

        // Hats / accessories (store action 0 = buy, 1 = equip).
        function setHat(id) { MooMoo.send.store(1, id | 0, false); }
        function setTail(id) { MooMoo.send.store(1, id | 0, true); }
        function unequipHat() { MooMoo.send.store(1, 0, false); }
        function unequipTail() { MooMoo.send.store(1, 0, true); }
        function buyHat(id) { MooMoo.send.store(0, id | 0, false); }
        function buyTail(id) { MooMoo.send.store(0, id | 0, true); }

        // Weapon info.
        function heldWeapon() { return data.weapon(S().weaponIndex); }
        function ownedWeapons() { return (S().weapons || []).map((id) => data.weapon(id)).filter(Boolean); }
        function fastestWeapon() {
            const ws = ownedWeapons().filter((w) => w.speed != null);
            if (!ws.length) return null;
            return ws.reduce((a, b) => (b.speed < a.speed ? b : a));
        }

        // The ctxExtensions function the runtime calls for each mod. `ctx` already
        // has on/every/etc. that auto-tear-down, so onTick piggybacks on ctx.on.
        return function (ctx /*, rec, active */) {
            return {
                // data + input + constants
                data, gameData: data, input, SERVER_TICK,
                now: () => Date.now(),
                // geometry + targeting (bundle-faithful primitives)
                distance: dist, angleTo: angle,
                centerDist, edgeDist, angleBetween, angleDist, toRad,
                visiblePlayers, enemies, nearestEnemy, predictedDamage,
                // world objects (buildings / resources / turrets / traps)
                objects,
                // outgoing: rate governor, packet counts, ping (see outgoing.js)
                net,
                // combat state: the full engine (per-player prediction/reload/bull)
                // when present; a minimal reload shim otherwise (headless tests).
                combat: combatEngine || {
                    get tick() { return serverTick; },
                    primaryReady, secondaryReady, variantVal, samRP, markSwing,
                    primaryId, secondaryId, weaponSpeed,
                    get primaryVar() { return S().weaponVariant != null ? S().weaponVariant : 0; }
                },
                primaryReady, secondaryReady, markSwing,
                // tick (fires once per server movement update)
                onTick: (fn) => ctx.on("playersUpdate", fn),
                // combat verbs
                place, eat, equipWeapon, selectWeapon,
                startAttack, stopAttack, attackOnce,
                aim, aimAt, aimAtPlayer, aimAtMouse,
                // hats
                setHat, setTail, unequipHat, unequipTail, buyHat, buyTail,
                // weapon info
                heldWeapon, ownedWeapons, fastestWeapon,
                resolvePlaceable
            };
        };
    }

    return { createHelpers, SERVER_TICK };
});
