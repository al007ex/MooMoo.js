// GAME
// One running game world (a "server" in the client's server picker). Owns the players,
// animals, objects and projectiles and sends the per-tick state with the packet layouts
// the official client expects.

import { createHash } from "node:crypto";
import { Player } from "./modules/player.js";
import { UTILS } from "./libs/utils.js";
import { config } from "./config.js";
import { ProjectileManager } from "./modules/projectileManager.js";
import { Projectile } from "./modules/projectile.js";
import { ObjectManager } from "./modules/objectManager.js";
import { GameObject } from "./modules/gameObject.js";
import { items } from "./modules/items.js";
import { AiManager } from "./modules/aiManager.js";
import { accessories, hats } from "./modules/store.js";
import { ClanManager } from "./modules/clanManager.js";
import { HAT, TAIL, EFFECT, hasTail, secretDistance } from "./modules/effects.js";
import { ANIMAL_KEYS, BOSS_KEYS } from "../api/store.js";

const CRAB_KING = 11;
const CRABLING = 14;
const COW = 0;
const ROLE_NUMBER = { mod: 1, admin: 2 };

export class Game {

    players = [];
    ais = [];
    projectiles = [];
    game_objects = [];

    constructor({ key, name, capacity, membersOnly, accounts, log }) {
        this.key = key;
        this.name = name;
        this.capacity = capacity;
        this.membersOnly = membersOnly;
        this.accounts = accounts;
        this.log = log || ((msg) => console.log(`[${key}] ${msg}`));
        this.playersById = new Map();
        this.sids = new Array(config.maxPlayersHard).fill(true);
        this.crabKillers = new Set();
        this.shutdownAt = 0;

        this.server = {
            broadcast: (type, ...data) => {
                for (const player of this.players) player.send(type, ...data);
            },
            send: (id, type, ...data) => {
                const player = this.playersById.get(id);
                if (player) player.send(type, ...data);
            }
        };

        this.scoreCallback = (player, amount) => {
            if (!player || !player.isPlayer) return;
            if (config.unlimitedResources && amount < 0) return;
            player.points += amount;
            player.send("N", "points", player.points, 1);
            if (amount > 0) {
                player.earnXP(amount);
                if (player.lifeStats) {
                    player.lifeStats.gold += amount;
                    player.lifeStats.score = Math.max(player.lifeStats.score, player.points);
                }
            }
        };

        this.iconCallback = (player) => this.onPlayerDeath(player);

        this.object_manager = new ObjectManager(GameObject, this.game_objects, UTILS, config, this.players, this.server);
        this.projectile_manager = new ProjectileManager(Projectile, this.projectiles, this.players, this.ais, this.object_manager, items, config, UTILS, this.server);
        this.clan_manager = new ClanManager(this.players, this.server);
        this.ai_manager = new AiManager(this.ais, this.players, items, this.object_manager, config, UTILS, this.scoreCallback, this.server, {
            onKill: (ai, doer) => this.onAnimalKilled(ai, doer),
            killScore: (ai, doer) => ai.index == COW && doer && hasTail(doer, TAIL.COW_CAPE) ? Math.round(ai.killScore * EFFECT.cowCapeMult) : ai.killScore,
            dropAmount: (ai, doer, amount) => ai.index == COW && hasTail(doer, TAIL.COW_CAPE) ? Math.round(amount * EFFECT.cowCapeMult) : amount,
            respawnAt: (ai) => ai.secret ? this.randomSecretPoint(ai.scale) : null
        });

        this.generateWorld();
        this.ensureAnimals();

        this.lastTick = Date.now();
        this.leaderboardTimer = 0;
        this.minimapTimer = 0;
        this.statsTimer = 0;
        this.spawnTimer = 0;
        this.interval = setInterval(() => this.tick(), 1000 / config.serverUpdateRate);
    }

