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
 *   2. Forwarding every `get` to the native target via Reflect and NEVER
 *      touching WebSocket.prototype. `WebSocket.prototype.send` stays the real
 *      native function, so looksNative() is satisfied.
 *   3. Intercepting per-SOCKET inside the `construct` trap, never via the
 *      prototype.
 *
 * As a deterministic safety net, the loader also scrubs the outgoing "T" packet
 * (see binding.telemetry.scrub) so even an unforeseen detection path reports
 * clean flags. That part lives in the loader's c2s pipeline; this file only
 * installs the hook.
 *
 * Part of the LOADER (the volatile half).
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooAnticheat = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooAnticheat = value;
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
        // Idempotent: if we already installed, don't double-wrap.
        if (NativeWebSocket.__moomooWrapped) return NativeWebSocket.__moomooNative || NativeWebSocket;

        const report = (e) => { try { onError && onError(e); } catch (_) {} };

        // Wrap one socket's send() in a Proxy of the NATIVE send so that, even if
        // some check ever inspects it, Function.prototype.toString unwraps to the
        // native source. The loader's transform decides what actually goes out.
        function wrapSend(ws) {
            const nativeSend = ws.send.bind(ws);
            let transform = null; // set by the loader via ws.__moomooSetTransform
            const sendProxy = new Proxy(ws.send, {
                apply(target, thisArg, args) {
                    const data = args[0];
                    if (transform) {
                        try {
                            const out = transform(data, (d) => nativeSend(d));
                            // transform returns:
                            //   undefined -> it already sent (or dropped); do nothing
                            //   a value   -> send that value natively
                            if (out !== undefined) nativeSend(out);
                            return undefined;
                        } catch (e) {
                            report(e);
                            return nativeSend(data); // fail open: never break the game
                        }
                    }
                    return Reflect.apply(target, thisArg === sendProxy ? ws : thisArg, args);
                }
            });
            try {
                Object.defineProperty(ws, "send", { value: sendProxy, writable: true, configurable: true });
            } catch (e) {
                ws.send = sendProxy;
            }
            // The loader installs its transform here once the session is ready.
            ws.__moomooSetTransform = (fn) => { transform = fn; };
            ws.__moomooNativeSend = nativeSend;
        }

        const handler = {
            construct(target, args, newTarget) {
                const ws = Reflect.construct(target, args, newTarget === Proxied ? target : newTarget);
                try { wrapSend(ws); } catch (e) { report(e); }
                try { onSocket && onSocket(ws, args && args[0]); } catch (e) { report(e); }
                return ws;
            },
            // Pass-through for everything. receiver=target keeps native getter
            // semantics and avoids proxy-as-receiver edge cases.
            get(target, prop, receiver) {
                if (prop === "__moomooWrapped") return true;
                if (prop === "__moomooNative") return NativeWebSocket;
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

        // Replace the global. Define it the same way the platform does so a
        // descriptor probe sees nothing unusual.
        try {
            Object.defineProperty(win, "WebSocket", {
                value: Proxied, writable: true, enumerable: false, configurable: true
            });
        } catch (e) {
            win.WebSocket = Proxied;
        }
        return NativeWebSocket;
    }

    return { installWebSocketProxy };
});
