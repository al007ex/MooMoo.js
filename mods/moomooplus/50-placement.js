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
            // The bundle's routine heal (health under 85, nothing lethal coming) ate
            // right away: on a real server its ping put that eat past the 120 ms
            // shame window. On a local server it lands inside it, so every heal
            // would count as shame (8 = the shame hat, no eating for 30 s). This
            // waits until the window has passed (ctx.combat.shameWait), one heal at
            // a time. Emergency heals still go out at once, as in the bundle.
            let healWait = 0;
            function shameSafe(fn) {
                const w = combat.shameWait ? combat.shameWait() : 0;
                if (w <= 0) return fn();
                if (healWait) return;
                healWait = setTimeout(() => { healWait = 0; fn(); }, w);
            }
            ctx.onCleanup(() => clearTimeout(healWait));
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
                    // Fixed: the bundle wrote `... && name == "spikes" || "greater spikes"`, which is
                    // always truthy, so its toggle did nothing. Now the toggle and its range count.
                    if (!qm && Y && ms.checked && z.items[2] != null && se(z, Y) <= 235 && se(z, e) <= num("replaceRange")) {
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
