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
