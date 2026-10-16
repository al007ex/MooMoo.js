// ANTICHEAT
// Server half of the official client's anti-tamper system plus the server-side checks
// that sit behind the transport. One AntiCheat instance is attached to every connection.

import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { ANTICHEAT_CONFIG as CONFIG } from "./config.js";
import { CLOSE, SEAL_OFF } from "../protocol/constants.js";
import { saltedHash } from "../protocol/crypto.js";

const SHAME_HAT = 45;

// "client reported SOCKET_HOOKED" -> "SOCKET_HOOKED", "12 untrusted input events" -> "UNTRUSTED_EVENTS"
function signalName(reason) {
    const m = /reported ([A-Z_]+)/.exec(reason);
    if (m) return m[1];
    if (reason.includes("untrusted")) return "UNTRUSTED_EVENTS";
    return reason.replace(/[^a-z]+/gi, "_").toUpperCase().slice(0, 32);
}

// TOKEN BUCKET:
class Bucket {
    constructor([perSecond, burst]) {
        this.rate = perSecond / 1000;
        this.capacity = burst;
        this.tokens = burst;
        this.updated = Date.now();
    }
    take(now) {
        this.tokens = Math.min(this.capacity, this.tokens + (now - this.updated) * this.rate);
        this.updated = now;
        if (this.tokens < 1) return false;
        this.tokens -= 1;
        return true;
    }
}

