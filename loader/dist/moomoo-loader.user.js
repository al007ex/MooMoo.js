// ==UserScript==
// @name         moomoo.js Loader
// @namespace    moomoo.js
// @version      1.0.0
// @description  moomoo.js mod loader — hooks the game socket and exposes window.MooMoo for mods. Update this file when the server's packets change.
// @author       you
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
//
// EDIT @match to your private server's origin, e.g.  // @match https://play.myserver.io/*
// Host this file somewhere your plugins can @require it (or paste it as its own
// userscript). See extension/README.md.

(function bootstrap(){
  function core(){
  "use strict";
  if (window.__MOOMOO_LOADER__) return;   // a plugin may @require us more than once
  window.__MOOMOO_LOADER__ = "1.0.0";
/* ===== module: vocabulary (shared/vocabulary.js) ===== */
/*
 * moomoo.js — PACKET VOCABULARY  (the stable contract)
 * ====================================================
 * This file is the "language" half of the extension: it names every semantic
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
     *   on <event>(<params...>) { ... }        // moomoo.js language
     *   MooMoo.on("<event>", handler)           // hand-written JS
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
        stats: { summary: "Live stats card for a watched player.", normalized: false, params: [p("args", "array", "raw arguments")] }
    };

    /*
     * OUTGOING packets (client -> server). Mods trigger these with
     *   send <action>(<params...>)              // moomoo.js language
     *   MooMoo.send.<action>(<params...>)        // hand-written JS
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
        admin: { summary: "Admin command (requires admin role).", params: [p("args", "array", "raw admin arguments")], advanced: true }
    };

    return {
        version: 1,
        events: EVENTS,
        actions: ACTIONS,
        // Convenience lists used by the compiler + website palette.
        eventNames: Object.keys(EVENTS).filter((k) => !EVENTS[k].hidden),
        actionNames: Object.keys(ACTIONS),
        isEvent: (name) => Object.prototype.hasOwnProperty.call(EVENTS, name) && !EVENTS[name].hidden,
        isAction: (name) => Object.prototype.hasOwnProperty.call(ACTIONS, name)
    };
});


/* ===== module: gamedata (shared/gamedata.js) ===== */
/*
 * moomoo.js — GAME DATA  (weapons, items, projectiles, hats, accessories)
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
        { indx: 1, layer: 1, dmg: 25, scale: 20 },
        { indx: 0, layer: 0, src: "arrow_1", dmg: 35, speed: 2.5, scale: 103, range: 1200 },
        { indx: 0, layer: 0, src: "arrow_1", dmg: 30, speed: 2, scale: 103, range: 1200 },
        { indx: 1, layer: 1, dmg: 16, scale: 20 },
        { indx: 0, layer: 0, src: "bullet_1", dmg: 50, speed: 3.6, scale: 160, range: 1400 }
    ];

    // ---- weapons (id = index; type 0 = primary/melee, type 1 = secondary) ----
    // `speed` is the swing/reload time in ms. `spdMult` is the movement multiplier.
    const weapons = [
        { id: 0, type: 0, name: "tool hammer", desc: "tool for gathering all resources", src: "hammer_1", length: 140, width: 140, xOff: -3, yOff: 18, dmg: 25, range: 65, gather: 1, speed: 300 },
        { id: 1, type: 0, age: 2, name: "hand axe", desc: "gathers resources at a higher rate", src: "axe_1", length: 140, width: 140, xOff: 3, yOff: 24, dmg: 30, spdMult: 1, range: 70, gather: 2, speed: 400 },
        { id: 2, type: 0, age: 8, pre: 1, name: "great axe", desc: "deal more damage and gather more resources", src: "great_axe_1", length: 140, width: 140, xOff: -8, yOff: 25, dmg: 35, spdMult: 1, range: 75, gather: 4, speed: 400 },
        { id: 3, type: 0, age: 2, name: "short sword", desc: "increased attack power but slower move speed", src: "sword_1", iPad: 1.3, length: 130, width: 210, xOff: -8, yOff: 46, dmg: 35, spdMult: 0.85, range: 110, gather: 1, speed: 300 },
        { id: 4, type: 0, age: 8, pre: 3, name: "katana", desc: "greater range and damage", src: "samurai_1", iPad: 1.3, length: 130, width: 210, xOff: -8, yOff: 59, dmg: 40, spdMult: 0.8, range: 118, gather: 1, speed: 300 },
        { id: 5, type: 0, age: 2, name: "polearm", desc: "long range melee weapon", src: "spear_1", iPad: 1.3, length: 130, width: 210, xOff: -8, yOff: 53, dmg: 45, knock: 0.2, spdMult: 0.82, range: 142, gather: 1, speed: 700 },
        { id: 6, type: 0, age: 2, name: "bat", desc: "fast long range melee weapon", src: "bat_1", iPad: 1.3, length: 110, width: 180, xOff: -8, yOff: 53, dmg: 20, knock: 0.7, range: 110, gather: 1, speed: 300 },
        { id: 7, type: 0, age: 2, name: "daggers", desc: "really fast short range weapon", src: "dagger_1", iPad: 0.8, length: 110, width: 110, xOff: 18, yOff: 0, dmg: 20, knock: 0.1, range: 65, gather: 1, hitSlow: 0.1, spdMult: 1.13, speed: 100 },
        { id: 8, type: 0, age: 2, name: "stick", desc: "great for gathering but very weak", src: "stick_1", length: 140, width: 140, xOff: 3, yOff: 24, dmg: 1, spdMult: 1, range: 70, gather: 7, speed: 400 },
        { id: 9, type: 1, age: 6, name: "hunting bow", desc: "bow used for ranged combat and hunting", src: "bow_1", req: ["wood", 4], length: 120, width: 120, xOff: -6, yOff: 0, projectile: 0, spdMult: 0.75, speed: 600 },
        { id: 10, type: 1, age: 6, name: "great hammer", desc: "hammer used for destroying structures", src: "great_hammer_1", length: 140, width: 140, xOff: -9, yOff: 25, dmg: 10, spdMult: 0.88, range: 75, sDmg: 7.5, gather: 1, speed: 400 },
        { id: 11, type: 1, age: 6, name: "wooden shield", desc: "blocks projectiles and reduces melee damage", src: "shield_1", length: 120, width: 120, shield: 0.2, xOff: 6, yOff: 0, spdMult: 0.7 },
        { id: 12, type: 1, age: 8, pre: 9, name: "crossbow", desc: "deals more damage and has greater range", src: "crossbow_1", req: ["wood", 5], aboveHand: true, armS: 0.75, length: 120, width: 120, xOff: -4, yOff: 0, projectile: 2, spdMult: 0.7, speed: 700 },
        { id: 13, type: 1, age: 9, pre: 12, name: "repeater crossbow", desc: "high firerate crossbow with reduced damage", src: "crossbow_2", req: ["wood", 10], aboveHand: true, armS: 0.75, length: 120, width: 120, xOff: -4, yOff: 0, projectile: 3, spdMult: 0.7, speed: 230 },
        { id: 14, type: 1, age: 6, name: "mc grabby", desc: "steals resources from enemies", src: "grab_1", length: 130, width: 210, xOff: -8, yOff: 53, dmg: 0, steal: 250, knock: 0.2, spdMult: 1.05, range: 125, gather: 0, speed: 700 },
        { id: 15, type: 1, age: 9, pre: 12, name: "musket", desc: "slow firerate but high damage and range", src: "musket_1", req: ["stone", 10], aboveHand: true, rec: 0.35, armS: 0.6, hndS: 0.3, hndD: 1.6, length: 205, width: 205, xOff: 25, yOff: 0, projectile: 5, hideProjectile: true, spdMult: 0.6, speed: 1500 }
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

    // ---- lookups ----
    const byId = (arr) => { const m = new Map(); for (const x of arr) m.set(x.id, x); return m; };
    const byName = (arr) => { const m = new Map(); for (const x of arr) m.set(String(x.name).toLowerCase(), x); return m; };

    const weaponId = byId(weapons), weaponName = byName(weapons);
    const itemId = byId(items), itemName = byName(items);
    const hatId = byId(hats), hatName = byName(hats);
    const accId = byId(accessories), accName = byName(accessories);

    return {
        groups, projectiles, weapons, items, hats, accessories,
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


/* ===== module: msgpack (loader/src/msgpack.js) ===== */
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


/* ===== module: sha256 (loader/src/sha256.js) ===== */
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


/* ===== module: protocol (loader/src/protocol.js) ===== */
/*
 * moomoo.js loader — PROTOCOL codec (client side)
 * ===============================================
 * The exact mirror of the server's protocol/crypto.js + protocol/session.js,
 * but running in the browser. Given the io-init handshake the server sends, it
 * derives the same per-connection packet tables and masks, then:
 *   - decodeS2C(frame)  -> { name, args }   (read incoming packets)
 *   - encodeC2S(name, args, seq) -> bytes   (send / re-send outgoing packets)
 *   - decodeC2S(frame)  -> { name, args, seq } (inspect what the client sent)
 *
 * The STABLE constants below mirror the client's constants block. The per-DEPLOY
 * secrets (mixKey, BUILD_SALT) are NOT here — the loader fetches them at runtime
 * from the page's `moomoo-protocol` module, exactly like the official client, so
 * this file does not need editing when the server re-deploys.
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

    const { hmacSha256 } = deps.sha256;
    const msgpack = deps.msgpack;

    // ---- STABLE CONSTANTS (mirror of the client's constants block) ----
    // If the official client bundle ever changes these, update them here (loader side).
    const MODE_KEYED = 1;
    const MAC_LENGTH = 6;
    const LEGACY_SALT = 1;
    const LEGACY_C2S_COUNT = 17;
    const LEGACY_S2C_COUNT = 36;
    const C2S_PACKETS = ["M", "D", "9", "e", "F", "z", "H", "K", "L", "N", "b", "P", "Q", "c", "6", "S", "0", "T", "R", "A", "V"];
    const S2C_PACKETS = ["A", "B", "C", "D", "E", "a", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "X", "Y", "Z", "g", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "W", "F"];
    const TABLE_SALT_MULT = 2654435761;
    const TABLE_S2C_XOR = 2246822507;
    const MASK_C2S_XOR = 3266489909;
    const MASK_S2C_XOR = 668265263;
    const MASK_COUNTER_MULT = 2654435761;
    const MASK_ZERO_SEED = 1831565813;

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

    function buildTables(seed, salt) {
        const legacy = salt == null;
        const mixedSalt = legacy ? LEGACY_SALT : salt;
        const tableSeed = (seed ^ Math.imul(mixedSalt, TABLE_SALT_MULT)) >>> 0;
        return {
            c2s: shuffleTable(legacy ? C2S_PACKETS.slice(0, LEGACY_C2S_COUNT) : C2S_PACKETS, tableSeed),
            s2c: shuffleTable(legacy ? S2C_PACKETS.slice(0, LEGACY_S2C_COUNT) : S2C_PACKETS, (tableSeed ^ TABLE_S2C_XOR) >>> 0)
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
     *   payload = [socketId, seed, keyHex, mode, pinned]
     */
    class ClientSession {
        constructor(payload, mod) {
            const [socketId, seed, keyHex, mode, pinned] = payload;
            this.socketId = socketId;
            this.seed = seed >>> 0;
            this.mode = mode;
            this.pinned = Boolean(pinned);
            this.keyed = mode === MODE_KEYED;

            const rawKey = hexToBytes(keyHex);
            if (this.pinned) {
                if (!mod || typeof mod.mixKey !== "function") throw new Error("pinned connection needs the moomoo-protocol module (mixKey)");
                this.key = mod.mixKey(rawKey, this.seed);
                this.tables = buildTables(this.seed, mod.BUILD_SALT);
                this.maskSeeds = deriveMaskSeeds(this.key);
            } else {
                this.key = rawKey;
                this.tables = buildTables(this.seed, null);
                this.maskSeeds = null;
            }

            this.received = 0; // s2c frames seen after io-init
            this.lastSeq = 0;  // c2s seq we have assigned
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
        C2S_PACKETS, S2C_PACKETS,
        mulberry32, shuffleTable, buildTables,
        hmacTag, xorMask, deriveMaskSeeds, s2cMaskSeed, c2sMaskSeed,
        readU32LE, hexToBytes, isHandshake,
        ClientSession
    };
});


/* ===== module: binding (loader/src/binding.js) ===== */
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
        F: passthrough("stats")
    };

    // ---- OUTGOING: semantic action -> wire letter + argument builder ----
    const outgoing = {
        spawn: { wire: "M", build: (d) => [{ name: d.name == null ? "" : String(d.name), moofoll: d.moofoll ? 1 : 0, skin: d.skin | 0 }] },
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
        store: { wire: "c", build: (d) => [d.action, d.id, bool(d.isAccessory)] },
        chat: { wire: "6", build: (d) => [d.message == null ? "" : String(d.message)] },
        pingMap: { wire: "S", build: () => [] },
        ping: { wire: "0", build: () => [] },
        watchStats: { wire: "V", build: (d) => [d.sid] },
        report: { wire: "R", build: (d) => d.args || [] },
        admin: { wire: "A", build: (d) => d.args || [] }
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
        c: { action: "store", parse: (a) => ({ action: a[0], id: a[1], isAccessory: !!a[2] }) },
        6: { action: "chat", parse: (a) => ({ message: a[0] }) },
        S: { action: "pingMap", parse: () => ({}) },
        0: { action: "ping", parse: () => ({}) },
        V: { action: "watchStats", parse: (a) => ({ sid: a[0] }) },
        R: { action: "report", parse: (a) => ({ args: a.slice() }) },
        A: { action: "admin", parse: (a) => ({ args: a.slice() }) }
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
            6: [2, 4], S: [1, 2], 0: [2, 4], T: [1, 3], R: [2, 5], A: [20, 40], V: [4, 8]
        }
    };

    return {
        version: 1,
        incoming,
        outgoing,
        outgoingParse,
        rateLimits,
        // Used by the anti-cheat bypass: the outgoing packet that carries the
        // anti-tamper telemetry (flags bitfield + untrusted-event count).
        telemetry: {
            wire: "T",
            // Given the decoded telemetry args, return a clean version.
            //   flags: clear every tamper bit (loader hooking is expected here).
            //   untrusted: clamp to 0.
            scrub: (args) => [0, 0]
        }
    };
});


