            // =====================================================================
            // STOCK OVERLAY — the bundle's additive visuals on the stock picture.
            // =====================================================================
            // Drawn on the loader's transparent layer (ctx.render.layer) in world
            // space lined up with the stock camera, using the bundle's own drawing
            // code, so each piece looks exactly as it did in the bundle. Only what
            // ADDS to the stock picture is drawn here. Whatever would replace a stock
            // element (names, health bars, chat bubbles, the damage-number style, the
            // world itself) belongs to the bundle renderer ("bundle renderer" on).
            //
            //   all visuals        sid numbers, gain/leak, shame count, reload arcs,
            //                      the packet bar ("reload bars"), animal health, the
            //                      far target's name, the insta/push target marker, kb
            //                      prediction rings, placement previews, death ghosts,
            //                      the bundle's floating texts, the minimap extras
            //   building hp/owner  health bars and owner sids on buildings near you
            //   spike kb visual    the knockback preview ghosts
            let minimapDrawn = false;
            function drawStockOverlay(g, view) {
                const left = view.left, top = view.top;
                mainContext = withRoundRect(g);
                // the bundle's frame clock drives its animations, ghosts and texts
                gh = view.now; mh = view.delta; xh = view.now;
                if (ws.checked) drawGhostObjects(left, top, view);
                if (ws.checked || Ks.checked) { stepGhostPlayers(view.now, view.delta); drawGhostPlayers(left, top); }
                l2Players(left, top, render);
                if (ws.checked) U1.update(view.delta, mainContext, left, top);
                if (ws.checked) { Sp(view.delta); minimapDrawn = true; }
                else if (minimapDrawn) { clearSp(); minimapDrawn = false; }
            }

            // ---- placement previews (b2's body for the fakes in Ze, 14537) ----
            function drawGhostObjects(left, top, view) {
                for (let layer = -1; layer <= 3; ++layer) {
                    for (let n = 0; n < Ze.length; ++n) {
                        const o = Ze[n];
                        if (!o || !o.active) continue;
                        if (layer === 0) o.update(mh);
                        if (o.layer !== layer) continue;
                        const r = o.x + o.xWiggle - left, a = o.y + o.yWiggle - top;
                        const pad = o.scale + (o.blocker || 0);
                        if (r + pad < 0 || r - pad > view.width || a + pad < 0 || a - pad > view.height) continue;
                        if (Wi.some((e) => e.sid === o.sid)) {
                            w2(o);
                            mainContext.globalAlpha = o.hideFromEnemy ? .6 : o.preplace ? .7 : o.fake ? .3 : o.opacity2;
                        } else {
                            mainContext.globalAlpha = o.hideFromEnemy ? .6 : o.preplace ? .7 : o.fake ? .3 : o.opacity;
                        }
                        if (o.isItem) {
                            if (o.fake && !Ns.checked) {
                                mainContext.save();
                                mainContext.translate(r, a);
                                mainContext.rotate(o.dir);
                                mainContext.beginPath();
                                mainContext.arc(0, 0, o.scale, 0, ae);
                                mainContext.fillStyle = o.restricter ? "#6bed5f" : o.preplace ? "#d4577c" : "#7da7b1";
                                mainContext.fill();
                                mainContext.stroke();
                                mainContext.restore();
                            } else {
                                const img = H2(o, false, false, o);
                                mainContext.save();
                                mainContext.translate(r, a);
                                mainContext.rotate(o.dir);
                                mainContext.drawImage(img, -(img.width / 2), -(img.height / 2));
                                if (o.blocker) {
                                    mainContext.strokeStyle = "#db6e6e";
                                    mainContext.globalAlpha = .3;
                                    mainContext.lineWidth = 6;
                                    k(0, 0, o.blocker, mainContext, false, true);
                                }
                                mainContext.restore();
                            }
                        } else {
                            const img = F2(o);
                            mainContext.drawImage(img, r - img.width / 2, a - img.height / 2);
                        }
                    }
                }
                mainContext.globalAlpha = 1;
            }

            // ---- ghost players: kb previews (m3) and death ghosts (g3) ----
            // their movement, as l2 steps the fakes in Ci every frame (14078)
            function stepGhostPlayers(now, delta) {
                const x6 = now - ce;
                for (let n = 0; n < Ci.length; ++n) {
                    const f6 = Ci[n];
                    if (!f6 || !(f6.visible || f6.fake)) continue;
                    if (f6.forcePos) { f6.x = f6.x2; f6.y = f6.y2; f6.dir = f6.d2; continue; }
                    const a6 = (x6 - f6.t1) / (f6.t2 - f6.t1);
                    f6.dt += delta;
                    const c6 = j(1.7, f6.dt / 170);
                    f6.x = f6.x1 + (f6.x2 - f6.x1) * c6;
                    f6.y = f6.y1 + (f6.y2 - f6.y1) * c6;
                    f6.lastx = f6.x;
                    f6.lasty = f6.y;
                    f6.dir = Math.lerpAngle(f6.d2, f6.d1, j(1.2, a6));
                }
            }
            // and A2's drawing of them (14655), per zIndex like A2
            function drawGhostPlayers(left, top) {
                for (let zi0 = 0; zi0 <= 1; ++zi0) {
                    for (let n = 0; n < Ci.length; ++n) {
                        const t = Ci[n];
                        if (!t || t.zIndex != zi0) continue;      // eslint-disable-line eqeqeq
                        if (t.deathAnim ? !ws.checked : !Ks.checked) continue;
                        t.animate && t.animate(mh);
                        mainContext.globalAlpha = t.vals && (t.vals = oe(0, t.vals -= t.decay));
                        if (t.visible || t.fake || t.spectate) {
                            t.skinRot += .002 * mh;
                            mainContext.save();
                            mainContext.translate(t.x - left, t.y - top);
                            mainContext.rotate(t.dir + t.dirPlus);
                            I2(t, mainContext);
                            mainContext.restore();
                        }
                    }
                }
                mainContext.globalAlpha = 1;
            }

            function stockOverlayOff() {
                clearSp();                // also wipes what the bundle renderer last drew there
                minimapDrawn = false;
            }

            // pick the render mode now, and again whenever a setting changes
            ctx.onSettingChange && ctx.onSettingChange(() => applyRenderMode());
            applyRenderMode();
