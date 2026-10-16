            // =====================================================================
            // M MENU — every feature in panels by category, styled like moomoo.io's
            // own in-game boxes (store / clan menu), green for whatever is on.
            // =====================================================================
            //   click a feature          on / off
            //   right click a feature    what it does, its options, a key bind
            //   drag a panel header      move it (a plain click folds it)
            //   Esc / M                  close
            //
            // Panels come straight from the catalog in 00-head.js (category, label,
            // desc, options via `parent`). Panel spots, folds, key binds and the menu
            // key are kept per browser in localStorage "mmp_menu_v2".
            //
            // M used to be the bundle's debug reset and its hold-to-place spawn pad
            // key: the reset is a button in the Menu panel, the spawn pad is on G.
            (function () {
                if (!doc || !doc.createElement) return;
                let menuDead = false;
                ctx.onCleanup(() => { menuDead = true; });

                // ---- saved menu state ----
                const STORE_KEY = "mmp_menu_v2";
                const prefs = { panels: {}, binds: {}, hotkeys: {}, menuKey: "m", toasts: true };
                try {
                    const raw = win.localStorage && (win.localStorage.getItem(STORE_KEY) || win.localStorage.getItem("mmp_menu_v1"));
                    const got = raw ? JSON.parse(raw) : null;
                    if (got && typeof got === "object") {
                        for (const k of ["binds", "hotkeys"]) if (got[k] && typeof got[k] === "object") prefs[k] = got[k];
                        if (got.panelsV2 && typeof got.panelsV2 === "object") prefs.panels = got.panelsV2;
                        if (typeof got.menuKey === "string" && got.menuKey) prefs.menuKey = got.menuKey;
                        if (typeof got.toasts === "boolean") prefs.toasts = got.toasts;
                    }
                } catch (e) { /* no storage or bad JSON: defaults */ }
                function savePrefs() {
                    const out = { binds: prefs.binds, hotkeys: prefs.hotkeys, menuKey: prefs.menuKey, toasts: prefs.toasts, panelsV2: prefs.panels };
                    try { win.localStorage && win.localStorage.setItem(STORE_KEY, JSON.stringify(out)); } catch (e) { /* no storage */ }
                }

                // ---- keys ----
                // A key as stored: numpad keys by code, the rest by e.key ("R" is
                // shift+r, which the bundle told apart from "r"), space as "Space".
                const NUMPAD = { NumpadMultiply: ["*", 106], NumpadSubtract: ["-", 109], NumpadAdd: ["+", 107], NumpadDivide: ["/", 111], NumpadDecimal: [".", 110] };
                function keyIdOf(e) {
                    if (e.code && e.code.indexOf("Numpad") === 0) return e.code;
                    return e.key === " " ? "Space" : e.key;
                }
                function keyLabel(id) {
                    if (!id) return "none";
                    if (NUMPAD[id]) return "Num " + NUMPAD[id][0];
                    if (/^Numpad\d$/.test(id)) return "Num " + id.slice(6);
                    if (id.length === 1) return id !== id.toLowerCase() ? "Shift+" + id : id.toUpperCase();
                    return id;
                }
                function isMenuKey(id) { return !!id && !!prefs.menuKey && id.toLowerCase() === prefs.menuKey.toLowerCase(); }
                // what the bundle's key handlers (Tm / Cm) read from a key event
                function fakeKey(id, src) {
                    let key = id, code = "", kc = 0;
                    if (NUMPAD[id]) { key = NUMPAD[id][0]; code = id; kc = NUMPAD[id][1]; }
                    else if (id.length === 1) { kc = id.toUpperCase().charCodeAt(0); if (/[a-z]/i.test(id)) code = "Key" + id.toUpperCase(); }
                    return {
                        key, code, keyCode: kc, which: kc, shiftKey: id.length === 1 && id !== id.toLowerCase(),
                        repeat: !!(src && src.repeat), isTrusted: true, target: src ? src.target : null,
                        preventDefault() {}, stopPropagation() {}
                    };
                }
                function typing() {
                    const a = doc.activeElement;
                    if (!a || a === doc.body) return false;
                    if (a.isContentEditable || a.tagName === "TEXTAREA") return true;
                    return a.tagName === "INPUT" && /^(text|search|number|password|email|url|tel|)$/i.test(a.type || "");
                }

                // The game keys MMP reacts to. `key` is the one the feature code
                // listens for; set another and it's fed in as `key` (the old one stops).
                const HOTKEYS = [
                    { id: "autohit", key: "e", label: "Auto Hit", state: () => !!Ct, desc: "keep swinging on your own" },
                    { id: "pushgate", key: "l", label: "Auto Push On / Off", state: () => !!In, desc: "pauses and resumes Auto Push. it's on when you join" },
                    { id: "insta", key: "r", label: "Insta", state: () => un === "normal", desc: "arms one insta, primary then secondary, for when your target is in range (also pings the map)" },
                    { id: "rinsta", key: "R", label: "Reverse Insta", state: () => un === "reverse", desc: "same, but secondary first" },
                    { id: "tinsta", key: "NumpadMultiply", label: "Turret Insta", state: () => !!fn, desc: "polearm: arms a turret-gear insta on your target" },
                    { id: "trail", key: "n", label: "Windmill Trail", state: () => !!on.status, desc: "drops three windmills behind you every 100 units you walk" },
                    { id: "lockdir", key: "x", label: "Lock Direction", state: () => !!(z && z.lockDir), desc: "stop turning toward the mouse" },
                    { id: "zoom", key: "p", label: "Reset Zoom", desc: "eases the zoom back to normal. zoom itself is hold Q + mouse wheel (Custom Renderer)" },
                    { id: "color", key: "NumpadSubtract", label: "Random Color", desc: "a random color for your sid and your damage numbers" },
                    { id: "trap", key: "f", label: "Place Trap", hold: true, desc: "hold: keeps placing your trap or boost pad" },
                    { id: "spike", key: "v", label: "Place Spike", hold: true, desc: "hold: keeps placing spikes" },
                    { id: "utility", key: "h", label: "Place Utility", hold: true, desc: "hold: keeps placing your age 7+ item (turret, platform, healing pad, blocker, teleporter)" },
                    { id: "spawn", key: "m", def: "g", label: "Place Spawn Pad", hold: true, desc: "hold: keeps placing spawn pads" },
                    { id: "wall", key: "i", label: "Place Wall", hold: true, desc: "hold: keeps placing walls toward your mouse" },
                    { id: "mine", key: "j", label: "Place Mine", hold: true, desc: "hold: keeps placing mines" }
                ];
                function hotKey(h) { const val = prefs.hotkeys[h.id]; return typeof val === "string" ? val : (h.def || h.key); }

                // keys the menu owns never reach the feature code as themselves
                let keyMap = new Map();
                function rebuildKeys() {
                    keyMap = new Map();
                    const mark = (id) => { let r = keyMap.get(id); if (!r) keyMap.set(id, r = { feed: null }); return r; };
                    for (const k in prefs.binds) if (prefs.binds[k]) mark(prefs.binds[k]);
                    for (const h of HOTKEYS) {
                        const cur = hotKey(h);
                        if (cur === h.key) continue;
                        mark(h.key);
                        if (cur) mark(cur).feed = h;
                    }
                }
                rebuildKeys();
                const held = new Map();      // physical key (e.code) -> hotkey it was fed as
                keyFilter = function (e, down) {
                    const id = keyIdOf(e);
                    if (isMenuKey(id)) return true;
                    if (!down) {
                        const h = held.get(e.code);
                        if (h) { held.delete(e.code); Cm(fakeKey(h.key, e)); return true; }
                    }
                    const r = keyMap.get(id);
                    if (!r) return false;
                    if (r.feed && down) { held.set(e.code, r.feed); Tm(fakeKey(r.feed.key, e)); }
                    return true;
                };
                listen(win, "blur", () => { for (const h of held.values()) Cm(fakeKey(h.key)); held.clear(); });
                ctx.onCleanup(() => { keyFilter = () => false; });

                // a click on a hotkey row presses its key once
                function pressHotkey(h) {
                    const ev = fakeKey(h.key);
                    Tm(ev);
                    Cm(ev);
                }

                // ---- panels, from the catalog ----
                const META = new Map(SETTINGS.map((s) => [s.key, s]));
                const OPTIONS = new Map();       // feature key -> its option settings
                for (const s of SETTINGS) if (s.parent) (OPTIONS.get(s.parent) || OPTIONS.set(s.parent, []).get(s.parent)).push(s);
                const ORDER = ["Combat", "Defense", "Building", "Movement", "Gear", "Overlay", "Renderer", "Chat", "Network"];
                const btnRow = (items) => ({ type: "btns", items });
                const infoRow = (label, keyText, desc) => ({ type: "info", label, keyText, desc });
                const PANELS = ORDER.map((cat) => ({
                    id: cat.toLowerCase(), name: cat,
                    rows: SETTINGS.filter((s) => s.category === cat && !s.parent)
                        .map((s) => ({ type: s.type === "boolean" ? "set" : "num", key: s.key }))
                }));
                PANELS.find((p) => p.id === "renderer").rows.unshift(btnRow([
                    { label: "MMP look", desc: "every visual on, drawn by the custom renderer", run: () => preset("mmp") },
                    { label: "stock look", cls: "blue", desc: "plain moomoo.io, nothing drawn on top (what you get on join)", run: () => preset("stock") }
                ]));
                PANELS.push({ id: "keys", name: "Keys", rows: HOTKEYS.map((h) => ({ type: "hot", hot: h })).concat([
                    infoRow("Zoom", "Q + wheel", "hold Q and use the mouse wheel (Custom Renderer). P resets it"),
                    infoRow("Walk Into Spikes", "Shift", "hold Shift and Spike Guard won't stop you"),
                    infoRow("Chat Log", "/", "jumps into the chat log's input (Chat Log on)")
                ]) });
                PANELS.push({ id: "menu", name: "Menu", rows: [
                    { type: "menukey", label: "Menu Key", desc: "the key that opens and closes this menu" },
                    { type: "pref", key: "toasts", label: "Toggle Pop-ups", desc: "a short on / off note at the top when a key bind flips a feature" },
                    btnRow([
                        { label: "reset layout", cls: "blue", desc: "put every panel back in its spot and unfold them", run: () => resetLayout() },
                        { label: "unstick", cls: "grey", desc: "clears a stuck combo / insta and forgets which hats MMP thinks you wear", run: () => { Kp("debug"); toast("combat state reset"); } }
                    ])
                ] });
                const labelOf = (key) => (META.get(key) && META.get(key).label) || key;
                const descOf = (key) => (META.get(key) && META.get(key).desc) || "";

                // ---- look (moomoo.io's own in-game boxes) ----
                const FONT = "\"Hammersmith One\", sans-serif";
                const CSS = `
                #mmjp-gui{position:fixed;inset:0;z-index:99990;display:none;pointer-events:none;background-color:#00000033;font-family:${FONT};color:#fff;-webkit-user-select:none;user-select:none}
                #mmjp-gui.open{display:block}
                #mmjp-gui .mp{position:absolute;width:236px;pointer-events:auto}
                #mmjp-gui .mp-head{display:flex;align-items:center;gap:7px;padding:7px 12px;font-size:21px;background-color:#00000040;border-radius:10px;cursor:pointer;transition:background-color .12s}
                #mmjp-gui .mp-head:hover{background-color:#32323240}
                #mmjp-gui .mp-head.drag{cursor:grabbing}
                #mmjp-gui .mp-count{font-size:15px;color:#a8a8a8}
                #mmjp-gui .mp-fold{margin-left:auto;width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #a8a8a8;transition:transform .12s}
                #mmjp-gui .mp.folded .mp-fold{transform:rotate(90deg)}
                #mmjp-gui .mp-body{margin-top:6px;padding:6px;background-color:#00000040;border-radius:10px;max-height:62vh;overflow-y:auto;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.45) transparent}
                #mmjp-gui .mp.folded .mp-body{display:none}
                #mmjp-gui.searching .mp.folded .mp-body{display:block}
                #mmjp-gui .mm-box+.mm-box{margin-top:4px}
                #mmjp-gui .mm{display:flex;align-items:center;gap:8px;padding:4px 9px;font-size:17px;border-radius:6px;cursor:pointer;white-space:nowrap;transition:background-color .12s}
                #mmjp-gui .mm:hover{background-color:#ffffff14}
                #mmjp-gui .mm.on{background-color:#7ee559;box-shadow:0 3px #62b846}
                #mmjp-gui .mm.on:hover{background-color:#6fc94e}
                #mmjp-gui .mm.info{cursor:default;font-size:15px;color:#a8a8a8}
                #mmjp-gui .mm.info:hover{background-color:transparent}
                #mmjp-gui .mm-name{overflow:hidden;text-overflow:ellipsis}
                #mmjp-gui .mm-key{margin-left:auto;flex:0 0 auto;font-size:13px;color:#a8a8a8}
                #mmjp-gui .mm.on .mm-key{color:#ecffe4}
                #mmjp-gui .mm-more{flex:0 0 auto;font-size:13px;color:#a8a8a8;margin-left:-2px}
                #mmjp-gui .mm.on .mm-more{color:#ecffe4}
                #mmjp-gui .mm-opts{margin:6px 2px 4px;padding:7px 9px;border-radius:6px;background-color:#00000033;font-size:14px;color:#dcdcdc;white-space:normal}
                #mmjp-gui .mm-desc{color:#bdbdbd;line-height:1.3}
                #mmjp-gui .mm-line{display:flex;align-items:center;gap:8px;margin-top:7px}
                #mmjp-gui .mm-line>span:first-child{flex:0 0 auto;max-width:112px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
                #mmjp-gui .mm-line input[type=range]{flex:1 1 auto;min-width:0;accent-color:#7ee559;cursor:pointer}
                #mmjp-gui .mm-line input[type=text],#mmjp-gui .mm-line input[type=number]{flex:1 1 auto;min-width:0;background-color:#00000040;border:0;border-radius:6px;color:#fff;font-family:inherit;font-size:14px;padding:3px 7px;outline:none}
                #mmjp-gui .mm-val{min-width:34px;text-align:right;color:#fff}
                #mmjp-gui .mm-sw{margin-left:auto;width:34px;height:18px;border-radius:9px;background-color:#00000059;position:relative;cursor:pointer;flex:0 0 auto;transition:background-color .12s}
                #mmjp-gui .mm-sw:after{content:"";position:absolute;left:3px;top:3px;width:12px;height:12px;border-radius:50%;background-color:#fff;transition:transform .12s}
                #mmjp-gui .mm-sw.on{background-color:#7ee559}
                #mmjp-gui .mm-sw.on:after{transform:translateX(16px)}
                #mmjp-gui .mm-bindbtn{margin-left:auto;padding:2px 10px;border-radius:6px;background-color:#00000040;color:#fff;cursor:pointer}
                #mmjp-gui .mm-bindbtn:hover{background-color:#32323240}
                #mmjp-gui .mm-bindbtn.grab{color:#7ee559}
                #mmjp-gui .mm-link{color:#80eefc;cursor:pointer}
                #mmjp-gui .mm-link:hover{color:#72d3e0}
                #mmjp-gui .mm-btns{display:flex;gap:6px;padding:2px 0 5px}
                #mmjp-gui .mm-btn{flex:1 1 0;text-align:center;font-size:15px;padding:5px 4px;border-radius:8px;background-color:#7ee559;box-shadow:0 3px #62b846;cursor:pointer;transition:transform .06s,box-shadow .06s,background-color .12s}
                #mmjp-gui .mm-btn:hover{background-color:#6fc94e}
                #mmjp-gui .mm-btn:active{transform:translateY(3px);box-shadow:0 0 #62b846}
                #mmjp-gui .mm-btn.blue{background-color:#5aa9e8;box-shadow:0 3px #4588c2}
                #mmjp-gui .mm-btn.blue:hover{background-color:#4f9ad6}
                #mmjp-gui .mm-btn.blue:active{box-shadow:0 0 #4588c2}
                #mmjp-gui .mm-btn.grey{background-color:#8a8a8a;box-shadow:0 3px #6a6a6a}
                #mmjp-gui .mm-btn.grey:hover{background-color:#7a7a7a}
                #mmjp-gui .mm-btn.grey:active{box-shadow:0 0 #6a6a6a}
                #mmjp-gui .mb{position:absolute;left:50%;top:12px;transform:translateX(-50%);display:flex;align-items:center;gap:12px;padding:6px 6px 6px 14px;border-radius:10px;background-color:#00000040;font-size:15px;color:#a8a8a8;white-space:nowrap;pointer-events:auto}
                #mmjp-gui .mb b{font-weight:normal;color:#fff;font-size:18px}
                #mmjp-gui .mb input{width:190px;background-color:#00000040;border:0;border-radius:8px;color:#fff;font-family:inherit;font-size:17px;padding:5px 10px;outline:none;-webkit-user-select:text;user-select:text}
                #mmjp-tip{position:fixed;z-index:99991;display:none;max-width:270px;padding:8px 11px;border-radius:8px;background-color:#000000b3;color:#fff;font-family:${FONT};font-size:14px;line-height:1.3;pointer-events:none}
                #mmjp-tip b{display:block;font-weight:normal;font-size:17px;margin-bottom:3px}
                #mmjp-tip i{display:block;font-style:normal;color:#a8a8a8;margin-top:5px;font-size:13px}
                #mmjp-toast{position:fixed;left:50%;top:90px;transform:translateX(-50%);z-index:99991;padding:6px 14px;border-radius:8px;background-color:#00000040;color:#fff;font-family:${FONT};font-size:20px;pointer-events:none;opacity:0;transition:opacity .2s}
                #mmjp-toast.show{opacity:1}
                #mmjp-toast .t-on{color:#7ee559}
                #mmjp-toast .t-off{color:#ee5551}
                `;

                // ---- the DOM ----
                const PANEL_W = 236;
                const gui = { root: null, open: false, laidOut: false, panels: [], tip: null, toast: null, search: null, z: 1 };
                function mk(tag, cls) { const n = doc.createElement(tag); if (cls) n.className = cls; return n; }

                function tipOn(node, title, text, extra) {
                    node.addEventListener("mouseenter", (e) => showTip(e, title, typeof text === "function" ? text() : text, typeof extra === "function" ? extra() : extra));
                    node.addEventListener("mousemove", moveTip);
                    node.addEventListener("mouseleave", hideTip);
                }
                function showTip(e, title, text, extra) {
                    const t = gui.tip;
                    if (!t || (!text && !extra)) return;
                    t.textContent = "";
                    const b = mk("b"); b.textContent = title; t.appendChild(b);
                    if (text) t.appendChild(doc.createTextNode(text));
                    if (extra) { const i = mk("i"); i.textContent = extra; t.appendChild(i); }
                    t.style.display = "block";
                    moveTip(e);
                }
                function moveTip(e) {
                    const t = gui.tip;
                    if (!t || t.style.display !== "block") return;
                    const W = win.innerWidth || 1280, H = win.innerHeight || 720;
                    let x = e.clientX + 16, y = e.clientY + 16;
                    if (x + t.offsetWidth > W - 8) x = e.clientX - 16 - t.offsetWidth;
                    if (y + t.offsetHeight > H - 8) y = H - 8 - t.offsetHeight;
                    t.style.left = Math.max(8, x) + "px";
                    t.style.top = Math.max(8, y) + "px";
                }
                function hideTip() { if (gui.tip) gui.tip.style.display = "none"; }

                let toastTimer = 0;
                function toast(text, state) {
                    const t = gui.toast;
                    if (!t) return;
                    t.textContent = "";
                    const a = mk("span"); a.textContent = text; t.appendChild(a);
                    if (state !== undefined) { const b = mk("span", state ? "t-on" : "t-off"); b.textContent = state ? " on" : " off"; t.appendChild(b); }
                    t.classList.add("show");
                    clearTimeout(toastTimer);
                    toastTimer = setTimeout(() => { t.classList.remove("show"); }, 1200);
                }
                ctx.onCleanup(() => clearTimeout(toastTimer));

                // ---- rows ----
                function buildRow(spec) {
                    const box = mk("div", "mm-box");
                    const row = { spec, box, module: spec.type !== "btns" && spec.type !== "info", opts: null, paints: [], words: "", update() {} };
                    if (spec.type === "btns") {
                        const line = mk("div", "mm-btns");
                        for (const b of spec.items) {
                            const btn = mk("div", "mm-btn" + (b.cls ? " " + b.cls : ""));
                            btn.textContent = b.label;
                            btn.addEventListener("click", () => b.run());
                            tipOn(btn, b.label, b.desc);
                            line.appendChild(btn);
                        }
                        box.appendChild(line);
                        row.words = spec.items.map((b) => b.label).join(" ").toLowerCase();
                        return row;
                    }
                    const r = mk("div", "mm");
                    const name = mk("span", "mm-name");
                    const tag = mk("span", "mm-key");
                    r.appendChild(name);
                    box.appendChild(r);
                    const label = spec.key ? labelOf(spec.key) : spec.hot ? spec.hot.label : spec.label;
                    name.textContent = label;
                    const subs = spec.key ? (OPTIONS.get(spec.key) || []) : [];
                    if (subs.length) { const more = mk("span", "mm-more"); more.textContent = "⚙"; r.appendChild(more); }
                    r.appendChild(tag);
                    row.words = (label + " " + (spec.key || "") + " " + (spec.key ? descOf(spec.key) : spec.desc || "") + " " + subs.map((s) => s.label).join(" ")).toLowerCase();
                    const toggleOpts = () => {
                        if (row.opts) { row.opts.remove(); row.opts = null; row.paints = []; }
                        else { row.opts = buildOpts(row); box.appendChild(row.opts); }
                        restack();
                    };
                    r.addEventListener("contextmenu", (e) => { e.preventDefault(); toggleOpts(); });

                    if (spec.type === "set") {
                        r.addEventListener("click", () => flip(spec.key, false));
                        row.update = () => {
                            r.classList.toggle("on", !!ctx.settings[spec.key]);
                            tag.textContent = prefs.binds[spec.key] ? keyLabel(prefs.binds[spec.key]) : "";
                        };
                        tipOn(r, label, () => descOf(spec.key), subs.length ? "right click: options and a key bind" : "right click: a key bind");
                    } else if (spec.type === "num") {
                        r.addEventListener("click", toggleOpts);
                        row.update = () => { const val = ctx.settings[spec.key]; tag.textContent = val === "" || val == null ? "" : String(val); };
                        tipOn(r, label, () => descOf(spec.key), "click: change it");
                    } else if (spec.type === "hot") {
                        const h = spec.hot;
                        r.addEventListener("click", () => { if (h.hold) toggleOpts(); else pressHotkey(h); });
                        row.update = () => {
                            r.classList.toggle("on", !!(h.state && h.state()));
                            tag.textContent = keyLabel(hotKey(h));
                        };
                        row.words += " " + keyLabel(hotKey(h)).toLowerCase() + " " + (h.desc || "").toLowerCase();
                        tipOn(r, label, h.desc, h.hold ? "right click: change the key" : "click: same as pressing it. right click: change the key");
                    } else if (spec.type === "pref") {
                        r.addEventListener("click", () => { prefs[spec.key] = !prefs[spec.key]; savePrefs(); refresh(); });
                        row.update = () => { r.classList.toggle("on", !!prefs[spec.key]); };
                        tipOn(r, label, spec.desc);
                    } else if (spec.type === "menukey") {
                        r.addEventListener("click", () => {
                            tag.textContent = "press a key…";
                            grabKey((id) => assign("menu", null, id), tag);
                        });
                        row.update = () => { if (!isGrabbing(tag)) tag.textContent = keyLabel(prefs.menuKey); };
                        tipOn(r, label, spec.desc, "click, then press the new key");
                    } else if (spec.type === "info") {
                        r.classList.add("info");
                        tag.textContent = spec.keyText;
                        tipOn(r, label, spec.desc);
                    }
                    return row;
                }

                // the options box: description, every option (slider / switch / field), key bind
                function buildOpts(row) {
                    const s = row.spec, o = mk("div", "mm-opts");
                    o.addEventListener("contextmenu", (e) => e.preventDefault());
                    const text = s.type === "hot" ? s.hot.desc : descOf(s.key);
                    if (text) { const d = mk("div", "mm-desc"); d.textContent = text; o.appendChild(d); }
                    if (s.type === "num") o.appendChild(fieldLine(s.key, true, row));
                    for (const sub of (s.key ? OPTIONS.get(s.key) || [] : [])) o.appendChild(fieldLine(sub.key, false, row));
                    if (s.type === "set") o.appendChild(bindLine(row, "key bind", () => prefs.binds[s.key] || "", (id) => assign("bind", s.key, id)));
                    if (s.type === "hot") {
                        const h = s.hot;
                        o.appendChild(bindLine(row, "key", () => hotKey(h), (id) => assign("hot", h.id, id), h.def || h.key));
                    }
                    return o;
                }

                // one option: a slider (number with a range), a switch (on / off) or a text field
                function fieldLine(key, bare, row) {
                    const meta = META.get(key) || { type: "string", label: key };
                    const line = mk("div", "mm-line");
                    if (!bare) { const lab = mk("span"); lab.textContent = meta.label || key; line.appendChild(lab); if (meta.desc) tipOn(lab, meta.label, meta.desc); }
                    if (meta.type === "boolean") {
                        const sw = mk("span", "mm-sw");
                        const paint = () => sw.classList.toggle("on", !!ctx.settings[key]);
                        sw.addEventListener("click", () => { ctx.setSetting(key, !ctx.settings[key]); paint(); });
                        row.paints.push(paint);
                        paint();
                        line.appendChild(sw);
                    } else if (meta.type === "number" && meta.min != null && meta.max != null) {
                        const range = mk("input");
                        range.type = "range";
                        range.min = String(meta.min);
                        range.max = String(meta.max);
                        range.step = String(meta.step != null ? meta.step : 1);
                        const val = mk("span", "mm-val");
                        const paint = () => { if (doc.activeElement === range) return; range.value = String(num(key)); val.textContent = String(num(key)); };
                        range.addEventListener("input", () => { val.textContent = range.value; });
                        range.addEventListener("change", () => { ctx.setSetting(key, parseFloat(range.value)); range.blur(); });
                        row.paints.push(paint);
                        paint();
                        line.appendChild(range);
                        line.appendChild(val);
                        if (meta.default != null) {
                            const back = mk("span", "mm-link");
                            back.textContent = "↺";
                            back.addEventListener("click", () => { ctx.setSetting(key, meta.default); paint(); });
                            tipOn(back, "default", "back to " + meta.default);
                            line.appendChild(back);
                        }
                    } else {
                        const field = mk("input");
                        field.type = meta.type === "number" ? "number" : "text";
                        field.value = ctx.settings[key] == null ? "" : String(ctx.settings[key]);
                        field.addEventListener("change", () => {
                            const raw = field.value;
                            ctx.setSetting(key, meta.type === "number" ? (raw === "" ? "" : parseFloat(raw)) : raw);
                        });
                        field.addEventListener("keydown", (e) => { e.stopPropagation(); if (e.key === "Enter") field.blur(); });
                        line.appendChild(field);
                    }
                    return line;
                }

                function bindLine(row, label, get, set, def) {
                    const line = mk("div", "mm-line");
                    const lab = mk("span");
                    lab.textContent = label;
                    line.appendChild(lab);
                    if (def !== undefined) {
                        const back = mk("span", "mm-link");
                        back.textContent = "default";
                        back.addEventListener("click", () => set(def));
                        tipOn(back, "default", "back to " + keyLabel(def));
                        line.appendChild(back);
                    }
                    const btn = mk("span", "mm-bindbtn");
                    line.appendChild(btn);
                    const paint = () => {
                        if (isGrabbing(btn)) return;
                        btn.classList.remove("grab");
                        btn.textContent = keyLabel(get());
                    };
                    btn.addEventListener("click", () => {
                        btn.classList.add("grab");
                        btn.textContent = "press a key…";
                        grabKey((id) => { set(id); paint(); }, btn);
                    });
                    tipOn(btn, label, "click, then press a key", "Backspace or Delete clears it, Esc cancels");
                    row.paints.push(paint);
                    paint();
                    return line;
                }

                // ---- binding a key ----
                let grabbing = null, grabEl = null;
                const isGrabbing = (node) => !!grabbing && grabEl === node;
                function stopGrab() { grabbing = null; grabEl = null; refresh(); }
                function grabKey(done, node) { grabbing = done; grabEl = node || null; }
                function onGrab(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (/^(Shift|Control|Alt|Meta|CapsLock|OS)$/.test(e.key)) return;      // wait for the real key
                    const done = grabbing;
                    grabbing = null;
                    grabEl = null;
                    if (e.key === "Escape") return done(undefined);
                    if (e.key === "Backspace" || e.key === "Delete") return done("");
                    done(keyIdOf(e));
                }
                // one key, one job: a new bind takes the key away from whatever had it
                function assign(kind, name, id) {
                    if (id === undefined) return refresh();
                    if (kind === "menu" && !id) return refresh();
                    if (id && kind !== "menu" && isMenuKey(id)) { toast(keyLabel(id) + " opens this menu"); return refresh(); }
                    if (id) {
                        for (const k in prefs.binds) if (prefs.binds[k] === id && !(kind === "bind" && k === name)) delete prefs.binds[k];
                        for (const h of HOTKEYS) if (hotKey(h) === id && !(kind === "hot" && h.id === name)) prefs.hotkeys[h.id] = "";
                    }
                    if (kind === "bind") { if (id) prefs.binds[name] = id; else delete prefs.binds[name]; }
                    else if (kind === "hot") prefs.hotkeys[name] = id;
                    else prefs.menuKey = id;
                    savePrefs();
                    rebuildKeys();
                    refresh();
                }

                function flip(key, fromKey) {
                    const now = !ctx.settings[key];
                    ctx.setSetting(key, now);
                    if (fromKey && prefs.toasts) toast(labelOf(key), now);
                }
                function preset(name) {
                    const vals = VISUAL_PRESETS[name];
                    for (const k in vals) if (ctx.settings[k] !== vals[k]) ctx.setSetting(k, vals[k]);
                    toast(name === "stock" ? "stock look" : "MMP look");
                }

                // ---- panels ----
                function buildPanel(def) {
                    const p = { id: def.id, el: mk("div", "mp"), head: mk("div", "mp-head"), body: mk("div", "mp-body"), count: mk("span", "mp-count"), rows: [], x: 0, y: 0, fold: false, col: 0 };
                    const title = mk("span");
                    title.textContent = def.name;
                    p.head.appendChild(title);
                    p.head.appendChild(p.count);
                    p.head.appendChild(mk("span", "mp-fold"));
                    p.el.appendChild(p.head);
                    p.el.appendChild(p.body);
                    p.el.addEventListener("contextmenu", (e) => e.preventDefault());
                    p.el.addEventListener("mousedown", () => { p.el.style.zIndex = String(++gui.z); }, true);
                    for (const spec of def.rows) {
                        const row = buildRow(spec);
                        p.rows.push(row);
                        p.body.appendChild(row.box);
                    }
                    const saved = prefs.panels[p.id];
                    if (saved && saved.fold) { p.fold = true; p.el.classList.add("folded"); }
                    dragHead(p);
                    return p;
                }
                // Panels sit in columns across the top ("docked"): opening a feature's
                // options or folding a panel moves the ones under it, so nothing
                // overlaps. Drag a panel out and it stays wherever you drop it.
                const COL_GAP = 12, TOP = 64;      // TOP: under the search bar
                function place(p, x, y) {
                    const W = win.innerWidth || 1280, H = win.innerHeight || 720;
                    p.x = Math.round(Math.min(Math.max(x, 60 - PANEL_W), W - 60));
                    p.y = Math.round(Math.min(Math.max(y, 0), H - 34));
                    p.el.style.left = p.x + "px";
                    p.el.style.top = p.y + "px";
                }
                function columns() {
                    const W = win.innerWidth || 1280;
                    const colW = PANEL_W + COL_GAP, cols = Math.max(1, Math.floor((W - 24) / colW));
                    return { colW, cols, left: Math.max(12, Math.floor((W - cols * colW + COL_GAP) / 2)) };
                }
                function savePanel(p) {
                    prefs.panels[p.id] = p.col == null ? { free: true, x: p.x, y: p.y, fold: p.fold } : { col: p.col, fold: p.fold };
                    savePrefs();
                }
                function setFold(p, on2) { p.fold = on2; p.el.classList.toggle("folded", on2); }
                // put every docked panel under the one above it in its column
                function restack() {
                    if (!gui.open) return;
                    const { colW, cols, left } = columns();
                    const ys = new Array(cols).fill(TOP);
                    for (const p of gui.panels) {
                        if (p.col == null || p.el.style.display === "none") continue;
                        const c = Math.min(p.col, cols - 1);
                        place(p, left + c * colW, ys[c]);
                        ys[c] = p.y + p.el.offsetHeight + COL_GAP;
                    }
                }
                function dragHead(p) {
                    p.head.addEventListener("mousedown", (e) => {
                        if (e.button !== 0) return;
                        e.preventDefault();
                        const sx = e.clientX, sy = e.clientY, ox = p.x, oy = p.y;
                        let moved = false;
                        const move = (ev) => {
                            if (!moved && Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) < 4) return;
                            moved = true;
                            p.col = null;          // out of its column for good
                            p.head.classList.add("drag");
                            hideTip();
                            place(p, ox + ev.clientX - sx, oy + ev.clientY - sy);
                        };
                        const up = () => {
                            win.removeEventListener("mousemove", move, true);
                            win.removeEventListener("mouseup", up, true);
                            p.head.classList.remove("drag");
                            if (!moved) setFold(p, !p.fold);
                            savePanel(p);
                            restack();
                        };
                        win.addEventListener("mousemove", move, true);
                        win.addEventListener("mouseup", up, true);
                    });
                }
                // First open: each panel goes under the shortest column; one that would
                // run off the bottom of the screen starts folded. Later opens keep the
                // columns (and the spots of panels you dragged out).
                function layout(reset) {
                    const H = win.innerHeight || 720;
                    const { cols } = columns();
                    if (reset) prefs.panels = {};
                    const height = new Array(cols).fill(TOP);
                    for (const p of gui.panels) {
                        const saved = prefs.panels[p.id];
                        if (saved && saved.free && typeof saved.x === "number") { p.col = null; place(p, saved.x, saved.y); continue; }
                        let c;
                        if (saved && typeof saved.col === "number") c = Math.min(saved.col, cols - 1);
                        else { c = 0; for (let i = 1; i < cols; i++) if (height[i] < height[c]) c = i; }
                        p.col = c;
                        if (p.el.style.display === "none") continue;
                        if (!saved && !p.fold && height[c] + p.el.offsetHeight > H - 70) setFold(p, true);
                        height[c] += p.el.offsetHeight + COL_GAP;
                        if (!saved) savePanel(p);
                    }
                    restack();
                }
                function resetLayout() {
                    for (const p of gui.panels) setFold(p, false);
                    layout(true);
                }

                function applyFilter() {
                    if (!gui.root) return;
                    const q = gui.search ? gui.search.value.trim().toLowerCase() : "";
                    gui.root.classList.toggle("searching", !!q);
                    for (const p of gui.panels) {
                        let shown = 0, any = 0;
                        for (const row of p.rows) {
                            const ok = !q || row.words.indexOf(q) >= 0;
                            row.box.style.display = ok ? "" : "none";
                            if (ok) { any++; if (row.module) shown++; }
                        }
                        p.count.textContent = "[" + shown + "]";
                        p.el.style.display = any ? "" : "none";
                    }
                    restack();
                }
                function refresh() {
                    for (const p of gui.panels) for (const row of p.rows) { row.update(); for (const paint of row.paints) paint(); }
                }

                function buildGui() {
                    if (gui.root) return true;
                    if (menuDead || !doc.body || !doc.head) return false;
                    const style = mk("style");
                    style.id = "mmjp-style";
                    style.textContent = CSS;
                    doc.head.appendChild(style);
                    const root = mk("div");
                    root.id = "mmjp-gui";
                    gui.root = root;
                    for (const def of PANELS) {
                        const p = buildPanel(def);
                        gui.panels.push(p);
                        root.appendChild(p.el);
                    }
                    // top bar: name, how it works, search
                    const bar = mk("div", "mb");
                    const ttl = mk("b");
                    ttl.textContent = "MooMooPlus";
                    const search = mk("input");
                    search.type = "text";
                    search.placeholder = "search";
                    search.spellcheck = false;
                    search.addEventListener("input", applyFilter);
                    search.addEventListener("keydown", (e) => { e.stopPropagation(); if (e.key === "Enter") search.blur(); if (e.key === "Escape") { search.blur(); closeGui(); } });
                    gui.search = search;
                    bar.appendChild(ttl);
                    bar.appendChild(search);
                    tipOn(bar, "MooMooPlus", "click a feature: on / off. right click: what it does, its options (⚙) and a key bind. drag a panel by its header to move it, click the header to fold it", keyLabel(prefs.menuKey) + " or Esc closes the menu");
                    root.appendChild(bar);
                    const tip = mk("div");
                    tip.id = "mmjp-tip";
                    gui.tip = tip;
                    const toastEl = mk("div");
                    toastEl.id = "mmjp-toast";
                    gui.toast = toastEl;
                    doc.body.appendChild(root);
                    doc.body.appendChild(tip);
                    doc.body.appendChild(toastEl);
                    ctx.onCleanup(() => { style.remove(); root.remove(); tip.remove(); toastEl.remove(); gui.root = null; gui.open = false; });
                    return true;
                }
                (function waitBody() { if (!menuDead && !buildGui()) setTimeout(waitBody, 50); })();

                function openGui() {
                    if (!buildGui()) return;
                    gui.open = true;
                    gui.root.classList.add("open");
                    applyFilter();
                    refresh();
                    if (!gui.laidOut) { layout(false); gui.laidOut = true; }
                    else { for (const p of gui.panels) if (p.col == null) place(p, p.x, p.y); restack(); }
                }
                function closeGui() {
                    if (!gui.root) return;
                    gui.open = false;
                    gui.root.classList.remove("open");
                    grabbing = null;
                    grabEl = null;
                    hideTip();
                    if (gui.search && doc.activeElement === gui.search) gui.search.blur();
                }

                // live state: settings changed elsewhere (Mods tab, a bind) and the
                // feature code's own key toggles
                ctx.onSettingChange && ctx.onSettingChange(() => { if (gui.open) refresh(); });
                ctx.every(200, () => { if (gui.open) refresh(); });
                listen(win, "resize", () => {
                    if (!gui.open) return;
                    for (const p of gui.panels) if (p.col == null) place(p, p.x, p.y);
                    restack();
                });

                // clicking anywhere else while a bind waits for its key cancels it
                listen(win, "mousedown", (e) => { if (grabbing && e.target !== grabEl) stopGrab(); }, true);

                // ---- the keys: menu key, Escape, binds ----
                listen(win, "keydown", function (e) {
                    if (e.isTrusted === false) return;
                    if (grabbing) { onGrab(e); return; }
                    if (e.key === "Escape") {
                        // Esc closes this menu; with it shut, Esc is moomoo.io's own again
                        if (gui.open) { e.stopPropagation(); closeGui(); }
                        return;
                    }
                    if (typing() || e.ctrlKey || e.metaKey || e.altKey) return;
                    const id = keyIdOf(e);
                    if (isMenuKey(id)) { if (!e.repeat) (gui.open ? closeGui() : openGui()); return; }
                    if (e.repeat) return;
                    for (const k in prefs.binds) if (prefs.binds[k] === id) flip(k, true);
                }, true);

                // for the debug view / tests
                menuApi = { open: openGui, close: closeGui, isOpen: () => gui.open, panels: () => PANELS.map((p) => p.name) };
            })();
