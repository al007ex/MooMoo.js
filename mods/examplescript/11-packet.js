            // =====================================================================
            // PACKETS — the bundle's packet.send, translated to this server's wire.
            // =====================================================================
            // Bundle packet.send (lines 2205-2239), in its exact order:
            //   aliases d->F, a->9, G->z; the 60s minute window; np on "P"; its own
            //   limiter (He < 120 per 9-tick window, We <= 5050 per minute, excess
            //   dropped with a chat-log warning); move dedupe (same dir as Dn ->
            //   dropped) + Dn/ui/ni tracking; St++ on "K"; qt on "H".
            // Then the args are translated to what THIS server expects (the bundle
            // targeted the old protocol):
            //   c (store): old 0 = equip / 1 = buy  ->  server 1 = equip / 0 = buy
            //   D / 9: the bundle appended a source tag ("client", "autopush",
            //          "pathfinder") -> dropped; only the direction goes out
            //   6: trailing false dropped
            // Arguments the server would reject as invalid (a strike each) are not
            // sent: a NaN aim, a non-integer item id.
            function Hy(e) {
                const t = f(Math.random() * 360);
                const n = f(Math.random() * 81) + 20;
                const i = f(Math.random() * 61) + 20;
                return `hsl(${t}, ${n}%, ${i}%)`;
            }
            const isNum = (val) => typeof val === "number" && !isNaN(val) && isFinite(val);
            const isInt = (val) => Number.isInteger(val);
            function toWire(e, t) {
                switch (e) {
                    case "F": {
                        const dir = t.length > 1 ? t[1] : undefined;
                        if (dir != null && !isNum(dir)) return null;
                        return t.length > 1 ? [t[0] ? 1 : 0, dir == null ? null : dir] : [t[0] ? 1 : 0];
                    }
                    case "9": { const dir = t[0]; if (dir != null && !isNum(dir)) return null; return [dir == null ? null : dir]; }
                    case "D": return isNum(t[0]) ? [t[0]] : null;
                    case "z": return isInt(t[0]) ? [t[0], t[1] ? 1 : 0] : null;
                    case "K": return [t[0]];
                    case "c": return isInt(t[1]) ? [t[0] === 0 ? 1 : 0, t[1], t[2] ? 1 : 0] : null;
                    case "6": return [t[0] == null ? "" : String(t[0])];
                    case "S": return [];
                    case "H": return isInt(t[0]) ? [t[0]] : null;
                    case "e": return [];
                    default: return null;     // the old protocol's other packets have no use here
                }
            }
            const packet = {
                get connected() { return MooMoo.isReady(); },
                socketReady() { return MooMoo.isReady(); },
                send(e) {
                    if (e == "d") e = "F";
                    if (e == "a") e = "9";
                    if (e == "G") e = "z";
                    const t = Array.prototype.slice.call(arguments, 1);
                    if (!Wt.min) {
                        Wt.min = true;
                        setTimeout(() => { Wt.min = false; We = 0; }, 6e4);
                    }
                    if (e == "P") np = v;
                    if (He < 120 && We <= 5050) He++, We++;
                    if (We > 5050) b(`exceeding minute packet limit ${We}`, "", Hy(), false, true);
                    if (He >= 120) b(`exceeding second packet limit ${He}`, "", Hy(), false, true);
                    if (He >= 120 || We > 5050) return;
                    if (e == "9") {
                        ni = t[1];
                        if (Dn == t[0]) return;
                        Dn = t[0];
                        ui = t[0];
                        combatInput.moveDir = t[0] == null ? null : t[0];
                    }
                    if (e == "K") St++;
                    if (e == "H") qt >= 9 ? qt = A : qt = ee;
                    const args = toWire(e, t);
                    if (args) MooMoo.send.raw(e, args);
                }
            };
            // The combat engine predicts our own movement from the direction we last
            // sent (the bundle's Dn); the loader keeps it in selfInput.
            const combatInput = combat.selfInput;

            // ---- store: equip() exactly as the bundle (16934) + Rp (equip) / Mp (buy) ----
            function Rp(e, t) { packet.send("c", 0, e, t); }      // old protocol equip
            function Mp(e, t) { packet.send("c", 1, e, t); }      // old protocol buy
            function equip(hatId = null, accessoryId = null) {
                if (hatId !== null && !isNaN(hatId)) {
                    if (!Nn.includes(hatId)) {
                        if (getHat() !== 0) { Rp(0, 0); lt = 0; nn = 0; }
                    } else if (getHat() !== hatId) {
                        Rp(hatId, 0); lt = hatId; nn = hatId;
                    }
                }
                if (accessoryId !== null && !isNaN(accessoryId)) {
                    if (!On.includes(accessoryId)) {
                        if (getTail() !== 0) { Rp(0, 1); mt = 0; sn = 0; }
                    } else if (getTail() !== accessoryId) {
                        Rp(accessoryId, 1); mt = accessoryId; sn = accessoryId;
                    }
                }
            }
            function Vm(e, t) { packet.send("G", e, t); }
            function _m() { packet.send("K", 1); }
            function Fm() { packet.send("S", 1); }

            // ---- takeover: what the official client may still send on its own ----
            // The bundle WAS the client, and it never sent aim / move / click /
            // auto-gather from input handlers: aim and movement go out once per tick
            // from updatePlayers, attacking is done by toggling auto-gather ("K"), and
            // clicking never sends "F". So the official client's own frames of those
            // kinds are dropped; everything else it sends (chat, store, item selects,
            // upgrades, clan, pings, telemetry) goes through and counts toward the
            // bundle's packet limiter like the bundle's own sends did.
            let dropNextClientSelect = false;
            ctx.onOutgoing("aim", () => false);
            ctx.onOutgoing("move", () => false);
            ctx.onOutgoing("stopMove", () => false);
            ctx.onOutgoing("mouse", () => false);
            ctx.onOutgoing("toggle", () => false);
            ctx.onOutgoing("selectItem", () => { if (dropNextClientSelect) return false; });
            ctx.onOutgoing("*", (pl, info, action) => {
                if (info.wire === "T") return;
                if (!Wt.min) { Wt.min = true; setTimeout(() => { Wt.min = false; We = 0; }, 6e4); }
                if (He < 120 && We <= 5050) He++, We++;
                if (He >= 120 || We > 5050) return false;
                if (action === "upgrade") qt >= 9 ? qt = A : qt = ee;
            });
