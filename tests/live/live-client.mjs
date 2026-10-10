/*
 * LIVE TEST CLIENTS
 * =================
 *  - BrowserLikeWebSocket: wraps the `ws` package in the browser WebSocket API
 *    (addEventListener, onmessage, ArrayBuffer data, native-looking send) so the
 *    loader's constructor Proxy can hook it exactly like it hooks Chrome's.
 *
 *  - createVictim(): a fake page window running the REAL loader core and the REAL
 *    mods/examplescript.js, plus an emulation of the official client's own
 *    traffic (its own ClientSession + seq, spawn, telemetry, ping, aim). That's
 *    the important part: in the real game, client frames and mod-injected frames
 *    interleave on one socket, and the loader has to re-sequence both.
 *
 *  - createBot(): a plain protocol client (no loader) used as an attacker.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..", "..");
const Protocol = require(path.join(ROOT, "loader", "src", "protocol.js"));
const Binding = require(path.join(ROOT, "loader", "src", "binding.js"));

export function makeBrowserWebSocket(WS, origin) {
    class WebSocket {
        constructor(url) {
            this.url = url;
            this.binaryType = "blob";
            this.readyState = 0;
            this.onopen = this.onmessage = this.onclose = this.onerror = null;
            this._l = { open: new Set(), message: new Set(), close: new Set(), error: new Set() };
            const sock = new WS(url, { headers: { Origin: origin } });
            sock.binaryType = "arraybuffer";
            this._sock = sock;
            sock.on("open", () => { this.readyState = 1; this._emit("open", { type: "open" }); });
            sock.on("message", (data) => {
                const ab = data instanceof ArrayBuffer ? data : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
                this._emit("message", { type: "message", data: ab });
            });
            sock.on("close", (code, reason) => { this.readyState = 3; this._emit("close", { type: "close", code, reason: String(reason || "") }); });
            sock.on("error", (err) => this._emit("error", { type: "error", error: err }));
        }
        send(data) { if (this._sock.readyState === 1) this._sock.send(data); }
        close(code) { try { this._sock.close(code); } catch (_) {} }
        addEventListener(t, f) { if (this._l[t]) this._l[t].add(f); }
        removeEventListener(t, f) { if (this._l[t]) this._l[t].delete(f); }
        _emit(t, ev) { for (const f of Array.from(this._l[t])) { try { f(ev); } catch (e) { console.error(e); } } const h = this["on" + t]; if (h) { try { h(ev); } catch (e) { console.error(e); } } }
    }
    WebSocket.CONNECTING = 0; WebSocket.OPEN = 1; WebSocket.CLOSING = 2; WebSocket.CLOSED = 3;
    return WebSocket;
}

// Minimal official-client emulation: owns its own session + seq, decodes every
// s2c frame (keeps the mask counter in step), and exposes send(name, args).
function emulateClient(ws, mod, hooks) {
    const st = { session: null, sid: -1, alive: false, closed: null, disconnectReason: null, players: new Map(), health: 100 };
    ws.addEventListener("message", (ev) => {
        const bytes = new Uint8Array(ev.data);
        if (!st.session) {
            const hs = Protocol.isHandshake(bytes);
            if (!hs) return;
            st.session = new Protocol.ClientSession(hs[1], mod);
            hooks.onHandshake && hooks.onHandshake();
            return;
        }
        let dec;
        try { dec = st.session.decodeS2C(bytes); } catch (e) { hooks.onError && hooks.onError(e); return; }
        const bind = Binding.incoming[dec.name];
        const payload = bind ? bind.parse(dec.args) : { args: dec.args };
        const event = bind ? bind.event : dec.name;
        if (event === "setup") { st.sid = payload.sid; st.alive = true; }
        if (event === "died") { st.alive = false; st.deaths = (st.deaths || 0) + 1; if (hooks.autoRespawn) setTimeout(() => st.send("M", [{ name: hooks.name || "player", moofoll: 1, skin: 0 }]), 400); }
        if (event === "disconnect") st.disconnectReason = payload.reason;
        if (event === "health" && payload.sid === st.sid) st.health = payload.value;
        if (event === "playersUpdate") for (const p of payload.positions) { const o = st.players.get(p.sid) || {}; Object.assign(o, p); st.players.set(p.sid, o); }
        hooks.onPacket && hooks.onPacket(event, payload);
    });
    ws.addEventListener("close", (ev) => { st.closed = { code: ev.code, reason: ev.reason, at: Date.now() }; hooks.onClose && hooks.onClose(ev); });
    st.send = (name, args) => {
        if (!st.session || ws.readyState !== 1) return false;
        ws.send(st.session.encodeC2S(name, args));
        return true;
    };
    return st;
}

const tick = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitFor(fn, ms, label) {
    const t0 = Date.now();
    while (!fn()) { if (Date.now() - t0 > ms) throw new Error("timeout waiting for " + label); await tick(25); }
}

/*
 * The victim: real loader + real examplescript in a fake page.
 *   opts: { WS, srv, mod, url, name, configure(MooMoo) }
 */
