            // =====================================================================
            // 70-keys — every key.
            //   hold V / F / N / H / Q   spike / trap / windmill / turret / food spam
            //   V                        +2 spikes the moment you press it
            //   L / O                    four spikes / four traps around you ("l" also places 4 more)
            //   H                        two turrets at +-45 deg
            //   R                        the insta (bull + polearm, then turret gear + secondary)
            //   right click, Shift+B     the CloudyMod instas
            //   K                        auto trap: four traps around you every 100 ms (toggle)
            //   P                        bot mode: walk at the nearest enemy, auto aim + gather (toggle)
            //   G (release)              stop walking
            //   g (keypress)             repeat your last chat on every message (toggle)
            //   Arrow up / down / left   chat spam / scrolling "MooMod" tribe / "MooMod is op u noob"
            //   - / F2 / ESC / Shift     menus and the biome hat (50-menus)
            // =====================================================================

            // ---- CloudyMod's keypress keys (keypress codes are characters: 103 "g", 108 "l", 66 "B", 80 "P") ----
            function cloudyKeys() {
                listen(document, "keypress", function (e) {
                    if (e.keyCode == 0 && notChatting()) {
                        // CloudyMod's heal toggle. (Firefox gives printable keypresses keyCode 0,
                        // so there every key lands here instead of the ones below.)
                        cloudyHealToggles += 1;
                        cloudyAutoHeal = cloudyHealToggles % 2 == 0;
                        document.title = "Lovable: Autoheal " + (cloudyAutoHeal ? "ON" : "OFF");
                    } else if (e.keyCode == 80 && notChatting()) {
                        updateBotText();
                    } else if (e.keyCode == 103 && notChatting()) {
                        repeatLast = !repeatLast;
                    } else if (0 == cloudySpikeKey && notChatting()) {
                        placeRaw(bestSpikes());
                    } else if (e.keyCode == 66 && notChatting()) {
                        bInsta();
                    } else if (notChatting()) {
                        if (e.keyCode == 108) {
                            // turn to 0 / 90 / 180 / 270 deg and drop a spike each way (left in hand)
                            const spikes = bestSpikes();
                            for (let i = 0; i < 4; i++) {
                                send(["2", [Math.PI / 2 * i]]);
                                placeRaw(spikes);
                            }
                        } else if (e.keyCode == iPressKey) {
                            if (modeState.ipress.rel == "puton") send(["13c", [0, iPressHat, 0]]);
                            else if (modeState.ipress.rel == "place") placeRaw(iPressPlaceItem);
                        } else if (e.keyCode == 0) {
                            if (cloudyTarget && cloudyTarget.clan) send(["10", [cloudyTarget.clan]]);
                        }
                    }
                });
            }

            // _0x3db6e8: "BOT " in front of your age text while the CloudyMod bot attacks
            function updateBotText() {
                if (!botText || !isShown(botText)) {
                    botText = document.createElement("span");
                    botText.id = "botText";
                    byId("ageText").prepend(botText);
                }
                if (attackMode) {
                    botText.innerHTML = "BOT ";
                } else {
                    $("#tbtn").animate({ opacity: 0 });
                    botText.innerHTML = "";
                }
            }

            // the weapon ids of the first two visible bar slots (= primary, secondary)
            function barWeapons() {
                const shown = Array.from(byId("actionBar").children).filter((el) => el.style.display != "none");
                return shown.map((el) => parseInt(el.id.replace("actionBarItem", "")));
            }

            // Shift+B: turret gear, spike, swing; a crossbow shot in view adds a secondary follow-up.
            // (It aims at cloudyAimDir, which nothing ever moved off 0 — so it faces right.)
            function bInsta() {
                const bar = barWeapons();
                instaPrimary = bar[0];
                instaSecondary = bar[1];
                if (instaRunning) return;
                instaRunning = true;
                swinging = true;
                send(["13c", [0, turretGear, 0]]);
                if (myAcc == monkeyTail) send(["13c", [0, 0, 1]]);
                send(["5", [instaPrimary, true]]);
                setTimeout(() => {
                    send(["2", [cloudyAimDir]]);
                    place(spikeSlot);
                    send(["c", [1, null]]);
                }, 20);
                setTimeout(() => { send(["13c", [0, 53, 0]]); }, 118);
                setTimeout(() => {
                    send(["c", [0, null]]);
                    if (myAcc == monkeyTail) send(["13c", [0, myAcc, 1]]);
                    send(["5", [instaPrimary, true]]);
                }, 443);
                setTimeout(() => { if (sawCrossbowShot) send(["5", [instaSecondary, true]]); }, 700);
                setTimeout(() => {
                    if (sawCrossbowShot) send(["c", [1, null]]);
                    send(["13c", [0, myHat, 0]]);
                }, 250);
                setTimeout(() => { if (sawCrossbowShot) send(["c", [0, null]]); }, 150);
                setTimeout(() => {
                    instaRunning = false;
                    if (sawCrossbowShot) {
                        send(["5", [instaPrimary, true]]);
                        setTimeout(() => { send(["c", [0, null]]); }, 450);
                        sawCrossbowShot = false;
                        swinging = false;
                    }
                    swinging = false;
                }, 1060);
            }

            // right click: turret gear, swing, swap to the secondary at document.timeTween (130 ms)
            function rightClickInsta() {
                keepProp(document.body, "oncontextmenu");
                document.body.oncontextmenu = () => {
                    rightClicked = true;
                    setTimeout(() => {
                        const bar = barWeapons();
                        instaPrimary = bar[0];
                        instaSecondary = bar[1];
                        if (instaRunning) return;
                        instaRunning = true;
                        swinging = true;
                        send(["13c", [0, turretGear, 0]]);
                        if (myAcc == monkeyTail) send(["13c", [0, 0, 1]]);
                        send(["5", [instaPrimary, true]]);
                        setTimeout(() => {
                            send(["2", [cloudyAimDir]]);
                            send(["c", [1, null]]);
                        }, 20);
                        setTimeout(() => {
                            send(["2", [cloudyAimDir]]);
                            send(["5", [instaSecondary, true]]);
                        }, document.timeTween);
                        setTimeout(() => {
                            send(["c", [0, null]]);
                            send(["13c", [0, myHat, 0]]);
                            if (myAcc == monkeyTail) send(["13c", [0, myAcc, 1]]);
                            send(["5", [instaPrimary, true]]);
                        }, 600);
                        setTimeout(() => { if (sawCrossbowShot) send(["5", [instaSecondary, true]]); }, 730);
                        setTimeout(() => { if (sawCrossbowShot) send(["c", [1, null]]); }, 840);
                        setTimeout(() => { if (sawCrossbowShot) send(["c", [0, null]]); }, 950);
                        setTimeout(() => {
                            instaRunning = false;
                            if (sawCrossbowShot) {
                                send(["5", [instaPrimary, true]]);
                                setTimeout(() => { send(["c", [0, null]]); }, 300);
                                sawCrossbowShot = false;
                                swinging = false;
                            }
                            swinging = false;
                        }, 1060);
                    }, 150);
                };
            }

            // ---- the 0 ms auto aim + the 25 ms hat loop ----
            function loops() {
                setInterval(() => {
                    if (autoAim == true) send(["2", [enemyDir]]);
                }, 0);
                setInterval(() => {
                    if (autoHats == 1) {
                        if (appliedHat != biomeHat) setHat(biomeHat);
                        if (appliedAcc != biomeAcc) setAcc(biomeAcc);
                        appliedHat = biomeHat;
                        appliedAcc = biomeAcc;
                    }
                }, 25);
            }

            // a toggled loop: press once to start it (after `first` ms), again to stop it
            // (`steps` = [what to do, ms until the next step])
            function toggleLoop(keyCode, first, steps, onStop) {
                let on = true, pending;
                const run = (i) => {
                    steps[i][0]();
                    pending = setTimeout(() => run((i + 1) % steps.length), steps[i][1]);
                };
                listen(document, "keydown", function (e) {
                    if (e.keyCode == keyCode && notChatting()) {
                        e.preventDefault();
                        if (on) pending = setTimeout(() => run(0), first);
                        else {
                            clearTimeout(pending);
                            if (onStop) onStop();
                        }
                        on = !on;
                    }
                });
            }
            const renameTribe = (name) => () => { send(["9", [null]]); send(["8", [name]]); };
            const say = (text) => () => { send(["ch", [text]]); };

            function arrowKeys() {
                // Arrow down: the tribe name scrolls "MooMod" away and back
                toggleLoop(40, 50, [
                    [renameTribe("MooMod"), 50], [renameTribe("_ooMod"), 50], [renameTribe("__oMod"), 1],
                    [renameTribe("___Mod"), 50], [renameTribe("____od"), 50], [renameTribe("_____d"), 50],
                    [renameTribe("______"), 50], [renameTribe("M_____"), 50], [renameTribe("Mo____"), 50],
                    [renameTribe("Moo___"), 50], [renameTribe("MooM__"), 50], [renameTribe("MooMo_"), 50]
                ], () => send(["33", [null]]));
                // Arrow up: chat spam
                toggleLoop(38, 50, [
                    [say("Nuro best hacker"), 50], [say("Run or die"), 50], [say("try me = suicide yourself"), 1],
                    [say("Auto Heal : Off"), 50], [say("kill me = op revange"), 50], [say("Nuro op"), 50],
                    [say("get rekt noob"), 50], [say("hahhahaah ezzz"), 50], [say("Hi me pro and i kill u"), 50],
                    [say("let me kill you"), 50], [say("u have no chance of winning"), 50], [say("nuro op"), 50]
                ], () => send(["33", [null]]));
                // Arrow left: "MooMod" "is" "op" "u noob" as your tribe, 0.4 s each
                toggleLoop(37, 400, [
                    [renameTribe("MooMod"), 400], [renameTribe("is"), 400], [renameTribe("op"), 400], [renameTribe("u noob"), 400]
                ], () => send(["9", [null]]));
            }

            // K: four traps around you, again every 100 ms
            function autoTrapKey() {
                const ring = () => {
                    for (let i = 0; i < 4; i++) place(trapSlot, me.dir + toRad(i * 90));
                };
                toggleLoop(75, 0, [[ring, 100]], null);
            }

            // P: bot mode — auto aim + auto gather, walk at the nearest enemy (and say so, a lot)
            function botModeKey() {
                let on = true, pending;
                const chatStep = () => {
                    send(["ch", ["BotMode By Nuro."]]);
                    send(["33", [enemyDir]]);
                    pending = setTimeout(walkStep, 0);
                };
                const walkStep = () => {
                    send(["33", [enemyDir]]);
                    pending = setTimeout(chatStep, 0);
                };
                listen(document, "keydown", function (e) {
                    if (e.keyCode == 80 && notChatting()) {
                        e.preventDefault();
                        if (on) {
                            autoAim = true;
                            send(["7", [2]]);
                            pending = setTimeout(chatStep, 0);
                        } else {
                            clearTimeout(pending);
                            send(["7", [2]]);
                            send(["33", [null]]);
                            autoAim = false;
                        }
                        on = !on;
                    }
                });
            }

            // _0x5f3282: hold a key to run fn every `ms` (it runs once more after you let go)
            function holdRepeat(keyCode, fn, ms) {
                let pressed = false, timer;
                return {
                    start(k) {
                        if (k == keyCode && notChatting()) {
                            pressed = true;
                            if (timer === undefined) {
                                timer = setInterval(() => {
                                    fn();
                                    if (!pressed) {
                                        clearInterval(timer);
                                        timer = undefined;
                                    }
                                }, ms);
                            }
                        }
                    },
                    stop(k) {
                        if (k == keyCode && notChatting()) pressed = false;
                    }
                };
            }

            // G: spikes either side + a trap ahead, walking on (its key was never set: keyCode 0)
            function boostSpike() {
                if (boostDir == null) boostDir = enemyDir;
                place(spikeSlot, boostDir + toRad(90));
                place(spikeSlot, boostDir - toRad(90));
                place(trapSlot, boostDir);
                send(["33", [boostDir]]);
            }

            function mainKeys() {
                const holdFood = holdRepeat(81, () => { place(foodSlot); }, 0);            // Q
                const holdTrap = holdRepeat(trapKey, () => { place(trapSlot); }, 0);       // F
                const holdMill = holdRepeat(78, () => { place(millSlot); }, 0);            // N
                const holdSpike = holdRepeat(86, () => { place(spikeSlot); }, 0);          // V
                const holdUtility = holdRepeat(72, () => { place(utilitySlot); }, 0);      // H
                const holdBoost = holdRepeat(0, boostSpike, 0);
                listen(document, "keydown", function (e) {
                    const k = e.keyCode;
                    holdFood.start(k);
                    holdTrap.start(k);
                    holdBoost.start(k);
                    holdMill.start(k);
                    holdSpike.start(k);
                    holdUtility.start(k);
                    if (k == 76 && notChatting()) {                                         // L: four spikes
                        for (let i = 0; i < 4; i++) place(spikeSlot, me.dir + toRad(i * 90));
                    }
                    if (k == millRingKey && notChatting()) {                                // five windmills
                        for (let i = 0; i < 5; i++) place(millSlot, me.dir + toRad(i * 72));
                    }
                    if (k == 79 && notChatting()) {                                         // O: four traps
                        for (let i = 0; i < 4; i++) place(trapSlot, me.dir + toRad(i * 90));
                    }
                    if (k == utilityRingKey && notChatting()) {
                        for (let i = 0; i < 4; i++) place(utilitySlot, me.dir + toRad(i * 90));
                    }
                    if (k == spawnRingKey && notChatting()) {
                        for (let i = 0; i < 4; i++) place(spawnPadSlot, me.dir + toRad(i * 90));
                    }
                    if (k == turretPairKey && notChatting()) {
                        place(utilitySlot, me.dir + toRad(45));
                        place(utilitySlot, me.dir - toRad(45));
                    }
                    if (k == turretPairKey && notChatting()) {
                        place(utilitySlot, me.dir + toRad(45));
                        place(utilitySlot, me.dir - toRad(45));
                    }
                    if (k == instaKey && notChatting()) {                                   // R: the insta
                        autoAim = true;
                        send(["5", [primarySlot, true]]);
                        send(["13c", [0, 7, 0]]);                                           // bull helmet
                        send(["13c", [0, 0, 1]]);
                        send(["13c", [0, 21, 1]]);                                          // corrupt x wings
                        send(["c", [1]]);
                        setTimeout(() => {
                            send(["13c", [0, 53, 0]]);                                      // turret gear
                            send(["13c", [0, 0, 1]]);
                            send(["13c", [0, 11, 1]]);                                      // monkey tail
                            send(["5", [secondarySlot, true]]);
                        }, instaTime - 130);
                        setTimeout(() => {
                            send(["5", [primarySlot, true]]);
                            send(["c", [0, null]]);
                            send(["13c", [0, 6, 0]]);                                       // soldier helmet
                            send(["13c", [0, 11, 1]]);
                            autoAim = false;
                        }, instaTime);
                    }
                    if (k == 72 && notChatting()) {                                         // H: two turrets
                        place(utilitySlot, me.dir + toRad(45));
                        place(utilitySlot, me.dir - toRad(45));
                    }
                    if (k == spikeKey && notChatting()) {                                   // V: one more spike
                        place(spikeSlot);
                    }
                    if (k == 0 && notChatting()) {                                          // hat loop on / off
                        autoHats = (autoHats + 1) % 2;
                        if (autoHeal == 0) document.title = autoHats == 0 ? "Heal: OFF | Hat: OFF" : "Heal: OFF | Hat: ON";
                        else document.title = autoHats == 0 ? "Heal: ON | Hat: OFF" : "Heal: ON | Hat: ON";
                    }
                });
                listen(document, "keyup", function (e) {
                    const k = e.keyCode;
                    holdTrap.stop(k);
                    holdBoost.stop(k);
                    holdMill.stop(k);
                    holdSpike.stop(k);
                    holdUtility.stop(k);
                    holdFood.stop(k);
                    if (k == 71 && notChatting()) {                                         // G released
                        setTimeout(() => {
                            send(["33", [null]]);
                            boostDir = null;
                        }, 10);
                    }
                });
            }
