// ACCOUNT STORE
// Local stand-in for moomoo.io's account backend (FRVR auth + api.moomoo.io + FRVR
// social): accounts, permanent names, roles, preferences, persistent clans, friends,
// lifetime / period stats, join tickets, Discord link codes. Everything is kept in
// server/data/accounts.json.

import fs from "node:fs";
import path from "node:path";
import { randomBytes, createHmac, timingSafeEqual } from "node:crypto";
import { gameName, isRude } from "../moomoo/libs/nameFilter.js";

const CLAN_MAX_MEMBERS = 80;               // [Ox]
const CLAN_RE = /^[A-Za-z0-9]{3,4}$/;
const NAME_MIN = 3;                        // "Names are 3-15 letters, numbers and _ : ( ) / ? -"
const NAME_MAX = 15;
const SOCIAL_FIELDS = ["youtube", "twitch", "tiktok", "x", "discord"];   // [hi]
const HANDLE_RE = /^[A-Za-z0-9._-]{1,32}$/;
export const DEFAULT_PREFS = { friendNotifs: true, friendRequests: true, clanInvites: true };
const DISCORD_CODE_MS = 10 * 60 * 1000;

// FRVR IDs look like MongoDB ObjectIds: 24 hex characters, starting with the creation time.
function objectId(at = Date.now()) {
    return Math.floor(at / 1000).toString(16).padStart(8, "0") + randomBytes(8).toString("hex");
}

// AI index -> stats key used by the client's profile card ([qh] / [Fh]).
export const ANIMAL_KEYS = ["cow", "pig", "bull", "bully", "wolf", "duck", "moostafa", "treasure", "moofie", "boar", "yeti", "crab_king", "sheep", "crab", "crab"];
export const BOSS_KEYS = ["crab_king", "moostafa", "moofie"];

const PERIOD_SPANS = {
    day: () => new Date().toISOString().slice(0, 10),
    week: () => {
        const d = new Date();
        const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - ((d.getUTCDay() + 6) % 7)));
        return monday.toISOString().slice(0, 10);
    },
    month: () => new Date().toISOString().slice(0, 7)
};

const b64url = (buf) => Buffer.from(buf).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
const fromB64url = (s) => Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");

function emptyStats() {
    return {
        kills: 0, deaths: 0, damage: 0, healing: 0, wood: 0, food: 0, stone: 0, gold: 0,
        animalDamage: 0, animalKills: {}, bestScore: 0, maxKills: 0, lives: 0, playtime: 0,
        periods: {}
    };
}

export class AccountStore {

    constructor(dataDir) {
        this.file = path.join(dataDir, "accounts.json");
        fs.mkdirSync(dataDir, { recursive: true });
        const secretFile = path.join(dataDir, "secret.key");
        if (!fs.existsSync(secretFile)) fs.writeFileSync(secretFile, randomBytes(32).toString("hex"));
        this.secret = Buffer.from(fs.readFileSync(secretFile, "utf8").trim(), "hex");
        this.data = { accounts: {}, emails: {}, names: {}, clans: {}, social: { friends: {}, requests: [] }, legacyIds: {} };
        try {
            Object.assign(this.data, JSON.parse(fs.readFileSync(this.file, "utf8")));
        } catch {}
        this.data.social = Object.assign({ friends: {}, requests: [] }, this.data.social);
        this.data.legacyIds = this.data.legacyIds || {};
        this.tickets = new Map();
        this.loginFlows = new Map();
        this.discordCodes = new Map();
        this.saveTimer = null;
        this.migratedIds = this.migrateIds();
    }