    // ------------------------------------------------------------------ world
    generateWorld() {
        const cfg = config;
        const areaSize = cfg.mapScale / cfg.areaCount;
        const riverTop = cfg.mapScale / 2 - cfg.riverWidth / 2;
        const riverBottom = cfg.mapScale / 2 + cfg.riverWidth / 2;
        const pick = (list) => list[Math.floor(Math.random() * list.length)];
        const place = (x, y, scale, type, ignoreWater) => {
            if (!this.object_manager.checkItemLocation(x, y, scale, 0.6, null, ignoreWater)) return false;
            this.object_manager.add(this.game_objects.length, x, y, 0, scale, type, undefined, false, null);
            return true;
        };
        for (let ax = 0; ax < cfg.areaCount; ax++) {
            for (let ay = 0; ay < cfg.areaCount; ay++) {
                const left = ax * areaSize;
                const top = ay * areaSize;
                for (let placed = 0, tries = 0; placed < cfg.treesPerArea && tries < 200; tries++) {
                    const x = UTILS.randInt(left, left + areaSize);
                    const y = UTILS.randInt(top, top + areaSize);
                    if (y >= riverTop - 100 && y <= riverBottom + 100) continue;
                    if (y >= cfg.mapScale - cfg.snowBiomeTop) continue;
                    if (place(x, y, pick(cfg.treeScales), 0, false)) placed++;
                }
                for (let placed = 0, tries = 0; placed < cfg.bushesPerArea && tries < 200; tries++) {
                    const x = UTILS.randInt(left, left + areaSize);
                    const y = UTILS.randInt(top, top + areaSize);
                    if (y >= riverTop - 50 && y <= riverBottom + 50) continue;
                    if (place(x, y, pick(cfg.bushScales), 1, false)) placed++;
                }
            }
        }
        for (let placed = 0, tries = 0; placed < cfg.totalRocks && tries < 5000; tries++) {
            if (place(UTILS.randInt(0, cfg.mapScale), UTILS.randInt(0, cfg.mapScale), pick(cfg.rockScales), 2, true)) placed++;
        }
        for (let placed = 0, tries = 0; placed < cfg.goldOres && tries < 5000; tries++) {
            if (place(UTILS.randInt(0, cfg.mapScale), UTILS.randInt(0, cfg.mapScale), pick(cfg.rockScales), 3, true)) placed++;
        }
    }

    randomSecretPoint(scale) {
        const pools = config.secretPool.pool;
        for (let i = 0; i < 50; i++) {
            const p = pools[UTILS.randInt(0, pools.length - 1)];
            const a = Math.random() * Math.PI * 2;
            const r = Math.random() * (p[2] - scale);
            const x = p[0] + Math.cos(a) * r;
            const y = p[1] + Math.sin(a) * r;
            if (secretDistance(config, x + scale, y) <= 0) return { x, y };
        }
        return { x: pools[0][0], y: pools[0][1] };
    }

    animalPosition(plan) {
        const type = this.ai_manager.aiTypes[plan.index];
        if (plan.positions && plan.positions.length) {
            const pos = plan.positions[0];
            if (typeof pos.x === "number") return { x: pos.x, y: pos.y };
            return { x: Math.round(config.mapScale * pos.xRatio), y: Math.round(config.mapScale * pos.yRatio) };
        }
        if (plan.area === "secret") return this.randomSecretPoint(type.scale);
        for (let i = 0; i < 40; i++) {
            let x = UTILS.randInt(type.scale, config.mapScale - type.scale);
            let y = UTILS.randInt(type.scale, config.mapScale - type.scale);
            if (plan.area === "snow") y = UTILS.randInt(type.scale, config.snowBiomeTop - type.scale);
            if (plan.area === "river") y = UTILS.randInt(config.mapScale / 2 - config.riverWidth, config.mapScale / 2 + config.riverWidth);
            if (this.object_manager.checkItemLocation(x, y, type.scale, 0.6, null, true)) return { x, y };
        }
        return { x: UTILS.randInt(0, config.mapScale), y: UTILS.randInt(0, config.mapScale) };
    }

    ensureAnimals() {
        for (const plan of config.server.animalSpawnPlan) {
            const active = this.ais.filter(ai => ai.active && ai.index === plan.index && !ai.despawnOnDeath).length;
            for (let i = active; i < plan.desired; i++) {
                const pos = this.animalPosition(plan);
                const overrides = plan.index === CRAB_KING ? { spawnDelay: 10 * 60 * 1000 } : null;
                this.ai_manager.spawn(pos.x, pos.y, UTILS.randFloat(-Math.PI, Math.PI), plan.index, overrides);
            }
        }
    }

    onAnimalKilled(ai, doer) {
        if (!doer || !doer.isPlayer) return;
        const key = ANIMAL_KEYS[ai.index];
        const stats = doer.lifeStats;
        if (stats) {
            if (BOSS_KEYS.includes(key)) stats.bosses++;
            else stats.animals++;
            if (key) stats.animalKills[key] = (stats.animalKills[key] || 0) + 1;
        }
        if (ai.index === CRAB_KING) {
            const winners = new Set([doer]);
            for (const [player, damage] of ai.damageBy) {
                if (player.alive && damage >= ai.maxHealth * 0.05) winners.add(player);
            }
            for (const player of winners) {
                this.crabKillers.add(player.sid);
                if (player.lifeStats) player.lifeStats.bossKills++;
                if (!player.skins[HAT.CRAB_SHELL]) {
                    player.skins[HAT.CRAB_SHELL] = 1;
                    player.send("5", 0, HAT.CRAB_SHELL, 0);
                }
            }
            this.server.broadcast("6", -1, `${doer.name} defeated the Crab King!`);
        }
    }

