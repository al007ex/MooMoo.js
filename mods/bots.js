/*
 * MooMod Bots — multi-box mouse-following bots for YOUR OWN private MooMoo server.
 * ==============================================================================
 * Educational tool for a private server you own and run (the moomoo-clone). It opens
 * extra, independent game connections ("bots"), signs each into an account, and makes
 * them walk to exactly where your mouse points on the map.
 *
 * How it works (all through the loader's public API, no window globals):
 *   - MooMooLoader.native          the real WebSocket constructor, so the bots' own
 *                                  frames are NOT touched by the loader's send-hook.
 *   - MooMooLoader.endpoint()      host / server key / build / bundle stem of the
 *                                  connection you're already on (so bots join the SAME world).
 *   - MooMooLoader.seal()          the page's code seal (bind mode) — bots fold it into
 *                                  their session key so the server accepts their frames.
 *   - MooMooLoader.protocolModule()the per-deploy protocol (shuffle table + BUILD_ID).
 *   - MooMooLoader._deps.Protocol  ClientSession (tag + mask + seq + seal framing) and
 *     / .Binding                   isHandshake; Binding.incoming to read s2c packets.
 *   - ctx.render.view / ctx.input.mouse   to turn your cursor into a world coordinate.
 *
 * Each bot is a faithful, UNMODIFIED protocol client: it speaks the exact wire the
 * official client does (keyed/masked/sequenced frames, the sealed key, the shuffled
 * packet table) and answers the server's integrity probe "q" with a clean "T" — so the
 * server sees a normal client and never kicks it. There is NO captcha to defeat: on this
 * server a signed-in account skips the guest captcha gate entirely (and the server never
 * verifies a captcha token anyway). The CAPTCHA box below is a passive display — it only
 * surfaces a challenge for YOU to solve if one ever appeared; it never auto-solves one.
 *
 * Connections per IP are capped server-side (we raised it to 10 in the clone's anti-cheat
 * config; the server must be restarted for that to take effect).
 */
