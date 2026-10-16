// CHAT AND PRESENCE
// Whispers between friends / clanmates, clan chat, "come to my server" invites and the
// online lists the client shows (friends in a game, clanmates in a game). Messages reach
// open pages through the page stream ("chat", "invite", "friend", "clan-on" events).
//
//   POST /chat/whisper  {auth, to, text, n}      -> {id, to}
//   POST /chat/clan     {auth, text, n}          -> {id}
//   POST /chat/history  {auth, kind, with?}      -> {messages}
//   POST /invite        {auth, to}               -> {}
//   POST /clan/online   {auth}                   -> {online: [{name, server}]}
//   POST /page/friends  {auth, friends: [id]}    -> {online: [{id, name, server}]}
//   POST /mod/messages  {auth, from: id|name}    -> {messages}   (staff: what someone said)
// Errors are {error} with the client's keys: auth, empty, unclean, "slow down", closed,
// "not friends", "not yours", "no clan", denied, "not found", "not in a game".

import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import express from "express";
import { isRude } from "../moomoo/libs/nameFilter.js";

const MAX_TEXT = 200;
const KEEP_PER_THREAD = 100;
const KEEP_SAID = 200;
const RATE = { count: 5, windowMs: 10 * 1000 };
const INVITE_GAP_MS = 30 * 1000;

const msgId = () => randomBytes(8).toString("hex");

export class Chat {

    constructor({ dataDir, store, stream, game, log }) {
        this.file = path.join(dataDir, "chat.json");
        this.store = store;
        this.stream = stream;
        this.game = game;
        this.log = log;
        this.data = { whispers: {}, clans: {}, said: {} };
        try {
            Object.assign(this.data, JSON.parse(fs.readFileSync(this.file, "utf8")));
        } catch {}
        this.sent = new Map();        // accountId -> [timestamps]
        this.invites = new Map();     // "from|to" -> last invite
        this.saveTimer = null;
    }

