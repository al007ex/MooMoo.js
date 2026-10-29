// ==UserScript==
// @name         moomoo.js Loader
// @namespace    moomoo.js
// @version      1.3.3
// @description  moomoo.js mod loader — hooks the game socket and exposes window.MooMoo for mods. Update this file when the server's packets change.
// @author       al007ex
// @match        *://*/*
// @run-at       document-start
// @inject-into  page
// @grant        none
// ==/UserScript==
//
// EDIT @match to your private server's origin, e.g.  // @match https://play.myserver.io/*
// Host this file somewhere your plugins can @require it (or paste it as its own
// userscript). See the README.

(function bootstrap(){
  function core(){
  "use strict";
  // Dedup across separately-injected mods that each @require the loader: ask (over the
  // same handshake event) whether a loader is already live here, and bow out if so.
  // This leaves no marker on window — the probe surface stays empty.
  try {
    var present = false;
    window.dispatchEvent(new CustomEvent("moomoo.js:api", { detail: { resolve: function(){ present = true; } } }));
    if (present) return;
  } catch (e) {}
  var __ns = {};
  (function(self, globalThis, module, exports, require){
/* ===== module: vocabulary (shared/vocabulary.js) ===== */
/*
 * moomoo.js — PACKET VOCABULARY  (the stable contract)
 * ====================================================
 * This file names every semantic
 * packet the game has (a health update, a chat message, a spawn, ...) and the
 * shape of its payload. It knows NOTHING about the wire: no packet letters, no
 * crypto, no argument order on the socket.
 *
 * Mods are written against the names in here. Because this file never changes,
 * a mod written today keeps working forever. When the private server changes
 * its wire protocol, only the LOADER's binding (loader/src/binding.js) is
 * updated to keep pointing the same wire packet at the same name below.
 *
 *   wire bytes  --(loader: binding)-->  semantic name + payload  --(mod)-->
 *
 * Universal module: works as an ES import, a CommonJS require, or a plain
 * <script> (attaches window.MooMooVocabulary).
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooVocabulary = value;
    /* eslint-disable no-undef */
    if (typeof globalThis !== "undefined") globalThis.MooMooVocabulary = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    // Helper to describe a parameter: name + type + human description.
    const p = (name, type, desc) => ({ name, type, desc });

    /*
     * INCOMING packets (server -> client). Mods subscribe to these with
     *   MooMoo.on("<event>", handler)    (or ctx.on inside a registered mod)
     *
     * `normalized: true`  -> the loader hands you tidy named fields; the loader
     *                        insulates you from wire changes. Safe to rely on.
     * `normalized: false`  -> "passthrough": you receive the raw decoded argument
     *                        array as `args`. Full access to every packet, but
     *                        the shape can shift between server builds.
     */
    const EVENTS = {
        setup: {
            summary: "You joined / spawned. Carries YOUR own player slot id (sid).",
            normalized: true,
            params: [p("sid", "number", "your own player slot id")]
        },
        init: {
            summary: "Initial game data sent right after connecting.",
            normalized: false,
            params: [p("data", "any", "raw init payload")]
        },
        disconnect: {
            summary: "The server is dropping you. Carries a reason string.",
            normalized: true,
            params: [p("reason", "string", "why you were disconnected")]
        },
        health: {
            summary: "A player's health changed. Fires for you and for others in view.",
            normalized: true,
            params: [
                p("sid", "number", "whose health changed"),
                p("value", "number", "the new health value")
            ]
        },
        playerAdd: {
            summary: "A player entered your view (or you spawned).",
            normalized: true,
            params: [
                p("data", "array", "raw player data array"),
                p("isYou", "boolean", "true if this player is you")
            ]
        },
        playerRemove: {
            summary: "A player left your view.",
            normalized: true,
            params: [p("sid", "number", "the player that left")]
        },
        playersUpdate: {
            summary: "Per-tick movement + attribute update for everyone in view.",
            normalized: true,
            params: [
                p("positions", "array", "[{sid,x,y,dir}] current positions"),
                p("attributes", "array", "[{sid,buildIndex,weaponIndex,variant,team,isLeader,skin,tail,icon,zIndex}] (only changed)"),
                p("hidden", "array", "sids that are no longer visible")
            ]
        },
        playerValue: {
            summary: "A named value about you changed (points, kills, wood, food, ...).",
            normalized: true,
            params: [
                p("key", "string", "which value, e.g. 'points', 'kills', 'wood'"),
                p("value", "number", "the new value"),
                p("updateView", "boolean", "whether the HUD should flash it")
            ]
        },
        health_regen: { // reserved alias slot; kept for forward-compat, maps to nothing by default
            summary: "(reserved)",
            normalized: false,
            params: [p("args", "array", "raw arguments")],
            hidden: true
        },
        upgrades: {
            summary: "Your available upgrade points / current upgrade age.",
            normalized: true,
            params: [
                p("points", "number", "upgrade points available"),
                p("age", "number", "current upgrade age")
            ]
        },
        inventory: {
            summary: "Your item list or weapon list was replaced.",
            normalized: true,
            params: [
                p("list", "array", "the ids you now own"),
                p("isWeapon", "boolean", "true = weapons list, false = items list")
            ]
        },
        age: {
            summary: "Your XP / age progress.",
            normalized: false,
            params: [p("args", "array", "[xp, maxXp?, age?]")]
        },
        died: {
            summary: "You died. No payload.",
            normalized: true,
            params: []
        },
        chat: {
            summary: "A chat message was said by a player.",
            normalized: true,
            params: [
                p("sid", "number", "who said it"),
                p("message", "string", "the chat text")
            ]
        },
        showText: {
            summary: "Floating world text (damage numbers, gold gained, ...).",
            normalized: true,
            params: [
                p("x", "number", "world x"),
                p("y", "number", "world y"),
                p("value", "number", "the number shown"),
                p("type", "number", "text type/colour hint")
            ]
        },
        mapPing: {
            summary: "A teammate pinged the map.",
            normalized: true,
            params: [p("x", "number", "ping x"), p("y", "number", "ping y")]
        },
        leaderboard: { summary: "Leaderboard refresh.", normalized: false, params: [p("args", "array", "raw arguments; args[0] is flat [sid,name,score,...]")] },
        objectsLoad: { summary: "New world objects entered view.", normalized: false, params: [p("args", "array", "raw arguments; args[0] is flat object data, 8 fields each")] },
        animalsUpdate: { summary: "Animal/AI movement + state update.", normalized: false, params: [p("args", "array", "raw arguments; args[0] is flat animal data")] },
        animalAttack: { summary: "An animal played its attack animation.", normalized: false, params: [p("args", "array", "raw arguments")] },
        gatherAnimation: { summary: "A player played a gather/attack swing.", normalized: false, params: [p("args", "array", "raw arguments")] },
        wiggle: { summary: "An object wiggled (was hit).", normalized: false, params: [p("args", "array", "raw arguments")] },
        turretShoot: { summary: "A turret fired.", normalized: false, params: [p("args", "array", "raw arguments")] },
        objectKilled: { summary: "One object was destroyed.", normalized: false, params: [p("args", "array", "raw arguments")] },
        objectsKilled: { summary: "Several objects were destroyed.", normalized: false, params: [p("args", "array", "raw arguments")] },
        itemCount: { summary: "Placed-item count changed (e.g. windmills).", normalized: false, params: [p("args", "array", "raw arguments")] },
        projectileAdd: { summary: "A projectile spawned.", normalized: false, params: [p("args", "array", "raw arguments")] },
        projectileRemove: { summary: "A projectile despawned.", normalized: false, params: [p("args", "array", "raw arguments")] },
        shutdownNotice: { summary: "Server shutdown countdown.", normalized: false, params: [p("args", "array", "raw arguments")] },
        tribeAdd: { summary: "A tribe was created.", normalized: false, params: [p("args", "array", "raw arguments")] },
        tribeDelete: { summary: "A tribe was deleted.", normalized: false, params: [p("args", "array", "raw arguments")] },
        tribeJoinRequest: { summary: "Someone asked to join your tribe.", normalized: false, params: [p("args", "array", "raw arguments")] },
        tribeSet: { summary: "Your tribe membership changed.", normalized: false, params: [p("args", "array", "raw arguments")] },
        tribeMembers: { summary: "Your tribe's member list.", normalized: false, params: [p("args", "array", "raw arguments")] },
        storeUpdate: { summary: "A hat/accessory was bought or equipped.", normalized: false, params: [p("args", "array", "raw arguments")] },
        minimap: { summary: "Minimap dots for your tribe.", normalized: false, params: [p("args", "array", "raw arguments")] },
        pong: { summary: "Reply to your ping (latency probe).", normalized: true, params: [] },
        effect: { summary: "A visual effect was triggered.", normalized: false, params: [p("args", "array", "raw arguments")] },
        stats: { summary: "Live stats card for a watched player.", normalized: false, params: [p("args", "array", "raw arguments")] },
        profile: { summary: "A player's profile card (reply to watchStats).", normalized: false, params: [p("args", "array", "raw arguments")] },
        probes: { summary: "Server integrity probes; the client answers with telemetry. The loader handles this.", normalized: true, params: [p("salt", "number", "this round's salt"), p("probes", "array", "the probe checks")] },
        updateCountdown: { summary: "A new build is out; countdown to the forced reload.", normalized: false, params: [p("args", "array", "raw arguments")] },
        dive: { summary: "A player dived under / surfaced (water).", normalized: true, params: [p("sid", "number", "player sid"), p("state", "number", "0 surface, 1 diving, 2 under, 3 surfacing")] }
    };

    /*
     * OUTGOING packets (client -> server). Mods trigger these with
     *   MooMoo.send.<action>(<params...>)
     */
    const ACTIONS = {
        spawn: {
            summary: "Spawn into the game.",
            params: [
                p("name", "string", "display name"),
                p("moofoll", "boolean", "the pre-game 'moofoll' toggle"),
                p("skin", "number", "chosen skin colour index")
            ]
        },
        aim: { summary: "Face a direction (radians).", params: [p("dir", "number", "aim angle in radians")] },
        move: { summary: "Move in a direction (radians), or null to stop.", params: [p("dir", "number", "move angle in radians, or null")] },
        stopMove: { summary: "Stop moving (window-blur style reset).", params: [] },
        mouse: {
            summary: "Press/release the attack button, optionally with a build direction.",
            params: [p("down", "boolean", "is the button held"), p("dir", "number", "build/aim direction or null")]
        },
        selectItem: {
            summary: "Select a weapon or buildable item.",
            params: [p("index", "number", "item/weapon id"), p("isWeapon", "boolean", "true = weapon")]
        },
        upgrade: { summary: "Choose an upgrade.", params: [p("index", "number", "upgrade index")] },
        toggle: { summary: "Toggle 0 = lock rotation, 1 = auto gather.", params: [p("which", "number", "0 or 1")] },
        createTribe: { summary: "Create a tribe.", params: [p("name", "string", "tribe name")] },
        leaveTribe: { summary: "Leave your tribe.", params: [] },
        joinTribe: { summary: "Ask to join a tribe.", params: [p("name", "string", "tribe name")] },
        answerJoin: { summary: "Accept/deny a join request.", params: [p("sid", "number", "requester"), p("accept", "boolean", "accept?")] },
        kickMember: { summary: "Kick a tribe member.", params: [p("sid", "number", "member sid")] },
        store: {
            summary: "Buy (0) or equip (1) a hat/accessory.",
            params: [p("action", "number", "0 buy, 1 equip"), p("id", "number", "hat/accessory id"), p("isAccessory", "boolean", "true = accessory/tail")]
        },
        chat: { summary: "Say something in chat.", params: [p("message", "string", "chat text")] },
        pingMap: { summary: "Ping the map for your tribe.", params: [] },
        ping: { summary: "Latency probe; replies with `pong`.", params: [] },
        watchStats: { summary: "Watch another player's live stats card (-1 = none).", params: [p("sid", "number", "player to watch, or -1")] },
        report: { summary: "Report / staff action (advanced).", params: [p("args", "array", "raw report arguments")], advanced: true },
        admin: { summary: "Admin command (requires admin role).", params: [p("args", "array", "raw admin arguments")], advanced: true },
        anon: { summary: "Turn anonymous mode on/off (signed-in players).", params: [p("on", "boolean", "true = anonymous")] }
    };

    return {
        version: 1,
        events: EVENTS,
        actions: ACTIONS,
        // Convenience lists for tooling that enumerates the vocabulary.
        eventNames: Object.keys(EVENTS).filter((k) => !EVENTS[k].hidden),
        actionNames: Object.keys(ACTIONS),
        isEvent: (name) => Object.prototype.hasOwnProperty.call(EVENTS, name) && !EVENTS[name].hidden,
        isAction: (name) => Object.prototype.hasOwnProperty.call(ACTIONS, name)
    };
});


/* ===== module: gamedata (shared/gamedata.js) ===== */
/*
 * moomoo.js — GAME DATA  (weapons, items, projectiles, hats, accessories, animals)
 * =======================================================================
 * Ported entry-for-entry from the private server's own config
 * (server `shared/config/items.js` + `shared/config/store.js`), which is itself
 * copied from the official client bundle. This is the data combat/auto-hat/
 * auto-equip features need: ids, stats, costs, reload speeds, hat effects.
 *
 * Pure data + id/name lookups. No game logic lives here — features read from it.
 *
 * Universal module: ES import, CommonJS require, or a plain <script>
 * (attaches window.MooMooGameData).
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooGameData = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooGameData = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    // ---- item groups (placeable categories) ----
    const groups = [
        { id: 0, name: "food", layer: 0 },
        { id: 1, name: "walls", place: true, limit: 30, layer: 0 },
        { id: 2, name: "spikes", place: true, limit: 15, layer: 0 },
        { id: 3, name: "mill", place: true, limit: 7, sandboxLimit: 299, layer: 1 },
        { id: 4, name: "mine", place: true, limit: 1, layer: 0 },
        { id: 5, name: "trap", place: true, limit: 6, layer: -1 },
        { id: 6, name: "booster", place: true, limit: 12, sandboxLimit: 299, layer: -1 },
        { id: 7, name: "turret", place: true, limit: 2, layer: 1 },
        { id: 8, name: "watchtower", place: true, limit: 12, layer: 1 },
        { id: 9, name: "buff", place: true, limit: 4, layer: -1 },
        { id: 10, name: "spawn", place: true, limit: 1, layer: -1 },
        { id: 11, name: "sapling", place: true, limit: 2, layer: 0 },
        { id: 12, name: "blocker", place: true, limit: 3, layer: -1 },
        { id: 13, name: "teleporter", place: true, limit: 2, sandboxLimit: 299, layer: -1 }
    ];

    // ---- projectiles ----
    const projectiles = [
        { indx: 0, layer: 0, src: "arrow_1", dmg: 25, speed: 1.6, scale: 103, range: 1000 },
        { indx: 1, layer: 1, dmg: 25, speed: 1.5, scale: 20 },   // turret: speed 1.5 is the bundle's edit (range stays undefined, as there)
        { indx: 0, layer: 0, src: "arrow_1", dmg: 35, speed: 2.5, scale: 103, range: 1200 },
        { indx: 0, layer: 0, src: "arrow_1", dmg: 30, speed: 2, scale: 103, range: 1200 },
        { indx: 1, layer: 1, dmg: 16, scale: 20 },
        { indx: 0, layer: 0, src: "bullet_1", dmg: 50, speed: 3.6, scale: 160, range: 1400 }
    ];

    // ---- weapons (id = index; type 0 = primary/melee, type 1 = secondary) ----
    // Server stats, plus the fields the bundle's combat math added to the table:
    // uF (upgrade-compatibility ids, read by its damage predictor), dmg/projSpd on
    // the ranged weapons, shield dmg 0 / speed 1 (keeps its reload finite), and
    // spdMult 1 on the tool hammer and bat.
    // `speed` is the swing/reload time in ms. `spdMult` is the movement multiplier.
    const weapons = [
        { id: 0, type: 0, spdMult: 1, uF: [], name: "tool hammer", desc: "tool for gathering all resources", src: "hammer_1", length: 140, width: 140, xOff: -3, yOff: 18, dmg: 25, range: 65, gather: 1, speed: 300 },
        { id: 1, type: 0, uF: [0], age: 2, name: "hand axe", desc: "gathers resources at a higher rate", src: "axe_1", length: 140, width: 140, xOff: 3, yOff: 24, dmg: 30, spdMult: 1, range: 70, gather: 2, speed: 400 },
        { id: 2, type: 0, uF: [1, 0, 15, 12, 13, null], age: 8, pre: 1, name: "great axe", desc: "deal more damage and gather more resources", src: "great_axe_1", length: 140, width: 140, xOff: -8, yOff: 25, dmg: 35, spdMult: 1, range: 75, gather: 4, speed: 400 },
        { id: 3, type: 0, uF: [0, 4], age: 2, name: "short sword", desc: "increased attack power but slower move speed", src: "sword_1", iPad: 1.3, length: 130, width: 210, xOff: -8, yOff: 46, dmg: 35, spdMult: 0.85, range: 110, gather: 1, speed: 300 },
        { id: 4, type: 0, uF: [3, 0, 15, 12, 13, null, 9], age: 8, pre: 3, name: "katana", desc: "greater range and damage", src: "samurai_1", iPad: 1.3, length: 130, width: 210, xOff: -8, yOff: 59, dmg: 40, spdMult: 0.8, range: 118, gather: 1, speed: 300 },
        { id: 5, type: 0, uF: [0], age: 2, name: "polearm", desc: "long range melee weapon", src: "spear_1", iPad: 1.3, length: 130, width: 210, xOff: -8, yOff: 53, dmg: 45, knock: 0.2, spdMult: 0.82, range: 142, gather: 1, speed: 700 },
        { id: 6, type: 0, spdMult: 1, uF: [0], age: 2, name: "bat", desc: "fast long range melee weapon", src: "bat_1", iPad: 1.3, length: 110, width: 180, xOff: -8, yOff: 53, dmg: 20, knock: 0.7, range: 110, gather: 1, speed: 300 },
        { id: 7, type: 0, uF: [0], age: 2, name: "daggers", desc: "really fast short range weapon", src: "dagger_1", iPad: 0.8, length: 110, width: 110, xOff: 18, yOff: 0, dmg: 20, knock: 0.1, range: 65, gather: 1, hitSlow: 0.1, spdMult: 1.13, speed: 100 },
        { id: 8, type: 0, uF: [0], age: 2, name: "stick", desc: "great for gathering but very weak", src: "stick_1", length: 140, width: 140, xOff: 3, yOff: 24, dmg: 1, spdMult: 1, range: 70, gather: 7, speed: 400 },
        { id: 9, type: 1, dmg: 25, projSpd: 1.6, uF: [null], age: 6, name: "hunting bow", desc: "bow used for ranged combat and hunting", src: "bow_1", req: ["wood", 4], length: 120, width: 120, xOff: -6, yOff: 0, projectile: 0, spdMult: 0.75, speed: 600 },
        { id: 10, type: 1, uF: [null], age: 6, name: "great hammer", desc: "hammer used for destroying structures", src: "great_hammer_1", length: 140, width: 140, xOff: -9, yOff: 25, dmg: 10, spdMult: 0.88, range: 75, sDmg: 7.5, gather: 1, speed: 400 },
        { id: 11, type: 1, dmg: 0, speed: 1, uF: [null], age: 6, name: "wooden shield", desc: "blocks projectiles and reduces melee damage", src: "shield_1", length: 120, width: 120, shield: 0.2, xOff: 6, yOff: 0, spdMult: 0.7 },
        { id: 12, type: 1, dmg: 35, projSpd: 2.5, uF: [9, null, 4], age: 8, pre: 9, name: "crossbow", desc: "deals more damage and has greater range", src: "crossbow_1", req: ["wood", 5], aboveHand: true, armS: 0.75, length: 120, width: 120, xOff: -4, yOff: 0, projectile: 2, spdMult: 0.7, speed: 700 },
        { id: 13, type: 1, dmg: 30, projSpd: 2, uF: [12, 9, null, 4, 2], age: 9, pre: 12, name: "repeater crossbow", desc: "high firerate crossbow with reduced damage", src: "crossbow_2", req: ["wood", 10], aboveHand: true, armS: 0.75, length: 120, width: 120, xOff: -4, yOff: 0, projectile: 3, spdMult: 0.7, speed: 230 },
        { id: 14, type: 1, uF: [null], age: 6, name: "mc grabby", desc: "steals resources from enemies", src: "grab_1", length: 130, width: 210, xOff: -8, yOff: 53, dmg: 0, steal: 250, knock: 0.2, spdMult: 1.05, range: 125, gather: 0, speed: 700 },
        { id: 15, type: 1, dmg: 50, projSpd: 3.6, uF: [12, 9, null, 4, 2], age: 9, pre: 12, name: "musket", desc: "slow firerate but high damage and range", src: "musket_1", req: ["stone", 10], aboveHand: true, rec: 0.35, armS: 0.6, hndS: 0.3, hndD: 1.6, length: 205, width: 205, xOff: 25, yOff: 0, projectile: 5, hideProjectile: true, spdMult: 0.6, speed: 1500 }
    ];

    // ---- items (buildables + food). id = index. `heal` added for food. ----
    const items = [
        { group: 0, name: "apple", desc: "restores 20 health when consumed", req: ["food", 10], heal: 20, scale: 22, holdOffset: 15 },
        { age: 3, group: 0, name: "cookie", desc: "restores 40 health when consumed", req: ["food", 15], heal: 40, scale: 27, holdOffset: 15 },
        { age: 7, group: 0, name: "cheese", desc: "restores 30 health and another 50 over 5 seconds", req: ["food", 25], heal: 30, scale: 27, holdOffset: 15 },
        { group: 1, name: "wood wall", desc: "provides protection for your village", req: ["wood", 10], projDmg: true, health: 380, scale: 50, holdOffset: 20, placeOffset: -5 },
        { age: 3, group: 1, name: "stone wall", desc: "provides improved protection for your village", req: ["stone", 25], health: 900, scale: 50, holdOffset: 20, placeOffset: -5 },
        { age: 7, pre: 1, group: 1, name: "castle wall", desc: "provides powerful protection for your village", req: ["stone", 35], health: 1500, scale: 52, holdOffset: 20, placeOffset: -5 },
        { group: 2, name: "spikes", desc: "damages enemies when they touch them", req: ["wood", 20, "stone", 5], health: 400, dmg: 20, scale: 49, spritePadding: -23, holdOffset: 8, placeOffset: -5 },
        { age: 5, group: 2, name: "greater spikes", desc: "damages enemies when they touch them", req: ["wood", 30, "stone", 10], health: 500, dmg: 35, scale: 52, spritePadding: -23, holdOffset: 8, placeOffset: -5 },
        { age: 9, pre: 1, group: 2, name: "poison spikes", desc: "poisons enemies when they touch them", req: ["wood", 35, "stone", 15], health: 600, dmg: 30, pDmg: 5, scale: 52, spritePadding: -23, holdOffset: 8, placeOffset: -5 },
        { age: 9, pre: 2, group: 2, name: "spinning spikes", desc: "damages enemies when they touch them", req: ["wood", 30, "stone", 20], health: 500, dmg: 45, turnSpeed: 0.003, scale: 52, spritePadding: -23, holdOffset: 8, placeOffset: -5 },
        { group: 3, name: "windmill", desc: "generates gold over time", req: ["wood", 50, "stone", 10], health: 400, pps: 1, turnSpeed: 0.0016, spritePadding: 25, iconLineMult: 12, scale: 45, holdOffset: 20, placeOffset: 5 },
        { age: 5, pre: 1, group: 3, name: "faster windmill", desc: "generates more gold over time", req: ["wood", 60, "stone", 20], health: 500, pps: 1.5, turnSpeed: 0.0025, spritePadding: 25, iconLineMult: 12, scale: 47, holdOffset: 20, placeOffset: 5 },
        { age: 8, pre: 1, group: 3, name: "power mill", desc: "generates more gold over time", req: ["wood", 100, "stone", 50], health: 800, pps: 2, turnSpeed: 0.005, spritePadding: 25, iconLineMult: 12, scale: 47, holdOffset: 20, placeOffset: 5 },
        { age: 5, group: 4, type: 2, name: "mine", desc: "allows you to mine stone", req: ["wood", 20, "stone", 100], iconLineMult: 12, scale: 65, holdOffset: 20, placeOffset: 0 },
        { age: 5, group: 11, type: 0, name: "sapling", desc: "allows you to farm wood", req: ["wood", 150], iconLineMult: 12, colDiv: 0.5, scale: 110, holdOffset: 50, placeOffset: -15 },
        { age: 4, group: 5, name: "pit trap", desc: "pit that traps enemies if they walk over it", req: ["wood", 30, "stone", 30], trap: true, ignoreCollision: true, hideFromEnemy: true, health: 500, colDiv: 0.2, scale: 50, holdOffset: 20, placeOffset: -5 },
        { age: 4, group: 6, name: "boost pad", desc: "provides boost when stepped on", req: ["stone", 20, "wood", 5], ignoreCollision: true, boostSpeed: 1.5, health: 150, colDiv: 0.7, scale: 45, holdOffset: 20, placeOffset: -5 },
        { age: 7, group: 7, doUpdate: true, name: "turret", desc: "defensive structure that shoots at enemies", req: ["wood", 200, "stone", 150], health: 800, projectile: 1, shootRange: 700, shootRate: 2200, scale: 43, holdOffset: 20, placeOffset: -5 },
        { age: 7, group: 8, name: "platform", desc: "platform to shoot over walls and cross over water", req: ["wood", 20], ignoreCollision: true, zIndex: 1, health: 300, scale: 43, holdOffset: 20, placeOffset: -5 },
        { age: 7, group: 9, name: "healing pad", desc: "standing on it will slowly heal you", req: ["wood", 30, "food", 10], ignoreCollision: true, healCol: 15, health: 400, colDiv: 0.7, scale: 45, holdOffset: 20, placeOffset: -5 },
        { age: 9, group: 10, name: "spawn pad", desc: "you will spawn here when you die but it will dissapear", req: ["wood", 100, "stone", 100], health: 400, ignoreCollision: true, spawnPoint: true, scale: 45, holdOffset: 20, placeOffset: -5 },
        { age: 7, group: 12, name: "blocker", desc: "blocks building in radius", req: ["wood", 30, "stone", 25], ignoreCollision: true, blocker: 300, health: 400, colDiv: 0.7, scale: 45, holdOffset: 20, placeOffset: -5 },
        { age: 7, group: 13, name: "teleporter", desc: "teleports you to a random point on the map", req: ["wood", 60, "stone", 60], ignoreCollision: true, teleport: true, health: 200, colDiv: 0.7, scale: 45, holdOffset: 20, placeOffset: -5 }
    ];
    // assign ids + resolve `pre` (prerequisite item id), exactly like the server does.
    for (let i = 0; i < items.length; i++) {
        items[i].id = i;
        items[i].group = groups[items[i].group];
        if (items[i].pre) items[i].pre = i - items[i].pre;
    }

    // ---- hats (store id, not index) ----
    const hats = [
        { id: 45, name: "Shame!", dontSell: true, price: 0, scale: 120, desc: "hacks are for losers" },
        { id: 51, name: "Moo Cap", price: 0, scale: 120, desc: "coolest mooer around" },
        { id: 50, name: "Apple Cap", price: 0, scale: 120, desc: "apple farms remembers" },
        { id: 28, name: "Moo Head", price: 0, scale: 120, desc: "no effect" },
        { id: 29, name: "Pig Head", price: 0, scale: 120, desc: "no effect" },
        { id: 30, name: "Fluff Head", price: 0, scale: 120, desc: "no effect" },
        { id: 36, name: "Pandou Head", price: 0, scale: 120, desc: "no effect" },
        { id: 37, name: "Bear Head", price: 0, scale: 120, desc: "no effect" },
        { id: 38, name: "Monkey Head", price: 0, scale: 120, desc: "no effect" },
        { id: 44, name: "Polar Head", price: 0, scale: 120, desc: "no effect" },
        { id: 35, name: "Fez Hat", price: 0, scale: 120, desc: "no effect" },
        { id: 42, name: "Enigma Hat", price: 0, scale: 120, desc: "join the enigma army" },
        { id: 43, name: "Blitz Hat", price: 0, scale: 120, desc: "hey everybody i'm blitz" },
        { id: 49, name: "Bob XIII Hat", price: 0, scale: 120, desc: "like and subscribe" },
        { id: 57, name: "Pumpkin", price: 50, scale: 120, desc: "Spooooky" },
        { id: 8, name: "Bummle Hat", price: 100, scale: 120, desc: "no effect" },
        { id: 2, name: "Straw Hat", price: 500, scale: 120, desc: "no effect" },
        { id: 15, name: "Winter Cap", price: 600, scale: 120, desc: "allows you to move at normal speed in snow", coldM: 1 },
        { id: 5, name: "Cowboy Hat", price: 1000, scale: 120, desc: "no effect" },
        { id: 4, name: "Ranger Hat", price: 2000, scale: 120, desc: "no effect" },
        { id: 18, name: "Explorer Hat", price: 2000, scale: 120, desc: "no effect" },
        { id: 31, name: "Flipper Hat", price: 2500, scale: 120, desc: "have more control while in water", watrImm: true },
        { id: 1, name: "Marksman Cap", price: 3000, scale: 120, desc: "increases arrow speed and range", aMlt: 1.3 },
        { id: 10, name: "Bush Gear", price: 3000, scale: 160, desc: "allows you to disguise yourself as a bush" },
        { id: 48, name: "Halo", price: 3000, scale: 120, desc: "no effect" },
        { id: 6, name: "Soldier Helmet", price: 4000, scale: 120, desc: "reduces damage taken but slows movement", spdMult: 0.94, dmgMult: 0.75 },
        { id: 59, name: "Scout Hat", price: 3500, scale: 120, desc: "move faster but take more damage", spdMult: 1.08, dmgMult: 1.12 },
        { id: 23, name: "Anti Venom Gear", price: 4000, scale: 120, desc: "makes you immune to poison", poisonRes: 1 },
        { id: 13, name: "Medic Gear", price: 5000, scale: 110, desc: "slowly regenerates health over time", healthRegen: 3 },
        { id: 9, name: "Miners Helmet", price: 5000, scale: 120, desc: "earn 1 extra gold per resource", extraGold: 1 },
        { id: 32, name: "Musketeer Hat", price: 5000, scale: 120, desc: "reduces cost of projectiles", projCost: 0.5 },
        { id: 7, name: "Bull Helmet", price: 6000, scale: 120, desc: "increases damage done but drains health", healthRegen: -5, dmgMultO: 1.5, spdMult: 0.96 },
        { id: 22, name: "Emp Helmet", price: 6000, scale: 120, desc: "turrets won't attack but you move slower", antiTurret: 1, spdMult: 0.7 },
        { id: 12, name: "Booster Hat", price: 6000, scale: 120, desc: "increases your movement speed", spdMult: 1.16 },
        { id: 26, name: "Barbarian Armor", price: 8000, scale: 120, desc: "knocks back enemies that attack you", dmgK: 0.6 },
        { id: 60, name: "Frost Helm", price: 7000, scale: 120, desc: "normal speed in snow and reduces damage taken", coldM: 1, spdMult: 0.94, dmgMult: 0.88 },
        { id: 61, name: "Crab Shell", dontSell: true, earned: true, price: 0, scale: 120, desc: "dropped by the Crab King. reflects damage and reduces damage taken", dmg: 0.3, dmgMult: 0.85, spdMult: 0.92 },
        { id: 21, name: "Plague Mask", price: 10000, scale: 120, desc: "melee attacks deal poison damage", poisonDmg: 5, poisonTime: 6 },
        { id: 46, name: "Bull Mask", price: 10000, scale: 120, desc: "bulls won't target you unless you attack them", bullRepel: 1 },
        { id: 14, name: "Windmill Hat", topSprite: true, price: 10000, scale: 120, desc: "generates points while worn", pps: 1.5 },
        { id: 11, name: "Spike Gear", topSprite: true, price: 10000, scale: 120, desc: "deal damage to players that damage you", dmg: 0.45 },
        { id: 53, name: "Turret Gear", topSprite: true, price: 10000, scale: 120, desc: "you become a walking turret", turret: { proj: 1, range: 700, rate: 2500 }, spdMult: 0.7 },
        { id: 20, name: "Samurai Armor", price: 12000, scale: 120, desc: "increased attack speed and fire rate", atkSpd: 0.78 },
        { id: 58, name: "Dark Knight", price: 12000, scale: 120, desc: "restores health when you deal damage", healD: 0.4 },
        { id: 27, name: "Scavenger Gear", price: 15000, scale: 120, desc: "earn double points for each kill", kScrM: 2 },
        { id: 40, name: "Tank Gear", price: 15000, scale: 120, desc: "increased damage to buildings but slower movement", spdMult: 0.3, bDmg: 3.3 },
        { id: 52, name: "Thief Gear", price: 15000, scale: 120, desc: "steal half of a players gold when you kill them", goldSteal: 0.5 },
        { id: 55, name: "Bloodthirster", price: 20000, scale: 120, desc: "Restore Health when dealing damage. And increased damage", healD: 0.25, dmgMultO: 1.2 },
        { id: 56, name: "Assassin Gear", price: 20000, scale: 120, desc: "Go invisible when not moving. Can't eat. Increased speed", noEat: true, spdMult: 1.1, invisTimer: 1000 }
    ];

    // ---- accessories / tails (store id, not index) ----
    const accessories = [
        { id: 12, name: "Snowball", price: 1000, scale: 105, xOff: 18, desc: "half the snow slowdown" },
        { id: 9, name: "Tree Cape", price: 1000, scale: 90, desc: "1 extra wood per hit on a tree" },
        { id: 10, name: "Stone Cape", price: 1000, scale: 90, desc: "1 extra stone per hit on a rock" },
        { id: 3, name: "Cookie Cape", price: 1500, scale: 90, desc: "1 extra food per hit on a bush or cactus" },
        { id: 8, name: "Cow Cape", price: 2000, scale: 90, desc: "1.5x gold and food from cows" },
        { id: 11, name: "Monkey Tail", price: 2000, scale: 97, xOff: 25, desc: "Super speed but reduced damage", spdMult: 1.35, dmgMultO: 0.2 },
        { id: 17, name: "Apple Basket", price: 3000, scale: 80, xOff: 12, desc: "slowly regenerates health over time", healthRegen: 1 },
        { id: 6, name: "Winter Cape", price: 3000, scale: 90, desc: "no snow slowdown" },
        { id: 4, name: "Skull Cape", price: 4000, scale: 90, desc: "3x gold for killing the kill leader" },
        { id: 5, name: "Dash Cape", price: 5000, scale: 90, desc: "5% faster" },
        { id: 2, name: "Dragon Cape", price: 6000, scale: 90, desc: "5% more damage for 5s after hitting a player" },
        { id: 1, name: "Super Cape", price: 8000, scale: 90, desc: "after a kill: 5% more damage and 15% faster for 10s" },
        { id: 7, name: "Troll Cape", price: 8000, scale: 90, desc: "2x gold for kills by your spikes" },
        { id: 14, name: "Thorns", price: 10000, scale: 115, xOff: 20, desc: "heals a little when you hit a player" },
        { id: 15, name: "Blockades", price: 10000, scale: 95, xOff: 15, desc: "25% less damage from projectiles" },
        { id: 20, name: "Devils Tail", price: 10000, scale: 95, xOff: 20, desc: "hits make players bleed for 2s" },
        { id: 16, name: "Sawblade", price: 12000, scale: 90, spin: true, xOff: 0, desc: "deal damage to players that damage you", dmg: 0.15 },
        { id: 13, name: "Angel Wings", price: 15000, scale: 138, xOff: 22, desc: "slowly regenerates health over time", healthRegen: 3 },
        { id: 19, name: "Shadow Wings", price: 15000, scale: 138, xOff: 22, desc: "increased movement speed", spdMult: 1.1 },
        { id: 18, name: "Blood Wings", price: 20000, scale: 178, xOff: 26, desc: "restores health when you deal damage", healD: 0.2 },
        { id: 21, name: "Corrupt X Wings", price: 20000, scale: 178, xOff: 26, desc: "deal damage to players that damage you", dmg: 0.25 }
    ];

    // ---- animals (aiTypes; index = the "index" field of packet "I") ----
    // From the server's AI_TYPES (server/src/moomoo/modules/aiManager.js).
    const animals = [{"index": 0, "id": 0, "src": "cow_1", "killScore": 150, "health": 500, "weightM": 0.8, "speed": 0.00095, "turnSpeed": 0.001, "scale": 72, "drop": ["food", 50]}, {"index": 1, "id": 1, "src": "pig_1", "killScore": 200, "health": 800, "weightM": 0.6, "speed": 0.00085, "turnSpeed": 0.001, "scale": 72, "drop": ["food", 80]}, {"index": 2, "id": 2, "name": "Bull", "src": "bull_2", "hostile": true, "dmg": 20, "killScore": 1000, "health": 1800, "weightM": 0.5, "speed": 0.00094, "turnSpeed": 0.00074, "scale": 78, "viewRange": 800, "chargePlayer": true, "drop": ["food", 100]}, {"index": 3, "id": 3, "name": "Bully", "src": "bull_1", "hostile": true, "dmg": 20, "killScore": 2000, "health": 2800, "weightM": 0.45, "speed": 0.001, "turnSpeed": 0.0008, "scale": 90, "viewRange": 900, "chargePlayer": true, "drop": ["food", 400]}, {"index": 4, "id": 4, "name": "Wolf", "src": "wolf_1", "hostile": true, "dmg": 8, "killScore": 500, "health": 300, "weightM": 0.45, "speed": 0.001, "turnSpeed": 0.002, "scale": 84, "viewRange": 800, "chargePlayer": true, "drop": ["food", 200]}, {"index": 5, "id": 5, "name": "Quack", "src": "chicken_1", "dmg": 8, "killScore": 2000, "noTrap": true, "health": 300, "weightM": 0.2, "speed": 0.0018, "turnSpeed": 0.006, "scale": 70, "drop": ["food", 100]}, {"index": 6, "id": 6, "name": "MOOSTAFA", "nameScale": 50, "src": "enemy", "hostile": true, "dontRun": true, "fixedSpawn": true, "spawnDelay": 60000, "noTrap": true, "colDmg": 100, "dmg": 40, "killScore": 8000, "health": 18000, "weightM": 0.4, "speed": 0.0007, "turnSpeed": 0.01, "scale": 80, "spriteMlt": 1.8, "leapForce": 0.9, "viewRange": 1000, "hitRange": 210, "hitDelay": 1000, "chargePlayer": true, "drop": ["food", 100]}, {"index": 7, "id": 7, "name": "Treasure", "hostile": true, "nameScale": 35, "src": "crate_1", "fixedSpawn": true, "spawnDelay": 120000, "colDmg": 200, "killScore": 5000, "health": 20000, "weightM": 0.1, "speed": 0, "turnSpeed": 0, "scale": 70, "spriteMlt": 1}, {"index": 8, "id": 8, "name": "MOOFIE", "src": "wolf_2", "hostile": true, "fixedSpawn": true, "dontRun": true, "hitScare": 4, "spawnDelay": 30000, "noTrap": true, "nameScale": 35, "dmg": 10, "colDmg": 100, "killScore": 3000, "health": 7000, "weightM": 0.45, "speed": 0.0015, "turnSpeed": 0.002, "scale": 90, "viewRange": 800, "chargePlayer": true, "drop": ["food", 1000]}, {"index": 9, "id": 9, "name": "Boar", "src": "boar_1", "hostile": true, "dmg": 14, "killScore": 800, "health": 900, "weightM": 0.55, "speed": 0.00105, "turnSpeed": 0.0012, "scale": 76, "viewRange": 700, "chargePlayer": true, "drop": ["food", 150]}, {"index": 10, "id": 10, "name": "Yeti", "src": "yeti_1", "hostile": true, "dmg": 25, "killScore": 4500, "health": 3200, "weightM": 0.35, "speed": 0.0008, "turnSpeed": 0.0008, "scale": 95, "viewRange": 750, "leapForce": 0.6, "chargePlayer": true, "drop": ["food", 800]}, {"index": 11, "id": 11, "name": "Crab King", "src": "crab_1", "boss": true, "hostile": true, "dontRun": true, "fixedSpawn": true, "noTrap": true, "dmg": 45, "killScore": 4000, "health": 480000, "weightM": 0, "speed": 0.00045, "turnSpeed": 0.0007, "scale": 280, "viewRange": 1800, "hitRange": 400, "hitDelay": 700}, {"index": 12, "id": 12, "src": "sheep_1", "killScore": 200, "health": 650, "weightM": 0.7, "speed": 0.0009, "turnSpeed": 0.001, "scale": 72, "drop": ["food", 150]}, {"index": 13, "id": 13, "name": "Crab", "src": "crab_1", "diver": true, "hostile": true, "noTrap": true, "dmg": 14.4, "killScore": 400, "health": 500, "weightM": 0.5, "speed": 0.0014, "turnSpeed": 0.003, "scale": 78, "viewRange": 4000, "chargePlayer": true}, {"index": 14, "id": 14, "name": "Crabling", "src": "crab_1", "diver": true, "hostile": true, "noTrap": true, "dmg": 6, "killScore": 200, "health": 250, "weightM": 0.5, "speed": 0.0017, "turnSpeed": 0.004, "scale": 39, "viewRange": 4000, "chargePlayer": true}];

    // ---- lookups ----
    const byId = (arr) => { const m = new Map(); for (const x of arr) m.set(x.id, x); return m; };
    const byName = (arr) => { const m = new Map(); for (const x of arr) m.set(String(x.name).toLowerCase(), x); return m; };

    const weaponId = byId(weapons), weaponName = byName(weapons);
    const itemId = byId(items), itemName = byName(items);
    const hatId = byId(hats), hatName = byName(hats);
    const accId = byId(accessories), accName = byName(accessories);

    return {
        groups, projectiles, weapons, items, hats, accessories, animals,
        animal: (index) => animals[index],
        weapon: (id) => weaponId.get(id),
        weaponByName: (n) => weaponName.get(String(n).toLowerCase()),
        item: (id) => itemId.get(id),
        itemByName: (n) => itemName.get(String(n).toLowerCase()),
        hat: (id) => hatId.get(id),
        hatByName: (n) => hatName.get(String(n).toLowerCase()),
        accessory: (id) => accId.get(id),
        accessoryByName: (n) => accName.get(String(n).toLowerCase()),
        // group id -> placeable item-group name
        groupName: (gid) => (groups[gid] && groups[gid].name) || null
    };
});


/* ===== module: net/msgpack (loader/src/net/msgpack.js) ===== */
/*
 * moomoo.js loader — MessagePack codec
 * ====================================
 * A dependency-free MessagePack encoder/decoder, byte-compatible with the
 * `msgpack-lite` the server uses. The game only needs: nil, bool, int, float64,
 * string, array and map, but the decoder understands every standard format so
 * it never chokes on a frame.
 *
 * Encoding choices match msgpack-lite so round-trips are exact:
 *   - integers use the smallest signed/unsigned format that fits
 *   - non-integer numbers are written as float64 (0xcb)
 *   - strings are UTF-8, arrays are arrays, plain objects are maps
 *   - Uint8Array is written as bin; null/undefined as nil
 *
 * Part of the LOADER (the volatile half). Mods never touch this.
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooMsgpack = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooMsgpack = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const textEncoder = typeof TextEncoder !== "undefined" ? new TextEncoder() : null;
    const textDecoder = typeof TextDecoder !== "undefined" ? new TextDecoder() : null;

    function utf8Encode(str) {
        if (textEncoder) return textEncoder.encode(str);
        // Minimal fallback.
        const bytes = [];
        for (let i = 0; i < str.length; i++) {
            let c = str.charCodeAt(i);
            if (c < 0x80) bytes.push(c);
            else if (c < 0x800) bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
            else if (c >= 0xd800 && c <= 0xdbff) {
                const c2 = str.charCodeAt(++i);
                c = 0x10000 + ((c & 0x3ff) << 10) + (c2 & 0x3ff);
                bytes.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 0x3f), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
            } else bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
        }
        return new Uint8Array(bytes);
    }

    function utf8Decode(bytes) {
        if (textDecoder) return textDecoder.decode(bytes);
        let str = "";
        for (let i = 0; i < bytes.length;) {
            const b = bytes[i++];
            if (b < 0x80) str += String.fromCharCode(b);
            else if (b < 0xe0) str += String.fromCharCode(((b & 0x1f) << 6) | (bytes[i++] & 0x3f));
            else if (b < 0xf0) str += String.fromCharCode(((b & 0x0f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f));
            else {
                const cp = ((b & 0x07) << 18) | ((bytes[i++] & 0x3f) << 12) | ((bytes[i++] & 0x3f) << 6) | (bytes[i++] & 0x3f);
                const off = cp - 0x10000;
                str += String.fromCharCode(0xd800 + (off >> 10), 0xdc00 + (off & 0x3ff));
            }
        }
        return str;
    }

    // ---- WRITER (growing byte buffer) ----
    class Writer {
        constructor() {
            this.buf = new Uint8Array(64);
            this.len = 0;
        }
        ensure(n) {
            if (this.len + n <= this.buf.length) return;
            let cap = this.buf.length * 2;
            while (cap < this.len + n) cap *= 2;
            const next = new Uint8Array(cap);
            next.set(this.buf.subarray(0, this.len));
            this.buf = next;
        }
        u8(v) { this.ensure(1); this.buf[this.len++] = v & 0xff; }
        u16(v) { this.ensure(2); this.buf[this.len++] = (v >> 8) & 0xff; this.buf[this.len++] = v & 0xff; }
        u32(v) { this.ensure(4); this.buf[this.len++] = (v >>> 24) & 0xff; this.buf[this.len++] = (v >>> 16) & 0xff; this.buf[this.len++] = (v >>> 8) & 0xff; this.buf[this.len++] = v & 0xff; }
        bytes(arr) { this.ensure(arr.length); this.buf.set(arr, this.len); this.len += arr.length; }
        f64(v) {
            this.ensure(8);
            const dv = new DataView(this.buf.buffer, this.len, 8);
            dv.setFloat64(0, v, false);
            this.len += 8;
        }
        result() { return this.buf.slice(0, this.len); }
    }

    function encodeInt(w, n) {
        if (n >= 0) {
            if (n < 0x80) { w.u8(n); return; }                       // positive fixint
            if (n < 0x100) { w.u8(0xcc); w.u8(n); return; }           // uint8
            if (n < 0x10000) { w.u8(0xcd); w.u16(n); return; }        // uint16
            if (n < 0x100000000) { w.u8(0xce); w.u32(n); return; }    // uint32
            // uint64
            w.u8(0xcf);
            const hi = Math.floor(n / 0x100000000);
            w.u32(hi); w.u32(n >>> 0);
            return;
        }
        if (n >= -0x20) { w.u8(0xe0 | (n + 0x20)); return; }          // negative fixint
        if (n >= -0x80) { w.u8(0xd0); w.u8(n & 0xff); return; }       // int8
        if (n >= -0x8000) { w.u8(0xd1); w.u16(n & 0xffff); return; }  // int16
        if (n >= -0x80000000) { w.u8(0xd2); w.u32(n >>> 0); return; } // int32
        // int64
        w.u8(0xd3);
        const hi = Math.floor(n / 0x100000000);
        w.u32(hi >>> 0); w.u32(n >>> 0);
    }

    function encodeValue(w, v) {
        if (v === null || v === undefined) { w.u8(0xc0); return; }
        const t = typeof v;
        if (t === "boolean") { w.u8(v ? 0xc3 : 0xc2); return; }
        if (t === "number") {
            if (Number.isInteger(v)) encodeInt(w, v);
            else { w.u8(0xcb); w.f64(v); }
            return;
        }
        if (t === "string") {
            const bytes = utf8Encode(v);
            const n = bytes.length;
            if (n < 0x20) w.u8(0xa0 | n);
            else if (n < 0x100) { w.u8(0xd9); w.u8(n); }
            else if (n < 0x10000) { w.u8(0xda); w.u16(n); }
            else { w.u8(0xdb); w.u32(n); }
            w.bytes(bytes);
            return;
        }
        if (v instanceof Uint8Array || (typeof ArrayBuffer !== "undefined" && v instanceof ArrayBuffer)) {
            const bytes = v instanceof ArrayBuffer ? new Uint8Array(v) : v;
            const n = bytes.length;
            if (n < 0x100) { w.u8(0xc4); w.u8(n); }
            else if (n < 0x10000) { w.u8(0xc5); w.u16(n); }
            else { w.u8(0xc6); w.u32(n); }
            w.bytes(bytes);
            return;
        }
        if (Array.isArray(v)) {
            const n = v.length;
            if (n < 0x10) w.u8(0x90 | n);
            else if (n < 0x10000) { w.u8(0xdc); w.u16(n); }
            else { w.u8(0xdd); w.u32(n); }
            for (let i = 0; i < n; i++) encodeValue(w, v[i]);
            return;
        }
        if (t === "object") {
            const keys = Object.keys(v);
            const n = keys.length;
            if (n < 0x10) w.u8(0x80 | n);
            else if (n < 0x10000) { w.u8(0xde); w.u16(n); }
            else { w.u8(0xdf); w.u32(n); }
            for (let i = 0; i < n; i++) { encodeValue(w, keys[i]); encodeValue(w, v[keys[i]]); }
            return;
        }
        throw new Error("msgpack: cannot encode value of type " + t);
    }

    function encode(value) {
        const w = new Writer();
        encodeValue(w, value);
        return w.result();
    }

    // ---- READER ----
    class Reader {
        constructor(bytes) {
            this.b = bytes;
            this.pos = 0;
            this.dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
        }
        u8() { return this.b[this.pos++]; }
        i8() { return (this.b[this.pos++] << 24) >> 24; }
        u16() { const v = this.dv.getUint16(this.pos, false); this.pos += 2; return v; }
        i16() { const v = this.dv.getInt16(this.pos, false); this.pos += 2; return v; }
        u32() { const v = this.dv.getUint32(this.pos, false); this.pos += 4; return v; }
        i32() { const v = this.dv.getInt32(this.pos, false); this.pos += 4; return v; }
        u64() { const hi = this.u32(), lo = this.u32(); return hi * 0x100000000 + lo; }
        i64() { const hi = this.i32(), lo = this.u32(); return hi * 0x100000000 + lo; }
        f32() { const v = this.dv.getFloat32(this.pos, false); this.pos += 4; return v; }
        f64() { const v = this.dv.getFloat64(this.pos, false); this.pos += 8; return v; }
        str(n) { const s = utf8Decode(this.b.subarray(this.pos, this.pos + n)); this.pos += n; return s; }
        bin(n) { const s = this.b.slice(this.pos, this.pos + n); this.pos += n; return s; }
    }

    function decodeValue(r) {
        const c = r.u8();
        if (c < 0x80) return c;                     // positive fixint
        if (c >= 0xe0) return c - 0x100;            // negative fixint
        if (c >= 0x80 && c <= 0x8f) return readMap(r, c & 0x0f);
        if (c >= 0x90 && c <= 0x9f) return readArray(r, c & 0x0f);
        if (c >= 0xa0 && c <= 0xbf) return r.str(c & 0x1f);
        switch (c) {
            case 0xc0: return null;
            case 0xc2: return false;
            case 0xc3: return true;
            case 0xc4: return r.bin(r.u8());
            case 0xc5: return r.bin(r.u16());
            case 0xc6: return r.bin(r.u32());
            case 0xca: return r.f32();
            case 0xcb: return r.f64();
            case 0xcc: return r.u8();
            case 0xcd: return r.u16();
            case 0xce: return r.u32();
            case 0xcf: return r.u64();
            case 0xd0: return r.i8();
            case 0xd1: return r.i16();
            case 0xd2: return r.i32();
            case 0xd3: return r.i64();
            case 0xd9: return r.str(r.u8());
            case 0xda: return r.str(r.u16());
            case 0xdb: return r.str(r.u32());
            case 0xdc: return readArray(r, r.u16());
            case 0xdd: return readArray(r, r.u32());
            case 0xde: return readMap(r, r.u16());
            case 0xdf: return readMap(r, r.u32());
            default:
                throw new Error("msgpack: unsupported format 0x" + c.toString(16));
        }
    }

    function readArray(r, n) {
        const out = new Array(n);
        for (let i = 0; i < n; i++) out[i] = decodeValue(r);
        return out;
    }

    function readMap(r, n) {
        const out = {};
        for (let i = 0; i < n; i++) {
            const k = decodeValue(r);
            out[k] = decodeValue(r);
        }
        return out;
    }

    function decode(bytes) {
        return decodeValue(new Reader(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)));
    }

    return { encode, decode };
});


/* ===== module: net/sha256 (loader/src/net/sha256.js) ===== */
/*
 * moomoo.js loader — synchronous SHA-256 + HMAC-SHA256
 * ====================================================
 * The client->server transport prepends a truncated HMAC-SHA256 tag to every
 * frame. Decoding/re-encoding a frame must happen synchronously inside the
 * WebSocket send hook, so we cannot use the async SubtleCrypto API — we ship a
 * small, standard SHA-256 here. Output is byte-identical to Node's
 * crypto.createHmac("sha256", key), which is what the server uses.
 *
 * Part of the LOADER (the volatile half).
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooSha256 = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooSha256 = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const K = new Uint32Array([
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ]);

    function sha256(msg) {
        const h = new Uint32Array([
            0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
        ]);

        const len = msg.length;
        const bitLen = len * 8;
        // Padded length: message + 0x80 + zeros + 8-byte length, multiple of 64.
        const total = ((len + 8) >> 6 << 6) + 64;
        const data = new Uint8Array(total);
        data.set(msg);
        data[len] = 0x80;
        // 64-bit big-endian bit length in the last 8 bytes.
        const dv = new DataView(data.buffer);
        dv.setUint32(total - 4, bitLen >>> 0, false);
        dv.setUint32(total - 8, Math.floor(bitLen / 0x100000000) >>> 0, false);

        const w = new Uint32Array(64);
        for (let off = 0; off < total; off += 64) {
            for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4, false);
            for (let i = 16; i < 64; i++) {
                const a = w[i - 15], b = w[i - 2];
                const s0 = ((a >>> 7) | (a << 25)) ^ ((a >>> 18) | (a << 14)) ^ (a >>> 3);
                const s1 = ((b >>> 17) | (b << 15)) ^ ((b >>> 19) | (b << 13)) ^ (b >>> 10);
                w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
            }
            let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], hh = h[7];
            for (let i = 0; i < 64; i++) {
                const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
                const ch = (e & f) ^ (~e & g);
                const t1 = (hh + S1 + ch + K[i] + w[i]) >>> 0;
                const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
                const maj = (a & b) ^ (a & c) ^ (b & c);
                const t2 = (S0 + maj) >>> 0;
                hh = g; g = f; f = e;
                e = (d + t1) >>> 0;
                d = c; c = b; b = a;
                a = (t1 + t2) >>> 0;
            }
            h[0] = (h[0] + a) >>> 0; h[1] = (h[1] + b) >>> 0; h[2] = (h[2] + c) >>> 0; h[3] = (h[3] + d) >>> 0;
            h[4] = (h[4] + e) >>> 0; h[5] = (h[5] + f) >>> 0; h[6] = (h[6] + g) >>> 0; h[7] = (h[7] + hh) >>> 0;
        }

        const out = new Uint8Array(32);
        const odv = new DataView(out.buffer);
        for (let i = 0; i < 8; i++) odv.setUint32(i * 4, h[i], false);
        return out;
    }

    const BLOCK = 64;

    function hmacSha256(key, data) {
        let k = key instanceof Uint8Array ? key : new Uint8Array(key);
        if (k.length > BLOCK) k = sha256(k);
        const ipad = new Uint8Array(BLOCK + data.length);
        const opadKey = new Uint8Array(BLOCK);
        for (let i = 0; i < BLOCK; i++) {
            const kb = i < k.length ? k[i] : 0;
            ipad[i] = kb ^ 0x36;
            opadKey[i] = kb ^ 0x5c;
        }
        ipad.set(data, BLOCK);
        const inner = sha256(ipad);
        const opad = new Uint8Array(BLOCK + 32);
        opad.set(opadKey);
        opad.set(inner, BLOCK);
        return sha256(opad);
    }

    return { sha256, hmacSha256 };
});


/* ===== module: net/protocol (loader/src/net/protocol.js) ===== */
/*
 * moomoo.js loader — PROTOCOL codec (client side)
 * ===============================================
 * The exact mirror of the server's protocol/crypto.js + protocol/session.js,
 * but running in the browser. Given the io-init handshake the server sends, it
 * derives the same per-connection packet tables, session key and masks, then:
 *   - decodeS2C(frame)  -> { name, args }   (read incoming packets)
 *   - encodeC2S(name, args, seq) -> bytes   (send / re-send outgoing packets)
 *   - decodeC2S(frame)  -> { name, args, seq } (inspect what the client sent)
 *
 * The STABLE constants below mirror the client's constants block. The per-DEPLOY
 * secrets (mixKey, BUILD_SALT) are NOT here — the loader fetches them at runtime
 * from the page's `moomoo-protocol` module, exactly like the official client, so
 * this file does not need editing when the server re-deploys.
 *
 * CODE SEAL (io-init field 6 = sealMode). The server binds the connection to the
 * exact client bundle it served: sealValue = sealBytes ^ SHA-256(bundle)[0..16],
 * where sealBytes is the hex file name of the page's "moomoo-seal" import. In
 * "bind" mode (2) that value is XORed into the session key, so nothing can talk
 * to the server without it; in "report" mode (1) the client reports a hash of it
 * every telemetry round. The loader computes the same value from the bundle it is
 * running (loader.js fetches + hashes it) and passes it in here, so keyed frames
 * validate and the telemetry answer carries the right seal.
 *
 * Part of the LOADER (the volatile half). Mods never touch this.
 */
(function (root, factory) {
    const deps = (typeof require === "function")
        ? { sha256: require("./sha256.js"), msgpack: require("./msgpack.js") }
        : { sha256: root.MooMooSha256, msgpack: root.MooMooMsgpack };
    const value = factory(deps);
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooProtocol = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooProtocol = value;
})(typeof self !== "undefined" ? self : this, function (deps) {
    "use strict";

    const { sha256, hmacSha256 } = deps.sha256;
    const msgpack = deps.msgpack;

    // ---- STABLE CONSTANTS (mirror of the client's constants block) ----
    // If the official client bundle ever changes these, update them here (loader side).
    const MODE_KEYED = 1;
    const MAC_LENGTH = 6;
    const LEGACY_SALT = 1;
    const LEGACY_C2S_COUNT = 17;
    const LEGACY_S2C_COUNT = 36;
    // A pinned connection shuffles the first BASE_* names into ids 0..base-1; names
    // after that get ids in [base, TABLE_SIZE) from a salted hash (extendTable), so the
    // server can add packets without reshuffling the old ids.
    const BASE_C2S_COUNT = 22;
    const BASE_S2C_COUNT = 39;
    const TABLE_SIZE = 128;
    const C2S_PACKETS = ["M", "D", "9", "e", "F", "z", "H", "K", "L", "N", "b", "P", "Q", "c", "6", "S", "0", "T", "R", "A", "V", "I"];
    const S2C_PACKETS = ["A", "B", "C", "D", "E", "a", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "X", "Y", "Z", "g", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "W", "F", "p", "q", "r", "m"];
    // FNV-1a with a seeded offset and a final avalanche (packet ids, probes, the seal report).
    const FNV_OFFSET = 2166136261;
    const FNV_PRIME = 16777619;
    const FNV_FINAL_MULT = 739982445;
    const TABLE_SALT_MULT = 2654435761;
    const TABLE_S2C_XOR = 2246822507;
    const MASK_C2S_XOR = 3266489909;
    const MASK_S2C_XOR = 668265263;
    const MASK_COUNTER_MULT = 2654435761;
    const MASK_ZERO_SEED = 1831565813;
    // sealMode (io-init field 6).
    const SEAL_OFF = 0, SEAL_REPORT = 1, SEAL_BIND = 2;

    // ---- algorithms (mirror of protocol/crypto.js) ----
    function mulberry32(seed) {
        return function () {
            seed |= 0;
            seed = (seed + 1831565813) | 0;
            let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function fnvStep(hash, byte) { return Math.imul(hash ^ byte, FNV_PRIME); }
    function fnvFinish(hash) {
        hash ^= hash >>> 15;
        hash = Math.imul(hash, FNV_FINAL_MULT);
        hash ^= hash >>> 12;
        return hash >>> 0;
    }

    // hash of a string (low byte of every UTF-16 unit) under a salt.
    function saltedHash(text, salt) {
        let h = (FNV_OFFSET ^ salt) >>> 0;
        for (let i = 0; i < text.length; i++) h = fnvStep(h, text.charCodeAt(i) & 255);
        return fnvFinish(h);
    }

    // hash of a byte array under a seed.
    function bytesHash(bytes, seed) {
        let h = (FNV_OFFSET ^ seed) >>> 0;
        for (let i = 0; i < bytes.length; i++) h = fnvStep(h, bytes[i]);
        return fnvFinish(h);
    }

    // The client's frame "ledger": a rolling FNV-1a hash of every client -> server body
    // it sends (NO final avalanche), started at FNV_OFFSET. A "T" telemetry frame reports
    // this (with the sequence number) so the server can confirm it received the exact same
    // frame stream. Because the loader OWNS the c2s stream (it re-sequences client frames and
    // injects its own), it must keep its own ledger over the bodies it actually puts on the
    // wire and report THAT — reporting the client's own value would flag a mismatch the moment
    // a single packet is injected, dropped or rewritten.
    function fnvLedger(hash, bytes) {
        let h = hash >>> 0;
        for (let i = 0; i < bytes.length; i++) h = Math.imul(h ^ bytes[i], FNV_PRIME);
        return h >>> 0;
    }

    // sealValue = sealBytes ^ bundleDigest (both 16 bytes).
    function sealValue(sealBytes, bundleDigest) {
        const n = Math.min(sealBytes.length, bundleDigest.length);
        const out = new Uint8Array(n);
        for (let i = 0; i < n; i++) out[i] = sealBytes[i] ^ bundleDigest[i];
        return out;
    }

    function shuffleTable(names, seed) {
        const count = names.length;
        const ids = names.map((_, i) => i);
        const rand = mulberry32(seed >>> 0);
        for (let i = count - 1; i > 0; i--) {
            const j = Math.floor(rand() * (i + 1));
            const tmp = ids[i]; ids[i] = ids[j]; ids[j] = tmp;
        }
        const enc = {}, dec = {};
        for (let i = 0; i < count; i++) { enc[names[i]] = ids[i]; dec[ids[i]] = names[i]; }
        return { enc, dec };
    }

    // Names past `base` get ids in [base, TABLE_SIZE): salted hash, then linear probing.
    function extendTable(table, names, base, salt) {
        const span = TABLE_SIZE - base;
        const taken = {};
        for (let i = base; i < names.length; i++) {
            let slot = saltedHash(names[i], salt) % span;
            while (taken[slot]) slot = (slot + 1) % span;
            taken[slot] = true;
            table.enc[names[i]] = base + slot;
            table.dec[base + slot] = names[i];
        }
        return table;
    }

    function buildTables(seed, salt) {
        const legacy = salt == null;
        const tableSeed = (seed ^ Math.imul(legacy ? LEGACY_SALT : salt, TABLE_SALT_MULT)) >>> 0;
        if (legacy) {
            return {
                c2s: shuffleTable(C2S_PACKETS.slice(0, LEGACY_C2S_COUNT), tableSeed),
                s2c: shuffleTable(S2C_PACKETS.slice(0, LEGACY_S2C_COUNT), (tableSeed ^ TABLE_S2C_XOR) >>> 0)
            };
        }
        const s2cSeed = (tableSeed ^ TABLE_S2C_XOR) >>> 0;
        return {
            c2s: extendTable(shuffleTable(C2S_PACKETS.slice(0, BASE_C2S_COUNT), tableSeed), C2S_PACKETS, BASE_C2S_COUNT, tableSeed),
            s2c: extendTable(shuffleTable(S2C_PACKETS.slice(0, BASE_S2C_COUNT), s2cSeed), S2C_PACKETS, BASE_S2C_COUNT, s2cSeed)
        };
    }

    function hmacTag(key, data) {
        return hmacSha256(key, data).subarray(0, MAC_LENGTH);
    }

    function readU32LE(bytes, offset) {
        return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
    }

    function xorMask(bytes, seed) {
        let s = seed >>> 0;
        if (s === 0) s = MASK_ZERO_SEED;
        for (let i = 0; i < bytes.length; i += 4) {
            s ^= s << 13; s >>>= 0;
            s ^= s >>> 17;
            s ^= s << 5; s >>>= 0;
            bytes[i] ^= s & 255;
            if (i + 1 < bytes.length) bytes[i + 1] ^= (s >>> 8) & 255;
            if (i + 2 < bytes.length) bytes[i + 2] ^= (s >>> 16) & 255;
            if (i + 3 < bytes.length) bytes[i + 3] ^= (s >>> 24) & 255;
        }
        return bytes;
    }

    function deriveMaskSeeds(key) {
        return {
            c2s: (readU32LE(key, 0) ^ MASK_C2S_XOR) >>> 0,
            s2c: (readU32LE(key, 4) ^ MASK_S2C_XOR) >>> 0
        };
    }

    const s2cMaskSeed = (base, counter) => (base ^ Math.imul(counter, MASK_COUNTER_MULT)) >>> 0;
    const c2sMaskSeed = (base, tag) => (base ^ readU32LE(tag, 0)) >>> 0;

    function hexToBytes(hex) {
        const out = new Uint8Array(hex.length / 2);
        for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
        return out;
    }

    // Is this msgpack frame the plaintext io-init handshake?  ["io-init", [...]]
    function isHandshake(frame) {
        try {
            const msg = msgpack.decode(frame);
            return Array.isArray(msg) && msg[0] === "io-init" ? msg : null;
        } catch {
            return null;
        }
    }

    /*
     * One live connection. Built from the io-init payload + the per-deploy module.
     *   payload = [socketId, seed, keyHex, mode, pinned, sealMode]
     *   opts.seal = the 16-byte sealValue for this bundle (from loader.js), or null.
     */
    class ClientSession {
        constructor(payload, mod, opts) {
            const [socketId, seed, keyHex, mode, pinned, sealMode] = payload;
            this.socketId = socketId;
            this.seed = seed >>> 0;
            this.mode = mode;
            this.pinned = Boolean(pinned);
            this.keyed = mode === MODE_KEYED;
            this.sealMode = sealMode | 0;
            this.sealReport = null;

            const seal = opts && opts.seal;
            const rawKey = hexToBytes(keyHex);
            if (this.pinned) {
                if (!mod || typeof mod.mixKey !== "function") throw new Error("pinned connection needs the moomoo-protocol module (mixKey)");
                let key = Uint8Array.from(mod.mixKey(rawKey, this.seed));
                // Bind mode: fold the code seal into the session key (before deriving masks),
                // exactly like the server. Without it, every keyed frame fails the HMAC tag.
                if (seal && this.sealMode === SEAL_BIND) {
                    for (let i = 0; i < seal.length && i < key.length; i++) key[i] ^= seal[i];
                }
                if (seal && this.sealMode !== SEAL_OFF) this.sealReport = bytesHash(seal, this.seed);
                this.key = key;
                this.tables = buildTables(this.seed, mod.BUILD_SALT);
                this.maskSeeds = deriveMaskSeeds(this.key);
            } else {
                this.key = rawKey;
                this.tables = buildTables(this.seed, null);
                this.maskSeeds = null;
            }

            this.received = 0; // s2c frames seen after io-init
            this.lastSeq = 0;  // c2s seq we have assigned
            // Frame ledger (pinned connections only): the running FNV-1a hash of every c2s
            // body we have sent, and its value just before the most recent frame. A "T" frame
            // reports `ledgerBefore` and `lastSeq - 1` (the values as they stood before the T
            // body itself), which the loader reads live when it scrubs the telemetry.
            this.ledger = this.pinned ? FNV_OFFSET : 0;
            this.ledgerBefore = this.ledger;
        }

        // Decode one incoming server->client frame. Consumes the s2c counter.
        decodeS2C(frame) {
            const bytes = new Uint8Array(frame.length);
            bytes.set(frame);
            if (this.maskSeeds) xorMask(bytes, s2cMaskSeed(this.maskSeeds.s2c, ++this.received));
            const msg = msgpack.decode(bytes);
            if (!Array.isArray(msg)) throw new Error("s2c frame is not an array");
            const name = typeof msg[0] === "number" ? this.tables.s2c.dec[msg[0]] : msg[0];
            return { id: msg[0], name, args: Array.isArray(msg[1]) ? msg[1] : [] };
        }

        // Encode one outgoing client->server frame. `seq` is the sequence number
        // to stamp; when omitted we auto-assign the next one.
        encodeC2S(name, args, seq) {
            const id = this.tables.c2s.enc[name];
            if (id === undefined) throw new Error('packet "' + name + '" is not in the c2s table');
            if (seq === undefined) seq = ++this.lastSeq; else this.lastSeq = seq;
            const body = msgpack.encode([id, args, seq]);
            // Fold this exact body into the ledger (pinned only), keeping the value from just
            // before it — the server does the same on the frame it decodes, so the two stay in
            // lock-step frame for frame.
            if (this.pinned) { this.ledgerBefore = this.ledger; this.ledger = fnvLedger(this.ledger, body); }
            const tag = hmacTag(this.key, body);
            const masked = new Uint8Array(body.length);
            masked.set(body);
            if (this.maskSeeds) xorMask(masked, c2sMaskSeed(this.maskSeeds.c2s, tag));
            const out = new Uint8Array(MAC_LENGTH + masked.length);
            out.set(tag, 0);
            out.set(masked, MAC_LENGTH);
            return out;
        }

        // Inspect what the client encoded (does NOT touch the seq counter).
        decodeC2S(frame) {
            const bytes = new Uint8Array(frame.length);
            bytes.set(frame);
            if (bytes.length <= MAC_LENGTH) throw new Error("short c2s frame");
            const tag = bytes.subarray(0, MAC_LENGTH);
            const body = bytes.subarray(MAC_LENGTH);
            if (this.maskSeeds) xorMask(body, c2sMaskSeed(this.maskSeeds.c2s, tag));
            const msg = msgpack.decode(body);
            if (!Array.isArray(msg) || msg.length !== 3) throw new Error("malformed c2s body");
            const name = typeof msg[0] === "number" ? this.tables.c2s.dec[msg[0]] : msg[0];
            return { id: msg[0], name, args: Array.isArray(msg[1]) ? msg[1] : [], seq: msg[2] };
        }
    }

    return {
        MODE_KEYED, MAC_LENGTH,
        C2S_PACKETS, S2C_PACKETS, BASE_C2S_COUNT, BASE_S2C_COUNT, TABLE_SIZE,
        SEAL_OFF, SEAL_REPORT, SEAL_BIND,
        mulberry32, shuffleTable, extendTable, buildTables,
        fnvStep, fnvFinish, saltedHash, bytesHash, fnvLedger, sealValue, sha256,
        hmacTag, xorMask, deriveMaskSeeds, s2cMaskSeed, c2sMaskSeed,
        readU32LE, hexToBytes, isHandshake,
        ClientSession
    };
});


/* ===== module: net/binding (loader/src/net/binding.js) ===== */
/*
 * moomoo.js loader — BINDING  (the part you update when the server changes)
 * =========================================================================
 * This is the ONLY place that knows which wire packet letter means what. It
 * translates between raw frames and the stable vocabulary that mods speak:
 *
 *   incoming[<wire>] = { event, parse(args) -> payload }
 *   outgoing[<action>] = { wire, build(payload) -> args }
 *
 * When the private server renames a packet, reorders its arguments, or adds a
 * new one, you edit THIS file (and bump the loader). Every mod ever written
 * keeps working, because the vocabulary names on the left never move.
 *
 * Part of the LOADER (the volatile half).
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooBinding = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooBinding = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const bool = (v) => (v ? 1 : 0);
    const passthrough = (event) => ({ event, parse: (args) => ({ args }) });

    // Parse the modernised "a" (playersUpdate): three arrays.
    function parsePlayersUpdate(args) {
        const positions = [];
        const pos = args[0] || [];
        for (let i = 0; i + 3 < pos.length; i += 4) {
            positions.push({ sid: pos[i], x: pos[i + 1], y: pos[i + 2], dir: pos[i + 3] / 100 });
        }
        const attributes = [];
        const at = args[1] || [];
        for (let i = 0; i + 9 < at.length; i += 10) {
            attributes.push({
                sid: at[i], buildIndex: at[i + 1], weaponIndex: at[i + 2], variant: at[i + 3],
                team: at[i + 4], isLeader: !!at[i + 5], skin: at[i + 6], tail: at[i + 7],
                icon: at[i + 8], zIndex: at[i + 9]
            });
        }
        return { positions, attributes, hidden: args[2] || [] };
    }

    // ---- INCOMING: wire letter -> semantic event + payload parser ----
    const incoming = {
        A: passthrough("init"),
        B: { event: "disconnect", parse: (a) => ({ reason: a[0] }) },
        C: { event: "setup", parse: (a) => ({ sid: a[0] }) },
        D: { event: "playerAdd", parse: (a) => ({ data: a[0], isYou: !!a[1] }) },
        E: { event: "playerRemove", parse: (a) => ({ sid: a[0] }) },
        a: { event: "playersUpdate", parse: parsePlayersUpdate },
        G: passthrough("leaderboard"),
        H: passthrough("objectsLoad"),
        I: passthrough("animalsUpdate"),
        J: passthrough("animalAttack"),
        K: passthrough("gatherAnimation"),
        L: passthrough("wiggle"),
        M: passthrough("turretShoot"),
        N: { event: "playerValue", parse: (a) => ({ key: a[0], value: a[1], updateView: !!a[2] }) },
        O: { event: "health", parse: (a) => ({ sid: a[0], value: a[1] }) },
        P: { event: "died", parse: () => ({}) },
        Q: passthrough("objectKilled"),
        R: passthrough("objectsKilled"),
        S: passthrough("itemCount"),
        T: passthrough("age"),
        U: { event: "upgrades", parse: (a) => ({ points: a[0], age: a[1] }) },
        V: { event: "inventory", parse: (a) => ({ list: a[0], isWeapon: !!a[1] }) },
        X: passthrough("projectileAdd"),
        Y: passthrough("projectileRemove"),
        Z: passthrough("shutdownNotice"),
        g: passthrough("tribeAdd"),
        1: passthrough("tribeDelete"),
        2: passthrough("tribeJoinRequest"),
        3: passthrough("tribeSet"),
        4: passthrough("tribeMembers"),
        5: passthrough("storeUpdate"),
        6: { event: "chat", parse: (a) => ({ sid: a[0], message: a[1] }) },
        7: passthrough("minimap"),
        8: { event: "showText", parse: (a) => ({ x: a[0], y: a[1], value: a[2], type: a[3] }) },
        9: { event: "mapPing", parse: (a) => ({ x: a[0], y: a[1] }) },
        0: { event: "pong", parse: () => ({}) },
        W: passthrough("effect"),
        F: passthrough("stats"),
        // added by the current server
        p: passthrough("profile"),          // answer to V (watch stats): the profile card
        q: { event: "probes", parse: (a) => ({ salt: a[0], probes: a[1] || [] }) }, // integrity probes
        r: passthrough("updateCountdown"),  // "a new version is out" countdown
        m: { event: "dive", parse: (a) => ({ sid: a[0], state: a[1] }) }            // player dive
    };

    // ---- OUTGOING: semantic action -> wire letter + argument builder ----
    const outgoing = {
        spawn: { wire: "M", build: (d) => {
            const o = { name: d.name == null ? "" : String(d.name), moofoll: d.moofoll ? 1 : 0, skin: d.skin | 0 };
            if (d.anon) o.anon = 1;            // this server reads a 4th spawn field (anonymous join)
            return [o];
        } },
        aim: { wire: "D", build: (d) => [d.dir] },
        move: { wire: "9", build: (d) => [d.dir === undefined ? null : d.dir] },
        stopMove: { wire: "e", build: () => [] },
        mouse: { wire: "F", build: (d) => [bool(d.down), d.dir === undefined ? null : d.dir] },
        selectItem: { wire: "z", build: (d) => [d.index, bool(d.isWeapon)] },
        upgrade: { wire: "H", build: (d) => [d.index] },
        toggle: { wire: "K", build: (d) => [d.which] },
        createTribe: { wire: "L", build: (d) => [d.name] },
        leaveTribe: { wire: "N", build: () => [] },
        joinTribe: { wire: "b", build: (d) => [d.name] },
        answerJoin: { wire: "P", build: (d) => [d.sid, bool(d.accept)] },
        kickMember: { wire: "Q", build: (d) => [d.sid] },
        // Vocabulary store action is 0 = buy, 1 = equip (the stable contract). THIS server's
        // wire is the other way round (0 = equip, 1 = buy), so translate here — mods keep using
        // the documented meaning and `ctx.setHat` / `buyHat` work.
        store: { wire: "c", build: (d) => [d.action ? 0 : 1, d.id, bool(d.isAccessory)] },
        chat: { wire: "6", build: (d) => [d.message == null ? "" : String(d.message)] },
        pingMap: { wire: "S", build: () => [] },
        ping: { wire: "0", build: () => [] },
        watchStats: { wire: "V", build: (d) => [d.sid] },
        report: { wire: "R", build: (d) => d.args || [] },
        admin: { wire: "A", build: (d) => d.args || [] },
        anon: { wire: "I", build: (d) => [d.on ? 1 : 0] }
    };

    // ---- OUTGOING, inverse: wire args -> action payload ----
    // Lets the loader turn a frame the official client sent back into a named
    // action, so mods can inspect, rewrite or drop it (see runtime onOutgoing).
    const outgoingParse = {
        M: { action: "spawn", parse: (a) => Object.assign({}, a[0] || {}) },
        D: { action: "aim", parse: (a) => ({ dir: a[0] }) },
        9: { action: "move", parse: (a) => ({ dir: a[0] == null ? null : a[0] }) },
        e: { action: "stopMove", parse: () => ({}) },
        F: { action: "mouse", parse: (a) => ({ down: !!a[0], dir: a.length > 1 ? a[1] : undefined }) },
        z: { action: "selectItem", parse: (a) => ({ index: a[0], isWeapon: !!a[1] }) },
        H: { action: "upgrade", parse: (a) => ({ index: a[0] }) },
        K: { action: "toggle", parse: (a) => ({ which: a[0] }) },
        L: { action: "createTribe", parse: (a) => ({ name: a[0] }) },
        N: { action: "leaveTribe", parse: () => ({}) },
        b: { action: "joinTribe", parse: (a) => ({ name: a[0] }) },
        P: { action: "answerJoin", parse: (a) => ({ sid: a[0], accept: !!a[1] }) },
        Q: { action: "kickMember", parse: (a) => ({ sid: a[0] }) },
        c: { action: "store", parse: (a) => ({ action: a[0] ? 0 : 1, id: a[1], isAccessory: !!a[2] }) },   // wire 0=equip/1=buy -> vocab 0=buy/1=equip
        6: { action: "chat", parse: (a) => ({ message: a[0] }) },
        S: { action: "pingMap", parse: () => ({}) },
        0: { action: "ping", parse: () => ({}) },
        V: { action: "watchStats", parse: (a) => ({ sid: a[0] }) },
        R: { action: "report", parse: (a) => ({ args: a.slice() }) },
        A: { action: "admin", parse: (a) => ({ args: a.slice() }) },
        I: { action: "anon", parse: (a) => ({ on: !!a[0] }) }
    };

    // The server's per-packet token buckets ([refill per second, burst]) from
    // server/src/anticheat/config.js. The loader mirrors them so that the sum of
    // the client's own packets and mod-injected packets can never exceed a bucket
    // (exceeding one = a strike; 40 strikes = kicked).
    const rateLimits = {
        global: [150, 300],
        packets: {
            M: [1, 3], D: [60, 120], 9: [40, 80], e: [10, 20], F: [40, 80], z: [20, 40], H: [10, 20],
            K: [10, 20], L: [2, 4], N: [2, 4], b: [2, 4], P: [5, 10], Q: [5, 10], c: [10, 20],
            6: [2, 4], S: [1, 2], 0: [2, 4], T: [1, 3], R: [2, 5], A: [20, 40], V: [4, 8], I: [1, 2]
        }
    };

    // The number of fields in a "T" telemetry frame this loader knows how to produce, and
    // the length of the io-init handshake it understands. The compat checker compares these
    // against what the live server/client actually use: if the real client reports MORE "T"
    // fields than this, the server is checking something the loader can't answer and would
    // flag it — that is a hard "loader out of date" signal (see core/notice.js).
    const TELEMETRY_FIELDS = 7;   // [flags, untrusted, probeResult, seal, probeSalt, seq, ledger]
    const IO_INIT_FIELDS = 6;     // [socketId, seed, keyHex, mode, pinned, sealMode]

    // The anti-tamper flag bits a "T" can carry (server/src/anticheat/config.js), so a caught
    // detection can be logged by name instead of as a bitmask.
    const FLAG_NAMES = {
        1: "USERSCRIPT_MANAGER", 2: "SOCKET_HOOKED", 4: "RENDER_HOOKED",
        8: "DEBUGGER_PAUSED", 16: "SOCKET_INTEGRITY", 32: "SOCKET_TAMPERED"
    };

    // Decode a raw client "T" into what it WOULD have told the server (for the anti-detect log).
    function telemetryInspect(args) {
        const flags = args && args.length > 0 ? (args[0] | 0) : 0;
        const names = [];
        for (const bit in FLAG_NAMES) if (flags & Number(bit)) names.push(FLAG_NAMES[bit]);
        return {
            flags, flagNames: names,
            untrusted: args && args.length > 1 ? (args[1] | 0) : 0,
            probeResult: args && args.length > 2 ? (args[2] | 0) : 0
        };
    }

    // --- probe-result sanitiser ------------------------------------------------
    // The "q" round asks which integrity probes match; the client answers with a bitmask in
    // "T". We want the reconstructed "T" to report ONLY what the original, unmodified client
    // would — i.e. every CANARY it genuinely matches (things a real browser always has:
    // window.document, a standard localStorage key, a built-in element id, native functions,
    // intact constructors) — and NOTHING that exists only because of the loader or a mod.
    // cleanProbeResult takes the bits the client set and clears exactly the ones a probe
    // matched because of US: a hooked function (kind 7, reads non-native), a swapped
    // constructor (kind 5), a loader/mod localStorage key (kind 3) or a loader/mod id'd
    // element (kind 4). It only ever clears a bit it can positively tie to a loader/mod
    // artifact, so a canary bit is never touched — the answer still looks like a real
    // client's. (Blanking the whole field instead would fail a canary probe and get caught.)
    // The real global object (with the DOM + localStorage). The loader's bundle wrapper
    // shadows `self` and `globalThis` with a private {} to keep the window surface empty, so
    // we must NOT trust them — we pick whichever candidate actually carries a document /
    // localStorage (the real `window`), falling back to any defined global otherwise.
    function telemetryGlobal() {
        const cands = [];
        try { if (typeof window !== "undefined" && window) cands.push(window); } catch (e) {}
        try { if (typeof self !== "undefined" && self) cands.push(self); } catch (e) {}
        try { if (typeof globalThis !== "undefined" && globalThis) cands.push(globalThis); } catch (e) {}
        for (let i = 0; i < cands.length; i++) { const c = cands[i]; try { if (c.document || c.localStorage) return c; } catch (e) {} }
        return cands[0] || {};
    }
    function telemetryResolve(path) {
        try { const root = telemetryGlobal(); return String(path).split(".").reduce((o, k) => (o == null ? o : o[k]), root); }
        catch (e) { return undefined; }
    }
    function telemetryNativeFn(fn) {
        try { return typeof fn === "function" && /\{\s*\[native code\]\s*\}/.test(Function.prototype.toString.call(fn)); }
        catch (e) { return false; }
    }
    // FNV-1a with a seeded offset + final avalanche — identical to the server/client probe hash.
    function telemetrySaltedHash(text, salt) {
        let h = (2166136261 ^ salt) >>> 0;
        for (let i = 0; i < text.length; i++) h = Math.imul(h ^ (text.charCodeAt(i) & 255), 16777619);
        h ^= h >>> 15; h = Math.imul(h, 739982445); h ^= h >>> 12; return h >>> 0;
    }
    const LOADER_LS_KEY = /^(?:moomoojs:|mml[_:]|mmp[_:]|moomoo\.js)/i;   // the loader's / mods' own storage keys
    function loaderOwnedElement(el) {
        try {
            const cn = el.className, cls = (cn && cn.baseVal != null ? cn.baseVal : cn) || "";
            return /\bmml-|\bmdbg\b|moomoojs/i.test(String(cls)) || /mml|mdbg|moomoojs/i.test(el.id || "");
        } catch (e) { return false; }
    }
    // Each hash-based match is its own small function with a clean (hashVal, saltVal) scope:
    // inside one big function the minifier could rename a local (els/keys) to the same name as
    // the `hash` param and shadow it — which silently broke the comparison.
    function hashHitsLoaderKey(hashVal, saltVal) {   // kind 3: one of our localStorage keys
        const ls = telemetryGlobal().localStorage; if (!ls) return false;
        const keys = Object.keys(ls);
        for (let j = 0; j < keys.length; j++) if (LOADER_LS_KEY.test(keys[j]) && telemetrySaltedHash(keys[j], saltVal) === hashVal) return true;
        return false;
    }
    function hashHitsLoaderId(hashVal, saltVal) {     // kind 4: one of our id'd elements, as "tag#id"
        const doc = telemetryGlobal().document; if (!doc || !doc.querySelectorAll) return false;
        const list = doc.querySelectorAll("[id]");
        for (let j = 0; j < list.length; j++) { const el = list[j]; if (loaderOwnedElement(el) && telemetrySaltedHash(el.tagName.toLowerCase() + "#" + el.id, saltVal) === hashVal) return true; }
        return false;
    }
    function hashHitsLoaderClass(hashVal, saltVal) {  // kind 8: one of our classed elements, as "tag.class"
        const doc = telemetryGlobal().document; if (!doc || !doc.querySelectorAll) return false;
        const list = doc.querySelectorAll("[class*='mml-'],[class*='mdbg'],[class*='moomoo']");
        for (let j = 0; j < list.length; j++) {
            const el = list[j]; if (!loaderOwnedElement(el)) continue;
            const tag = (el.tagName || "").toLowerCase();
            const cn = el.className, raw = String((cn && cn.baseVal != null ? cn.baseVal : cn) || "");
            const toks = raw.split(/\s+/).filter(Boolean);
            // try each class token, the raw className and the dotted form, so we match whatever
            // "tag.class" shape the client enumerates — but only on OUR OWN classes, never a
            // game class (which could be a canary).
            for (let k = 0; k < toks.length; k++) if (telemetrySaltedHash(tag + "." + toks[k], saltVal) === hashVal) return true;
            if (raw && telemetrySaltedHash(tag + "." + raw, saltVal) === hashVal) return true;
            if (toks.length > 1 && telemetrySaltedHash(tag + "." + toks.join("."), saltVal) === hashVal) return true;
        }
        return false;
    }
    // Is bit `i`'s probe a match that exists only because of the loader / a mod?
    function loaderArtifactProbe(kind, path, hash, salt) {
        try {
            if (kind === 7) { const fn = telemetryResolve(path); return typeof fn === "function" && !telemetryNativeFn(fn); }
            if (kind === 5) { const o = telemetryResolve(path); return !!(o && o.prototype && o.prototype.constructor !== o); }
            if (kind === 3) return hashHitsLoaderKey(hash, salt);
            if (kind === 4) return hashHitsLoaderId(hash, salt);
            if (kind === 8) return hashHitsLoaderClass(hash, salt);
            // kind 9: a probe that dispatches a CustomEvent and watches for a listener to resolve
            // it. The loader's API handshake ("moomoo.js:api") is the only event it resolves, and
            // the name travels in clear in `path`; a clean client resolves no such event, so
            // clearing it can never fail a canary.
            if (kind === 9) return /moomoo/i.test(String(path));
        } catch (e) {}
        return false;   // kinds 1, 2, 6: the loader/mods add no window props or symbols, so never ours
    }
    function cleanProbeResult(clientResult, probes, salt) {
        let result = clientResult | 0;
        if (!Array.isArray(probes)) return result >>> 0;
        salt = salt >>> 0;
        for (let i = 0; i < probes.length && i < 32; i++) {
            if (!(result & (1 << i))) continue;      // only a bit the client set can be ours to clear
            const p = probes[i]; if (!p) continue;
            if (loaderArtifactProbe(p[0], p[1] || "", p[2] >>> 0, salt)) result &= ~(1 << i);
        }
        return result >>> 0;
    }

    // ---- self-protection -----------------------------------------------------
    // The sanitiser above can only hide footprint it UNDERSTANDS. Two things have
    // silently defeated it before, and both would leak footprint with no error:
    //   * the anti-cheat adds a brand-new probe KIND the sanitiser has no rule for
    //     (kinds 8 + 9 were added in index-332036b9), so a bit it matched on our
    //     footprint sails through unstripped;
    //   * the sanitiser loses sight of the real page — the bundle wrapper shadows
    //     self/globalThis, so telemetryGlobal() once resolved to {} and every
    //     DOM/storage/function lookup went dead while still "succeeding".
    // auditProbeResult detects exactly those so the loader can shout instead of
    // quietly getting its players kicked. It NEVER changes what is sent; it only
    // reports what the sanitiser could not account for.
    const KNOWN_PROBE_KINDS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    // Is telemetryGlobal() actually looking at the page? We cross-check against the
    // window/document reachable DIRECTLY (the wrapper shadows self/globalThis but NOT
    // window/document), so this catches the "{}" bug without trusting the same path.
    function telemetryGlobalHealthy() {
        try {
            let realDoc = false;
            try { if (typeof document !== "undefined" && document) realDoc = true; } catch (e) {}
            try { if (!realDoc && typeof window !== "undefined" && window && window.document) realDoc = true; } catch (e) {}
            if (!realDoc) return true;                       // no DOM reachable (node / tests) -> nothing to strip
            const g = telemetryGlobal();
            return !!(g && (g.document || g.localStorage));  // the sanitiser must be able to see the DOM / storage
        } catch (e) { return true; }
    }
    // clientResult = what the client answered; cleaned = what cleanProbeResult produced.
    // Returns a (usually empty) list of problems the sanitiser could not handle.
    function auditProbeResult(clientResult, cleaned, probes, salt) {
        const warnings = [];
        if (!telemetryGlobalHealthy()) warnings.push({ type: "dom-blind", detail: "telemetryGlobal() cannot see the page document/localStorage — DOM/function footprint cannot be stripped" });
        if (Array.isArray(probes)) {
            salt = salt >>> 0;
            const client = clientResult | 0, clean = cleaned | 0;
            for (let i = 0; i < probes.length && i < 32; i++) {
                const p = probes[i]; if (!p) continue;
                const kind = p[0], bit = 1 << i;
                if (KNOWN_PROBE_KINDS.indexOf(kind) < 0) {
                    // A kind we have no rule for: if the client matched it we cannot tell whether
                    // that bit is our footprint or a canary, so we leave it — but we must flag it.
                    warnings.push({ type: "unknown-kind", kind: kind, index: i, path: String(p[1] || ""), matched: !!(client & bit) });
                    continue;
                }
                // A bit we positively tie to our own footprint is STILL set in the answer: the
                // strip silently failed (the telemetryGlobal bug did exactly this for kinds 3/4/8).
                if ((clean & bit) && loaderArtifactProbe(kind, p[1] || "", p[2] >>> 0, salt)) {
                    warnings.push({ type: "residual-footprint", kind: kind, index: i });
                }
            }
        }
        return warnings;
    }

    // Build a "T" the exact way the client does — the crypto/transport envelope (seal, probe
    // salt, seq, ledger) carries the real values the server validates, while the three detection
    // fields come from `det` (flags / untrusted / probeResult). With no `det` they are all 0, i.e.
    // an EMPTY report: the loader cancels the client's own "T" and sends this instead.
    function telemetryConstruct(ctx, det) {
        det = det || {};
        const seal = ctx && ctx.sealReport != null ? ctx.sealReport : 0;
        const salt = ctx && ctx.probeSalt != null ? ctx.probeSalt : 0;
        const out = [det.flags | 0, det.untrusted | 0, det.probeResult | 0, seal, salt];
        // Pinned connections also report seq + ledger; ctx supplies them.
        if (ctx && ctx.seq != null && ctx.ledger != null) out.push(ctx.seq, ctx.ledger >>> 0);
        return out;
    }

    return {
        version: 2,
        incoming,
        outgoing,
        outgoingParse,
        rateLimits,
        // What this loader was built to speak. core/notice.js watches the live connection and
        // compares the real server's behaviour against this; a difference it can't absorb
        // raises the mismatch popup.
        contract: {
            ioInitFields: IO_INIT_FIELDS,
            telemetryFields: TELEMETRY_FIELDS,
            c2s: outgoingKeys(outgoing),
            s2c: Object.keys(incoming)
        },
        // The outgoing packet that answers the server's integrity probes ("q"). The server
        // expects "T" = [flags, untrustedEvents, probeResult, seal, probeSalt, seq, ledger], only
        // in reply to a "q" round. It matches `seal` against the bundle it served, `salt` against
        // that round, and `seq` / `ledger` against its own running view of the c2s frame stream.
        //
        // The loader does NOT forward the client's own "T": core/antidetect.js cancels it and
        // calls `construct` to build a fresh one. The crypto/transport envelope (seal from
        // ctx.sealReport, the round's probe salt, and the loader's own re-encoded-stream seq +
        // ledger) is correct so the server accepts it, while the three detection fields are left
        // EMPTY (0) — flags, untrusted events and probe result all report nothing. `inspect`
        // decodes what the client's "T" would have said, so the loader can log what it cancelled.
        telemetry: {
            wire: "T",
            inspect: telemetryInspect,
            construct: telemetryConstruct,
            // Strip loader/mod footprint bits from the client's probe answer, keeping canaries.
            cleanProbeResult,
            // Self-protection: flags anything the sanitiser could NOT account for (a brand-new
            // probe kind, a strip that silently failed, a blinded telemetry global). Detection
            // only — it never changes what is sent. core/antidetect.js runs it on every "T".
            auditProbeResult,
            telemetryGlobalHealthy,
            knownProbeKinds: KNOWN_PROBE_KINDS.slice(),
            // Back-compat shim: an empty "T" built from ctx (same as construct(ctx)).
            scrub: (args, ctx) => telemetryConstruct(ctx)
        }
    };

    function outgoingKeys(map) {
        const wires = [];
        for (const k in map) if (map[k] && map[k].wire) wires.push(map[k].wire);
        return wires;
    }
});


/* ===== module: net/socket (loader/src/net/socket.js) ===== */
/*
 * moomoo.js loader — ANTI-CHEAT BYPASS  (undetectable WebSocket hook)
 * ===================================================================
 * FOR USE ON YOUR OWN PRIVATE SERVER / EDUCATIONAL USE ONLY.
 *
 * The server's anti-tamper (see server/src/anticheat) relies on the official
 * client reporting a telemetry packet "T" = [flags, untrustedEvents]. The
 * SOCKET_HOOKED bit (value 2) is set by this exact client check:
 *
 *     ( window.WebSocket !== pr )                 // pr = ref captured at client init
 *   || !looksNative( WebSocket.prototype.send )   // Function.prototype.toString must say [native code]
 *
 * So a hook is invisible if BOTH stay false. We achieve that by:
 *   1. Replacing window.WebSocket with a Proxy of the NATIVE constructor, and
 *      installing it at document-start — BEFORE the client captures `pr`. The
 *      client therefore captures OUR proxy as `pr`, and later `window.WebSocket
 *      === pr` holds.
 *   2. Replacing WebSocket.prototype.send with a Proxy of the NATIVE send. A
 *      Proxy of a function is transparent to Function.prototype.toString — it
 *      still reports "[native code]" — so looksNative() stays satisfied, while
 *      the apply trap lets us see and rewrite every outgoing frame.
 *
 * Why the prototype (not per-socket): the official client caches
 *   dl = window.WebSocket.prototype.send
 * and sends with `dl.call(socket, frame)`. That bypasses any per-instance
 * `socket.send` override, so a per-socket hook never sees the client's frames —
 * which breaks both sequence ownership (injected packets collide -> the server
 * closes with "bad sequence") and the telemetry scrub. Hooking the prototype is
 * the only place that catches `dl.call(...)`.
 *
 * The loader re-encodes every frame this trap surfaces through ONE sequence
 * counter (client frames + injected frames alike) and scrubs the outgoing "T"
 * telemetry (binding.telemetry.scrub) so the server always sees clean flags.
 *
 * Part of the LOADER (the volatile half).
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooSocket = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooSocket = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    /*
     * Install the undetectable WebSocket proxy on `win`.
     *   onSocket(ws, url)  -> called for every new socket so the loader can
     *                         attach its (passive) read + (active) send hooks.
     *   onError(err)       -> optional error reporter.
     * Returns the native WebSocket constructor (handy for the loader).
     */
    function installWebSocketProxy(win, onSocket, onError) {
        const NativeWebSocket = win.WebSocket;
        if (!NativeWebSocket) throw new Error("no WebSocket to hook");
        const report = (e) => { try { onError && onError(e); } catch (_) {} };

        // Per-socket outgoing transform + native-send, kept in WeakMaps. NOTHING is
        // ever written to the socket object — no own properties, no symbols — so the
        // client's "own properties/symbols were added to the socket" integrity check
        // (SOCKET_TAMPERED) finds a pristine socket. The loader drives a socket through
        // the setTransform / nativeSend helpers returned below, keyed by the socket.
        const transforms = new WeakMap();
        const NativeProtoSend = NativeWebSocket.prototype && NativeWebSocket.prototype.send;

        // Replace WebSocket.prototype.send with a Proxy of the native send. The
        // client's `dl.call(socket, frame)` lands here; we hand the frame to that
        // socket's transform (re-encode + scrub) and send the result natively.
        if (NativeProtoSend) {
            const sendProxy = new Proxy(NativeProtoSend, {
                apply(target, ws, args) {
                    const transform = ws && transforms.get(ws);
                    if (!transform) return Reflect.apply(target, ws, args); // non-game socket / not ready yet
                    try {
                        const out = transform(args[0], (d) => Reflect.apply(target, ws, [d]));
                        //   undefined -> transform already sent (or dropped); do nothing
                        //   a value   -> send it natively
                        if (out !== undefined) Reflect.apply(target, ws, [out]);
                        return undefined;
                    } catch (e) {
                        report(e);
                        return Reflect.apply(target, ws, args); // fail open: never break the game
                    }
                }
            });
            const orig = Object.getOwnPropertyDescriptor(NativeWebSocket.prototype, "send") || {};
            try {
                Object.defineProperty(NativeWebSocket.prototype, "send", {
                    value: sendProxy,
                    writable: "writable" in orig ? orig.writable : true,
                    enumerable: "enumerable" in orig ? orig.enumerable : false,
                    configurable: "configurable" in orig ? orig.configurable : true
                });
            } catch (e) {
                try { NativeWebSocket.prototype.send = sendProxy; } catch (_) { report(e); }
            }
        }

        const handler = {
            construct(target, args, newTarget) {
                const ws = Reflect.construct(target, args, newTarget === Proxied ? target : newTarget);
                try { onSocket && onSocket(ws, args && args[0]); } catch (e) { report(e); }
                return ws;
            },
            // Pass-through for everything. receiver=target keeps native getter
            // semantics and avoids proxy-as-receiver edge cases.
            get(target, prop, receiver) {
                return Reflect.get(target, prop, target);
            },
            set(target, prop, value) { return Reflect.set(target, prop, value); },
            has(target, prop) { return Reflect.has(target, prop); },
            deleteProperty(target, prop) { return Reflect.deleteProperty(target, prop); },
            defineProperty(target, prop, desc) { return Reflect.defineProperty(target, prop, desc); },
            getOwnPropertyDescriptor(target, prop) { return Reflect.getOwnPropertyDescriptor(target, prop); },
            ownKeys(target) { return Reflect.ownKeys(target); },
            getPrototypeOf(target) { return Reflect.getPrototypeOf(target); },
            setPrototypeOf(target, proto) { return Reflect.setPrototypeOf(target, proto); },
            // WebSocket must be called with `new`; forward apply anyway so the
            // native "Failed to construct" error is produced, not a proxy error.
            apply(target, thisArg, args) { return Reflect.apply(target, thisArg, args); }
        };

        const Proxied = new Proxy(NativeWebSocket, handler);

        // The integrity probe "SOCKET_WRAPPED" (kind 5) flags WebSocket when
        //   WebSocket.prototype.constructor !== WebSocket
        // On a real client those are the same object; our Proxy breaks that (the native
        // prototype's `constructor` still points at the native constructor, not the Proxy),
        // which is a detectable fingerprint. Point the prototype's constructor back at the
        // Proxy so the invariant holds again. `constructor` is a plain data property, read by
        // almost nothing, and a Proxy of the native constructor still stringifies as native.
        try {
            const cd = Object.getOwnPropertyDescriptor(NativeWebSocket.prototype, "constructor") || {};
            Object.defineProperty(NativeWebSocket.prototype, "constructor", {
                value: Proxied,
                writable: "writable" in cd ? cd.writable : true,
                enumerable: "enumerable" in cd ? cd.enumerable : false,
                configurable: "configurable" in cd ? cd.configurable : true
            });
        } catch (e) { report(e); }

        // Replace the global. Define it the same way the platform does so a
        // descriptor probe sees nothing unusual. If the property can't be written
        // (a frozen WebSocket, or a userscript sandbox realm where it's read-only)
        // don't throw out of here and abort the whole loader — report it and carry
        // on. window.MooMoo still comes up; the fix is to run in page context
        // (@inject-into page / @grant none).
        let swapped = false;
        try {
            Object.defineProperty(win, "WebSocket", {
                value: Proxied, writable: true, enumerable: false, configurable: true
            });
            swapped = win.WebSocket === Proxied;
        } catch (e1) {
            try { win.WebSocket = Proxied; swapped = win.WebSocket === Proxied; }
            catch (e2) { /* handled below */ }
        }
        if (!swapped) {
            report(new Error("could not replace window.WebSocket (read-only in this realm). " +
                "Run the userscript in page context: Violentmonkey -> @inject-into page, Tampermonkey -> @grant none."));
        }
        // The loader drives sockets through these, keyed by the socket object, so the
        // socket itself stays untouched (nothing to enumerate on it).
        return {
            native: NativeWebSocket,
            setTransform: (ws, fn) => { try { transforms.set(ws, fn); } catch (e) { report(e); } },
            nativeSend: (ws, data) => Reflect.apply(NativeProtoSend, ws, [data])
        };
    }

    return { installWebSocketProxy };
});


/* ===== module: net/outgoing (loader/src/net/outgoing.js) ===== */
/*
 * moomoo.js loader — OUTGOING  (rate governor + packet accounting + ping)
 * ======================================================================
 * Every frame that leaves the socket — the official client's own frames AND
 * frames mods inject — passes through here first.
 *
 *  1. GOVERNOR. The server keeps a token bucket per packet type plus a global
 *     one (server/src/anticheat/config.js, mirrored in binding.rateLimits).
 *     Going over a bucket costs a strike and 40 strikes is a kick. The official
 *     client is tuned to stay under them on its own, but client + mod together
 *     can exceed a bucket (e.g. both selecting items in one tick). The governor
 *     mirrors the buckets with a safety margin and refuses a frame that would
 *     overflow, so the server never sees a burst it would strike. It is the same
 *     idea as the bundle's own packet limiter (packet.send refused to send past
 *     120 packets per 9 ticks), just keyed to this server's real limits.
 *
 *  2. ACCOUNTING. Counts sent frames per second / per minute / per type, and
 *     what the governor refused, for the "packet count" visual and diagnostics.
 *
 *  3. PING. The official client pings every 2.5s on its own; timing those
 *     round trips gives the mod a ping without sending a single extra packet
 *     (the bundle pinged every 400ms, which this server's "0" bucket [2/s]
 *     would strike).
 *
 * Part of the LOADER (volatile).
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooOutgoing = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooOutgoing = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    // Margin against network jitter bunching packets together on the way to the
    // server: refill a little slower and keep a couple of tokens in reserve.
    const RATE_MARGIN = 0.9;
    const BURST_RESERVE = 2;
    // Never refused: telemetry (a missing heartbeat is itself a kick) and spawn.
    const NEVER_DROP = new Set(["T", "M"]);

    class Bucket {
        constructor(spec, now) {
            const [perSecond, burst] = spec;
            this.rate = (perSecond * RATE_MARGIN) / 1000;
            this.capacity = Math.max(1, burst - BURST_RESERVE);
            this.tokens = this.capacity;
            this.updated = now;
        }
        refill(now) {
            this.tokens = Math.min(this.capacity, this.tokens + (now - this.updated) * this.rate);
            this.updated = now;
        }
        canTake(now) { this.refill(now); return this.tokens >= 1; }
        take() { this.tokens -= 1; }
    }

    function createOutgoing(opts) {
        opts = opts || {};
        const limits = opts.rateLimits || { global: [150, 300], packets: {} };
        const clock = opts.now || (() => Date.now());

        let enabled = opts.enabled !== false;
        let global = new Bucket(limits.global, clock());
        let buckets = Object.create(null);
        const bucketFor = (wire, now) => {
            const spec = limits.packets[wire];
            if (!spec) return null;
            return buckets[wire] || (buckets[wire] = new Bucket(spec, now));
        };

        // ---- governor ----
        // allow(wire) checks AND consumes; a refused frame consumes nothing.
        function allow(wire) {
            const now = clock();
            if (!enabled || NEVER_DROP.has(wire)) {
                const b = bucketFor(wire, now);
                global.refill(now); if (global.tokens >= 1) global.take();
                if (b) { b.refill(now); if (b.tokens >= 1) b.take(); }
                return true;
            }
            const b = bucketFor(wire, now);
            if (!global.canTake(now) || (b && !b.canTake(now))) {
                stats.refused++;
                stats.refusedByType[wire] = (stats.refusedByType[wire] || 0) + 1;
                for (const fn of refusedTaps) { try { fn(wire); } catch (e) { /* ignore */ } }
                return false;
            }
            global.take();
            if (b) b.take();
            return true;
        }
        // Would a frame of this type be accepted right now? (does not consume)
        function wouldAllow(wire) {
            const now = clock();
            if (!enabled || NEVER_DROP.has(wire)) return true;
            const b = bucketFor(wire, now);
            return global.canTake(now) && (!b || b.canTake(now));
        }
        function tokens(wire) {
            const now = clock();
            const b = bucketFor(wire, now);
            if (!b) return Infinity;
            b.refill(now);
            return b.tokens;
        }

        // ---- accounting ----
        const stats = { sent: 0, refused: 0, refusedByType: Object.create(null), byType: Object.create(null) };
        const secondWindow = [];       // timestamps of frames sent in the last 1s
        const minuteWindow = [];       // ... last 60s
        const refusedTaps = new Set();
        function record(wire) {
            const now = clock();
            stats.sent++;
            stats.byType[wire] = (stats.byType[wire] || 0) + 1;
            secondWindow.push(now);
            minuteWindow.push(now);
            prune(now);
        }
        function prune(now) {
            while (secondWindow.length && now - secondWindow[0] > 1000) secondWindow.shift();
            while (minuteWindow.length && now - minuteWindow[0] > 60000) minuteWindow.shift();
        }
        function perSecond() { prune(clock()); return secondWindow.length; }
        function perMinute() { prune(clock()); return minuteWindow.length; }

        // ---- ping (timed off the client's own "0" -> pong round trips) ----
        const pingSamples = [];
        let pingSentAt = 0;
        let lastPing = 0;
        function onPingSent() { pingSentAt = clock(); }
        function onPong() {
            if (!pingSentAt) return null;
            lastPing = clock() - pingSentAt;
            pingSentAt = 0;
            pingSamples.push(lastPing);
            if (pingSamples.length >= 4) pingSamples.shift();   // bundle keeps the last 3 (yt)
            return lastPing;
        }
        function avgPing() {
            if (!pingSamples.length) return 0;
            return pingSamples.reduce((a, b) => a + b, 0) / pingSamples.length;
        }
        // the quickest recent round trip: the safe side when timing when a frame
        // reaches the server (shame timing)
        function minPing() {
            if (!pingSamples.length) return 0;
            return Math.min.apply(null, pingSamples);
        }

        function reset() {
            const now = clock();
            global = new Bucket(limits.global, now);
            buckets = Object.create(null);
            pingSentAt = 0;
        }

        return {
            allow, wouldAllow, tokens, record,
            perSecond, perMinute, stats,
            onRefused: (fn) => { refusedTaps.add(fn); return () => refusedTaps.delete(fn); },
            onPingSent, onPong,
            get ping() { return lastPing; },
            avgPing, minPing,
            setEnabled: (b) => { enabled = !!b; },
            get enabled() { return enabled; },
            reset,
            RATE_MARGIN, BURST_RESERVE
        };
    }

    return { createOutgoing, Bucket };
});


