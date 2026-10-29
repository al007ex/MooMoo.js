/*
 * moomoo.js loader — RENDER  (overlay canvases + a replica of the stock camera)
 * ==========================================================================
 * The official client draws the game with a WebGL sprite batcher that nothing can
 * hook into. So mods draw on overlay canvases stacked right above it, and this
 * module makes those overlays line up with the stock picture pixel for pixel:
 *
 *   - It mirrors every player and animal the way the stock client does
 *     (addPlayer / updatePlayers / updateAnimals): the same x1/x2 bookkeeping, the
 *     same "settle" cap, the same snap after becoming visible, the same
 *     per-frame interpolation (min(settle ? 1 : 1.7, dt / 170)) and the same
 *     direction lerp.
 *   - It runs the stock camera: the same eased follow (min(d * .01 * delta, d)),
 *     the map-centre fallback, the snap on spawn and the stock "camera lock"
 *     setting, and the stock view size, which depends on the window's aspect:
 *         scale = max(w / 1920, h / (1080 * 1.15), sqrt(w * h / (1920 * 1080)))
 *
 * What mods get:
 *   addLayer(id, draw, {z})  draw(g, view) every frame on a transparent canvas in
 *                            stock-aligned world space: draw a world point at
 *                            (x - view.left, y - view.top), exactly like the stock
 *                            and bundle renderers do.
 *   setReplacer({draw})      take over the WHOLE frame: draw({canvas, g, view,
 *                            delta, now}) on an opaque canvas the replacer sizes
 *                            itself (return false to skip a frame and show the stock
 *                            picture). The stock canvases are hidden meanwhile (they
 *                            keep running, they just aren't composited), and layers
 *                            pause. One replacer at a time; the latest wins.
 *   onFrame(fn)              fn(view) every frame, after the camera/mirrors step.
 *   player(sid) / animal(sid) the stock-interpolated mirror {x, y, dir, visible, ...}
 *   view                     {left, top, width, height, scale, dpr, camX, camY,
 *                            delta, now, inGame}
 *
 * Part of the LOADER (volatile): it tracks the stock client's rendering rules.
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooRender = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooRender = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const TAU = Math.PI * 2;

    // The stock client's Math.lerpAngle.
    function lerpAngle(from, to, amount) {
        if (Math.abs(to - from) > Math.PI) {
            if (from > to) to += TAU; else from += TAU;
        }
        const out = to + (from - to) * amount;
        return out >= 0 && out <= TAU ? out : out % TAU;
    }

    function createRender(env) {
        const win = env.win;
        const MooMoo = env.MooMoo;
        const cfg = env.config || {};
        const MAX_W = cfg.maxScreenWidth || 1920;
        const MAX_H = cfg.maxScreenHeight || 1080;
        const MAP = cfg.mapScale || 14400;
        const TICK_MS = 1000 / (cfg.serverUpdateRate || 9);
        const report = env.onError || ((e) => { try { console.error("[moomoo.js] render", e); } catch (_) { /* ignore */ } });
        const doc = (win && win.document && typeof win.document.createElement === "function") ? win.document : null;

        // ---- stock-style mirrors of every player and animal ----
        const players = new Map();      // sid -> mirror
        const animals = new Map();      // sid -> mirror
        let me = null;                  // the stock client's `S` (your own player)
        const camera = { x: MAP / 2, y: MAP / 2 };
        // A mod (freecam) can point the overlay camera at a world spot of its own
        // instead of `me`, so our overlays keep lining up with the stock picture when
        // the stock camera has been pushed off your real position. null = follow `me`.
        let camOverride = null;

        MooMoo.on("playerAdd", (pk) => {
            const d = pk && pk.data;
            if (!Array.isArray(d)) return;
            let p = players.get(d[1]);
            if (!p) { p = { sid: d[1] }; players.set(d[1], p); }
            // stock addPlayer: spawn, hide until the first position, forget x2/y2
            p.id = d[0];
            p.name = d[2];
            p.visible = false;
            p.x2 = undefined; p.y2 = undefined;
            p.x = d[3]; p.y = d[4]; p.dir = d[5];
            p.scale = d[8];
            p.dt = 0;
            if (pk.isYou) { me = p; camera.x = p.x; camera.y = p.y; }
        });
        MooMoo.on("playerRemove", (pk) => {
            // the wire carries the player's id here (the stock removes by id)
            const id = pk && pk.sid;
            for (const [sid, p] of players) {
                if (p.id === id || sid === id) { players.delete(sid); if (p === me) me = null; break; }
            }
        });
        MooMoo.on("playersUpdate", (pk) => {
            for (const pos of pk.positions) {
                const p = players.get(pos.sid);
                if (!p) continue;                   // the stock ignores players it hasn't added
                p.forcePos = !p.visible;
                p.x1 = p.x; p.y1 = p.y;
                p.settle = p.x2 == pos.x && p.y2 == pos.y;   // eslint-disable-line eqeqeq
                p.x2 = pos.x; p.y2 = pos.y;
                p.d2 = pos.dir;
                p.d1 = p.forcePos || p.dir === undefined ? p.d2 : p.dir;
                p.dt = 0;
                p.visible = true;
            }
            for (const sid of pk.hidden) { const p = players.get(sid); if (p) p.visible = false; }
        });
        MooMoo.on("animalsUpdate", (pk) => {
            const a = pk && pk.args;
            const list = a && a[0], gone = a && a[1];
            const now = Date.now();
            for (let o = 0; list && o < list.length; o += 8) {
                let p = animals.get(list[o]);
                if (p && p.index != list[o + 1]) { animals.delete(list[o]); p = null; }   // eslint-disable-line eqeqeq
                if (p) {
                    p.forcePos = !p.visible;
                    p.x1 = p.x; p.y1 = p.y;
                    p.settle = p.x2 == list[o + 2] && p.y2 == list[o + 3];   // eslint-disable-line eqeqeq
                    p.x2 = list[o + 2]; p.y2 = list[o + 3];
                    p.d2 = list[o + 4] / 100;
                    p.d1 = p.forcePos || p.dir === undefined ? p.d2 : p.dir;
                    p.health = list[o + 5];
                    if ((list[o + 7] || 0) != p.state) p.stateAt = now;   // eslint-disable-line eqeqeq
                    p.state = list[o + 7] || 0;
                    p.dt = 0;
                    p.visible = true;
                } else {
                    p = { sid: list[o], index: list[o + 1], x: list[o + 2], y: list[o + 3], dir: list[o + 4] / 100 };
                    p.x2 = p.x; p.y2 = p.y; p.d2 = p.dir;
                    p.health = list[o + 5];
                    p.state = list[o + 7] || 0; p.stateAt = now;
                    p.forcePos = true; p.visible = true; p.dt = 0;
                    animals.set(p.sid, p);
                }
            }
            for (let o = 0; gone && o < gone.length; ++o) { const p = animals.get(gone[o]); if (p) p.visible = false; }
        });

        // ---- the per-frame step (the top of the stock render function) ----
        let lastNow = Date.now();
        let lockCache = false, lockReadAt = 0;
        function cameraLock() {
            const now = Date.now();
            if (now - lockReadAt > 500) {
                lockReadAt = now;
                try { lockCache = win.localStorage && win.localStorage.getItem("camera_lock") === "true"; } catch (_) { lockCache = false; }
            }
            return lockCache;
        }
        function interpolate(p, delta) {
            if (!p.visible) return;
            if (p.forcePos) { p.x = p.x2; p.y = p.y2; p.dir = p.d2; return; }
            p.dt += delta;
            const r = Math.min(p.settle ? 1 : 1.7, p.dt / 170);
            p.x = p.x1 + (p.x2 - p.x1) * r;
            p.y = p.y1 + (p.y2 - p.y1) * r;
            p.dir = lerpAngle(p.d2, p.d1, Math.min(1, p.dt / TICK_MS));
        }
        const view = { left: 0, top: 0, width: MAX_W, height: MAX_H, scale: 1, dpr: 1, camX: camera.x, camY: camera.y, delta: 16, now: lastNow, inGame: false };
        function step() {
            const now = Date.now();
            const delta = now - lastNow;
            lastNow = now;
            // camera follow (uses your position from the previous frame, like the stock).
            // A freecam override takes the place of `me` with the exact same eased follow,
            // so the overlay camera and the stock camera (which the mod drives in lock-step)
            // track the same spot and the overlays stay aligned.
            const follow = camOverride || me;
            if (follow) {
                const dist = Math.hypot(follow.x - camera.x, follow.y - camera.y);
                const dir = Math.atan2(follow.y - camera.y, follow.x - camera.x);
                const move = Math.min(dist * 0.01 * delta, dist);
                if (dist > 0.05) { camera.x += move * Math.cos(dir); camera.y += move * Math.sin(dir); }
                else { camera.x = follow.x; camera.y = follow.y; }
            } else { camera.x = MAP / 2; camera.y = MAP / 2; }
            for (const p of players.values()) interpolate(p, delta);
            for (const p of animals.values()) interpolate(p, delta);
            // The stock "camera lock" setting pins the camera to you — but not while a
            // freecam override is active (the whole point is to leave your body behind).
            if (!camOverride && cameraLock() && me && MooMoo.self && MooMoo.self.alive) { camera.x = me.x; camera.y = me.y; }
            // the stock view size for this window
            const w = win.innerWidth || MAX_W, h = win.innerHeight || MAX_H;
            const scale = Math.max(w / MAX_W, h / (MAX_H * 1.15), Math.sqrt(w * h / (MAX_W * MAX_H)));
            view.scale = scale;
            view.width = w / scale; view.height = h / scale;
            view.camX = camera.x; view.camY = camera.y;
            view.left = camera.x - view.width / 2;
            view.top = camera.y - view.height / 2;
            view.dpr = win.devicePixelRatio || 1;
            view.delta = delta; view.now = now;
            view.inGame = !!me;
        }

        // ---- the overlay canvases ----
        const layers = [];                // {id, z, draw, failed}
        const frameHooks = new Set();
        let replacer = null;
        let layerCanvas = null, layerG = null, frameCanvas = null, frameG = null;
        let stockHidden = false;
        function mount() {
            if (layerCanvas) return true;
            if (!doc || !doc.body) return false;
            const game = doc.getElementById("gameCanvas");
            if (!game || !game.parentNode) return false;
            const after = doc.getElementById("textCanvas") || game;
            const make = () => {
                const c = doc.createElement("canvas");
                c.style.position = "absolute";
                c.style.left = "0px";
                c.style.top = "0px";
                c.style.pointerEvents = "none";
                c.style.display = "none";
                return c;
            };
            frameCanvas = make();
            layerCanvas = make();
            after.parentNode.insertBefore(frameCanvas, after.nextSibling);
            frameCanvas.parentNode.insertBefore(layerCanvas, frameCanvas.nextSibling);
            frameG = frameCanvas.getContext("2d");
            layerG = layerCanvas.getContext("2d");
            return true;
        }
        function setStockHidden(hide) {
            if (!doc || stockHidden === hide) return;
            stockHidden = hide;
            for (const id of ["gameCanvas", "textCanvas"]) {
                const c = doc.getElementById(id);
                if (c) c.style.visibility = hide ? "hidden" : "";
            }
        }
        function clearFrameCanvas() {
            if (!frameG) return;
            frameG.setTransform(1, 0, 0, 1, 0, 0);
            frameG.clearRect(0, 0, frameCanvas.width, frameCanvas.height);
        }

        let raf = null, dead = false;
        function frame() {
            if (dead) return;
            raf = win.requestAnimationFrame(frame);
            step();
            for (const fn of Array.from(frameHooks)) { try { fn(view); } catch (e) { report(e); } }
            if (!mount()) return;

            // a mod is drawing the whole frame (returning false from draw = not this
            // frame: the stock picture shows instead)
            if (replacer && view.inGame) {
                layerCanvas.style.display = "none";
                let drew;
                try {
                    drew = replacer.draw({ canvas: frameCanvas, g: frameG, view, delta: view.delta, now: view.now });
                    if (drew === false) {
                        frameCanvas.style.display = "none";
                        setStockHidden(false);
                    } else {
                        frameCanvas.style.display = "block";
                        setStockHidden(true);
                    }
                } catch (e) {
                    // never leave a half-drawn frame over the game: show the stock picture
                    clearFrameCanvas();
                    frameCanvas.style.display = "none";
                    setStockHidden(false);
                    if (!replacer.errLogged) { replacer.errLogged = true; report(e); }
                }
                return;
            }
            frameCanvas.style.display = "none";
            setStockHidden(false);

            // additive layers on the stock picture
            if (!layers.length || !view.inGame) { layerCanvas.style.display = "none"; return; }
            const W = Math.max(1, Math.round((win.innerWidth || MAX_W) * view.dpr));
            const H = Math.max(1, Math.round((win.innerHeight || MAX_H) * view.dpr));
            if (layerCanvas.width !== W || layerCanvas.height !== H) {
                layerCanvas.width = W; layerCanvas.height = H;
                layerCanvas.style.width = (win.innerWidth || MAX_W) + "px";
                layerCanvas.style.height = (win.innerHeight || MAX_H) + "px";
            }
            layerCanvas.style.display = "block";
            layerG.setTransform(1, 0, 0, 1, 0, 0);
            layerG.clearRect(0, 0, W, H);
            const s = view.scale * view.dpr;
            for (const L of layers) {
                layerG.save();
                layerG.setTransform(s, 0, 0, s, 0, 0);
                try { L.draw(layerG, view); }
                catch (e) { if (!L.failed) { L.failed = true; report(e); } }
                layerG.restore();
            }
        }
        if (doc && typeof win.requestAnimationFrame === "function") raf = win.requestAnimationFrame(frame);

        function addLayer(id, draw, opts) {
            const L = { id: String(id), z: (opts && opts.z) || 0, draw, failed: false };
            layers.push(L);
            layers.sort((a, b) => a.z - b.z);
            return () => { const i = layers.indexOf(L); if (i >= 0) layers.splice(i, 1); };
        }
        function setReplacer(spec) {
            const R = { draw: spec.draw, errLogged: false };
            replacer = R;
            return () => {
                if (replacer !== R) return;
                replacer = null;
                clearFrameCanvas();
                if (frameCanvas) frameCanvas.style.display = "none";
                setStockHidden(false);
            };
        }

        return {
            view, camera, players, animals, lerpAngle,
            player: (sid) => players.get(sid),
            animal: (sid) => animals.get(sid),
            get me() { return me; },
            addLayer, setReplacer,
            // Point the overlay camera at {x, y} (freecam), or null to follow your player again.
            setCameraOverride: (pt) => { camOverride = (pt && typeof pt.x === "number" && typeof pt.y === "number") ? { x: pt.x, y: pt.y } : null; return camOverride; },
            get cameraOverride() { return camOverride; },
            onFrame: (fn) => { frameHooks.add(fn); return () => frameHooks.delete(fn); },
            worldToScreen: (x, y) => ({ x: (x - view.left) * view.scale, y: (y - view.top) * view.scale }),
            get replacing() { return !!replacer; },
            get layerCanvas() { return layerCanvas; },
            get frameCanvas() { return frameCanvas; },
            // headless tests drive the frame step by hand
            _step: step,
            uninstall() {
                dead = true;
                if (raf != null && win.cancelAnimationFrame) win.cancelAnimationFrame(raf);
                setStockHidden(false);
                try { layerCanvas && layerCanvas.remove(); frameCanvas && frameCanvas.remove(); } catch (_) { /* ignore */ }
            }
        };
    }

    return { createRender, lerpAngle };
});