    save() {
        clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => fs.writeFileSync(this.file, JSON.stringify(this.data)), 500);
    }

    // ------------------------------------------------------------ rules
    slowDown(accountId) {
        const now = Date.now();
        const list = (this.sent.get(accountId) || []).filter(t => now - t < RATE.windowMs);
        if (list.length >= RATE.count) {
            this.sent.set(accountId, list);
            return true;
        }
        list.push(now);
        this.sent.set(accountId, list);
        return false;
    }

    clanmates(a, b) {
        return !!a.clan && a.clan === b.clan;
    }

    cleanText(raw) {
        const text = String(raw ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_TEXT);
        if (!text) return { error: "empty" };
        if (isRude(text) || text.split(" ").some(word => isRude(word))) return { error: "unclean" };
        return { text };
    }

    // ------------------------------------------------------------ storage
    push(list, entry, keep) {
        list.push(entry);
        if (list.length > keep) list.splice(0, list.length - keep);
    }

    remember(account, entry) {
        this.push(this.data.said[account.id] = this.data.said[account.id] || [], entry, KEEP_SAID);
    }

    whisperKey(a, b) {
        return [a.id, b.id].sort().join("|");
    }

    publicMessage(m) {
        const out = { id: m.id, kind: m.kind, from: { name: m.from.name }, text: m.text, at: m.at };
        if (m.to) out.to = { name: m.to.name };
        if (m.system) out.system = true;
        return out;
    }

    // ------------------------------------------------------------ actions
    whisper(account, toName, rawText, nonce) {
        if (!account.name) return { error: "auth" };
        if (account.verdict === "ban") return { error: "denied" };
        const target = this.store.nameOwner(toName);
        if (!target || target === account) return { error: "not found" };
        const friends = this.store.areFriends(account.id, target.id);
        if (!friends && !this.clanmates(account, target)) return { error: account.clan ? "not yours" : "not friends" };
        if (!this.store.prefsOf(target).whispers) return { error: "closed" };
        const clean = this.cleanText(rawText);
        if (clean.error) return clean;
        if (this.slowDown(account.id)) return { error: "slow down" };
        const message = {
            id: msgId(), kind: "whisper", from: { id: account.id, name: account.name }, to: { id: target.id, name: target.name },
            text: clean.text, at: Date.now(), shadow: account.verdict === "shadow" || undefined
        };
        const key = this.whisperKey(account, target);
        this.push(this.data.whispers[key] = this.data.whispers[key] || [], message, KEEP_PER_THREAD);
        this.remember(account, { at: message.at, kind: "whisper", to: { name: target.name }, text: message.text, shadow: message.shadow });
        this.save();
        const event = Object.assign(this.publicMessage(message), nonce ? { n: String(nonce).slice(0, 40) } : {});
        this.stream.sendTo(message.shadow ? [account.id] : [account.id, target.id], "chat", event);
        return { id: message.id, to: target.name };
    }

    clanSay(account, rawText, nonce) {
        if (!account.name) return { error: "auth" };
        if (account.verdict === "ban") return { error: "denied" };
        const clan = account.clan ? this.store.data.clans[account.clan] : null;
        if (!clan) return { error: "no clan" };
        const clean = this.cleanText(rawText);
        if (clean.error) return clean;
        if (this.slowDown(account.id)) return { error: "slow down" };
        const message = {
            id: msgId(), kind: "clan", clan: clan.name, from: { id: account.id, name: account.name },
            text: clean.text, at: Date.now(), shadow: account.verdict === "shadow" || undefined
        };
        this.push(this.data.clans[clan.name] = this.data.clans[clan.name] || [], message, KEEP_PER_THREAD);
        this.remember(account, { at: message.at, kind: "clan", clan: clan.name, text: message.text, shadow: message.shadow });
        this.save();
        const event = Object.assign(this.publicMessage(message), nonce ? { n: String(nonce).slice(0, 40) } : {});
        this.stream.sendTo(message.shadow ? [account.id] : this.clanAudience(clan, account.id), "chat", event);
        return { id: message.id };
    }

    clanAudience(clan, alwaysId) {
        return clan.members
            .map(m => this.store.accountById(m.id))
            .filter(a => a && (a.id === alwaysId || this.store.prefsOf(a).clanChat))
            .map(a => a.id);
    }

    // "<name> joined the clan" and similar lines.
    clanSystem(clanName, text) {
        const clan = this.store.data.clans[clanName];
        if (!clan) return;
        const message = { id: msgId(), kind: "clan", clan: clan.name, from: { name: "" }, text, at: Date.now(), system: true };
        this.push(this.data.clans[clan.name] = this.data.clans[clan.name] || [], message, KEEP_PER_THREAD);
        this.save();
        this.stream.sendTo(this.clanAudience(clan, null), "chat", this.publicMessage(message));
    }

    history(account, kind, withName) {
        if (kind === "clan") {
            if (!account.clan) return { error: "no clan" };
            const list = (this.data.clans[account.clan] || []).filter(m => !m.shadow || m.from.id === account.id);
            return { messages: list.map(m => this.publicMessage(m)) };
        }
        const other = this.store.nameOwner(withName);
        if (!other) return { error: "not found" };
        const list = (this.data.whispers[this.whisperKey(account, other)] || []).filter(m => !m.shadow || m.from.id === account.id);
        return { messages: list.map(m => this.publicMessage(m)) };
    }

    invite(account, toName) {
        if (!account.name) return { error: "auth" };
        const where = this.game.whereIs(account.id);
        if (!where) return { error: "not in a game" };
        const target = this.store.nameOwner(toName);
        if (!target || target === account) return { error: "not found" };
        const friends = this.store.areFriends(account.id, target.id);
        if (!friends && !this.clanmates(account, target)) return { error: account.clan ? "not yours" : "not friends" };
        const key = account.id + "|" + target.id;
        if (Date.now() - (this.invites.get(key) || 0) < INVITE_GAP_MS) return { error: "slow down" };
        this.invites.set(key, Date.now());
        if (account.verdict !== "shadow") {
            this.stream.sendTo([target.id], "invite", { from: { name: account.name }, server: where.server, as: friends ? "whisper" : "clan" });
        }
        return {};
    }

    clanOnline(account) {
        const clan = account.clan ? this.store.data.clans[account.clan] : null;
        if (!clan) return { error: "no clan" };
        const online = [];
        for (const member of clan.members) {
            const other = this.store.accountById(member.id);
            const where = other && this.game.whereIs(other.id);
            if (where) online.push({ name: other.name, server: where.server });
        }
        return { online };
    }

    friendsOnline(account, ids) {
        const mine = new Set(this.store.friendsOf(account.id).map(f => f.id));
        const online = [];
        for (const id of Array.isArray(ids) ? ids.slice(0, 500) : []) {
            if (!mine.has(id)) continue;
            const friend = this.store.accountById(id);
            const where = friend && this.game.whereIs(friend.id);
            if (where) online.push({ id: friend.id, name: friend.name, server: where.server });
        }
        return { online };
    }

    // What someone said: account by id or name, or a guest by session id.
    said(from) {
        const account = this.store.accountById(String(from)) || this.store.nameOwner(String(from));
        if (account) return (this.data.said[account.id] || []).slice().reverse();
        const guest = this.game.playerBySession(String(from));
        return guest && guest.saidLog ? guest.saidLog.slice().reverse() : null;
    }

    // ------------------------------------------------------------ game hooks
    gameChat(player, text, server) {
        const entry = { at: Date.now(), kind: "game", server, text, shadow: player.shadowed || undefined };
        if (player.account) {
            this.remember(player.account, entry);
            this.save();
        } else {
            this.push(player.saidLog = player.saidLog || [], entry, 50);
        }
    }

    // A signed-in player joined (server key) or left ("") a game.
    presence(account, server) {
        if (!account || !account.name) return;
        const friends = this.store.friendsOf(account.id).map(f => f.id);
        if (friends.length) this.stream.sendTo(friends, "friend", { id: account.id, name: account.name, server });
        const clan = account.clan ? this.store.data.clans[account.clan] : null;
        if (clan) this.stream.sendTo(clan.members.map(m => m.id).filter(id => id !== account.id), "clan-on", { name: account.name, server });
    }

    // ------------------------------------------------------------ routes
    router({ requireAuth, requireStaff }) {
        const router = express.Router();
        const answer = (res, result) => res.status(result.error ? (result.error === "not found" ? 404 : 400) : 200).json(result);
        router.post("/chat/whisper", (req, res) => {
            const account = requireAuth(req, res);
            if (account) answer(res, this.whisper(account, req.body.to, req.body.text, req.body.n));
        });
        router.post("/chat/clan", (req, res) => {
            const account = requireAuth(req, res);
            if (account) answer(res, this.clanSay(account, req.body.text, req.body.n));
        });
        router.post("/chat/history", (req, res) => {
            const account = requireAuth(req, res);
            if (account) answer(res, this.history(account, req.body.kind, req.body.with));
        });
        router.post("/invite", (req, res) => {
            const account = requireAuth(req, res);
            if (account) answer(res, this.invite(account, req.body.to));
        });
        router.post("/clan/online", (req, res) => {
            const account = requireAuth(req, res);
            if (account) answer(res, this.clanOnline(account));
        });
        router.post("/page/friends", (req, res) => {
            const account = requireAuth(req, res);
            if (account) answer(res, this.friendsOnline(account, req.body.friends));
        });
        router.post("/mod/messages", (req, res) => {
            if (!requireStaff(req, res)) return;
            const list = this.said(req.body.from);
            if (!list) return res.status(404).json({ error: "not found" });
            res.json({ messages: list.slice(0, 100) });
        });
        return router;
    }
}
