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