/* ===== module: core/runtime (loader/src/core/runtime.js) ===== */
/*
 * moomoo.js loader — RUNTIME  (the stable API mods speak to)
 * ==========================================================
 * This is the "executor" surface: window.MooMoo. It is the half that NEVER
 * changes. It knows the vocabulary of semantic packets but nothing about the
 * wire. The loader feeds it decoded events and it:
 *   - tracks a tidy game state (self, players)
 *   - lets mods subscribe:   MooMoo.on("health", ({sid, value}) => ...)
 *   - lets mods act:         MooMoo.send.chat("gg")
 *   - lets mods run on join:  MooMoo.onReady(() => ...)
 *
 * Mods only ever see this object. Compiled moomoo.js plugins target it too.
 */
(function (root, factory) {
    const vocab = (typeof require === "function") ? require("../../../shared/vocabulary.js") : root.MooMooVocabulary;
    const value = factory(vocab);
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooRuntime = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooRuntime = value;
})(typeof self !== "undefined" ? self : this, function (vocab) {
    "use strict";

    function createRuntime(options) {
        const opts = options || {};
        // The loader supplies this sink to actually put packets on the wire.
        const sink = opts.sink || { sendAction() {}, sendRaw() {} };
        const logPrefix = opts.logPrefix || "%c[moomoo.js]";
        const logStyle = opts.logStyle || "color:#7cc;font-weight:bold";

        const listeners = new Map();   // event -> Set<handler>
        const readyCbs = [];
        let ready = false;
        // The loader injects game-specific ctx helpers here (see buildCtx). Set at
        // creation via opts, or later via _setCtxExtensions (helpers often need to
        // reference the finished MooMoo object, so they're wired after creation).
        let ctxExtensions = opts.ctxExtensions || null;

        // ---- game state ----
        const players = new Map();     // sid -> player object
        // The server only sends your inventory ("V") when it CHANGES (on upgrade);
        // on spawn you start from the fixed default loadout, exactly like the client
        // (server player.js: items [0,3,6,10]; the client seeds weapons [0]). We seed
        // the same so loadout-aware features know the starting kit before any upgrade.
        const DEFAULT_WEAPONS = [0];              // tool hammer
        const DEFAULT_ITEMS = [0, 3, 6, 10];      // apple, wood wall, spikes, windmill
        const self = {
            sid: -1, alive: false, health: 0, x: 0, y: 0, dir: 0,
            weaponIndex: 0, buildIndex: -1, hat: 0, accessory: 0,
            weapons: DEFAULT_WEAPONS.slice(), items: DEFAULT_ITEMS.slice()  // owned weapon ids / buildable item ids
        };

        function playerFor(sid) {
            let pl = players.get(sid);
            if (!pl) { pl = { sid }; players.set(sid, pl); }
            return pl;
        }

        // Keep the convenience state in sync with incoming events. This is best
        // effort and additive: it never blocks a mod's own handler.
        function updateState(event, payload) {
            switch (event) {
                case "setup":
                    self.sid = payload.sid;
                    self.alive = true;
                    self.weapons = DEFAULT_WEAPONS.slice();
                    self.items = DEFAULT_ITEMS.slice();
                    playerFor(payload.sid);
                    break;
                case "health": {
                    const pl = playerFor(payload.sid);
                    pl.health = payload.value;
                    if (payload.sid === self.sid) self.health = payload.value;
                    break;
                }
                case "playerAdd":
                    // You (re)spawned: the server reset your kit to defaults (it won't
                    // resend "V"), so mirror that locally.
                    if (payload.isYou && Array.isArray(payload.data)) {
                        self.alive = true;
                        self.weapons = DEFAULT_WEAPONS.slice();
                        self.items = DEFAULT_ITEMS.slice();
                    }
                    break;
                case "playerRemove":
                    players.delete(payload.sid);
                    break;
                case "playersUpdate":
                    for (const pos of payload.positions) {
                        const pl = playerFor(pos.sid);
                        pl.x = pos.x; pl.y = pos.y; pl.dir = pos.dir; pl.visible = true;
                        if (pos.sid === self.sid) { self.x = pos.x; self.y = pos.y; self.dir = pos.dir; }
                    }
                    // Attributes are sent only when changed — persist them per player.
                    if (payload.attributes) for (const at of payload.attributes) {
                        const pl = playerFor(at.sid);
                        pl.weaponIndex = at.weaponIndex; pl.buildIndex = at.buildIndex;
                        pl.variant = at.variant; pl.team = at.team; pl.isLeader = at.isLeader;
                        pl.skin = at.skin; pl.tail = at.tail;
                        pl.icon = at.icon; pl.zIndex = at.zIndex;
                        if (at.sid === self.sid) {
                            self.weaponIndex = at.weaponIndex; self.buildIndex = at.buildIndex;
                            self.hat = at.skin; self.accessory = at.tail; self.team = at.team;
                            self.weaponVariant = at.variant;
                            self.isLeader = at.isLeader; self.icon = at.icon; self.zIndex = at.zIndex;
                        }
                    }
                    for (const sid of payload.hidden) {
                        const pl = players.get(sid);
                        if (pl) pl.visible = false;
                    }
                    break;
                case "inventory":
                    if (payload.isWeapon) self.weapons = payload.list || [];
                    else self.items = payload.list || [];
                    break;
                case "playerValue":
                    // points, kills, wood, food, stone, gold, ...
                    self[payload.key] = payload.value;
                    break;
                case "died":
                    self.alive = false;
                    break;
                default:
                    break;
            }
        }

        // ---- event plumbing ----
        function on(event, handler) {
            if (event !== "*" && !vocab.isEvent(event)) console.warn(logPrefix + " unknown event: " + event, logStyle);
            let set = listeners.get(event);
            if (!set) { set = new Set(); listeners.set(event, set); }
            set.add(handler);
            return () => off(event, handler);
        }
        function off(event, handler) {
            const set = listeners.get(event);
            if (set) set.delete(handler);
        }
        function once(event, handler) {
            const wrap = (payload) => { off(event, wrap); handler(payload); };
            return on(event, wrap);
        }

        // ---- outgoing hooks ----
        // onOutgoing(action, fn): see (and optionally change) every frame the
        // OFFICIAL CLIENT tries to send, by vocabulary action name ("aim", "move",
        // "mouse", "selectItem", "toggle", "store", ... or "*" for all).
        //   fn(payload, info, action) returns
        //     undefined      -> send it unchanged
        //     false / null   -> drop it (it never reaches the server)
        //     an object      -> send this payload instead
        // This is how a mod takes over a control the client normally owns (the
        // bundle replaced the client's own aim/move/attack sending with its own).
        const outFilters = new Map();   // action -> Set<fn>
        const sentTaps = new Set();     // fn(action, payload, source)
        function onOutgoing(action, fn) {
            let set = outFilters.get(action);
            if (!set) { set = new Set(); outFilters.set(action, set); }
            set.add(fn);
            return () => set.delete(fn);
        }
        function _filterOutgoing(action, payload, info) {
            let cur = payload;
            const sets = [outFilters.get(action), outFilters.get("*")];
            for (const set of sets) {
                if (!set) continue;
                for (const fn of Array.from(set)) {
                    let r;
                    try { r = fn(cur, info || {}, action); }
                    catch (e) { console.error(logPrefix + " outgoing filter for '" + action + "' threw", logStyle, e); continue; }
                    if (r === false || r === null) return null;
                    if (r && typeof r === "object") cur = r;
                }
            }
            return cur;
        }
        // onSent(fn): every frame that actually went out (client or mod), after
        // the rate governor. fn(action, payload, source) with source "client"|"mod".
        function onSent(fn) { sentTaps.add(fn); return () => sentTaps.delete(fn); }
        function _notifySent(action, payload, source) {
            for (const fn of Array.from(sentTaps)) { try { fn(action, payload, source); } catch (e) { /* ignore */ } }
        }

        // Called by the loader for every decoded incoming packet.
        function _dispatch(event, payload) {
            updateState(event, payload);
            const set = listeners.get(event);
            if (set) {
                for (const h of Array.from(set)) {
                    try { h(payload); }
                    catch (e) { console.error(logPrefix + " handler for '" + event + "' threw", logStyle, e); }
                }
            }
            const star = listeners.get("*");
            if (star) for (const h of Array.from(star)) { try { h(event, payload); } catch (e) { /* ignore */ } }
        }

        function _setReady(value) {
            if (ready) return;
            ready = value !== false;
            if (!ready) return;
            while (readyCbs.length) {
                const cb = readyCbs.shift();
                try { cb(); } catch (e) { console.error(logPrefix + " onReady callback threw", logStyle, e); }
            }
        }

        function onReady(cb) {
            if (ready) { try { cb(); } catch (e) { console.error(e); } }
            else readyCbs.push(cb);
        }

        // Called by the loader when a brand-new connection is adopted, so stale
        // players from a previous life don't linger. Keeps the same `self` and
        // `players` objects alive (mods may hold references to them).
        function _reset() {
            players.clear();
            self.sid = -1; self.alive = false; self.health = 0; self.x = 0; self.y = 0; self.dir = 0;
            self.weaponIndex = 0; self.buildIndex = -1; self.hat = 0; self.accessory = 0;
            self.weapons = DEFAULT_WEAPONS.slice(); self.items = DEFAULT_ITEMS.slice();
        }

        // ---- outgoing: build send.<action>(...) from the vocabulary ----
        const send = {};
        for (const action of vocab.actionNames) {
            const spec = vocab.actions[action];
            const pnames = spec.params.map((x) => x.name);
            send[action] = function () {
                const a = arguments;
                let payload;
                // Accept either positional args or a single {named} object.
                if (a.length === 1 && a[0] && typeof a[0] === "object" && !Array.isArray(a[0]) &&
                    pnames.some((n) => n in a[0])) {
                    payload = a[0];
                } else {
                    payload = {};
                    for (let i = 0; i < pnames.length; i++) payload[pnames[i]] = a[i];
                }
                return sink.sendAction(action, payload);
            };
        }
        // Escape hatch: send a raw wire packet by letter (advanced / debugging).
        send.raw = (wire, args) => sink.sendRaw(wire, args || []);

        // ---- MOD REGISTRY (enable/disable at runtime + per-mod settings) ----
        const mods = new Map();          // id -> record
        const modListeners = new Set();  // fn(getMods())

        // ---- PERSISTENCE (kept out of localStorage while the page is open) ----
        // A localStorage key is enumerable (Object.keys(localStorage)), so any key we
        // leave there is something an integrity probe could hash and look for. So we
        // never keep one around during play: at startup every moomoo.js key is read
        // into memory and WIPED from localStorage (this runs at document-start, long
        // before the server's first probe), kept in memory for the session, and written
        // back only as the page unloads — when the socket is already closing and no probe
        // can run. Mid-session, Object.keys(localStorage) shows nothing of ours.
        const STORE_PREFIX = "moomoojs:mod:";    // per-mod enable-state + settings
        const CFG_PREFIX = "moomoojs:cfg:";      // a mod's own config blob (e.g. a big prefs object)
        // old plain-text keys the mods used to write -> their new home (migrated, then removed)
        const LEGACY = { "mml_v1": CFG_PREFIX + "lite" };
        const LEGACY_DROP = ["mmp_menu_v1", "mmp_menu_v2", "mmp_stock_look_v1"];   // leftover keys from older builds: wiped
        const mem = {};                  // full key -> parsed value (the live store)
        const ls = () => { try { return (typeof localStorage !== "undefined") ? localStorage : null; } catch (e) { return null; } };
        (function hydrate() {
            const s = ls(); if (!s) return;
            try {
                const keys = [];
                for (let i = 0; i < s.length; i++) keys.push(s.key(i));
                for (const k of keys) {
                    if (k && (k.indexOf(STORE_PREFIX) === 0 || k.indexOf(CFG_PREFIX) === 0)) {
                        try { mem[k] = JSON.parse(s.getItem(k)); } catch (e) { mem[k] = {}; }
                        s.removeItem(k);
                    } else if (k && LEGACY[k]) {
                        try { mem[LEGACY[k]] = JSON.parse(s.getItem(k)); } catch (e) { /* drop bad json */ }
                        s.removeItem(k);
                    } else if (k && LEGACY_DROP.indexOf(k) >= 0) {
                        s.removeItem(k);
                    }
                }
            } catch (e) { /* ignore */ }
        })();
        function flush() {
            const s = ls(); if (!s) return;
            for (const k in mem) { try { s.setItem(k, JSON.stringify(mem[k])); } catch (e) { /* quota / unavailable */ } }
        }
        try {
            if (typeof window !== "undefined" && window.addEventListener) {
                window.addEventListener("pagehide", flush, false);
                window.addEventListener("beforeunload", flush, false);
            }
        } catch (e) { /* non-DOM env */ }

        function loadPersist(id) { const v = mem[STORE_PREFIX + id]; return (v && typeof v === "object") ? v : {}; }
        function savePersist(id, data) { mem[STORE_PREFIX + id] = data; }   // memory only; flushed on unload
        // Exposed to mods (MooMooLoader.config) so they persist config without a key of their own.
        const config = {
            get(id) { const v = mem[CFG_PREFIX + id]; return (v && typeof v === "object") ? v : null; },
            set(id, obj) { mem[CFG_PREFIX + id] = obj; }
        };
        const slug = (s) => String(s || "mod").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "mod";
        const titleCase = (s) => String(s).replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

        function normalizeSetting(s) {
            const type = s.type || (typeof s.default === "boolean" ? "boolean" : typeof s.default === "number" ? "number" : s.options ? "select" : "string");
            return {
                key: s.key, type,
                default: s.default !== undefined ? s.default : (type === "boolean" ? false : type === "number" ? 0 : type === "key" ? "" : ""),
                label: s.label || titleCase(s.key),
                options: s.options || null,
                min: s.min, max: s.max, step: s.step,
                category: s.category || null,   // which menu section it belongs to
                hint: s.hint || null,           // small helper text under the control
                basic: !!s.basic                // shown in the in-game Mods tab (vs the mod's own menu)
            };
        }

        function emitModsChanged() {
            const list = getMods();
            for (const fn of Array.from(modListeners)) { try { fn(list); } catch (e) { /* ignore */ } }
        }

        function buildCtx(rec) {
            const active = { unsubs: [], timers: [], timeouts: [], cleanups: [] };
            const settings = {};
            for (const s of rec.schema) Object.defineProperty(settings, s.key, {
                get: () => rec.values[s.key],
                set: (v) => { setSetting(rec.id, s.key, v); },
                enumerable: true
            });
            rec._active = active;
            const ctx = {
                mod: { id: rec.id, name: rec.name, version: rec.version },
                settings,
                self, players,
                player: (sid) => players.get(sid),
                send,
                on: (ev, h) => { const un = on(ev, h); active.unsubs.push(un); return un; },
                once: (ev, h) => { const un = once(ev, h); active.unsubs.push(un); return un; },
                every: (ms, fn) => { const t = setInterval(fn, ms); active.timers.push(t); return t; },
                // One-shot timer, cleared if the mod is disabled first.
                after: (ms, fn) => {
                    const t = setTimeout(() => { const i = active.timeouts.indexOf(t); if (i >= 0) active.timeouts.splice(i, 1); fn(); }, ms);
                    active.timeouts.push(t);
                    return t;
                },
                onOutgoing: (action, fn) => { const un = onOutgoing(action, fn); active.unsubs.push(un); return un; },
                onSent: (fn) => { const un = onSent(fn); active.unsubs.push(un); return un; },
                onCleanup: (fn) => { active.cleanups.push(fn); },
                // Live-settings mods react to a toggle/slider change here instead of
                // being torn down and re-run. fn(key, newValue, oldValue).
                onSettingChange: (fn) => { rec.settingCbs.add(fn); active.cleanups.push(() => rec.settingCbs.delete(fn)); return () => rec.settingCbs.delete(fn); },
                setSetting: (key, value) => setSetting(rec.id, key, value),
                log: function () { console.log(logPrefix + " " + rec.name, logStyle, ...arguments); }
            };
            // The loader injects game-specific helpers (input, game data, combat,
            // config menu) through ctxExtensions. They go onto a per-mod `active`
            // scope so anything they register is torn down with the mod.
            if (ctxExtensions) {
                try {
                    const extra = typeof ctxExtensions === "function" ? ctxExtensions(ctx, rec, active) : ctxExtensions;
                    if (extra) for (const k in extra) if (!(k in ctx)) ctx[k] = extra[k];
                } catch (e) { console.error(logPrefix + " ctxExtensions threw", logStyle, e); }
            }
            return ctx;
        }

        function teardown(rec) {
            const a = rec._active;
            if (!a) return;
            for (const un of a.unsubs) { try { un(); } catch (e) { /* ignore */ } }
            for (const t of a.timers) { try { clearInterval(t); } catch (e) { /* ignore */ } }
            for (const t of a.timeouts) { try { clearTimeout(t); } catch (e) { /* ignore */ } }
            for (const c of a.cleanups) { try { c(); } catch (e) { /* ignore */ } }
            rec._active = null;
        }

        function runSetup(rec) {
            const ctx = buildCtx(rec);
            try {
                const cleanup = rec.setup(ctx);
                if (typeof cleanup === "function") rec._active.cleanups.push(cleanup);
                return true;
            } catch (e) {
                console.error(logPrefix + " mod '" + rec.id + "' setup threw", logStyle, e);
                teardown(rec);
                return false;
            }
        }

        function register(meta, setup) {
            meta = meta || {};
            const id = meta.id || slug(meta.name);
            if (mods.has(id)) { console.warn(logPrefix + " mod already registered: " + id, logStyle); return mods.get(id); }
            const schema = (meta.settings || []).map(normalizeSetting);
            const persisted = loadPersist(id);
            const values = {};
            for (const s of schema) values[s.key] = (persisted.settings && s.key in persisted.settings) ? persisted.settings[s.key] : s.default;
            const rec = {
                id, name: meta.name || id, version: meta.version || "1.0.0",
                description: meta.description || "", schema, setup, values,
                enabled: false, _active: null,
                // A big mod with many live-read settings can opt out of the
                // teardown+re-run that setSetting does by default, so toggling one
                // setting doesn't reset every timer/handler. It just reads the new
                // value live (settings getters are always current), and may react
                // via onSettingChange.
                reapply: !(meta.liveSettings === true || meta.reapplyOnSettingChange === false),
                settingCbs: new Set(),
                menu: meta.menu,            // true = the mod has its own in-game menu
                menuHint: meta.menuHint || null   // line shown in the Mods tab pointing at that menu
            };
            mods.set(id, rec);
            const startEnabled = persisted.enabled !== undefined ? persisted.enabled : (meta.defaultEnabled !== false);
            if (startEnabled && runSetup(rec)) rec.enabled = true;
            savePersist(id, { enabled: rec.enabled, settings: rec.values });
            emitModsChanged();
            return rec;
        }

        function enable(id) {
            const rec = mods.get(id);
            if (!rec || rec.enabled) return;
            if (runSetup(rec)) { rec.enabled = true; savePersist(id, { enabled: true, settings: rec.values }); emitModsChanged(); }
        }
        function disable(id) {
            const rec = mods.get(id);
            if (!rec || !rec.enabled) return;
            teardown(rec);
            rec.enabled = false;
            savePersist(id, { enabled: false, settings: rec.values });
            emitModsChanged();
        }
        function setModEnabled(id, on_) { on_ ? enable(id) : disable(id); }

        function setSetting(id, key, value) {
            const rec = mods.get(id);
            if (!rec) return;
            const old = rec.values[key];
            rec.values[key] = value;
            savePersist(id, { enabled: rec.enabled, settings: rec.values });
            if (rec.enabled) {
                if (rec.reapply) { teardown(rec); runSetup(rec); } // re-apply with the new value
                else for (const cb of Array.from(rec.settingCbs)) { try { cb(key, value, old); } catch (e) { /* ignore */ } }
            }
            emitModsChanged();
        }

        function getMods() {
            return Array.from(mods.values()).map((rec) => ({
                id: rec.id, name: rec.name, version: rec.version, description: rec.description,
                enabled: rec.enabled, hasSettings: rec.schema.length > 0, menu: rec.menu, menuHint: rec.menuHint,
                settings: rec.schema.map((s) => ({ key: s.key, type: s.type, label: s.label, options: s.options, min: s.min, max: s.max, step: s.step, category: s.category, hint: s.hint, basic: s.basic, value: rec.values[s.key] }))
            }));
        }
        function onModsChanged(cb) { modListeners.add(cb); return () => modListeners.delete(cb); }

        // Tear down and forget every mod (used by the playground preview to
        // re-register a freshly compiled mod without an "already registered" clash).
        function _clearMods() {
            for (const rec of mods.values()) teardown(rec);
            mods.clear();
            emitModsChanged();
        }

        function log() {
            const args = Array.prototype.slice.call(arguments);
            console.log(logPrefix, logStyle, ...args);
        }

        const MooMoo = {
            version: opts.version || "0.0.0",
            vocabulary: vocab,
            loader: opts.loaderInfo || {},
            // state
            state: { self, players },
            get self() { return self; },
            get players() { return players; },
            player: (sid) => players.get(sid),
            isReady: () => ready,
            // events
            on, off, once, onReady,
            // outgoing (see onOutgoing / onSent above)
            onOutgoing, onSent,
            // actions
            send,
            // mods (managed units with enable/disable + settings)
            register, enable, disable, setModEnabled, setSetting, getMods, onModsChanged,
            isModEnabled: (id) => { const r = mods.get(id); return !!(r && r.enabled); },
            // logging
            log,
            // internal hooks used by the loader (underscore-prefixed)
            _dispatch, _setReady, _reset, _clearMods, _filterOutgoing, _notifySent,
            _config: config,
            _setCtxExtensions: (ext) => { ctxExtensions = ext; }
        };
        return MooMoo;
    }

    return { createRuntime };
});


