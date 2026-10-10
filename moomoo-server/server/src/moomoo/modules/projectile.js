export class Projectile {
    constructor(players, ais, objectManager, items, config, UTILS, server) {
        // INIT:
        this.init = function(indx, x, y, dir, spd, dmg, rng, scl, owner) {
            this.active = true;
            this.indx = indx;
            this.x = x;
            this.y = y;
            this.dir = dir;
            this.skipMov = true;
            this.speed = spd;
            this.dmg = dmg;
            this.scale = scl;
            this.range = rng;
            this.owner = owner;
            if (server) {
                this.sentTo = {};
            }
        };

        // UPDATE:
        var objectsHit = [];
        var tmpObj;
        this.update = function(delta) {
            if (this.active) {
                var tmpSpeed = this.speed * delta;
                var tmpScale;
                if (!this.skipMov) {
                    this.x += tmpSpeed * Math.cos(this.dir);
                    this.y += tmpSpeed * Math.sin(this.dir);
                    this.range -= tmpSpeed;
                    if (this.range <= 0) {
                        this.x += this.range * Math.cos(this.dir);
                        this.y += this.range * Math.sin(this.dir);
                        tmpSpeed = 1;
                        this.range = 0;
                        this.active = false;
                    }
                } else {
                    this.skipMov = false;
                }
                if (server) {
                    for (var i = 0; i < players.length; ++i) {
                        if (!this.sentTo[players[i].id] && players[i].canSee(this)) {
                            this.sentTo[players[i].id] = 1;
                            players[i].send("X", UTILS.fixTo(this.x, 1), UTILS.fixTo(this.y, 1), UTILS.fixTo(this.dir, 2), UTILS.fixTo(this.range, 1), this.speed, this.indx, this.layer, this.sid);
                        }
                    }
                    objectsHit.length = 0;
                    for (var i = 0; i < players.length + ais.length; ++i) {
                        tmpObj = players[i] || ais[i - players.length];
                        if (tmpObj.alive && tmpObj != this.owner && !(this.owner.team && tmpObj.team == this.owner.team)) {
                            if (UTILS.lineInRect(tmpObj.x - tmpObj.scale, tmpObj.y - tmpObj.scale, tmpObj.x + tmpObj.scale, tmpObj.y + tmpObj.scale, this.x, this.y, this.x + tmpSpeed * Math.cos(this.dir), this.y + tmpSpeed * Math.sin(this.dir))) {
                                objectsHit.push(tmpObj);
                            }
                        }
                    }
                    var tmpList = objectManager.getGridArrays(this.x, this.y, this.scale);
                    for (var x = 0; x < tmpList.length; ++x) {
                        for (var y = 0; y < tmpList[x].length; ++y) {
                            tmpObj = tmpList[x][y];
                            tmpScale = tmpObj.getScale();
                            if (tmpObj.active && !(this.ignoreObj == tmpObj.sid) && this.layer <= tmpObj.layer && objectsHit.indexOf(tmpObj) < 0 && !tmpObj.ignoreCollision && UTILS.lineInRect(tmpObj.x - tmpScale, tmpObj.y - tmpScale, tmpObj.x + tmpScale, tmpObj.y + tmpScale, this.x, this.y, this.x + tmpSpeed * Math.cos(this.dir), this.y + tmpSpeed * Math.sin(this.dir))) {
                                objectsHit.push(tmpObj);
                            }
                        }
                    }

                    // HIT OBJECTS:
                    if (objectsHit.length > 0) {
                        var hitObj = null;
                        var shortDist = null;
                        var tmpDist = null;
                        for (var i = 0; i < objectsHit.length; ++i) {
                            tmpDist = UTILS.getDistance(this.x, this.y, objectsHit[i].x, objectsHit[i].y);
                            if (shortDist == null || tmpDist < shortDist) {
                                shortDist = tmpDist;
                                hitObj = objectsHit[i];
                            }
                        }
                        if (hitObj.isPlayer || hitObj.isAI) {
                            var tmpSd = 0.3 * (hitObj.weightM || 1);
                            hitObj.xVel += tmpSd * Math.cos(this.dir);
                            hitObj.yVel += tmpSd * Math.sin(this.dir);
                            if (hitObj.weaponIndex == undefined || !(items.weapons[hitObj.weaponIndex].shield && UTILS.getAngleDist(this.dir + Math.PI, hitObj.dir) <= config.shieldAngle)) {
                                hitObj.changeHealth(-this.dmg, this.owner, this.owner, this);
                            }
                        } else {
                            if (hitObj.projDmg && hitObj.health && hitObj.changeHealth(-this.dmg)) {
                                objectManager.disableObj(hitObj);
                            }
                            for (var i = 0; i < players.length; ++i) {
                                if (players[i].active) {
                                    if (hitObj.sentTo[players[i].id]) {
                                        if (hitObj.active) {
                                            if (players[i].canSee(hitObj)) {
                                                players[i].send("L", UTILS.fixTo(this.dir, 2), hitObj.sid);
                                            }
                                        } else {
                                            players[i].send("Q", hitObj.sid);
                                        }
                                    }
                                    if (!hitObj.active && hitObj.owner == players[i]) {
                                        players[i].changeItemCount(hitObj.group.id, -1);
                                    }
                                }
                            }
                        }
                        this.active = false;
                        for (var i = 0; i < players.length; ++i) {
                            if (this.sentTo[players[i].id]) {
                                players[i].send("Y", this.sid, UTILS.fixTo(shortDist, 1));
                            }
                        }
                    }
                }
            }
        };
    };
}
