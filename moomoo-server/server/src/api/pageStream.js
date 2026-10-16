// PAGE STREAM
// The client keeps one Server-Sent Events connection open per page (ti.start in the client):
//   POST /api/page/ticket {auth}  -> {t}  short-lived ticket for a signed-in page
//   GET  /api/page/stream?t=<t>          the stream itself (no ticket = signed out)
// Events, each a JSON object:
//   hello    {bundle, notice}              on connect: the bundle being served, the site notice
//   bundle   {name}                        a new client bundle is out ("Game updated")
//   notice   {text, until}                 site-wide notice under the menu
//   count    {server, n}                   live player count of a server
//   event    {kind: "boss"|"clan_top", server, by?, clan?}   news from other servers
//   friend   {id, name, server}            a friend joined ("" = left) a game
//   clan-on  {name, server}                a clanmate joined / left a game
//   chat     {id, n?, kind, from, to?, text, at, system?}   whispers and clan chat
//   invite   {from: {name}, server, as}    "come to my server"

import express from "express";
import { randomBytes } from "node:crypto";

const TICKET_MS = 60 * 1000;
const KEEPALIVE_MS = 25 * 1000;

export class PageStream {

    constructor({ store, bundle, log }) {
        this.store = store;
        this.bundle = bundle;
        this.log = log;
        this.tickets = new Map();     // ticket -> {accountId, at}
        this.pages = new Set();       // {res, accountId}
        this.notice = null;           // {text, until}
        setInterval(() => {
            for (const page of this.pages) page.res.write(": keepalive\n\n");
        }, KEEPALIVE_MS).unref();
    }

    issueTicket(account) {
        const t = randomBytes(16).toString("hex");
        this.tickets.set(t, { accountId: account.id, at: Date.now() });
        return t;
    }

    open(req, res) {
        let accountId = null;
        const ticket = this.tickets.get(String(req.query.t || ""));
        if (ticket) {
            this.tickets.delete(String(req.query.t));
            if (Date.now() - ticket.at < TICKET_MS) accountId = ticket.accountId;
        }
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no"
        });
        const page = { res, accountId };
        this.pages.add(page);
        const current = this.bundle ? this.bundle.current() : null;
        this.write(page, "hello", { bundle: current ? current.stem : null, notice: this.activeNotice() });
        req.on("close", () => this.pages.delete(page));
    }

    write(page, event, data) {
        page.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    }

    // everyone with the page open
    broadcast(event, data) {
        for (const page of this.pages) this.write(page, event, data);
    }

    // pages of these accounts only
    sendTo(accountIds, event, data) {
        const ids = new Set(accountIds);
        for (const page of this.pages) if (page.accountId && ids.has(page.accountId)) this.write(page, event, data);
    }

    online(accountId) {
        for (const page of this.pages) if (page.accountId === accountId) return true;
        return false;
    }

    activeNotice() {
        return this.notice && this.notice.until > Date.now() ? this.notice : null;
    }

    setNotice(text, minutes) {
        this.notice = text ? { text: String(text).slice(0, 200), until: Date.now() + minutes * 60 * 1000 } : null;
        this.broadcast("notice", this.notice || {});
    }

    announceBundle() {
        const current = this.bundle ? this.bundle.current() : null;
        if (current) this.broadcast("bundle", { name: current.stem });
    }

    router() {
        const router = express.Router();
        router.post("/page/ticket", express.json({ limit: "8kb" }), (req, res) => {
            const account = this.store.verifyToken(req.body && req.body.auth);
            if (!account) return res.status(403).json({ error: "auth" });
            res.json({ t: this.issueTicket(account) });
        });
        router.get("/page/stream", (req, res) => this.open(req, res));
        return router;
    }
}
