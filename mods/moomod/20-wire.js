            // =====================================================================
            // 20-wire — the old protocol, spoken on top of the loader.
            // =====================================================================
            // The original sent frames as msgpack ["type", [args]] straight on the game socket,
            // and its WebSocket.prototype.send hook saw every frame — the client's AND its own —
            // on the way out. Here:
            //   send(packet)     the original's _0x43ca03 / document.dns / socket.send: through
            //                    the hook, then onto the wire
            //   rawSend(packet)  the hook's own this.oldSend(...): straight onto the wire
            //   toWire(packet)   one old packet -> the loader action it means on this server
            // The client's own frames reach the hook through ctx.onSent (turned back into old
            // packets), and the server's events reach onMessage (60-game) as old frames.

            const isNumber = (v) => typeof v === "number" && !isNaN(v) && isFinite(v);   // the server's UTILS.isNumber
            const noop = function () {};

            // What the client is holding, as the old client knew it (it sent a direction with a
            // click only while holding a building). Server updates + the selects that went out.
            let heldBuild = -1;
            function noteSelect(index, isWeapon) {
                if (isWeapon) heldBuild = -1;
                else heldBuild = heldBuild === index ? -1 : index;     // the server puts an item away when it's picked twice
            }

            // PORT: this server strikes malformed packets (40 strikes = kicked). Whatever the old
            // server quietly ignored or coped with — a NaN build direction, an undefined item slot,
            // the made-up "3" packet, toggle 2 — is turned into what that server did with it, or dropped.
            function toWire(packet) {
                const type = packet[0], a = packet[1] || [];
                switch (type) {
                    case "2":   // look direction
                        return isNumber(a[0]) ? MooMoo.send.aim(a[0]) : false;
                    case "33":  // move direction (null = stop)
                        if (a[0] == null) return MooMoo.send.move(null);
                        return isNumber(a[0]) ? MooMoo.send.move(a[0]) : false;
                    case "c":   // mouse [1 down | 0 up, build direction]. No readable direction (null, or the
                                // NaN the script's never-installed mouse tracking produced) = build where
                                // you're looking, which is what the old server did with it.
                        return MooMoo.send.mouse(!!a[0], isNumber(a[1]) ? a[1] : null);
                    case "5":   // select [index, isWeapon]
                        if (!Number.isInteger(a[0])) return false;
                        noteSelect(a[0], !!a[1]);
                        return MooMoo.send.selectItem(a[0], !!a[1]);
                    case "13c": // store [0 equip | 1 buy, id, isAccessory]   (the vocabulary's store is 1 equip / 0 buy)
                        if (!Number.isInteger(a[1]) || (a[0] !== 0 && a[0] !== 1)) return false;
                        return MooMoo.send.store(a[0] === 0 ? 1 : 0, a[1], !!a[2]);
                    case "ch":  // chat
                        return typeof a[0] === "string" ? MooMoo.send.chat(a[0]) : false;
                    case "7":   // the old server flipped auto gather for any truthy value (bot mode sends 2)
                        return MooMoo.send.toggle(a[0] ? 1 : 0);
                    case "8":   // create tribe
                        return typeof a[0] === "string" ? MooMoo.send.createTribe(a[0]) : false;
                    case "9":   // leave tribe
                        return MooMoo.send.leaveTribe();
                    case "10":  // ask to join a tribe
                        return typeof a[0] === "string" ? MooMoo.send.joinTribe(a[0]) : false;
                    default:    // "3" was never a real packet: the old server dropped it, so do we
                        return false;
                }
            }

            // PORT: the server allows about 18 item selects and 36 clicks a second. A placement that
            // only half goes out leaves the wrong thing in your hand, so a placement macro is sent
            // whole or not at all (the old site had no such limit, every one went out).
            const wireOf = (action) => {
                const b = win.MooMooBinding;
                return b && b.outgoing && b.outgoing[action] ? b.outgoing[action].wire : null;
            };
            function roomFor(selects, clicks) {
                const net = ctx.net;
                if (!net || !net.tokens) return true;
                const z = wireOf("selectItem"), f = wireOf("mouse");
                if (z && net.tokens(z) < selects) return false;
                if (f && net.tokens(f) < clicks) return false;
                return !net.wouldAllow || !f || net.wouldAllow(f);
            }

            // ---- the hook ----
            let gameSocket = null;          // _0x6f10cd: grabbed by the hook on the first frame that goes out

            function rawSend(packet) {      // this.oldSend(...)
                toWire(packet);
            }
            function send(packet) {         // _0x43ca03(packet) == _0x6f10cd.send(encode(packet))
                // before the hook has seen a frame the original had no socket and threw right here
                if (!gameSocket) throw new TypeError("Cannot read properties of undefined (reading 'send')");
                hook(packet, rawSend);
            }

            // ["c", [1, null]] / ["c", [0, null]] — byte for byte the frames [146,161,99,146,1|0,192]
            // the hook watched for (the old client's attack press / release while holding a weapon).
            function isSwingFrame(packet) {
                const a = packet[1];
                return packet[0] === "c" && Array.isArray(a) && a.length === 2 && (a[0] === 1 || a[0] === 0) && a[1] == null;
            }

            // The original's WebSocket.prototype.send replacement, for one old packet.
            // putOnWire sends it (the client's own frames are already out: noop).
            function hook(packet, putOnWire) {
                if (tripTarget.every((v) => v == false)) {
                    for (const el of document.getElementsByClassName("spotDiv")) document.body.removeChild(el);
                }
                if (!gameSocket) {
                    gameSocket = true;
                    attachSocket();
                }
                if (instaRunning) {
                    putOnWire(packet);
                    return;
                }
                putOnWire(packet);
                const args = packet[1] || [];
                if (hitHats && isSwingFrame(packet)) {
                    if (args[0] === 1) {            // "started swing": hit hat + hit accessory on
                        swinging = true;
                        rawSend(hitHatPacket("on"));
                        rawSend(hitHatPacket("mOff"));
                        send(["13c", [0, hitAcc, 1]]);
                    } else {                        // "ended swing": back to your own
                        rawSend(hitHatPacket("off"));
                        rawSend(hitHatPacket("mOn"));
                        send(["13c", [0, myAcc, 1]]);
                        swinging = false;
                    }
                }
                const data = [packet[0]].concat(args);
                if (data[0] == "ch") {
                    lastChat = data[1];
                }
                if (data[0] == "s") {              // "user respawned" — the old spawn packet was "sp", so never
                    for (const marker of Object.values(mapMarkers)) marker.style.opacity = 1;
                    isDead = false;
                } else if (data[0] == "13c") {
                    if (!swinging && data.length == 4 && data[3] == 0 && data[1] == 0) {
                        myHat = data[2];                                  // "Changed hat to"
                    } else if (!swinging && data.length == 4 && data[3] == 1 && data[1] == 0) {
                        myAcc = data[2];                                  // "Changed accessory to"
                    } else if (data.length == 4 && data[3] == 0 && data[1] == 1) {
                        const bought = data[2];                           // "BOUGHT HAT"
                        if (bought == idOf("winter cap")) ownsWinterCap = true;
                        else if (bought == idOf("flipper hat")) ownsFlipperHat = true;
                    }
                } else if (data[0] == "2") {
                    lastAim = data[1];
                }
            }

            // _0x21cd2c: the hat / accessory frames the hook sends around a swing
            function hitHatPacket(kind) {
                let data;
                if (!kind.includes("m")) {
                    if (!kind.includes("a")) data = ["13c", [0, kind == "on" ? hitHat : myHat, 0]];
                    else data = ["13c", [0, parseInt(kind == "aon" ? hitAcc : myAcc), 1]];
                } else if (myAcc == idOf("monkey tail") && removeMonkeyTail) {
                    data = ["13c", [0, kind == "mOn" ? idOf("monkey tail") : 0, 1]];
                } else {
                    data = ["13c", [0, myAcc, 1]];
                }
                return data;
            }

            // _0x417365: what the hook set up on the socket it grabbed
            let listening = false;
            function attachSocket() {
                // settings pushed from the "scriptsourceapp" companion page (nobody has it, kept anyway)
                listen(win, "message", function (e) {
                    if (e.origin != "http://scriptsourceapp.com") return;
                    healDelayCloudy = e.data.autoHealSpeed;
                    instaKey = e.data.instaKillKey;
                    cloudySpikeKey = e.data.spikeKey;
                    trapKey2 = e.data.trapKey;
                    iPressKey = e.data.iPressKey;
                    hitAcc = e.data.switchToAccessory;
                    hitHat = e.data.switchToHat;
                    iPressPlaceItem = e.data.placeName;
                    iPressHat = e.data.putonName;
                    for (const k of Object.keys(e.data.state)) modeState[k] = { active: false, rel: e.data.state[k][0] };
                });
                // the socket's "message" listener: onMessage gets every frame from now on. (The
                // first frame of a connection — io-init — had already arrived, so it never saw it.)
                listening = true;
            }

            // ---- the client's own frames ----
            // The original's hook ran inside the client's send call. ctx.onSent fires just before
            // that frame hits the wire, so the hook runs a microtask later: anything it sends still
            // lands right behind the client's frame, like before.
            function fromClient(action, p) {
                switch (action) {
                    case "aim": return ["2", [p.dir]];
                    case "move": return ["33", [p.dir == null ? null : p.dir]];
                    case "mouse": return ["c", [p.down ? 1 : 0, heldBuild >= 0 ? p.dir : null]];
                    case "selectItem": noteSelect(p.index, p.isWeapon); return ["5", [p.index, p.isWeapon]];
                    case "store": return ["13c", [p.action === 1 ? 0 : 1, p.id, p.isAccessory ? 1 : 0]];
                    case "chat": return ["ch", [p.message]];
                    case "spawn": return ["sp", [p]];
                    case "toggle": return ["7", [p.which]];
                    case "upgrade": return ["6", [p.index]];
                    default: return ["~" + action, []];
                }
            }
            // (installed by init at the point the original replaced WebSocket.prototype.send)
            function installHook() {
                ctx.onSent(function (action, payload, source) {
                    if (source !== "client" || !alive) return;
                    const packet = fromClient(action, payload || {});
                    win.queueMicrotask(function () {
                        if (alive) hook(packet, noop);
                    });
                });
                // keep heldBuild honest with what the server says you're holding
                ctx.on("playersUpdate", function (p) {
                    for (const at of p.attributes) if (at.sid === MooMoo.self.sid) heldBuild = at.buildIndex;
                });
                ctx.on("died", function () { heldBuild = -1; });
                ctx.on("*", function (event, payload) {
                    if (!listening || !alive) return;
                    onMessage(toOldFrame(event, payload || {}));
                });
            }

            // ---- the server's events, as old frames ----
            // [type, ...args] — the shape onMessage decoded every frame into.
            function toOldFrame(event, p) {
                switch (event) {
                    case "setup": return ["1", p.sid];
                    case "playersUpdate": {
                        // "33": 13 values a player [sid, x, y, dir, buildIndex, weaponIndex, variant,
                        // tribe, isLeader, hat, accessory, icon, zIndex] for everyone in view
                        const flat = [];
                        for (const pos of p.positions) {
                            const pl = MooMoo.players.get(pos.sid) || {};
                            flat.push(pos.sid, pos.x, pos.y, pos.dir, pl.buildIndex, pl.weaponIndex, pl.variant,
                                pl.team == null ? null : pl.team, pl.isLeader ? 1 : 0, pl.skin, pl.tail, pl.icon, pl.zIndex);
                        }
                        return ["33", flat];
                    }
                    case "health": return ["h", p.sid, p.value];
                    case "died": return ["11"];
                    case "objectsLoad": return ["6", (p.args && p.args[0]) || []];      // 8 values an object, same as before
                    case "objectKilled": return ["12", p.args ? p.args[0] : undefined];
                    case "projectileAdd": return ["18"].concat(p.args || []);           // [x, y, dir, range, speed, ...]
                    default: return ["~" + event];
                }
            }
