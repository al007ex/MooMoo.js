// CLIENT -> SERVER PACKETS
// One handler per entry of the client's packet table ([Fl]). Arguments are validated
// against exactly what the official client sends; anything else is an anticheat strike.

import { UTILS } from "../moomoo/libs/utils.js";
import { config } from "../moomoo/config.js";
import { items } from "../moomoo/modules/items.js";
import { hats, accessories } from "../moomoo/modules/store.js";
import { filter_chat } from "../moomoo/libs/filterchat.js";

const isNum = UTILS.isNumber;
const isInt = (v) => Number.isInteger(v);
const ADMIN_LISTS = {
    size: [1, 1.5, 2, 3],
    power: [1, 2, 5, 10, 20, 50, 100],
    speed: [1, 1.5, 2, 5, 10, 20],
    health: [1, 2, 5, 10, 20]
};
const ADMIN_POWERS = ["god", "aura", "godlike", "boss", "invisible"];
const REPORT_REASONS = ["Bot", "Hack", "Autoheal", "Abuse"];   // [om], sent as index + 1
const MAX_TRIBE_NAME = 7;

// Re-send "D" (addPlayer) to everyone except the player itself, e.g. after a size change.
function resendData(game, player) {
    for (const viewer of game.players) {
        if (viewer !== player) delete player.sentTo[viewer.id];
    }
}

function teleport(player, x, y) {
    player.x = x;
    player.y = y;
    player.xVel = 0;
    player.yVel = 0;
}

