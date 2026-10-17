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
g.MooMooMsgpack = require(path.join(srcDir, "net", "msgpack.js"));
g.MooMooSha256 = require(path.join(srcDir, "net", "sha256.js"));
g.MooMooProtocol = require(path.join(srcDir, "net", "protocol.js"));
g.MooMooBinding = require(path.join(srcDir, "net", "binding.js"));
g.MooMooRuntime = require(path.join(srcDir, "core", "runtime.js"));
g.MooMooSocket = require(path.join(srcDir, "net", "socket.js"));
g.MooMooOutgoing = require(path.join(srcDir, "net", "outgoing.js"));
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
    const { MooMooLoader } = LoaderCore.createLoader(env.win, { resolveProtocol: () => Promise.resolve(mod) });
    // The loader is genuinely clean by default (honest passthrough); here we exercise the
    // opt-in fallback canceller, which blanks a dirty T outright.
    MooMooLoader.antiDetect.setEnabled(true);
    new env.win.WebSocket("wss://localhost/");
    env.emitHandshake();
    await tick(); await tick();

    const payload = decodeHandshakePayload(env);
    const client = new g.MooMooProtocol.ClientSession(payload, mod);
    // The current server's "T" = [flags, untrusted, probeResult, seal, salt]. The real client
    // would report SOCKET_HOOKED (2) | USERSCRIPT (1), 25 untrusted events and some matched probes;
    // the loader must zero the three self-reporting fields and echo the probe salt untouched.
    env.clientSocket.send(client.encodeC2S("T", [1 | 2, 25, 7, 123456, 424242]));

    const t = env.acceptedByServer.find((d) => d.name === "T");
    assert.ok(t && !t.error, "server accepted the T packet");
    assert.deepStrictEqual(t.args.slice(0, 3), [0, 0, 0], "flags, untrusted events and probe result must be scrubbed to 0");
    assert.strictEqual(t.args[4], 424242, "the probe salt must be echoed back unchanged");
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


console.log("\n== outgoing takeover: mods drop / rewrite the client's own frames ==");
await ok("onOutgoing can drop and rewrite client frames without a sequence gap", async () => {
    const env = makeFakeEnv(build);
    const { MooMoo } = LoaderCore.createLoader(env.win, { resolveProtocol: () => Promise.resolve(mod) });
    const ws = new env.win.WebSocket("wss://localhost/");
    env.emitHandshake();
    await tick(); await tick();
    const client = new g.MooMooProtocol.ClientSession(decodeHandshakePayload(env), mod);
    const dl = env.win.WebSocket.prototype.send;

    const sent = [];
    MooMoo.onSent((action, payload, source) => sent.push([action, source]));
    // drop every client click; rewrite every client aim to 2.5
    const unDrop = MooMoo.onOutgoing("mouse", () => false);
    const unAim = MooMoo.onOutgoing("aim", (p) => ({ dir: 2.5 }));

    dl.call(ws, client.encodeC2S("F", [1, null]));   // dropped
    dl.call(ws, client.encodeC2S("D", [0.1]));       // rewritten
    MooMoo.send.chat("mod");                          // injected
    dl.call(ws, client.encodeC2S("F", [0, null]));   // dropped
    dl.call(ws, client.encodeC2S("6", ["hi"]));      // untouched
    unDrop(); unAim();
    dl.call(ws, client.encodeC2S("F", [1, null]));   // filter removed -> passes

    const acc = env.acceptedByServer;
    assert.ok(acc.every((d) => !d.error), "server rejected: " + JSON.stringify(acc.map((a) => a.error || a.name)));
    assert.deepStrictEqual(acc.map((a) => a.name), ["D", "6", "6", "F"]);
    assert.deepStrictEqual(acc.map((a) => a.seq), [1, 2, 3, 4], "dropped frames must not leave a gap");
    assert.deepStrictEqual(acc[0].args, [2.5], "aim rewritten");
    assert.deepStrictEqual(sent, [["aim", "client"], ["chat", "mod"], ["chat", "client"], ["mouse", "client"]]);
});

