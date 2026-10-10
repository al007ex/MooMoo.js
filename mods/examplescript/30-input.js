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