/* ===== module: game/input (loader/src/game/input.js) ===== */
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


/* ===== module: game/objects (loader/src/game/objects.js) ===== */
/*
 * moomoo.js loader — OBJECT MANAGER  (world buildings / resources tracking)
 * ========================================================================
 * The bundle's combat features (auto place / replace / push, break spike,
 * auto emp, spike sync, insta combos) all read the world's OBJECTS: the walls,
 * spikes, traps, turrets, mills and the natural trees/stones around you. The
 * official client keeps these in an ObjectManager; the loader never ran one, so
 * we rebuild an equivalent here from the wire packets the loader already decodes.
 *
 * It mirrors the bundle's GameObject model EXACTLY (same derived fields — name,
 * group, realScale, pathScale, trap, dmg, pDmg, owner, …) so a ported feature
 * reads an object the same way it did in the bundle. The bundle calls its master
 * building list `kh`; this is that list, kept current from:
 *
 *   objectsLoad  ("H")  flat [sid,x,y,dir,scale,type,id,ownerSid] * N  -> add
 *   objectKilled ("Q")  [sid]                                          -> remove one
 *   objectsKilled("R")  [ownerSid]                                     -> remove all of an owner
 *   wiggle       ("L")  [dir,sid]                                      -> object was hit
 *   turretShoot  ("M")  [sid,dir]                                      -> turret fired (reload timer)
 *   itemCount    ("S")  [groupId,count]                               -> your placed-count per group
 *   first setup on a connection                                        -> clear
 *
 * Objects are NOT cleared when you die. The server sends each object to a
 * player only once per connection, so a respawn has to keep the old ones.
 *
 * Mechanics copied from the server (server/src/moomoo/modules/gameObject.js +
 * objectManager.js + server.js syncObjects) and the client bundle's GameObject.
 *
 * Part of the LOADER (volatile). Exposed on every mod's ctx as `ctx.objects`.
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooObjects = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooObjects = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const TURRET_RELOAD = 2200;          // turret shootRate (ms) — item 90 shootRate
    const GATHER_WIGGLE = 10;            // K.gatherWiggle — wiggle px on hit

    const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

    // A world object, modelled exactly like the bundle's GameObject so features
    // can read the same fields. `data` is the item definition (gameData.item(id))
    // for placed buildings, or null for a natural resource (tree/bush/stone).
    // The engine's "is this sid me or my clan" test (the bundle's te) and its tick
    // counter, injected by the combat engine; until then, plain self/team checks.
    const hooksRef = { te: null, tick: () => 0, millRotate: () => false };

    class GameObject {
        constructor(sid) { this.sid = sid; }

        // The bundle's Gl.init (3022-3025), argument for argument:
        //   init(x, y, dir, scale, type, data, owner, bot, _, fake, restricter, preplace)
        // owner is {sid} (or null / undefined), like the bundle's.
        init(x, y, dir, scale, type, data, owner, bot, _unused, fake, restricter, preplace) {
            const o = data || {};
            this.sentTo = {};
            this.gridLocations = [];
            this.active = true;
            this.doUpdate = o.doUpdate;
            this.x = x;
            this.y = y;
            this.dir = dir;
            this.xWiggle = 0;
            this.yWiggle = 0;
            this.scale = scale;
            this.type = type;
            this.id = o.id;
            this.owner = owner;
            this.ownerSid = owner && owner.sid != null ? owner.sid : null;
            this.name = o.name ? o.name : this.type === 0 ? "Tree" : this.type === 1 && this.y >= 12e3 ? "Cactus" : this.type === 1 ? "Bush" : this.type === 2 ? "Stone" : this.type === 3 ? "Gold Stone" : null;
            this.isItem = this.id != null;
            this.group = o.group;
            this.health = this.maxHealth = o.health;
            this.health2 = 0;
            this.buildingID = o.buildingID;
            this.setType = o.setType;
            this.layer = 2;
            this.group != null ? this.layer = this.group.layer : this.type == 0 ? this.layer = 3 : this.type == 2 ? this.layer = 0 : this.type == 4 && (this.layer = -1);
            this.colDiv = o.colDiv || 1;
            this.blocker = o.blocker;
            this.ignoreCollision = o.ignoreCollision;
            this.dontGather = o.dontGather;
            this.hideFromEnemy = o.hideFromEnemy;
            this.friction = o.friction;
            this.projDmg = o.projDmg;
            this.dmg = o.dmg;
            this.pDmg = o.pDmg;
            this.pps = o.pps;
            this.zIndex = o.zIndex || 0;
            this.turnSpeed = o.turnSpeed;
            this.req = o.req;
            this.trap = o.trap;
            this.healCol = o.healCol;
            this.teleport = o.teleport;
            this.boostSpeed = o.boostSpeed;
            this.projectile = o.projectile;
            this.opacity = o.name == "pit trap" ? 1 : 1;
            this.opacity2 = 1;
            this.fadingOut = false;
            this.dmgpot = 0;
            this.assumeBreak = false;
            this.ignoreWiggleDirs = [];
            this.wiggleDirs = [];
            this.shootRange = o.shootRange;
            this.shootRate = o.shootRate;
            this.shootCount = this.shootRate;
            this.spawnPoint = o.spawnPoint;
            this.tick = hooksRef.tick();
            this.preplace = preplace;
            this.fake = fake;
            this.bot = bot;
            this.elevation = typeof this.type === "number" && this.owner === null || this.name == "turret" || this?.group?.name === "mill" ? 2 : 1;
            this.restricter = restricter;
            this.realScale = this.type <= 1 && this.type !== null ? this.scale * 0.6 : this.scale;
            const te = hooksRef.te || (() => false);
            this.pathScale = this.type === 1 && this.y <= 12e3 ? this.scale * 0.6 + 15 : this.type === 0 ? this.scale * 0.7 + 10 : this.dmg && !te(this?.owner?.sid) || this.teleport || this.boostSpeed ? this.scale + 47 : this.type === 1 && this.y >= 12e3 ? this.scale * 0.55 + 47 : this.name == "pit trap" && !te(this?.owner?.sid) ? this.scale + 38 : this.ignoreCollision ? 0 : this.scale + 10;
            // loader runtime fields
            this.time = this.name === "turret" ? TURRET_RELOAD : undefined;
            this.shot = 0;
            this.lastHit = 0;
            this.distance = 0;
            return this;
        }

        changeHealth(e) { this.health += e; return this.health <= 0; }

        // Gl.update (bundle 3032): per render frame, the hit wiggle eases out and
        // spinning things turn (windmills only with the mod's "mill rotate").
        update(e) {
            this.active && (this.xWiggle && (this.xWiggle *= Math.pow(0.99, e)), this.yWiggle && (this.yWiggle *= Math.pow(0.99, e)), (hooksRef.millRotate() && this?.group?.name == "mill" || this?.group?.name != "mill") && this.turnSpeed && (this.dir += this.turnSpeed * e));
        }

        getScale(e, t) {
            e = e || 1;
            return this.scale * (this.isItem || this.type == 2 || this.type == 3 || this.type == 4 ? 1 : 0.6 * e) * (t ? 1 : this.colDiv);
        }

        visibleToPlayer(e) {
            return !this.hideFromEnemy || this.owner && (this.owner == e || this.owner.team && e.team == this.owner.team);
        }
    }

    function createObjectManager(env) {
        const MooMoo = env.MooMoo;
        const data = env.data;
        const S = () => MooMoo.self;

        const byId = new Map();     // sid -> GameObject
        const list = [];            // active objects (the bundle's `kh`)
        const itemCounts = {};      // groupId -> your placed count (from "S")

        function indexOfSid(sid) {
            for (let i = 0; i < list.length; i++) if (list[i].sid === sid) return i;
            return -1;
        }

        const removeTaps = new Set();   // fn(obj, cause) just before an object is forgotten
        function tapRemove(o, cause) { for (const fn of Array.from(removeTaps)) { try { fn(o, cause); } catch (e) { /* ignore */ } } }
        function removeSid(sid) {
            const o = byId.get(sid);
            if (!o) return;
            tapRemove(o, "killed");
            byId.delete(sid);
            const i = indexOfSid(sid);
            if (i >= 0) list.splice(i, 1);
        }

        function clearAll() {
            byId.clear();
            list.length = 0;
        }

        // Owner/team resolution (needs the live player table).
        function myTeam() { const s = S(); return s ? s.team : null; }
        function isSelf(sid) { const s = S(); return s != null && sid === s.sid; }
        function isTeammate(sid) {
            if (sid == null) return false;
            if (isSelf(sid)) return true;
            const me = S(); if (!me || me.team == null) return false;
            const p = MooMoo.players && MooMoo.players.get(sid);
            return !!(p && p.team != null && p.team === me.team);
        }
        // te() in the bundle: sid is me or a teammate.
        function isFriendly(sid) { return isSelf(sid) || isTeammate(sid); }
        // Is this object owned by an enemy (not me, not my team)? Unowned natural
        // resources count as non-enemy.
        function isEnemyObject(o) { return o != null && o.ownerSid != null && !isFriendly(o.ownerSid); }

        // ---- add one object (from "H"), mirroring the bundle's objectManager.add ----
        function addObject(sid, x, y, dir, scale, type, id, ownerSid) {
            const def = (id != null && id >= 0) ? data.item(id) : null;
            // The bundle's objectManager.add always creates a NEW object (no reuse
            // by sid) and pushes it to kh.
            const o = new GameObject(sid);
            const old = byId.get(sid);
            if (old) { const k = list.indexOf(old); if (k >= 0) list.splice(k, 1); }
            byId.set(sid, o); list.push(o);
            // The bundle's J2 (s2c "H"): add(sid, x, y, dir, scale, type, item, true, owner >= 0 ? {sid} : null)
            o.init(x, y, dir, scale, type, def, ownerSid >= 0 && ownerSid != null ? { sid: ownerSid } : null);
            return o;
        }

        // ---- wire handlers ----
        function onObjectsLoad(p) {
            const flat = (p && p.args && p.args[0]) || [];
            for (let n = 0; n + 7 < flat.length; n += 8) {
                addObject(flat[n], flat[n + 1], flat[n + 2], flat[n + 3], flat[n + 4], flat[n + 5], flat[n + 6], flat[n + 7]);
            }
        }
        function onObjectKilled(p) {
            const sid = p && p.args && p.args[0];
            if (sid != null) removeSid(sid);
        }
        function onObjectsKilled(p) {
            // "R" carries an OWNER sid: every object that owner placed is gone.
            const owner = p && p.args && p.args[0];
            if (owner == null) return;
            for (let i = list.length - 1; i >= 0; i--) {
                if (list[i].ownerSid === owner) { tapRemove(list[i], "ownerLeft"); byId.delete(list[i].sid); list.splice(i, 1); }
            }
        }
        function onWiggle(p) {
            const a = p && p.args; if (!a) return;
            const dir = a[0], sid = a[1];
            const o = byId.get(sid);
            if (!o) return;
            o.xWiggle += GATHER_WIGGLE * Math.cos(dir);
            o.yWiggle += GATHER_WIGGLE * Math.sin(dir);
            o.lastHit = Date.now();
        }
        function onTurretShoot(p) {
            const a = p && p.args; if (!a) return;
            const sid = a[0], dir = a[1];
            const o = byId.get(sid);
            if (!o) return;
            if (dir != null) o.dir = dir;
            o.time = TURRET_RELOAD;     // just fired -> reload is full (bundle v4())
            o.shot = Date.now();
            o.NOW = false;
        }
        function onItemCount(p) {
            const a = p && p.args; if (!a) return;
            itemCounts[a[0]] = a[1];
        }

        // Per-tick upkeep: turret reload countdown + spinning dir, mirroring the
        // bundle's k4() and GameObject.update. Call once per playersUpdate.
        let lastTick = 0;
        function update(deltaOverride) {
            const now = Date.now();
            const delta = deltaOverride != null ? deltaOverride : (lastTick ? (now - lastTick) : 111);
            lastTick = now;
            for (let i = 0; i < list.length; i++) {
                const o = list[i];
                if (o.name === "turret" && o.time) {
                    o.time -= delta;
                    if (o.time <= 0) o.time = TURRET_RELOAD;
                }
                if (!driven && o.turnSpeed) o.dir += o.turnSpeed * delta;   // driven: GameObject.update per frame
            }
        }

        MooMoo.on("objectsLoad", onObjectsLoad);
        MooMoo.on("objectKilled", onObjectKilled);
        MooMoo.on("objectsKilled", onObjectsKilled);
        MooMoo.on("wiggle", onWiggle);
        MooMoo.on("turretShoot", onTurretShoot);
        MooMoo.on("itemCount", onItemCount);
        // Turret countdowns + spin advance once per tick. The combat engine drives
        // this at the bundle's point in the tick (k4); without it, the "a" packet does.
        let driven = false;
        MooMoo.on("playersUpdate", () => { if (!driven) update(); });
        // Objects are NOT cleared when you die: the server sends each object to a
        // player only ONCE per connection, so a respawn has to keep the old world
        // (clearing it on death left you blind to every building until a reconnect).
        // Only the first spawn of a connection starts from an empty world, like the
        // game client does; the loader calls newConnection() for every new socket.
        let firstSetup = true;
        function newConnection() { clearAll(); firstSetup = true; }
        MooMoo.on("setup", () => { if (firstSetup) { firstSetup = false; clearAll(); } });

        // ---- query API (what features call) ----
        function get(sid) { return byId.get(sid) || null; }
        function all() { return list.slice(); }
        function count() { return list.length; }

        // Objects within `range` of (x,y), optionally filtered, sorted nearest
        // first. Sets `.distance` (center distance) on each returned object, like
        // the bundle does before reading `e.distance`.
        function near(x, y, range, filter) {
            const out = [];
            for (let i = 0; i < list.length; i++) {
                const o = list[i];
                if (!o.active) continue;
                const d = dist(x, y, o.x, o.y);
                o.distance = d;
                if (range != null && d > range) continue;
                if (filter && !filter(o)) continue;
                out.push(o);
            }
            out.sort((a, b) => a.distance - b.distance);
            return out;
        }

        const byGroup = (gname) => (o) => o.group && o.group.name === gname;
        function spikes(x, y, range) { return near(x, y, range, byGroup("spikes")); }
        function walls(x, y, range) { return near(x, y, range, byGroup("walls")); }
        function mills(x, y, range) { return near(x, y, range, byGroup("mill")); }
        function traps(x, y, range) { return near(x, y, range, (o) => o.name === "pit trap"); }
        function turrets(x, y, range) { return near(x, y, range, (o) => o.name === "turret"); }
        function buildings(x, y, range) { return near(x, y, range, (o) => o.ownerSid != null); }

        // A pit trap whose radius covers (x,y) — used by trap detection. `pad`
        // widens the test (the bundle uses <= 47 around a player).
        function trapAt(x, y, pad) {
            pad = pad == null ? 47 : pad;
            let best = null, bd = Infinity;
            for (let i = 0; i < list.length; i++) {
                const o = list[i];
                if (!o.active || o.name !== "pit trap") continue;
                const d = dist(x, y, o.x, o.y);
                if (d <= pad && d < bd) { bd = d; best = o; }
            }
            return best;
        }

        return {
            GameObject,
            // direct access for advanced features
            _list: list, _byId: byId,
            get, all, count, near, trapAt,
            spikes, walls, mills, traps, turrets, buildings,
            isEnemyObject, isFriendly, isTeammate, isSelf,
            itemCount: (gid) => itemCounts[gid] || 0,
            clear: clearAll,
            newConnection,
            update,
            setDriven: (b) => { driven = !!b; },
            setFriendlyTest: (fn) => { hooksRef.te = fn; },
            onRemove: (fn) => { removeTaps.add(fn); return () => removeTaps.delete(fn); },
            setTickSource: (fn) => { hooksRef.tick = fn; },
            setMillRotate: (fn) => { hooksRef.millRotate = typeof fn === "function" ? fn : () => false; },
            TURRET_RELOAD
        };
    }

    return { createObjectManager, GameObject, TURRET_RELOAD };
});


