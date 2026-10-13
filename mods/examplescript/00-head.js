/*
 * examplescript — the bundle's mod, ported 1-1 onto moomoo.js.
 * ============================================================
 * Source of truth: examplescript.js at the repo root ("the bundle"), a modified
 * MooMoo.io client with a large combat mod woven into it. Every feature here is a
 * line-for-line port of the bundle's code, running on the loader's engines:
 *   ctx.combat   the bundle's player model + tick pipeline (combat.js)
 *   ctx.objects  the bundle's world objects (objectmanager.js)
 *   ctx.store    owned / equipped hats (store.js)
 *   ctx.onOutgoing  takeover of the official client's own packets
 *
 * The bundle's minified names are kept on purpose (z = you, Y = target, Q = nearby
 * objects, ee/A = primary/secondary weapon, p = combo busy, g[0] = pending aim, ...),
 * so any line can be checked against the bundle side by side. A glossary sits in
 * 10-env.js. Where the bundle and this server disagree on the wire, the bundle's
 * intent is translated to the server's convention (e.g. store equip/buy).
 *
 * Built from mods/examplescript/*.js by mods/build-examplescript.mjs.
 * Bots are not ported (by request). Config menu: Escape (as in the bundle) or the gear.
 */
(function () {
    "use strict";

    // The bundle's menu, tab for tab and in its order. Labels are the setting keys,
    // exactly as the bundle stored them; defaults are the bundle's (a toggle is ON
    // unless the bundle passed false).
    const T = (label, def, category, hint) => ({ key: label, label, type: "boolean", default: def, category, hint });
    const SETTINGS = [
        // ---- Combat ----
        T("auto break", true, "Combat"), T("stop on break", true, "Combat"), T("auto place", true, "Combat"),
        T("auto replace", false, "Combat"), T("auto push", true, "Combat"), T("polearm aids", true, "Combat"),
        T("aids spike sync", false, "Combat"), T("melee sync", false, "Combat"), T("bleed insta", false, "Combat"),
        T("apple insta", false, "Combat"), T("kbInsta", true, "Combat"), T("kbInsta without turret gear", false, "Combat"),
        T("kbAssist", false, "Combat"), T("stop break", true, "Combat"), T("stop on collision", false, "Combat"),
        T("movement on collision", false, "Combat"), T("strict soldier", true, "Combat"), T("strict monkey", true, "Combat"),
        T("auto equip fastest weapon", true, "Combat"), T("break spike trap", true, "Combat"), T("Auto Emp", true, "Combat"),
        T("autohat", true, "Combat"),
        { key: "APA", label: "APA", type: "number", min: 20, max: 180, step: 1, default: 50, category: "Combat" },
        // ---- heal ----
        T("auto heal", true, "heal"), T("autoQ", false, "heal"),
        // ---- Visuals ----
        T("reload bars", false, "Visuals"), T("packet count", true, "Visuals"), T("all visuals", true, "Visuals"),
        T("no outline arcs", true, "Visuals"), T("no arcs", true, "Visuals"), T("reload arcs", true, "Visuals"),
        T("smooth reloads", true, "Visuals"), T("building hp", true, "Visuals"), T("building owner", true, "Visuals"),
        T("mill rotate", false, "Visuals"), T("regular grid", true, "Visuals"), T("stacked damages", true, "Visuals"),
        T("stacked heal text", true, "Visuals"), T("show place duration", false, "Visuals"), T("log autoplace", false, "Visuals"),
        T("spike kb visual", true, "Visuals"), T("skull", true, "Visuals"), T("shame count", true, "Visuals"),
        T("log projectiles", false, "Visuals"), T("shadows", true, "Visuals"), T("animated text", true, "Visuals"),
        T("ChatLog", true, "Visuals"), T("vis aim", true, "Visuals"), T("hide name", true, "Visuals"),
        T("See through player", true, "Visuals"), T("Shaders", false, "Visuals"), T("Legacy Visuals", false, "Visuals"),
        T("Default Visuals", false, "Visuals"), T("Op Visuals", false, "Visuals"),
        // ---- Keybinds (the bundle's quest widgets) ----
        T("Toggle Quest 1", true, "Keybinds"),
        { key: "Quest Progress", label: "Quest Progress", type: "number", default: "", category: "Keybinds" },
        T("Toggle Quest 2", true, "Keybinds"),
        { key: "Quest Reward", label: "Quest Reward", type: "string", default: "", category: "Keybinds" },
        T("Toggle Quest 3", true, "Keybinds"),
        { key: "Quest Difficulty", label: "Quest Difficulty", type: "number", default: "", category: "Keybinds" },
        // ---- Throttles ----
        { key: "Auto Place Accuracy", label: "Auto Place Accuracy", type: "number", min: 20, max: 180, step: 1, default: 50,
            category: "Throttles", hint: "higher means longer calculation time ↓" },
        // ---- Extra ----
        T("Assassin", false, "Extra"), T("send ws", true, "Extra"), T("autobuy", true, "Extra"), T("fix ws", true, "Extra"),
        T("fakePing", false, "Extra"),
        { key: "pingSlider", label: "fake ping (ms)", type: "number", min: 0, max: 100, step: 1, default: 40, category: "Extra" }
    ];

    function boot(MooMoo) {
        MooMoo.register({
            id: "examplescript",
            name: "Example Script",
            version: "1.0.0",
            description: "The bundle's combat / heal / visuals / extra features, ported 1-1.",
            menu: true,
            liveSettings: true,
            defaultEnabled: true,
            settings: SETTINGS
        }, function (ctx) {
