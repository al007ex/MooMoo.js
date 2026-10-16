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
            // ---- loader check: this mod needs loader 1.3.0+ (store, tick hooks, outgoing takeover,
            // the render hooks and shame timing) ----
            {
                const w0 = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
                const lv = (w0.MooMooLoader && w0.MooMooLoader.version) || "0";
                const ok = ctx.store && ctx.combat && typeof ctx.combat.onTickStart === "function" && typeof ctx.onOutgoing === "function" &&
                    ctx.render && typeof ctx.combat.shameWait === "function";
                if (!ok) {
                    const msg = "MooMooPlus needs moomoo.js loader 1.3.0 or newer, but loader " + lv + " is running. " +
                        "Re-upload loader/dist/moomoo-loader.user.js to your pastebin, then reinstall moomooplus.user.js " +
                        "(Tampermonkey keeps the old loader cached until the script's version changes).";
                    console.error("[MMP] " + msg);
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
            const NONE = { checked: false, value: "" };      // a bot-only / missing / dropped toggle
            const ls = tog("Auto Place Accuracy"), cs = tog("auto place"), us = tog("mill rotate"),
                hs = tog("stacked damages"), ps = tog("stacked heal text"), ms = tog("auto replace"),
                gs = tog("regular grid"), ys = tog("reload arcs"), xs = tog("shame count"), ws = tog("all visuals"),
                bs = tog("reload bars"), ks = tog("building hp"), As = tog("building owner"),
                Ss = tog("Shaders"), Es = tog("shadows"), Ts = tog("autoQ"), Cs = tog("apple insta"),
                Bs = tog("bleed insta"), Ds = tog("auto break"), Ps = tog("stop break"), Ms = tog("auto equip fastest weapon"),
                Ns = tog("no arcs"), Os = tog("no outline arcs"), Ls = tog("See through player"), Fs = tog("skull"),
                Vs = tog("break spike trap"), Us = tog("auto heal"), js = tog("strict soldier"), Hs = tog("autohat"),
                Ws = tog("strict monkey"), Qs = tog("autobuy"), Ys = tog("stop on collision"), zs = tog("movement on collision"),
                Ks = tog("spike kb visual"), Js = tog("auto push"),
                eo = tog("hide name"), to = tog("kbInsta"), no = tog("Auto Emp"), io = tog("Assassin"),
                oo = tog("log projectiles"), fo = tog("polearm aids"), bo = tog("Legacy Visuals"),
                vo = tog("Default Visuals"), Kg = tog("fakePing"), Xg = tog("pingSlider");
            // toggles the bundle had in its menu but never read (dropped from MMP)
            const ds = NONE, fs = NONE, vs = NONE, Is = NONE, Gs = NONE, Xs = NONE, qs = NONE, wo = NONE;
            // a number option from the catalog (00-head.js); a blank value falls back to its default
            const OPT_DEFAULT = Object.create(null);
            for (const s of SETTINGS) OPT_DEFAULT[s.key] = s.default;
            function num(key) {
                const raw = ctx.settings[key];
                const n = raw === "" || raw == null ? NaN : Number(raw);
                return Number.isFinite(n) ? n : OPT_DEFAULT[key];
            }
            const optOn = (key) => !!ctx.settings[key];
            // bot-only or absent in the bundle's menu (bots are not ported)
            const Rs = NONE, _s = NONE, $s = NONE, Zs = NONE, so = NONE, ro = NONE, ao = NONE, lo = NONE, co = NONE,
                uo = NONE, ho = NONE, po = NONE, mo = NONE, go = NONE, yo = NONE, xo = NONE;
            // the renderer switch (not in the bundle): its whole frame vs the stock picture
            const fullFrame = tog("bundle renderer");
            // One-time move to the stock-look defaults. Installs that ran an earlier
            // version saved the bundle's visual defaults (all visuals, building hp /
            // owner, chat log, spike kb preview on); reset only those keys, once.
            try {
                const store0 = win.localStorage, FLAG = "mmp_stock_look_v1";
                if (store0 && !store0.getItem(FLAG)) {
                    for (const k in VISUAL_PRESETS.stock) if (ctx.settings[k] !== VISUAL_PRESETS.stock[k]) ctx.setSetting(k, VISUAL_PRESETS.stock[k]);
                    store0.setItem(FLAG, "1");
                }
            } catch (e) { /* no storage (headless) */ }
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

