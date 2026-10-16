/*
 * MooMod (by Nuro) — a 1:1 port onto moomoo.js
 * =============================================
 * Its own standalone script: it only needs the loader. It is NOT part of MooMooPlus or
 * MooMoo Lite. (jQuery + jquery-confirm, which the original @required, are bundled in by
 * mods/build-moomod.mjs as MOOMOD_JQUERY — the only name these files use from outside.)
 *
 * The original userscript spoke the 2020 moomoo.io protocol itself: it hooked
 * WebSocket.prototype.send, read every frame as msgpack ["type", [args]] and wrote its
 * own frames the same way. This port keeps the script's logic statement for statement
 * and swaps only the transport:
 *   - 20-wire.js speaks the OLD packet language to the rest of the script and translates
 *     it to loader actions (and the server's events back into old frames), so every
 *     handler still reads like the original: send(["13c", [0, 7, 0]]) equips a hat
 *   - the menus, styles and texts are the original's, character for character
 *   - the original's quirks are kept (F2 / ESC only ever OPEN their menus, the auto heal
 *     checkbox starts unticked while auto heal is on, ...). The few places that differ
 *     are marked "PORT:" — server rules the old site didn't have, and things the new
 *     client doesn't have (no #setupCard, no "Featured YouTuber" box)
 *
 * Deobfuscated original: ~/Downloads/MooMod.deobfuscated.js (variable names below are
 * the readable versions of its _0x names).
 *
 * Files (concatenated in name order into one scope by mods/build-moomod.mjs):
 *   00-head    registration, tracked timers / listeners (disabling the mod undoes it all)
 *   10-assets  the original HTML + CSS
 *   20-wire    old protocol <-> loader: the send hook, frame translation, server limits
 *   30-state   the script's variables
 *   40-page    page touches: logo, title, ads, cursor, alert, featured hacker, FPS counter
 *   50-menus   F2 auto placement, ESC hat menu, the "-" MooMod menu, autopilot, alerts
 *   60-game    the per-message brain: enemy / biome hats, HUD colours, auto heal, markers
 *   70-keys    every key: spammers, instas, four-places, auto trap, bot mode, arrow spams
 *   90-init    runs the setup in the original's exact order
 */
(function () {
    "use strict";

    function boot(MooMoo) {
        MooMoo.register({
            id: "moomod",
            name: "MooMod",
            version: "1.0.0",
            description: "Nuro's MooMod, ported 1:1. - opens the MooMod menu, ESC the hat menu, F2 auto placement.",
            menu: true,
            menuHint: "MooMod has its own menus: press - (minus) for the MooMod menu, ESC for the hat menu and F2 for auto placement.",
            liveSettings: true,
            defaultEnabled: true
        }, function (ctx) {
            const win = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
            const document = win.document;
            if (!document || !document.createElement) return;           // headless (tests without a page)
            // jQuery + jquery-confirm (the original @required both). They're bundled in by
            // build-moomod.mjs and started privately once the page has a document (jQuery can't
            // start at document-start, where moomoo.js scripts run) — see 90-init.
            let $ = null;

            // ---- everything the original left running is tracked, so disabling undoes it ----
            const timeouts = new Set();
            const intervals = new Set();
            let alive = true;
            function setTimeout(fn, ms) {
                const id = win.setTimeout(function () { timeouts.delete(id); if (alive) fn(); }, ms);
                timeouts.add(id);
                return id;
            }
            function clearTimeout(id) { timeouts.delete(id); win.clearTimeout(id); }
            function setInterval(fn, ms) {
                const id = win.setInterval(function () { if (alive) fn(); }, ms);
                intervals.add(id);
                return id;
            }
            function clearInterval(id) { intervals.delete(id); win.clearInterval(id); }
            function listen(target, type, fn, opts) {
                target.addEventListener(type, fn, opts);
                ctx.onCleanup(function () { target.removeEventListener(type, fn, opts); });
            }
            const owned = [];                       // elements we created (removed on disable)
            function own(el) { owned.push(el); return el; }
            const restores = [];                    // page values we changed (put back on disable)
            function remember(fn) { restores.push(fn); }
            ctx.onCleanup(function () {
                alive = false;
                for (const id of timeouts) win.clearTimeout(id);
                for (const id of intervals) win.clearInterval(id);
                timeouts.clear(); intervals.clear();
                const stop = (el) => { if ($) $(el).stop(true); el.remove(); };
                if ($) { try { $(document).off(".moomod"); $("#mapDisplay").off(".moomod"); } catch (e) { /* ignore */ } }
                for (const el of owned) { try { stop(el); } catch (e) { /* ignore */ } }
                // extra copies made at runtime (autopilot boxes, pulse rings, map markers)
                for (const sel of ["#infoDiv", ".spotDiv", ".mapTarget", "#botText"]) {
                    try { for (const el of Array.from(document.querySelectorAll(sel))) stop(el); } catch (e) { /* ignore */ }
                }
                for (let i = restores.length - 1; i >= 0; i--) { try { restores[i](); } catch (e) { /* ignore */ } }
            });
