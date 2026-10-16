// ANTICHEAT CONFIG
// Every check the server performs and what happens when it trips.
// Actions: "close"  -> drop the socket with a protocol close code (client shows the matching message)
//          "kick"   -> send B("kicked") ("You were removed from the server.") and close
//          "shame"  -> force the Shame! hat (id 45) for shame.durationMs
//          "flag"   -> remember it on the player + log (visible to staff via reports/bans files)
//          "ignore" -> do nothing

export const ANTICHEAT_CONFIG = {

    // Transport layer (protocol/session.js). The official client can never produce
    // these, so anything that does is a modified client or a replay.
    transport: {
        badTag: "close",          // HMAC tag mismatch (tampered / forged frame)
        badSequence: "close",     // seq is not last + 1 (replayed / injected frame)
        unknownPacket: "close",   // id not present in this session's shuffled table
        malformed: "close"        // body is not msgpack [id, args, seq]
    },

    // Connection gate (performed before io-init).
    connection: {
        enforceBuild: true,        // ?b= must equal the current BUILD_ID, else 4002 "Game updated - please reload"
        enforceBundle: true,       // ?u= (the bundle file the page runs) must be the one served now, else 4002
        enforceOrigin: true,       // Origin header must be this server, else 4004 "Please play at moomoo.io"
        requireTicket: true,       // ?token=tk:<ticket> issued by /api/join, else 4001 "Invalid Connection"
        ticketMaxAgeMs: 60 * 1000,
        maxConnectionsPerIp: 4
    },

    // Code seal (io-init field 5). The client hashes its own bundle, checks that its guarded
    // functions (send, connect, the input and telemetry functions...) still match the
    // bundle's source, and combines that with the seal in the page's "moomoo-seal" import.
    //   mode 2 "bind":   the result is XORed into the session key, so a modified client
    //                    can't produce a valid frame (its first packet closes with 4001)
    //   mode 1 "report": the client reports a hash of it in every "T"; mismatches get
    //                    `mismatchAction`
    //   mode 0:          off
    seal: {
        mode: 2,
        mismatchAction: "flag"
    },

    // Client telemetry: packet "T" = [flags, untrustedEvents, probeResult, seal, probeSalt,
    // seq, ledger]. (The last two were added in the index-6642cae8 build.) The client only
    // sends it in answer to the server's integrity probes (packet "q"), so the server asks:
    // `firstProbeMs` after the first spawn, then every `intervalMs`.
    telemetry: {
        required: true,
        firstProbeMs: 5000,
        intervalMs: 60000,
        answerMs: 45000,           // background tabs throttle the probe loop, so allow some slack
        missingAction: "kick",
        flags: {
            1: { name: "USERSCRIPT_MANAGER", action: "flag" },  // Tampermonkey / Violentmonkey / GM_* globals
            2: { name: "SOCKET_HOOKED", action: "kick" },       // window.WebSocket or WebSocket.prototype.send replaced
            4: { name: "RENDER_HOOKED", action: "flag" },       // canvas / WebGL / rAF / getContext not native
            8: { name: "DEBUGGER_PAUSED", action: "flag" },     // anti-debug "debugger" trap took > 200ms
            // Added in index-6642cae8:
            16: { name: "SOCKET_INTEGRITY", action: "kick" },   // WebSocket / send not native-named, or its constructor swapped
            32: { name: "SOCKET_TAMPERED", action: "flag" }     // own properties / symbols were added to the socket object
        },
        // The "T" frame also reports the client's running c2s ledger (FNV-1a of every body it
        // sent) and sequence number; a mismatch with the server's own view means a forged /
        // replayed / dropped frame. (Kept at "flag" so a quirk can't wrongly disconnect; the
        // server computes the exact same value, so a real client never trips it.)
        ledger: { mismatchAction: "flag" },
        // Script-dispatched (isTrusted = false) clicks / touches the client refused.
        untrustedEvents: { threshold: 20, action: "flag" }
    },

    // Integrity probes sent in "q": [salt, [[kind, path, hash], ...]] (at most 30). The
    // client answers with a bitmask of the probes that matched. Names are never sent: kinds
    // 1-4 and 6 compare salted hashes, so a script can't see what is being looked for.
    //   1 own property names of the object at `path`         (value: a property name)
    //   2 "name=value" of its number / string / boolean props (value: "name=value")
    //   3 localStorage keys                                   (value: a key)
    //   4 elements with an id, as "tag#id"                    (value: "div#id")
    //   5 the function at `path` was replaced by a wrapper    (prototype.constructor isn't itself)
    //   6 own symbol descriptions of the object at `path`     (value: a description)
    //   7 the function at `path` isn't native code
    probes: {
        perRound: 30,              // the client checks at most 30
        list: [
            // functions game hooks replace
            { kind: 7, path: "WebSocket.prototype.send", name: "SOCKET_SEND_HOOKED", action: "flag" },
            { kind: 7, path: "EventTarget.prototype.addEventListener", name: "LISTENER_HOOKED", action: "flag" },
            { kind: 7, path: "EventTarget.prototype.dispatchEvent", name: "DISPATCH_HOOKED", action: "flag" },
            { kind: 7, path: "requestAnimationFrame", name: "RAF_HOOKED", action: "flag" },
            { kind: 7, path: "CanvasRenderingContext2D.prototype.drawImage", name: "CANVAS_HOOKED", action: "flag" },
            { kind: 7, path: "CanvasRenderingContext2D.prototype.fillText", name: "CANVAS_HOOKED", action: "flag" },
            { kind: 7, path: "WebGLRenderingContext.prototype.drawElements", name: "WEBGL_HOOKED", action: "flag" },
            { kind: 7, path: "Function.prototype.toString", name: "TOSTRING_HOOKED", action: "flag" },
            { kind: 7, path: "Object.defineProperty", name: "DEFINE_HOOKED", action: "flag" },
            { kind: 7, path: "JSON.parse", name: "JSON_HOOKED", action: "flag" },
            { kind: 7, path: "Math.random", name: "RANDOM_HOOKED", action: "flag" },
            { kind: 7, path: "performance.now", name: "TIMER_HOOKED", action: "flag" },
            { kind: 7, path: "Date.now", name: "TIMER_HOOKED", action: "flag" },
            // constructors swapped for wrappers
            { kind: 5, path: "WebSocket", name: "SOCKET_WRAPPED", action: "flag" },
            { kind: 5, path: "MouseEvent", name: "EVENTS_WRAPPED", action: "flag" },
            { kind: 5, path: "KeyboardEvent", name: "EVENTS_WRAPPED", action: "flag" },
            { kind: 5, path: "XMLHttpRequest", name: "NETWORK_WRAPPED", action: "flag" },
            { kind: 5, path: "Worker", name: "WORKER_WRAPPED", action: "flag" },
            // (not Image / Audio: their prototype.constructor is HTMLImageElement /
            // HTMLAudioElement in every browser, so they would always match)
            // userscript managers that leak onto the page
            { kind: 1, path: "window", value: "unsafeWindow", name: "USERSCRIPT_MANAGER", action: "flag" },
            { kind: 1, path: "window", value: "GM_info", name: "USERSCRIPT_MANAGER", action: "flag" },
            { kind: 1, path: "window", value: "GM", name: "USERSCRIPT_MANAGER", action: "flag" }
            // Signatures of specific scripts go here too, e.g.
            //   { kind: 1, path: "window", value: "someCheatGlobal", name: "SOME_CHEAT", action: "kick" },
            //   { kind: 3, value: "someCheatSettingsKey", name: "SOME_CHEAT", action: "flag" },
            //   { kind: 4, value: "div#someCheatMenu", name: "SOME_CHEAT", action: "flag" }
        ]
    },

    // Per-packet token buckets: [refill per second, burst]. Tuned to the official
    // client's real send rates; exceeding them drops the packet and adds a strike.
    rateLimits: {
        global: [150, 300],
        packets: {
            M: [1, 3], D: [60, 120], 9: [40, 80], e: [10, 20], F: [40, 80], z: [20, 40], H: [10, 20],
            K: [10, 20], L: [2, 4], N: [2, 4], b: [2, 4], P: [5, 10], Q: [5, 10], c: [10, 20],
            6: [2, 4], S: [1, 2], 0: [2, 4], T: [1, 3], R: [2, 5], A: [20, 40], V: [4, 8], I: [1, 2]
        },
        // Anonymous mode ("I") can be switched once every 31 s by the client.
        anonCooldownMs: 30000,
        strikesToKick: 40,
        strikeDecayMs: 10000
    },

    // Invalid argument shapes (wrong types, NaN, out-of-range ids...).
    validation: {
        strikesPerInvalid: 2
    },

    // The original "Shame!" system: eating within 120ms of being hit 8 times in a row
    // (auto-heal scripts) gives the Shame! hat for 30s and blocks eating.
    shame: {
        hitWindowMs: 120,
        threshold: 8,
        durationMs: 30000
    },

    // After a kick, /join answers "You were removed from the game - try again in ..." for this long.
    kickLock: {
        anticheatSeconds: 60,
        staffSeconds: 120
    },

    // Moderation storage (relative to server/data).
    storage: {
        reports: "reports.jsonl",
        bans: "bans.json"
    }
};
