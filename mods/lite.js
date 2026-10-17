/*
 * MooMoo Lite (MML) — a small, friendly mod on the moomoo.js API.
 * ==============================================================
 * Everything it does is ADDITIVE: it never takes over the client's own movement,
 * aim or attacking, so it drops in next to normal play (and is a tidy worked
 * example of the public `ctx` API: place / eat / setHat / input / store / combat).
 *
 *   place spammers   hold a key to keep placing an item (spike / trap / turret or
 *                    teleporter / windmill). each one's key, item and speed are
 *                    customizable.
 *   auto heal        eats when you drop below a threshold, with an optional "legit"
 *                    mode: heal a bit lower, show the food in hand for a moment
 *                    first, and jitter the timing so it doesn't look robotic.
 *   hat hotkeys      bind keys to equip (toggle) a hat by id.
 *   its own menu      opens on a key (default O), styled like the game's own boxes.
 *
 * Config lives in localStorage "mml_v1" and is edited entirely from the menu.
 */
(function () {
    "use strict";

    function boot(MooMoo) {
        MooMoo.register({
            id: "moomoo-lite",
            name: "MooMoo Lite",
            version: "1.0.0",
            description: "Place spammers, legit auto heal and hat hotkeys. Press the menu key (default O).",
            menu: true,
            menuHint: "Open MooMoo Lite's menu with its key (default O) to set everything up.",
            liveSettings: true,
            defaultEnabled: true
        }, function (ctx) {
            const win = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
            const doc = (win.document && win.document.createElement) ? win.document : null;
            const data = ctx.data;
            const self = () => MooMoo.self;
            // hat catalog + icons (served at /img/hats/hat_<id>.png)
            const HAT_BY_ID = {};
            for (const h of (data.hats || [])) HAT_BY_ID[h.id] = h;
            const hatImg = (id) => "/img/hats/hat_" + id + ".png";
            const hatName = (id) => !id ? "None" : (HAT_BY_ID[id] ? HAT_BY_ID[id].name : "Hat " + id);
            // accessory ("tail") catalog + icons (served at /img/accessories/access_<id>.png)
            const ACC_BY_ID = {};
            for (const a of (data.accessories || [])) ACC_BY_ID[a.id] = a;
            const accImg = (id) => "/img/accessories/access_" + id + ".png";
            const accName = (id) => !id ? "None" : (ACC_BY_ID[id] ? ACC_BY_ID[id].name : "Acc " + id);

            // ---- config ----
            // The four spammers are fixed jobs; their key / item / speed / on are yours.
            const SPAMMERS = [
                { id: "spike", label: "Spike", key: "v", item: "spikes", speed: 111 },
                { id: "trap", label: "Trap / Boost pad", key: "f", item: "trap|booster", speed: 111 },
                { id: "turret", label: "Turret / Teleporter", key: "t", item: "utility", speed: 150 },
                { id: "windmill", label: "Windmill", key: "n", item: "mill", speed: 150 }
            ];
            const DEFAULTS = {
                menuKey: "o",
                spammers: {},
                heal: { on: true, healAt: 70, legit: true, showInHand: 90, jitter: 40, maxPerSec: 6, shameSafe: true },
                humanize: { on: true, jitter: 25, pauseChance: 8, pauseMax: 350 },
                insta: { key: "r", mode: "packet", swapDelay: 100, switchBack: true, autoAim: true, primaryHat: 7, secondaryHat: 53, primaryAcc: 0, secondaryAcc: 0 },
                hats: [{ key: "", id: 7 }, { key: "", id: 6 }, { key: "", id: 40 }, { key: "", id: 11 }, { key: "", id: 0 }, { key: "", id: 0 }]
            };
            for (const s of SPAMMERS) DEFAULTS.spammers[s.id] = { key: s.key, item: s.item, speed: s.speed, on: true };

            const prefs = JSON.parse(JSON.stringify(DEFAULTS));
            try {
                const raw = win.localStorage && win.localStorage.getItem("mml_v1");
                const got = raw ? JSON.parse(raw) : null;
                if (got && typeof got === "object") {
                    if (typeof got.menuKey === "string" && got.menuKey) prefs.menuKey = got.menuKey;
                    if (got.heal && typeof got.heal === "object") Object.assign(prefs.heal, got.heal);
                    if (got.humanize && typeof got.humanize === "object") Object.assign(prefs.humanize, got.humanize);
                    if (got.insta && typeof got.insta === "object") Object.assign(prefs.insta, got.insta);
                    if (Array.isArray(got.hats)) got.hats.forEach((h, i) => { if (prefs.hats[i] && h) Object.assign(prefs.hats[i], h); });
                    if (got.spammers) for (const s of SPAMMERS) if (got.spammers[s.id]) Object.assign(prefs.spammers[s.id], got.spammers[s.id]);
                    if (prefs.spammers.trap.item === "trap") prefs.spammers.trap.item = "trap|booster";   // old saves
                }
            } catch (e) { /* defaults */ }
            const save = () => { try { win.localStorage && win.localStorage.setItem("mml_v1", JSON.stringify(prefs)); } catch (e) {} };

            // ---- keys ----
            const keyId = (e) => (e.key === " " ? "Space" : e.key);
            const keyLabel = (id) => !id ? "—" : id === "Space" ? "Space" : id.length === 1 ? id.toUpperCase() : id;
            const same = (a, b) => !!a && !!b && a.toLowerCase() === b.toLowerCase();
            function typing() {
                const a = doc && doc.activeElement;
                if (!a || a === doc.body) return false;
                if (a.isContentEditable || a.tagName === "TEXTAREA") return true;
                return a.tagName === "INPUT" && /^(text|search|number|password|email|url|tel|)$/i.test(a.type || "");
            }

            // ---- resolve the item to place ----
            // "utility" = whatever age-7+ building is in your bar (turret / teleporter / ...).
            const UTILITY = ["turret", "platform", "healing pad", "spawn pad", "blocker", "teleporter"];
            // "a|b" = first of those you have (trap|booster -> pit trap or boost pad).
            function resolveItem(which) {
                const bar = (self().items) || [];
                // numeric id: only if you actually own it. Selecting an item you
                // don't have is ignored by the server (no strike), and the real
                // client never sends one, so refuse to resolve to it.
                if (typeof which === "number") return bar.indexOf(which) >= 0 ? which : -1;
                if (which.includes("|")) {
                    for (const w of which.split("|")) { const id = resolveItem(w.trim()); if (id >= 0) return id; }
                    return -1;
                }
                if (which === "utility") {
                    for (const id of bar) { const it = data.item(id); if (it && UTILITY.includes(it.name)) return id; }
                    return -1;
                }
                // the bar item whose item-name or group-name matches (covers tiered items).
                // No itemByName fallback: that could name an item you haven't
                // upgraded to, which the server would silently ignore.
                for (const id of bar) { const it = data.item(id); if (it && (it.name === which || (it.group && it.group.name === which))) return id; }
                return -1;
            }
            // place toward the cursor, falling back to your facing
            const placeDir = () => (ctx.input ? ctx.input.aimAngle() : (self().dir || 0));

            // ---- place spammers ----
            // Humanized spacing: a bell-shaped jitter around the base interval plus the
            // odd longer hesitation, so placements don't land on a fixed clock that a
            // packet-timing check could flag as a script. (off -> the plain fixed speed.)
            function nextDelay(cfg) {
                const base = Math.max(40, cfg.speed | 0);
                const h = prefs.humanize;
                if (!h || !h.on) return base;
                // sum of three uniforms ~ a bell centered on 0.5 (central limit): most gaps
                // sit near the base and the extremes are rare, like a person's rhythm.
                const g = (Math.random() + Math.random() + Math.random()) / 3;
                let d = base * (1 + (g - 0.5) * 2 * ((h.jitter | 0) / 100));
                // every so often, hold a little longer (a glance away, a reaction)
                if (Math.random() * 100 < (h.pauseChance | 0)) d += Math.random() * (h.pauseMax | 0);
                return Math.max(40, Math.round(d));
            }

            const timers = {};   // spammer id -> timeout id
            function startSpam(s) {
                if (timers[s.id]) return;
                const cfg = prefs.spammers[s.id];
                const loop = () => {
                    if (prefs.spammers[s.id].on && self() && self().alive) {
                        const id = resolveItem(cfg.item);
                        if (id >= 0) ctx.place(id, placeDir());
                    }
                    timers[s.id] = win.setTimeout(loop, nextDelay(cfg));
                };
                loop();
            }
            function stopSpam(id) { if (timers[id]) { win.clearTimeout(timers[id]); timers[id] = 0; } }
            ctx.onCleanup(() => { for (const id in timers) stopSpam(id); });

            // ---- auto heal ----
            let healTimer = 0, lastHealAt = 0;
            function tryHeal() {
                const h = prefs.heal, me = self();
                if (!h.on || healTimer || !me || !me.alive) return;
                if (me.health == null || me.health >= 100 || me.health > h.healAt) return;
                const gap = 1000 / Math.max(1, h.maxPerSec | 0);
                if (Date.now() - lastHealAt < gap) return;
                lastHealAt = Date.now();
                const food = (me.items && me.items[0] != null) ? me.items[0] : 0;
                if (!(me.items && me.items.indexOf(food) >= 0)) return;   // never select a food you don't own
                if (!h.legit) { ctx.eat(food); return; }
                // legit: show the food in hand, then eat after a human-ish delay
                MooMoo.send.selectItem(food, false);
                let wait = (h.showInHand | 0) + Math.random() * (h.jitter | 0);
                if (h.shameSafe && ctx.combat && ctx.combat.shameWait) wait = Math.max(wait, ctx.combat.shameWait());
                healTimer = win.setTimeout(() => {
                    healTimer = 0;
                    if (!self() || !self().alive) return;
                    MooMoo.send.mouse(true, self().dir || 0);                 // eat
                    MooMoo.send.selectItem(self().weaponIndex, true);          // back to the weapon
                }, wait);
            }
            ctx.on("health", (p) => { if (p.sid === self().sid) tryHeal(); });
            ctx.every(100, tryHeal);
            ctx.onCleanup(() => { if (healTimer) win.clearTimeout(healTimer); });

            // ---- hat hotkeys ----
            function hatKey(h) {
                const me = self();
                if (!me || !me.alive) return;                 // the server ignores store packets while you're dead
                if (!h.id) { ctx.setHat(0); return; }         // explicit "take it off" (always valid)
                if (ctx.store && ctx.store.hat === h.id) { ctx.setHat(0); return; }   // toggle: already on -> off
                if (ctx.store && ctx.store.ownsHat && !ctx.store.ownsHat(h.id)) return;  // never equip a hat you don't own
                ctx.setHat(h.id);
            }

            // ---- instakill combo ----
            // Two hits: primary (in the primary hat) then secondary (in the secondary hat).
            // "Confirmed" (packet) mode swaps to the secondary only once the server echoes
            // the first swing ("K"), so the primary lands before the weapon changes; "Timed"
            // mode swaps after a fixed delay. Auto-aim points each hit at the nearest enemy.
            // Everything goes out as ordinary packets through the rate governor.
            let instaBusy = false;
            function waitForOwnSwing(cb, timeoutMs) {
                let done = false, unsub = null;
                const finish = () => { if (done) return; done = true; if (unsub) { try { unsub(); } catch (e) {} } cb(); };
                unsub = ctx.on("gatherAnimation", (pk) => {
                    const a = pk && pk.args, me = self();
                    if (a && me && a[0] === me.sid) finish();   // our own swing was registered
                });
                ctx.after(Math.max(60, timeoutMs | 0), finish);  // fallback (out of range / ranged primary)
            }
            function runInsta() {
                const cfg = prefs.insta, me = self();
                if (instaBusy || !me || !me.alive) return;
                const weapons = me.weapons || [];
                const primary = weapons[0];
                const secondary = weapons[1];
                if (primary == null) return;
                instaBusy = true;
                const prevHat = (ctx.store && ctx.store.hat) || 0;   // restore it after the combo
                const prevAcc = (ctx.store && ctx.store.tail) || 0;  // the accessory you were wearing (0 = none)
                let touchedAcc = false;
                const ownsHat = (id) => !(ctx.store && ctx.store.ownsHat) || ctx.store.ownsHat(id);
                const ownsAcc = (id) => !(ctx.store && ctx.store.ownsTail) || ctx.store.ownsTail(id);
                const equipCombo = (hatId, accId) => {
                    if (hatId && ownsHat(hatId)) ctx.setHat(hatId);                 // a slot's hat (0 = leave as is)
                    if (accId && ctx.setTail && ownsAcc(accId)) { ctx.setTail(accId); touchedAcc = true; }  // + its accessory
                };
                const aimDir = () => {
                    const fb = (ctx.input && ctx.input.aimAngle) ? ctx.input.aimAngle() : (self().dir || 0);
                    if (cfg.autoAim && ctx.nearestEnemy) { const en = ctx.nearestEnemy(); if (en) return ctx.angleTo(self(), en); }
                    return fb;
                };
                const fire = (weaponId, hatId, accId) => {
                    if (!self() || !self().alive) return false;
                    equipCombo(hatId, accId);                          // c (equip hat + accessory)
                    if (weaponId != null) MooMoo.send.selectItem(weaponId, true);   // z (weapon)
                    MooMoo.send.mouse(true, aimDir());                 // F down -> queues one swing, sets aim
                    return true;
                };
                const finish = () => {
                    MooMoo.send.mouse(false);
                    if (cfg.switchBack && primary != null && self() && self().alive) MooMoo.send.selectItem(primary, true);
                    ctx.setHat(prevHat);                               // back to the hat you had on
                    if (touchedAcc && ctx.setTail) ctx.setTail(prevAcc);  // and the accessory you had (0 = none)
                    instaBusy = false;
                };
                const END_HOLD = 160;                                  // hold briefly so the secondary shot goes out
                const secondAndEnd = () => {
                    if (!self() || !self().alive) { finish(); return; }
                    fire(secondary != null ? secondary : primary, cfg.secondaryHat, cfg.secondaryAcc);
                    ctx.after(END_HOLD, finish);
                };
                if (!fire(primary, cfg.primaryHat, cfg.primaryAcc)) { instaBusy = false; return; }
                if (cfg.mode === "packet") waitForOwnSwing(secondAndEnd, 350);
                else ctx.after(Math.max(40, cfg.swapDelay | 0), secondAndEnd);
            }

            // ---- the one key listener (capture, so it beats the client's own keys) ----
            // It only ever acts on keys YOU bound here; everything else passes straight
            // through to the game, so movement / attacking are untouched.
            const held = new Set();
            function onKeyDown(e) {
                if (e.isTrusted === false) return;
                // while binding, capture ANY key (doGrab decides: Esc clears, modifiers wait)
                if (grab) { e.preventDefault(); e.stopImmediatePropagation(); doGrab(e); return; }
                // Escape closes the hat picker
                if (e.key === "Escape" && doc) { const pk = doc.querySelector(".mml-pick"); if (pk) { e.preventDefault(); e.stopImmediatePropagation(); pk.remove(); return; } }
                if (typing() || e.ctrlKey || e.metaKey || e.altKey) return;
                const id = keyId(e);
                if (same(id, prefs.menuKey)) { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) toggleMenu(); return; }
                if (same(id, prefs.insta.key)) { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) runInsta(); return; }
                for (const s of SPAMMERS) {
                    const cfg = prefs.spammers[s.id];
                    if (cfg.on && same(id, cfg.key)) { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat && !held.has(s.id)) { held.add(s.id); startSpam(s); } return; }
                }
                for (const h of prefs.hats) {
                    if (h.key && same(id, h.key)) { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) hatKey(h); return; }
                }
            }
            function onKeyUp(e) {
                const id = keyId(e);
                for (const s of SPAMMERS) if (same(id, prefs.spammers[s.id].key)) { held.delete(s.id); stopSpam(s.id); }
            }
            if (doc) {
                win.addEventListener("keydown", onKeyDown, true);
                win.addEventListener("keyup", onKeyUp, true);
                win.addEventListener("blur", () => { for (const s of SPAMMERS) { held.delete(s.id); stopSpam(s.id); } });
                ctx.onCleanup(() => { win.removeEventListener("keydown", onKeyDown, true); win.removeEventListener("keyup", onKeyUp, true); });
            }

            // =================================================================
            // MENU — a dark, moomoo-styled client panel (sidebar + module cards).
            // =================================================================
            const FONT = '"Hammersmith One", sans-serif';
            const SANS = 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
            const CSS = `
            .mml-gui{position:fixed;inset:0;z-index:99990;display:none;background:rgba(9,11,16,.5);font-family:${FONT};-webkit-user-select:none;user-select:none;
              --acc:#8ecc51;--side:#13151b;--panel:#1b1e26;--ctrl:#ffffff12;--track:#ffffff1c;--text:#eceef2;--sub:#aab0bd;--muted:#6f7684;--border:#2a2e38}
            .mml-gui.open{display:block}
            .mml-panel{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);display:flex;width:720px;max-width:94vw;height:522px;max-height:88vh;background:var(--panel);border-radius:16px;overflow:hidden;color:var(--text);box-shadow:0 22px 64px rgba(0,0,0,.55);font-size:14px}
            .mml-panel .side{flex:0 0 178px;background:var(--side);display:flex;flex-direction:column;padding:14px 10px}
            .mml-panel .brand{display:flex;align-items:center;gap:9px;padding:6px 8px 15px}
            .mml-panel .logo{width:27px;height:27px;border-radius:8px;background:var(--acc);color:#153318;display:flex;align-items:center;justify-content:center;font-size:12px}
            .mml-panel .bname{font-size:15px;color:var(--text)}
            .mml-panel .nav{flex:1 1 auto;display:flex;flex-direction:column;gap:3px;overflow-y:auto}
            .mml-panel .navitem{display:flex;align-items:center;gap:11px;padding:10px 11px;border-radius:9px;color:var(--sub);cursor:pointer;transition:background .12s,color .12s}
            .mml-panel .navitem:hover{background:#1d2029;color:var(--text)}
            .mml-panel .navitem.active{background:#242834;color:var(--text)}
            .mml-panel .navitem.active .ico{color:var(--acc)}
            .mml-panel .ico{display:inline-flex;width:18px;height:18px;color:var(--muted);flex:0 0 auto}
            .mml-panel .ico svg{width:18px;height:18px;display:block}
            .mml-panel .ntxt{font-size:14px}
            .mml-panel .user{display:flex;align-items:center;gap:9px;padding:11px 7px 2px;margin-top:8px;border-top:1px solid var(--border)}
            .mml-panel .uava{width:29px;height:29px;border-radius:50%;background:linear-gradient(135deg,var(--acc),#5f933a);flex:0 0 auto}
            .mml-panel .uinfo{display:flex;flex-direction:column;min-width:0}
            .mml-panel .uname{font-size:13px;color:var(--text)}
            .mml-panel .uver{font-size:11px;color:var(--muted);font-family:${SANS}}
            .mml-panel .body{flex:1 1 auto;display:flex;flex-direction:column;min-width:0}
            .mml-panel .head{display:flex;align-items:center;justify-content:space-between;padding:13px 18px;border-bottom:1px solid var(--border)}
            .mml-panel .htitle{font-size:17px;color:var(--text)}
            .mml-panel .close{color:var(--muted);cursor:pointer;font-size:15px;padding:5px 9px;border-radius:8px}
            .mml-panel .close:hover{color:var(--text);background:#242834}
            /* content: no boxes, no outlines, no scrollbar. modules are plain blocks
               grouped by a quiet title — settings sit directly on the panel. */
            .mml-panel .content{flex:1 1 auto;overflow-y:auto;overflow-x:hidden;scrollbar-width:none;padding:6px 18px 14px}
            .mml-panel .content::-webkit-scrollbar{width:0;height:0}
            .mml-panel .modgrid{display:grid;grid-template-columns:1fr 1fr;gap:4px 22px;align-items:start}
            .mml-panel .mod{padding:7px 0 2px;min-width:0}
            .mml-panel .mod.wide{grid-column:1/-1}
            .mml-panel .modhead{display:flex;align-items:center;justify-content:space-between;min-height:24px}
            .mml-panel .modtitle{font-size:11px;letter-spacing:.5px;text-transform:uppercase;color:var(--muted)}
            .mml-panel .modbody{padding:1px 0 0}
            .mml-panel .row{display:flex;align-items:center;gap:10px;min-height:25px}
            .mml-panel .rl{font-size:13px;color:var(--sub);font-family:${SANS}}
            .mml-panel .row:not(.srow) .rl{flex:1 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            .mml-panel .srow .rl{flex:0 0 72px}
            .mml-panel .sw{flex:0 0 auto;width:32px;height:18px;border-radius:9px;background:var(--track);position:relative;cursor:pointer;transition:background .16s}
            .mml-panel .sw.on{background:var(--acc)}
            .mml-panel .sw::after{content:"";position:absolute;top:2.5px;left:2.5px;width:13px;height:13px;border-radius:50%;background:#fff;transition:left .16s}
            .mml-panel .sw.on::after{left:16.5px}
            .mml-panel .rng{-webkit-appearance:none;flex:1 1 auto;min-width:40px;height:4px;border-radius:2px;background:var(--track);outline:none;cursor:pointer}
            .mml-panel .rng::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;border-radius:50%;background:#fff;cursor:pointer}
            .mml-panel .rng::-moz-range-thumb{width:13px;height:13px;border:none;border-radius:50%;background:#fff;cursor:pointer}
            .mml-panel .rngval{flex:0 0 auto;min-width:40px;text-align:right;font-size:12px;color:var(--text);font-family:${SANS}}
            .mml-panel .kb{flex:0 0 auto;min-width:28px;text-align:center;padding:3px 9px;border-radius:5px;background:var(--ctrl);color:var(--sub);font-size:12px;cursor:pointer;font-family:${SANS}}
            .mml-panel .kb:hover{color:var(--text)}
            .mml-panel .kb.grab{color:var(--acc)}
            .mml-panel .txt{flex:0 1 auto;width:88px;min-width:0;padding:3px 8px;border-radius:5px;background:var(--ctrl);border:none;color:var(--text);font-family:${SANS};font-size:12px;text-align:center;outline:none}
            .mml-panel .selwrap{position:relative;flex:0 0 auto}
            .mml-panel .sel{appearance:none;-webkit-appearance:none;padding:3px 24px 3px 9px;border-radius:5px;background:var(--ctrl);border:none;color:var(--text);font-family:${SANS};font-size:12px;cursor:pointer;outline:none}
            .mml-panel .sel option{background:#23262f;color:var(--text)}
            .mml-panel .selwrap::after{content:"";position:absolute;right:9px;top:45%;width:6px;height:6px;border-right:2px solid var(--sub);border-bottom:2px solid var(--sub);transform:translateY(-50%) rotate(45deg);pointer-events:none}
            .mml-panel .hatrow{display:flex;flex-wrap:wrap;gap:8px;padding:3px 0 2px}
            .mml-panel .hatcell{display:flex;flex-direction:column;align-items:center;gap:3px}
            .mml-panel .accpair{display:flex;gap:5px}
            .mml-panel .hatbox{width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:6px;background:var(--ctrl);cursor:pointer}
            .mml-panel .hatbox img{width:30px;height:30px;object-fit:contain}
            .mml-panel .hatph{color:var(--muted);font-size:16px}
            .mml-panel .hatcap{font-size:11px;color:var(--muted);font-family:${SANS}}
            .mml-panel .btn{margin-top:6px;text-align:center;padding:5px;border-radius:6px;background:var(--ctrl);color:var(--sub);cursor:pointer;font-size:12.5px;font-family:${SANS}}
            .mml-panel .btn:hover{color:var(--text)}
            .mml-pick{position:fixed;inset:0;z-index:99992;display:flex;align-items:center;justify-content:center;background:rgba(9,11,16,.62);font-family:${FONT}}
            .mml-pick .pickpanel{width:420px;max-width:92vw;max-height:70vh;overflow-y:auto;scrollbar-width:none;padding:14px;border-radius:12px;background:#1b1e26;box-shadow:0 22px 64px rgba(0,0,0,.6);color:#eceef2}
            .mml-pick .pickpanel::-webkit-scrollbar{width:0}
            .mml-pick .picktitle{text-align:center;font-size:16px;margin-bottom:11px}
            .mml-pick .pickgrid{display:flex;flex-wrap:wrap;gap:7px;justify-content:center}
            .mml-pick .ptile{box-sizing:border-box;width:60px;height:68px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:4px;border-radius:8px;background:#ffffff10;border:2px solid transparent;cursor:pointer}
            .mml-pick .ptile:hover{background:#ffffff1f}
            .mml-pick .ptile.sel{border-color:#8ecc51}
            .mml-pick .ptile img{width:40px;height:40px;object-fit:contain}
            .mml-pick .pcap{font-size:10px;color:#9aa0aa;max-width:54px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:${SANS}}
            .mml-pick .pnone{font-size:12px;color:#6f7684}
            `;
            let gui = null, built = false, open = false, grab = null, grabEl = null;
            let activeCat = "placement", headTitle = null, contentEl = null;

            function mk(tag, cls, text) { const n = doc.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
            function svgEl(markup) { const s = mk("span", "ico"); s.innerHTML = markup; return s; }

            // ---- components ----
            function toggleSwitch(get, set) {
                const sw = mk("div", "sw");
                const paint = () => sw.classList.toggle("on", !!get());
                sw.addEventListener("click", (e) => { e.stopPropagation(); set(!get()); save(); paint(); });
                paint(); return sw;
            }
            function bindBtn(get, set) {
                const b = mk("div", "kb");
                const paint = () => { if (grabEl !== b) { b.classList.remove("grab"); b.textContent = keyLabel(get()); } };
                b.addEventListener("click", () => { b.classList.add("grab"); b.textContent = "…"; grab = (id) => { set(id); save(); paint(); }; grabEl = b; });
                paint(); b._paint = paint; return b;
            }
            function smoothSlider(min, max, step, get, set, fmt) {
                const r = mk("input", "rng"); r.type = "range"; r.min = min; r.max = max; r.step = step; r.value = get();
                const val = mk("span", "rngval");
                const paint = () => {
                    const p = max > min ? ((+r.value - min) / (max - min)) * 100 : 0;
                    r.style.background = "linear-gradient(to right, var(--acc) " + p + "%, var(--track) " + p + "%)";
                    val.textContent = (fmt || String)(+r.value);
                };
                r.addEventListener("input", paint);
                r.addEventListener("change", () => { set(+r.value); save(); });
                paint();
                return { input: r, val };
            }
            function textInput(get, set, cls) {
                const i = mk("input", "txt" + (cls ? " " + cls : "")); i.type = "text"; i.value = get();
                i.addEventListener("change", () => { set(i.value.trim()); save(); });
                i.addEventListener("keydown", (e) => { e.stopPropagation(); if (e.key === "Enter") i.blur(); });
                return i;
            }
            function selectBox(options, get, set) {
                const wrap = mk("div", "selwrap");
                const sel = mk("select", "sel");
                for (const o of options) { const op = mk("option"); op.value = o.value; op.textContent = o.label; sel.appendChild(op); }
                sel.value = get();
                sel.addEventListener("change", () => { set(sel.value); save(); });
                sel.addEventListener("keydown", (e) => e.stopPropagation());
                wrap.appendChild(sel); return wrap;
            }
            // a slot renders a hat (kind omitted) or an accessory (kind === "acc")
            const slotImg = (kind, id) => kind === "acc" ? accImg(id) : hatImg(id);
            const slotName = (kind, id) => kind === "acc" ? accName(id) : hatName(id);
            const slotList = (kind) => (kind === "acc" ? data.accessories : data.hats) || [];
            function hatSlot(get, set, kind) {
                const box = mk("div", "hatbox");
                const paint = () => {
                    box.textContent = "";
                    const id = get();
                    if (id) { const img = mk("img"); img.src = slotImg(kind, id); img.alt = slotName(kind, id); img.onerror = () => { img.replaceWith(mk("div", "hatph", "—")); }; box.appendChild(img); }
                    else box.appendChild(mk("div", "hatph", "+"));
                    box.title = slotName(kind, id);
                };
                box.addEventListener("click", () => openHatPicker(get(), (id) => { set(id); save(); paint(); }, kind));
                paint(); return box;
            }
            function openHatPicker(cur, onPick, kind) {
                if (!gui) return;
                const old = gui.querySelector(".mml-pick"); if (old) old.remove();
                const pick = mk("div", "mml-pick");
                const panel = mk("div", "pickpanel");
                panel.appendChild(mk("div", "picktitle", kind === "acc" ? "Choose an accessory" : "Choose a hat"));
                const grid = mk("div", "pickgrid");
                const close = () => pick.remove();
                const list = [{ id: 0, name: "None" }].concat(slotList(kind));
                for (const h of list) {
                    const t = mk("div", "ptile" + (h.id === cur ? " sel" : ""));
                    if (h.id) { const img = mk("img"); img.src = slotImg(kind, h.id); img.alt = h.name; img.onerror = () => { img.style.visibility = "hidden"; }; t.appendChild(img); }
                    else t.appendChild(mk("div", "pnone", "none"));
                    t.appendChild(mk("div", "pcap", h.name));
                    t.title = h.name + (h.desc ? " — " + h.desc : "");
                    t.addEventListener("click", (e) => { e.stopPropagation(); onPick(h.id); close(); });
                    grid.appendChild(t);
                }
                panel.appendChild(grid);
                pick.appendChild(panel);
                pick.addEventListener("mousedown", (e) => { e.stopPropagation(); if (e.target === pick) close(); });
                gui.appendChild(pick);
            }
            function doGrab(e) {
                const done = grab; grab = null; const el = grabEl; grabEl = null;
                if (/^(Shift|Control|Alt|Meta|CapsLock|OS)$/.test(e.key)) { grab = done; grabEl = el; return; }
                if (e.key === "Escape") { done(""); return; }
                done(keyId(e));
            }

            // ---- rows + module card ----
            function row(label, control) { const r = mk("div", "row"); r.appendChild(mk("span", "rl", label)); r.appendChild(control); return r; }
            function sliderRow(label, min, max, step, get, set, fmt) {
                const r = mk("div", "row srow"); r.appendChild(mk("span", "rl", label));
                const s = smoothSlider(min, max, step, get, set, fmt); r.appendChild(s.input); r.appendChild(s.val); return r;
            }
            function modCard(title, master, wide) {
                const card = mk("div", "mod" + (wide ? " wide" : ""));
                const head = mk("div", "modhead"); head.appendChild(mk("span", "modtitle", title));
                if (master) head.appendChild(toggleSwitch(master.get, master.set));
                card.appendChild(head);
                const body = mk("div", "modbody"); card.appendChild(body);
                return { card, body };
            }

            // ---- icons / modules / categories ----
            const ICON = {
                grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.6"/><rect x="14" y="3" width="7" height="7" rx="1.6"/><rect x="3" y="14" width="7" height="7" rx="1.6"/><rect x="14" y="14" width="7" height="7" rx="1.6"/></svg>',
                combat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="7.5"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>',
                hat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17h18"/><path d="M5.5 17c0-5.2 2.6-9 6.5-9s6.5 3.8 6.5 9"/></svg>',
                gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/></svg>'
            };
            const MODULES = {};
            for (const s of SPAMMERS) {
                const sid = s.id;
                MODULES["spam_" + sid] = () => {
                    const cfg = prefs.spammers[sid];
                    const m = modCard(s.label, { get: () => cfg.on, set: (v) => { cfg.on = v; } });
                    m.body.appendChild(row("Key", bindBtn(() => cfg.key, (id) => { cfg.key = id; })));
                    m.body.appendChild(row("Item", textInput(() => cfg.item, (v) => { cfg.item = v || s.item; })));
                    m.body.appendChild(sliderRow("Speed", 40, 500, 10, () => cfg.speed, (x) => { cfg.speed = x; }, (n) => n + "ms"));
                    return m.card;
                };
            }
            MODULES.humanize = () => {
                const h = prefs.humanize;
                const m = modCard("Humanize", { get: () => h.on, set: (v) => { h.on = v; } });
                m.body.appendChild(sliderRow("Jitter", 0, 60, 1, () => h.jitter, (x) => { h.jitter = x; }, (n) => "±" + n + "%"));
                m.body.appendChild(sliderRow("Pause %", 0, 25, 1, () => h.pauseChance, (x) => { h.pauseChance = x; }, (n) => n + "%"));
                m.body.appendChild(sliderRow("Pause ms", 0, 600, 10, () => h.pauseMax, (x) => { h.pauseMax = x; }, (n) => n + "ms"));
                return m.card;
            };
            MODULES.insta = () => {
                const ik = prefs.insta;
                const m = modCard("Instakill", null);
                m.body.appendChild(row("Key", bindBtn(() => ik.key, (id) => { if (id) ik.key = id; })));
                m.body.appendChild(row("Mode", selectBox([{ value: "packet", label: "Confirmed" }, { value: "timed", label: "Timed" }], () => ik.mode, (v) => { ik.mode = v; })));
                m.body.appendChild(row("Auto aim", toggleSwitch(() => ik.autoAim, (v) => { ik.autoAim = v; })));
                m.body.appendChild(row("Switch back", toggleSwitch(() => ik.switchBack, (v) => { ik.switchBack = v; })));
                m.body.appendChild(sliderRow("Swap ms", 40, 300, 10, () => ik.swapDelay, (x) => { ik.swapDelay = x; }, (n) => n + "ms"));
                const hats = mk("div", "hatrow");
                const cell = (label, getH, setH, getA, setA) => {
                    const c = mk("div", "hatcell");
                    const pair = mk("div", "accpair");
                    pair.appendChild(hatSlot(getH, setH));            // hat
                    pair.appendChild(hatSlot(getA, setA, "acc"));     // accessory
                    c.appendChild(pair);
                    c.appendChild(mk("span", "hatcap", label));
                    return c;
                };
                hats.appendChild(cell("Primary", () => ik.primaryHat, (id) => { ik.primaryHat = id; }, () => ik.primaryAcc, (id) => { ik.primaryAcc = id; }));
                hats.appendChild(cell("Secondary", () => ik.secondaryHat, (id) => { ik.secondaryHat = id; }, () => ik.secondaryAcc, (id) => { ik.secondaryAcc = id; }));
                m.body.appendChild(hats);
                return m.card;
            };
            MODULES.heal = () => {
                const h = prefs.heal;
                const m = modCard("Auto heal", { get: () => h.on, set: (v) => { h.on = v; } });
                m.body.appendChild(row("Legit mode", toggleSwitch(() => h.legit, (v) => { h.legit = v; })));
                m.body.appendChild(row("Shame-safe", toggleSwitch(() => h.shameSafe, (v) => { h.shameSafe = v; })));
                m.body.appendChild(sliderRow("Below", 1, 99, 1, () => h.healAt, (x) => { h.healAt = x; }, (n) => n + "%"));
                m.body.appendChild(sliderRow("In hand", 0, 300, 10, () => h.showInHand, (x) => { h.showInHand = x; }, (n) => n + "ms"));
                m.body.appendChild(sliderRow("Jitter", 0, 200, 10, () => h.jitter, (x) => { h.jitter = x; }, (n) => n + "ms"));
                m.body.appendChild(sliderRow("Max/s", 1, 12, 1, () => h.maxPerSec, (x) => { h.maxPerSec = x; }, null));
                return m.card;
            };
            MODULES.hats = () => {
                const m = modCard("Hat keys", null, true);
                const grid = mk("div", "hatrow");
                prefs.hats.forEach((h) => {
                    const c = mk("div", "hatcell");
                    c.appendChild(hatSlot(() => h.id, (id) => { h.id = id; }));
                    c.appendChild(bindBtn(() => h.key, (id) => { h.key = id; }));
                    grid.appendChild(c);
                });
                m.body.appendChild(grid);
                return m.card;
            };
            MODULES.general = () => {
                const m = modCard("General", null, true);
                m.body.appendChild(row("Menu key", bindBtn(() => prefs.menuKey, (id) => { if (id) prefs.menuKey = id; })));
                const reset = mk("div", "btn", "Reset to defaults");
                reset.addEventListener("click", () => {
                    if (win.confirm && !win.confirm("Reset all MooMoo Lite settings?")) return;
                    const d = JSON.parse(JSON.stringify(DEFAULTS));
                    for (const k of Object.keys(prefs)) delete prefs[k];
                    Object.assign(prefs, d);
                    save();
                    renderContent(contentEl);
                });
                m.body.appendChild(reset);
                return m.card;
            };
            const CATEGORIES = [
                { id: "placement", label: "Placement", icon: ICON.grid, mods: SPAMMERS.map((s) => "spam_" + s.id).concat(["humanize"]) },
                { id: "combat", label: "Combat", icon: ICON.combat, mods: ["insta", "heal"] },
                { id: "hats", label: "Hats", icon: ICON.hat, mods: ["hats"] },
                { id: "config", label: "Config", icon: ICON.gear, mods: ["general"] }
            ];

            function renderContent(content) {
                if (!content) return;
                content.textContent = "";
                const cat = CATEGORIES.find((c) => c.id === activeCat) || CATEGORIES[0];
                if (headTitle) headTitle.textContent = cat.label;
                const grid = mk("div", "modgrid");
                for (const id of cat.mods) { const b = MODULES[id]; if (b) grid.appendChild(b()); }
                content.appendChild(grid);
            }

            function buildCard() {
                const panel = mk("div", "mml-panel");
                const side = mk("div", "side");
                const brand = mk("div", "brand");
                brand.appendChild(mk("span", "logo", "ML"));
                brand.appendChild(mk("span", "bname", "MooMoo Lite"));
                side.appendChild(brand);
                const nav = mk("div", "nav");
                const navItems = {};
                for (const c of CATEGORIES) {
                    const it = mk("div", "navitem" + (c.id === activeCat ? " active" : ""));
                    it.appendChild(svgEl(c.icon));
                    it.appendChild(mk("span", "ntxt", c.label));
                    it.addEventListener("click", () => {
                        activeCat = c.id;
                        for (const k in navItems) navItems[k].classList.toggle("active", k === c.id);
                        renderContent(contentEl);
                    });
                    navItems[c.id] = it; nav.appendChild(it);
                }
                side.appendChild(nav);
                const user = mk("div", "user");
                user.appendChild(mk("span", "uava"));
                const ui = mk("div", "uinfo");
                ui.appendChild(mk("span", "uname", "MooMoo Lite"));
                ui.appendChild(mk("span", "uver", "menu · " + keyLabel(prefs.menuKey)));
                user.appendChild(ui);
                side.appendChild(user);
                panel.appendChild(side);
                const body = mk("div", "body");
                const head = mk("div", "head");
                headTitle = mk("span", "htitle", "Placement");
                head.appendChild(headTitle);
                const close = mk("div", "close", "✕"); close.addEventListener("click", closeMenu);
                head.appendChild(close);
                body.appendChild(head);
                contentEl = mk("div", "content");
                body.appendChild(contentEl);
                panel.appendChild(body);
                renderContent(contentEl);
                return panel;
            }

            function build() {
                if (built || !doc || !doc.body || !doc.head) return built;
                const style = mk("style"); style.textContent = CSS; doc.head.appendChild(style);
                gui = mk("div", "mml-gui");
                gui.appendChild(buildCard());
                gui.addEventListener("mousedown", (e) => { if (e.target === gui) closeMenu(); });   // click backdrop closes
                doc.body.appendChild(gui);
                built = true;
                ctx.onCleanup(() => { style.remove(); gui.remove(); built = false; open = false; });
                return true;
            }
            function openMenu() { if (!build()) return; open = true; gui.classList.add("open"); }
            function closeMenu() { if (gui) { open = false; gui.classList.remove("open"); grab = null; grabEl = null; } }
            function toggleMenu() { open ? closeMenu() : openMenu(); }
            if (doc) (function wait() { if (!built) { build() || win.setTimeout(wait, 100); } })();

            ctx.log("MooMoo Lite ready — press " + keyLabel(prefs.menuKey) + " for the menu");
        });
    }

    // Fetch the loader's API through its event handshake — there is no window.MooMoo.
    const w = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
    function connect() {
        let mm = null, ld = null;
        try { w.dispatchEvent(new CustomEvent("moomoo.js:api", { detail: { resolve: (m, l) => { mm = m; ld = l; } } })); } catch (e) {}
        if (mm) { boot(mm, ld); return true; }
        return false;
    }
    if (connect()) return;
    let tries = 0;
    const iv = setInterval(() => { if (connect() || ++tries > 200) clearInterval(iv); }, 50);
    if (w.addEventListener) w.addEventListener("moomoo.js:ready", () => { if (connect()) clearInterval(iv); });
})();
