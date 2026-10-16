/*
 * moomoo.js loader — OUTGOING  (rate governor + packet accounting + ping)
 * ======================================================================
 * Every frame that leaves the socket — the official client's own frames AND
 * frames mods inject — passes through here first.
 *
 *  1. GOVERNOR. The server keeps a token bucket per packet type plus a global
 *     one (server/src/anticheat/config.js, mirrored in binding.rateLimits).
 *     Going over a bucket costs a strike and 40 strikes is a kick. The official
 *     client is tuned to stay under them on its own, but client + mod together
 *     can exceed a bucket (e.g. both selecting items in one tick). The governor
 *     mirrors the buckets with a safety margin and refuses a frame that would
 *     overflow, so the server never sees a burst it would strike. It is the same
 *     idea as the bundle's own packet limiter (packet.send refused to send past
 *     120 packets per 9 ticks), just keyed to this server's real limits.
 *
 *  2. ACCOUNTING. Counts sent frames per second / per minute / per type, and
 *     what the governor refused, for the "packet count" visual and diagnostics.
 *
 *  3. PING. The official client pings every 2.5s on its own; timing those
 *     round trips gives the mod a ping without sending a single extra packet
 *     (the bundle pinged every 400ms, which this server's "0" bucket [2/s]
 *     would strike).
 *
 * Part of the LOADER (volatile).
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooOutgoing = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooOutgoing = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    // Margin against network jitter bunching packets together on the way to the
    // server: refill a little slower and keep a couple of tokens in reserve.
    const RATE_MARGIN = 0.9;
    const BURST_RESERVE = 2;
    // Never refused: telemetry (a missing heartbeat is itself a kick) and spawn.
    const NEVER_DROP = new Set(["T", "M"]);

    class Bucket {
        constructor(spec, now) {
            const [perSecond, burst] = spec;
            this.rate = (perSecond * RATE_MARGIN) / 1000;
            this.capacity = Math.max(1, burst - BURST_RESERVE);
            this.tokens = this.capacity;
            this.updated = now;
        }
        refill(now) {
            this.tokens = Math.min(this.capacity, this.tokens + (now - this.updated) * this.rate);
            this.updated = now;
        }
        canTake(now) { this.refill(now); return this.tokens >= 1; }
        take() { this.tokens -= 1; }
    }

    function createOutgoing(opts) {
        opts = opts || {};
        const limits = opts.rateLimits || { global: [150, 300], packets: {} };
        const clock = opts.now || (() => Date.now());

        let enabled = opts.enabled !== false;
        let global = new Bucket(limits.global, clock());
        let buckets = Object.create(null);
        const bucketFor = (wire, now) => {
            const spec = limits.packets[wire];
            if (!spec) return null;
            return buckets[wire] || (buckets[wire] = new Bucket(spec, now));
        };

        // ---- governor ----
        // allow(wire) checks AND consumes; a refused frame consumes nothing.
        function allow(wire) {
            const now = clock();
            if (!enabled || NEVER_DROP.has(wire)) {
                const b = bucketFor(wire, now);
                global.refill(now); if (global.tokens >= 1) global.take();
                if (b) { b.refill(now); if (b.tokens >= 1) b.take(); }
                return true;
            }
            const b = bucketFor(wire, now);
            if (!global.canTake(now) || (b && !b.canTake(now))) {
                stats.refused++;
                stats.refusedByType[wire] = (stats.refusedByType[wire] || 0) + 1;
                for (const fn of refusedTaps) { try { fn(wire); } catch (e) { /* ignore */ } }
                return false;
            }
            global.take();
            if (b) b.take();
            return true;
        }
        // Would a frame of this type be accepted right now? (does not consume)
        function wouldAllow(wire) {
            const now = clock();
            if (!enabled || NEVER_DROP.has(wire)) return true;
            const b = bucketFor(wire, now);
            return global.canTake(now) && (!b || b.canTake(now));
        }
        function tokens(wire) {
            const now = clock();
            const b = bucketFor(wire, now);
            if (!b) return Infinity;
            b.refill(now);
            return b.tokens;
        }

        // ---- accounting ----
        const stats = { sent: 0, refused: 0, refusedByType: Object.create(null), byType: Object.create(null) };
        const secondWindow = [];       // timestamps of frames sent in the last 1s
        const minuteWindow = [];       // ... last 60s
        const refusedTaps = new Set();
        function record(wire) {
            const now = clock();
            stats.sent++;
            stats.byType[wire] = (stats.byType[wire] || 0) + 1;
            secondWindow.push(now);
            minuteWindow.push(now);
            prune(now);
        }
        function prune(now) {
            while (secondWindow.length && now - secondWindow[0] > 1000) secondWindow.shift();
            while (minuteWindow.length && now - minuteWindow[0] > 60000) minuteWindow.shift();
        }
        function perSecond() { prune(clock()); return secondWindow.length; }
        function perMinute() { prune(clock()); return minuteWindow.length; }

        // ---- ping (timed off the client's own "0" -> pong round trips) ----
        const pingSamples = [];
        let pingSentAt = 0;
        let lastPing = 0;
        function onPingSent() { pingSentAt = clock(); }
        function onPong() {
            if (!pingSentAt) return null;
            lastPing = clock() - pingSentAt;
            pingSentAt = 0;
            pingSamples.push(lastPing);
            if (pingSamples.length >= 4) pingSamples.shift();   // bundle keeps the last 3 (yt)
            return lastPing;
        }
        function avgPing() {
            if (!pingSamples.length) return 0;
            return pingSamples.reduce((a, b) => a + b, 0) / pingSamples.length;
        }
        // the quickest recent round trip: the safe side when timing when a frame
        // reaches the server (shame timing)
        function minPing() {
            if (!pingSamples.length) return 0;
            return Math.min.apply(null, pingSamples);
        }

        function reset() {
            const now = clock();
            global = new Bucket(limits.global, now);
            buckets = Object.create(null);
            pingSentAt = 0;
        }

        return {
            allow, wouldAllow, tokens, record,
            perSecond, perMinute, stats,
            onRefused: (fn) => { refusedTaps.add(fn); return () => refusedTaps.delete(fn); },
            onPingSent, onPong,
            get ping() { return lastPing; },
            avgPing, minPing,
            setEnabled: (b) => { enabled = !!b; },
            get enabled() { return enabled; },
            reset,
            RATE_MARGIN, BURST_RESERVE
        };
    }

    return { createOutgoing, Bucket };
});
