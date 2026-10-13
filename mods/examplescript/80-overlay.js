            // =====================================================================
            // OVERLAY — the canvas the bundle's renderer draws on (82-render.js).
            // =====================================================================
            // A 2D canvas over the official client's canvases (it renders with WebGL).
            // It is shown once you are in a game and draws the bundle's whole frame;
            // pointer events pass through to the game.
            const ovl = { canvas: null, ctx: null, raf: null, dead: false, transform: [1, 0, 0, 1, 0, 0] };
            function buildOverlay() {
                if (ovl.canvas || !doc || !doc.body) return !!ovl.canvas;
                const game = doc.getElementById("gameCanvas");
                if (!game) return false;
                const after = doc.getElementById("textCanvas") || game;
                const c2 = doc.createElement("canvas");
                c2.style.position = "absolute";
                c2.style.left = "0px";
                c2.style.top = "0px";
                c2.style.pointerEvents = "none";
                c2.style.display = "none";
                after.parentNode.insertBefore(c2, after.nextSibling);
                ovl.canvas = c2;
                ovl.ctx = c2.getContext("2d");
                // the bundle's CanvasRenderingContext2D.prototype.roundRect (11590),
                // on this context only
                ovl.ctx.roundRect = function (e, t, n, i, s2) {
                    return n < 2 * s2 && (s2 = n / 2), i < 2 * s2 && (s2 = i / 2), s2 < 0 && (s2 = 0), this.beginPath(), this.moveTo(e + s2, t), this.arcTo(e + n, t, e + n, t + i, s2), this.arcTo(e + n, t + i, e, t + i, s2), this.arcTo(e, t + i, e, t, s2), this.arcTo(e, t, e + n, t, s2), this.closePath(), this;
                };
                const font = doc.createElement("link");
                font.rel = "stylesheet";
                font.href = "https://fonts.googleapis.com/css2?family=Lilita+One&display=swap";
                doc.head.appendChild(font);
                ctx.onCleanup(() => { try { c2.remove(); font.remove(); } catch (e) { /* ignore */ } ovl.canvas = null; });
                sm();
                listen(win, "resize", sm);
                return true;
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

            // ---- the frame (the bundle's ny(): gh / mh, then l2) ----
            function frame() {
                if (ovl.dead) return;
                ovl.raf = win.requestAnimationFrame(frame);
                gh = Date.now(), mh = gh - xh, xh = gh;
                if (!ovl.canvas && !buildOverlay()) return;
                const inGame = J.indexOf(z) >= 0;
                ovl.canvas.style.display = inGame ? "block" : "none";
                if (!inGame) return;
                mainContext = ovl.ctx;
                mainContext.setTransform(ovl.transform[0], ovl.transform[1], ovl.transform[2], ovl.transform[3], ovl.transform[4], ovl.transform[5]);
                try {
                    l2();
                } catch (err) {
                    // never leave a half-drawn frame over the game
                    mainContext.setTransform(1, 0, 0, 1, 0, 0);
                    mainContext.clearRect(0, 0, ovl.canvas.width, ovl.canvas.height);
                    if (!ovl.errLogged) { ovl.errLogged = true; console.error("[examplescript] render", err); }
                }
            }
            ctx.onCleanup(() => { ovl.dead = true; if (ovl.raf) win.cancelAnimationFrame(ovl.raf); });
            if (typeof win.requestAnimationFrame === "function") ovl.raf = win.requestAnimationFrame(frame);
