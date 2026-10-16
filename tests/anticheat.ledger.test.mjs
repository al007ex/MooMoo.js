/*
 * Ground-truth test: the frame LEDGER in the "T" telemetry packet.
 *
 * The server's AntiCheat (anticheat/index.js) now checks that every "T" reports the
 * sequence number and running c2s ledger as they stood just before that frame — a
 * forged / replayed / re-sequenced stream shows up as a LEDGER_MISMATCH. Because the
 * loader OWNS the c2s stream (it re-sequences the client's frames and injects its own),
 * it must report ITS OWN ledger, not the client's. This test drives the real server
 * ProtocolSession + AntiCheat and proves:
 *
 *   - a "T" scrubbed by binding.telemetry.scrub (with the loader's live seq + ledger)
 *     passes the check untouched, and
 *   - a "T" that reports the wrong ledger is caught (so the check is really active).
 *
 * Run:  node tests/anticheat.ledger.test.mjs
 */
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import os from "node:os";
import assert from "node:assert";
import { loadServer, skipIfUnavailable } from "./server-fixture.mjs";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));

const Protocol = require(path.join(here, "..", "loader", "src", "net", "protocol.js"));
const binding = require(path.join(here, "..", "loader", "src", "net", "binding.js"));

skipIfUnavailable("anticheat.ledger");
const { ProtocolSession, createProtocolBuild, serverDir } = await loadServer();
const { AntiCheat } = await import(pathToFileURL(path.join(serverDir, "server/src/anticheat/index.js")).href);
const crypto = await import("node:crypto");

let pass = 0, fail = 0;
const ok = (name, fn) => {
    try { fn(); pass++; console.log("  ✓ " + name); }
    catch (e) { fail++; console.log("  ✗ " + name + "\n      " + (e && e.message)); }
};

const outDir = path.join(os.tmpdir(), "moomoojs-ledger-" + Date.now());
const build = await createProtocolBuild({ outDir, pinFile: null });
const mod = { mixKey: build.mixKey, BUILD_SALT: build.BUILD_SALT, BUILD_ID: build.BUILD_ID };
const SALT = 424242;

// A server session + a loader session that share keys through the handshake, plus an
// AntiCheat wired to that server session with a probe round already pending.
function makePair() {
    const server = new ProtocolSession(build, crypto.randomBytes(8).toString("hex"));
    const client = new Protocol.ClientSession(Protocol.isHandshake(server.handshakeFrame())[1], mod);
    const logs = [];
    const state = { closed: false, kicked: false };
    const ac = new AntiCheat({
        player: { ip: "1.2.3.4", did: "dev", account: null, flagged: false },
        log: (m) => logs.push(String(m)),
        kick: () => { state.kicked = true; },
        close: () => { state.closed = true; },
        store: null,
        session: server,
        sendProbes: () => {}
    });
    ac.pending = { salt: SALT, rules: [], sentAt: Date.now() };  // a "q" round waiting for its "T"
    return { server, client, ac, logs, state };
}

// Send some ordinary frames so both ends build up a non-trivial ledger, then return the
// scrubbed "T" the loader would answer the probe with.
function play(server, client) {
    const frames = [
        ["M", [{ name: "nuro", moofoll: 1, skin: 0 }]],
        ["9", [2]],
        ["D", [1.5]],
        ["0", []],
        ["F", [1, 0.25]]
    ];
    for (const [wire, args] of frames) {
        const dec = server.decode(client.encodeC2S(wire, args));
        assert.ok(!dec.error, "server rejected " + wire + ": " + dec.error);
    }
}

console.log("\n== scrub shape ==");
ok("telemetry.scrub emits 7 fields when given seq + ledger, 5 without", () => {
    const seven = binding.telemetry.scrub([1, 2, 3, 4, 5, 6, 7], { sealReport: 0, probeSalt: 5, seq: 11, ledger: 0xdeadbeef });
    assert.deepStrictEqual(seven, [0, 0, 0, 0, 5, 11, 0xdeadbeef]);
    const five = binding.telemetry.scrub([1, 2, 3, 4, 5], { sealReport: 0, probeSalt: 5 });
    assert.deepStrictEqual(five, [0, 0, 0, 0, 5]);
});

console.log("\n== the loader's scrubbed T passes the server's ledger check ==");
ok("no LEDGER_MISMATCH, no flag, no kick", () => {
    const { server, client, ac, logs, state } = makePair();
    play(server, client);
    // Exactly what loader.js does: read the loader session's live seq + ledger into the scrub.
    const ctx = { sealReport: client.sealReport, probeSalt: SALT, seq: client.lastSeq, ledger: client.ledger };
    const tArgs = binding.telemetry.scrub([3 /*dirty flags*/, 9 /*untrusted*/, 7 /*probe*/, 0, SALT, 999, 123], ctx);
    const dec = server.decode(client.encodeC2S("T", tArgs));
    assert.ok(!dec.error && dec.name === "T", "server did not accept the T frame: " + dec.error);
    ac.onTelemetry(dec.args);
    assert.ok(!logs.some((l) => /LEDGER_MISMATCH/.test(l)), "ledger was flagged: " + logs.join(" | "));
    assert.ok(!logs.some((l) => /SOCKET_HOOKED|SEAL_MISMATCH/.test(l)), "a scrubbed flag leaked: " + logs.join(" | "));
    assert.ok(!state.closed && !state.kicked, "connection was dropped");
    assert.ok(!ac.player.flagged, "player was flagged");
});

console.log("\n== a wrong ledger IS caught (the check is real) ==");
ok("reporting the client's un-owned ledger raises LEDGER_MISMATCH", () => {
    const { server, client, ac, logs } = makePair();
    play(server, client);
    // Correct seq, but a ledger that doesn't match the stream the server received.
    const tArgs = [0, 0, 0, 0, SALT, client.lastSeq, (client.ledger ^ 0x9e3779b9) >>> 0];
    const dec = server.decode(client.encodeC2S("T", tArgs));
    assert.ok(!dec.error, "server did not accept the T frame: " + dec.error);
    ac.onTelemetry(dec.args);
    assert.ok(logs.some((l) => /LEDGER_MISMATCH/.test(l)), "a wrong ledger should have been flagged: " + logs.join(" | "));
});

console.log("\n----------------------------------------");
console.log("LEDGER:  " + pass + " passed, " + fail + " failed");
process.exit(fail === 0 ? 0 : 1);
