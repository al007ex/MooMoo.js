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
                // the bundle tested the element (`!Ks`, always truthy), so its toggle never
                // switched this off; it gates it now, like every other toggle
                if (!Ks.checked || Date.now() - p3 < 730) return;
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
