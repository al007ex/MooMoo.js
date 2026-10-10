"use strict";

// GAME CONFIG
// Field-for-field copy of the config object (M) inside the official client bundle.
// The client's minified constant names are noted next to each value. Do not change a
// value here unless the client changes it too - client and server must agree.
//
// Server-only tuning (world generation counts per area, animal spawns, sandbox limits)
// lives in the `server` block at the bottom.

var hasProcess = typeof process === "object" && process !== null;
var hasArgv = hasProcess && Array.isArray(process.argv);
var env = hasProcess && process.env ? process.env : {};

// [nc] / [xd]
var maxPlayers = hasArgv && process.argv.indexOf("--largeserver") != -1 ? 80 : 40;

// [Co] weapon variants
var weaponVariants = [{
    id: 0,
    src: "",
    xp: 0,
    val: 1
}, {
    id: 1,
    src: "_g",
    xp: 3000,
    val: 1.1
}, {
    id: 2,
    src: "_d",
    xp: 7000,
    val: 1.18
}, {
    id: 3,
    src: "_r",
    poison: true,
    xp: 12000,
    val: 1.18
}, {
    id: 4,
    src: "_e",
    lifesteal: 0.15,
    membersOnly: true,
    xp: 20000,
    val: 1.18
}];

var config = {
    // RENDER:
    maxScreenWidth: 1920,                   // [fd]
    maxScreenHeight: 1080,                  // [ud]

    // SERVER:
    serverUpdateRate: 9,                    // [hd]
    maxPlayers: maxPlayers,                 // [nc]
    maxPlayersHard: maxPlayers + 10,        // [xd]
    collisionDepth: 6,                      // [md]
    minimapRate: 3000,                      // [pd]

    // COLLISIONS:
    colGrid: 10,                            // [gd]

    // CLIENT:
    clientSendRate: 5,                      // [yd]

    // UI:
    healthBarWidth: 50,                     // [kd]
    healthBarPad: 4.5,                      // [wd]
    iconPadding: 15,                        // [bd]
    iconPad: 0.9,                           // [vd]
    deathFadeout: 3000,                     // [Wd]
    crownIconScale: 60,                     // [Sd]
    crownPad: 35,                           // [Ed]

    // CHAT:
    chatCountdown: 3000,                    // [Cd]
    chatCooldown: 500,                      // [Md]

    // SANDBOX:
    inSandbox: Boolean(env.IS_SANDBOX),     // [Id]  ({}.IS_SANDBOX in the client build)
    // SERVER: SANDBOX_UNLIMITED=1 keeps every resource and gold topped up, so nothing costs anything.
    unlimitedResources: Boolean(env.SANDBOX_UNLIMITED),
    unlimitedAmount: 1000000,

    // PLAYER:
    maxAge: 100,                            // [Td]
    gatherAngle: Math.PI / 2.6,             // [Rd]
    gatherWiggle: 10,                       // [Pd]
    hitReturnRatio: 0.25,                   // [Ad]
    hitAngle: Math.PI / 2,                  // [Od]
    playerScale: 35,                        // [Bd]
    playerSpeed: 0.0016,                    // [Dd]
    playerDecel: 0.993,                     // [_d]
    nameY: 34,                              // [Ld]

    // CUSTOMIZATION:
    skinColors: ["#bf8f54", "#cbb091", "#896c4b", "#fadadc", "#ececec", "#c37373", "#4c4c4c", "#ecaff7", "#738cc3", "#8bc373"], // [Nd]

    // ANIMALS:
    animalCount: 7,                         // [Gd]
    aiTurnRandom: 0.06,                     // [Hd]
    cowNames: ["Sid", "Steph", "Bmoe", "Romn", "Jononthecool", "Fiona", "Vince", "Nathan", "Nick", "Flappy", "Ronald", "Otis", "Pepe", "Mc Donald", "Theo", "Fabz", "Oliver", "Jeff", "Jimmy", "Helena", "Reaper", "Ben", "Alan", "Naomi", "XYZ", "Clever", "Jeremy", "Mike", "Destined", "Stallion", "Allison", "Meaty", "Sophia", "Vaja", "Joey", "Pendy", "Murdoch", "Theo", "Jared", "July", "Sonia", "Mel", "Dexter", "Quinn", "Milky"], // [Fd]

    // WEAPONS:
    shieldAngle: Math.PI / 3,               // [qd]
    weaponVariants: weaponVariants,         // [Co]
    fetchVariant: function (player) {      // [Vd]
        var tmpXP = player.weaponXP[player.weaponIndex] || 0;
        for (var i = weaponVariants.length - 1; i >= 0; --i) {
            if (tmpXP >= weaponVariants[i].xp) {
                return weaponVariants[i];
            }
        }
    },

    // NATURE:
    resourceTypes: ["wood", "food", "stone", "points"], // [Qd]
    areaCount: 7,                           // [Kd]
    treesPerArea: 9,                        // [Ud]
    bushesPerArea: 3,                       // [Xd]
    totalRocks: 32,                         // [Jd]
    goldOres: 7,                            // [zd]
    riverWidth: 724,                        // [Yd]
    riverPadding: 114,                      // [Zd]
    waterCurrent: 0.0011,                   // [jd]
    waveSpeed: 0.0001,                      // [$d]
    waveMax: 1.3,                           // [ef]
    treeScales: [150, 160, 165, 175],       // [tf]
    bushScales: [80, 85, 95],               // [nf]
    rockScales: [80, 85, 90],               // [of]

    // BIOME DATA:
    snowBiomeTop: 2400,                     // [sf]
    snowSpeed: 0.75,                        // [af]

    // DATA:
    maxNameLength: 15,                      // [lf]

    // MAP:
    mapScale: 14400,                        // [rf]
    secretPool: {                           // [cf]
        gorgeX0: -1500,
        gorgeHalf: 520,
        pool: [[-2500, 7200, 1150], [-3300, 6750, 750], [-3200, 7750, 700], [-1700, 6900, 600], [-1800, 7550, 600]],
        waterfall: {
            x: -3860,
            y: 7250,
            half: 210
        },
        shallows: {
            start: -1500,
            length: 320
        }
    },
    mapPingScale: 40,                       // [df]
    mapPingTime: 2200,                      // [ff]

    // ANIMAL TUNING:
    MAX_ATTACK: 0.6,                        // [uf]
    MAX_SPAWN_DELAY: 1,                     // [hf]
    MAX_SPEED: 0.3,                         // [xf]
    MAX_TURN_SPEED: 0.3,                    // [mf]
    DAY_INTERVAL: 1440000                   // [pf]
};

