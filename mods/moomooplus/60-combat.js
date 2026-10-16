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
                let n = Y && se(z, Y) <= num("hatRange") && !z.inWater && js.checked ? true : false;
                let i = Y && se(z, Y) <= num("hatRange") && !Ws.checked ? 19 : 11;
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
            // Watchdog. Movement is gated on !jt and aim / hitting on !p && !gt, so if an
            // async combo (an insta, polearm aids, auto push) ever throws before clearing
            // its busy flag, that flag strands true and you freeze until the mod is
            // toggled. Real combos clear within a few ticks (a push within a couple of
            // seconds), so a flag stuck far past that is stranded — clear it and carry on.
            let stuckShort = 0, stuckPush = 0;
            function comboWatchdog() {
                if (p || gt || Mt || Ot || hn || ct) {
                    if (++stuckShort > 10) {       // ~1.1s; no real hit/aim combo is this long
                        p = gt = Mt = Ot = hn = ct = false;
                        g[0] = null; y = null; nn = 0;
                        stuckShort = 0;
                        b("combat state auto-cleared (stuck combo)", "", "#5c0620", false, true);
                    }
                } else stuckShort = 0;
                if (jt || Ht) {
                    // recover fast if you're clearly trying to move (holding a key) and can't;
                    // otherwise give a real push longer before deciding it's stuck.
                    const trying = Object.keys(vm).length > 0;
                    if (++stuckPush > (trying ? 12 : 45)) {
                        jt = Ht = false; jn = "not"; ni = "not";
                        stuckPush = 0;
                        b("auto push auto-cleared (stuck)", "", "#5c0620", false, true);
                    }
                } else stuckPush = 0;
            }
            own(combat.onPreTick(function () {
                sync();
                comboWatchdog();
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
                if (Ts.checked && pingNow() >= num("autoQPing")) {
                    z.Qheal = false;
                    if (en && z?.dmgpot?.add + z?.dmgpot?.turretGear >= 100 && z.shameCount < num("healMaxShame") && !z.shameLeak) {
                        p4();
                        b(`AutoQ`, "", "#5c0620", false, true);
                        z.Qheal = true;
                    } else if ((!_n && (z.health < num("healBelow") || z.shameCount > 0 && z.health < 100) || _n && z.health < 100) && en && z.skinIndex != 45) {
                        setTimeout(() => {
                            if (Ts.checked && z.health < 100 && (z.health > z.dmgpot?.hp * (z.skinIndex == 6 && !z.hitting && !p ? .75 : 1) || z.shameCount >= 7)) u4();
                        }, 120 - xt + 9);
                    }
                }
                if (en && zi.length > 0) {
                    Gi = zi.reduce((e, t) => e + S(t.value), 0);
                    fullFrame.checked && U1.showText(zi[0].x, zi[0].y, 50, .18, 500, Gi, "#8ecc51");
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
                Sg = no.checked ? Xt.filter((e) => e.name == "turret" && se(z, e) <= num("empRange") + z.movSpd && e?.time == 2200 && !te(e?.owner?.sid)) : [];
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
                    if (z.alive && z.health <= z.dmgpot?.hp * (z.skinIndex == 6 && !z.hitting && !p && !Sg.length && !gt && !z.shameLeak ? .75 : 1) && z.skinIndex != 45 && z.shameCount < num("healMaxShame")) {
                        u4();
                    } else if ((!_n && (z.health < num("healBelow") || z.shameCount > 0 && z.health < 100) || _n && Date.now() - z.lastDamage >= 100 && z.health < 100 || _n && z.health <= num("healEmergency")) && en && z.skinIndex != 45) {
                        if (z.health <= num("healEmergency")) setTimeout(() => { u4(); }, 120 - xt + 9);
                        else if (optOn("healShameSafe")) shameSafe(u4); else u4();
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
                    if (hs.checked && fullFrame.checked) {   // replaces the per-hit numbers: bundle renderer only
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
