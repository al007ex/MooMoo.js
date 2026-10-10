// FRVR SOCIAL
// Local stand-in for crucible.frvr.com/v1/social, which the official client uses for
// friends (through the FRVR SDK's auth.authenticatedFetch) and for live presence and
// game invites (through the SDK's FRVR.social.live socket). Same routes, same JSON:
//
//   GET    /friends/:id                         -> [{id, createdAt}]
//   GET    /friends/:id/requests                -> [{id, senderId, recipientId, createdAt}]
//   GET    /friends/:id/outgoing-requests       -> [{id, senderId, recipientId, createdAt}]
//   POST   /friends/:id/requests                {recipientId}
//   POST   /friends/:id/requests/:requestId     {accept}
//   DELETE /friends/:id/outgoing-requests/:requestId
//   DELETE /friends/:id                         {friendId}
//
//   WS /ws?token=<access token>&gameId=<game>
//     server -> client  {code: "ON_CONNECT", data: {friends: [status]}}
//                       {code: "FRIEND_STATUS_UPDATED", data: status}
//                       {code: "RECEIVE_GAME_INVITE", data: {senderId, lobbyId, gameId, metadata}}
//     client -> server  {code: "UPDATE_STATUS", data: {metadata, gameId}}
//                       {code: "SEND_GAME_INVITE", data: {recipientId, lobbyId, gameId, metadata}}
//   status = {userId, presence: "online" | "offline", gameId, metadata}

import express from "express";
import { WebSocketServer } from "ws";

export class SocialHub {

    constructor({ store, log }) {
        this.store = store;
        this.log = log;
        this.clients = new Map(); // userId -> Set<client>
        this.wss = new WebSocketServer({ noServer: true, maxPayload: 8 * 1024 });
    }

    handleUpgrade(req, socket, head) {
        const url = new URL(req.url, "http://localhost");
        const account = this.store.verifyToken(url.searchParams.get("token") || "");
        if (!account) {
            socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n");
            socket.destroy();
            return;
        }
        this.wss.handleUpgrade(req, socket, head, (ws) => this.onConnection(ws, account, url.searchParams.get("gameId") || ""));
    }

    onConnection(ws, account, gameId) {
        const client = { ws, userId: account.id, gameId, metadata: {}, updatedAt: Date.now() };
        const set = this.clients.get(account.id) || new Set();
        const wasOnline = set.size > 0;
        set.add(client);
        this.clients.set(account.id, set);

        this.send(client, "ON_CONNECT", { friends: this.store.friendsOf(account.id).map(f => this.statusOf(f.id)) });
        if (!wasOnline) this.broadcastStatus(account.id);

        ws.on("message", (raw) => {
            let msg;
            try {
                msg = JSON.parse(String(raw));
            } catch {
                return;
            }
            const data = msg && typeof msg.data === "object" && msg.data ? msg.data : {};
            if (msg.code === "UPDATE_STATUS") {
                client.metadata = data.metadata && typeof data.metadata === "object" ? data.metadata : {};
                if (typeof data.gameId === "string") client.gameId = data.gameId;
                client.updatedAt = Date.now();
                this.broadcastStatus(account.id);
            } else if (msg.code === "SEND_GAME_INVITE") {
                const to = String(data.recipientId || "");
                if (!this.store.areFriends(account.id, to)) return;
                for (const other of this.clients.get(to) || []) {
                    this.send(other, "RECEIVE_GAME_INVITE", {
                        senderId: account.id,
                        lobbyId: data.lobbyId,
                        gameId: typeof data.gameId === "string" ? data.gameId : client.gameId,
                        metadata: data.metadata && typeof data.metadata === "object" ? data.metadata : {}
                    });
                }
            }
        });
        ws.on("close", () => {
            set.delete(client);
            if (!set.size) this.clients.delete(account.id);
            this.broadcastStatus(account.id);
        });
        ws.on("error", () => {});
    }