/* ===== module: game/store (loader/src/game/store.js) ===== */
/*
 * moomoo.js loader — STORE  (owned / equipped hats + accessories)
 * ===============================================================
 * Hat swapping is the core of every combo in the bundle, and the bundle never
 * trusts its own sends: it keeps
 *   Nn  = hats you own          (free hats at spawn + every "5" buy reply)
 *   On  = accessories you own   (every "5" buy reply)
 *   $t  = hat you have on       (from the "5" equip reply only)
 *   Zt  = accessory you have on (from the "5" equip reply only)
 * and its equip(hat, acc) only sends when the target differs from what the
 * server last confirmed, and unequips (to 0) when you don't own the target.
 * This module keeps exactly that state from the wire and exposes the same
 * equip semantics, so a dropped or rejected store packet simply retries.
 *
 * Wire (server/src/network/packets.js):
 *   s2c "5" storeUpdate [action, id, isAccessory]   action 0 = bought, 1 = equipped
 *   c2s "c" store       [action, id, isAccessory]   through binding: vocabulary
 *                                                   store(0 = buy, 1 = equip)
 * The server gives you every hat with price 0 that isn't dontSell at spawn
 * (player.js), i.e. the bundle's starting Nn list.
 *
 * Part of the LOADER (volatile). Exposed on ctx as `ctx.store`.
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooStore = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooStore = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const BUY = 0, EQUIP = 1;   // vocabulary store(action) values

    function createStore(env) {
        const MooMoo = env.MooMoo;
        const data = env.data;

        // Free hats in the bundle's order (its Nn initializer), which is also the
        // server's "price 0 and not dontSell" set.
        const FREE_HATS = data.hats.filter((h) => h.price <= 0 && !h.dontSell).map((h) => h.id);
        const FREE_TAILS = data.accessories.filter((a) => a.price <= 0 && !a.dontSell).map((a) => a.id);

        const ownedHats = FREE_HATS.slice();     // Nn
        const ownedTails = FREE_TAILS.slice();   // On
        let hat = null;                          // $t (null until the server confirms one)
        let tail = null;                         // Zt
        const listeners = new Set();
        const emit = (ev) => { for (const fn of Array.from(listeners)) { try { fn(ev); } catch (e) { /* ignore */ } } };

        // "5": exactly the bundle's Dp(e, t, n).
        function onStoreUpdate(p) {
            const a = p && p.args; if (!a) return;
            const action = a[0], id = a[1], isTail = !!a[2];
            if (action) {                                   // equipped
                if (isTail) tail = id; else hat = id;
                if (isTail) MooMoo.self.accessory = id; else MooMoo.self.hat = id;
            }
            if (action === 0 && id !== 0) {                 // bought
                if (isTail) { if (ownedTails.indexOf(id) < 0) ownedTails.push(id); }
                else if (ownedHats.indexOf(id) < 0) ownedHats.push(id);
            }
            emit({ action: action ? "equip" : "buy", id, isAccessory: isTail });
        }

        function reset() {
            ownedHats.length = 0; ownedHats.push(...FREE_HATS);
            ownedTails.length = 0; ownedTails.push(...FREE_TAILS);
            hat = null; tail = null;
        }

        const ownsHat = (id) => id === 0 || ownedHats.indexOf(id) >= 0;
        const ownsTail = (id) => id === 0 || ownedTails.indexOf(id) >= 0;

        // Raw store verbs (go through the vocabulary/binding).
        const equipHatRaw = (id) => MooMoo.send.store(EQUIP, id | 0, false);
        const equipTailRaw = (id) => MooMoo.send.store(EQUIP, id | 0, true);
        const buyHat = (id) => MooMoo.send.store(BUY, id | 0, false);
        const buyTail = (id) => MooMoo.send.store(BUY, id | 0, true);

        // The bundle's equip(hatId, accessoryId), 1-1:
        //   a null/NaN id leaves that slot alone;
        //   not owned -> unequip that slot (to 0) unless it's already bare;
        //   owned     -> equip it unless the server already has it on.
        function equip(hatId, accessoryId) {
            if (hatId === undefined) hatId = null;
            if (accessoryId === undefined) accessoryId = null;
            if (hatId !== null && !isNaN(hatId)) {
                if (ownedHats.indexOf(hatId) < 0) {
                    if (hat !== 0) equipHatRaw(0);
                } else if (hat !== hatId) {
                    equipHatRaw(hatId);
                }
            }
            if (accessoryId !== null && !isNaN(accessoryId)) {
                if (ownedTails.indexOf(accessoryId) < 0) {
                    if (tail !== 0) equipTailRaw(0);
                } else if (tail !== accessoryId) {
                    equipTailRaw(accessoryId);
                }
            }
        }

        MooMoo.on("storeUpdate", onStoreUpdate);

        return {
            get ownedHats() { return ownedHats; },       // Nn (live array)
            get ownedTails() { return ownedTails; },     // On (live array)
            get hat() { return hat; },                   // $t
            get tail() { return tail; },                 // Zt
            ownsHat, ownsTail,
            equip, equipHat: equipHatRaw, equipTail: equipTailRaw, buyHat, buyTail,
            onChange: (fn) => { listeners.add(fn); return () => listeners.delete(fn); },
            reset,
            // the bundle's "m" debug key set $t / Zt back to null: equip() then
            // re-sends whatever it is asked for next
            forgetEquipped: () => { hat = null; tail = null; },
            FREE_HATS, FREE_TAILS, BUY, EQUIP
        };
    }

    return { createStore, BUY, EQUIP };
});