export async function createVictim(opts) {
    const listeners = new Map();
    const win = {
        document: { baseURI: opts.srv.base + "/", querySelectorAll: () => [] },
        Event: class { constructor(type) { this.type = type; } },
        addEventListener: (t, f) => { (listeners.get(t) || listeners.set(t, new Set()).get(t)).add(f); },
        removeEventListener: (t, f) => { const s = listeners.get(t); if (s) s.delete(f); },
        dispatchEvent: (ev) => { const s = listeners.get(ev.type); if (s) for (const f of s) f(ev); return true; },
        innerWidth: 1280, innerHeight: 720,
        console,
        WebSocket: makeBrowserWebSocket(opts.WS, opts.srv.origin)
    };
    // Fresh copies of the loader modules for this window.
    for (const k of Object.keys(require.cache)) if (k.startsWith(path.join(ROOT, "loader")) || k.startsWith(path.join(ROOT, "shared"))) delete require.cache[k];
    const LoaderCore = require(path.join(ROOT, "loader", "src", "loader.js"));
    const { MooMoo, MooMooLoader } = LoaderCore.createLoader(win, { resolveProtocol: () => opts.mod });

    // Run the real examplescript exactly as Tampermonkey would (it reads `window`).
    const code = fs.readFileSync(path.join(ROOT, "mods", "examplescript.js"), "utf8");
    new Function("window", "unsafeWindow", code)(win, undefined);
    await waitFor(() => MooMoo.getMods().some((m) => m.id === "examplescript"), 3000, "examplescript to register");
    if (opts.configure) opts.configure(MooMoo);

    // Record every frame that actually leaves the socket (after the loader).
    const outLog = [];
    MooMooLoader.onRaw((dir, name, args) => { if (dir === "out") outLog.push({ t: Date.now(), name, args }); });
    const loaderErrors = [];
    const origError = console.error;

    // The "official client" opens the game socket through the hooked constructor.
    const ws = new win.WebSocket(opts.url);
    const client = emulateClient(ws, opts.mod, {
        name: opts.name || "victim", autoRespawn: opts.autoRespawn !== false,
        onHandshake: () => setTimeout(() => client.send("M", [{ name: opts.name || "victim", moofoll: 1, skin: 0 }]), 50)
    });
    await waitFor(() => client.sid >= 0 || client.closed, 8000, "victim spawn");
    if (client.closed) throw new Error("victim closed before spawn: " + JSON.stringify(client.closed));

    // Background traffic like the real client: aim updates, pings, telemetry.
    const timers = [];
    let aim = 0;
    timers.push(setInterval(() => { aim += 0.05; client.send("D", [aim]); }, 250));
    timers.push(setInterval(() => client.send("0", []), 3000));
    // Telemetry 5s after joining, flags 3 = USERSCRIPT_MANAGER|SOCKET_HOOKED: the
    // loader must scrub it to [0,0] or the server kicks us for SOCKET_HOOKED.
    timers.push(setTimeout(() => client.send("T", [3, 0]), 5000));

    return {
        win, MooMoo, MooMooLoader, client, outLog, loaderErrors,
        stop() { for (const t of timers) { clearInterval(t); clearTimeout(t); } try { ws.close(); } catch (_) {} console.error = origError; }
    };
}

/*
 * A plain bot (no loader). Used as the attacker; must be an admin account to use
 * goto/give. opts: { WS, srv, mod, url, name }
 */
export async function createBot(opts) {
    const WebSocket = makeBrowserWebSocket(opts.WS, opts.srv.origin);
    const ws = new WebSocket(opts.url);
    const client = emulateClient(ws, opts.mod, {
        onHandshake: () => setTimeout(() => client.send("M", [{ name: opts.name || "bot", moofoll: 1, skin: 0 }]), 50)
    });
    await waitFor(() => client.sid >= 0 || client.closed, 8000, "bot spawn");
    if (client.closed) throw new Error("bot closed before spawn: " + JSON.stringify(client.closed));
    const timers = [setTimeout(() => client.send("T", [0, 0]), 5000)];
    return {
        client,
        admin: (...args) => client.send("A", args),
        aimAt(sid) {
            const me = client.players.get(client.sid), them = client.players.get(sid);
            if (!me || !them) return null;
            const dir = Math.atan2(them.y - me.y, them.x - me.x);
            client.send("D", [dir]);
            return dir;
        },
        stop() { for (const t of timers) { clearInterval(t); clearTimeout(t); } try { ws.close(); } catch (_) {} }
    };
}

export { tick, waitFor };
