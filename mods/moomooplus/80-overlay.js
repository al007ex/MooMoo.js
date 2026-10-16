            // =====================================================================
            // OVERLAY — where the bundle's drawing goes (the loader's ctx.render).
            // =====================================================================
            // Two modes, picked by the "bundle renderer" setting:
            //   on : the bundle's renderer (l2, 82-render.js) replaces the whole frame
            //        on the loader's frame canvas, exactly like the bundle drew it.
            //   off: the stock moomoo.io picture stays. Only the bundle's additive
            //        visuals you switch on are drawn (84-stock-overlay.js), on a
            //        transparent layer lined up with the stock camera. With none on,
            //        nothing is drawn at all: plain moomoo.io.
            const render = ctx.render;
            const ovl = { canvas: null, ctx: null, transform: [1, 0, 0, 1, 0, 0] };
            // the bundle's CanvasRenderingContext2D.prototype.roundRect (11590), on
            // the contexts it draws with (the page usually has it already)
            function withRoundRect(g) {
                if (g && !g.__mmjRound) {
                    g.__mmjRound = true;
                    g.roundRect = function (e, t, n, i, s2) {
                        return n < 2 * s2 && (s2 = n / 2), i < 2 * s2 && (s2 = i / 2), s2 < 0 && (s2 = 0), this.beginPath(), this.moveTo(e + s2, t), this.arcTo(e + n, t, e + n, t + i, s2), this.arcTo(e + n, t + i, e, t + i, s2), this.arcTo(e, t + i, e, t, s2), this.arcTo(e, t, e + n, t, s2), this.closePath(), this;
                    };
                }
                return g;
            }
            // the bundle's text font
            if (doc && doc.head) {
                const font = doc.createElement("link");
                font.rel = "stylesheet";
                font.href = "https://fonts.googleapis.com/css2?family=Lilita+One&display=swap";
                doc.head.appendChild(font);
                ctx.onCleanup(() => { try { font.remove(); } catch (e) { /* ignore */ } });
            }

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

            // ---- bundle renderer: one frame of the bundle (its ny(): gh / mh, then l2) ----
            function bundleFrame(f) {
                gh = Date.now(), mh = gh - xh, xh = gh;
                if (J.indexOf(z) < 0) return false;          // not spawned yet: show the stock picture
                if (ovl.canvas !== f.canvas) {
                    ovl.canvas = f.canvas;
                    ovl.ctx = withRoundRect(f.g);
                    sm();
                }
                mainContext = ovl.ctx;
                mainContext.setTransform(ovl.transform[0], ovl.transform[1], ovl.transform[2], ovl.transform[3], ovl.transform[4], ovl.transform[5]);
                l2();
                return true;
            }

            // ---- pick the mode from the settings, live ----
            let unReplace = null, unLayer = null;
            function stockLayerWanted() { return ws.checked || ks.checked || As.checked || Ks.checked; }
            function applyRenderMode() {
                if (!render) return;
                const full = fullFrame.checked;
                if (full && !unReplace) unReplace = render.replace({ draw: bundleFrame });
                else if (!full && unReplace) { unReplace(); unReplace = null; }
                const layer = !full && stockLayerWanted();
                if (layer && !unLayer) unLayer = render.layer("mmp", drawStockOverlay, { z: 10 });
                else if (!layer && unLayer) { unLayer(); unLayer = null; }
                // nothing draws the minimap extras in this mode: wipe what is left
                if (!full && !(layer && ws.checked)) stockOverlayOff();
            }
            // (the first applyRenderMode() runs at the end of 84-stock-overlay.js,
            // once everything it touches exists)
