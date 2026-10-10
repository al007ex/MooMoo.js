// CONNECTION
// Lifecycle of one WebSocket:
//   1. gate      origin, build id (?b=), join ticket (?token=tk:...), bans, members-only
//   2. io-init   protocol handshake (session seed, key, keyed + pinned mode)
//   3. frames    decode (tag / sequence / table) -> anticheat rate limit -> packet handler
//   4. close     cleanup

import { randomBytes } from "node:crypto";
import { ProtocolSession } from "../protocol/session.js";
import { CLOSE } from "../protocol/constants.js";
import { AntiCheat, ANTICHEAT_CONFIG } from "../anticheat/index.js";
import { ConnectionLimit } from "../moomoo/libs/limit.js";
import { handlePacket } from "./packets.js";

const DEBUG_PACKETS = Boolean(process.env.DEBUG_PACKETS);

export function createConnectionHandler({ build, accounts, moderation, log }) {
    const limiter = new ConnectionLimit(ANTICHEAT_CONFIG.connection.maxConnectionsPerIp);
    const rules = ANTICHEAT_CONFIG.connection;

    return function onConnection(ws, req, game) {
        const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress;
        const url = new URL(req.url, "http://localhost");
        const reject = (code, why) => {
            log(`[${game.key}] rejected ${ip}: ${why}`);
            try {
                ws.close(code);
            } catch {}
        };

        // ---- 1. gate ----
        if (rules.enforceOrigin) {
            let originHost = null;
            try {
                originHost = new URL(req.headers.origin).host;
            } catch {}
            if (originHost !== req.headers.host) return reject(CLOSE.WRONG_ORIGIN, `origin ${req.headers.origin}`);
        }
        if (rules.enforceBuild && url.searchParams.get("b") !== build.BUILD_ID) {
            return reject(CLOSE.GAME_UPDATED, `build ${url.searchParams.get("b")} != ${build.BUILD_ID}`);
        }
        if (limiter.check(ip)) return reject(CLOSE.INVALID_CONNECTION, "too many connections from this ip");

        let account = null;
        let did = null;
        if (rules.requireTicket) {
            const token = url.searchParams.get("token") || "";
            const ticket = token.startsWith("tk:") ? accounts.consumeTicket(token.slice(3), rules.ticketMaxAgeMs) : null;
            if (!ticket) return reject(CLOSE.INVALID_CONNECTION, "missing or invalid join ticket");
            if (ticket.server && ticket.server !== game.key) return reject(CLOSE.INVALID_CONNECTION, `ticket is for server ${ticket.server}`);
            account = ticket.account;
            did = ticket.did;
        }
        if (moderation.isBanned(ip, account && account.id, did) || (account && account.verdict === "ban")) {
            return reject(CLOSE.INVALID_CONNECTION, "banned");
        }
        if (game.membersOnly && !account) return reject(CLOSE.SIGN_IN_REQUIRED, "members-only server");

        limiter.up(ip);

        // ---- 2. handshake ----
        const socketId = randomBytes(8).toString("hex");
        const session = new ProtocolSession(build, socketId);
        ws.send(session.handshakeFrame());

        let closed = false;
        const send = (type, ...args) => {
            if (closed || ws.readyState !== ws.OPEN || !session.canSend(type)) return;
            ws.send(session.encode(type, args));
        };

        const staff = account && (account.role === "admin" || account.role === "mod");
        if (game.playerCount() >= game.capacity && !staff) {
            send("B", "server is full");
            setTimeout(() => ws.close(), 100);
            limiter.down(ip);
            closed = true;
            return;
        }

        const player = game.addPlayer({ send, account, ip, id: socketId });
        if (!player) {
            send("B", "server is full");
            setTimeout(() => ws.close(), 100);
            limiter.down(ip);
            closed = true;
            return;
        }
        player.did = did;
        if (account) {
            account.lastSeen = { ip, did, at: Date.now(), server: game.key };
            accounts.save();
        }
        player.kick = (reason) => {
            send("B", reason);
            setTimeout(() => ws.close(), 100);
        };
        player.anticheat = new AntiCheat({
            player,
            store: moderation,
            log: (msg) => log(`[${game.key}] ${player.name}#${player.sid} (${ip}): ${msg}`),
            kick: (reason) => player.kick(reason),
            close: (code) => ws.close(code)
        });

        const ctx = { game, accounts, moderation, log };
        log(`[${game.key}] join sid ${player.sid} (${account ? "account " + (account.name || account.email) : "guest"}, ${ip})`);

        // ---- 3. frames ----
        ws.on("message", (data) => {
            if (closed) return;
            const frame = data instanceof Buffer ? data : Buffer.from(data);
            const msg = session.decode(frame);
            if (msg.error) {
                player.anticheat.onTransportError(msg.error, msg.detail);
                return;
            }
            if (DEBUG_PACKETS && msg.name !== "0") log(`[${game.key}] <- ${msg.name} ${JSON.stringify(msg.args).slice(0, 120)}`);
            if (!player.anticheat.allow(msg.name)) return;
            try {
                handlePacket(ctx, player, msg.name, msg.args);
            } catch (error) {
                log(`[${game.key}] error in packet "${msg.name}": ${error.stack || error}`);
                player.anticheat.invalid(msg.name, "handler exception");
            }
        });

        // ---- 4. close ----
        ws.on("close", () => {
            if (closed) return;
            closed = true;
            limiter.down(ip);
            log(`[${game.key}] leave sid ${player.sid} (${player.name})`);
            game.removePlayer(player);
        });
        ws.on("error", () => {});
    };
}
