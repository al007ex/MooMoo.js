// SERVER ENTRY
// One HTTP server that plays the role of every moomoo.io host the official client talks to:
//   /                    the game page (official client, import map -> current protocol build)
//   /assets/*            official bundle (patched) + shim
//   /p/<id>.js           "moomoo-protocol" module for this build (BUILD_ID, BUILD_SALT, mixKey)
//   /api/*               api.moomoo.io + FRVR auth stand-in (accounts, profiles, clans, top, join tickets)
//   /api/social/*        crucible.frvr.com/v1/social stand-in (friends) + /api/social/ws (presence, invites)
//   /player/<name>       "Copy link" pages -> /?profile=<name>, /clan/<name> -> /?clan=<name>
//   /s/<key>             game servers (WebSocket) and /s/<key>/ping
//   /img, /css, ...      static game assets

import express from "express";
import path from "node:path";
import fs from "node:fs";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { fileURLToPath } from "node:url";
import { config } from "./moomoo/config.js";
import { Game } from "./moomoo/server.js";
import { createProtocolBuild } from "./protocol/build.js";
import { AccountStore } from "./api/store.js";
import { createApiRouter } from "./api/routes.js";
import { SocialHub } from "./api/social.js";
import { ModerationStore } from "./anticheat/index.js";
import { createConnectionHandler } from "./network/connection.js";
import { AdminConsole } from "./admin/console.js";
import { randomBytes, timingSafeEqual } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const OFFICIAL_DIR = path.join(ROOT, "dist/official");
const PUBLIC_DIR = path.join(ROOT, "client/public");
const DATA_DIR = path.join(ROOT, "server/data");
const PORT = Number(process.env.PORT ?? 8080);
const HOST = process.env.HOST ?? "127.0.0.1";

// Game servers shown in the client's server picker (region "local" = this host).
const GAME_SERVERS = [
    { key: "LC", capacity: config.maxPlayers, membersOnly: false },
    { key: "MB", capacity: 80, membersOnly: true }
];
const REGION = { id: "local", name: "Local" };

const log = (msg) => console.log(`${new Date().toISOString().slice(11, 19)} ${msg}`);

// The protocol build (BUILD_ID / BUILD_SALT / mixKey) is kept across restarts so open
// pages reconnect by themselves. ROTATE_BUILD=1 rolls a new one, like a moomoo.io deploy
// (open pages then show "Game updated - please reload").
const pinFile = process.env.PROTOCOL_BUILD_FILE || path.join(DATA_DIR, "protocol-build.json");
if (process.env.ROTATE_BUILD && fs.existsSync(pinFile)) fs.rmSync(pinFile);
const build = await createProtocolBuild({
    outDir: path.join(ROOT, "dist/protocol"),
    pinFile
});
const accounts = new AccountStore(DATA_DIR);
const moderation = new ModerationStore(DATA_DIR);
moderation.migrateIds(accounts.migratedIds);
if (Object.keys(accounts.migratedIds).length) log(`accounts: moved ${Object.keys(accounts.migratedIds).length} account id(s) to the FRVR id format`);
const social = new SocialHub({ store: accounts, log });

// Owner convenience: OWNER_EMAIL=<email> makes that account an admin.
if (process.env.OWNER_EMAIL) {
    const owner = accounts.accountForEmail(process.env.OWNER_EMAIL);
    owner.role = "admin";
    accounts.save();
}

const games = new Map();
for (const def of GAME_SERVERS) {
    games.set(def.key, new Game({ key: def.key, name: def.key, capacity: def.capacity, membersOnly: def.membersOnly, accounts, log }));
}

const gameApi = {
    kickAccount: (id, reason) => [...games.values()].reduce((n, g) => n + g.kickAccount(id, reason), 0),
    setShadow: (id, on) => games.forEach(g => g.setShadow(id, on)),
    sessionFor: (id) => {
        for (const g of games.values()) {
            const s = g.sessionFor(id);
            if (s) return s;
        }
        return null;
    },
    playerBySession: (id) => {
        for (const g of games.values()) {
            const p = g.playerBySession(id);
            if (p) return p;
        }
        return null;
    },
    sessionOf: (player) => {
        for (const g of games.values()) {
            if (g.players.includes(player)) return g.sessionOf(player);
        }
        return null;
    }
};

const servers = {
    list: () => [...games.values()].map(g => ({
        region: REGION.id,
        regionName: REGION.name,
        name: g.key,
        key: g.key,
        playerCount: g.playerCount(),
        playerCapacity: g.capacity,
        auth: g.membersOnly
    }))
};

// Admin console (tools/console.mjs). Local requests with the token from server/data/admin.token only.
const tokenFile = path.join(DATA_DIR, "admin.token");
if (!fs.existsSync(tokenFile)) fs.writeFileSync(tokenFile, randomBytes(24).toString("hex"));
const ADMIN_TOKEN = Buffer.from(fs.readFileSync(tokenFile, "utf8").trim());
const adminConsole = new AdminConsole({ games, accounts, moderation, build, dataDir: DATA_DIR, log, social, baseUrl: `http://${["0.0.0.0", "127.0.0.1", "::1", "::"].includes(HOST) ? "localhost" : HOST}:${PORT}` });