    // Accounts made before ids followed the FRVR format get one; tokens that still carry
    // the old id keep working through legacyIds.
    migrateIds() {
        const remap = {};
        for (const [id, account] of Object.entries(this.data.accounts)) {
            if (/^[a-f0-9]{24}$/.test(id)) continue;
            const seconds = Math.floor((account.createdAt || Date.now()) / 1000).toString(16).padStart(8, "0");
            remap[id] = seconds + (/^[a-f0-9]{16}$/.test(id) ? id : randomBytes(8).toString("hex"));
        }
        if (!Object.keys(remap).length) return remap;
        const m = (id) => remap[id] || id;
        const accounts = {};
        for (const account of Object.values(this.data.accounts)) {
            account.id = m(account.id);
            accounts[account.id] = account;
        }
        this.data.accounts = accounts;
        for (const map of [this.data.emails, this.data.names]) {
            for (const key of Object.keys(map)) map[key] = m(map[key]);
        }
        for (const clan of Object.values(this.data.clans)) {
            clan.members.forEach(member => member.id = m(member.id));
            (clan.past || []).forEach(past => past.id = m(past.id));
            (clan.invites || []).forEach(invite => {
                invite.id = m(invite.id);
                invite.by = m(invite.by);
            });
            clan.requests = clan.requests.map(m);
        }
        const friends = {};
        for (const [id, list] of Object.entries(this.data.social.friends)) friends[m(id)] = list.map(f => Object.assign(f, { id: m(f.id) }));
        this.data.social.friends = friends;
        this.data.social.requests.forEach(r => {
            r.senderId = m(r.senderId);
            r.recipientId = m(r.recipientId);
        });
        Object.assign(this.data.legacyIds, remap);
        fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
        return remap;
    }