/* ===== module: runtime (loader/src/runtime.js) ===== */
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
    const vocab = (typeof require === "function") ? require("../../shared/vocabulary.js") : root.MooMooVocabulary;
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
                        if (at.sid === self.sid) {
                            self.weaponIndex = at.weaponIndex; self.buildIndex = at.buildIndex;
                            self.hat = at.skin; self.accessory = at.tail; self.team = at.team;
                            self.weaponVariant = at.variant;
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
        const STORE_PREFIX = "moomoojs:mod:";
        const mem = {};                  // fallback store when localStorage is unavailable

        function loadPersist(id) {
            try { if (typeof localStorage !== "undefined") { const v = localStorage.getItem(STORE_PREFIX + id); return v ? JSON.parse(v) : {}; } } catch (e) { /* ignore */ }
            return mem[id] || {};
        }
        function savePersist(id, data) {
            mem[id] = data;
            try { if (typeof localStorage !== "undefined") localStorage.setItem(STORE_PREFIX + id, JSON.stringify(data)); } catch (e) { /* ignore */ }
        }
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
                category: s.category || null,   // which config-menu tab it belongs to
                hint: s.hint || null            // small helper text under the control
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
                menu: meta.menu   // true = show in the tabbed config menu
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
                enabled: rec.enabled, hasSettings: rec.schema.length > 0, menu: rec.menu,
                settings: rec.schema.map((s) => ({ key: s.key, type: s.type, label: s.label, options: s.options, min: s.min, max: s.max, step: s.step, category: s.category, hint: s.hint, value: rec.values[s.key] }))
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
            _setCtxExtensions: (ext) => { ctxExtensions = ext; }
        };
        return MooMoo;
    }

    return { createRuntime };
});


