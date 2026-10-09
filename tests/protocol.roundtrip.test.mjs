/*
 * Round-trip test: the loader's client-side codec  <->  the real server codec.
 *
 * This is a correctness test of the NETWORKING layer only. It proves that frames
 * the server encodes decode to the right packet on the loader side, and that
 * frames the loader encodes are accepted and correctly decoded by the server.
 * Run with:  node extension/tests/protocol.roundtrip.test.mjs
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import assert from "node:assert";
import { loadServer, skipIfUnavailable, tryLoadMsgpackLite } from "./server-fixture.mjs";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));

// Loader side (the code under test).
const Msgpack = require(path.join(here, "..", "loader", "src", "msgpack.js"));
const Sha = require(path.join(here, "..", "loader", "src", "sha256.js"));
const Protocol = require(path.join(here, "..", "loader", "src", "protocol.js"));

// Server side (ground truth).
skipIfUnavailable("protocol.roundtrip");
const { ProtocolSession, createProtocolBuild } = await loadServer();
const msgpackLite = await tryLoadMsgpackLite();
const crypto = await import("node:crypto");

let pass = 0, fail = 0;
const ok = (name, fn) => {
    try { fn(); pass++; console.log("  ✓ " + name); }
    catch (e) { fail++; console.log("  ✗ " + name + "\n      " + (e && e.message)); }
};
const eq = (a, b, m) => assert.deepStrictEqual(a, b, m);
const near = (a, b, m) => assert.ok(Math.abs(a - b) < 1e-9, (m || "") + " expected ~" + b + " got " + a);

console.log("\n== msgpack vs msgpack-lite ==" + (msgpackLite ? "" : "  (SKIPPED: msgpack-lite not resolvable)"));
const samples = [
    0, 1, 127, 128, 255, 256, 65535, 65536, 2147483647, 4294967295, 5000000000,
    -1, -32, -33, -128, -129, -32768, -32769, -2147483648,
    1.5, -0.001, 3.14159265358979, 100.25,
    true, false, null,
    "", "hi", "a".repeat(40), "a".repeat(300), "üñîçødé ★",
    [], [1, 2, 3], [1, "two", 3.5, [4, 5], { k: "v" }],
    { name: "Bob", moofoll: true, skin: 7 },
    [5, 87], [6, 1, "hello world"],
    // playersUpdate-shaped payload: positions, attrs, hidden
    [[1, 100, 200, 314, 2, 50, -300, 157], [1, -1, 9, 0, 0, 1, 0, 0, 0, 0], [3, 4]]
];
for (const v of samples) {
    // Always verify my own codec round-trips (no external dep).
    ok("mine<->mine " + JSON.stringify(v).slice(0, 40), () => {
        eq(Msgpack.decode(Msgpack.encode(v)), v);
    });
    if (msgpackLite) {
        ok("mine->lite  " + JSON.stringify(v).slice(0, 40), () => {
            eq(msgpackLite.decode(Buffer.from(Msgpack.encode(v))), v);
        });
        ok("lite->mine  " + JSON.stringify(v).slice(0, 40), () => {
            eq(Msgpack.decode(new Uint8Array(msgpackLite.encode(v))), v);
        });
    }
}

console.log("\n== HMAC-SHA256 vs node:crypto ==");
ok("hmac matches node", () => {
    const key = new Uint8Array(crypto.randomBytes(16));
    const data = new Uint8Array(crypto.randomBytes(200));
    const mine = Sha.hmacSha256(key, data);
    const node = crypto.createHmac("sha256", Buffer.from(key)).update(Buffer.from(data)).digest();
    eq(Buffer.from(mine).toString("hex"), node.toString("hex"));
});
ok("sha256 matches node", () => {
    const data = new Uint8Array(crypto.randomBytes(130));
    const mine = Sha.sha256(data);
    const node = crypto.createHash("sha256").update(Buffer.from(data)).digest();
    eq(Buffer.from(mine).toString("hex"), node.toString("hex"));
});

// Build a real per-deploy protocol module and a matching pair of sessions.
const outDir = path.join(os.tmpdir(), "moomoojs-proto-" + Date.now());
const build = await createProtocolBuild({ outDir, pinFile: null });
const mod = { mixKey: build.mixKey, BUILD_SALT: build.BUILD_SALT, BUILD_ID: build.BUILD_ID };

function freshPair() {
    const server = new ProtocolSession(build, crypto.randomBytes(8).toString("hex"));
    const hs = server.handshakeFrame();
    const msg = Protocol.isHandshake(hs);
    assert.ok(msg, "handshake must be recognised");
    const client = new Protocol.ClientSession(msg[1], mod);
    return { server, client };
}

console.log("\n== handshake + s2c (server encodes -> loader decodes) ==");
ok("loader derives same tables/mask as server", () => {
    const { server, client } = freshPair();
    const cases = [
        ["O", [5, 87]],
        ["C", [12]],
        ["6", [3, "gg wp"]],
        ["N", ["points", 1234, 1]],
        ["a", [[1, 100, 200, 314], [1, 0, 9, 0, 0, 1, 0, 0, 0, 0], [7]]],
        ["8", [500, 600, -25, 1]],
        ["O", [5, 100]],
        ["0", []]
    ];
    for (const [name, args] of cases) {
        const frame = server.encode(name, args);
        const dec = client.decodeS2C(frame);
        eq(dec.name, name, "s2c name for " + name);
        eq(dec.args, args, "s2c args for " + name);
    }
});

console.log("\n== c2s (loader encodes -> server decodes) ==");
ok("server accepts loader-encoded frames in sequence", () => {
    const { server, client } = freshPair();
    const cases = [
        ["M", [{ name: "Tester", moofoll: true, skin: 0 }]],
        ["D", [1.2345]],
        ["9", [null]],
        ["6", ["hello"]],
        ["z", [3, 1]],
        ["0", []]
    ];
    let expectSeq = 0;
    for (const [name, args] of cases) {
        expectSeq++;
        const frame = client.encodeC2S(name, args);
        const dec = server.decode(frame);
        assert.ok(!dec.error, "server error: " + dec.error + " " + (dec.detail || ""));
        eq(dec.name, name, "c2s name for " + name);
        eq(dec.seq, expectSeq, "c2s seq for " + name);
        if (name === "D") near(dec.args[0], args[0], "aim dir");
        else eq(dec.args, args, "c2s args for " + name);
    }
});

console.log("\n== c2s inspect (loader reads back its own frame) ==");
ok("decodeC2S round-trips", () => {
    const { client } = freshPair();
    const frame = client.encodeC2S("6", ["inspect me"]);
    const dec = client.decodeC2S(frame);
    eq(dec.name, "6");
    eq(dec.args, ["inspect me"]);
    eq(dec.seq, 1);
});

console.log("\n== anti-cheat bypass: telemetry scrub is accepted by the server ==");
ok("scrubbed T packet decodes with clean flags", () => {
    const { server, client } = freshPair();
    // The client would send tamper flags (e.g. 2 = SOCKET_HOOKED) + some untrusted events.
    const dirty = client.encodeC2S("T", [2 | 1, 25]);
    // Loader reads what the client sent, scrubs it, and re-sends with the SAME seq.
    const read = client.decodeC2S(dirty);
    eq(read.name, "T");
    const scrubbed = client.encodeC2S("T", [0, 0], read.seq); // clear all flags, zero untrusted
    const dec = server.decode(scrubbed);
    assert.ok(!dec.error, "server rejected scrubbed T: " + dec.error);
    eq(dec.name, "T");
    eq(dec.args, [0, 0], "server must see clean telemetry");
    eq(dec.seq, 1);
});

console.log("\n== sequence enforcement sanity (gap -> server rejects) ==");
ok("server rejects a seq gap (proves seq really matters)", () => {
    const { server, client } = freshPair();
    server.decode(client.encodeC2S("0", []));       // seq 1 ok
    const bad = client.encodeC2S("0", [], 5);        // jump to seq 5
    const dec = server.decode(bad);
    assert.ok(dec.error, "expected a sequence error");
});

console.log("\n----------------------------------------");
console.log((fail === 0 ? "ALL PASS" : "FAILURES") + ":  " + pass + " passed, " + fail + " failed");
process.exit(fail === 0 ? 0 : 1);
