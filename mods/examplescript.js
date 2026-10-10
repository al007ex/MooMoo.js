/*
 * examplescript — the port of the old bundle's combat/sync mod onto moomoo.js.
 * ===========================================================================
 * One mod, many settings grouped into config-menu tabs (press ` or the gear).
 * Every feature reads its setting live, so toggling in the menu is instant.
 *
 * Reliability: every event/tick handler is wrapped so a single feature can never
 * throw into the game loop. Auto-heal mirrors the bundle's eat mechanic exactly
 * (select food -> use -> reselect weapon) and is gated on actually having the
 * food resource, so taking damage can't get you stuck holding apples.
 *
 * See PORT.md for the full checklist. Install: a Tampermonkey userscript that
 * @requires the loader (mods/examplescript.user.js does this for you).
 */
(function () {
    "use strict";

    function boot(MooMoo) {
        MooMoo.register({
            id: "examplescript",
            name: "Example Script",
            version: "0.2.0",
            description: "Ported combat/heal features from the old bundle.",
            menu: true,
            liveSettings: true,
            defaultEnabled: true,
            settings: [
                // ---- Healing ----
                { key: "autoHeal", default: true, label: "Auto heal", category: "Healing", hint: "eat enough food to refill the instant you take damage" },
                { key: "healThreshold", type: "number", min: 1, max: 100, step: 1, default: 99, label: "Heal below (hp)", category: "Healing" },
                // ---- Combat ----
                { key: "autoAttack", default: false, label: "Auto attack", category: "Combat", hint: "hold your weapon on the nearest enemy in range" },
                { key: "autoAttackKey", type: "key", default: "", label: "Auto attack toggle key", category: "Combat" },
                { key: "autoEquipFastest", default: false, label: "Auto equip fastest weapon", category: "Combat" },
                { key: "autohat", default: false, label: "Autohat", category: "Combat", hint: "bull in melee range, soldier otherwise" },
                { key: "autohatKey", type: "key", default: "", label: "Autohat toggle key", category: "Combat" },
                { key: "strictSoldier", default: false, label: "Strict soldier", category: "Combat", hint: "autohat stays on soldier (never bull)" },
                { key: "strictMonkey", default: false, label: "Strict monkey", category: "Combat", hint: "autohat uses monkey tail for speed" }
            ]
        }, function (ctx) {
            const data = ctx.data;
            const SHAME = 45, BULL = 7, SOLDIER = 6, MONKEY_TAIL = 11;

            // Never let a feature throw into the game loop.
            function safe(fn) { try { fn(); } catch (e) { ctx.log("feature error:", e); } }

            // ---------- healing ----------
            function canEat() {
                if (ctx.self.hat === SHAME) return false;        // shame hat can't eat
                const hat = data.hat(ctx.self.hat);
                return !(hat && hat.noEat);                       // Assassin Gear can't eat
            }
            // The food you'd actually eat: the highest-heal food you own (your food
            // slot only ever holds one tier), falling back to apple.
            function currentFood() {
                const owned = (ctx.self.items || [])
                    .map(function (id) { return data.item(id); })
                    .filter(function (it) { return it && it.group && it.group.name === "food" && it.heal > 0; })
                    .sort(function (a, b) { return b.heal - a.heal; });
                return owned[0] || data.item(0);                 // apple (id 0) always exists
            }
            function foodCost(food) { return (food && food.req && typeof food.req[1] === "number") ? food.req[1] : 0; }

            // The server's anti-cheat shames you (forced Shame hat, eating blocked)
            // if you eat within 120ms of being hit — that's exactly what naive
            // auto-heal does, and the packet flood from eating on every hit is what
            // got you disconnected. So we do what the real bundle does: wait until
            // we're safely PAST that window since the last hit, then eat to full in
            // one controlled burst.
            const SHAME_WINDOW = 120, SAFE_DELAY = 130;   // ms; eat >120ms after a hit
            const BURST_GAP = 180;                         // ms min between heal bursts (let the server reply)
            const MAX_EATS = 6;                            // cap the burst so we never flood
            let lastDamage = 0, lastHealth = 100, healTimer = null, lastBurst = 0, healthAtBurst = -1, noProgress = 0;

            function doHeal() {
                healTimer = null;
                if (!ctx.settings.autoHeal || !ctx.self.alive || !canEat()) return;
                if (ctx.self.health >= ctx.settings.healThreshold) return;
                if (Date.now() - lastDamage < SHAME_WINDOW + 5) { scheduleHeal(); return; } // still in shame window
                // No-progress cutoff: if the last burst didn't raise health (out of
                // food / shamed / can't eat), stop — a real health change resets it,
                // so we can never tight-loop into a packet flood.
                if (healthAtBurst >= 0 && ctx.self.health <= healthAtBurst) { if (++noProgress >= 2) return; }
                const food = currentFood();
                if (!food || !food.heal) return;
                let needed = Math.ceil((100 - ctx.self.health) / food.heal);
                const cost = foodCost(food);
                if (cost > 0 && typeof ctx.self.food === "number") needed = Math.min(needed, Math.floor(ctx.self.food / cost));
                needed = Math.min(needed, MAX_EATS);
                if (needed <= 0) return;
                // Past the shame window, one F per eat stays well under the rate bucket.
                const weapon = ctx.self.weaponIndex;
                ctx.send.selectItem(food.id | 0, false);
                for (let i = 0; i < needed; i++) ctx.send.mouse(true, ctx.self.dir || 0);
                ctx.send.selectItem(weapon | 0, true);
                lastBurst = Date.now(); healthAtBurst = ctx.self.health;
                // Don't self-reschedule: the server's health reply drives the next
                // burst (via the health handler), so we never loop ahead of it.
            }
            function scheduleHeal() {
                if (healTimer || !ctx.settings.autoHeal) return;
                const now = Date.now();
                const wait = Math.max(0, SAFE_DELAY - (now - lastDamage), BURST_GAP - (now - lastBurst));
                healTimer = setTimeout(function () { safe(doHeal); }, wait);
            }
            ctx.on("health", function (p) {
                if (p.sid !== ctx.self.sid) return;
                if (p.value < lastHealth) lastDamage = Date.now();         // took damage -> shame window starts
                if (p.value > lastHealth) { noProgress = 0; healthAtBurst = -1; } // real heal -> progress
                lastHealth = p.value;
                if (ctx.settings.autoHeal && p.value < ctx.settings.healThreshold) scheduleHeal();
            });
            ctx.on("died", function () {
                lastHealth = 100; healthAtBurst = -1; noProgress = 0;
                if (healTimer) { clearTimeout(healTimer); healTimer = null; }
            });

            // ---------- auto equip fastest weapon ----------
            function autoEquip() {
                if (!ctx.settings.autoEquipFastest || !ctx.self.alive) return;
                const f = ctx.fastestWeapon();
                if (f && ctx.self.weaponIndex !== f.id) ctx.equipWeapon(f.id);
            }

            // ---------- autohat ----------
            // Debounced so an un-owned hat can't make it spam the store packet every
            // tick: we only re-send a target at most every ~0.5s until it takes.
            let lastHatTarget = -1, lastHatSent = 0, lastTailTarget = -1, lastTailSent = 0;
            function wantHat() {
                if (ctx.settings.strictSoldier) return SOLDIER;
                // Match the bundle's dmgpot logic: go soldier (0.75 dmg taken) when an
                // in-range enemy could land a hit that leaves us low; otherwise bull
                // (1.5x dmg done) to pressure. No enemy nearby -> soldier (safe default).
                const incoming = ctx.predictedDamage ? ctx.predictedDamage() : 0;
                if (incoming > 0 && ctx.self.health - incoming * 0.75 <= 35) return SOLDIER;
                return ctx.nearestEnemy(270) ? BULL : SOLDIER;
            }
            function autoHat() {
                if (!ctx.settings.autohat || !ctx.self.alive) return;
                const want = wantHat();
                const now = Date.now();
                if (ctx.self.hat !== want && !(lastHatTarget === want && now - lastHatSent < 500)) {
                    ctx.setHat(want); lastHatTarget = want; lastHatSent = now;
                }
                if (ctx.settings.strictMonkey) {
                    if (ctx.self.accessory !== MONKEY_TAIL && !(lastTailTarget === MONKEY_TAIL && now - lastTailSent < 500)) {
                        ctx.setTail(MONKEY_TAIL); lastTailTarget = MONKEY_TAIL; lastTailSent = now;
                    }
                }
            }

            // ---------- auto attack ----------
            let attacking = false;
            function autoAttack() {
                if (!ctx.settings.autoAttack || !ctx.self.alive) {
                    if (attacking) { ctx.stopAttack(); attacking = false; }
                    return;
                }
                const w = ctx.heldWeapon();
                const range = (w && w.range) ? w.range + 70 : 150;
                const enemy = ctx.nearestEnemy(range);
                if (enemy) {
                    ctx.aimAtPlayer(enemy);
                    ctx.startAttack(ctx.angleTo(ctx.self, enemy));
                    attacking = true;
                } else if (attacking) {
                    ctx.stopAttack(); attacking = false;
                }
            }

            // ---------- optional hotkeys ----------
            function bindToggle(keySetting, settingKey) {
                if (!ctx.input) return;
                let unbind = null;
                function rebind() {
                    if (unbind) { unbind(); unbind = null; }
                    const k = ctx.settings[keySetting];
                    if (k) unbind = ctx.input.onKey(k, function () { ctx.setSetting(settingKey, !ctx.settings[settingKey]); });
                }
                rebind();
                ctx.onSettingChange(function (key) { if (key === keySetting) rebind(); });
                ctx.onCleanup(function () { if (unbind) unbind(); });
            }
            bindToggle("autohatKey", "autohat");
            bindToggle("autoAttackKey", "autoAttack");

            // ---------- per-tick driver ----------
            ctx.onTick(function () {
                safe(autoEquip);
                safe(autoHat);
                safe(autoAttack);
            });

            ctx.log("v0.2 loaded — config menu on the ` key or the gear button");
        });
    }

    const w = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
    if (w.MooMoo) { boot(w.MooMoo); return; }
    let tries = 0;
    const iv = setInterval(function () {
        if (w.MooMoo) { clearInterval(iv); boot(w.MooMoo); }
        else if (++tries > 200) clearInterval(iv);
    }, 50);
    if (w.addEventListener) w.addEventListener("moomoo:ready", function () { if (w.MooMoo) { clearInterval(iv); boot(w.MooMoo); } });
})();
