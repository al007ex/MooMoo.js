/*
 * moomoo.js loader — CORE
 * =======================
 * Wires everything together, in the page's own JS context:
 *   - installs the undetectable WebSocket proxy (anticheat.js)
 *   - on the game socket: reads the io-init handshake, derives the session keys
 *     from the page's moomoo-protocol module (exactly like the client), then
 *   - decodes server->client frames and hands them to the runtime as events
 *   - OWNS the client->server stream: re-encodes every frame with its own gap-
 *     free sequence (so mods can inject packets) and scrubs the "T" telemetry
 *     (the anti-cheat bypass safety net)
 *   - exposes window.MooMoo (the stable API) and window.MooMooLoader (diagnostics)
 *
 * Buffering: if a frame arrives before the keys are ready, it is queued and
 * processed in order the moment the session is set up — the game never stalls
 * and the sequence never desyncs. If the protocol module can't be resolved at
 * all, the loader falls back to pure pass-through so the game still works.
 */
(function (root, factory) {
    const deps = (typeof require === "function" && typeof module === "object")
        ? {
            Protocol: require("./net/protocol.js"),
            Msgpack: require("./net/msgpack.js"),
            Binding: require("./net/binding.js"),
            Socket: require("./net/socket.js"),
            Outgoing: require("./net/outgoing.js"),
            Runtime: require("./core/runtime.js"),
            Api: require("./core/api.js"),
            ModsTab: require("./core/modstab.js"),
            Notice: require("./core/notice.js"),
            AntiDetect: require("./core/antidetect.js"),
            GameData: require("../../shared/gamedata.js"),
            Input: require("./game/input.js"),
            Objects: require("./game/objects.js"),
            Combat: require("./game/combat.js"),
            Store: require("./game/store.js"),
            Render: require("./game/render.js"),
            Pathfind: require("./game/pathfind.js")
        }
        : null;
    const value = factory(deps);
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooLoaderCore = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooLoaderCore = value;
})(typeof self !== "undefined" ? self : this, function (nodeDeps) {
    "use strict";

    const VERSION = "1.3.3";

    // The event a mod dispatches to fetch the API ({ detail: { resolve(MooMoo, MooMooLoader) } }),
    // and the signal the loader fires once that handshake is live so a mod that loaded first can
    // retry. Neither the event name nor the listener is visible to any integrity-probe kind, so
    // the API leaves no window footprint. (See loader/build.mjs for the matching dedup.)
    const RENDEZVOUS = "moomoo.js:api";
    const READY = "moomoo.js:ready";

    // Resolve dependencies either from Node require (tests), an explicit namespace
    // passed by the bundle (opts.deps — the private object every module attaches to,
    // so nothing lands on window), or, as a fallback, page globals.
    function resolveDeps(win, opts) {
        if (nodeDeps) return nodeDeps;
        const g = (opts && opts.deps) || win || (typeof globalThis !== "undefined" ? globalThis : {});
        return {
            Protocol: g.MooMooProtocol,
            Msgpack: g.MooMooMsgpack,
            Binding: g.MooMooBinding,
            Socket: g.MooMooSocket,
            Outgoing: g.MooMooOutgoing,
            Runtime: g.MooMooRuntime,
            Api: g.MooMooApi,
            ModsTab: g.MooMooModsTab,
            Notice: g.MooMooNotice,
            AntiDetect: g.MooMooAntiDetect,
            GameData: g.MooMooGameData,
            Input: g.MooMooInput,
            Objects: g.MooMooObjects,
            Combat: g.MooMooCombat,
            Store: g.MooMooStore,
            Render: g.MooMooRender,
            Pathfind: g.MooMooPathfind
        };
    }

    // Default: resolve the per-deploy module the same way the client does.
    function defaultResolveProtocol(win) {
        const doc = win.document;
        // 1) bare specifier through the page's import map
        const tryBare = () => win.eval
            ? win.eval('import("moomoo-protocol")')
            : import(/* webpackIgnore: true */ "moomoo-protocol");
        // 2) read the import map ourselves and import the resolved URL
        const tryMap = () => {
            try {
                const tags = doc.querySelectorAll('script[type="importmap"]');
                for (const tag of tags) {
                    const map = JSON.parse(tag.textContent || "{}");
                    const spec = map && map.imports && map.imports["moomoo-protocol"];
                    if (spec) {
                        const url = new URL(spec, doc.baseURI).href;
                        return win.eval ? win.eval('import("' + url + '")') : import(/* webpackIgnore: true */ url);
                    }
                }
            } catch (e) { /* fall through */ }
            return Promise.reject(new Error("moomoo-protocol not in any import map"));
        };
        return Promise.resolve().then(tryBare).catch(tryMap);
    }

    // Read one bare specifier out of the page's import map (e.g. "moomoo-seal").
    function readImportMapSpec(win, name) {
        try {
            const doc = win.document;
            const tags = doc.querySelectorAll('script[type="importmap"]');
            for (const tag of tags) {
                const map = JSON.parse(tag.textContent || "{}");
                const spec = map && map.imports && map.imports[name];
                if (spec) return spec;
            }
        } catch (e) { /* ignore */ }
        return null;
    }

    // The client bundle the page is running: /assets/index-<stem>.js (the server hashes the
    // exact bytes it serves there to build the seal, so fetching the same URL reproduces it).
    function findClientBundleUrl(win) {
        try {
            const doc = win.document;
            const scripts = doc.querySelectorAll('script[type="module"][src]');
            for (const s of scripts) {
                if (/\/assets\/index-[\w-]+\.js(\?|$)/.test(s.getAttribute("src") || "")) {
                    return new URL(s.src, doc.baseURI).href;
                }
            }
        } catch (e) { /* ignore */ }
        return null;
    }

    // The code seal for this page: sealBytes (the "moomoo-seal" import's hex file name) XOR
    // SHA-256(bundle)[0..16]. Independent of the connection, so it is computed once and cached.
    // Resolves to a 16-byte Uint8Array, or null when it can't be built (then a bind-mode
    // connection falls back to pure pass-through — the game still works, mods just can't inject).
    function computeSeal(win, Protocol) {
        const sealSpec = readImportMapSpec(win, "moomoo-seal");
        const bundleUrl = findClientBundleUrl(win);
        if (!sealSpec || !bundleUrl || !win.fetch) return Promise.resolve(null);
        const m = /([0-9a-fA-F]{32})/.exec(sealSpec);   // /p/<32 hex>.js -> 16 seal bytes
        if (!m) return Promise.resolve(null);
        const sealBytes = Protocol.hexToBytes(m[1]);
        return win.fetch(bundleUrl, { credentials: "same-origin", cache: "no-cache" })
            .then((r) => r.arrayBuffer())
            .then((buf) => {
                const digest = Protocol.sha256(new Uint8Array(buf)).subarray(0, 16);
                return Protocol.sealValue(sealBytes, digest);
            })
            .catch(() => null);
    }

    function toBytes(data) {
        if (data instanceof Uint8Array) return data;
        if (data instanceof ArrayBuffer) return new Uint8Array(data);
        if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView && ArrayBuffer.isView(data)) {
            return new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
        }
        // Duck-type an ArrayBuffer (covers cross-realm buffers: a typed-array
        // ctor accepts any real ArrayBuffer regardless of which realm it came
        // from, even though `instanceof` is realm-specific).
        const tag = Object.prototype.toString.call(data);
        if (tag === "[object ArrayBuffer]") return new Uint8Array(data);
        if (data && data.buffer && Object.prototype.toString.call(data.buffer) === "[object ArrayBuffer]") {
            return new Uint8Array(data.buffer, data.byteOffset || 0, data.byteLength);
        }
        return null; // strings / Blobs -> not our binary protocol
    }

    function createLoader(win, options) {
        const opts = options || {};
        const D = resolveDeps(win, opts);
        if (!D.Protocol || !D.Binding || !D.Runtime || !D.Socket) {
            throw new Error("moomoo.js loader: missing dependencies (bundle not assembled?)");
        }
        // Protocol resolution precedence: explicit option > page-provided hook
        // (window.__moomooResolveProtocol, handy if the server doesn't name the
        // import-map module "moomoo-protocol") > default import-map lookup.
        const resolveProtocol = opts.resolveProtocol
            || (typeof win.__moomooResolveProtocol === "function" ? win.__moomooResolveProtocol : null)
            || (() => defaultResolveProtocol(win));
        const binding = D.Binding;
        const telemetry = binding.telemetry;
        // Cancels the client's "T" detection packet and sends an empty one in its place
        // (see core/antidetect.js). Exposed on MooMooLoader.antiDetect.
        const antiDetect = D.AntiDetect
            ? D.AntiDetect.create({ telemetry })
            : { enabled: true, handle: (args, ctx) => telemetry.scrub(args, ctx) };

        const diag = { version: VERSION, buildId: null, resolvedProtocol: false, sockets: 0, failedProtocol: false };
        const rawTaps = new Set();      // fn(dir, name, args)
        const errorSink = (e) => { try { console.error("%c[moomoo.js]", "color:#e66", "loader error:", e); } catch (_) {} };

        let modPromise = null;
        function getProtocolModule() {
            if (modPromise) return modPromise;
            modPromise = Promise.resolve().then(resolveProtocol).then((mod) => {
                diag.resolvedProtocol = true;
                diag.buildId = mod && mod.BUILD_ID || null;
                return mod;
            });
            // Do not cache a rejection: allow a later attempt to retry.
            modPromise.catch(() => { modPromise = null; });
            return modPromise;
        }

        // The code seal (sealBytes ^ SHA-256(bundle)[0..16]) for this page. The import map and
        // the bundle <script> may not be in the DOM yet when the loader installs at
        // document-start, so a first attempt can come back null; we cache only a SUCCESS and
        // let any other call retry once the page has finished parsing.
        let sealValueCache = null;
        let sealInFlight = null;
        function getSeal() {
            if (sealValueCache) return Promise.resolve(sealValueCache);
            if (sealInFlight) return sealInFlight;
            sealInFlight = computeSeal(win, D.Protocol).then((seal) => {
                sealInFlight = null;
                if (seal) { sealValueCache = seal; diag.sealReady = true; }
                return seal;
            });
            sealInFlight.catch(() => { sealInFlight = null; });
            return sealInFlight;
        }
        // getSeal() with a few short retries, for bind mode where we must have it.
        function getSealReady(tries) {
            return getSeal().then((seal) => {
                if (seal || tries <= 0) return seal;
                return new Promise((r) => setTimeout(r, 150)).then(() => getSealReady(tries - 1));
            });
        }

        let active = null; // the adopted game socket's state

        // Rate governor + packet accounting + ping (see outgoing.js).
        const out = D.Outgoing ? D.Outgoing.createOutgoing({ rateLimits: binding.rateLimits }) : null;

        // ---- runtime + sink ----
        // Self input mirror: the combat engine needs the player's own current move
        // direction (the bundle's `Dn`) and aim to predict self position. We capture
        // them as they are sent so the engine reads the same values the client has.
        const selfInput = { moveDir: null, aimDir: 0 };
        const sink = {
            sendAction(action, payload) {
                const bind = binding.outgoing[action];
                if (!bind) { console.warn("%c[moomoo.js]", "color:#e66", "unknown action: " + action); return false; }
                if (action === "move") selfInput.moveDir = (payload && payload.dir === undefined) ? null : (payload ? payload.dir : null);
                else if (action === "stopMove") selfInput.moveDir = null;
                else if (action === "aim" && payload && typeof payload.dir === "number") selfInput.aimDir = payload.dir;
                return sendWire(active, bind.wire, bind.build(payload || {}));
            },
            sendRaw(wire, args) { return sendWire(active, wire, args || []); }
        };
        const MooMoo = D.Runtime.createRuntime({
            version: VERSION,
            sink,
            loaderInfo: diag
        });

        // ---- compatibility watchdog + on-join notice (needs a real DOM) ----
        // Watches the live connection against what this loader was built to speak
        // (binding.contract) and shows the appropriate MooMoo-style popup: a quick
        // "thanks for using it" on a clean join, a warning when something looks off, or a
        // hard "loader out of date" refusal (which drops the socket) when it is certain the
        // loader can no longer keep up. Headless test runs have no document, so it stays null.
        let notice = null;
        if (D.Notice && win.document) {
            try {
                notice = D.Notice.create({
                    win,
                    version: VERSION,
                    diag,
                    contract: binding.contract,
                    // Hard mismatch -> cut the connection so the player can't get flagged/banned.
                    onRefuse: () => { try { if (active && active.ws) active.ws.close(4999, "moomoo.js loader out of date"); } catch (e) { /* ignore */ } }
                });
                // Show the welcome card on the MAIN MENU (a loading/welcome screen), not in-game.
                notice.watchMenu();
            } catch (e) { errorSink(e); notice = null; }
        }

        // ---- game-specific extensions: input, combat/game helpers, config menu ----
        // Input needs the DOM; in headless tests there's none, so it stays null and
        // helpers degrade gracefully (aim-at-mouse etc. just no-op).
        let input = null;
        if (win.document && D.Input) {
            try { input = D.Input.installInput(win); } catch (e) { errorSink(e); }
        }
        // The world object manager tracks buildings/resources from the wire; the
        // combat features read it. Build it before helpers so they can expose it.
        let objects = null;
        if (D.Objects && D.GameData) {
            try { objects = D.Objects.createObjectManager({ MooMoo, data: D.GameData }); }
            catch (e) { errorSink(e); }
        }
        // Owned / equipped hats + accessories (the bundle's Nn/On/$t/Zt + equip()).
        let store = null;
        if (D.Store && D.GameData) {
            try { store = D.Store.createStore({ MooMoo, data: D.GameData }); }
            catch (e) { errorSink(e); }
        }
        // The combat engine reconstructs per-player prediction/reload/bull state on
        // every server tick (the bundle's updatePlayers). Features read it as ctx.combat.
        let combat = null;
        if (D.Combat && D.GameData) {
            try { combat = D.Combat.createCombat({ MooMoo, data: D.GameData, objects, input, selfInput, net: out }); }
            catch (e) { errorSink(e); }
        }
        // Overlay canvases + a replica of the stock camera/interpolation, so mods
        // can draw in line with the official (WebGL) picture or replace it.
        let render = null;
        if (D.Render) {
            try { render = D.Render.createRender({ win, MooMoo, config: combat ? combat.K : null, onError: errorSink }); }
            catch (e) { errorSink(e); }
        }
        // A* pathfinder (worker pool), exposed as ctx.path.
        let pathfinder = null;
        if (D.Pathfind) {
            try { pathfinder = D.Pathfind.createPathfinder({ win }); }
            catch (e) { errorSink(e); }
        }
        // Inject the combat/placement/targeting verbs into every mod's ctx.
        if (D.Api && D.GameData) {
            try {
                const ext = D.Api.createHelpers({ MooMoo, input, data: D.GameData, objects, combat, net: out, store, render, pathfinder });
                MooMoo._setCtxExtensions(ext);
            } catch (e) { errorSink(e); }
        }

        function tapRaw(dir, name, args) {
            if (!rawTaps.size) return;
            for (const fn of rawTaps) { try { fn(dir, name, args); } catch (e) { /* ignore */ } }
        }

        // ---- outgoing (client -> server), loader-owned ----
        // Every frame that actually leaves: count it (governor stats, ping timing)
        // and tell mods (MooMoo.onSent).
        function noteSent(wire, args, source) {
            if (out) {
                out.record(wire);
                if (wire === "0") out.onPingSent();
            }
            const pb = binding.outgoingParse && binding.outgoingParse[wire];
            if (pb && MooMoo._notifySent) {
                let payload; try { payload = pb.parse(args || []); } catch (e) { payload = { args }; }
                MooMoo._notifySent(pb.action, payload, source);
            }
        }

        // ANTI-NO-OP GUARD (private-server stealth).
        // The server silently ignores — no strike, no effect — any packet that
        // doesn't fit the current game state: selecting an item or weapon you
        // don't own, equipping a hat/accessory you don't own, or acting while
        // dead (server/src/network/packets.js). The official client never emits
        // those, so one on the wire is a fingerprint even though it costs no
        // strike. We refuse to put one there from ANY mod, mirroring the server's
        // own accept conditions against the loader's mirrored state (MooMoo.self /
        // store / game data). Conservative: it only drops when that state is
        // authoritative; on anything it cannot verify it lets the frame through,
        // so it never turns a would-be-valid action into a dropped one.
        function wouldNoOp(wire, args) {
            const me = MooMoo.self;
            if (!me) return false;
            switch (wire) {
                case "z": {                            // selectItem [index, isWeapon]
                    if (!me.alive) return true;        // ignored while dead
                    const index = args[0];
                    if (typeof index !== "number") return false;   // malformed: let the server judge it
                    if (args[1]) {                     // a weapon: must be the one held in its slot
                        const w = D.GameData.weapon(index);
                        if (!w) return true;
                        return !(Array.isArray(me.weapons) && me.weapons[w.type] === index);
                    }
                    if (!D.GameData.item(index)) return true;      // not a real item id
                    return !(Array.isArray(me.items) && me.items.indexOf(index) >= 0);  // not owned
                }
                case "F":                              // mouse (attack / place / eat)
                case "9":                              // move
                case "D":                              // aim
                case "e":                              // reset move
                    return !me.alive;                  // every one is a no-op while dead
                case "c": {                            // store [action (0=equip, 1=buy), id, isTail]
                    if (!me.alive) return true;
                    const action = args[0], id = args[1], isTail = !!args[2];
                    if (typeof id !== "number") return false;
                    if (action === 0 && id === 0) return false;    // equip 0 = take off, always valid
                    if (!store) return false;                      // no store mirror -> don't guess
                    const owns = isTail ? store.ownsTail : store.ownsHat;
                    if (!owns) return false;
                    if (action === 0) return !owns(id);            // equip: must own it
                    if (action === 1) return owns(id);             // buy: already owned = a no-op
                    return false;
                }
                default:
                    return false;
            }
        }

        function sendWire(st, wire, args) {
            if (!st || st.ignore) { console.warn("%c[moomoo.js]", "color:#e66", "no active game socket to send on"); return false; }
            if (st.ready) {
                if (wouldNoOp(wire, args)) return false;               // the server would silently ignore it (stealth)
                if (out && !out.allow(wire)) return false;             // would overflow a server bucket
                const bytes = st.session.encodeC2S(wire, args);
                tapRaw("out", wire, args);
                st.nativeSend(bytes);
                noteSent(wire, args, "mod");
                return true;
            }
            if (st.failed) { console.warn("%c[moomoo.js]", "color:#e66", "cannot inject packets without the protocol key"); return false; }
            st.outQueue.push({ kind: "inject", wire, args });
            return true;
        }

        // Transform applied to every frame the client tries to send.
        function makeSendTransform(st) {
            return function (data /*, nativeSend */) {
                if (st.ignore || !st.handshaked) return data;       // not the game socket yet -> pass through
                if (st.failed) return data;                          // no keys -> pass through
                if (!st.ready) { st.outQueue.push({ kind: "client", data: toBytes(data) || data }); return undefined; }
                return reencodeClientFrame(st, toBytes(data) || data);
            };
        }

        // The context the telemetry scrub needs: the seal report + latest probe salt, and —
        // on a pinned connection — our re-encoded stream's current seq and running ledger, read
        // LIVE right before the "T" is encoded (so they are the values as they stand just before
        // the T body, which is exactly what the server compares against).
        function telemetryCtx(st) {
            const ctx = { sealReport: st.session && st.session.sealReport, probeSalt: st.lastProbeSalt };
            if (st.session && st.session.pinned) { ctx.seq = st.session.lastSeq; ctx.ledger = st.session.ledger; }
            return ctx;
        }

        // Returns the bytes to send, or undefined to drop the frame entirely. A
        // dropped frame never consumes a sequence number, so the stream stays
        // gap-free.
        function reencodeClientFrame(st, bytes) {
            let dec;
            try { dec = st.session.decodeC2S(bytes); }
            catch (e) { errorSink(e); return bytes; } // fail open
            try {
                let name = dec.name, args = dec.args;
                if (name === telemetry.wire) {
                    // Compat: the real client (unmodified, the server's own build) just told us
                    // how many "T" fields this server expects. If that outgrows what we build,
                    // the loader is out of date and would be flagged — the watchdog escalates.
                    if (notice) notice.recordClientTelemetry(Array.isArray(args) ? args.length : 0);
                    // ANTI-CHEAT BYPASS: cancel the client's "T" and send an empty one we build
                    // ourselves (clean detection fields + our own seq/ledger). The client's "T"
                    // content never reaches the wire.
                    args = antiDetect.handle(args, telemetryCtx(st));
                }
                // Let mods inspect / rewrite / drop what the official client sends.
                const pb = binding.outgoingParse && binding.outgoingParse[name];
                if (pb && MooMoo._filterOutgoing && name !== telemetry.wire) {
                    const payload = pb.parse(args);
                    const res = MooMoo._filterOutgoing(pb.action, payload, { source: "client", wire: name, args: args.slice() });
                    if (res === null) return undefined;                    // a mod dropped it
                    if (res !== payload) {
                        const ob = binding.outgoing[pb.action];
                        if (ob) args = ob.build(res);
                    }
                }
                if (out && !out.allow(name)) return undefined;          // would overflow a server bucket
                tapRaw("out", name, args);
                const enc = st.session.encodeC2S(name, args);          // our own gap-free seq
                noteSent(name, args, "client");
                return enc;
            } catch (e) {
                errorSink(e);
                return st.session.encodeC2S(dec.name, dec.name === telemetry.wire ? telemetry.scrub(dec.args, telemetryCtx(st)) : dec.args);
            }
        }

        // ---- incoming (server -> client), read-only observer ----
        function handleIncoming(st, rawData) {
            if (st.ignore) return;
            const bytes = toBytes(rawData);
            if (!bytes) { if (!st.handshaked) st.ignore = true; return; }

            if (!st.handshaked) {
                const hs = D.Protocol.isHandshake(bytes);
                if (!hs) { st.ignore = true; return; }                 // some other socket
                st.handshaked = true;
                adopt(st, hs[1]);
                return;
            }
            if (!st.ready) { st.inQueue.push(bytes.slice()); return; }  // keys not ready yet -> buffer
            processS2C(st, bytes);
        }

        function processS2C(st, bytes) {
            let dec;
            try { dec = st.session.decodeS2C(bytes); }
            catch (e) { errorSink(e); if (notice) notice.recordS2CError(); return; }
            // Compat: feed the decoded packet (name null = an id with no name in our table).
            if (notice) notice.recordS2C(dec.name, dec.id);
            // Remember the latest integrity-probe salt so the telemetry answer can echo it
            // even if the client's own "T" ever arrives without it.
            if (dec.name === "q" && Array.isArray(dec.args)) st.lastProbeSalt = dec.args[0];
            const bind = binding.incoming[dec.name];
            tapRaw("in", dec.name, dec.args);
            if (!bind) return; // unknown packet: still visible via raw tap
            let payload;
            try { payload = bind.parse(dec.args); }
            catch (e) { errorSink(e); return; }
            if (bind.event === "pong" && out) {
                const ms = out.onPong();
                if (ms != null) payload.ms = ms;
            }
            MooMoo._dispatch(bind.event, payload);
        }

        // Called when a socket's first frame is an io-init: set up the session.
        function adopt(st, payload) {
            active = st;
            // Compat: the io-init handshake shape (field count) is the first thing we can check.
            if (notice) notice.recordIoInit(Array.isArray(payload) ? payload.length : 0);
            if (MooMoo._reset) MooMoo._reset();
            if (out) out.reset();
            if (store) store.reset();
            if (objects && objects.newConnection) objects.newConnection();   // new socket = fresh world (objects survive death, not reconnect)
            // Field 6 of io-init: the seal mode. Bind mode folds the seal into the session
            // key, so we must have it before encoding a single frame; otherwise pass through.
            const sealMode = (payload && payload[5]) | 0;
            const needSeal = sealMode === D.Protocol.SEAL_BIND || sealMode === D.Protocol.SEAL_REPORT;
            Promise.all([getProtocolModule(), needSeal ? getSealReady(6) : Promise.resolve(null)]).then(([mod, seal]) => {
                if (sealMode === D.Protocol.SEAL_BIND && !seal) {
                    errorSink(new Error("loader: bundle seal unavailable; cannot own this connection, passing through"));
                    becomeFailed(st);
                    return;
                }
                try {
                    st.session = new D.Protocol.ClientSession(payload, mod, { seal });
                } catch (e) {
                    errorSink(e);
                    becomeFailed(st);
                    return;
                }
                st.ready = true;
                // Drain buffered incoming frames in order (advances the s2c counter correctly).
                const inq = st.inQueue; st.inQueue = [];
                for (const f of inq) processS2C(st, f);
                // Drain buffered outgoing (client frames + injected) in call order.
                const outq = st.outQueue; st.outQueue = [];
                for (const item of outq) {
                    if (item.kind === "client") { const b = reencodeClientFrame(st, item.data); if (b !== undefined) st.nativeSend(b); }
                    else {
                        try {
                            if (out && !out.allow(item.wire)) continue;
                            st.nativeSend(st.session.encodeC2S(item.wire, item.args)); tapRaw("out", item.wire, item.args);
                            noteSent(item.wire, item.args, "mod");
                        } catch (e) { errorSink(e); }
                    }
                }
                MooMoo._setReady(true);
                try { win.dispatchEvent(new win.Event("moomoo:ready")); } catch (e) { /* non-DOM env */ }
            }).catch((e) => {
                errorSink(e);
                becomeFailed(st);
            });
        }

        // Protocol module unavailable: give up owning the stream, keep the game alive.
        function becomeFailed(st) {
            diag.failedProtocol = true;
            st.failed = true;
            // Flush any buffered client frames as ORIGINAL bytes (keeps client seq intact).
            const outq = st.outQueue; st.outQueue = [];
            for (const item of outq) if (item.kind === "client") st.nativeSend(item.data);
            // Injected packets can't be sent without the key; drop them.
            console.warn("%c[moomoo.js]", "color:#e66", "protocol module unavailable; mods are read-disabled on this connection");
        }

        // ---- socket adoption plumbing ----
        function onSocket(ws) {
            diag.sockets++;
            const st = {
                ws, handshaked: false, ready: false, failed: false, ignore: false,
                session: null, inQueue: [], outQueue: [],
                nativeSend: (d) => sock.nativeSend(ws, d)
            };
            // passive read hook
            try { ws.addEventListener("message", (ev) => handleIncoming(st, ev.data)); }
            catch (e) { errorSink(e); }
            // active send hook — the transform is kept in a WeakMap keyed by the socket,
            // never written to the socket object.
            sock.setTransform(ws, makeSendTransform(st));
        }

        const sock = D.Socket.installWebSocketProxy(win, onSocket, errorSink);
        const native = sock.native;

        // ---- diagnostics surface ----
        const MooMooLoader = {
            version: VERSION,
            native,
            diag,
            onRaw(fn) { rawTaps.add(fn); return () => rawTaps.delete(fn); },
            sendRaw: (wire, args) => sink.sendRaw(wire, args),
            active: () => active && { ready: active.ready, failed: active.failed, buildId: diag.buildId }
        };

        // NO window global. The loader hands its API to mods through an event handshake,
        // so there is no MooMoo* property for the server's integrity scan to find — not by
        // enumeration (getOwnPropertyNames / Object.keys / Reflect.ownKeys), not by the `in`
        // operator, not by direct access. A mod dispatches the RENDEZVOUS event with a
        // resolve callback; we hand it (MooMoo, MooMooLoader) synchronously. The event name
        // and the listener are invisible to every integrity-probe kind. (Internal modules stay
        // reachable for diagnostics/tests under MooMooLoader._deps.)
        try { Object.defineProperty(MooMooLoader, "_deps", { value: D, enumerable: false, configurable: true }); } catch (e) { /* ignore */ }
        try {
            win.addEventListener(RENDEZVOUS, function (e) {
                try { const d = e && e.detail; if (d && typeof d.resolve === "function") d.resolve(MooMoo, MooMooLoader); } catch (_) {}
            }, false);
        } catch (e) { errorSink(e); }

        MooMooLoader.antiDetect = antiDetect;   // the detection-packet canceller (toggle + log)
        MooMooLoader.input = input;
        MooMooLoader.gameData = D.GameData || null;
        MooMooLoader.objects = objects;
        MooMooLoader.net = out;
        MooMooLoader.store = store;
        MooMooLoader.combat = combat;
        MooMooLoader.render = render;

        // In-game Mods menu (only in a real page; skipped in headless tests).
        if (D.ModsTab && win.document) {
            try { MooMooLoader.menu = D.ModsTab.installMenu(win, MooMoo); }
            catch (e) { errorSink(e); }
        }
        // Warm up the protocol module + the bundle seal so the first connection is instant.
        try { getProtocolModule().catch(() => {}); } catch (e) { /* ignore */ }
        try { getSeal().catch(() => {}); } catch (e) { /* ignore */ }

        // Tell any mod that loaded before us that the handshake is open now.
        try { win.dispatchEvent(new win.Event(READY)); } catch (e) { /* non-DOM env */ }

        return { MooMoo, MooMooLoader };
    }

    return { createLoader, VERSION };
});