    // ------------------------------------------------------------------ players
    addPlayer({ send, account, ip, id }) {
        const sid = this.sids.findIndex(free => free);
        if (sid < 0) return null;
        this.sids[sid] = false;
        id = id || UTILS.randomString(16);
        const player = new Player(id, sid, config, UTILS, this.projectile_manager, this.object_manager, this.players, this.ais, items, hats, accessories, this.server, this.scoreCallback, this.iconCallback);
        player.send = send;
        player.ip = ip;
        player.ipHash = createHash("sha256").update(String(ip)).digest("hex").slice(0, 12);
        player.connectedAt = Date.now();
        player.reports = 0;
        player.visiblePlayers = new Set();
        player.visibleAis = new Set();
        player.attrCache = new Map();
        if (account) {
            player.account = account;
            player.role = account.role || null;
            player.isMember = true;
            player.shadowed = account.verdict === "shadow";
            player.clanTag = account.clan || null;
            if (account.name) player.name = account.name;
        }
        this.players.push(player);
        this.playersById.set(id, player);
        player.send("A", { teams: this.clan_manager.list() });
        return player;
    }

    removePlayer(player) {
        const index = this.players.indexOf(player);
        if (index < 0) return;
        this.recordLife(player, false);
        this.clan_manager.leaveTribe(player);
        this.clan_manager.forget(player);
        this.object_manager.removeAllItems(player.sid, this.server);
        this.players.splice(index, 1);
        this.playersById.delete(player.id);
        this.sids[player.sid] = true;
        this.crabKillers.delete(player.sid);
        this.server.broadcast("E", player.id);
    }

    onPlayerDeath(player) {
        this.recordLife(player, true);
        this.leaderboardTimer = 0;
    }

    recordLife(player, died) {
        if (!player.lifeStats || !player.account || !this.accounts) {
            player.lifeStats = null;
            return;
        }
        const life = player.lifeStats;
        life.died = died;
        life.playtime = Date.now() - player.spawnedAt;
        player.lifeStats = null;
        if (!this.accounts.data.accounts[player.account.id]) return;
        if (player.account.verdict === "shadow") return;
        this.accounts.recordLife(player.account, life);
    }

    playerCount() {
        return this.players.length;
    }

    kickAccount(accountId, reason) {
        let kicked = 0;
        for (const player of this.players) {
            if (player.account && player.account.id === accountId && player.kick) {
                player.kick(reason);
                kicked++;
            }
        }
        return kicked;
    }

    setShadow(accountId, on) {
        for (const player of this.players) {
            if (player.account && player.account.id === accountId) player.shadowed = on;
        }
    }

    sessionOf(player) {
        return { at: player.connectedAt, server: this.key, ipHash: player.ipHash, reports: player.reports };
    }

    sessionFor(accountId) {
        const player = this.players.find(p => p.account && p.account.id === accountId);
        return player ? this.sessionOf(player) : null;
    }

    // Guests are looked up by the id staff get in the live stats packet ("F").
    playerBySession(id) {
        return this.playersById.get(id) || null;
    }

    // ------------------------------------------------------------------ loop
    tick() {
        const now = Date.now();
        const delta = now - this.lastTick;
        this.lastTick = now;

        for (const player of this.players) {
            player.chatCooldown -= delta;
            player.tribeCooldown -= delta;
            player.pingCooldown -= delta;
            if (player.alive) player.update(delta);
            if (player.anticheat) player.anticheat.tick(now);
        }
        for (const projectile of this.projectiles) projectile.update(delta);
        this.updateStructures(delta);
        for (const ai of this.ais) if (ai.active) ai.update(delta);

        this.spawnTimer -= delta;
        if (this.spawnTimer <= 0) {
            this.spawnTimer = 1000;
            this.ensureAnimals();
        }

        this.updateLeaders();

        this.leaderboardTimer -= delta;
        if (this.leaderboardTimer <= 0) {
            this.leaderboardTimer = config.server.leaderboardRate;
            this.sendLeaderboard();
        }

        this.minimapTimer -= delta;
        const sendMinimap = this.minimapTimer <= 0;
        if (sendMinimap) this.minimapTimer = config.minimapRate;

        this.statsTimer -= delta;
        const sendStats = this.statsTimer <= 0;
        if (sendStats) this.statsTimer = config.server.statsRate;

        for (const viewer of this.players) {
            this.syncPlayers(viewer);
            this.syncObjects(viewer);
            this.syncAnimals(viewer);
            if (sendMinimap) this.sendMinimap(viewer);
            if (sendStats && viewer.watchStats >= 0) this.sendStats(viewer, viewer.watchStats);
        }
    }

