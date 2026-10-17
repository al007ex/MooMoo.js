// ==UserScript==
// @name         MooMoo Debug (dev)
// @namespace    moomoo.js
// @version      1.3.1
// @description  Compact live "behind the scenes" panel (top-left): transport (frames encrypted/decrypted), crypto (sequence + ledger + seal), the server's anti-cheat integrity probes decoded live, what the client reports vs what the loader actually sends, and real kicks / shame.
// @author       you
// @match        *://*/*
// @require      https://pastebin.com/raw/jWDq3mmF?v=1.3.4
// @grant        none
// @run-at       document-start
// ==/UserScript==
//
// Read-only: it never sends or changes a packet, so it can't affect detection. Everything it
// shows is ground truth from the loader (onRaw frames, transport(), antiDetect, the probe
// rounds), not a guess of its own.

(function () {
    "use strict";

    function boot(MooMoo, MooMooLoader) {
        MooMoo.register({
            id: "debug-panel",
            name: "Debug panel (dev)",
            version: "1.3.1",
            description: "Compact live transport / crypto / anti-cheat panel.",
            menu: false,
            defaultEnabled: true
        }, function (ctx) {
            const win = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
            const doc = win.document;
            if (!doc) return;
            const self = () => MooMoo.self;
            const antiDetect = () => (MooMooLoader && MooMooLoader.antiDetect) || null;
            const transport = () => { try { return MooMooLoader.transport ? MooMooLoader.transport() : null; } catch (e) { return null; } };

            const isNative = (fn) => { try { return typeof fn === "function" && /\{\s*\[native code\]\s*\}/.test(Function.prototype.toString.call(fn)); } catch (e) { return false; } };
            const bitCount = (n) => { n = (n || 0) >>> 0; let c = 0; while (n) { c += n & 1; n >>>= 1; } return c; };
            const hex = (n, w) => "0x" + ((n || 0) >>> 0).toString(16).padStart(w || 0, "0");
            function userscriptGlobals() { for (const k of ["unsafeWindow", "GM_info", "GM", "GM_getValue", "GM_xmlhttpRequest"]) { try { if (k in win) return k; } catch (e) {} } return null; }
            function renderHooked() {
                const C = win.CanvasRenderingContext2D && win.CanvasRenderingContext2D.prototype, G = win.WebGLRenderingContext && win.WebGLRenderingContext.prototype;
                for (const fn of [C && C.drawImage, C && C.fillText, win.HTMLCanvasElement && win.HTMLCanvasElement.prototype.getContext, win.requestAnimationFrame, G && G.drawElements]) if (fn && !isNative(fn)) return true;
                return false;
            }
            const socketHooked = () => !isNative(win.WebSocket && win.WebSocket.prototype && win.WebSocket.prototype.send);

            const KIND = { 1: "win", 2: "val", 3: "ls", 4: "el", 5: "ctor", 6: "sym", 7: "fn" };
            const SEALMODE = { 0: "off", 1: "report", 2: "bind" };
            const shortPath = (p) => !p ? null : String(p).replace(/\.prototype\./g, ".").replace(/^WebSocket/, "WS").replace(/^CanvasRenderingContext2D/, "Canvas").replace(/^WebGLRenderingContext/, "WebGL").replace(/^EventTarget/, "ET").replace(/^requestAnimationFrame/, "rAF");

            // =================================================================
            // UI — a compact, live, dark panel (leaderboard look).
            // =================================================================
            const CSS = `
            .mdbg{position:fixed;top:12px;left:12px;z-index:100000;width:204px;max-height:84vh;overflow-y:auto;
              padding:6px 11px 8px;border-radius:6px;background:rgba(6,8,12,.52);color:#fff;backdrop-filter:blur(2px);
              font-family:"Hammersmith One",sans-serif;-webkit-user-select:none;user-select:none;pointer-events:auto}
            .mdbg::-webkit-scrollbar{width:0}
            .mdbg .ttl{font-size:22px;line-height:1.1;cursor:pointer;display:flex;align-items:baseline;justify-content:space-between}
            .mdbg .ttl .dot{font-size:11px;color:#8ecc51}
            .mdbg.min .bd{display:none}
            .mdbg .bd{margin-top:3px}
            .mdbg .sec{font-size:10px;color:#8a909c;letter-spacing:.07em;margin:6px 0 1px;text-transform:uppercase}
            .mdbg .r{display:flex;align-items:baseline;font-size:15px;line-height:1.36}
            .mdbg .r .k{flex:0 0 auto;color:#bdc2cc}
            .mdbg .r .v{flex:1 1 auto;text-align:right;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding-left:8px}
            .mdbg .r .v.g{color:#8ecc51}.mdbg .r .v.y{color:#ffe24d}.mdbg .r .v.r{color:#ec6a55}.mdbg .r .v.d{color:#7f858f}.mdbg .r .v.c{color:#6fd3e6}
            .mdbg .div{height:1px;background:#ffffff1f;margin:5px 0}
            .mdbg .log{margin-top:4px}
            .mdbg .log .e{font-size:12px;line-height:1.45;color:#c3c7cf;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            .mdbg .log .e .t{color:#6f747d;margin-right:5px}
            .mdbg .log .e.g{color:#8ecc51}.mdbg .log .e.y{color:#ffe24d}.mdbg .log .e.r{color:#ec6a55}.mdbg .log .e.c{color:#6fd3e6}
            `;
            const el = (t, c, x) => { const n = doc.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; };

            let panel, body, logEl, dot, V = {};
            function stat(label) { const r = el("div", "r"); r.appendChild(el("span", "k", label)); const v = el("span", "v", "–"); r.appendChild(v); body.appendChild(r); return v; }
            function head(label) { body.appendChild(el("div", "sec", label)); }
            function set(v, text, cls) { if (!v) return; v.textContent = text; v.className = "v" + (cls ? " " + cls : ""); }

            function build() {
                const style = el("style"); style.textContent = CSS; doc.head.appendChild(style);
                panel = el("div", "mdbg");
                const ttl = el("div", "ttl"); ttl.appendChild(el("span", null, "Debug")); dot = el("span", "dot", "live"); ttl.appendChild(dot);
                ttl.addEventListener("click", () => panel.classList.toggle("min"));
                panel.appendChild(ttl);
                body = el("div", "bd"); panel.appendChild(body);

                head("transport");
                V.enc = stat("enc/s"); V.dec = stat("dec/s");
                head("crypto");
                V.seq = stat("seq"); V.ledger = stat("ledger"); V.seal = stat("seal"); V.mode = stat("mode");
                head("probes");
                V.probes = stat("count"); V.kinds = stat("kinds"); V.salt = stat("salt");
                head("anti-cheat");
                V.flags = stat("client"); V.sent = stat("sent"); V.hidden = stat("hidden");
                head("status");
                V.hooks = stat("hooks"); V.penalty = stat("penalty");
                body.appendChild(el("div", "div"));
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
                while (logEl.childElementCount > 5) logEl.removeChild(logEl.lastChild);
            }

            // ---- live data sources (all ground truth from the loader) ----
            let encWin = 0, decWin = 0;   // frames encrypted (out) / decrypted (in) this window
            function onRaw(dir) { if (dir === "out") encWin++; else decWin++; }

            function updateTransport(dt) {
                set(V.enc, Math.round(encWin / dt) + "/s"); set(V.dec, Math.round(decWin / dt) + "/s"); encWin = decWin = 0;
            }
            function updateCrypto() {
                const t = transport();
                if (!t) { set(V.seq, "–", "d"); set(V.ledger, "–", "d"); set(V.seal, "–", "d"); set(V.mode, "–", "d"); return; }
                set(V.seq, "" + t.seq, "c");
                set(V.ledger, t.pinned ? hex(t.ledger, 8) : "off", t.pinned ? "c" : "d");
                set(V.seal, t.seal != null ? hex(t.seal) : "none", t.seal != null ? "c" : "d");
                set(V.mode, (SEALMODE[t.sealMode] || t.sealMode) + (t.pinned ? " +ledger" : ""), "");
            }
            function updateAC() {
                const a = antiDetect(), last = a && a.last;
                if (!last) { set(V.flags, "–", "d"); set(V.sent, "–", "d"); set(V.hidden, "–", "d"); return; }
                const cf = last.flagNames.length ? last.flagNames.join(" ") : (last.probeResult ? "probe×" + bitCount(last.probeResult) : "none");
                set(V.flags, cf, last.flagNames.length ? "y" : "d");
                const canary = bitCount(last.sentProbeResult);
                set(V.sent, canary ? canary + " canary" : "clean", "g");
                const hid = bitCount(last.strippedProbe) + (last.flags ? 1 : 0) + (last.untrusted ? 1 : 0);
                set(V.hidden, hid ? "" + hid + " ✓" : "0", hid ? "g" : "d");
            }
            let shamed = false, kicked = false;
            function setPenalty() { set(V.penalty, kicked ? "KICKED" : shamed ? "SHAMED" : "none", (kicked || shamed) ? "r" : "g"); }
            function updateStatus() {
                const h = [];
                if (socketHooked()) h.push("socket");
                if (renderHooked()) h.push("render");
                const u = userscriptGlobals(); if (u) h.push(u);
                set(V.hooks, h.length ? h.join(" ") : "clean", h.length ? "r" : "g");
            }

            function onProbes(pk) {
                const probes = pk.probes || [], counts = {};
                for (const p of probes) { const k = KIND[p[0]] || ("k" + p[0]); counts[k] = (counts[k] || 0) + 1; }
                set(V.probes, "" + probes.length);
                set(V.kinds, Object.keys(counts).map((k) => k + "×" + counts[k]).join(" ") || "–", "");
                set(V.salt, hex(pk.salt, 8), "c");
                const targets = probes.filter((p) => p[0] === 7 || p[0] === 5).map((p) => shortPath(p[1])).filter(Boolean);
                log("q ×" + probes.length + " · " + (targets.slice(0, 2).join(" ") || "env scan"), "c");
            }

            function tick() {
                updateTransport(0.5); updateCrypto(); updateAC(); updateStatus();
                if (dot) dot.style.color = socketHooked() || renderHooked() || userscriptGlobals() ? "#ec6a55" : "#8ecc51";
                const me = self(), hat = me && me.hat;
                if (hat === 45 && !shamed) { shamed = true; setPenalty(); log("SHAMED (hat 45)", "r"); }
                else if (hat !== 45 && shamed && hat != null) { shamed = false; setPenalty(); log("shame off", "y"); }
            }
            function onDisconnect(p) {
                const reason = p && p.reason, k = reason === "kicked";
                if (k) { kicked = true; setPenalty(); }
                log(k ? "KICKED (anti-cheat)" : ("disconnect: " + reason), "r");
            }

            function start() {
                build();
                setPenalty();
                const unRaw = MooMooLoader.onRaw ? MooMooLoader.onRaw(onRaw) : null;
                ctx.on("probes", onProbes);
                ctx.on("disconnect", onDisconnect);
                ctx.every(500, tick);
                ctx.onCleanup(() => { if (unRaw) try { unRaw(); } catch (e) {} });
                // Per "T": what the client reported, what was stripped, and the clean answer sent.
                const a = antiDetect();
                if (a && a.onDetection) {
                    ctx.onCleanup(a.onDetection((e) => {
                        const hid = e.flagNames.slice();
                        if (e.strippedProbe) hid.push("probe×" + bitCount(e.strippedProbe));
                        if (e.untrusted) hid.push("untrusted×" + e.untrusted);
                        const sent = bitCount(e.sentProbeResult);
                        log("T → " + (sent ? sent + " canary" : "clean") + (hid.length ? " · hid " + hid.join(",") : ""), hid.length ? "y" : "g");
                    }));
                    log("antiDetect " + (a.enabled ? "on (blanking)" : "on (canary-safe)"), "g");
                }
                updateStatus(); updateCrypto();
                log("debug ready", "");
            }
            if (doc.body) start();
            else win.addEventListener("DOMContentLoaded", start, { once: true });

            ctx.log("Debug panel (dev) ready — top-left");
        });
    }

    // Fetch the loader's API through its event handshake — there is no window.MooMoo.
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