// MODERATION STORE (reports, anticheat flags, verdicts, bans):
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export class ModerationStore {

    constructor(dataDir) {
        this.dataDir = dataDir;
        fs.mkdirSync(dataDir, { recursive: true });
        this.reportsFile = path.join(dataDir, CONFIG.storage.reports);
        this.bansFile = path.join(dataDir, CONFIG.storage.bans);
        this.recordsFile = path.join(dataDir, "moderation.json");
        this.bans = { ips: {}, accounts: {}, devices: {} };
        this.records = {};
        try {
            this.bans = Object.assign(this.bans, JSON.parse(fs.readFileSync(this.bansFile, "utf8")));
        } catch {}
        try {
            this.records = JSON.parse(fs.readFileSync(this.recordsFile, "utf8"));
        } catch {}
        this.bans.devices = this.bans.devices || {};
    }

    // Account ids that AccountStore.migrateIds() replaced.
    migrateIds(remap) {
        if (!remap || !Object.keys(remap).length) return;
        for (const [from, to] of Object.entries(remap)) {
            if (this.records[from]) {
                this.records[to] = this.records[from];
                delete this.records[from];
            }
            if (this.bans.accounts[from]) {
                this.bans.accounts[to] = this.bans.accounts[from];
                delete this.bans.accounts[from];
            }
        }
        this.saveRecords();
        this.saveBans();
    }

    saveBans() {
        fs.writeFileSync(this.bansFile, JSON.stringify(this.bans, null, 2));
    }

    saveRecords() {
        fs.writeFileSync(this.recordsFile, JSON.stringify(this.records, null, 2));
    }

    record(accountId) {
        return this.records[accountId] || (this.records[accountId] = { reports: [], flags: [], verdict: null });
    }

    // The ban that applies (expired timed bans are dropped), or null.
    banEntry(ip, accountId, did) {
        const now = Date.now();
        const candidates = [["ips", ip], ["accounts", accountId], ["devices", did]];
        let changed = false;
        let found = null;
        for (const [kind, key] of candidates) {
            const entry = key && this.bans[kind][key];
            if (!entry) continue;
            if (entry.until && entry.until <= now) {
                delete this.bans[kind][key];
                changed = true;
                continue;
            }
            if (!found || (found.until && (!entry.until || entry.until > found.until))) found = entry;
        }
        if (changed) this.saveBans();
        return found;
    }

    isBanned(ip, accountId, did) {
        return Boolean(this.banEntry(ip, accountId, did));
    }

    // until: ms timestamp for a timed ban, 0 / undefined = permanent.
    ban({ ip, did, accountId, name, reason, until }, by) {
        const entry = { name, by: by ? by.name : "system", reason: reason || undefined, until: until || undefined, at: new Date().toISOString() };
        if (ip) this.bans.ips[ip] = entry;
        if (did) this.bans.devices[did] = entry;
        if (accountId) this.bans.accounts[accountId] = entry;
        this.saveBans();
    }

    unbanAccount(accountId) {
        delete this.bans.accounts[accountId];
        this.saveBans();
    }

    unbanIp(ip, did) {
        if (ip) delete this.bans.ips[ip];
        if (did) delete this.bans.devices[did];
        this.saveBans();
    }

    // KICK COOLDOWN: after a kick the same account / device / ip can't rejoin for a while
    // (/join answers {error: "locked", seconds}).
    lock({ ip, did, accountId }, seconds) {
        this.locks = this.locks || new Map();
        const until = Date.now() + seconds * 1000;
        for (const key of [ip && "ip:" + ip, did && "did:" + did, accountId && "acc:" + accountId]) {
            if (key) this.locks.set(key, Math.max(until, this.locks.get(key) || 0));
        }
    }

    unlock({ ip, did, accountId }) {
        if (!this.locks) return;
        for (const key of [ip && "ip:" + ip, did && "did:" + did, accountId && "acc:" + accountId]) {
            if (key) this.locks.delete(key);
        }
    }

    lockedFor(ip, accountId, did) {
        if (!this.locks) return 0;
        const now = Date.now();
        let until = 0;
        for (const key of [ip && "ip:" + ip, did && "did:" + did, accountId && "acc:" + accountId]) {
            const t = key && this.locks.get(key);
            if (t && t > now) until = Math.max(until, t);
        }
        return until ? Math.ceil((until - now) / 1000) : 0;
    }

    // In-game "Report" button (packet R). The reason ("What for?") arrives as a second
    // R packet and is attached to this report.
    report({ target, reporter, sessionReports }) {
        const entry = {
            at: Date.now(),
            by: { name: reporter.name, kind: reporter.account ? "account" : "guest" },
            sessionReports
        };
        fs.appendFileSync(this.reportsFile, JSON.stringify({
            at: new Date(entry.at).toISOString(),
            target: { name: target.name, account: target.account ? target.account.id : null, flags: target.anticheat ? target.anticheat.summary() : null },
            reporter: { name: reporter.name, account: reporter.account ? reporter.account.id : null }
        }) + "\n");
        if (target.account) {
            this.record(target.account.id).reports.push(entry);
            this.saveRecords();
        } else {
            (target.reportLog = target.reportLog || []).push(entry);
        }
        return entry;
    }

    reportReason({ target, reporter, entry, reason }) {
        entry.reason = reason;
        fs.appendFileSync(this.reportsFile, JSON.stringify({
            at: new Date().toISOString(),
            reason,
            target: { name: target.name, account: target.account ? target.account.id : null },
            reporter: { name: reporter.name, account: reporter.account ? reporter.account.id : null }
        }) + "\n");
        if (target.account) this.saveRecords();
    }

    // Anticheat signal on a signed-in player.
    flag(accountId, signal) {
        if (!accountId) return;
        this.record(accountId).flags.push({ at: Date.now(), signal });
        this.saveRecords();
    }

    // keepBans: the ban entry was already written (timed bans).
    recordVerdict(account, level, reason, staff, { keepBans = false } = {}) {
        const rec = this.record(account.id);
        rec.verdict = level === "clear" ? null : { level, reason, by: staff.name, at: Date.now() };
        if (level === "ban" && !keepBans) this.ban({ accountId: account.id, name: account.name, reason }, staff);
        if (level === "clear") this.unbanAccount(account.id);
        this.saveRecords();
    }

    // Response for POST /mod/player (staff panel on a profile).
    playerRecord(account, session) {
        const rec = this.record(account.id);
        const weekAgo = Date.now() - WEEK_MS;
        const signals = (list) => list.reduce((acc, f) => (acc[f.signal] = (acc[f.signal] || 0) + 1, acc), {});
        const weekFlags = rec.flags.filter(f => f.at >= weekAgo);
        return {
            reports: {
                session: session ? session.reports : 0,
                week: rec.reports.filter(r => r.at >= weekAgo).length,
                lifetime: rec.reports.length
            },
            flags: {
                week: { total: weekFlags.length, signals: signals(weekFlags) },
                lifetime: { total: rec.flags.length, signals: signals(rec.flags) }
            },
            verdict: rec.verdict ? { level: rec.verdict.level, reason: rec.verdict.reason } : null,
            session: session ? { at: session.at, server: session.server, ip: session.ipHash } : null,
            recent: rec.reports.slice(-5).reverse().map(r => ({ by: r.by, at: r.at, reason: r.reason }))
        };
    }

    // Same shape for a guest (no account): only this session is known.
    guestRecord(player, session) {
        const names = player.anticheat ? [...player.anticheat.flagNames].map(signalName) : [];
        const signals = names.reduce((acc, n) => (acc[n] = (acc[n] || 0) + 1, acc), {});
        const reports = player.reportLog || [];
        return {
            reports: { session: player.reports || 0, week: reports.length, lifetime: reports.length },
            flags: {
                week: { total: names.length, signals },
                lifetime: { total: names.length, signals }
            },
            verdict: player.shadowed ? { level: "shadow", reason: "" } : null,
            session: session ? { at: session.at, server: session.server, ip: session.ipHash } : null,
            recent: reports.slice(-5).reverse().map(r => ({ by: r.by, at: r.at, reason: r.reason }))
        };
    }
}

