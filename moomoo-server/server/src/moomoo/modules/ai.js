// AI
// Port of the animal class shipped in the official client bundle ([xu]).
// Shared logic is kept line for line; "SERVER:" marks server-only additions:
//   - the Crab King lives in the secret pool and dives / surfaces
//     (client "state": 0 surfaced, 1 diving, 2 submerged, 3 emerging)
//   - the Crab King raid boss (telegraphed attacks sent with packet "W")
//   - kill bookkeeping for profiles / leaderboards (animal kills, bosses, Crab Shell)

import { secretDistance } from "./effects.js";

// inside one of the secret pools with `margin` to spare
function inPool(config, x, y, margin) {
    return config.secretPool.pool.some(p => Math.hypot(x - p[0], y - p[1]) <= p[2] - margin);
}

const PI2 = Math.PI * 2;
const SPEED_RANDOM = 0; // [_s] in the client: the MAX_* tuning terms are multiplied by it

// "W" effect kinds ([ka], [Oo], [Ji] and the default renderer in the client)
export const EFFECT_KIND = {
    SPLASH: 1,  // blue ring, white splash (surfacing)
    GEYSER: 2,  // bubble geyser with a dotted rim
    SLAM: 3,    // orange disc
    CLAW: 4     // red chevron line
};
const BOSS_DAMAGE = { 1: 1.5, 2: 0.8, 3: 1.5, 4: 1.2 };
const BOSS_KNOCK = { 1: 1.2, 2: 0.6, 3: 1.4, 4: 0.9 };

const STATE = { SURFACE: 0, DIVING: 1, SUBMERGED: 2, EMERGING: 3 };
const DIVE_TIME = 700;
const EMERGE_TIME = 1650;

export class AI {

