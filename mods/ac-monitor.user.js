// ==UserScript==
// @name         MooMoo Debug (dev)
// @namespace    moomoo.js
// @version      1.2.0
// @description  Dev debug panel (top-left, leaderboard look): net + player stats, the server's anti-cheat probes, what you'd be flagged for, the detection packets the loader cancels, and real kicks / shame.
// @author       you
// @match        *://*/*
// @require      https://pastebin.com/raw/jWDq3mmF?v=1.3.3
// @grant        none
// @run-at       document-start
// ==/UserScript==
//
// Read-only: it never sends or changes a packet, so it can't affect detection.

(function () {
    "use strict";

    function boot(MooMoo) {
        MooMoo.register({
            id: "debug-panel",
            name: "Debug panel (dev)",
            version: "1.2.0",
            description: "Net/player stats + anti-cheat probes, flags and penalties.",
            menu: false,
            defaultEnabled: true
        }, function (ctx) {
            const win = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
            const doc = win.document;
            if (!doc) return;
            const self = () => MooMoo.self;
            const net = () => (win.MooMooLoader && win.MooMooLoader.net) || null;
            // The loader's detection-packet canceller (loader 1.3.3+).
            const antiDetect = () => (win.MooMooLoader && win.MooMooLoader.antiDetect) || null;

            // ---- FNV salted hash — identical to the server/loader, so probe checks match ----
            const FNV_OFFSET = 2166136261, FNV_PRIME = 16777619, FNV_FINAL_MULT = 739982445;
            const fnvStep = (h, b) => Math.imul(h ^ b, FNV_PRIME);
            function fnvFinish(h) { h ^= h >>> 15; h = Math.imul(h, FNV_FINAL_MULT); h ^= h >>> 12; return h >>> 0; }
            function saltedHash(text, salt) { let h = (FNV_OFFSET ^ salt) >>> 0; for (let i = 0; i < text.length; i++) h = fnvStep(h, text.charCodeAt(i) & 255); return fnvFinish(h); }

            const PROBE_NAME = {
                "WebSocket.prototype.send": "SOCKET_SEND", "EventTarget.prototype.addEventListener": "LISTENER",
                "EventTarget.prototype.dispatchEvent": "DISPATCH", "requestAnimationFrame": "RAF",
                "CanvasRenderingContext2D.prototype.drawImage": "CANVAS", "CanvasRenderingContext2D.prototype.fillText": "CANVAS",
                "WebGLRenderingContext.prototype.drawElements": "WEBGL", "Function.prototype.toString": "TOSTRING",
                "Object.defineProperty": "DEFINEPROP", "JSON.parse": "JSON", "Math.random": "RANDOM",
                "performance.now": "PERF", "Date.now": "DATE",
                "WebSocket": "SOCKET_WRAP", "MouseEvent": "MOUSE_WRAP", "KeyboardEvent": "KEY_WRAP",
                "XMLHttpRequest": "XHR_WRAP", "Worker": "WORKER_WRAP"
            };

            function resolve(path) { try { return path.split(".").reduce((o, k) => (o == null ? o : o[k]), win); } catch (e) { return undefined; } }
            function isNative(fn) { try { return typeof fn === "function" && /\{\s*\[native code\]\s*\}/.test(Function.prototype.toString.call(fn)); } catch (e) { return false; } }
            function firstHashMatch(list, salt, hash, fmt) { for (const it of list) { const s = fmt(it); if (s != null && saltedHash(s, salt) === hash) return s; } return null; }
            function evalProbe(kind, path, hash, salt) {
                try {
                    if (kind === 7) { const fn = resolve(path); return { m: (typeof fn === "function") && !isNative(fn), n: PROBE_NAME[path] || path }; }
                    if (kind === 5) { const o = resolve(path); return { m: !!(o && o.prototype && o.prototype.constructor !== o), n: PROBE_NAME[path] || path }; }
                    if (kind === 1) { const o = resolve(path || "window") || win; const hit = firstHashMatch(Object.getOwnPropertyNames(o), salt, hash, (n) => n); return { m: !!hit, n: hit || "winprop" }; }
                    if (kind === 2) { const o = resolve(path || "window") || win; const hit = firstHashMatch(Object.getOwnPropertyNames(o), salt, hash, (n) => { try { const v = o[n], t = typeof v; return (t === "number" || t === "string" || t === "boolean") ? n + "=" + v : null; } catch (e) { return null; } }); return { m: !!hit, n: hit || "propval" }; }
                    if (kind === 3) { let k = []; try { k = Object.keys(win.localStorage); } catch (e) {} const hit = firstHashMatch(k, salt, hash, (x) => x); return { m: !!hit, n: hit || "lskey" }; }
                    if (kind === 4) { let e = []; try { e = Array.prototype.slice.call(doc.querySelectorAll("[id]")); } catch (x) {} const hit = firstHashMatch(e, salt, hash, (el) => el.tagName.toLowerCase() + "#" + el.id); return { m: !!hit, n: hit || "element" }; }
                    if (kind === 6) { const o = resolve(path || "window") || win; let s = []; try { s = Object.getOwnPropertySymbols(o); } catch (e) {} const hit = firstHashMatch(s, salt, hash, (x) => x.description || ""); return { m: !!hit, n: hit || "symbol" }; }
                } catch (e) {}
                return { m: false, n: "k" + kind };
            }
            function userscriptGlobals() { for (const k of ["unsafeWindow", "GM_info", "GM", "GM_getValue", "GM_xmlhttpRequest"]) { try { if (k in win) return k; } catch (e) {} } return null; }
            function renderHooked() {
                const C = win.CanvasRenderingContext2D && win.CanvasRenderingContext2D.prototype, G = win.WebGLRenderingContext && win.WebGLRenderingContext.prototype;
                for (const fn of [C && C.drawImage, C && C.fillText, win.HTMLCanvasElement && win.HTMLCanvasElement.prototype.getContext, win.requestAnimationFrame, G && G.drawElements]) if (fn && !isNative(fn)) return true;
                return false;
            }
            const socketHooked = () => { const s = win.WebSocket && win.WebSocket.prototype && win.WebSocket.prototype.send; return !isNative(s); };
            // The loader cancels the client's "T" and sends an empty one while antiDetect is on,
            // so nothing a probe matched is ever reported. Off -> the real "T" would be sent.
            const spoofing = () => { const a = antiDetect(); return !!(a && a.enabled); };

            // =================================================================
            // UI — leaderboard look: big title, grey label / white value rows.
            // =================================================================
            const CSS = `
            #mdbg{position:fixed;top:12px;left:12px;z-index:100000;width:216px;max-height:88vh;overflow-y:auto;
              padding:6px 12px 9px;border-radius:5px;background:rgba(0,0,0,.4);color:#fff;
              font-family:"Hammersmith One",sans-serif;-webkit-user-select:none;user-select:none;pointer-events:auto}
            #mdbg::-webkit-scrollbar{width:0}
            #mdbg .ttl{font-size:28px;line-height:1.15;cursor:pointer}
            #mdbg.min .bd{display:none}
            #mdbg .bd{margin-top:2px}
            #mdbg .r{display:flex;align-items:baseline;font-size:17px;line-height:1.42}
            #mdbg .r .k{flex:0 0 auto;color:#c0c0c0}
            #mdbg .r .v{flex:1 1 auto;text-align:right;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-left:8px}
            #mdbg .r .v.y{color:#ffe24d}#mdbg .r .v.r{color:#ec6a55}#mdbg .r .v.d{color:#8f8f8f}
            #mdbg .div{height:1px;background:#ffffff26;margin:5px 0}
            #mdbg .log{margin-top:5px}
            #mdbg .log .e{font-size:13.5px;line-height:1.5;color:#c9c9c9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            #mdbg .log .e .t{color:#7d7d7d;margin-right:5px}
            #mdbg .log .e.y{color:#ffe24d}#mdbg .log .e.r{color:#ec6a55}
            `;
            const el = (t, c, x) => { const n = doc.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; };

            let panel, body, logEl, V = {};
            function stat(label) { const r = el("div", "r"); r.appendChild(el("span", "k", label)); const v = el("span", "v", "–"); r.appendChild(v); body.appendChild(r); return v; }
            function div() { body.appendChild(el("div", "div")); }
            function set(v, text, cls) { v.textContent = text; v.className = "v" + (cls ? " " + cls : ""); }

            function build() {
                const style = el("style"); style.textContent = CSS; doc.head.appendChild(style);
                panel = el("div"); panel.id = "mdbg";
                const ttl = el("div", "ttl", "Debug");
                ttl.addEventListener("click", () => panel.classList.toggle("min"));
                panel.appendChild(ttl);
                body = el("div", "bd"); panel.appendChild(body);

                V.ping = stat("ping"); V.fps = stat("fps"); V.players = stat("players");
                V.pos = stat("pos"); V.hp = stat("hp"); V.out = stat("out/s"); V.drop = stat("drops");
                div();
                V.probes = stat("probes"); V.flags = stat("flags"); V.report = stat("reported");
                V.cancel = stat("cancelled");
                V.socket = stat("socket"); V.render = stat("render"); V.script = stat("script");
                V.shame = stat("shame"); V.kick = stat("kick");
                div();
                logEl = el("div", "log"); body.appendChild(logEl);

                (doc.body || doc.documentElement).appendChild(panel);
                ctx.onCleanup(() => { style.remove(); panel.remove(); });
            }

            const pad = (n) => (n < 10 ? "0" + n : "" + n);
            const stamp = () => { const d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()); };
            function log(msg, cls) {
                if (!logEl) return;
                const e = el("div", "e" + (cls ? " " + cls : ""));
                e.appendChild(el("span", "t", stamp()));
                e.appendChild(doc.createTextNode(msg));
                logEl.insertBefore(e, logEl.firstChild);
                while (logEl.childElementCount > 7) logEl.removeChild(logEl.lastChild);
            }

            // ---- live stats ----
            let frames = 0, lastFps = performance.now(), running = true, rafId = 0;
            function raf() { frames++; if (running) rafId = win.requestAnimationFrame(raf); }
            function updateNet() {
                const n = net(), me = self();
                if (n) {
                    const p = n.avgPing ? n.avgPing() : (n.ping || 0);
                    set(V.ping, p ? Math.round(p) + "ms" : "–", p ? "" : "d");
                    set(V.out, "" + (n.perSecond ? n.perSecond() : 0));
                    const dr = n.stats && n.stats.refused || 0;
                    set(V.drop, "" + dr, dr ? "y" : "");
                } else { set(V.ping, "–", "d"); set(V.out, "–", "d"); set(V.drop, "–", "d"); }
                const now = performance.now(), dt = (now - lastFps) / 1000;
                if (dt > 0) { set(V.fps, "" + Math.round(frames / dt)); frames = 0; lastFps = now; }
                set(V.players, "" + (ctx.players ? ctx.players.size : 0));
                if (me && me.alive) { set(V.pos, Math.round(me.x) + " " + Math.round(me.y)); set(V.hp, "" + (me.health == null ? "–" : Math.round(me.health)), me.health < 40 ? "r" : ""); }
                else { set(V.pos, "–", "d"); set(V.hp, "dead", "d"); }
            }
            function updateChecks() {
                const s = socketHooked(); set(V.socket, s ? "HOOK" : "native", s ? "r" : "");
                const r = renderHooked(); set(V.render, r ? "HOOK" : "native", r ? "r" : "");
                const u = userscriptGlobals(); set(V.script, u ? u : "clean", u ? "r" : "");
                const a = antiDetect();
                if (a) set(V.cancel, a.count + (a.caughtCount ? " (" + a.caughtCount + " caught)" : ""), a.caughtCount ? "y" : "");
                else set(V.cancel, "off", "d");
            }

            let rounds = 0;
            function onProbes(pk) {
                rounds++;
                const salt = pk.salt >>> 0, probes = pk.probes || [];
                const names = [];
                for (const pr of probes) { const r = evalProbe(pr[0], pr[1] || "", pr[2] >>> 0, salt); if (r.m) names.push(r.n); }
                if (socketHooked()) names.push("SOCKET_HOOK");
                const u = userscriptGlobals(); if (u) names.push("USERSCRIPT");
                if (renderHooked()) names.push("RENDER");
                set(V.probes, "" + probes.length);
                if (names.length) {
                    set(V.flags, names.length > 1 ? names[0] + " +" + (names.length - 1) : names[0], "y");
                    const sent = !spoofing();
                    set(V.report, sent ? "YES" : "no", sent ? "r" : "");
                    log((sent ? "SENT " : "flag ") + names.join(" "), sent ? "r" : "y");
                } else {
                    set(V.flags, "none", "d");
                    set(V.report, "no");
                    log("probe #" + rounds + " clean", "");
                }
            }

            let lastHat = 0, shamed = false;
            function tick() {
                updateNet(); updateChecks();
                const me = self(), hat = me && me.hat;
                if (hat === 45 && lastHat !== 45 && !shamed) { shamed = true; set(V.shame, "SHAMED", "r"); log("SHAMED (hat 45)", "r"); }
                else if (hat !== 45 && shamed && hat != null) { shamed = false; set(V.shame, "no"); log("shame off", "y"); }
                if (hat != null) lastHat = hat;
            }
            function onDisconnect(p) {
                const reason = p && p.reason, kicked = reason === "kicked";
                set(V.kick, kicked ? "KICKED" : (reason == null ? "bye" : String(reason)), "r");
                log(kicked ? "KICKED (anti-cheat)" : ("disconnect: " + reason), "r");
            }

            function start() {
                build();
                set(V.shame, "no"); set(V.kick, "no"); set(V.report, "no"); set(V.probes, "–", "d"); set(V.flags, "–", "d");
                updateNet(); updateChecks();
                rafId = win.requestAnimationFrame(raf);
                ctx.on("probes", onProbes);
                ctx.on("disconnect", onDisconnect);
                ctx.every(500, tick);
                ctx.onCleanup(() => { running = false; try { win.cancelAnimationFrame(rafId); } catch (e) {} });
                // Ground truth from the loader: every client "T" it cancelled, and what that
                // packet actually carried (vs. our own local probe guess above).
                const a = antiDetect();
                if (a && a.onDetection) {
                    ctx.onCleanup(a.onDetection((e) => {
                        if (!e.caught) return;   // only the ones that really carried a detection
                        const what = e.flagNames.length ? e.flagNames.join(" ") : ("probe " + e.probeResult + (e.untrusted ? " +untrusted" : ""));
                        log("cancelled T: " + what + (e.neutralised ? " → empty" : " → SENT"), e.neutralised ? "y" : "r");
                    }));
                    log("antiDetect " + (a.enabled ? "on" : "OFF"), a.enabled ? "" : "r");
                }
                log("debug ready", "");
            }
            if (doc.body) start();
            else win.addEventListener("DOMContentLoaded", start, { once: true });

            ctx.log("Debug panel (dev) ready — top-left");
        });
    }

    const w = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
    if (w.MooMoo) { boot(w.MooMoo); return; }
    let tries = 0;
    const iv = setInterval(() => { if (w.MooMoo) { clearInterval(iv); boot(w.MooMoo); } else if (++tries > 200) clearInterval(iv); }, 50);
    if (w.addEventListener) w.addEventListener("moomoo:ready", () => { if (w.MooMoo) { clearInterval(iv); boot(w.MooMoo); } });
})();