// ---------------------------------------------------------------- http
const app = express();
app.disable("x-powered-by");

app.post("/admin/console", express.json({ limit: "8kb" }), (req, res) => {
    // Tunnels (ngrok, cloudflared) and reverse proxies connect from localhost too, so also
    // refuse anything that arrived through one.
    const proxied = ["x-forwarded-for", "x-forwarded-host", "x-forwarded-proto", "forwarded", "x-real-ip", "ngrok-trace-id"].some(h => req.get(h));
    const local = !proxied && ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(req.socket.remoteAddress);
    const given = Buffer.from(String(req.get("x-admin-token") || ""));
    if (!local || given.length !== ADMIN_TOKEN.length || !timingSafeEqual(given, ADMIN_TOKEN)) {
        return res.status(403).json({ error: "forbidden" });
    }
    res.json({ lines: adminConsole.execute(String((req.body && req.body.command) || "")) });
});

const indexFile = path.join(OFFICIAL_DIR, "index.html");
const sendIndex = (_req, res) => {
    if (!fs.existsSync(indexFile)) {
        res.status(503).type("text").send("Official client not built. Run: npm run build");
        return;
    }
    const html = fs.readFileSync(indexFile, "utf8").replace("__PROTOCOL_MODULE__", build.publicPath);
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.type("html").send(html);
};
app.get(["/", "/index.html"], sendIndex);

app.get(build.publicPath, (_req, res) => {
    res.set("Cache-Control", "no-cache, no-store, must-revalidate");
    res.type("application/javascript").send(build.source);
});

// IS_SANDBOX=1: the official client reads its sandbox flag from its own build ({}.IS_SANDBOX),
// so the bundle is served with that flag switched on. Its build limits and free placing then
// agree with the server's.
if (process.env.IS_SANDBOX) {
    const assetsDir = path.join(OFFICIAL_DIR, "assets");
    const bundle = fs.existsSync(assetsDir) && fs.readdirSync(assetsDir).find(f => /^index-[0-9a-f]+\.js$/.test(f));
    const source = bundle ? fs.readFileSync(path.join(assetsDir, bundle), "utf8") : "";
    const flag = /([A-Za-z_$][\w$]*)=[A-Za-z_$][\w$]*&&\{\}\.IS_SANDBOX/g;
    if ((source.match(flag) || []).length === 1) {
        const sandboxed = source.replace(flag, "$1=!0");
        app.get(`/assets/${bundle}`, (_req, res) => {
            res.set("Cache-Control", "no-cache");
            res.type("application/javascript").send(sandboxed);
        });
        log(`sandbox: client bundle ${bundle} served with its sandbox flag on`);
    } else {
        log("sandbox: could not find the client's sandbox flag; the client will show normal limits");
    }
}

app.use("/assets", express.static(path.join(OFFICIAL_DIR, "assets"), { fallthrough: false }));
app.use("/api", createApiRouter({ store: accounts, moderation, servers, game: gameApi, social }));

// Links from "Copy link" on profiles and clans open the game with that card.
app.get("/player/:name", (req, res) => res.redirect(302, "/?profile=" + encodeURIComponent(req.params.name)));
app.get("/clan/:name", (req, res) => res.redirect(302, "/?clan=" + encodeURIComponent(req.params.name)));

app.get("/s/:key/ping", (req, res) => {
    if (!games.has(req.params.key)) return res.status(404).end();
    res.set("Cache-Control", "no-store");
    res.type("text").send("ok");
});

app.get("/ping", (_req, res) => {
    res.json({
        status: "ok",
        build: build.BUILD_ID,
        servers: servers.list()
    });
});

app.use(express.static(PUBLIC_DIR));

// ---------------------------------------------------------------- websocket
const server = createServer(app);
const wss = new WebSocketServer({ noServer: true, maxPayload: 16 * 1024 });
const onConnection = createConnectionHandler({ build, accounts, moderation, log });

server.on("upgrade", (req, socket, head) => {
    const pathname = new URL(req.url, "http://localhost").pathname;
    if (pathname === "/api/social/ws") return social.handleUpgrade(req, socket, head);
    const match = /^\/s\/([A-Za-z0-9]+)\/?$/.exec(pathname);
    const game = match && games.get(match[1]);
    if (!game) {
        socket.destroy();
        return;
    }
    wss.handleUpgrade(req, socket, head, (ws) => onConnection(ws, req, game));
});

server.listen(PORT, HOST, () => {
    log(`MooMoo.io private server on http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
    log(`protocol build ${build.BUILD_ID} (${build.publicPath}), servers: ${GAME_SERVERS.map(s => s.key + (s.membersOnly ? " (members)" : "")).join(", ")}`);
    if (!fs.existsSync(indexFile)) log("official client is not built yet - run `npm run build`");
});

// Graceful shutdown: the client's "Server restarting in 0:03" notice, then
// "Server is restarting - pick another" so open pages look for another server.
let stopping = false;
const shutdown = () => {
    if (stopping) process.exit(0);
    stopping = true;
    games.forEach(g => g.announceShutdown(3));
    setTimeout(() => games.forEach(g => g.closeAll()), 1100);
    setTimeout(() => process.exit(0), 1500);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
