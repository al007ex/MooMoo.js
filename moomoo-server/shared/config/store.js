// STORE
// Hats and accessories, copied entry-for-entry (same order) from the official client
// bundle ([bu] = hats, [vu] = accessories). The store UI lists them in this order.
// Accessory effects that have no data field (Tree Cape, Cow Cape, Blockades, ...) are
// implemented server-side in server/src/moomoo/modules/effects.js.

// HATS:
module.exports.hats = [{
    id: 45,
    name: "Shame!",
    dontSell: true,
    price: 0,
    scale: 120,
    desc: "hacks are for losers"
}, {
    id: 51,
    name: "Moo Cap",
    price: 0,
    scale: 120,
    desc: "coolest mooer around"
}, {
    id: 50,
    name: "Apple Cap",
    price: 0,
    scale: 120,
    desc: "apple farms remembers"
}, {
    id: 28,
    name: "Moo Head",
    price: 0,
    scale: 120,
    desc: "no effect"
}, {
    id: 29,
    name: "Pig Head",
    price: 0,
    scale: 120,
    desc: "no effect"
}, {
    id: 30,
    name: "Fluff Head",
    price: 0,
    scale: 120,
    desc: "no effect"
}, {
    id: 36,
    name: "Pandou Head",
    price: 0,
    scale: 120,
    desc: "no effect"
}, {
    id: 37,
    name: "Bear Head",
    price: 0,
    scale: 120,
    desc: "no effect"
}, {
    id: 38,
    name: "Monkey Head",
    price: 0,
    scale: 120,
    desc: "no effect"
}, {
    id: 44,
    name: "Polar Head",
    price: 0,
    scale: 120,
    desc: "no effect"
}, {
    id: 35,
    name: "Fez Hat",
    price: 0,
    scale: 120,
    desc: "no effect"
}, {
    id: 42,
    name: "Enigma Hat",
    price: 0,
    scale: 120,
    desc: "join the enigma army"
}, {
    id: 43,
    name: "Blitz Hat",
    price: 0,
    scale: 120,
    desc: "hey everybody i'm blitz"
}, {
    id: 49,
    name: "Bob XIII Hat",
    price: 0,
    scale: 120,
    desc: "like and subscribe"
}, {
    id: 57,
    name: "Pumpkin",
    price: 50,
    scale: 120,
    desc: "Spooooky"
}, {
    id: 8,
    name: "Bummle Hat",
    price: 100,
    scale: 120,
    desc: "no effect"
}, {
    id: 2,
    name: "Straw Hat",
    price: 500,
    scale: 120,
    desc: "no effect"
}, {
    id: 15,
    name: "Winter Cap",
    price: 600,
    scale: 120,
    desc: "allows you to move at normal speed in snow",
    coldM: 1
}, {
    id: 5,
    name: "Cowboy Hat",
    price: 1000,
    scale: 120,
    desc: "no effect"
}, {
    id: 4,
    name: "Ranger Hat",
    price: 2000,
    scale: 120,
    desc: "no effect"
}, {
    id: 18,
    name: "Explorer Hat",
    price: 2000,
    scale: 120,
    desc: "no effect"
}, {
    id: 31,
    name: "Flipper Hat",
    price: 2500,
    scale: 120,
    desc: "have more control while in water",
    watrImm: true
}, {
    id: 1,
    name: "Marksman Cap",
    price: 3000,
    scale: 120,
    desc: "increases arrow speed and range",
    aMlt: 1.3
}, {
    id: 10,
    name: "Bush Gear",
    price: 3000,
    scale: 160,
    desc: "allows you to disguise yourself as a bush"
}, {
    id: 48,
    name: "Halo",
    price: 3000,
    scale: 120,
    desc: "no effect"
}, {
    id: 6,
    name: "Soldier Helmet",
    price: 4000,
    scale: 120,
    desc: "reduces damage taken but slows movement",
    spdMult: 0.94,
    dmgMult: 0.75
}, {
    id: 59,
    name: "Scout Hat",
    price: 3500,
    scale: 120,
    desc: "move faster but take more damage",
    spdMult: 1.08,
    dmgMult: 1.12
}, {
    id: 23,
    name: "Anti Venom Gear",
    price: 4000,
    scale: 120,
    desc: "makes you immune to poison",
    poisonRes: 1
}, {
    id: 13,
    name: "Medic Gear",
    price: 5000,
    scale: 110,
    desc: "slowly regenerates health over time",
    healthRegen: 3
}, {
    id: 9,
    name: "Miners Helmet",
    price: 5000,
    scale: 120,
    desc: "earn 1 extra gold per resource",
    extraGold: 1
}, {
    id: 32,
    name: "Musketeer Hat",
    price: 5000,
    scale: 120,
    desc: "reduces cost of projectiles",
    projCost: 0.5
}, {
    id: 7,
    name: "Bull Helmet",
    price: 6000,
    scale: 120,
    desc: "increases damage done but drains health",
    healthRegen: -5,
    dmgMultO: 1.5,
    spdMult: 0.96
}, {
    id: 22,
    name: "Emp Helmet",
    price: 6000,
    scale: 120,
    desc: "turrets won't attack but you move slower",
    antiTurret: 1,
    spdMult: 0.7
}, {
    id: 12,
    name: "Booster Hat",
    price: 6000,
    scale: 120,
    desc: "increases your movement speed",
    spdMult: 1.16
}, {
    id: 26,
    name: "Barbarian Armor",
    price: 8000,
    scale: 120,
    desc: "knocks back enemies that attack you",
    dmgK: 0.6
}, {
    id: 60,
    name: "Frost Helm",
    price: 7000,
    scale: 120,
    desc: "normal speed in snow and reduces damage taken",
    coldM: 1,
    spdMult: 0.94,
    dmgMult: 0.88
}, {
    id: 61,
    name: "Crab Shell",
    dontSell: true,
    earned: true,
    price: 0,
    scale: 120,
    desc: "dropped by the Crab King. reflects damage and reduces damage taken",
    dmg: 0.3,
    dmgMult: 0.85,
    spdMult: 0.92
}, {
    id: 21,
    name: "Plague Mask",
    price: 10000,
    scale: 120,
    desc: "melee attacks deal poison damage",
    poisonDmg: 5,
    poisonTime: 6
}, {
    id: 46,
    name: "Bull Mask",
    price: 10000,
    scale: 120,
    desc: "bulls won't target you unless you attack them",
    bullRepel: 1
}, {
    id: 14,
    name: "Windmill Hat",
    topSprite: true,
    price: 10000,
    scale: 120,
    desc: "generates points while worn",
    pps: 1.5
}, {
    id: 11,
    name: "Spike Gear",
    topSprite: true,
    price: 10000,
    scale: 120,
    desc: "deal damage to players that damage you",
    dmg: 0.45
}, {
    id: 53,
    name: "Turret Gear",
    topSprite: true,
    price: 10000,
    scale: 120,
    desc: "you become a walking turret",
    turret: {"proj":1,"range":700,"rate":2500},
    spdMult: 0.7
}, {
    id: 20,
    name: "Samurai Armor",
    price: 12000,
    scale: 120,
    desc: "increased attack speed and fire rate",
    atkSpd: 0.78
}, {
    id: 58,
    name: "Dark Knight",
    price: 12000,
    scale: 120,
    desc: "restores health when you deal damage",
    healD: 0.4
}, {
    id: 27,
    name: "Scavenger Gear",
    price: 15000,
    scale: 120,
    desc: "earn double points for each kill",
    kScrM: 2
}, {
    id: 40,
    name: "Tank Gear",
    price: 15000,
    scale: 120,
    desc: "increased damage to buildings but slower movement",
    spdMult: 0.3,
    bDmg: 3.3
}, {
    id: 52,
    name: "Thief Gear",
    price: 15000,
    scale: 120,
    desc: "steal half of a players gold when you kill them",
    goldSteal: 0.5
}, {
    id: 55,
    name: "Bloodthirster",
    price: 20000,
    scale: 120,
    desc: "Restore Health when dealing damage. And increased damage",
    healD: 0.25,
    dmgMultO: 1.2
}, {
    id: 56,
    name: "Assassin Gear",
    price: 20000,
    scale: 120,
    desc: "Go invisible when not moving. Can't eat. Increased speed",
    noEat: true,
    spdMult: 1.1,
    invisTimer: 1000
}];

