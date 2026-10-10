import test from "node:test";
import assert from "node:assert/strict";
import { encode } from "msgpack-lite";
import { InvalidPacketError, MAX_PACKET_BYTES, parseClientPacket } from "./packetUtils.js";

test("parseClientPacket rejects unsupported frame types", () => {
    assert.throws(() => parseClientPacket("not-a-buffer"), InvalidPacketError);
});

test("parseClientPacket enforces packet size limits", () => {
    const oversized = new Uint8Array(MAX_PACKET_BYTES + 1);
    assert.throws(() => parseClientPacket(oversized), InvalidPacketError);
});

test("parseClientPacket handles truncated msgpack payloads", () => {
    const truncated = Uint8Array.from([0x92, 0x01]);
    assert.throws(() => parseClientPacket(truncated), InvalidPacketError);
});

test("parseClientPacket returns normalized type and payload for valid packets", () => {
    const payload = encode(["M", [{ name: "tester" }]]);
    const decoded = parseClientPacket(payload);
    assert.equal(decoded.type, "M");
    assert.deepEqual(decoded.payload, [{ name: "tester" }]);
});
