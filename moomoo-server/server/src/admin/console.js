// ADMIN CONSOLE
// Text commands for the server owner, e.g. "tp me falls", "spawn yeti 3 near alex",
// "bossfight crab me", "boss crab attack charge". Reached through POST /admin/console
// (local token, see tools/console.mjs) so it works while you are playing.

import fs from "node:fs";
import path from "node:path";
import { config } from "../moomoo/config.js";
import { items } from "../moomoo/modules/items.js";
import { hats, accessories } from "../moomoo/modules/store.js";
import { AI_TYPES } from "../moomoo/modules/aiManager.js";
import { secretDistance, inSecretPool } from "../moomoo/modules/effects.js";

const norm = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const MID = config.mapScale / 2;

const ANIMAL_ALIASES = {
    cow: 0, cows: 0, pig: 1, pigs: 1, bull: 2, bulls: 2, bully: 3, bullies: 3, wolf: 4, wolves: 4,
    quack: 5, duck: 5, ducks: 5, chicken: 5, moostafa: 6, treasure: 7, chest: 7, crate: 7, moofie: 8,
    boar: 9, boars: 9, yeti: 10, yetis: 10, crab: 11, crabking: 11, king: 11, crab_king: 11, sheep: 12
};
const BOSSES = { crab: 11, crabking: 11, king: 11, moostafa: 6, moofie: 8, treasure: 7 };
// "Crab" and "Crabling" sit in the client's animal table but never appear in the game;
// the Crab King is the only crab.
const UNUSED_TYPES = [13, 14];
const VARIANTS = { normal: 0, none: 0, gold: 1, diamond: 2, ruby: 3, emerald: 4 };
const RESOURCES = { wood: 0, food: 1, stone: 2, gold: 3, points: 3 };

function places() {
    const plan = (index) => config.server.animalSpawnPlan.find(p => p.index === index);
    const fixed = (index) => {
        const p = plan(index) && plan(index).positions && plan(index).positions[0];
        if (!p) return null;
        return typeof p.x === "number" ? { x: p.x, y: p.y } : { x: config.mapScale * p.xRatio, y: config.mapScale * p.yRatio };
    };
    const list = {
        centre: { x: MID, y: MID - 600, about: "middle of the map, just north of the river" },
        river: { x: MID, y: MID, about: "in the river (current pushes you east)" },
        snow: { x: MID, y: 1200, about: "snow biome (top)" },
        desert: { x: MID, y: config.mapScale - 1200, about: "desert biome (bottom), cacti" },
        gorge: { x: -500, y: MID, about: "secret gorge west of the map edge (river level)" },
        falls: { x: -900, y: MID - 440, about: "\"The Falls\" from the official admin panel" },
        pool: { x: -1750, y: 6950, about: "secret pools (the Crab King's home)" },
        lair: { x: -1900, y: 7200, about: "edge of the Crab King's pool" },
        waterfall: { x: -3600, y: 7250, about: "waterfall at the far west end" },
        nw: { x: 800, y: 800, about: "north-west corner" },
        ne: { x: config.mapScale - 800, y: 800, about: "north-east corner" },
        sw: { x: 800, y: config.mapScale - 800, about: "south-west corner" },
        se: { x: config.mapScale - 800, y: config.mapScale - 800, about: "south-east corner" }
    };
    const m = fixed(6), f = fixed(8), t = fixed(7);
    if (m) list.moostafa = { x: m.x + 400, y: m.y, about: "MOOSTAFA's spawn" };
    if (f) list.moofie = { x: f.x + 400, y: f.y, about: "MOOFIE's spawn" };
    if (t) list.treasure = { x: t.x + 300, y: t.y, about: "Treasure chest spawn" };
    return list;
}

function areaOf(x, y) {
    if (x < 0) return inSecretPool(config, x, y) ? "secret pool" : "secret gorge";
    if (y <= config.snowBiomeTop) return "snow";
    if (y >= config.mapScale - config.snowBiomeTop) return "desert";
    if (Math.abs(y - MID) <= config.riverWidth / 2) return "river";
    return "grassland";
}