    save() {
        clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => {
            fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2));
        }, 250);
    }

    // AUTH TOKENS (JWT, HS256) - mimics FRVR access tokens: payload.extra.{verified, identifier}
    issueToken(account) {
        const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
        const now = Math.floor(Date.now() / 1000);
        const payload = b64url(JSON.stringify({
            sub: account.id,
            iat: now,
            exp: now + 60 * 60 * 24 * 30,
            extra: { verified: true, identifier: account.email }
        }));
        const sig = b64url(createHmac("sha256", this.secret).update(header + "." + payload).digest());
        return `${header}.${payload}.${sig}`;
    }

    verifyToken(token) {
        if (typeof token !== "string") return null;
        const parts = token.split(".");
        if (parts.length !== 3) return null;
        const expected = createHmac("sha256", this.secret).update(parts[0] + "." + parts[1]).digest();
        const given = fromB64url(parts[2]);
        if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
        try {
            const payload = JSON.parse(fromB64url(parts[1]).toString("utf8"));
            if (payload.exp && payload.exp * 1000 < Date.now()) return null;
            return this.data.accounts[this.data.legacyIds[payload.sub] || payload.sub] || null;
        } catch {
            return null;
        }
    }

    // SIGN IN (no verification: any code / password is accepted)
    accountForEmail(email) {
        const key = String(email || "").trim().toLowerCase();
        if (!key || key.length > 120) return null;
        let id = this.data.emails[key];
        if (!id) {
            const createdAt = Date.now();
            id = objectId(createdAt);
            this.data.accounts[id] = {
                id, email: key, name: null, role: null, clan: null, createdAt,
                stats: emptyStats(), socials: {}, prefs: { ...DEFAULT_PREFS }, verdict: null
            };
            this.data.emails[key] = id;
            this.save();
        }
        return this.data.accounts[id];
    }

    startLogin(email) {
        const account = this.accountForEmail(email);
        if (!account) return null;
        const flow = randomBytes(12).toString("hex");
        this.loginFlows.set(flow, { accountId: account.id, at: Date.now() });
        return flow;
    }

    finishLogin(flow) {
        const entry = this.loginFlows.get(flow);
        if (!entry) return null;
        this.loginFlows.delete(flow);
        return this.data.accounts[entry.accountId] || null;
    }

    // NAMES
    nameOwner(name) {
        const id = this.data.names[String(name || "").trim().toLowerCase()];
        return id ? this.data.accounts[id] : null;
    }

    // POST /name. The name has to come through the game's own name filter unchanged:
    // 400 {error:"censored", shown} when it would be shown differently in game,
    // 400 {error:"unclean"} when the filter would replace it with "unknown".
    claimName(account, rawName) {
        if (account.name) return { status: 200, body: { name: account.name } };
        const requested = String(rawName ?? "").trim();
        if (requested.length < NAME_MIN || requested.length > NAME_MAX) return { status: 400, body: { error: "invalid" } };
        const shown = gameName(requested, NAME_MAX);
        if (shown.name.length < NAME_MIN) return { status: 400, body: { error: "invalid" } };
        if (shown.profane) return { status: 400, body: { error: "unclean" } };
        if (shown.name !== requested) return { status: 400, body: { error: "censored", shown: shown.name } };
        const owner = this.nameOwner(requested);
        if (owner && owner.id !== account.id) return { status: 409, body: { error: "taken" } };
        account.name = requested;
        this.data.names[requested.toLowerCase()] = account.id;
        this.save();
        return { status: 200, body: { name: requested } };
    }

    // PREFERENCES (Settings -> Friend Notifications / Allow Friend Requests / Allow Clan Invitations)
    prefsOf(account) {
        return Object.assign({}, DEFAULT_PREFS, account && account.prefs);
    }

    setPrefs(account, changes) {
        const prefs = this.prefsOf(account);
        for (const key of Object.keys(DEFAULT_PREFS)) {
            if (changes && typeof changes[key] === "boolean") prefs[key] = changes[key];
        }
        account.prefs = prefs;
        this.save();
        return prefs;
    }

    // SOCIAL HANDLES (profile card). 400 {field, why: "format" | "rude"}.
    setSocials(account, socials) {
        const out = {};
        for (const field of SOCIAL_FIELDS) {
            const value = socials && typeof socials[field] === "string" ? socials[field].trim() : "";
            if (!value) continue;
            if (!HANDLE_RE.test(value)) return { status: 400, body: { field, why: "format" } };
            if (isRude(value) || isRude(value.replace(/[._-]+/g, " "))) return { status: 400, body: { field, why: "rude" } };
            out[field] = value;
        }
        account.socials = out;
        this.save();
        return { status: 200, body: { socials: out } };
    }

    // ACCOUNT (POST /account)
    accountInfo(account) {
        const clan = account.clan ? this.data.clans[account.clan] : null;
        const member = clan ? clan.members.find(m => m.id === account.id) : null;
        const notes = clan && member && member.role !== "member" ? clan.requests.length : 0;
        return {
            name: account.name,
            role: account.role,
            clan: clan ? { name: clan.name, role: member ? member.role : "member" } : null,
            clanNotes: notes,
            prefs: this.prefsOf(account)
        };
    }

    // JOIN TICKETS (POST /join -> "tk:<ticket>" -> game server). A ticket only opens the
    // server it was asked for (the client sends that server's address as "host").
    issueTicket({ account, did, server }) {
        const ticket = randomBytes(18).toString("hex");
        const deviceId = did && /^[a-f0-9]{16,64}$/.test(did) ? did : randomBytes(12).toString("hex");
        this.tickets.set(ticket, { accountId: account ? account.id : null, did: deviceId, server: server || null, at: Date.now() });
        return { ticket, did: deviceId };
    }

    consumeTicket(ticket, maxAgeMs) {
        const entry = this.tickets.get(ticket);
        if (!entry) return null;
        this.tickets.delete(ticket);
        if (Date.now() - entry.at > maxAgeMs) return null;
        return { account: entry.accountId ? this.data.accounts[entry.accountId] || null : null, did: entry.did, server: entry.server };
    }

    // STATS
    recordLife(account, life) {
        const s = account.stats;
        s.lives++;
        s.deaths += life.died ? 1 : 0;
        s.kills += life.kills;
        s.damage += life.damage;
        s.healing += life.healing;
        s.wood += life.wood;
        s.food += life.food;
        s.stone += life.stone;
        s.gold += life.gold;
        s.animalDamage += life.animalDamage;
        s.playtime += life.playtime;
        s.bestScore = Math.max(s.bestScore, life.score);
        s.maxKills = Math.max(s.maxKills, life.kills);
        for (const [key, count] of Object.entries(life.animalKills)) {
            s.animalKills[key] = (s.animalKills[key] || 0) + count;
        }
        for (const [span, keyFn] of Object.entries(PERIOD_SPANS)) {
            const key = keyFn();
            const p = s.periods[span] && s.periods[span].key === key ? s.periods[span] : (s.periods[span] = { key, kills: 0, bestScore: 0 });
            p.kills += life.kills;
            p.bestScore = Math.max(p.bestScore, life.score);
        }
        const clan = account.clan ? this.data.clans[account.clan] : null;
        if (clan) {
            clan.stats.kills += life.kills;
            clan.stats.raidKills += life.bossKills || 0;
            for (const span of ["week", "month"]) {
                const key = PERIOD_SPANS[span]();
                const p = clan.stats.periods[span] && clan.stats.periods[span].key === key ? clan.stats.periods[span] : (clan.stats.periods[span] = { key, kills: 0 });
                p.kills += life.kills;
            }
            const member = clan.members.find(m => m.id === account.id);
            if (member) {
                member.kills = (member.kills || 0) + life.kills;
                for (const span of ["week", "month"]) {
                    const key = PERIOD_SPANS[span]();
                    member.periods = member.periods || {};
                    const p = member.periods[span] && member.periods[span].key === key ? member.periods[span] : (member.periods[span] = { key, kills: 0 });
                    p.kills += life.kills;
                }
            }
        }
        this.save();
    }

    currentPeriods(periods) {
        const out = {};
        for (const [span, keyFn] of Object.entries(PERIOD_SPANS)) {
            const p = periods && periods[span];
            out[span] = p && p.key === keyFn() ? { kills: p.kills, bestScore: p.bestScore || 0 } : { kills: 0, bestScore: 0 };
        }
        return out;
    }

    profile(account) {
        const s = account.stats;
        const clan = account.clan ? this.data.clans[account.clan] : null;
        return {
            id: account.id,
            name: account.name,
            role: account.role,
            clan: clan ? { name: clan.name } : null,
            guest: false,
            kills: s.kills, deaths: s.deaths, damage: s.damage, healing: s.healing,
            wood: s.wood, food: s.food, stone: s.stone, gold: s.gold,
            animalDamage: s.animalDamage, animalKills: s.animalKills,
            bestScore: s.bestScore, maxKills: s.maxKills, lives: s.lives, playtime: s.playtime,
            periods: this.currentPeriods(s.periods),
            socials: account.socials || {}
        };
    }

    top(span) {
        const periodKills = (periods) => {
            if (span === "all") return null;
            const p = periods && periods[span];
            const key = PERIOD_SPANS[span] ? PERIOD_SPANS[span]() : null;
            return p && p.key === key ? p.kills : 0;
        };
        const players = Object.values(this.data.accounts)
            .filter(a => a.name)
            .map(a => ({
                name: a.name,
                kills: span === "all" ? a.stats.kills : periodKills(a.stats.periods),
                clan: a.clan || undefined,
                shadowed: a.verdict === "shadow" || undefined
            }))
            .filter(p => p.kills > 0)
            .sort((a, b) => b.kills - a.kills)
            .slice(0, 10);
        const clans = Object.values(this.data.clans)
            .map(c => ({
                name: c.name,
                kills: span === "all" ? c.stats.kills : periodKills(c.stats.periods),
                members: c.members.length,
                shadowed: c.shadowed || undefined
            }))
            .filter(c => c.kills > 0)
            .sort((a, b) => b.kills - a.kills)
            .slice(0, 10);
        return { players, clans };
    }

    // CLANS
    clanView(clan) {
        const nameOf = (id) => (this.data.accounts[id] || {}).name || "unknown";
        return {
            name: clan.name,
            closed: !!clan.closed,
            members: clan.members.map(m => ({
                name: nameOf(m.id),
                role: m.role,
                stint: m.stint || 1,
                stats: { kills: m.kills || 0, periods: this.currentPeriods(m.periods) }
            })),
            past: (clan.past || []).slice(-20).map(p => ({
                name: nameOf(p.id), stint: p.stint || 1, left: p.left, kicked: !!p.kicked, stats: { kills: p.kills || 0 }
            })),
            stats: { kills: clan.stats.kills, raidKills: clan.stats.raidKills, periods: this.currentPeriods(clan.stats.periods) }
        };
    }

    myClan(account) {
        const clan = account.clan ? this.data.clans[account.clan] : null;
        if (!clan) {
            const invites = Object.values(this.data.clans)
                .flatMap(c => (c.invites || []).filter(i => i.id === account.id).map(i => ({ clan: c.name, by: (this.data.accounts[i.by] || {}).name || "unknown" })));
            return { clan: null, invites };
        }
        const member = clan.members.find(m => m.id === account.id);
        const role = member ? member.role : "member";
        return {
            clan: this.clanView(clan),
            role,
            requests: role !== "member" ? clan.requests.map(id => (this.data.accounts[id] || {}).name || "unknown") : []
        };
    }

    clanAction(account, action, body) {
        const err = (error, status = 400) => ({ status, body: { error } });
        const ok = (body = {}) => ({ status: 200, body });
        if (!account.name) return err("no name");
        const clans = this.data.clans;
        const mine = account.clan ? clans[account.clan] : null;
        const me = mine ? mine.members.find(m => m.id === account.id) : null;
        const rank = me ? { member: 0, officer: 1, owner: 2 }[me.role] : -1;
        const target = body && body.name ? this.nameOwner(body.name) : null;

        const leave = (clan, id, kicked) => {
            const idx = clan.members.findIndex(m => m.id === id);
            if (idx < 0) return;
            const [m] = clan.members.splice(idx, 1);
            clan.past = clan.past || [];
            clan.past.push({ id, stint: m.stint || 1, left: Date.now(), kicked, kills: m.kills || 0 });
            if (this.data.accounts[id]) this.data.accounts[id].clan = null;
        };
        const join = (clan, id) => {
            const prev = (clan.past || []).filter(p => p.id === id).length;
            clan.members.push({ id, role: "member", stint: prev + 1, joinedAt: Date.now(), kills: 0, periods: {} });
            clan.requests = clan.requests.filter(r => r !== id);
            clan.invites = (clan.invites || []).filter(i => i.id !== id);
            this.data.accounts[id].clan = clan.name;
        };

        switch (action) {
            case "mine":
                return ok(this.myClan(account));
            case "create": {
                const name = String(body.name || "").trim();
                if (!CLAN_RE.test(name)) return err("invalid");
                if (isRude(name)) return err("unclean");
                if (mine) return err("in a clan");
                if (Object.keys(clans).some(n => n.toLowerCase() === name.toLowerCase())) return err("taken", 409);
                clans[name] = {
                    name, createdAt: Date.now(), members: [], past: [], invites: [], requests: [], shadowed: false,
                    stats: { kills: 0, raidKills: 0, periods: {} }
                };
                join(clans[name], account.id);
                clans[name].members[0].role = "owner";
                break;
            }
            case "request": {
                const clan = Object.values(clans).find(c => c.name.toLowerCase() === String(body.clan || "").toLowerCase());
                if (!clan) return err("not found", 404);
                if (mine) return err("in a clan");
                if (clan.closed) return err("closed", 403);
                if (clan.members.length >= CLAN_MAX_MEMBERS) return err("full");
                if (!clan.requests.includes(account.id)) clan.requests.push(account.id);
                break;
            }
            case "requests": {
                if (!mine) return err("not found", 404);
                if (rank < 2) return err("rank", 403);
                mine.closed = !body.open;
                if (mine.closed) mine.requests = [];
                break;
            }
            case "answer": {
                const clan = clans[body.clan];
                if (!clan) return err("not found", 404);
                const invited = (clan.invites || []).some(i => i.id === account.id);
                if (!invited) return err("not found", 404);
                if (body.accept) {
                    if (mine) return err("in a clan");
                    if (clan.members.length >= CLAN_MAX_MEMBERS) return err("full");
                    join(clan, account.id);
                } else {
                    clan.invites = clan.invites.filter(i => i.id !== account.id);
                }
                break;
            }
            case "invite": {
                if (rank < 1) return err("rank", 403);
                if (!target) return err("no player", 404);
                if (target.clan) return err("in a clan");
                if (!this.prefsOf(target).clanInvites) return err("no invites", 403);
                mine.invites = (mine.invites || []).filter(i => i.id !== target.id);
                mine.invites.push({ id: target.id, by: account.id });
                break;
            }
            case "decide": {
                if (rank < 1) return err("rank", 403);
                if (!target || !mine.requests.includes(target.id)) return err("no player", 404);
                if (body.accept) {
                    if (target.clan) return err("in a clan");
                    if (mine.members.length >= CLAN_MAX_MEMBERS) return err("full");
                    join(mine, target.id);
                } else {
                    mine.requests = mine.requests.filter(r => r !== target.id);
                }
                break;
            }
            case "kick": {
                const them = target && mine ? mine.members.find(m => m.id === target.id) : null;
                if (!them) return err("no member", 404);
                if (rank < 1 || rank <= { member: 0, officer: 1, owner: 2 }[them.role]) return err("rank", 403);
                leave(mine, target.id, true);
                break;
            }
            case "role": {
                const them = target && mine ? mine.members.find(m => m.id === target.id) : null;
                if (!them) return err("no member", 404);
                if (rank < 2) return err("rank", 403);
                if (body.role === "owner") {
                    them.role = "owner";
                    me.role = "officer";
                } else if (body.role === "officer" || body.role === "member") {
                    them.role = body.role;
                } else return err("invalid");
                break;
            }
            case "leave": {
                if (!mine) return err("not found", 404);
                if (me.role === "owner" && mine.members.length > 1) return err("owner");
                leave(mine, account.id, false);
                if (!mine.members.length) delete clans[mine.name];
                break;
            }
            case "disband": {
                if (!mine) return err("not found", 404);
                if (rank < 2) return err("rank", 403);
                for (const m of [...mine.members]) leave(mine, m.id, false);
                delete clans[mine.name];
                break;
            }
            default:
                return err("not found", 404);
        }
        this.save();
        return ok({});
    }

    // MODERATION
    setRole(name, role) {
        const account = this.nameOwner(name);
        if (!account) return false;
        account.role = role === "admin" || role === "mod" ? role : null;
        this.save();
        return true;
    }

    setVerdict(name, level) {
        const account = this.nameOwner(name);
        if (!account) return false;
        account.verdict = level === "clear" ? null : level;
        this.save();
        return true;
    }

    setClanShadow(name, shadow) {
        const clan = this.data.clans[name];
        if (!clan) return false;
        clan.shadowed = !!shadow;
        this.save();
        return true;
    }

    // FRIENDS (FRVR social). Ids are FRVR ids (account ids); names come from /names-for.
    namesFor(ids) {
        const names = {};
        for (const id of Array.isArray(ids) ? ids.slice(0, 200) : []) {
            const account = this.data.accounts[this.data.legacyIds[id] || id];
            names[id] = account && account.name ? account.name : null;
        }
        return names;
    }

    friendsOf(id) {
        return this.data.social.friends[id] || [];
    }

    areFriends(a, b) {
        return this.friendsOf(a).some(f => f.id === b);
    }

    requestsFor(id) {
        return this.data.social.requests.filter(r => r.recipientId === id);
    }

    requestsFrom(id) {
        return this.data.social.requests.filter(r => r.senderId === id);
    }

    // Returns {status, request?, friends?}: 409 when already friends / already asked.
    createFriendRequest(senderId, recipientId) {
        if (!this.data.accounts[recipientId] || senderId === recipientId) return { status: 404 };
        if (this.areFriends(senderId, recipientId)) return { status: 409 };
        const social = this.data.social;
        if (social.requests.some(r => r.senderId === senderId && r.recipientId === recipientId)) return { status: 409 };
        const reverse = social.requests.find(r => r.senderId === recipientId && r.recipientId === senderId);
        if (reverse) {
            this.answerFriendRequest(recipientId, reverse.id, true);
            return { status: 200, friends: true };
        }
        const request = { id: objectId(), senderId, recipientId, createdAt: new Date().toISOString() };
        social.requests.push(request);
        this.save();
        return { status: 201, request };
    }

    answerFriendRequest(recipientId, requestId, accept) {
        const social = this.data.social;
        const request = social.requests.find(r => r.id === requestId && r.recipientId === recipientId);
        if (!request) return false;
        social.requests = social.requests.filter(r => r !== request && !(r.senderId === request.recipientId && r.recipientId === request.senderId));
        if (accept && !this.areFriends(request.senderId, request.recipientId)) {
            const since = new Date().toISOString();
            (social.friends[request.senderId] = this.friendsOf(request.senderId).slice()).push({ id: request.recipientId, createdAt: since });
            (social.friends[request.recipientId] = this.friendsOf(request.recipientId).slice()).push({ id: request.senderId, createdAt: since });
        }
        this.save();
        return request;
    }

    cancelFriendRequest(senderId, requestId) {
        const social = this.data.social;
        const before = social.requests.length;
        social.requests = social.requests.filter(r => !(r.id === requestId && r.senderId === senderId));
        if (social.requests.length === before) return false;
        this.save();
        return true;
    }

    removeFriend(id, friendId) {
        const social = this.data.social;
        if (!this.areFriends(id, friendId)) return false;
        social.friends[id] = this.friendsOf(id).filter(f => f.id !== friendId);
        social.friends[friendId] = this.friendsOf(friendId).filter(f => f.id !== id);
        this.save();
        return true;
    }

    // DISCORD LINKING: the Discord bot's /link hands out https://moomoo.io/?discord=<code>.
    // Here the admin console stands in for the bot (`discord <username>`).
    createDiscordCode(discordName) {
        const code = randomBytes(12).toString("hex");
        this.discordCodes.set(code, { discord: String(discordName).slice(0, 32), at: Date.now() });
        return code;
    }

    discordCode(code) {
        const entry = this.discordCodes.get(String(code || ""));
        if (!entry) return null;
        if (Date.now() - entry.at > DISCORD_CODE_MS) {
            this.discordCodes.delete(code);
            return null;
        }
        return entry;
    }

    linkDiscord(account, code) {
        if (!account.name) return { status: 400, body: { error: "no name" } };
        const entry = this.discordCode(code);
        if (!entry) return { status: 400, body: { error: "code" } };
        this.discordCodes.delete(code);
        account.discord = { name: entry.discord, linkedAt: Date.now() };
        this.save();
        return { status: 200, body: { ok: true, discord: entry.discord } };
    }

    // OWNER / DEV HELPERS
    accountByEmail(email) {
        const id = this.data.emails[String(email || "").trim().toLowerCase()];
        return id ? this.data.accounts[id] : null;
    }

    accountById(id) {
        return this.data.accounts[this.data.legacyIds[id] || id] || null;
    }
}
