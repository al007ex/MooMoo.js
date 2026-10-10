/*
 * Integration test: the full loader, in a simulated browser, against a real
 * server ProtocolSession. Proves the end-to-end path:
 *   - the undetectable WebSocket proxy installs and `window.WebSocket === pr`
 *   - WebSocket.prototype.send stays native (the [native code] check passes)
 *   - io-init is read, keys derived, server->client frames become MooMoo events
 *   - client->server frames are re-encoded and ACCEPTED by the server
 *   - the "T" telemetry packet is scrubbed to clean flags
 *   - a mod can inject a packet that the server accepts
 *
 * Run:  node extension/tests/loader.integration.test.mjs
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import assert from "node:assert";
import crypto from "node:crypto";
import { loadServer, skipIfUnavailable } from "./server-fixture.mjs";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(here, "..", "loader", "src");

// Load loader modules as Node CommonJS and expose them as "page globals".
const g = globalThis;
g.MooMooVocabulary = require(path.join(here, "..", "shared", "vocabulary.js"));
g.MooMooMsgpack = require(path.join(srcDir, "msgpack.js"));
g.MooMooSha256 = require(path.join(srcDir, "sha256.js"));
g.MooMooProtocol = require(path.join(srcDir, "protocol.js"));
g.MooMooBinding = require(path.join(srcDir, "binding.js"));
g.MooMooRuntime = require(path.join(srcDir, "runtime.js"));
g.MooMooAnticheat = require(path.join(srcDir, "anticheat.js"));
const LoaderCore = require(path.join(srcDir, "loader.js"));

skipIfUnavailable("loader.integration");
const { ProtocolSession, createProtocolBuild } = await loadServer();

let pass = 0, fail = 0;
const ok = (name, fn) => Promise.resolve().then(fn).then(() => { pass++; console.log("  ✓ " + name); },
    (e) => { fail++; console.log("  ✗ " + name + "\n      " + (e && (e.stack || e.message))); });
const tick = () => new Promise((r) => setTimeout(r, 0));

// ---- a minimal fake browser ----
function makeFakeEnv(build) {
    const listeners = new Map();
    const win = {
        document: { baseURI: "https://localhost/", querySelectorAll: () => [] },
        Event: class { constructor(type) { this.type = type; } },
        addEventListener: (t, f) => { (listeners.get(t) || listeners.set(t, new Set()).get(t)).add(f); },
        dispatchEvent: (ev) => { const s = listeners.get(ev.type); if (s) for (const f of s) f(ev); return true; },
        console
    };

    // The "server" end of the loopback.
    const server = new ProtocolSession(build, crypto.randomBytes(8).toString("hex"));
    const acceptedByServer = [];
    let clientSocket = null;

    class FakeWebSocket {
        constructor(url) {
            this.url = url;
            this.readyState = 1;
            this._mlisteners = new Set();
            clientSocket = this;
        }
        addEventListener(type, fn) { if (type === "message") this._mlisteners.add(fn); }
        removeEventListener(type, fn) { if (type === "message") this._mlisteners.delete(fn); }
        // client -> server: decode on the server and remember the result
        send(bytes) {
            const buf = Buffer.from(bytes.buffer || bytes, bytes.byteOffset || 0, bytes.byteLength || bytes.length);
            acceptedByServer.push(server.decode(buf));
        }
        // test helper: deliver a server->client frame
        _deliver(frame) {
            const ev = { data: frame.buffer.slice(frame.byteOffset, frame.byteOffset + frame.byteLength) };
            for (const fn of this._mlisteners) fn(ev);
        }
    }
    FakeWebSocket.OPEN = 1;
    win.WebSocket = FakeWebSocket;

    return {
        win, server,
        get clientSocket() { return clientSocket; },
        acceptedByServer,
        emit(name, args) { clientSocket._deliver(server.encode(name, args)); },
        emitHandshake() { clientSocket._deliver(server.handshakeFrame()); }
    };
}

const outDir = path.join(os.tmpdir(), "moomoojs-int-" + Date.now());
const build = await createProtocolBuild({ outDir, pinFile: null });
const mod = { mixKey: build.mixKey, BUILD_SALT: build.BUILD_SALT, BUILD_ID: build.BUILD_ID };

console.log("\n== undetectable proxy install ==");
await ok("window.WebSocket === pr and prototype.send still reports [native code]", () => {
    const env = makeFakeEnv(build);
    const nativeOriginal = env.win.WebSocket;

    // The loader installs at document-start, BEFORE the client runs.
    LoaderCore.createLoader(env.win, { resolveProtocol: () => Promise.resolve(mod) });

    // Now the client runs and captures its references `pr` and `dl`.
    const pr = env.win.WebSocket;
    const dl = env.win.WebSocket.prototype.send;

    // 1) The constructor really is hooked (a Proxy), not the bare native one.
    assert.notStrictEqual(pr, nativeOriginal, "WebSocket should be wrapped");
    // 2) Reference check the anti-tamper performs later:  window.WebSocket === pr
    //    The loader never re-assigns, so this holds forever.
    assert.strictEqual(env.win.WebSocket, pr, "window.WebSocket !== pr would set SOCKET_HOOKED");
    // 3) prototype.send IS now replaced (so the loader sees dl.call(socket, frame)),
    //    but it is a Proxy of the native send, so the SOCKET_HOOKED check
    //    Function.prototype.toString.call(WebSocket.prototype.send).includes("[native code]")
    //    still passes.
    assert.ok(Function.prototype.toString.call(dl).includes("[native code]"),
        "prototype.send must still look native to toString");
    assert.strictEqual(env.win.WebSocket.prototype, nativeOriginal.prototype, "prototype must forward to native");
    // 4) Constructed sockets are genuine instances (native prototype chain).
    const ws = new env.win.WebSocket("wss://localhost/");
    assert.ok(ws instanceof env.win.WebSocket, "instanceof must still work");
});

console.log("\n== server -> client becomes MooMoo events ==");
await ok("health + setup events, self state tracked", async () => {
    const env = makeFakeEnv(build);
    const { MooMoo } = LoaderCore.createLoader(env.win, { resolveProtocol: () => Promise.resolve(mod) });
    const seen = [];
    MooMoo.on("health", (e) => seen.push(e));

    new env.win.WebSocket("wss://localhost/?token=tk:x&b=" + build.BUILD_ID);
    env.emitHandshake();
    await tick(); await tick(); // let the async key derivation settle

    assert.ok(MooMoo.isReady(), "loader should be ready after io-init");
    env.emit("C", [7]);         // setup: your sid is 7
    env.emit("O", [7, 92]);     // health: sid 7 -> 92
    env.emit("O", [3, 40]);     // another player's health
    env.emit("O", [7, 71]);     // your health again

    assert.strictEqual(MooMoo.self.sid, 7, "self.sid");
    assert.strictEqual(MooMoo.self.health, 71, "self.health tracks the latest for your sid");
    assert.deepStrictEqual(seen.map((e) => [e.sid, e.value]), [[7, 92], [3, 40], [7, 71]], "health events in order");
});

console.log("\n== client -> server re-encode is accepted ==");
await ok("intercepted client frames reach the server with valid sequence", async () => {
    const env = makeFakeEnv(build);
    LoaderCore.createLoader(env.win, { resolveProtocol: () => Promise.resolve(mod) });
    new env.win.WebSocket("wss://localhost/");
    env.emitHandshake();
    await tick(); await tick();

    // Simulate the official client producing frames (same keys, its own session,
    // keyed from the SAME handshake the loader adopted).
    const payload = decodeHandshakePayload(env);
    const client = new g.MooMooProtocol.ClientSession(payload, mod);

    env.clientSocket.send(client.encodeC2S("6", ["hello"]));      // chat
    env.clientSocket.send(client.encodeC2S("D", [1.25]));         // aim
    const accepted = env.acceptedByServer;
    assert.ok(accepted.every((d) => !d.error), "server accepted all: " + JSON.stringify(accepted.map(a => a.error)));
    assert.strictEqual(accepted[0].name, "6");
    assert.deepStrictEqual(accepted[0].args, ["hello"]);
    assert.strictEqual(accepted[0].seq, 1, "loader-owned seq starts at 1");
    assert.strictEqual(accepted[1].name, "D");
    assert.strictEqual(accepted[1].seq, 2, "loader-owned seq increments");
});

console.log("\n== client sends via prototype.send.call (the real client's path) ==");
await ok("dl.call(socket, frame) + an injected frame share ONE contiguous sequence", async () => {
    const env = makeFakeEnv(build);
    const { MooMoo } = LoaderCore.createLoader(env.win, { resolveProtocol: () => Promise.resolve(mod) });
    const ws = new env.win.WebSocket("wss://localhost/");
    env.emitHandshake();
    await tick(); await tick();

    const payload = decodeHandshakePayload(env);
    const client = new g.MooMooProtocol.ClientSession(payload, mod);
    // The official client caches dl = WebSocket.prototype.send and calls it as
    // dl.call(socket, frame). A per-socket hook misses this; the prototype hook
    // must catch it and re-sequence.
    const dl = env.win.WebSocket.prototype.send;
    dl.call(ws, client.encodeC2S("6", ["one"]));      // client frame 1
    MooMoo.send.chat("injected");                       // mod injects between client frames
    dl.call(ws, client.encodeC2S("D", [0.5]));         // client frame 2

    const accepted = env.acceptedByServer;
    assert.ok(accepted.every((d) => !d.error), "server rejected a frame: " + JSON.stringify(accepted.map((a) => a.error || a.name)));
    assert.deepStrictEqual(accepted.map((a) => a.seq), [1, 2, 3], "all three frames must carry a contiguous loader-owned seq");
    assert.deepStrictEqual(accepted.map((a) => a.name), ["6", "6", "D"], "order preserved: client, injected, client");
});

console.log("\n== anti-cheat bypass: telemetry scrub ==");
await ok("the client's dirty T packet reaches the server with clean flags", async () => {
    const env = makeFakeEnv(build);
    LoaderCore.createLoader(env.win, { resolveProtocol: () => Promise.resolve(mod) });
    new env.win.WebSocket("wss://localhost/");
    env.emitHandshake();
    await tick(); await tick();

    const payload = decodeHandshakePayload(env);
    const client = new g.MooMooProtocol.ClientSession(payload, mod);
    // The real client would report SOCKET_HOOKED (2) | USERSCRIPT (1) and 25 untrusted events.
    env.clientSocket.send(client.encodeC2S("T", [1 | 2, 25]));

    const t = env.acceptedByServer.find((d) => d.name === "T");
    assert.ok(t && !t.error, "server accepted the T packet");
    assert.deepStrictEqual(t.args, [0, 0], "telemetry flags + untrusted events must be scrubbed to 0");
});

console.log("\n== mod injection ==");
await ok("MooMoo.send.chat injects a packet the server accepts", async () => {
    const env = makeFakeEnv(build);
    const { MooMoo } = LoaderCore.createLoader(env.win, { resolveProtocol: () => Promise.resolve(mod) });
    new env.win.WebSocket("wss://localhost/");
    env.emitHandshake();
    await tick(); await tick();

    MooMoo.send.chat("injected!");
    MooMoo.send.spawn("Bot", true, 3);

    const chat = env.acceptedByServer.find((d) => d.name === "6");
    const spawn = env.acceptedByServer.find((d) => d.name === "M");
    assert.ok(chat && !chat.error, "chat injected");
    assert.deepStrictEqual(chat.args, ["injected!"]);
    assert.ok(spawn && !spawn.error, "spawn injected");
    assert.deepStrictEqual(spawn.args, [{ name: "Bot", moofoll: 1, skin: 3 }]);
});

function decodeHandshakePayload(env) {
    // Re-create a handshake payload matching the session the loader adopted.
    // We can read it straight off the server's current session.
    const s = env.server;
    const keyHex = Buffer.from(s.rawKey).toString("hex");
    return [s.socketId, s.seed, keyHex, 1, s.pinned ? 1 : 0];
}

console.log("\n----------------------------------------");
await Promise.resolve();
console.log((fail === 0 ? "ALL PASS" : "FAILURES") + ":  " + pass + " passed, " + fail + " failed");
process.exit(fail === 0 ? 0 : 1);
