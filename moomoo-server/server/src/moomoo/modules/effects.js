// ACCESSORY EFFECTS + SECRET POOL GEOMETRY
// The client only ships descriptions for these accessories ("1 extra wood per hit on a
// tree", "25% less damage from projectiles", ...). The numbers live on the server, so
// they are implemented here, one place, keyed by accessory id.

export const TAIL = {
    SUPER_CAPE: 1,
    DRAGON_CAPE: 2,
    COOKIE_CAPE: 3,
    SKULL_CAPE: 4,
    DASH_CAPE: 5,
    WINTER_CAPE: 6,
    TROLL_CAPE: 7,
    COW_CAPE: 8,
    TREE_CAPE: 9,
    STONE_CAPE: 10,
    SNOWBALL: 12,
    THORNS: 14,
    BLOCKADES: 15,
    DEVILS_TAIL: 20
};

export const HAT = {
    SHAME: 45,
    EMP_HELMET: 22,
    TURRET_GEAR: 53,
    CRAB_SHELL: 61
};

export const EFFECT = {
    dragonCapeTime: 5000,       // "5% more damage for 5s after hitting a player"
    dragonCapeDamage: 1.05,
    superCapeTime: 10000,       // "after a kill: 5% more damage and 15% faster for 10s"
    superCapeDamage: 1.05,
    superCapeSpeed: 1.15,
    dashCapeSpeed: 1.05,        // "5% faster"
    blockadesProjectile: 0.75,  // "25% less damage from projectiles"
    cowCapeMult: 1.5,           // "1.5x gold and food from cows"
    skullCapeMult: 3,           // "3x gold for killing the kill leader"
    trollCapeMult: 2,           // "2x gold for kills by your spikes"
    thornsHeal: 0.05,           // "heals a little when you hit a player" (5% of the damage dealt)
    devilsTailDmg: 4,           // "hits make players bleed for 2s"
    devilsTailTime: 2,
    snowballSnowFactor: 0.5     // "half the snow slowdown"
};

export function hasTail(player, id) {
    return Boolean(player.tail && player.tail.id === id);
}

// Snow speed factor for this player (Winter Cap / Frost Helm / Winter Cape / Snowball).
export function snowFactor(player, config) {
    if (player.skin && player.skin.coldM) return 1;
    if (hasTail(player, TAIL.WINTER_CAPE)) return 1;
    if (hasTail(player, TAIL.SNOWBALL)) return 1 - (1 - config.snowSpeed) * EFFECT.snowballSnowFactor;
    return config.snowSpeed;
}

// Extra resource per gather hit: Tree Cape (trees), Stone Cape (rocks), Cookie Cape (bushes / cacti).
export function gatherBonus(player, objType) {
    if (objType === 0 && hasTail(player, TAIL.TREE_CAPE)) return 1;
    if (objType === 2 && hasTail(player, TAIL.STONE_CAPE)) return 1;
    if (objType === 1 && hasTail(player, TAIL.COOKIE_CAPE)) return 1;
    return 0;
}

// ------------------------------------------------------------------ secret pool
// [Xu] signed distance to the walkable secret area west of the map (<= 0 means inside).
export function secretDistance(config, x, y) {
    const z = config.secretPool;
    const mid = config.mapScale / 2;
    let n = -x;
    const band = Math.abs(y - mid) - z.gorgeHalf;
    if (x >= z.gorgeX0) n = Math.min(n, Math.max(band, 0));
    for (let i = 0; i < z.pool.length; i++) {
        const p = z.pool[i];
        n = Math.min(n, Math.hypot(x - p[0], y - p[1]) - p[2]);
    }
    if (Math.abs(y - z.waterfall.y) < z.waterfall.half + 60 && x < z.waterfall.x) {
        n = Math.min(n, Math.abs(y - z.waterfall.y) - z.waterfall.half);
    }
    return n;
}

// [ju] inside the water of one of the pools.
export function inSecretPool(config, x, y) {
    return config.secretPool.pool.some(p => Math.hypot(x - p[0], y - p[1]) <= p[2] * 0.9);
}

export function inSecretArea(config, x, y) {
    return x < 0 && secretDistance(config, x, y) <= 0;
}
