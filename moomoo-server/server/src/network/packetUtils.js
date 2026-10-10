import { decode } from "msgpack-lite";

const DEFAULT_PACKET_LIMIT = 2048;
const parsedLimit = Number.parseInt(process.env.MAX_PACKET_BYTES ?? "", 10);
export const MAX_PACKET_BYTES = Number.isFinite(parsedLimit) ? parsedLimit : DEFAULT_PACKET_LIMIT;
export const MAX_PAYLOAD_ITEMS = 16;

const BUFFER_SHORTAGE_NAMES = new Set(["BUFFER_SHORTAGE", "BufferShortage"]);

export class InvalidPacketError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidPacketError";
    }
}

function isSupportedBinaryFrame(raw) {
    return raw instanceof Uint8Array || raw instanceof ArrayBuffer || ArrayBuffer.isView(raw);
}

function toUint8Array(raw) {
    if (raw instanceof Uint8Array) {
        return new Uint8Array(raw.buffer, raw.byteOffset, raw.byteLength);
    }
    if (ArrayBuffer.isView(raw)) {
        const view = raw;
        return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
    }
    if (raw instanceof ArrayBuffer) {
        return new Uint8Array(raw);
    }
    throw new InvalidPacketError("unsupported binary frame");
}

function ensureSize(view) {
    if (view.byteLength === 0) {
        throw new InvalidPacketError("empty packet");
    }
    if (view.byteLength > MAX_PACKET_BYTES) {
        throw new InvalidPacketError("packet exceeds maximum size");
    }
}

function decodeBinary(view) {
    try {
        return decode(view);
    } catch (error) {
        if (isBufferShortageError(error)) {
            throw new InvalidPacketError("incomplete msgpack payload");
        }
        throw error;
    }
}

function isBufferShortageError(error) {
    if (!error) return false;
    if (error.name && BUFFER_SHORTAGE_NAMES.has(error.name)) {
        return true;
    }
    if (typeof error.message === "string" && BUFFER_SHORTAGE_NAMES.has(error.message)) {
        return true;
    }
    return false;
}

function normalizePacketType(rawType) {
    let normalized = "";
    if (typeof rawType === "string") {
        normalized = rawType;
    } else if (typeof rawType === "number" || typeof rawType === "bigint") {
        normalized = rawType.toString();
    }
    if (!normalized || normalized.length === 0 || normalized.length > 3) {
        throw new InvalidPacketError("invalid packet identifier");
    }
    return normalized;
}

export function parseClientPacket(raw) {
    if (typeof raw === "string") {
        throw new InvalidPacketError("text frames are not supported");
    }

    if (!isSupportedBinaryFrame(raw)) {
        throw new InvalidPacketError("unsupported payload format");
    }

    const view = toUint8Array(raw);
    ensureSize(view);

    const decoded = decodeBinary(view);

    if (!Array.isArray(decoded) || decoded.length < 2) {
        throw new InvalidPacketError("malformed packet structure");
    }

    const type = normalizePacketType(decoded[0]);
    const payload = decoded[1];

    if (!Array.isArray(payload)) {
        throw new InvalidPacketError("packet payload is not an array");
    }

    if (payload.length > MAX_PAYLOAD_ITEMS) {
        throw new InvalidPacketError("packet payload is too long");
    }

    return {
        type,
        payload
    };
}
