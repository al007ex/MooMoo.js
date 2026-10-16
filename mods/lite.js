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
                insta: { key: "r", mode: "packet", swapDelay: 100, switchBack: true, autoAim: true, primaryHat: 7, secondaryHat: 53 },
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
                const equipCombo = (id) => {
                    if (!id) return;
                    if (ctx.store && ctx.store.ownsHat && !ctx.store.ownsHat(id)) return;  // skip hats you don't own (the server would ignore them)
                    ctx.setHat(id);
                };
                const aimDir = () => {
                    const fb = (ctx.input && ctx.input.aimAngle) ? ctx.input.aimAngle() : (self().dir || 0);
                    if (cfg.autoAim && ctx.nearestEnemy) { const en = ctx.nearestEnemy(); if (en) return ctx.angleTo(self(), en); }
                    return fb;
                };
                const fire = (weaponId, hatId) => {
                    if (!self() || !self().alive) return false;
                    equipCombo(hatId);                                 // c (equip)
                    if (weaponId != null) MooMoo.send.selectItem(weaponId, true);   // z (weapon)
                    MooMoo.send.mouse(true, aimDir());                 // F down -> queues one swing, sets aim
                    return true;
                };
                const finish = () => {
                    MooMoo.send.mouse(false);
                    if (cfg.switchBack && primary != null && self() && self().alive) MooMoo.send.selectItem(primary, true);
                    ctx.setHat(prevHat);                               // back to the hat you had on
                    instaBusy = false;
                };
                const END_HOLD = 160;                                  // hold briefly so the secondary shot goes out
                const secondAndEnd = () => {
                    if (!self() || !self().alive) { finish(); return; }
                    fire(secondary != null ? secondary : primary, cfg.secondaryHat);
                    ctx.after(END_HOLD, finish);
                };
                if (!fire(primary, cfg.primaryHat)) { instaBusy = false; return; }
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
                if (e.key === "Escape" && doc && doc.getElementById("mml-pick")) { e.preventDefault(); e.stopImmediatePropagation(); doc.getElementById("mml-pick").remove(); return; }
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
            // MENU — one moomoo-styled card you open with the menu key.
            // =================================================================
            const FONT = '"Hammersmith One", sans-serif';
            const CSS = `
            #mml-gui{position:fixed;inset:0;z-index:99990;display:none;background:rgba(0,0,0,.18);font-family:${FONT};-webkit-user-select:none;user-select:none}
            #mml-gui.open{display:block}
            #mml-card{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:400px;max-height:86vh;overflow-y:auto;padding:12px 20px 18px;border-radius:4px;background:#fff;color:#4A4A4A;box-shadow:0 5px 8px 0 rgba(0,0,0,.2),0 7px 20px 0 rgba(0,0,0,.17)}
            #mml-card::-webkit-scrollbar{width:9px}
            #mml-card::-webkit-scrollbar-thumb{background:#d4d4d4;border-radius:5px}
            #mml-card .closeit{float:right;font-size:24px;line-height:1;color:#FF1100;cursor:pointer;margin-top:2px}
            #mml-card .closeit:hover,#mml-card .closeit:focus{color:#9e0c02}
            #mml-title{font-size:30px;text-align:center;color:#4A4A4A;margin:4px 0 2px;font-weight:normal}
            #mml-card hr{border:none;border-top:1px solid #ededed;margin:12px 0 10px}
            #mml-card .sect{font-size:17px;color:#4A4A4A;text-align:center;margin:0 0 6px;opacity:.92}
            #mml-card .ctl{display:flex;align-items:center;gap:11px;margin:7px 0;min-height:28px}
            #mml-card .lbl{flex:1 1 auto;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:18px;color:#4A4A4A}
            #mml-card .sub{display:flex;align-items:center;gap:9px;margin:2px 0 9px 36px}
            #mml-card .sub .tag{flex:0 0 auto;font-size:15px;color:#9a9a9a}
            #mml-card .hint{font-size:12.5px;color:#b2b2b2;line-height:1.55;text-align:center;padding:3px 4px 2px}
            #mml-card .foot{margin-top:14px;text-align:center;font-size:13px;color:#bdbdbd}
            /* retro checkbox (CloudyMod .container/.checkmark) */
            #mml-card .chk{flex:0 0 auto;position:relative;box-sizing:border-box;width:25px;height:25px;background:#eee;border-radius:3px;cursor:pointer}
            #mml-card .chk:hover{background:#ccc}
            #mml-card .chk.on{background:#000}
            #mml-card .chk.on::after{content:"";position:absolute;left:9px;top:4px;width:5px;height:10px;border:solid #fff;border-width:0 3px 3px 0;transform:rotate(45deg)}
            /* key-bind box (CloudyMod keyPressLow) */
            #mml-card .kb{flex:0 0 auto;box-sizing:border-box;min-width:52px;height:28px;padding:3px 9px;text-align:center;font-size:16px;color:#4A4A4A;background:#fcfcfc;border:.5px solid #f2f2f2;border-radius:3.5px;cursor:pointer}
            #mml-card .kb:hover{background:#f3f3f3}
            #mml-card .kb.grab{color:#5aa844;background:#eaf6e2;border-color:#cfe9c0}
            /* item text box */
            #mml-card input.txt{flex:0 0 auto;box-sizing:border-box;width:118px;height:28px;padding:2px 7px;text-align:center;font-family:inherit;font-size:15px;color:#4A4A4A;background:#fcfcfc;border:.5px solid #f2f2f2;border-radius:3.5px;outline:none}
            #mml-card input.txt:focus{border-color:#8ed265}
            /* slider (CloudyMod healSlider) */
            #mml-card input[type=range]{-webkit-appearance:none;flex:1 1 auto;min-width:0;height:10px;margin:0;border-radius:5px;background:#dddddd;outline:none;cursor:pointer}
            #mml-card input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:11px;background:rgb(142,210,101);box-shadow:0 1px 2px rgba(0,0,0,.25);cursor:pointer}
            #mml-card input[type=range]::-moz-range-thumb{width:22px;height:22px;border:none;border-radius:11px;background:rgb(142,210,101);cursor:pointer}
            /* green value pill (CloudyMod numfocus) */
            #mml-card .pill{flex:0 0 auto;box-sizing:border-box;min-width:56px;text-align:center;font-size:14px;color:#75d679;background:#fff;border:1.5px solid #75d679;border-radius:16px;padding:3px 10px}
            /* hat select boxes (CloudyMod selectObj) */
            #mml-hats{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:4px 0 2px}
            #mml-card .hatslot{display:flex;flex-direction:column;align-items:center;gap:6px}
            #mml-card .selectObj{display:flex;align-items:center;justify-content:center;width:74px;height:74px;background:#fcfcfc;border-radius:10px;cursor:pointer;box-shadow:0 2px 5px 0 rgba(0,0,0,.08),0 2px 10px 0 rgba(0,0,0,.06)}
            #mml-card .selectObj:hover{background:#f6f6f6}
            #mml-card .selectObj img{width:58px;height:58px;object-fit:contain}
            #mml-card .selectObj .ph{font-size:12px;color:#bdbdbd}
            /* hat picker (CloudyMod selectObjAlert tiles + chosenhat highlight) */
            #mml-pick{position:fixed;inset:0;z-index:99992;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.24);font-family:${FONT}}
            #mml-pick .panel{width:472px;max-width:92vw;max-height:74vh;overflow-y:auto;padding:16px;border-radius:6px;background:#fff;box-shadow:0 5px 8px 0 rgba(0,0,0,.2),0 7px 20px 0 rgba(0,0,0,.17);display:flex;flex-wrap:wrap;gap:8px;align-content:flex-start;justify-content:center}
            #mml-pick .ptitle{width:100%;text-align:center;font-size:20px;color:#4A4A4A;margin:0 0 4px}
            #mml-pick .tile{box-sizing:border-box;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;width:76px;height:84px;padding:4px;border:2px solid transparent;border-radius:10px;background:#fcfcfc;box-shadow:0 2px 5px 0 rgba(0,0,0,.08);cursor:pointer}
            #mml-pick .tile:hover{background:#f3f3f3}
            #mml-pick .tile.sel{border-color:#7daaf2}
            #mml-pick .tile img{width:52px;height:52px;object-fit:contain}
            #mml-pick .tile .cap{max-width:70px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:10px;color:#888}
            #mml-pick .tile .none{font-size:13px;color:#aaa}
            `;
            let gui = null, built = false, open = false, grab = null, grabEl = null;

            function mk(tag, cls, text) { const n = doc.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
            function toggle(get, set) {
                const b = mk("div", "chk");
                const paint = () => b.classList.toggle("on", !!get());
                b.addEventListener("click", (e) => { e.stopPropagation(); set(!get()); save(); paint(); });
                paint(); return b;
            }
            function bindBtn(get, set) {
                const b = mk("div", "kb");
                const paint = () => { if (grabEl !== b) { b.classList.remove("grab"); b.textContent = keyLabel(get()); } };
                b.addEventListener("click", () => { b.classList.add("grab"); b.textContent = "press…"; grab = (id) => { set(id); save(); paint(); }; grabEl = b; });
                paint(); b._paint = paint; return b;
            }
            function slider(min, max, step, get, set, fmt) {
                const r = mk("input"); r.type = "range"; r.min = min; r.max = max; r.step = step; r.value = get();
                const v = mk("span", "pill", (fmt || String)(get()));
                r.addEventListener("input", () => { v.textContent = (fmt || String)(+r.value); });
                r.addEventListener("change", () => { set(+r.value); save(); });
                return [r, v];
            }
            function textInput(get, set, cls) {
                const i = mk("input"); i.type = "text"; i.className = cls || "txt"; i.value = get();
                i.addEventListener("change", () => { set(i.value.trim()); save(); });
                i.addEventListener("keydown", (e) => { e.stopPropagation(); if (e.key === "Enter") i.blur(); });
                return i;
            }

            // a hat slot: a CloudyMod-style select box showing the hat; click opens the picker
            function hatSlot(get, set) {
                const box = mk("div", "selectObj");
                const paint = () => {
                    box.textContent = "";
                    const id = get();
                    if (id) { const img = mk("img"); img.src = hatImg(id); img.alt = hatName(id); img.onerror = () => { img.replaceWith(mk("div", "ph", "\u2014")); }; box.appendChild(img); }
                    else box.appendChild(mk("div", "ph", "none"));
                    box.title = hatName(id);
                };
                box.addEventListener("click", () => openHatPicker(get(), (id) => { set(id); save(); paint(); }));
                paint(); return box;
            }
            // the picker: a grid of hat icons (None + every hat) to choose from
            function openHatPicker(cur, onPick) {
                if (!gui) return;
                const old = doc.getElementById("mml-pick"); if (old) old.remove();
                const pick = mk("div"); pick.id = "mml-pick";
                const panel = mk("div", "panel");
                panel.appendChild(mk("div", "ptitle", "Choose a hat"));
                const close = () => pick.remove();
                const list = [{ id: 0, name: "None" }].concat(data.hats || []);
                for (const h of list) {
                    const t = mk("div", "tile" + (h.id === cur ? " sel" : ""));
                    if (h.id) { const img = mk("img"); img.src = hatImg(h.id); img.alt = h.name; img.onerror = () => { img.style.visibility = "hidden"; }; t.appendChild(img); }
                    else t.appendChild(mk("div", "none", "none"));
                    t.appendChild(mk("div", "cap", h.name));
                    t.title = h.name + (h.desc ? " — " + h.desc : "");
                    t.addEventListener("click", (e) => { e.stopPropagation(); onPick(h.id); close(); });
                    panel.appendChild(t);
                }
                pick.appendChild(panel);
                pick.addEventListener("mousedown", (e) => { e.stopPropagation(); if (e.target === pick) close(); });
                gui.appendChild(pick);
            }

            function doGrab(e) {
                const done = grab; grab = null; const el = grabEl; grabEl = null;
                // a bare modifier isn't a standalone bind — keep waiting for a real key
                if (/^(Shift|Control|Alt|Meta|CapsLock|OS)$/.test(e.key)) { grab = done; grabEl = el; return; }
                if (e.key === "Escape") { done(""); return; }   // Esc clears / unbinds
                done(keyId(e));                                  // any other key binds (Backspace, Delete, Space, arrows, symbols, ...)
            }

            function buildCard() {
                const card = mk("div"); card.id = "mml-card";
                const x = mk("span", "closeit", "\u2715"); x.addEventListener("click", closeMenu); card.appendChild(x);
                const title = mk("h1", null, "MooMoo Lite"); title.id = "mml-title"; card.appendChild(title);

                // a ".ctl" row: retro checkbox + label
                const ctlToggle = (label, get, set) => {
                    const row = mk("div", "ctl");
                    row.appendChild(toggle(get, set));
                    row.appendChild(mk("span", "lbl", label));
                    return row;
                };
                // a ".sub" row: tag + green-thumb slider + green value pill
                const subSlider = (label, min, max, step, obj, key, fmt) => {
                    const sub = mk("div", "sub");
                    sub.appendChild(mk("span", "tag", label));
                    const [r, v] = slider(min, max, step, () => obj[key], (val) => { obj[key] = val; }, fmt);
                    sub.appendChild(r); sub.appendChild(v);
                    return sub;
                };

                // ---- place spammers ----
                card.appendChild(mk("div", "sect", "Place spammers"));
                for (const s of SPAMMERS) {
                    const cfg = prefs.spammers[s.id];
                    const row = mk("div", "ctl");
                    row.appendChild(toggle(() => cfg.on, (v) => { cfg.on = v; }));
                    row.appendChild(mk("span", "lbl", s.label));
                    row.appendChild(bindBtn(() => cfg.key, (id) => { cfg.key = id; }));
                    card.appendChild(row);
                    const sub = mk("div", "sub");
                    sub.appendChild(mk("span", "tag", "item"));
                    sub.appendChild(textInput(() => cfg.item, (v) => { cfg.item = v || s.item; }));
                    sub.appendChild(mk("span", "tag", "speed"));
                    const [r, v] = slider(40, 500, 10, () => cfg.speed, (val) => { cfg.speed = val; }, (n) => n + "ms");
                    sub.appendChild(r); sub.appendChild(v);
                    card.appendChild(sub);
                }
                card.appendChild(mk("div", "hint", "Hold the key to keep placing toward your cursor. \u201Cutility\u201D places the age-7 building in your bar; \u201Ca|b\u201D places the first one you have."));

                // ---- humanize timing (placement anti-pattern) ----
                card.appendChild(mk("hr"));
                card.appendChild(mk("div", "sect", "Humanize timing"));
                card.appendChild(ctlToggle("Humanize timing", () => prefs.humanize.on, (v) => { prefs.humanize.on = v; }));
                card.appendChild(subSlider("jitter", 0, 60, 1, prefs.humanize, "jitter", (n) => "\u00B1" + n + "%"));
                card.appendChild(subSlider("pause chance", 0, 25, 1, prefs.humanize, "pauseChance", (n) => n + "%"));
                card.appendChild(subSlider("pause up to", 0, 600, 10, prefs.humanize, "pauseMax", (n) => n + "ms"));
                card.appendChild(mk("div", "hint", "Spreads each placement around its speed on a bell curve and drops in the odd longer gap, so the timing never repeats on a fixed clock a packet check could spot."));

                // ---- instakill ----
                card.appendChild(mk("hr"));
                card.appendChild(mk("div", "sect", "Instakill"));
                const ik = prefs.insta;
                const ikKey = mk("div", "ctl");
                ikKey.appendChild(mk("span", "lbl", "Instakill key"));
                ikKey.appendChild(bindBtn(() => ik.key, (id) => { if (id) ik.key = id; }));
                card.appendChild(ikKey);
                const ikMode = mk("div", "ctl");
                ikMode.appendChild(mk("span", "lbl", "Mode"));
                const modeBtn = mk("div", "kb"); modeBtn.style.minWidth = "94px";
                const paintMode = () => { modeBtn.textContent = ik.mode === "timed" ? "Timed" : "Confirmed"; };
                modeBtn.addEventListener("click", () => { ik.mode = ik.mode === "timed" ? "packet" : "timed"; save(); paintMode(); });
                paintMode(); ikMode.appendChild(modeBtn);
                card.appendChild(ikMode);
                card.appendChild(ctlToggle("Auto aim", () => ik.autoAim, (v) => { ik.autoAim = v; }));
                card.appendChild(ctlToggle("Switch back to primary", () => ik.switchBack, (v) => { ik.switchBack = v; }));
                card.appendChild(subSlider("swap delay (Timed)", 40, 300, 10, ik, "swapDelay", (n) => n + "ms"));
                const ikHats = mk("div"); ikHats.id = "mml-hats";
                const hatPick = (label, get, set) => { const slot = mk("div", "hatslot"); slot.appendChild(hatSlot(get, set)); slot.appendChild(mk("span", "tag", label)); return slot; };
                ikHats.appendChild(hatPick("primary hit", () => ik.primaryHat, (id) => { ik.primaryHat = id; }));
                ikHats.appendChild(hatPick("secondary hit", () => ik.secondaryHat, (id) => { ik.secondaryHat = id; }));
                card.appendChild(ikHats);
                card.appendChild(mk("div", "hint", "Press the key to hit with your primary (in the primary hat), then swap to your secondary (in the secondary hat). Confirmed swaps only once the server registers the first hit, so it always lands; Timed uses the swap delay. Auto aim points each hit at the nearest enemy."));

                // ---- auto heal ----
                card.appendChild(mk("hr"));
                card.appendChild(mk("div", "sect", "Auto heal"));
                card.appendChild(ctlToggle("Auto heal", () => prefs.heal.on, (v) => { prefs.heal.on = v; }));
                card.appendChild(ctlToggle("Legit mode", () => prefs.heal.legit, (v) => { prefs.heal.legit = v; }));
                card.appendChild(ctlToggle("Shame-safe timing", () => prefs.heal.shameSafe, (v) => { prefs.heal.shameSafe = v; }));
                card.appendChild(subSlider("heal below", 1, 99, 1, prefs.heal, "healAt", (n) => n + "%"));
                card.appendChild(subSlider("show in hand", 0, 300, 10, prefs.heal, "showInHand", (n) => n + "ms"));
                card.appendChild(subSlider("timing jitter", 0, 200, 10, prefs.heal, "jitter", (n) => n + "ms"));
                card.appendChild(subSlider("max per sec", 1, 12, 1, prefs.heal, "maxPerSec", null));
                card.appendChild(mk("div", "hint", "Legit mode heals a little lower, shows the food in hand for a moment, and jitters the timing so it reads like a person."));

                // ---- hat keys ----
                card.appendChild(mk("hr"));
                card.appendChild(mk("div", "sect", "Hat keys"));
                const hats = mk("div"); hats.id = "mml-hats";
                prefs.hats.forEach((h) => {
                    const slot = mk("div", "hatslot");
                    slot.appendChild(hatSlot(() => h.id, (id) => { h.id = id; }));
                    slot.appendChild(bindBtn(() => h.key, (id) => { h.key = id; }));
                    hats.appendChild(slot);
                });
                card.appendChild(hats);
                card.appendChild(mk("div", "hint", "Click a box to pick a hat, then bind a key. Press it in game to equip (again to take it off)."));

                // ---- general ----
                card.appendChild(mk("hr"));
                card.appendChild(mk("div", "sect", "General"));
                const gr = mk("div", "ctl");
                gr.appendChild(mk("span", "lbl", "Menu key"));
                gr.appendChild(bindBtn(() => prefs.menuKey, (id) => { if (id) { prefs.menuKey = id; } }));
                card.appendChild(gr);
                card.appendChild(mk("div", "foot", "MooMoo Lite"));
                return card;
            }
            function build() {
                if (built || !doc || !doc.body || !doc.head) return built;
                const style = mk("style"); style.textContent = CSS; doc.head.appendChild(style);
                gui = mk("div"); gui.id = "mml-gui";
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

    const w = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
    if (w.MooMoo) { boot(w.MooMoo); return; }
    let tries = 0;
    const iv = setInterval(() => { if (w.MooMoo) { clearInterval(iv); boot(w.MooMoo); } else if (++tries > 200) clearInterval(iv); }, 50);
    if (w.addEventListener) w.addEventListener("moomoo:ready", () => { if (w.MooMoo) { clearInterval(iv); boot(w.MooMoo); } });
})();