/* ===== module: anticheat (loader/src/anticheat.js) ===== */
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
    if (typeof root !== "undefined") root.MooMooAnticheat = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooAnticheat = value;
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
        // Idempotent: if we already installed, don't double-wrap.
        if (NativeWebSocket.__moomooWrapped) return NativeWebSocket.__moomooNative || NativeWebSocket;

        const report = (e) => { try { onError && onError(e); } catch (_) {} };

        // Per-socket outgoing transform, kept in a WeakMap so nothing is added to
        // the socket that a page probe could enumerate. The loader installs a
        // socket's transform (via ws.__moomooSetTransform) once its session is ready.
        const transforms = new WeakMap();
        const NativeProtoSend = NativeWebSocket.prototype && NativeWebSocket.prototype.send;

        // Native send bound to a specific socket (used by the loader to put its own
        // already-encoded frames on the wire WITHOUT re-entering the trap).
        const nativeSendFor = (ws) => (d) => Reflect.apply(NativeProtoSend, ws, [d]);

        // Give each new socket the loader's hooks. Stored non-enumerable so a
        // for..in / Object.keys on the socket doesn't reveal them.
        function tagSocket(ws) {
            const def = (name, value) => {
                try { Object.defineProperty(ws, name, { value, writable: true, configurable: true, enumerable: false }); }
                catch (e) { ws[name] = value; }
            };
            def("__moomooNativeSend", nativeSendFor(ws));
            def("__moomooSetTransform", (fn) => transforms.set(ws, fn));
        }

        // Replace WebSocket.prototype.send with a Proxy of the native send. The
        // client's `dl.call(socket, frame)` lands here; we hand the frame to that
        // socket's transform (re-encode + scrub) and send the result natively.
        if (NativeProtoSend && !NativeProtoSend.__moomooWrapped) {
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
            try { Object.defineProperty(NativeProtoSend, "__moomooWrapped", { value: true, enumerable: false }); } catch (_) {}
        }

        const handler = {
            construct(target, args, newTarget) {
                const ws = Reflect.construct(target, args, newTarget === Proxied ? target : newTarget);
                try { tagSocket(ws); } catch (e) { report(e); }
                try { onSocket && onSocket(ws, args && args[0]); } catch (e) { report(e); }
                return ws;
            },
            // Pass-through for everything. receiver=target keeps native getter
            // semantics and avoids proxy-as-receiver edge cases.
            get(target, prop, receiver) {
                if (prop === "__moomooWrapped") return true;
                if (prop === "__moomooNative") return NativeWebSocket;
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

        // Replace the global. Define it the same way the platform does so a
        // descriptor probe sees nothing unusual.
        try {
            Object.defineProperty(win, "WebSocket", {
                value: Proxied, writable: true, enumerable: false, configurable: true
            });
        } catch (e) {
            win.WebSocket = Proxied;
        }
        return NativeWebSocket;
    }

    return { installWebSocketProxy };
});


/* ===== module: input (loader/src/input.js) ===== */
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
            for (const t of toks) {
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


/* ===== module: objectmanager (loader/src/objectmanager.js) ===== */
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
 *   setup/died                                                         -> clear (new life)
 *
 * Mechanics copied from the server (server/src/moomoo/modules/gameObject.js +
 * objectManager.js + server.js syncObjects) and the client bundle's GameObject.
 *
 * Part of the LOADER (volatile). Exposed on every mod's ctx as `ctx.objects`.
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooObjectManager = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooObjectManager = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const TURRET_RELOAD = 2200;          // turret shootRate (ms) — item 90 shootRate
    const GATHER_WIGGLE = 10;            // K.gatherWiggle — wiggle px on hit

    const dist = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);

    // A world object, modelled exactly like the bundle's GameObject so features
    // can read the same fields. `data` is the item definition (gameData.item(id))
    // for placed buildings, or null for a natural resource (tree/bush/stone).
    class GameObject {
        constructor(sid) { this.sid = sid; }

        init(x, y, dir, scale, type, data, ownerSid) {
            data = data || {};
            this.active = true;
            this.x = x;
            this.y = y;
            this.dir = dir;
            this.xWiggle = 0;
            this.yWiggle = 0;
            this.scale = scale;
            this.type = type;
            this.id = data.id;
            this.ownerSid = (ownerSid == null || ownerSid < 0) ? null : ownerSid;
            // The bundle stores owner as an object {sid}; keep that shape so code
            // reading `obj.owner.sid` keeps working, but resolve the live player
            // lazily through the manager when a feature needs team/name.
            this.owner = this.ownerSid == null ? null : { sid: this.ownerSid };
            this.name = data.name != null ? data.name
                : type === 0 ? "Tree"
                : (type === 1 && y >= 12000) ? "Cactus"
                : type === 1 ? "Bush"
                : type === 2 ? "Stone"
                : type === 3 ? "Gold Stone"
                : null;
            this.isItem = this.id != null;
            this.group = data.group;
            this.health = this.maxHealth = data.health;
            this.doUpdate = data.doUpdate;
            this.colDiv = data.colDiv || 1;
            this.blocker = data.blocker;
            this.ignoreCollision = data.ignoreCollision;
            this.dontGather = data.dontGather;
            this.hideFromEnemy = data.hideFromEnemy;
            this.friction = data.friction;
            this.projDmg = data.projDmg;
            this.dmg = data.dmg;
            this.pDmg = data.pDmg;
            this.pps = data.pps;
            this.zIndex = data.zIndex || 0;
            this.turnSpeed = data.turnSpeed;
            this.req = data.req;
            this.trap = data.trap;
            this.healCol = data.healCol;
            this.teleport = data.teleport;
            this.boostSpeed = data.boostSpeed;
            this.projectile = data.projectile;
            this.shootRange = data.shootRange;
            this.shootRate = data.shootRate;
            this.shootCount = this.shootRate;
            this.spawnPoint = data.spawnPoint;
            // Layer resolution (gameObject.js): group.layer, else by type.
            this.layer = 2;
            if (this.group != null) this.layer = this.group.layer;
            else if (type === 0) this.layer = 3;
            else if (type === 2) this.layer = 0;
            else if (type === 4) this.layer = -1;
            // Derived collision scales, exactly like the bundle's GameObject.
            this.realScale = (this.type <= 1 && this.type !== null) ? this.scale * 0.6 : this.scale;
            // Runtime combat fields.
            this.time = this.name === "turret" ? TURRET_RELOAD : undefined;  // turret reload countdown
            this.shot = 0;          // last turret fire timestamp
            this.lastHit = 0;       // last wiggle (hit) timestamp
            this.distance = 0;      // scratch: center-distance to a query point
            this.dmgpot = 0;
            this.assumeBreak = false;
            return this;
        }

        changeHealth(amount) { this.health += amount; return this.health <= 0; }

        // Collision scale the way the server computes it for placement checks.
        getScale(sM, ig) {
            sM = sM || 1;
            return this.scale * (this.isItem || this.type === 2 || this.type === 3 || this.type === 4 ? 1 : 0.6 * sM) * (ig ? 1 : this.colDiv);
        }
    }

    // pathScale needs to know whether the owner is an enemy, so it is computed by
    // the manager (which knows the self/team) rather than on the object itself.
    function computePathScale(o, isEnemyOwner) {
        if (o.type === 1 && o.y <= 12000) return o.scale * 0.6 + 15;      // bush
        if (o.type === 0) return o.scale * 0.7 + 10;                       // tree
        if (o.dmg && isEnemyOwner) return o.scale + 47;                    // enemy spike
        if (o.teleport || o.boostSpeed) return o.scale + 47;
        if (o.type === 1 && o.y >= 12000) return o.scale * 0.55 + 47;      // cactus
        if (o.name === "pit trap" && isEnemyOwner) return o.scale + 38;    // enemy trap
        if (o.ignoreCollision) return 0;
        return o.scale + 10;
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

        function removeSid(sid) {
            const o = byId.get(sid);
            if (!o) return;
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
            let o = byId.get(sid);
            if (!o) { o = new GameObject(sid); byId.set(sid, o); list.push(o); }
            o.init(x, y, dir, scale, type, def, ownerSid);
            o.pathScale = computePathScale(o, isEnemyObject(o));
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
                if (list[i].ownerSid === owner) { byId.delete(list[i].sid); list.splice(i, 1); }
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
                if (o.turnSpeed) o.dir += o.turnSpeed * delta;
            }
        }

        MooMoo.on("objectsLoad", onObjectsLoad);
        MooMoo.on("objectKilled", onObjectKilled);
        MooMoo.on("objectsKilled", onObjectsKilled);
        MooMoo.on("wiggle", onWiggle);
        MooMoo.on("turretShoot", onTurretShoot);
        MooMoo.on("itemCount", onItemCount);
        MooMoo.on("playersUpdate", update);
        MooMoo.on("setup", clearAll);
        MooMoo.on("died", clearAll);

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
            update,
            TURRET_RELOAD
        };
    }

    return { createObjectManager, GameObject, TURRET_RELOAD };
});