const r = Math.round;
const DISPLAY = ["Cow", "Pig", "Bull", "Bully", "Wolf", "Quack", "MOOSTAFA", "Treasure", "MOOFIE", "Boar", "Yeti", "Crab King", "Sheep", "Crab", "Crabling"];
const label = (index) => DISPLAY[index] || (AI_TYPES[index] && (label(index))) || String(index);

export class AdminConsole {

    constructor({ games, accounts, moderation, build, dataDir, log, social, baseUrl }) {
        this.games = games;
        this.accounts = accounts;
        this.moderation = moderation;
        this.build = build;
        this.log = log;
        this.social = social;
        this.baseUrl = baseUrl;
        this.stateFile = path.join(dataDir, "console.json");
        this.state = { me: null };
        try {
            Object.assign(this.state, JSON.parse(fs.readFileSync(this.stateFile, "utf8")));
        } catch {}
        this.commands = this.defineCommands();
    }

    saveState() {
        fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
    }

    // ---------------------------------------------------------------- lookups
    allPlayers() {
        const out = [];
        for (const game of this.games.values()) for (const player of game.players) out.push({ game, player });
        return out;
    }

    findPlayer(query, { needAlive = true } = {}) {
        if (query === undefined) throw new Error("which player? (name, #sid or \"me\")");
        let q = String(query);
        const everyone = this.allPlayers().filter(e => e.player.spawned);
        if (norm(q) === "me") {
            if (this.state.me) q = this.state.me;
            else {
                const humans = everyone.filter(e => e.player.alive);
                if (humans.length === 1) return humans[0];
                throw new Error("I don't know who \"me\" is yet - run: me <your in-game name>");
            }
        }
        let found = null;
        const sid = /^#?(\d+)$/.exec(q);
        if (sid) found = everyone.find(e => e.player.sid === Number(sid[1]));
        if (!found) found = everyone.find(e => e.player.name.toLowerCase() === q.toLowerCase());
        if (!found) found = everyone.find(e => norm(e.player.name).startsWith(norm(q)));
        if (!found) throw new Error(`no player "${q}" online (try: players)`);
        if (needAlive && !found.player.alive) throw new Error(`${found.player.name} is dead - they need to respawn first`);
        return found;
    }

    animalIndex(name) {
        const key = norm(name);
        let index;
        if (key in ANIMAL_ALIASES) index = ANIMAL_ALIASES[key];
        else if (/^\d+$/.test(key) && AI_TYPES[Number(key)]) index = Number(key);
        else index = AI_TYPES.findIndex(t => norm(t.name || t.src) === key || norm(t.src).startsWith(key));
        if (UNUSED_TYPES.includes(index)) throw new Error(`${label(index)}s aren't in the game - the Crab King is the only crab`);
        if (index >= 0) return index;
        throw new Error(`unknown animal "${name}" (try: animals list)`);
    }

    findBoss(game, index) {
        return game.ais.find(ai => ai.active && ai.index === index && !ai.despawnOnDeath) || null;
    }

    // Resolves "falls", "x y", "<player>", "mob <animal>" into a point.
    resolvePoint(args) {
        if (!args.length) throw new Error("where? (place, x y, player, or mob <animal>)");
        if (args.length >= 2 && !isNaN(Number(args[0])) && !isNaN(Number(args[1]))) {
            return { point: { x: Number(args[0]), y: Number(args[1]) }, label: `${args[0]}, ${args[1]}` };
        }
        const word = norm(args[0]);
        if (word === "mob" || word === "animal" || word === "boss") {
            const index = this.animalIndex(args.slice(1).join(" "));
            for (const game of this.games.values()) {
                const mob = game.ais.find(ai => ai.active && ai.index === index && !ai.spawnCounter);
                if (mob) return { point: { x: mob.x + mob.scale + 120, y: mob.y }, label: label(index), game };
            }
            throw new Error(`no ${label(index)} is alive right now`);
        }
        const list = places();
        if (list[word]) return { point: list[word], label: word };
        const { game, player } = this.findPlayer(args.join(" "));
        return { point: { x: player.x + player.scale * 2.5, y: player.y }, label: player.name, game };
    }

    teleport(player, point) {
        player.x = point.x;
        player.y = point.y;
        player.xVel = 0;
        player.yVel = 0;
    }