/* ===== module: game/combat (loader/src/game/combat.js) ===== */
/*
 * moomoo.js loader — COMBAT ENGINE  (the bundle's player model + tick pipeline, 1-1)
 * ==============================================================================
 * The bundle runs its whole combat brain inside one server-tick handler,
 * `updatePlayers` (the "a" packet), and keeps a rich model of every player that
 * its packet handlers feed. This engine is that model and that pipeline, ported
 * from the bundle line for line, so a mod that hooks in sees exactly the state
 * the bundle saw, at exactly the moment it saw it.
 *
 * Ordering is the whole point. The bundle does NOT apply most packets when they
 * arrive:
 *   - a swing ("K")       -> reload reset k2() is queued (pn) and applied on the
 *                            next tick, AFTER that tick's reload fill;
 *   - a projectile ("X")  -> owner detection tg() is queued (pn) the same way;
 *   - a health change     -> only recorded (healArr); the shame / bull-cadence
 *     ("O")                  analysis l5() runs in the next tick's frame, when the
 *                            tick counter has already advanced;
 *   - a wiggle ("L")      -> waits for the next tick (A4) before a building-damage
 *                            resolver (O3) is created, and a swing that hit
 *                            something resolves it one tick later still.
 * The server sends a tick's K / L / O / X before that tick's "a" (server.js:
 * update everyone, then sync), and eating sends O between ticks, so these
 * queues decide which tick a reload / bull / health event lands on.
 *
 * Tick pipeline (bundle updatePlayers, ~line 15985):
 *   [hooks.preTick]  -> v++ -> reset per-tick lists -> reconstruct every visible
 *   player -> [hooks.postReconstruct] -> await 1ms (wx(1): let the rest of this
 *   tick's packets land) -> Xt / Q object windows -> resolve A4 (Ve) -> run
 *   deferred handlers (pn) -> per-player frame upkeep (poison, deaths, health
 *   analysis l5, bleed) -> [hooks.frame]  (where the bundle's features run)
 *
 * Player objects ARE the runtime's (MooMoo.self / MooMoo.players), enriched with
 * the bundle's fields. x/y are the rendered (interpolated) position, maintained
 * every animation frame with the bundle's own interpolation; x2/y2 are the latest
 * server position, x1/y1 the rendered position at the last tick.
 *
 * Part of the LOADER (volatile). Exposed on ctx as `ctx.combat`.
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooCombat = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooCombat = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    // ---- constants (shared/config.js + bundle) ----
    const K = {
        mapScale: 14400, riverWidth: 724, snowBiomeTop: 2400, snowSpeed: 0.75,
        playerScale: 35, playerSpeed: 0.0016, gatherAngle: Math.PI / 2.6, gatherWiggle: 10,
        maxScreenWidth: 1920, maxScreenHeight: 1080, serverUpdateRate: 9, clientSendRate: 5,
        shieldAngle: Math.PI / 3, hitReturnRatio: 0.25, hitAngle: Math.PI / 2,
        weaponVariants: [{ id: 0, src: "", xp: 0, val: 1 }, { id: 1, src: "_g", xp: 3000, val: 1.1 },
            { id: 2, src: "_d", xp: 7000, val: 1.18 }, { id: 3, src: "_r", poison: true, xp: 12000, val: 1.18 },
            { id: 4, src: "_e", xp: 20000, val: 1.18, lifesteal: 0.15, membersOnly: true }]
    };
    const ce = 1000 / 9;                 // server tick ms
    const u = ce * 2;                    // two ticks (combo length)
    const r3 = Math.pow(0.993, 111);     // decel constant used by l4's T()
    const EN = [1, 1.1, 1.18, 1.18, 1.18]; // En: weapon-variant damage multipliers (gold, diamond, ruby, emerald)
    const h = Math.PI / 2.6;             // gather angle (bundle `h`)

    // ---- math primitives (bundle aliases) ----
    const U = Math.cos, V = Math.sin, P = Math.atan2, S = Math.abs;
    const D = Math.sqrt;
    const re = (a, b) => Math.pow(a, b);
    const H = Math.round, j = Math.min, oe = Math.max;
    const TAU = Math.PI * 2, W = Math.PI;
    const getDistance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
    const getDirection = (x1, y1, x2, y2) => Math.atan2(y1 - y2, x1 - x2);
    function getAngleDist(a, b) { const d = S(b - a) % TAU; return d > W ? TAU - d : d; }
    function Ay(e, t) { let n = S(e - t); n = n % TAU; if (n > W) n = TAU - n; return n; }
    function lerpAngle(e, t, n) {   // Math.lerpAngle as the client defines it
        if (S(t - e) > W) { if (e > t) t += TAU; else e += TAU; }
        const i = t + (e - t) * n;
        return i >= 0 && i <= TAU ? i : i % TAU;
    }
    const Ne = (t, n) => { const e = Math.SQRT2 - 1; t = S(t); n = S(n); if (t > n) { const x = t; t = n; n = x; } return e * t + n; };
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    function createCombat(env) {
        const MooMoo = env.MooMoo;
        const data = env.data;
        const objects = env.objects || null;
        const selfInput = env.selfInput || { moveDir: null, aimDir: 0 };
        const win = env.win || (typeof window !== "undefined" ? window : null);
        if (objects && objects.setDriven) objects.setDriven(true);
        if (objects && objects.setFriendlyTest) objects.setFriendlyTest((sid) => te(sid));
        if (objects && objects.setTickSource) objects.setTickSource(() => v);

        const x = { list: data.items, weapons: data.weapons, projectiles: data.projectiles, groups: data.groups };
        const C0 = data.hats, B0 = data.accessories;
        const hatOf = (id) => data.hat(id), accOf = (id) => data.accessory(id);

        const z = MooMoo.self;               // our own player (the bundle's `z`)
        let v = 0;                           // tick counter
        let et = 0;                          // self bull-cycle offset
        let tn = 0;                          // time of this tick
        let en = false;                      // in game (setupGame .. died)
        let Y = null;                        // current target (nearest visible enemy / !target)
        const xi = { ID: null, player: null };   // manual target (!target)
        const J = [];                        // every player we know, self included (bundle J)
        let vn = [], Sn = [];                // visible enemies / visible friends this tick
        let Xt = [], Q = [];                 // objects within 2000 / 800 this tick
        const bh = [];                       // animals (bundle bh)
        let bosses = { Xi: null, Ji: null, qi: null };
        const Ln = [];                       // tracked live projectiles (bundle Ln)
        let ng = [];                         // per-player projectile volleys this tick
        const ft = [];                       // pending building-damage resolvers (O3)
        let py = [];                         // clan members [sid, name, sid, name, ...]
        const rn = [], an = [], ln = [];     // per-sid reload mirrors (bundle rn/an/ln)
        const Xe = {};                       // sid -> player (bundle Xe)
        let Ve = [];                         // A4() resolvers
        let pn = [];                         // deferred packet handlers (run next tick)
        const hooks = {
            preTick: new Set(), tickStart: new Set(), postReconstruct: new Set(), afterSleep: new Set(),
            deferredFlushed: new Set(), afterPlayers: new Set(), frame: new Set(), frameLate: new Set(), framePlayer: new Set(),
            projectile: new Set(), playerAdded: new Set(), playerLeft: new Set(), buildingDamage: new Set(),
            died: new Set(), setup: new Set()
        };
        const runHooks = (set, a, b, c) => {
            for (const fn of Array.from(set)) { try { fn(a, b, c); } catch (e) { console.error("[moomoo.js] combat hook threw", e); } }
        };

        // ---- A4(): resolves at the next tick, at the exact point the bundle did ----
        function A4() { return new Promise((e) => { Ve[Ve.length] = e; }); }

        // ---- te(sid): me or a clan member ----
        function te(t) {
            if (t == z.sid) return true;
            for (let e = 0; e < py.length; e += 2) if (t == py[e]) return true;
            return false;
        }

        // ---- player lookup ----
        function Hg(t) { for (let e = 0; e < J.length; ++e) if (J[e].sid == t) return J[e]; return null; }
        function jg(t) { for (let e = 0; e < J.length; ++e) if (J[e].id == t) return J[e]; return null; }
        function Wg(t) { for (let e = 0; e < bh.length; ++e) if (bh[e].sid == t) return bh[e]; return null; }

        // ---- geometry on predicted positions (se / B / S4 / L3), ported 1-1 ----
        const gx = (e) => (e.x2 || e.x);
        const gy = (e) => (e.y2 || e.y);
        function S4(e, t) { return getDistance(gx(e), gy(e), gx(t), gy(t)); }
        function se(e, t, n) {
            const i = n === "player" ? -1.8 * 35 : n === "object" ? -(t && t.scale) : 0;
            return getDistance(gx(e), gy(e), gx(t), gy(t)) + i;
        }
        function B(e, t) { return P((t.y2 || t.y) - (e.y2 || e.y), (t.x2 || t.x) - (e.x2 || e.x)); }
        function Dy(e, t) { return Math.hypot((e.x2 || e.x) - (t.x2 || t.x), (e.y2 || e.y) - (t.y2 || t.y)); }
        function P3(e, t, n, i) { if (n == undefined) return { x: z.x, y: z.y }; return { x: e + i * U(n), y: t + i * V(n) }; }
        function L3(e, t) {
            const n = S((e.x2 || e.x) - (t.x2 || t.x));
            const i = S((e.y2 || e.y) - (t.y2 || t.y));
            return n <= K.maxScreenWidth / 2 * 1.3 && i <= K.maxScreenHeight / 2 * 1.3;
        }
        const X5 = (e, t) => D(e * e + t * t);

        // ---- game-data helpers ----
        const weapon = (id) => data.weapon(id);
        const weaponSpeed = (id) => { const w = weapon(id); return (w && w.speed != null) ? w.speed : undefined; };
        const weaponRange = (id) => { const w = weapon(id); return (w && w.range != null) ? w.range : 0; };
        const variantVal = (vi) => EN[vi] || 1;

        // ---- x4: movement-speed multiplier (bundle x4) ----
        function x4(t) {
            const w = weapon(t.weaponIndex);
            const sh = t.skinIndex ? hatOf(t.skinIndex) : null, ta = t.tailIndex ? accOf(t.tailIndex) : null;
            let e = ((t.buildIndex < 0) + 1) / 2 * ((w && w.spdMult) || 1) * ((t.skinIndex && sh && sh.spdMult) || 1)
                * ((t.tailIndex && ta && ta.spdMult) || 1)
                * (t.y2 <= K.snowBiomeTop ? ((t.skinIndex && sh && sh.coldM) ? 1 : 0.75) : 1) * 1;
            if (!t.zIndex && t.y2 >= K.mapScale / 2 - K.riverWidth / 2 && t.y2 <= K.mapScale / 2 + K.riverWidth / 2) {
                e *= (t.skinIndex && sh && sh.watrImm) ? 0.75 : 0.33;
            }
            return e;
        }
        // ---- w4: per-tick movement distance for a loadout (bundle w4) ----
        function w4(t, e) {
            t = {
                buildIndex: t?.buildIndex ?? e?.buildIndex ?? -1,
                weaponIndex: t?.weaponIndex ?? e?.weaponIndex ?? null,
                skinIndex: t?.skinIndex ?? e?.skinIndex ?? null,
                tailIndex: t?.tailIndex ?? e?.tailIndex ?? null,
                y2: t?.y2 ?? e?.y2 ?? 0,
                zIndex: t?.zIndex ?? e?.zIndex ?? false
            };
            return (ce / 2) * x4(t);
        }

        // ---- l4: next-position prediction (accel / decel / real), ported 1-1 ----
        // `Nt` (standing in an enemy trap) and `Dn` (our move dir) are read the way
        // the bundle read them: Nt as last tick's value, Dn = what we last sent.
        function l4(e, t, n, i, s) {
            if (s == null) s = 111;
            if (!i) {
                if (e.sid == z.sid && t !== 0 && !t) t = selfInput.moveDir;
                else if (state.Nt && e.sid == z.sid) t = undefined;
                else if (!t && t !== 0) t = e.movDir;
            }
            let o = U(t), r = V(t);
            const a = D(o * o + r * r);
            a != 0 && (o /= a, r /= a);
            if (!n) n = e;
            const l = x4(n);
            e.speedXD = 0; e.speedYD = 0; e.predY = 0; e.predX = 0;
            o && (e.speedXD += o * 0.0016 * l * s);
            r && (e.speedYD += r * 0.0016 * l * s);
            e.speedXD && (e.predX += e.speedXD * s);
            e.speedYD && (e.predY += e.speedYD * s);
            const f = e.xVel * re(0.993, s), hh = e.yVel * re(0.993, s);
            const p = f + e.predX, m = hh + e.predY;
            const g = { x: e.x2 + p, y: e.y2 + m, type: "accel" };
            const y = { x: e.x2 + f, y: e.y2 + hh, type: "decel" };
            const xx = T(p, m, { x: e.x2 + p, y: e.y2 + m });
            const w = { x: e.x2, y: e.y2, type: "current" };
            const b = { x: p, y: m, type: "nextVel" };
            let real = g;
            const k = H(D(p * p + m * m));
            const I = s * 1.5 * U(t), So = s * 1.5 * V(t);
            const E = { x: e.x2 + I, y: e.y2 + So };
            if (Xe[e.sid]?.np != undefined && e.sid != z.sid) real = se(e, Xe[e.sid]?.np?.accel) > se(e, Xe[e.sid]?.np?.decel) && Ay(e.movDir, e.pmovDir) <= 0.3 ? y : g;
            if (e.sid == z.sid) real = (selfInput.moveDir == undefined || selfInput.moveDir == null) ? y : g;
            return { accel: g, decel: y, boostCoords: E, boostVel: { x: I, y: So }, nextVel: b, real, current: w, fullDecel: xx, xVel: p, spd: l, yVel: m, vel: k };

            function T(e, t, n, i, s) {
                if (isNaN(e) || isNaN(t)) return;
                try {
                    i = e * r3; s = t * r3;
                    if (e != i) { e = i; n.x += e; }
                    if (t != s) { t = s; n.y += t; }
                    if (e == i && t == s) return { x: n.x, y: n.y, type: "full decel" };
                    return T(e, t, n);
                } catch (err) { /* deep recursion: bundle swallows */ }
            }
        }
        // ---- a4: n-tick prediction chain (bundle a4) ----
        function a4(e, t, n, i, s = [], o, r, a) {
            r = { ...e };
            if (e.sid == z.sid && n !== 0 && !n) n = selfInput.moveDir;
            else if (state.Nt && e.sid == z.sid) n = undefined;
            else if (!n && n !== 0) n = e.movDir;
            a = l4(r, n);
            r.xVel = a.xVel; r.yVel = a.yVel; r.x2 = a.real.x; r.y2 = a.real.y;
            s.push(a);
            if (t - 1 <= 0) return s;
            return a4(r, t - 1, n, r, s);
        }

        // ---- b4: learn a player's loadout from what they build (bundle b4) ----
        function b4(e, t) {
            const i = x.list[t];
            if (!i || !e) return;
            if (i.group.name == "mill") e.windmill = i;
            if (i.group.name == "spikes") e.spike = i;
            if (i.name == "boost pad") e.spike = false;
            if (i.age == 7) e.utility = i;
            if (i.group.name == "walls") e.wall = i;
            if (i.group.name == "food") e.food = i;
            if (i.name == "spawn pad") e.spawnpad = true;
        }
        // ---- g4: assumeAge, the highest age a player has revealed (bundle g4) ----
        function g4(e) {
            let t = 0;
            const n = e.loadout;
            if (n?.spawnpad || weapon(e?.secondary)?.age == 9 || n?.spike?.age == 9) return 9;
            n.utility && (t = 7);
            t < weapon(e?.secondary)?.age && (t = weapon(e?.secondary)?.age);
            t < weapon(e?.primary)?.age && (t = weapon(e?.primary)?.age);
            t < n?.spike?.age && (t = n.spike.age);
            t < n?.food?.age && (t = n.food.age);
            t < n?.windmill?.age && (t = n.windmill.age);
            t < n?.wall?.age && (t = n.wall.age);
            e?.weaponIndex == 0 && (t = 1);
            if (e?.primary == 0 && t > 1) e.primary = undefined;
            return t;
        }

        // ---- self loadout (bundle yy(), which read the action bar) ----
        // Action-bar slot k shows item k-16, so each slot range is an item-id range.
        const loadout = {
            ee: null, A: null, ry: null, ay: null, ly: null, cy: null, dy: null, uy: null, fy: null, hy: null,
            spike: null, wall: null, food: null, windmill: null, utility: null, spawnpad: false
        };
        function yy() {
            const weapons = z.weapons || [], items = z.items || [];
            loadout.ee = null; loadout.ry = null; loadout.A = null; loadout.dy = null; loadout.ay = null;
            loadout.ly = null; loadout.cy = null; loadout.fy = null; loadout.hy = null; loadout.uy = null;
            for (const id of weapons) { if (id != null && id < 9) loadout.ee = id; else if (id != null) loadout.A = id; }
            for (const id of items) {
                if (id >= 0 && id <= 2) loadout.ry = id;
                else if (id >= 3 && id <= 5) loadout.ay = id;
                else if (id >= 6 && id <= 9) loadout.ly = id;
                else if (id >= 10 && id <= 12) loadout.cy = id;
                else if (id >= 13 && id <= 14) loadout.dy = id;
                else if (id >= 15 && id <= 16) loadout.uy = id;
                else if (id === 20) loadout.fy = id;
                else if (id >= 17 && id <= 22) loadout.hy = id;
            }
            loadout.spike = loadout.ly != null ? x.list[loadout.ly] : null;
            loadout.wall = loadout.ay != null ? x.list[loadout.ay] : null;
            loadout.food = loadout.ry != null ? x.list[loadout.ry] : null;
            loadout.windmill = loadout.cy != null ? x.list[loadout.cy] : null;
            loadout.utility = loadout.hy != null ? x.list[loadout.hy] : null;
            loadout.spawnpad = loadout.fy != null;
            return loadout;
        }

        // ---- reload fill (xy) / fill while invisible (by), ported 1-1 ----
        function xy(t, e) {
            if (t.buildIndex == -1) {
                if (t.weaponIndex <= 8) {
                    const sp = weaponSpeed(t.primary);
                    t.pr = j(1, t.pr + (t.delta > 190 ? t.delta : ce) / (sp * t.samRP));
                } else if (t.weaponIndex > 8) {
                    const sp = weaponSpeed(t.secondary);
                    t.sr = j(1, t.sr + (t.delta > 190 ? t.delta : ce) / (sp * t.samRS));
                }
            }
            t.tr = j(1, t.tr + t.delta / 2400);
            rn[t.sid] = t.pr; an[t.sid] = t.sr; ln[t.sid] = t.tr;
            if (t.sid != z.sid) {
                if (!t.hasSoldier && t.skinIndex == 6) t.hasSoldier = true;
                if (!t.hasTank && t.skinIndex == 40) t.hasTank = true;
            }
        }
        function by() {
            for (let e = 0; e < J.length; e++) {
                const t = J[e];
                if (!t.visible && t.sid != z.sid) {
                    t.pr != undefined && t.pr !== 1 && (t.pr = j(1, t.pr + ce / (weaponSpeed(t?.primary) * t.samRP)));
                    t.sr != undefined && t.sr !== 1 && (t.sr = j(1, t.sr + ce / (weaponSpeed(t?.secondary) * t.samRS)));
                    t.tr != undefined && t.tr !== 1 && (t.tr = j(1, t.tr + ce / 2500));
                    rn[t.sid] = t.pr; an[t.sid] = t.sr; ln[t.sid] = t.tr;
                }
            }
        }

        // ---- addPlayer ("D"): vanilla spawn/setData + the bundle's per-player state ----
        function spawnFields(e) {
            Object.assign(e, {
                active: true, alive: true, lockMove: false, lockDir: false, minimapCounter: 0, chatCountdown: 0,
                shameCount: 0, shameTimer: 0, gathering: 0, autoGather: 0, animTime: 0, animSpeed: 0, mouseState: 0,
                buildIndex: -1, weaponIndex: 0, noMovTimer: 0, maxXP: 300, deathCount: 0, XP: 0, age: 1, kills: 0,
                upgrAge: 2, upgradePoints: 0, zIndex: 0, xVel: 0, yVel: 0, slowMult: 1, dir: 0, dirPlus: 0, targetDir: 0,
                targetAngle: 0, maxHealth: 100, health2: 0, samRP: 1, samRS: 1, pr: 1, sr: 1, hasSoldier: false,
                hasTank: false, scale: K.playerScale, speed: K.playerSpeed, shootCount: 0, timeSpentNearVolcano: 0
            });
            e.health = e.maxHealth;
            if (!e.weaponXP) e.weaponXP = [];
            e.dmgOverTime = {};
            e.reloads = {};
        }
        function onPlayerAdd(p) {
            const t = p.data, isYou = !!p.isYou;
            if (!Array.isArray(t)) return;
            let e = jg(t[0]);
            const fresh = !e;
            if (!e) {
                if (t[1] === z.sid || isYou) e = z;
                else {
                    e = MooMoo.players.get(t[1]);
                    if (!e) { e = { sid: t[1] }; MooMoo.players.set(t[1], e); }   // one object shared with the runtime
                }
                if (J.indexOf(e) < 0) J.push(e);
                e.id = t[0];
                e.tmpScore = 0; e.team = e.team ?? null; e.skinIndex = e.skinIndex || 0; e.tailIndex = e.tailIndex || 0;
                e.hitTime = 0; e.points = e.points || 0; e.dt = 0; e.hidden = false; e.itemCounts = e.itemCounts || {};
                e.isPlayer = true; e.pps = 0; e.moveDir = undefined; e.skinRot = 0; e.lastPing = 0; e.iconIndex = 0;
                e.deaths = 0; e.skinColor = 0;
            }
            spawnFields(e);
            e.visible = false;
            e.x2 = undefined; e.y2 = undefined;
            // setData (bundle-modified)
            e.id = t[0]; e.sid = t[1]; e.name = t[2]; e.x = t[3]; e.y = t[4]; e.dir = t[5]; e.bot = false;
            e.health = t[6]; e.maxHealth = t[7]; e.scale = t[8]; e.skinColor = t[9];
            e.__hp = t[6];
            e.rx = t[3]; e.ry = t[4]; e.rdir = t[5];
            e.pr = 1; e.sr = 1; e.tr = 1; e.hitProjs = 0; e.primary = undefined; e.secondary = undefined;
            e.shameCount = 0; e.primaryVar = 3; e.secondaryVar = 3; e.lastx = 0; e.tick = v; e.lasty = 0;
            e.aura = !!t[10]; e.bossMode = !!t[11]; e.clan = t[12] || null;
            if (isYou) { e.weapons = [0]; e.items = [0, 3, 6, 10]; }
            // the bundle's own per-player state (addPlayer, ~line 15555)
            rn[t[1]] = 1; an[t[1]] = 1; e.pr = 1; e.sr = 1;
            !e.seenCount ? e.seenCount = 1 : e.seenCount++;
            e.primary = null; e.secondary = null;
            e.samRP = 1; e.didDeath = false; e.samRS = 1;
            e.noAntiList = e.noAntiList ?? new Array(10).fill(0);
            e.healArr = [];
            e.loadout = { spike: x.list[9], spawnpad: false, utility: undefined, windmill: undefined, trap: true, wall: x.list[3], food: x.list[0] };
            ln[t[1]] = 1;
            e.deathDmgs = []; e.dmgsNow = [];
            !e.trackLeak && (e.trackLeak = []);
            !e.trackGain && (e.trackGain = []);
            e.tr = 1; e.shameCount = 0; e.healTrack = []; e.Alive = true;
            if (isYou) { e.loadout = loadout; }
            runHooks(hooks.playerAdded, e, { fresh, isYou, seenCount: e.seenCount });
        }
        // ---- playerRemove ("E" -> ug): forget the player and their projectiles ----
        function onPlayerRemove(p) {
            const sid = p.sid;
            for (let i = Ln.length - 1; i >= 0; i--) if (Ln[i].owner.sid == sid) Ln.splice(i, 1);
            for (let e = 0; e < J.length; e++) {
                if (J[e].sid == sid && J[e] !== z) { const gone = J[e]; J.splice(e, 1); runHooks(hooks.playerLeft, gone); break; }
            }
        }

        // ---- shame timing (anti-cheat) ----
        // The server counts an eat as shame when it lands within 120 ms of your
        // last hit (player.buildItem: Date.now() - hitTime <= 120); 8 of them put
        // the shame hat on you, and with it nothing heals for 30 s. An eat sent
        // now reaches the server about one round trip after the moment we saw
        // that hit, so it is safe once
        //     now >= lastHitSeen + 120 + margin - roundTrip
        // On a real server's ping that is right away; on a local one ~125 ms.
        const SHAME_WINDOW = 120, SHAME_MARGIN = 8;
        let lastHitSeen = 0;
        function shameWait(now) {
            if (!lastHitSeen) return 0;
            const rtt = env.net && env.net.minPing ? env.net.minPing() : 0;
            return Math.max(0, lastHitSeen + SHAME_WINDOW + SHAME_MARGIN - rtt - (now != null ? now : Date.now()));
        }

        // ---- health ("O" -> updateHealth): record only; l5 runs in the next frame ----
        function onHealth(p) {
            const q = Hg(p.sid);
            if (!q) return;
            const n = Date.now();
            // the runtime already wrote the new value into q.health; the bundle's
            // delta is against the value it held before this packet
            const prevHealth = q.__hp != null ? q.__hp : q.health;
            const i = p.value - prevHealth;
            if (q === z && i < 0) lastHitSeen = n;
            q.isPlayer && q.healArr && q.healArr.push([i, p.value, n]);
            q.lastHealth = prevHealth;
            q.animatedHealth = Date.now();
            q.health = p.value;
            q.__hp = p.value;
        }

        // ---- l5: health-change analysis (shame count, bull cadence, spike hits) ----
        function l5(e, t, n, i) {
            let r;
            const o = Hg(e);
            if (!o) return;
            if (o.health <= 0 && o.vis2 && !o.visible && !o.didDeath) { runHooks(hooks.framePlayer, o, "deathAnim"); o.deaths++; o.didDeath = true; }
            if (!z.healths) z.healths = [];
            if (o.sid == z.sid) {
                if (z.healths.length >= 8) z.healths.pop();
                if (o.sid == z.sid) z.healths.push({ hp: o.health, tick: v });
            }
            if (t == -5 * (o.skinIndex == 6 ? 0.75 : 1) && o.poison) o.lastBull = v - 1;
            if (o.health <= 0) { o.Alive = false; o.Alive2 = false; }
            if (t < 0) {
                if (o.sid != z.sid && o.dmgs == "XD") o.dmgs = 0;
                if (o.sid != z.sid) o.dmgs += S(t);
                if (o == z) z.lastDamage3 = i;
            }
            o.dmgsNow.unshift(H(t * 100) / 100);
            if (t > 0) {
                if (o.skinIndex == 13) {
                    if (o.tailIndex == 13) { t == 6 && (o.lastBull = v - 1); z == o && (et = 0); return; }
                    else { t == 3 && (o.lastBull = v - 1); z == o && (et = 0); return; }
                }
                if (!isNaN(o.shameCount) && o.lastDamage) {
                    if (i - o.lastDamage <= 120) {
                        o.healTime = i - o.lastDamage2;
                        o.shameCount >= 8 && o.assumeAge >= 7 && S(tn - i) <= 2 && t <= 10 && o.loadout.utility == undefined && (o.loadout.utility = x.list[2]);
                        r = o.assumeAge >= 7 && o.loadout?.utility?.name == "cheese" && S(tn - i) <= 2 && t <= 10 ? true : false;
                        if (!r) {
                            o.noAntiList = o.noAntiList.map((x2) => x2 * 0.95);
                            !o.shameUp && (o.shameUp = []);
                            o.shameUp.length >= 5 && o.shameUp.shift();
                            o.shameUp.push(o.healTime);
                            o.gainSpeed = o.shameUp.reduce((a, b) => a + b, 0) / o.shameUp.length;
                            o.prevShameUp = o.shameCount;
                            if (o.lowHealth <= 40) o.noAntiList[o.shameCount]--;
                            o.shameCount = j(8, o.shameCount + 1);
                        }
                    } else {
                        r = o.assumeAge >= 7 && o.loadout?.utility?.name == "cheese" && S(tn - i) <= 2 && t <= 10 ? true : false;
                        if (!r) {
                            o.healTime = i - o.lastDamage2;
                            !o.shameDown && (o.shameDown = []);
                            o.shameDown.length >= 5 && o.shameDown.shift();
                            o.shameDown.push(o.healTime);
                            o.leakSpeed = o.shameDown.reduce((a, b) => a + b, 0) / o.shameDown.length;
                            o.prevShameDown = o.shameCount;
                            if (o.lowHealth <= 60) {
                                o.noAntiList[o.shameCount]++;
                                const tt = o.noAntiList.reduce((a, b) => a + (b > 0 ? b : 0), 0);
                                if (tt >= 3) {
                                    const ix = o.noAntiList.indexOf(Math.max(...o.noAntiList));
                                    if (o.noAntiList[ix] * 2 > tt) o.noAnti = ix;
                                }
                            }
                            o.shameCount = oe(0, o.shameCount - 2);
                        }
                    }
                    o.lastDamage = 0; o.lastDamage2 = 0; o.thisHealth = undefined;
                }
            } else {
                o.lowHealth = n;
                o.lastDamage = i;
                o.lastDamage2 = i;
                o.dmgDate = i;
                o.thisHealth = o.health;
                if (!te(o.sid) && Y?.inTrap) {
                    const ee = Xt.filter((e2) => se(Y.inTrap, e2) <= 50 + e2.scale + 35 && (te(e2?.owner?.sid) && e2?.group?.name == "spikes" || Y && !Y.team && e2?.group?.name == "spikes" && e2?.owner?.sid != Y.sid || e2?.type == 1 && e2.y >= 12e3));
                    if (ee.length && t == -(ee[0]?.type != 1 ? ee[0]?.dmg : 35) * (o.skinIndex == 6 ? 0.75 : 1)) o.hitSpike = true;
                }
                if (o.sid === z.sid) {
                    const ee = Xt.filter((e2) => se(z, e2) <= e2.scale + 35 && (!te(e2?.owner?.sid) && e2?.group?.name == "spikes" || e2?.type == 1 && e2.y >= 12e3));
                    if (ee.length && t == -(ee[0]?.type != 1 ? ee[0]?.dmg : 35) * (o.skinIndex == 6 ? 0.75 : 1)) o.hitSpike = ee[0];
                }
                if (o.skinIndex == 7) {
                    if (o.tailIndex == 13) {
                        if (t == -2) { o.lastBull = v - 1; o.lastBull2 = Date.now(); o.bTT = 1e3; return; }
                    } else if (t == -5) {
                        if (o == z) et = 0;
                        o.lastBull2 = Date.now(); o.bTT = 1e3; o.lastBull = v - 1;
                        return;
                    }
                }
            }
        }

        // ---- swing ("K" -> gatherAnimation): reload reset deferred to next tick ----
        function k2(e, n, t, i, s, o) {
            if (!i) return pn.push({ id: k2, data: [e, t, n, true] });
            o = Hg(e);
            if (o === null) return;
            n > 9 ? o.sr = 0 : o.pr = 0;
            o.slowMult -= weapon(n)?.hitSlow || 0.3;
            if (o.slowMult < 0) o.slowMult = 0;
            o.sid == z.sid && (z.invisTime = 1e3);
            o.skinIndex == 20 && n > 9 ? o.samRS = 0.78 : o.samRS = 1;
            o.skinIndex == 20 && n < 9 ? o.samRP = 0.78 : o.samRP = 1;
            s = Hg(e);
            const r = J.concat(bh);
            r.filter((e2) => {
                const tt = e2.sid != s.sid && se(s, e2, "player") <= weapon(n).range && (s.team && s.team != e2.team || !s.team) && getAngleDist(B(s, e2), s.d2) <= h ? true : false;
                if (!e2.isAI && tt) {
                    if (n >= 9 && (s.secondaryVar === 3 || s.skinIndex == 21) || n < 9 && (s.primaryVar === 3 || s.skinIndex == 21)) e2.poison = 5;
                }
                if (tt) {
                    if (s.skinIndex == 58 || s.skinIndex == 55 || s.tailIndex == 18) s.gatherHeal = { dmg: weapon(n).dmg, tick: v };
                }
                return false;
            });
        }
        async function onGather(p) {
            const a = p && p.args; if (!a) return;
            const e = a[0], t = a[1], n = a[2];
            let s = Hg(e);
            if (s) {
                s.lastSwing = { didHit: t, weaponIndex: n, at: Date.now() };    // for the swing animation visuals
                k2(e, t, n, false);
                s.hitBuild = t;
            }
            await A4();
            if (t) {
                s = Hg(e);
                if (s) ft.slice().forEach((r) => r.attemptResolve(s, s.skinIndex, v));
            }
        }

        // ---- building damage inference (O3): match a wiggle to the hit behind it ----
        class O3 {
            constructor(e, t) {
                this.dir = e;
                this.building = t;
                this.building.players = [];
                const n = this;
                new Promise(function (res, rej) {
                    n.resolve = res;
                    setTimeout(function () { rej(); }, 111);
                }).then(function (dmg) {
                    n.building.health -= dmg;
                    n.remove();
                }).catch(function () { n.remove(); });
            }
            remove() { const i = ft.indexOf(this); if (i >= 0) ft.splice(i, 1); }
            attemptResolve(s, o, r, e, t) {
                if (e && this.building.sid == e.building.sid && r === this.building.tick) {
                    this.resolve(this.building.projDmg ? e.dmg : 0);
                } else if (t && !e && r === this.building.tick) {
                    this.resolve(200);
                    runHooks(hooks.buildingDamage, this.building, 200, null);
                } else if (!e && this.building.owner != null && this.building.name != "mine" && this.building.name != "sapling") {
                    const ang = P(this.building.y - s.y2, this.building.x - s.x2);
                    const tt = B(s, this.building);
                    if ((H(ang * 10) / 10 == this.dir || Ay(H(ang * 10) / 10, this.dir) <= 0.1005) && r == this.building.tick && se(s, this.building, "object") <= weapon(s.weaponIndex).range && getAngleDist(tt, s.d2) <= h && !this.building.players.includes(s.sid)) {
                        const dmg = EN[s.weaponVariant] * (o == 40 ? 3.3 : 1) * weapon(s.weaponIndex).dmg * (s.weaponIndex == 10 ? 7.5 : 1);
                        this.resolve(dmg);
                        this.building.players.push(s.sid);
                        runHooks(hooks.buildingDamage, this.building, dmg, s);
                    }
                }
            }
        }
        async function onWiggle(p) {
            const a = p && p.args; if (!a) return;
            const e = a[0], t = a[1];
            await A4();
            const q = objects && objects.get(t);
            if (q) {
                q.tick = v;
                ft.push(new O3(e, q));
                q.lastHealth = q.health;
                q.animatedHealth = Date.now();
            }
        }
        function onTurretShoot(p) {
            const a = p && p.args; if (!a) return;
            const q = objects && objects.get(a[0]);
            if (q) { q.xWiggle += K.gatherWiggle * U(a[1] + W); q.yWiggle += K.gatherWiggle * V(a[1] + W); }
        }

        // ---- animals ("I" -> og) + animal attack ("J" -> sg) ----
        function onAnimals(p) {
            const args = (p && p.args) || [];
            const n = args[0] || [];
            const hidden = args[1] || [];
            bosses = { Xi: null, Ji: null, qi: null };
            for (let e = bh.length; e--;) { bh[e].forcePos = !bh[e].visible; bh[e].visible = false; }
            for (let e = 0, t = Date.now(); e < n.length; e += 8) {
                let q = Wg(n[e]);
                const dir = n[e + 4] / 100;
                if (q) {
                    q.index = n[e + 1];
                    q.t1 = q.t2 === undefined ? t : q.t2; q.t2 = t;
                    q.x1 = q.x; q.y1 = q.y;
                    q.x2 = n[e + 2]; q.y2 = n[e + 3];
                    q.d1 = q.d2 === undefined ? dir : q.d2; q.d2 = dir;
                    q.health = n[e + 5];
                    q.dt = 0; q.visible = true;
                } else {
                    const type = data.animal(n[e + 1]) || {};
                    q = {
                        sid: n[e], index: n[e + 1], isAI: true, active: true, src: type.src, name: type.name || "",
                        scale: type.scale, maxHealth: type.health, killScore: type.killScore, hostile: !!type.hostile,
                        weightM: type.weightM || 1, spriteMlt: type.spriteMlt, nameScale: type.nameScale,
                        x: n[e + 2], y: n[e + 3], dir, startX: n[e + 2], startY: n[e + 3], xVel: 0, yVel: 0, zIndex: 0
                    };
                    bh.push(q);
                    q.x2 = q.x; q.y2 = q.y; q.d2 = q.dir;
                    q.health = n[e + 5];
                    if (!type.name) q.name = ["Steph", "Bessie", "Wilfred", "Emily", "Hugo", "Sue", "Tim", "Zeus", "Mira", "Frank"][n[e + 6]] || q.name;
                    q.forcePos = true; q.visible = true;
                }
                q.state = n[e + 7];
                if (q.index < 6) continue;
                if (q.name === "MOOSTAFA") bosses.Xi = q;
                else if (q.name === "MOOFIE") bosses.Ji = q;
                else if (q.name === "Treasure") bosses.qi = q;
            }
            for (const sid of hidden) { const q = Wg(sid); if (q) q.visible = false; }
        }
        async function onAnimalAttack(p) {
            const q = Wg(p && p.args && p.args[0]);
            if (q) {
                q.lastAttack = Date.now();
                await A4();
                ft.slice().forEach((r) => r.attemptResolve(1, 1, v, 0, q));
            }
        }

        // ---- projectiles ("X" -> addProjectile -> tg, deferred one tick) ----
        function eg(t) {
            const n = Xt.filter((e) => e.name == "platform");
            for (let e = 0; e < n.length; e++) if (S4(n[e], t) <= 35 + n[e].scale) return 1;
            return 0;
        }
        function v4(t, n) {
            const e = objects && objects._list.find((o) => o.name == "turret" && o.x == t && o.y == n);
            if (e) { e.time = 2200; e.NOW = false; e.shot = Date.now(); return e; }
            return false;
        }
        function tg(i, s, o, e, t, n, r, a, l, c) {
            if (!r && !a && !l) return pn.push({ id: tg, data: [i, s, o, e, t, n, false, true] });
            if (n == 1) {
                const tur = v4(i, s);
                if (l && tur) return tur;
                if (tur) return;
            }
            let f = null;
            const hp = P3(i, s, o + W, 70);
            for (let k = 0; k < J.length; k++) {
                c = J[k];
                if (t == 1.5 && n == 1) {
                    if (c.visible && c.skinIndex == 53 && se({ x: i, y: s }, c) <= 2) { f = c; break; }
                }
                if (!(t == 1.5 && n == 1)) {
                    if (c.visible && c?.weaponIndex == c?.secondary && c.d2 === o && weapon(c.weaponIndex)?.projectile == n && S4(hp, c) <= 20) { f = c; break; }
                }
            }
            if (l) return f;
            if (f) {
                Ln.push({
                    x: f.x2, y: f.y2, dir: o, spd: t * (f.skinIndex === 1 ? 1.3 : 1),
                    avoid: t == 1.5 || eg(f) ? 1 : 0, max: x.projectiles[n].range, dmg: x.projectiles[n].dmg,
                    traveled: 0, owner: f, building: null, hit: null, info: x.projectiles[n]
                });
                const vol = ng.find((g) => g.player.sid === f.sid);
                if (!vol) ng.push({ player: f, projs: [n], amt: 1, tick: v });
                else { if (!vol.projs.includes(n)) vol.amt++; vol.projs.push(n); vol.tick = v; }
            }
            let turretGearShot = false;
            if (t == 1.5 && n == 1 && f) {
                if (rn[f.sid] === 1 && !te(f.sid) && se(f, z) <= 300 && (f.primary === 5 && f.primaryVar >= 2 || f.primary === undefined)) turretGearShot = true;
                f.tr = 0;
            }
            if (t != 1.5 && n != 1 && f) { f.skinIndex == 20 ? f.samRS = 0.78 : f.samRS = 1; f.sr = 0; }
            runHooks(hooks.projectile, { x: i, y: s, dir: o, range: e, speed: t, index: n, owner: f, turretGearShot, volley: f ? ng.find((g) => g.player?.sid == f.sid) : null });
        }
        function onProjectileAdd(p) {
            const a = p && p.args; if (!a) return;
            // server "X": [x, y, dir, range, speed, index, layer, sid]
            tg(a[0], a[1], a[2], a[3], a[4], a[5]);
        }
        // Rg (engine part): step every tracked projectile one tick and predict who
        // it hits next tick (feeds hitProjs into the damage potentials).
        function stepProjectiles(onFutureHit) {
            const nAnimals = bh.filter((e) => e.visible);
            for (let c = 0; c < Ln.length; c++) {
                let s = Infinity, o2 = Infinity;
                const rr = [];
                const a = Ln[c];
                const owner = Hg(a.owner.sid);
                if (!owner) { Ln.splice(c, 1); continue; }        // (the bundle skips the next one too)
                const e = J.filter((e2) => e2.visible && !(typeof owner.team == "string" && e2.team == owner.team) && e2.sid != owner.sid);
                const l = Xt.filter((e2) => !e2.ignoreCollision && e2.elevation > a.avoid).concat(nAnimals, e);
                for (let i = 0; i < l.length; i++) {
                    const q = l[i];
                    const sc = q.realScale ? q.realScale : q.scale;
                    const dd = S4(a, q);
                    rr[0] = lineInRect((q.x2 || q.x) - sc, (q.y2 || q.y) - sc, (q.x2 || q.x) + sc, (q.y2 || q.y) + sc, a.owner.x2, a.owner.y2, a.x + a.spd * ce * U(a.dir), a.y + a.spd * ce * V(a.dir));
                    rr[1] = lineInRect((q.x2 || q.x) - sc, (q.y2 || q.y) - sc, (q.x2 || q.x) + sc, (q.y2 || q.y) + sc, a.owner.x2, a.owner.y2, a.x + a.spd * u * U(a.dir), a.y + a.spd * u * V(a.dir));
                    if (rr[0] && dd < s) { s = dd; Ln[c].hit = q; Ln[c].building = q.realScale ? q : null; }
                    if (rr[1] && dd < o2) { o2 = dd; Ln[c].futureHit = q; }
                }
                if (Ln[c].futureHit && !Ln[c].hit) {
                    if (Ln[c].futureHit.isPlayer) {
                        const fh = Hg(Ln[c].futureHit.sid);
                        if (fh) fh.hitProjs += Ln[c].dmg;
                        if (onFutureHit) onFutureHit(Ln[c]);
                    }
                }
                Ln[c].x += a.spd * ce * U(a.dir);
                Ln[c].y += a.spd * ce * V(a.dir);
                Ln[c].traveled += a.spd * ce;
                if (Ln[c].hit && onFutureHit) onFutureHit(Ln[c], true);
            }
            Ln.forEach((t) => {
                if (t.building) setTimeout(() => { ft.slice().forEach((r) => r.attemptResolve(1, 1, v, t)); }, 10);
            });
            for (let i = Ln.length - 1; i >= 0; i--) {
                const e = Ln[i];
                if (e.hit || e.traveled >= e.max) Ln.splice(i, 1);
            }
        }
        // UTILS.lineInRect (client)
        function lineInRect(recX, recY, recX2, recY2, x1, y1, x2, y2) {
            let minX = x1, maxX = x2;
            if (x1 > x2) { minX = x2; maxX = x1; }
            if (maxX > recX2) maxX = recX2;
            if (minX < recX) minX = recX;
            if (minX > maxX) return false;
            let minY = y1, maxY = y2;
            const dx = x2 - x1;
            if (Math.abs(dx) > 0.0000001) {
                const a = (y2 - y1) / dx, b = y1 - a * x1;
                minY = a * minX + b; maxY = a * maxX + b;
            }
            if (minY > maxY) { const tmp = maxY; maxY = minY; minY = tmp; }
            if (maxY > recY2) maxY = recY2;
            if (minY < recY) minY = recY;
            if (minY > maxY) return false;
            return true;
        }

        // ---- player values ("N"): resources + the weapon-XP the bundle tracked ----
        const lastRes = {};
        async function onPlayerValue(p) {
            const e = p.key, t = p.value;
            if (["food", "stone", "wood"].includes(String(e))) {
                const prevV = lastRes[e] != null ? lastRes[e] : 0;
                lastRes[e] = t;
                const s = t - prevV;
                await A4();
                if (s > 0) {
                    if (!z.weaponXP) z.weaponXP = [];
                    if (!z.weaponXP[z.weaponIndex]) z.weaponXP[z.weaponIndex] = 0;
                    z.weaponXP[z.weaponIndex] += s;
                }
            }
        }
        // ---- objects ("H" -> J2): learn a visible owner's loadout from what they built ----
        function onObjectsLoad(p) {
            const e = (p && p.args && p.args[0]) || [];
            for (let n = 0; n + 7 < e.length; n += 8) {
                const t = Hg(e[n + 7]);
                if (e[n + 7] !== null && t != null && L3(z, t)) b4(t.loadout, e[n + 6]);
            }
        }
        function onItemCount(p) {
            const a = p && p.args; if (!a) return;
            if (!z.itemCounts) z.itemCounts = {};
            z.itemCounts[a[0]] = a[1];
        }
        function onInventory(p) {
            if (p.isWeapon) z.weapons = p.list || [];
            else z.items = p.list || [];
            yy();
        }
        function onTribeMembers(p) {
            const a = p && p.args; if (!a) return;
            py = Array.isArray(a[0]) ? a[0].slice() : [];
        }
        function onTribeSet(p) {
            const a = p && p.args;
            if (a && (a[0] == null || a[0] === "")) py = [];
        }

        // ---- the bundle's own canBuild / hasRes for self (Player.canBuild) ----
        let sandbox = !!env.sandbox;
        function hasRes(t, n) {
            for (let e = 0; e < t.req.length;) { if ((z[t.req[e]] || 0) < H(t.req[e + 1] * (n || 1))) return false; e += 2; }
            return true;
        }
        function canBuild(e) {
            if (!e) return false;
            const t = sandbox ? e.group.sandboxLimit || oe(e.group.limit * 3, 99) : e.group.limit;
            return t && (z.itemCounts || {})[e.group.id] >= t ? false : sandbox ? true : hasRes(e);
        }
        z.canBuild = canBuild;
        z.hasRes = hasRes;

        // ---- rendered position (the bundle's render-loop interpolation) ----
        let lastFrame = 0, rafId = null;
        function interpolate(now) {
            const mh = lastFrame ? now - lastFrame : 16;
            lastFrame = now;
            const xT = Date.now() - ce;
            const list = J.concat(bh);
            for (let s = 0; s < list.length; s++) {
                const q = list[s];
                if (!q || !q.visible || q.x2 == null) continue;
                if (q.forcePos) { q.x = q.x2; q.y = q.y2; q.dir = q.d2; q.rx = q.x; q.ry = q.y; q.rdir = q.dir; continue; }
                const rr = q.t2 - q.t1, a = (xT - q.t1) / rr, l = 170;
                q.dt = (q.dt || 0) + mh;
                const c = j(1.7, q.dt / l);
                if (q.x1 == null) { q.x1 = q.x2; q.y1 = q.y2; }
                q.x = q.x1 + (q.x2 - q.x1) * c; q.y = q.y1 + (q.y2 - q.y1) * c;
                q.lastx = q.x; q.lasty = q.y;
                if (q.d1 != null && q.d2 != null && rr > 0) q.dir = lerpAngle(q.d2, q.d1, j(1.2, a));
                q.rx = q.x; q.ry = q.y; q.rdir = q.dir;
            }
        }
        function frameLoop() {
            if (!win || typeof win.requestAnimationFrame !== "function") return;
            const step = (t) => { try { interpolate(Date.now()); } catch (e) { /* ignore */ } rafId = win.requestAnimationFrame(step); };
            rafId = win.requestAnimationFrame(step);
        }

        // ---- shared per-tick state the bundle's features read/write ----
        // (exposed so a feature layer can drive it exactly like the bundle)
        const state = {
            Nt: false,              // standing in an enemy pit trap (bundle Nt), recomputed each frame
            ns: [], is: [], ss: [], // nearby damaging objects / traps / enemies <= 275
            spikeTrap: null
        };

        // ---- the tick ("a") ----
        async function updatePlayers(payload) {
            runHooks(hooks.preTick, payload);
            tn = Date.now();
            v++;
            runHooks(hooks.tickStart, payload);
            state.ss.length = state.ns.length = state.is.length = vn.length = Sn.length = 0;
            vn = []; Sn = [];
            for (let e = J.length; e--;) {
                const q = J[e];
                q.vis2 = !!q.visible;
                q.forcePos = !q.visible;
                q.visible = false;
            }
            const positions = (payload && payload.positions) || [];
            const t = Date.now();
            for (const pos of positions) {
                const q = Hg(pos.sid);
                if (!q) continue;
                q.t1 = void 0 === q.t2 ? t : q.t2; Xe[q.sid] = q; q.t2 = t;
                // x/y were just overwritten with the server position by the runtime;
                // the bundle's x1 is the RENDERED position at this moment.
                q.x1 = q.rx != null ? q.rx : q.x; q.y1 = q.ry != null ? q.ry : q.y;
                q.preX = q.x2; q.preY = q.y2;
                q.pmovDir = q.movDir;
                q.x2 = pos.x; q.y2 = pos.y;
                q.d1 = void 0 === q.d2 ? pos.dir : q.d2; q.d2 = pos.dir;
                q.delta = q.dt; q.dt = 0;
                if (q.delta == null || isNaN(q.delta)) q.delta = ce;
                // attributes: the runtime keeps the last ones the server sent
                const isSelf = q === z;
                q.buildIndex = isSelf ? z.buildIndex : q.buildIndex;
                q.weaponIndex = isSelf ? z.weaponIndex : q.weaponIndex;
                q.weaponVariant = isSelf ? (z.weaponVariant || 0) : (q.variant || 0);
                q.isLeader = !!q.isLeader;
                q.skinIndex = isSelf ? (z.hat || 0) : (q.skin || 0);
                if (q.skinIndex != 45) { q.shameTimer = 30; q.clowned = false; }
                q.skinIndex == 45 && q.shameTimer == 30 && x5(q);
                q.tailIndex = isSelf ? (z.accessory || 0) : (q.tail || 0);
                q.iconIndex = q.icon != null ? q.icon : q.iconIndex;
                q.visible = true;
                if (q.x1 == null || isNaN(q.x1)) { q.x1 = q.x2; q.y1 = q.y2; }
                if (q.preX == null) { q.preX = q.x2; q.preY = q.y2; }
                q.xVel = q.x2 - q.preX; q.xVel2 = q.x2 - q.x1; q.yVel = q.y2 - q.preY; q.yVel2 = q.x2 - q.x1;
                q.slowMult = oe(1, (q.slowMult || 1) + 8e-4 * ce);
                q.movSpd = D((q.preY - q.y2) ** 2 + (q.preX - q.x2) ** 2);
                q.movSpd2 = D((q.y1 - q.y2) ** 2 + (q.x1 - q.x2) ** 2);
                q.movDir = P(q.y2 - q.preY, q.x2 - q.preX);
                (q.movDir == 0 && q.movSpd == 0 || q.preX == q.x2 && q.preY == q.y2) && (q.movDir = undefined);
                q.weaponIndex >= 9 ? q.secondary = q.weaponIndex : q.primary = q.weaponIndex;
                q.weaponIndex == q.primary && (q.primaryVar = q.weaponVariant);
                q.weaponIndex == q.secondary && (q.secondaryVar = q.weaponVariant);
                q.lastpr = q.pr; q.lastsr = q.sr; q.lasttr = q.tr;
                q.tick = v;
                xy(q);
                q.weaponE = q.weaponIndex == q.secondary ? q.sr : q.pr;
                q.multpr = q.lastpr == q.pr && q.pr == 0 ? (q.multpr = 0.015, q.lastpr = 0.015) : q.pr;
                q.multsr = q.lastsr == q.sr && q.sr == 0 ? (q.multsr = 0.015, q.lastsr = 0.015) : q.sr;
                q.hitProjs = 0; q.hitSpike = false;
                q.np = l4(q);
                q.inWater = q.y2 >= K.mapScale / 2 - K.riverWidth / 2 && q.y2 <= K.mapScale / 2 + K.riverWidth / 2;
                q.buildIndex != -1 && q.loadout && b4(q.loadout, q.buildIndex);
                q.assumeAge = g4(q);
                // the runtime set x/y to the server position; the bundle's x/y is the
                // rendered position, which the frame loop keeps updating from x1.
                q.x = q.x1; q.y = q.y1; q.dir = q.rdir != null ? q.rdir : q.d2;
                if (te(q.sid)) Sn.push(q); else vn.push(q);
            }
            yy();
            runHooks(hooks.postReconstruct, payload);
            await sleep(1);                                   // wx(1)
            // ---- object windows ----
            if (objects) {
                const list = objects._list;
                Xt = list.filter((e) => (e.distance = X5(e.x - z.x2, e.y - z.y2)) <= 2e3);
                Q = Xt.filter((e) => e.distance <= 800);
            }
            runHooks(hooks.afterSleep, payload);
            // ---- A4 + deferred handlers ----
            const ve = Ve; Ve = [];
            ve.forEach((e) => e());
            const pq = pn; pn = [];
            pq.forEach((e) => e.id(...e.data));
            runHooks(hooks.deferredFlushed, payload);
            // ---- per-player frame upkeep (bundle ~16037-16073) ----
            for (let e = J.length; e--;) {
                const i = J[e];
                if (!i) continue;
                i.visible && (i.weaponR = i.weaponIndex == i.secondary ? i.sr : i.pr);
                if (isNaN(i.poison)) i.poison = 0;
                i.poison > 0 && (i.poison = oe(0, i.poison - (i.delta || ce) / 1e3));
                if (!i?.Alive2 && !i?.Alive) { runHooks(hooks.framePlayer, i, "died"); i.deaths++; }
                i.Alive2 = true;
                runHooks(hooks.framePlayer, i, "damage");     // stacked damages (visual) reads i.dmgs here
                i.dmgs = "XD";
                if (i.vis2 == false && i.visible && i.buildIndex == -1) {
                    if (i.weaponIndex != i?.primary && i.primaryVar <= 2) i.primaryVar = 3;
                    else if (i.weaponIndex != i?.secondary && i.secondaryVar <= 2 && (i.secondary == 10 || i.secondary == 14)) i.secondaryVar = 3;
                }
                if (i.healArr && i.healArr.length) { i.healArr.forEach((h2) => l5(i.sid, h2[0], h2[1], h2[2])); i.healArr = []; }
                if (!i.deathDmgs) i.deathDmgs = [];
                if (!i.dmgsNow) i.dmgsNow = [];
                if (i.dmgsNow.length) i.deathDmgs.push(i.dmgsNow);
                i.dmgsNow = [];
                if (i.health === 100) i.deathDmgs = [];
                i.bleed = i.lastBull ? ((v - i.lastBull + (i.sid === z.sid ? et : 0)) % 9 + 9) % 9 : undefined;
            }
            runHooks(hooks.afterPlayers, payload);
            // ---- target ----
            for (let e = vn.length; e--;) vn[e].distance = D((vn[e].x2 - z.x2) ** 2 + (vn[e].y2 - z.y2) ** 2);
            vn = vn.sort((a, b) => a.distance - b.distance);
            Y = vn[0] || null;
            xi.player = J.find((e) => e.sid === xi.ID && e.visible) || null;
            if (xi.player) xi.player.positions = a4(xi.player, 6);
            else if (Y) { xi.player = Y; xi.player.positions = a4(xi.player, 6); }
            if (objects) objects.update(z.delta);          // k4(): turret reload timers
            runHooks(hooks.frame, payload);
            by();
            runHooks(hooks.frameLate, payload);
        }

        // ---- x5: a clowned player's shame timer, counted down once per tick ----
        async function x5(e, t = Hg(e.sid)) {
            if (e.shameTimer <= 0 || e.skinIndex != 45 || t == null || t == undefined) return;
            t.shameCount = 0;
            t.clowned = true;
            t.shameTimer -= e.delta / 1e3;
            await A4();
            x5(t);
        }

        // ---- lifecycle ----
        function onSetup(p) {
            en = true;
            // (you join J in addPlayer, like the bundle; setupGame only flags the game on)
            z.sid = p.sid;
            // the bundle's _n ("https://sandbox..." in the URL). This server tells its
            // own client through the client's config (window.config.inSandbox).
            try { if (win && win.config && "inSandbox" in win.config) sandbox = !!win.config.inSandbox; } catch (e) { /* keep */ }
        }
        function onDied() {
            en = false;
            runHooks(hooks.died);
        }

        MooMoo.on("setup", onSetup);
        MooMoo.on("playerAdd", onPlayerAdd);
        MooMoo.on("playerRemove", onPlayerRemove);
        MooMoo.on("playersUpdate", (p) => { updatePlayers(p).catch((e) => console.error("[moomoo.js] tick threw", e)); });
        MooMoo.on("gatherAnimation", (p) => { onGather(p); });
        MooMoo.on("health", onHealth);
        MooMoo.on("wiggle", (p) => { onWiggle(p); });
        MooMoo.on("turretShoot", onTurretShoot);
        MooMoo.on("animalsUpdate", onAnimals);
        MooMoo.on("animalAttack", (p) => { onAnimalAttack(p); });
        MooMoo.on("projectileAdd", onProjectileAdd);
        MooMoo.on("playerValue", (p) => { onPlayerValue(p); });
        MooMoo.on("itemCount", onItemCount);
        MooMoo.on("objectsLoad", onObjectsLoad);
        MooMoo.on("inventory", onInventory);
        MooMoo.on("tribeMembers", onTribeMembers);
        MooMoo.on("tribeSet", onTribeSet);
        MooMoo.on("died", onDied);
        frameLoop();

        function hookAdder(name) { return (fn) => { hooks[name].add(fn); return () => hooks[name].delete(fn); }; }

        return {
            // state
            get z() { return z; }, get self() { return z; },
            get tick() { return v; }, get v() { return v; },
            get et() { return et; }, set et(n) { et = n; },
            get tn() { return tn; }, get en() { return en; }, set en(b) { en = b; },
            get target() { return Y; }, set target(t) { Y = t; },
            get Y() { return Y; }, set Y(t) { Y = t; },
            xi,
            get visibleEnemies() { return vn; }, get vn() { return vn; }, set vn(a) { vn = a; },
            get visibleFriends() { return Sn; }, get Sn() { return Sn; },
            get players() { return J; }, get J() { return J; },
            get animals() { return bh; }, get bh() { return bh; }, get bosses() { return bosses; },
            get projectiles() { return Ln; }, get Ln() { return Ln; },
            get volleys() { return ng; }, set volleys(a) { ng = a; }, get ng() { return ng; }, set ng(a) { ng = a; },
            get ft() { return ft; },
            get Xt() { return Xt; }, get Q() { return Q; },
            get py() { return py; },
            get loadout() { return loadout; },
            rn, an, ln, Xe, state,
            get sandbox() { return sandbox; }, set sandbox(b) { sandbox = !!b; },
            selfInput,
            // ms until eating won't count as shame (0 = now); see "shame timing"
            shameWait, get lastHitSeen() { return lastHitSeen; },
            // timing
            A4, nextTick: A4, defer: (fn, ...args) => pn.push({ id: fn, data: args }),
            // geometry + predicates
            se, B, S4, Dy, P3, L3, X5, Ne, Ay, angleDist: getAngleDist, getDirection, getDistance, lerpAngle, lineInRect,
            _y, Vy, o4, l4, a4, x4, w4, b4, g4, xy, l5, te, Hg, jg, Wg, yy, canBuild, hasRes,
            stepProjectiles,
            variantVal, weaponSpeed, weaponRange,
            visiblePlayers: () => J.filter((p) => p !== z && p.visible),
            K, ce, u, EN, h, O3,
            // hooks (feature layers run here, in the bundle's order)
            onPreTick: hookAdder("preTick"),
            onTickStart: hookAdder("tickStart"),
            onPostReconstruct: hookAdder("postReconstruct"),
            onAfterSleep: hookAdder("afterSleep"),
            onDeferredFlushed: hookAdder("deferredFlushed"),
            onAfterPlayers: hookAdder("afterPlayers"),
            onFrame: hookAdder("frame"),
            onFrameLate: hookAdder("frameLate"),
            onFramePlayer: hookAdder("framePlayer"),
            onProjectile: hookAdder("projectile"),
            onPlayerAdded: hookAdder("playerAdded"),
            onPlayerLeft: hookAdder("playerLeft"),
            onBuildingDamage: hookAdder("buildingDamage"),
            onDied: hookAdder("died"),
            // for tests / advanced
            _updatePlayers: updatePlayers, _interpolate: interpolate,
            get _pn() { return pn; }, get _Ve() { return Ve; }
        };

        // ---- combat predicates ported 1-1 ----
        function _y(e, t) {
            if (!e) return;
            !t && (t = 111);
            return j(1, e.weaponR + t / weapon(e.weaponIndex)?.speed);
        }
        function Vy(e, t, n, i) {
            return se(e, t, "player") <= n || i && se(e?.np?.real, t?.np?.real, "player") <= n;
        }
        function o4(e, t, n) {
            if (t.weaponIndex != 11) return true;
            n = B(e, t);
            return getAngleDist(n + W, t.dir) > W / 3;
        }
    }

    return { createCombat, K, ce, EN, r3 };
});