/* ===== module: combat (loader/src/combat.js) ===== */
/*
 * moomoo.js loader — COMBAT ENGINE  (the bundle's updatePlayers, ported 1-1)
 * =========================================================================
 * The bundle runs its WHOLE combat brain inside one server-tick handler,
 * `updatePlayers(i)` (the "a" packet). Every tick it, for every player:
 *   - shifts predicted position (x2/y2 = this tick's server pos, preX/preY = last)
 *   - derives velocity, move dir/speed, primary/secondary + their variants
 *   - fills the reload clocks pr (primary), sr (secondary), tr (turret gear)
 *   - computes the next-position prediction np = l4(player)  (accel/decel/real)
 * and separately, on each health change, tracks the 9-tick "bull" cadence
 * (lastBull/bleed) the insta combos time themselves against.
 *
 * The loader already decodes the "a" packet into tidy positions+attributes and
 * keeps MooMoo.self / MooMoo.players, so this engine ENRICHES those same objects
 * with the combat fields (pr, sr, tr, x2, y2, np, primaryVar, lastBull, …). A mod
 * then reads them exactly like the bundle did: `z` is MooMoo.self, `Y` is the
 * current target, `vn` is the sorted visible enemies.
 *
 * Constants + formulas are copied verbatim from the bundle / shared/config.js.
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
        mapScale: 14400, riverWidth: 724, snowBiomeTop: 2400,
        playerScale: 35, playerSpeed: 0.0016, gatherAngle: Math.PI / 2.6, gatherWiggle: 10
    };
    const ce = 1000 / 9;                 // server tick ms
    const r3 = Math.pow(0.993, 111);     // decel constant used by l4's T()
    const EN = [1, 1.1, 1.18, 1.18];     // weapon-variant damage multipliers (En)
    const VARIANT_VAL = EN;              // K.weaponVariants[i].val

    // ---- math primitives (bundle aliases) ----
    const U = Math.cos, V = Math.sin, P = Math.atan2, S = Math.abs;
    const D = (a, b) => Math.hypot(a, b);
    const re = (a, b) => Math.pow(a, b);
    const H = Math.round, j = Math.min, oe = Math.max;
    const TAU = Math.PI * 2, W = Math.PI;
    const getDistance = (x1, y1, x2, y2) => Math.hypot(x2 - x1, y2 - y1);
    const getDirection = (x1, y1, x2, y2) => Math.atan2(y1 - y2, x1 - x2);
    function getAngleDist(a, b) { let n = S(a - b) % TAU; if (n > W) n = TAU - n; return n; }
    const Ay = getAngleDist;

    function createCombat(env) {
        const MooMoo = env.MooMoo;
        const data = env.data;
        const objects = env.objects || null;
        const selfInput = env.selfInput || { moveDir: null, aimDir: 0 };

        const z = MooMoo.self;               // our own player (the bundle's `z`)
        let v = 0;                           // tick counter
        let et = 0;                          // self bull-cycle offset
        let lastTickTime = 0;                // for delta
        let Y = null;                        // current target
        let vn = [];                         // visible enemies sorted nearest-first
        let manualTargetSid = null;          // xi.ID
        const prev = new Map();              // sid -> { x2, y2, movDir, np }  (last tick)

        // ---- geometry on predicted positions (se / B / S4), ported 1-1 ----
        const gx = (e) => (e && e.x2 != null ? e.x2 : (e ? e.x : 0)) || 0;
        const gy = (e) => (e && e.y2 != null ? e.y2 : (e ? e.y : 0)) || 0;
        function S4(e, t) { return getDistance(gx(e), gy(e), gx(t), gy(t)); }
        function se(e, t, n) {
            const off = n === "player" ? -1.8 * 35 : n === "object" ? -(t && t.scale || 0) : 0;
            return getDistance(gx(e), gy(e), gx(t), gy(t)) + off;
        }
        function B(e, t) { return P(gy(t) - gy(e), gx(t) - gx(e)); }

        // ---- game-data helpers ----
        const weapon = (id) => data.weapon(id);
        const item = (id) => data.item(id);
        const hat = (id) => data.hat(id);
        const acc = (id) => data.accessory(id);
        const weaponSpeed = (id) => { const w = weapon(id); return (w && w.speed != null) ? w.speed : 300; };
        const weaponRange = (id) => { const w = weapon(id); return (w && w.range != null) ? w.range : 0; };
        const variantVal = (vi) => VARIANT_VAL[vi] || 1;

        // ---- x4: movement-speed multiplier (bundle x4) ----
        function x4(t) {
            const w = weapon(t.weaponIndex);
            const sh = hat(t.skinIndex), ta = acc(t.tailIndex);
            let e = ((t.buildIndex < 0) + 1) / 2
                * ((w && w.spdMult) || 1)
                * ((t.skinIndex && sh && sh.spdMult) || 1)
                * ((t.tailIndex && ta && ta.spdMult) || 1)
                * (t.y2 <= K.snowBiomeTop ? ((t.skinIndex && sh && sh.coldM) ? 1 : 0.75) : 1)
                * 1;
            if (!t.zIndex && t.y2 >= K.mapScale / 2 - K.riverWidth / 2 && t.y2 <= K.mapScale / 2 + K.riverWidth / 2) {
                e *= ((t.skinIndex && sh && sh.watrImm) ? 0.75 : 0.33);
            }
            return e;
        }

        // ---- l4: next-position prediction (accel / decel / real), ported 1-1 ----
        function l4(e, t, n, i, s) {
            if (s == null) s = 111;
            if (!i) {
                if (e.sid === z.sid && t !== 0 && !t) t = selfInput.moveDir;
                else if (selfInSpike && e.sid === z.sid) t = undefined;
                else if (!t && t !== 0) t = e.movDir;
            }
            let o = U(t), r = V(t);
            const a = D(o, r);
            if (a !== 0) { o /= a; r /= a; }
            if (!n) n = e;
            const l = x4(n);
            let speedXD = 0, speedYD = 0, predX = 0, predY = 0;
            if (o) speedXD += o * 0.0016 * l * s;
            if (r) speedYD += r * 0.0016 * l * s;
            if (speedXD) predX += speedXD * s;
            if (speedYD) predY += speedYD * s;
            const f = e.xVel * re(0.993, s), h = e.yVel * re(0.993, s);
            const p = f + predX, m = h + predY;
            const g = { x: e.x2 + p, y: e.y2 + m, type: "accel" };
            const y = { x: e.x2 + f, y: e.y2 + h, type: "decel" };
            const w = { x: e.x2, y: e.y2, type: "current" };
            const b = { x: p, y: m, type: "nextVel" };
            const I = s * 1.5 * U(t), So = s * 1.5 * V(t);
            const E = { x: e.x2 + I, y: e.y2 + So };
            const x = T(p, m, { x: e.x2 + p, y: e.y2 + m });
            let real = g;
            const pnp = prev.get(e.sid) && prev.get(e.sid).np;
            if (pnp != null && e.sid !== z.sid) {
                real = (se(e, pnp.accel) > se(e, pnp.decel) && Ay(e.movDir, e.pmovDir) <= 0.3) ? y : g;
            }
            if (e.sid === z.sid) real = (selfInput.moveDir == null) ? y : g;
            const k = H(D(p, m));
            return { accel: g, decel: y, boostCoords: E, boostVel: { x: I, y: So }, nextVel: b, real, current: w, fullDecel: x, xVel: p, spd: l, yVel: m, vel: k };

            function T(e, t, n) {
                if (isNaN(e) || isNaN(t)) return;
                const i = e * r3, sv = t * r3;
                if (e !== i) { e = i; n.x += e; }
                if (t !== sv) { t = sv; n.y += t; }
                if (e === i && t === sv) return { x: n.x, y: n.y, type: "full decel" };
                return T(e, t, n);
            }
        }

        // ---- loadout resolver (yy): map self.items/weapons -> slot ids ----
        // Action-bar index e maps to item id e-16, so each group's owned item is
        // simply the self.items entry whose id falls in that group's id range.
        let selfInSpike = false;         // z in an enemy spike/trap (Nt analogue)
        const loadout = {
            ee: null, A: null, ry: null, ay: null, ly: null, cy: null, dy: null, uy: null, fy: null, hy: null,
            spike: null, wall: null, food: null, windmill: null, utility: null, spawnpad: false
        };
        function inRange(id, lo, hi) { return id >= lo && id <= hi; }
        function resolveLoadout() {
            const weapons = z.weapons || [], items = z.items || [];
            loadout.ee = weapons[0] != null ? weapons[0] : null;        // primary weapon id
            loadout.A = weapons[1] != null ? weapons[1] : null;         // secondary weapon id
            loadout.ry = loadout.ay = loadout.ly = loadout.cy = loadout.dy = loadout.uy = loadout.fy = loadout.hy = null;
            for (const id of items) {
                if (inRange(id, 0, 2)) loadout.ry = id;
                else if (inRange(id, 3, 5)) loadout.ay = id;
                else if (inRange(id, 6, 9)) loadout.ly = id;
                else if (inRange(id, 10, 12)) loadout.cy = id;
                else if (inRange(id, 13, 14)) loadout.dy = id;
                else if (inRange(id, 15, 16)) loadout.uy = id;
                else if (id === 20) loadout.fy = id;
                else if (inRange(id, 17, 22) && id !== 20) loadout.hy = id;
            }
            // b4: classify the spike/wall/food/windmill/utility item defs for dmgpot.
            loadout.spike = loadout.ly != null ? item(loadout.ly) : null;
            loadout.wall = loadout.ay != null ? item(loadout.ay) : null;
            loadout.food = loadout.ry != null ? item(loadout.ry) : null;
            loadout.windmill = loadout.cy != null ? item(loadout.cy) : null;
            loadout.utility = loadout.hy != null ? item(loadout.hy) : null;
            loadout.spawnpad = loadout.fy != null;
        }

        // ---- reload fill (xy): fill pr/sr/tr for a visible player, one tick ----
        function xy(t) {
            if (t.buildIndex === -1) {
                if (t.weaponIndex <= 8) {
                    const e = weaponSpeed(t.primary);
                    t.pr = j(1, t.pr + (t.delta > 190 ? t.delta : ce) / (e * t.samRP));
                } else if (t.weaponIndex > 8) {
                    const e = weaponSpeed(t.secondary);
                    t.sr = j(1, t.sr + (t.delta > 190 ? t.delta : ce) / (e * t.samRS));
                }
            }
            t.tr = j(1, t.tr + t.delta / 2400);
        }
        // by: keep filling reload for players no longer visible (bundle by()).
        function by(t) {
            if (t.pr != null && t.pr !== 1) t.pr = j(1, t.pr + ce / (weaponSpeed(t.primary) * t.samRP));
            if (t.sr != null && t.sr !== 1) t.sr = j(1, t.sr + ce / (weaponSpeed(t.secondary) * t.samRS));
            if (t.tr != null && t.tr !== 1) t.tr = j(1, t.tr + ce / 2500);
        }

        // ---- per-player state init (new player) ----
        function initPlayerState(q) {
            if (q.__combatInit) return;
            q.__combatInit = true;
            q.pr = 1; q.sr = 1; q.tr = 1;
            q.samRP = 1; q.samRS = 1;
            q.primaryVar = 3; q.secondaryVar = 3;
            q.primary = undefined; q.secondary = undefined;
            q.x2 = q.x; q.y2 = q.y; q.preX = q.x; q.preY = q.y;
            q.xVel = 0; q.yVel = 0; q.movSpd = 0; q.movDir = undefined; q.pmovDir = undefined;
            q.delta = ce; q.hitProjs = 0; q.visible = false;
            q.lastBull = 0; q.bleed = undefined; q.poison = 0;
            q.slowMult = 1; q.shameCount = 0; q.weaponR = 1;
        }

        // ---- the "a" tick: reconstruct everyone (bundle updatePlayers) ----
        function updatePlayers(payload) {
            const now = Date.now();
            const dt = lastTickTime ? (now - lastTickTime) : ce;
            lastTickTime = now;
            v++;
            if (v % 9 === 0) { /* packet-count bucket upkeep (visual only) */ }

            // self is tracked as MooMoo.self; ensure it has combat fields.
            initPlayerState(z);
            resolveLoadout();

            // snapshot which players came in this tick's position list
            const positions = (payload && payload.positions) || [];
            const freshSids = new Set();

            // everyone starts invisible this tick (bundle sets visible=false then true)
            for (const p of MooMoo.players.values()) { initPlayerState(p); p.vis2 = p.visible; p.visible = false; }
            z.vis2 = z.visible; z.visible = false;

            for (const pos of positions) {
                const q = (pos.sid === z.sid) ? z : MooMoo.players.get(pos.sid);
                if (!q) continue;
                initPlayerState(q);
                freshSids.add(pos.sid);
                const pv = prev.get(pos.sid) || {};
                // shift prediction window
                q.x1 = q.x; q.y1 = q.y;
                q.preX = q.x2 != null ? q.x2 : pos.x;
                q.preY = q.y2 != null ? q.y2 : pos.y;
                q.pmovDir = q.movDir;
                q.x2 = pos.x; q.y2 = pos.y;
                q.x = pos.x; q.y = pos.y; q.dir = pos.dir;
                q.delta = dt;
                // Normalise the runtime's attribute names (variant/skin/tail, and
                // self's hat/accessory/weaponVariant) onto the bundle's names so every
                // feature reads q.skinIndex / q.tailIndex / q.weaponVariant uniformly.
                q.weaponVariant = (q === z) ? (z.weaponVariant || 0) : (q.variant || 0);
                q.skinIndex = (q === z) ? (z.hat || 0) : (q.skin || 0);
                q.tailIndex = (q === z) ? (z.accessory || 0) : (q.tail || 0);
                q.loadout = (q === z) ? loadout : (q.loadout || {});
                // attributes (weaponIndex/buildIndex/variant/team/skin/tail/zIndex) are
                // kept current on the player object by the runtime; read them back.
                q.xVel = q.x2 - q.preX; q.yVel = q.y2 - q.preY;
                q.movSpd = D(q.preY - q.y2, q.preX - q.x2);
                q.movSpd2 = D(q.y1 - q.y2, q.x1 - q.x2);
                q.movDir = P(q.y2 - q.preY, q.x2 - q.preX);
                if ((q.movDir === 0 && q.movSpd === 0) || (q.preX === q.x2 && q.preY === q.y2)) q.movDir = undefined;
                // weapon / variant
                if (q.weaponIndex >= 9) q.secondary = q.weaponIndex; else q.primary = q.weaponIndex;
                const wvar = q.weaponVariant != null ? q.weaponVariant : 3;
                if (q.weaponIndex === q.primary) q.primaryVar = wvar;
                if (q.weaponIndex === q.secondary) q.secondaryVar = wvar;
                // shame/samurai reset for visibility
                q.lastpr = q.pr; q.lastsr = q.sr; q.lasttr = q.tr;
                q.tick = v;
                q.visible = true;
                xy(q);
                q.weaponR = (q.weaponIndex === q.secondary) ? q.sr : q.pr;
                q.hitProjs = 0; q.hitSpike = false;
                q.np = l4(q);
                q.inWater = q.y2 >= K.mapScale / 2 - K.riverWidth / 2 && q.y2 <= K.mapScale / 2 + K.riverWidth / 2;
                q.assumeAge = g4(q);
                // bleed (bull-cycle phase)
                q.bleed = q.lastBull ? ((v - q.lastBull + (q.sid === z.sid ? et : 0)) % 9 + 9) % 9 : undefined;
                prev.set(pos.sid, { x2: q.x2, y2: q.y2, movDir: q.movDir, np: q.np });
                pv.seen = v;
            }
            // players still invisible: keep their reload filling (by)
            for (const p of MooMoo.players.values()) { if (!p.visible && p.sid !== z.sid) by(p); }

            // target selection: manual target, else nearest visible enemy (vn[0])
            vn = visibleEnemies();
            for (const e of vn) e.distance = S4(z, e);
            vn.sort((a, b) => a.distance - b.distance);
            if (manualTargetSid != null) {
                const t = vn.find((e) => e.sid === manualTargetSid);
                Y = t || vn[0] || null;
            } else Y = vn[0] || null;
        }

        // ---- g4: assumeAge (highest age gear a player reveals) ----
        function g4(e) {
            let t = 0; const n = e.loadout || {};
            if (n.spawnpad || (weapon(e.secondary) && weapon(e.secondary).age === 9) || (n.spike && n.spike.age === 9)) return 9;
            if (n.utility) t = 7;
            const sa = weapon(e.secondary), pa = weapon(e.primary);
            if (sa && t < sa.age) t = sa.age;
            if (pa && t < pa.age) t = pa.age;
            if (n.spike && t < n.spike.age) t = n.spike.age;
            if (n.food && t < n.food.age) t = n.food.age;
            if (n.windmill && t < n.windmill.age) t = n.windmill.age;
            if (n.wall && t < n.wall.age) t = n.wall.age;
            if (e.weaponIndex === 0) t = 1;
            if (e.primary === 0 && t > 1) e.primary = undefined;
            return t;
        }

        // ---- K (gatherAnimation): a swing resets the swung weapon's reload ----
        function onGather(p) {
            const a = p && p.args; if (!a) return;
            const sid = a[0], weaponIndex = a[2];
            if (typeof weaponIndex !== "number") return;
            const o = (sid === z.sid) ? z : MooMoo.players.get(sid);
            if (!o) return;
            initPlayerState(o);
            if (weaponIndex > 9) o.sr = 0; else o.pr = 0;
            const w = weapon(weaponIndex);
            o.slowMult -= (w && w.hitSlow) || 0.3;
            if (o.slowMult < 0) o.slowMult = 0;
            o.samRS = (o.skinIndex === 20 && weaponIndex > 9) ? 0.78 : 1;
            o.samRP = (o.skinIndex === 20 && weaponIndex < 9) ? 0.78 : 1;
        }

        // ---- health: track damage + the 9-tick bull cadence (lastBull/bleed) ----
        const lastHealth = new Map();
        function onHealth(p) {
            const sid = p.sid, value = p.value;
            const o = (sid === z.sid) ? z : MooMoo.players.get(sid);
            if (!o) { lastHealth.set(sid, value); return; }
            initPlayerState(o);
            const prevH = lastHealth.has(sid) ? lastHealth.get(sid) : value;
            const t = value - prevH;             // damage (<0) or heal (>0)
            lastHealth.set(sid, value);
            // bull-helmet reflect cadence: a bull (skin 7) dealing its periodic hit
            // marks the cycle. poison tick (-5) also marks it.
            if (t === -5 * (o.skinIndex === 6 ? 0.75 : 1) && o.poison) o.lastBull = v - 1;
            if (t > 0) {
                if (o.skinIndex === 13) {
                    if (o.tailIndex === 13) { if (t === 6) { o.lastBull = v - 1; if (o === z) et = 0; } }
                    else { if (t === 3) { o.lastBull = v - 1; if (o === z) et = 0; } }
                }
            } else if (t < 0) {
                if (o.skinIndex === 7) {
                    if (o.tailIndex === 13) { if (t === -2) { o.lastBull = v - 1; o.lastBull2 = Date.now(); } }
                    else { if (t === -5) { o.lastBull = v - 1; o.lastBull2 = Date.now(); if (o === z) et = 0; } }
                }
            }
            o.bleed = o.lastBull ? ((v - o.lastBull + (o.sid === z.sid ? et : 0)) % 9 + 9) % 9 : undefined;
        }

        function onDied() { v = 0; et = 0; Y = null; vn = []; prev.clear(); lastHealth.clear(); }
        function onSetup() { onDied(); }

        // ---- targeting ----
        function visiblePlayers() {
            const out = [];
            for (const p of MooMoo.players.values()) if (p.sid !== z.sid && p.visible) out.push(p);
            return out;
        }
        function visibleEnemies() {
            return visiblePlayers().filter((p) => !(z.team != null && p.team != null && p.team === z.team));
        }

        // ---- combat predicates ported 1-1 ----
        // _y: a player's reload readiness after `t` ms (default 111). ==1 means ready.
        function _y(e, t) {
            if (!e) return;
            if (!t) t = 111;
            return j(1, e.weaponR + t / weaponSpeed(e.weaponIndex));
        }
        // Vy: is t within range n of e (now or on predicted-real positions)?
        function Vy(e, t, n, i) {
            return se(e, t, "player") <= n || (i && se(e.np && e.np.real, t.np && t.np.real, "player") <= n);
        }
        // o4: not shielded against us (weapon 11 = shield; must hit their back).
        function o4(e, t) {
            if (t.weaponIndex !== 11) return true;
            const n = B(e, t);
            return getAngleDist(n + W, t.dir) > W / 3;
        }

        MooMoo.on("playersUpdate", updatePlayers);
        MooMoo.on("gatherAnimation", onGather);
        MooMoo.on("health", onHealth);
        MooMoo.on("died", onDied);
        MooMoo.on("setup", onSetup);

        return {
            // state
            get z() { return z; }, get self() { return z; },
            get tick() { return v; }, get et() { return et; },
            get target() { return Y; }, set target(sid) { manualTargetSid = sid; },
            get visibleEnemies() { return vn; },
            get loadout() { return loadout; },
            setSelfInSpike(b) { selfInSpike = b; },
            get selfInSpike() { return selfInSpike; },
            // geometry + predicates
            se, B, S4, angleDist: getAngleDist, getDirection,
            _y, Vy, o4, l4, x4,
            variantVal, weaponSpeed, weaponRange,
            visiblePlayers, visibleEnemies,
            K, ce, EN,
            // for tests / advanced
            _updatePlayers: updatePlayers, _prev: prev
        };
    }

    return { createCombat, K, ce, EN, r3 };
});