await ok("rate governor keeps client + mod frames under the server's buckets", async () => {
    const env = makeFakeEnv(build);
    const { MooMoo, MooMooLoader } = LoaderCore.createLoader(env.win, { resolveProtocol: () => Promise.resolve(mod) });
    const ws = new env.win.WebSocket("wss://localhost/");
    env.emitHandshake();
    await tick(); await tick();
    env.emit("C", [7]);   // setup -> alive with the default loadout (weapons [0]); weapon 0 is owned, so the anti-no-op guard lets the burst through
    const client = new g.MooMooProtocol.ClientSession(decodeHandshakePayload(env), mod);
    const dl = env.win.WebSocket.prototype.send;
    // 60 selectItem in one instant: the server's "z" bucket is [20/s, burst 40].
    let modAccepted = 0;
    for (let i = 0; i < 30; i++) {
        dl.call(ws, client.encodeC2S("z", [0, 1]));
        if (MooMoo.send.selectItem(0, true)) modAccepted++;
    }
    const zs = env.acceptedByServer.filter((a) => a.name === "z");
    assert.ok(zs.length <= 40 - MooMooLoader.net.BURST_RESERVE, "sent " + zs.length + " z in one burst; server burst is 40");
    assert.ok(zs.length >= 30, "the governor should still allow most of the burst (" + zs.length + ")");
    assert.ok(MooMooLoader.net.stats.refused > 0, "some frames refused");
    assert.ok(env.acceptedByServer.every((d) => !d.error), "no transport errors / gaps");
    // telemetry is never refused
    dl.call(ws, client.encodeC2S("T", [3, 0]));
    assert.ok(env.acceptedByServer.some((a) => a.name === "T"), "T always goes out");
});

console.log("\n== anti-no-op guard (private-server stealth) ==");
await ok("refuses packets the server would silently ignore, allows valid ones", async () => {
    const env = makeFakeEnv(build);
    const { MooMoo, MooMooLoader } = LoaderCore.createLoader(env.win, { resolveProtocol: () => Promise.resolve(mod) });
    new env.win.WebSocket("wss://localhost/");
    env.emitHandshake();
    await tick(); await tick();

    const store = MooMooLoader.store;
    const seen = () => env.acceptedByServer.filter((a) => !a.error);
    const countName = (n) => seen().filter((a) => a.name === n).length;

    // --- while DEAD: every gameplay packet is a no-op on the server, so none go out ---
    assert.strictEqual(MooMoo.self.alive, false, "starts not alive");
    assert.strictEqual(MooMoo.send.selectItem(0, true), false, "weapon select while dead is refused");
    assert.strictEqual(MooMoo.send.selectItem(6, false), false, "item select while dead is refused");
    assert.strictEqual(MooMoo.send.mouse(true, 0), false, "mouse while dead is refused");
    assert.strictEqual(MooMoo.send.store(1, 0, false), false, "store while dead is refused");
    assert.strictEqual(countName("z"), 0, "no z reached the server while dead");
    assert.strictEqual(countName("F"), 0, "no F reached the server while dead");
    assert.strictEqual(countName("c"), 0, "no c reached the server while dead");

    // --- now ALIVE with the default loadout: weapons [0], items [0, 3, 6, 10] ---
    env.emit("C", [7]);
    assert.strictEqual(MooMoo.self.alive, true, "setup marks you alive");

    // owned weapon + owned item go through
    assert.strictEqual(MooMoo.send.selectItem(0, true), true, "owned weapon (0) select is sent");
    assert.strictEqual(MooMoo.send.selectItem(6, false), true, "owned item (spikes 6) select is sent");
    // an item you do not own (cookie id 1) is refused even though it is a real item
    assert.strictEqual(MooMoo.send.selectItem(1, false), false, "unowned item select is refused");
    // a weapon you do not hold in its slot is refused
    assert.strictEqual(MooMoo.send.selectItem(3, true), false, "unheld weapon select is refused");
    // mouse while alive is fine
    assert.strictEqual(MooMoo.send.mouse(true, 0), true, "mouse while alive is sent");

    // hats: take-off (equip 0) always valid; an unowned hat is refused; an owned one goes through
    let unowned = -1;
    for (let i = 1; i < 200; i++) if (!store.ownsHat(i)) { unowned = i; break; }
    const owned = store.ownedHats[0];
    assert.strictEqual(MooMoo.send.store(1, 0, false), true, "take off hat (equip 0) is sent");
    if (unowned > 0) assert.strictEqual(MooMoo.send.store(1, unowned, false), false, "equip of an unowned hat is refused");
    if (owned != null) assert.strictEqual(MooMoo.send.store(1, owned, false), true, "equip of an owned hat is sent");

    // nothing the guard let through produced a transport error / sequence gap
    assert.ok(seen().every((d) => !d.error), "no transport errors from the guarded sends");
});

await ok("ping is timed off the client's own 0 -> pong round trip", async () => {
    const env = makeFakeEnv(build);
    const { MooMoo, MooMooLoader } = LoaderCore.createLoader(env.win, { resolveProtocol: () => Promise.resolve(mod) });
    const ws = new env.win.WebSocket("wss://localhost/");
    env.emitHandshake();
    await tick(); await tick();
    const client = new g.MooMooProtocol.ClientSession(decodeHandshakePayload(env), mod);
    let got = null;
    MooMoo.on("pong", (p) => { got = p.ms; });
    env.win.WebSocket.prototype.send.call(ws, client.encodeC2S("0", []));
    await new Promise((r) => setTimeout(r, 30));
    env.emit("0", []);
    assert.ok(typeof got === "number" && got >= 25, "pong carries ms: " + got);
    assert.strictEqual(MooMooLoader.net.ping, got);
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