    named(list, query, what) {
        const q = norm(query);
        const entry = list.find(x => norm(x.name) === q) || list.find(x => norm(x.name).startsWith(q)) || list.find(x => String(x.id) === String(query));
        if (!entry) throw new Error(`unknown ${what} "${query}"`);
        return entry;
    }

    // ---------------------------------------------------------------- run
    execute(line) {
        const args = String(line || "").trim().split(/\s+/).filter(Boolean);
        if (!args.length) return ["(empty command - try: help)"];
        const name = args.shift().toLowerCase();
        const command = this.commands[name] || Object.values(this.commands).find(c => c.aliases && c.aliases.includes(name));
        if (!command) return [`unknown command "${name}" - try: help`];
        try {
            const out = command.run(args);
            const lines = Array.isArray(out) ? out : [out];
            this.log(`[console] ${line} -> ${lines[0]}`);
            return lines;
        } catch (error) {
            return [`error: ${error.message}`];
        }
    }

    // ---------------------------------------------------------------- commands
    defineCommands() {
        const C = {};
        const add = (name, usage, about, run, aliases) => (C[name] = { usage, about, run, aliases });

        add("help", "help [command]", "list commands", (a) => {
            if (a[0] && C[a[0]]) return [`${C[a[0]].usage}  -  ${C[a[0]].about}`];
            return Object.values(C).map(c => `${c.usage.padEnd(46)} ${c.about}`);
        });

        add("me", "me <name>", "tell the console which player is you (\"me\" in other commands)", (a) => {
            if (!a.length) return [`"me" is ${this.state.me || "not set"}`];
            this.state.me = a.join(" ");
            this.saveState();
            return [`"me" is now ${this.state.me}`];
        });

        add("status", "status", "build, servers and player counts", () => [
            `protocol build ${this.build.BUILD_ID} (${this.build.publicPath})`,
            ...[...this.games.values()].map(g => `server ${g.key}${g.membersOnly ? " (members only)" : ""}: ${g.players.length}/${g.capacity} players, ${g.ais.filter(a => a.active && !a.spawnCounter).length} animals`)
        ]);

        add("players", "players", "everyone online with position and stats", () => {
            const list = this.allPlayers();
            if (!list.length) return ["nobody is online"];
            return list.map(({ game, player: p }) => `#${p.sid} ${p.name.padEnd(15)} [${game.key}] ${p.alive ? `alive at ${r(p.x)}, ${r(p.y)} (${areaOf(p.x, p.y)}) age ${p.age} hp ${r(p.health)}/${p.maxHealth} gold ${r(p.points)} kills ${p.kills}` : (p.spawned ? "dead" : "in menu")}${p.account ? " - signed in" + (p.role ? " (" + p.role + ")" : "") : " - guest"}${p.flagged ? " - FLAGGED" : ""}`);
        }, ["who", "list"]);

        add("where", "where <player>", "position and biome of a player", (a) => {
            const { game, player } = this.findPlayer(a.join(" "));
            return [`${player.name} is at ${r(player.x)}, ${r(player.y)} (${areaOf(player.x, player.y)}) on ${game.key}`];
        }, ["pos"]);

        add("places", "places", "named locations for tp / spawn", () =>
            Object.entries(places()).map(([k, v]) => `${k.padEnd(10)} ${r(v.x)}, ${r(v.y)}  ${v.about}`));

        add("tp", "tp <player> <place | x y | player | mob <animal>>", "teleport a player", (a) => {
            const { player } = this.findPlayer(a[0]);
            const target = this.resolvePoint(a.slice(1));
            this.teleport(player, target.point);
            return [`teleported ${player.name} to ${target.label} (${r(target.point.x)}, ${r(target.point.y)})`];
        }, ["teleport", "goto"]);

        add("bring", "bring <player> [to <player>]", "pull a player to you (or someone else)", (a) => {
            const toIdx = a.findIndex(x => x.toLowerCase() === "to");
            const who = toIdx >= 0 ? a.slice(0, toIdx).join(" ") : a.join(" ");
            const dest = toIdx >= 0 ? a.slice(toIdx + 1).join(" ") : "me";
            const { player } = this.findPlayer(who);
            const { player: target } = this.findPlayer(dest);
            this.teleport(player, { x: target.x + target.scale * 2.5, y: target.y });
            return [`brought ${player.name} to ${target.name}`];
        }, ["summon"]);

        add("spawn", "spawn <animal> [count] [near <player> | at <place|x y>]", "spawn animals (they don't respawn)", (a) => {
            const index = this.animalIndex(a[0]);
            if (index === 11) throw new Error("there is only one Crab King - use: bossfight crab me (or: boss crab spawn)");
            let count = 1;
            let rest = a.slice(1);
            if (rest[0] && /^\d+$/.test(rest[0])) {
                count = Math.min(30, Number(rest[0]));
                rest = rest.slice(1);
            }
            let game = null;
            let center = null;
            if (!rest.length || norm(rest[0]) === "near") {
                const found = this.findPlayer(rest.length ? rest.slice(1).join(" ") : "me");
                game = found.game;
                const p = found.player;
                center = { x: p.x + Math.cos(p.dir) * (300 + AI_TYPES[index].scale), y: p.y + Math.sin(p.dir) * (300 + AI_TYPES[index].scale) };
            } else {
                const target = this.resolvePoint(norm(rest[0]) === "at" ? rest.slice(1) : rest);
                center = target.point;
                game = target.game;
                if (!game) {
                    try {
                        game = this.findPlayer("me", { needAlive: false }).game;
                    } catch {
                        game = [...this.games.values()][0];
                    }
                }
            }
            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2;
                const spread = count > 1 ? AI_TYPES[index].scale * 2 : 0;
                game.ai_manager.spawn(center.x + Math.cos(angle) * spread, center.y + Math.sin(angle) * spread, Math.random() * Math.PI * 2, index, { despawnOnDeath: true, waitCount: 0 });
            }
            return [`spawned ${count} ${label(index)} on ${game.key} at ${r(center.x)}, ${r(center.y)}`];
        });

