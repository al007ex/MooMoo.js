/*
 * moomoo.js loader — ANTI-DETECTION  (the detection-packet canceller)
 * ===================================================================
 * FOR USE ON YOUR OWN PRIVATE SERVER / EDUCATIONAL USE ONLY.
 *
 * The ONLY packet the client uses to tell the server about itself is "T", the
 * telemetry answer to the server's integrity probes ("q"): it carries the
 * anti-tamper flags, the untrusted-input count and the probe-match bitmask — the
 * things that would report the loader. There is no way to simply drop it: the
 * server kicks a client that stops answering probes. So instead of letting the
 * client's "T" reach the wire, the loader CANCELS it and sends its OWN in its
 * place — built the exact way the client builds one, with the correct crypto /
 * transport envelope (seal, probe salt, sequence, frame ledger) so the server
 * accepts it, but with the three detection fields always EMPTY.
 *
 * It is observable (so a mod can show what was neutralised) and has a kill switch
 * (turn it off to confirm, on your own server, that detection would otherwise
 * fire). Reached from mods as `MooMooLoader.antiDetect`.
 *
 * Part of the LOADER (the volatile half).
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooAntiDetect = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooAntiDetect = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    const LOG_LIMIT = 50;

    function create(opts) {
        const telemetry = opts && opts.telemetry;
        const subs = new Set();

        const api = {
            // Master switch. On: the client's "T" is cancelled and an empty one is sent.
            // Off: the client's real detection fields are let through (still with the
            // loader's correct seq/ledger, so a ledger artefact isn't mistaken for a flag) —
            // only for verifying, on your own server, that detection would otherwise fire.
            enabled: true,
            // How many "T" packets have been cancelled + reconstructed.
            count: 0,
            // How many of those actually carried a detection (a non-zero flag / probe / untrusted).
            caughtCount: 0,
            // The decoded content of the most recent client "T" (what the server would have seen).
            last: null,
            // A rolling list of the last LOG_LIMIT entries.
            log: [],

            setEnabled(on) { this.enabled = !!on; return this.enabled; },

            // Subscribe to every cancelled "T" (entry = what the client would have reported).
            onDetection(fn) {
                if (typeof fn !== "function") return () => {};
                subs.add(fn);
                return () => subs.delete(fn);
            },

            // Called by the loader for every outgoing client "T". Returns the args of the
            // replacement "T" to encode in that frame's slot. The client's own "T" content is
            // discarded — only `ctx` (the crypto/transport envelope) shapes the reconstruction.
            handle(clientArgs, ctx) {
                const seen = telemetry.inspect(clientArgs);
                const caught = !!(seen.flags || seen.untrusted || seen.probeResult);
                const entry = {
                    at: Date.now(),
                    flags: seen.flags, flagNames: seen.flagNames,
                    untrusted: seen.untrusted, probeResult: seen.probeResult,
                    caught, neutralised: this.enabled
                };
                this.count++;
                if (caught) this.caughtCount++;
                this.last = entry;
                this.log.push(entry);
                if (this.log.length > LOG_LIMIT) this.log.shift();
                for (const fn of subs) { try { fn(entry); } catch (e) { /* a listener must not break the frame */ } }
                // The replacement "T" must still carry the right ENVELOPE — the seal and the
                // probe salt the server validates (seq + ledger always come from our own stream).
                // Prefer the loader's own tracked values; only if we somehow haven't got them
                // (e.g. the "q" round wasn't seen) fall back to the ones the client echoed — the
                // client saw the right round, and these are not detection data.
                let env = ctx;
                if (clientArgs && ((ctx.probeSalt == null && clientArgs.length > 4) || (ctx.sealReport == null && clientArgs.length > 3))) {
                    env = Object.assign({}, ctx);
                    if (env.probeSalt == null && clientArgs.length > 4) env.probeSalt = clientArgs[4];
                    if (env.sealReport == null && clientArgs.length > 3) env.sealReport = clientArgs[3];
                }
                // enabled -> empty detection; disabled -> pass the client's real detection through.
                return telemetry.construct(env, this.enabled ? null : seen);
            }
        };
        return api;
    }

    return { create };
});
