/*
 * moomoo.js loader — NOTICES + COMPATIBILITY WATCHDOG
 * ===================================================
 * Two jobs, both in the page:
 *
 *   1. Watch the live connection against the contract this loader was built for
 *      (binding.contract) — the io-init shape, the "T" telemetry field count the
 *      real client reports, and whether server packets decode. From that it forms a
 *      verdict: ok / warn / refuse.
 *
 *   2. Put a small MooMoo-style card on screen:
 *        ok      -> a one-time "you're running it, here's how to reach me" note
 *        warn    -> something looks off; copy the report, or join anyway
 *        refuse  -> the loader can't keep up and would get you flagged, so the
 *                   connection is dropped and there is no "join anyway"
 *
 * The cards are drawn with their own inline styles so they look the same whatever
 * skin the server ships. Part of the LOADER (the volatile half).
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooNotice = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooNotice = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const LINKS = {
        github: "https://github.com/al007ex",
        repo: "https://github.com/al007ex/MooMoo.js",
        discord: "https://discord.gg/NMS3YR9Q5R",
        author: "Nuro"
    };

    const STYLE_ID = "mmj-notice-style";
    const CSS = `
    .mmj-nt-back{ position:fixed; inset:0; z-index:2147483600; display:flex; align-items:center; justify-content:center;
        background:rgba(0,0,0,.45); animation:mmj-nt-fade .14s ease-out; padding:20px; box-sizing:border-box; }
    @keyframes mmj-nt-fade{ from{ opacity:0 } to{ opacity:1 } }
    @keyframes mmj-nt-pop{ from{ transform:translateY(8px) scale(.98); opacity:0 } to{ transform:none; opacity:1 } }
    .mmj-nt-card{ font-family:"Hammersmith One","Trebuchet MS",sans-serif; width:430px; max-width:100%; box-sizing:border-box;
        background:#fff; border-radius:6px; box-shadow:0 8px 30px rgba(0,0,0,.4); padding:26px 28px 20px; text-align:center;
        color:#4c4c4c; position:relative; animation:mmj-nt-pop .16s ease-out; }
    .mmj-nt-kick{ display:inline-block; font-size:12px; letter-spacing:.4px; text-transform:uppercase; color:#8bc34a;
        margin-bottom:8px; }
    .mmj-nt-kick.warn{ color:#f0932b } .mmj-nt-kick.bad{ color:#eb4d3d }
    .mmj-nt-title{ font-size:25px; color:#3d3f42; margin:0 0 10px; line-height:1.15; }
    .mmj-nt-body{ font-size:15.5px; line-height:1.55; color:#5c5c5c; margin:0 0 4px; }
    .mmj-nt-card a{ color:#8a4fbf; text-decoration:none; font-weight:bold; }
    .mmj-nt-card a:hover{ text-decoration:underline; }
    .mmj-nt-report{ margin:14px 0 2px; text-align:left; }
    .mmj-nt-report .lbl{ font-size:12px; color:#9a9a9a; margin:0 0 5px 2px; }
    .mmj-nt-report pre{ margin:0; background:#f5f5f6; border:1px solid #e4e4e6; border-radius:5px; padding:10px 12px;
        font-family:ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace; font-size:11.5px; line-height:1.5; color:#555;
        white-space:pre; overflow:auto; max-height:146px; }
    .mmj-nt-links{ margin:16px 0 2px; background:#f7f7f8; border:1px solid #eee; border-radius:6px; padding:5px 4px; text-align:left; }
    .mmj-nt-link{ display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:5px; color:#555; font-size:14px; }
    .mmj-nt-link:hover{ background:#f0f0f1; }
    .mmj-nt-link svg{ width:17px; height:17px; flex:0 0 auto; fill:#6b6b6b; }
    .mmj-nt-link .k{ color:#9a9a9a; } .mmj-nt-link .v{ color:#3d3f42; font-weight:bold; }
    .mmj-nt-btns{ display:flex; gap:10px; margin-top:18px; }
    .mmj-nt-btn{ flex:1 1 0; border:none; border-radius:4px; padding:11px 8px; font-family:inherit; font-size:16px;
        color:#fff; cursor:pointer; box-shadow:0 3px 0 rgba(0,0,0,.14); transition:filter .1s,transform .05s; -webkit-tap-highlight-color:transparent; }
    .mmj-nt-btn:hover{ filter:brightness(1.05); } .mmj-nt-btn:active{ transform:translateY(2px); box-shadow:0 1px 0 rgba(0,0,0,.14); }
    .mmj-nt-btn.green{ background:#8bc34a; } .mmj-nt-btn.blue{ background:#5a9fd4; } .mmj-nt-btn.grey{ background:#b4b7bb; }
    .mmj-nt-foot{ margin-top:14px; font-size:11px; color:#bcbcbc; }
    .mmj-nt-x{ position:absolute; top:10px; right:14px; font-size:20px; line-height:1; color:#cfcfcf; cursor:pointer; font-family:sans-serif; }
    .mmj-nt-x:hover{ color:#8a8a8a; }
    `;

    const SVG = {
        github: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>',
        discord: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M13.54 2.9A13.2 13.2 0 0 0 10.3 1.9a9.3 9.3 0 0 0-.42.85 12.3 12.3 0 0 0-3.7 0 9 9 0 0 0-.42-.85c-1.14.2-2.23.54-3.25 1A13.6 13.6 0 0 0 .3 11.9a13.3 13.3 0 0 0 4.03 2.04c.33-.44.62-.91.86-1.4-.47-.18-.92-.4-1.35-.66.11-.08.22-.17.33-.26a9.5 9.5 0 0 0 8.07 0c.11.09.22.18.33.26-.43.26-.88.48-1.35.66.25.49.53.96.86 1.4a13.2 13.2 0 0 0 4.03-2.04 13.5 13.5 0 0 0-2.21-9.1 10.9 10.9 0 0 0-.69-.64zM5.52 10.1c-.8 0-1.45-.73-1.45-1.63 0-.9.64-1.63 1.45-1.63.82 0 1.47.74 1.45 1.63 0 .9-.64 1.63-1.45 1.63zm4.96 0c-.8 0-1.45-.73-1.45-1.63 0-.9.64-1.63 1.45-1.63.82 0 1.47.74 1.45 1.63 0 .9-.63 1.63-1.45 1.63z"/></svg>'
    };

    function create(opts) {
        const win = opts.win;
        const doc = win && win.document;
        const version = opts.version || "0";
        const contract = opts.contract || {};
        const onRefuse = typeof opts.onRefuse === "function" ? opts.onRefuse : function () {};

        // ---- observed state ----
        const obs = {
            ioInitFields: null,
            clientTFields: null,
            s2cFrames: 0,
            s2cUnknown: {},     // numeric id -> times seen (a packet with no name in our table)
            s2cErrors: 0
        };
        let welcomeShown = false; // the one-per-page-load welcome card has been shown
        let refused = false;      // the hard refusal has fired
        let menuTimer = null;     // the main-menu poll

        // ---- recording (called by the loader as frames flow) ----
        function recordIoInit(len) { if (obs.ioInitFields == null) obs.ioInitFields = len | 0; }
        function recordS2CError() { obs.s2cErrors++; }
        function recordS2C(name, id) {
            obs.s2cFrames++;
            if (name == null && typeof id === "number") obs.s2cUnknown[id] = (obs.s2cUnknown[id] || 0) + 1;
        }
        function recordClientTelemetry(len) {
            if (len > 0 && obs.clientTFields == null) obs.clientTFields = len;
            else if (len > (obs.clientTFields || 0)) obs.clientTFields = len;
            // The telemetry field count only becomes readable a few seconds in (the client answers
            // the first probe round then), so it can turn an already-"ok" join into a refusal.
            if (!refused) {
                const v = evaluate();
                if (v.verdict === "refuse") doRefuse(v);
            }
        }

        // ---- verdict ----
        function unknownIds() { return Object.keys(obs.s2cUnknown).map(Number).sort((a, b) => a - b); }

        function evaluate() {
            const signals = [];
            const need = contract.ioInitFields || 6;
            const tFields = contract.telemetryFields || 7;

            // hard: the real client reports more "T" fields than we can answer -> the server is
            // checking something we don't produce, and would flag/kick us.
            if (obs.clientTFields != null && obs.clientTFields > tFields) {
                signals.push({ level: "hard", text: "server's client sends " + obs.clientTFields + "-field telemetry; this loader answers " + tFields });
            }
            // hard: a handshake shorter than we read means we can't derive the session right.
            if (obs.ioInitFields != null && obs.ioInitFields < need) {
                signals.push({ level: "hard", text: "io-init handshake has " + obs.ioInitFields + " fields, expected " + need });
            }
            // hard: most server packets don't decode -> the s2c table/algorithm is out of sync.
            const bad = obs.s2cErrors + unknownIds().reduce((n, id) => n + obs.s2cUnknown[id], 0);
            if (obs.s2cFrames >= 24 && bad / obs.s2cFrames > 0.5) {
                signals.push({ level: "hard", text: Math.round(100 * bad / obs.s2cFrames) + "% of server packets did not decode" });
            }

            // soft: extra io-init fields (server grew the handshake, we still work).
            if (obs.ioInitFields != null && obs.ioInitFields > need) {
                signals.push({ level: "soft", text: "io-init handshake has " + obs.ioInitFields + " fields, expected " + need });
            }
            // soft: unknown packet ids (server added packets we don't surface to mods).
            const uk = unknownIds();
            if (uk.length) {
                signals.push({ level: "soft", text: "unrecognised server packet id" + (uk.length > 1 ? "s" : "") + ": " + uk.slice(0, 8).join(", ") + (uk.length > 8 ? "…" : "") });
            }
            // soft: a few decode errors but not a flood.
            if (obs.s2cErrors > 0 && !(obs.s2cFrames >= 24 && bad / obs.s2cFrames > 0.5)) {
                signals.push({ level: "soft", text: obs.s2cErrors + " server packet(s) failed to decode" });
            }

            const hard = signals.some((s) => s.level === "hard");
            const verdict = hard ? "refuse" : signals.length ? "warn" : "ok";
            return { verdict, signals };
        }

        function buildReport(v) {
            return {
                tool: "MooMoo.js loader",
                loader: version,
                build: (opts.diag && opts.diag.buildId) || null,
                url: (win.location && win.location.href) || null,
                at: new Date().toISOString(),
                verdict: v.verdict,
                signals: v.signals,
                expected: {
                    ioInitFields: contract.ioInitFields,
                    telemetryFields: contract.telemetryFields,
                    c2s: (contract.c2s || []).length,
                    s2c: (contract.s2c || []).length
                },
                observed: {
                    ioInitFields: obs.ioInitFields,
                    clientTelemetryFields: obs.clientTFields,
                    s2cFramesSeen: obs.s2cFrames,
                    s2cUnknownIds: unknownIds(),
                    s2cDecodeErrors: obs.s2cErrors
                }
            };
        }

        function reportText(v) {
            const r = buildReport(v);
            const lines = [
                "MooMoo.js loader — mismatch report",
                "loader   " + r.loader,
                "build    " + (r.build || "?"),
                "verdict  " + r.verdict,
                "when     " + r.at,
                "url      " + (r.url || "?"),
                "",
                "what doesn't match:"
            ];
            for (const s of r.signals) lines.push("  [" + s.level + "] " + s.text);
            lines.push("", "observed: io-init " + (r.observed.ioInitFields == null ? "?" : r.observed.ioInitFields) +
                " fields, telemetry " + (r.observed.clientTelemetryFields == null ? "?" : r.observed.clientTelemetryFields) +
                " fields, " + r.observed.s2cFramesSeen + " server packets seen" +
                (r.observed.s2cUnknownIds.length ? ", unknown ids " + r.observed.s2cUnknownIds.join(",") : "") +
                (r.observed.s2cDecodeErrors ? ", " + r.observed.s2cDecodeErrors + " decode errors" : ""));
            lines.push("expected: io-init " + r.expected.ioInitFields + " fields, telemetry " +
                r.expected.telemetryFields + " fields, " + r.expected.c2s + " c2s / " + r.expected.s2c + " s2c packets");
            return lines.join("\n");
        }

        // ---- welcome trigger (main menu, NOT in-game) ----
        // Is the game sitting on its loaded main menu? (mainMenu shown, loading text gone.)
        function menuVisible() {
            try {
                const m = doc.getElementById("mainMenu");
                if (!m || win.getComputedStyle(m).display === "none") return false;
                const lt = doc.getElementById("loadingText");
                if (lt && win.getComputedStyle(lt).display !== "none") return false;  // still loading
                return m.getClientRects().length > 0;
            } catch (e) { return false; }
        }

        // Watch for the main menu and show the welcome card the moment it's ready — a
        // welcome / loading screen before the player enters a game, never mid-game.
        function watchMenu() {
            if (!doc || welcomeShown || menuTimer) return;
            // If it's already up (loader installed late), show at once.
            if (menuVisible()) { showMenuWelcome(); return; }
            let tries = 0;
            menuTimer = win.setInterval(function () {
                if (welcomeShown || refused) { win.clearInterval(menuTimer); menuTimer = null; return; }
                if (menuVisible()) { win.clearInterval(menuTimer); menuTimer = null; showMenuWelcome(); return; }
                if (++tries > 480) { win.clearInterval(menuTimer); menuTimer = null; }  // give up after ~2 min
            }, 250);
        }

        function showMenuWelcome() {
            if (refused || welcomeShown) return;
            // On the menu there's no game connection yet, so this is normally a clean "ok";
            // a mismatch only becomes known once connected (then the refusal below can fire).
            const v = evaluate();
            if (v.verdict === "refuse") { doRefuse(v); return; }
            welcomeShown = true;
            if (v.verdict === "warn") showWarn(v); else showThanks();
        }

        function doRefuse(v) {
            if (refused) return;
            refused = true;
            try { onRefuse(); } catch (e) { /* ignore */ }
            showRefuse(v);
        }

        // ---- DOM helpers ----
        function ensureStyle() {
            if (!doc || doc.getElementById(STYLE_ID)) return;
            const s = doc.createElement("style");
            s.id = STYLE_ID; s.textContent = CSS;
            (doc.head || doc.documentElement).appendChild(s);
        }
        function el(tag, cls, html) {
            const n = doc.createElement(tag);
            if (cls) n.className = cls;
            if (html != null) n.innerHTML = html;
            return n;
        }
        function removeExisting() {
            if (!doc) return;
            const old = doc.querySelector(".mmj-nt-back");
            if (old && old.parentNode) old.parentNode.removeChild(old);
        }

        function linksCard() {
            const box = el("div", "mmj-nt-links");
            const row = (href, icon, k, v) => {
                const a = el("a", "mmj-nt-link");
                a.href = href; a.target = "_blank"; a.rel = "noopener noreferrer";
                a.innerHTML = icon + '<span class="k">' + k + '</span><span class="v">' + v + '</span>';
                return a;
            };
            box.appendChild(row(LINKS.github, SVG.github, "github", "al007ex"));
            box.appendChild(row(LINKS.discord, SVG.discord, "discord", "discord.gg/NMS3YR9Q5R"));
            return box;
        }

        function mount(card, closeable) {
            ensureStyle();
            removeExisting();
            if (!doc.body) { win.setTimeout(() => mount(card, closeable), 120); return; }
            const back = el("div", "mmj-nt-back");
            back.appendChild(card);
            const close = () => { if (back.parentNode) back.parentNode.removeChild(back); win.removeEventListener("keydown", onKey); };
            function onKey(e) { if (e.key === "Escape") close(); }
            if (closeable) {
                const x = el("div", "mmj-nt-x", "&times;");
                x.onclick = close; card.appendChild(x);
                back.addEventListener("click", (e) => { if (e.target === back) close(); });
                win.addEventListener("keydown", onKey);
            }
            doc.body.appendChild(back);
            return close;
        }

        function copyButton(getText) {
            const b = el("button", "mmj-nt-btn blue", "copy report");
            b.onclick = function () {
                const text = getText();
                const done = () => { b.textContent = "copied ✓"; win.setTimeout(() => (b.textContent = "copy report"), 1600); };
                try {
                    if (win.navigator && win.navigator.clipboard && win.navigator.clipboard.writeText) {
                        win.navigator.clipboard.writeText(text).then(done, () => legacyCopy(text, done));
                    } else legacyCopy(text, done);
                } catch (e) { legacyCopy(text, done); }
            };
            return b;
        }
        function legacyCopy(text, done) {
            try {
                const ta = doc.createElement("textarea");
                ta.value = text; ta.style.cssText = "position:fixed;left:-9999px;top:0";
                doc.body.appendChild(ta); ta.focus(); ta.select();
                doc.execCommand("copy"); doc.body.removeChild(ta); done();
            } catch (e) { /* clipboard blocked; nothing to do */ }
        }

        // ---- the three cards ----
        function showThanks() {
            const card = el("div", "mmj-nt-card");
            card.appendChild(el("div", "mmj-nt-kick", "mod loader active"));
            card.appendChild(el("div", "mmj-nt-title", "You're good to go"));
            card.appendChild(el("div", "mmj-nt-body",
                "This is MooMoo.js, my mod loader for the server. It handles the game's protocol for you so the mods just run. " +
                "Worth saying once: anything like this can get you banned on servers that don't allow mods, so keep it to ones that do. " +
                "Bug, idea, or just a question? I'm here:"));
            card.appendChild(linksCard());
            const btns = el("div", "mmj-nt-btns");
            const ok = el("button", "mmj-nt-btn green", "got it");
            btns.appendChild(ok);
            card.appendChild(btns);
            card.appendChild(el("div", "mmj-nt-foot", "MooMoo.js v" + version + " · by " + LINKS.author));
            const close = mount(card, true);
            ok.onclick = close;
        }

        function showWarn(v) {
            const card = el("div", "mmj-nt-card");
            card.appendChild(el("div", "mmj-nt-kick warn", "heads up"));
            card.appendChild(el("div", "mmj-nt-title", "Something doesn't line up"));
            card.appendChild(el("div", "mmj-nt-body",
                "The loader connected fine, but part of what the server's doing doesn't match this build. It'll most likely play " +
                "normally, though a few things might act up. If you've got a second, copy the report below and send it over so I can patch it."));
            const rep = el("div", "mmj-nt-report");
            rep.appendChild(el("div", "lbl", "› error report"));
            const pre = el("pre"); pre.textContent = reportText(v); rep.appendChild(pre);
            card.appendChild(rep);
            card.appendChild(linksCard());
            const btns = el("div", "mmj-nt-btns");
            btns.appendChild(copyButton(() => reportText(v)));
            const join = el("button", "mmj-nt-btn green", "join anyway");
            btns.appendChild(join);
            card.appendChild(btns);
            card.appendChild(el("div", "mmj-nt-foot", "MooMoo.js v" + version + " · by " + LINKS.author));
            const close = mount(card, true);
            join.onclick = close;
        }

        function showRefuse(v) {
            const card = el("div", "mmj-nt-card");
            card.appendChild(el("div", "mmj-nt-kick bad", "can't connect"));
            card.appendChild(el("div", "mmj-nt-title", "This loader is out of date"));
            card.appendChild(el("div", "mmj-nt-body",
                "The server moved past what this build of MooMoo.js can handle. Joining now would almost certainly get you kicked or " +
                "banned, so I've stopped the connection here. Grab the newest loader — or if you're already on it, send me the report " +
                "so I can fix it."));
            const rep = el("div", "mmj-nt-report");
            rep.appendChild(el("div", "lbl", "› error report"));
            const pre = el("pre"); pre.textContent = reportText(v); rep.appendChild(pre);
            card.appendChild(rep);
            card.appendChild(linksCard());
            const btns = el("div", "mmj-nt-btns");
            btns.appendChild(copyButton(() => reportText(v)));
            const latest = el("button", "mmj-nt-btn green", "get the latest");
            latest.onclick = function () { try { win.open(LINKS.repo, "_blank", "noopener"); } catch (e) { win.location.href = LINKS.repo; } };
            btns.appendChild(latest);
            card.appendChild(btns);
            card.appendChild(el("div", "mmj-nt-foot", "MooMoo.js v" + version + " · by " + LINKS.author));
            mount(card, false); // sticky: no backdrop/ESC close, no "join anyway"
        }

        return {
            recordIoInit, recordS2C, recordS2CError, recordClientTelemetry,
            watchMenu, evaluate,
            // handy for diagnostics / the test harness
            _report: () => reportText(evaluate()),
            _obs: obs
        };
    }

    return { create, LINKS };
});
