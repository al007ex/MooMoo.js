/*
 * MooMooPlus (MMP) — combat, defense, movement and visuals for moomoo.js.
 * ======================================================================
 * The features come from "the bundle" (a modified MooMoo.io client with a big
 * combat mod woven into it, kept outside this repo) and run on the loader's
 * engines:
 *   ctx.combat   player model + tick pipeline (shame timing, reloads, dmg potentials)
 *   ctx.objects  world objects        ctx.store  owned / worn hats
 *   ctx.path     A* pathfinder         ctx.render overlay layers / whole-frame renderer
 *   ctx.onOutgoing  takeover of the official client's own packets
 *
 * Files (concatenated in name order into one scope by mods/build-moomooplus.mjs):
 *   00-head     this catalog: every setting, its name, panel, description, options
 *   10-env      shared state + helpers        11-packet   sending (limiter, wire translation)
 *   20-world    buildings + placement checks  30-input    keys, mouse, zoom
 *   40-targeting damage / knockback / placement potentials
 *   50-placement auto place + auto replace     55-movement auto push
 *   60-combat   the per-tick brain: instas, heal, hats, break, emp
 *   70-chat     chat log + ping display        80..84      rendering
 *   85-menu     the M menu                    90-debug    test-only state view
 *
 * Inside the feature code the bundle's short names are kept (z = you, Y = target,
 * ee/A = primary/secondary weapon, p = combo busy, ...; glossary in 10-env.js),
 * so any line can still be checked against the bundle.
 *
 * Joining shows the plain moomoo.io look; everything that draws is opt-in.
 */
