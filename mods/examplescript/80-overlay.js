            // =====================================================================
            // OVERLAY — where the bundle's own drawing goes.
            // =====================================================================
            // The bundle rendered the whole game on a 2D canvas; this server's client
            // renders with WebGL. The bundle's visuals are drawn on a transparent 2D
            // canvas laid exactly over the game, in the same world units: the overlay
            // mirrors the official client's camera (Vm, official 8693) and its entity
            // interpolation, so a ring drawn at a player's position sits on that
            // player's sprite.
            //   view(): screen px per world unit (official zr(), 8259)
            //   cam.l / cam.u: world coords of the top-left of the view (rt - ie/2, lt - ue/2)
            //   rpos(sid): where the official client draws that player / animal now
            const ovl = { canvas: null, ctx: null, raf: null, dead: false, last: 0 };
            const cam = { rt: K.mapScale / 2, lt: K.mapScale / 2, l: 0, u: 0, ie: K.maxScreenWidth, ue: K.maxScreenHeight, e: 1 };
            const mirP = new Map(), mirA = new Map();
            function mirrorUpdate(map, sid, x2, y2, d2) {
                let p = map.get(sid);
                if (!p) { p = { sid, visible: false, x: x2, y: y2, dir: d2, x1: x2, y1: y2, x2: x2, y2: y2, d1: d2, d2: d2, dt: 0 }; map.set(sid, p); }
                p.forcePos = !p.visible;
                p.x1 = p.x; p.y1 = p.y;
                p.settle = p.x2 == x2 && p.y2 == y2;
                p.x2 = x2; p.y2 = y2;
                p.d2 = d2;
                p.d1 = p.forcePos || p.dir === void 0 ? p.d2 : p.dir;
                p.dt = 0;
                p.visible = true;
            }
            ctx.on("playersUpdate", function (pk) {
                for (const pos of pk.positions || []) mirrorUpdate(mirP, pos.sid, pos.x, pos.y, pos.dir);
                for (const sid of pk.hidden || []) { const p = mirP.get(sid); if (p) p.visible = false; }
            });
            ctx.on("playerAdd", function (pk) {
                const d = pk && pk.data; if (!d) return;
                const p = mirP.get(d[1]); if (p) p.visible = false;
            });
            ctx.on("playerRemove", function (pk) { mirP.delete(pk && pk.sid); });
            ctx.on("animalsUpdate", function (pk) {
                const a = (pk && pk.args) || [];
                const n = a[0] || [], hidden = a[1] || [];
                for (let o = 0; o + 7 < n.length; o += 8) {
                    const prev = mirA.get(n[o]);
                    if (prev && prev.index != n[o + 1]) mirA.delete(n[o]);
                    if (!mirA.get(n[o])) {
                        mirA.set(n[o], { sid: n[o], index: n[o + 1], visible: true, forcePos: true, x: n[o + 2], y: n[o + 3], x1: n[o + 2], y1: n[o + 3], x2: n[o + 2], y2: n[o + 3], dir: n[o + 4] / 100, d1: n[o + 4] / 100, d2: n[o + 4] / 100, dt: 0 });
                    } else mirrorUpdate(mirA, n[o], n[o + 2], n[o + 3], n[o + 4] / 100);
                }
                for (const sid of hidden) { const p = mirA.get(sid); if (p) p.visible = false; }
            });
            function rpos(e) {
                if (!e) return null;
                const p = (e.isAI ? mirA : mirP).get(e.sid);
                return p && p.visible ? p : null;
            }
            // screen x/y of a world point, and of an entity as the client draws it
            const SX = (x) => x - cam.l, SY = (y) => y - cam.u;
            const RX = (e) => { const p = rpos(e); return (p ? p.x : (e.x2 != null ? e.x2 : e.x)) - cam.l; };
            const RY = (e) => { const p = rpos(e); return (p ? p.y : (e.y2 != null ? e.y2 : e.y)) - cam.u; };

            // one frame of the official client's interpolation + camera, mirrored
            function stepMirror(De) {
                const zp = mirP.get(z.sid);
                const S0p = z.alive && zp ? zp : null;
                if (S0p) {
                    const d = Math.hypot(cam.rt - S0p.x, cam.lt - S0p.y);
                    const r = Math.atan2(S0p.y - cam.lt, S0p.x - cam.rt);
                    const hh = Math.min(d * .01 * De, d);
                    d > .05 ? (cam.rt += hh * Math.cos(r), cam.lt += hh * Math.sin(r)) : (cam.rt = S0p.x, cam.lt = S0p.y);
                } else { cam.rt = K.mapScale / 2; cam.lt = K.mapScale / 2; }
                const s = 1e3 / K.serverUpdateRate;
                for (const map of [mirP, mirA]) {
                    for (const pp of map.values()) {
                        if (!pp.visible) continue;
                        if (pp.forcePos) { pp.x = pp.x2; pp.y = pp.y2; pp.dir = pp.d2; continue; }
                        pp.dt += De;
                        const r = Math.min(pp.settle ? 1 : 1.7, pp.dt / 170);
                        pp.x = pp.x1 + (pp.x2 - pp.x1) * r;
                        pp.y = pp.y1 + (pp.y2 - pp.y1) * r;
                        pp.dir = combat.lerpAngle(pp.d2, pp.d1, Math.min(1, pp.dt / s));
                    }
                }
                if (cameraLocked() && S0p) { cam.rt = S0p.x; cam.lt = S0p.y; }
                cam.l = cam.rt - cam.ie / 2;
                cam.u = cam.lt - cam.ue / 2;
            }
            function cameraLocked() { try { return win.localStorage && win.localStorage.getItem("camera_lock") == "true"; } catch (e) { return false; } }

            // ---- the canvas ----
            function buildOverlay() {
                if (ovl.canvas || !doc || !doc.body) return !!ovl.canvas;
                const game = doc.getElementById("gameCanvas");
                if (!game) return false;
                const c2 = doc.createElement("canvas");
                c2.style.position = "absolute";
                c2.style.left = "0px";
                c2.style.top = "0px";
                c2.style.pointerEvents = "none";
                game.parentNode.insertBefore(c2, game.nextSibling);
                ovl.canvas = c2;
                ovl.ctx = c2.getContext("2d");
                const font = doc.createElement("link");
                font.rel = "stylesheet";
                font.href = "https://fonts.googleapis.com/css2?family=Lilita+One&display=swap";
                doc.head.appendChild(font);
                ctx.onCleanup(() => { try { c2.remove(); font.remove(); } catch (e) { /* ignore */ } ovl.canvas = null; });
                resizeOverlay();
                listen(win, "resize", resizeOverlay);
                return true;
            }
            function resizeOverlay() {
                if (!ovl.canvas) return;
                const ct2 = win.innerWidth, dt2 = win.innerHeight;
                const Gs = K.maxScreenWidth, Na = K.maxScreenHeight, vm2 = Na * 1.15;
                const e = Math.max(ct2 / Gs, dt2 / vm2, Math.sqrt(ct2 * dt2 / (Gs * Na)));
                cam.e = e; cam.ie = ct2 / e; cam.ue = dt2 / e;
                const dpr = Math.min(2, win.devicePixelRatio || 1);
                ovl.dpr = dpr;
                ovl.canvas.width = Math.round(ct2 * dpr);
                ovl.canvas.height = Math.round(dt2 * dpr);
                ovl.canvas.style.width = ct2 + "px";
                ovl.canvas.style.height = dt2 + "px";
            }
            // q + wheel zoom (11682) / "p" reset (em): the bundle scaled its own view.
            // The official client's view size is fixed, so the overlay keeps it.
            function applyZoom() { }

            // ---- the bundle's floating text (TextObj Ml / manager Nl, 2426) ----
            function Ml() {
                this.init = function (e, t, n, i, s, o, r) {
                    this.x = e; this.y = t; this.color = r; this.scale = n; this.speed = i; this.life = s; this.text = o;
                    this.startScale = this.scale * .1;
                    this.maxScale = 1.2 * n;
                    this.scaleSpeed = .7;
                    this.speedMax = i;
                    this.visuals = true;
                    this.movSpeed = Math.random() * 1 + 1;
                    this.movAngle = Math.random() * 1 < .5;
                    this.maxLife = s;
                };
                this.update = function (e) {
                    if (this.life > 0) {
                        this.life -= e;
                        if (this.visuals) {
                            this.y -= this.speed * e;
                            if (this.scaleSpeed !== -.35) this.x += (this.movAngle ? -1 : 1) * this.speed * e * this.movSpeed;
                            else this.y += this.speed * e;
                            this.scale += this.scaleSpeed * (e / 4.5);
                            this.scale = oe(this.scale, this.startScale);
                            if (this.speed < this.speedMax) this.speed += this.speedMax * .01;
                            if (this.scale >= this.maxScale) { this.scale = this.maxScale; this.scaleSpeed *= -.5; this.speed *= .5; }
                        } else {
                            this.y -= this.speed * e;
                            this.scale += this.scaleSpeed * e;
                            if (this.scale >= this.maxScale) { this.scale = this.maxScale; this.scaleSpeed *= -1; }
                            else if (this.scale <= this.startScale) { this.scale = this.startScale; this.scaleSpeed = 0; }
                        }
                        if (this.life <= 0) this.life = 0;
                    }
                };
                this.render = function (e, t, n) {
                    e.font = this.scale + "px Lilita One";
                    if (this.visuals) {
                        e.lineWidth = 10;
                        e.strokeStyle = "#3d3f42";
                        e.fillStyle = this.color;
                        e.globalAlpha = this.life / this.maxLife * 2;
                        e.strokeText(this.text, this.x - t, this.y - n);
                    } else {
                        e.fillStyle = this.color;
                    }
                    e.fillText(this.text, this.x - t, this.y - n);
                    e.globalAlpha = 1;
                };
            }
            function Nl() {
                this.texts = [];
                this.update = function (t, n, i, s) {
                    n.textBaseline = "middle";
                    n.textAlign = "center";
                    for (let e = 0; e < this.texts.length; ++e) {
                        const o = this.texts[e];
                        if (o.life) { o.update(t); o.render(n, i, s); }
                    }
                };
                this.showText = function (e, t, n, i, s, o, r) {
                    let a = this.texts.find((e2) => !e2.life);
                    if (!a) { a = new Ml(); this.texts.push(a); }
                    a.init(e, t, n, i, s, o, r);
                };
            }
            const U1 = new Nl();

            // ---- the frame ----
            const drawHooks = [];          // visuals register (ctx2d, delta) => void here, in draw order
            function frame() {
                if (ovl.dead) return;
                ovl.raf = win.requestAnimationFrame(frame);
                const now = Date.now();
                const De = ovl.last ? now - ovl.last : 16;
                ovl.last = now;
                if (!ovl.canvas && !buildOverlay()) return;
                stepMirror(De);
                const g2 = ovl.ctx;
                g2.setTransform(1, 0, 0, 1, 0, 0);
                g2.clearRect(0, 0, ovl.canvas.width, ovl.canvas.height);
                if (!en) return;
                const sc = cam.e * ovl.dpr;
                g2.setTransform(sc, 0, 0, sc, 0, 0);
                g2.globalAlpha = 1;
                for (const fn of drawHooks) {
                    try { fn(g2, De); } catch (err) { /* a visual must never stop the frame */ }
                    g2.globalAlpha = 1;
                }
                U1.update(De, g2, cam.l, cam.u);
            }
            ctx.onCleanup(() => { ovl.dead = true; if (ovl.raf) win.cancelAnimationFrame(ovl.raf); });
            if (typeof win.requestAnimationFrame === "function") ovl.raf = win.requestAnimationFrame(frame);