        add("animals", "animals [list | <server>]", "animal types, or the bosses/animals alive now", (a) => {
            if (norm(a[0]) === "list") return AI_TYPES.map((t, i) => [t, i]).filter(([, i]) => !UNUSED_TYPES.includes(i)).map(([t, i]) => `${String(i).padStart(2)} ${label(i).padEnd(10)} hp ${t.health}${t.boss ? " BOSS" : ""}${t.hostile ? " hostile" : ""}`);
            const out = [];
            for (const game of this.games.values()) {
                if (a[0] && game.key.toLowerCase() !== a[0].toLowerCase()) continue;
                const counts = {};
                for (const ai of game.ais) if (ai.active) counts[ai.index] = (counts[ai.index] || 0) + 1;
                out.push(`${game.key}: ` + Object.entries(counts).map(([i, n]) => `${label(i)} x${n}`).join(", "));
                for (const ai of game.ais) {
                    if (ai.active && (ai.boss || [6, 7, 8].includes(ai.index))) {
                        out.push(`   ${label(ai.index).padEnd(10)} ${ai.spawnCounter ? `respawning in ${r(ai.spawnCounter / 1000)}s` : `at ${r(ai.x)}, ${r(ai.y)} hp ${r(ai.health)}/${ai.maxHealth}`}`);
                    }
                }
            }
            return out;
        }, ["mobs"]);

        add("clear", "clear <animal | spawned | all> [server]", "remove animals (natural ones respawn)", (a) => {
            const what = norm(a[0]);
            let removed = 0;
            for (const game of this.games.values()) {
                if (a[1] && game.key.toLowerCase() !== a[1].toLowerCase()) continue;
                for (const ai of game.ais) {
                    if (!ai.active) continue;
                    const match = what === "all" || (what === "spawned" && ai.despawnOnDeath) || (what !== "all" && what !== "spawned" && ai.index === this.animalIndex(a[0]));
                    if (!match) continue;
                    ai.active = false;
                    ai.alive = false;
                    removed++;
                }
            }
            return [`removed ${removed} animals`];
        });