    send(client, code, data) {
        if (client.ws.readyState === client.ws.OPEN) client.ws.send(JSON.stringify({ code, data }));
    }

    statusOf(userId) {
        const set = this.clients.get(userId);
        if (!set || !set.size) return { userId, presence: "offline", gameId: null, metadata: {} };
        let latest = null;
        for (const client of set) {
            if (!latest || client.updatedAt >= latest.updatedAt) latest = client;
        }
        return { userId, presence: "online", gameId: latest.gameId, metadata: latest.metadata };
    }

    // Tell every online friend of `userId` where they are now.
    broadcastStatus(userId) {
        const status = this.statusOf(userId);
        for (const friend of this.store.friendsOf(userId)) {
            for (const client of this.clients.get(friend.id) || []) this.send(client, "FRIEND_STATUS_UPDATED", status);
        }
    }

    // New friends see each other's presence straight away.
    friendshipChanged(a, b) {
        for (const [from, to] of [[a, b], [b, a]]) {
            const status = this.statusOf(from);
            for (const client of this.clients.get(to) || []) this.send(client, "FRIEND_STATUS_UPDATED", status);
        }
    }

    online(userId) {
        return this.clients.has(userId);
    }
}

export function createSocialRouter({ store, hub }) {
    const router = express.Router();
    router.use(express.json({ limit: "8kb" }));

    // Bearer token -> account; the :id in the path has to be the caller.
    router.use("/friends/:id", (req, res, next) => {
        const header = String(req.get("authorization") || "");
        const account = header.startsWith("Bearer ") ? store.verifyToken(header.slice(7)) : null;
        if (!account) return res.status(401).json({ message: "Unauthorized" });
        if (store.accountById(req.params.id) !== account) return res.status(403).json({ message: "Forbidden" });
        req.account = account;
        next();
    });

    const requestJson = (r) => ({ id: r.id, senderId: r.senderId, recipientId: r.recipientId, createdAt: r.createdAt });

    router.get("/friends/:id", (req, res) => {
        res.json(store.friendsOf(req.account.id).map(f => ({ id: f.id, createdAt: f.createdAt })));
    });

    router.get("/friends/:id/requests", (req, res) => {
        res.json(store.requestsFor(req.account.id).map(requestJson));
    });

    router.get("/friends/:id/outgoing-requests", (req, res) => {
        res.json(store.requestsFrom(req.account.id).map(requestJson));
    });

    router.post("/friends/:id/requests", (req, res) => {
        const recipientId = String((req.body && req.body.recipientId) || "");
        const recipient = store.accountById(recipientId);
        const result = store.createFriendRequest(req.account.id, recipient ? recipient.id : recipientId);
        if (result.status === 404) return res.status(404).json({ message: "User not found" });
        if (result.status === 409) return res.status(409).json({ message: "Request already exists" });
        if (result.friends) {
            hub.friendshipChanged(req.account.id, recipient.id);
            return res.status(200).json({ friends: true });
        }
        res.status(201).json(requestJson(result.request));
    });

    router.post("/friends/:id/requests/:requestId", (req, res) => {
        const accept = !!(req.body && req.body.accept);
        const request = store.answerFriendRequest(req.account.id, req.params.requestId, accept);
        if (!request) return res.status(404).json({ message: "Request not found" });
        if (accept) hub.friendshipChanged(request.senderId, request.recipientId);
        res.json({ accepted: accept });
    });

    router.delete("/friends/:id/outgoing-requests/:requestId", (req, res) => {
        if (!store.cancelFriendRequest(req.account.id, req.params.requestId)) return res.status(404).json({ message: "Request not found" });
        res.status(204).end();
    });

    router.delete("/friends/:id", (req, res) => {
        const friendId = String((req.body && req.body.friendId) || "");
        if (!store.removeFriend(req.account.id, friendId)) return res.status(404).json({ message: "Friend not found" });
        res.status(204).end();
    });

    router.use((_req, res) => res.status(404).json({ message: "Not found" }));
    return router;
}
