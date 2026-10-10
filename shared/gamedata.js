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