// -------------------------------------------------------------------------------------
// SERVER-ONLY TUNING (not part of the client bundle)
config.server = {
    // Trees / bushes are generated per area on an areaCount x areaCount grid; rocks and
    // gold are totals for the whole map.
    // Animals kept alive on the map (index: aiTypes index, desired: count).
    animalSpawnPlan: [
        { index: 0, desired: 10 },                          // Cow
        { index: 1, desired: 8 },                           // Pig
        { index: 12, desired: 6 },                          // Sheep
        { index: 2, desired: 5 },                           // Bull
        { index: 3, desired: 2 },                           // Bully
        { index: 4, desired: 6, area: "snow" },             // Wolf
        { index: 5, desired: 4, area: "river" },            // Quack
        { index: 9, desired: 4 },                           // Boar
        { index: 10, desired: 2, area: "snow" },            // Yeti
        { index: 6, desired: 1, positions: [{ xRatio: 0.5, yRatio: 0.93 }] },   // MOOSTAFA (desert)
        { index: 7, desired: 1, positions: [{ xRatio: 0.18, yRatio: 0.22 }] },  // Treasure
        { index: 8, desired: 1, positions: [{ xRatio: 0.78, yRatio: 0.08 }] },  // MOOFIE (snow)
        { index: 11, desired: 1, area: "secret", positions: [{ x: -2500, y: 7200 }] }  // Crab King (the only crab in the game)
    ],
    cactusDamage: 20,
    leaderboardRate: 1000,
    statsRate: 2000
};

// Legacy alias used by the old webpack client in client/.
config.isSandbox = config.inSandbox;

module.exports = config;
