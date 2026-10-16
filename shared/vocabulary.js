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