// ACCESSORIES:
module.exports.accessories = [{
    id: 12,
    name: "Snowball",
    price: 1000,
    scale: 105,
    xOff: 18,
    desc: "half the snow slowdown"
}, {
    id: 9,
    name: "Tree Cape",
    price: 1000,
    scale: 90,
    desc: "1 extra wood per hit on a tree"
}, {
    id: 10,
    name: "Stone Cape",
    price: 1000,
    scale: 90,
    desc: "1 extra stone per hit on a rock"
}, {
    id: 3,
    name: "Cookie Cape",
    price: 1500,
    scale: 90,
    desc: "1 extra food per hit on a bush or cactus"
}, {
    id: 8,
    name: "Cow Cape",
    price: 2000,
    scale: 90,
    desc: "1.5x gold and food from cows"
}, {
    id: 11,
    name: "Monkey Tail",
    price: 2000,
    scale: 97,
    xOff: 25,
    desc: "Super speed but reduced damage",
    spdMult: 1.35,
    dmgMultO: 0.2
}, {
    id: 17,
    name: "Apple Basket",
    price: 3000,
    scale: 80,
    xOff: 12,
    desc: "slowly regenerates health over time",
    healthRegen: 1
}, {
    id: 6,
    name: "Winter Cape",
    price: 3000,
    scale: 90,
    desc: "no snow slowdown"
}, {
    id: 4,
    name: "Skull Cape",
    price: 4000,
    scale: 90,
    desc: "3x gold for killing the kill leader"
}, {
    id: 5,
    name: "Dash Cape",
    price: 5000,
    scale: 90,
    desc: "5% faster"
}, {
    id: 2,
    name: "Dragon Cape",
    price: 6000,
    scale: 90,
    desc: "5% more damage for 5s after hitting a player"
}, {
    id: 1,
    name: "Super Cape",
    price: 8000,
    scale: 90,
    desc: "after a kill: 5% more damage and 15% faster for 10s"
}, {
    id: 7,
    name: "Troll Cape",
    price: 8000,
    scale: 90,
    desc: "2x gold for kills by your spikes"
}, {
    id: 14,
    name: "Thorns",
    price: 10000,
    scale: 115,
    xOff: 20,
    desc: "heals a little when you hit a player"
}, {
    id: 15,
    name: "Blockades",
    price: 10000,
    scale: 95,
    xOff: 15,
    desc: "25% less damage from projectiles"
}, {
    id: 20,
    name: "Devils Tail",
    price: 10000,
    scale: 95,
    xOff: 20,
    desc: "hits make players bleed for 2s"
}, {
    id: 16,
    name: "Sawblade",
    price: 12000,
    scale: 90,
    spin: true,
    xOff: 0,
    desc: "deal damage to players that damage you",
    dmg: 0.15
}, {
    id: 13,
    name: "Angel Wings",
    price: 15000,
    scale: 138,
    xOff: 22,
    desc: "slowly regenerates health over time",
    healthRegen: 3
}, {
    id: 19,
    name: "Shadow Wings",
    price: 15000,
    scale: 138,
    xOff: 22,
    desc: "increased movement speed",
    spdMult: 1.1
}, {
    id: 18,
    name: "Blood Wings",
    price: 20000,
    scale: 178,
    xOff: 26,
    desc: "restores health when you deal damage",
    healD: 0.2
}, {
    id: 21,
    name: "Corrupt X Wings",
    price: 20000,
    scale: 178,
    xOff: 26,
    desc: "deal damage to players that damage you",
    dmg: 0.25
}];