    updateLeaders() {
        let pointsLeader = null;
        let killLeader = null;
        for (const player of this.players) {
            player.isLeader = false;
            player.iconIndex = 0;
            if (!player.alive) continue;
            if (!pointsLeader || player.points > pointsLeader.points) pointsLeader = player;
            if (player.kills > 0 && (!killLeader || player.kills > killLeader.kills)) killLeader = player;
        }
        if (pointsLeader) pointsLeader.isLeader = true;
        if (killLeader) killLeader.iconIndex = 1;
    }

    // "a": [sid, x, y, dir*100] positions, [sid, buildIndex, weaponIndex, variant, team,
    // isLeader, skin, tail, icon, zIndex] attributes (only when changed), hidden sids.
    syncPlayers(viewer) {
        const positions = [];
        const attrs = [];
        const hidden = [];
        const visibleNow = new Set();
        for (const other of this.players) {
            if (!other.alive || !viewer.canSee(other)) continue;
            visibleNow.add(other.sid);
            if (!other.sentTo[viewer.id]) {
                other.sentTo[viewer.id] = true;
                viewer.attrCache.delete(other.sid);
                viewer.send("D", other.getData(), viewer === other);
                // SANDBOX_UNLIMITED: the client starts every life at zero, and only takes resource
                // updates once it knows its own player, so the full stock follows right here.
                if (viewer === other && config.unlimitedResources) {
                    for (const type of config.resourceTypes) viewer.send("N", type, viewer[type], 1);
                }
            }
            positions.push(other.sid, Math.round(other.x), Math.round(other.y), Math.round(other.dir * 100));
            const attr = [other.sid, other.buildIndex, other.weaponIndex, other.variant().id, other.team, other.isLeader ? 1 : 0, other.displaySkin(), other.tailIndex, other.iconIndex, other.zIndex];
            const key = attr.join(",");
            if (viewer.attrCache.get(other.sid) !== key) {
                viewer.attrCache.set(other.sid, key);
                attrs.push(...attr);
            }
        }
        for (const sid of viewer.visiblePlayers) {
            if (!visibleNow.has(sid)) hidden.push(sid);
        }
        viewer.visiblePlayers = visibleNow;
        viewer.send("a", positions, attrs, hidden);
    }

    // "H": objects in view that this viewer hasn't received yet (8 values each).
    syncObjects(viewer) {
        const fresh = [];
        for (const object of this.game_objects) {
            if (object.active && !object.sentTo[viewer.id] && object.visibleToPlayer(viewer) && viewer.canSee(object)) {
                object.sentTo[viewer.id] = true;
                fresh.push(object.sid, UTILS.fixTo(object.x, 1), UTILS.fixTo(object.y, 1), object.dir, object.scale, object.type, object.id, object.owner ? object.owner.sid : -1);
            }
        }
        if (fresh.length) viewer.send("H", fresh);
    }

    // "I": [sid, index, x, y, dir*100, health, nameIndex, state] + sids that left view.
    syncAnimals(viewer) {
        const list = [];
        const hidden = [];
        const visibleNow = new Set();
        for (const ai of this.ais) {
            if (!ai.active || ai.spawnCounter || !viewer.canSee(ai)) continue;
            visibleNow.add(ai.sid);
            list.push(ai.sid, ai.index, UTILS.fixTo(ai.x, 1), UTILS.fixTo(ai.y, 1), Math.round(ai.dir * 100), Math.round(ai.health), ai.nameIndex, ai.state || 0);
        }
        for (const sid of viewer.visibleAis) {
            if (!visibleNow.has(sid)) hidden.push(sid);
        }
        viewer.visibleAis = visibleNow;
        if (list.length || hidden.length) viewer.send("I", list, hidden);
    }

    // "7": tribe members (staff see everyone).
    sendMinimap(viewer) {
        if (!viewer.alive) return;
        const staff = Boolean(viewer.role);
        if (!viewer.team && !staff) return;
        const data = [];
        for (const other of this.players) {
            if (other === viewer || !other.alive) continue;
            if (staff || (viewer.team && other.team === viewer.team)) data.push(Math.round(other.x), Math.round(other.y));
        }
        viewer.send("7", data);
    }