/* ===== module: game/render (loader/src/game/render.js) ===== */
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


/* ===== module: game/pathfind (loader/src/game/pathfind.js) ===== */
/*
 * moomoo.js loader — PATHFINDER  (ctx.path)
 * =========================================
 * A* on a 12 px grid over a 900 x 900 window around you, avoiding buildings the
 * way the game's movement does (trees / bushes shrink to 70%, enemy spikes grow
 * by 40, pit traps only block when they're an enemy's, boost pads / teleporters
 * block, your clan's buildings don't hurt). The search runs in a Web Worker pool
 * so a long search never stalls a frame; without Worker support (headless) it
 * runs inline.
 *
 *   ctx.path.find({ player, target, buildings, clan })
 *     player     { x2, y2, sid }        where you are (server position)
 *     target     { x, y }
 *     buildings  game objects near you  (x, y, scale, name, type, dmg, owner, ...)
 *     clan       sids of your clan
 *   -> Promise<{ ok, path, reason }>
 *        path    [x0, y0, x1, y1, ...] from you to the target (empty unless ok)
 *        reason  "reached target" | "reached max iterations" | "couldn't reach target"
 *
 * Part of the LOADER.
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooPathfind = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooPathfind = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    // The search itself. Self-contained (only Math / JSON / Number), because its
    // source text is also what the worker runs.
    function makeSearch() {
        const sqrt = Math.sqrt, abs = Math.abs, floor = Math.floor, MAX = Number.MAX_VALUE;
        const SQRT2 = sqrt(2);
        const SPAN = 900;              // window size (px)
        const CELL = 12;               // grid step (px)
        const HALF = CELL / 2;
        const EMPTY = JSON.stringify(new Array(Math.round(SPAN / CELL)).fill([]));
        const N = JSON.parse(EMPTY).length;
        const STEPS = [0, -1, 0, 1, -1, 0, 1, 0, 1, 1, 1, -1, -1, 1, -1, -1];
        const dist = (x1, y1, x2, y2) => sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
        const stepCost = (dx, dy) => {
            const a = abs(dx), b = abs(dy);
            return ((a === 0) + (b === 0)) * CELL + (a !== 0 && b !== 0) * CELL * SQRT2;
        };
        function grid(sx, sy, obstacles, tx, ty) {
            const map = JSON.parse(EMPTY);
            let target = 0, start = 0;
            for (let i = 0; i < N; i++) {
                const col = map[i];
                for (let j = 0; j < N; j++) {
                    const n = col[j] = { x: i * CELL - SPAN / 2 + sx, y: j * CELL - SPAN / 2 + sy, obstacle: false, available: 1, n: i * N + j };
                    if (n.x < 0 || n.x > 14400 || n.y < 0 || n.y > 14400) { n.obstacle = 1; continue; }
                    for (let k = obstacles.length, o; k--, o = obstacles[k];) {
                        if (n.obstacle = abs(o.x - n.x) <= o.scale2 + 20 && abs(o.y - n.y) <= o.scale2 + 20 && sqrt((o.x - n.x) ** 2 + (o.y - n.y) ** 2) - o.scale2 - 20 <= 0) break;
                    }
                    n.target = abs(n.x - tx) <= HALF && abs(n.y - ty) <= HALF;
                    target = n.target * n.n + !n.target * target;
                    n.start = abs(n.x - sx) <= HALF && abs(n.y - sy) <= HALF;
                    start = n.start * n.n + !n.start * start;
                    n.fCost = n.start * -MAX;
                    n.gCost = !n.start * MAX;
                }
            }
            return { map, targetNode: target, startNode: start };
        }
        // what blocks you, and how far around it (the game's own collision radii)
        function blocking(b, me, clan) {
            b.scale2 = (b.owner == null || b.name == "sapling") && b.type === 0 ? b.scale * .7
                : b.dmg && !clan.includes(b?.owner?.sid) && b?.owner?.sid != me.sid ? b.scale + 40
                    : b.type === 1 && b.y < 12e3 && (b.teleport || b.boostSpeed) ? b.scale + 35
                        : b["do"] ? b.scale : b.scale - 10;
            return (b.ignoreCollision ? b.name === "pit trap" ? b?.owner?.sid != me.sid && !clan.includes(b.owner?.sid) : b.name === "boost pad" || b.name === "teleporter" : true) && dist(b.x, b.y, me.x2, me.y2) < SPAN;
        }
        return function search(job) {
            const me = job.player, to = job.target, clan = job.clan || [];
            if (dist(me.x2, me.y2, to.x, to.y) <= 0) return "reached target";
            const { map, startNode, targetNode } = grid(me.x2, me.y2, (job.buildings || []).filter((b) => blocking(b, me, clan)), to.x, to.y);
            void targetNode;
            let open = [startNode];
            const closed = [];
            let cur, budget = 1e5;
            while (open.length * budget--) {
                let best = Infinity, at;
                for (let e = open.length, nd; e--;) {
                    nd = map[floor(open[e] / N)][open[e] % N];
                    if (nd.fCost < best) { cur = nd; best = nd.fCost; at = e; }
                }
                open.splice(at, 1);
                closed.push(cur.n);
                if (cur.target) break;
                for (let s = 0, nb; s < STEPS.length; s++) {
                    nb = map[floor(cur.n / N) + STEPS[s]]?.[cur.n % N + STEPS[s + 1]];
                    if (!nb || closed.includes(nb.n)) continue;
                    const g = cur.gCost + stepCost(STEPS[s], STEPS[s + 1]);
                    if (!nb.obstacle && nb.available === 1) {
                        if (!open.includes(nb.n)) {
                            nb.parent = cur.n;
                            nb.gCost = g;
                            nb.hCost = dist(nb.x, nb.y, to.x, to.y);
                            nb.fCost = g + nb.hCost;
                            open.push(nb.n);
                        } else if (g < nb.gCost) {
                            nb.parent = cur.n;
                            nb.gCost = g;
                            nb.fCost = g + nb.hCost;
                        }
                    }
                }
            }
            if (budget === 0) return "reached max iterations";
            if (!open.length) return "couldn't reach target";
            const path = [];
            while (!cur.start) {
                path.push(cur.y, cur.x);
                cur = map[floor(cur.parent / N)][cur.parent % N];
            }
            return path.reverse();
        };
    }

    // Only the fields the search reads (game objects hold references that don't clone).
    function serialize(job) {
        const pl = job.player || {};
        return {
            player: { x2: pl.x2, y2: pl.y2, sid: pl.sid },
            target: { x: job.target.x, y: job.target.y },
            buildings: (job.buildings || []).map((b) => ({
                x: b.x, y: b.y, scale: b.scale, name: b.name, type: b.type, dmg: b.dmg,
                ignoreCollision: b.ignoreCollision, teleport: b.teleport, boostSpeed: b.boostSpeed,
                "do": b["do"], owner: b.owner == null ? null : { sid: b.owner.sid }
            })),
            clan: Array.isArray(job.clan) ? job.clan.slice() : []
        };
    }
    const toResult = (raw) => (typeof raw === "string"
        ? { ok: false, path: [], reason: raw }
        : { ok: raw.length > 0, path: raw, reason: raw.length ? "" : "couldn't reach target" });

    function createPathfinder(opts) {
        const win = (opts && opts.win) || (typeof self !== "undefined" ? self : null);
        const W = win && win.Worker, B = win && win.Blob, U = win && win.URL;
        let inline = null;
        const pool = [];      // { worker, free }
        let url = null;

        function spawn() {
            if (!url) url = U.createObjectURL(new B(["const search=(" + makeSearch.toString() + ")();onmessage=function(e){postMessage(search(e.data))};"]));
            const entry = { worker: new W(url), free: true };
            pool.push(entry);
            return entry;
        }
        function find(job) {
            const msg = serialize(job);
            if (!W || !B || !U) {
                inline = inline || makeSearch();
                return new Promise((resolve) => setTimeout(() => resolve(toResult(inline(msg))), 0));
            }
            return new Promise((resolve, reject) => {
                let entry;
                try { entry = pool.find((p) => p.free) || spawn(); }
                catch (e) { inline = inline || makeSearch(); resolve(toResult(inline(msg))); return; }
                entry.free = false;
                entry.worker.onmessage = (e) => { entry.free = true; resolve(toResult(e.data)); };
                entry.worker.onerror = (e) => { entry.free = true; reject(e); };
                entry.worker.postMessage(msg);
            });
        }
        function dispose() {
            for (const p of pool) { try { p.worker.terminate(); } catch (e) { /* gone */ } }
            pool.length = 0;
            if (url) { try { U.revokeObjectURL(url); } catch (e) { /* ignore */ } url = null; }
        }
        return { find, dispose, get workers() { return pool.length; } };
    }

    return { createPathfinder, makeSearch };
});


