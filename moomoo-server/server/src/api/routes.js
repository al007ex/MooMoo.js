// LOCAL API
// Answers every request the official client makes to api.moomoo.io (and the FRVR auth
// and social calls made through client-official/shim.js) so the menus, sign-in, friends,
// profiles, clans, top boards and server picker behave like the live site - without any
// real verification.

import express from "express";
import { createSocialRouter } from "./social.js";
import { ANTICHEAT_CONFIG } from "../anticheat/config.js";

const clientIp = (req) => (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress;
// Timed bans from the console / staff tools: {minutes} or {days}.
const banUntil = (body) => {
    const minutes = Number(body.minutes) || (Number(body.days) || 0) * 24 * 60;
    return minutes > 0 ? Date.now() + minutes * 60 * 1000 : 0;
};

// Sliding-window counter per key (friend requests: "Too many friend requests").
function rateLimiter(max, windowMs) {
    const hits = new Map();
    return (key) => {
        const now = Date.now();
        const list = (hits.get(key) || []).filter(t => now - t < windowMs);
        if (list.length >= max) {
            hits.set(key, list);
            return false;
        }
        list.push(now);
        hits.set(key, list);
        return true;
    };
}

export function createApiRouter({ store, moderation, servers, game, social, stream, chat }) {
    const router = express.Router();
    router.use("/social", createSocialRouter({ store, hub: social }));
    if (stream) router.use(stream.router());
    router.use(express.json({ limit: "32kb" }));
    const friendRequestRate = rateLimiter(20, 60 * 60 * 1000);

    const auth = (req) => store.verifyToken(req.body && req.body.auth);
    const requireAuth = (req, res) => {
        const account = auth(req);
        if (!account) res.status(403).json({ error: "auth" });
        return account;
    };
    const requireStaff = (req, res, roles = ["admin", "mod"]) => {
        const account = requireAuth(req, res);
        if (!account) return null;
        if (!roles.includes(account.role)) {
            res.status(403).json({ error: "rank" });
            return null;
        }
        return account;
    };

    // Chat, invites and online lists (before /clan/:action, which would take /clan/online).
    if (chat) router.use(chat.router({ requireAuth, requireStaff }));

    // ---------- FRVR auth emulation (used by shim.js) ----------
    // Email + code: any 6 digits work. Email + password: any password works.
    router.post("/auth/code", (req, res) => {
        const flow = store.startLogin(req.body && req.body.email);
        if (!flow) return res.status(400).json({ type: "invalidEmail" });
        res.json({ flow });
    });
    router.post("/auth/verify", (req, res) => {
        const code = String((req.body && req.body.code) || "");
        if (!/^\d{6}$/.test(code)) return res.status(400).json({ type: "invalidCode" });
        const account = store.finishLogin(req.body.flow);
        if (!account) return res.status(400).json({ type: "serverError" });
        res.json({ token: store.issueToken(account), email: account.email, id: account.id });
    });
    router.post("/auth/password", (req, res) => {
        const account = store.accountForEmail(req.body && req.body.email);
        if (!account || !String((req.body && req.body.password) || "").length) {
            return res.status(400).json({ type: "invalidCredentials" });
        }
        res.json({ token: store.issueToken(account), email: account.email, id: account.id });
    });
    router.post("/auth/refresh", (req, res) => {
        const account = store.verifyToken(req.body && req.body.token);
        if (!account) return res.status(403).json({ type: "accountNotActive" });
        res.json({ token: store.issueToken(account), email: account.email, id: account.id });
    });

    // ---------- servers / join ----------
    router.get("/servers", (_req, res) => {
        res.set("Cache-Control", "no-store");
        res.json(servers.list());
    });

    // The client sends the address of the server it is about to open ("host"); the ticket
    // is only good for that server. Local servers are addressed as <host>/s/<key>.
    // Errors the client explains: auth, captcha, banned {until}, locked {seconds}
    // (also vpn / hosting on moomoo.io, which has no counterpart here).
    router.post("/join", (req, res) => {
        const body = req.body || {};
        const account = body.auth ? store.verifyToken(body.auth) : null;
        if (body.auth && !account) return res.status(403).json({ error: "auth" });
        const ip = clientIp(req);
        const did = typeof body.did === "string" ? body.did : null;
        const ban = moderation.banEntry(ip, account && account.id, did) || (account && account.verdict === "ban" ? {} : null);
        if (ban) return res.status(403).json({ error: "banned", until: ban.until || 0 });
        const seconds = moderation.lockedFor(ip, account && account.id, did);
        if (seconds) return res.status(403).json({ error: "locked", seconds });
        // guests need the captcha, except right after a restart from a device that just played
        if (!account && !body.captcha && !store.recentDevice(did)) return res.status(403).json({ error: "captcha" });
        const match = /\/s\/([A-Za-z0-9]+)$/.exec(String(body.host || ""));
        res.json(store.issueTicket({ account, did, server: match ? match[1] : null }));
    });

    // ---------- account / names ----------
    router.post("/account", (req, res) => {
        const account = requireAuth(req, res);
        if (account) res.json(store.accountInfo(account));
    });

    router.post("/account/prefs", (req, res) => {
        const account = requireAuth(req, res);
        if (account) res.json({ prefs: store.setPrefs(account, req.body.prefs) });
    });

    // Settings -> Look
    router.post("/account/look", (req, res) => {
        const account = requireAuth(req, res);
        if (!account) return;
        if (req.body.look === undefined) return res.json(store.lookInfo(account));
        const result = store.setLook(account, req.body.look);
        res.status(result.status).json(result.body);
    });

    router.post("/name", (req, res) => {
        const account = requireAuth(req, res);
        if (!account) return;
        const result = store.claimName(account, req.body.name);
        res.status(result.status).json(result.body);
    });

    router.get("/name-check", (req, res) => {
        res.json({ reserved: Boolean(store.nameOwner(req.query.name)) });
    });

    // Also used for tribe names: clan names (and "solo", the tag of clanless players) are reserved.
    router.get("/clan-check", (req, res) => {
        const name = String(req.query.name || "").trim().toLowerCase();
        res.json({ reserved: name === "solo" || Object.keys(store.data.clans).some(c => c.toLowerCase() === name) });
    });

    router.post("/account/socials", (req, res) => {
        const account = requireAuth(req, res);
        if (!account) return;
        const result = store.setSocials(account, req.body.socials);
        res.status(result.status).json(result.body);
    });

    // ---------- Discord linking (?discord=<code> from the Discord bot's /link) ----------
    router.get("/discord/link", (req, res) => {
        const entry = store.discordCode(req.query.code);
        if (!entry) return res.status(404).json({ error: "code" });
        res.json({ discord: entry.discord });
    });

    router.post("/discord/link", (req, res) => {
        const account = requireAuth(req, res);
        if (!account) return;
        const result = store.linkDiscord(account, req.body.code);
        res.status(result.status).json(result.body);
    });

    // ---------- friends (moomoo side: names and request permission) ----------
    router.post("/names-for", (req, res) => {
        res.json({ names: store.namesFor(req.body && req.body.ids) });
    });

    // Asked before every friend request. 403 when the player has "Allow Friend Requests"
    // off; requests from shadowed players are swallowed ({silent: true}).
    router.post("/friends/allow", (req, res) => {
        const account = requireAuth(req, res);
        if (!account) return;
        const target = store.accountById(String(req.body.to || ""));
        if (!target || target.id === account.id) return res.status(404).json({ error: "not found" });
        if (!store.prefsOf(target).friendRequests) return res.status(403).json({ error: "closed" });
        if (!friendRequestRate(account.id)) return res.status(429).json({ error: "rate" });
        res.json({ silent: account.verdict === "shadow" });
    });

    router.post("/client-log", (_req, res) => res.status(204).end());

    // ---------- profiles / top ----------
    router.get("/profile", (req, res) => {
        const account = store.nameOwner(req.query.name);
        if (!account) return res.status(404).json({ error: "not found" });
        res.json(store.profile(account));
    });

    const top = (span, staff) => {
        const board = store.top(["week", "month", "all"].includes(span) ? span : "week");
        if (!staff) {
            board.players = board.players.filter(p => !p.shadowed);
            board.clans = board.clans.filter(c => !c.shadowed);
        }
        return board;
    };
    router.get("/top", (req, res) => res.json(top(req.query.span, false)));
    router.post("/top", (req, res) => {
        const account = requireStaff(req, res);
        if (account) res.json(top(req.body.span, true));
    });

    // ---------- clans ----------
    router.get("/clan", (req, res) => {
        const clan = Object.values(store.data.clans).find(c => c.name.toLowerCase() === String(req.query.name || "").toLowerCase());
        if (!clan) return res.status(404).json({ error: "not found" });
        res.json(store.clanView(clan));
    });

    router.post("/clan/:action", (req, res) => {
        const account = requireAuth(req, res);
        if (!account) return;
        const result = store.clanAction(account, req.params.action, req.body || {});
        res.status(result.status).json(result.body);
    });

    // ---------- moderation (staff) ----------
    router.post("/mod/role", (req, res) => {
        if (!requireStaff(req, res, ["admin"])) return;
        if (!store.setRole(req.body.name, req.body.role)) return res.status(404).json({ error: "no player" });
        res.json({});
    });

    // Staff panel on a profile: {name} for accounts, {id} for guests (the id comes with
    // the live stats packet). "IP ban" / "Clear" send ip: true.
    router.post("/mod/verdict", (req, res) => {
        const staff = requireStaff(req, res);
        if (!staff) return;
        const level = ["ban", "shadow", "clear"].includes(req.body.level) ? req.body.level : "clear";
        const reason = String(req.body.reason || "").slice(0, 80);
        if (req.body.id && !req.body.name) {
            const guest = game.playerBySession(String(req.body.id));
            if (!guest) return res.status(404).json({ error: "no player" });
            if (level === "ban") {
                moderation.ban({ ip: guest.ip, did: guest.did, name: guest.name, reason, until: banUntil(req.body) }, staff);
                if (guest.kick) guest.kick("kicked");
            } else if (level === "shadow") {
                guest.shadowed = true;
            } else if (req.body.ip) {
                moderation.unbanIp(guest.ip, guest.did);
            }
            return res.json({});
        }
        const target = store.nameOwner(req.body.name);
        if (!target) return res.status(404).json({ error: "no player" });
        const until = level === "ban" ? banUntil(req.body) : 0;
        if (until) {
            // a timed ban lives in the ban list only, so it lifts by itself
            moderation.ban({ accountId: target.id, name: target.name, reason, until }, staff);
            moderation.recordVerdict(target, "ban", reason + " (until " + new Date(until).toISOString().slice(0, 16).replace("T", " ") + ")", staff, { keepBans: true });
        } else {
            store.setVerdict(target.name, level);
            moderation.recordVerdict(target, level, reason, staff);
        }
        const last = target.lastSeen || {};
        if (level === "ban" && req.body.ip && last.ip) moderation.ban({ ip: last.ip, did: last.did, name: target.name, reason, until }, staff);
        if (level === "clear" && req.body.ip && last.ip) moderation.unbanIp(last.ip, last.did);
        if (level === "ban") game.kickAccount(target.id, "kicked");
        game.setShadow(target.id, level === "shadow");
        res.json({});
    });

    // Kicked players can't rejoin for kickLock.staffSeconds ("try again in 2 minutes").
    router.post("/mod/kick", (req, res) => {
        if (!requireStaff(req, res)) return;
        const lockSeconds = ANTICHEAT_CONFIG.kickLock.staffSeconds;
        let kicked = 0;
        if (req.body.id && !req.body.name) {
            const guest = game.playerBySession(String(req.body.id));
            if (guest && guest.kick) {
                moderation.lock({ ip: guest.ip, did: guest.did }, lockSeconds);
                guest.kick("kicked");
                kicked++;
            }
        } else {
            const target = store.nameOwner(req.body.name);
            if (target) {
                const last = target.lastSeen || {};
                moderation.lock({ accountId: target.id, ip: last.ip, did: last.did }, lockSeconds);
                kicked = game.kickAccount(target.id, "kicked");
            }
        }
        if (!kicked) return res.status(404).json({ error: "not online" });
        res.json({});
    });

    router.post("/mod/clan", (req, res) => {
        if (!requireStaff(req, res)) return;
        if (!store.setClanShadow(req.body.clan, req.body.shadow)) return res.status(404).json({ error: "not found" });
        res.json({});
    });

    router.post("/mod/player", (req, res) => {
        if (!requireStaff(req, res)) return;
        if (req.body.id && !req.body.name) {
            const guest = game.playerBySession(String(req.body.id));
            if (!guest) return res.status(404).json({ error: "no player" });
            return res.json(moderation.guestRecord(guest, game.sessionOf(guest)));
        }
        const target = store.nameOwner(req.body.name);
        if (!target) return res.status(404).json({ error: "no player" });
        res.json(moderation.playerRecord(target, game.sessionFor(target.id)));
    });

    router.use((_req, res) => res.status(404).json({ error: "not found" }));
    return router;
}
