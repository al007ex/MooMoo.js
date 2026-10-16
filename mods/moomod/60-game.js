            // =====================================================================
            // 60-game — what runs on every message from the server, and the placing
            //           / hat helpers the keys use.
            // =====================================================================
            const toRad = (deg) => deg * 0.01745329251;                            // _0x560119
            const rowDist = (row, p) => Math.sqrt(Math.pow(p.y - row[2], 2) + Math.pow(p.x - row[1], 2));   // _0x4baa25
            const pointDist = (a, b) => Math.sqrt(Math.pow(b.y - a.y, 2) + Math.pow(b.x - a.x, 2));        // _0x159941

            // _0x7b8d3a: select an item, click it down at `dir`, release, and pick the weapon back up.
            // Without a direction it built toward the mouse — through tracking that was never set
            // up (a NaN), so the server built where you were looking. Same here.
            function place(item, dir = Math.atan2(mouseY - canvasH / 2, mouseX - canvasW / 2)) {
                if (!roomFor(2, 2)) return;                                     // PORT: whole or not at all
                send(["5", [item, null]]);
                send(["c", [1, dir]]);
                send(["c", [0, dir]]);
                send(["5", [me.weapon, true]]);
            }
            // _0x496749 (document.ps): the same, but it leaves the item in your hand
            function placeRaw(item, dir) {
                if (!roomFor(1, 2)) return;
                send(["5", [item, null]]);
                send(["c", [1, dir ? dir : null]]);
                send(["c", [0, null]]);
            }
            function setHat(id) { send(["13c", [0, id, 0]]); }                    // _0x8be189
            function setAcc(id) {                                                   // _0x1c538f
                send(["13c", [0, 0, 1]]);
                send(["13c", [0, id, 1]]);
            }

            // _0x37eb0d: which items you have, read off the action bar (the last visible one wins)
            function scanActionBar() {
                const shown = (i) => isShown(byId("actionBarItem" + i));
                for (let i = 0; i < 9; i++) if (shown(i)) primarySlot = i;
                for (let i = 9; i < 16; i++) if (shown(i)) secondarySlot = i;
                for (let i = 16; i < 19; i++) if (shown(i)) foodSlot = i - 16;
                for (let i = 19; i < 22; i++) if (shown(i)) wallSlot = i - 16;
                for (let i = 22; i < 26; i++) if (shown(i)) spikeSlot = i - 16;
                for (let i = 26; i < 29; i++) if (shown(i)) millSlot = i - 16;
                for (let i = 29; i < 31; i++) if (shown(i)) mineSlot = i - 16;
                for (let i = 31; i < 33; i++) if (shown(i)) trapSlot = i - 16;
                for (let i = 33; i < 39; i++) if (shown(i) && i != 36) utilitySlot = i - 16;
                spawnPadSlot = 36;
            }
            // _0x459f4d / _0x479f45 / _0x3458cb: the spike tier in your bar
            const hasPoisonSpikes = () => isShown(byId("actionBarItem24"));
            const hasGreaterSpikes = () => isShown(byId("actionBarItem23"));
            const hasSpinningSpikes = () => isShown(byId("actionBarItem25"));
            const bestSpikes = () => hasPoisonSpikes() ? 8 : hasGreaterSpikes() ? 7 : hasSpinningSpikes() ? 9 : 6;

            // _0x54d060: every server frame, as [type, ...args]
            function onMessage(data) {
                const type = data[0];
                if (type == "1" && me.id == null) me.id = data[1];

                // "33": you + everyone not in your tribe
                if (type == "33") {
                    enemyRows = [];
                    const rows = data[1];
                    for (let i = 0; i < rows.length / 13; i++) {
                        const row = rows.slice(13 * i, 13 * i + 13);
                        if (row[0] == me.id) {
                            me.x = row[1];
                            me.y = row[2];
                            me.dir = row[3];
                            me.object = row[4];
                            me.weapon = row[5];
                            me.clan = row[7];
                            me.isLeader = row[8];
                            me.hat = row[9];
                            me.accessory = row[10];
                            me.isSkull = row[11];
                        } else if (row[7] != me.clan || row[7] === null) {
                            enemyRows.push(row);
                        }
                    }
                }

                // the closest enemy: aim there; within 205 it's bull helmet time and the HUD goes red
                enemyNear = false;
                if (enemyRows) nearestEnemy = enemyRows.sort((a, b) => rowDist(a, me) - rowDist(b, me))[0];
                if (nearestEnemy) {
                    enemyDir = Math.atan2(nearestEnemy[2] - me.y, nearestEnemy[1] - me.x);
                    if (Math.sqrt(Math.pow(me.y - nearestEnemy[2], 2) + Math.pow(me.x - nearestEnemy[1], 2)) < 205) {
                        enemyNear = true;
                        hitHat = idOf("Bull Helmet");
                        hitAcc = idOf("Corrupt X Wings");
                        hudColour("Red");
                        if (autoAim == false && me.hat != 7 && me.hat != 53) {
                            biomeHat = 6;                                       // soldier helmet
                            if (primarySlot != 8) biomeAcc = 21;                // corrupt x wings (not with the stick)
                        }
                    }
                }
                // nobody close: tank gear for hits, monkey tail, and the biome's hat (+ HUD colour)
                if (enemyNear == false && autoAim == false) {
                    biomeAcc = 11;
                    hitHat = idOf("Tank Gear");
                    hitAcc = idOf("Corrupt X Wings");
                    if (me.y < 2400) {
                        biomeHat = 15;                                          // winter cap
                        hudColour("White", "White");
                    } else if (me.y > 6850 && me.y < 7550) {
                        hudColour("Blue", "blue");
                        biomeHat = 31;                                          // flipper hat
                    } else {
                        biomeHat = 12;                                          // booster hat
                        hudColour("Green", "Green");
                    }
                }
                if (!nearestEnemy) enemyDir = me.dir;

                // auto heal: 120 ms after you get hurt, eat (the "c" frames carry no direction, so
                // the swing hat dance runs around it too)
                if (type == "h" && data[1] == me.id) {
                    if (data[2] < 100 && data[2] > 0 && autoHeal == 1) {
                        setTimeout(() => { place(foodSlot, null); }, healDelay);
                    }
                }
                scanActionBar();
                if (repeatLast) send(["ch", [lastChat]]);
                scanActionBar();

                // scriptsourceapp "attack" / "run" modes
                let attack = attackMode;
                for (const mode of Object.values(modeState)) {
                    if (mode.rel == "attack") attack = mode.active == true ? true : attackMode;
                    else if (mode.rel == "run") runMode = mode.active == true;
                }
                attackMode = attack;

                // the right click / B instas aim on every message while they run
                if (instaRunning) send(["2", [cloudyAimDir]]);

                // (CloudyMod's own player branch, "3", sat here — the server never sent "3")

                // "6": objects appeared
                if (type == "6") {
                    const objs = data[1];
                    if (objs[objs.length - 1].toString() == cloudySid) {
                        // the last one is yours: put its icon on the minimap
                        if (win.innerWidth >= 770) {
                            const icon = byId("actionBarItem" + (objs[objs.length - 2] + 16)).style.backgroundImage.toString().match(/url\("(.+)?(?=")/)[1];
                            const map = byId("mapDisplay").getBoundingClientRect();
                            const at = [objs[1], objs[2]].map((v) => 130 * v / 14365);
                            const marker = document.createElement("div");
                            marker.rawX = at[0];
                            marker.rawY = at[1];
                            marker.rimgURL = icon;
                            marker.style = "background-image: url(\"" + icon + "\"); background-size: 12px 12px; width:12px; height:12px; position:absolute; left: " + (map.x + at[0] - 6) + "px; top:" + (map.y + at[1] - 6) + "px; opacity:0; z-index:100; cursor: pointer;";
                            marker.className = "mapTarget";
                            document.getElementsByTagName("body")[0].appendChild(marker);
                            $(marker).animate({ opacity: 1 });
                            mapMarkers[objs[0]] = marker;
                        }
                    } else {
                        // someone's pit trap within 100 of you: ring yourself with spikes (or traps, F2)
                        for (let i = 0; i < objs.length / 8; i += 1) {
                            const obj = objs.slice(i * 8, (i + 1) * 8);
                            if (obj[obj.length - 2] == 15) {
                                const d = Math.sqrt(Math.pow(me.y - objs[2], 2) + Math.pow(me.x - objs[1], 2));
                                if (Math.round(d) < 100) {
                                    const item = antiTrapItem == "Spike" ? spikeSlot : trapSlot;
                                    for (let j = 0; j < 4; j++) place(item, me.dir + toRad(j * 90));
                                    // the original reused its loop counter for that ring, which jumps the
                                    // scan to the 6th object (and from there could spin forever and hang
                                    // the tab — PORT: that part stops instead)
                                    if (i >= 5) break;
                                    i = 4;
                                }
                            }
                        }
                    }
                }

                // "12": an object broke
                if (type == "12") {
                    nearbyTraps = nearbyTraps.filter((t) => t[t.length - 2] != data[1]);
                    if (Object.keys(mapMarkers).includes(data[1].toString())) mapMarkers[data[1]].remove();
                    if (modeState.intrap.active && modeState.intrap.extra == data[1]) {
                        modeState.intrap.active = false;
                        nearbyTraps = nearbyTraps.filter((t) => t[t.length - 2] != data[1]);
                    }
                }
                if (type == "1" && !cloudySid) cloudySid = data[1];
                if (type == "18" && data[4] == "1200") sawCrossbowShot = true;   // a crossbow shot

                if (type == "h" && data[1] == cloudySid && cloudyAutoHeal) {
                    // CloudyMod's heal (Firefox only, see the keypress handler) — it calls a heal()
                    // nobody defined, so all it ever did was throw
                    if (data[2] < 100 && data[2] > 0) {
                        cloudyHealth = data[2];
                        setTimeout(() => { throw new ReferenceError("heal is not defined"); }, healDelayCloudy);
                    } else if (data[2] > 0) {
                        cloudyHealth = 100;
                        if (badThingFix) send(["5", [0, true]]);
                    } else {
                        hasApple = true;
                    }
                } else if (type == "11") {
                    // you died: your markers fade (and only come back for new buildings)
                    for (const marker of Object.values(mapMarkers)) marker.style.opacity = 0;
                    hasApple = true;
                    isDead = true;
                    cloudyHealth = 100;
                }
            }