        // ---------------- bosses
        add("boss", "boss <crab|moostafa|moofie|treasure> <status|spawn|tp <player>|hp <percent>|attack <slam|geysers|claw|dive>>", "control a boss", (a) => {
            const index = BOSSES[norm(a[0])];
            if (index === undefined) throw new Error("bosses: crab, moostafa, moofie, treasure");
            const action = norm(a[1] || "status");
            const lines = [];
            // act on the server "me" is on (or every server if nobody is known)
            let scope = [...this.games.values()];
            try {
                scope = [this.findPlayer(action === "tp" ? (a.slice(2).join(" ") || "me") : "me", { needAlive: false }).game];
            } catch {}
            for (const game of scope) {
                let boss = this.findBoss(game, index);
                if (action === "spawn" || action === "reset" || action === "start") {
                    if (!boss) {
                        const plan = config.server.animalSpawnPlan.find(p => p.index === index);
                        const pos = game.animalPosition(plan || { index });
                        boss = game.ai_manager.spawn(pos.x, pos.y, 0, index, index === 11 ? { spawnDelay: 600000 } : null);
                    }
                    boss.spawnCounter = 0;
                    boss.health = boss.maxHealth;
                    if (boss.startX != null) {
                        boss.x = boss.startX;
                        boss.y = boss.startY;
                    } else if (boss.x < -100000) {
                        const pos = game.animalPosition({ index, area: boss.secret ? "secret" : undefined });
                        boss.x = pos.x;
                        boss.y = pos.y;
                    }
                    lines.push(`${game.key}: ${boss.name} is up at ${r(boss.x)}, ${r(boss.y)} with full health`);
                    continue;
                }
                if (!boss) {
                    lines.push(`${game.key}: no ${AI_TYPES[index].name} (run: boss ${a[0]} spawn)`);
                    continue;
                }
                if (action === "status") {
                    lines.push(`${game.key}: ${boss.name} ${boss.spawnCounter ? `respawns in ${r(boss.spawnCounter / 1000)}s` : `at ${r(boss.x)}, ${r(boss.y)} hp ${r(boss.health)}/${boss.maxHealth}${boss.state ? " (state " + boss.state + ")" : ""}`}`);
                } else if (action === "hp") {
                    const pct = Math.max(1, Math.min(100, Number(a[2])));
                    if (isNaN(pct)) throw new Error("boss <name> hp <1-100>");
                    boss.health = Math.round(boss.maxHealth * pct / 100);
                    lines.push(`${game.key}: ${boss.name} set to ${pct}% (${boss.health} hp)`);
                } else if (action === "attack") {
                    if (index !== 11) throw new Error("only the Crab King has scripted attacks");
                    const move = { strike: "geysers", geyser: "geysers", charge: "claw", claws: "claw" }[norm(a[2])] || norm(a[2]);
                    if (!["slam", "geysers", "claw", "dive"].includes(move)) throw new Error("attacks: slam, geysers, claw, dive");
                    boss.nextAttack = move;
                    boss.bossAttack = null;
                    lines.push(`${game.key}: Crab King will ${move} next (needs a player in the secret pool)`);
                } else if (action === "tp") {
                    const { player } = this.findPlayer(a.slice(2).join(" ") || "me");
                    if (boss.spawnCounter) throw new Error(`${boss.name} is respawning - run: boss ${a[0]} spawn`);
                    this.teleport(player, { x: boss.x + boss.scale + 260, y: boss.y });
                    lines.push(`teleported ${player.name} next to ${boss.name}`);
                } else {
                    throw new Error("actions: status, spawn, tp <player>, hp <percent>, attack <slam|geysers|claw|dive>");
                }
            }
            return lines;
        });

        add("bossfight", "bossfight <crab|moostafa|moofie|treasure> [player] [god]", "respawn a boss at full health and drop a player next to it", (a) => {
            const who = a[1] && norm(a[1]) !== "god" ? a[1] : "me";
            const { game, player } = this.findPlayer(who);
            const index = BOSSES[norm(a[0])];
            if (index === undefined) throw new Error("bosses: crab, moostafa, moofie, treasure");
            const lines = this.commands.boss.run([a[0], "spawn"]).filter(l => l.startsWith(game.key));
            const boss = this.findBoss(game, index);
            this.teleport(player, { x: boss.x + boss.scale + (index === 11 ? 420 : 300), y: boss.y });
            if (a.some(x => norm(x) === "god")) player.powers.god = 1;
            lines.push(`${player.name} is in the arena${player.powers.god ? " (god mode)" : ""} - good luck!`);
            return lines;
        }, ["fight"]);

