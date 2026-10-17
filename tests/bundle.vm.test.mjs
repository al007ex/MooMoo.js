/*
 * Proves the ASSEMBLED userscript (dist/moomoo-loader.user.js) works, not just
 * the src modules. Runs the bundle inside a node:vm sandbox whose global is a
 * fake page window, then drives a loopback connection to a real server session.
 *
 * Run:  node extension/loader/build.mjs && node extension/tests/bundle.vm.test.mjs
 */
import vm from "node:vm";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import assert from "node:assert";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { loadServer, skipIfUnavailable } from "./server-fixture.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const bundlePath = path.join(here, "..", "loader", "dist", "moomoo-loader.user.js");
const bundle = fs.readFileSync(bundlePath, "utf8");

skipIfUnavailable("bundle.vm");
const { ProtocolSession, createProtocolBuild } = await loadServer();

const build = await createProtocolBuild({ outDir: path.join(os.tmpdir(), "moomoojs-vm-" + Date.now()), pinFile: null });
const mod = { mixKey: build.mixKey, BUILD_SALT: build.BUILD_SALT, BUILD_ID: build.BUILD_ID };

const server = new ProtocolSession(build, crypto.randomBytes(8).toString("hex"));
const accepted = [];
let clientSocket = null;

class FakeWebSocket {
    constructor(url) { this.url = url; this.readyState = 1; this._m = new Set(); clientSocket = this; }
    addEventListener(t, f) { if (t === "message") this._m.add(f); }
    removeEventListener(t, f) { if (t === "message") this._m.delete(f); }
    send(bytes) {
        const buf = Buffer.from(bytes.buffer || bytes, bytes.byteOffset || 0, bytes.byteLength || bytes.length);
        accepted.push(server.decode(buf));
    }
    _deliver(frame) {
        const ev = { data: frame.buffer.slice(frame.byteOffset, frame.byteOffset + frame.byteLength) };
        for (const f of this._m) f(ev);
    }
}
FakeWebSocket.OPEN = 1;

// Build the fake page window and use it AS the sandbox global.
const listeners = new Map();
const win = {
    WebSocket: FakeWebSocket,
    document: { baseURI: "https://localhost/", querySelectorAll: () => [], createElement: () => ({ remove() {} }), documentElement: {}, head: { appendChild() {} } },
    Event: class { constructor(t) { this.type = t; } },
    addEventListener: (t, f) => { (listeners.get(t) || listeners.set(t, new Set()).get(t)).add(f); },
    dispatchEvent: (ev) => { const s = listeners.get(ev.type); if (s) for (const f of s) f(ev); return true; },
    console, setTimeout, clearTimeout, Promise, URL, TextEncoder, TextDecoder,
    // our test resolver hook
    __moomooResolveProtocol: () => Promise.resolve(mod)
};
win.window = win; win.self = win; win.globalThis = win;

vm.createContext(win);
vm.runInContext(bundle, win, { filename: "moomoo-loader.user.js" });

const tick = () => new Promise((r) => setTimeout(r, 0));
let pass = 0, fail = 0;
const ok = (name, fn) => Promise.resolve().then(fn).then(() => { pass++; console.log("  ✓ " + name); },
    (e) => { fail++; console.log("  ✗ " + name + "\n      " + (e && (e.stack || e.message))); });

// The loader leaves NO window global; fetch its API through the event handshake, the
// same way a mod does.
let MooMoo = null, MooMooLoader = null;
win.dispatchEvent({ type: "moomoo.js:api", detail: { resolve: (m, l) => { MooMoo = m; MooMooLoader = l; } } });

console.log("\n== assembled bundle in a sandbox ==");
await ok("the loader hands out its API via the handshake and leaves nothing on window", () => {
    assert.ok(MooMoo, "handshake should return MooMoo");
    assert.ok(MooMooLoader, "handshake should return MooMooLoader");
    const LOADER_VERSION = /const VERSION = "([^"]+)"/.exec(fs.readFileSync(path.join(here, "..", "loader", "src", "loader.js"), "utf8"))[1];
    assert.strictEqual(MooMooLoader.version, LOADER_VERSION);
    // the loader must leave no MooMoo* name on the global at all
    for (const n of ["MooMoo", "MooMooLoader", "MooMooProtocol", "__MOOMOO_LOADER__"]) {
        assert.ok(!(n in win), "no window." + n);
    }
});

await ok("end-to-end: health event + telemetry scrub + injection", async () => {
    const health = [];
    MooMoo.on("health", (e) => health.push(e));
    // exercise the opt-in fallback canceller (default is honest passthrough)
    MooMooLoader.antiDetect.setEnabled(true);

    new win.WebSocket("wss://localhost/?b=" + build.BUILD_ID);
    clientSocket._deliver(server.handshakeFrame());
    await tick(); await tick(); await tick();
    if (!MooMoo.isReady()) {
        console.log("    diag:", JSON.stringify(MooMooLoader.diag), "listeners:", clientSocket._m.size);
    }
    assert.ok(MooMoo.isReady(), "ready after io-init");

    clientSocket._deliver(server.encode("C", [9]));
    clientSocket._deliver(server.encode("O", [9, 55]));
    assert.strictEqual(MooMoo.self.sid, 9);
    assert.strictEqual(MooMoo.self.health, 55);
    assert.deepStrictEqual(health.map((e) => [e.sid, e.value]), [[9, 55]]);

    // telemetry scrub (simulate the client sending dirty flags). Seal mode 0 here, so the
    // last two fields (seal, salt) stay 0; the three self-reporting fields must be zeroed.
    const payload = [server.socketId, server.seed, Buffer.from(server.rawKey).toString("hex"), 1, server.pinned ? 1 : 0, server.sealMode | 0];
    // The loader keeps its modules off window now; they're reachable for tests under
    // MooMooLoader._deps.
    const Protocol = MooMooLoader._deps.Protocol;
    const client = new Protocol.ClientSession(payload, mod);
    clientSocket.send(client.encodeC2S("T", [2, 30, 4, 0, 0]));
    const t = accepted.find((d) => d.name === "T");
    assert.deepStrictEqual(t.args.slice(0, 3), [0, 0, 0], "telemetry scrubbed");

    // injection
    MooMoo.send.chat("from the bundle");
    const chat = accepted.find((d) => d.name === "6");
    assert.ok(chat && !chat.error);
    assert.deepStrictEqual(chat.args, ["from the bundle"]);
});

console.log("\n----------------------------------------");
console.log((fail === 0 ? "ALL PASS" : "FAILURES") + ":  " + pass + " passed, " + fail + " failed");
process.exit(fail === 0 ? 0 : 1);
