/*
 * Freecam + Zoom — scout the map from a free-flying camera on YOUR OWN private
 * MooMoo server (the moomoo-clone). Educational use on a server you run.
 * =============================================================================
 * Press the freecam key (default F) and your view detaches from your body: WASD
 * flies the camera around the map, your player glides with it, and your REAL
 * body stays exactly where it was — drawn as a faint "ghost" so you can see where
 * you actually are. Scroll the wheel (or use the slider) to zoom. Everything is
 * configured from the native in-game Mods tab.
 *
 * How it stays server-safe (undetected), entirely client-side:
 *   - Your body never moves on the server. While freecam is on we DROP the
 *     client's own "move"/"stopMove" frames (ctx.onOutgoing), so the server keeps
 *     you parked where you were. The client only ever sends a MOVE DIRECTION, never
 *     a position, so nothing about the freecam spot ever leaves your machine.
 *   - We drive the stock camera by overriding your own player object's render
 *     coordinates each frame (the stock camera eased-follows your player). That is
 *     pure local rendering state — it touches no socket, no window global, and none
 *     of the natives/elements the server's integrity probes look at. The loader
 *     already reports a clean telemetry "T" regardless, so there is nothing for the
 *     anti-cheat to see.
 *   - The ghost is drawn on the loader's overlay (class-less / id-less canvas), and
 *     the loader's overlay camera is pointed at the same freecam spot so the ghost
 *     and any other overlay stay lined up with the stock picture.
 *
 * Zoom changes the stock render scale, which lives in the client's renderer. That
 * renderer is only reachable (as window.__renderer) on a localhost / 127.0.0.1
 * build — which is where you run the clone — so zoom works there; elsewhere freecam
 * still works and zoom logs a one-line note instead of silently doing nothing.
 */
