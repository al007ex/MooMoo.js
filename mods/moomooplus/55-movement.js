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

            // ---- path to the push spot: A* on the loader (ctx.path, a worker pool) ----
            // Resolves true when there is a path; Y3 holds it ([x, y, ...]) for the drawing.
            function U3(o) {
                return ctx.path.find(o).then((res) => { Y3 = res.path; return res.ok; });
            }