// One round of integrity probes: a fresh salt and up to `perRound` probes in a shuffled
// order, as sent in "q". `rules[i]` is the config entry behind bit i of the answer.
function probeRound() {
    const salt = randomBytes(4).readUInt32LE(0);
    const pool = CONFIG.probes.list.slice();
    for (let i = pool.length - 1; i > 0; i--) {
        const j = randomBytes(1)[0] % (i + 1);
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const rules = pool.slice(0, CONFIG.probes.perRound);
    const probes = rules.map(rule => [rule.kind, rule.path || "", rule.value === undefined ? 0 : saltedHash(String(rule.value), salt)]);
    return { salt, probes, rules };
}

export class AntiCheat {

    // session: the connection's ProtocolSession (seal mode / expected seal report);
    // sendProbes(salt, probes) sends "q".
    constructor({ player, log, kick, close, store, session, sendProbes }) {
        this.player = player;
        this.log = log;
        this.kickFn = kick;
        this.closeFn = close;
        this.store = store;
        this.session = session || null;
        this.sendProbes = sendProbes || null;
        this.global = new Bucket(CONFIG.rateLimits.global);
        this.buckets = {};
        this.strikes = 0;
        this.strikeTime = Date.now();
        this.flags = 0;
        this.flagNames = new Set();
        this.untrustedEvents = 0;
        this.lastTelemetry = 0;
        this.joinedAt = 0;
        this.nextProbeAt = 0;
        this.pending = null;      // the "q" round waiting for its "T"
        this.rounds = 0;
        this.answered = 0;
        this.closed = false;
    }

    // ACTIONS:
    apply(action, reason) {
        if (this.closed) return;
        switch (action) {
            case "close":
                this.log(`close (${reason})`);
                this.closed = true;
                this.closeFn(CLOSE.INVALID_CONNECTION);
                break;
            case "kick":
                this.log(`kick (${reason})`);
                this.closed = true;
                if (this.store) this.store.lock({ ip: this.player.ip, did: this.player.did, accountId: this.player.account && this.player.account.id }, CONFIG.kickLock.anticheatSeconds);
                this.kickFn("kicked");
                break;
            case "shame":
                this.log(`shame (${reason})`);
                this.player.shameTimer = CONFIG.shame.durationMs;
                this.player.skinIndex = SHAME_HAT;
                break;
            case "flag":
                if (!this.flagNames.has(reason)) {
                    this.log(`flag (${reason})`);
                    if (this.store && this.player.account) this.store.flag(this.player.account.id, signalName(reason));
                }
                this.flagNames.add(reason);
                this.player.flagged = true;
                break;
            default:
                break;
        }
    }

    // TRANSPORT ERRORS (bad tag, replay, unknown id, malformed):
    onTransportError(error, detail) {
        const key = {
            "bad tag": "badTag",
            "bad sequence": "badSequence",
            "unknown packet id": "unknownPacket",
            "malformed body": "malformed",
            "short frame": "malformed",
            "bad arguments": "malformed"
        }[error] || "malformed";
        this.apply(CONFIG.transport[key], `${error}${detail ? ": " + detail : ""}`);
    }

    // STRIKES:
    strike(count, reason) {
        const now = Date.now();
        const decay = Math.floor((now - this.strikeTime) / CONFIG.rateLimits.strikeDecayMs);
        if (decay > 0) {
            this.strikes = Math.max(0, this.strikes - decay);
            this.strikeTime = now;
        }
        this.strikes += count;
        if (this.strikes >= CONFIG.rateLimits.strikesToKick) {
            this.apply("kick", `too many strikes (last: ${reason})`);
        }
    }

    // RATE LIMIT (returns false when the packet must be dropped):
    allow(name) {
        const now = Date.now();
        if (!this.global.take(now)) {
            this.strike(1, "global packet rate");
            return false;
        }
        const limit = CONFIG.rateLimits.packets[name];
        if (!limit) return true;
        const bucket = this.buckets[name] || (this.buckets[name] = new Bucket(limit));
        if (!bucket.take(now)) {
            this.strike(1, `rate of "${name}"`);
            return false;
        }
        return true;
    }

    // INVALID INPUT:
    invalid(name, why) {
        this.strike(CONFIG.validation.strikesPerInvalid, `invalid "${name}": ${why}`);
    }

    // TELEMETRY: the server asks ("q"), the client answers ("T").
    onGameStart() {
        if (this.joinedAt) return;
        this.joinedAt = Date.now();
        this.nextProbeAt = this.joinedAt + CONFIG.telemetry.firstProbeMs;
    }

    // "T" = [flags, untrustedEvents, probeResult, seal, probeSalt]
    onTelemetry(args) {
        const [flags, untrusted, result, seal, salt] = args;
        if (!Number.isInteger(flags) || flags < 0 || flags > 255 || !Number.isInteger(untrusted) || untrusted < 0) {
            this.invalid("T", "bad telemetry values");
            return;
        }
        if (!this.pending || (salt >>> 0) !== this.pending.salt) {
            // only ever sent in answer to "q", with that round's salt
            this.invalid("T", "telemetry without a probe round");
            return;
        }
        const round = this.pending;
        this.pending = null;
        this.answered++;
        this.lastTelemetry = Date.now();
        this.nextProbeAt = this.lastTelemetry + CONFIG.telemetry.intervalMs;

        this.flags |= flags;
        for (const [bit, rule] of Object.entries(CONFIG.telemetry.flags)) {
            if (flags & Number(bit)) this.apply(rule.action, `client reported ${rule.name}`);
        }
        this.untrustedEvents = untrusted;
        if (untrusted >= CONFIG.telemetry.untrustedEvents.threshold) {
            this.apply(CONFIG.telemetry.untrustedEvents.action, `${untrusted} untrusted input events`);
        }
        if (Number.isInteger(result) && result > 0) {
            round.rules.forEach((rule, i) => {
                if (result & (1 << i)) this.apply(rule.action, `client reported ${rule.name} (probe ${rule.kind} ${rule.path || ""}${rule.value !== undefined ? " " + rule.value : ""})`);
            });
        }
        if (this.session && this.session.sealMode !== SEAL_OFF && seal !== this.session.sealReport) {
            this.apply(CONFIG.seal.mismatchAction, `client reported SEAL_MISMATCH (${seal == null ? "no seal" : "modified bundle"})`);
        }
        // Frame ledger: "T" also reports [seq, ledger] as they were just before this frame
        // (the client captures them before sending "T"). They must match the server's own
        // running hash of the c2s frame stream, so a forged / replayed / injected frame shows.
        const reportedSeq = args[5], reportedLedger = args[6];
        if (this.session && this.session.pinned && reportedSeq !== undefined) {
            const okSeq = Number.isInteger(reportedSeq) && reportedSeq === this.session.lastSeq - 1;
            const okLedger = Number.isInteger(reportedLedger) && (reportedLedger >>> 0) === (this.session.ledgerBefore >>> 0);
            if (!okSeq || !okLedger) {
                this.apply(CONFIG.telemetry.ledger.mismatchAction, `client reported LEDGER_MISMATCH (seq ${reportedSeq}/${this.session.lastSeq - 1}, hash ${reportedLedger >>> 0}/${this.session.ledgerBefore >>> 0})`);
            }
        }
    }

    // Called every server tick.
    tick(now) {
        if (this.closed || !CONFIG.telemetry.required || !this.joinedAt || !this.sendProbes) return;
        const t = CONFIG.telemetry;
        if (this.pending) {
            if (now - this.pending.sentAt > t.answerMs) {
                this.apply(t.missingAction, this.rounds > 1 ? "telemetry stopped answering probes" : "telemetry never answered");
            }
            return;
        }
        if (now >= this.nextProbeAt) {
            const round = probeRound();
            this.pending = { salt: round.salt, rules: round.rules, sentAt: now };
            this.rounds++;
            this.sendProbes(round.salt, round.probes);
        }
    }

    summary() {
        return {
            flags: this.flags,
            flagNames: [...this.flagNames],
            untrustedEvents: this.untrustedEvents,
            strikes: this.strikes,
            probes: { sent: this.rounds, answered: this.answered, lastAnswer: this.lastTelemetry }
        };
    }
}

export { CONFIG as ANTICHEAT_CONFIG };
