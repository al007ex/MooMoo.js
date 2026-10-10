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