    constructor(sid, objectManager, players, items, UTILS, config, scoreCallback, server, hooks = {}) {
        this.sid = sid;
        this.isAI = true;
        this.nameIndex = UTILS.randInt(0, config.cowNames.length - 1);

        // INIT:
        this.init = function (x, y, dir, index, data) {
            this.x = x;
            this.y = y;
            this.startX = data.fixedSpawn ? x : null;
            this.startY = data.fixedSpawn ? y : null;
            this.xVel = 0;
            this.yVel = 0;
            this.zIndex = 0;
            this.dir = dir;
            this.dirPlus = 0;
            this.index = index;
            this.src = data.src;
            if (data.name) this.name = data.name;
            this.weightM = data.weightM;
            this.speed = data.speed;
            this.killScore = data.killScore;
            this.turnSpeed = data.turnSpeed;
            this.scale = data.scale;
            this.maxHealth = data.health;
            this.leapForce = data.leapForce;
            this.health = this.maxHealth;
            this.chargePlayer = data.chargePlayer;
            this.viewRange = data.viewRange;
            this.drop = data.drop;
            this.dmg = data.dmg;
            this.hostile = data.hostile;
            this.dontRun = data.dontRun;
            this.hitRange = data.hitRange;
            this.hitDelay = data.hitDelay;
            this.hitScare = data.hitScare;
            this.spriteMlt = data.spriteMlt;
            this.nameScale = data.nameScale;
            this.colDmg = data.colDmg;
            this.noTrap = data.noTrap;
            this.spawnDelay = data.spawnDelay;
            this.minSpawnRange = data.minSpawnRange;
            this.maxSpawnRange = data.maxSpawnRange;
            this.hitWait = 0;
            this.waitCount = 1000;
            this.moveCount = 0;
            this.targetDir = 0;
            this.active = true;
            this.alive = true;
            this.runFrom = null;
            this.chargeTarget = null;
            this.dmgOverTime = {};

            // SERVER:
            this.boss = Boolean(data.boss);
            this.secret = this.boss;
            this.state = STATE.SURFACE;
            this.stateTimer = 0;
            this.submerged = false;
            this.damageBy = new Map();
            this.bossAttack = null;
            this.bossCooldown = 3000;
        };

        // UPDATE:
        let timerCount = 0;
        this.update = function (delta) {
            if (this.active) {

                // SPAWN DELAY:
                if (this.spawnCounter) {
                    this.spawnCounter -= delta * 1;
                    if (this.spawnCounter <= 0) {
                        this.spawnCounter = 0;
                        if (this.minSpawnRange || this.maxSpawnRange) {
                            const min = config.mapScale * this.minSpawnRange;
                            const max = config.mapScale * this.maxSpawnRange;
                            this.x = UTILS.randInt(min, max);
                            this.y = UTILS.randInt(min, max);
                        } else if (this.secret && !this.startX && hooks.respawnAt) {
                            const spot = hooks.respawnAt(this);
                            this.x = spot.x;
                            this.y = spot.y;
                        } else {
                            this.x = this.startX || UTILS.randInt(0, config.mapScale);
                            this.y = this.startY || UTILS.randInt(0, config.mapScale);
                        }
                    }
                    return;
                }

                // REGENS AND AUTO:
                timerCount -= delta;
                if (timerCount <= 0) {
                    if (this.dmgOverTime.dmg) {
                        this.changeHealth(-this.dmgOverTime.dmg, this.dmgOverTime.doer);
                        this.dmgOverTime.time -= 1;
                        if (this.dmgOverTime.time <= 0) this.dmgOverTime.dmg = 0;
                    }
                    timerCount = 1000;
                }

                // SERVER: the Crab King dives and surfaces
                if (this.boss) this.updateDive(delta);
                if (this.boss) {
                    this.updateBoss(delta);
                    return;
                }

                // BEHAVIOUR:
                let charging = false;
                let slowMlt = 1;
                if (!this.zIndex && !this.lockMove && this.x >= 0 && this.y >= config.mapScale / 2 - config.riverWidth / 2 && this.y <= config.mapScale / 2 + config.riverWidth / 2) {
                    slowMlt = 0.33;
                    this.xVel += config.waterCurrent * delta;
                }
                if (this.lockMove) {
                    this.xVel = 0;
                    this.yVel = 0;
                } else if (this.waitCount > 0) {
                    this.waitCount -= delta;
                    if (this.waitCount <= 0) {
                        if (this.chargePlayer) {
                            let tmpPlayer;
                            let tmpDist;
                            let tmpCheck;
                            for (let i = 0; i < players.length; ++i) {
                                if (players[i].alive && !(players[i].skin && players[i].skin.bullRepel) && !(players[i].powers && players[i].powers.invisible) && (!this.secret || players[i].x < 0)) {
                                    tmpCheck = UTILS.getDistance(this.x, this.y, players[i].x, players[i].y);
                                    if (tmpCheck <= this.viewRange && (!tmpPlayer || tmpCheck < tmpDist)) {
                                        tmpDist = tmpCheck;
                                        tmpPlayer = players[i];
                                    }
                                }
                            }
                            if (tmpPlayer) {
                                this.chargeTarget = tmpPlayer;
                                this.moveCount = UTILS.randInt(8000, 12000);
                            } else {
                                this.moveCount = UTILS.randInt(1000, 2000);
                                this.targetDir = UTILS.randFloat(-Math.PI, Math.PI);
                            }
                        } else {
                            this.moveCount = UTILS.randInt(4000, 10000);
                            this.targetDir = UTILS.randFloat(-Math.PI, Math.PI);
                        }
                    }
                } else if (this.moveCount > 0) {
                    let tmpSpd = this.speed * slowMlt * (1 + config.MAX_SPEED * SPEED_RANDOM);
                    if (this.runFrom && this.runFrom.active && !(this.runFrom.isPlayer && !this.runFrom.alive)) {
                        this.targetDir = UTILS.getDirection(this.x, this.y, this.runFrom.x, this.runFrom.y);
                        tmpSpd *= 1.42;
                    } else if (this.chargeTarget && this.chargeTarget.alive) {
                        this.targetDir = UTILS.getDirection(this.chargeTarget.x, this.chargeTarget.y, this.x, this.y);
                        tmpSpd *= 1.75;
                        charging = true;
                    }
                    if (this.hitWait) tmpSpd *= 0.3;
                    if (this.submerged) tmpSpd *= 1.6;
                    if (this.dir != this.targetDir) {
                        this.dir %= PI2;
                        const netAngle = (this.dir - this.targetDir + PI2) % PI2;
                        const amnt = Math.min(Math.abs(netAngle - PI2), netAngle, this.turnSpeed * delta);
                        const sign = netAngle - Math.PI >= 0 ? 1 : -1;
                        this.dir += sign * amnt + PI2;
                    }
                    this.dir %= PI2;
                    this.xVel += tmpSpd * delta * Math.cos(this.dir);
                    this.yVel += tmpSpd * delta * Math.sin(this.dir);
                    this.moveCount -= delta;
                    if (this.moveCount <= 0) {
                        this.runFrom = null;
                        this.chargeTarget = null;
                        this.waitCount = this.hostile ? 1500 : UTILS.randInt(1500, 6000);
                    }
                }

                // OBJECT COLL:
                this.zIndex = 0;
                this.lockMove = false;
                let tmpList;
                const tmpSpeed = UTILS.getDistance(0, 0, this.xVel * delta, this.yVel * delta);
                const depth = Math.min(4, Math.max(1, Math.round(tmpSpeed / 40)));
                const tMlt = 1 / depth;
                for (let i = 0; i < depth; ++i) {
                    const prevX = this.x;
                    const prevY = this.y;
                    if (this.xVel) this.x += this.xVel * delta * tMlt;
                    if (this.yVel) this.y += this.yVel * delta * tMlt;
                    if (this.secret) this.keepInSecret(prevX, prevY);
                    tmpList = objectManager.getGridArrays(this.x, this.y, this.scale);
                    for (let x = 0; x < tmpList.length; ++x) {
                        for (let y = 0; y < tmpList[x].length; ++y) {
                            if (tmpList[x][y].active) objectManager.checkCollision(this, tmpList[x][y], tMlt);
                        }
                    }
                }

                // HITTING:
                let hitting = false;
                if (this.hitWait > 0) {
                    this.hitWait -= delta;
                    if (this.hitWait <= 0) {
                        hitting = true;
                        this.hitWait = 0;
                        if (this.leapForce && !UTILS.randInt(0, 2)) {
                            this.xVel += this.leapForce * Math.cos(this.dir);
                            this.yVel += this.leapForce * Math.sin(this.dir);
                        }
                        tmpList = objectManager.getGridArrays(this.x, this.y, this.hitRange);
                        let tmpObj;
                        let tmpDst;
                        for (let t = 0; t < tmpList.length; ++t) {
                            for (let x = 0; x < tmpList[t].length; ++x) {
                                tmpObj = tmpList[t][x];
                                if (tmpObj.health) {
                                    tmpDst = UTILS.getDistance(this.x, this.y, tmpObj.x, tmpObj.y);
                                    if (tmpDst < tmpObj.scale + this.hitRange) {
                                        if (tmpObj.changeHealth(-this.dmg * 5)) objectManager.disableObj(tmpObj);
                                        objectManager.hitObj(tmpObj, UTILS.getDirection(this.x, this.y, tmpObj.x, tmpObj.y));
                                    }
                                }
                            }
                        }
                        for (let x = 0; x < players.length; ++x) {
                            if (players[x].canSee(this)) server.send(players[x].id, "J", this.sid);
                        }
                    }
                }

                // PLAYER COLLISIONS:
                if ((charging || hitting) && !this.submerged) {
                    let tmpObj;
                    let tmpDst;
                    let tmpDir;
                    for (let i = 0; i < players.length; ++i) {
                        tmpObj = players[i];
                        if (tmpObj && tmpObj.alive) {
                            tmpDst = UTILS.getDistance(this.x, this.y, tmpObj.x, tmpObj.y);
                            if (this.hitRange) {
                                if (!this.hitWait && tmpDst <= this.hitRange + tmpObj.scale) {
                                    if (hitting) {
                                        tmpDir = UTILS.getDirection(tmpObj.x, tmpObj.y, this.x, this.y);
                                        tmpObj.changeHealth(-this.dmg * (1 + config.MAX_ATTACK * SPEED_RANDOM));
                                        tmpObj.xVel += 0.6 * Math.cos(tmpDir);
                                        tmpObj.yVel += 0.6 * Math.sin(tmpDir);
                                        this.runFrom = null;
                                        this.chargeTarget = null;
                                        this.waitCount = 3000;
                                        this.hitWait = !UTILS.randInt(0, 2) ? 600 : 0;
                                    } else {
                                        this.hitWait = this.hitDelay;
                                    }
                                }
                            } else if (tmpDst <= this.scale + tmpObj.scale) {
                                tmpDir = UTILS.getDirection(tmpObj.x, tmpObj.y, this.x, this.y);
                                tmpObj.changeHealth(-this.dmg * (1 + config.MAX_ATTACK * SPEED_RANDOM));
                                tmpObj.xVel += 0.55 * Math.cos(tmpDir);
                                tmpObj.yVel += 0.55 * Math.sin(tmpDir);
                            }
                        }
                    }
                }

                // DECEL:
                if (this.xVel) this.xVel *= Math.pow(config.playerDecel, delta);
                if (this.yVel) this.yVel *= Math.pow(config.playerDecel, delta);

                // MAP BOUNDARIES:
                const tmpScale = this.scale;
                if (!this.secret) {
                    if (this.x - tmpScale < 0) {
                        this.x = tmpScale;
                        this.xVel = 0;
                    } else if (this.x + tmpScale > config.mapScale) {
                        this.x = config.mapScale - tmpScale;
                        this.xVel = 0;
                    }
                }
                if (this.y - tmpScale < 0) {
                    this.y = tmpScale;
                    this.yVel = 0;
                } else if (this.y + tmpScale > config.mapScale) {
                    this.y = config.mapScale - tmpScale;
                    this.yVel = 0;
                }
            }
        };

        // CAN SEE:
        this.canSee = function (other) {
            if (!other) return false;
            if (other.skin && other.skin.invisTimer && other.noMovTimer >= other.skin.invisTimer) return false;
            const dx = Math.abs(other.x - this.x) - other.scale;
            const dy = Math.abs(other.y - this.y) - other.scale;
            return dx <= config.maxScreenWidth / 2 * 1.3 && dy <= config.maxScreenHeight / 2 * 1.3;
        };

        // ANIMATION:
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

        this.startAnim = function () {
            this.animTime = this.animSpeed = 600;
            this.targetAngle = Math.PI * 0.8;
            tmpRatio = 0;
            animIndex = 0;
        };

        // CHANGE HEALTH:
        this.changeHealth = function (val, doer, runFrom) {
            if (this.active) {
                // SERVER: the Crab King can't be hit while it is under water
                if (val < 0 && this.submerged) return false;
                this.health += val;
                if (runFrom) {
                    if (this.hitScare && !UTILS.randInt(0, this.hitScare)) {
                        this.runFrom = runFrom;
                        this.waitCount = 0;
                        this.moveCount = 2000;
                    } else if (this.hostile && this.chargePlayer && runFrom.isPlayer) {
                        this.chargeTarget = runFrom;
                        this.waitCount = 0;
                        this.moveCount = 8000;
                    } else if (!this.dontRun) {
                        this.runFrom = runFrom;
                        this.waitCount = 0;
                        this.moveCount = 2000;
                    }
                }
                if (val < 0 && this.hitRange && UTILS.randInt(0, 1)) this.hitWait = 500;
                if (doer && doer.canSee(this) && val < 0) {
                    server.send(doer.id, "8", Math.round(this.x), Math.round(this.y), Math.round(-val), 1);
                }
                // SERVER: damage bookkeeping
                if (val < 0 && doer && doer.isPlayer) {
                    this.damageBy.set(doer, (this.damageBy.get(doer) || 0) - val);
                    if (doer.lifeStats) doer.lifeStats.animalDamage += -val;
                }
                if (this.health <= 0) {
                    if (hooks.onKill) hooks.onKill(this, doer);
                    const reward = hooks.killScore ? hooks.killScore(this, doer) : this.killScore;
                    // SERVER: animals spawned from the admin console don't respawn
                    if (this.despawnOnDeath) {
                        this.active = false;
                        this.alive = false;
                        this.x = -1000000;
                        this.y = -1000000;
                        if (doer) scoreCallback(doer, reward);
                        return true;
                    }
                    const respawn = hooks.respawnAt ? hooks.respawnAt(this) : null;
                    if (this.spawnDelay) {
                        this.spawnCounter = this.spawnDelay;
                        this.x = -1000000;
                        this.y = -1000000;
                    } else if (this.minSpawnRange || this.maxSpawnRange) {
                        const min = config.mapScale * this.minSpawnRange;
                        const max = config.mapScale * this.maxSpawnRange;
                        this.x = UTILS.randInt(min, max);
                        this.y = UTILS.randInt(min, max);
                    } else if (respawn && !this.startX) {
                        this.x = respawn.x;
                        this.y = respawn.y;
                    } else {
                        this.x = this.startX || UTILS.randInt(0, config.mapScale);
                        this.y = this.startY || UTILS.randInt(0, config.mapScale);
                    }
                    this.health = this.maxHealth;
                    this.runFrom = null;
                    this.damageBy.clear();
                    this.state = STATE.SURFACE;
                    this.submerged = false;
                    this.bossAttack = null;
                            if (doer) {
                        scoreCallback(doer, reward);
                        if (this.drop) {
                            for (let i = 0; i < this.drop.length;) {
                                doer.addResource(config.resourceTypes.indexOf(this.drop[i]), hooks.dropAmount ? hooks.dropAmount(this, doer, this.drop[i + 1]) : this.drop[i + 1]);
                                i += 2;
                            }
                        }
                    }
                }
                return true;
            }
            return false;
        };

        // ------------------------------------------------------------ SERVER: diving (Crab King)
        this.keepInSecret = function (prevX, prevY) {
            const margin = this.scale * 0.5;
            const inside = (x, y) => x < -margin && secretDistance(config, x + margin, y) <= 0;
            if (inside(this.x, this.y)) return;
            if (inside(prevX, this.y)) {
                this.x = prevX;
                this.xVel = 0;
            } else if (inside(this.x, prevY)) {
                this.y = prevY;
                this.yVel = 0;
            } else {
                this.x = prevX;
                this.y = prevY;
                this.xVel = 0;
                this.yVel = 0;
            }
            this.targetDir += Math.PI / 2;
        };

        this.setState = function (state, time) {
            this.state = state;
            this.stateTimer = time || 0;
            this.submerged = state == STATE.SUBMERGED || state == STATE.DIVING;
        };

        this.dive = function () {
            if (this.state != STATE.SURFACE) return;
            this.setState(STATE.DIVING, DIVE_TIME);
        };

        this.updateDive = function (delta) {
            if (this.state == STATE.SURFACE) return;
            this.stateTimer -= delta;
            if (this.stateTimer > 0) return;
            if (this.state == STATE.DIVING) {
                this.setState(STATE.SUBMERGED, UTILS.randInt(1800, 3600));
            } else if (this.state == STATE.SUBMERGED) {
                this.setState(STATE.EMERGING, EMERGE_TIME);
                if (this.boss) this.telegraph(EFFECT_KIND.SPLASH, this.x, this.y, this.scale + 220, EMERGE_TIME);
            } else if (this.state == STATE.EMERGING) {
                this.setState(STATE.SURFACE, 0);
                if (this.boss) this.landAttack({ kind: EFFECT_KIND.SPLASH, x: this.x, y: this.y, r: this.scale + 220 });
            }
        };

        // ------------------------------------------------------------ SERVER: Crab King
        // Attack set matched to the live game's telegraphs (packet "W", drawn by the client):
        //   kind 3 SLAM    orange disc around the King
        //   kind 2 GEYSER  bubble geysers all over the pool (dotted rings), then a splash
        //   kind 4 CLAW    red chevron line from the King toward a player (a claw wave)
        //   kind 1 SPLASH  blue ring + white splash where the King surfaces after a dive
        this.telegraph = function (kind, x, y, r, duration, x2, y2) {
            for (const player of players) {
                if (player.alive && (player.canSee(this) || UTILS.getDistance(player.x, player.y, x, y) < 1600)) {
                    if (x2 === undefined) server.send(player.id, "W", kind, Math.round(x), Math.round(y), Math.round(r), duration);
                    else server.send(player.id, "W", kind, Math.round(x), Math.round(y), Math.round(r), duration, Math.round(x2), Math.round(y2));
                }
            }
        };

        this.bossTarget = function () {
            let best = null;
            let bestDist = Infinity;
            for (const player of players) {
                if (!player.alive || player.x >= 0 || (player.powers && player.powers.invisible)) continue;
                const dist = UTILS.getDistance(this.x, this.y, player.x, player.y);
                if (dist <= this.viewRange && dist < bestDist) {
                    best = player;
                    bestDist = dist;
                }
            }
            return best;
        };

        this.raiders = function () {
            return players.filter(p => p.alive && p.x < 0 && UTILS.getDistance(this.x, this.y, p.x, p.y) <= this.viewRange);
        };

        // Damage every player caught by one telegraphed strike.
        this.landAttack = function (attack) {
            for (const player of players) {
                if (!player.alive) continue;
                const inside = attack.kind == EFFECT_KIND.CLAW
                    ? distToSegment(player.x, player.y, attack.x, attack.y, attack.x2, attack.y2) <= attack.r + player.scale
                    : UTILS.getDistance(player.x, player.y, attack.x, attack.y) <= attack.r + player.scale;
                if (!inside) continue;
                const dir = attack.kind == EFFECT_KIND.CLAW
                    ? UTILS.getDirection(attack.x2, attack.y2, attack.x, attack.y)
                    : UTILS.getDirection(player.x, player.y, attack.x, attack.y);
                player.changeHealth(-this.dmg * (BOSS_DAMAGE[attack.kind] || 1));
                player.xVel += BOSS_KNOCK[attack.kind] * Math.cos(dir);
                player.yVel += BOSS_KNOCK[attack.kind] * Math.sin(dir);
            }
        };

        this.queueAttack = function (time, strikes, onLand) {
            for (const strike of strikes) this.telegraph(strike.kind, strike.x, strike.y, strike.r, time, strike.x2, strike.y2);
            this.bossAttack = { time, strikes, onLand };
        };

        this.attackSlam = function () {
            this.queueAttack(1300, [{ kind: EFFECT_KIND.SLAM, x: this.x, y: this.y, r: this.scale + 260 }]);
        };

        this.attackGeysers = function () {
            const strikes = [];
            const pools = config.secretPool.pool;
            const r = 110;
            const fits = (x, y) => inPool(config, x, y, r * 0.6) && strikes.every(s => Math.hypot(s.x - x, s.y - y) > r * 2.4);
            // one under every raider, the rest scattered over the water
            for (const p of this.raiders()) {
                if (fits(p.x, p.y)) strikes.push({ kind: EFFECT_KIND.GEYSER, x: p.x, y: p.y, r });
            }
            for (let tries = 0; tries < 400 && strikes.length < 26; tries++) {
                const pool = pools[UTILS.randInt(0, pools.length - 1)];
                const a = Math.random() * PI2;
                const d = Math.sqrt(Math.random()) * pool[2];
                const x = pool[0] + Math.cos(a) * d;
                const y = pool[1] + Math.sin(a) * d;
                if (fits(x, y)) strikes.push({ kind: EFFECT_KIND.GEYSER, x, y, r });
            }
            this.queueAttack(1600, strikes);
        };

        this.attackClaw = function (target) {
            const strikes = [];
            const targets = target ? [target] : [];
            for (const p of this.raiders()) if (targets.length < 3 && !targets.includes(p)) targets.push(p);
            for (const p of targets) {
                const dir = UTILS.getDirection(p.x, p.y, this.x, this.y);
                const len = Math.min(1800, UTILS.getDistance(this.x, this.y, p.x, p.y) + 600);
                strikes.push({ kind: EFFECT_KIND.CLAW, x: this.x, y: this.y, r: 130, x2: this.x + Math.cos(dir) * len, y2: this.y + Math.sin(dir) * len });
            }
            this.dir = strikes.length ? UTILS.getDirection(strikes[0].x2, strikes[0].y2, this.x, this.y) : this.dir;
            this.queueAttack(1150, strikes);
        };

        this.updateBoss = function (delta) {
            const target = this.bossTarget();

            // slow walk toward the nearest raider (faster while submerged), never mid-attack
            if ((this.state == STATE.SURFACE && !this.bossAttack) || this.state == STATE.SUBMERGED) {
                const goal = target || { x: this.startX, y: this.startY };
                const dist = UTILS.getDistance(this.x, this.y, goal.x, goal.y);
                if (dist > this.scale * 0.8) {
                    this.targetDir = UTILS.getDirection(goal.x, goal.y, this.x, this.y);
                    const speed = this.speed * (this.submerged ? 3.2 : 1);
                    const netAngle = (this.dir - this.targetDir + PI2) % PI2;
                    const amnt = Math.min(Math.abs(netAngle - PI2), netAngle, this.turnSpeed * delta * (this.submerged ? 3 : 1));
                    this.dir = (this.dir + (netAngle - Math.PI >= 0 ? 1 : -1) * amnt + PI2) % PI2;
                    this.xVel += speed * delta * Math.cos(this.dir);
                    this.yVel += speed * delta * Math.sin(this.dir);
                }
            }
            const prevX = this.x;
            const prevY = this.y;
            this.x += this.xVel * delta;
            this.y += this.yVel * delta;
            this.keepInSecret(prevX, prevY);
            this.xVel *= Math.pow(config.playerDecel, delta);
            this.yVel *= Math.pow(config.playerDecel, delta);

            // telegraphed attack resolves
            if (this.bossAttack) {
                this.bossAttack.time -= delta;
                if (this.bossAttack.time <= 0) {
                    const attack = this.bossAttack;
                    this.bossAttack = null;
                    for (const strike of attack.strikes) this.landAttack(strike);
                    for (const viewer of players) if (viewer.canSee(this)) server.send(viewer.id, "J", this.sid);
                }
                return;
            }
            if (this.state != STATE.SURFACE) return;

            // forced attack from the admin console ("boss crab attack <move>");
            // it stays queued until a raider is in the pool to aim it at
            const forced = this.nextAttack;
            if (!target) return;
            if (forced) {
                this.nextAttack = null;
                this.bossCooldown = 0;
            }

            this.bossCooldown -= delta;
            if (this.bossCooldown > 0) return;
            // faster and angrier as it loses health
            this.bossCooldown = UTILS.randInt(2000, 3400) * (0.6 + 0.4 * this.health / this.maxHealth);

            const near = UTILS.getDistance(this.x, this.y, target.x, target.y) <= this.scale + 420;
            let move = forced;
            if (!move) {
                const roll = Math.random();
                move = roll < 0.15 ? "dive" : roll < 0.45 ? (near ? "slam" : "claw") : roll < 0.75 ? "geysers" : "claw";
            }
            if (move === "dive") this.dive();
            else if (move === "slam") this.attackSlam();
            else if (move === "geysers") this.attackGeysers();
            else this.attackClaw(target);
        };
    }
}

function distToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = dx * dx + dy * dy;
    let t = len ? ((px - x1) * dx + (py - y1) * dy) / len : 0;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}
