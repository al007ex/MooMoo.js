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
            V2();
            n2();
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
                    // (the per-entity interpolation runs in ctx.combat every frame)
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