        add("bossmode", "bossmode <player> [on|off]", "turn a player into a raid boss (boss bar for everyone else)", (a) => {
            const { game, player } = this.findPlayer(a[0]);
            const on = norm(a[1] || "on") !== "off";
            player.powers.boss = on ? 1 : 0;
            player.powers.aura = on ? 1 : 0;
            player.powers.size = on ? 2 : 1;
            player.powers.health = on ? 20 : 1;
            player.powers.power = on ? 2 : 1;
            player.applyPowers();
            this.resend(game, player);
            return [`${player.name} is ${on ? "now a raid boss (2x size, 20x health, aura)" : "back to normal"}`];
        });

        // ---------------- player powers
        const power = (key, label) => (a) => {
            const { game, player } = this.findPlayer(a[0]);
            const on = norm(a[1] || "on") !== "off";
            player.powers[key] = on ? 1 : 0;
            if (key === "godlike") {
                player.powers.god = player.powers.aura = on ? 1 : 0;
            }
            this.resend(game, player);
            return [`${label} ${on ? "on" : "off"} for ${player.name}`];
        };
        add("god", "god <player> [on|off]", "no damage", power("god", "god mode"));
        add("godlike", "godlike <player> [on|off]", "god mode + aura", power("godlike", "godlike"));
        add("aura", "aura <player> [on|off]", "glowing aura (hidden client feature)", power("aura", "aura"));
        add("invisible", "invisible <player> [on|off]", "hidden from non-staff players", power("invisible", "invisibility"), ["invis"]);

        const mult = (key, allowed) => (a) => {
            const { game, player } = this.findPlayer(a[0]);
            const value = Number(a[1] || 1);
            if (!(value > 0 && value <= allowed)) throw new Error(`${key} must be between 0 and ${allowed}`);
            player.powers[key] = value;
            player.applyPowers();
            this.resend(game, player);
            return [`${player.name} ${key} x${value}`];
        };
        add("size", "size <player> <x>", "player size multiplier", mult("size", 5));
        add("speed", "speed <player> <x>", "movement speed multiplier", mult("speed", 20));
        add("damage", "damage <player> <x>", "damage multiplier", mult("power", 100), ["power"]);
        add("maxhealth", "maxhealth <player> <x>", "max health multiplier", mult("health", 50));

        add("heal", "heal <player>", "full health, clears poison", (a) => {
            const { player } = this.findPlayer(a.join(" "));
            player.dmgOverTime = {};
            player.changeHealth(player.maxHealth, player);
            return [`healed ${player.name}`];
        });

        add("kill", "kill <player>", "kill a player", (a) => {
            const { player } = this.findPlayer(a.join(" "));
            player.powers.god = 0;
            player.changeHealth(-player.health - 1, null);
            return [`killed ${player.name}`];
        });

        add("shame", "shame <player> [seconds]", "force the Shame! hat (anti-cheat penalty)", (a) => {
            const { player } = this.findPlayer(a[0]);
            player.shameTimer = (Number(a[1]) || 30) * 1000;
            return [`${player.name} is shamed for ${r(player.shameTimer / 1000)}s`];
        });

        // ---------------- progression
        add("give", "give <player> <wood|food|stone|gold> <amount>", "add resources", (a) => {
            const { player } = this.findPlayer(a[0]);
            const type = RESOURCES[norm(a[1])];
            const amount = Number(a[2] || 1000);
            if (type === undefined || isNaN(amount)) throw new Error("give <player> <wood|food|stone|gold> <amount>");
            player.addResource(type, Math.min(amount, 1e7), true);
            return [`gave ${player.name} ${amount} ${a[1]}`];
        });

