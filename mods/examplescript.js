/* ===== examplescript/00-head.js ===== */
/*
 * examplescript — the bundle's mod, ported 1-1 onto moomoo.js.
 * ============================================================
 * Source of truth: examplescript.js at the repo root ("the bundle"), a modified
 * MooMoo.io client with a large combat mod woven into it. Every feature here is a
 * line-for-line port of the bundle's code, running on the loader's engines:
 *   ctx.combat   the bundle's player model + tick pipeline (combat.js)
 *   ctx.objects  the bundle's world objects (objectmanager.js)
 *   ctx.store    owned / equipped hats (store.js)
 *   ctx.onOutgoing  takeover of the official client's own packets
 *
 * The bundle's minified names are kept on purpose (z = you, Y = target, Q = nearby
 * objects, ee/A = primary/secondary weapon, p = combo busy, g[0] = pending aim, ...),
 * so any line can be checked against the bundle side by side. A glossary sits in
 * 10-env.js. Where the bundle and this server disagree on the wire, the bundle's
 * intent is translated to the server's convention (e.g. store equip/buy).
 *
 * Built from mods/examplescript/*.js by mods/build-examplescript.mjs.
 * Bots are not ported (by request). Config menu: Escape (as in the bundle) or the gear.
 */
(function () {
    "use strict";

    // The bundle's menu, tab for tab and in its order. Labels are the setting keys,
    // exactly as the bundle stored them; defaults are the bundle's (a toggle is ON
    // unless the bundle passed false).
    const T = (label, def, category, hint) => ({ key: label, label, type: "boolean", default: def, category, hint });
    const SETTINGS = [
        // ---- Combat ----
        T("auto break", true, "Combat"), T("stop on break", true, "Combat"), T("auto place", true, "Combat"),
        T("auto replace", false, "Combat"), T("auto push", true, "Combat"), T("polearm aids", true, "Combat"),
        T("aids spike sync", false, "Combat"), T("melee sync", false, "Combat"), T("bleed insta", false, "Combat"),
        T("apple insta", false, "Combat"), T("kbInsta", true, "Combat"), T("kbInsta without turret gear", false, "Combat"),
        T("kbAssist", false, "Combat"), T("stop break", true, "Combat"), T("stop on collision", false, "Combat"),
        T("movement on collision", false, "Combat"), T("strict soldier", true, "Combat"), T("strict monkey", true, "Combat"),
        T("auto equip fastest weapon", true, "Combat"), T("break spike trap", true, "Combat"), T("Auto Emp", true, "Combat"),
        T("autohat", true, "Combat"),
        { key: "APA", label: "APA", type: "number", min: 20, max: 180, step: 1, default: 50, category: "Combat" },
        // ---- heal ----
        T("auto heal", true, "heal"), T("autoQ", false, "heal"),
        // ---- Visuals ----
        T("reload bars", false, "Visuals"), T("packet count", true, "Visuals"), T("all visuals", true, "Visuals"),
        T("no outline arcs", true, "Visuals"), T("no arcs", true, "Visuals"), T("reload arcs", true, "Visuals"),
        T("smooth reloads", true, "Visuals"), T("building hp", true, "Visuals"), T("building owner", true, "Visuals"),
        T("mill rotate", false, "Visuals"), T("regular grid", true, "Visuals"), T("stacked damages", true, "Visuals"),
        T("stacked heal text", true, "Visuals"), T("show place duration", false, "Visuals"), T("log autoplace", false, "Visuals"),
        T("spike kb visual", true, "Visuals"), T("skull", true, "Visuals"), T("shame count", true, "Visuals"),
        T("log projectiles", false, "Visuals"), T("shadows", true, "Visuals"), T("animated text", true, "Visuals"),
        T("ChatLog", true, "Visuals"), T("vis aim", true, "Visuals"), T("hide name", true, "Visuals"),
        T("See through player", true, "Visuals"), T("Shaders", false, "Visuals"), T("Legacy Visuals", false, "Visuals"),
        T("Default Visuals", false, "Visuals"), T("Op Visuals", false, "Visuals"),
        // ---- Keybinds (the bundle's quest widgets) ----
        T("Toggle Quest 1", true, "Keybinds"),
        { key: "Quest Progress", label: "Quest Progress", type: "number", default: "", category: "Keybinds" },
        T("Toggle Quest 2", true, "Keybinds"),
        { key: "Quest Reward", label: "Quest Reward", type: "string", default: "", category: "Keybinds" },
        T("Toggle Quest 3", true, "Keybinds"),
        { key: "Quest Difficulty", label: "Quest Difficulty", type: "number", default: "", category: "Keybinds" },
        // ---- Throttles ----
        { key: "Auto Place Accuracy", label: "Auto Place Accuracy", type: "number", min: 20, max: 180, step: 1, default: 50,
            category: "Throttles", hint: "higher means longer calculation time ↓" },
        // ---- Extra ----
        T("Assassin", false, "Extra"), T("send ws", true, "Extra"), T("autobuy", true, "Extra"), T("fix ws", true, "Extra"),
        T("fakePing", false, "Extra"),
        { key: "pingSlider", label: "fake ping (ms)", type: "number", min: 0, max: 100, step: 1, default: 40, category: "Extra" }
    ];

    function boot(MooMoo) {
        MooMoo.register({
            id: "examplescript",
            name: "Example Script",
            version: "1.0.0",
            description: "The bundle's combat / heal / visuals / extra features, ported 1-1.",
            menu: true,
            liveSettings: true,
            defaultEnabled: true,
            settings: SETTINGS
        }, function (ctx) {

/* ===== examplescript/10-env.js ===== */
            // =====================================================================
            // ENVIRONMENT — the bundle's globals, rebuilt on the loader.
            // =====================================================================
            // Glossary (bundle name -> meaning):
            //   z  you (MooMoo.self, enriched by ctx.combat)    Y  target (nearest enemy / !target)
            //   J  every player     vn visible enemies          Sn visible clan members
            //   kh every building   Xt objects <= 2000          Q  objects <= 800
            //   bh animals          Ln tracked projectiles      ee / A primary / secondary weapon id
            //   ry food  ay wall  ly spike  cy mill  dy mine  uy trap  hy utility  fy spawn pad (item ids)
            //   v  server tick      ce 111.1ms (one tick)       u  two ticks
            //   p  combo running    ct aim locked               g[0] aim to send   y weapon to hold
            //   gt/Mt polearm aids  jt/Ht auto push             hn/Oi turret insta  Nt standing in enemy trap
            //   Dn last move dir    $t / Zt hat / tail on       Nn / On owned hats / tails
            //   He/We packets this 9-tick window / minute (the bundle's own limiter)
            //   m  key + mouse state (m.lc / m.rc / m.mc, m[key])   Ct "e" auto-hit   In "l" auto-push gate
            // ---- loader check: this mod needs loader 1.1.0+ (store, tick hooks, outgoing takeover) ----
            {
                const w0 = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
                const lv = (w0.MooMooLoader && w0.MooMooLoader.version) || "0";
                const ok = ctx.store && ctx.combat && typeof ctx.combat.onTickStart === "function" && typeof ctx.onOutgoing === "function";
                if (!ok) {
                    const msg = "Example Script needs moomoo.js loader 1.1.0 or newer, but loader " + lv + " is running. " +
                        "Re-upload loader/dist/moomoo-loader.user.js to your pastebin, then reinstall examplescript.user.js " +
                        "(Tampermonkey keeps the old loader cached until the script's version changes).";
                    console.error("[examplescript] " + msg);
                    try {
                        const d0 = w0.document;
                        const show = () => {
                            if (!d0.body) return setTimeout(show, 200);
                            const n0 = d0.createElement("div");
                            n0.textContent = msg;
                            n0.style.cssText = "position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:999999;max-width:720px;padding:10px 14px;border-radius:8px;background:#5c0620;color:#fff;font:14px sans-serif;box-shadow:0 2px 12px rgba(0,0,0,.5)";
                            d0.body.appendChild(n0);
                        };
                        show();
                    } catch (e) { /* no DOM */ }
                    return;
                }
            }
            const combat = ctx.combat, objects = ctx.objects, store = ctx.store, net = ctx.net, data = ctx.data;
            const win = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
            // a real DOM, or null (the mod also runs headless in the node test harness)
            const doc = (win.document && typeof win.document.getElementById === "function" && typeof win.document.createElement === "function") ? win.document : null;

            // ---- Math aliases (bundle lines 1-30). `let`, as in the bundle's sloppy globals. ----
            let V = Math.sin, U = Math.cos, j = Math.min, oe = Math.max, f = Math.floor, n_trunc = Math.trunc,
                H = Math.round, W = Math.PI, D = Math.sqrt, S = Math.abs, re = Math.pow, P = Math.atan2, d = Math.hypot;
            let c = Math.ceil;
            const ae = W * 2, h = W / 2.6, le = JSON.stringify, E = JSON.parse, ce = 1e3 / 9, u = ce * 2, R = Date.now;
            let q;   // the bundle's global scratch player/object

            // ---- config (K), items (x), utils (X), hats (C0) / tails (B0) ----
            // the bundle's config values (2005-2104) the engine's K doesn't carry
            const K = Object.assign({}, combat.K, {
                healthBarWidth: 50, healthBarPad: 4.5, iconPadding: 15, iconPad: .9, deathFadeout: 3e3,
                crownIconScale: 60, crownPad: 35, chatCountdown: 3e3, chatCooldown: 500, nameY: 34,
                riverPadding: 114, waterCurrent: .0011, waveSpeed: 1e-4, waveMax: 1.3,
                treeScales: [150, 160, 165, 175], bushScales: [80, 85, 95], rockScales: [80, 85, 90],
                mapPingScale: 40, mapPingTime: 2200, volcanoScale: 320, innerVolcanoScale: 100,
                volcanoAnimationDuration: 3200, volcanoAggressionRadius: 1440,
                volcanoLocationX: 14400 - 320 - 120, volcanoLocationY: 14400 - 320 - 120
            });
            const x = { list: data.items, weapons: data.weapons, projectiles: data.projectiles, groups: data.groups };
            x.a = x.list.concat(x.weapons);
            const C0 = data.hats, B0 = data.accessories;
            const X = {
                getDistance: (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1),
                getDirection: (x1, y1, x2, y2) => Math.atan2(y1 - y2, x1 - x2),
                getAngleDist: (e, t) => { const n = S(t - e) % ae; return n > W ? ae - n : n; },
                fixTo: (e, t) => parseFloat(e.toFixed(t)),
                randInt: (e, t) => Math.floor(Math.random() * (t - e + 1)) + e,
                randFloat: (e, t) => Math.random() * (t - e + 1) + e,
                lerp: (e, t, n) => e + (t - e) * n,
                lineInRect: combat.lineInRect,
                getDist: (e, t, n, i) => {
                    const a = n === 0 ? [e.x, e.y] : n === 1 ? [e.x1, e.y1] : n === 2 ? [e.x2, e.y2] : n === 3 ? [e.x3, e.y3] : [0, 0];
                    const b = i === 0 ? [t.x, t.y] : i === 1 ? [t.x1, t.y1] : i === 2 ? [t.x2, t.y2] : i === 3 ? [t.x3, t.y3] : [0, 0];
                    return Math.hypot(a[0] - b[0], a[1] - b[1]);
                }
            };
            Math.lerpAngle = Math.lerpAngle || combat.lerpAngle;

            // ---- the menu toggles, as the bundle cached them (lines 799-866) ----
            // Each is a live view of a setting with the DOM element's .checked/.value
            // shape, so ported code reads them exactly as the bundle did.
            const toggles = Object.create(null);
            const tog = (label) => toggles[label] || (toggles[label] = {
                id: label,
                get checked() { return !!ctx.settings[label]; },
                set checked(b) { ctx.setSetting(label, !!b); },
                get value() { const val = ctx.settings[label]; return val == null ? "" : String(val); },
                set value(val) { ctx.setSetting(label, val); }
            });
            const NONE = { checked: false, value: "" };      // a bot-only / missing element
            const ls = tog("Auto Place Accuracy"), cs = tog("auto place"), ds = tog("log autoplace"), us = tog("mill rotate"),
                fs = tog("send ws"), hs = tog("stacked damages"), ps = tog("stacked heal text"), ms = tog("auto replace"),
                gs = tog("regular grid"), ys = tog("reload arcs"), xs = tog("shame count"), ws = tog("all visuals"),
                bs = tog("reload bars"), vs = tog("packet count"), ks = tog("building hp"), As = tog("building owner"),
                Is = tog("smooth reloads"), Ss = tog("Shaders"), Es = tog("shadows"), Ts = tog("autoQ"), Cs = tog("apple insta"),
                Bs = tog("bleed insta"), Ds = tog("auto break"), Ps = tog("stop break"), Ms = tog("auto equip fastest weapon"),
                Ns = tog("no arcs"), Os = tog("no outline arcs"), Ls = tog("See through player"), Fs = tog("skull"),
                Vs = tog("break spike trap"), Us = tog("auto heal"), js = tog("strict soldier"), Hs = tog("autohat"),
                Ws = tog("strict monkey"), Qs = tog("autobuy"), Ys = tog("stop on collision"), zs = tog("movement on collision"),
                Gs = tog("show place duration"), Ks = tog("spike kb visual"), Xs = tog("melee sync"), Js = tog("auto push"),
                qs = tog("vis aim"), eo = tog("hide name"), to = tog("kbInsta"), no = tog("Auto Emp"), io = tog("Assassin"),
                oo = tog("log projectiles"), fo = tog("polearm aids"), wo = tog("kbAssist"), bo = tog("Legacy Visuals"),
                vo = tog("Default Visuals"), ko = tog("aids spike sync"), Kg = tog("fakePing"), Xg = tog("pingSlider");
            // bot-only or absent in the bundle's menu (bots are not ported)
            const Rs = NONE, _s = NONE, $s = NONE, Zs = NONE, so = NONE, ro = NONE, ao = NONE, lo = NONE, co = NONE,
                uo = NONE, ho = NONE, po = NONE, mo = NONE, go = NONE, yo = NONE, xo = NONE;
            const KNOWN = new Set(SETTINGS.map((s) => s.key));
            function gy(e) { return KNOWN.has(e) ? tog(e) : (doc && doc.getElementById ? doc.getElementById(e) : null); }

            // ---- engine-owned state, mirrored locally at every hook entry ----
            const z = MooMoo.self;
            let v = combat.v, Y = null, vn = [], Sn = [], Xt = [], Q = [];
            const J = combat.J, bh = combat.bh, Ln = combat.Ln, xi = combat.xi, rn = combat.rn, an = combat.an, ln = combat.ln;
            const Xe = combat.Xe;
            const kh = objects._list;
            function sync() {
                v = combat.v; Y = combat.Y; vn = combat.vn; Sn = combat.Sn; Xt = combat.Xt; Q = combat.Q;
                en = combat.en; _n = combat.sandbox;
                ng = combat.ng; et = combat.et; py = combat.py; tn = combat.tn;
            }
            // cleanup-tracked listeners (the mod can be turned off and on again)
            function own(unsub) { if (typeof unsub === "function") ctx.onCleanup(unsub); return unsub; }
            function listen(target, type, fn, opts) {
                if (!target || !target.addEventListener) return;
                target.addEventListener(type, fn, opts);
                ctx.onCleanup(() => target.removeEventListener(type, fn, opts));
            }
            const Hg = combat.Hg, jg = combat.jg, Wg = combat.Wg, te = combat.te, se = combat.se, B = combat.B,
                S4 = combat.S4, Dy = combat.Dy, P3 = combat.P3, L3 = combat.L3, X5 = combat.X5, Ne = combat.Ne,
                Ay = combat.Ay, _y = combat._y, Vy = combat.Vy, o4 = combat.o4, l4 = combat.l4, a4 = combat.a4,
                x4 = combat.x4, w4 = combat.w4, b4 = combat.b4, g4 = combat.g4, A4 = combat.A4;
            function Qg(t) { for (let e = kh.length; e--;) if (kh[e].sid === t) return kh[e]; return null; }
            const Z = (e) => e * (W / 180);
            const oy = (e) => e * 180 / W;
            // weapon variant multipliers; this server has a 5th variant (emerald, val 1.18)
            const En = [1, 1.1, 1.18, 1.18, 1.18];

            // ---- the bundle's own globals (var block 599-797), exact initial values ----
            let He = 0, We = 0, Qe = 0, Ye = [], ze = 0, Wt = { sec: false, min: false };
            let g = [], y = null, ct = false, gt = false, Mt = false, Ot = false, At = false, Ct = false, St = 0;
            let jt = false, Ht = false, Ut = null, Vt = 0, Yt = [], Gt = [0], Kt = [0], qt, nn = 0, sn = 0, lt, mt;
            let on = { status: false, w: null, a: null, s: null, d: null, aim: null, x: 0, y: 0 };
            let cn = [], un = false, p = false, fn = false, hn = false, pn = [], xn = false, wn, bn, kn = [];
            let In = true, Tn = [], Dn = null, ui, ni, en = false, _n = false, Fn = [[11], 40, 6, 7, 53, [21], 12, 56, 15, 22, 31, 26, 11, 20, [18], [19], [13]];
            let jn = "not", Hn = false, Wn, Qn, Yn, zn = [], Gn = false, Xn, Jn, qn, Zn = { msg: "", time: 0, id: null };
            let ii, si = null, ri = null, ai = "Wander", li = 400, ci = 290, di = 222, fi = 1e3, hi = "all", pi = 0, mi = 0, gi = "all";
            let vt, Ei = [], Ci = [], Bi = 0, Mi = 111, Oi = false, Fi = null, Wi = [], zi = [], Gi = 0, yt = [], xt = null;
            let ie = [], Sg = [], k5 = [0, 0], os = [], rs = [], qm = false, Y3 = [], tn = 0, np;
            let Nt = false, ns = [], is = [], ss = [];
            let Ft = null;      // the "clear" command's radius marker (chat commands are not ported)
            // loadout slots (the bundle's yy(), resolved by ctx.combat.loadout)
            let ee = null, A = null, ry = null, ay = null, ly = null, cy = null, dy = null, uy = null, fy = null, hy = null;
            function yy() {
                const lo = combat.loadout;
                ee = lo.ee; A = lo.A; ry = lo.ry; ay = lo.ay; ly = lo.ly; cy = lo.cy; dy = lo.dy; uy = lo.uy; fy = lo.fy; hy = lo.hy;
                !A && (qt = ee);
            }
            let ne = { x: null, y: null, objs: [], dev: null, dir: null }, Ny = { x: null, y: null }, Ry, My = 65;
            let mn = { players: [], bot: null, builds: [] };
            const ts = { players: [], bot: null, builds: [] }, es = { players: [], builds: [], rPlayers: [], isDoing: false };
            const G = { do: null, val: 0, play: false };
            let Je = [], Ze = [], $e = [], Ve2 = [];
            let ng = combat.ng, et = combat.et, py = combat.py;   // engine-owned, mirrored by sync()
            const Nn = store.ownedHats, On = store.ownedTails;
            const getHat = () => store.hat, getTail = () => store.tail;   // $t / Zt
            let Hn_ = false;   // Ki ("send ws" relay) never connects in the bundle (T5 bug) -> Hn stays false

/* ===== examplescript/11-packet.js ===== */
            // =====================================================================
            // PACKETS — the bundle's packet.send, translated to this server's wire.
            // =====================================================================
            // Bundle packet.send (lines 2205-2239), in its exact order:
            //   aliases d->F, a->9, G->z; the 60s minute window; np on "P"; its own
            //   limiter (He < 120 per 9-tick window, We <= 5050 per minute, excess
            //   dropped with a chat-log warning); move dedupe (same dir as Dn ->
            //   dropped) + Dn/ui/ni tracking; St++ on "K"; qt on "H".
            // Then the args are translated to what THIS server expects (the bundle
            // targeted the old protocol):
            //   c (store): old 0 = equip / 1 = buy  ->  server 1 = equip / 0 = buy
            //   D / 9: the bundle appended a source tag ("client", "autopush",
            //          "pathfinder") -> dropped; only the direction goes out
            //   6: trailing false dropped
            // Arguments the server would reject as invalid (a strike each) are not
            // sent: a NaN aim, a non-integer item id.
            function Hy(e) {
                const t = f(Math.random() * 360);
                const n = f(Math.random() * 81) + 20;
                const i = f(Math.random() * 61) + 20;
                return `hsl(${t}, ${n}%, ${i}%)`;
            }
            const isNum = (val) => typeof val === "number" && !isNaN(val) && isFinite(val);
            const isInt = (val) => Number.isInteger(val);
            function toWire(e, t) {
                switch (e) {
                    case "F": {
                        const dir = t.length > 1 ? t[1] : undefined;
                        if (dir != null && !isNum(dir)) return null;
                        return t.length > 1 ? [t[0] ? 1 : 0, dir == null ? null : dir] : [t[0] ? 1 : 0];
                    }
                    case "9": { const dir = t[0]; if (dir != null && !isNum(dir)) return null; return [dir == null ? null : dir]; }
                    case "D": return isNum(t[0]) ? [t[0]] : null;
                    case "z": return isInt(t[0]) ? [t[0], t[1] ? 1 : 0] : null;
                    case "K": return [t[0]];
                    case "c": return isInt(t[1]) ? [t[0] === 0 ? 1 : 0, t[1], t[2] ? 1 : 0] : null;
                    case "6": return [t[0] == null ? "" : String(t[0])];
                    case "S": return [];
                    case "H": return isInt(t[0]) ? [t[0]] : null;
                    case "e": return [];
                    case "0": return [];
                    default: return null;     // the old protocol's other packets have no use here
                }
            }
            const packet = {
                get connected() { return MooMoo.isReady(); },
                socketReady() { return MooMoo.isReady(); },
                send(e) {
                    if (e == "d") e = "F";
                    if (e == "a") e = "9";
                    if (e == "G") e = "z";
                    const t = Array.prototype.slice.call(arguments, 1);
                    if (!Wt.min) {
                        Wt.min = true;
                        setTimeout(() => { Wt.min = false; We = 0; }, 6e4);
                    }
                    if (e == "P") np = v;
                    if (He < 120 && We <= 5050) He++, We++;
                    if (We > 5050) b(`exceeding minute packet limit ${We}`, "", Hy(), false, true);
                    if (He >= 120) b(`exceeding second packet limit ${He}`, "", Hy(), false, true);
                    if (He >= 120 || We > 5050) return;
                    if (e == "9") {
                        ni = t[1];
                        if (Dn == t[0]) return;
                        Dn = t[0];
                        ui = t[0];
                        combatInput.moveDir = t[0] == null ? null : t[0];
                    }
                    if (e == "K") St++;
                    if (e == "H") qt >= 9 ? qt = A : qt = ee;
                    const args = toWire(e, t);
                    if (args) MooMoo.send.raw(e, args);
                }
            };
            // The combat engine predicts our own movement from the direction we last
            // sent (the bundle's Dn); the loader keeps it in selfInput.
            const combatInput = combat.selfInput;

            // ---- store: equip() exactly as the bundle (16934) + Rp (equip) / Mp (buy) ----
            function Rp(e, t) { packet.send("c", 0, e, t); }      // old protocol equip
            function Mp(e, t) { packet.send("c", 1, e, t); }      // old protocol buy
            function equip(hatId = null, accessoryId = null) {
                if (hatId !== null && !isNaN(hatId)) {
                    if (!Nn.includes(hatId)) {
                        if (getHat() !== 0) { Rp(0, 0); lt = 0; nn = 0; }
                    } else if (getHat() !== hatId) {
                        Rp(hatId, 0); lt = hatId; nn = hatId;
                    }
                }
                if (accessoryId !== null && !isNaN(accessoryId)) {
                    if (!On.includes(accessoryId)) {
                        if (getTail() !== 0) { Rp(0, 1); mt = 0; sn = 0; }
                    } else if (getTail() !== accessoryId) {
                        Rp(accessoryId, 1); mt = accessoryId; sn = accessoryId;
                    }
                }
            }
            function Vm(e, t) { packet.send("G", e, t); }
            function _m() { packet.send("K", 1); }
            function Fm() { packet.send("S", 1); }

            // ---- takeover: what the official client may still send on its own ----
            // The bundle WAS the client, and it never sent aim / move / click /
            // auto-gather from input handlers: aim and movement go out once per tick
            // from updatePlayers, attacking is done by toggling auto-gather ("K"), and
            // clicking never sends "F". So the official client's own frames of those
            // kinds are dropped; everything else it sends (chat, store, item selects,
            // upgrades, clan, pings, telemetry) goes through and counts toward the
            // bundle's packet limiter like the bundle's own sends did.
            let dropNextClientSelect = false;
            ctx.onOutgoing("aim", () => false);
            ctx.onOutgoing("move", () => false);
            ctx.onOutgoing("stopMove", () => false);
            ctx.onOutgoing("mouse", () => false);
            ctx.onOutgoing("toggle", () => false);
            ctx.onOutgoing("selectItem", () => { if (dropNextClientSelect) return false; });
            ctx.onOutgoing("*", (pl, info, action) => {
                if (info.wire === "T") return;
                if (!Wt.min) { Wt.min = true; setTimeout(() => { Wt.min = false; We = 0; }, 6e4); }
                if (He < 120 && We <= 5050) He++, We++;
                if (He >= 120 || We > 5050) return false;
                if (action === "upgrade") qt >= 9 ? qt = A : qt = ee;
            });

/* ===== examplescript/20-world.js ===== */
            // =====================================================================
            // WORLD — the bundle's objectManager methods (jl, 2534-2690), 1-1.
            // =====================================================================
            // Real buildings come from the server ("H") through ctx.objects (kh). The
            // bundle ALSO creates fake objects for placements it has just sent, so the
            // next decisions treat them as already built:
            //   Ze  every fake (drawn as a preview)     $e  fakes that block placement
            //   Je  = Q + $e, what checkItemLocation tests against
            const GameObject = objects.GameObject;
            const C = {
                // add(sid, x, y, dir, scale, type, data, setSID, owner, bot, spectate, fake, pushToFakeList, preplace, restricter)
                add(e, t, n, i, s, o, r, a, l, cc, dd, uu, ff, hh, pp) {
                    const gg = new GameObject(e);
                    gg.sid = e;
                    gg.init(t, n, i, s, o, r, l, cc, dd, uu, pp, hh);
                    if (!cc && !uu && !dd) {
                        kh.push(gg);
                        si?.addBuilding?.(gg);
                    } else if (cc && !uu) {
                        /* bot builds: bots are not ported */
                    } else if (dd && !cc && !uu) {
                        es.builds.push(gg);
                    } else {
                        Ze.push(gg);
                        if (ff) $e.push(gg);
                        Je = Q.concat($e);
                    }
                    return gg;
                },
                checkItemLocation(t, n, i, s, e, o, r) {
                    for (let k = 0; k < Je.length; ++k) {
                        const a = Je[k].blocker ? Je[k].blocker : Je[k].getScale(s, Je[k].isItem);
                        if (Je[k].active && X.getDistance(t, n, Je[k].x, Je[k].y) < i + a && !(Je[k].assumeBreak && r)) return false;
                    }
                    return !(!o && e != 210 && n >= K.mapScale / 2 - K.riverWidth / 2 && n <= K.mapScale / 2 + K.riverWidth / 2);
                },
                checkItemLocation2(t, n, i, s, e, o, r) {
                    for (let k = 0; k < Xt.length; ++k) {
                        const ob = Xt[k];
                        const l = ob.blocker ? ob.blocker : ob.getScale(s, ob.isItem);
                        if (ob.active && X.getDistance(t, n, ob.x, ob.y) < i + l) return false;
                    }
                    return !(!o && 210 != e && n >= K.mapScale / 2 - K.riverWidth / 2 && n <= K.mapScale / 2 + K.riverWidth / 2);
                },
                checkItemLocation3(t, n, i, s, e, o, r, a) {
                    for (let l = 0; l < Q.length; ++l) {
                        const cc = Q[l].blocker ? Q[l].blocker : Q[l].getScale(s, Q[l].isItem);
                        const hit = X.getDistance(t, n, Q[l].x, Q[l].y) < i + cc;
                        if (hit) {
                            a.overlap.push(Q[l]);
                            a.preplacer.push(Q[l].assumeBreak);
                            a.sids.push(Q[l].sid);
                        }
                    }
                    if (a.preplacer.includes(false)) return false;
                    return !(!o && 210 != e && n >= K.mapScale / 2 - K.riverWidth / 2 && n <= K.mapScale / 2 + K.riverWidth / 2);
                },
                checkItemLocation4(e, t, n, i, s, o, r) {
                    for (let a = 0; a < Q.length; ++a) {
                        const l = Q[a].blocker ? Q[a].blocker : Q[a].getScale(i, Q[a].isItem);
                        if (Q[a].active && X.getDistance(e, t, Q[a].x, Q[a].y) < n + l && r.sid != Q[a].sid) return false;
                    }
                    return !(!o && 210 != s && t >= K.mapScale / 2 - K.riverWidth / 2 && t <= K.mapScale / 2 + K.riverWidth / 2);
                },
                checkCollision2(e, t, n) {
                    n = n || 1;
                    const i = e.x2 - t.x, s = e.y2 - t.y;
                    let o = 35 + (t.realScale ? t.realScale : t.scale);
                    if (S(i) <= o || S(s) <= o) {
                        o = 35 + (t.getScale ? t.getScale() : t.scale);
                        const r = D(i * i + s * s) - o;
                        if (r <= 0) return t.zIndex > t.zIndex && (t.zIndex = t.zIndex), true;
                    }
                    return false;
                }
            };
            function Yy(e) { return e.type === 1 && e.y >= 12e3 ? e.scale * 0.55 : e.type === 1 ? e.scale * 0.6 : e.type === 0 ? e.scale * 0.7 : e.scale; }
            function ky(e, t) { return S(e.x - t.x) + S(e.y - t.y); }
            function Cy(e, t) {
                if (e.x2 && t.x2) return D(re(t.y2 - e.y2, 2) + re(t.x2 - e.x2, 2));
                if (!e.x2 == undefined && !t.x2) return D(re(t.y - e.y, 2) + re(t.x - e.x, 2));
                if (e.x2 && !t.x2) return D(re(t.y - e.y2, 2) + re(t.x - e.x2, 2));
                if (!e.x2 && t.x2) return D(re(t.y2 - e.y, 2) + re(t.x2 - e.x, 2));
            }
            function S4b(e, t) { return X.getDistance(e.x2 || e.x, e.y2 || e.y, t.x2 || t.x, t.y2 || t.y); }

/* ===== examplescript/30-input.js ===== */
            // =====================================================================
            // INPUT — keys, mouse, movement (bundle 13331-13700, E3 18708), 1-1.
            // =====================================================================
            // The bundle WAS the client: its handlers never sent aim/move/click
            // themselves. Keys only set state (m[key], vm[keyCode]); movement and
            // aim go out once per tick from the tick (Om / the aim block); hitting is
            // auto-gather ("K") toggled by the tick. The official client's own frames
            // of those kinds are dropped in PACKETS (takeover), plus here the ones the
            // bundle sent itself from the same keys (digit item select, R map ping,
            // Q quick food which the bundle did not have), so nothing goes out twice.
            const m = [];          // key / mouse state: m.lc m.rc m.mc, m[key] (0..3), m[code]
            let vm = {};           // movement keys held (keyCode -> 1)
            const km = { 87: [0, -1], 83: [0, 1], 65: [-1, 0], 68: [1, 0] };
            const Ue = [];
            let Bh = 0, Dh = 0;    // mouse clientX / clientY
            let Fh = win.innerWidth || 0, _h = win.innerHeight || 0;
            let am = false;        // touch controls (never on desktop)
            let wh, xm, Dm = null;
            const om = { x: null, y: null, x2: null, y2: null };
            let im = 1;            // world units per screen px of the mouse (kept by sm())
            let I3 = { time: 0, type: null }, S3 = 0;
            // z.skins / z.tails: hats & accessories you own, as the bundle's Player kept them
            z.skins = {}; z.tails = {};
            for (const h0 of C0) h0.price <= 0 && (z.skins[h0.id] = 1);
            for (const t0 of B0) t0.price <= 0 && (z.tails[t0.id] = 1);
            // the store reply "5" (Dp, 12181): what you own, plus the autobuy list (Fn)
            // and the hats / tails the projectile insta (Nx) may use (Gt / Kt)
            own(store.onChange((ev) => {
                const t = ev.id, n = ev.isAccessory ? 1 : 0;
                if (ev.action === "buy") (n ? z.tails : z.skins)[t] = 1;
                if (ev.action === "buy" && t != 0) {
                    if (Fn.length && (n == 0 || n == 1)) {
                        for (let e = 0; e < Fn.length; e++) {
                            if (n == 0 && !Array.isArray(Fn[e]) && Fn[e] == t) Fn.splice(e, 1);
                            if (n == 1 && Array.isArray(Fn[e]) && Fn[e][0] == t) Fn.splice(e, 1);
                        }
                        if ([40, 12, 22, 6, 7, 56, 53, 15, 31].includes(t) && !Gt.includes(t) && n == 0) Gt.push(t);
                        if ([11, 19].includes(t) && !Kt.includes(t) && n == 1) Kt.push(t);
                    }
                }
            }));

            // DOM of the official client, looked up when needed (the mod can start
            // before the page is built). `.style.display` reads "block" only while
            // the element is actually shown, else "none" (the bundle hid them with
            // inline styles at startup; the official client starts them hidden by CSS).
            function lazyEl(id) {
                return {
                    get el() { return doc && doc.getElementById ? doc.getElementById(id) : null; },
                    get style() {
                        const e = this.el;
                        const shown = !!(e && e.style && e.style.display === "block");
                        return { get display() { return shown ? "block" : "none"; } };
                    }
                };
            }
            const S0 = lazyEl("storeMenu"), x0 = lazyEl("allianceMenu"), Wp = lazyEl("chatHolder");
            const Zh = lazyEl("pingDisplay");

            function I4() { return !doc || !doc.activeElement || doc.activeElement.id === ""; }
            function Im() { return x0.style.display != "block" && Wp.style.display != "block"; }
            function Am() { vm = {}; }
            function Bm() { return; }
            function Lm() { z.lockDir = z.lockDir ? 0 : 1; }
            // Escape / Enter: the official client opens and closes its own menus and
            // chat; the bundle's Np()/Qp() did the same thing for its copy of them.
            function Np() { /* the official client closes the store/clan/chat itself */ }
            function Qp() { /* the official client toggles its chat itself */ }
            function wx(e) { return new Promise((r) => setTimeout(r, e)); }

            // ---- movement dir from WASD (ym) and the mouse direction (wm / bm) ----
            function ym() {
                let e = 0, t = 0, n;
                for (const i in km) { const s = km[i]; e += !!vm[i] * s[0]; t += !!vm[i] * s[1]; }
                if ((e != 0 || t != 0) && (n = P(t, e)), n !== void 0) return X.fixTo(n, 2);
            }
            function wm(e) {
                if (ct && !e) return z.dir;
                return z ? (!z.lockDir && !am && (xm = P(Dh - _h / 2, Bh - Fh / 2)), X.fixTo(xm || 0, 2)) : 0;
            }
            function bm() {
                return z ? (!z.lockDir && !am && (xm = P(Dh - _h / 2, Bh - Fh / 2)), X.fixTo(xm || 0, 2)) : 0;
            }
            // rm (13290): the mouse in world coordinates (om.x2 / om.y2)
            function rm(e, t) {
                if (e) { om.x = e.clientX; om.y = e.clientY; }
                const n = (om.x - Fh / 2) * im * .91975;
                const i = (om.y - _h / 2) * im * .91975;
                const s = z.x2 + n;
                const o = z.y2 + i;
                om.x2 = s;
                om.y2 = o;
                return { x: s, y: o };
            }

            // ---- keydown (Tm, 13412) ----
            function Tm(e) {
                if (!I4() || !en) return;
                const t = e.which || e.keyCode || 0;
                78 == t && (on.status = !on.status);
                e.key == "e" && (Ct = !Ct);
                if (m[e.key] === undefined) m[e.key] = 0;
                m[e.key] <= 2 && m[e.key]++;
                t == 27 ? Np() : z && z.alive && Im() && (vm[t] || (vm[t] = 1, t == 75 ? si?.setWaypoint("quick", z) : t == 88 ? Lm() : z.weapons[t - 49] != null ? Vm(z.weapons[t - 49], !0) : z.items[t - 49 - z.weapons.length] != null ? Vm(z.items[t - 49 - z.weapons.length]) : t == 82 ? Fm() : t == 32 && (wh = 1, Bm())));
                Ue[e.keyCode] = 1;
                Ue[e.keyCode] = 1;
                if (m[e.key] === undefined) m[e.key] = 0;
                m[e.key] <= 2 && m[e.key]++;
                if (m.q) {
                    xn = true;
                    setTimeout(() => { xn = false; }, ce);
                }
                if (e.code == "ShiftRight" || e.code == "ShiftLeft") {
                    if (m[e.code] === undefined) m[e.key] = 0;
                    m[e.code] = 1;
                }
                e.key == "l" && (In = !In, U1.showText(z.x2, z.y2, 30, .2, 400, In, "#fff"));
                e.key == "p" && em();
                e.key == "r" && (un = un == "normal" ? un = false : un = "normal");
                e.key == "R" && (un = un == "reverse" ? un = false : un = "reverse");
                e.code == "NumpadMultiply" && (fn = !fn, U1.showText(z.x2, z.y2, 30, .2, 400, fn, "#fff"));
                e.code == "NumpadSubtract" && (z.customColor = Array.from(F)[f(Math.random() * F.size)]);
                e.key == "t" && si?.goal?.pathing ? si?.updateChat("stop", z?.sid) : e.key == "t" ? si?.updateChat("path", z?.sid) : null;
                if (e.keyCode == 32) {
                    if (m.mc === undefined) m.mc = 0;
                    m.mc = 1;
                }
                m["1"] == 1 && (qt = ee);
                m["2"] == 1 && A != null && (qt = A);
            }
            const F = new Set(["#bf8f54", "#cbb091", "#896c4b", "#fadadc", "#ececec", "#c37373", "#4c4c4c", "#ecaff7", "#738cc3", "#8bc373", "#67A9DD"]);

            // ---- keyup (Cm, 13514) ----
            function Cm(e) {
                if (z && z.alive) {
                    const t = e.which || e.keyCode || 0;
                    if (t == 13) {
                        if (x0.style.display === "block") return;
                        Qp();
                    } else {
                        Im() && vm[t] && (vm[t] = 0, t == 32 && (wh = 0, Bm()));
                    }
                    if (m[e.key] === undefined) m[e.key] = 0;
                    m[e.key] = 0;
                    m[e.key] = 0;
                    Ue[e.keyCode] = 0;
                }
                if (e.code == "ShiftRight" || e.code == "ShiftLeft") {
                    if (m[e.code] === undefined) m[e.key] = 0;
                    m[e.code] = 0;
                }
                if (e.key === "Enter") {
                    if (chatLog && doc.activeElement === chatLog.input) {
                        // the bundle ran its chat commands here; commands are not ported
                        chatLog.input.value = "";
                        setTimeout(() => { chatLog.input.blur(); }, 0);
                    }
                }
                if (e.key === "/" && "chatbox" !== String(doc.activeElement && doc.activeElement.id).toLowerCase()) {
                    chatLog && chatLog.input.focus();
                }
                if (e.keyCode == 32) {
                    if (m.mc === undefined) m.mc = 0;
                    m.mc = 0;
                }
            }
            // "m": the bundle's debug reset (Kp)
            function Kp(e) {
                if (e === "debug") {
                    console.log("debugged");
                    p = false;
                    hn = false;
                    store.forgetEquipped();
                    return true;
                }
            }
            // "p": ease the camera zoom back to default (em, 13251)
            async function em() {
                if (Oh > K.maxScreenWidth + 1) {
                    await wx(2);
                    Oh /= 1.05;
                    Lh /= 1.05;
                    sm();
                    em();
                } else if (Oh < K.maxScreenWidth - 1) {
                    await wx(2);
                    Oh *= 1.05;
                    Lh *= 1.05;
                    sm();
                    em();
                } else return;
            }

            // ---- mouse (13331) ----
            function onMouseMove(e) { rm(e); Bh = e.clientX; Dh = e.clientY; }
            function onMouseDown(e) {
                if (e.button == 0) { if (m.lc === undefined) m.lc = 0; m.lc = 1; }
                if (e.button == 1) { if (m.mc === undefined) m.mc = 0; m.mc = 1; }
                if (e.button == 2) { if (m.rc === undefined) m.rc = 0; m.rc = 1; }
                wh != 1 && (wh = 1, Bm());
            }
            function onMouseUp(e) {
                if (e.button == 0) { if (m.lc === undefined) m.lc = 0; m.lc = 0; }
                if (e.button == 1) { if (m.mc === undefined) m.mc = 0; m.mc = 0; }
                if (e.button == 2) { if (m.rc === undefined) m.rc = 0; m.rc = 0; }
                wh != 0 && (wh = 0, Bm());
            }
            // zoom: hold q and use the mouse wheel (11682)
            function onWheel(e) {
                if (!m.q) return;
                if (e.deltaY > 0) {
                    Oh *= 1.05;
                    Lh *= 1.05;
                } else {
                    Oh /= 1.05;
                    Lh /= 1.05;
                }
                sm();
            }

            const trusted = (fn) => function (e) { if (e && e.isTrusted === false) return; return fn.apply(this, arguments); };
            let inputBound = false;
            function bindInput() {
                if (inputBound || !doc || !doc.getElementById) return false;
                const E4 = doc.getElementById("touch-controls-fullscreen");
                if (!E4) return false;
                inputBound = true;
                listen(E4, "mousemove", onMouseMove, false);
                listen(E4, "mousedown", onMouseDown, false);
                listen(E4, "mouseup", onMouseUp, false);
                listen(win, "keydown", trusted(Tm));
                listen(win, "keyup", trusted(Cm));
                listen(doc, "keydown", function (e) { if (e.key === "m") Kp("debug"); });
                listen(win, "wheel", onWheel);
                listen(win, "resize", () => { Fh = win.innerWidth; _h = win.innerHeight; });
                listen(win, "focus", () => { z && z.alive && Am(); });
                // Escape: the bundle's menu key (Be, 403). The config menu toggles on
                // it; the official client's Escape still closes its own open panels
                // but doesn't open its game-settings menu on top of ours.
                const cfg = win.MooMooLoader && win.MooMooLoader.config;
                if (cfg && cfg.setToggleKey) {
                    const prevKey = cfg.toggleKey;
                    cfg.setToggleKey("Escape");
                    ctx.onCleanup(() => cfg.setToggleKey(prevKey || "`"));
                }
                listen(win, "keydown", (e) => {
                    if (e.key !== "Escape" || e.isTrusted === false) return;
                    const ids = ["storeMenu", "allianceMenu", "chatHolder", "reportMenu", "profileCard", "clanCard", "adminMenu", "gameSettings"];
                    const anyOpen = ids.some((id) => { const el = doc.getElementById(id); return el && el.style.display && el.style.display !== "none"; });
                    if (!anyOpen) e.stopPropagation();
                }, true);
                // clicking an item in the action bar is the one item select the
                // official client still makes for us (the bundle's bar did the same)
                listen(doc, "mousedown", (e) => {
                    const bar = doc.getElementById("actionBar");
                    if (bar && e.target && bar.contains(e.target)) { allowClientSelect = true; setTimeout(() => { allowClientSelect = false; }, 250); }
                }, true);
                return true;
            }
            let allowClientSelect = false;
            ctx.onOutgoing("selectItem", () => { if (!allowClientSelect) return false; });
            ctx.onOutgoing("pingMap", () => false);        // the bundle sends it itself on R
            ctx.onOutgoing("stopMove", () => false);       // the bundle clears its own keys instead (Am)
            let inputDead = false;
            ctx.onCleanup(() => { inputDead = true; });
            (function waitDom() { if (!inputDead && !bindInput()) setTimeout(waitDom, 50); })();

            // ---- Om (13609): send the movement direction once per tick ----
            function Om(e = false) {
                var t = ym();
                let n = { ...z };
                let i = Vg(1, t);
                n.buildIndex = -1;
                n.weaponIndex = y != null ? y : z.weaponIndex;
                n.skinIndex = z.skins[i.skinIndex] ? i.skinIndex : z.skinIndex;
                n.tailIndex = z.tails[i.tailIndex] ? i.tailIndex : z.tailIndex;
                e = !isNaN(t) ? E3(z, t, l4(n, t, n, 1)) : false;
                if (e && !m.ShiftLeft && !(ni == "pathfinder" && si?.goal?.pathing)) t = undefined;
                if (t == Dn) return;
                if ((null == ui || null == t || Math.abs(t - ui) > .3) && !(ni == "pathfinder" && si?.goal?.pathing) && !jt) {
                    packet.send("a", t);
                    ui = t;
                }
            }

            // ---- E3 (18708): stop before walking into an enemy spike, break it ----
            function E3(c, d, u, f2, hh, pp) {
                if (!en) return;
                hh = Q.filter((e) => e?.group?.name == "spikes" && !te(e?.owner?.sid) || e?.type == 1 && e.y >= 12e3 || e.name == "teleporter").sort((e, t) => Ne(c.x2 - e.x, c.y2 - e.y) - Ne(c.x2 - t.x, c.y2 - e.y));
                if (!hh.length) return false;
                for (let a = 0, l; a < hh.length; a++) {
                    pp = (l = hh[a]).type === 1 ? l.scale * .6 + 35 : l.teleport ? l.scale * .75 + 35 : l.scale + 35;
                    let e = [l3(u.vel), l3(c.movSpd)];
                    let t = [P3(c.x2, c.y2, d, e[0]), P3(c.x2, c.y2, d, e[1])];
                    let n = se(t[0], l) <= pp || se(t[1], l) <= pp;
                    isNaN(f2) === true && (f2 = 0);
                    let i = A === 10 ? 75 : x.weapons[ee].range;
                    let s = [se(c, l, "object") <= i, se(c.np.decel, l, "object") <= i];
                    let o = Ps.checked && (s[0] || s[1]) && n && l.type !== 1;
                    let r = n || (s[0] || s[1]) && n && l.type !== 1;
                    if (r) {
                        let e2;
                        if (o) e2 = vg(l, A === 10 ? 75 : x.weapons[ee].range, hh);
                        if (!m.ShiftLeft) {
                            packet.send("a", undefined);
                            if (Date.now() - I3.time >= 250 && I3.type == "static" || I3.type != "static") U1.showText(c.x2, c.y2, 30, .1, 500, "stop", "#fff", true), I3 = { time: Date.now(), type: "static" };
                            if (o && (A === 10 && c.sr === 1 || c.pr === 1 && A != 10 && ee != 8)) {
                                y = A === 10 ? 10 : ee;
                                Ot = true;
                                S3 = v;
                                g[0] = e2;
                                Bg(e2, A === 10 ? A : ee, A === 10 ? z.secondaryVar : z.primaryVar, Nn.includes(40) && !z.dmgpot.soldier ? 40 : 6, 1);
                                ct = true;
                                if (getHat() != 40) equip(z.dmgpot.soldier ? 6 : 40, 11);
                                nn = z.dmgpot.soldier ? 6 : 40;
                            }
                        } else if (Date.now() - I3.time >= 250 && I3.type == "override" || I3.type != "override") U1.showText(c.x2, c.y2, 20, .22, 500, "override", "#fff"), I3 = { time: Date.now(), type: "override" };
                        return l;
                    }
                }
                return false;
            }

/* ===== examplescript/40-potentials.js ===== */
            // =====================================================================
            // POTENTIALS — damage / knockback / placement prediction (1-1)
            // =====================================================================
            // p5 (21767)  your incoming damage potential this tick (z.dmgpot)
            // m5 (21801)  one enemy's damage potential against you (i.dmgpot)
            // w5 (21888)  knockback landing spots (i.kbpot / i.KB)
            // O5 (22495)  where an enemy could place a spike on you (i.placePot)
            // v3 / k3     first enemy spike / trap along a direction
            // U5 / j5     would a knock send the target into a spike / trap (bounce)
            function p5(n) {
                if (!en) return;
                const i = { hp: 0, primary: 0, secondary: 0, maxOT: 0, turretGear: 0, add: 0, inrange: 0, spikes: 0, soldier: 0, forceSoldier: 0, shouldHeal: false };
                for (let e = vn.length, t; e--;) {
                    n = (t = vn[e]).dmgpot.range + t.movSpd + z.movSpd + 50;
                    if (se(z, t, "player") <= n) {
                        if (i.hp == null || i.hp == undefined) i.hp = t.dmgpot.min + z.hitProjs;
                        t.dmgpot.min > i.hp && (i.hp = t.dmgpot.min);
                        i.primary += t.dmgpot.primary;
                        i.secondary += t?.dmgpot.secondary;
                        i.add += i.primary + i.secondary;
                        i.turretGear += t?.dmgpot.turretGear;
                        i.inrange += 1;
                        i.spikes += i.spikes;
                        !i.soldier && (t.dmgpot.soldier || i.primary >= 100 || z.hitProjs >= 100) && (i.soldier = true);
                        !i.forceSoldier && t.dmgpot.forceSoldier && (i.forceSoldier = true);
                    }
                }
                i.shouldHeal = i.hp >= z.health;
                return i;
            }

            function m5(n) {
                const i = { primary: 0, secondary: 0, turretGear: 0, soldier: false, forceSoldier: false, min: 0, m1: 0, spikes: 0, m2: 0 };
                const t = !n.secondary ? 15 : n.secondary;
                const s = !isNaN(n.primary) && n.primary != null ? n.primary : 5;
                let o = x.weapons.filter((e) => e.age > n.assumeAge && e.id > 8 && (null == e?.pre || e.uF.includes(t) && !e.uF.includes(s)));
                o.length ? o = o.reduce((e, t2) => e.dmg > t2.dmg ? e : t2) : o = 0;
                let e = x.weapons.filter((e2) => e2.age > n.assumeAge && e2.id <= 8 && (null == e2?.pre || e2.uF.includes(s) && e2.uF.includes(t) && e2.uF.includes(o?.id)));
                e.length ? e = e.reduce((a, b2) => a.dmg > b2.dmg ? a : b2) : e = 0;
                let r = e !== 0 && (s && n.pr == 1 && x.weapons[s].dmg < e.dmg || !n.pr && s) ? e.dmg * (n.tailIndex === 11 ? 1 : 1.5) : s && n.pr == 1 ? x.weapons[s]?.dmg * En[n?.primaryVar] * 1.5 : 0;
                let a = o !== 0 && (t && n.sr == 1 && x.weapons[t].dmg < o.dmg || !n.sr && t) ? o.dmg * (o.projectile == undefined ? 1.5 : 1) : t && n.sr == 1 ? x.weapons[t].dmg * (x.weapons[t].projectile == undefined ? En[n?.secondaryVar] * (n.tailIndex === 11 ? 1 : 1.5) : 1) : 0;
                if (r && n.primaryVar == 3 && z.bleed === 0 || z.poison > 0 && z.bleed === 0) r += 5;
                if (a && (n.secondary == 10 || n.secondary == 14) && z.bleed === 0 || z.poison > 0 && z.bleed === 0) a += 5;
                const l = v3(z, B(n.np.real, z.np.real), se(z, n.kbpot.fpriTKB), true, 0);
                const cc = v3(z, B(n.np.real, z.np.real), se(z, n.kbpot.priKB), true, 0);
                const dd = Q.filter((e2) => Nt && e2?.group?.name === "spikes" && (!e2.manualBreak || !e2.assumeBreak) && (se(z, n) <= 130 && Ay(B(n, e2), B(n, z)) <= 3) && !te(e2.owner.sid) && se(z, e2, "object") <= (A === 10 ? 75 : x.weapons[ee]?.range)).sort((a2, b2) => se(z, a2, "object") - se(z, b2, "object"));
                let uu = 0, ff = 0;
                const hh = Q.filter((e2) => (e2.name == "pit trap" || e2.group?.name == "spikes" || e2.type === 1 && e2.y >= 12e3) && e2.distance <= 450);
                i.range = e?.range != undefined && e?.range > x.weapons[s].range ? e?.range : x.weapons[s].range;
                i.primary += r;
                if ((n.secondary === 10 || n.secondary == 14) && se(z, n, "player") <= x.weapons[t].range || !isNaN(x.weapons[t]?.projectile) && se(z, n) - 105 <= x.projectiles[x?.weapons[t]?.projectile]?.range * 111 + 40) {
                    i.secondary += a;
                }
                if (n.placePot.onPlayer.length && hh.length) {
                    const e2 = U5(n.placePot.onPlayer, hh, z);
                    if (e2.building && (e2.bounce || e2.building.name != "pit trap")) {
                        uu = e2.building.dmg;
                        m3(e2.newPos);
                    }
                }
                if (dd.length > 0) {
                    for (let t2 = dd.length; t2--;) {
                        const e2 = dd[t2];
                        if (se(z, n, "player") <= x.weapons[s].range && (se(z, e2) <= 35 + e2.realScale || z.spdMult > 0 && se(z.np.decel, e2) <= 35 + e2.realScale + 3.5)) {
                            ff += e2.dmg;
                            if (n.pr == 1 && (s == 3 || s == 4 || s == 5) && ff + i.primary >= z.health) i.forceSoldier = true;
                            if (i.forceSoldier) U1.showText(z.x2, z.y2, 20, 0.18, 800, "anti melee sync test", "#fff");
                        }
                    }
                }
                i.spikes = 0;
                i.spikes = n.placePot.onPlayer.length ? n.loadout.spike.dmg + uu : l && !Nt ? l.obj.dmg : 0;
                if (n.tr === 1 && y5(z, n, 1.5 * 111 + 60, 0, 1)) i.turretGear += 25;
                i.m1 = i.primary;
                i.m2 = i.secondary + i.turretGear;
                i.min = i.m1 >= i.m2 ? i.m1 + i.spikes : i.m2 + i.spikes;
                i.soldier = n.placePot.onPlayer.length ? true : cc && n.pr === 1 && !Nt ? true : false;
                return i;
            }

            function y5(e, t, n, i = undefined, s) {
                if (s && se(e.np.real, t.np.real, i) <= n) return true;
                if (se(e, t, i) <= n) return true;
                return false;
            }

            function w5(e, t, n, i) {
                const s = 0.3 + (x.weapons[e?.primary]?.knock || 0);
                const o = 0.3 + (x.weapons[e?.secondary]?.knock || 0);
                !n && (n = B(e, t));
                const r = Math.cos(n), a = Math.sin(n);
                i = { xP: s * r * 111, yP: s * a * 111, xS: o * r * 111, yS: o * a * 111 };
                return {
                    priKB: { x: t.x2 + (t.xVel + i.xP), y: t.y2 + (t.yVel + i.yP) },
                    secKB: { x: t.x2 + (t.xVel + i.xS), y: t.y2 + (t.yVel + i.yS) },
                    turKB: { x: t.x2 + (t.xVel + 0.3 * r * 111), y: t.y2 + (t.yVel + 0.3 * a * 111) },
                    priTKB: { x: t.x2 + (t.xVel + i.xP + 0.3), y: t.y2 + (t.yVel + i.xP + 0.3) },
                    secTKB: { x: t.x2 + (t.xVel + i.xS + 0.3), y: t.y2 + (t.yVel + i.xS + 0.3) },
                    fpriKB: { x: t.np.real.x + (t.np.xVel + i.xP), y: t.np.real.y + (t.np.yVel + i.yP) },
                    fsecKB: { x: t.np.real.x + (t.np.xVel + i.xS), y: t.np.real.y + (t.np.yVel + i.yS) },
                    fturKB: { x: t.np.real.x + (t.np.xVel + 0.3 * r * 111), y: t.np.real.y + (t.np.yVel + 0.3 * a * 111) },
                    fpriTKB: { x: t.np.real.x + (t.np.xVel + i.xP + 0.3), y: t.np.real.y + (t.np.yVel + i.xP + 0.3) },
                    fsecTKB: { x: t.np.real.x + (t.np.xVel + i.xS + 0.3), y: t.np.real.y + (t.np.yVel + i.xS + 0.3) }
                };
            }

            function v3(o, r, a, e, l, cc, dd, uu, ff) {
                cc = Q.filter((e2) => e2?.group?.name == "spikes" && (o.sid != z.sid ? te(e2?.owner?.sid) || o?.team === null && e2?.owner?.sid != o.sid : !te(e2?.owner?.sid)) || e2?.type == 1 && e2.y >= 12e3);
                if (!cc) return false;
                if (e) { dd = o.np.real.x; uu = o.np.real.y; } else { dd = o.x2; uu = o.y2; }
                for (const s in cc) {
                    const t = cc[s];
                    ff = t.type === 1 ? ff = t.scale * 0.55 + 35 : t.scale + 35;
                    const n = se(o, t);
                    const e2 = P3(dd, uu, r, n);
                    const i = se(e2, t);
                    if (i < ff && n - ff < a && (l && t.dmg >= 35 || t.type === 1 || !l)) {
                        const e3 = P3(dd, uu, r, n - ff);
                        return { x: e3.x, y: e3.y, obj: t };
                    }
                }
                return false;
            }

            function k3(o, r, a, e, t, l, cc, dd, uu) {
                l = Q.filter((e2) => e2.name == "pit trap" && (o.sid != z.sid ? te(e2?.owner?.sid) || o?.team === null && e2?.owner?.sid != o.sid : !te(e2?.owner?.sid)));
                if (!l) return false;
                if (e) { cc = o.np.real.x; dd = o.np.real.y; } else { cc = o.x2; dd = o.y2; }
                for (const s in l) {
                    const t2 = l[s];
                    uu = t2.scale + 35;
                    const n = se(o, t2);
                    const e2 = P3(cc, dd, r, n);
                    const i = se(e2, t2);
                    if (i < uu && n - uu < a) {
                        const e3 = P3(cc, dd, r, n - uu);
                        return { x: e3.x, y: e3.y, obj: t2 };
                    }
                }
                return false;
            }

            function O5(t, e, n, i = W / 50) {
                const s = i;
                const o = { onPlayer: [], possible: [], placeRange: null };
                const r = x.list[e];
                const a = 35 + r.scale + (r.placeOffset || 0);
                for (let e2 = n; e2 <= n + ae; e2 += s) {
                    const l = e2, cc = a, dd = U(l), uu = V(l);
                    const ff = t.x2 + cc * dd, hh = t.y2 + cc * uu;
                    const pp = { x: ff, y: hh, scale: r.scale, angle: l, placeRange: cc, overlap: [], preplacer: [], sids: [] };
                    const mm = C.checkItemLocation3(ff, hh, r.scale, 0.6, r.id, false, true, pp);
                    if (se({ x: ff, y: hh }, z) <= r.scale + 35) { if (mm) o.onPlayer.unshift(pp); }
                    if (mm) o.possible.unshift(pp);
                }
                return o;
            }

            function U5(s, o, r) {
                const a = { building: null, closest: Infinity, bounce: false, dmg: 0, spikeCount: 0, trapCount: 0, total: 0, newPos: { ...r } };
                o = o.filter((e) => !te(e.owner?.sid) || e.y >= 12e3 && e.type === 1);
                for (let e = 0; e < s.length; e++) {
                    const i = Math.atan2(r.y2 - s[e].y, r.x2 - s[e].x);
                    for (let n = 0; n < o.length; n++) {
                        const e2 = Ne(r.np.real.x - o[n].x, r.np.real.y - o[n].y);
                        const t = P3(r.np.real.x, r.np.real.y, i, j(e2, 170));
                        a.newPos.affected = r.sid;
                        a.newPos.NEWX = t.x;
                        a.newPos.NEWY = t.y;
                        a.originDir = i;
                        a.newPos.dstSpd = e2;
                        a.newPos["static"] = true;
                        a.newPos.expire = 3;
                        if (Ne(t.x - o[n].x, t.y - o[n].y) <= (o[n].name == "pit trap" ? 45.5 : o[n].realScale + 35) && e2 < a.closest) {
                            a.closest = e2;
                            a.building = o[n];
                            if (e2 <= 150 && e2 >= 50 && (o[n].group?.name == "spikes" || o[n].type === 1) && Ay(i, P(o[n].y - s.y, o[n].x - s.x)) <= 0.17) a.bounce = true;
                            else a.bounce = false;
                            return a;
                        }
                    }
                }
                return a;
            }

            function j5(i, s, o) {
                const r = { building: null, closest: Infinity, bounce: false, dmg: 0, spikeCount: 0, trapCount: 0, total: 0, newPos: { ...o } };
                const a = B(i, o);
                s = s.filter((e) => te(e.owner?.sid) || !o.team && e?.owner?.sid != o.sid || e.y >= 12e3 && e.type === 1);
                for (let n = 0; n < s.length; n++) {
                    const e = Ne(o.np.real.x - s[n].x, o.np.real.y - s[n].y);
                    const t = P3(o.np.real.x, o.np.real.y, a, j(e, 170));
                    r.newPos.affected = o.sid;
                    r.newPos.NEWX = t.x;
                    r.newPos.NEWY = t.y;
                    r.originDir = a;
                    r.newPos.dstSpd = e;
                    r.newPos["static"] = true;
                    r.newPos.expire = 3;
                    if (Ne(t.x - s[n].x, t.y - s[n].y) <= (s[n].name == "pit trap" ? 47.5 : s[n].realScale + 35) && e < r.closest) {
                        r.closest = e;
                        r.building = s[n];
                        if (e <= 150 && e >= 50 && (s[n].group?.name == "spikes" || s[n].type === 1) && Ay(a, B(i, s[n])) <= 0.17) r.bounce = true;
                        else r.bounce = false;
                    }
                }
                return r;
            }

            function H5(e, t) {
                const o = [];
                const r = e[1].x - e[0].x, a = e[1].y - e[0].y;
                const l = D(r * r + a * a);
                const cc = e[0].x * e[1].y - e[1].x * e[0].y;
                const dd = t.scale * t.scale * l * l - cc * cc;
                if (dd >= 0) {
                    const sg = a < 0 ? -1 : 1;
                    const t1 = (cc * a + sg * r * D(dd)) / (l * l);
                    const n1 = (cc * a - sg * r * D(dd)) / (l * l);
                    const i1 = (-cc * r + S(a) * D(dd)) / (l * l);
                    const s1 = (-cc * r - S(a) * D(dd)) / (l * l);
                    o.push({ x: t1, y: i1 }, { x: n1, y: s1 });
                }
                return o;
            }
            function W5(n, e) {
                const t = H5(n, e);
                const i = [];
                t.forEach((e2) => {
                    const tt = (e2.x - n[0].x) / (n[1].x - n[0].x);
                    if (tt >= 0 && tt <= 1) i.push({ x: e2.x, y: e2.y });
                });
                return i;
            }
            function Q5(e) {
                const uu = [];
                e.forEach((e2) => {
                    const { x: a, y: l, scale: cc } = e2;
                    const t = ae * cc;
                    const dd = Math.floor(t / (2 * cc));
                    for (let r = 0; r < dd; r++) {
                        const a1 = r / dd * ae, t1 = (r + 1) / dd * ae;
                        uu.push([{ x: a + cc * U(a1), y: l + cc * V(a1) }, { x: a + cc * U(t1), y: l + cc * V(t1) }]);
                    }
                });
                return uu;
            }
            function Y5(n, e) { return Q5(e).every((e2) => W5(e2, n).length === 0); }

            // ---- fake players: knockback / death previews drawn by the overlay (Ci) ----
            const d3 = 1e3, u3 = Math.PI, f3 = 2 * Math.PI / d3;
            function l3(e, t) {
                if (isNaN(e) || e == Infinity) return null;
                let n = e;
                while (n >= 0.5) { n = n * re(0.993, 111); e += n; }
                return e;
            }
            function h3(t) {
                function n(e, t2) { return typeof e === "number" && (e > t2 || t2 === undefined); }
                const i = new Map();
                Ci.forEach((e) => {
                    if (e.sid) {
                        const t2 = i.get(e.sid);
                        if (!t2 || n(e.expire, t2.expire)) i.set(e.sid, { ...e });
                    }
                });
                Ci = Array.from(i.values());
                Ci.forEach((t2) => {
                    if (t2.deathAnim === true) {
                        const e = P3(t2.x, t2.y, t2.originDir, t2.dstSpd);
                        t2.t1 = void 0 === t2.t2 ? Date.now() : t2.t2;
                        t2.t2 = Date.now();
                        t2.distance -= t2.dstSpd;
                        t2.dt = 0;
                        t2.d1 = t2.d2;
                        t2.spinSpd ? t2.d2 += t2.spinSpd : t2.d2 = z.d2;
                        t2.x1 = t2.x; t2.y1 = t2.y;
                        t2.x2 = e.x; t2.y2 = e.y;
                        if (t2.tick === v + 1 && t2.dstSpd === 0) {
                            U1.showText(z.x2, z.y2, 50, 0.1, 500, H((se({ x: t2.positions.accel.x, y: t2.positions.accel.y }, z) - 0) * 100) / 100, "#fff", true);
                        }
                    } else if (!isNaN(t2.expire)) {
                        t2.t1 = void 0 === t2.t2 ? Date.now() : t2.t2;
                        t2.t2 = Date.now();
                        t2.distance -= t2.dstSpd;
                        t2.dt = 0;
                        t2.d1 = t2.d2;
                        t2.expire -= 1;
                        t2.x1 = t2.x; t2.y1 = t2.y;
                        t2.x2 = t2.NEWX; t2.y2 = t2.NEWY;
                    }
                });
                for (let e = 0; e < Ci.length; e++) {
                    t = Ci[e];
                    if (!t.deathAnim) continue;
                    if (t.distance <= 0 || t.tick < v + 1 && t.dstSpd === 0 || t.vals === 0) Ci.splice(e, 1);
                }
                Ci = Ci.filter((e) => e.expire >= 0 || e.expire === undefined);
            }
            let p3 = 0;
            function m3(e, t, n) {
                if (!Ks || Date.now() - p3 < 730) return;
                const i = { ...e };
                i.vals = 0.5;
                i.expire = 3;
                i.decay = 0;
                i.distance = t;
                i.fake = true;
                i.dstSpd = t;
                i.orginDir = n;
                Ci.push(i);
                p3 = Date.now();
            }
            function g3(e, t, n, i, s, o, r, a) {
                const l = { ...e };
                l.skinIndex = i;
                l.tailIndex = s;
                l.vals = 0.8;
                l.deathAnim = true;
                l.spinSpd = n || 0;
                l.decay = o || 0;
                l.distance = 3e3;
                l.fake = true;
                l.dstSpd = t;
                l.tick = v + r + 1;
                l.positions = a;
                l.originDir = e.sid === z.sid ? Math.random() * 1e3 : B(z, e);
                Ci.push(l);
            }

/* ===== examplescript/50-placement.js ===== */
            // =====================================================================
            // PLACEMENT — place / eat senders, auto place, auto replace, macros (1-1)
            // =====================================================================
            // c4 / d4 / h4 (23358-23395): select item -> click -> reselect weapon.
            // Note the bundle's precedence: `!n && y ? n = y : n = z.weaponIndex`, so a
            // passed-in weapon is ignored unless it is falsy and `y` is set.
            function c4(e, t, n) {
                if (e == null || e == undefined || e == ry && z.food < x.list[ry].req[1] && !_n || !z.canBuild(x.list[e]) && e != ry || !en || e == ry && z.skinIndex == 45) return;
                !n && y ? n = y : n = z.weaponIndex;
                packet.send("G", e, null);
                packet.send("d", 1, t);
                packet.send("G", n, n == n || n == A ? true : null);
            }
            function d4(e, t, n) {
                if (e == null || e == undefined || e == ry && z.food < x.list[ry].req[1] && !_n || !z.canBuild(x.list[e]) && e != ry || !en || e == ry && z.skinIndex == 45) return;
                !n && y ? n = y : n = z.weaponIndex;
                packet.send("G", e);
                packet.send("d", 1);
                packet.send("G", n, n == n || n == A ? true : null);
            }
            function h4(e, t) {
                if (e == null || e == undefined || e == ry && z.food < x.list[ry].req[1] && !_n || !z.canBuild(x.list[e]) && e != ry || !en || e == ry && z.skinIndex == 45) return;
                !t && y ? t = y : t = z.weaponIndex;
                packet.send("G", e);
                packet.send("d", 1);
                packet.send("G", t, t == t || t == A ? true : null);
            }
            // u4: heal up to 100 from `e`, one food per step; p4: heal for the incoming dmgpot
            function u4(e = z.health, t = [20, 40, 30]) {
                for (let n = e; n < 100; n += t[z.items[0]]) d4(z.items[0], true);
            }
            function p4(e = 100 - z?.dmgpot?.hp, t = [20, 40, 30]) {
                for (let n = e; n < 100; n += t[z.items[0]]) h4(z.items[0], true);
            }
            function f4(e, t) {
                const n = x.list[e];
                const i = 35 + n.scale + (n.placeOffset || 0);
                const s = z.x2 + U(t) * i, o = z.y2 + V(t) * i;
                C.add(v, s, o, X.fixTo(P(o - z.y2, s - z.x2) || 0, 2), n.scale, null, x.list[n.id], true, { sid: z.sid }, false, false, true, true);
            }
            function u5(e, t, n, i, s, o, r, a, l, cc, dd, uu, ff) {
                r = x.list[e];
                r?.name == "blocker" ? dd = 300 : dd = 0;
                if (!r) return;
                a = 35 + r.scale + (r.placeOffset || 0);
                l = z.x2 + U(t) * a;
                cc = z.y2 + V(t) * a;
                if (o == "outplace") ff = C.checkItemLocation3(l, cc, r?.scale, 0.6, r?.id, false, true);
                else ff = C.checkItemLocation(l, cc, r?.scale, 0.6, r?.id, false, i);
                if (n || ff && !n) ct = true;
                if (r && (ff || n)) {
                    c4(e, t);
                    if (s) C.add(v, s.x, s.y, s.angle, s.scale, null, x.list[s.item.id], true, { sid: z.sid }, false, false, true, true);
                }
            }
            function Z5(e, t) {
                packet.send("G", e, null);
                packet.send("d", 1, t);
                packet.send("G", y ? y : z.weaponIndex, true);
            }

            // ---- placement candidates around you (L5 / F5 / _5) ----
            function L5(l, e, t, n = W / 75) {
                if (!l) return [];
                const i = n, cc = [];
                const dd = t ? z.np.real.x : z.x2, uu = t ? z.np.real.y : z.y2;
                for (let a = e; a <= e + ae; a += i) {
                    const ff = a;
                    const k = Tn.findIndex((e2) => Ay(ff, e2.angle) <= 0.45);
                    const it = x.list[l];
                    const off = 35 + it.scale + (it.placeOffset || 0);
                    const px = dd + off * U(ff), py = uu + off * V(ff);
                    const o = { x: px, y: py, id: it.id, scale: it.scale, angle: ff, offset: off, item: it, collide: [], points: 0, origin: [], name: it.name, overlap: [], preplacer: [], sids: [], intercepts: [], knockback: [], used: k };
                    const r = He <= 90 ? C.checkItemLocation3(px, py, it.scale, 0.6, it.id, false, true, o) : C.checkItemLocation(px, py, it.scale, 0.6, it.id, false, true);
                    if (k !== -1) { if (!r) Tn.splice(k, 1); }
                    if (r) cc.push(o);
                }
                return cc;
            }
            function F5(l, e, t, n = W / 75) {
                if (!l) return [];
                const i = n, cc = [];
                const dd = t ? z.np.real.x : z.x2, uu = t ? z.np.real.y : z.y2;
                for (let a = e; a <= e + ae; a += i) {
                    const ff = a;
                    const k = Tn.findIndex((e2) => Ay(ff, e2.angle) <= 0.45);
                    const it = x.list[l];
                    const off = 35 + it.scale + (it.placeOffset || 0);
                    const px = dd + off * U(ff), py = uu + off * V(ff);
                    const o = { x: px, y: py, id: it.id, scale: it.scale, angle: ff, offset: off, item: it, collide: [], points: 0, origin: [], name: it.name, overlap: [], preplacer: [], sids: [], intercepts: [], knockback: [], used: k };
                    const r = C.checkItemLocation3(px, py, it.scale, 0.6, it.id, false, true, o);
                    if (r) cc.push(o);
                }
                return cc;
            }
            function _5(l, e, t, n = W / 75) {
                if (l == undefined || l == null || !l) return [];
                return L5(l, e, t, n);
            }

            // ---- auto place scoring (J5, 22820) ----
            function J5(r, a, e, t) {
                let l, cc;
                const dd = Q.filter((e2) => (e2.name == "pit trap" || e2.group?.name == "spikes" || e2.type === 1 && e2.y >= 12e3) && e2.distance <= 450);
                let uu = {};
                const ff = x.list[ly].scale - 50;
                for (let o = 0; o < e.length; o++) {
                    const s = e[o];
                    for (let i = 0; i < a.length; i++) {
                        let n = true;
                        for (let k = 0; k < s.placePot.possible.length; k++) {
                            const e2 = s.placePot.possible[k];
                            uu[a[i].angle + s.name + s.sid + e2.angle] = S4(a[i], e2);
                            if (uu[a[i].angle + s.name + s.sid + e2.angle] <= a[i].scale + e2.scale) { a[i].placePriority = true; n = false; break; }
                        }
                        if (a[i].preplacer.includes(true) && a[i].placePriority) { a[i].preplace = true; a[i].points += 1; }
                        if (!a[i].preplace && a[i].used !== -1) { a.splice(i, 1); continue; }
                        const e2 = S4(a[i], s);
                        if (e2 <= 235 && !s.inTrap || m.c) a[i].points += 1;
                        if (e2 <= 20.4) a[o].points += 1;
                        if (e2 <= 47) {
                            a[i].retrap = true;
                            a[i].collide.push(s.sid);
                            a[i].points += 1;
                            if (a[i].preplace && s.inTrap) {
                                const e3 = dd.filter((e4) => (e4?.group?.name === "spikes" && (te(e4.owner.sid) || !s.team && e4?.owner?.sid != s.sid) || e4.y >= 12e3 && e4.type === 1) && Ne(e4.x - a[i].x, e4.y - a[i].y) <= 50 + (e4.type == 1 ? e4.scale * 0.55 : e4.scale) + 24 && !a[i].sids.includes(e4.sid));
                                if (e3.length) a[i].points += e3.length + 1;
                                else {
                                    const e4 = P(s.inTrap.y - s.y2, s.inTrap.x - s.x2);
                                    const t2 = X.getAngleDist(B(s, e4), s.d2) <= h && X.getAngleDist(B(z, s), B(s, e4)) <= h;
                                    if (!t2) a[i].points += 2; else a[i].points += 1;
                                }
                            }
                        }
                        const t2 = dd.filter((e4) => (e4?.group?.name === "spikes" && (te(e4.owner.sid) || !s.team && e4?.owner?.sid != s.sid) || e4.y >= 12e3 && e4.type === 1) && Ne(e4.x - a[i].x, e4.y - a[i].y) <= 50 + (e4.type == 1 ? e4.scale * 0.55 : e4.scale) + 24 && !a[i].sids.includes(e4.sid));
                        if (t2.length) { a[i].points += 1 + t2.length; a[i].canPush = true; }
                        if (e2 <= s.placePot.placeRange) { if (n) a[i].points += 1; else a[i].points += 0.5; }
                        if (!cc || cc.points <= a[i].points) cc = a[i];
                    }
                    for (let i = 0; i < r.length; i++) {
                        r[i].bounce = false;
                        if (kx(r[i])) continue;
                        const e2 = S4(r[i], s);
                        let n = true;
                        for (let k = 0; k < s.placePot.possible.length; k++) {
                            const e3 = s.placePot.possible[k];
                            if (uu[r[i].angle + s.name + s.sid + e3.angle] + ff <= r[i].scale + e3.scale) { r[i].placePriority = true; n = false; break; }
                        }
                        if (r[i].preplacer.includes(true) && r[i].placePriority) { r[i].preplace = true; r[i].points += 1; }
                        if (!r[i].preplace && r[i].used !== -1) { r.splice(i, 1); continue; }
                        const t2 = s.inTrap ? S4(r[i], s.inTrap) : Infinity;
                        if (e2 <= 35 + r[i].scale) {
                            r[i].collide.push(s.sid);
                            if (!s.inTrap || r[i].preplace) {
                                const e3 = j5(r[i], dd, s);
                                if (e3.building) {
                                    r[i].into = e3;
                                    if (e3.building.name == "pit trap" && !(r[i].preplace && s.inTrap && r[i].sids.includes(s.inTrap.sid))) r[i].points += 2.5;
                                    else if (e3.bounce) { r[i].bounce = true; r[i].points += 5; }
                                    else if (e3.building.name !== "pit trap") r[i].points += 3;
                                    else r[i].into = false;
                                }
                            }
                            if (s.inTrap && !r[i].sids.includes(s.inTrap.sid)) { r[i].points += 2; r[i].spikeTrap = true; r[i].canPush = true; }
                        }
                        if (s.inTrap && !r[i].sids.includes(s.inTrap.sid) && t2 <= 50 + r[i].scale + 21) { r[i].canPush = true; r[i].points += 1; }
                        if (s.inTrap && e2 <= 250 && (Ay(r[i].angle, s.inTrap.angToMe) >= 1.5 || Dn === null || Dn === undefined)) r[i].points += 2;
                        if (n && e2 <= s.placePot.placeRange) r[i].points += 1;
                        if (!l || l.points <= r[i].points) l = r[i];
                    }
                    uu = {};
                }
                return { spikes: r, traps: a, bestSpike: l, bestTrap: cc };
            }

            // ---- auto replace scoring (Jm, 13753) ----
            function Jm(r, s, t, e) {
                let a, l;
                const cc = Q.filter((e2) => (e2.name == "pit trap" || e2.group?.name == "spikes" || e2.type === 1 && e2.y >= 12e3) && e2.distance <= 450);
                let dd = {};
                const uu = x.list[ly].scale - 50;
                for (let k = 0; k < t.length; k++) {
                    const o = t[k];
                    for (let i = 0; i < s.length; i++) {
                        let n = true;
                        for (let k2 = 0; k2 < o.placePot.possible.length; k2++) {
                            const e2 = o.placePot.possible[k2];
                            dd[s[i].angle + o.name + o.sid + e2.angle] = S4(s[i], e2);
                            if (dd[s[i].angle + o.name + o.sid + e2.angle] <= s[i].scale + e2.scale) { s[i].placePriority = true; n = false; break; }
                        }
                        const e2 = S4(s[i], o);
                        if (e2 <= 200) s[i].points += 1;
                        if (e2 <= 20.4) s[i].points += 1;
                        if (e2 <= 50) { s[i].collide.push(o.sid); s[i].points += Nt ? 4 : 2; }
                        const t2 = cc.filter((e3) => (e3?.group?.name === "spikes" && (te(e3.owner.sid) || !o.team && e3?.owner?.sid != o.sid) || e3.y >= 12e3 && e3.type === 1) && Ne(e3.x - s[i].x, e3.y - s[i].y) <= 50 + (e3.type == 1 ? e3.scale * 0.55 : e3.scale) + 24 && !s[i].sids.includes(e3.sid));
                        if (t2.length) { s[i].points += 1 + t2.length; s[i].canPush = true; }
                        if (e2 <= o.placePot.placeRange) { if (n) s[i].points += 1; else s[i].points += 0.5; }
                        if (!l || l.points <= s[i].points) l = s[i];
                    }
                    for (let si2 = 0; si2 < r.length; si2++) {
                        r[si2].bounce = false;
                        r[si2].collision = false;
                        if (kx(r[si2])) continue;
                        const e2 = S4(r[si2], o);
                        let n = true;
                        for (let k2 = 0; k2 < o.placePot.possible.length; k2++) {
                            const e3 = o.placePot.possible[k2];
                            if (dd[r[si2].angle + o.name + o.sid + e3.angle] + uu <= r[si2].scale + e3.scale) { r[si2].placePriority = true; n = false; break; }
                        }
                        const t2 = o.inTrap ? S4(r[si2], o.inTrap) : Infinity;
                        if (e2 <= 35 + r[si2].scale) {
                            if (r[si2].collide.length >= 1) r[si2].origin.push({ amount: 1, from: `collides with ${o.name}[${o.sid}]`, player: o });
                            r[si2].collide.push(o.sid);
                            r[si2].collision = true;
                            const e3 = j5(r[si2], cc, o);
                            if (e3.building) {
                                r[si2].into = e3;
                                if (e3.building.name == "pit trap" && !(r[si2].preplace && o.inTrap && r[si2].sids.includes(o.inTrap.sid))) r[si2].points += 2.5;
                                else if (e3.bounce) { r[si2].bounce = true; r[si2].points += 5; }
                                else if (e3.building.name !== "pit trap") r[si2].points += 3;
                                else r[si2].into = false;
                            }
                            if (o.inTrap && !r[si2].sids.includes(o.inTrap.sid)) { r[si2].points += 2; r[si2].spikeTrap = true; r[si2].canPush = true; }
                        }
                        if (o.inTrap && !r[si2].sids.includes(o.inTrap.sid) && t2 <= 50 + r[si2].scale + 21) { r[si2].canPush = true; r[si2].points += 1; }
                        if (o.inTrap && e2 <= 250 && (Ay(r[si2].angle, o.inTrap.angToMe) >= 1.5 || Dn === null || Dn === undefined)) r[si2].points += 2;
                        if (o.inTrap && jt && Ay(ne.dir, P(o.y2 - z.y2, o.x2 - z.x2)) > 4.7) { i4("prevents bounce back"); r[si2].points += 2; }
                        if (n && e2 <= o.placePot.placeRange) r[si2].points += 1;
                        if (!a || a.points <= r[si2].points) a = r[si2];
                    }
                    dd = {};
                }
                return { spikes: r, traps: s, bestSpike: a, bestTrap: l };
            }

            function q5(e) {
                e = e.filter((e2) => e2.points >= 1).sort((a2, b2) => b2.points - a2.points);
                const s = [];
                function o(e2) { return e2.reduce((acc, { points: t }) => acc + t, 0); }
                function r(e2, n, i) {
                    if (e2.length > 0 && e2.length <= 4) {
                        s.push({ points: o(e2), buildings: [...e2] });
                        if (s.length >= 3e3) return s;
                    }
                    for (let t = i; t < n.length; t++) {
                        if (!e2.some((e3) => S4(e3, n[t]) <= e3.scale + n[t].scale)) {
                            e2.push(n[t]);
                            r(e2, n.slice(t + 1), t + 1);
                            e2.pop();
                        }
                    }
                }
                r([], e, 0);
                return s;
            }

            function $5(e, t, n, i, s) {
                if (e.preplace && e.placePriority && n < 2 && He <= 60) {
                    setTimeout(() => { c4(e.item.id, e.angle); os.push(e); }, Mi - xt);
                    C.add(v, e.x, e.y, e.angle, e.scale, null, x.list[e.item.id], true, { sid: z.sid }, 0, 0, 1, 1, 1, 0);
                    return true;
                } else if (e.placePriority && n < 3 && He <= 60) {
                    Z5(e.item.id, e.angle);
                    os.push(e);
                    C.add(v, e.x, e.y, e.angle, e.scale, null, x.list[e.item.id], true, { sid: z.sid }, 0, 0, 1, 1, 0, 0);
                    return true;
                }
                s = C.checkItemLocation(e.x, e.y, e.scale, 0.6, e.item.id, false, t);
                if (s) {
                    Z5(e.item.id, e.angle);
                    C.add(v, e.x, e.y, e.angle, e.scale, null, x.list[e.item.id], true, { sid: z.sid }, 0, 0, 1, 1, 0, 1);
                    return true;
                }
                return false;
            }

            // ---- auto place (e4, 23018) ----
            let kt = [];
            function e4(e, t) {
                if (!cs.checked || !Y || !en || x.list[z.items[4]]?.name != "pit trap" || !z.items[4] || gt) return;
                const s = Date.now();
                let o = 0;
                const n = L5(ly, 0, 0, W / ls.value);
                const i = L5(uy, 0, 0, W / ls.value);
                const r = J5(n, i, ss, s);
                Tn = Tn.filter((e2) => v - e2.tick <= 6 && se(z, e2) <= e2.offset + 20);
                e = r.bestTrap;
                t = r.bestSpike;
                r.spikes.sort((a2, b2) => b2.points - a2.points);
                r.traps.sort((a2, b2) => b2.points - a2.points);
                if (!r.spikes.length && !r.traps.length) return;
                function a(n2, i2 = r.spikes.concat(r.traps)) {
                    i2.filter((e2) => e2.points > 0);
                    if (He >= 85) return;
                    if (!t && !e && !m.c) return;
                    i2 = i2.sort((e2, t2) => {
                        if (t2.points === e2.points && e2.name !== t2.name) return e2.name === "pit trap" ? -1 : 1;
                        return t2.points - e2.points;
                    });
                    for (let k = 0; k < i2.length; k++) {
                        if (!n2.some((e2) => S4(e2, i2[k]) <= e2.scale + i2[k].scale)) n2.push(i2[k]);
                        if (n2.length === 4) break;
                    }
                    for (let k = 0; k < n2.length; k++) {
                        if (!n2[k].did) {
                            if (n2[k].preplace && n2[k].placePriority && He <= 60) o++;
                            $5(n2[k], He <= 60 ? n2[k].placePriority : 0, o, s);
                            Tn.push({ ...n2[k], tick: v });
                        }
                    }
                }
                const l = [];
                if (t && t.points > 0 && (!e?.canPush || (!e?.retrap || !t.into))) {
                    if (t.into) m3(t.into.newPos);
                    if (t.placePriority) {
                        if (t.preplace) {
                            o++;
                            setTimeout(() => { c4(ly, t.angle); Tn.push({ ...t, tick: v }); os.push(t); }, Mi - xt);
                        } else {
                            Z5(ly, t.angle);
                            Tn.push({ ...t, tick: v });
                            os.push(t);
                        }
                        t.did = true;
                        l.push(t);
                        C.add(v, t.x, t.y, t.angle, t.scale, null, x.list[ly], true, { sid: z.sid }, false, true, true, t.preplace);
                    } else {
                        $5(t, 0);
                        Tn.push({ ...t, tick: v });
                        t.did = true;
                        l.push(t);
                    }
                }
                if (e && e.points > 0 && !(t && t.points > 0 && se(e, t) <= e.scale + t.scale && !kx(t)) || (e?.canPush || e?.retrap && !t.into)) {
                    if (e.placePriority) {
                        if (e.preplace) {
                            o++;
                            setTimeout(() => { c4(uy, e.angle); Tn.push({ ...e, tick: v }); os.push(e); }, Mi - xt);
                        } else {
                            Z5(uy, e.angle);
                            Tn.push({ ...e, tick: v });
                            os.push(e);
                        }
                        e.did = true;
                        l.push(e);
                        C.add(v, e.x, e.y, e.angle, e.scale, null, x.list[uy], true, { sid: z.sid }, false, true, true, e.preplace);
                    } else {
                        $5(e, 0);
                        Tn.push({ ...e, tick: v });
                        e.did = true;
                        l.push(e);
                    }
                }
                a(l);
                if (kt.length >= 6) kt.pop();
                kt.unshift(Date.now() - tn);
            }

            // ---- repeated chat-log notice counter (i4) ----
            let t4 = [];
            const n4 = 5e3;
            function i4(t) {
                const e = t4.find((e2) => e2.message === t);
                if (e) e.count++;
                else t4.push({ message: t, count: 1 });
                t4.forEach((e2) => { b(`${e2.message} (${e2.count})`, "", "#5c0620", false, true); });
                setTimeout(() => { t4 = t4.filter((e2) => e2.count > 1); }, n4);
            }

            // ---- object killed ("Q" -> $m, 13866): the destroyed building, before removal ----
            objects.onRemove(function (e, cause) {
                if (cause !== "killed") return;
                sync();
                try {
                    if (!L3(z, e)) { e.TICK = v; Yt.push(e); }
                    if (Nt && Nt.sid === e.sid) {
                        equip(null, z.tailIndex);
                        setTimeout(() => { equip(6, null); }, 1e3 / 9);
                    }
                    if (Y && Y?.globalTrap?.sid === e.sid && se(z, e) <= 126) {
                        cn.push({ build: e, destroyedAt: v });
                        if (gt) { c4(z.items[2], B(z, e)); c4(z.items[2], B(z, Y)); }
                    }
                    // The bundle's condition is `... && name == "spikes" || "greater spikes" || ...`,
                    // which is always truthy, so this runs for every destroyed object
                    // regardless of the "auto replace" toggle.
                    if (!qm && Y && se(z, Y) <= 235 && se(z, e) <= 190 && ms.checked && x.list[z.items[2]]?.name == "spikes" || "greater spikes") {
                        autoReplace(e);
                    }
                } catch (err) {
                    // The bundle threw inside its kh.filter here, which left the destroyed
                    // building in kh. Keep it, exactly like that.
                    return false;
                }
            });
            function autoReplace(e) {
                const n = F5(ly, 0, 0, W / ls.value);
                const i = F5(uy, 0, 0, W / ls.value);
                const o = Jm(n, i, ss);
                const { bestTrap: r, bestSpike: a } = o;
                o.spikes.sort((a2, b2) => b2.points - a2.points);
                o.traps.sort((a2, b2) => b2.points - a2.points);
                if (o.spikes.length && o.traps.length) {
                    function t(n2, e2 = o.spikes.concat(o.traps)) {
                        e2 = e2.filter((k) => k.points > 0);
                        if (He >= 85 || !a && !r && !m.c) return;
                        e2.sort((k, t2) => {
                            if (t2.points === k.points && k.name !== t2.name) return k.name === "spikes" || "greater spikes" ? -1 : 1;
                            return t2.points - k.points;
                        });
                        for (const t2 of e2) {
                            const i2 = n2.some((k) => S4(k, t2) <= k.scale + t2.scale);
                            const s2 = os.some((k) => S4(k, t2) <= k.scale + t2.scale);
                            if (!i2 && !s2) n2.push(t2);
                            if (n2.length === 4) break;
                        }
                        for (const k of n2) {
                            if (!k.did) { Z5(k.id, k.angle); rs.push(k); Tn.push({ ...k, tick: v }); }
                        }
                    }
                    const l = [];
                    if (a && a.points > 0 && !os.some((k) => S4(k, a) <= k.scale + a.scale) && (!r.canPush || a.into) && (jt && r.points > 0 || a.bounce)) {
                        if (a.into) m3(a.into.newPos);
                        if (a.collision) i4(`spike sync tester`);
                        Z5(Nt ? 15 : ly, a.angle);
                        Tn.push({ ...a, tick: v });
                        a.did = true;
                        l.push(a);
                        rs.push(a);
                    }
                    if (r && r.points > 0 && !os.some((k) => S4(k, r) <= k.scale + r.scale) && !(a && a.points > 0 && (!jt && a.bounce) && se(r, a) <= r.scale + a.scale) || r?.canPush || jt) {
                        Z5(uy, r.angle);
                        Tn.push({ ...r, tick: v });
                        r.did = true;
                        l.push(r);
                        rs.push(r);
                    }
                    t(l);
                }
            }
            // ---- owner left ("R" -> Xm, 13742) ----
            ctx.on("objectsKilled", function (pk) {
                const t = pk && pk.args && pk.args[0];
                if (xi.ID == t) { b(`target ID reset to undefined`, "", "green", false, true); xi.ID = null; }
            });

            // ---- spike-tick helpers (Vx/Ux/Hx/Wx, 21063-21168) ----
            function Ux(e, t, n, i) {
                i = 35 + e.scale + (e.placeOffset || 0);
                const s = Y.x2 - (z.x2 + U(t) * i), o = Y.y2 - (z.y2 + V(t) * i);
                const r = 35 + e.scale;
                const a = C.checkItemLocation3(z.x2 + U(t) * i, z.y2 + V(t) * i, e.scale, 0.6, e.id, false);
                if (n && a) {
                    if ((S(s) <= r || S(o) <= r) && se(Y, z) <= 35 + n.scale) { c4(e.id, t); return true; }
                }
                return false;
            }
            function Vx(e, t, n, i, s) {
                for (const off of [0, 15, -15, 30, -30, 45, -45]) { i = Ux(e, t + Z(off), n); i && (s = true); }
                return !!s;
            }
            function Hx(e, t, n, i, s) {
                s = 35 + e.scale + (e.placeOffset || 0);
                const o = Y.x2 - (z.x2 + U(t) * s), r = Y.y2 - (z.y2 + V(t) * s);
                const a = 35 + e.scale;
                const l = C.checkItemLocation4(z.x2 + U(t) * s, z.y2 + V(t) * s, e.scale, 0.6, n.id, false, n);
                if (n && l) {
                    if ((S(o) <= a || S(r) <= a) && se(Y, n) <= n.scale + 35) return true;
                }
                return false;
            }
            function Wx(e, t, n, i, s) {
                for (const off of [0, 15, -15, 30, -30]) { i = Hx(e, t + Z(off), n); i && (s = true); }
                return !!s;
            }

            // ---- path helpers used by placement / auto push (kx, Ax) ----
            function kx(t) {
                if (Y3.length && (Ht == false && jt) && t.name != "pit trap") {
                    for (let e = 0; e < Y3.length; e += 2) if (se({ x: Y3[e], y: Y3[e + 1] }, t) <= t.scale - 7.5) return true;
                }
                return false;
            }
            function Ax(e, i, s) {
                if (Y3 && Y3.length && (m.z || Ht == false && jt)) {
                    let t = 0, n = 0;
                    if (jt && Y3.length * 7 >= i) return;
                    while (n < Y3.length) {
                        const o = Y3[n], r = Y3[n + 1];
                        const a = D((z.x2 - o) ** 2 + (z.y2 - r) ** 2);
                        const lim = s ? 10 : 35;
                        if (a <= lim) t += 2;
                        else if (!jt) break;
                        if (jt && a > i) return false;
                        n += 2;
                    }
                    if (t + 2 < Y3.length) {
                        const l = { x: Y3[t], y: Y3[t + 1] };
                        packet.send("a", B(z, l), "pathfinder");
                        Y3.splice(0, t);
                    }
                }
                return true;
            }

            // ---- hold-key place macros (Og, 15960) + triple-windmill trail (d5, 21715) ----
            function Og() {
                m.f >= 1 && c4(z.items[4]);
                m.v >= 1 && c4(z.items[2]);
                m.h >= 1 && c4(hy);
                m.m >= 1 && c4(fy);
                m.i >= 1 && c4(ay, bm());
                m.j >= 1 && dy != null && c4(dy);
            }
            function d5() {
                if (!en || on.status == false || !z.canBuild(x.list[cy])) return on.status = false;
                if (S4(z, on) > 100) {
                    if (on.status) {
                        c4(cy, Dn + Z(180));
                        c4(cy, Dn + Z(180) - Z(69));
                        c4(cy, Dn + Z(180) + Z(69));
                    }
                    on.x = z.x2; on.y = z.y2;
                }
            }

/* ===== examplescript/55-autopush.js ===== */
            // =====================================================================
            // AUTO PUSH — Oy / Ly / Fy (17014-17237) + the A* worker U3 (18986), 1-1.
            // =====================================================================
            // Ly ("auto push" on) walks you behind the trapped target so your body
            // pushes it into a spike: it asks a worker for a path to the push point
            // and Ax() walks it (Y3 = flattened [y, x, ...] path). Oy ("auto push"
            // off, or close enough) steers directly. Fy hits when the push lands.
            function Py(e, t, n) { return (e.x * t + e.y * n) / (e.x * n - e.y * t); }

            function Oy(r, e, t, n, i, s, o) {
                if (!Y?.inTrap || !Y || !In || Y && z.skinIndex == 45 && se(z, Y) > 90) {
                    jt = false;
                    Ht = false;
                    jn = "not";
                    ne = "not";
                    Ny = "not";
                    ni == "autopush" && packet.send("a", undefined);
                    return false;
                }
                let a;
                let l;
                jt = false;
                Ht = false;
                r = B(z, Y);
                ne = { x: U(r), y: V(r), objs: [], dev: null, dir: null };
                let c2 = Q.sort((e2, t2) => se(e2, Y) - se(t2, Y));
                for (let e2 = 0; e2 < c2.length; e2++) {
                    i = c2[e2];
                    if (Y.inTrap.sid === i.sid) continue;
                    if (se(Y.inTrap, i) <= 50 + (i.type == 1 ? i.scale * .55 : i.scale) + 26 && (te(i?.owner?.sid) && i?.group?.name == "spikes" || !Y.team && i?.group?.name == "spikes" && i?.owner?.sid != Y.sid || i?.type === 1 && i.y >= 12e3) || ne.objs.length === 1 && se(i, Y.inTrap) <= 50 + i.scale + 22.5 && se(i, ne.objs[0]) <= ne.objs[0].scale + i.scale + 42.5 && !i.ignoreCollision) {
                        let e3 = P(i.y - Y.y2, i.x - Y.x2);
                        let t3 = 170 - Dy(i, Y);
                        if (ne.objs[0] && Ay(B(i, Y.inTrap), B(ne.objs[0], Y.inTrap)) <= 1.9 && se(i, ne.objs[0]) <= i.scale + ne.objs[0].scale + 67.5 || !ne.objs.length) {
                            ne.x += t3 * U(e3);
                            ne.y += t3 * V(e3);
                            if (ne.objs[0]) console.log(Ay(B(i, Y.inTrap), B(ne.objs[0], Y.inTrap)), Math.round(se(i, ne.objs[0])) - (ne.objs[0].scale + i.scale));
                            ne.objs.push(i);
                        }
                        if (Py(ne, Y.inTrap.x - Y.x2, Y.inTrap.y - Y.y2) > 0) {
                            ne.x += (Y.inTrap.x - Y.x2) * 2;
                            ne.y += (Y.inTrap.y - Y.y2) * 2;
                        }
                    }
                }
                if (Ne(ne.x, ne.y) > 5) {
                    let e2 = Dy(Y, z);
                    let t2 = Ay(r, P(ne.y, ne.x));
                    let i2 = ne.objs[0];
                    let n2 = se(Y, i2) <= i2.scale + 38.75;
                    let s2 = 3600 + re(e2, 2) - (28.5 + (n2 ? 71.5 : 0)) * e2 * U(t2);
                    let o2 = Math.acos((re(e2, 2) + s2 - 3600) / (2 * e2 * D(s2)));
                    if (o2) {
                        l = r - Math.sign((Y.x2 - z.x2) * ne.y - (Y.y2 - z.y2) * ne.x) * o2;
                        let e3 = se(z, Y) + 30;
                        Ny = { x: z.x2 + e3 * U(l), y: z.y2 + e3 * V(l) };
                        let t3 = E3(z, l, l4(z, l, z, 1));
                        let n3 = Ay(B(Y, i2), B(z, Y)) <= 2;
                        if ((!Y.hitSpike || se(z, Ny) > 100 && Y.hitSpike) && Ys.checked || !Ys.checked && n3 && !t3) {
                            packet.send("a", l, "autopush");
                            ne.dev = o2;
                            ne.dir = l;
                        } else {
                            packet.send("a", null, "autopush");
                        }
                        jt = true;
                        Ht = true;
                    }
                }
            }

            function Ly(t, n, e) {
                if (!Y?.inTrap || !Y || !In) {
                    jt = false;
                    Ht = false;
                    jn = "not";
                    Ny = "not";
                    ni == "autopush" && packet.send("a", undefined);
                    ne = "not";
                    return false;
                }
                if (!t) t = [];
                let i = Q.filter((e2) => !t.includes(e2.sid) && se(Y.inTrap, e2) <= 50 + (e2.type == 1 ? e2.scale * .55 : e2.scale) + 26 && (te(e2?.owner?.sid) && e2?.group?.name == "spikes" || !Y.team && e2?.group?.name == "spikes" && e2?.owner?.sid != Y.sid || e2?.type == 1 && e2.y >= 12e3)).sort((e2, t2) => se(e2, Y) - se(t2, Y));
                if (!i.length || se(z, Y) >= 400) {
                    Ht = false;
                    jt = false;
                    jn = "not";
                    ne = "not";
                    Ny = "not";
                    ni == "autopush" && packet.send("a", undefined);
                    return false;
                }
                Y = Hg(Y.sid);
                const s = Y.x2 - i[0].x;
                const o = Y.y2 - i[0].y;
                const r = Y.x2 - z.x2;
                const a = Y.y2 - z.y2;
                const l = Y.x2 - Y.inTrap.x;
                const c = Y.y2 - Y.inTrap.y;
                const d = i[0].x - Y.inTrap.x;
                const u = i[0].y - Y.inTrap.y;
                const f = D(s * s + o * o);
                Qn = { x: s / f, y: o / f };
                const h = D(r * r + a * a);
                Wn = { x: r / h, y: a / h };
                const p = D(l * l + c * c);
                Yn = { x: l / p, y: c / p };
                const m = D(d * d + u * u);
                let g = { x: d / m, y: u / m };
                const y = [P(Qn.y, Qn.x), P(Yn.y, Yn.x), P(Wn.y, Wn.x)];
                const x = [(y[0] + y[1]) / 2, (y[0] + y[2]) / 2];
                const w = [{ x: U(x[0]), y: V(x[0]) }, { x: U(x[1]), y: V(x[2]) }];
                Jn = Qn.x * Wn.x + Qn.y * Wn.y;
                Xn = i[0]?.type == 1 ? (i[0].scale * .55, i[0].realScale = i[0].scale * .55) : i[0].scale;
                qn = i[0];
                jn = { x: Y.x2 + Qn.x * (Jn + Xn), y: Y.y2 + Qn.y * (Jn + Xn) };
                const b = B(z, jn);
                const v = se(z, jn);
                const k = Ay(b, B(z, Y));
                e = v <= 100 && k <= 2;
                let A = C.checkCollision2(Y, i[0]);
                let I = { x: Y.x2, y: Y.y2, scale: 35, "do": true };
                let S = e ? Q : Q.concat(I);
                let E = Date.now();
                Y3 = [];
                if (A) {
                    Fy();
                }
                if (Y.hitSpike && !zs.checked) {
                    jt = false;
                    Ht = false;
                    jn = "not";
                    Ny = "not";
                    ni == "autopush" && packet.send("a", undefined);
                    ne = "not";
                    return;
                }
                if (e) {
                    Oy();
                }
                if (!e) {
                    U3({
                        player: z,
                        target: { x: Y.x2 + Qn.x * (Jn + Xn + 35), y: Y.y2 + Qn.y * (Jn + Xn + 35) },
                        buildings: S,
                        clan: py
                    }).then((e2) => {
                        let t2 = e2;
                        Y = Hg(Y.sid);
                        Ht = false;
                        jt = true;
                        if (!t2) {
                            Ht = false;
                            jt = false;
                            jn = "not";
                            ne = "not";
                            Ny = "not";
                            return false;
                        }
                        n = Ax(E, 360, true);
                        if (!n) {
                            Ht = false;
                            jt = false;
                            jn = "not";
                            ne = "not";
                            Ny = "not";
                            Y3 = [];
                            return;
                        }
                    }).catch((e2) => {
                        jt = false;
                        Ht = false;
                        jn = "not";
                        return false;
                    });
                }
            }

            async function Fy() {
                if (Y && (Y.weaponR == 1 || Y.skinIndex != 6) && !p && (se(z.np.accel, Y.np.real, "player") <= x.weapons[ee].range || se(z, Y, "player") <= x.weapons[ee].range) && z.pr == 1 && en && (Y.weaponIndex == 11 && X.getAngleDist(B(z, Y) + W, Y.dir) > W / 3 || Y.weaponIndex != 11)) {
                    un = false;
                    p = true;
                    if (z.skinIndex != 11) equip(7, null);
                    else Rp(19, 1);
                    g[0] = B(z, Y);
                    ct = true;
                    packet.send("D", B(z, Y), "client");
                    packet.send("G", ee, true);
                    y = ee;
                    await A4();
                    equip(53, null);
                    await A4();
                    p = false;
                }
            }

            // ---- the A* worker (F3, 18991): grid search on a 900x900 window around you ----
            const F3 = "(" + (() => {
                const { sqrt: u, abs: f, floor: h } = Math;
                const { MAX_VALUE: p } = Number;
                const r = u(2);
                const m = 900;
                const g = 12;
                const y = g / 2;
                const t = JSON.stringify(new Array(Math.round(m / g)).fill([]));
                const x = JSON.parse(t).length;
                const w = [0, -1, 0, 1, -1, 0, 1, 0, 1, 1, 1, -1, -1, 1, -1, -1];
                const b = w.length;
                function v(e, t2, n, i) { return u((e - n) ** 2 + (t2 - i) ** 2); }
                function k(e, t2, n, i) {
                    const s = f(e - n);
                    const o = f(t2 - i);
                    return ((s === 0) + (o === 0)) * g + (s !== 0 && o !== 0) * g * r;
                }
                function A(s, o, r2, a, l) {
                    let e = JSON.parse(t), c = 0, d = 0;
                    for (let i = 0; i < x; i++) {
                        let t2 = e[i];
                        for (let e2 = 0; e2 < x; e2++) {
                            let n = t2[e2] = { x: i * g - m / 2 + s, y: e2 * g - m / 2 + o, obstacle: false, available: 1, n: i * x + e2 };
                            if (n.x < 0 || n.x > 14400 || n.y < 0 || n.y > 14400) { n.obstacle = 1; continue; }
                            for (let e3 = r2.length, t3; e3--, t3 = r2[e3];) {
                                if (n.obstacle = f(t3.x - n.x) <= t3.scale2 + 20 && f(t3.y - n.y) <= t3.scale2 + 20 && u((t3.x - n.x) ** 2 + (t3.y - n.y) ** 2) - t3.scale2 - 20 <= 0) break;
                            }
                            n.target = f(n.x - a) <= y && f(n.y - l) <= y;
                            c = n.target * n.n + !n.target * c;
                            n.start = f(n.x - s) <= y && f(n.y - o) <= y;
                            d = n.start * n.n + !n.start * d;
                            n.fCost = n.start * -p;
                            n.gCost = !n.start * p;
                            if (n.target + n.start > 0) continue;
                        }
                    }
                    return { map: e, targetNode: c, startNode: d };
                }
                onmessage = function (e) {
                    let { player: t2, target: s, buildings: n, clan: i } = e.data;
                    if (v(t2.x2, t2.y2, s.x, s.y) <= 0) return postMessage("reached target");
                    let { map: o, startNode: r2, targetNode: a } = A(t2.x2, t2.y2, n.filter((e2) => {
                        e2.scale2 = (e2.owner == null || e2.name == "sapling") && e2.type === 0 ? e2.scale * .7 : e2.dmg && !i.includes(e2?.owner?.sid) && e2?.owner?.sid != t2.sid ? e2.scale + 40 : e2.type === 1 && e2.y < 12e3 && (e2.teleport || e2.boostSpeed) ? e2.scale + 35 : e2["do"] ? e2.scale : e2.scale - 10;
                        return (e2.ignoreCollision ? e2.name === "pit trap" ? e2?.owner?.sid != t2.sid && !i.includes(e2.owner?.sid) : e2.name === "boost pad" || e2.name === "teleporter" : true) && v(e2.x, e2.y, t2.x2, t2.y2) < m;
                    }), s.x, s.y);
                    let l = [], c = [], d, u2 = 1e5;
                    l.push(r2);
                    while (l.length * u2--) {
                        let n2 = Infinity, i2;
                        for (let e2 = l.length, t3; e2--;) {
                            t3 = o[h(l[e2] / x)][l[e2] % x];
                            if (t3.fCost < n2) { d = t3; n2 = t3.fCost; i2 = e2; }
                        }
                        l.splice(i2, 1);
                        c.push(d.n);
                        if (d.target) break;
                        for (let t3 = 0, n3; t3 < b; t3++) {
                            n3 = o[h(d.n / x) + w[t3]]?.[d.n % x + w[t3 + 1]];
                            if (!n3 || c.includes(n3.n)) continue;
                            let e2 = d.gCost + k(w[t3], w[t3 + 1], 0, 0);
                            if (!n3.obstacle && n3.available === 1) {
                                if (!l.includes(n3.n)) {
                                    n3.parent = d.n;
                                    n3.gCost = e2;
                                    n3.hCost = v(n3.x, n3.y, s.x, s.y);
                                    n3.fCost = e2 + n3.hCost;
                                    l.push(n3.n);
                                } else if (e2 < n3.gCost) {
                                    n3.parent = d.n;
                                    n3.gCost = e2;
                                    n3.fCost = e2 + n3.hCost;
                                }
                            }
                        }
                    }
                    if (u2 === 0) return postMessage("reached max iterations");
                    if (!l.length) return postMessage("couldn't reach target");
                    l = [];
                    while (!d.start) {
                        l.push(d.y, d.x);
                        d = o[h(d.parent / x)][d.parent % x];
                    }
                    postMessage(l.reverse());
                };
            }).toString() + ")();";
            const _3 = [], V3 = [];
            // The bundle posted JSON.parse(JSON.stringify(o)); the worker only reads
            // these fields, so only these are copied (our objects hold references
            // back into the game state that don't serialize).
            function workerMessage(o) {
                const pl = o.player || {};
                return {
                    player: { x2: pl.x2, y2: pl.y2, sid: pl.sid },
                    target: { x: o.target.x, y: o.target.y },
                    buildings: (o.buildings || []).map((e) => ({
                        x: e.x, y: e.y, scale: e.scale, name: e.name, type: e.type, dmg: e.dmg,
                        ignoreCollision: e.ignoreCollision, teleport: e.teleport, boostSpeed: e.boostSpeed,
                        "do": e["do"], owner: e.owner == null ? null : { sid: e.owner.sid }
                    })),
                    clan: Array.isArray(o.clan) ? o.clan.slice() : []
                };
            }
            function U3(o) {
                return new Promise((n, t) => {
                    o = workerMessage(o);
                    let i = -1;
                    for (let e = 0; e < V3.length; e++) {
                        if (V3[e]) { i = e; V3[e] = false; _3[e].postMessage(o); break; }
                    }
                    if (i === -1) {
                        j3();
                        i = _3.length - 1;
                        V3.push(false);
                        _3[i].postMessage(o);
                    }
                    function e(e2) {
                        let t2 = false;
                        if (typeof e2.data === "string") { Y3 = []; t2 = false; }
                        else { Y3 = e2.data; t2 = e2.data.length > 0; }
                        H3(_3[i]);
                        n(t2);
                    }
                    function s(e2) { t(e2); }
                    _3[i].onmessage = e;
                    _3[i].onerror = s;
                });
            }
            function j3() {
                let e = new Blob([F3]);
                let t = URL.createObjectURL(e);
                e = new Worker(t);
                _3.push(e);
                V3.push(true);
            }
            function H3(t) {
                for (let e = _3.length; e--;) {
                    if (_3[e] === t) { V3[e] = true; return; }
                }
            }
            ctx.onCleanup(() => { for (const w of _3) { try { w.terminate(); } catch (e) { /* ignore */ } } });

/* ===== examplescript/60-combat.js ===== */
            // =====================================================================
            // COMBAT — the tail of the bundle's updatePlayers (15985-16413) and
            // everything it calls, 1-1. ctx.combat runs the tick in the bundle's
            // order and calls in here at the same points the bundle ran this code.
            // =====================================================================

            // ---- aim helpers: the direction that hits the most buildings (wg/bg/vg) ----
            function wg(s, t, e = Q) {
                let o = e.filter((e2) => se(z, e2, "object") <= t);
                let r = B(z, s);
                let a = [s];
                let l = 0;
                let c2 = 0;
                for (let t2 = 0; t2 < 36; t2++) {
                    let n = B(z, s) + Z(t2 * 10);
                    let i = [];
                    let e2 = o.reduce((e3, t3) => {
                        if (X.getAngleDist(B(z, t3), n) <= h && X.getAngleDist(B(z, s), n) <= h) { i.push(t3); return e3 + 1; }
                        return e3;
                    }, 0);
                    if (X.getAngleDist(B(z, s), n) <= h) {
                        if (e2 > c2) { c2 = e2; r = n; a = i; }
                    }
                    if (e2 > l) l = e2;
                }
                Wi.push(a);
                Wi = Wi.flat();
                return r;
            }
            function bg(o, t, e = Q) {
                let r = e.filter((e2) => se(z, e2, "object") <= t);
                let a = B(z, o);
                let l = [o];
                if (r.length > 1) {
                    let s = 0;
                    for (let t2 = 0; t2 < 36; t2++) {
                        let n = B(z, o) + Z(t2 * 10);
                        let i = [];
                        let e2 = r.reduce((e3, t3) => {
                            if (X.getAngleDist(B(z, t3), n) <= h && X.getAngleDist(B(z, o), n) <= h) { i.push(t3); return e3 + 1; }
                            return e3;
                        }, 0);
                        if (e2 > s) { s = e2; a = n; l = i; }
                    }
                }
                Wi.push(l);
                Wi = Wi.flat();
                return a;
            }
            function vg(o, t, e = Q) {
                let r = e.filter((e2) => se(z, e2, "object") <= t);
                let a = B(z, o);
                let l = [o];
                if (r.length > 1) {
                    let s = 0;
                    for (let t2 = 0; t2 < 36; t2++) {
                        let n = B(z, o) + Z(t2 * 10);
                        let i = [];
                        let e2 = r.reduce((e3, t3) => {
                            if (X.getAngleDist(B(z, t3), n) <= h && X.getAngleDist(B(z, o), n) <= h) { i.push(t3); return e3 + 1; }
                            return e3;
                        }, 0);
                        if (e2 > s) { s = e2; a = n; l = i; }
                    }
                }
                Wi.push(l);
                Wi = Wi.flat();
                return a;
            }
            function xg(e, t) { const n = e.concat(t); return n.filter((t2, e2, n2) => e2 === n2.findIndex((e3) => e3.sid === t2.sid)); }
            function kg(e, t) { const n = e.x2 - t.x; const i = e.y2 - t.y; return n * n + i * i; }
            function Ag(e, t, n) {
                const i = t.reduce((e2, t2) => e2 + t2.x, 0) / t.length;
                const s = t.reduce((e2, t2) => e2 + t2.y, 0) / t.length;
                const o = P(s - e.y2, i - e.x2);
                if (!n) return o;
                if (n) return { x: i, y: s };
            }
            function Ig(e, t, n) {
                const i = t.reduce((e2, t2) => e2 + t2.x2, 0) / t.length;
                const s = t.reduce((e2, t2) => e2 + t2.y2, 0) / t.length;
                const o = P(s - e.y2, i - e.x2);
                if (!n) return o;
                if (n) return { x: i, y: s };
            }

            // ---- Tg (15793): which nearby buildings an enemy will break this tick ----
            function Tg(n, e) {
                Q.forEach((e2) => { e2.assumeBreak = false; });
                for (let e2 = 0; e2 < J.length; e2++) {
                    if (!J[e2].visible || z.sid === J[e2].sid) continue;
                    n = J[e2];
                    n.bDmg = n?.secondary === 10 && (n.sr === 1 || Bi && _y(n, Bi) === 1) ? {
                        dmg: 10 * (En[n.secondaryVar] * 7.5 * 3.3),
                        wep: 10
                    } : n?.primary && (n?.pr === 1 || n.weaponIndex == n.primary && Bi && _y(n, Bi) === 1) ? {
                        dmg: x.weapons[n?.primary]?.dmg * 3.3 * En[n.primaryVar],
                        wep: n.primary
                    } : 0;
                    if (n.bDmg === 0) continue;
                    for (let t = 0; t < Q.length; t++) {
                        if (Q[t].type !== null || !Q[t]?.owner?.sid) continue;
                        let e3 = se(n, Q[t], "object") <= x.weapons[n.bDmg.wep].range;
                        e3 && (!Q[t].dmgpot || Q[t].dmgpot < n.bDmg.dmg) && (Q[t].dmgpot = n.bDmg.dmg);
                        if (Q[t].dmgpot >= Q[t].health && e3) { Q[t].assumeBreak = true; continue; }
                    }
                }
            }
            // ---- Cg (15820): hit-back damage you take hitting a spiked hat / tail ----
            function Cg(t, n, i, s, o, e, r, a, l, c2, d2, u2) {
                if (!vn.length) return;
                for (let e2 = vn.length; e2--;) {
                    if (vn[e2].skinIndex == 11 || vn[e2].tailIndex == 21 || vn[e2].tailIndex == 16) {
                        a = B(z, vn[e2]);
                        if (se(z, vn[e2], "player") <= x.weapons[n].range && X.getAngleDist(a, t) <= h) {
                            l = x.weapons[n].dmg * (C0.find((e3) => e3.id === s)?.dmgMultO || 1) * (B0.find((e3) => e3.id === o)?.dmgMultO || 1) * En[i];
                            d2 = vn[e2].skinIndex === 11 ? .45 : 0;
                            u2 = vn[e2].tailIndex === 21 ? .25 : vn[e2].tailIndex === 16 ? .15 : 0;
                            c2 = l * (d2 + u2);
                            if (n === 10 && z.sr === 1 || n != 10 && z.pr === 1) U1.showText(vn[e2].x2, vn[e2].y2, 20, .18, 300, c2, "#fff");
                        }
                    }
                }
            }
            // ---- Bg (15838): mark the buildings your swing in direction e breaks ----
            function Bg(e, n, i, s, o, t, r, a, l) {
                for (let t2 = 0; t2 < Q.length; t2++) {
                    a = B(z, Q[t2]);
                    if (se(z, Q[t2], "object") <= x.weapons[n].range && X.getAngleDist(a, e) <= h && Q[t2].type === null) {
                        l = x.weapons[n].dmg * (n === 10 ? 7.5 : 1) * (s === 40 ? 3.3 : 1) * En[i];
                        let e2 = (n === 10 && z.sr === 1 || n != 10 && z.pr === 1) && Q[t2].dmgpot + l >= Q[t2].health;
                        if (o && !e2) Wi.push(Q[t2]);
                        if (e2) {
                            Q[t2].assumeBreak = true;
                            Q[t2].manualBreak = true;
                            Wi.push(Q[t2]);
                        }
                    }
                }
            }

            // ---- Rg (15876): step projectiles, predict next-tick hits ----
            function Rg(e) {
                combat.stepProjectiles(function (proj, hitNow) {
                    if (hitNow) {
                        if (oo.checked) b(`${proj.info.src}[${proj.owner.sid}] has hit ${proj.hit.name} [${proj.hit.sid}] on ${v}`, "", "red");
                        return;
                    }
                    if (z.sid == proj.futureHit.sid) b(`updated projectile dmgpot`, "", "red");
                    if (oo.checked) b(`${proj.futureHit.name}[${proj.futureHit.sid}] getting hit next tick ${v + 1} by ${proj.info.src}[${proj.owner.sid}]`, "", "red");
                    if (proj.owner.sid != z.sid && te(proj.owner.sid) && Y && proj.futureHit.sid == Y.sid) {
                        U1.showText(Hg(proj.futureHit.sid).x2, Hg(proj.futureHit.sid).y2, 20, .18, 300, "sync ally proj hit", "#fff");
                        if (ee == 5 && Y && !p && (se(z.np.accel, Y.np.real, "player") <= x.weapons[ee].range || se(z, Y, "player") <= x.weapons[ee].range) && z.pr == 1 && z.sr == 1 && en && o4(z, Y)) {
                            un = false;
                            p = true;
                            equip(7, null);
                            g[0] = B(z, Y);
                            ct = true;
                            packet.send("D", B(z, Y), "client");
                            packet.send("G", ee, true);
                            y = ee;
                            setTimeout(() => { p = false; }, 120);
                        }
                    }
                });
            }

            // ---- Vg (16464): autohat — and, with t, the hat/tail you WOULD wear ----
            function Vg(t, e = Dn) {
                if (Ot && !z.dmgpot.soldier && !t) return;
                let n = Y && se(z, Y) <= li && !z.inWater && js.checked ? true : false;
                let i = Y && se(z, Y) <= li && !Ws.checked ? 19 : 11;
                if (!js.checked) {
                    if (z.dmgpot?.add >= 100 || z.dmgpot?.secondary >= 100 || z.dmgpot?.soldier || e === undefined) {
                        if (t) return { skinIndex: 6, tailIndex: Ws.checked ? 11 : 19 };
                        n = true;
                    }
                }
                if (Hs.checked || t) {
                    if (!z.antiOneTickBowInsta && z.doAssassin) {
                        equip(56, null);
                        if (t) return { skinIndex: 56, tailIndex: 0 };
                    } else {
                        if (!z.antiOneTickBowInsta && !z.hitting && S0.style.display == "none" && !At) {
                            if (!Sg.length && !(et >= 2 && !z.dmgpot.soldier) && (e === undefined || n || Nt && Ds.checked) && !z.doAssassin || !n && i === 19) {
                                let skinId = 6;
                                if (!n && i === 19) skinId = b5(1).skinIndex;
                                equip(null, i);
                                setTimeout(() => { equip(skinId, null); }, 1000 / 9);
                                if (t) return { skinIndex: skinId, tailIndex: i };
                            } else if (!wn && !Sg.length && !(et >= 2 && !z.dmgpot.soldier) && !z.doAssassin) {
                                if (t) return b5(1);
                                b5();
                            } else if (et >= 2 && !z.antiOneTickBowInsta && !wn) {
                                if (t) return { skinIndex: 7, tailIndex: z.tailIndex };
                                equip(7, null);
                            } else if (!wn) {
                                if (t) return { skinIndex: 22, tailIndex: 11 };
                                equip(22, null);
                            }
                        }
                        if (t) return b5(1);
                    }
                }
            }
            // ---- b5 (21945): biome hat (snow / water / booster) + monkey tail ----
            function b5(e) {
                const accessoryId = 11;
                equip(null, accessoryId);
                let hatId;
                if (z.y2 <= K.snowBiomeTop) hatId = 15;
                else if (z.inWater) hatId = 31;
                else hatId = 12;
                if (e) return { skinIndex: hatId, tailIndex: accessoryId };
                setTimeout(() => { equip(hatId, accessoryId); }, 1000 / 9);
            }
            function Ug(e) { if (Fi) equip(Fi, null); }

            // ---- $y (18292): after an enemy turret-gear shot, soldier for 3 ticks ----
            async function $y() {
                if (wn) {
                    equip(6, null);
                    await A4();
                    await A4();
                    await A4();
                    wn = false;
                }
            }
            own(combat.onProjectile(function (info) {
                if (info.turretGearShot) { wn = 1; $y(); }
            }));

            // ---- A5 (21983): reload the weapon that isn't loaded while idle ----
            function A5(e = x.weapons) {
                if (Nt || p || g[0] !== null || z.pr === 1 && z.sr === 1 && k5[0] || y || !en || m.lc || m.rc || m.mc || hn || Oi) return;
                if (z.sr != 1) {
                    if (z.weaponIndex != A || z.buildIndex != -1) packet.send("G", A, true);
                    y = A;
                    k5[1] = true;
                }
                if (z.pr != 1 && (z.sr == 1 || A === null)) {
                    if (z.weaponIndex != ee || z.buildIndex != -1) packet.send("G", ee, true);
                    y = ee;
                    k5[1] = true;
                }
            }
            // ---- t3 (18379): hold the fastest weapon ----
            function t3(e, t) {
                if (!Ms.checked) return;
                t = x.weapons[ee]?.spdMult >= x.weapons[A]?.spdMult || A == null ? t = ee : t = A;
                if (e && z.buildIndex != -1) return t;
                if (p || Mt || hn || y || gt || z.pr != 1 || z.sr != 1 || z.hitting || At || Ct || z.buildIndex != -1) return;
                if (z.weaponIndex != t) packet.send("G", t, true);
                if (e) return t;
            }
            function n3() {
                return l4(z, 0, { buildIndex: -1, weaponIndex: z.weaponIndex, skinIndex: z.skinIndex, tailIndex: z.tailIndex, y2: z.y2, zIndex: null });
            }

            // ---- s4 (23157): finish an animal you can kill in one hit ----
            async function s4(e, t) {
                if (p || !en) return;
                e = bh.filter((e2) => e2.health < x.weapons[ee].dmg * (Nn.includes(7) ? 1.5 : 1) * En[z.primaryVar] && e2.visible);
                e = e.sort((e2, t2) => t2.killScore - e2.killScore)[0];
                if (e && se(z, e) - 1.8 * e.scale <= x.weapons[ee].range && z.pr == 1) {
                    console.log(e);
                    p = true;
                    packet.send("K", 1);
                    g[0] = B(z, e);
                    packet.send("G", ee, true);
                    equip(7, null);
                    packet.send("D", B(z, e), "client");
                    await A4();
                    p = false;
                }
            }

            // ---- P5 (22412): the "r" (normal) / "R" (reverse) insta ----
            async function P5(e) {
                if (!e || fn && ee == 5) return;
                if (!Y) return;
                if (z.secondary != 13 && ((ee == 4 || ee == 5) && A == 10) && Y.skinIndex != 6 && Y && !p && (se(z.np.accel, Y.np.real, "player") <= x.weapons[A].range || se(z, Y, "player") <= x.weapons[A].range) && z.pr == 1 && z.sr == 1 && en && o4(z, Y)) {
                    un = false;
                    p = true;
                    equip(53, null);
                    g[0] = B(z, Y);
                    ct = true;
                    packet.send("D", B(z, Y), "client");
                    packet.send("G", A, true);
                    y = A;
                    await A4();
                    if (Y) {
                        y = ee;
                        packet.send("G", ee, true);
                        g[0] = B(z, Y);
                        packet.send("D", B(z, Y), "client");
                        equip(7, null);
                    } else {
                        p = false;
                        return;
                    }
                    await A4();
                    p = false;
                }
                if (z.secondary != 13 && !((ee == 4 || ee == 5) && A == 10) && Y && !p && (se(z.np.accel, Y.np.real, "player") <= x.weapons[ee].range || se(z, Y, "player") <= x.weapons[ee].range) && z.pr == 1 && z.sr == 1 && en && o4(z, Y)) {
                    un = false;
                    console.log(se(z.np.accel, Y.np.real, "player"));
                    p = true;
                    equip(7, null);
                    g[0] = B(z, Y);
                    ct = true;
                    packet.send("D", B(z, Y), "client");
                    packet.send("G", ee, true);
                    y = ee;
                    await A4();
                    if (Y) {
                        y = A;
                        packet.send("G", A, true);
                        g[0] = B(z, Y);
                        packet.send("D", B(z, Y), "client");
                        equip(53, null);
                    } else {
                        p = false;
                        return;
                    }
                    await A4();
                    p = false;
                }
                if (z.secondary == 13 && Y && !p && (se(z.np.accel, Y.np.real, "player") <= x.weapons[ee].range || se(z, Y, "player") <= x.weapons[ee].range) && z.pr == 1 && z.sr == 1 && en && o4(z, Y)) {
                    un = false;
                    p = true;
                    y = A;
                    packet.send("G", A, true);
                    g[0] = B(z, Y);
                    packet.send("D", B(z, Y), "client");
                    equip(53, null);
                    await A4();
                    if (Y) {
                        equip(7, null);
                        g[0] = B(z, Y);
                        ct = true;
                        packet.send("D", B(z, Y), "client");
                        packet.send("G", ee, true);
                        y = ee;
                    } else {
                        p = false;
                        return;
                    }
                    await A4();
                    p = false;
                }
            }

            // ---- sy (16655): kbInsta (turret gear + polearm knockback into a spike) ----
            async function sy(e) {
                if (!Y || ee != 5 || z.tr != 1 || z.pr != 1 || p || Mt || !to.checked) return;
                if (Y && Vy(z, Y, x.weapons[ee].range, true) && o4(z, Y) && !Y?.inTrap) {
                    let e2 = [v3(Y, B(z.np.real, Y.np.real), se(Y, Y.KB.fpriTKB), true, 1), v3(Y, B(z.np.real, Y.np.real), se(Y, Y.KB.fsecKB), true, 1)];
                    if (!e2[0]) return;
                    let t = { newPos: { ...Y } };
                    let n = Ne(Y.np.real.x - e2[0].x, Y.np.real.y - e2[0].y);
                    let i = P3(Y.np.real.x, Y.np.real.y, B(z, Y), j(n, 170));
                    t.newPos.NEWX = i.x;
                    t.newPos.NEWY = i.y;
                    t.originDir = B(z, Y);
                    t.newPos.dstSpd = n;
                    t.newPos["static"] = true;
                    t.newPos.expire = 3;
                    m3(t.newPos);
                    b(`KnockBack Insta on ${Y.name}[${Y.sid}]`, "", "#5c0620", false, true);
                    hn = true;
                    p = true;
                    equip(53, null);
                    g[0] = B(z, Y);
                    ct = true;
                    packet.send("G", A, true);
                    y = A;
                    await A4();
                    if (Y) {
                        p = true;
                        hn = false;
                        y = ee;
                        packet.send("G", ee, true);
                        g[0] = B(z, Y);
                        packet.send("D", B(z, Y), "client");
                        equip(7, null);
                    } else {
                        p = false;
                        return;
                    }
                    await A4();
                    p = false;
                }
            }

            // ---- jx (21097): spike tick ("aids spike sync"). kn is never filled in
            // the bundle, so this only ever clears it. ----
            function jx(t, n, i, s) {
                if (!Y || z.pr != 1 || p || !ko.checked || hn) return;
                if (ee == 3 || ee == 4 || ee == 5) {
                    for (let e = kn.length - 1; e >= 0; e--) {
                        t = kn[e];
                        if (!L3(z, t)) { kn.splice(e, 1); continue; }
                        n = C.checkItemLocation2(t.x, t.y, x.list[ly].scale, .6, t.id, false);
                        if (!n) { kn.splice(e, 1); continue; }
                        console.log(t);
                        if (n && !p && se(z, t) <= 126 && se(Y, t) <= t.scale + 35 && se(z, Y, "player") <= x.weapons[ee].range) {
                            i = Wx(x.list[ly], B(z, t), t);
                            console.log("n", i);
                            if (!i) { kn.splice(e, 1); continue; }
                            kn.splice(e, 1);
                            b(`Spike tick on ${Y.name}[${Y.sid}]`, "", "#5c0620", false, true);
                            c4(z.items[2], B(z, t));
                            p = true;
                            s = B(z, Y);
                            g[0] = s;
                            packet.send("D", s, "client");
                            ct = true;
                            equip(7, null);
                            y = ee;
                            packet.send("G", ee, true);
                            setTimeout(() => { p = false; ct = false; y = null; }, 111);
                        }
                    }
                    kn = [];
                }
            }

            // ---- Qx (21169): polearm aids — trap break + spike sync (TA) ----
            async function Qx(t, n, i, s, o) {
                if (!fo.checked || !Y || A != 10 || !Y?.inTrap || gt || p || hn || jt || z.sr != 1 || z.pr != 1) return;
                if (ee == 3 || ee == 4 || ee == 5) {
                    let e;
                    n = Y.inTrap;
                    t = B(z, n);
                    i = 75 * En[z.secondaryVar] * (Nn.includes(40) ? 3.3 : 1) >= n.health;
                    s = x.weapons;
                    o = [se(z, n, "object"), se(z, Y, "player")];
                    if (o[0] <= s[A].range && o[1] <= s[ee].range && Wx(x.list[ly], t, n) && o4(z, Y) && i && (ee == 5 && z?.primaryVar == 1 || ee == 4 && z?.primaryVar > 1 ? Y.weaponR == 1 && Y.weaponIndex <= 10 : true) && z.tailIndex != 11) {
                        gt = true;
                        if (z?.dmgpot?.soldier && Y.pr == 1 && z?.dmgpot?.shouldHeal && [4, 5].includes(Y?.primary)) {
                            b(`Cancelled TA due to spike sync threat`, "", "#5c0620", false, true);
                            equip(6, null);
                        } else {
                            equip(40, null);
                        }
                        g[0] = t;
                        packet.send("D", t);
                        ct = true;
                        y = A;
                        z.hitting = true;
                        packet.send("G", A, true);
                        Mt = true;
                        b(`TA on ${Y.name}[${Y.sid}]`, "", "#5c0620", false, true);
                        await A4();
                        b(`${Y.health}`, "", "#5c0620", false, true);
                        gt = false;
                        p = true;
                        y = ee;
                        if (z?.dmgpot?.soldier && Y.pr == 1 && z?.dmgpot?.shouldHeal && [4, 5].includes(Y?.primary)) {
                            b(`Cancelled TA due to spike sync threat`, "", "#5c0620", false, true);
                            equip(6, null);
                        } else {
                            equip(7, null);
                        }
                        packet.send("G", ee, true);
                        t = B(z, n);
                        z.hitting = true;
                        g[0] = t;
                        packet.send("D", B(z, Y));
                        c4(ly, t + Z(15), ee);
                        c4(ly, t - Z(15), ee);
                        c4(ly, B(z, Y), ee);
                        packet.send("D", B(z, Y));
                        packet.send("G", ee, true);
                        await A4();
                        ct = false;
                        y = null;
                        Mt = false;
                        g[0] = null;
                        p = false;
                    }
                }
            }
            // ---- Yx (21224): polearm aids with a diamond+ polearm (PA) ----
            async function Yx(e, t, n, i, s, o) {
                if (ee != 5 || z.primaryVar < 2 || !fo.checked || !Y || A != 10 || !Y?.inTrap || gt || p || hn || jt || z.sr != 1 || z.pr != 1) return;
                let r;
                t = Y.inTrap;
                e = B(z, t);
                n = 75 * En[z.secondaryVar] * (Nn.includes(40) ? 3.3 : 1) >= t.health;
                i = 75 * En[z.secondaryVar] * (Nn.includes(40) ? 3.3 : 1) + (Y.secondary == 10 ? 75 : x.weapons[Y.primary].dmg) * En[z.secondary == 10 ? Y.secondaryVar : Y.primaryVar] * 3.3 >= t.health;
                s = x.weapons;
                o = [se(z, t, "object"), se(z, Y, "player")];
                if (o[0] <= s[A].range && o[1] <= s[ee].range && Wx(x.list[ly], e, t) && o4(z, Y) && z.tailIndex != 11) {
                    if (n) {
                        gt = true;
                        equip(40, null);
                        g[0] = e;
                        packet.send("D", e, "client");
                        ct = true;
                        y = A;
                        z.hitting = true;
                        packet.send("G", A, true);
                        Mt = true;
                        b(`PA on ${Y.name}[${Y.sid}]`, "", "#5c0620", false, true);
                        Bg(e, A, z.secondaryVar, 40, 1);
                        await A4();
                        p = true;
                        y = ee;
                        equip(7, null);
                        packet.send("G", ee, true);
                        e = B(z, t);
                        z.hitting = true;
                        g[0] = e;
                        packet.send("D", B(z, Y), "client");
                        c4(ly, e + Z(15), ee);
                        c4(ly, e - Z(15), ee);
                        c4(ly, B(z, Y), ee);
                        c4(ly, e, ee);
                        packet.send("D", B(z, Y), "client");
                        packet.send("G", ee, true);
                        await A4();
                        ct = false;
                        gt = false;
                        y = null;
                        Mt = false;
                        g[0] = null;
                        p = false;
                    }
                }
            }

            // ---- Nx (20756): NumpadMultiply projectile insta (Mx / Tx) ----
            function Tx(e, t, n = 53) { return { buildIndex: t, weaponIndex: e, skinIndex: n, tailIndex: 0, y: z.y2, zIndex: null }; }
            function Mx(e, t, n, l, i, c2 = []) {
                const s = { buildIndex: -1, weaponIndex: 0, skinIndex: [e, 53, 7][l] || 0, tailIndex: 0, y: z.y2, zIndex: null, sid: z.sid };
                const o = l === 2 ? 2 : 3;
                const d2 = Array.from({ length: o }, (e2, t2) => ({
                    ...s,
                    ...l === 0 || l === 1 ? { weaponIndex: [A, ee, ee][t2], buildIndex: t2 === 2 ? 3 : -1 } : {},
                    ...l === 2 ? { tailIndex: t2 === 0 ? 19 : 0, weaponIndex: ee } : {}
                }));
                const r = (i2, e2, s2, t2) => {
                    console.log(t2);
                    const o2 = !t2 ? z : { t1: t2.t1 || 0, t2: t2.t2 || 0, t3: l === 2 ? t2 : 0 };
                    console.log(o2, o2);
                    for (const r2 of n) {
                        const a = l4(z, r2, { ...d2[i2] });
                        let e3 = s2 ? a.decel : a.accel;
                        (!l || l === 1) && console.log(se(e3, Y.np.real));
                        const t3 = l === 2 ? se(e3, Y.np.real, "player") : se(e3, Y.np.real);
                        let n2 = {
                            pos: a, move: s2 ? undefined : r2, ...d2[i2], distance: t3, x2: a.x, y2: a.y, sid: z.sid,
                            xVel: a.xVel, yVel: a.yVel, type: s2 ? "decel" : "accel", ...o2
                        };
                        console.log(`distance: ${t3}`);
                        (!l || l === 1) && t3 >= x.projectiles[1].speed * 111 + 35 && c2.push(n2);
                        l === 2 && t3 <= x.weapons[ee].range && c2.push(n2);
                    }
                };
                for (const u2 of Kt) {
                    if (u2 == 11 && l === 2) continue;
                    for (let t2 = 0; t2 < o; t2++) {
                        d2[t2].tailIndex = u2;
                        i ? i.forEach((e2) => r(t2, u2, false, e2)) : r(t2, u2);
                    }
                }
                if (!l) return c2;
                if (l === 1) return Mx(7, x.weapons[ee].range, n, 2, c2);
                const a = x.projectiles[1].speed * 111 + 35 + x.weapons[ee].range;
                c2.length && (c2 = c2.reduce((e2, t2) => {
                    const n2 = t2.t2.distance + t2.t3.distance;
                    const i2 = e2.t2.distance + e2.t3.distance;
                    const s2 = Math.abs(i2 - a);
                    const o2 = Math.abs(n2 - a);
                    return o2 < s2 ? t2 : e2;
                }));
                return c2 || null;
            }
            async function Nx(t, e, n, i, s, o, r) {
                if (!Y || ee != 5 || p || !fn) { hn = false; return; }
                t = x.projectiles[1].speed * 111 + 35;
                e = se(z, Y);
                n = [B(z, Y), B(Y, z), undefined];
                s = Gt.map((e2) => Mx(e2, t, n, 0));
                console.log(s);
                o = Mx(53, t, n, 1, s);
                hn = true;
                if (o.move && z.tr === 1 && z.pr === 1) {
                    fn = false;
                    console.log(o);
                    r = o.t1;
                    equip(r.skinIndex, null);
                    packet.send("G", r.weaponIndex, true);
                    packet.send("a", r.move, "pathfinder");
                    await A4();
                    r = o.t2;
                    ct = true;
                    g[0] = B(z, Y);
                    y = ee;
                    U1.showText(z.x2, z.y2, 50, .3, 1e3, se(o.t2, z), "#fff");
                    packet.send("G", r.weaponIndex, true);
                    equip(53, null);
                    packet.send("a", r.move, "pathfinder");
                    await A4();
                    r = o;
                    hn = false;
                    p = true;
                    ct = true;
                    y = ee;
                    U1.showText(z.x2, z.y2, 50, .3, 1e3, se(o.t2, z), "#fff");
                    packet.send("G", r.weaponIndex, true);
                    g[0] = B(z, Y);
                    packet.send("D", B(z, Y));
                    packet.send("a", r.move, "pathfinder");
                    equip(7, null);
                    await A4();
                    p = false;
                    y = null;
                    packet.send("a", null);
                    U1.showText(z.x2, z.y2, 50, .3, 1e3, se(o, z), "#fff");
                } else if (e < t) {
                    Dn != n[1] && packet.send("a", n[1], "pathfinder");
                } else if (e > t) {
                    Dn != n[0] && packet.send("a", n[0], "pathfinder");
                }
            }

            // ---- Iy (16870): autobuy (sandbox only, store closed) ----
            function Iy() {
                if (Nn.length + On.length >= 66 || !en || !_n || S0.style.display != "none" || !Qs.checked) return;
                if (Fn.length) {
                    if (!Array.isArray(Fn[0]) && z.points >= C0.find((e) => e.id == Fn[0]).price) Mp(Fn[0], 0);
                    if (Array.isArray(Fn[0]) && z.points >= B0.find((e) => e.id == Fn[0][0]).price) Mp(Fn[0][0], 1);
                }
                if (Fn.length == 0 && Nn.length != C0.length - 1) {
                    let e = C0.find((e2) => e2.id != 45 && !Nn.includes(e2.id) && z.points >= e2.price);
                    if (e) Mp(e.id, 0);
                    let t = B0.find((e2) => !On.includes(e2.id) && z.points >= e2.price);
                    if (t) Mp(t.id, 1);
                }
            }
            // e3 (18340): the bot "clear buildings" highlight; without bots it only resets
            function e3() {
                if (!ie.length || !Ut) { Ut = null; Vt = null; return; }
            }
            function setNt(val) { Nt = val; combat.state.Nt = val; }

            // =====================================================================
            // THE TICK — hooks at the bundle's points in updatePlayers
            // =====================================================================
            own(combat.onPreTick(function () {
                sync();
                Qe = 0;
                At = false;
                $y();
                Ot = false;
            }));
            own(combat.onTickStart(function () {
                sync();
                if (!(v % 9)) {
                    Ye.push(He);
                    if (Ye.length > 5) Ye.shift();
                    ze = c(Ye.reduce((e, t) => e + t) / Ye.length);
                    He = 0;
                }
                ss.length = ns.length = is.length = 0;
                y = null;
            }));
            own(combat.onPostReconstruct(function () {
                sync();
                rm();
                yy();
                if (z.d1 == z.dir && z.d2 == z.dir && g[0] === null) ct = false;
                z.shameLeak = false;
                Og();
            }));
            own(combat.onAfterSleep(function () {
                sync();
                $e = $e.filter((e) => C.checkItemLocation(e.x, e.y, e.scale, .6, e.id, false) && v - e.sid <= 3);
                os = [];
                qm = false;
            }));
            own(combat.onAfterPlayers(function () {
                sync();
                if (Ts.checked && pingNow() >= 95) {
                    z.Qheal = false;
                    if (en && z?.dmgpot?.add + z?.dmgpot?.turretGear >= 100 && z.shameCount < 7 && !z.shameLeak) {
                        p4();
                        b(`AutoQ`, "", "#5c0620", false, true);
                        z.Qheal = true;
                    } else if ((!_n && (z.health < 85 || z.shameCount > 0 && z.health < 100) || _n && z.health < 100) && en && z.skinIndex != 45) {
                        setTimeout(() => {
                            if (Ts.checked && z.health < 100 && (z.health > z.dmgpot?.hp * (z.skinIndex == 6 && !z.hitting && !p ? .75 : 1) || z.shameCount >= 7)) u4();
                        }, 120 - xt + 9);
                    }
                }
                if (en && zi.length > 0) {
                    Gi = zi.reduce((e, t) => e + S(t.value), 0);
                    U1.showText(zi[0].x, zi[0].y, 50, .18, 500, Gi, "#8ecc51");
                    zi = [];
                }
                if (!z.dmgpots) z.dmgpots = [];
            }));
            own(combat.onFrame(function () {
                sync();
                z.antiOneTickBowInsta = false;
                z.hitting = false;
                z.movSpd != 0 && (z.invisTime = 1e3);
                z.movSpd == 0 && (z.invisTime -= z.delta);
                // k4() ran in the engine just before this hook
                if (!ie.length || !G["do"]) es2Reset();
                h3();
                Ei = ie.map((e) => e?.sid);
                ri?.setBuildings(kh);
            }));
            function es2Reset() { ts.players = []; ts.bot = null; ts.builds = []; ts.realBuilds = []; }
            own(combat.onFrameLate(function () {
                sync();
                ri?.setSpeed(55 * x4(z));
                L5(ly, 1, 0, W / ls.value);
                let t = p == true || z.hitting ? true : false;
                e3();
                Yt = Yt.filter((t2) => v - t2.TICK <= 200 && !L3(z, t2) && !ie.find((e) => L3(e, t2)));
                s4();
                P5(un);
                Rg();
                cn = cn.filter((e) => v - e.destroyedAt <= 2);
                let i;
                for (let e = vn.length; e--;) {
                    if (i = vn[e]) {
                        if (i.distance <= 275) ss.push(i);
                        i.kbpot = w5(i, z, B(i, z));
                        i.KB = w5(z, i, B(z, i));
                        i.placePot = i.distance <= 300 ? O5(i, i.loadout.spike.id, B(i, z)) : { onPlayer: [], possible: [], placeRange: null };
                        i.dmgpot = m5(i);
                        i.inTrap = false;
                        i.globalTrap = false;
                        for (let e2 = Xt.length; e2--;) {
                            if (Xt[e2].name === "pit trap" && S4(i, Xt[e2]) <= 47 && te(Xt[e2]?.owner?.sid)) { i.inTrap = Xt[e2]; break; }
                        }
                        for (let e2 = Xt.length; e2--;) {
                            if (Xt[e2].name === "pit trap" && S4(i, Xt[e2]) <= 47 && (te(Xt[e2]?.owner?.sid) || !i.team && Xt[e2]?.owner?.sid != i.sid)) { i.globalTrap = Xt[e2]; break; }
                        }
                        if (i.inTrap) i.inTrap.angToMe = B(z, i.inTrap);
                        const o = B(z, i), e2 = se(z, i);
                        // anti boost: an enemy boosting at you -> wall yourself in
                        if (se(z, i.np.accel) < se(z, i) && se(i.np.accel, z) < 200 && Ay(B(i, z), i.movDir) < 1 && i.movSpd >= 114 && z.delta < 123 && v - Xe[i.sid].tick <= 1) {
                            if (hy != null && x.list[hy]?.name == "blocker" && z.canBuild(x.list[hy])) {
                                for (let e3 = 0; e3 < 18; e3++) { u5(hy, o + Z(e3 * 20)); u5(hy, o - Z(e3 * 20)); }
                                console.log("anti boost blocker");
                            } else if (z.canBuild(x.list[ly])) {
                                u5(ly, o + Z(90));
                                u5(ly, o - Z(90));
                                u5(ly, o + Z(180));
                                console.log("anti boost spike");
                            } else if (uy != null && z.canBuild(x.list[uy])) {
                                for (let e3 = 0; e3 < 18; e3++) { u5(uy, o + Z(e3 * 20)); u5(uy, o - Z(e3 * 20)); }
                                console.log("anti boost trap");
                            } else {
                                for (let e3 = 0; e3 < 18; e3++) { u5(ay, o + Z(e3 * 20)); u5(ay, o - Z(e3 * 20)); }
                                console.log("anti boost wall");
                            }
                        }
                        if (i.movSpd <= 5 && z.movSpd <= 5 && (i.secondary == 9 || i.secondary == null || i.secondary == undefined) && (e2 >= 665 && e2 <= 705)) {
                            z.antiOneTickBowInsta = true;
                        }
                    }
                }
                z.dmgpot = p5();
                Wi = [];
                Tg();
                sy();
                Yx();
                z.primaryVar > 1 && ee == 5 && A == 10 ? Yx() : Qx();
                jx();
                ii = Sn.find((e) => e.sid == vt);
                combat.ng = ng = ng.filter((e) => v - e?.tick <= 4);
                setNt(false);
                for (let e = Q.length; e--;) {
                    if (D((Q[e].x - z.x2) ** 2 + (Q[e].y - z.y2) ** 2) > 350 && (!(Q[e].dmg || Q[e].trap) || Q[e]?.type !== 1 && Q[e].y < 12e3)) continue;
                    if (Q[e].dmg || Q[e]?.type === 1 && Q[e].y >= 12e3) ns.push(Q[e]);
                    else if (Q[e].trap) is.push(Q[e]);
                }
                for (let e = Q.length; e--;) {
                    if ((q = Q[e]).trap) {
                        if (D((q.x - z.x2) ** 2 + (q.y - z.y2) ** 2) <= 47 && !te(q?.owner?.sid)) { setNt(q); break; }
                    }
                }
                z.spikeTrap = Q.filter((e) => Nt && e?.group?.name === "spikes" && (Y && se(z, Y) <= 130 && Ay(B(Y, e), B(Y, z)) <= 3 || se(z, e) <= 35 + e.realScale + 2) && !te(e.owner.sid) && se(z, e, "object") <= (A === 10 ? 75 : x.weapons[ee]?.range)).sort((e, t2) => se(z, e, "object") - se(z, t2, "object"))[0];
                Js.checked ? Ly() : Oy();
                fn && Nx();
                // apple insta
                if (Cs.checked && ee == 5 && A >= 10 && Y && !(Y.inTrap && Wx(x.list[ly], B(z, Y.inTrap), Y.inTrap) && jt && ee == 5 && z.primaryVar > 0) && !Mt && _y(Y) == 1 && !p && Y.weaponR != 1 && !gt && (Y.weaponIndex <= 10 && Y.weaponIndex != 9 && Y)) {
                    if (Vy(z, Y, x.weapons[A].range, true) && o4(z, Y) && (z.primaryVar >= 1 || z.secondaryVar >= 1 && z.primaryVar < 1 && (v - Y?.lastBull) % 9 == 8) && Y.skinIndex == 6 && z.pr == 1 && z.sr == 1 && z.tr == 1 && Y) {
                        ct = true;
                        b(`AI on ${Y.name}[${Y.sid}]`, "", "#5c0620", false, true);
                        p = true;
                        y = A;
                        equip(53, null);
                        packet.send("G", A, true);
                        g[0] = B(z, Y);
                        packet.send("D", g[0], "client");
                        setTimeout(() => {
                            y = ee;
                            packet.send("G", ee, true);
                            equip(7, null);
                            g[0] = B(z, Y);
                            packet.send("D", g[0], "client");
                        }, ce);
                        setTimeout(() => { p = false; ct = false; g[0] = null; }, u);
                    }
                }
                // bleed insta
                if (Y && !Mt && !p && A == 10 && ee == 5 && Bs.checked) {
                    let e = x.weapons[A].range;
                    if (Y && Vy(z, Y, e, true) && Y && o4(z, Y) && (v - Y?.lastBull) % 9 == 8 && (z.primaryVar == 3 || z.primaryVar >= 2 && z.secondaryVar == 3) && Y.skinIndex != 6 && z.pr === 1 && z.sr === 1) {
                        p = true;
                        b(`Bleed Insta on ${Y.name}[${Y.sid}]`, "", "#5c0620", false, true);
                        y = A;
                        ct = true;
                        packet.send("G", A, true);
                        g[0] = B(z, Y);
                        equip(7, null);
                        packet.send("D", g[0], "client");
                        setTimeout(() => {
                            y = ee;
                            packet.send("G", ee, true);
                            equip(7, null);
                            g[0] = B(z, Y);
                            packet.send("D", g[0], "client");
                        }, ce);
                        setTimeout(() => { p = false; ct = false; y = null; }, u);
                    }
                }
                // Auto Emp: unloaded enemy turrets in range -> emp helmet (22)
                Sg = no.checked ? Xt.filter((e) => e.name == "turret" && se(z, e) <= 700 + z.movSpd && e?.time == 2200 && !te(e?.owner?.sid)) : [];
                // Assassin: still, full health, nothing aiming -> assassin gear (56)
                z.doAssassin = io.checked && !Sg.length && Nn.includes(56) && z.invisTime <= 0 && "chatbox" !== String(doc && doc.activeElement && doc.activeElement.id).toLowerCase() && z.health === 100 && (Dn === undefined || Dn === null) && z.movSpd == 0 ? true : false;
                g[0] = null;
                Om();
                z.selectedWeapon = null;
                // auto break: you are in an enemy trap -> break it (or the spike next to you)
                if (Nt && !p && Ds.checked) {
                    let e;
                    if (!(z.spikeTrap && Vs.checked)) {
                        e = B(z, Nt);
                        z.selectedWeapon = A == 10 && Nt.health - x.weapons[ee].dmg * K.weaponVariants[z.primaryVar].val <= 0 && (ee == 7 ? true : z.pr === 1);
                    } else {
                        e = B(z, z.spikeTrap);
                        z.selectedWeapon = A == 10 && z.spikeTrap.health - x.weapons[ee].dmg * K.weaponVariants[z.primaryVar].val <= 0 && (ee == 7 ? true : z.pr === 1);
                    }
                    if (z.selectedWeapon ? z.pr === 1 : z.pr == 1 && A != 10 || z.sr == 1 && A == 10) g[0] = e;
                    Bg(e, z.selectedWeapon ? ee : A === 10 ? A : ee, z.selectedWeapon ? z.primaryVar : A === 10 ? z.secondaryVar : z.primaryVar, z?.dmgpot?.forceSoldier ? 6 : z.selectedWeapon ? 0 : Nn.includes(40) ? 40 : 0, 1);
                }
                if (Nt && !p && Ds.checked) {
                    y = z.selectedWeapon ? ee : A != 10 ? ee : 10;
                    if (z.selectedWeapon ? z.pr === 1 : z.sr == 1 && A == 10 || z.pr == 1 && A != 10) {
                        equip(Sg.length ? 22 : z?.dmgpot?.forceSoldier ? 6 : z.selectedWeapon ? 6 : 40, 11);
                        z.hitting = true;
                        packet.send("F", 1);
                    } else {
                        packet.send("F", null, 0);
                    }
                }
                // manual hitting: left / right / middle click (and space)
                if (!p && !gt) {
                    if (!Nt) {
                        if (m.lc) {
                            y = ee;
                            if (z.weaponIndex != ee || z.buildIndex != null) packet.send("G", ee, true);
                            if (z.pr == 1) {
                                if (z.tailIndex === 11) Rp(On.includes(18) ? 18 : 0, 1);
                                else equip(z.dmgpot?.soldier ? 6 : Sg.length ? 22 : 7, 18);
                                z.hitting = true;
                            }
                            Bg(bm(), y, z.primaryVar, 0, 1);
                        }
                        if (m.rc) {
                            !m.ShiftLeft && A == 10 ? y = A : y = ee;
                            if (z.sr == 1 && A == 10 && z.weaponIndex == A && !m.ShiftLeft || z.pr == 1 && (z.weaponIndex == ee || m.ShiftLeft)) {
                                equip(z.dmgpot?.soldier ? 6 : Sg.length ? 22 : et < 2 ? 40 : 7, 11, 1);
                                z.hitting = true;
                            }
                            Bg(bm(), y, y === 10 ? z.secondaryVar : z.primaryVar, Nn.includes(40) ? 40 : 0, 1);
                        }
                        if (m.mc) {
                            for (let n = Q.filter((e) => e.health && se(z, e, "object") <= (!m.ShiftLeft && A === 10 ? 75 : x.weapons[ee].range)).sort((e, t2) => Ne(z.x2 - e.x, z.y2 - e.y) - Ne(z.x2 - t2.x, z.y2 - e.y)), i2 = n.length; i2--;) {
                                let e = n[i2];
                                let t2 = bg(e, A === 10 ? 75 : x.weapons[ee].range, n);
                                !m.ShiftLeft && A == 10 ? y = A : y = ee;
                                if (z.sr == 1 && A == 10 && z.weaponIndex == A && !m.ShiftLeft || z.pr == 1 && (z.weaponIndex == ee || m.ShiftLeft)) {
                                    equip(z.dmgpot?.soldier ? 6 : Sg.length ? 22 : et < 2 ? 40 : 7, 11, 1);
                                    z.hitting = true;
                                }
                                g[0] = t2;
                                Bg(t2, y, y === 10 ? z.secondaryVar : z.primaryVar, Nn.includes(40) ? 40 : 0, 1);
                                break;
                            }
                        }
                    }
                    Vg();
                }
                // shame leak: bull helmet on the bleed tick to drain shame
                if (z.lastBull && Nn.includes(7) && !z.hitSpike && z.dmgpot?.hp < 80 && z.shameCount > 0 && z.poison <= 0 && !z.dmgpot?.soldier && z.bleed === 0 && en && !Sg.length && getHat() != 7) {
                    if (z.lastDamage == 0 && z.skinIndex != 45) {
                        z.shameLeak = true;
                        et++; combat.et = et;
                        equip(7, null);
                    }
                }
                // healing
                if (z.hitSpike && Nt || !Nt && z.hitSpike && z?.dmgpot?.shouldHeal) {
                    if (z.health <= z.hitSpike.dmg || z.hitSpike.dmg + z?.dmgpot?.primary + z?.dmgpot?.turretGear >= z.health) p4();
                } else if (Us.checked) {
                    if (z.alive && z.health <= z.dmgpot?.hp * (z.skinIndex == 6 && !z.hitting && !p && !Sg.length && !gt && !z.shameLeak ? .75 : 1) && z.skinIndex != 45 && z.shameCount < 7) {
                        u4();
                    } else if ((!_n && (z.health < 85 || z.shameCount > 0 && z.health < 100) || _n && Date.now() - z.lastDamage >= 100 && z.health < 100 || _n && z.health <= 69) && en && z.skinIndex != 45) {
                        if (z.health <= 69) setTimeout(() => { u4(); }, 120 - xt + 9);
                        else u4();
                    }
                }
                Ze = [];
                e4();
                Je = Q.concat($e);
                // aim + weapon for this tick
                if (!p && !gt) {
                    if (g[0]) ct = true;
                    if (z.dir != g[0] && g[0] !== null) packet.send("D", g[0]);
                    if (y && (y == ee || y == A) && (z.weaponIndex != y || z.buildIndex != -1)) packet.send("G", y, true);
                    if (g[0] === null && z.dir != bm()) packet.send("D", bm());
                }
                if (z.dmgpots.length >= 4) z.dmgpots.pop();
                if (z.dmgpot) z.dmgpots.unshift({
                    ping: pingNow(), tick: v, dmgpot: z.dmgpot, health: z.health, packets: He,
                    currentHat: z.skinIndex, nextHat: getHat(), shameCount: z.shameCount, spikeTrap: z.hitSpike && Nt
                });
                k5[1] = false;
                A5();
                t3();
                // auto-gather on while anything is hitting, off otherwise (St = "K" sends)
                if (Ct || p && !At && !hn || m.rc || m.lc || m.mc || z.hitting || gt || Ot) {
                    if (St % 2 == 0 && en) packet.send("K", 1);
                } else {
                    if (St % 2 == 1) packet.send("K", 1);
                }
                d5();
                Iy();
            }));

            // ---- per-player frame upkeep: death log, stacked damage, death animation ----
            own(combat.onFramePlayer(function (i, kind) {
                if (kind === "died") {
                    let n = "";
                    i.deathDmgs.forEach((e, t) => {
                        n += `${le(e)}`;
                        if (t < i.deathDmgs.length - 1) n += ", ";
                    });
                    n = n.replace(/,/g, ", ");
                    b(`${i.name}[${i.sid}] has died ${n}`, "", "#ed5a55");
                } else if (kind === "damage") {
                    if (hs.checked) {
                        if (i.dmgs >= 0 && i.dmgs < 100 && (!Ei.includes(i.sid) || G["do"] && ts?.bot?.sid === i.sid)) U1.showText(i.x2, i.y2, 50, .18, 700, H(S(i.dmgs)), i.customColor);
                        if (i.dmgs >= 100) U1.showText(i.x2, i.y2, 60, .18, 1e3, Fs.checked ? "☠️" : H(i.dmgs), i.customColor);
                    }
                } else if (kind === "deathAnim") {
                    g3(i, 55, .28, 48, 13, .00215, 0);
                }
            }));
            // ---- addPlayer (15541): who you meet, their name colours ----
            own(combat.onPlayerAdded(function (e, info) {
                if (info.fresh && !info.isYou) b(`Encountered ${e.name}[${e.sid}]`, "", "#15c283");
                !e.customColor && (e.customColor = Array.from(F)[f(Math.random() * F.size)]);
                !e.color && (e.color = Hy(J));
                if (e.seenCount > 1 && !info.isYou) b(`Encountered ${e.name}[${e.sid}] ${m4(e.seenCount)} time`, "", "#15c283");
            }));
            function m4(e) {
                const t = ["th", "st", "nd", "rd"];
                const n = e % 10;
                const i = t[e % 100 > 10 && e % 100 < 20 ? 0 : n < 1 || n > 3 ? 0 : n];
                return e + i;
            }
            // ---- building damage the engine inferred (O3) -> the blue damage text ----
            own(combat.onBuildingDamage(function (bld, dmg, s) {
                if (!ws.checked) return;
                if (s == null) U1.showText(bld.x, bld.y, 20, .085, 350, 200, "#00aaff");
                else if (!Ei.includes(s.sid)) U1.showText(bld.x, bld.y, 20, .085, 350, H(dmg), "#00aaff");
            }));

/* ===== examplescript/70-chatlog.js ===== */
            // =====================================================================
            // CHAT LOG + PING — the bundle's log panel b() (300-410), receiveChat's
            // logging (13190), the ping loop ey() (16617) and its display (16594).
            // =====================================================================
            const CHATLOG_CSS = `
 .chat-container {
     position: fixed;
     top: 0;
     left: 0;
     width: 400px;
     height: 250px;
     background: rgba(0, 0, 0, .0);
     color: white;
     opacity: 1;
     font-family: 'Norican', cursive;
     font-weight: bold;
     border-bottom-right-radius: 8px;
     padding: 10px;
     display: flex;
     flex-direction: column;
     justify-content: space-between;
     z-index: 5;
     pointer-events: none;
 }
 .chat-container .chat-history, .chat-container .chat-input { pointer-events: auto; }
 .chat-history {
     height: 400px;
     overflow-y: auto;
     scrollbar-width: thin;
     scrollbar-color: rgba(255, 255, 255, 0.2) rgba(0, 0, 0, 0.5);
 }
 .chat-input {
     height: 30px;
     background-color: rgba(255, 255, 255, 0);
     border: none;
     border-radius: 4px;
     outline: none;
     color: white;
     padding: 5px;
 }
.scroll-button {
    position: fixed;
    top: 220px;
    left: 380px;
    border-radius: 100%;
    width: 30px;
    height: 30px;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 6;
    transition: box-shadow 0.5s ease-in-out;
}
.scroll-button:hover {
    background-color: rgba(0, 0, 0, 0.8);
    box-shadow: 0 0 10px cyan, 0 0 20px cyan, 0 0 30px cyan;
}
 .scroll-button::before {
     content: "";
     width: 0;
     height: 0;
     border-top: 10px solid white;
     border-left: 7px solid transparent;
     border-right: 7px solid transparent;
     position: absolute;
     top: 50%;
     left: 50%;
     transform: translate(-50%, -50%);
 }
`;
            // The panel is built as soon as there is a document body. Lines logged
            // before that are kept and written in order once it exists.
            let chatLog = null;
            const chatBacklog = [];
            const be = 2e3;
            function buildChatLog() {
                if (chatLog || !doc || !doc.body || !doc.head) return !!chatLog;
                const me = doc.createElement("style");
                me.textContent = CHATLOG_CSS;
                doc.head.appendChild(me);
                const ge = doc.createElement("div");
                ge.className = "scroll-button";
                const ye = doc.createElement("div");
                ye.className = "chat-container";
                const xe = doc.createElement("div");
                xe.className = "chat-history";
                const we = doc.createElement("input");
                we.type = "text";
                we.className = "chat-input";
                we.placeholder = "To chat click here or press / key";
                we.maxLength = 100;
                ye.appendChild(xe);
                ye.appendChild(we);
                doc.body.appendChild(ge);
                doc.body.appendChild(ye);
                ge.addEventListener("click", () => { xe.scrollTop = xe.scrollHeight; });
                xe.addEventListener("scroll", ke);
                ge.style.display = "none";
                // typing in the log's input never reaches the game's key handlers
                we.addEventListener("keydown", (e) => { e.stopPropagation(); });
                chatLog = { style: me, button: ge, container: ye, history: xe, input: we };
                ctx.onCleanup(() => { try { me.remove(); ge.remove(); ye.remove(); } catch (e) { /* ignore */ } chatLog = null; });
                applyChatLogVisible();
                for (const args of chatBacklog.splice(0)) b(...args);
                return true;
            }
            function applyChatLogVisible() {
                if (!chatLog) return;
                const on = tog("ChatLog").checked;
                chatLog.history.style.display = on ? "block" : "none";
                chatLog.input.style.display = on ? "block" : "none";
            }
            ctx.onSettingChange && ctx.onSettingChange((key) => { if (key === "ChatLog") applyChatLogVisible(); });
            function Me() {
                const e = new Date;
                let t = e.getHours();
                let n = e.getMinutes();
                let i = "AM";
                if (t === 0) t = 12;
                else if (t > 12) { i = "PM"; t = t % 12; }
                if (n < 10) n = "0" + n;
                return t + ":" + n + " " + i;
            }
            // b(text, rest, color, green, noTime): one line in the log
            function b(e, t, n, i, s) {
                if (!chatLog) { if (chatBacklog.length < be) chatBacklog.push([e, t, n, i, s]); return; }
                const xe = chatLog.history, ge = chatLog.button;
                const o = xe.scrollHeight - xe.scrollTop <= xe.clientHeight + 1;
                const r = doc.createElement("div");
                r.style.wordWrap = "break-word";
                r.style.color = i ? "#6bdb79" : "white";
                xe.appendChild(r);
                if (!s) {
                    const e2 = doc.createElement("span");
                    e2.style.color = "rgba(255, 255, 255, 0.5)";
                    e2.style.marginRight = "5px";
                    e2.textContent = Me();
                    r.appendChild(e2);
                }
                const a = doc.createElement("span");
                a.style.color = n;
                a.textContent = e;
                r.appendChild(a);
                const l = doc.createElement("span");
                l.textContent = t;
                r.appendChild(l);
                if (xe.children.length > be) xe.removeChild(xe.children[0]);
                if (o) { xe.scrollTop = xe.scrollHeight; ke(); }
                else ge.style.display = "block";
            }
            function ve() { const xe = chatLog.history; return xe.scrollHeight - xe.scrollTop <= xe.clientHeight + 1; }
            function ke() {
                if (!chatLog) return;
                const xe = chatLog.history;
                if (ve() || xe.clientHeight >= xe.scrollHeight) chatLog.button.style.display = "none";
                else chatLog.button.style.display = "block";
            }
            let chatDead = false;
            ctx.onCleanup(() => { chatDead = true; });
            (function waitBody() { if (!chatDead && !buildChatLog()) setTimeout(waitBody, 50); })();

            // ---- receiveChat (13190): every chat line goes to the log ----
            ctx.on("chat", function (pk) {
                const e = pk && pk.sid, n = pk && pk.message;
                const t = Hg(e);
                if (!t) return;
                if (!Ei.includes(e) || ts?.bot?.sid === e) b(`${t.name}[${t.sid}]: `, n, z.sid == e || ts?.bot?.sid === e ? "#0aa8fc" : "#FFFFFF");
            });

            // ---- the ping loop (ey) and its display (pingSocketResponse) ----
            // The bundle pinged every 400 ms. This server allows "0" at 2/s, so the
            // loop runs at the fastest rate the loader's governor lets through; the
            // official client's own 2.5 s pings are dropped so the two never mix.
            const pingRate = (net && net.rateLimits && net.rateLimits.packets && net.rateLimits.packets["0"]) || [2, 4];
            const PING_INTERVAL = Math.max(400, Math.ceil(1000 / (pingRate[0] * 0.9)));
            let curPing = 0, wd = 0, Zg = null, Gg = -1;
            ctx.onOutgoing("ping", () => false);
            function ey() {
                Zg && clearTimeout(Zg);
                MooMoo.isReady() && (Gg = Date.now(), packet.send("0"));
                Zg = setTimeout(ey, PING_INTERVAL);
            }
            ctx.onCleanup(() => { Zg && clearTimeout(Zg); });
            ey();
            function g1(e) { return e < 75 ? 4 : e < 150 ? 3 : e < 250 ? 2 : 1; }
            ctx.on("pong", function (pk) {
                const e = pk && pk.ms != null ? pk.ms : curPing;
                curPing = e;
                bn = e;
                if (!Kg.checked) {
                    wd = e;
                } else {
                    const t = parseInt(Xg.value);
                    wd = f(Math.random() * t) + parseInt(Xg.value) + 90;
                }
                yt.push(e);
                if (yt.length >= 4) yt.shift();
                xt = yt.reduce((a, b2) => a + b2, 0) / yt.length;
                // after the official client's own pong handler has run
                setTimeout(() => {
                    win.pingTime = e;
                    const pt = doc && doc.getElementById("pingText");
                    if (pt) pt.textContent = e + (Kg.checked ? wd : "") + " ms";
                    const pd = Zh.el;
                    if (pd) pd.className = "tier" + g1(e);
                }, 0);
            });
            function pingNow() { return curPing; }

/* ===== examplescript/80-overlay.js ===== */
            // =====================================================================
            // OVERLAY — the canvas the bundle's renderer draws on (82-render.js).
            // =====================================================================
            // A 2D canvas over the official client's canvases (it renders with WebGL).
            // It is shown once you are in a game and draws the bundle's whole frame;
            // pointer events pass through to the game.
            const ovl = { canvas: null, ctx: null, raf: null, dead: false, transform: [1, 0, 0, 1, 0, 0] };
            function buildOverlay() {
                if (ovl.canvas || !doc || !doc.body) return !!ovl.canvas;
                const game = doc.getElementById("gameCanvas");
                if (!game) return false;
                const after = doc.getElementById("textCanvas") || game;
                const c2 = doc.createElement("canvas");
                c2.style.position = "absolute";
                c2.style.left = "0px";
                c2.style.top = "0px";
                c2.style.pointerEvents = "none";
                c2.style.display = "none";
                after.parentNode.insertBefore(c2, after.nextSibling);
                ovl.canvas = c2;
                ovl.ctx = c2.getContext("2d");
                // the bundle's CanvasRenderingContext2D.prototype.roundRect (11590),
                // on this context only
                ovl.ctx.roundRect = function (e, t, n, i, s2) {
                    return n < 2 * s2 && (s2 = n / 2), i < 2 * s2 && (s2 = i / 2), s2 < 0 && (s2 = 0), this.beginPath(), this.moveTo(e + s2, t), this.arcTo(e + n, t, e + n, t + i, s2), this.arcTo(e + n, t + i, e, t + i, s2), this.arcTo(e, t + i, e, t, s2), this.arcTo(e, t, e + n, t, s2), this.closePath(), this;
                };
                const font = doc.createElement("link");
                font.rel = "stylesheet";
                font.href = "https://fonts.googleapis.com/css2?family=Lilita+One&display=swap";
                doc.head.appendChild(font);
                ctx.onCleanup(() => { try { c2.remove(); font.remove(); } catch (e) { /* ignore */ } ovl.canvas = null; });
                sm();
                listen(win, "resize", sm);
                return true;
            }

            // ---- the bundle's floating text (TextObj Ml / manager Nl, 2426) ----
            function Ml() {
                this.init = function (e, t, n, i, s, o, r) {
                    this.x = e; this.y = t; this.color = r; this.scale = n; this.speed = i; this.life = s; this.text = o;
                    this.startScale = this.scale * .1;
                    this.maxScale = 1.2 * n;
                    this.scaleSpeed = .7;
                    this.speedMax = i;
                    this.visuals = true;
                    this.movSpeed = Math.random() * 1 + 1;
                    this.movAngle = Math.random() * 1 < .5;
                    this.maxLife = s;
                };
                this.update = function (e) {
                    if (this.life > 0) {
                        this.life -= e;
                        if (this.visuals) {
                            this.y -= this.speed * e;
                            if (this.scaleSpeed !== -.35) this.x += (this.movAngle ? -1 : 1) * this.speed * e * this.movSpeed;
                            else this.y += this.speed * e;
                            this.scale += this.scaleSpeed * (e / 4.5);
                            this.scale = oe(this.scale, this.startScale);
                            if (this.speed < this.speedMax) this.speed += this.speedMax * .01;
                            if (this.scale >= this.maxScale) { this.scale = this.maxScale; this.scaleSpeed *= -.5; this.speed *= .5; }
                        } else {
                            this.y -= this.speed * e;
                            this.scale += this.scaleSpeed * e;
                            if (this.scale >= this.maxScale) { this.scale = this.maxScale; this.scaleSpeed *= -1; }
                            else if (this.scale <= this.startScale) { this.scale = this.startScale; this.scaleSpeed = 0; }
                        }
                        if (this.life <= 0) this.life = 0;
                    }
                };
                this.render = function (e, t, n) {
                    e.font = this.scale + "px Lilita One";
                    if (this.visuals) {
                        e.lineWidth = 10;
                        e.strokeStyle = "#3d3f42";
                        e.fillStyle = this.color;
                        e.globalAlpha = this.life / this.maxLife * 2;
                        e.strokeText(this.text, this.x - t, this.y - n);
                    } else {
                        e.fillStyle = this.color;
                    }
                    e.fillText(this.text, this.x - t, this.y - n);
                    e.globalAlpha = 1;
                };
            }
            function Nl() {
                this.texts = [];
                this.update = function (t, n, i, s) {
                    n.textBaseline = "middle";
                    n.textAlign = "center";
                    for (let e = 0; e < this.texts.length; ++e) {
                        const o = this.texts[e];
                        if (o.life) { o.update(t); o.render(n, i, s); }
                    }
                };
                this.showText = function (e, t, n, i, s, o, r) {
                    let a = this.texts.find((e2) => !e2.life);
                    if (!a) { a = new Ml(); this.texts.push(a); }
                    a.init(e, t, n, i, s, o, r);
                };
            }
            const U1 = new Nl();

            // ---- the frame (the bundle's ny(): gh / mh, then l2) ----
            function frame() {
                if (ovl.dead) return;
                ovl.raf = win.requestAnimationFrame(frame);
                gh = Date.now(), mh = gh - xh, xh = gh;
                if (!ovl.canvas && !buildOverlay()) return;
                const inGame = J.indexOf(z) >= 0;
                ovl.canvas.style.display = inGame ? "block" : "none";
                if (!inGame) return;
                mainContext = ovl.ctx;
                mainContext.setTransform(ovl.transform[0], ovl.transform[1], ovl.transform[2], ovl.transform[3], ovl.transform[4], ovl.transform[5]);
                try {
                    l2();
                } catch (err) {
                    // never leave a half-drawn frame over the game
                    mainContext.setTransform(1, 0, 0, 1, 0, 0);
                    mainContext.clearRect(0, 0, ovl.canvas.width, ovl.canvas.height);
                    if (!ovl.errLogged) { ovl.errLogged = true; console.error("[examplescript] render", err); }
                }
            }
            ctx.onCleanup(() => { ovl.dead = true; if (ovl.raf) win.cancelAnimationFrame(ovl.raf); });
            if (typeof win.requestAnimationFrame === "function") ovl.raf = win.requestAnimationFrame(frame);

/* ===== examplescript/81-render-lib.js ===== */
            // =====================================================================
            // RENDER LIBRARY — the bundle's drawing functions, copied verbatim
            // (only `document.createElement` -> `doc.createElement`). They draw on
            // `mainContext`, the overlay's 2D context (82-render.js).
            // =====================================================================
            // ---- bundle 44-67: adjustColorBrightness / adjustColorBrightnessIncrease ----
            function adjustColorBrightness(hexColor, brightnessFactor) {
                const hexToDecimal = hex => parseInt(hex, 16);
                const multiplyAndFloor = (value, factor) => value * factor | 0;
                const decimalToHex = decimal => decimal.toString(16).padStart(2, "0");

                const adjustedRed = multiplyAndFloor(hexToDecimal(hexColor.substr(1, 2)), 1 - brightnessFactor);
                const adjustedGreen = multiplyAndFloor(hexToDecimal(hexColor.substr(3, 2)), 1 - brightnessFactor);
                const adjustedBlue = multiplyAndFloor(hexToDecimal(hexColor.substr(5, 2)), 1 - brightnessFactor);

                return `#${decimalToHex(adjustedRed)}${decimalToHex(adjustedGreen)}${decimalToHex(adjustedBlue)}`;
            }

            function adjustColorBrightnessIncrease(hexColor, brightnessIncrease) {
                const hexToDecimal = hex => parseInt(hex, 16);
                const clampValue = (value, increment) => Math.min(255, value + increment | 0);
                const decimalToHex = decimal => decimal.toString(16).padStart(2, "0");

                const increaseAmount = 255 * brightnessIncrease;
                const adjustedRed = clampValue(hexToDecimal(hexColor.substr(1, 2)), increaseAmount);
                const adjustedGreen = clampValue(hexToDecimal(hexColor.substr(3, 2)), increaseAmount);
                const adjustedBlue = clampValue(hexToDecimal(hexColor.substr(5, 2)), increaseAmount);

                return `#${decimalToHex(adjustedRed)}${decimalToHex(adjustedGreen)}${decimalToHex(adjustedBlue)}`;
            }

            // ---- bundle 577-589: Le: a sprite copy with a drop shadow (the "shadows" visual) ----
            function Le(e, t, n, i, s) {
                if (!i) i = n;
                var o = doc.createElement("canvas");
                var r = o.getContext("2d");
                o.width = n;
                o.height = i;
                r.shadowColor = "rgba(0, 0, 0, 1)";
                r.shadowBlur = e === "animal" ? 18 : e === "weapon" ? 12 : e == "accessory" ? 9 : 20;
                r.drawImage(t, 0, 0, n, i);
                var a = new Image;
                a.src = o.toDataURL();
                return a
            }

            // ---- bundle 13984-13994: crown / skull icons ----
            const e2 = {},
                  t2 = ["crown", "skull"];

            function n2() {
                for (let e = 0; e < t2.length; ++e) {
                    const t = new Image;
                    t.onload = function() {
                        this.isLoaded = !0
                    }, t.src = ".././img/icons/" + t2[e] + ".png", e2[t2[e]] = t
                }
            }

            // ---- bundle 14470-14603: c2 projectiles, u2 projectile sprite, f2, h2 volcano, p2 river, w2 hit-highlight pulse, b2 objects ----
            function c2(t, n, i) {
                for (let e = 0; e < Ah.length; ++e) q = Ah[e], q.active && q.layer == t && (q.update(mh), q.active && cg(q.x - n, q.y - i, q.scale) && (mainContext.save(), mainContext.translate(q.x - n, q.y - i), mainContext.rotate(q.dir), u2(0, 0, q, mainContext), mainContext.restore()))
            }
            const d2 = {};

            function u2(e, t, n, i, s) {
                if (n.src) {
                    var o = x.projectiles[n.indx].src,
                        r = d2[o];
                    if (!r) {
                        r = new Image;
                        r.onload = function() {
                            this.isLoaded = true;
                            fe.weapons[o] = Le(1, this, n.scale)
                        };
                        r.src = ".././img/weapons/" + o + ".png";
                        d2[o] = r
                    } else if (r && fe.weapons[o] == undefined) {
                        r = new Image;
                        r.onload = function() {
                            this.isLoaded = true;
                            fe.weapons[o] = Le(1, this, n.scale)
                        };
                        r.src = ".././img/weapons/" + o + ".png";
                        d2[o] = r
                    }
                    if (r.isLoaded) {
                        var a = Es.checked ? fe.weapons[o] : r;
                        if (a) {
                            i.drawImage(a, e - n.scale / 2, t - n.scale / 2, n.scale, n.scale)
                        }
                    }
                } else if (n.indx === 1) {
                    i.fillStyle = "#939393";
                    k(e, t, n.scale, i)
                }
            }

            function f2(e, t, n, i) {
                return {
                    x: e + i * U(n),
                    y: t + i * V(n)
                }
            }

            function h2() {
                const e = Ph - Oh / 2,
                      t = Rh - Lh / 2;
                K1.animationTime += mh, K1.animationTime %= K.volcanoAnimationDuration;
                const n = K.volcanoAnimationDuration / 2,
                      i = 1.7 + .3 * (S(n - K1.animationTime) / n),
                      s = K.innerVolcanoScale * i;
                mainContext.drawImage(K1.land, K1.x - K.volcanoScale - e, K1.y - K.volcanoScale - t, K.volcanoScale * 2, K.volcanoScale * 2), mainContext.drawImage(K1.lava, K1.x - s - e, K1.y - s - t, s * 2, s * 2)
            }

            function p2(e, t, n, i) {
                const s = K.riverWidth + i,
                      o = K.mapScale / 2 - t - s / 2;
                o < Lh && o + s > 0 && n.fillRect(0, o, Oh, s)
            }
            const m2 = .05;
            const g2 = .025;
            const y2 = .1;
            const x2 = 1;

            function w2(e) {
                if (!e.fadingOut) {
                    e.opacity2 += m2;
                    if (e.opacity2 >= x2) {
                        e.opacity2 = x2;
                        e.fadingOut = true
                    }
                } else {
                    e.opacity2 -= g2;
                    if (e.opacity2 <= y2) {
                        e.opacity2 = y2;
                        e.fadingOut = false
                    }
                }
                return e.opacity2
            }

            function b2(t, n, i, s) {
                let o, r, a, l;
                s = en ? Xt.concat(Ze, ts.builds, es.rBuilds) : kh;
                l = s.length;
                for (let e = 0; e < l; ++e) {
                    q = s[e];
                    if (!q || !q.active) continue;
                    r = q.x + q.xWiggle - n;
                    a = q.y + q.yWiggle - i;
                    if (t === 0) q.update(mh);
                    Wi;
                    if (q.layer === t && cg(r, a, q.scale + (q.blocker || 0))) {
                        if (Wi.some(e => e.sid === q.sid)) {
                            w2(q);
                            mainContext.globalAlpha = q.hideFromEnemy ? .6 : q.preplace ? .7 : q.fake ? .3 : q.opacity2
                        } else {
                            mainContext.globalAlpha = q.hideFromEnemy ? .6 : q.preplace ? .7 : q.fake ? .3 : q.opacity
                        }
                        if (q.isItem) {
                            if (q.fake && !Ns.checked) {
                                mainContext.save();
                                mainContext.translate(r, a);
                                mainContext.rotate(q.dir);
                                mainContext.beginPath();
                                mainContext.arc(0, 0, q.scale, 0, ae);
                                mainContext.fillStyle = q.restricter ? "#6bed5f" : q.preplace ? "#d4577c" : "#7da7b1";
                                mainContext.fill();
                                mainContext.stroke();
                                mainContext.restore()
                            } else {
                                o = H2(q, false, false, q);
                                mainContext.save();
                                mainContext.translate(r, a);
                                mainContext.rotate(q.dir);
                                mainContext.drawImage(o, -(o.width / 2), -(o.height / 2));
                                if (q.blocker) {
                                    mainContext.strokeStyle = "#db6e6e";
                                    mainContext.globalAlpha = .3;
                                    mainContext.lineWidth = 6;
                                    k(0, 0, q.blocker, mainContext, false, true)
                                }
                                mainContext.restore()
                            }
                        } else if (q.type === 4) {
                            h2()
                        } else {
                            o = F2(q);
                            mainContext.drawImage(o, r - o.width / 2, a - o.height / 2)
                        }
                    }
                }
            }

            // ---- bundle 14655-14910: A2 players, k circle, I2 player body, C2 hats, B2, D2 push line, M2 tails, O2 weapons, F2 resources, _2 / V2 volcano sprites ----
            function A2(i, s, o, r) {
                for (let e = 0, n = J.concat(Ci, ts.players, es.rPlayers); e < n.length; ++e) {
                    let t = n[e];
                    if (t) {
                        if (t?.zIndex == o) {
                            t.animate(mh);
                            if (t.fake) {
                                mainContext.globalAlpha = t.vals && (t.vals = oe(0, t.vals -= t.decay))
                            } else if (r) {
                                mainContext.globalAlpha = .55
                            } else if (Ei.includes(t.sid)) {
                                mainContext.globalAlpha = .295
                            } else {
                                mainContext.globalAlpha = !Ls.checked ? 1 : .67
                            }
                            if (t.visible || t.fake || t.spectate) {
                                t.skinRot += .002 * mh;
                                let e = (t == z ? wm() : t.dir) + t.dirPlus;
                                mainContext.save();
                                mainContext.translate(t.x - i, t.y - s);
                                mainContext.rotate(e);
                                I2(t, mainContext);
                                mainContext.restore()
                            }
                        }
                    }
                }
            }

            function k(e, t, n, i, s, o) {
                i = i || mainContext;
                i.beginPath();
                i.arc(e, t, n, 0, ae);
                o || i.fill();
                s || i.stroke()
            }

            function I2(e, t) {
                t = t || mainContext, t.lineWidth = R0, t.lineJoin = "miter";
                const n = W / 4 * (x.weapons[e.weaponIndex].armS || 1),
                      i = e.buildIndex < 0 && x.weapons[e.weaponIndex].hndS || 1,
                      s = e.buildIndex < 0 && x.weapons[e.weaponIndex].hndD || 1;
                if (e.tailIndex > 0 && M2(e.tailIndex, t, e), e.buildIndex < 0 && !x.weapons[e.weaponIndex].aboveHand && (O2(x.weapons[e.weaponIndex], K.weaponVariants[e.weaponVariant]?.src, e.scale, 0, t), x.weapons[e.weaponIndex].projectile != null && !x.weapons[e.weaponIndex].hideProjectile && u2(e.scale, 0, x.projectiles[x.weapons[e.weaponIndex].projectile], mainContext)), t.fillStyle = e.customColor, k(e.scale * U(n), e.scale * V(n), 14), k(e.scale * s * U(-n * i), e.scale * s * V(-n * i), 14), e.buildIndex < 0 && x.weapons[e.weaponIndex].aboveHand && (O2(x.weapons[e.weaponIndex], K.weaponVariants[e.weaponVariant]?.src, e.scale, 0, t), x.weapons[e.weaponIndex].projectile != null && !x.weapons[e.weaponIndex].hideProjectile && u2(e.scale, 0, x.projectiles[x.weapons[e.weaponIndex].projectile], mainContext)), e.buildIndex >= 0) {
                    const o = j2(x.list[e.buildIndex]);
                    t.drawImage(o, e.scale - x.list[e.buildIndex].holdOffset, -o.width / 2)
                }
                k(0, 0, e.scale, t), e.skinIndex > 0 && (t.rotate(W / 2), C2(e.skinIndex, t, null, e));
                D2(e, t)
            }
            const S2 = {},
                  E2 = {};
            let T2;

            function C2(e, t, n, i) {
                if (!(T2 = S2[e])) {
                    var s = new Image;
                    s.onload = function() {
                        this.isLoaded = true;
                        this.onload = null;
                        fe.hats[e] = Le(1, this, o.scale)
                    };
                    s.src = ".././img/hats/hat_" + e + ".png";
                    S2[e] = s;
                    T2 = s
                }
                var o = n || E2[e];
                if (!o) {
                    for (var r = 0; r < C0.length; ++r) {
                        if (C0[r].id == e) {
                            o = C0[r];
                            break
                        }
                    }
                    E2[e] = o
                }
                if (T2.isLoaded) {
                    var a = gy("shadows")?.checked ? fe.hats[e] : T2;
                    if (a) {
                        t.drawImage(a, -o.scale / 2, -o.scale / 2, o.scale, o.scale)
                    }
                    if (!n && o.topSprite) {
                        t.save();
                        t.rotate(i.skinRot);
                        C2(e + "_top", t, o, i);
                        t.restore()
                    }
                }
            }

            function B2(e, t, n, i, s, o, r) {
                let a = e[t];
                if (!a) {
                    const c = new Image;
                    c.onload = function() {
                        this.isLoaded = true;
                        this.onload = null;
                        e[t] = Le(r, this, o)
                    };
                    c.src = i + t + s;
                    a = c
                }
                const l = gy("shadows")?.checked ? e[t] : a;
                if (l) {
                    n.drawImage(l, -s.scale / 2, -s.scale / 2, s.scale, s.scale)
                }
                if (!i && s.topSprite) {
                    n.save();
                    n.rotate(o.skinRot);
                    B2(e, t + "_top", n, i, s, o, r);
                    n.restore()
                }
            }

            function D2(e, t) {
                if (Y && e.sid == Y?.sid && jt) {
                    t.strokeStyle = "blue";
                    t.fillStyle = "blue";
                    if (Ne(ne.x, ne.y) > 10) {
                        t.beginPath();
                        t.moveTo(0, 0);
                        t.lineTo(ne.x, ne.y);
                        t.stroke()
                    }
                }
            }
            const P2 = {},
                  R2 = {};

            function M2(t, e, n) {
                let i = R2[t];
                if (!(T2 = P2[t])) {
                    var s = new Image;
                    s.onload = function() {
                        this.isLoaded = true;
                        fe.accessories[t] = Le("accessory", this, i.scale, i.scale, n.fake)
                    };
                    s.src = ".././img/accessories/access_" + t + ".png";
                    P2[t] = s;
                    T2 = s
                }
                if (!i) {
                    for (let e = 0; e < B0.length; ++e)
                        if (B0[e].id == t) {
                            i = B0[e];
                            break
                        } R2[t] = i
                }
                if (T2.isLoaded) {
                    var o = gy("shadows")?.checked ? fe.accessories[t] : T2;
                    if (o) {
                        e.save();
                        e.translate(-20 - (i.xOff || 0), 0);
                        if (i.spin) {
                            e.rotate(n.skinRot)
                        }
                        e.drawImage(o, -i.scale / 2, -i.scale / 2, i.scale, i.scale);
                        e.restore()
                    }
                }
            }
            var N2 = {};

            function O2(e, t, n, i, s) {
                var o = e.src + (t || ""),
                    r = N2[o];
                if (!r) {
                    r = new Image;
                    r.onload = function() {
                        this.isLoaded = true;
                        fe.weapons[o] = Le("weapon", this, e.length, e.width)
                    };
                    r.src = ".././img/weapons/" + o + ".png";
                    N2[o] = r
                } else if (r && fe.weapons[o] == undefined) {
                    r = new Image;
                    r.onload = function() {
                        this.isLoaded = true;
                        fe.weapons[o] = Le("weapon", this, e.length, e.width)
                    };
                    r.src = ".././img/weapons/" + o + ".png";
                    N2[o] = r
                }
                if (r.isLoaded) {
                    var a = gy("shadows")?.checked ? fe.weapons[o] : r;
                    if (a) {
                        s.drawImage(a, n + e.xOff - e.length / 2, i + e.yOff - e.width / 2, e.length, e.width)
                    }
                }
            }
            const L2 = {};

            function F2(e) {
                const n = e.y >= K.mapScale - K.snowBiomeTop ? 2 : e.y <= K.snowBiomeTop ? 1 : 0,
                      i = e.type + "_" + e.scale + "_" + n;
                let s = Es.checked && !n ? 0 : 54;
                let o = L2[i + s];
                if (!o) {
                    let t = Es.checked;
                    const a = doc.createElement("canvas");
                    a.width = a.height = e.scale * 2.1 + R0;
                    const l = a.getContext("2d");
                    if (l.translate(a.width / 2, a.height / 2), l.rotate(X.randFloat(0, W)), l.strokeStyle = D0, l.lineWidth = R0, e.type == 0) {
                        let e;
                        for (var r = 0; r < 2; ++r) {
                            l.shadowBlur = r === 0 && t ? 21 : 0;
                            l.shadowColor = r === 0 && t ? "rgba(0, 0, 0, 1)" : 0;
                            e = q.scale * (r ? .5 : 1), Q2(l, q.sid % 2 === 0 ? 5 : 7, e, e * .7), l.fillStyle = n ? r ? "#fff" : "#e3f1f4" : r ? "#b4db62" : "#9ebf57", l.fill(), r || l.stroke()
                        }
                    } else if (e.type == 1) {
                        if (n == 2) l.fillStyle = "#606060", Q2(l, 6, e.scale * .3, e.scale * .71), l.fill(), l.stroke(), l.fillStyle = "#89a54c", k(0, 0, e.scale * .55, l), l.fillStyle = "#a5c65b", k(0, 0, e.scale * .3, l, !0);
                        else {
                            l.shadowBlur = t ? 22 : 0;
                            l.shadowColor = t ? "rgba(0, 0, 0, 1)" : null;
                            G2(l, 6, q.scale, q.scale * .7), l.fillStyle = n ? "#e3f1f4" : "#89a54c", l.fill(), l.shadowBlur = 0;
                            l.shadowColor = null;
                            l.stroke(), l.fillStyle = n ? "#6a64af" : "#c15555";
                            let e;
                            const c = 4,
                                  d = rh / c;
                            for (var r = 0; r < c; ++r) e = X.randInt(q.scale / 3.5, q.scale / 2.3), k(e * U(d * r), e * V(d * r), X.randInt(10, 12), l)
                        }
                    } else {
                        e.type == 2 || e.type == 3;
                        l.shadowBlur = t ? 12 : 0;
                        l.shadowColor = t ? "rgba(0, 0, 0, 1)" : null;
                        l.fillStyle = e.type == 2 ? n == 2 ? "#938d77" : "#939393" : "#e0c655", Q2(l, 3, e.scale, e.scale), l.fill(), l.stroke(), l.fillStyle = e.type == 2 ? n == 2 ? "#b2ab90" : "#bcbcbc" : "#ebdca3", l.shadowBlur = 0;
                        l.shadowColor = null;
                        Q2(l, 3, e.scale * .55, e.scale * .65), l.fill();
                        l.shadowBlur = 0;
                        l.shadowColor = null
                    }
                    o = a, L2[i + s] = o
                }
                return o
            }

            function _2(t, n, i) {
                const s = t.lineWidth || 0;
                i /= 2, t.beginPath();
                let o = ae / n;
                for (let e = 0; e < n; e++) t.lineTo(i + (i - s / 2) * U(o * e), i + (i - s / 2) * V(o * e));
                t.closePath()
            }

            function V2() {
                const e = K.volcanoScale * 2,
                      t = doc.createElement("canvas");
                t.width = e, t.height = e;
                const n = t.getContext("2d");
                n.strokeStyle = "#3e3e3e", n.lineWidth = R0 * 2, n.fillStyle = "#7f7f7f", _2(n, 10, e), n.fill(), n.stroke(), K1.land = t;
                const i = doc.createElement("canvas"),
                      s = K.innerVolcanoScale * 2;
                i.width = s, i.height = s;
                const o = i.getContext("2d");
                o.strokeStyle = D0, o.lineWidth = R0 * 1.6, o.fillStyle = "#f54e16", o.strokeStyle = "#f56f16", _2(o, 10, s), o.fill(), o.stroke(), K1.lava = i
            }

            // ---- bundle 14912-15091: U2 / j2 / H2 item sprites, W2 leaf ----
            const U2 = [];

            function j2(i, e, s, o) {
                let t = Es.checked && !s && !e ? 0 : 54;
                let r = U2[i.id + t];
                if (!r || e || i.lastAnim != ws.checked) {
                    const f = doc.createElement("canvas");
                    f.width = f.height = i.scale * 2.5 + R0 + (x.list[i.id].spritePadding || 0);
                    const h = f.getContext("2d");
                    let n = Es.checked && !s ? true : 0;
                    h.shadowBlur = n ? 15 : 0;
                    h.shadowColor = `rgba(0, 0, 0, 0.35)`;
                    if (h.translate(f.width / 2, f.height / 2), h.rotate(e ? 0 : W / 2), h.strokeStyle = D0, h.lineWidth = R0 * (e ? f.width / 81 : 1), i.name == "apple") {
                        h.fillStyle = "#c15555", k(0, 0, i.scale, h), h.fillStyle = "#89a54c";
                        const p = -(W / 2);
                        W2(i.scale * U(p), i.scale * V(p), 25, p + W / 2, h)
                    } else if (i.name == "cookie") {
                        h.fillStyle = "#cca861", k(0, 0, i.scale, h), h.fillStyle = "#937c4b";
                        for (var a = 4, l = rh / a, c, d = 0; d < a; ++d) c = X.randInt(i.scale / 2.5, i.scale / 1.7), k(c * U(l * d), c * V(l * d), X.randInt(4, 5), h, !0)
                    } else if (i.name == "cheese") {
                        h.fillStyle = "#f4f3ac", k(0, 0, i.scale, h), h.fillStyle = "#c3c28b";
                        for (var a = 4, l = rh / a, c, d = 0; d < a; ++d) c = X.randInt(i.scale / 2.5, i.scale / 1.7), k(c * U(l * d), c * V(l * d), X.randInt(4, 5), h, !0)
                    } else if (i.name == "wood wall" || i.name == "stone wall" || i.name == "castle wall") {
                        h.fillStyle = i.name == "castle wall" ? "#83898e" : i.name == "wood wall" ? "#a5974c" : "#939393";
                        const p = i.name == "castle wall" ? 4 : 3;
                        Q2(h, p, i.scale * 1.1, i.scale * 1.1), h.fill(), h.stroke(), h.fillStyle = i.name == "castle wall" ? "#9da4aa" : i.name == "wood wall" ? "#c9b758" : "#bcbcbc", Q2(h, p, i.scale * .65, i.scale * .65), h.fill()
                    } else if (i.name == "spikes" || i.name == "greater spikes" || i.name == "poison spikes" || i.name == "spinning spikes") {
                        let e = i.name == "spikes" ? 8 : 8.5;
                        let t = i.name == "spikes" ? .6 : .65;
                        h.shadowBlur = n ? e : 0;
                        h.shadowColor = `rgba(0, 0, 0, ${t})`;
                        h.fillStyle = i.name == "poison spikes" ? "#7b935d" : "#79A9CA";
                        var u = i.scale * .6;
                        if (s || (Os.checked ? true : !o?.fake)) {
                            Q2(h, i.name == "spikes" ? 5 : 6, i.scale, u);
                            h.fill();
                            h.stroke();
                            h.fillStyle = "#a5974c";
                            h.shadowBlur = 0, h.shadowColor = null;
                            k(0, 0, u, h);
                            h.fillStyle = "#c9b758";
                            k(0, 0, u / 2, h, !0)
                        } else if (o?.fake) {
                            h.strokeStyle = !o?.fake ? "#525252" : o?.restricter ? "#6bed5f" : o?.preplace ? "#d4577c" : "#000000", Q2(h, i.name == "spikes" ? 5 : 6, i.scale, u);
                            h.stroke();
                            h.shadowBlur = 0, h.shadowColor = null;
                            if (!o?.fake) {
                                h.beginPath();
                                h.arc(0, 0, u, 0, ae);
                                h.stroke()
                            }
                        }
                    } else if (i.name == "windmill" || i.name == "faster windmill" || i.name == "power mill") h.fillStyle = "#a5974c", k(0, 0, i.scale, h), h.fillStyle = "#c9b758", z2(0, 0, i.scale * 1.5, 29, 4, h), h.shadowBlur = 0, h.shadowColor = null, h.fillStyle = "#a5974c", k(0, 0, i.scale * .5, h);
                    else if (i.name == "mine") h.fillStyle = "#939393", Q2(h, 3, i.scale, i.scale), h.fill(), h.stroke(), h.fillStyle = "#bcbcbc", Q2(h, 3, i.scale * .55, i.scale * .65), h.fill();
                    else if (i.name == "sapling")
                        for (var d = 0; d < 2; ++d) {
                            var u = i.scale * (d ? .5 : 1);
                            Q2(h, 7, u, u * .7), h.fillStyle = d ? "#b4db62" : "#9ebf57", h.fill(), d || h.stroke()
                        } else if (i.name == "pit trap") {
                            h.shadowBlur = n ? 8.5 : 0;
                            h.shadowColor = `rgba(0, 0, 0, ${.65})`;
                            if (s || (Os.checked ? true : !o?.fake)) {
                                h.fillStyle = "#a5974c", Q2(h, 3, i.scale * 1.1, i.scale * 1.1), h.fill(), h.stroke(), h.fillStyle = D0, Q2(h, 3, i.scale * .65, i.scale * .65), h.fill()
                            } else if (o?.fake || o?.preplace) {
                                h.strokeStyle = !o?.fake ? "#525252" : o?.restricter ? "#6bed5f" : o?.preplace ? "#d4577c" : "#5e79db", Q2(h, 3, i.scale * 1.1, i.scale * 1.1), h.stroke();
                                if (!o?.fake) {
                                    Q2(h, 3, i.scale * .65, i.scale * .65), h.stroke()
                                }
                            }
                        } else if (i.name == "boost pad") h.fillStyle = "#7e7f82", Y2(0, 0, i.scale * 2, i.scale * 2, h), h.fill(), h.stroke(), h.fillStyle = "#dbd97d", K2(i.scale * 1, h);
                    else if (i.name == "turret") {
                        h.fillStyle = "#a5974c", k(0, 0, i.scale, h), h.fill(), h.stroke(), h.fillStyle = "#939393";
                        const p = 50;
                        Y2(0, -p / 2, i.scale * .9, p, h), k(0, 0, i.scale * .6, h), h.fill(), h.stroke()
                    } else if (i.name == "platform") {
                        h.fillStyle = "#cebd5f";
                        const p = 4,
                              m = i.scale * 2,
                              g = m / p;
                        let e = -(i.scale / 2);
                        for (var d = 0; d < p; ++d) Y2(e - g / 2, 0, g, i.scale * 2, h), h.fill(), h.stroke(), e += m / p
                    } else i.name == "healing pad" ? (h.fillStyle = "#7e7f82", Y2(0, 0, i.scale * 2, i.scale * 2, h), h.fill(), h.stroke(), h.fillStyle = "#db6e6e", z2(0, 0, i.scale * .65, 20, 4, h, !0)) : i.name == "spawn pad" ? (h.fillStyle = "#7e7f82", Y2(0, 0, i.scale * 2, i.scale * 2, h), h.fill(), h.stroke(), h.fillStyle = "#71aad6", k(0, 0, i.scale * .6, h)) : i.name == "blocker" ? (h.fillStyle = "#7e7f82", k(0, 0, i.scale, h), h.fill(), h.stroke(), h.rotate(W / 4), h.fillStyle = "#db6e6e", z2(0, 0, i.scale * .65, 20, 4, h, !0)) : i.name == "teleporter" && (h.fillStyle = "#7e7f82", k(0, 0, i.scale, h), h.fill(), h.stroke(), h.rotate(W / 4), h.fillStyle = "#d76edb", k(0, 0, i.scale * .5, h, !0));
                    r = f, e || (U2[i.id + t] = r)
                }
                i.lastAnim = ws.checked;
                return r
            }

            function H2(i, e, s, o) {
                let t = Es.checked && !s && !e ? 0 : 54;
                let r = U2[i.id + t];
                if (!r || e || i.lastAnim != ws.checked) {
                    const f = doc.createElement("canvas");
                    f.width = f.height = i.scale * 2.5 + R0 + (x.list[i.id].spritePadding || 0);
                    const h = f.getContext("2d");
                    let n = Es.checked && !s ? true : 0;
                    h.shadowBlur = n ? 15 : 0;
                    h.shadowColor = `rgba(0, 0, 0, 0.35)`;
                    if (h.translate(f.width / 2, f.height / 2), h.rotate(e ? 0 : W / 2), h.strokeStyle = D0, h.lineWidth = R0 * (e ? f.width / 81 : 1), i.name == "apple") {
                        h.fillStyle = "#c15555", k(0, 0, i.scale, h), h.fillStyle = "#89a54c";
                        const p = -(W / 2);
                        W2(i.scale * U(p), i.scale * V(p), 25, p + W / 2, h)
                    } else if (i.name == "cookie") {
                        h.fillStyle = "#cca861", k(0, 0, i.scale, h), h.fillStyle = "#937c4b";
                        for (var a = 4, l = rh / a, c, d = 0; d < a; ++d) c = X.randInt(i.scale / 2.5, i.scale / 1.7), k(c * U(l * d), c * V(l * d), X.randInt(4, 5), h, !0)
                    } else if (i.name == "cheese") {
                        h.fillStyle = "#f4f3ac", k(0, 0, i.scale, h), h.fillStyle = "#c3c28b";
                        for (var a = 4, l = rh / a, c, d = 0; d < a; ++d) c = X.randInt(i.scale / 2.5, i.scale / 1.7), k(c * U(l * d), c * V(l * d), X.randInt(4, 5), h, !0)
                    } else if (i.name == "wood wall" || i.name == "stone wall" || i.name == "castle wall") {
                        h.fillStyle = i.name == "castle wall" ? "#83898e" : i.name == "wood wall" ? "#a5974c" : "#939393";
                        const p = i.name == "castle wall" ? 4 : 3;
                        Q2(h, p, i.scale * 1.1, i.scale * 1.1), h.fill(), h.stroke(), h.fillStyle = i.name == "castle wall" ? "#9da4aa" : i.name == "wood wall" ? "#c9b758" : "#bcbcbc", Q2(h, p, i.scale * .65, i.scale * .65), h.fill()
                    } else if (i.name == "spikes" || i.name == "greater spikes" || i.name == "poison spikes" || i.name == "spinning spikes") {
                        let e = i.name == "spikes" ? 8 : 8.5;
                        let t = i.name == "spikes" ? .6 : .65;
                        h.shadowBlur = n ? e : 0;
                        h.shadowColor = `rgba(0, 0, 0, ${t})`;
                        h.fillStyle = i.name == "poison spikes" ? "#7b935d" : "#79A9CA";
                        var u = i.scale * .6;
                        if (s || (Os.checked ? true : !o?.fake)) {
                            Q2(h, i.name == "spikes" ? 5 : 6, i.scale, u);
                            h.fill();
                            h.stroke();
                            h.fillStyle = "#a5974c";
                            h.shadowBlur = 0, h.shadowColor = null;
                            k(0, 0, u, h);
                            h.fillStyle = "#c9b758";
                            k(0, 0, u / 2, h, !0)
                        } else if (o?.fake) {
                            h.strokeStyle = !o?.fake ? "#525252" : o?.restricter ? "#6bed5f" : o?.preplace ? "#d4577c" : "#000000", Q2(h, i.name == "spikes" ? 5 : 6, i.scale, u);
                            h.stroke();
                            h.shadowBlur = 0, h.shadowColor = null;
                            if (!o?.fake) {
                                h.beginPath();
                                h.arc(0, 0, u, 0, ae);
                                h.stroke()
                            }
                        }
                    } else if (i.name == "windmill" || i.name == "faster windmill" || i.name == "power mill") h.fillStyle = "#a5974c", k(0, 0, i.scale, h), h.fillStyle = "#c9b758", z2(0, 0, i.scale * 1.5, 29, 4, h), h.shadowBlur = 0, h.shadowColor = null, h.fillStyle = "#a5974c", k(0, 0, i.scale * .5, h);
                    else if (i.name == "mine") h.fillStyle = "#939393", Q2(h, 3, i.scale, i.scale), h.fill(), h.stroke(), h.fillStyle = "#bcbcbc", Q2(h, 3, i.scale * .55, i.scale * .65), h.fill();
                    else if (i.name == "sapling")
                        for (var d = 0; d < 2; ++d) {
                            var u = i.scale * (d ? .5 : 1);
                            Q2(h, 7, u, u * .7), h.fillStyle = d ? "#b4db62" : "#9ebf57", h.fill(), d || h.stroke()
                        } else if (i.name == "pit trap") {
                            h.shadowBlur = n ? 8.5 : 0;
                            h.shadowColor = `rgba(0, 0, 0, ${.65})`;
                            if (s || (Os.checked ? true : !o?.fake)) {
                                h.fillStyle = "#a5974c", Q2(h, 3, i.scale * 1.1, i.scale * 1.1), h.fill(), h.stroke(), h.fillStyle = D0, Q2(h, 3, i.scale * .65, i.scale * .65), h.fill()
                            } else if (o?.fake || o?.preplace) {
                                h.strokeStyle = !o?.fake ? "#525252" : o?.restricter ? "#6bed5f" : o?.preplace ? "#d4577c" : "#5e79db", Q2(h, 3, i.scale * 1.1, i.scale * 1.1), h.stroke();
                                if (!o?.fake) {
                                    Q2(h, 3, i.scale * .65, i.scale * .65), h.stroke()
                                }
                            }
                        } else if (i.name == "boost pad") h.fillStyle = "#7e7f82", Y2(0, 0, i.scale * 2, i.scale * 2, h), h.fill(), h.stroke(), h.fillStyle = "#dbd97d", K2(i.scale * 1, h);
                    else if (i.name == "turret") {
                        h.fillStyle = "#a5974c", k(0, 0, i.scale, h), h.fill(), h.stroke(), h.fillStyle = "#939393";
                        const p = 50;
                        Y2(0, -p / 2, i.scale * .9, p, h), k(0, 0, i.scale * .6, h), h.fill(), h.stroke()
                    } else if (i.name == "platform") {
                        h.fillStyle = "#cebd5f";
                        const p = 4,
                              m = i.scale * 2,
                              g = m / p;
                        let e = -(i.scale / 2);
                        for (var d = 0; d < p; ++d) Y2(e - g / 2, 0, g, i.scale * 2, h), h.fill(), h.stroke(), e += m / p
                    } else i.name == "healing pad" ? (h.fillStyle = "#7e7f82", Y2(0, 0, i.scale * 2, i.scale * 2, h), h.fill(), h.stroke(), h.fillStyle = "#db6e6e", z2(0, 0, i.scale * .65, 20, 4, h, !0)) : i.name == "spawn pad" ? (h.fillStyle = "#7e7f82", Y2(0, 0, i.scale * 2, i.scale * 2, h), h.fill(), h.stroke(), h.fillStyle = "#71aad6", k(0, 0, i.scale * .6, h)) : i.name == "blocker" ? (h.fillStyle = "#7e7f82", k(0, 0, i.scale, h), h.fill(), h.stroke(), h.rotate(W / 4), h.fillStyle = "#db6e6e", z2(0, 0, i.scale * .65, 20, 4, h, !0)) : i.name == "teleporter" && (h.fillStyle = "#7e7f82", k(0, 0, i.scale, h), h.fill(), h.stroke(), h.rotate(W / 4), h.fillStyle = "#d76edb", k(0, 0, i.scale * .5, h, !0));
                    r = f, e || (U2[i.id + t] = r)
                }
                i.lastAnim = ws.checked;
                return r
            }

            function W2(e, t, n, i, s) {
                const o = e + n * U(i),
                      r = t + n * V(i),
                      a = n * .4;
                s.moveTo(e, t), s.beginPath(), s.quadraticCurveTo((e + o) / 2 + a * U(i + W / 2), (t + r) / 2 + a * V(i + W / 2), o, r), s.quadraticCurveTo((e + o) / 2 - a * U(i + W / 2), (t + r) / 2 - a * V(i + W / 2), e, t), s.closePath(), s.fill(), s.stroke()
            }

            // ---- bundle 15097-15129: Q2 star, Y2 rect, z2 blades, G2 bush, K2 triangle ----
            function Q2(t, n, i, s) {
                let o = W / 2 * 3,
                    r, a;
                const l = W / n;
                t.beginPath(), t.moveTo(0, -i - 25e-6);
                for (let e = 0; e < n; e++) r = U(o) * i, a = V(o) * i, t.lineTo(r, a), o += l, r = U(o) * s, a = V(o) * s, t.lineTo(r, a), o += l;
                t.lineTo(0, -i), t.closePath()
            }

            function Y2(e, t, n, i, s, o) {
                s.fillRect(e - n / 2, t - i / 2, n, i), o || s.strokeRect(e - n / 2, t - i / 2, n, i)
            }

            function z2(e, t, n, i, s, o, r) {
                o.save(), o.translate(e, t), s = c(s / 2);
                for (let e = 0; e < s; e++) Y2(0, 0, n * 2, i, o, r), o.rotate(W / s);
                o.restore()
            }

            function G2(t, n, i, s) {
                let o = W / 2 * 3;
                const r = W / n;
                let a;
                t.beginPath(), t.moveTo(0, -s);
                for (let e = 0; e < n; e++) a = X.randInt(i + .9, i * 1.2), t.quadraticCurveTo(U(o + r) * a, V(o + r) * a, U(o + r * 2) * s, V(o + r * 2) * s), o += r * 2;
                t.lineTo(0, -s), t.closePath()
            }

            function K2(e, t) {
                t = t || mainContext;
                const n = e * (D(3) / 2);
                t.beginPath(), t.moveTo(0, -n / 2), t.lineTo(-e / 2, n / 2), t.lineTo(e / 2, n / 2), t.lineTo(0, -n / 2), t.fill(), t.closePath()
            }

            // ---- bundle 15520-15540: ag / lg animal sprite, cg on-screen test ----
            const ag = {};

            function lg(e, t) {
                const n = e.index;
                let i = ag[n];
                if (!i) {
                    const s = new Image;
                    s.onload = function() {
                        this.isLoaded = !0, this.onload = null
                    }, s.src = ".././img/animals/" + e.src + ".png", i = s, ag[n] = i
                }
                if (i.isLoaded) {
                    const s = e.scale * 1.2 * (e.spriteMlt || 1);
                    t.drawImage(i, -s, -s, s * 2, s * 2)
                }
            }

            function cg(e, t, n) {
                return e + n >= 0 && e - n <= Oh && t + n >= 0 && t - n <= Lh
            }

/* ===== examplescript/82-render.js ===== */
            // =====================================================================
            // RENDER — the bundle's game renderer (l2, 14065) on the overlay.
            // =====================================================================
            // The bundle drew the whole game itself, and most of its visuals are part
            // of that drawing (player colours, sprite shadows, see-through players,
            // the pulse on buildings being hit, placement previews, hidden names,
            // its grid and tint, zoom). So the overlay draws the bundle's full frame,
            // opaque, over the official client's canvas. If a frame throws, the
            // overlay clears and the official rendering shows through.
            const D0 = "#525252", P0 = "#3d3f42", R0 = 5.5, rh = ae;
            const fe = { hats: {}, accessories: {}, weapons: {}, animals: {} };
            let mainContext = null;
            let Oh = K.maxScreenWidth, Lh = K.maxScreenHeight;      // view size (q + wheel zoom)
            let Ph = K.mapScale / 2, Rh = K.mapScale / 2;            // camera
            let mh = 16, gh = Date.now(), xh = Date.now(), yh, a2;
            let Th = 1, Ch = 0;
            const Wm = false;      // the bundle's "still on the main menu" flag (false once in game)
            let Et = 0;
            const K1 = { animationTime: 0, land: null, lava: null, x: K.volcanoLocationX, y: K.volcanoLocationY };
            // volcano sprites + crown/skull icons (need a DOM; the mod also runs headless in tests)
            try { V2(); n2(); } catch (e) { /* no document: nothing is drawn anyway */ }
            objects.setMillRotate && objects.setMillRotate(() => us.checked);
            ctx.onCleanup(() => { objects.setMillRotate && objects.setMillRotate(null); });

            // ---- player / animal swing animation (Player 4059, AI 3003) ----
            function playerAnimate(t, e) {
                t.animTime > 0 && (t.animTime -= e, t.animTime <= 0 ? (t.animTime = 0, t.dirPlus = 0, t._aa = 0, t._al = 0) : t._al == 0 ? (t._aa += e / (t.animSpeed * K.hitReturnRatio), t.dirPlus = X.lerp(0, t.targetAngle, j(1, t._aa)), t._aa >= 1 && (t._aa = 1, t._al = 1)) : (t._aa -= e / (t.animSpeed * (1 - K.hitReturnRatio)), t.dirPlus = X.lerp(0, t.targetAngle, oe(0, t._aa))));
            }
            function playerStartAnim(t, e, n) {
                t.animTime = t.animSpeed = x.weapons[n].speed, t.targetAngle = e ? -K.hitAngle : -W, t._aa = 0, t._al = 0;
            }
            function aiAnimate(t, e) {
                t.animTime > 0 && (t.animTime -= e, t.animTime <= 0 ? (t.animTime = 0, t.dirPlus = 0, t._an = 0, t._ai = 0) : t._ai == 0 ? (t._an += e / (t.animSpeed * K.hitReturnRatio), t.dirPlus = X.lerp(0, t.targetAngle, j(1, t._an)), t._an >= 1 && (t._an = 1, t._ai = 1)) : (t._an -= e / (t.animSpeed * (1 - K.hitReturnRatio)), t.dirPlus = X.lerp(0, t.targetAngle, oe(0, t._an))));
            }
            function aiStartAnim(t) { t.animTime = t.animSpeed = 600, t.targetAngle = W * .8, t._an = 0, t._ai = 0; }
            function withAnim(q2) {
                if (q2 && !q2.animate) {
                    q2.dirPlus = q2.dirPlus || 0; q2.animTime = 0; q2.animSpeed = 0; q2.targetAngle = 0;
                    if (q2.isAI) { q2.animate = function (e) { aiAnimate(this, e); }; q2.startAnim = function () { aiStartAnim(this); }; }
                    else { q2.animate = function (e) { playerAnimate(this, e); }; q2.startAnim = function (e, t) { playerStartAnim(this, e, t); }; }
                }
                return q2;
            }
            for (const p0 of J) withAnim(p0);
            own(combat.onPlayerAdded(function (e) { withAnim(e); }));
            ctx.on("gatherAnimation", function (pk) {
                const a = pk && pk.args; if (!a) return;
                const s = Hg(a[0]);
                s && withAnim(s).startAnim(a[1], a[2]);
            });
            ctx.on("animalAttack", function (pk) {
                const q2 = Wg(pk && pk.args && pk.args[0]);
                q2 && withAnim(q2).startAnim();
            });

            // ---- client-side projectiles (wc 4541, Hl.addProjectile 2692, addProjectile 15167) ----
            const Ah = [];
            function wc() {
                this.init = function (e, t, n, i, s, o, r, a, l) {
                    this.active = !0, this.indx = e, this.x = t, this.y = n, this.dir = i, this.skipMov = !0, this.speed = s, this.dmg = o, this.scale = a, this.range = r, this.owner = l;
                };
                this.update = function (e) {
                    if (this.active) {
                        let n = this.speed * e;
                        this.skipMov ? this.skipMov = !1 : (this.x += n * U(this.dir), this.y += n * V(this.dir), this.range -= n, this.range <= 0 && (this.x += this.range * U(this.dir), this.y += this.range * V(this.dir), n = 1, this.range = 0, this.active = !1));
                    }
                };
            }
            function addProjectileR(e, t, n, i, s, o, r, a, l) {
                const c3 = x.projectiles[o];
                let d6;
                for (let k6 = 0; k6 < Ah.length; ++k6) if (!Ah[k6].active) { d6 = Ah[k6]; break; }
                return d6 || (d6 = new wc(), d6.sid = Ah.length, Ah.push(d6)), d6.init(o, e, t, n, s, c3.dmg, i, c3.scale, r), d6.ignoreObj = a, d6.layer = l || c3.layer, d6.src = c3.src, d6;
            }
            // "X" [x, y, dir, range, speed, index, layer, sid]
            ctx.on("projectileAdd", function (pk) {
                const a = pk && pk.args; if (!a) return;
                addProjectileR(a[0], a[1], a[2], a[3], a[4], a[5], null, null, a[6]).sid = a[7];
            });
            // "Y" [sid, range]
            ctx.on("projectileRemove", function (pk) {
                const a = pk && pk.args; if (!a) return;
                for (let e = 0; e < Ah.length; ++e) Ah[e].sid == a[0] && (Ah[e].range = a[1]);
            });

            // ---- the "8" damage / heal numbers (showText 13701) ----
            ctx.on("showText", function (pk) {
                const e = pk.x, t = pk.y, n = pk.value, i = pk.type;
                if (n < 0 || !hs.checked) {
                    i === -1 ? U1.showText(e, t, 50, .18, 500, n, "#ee5551") : ps.checked ? zi.push({ x: e, y: t, value: n }) : U1.showText(e, t, 50, .18, 500, S(n), n >= 0 ? "#fff" : "#8ecc51");
                }
            });

            // ---- chat bubbles (receiveChat sets these, 13248) ----
            ctx.on("chat", function (pk) {
                const t = Hg(pk && pk.sid);
                t && (t.chatMessage = pk.message, t.chatCountdown = K.chatCountdown);
            });

            // ---- the view: canvas at 0.7x resolution, scaled to cover (sm, 13270) ----
            let tm = win.innerWidth, nm = win.innerHeight;
            function sm() {
                Fh = win.innerWidth;
                _h = win.innerHeight;
                im *= Math.min(Oh / tm, Lh / nm);
                tm = Oh;
                nm = Lh;
                const e = Math.max(Fh / Oh, _h / Lh) * .7;
                if (!ovl.canvas) return;
                ovl.canvas.width = Fh * .7;
                ovl.canvas.height = _h * .7;
                ovl.canvas.style.width = Fh + "px";
                ovl.canvas.style.height = _h + "px";
                ovl.transform = [e, 0, 0, e, (Fh * .7 - Oh * e) / 2, (_h * .7 - Lh * e) / 2];
            }

            // ---- one frame of the bundle (l2) ----
            function l2() {
                {
                    if (z && (!yh || gh - yh >= 1e3 / K.clientSendRate)) {
                        yh = gh;
                        const r = wm();
                        a2 !== r && (a2 = r);
                    }
                    let e = J.indexOf(z) >= 0 ? z : null;     // the bundle's z exists once you spawned
                    if (e) {
                        const r = X.getDistance(Ph, Rh, e.x, e.y),
                            v6 = X.getDirection(e.x, e.y, Ph, Rh),
                            a = j(r * .01 * mh, r);
                        r > .05 ? (Ph += a * U(v6), Rh += a * V(v6)) : (Ph = e.x, Rh = e.y);
                    } else Ph = K.mapScale / 2, Rh = K.mapScale / 2;
                    // Players and animals are interpolated by ctx.combat every frame; the
                    // fake previews (Ci, the "spike kb visual") only exist here (14078-14090).
                    const x6 = gh - ce;
                    for (let s6 = 0; s6 < Ci.length; ++s6) {
                        if ((q = Ci[s6]) && (q.visible || q.fake)) {
                            if (q.forcePos) q.x = q.x2, q.y = q.y2, q.dir = q.d2;
                            else {
                                var r6 = q.t2 - q.t1, a6 = (x6 - q.t1) / r6;
                                q.dt += mh;
                                var c6 = j(1.7, q.dt / 170);
                                var i6 = q.x2 - q.x1;
                                q.x = q.x1 + i6 * c6, i6 = q.y2 - q.y1, q.y = q.y1 + i6 * c6, q.lastx = q.x;
                                q.lasty = q.y;
                                q.dir = Math.lerpAngle(q.d2, q.d1, j(1.2, a6));
                            }
                        }
                    }
                    const w = Ph - Oh / 2 + pi,
                        b = Rh - Lh / 2 + mi;
                    K.snowBiomeTop - b <= 0 && K.mapScale - K.snowBiomeTop - b >= Lh ? (mainContext.fillStyle = "#b6db66", mainContext.fillRect(0, 0, Oh, Lh)) : K.mapScale - K.snowBiomeTop - b <= 0 ? (mainContext.fillStyle = "#dbc666", mainContext.fillRect(0, 0, Oh, Lh)) : K.snowBiomeTop - b >= Lh ? (mainContext.fillStyle = "#fff", mainContext.fillRect(0, 0, Oh, Lh)) : K.snowBiomeTop - b >= 0 ? (mainContext.fillStyle = "#fff", mainContext.fillRect(0, 0, Oh, K.snowBiomeTop - b), mainContext.fillStyle = "#b6db66", mainContext.fillRect(0, K.snowBiomeTop - b, Oh, Lh - (K.snowBiomeTop - b))) : (mainContext.fillStyle = "#b6db66", mainContext.fillRect(0, 0, Oh, K.mapScale - K.snowBiomeTop - b), mainContext.fillStyle = "#dbc666", mainContext.fillRect(0, K.mapScale - K.snowBiomeTop - b, Oh, Lh - (K.mapScale - K.snowBiomeTop - b))), Wm || (Th += Ch * K.waveSpeed * mh, Th >= K.waveMax ? (Th = K.waveMax, Ch = -1) : Th <= 1 && (Th = Ch = 1), mainContext.globalAlpha = 1, mainContext.fillStyle = "#dbc666", p2(w, b, mainContext, K.riverPadding), mainContext.fillStyle = "#91b2db", p2(w, b, mainContext, (Th - 1) * 250)), mainContext.lineWidth = 4, mainContext.strokeStyle = "#000", mainContext.globalAlpha = .06, mainContext.beginPath();
                    if (!gs.checked && !vo.checked) {
                        for (var d = (14400 - w) % 1440; d < Oh; d += 1440) d > 0 && (mainContext.moveTo(d, 0), mainContext.lineTo(d, Lh));
                        for (var u6 = (14400 - b) % 1440; u6 < Lh; u6 += 1440) u6 > 0 && (mainContext.moveTo(0, u6), mainContext.lineTo(Oh, u6));
                    } else {
                        for (var f6 = -Ph; f6 < Oh; f6 += Lh / 18) f6 > 0 && (mainContext.moveTo(f6, 0), mainContext.lineTo(f6, Lh));
                        for (let e6 = -Rh; e6 < Lh; e6 += Lh / 18) f6 > 0 && (mainContext.moveTo(0, e6), mainContext.lineTo(Oh, e6));
                    }
                    mainContext.stroke(), mainContext.globalAlpha = 1, mainContext.strokeStyle = D0, b2(-1, w, b), mainContext.globalAlpha = 1, mainContext.lineWidth = R0, c2(0, w, b), A2(w, b, 0), mainContext.globalAlpha = 1;
                    for (var s = 0; s < bh.length; ++s) q = withAnim(bh[s]), q.active && q.visible && (q.animate(mh), mainContext.save(), mainContext.translate(q.x - w, q.y - b), mainContext.rotate(q.dir + q.dirPlus - W / 2), lg(q, mainContext), mainContext.restore());
                    if (b2(0, w, b), c2(1, w, b), b2(1, w, b), A2(w, b, 1), b2(2, w, b), b2(3, w, b), mainContext.fillStyle = "#000", mainContext.globalAlpha = .09, w <= 0 && mainContext.fillRect(0, 0, -w, Lh), K.mapScale - w <= Oh) {
                        var hh = oe(0, -b);
                        mainContext.fillRect(K.mapScale - w, hh, Oh - (K.mapScale - w), Lh - hh);
                    }
                    if (b <= 0 && mainContext.fillRect(-w, 0, Oh + w, -b), K.mapScale - b <= Lh) {
                        var pp = oe(0, -w);
                        let e7 = 0;
                        K.mapScale - w <= Oh && (e7 = Oh - (K.mapScale - w)), mainContext.fillRect(pp, K.mapScale - b, Oh - pp - e7, Lh - (K.mapScale - b));
                    }
                    if (z && si?.goal?.pathing) {
                        mainContext.globalAlpha = 1;
                        mainContext.save();
                        mainContext.translate(-w, -b);
                        ri?.drawPath(mainContext, "#ffffff", z, "#00FF00");
                        si?.drawWaypoints(mainContext, z.skinRot);
                        mainContext.restore();
                    }
                    mainContext.fillStyle = vo.checked ? `rgba(0, 0, 70, 0.35)` : `rgba(15, 0, 70, 0.49)`;
                    mainContext.globalAlpha = 1, mainContext.fillRect(0, 0, Oh, Lh), mainContext.strokeStyle = P0;
                    l2Players(w, b);
                    U1.update(mh, mainContext, w, b);
                    l2Chat(w, b);
                    if (!Ss.checked) {
                        Et += (1 - Et) / 160;
                        const _t = mainContext.getTransform();
                        mainContext.setTransform(1, 0, 0, 1, 0, 0);
                        mainContext.fillStyle = `rgba(${[24, 0, 82, .3].map((e8) => e8 * Et).join(", ")})`;
                        mainContext.fillRect(0, 0, ovl.canvas.width, ovl.canvas.height);
                        mainContext.setTransform(_t);
                    }
                    Sp(mh);
                }
            }

            // ---- the per-player overlay of l2 (bundle 14128-14391), verbatim ----
            function l2Players(w, b) {
                        let t = J.concat(ts.players, es.rPlayers);
                        for (var s = 0; s < t.length + bh.length; ++s)
                            if (q = t[s] || bh[s - t.length], q?.visible && (q?.skinIndex != 10 || q?.skinIndex == 10 || q == z || q?.team && q?.team == z.team)) {
                                const v = (q.team ? "[" + q.team + "] " : "") + (q.name || "");
                                if (!eo.checked && !Ei.includes(q.sid) && ws.checked) {
                                    if (v !== "") {
                                        mainContext.font = (q.nameScale || 30) + "px Lilita One";
                                        mainContext.fillStyle = bo.checked ? "#fff" : q.isAI ? "#f2eff9" : q === z ? "#a0cac2" : q.team && q.team === z.team ? "#a6c7e7" : "#ebaebc";
                                        mainContext.textBaseline = "middle";
                                        mainContext.textAlign = "center";
                                        mainContext.lineWidth = q.nameScale ? 11 : 8;
                                        mainContext.lineJoin = "round";
                                        const A = q.x - w;
                                        const I = q.y - b - q.scale - K.nameY;
                                        mainContext.strokeText(v, A, I);
                                        mainContext.fillText(v, A, I);
                                        if (q.isLeader && e2.crown.isLoaded) {
                                            const S = K.crownIconScale;
                                            const E = A - S / 2 - mainContext.measureText(v).width / 2 - K.crownPad;
                                            mainContext.drawImage(e2.crown, E, I - S / 2 - 5, S, S)
                                        }
                                        if (q.iconIndex === 1 && e2.skull.isLoaded) {
                                            const T = K.crownIconScale;
                                            const C = A + mainContext.measureText(v).width / 2 + K.crownPad - T / 2;
                                            mainContext.drawImage(e2.skull, C, I - T / 2 - 5, T, T)
                                        }
                                    }
                                }
                                if (q.isPlayer && ws.checked) {
                                    mainContext.globalAlpha = 1;
                                    mainContext.textAlign = "center";
                                    mainContext.fillStyle = q.customColor;
                                    mainContext.font = "19px Lilita One";
                                    mainContext.strokeStyle = "#212123";
                                    mainContext.lineWidth = 6;
                                    mainContext.strokeText(q.sid, q.x - w, q.y - b);
                                    mainContext.fillText(q.sid, q.x - w, q.y - b)
                                }
                                if (q.isPlayer && ws.checked && !Ei.includes(q.sid)) {
                                    if (!Ei.includes(q.sid) || G?.["do"] && ts?.bot?.sid == q.sid) {
                                        if (q.sid != z.sid && !vo.checked) {
                                            mainContext.globalAlpha = 1;
                                            mainContext.textAlign = "center", mainContext.fillStyle = "#fff", mainContext.font = "20px Lilita One", mainContext.strokeStyle = "#212123", mainContext.lineWidth = 3, mainContext.strokeText(`[${q.gainSpeed?H(q.gainSpeed):0} / ${q.leakSpeed?H(q.leakSpeed):0}]`, q.x - w, q.y - b - 50);
                                            mainContext.fillText(`[${q.gainSpeed?H(q.gainSpeed):0} / ${q.leakSpeed?H(q.leakSpeed):0}]`, q.x - w, q.y - b - 50)
                                        }
                                        if (xs.checked || !vo.checked) {
                                            const B = bo.checked ? 29 : 12;
                                            mainContext.textAlign = "center", mainContext.fillStyle = bo.checked ? "#fff" : q.isAI ? "#f2eff9" : q === z ? "#a0cac2" : q.team && q.team == z.team ? "#a6c7e7" : "#ebaebc", mainContext.font = "18px Lilita One", mainContext.strokeStyle = P0, mainContext.lineWidth = 5, mainContext.strokeText(!q.clowned ? q.shameCount : q.shameTimer > 0 ? H(1e3 * q.shameTimer) / 1e3 : 0, q.x - w, q.y - b + q.scale + K.nameY + B), mainContext.fillText(!q.clowned ? q.shameCount : q.shameTimer > 0 ? H(1e3 * q.shameTimer) / 1e3 : 0, q.x - w, q.y - b + q.scale + K.nameY + B)
                                        }
                                        if (!vo.checked || (ys.checked || bo.checked)) {
                                            mainContext.globalAlpha = .06;
                                            mainContext.beginPath();
                                            mainContext.arc(q.x - w, q.y - b, q.scale, W / 2, W / 2 + W / 1.5);
                                            mainContext.stroke();
                                            mainContext.strokeStyle = q.lastpr != 1 ? `hsl(${100-q.pr*405},100%,50%)` : "rgba(0, 0, 70, 0.35)";
                                            mainContext.lineWidth = 4;
                                            mainContext.beginPath();
                                            mainContext.globalAlpha = q.lastpr == 1 ? .06 : 1;
                                            mainContext.arc(q.x - w, q.y - b, q.scale, W / 2, W / 2 + W / 1.5 * (q.lastpr + (q.multpr - q.lastpr) * j(1, q.dt / q.delta)), false);
                                            mainContext.stroke();
                                            mainContext.strokeStyle = "rgba(0, 0, 70, 0.35)";
                                            mainContext.lineWidth = 6;
                                            mainContext.globalAlpha = .06;
                                            mainContext.beginPath();
                                            mainContext.arc(q.x - w, q.y - b, q.scale, W / 2 + W / 1.5 * 2, W / 2 + W / 1.5 * 2 + W / 1.5);
                                            mainContext.stroke();
                                            mainContext.globalAlpha = q.lastsr == 1 ? .06 : 1;
                                            mainContext.strokeStyle = q.lastsr != 1 ? `hsl(${100-q.sr*405},100%,50%)` : "rgba(0, 0, 70, 0.35)";
                                            mainContext.lineWidth = 4;
                                            mainContext.beginPath();
                                            mainContext.arc(q.x - w, q.y - b, q.scale, W / 2 + W / 1.5 * 2, W / 2 + W / 1.5 * 2 + W / 1.5 * (q.lastsr + (q.multsr - q.lastsr) * j(1, q.dt / q.delta)), false);
                                            mainContext.stroke();
                                            mainContext.strokeStyle = "rgba(0, 0, 70, 0.35)";
                                            mainContext.lineWidth = 6;
                                            mainContext.globalAlpha = .06;
                                            mainContext.beginPath();
                                            mainContext.arc(q.x - w, q.y - b, q.scale, W / 2 + W / 1.5, W / 2 + W / 1.2 + W / 2);
                                            mainContext.stroke();
                                            mainContext.globalAlpha = q.lasttr == 1 ? .06 : 1;
                                            mainContext.strokeStyle = q.lasttr != 1 ? `hsl(${100-q.tr*405},100%,50%)` : "rgba(0, 0, 70, 0.35)";
                                            mainContext.lineWidth = 4;
                                            mainContext.beginPath();
                                            mainContext.arc(q.x - w, q.y - b, q.scale, W / 2 + W / 1.5, W / 2 + W / 1.2 + W / 2 * (q.lasttr + (q.tr - q.lasttr) * j(1, q.dt / q.delta)), false);
                                            mainContext.stroke()
                                        }
                                        mainContext.globalAlpha = 1;
                                        if (bs.checked && z.sid == q.sid) {
                                            let e = He;
                                            let t = 0;
                                            t += (e - t) * .75;
                                            const D = 120;
                                            const P = t / D;
                                            let n, i, s;
                                            if (P < .5) {
                                                n = Math.floor(510 * P);
                                                i = 255;
                                                s = 0
                                            } else {
                                                n = 255;
                                                i = Math.floor(510 * (1 - P));
                                                s = 0
                                            }
                                            const R = `rgb(${n},${i},${s})`;
                                            mainContext.fillStyle = P0;
                                            mainContext.roundRect(q.x - w - K.healthBarWidth - K.healthBarPad + 34.7, q.y - b + q.scale - 170 + K.nameY, K.healthBarWidth * 2 / 3.25 + K.healthBarPad * 2, 17, 8);
                                            mainContext.fill();
                                            mainContext.fillStyle = R;
                                            mainContext.roundRect(q.x - w - K.healthBarWidth + 34.7, q.y - b + q.scale - 170 + K.nameY + K.healthBarPad, K.healthBarWidth * 2 / 3.25 * (t / 120), 17 - K.healthBarPad * 2, 7);
                                            mainContext.fill()
                                        }
                                    }
                                    if (Y && q.sid == Y.sid && typeof Ny === "object" && jt) {
                                        mainContext.globalAlpha = .3;
                                        mainContext.fillStyle = "#5f6ee7";
                                        mainContext.strokeStyle = "#5f6ee7";
                                        mainContext.beginPath();
                                        mainContext.arc(Ny.x - w, Ny.y - b, 35, 0, ae);
                                        mainContext.arc(Y.x2 + ne.x - w, Y.y2 + ne.y - b, 35, 0, ae);
                                        mainContext.fill()
                                    }
                                }
                                mainContext.font = "20px Lilita One";
                                const k = mainContext.measureText(q.name).width;
                                if (Y && q.isPlayer && q.sid == Y.sid && !vo.checked) {
                                    const e = se(z, Y) - 35;
                                    if (e > 350) {
                                        mainContext.globalAlpha = 0;
                                        mainContext.fillStyle = "black";
                                        mainContext.strokeStyle = "black";
                                        mainContext.lineWidth = 5;
                                        mainContext.beginPath();
                                        mainContext.moveTo(z.x - w, z.y - b);
                                        mainContext.lineTo(q.x - w, q.y - b);
                                        mainContext.stroke();
                                        mainContext.globalAlpha = 1;
                                        mainContext.fillStyle = "white";
                                        mainContext.lineWidth = 5;
                                        const M = (q.x + z.x) / 2 - w;
                                        const N = (q.y + z.y) / 2 - b;
                                        const O = M - k / 2;
                                        const L = N + 15;
                                        mainContext.strokeText(q.name, O, L);
                                        mainContext.fillText(q.name, O, L)
                                    }
                                }
                                if (q.isAI) {
                                    mainContext.globalAlpha = 1;
                                    mainContext.textAlign = "center", mainContext.fillStyle = "#fff", mainContext.font = "20px Lilita One", mainContext.strokeStyle = "#212123", mainContext.lineWidth = 3, mainContext.strokeText(q.health, q.x - w, q.y - b), mainContext.fillText(q.health, q.x - w, q.y - b)
                                }
                                if (Vt?.length && q.sid == z.sid) {
                                    mainContext.globalAlpha = .4;
                                    mainContext.lineWidth = 5;
                                    mainContext.strokeStyle = "black";
                                    mainContext.beginPath();
                                    mainContext.arc(Ft.x - w, Ft.y - b, Ft.scale, 0, ae);
                                    mainContext.stroke();
                                    mainContext.globalAlpha = 1
                                }
                                if (Y && q.sid == Y.sid && q.isPlayer && (un || fn && ee == 5)) {
                                    mainContext.globalAlpha = 1;
                                    if (q.scaler === undefined) {
                                        q.scaler = 0;
                                        q.scalerR = false;
                                        q.rotater = 0;
                                        q.rotaterR = false
                                    }
                                    q.scalerR ? q.scaler -= .05 : q.scaler += .05;
                                    q.rotaterR ? q.rotater -= 1.8 : q.rotater += 1.8;
                                    if (q.rotater >= 360) q.rotater = 0;
                                    if (Math.round(q.scaler * 10) / 10 >= 1 || Math.round(q.scaler * 10) / 10 <= -1) q.scalerR = !q.scalerR;
                                    mainContext.strokeStyle = "#ba5e69";
                                    mainContext.lineWidth = 5;
                                    let o = q.scale + 15 + q.scaler * 5;
                                    let e = Math.PI / 6;
                                    let i = 2 * Math.PI / 3 - e;
                                    for (let n = 0; n < 3; n++) {
                                        let e = 2 * Math.PI / 3 * n + Z(q.rotater);
                                        let t = e + i;
                                        mainContext.beginPath();
                                        mainContext.arc(q.x - w, q.y - b, o, e, t);
                                        mainContext.stroke()
                                    }
                                    mainContext.fillStyle = "#ba5e69";
                                    let t = 3;
                                    let n = 20 + q.scaler * 4;
                                    let r = 30 + q.scaler * 6;
                                    let a = [Z(q.rotater) + i / 2 + W / 3, Z(q.rotater) + 2 * W / 3 + i / 2 + W / 3, Z(q.rotater) + 4 * W / 3 + i / 2 + W / 3];
                                    for (let s = 0; s < t; s++) {
                                        let e = a[s];
                                        let t = f2(q.x, q.y, e, o);
                                        let n = f2(t.x, t.y, e + W / 6, r);
                                        let i = f2(t.x, t.y, e - W / 6, r);
                                        mainContext.beginPath();
                                        mainContext.moveTo(t.x - w, t.y - b);
                                        mainContext.lineTo(n.x - w, n.y - b);
                                        mainContext.lineTo(i.x - w, i.y - b);
                                        mainContext.closePath();
                                        mainContext.fill()
                                    }
                                }
                                if (q.sid === z.sid && !q.isAI) {
                                    Ci.forEach(e => {
                                        if (e.purpose === "formation" && e.showSID) {
                                            mainContext.globalAlpha = 1;
                                            mainContext.textAlign = "center";
                                            mainContext.fillStyle = "white";
                                            mainContext.font = "19px Lilita One";
                                            mainContext.strokeStyle = "black";
                                            mainContext.lineWidth = 6;
                                            mainContext.strokeText(e.sid, e.x - w, e.y - b);
                                            mainContext.fillText(e.sid, e.x - w, e.y - b)
                                        }
                                    });
                                    mainContext.globalAlpha = 1;
                                    mainContext.lineWidth = 5;
                                    for (let e = 0; e < Q.length; e++) {
                                        if (Q[e].group !== undefined && Q[e].type === null && Q[e].distance <= 300 && ks.checked && Q[e].health !== Q[e].maxHealth) {
                                            const F = Q[e].health;
                                            mainContext.fillStyle = bo.checked ? "black" : z.sid == Q[e].owner.sid ? adjustColorBrightness("#657ba3", .35) : te(Q[e].owner.sid) && Q[e].owner.sid !== z.sid ? adjustColorBrightness("#657ba3", .35) : adjustColorBrightness("#a4628a", .35);
                                            mainContext.roundRect(Q[e].x - w - 33 - K.healthBarPad, Q[e].y - b + Q[e].scale + K.nameY - 120, 1.45 * 45 + 2 * K.healthBarPad, 17, 10);
                                            mainContext.fill();
                                            mainContext.fillStyle = bo.checked ? z.sid == Q[e].owner.sid ? "#2693c7" : te(Q[e].owner.sid) && Q[e].owner.sid != z.sid ? "#2693c7" : "#c9346b" : z.sid == Q[e].owner.sid ? "#93d1fa" : te(Q[e].owner.sid) && Q[e].owner.sid !== z.sid ? "#93d1fa" : "#d38595";
                                            mainContext.roundRect(Q[e].x - w - 33, Q[e].y - b + Q[e].scale + K.nameY - 120 + K.healthBarPad, 1.45 * 45 * (Q[e].health / Q[e].maxHealth), 17 - 2 * K.healthBarPad, 10);
                                            mainContext.fill()
                                        }
                                        if (Q[e].group !== undefined && Q[e].owner?.sid > 0 && Q[e].active !== 0 && As.checked) {
                                            mainContext.fillStyle = bo.checked ? te(Q[e].owner.sid) ? "#2693c7" : "#c9346b" : te(Q[e].owner.sid) ? "#93d1fa" : "#d38595";
                                            mainContext.textBaseline = "middle";
                                            mainContext.textAlign = "center";
                                            mainContext.font = "13px Lilita One";
                                            mainContext.strokeStyle = bo.checked ? "black" : "#212123";
                                            mainContext.strokeText(Q[e].owner.sid.toString(), Q[e].x - w, Q[e].y - b + Q[e].scale - 20);
                                            mainContext.fillText(Q[e].owner.sid.toString(), Q[e].x - w, Q[e].y - b + Q[e].scale - 20)
                                        }
                                    }


                                }



                                // health bar
                                mainContext.strokeStyle = P0;
                                mainContext.globalAlpha = 1;
                                if (q.health > 0) {
                                    mainContext.fillStyle = P0;
                                    mainContext.roundRect(q.x - w - K.healthBarWidth - K.healthBarPad, q.y - b + q.scale + K.nameY, K.healthBarWidth * 2 + K.healthBarPad * 2, 17, 8);
                                    mainContext.fill();
                                    const neonColor = (q === z || (q.team && q.team === z.team)) ? "#00fffc" : "#ff3d3d";
                                    mainContext.shadowColor = neonColor;
                                    mainContext.shadowBlur = 10;
                                    mainContext.shadowOffsetX = 0;
                                    mainContext.shadowOffsetY = 0;
                                    let t = !bo.checked ? q.isAI ? q.health2 : q.lastHealth === undefined || q.animatedHealth === undefined ? q.health2 : q.lastHealth + (q.health - q.lastHealth) * j(1, oe(0, 1 - re(1 - j(1, (Date.now() - q.animatedHealth) / 250), 2))) : q.health;
                                    mainContext.fillStyle = neonColor;
                                    mainContext.roundRect(q.x - w - K.healthBarWidth, q.y - b + q.scale + K.nameY + K.healthBarPad, K.healthBarWidth * 2 * (t / q.maxHealth), 17 - K.healthBarPad * 2, 7);
                                    mainContext.fill();
                                    mainContext.fillStyle = neonColor;
                                    mainContext.font = "bold 19px Arial";
                                    mainContext.fillText('<<', q.x - w - K.healthBarWidth - K.healthBarPad - 20, q.y - b + q.scale + K.nameY + K.healthBarPad + 6);
                                    mainContext.fillText('>>', q.x - w + K.healthBarWidth + K.healthBarPad + 20, q.y - b + q.scale + K.nameY + K.healthBarPad + 6);
                                    mainContext.shadowColor = "transparent";
                                }
                }
            }
            // ---- chat bubbles + the bot status message (bundle 14392-14457), verbatim ----
            function l2Chat(w, b) {
                        let n = J.concat(ts.players, es.rPlayer);
                        for (var s = 0; s < n.length; ++s) {
                            if (q = n[s], q?.visible && !Ei.includes(q?.sid) && q.chatCountdown > 0) {
                                q.chatCountdown -= mh, q.chatCountdown <= 0 && (q.chatCountdown = 0);
                                mainContext.font = "30px Lilita One";
                                const v = mainContext.measureText(q.chatMessage);
                                mainContext.strokeStyle = "black";
                                mainContext.lineWidth = 3;
                                mainContext.textBaseline = "middle", mainContext.textAlign = "center";
                                var p = q.x - w,
                                    h = q.y - q.scale - b - 90;
                                const c = 57,
                                      e = v.width + 27;
                                mainContext.filter = "blur(2px)";
                                mainContext.fillStyle = "rgba(0, 0, 0, 0.3)";
                                mainContext.roundRect(p - e / 2, h - c / 2, e, c, 9);
                                mainContext.fill();
                                mainContext.filter = "none";
                                mainContext.beginPath();
                                mainContext.moveTo(p - e / 2 + 6, h - c / 2);
                                mainContext.lineTo(p + e / 2 - 6, h - c / 2);
                                mainContext.quadraticCurveTo(p + e / 2, h - c / 2, p + e / 2, h - c / 2 + 6);
                                mainContext.lineTo(p + e / 2, h + c / 2 - 6);
                                mainContext.quadraticCurveTo(p + e / 2, h + c / 2, p + e / 2 - 6, h + c / 2);
                                mainContext.lineTo(p - e / 2 + 6, h + c / 2);
                                mainContext.quadraticCurveTo(p - e / 2, h + c / 2, p - e / 2, h + c / 2 - 6); // Bottom left corner
                                mainContext.lineTo(p - e / 2, h - c / 2 + 6); // Left edge
                                mainContext.quadraticCurveTo(p - e / 2, h - c / 2, p - e / 2 + 6, h - c / 2); // Top left corner
                                mainContext.closePath(); // Close the path
                                mainContext.stroke(); // Apply the stroke to draw the border

                                // Draw the chat message with neon cyan markers
                                // Draw the chat message with neon cyan markers
                                mainContext.fillStyle = "#fff"; // White text
                                mainContext.fillText(`${q.chatMessage}`, p, h); // Fill text without markers

                                // Add shadow properties for light blue shadow effect
                                mainContext.shadowColor = "black"; // Shadow color
                                mainContext.shadowBlur = 20; // Increased blur effect for shadow
                                mainContext.shadowOffsetX = 0; // Horizontal shadow offset
                                mainContext.shadowOffsetY = 0; // Vertical shadow offset

                                mainContext.strokeText(`${q.chatMessage}`, p, h); // Stroke for neon effect
                                mainContext.fillText(`${q.chatMessage}`, p, h); // Fill text

                                // Reset shadow properties to avoid affecting other drawings
                                mainContext.shadowColor = "transparent"; // Reset shadow color
                                mainContext.shadowBlur = 0; // Reset blur
                                mainContext.shadowOffsetX = 0; // Reset horizontal offset
                                mainContext.shadowOffsetY = 0; // Reset vertical offset
                            }
                            if (Zn.time > 0 && (q = n[s])?.sid == z?.sid && en) {
                                Zn.time -= mh;
                                mainContext.font = "30px Lilita One"; // Decreased from 48px to 40px
                                mainContext.strokeStyle = "#2d3030";
                                var g = mainContext.measureText(Zn.message);
                                mainContext.textBaseline = "middle", mainContext.textAlign = "center", p = q.x - w, h = q.y - q.scale - b - 140;
                                var y = g.width + 27; // Adjusted width for larger text
                                mainContext.fillStyle = "rgba(0, 0, 0, .5)", mainContext.roundRect(p - y / 2, h - 23.5, y, 57, 6), mainContext.fill(), mainContext.fillStyle = "#fff", mainContext.fillText(`${Zn.message}`, p, h);

                                // Draw neon cyan markers for Zn.message
                                mainContext.fillStyle = "#00FFFF"; // Neon cyan color
                                mainContext.fillText('<<  ', p - g.width / 2 - 10, h); // Draw the start marker
                                mainContext.fillText('  >>', p + g.width / 2 + 10, h); // Draw the end marker
                            }
                        }
            }

            // "Legacy Visuals" (bo.onclick, 13567): the health bar width follows it
            ctx.onSettingChange && ctx.onSettingChange((key) => { if (key === "Legacy Visuals") K.healthBarWidth = bo.checked ? 50 : 35; });

/* ===== examplescript/83-minimap.js ===== */
            // =====================================================================
            // MINIMAP — the bundle's Sp() extras (12107) on a canvas over the
            // official minimap: buildings destroyed out of your view (Yt) stay
            // marked with their item icon (the icons are the bundle's own).
            // The rest of the bundle's minimap (you, clan, pings, markers) is the
            // vanilla minimap, which the official client draws itself.
            // =====================================================================
            const ITEM_ICONS = {
                "wood wall": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAA4JJREFUeF7tmr1v00AYxh9baWmLxEcpbakYECyIBRALQojZcYfWlZBgQEKCjQkQ/wUwMdIBCQnE4jDkXDoihFgqYEEsSAwISCnlQ9C0SWQjJzE40fnzfHFKX29R7uz3/fl5nzvfnQK6mgQU4tAiQCDaSiAQBKLTFEgRpAhSBHegpNLol9KYnp47WK/buxcXS0t5zmlyVYSuGxsABtsAKoyZk3nByAWErhtOWMKMmT2Pq+cPjILgAeo1jJ6BCAIwMtQSx9o6P5ReAZEOQteNOwCu8EpBO12Dqrb+sW1g4ZlnF11jvIJ75bJ5UaZ/SAOh60YJwAwveP1MLTQn9pQPxHGcJ5ZV0mQAkQJC1+d+Ac72NBD+ekQADADfGDNHs4aRKYgwI4xSQVBiQepw2zvO+pBlWe4QLHxlAkIGgO7MwoBkYahCIDTNOKuqeMR7HSeONDAxZgu/Kf8NKisqlt4U+N8KinOhXC7dT/vAVCA0beaqqqq3eQ89dayOXTtC50sd3faObmv+/rIaX+Hffyp4/mqAm7Pj2Dcs6/HNpEBSgQgqhaQ+cGB/p5++//A7UfxB5ZKmVDIBIQqgO3tRILmASAJhsKBianI41lv/+LmKWiO+x/jV0bcghocKmBhreUHSq7Kygep6I7Jb34Po9oHIjAIaRJVL34LICkBc/yAQbVIEgkB0Fg0pghRBiuAOsFQaVBpUGlQaLoGgqTZ5BHkEecTm8ggv2qy+QjftZ7j/tY0MFzC+J93CzPLXDaxV/4OFGT+QwQEVUxMxl+oqVdTqm2ipzk00ybql2z6qXKLKoNskulezc1mz9AclCkQUgBdLL0FcA3CLZ98nj9YxulPuBs/qDwUvXvM3eABcZ8zkbj6FrZem2tfwbqhpxjlVxQPeA44fbmDfePwaj7Oo+2lZxcu3/C0/28b5hQXzYZz78NoIgfBuuOU3gbvJygAiexfcyyETRXCAuJuYIzwJxjXUEABrjJncQyhpy8LtJwVEc0jVDQagmAZGCASLMVMXSTiorzQQ//xj9i6gXOIFEPcwGeDMM1a6LAOA1NLgqiDgkOmWOV6YxFD9bdNMikQUI700kqhDZGYoAkGqWcYJrFg0aoqC5hTRcVC3LJN/wDLOzQTb5KIIf8zF4uwh97dlld4J5iLUPXcQQtFn2JlAtGESCALRWVekCFIEKYI71lBpUGl0CuMPpubCUvT4yHcAAAAASUVORK5CYII=",
                "stone wall": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAA2RJREFUeF7tmj9v00AYxp9YIopIOkArlXapBGozZa/6CZzr0LoSEgxISLAxAeJbABMjDEhIIBaHIee2HyDqwtSpiRi6pIrUiiEJCqlkI4dYONH5vy9O6Zstynvn9/35eZ9z7pwDfUYEcsThLwECMVYCgSAQk6ZAiiBFkCKECyW1xry0xvb23t3LS/PW4WHte5bPNJkqgjHtN4D8GECHc/1OVjAyAcGYZvkVzLk+87xmfsEgCA6gWcOYGQgvAIVCYVT7YDAQimRWQKSDYEx7B+CZqMrNzU0oijL6yTRNHB0diZe2HD7W6/pjmf4hDQRjWg3Ajij5ra0t35oajYbwd8uyDgyjpsoAIgUEY3s9wCrGgeCM8YIB4Cfn+u20YaQKws8Ig1TgVZgPEFjWoGAYhr0EJ/6kAkIGgOnK/ICkYaiJQKiqdl9R8FV0O8rlMhYXFxPfKfcEFxcXODk58TBU61G9XvsU94KxQKjqznNFUd6KLlqpVLCwsBA6n+Xl5VFsp9MJPabb7eL4+NjDUM1XhvHtdejJxoGxQHi1QlQfWF9fn8i31WpFyt+rXeK0SiogkgKYrj4pkExARIGQz+extrYW6q6fnp5iOByGirWD3OqYWxDFYhGrq6uhi3IHtttt9Pv9wLFzD2LaBwIr8ggIape5BZEWgLD+QSDGpAgEgZhsGlIEKYIUIVxgqTWoNag1qDVsAl6P2uQR5BHkEVfLI5xs0/oXemX/hrtvW6lUwsrKSqytiLOzM/R6vcCxc2uWosz/6606u+Ao+5Z2fFC7BLXBNOTp3exM9izdSSUFkhSAk8ssQbwA8EYk/6wPeAC85FwXHj75GU2scw1nQlXVHigKPosusLGxgaWlpUCTixJwfn6OZrMpHGKaeLi/r3+JMp87NhEIZ6Jrfwg8TV8GENmn4E4NqShCAMQ+kbkpkmlYQ/UB8ItzXfgSSty2sMdJAWFPzJjGAVTjwPCBYHCusyQFe42VBuKff+y+B3JPRAmEfZkMsD5wXnsqA4DU1hAlfO1fL4xiqO7YOA9FSRQjvTWiqCPJk2ESCFLNMkxi1ao2zOVww461LFwahu68oB5meKoxmSjCXUG1unvP/m4YtR+pVhZxssxBRMxXWjiBGKMlEARisstIEaQIUoRw5aHWoNaYFMYfhr/EUpJ56XkAAAAASUVORK5CYII=",
                "castle wall": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAA6pJREFUeF7tmkFrU0EQxzdRIpik0Ai1pSdFQcGLF8/pNe3BQr+P9fsI9dDm2py9eBEUFD2V1oIpNEnBoE1Z0wfvTfbNzuzOvg24PTabzczv/f+zs/u2ptLfPwK1xGFOIIG4VUICkUAUi0JSRFJEUoRxoUzWWBZr9Hqv9+v1u4PDw3eDmD1NVEX0eruzfPL9/kG0eCr/Ya0ApWpvsKdfq6nB0dHBVpUKqQQEJfmypOv1O1tV2CYoCAqAtY1NNR5dqqvxCBVAaCBBQEDvmzJ88fLVwr8no0v149sXqyNC1BIxEJTk9dNfW9+0JqoHnJ+dqPPTE3SsZC3xBrGzs9e9vv57jEXMAQDn+f71cyW28QaBKcEkf5IcSgZhUHzt4gVie3v3eDZT3Xzc0smXgfv08cPCRz4wvEBANVQFISMAYSwFCFcIq52OajTuqZ9np06uycOIAsJHDVnypszHk5GajMZkKFKqcLZGHsT9Vls9fvrcGnyj0VCrnQfWcXoAVSFRQcAlE7MFJ/kyQjYoRRizt/3++30S7dwgJ0VwbPFwfYMbk3E8BkNCFWwQUA2YLaQgZGTKYCx2oXxVsEHEUIMNhP7cVxVeIGyts7QiLoa/1HQ6NVoHqoK7lLJAwE4SK5LSEPiq4NmDBYJqi2a7pVrNtkiRhJNMp7/VxXBonNvHHs4gHj15pprtFWNAodTAVQXHHmQQVDXoYJcFhI6FCoMEIuaSaZIcZg/XpZQEAp49YqsFto+QLBplPQU8s6CedZJA6ASSNXKPMQ8jxtJpK5bw8JdaH/S8ZEVwVBHSHtg2vcLls/iWKoYqqJsv7gk3SxFQFVjRlNh+w+KKQai0xebYI0Q/QVUDp3/IYDsoomgPTBXSjZX0kplXHBsERxWS9sB2nj5F0lkRcxD0oilhEQwCPIugNlCw/jgpgqMK+INUu9iSz+aFnSSnd/C2hg8I/V1sm47tI0wtuoQt2A0VDITaaWJ7DK0QbvL5+aK/4PFVhcQGTEoNoorIEnN99ccFAyFwO0mxYplNVHYtgPr2iwPA9AY8+75rkfRaPvPBUy6K+ECh3JxxXTJFVg34JE13JeAY2/F/fjwFgB7vqwQxRZikTblPVXb4i8lfygammJ0bKoq3qbZptVesF8eU4r2noMQXxBrYD1OAlH8/LICg1sCgUGpJ6KdfuTVs8vyvL6VDOHPb/Om6XO6wgeZ8HrRYcgKJPTaBuH0CCUQCUTRjUkRSRFKEcYFK1kjWKArjBu9WC2HgRkavAAAAAElFTkSuQmCC",
                "spikes": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAABBdJREFUeF7tms1uEzEQx70JLZWQQgFxQCKiHLhFcATlgNpr+iFa8QC8Sds34QFQi/qRaysOERxBuXFAKEgcEFAiIRVKssibWvXOju3xrrMf4JX2knjt8W//Mx6PN2D+iggEnsOEgAdxrgQPwoOIBwWvCK+IkihibW1jC1ux9vZ20N+nvboV5hqdzpMtxoLN+ATD7W73pQfB2H8JYj3E5N7t7hai0kIG7XRwCAJMETByB4HHBqiN/F2kABBxNbTb7YhCr9eL0chbFbmCgC7RarVYo9GIAAwGg+iWrzxh5AZieXn9KAzZopgoB8BByBdURZ6rSC4gVlaeLo7HoyN50sIlYHQoykVyAQFdgqthOBySk8U8XGTqIKBLkGcvNfwnQJhyBiqYacOYmiJo+QJj169OEsxvP8ymBAE7PjzcXaLCs2lnHp3YGxYQsUfv3Rkxfuuuryc19ubdJW0bDiUI6tsHBy+OiSbq+8vSCfWt8zEe3v/DbsyPrYajABEd1mr1pSxQrBVhM3lhZOfxbysAsHH31azV82nUogWxurrxbDQaLyTrBnS7skIQI9nCkC3kagmC8cL+/s5zleVGRZiifrPZZPzmF0yGXEFQwRBJGc9J+v2+9u2YVh0jCN47hIFlhdwQOUnSxYS5y3V26+Ycavj34Rk7GeKuBGOG/BJEZ2n3LEQQybIahEFVw93bV0h+9eHTT7QddBGTHdT9CgkEtwjLEGUjZBAqNVAhCAIYjPcf64zf4lLZwP+3yTvIIDAXEdKEboHFhvnGLLvWmCGpQTT6/OWUnf5K5hyyKoQNaV1CjGUFAoPBt9IwUGEgbNWgUwV0D8wGU3CEbyQFCKwMH+82bxBwUmmSK2sQE1WoYfC9w6MHZwkXcKmI129nlHsTm7ggG5kKBOYiotOiQdi6ROoYIVNUJVtFuUZaCNEKYxXGQWPVjrMIEGnighPXEJ1g8QIDocsmVS9DlWUm9x3Zz0EyKeICRvysQlVzsA2YWEKFbc2zuISTGKGLF6oNFxUGNcV2ASFzjBAgsFih23TpskxVNsnHwtSQNTY4VYRN0MwSnLGaRCVARPlGxuqUAKcqzFQGhAsYuupUqUFgJ1muirfJvrMvnc6CJcwleI0Abs2FxClAYM1BPCsOjuNFoJKD4MZjNQIYLKkHPOraaAVA8EmrlGGzeujLcRUBISac/PbBjAL7hoI/VVrXgPVMXR3RPP1kC/nLGggibf0BjuJkrwFBcH+GnwHhAC5kTf18AJblSg3C9NZ1az/PUsNwtCl/ZqTrr4Ig7IMa5YS9EiBcGWlSiYsdqJMYAUt2rtJezCUwlZQMhL30TbHE9L+AUhoQJoOr8L8T16jCRE02ehDnhDwIDyLuLF4RXhFeEegC4l3Du4Z3DdQ1/gLN32VhHtKeXAAAAABJRU5ErkJggg==",
                "greater spikes": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAABB9JREFUeF7tm89rE0EUx2cT20aEpCoFBYN48Bb0qPQg7TX9gS3+Af4ntv+Jf4C00h+5VjwEPVZy8yASQaGoTUBMrUnkbTJxdjK/Z5xJzSzkkt2dmfeZ75v39s1uguKREkgihwGBCGKohAgigsguClERURETooi1tc2nrIi1v7/zPEQkC+Ya1erjLYSSZ1mj+9u12sutqQIBxlarG33S6FptN9jEBOuYhoCBhIIRBMTq6pOlXq97xHaBMO4RBARPDSFV4R0EDaFcLqf2N5vNjEB8u0hwEIuLiymAer0+PSBWVjaO+n20hC2uVCqoWCyOAISE4U0R9AIJAAAEeTQaDdRut0d/5XL55YODF6985BXeQLDWhlarlRqOVVEqlYKtFV5AyKKEbMZ9LJxKIEDW/X53lA6Tfi4zIsT5JEEjdzo83F1WGYMSCFY6rNK4yjXXSoMs+1tLeSgqzY6uUVWTVu+2EofR3b3dTX+i4+tpDr19d0nLYNbFOoutNxAqAGhj3hzPWClFVQ3QrxYIlovghAgbQecCIP2H98+tZpcFRNavDgRDENk6AqTIOE2m8wAXEDBBGgbZL4Rg6BsfOi6B79FWhEgVtBqqj35ZKYG+ufZ6NvOXy/TcCQiYHZwc4ZHK1HBjoYAuz+Uzhn1vn6PTNh/e+495BD98QL+QhJFqgHO6bmHkGngQsgjCU0NhLo9uLhSEShEBoVVBN2TiFpYgWDXHwbAe3PuNrs/3xoydL86iq8UZJXf5fNJBnbPxMEurItuYeVHHyDVkquCp4c6tK0oQ8EUfPv1gXs9ThYlLWC2Wf0GwVcECoaMG3P7Psy76ctIZg8EGYa4GK9cQqYIFQlcNIlWwQNiowRGIrCp40cIlCDqnMF0gSalZrRHQEF1wCQECITu3cKSI7CYNNDp1rsHetmODYCVQshDCyycmbrHkJVVTFT55aoBZ5j1yq2SVWCU8NYhrFeZrhdFiKd6yG5jCU4VKPsHLKqFdWYptGkaNQNAuAWV5eOgid6tkhRgWEF4ChVVCh02ofruqfDsBwXsc/q8fw2m3IHerQBGkKmSP4rKoQZ5nqQFvENH9muQV2oqg3UJWMnMBY+JKdbIahGiGTYCIH7nletJZOJUVoRIp5EPj1yrIe20B4Lb+CQgbNciUAucvzAYPbOljgy7Sll+S5LdVdtSVXUNF9rxrbNWkI3HTcXoBkWaa1KuEuPIN5/CrAa6SIxMY3kDEF0WI6RHlIPRuFWztq27pmyiAvsebInDHPBgh359yUqHSnY34eqHARWiYPqJEcNcYRBD+LpmLirSuSoO4Bm+tMEmLTQzm3eN9sSQHEj9TGNLIuoh5vdGFMoIqAgxYX99Mv9jZ29sJ8uUOhhgchIvZdNFGBDGkGEFEEFmHioqIioiKYAaZP321OmHR4N2KAAAAAElFTkSuQmCC",
                "poison spikes": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAABEJJREFUeF7tm01rE0EYx2ezpkkUklopKLWIoLeiR8WDtNf0BVv8AH4T22/iB5BW+pJrxYPoUelNQUSLQrE2AU1iTVZmN7Pdmc77TmcSOwu9dF9m5jf/53n+O7MJgD9iAoHnkBDwIAZK8CA8CDwpeEV4RQyJIhYXV57QKtbW1vozF5XMWWjU649WAQie4oOO1hqNF6vnCgQcbL2+HGUH3WhsOJsYZw2TEBAQVzCcgFhYeDzb7/d26SHgJjycgGCpwaUqrIMgIUxMF+PxH345xgRiO0Scg7j14GIM4OPr3+cHxPz88m4UgVk04qmZEqhUwxSASxjWFEEmyEq1AKZmypgK9vc6oN3qp/8rFMK57e3nL234CmsgaLmh3ezFA4dQ4FGphc5yhRUQoiohmnEbiVMKBJR1FPVSO5yNc9EgXJwPApCG087OxpxMH6RA0OywzMNlrpmoJS77sCndFZnHptfIqkmp9bwSh727faMX//GOH0cF8Pb9BaUB0y5WSbbWQMgAIAfz5l0xl1Jk1QDbVQJBCxFkiNAgSC8ApX//Lu4aVaeaBkTUrgoETRD4OgK0yMgmkz7ABAQEjYSRbbfd6oH9vW4u/6GsCJ4qSDXUH/5RnXzu9Y1XY9h5k/bcCAg4O8gcoZ6K1HB1sgwqpRN7De/72ToGRy02vA+fQwD/0jami6BSK2BqgOdUw0IrNFAnRBWEpYZyKQTXJnFrTcqAB4RUBXmvSqXI3quliCQ8aGuOyaPv3fkLroyfvDOgBserY+ByNXntFh3fDjqg0z1dZklV4M/RX9TRBkHLFalaGLnh5vVLovFj5z99/UW9nqUKnZBADeQEQVcFLSxU1IA61+72wPeDzikYdBD6asiVI3i5ggZCVQ3o+TRV0EDkUYMhEISvYBgokyBIT6GbII0kS/QQcsGFVTbPEgQA+cLCkCLwTZo4iVKSpUkQQxcarBJKA0EzUKISwvITQ5csWaaKZaZUVTES5ZNnqFiv3DKuEqmEpQb+WoV+rtDyEfwtu2QoLFXI+AmWq4TPFVls3TKqBYIMCbg/0W72sRVo0UIMDQjLQCGVkGUTrn6bWvk2AoL1Ovxfv4aTYZHdrYL7l9k9TNGruKhqZM/T1IA2iMh2dXyFsiLIsBAtmZmAMXRLdaI1CN4M6wDhv3KL9aSSOKUVIVMpxF1jr1Vk780LAD3rTEDkUYNIKfD8yGzwwC19NKBR2vILgnBNZkddOjRkZM+6Jq+aVCSu208rIGKnSXxKiFa+4Tn0aYApc6QDwxoI/6FIZnp4HoTcrYJb+7Jb+joKIO+xpgjUMAuGy++njKxQqc6G/7yQEyIkTBtVwnloJBWEvUtmYkVaVaVOQoOVK3Rssc6AWfdYT5bZjvifKQxo4CGiv95oQhlOFQEHsLS0Ev9iZ3Nz3ckvdxBE5yBMzKaJZ3gQA4oehAeBB5RXhFeEVwS1yPwDNX06YQXmnr8AAAAASUVORK5CYII=",
                "spinning spikes": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAABB9JREFUeF7tm89rE0EUx2cT20aEpCoFBYN48Bb0qPQg7TX9gS3+Af4ntv+Jf4C00h+5VjwEPVZy8yASQaGoTUBMrUnkbTJxdjK/Z5xJzSzkkt2dmfeZ75v39s1uguKREkgihwGBCGKohAgigsguClERURETooi1tc2nrIi1v7/zPEQkC+Ya1erjLYSSZ1mj+9u12sutqQIBxlarG33S6FptN9jEBOuYhoCBhIIRBMTq6pOlXq97xHaBMO4RBARPDSFV4R0EDaFcLqf2N5vNjEB8u0hwEIuLiymAer0+PSBWVjaO+n20hC2uVCqoWCyOAISE4U0R9AIJAAAEeTQaDdRut0d/5XL55YODF6985BXeQLDWhlarlRqOVVEqlYKtFV5AyKKEbMZ9LJxKIEDW/X53lA6Tfi4zIsT5JEEjdzo83F1WGYMSCFY6rNK4yjXXSoMs+1tLeSgqzY6uUVWTVu+2EofR3b3dTX+i4+tpDr19d0nLYNbFOoutNxAqAGhj3hzPWClFVQ3QrxYIlovghAgbQecCIP2H98+tZpcFRNavDgRDENk6AqTIOE2m8wAXEDBBGgbZL4Rg6BsfOi6B79FWhEgVtBqqj35ZKYG+ufZ6NvOXy/TcCQiYHZwc4ZHK1HBjoYAuz+Uzhn1vn6PTNh/e+495BD98QL+QhJFqgHO6bmHkGngQsgjCU0NhLo9uLhSEShEBoVVBN2TiFpYgWDXHwbAe3PuNrs/3xoydL86iq8UZJXf5fNJBnbPxMEurItuYeVHHyDVkquCp4c6tK0oQ8EUfPv1gXs9ThYlLWC2Wf0GwVcECoaMG3P7Psy76ctIZg8EGYa4GK9cQqYIFQlcNIlWwQNiowRGIrCp40cIlCDqnMF0gSalZrRHQEF1wCQECITu3cKSI7CYNNDp1rsHetmODYCVQshDCyycmbrHkJVVTFT55aoBZ5j1yq2SVWCU8NYhrFeZrhdFiKd6yG5jCU4VKPsHLKqFdWYptGkaNQNAuAWV5eOgid6tkhRgWEF4ChVVCh02ofruqfDsBwXsc/q8fw2m3IHerQBGkKmSP4rKoQZ5nqQFvENH9muQV2oqg3UJWMnMBY+JKdbIahGiGTYCIH7nletJZOJUVoRIp5EPj1yrIe20B4Lb+CQgbNciUAucvzAYPbOljgy7Sll+S5LdVdtSVXUNF9rxrbNWkI3HTcXoBkWaa1KuEuPIN5/CrAa6SIxMY3kDEF0WI6RHlIPRuFWztq27pmyiAvsebInDHPBgh359yUqHSnY34eqHARWiYPqJEcNcYRBD+LpmLirSuSoO4Bm+tMEmLTQzm3eN9sSQHEj9TGNLIuoh5vdGFMoIqAgxYX99Mv9jZ29sJ8uUOhhgchIvZdNFGBDGkGEFEEFmHioqIioiKYAaZP321OmHR4N2KAAAAAElFTkSuQmCC",
                "windmill": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAAudJREFUeF7tm79v00AUx5+TwFaxgVQGJsaO7YgSicktUYuYUP+D/hFN/oj+B4gJkSgkniolYmzHjEwMIMGG2CCJq3Ps5OzcD5/vXRw5z1Imn+/H577v3r13Fw/oiQh4xGFJgEDESiAQBCK9KJAiSBElKaLdftsp4qEGg8+FvjNta2um4fsXoWnnWPkg6G2lj1tphA2IQMQy4EE8OVDz//N3LZ5KK4KBuHzTEFrKhy8zIBAAQCBifRAIApFeKkgRVVeEaP9g4jUSvbh2o043VLJNVBEQDEitVm8Nh58mRXaoum+cgPD98w6Ady1rvCiIZX1hNwj66PEHOojT04txGEJTNQN2IAA8DyajUa+lm2WT96ggREp4+WIO7Bd8fbzqlwkI/9U/+Pa9Hv3SD64y0ECcnb1rLhbzMd9ZNojVYmcBQlQHdmSKBiK7MPIQok4LQNxN5/Dz1zLAOnzmwclRfWOLraoHEwYKiCyExBx4dfAgTGw3C0JkJhiu1QmIbOezirABIarLOQiWXpvNQqkbNBlQ2WUbDa+rSvspFeEShEg1NsrRgd5JEDIIMu+gG2Se92ggdOk1WWf4bBMro4Mgg2HbPioIWXpNNSM3H/+vXueFIIJx9f5RnolPleFD+lJBsH3C/XSBAuL4qBbtM0yenQHRv53Bj9/rjLSNIp4/9eD8tTjhK4NDIGIyOwOCTIPTaiUXS5OFKilbOfdZBILsG92iWTRAU/URzX1iglBtrFxAYO3tLAhssLr6rEDoKk/e65IyNsFUnpDeeRheFMTeJmYim8/ciNnLVF0eE7HJYssiUswDH5RU3RrE5sHO3qXzExh0wMOtrHTkx8EQHfgkr01OunjPheEmZZ4QdY0QNULXAjJUstcL6VYdAJiYhktz4OfKuWmI9hgEIqZCIAhEOhYhRXCKUEW2e3MXO294H+Ux6P8aS1yVA0F/ZTKxgxLLbm1DVeIYczVNIGJMBIJApC2GFEGKSCviAbuwhmEKe216AAAAAElFTkSuQmCC",
                "faster windmill": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAAudJREFUeF7tm79v00AUx5+TwFaxgVQGJsaO7YgSicktUYuYUP+D/hFN/oj+B4gJkSgkniolYmzHjEwMIMGG2CCJq3Ps5OzcD5/vXRw5z1Imn+/H577v3r13Fw/oiQh4xGFJgEDESiAQBCK9KJAiSBElKaLdftsp4qEGg8+FvjNta2um4fsXoWnnWPkg6G2lj1tphA2IQMQy4EE8OVDz//N3LZ5KK4KBuHzTEFrKhy8zIBAAQCBifRAIApFeKkgRVVeEaP9g4jUSvbh2o043VLJNVBEQDEitVm8Nh58mRXaoum+cgPD98w6Ady1rvCiIZX1hNwj66PEHOojT04txGEJTNQN2IAA8DyajUa+lm2WT96ggREp4+WIO7Bd8fbzqlwkI/9U/+Pa9Hv3SD64y0ECcnb1rLhbzMd9ZNojVYmcBQlQHdmSKBiK7MPIQok4LQNxN5/Dz1zLAOnzmwclRfWOLraoHEwYKiCyExBx4dfAgTGw3C0JkJhiu1QmIbOezirABIarLOQiWXpvNQqkbNBlQ2WUbDa+rSvspFeEShEg1NsrRgd5JEDIIMu+gG2Se92ggdOk1WWf4bBMro4Mgg2HbPioIWXpNNSM3H/+vXueFIIJx9f5RnolPleFD+lJBsH3C/XSBAuL4qBbtM0yenQHRv53Bj9/rjLSNIp4/9eD8tTjhK4NDIGIyOwOCTIPTaiUXS5OFKilbOfdZBILsG92iWTRAU/URzX1iglBtrFxAYO3tLAhssLr6rEDoKk/e65IyNsFUnpDeeRheFMTeJmYim8/ciNnLVF0eE7HJYssiUswDH5RU3RrE5sHO3qXzExh0wMOtrHTkx8EQHfgkr01OunjPheEmZZ4QdY0QNULXAjJUstcL6VYdAJiYhktz4OfKuWmI9hgEIqZCIAhEOhYhRXCKUEW2e3MXO294H+Ux6P8aS1yVA0F/ZTKxgxLLbm1DVeIYczVNIGJMBIJApC2GFEGKSCviAbuwhmEKe216AAAAAElFTkSuQmCC",
                "power mill": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAAudJREFUeF7tm79v00AUx5+TwFaxgVQGJsaO7YgSicktUYuYUP+D/hFN/oj+B4gJkSgkniolYmzHjEwMIMGG2CCJq3Ps5OzcD5/vXRw5z1Imn+/H577v3r13Fw/oiQh4xGFJgEDESiAQBCK9KJAiSBElKaLdftsp4qEGg8+FvjNta2um4fsXoWnnWPkg6G2lj1tphA2IQMQy4EE8OVDz//N3LZ5KK4KBuHzTEFrKhy8zIBAAQCBifRAIApFeKkgRVVeEaP9g4jUSvbh2o043VLJNVBEQDEitVm8Nh58mRXaoum+cgPD98w6Ady1rvCiIZX1hNwj66PEHOojT04txGEJTNQN2IAA8DyajUa+lm2WT96ggREp4+WIO7Bd8fbzqlwkI/9U/+Pa9Hv3SD64y0ECcnb1rLhbzMd9ZNojVYmcBQlQHdmSKBiK7MPIQok4LQNxN5/Dz1zLAOnzmwclRfWOLraoHEwYKiCyExBx4dfAgTGw3C0JkJhiu1QmIbOezirABIarLOQiWXpvNQqkbNBlQ2WUbDa+rSvspFeEShEg1NsrRgd5JEDIIMu+gG2Se92ggdOk1WWf4bBMro4Mgg2HbPioIWXpNNSM3H/+vXueFIIJx9f5RnolPleFD+lJBsH3C/XSBAuL4qBbtM0yenQHRv53Bj9/rjLSNIp4/9eD8tTjhK4NDIGIyOwOCTIPTaiUXS5OFKilbOfdZBILsG92iWTRAU/URzX1iglBtrFxAYO3tLAhssLr6rEDoKk/e65IyNsFUnpDeeRheFMTeJmYim8/ciNnLVF0eE7HJYssiUswDH5RU3RrE5sHO3qXzExh0wMOtrHTkx8EQHfgkr01OunjPheEmZZ4QdY0QNULXAjJUstcL6VYdAJiYhktz4OfKuWmI9hgEIqZCIAhEOhYhRXCKUEW2e3MXO294H+Ux6P8aS1yVA0F/ZTKxgxLLbm1DVeIYczVNIGJMBIJApC2GFEGKSCviAbuwhmEKe216AAAAAElFTkSuQmCC",
                "mine": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAABypJREFUeF7tml1MU2cYx/98FwoojK8WRapeiMigbBoj02r8QA5zybLIYozbjVmW7XK7dRfb4tV2uZtlu8FEM8yyZMpBJToZSjRurWYi3iDIoOXDSAIUyvfyf9dD2nIOAXpK2+S8N1zQc/o+v/6fj/d5nwQYSxBIMDj8T8AA4VeCAcIAERwUDEUYijAUoZooDdcwXCO2XCMRQIq/npkBsBCtAi9arkEAZsD0VnW1/UJ2drbt7t2284DvEQBvNIBEA4QJMFkBHJCkukuBCpDllo+BxfvA9ACAaQCLG6WQjQSRBCATSKuRJKl5JQNlWX4XmL4PYBzA/EbA2AgQKYD5DWCuSpKkltUa5fV6+9va2j4Bkl2AdyTSQCIJgnHABKRX2u2VFy0Wy2E1CNPT01hcXITJZFJlNDjo+cPpdH4GzPQBmIqUu0QKRCqQXgjM75Wk+l+1VJCXl4eioiLx78HBQbx69UpTMLLc/D6Q9BcwNQyAGUbXpTeIpWxQVVX5jdVqfUdtt1TA9u3bkZ+fj6Qkhg5gfn4ew8PD6OnpQUKC+ra8Xm9fW9ufHwG+vwFM6pld9AKRCGTlALMVdnvl1xaL9aAagIWFBezevRvZ2dkCQKjBBEQgY2NjePbsGRITyXX58gM5B6R0AuOjegAJFwSfTwNMFput9IuysrLP1TY+MzODbdu2CQWYzWbNX1x5lkAmJycxNDSEgYGBJdWEvrurq+uHnp7e7wDfYLjpNhwQzAa5wFylJEk3tRx206ZN2LJlCzIzM8UvrCX70OcVdXi9XnR1dYFq0lAHs8t5IPkx4H0NYHY9wWO9INKA1Pckqb5J60spfwLgXzWJ09DZ2VlMTU0JOMwaKSkpqqDm5uZAIH19fRgfZ2mhvmS5+UNg5ncAvrXCWA+IBCAzT5KOM3ovW9z0rl27kJOTg+Tk5CDDaDx/WQJgHOjt7cXZs2fFO65cuYLS0lKhnNTU1GXw+CzfPTo6KhRCaGpLllsLgQnWHWuqStcJIsMiSbUsg4NWbm4uiouLRRwIVIECgDUDMwMD4smTJ1UNaWxshNVqRUFBwRKQQHciSKqDseP1a3pC8JLlm8XApCdqIMrLy5GVlbUEQDGem+aGVzJeS8YrQSEQuklnZ2fQ41EHYbfbkZ6eLjal+PTIyAgqKipErAhnuVwuoSQWYFSbUnswvvB/gStmQFAJBFBTUxOO7ZrPdnR0CCB0l5gHweh+7NixiIBobW0VNUnMg6D1PDccPKhaXIYNp729fel8EtOKoKVMcfv27QvbaLUXPHz4EMxOXDEPYmJiQpTT4QbJUBD9/f0i/rDWiAsQrBeY52tra3VVxY0bNwTctLS0+ADB9Pn06VOcPn1aVxBXr17Fnj17RMUaF4pg8dTd3Y36+npdQVy/fh07d+6MjzqClrPqc7vdOHLkiK4g7ty5I0p4pXyP+WDJoopl9f79+3UF8eDBA5ExlLNHzIOg9TwH8OCkZ+ZwOp0iY8QVCP5aDJrV1dW6qIIQGCSV80xcBEtukgGTpfaJEyd0AcHSeuvWrUFtu7hwDaUDxSZsuGn01q1bIkiGdrDiAgRlQBgsrlgR1tXVrUsZLS0tonOl1vWOSRC8p+DxWG3DTKcsu1lbNDQ0rApIU1MTduzYsdT0DXxIaezyQujFixdB74t6P4K70WrVKerw+Xyio3TmzJkVYVy+fFlUkGzohna9Y6xVl5kvSceH1KxhY7asrEyzeUs5M4ieOnVKFca1a9dEUMzIyFjW+FWat8+fP18qs0NfIsutBcAE7w4j3rzld5v87fxftH5a9i9LSkqC+piKMmiQx+PB0aNHgx6/ffu26DWEBkV+nq7FWMPut9aS5eYGfzufsxVrWuvpYitfoFzwVDkcjp/MZrNqY1K54FF6jYrU6efsW1AdPLKzPti8efOy5i8BrHTBw83IslwLJD+JxgWPAkO58iuy2Uq/1LryY03B9FdYWBgkefo7/8fFIKucIQiJ3W/2Hl6+fCna+mrLf+X3PeBj+z6sCZtwFBG4N+USuNzhOHTJbDaXqG1cr0tgj8fd7nI9+QpI+SdWLoFD7eX1dQaHxByOQ41aQPiL22w2cRYJHAugApgOte5H3W73vcePn1zwjwXoOnSmlyJCgXBQpACYf1uS6n/TilprHBT5AEh6BEwxW8X8oEigzYScDqS/WV1debGoyKLanGBtQQUo7bdQaB6P567L5foUmP7Xf7kbkVnMSCki0B5lmMzucDh+1MouaqqRZbnOf90f18NkobZxRigLSDuwivHCev944USkp+kC09+aCo8wP6ykWw6c1khSXWPg+2S55RyADsDnXs+MQzh72wjXUNufMnS29/Bhx89jY2PdTqfr20hkg9XCiRYIZX8EwmqJ5wKO/EQkEK4GRrRBrGaPG/IZA4QfswHCABHscYYiDEUYilDNQoZrGK5huIaqa/wH4HLecO4SZnEAAAAASUVORK5CYII=",
                "sapling": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAACIdJREFUeF7tm/tTlNcZx7/v7rIXFlBQQFgQUINCYomYiumEoiZaONDOrDNtxhr1lzbJ9Mf+If2lM51O219i0smkTtyZBs6SpiYSTb3ULAlaryRCXITlKruwN/bSOXt7L7wL++4F0ul7ZhyX9ZzzPs/nPM9znud5kYM6YgQ4lUOcgAoiYQkqCBWEOCioFqFahGoRshel6hqqa3y/XIMDDN0AwkDgEwDRzUrwNtk1THWEdD9hylM6uBPwxT5vxthEECYLId1OodKUDtYBvon/JxB6QqwBOYUptRkABDcaxmZYhL6xsfn3ra3Pvymn7NTU1CWH4xrZaBgbDYID9K8T0vv+WidO6cApIPjBRgbPjQTBAUUvEdJ3UwihqnUGkUgUs/erRGwo7T8ErNzaKBgbCMLYQEjPmNQSjp7VxL767HxklZFQam8C/KvWFCJ+5AKC5QDNgKYCgBaIGuMCRpOf2d7sjwnQaAnpOS9VoPMUB4NJG/s66Avj8/dXpxGU2s8CEUbJB4D9HQU4P8CF4/uxzywPicwDgYfZWlAuILSEWEPZns4haxhl5eyC4Id7IYCbtjiYbAalNl0civKRC4iMAp+cSK3HvKhtLJOV9umYG3c/LVasCaUDbwDBvypemFiQCwgARW2E9H2l5OGWtjnsa68Cx8k/OhqN4r5jGhNfb1OyLSgdaAOCI4oWCSbnCALlhFjnhQ9vObIMnZ43b62OA9OZAxf7vnSrIfZzcoRD8SCp1cWDJhvRKOB5FkAoGEY0UX6EVvj4wb6/d9ks0plSG4tVC5sFYlWGeOycFhptZnzZ6T8YmcX8lBcvn9iZ1kqkyjF40luGUpsewMpmgeAIsYruvR/9IorikqJ15WGn/uDrGbzS0xCbe9U+jr1t2zOC4V1awb/+JoZNqY2ZVNbVa2ZHt6ZahrcIIX9MTtl/wo/qupJ1QUyOe7D/cLVo3u3rLtQ0lK671uVcwu1/JG7rWOVqfwvw/2ndhWtMyAOIohcJ6RtOPmPr7kkc/HF9Kg4w85947MbinA+RxHmt+EM48XqzrFgff/AQeiO7BQENx2HLNiMsTWUiS3F87sT86I7Uekr7DwIrjk0GUbqdkNdmUsGP8+L4uVJoNHHGkXAUVXXiwKZU4GnncirusHT8k3c80Eb5K5bSf1YCnlml+wrn58EisCpgCjNGFgtuXPoOfWf2ZSXnR+fv4/BrLJDGl8tloPko3fMCwmLZ9WFbW1tfUtP2viAqqvgT+270Gdo7a7MC4bjyFDv3bE2tnXd54RhgF0R8OJ1PHCMjt17OtWzPFQSrN94mhPxBqOXBnwZRXsmDWHYH0bCXV0YJkfEHz2Au4xVfmPHiy4/4n9lelNK3gQALlpt1axj2EEIeCRWrfn4GLxzaIQpuOYF4uAhzKX8ds+B75+YUXP+pFPGklD4HBEaVQM5TjOAbr6lAqZvH8TcqU4Ey6dO1u9a/EtdS4Om3HugTVWosALOA+d4MtCGWTPKD0sF6wCfqg2YKJlvXKCLEuqqvKE2mWKC8P+xCZ29TpvLIzrvS/xj72qtFqblcUhV3k+wyzGxAaAHDm9K4IC2rGYSxB/P44dG6nCAkF//7Myca91aIYLB65MZFcdmeiBd/UVqOZwHC2EVIz2VpXNjfUSNSWJpC50rji8FxNP+gUgSC7Xn7xqRMvLAfAfxDSp6pEMTquKCrHEdnT5OoehQKwO79b+7NobO3UYlcqblXBsawq2VbqpMl3YQVYFfsjxGaidcsyaE0XigBUUyIdVlOG82WKXScqI4VW3JtBmYdzKeH+r/B2d+2ZwTk/O8c6OrdheJSffo9PUFcp25EvfJXM6U2doezFt+6QwkIPaDvJaT3YrpdI5wPHT/ToazCKFtFTj3x4IVD4kIr3V53brqwo371bcNuDPe8H9f63SiKpG/eUDpwEggOZJpoKQHBZOYAcxUQOikNlkKF0lmIbzmE+j3yLTopkCejbpjM8eKLjZhVrWMBbB6l9DeA7iKwPK0kwVIKQijvFkB/nJDeC+lOldP7cex0Scq02WlWWcQF2PDVSYTDEbzUZRFtMz2xnMpHGITLF+YQXtqS1sQpHfg5EGRv1BfX9QOZCbmAyMhC2HuLZBuOKeRyxt3j1tAELA1lKDLEr7+VYBgTY+4YENfEErQavnUn15Hig2J2FiBlkSuIdS2k42Q41qdMDqYUp+FE2adwE2Y1rGIQtvs8iwHc+FCaL+RmAYUEkbAQ42lCet5NPmjPKx40NpdnY62pNWMPFzB6lQ+clNrPAH7Wus+6yCo0CACG3YQQvvgxLuDVU+l7kaFEF1sn6GILhWRF1qcXnIgu8QkbpfbdgP/bnOhKFufTNZJblxBi9Qifc+SMBroi3ufZvzEA086l1MuclqPeWK9TOo/FjqH3xAdPqY2Zx9L3HYTmwIHDl2pqao4kBU32J1iw9HtDeHR7BtN3xWV0cm7N/jk0tVTAZI4nZwuzPnz5d74Mn5ycvDw8fP3VxHvQvLEohEUw9+gmhNiTUtYfXEDDc+V4dGcWrjvbMxLe8uI8mvZVgMUHp4OPMZTSHiAwmNEmCiYVCERxDSE/eapAjrRTl32LMJv4/IHSj2sB72Q+9hbuUSAQMBJizSjHj7fidXpCuq9lohylNhMA9qsAeR2FArHqDZhQ6rifj5wGvC5B30ADmGoPHGh7VxhfpNrm+kYrHb1CgQBg/BUhPX+WABgaHv7qHOBn7bR0v8egBUw1XV2dX5jN5p3C9ZTafw34WdMl76OAIPQthPTeZRJTOvBLIEgBuBUkQUy2EsBoJaTnncQ+rUDwXt4pFPi/MpkAQxcQYL6vBIBUTwakDDB0AIGrALz/ayAKIW/B9iygaxRM5oJsrIJIYFVBqCDEHqZahGoRqkXI3jqqa6iuobqG6hprpaT/Bagy/2FMRPJUAAAAAElFTkSuQmCC",
                "pit trap": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAA4hJREFUeF7tms1r1EAYxp8EldL6WT+qV70UFapUQUR7zqaHNgVBD4KgN08q/hfqyaMeBEHxkvWwk9pjFRF00YKKF8+yftSvttRmSWR3szUbJp+T2Wztu7dlZybz/vK8z8y+Mwro0ySgEIcWAQLhKYFAEIhOUyBFkCJIEdyFklKjV1JjfHxqv207O2ZmytUi9zSFKkLXjT8ANnkAaoyZe4uCUQgIXTfcqIAZM7s+r64/MA5CG1C3YXQNRBiA/r6WOJaW+VPpFhDpIHTduA3gMi8VtFMrUNXWL44DTD9r20VgjVdwr1IxL8j0D2kgdN0oA5jgTV4fW4mMic3ygbiu+8SyypoMIFJA6PrUAuAOZIGw6hEhMAB8Z8wczBtGriCijDBOBWGBhamj0d51l/ssy2oswcKfXEDIABCMLApIHoYqBELTjDOqike81zF6sI6hXY7wm/IPUPuqovp+A/+/guKer1TK97M+MBMITZu4oqrqLd5DTx6xsX1r5H6po9vch1ZgI8P1xDH8+KXg+ZuN3Pau61y3rMc3Eg/mNcwEIiwV0vpAUO6i/VeNNsPONBcQeQXQDkR0vCyeIQwizaQXlhTMvuJLOijlsWM2NvcnTzG/unoWxJd5FS/f8k0uLpePH65j92C86fY8iKhlLw6C//c45fUsiLwABGGFASEQHikCQSA6k4YUQYogRXBXXUoNSg1KDUqNBgHaWXo6IBAEotMS1pwiVstm4ecTaf6Fh3oD7zk9W5ipfVNRfZetMDN6qI6hnf9BYcb/2n8vKnhaTVaqOz1qY8vAGirVRS1pYdqPK9rEVaOC4wbHKyQ10pTT4gIQBVBEOf8qgJu8N35ixMbgtuSSznLAM/9TwYu50BS7xpjJPXyKcudM5fz2gJpmnFVVPOA94OhwHfv2xJtcmqXj02cVr72TsWA/x8G56WnzYZrx/G2FQLQHWveHwEH6MoDIPgVvx5CLIjhAFgH082Sa1BAjACwxZnIvoWRNi0Y/KSCaS6puMAClLDAiIFiMmbpIwGF9pYH45x+TdwDlIm8CSS+TAe5dxsqXZACQmhpcFYRcMl031wvTGKq/bZbdoYhipKdGGnWI7AxFIEg1yyQTK5WMFUVBc4vourAty+RfsEwymGCbQhThn3OpNHmg8d2yyh8FYxHqXjgIodnn2JlAeDAJBIHozCtSBCmCFMFdayg1KDU6hfEXXvzCUuiEamMAAAAASUVORK5CYII=",
                "boost pad": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAAZ5JREFUeF7tmktOAkEQhhvQI3AGiSzcsTLxDCYeqA9k4hlIWLFzIeIZOIL4CNhDMmMDXVPz6NKPJel59DffX12TnoHjtycwgMMPAUAEEwABiHJRwAiMwIjoQkk0iAbR0EfDez+01Il67z9T71dUI3Yglsvnj9ST9zluNrsZAcI5B4igYacgribTPu3/de239cvhP0BghHMYESwABCDK9RIjMAIjov0L0fgL0RiPv9xmI3r3O9rNmjbi4f59P7HHp0t1u24WRAGhIKCFYRLELhJ3t9uSBfPFhSomJkFUbWjCCnMgYjb8SxDHbNDCMGXEKRsKEKvXoVutR+JVxAyIFAgaK8yAOBeJqgLS5RQQllpsqQ11IpK9EZLaUI2HpHBmD6KuDVIrsgahhSCBkS0ITSTqRCRbENeTZveLzzVZ2YIQt4bKAwBhqY9QPuykwzECI9jXYF/jVLGgRlAjMqkRSWtaT4M6/YaqpzkmXRYQAVPrIJIeRyaDWvvyNpP5tXIbzezHt3Jr3Z4UEIE3IABRjh5GYARGRJcjokE0iEY0Gt/OdwVhhTbZ6QAAAABJRU5ErkJggg==",
                "turret": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAABBlJREFUeF7tmj1vE0EQhufsJBUyiBRUCRUSEhYUFKBIoKTMJUUs8X+S/BokBHKK+FImQiiCggIUlIIKuaIIAosqxD40ttfeG8/e3u7NWRHsSZYL3349+847++EIwjMkEAUOIwIBxFgJAUQAkTWFoIigiKAINlFWFhqbmzvtKKq/lE7PSfLmlXSdlabPEYhoR7LTaZoeHB0dtCTrVHVVrIgAAoIixlqjINbW1rwUfXp6Oin3T4TGfwsijlvnAHBfTacEiCiCd51O+5mXtCyFKjHLOG6ltF0JEKrOJGmL91u8Qg4CDkASRBTBSafT3pBUhhiION7ZA4h2TZ2TBDFtI91PkoM9CSAiIDgIS4sAl3+mXZQAQesc1S4DQwhE1hPu3e1D73cE3y9qExISIO4sD6BxI4Wv3+oZEUh4RmkQW1ut4zSFdb1n8fNL+PhlgQXR7XYBP6an0WjA6uoq4Dc++joCQTx+cAXJ26WZ4mVhlAJBjRGVgB98KAiJOFYgsC5UhaQyvEFsb79YHwz6x2qAt2+m8PTR1BSqBoHtvv+0CD9+6UPw9wtvEFQNGA76YwOxsrIC+NGfXq8HZ2dnRvHoipisKUiY+IaIFwiqhicPr2D51iAzgNnZGv1c1DR1b1AVcyBoiNRq9Y3Dw9cnrqHoBcKmBuwENTROAbbOojpQJdSIaTnalo8qnEFQNWCnaFjQjmEGaDabtnGzv3NZxtaejyqcQdB0yYUFBVE0HEykaJhQELMZxN00nUHYwuLiZw0+fF6YjKksBFWRDkNP01KmKQ6CmmQVIIqEo6tPlAJB1w7UJNEX1ArRyyC0QtQraHjQCZgrCJtEpdTAhYfNJwKIMbUAIoDIbsLmqgibWfqsJk2mSvch18osi6QxKcPU1xG2CRhmL8cD3lLpkwNBV3lVgCiymp0DiOwhrS2Fuuw4fZfYdDXrc8rtrAifTVcZryiyA6V7m7lsuobhQC5wqHFx23CfHWiRnSfXlmtYYB3OisBCVBVceHAddAkT7mCG8wYaFj5q8AZRVBXcAavyAW4fknfCXRS2jxpKgsiaJpfSsAE6Yz6bLy70sB660fJVQykQnCpMs2YKkyJQTBCuzXG+GgR36WvqvFIIDiJ7DJ9FkgeUg+qTLukkeJklrSTvoqfIrLu8I60E1bYQiNmbcJNnuAyavstfEbifT3J9EAEx8gv+bwFcynOFYc4+MhBKmyU3IO5SWL3nAiUv9Q59wnFTZYMvpgi9IdO/ZvR3MHTo7Rim2jwTVeWlIVSiCNVZbk9imxX773KhUEnWyBuABJAyCyU73NEblYQG1zgCSdP+Lv1Tibmj6X6ttnDic6FbdPD6e3MD4dO5eZYJIMa0A4gAIht4QRFBEUERbDIKoRFCI4RGCI28lWrwiDGdv3AZkWGMex2dAAAAAElFTkSuQmCC",
                "platform": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAAVtJREFUeF7tmkEOwVAURV9jQJiIHZiYGhoa64gFSOzAWsQGxAbMiKHYhYlVSEyU/PqhX59qI5o2jmH9tq/Hve/d1PeET0jAg8OdACCsEgABCLcpoAgUgSLUQYk1sAbWwBpJKTpzj/D90bUMsXy9XmV6tkyLDQBAWBkAQgEx6NdUl2z3ZwmC51fv1m12Z+f8NOtaTU963ap63+j1crWGKbzTrsSKmi9PDojppKEWPlucnONp1hkQ42E9dr3D8SKAEBFAWG0AAhBum0ARKAJFMD6NBsgR1gmAAIRINIqjCBSBIh5BAWtYFIAAhBufUQSKQBEf320SqAhUBCoC1WujYHwyPhmfjE9DgP8+rQ4AAQi2BYQaYH+Ekg9K3yy1efd3W4fUoV+Qg7nuoSrIM6tlAMJi+TmIIqvgm9oy77z95mZFPhcQ9tcBBCBco6IIFIEi1OGFNbAG1sAaScn2BpFWBnB82lh8AAAAAElFTkSuQmCC",
                "healing pad": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAAVJJREFUeF7tmkEKwjAQRVM9gOAlFFy460k8UA7kSbrrQtBLCB5AEXUQgqGdjjZp8LmUpkle3p8ETeX4PAlUcHgRAISYAAhAhEUBIzACI6IbJdEgGkTj+2h472clnUS99zfteAfViAeIpmmv2pfnfK6ut3NAOOcAIRomBbFab3La/9H36Xh4fwcIjHAOI8QCQJQKYnc5dxbZ/WJpKsLFGQEIWWdAACKMPEZgBEZEt0Gi8U/R6Ftt00kp0ih26JrUgQoQSu0x4lcE5D1EAxChUhiBEYUZoamJfVssP8x0aK8BPKkDlWbAGKE8dBENotG/I2giR43gf43QE4wo1QhN3i3PFGeEZZKaNoAgGoUXS43mlmeyRcMy2FRtkt6hSjUpSz+AEGqjg7CsTq42o928zTWhFP0OuoudYkC5+gCEkAcEIMIQYgRGYER0YyIaRINoRKNxB85lEmEa+oa0AAAAAElFTkSuQmCC",
                "spawn pad": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAAiNJREFUeF7tmrtOwzAUhk9hQAqCpYEFtYKplRjYupR3YOZFmDPzIsy8A126MSC1E6gVC6QLiEgMIBRwqtQ9ceziJLb0d0wcX7585/jStAi/XwItcPgjABDCBIAAiNWkACNgBIxgJ0qEBkIDofH/0IiiaMunlWgURd+6/TXKESmI8fj+S7fyJssNBmfbAEFEACE0rBVEr3/apP1rbU8nD8trAAEjiGCEsAAgfAMRxy+0iF+1Emyne0xBsKtVNivkhRHz2SMlSWI0sCAIqNM90X7GeRD5DmqPKldQd5p2FkQRgP3ekPb6Q5ZJfHdDn4s5e68MiDcgVADkkXNAvATB2XB0cWUUGc+312vlVTCcM4JLjKYQMgIyDFUCdQpEknzQfPa0fJM77Q6F55dGJsiF3ycjepuOlpfb4QGF4aHbew05JDY1QR6lbAYXIk4Zke+MDRsyILIVXoGwZQOXLwBCUAEIgCDKJ0wYASM8NsJkb1G24pL3Hl6FRjo4W1Oodwsq+RTKhhWyDUWnV06tLFMLsOnKBTq24QoYJnsPeW+RVuvlwUza8aKjOhUQDkDG1lsQ3DF72TTJ3S8DwLXj7H+fOM7PvWL59EplR9EplOoZ56bPTfS38QxACIoAARCrAQUjmjbCRoKrqo5a1xFVDcJGvQAhKFYOwsbbqquOyr68rWsATbRj9C12Ex2sq02AEKQBAiBWgw5GwAgYwU5ECA2EBkKDDY0fJZh+YTa6MyMAAAAASUVORK5CYII=",
                "blocker": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAA05JREFUeF7tms9L3EAUxyeuXWqsFdrVg6BUKFjopWdPevCyelDw/1H/H8EedC89uKeevQgtCBYFD+1WUGsqq2tk4k47yc7vecmu5i2IsHnZ5H3y/b6ZN5mA4CchECCHRwIIoqsEBIEg0kUBFYGKQEUIB0q0BloDrYHWUM2iC60RKyvrC3Hc2YhjsqC8qYA0g6Cytbu73SyqBSgERL2+uklIsOGSVBCQ5t7ezqLLuTbn5AbCJ3l5AvFWo/F50yZB09hcQNTra7HuBt7WJkgYjiZ/UXSdhNP/v1u/dKeSRmMH/L7Bf1AFYe7DR22SfMD3b4fSeGgYYCBkVrBNXpa5GAqcVUBA5A2BwckTBhCIdE0Iw5BMz8xa2cA0+PTkmERRlAqHsIk3iGxNgLKCDkxWHb4wvEBkIaiUMN65I7PtNjkYCXU5Jsc//Y3IcbVKLirDwnhoZTiDENUFmRoohKU/l0lCR9WXWhgUwvv2TRL/5dVrKYzemuFePD1ApOuCDML89RWZurvtearb42+ET3r94rzn+7PhF+Tr6JgwHsoiICBsIciUwSshm7UpDNda4QRieXltn2+cRCB4O8iKAm8TFQR2vswmaVW42cMJhG6kMIHAkqMw6IfVBF0lFcGAsIc1CNpK39939tkNi9Rg8nR1CZuoSDYdHxqqLNq28NYgTGzBhj/Tp2wKRTXi8Kpwad2tQehswSclGgFMkxbFyUYaGutrDy8QtJWu1SaVuUHYxGTu0Wr9TLXwtqOHF4jpmXfJeoLu4wPDBAK9Pl3LOD358e9WBhKEa80whcCy5+1RKAibBstFFTYgnoQiXCDw8wyTRq2vILBYctVRZY9nPXzihKqrApxic3bQzS5L0XRRHtnVqUFqw136DJqT9cySCYNXRWkXZh5VgUt1iShw8VZRNEu5nC+qFfQ7m/5D17WqjvuuP2R/27lY8j9k86LHJ3l6LvSLHXY/QCDEO2Kg1THwL4FlxRPSKnlC8JpHyCRe+o0iqpohgsa2DtFjbPvQs9o69H80cd9JJy+obm+xTAo0SLHUXSjbuuvi08fzS56/TiEg2AVLv+HUTgH9iS5UEf1J0eyqCKLLCUEgiLRlUBGoCFSEcBhBa6A10BpoDdUc8wG9ozFhleVISQAAAABJRU5ErkJggg==",
                "teleporter": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAABCCAYAAADjVADoAAAAAXNSR0IArs4c6QAAAzVJREFUeF7tmkFP2zAUxx16YMom7bBsN9B2otO+Age4Fg5F2vcBvs8keoBe6YGvMFFOTHDbssOkLdoOJZPbesRuHPs9v7gTeZUQqmon9i///3vPjhPBnzmBhDksCDCIpRIYBIPQgwIrghXBiqhNlGwNtgZbg63RVEVHjRGHhx/3ynJ2XJZir3FQiZgkSe/0/PzTJNYSIAqIwWB4IkRyjJlUkojJxcXZPqYvpE9rIEImb59AeToej04gE/Rt2wqIweCodA3gVfZapOnz+V9R/Jo3l/+/599cXcV4fEY+bvILNkHY6X9wTrLa4Gb62dqeGgYZCJsVoJO3zbweCp1VSEC0DUHBaRMGEQg9JqRpKra234Fs4Nv4/u5WFEWhNaewSTAIMyZQWcEFxlRHKIwgECaENpVggqFWBhpEXVyIpQZ7zMAHzwAQelyAQtj9uSuyWaY96JvNqbh+NnW5Qu9jpFisRUhAQCDUATBnDgVSjRdRQRwcHF1WF06+IIY/hqCnPXo58mqvB06cPVCKwGQKKARFwAcGRQYBg5BL6YeH2aUaqI8asBCwMDY2evvQJTwYBNQW73/3xc6fvpfEbY3yXi6uXlw1XqOqCszSHQwCaotQNfiqItQeQSDkUjrL3lifFIUa1MVdqsjzr9oSHpo9gkBsbb+d7yfYPlRq8FGF3Mu4v/vybyidBSEJhNQTQYpwZQxWxFKgnQHhCpY+5bRvXnWV3WsNlnISsezhqjCjp09oQUWhCpcazEAZpaDiErtiZmh1KbtiA6fLEqYa5HdoDSH7gNOn7GTuTrnihGIIheEDgcIWaBALGI87VL4gZD+fsttVTq9s5FR2qTBqIAPhkz3MwdcBgQKgskUgiNU33BBl+NYPTe1WX/jgdqeCQJj2kN87uZ2vnhQmg7ShBmxsUGNBZQ1zIjFf9FC/2CEGUX8ihjpm/PcvgetqC0WaCkabEIKDZZ3XO39QpAoFcnRokW0Wx4ee1NGhx2yCP0lnzyr4OsGVqUiyhusm5tLd1V7/vb3JV+8TBYS6YecPnMIUsJ7WURWxnin63ZVBLDkxCAahW4YVwYpgRdSmEbYGW4OtwdZoqjH/Av5ExVLxSFbJAAAAAElFTkSuQmCC"
            };
            const $n = x.list.map((it) => ({ name: it.name, url: ITEM_ICONS[it.name] }));
            const Tt = true;
            const mini = { canvas: null, ctx: null, imgs: {} };
            function buildMinimap() {
                if (mini.canvas || !doc || !doc.getElementById) return !!mini.canvas;
                const v0 = doc.getElementById("mapDisplay");
                if (!v0 || !v0.parentNode) return false;
                const c3 = doc.createElement("canvas");
                c3.width = v0.width; c3.height = v0.height;
                c3.style.position = "absolute";
                c3.style.pointerEvents = "none";
                v0.parentNode.insertBefore(c3, v0.nextSibling);
                mini.canvas = c3; mini.ctx = c3.getContext("2d"); mini.v0 = v0;
                ctx.onCleanup(() => { try { c3.remove(); } catch (e) { /* ignore */ } mini.canvas = null; });
                return true;
            }
            function placeMinimap() {
                const v0 = mini.v0, c3 = mini.canvas;
                c3.style.left = v0.offsetLeft + "px";
                c3.style.top = v0.offsetTop + "px";
                c3.style.width = v0.offsetWidth + "px";
                c3.style.height = v0.offsetHeight + "px";
                if (c3.width !== v0.width) c3.width = v0.width;
                if (c3.height !== v0.height) c3.height = v0.height;
            }
            function iconImg(url) {
                let im2 = mini.imgs[url];
                if (!im2) { im2 = new Image(); im2.src = url; mini.imgs[url] = im2; }
                return im2;
            }
            // drawn every render frame, like Sp(mh) at the end of l2
            function Sp(e) {
                if (!buildMinimap()) return;
                placeMinimap();
                const I0 = mini.ctx, v0 = mini.canvas;
                I0.clearRect(0, 0, v0.width, v0.height);
                if (!(z && z.alive)) return;
                if (Yt.length && Tt) {
                    Yt.forEach((t) => {
                        let n = $n.find((e2) => e2.name == t.name)?.url;
                        if (n) {
                            I0.globalAlpha = 1;
                            I0.drawImage(iconImg(n), t.x / K.mapScale * v0.width - 32 / 2, t.y / K.mapScale * v0.height - 32 / 2, 32, 32);
                        }
                    });
                }
            }

/* ===== examplescript/90-debug.js ===== */
            // =====================================================================
            // DEBUG — a read-only view of the bundle state for the live tests, only
            // when localStorage "mmj_debug" is "1" (never in normal play).
            // =====================================================================
            (function () {
                let on = false;
                try { on = win.localStorage && win.localStorage.getItem("mmj_debug") === "1"; } catch (e) { on = false; }
                if (!on) return;
                win.__mmjES = {
                    state() {
                        return {
                            v, p, gt, Mt, hn, ct, Ot, At, Ct, St, Nt: !!Nt, jt, Ht, g0: g[0], y, ee, A, ry, ay, ly, uy, cy, dy, fy, hy,
                            dir: z.dir, bm: bm(), Dn, ui, He, We, et, un, fn, In, xt, Y: Y ? Y.sid : null,
                            hat: getHat(), tail: getTail(), owned: Nn.slice(), dmgpot: z.dmgpot ? { hp: z.dmgpot.hp, add: z.dmgpot.add, soldier: z.dmgpot.soldier } : null,
                            health: z.health, shame: z.shameCount, m: { lc: m.lc, rc: m.rc, mc: m.mc }
                        };
                    },
                    eval(src) { return eval(src); }    // test-only: read any bundle variable by name
                };
                ctx.onCleanup(() => { delete win.__mmjES; });
            })();

/* ===== examplescript/99-tail.js ===== */
            ctx.log("v1.0 loaded — config menu on Escape (as in the bundle) or the gear button");
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