/* ===== module: helpers (loader/src/helpers.js) ===== */
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
    if (typeof root !== "undefined") root.MooMooHelpers = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooHelpers = value;
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


/* ===== module: menu (loader/src/menu.js) ===== */
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
    if (typeof root !== "undefined") root.MooMooMenu = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooMenu = value;
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
    #gameModsBody.mmj-body{ color:#5a5a5a; max-height:340px; overflow-y:auto; overflow-x:hidden; margin:0 -4px; padding:0 4px; }
    #gameModsBody .mmj-empty{ padding:26px 8px; text-align:center; color:#9a9a9a; font-size:15px; line-height:1.5; }
    #gameModsBody .mmj-empty code{ background:#f0f0f0; border-radius:4px; padding:1px 5px; color:#6cc24a; }
    #gameModsBody .mmj-mod{ border-bottom:1px solid #eee; }
    #gameModsBody .mmj-row{ display:flex; align-items:center; gap:10px; padding:11px 4px; }
    #gameModsBody .mmj-head{ cursor:default; }
    #gameModsBody .mmj-head.mmj-has-settings{ cursor:pointer; border-radius:6px; }
    #gameModsBody .mmj-head.mmj-has-settings:hover{ background:#f3f3f3; }
    #gameModsBody .mmj-name{ flex:1 1 auto; min-width:0; font-size:16px; color:#2f2f2f; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    #gameModsBody .mmj-ver{ font-size:11px; color:#b4b4b4; margin-left:6px; }
    #gameModsBody .mmj-chev{ width:10px; height:10px; border-right:2px solid #c0c0c0; border-bottom:2px solid #c0c0c0; transform:rotate(-45deg); transition:transform .18s ease; flex:0 0 auto; margin-right:2px; }
    #gameModsBody .mmj-mod.mmj-open .mmj-chev{ transform:rotate(45deg); }
    #gameModsBody .mmj-settings{ display:none; padding:2px 6px 12px 6px; }
    #gameModsBody .mmj-mod.mmj-open .mmj-settings{ display:block; }
    #gameModsBody .mmj-set{ display:flex; align-items:center; gap:10px; padding:7px 0; font-size:14px; color:#6a6a6a; }
    #gameModsBody .mmj-set-label{ flex:1 1 auto; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    #gameModsBody .mmj-set input[type=text], #gameModsBody .mmj-set input[type=number], #gameModsBody .mmj-set select{
        font-family:inherit; font-size:13px; color:#333; border:1px solid #dcdcdc; border-radius:6px; padding:4px 7px; width:96px; background:#fff; }
    #gameModsBody .mmj-set input[type=range]{ -webkit-appearance:none; appearance:none; width:110px; height:5px; border-radius:3px; background:#e2e2e2; outline:none; }
    #gameModsBody .mmj-set input[type=range]::-webkit-slider-thumb{ -webkit-appearance:none; width:15px; height:15px; border-radius:50%; background:#6cc24a; cursor:pointer; box-shadow:0 1px 2px rgba(0,0,0,.25); }
    #gameModsBody .mmj-set input[type=range]::-moz-range-thumb{ width:15px; height:15px; border:none; border-radius:50%; background:#6cc24a; cursor:pointer; }
    #gameModsBody .mmj-set-val{ font-size:12px; color:#9a9a9a; min-width:30px; text-align:right; }
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

        function ensureStyle() {
            if (doc.getElementById("mmj-style")) return;
            const s = el("style"); s.id = "mmj-style"; s.textContent = STYLE;
            (doc.head || doc.documentElement).appendChild(s);
        }

        let panel = null;      // #gameModsBody
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
            if (!bar || !card || doc.getElementById("gameModsBody")) return Boolean(doc.getElementById("gameModsBody"));

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

            panel = el("div", "mmj-body");
            panel.id = "gameModsBody";
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

                const head = el("div", "mmj-row mmj-head" + (mod.hasSettings ? " mmj-has-settings" : ""));
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
                if (mod.hasSettings) {
                    head.appendChild(el("div", "mmj-chev"));
                    head.addEventListener("click", () => {
                        openState[mod.id] = !openState[mod.id];
                        wrap.classList.toggle("mmj-open", openState[mod.id]);
                    });
                }
                wrap.appendChild(head);

                if (mod.hasSettings) {
                    const box = el("div", "mmj-settings");
                    for (const s of mod.settings) box.appendChild(makeSetting(mod, s));
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


/* ===== module: configmenu (loader/src/configmenu.js) ===== */
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
        // hotkey + escape
        if (input) {
            input.onKey(toggleKey, () => toggle(), { preventDefault: true });
        } else {
            win.addEventListener("keydown", (e) => { if (e.isTrusted === false) return; const k = e.key === " " ? "space" : e.key; if (k === toggleKey) { e.preventDefault(); toggle(); } }, true);
        }
        win.addEventListener("keydown", (e) => { if (open && e.key === "Escape") hide(); }, true);

        // Re-render on registry changes (new mod, external toggle), but not for our
        // own edits (so a slider drag isn't interrupted).
        MooMoo.onModsChanged(() => { if (open && !suppressRerender) render(); });

        return { show, hide, toggle, render, setToggleKey: (k) => { toggleKey = k; }, isOpen: () => open };
    }

    return { installConfigMenu };
});