        add("age", "age <player> <1-100>", "set age (gives the upgrade picks you'd have earned)", (a) => {
            const { player } = this.findPlayer(a[0]);
            const target = Math.max(1, Math.min(config.maxAge, Number(a[1])));
            if (isNaN(target)) throw new Error("age <player> <1-100>");
            let guard = 0;
            while (player.age < target && guard++ < 200) player.earnXP(player.maxXP - player.XP);
            return [`${player.name} is age ${player.age} with ${player.upgradePoints} upgrade picks`];
        }, ["level"]);

        add("weapon", "weapon <player> <name> [normal|gold|diamond|ruby|emerald]", "give a weapon (and variant)", (a) => {
            const { player } = this.findPlayer(a[0]);
            const variantWord = norm(a[a.length - 1]);
            const hasVariant = variantWord in VARIANTS && a.length > 2;
            const weapon = this.named(items.weapons, a.slice(1, hasVariant ? -1 : undefined).join(" "), "weapon");
            const variant = config.weaponVariants[hasVariant ? VARIANTS[variantWord] : 0];
            player.weapons[weapon.type] = weapon.id;
            player.weaponXP[weapon.id] = variant.xp;
            player.weaponIndex = weapon.id;
            player.buildIndex = -1;
            player.send("V", player.weapons, 1);
            const note = variant.membersOnly && !player.isMember ? " (emerald only shows for signed-in players)" : "";
            return [`gave ${player.name} ${weapon.name} (${["normal", "gold", "diamond", "ruby", "emerald"][variant.id]})${note}`];
        });

        add("item", "item <player> <name>", "give a building / food item", (a) => {
            const { player } = this.findPlayer(a[0]);
            const item = this.named(items.list, a.slice(1).join(" "), "item");
            player.addItem(item.id);
            player.send("V", player.items, 0);
            return [`gave ${player.name} ${item.name}`];
        });

        const cosmetic = (list, isTail, label) => (a) => {
            const { player } = this.findPlayer(a[0]);
            const words = a.slice(1);
            const equip = norm(words[words.length - 1]) === "equip";
            const entry = this.named(list, (equip ? words.slice(0, -1) : words).join(" "), label);
            (isTail ? player.tails : player.skins)[entry.id] = 1;
            player.send("5", 0, entry.id, isTail ? 1 : 0);
            if (equip) {
                if (isTail) {
                    player.tail = entry;
                    player.tailIndex = entry.id;
                } else {
                    player.skin = entry;
                    player.skinIndex = entry.id;
                }
                player.send("5", 1, entry.id, isTail ? 1 : 0);
            }
            return [`${player.name} now owns ${entry.name}${equip ? " (equipped)" : ""}`];
        };
        add("hat", "hat <player> <name> [equip]", "unlock (and wear) a hat, incl. Crab Shell", cosmetic(hats, false, "hat"));
        add("accessory", "accessory <player> <name> [equip]", "unlock (and wear) an accessory", cosmetic(accessories, true, "accessory"), ["tail", "cape"]);

        // ---------------- server / moderation
        add("announce", "announce <text>", "server notice in everyone's chat", (a) => {
            const text = a.join(" ").slice(0, 120);
            for (const game of this.games.values()) game.server.broadcast("6", -1, text);
            return [`announced: ${text}`];
        }, ["say"]);

        add("restart", "restart <seconds>", "show the \"Server restarting in m:ss\" banner (no real restart)", (a) => {
            const seconds = Number(a[0] || 60);
            for (const game of this.games.values()) game.announceShutdown(seconds);
            return [`restart banner set to ${seconds}s`];
        });

        add("kick", "kick <player>", "remove a player", (a) => {
            const { player } = this.findPlayer(a.join(" "), { needAlive: false });
            if (player.kick) player.kick("kicked");
            return [`kicked ${player.name}`];
        });

        add("ban", "ban <player>", "ban ip + account", (a) => {
            const { player } = this.findPlayer(a.join(" "), { needAlive: false });
            this.moderation.ban({ ip: player.ip, did: player.did, accountId: player.account && player.account.id, name: player.name }, { name: "console" });
            if (player.account) this.accounts.setVerdict(player.account.name, "ban");
            if (player.kick) player.kick("kicked");
            return [`banned ${player.name}`];
        });

