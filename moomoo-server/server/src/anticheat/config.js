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
        enforceOrigin: true,       // Origin header must be this server, else 4004 "Please play at moomoo.io"
        requireTicket: true,       // ?token=tk:<ticket> issued by /api/join, else 4001 "Invalid Connection"
        ticketMaxAgeMs: 60 * 1000,
        maxConnectionsPerIp: 4
    },

    // Client telemetry: packet "T" = [flags, untrustedEvents]. Pinned clients send it
    // 5s after joining and then every 60s (see Hr/Nx in the client).
    telemetry: {
        required: true,
        firstReportMs: 5000,
        intervalMs: 60000,
        graceMs: 45000,            // background tabs throttle timers, so allow some slack
        missingAction: "kick",
        flags: {
            1: { name: "USERSCRIPT_MANAGER", action: "flag" },  // Tampermonkey / Violentmonkey / GM_* globals
            2: { name: "SOCKET_HOOKED", action: "kick" },       // window.WebSocket or WebSocket.prototype.send replaced
            4: { name: "RENDER_HOOKED", action: "flag" },       // canvas / WebGL / rAF / getContext not native
            8: { name: "DEBUGGER_PAUSED", action: "flag" }      // anti-debug "debugger" trap took > 200ms
        },
        // Script-dispatched (isTrusted = false) clicks / touches the client refused.
        untrustedEvents: { threshold: 20, action: "flag" }
    },

    // Per-packet token buckets: [refill per second, burst]. Tuned to the official
    // client's real send rates; exceeding them drops the packet and adds a strike.
    rateLimits: {
        global: [150, 300],
        packets: {
            M: [1, 3], D: [60, 120], 9: [40, 80], e: [10, 20], F: [40, 80], z: [20, 40], H: [10, 20],
            K: [10, 20], L: [2, 4], N: [2, 4], b: [2, 4], P: [5, 10], Q: [5, 10], c: [10, 20],
            6: [2, 4], S: [1, 2], 0: [2, 4], T: [1, 3], R: [2, 5], A: [20, 40], V: [4, 8]
        },
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

    // Moderation storage (relative to server/data).
    storage: {
        reports: "reports.jsonl",
        bans: "bans.json"
    }
};