    // "G": leaderboard.
    sendLeaderboard() {
        const ranked = this.players.filter(p => p.spawned).sort((a, b) => b.points - a.points);
        for (const viewer of this.players) {
            const list = ranked.filter(p => !p.shadowed || p === viewer || viewer.role).slice(0, 10);
            const entries = [];
            const roles = [];
            const dead = [];
            const crab = [];
            const clans = [];
            const tribes = [];
            for (const p of list) {
                entries.push(p.sid, p.name, Math.round(p.points));
                if (p.account) roles.push(p.sid, ROLE_NUMBER[p.role] || 0);
                if (!p.alive) dead.push(p.sid);
                if (this.crabKillers.has(p.sid)) crab.push(p.sid);
                if (p.clanTag) {
                    clans.push(p.sid, p.clanTag);
                    tribes.push(p.sid, p.team || "");
                }
            }
            viewer.send("G", entries, roles, dead, crab, clans, tribes);
        }
    }

    // "F": live stats of one player for the profile card ("V" selects whom).
    sendStats(viewer, sid) {
        const target = this.players.find(p => p.sid === sid);
        if (!target || !target.lifeStats) return;
        const s = target.lifeStats;
        // Staff looking at a guest also get the guest's session id for the staff panel.
        const staff = viewer.role === "mod" || viewer.role === "admin";
        const guestId = staff && !target.account ? target.id : null;
        viewer.send("F", sid, s.kills, s.wood, s.food, s.stone, s.gold, Math.round(s.damage), Math.round(s.animalDamage), Math.round(s.healing), s.animals, s.bosses, guestId, Math.round(s.score));
    }

    // Turrets and other updating structures.
    updateStructures(delta) {
        const structures = this.object_manager.updateObjects;
        for (let i = 0; i < structures.length; i++) {
            const structure = structures[i];
            if (!structure || !structure.active) continue;
            structure.update(delta);
            if (structure.projectile == null || !structure.shootRate || !structure.shootRange) continue;
            if (typeof structure.shootCount !== "number") structure.shootCount = structure.shootRate;
            structure.shootCount -= delta;
            if (structure.shootCount > 0) continue;
            const target = this.turretTarget(structure);
            if (!target) {
                structure.shootCount = Math.min(structure.shootRate, 250);
                continue;
            }
            const dir = UTILS.getDirection(target.x, target.y, structure.x, structure.y);
            structure.dir = dir;
            const data = items.projectiles[structure.projectile];
            this.projectile_manager.addProjectile(structure.x + Math.cos(dir) * (structure.scale + 45), structure.y + Math.sin(dir) * (structure.scale + 45), dir, structure.shootRange, data.speed || 1.6, structure.projectile, structure.owner, structure.sid, data.layer);
            structure.shootCount = structure.shootRate;
            for (const player of this.players) {
                if (structure.sentTo[player.id] && player.canSee(structure)) player.send("M", structure.sid, UTILS.fixTo(dir, 2));
            }
        }
    }

    turretTarget(structure) {
        const owner = structure.owner;
        let best = null;
        let bestDist = Infinity;
        const consider = (candidate) => {
            const dist = UTILS.getDistance(structure.x, structure.y, candidate.x, candidate.y);
            if (dist <= structure.shootRange + (candidate.scale || 0) && dist < bestDist) {
                best = candidate;
                bestDist = dist;
            }
        };
        for (const player of this.players) {
            if (!player.alive || player === owner) continue;
            if (player.skin && player.skin.antiTurret) continue;
            if (owner && owner.team && player.team === owner.team) continue;
            if (player.skin && player.skin.invisTimer && player.noMovTimer >= player.skin.invisTimer) continue;
            if (player.powers.invisible) continue;
            consider(player);
        }
        for (const ai of this.ais) {
            if (ai.active && ai.alive && !ai.spawnCounter && !ai.submerged) consider(ai);
        }
        return best;
    }

    // Graceful shutdown countdown ("Z": "Server restarting in m:ss").
    announceShutdown(seconds) {
        this.server.broadcast("Z", seconds);
    }

    // Last word before the server goes away: the client looks for another server
    // ("<server> has closed - switched you to ...").
    closeAll() {
        for (const player of [...this.players]) {
            if (player.kick) player.kick("Server is restarting - pick another");
        }
    }

    stop() {
        clearInterval(this.interval);
    }
}