(function () {
    "use strict";

    function boot(MooMoo, MooMooLoader) {
        MooMoo.register({
            id: "moomoo-bots",
            name: "MooMod Bots",
            version: "1.0.0",
            description: "Multi-box bots that follow your mouse, for your own private server. Press B.",
            menu: true,
            menuHint: "Open the Bots panel (default B), sign in, and spawn mouse-following bots.",
            liveSettings: true,
            defaultEnabled: true
        }, function (ctx) {
            const win = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
            const doc = (win.document && win.document.createElement) ? win.document : null;
            const Native = MooMooLoader.native || win.WebSocket;   // the UNHOOKED constructor
            const D = MooMooLoader._deps || {};

            const MAX_BOTS = 10;        // matches the server's per-IP cap
            const STOP_R = 18;          // stop this close to the target (world units)
            const FOLLOW_MS = 80;       // how often each bot re-aims at your cursor

            // ---- config (persisted in the loader's hidden store — NEVER the password) ----
            const DEFAULTS = { toggleKey: "b", baseName: "bot", count: 5, serverKey: "", follow: true, spread: 45, autoRespawn: true, email: "" };
            const cfgStore = MooMooLoader.config || null;
            const prefs = Object.assign({}, DEFAULTS);
            try { const got = cfgStore && cfgStore.get("bots"); if (got && typeof got === "object") Object.assign(prefs, got); } catch (e) { /* defaults */ }
            function save() {
                try {
                    if (!cfgStore) return;
                    // password is intentionally omitted — credentials are typed each session.
                    cfgStore.set("bots", {
                        toggleKey: prefs.toggleKey, baseName: prefs.baseName, count: prefs.count,
                        serverKey: prefs.serverKey, follow: prefs.follow, spread: prefs.spread,
                        autoRespawn: prefs.autoRespawn, email: prefs.email
                    });
                } catch (e) { /* ignore */ }
            }
            let password = "";          // held in memory only, never persisted

            const rand = () => Math.random().toString(36).slice(2, 12);
            const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

            // ---- verbose logging of the whole connection process (every step + every error) ----
            const LOG = "[MooMod Bots]";
            const stamp = () => { try { return new Date().toISOString().slice(11, 23); } catch (e) { return ""; } };
            function glog(msg, extra) { try { console.log(LOG + " " + stamp() + " " + msg, extra === undefined ? "" : extra); } catch (e) {} }
            function blog(bot, msg, extra) { try { console.log(LOG + " " + stamp() + " [bot " + (bot ? bot.index : "?") + "] " + msg, extra === undefined ? "" : extra); } catch (e) {} }
            function berr(bot, msg, err) { try { console.error(LOG + " " + stamp() + " [bot " + (bot ? bot.index : "?") + "] ERROR " + msg, err === undefined ? "" : (err && err.stack || err)); } catch (e) {} }

            // ---- the server endpoint we're already connected to (bots join the same world) ----
            function endpoint() {
                const ep = MooMooLoader.endpoint && MooMooLoader.endpoint();
                return ep || null;
            }

            // ---- shared protocol bits (resolved once, reused by every bot) ----
            let shared = null;
            async function ensureShared() {
                if (shared) { glog("protocol/seal already resolved — reusing"); return shared; }
                glog("resolving protocol module + code seal from the loader …");
                const Protocol = D.Protocol, Binding = D.Binding;
                if (!Protocol || !Binding) { glog("ERROR: loader protocol modules unavailable (_deps.Protocol/_deps.Binding missing)"); throw new Error("loader protocol modules unavailable"); }
                let mod, seal;
                try {
                    [mod, seal] = await Promise.all([
                        MooMooLoader.protocolModule ? MooMooLoader.protocolModule() : Promise.reject(new Error("no protocolModule")),
                        MooMooLoader.seal ? MooMooLoader.seal() : Promise.reject(new Error("no seal"))
                    ]);
                } catch (e) { glog("ERROR: protocolModule()/seal() rejected", e && e.stack || e); throw e; }
                if (!mod) { glog("ERROR: protocol module not ready"); throw new Error("protocol module not ready"); }
                if (!seal) { glog("ERROR: code seal not ready (join the game first)"); throw new Error("code seal not ready — spawn into the game first"); }
                shared = { Protocol, Binding, mod, seal };
                glog("protocol + seal resolved", { build: mod && mod.BUILD_ID, sealBytes: seal && seal.length });
                return shared;
            }

            // ---- HTTP: the EXACT calls the official client (FRVR shim + game bundle) makes ----
            // The shim signs in with POST <origin>/api/auth/password {email,password} -> session
            // {token,email,id}; the SDK exposes that token as getAccessToken() and id as getFRVRID().
            // Before joining, the bundle calls freshAccessToken() (refreshes only within 60s of expiry),
            // then POSTs <origin>/api/join {captcha, auth, did, host}. We mirror all of it 1:1:
            // same base (location.origin + "/api"), JSON bodies, "Content-Type: application/json",
            // the field names + order, the moo_did lifecycle, and the 8s abort on /join.
            const API = win.location.origin + "/api";
            function abortAfter(ms) { try { if (typeof AbortSignal !== "undefined" && AbortSignal.timeout) return AbortSignal.timeout(ms); } catch (e) {} return undefined; }
            // JWT expiry in ms — same decode the shim uses (tokenExpiry) for the freshEnough check.
            function jwtExpiryMs(tok) {
                try { const p = String(tok).split(".")[1].replace(/-/g, "+").replace(/_/g, "/"); return (JSON.parse(atob(p)).exp || 0) * 1000; } catch (e) { return 0; }
            }
            // loginToFRVR -> POST /auth/password -> session {token, email, id}
            async function apiLogin(email, pass) {
                glog("auth: POST " + API + "/auth/password", { email: email });
                let r;
                try { r = await fetch(API + "/auth/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: email, password: pass }) }); }
                catch (e) { glog("auth: ERROR fetch failed (server unreachable?)", e && e.message); throw e; }
                const txt = await r.text(); let data = {}; try { data = JSON.parse(txt); } catch (e) { /* non-json */ }
                glog("auth: response " + r.status);
                if (!r.ok) {
                    if (r.status === 403 && (data.error === "captcha" || /captcha|turnstile|challenge/i.test(txt))) { glog("auth: captcha challenge (403) — surfacing in the panel", data); showChallenge({ source: "sign-in", detail: data }); throw new Error("captcha challenge required (surfaced below)"); }
                    glog("auth: FAILED " + r.status, String(data.error || txt).slice(0, 160));
                    throw new Error("sign-in " + r.status + ": " + String(data.error || txt).slice(0, 120));
                }
                if (!data.token) { glog("auth: ERROR no token in response", data); throw new Error("sign-in: no token returned"); }
                glog("auth: ok — session = {token, email, id}", { id: data.id, email: data.email });
                return { token: data.token, email: data.email, id: data.id };   // the client's `session`
            }
            // freshAccessToken(): the client refreshes via /auth/refresh only when the token is within
            // 60s of expiry; a just-issued token (30-day) skips it, so this is a no-op on a fresh login.
            async function freshToken(session) {
                if (jwtExpiryMs(session.token) - Date.now() > 60000) { glog("auth: access token still fresh — no /auth/refresh (matches freshEnough)"); return session.token; }
                glog("auth: POST " + API + "/auth/refresh (token near expiry)");
                try {
                    const r = await fetch(API + "/auth/refresh", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: session.token }) });
                    const d = await r.json().catch(() => ({}));
                    if (r.ok && d.token) { session.token = d.token; session.id = d.id; glog("auth: token refreshed"); }
                    else glog("auth: refresh returned no token — keeping the current one", d);
                } catch (e) { glog("auth: refresh failed — keeping the current token", e && e.message); }
                return session.token;
            }
            // The bundle's join: body {captcha, auth, did, host}. captcha is omitted when signed in, and
            // did is omitted until the server has minted one (then stored, like moo_did). host is the
            // same server address the WS uses (location.host + "/s/" + key; Ge is false on this server).
            async function apiJoin(host, key, accessToken, bot) {
                const body = {};
                body.auth = accessToken;                 // captcha omitted (account); keep client key order: auth, did, host
                if (bot && bot.did) body.did = bot.did;
                body.host = host + "/s/" + key;
                glog("join: POST " + API + "/join", { auth: "(access token)", did: body.did || "(omitted — no moo_did yet)", host: body.host });
                let r;
                try { r = await fetch(API + "/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: abortAfter(8000) }); }
                catch (e) { glog("join: ERROR fetch failed", e && e.message); throw e; }
                const txt = await r.text(); let data = {}; try { data = JSON.parse(txt); } catch (e) { /* non-json */ }
                glog("join: response " + r.status);
                if (!r.ok) {
                    if (r.status === 403 && (data.error === "captcha" || /captcha|turnstile|challenge/i.test(txt))) { glog("join: captcha challenge (403) — surfacing in the panel", data); showChallenge({ source: "join", detail: data }); throw new Error("captcha challenge required (surfaced below)"); }
                    glog("join: FAILED " + r.status, String(data.error || txt).slice(0, 160));
                    throw new Error("join " + r.status + ": " + String(data.error || txt).slice(0, 120));
                }
                if (!data.ticket) { glog("join: ERROR no ticket in response", data); throw new Error("join: no ticket returned"); }
                if (bot && data.did) { bot.did = data.did; glog("join: stored server-minted did (moo_did equivalent)"); }
                glog("join: ticket received (" + String(data.ticket).slice(0, 8) + "…)");
                return data.ticket;   // the client prefixes "tk:" and encodes it in the WS URL
            }

            // ---- the bots ----
            const bots = [];
            let genCounter = 0;

            function makeBot(index, email, pass, serverKey) {
                const bot = {
                    index: index, name: (prefs.baseName || "bot") + " " + index,
                    email: email, status: "starting", sid: -1, alive: false,
                    pos: { x: 0, y: 0 }, health: 100, moving: false,
                    ws: null, session: null, gen: ++genCounter, serverKey: serverKey, error: ""
                };
                bots.push(bot);
                renderList();
                blog(bot, "created (account " + email + ", server /s/" + serverKey + ")");
                connectBot(bot).catch((e) => { berr(bot, "connection process failed", e); if (!bot.closed) { bot.status = "error"; bot.error = String(e && e.message || e); renderList(); } });
                return bot;
            }

            async function connectBot(bot) {
                blog(bot, "step 1/6 — reading the active endpoint");
                const ep = endpoint();
                if (!ep || !ep.host) { berr(bot, "no active connection — join the game first"); throw new Error("no active connection — join the game first"); }
                if (!ep.buildId) { berr(bot, "build id unknown — join the game first"); throw new Error("build id unknown — join the game first"); }
                blog(bot, "endpoint", ep);

                blog(bot, "step 2/6 — resolving protocol + seal");
                await ensureShared();

                bot.status = "signing in"; renderList();
                blog(bot, "step 3/6 — signing in (loginToFRVR)");
                const session = await apiLogin(bot.email, password);

                bot.status = "joining"; renderList();
                blog(bot, "step 4/6 — freshAccessToken() then requesting a join ticket");
                const accessToken = await freshToken(session);        // getAccessToken(), refreshed if near expiry
                const ticket = await apiJoin(ep.host, bot.serverKey, accessToken, bot);

                bot.status = "connecting"; renderList();
                const scheme = ep.secure ? "wss://" : "ws://";
                // EXACT client URL: host/s/<key>?token=<encodeURIComponent("tk:"+ticket)>&b=<BUILD_ID>&u=<stem>
                const url = scheme + ep.host + "/s/" + bot.serverKey + "?token=" + encodeURIComponent("tk:" + ticket) + "&b=" + ep.buildId + "&u=" + ep.stem;
                blog(bot, "step 5/6 — opening WebSocket", url);
                let ws;
                try { ws = new Native(url); } catch (e) { berr(bot, "WebSocket constructor threw", e); throw e; }
                ws.binaryType = "arraybuffer";
                bot.ws = ws;
                ws.addEventListener("open", () => { if (sameGen(bot)) { bot.status = "handshaking"; renderList(); blog(bot, "ws open — waiting for the server handshake"); } });
                ws.addEventListener("message", (ev) => { try { onBotMessage(bot, ev); } catch (e) { berr(bot, "message handler threw", e); } });
                ws.addEventListener("close", (ev) => { blog(bot, "ws close", { code: ev && ev.code, reason: (ev && ev.reason) || "" }); onBotClose(bot, ev); });
                ws.addEventListener("error", () => { berr(bot, "ws error event"); if (sameGen(bot) && bot.status !== "closed" && !bot.alive) { bot.status = "error"; bot.error = bot.error || "socket error"; renderList(); } });
            }

            const sameGen = (bot) => bots.indexOf(bot) >= 0 && !bot.closed;

            function onBotMessage(bot, ev) {
                const bytes = new Uint8Array(ev.data);
                const Protocol = shared.Protocol, Binding = shared.Binding;
                if (!bot.session) {
                    const hs = Protocol.isHandshake(bytes);
                    if (!hs) return;
                    blog(bot, "step 6/6 — handshake received, creating sealed session");
                    try { bot.session = new Protocol.ClientSession(hs[1], shared.mod, { seal: shared.seal }); }
                    catch (e) { berr(bot, "session creation failed", e); bot.status = "error"; bot.error = "session: " + (e && e.message); renderList(); return; }
                    bot.status = "spawning"; renderList();
                    blog(bot, "session created — sending spawn (M)");
                    if (!botFrame(bot, "spawn", { name: bot.name, moofoll: 1, skin: 0 })) berr(bot, "spawn send failed (socket not open?)");
                    return;
                }
                let dec; try { dec = bot.session.decodeS2C(bytes); } catch (e) { if (!bot._decErr) { bot._decErr = true; berr(bot, "frame decode failed (first occurrence)", e); } return; }
                const bind = Binding.incoming[dec.name];
                const payload = bind ? bind.parse(dec.args) : { args: dec.args };
                const event = bind ? bind.event : dec.name;
                if (event === "setup") { bot.sid = payload.sid; bot.alive = true; bot.status = "alive"; bot.error = ""; renderList(); blog(bot, "CONNECTED + spawned — alive as sid " + bot.sid); }
                else if (event === "died") {
                    bot.alive = false; bot.status = "dead"; renderList();
                    blog(bot, "died" + (prefs.autoRespawn ? " — auto-respawning in 600ms" : ""));
                    if (prefs.autoRespawn) setTimeout(() => { if (sameGen(bot) && bot.session) { blog(bot, "respawning (M)"); botFrame(bot, "spawn", { name: bot.name, moofoll: 1, skin: 0 }); } }, 600);
                }
                else if (event === "health" && payload.sid === bot.sid) { bot.health = payload.value; renderHealth(bot); }
                else if (event === "playersUpdate") { for (const p of payload.positions) if (p.sid === bot.sid) { bot.pos.x = p.x; bot.pos.y = p.y; } }
                else if (event === "probes") { blog(bot, "integrity probe 'q' received — answering with a clean 'T' (seq+ledger, like a pinned client)"); try { sendTelemetry(bot, payload.salt); } catch (e) { berr(bot, "telemetry 'T' send failed", e); } }
                else if (event === "disconnect") { berr(bot, "server sent disconnect: " + (payload.reason || "(no reason)")); bot.status = "kicked"; bot.error = payload.reason || ""; renderList(); }
            }

            function onBotClose(bot, ev) {
                if (bot.closed) return;
                if (bot.status !== "removed") {
                    const code = ev && ev.code, reason = (ev && ev.reason) || "";
                    // 4001 = invalid connection. When multi-boxing the usual cause is the per-IP
                    // cap (the server closes with just the code, no reason). Never handshaked +
                    // other bots alive -> almost certainly the IP cap, which counts your client too.
                    if (code === 4001 && !bot.session) { bot.status = "rejected"; bot.error = reason || "per-IP connection cap reached (your own client counts as one too), or the ticket expired"; berr(bot, "rejected before handshake (code 4001) — likely per-IP cap or expired ticket"); }
                    else { bot.status = "closed"; bot.error = code ? ("code " + code + (reason ? " " + reason : "")) : bot.error; blog(bot, "connection closed", { code: code, reason: reason }); }
                }
                bot.alive = false; bot.session = null;
                renderList();
            }

            // Every frame the bot sends is built by the loader's OWN binding — the exact same
            // code that models the official client's frames (keyed/masked/sequenced by ClientSession).
            function botWire(bot, wire, args) {
                if (bot.session && bot.ws && bot.ws.readyState === 1) {
                    try { bot.ws.send(bot.session.encodeC2S(wire, args)); return true; } catch (e) { berr(bot, "send " + wire + " failed", e); return false; }
                }
                return false;
            }
            function botFrame(bot, action, payload) {
                const def = shared && shared.Binding && shared.Binding.outgoing[action];
                if (!def) { berr(bot, "unknown outgoing action: " + action); return false; }
                return botWire(bot, def.wire, def.build(payload || {}));
            }
            // The "T" answer, built exactly like the loader rebuilds the client's own telemetry
            // (binding.telemetry.construct): a clean client reports flags 0, untrusted 0, probeResult 0,
            // plus the seal report, the round's probe salt, and — because this connection is pinned —
            // the running seq + ledger. The bot's socket carries no footprint of its own, so 0s are honest.
            function sendTelemetry(bot, salt) {
                const s = bot.session; if (!s) return false;
                const tctx = { sealReport: s.sealReport, probeSalt: salt };
                if (s.pinned) { tctx.seq = s.lastSeq; tctx.ledger = s.ledger; }
                const args = shared.Binding.telemetry.construct(tctx, { flags: 0, untrusted: 0, probeResult: 0 });
                return botWire(bot, shared.Binding.telemetry.wire, args);
            }

            function removeBot(bot) {
                bot.closed = true; bot.status = "removed"; bot.alive = false;
                try { bot.ws && bot.ws.close(1000); } catch (e) { /* ignore */ }
                const i = bots.indexOf(bot); if (i >= 0) bots.splice(i, 1);
                renderList();
            }
            function stopAll() {
                for (const bot of bots.slice()) { bot.closed = true; try { bot.ws && bot.ws.close(1000); } catch (e) { /* ignore */ } }
                bots.length = 0;
                renderList();
            }

            function spawnBots() {
                glog("Spawn requested");
                const email = (prefs.email || "").trim();
                if (!email) { glog("Spawn aborted: no email entered"); flash("Enter an account email first."); return; }
                if (!password) { glog("Spawn aborted: no password entered"); flash("Enter the account password first."); return; }
                const ep = endpoint();
                if (!ep || !ep.host) { glog("Spawn aborted: no active connection (join the game first)"); flash("Join the game first — no active connection."); return; }
                const key = (prefs.serverKey || ep.serverKey || "LC").trim();
                const want = clamp(prefs.count | 0, 1, MAX_BOTS);
                const room = MAX_BOTS - bots.length;
                const n = Math.min(want, room);
                if (n <= 0) { glog("Spawn aborted: already at the " + MAX_BOTS + "-bot limit"); flash("Already at the " + MAX_BOTS + "-bot limit."); return; }
                let start = 1; for (const b of bots) start = Math.max(start, b.index + 1);
                glog("Spawning " + n + " bot(s) on /s/" + key + " (account " + email + ")");
                for (let i = 0; i < n; i++) makeBot(start + i, email, password, key);
                flash("Spawning " + n + " bot" + (n === 1 ? "" : "s") + " on /s/" + key + " …");
            }

            // ---- follow: every bot walks to exactly where your cursor points on the map ----
            // screen cursor -> world:  worldX = mouse.x / scale + view.left  (inverse of worldToScreen)
            function mouseWorld() {
                const render = ctx.render, input = ctx.input;
                if (!render || !render.view || !input || !input.mouse) return null;
                const v = render.view, m = input.mouse;
                if (!v.scale) return null;
                return { x: m.x / v.scale + v.left, y: m.y / v.scale + v.top };
            }
            let followTimer = null;
            function followTick() {
                if (!prefs.follow) return;
                const target = mouseWorld();
                if (!target) return;
                const live = bots.filter((b) => b.alive && b.session);
                const n = live.length;
                for (let i = 0; i < n; i++) {
                    const bot = live[i];
                    let tx = target.x, ty = target.y;
                    if (prefs.spread > 0 && n > 1) {            // ring the cursor so bots don't stack
                        const a = (i / n) * Math.PI * 2;
                        tx += Math.cos(a) * prefs.spread; ty += Math.sin(a) * prefs.spread;
                    }
                    const dx = tx - bot.pos.x, dy = ty - bot.pos.y, d = Math.hypot(dx, dy);
                    if (d <= STOP_R) { if (bot.moving) { botFrame(bot, "move", {}); bot.moving = false; } }         // arrived -> move with null dir (stop)
                    else { botFrame(bot, "move", { dir: Math.atan2(dy, dx) }); bot.moving = true; }                   // walk toward the cursor
                }
            }
            function startFollow() { if (!followTimer) followTimer = win.setInterval(followTick, FOLLOW_MS); }
            // a light periodic ping per bot, like the real client (keeps the link lively)
            const pingTimer = win.setInterval(() => { for (const b of bots) if (b.alive) botFrame(b, "ping", {}); }, 3000);
            startFollow();

            // =====================================================================
            //  GUI  — class-only (mml- prefix, stripped by the loader's probe
            //  sanitiser) and id-less, so it adds no integrity-probe footprint.
            // =====================================================================
            const CSS = `
            .mml-bots,.mml-bots *{box-sizing:border-box;font-family:'Baloo Paaji',system-ui,sans-serif}
            .mml-bots{position:fixed;left:14px;bottom:14px;z-index:2147483600;width:300px;max-height:78vh;display:none;flex-direction:column;background:#20232b;border:1px solid #2d313c;border-radius:14px;box-shadow:0 14px 40px rgba(0,0,0,.5);color:#e7e9ee;overflow:hidden}
            .mml-bots.open{display:flex}
            .mml-bots .bhead{display:flex;align-items:center;gap:8px;padding:11px 13px;background:#262a34;border-bottom:1px solid #2d313c}
            .mml-bots .btitle{font-size:15px;font-weight:600;flex:1}
            .mml-bots .bclose{cursor:pointer;color:#9aa3b2;font-size:15px;padding:2px 6px;border-radius:7px}
            .mml-bots .bclose:hover{background:#333845;color:#fff}
            .mml-bots .bbody{padding:11px 13px;overflow-y:auto;display:flex;flex-direction:column;gap:9px}
            .mml-bots .bsec{font-size:11px;letter-spacing:.5px;text-transform:uppercase;color:#7c8696;margin:2px 0 -2px}
            .mml-bots .brow{display:flex;align-items:center;gap:8px}
            .mml-bots .brow .bl{font-size:13px;color:#aab2c0;flex:0 0 66px}
            .mml-bots input[type=text],.mml-bots input[type=password],.mml-bots input[type=number]{flex:1;min-width:0;background:#171a21;border:1px solid #2d313c;color:#e7e9ee;border-radius:8px;padding:7px 9px;font-size:13px;outline:none}
            .mml-bots input:focus{border-color:#8fd16a}
            .mml-bots .bbtns{display:flex;gap:8px}
            .mml-bots .bbtn{flex:1;cursor:pointer;text-align:center;border:1px solid #2d313c;background:#2b303b;color:#e7e9ee;border-radius:9px;padding:8px 10px;font-size:13px;font-weight:600}
            .mml-bots .bbtn:hover{background:#333a47}
            .mml-bots .bbtn.go{background:#6abe4a;border-color:#6abe4a;color:#13300f}
            .mml-bots .bbtn.go:hover{background:#78cf57}
            .mml-bots .bbtn.stop{background:#b64a4a;border-color:#b64a4a;color:#2a0d0d}
            .mml-bots .bbtn.stop:hover{background:#c85a5a}
            .mml-bots .btoggle{display:flex;align-items:center;gap:8px;font-size:13px;color:#cfd5df;cursor:pointer}
            .mml-bots .bsw{width:34px;height:19px;border-radius:12px;background:#3a3f4b;position:relative;transition:background .13s;flex:0 0 auto}
            .mml-bots .bsw.on{background:#6abe4a}
            .mml-bots .bsw i{position:absolute;top:2px;left:2px;width:15px;height:15px;border-radius:50%;background:#fff;transition:left .13s}
            .mml-bots .bsw.on i{left:17px}
            .mml-bots input[type=range]{flex:1;accent-color:#6abe4a}
            .mml-bots .blist{display:flex;flex-direction:column;gap:5px;max-height:190px;overflow-y:auto}
            .mml-bots .bitem{display:flex;align-items:center;gap:7px;background:#191c23;border:1px solid #262a33;border-radius:8px;padding:6px 8px;font-size:12px}
            .mml-bots .bitem .bn{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
            .mml-bots .bitem .bst{flex:0 0 auto;color:#9aa3b2}
            .mml-bots .bitem .bst.alive{color:#8fd16a}
            .mml-bots .bitem .bst.bad{color:#e07a7a}
            .mml-bots .bitem .bx{cursor:pointer;color:#7c8696;padding:0 3px}
            .mml-bots .bitem .bx:hover{color:#e07a7a}
            .mml-bots .bempty{color:#6c7585;font-size:12px;text-align:center;padding:10px 0}
            .mml-bots .bcap{border:1px dashed #3a3f4b;border-radius:10px;padding:9px;display:flex;flex-direction:column;gap:7px}
            .mml-bots .bcap .bcs{font-size:12px;color:#9aa3b2}
            .mml-bots .bcap img,.mml-bots .bcap canvas{width:100%;border-radius:6px;background:#0d0f13;display:block}
            .mml-bots .bnote{font-size:11px;color:#6c7585;line-height:1.5}
            .mml-bots .bflash{font-size:12px;color:#e8c56b;min-height:15px}
            .mml-blauncher{position:fixed;left:14px;bottom:14px;z-index:2147483590;cursor:pointer;background:#2b303b;border:1px solid #3a3f4b;color:#e7e9ee;border-radius:11px;padding:7px 12px;font-size:12px;font-weight:600;font-family:'Baloo Paaji',system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.4);opacity:.82}
            .mml-blauncher:hover{opacity:1;background:#333a47}
            .mml-bots-hidden{display:none !important}
            `;

            let root = null, launcher = null, listEl = null, flashEl = null, capEl = null, built = false, open = false;
            function mk(tag, cls, text) { const n = doc.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
            function flash(msg) { if (flashEl) flashEl.textContent = msg || ""; }

            function toggleSwitch(get, set) {
                const sw = mk("div", "bsw" + (get() ? " on" : ""));
                sw.appendChild(mk("i"));
                sw.addEventListener("click", () => { set(!get()); sw.classList.toggle("on", get()); save(); });
                return sw;
            }
            function switchRow(label, get, set) {
                const row = mk("label", "btoggle");
                row.appendChild(toggleSwitch(get, set));
                row.appendChild(mk("span", null, label));
                return row;
            }
            function textField(label, type, get, set, ph) {
                const row = mk("div", "brow");
                row.appendChild(mk("span", "bl", label));
                const inp = mk("input"); inp.type = type; if (ph) inp.placeholder = ph; inp.value = get() || "";
                inp.addEventListener("input", () => set(inp.value));
                row.appendChild(inp);
                return row;
            }

            function buildPanel() {
                if (built || !doc || !doc.body || !doc.head) return built;
                const style = mk("style"); style.textContent = CSS; doc.head.appendChild(style);

                root = mk("div", "mml-bots");
                const head = mk("div", "bhead");
                head.appendChild(mk("span", "btitle", "MooMod Bots"));
                const close = mk("div", "bclose", "✕"); close.addEventListener("click", closePanel); head.appendChild(close);
                root.appendChild(head);

                const body = mk("div", "bbody");

                body.appendChild(mk("div", "bsec", "Account"));
                body.appendChild(textField("Email", "text", () => prefs.email, (v) => { prefs.email = v; save(); }, "you@example.com"));
                body.appendChild(textField("Password", "password", () => password, (v) => { password = v; }, "account password"));

                body.appendChild(mk("div", "bsec", "Bots"));
                const srvCount = mk("div", "brow");
                srvCount.appendChild(mk("span", "bl", "Server"));
                const srvInp = mk("input"); srvInp.type = "text"; srvInp.placeholder = "LC"; srvInp.style.flex = "1";
                srvInp.value = prefs.serverKey || ""; srvInp.addEventListener("input", () => { prefs.serverKey = srvInp.value.trim(); save(); });
                srvCount.appendChild(srvInp);
                srvCount.appendChild(mk("span", "bl", "Count"));
                const cntInp = mk("input"); cntInp.type = "number"; cntInp.min = "1"; cntInp.max = String(MAX_BOTS); cntInp.style.flex = "0 0 56px";
                cntInp.value = String(clamp(prefs.count | 0, 1, MAX_BOTS));
                cntInp.addEventListener("input", () => { prefs.count = clamp(parseInt(cntInp.value, 10) || 1, 1, MAX_BOTS); save(); });
                srvCount.appendChild(cntInp);
                body.appendChild(srvCount);
                body.appendChild(mk("div", "bnote", "Leave Server blank to auto-use the world you're on. New emails auto-register on this server."));

                const btns = mk("div", "bbtns");
                const spawn = mk("div", "bbtn go", "Spawn"); spawn.addEventListener("click", spawnBots); btns.appendChild(spawn);
                const stop = mk("div", "bbtn stop", "Stop all"); stop.addEventListener("click", stopAll); btns.appendChild(stop);
                body.appendChild(btns);
                flashEl = mk("div", "bflash"); body.appendChild(flashEl);

                body.appendChild(mk("div", "bsec", "Follow"));
                body.appendChild(switchRow("Follow my mouse", () => prefs.follow, (v) => { prefs.follow = v; }));
                body.appendChild(switchRow("Auto-respawn", () => prefs.autoRespawn, (v) => { prefs.autoRespawn = v; }));
                const spreadRow = mk("div", "brow");
                spreadRow.appendChild(mk("span", "bl", "Spread"));
                const rng = mk("input"); rng.type = "range"; rng.min = "0"; rng.max = "300"; rng.step = "5"; rng.value = String(prefs.spread | 0);
                const spreadVal = mk("span", "bl"); spreadVal.style.flex = "0 0 42px"; spreadVal.style.textAlign = "right"; spreadVal.textContent = (prefs.spread | 0) + "u";
                rng.addEventListener("input", () => { prefs.spread = parseInt(rng.value, 10) || 0; spreadVal.textContent = prefs.spread + "u"; save(); });
                spreadRow.appendChild(rng); spreadRow.appendChild(spreadVal);
                body.appendChild(spreadRow);

                body.appendChild(mk("div", "bsec", "Bots running"));
                listEl = mk("div", "blist"); body.appendChild(listEl);

                body.appendChild(mk("div", "bsec", "Captcha"));
                capEl = mk("div", "bcap"); body.appendChild(capEl);
                const simRow = mk("div", "bbtns");
                const sim = mk("div", "bbtn", "Simulate a challenge"); sim.addEventListener("click", simulateChallenge); simRow.appendChild(sim);
                body.appendChild(simRow);
                clearChallenge();

                body.appendChild(mk("div", "bnote", "IP limit raised to 10 (restart the server to apply). For your own private server — educational use."));

                root.appendChild(body);
                doc.body.appendChild(root);

                launcher = mk("div", "mml-blauncher", "⦿ Bots");
                launcher.addEventListener("click", togglePanel);
                doc.body.appendChild(launcher);

                built = true;
                renderList();
                ctx.onCleanup(() => { try { style.remove(); } catch (e) {} try { root.remove(); } catch (e) {} try { launcher.remove(); } catch (e) {} built = false; open = false; });
                return true;
            }

            function openPanel() { if (!buildPanel()) return; open = true; root.classList.add("open"); if (launcher) launcher.classList.add("mml-bots-hidden"); flash(endpoint() ? "" : "Join the game first."); }
            function closePanel() { if (root) { open = false; root.classList.remove("open"); if (launcher) launcher.classList.remove("mml-bots-hidden"); } }
            function togglePanel() { open ? closePanel() : openPanel(); }

            function renderList() {
                if (!listEl) return;
                listEl.textContent = "";
                if (!bots.length) { listEl.appendChild(mk("div", "bempty", "No bots yet — Spawn to add some.")); return; }
                for (const bot of bots) {
                    const row = mk("div", "bitem");
                    row.appendChild(mk("span", "bn", bot.name + (bot.sid >= 0 ? " · #" + bot.sid : "")));
                    const bad = /error|kicked|closed|removed|full|rejected/.test(bot.status);
                    const st = mk("span", "bst" + (bot.alive ? " alive" : bad ? " bad" : ""), bot.alive ? "alive" : bot.status);
                    if (bot.error) st.title = bot.error;
                    bot._stEl = st;
                    row.appendChild(st);
                    const x = mk("span", "bx", "✕"); x.title = "disconnect"; x.addEventListener("click", () => removeBot(bot));
                    row.appendChild(x);
                    listEl.appendChild(row);
                }
            }
            function renderHealth(bot) { /* health tracked; status row already shows alive */ }

            // ---- captcha display (surface only — never auto-solved) ----
            function clearChallenge() {
                if (!capEl) return;
                capEl.textContent = "";
                capEl.appendChild(mk("div", "bcs", "No challenge. Signed-in bots skip the captcha gate on this server."));
            }
            function showChallenge(info) {
                if (!buildPanel()) return;
                openPanel();
                capEl.textContent = "";
                capEl.appendChild(mk("div", "bcs", "Challenge from " + (info.source || "server") + " — solve it yourself, then retry. (Not auto-solved.)"));
                if (info.image) { const img = mk("img"); img.src = info.image; capEl.appendChild(img); }
                else if (info.canvas) { capEl.appendChild(info.canvas); }
                else { capEl.appendChild(mk("div", "bcs", "The server asked for a captcha token (" + JSON.stringify(info.detail || {}).slice(0, 80) + ").")); }
                const row = mk("div", "brow");
                const inp = mk("input"); inp.type = "text"; inp.placeholder = "type the answer"; row.appendChild(inp);
                capEl.appendChild(row);
                const btns = mk("div", "bbtns");
                const submit = mk("div", "bbtn go", "Submit");
                submit.addEventListener("click", () => { flash(inp.value ? "Answer noted — retry Spawn." : "Enter the answer first."); if (inp.value) clearChallenge(); });
                const dismiss = mk("div", "bbtn", "Dismiss"); dismiss.addEventListener("click", clearChallenge);
                btns.appendChild(submit); btns.appendChild(dismiss);
                capEl.appendChild(btns);
            }
            // A drawn, obviously-fake challenge so you can see how a real one would look here.
            function simulateChallenge() {
                const c = doc.createElement("canvas"); c.width = 260; c.height = 70;
                const g = c.getContext("2d");
                g.fillStyle = "#101319"; g.fillRect(0, 0, c.width, c.height);
                const txt = Math.random().toString(36).slice(2, 7).toUpperCase();
                for (let i = 0; i < txt.length; i++) {
                    g.save();
                    g.translate(26 + i * 44, 44 + (Math.random() * 10 - 5));
                    g.rotate((Math.random() - 0.5) * 0.5);
                    g.font = "bold 34px monospace";
                    g.fillStyle = "hsl(" + Math.floor(Math.random() * 360) + ",60%,70%)";
                    g.fillText(txt[i], 0, 0);
                    g.restore();
                }
                for (let i = 0; i < 6; i++) { g.strokeStyle = "rgba(255,255,255,.25)"; g.beginPath(); g.moveTo(Math.random() * c.width, Math.random() * c.height); g.lineTo(Math.random() * c.width, Math.random() * c.height); g.stroke(); }
                showChallenge({ source: "simulation", canvas: c });
            }

            // ---- toggle key ----
            let unbindKey = null;
            function bindKey() {
                if (unbindKey) { try { unbindKey(); } catch (e) {} unbindKey = null; }
                if (ctx.input && ctx.input.onKey && prefs.toggleKey) unbindKey = ctx.input.onKey(prefs.toggleKey, () => togglePanel(), { preventDefault: true });
            }
            bindKey();

            if (doc) (function waitBody() { if (!built) { buildPanel() || win.setTimeout(waitBody, 120); } })();
            ctx.onCleanup(() => { try { win.clearInterval(followTimer); } catch (e) {} try { win.clearInterval(pingTimer); } catch (e) {} try { if (unbindKey) unbindKey(); } catch (e) {} stopAll(); });

            ctx.log("MooMod Bots ready — press " + (prefs.toggleKey || "B").toUpperCase() + " (or the ⦿ Bots button) to open.");
        });
    }

    // Fetch the loader's API through its event handshake — there is no window.MooMoo.
    const w = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
    function connect() {
        let mm = null, ld = null;
        try { w.dispatchEvent(new CustomEvent("moomoo.js:api", { detail: { resolve: (m, l) => { mm = m; ld = l; } } })); } catch (e) {}
        if (mm) { boot(mm, ld); return true; }
        return false;
    }
    if (connect()) return;
    let tries = 0;
    const iv = setInterval(() => { if (connect() || ++tries > 200) clearInterval(iv); }, 50);
    if (w.addEventListener) w.addEventListener("moomoo.js:ready", () => { if (connect()) clearInterval(iv); });
})();