export function handlePacket(ctx, player, name, args) {
    const { game } = ctx;
    const ac = player.anticheat;
    const invalid = (why) => ac.invalid(name, why);

    switch (name) {

        // SPAWN: {name, moofoll, skin}
        case "M": {
            const data = args[0];
            if (!data || typeof data !== "object" || Array.isArray(data)) return invalid("bad spawn data");
            if (player.alive) return;
            player.setUserData(data);
            player.spawn(Boolean(data.moofoll));
            player.attrCache.clear();
            player.send("C", player.sid);
            ac.onGameStart();
            if (ctx.log) ctx.log(`[${game.key}] spawn sid ${player.sid} as "${player.name}"`);
            return;
        }

        // AIM DIRECTION
        case "D": {
            if (!isNum(args[0])) return invalid("dir");
            if (player.alive) player.dir = args[0];
            return;
        }

        // MOVE DIRECTION (null = stop)
        case "9": {
            const dir = args[0];
            if (dir !== null && dir !== undefined && !isNum(dir)) return invalid("moveDir");
            if (player.alive) player.moveDir = dir == null ? undefined : dir;
            return;
        }

        // RESET MOVE DIR (window blur)
        case "e": {
            if (player.alive) player.resetMoveDir();
            return;
        }

        // MOUSE STATE: [down, buildDir | null]
        case "F": {
            if (!player.alive) return;
            if (args[1] != null && !isNum(args[1])) return invalid("build dir");
            const down = args[0] ? 1 : 0;
            player.mouseState = down;
            if (isNum(args[1])) player.dir = args[1];
            if (down && player.buildIndex >= 0) {
                const item = items.list[player.buildIndex];
                if (item) player.buildItem(item);
                player.mouseState = 0;
            } else if (down) {
                player.hits++;
            }
            return;
        }

        // SELECT ITEM: [index, isWeapon]
        case "z": {
            if (!player.alive) return;
            const index = args[0];
            if (!isInt(index)) return invalid("item index");
            if (args[1]) {
                const weapon = items.weapons[index];
                if (!weapon || player.weapons[weapon.type] !== index) return;
                player.buildIndex = -1;
                player.weaponIndex = index;
                return;
            }
            const item = items.list[index];
            if (!item || player.items.indexOf(index) < 0) return;
            if (player.buildIndex === index) {
                player.buildIndex = -1;
            } else {
                player.buildIndex = index;
            }
            player.mouseState = 0;
            return;
        }

        // UPGRADE: [index] (weapons first, then items offset by weapons.length)
        case "H": {
            if (!player.alive || player.upgradePoints <= 0) return;
            const index = args[0];
            if (!isInt(index)) return invalid("upgrade index");
            if (index < items.weapons.length) {
                const weapon = items.weapons[index];
                if (!weapon || weapon.age !== player.upgrAge) return;
                if (weapon.pre != null && player.weapons.indexOf(weapon.pre) < 0) return;
                player.weapons[weapon.type] = weapon.id;
                player.weaponXP[weapon.type] = 0;
                const activeType = player.weaponIndex < 9 ? 0 : 1;
                if (weapon.type === activeType) player.weaponIndex = weapon.id;
            } else {
                const item = items.list[index - items.weapons.length];
                if (!item || item.age !== player.upgrAge) return;
                if (item.pre != null && player.items.indexOf(item.pre) < 0) return;
                player.addItem(item.id);
            }
            player.upgrAge++;
            player.upgradePoints--;
            player.send("V", player.items, 0);
            player.send("V", player.weapons, 1);
            player.send("U", player.upgradePoints, player.upgrAge);
            return;
        }

        // TOGGLES: 0 = lock rotation, 1 = auto gather
        case "K": {
            if (!player.alive) return;
            if (args[0] === 1) player.autoGather = !player.autoGather;
            else if (args[0] === 0) player.lockDir = !player.lockDir;
            else return invalid("toggle");
            return;
        }

        // STORE: [0 buy | 1 equip, id, isAccessory]
        case "c": {
            if (!player.alive) return;
            const [action, id, isTail] = args;
            if (!isInt(id) || (action !== 0 && action !== 1)) return invalid("store");
            const list = isTail ? accessories : hats;
            const owned = isTail ? player.tails : player.skins;
            const entry = list.find(x => x.id === id);
            if (action === 0) {
                if (!entry || owned[id] || entry.dontSell || player.points < entry.price) return;
                if (entry.price > 0) player.addResource(3, -entry.price, true);
                owned[id] = 1;
                player.send("5", 0, id, isTail ? 1 : 0);
                return;
            }
            if (id === 0) {
                if (isTail) {
                    player.tail = null;
                    player.tailIndex = 0;
                } else {
                    player.skin = null;
                    player.skinIndex = 0;
                }
                player.send("5", 1, 0, isTail ? 1 : 0);
                return;
            }
            if (!entry || !owned[id]) return;
            if (isTail) {
                player.tail = entry;
                player.tailIndex = id;
            } else {
                player.skin = entry;
                player.skinIndex = id;
            }
            player.send("5", 1, id, isTail ? 1 : 0);
            return;
        }

        // CHAT
        case "6": {
            if (!player.alive) return;
            if (typeof args[0] !== "string") return invalid("chat");
            if (player.chatCooldown > 0) return;
            const text = filter_chat(args[0]);
            if (!text.length) return;
            player.chatCooldown = config.chatCooldown;
            if (player.shadowed) {
                player.send("6", player.sid, text);
                return;
            }
            game.server.broadcast("6", player.sid, text);
            return;
        }

        // MAP PING
        case "S": {
            if (!player.alive || player.pingCooldown > 0) return;
            player.pingCooldown = config.mapPingTime;
            for (const other of game.players) {
                if (other === player || (player.team && other.team === player.team)) {
                    other.send("9", Math.round(player.x), Math.round(player.y));
                }
            }
            return;
        }

        // PING
        case "0": {
            player.send("0");
            return;
        }

        // TRIBES
        case "L": {
            if (!player.alive || player.team || player.tribeCooldown > 0) return;
            const tribeName = args[0];
            if (typeof tribeName !== "string") return invalid("tribe name");
            const clean = tribeName.trim();
            if (!clean.length || clean.length > MAX_TRIBE_NAME || /[^\x20-\x7e]/.test(clean)) return;
            const reserved = ctx.accounts && Object.keys(ctx.accounts.data.clans).some(c => c.toLowerCase() === clean.toLowerCase());
            if (reserved && clean.toLowerCase() !== String(player.clanTag || "").toLowerCase()) return;
            player.tribeCooldown = 200;
            game.clan_manager.create(clean, player);
            return;
        }
        case "N": {
            if (!player.team || player.tribeCooldown > 0) return;
            player.tribeCooldown = 200;
            game.clan_manager.leaveTribe(player);
            return;
        }
        case "b": {
            if (typeof args[0] !== "string") return invalid("tribe");
            if (!player.alive || player.team || player.tribeCooldown > 0) return;
            player.tribeCooldown = 200;
            game.clan_manager.requestJoin(player, args[0]);
            return;
        }
        case "P": {
            if (!isInt(args[0])) return invalid("join answer");
            game.clan_manager.answerRequest(player, args[0], Boolean(args[1]));
            return;
        }
        case "Q": {
            if (!isInt(args[0])) return invalid("kick");
            game.clan_manager.kick(player, args[0]);
            return;
        }

        // TELEMETRY (anti-tamper): [flags, untrustedEvents]
        case "T": {
            ac.onTelemetry(args[0], args[1]);
            return;
        }

        // REPORT / STAFF ACTION:
        //   [sid]                 Report
        //   [sid, 0, reason]      "What for?" answer (1 Bot, 2 Hack, 3 Autoheal, 4 Abuse)
        //   [sid, 1 | 2]          staff: shadow / ban
        case "R": {
            const sid = args[0];
            if (!isInt(sid)) return invalid("report");
            const target = game.players.find(p => p.sid === sid);
            if (!target || target === player) return;
            if (args[1] === undefined) {
                player.reported = player.reported || new Map();
                if (player.reported.has(sid)) return;
                target.reports++;
                player.reported.set(sid, ctx.moderation.report({ target, reporter: player, sessionReports: target.reports }));
                return;
            }
            if (args[1] === 0) {
                const reason = isInt(args[2]) ? REPORT_REASONS[args[2] - 1] : undefined;
                if (!reason) return invalid("report reason");
                const entry = player.reported && player.reported.get(sid);
                if (!entry || entry.reason) return;
                ctx.moderation.reportReason({ target, reporter: player, entry, reason });
                return;
            }
            if (player.role !== "mod" && player.role !== "admin") return invalid("staff action");
            if (args[1] === 2) {
                ctx.moderation.ban({ ip: target.ip, accountId: target.account && target.account.id, name: target.name }, player);
                if (target.account && ctx.accounts) ctx.accounts.setVerdict(target.account.name, "ban");
                if (target.kick) target.kick("kicked");
            } else if (args[1] === 1) {
                target.shadowed = true;
                if (target.account && ctx.accounts) ctx.accounts.setVerdict(target.account.name, "shadow");
            }
            return;
        }

        // ADMIN COMMANDS
        case "A": {
            if (player.role !== "admin") return invalid("admin command");
            handleAdmin(ctx, player, args);
            return;
        }

        // STATS: [sid] whose live stats the profile card shows (-1 = none)
        case "V": {
            if (!isInt(args[0])) return invalid("stats");
            player.watchStats = args[0];
            if (args[0] >= 0) game.sendStats(player, args[0]);
            return;
        }

        default:
            return invalid("unhandled");
    }
}

