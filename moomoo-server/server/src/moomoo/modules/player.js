// PLAYER
// Port of the Player class shipped in the official client bundle ([wu]). Shared
// functions keep the client's logic line for line; additions that only exist on the
// server are marked "SERVER:".

import { NAME_WORDS } from "../libs/nameFilter.js";
import { TAIL, HAT, EFFECT, hasTail, snowFactor, gatherBonus, secretDistance, inSecretPool } from "./effects.js";

const mathCOS = Math.cos;
const mathSIN = Math.sin;
const mathPOW = Math.pow;
const mathSQRT = Math.sqrt;
const mathABS = Math.abs;

export class Player {

    constructor(id, sid, config, UTILS, projectileManager, objectManager, players, ais, items, hats, accessories, server, scoreCallback, iconCallback) {
        this.id = id;
        this.sid = sid;
        this.tmpScore = 0;
        this.team = null;
        this.skinIndex = 0;
        this.tailIndex = 0;
        this.hitTime = 0;
        this.tails = {};
        for (let i = 0; i < accessories.length; ++i) {
            if (accessories[i].price <= 0 && !accessories[i].dontSell) this.tails[accessories[i].id] = 1;
        }
        this.skins = {};
        for (let i = 0; i < hats.length; ++i) {
            if (hats[i].price <= 0 && !hats[i].dontSell) this.skins[hats[i].id] = 1;
        }
        this.points = 0;
        this.dt = 0;
        this.hidden = false;
        this.itemCounts = {};
        this.isPlayer = true;
        this.pps = 0;
        this.moveDir = undefined;
        this.skinRot = 0;
        this.lastPing = 0;
        this.iconIndex = 0;
        this.skinColor = 0;

        // SERVER: connection / account state
        this.send = () => {};
        this.account = null;
        this.role = null;
        this.isMember = false;
        this.isOwner = false;
        this.isLeader = false;
        this.flagged = false;
        this.shadowed = false;
        this.name = "unknown";
        this.alive = false;
        this.active = false;
        this.spawned = false;
        this.sentTo = {};
        this.lifeStats = null;
        this.watchStats = -1;
        this.joinRequests = new Set();
        this.powers = { god: 0, aura: 0, godlike: 0, boss: 0, invisible: 0, size: 1, power: 1, speed: 1, health: 1 };
        this.tribeCooldown = 0;
        this.chatCooldown = 0;
        this.pingCooldown = 0;

        // SPAWN:
        this.spawn = function (moofoll) {
            this.active = true;
            this.alive = true;
            this.lockMove = false;
            this.lockDir = false;
            this.minimapCounter = 0;
            this.chatCountdown = 0;
            this.shameCount = 0;
            this.shameTimer = 0;
            this.sentTo = {};
            this.gathering = 0;
            this.autoGather = 0;
            this.animTime = 0;
            this.animSpeed = 0;
            this.mouseState = 0;
            this.buildIndex = -1;
            this.weaponIndex = 0;
            this.dmgOverTime = {};
            this.noMovTimer = 0;
            this.maxXP = 300;
            this.XP = 0;
            this.age = 1;
            this.kills = 0;
            this.upgrAge = 2;
            this.upgradePoints = 0;
            this.x = 0;
            this.y = 0;
            this.zIndex = 0;
            this.xVel = 0;
            this.yVel = 0;
            this.slowMult = 1;
            this.dir = 0;
            this.dirPlus = 0;
            this.targetDir = 0;
            this.targetAngle = 0;
            this.maxHealth = 100;
            this.health = this.maxHealth;
            this.scale = config.playerScale;
            this.speed = config.playerSpeed;
            this.resetMoveDir();
            this.resetResources(moofoll);
            this.items = [0, 3, 6, 10];
            this.weapons = [0];
            this.shootCount = 0;
            this.weaponXP = [];
            this.reloads = {};

            // SERVER:
            this.spawned = true;
            this.hits = 0;
            this.dragonUntil = 0;
            this.superUntil = 0;
            this.spawnedAt = Date.now();
            this.lifeStats = {
                kills: 0, wood: 0, food: 0, stone: 0, gold: 0, damage: 0, animalDamage: 0,
                healing: 0, animals: 0, bosses: 0, score: this.points, animalKills: {}, bossKills: 0
            };
            this.applyPowers();
            const spawnPoint = objectManager.fetchSpawnObj(this.sid);
            if (spawnPoint) {
                this.x = spawnPoint[0];
                this.y = spawnPoint[1];
            } else {
                for (let i = 0; i < 20; i++) {
                    this.x = UTILS.randInt(this.scale, config.mapScale - this.scale);
                    this.y = UTILS.randInt(this.scale, config.mapScale - this.scale);
                    if (objectManager.checkItemLocation(this.x, this.y, this.scale, 0.6, null, true)) break;
                }
            }
        };

        // RESET MOVE DIR:
        this.resetMoveDir = function () {
            this.moveDir = undefined;
        };

        // RESET RESOURCES:
        this.resetResources = function (moofoll) {
            for (let i = 0; i < config.resourceTypes.length; ++i) {
                this[config.resourceTypes[i]] = config.unlimitedResources ? config.unlimitedAmount : moofoll ? 100 : 0;
            }
            if (config.unlimitedResources) this.points = config.unlimitedAmount;
        };

        // ADD ITEM:
        this.addItem = function (id) {
            const tmpItem = items.list[id];
            if (tmpItem) {
                for (let i = 0; i < this.items.length; ++i) {
                    if (items.list[this.items[i]].group == tmpItem.group) {
                        if (this.buildIndex == this.items[i]) this.buildIndex = id;
                        this.items[i] = id;
                        return true;
                    }
                }
                this.items.push(id);
                return true;
            }
            return false;
        };

        // SET USER DATA:
        this.setUserData = function (data) {
            if (data) {
                this.name = "unknown";
                let name = data.name + "";
                name = name.slice(0, config.maxNameLength);
                name = name.replace(/[^\w:\(\)\/? -]+/gmi, " ");
                name = name.replace(/[^\x00-\x7F]/g, " ");
                name = name.trim();
                let isProfane = false;
                const convertedName = name.toLowerCase().replace(/\s/g, "").replace(/1/g, "i").replace(/0/g, "o").replace(/5/g, "s");
                for (const word of NAME_WORDS) {
                    if (convertedName.indexOf(word) != -1) {
                        isProfane = true;
                        break;
                    }
                }
                if (name.length > 0 && !isProfane) this.name = name;
                this.skinColor = 0;
                if (config.skinColors[data.skin]) this.skinColor = data.skin;
            }
            // SERVER: signed-in players always play under their permanent account name.
            if (this.account && this.account.name) this.name = this.account.name;
        };

        // GET DATA TO SEND ("D"): client setData reads [id, sid, name, x, y, dir, health,
        // maxHealth, scale, skinColor, aura, bossMode, clan].
        this.getData = function () {
            return [
                this.id, this.sid, this.name, UTILS.fixTo(this.x, 2), UTILS.fixTo(this.y, 2), UTILS.fixTo(this.dir, 3),
                this.health, this.maxHealth, this.scale, this.skinColor,
                this.powers.aura ? 1 : 0, this.powers.boss ? 1 : 0, this.clanTag || null
            ];
        };

        // SET DATA:
        this.setData = function (data) {
            this.id = data[0];
            this.sid = data[1];
            this.name = data[2];
            this.x = data[3];
            this.y = data[4];
            this.dir = data[5];
            this.health = data[6];
            this.maxHealth = data[7];
            this.scale = data[8];
            this.skinColor = data[9];
            this.aura = !!data[10];
            this.bossMode = !!data[11];
            this.clan = data[12] || null;
        };

        // UPDATE:
        let timerCount = 0;
        this.update = function (delta) {
            if (!this.alive) return;

            // SHAME SHAME SHAME:
            if (this.shameTimer > 0) {
                this.shameTimer -= delta;
                if (this.shameTimer <= 0) {
                    this.shameTimer = 0;
                    this.shameCount = 0;
                }
            }

            // REGENS AND AUTO:
            timerCount -= delta;
            if (timerCount <= 0) {
                const regenAmount = (this.skin && this.skin.healthRegen ? this.skin.healthRegen : 0) + (this.tail && this.tail.healthRegen ? this.tail.healthRegen : 0);
                if (regenAmount) this.changeHealth(regenAmount, this);
                if (this.dmgOverTime.dmg) {
                    this.changeHealth(-this.dmgOverTime.dmg, this.dmgOverTime.doer);
                    this.dmgOverTime.time -= 1;
                    if (this.dmgOverTime.time <= 0) this.dmgOverTime.dmg = 0;
                }
                if (this.healCol) this.changeHealth(this.healCol, this);
                // SERVER: windmills / Windmill Hat pay out once a second.
                const pps = this.pps + (this.skin && this.skin.pps ? this.skin.pps : 0);
                if (pps && this.alive) this.addResource(3, pps, true);
                timerCount = 1000;
            }

            // CHECK KILL:
            if (!this.alive) return;

            // SLOWER:
            if (this.slowMult < 1) {
                this.slowMult += 0.0008 * delta;
                if (this.slowMult > 1) this.slowMult = 1;
            }

            // MOVE:
            this.noMovTimer += delta;
            if (this.xVel || this.yVel) this.noMovTimer = 0;
            if (this.lockMove) {
                this.xVel = 0;
                this.yVel = 0;
            } else {
                let spdMult = (this.buildIndex >= 0 ? 0.5 : 1) * (items.weapons[this.weaponIndex].spdMult || 1) * (this.skin ? (this.skin.spdMult || 1) : 1) * (this.tail ? (this.tail.spdMult || 1) : 1) * (this.y <= config.snowBiomeTop ? snowFactor(this, config) : 1) * this.slowMult;
                // SERVER: Dash Cape, Super Cape, admin speed
                if (hasTail(this, TAIL.DASH_CAPE)) spdMult *= EFFECT.dashCapeSpeed;
                if (this.superUntil > Date.now()) spdMult *= EFFECT.superCapeSpeed;
                spdMult *= this.powers.speed;
                if (!this.zIndex && this.y >= config.mapScale / 2 - config.riverWidth / 2 && this.y <= config.mapScale / 2 + config.riverWidth / 2 && this.x >= 0) {
                    if (this.skin && this.skin.watrImm) {
                        spdMult *= 0.75;
                        this.xVel += config.waterCurrent * 0.4 * delta;
                    } else {
                        spdMult *= 0.33;
                        this.xVel += config.waterCurrent * delta;
                    }
                } else if (!this.zIndex && this.x < 0 && inSecretPool(config, this.x, this.y)) {
                    // SERVER: the secret pools are deep water (no current)
                    spdMult *= this.skin && this.skin.watrImm ? 0.75 : 0.33;
                }
                let xVel = this.moveDir != undefined ? mathCOS(this.moveDir) : 0;
                let yVel = this.moveDir != undefined ? mathSIN(this.moveDir) : 0;
                const length = mathSQRT(xVel * xVel + yVel * yVel);
                if (length != 0) {
                    xVel /= length;
                    yVel /= length;
                }
                if (xVel) this.xVel += xVel * this.speed * spdMult * delta;
                if (yVel) this.yVel += yVel * this.speed * spdMult * delta;
            }

            // OBJECT COLL:
            this.zIndex = 0;
            this.lockMove = false;
            this.healCol = 0;
            let tmpList;
            const tmpSpeed = UTILS.getDistance(0, 0, this.xVel * delta, this.yVel * delta);
            const depth = Math.min(4, Math.max(1, Math.round(tmpSpeed / 40)));
            const tMlt = 1 / depth;
            const checked = {};
            for (let i = 0; i < depth; ++i) {
                const prevX = this.x;
                const prevY = this.y;
                if (this.xVel) this.x += this.xVel * delta * tMlt;
                if (this.yVel) this.y += this.yVel * delta * tMlt;
                this.keepInWorld(prevX, prevY);
                tmpList = objectManager.getGridArrays(this.x, this.y, this.scale);
                for (let x = 0; x < tmpList.length; ++x) {
                    for (let y = 0; y < tmpList[x].length; ++y) {
                        const obj = tmpList[x][y];
                        if (obj.active && !checked[obj.sid] && objectManager.checkCollision(this, obj, tMlt)) {
                            checked[obj.sid] = true;
                            if (!this.alive) break;
                        }
                    }
                    if (!this.alive) break;
                }
                if (!this.alive) break;
            }

            // PLAYER COLLISIONS:
            const tmpIndx = players.indexOf(this);
            for (let i = tmpIndx + 1; i < players.length; ++i) {
                if (players[i] != this && players[i].alive) objectManager.checkCollision(this, players[i]);
            }

            // DECEL:
            if (this.xVel) {
                this.xVel *= mathPOW(config.playerDecel, delta);
                if (this.xVel <= 0.01 && this.xVel >= -0.01) this.xVel = 0;
            }
            if (this.yVel) {
                this.yVel *= mathPOW(config.playerDecel, delta);
                if (this.yVel <= 0.01 && this.yVel >= -0.01) this.yVel = 0;
            }

            // MAP BOUNDARIES:
            this.keepInWorld(this.x, this.y);

            // USE WEAPON OR TOOL:
            if (this.buildIndex < 0) {
                // SERVER: a click released before this tick still swings once
                if (this.hits > 0) this.gathering = 1;
                if (this.reloads[this.weaponIndex] > 0) {
                    this.reloads[this.weaponIndex] -= delta;
                    this.gathering = this.mouseState;
                } else if (this.gathering || this.autoGather) {
                    let worked = true;
                    if (items.weapons[this.weaponIndex].gather != undefined) {
                        this.gather(players);
                    } else if (items.weapons[this.weaponIndex].projectile != undefined && this.hasRes(items.weapons[this.weaponIndex], this.skin ? this.skin.projCost : 0)) {
                        this.useRes(items.weapons[this.weaponIndex], this.skin ? this.skin.projCost : 0);
                        this.noMovTimer = 0;
                        const projIndex = items.weapons[this.weaponIndex].projectile;
                        const projOffset = this.scale * 2;
                        const aMlt = this.skin && this.skin.aMlt ? this.skin.aMlt : 1;
                        if (items.weapons[this.weaponIndex].rec) {
                            this.xVel -= items.weapons[this.weaponIndex].rec * mathCOS(this.dir);
                            this.yVel -= items.weapons[this.weaponIndex].rec * mathSIN(this.dir);
                        }
                        projectileManager.addProjectile(this.x + projOffset * mathCOS(this.dir), this.y + projOffset * mathSIN(this.dir), this.dir, items.projectiles[projIndex].range * aMlt, items.projectiles[projIndex].speed * aMlt, projIndex, this, null, this.zIndex);
                    } else {
                        worked = false;
                    }
                    this.gathering = this.mouseState;
                    if (worked) this.reloads[this.weaponIndex] = items.weapons[this.weaponIndex].speed * (this.skin ? (this.skin.atkSpd || 1) : 1);
                }
            }

            this.hits = 0;

            // SERVER: Turret Gear
            if (this.skin && this.skin.turret) {
                this.shootCount -= delta;
                if (this.shootCount <= 0) this.shootTurret();
            }
        };

        // SERVER: world bounds, including the secret area west of x = 0.
        this.keepInWorld = function (prevX, prevY) {
            if (this.y - this.scale < 0) {
                this.y = this.scale;
            } else if (this.y + this.scale > config.mapScale) {
                this.y = config.mapScale - this.scale;
            }
            if (this.x + this.scale > config.mapScale) {
                this.x = config.mapScale - this.scale;
            }
            if (this.x - this.scale < 0 && secretDistance(config, Math.min(this.x, -1), this.y) > 0) {
                if (this.x >= this.scale - 1 || prevX >= this.scale) {
                    this.x = Math.max(this.x, this.scale);
                    return;
                }
                if (secretDistance(config, prevX, this.y) <= 0) {
                    this.x = prevX;
                    this.xVel = 0;
                } else if (secretDistance(config, this.x, prevY) <= 0) {
                    this.y = prevY;
                    this.yVel = 0;
                } else {
                    this.x = prevX;
                    this.y = prevY;
                    this.xVel = 0;
                    this.yVel = 0;
                }
            }
        };

        // SERVER: Turret Gear shot (nearest visible enemy in range, ignores Emp Helmet).
        this.shootTurret = function () {
            const turret = this.skin.turret;
            let target = null;
            let best = Infinity;
            for (const other of players) {
                if (!other.alive || other === this || (this.team && other.team === this.team)) continue;
                if (other.skin && other.skin.antiTurret) continue;
                const dist = UTILS.getDistance(this.x, this.y, other.x, other.y);
                if (dist <= turret.range && dist < best) {
                    best = dist;
                    target = other;
                }
            }
            if (!target) {
                this.shootCount = 250;
                return;
            }
            const dir = UTILS.getDirection(target.x, target.y, this.x, this.y);
            projectileManager.addProjectile(this.x, this.y, dir, turret.range, 1.6, turret.proj, this, null, this.zIndex);
            this.shootCount = turret.rate;
        };

        // ADD WEAPON XP:
        this.addWeaponXP = function (amnt) {
            if (!this.weaponXP[this.weaponIndex]) this.weaponXP[this.weaponIndex] = 0;
            this.weaponXP[this.weaponIndex] += amnt;
        };

        // EARN XP:
        this.earnXP = function (amount) {
            if (this.age < config.maxAge) {
                this.XP += amount;
                if (this.XP >= this.maxXP) {
                    if (this.age < config.maxAge) {
                        this.age++;
                        this.XP = 0;
                        this.maxXP *= 1.2;
                    } else {
                        this.XP = this.maxXP;
                    }
                    this.upgradePoints++;
                    server.send(this.id, "U", this.upgradePoints, this.upgrAge);
                    server.send(this.id, "T", this.XP, UTILS.fixTo(this.maxXP, 1), this.age);
                } else {
                    server.send(this.id, "T", this.XP);
                }
            }
        };

        // CHANGE HEALTH:
        this.changeHealth = function (amount, doer, _src, projectile) {
            if (amount > 0 && this.health >= this.maxHealth) return false;
            // SERVER: admin god mode
            if (amount < 0 && this.powers.god) return false;
            if (amount < 0 && this.skin) amount *= this.skin.dmgMult || 1;
            if (amount < 0 && this.tail) amount *= this.tail.dmgMult || 1;
            // SERVER: Blockades
            if (amount < 0 && projectile && hasTail(this, TAIL.BLOCKADES)) amount *= EFFECT.blockadesProjectile;
            if (amount < 0) this.hitTime = Date.now();
            this.health += amount;
            if (this.health > this.maxHealth) {
                amount -= this.health - this.maxHealth;
                this.health = this.maxHealth;
            }
            // SERVER: stats
            if (amount > 0 && this.lifeStats) this.lifeStats.healing += amount;
            if (amount < 0 && doer && doer !== this && doer.lifeStats) doer.lifeStats.damage += -amount;
            if (this.health <= 0) this.kill(doer, _src, projectile);
            for (let i = 0; i < players.length; ++i) {
                if (this.sentTo[players[i].id]) server.send(players[i].id, "O", this.sid, Math.round(this.health));
            }
            if (doer && doer.canSee && doer.canSee(this) && !(doer == this && amount < 0)) {
                server.send(doer.id, "8", Math.round(this.x), Math.round(this.y), Math.round(-amount), 1);
            }
            return true;
        };

        // KILL:
        this.kill = function (doer, src, projectile) {
            if (doer && doer.alive && doer.isPlayer) {
                doer.kills++;
                let reward;
                if (doer.skin && doer.skin.goldSteal) {
                    reward = Math.round(this.points / 2);
                } else {
                    reward = Math.round(this.age * 100 * (doer.skin && doer.skin.kScrM ? doer.skin.kScrM : 1));
                }
                // SERVER: Skull Cape / Troll Cape / Super Cape
                if (this.iconIndex == 1 && hasTail(doer, TAIL.SKULL_CAPE)) reward *= EFFECT.skullCapeMult;
                if (src && src.group && src.group.name == "spikes" && !projectile && hasTail(doer, TAIL.TROLL_CAPE)) reward *= EFFECT.trollCapeMult;
                if (hasTail(doer, TAIL.SUPER_CAPE)) doer.superUntil = Date.now() + EFFECT.superCapeTime;
                scoreCallback(doer, Math.round(reward));
                server.send(doer.id, "N", "kills", doer.kills, 1);
                if (doer.lifeStats) doer.lifeStats.kills++;
            }
            this.alive = false;
            server.send(this.id, "P");
            iconCallback(this);
        };

        // ADD RESOURCE:
        this.addResource = function (type, amount, auto) {
            if (config.unlimitedResources && amount < 0) return;
            if (!auto && amount > 0) this.addWeaponXP(amount);
            if (type == 3) {
                scoreCallback(this, amount, true);
            } else {
                this[config.resourceTypes[type]] += amount;
                server.send(this.id, "N", config.resourceTypes[type], this[config.resourceTypes[type]], 1);
                // SERVER: stats
                if (amount > 0 && this.lifeStats) this.lifeStats[config.resourceTypes[type]] += amount;
            }
        };

        // CHANGE ITEM COUNT:
        this.changeItemCount = function (index, value) {
            this.itemCounts[index] = this.itemCounts[index] || 0;
            this.itemCounts[index] += value;
            server.send(this.id, "S", index, this.itemCounts[index]);
        };

        // BUILD:
        this.buildItem = function (item) {
            const tmpS = this.scale + item.scale + (item.placeOffset || 0);
            const tmpX = this.x + tmpS * mathCOS(this.dir);
            const tmpY = this.y + tmpS * mathSIN(this.dir);
            if (this.canBuild(item) && !(item.consume && this.skin && this.skin.noEat) && (item.consume || objectManager.checkItemLocation(tmpX, tmpY, item.scale, 0.6, item.id, false, this))) {
                let worked = false;
                if (item.consume) {
                    if (this.hitTime) {
                        const timeSinceHit = Date.now() - this.hitTime;
                        this.hitTime = 0;
                        if (timeSinceHit <= 120) {
                            this.shameCount++;
                            if (this.shameCount >= 8) {
                                this.shameTimer = 30000;
                                this.shameCount = 0;
                            }
                        } else {
                            this.shameCount -= 2;
                            if (this.shameCount <= 0) this.shameCount = 0;
                        }
                    }
                    if (this.shameTimer <= 0) worked = item.consume(this);
                } else {
                    worked = true;
                    if (item.group.limit) this.changeItemCount(item.group.id, 1);
                    if (item.pps) this.pps += item.pps;
                    objectManager.add(objectManager.objects.length, tmpX, tmpY, this.dir, item.scale, item.type, item, false, this);
                }
                if (worked) {
                    this.useRes(item);
                    this.buildIndex = -1;
                }
            }
        };

        // HAS RESOURCES:
        this.hasRes = function (item, mult) {
            for (let i = 0; i < item.req.length;) {
                if (this[item.req[i]] < Math.round(item.req[i + 1] * (mult || 1))) return false;
                i += 2;
            }
            return true;
        };

        // USE RESOURCES:
        this.useRes = function (item, mult) {
            if (config.inSandbox) return;
            for (let i = 0; i < item.req.length;) {
                this.addResource(config.resourceTypes.indexOf(item.req[i]), -Math.round(item.req[i + 1] * (mult || 1)));
                i += 2;
            }
        };

        // CAN BUILD:
        this.canBuild = function (item) {
            const limit = config.inSandbox ? (item.group.sandboxLimit || Math.max(item.group.limit * 3, 99)) : item.group.limit;
            if (limit && this.itemCounts[item.group.id] >= limit) return false;
            return config.inSandbox ? true : this.hasRes(item);
        };

        // SERVER: weapon variant, emerald only for members.
        this.variant = function () {
            const variant = config.fetchVariant(this);
            if (variant.membersOnly && !this.isMember) return config.weaponVariants[variant.id - 1];
            return variant;
        };

        // GATHER:
        this.gather = function () {
            // SHOW:
            this.noMovTimer = 0;

            // SLOW MOVEMENT:
            this.slowMult -= items.weapons[this.weaponIndex].hitSlow || 0.3;
            if (this.slowMult < 0) this.slowMult = 0;

            // VARIANT DMG:
            const tmpVariant = this.variant();
            const applyPoison = tmpVariant.poison;
            const variantDmg = tmpVariant.val;

            // CHECK IF HIT GAME OBJECT:
            const hitObjs = {};
            let tmpDist;
            let tmpDir;
            let tmpObj;
            let hitSomething = false;
            const tmpList = objectManager.getGridArrays(this.x, this.y, items.weapons[this.weaponIndex].range);
            for (let t = 0; t < tmpList.length; ++t) {
                for (let i = 0; i < tmpList[t].length; ++i) {
                    tmpObj = tmpList[t][i];
                    if (tmpObj.active && !tmpObj.dontGather && !hitObjs[tmpObj.sid] && tmpObj.visibleToPlayer(this)) {
                        tmpDist = UTILS.getDistance(this.x, this.y, tmpObj.x, tmpObj.y) - tmpObj.scale;
                        if (tmpDist <= items.weapons[this.weaponIndex].range) {
                            tmpDir = UTILS.getDirection(tmpObj.x, tmpObj.y, this.x, this.y);
                            if (UTILS.getAngleDist(tmpDir, this.dir) <= config.gatherAngle) {
                                hitObjs[tmpObj.sid] = 1;
                                if (tmpObj.health) {
                                    if (tmpObj.changeHealth(-items.weapons[this.weaponIndex].dmg * variantDmg * (items.weapons[this.weaponIndex].sDmg || 1) * (this.skin && this.skin.bDmg ? this.skin.bDmg : 1) * this.powers.power, this)) {
                                        for (let x = 0; x < tmpObj.req.length;) {
                                            this.addResource(config.resourceTypes.indexOf(tmpObj.req[x]), tmpObj.req[x + 1]);
                                            x += 2;
                                        }
                                        objectManager.disableObj(tmpObj);
                                    }
                                } else {
                                    this.earnXP(4 * items.weapons[this.weaponIndex].gather);
                                    const count = items.weapons[this.weaponIndex].gather + (tmpObj.type == 3 ? 4 : 0) + gatherBonus(this, tmpObj.type);
                                    this.addResource(tmpObj.type, count);
                                    if (this.skin && this.skin.extraGold) this.addResource(3, 1);
                                }
                                hitSomething = true;
                                objectManager.hitObj(tmpObj, tmpDir);
                            }
                        }
                    }
                }
            }

            // CHECK IF HIT PLAYER:
            for (let i = 0; i < players.length + ais.length; ++i) {
                tmpObj = players[i] || ais[i - players.length];
                if (tmpObj != this && tmpObj.alive && !tmpObj.submerged && !(tmpObj.team && tmpObj.team == this.team)) {
                    tmpDist = UTILS.getDistance(this.x, this.y, tmpObj.x, tmpObj.y) - tmpObj.scale * 1.8;
                    if (tmpDist <= items.weapons[this.weaponIndex].range) {
                        tmpDir = UTILS.getDirection(tmpObj.x, tmpObj.y, this.x, this.y);
                        if (UTILS.getAngleDist(tmpDir, this.dir) <= config.gatherAngle) {

                            // STEAL RESOURCES:
                            let stealCount = items.weapons[this.weaponIndex].steal;
                            if (stealCount && tmpObj.addResource) {
                                stealCount = Math.min(tmpObj.points || 0, stealCount);
                                this.addResource(3, stealCount);
                                tmpObj.addResource(3, -stealCount);
                            }

                            // MELEE HIT PLAYER:
                            let dmgMlt = variantDmg;
                            if (tmpObj.weaponIndex != undefined && items.weapons[tmpObj.weaponIndex].shield && UTILS.getAngleDist(tmpDir + Math.PI, tmpObj.dir) <= config.shieldAngle) {
                                dmgMlt = items.weapons[tmpObj.weaponIndex].shield;
                            }
                            const baseDmg = items.weapons[this.weaponIndex].dmg;
                            let dmgVal = baseDmg * (this.skin && this.skin.dmgMultO ? this.skin.dmgMultO : 1) * (this.tail && this.tail.dmgMultO ? this.tail.dmgMultO : 1);
                            // SERVER: Dragon Cape / Super Cape / admin damage
                            if (this.dragonUntil > Date.now()) dmgVal *= EFFECT.dragonCapeDamage;
                            if (this.superUntil > Date.now()) dmgVal *= EFFECT.superCapeDamage;
                            dmgVal *= this.powers.power;
                            const tmpSpd = 0.3 * (tmpObj.weightM || 1) + (items.weapons[this.weaponIndex].knock || 0);
                            tmpObj.xVel += tmpSpd * mathCOS(tmpDir);
                            tmpObj.yVel += tmpSpd * mathSIN(tmpDir);
                            if (this.skin && this.skin.healD) this.changeHealth(dmgVal * dmgMlt * this.skin.healD, this);
                            if (this.tail && this.tail.healD) this.changeHealth(dmgVal * dmgMlt * this.tail.healD, this);
                            if (tmpObj.skin && tmpObj.skin.dmg) this.changeHealth(-baseDmg * tmpObj.skin.dmg, tmpObj);
                            if (tmpObj.tail && tmpObj.tail.dmg) this.changeHealth(-baseDmg * tmpObj.tail.dmg, tmpObj);
                            if (tmpObj.dmgOverTime && this.skin && this.skin.poisonDmg && !(tmpObj.skin && tmpObj.skin.poisonRes)) {
                                tmpObj.dmgOverTime.dmg = this.skin.poisonDmg;
                                tmpObj.dmgOverTime.time = this.skin.poisonTime || 1;
                                tmpObj.dmgOverTime.doer = this;
                            }
                            if (tmpObj.dmgOverTime && applyPoison && !(tmpObj.skin && tmpObj.skin.poisonRes)) {
                                tmpObj.dmgOverTime.dmg = 5;
                                tmpObj.dmgOverTime.time = 5;
                                tmpObj.dmgOverTime.doer = this;
                            }
                            // SERVER: Devils Tail bleed, Thorns / emerald lifesteal, Dragon Cape timer
                            if (tmpObj.isPlayer && tmpObj.dmgOverTime && hasTail(this, TAIL.DEVILS_TAIL) && !tmpObj.dmgOverTime.dmg) {
                                tmpObj.dmgOverTime.dmg = EFFECT.devilsTailDmg;
                                tmpObj.dmgOverTime.time = EFFECT.devilsTailTime;
                                tmpObj.dmgOverTime.doer = this;
                            }
                            if (tmpObj.isPlayer && hasTail(this, TAIL.THORNS)) this.changeHealth(dmgVal * dmgMlt * EFFECT.thornsHeal, this);
                            if (tmpVariant.lifesteal) this.changeHealth(dmgVal * dmgMlt * tmpVariant.lifesteal, this);
                            if (tmpObj.isPlayer && hasTail(this, TAIL.DRAGON_CAPE)) this.dragonUntil = Date.now() + EFFECT.dragonCapeTime;
                            if (tmpObj.skin && tmpObj.skin.dmgK) {
                                this.xVel -= tmpObj.skin.dmgK * mathCOS(tmpDir);
                                this.yVel -= tmpObj.skin.dmgK * mathSIN(tmpDir);
                            }
                            tmpObj.changeHealth(-dmgVal * dmgMlt, this, this);
                        }
                    }
                }
            }

            // SEND FOR ANIMATION:
            this.sendAnimation(hitSomething ? 1 : 0);
        };

        // SEND ANIMATION:
        this.sendAnimation = function (hit) {
            const atkSpd = this.skin && this.skin.atkSpd ? this.skin.atkSpd : 1;
            for (let i = 0; i < players.length; ++i) {
                if (this.sentTo[players[i].id] && this.canSee(players[i])) {
                    if (atkSpd != 1) server.send(players[i].id, "K", this.sid, hit ? 1 : 0, this.weaponIndex, 1 / atkSpd);
                    else server.send(players[i].id, "K", this.sid, hit ? 1 : 0, this.weaponIndex);
                }
            }
        };

        // ANIMATE:
        let tmpRatio = 0;
        let animIndex = 0;
        this.animate = function (delta) {
            if (this.animTime > 0) {
                this.animTime -= delta;
                if (this.animTime <= 0) {
                    this.animTime = 0;
                    this.dirPlus = 0;
                    tmpRatio = 0;
                    animIndex = 0;
                } else if (animIndex == 0) {
                    tmpRatio += delta / (this.animSpeed * config.hitReturnRatio);
                    this.dirPlus = UTILS.lerp(0, this.targetAngle, Math.min(1, tmpRatio));
                    if (tmpRatio >= 1) {
                        tmpRatio = 1;
                        animIndex = 1;
                    }
                } else {
                    tmpRatio -= delta / (this.animSpeed * (1 - config.hitReturnRatio));
                    this.dirPlus = UTILS.lerp(0, this.targetAngle, Math.max(0, tmpRatio));
                }
            }
        };

        // GATHER ANIMATION:
        this.startAnim = function (didHit, index, speed) {
            this.animTime = this.animSpeed = items.weapons[index].speed / (speed || 1);
            this.targetAngle = didHit ? -config.hitAngle : -Math.PI;
            tmpRatio = 0;
            animIndex = 0;
        };

        // CAN SEE:
        this.canSee = function (other) {
            if (!other) return false;
            if (other.skin && other.skin.invisTimer && other.noMovTimer >= other.skin.invisTimer) return false;
            // SERVER: admin invisibility (staff still see each other)
            if (other.isPlayer && other.powers && other.powers.invisible && other !== this && !this.role) return false;
            const dx = mathABS(other.x - this.x) - other.scale;
            const dy = mathABS(other.y - this.y) - other.scale;
            return dx <= config.maxScreenWidth / 2 * 1.3 && dy <= config.maxScreenHeight / 2 * 1.3;
        };

        // SERVER: admin power multipliers (size / health) take effect immediately.
        this.applyPowers = function () {
            if (!this.alive) return;
            const ratio = this.maxHealth ? this.health / this.maxHealth : 1;
            this.scale = config.playerScale * this.powers.size;
            this.maxHealth = 100 * this.powers.health;
            this.health = Math.max(1, Math.round(this.maxHealth * ratio));
        };

        // SERVER: displayed hat (Shame! overrides the worn hat while active).
        this.displaySkin = function () {
            return this.shameTimer > 0 ? HAT.SHAME : this.skinIndex;
        };
    }
}
