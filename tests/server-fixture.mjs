/*
 * Locates the moomoo-clone SERVER so the codec tests can check against ground
 * truth. The server lives in its own repo; moomoo.js is standalone, so we find
 * it by:
 *   1. $MOOMOO_SERVER_DIR
 *   2. ../moomoo-clone-main      (sibling layout, the usual case)
 *   3. ..                        (moomoo.js living inside the server repo)
 * If none is found the ground-truth tests SKIP (exit 0) instead of failing, so
 * `npm test` is still green on a machine without the server checked out.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const candidates = [
    process.env.MOOMOO_SERVER_DIR,
    path.resolve(root, "..", "moomoo-clone-main"),
    path.resolve(root, "..")
].filter(Boolean);

let serverDir = null;
for (const c of candidates) {
    if (fs.existsSync(path.join(c, "server", "src", "protocol", "session.js"))) { serverDir = c; break; }
}

export const available = Boolean(serverDir);
export const SERVER_DIR = serverDir;

export function skipIfUnavailable(label) {
    if (!available) {
        console.log("SKIP " + (label || "") + ": moomoo-clone server not found. Set MOOMOO_SERVER_DIR to run ground-truth tests.");
        process.exit(0);
    }
}

export async function loadServer() {
    if (!serverDir) return null;
    const session = await import(pathToFileURL(path.join(serverDir, "server/src/protocol/session.js")).href);
    const build = await import(pathToFileURL(path.join(serverDir, "server/src/protocol/build.js")).href);
    return { ProtocolSession: session.ProtocolSession, createProtocolBuild: build.createProtocolBuild, serverDir };
}

// msgpack-lite is only used for an extra cross-check; it may not resolve from a
// standalone checkout. Returns the module or null.
export async function tryLoadMsgpackLite() {
    try { return (await import("msgpack-lite")).default; }
    catch { try { const m = await import(pathToFileURL(path.join(serverDir || root, "node_modules", "msgpack-lite", "index.js")).href); return m.default || m; } catch { return null; } }
}
