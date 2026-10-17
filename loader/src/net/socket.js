/*
 * moomoo.js loader — ANTI-CHEAT BYPASS  (undetectable WebSocket hook)
 * ===================================================================
 * FOR USE ON YOUR OWN PRIVATE SERVER / EDUCATIONAL USE ONLY.
 *
 * The server's anti-tamper (see server/src/anticheat) relies on the official
 * client reporting a telemetry packet "T" = [flags, untrustedEvents]. The
 * SOCKET_HOOKED bit (value 2) is set by this exact client check:
 *
 *     ( window.WebSocket !== pr )                 // pr = ref captured at client init
 *   || !looksNative( WebSocket.prototype.send )   // Function.prototype.toString must say [native code]
 *
 * So a hook is invisible if BOTH stay false. We achieve that by:
 *   1. Replacing window.WebSocket with a Proxy of the NATIVE constructor, and
 *      installing it at document-start — BEFORE the client captures `pr`. The
 *      client therefore captures OUR proxy as `pr`, and later `window.WebSocket
 *      === pr` holds.
 *   2. Replacing WebSocket.prototype.send with a Proxy of the NATIVE send. A
 *      Proxy of a function is transparent to Function.prototype.toString — it
 *      still reports "[native code]" — so looksNative() stays satisfied, while
 *      the apply trap lets us see and rewrite every outgoing frame.
 *
 * Why the prototype (not per-socket): the official client caches
 *   dl = window.WebSocket.prototype.send
 * and sends with `dl.call(socket, frame)`. That bypasses any per-instance
 * `socket.send` override, so a per-socket hook never sees the client's frames —
 * which breaks both sequence ownership (injected packets collide -> the server
 * closes with "bad sequence") and the telemetry scrub. Hooking the prototype is
 * the only place that catches `dl.call(...)`.
 *
 * The loader re-encodes every frame this trap surfaces through ONE sequence
 * counter (client frames + injected frames alike) and scrubs the outgoing "T"
 * telemetry (binding.telemetry.scrub) so the server always sees clean flags.
 *
 * Part of the LOADER (the volatile half).
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooSocket = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooSocket = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    /*
     * Install the undetectable WebSocket proxy on `win`.
     *   onSocket(ws, url)  -> called for every new socket so the loader can
     *                         attach its (passive) read + (active) send hooks.
     *   onError(err)       -> optional error reporter.
     * Returns the native WebSocket constructor (handy for the loader).
     */
    function installWebSocketProxy(win, onSocket, onError) {
        const NativeWebSocket = win.WebSocket;
        if (!NativeWebSocket) throw new Error("no WebSocket to hook");
        const report = (e) => { try { onError && onError(e); } catch (_) {} };

        // Per-socket outgoing transform + native-send, kept in WeakMaps. NOTHING is
        // ever written to the socket object — no own properties, no symbols — so the
        // client's "own properties/symbols were added to the socket" integrity check
        // (SOCKET_TAMPERED) finds a pristine socket. The loader drives a socket through
        // the setTransform / nativeSend helpers returned below, keyed by the socket.
        const transforms = new WeakMap();
        const NativeProtoSend = NativeWebSocket.prototype && NativeWebSocket.prototype.send;

        // Replace WebSocket.prototype.send with a Proxy of the native send. The
        // client's `dl.call(socket, frame)` lands here; we hand the frame to that
        // socket's transform (re-encode + scrub) and send the result natively.
        if (NativeProtoSend) {
            const sendProxy = new Proxy(NativeProtoSend, {
                apply(target, ws, args) {
                    const transform = ws && transforms.get(ws);
                    if (!transform) return Reflect.apply(target, ws, args); // non-game socket / not ready yet
                    try {
                        const out = transform(args[0], (d) => Reflect.apply(target, ws, [d]));
                        //   undefined -> transform already sent (or dropped); do nothing
                        //   a value   -> send it natively
                        if (out !== undefined) Reflect.apply(target, ws, [out]);
                        return undefined;
                    } catch (e) {
                        report(e);
                        return Reflect.apply(target, ws, args); // fail open: never break the game
                    }
                }
            });
            const orig = Object.getOwnPropertyDescriptor(NativeWebSocket.prototype, "send") || {};
            try {
                Object.defineProperty(NativeWebSocket.prototype, "send", {
                    value: sendProxy,
                    writable: "writable" in orig ? orig.writable : true,
                    enumerable: "enumerable" in orig ? orig.enumerable : false,
                    configurable: "configurable" in orig ? orig.configurable : true
                });
            } catch (e) {
                try { NativeWebSocket.prototype.send = sendProxy; } catch (_) { report(e); }
            }
        }

        const handler = {
            construct(target, args, newTarget) {
                const ws = Reflect.construct(target, args, newTarget === Proxied ? target : newTarget);
                try { onSocket && onSocket(ws, args && args[0]); } catch (e) { report(e); }
                return ws;
            },
            // Pass-through for everything. receiver=target keeps native getter
            // semantics and avoids proxy-as-receiver edge cases.
            get(target, prop, receiver) {
                return Reflect.get(target, prop, target);
            },
            set(target, prop, value) { return Reflect.set(target, prop, value); },
            has(target, prop) { return Reflect.has(target, prop); },
            deleteProperty(target, prop) { return Reflect.deleteProperty(target, prop); },
            defineProperty(target, prop, desc) { return Reflect.defineProperty(target, prop, desc); },
            getOwnPropertyDescriptor(target, prop) { return Reflect.getOwnPropertyDescriptor(target, prop); },
            ownKeys(target) { return Reflect.ownKeys(target); },
            getPrototypeOf(target) { return Reflect.getPrototypeOf(target); },
            setPrototypeOf(target, proto) { return Reflect.setPrototypeOf(target, proto); },
            // WebSocket must be called with `new`; forward apply anyway so the
            // native "Failed to construct" error is produced, not a proxy error.
            apply(target, thisArg, args) { return Reflect.apply(target, thisArg, args); }
        };

        const Proxied = new Proxy(NativeWebSocket, handler);

        // The integrity probe "SOCKET_WRAPPED" (kind 5) flags WebSocket when
        //   WebSocket.prototype.constructor !== WebSocket
        // On a real client those are the same object; our Proxy breaks that (the native
        // prototype's `constructor` still points at the native constructor, not the Proxy),
        // which is a detectable fingerprint. Point the prototype's constructor back at the
        // Proxy so the invariant holds again. `constructor` is a plain data property, read by
        // almost nothing, and a Proxy of the native constructor still stringifies as native.
        try {
            const cd = Object.getOwnPropertyDescriptor(NativeWebSocket.prototype, "constructor") || {};
            Object.defineProperty(NativeWebSocket.prototype, "constructor", {
                value: Proxied,
                writable: "writable" in cd ? cd.writable : true,
                enumerable: "enumerable" in cd ? cd.enumerable : false,
                configurable: "configurable" in cd ? cd.configurable : true
            });
        } catch (e) { report(e); }

        // Replace the global. Define it the same way the platform does so a
        // descriptor probe sees nothing unusual. If the property can't be written
        // (a frozen WebSocket, or a userscript sandbox realm where it's read-only)
        // don't throw out of here and abort the whole loader — report it and carry
        // on. window.MooMoo still comes up; the fix is to run in page context
        // (@inject-into page / @grant none).
        let swapped = false;
        try {
            Object.defineProperty(win, "WebSocket", {
                value: Proxied, writable: true, enumerable: false, configurable: true
            });
            swapped = win.WebSocket === Proxied;
        } catch (e1) {
            try { win.WebSocket = Proxied; swapped = win.WebSocket === Proxied; }
            catch (e2) { /* handled below */ }
        }
        if (!swapped) {
            report(new Error("could not replace window.WebSocket (read-only in this realm). " +
                "Run the userscript in page context: Violentmonkey -> @inject-into page, Tampermonkey -> @grant none."));
        }
        // The loader drives sockets through these, keyed by the socket object, so the
        // socket itself stays untouched (nothing to enumerate on it).
        return {
            native: NativeWebSocket,
            setTransform: (ws, fn) => { try { transforms.set(ws, fn); } catch (e) { report(e); } },
            nativeSend: (ws, data) => Reflect.apply(NativeProtoSend, ws, [data])
        };
    }

    return { installWebSocketProxy };
});