(function () {
    "use strict";

    // ---- the catalog ----
    // key       stored name (kept from the bundle so saved settings carry over)
    // label     what the menus show
    // category  M menu panel        desc  what it does (menu tooltip / options box)
    // parent    an option of that feature: shown in its options box (right click)
    // basic     also shown in the in-game Mods tab
    const F = (key, label, def, category, desc, more) => Object.assign({ key, label, type: "boolean", default: def, category, desc }, more || {});
    const N = (key, label, def, min, max, step, category, desc, more) => Object.assign({ key, label, type: "number", default: def, min, max, step, category, desc }, more || {});
    const opt = (parent) => ({ parent });

    const SETTINGS = [
        // ---- Combat: instas + weapons ----
        F("kbInsta", "Knockback Insta", true, "Combat", "polearm + turret gear: when a hit would knock your target into a spike, swap to turret gear and hit with both weapons"),
        F("apple insta", "Apple Insta", false, "Combat", "polearm + great hammer on a target in a soldier helmet, once both weapons and your turret gear are reloaded"),
        F("bleed insta", "Bleed Insta", false, "Combat", "polearm + great hammer timed to your target's bull helmet bleed tick (needs ruby)"),
        F("polearm aids", "Trap Combo", true, "Combat", "your target is stuck in your trap: hammer the trap and hit them with the polearm in the same tick"),
        F("auto equip fastest weapon", "Fastest Weapon", true, "Combat", "when nothing else is going on, hold whichever weapon swings faster"),

        // ---- Defense: heal + escaping traps ----
        F("auto heal", "Auto Heal", true, "Defense", "eats when your health drops to what you could take next tick, and tops you up after fights", { basic: true }),
        N("healBelow", "top up below", 85, 40, 99, 1, "Defense", "top up when your health is under this (outside sandbox)", opt("auto heal")),
        N("healEmergency", "instant heal at", 69, 20, 90, 1, "Defense", "at or under this, eat right away even if it costs shame", opt("auto heal")),
        F("healShameSafe", "shame-safe timing", true, "Defense", "time routine top-ups so they never land in the server's 120 ms shame window (keeps you off the shame hat)", opt("auto heal")),
        N("healMaxShame", "stop at shame", 7, 1, 7, 1, "Defense", "stop eating at this shame count (8 = the shame hat and no eating for 30 s)", opt("auto heal")),
        F("autoQ", "Predictive Heal", false, "Defense", "on high ping: eat ahead of damage that's already on its way"),
        N("autoQPing", "only above ping", 95, 0, 300, 5, "Defense", "only predicts heals when your ping is at least this", opt("autoQ")),
        F("auto break", "Auto Break", true, "Defense", "stuck in an enemy trap: aim at it and break it with your best weapon"),
        F("break spike trap", "Break Spike First", true, "Defense", "stuck in a trap with an enemy spike next to you: break the spike first"),
        F("stop break", "Spike Guard", true, "Defense", "stops you before you walk into an enemy spike (hold Shift to walk anyway) and breaks that spike"),

        // ---- Building ----
        F("auto place", "Auto Place", true, "Building", "with a pit trap in your bar: places traps and spikes around your target while they're close", { basic: true }),
        N("Auto Place Accuracy", "accuracy", 50, 20, 180, 1, "Building", "angles tried per half turn when looking for a spot. higher finds better spots but costs more time", opt("auto place")),
        F("auto replace", "Auto Replace", true, "Building", "a building breaks near you and your target: put a spike or trap in its spot"),
        N("replaceRange", "range", 190, 100, 400, 5, "Building", "only replaces buildings this close to you", opt("auto replace")),

        // ---- Movement ----
        F("auto push", "Auto Push", true, "Movement", "your target is in your trap next to a spike: walk into them so they get pushed onto it (L pauses it)", { basic: true }),
        F("stop on collision", "Push Until Spike", false, "Movement", "on: push until they hit the spike. off: only push while you're lined up behind them and safe yourself"),
        F("movement on collision", "Keep Pushing", false, "Movement", "keep pushing after your target hits the spike"),

        // ---- Gear ----
        F("autohat", "Auto Hat", true, "Gear", "soldier helmet when it matters, otherwise the hat for where you are (winter cap, flipper, booster) with the monkey tail", { basic: true }),
        N("hatRange", "soldier range", 400, 150, 900, 10, "Gear", "how close your target has to be before the soldier helmet goes on", opt("autohat")),
        F("strict soldier", "Strict Soldier", true, "Gear", "only wear soldier with your target in range and you out of water. off: also whenever you could take 100+ damage or stand still", opt("autohat")),
        F("strict monkey", "Keep Monkey Tail", true, "Gear", "keep the monkey tail near enemies. off: shadow wings when your target is in range", opt("autohat")),
        F("Auto Emp", "Auto EMP", true, "Gear", "a loaded enemy turret near you: wear the EMP helmet"),
        N("empRange", "turret range", 700, 300, 1200, 10, "Gear", "how close an enemy turret has to be (plus your speed)", opt("Auto Emp")),
        F("Assassin", "Stealth", false, "Gear", "standing still at full health with nothing going on: assassin gear, so you turn invisible"),
        F("autobuy", "Auto Buy", true, "Gear", "sandbox: buys the hat and tail list as soon as you have the gold (store closed)"),

        // ---- Overlay: drawn on top of the normal picture ----
        F("all visuals", "Info Overlay", false, "Overlay", "extra info on top of the game: sids, gain / leak, shame count, reload arcs, target marker, knockback rings, placement previews, death ghosts and minimap extras", { basic: true }),
        F("building hp", "Building Health", false, "Overlay", "health bars on damaged buildings near you"),
        F("building owner", "Building Owner", false, "Overlay", "the owner's sid on buildings near you"),
        F("spike kb visual", "Knockback Preview", false, "Overlay", "ghosts where a hit would knock players"),
        F("reload bars", "Packet Bar", false, "Overlay", "a bar under you with the packets you sent this second (needs Info Overlay)"),
        F("reload arcs", "Reload Arcs", true, "Overlay", "reload arcs around players (Info Overlay + Light Theme)"),
        F("shame count", "Shame Counter", true, "Overlay", "the shame counter next to players (Info Overlay + Light Theme)"),
        F("no arcs", "Real Item Previews", true, "Overlay", "placement previews as the real item instead of a colored circle"),
        F("no outline arcs", "Spike Outlines", true, "Overlay", "spike previews keep their spiky outline (with Real Item Previews)"),
        F("Default Visuals", "Light Theme", false, "Overlay", "lighter look: blue tint, no grid, fewer labels"),
        F("Legacy Visuals", "Legacy Colors", false, "Overlay", "old colors: white names, red and blue building labels, wider health bars"),

        // ---- Renderer: the custom renderer and what only it can do ----
        F("bundle renderer", "Custom Renderer", false, "Renderer", "draw the whole game ourselves: tint, grid, sprites, neon health bars, names, chat bubbles, damage text and zoom (Q + wheel). the options below need it", { basic: true }),
        F("regular grid", "Normal Grid", true, "Renderer", "the normal grid (off: one line every 1440)"),
        F("Shaders", "No Tint", false, "Renderer", "turns off the purple screen tint"),
        F("shadows", "Shadows", true, "Renderer", "drop shadows on weapons, hats and animals"),
        F("hide name", "Hide Names", true, "Renderer", "no player names"),
        F("See through player", "See-Through Players", true, "Renderer", "players at 67% so you can see what's under them"),
        F("mill rotate", "Spinning Mills", false, "Renderer", "windmills spin"),
        F("stacked damages", "Stack Damage", true, "Renderer", "one damage number per player per tick instead of one per hit"),
        F("skull", "Skull On Big Hits", true, "Renderer", "a skull instead of the number when a hit does 100+ (needs Stack Damage)"),
        F("stacked heal text", "Stack Heals", true, "Renderer", "heals add up into one green number per tick"),

        // ---- Chat ----
        F("ChatLog", "Chat Log", false, "Chat", "a log of every chat line plus MMP's own messages (insta fired, heals, ...). / jumps into it"),
        N("chatLogLines", "lines kept", 2000, 50, 5000, 50, "Chat", "older lines get dropped past this many", opt("ChatLog")),
        F("log projectiles", "Log Projectiles", false, "Chat", "writes every projectile hit into the chat log"),

        // ---- Network ----
        F("fakePing", "Fake Ping", false, "Network", "the ping display shows a made-up higher ping"),
        N("fakePingBase", "added ping", 90, 0, 400, 5, "Network", "always added on top", opt("fakePing")),
        N("pingSlider", "random extra", 40, 0, 200, 1, "Network", "plus this much again plus a random bit up to it", opt("fakePing"))
    ];

    // Visual presets: "mmp" = every visual on (custom renderer included),
    // "stock" = the plain moomoo.io look.
    const VISUAL_PRESETS = {
        mmp: {
            "bundle renderer": true, "reload bars": false, "all visuals": true,
            "no outline arcs": true, "no arcs": true, "reload arcs": true,
            "building hp": true, "building owner": true, "mill rotate": false, "regular grid": true,
            "stacked damages": true, "stacked heal text": true,
            "spike kb visual": true, "skull": true, "shame count": true, "log projectiles": false, "shadows": true,
            "ChatLog": true, "hide name": true, "See through player": true,
            "Shaders": false, "Legacy Visuals": false, "Default Visuals": false
        },
        stock: {
            "bundle renderer": false, "all visuals": false, "building hp": false, "building owner": false,
            "spike kb visual": false, "ChatLog": false
        }
    };

    function boot(MooMoo, MooMooLoader) {
        MooMoo.register({
            id: "moomooplus",
            name: "MooMooPlus",
            version: "1.3.0",
            description: "Combat, defense, movement and visuals. Press M for the menu.",
            menu: true,
            menuHint: "Every feature, its options and key binds are in the MMP menu — press M in game.",
            liveSettings: true,
            defaultEnabled: true,
            settings: SETTINGS
        }, function (ctx) {