/* ===== module: core/api (loader/src/core/api.js) ===== */
/*
 * moomoo.js loader — GAME HELPERS  (combat / placement / hats / targeting)
 * ========================================================================
 * These are the game-specific verbs the old bundle's features are built from,
 * ported to packets the loader already speaks. They're injected into every mod's
 * `ctx` (see runtime.js `ctxExtensions`), so a mod can just call `ctx.place(...)`,
 * `ctx.eat()`, `ctx.setHat(...)`, `ctx.nearestEnemy()`, etc.
 *
 * Mechanics are taken straight from the server's packet handler
 * (server/src/network/packets.js):
 *   - select an item/weapon:  selectItem(index, isWeapon)      ->  wire "z"
 *   - place OR eat the selected item:  mouse(true, dir)        ->  wire "F" (buildItem)
 *   - attack (no item selected):       mouse(true, dir)        ->  wire "F" (hits++)
 *   - equip hat/accessory:   store(1, id, isAccessory)         ->  wire "c"
 *
 * Part of the LOADER (volatile).
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooApi = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooApi = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const SERVER_TICK = 1000 / 9;   // ~111.11ms — one server tick (combo timing unit)

    // Build the ctxExtensions function. `env` = { MooMoo, input, data, objects }.
    function createHelpers(env) {
        const MooMoo = env.MooMoo;
        const data = env.data;
        const input = env.input;
        const objects = env.objects || null;
        const combatEngine = env.combat || null;
        const net = env.net || null;
        const store = env.store || null;
        const render = env.render || null;
        const pathfinder = env.pathfinder || null;
        const S = () => MooMoo.self;

        // ---- combat state: weapon reload + variants (reconstructed from packets) ----
        // Mirrors the client's model: a weapon's reload fills over weapon.speed (ms),
        // scaled by samRP (Samurai Armor = hat 20 -> 0.78). It resets on every swing,
        // which the server echoes as the gather-animation packet "K" =
        // [sid, didHit, weaponIndex, (1/atkSpd)?]. So we read our own swings off "K"
        // and a weapon is "ready" once weapon.speed*samRP ms have passed.
        const WEAPON_VARIANT = [1, 1.1, 1.18, 1.18];   // damage multiplier by variant (gold/diamond/ruby)
        let serverTick = 0;
        let lastPrimarySwing = 0, lastSecondarySwing = 0;
        MooMoo.on("playersUpdate", () => { serverTick++; });
        MooMoo.on("gatherAnimation", (p) => {
            const a = p && p.args;
            if (!a || a[0] !== S().sid) return;
            const w = a[2];
            if (typeof w !== "number") return;
            if (w > 8) lastSecondarySwing = Date.now(); else lastPrimarySwing = Date.now();
        });
        const samRP = () => (S().hat === 20 ? 0.78 : 1);   // Samurai Armor attack-speed bonus
        const weaponSpeed = (id) => { const w = data.weapon(id); return (w && w.speed != null) ? w.speed : 300; };
        const primaryId = () => (S().weapons || [])[0];
        const secondaryId = () => (S().weapons || [])[1];
        function primaryReady() { const id = primaryId(); return id != null && (Date.now() - lastPrimarySwing) >= weaponSpeed(id) * samRP(); }
        function secondaryReady() { const id = secondaryId(); return id != null && (Date.now() - lastSecondarySwing) >= weaponSpeed(id) * samRP(); }
        const variantVal = (v) => WEAPON_VARIANT[v] || 1;
        // Mark a swing optimistically the instant we send an attack, so back-to-back
        // combo decisions don't fire before the server's "K" echo arrives.
        function markSwing() { if (S().weaponIndex > 8) lastSecondarySwing = Date.now(); else lastPrimarySwing = Date.now(); }

        // ---- geometry ----
        // The bundle's combat math works on PREDICTED positions (x2/y2) and falls
        // back to the live position when there's no prediction. These primitives
        // are ported 1-1 from the bundle so features behave identically:
        //   S4(a,b)        center distance            -> centerDist
        //   se(a,b,type)   edge distance (+offset)    -> edgeDist   (player -63, object -scale)
        //   B(a,b)         angle a->b                 -> angleBetween
        //   getAngleDist   smallest angle between     -> angleDist
        const TAU = Math.PI * 2;
        const px = (e) => (e && e.x2 != null ? e.x2 : (e ? e.x : 0)) || 0;
        const py = (e) => (e && e.y2 != null ? e.y2 : (e ? e.y : 0)) || 0;
        const dist = (a, b) => Math.hypot(px(b) - px(a), py(b) - py(a));
        const centerDist = dist;
        const edgeDist = (a, b, type) => {
            const off = type === "player" ? -1.8 * 35 : type === "object" ? -(b && b.scale || 0) : 0;
            return Math.hypot(px(b) - px(a), py(b) - py(a)) + off;
        };
        const angle = (from, to) => Math.atan2(py(to) - py(from), px(to) - px(from));
        const angleBetween = angle;
        function angleDist(a, b) {
            let n = Math.abs(a - b) % TAU;
            if (n > Math.PI) n = TAU - n;
            return n;
        }
        const toRad = (deg) => deg * (Math.PI / 180);

        // ---- targeting ----
        function visiblePlayers() {
            const out = [];
            for (const p of MooMoo.players.values()) if (p.sid !== S().sid && p.visible) out.push(p);
            return out;
        }
        function enemies() {
            const me = S();
            return visiblePlayers().filter((p) => !(me.team != null && p.team != null && p.team === me.team));
        }
        function nearestEnemy(maxRange) {
            const me = S();
            let best = null, bd = Infinity;
            for (const p of enemies()) {
                const d = dist(me, p);
                if (d < bd && (maxRange == null || d <= maxRange)) { bd = d; best = p; }
            }
            return best;
        }
        // Worst-case melee damage an in-range enemy could land this tick (enemies are
        // assumed max variant, like the client's dmgpot). Used for soldier/heal logic.
        function predictedDamage(range) {
            let worst = 0;
            for (const p of enemies()) {
                const w = data.weapon(p.weaponIndex);
                if (!w || w.dmg == null) continue;
                if (dist(S(), p) > (range != null ? range : (w.range || 0) + 70)) continue;
                const d = w.dmg * variantVal(p.weaponVariant != null ? p.weaponVariant : 3);
                if (d > worst) worst = d;
            }
            return worst;
        }

        // ---- inventory resolution ----
        function ownedItemsInGroup(groupName) {
            const out = [];
            for (const id of S().items) { const it = data.item(id); if (it && it.group.name === groupName) out.push(it); }
            return out;
        }
        // Resolve `which` (item id | item name | group name) to an owned item id, or -1.
        function resolvePlaceable(which) {
            if (typeof which === "number") return which;
            const named = data.itemByName(which);
            if (named) return named.id;
            const owned = ownedItemsInGroup(which).sort((a, b) => b.id - a.id); // most advanced first
            return owned.length ? owned[0].id : -1;
        }

        // ---- actions ----
        function selectWeapon(id) { MooMoo.send.selectItem(id, true); }
        function equipWeapon(id) { if (id != null) selectWeapon(id); }

        // Place a building toward `dir` (defaults to the current facing), then put
        // the weapon back so attacking resumes. One F-down = one placed object.
        function place(which, dir) {
            const id = resolvePlaceable(which);
            if (id < 0) return false;
            const d = dir == null ? (S().dir || 0) : dir;
            MooMoo.send.selectItem(id, false);
            MooMoo.send.mouse(true, d);
            selectWeapon(S().weaponIndex);
            return true;
        }

        // Eat food (apple by default). Same mechanic as placing, but food items are
        // `consume` so the server heals you instead of building.
        function eat(which) {
            let id;
            if (typeof which === "number") id = which;
            else { const f = data.itemByName(which || "apple"); id = f ? f.id : 0; }
            MooMoo.send.selectItem(id, false);
            MooMoo.send.mouse(true, S().dir || 0);
            selectWeapon(S().weaponIndex);
            return true;
        }

        // Attacking. If a buildable is selected, reselect the weapon first so the
        // mouse-down is an attack, not a placement.
        function ensureWeapon() { if (S().buildIndex >= 0) selectWeapon(S().weaponIndex); }
        function startAttack(dir) { ensureWeapon(); MooMoo.send.mouse(true, dir == null ? undefined : dir); markSwing(); }
        function stopAttack() { MooMoo.send.mouse(false); }
        function attackOnce(dir) { ensureWeapon(); MooMoo.send.mouse(true, dir == null ? undefined : dir); MooMoo.send.mouse(false); markSwing(); }

        // Aiming.
        function aim(dir) { MooMoo.send.aim(dir); }
        function aimAt(x, y) { MooMoo.send.aim(Math.atan2(y - S().y, x - S().x)); }
        function aimAtPlayer(p) { if (p) aimAt(p.x, p.y); }
        function aimAtMouse() { if (input) MooMoo.send.aim(input.aimAngle()); }

        // Hats / accessories (store action 0 = buy, 1 = equip).
        function setHat(id) { MooMoo.send.store(1, id | 0, false); }
        function setTail(id) { MooMoo.send.store(1, id | 0, true); }
        function unequipHat() { MooMoo.send.store(1, 0, false); }
        function unequipTail() { MooMoo.send.store(1, 0, true); }
        function buyHat(id) { MooMoo.send.store(0, id | 0, false); }
        function buyTail(id) { MooMoo.send.store(0, id | 0, true); }

        // Weapon info.
        function heldWeapon() { return data.weapon(S().weaponIndex); }
        function ownedWeapons() { return (S().weapons || []).map((id) => data.weapon(id)).filter(Boolean); }
        function fastestWeapon() {
            const ws = ownedWeapons().filter((w) => w.speed != null);
            if (!ws.length) return null;
            return ws.reduce((a, b) => (b.speed < a.speed ? b : a));
        }

        // The ctxExtensions function the runtime calls for each mod. `ctx` already
        // has on/every/etc. that auto-tear-down, so onTick piggybacks on ctx.on.
        return function (ctx /*, rec, active */) {
            // Clear any freecam camera override exactly once when this mod is torn down,
            // however many times overrideCamera() was called while it ran.
            let camCleanupArmed = false;
            const armCamCleanup = () => { if (!camCleanupArmed && render) { camCleanupArmed = true; ctx.onCleanup(() => render.setCameraOverride(null)); } };
            return {
                // data + input + constants
                data, gameData: data, input, SERVER_TICK,
                now: () => Date.now(),
                // geometry + targeting (bundle-faithful primitives)
                distance: dist, angleTo: angle,
                centerDist, edgeDist, angleBetween, angleDist, toRad,
                visiblePlayers, enemies, nearestEnemy, predictedDamage,
                // world objects (buildings / resources / turrets / traps)
                objects,
                // outgoing: rate governor, packet counts, ping (see outgoing.js)
                net,
                // owned/equipped hats + accessories, bundle equip() semantics (store.js)
                store,
                // overlay drawing in line with the stock picture, or a full-frame
                // replacement (render.js). Layers/replacers are removed with the mod.
                render: render && {
                    view: render.view, camera: render.camera,
                    players: render.players, animals: render.animals,
                    player: render.player, animal: render.animal,
                    worldToScreen: render.worldToScreen, lerpAngle: render.lerpAngle,
                    get me() { return render.me; },
                    get replacing() { return render.replacing; },
                    layer(id, draw, opts) { const un = render.addLayer(id, draw, opts); ctx.onCleanup(un); return un; },
                    replace(spec) { const un = render.setReplacer(spec); ctx.onCleanup(un); return un; },
                    onFrame(fn) { const un = render.onFrame(fn); ctx.onCleanup(un); return un; },
                    // Freecam: aim the overlay camera at a world spot (null = back to your
                    // player). Cleared automatically when the mod is torn down.
                    overrideCamera(x, y) { armCamCleanup(); render.setCameraOverride(x == null ? null : { x, y }); },
                    clearCameraOverride() { render.setCameraOverride(null); },
                    get cameraOverride() { return render.cameraOverride; }
                },
                // A* pathfinder (worker pool). ctx.path.find({player,target,buildings,clan})
                // -> Promise<{ok, path, reason}>. Null in environments without one.
                path: pathfinder && { find: (job) => pathfinder.find(job), get workers() { return pathfinder.workers; } },
                // combat state: the full engine (per-player prediction/reload/bull)
                // when present; a minimal reload shim otherwise (headless tests).
                combat: combatEngine || {
                    get tick() { return serverTick; },
                    primaryReady, secondaryReady, variantVal, samRP, markSwing,
                    primaryId, secondaryId, weaponSpeed,
                    get primaryVar() { return S().weaponVariant != null ? S().weaponVariant : 0; }
                },
                primaryReady, secondaryReady, markSwing,
                // tick (fires once per server movement update)
                onTick: (fn) => ctx.on("playersUpdate", fn),
                // combat verbs
                place, eat, equipWeapon, selectWeapon,
                startAttack, stopAttack, attackOnce,
                aim, aimAt, aimAtPlayer, aimAtMouse,
                // hats
                setHat, setTail, unequipHat, unequipTail, buyHat, buyTail,
                // weapon info
                heldWeapon, ownedWeapons, fastestWeapon,
                resolvePlaceable
            };
        };
    }

    return { createHelpers, SERVER_TICK };
});


