/*
 * moomoo.js loader — BINDING  (the part you update when the server changes)
 * =========================================================================
 * This is the ONLY place that knows which wire packet letter means what. It
 * translates between raw frames and the stable vocabulary that mods speak:
 *
 *   incoming[<wire>] = { event, parse(args) -> payload }
 *   outgoing[<action>] = { wire, build(payload) -> args }
 *
 * When the private server renames a packet, reorders its arguments, or adds a
 * new one, you edit THIS file (and bump the loader). Every mod ever written
 * keeps working, because the vocabulary names on the left never move.
 *
 * Part of the LOADER (the volatile half).
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooBinding = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooBinding = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const bool = (v) => (v ? 1 : 0);
    const passthrough = (event) => ({ event, parse: (args) => ({ args }) });

    // Parse the modernised "a" (playersUpdate): three arrays.
    function parsePlayersUpdate(args) {
        const positions = [];
        const pos = args[0] || [];
        for (let i = 0; i + 3 < pos.length; i += 4) {
            positions.push({ sid: pos[i], x: pos[i + 1], y: pos[i + 2], dir: pos[i + 3] / 100 });
        }
        const attributes = [];
        const at = args[1] || [];
        for (let i = 0; i + 9 < at.length; i += 10) {
            attributes.push({
                sid: at[i], buildIndex: at[i + 1], weaponIndex: at[i + 2], variant: at[i + 3],
                team: at[i + 4], isLeader: !!at[i + 5], skin: at[i + 6], tail: at[i + 7],
                icon: at[i + 8], zIndex: at[i + 9]
            });
        }
        return { positions, attributes, hidden: args[2] || [] };
    }

    // ---- INCOMING: wire letter -> semantic event + payload parser ----
    const incoming = {
        A: passthrough("init"),
        B: { event: "disconnect", parse: (a) => ({ reason: a[0] }) },
        C: { event: "setup", parse: (a) => ({ sid: a[0] }) },
        D: { event: "playerAdd", parse: (a) => ({ data: a[0], isYou: !!a[1] }) },
        E: { event: "playerRemove", parse: (a) => ({ sid: a[0] }) },
        a: { event: "playersUpdate", parse: parsePlayersUpdate },
        G: passthrough("leaderboard"),
        H: passthrough("objectsLoad"),
        I: passthrough("animalsUpdate"),
        J: passthrough("animalAttack"),
        K: passthrough("gatherAnimation"),
        L: passthrough("wiggle"),
        M: passthrough("turretShoot"),
        N: { event: "playerValue", parse: (a) => ({ key: a[0], value: a[1], updateView: !!a[2] }) },
        O: { event: "health", parse: (a) => ({ sid: a[0], value: a[1] }) },
        P: { event: "died", parse: () => ({}) },
        Q: passthrough("objectKilled"),
        R: passthrough("objectsKilled"),
        S: passthrough("itemCount"),
        T: passthrough("age"),
        U: { event: "upgrades", parse: (a) => ({ points: a[0], age: a[1] }) },
        V: { event: "inventory", parse: (a) => ({ list: a[0], isWeapon: !!a[1] }) },
        X: passthrough("projectileAdd"),
        Y: passthrough("projectileRemove"),
        Z: passthrough("shutdownNotice"),
        g: passthrough("tribeAdd"),
        1: passthrough("tribeDelete"),
        2: passthrough("tribeJoinRequest"),
        3: passthrough("tribeSet"),
        4: passthrough("tribeMembers"),
        5: passthrough("storeUpdate"),
        6: { event: "chat", parse: (a) => ({ sid: a[0], message: a[1] }) },
        7: passthrough("minimap"),
        8: { event: "showText", parse: (a) => ({ x: a[0], y: a[1], value: a[2], type: a[3] }) },
        9: { event: "mapPing", parse: (a) => ({ x: a[0], y: a[1] }) },
        0: { event: "pong", parse: () => ({}) },
        W: passthrough("effect"),
        F: passthrough("stats"),
        // added by the current server
        p: passthrough("profile"),          // answer to V (watch stats): the profile card
        q: { event: "probes", parse: (a) => ({ salt: a[0], probes: a[1] || [] }) }, // integrity probes
        r: passthrough("updateCountdown"),  // "a new version is out" countdown
        m: { event: "dive", parse: (a) => ({ sid: a[0], state: a[1] }) }            // player dive
    };

    // ---- OUTGOING: semantic action -> wire letter + argument builder ----
    const outgoing = {
        spawn: { wire: "M", build: (d) => {
            const o = { name: d.name == null ? "" : String(d.name), moofoll: d.moofoll ? 1 : 0, skin: d.skin | 0 };
            if (d.anon) o.anon = 1;            // this server reads a 4th spawn field (anonymous join)
            return [o];
        } },
        aim: { wire: "D", build: (d) => [d.dir] },
        move: { wire: "9", build: (d) => [d.dir === undefined ? null : d.dir] },
        stopMove: { wire: "e", build: () => [] },
        mouse: { wire: "F", build: (d) => [bool(d.down), d.dir === undefined ? null : d.dir] },
        selectItem: { wire: "z", build: (d) => [d.index, bool(d.isWeapon)] },
        upgrade: { wire: "H", build: (d) => [d.index] },
        toggle: { wire: "K", build: (d) => [d.which] },
        createTribe: { wire: "L", build: (d) => [d.name] },
        leaveTribe: { wire: "N", build: () => [] },
        joinTribe: { wire: "b", build: (d) => [d.name] },
        answerJoin: { wire: "P", build: (d) => [d.sid, bool(d.accept)] },
        kickMember: { wire: "Q", build: (d) => [d.sid] },
        // Vocabulary store action is 0 = buy, 1 = equip (the stable contract). THIS server's
        // wire is the other way round (0 = equip, 1 = buy), so translate here — mods keep using
        // the documented meaning and `ctx.setHat` / `buyHat` work.
        store: { wire: "c", build: (d) => [d.action ? 0 : 1, d.id, bool(d.isAccessory)] },
        chat: { wire: "6", build: (d) => [d.message == null ? "" : String(d.message)] },
        pingMap: { wire: "S", build: () => [] },
        ping: { wire: "0", build: () => [] },
        watchStats: { wire: "V", build: (d) => [d.sid] },
        report: { wire: "R", build: (d) => d.args || [] },
        admin: { wire: "A", build: (d) => d.args || [] },
        anon: { wire: "I", build: (d) => [d.on ? 1 : 0] }
    };

    // ---- OUTGOING, inverse: wire args -> action payload ----
    // Lets the loader turn a frame the official client sent back into a named
    // action, so mods can inspect, rewrite or drop it (see runtime onOutgoing).
    const outgoingParse = {
        M: { action: "spawn", parse: (a) => Object.assign({}, a[0] || {}) },
        D: { action: "aim", parse: (a) => ({ dir: a[0] }) },
        9: { action: "move", parse: (a) => ({ dir: a[0] == null ? null : a[0] }) },
        e: { action: "stopMove", parse: () => ({}) },
        F: { action: "mouse", parse: (a) => ({ down: !!a[0], dir: a.length > 1 ? a[1] : undefined }) },
        z: { action: "selectItem", parse: (a) => ({ index: a[0], isWeapon: !!a[1] }) },
        H: { action: "upgrade", parse: (a) => ({ index: a[0] }) },
        K: { action: "toggle", parse: (a) => ({ which: a[0] }) },
        L: { action: "createTribe", parse: (a) => ({ name: a[0] }) },
        N: { action: "leaveTribe", parse: () => ({}) },
        b: { action: "joinTribe", parse: (a) => ({ name: a[0] }) },
        P: { action: "answerJoin", parse: (a) => ({ sid: a[0], accept: !!a[1] }) },
        Q: { action: "kickMember", parse: (a) => ({ sid: a[0] }) },
        c: { action: "store", parse: (a) => ({ action: a[0] ? 0 : 1, id: a[1], isAccessory: !!a[2] }) },   // wire 0=equip/1=buy -> vocab 0=buy/1=equip
        6: { action: "chat", parse: (a) => ({ message: a[0] }) },
        S: { action: "pingMap", parse: () => ({}) },
        0: { action: "ping", parse: () => ({}) },
        V: { action: "watchStats", parse: (a) => ({ sid: a[0] }) },
        R: { action: "report", parse: (a) => ({ args: a.slice() }) },
        A: { action: "admin", parse: (a) => ({ args: a.slice() }) },
        I: { action: "anon", parse: (a) => ({ on: !!a[0] }) }
    };

    // The server's per-packet token buckets ([refill per second, burst]) from
    // server/src/anticheat/config.js. The loader mirrors them so that the sum of
    // the client's own packets and mod-injected packets can never exceed a bucket
    // (exceeding one = a strike; 40 strikes = kicked).
    const rateLimits = {
        global: [150, 300],
        packets: {
            M: [1, 3], D: [60, 120], 9: [40, 80], e: [10, 20], F: [40, 80], z: [20, 40], H: [10, 20],
            K: [10, 20], L: [2, 4], N: [2, 4], b: [2, 4], P: [5, 10], Q: [5, 10], c: [10, 20],
            6: [2, 4], S: [1, 2], 0: [2, 4], T: [1, 3], R: [2, 5], A: [20, 40], V: [4, 8], I: [1, 2]
        }
    };

    // The number of fields in a "T" telemetry frame this loader knows how to produce, and
    // the length of the io-init handshake it understands. The compat checker compares these
    // against what the live server/client actually use: if the real client reports MORE "T"
    // fields than this, the server is checking something the loader can't answer and would
    // flag it — that is a hard "loader out of date" signal (see core/notice.js).
    const TELEMETRY_FIELDS = 7;   // [flags, untrusted, probeResult, seal, probeSalt, seq, ledger]
    const IO_INIT_FIELDS = 6;     // [socketId, seed, keyHex, mode, pinned, sealMode]

    return {
        version: 2,
        incoming,
        outgoing,
        outgoingParse,
        rateLimits,
        // What this loader was built to speak. core/notice.js watches the live connection and
        // compares the real server's behaviour against this; a difference it can't absorb
        // raises the mismatch popup.
        contract: {
            ioInitFields: IO_INIT_FIELDS,
            telemetryFields: TELEMETRY_FIELDS,
            c2s: outgoingKeys(outgoing),
            s2c: Object.keys(incoming)
        },
        // The outgoing packet that answers the server's integrity probes ("q").
        // The current server expects "T" = [flags, untrustedEvents, probeResult, seal, probeSalt,
        // seq, ledger], only in reply to a "q" round. It matches `seal` against the bundle it
        // served, `salt` against that round, and `seq` / `ledger` against its own running view of
        // the c2s frame stream. The client the loader rides on is unmodified, so it computes the
        // correct seal and echoes the round's salt itself; the loader keeps both and clears the
        // three fields that would report its own presence:
        //   flags       -> 0  (SOCKET_HOOKED / SOCKET_INTEGRITY etc. — loader hooking is expected)
        //   untrusted   -> 0
        //   probeResult -> 0  (no integrity probe matched)
        // and replaces seq + ledger with the loader's OWN re-encoded-stream values (ctx.seq /
        // ctx.ledger), which is what the server actually received — the client's own seq/ledger
        // describe a frame stream that never reached the wire once the loader re-sequenced it.
        // ctx.sealReport, when present, is the value the loader derived for this connection; it is
        // preferred over the client's echoed seal so the answer is right even if the client's own
        // seal computation ever drifts.
        telemetry: {
            wire: "T",
            scrub: (args, ctx) => {
                const seal = ctx && ctx.sealReport != null ? ctx.sealReport : (args && args.length > 3 ? args[3] : 0);
                const salt = args && args.length > 4 ? args[4] : (ctx && ctx.probeSalt != null ? ctx.probeSalt : 0);
                const out = [0, 0, 0, seal, salt];
                // Only pinned connections carry a ledger; ctx supplies seq + ledger then.
                if (ctx && ctx.seq != null && ctx.ledger != null) out.push(ctx.seq, ctx.ledger >>> 0);
                return out;
            }
        }
    };

    function outgoingKeys(map) {
        const wires = [];
        for (const k in map) if (map[k] && map[k].wire) wires.push(map[k].wire);
        return wires;
    }
});