function handleAdmin(ctx, admin, args) {
    const { game } = ctx;
    const [command, a, b, c] = args;
    const targetFor = (sid) => sid == null ? admin : game.players.find(p => p.sid === sid && p.alive);

    if (ADMIN_POWERS.includes(command)) {
        const on = a ? 1 : 0;
        admin.powers[command] = on;
        if (command === "godlike") {
            admin.powers.god = on;
            admin.powers.aura = on;
        }
        resendData(game, admin);
        return;
    }
    if (ADMIN_LISTS[command]) {
        if (!ADMIN_LISTS[command].includes(a)) return;
        admin.powers[command] = a;
        admin.applyPowers();
        resendData(game, admin);
        return;
    }
    switch (command) {
        case "spawn": {
            if (!isInt(a) || !game.ai_manager.aiTypes[a]) return;
            const dist = admin.scale + game.ai_manager.aiTypes[a].scale + 60;
            game.ai_manager.spawn(admin.x + Math.cos(admin.dir) * dist, admin.y + Math.sin(admin.dir) * dist, admin.dir, a, { despawnOnDeath: true });
            return;
        }
        case "tp": {
            if (!isNum(a) || !isNum(b)) return;
            teleport(admin, a, b);
            return;
        }
        case "gotomob": {
            const mob = game.ais.find(ai => ai.active && ai.index === a && !ai.spawnCounter);
            if (mob) teleport(admin, mob.x + mob.scale + admin.scale + 40, mob.y);
            return;
        }
        case "goto": {
            const other = targetFor(a);
            if (other && other !== admin) teleport(admin, other.x + other.scale * 2, other.y);
            return;
        }
        case "summon": {
            const other = targetFor(a);
            if (other && other !== admin) teleport(other, admin.x + admin.scale * 2, admin.y);
            return;
        }
        case "weapon": {
            const target = targetFor(c);
            const weapon = items.weapons[a];
            const variant = config.weaponVariants[b] || config.weaponVariants[0];
            if (!target || !weapon) return;
            target.weapons[weapon.type] = weapon.id;
            target.weaponXP[weapon.id] = variant.xp;
            target.weaponIndex = weapon.id;
            target.buildIndex = -1;
            target.send("V", target.weapons, 1);
            return;
        }
        case "item": {
            const target = targetFor(c);
            if (!target || !items.list[a]) return;
            target.addItem(a);
            target.send("V", target.items, 0);
            return;
        }
        case "give": {
            const target = targetFor(c);
            if (!target || !isInt(a) || a < 0 || a > 3 || !isNum(b)) return;
            target.addResource(a, Math.min(b, 1e6), true);
            return;
        }
        case "deltribe": {
            if (typeof a === "string") game.clan_manager.remove(a);
            return;
        }
        default:
            return;
    }
}
