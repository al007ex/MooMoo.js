/*
 * LIVE TEST SERVER — boots the real moomoo-clone server from an ISOLATED copy.
 * ===========================================================================
 * Why a copy: the server deletes every module in dist/protocol when it starts
 * and writes accounts/bans into server/data. Running a second instance against
 * your real checkout would wipe the protocol module your own server is serving
 * and pollute your data. So each run copies server/src + server/data into a temp
 * dir and symlinks the read-only bits (official client, public assets, shared
 * config, node_modules). Your real files are never touched.
 *
 * Exposes helpers the live tests use: start/stop, a log tap (every anti-cheat
 * close/kick/strike line is printed by the server), test-account login, join
 * tickets, and the per-deploy protocol module (fetched exactly like the client).
 */
import fs from "node:fs";
import os from "node:os";
import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { SERVER_DIR, available } from "../server-fixture.mjs";

export { available, SERVER_DIR };

// The `ws` client package comes from the server checkout (moomoo.js has no deps).
export function loadWs() {
    const req = createRequire(path.join(SERVER_DIR, "server", "package.json"));
    return req("ws");
}

function freePort() {
    return new Promise((resolve, reject) => {
        const s = net.createServer();
        s.unref();
        s.on("error", reject);
        s.listen(0, "127.0.0.1", () => { const { port } = s.address(); s.close(() => resolve(port)); });
    });
}

function makeIsolatedCopy() {
    const tmpRoot = process.env.MOOMOO_TEST_TMP || os.tmpdir();
    const dir = fs.mkdtempSync(path.join(tmpRoot, "moomoo-live-"));
    const src = (...p) => path.join(SERVER_DIR, ...p);
    const dst = (...p) => path.join(dir, ...p);
    fs.cpSync(src("server", "src"), dst("server", "src"), { recursive: true });
    fs.copyFileSync(src("server", "package.json"), dst("server", "package.json"));
    fs.cpSync(src("server", "data"), dst("server", "data"), { recursive: true });
    fs.rmSync(dst("server", "data", "protocol-build.json"), { force: true }); // fresh build for the copy
    fs.mkdirSync(dst("dist"), { recursive: true });
    fs.mkdirSync(dst("client"), { recursive: true });
    fs.symlinkSync(src("dist", "official"), dst("dist", "official"), "dir");
    fs.symlinkSync(src("client", "public"), dst("client", "public"), "dir");
    fs.symlinkSync(src("shared"), dst("shared"), "dir");
    fs.symlinkSync(src("node_modules"), dst("node_modules"), "dir");
    if (fs.existsSync(src("server", "node_modules"))) fs.symlinkSync(src("server", "node_modules"), dst("server", "node_modules"), "dir");
    return dir;
}

// Start an isolated server. opts.env adds env vars (e.g. OWNER_EMAIL, DEBUG_PACKETS).
export async function startServer(opts = {}) {
    const port = await freePort();
    const dir = makeIsolatedCopy();
    const lines = [];
    const taps = new Set();
    const child = spawn(process.execPath, [path.join(dir, "server", "src", "index.js")], {
        cwd: path.join(dir, "server"),
        env: { ...process.env, PORT: String(port), HOST: "127.0.0.1", ...(opts.env || {}) },
        stdio: ["ignore", "pipe", "pipe"]
    });
    const onData = (chunk) => {
        for (const line of String(chunk).split(/\r?\n/)) {
            if (!line.trim()) continue;
            lines.push(line);
            for (const t of taps) { try { t(line); } catch (_) {} }
            if (opts.echo) console.log("    [server] " + line);
        }
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);

    const base = `http://127.0.0.1:${port}`;
    // wait until the HTTP API answers
    const t0 = Date.now();
    for (;;) {
        if (child.exitCode != null) throw new Error("server exited during startup:\n" + lines.join("\n"));
        try { const r = await fetch(base + "/api/servers"); if (r.ok) break; } catch (_) {}
        if (Date.now() - t0 > 20000) throw new Error("server did not start in 20s:\n" + lines.join("\n"));
        await new Promise((r) => setTimeout(r, 150));
    }

    async function stop() {
        if (child.exitCode == null) {
            child.kill("SIGTERM");
            await new Promise((r) => { const to = setTimeout(() => { try { child.kill("SIGKILL"); } catch (_) {} r(); }, 3000); child.once("exit", () => { clearTimeout(to); r(); }); });
        }
        try { fs.rmSync(dir, { recursive: true, force: true }); } catch (_) {}
    }

    return {
        port, base, dir, lines, child, stop,
        origin: base,
        host: `127.0.0.1:${port}`,
        onLine: (fn) => { taps.add(fn); return () => taps.delete(fn); },
        // every anti-cheat action / disconnect the server logged
        incidents: () => lines.filter((l) => /\b(close|kick|shame|flag) \(|rejected|too many strikes|leave sid/.test(l))
    };
}

// ---- API helpers (the same calls the official client makes) ----
export async function loginFull(srv, email, password) {
    const r = await fetch(srv.base + "/api/auth/password", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password })
    });
    if (!r.ok) throw new Error("login failed: " + r.status + " " + await r.text());
    return r.json();   // { token, email, id }
}
export async function login(srv, email, password) { return (await loginFull(srv, email, password)).token; }

// Puppeteer comes from the server checkout's devDependencies. Prefers an installed
// Chrome (fresh temp profile) so nothing has to be downloaded.
export function loadPuppeteer() {
    const req = createRequire(path.join(SERVER_DIR, "package.json"));
    return req("puppeteer");
}
// Chrome flags for the live tests. Root (CI / containers) can't use Chrome's sandbox.
export function chromeArgs() {
    const args = ["--no-first-run", "--mute-audio"];
    if (typeof process.getuid === "function" && process.getuid() === 0) args.push("--no-sandbox");
    return args;
}
export function chromePath() {
    const candidates = [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"];
    for (const c of candidates) if (c && fs.existsSync(c)) return c;
    return undefined;
}

export async function joinTicket(srv, authToken, serverKey = "LC") {
    const r = await fetch(srv.base + "/api/join", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ auth: authToken, host: `${srv.host}/s/${serverKey}`, did: "live-test-" + Math.random().toString(36).slice(2) })
    });
    if (!r.ok) throw new Error("join failed: " + r.status + " " + await r.text());
    return (await r.json()).ticket;
}

// Resolve the per-deploy "moomoo-protocol" module the way the client does:
// read the page's import map, fetch that module, import it.
export async function loadProtocolModule(srv) {
    const html = await (await fetch(srv.base + "/")).text();
    const m = /<script type="importmap">([\s\S]*?)<\/script>/.exec(html);
    if (!m) throw new Error("no import map on the page");
    const spec = JSON.parse(m[1]).imports["moomoo-protocol"];
    const url = new URL(spec, srv.base + "/").href;
    const code = await (await fetch(url)).text();
    return import("data:text/javascript;base64," + Buffer.from(code).toString("base64"));
}

export function gameUrl(srv, ticket, buildId, serverKey = "LC") {
    return `ws://${srv.host}/s/${serverKey}?token=tk:${ticket}&b=${buildId}`;
}
