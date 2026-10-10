/*
 * moomoo.js loader — CONFIG MENU  (the tabbed settings overlay)
 * ============================================================
 * A rebuild of the config menu from the old bundle: a dark overlay with tabs
 * down the top and toggle-sliders / range-sliders / dropdowns / text + key
 * inputs inside. It's driven by the mod registry — every setting a mod declares
 * with a `category` becomes a row under that tab, so adding a feature + its
 * setting is all it takes to get it into the menu.
 *
 * Toggle it with a hotkey (default backquote `) or the floating gear button.
 *
 * Part of the LOADER (volatile): it's DOM-facing UI.
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooConfigMenu = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooConfigMenu = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const STYLE = `
    #mmj-cfg-overlay{ position:fixed; inset:0; background:rgba(0,0,0,.5); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); z-index:99998; display:none; }
    #mmj-cfg{ position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); width:min(560px,94vw); max-height:84vh; overflow:hidden;
        background:rgba(16,16,16,.94); color:#fff; padding:22px; z-index:99999; display:none; font-family:'Hammersmith One',Arial,sans-serif;
        border:2px solid #3a3a3a; border-radius:14px; box-shadow:0 0 15px rgba(0,0,0,.7); transition:box-shadow .4s ease; }
    #mmj-cfg:hover{ box-shadow:0 0 10px #19d3e6,0 0 22px rgba(25,211,230,.5); }
    #mmj-cfg .mmj-cfg-head{ display:flex; align-items:center; gap:10px; margin-bottom:12px; }
    #mmj-cfg .mmj-cfg-title{ font-size:21px; letter-spacing:.3px; }
    #mmj-cfg .mmj-cfg-title b{ color:#6cc24a; }
    #mmj-cfg .mmj-cfg-x{ margin-left:auto; cursor:pointer; color:#9a9a9a; font-size:22px; line-height:1; padding:2px 6px; border-radius:6px; }
    #mmj-cfg .mmj-cfg-x:hover{ color:#fff; background:#333; }
    #mmj-cfg .mmj-cfg-tabs{ display:flex; gap:7px; overflow-x:auto; padding-bottom:4px; scrollbar-width:thin; }
    #mmj-cfg .mmj-cfg-tabs::-webkit-scrollbar{ height:6px; } #mmj-cfg .mmj-cfg-tabs::-webkit-scrollbar-thumb{ background:#282828; border-radius:3px; }
    #mmj-cfg .mmj-cfg-tab{ cursor:pointer; padding:9px 14px; background:#333; color:#fff; border:1px solid #555; border-radius:8px; white-space:nowrap; user-select:none; font-size:14px; transition:background .2s,color .2s,border .2s; }
    #mmj-cfg .mmj-cfg-tab:hover{ background:#3d3d3d; }
    #mmj-cfg .mmj-cfg-tab.active{ background:#6cc24a; border-color:#6cc24a; color:#10200a; }
    #mmj-cfg .mmj-cfg-body{ margin-top:16px; overflow-y:auto; max-height:56vh; padding-right:6px; }
    #mmj-cfg .mmj-cfg-body::-webkit-scrollbar{ width:8px; } #mmj-cfg .mmj-cfg-body::-webkit-scrollbar-thumb{ background:#2d2d2d; border-radius:4px; }
    #mmj-cfg .mmj-row{ display:flex; align-items:center; gap:12px; padding:8px 2px; border-bottom:1px solid rgba(255,255,255,.06); }
    #mmj-cfg .mmj-row .mmj-lab{ flex:1 1 auto; min-width:0; font-size:15px; color:#eaeaea; }
    #mmj-cfg .mmj-row .mmj-hint{ display:block; font-size:11px; color:#8a8a8a; margin-top:2px; }
    #mmj-cfg .mmj-master{ background:rgba(108,194,74,.08); border:1px solid rgba(108,194,74,.25); border-radius:8px; padding:4px 10px; margin-bottom:6px; }
    /* toggle */
    #mmj-cfg .mmj-sw{ position:relative; width:50px; height:24px; flex:0 0 auto; }
    #mmj-cfg .mmj-sw input{ opacity:0; width:0; height:0; position:absolute; }
    #mmj-cfg .mmj-sw .mmj-sl{ position:absolute; inset:0; background:#2e2d2d; border-radius:12px; cursor:pointer; transition:background .25s; }
    #mmj-cfg .mmj-sw .mmj-sl:before{ content:""; position:absolute; width:20px; height:20px; left:3px; top:2px; background:#111; border-radius:50%; transition:transform .25s,background .25s; }
    #mmj-cfg .mmj-sw input:checked + .mmj-sl{ background:#6cc24a; }
    #mmj-cfg .mmj-sw input:checked + .mmj-sl:before{ transform:translateX(26px); background:#fff; }
    /* range */
    #mmj-cfg input[type=range]{ -webkit-appearance:none; appearance:none; width:150px; height:6px; border-radius:3px; background:#3a3a3a; outline:none; flex:0 0 auto; }
    #mmj-cfg input[type=range]::-webkit-slider-thumb{ -webkit-appearance:none; width:16px; height:16px; border-radius:50%; background:#6cc24a; cursor:pointer; }
    #mmj-cfg input[type=range]::-moz-range-thumb{ width:16px; height:16px; border:none; border-radius:50%; background:#6cc24a; cursor:pointer; }
    #mmj-cfg .mmj-val{ font-size:13px; color:#bdbdbd; min-width:34px; text-align:right; }
    /* text / number / select / key */
    #mmj-cfg input[type=text], #mmj-cfg input[type=number], #mmj-cfg select{ background:#242424; border:1px solid #444; color:#eee; border-radius:7px; padding:6px 9px; font-family:inherit; font-size:13px; width:140px; flex:0 0 auto; }
    #mmj-cfg input:focus, #mmj-cfg select:focus{ outline:none; border-color:#6cc24a; }
    #mmj-cfg .mmj-key{ background:#242424; border:1px solid #444; color:#eee; border-radius:7px; padding:6px 9px; font-size:13px; min-width:90px; text-align:center; cursor:pointer; flex:0 0 auto; }
    #mmj-cfg .mmj-key.listening{ border-color:#6cc24a; color:#6cc24a; }
    #mmj-cfg .mmj-empty{ color:#8a8a8a; text-align:center; padding:26px 8px; font-size:15px; }
    /* floating open button */
    #mmj-cfg-fab{ position:fixed; right:16px; bottom:16px; width:44px; height:44px; border-radius:50%; background:rgba(16,16,16,.85);
        border:2px solid #3a3a3a; color:#6cc24a; font-size:22px; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:99997; transition:box-shadow .3s,transform .2s; }
    #mmj-cfg-fab:hover{ box-shadow:0 0 10px #19d3e6,0 0 20px rgba(25,211,230,.5); transform:scale(1.08); }
    `;

    function installConfigMenu(win, MooMoo, opts) {
        opts = opts || {};
        const doc = win.document;
        if (!doc || typeof doc.createElement !== "function" || typeof doc.getElementById !== "function") return null;
        const input = opts.input || null;
        let toggleKey = opts.toggleKey || "`";
        const title = opts.title || "moomoo.js";

        function el(tag, cls, attrs) { const n = doc.createElement(tag); if (cls) n.className = cls; if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]); return n; }
        function style() {
            if (doc.getElementById("mmj-cfg-style")) return;
            const host = doc.head || doc.documentElement;
            if (!host) return;
            const s = el("style"); s.id = "mmj-cfg-style"; s.textContent = STYLE; host.appendChild(s);
        }

        const overlay = el("div", null, { id: "mmj-cfg-overlay" });
        const card = el("div", null, { id: "mmj-cfg" });
        const fab = el("div", null, { id: "mmj-cfg-fab" }); fab.textContent = "⚙";
        fab.title = "moomoo.js config (" + toggleKey + ")";
        // The loader runs at document-start, so <head>/<body> may not exist yet.
        // Inject the stylesheet and mount the UI as soon as they appear.
        function mount() {
            if (!doc.body) return false;
            style();
            doc.body.appendChild(overlay); doc.body.appendChild(card); doc.body.appendChild(fab);
            return true;
        }
        if (!mount()) {
            if (doc.addEventListener) doc.addEventListener("DOMContentLoaded", mount, { once: true });
            try {
                const obs = new win.MutationObserver(() => { if (mount()) obs.disconnect(); });
                obs.observe(doc.documentElement || doc, { childList: true, subtree: true });
            } catch (e) { /* no observer: DOMContentLoaded will still fire */ }
        }

        let activeTab = null;
        let suppressRerender = false;

        // Collect the menu model from the registry: mods (that opt in) and their
        // settings grouped into category tabs. A "Main" tab holds master toggles.
        function model() {
            const mods = MooMoo.getMods().filter((m) => m.menu !== false && (m.hasSettings || true));
            // only include mods explicitly meant for the config menu, if any are flagged
            const flagged = mods.filter((m) => m.menu === true);
            const list = flagged.length ? flagged : mods.filter((m) => m.hasSettings);
            const tabs = [];
            const tabMap = new Map();
            function tab(name) { let t = tabMap.get(name); if (!t) { t = { name, rows: [] }; tabMap.set(name, t); tabs.push(t); } return t; }
            const main = tab("Main");
            for (const m of list) {
                main.rows.push({ kind: "master", modId: m.id, label: m.name, value: m.enabled });
                for (const s of m.settings) {
                    tab(s.category || m.name).rows.push({ kind: "setting", modId: m.id, s });
                }
            }
            // drop Main if nothing landed in it
            if (!main.rows.length) { tabs.shift(); tabMap.delete("Main"); }
            return tabs;
        }

        function setVal(modId, key, value) { suppressRerender = true; MooMoo.setSetting(modId, key, value); suppressRerender = false; }

        function controlFor(row) {
            const wrap = el("div", "mmj-row");
            if (row.kind === "master") {
                wrap.classList.add("mmj-master");
                const lab = el("div", "mmj-lab"); lab.textContent = row.label + " — enabled";
                const sw = el("label", "mmj-sw"); const inp = el("input", null, { type: "checkbox" }); inp.checked = !!row.value;
                inp.addEventListener("change", () => MooMoo.setModEnabled(row.modId, inp.checked));
                sw.appendChild(inp); sw.appendChild(el("span", "mmj-sl"));
                wrap.appendChild(lab); wrap.appendChild(sw);
                return wrap;
            }
            const s = row.s;
            const lab = el("div", "mmj-lab"); lab.textContent = s.label;
            if (s.hint) { const h = el("span", "mmj-hint"); h.textContent = s.hint; lab.appendChild(h); }
            wrap.appendChild(lab);

            if (s.type === "boolean") {
                const sw = el("label", "mmj-sw"); const inp = el("input", null, { type: "checkbox" }); inp.checked = !!s.value;
                inp.addEventListener("change", () => setVal(row.modId, s.key, inp.checked));
                sw.appendChild(inp); sw.appendChild(el("span", "mmj-sl")); wrap.appendChild(sw);
            } else if (s.type === "number" && s.min != null && s.max != null) {
                const val = el("span", "mmj-val"); val.textContent = String(s.value);
                const r = el("input", null, { type: "range", min: s.min, max: s.max, step: s.step != null ? s.step : 1 }); r.value = s.value;
                r.addEventListener("input", () => { val.textContent = String(r.value); });
                r.addEventListener("change", () => setVal(row.modId, s.key, parseFloat(r.value)));
                wrap.appendChild(val); wrap.appendChild(r);
            } else if (s.type === "number") {
                const n = el("input", null, { type: "number" }); n.value = s.value;
                if (s.min != null) n.min = s.min; if (s.max != null) n.max = s.max; if (s.step != null) n.step = s.step;
                n.addEventListener("change", () => setVal(row.modId, s.key, parseFloat(n.value)));
                wrap.appendChild(n);
            } else if (s.type === "select") {
                const sel = el("select");
                for (const o of (s.options || [])) { const op = el("option"); op.value = String(o); op.textContent = String(o); if (String(o) === String(s.value)) op.selected = true; sel.appendChild(op); }
                sel.addEventListener("change", () => setVal(row.modId, s.key, sel.value));
                wrap.appendChild(sel);
            } else if (s.type === "key") {
                const b = el("div", "mmj-key"); b.textContent = s.value ? String(s.value).toUpperCase() : "— set —";
                b.addEventListener("click", () => {
                    b.classList.add("listening"); b.textContent = "press a key…";
                    const grab = (e) => {
                        e.preventDefault(); e.stopPropagation();
                        win.removeEventListener("keydown", grab, true);
                        b.classList.remove("listening");
                        const k = e.key === " " ? "space" : e.key;
                        b.textContent = String(k).toUpperCase();
                        setVal(row.modId, s.key, k);
                    };
                    win.addEventListener("keydown", grab, true);
                });
                wrap.appendChild(b);
            } else {
                const t = el("input", null, { type: "text" }); t.value = s.value == null ? "" : s.value;
                t.addEventListener("change", () => setVal(row.modId, s.key, t.value));
                wrap.appendChild(t);
            }
            return wrap;
        }

        function render() {
            const tabs = model();
            card.textContent = "";
            const head = el("div", "mmj-cfg-head");
            const ttl = el("div", "mmj-cfg-title"); ttl.innerHTML = title.replace(/\.js$/, '<b>.js</b>');
            const x = el("div", "mmj-cfg-x"); x.textContent = "×"; x.addEventListener("click", hide);
            head.appendChild(ttl); head.appendChild(x); card.appendChild(head);

            if (!tabs.length) { const e = el("div", "mmj-empty"); e.textContent = "No configurable mods loaded yet."; card.appendChild(e); return; }

            if (!activeTab || !tabs.find((t) => t.name === activeTab)) activeTab = tabs[0].name;
            const tabBar = el("div", "mmj-cfg-tabs");
            const body = el("div", "mmj-cfg-body");
            for (const t of tabs) {
                const tb = el("div", "mmj-cfg-tab" + (t.name === activeTab ? " active" : "")); tb.textContent = t.name;
                tb.addEventListener("click", () => { activeTab = t.name; render(); });
                tabBar.appendChild(tb);
            }
            card.appendChild(tabBar);
            const cur = tabs.find((t) => t.name === activeTab);
            for (const row of cur.rows) body.appendChild(controlFor(row));
            card.appendChild(body);
        }

        let open = false;
        function show() { open = true; render(); overlay.style.display = "block"; card.style.display = "block"; }
        function hide() { open = false; overlay.style.display = "none"; card.style.display = "none"; }
        function toggle() { open ? hide() : show(); }

        overlay.addEventListener("click", hide);
        fab.addEventListener("click", toggle);
        // hotkey + escape. The toggle key is read on every press so a mod can
        // change it (the bundle's menu opened and closed on Escape). When the
        // toggle key isn't Escape, Escape still closes an open menu.
        win.addEventListener("keydown", (e) => {
            if (e.isTrusted === false) return;
            const k = e.key === " " ? "space" : e.key;
            if (k === toggleKey) { e.preventDefault(); toggle(); }
            else if (open && e.key === "Escape") hide();
        }, true);

        // Re-render on registry changes (new mod, external toggle), but not for our
        // own edits (so a slider drag isn't interrupted).
        MooMoo.onModsChanged(() => { if (open && !suppressRerender) render(); });

        return {
            show, hide, toggle, render, isOpen: () => open,
            get toggleKey() { return toggleKey; },
            setToggleKey: (k) => { toggleKey = k; fab.title = "moomoo.js config (" + toggleKey + ")"; }
        };
    }

    return { installConfigMenu };
});
