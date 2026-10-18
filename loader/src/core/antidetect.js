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

    function describeWarning(w) {
        if (w.type === "unknown-kind") return "an unknown integrity-probe KIND " + w.kind + " (probe #" + w.index + (w.path ? ", path '" + w.path + "'" : "") + ") the sanitiser has no rule for" + (w.matched ? " — and the client MATCHED it, so loader footprint may be leaking. Add a rule for kind " + w.kind + " in binding.js cleanProbeResult." : " (not matched this round, but add a rule before it is).");
        if (w.type === "residual-footprint") return "a bit the sanitiser should have stripped (kind " + w.kind + ", probe #" + w.index + ") is STILL set in the sent answer — stripping silently failed.";
        if (w.type === "dom-blind") return w.detail || "the telemetry sanitiser cannot see the page.";
        return "an unaccounted-for condition (" + w.type + ").";
    }

    function create(opts) {
        const telemetry = opts && opts.telemetry;
        const subs = new Set();

        const api = {
            // Master switch for the AGGRESSIVE fallback. Default OFF: the loader reconstructs
            // every "T" to report only what the original client would — flags + untrusted masked
            // (pure loader/mod footprint), and the probe result kept but run through
            // `cleanProbeResult` so loader/mod bits are stripped and canary bits (things a real
            // client always has) survive. That is what passes a "canary" probe. Turn it ON only on
            // a server you know sends NO canary probes: it then blanks the probe result entirely,
            // which hides everything but would FAIL a canary and get you caught.
            enabled: false,
            // How many "T" packets have been cancelled + reconstructed.
            count: 0,
            // How many of those actually carried loader/mod footprint we had to neutralise
            // (a masked flag / untrusted count, or a stripped probe bit — NOT a benign canary).
            caughtCount: 0,
            // The most recent client "T": what the client reported, what footprint we stripped,
            // and the probe result actually sent (`sentProbeResult` — the original-client answer).
            last: null,
            // A rolling list of the last LOG_LIMIT entries.
            log: [],

            // ---- self-protection ----
            // Problems the sanitiser could NOT account for on recent "T" rounds: a brand-new
            // integrity-probe kind with no strip rule, a strip that silently failed, or a
            // telemetry global that has gone blind to the page. Each is also console.warn'd
            // once (so it is impossible to miss) and offered to onDetection subscribers (the
            // debug panel renders them). `healthy` is false while the sanitiser is compromised.
            warnings: [],
            warningCount: 0,
            lastWarnings: null,
            healthy: true,
            _warned: null,

            _recordWarnings(list) {
                if (!this._warned) this._warned = {};
                for (const w of list) {
                    const stamped = Object.assign({ at: Date.now() }, w);
                    this.warnings.push(stamped);
                    if (this.warnings.length > LOG_LIMIT) this.warnings.shift();
                    this.warningCount++;
                    const sig = w.type + ":" + (w.kind != null ? w.kind : "") + ":" + (w.index != null ? w.index : "");
                    if (!this._warned[sig]) {
                        this._warned[sig] = true;
                        try { (console.warn || console.log).call(console, "[moomoo.js] anti-cheat SELF-PROTECTION tripped — " + describeWarning(w)); } catch (e) {}
                    }
                }
            },

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
                // The reconstructed "T" reports ONLY what the original, unmodified client would —
                // never the loader or a mod. `flags` and `untrusted` are pure loader/mod footprint
                // (a clean client always reports 0), so they are always masked: `flags` carries the
                // loader's one irreducible fingerprint, the WebSocket hook the client self-reports
                // as SOCKET_HOOKED / SOCKET_INTEGRITY, and `untrusted` only counts script-dispatched
                // inputs the client refused. The PROBE RESULT is the client's own honest answer, so
                // it is KEPT — but run through `cleanProbeResult`, which clears exactly the bits a
                // probe matched because of the loader/a mod (a hooked function, a swapped
                // constructor, one of our localStorage keys or id'd elements) and leaves every
                // CANARY bit (things a real client genuinely has) in place. What remains is exactly
                // what the original client attempts to send. `enabled` is the old aggressive
                // fallback that blanks the probe result entirely — only safe on a server that sends
                // no canary probes, so it stays opt-in and off by default.
                const clean = telemetry.cleanProbeResult
                    ? telemetry.cleanProbeResult(seen.probeResult, env.probes, env.probeSalt)
                    : seen.probeResult;
                const sentProbe = this.enabled ? 0 : clean;
                const stripped = (seen.probeResult & ~clean) >>> 0;   // probe bits that were the loader's / a mod's
                // Self-protection: detect anything the sanitiser could not account for (a new
                // probe kind, a failed strip, a blinded global). Detection only — `sentProbe` is
                // already fixed above; this never changes what goes out, it just raises the alarm.
                let warnings = [];
                try { if (telemetry.auditProbeResult) warnings = telemetry.auditProbeResult(seen.probeResult, clean, env.probes, env.probeSalt) || []; } catch (e) { warnings = []; }
                this.healthy = !warnings.some((w) => w.type === "dom-blind");
                this.lastWarnings = warnings.length ? warnings : null;
                if (warnings.length) this._recordWarnings(warnings);
                // "caught" = we actually neutralised loader/mod footprint — a masked flag, a refused
                // input, or a stripped probe bit. A canary the client legitimately reports is NOT a
                // catch: it passes straight through, exactly as a real client would send it.
                const caught = !!(seen.flags || seen.untrusted || stripped);
                const entry = {
                    at: Date.now(),
                    flags: seen.flags, flagNames: seen.flagNames,
                    untrusted: seen.untrusted, probeResult: seen.probeResult,
                    sentProbeResult: sentProbe, strippedProbe: stripped,
                    caught, neutralised: this.enabled,
                    warnings: warnings.length ? warnings : null
                };
                this.count++;
                if (caught) this.caughtCount++;
                this.last = entry;
                this.log.push(entry);
                if (this.log.length > LOG_LIMIT) this.log.shift();
                for (const fn of subs) { try { fn(entry); } catch (e) { /* a listener must not break the frame */ } }
                return telemetry.construct(env, { flags: 0, untrusted: 0, probeResult: sentProbe });
            }
        };
        return api;
    }

    return { create };
});
