/*
 * moomoo.js loader — INPUT  (keyboard + mouse, for mods)
 * ======================================================
 * The game client owns its own input; this adds a parallel listener so mods can
 * bind keys (toggle a feature, open the menu) and read the cursor/aim. It never
 * swallows the game's input unless a bind explicitly asks to.
 *
 * Part of the LOADER (volatile): it's DOM-facing and lives next to the client.
 *
 *   const input = installInput(window);
 *   input.onKey("v", () => toggleAimbot());     // fires on keydown, not while typing
 *   input.isDown("shift");                       // live key state
 *   input.mouse.x / input.mouse.y                // cursor in screen pixels
 *   input.aimAngle();                            // angle from screen centre to cursor
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooInput = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooInput = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    // Normalise a key spec to a lowercase token. Accepts "v", "V", "KeyV",
    // "Space", " ", "ArrowLeft", "`", a numeric keyCode, etc.
    function normKey(k) {
        if (k == null) return "";
        if (typeof k === "number") return "#" + k;              // raw keyCode
        let s = String(k);
        if (s.length > 1 && /^Key[A-Z]$/.test(s)) s = s.slice(3);
        if (s.length > 1 && /^Digit[0-9]$/.test(s)) s = s.slice(5);
        if (s === " ") s = "space";
        return s.toLowerCase();
    }

    // The tokens a single event matches against (so binds can use key, code, or keyCode).
    function tokensFor(e) {
        const toks = [];
        if (e.key) { toks.push(e.key === " " ? "space" : e.key.toLowerCase()); }
        if (e.code) {
            let c = e.code;
            if (/^Key[A-Z]$/.test(c)) c = c.slice(3);
            else if (/^Digit[0-9]$/.test(c)) c = c.slice(5);
            toks.push(c.toLowerCase());
        }
        if (typeof e.keyCode === "number") toks.push("#" + e.keyCode);
        return toks;
    }

    function isTyping(doc) {
        const el = doc.activeElement;
        if (!el) return false;
        const tag = (el.tagName || "").toLowerCase();
        return tag === "input" || tag === "textarea" || tag === "select" || el.isContentEditable === true;
    }

    function installInput(win) {
        const doc = win.document;
        const down = new Set();                 // currently-held tokens
        const binds = new Map();                // token -> Set<{fn, preventDefault, allowTyping}>
        const downCbs = new Set();              // fn(e, tokens)
        const upCbs = new Set();
        const moveCbs = new Set();
        const mouse = { x: (win.innerWidth || 0) / 2, y: (win.innerHeight || 0) / 2, raw: null };

        function center() { return { x: (win.innerWidth || 0) / 2, y: (win.innerHeight || 0) / 2 }; }

        function onKeyDown(e) {
            const toks = tokensFor(e);
            for (const t of toks) down.add(t);
            const typing = isTyping(doc);
            for (const cb of Array.from(downCbs)) { try { cb(e, toks); } catch (err) { /* ignore */ } }
            // auto-repeat shouldn't re-trigger binds
            if (e.repeat) return;
            // tokensFor can yield the SAME token twice (e.g. e.key "f" and e.code "KeyF" both
            // normalise to "f"), so dedupe before firing or a single press runs each bind twice
            // (which would, e.g., toggle a feature on then straight back off).
            for (const t of new Set(toks)) {
                const set = binds.get(t);
                if (!set) continue;
                for (const b of Array.from(set)) {
                    if (typing && !b.allowTyping) continue;
                    if (b.preventDefault) e.preventDefault();
                    try { b.fn(e); } catch (err) { console.error("[moomoo.js] keybind threw", err); }
                }
            }
        }
        function onKeyUp(e) {
            for (const t of tokensFor(e)) down.delete(t);
            for (const cb of Array.from(upCbs)) { try { cb(e, tokensFor(e)); } catch (err) { /* ignore */ } }
        }
        function onBlur() { down.clear(); }        // avoid stuck keys when focus leaves
        function onMove(e) {
            mouse.x = e.clientX; mouse.y = e.clientY; mouse.raw = e;
            for (const cb of Array.from(moveCbs)) { try { cb(mouse, e); } catch (err) { /* ignore */ } }
        }

        // Capture phase so we see keys before the game's own handlers; we don't
        // stopPropagation, so the game still receives them unless a bind prevents default.
        win.addEventListener("keydown", onKeyDown, true);
        win.addEventListener("keyup", onKeyUp, true);
        win.addEventListener("blur", onBlur);
        win.addEventListener("mousemove", onMove, true);

        const api = {
            mouse,
            center,
            isDown: (k) => down.has(normKey(k)),
            // Register a keybind. opts: { preventDefault, allowTyping }. Returns an unbind fn.
            onKey(k, fn, opts) {
                const t = normKey(k);
                let set = binds.get(t);
                if (!set) { set = new Set(); binds.set(t, set); }
                const b = { fn, preventDefault: !!(opts && opts.preventDefault), allowTyping: !!(opts && opts.allowTyping) };
                set.add(b);
                return () => set.delete(b);
            },
            onKeyDown: (fn) => { downCbs.add(fn); return () => downCbs.delete(fn); },
            onKeyUp: (fn) => { upCbs.add(fn); return () => upCbs.delete(fn); },
            onMouseMove: (fn) => { moveCbs.add(fn); return () => moveCbs.delete(fn); },
            // Angle from the screen centre (where the player is drawn) to the cursor.
            aimAngle() {
                const c = center();
                return Math.atan2(mouse.y - c.y, mouse.x - c.x);
            },
            isTyping: () => isTyping(doc),
            normKey,
            uninstall() {
                win.removeEventListener("keydown", onKeyDown, true);
                win.removeEventListener("keyup", onKeyUp, true);
                win.removeEventListener("blur", onBlur);
                win.removeEventListener("mousemove", onMove, true);
                binds.clear(); downCbs.clear(); upCbs.clear(); moveCbs.clear(); down.clear();
            }
        };
        return api;
    }

    return { installInput, normKey };
});