/* ===== module: outgoing (loader/src/outgoing.js) ===== */
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
            avgPing,
            setEnabled: (b) => { enabled = !!b; },
            get enabled() { return enabled; },
            reset,
            RATE_MARGIN, BURST_RESERVE
        };
    }

    return { createOutgoing, Bucket };
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
            Protocol: require("./protocol.js"),
            Msgpack: require("./msgpack.js"),
            Binding: require("./binding.js"),
            Runtime: require("./runtime.js"),
            Anticheat: require("./anticheat.js"),
            Menu: require("./menu.js"),
            GameData: require("../../shared/gamedata.js"),
            Input: require("./input.js"),
            ObjectManager: require("./objectmanager.js"),
            Combat: require("./combat.js"),
            Helpers: require("./helpers.js"),
            ConfigMenu: require("./configmenu.js"),
            Outgoing: require("./outgoing.js")
        }
        : null;
    const value = factory(deps);
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooLoaderCore = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooLoaderCore = value;
})(typeof self !== "undefined" ? self : this, function (nodeDeps) {
    "use strict";

    const VERSION = "1.0.0";

    // Resolve dependencies either from Node require (tests) or page globals (bundle).
    function resolveDeps(win) {
        if (nodeDeps) return nodeDeps;
        const g = win || (typeof globalThis !== "undefined" ? globalThis : {});
        return {
            Protocol: g.MooMooProtocol,
            Msgpack: g.MooMooMsgpack,
            Binding: g.MooMooBinding,
            Runtime: g.MooMooRuntime,
            Anticheat: g.MooMooAnticheat,
            Menu: g.MooMooMenu,
            GameData: g.MooMooGameData,
            Input: g.MooMooInput,
            ObjectManager: g.MooMooObjectManager,
            Combat: g.MooMooCombat,
            Helpers: g.MooMooHelpers,
            ConfigMenu: g.MooMooConfigMenu,
            Outgoing: g.MooMooOutgoing
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
        const D = resolveDeps(win);
        if (!D.Protocol || !D.Binding || !D.Runtime || !D.Anticheat) {
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
        if (D.ObjectManager && D.GameData) {
            try { objects = D.ObjectManager.createObjectManager({ MooMoo, data: D.GameData }); }
            catch (e) { errorSink(e); }
        }
        // The combat engine reconstructs per-player prediction/reload/bull state on
        // every server tick (the bundle's updatePlayers). Features read it as ctx.combat.
        let combat = null;
        if (D.Combat && D.GameData) {
            try { combat = D.Combat.createCombat({ MooMoo, data: D.GameData, objects, input, selfInput }); }
            catch (e) { errorSink(e); }
        }
        // Inject the combat/placement/targeting verbs into every mod's ctx.
        if (D.Helpers && D.GameData) {
            try {
                const ext = D.Helpers.createHelpers({ MooMoo, input, data: D.GameData, objects, combat, net: out });
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

        function sendWire(st, wire, args) {
            if (!st || st.ignore) { console.warn("%c[moomoo.js]", "color:#e66", "no active game socket to send on"); return false; }
            if (st.ready) {
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

        // Returns the bytes to send, or undefined to drop the frame entirely. A
        // dropped frame never consumes a sequence number, so the stream stays
        // gap-free.
        function reencodeClientFrame(st, bytes) {
            let dec;
            try { dec = st.session.decodeC2S(bytes); }
            catch (e) { errorSink(e); return bytes; } // fail open
            try {
                let name = dec.name, args = dec.args;
                if (name === telemetry.wire) args = telemetry.scrub(args); // ANTI-CHEAT BYPASS
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
                return st.session.encodeC2S(dec.name, dec.name === telemetry.wire ? telemetry.scrub(dec.args) : dec.args);
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
            catch (e) { errorSink(e); return; }
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
            if (MooMoo._reset) MooMoo._reset();
            if (out) out.reset();
            getProtocolModule().then((mod) => {
                try {
                    st.session = new D.Protocol.ClientSession(payload, mod);
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
                nativeSend: (d) => ws.__moomooNativeSend ? ws.__moomooNativeSend(d) : ws.send(d)
            };
            // passive read hook
            try { ws.addEventListener("message", (ev) => handleIncoming(st, ev.data)); }
            catch (e) { errorSink(e); }
            // active send hook (installed by anticheat.wrapSend)
            if (ws.__moomooSetTransform) ws.__moomooSetTransform(makeSendTransform(st));
        }

        const native = D.Anticheat.installWebSocketProxy(win, onSocket, errorSink);

        // ---- diagnostics surface ----
        const MooMooLoader = {
            version: VERSION,
            native,
            diag,
            onRaw(fn) { rawTaps.add(fn); return () => rawTaps.delete(fn); },
            sendRaw: (wire, args) => sink.sendRaw(wire, args),
            active: () => active && { ready: active.ready, failed: active.failed, buildId: diag.buildId }
        };

        win.MooMoo = MooMoo;
        win.MooMooLoader = MooMooLoader;

        MooMooLoader.input = input;
        MooMooLoader.gameData = D.GameData || null;
        MooMooLoader.objects = objects;
        MooMooLoader.net = out;
        MooMooLoader.combat = combat;

        // In-game Mods menu (only in a real page; skipped in headless tests).
        if (D.Menu && win.document) {
            try { MooMooLoader.menu = D.Menu.installMenu(win, MooMoo); }
            catch (e) { errorSink(e); }
        }
        // Tabbed config menu (the rich settings overlay, toggled by a hotkey).
        if (D.ConfigMenu && win.document) {
            try { MooMooLoader.config = D.ConfigMenu.installConfigMenu(win, MooMoo, { input, toggleKey: opts.menuKey || "`", title: "moomoo.js" }); }
            catch (e) { errorSink(e); }
        }
        // Warm up the protocol module resolution so the first connection is instant.
        try { getProtocolModule().catch(() => {}); } catch (e) { /* ignore */ }

        return { MooMoo, MooMooLoader };
    }

    return { createLoader, VERSION };
});

  try {
    MooMooLoaderCore.createLoader(window);
    console.log("%c[moomoo.js]", "color:#7cc;font-weight:bold", "loader 1.0.0 installed — window.MooMoo is ready for mods");
  } catch (e) {
    console.error("%c[moomoo.js]", "color:#e66", "loader failed to install:", e);
  }
}
  // Run core in the PAGE context. Under a userscript sandbox we inject a <script>;
  // if we are already in the page (e.g. @grant none page-context, or a bookmarklet)
  // we just call it.
  var inPage;
  try { inPage = (typeof unsafeWindow === "undefined") || (window === unsafeWindow); }
  catch (e) { inPage = true; }
  if (inPage) {
    core();
  } else {
    try {
      var s = document.createElement("script");
      s.textContent = "(" + core.toString() + ")();";
      (document.head || document.documentElement).appendChild(s);
      s.remove();
    } catch (e) {
      // Last resort: run in whatever context we are in.
      core();
    }
  }
})();