/* ===== module: core/modstab (loader/src/core/modstab.js) ===== */
/*
 * moomoo.js loader — IN-GAME MODS MENU
 * ====================================
 * Injects a "Mods" tab into the game's pause menu (#gameMenuTabs) that matches
 * the native Settings / Friends / Clan / Report tabs, plus a panel where every
 * registered mod can be toggled on/off at runtime and expanded to reveal its
 * own settings.
 *
 * The native tab bar captures its <a> elements once at startup, so our added
 * tab is managed entirely by us: we show/hide our panel and keep the active
 * state mutually exclusive with the native tabs by watching their bodies.
 *
 * This is part of the LOADER (volatile): the element ids and classes below
 * mirror this build's client. If the menu markup changes, update this file.
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooModsTab = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooModsTab = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    // Native menu anchors for THIS build.
    const SEL = {
        tabs: "#gameMenuTabs",
        card: "#gameSettings",
        bodies: ["#gameSettingsBody", "#gameFriendsBody", "#reportMenu"]
    };

    const STYLE = `
    /* The client captures the tab bar's <a> list once at startup and hides any
       tab it doesn't know about, so force ours to stay visible regardless. */
    #gameMenuTabs a.mmj-tab{ display:flex !important; align-items:center; justify-content:center; }
    .mmj-body{ color:#5a5a5a; max-height:340px; overflow-y:auto; overflow-x:hidden; margin:0 -4px; padding:0 4px; }
    .mmj-body .mmj-empty{ padding:26px 8px; text-align:center; color:#9a9a9a; font-size:15px; line-height:1.5; }
    .mmj-body .mmj-empty code{ background:#f0f0f0; border-radius:4px; padding:1px 5px; color:#6cc24a; }
    .mmj-body .mmj-mod{ border-bottom:1px solid #eee; }
    .mmj-body .mmj-row{ display:flex; align-items:center; gap:10px; padding:11px 4px; }
    .mmj-body .mmj-head{ cursor:default; }
    .mmj-body .mmj-head.mmj-has-settings{ cursor:pointer; border-radius:6px; }
    .mmj-body .mmj-head.mmj-has-settings:hover{ background:#f3f3f3; }
    .mmj-body .mmj-name{ flex:1 1 auto; min-width:0; font-size:16px; color:#2f2f2f; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .mmj-body .mmj-ver{ font-size:11px; color:#b4b4b4; margin-left:6px; }
    .mmj-body .mmj-chev{ width:10px; height:10px; border-right:2px solid #c0c0c0; border-bottom:2px solid #c0c0c0; transform:rotate(-45deg); transition:transform .18s ease; flex:0 0 auto; margin-right:2px; }
    .mmj-body .mmj-mod.mmj-open .mmj-chev{ transform:rotate(45deg); }
    .mmj-body .mmj-settings{ display:none; padding:2px 6px 12px 6px; }
    .mmj-body .mmj-mod.mmj-open .mmj-settings{ display:block; }
    .mmj-body .mmj-set{ display:flex; align-items:center; gap:10px; padding:7px 0; font-size:14px; color:#6a6a6a; }
    .mmj-body .mmj-set-label{ flex:1 1 auto; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .mmj-body .mmj-set input[type=text], .mmj-body .mmj-set input[type=number], .mmj-body .mmj-set select{
        font-family:inherit; font-size:13px; color:#333; border:1px solid #dcdcdc; border-radius:6px; padding:4px 7px; width:96px; background:#fff; }
    .mmj-body .mmj-set input[type=range]{ -webkit-appearance:none; appearance:none; width:110px; height:5px; border-radius:3px; background:#e2e2e2; outline:none; }
    .mmj-body .mmj-set input[type=range]::-webkit-slider-thumb{ -webkit-appearance:none; width:15px; height:15px; border-radius:50%; background:#6cc24a; cursor:pointer; box-shadow:0 1px 2px rgba(0,0,0,.25); }
    .mmj-body .mmj-set input[type=range]::-moz-range-thumb{ width:15px; height:15px; border:none; border-radius:50%; background:#6cc24a; cursor:pointer; }
    .mmj-body .mmj-set-val{ font-size:12px; color:#9a9a9a; min-width:30px; text-align:right; }
    .mmj-body .mmj-hint{ padding:9px 2px 3px; font-size:12.5px; color:#9a9a9a; line-height:1.5; }
    .mmj-body .mmj-hint b{ color:#6cc24a; font-weight:bold; }
    /* toggle switch */
    .mmj-switch{ position:relative; display:inline-block; width:40px; height:22px; flex:0 0 auto; }
    .mmj-switch input{ opacity:0; width:0; height:0; position:absolute; }
    .mmj-switch .mmj-slider{ position:absolute; inset:0; background:#d2d2d2; border-radius:22px; transition:background .18s ease; cursor:pointer; }
    .mmj-switch .mmj-slider:before{ content:""; position:absolute; width:16px; height:16px; left:3px; top:3px; background:#fff; border-radius:50%; transition:transform .18s ease; box-shadow:0 1px 2px rgba(0,0,0,.3); }
    .mmj-switch input:checked + .mmj-slider{ background:#6cc24a; }
    .mmj-switch input:checked + .mmj-slider:before{ transform:translateX(18px); }
    .mmj-switch.mmj-small{ width:34px; height:19px; }
    .mmj-switch.mmj-small .mmj-slider:before{ width:13px; height:13px; }
    .mmj-switch.mmj-small input:checked + .mmj-slider:before{ transform:translateX(15px); }
    `;

    function installMenu(win, MooMoo) {
        const doc = win.document;
        if (!doc || typeof doc.querySelector !== "function" || typeof doc.createElement !== "function") return null;

        function el(tag, cls, attrs) {
            const n = doc.createElement(tag);
            if (cls) n.className = cls;
            if (attrs) for (const k in attrs) n.setAttribute(k, attrs[k]);
            return n;
        }

        let styleInjected = false;
        function ensureStyle() {
            if (styleInjected) return;
            styleInjected = true;
            const s = el("style"); s.textContent = STYLE;   // no id/class: nothing for a tag#id probe to find
            (doc.head || doc.documentElement).appendChild(s);
        }

        let panel = null;      // our injected mods body (class .mmj-body, no id)
        let tab = null;        // our <a data-tab="mods">
        const openState = {};  // id -> expanded?

        function nativeBodies() { return SEL.bodies.map((s) => doc.querySelector(s)).filter(Boolean); }
        function nativeTabs() { const bar = doc.querySelector(SEL.tabs); return bar ? Array.from(bar.querySelectorAll("a")).filter((a) => a !== tab) : []; }

        function showMods() {
            for (const b of nativeBodies()) b.style.display = "none";
            if (panel) panel.style.display = "";
            if (tab) tab.classList.add("active");
            for (const a of nativeTabs()) a.classList.remove("active");
        }
        function hideMods() {
            if (panel) panel.style.display = "none";
            if (tab) tab.classList.remove("active");
        }

        function inject() {
            const bar = doc.querySelector(SEL.tabs);
            const card = doc.querySelector(SEL.card);
            if (!bar || !card || panel) return Boolean(panel);   // `panel` is our body; no id to look up

            ensureStyle();

            tab = el("a", "mmj-tab", { "data-tab": "mods" });
            tab.textContent = "Mods";
            // Capture phase + stopImmediatePropagation: the client rebinds every
            // tab's onclick to its own handler (which would hide our tab), so we
            // intercept the click before that handler ever runs.
            tab.addEventListener("click", (e) => {
                if (e.isTrusted === false) return;
                e.stopImmediatePropagation();
                showMods();
            }, true);
            bar.appendChild(tab);

            panel = el("div", "mmj-body");   // class only, no id
            panel.style.display = "none";
            // place it right after the last native body so close button stays last
            card.appendChild(panel);

            // Mutual exclusivity: when a native body becomes visible, drop out of Mods.
            try {
                const obs = new win.MutationObserver(() => {
                    if (!panel || panel.style.display === "none") return;
                    for (const b of nativeBodies()) { if (b.style.display !== "none") { hideMods(); break; } }
                });
                for (const b of nativeBodies()) obs.observe(b, { attributes: true, attributeFilter: ["style"] });
            } catch (e) { /* no MutationObserver: the per-tab click handlers still cover the common case */ }
            for (const a of nativeTabs()) a.addEventListener("click", (e) => { if (e.isTrusted === false) return; hideMods(); });

            render();
            try { win.console.log("%c[moomoo.js]", "color:#6cc24a;font-weight:bold", "Mods tab added to the game menu"); } catch (e) {}
            return true;
        }

        function makeSetting(mod, s) {
            const row = el("div", "mmj-set");
            const label = el("div", "mmj-set-label");
            label.textContent = s.label;
            const commit = (v) => MooMoo.setSetting(mod.id, s.key, v);

            let control, valueTag;
            if (s.type === "boolean") {
                control = el("label", "mmj-switch mmj-small");
                const input = el("input", null, { type: "checkbox" });
                input.checked = !!s.value;
                input.addEventListener("change", () => commit(input.checked));
                control.appendChild(input); control.appendChild(el("span", "mmj-slider"));
            } else if (s.type === "number" && s.min !== undefined && s.max !== undefined) {
                control = el("input", null, { type: "range", min: s.min, max: s.max, step: s.step != null ? s.step : 1 });
                control.value = s.value;
                valueTag = el("div", "mmj-set-val"); valueTag.textContent = String(s.value);
                control.addEventListener("input", () => { valueTag.textContent = String(control.value); });
                control.addEventListener("change", () => commit(parseFloat(control.value)));
            } else if (s.type === "number") {
                control = el("input", null, { type: "number" });
                control.value = s.value;
                if (s.min !== undefined) control.min = s.min;
                if (s.max !== undefined) control.max = s.max;
                if (s.step != null) control.step = s.step;
                control.addEventListener("change", () => commit(parseFloat(control.value)));
            } else if (s.type === "select") {
                control = el("select");
                for (const opt of (s.options || [])) {
                    const o = el("option"); o.value = String(opt); o.textContent = String(opt);
                    if (String(opt) === String(s.value)) o.selected = true;
                    control.appendChild(o);
                }
                control.addEventListener("change", () => commit(control.value));
            } else {
                control = el("input", null, { type: "text" });
                control.value = s.value == null ? "" : s.value;
                control.addEventListener("change", () => commit(control.value));
            }
            row.appendChild(label);
            if (valueTag) row.appendChild(valueTag);
            row.appendChild(control);
            return row;
        }

        function render() {
            if (!panel) return;
            const mods = MooMoo.getMods();
            panel.textContent = "";
            if (!mods.length) {
                const empty = el("div", "mmj-empty");
                empty.innerHTML = "No mods installed yet.<br>Add a mod userscript that <code>@require</code>s this loader.";
                panel.appendChild(empty);
                return;
            }
            for (const mod of mods) {
                const wrap = el("div", "mmj-mod");
                if (openState[mod.id]) wrap.classList.add("mmj-open");
                // A mod with its own menu only puts its "basic" toggles here (plus a line
                // pointing at that menu); a simple mod shows all of its settings here.
                const shown = mod.menu ? mod.settings.filter((s) => s.basic) : mod.settings;
                const expandable = shown.length > 0 || !!mod.menuHint;

                const head = el("div", "mmj-row mmj-head" + (expandable ? " mmj-has-settings" : ""));
                const sw = el("label", "mmj-switch");
                const input = el("input", null, { type: "checkbox" });
                input.checked = mod.enabled;
                input.addEventListener("click", (e) => e.stopPropagation());
                input.addEventListener("change", () => MooMoo.setModEnabled(mod.id, input.checked));
                sw.appendChild(input); sw.appendChild(el("span", "mmj-slider"));

                const name = el("div", "mmj-name");
                name.textContent = mod.name;
                const ver = el("span", "mmj-ver"); ver.textContent = "v" + mod.version; name.appendChild(ver);

                head.appendChild(sw);
                head.appendChild(name);
                if (expandable) {
                    head.appendChild(el("div", "mmj-chev"));
                    head.addEventListener("click", () => {
                        openState[mod.id] = !openState[mod.id];
                        wrap.classList.toggle("mmj-open", openState[mod.id]);
                    });
                }
                wrap.appendChild(head);

                if (expandable) {
                    const box = el("div", "mmj-settings");
                    for (const s of shown) box.appendChild(makeSetting(mod, s));
                    if (mod.menuHint) {
                        const hint = el("div", "mmj-hint");
                        hint.textContent = mod.menuHint;
                        box.appendChild(hint);
                    }
                    wrap.appendChild(box);
                }
                panel.appendChild(wrap);
            }
        }

        // Re-render whenever the mod set or any setting changes.
        MooMoo.onModsChanged(() => { if (panel) render(); });

        // The menu markup may not exist at document-start; wait for it.
        if (!inject()) {
            try {
                const obs = new win.MutationObserver(() => { if (inject()) obs.disconnect(); });
                obs.observe(doc.documentElement || doc, { childList: true, subtree: true });
                // Safety timeout in case observation misses it.
                let tries = 0;
                const iv = win.setInterval(() => { if (inject() || ++tries > 120) win.clearInterval(iv); }, 500);
            } catch (e) { /* ignore */ }
        }

        return { render, inject, showMods, hideMods };
    }

    return { installMenu };
});


/* ===== module: core/notice (loader/src/core/notice.js) ===== */
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
            // Don't put the welcome in front of an automated browser (test harnesses,
            // bots): it would just sit over the menu with nothing to click it away. A
            // real player has navigator.webdriver false. The hard-mismatch refusal is a
            // separate, connection-driven path and still fires.
            try { if (win.navigator && win.navigator.webdriver) return; } catch (e) { /* ignore */ }
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
        let styleInjected = false;
        function ensureStyle() {
            if (!doc || styleInjected) return;
            styleInjected = true;
            const s = doc.createElement("style");
            s.textContent = CSS;   // no id: nothing for a tag#id probe to find
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


/* ===== module: core/antidetect (loader/src/core/antidetect.js) ===== */
/*
 * moomoo.js loader — ANTI-DETECTION  (the detection-packet canceller)
 * ===================================================================
 * FOR USE ON YOUR OWN PRIVATE SERVER / EDUCATIONAL USE ONLY.
 *
 * The ONLY packet the client uses to tell the server about itself is "T", the
 * telemetry answer to the server's integrity probes ("q"): it carries the
 * anti-tamper flags, the untrusted-input count and the probe-match bitmask — the
 * things that would report the loader. There is no way to simply drop it: the
 * server kicks a client that stops answering probes. So instead of letting the
 * client's "T" reach the wire, the loader CANCELS it and sends its OWN in its
 * place — built the exact way the client builds one, with the correct crypto /
 * transport envelope (seal, probe salt, sequence, frame ledger) so the server
 * accepts it, but with the three detection fields always EMPTY.
 *
 * It is observable (so a mod can show what was neutralised) and has a kill switch
 * (turn it off to confirm, on your own server, that detection would otherwise
 * fire). Reached from mods as `MooMooLoader.antiDetect`.
 *
 * Part of the LOADER (the volatile half).
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooAntiDetect = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooAntiDetect = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const LOG_LIMIT = 50;

    function describeWarning(w) {
        if (w.type === "unknown-kind") return "an unknown integrity-probe KIND " + w.kind + " (probe #" + w.index + (w.path ? ", path '" + w.path + "'" : "") + ") the sanitiser has no rule for" + (w.matched ? " — and the client MATCHED it, so loader footprint may be leaking. Add a rule for kind " + w.kind + " in binding.js cleanProbeResult." : " (not matched this round, but add a rule before it is).");
        if (w.type === "residual-footprint") return "a bit the sanitiser should have stripped (kind " + w.kind + ", probe #" + w.index + ") is STILL set in the sent answer — stripping silently failed.";
        if (w.type === "dom-blind") return w.detail || "the telemetry sanitiser cannot see the page.";
        return "an unaccounted-for condition (" + w.type + ").";
    }

    function create(opts) {
        const telemetry = opts && opts.telemetry;
        const subs = new Set();

        const api = {
            // Master switch for the AGGRESSIVE fallback. Default OFF: the loader reconstructs
            // every "T" to report only what the original client would — flags + untrusted masked
            // (pure loader/mod footprint), and the probe result kept but run through
            // `cleanProbeResult` so loader/mod bits are stripped and canary bits (things a real
            // client always has) survive. That is what passes a "canary" probe. Turn it ON only on
            // a server you know sends NO canary probes: it then blanks the probe result entirely,
            // which hides everything but would FAIL a canary and get you caught.
            enabled: false,
            // How many "T" packets have been cancelled + reconstructed.
            count: 0,
            // How many of those actually carried loader/mod footprint we had to neutralise
            // (a masked flag / untrusted count, or a stripped probe bit — NOT a benign canary).
            caughtCount: 0,
            // The most recent client "T": what the client reported, what footprint we stripped,
            // and the probe result actually sent (`sentProbeResult` — the original-client answer).
            last: null,
            // A rolling list of the last LOG_LIMIT entries.
            log: [],

            // ---- self-protection ----
            // Problems the sanitiser could NOT account for on recent "T" rounds: a brand-new
            // integrity-probe kind with no strip rule, a strip that silently failed, or a
            // telemetry global that has gone blind to the page. Each is also console.warn'd
            // once (so it is impossible to miss) and offered to onDetection subscribers (the
            // debug panel renders them). `healthy` is false while the sanitiser is compromised.
            warnings: [],
            warningCount: 0,
            lastWarnings: null,
            healthy: true,
            _warned: null,

            _recordWarnings(list) {
                if (!this._warned) this._warned = {};
                for (const w of list) {
                    const stamped = Object.assign({ at: Date.now() }, w);
                    this.warnings.push(stamped);
                    if (this.warnings.length > LOG_LIMIT) this.warnings.shift();
                    this.warningCount++;
                    const sig = w.type + ":" + (w.kind != null ? w.kind : "") + ":" + (w.index != null ? w.index : "");
                    if (!this._warned[sig]) {
                        this._warned[sig] = true;
                        try { (console.warn || console.log).call(console, "[moomoo.js] anti-cheat SELF-PROTECTION tripped — " + describeWarning(w)); } catch (e) {}
                    }
                }
            },

            setEnabled(on) { this.enabled = !!on; return this.enabled; },

            // Subscribe to every cancelled "T" (entry = what the client would have reported).
            onDetection(fn) {
                if (typeof fn !== "function") return () => {};
                subs.add(fn);
                return () => subs.delete(fn);
            },

            // Called by the loader for every outgoing client "T". Returns the args of the
            // replacement "T" to encode in that frame's slot. The client's own "T" content is
            // discarded — only `ctx` (the crypto/transport envelope) shapes the reconstruction.
            handle(clientArgs, ctx) {
                const seen = telemetry.inspect(clientArgs);
                // The replacement "T" must still carry the right ENVELOPE — the seal and the
                // probe salt the server validates (seq + ledger always come from our own stream).
                // Prefer the loader's own tracked values; only if we somehow haven't got them
                // (e.g. the "q" round wasn't seen) fall back to the ones the client echoed — the
                // client saw the right round, and these are not detection data.
                let env = ctx;
                if (clientArgs && ((ctx.probeSalt == null && clientArgs.length > 4) || (ctx.sealReport == null && clientArgs.length > 3))) {
                    env = Object.assign({}, ctx);
                    if (env.probeSalt == null && clientArgs.length > 4) env.probeSalt = clientArgs[4];
                    if (env.sealReport == null && clientArgs.length > 3) env.sealReport = clientArgs[3];
                }
                // The reconstructed "T" reports ONLY what the original, unmodified client would —
                // never the loader or a mod. `flags` and `untrusted` are pure loader/mod footprint
                // (a clean client always reports 0), so they are always masked: `flags` carries the
                // loader's one irreducible fingerprint, the WebSocket hook the client self-reports
                // as SOCKET_HOOKED / SOCKET_INTEGRITY, and `untrusted` only counts script-dispatched
                // inputs the client refused. The PROBE RESULT is the client's own honest answer, so
                // it is KEPT — but run through `cleanProbeResult`, which clears exactly the bits a
                // probe matched because of the loader/a mod (a hooked function, a swapped
                // constructor, one of our localStorage keys or id'd elements) and leaves every
                // CANARY bit (things a real client genuinely has) in place. What remains is exactly
                // what the original client attempts to send. `enabled` is the old aggressive
                // fallback that blanks the probe result entirely — only safe on a server that sends
                // no canary probes, so it stays opt-in and off by default.
                const clean = telemetry.cleanProbeResult
                    ? telemetry.cleanProbeResult(seen.probeResult, env.probes, env.probeSalt)
                    : seen.probeResult;
                const sentProbe = this.enabled ? 0 : clean;
                const stripped = (seen.probeResult & ~clean) >>> 0;   // probe bits that were the loader's / a mod's
                // Self-protection: detect anything the sanitiser could not account for (a new
                // probe kind, a failed strip, a blinded global). Detection only — `sentProbe` is
                // already fixed above; this never changes what goes out, it just raises the alarm.
                let warnings = [];
                try { if (telemetry.auditProbeResult) warnings = telemetry.auditProbeResult(seen.probeResult, clean, env.probes, env.probeSalt) || []; } catch (e) { warnings = []; }
                this.healthy = !warnings.some((w) => w.type === "dom-blind");
                this.lastWarnings = warnings.length ? warnings : null;
                if (warnings.length) this._recordWarnings(warnings);
                // "caught" = we actually neutralised loader/mod footprint — a masked flag, a refused
                // input, or a stripped probe bit. A canary the client legitimately reports is NOT a
                // catch: it passes straight through, exactly as a real client would send it.
                const caught = !!(seen.flags || seen.untrusted || stripped);
                const entry = {
                    at: Date.now(),
                    flags: seen.flags, flagNames: seen.flagNames,
                    untrusted: seen.untrusted, probeResult: seen.probeResult,
                    sentProbeResult: sentProbe, strippedProbe: stripped,
                    caught, neutralised: this.enabled,
                    warnings: warnings.length ? warnings : null
                };
                this.count++;
                if (caught) this.caughtCount++;
                this.last = entry;
                this.log.push(entry);
                if (this.log.length > LOG_LIMIT) this.log.shift();
                for (const fn of subs) { try { fn(entry); } catch (e) { /* a listener must not break the frame */ } }
                return telemetry.construct(env, { flags: 0, untrusted: 0, probeResult: sentProbe });
            }
        };
        return api;
    }

    return { create };
});


/* ===== module: loader (loader/src/loader.js) ===== */
/*
 * moomoo.js loader — CORE
 * =======================
 * Wires everything together, in the page's own JS context:
 *   - installs the undetectable WebSocket proxy (anticheat.js)
 *   - on the game socket: reads the io-init handshake, derives the session keys
 *     from the page's moomoo-protocol module (exactly like the client), then
 *   - decodes server->client frames and hands them to the runtime as events
 *   - OWNS the client->server stream: re-encodes every frame with its own gap-
 *     free sequence (so mods can inject packets) and scrubs the "T" telemetry
 *     (the anti-cheat bypass safety net)
 *   - exposes window.MooMoo (the stable API) and window.MooMooLoader (diagnostics)
 *
 * Buffering: if a frame arrives before the keys are ready, it is queued and
 * processed in order the moment the session is set up — the game never stalls
 * and the sequence never desyncs. If the protocol module can't be resolved at
 * all, the loader falls back to pure pass-through so the game still works.
 */
(function (root, factory) {
    const deps = (typeof require === "function" && typeof module === "object")
        ? {
            Protocol: require("./net/protocol.js"),
            Msgpack: require("./net/msgpack.js"),
            Binding: require("./net/binding.js"),
            Socket: require("./net/socket.js"),
            Outgoing: require("./net/outgoing.js"),
            Runtime: require("./core/runtime.js"),
            Api: require("./core/api.js"),
            ModsTab: require("./core/modstab.js"),
            Notice: require("./core/notice.js"),
            AntiDetect: require("./core/antidetect.js"),
            GameData: require("../../shared/gamedata.js"),
            Input: require("./game/input.js"),
            Objects: require("./game/objects.js"),
            Combat: require("./game/combat.js"),
            Store: require("./game/store.js"),
            Render: require("./game/render.js"),
            Pathfind: require("./game/pathfind.js")
        }
        : null;
    const value = factory(deps);
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooLoaderCore = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooLoaderCore = value;
})(typeof self !== "undefined" ? self : this, function (nodeDeps) {
    "use strict";

    const VERSION = "1.3.3";

    // The event a mod dispatches to fetch the API ({ detail: { resolve(MooMoo, MooMooLoader) } }),
    // and the signal the loader fires once that handshake is live so a mod that loaded first can
    // retry. Neither the event name nor the listener is visible to any integrity-probe kind, so
    // the API leaves no window footprint. (See loader/build.mjs for the matching dedup.)
    const RENDEZVOUS = "moomoo.js:api";
    const READY = "moomoo.js:ready";

    // Resolve dependencies either from Node require (tests), an explicit namespace
    // passed by the bundle (opts.deps — the private object every module attaches to,
    // so nothing lands on window), or, as a fallback, page globals.
    function resolveDeps(win, opts) {
        if (nodeDeps) return nodeDeps;
        const g = (opts && opts.deps) || win || (typeof globalThis !== "undefined" ? globalThis : {});
        return {
            Protocol: g.MooMooProtocol,
            Msgpack: g.MooMooMsgpack,
            Binding: g.MooMooBinding,
            Socket: g.MooMooSocket,
            Outgoing: g.MooMooOutgoing,
            Runtime: g.MooMooRuntime,
            Api: g.MooMooApi,
            ModsTab: g.MooMooModsTab,
            Notice: g.MooMooNotice,
            AntiDetect: g.MooMooAntiDetect,
            GameData: g.MooMooGameData,
            Input: g.MooMooInput,
            Objects: g.MooMooObjects,
            Combat: g.MooMooCombat,
            Store: g.MooMooStore,
            Render: g.MooMooRender,
            Pathfind: g.MooMooPathfind
        };
    }

    // Default: resolve the per-deploy module the same way the client does.
    function defaultResolveProtocol(win) {
        const doc = win.document;
        // 1) bare specifier through the page's import map
        const tryBare = () => win.eval
            ? win.eval('import("moomoo-protocol")')
            : import(/* webpackIgnore: true */ "moomoo-protocol");
        // 2) read the import map ourselves and import the resolved URL
        const tryMap = () => {
            try {
                const tags = doc.querySelectorAll('script[type="importmap"]');
                for (const tag of tags) {
                    const map = JSON.parse(tag.textContent || "{}");
                    const spec = map && map.imports && map.imports["moomoo-protocol"];
                    if (spec) {
                        const url = new URL(spec, doc.baseURI).href;
                        return win.eval ? win.eval('import("' + url + '")') : import(/* webpackIgnore: true */ url);
                    }
                }
            } catch (e) { /* fall through */ }
            return Promise.reject(new Error("moomoo-protocol not in any import map"));
        };
        return Promise.resolve().then(tryBare).catch(tryMap);
    }

    // Read one bare specifier out of the page's import map (e.g. "moomoo-seal").
    function readImportMapSpec(win, name) {
        try {
            const doc = win.document;
            const tags = doc.querySelectorAll('script[type="importmap"]');
            for (const tag of tags) {
                const map = JSON.parse(tag.textContent || "{}");
                const spec = map && map.imports && map.imports[name];
                if (spec) return spec;
            }
        } catch (e) { /* ignore */ }
        return null;
    }

    // The client bundle the page is running: /assets/index-<stem>.js (the server hashes the
    // exact bytes it serves there to build the seal, so fetching the same URL reproduces it).
    function findClientBundleUrl(win) {
        try {
            const doc = win.document;
            const scripts = doc.querySelectorAll('script[type="module"][src]');
            for (const s of scripts) {
                if (/\/assets\/index-[\w-]+\.js(\?|$)/.test(s.getAttribute("src") || "")) {
                    return new URL(s.src, doc.baseURI).href;
                }
            }
        } catch (e) { /* ignore */ }
        return null;
    }

    // The code seal for this page: sealBytes (the "moomoo-seal" import's hex file name) XOR
    // SHA-256(bundle)[0..16]. Independent of the connection, so it is computed once and cached.
    // Resolves to a 16-byte Uint8Array, or null when it can't be built (then a bind-mode
    // connection falls back to pure pass-through — the game still works, mods just can't inject).
    function computeSeal(win, Protocol) {
        const sealSpec = readImportMapSpec(win, "moomoo-seal");
        const bundleUrl = findClientBundleUrl(win);
        if (!sealSpec || !bundleUrl || !win.fetch) return Promise.resolve(null);
        const m = /([0-9a-fA-F]{32})/.exec(sealSpec);   // /p/<32 hex>.js -> 16 seal bytes
        if (!m) return Promise.resolve(null);
        const sealBytes = Protocol.hexToBytes(m[1]);
        return win.fetch(bundleUrl, { credentials: "same-origin", cache: "no-cache" })
            .then((r) => r.arrayBuffer())
            .then((buf) => {
                const digest = Protocol.sha256(new Uint8Array(buf)).subarray(0, 16);
                return Protocol.sealValue(sealBytes, digest);
            })
            .catch(() => null);
    }

    function toBytes(data) {
        if (data instanceof Uint8Array) return data;
        if (data instanceof ArrayBuffer) return new Uint8Array(data);
        if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView && ArrayBuffer.isView(data)) {
            return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        }
        // Duck-type an ArrayBuffer (covers cross-realm buffers: a typed-array
        // ctor accepts any real ArrayBuffer regardless of which realm it came
        // from, even though `instanceof` is realm-specific).
        const tag = Object.prototype.toString.call(data);
        if (tag === "[object ArrayBuffer]") return new Uint8Array(data);
        if (data && data.buffer && Object.prototype.toString.call(data.buffer) === "[object ArrayBuffer]") {
            return new Uint8Array(data.buffer, data.byteOffset || 0, data.byteLength);
        }
        return null; // strings / Blobs -> not our binary protocol
    }

    function createLoader(win, options) {
        const opts = options || {};
        const D = resolveDeps(win, opts);
        if (!D.Protocol || !D.Binding || !D.Runtime || !D.Socket) {
            throw new Error("moomoo.js loader: missing dependencies (bundle not assembled?)");
        }
        // Protocol resolution precedence: explicit option > page-provided hook
        // (window.__moomooResolveProtocol, handy if the server doesn't name the
        // import-map module "moomoo-protocol") > default import-map lookup.
        const resolveProtocol = opts.resolveProtocol
            || (typeof win.__moomooResolveProtocol === "function" ? win.__moomooResolveProtocol : null)
            || (() => defaultResolveProtocol(win));
        const binding = D.Binding;
        const telemetry = binding.telemetry;
        // Cancels the client's "T" detection packet and sends an empty one in its place
        // (see core/antidetect.js). Exposed on MooMooLoader.antiDetect.
        const antiDetect = D.AntiDetect
            ? D.AntiDetect.create({ telemetry })
            : { enabled: true, handle: (args, ctx) => telemetry.scrub(args, ctx) };

        const diag = { version: VERSION, buildId: null, resolvedProtocol: false, sockets: 0, failedProtocol: false };
        const rawTaps = new Set();      // fn(dir, name, args)
        const errorSink = (e) => { try { console.error("%c[moomoo.js]", "color:#e66", "loader error:", e); } catch (_) {} };

        let modPromise = null;
        function getProtocolModule() {
            if (modPromise) return modPromise;
            modPromise = Promise.resolve().then(resolveProtocol).then((mod) => {
                diag.resolvedProtocol = true;
                diag.buildId = mod && mod.BUILD_ID || null;
                return mod;
            });
            // Do not cache a rejection: allow a later attempt to retry.
            modPromise.catch(() => { modPromise = null; });
            return modPromise;
        }

        // The code seal (sealBytes ^ SHA-256(bundle)[0..16]) for this page. The import map and
        // the bundle <script> may not be in the DOM yet when the loader installs at
        // document-start, so a first attempt can come back null; we cache only a SUCCESS and
        // let any other call retry once the page has finished parsing.
        let sealValueCache = null;
        let sealInFlight = null;
        function getSeal() {
            if (sealValueCache) return Promise.resolve(sealValueCache);
            if (sealInFlight) return sealInFlight;
            sealInFlight = computeSeal(win, D.Protocol).then((seal) => {
                sealInFlight = null;
                if (seal) { sealValueCache = seal; diag.sealReady = true; }
                return seal;
            });
            sealInFlight.catch(() => { sealInFlight = null; });
            return sealInFlight;
        }
        // getSeal() with a few short retries, for bind mode where we must have it.
        function getSealReady(tries) {
            return getSeal().then((seal) => {
                if (seal || tries <= 0) return seal;
                return new Promise((r) => setTimeout(r, 150)).then(() => getSealReady(tries - 1));
            });
        }

        let active = null; // the adopted game socket's state

        // Rate governor + packet accounting + ping (see outgoing.js).
        const out = D.Outgoing ? D.Outgoing.createOutgoing({ rateLimits: binding.rateLimits }) : null;

        // ---- runtime + sink ----
        // Self input mirror: the combat engine needs the player's own current move
        // direction (the bundle's `Dn`) and aim to predict self position. We capture
        // them as they are sent so the engine reads the same values the client has.
        const selfInput = { moveDir: null, aimDir: 0 };
        const sink = {
            sendAction(action, payload) {
                const bind = binding.outgoing[action];
                if (!bind) { console.warn("%c[moomoo.js]", "color:#e66", "unknown action: " + action); return false; }
                if (action === "move") selfInput.moveDir = (payload && payload.dir === undefined) ? null : (payload ? payload.dir : null);
                else if (action === "stopMove") selfInput.moveDir = null;
                else if (action === "aim" && payload && typeof payload.dir === "number") selfInput.aimDir = payload.dir;
                return sendWire(active, bind.wire, bind.build(payload || {}));
            },
            sendRaw(wire, args) { return sendWire(active, wire, args || []); }
        };
        const MooMoo = D.Runtime.createRuntime({
            version: VERSION,
            sink,
            loaderInfo: diag
        });

        // ---- compatibility watchdog + on-join notice (needs a real DOM) ----
        // Watches the live connection against what this loader was built to speak
        // (binding.contract) and shows the appropriate MooMoo-style popup: a quick
        // "thanks for using it" on a clean join, a warning when something looks off, or a
        // hard "loader out of date" refusal (which drops the socket) when it is certain the
        // loader can no longer keep up. Headless test runs have no document, so it stays null.
        let notice = null;
        if (D.Notice && win.document) {
            try {
                notice = D.Notice.create({
                    win,
                    version: VERSION,
                    diag,
                    contract: binding.contract,
                    // Hard mismatch -> cut the connection so the player can't get flagged/banned.
                    onRefuse: () => { try { if (active && active.ws) active.ws.close(4999, "moomoo.js loader out of date"); } catch (e) { /* ignore */ } }
                });
                // Show the welcome card on the MAIN MENU (a loading/welcome screen), not in-game.
                notice.watchMenu();
            } catch (e) { errorSink(e); notice = null; }
        }

        // ---- game-specific extensions: input, combat/game helpers, config menu ----
        // Input needs the DOM; in headless tests there's none, so it stays null and
        // helpers degrade gracefully (aim-at-mouse etc. just no-op).
        let input = null;
        if (win.document && D.Input) {
            try { input = D.Input.installInput(win); } catch (e) { errorSink(e); }
        }
        // The world object manager tracks buildings/resources from the wire; the
        // combat features read it. Build it before helpers so they can expose it.
        let objects = null;
        if (D.Objects && D.GameData) {
            try { objects = D.Objects.createObjectManager({ MooMoo, data: D.GameData }); }
            catch (e) { errorSink(e); }
        }
        // Owned / equipped hats + accessories (the bundle's Nn/On/$t/Zt + equip()).
        let store = null;
        if (D.Store && D.GameData) {
            try { store = D.Store.createStore({ MooMoo, data: D.GameData }); }
            catch (e) { errorSink(e); }
        }
        // The combat engine reconstructs per-player prediction/reload/bull state on
        // every server tick (the bundle's updatePlayers). Features read it as ctx.combat.
        let combat = null;
        if (D.Combat && D.GameData) {
            try { combat = D.Combat.createCombat({ MooMoo, data: D.GameData, objects, input, selfInput, net: out }); }
            catch (e) { errorSink(e); }
        }
        // Overlay canvases + a replica of the stock camera/interpolation, so mods
        // can draw in line with the official (WebGL) picture or replace it.
        let render = null;
        if (D.Render) {
            try { render = D.Render.createRender({ win, MooMoo, config: combat ? combat.K : null, onError: errorSink }); }
            catch (e) { errorSink(e); }
        }
        // A* pathfinder (worker pool), exposed as ctx.path.
        let pathfinder = null;
        if (D.Pathfind) {
            try { pathfinder = D.Pathfind.createPathfinder({ win }); }
            catch (e) { errorSink(e); }
        }
        // Inject the combat/placement/targeting verbs into every mod's ctx.
        if (D.Api && D.GameData) {
            try {
                const ext = D.Api.createHelpers({ MooMoo, input, data: D.GameData, objects, combat, net: out, store, render, pathfinder });
                MooMoo._setCtxExtensions(ext);
            } catch (e) { errorSink(e); }
        }

        function tapRaw(dir, name, args) {
            if (!rawTaps.size) return;
            for (const fn of rawTaps) { try { fn(dir, name, args); } catch (e) { /* ignore */ } }
        }

        // ---- outgoing (client -> server), loader-owned ----
        // Every frame that actually leaves: count it (governor stats, ping timing)
        // and tell mods (MooMoo.onSent).
        function noteSent(wire, args, source) {
            if (out) {
                out.record(wire);
                if (wire === "0") out.onPingSent();
            }
            const pb = binding.outgoingParse && binding.outgoingParse[wire];
            if (pb && MooMoo._notifySent) {
                let payload; try { payload = pb.parse(args || []); } catch (e) { payload = { args }; }
                MooMoo._notifySent(pb.action, payload, source);
            }
        }

        // ANTI-NO-OP GUARD (private-server stealth).
        // The server silently ignores — no strike, no effect — any packet that
        // doesn't fit the current game state: selecting an item or weapon you
        // don't own, equipping a hat/accessory you don't own, or acting while
        // dead (server/src/network/packets.js). The official client never emits
        // those, so one on the wire is a fingerprint even though it costs no
        // strike. We refuse to put one there from ANY mod, mirroring the server's
        // own accept conditions against the loader's mirrored state (MooMoo.self /
        // store / game data). Conservative: it only drops when that state is
        // authoritative; on anything it cannot verify it lets the frame through,
        // so it never turns a would-be-valid action into a dropped one.
        function wouldNoOp(wire, args) {
            const me = MooMoo.self;
            if (!me) return false;
            switch (wire) {
                case "z": {                            // selectItem [index, isWeapon]
                    if (!me.alive) return true;        // ignored while dead
                    const index = args[0];
                    if (typeof index !== "number") return false;   // malformed: let the server judge it
                    if (args[1]) {                     // a weapon: must be the one held in its slot
                        const w = D.GameData.weapon(index);
                        if (!w) return true;
                        return !(Array.isArray(me.weapons) && me.weapons[w.type] === index);
                    }
                    if (!D.GameData.item(index)) return true;      // not a real item id
                    return !(Array.isArray(me.items) && me.items.indexOf(index) >= 0);  // not owned
                }
                case "F":                              // mouse (attack / place / eat)
                case "9":                              // move
                case "D":                              // aim
                case "e":                              // reset move
                    return !me.alive;                  // every one is a no-op while dead
                case "c": {                            // store [action (0=equip, 1=buy), id, isTail]
                    if (!me.alive) return true;
                    const action = args[0], id = args[1], isTail = !!args[2];
                    if (typeof id !== "number") return false;
                    if (action === 0 && id === 0) return false;    // equip 0 = take off, always valid
                    if (!store) return false;                      // no store mirror -> don't guess
                    const owns = isTail ? store.ownsTail : store.ownsHat;
                    if (!owns) return false;
                    if (action === 0) return !owns(id);            // equip: must own it
                    if (action === 1) return owns(id);             // buy: already owned = a no-op
                    return false;
                }
                default:
                    return false;
            }
        }

        function sendWire(st, wire, args) {
            if (!st || st.ignore) { console.warn("%c[moomoo.js]", "color:#e66", "no active game socket to send on"); return false; }
            if (st.ready) {
                if (wouldNoOp(wire, args)) return false;               // the server would silently ignore it (stealth)
                if (out && !out.allow(wire)) return false;             // would overflow a server bucket
                const bytes = st.session.encodeC2S(wire, args);
                tapRaw("out", wire, args);
                st.nativeSend(bytes);
                noteSent(wire, args, "mod");
                return true;
            }
            if (st.failed) { console.warn("%c[moomoo.js]", "color:#e66", "cannot inject packets without the protocol key"); return false; }
            st.outQueue.push({ kind: "inject", wire, args });
            return true;
        }

        // Transform applied to every frame the client tries to send.
        function makeSendTransform(st) {
            return function (data /*, nativeSend */) {
                if (st.ignore || !st.handshaked) return data;       // not the game socket yet -> pass through
                if (st.failed) return data;                          // no keys -> pass through
                if (!st.ready) { st.outQueue.push({ kind: "client", data: toBytes(data) || data }); return undefined; }
                return reencodeClientFrame(st, toBytes(data) || data);
            };
        }

        // The context the telemetry scrub needs: the seal report + latest probe salt, and —
        // on a pinned connection — our re-encoded stream's current seq and running ledger, read
        // LIVE right before the "T" is encoded (so they are the values as they stand just before
        // the T body, which is exactly what the server compares against).
        function telemetryCtx(st) {
            const ctx = { sealReport: st.session && st.session.sealReport, probeSalt: st.lastProbeSalt, probes: st.lastProbes };
            if (st.session && st.session.pinned) { ctx.seq = st.session.lastSeq; ctx.ledger = st.session.ledger; }
            return ctx;
        }

        // Returns the bytes to send, or undefined to drop the frame entirely. A
        // dropped frame never consumes a sequence number, so the stream stays
        // gap-free.
        function reencodeClientFrame(st, bytes) {
            let dec;
            try { dec = st.session.decodeC2S(bytes); }
            catch (e) { errorSink(e); return bytes; } // fail open
            try {
                let name = dec.name, args = dec.args;
                if (name === telemetry.wire) {
                    // Compat: the real client (unmodified, the server's own build) just told us
                    // how many "T" fields this server expects. If that outgrows what we build,
                    // the loader is out of date and would be flagged — the watchdog escalates.
                    if (notice) notice.recordClientTelemetry(Array.isArray(args) ? args.length : 0);
                    // ANTI-CHEAT BYPASS: cancel the client's "T" and send an empty one we build
                    // ourselves (clean detection fields + our own seq/ledger). The client's "T"
                    // content never reaches the wire.
                    args = antiDetect.handle(args, telemetryCtx(st));
                }
                // Let mods inspect / rewrite / drop what the official client sends.
                const pb = binding.outgoingParse && binding.outgoingParse[name];
                if (pb && MooMoo._filterOutgoing && name !== telemetry.wire) {
                    const payload = pb.parse(args);
                    const res = MooMoo._filterOutgoing(pb.action, payload, { source: "client", wire: name, args: args.slice() });
                    if (res === null) return undefined;                    // a mod dropped it
                    if (res !== payload) {
                        const ob = binding.outgoing[pb.action];
                        if (ob) args = ob.build(res);
                    }
                }
                if (out && !out.allow(name)) return undefined;          // would overflow a server bucket
                tapRaw("out", name, args);
                const enc = st.session.encodeC2S(name, args);          // our own gap-free seq
                noteSent(name, args, "client");
                return enc;
            } catch (e) {
                errorSink(e);
                return st.session.encodeC2S(dec.name, dec.name === telemetry.wire ? telemetry.scrub(dec.args, telemetryCtx(st)) : dec.args);
            }
        }

        // ---- incoming (server -> client), read-only observer ----
        function handleIncoming(st, rawData) {
            if (st.ignore) return;
            const bytes = toBytes(rawData);
            if (!bytes) { if (!st.handshaked) st.ignore = true; return; }

            if (!st.handshaked) {
                const hs = D.Protocol.isHandshake(bytes);
                if (!hs) { st.ignore = true; return; }                 // some other socket
                st.handshaked = true;
                adopt(st, hs[1]);
                return;
            }
            if (!st.ready) { st.inQueue.push(bytes.slice()); return; }  // keys not ready yet -> buffer
            processS2C(st, bytes);
        }

        function processS2C(st, bytes) {
            let dec;
            try { dec = st.session.decodeS2C(bytes); }
            catch (e) { errorSink(e); if (notice) notice.recordS2CError(); return; }
            // Compat: feed the decoded packet (name null = an id with no name in our table).
            if (notice) notice.recordS2C(dec.name, dec.id);
            // Remember the latest integrity-probe salt so the telemetry answer can echo it
            // even if the client's own "T" ever arrives without it.
            if (dec.name === "q" && Array.isArray(dec.args)) { st.lastProbeSalt = dec.args[0]; st.lastProbes = dec.args[1]; }
            const bind = binding.incoming[dec.name];
            tapRaw("in", dec.name, dec.args);
            if (!bind) return; // unknown packet: still visible via raw tap
            let payload;
            try { payload = bind.parse(dec.args); }
            catch (e) { errorSink(e); return; }
            if (bind.event === "pong" && out) {
                const ms = out.onPong();
                if (ms != null) payload.ms = ms;
            }
            MooMoo._dispatch(bind.event, payload);
        }

        // Called when a socket's first frame is an io-init: set up the session.
        function adopt(st, payload) {
            active = st;
            // Compat: the io-init handshake shape (field count) is the first thing we can check.
            if (notice) notice.recordIoInit(Array.isArray(payload) ? payload.length : 0);
            if (MooMoo._reset) MooMoo._reset();
            if (out) out.reset();
            if (store) store.reset();
            if (objects && objects.newConnection) objects.newConnection();   // new socket = fresh world (objects survive death, not reconnect)
            // Field 6 of io-init: the seal mode. Bind mode folds the seal into the session
            // key, so we must have it before encoding a single frame; otherwise pass through.
            const sealMode = (payload && payload[5]) | 0;
            const needSeal = sealMode === D.Protocol.SEAL_BIND || sealMode === D.Protocol.SEAL_REPORT;
            Promise.all([getProtocolModule(), needSeal ? getSealReady(6) : Promise.resolve(null)]).then(([mod, seal]) => {
                if (sealMode === D.Protocol.SEAL_BIND && !seal) {
                    errorSink(new Error("loader: bundle seal unavailable; cannot own this connection, passing through"));
                    becomeFailed(st);
                    return;
                }
                try {
                    st.session = new D.Protocol.ClientSession(payload, mod, { seal });
                } catch (e) {
                    errorSink(e);
                    becomeFailed(st);
                    return;
                }
                st.ready = true;
                // Drain buffered incoming frames in order (advances the s2c counter correctly).
                const inq = st.inQueue; st.inQueue = [];
                for (const f of inq) processS2C(st, f);
                // Drain buffered outgoing (client frames + injected) in call order.
                const outq = st.outQueue; st.outQueue = [];
                for (const item of outq) {
                    if (item.kind === "client") { const b = reencodeClientFrame(st, item.data); if (b !== undefined) st.nativeSend(b); }
                    else {
                        try {
                            if (out && !out.allow(item.wire)) continue;
                            st.nativeSend(st.session.encodeC2S(item.wire, item.args)); tapRaw("out", item.wire, item.args);
                            noteSent(item.wire, item.args, "mod");
                        } catch (e) { errorSink(e); }
                    }
                }
                MooMoo._setReady(true);
                try { win.dispatchEvent(new win.Event("moomoo:ready")); } catch (e) { /* non-DOM env */ }
            }).catch((e) => {
                errorSink(e);
                becomeFailed(st);
            });
        }

        // Protocol module unavailable: give up owning the stream, keep the game alive.
        function becomeFailed(st) {
            diag.failedProtocol = true;
            st.failed = true;
            // Flush any buffered client frames as ORIGINAL bytes (keeps client seq intact).
            const outq = st.outQueue; st.outQueue = [];
            for (const item of outq) if (item.kind === "client") st.nativeSend(item.data);
            // Injected packets can't be sent without the key; drop them.
            console.warn("%c[moomoo.js]", "color:#e66", "protocol module unavailable; mods are read-disabled on this connection");
        }

        // ---- socket adoption plumbing ----
        function onSocket(ws) {
            diag.sockets++;
            const st = {
                ws, handshaked: false, ready: false, failed: false, ignore: false,
                session: null, inQueue: [], outQueue: [],
                nativeSend: (d) => sock.nativeSend(ws, d)
            };
            // passive read hook
            try { ws.addEventListener("message", (ev) => handleIncoming(st, ev.data)); }
            catch (e) { errorSink(e); }
            // active send hook — the transform is kept in a WeakMap keyed by the socket,
            // never written to the socket object.
            sock.setTransform(ws, makeSendTransform(st));
        }

        const sock = D.Socket.installWebSocketProxy(win, onSocket, errorSink);
        const native = sock.native;

        // ---- diagnostics surface ----
        const MooMooLoader = {
            version: VERSION,
            native,
            diag,
            onRaw(fn) { rawTaps.add(fn); return () => rawTaps.delete(fn); },
            sendRaw: (wire, args) => sink.sendRaw(wire, args),
            active: () => active && { ready: active.ready, failed: active.failed, buildId: diag.buildId }
        };

        // NO window global. The loader hands its API to mods through an event handshake,
        // so there is no MooMoo* property for the server's integrity scan to find — not by
        // enumeration (getOwnPropertyNames / Object.keys / Reflect.ownKeys), not by the `in`
        // operator, not by direct access. A mod dispatches the RENDEZVOUS event with a
        // resolve callback; we hand it (MooMoo, MooMooLoader) synchronously. The event name
        // and the listener are invisible to every integrity-probe kind. (Internal modules stay
        // reachable for diagnostics/tests under MooMooLoader._deps.)
        try { Object.defineProperty(MooMooLoader, "_deps", { value: D, enumerable: false, configurable: true }); } catch (e) { /* ignore */ }
        try {
            win.addEventListener(RENDEZVOUS, function (e) {
                try { const d = e && e.detail; if (d && typeof d.resolve === "function") d.resolve(MooMoo, MooMooLoader); } catch (_) {}
            }, false);
        } catch (e) { errorSink(e); }

        MooMooLoader.config = MooMoo._config;   // hidden config store for mods (no localStorage key of their own)
        MooMooLoader.antiDetect = antiDetect;   // the detection-packet canceller (toggle + log)
        MooMooLoader.input = input;
        MooMooLoader.gameData = D.GameData || null;
        MooMooLoader.objects = objects;
        MooMooLoader.net = out;
        // Live crypto / transport envelope of the adopted socket, read-only — for debug panels
        // (the seal the server bound us to, the running frame sequence + ledger hash, seal mode).
        MooMooLoader.transport = () => {
            const s = active && active.session;
            return s ? { pinned: !!s.pinned, sealMode: s.sealMode | 0, seal: s.sealReport, seq: s.lastSeq, ledger: s.ledger >>> 0, probeSalt: active.lastProbeSalt } : null;
        };
        // For advanced mods that open their OWN connections (e.g. multi-box bots that speak the
        // protocol themselves): the page's code seal (raw bytes, for bind mode), the resolved
        // per-deploy protocol module (ClientSession etc. live on _deps.Protocol), and the adopted
        // game socket's endpoint. These are the page's own public bundle facts — reached through
        // the event handshake like the rest of the API, so they add no window global and no probe
        // footprint. The mod opens native (MooMooLoader.native) sockets so the loader's own
        // re-encode transform never touches the bots' frames.
        MooMooLoader.seal = () => getSeal();
        MooMooLoader.protocolModule = () => getProtocolModule();
        MooMooLoader.endpoint = () => {
            try {
                const u = active && active.ws && active.ws.url;
                if (!u) return null;
                const url = new URL(u);
                const m = /\/s\/([^/?]+)/.exec(url.pathname) || [];
                return {
                    host: url.host, secure: url.protocol === "wss:", serverKey: m[1] || "",
                    buildId: url.searchParams.get("b") || diag.buildId || null,
                    stem: url.searchParams.get("u") || ""
                };
            } catch (e) { return null; }
        };
        MooMooLoader.store = store;
        MooMooLoader.combat = combat;
        MooMooLoader.render = render;

        // In-game Mods menu (only in a real page; skipped in headless tests).
        if (D.ModsTab && win.document) {
            try { MooMooLoader.menu = D.ModsTab.installMenu(win, MooMoo); }
            catch (e) { errorSink(e); }
        }
        // Warm up the protocol module + the bundle seal so the first connection is instant.
        try { getProtocolModule().catch(() => {}); } catch (e) { /* ignore */ }
        try { getSeal().catch(() => {}); } catch (e) { /* ignore */ }

        // Tell any mod that loaded before us that the handshake is open now.
        try { win.dispatchEvent(new win.Event(READY)); } catch (e) { /* non-DOM env */ }

        return { MooMoo, MooMooLoader };
    }

    return { createLoader, VERSION };
});

  }).call(__ns, __ns, __ns, undefined, undefined, undefined);
  try {
    __ns.MooMooLoaderCore.createLoader(window, { deps: __ns });
    console.log("%c[moomoo.js]", "color:#7cc;font-weight:bold", "loader 1.3.3 installed");
  } catch (e) {
    console.error("%c[moomoo.js]", "color:#e66", "loader failed to install:", e);
  }
}
  // The loader MUST run in the page's own realm: that's the only place where
  // window.WebSocket is the constructor the game client actually uses (and is
  // writable). With "@inject-into page" + "@grant none" the body already runs
  // there, so we just call core(). In a userscript sandbox we inject the code
  // as a page <script> instead. We never fall back to running core() in the
  // sandbox realm — the WebSocket there isn't the game's, and replacing it
  // throws "read-only property".
  var inPage;
  try { inPage = (typeof unsafeWindow === "undefined") || (window === unsafeWindow); }
  catch (e) { inPage = true; }
  if (inPage) { core(); return; }

  var src = "(" + core.toString() + ")();";
  // 1) inline page <script> — synchronous, wins the document-start race.
  try {
    var s = document.createElement("script");
    s.textContent = src;
    (document.head || document.documentElement).appendChild(s);
    s.remove();
    return;
  } catch (e) { /* CSP blocked inline scripts; try a blob url */ }
  // 2) blob url <script> — clears many inline-script CSPs (loads async, so it
  //    may lose the timing race, but that beats not loading at all).
  try {
    var url = URL.createObjectURL(new Blob([src], { type: "text/javascript" }));
    var b = document.createElement("script");
    b.src = url;
    b.onload = b.onerror = function () { try { b.remove(); URL.revokeObjectURL(url); } catch (e) {} };
    (document.head || document.documentElement).appendChild(b);
    return;
  } catch (e) { /* blob blocked too */ }
  // 3) can't reach the page realm at all.
  try {
    console.error("%c[moomoo.js]", "color:#e66",
      "couldn't inject into the page (CSP). Set the script to run in page context: " +
      "Violentmonkey → @inject-into page, Tampermonkey → @grant none. " +
      "It can't run in the sandbox because the game's WebSocket isn't reachable there.");
  } catch (e) {}
})();