(function () {
    "use strict";

    function boot(MooMoo, MooMooLoader) {
        MooMoo.register({
            id: "freecam",
            name: "Freecam + Zoom",
            version: "1.0.0",
            description: "Detach the camera and fly around with WASD while your body stays put; scroll to zoom.",
            liveSettings: true,          // read settings live; don't tear the mod down on every slider nudge
            defaultEnabled: true,
            settings: [
                { key: "key", type: "text", default: "f", label: "Freecam key", basic: true, hint: "Tap to fly free, tap again to snap back to your body." },
                { key: "speed", type: "number", min: 4, max: 80, step: 2, default: 22, label: "Freecam speed", basic: true },
                { key: "zoom", type: "number", min: 40, max: 300, step: 5, default: 100, label: "Zoom %", basic: true, hint: "Under 100 sees more of the map; scroll the wheel over the game to change it." },
                { key: "wheelZoom", type: "boolean", default: true, label: "Scroll wheel zooms", basic: true },
                { key: "zoomStep", type: "number", min: 5, max: 50, step: 5, default: 15, label: "Wheel step %", basic: true },
                { key: "ghost", type: "boolean", default: true, label: "Show a ghost at your body", basic: true },
                { key: "ghostOpacity", type: "number", min: 10, max: 90, step: 5, default: 45, label: "Ghost opacity %", basic: true }
            ]
        }, function (ctx) {
            const win = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
            const doc = (win.document && win.document.createElement) ? win.document : null;
            const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

            // ---------- who am I ----------
            let mySid = -1;

            // ---------- capture the stock client's own player object ----------
            // The stock camera eased-follows the client's player object; there is no reachable
            // handle to it, so we latch onto it the moment the client builds it. Every player
            // object gets `this.tmpScore = 0` in its constructor, so we put an accessor on
            // Object.prototype.tmpScore: the first time any object sets it we turn it into a
            // normal own property on that object (the game is unaffected) and, if it looks like a
            // player, file it by sid, then resolve OUR player by sid lookup.
            //
            // UNDETECTION: an accessor on Object.prototype is the one thing here the server's
            // integrity probes could in principle see (a kind-1/2 enumeration of Object.prototype),
            // and the loader's telemetry sanitiser deliberately does NOT touch kind-1/2 bits (it
            // assumes no mod adds enumerable window/proto props). So we keep the window vanishingly
            // small: the hook is armed only while we're looking for our player — through the menu
            // (before any connection, so unprobed) and for the split second a (re)spawn takes — and
            // DISARMED the instant we have it. The server's first probe lands ~5s after spawn, by
            // which point Object.prototype is already clean. Re-armed on each (re)spawn; torn down
            // with the mod.
            const seenBySid = new Map();     // sid -> stock player object
            let protoHooked = false;
            let disarmTimer = null;
            function looksLikePlayer(o) {
                return o && typeof o === "object" && "sid" in o && "id" in o && typeof o.sid === "number";
            }
            function installCapture() {
                if (protoHooked) return;
                try {
                    Object.defineProperty(Object.prototype, "tmpScore", {
                        configurable: true,
                        set(v) {
                            // become an ordinary own property on this object (behaves exactly like a
                            // normal assignment). Never throw out of here — a non-extensible object
                            // would otherwise break the client's own constructor and the game with it.
                            try { Object.defineProperty(this, "tmpScore", { value: v, writable: true, configurable: true, enumerable: true }); }
                            catch (e) { /* can't convert this one; leave it */ }
                            try {
                                if (looksLikePlayer(this)) {
                                    seenBySid.set(this.sid, this);
                                    // Got ours -> lift the Object.prototype accessor immediately.
                                    if (this.sid === mySid) win.setTimeout(removeCapture, 0);
                                }
                            } catch (e) { /* ignore */ }
                        },
                        get() { return undefined; }
                    });
                    protoHooked = true;
                } catch (e) { /* ignore — freecam just won't pan until we find the player */ }
            }
            function removeCapture() {
                if (disarmTimer) { try { win.clearTimeout(disarmTimer); } catch (e) {} disarmTimer = null; }
                if (!protoHooked) return;
                try { delete Object.prototype.tmpScore; } catch (e) { /* ignore */ }
                protoHooked = false;
            }
            // Arm around a (re)spawn, and GUARANTEE a disarm within 2s even if the respawn reused the
            // existing player object (then no constructor runs, so the setter never fires) — still
            // well before the server's first integrity probe (~5s after spawn). The map keeps the
            // reused object, so freecam still finds it; we're only lifting the Object.prototype hook.
            function armForSpawn() {
                installCapture();
                if (disarmTimer) { try { win.clearTimeout(disarmTimer); } catch (e) {} }
                disarmTimer = (typeof win.setTimeout === "function") ? win.setTimeout(removeCapture, 2000) : null;
            }
            // Resolve the stock object for my own player (cached in the map even after disarming).
            function myStockPlayer() {
                if (mySid === -1) return null;
                const p = seenBySid.get(mySid);
                return (p && p.sid === mySid) ? p : null;
            }
            installCapture();                 // armed through the (unprobed) menu until the first spawn is caught
            ctx.onCleanup(removeCapture);
            // Catch the (re)built player on each spawn/respawn/reconnect, then disarm. We DON'T drop
            // the cached object: if the respawn reuses it, the map stays valid and the 2s fallback
            // lifts the hook; if it rebuilds, the setter overwrites the entry and disarms at once.
            ctx.on("setup", (p) => { mySid = p.sid; armForSpawn(); });
            ctx.on("died", () => { armForSpawn(); });

            // ---------- true position of my body (for the ghost) ----------
            // The loader keeps its own interpolated mirror of every player straight off the
            // wire, independent of anything we do to the stock client, so this is always my
            // real server position even while the freecam carries the stock camera away.
            function bodyPos() {
                const me = ctx.render && ctx.render.me;
                if (me && typeof me.x === "number") return { x: me.x, y: me.y, dir: me.dir || 0 };
                const s = ctx.self;
                return (s && s.alive) ? { x: s.x, y: s.y, dir: s.dir || 0 } : null;
            }

            // ---------- freecam state ----------
            let active = false;
            const cam = { x: 0, y: 0 };      // the free-flying world position
            let lastFrame = 0;

            function startFreecam() {
                const b = bodyPos();
                if (!b) { ctx.log("Freecam: spawn into the game first."); return; }
                if (!myStockPlayer()) {
                    ctx.log("Freecam: couldn't find your player yet — move once, then try again.");
                    return;
                }
                cam.x = b.x; cam.y = b.y;
                active = true;
                lastFrame = 0;
                // Halt the body on the server right now (one stop that we DON'T drop — it is
                // a mod send, not the client's), then drop everything the client sends after.
                try { MooMoo.send.stopMove(); } catch (e) { /* ignore */ }
                ctx.render && ctx.render.overrideCamera(cam.x, cam.y);
            }
            function stopFreecam() {
                active = false;
                ctx.render && ctx.render.clearCameraOverride();
                // Hand your player back to the server's position; the next update snaps it home.
                const p = myStockPlayer();
                if (p) { try { p.forcePos = false; } catch (e) { /* ignore */ } }
            }
            function toggleFreecam() { active ? stopFreecam() : startFreecam(); }

            // While freecam is on, the client's own movement never reaches the server, so
            // your body is parked. Aim ("D") still goes out, so you keep facing the mouse.
            ctx.onOutgoing("move", (payload, info) => (active && info.source === "client") ? false : undefined);
            ctx.onOutgoing("stopMove", (payload, info) => (active && info.source === "client") ? false : undefined);

            // ---------- flying the camera (our own rAF, so it runs AFTER the client's
            // frame and our override wins over the client's interpolation) ----------
            const held = (k) => ctx.input && ctx.input.isDown(k);
            function readWasd() {
                let dx = 0, dy = 0;
                if (held("a") || held("arrowleft")) dx -= 1;
                if (held("d") || held("arrowright")) dx += 1;
                if (held("w") || held("arrowup")) dy -= 1;
                if (held("s") || held("arrowdown")) dy += 1;
                if (dx && dy) { const inv = 1 / Math.sqrt(2); dx *= inv; dy *= inv; }   // no faster on the diagonal
                return { dx, dy };
            }

            let rafId = null, dead = false;
            function tick(now) {
                if (dead) return;
                rafId = win.requestAnimationFrame(tick);
                if (!active) { lastFrame = now; return; }
                if (ctx.input && ctx.input.isTyping()) { lastFrame = now; return; }   // don't fly while chatting
                const dt = lastFrame ? Math.min(50, now - lastFrame) : 16;
                lastFrame = now;

                const { dx, dy } = readWasd();
                const speed = ctx.settings.speed || 22;                 // world units per 16ms
                const step = speed * (dt / 16.6667);
                cam.x += dx * step;
                cam.y += dy * step;

                // Drive the STOCK camera + sprite: the camera eased-follows our player and
                // the sprite is drawn at it, so pinning the player object here does both.
                const p = myStockPlayer();
                if (p) {
                    p.x = cam.x; p.y = cam.y;
                    p.x1 = cam.x; p.y1 = cam.y;
                    p.x2 = cam.x; p.y2 = cam.y;
                    p.forcePos = true;      // interpolation snaps straight to (x2,y2) = the freecam spot
                    p.visible = true;
                }
                // Keep the overlay camera on the same spot so the ghost / other overlays align.
                ctx.render && ctx.render.overrideCamera(cam.x, cam.y);
            }
            rafId = win.requestAnimationFrame(tick);
            ctx.onCleanup(() => { dead = true; if (rafId != null && win.cancelAnimationFrame) win.cancelAnimationFrame(rafId); });

            // ---------- the ghost at your real body ----------
            // Drawn in stock-aligned world space: because the overlay camera is pointed at
            // the freecam spot, drawing at (bodyX, bodyY) lands exactly where your body is.
            ctx.render && ctx.render.layer("freecam-ghost", (g, view) => {
                if (!active || !ctx.settings.ghost) return;
                const b = bodyPos();
                if (!b) return;
                const x = b.x - view.left, y = b.y - view.top;
                const r = 35 * 1.0;                       // player body radius (stock scale ~35)
                const a = clamp((ctx.settings.ghostOpacity || 45) / 100, 0.05, 0.95);
                g.save();
                g.globalAlpha = a;
                // a soft translucent body
                g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2);
                g.fillStyle = "#ffffff"; g.fill();
                g.lineWidth = 4; g.strokeStyle = "#5a5a5a"; g.stroke();
                // a little "you are here" tether from the ghost toward the camera
                g.globalAlpha = a * 0.5;
                g.beginPath(); g.moveTo(x, y);
                g.lineTo(view.camX - view.left, view.camY - view.top);
                g.setLineDash([8, 10]); g.lineWidth = 3; g.strokeStyle = "#ffffff"; g.stroke();
                g.restore();
            }, { z: 50 });

            // ---------- zoom ----------
            // The stock render scale lives in the client's renderer object. The client only
            // publishes that object (window.__renderer) when its build-time debug flag is on;
            // the stock FRVR production bundle bakes it OFF, so a loader-only mod can't reach the
            // scale there. Where the renderer IS exposed (a debug build, or a one-line server
            // patch that un-gates window.__renderer), we wrap its setTransform to scale about the
            // screen centre. Either way we widen the live cull box so a zoomed-out view draws the
            // objects now inside it.
            const BASE_W = 1920, BASE_H = 1080;
            const zoomFactor = () => clamp((ctx.settings.zoom || 100) / 100, 0.4, 3);
            const wrapped = new WeakSet();
            let noRendererWarned = false;
            let configMutated = false, origCfg = null;   // the client's own config values, and whether we've changed them

            function wrapRenderer(r, canvas) {
                if (!r || typeof r.setTransform !== "function" || wrapped.has(r)) return;
                const orig = r.setTransform.bind(r);
                r.setTransform = function (a, b, c, d, e, f) {
                    const z = zoomFactor();
                    if (z === 1) return orig(a, b, c, d, e, f);
                    const cw = (canvas && canvas.width) || 0, ch = (canvas && canvas.height) || 0;
                    // scale about the screen centre: new = z*old + (1 - z)*centre
                    return orig(a * z, b, c, d * z, e + (cw / 2) * (1 - z), f + (ch / 2) * (1 - z));
                };
                wrapped.add(r);
            }
            // The client re-exposes its renderers every frame on a debug/localhost build; keep
            // the (own-property) wrapper on them, and expand the live cull box so a zoomed-out
            // view still draws the objects now inside it.
            function applyZoom() {
                try {
                    const gc = doc && doc.getElementById("gameCanvas");
                    const tc = doc && doc.getElementById("textCanvas");
                    if (win.__renderer) wrapRenderer(win.__renderer, gc);
                    if (win.__textRenderer) wrapRenderer(win.__textRenderer, tc);
                    if (!win.__renderer && zoomFactor() !== 1 && !noRendererWarned) {
                        noRendererWarned = true;
                        ctx.log("Zoom scale needs the client's renderer (window.__renderer), which the stock production build hides. The cull box still widens; see the README for the one-line server patch that enables full zoom. Freecam works regardless.");
                    }
                    // Culling reads window.config live, so widen it when a zoom-out is ACTUALLY in
                    // effect (the renderer is reachable). Otherwise leave config exactly as the client
                    // set it — including restoring it when zoom goes back to normal — so there is
                    // nothing off-baseline on window.config for an integrity probe to notice. In the
                    // common case (default zoom, or the production client that hides its renderer) we
                    // never touch config at all.
                    const z = zoomFactor();
                    const cfg = win.config;
                    if (cfg && typeof cfg === "object") {
                        if (origCfg === null && typeof cfg.maxScreenWidth === "number") origCfg = { w: cfg.maxScreenWidth, h: cfg.maxScreenHeight };
                        const base = origCfg || { w: BASE_W, h: BASE_H };
                        const active = !!win.__renderer && z < 1;   // zoom-out that the renderer can honour
                        if (active || configMutated) {
                            const w = active ? Math.round(base.w / z) : base.w;
                            const h = active ? Math.round(base.h / z) : base.h;
                            try { cfg.maxScreenWidth = w; } catch (e) { /* frozen */ }
                            try { cfg.maxScreenHeight = h; } catch (e) { /* frozen */ }
                            configMutated = active;
                        }
                    }
                } catch (e) { /* ignore */ }
            }
            function restoreConfig() {
                try { if (configMutated && origCfg && win.config) { win.config.maxScreenWidth = origCfg.w; win.config.maxScreenHeight = origCfg.h; configMutated = false; } } catch (e) { /* ignore */ }
            }
            const zoomPoll = win.setInterval(applyZoom, 500);
            applyZoom();
            ctx.onCleanup(() => { win.clearInterval(zoomPoll); restoreConfig(); });

            // scroll wheel over the game area -> zoom
            function onWheel(e) {
                if (!ctx.settings.wheelZoom) return;
                const t = e.target;
                if (!t || (t.id !== "gameCanvas" && t.id !== "textCanvas")) return;
                const stepPct = ctx.settings.zoomStep || 15;
                const dir = e.deltaY > 0 ? -1 : 1;             // wheel up = zoom in
                const next = clamp(Math.round((ctx.settings.zoom || 100) + dir * stepPct), 40, 300);
                if (next !== (ctx.settings.zoom || 100)) { ctx.setSetting("zoom", next); applyZoom(); }
                try { e.preventDefault(); } catch (_) { /* passive */ }
            }
            win.addEventListener("wheel", onWheel, { passive: false, capture: true });
            ctx.onCleanup(() => { try { win.removeEventListener("wheel", onWheel, { capture: true }); } catch (e) {} win.removeEventListener("wheel", onWheel, true); });

            // react to settings changes made from the Mods tab (zoom typed in, key rebound)
            ctx.onSettingChange((key) => { if (key === "zoom") applyZoom(); if (key === "key") bindKey(); });

            // ---------- the toggle key ----------
            let unbindKey = null;
            function bindKey() {
                if (unbindKey) { try { unbindKey(); } catch (e) {} unbindKey = null; }
                const k = (ctx.settings.key || "f").trim().toLowerCase();
                if (ctx.input && ctx.input.onKey && k) unbindKey = ctx.input.onKey(k, () => toggleFreecam());
            }
            bindKey();
            ctx.onCleanup(() => { if (unbindKey) { try { unbindKey(); } catch (e) {} } stopFreecam(); });

            ctx.log("Freecam + Zoom ready — press " + String(ctx.settings.key || "F").toUpperCase() + " to fly. Settings live in the Mods tab.");
        });
    }

    // Reach the loader's API through its event handshake — no window global, same as
    // every other moomoo.js mod.
    const w = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
    function connect() {
        let mm = null, ld = null;
        try { w.dispatchEvent(new CustomEvent("moomoo.js:api", { detail: { resolve: (m, l) => { mm = m; ld = l; } } })); } catch (e) {}
        if (mm) { boot(mm, ld); return true; }
        return false;
    }
    if (connect()) return;
    let tries = 0;
    const iv = setInterval(() => { if (connect() || ++tries > 200) clearInterval(iv); }, 50);
    if (w.addEventListener) w.addEventListener("moomoo.js:ready", () => { if (connect()) clearInterval(iv); });
})();