        add("unban", "unban <account name | ip>", "lift a ban", (a) => {
            const key = a.join(" ");
            const account = this.accounts.nameOwner(key);
            if (account) {
                this.accounts.setVerdict(account.name, "clear");
                this.moderation.unbanAccount(account.id);
            }
            if (this.moderation.bans.ips[key]) {
                delete this.moderation.bans.ips[key];
                this.moderation.saveBans();
            }
            return [`unbanned ${key}`];
        });

        add("role", "role <account name> <admin|mod|none>", "staff role for a signed-in account (rejoin to apply)", (a) => {
            const role = norm(a[a.length - 1]);
            const name = a.slice(0, -1).join(" ");
            if (!["admin", "mod", "none"].includes(role)) throw new Error("role <account name> <admin|mod|none>");
            if (!this.accounts.setRole(name, role === "none" ? null : role)) throw new Error(`no account named "${name}" (they need to sign in and play once)`);
            for (const { player } of this.allPlayers()) {
                if (player.account && player.account.name === name) player.role = role === "none" ? null : role;
            }
            return [`${name} is now ${role}`];
        });

        add("flags", "flags <player>", "anticheat summary for a player", (a) => {
            const { player } = this.findPlayer(a.join(" "), { needAlive: false });
            const s = player.anticheat ? player.anticheat.summary() : null;
            return [s ? `${player.name}: flags ${s.flagNames.join(", ") || "none"}, untrusted events ${s.untrustedEvents}, strikes ${s.strikes}` : "no anticheat data"];
        }, ["ac"]);

        // ---------------- accounts / friends / Discord
        const account = (name) => {
            const found = this.accounts.nameOwner(name);
            if (!found) throw new Error(`no account named "${name}" (they need to sign in and pick a name)`);
            return found;
        };

        add("friends", "friends <account name>", "friends, requests and prefs of an account", (a) => {
            const acc = account(a.join(" "));
            const nameOf = (id) => (this.accounts.accountById(id) || {}).name || id;
            const prefs = this.accounts.prefsOf(acc);
            return [
                `${acc.name}: ${this.accounts.friendsOf(acc.id).map(f => nameOf(f.id)).join(", ") || "no friends yet"}`,
                `incoming: ${this.accounts.requestsFor(acc.id).map(r => nameOf(r.senderId)).join(", ") || "none"}, outgoing: ${this.accounts.requestsFrom(acc.id).map(r => nameOf(r.recipientId)).join(", ") || "none"}`,
                `prefs: friend notifications ${prefs.friendNotifs ? "on" : "off"}, friend requests ${prefs.friendRequests ? "on" : "off"}, clan invites ${prefs.clanInvites ? "on" : "off"}`,
                acc.discord ? `discord: ${acc.discord.name}` : "discord: not linked"
            ];
        });

        add("befriend", "befriend <account> <account>", "make two accounts friends straight away", (a) => {
            if (a.length !== 2) throw new Error("befriend <account> <account> (one word each)");
            const [first, second] = a.map(account);
            if (first === second) throw new Error("pick two different accounts");
            const result = this.accounts.createFriendRequest(first.id, second.id);
            if (result.status === 409 && this.accounts.areFriends(first.id, second.id)) return [`${first.name} and ${second.name} are already friends`];
            const pending = this.accounts.requestsFor(second.id).find(r => r.senderId === first.id);
            if (pending) this.accounts.answerFriendRequest(second.id, pending.id, true);
            if (this.social) this.social.friendshipChanged(first.id, second.id);
            return [`${first.name} and ${second.name} are now friends`];
        });

        add("discord", "discord <discord username>", "stand-in for the Discord bot's /link: prints a link to open", (a) => {
            const name = a.join(" ").trim();
            if (!name) throw new Error("discord <discord username>");
            const code = this.accounts.createDiscordCode(name);
            return [`open ${this.baseUrl}/?discord=${code}`, "(signed in, with a player name; the link works for 10 minutes)"];
        }, ["link"]);

        return C;
    }

    // Re-send player data to everyone else (size / aura / boss flags changed).
    resend(game, player) {
        for (const viewer of game.players) {
            if (viewer !== player) delete player.sentTo[viewer.id];
        }
    }
}
