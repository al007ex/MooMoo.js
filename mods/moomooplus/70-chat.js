            // =====================================================================
            // CHAT LOG + PING — the bundle's log panel b() (300-410), receiveChat's
            // logging (13190), the ping loop ey() (16617) and its display (16594).
            // =====================================================================
            const CHATLOG_CSS = `
 .chat-container {
     position: fixed;
     top: 0;
     left: 0;
     width: 400px;
     height: 250px;
     background: rgba(0, 0, 0, .0);
     color: white;
     opacity: 1;
     font-family: 'Norican', cursive;
     font-weight: bold;
     border-bottom-right-radius: 8px;
     padding: 10px;
     display: flex;
     flex-direction: column;
     justify-content: space-between;
     z-index: 5;
     pointer-events: none;
 }
 .chat-container .chat-history, .chat-container .chat-input { pointer-events: auto; }
 .chat-history {
     height: 400px;
     overflow-y: auto;
     scrollbar-width: thin;
     scrollbar-color: rgba(255, 255, 255, 0.2) rgba(0, 0, 0, 0.5);
 }
 .chat-input {
     height: 30px;
     background-color: rgba(255, 255, 255, 0);
     border: none;
     border-radius: 4px;
     outline: none;
     color: white;
     padding: 5px;
 }
.scroll-button {
    position: fixed;
    top: 220px;
    left: 380px;
    border-radius: 100%;
    width: 30px;
    height: 30px;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 6;
    transition: box-shadow 0.5s ease-in-out;
}
.scroll-button:hover {
    background-color: rgba(0, 0, 0, 0.8);
    box-shadow: 0 0 10px cyan, 0 0 20px cyan, 0 0 30px cyan;
}
 .scroll-button::before {
     content: "";
     width: 0;
     height: 0;
     border-top: 10px solid white;
     border-left: 7px solid transparent;
     border-right: 7px solid transparent;
     position: absolute;
     top: 50%;
     left: 50%;
     transform: translate(-50%, -50%);
 }
`;
            // The panel is built as soon as there is a document body. Lines logged
            // before that are kept and written in order once it exists.
            let chatLog = null;
            const chatBacklog = [];
            const be = 2e3;
            function buildChatLog() {
                if (chatLog || !doc || !doc.body || !doc.head) return !!chatLog;
                const me = doc.createElement("style");
                me.textContent = CHATLOG_CSS;
                doc.head.appendChild(me);
                const ge = doc.createElement("div");
                ge.className = "scroll-button";
                const ye = doc.createElement("div");
                ye.className = "chat-container";
                const xe = doc.createElement("div");
                xe.className = "chat-history";
                const we = doc.createElement("input");
                we.type = "text";
                we.className = "chat-input";
                we.placeholder = "To chat click here or press / key";
                we.maxLength = 100;
                ye.appendChild(xe);
                ye.appendChild(we);
                doc.body.appendChild(ge);
                doc.body.appendChild(ye);
                ge.addEventListener("click", () => { xe.scrollTop = xe.scrollHeight; });
                xe.addEventListener("scroll", ke);
                ge.style.display = "none";
                // typing in the log's input never reaches the game's key handlers
                we.addEventListener("keydown", (e) => { e.stopPropagation(); });
                chatLog = { style: me, button: ge, container: ye, history: xe, input: we };
                ctx.onCleanup(() => { try { me.remove(); ge.remove(); ye.remove(); } catch (e) { /* ignore */ } chatLog = null; });
                applyChatLogVisible();
                for (const args of chatBacklog.splice(0)) b(...args);
                return true;
            }
            function applyChatLogVisible() {
                if (!chatLog) return;
                const on = tog("ChatLog").checked;
                chatLog.history.style.display = on ? "block" : "none";
                chatLog.input.style.display = on ? "block" : "none";
            }
            ctx.onSettingChange && ctx.onSettingChange((key) => { if (key === "ChatLog") applyChatLogVisible(); });
            function Me() {
                const e = new Date;
                let t = e.getHours();
                let n = e.getMinutes();
                let i = "AM";
                if (t === 0) t = 12;
                else if (t > 12) { i = "PM"; t = t % 12; }
                if (n < 10) n = "0" + n;
                return t + ":" + n + " " + i;
            }
            // b(text, rest, color, green, noTime): one line in the log
            function b(e, t, n, i, s) {
                if (!chatLog) { if (chatBacklog.length < num("chatLogLines")) chatBacklog.push([e, t, n, i, s]); return; }
                const xe = chatLog.history, ge = chatLog.button;
                const o = xe.scrollHeight - xe.scrollTop <= xe.clientHeight + 1;
                const r = doc.createElement("div");
                r.style.wordWrap = "break-word";
                r.style.color = i ? "#6bdb79" : "white";
                xe.appendChild(r);
                if (!s) {
                    const e2 = doc.createElement("span");
                    e2.style.color = "rgba(255, 255, 255, 0.5)";
                    e2.style.marginRight = "5px";
                    e2.textContent = Me();
                    r.appendChild(e2);
                }
                const a = doc.createElement("span");
                a.style.color = n;
                a.textContent = e;
                r.appendChild(a);
                const l = doc.createElement("span");
                l.textContent = t;
                r.appendChild(l);
                if (xe.children.length > num("chatLogLines")) xe.removeChild(xe.children[0]);
                if (o) { xe.scrollTop = xe.scrollHeight; ke(); }
                else ge.style.display = "block";
            }
            function ve() { const xe = chatLog.history; return xe.scrollHeight - xe.scrollTop <= xe.clientHeight + 1; }
            function ke() {
                if (!chatLog) return;
                const xe = chatLog.history;
                if (ve() || xe.clientHeight >= xe.scrollHeight) chatLog.button.style.display = "none";
                else chatLog.button.style.display = "block";
            }
            let chatDead = false;
            ctx.onCleanup(() => { chatDead = true; });
            (function waitBody() { if (!chatDead && !buildChatLog()) setTimeout(waitBody, 50); })();

            // ---- receiveChat (13190): every chat line goes to the log ----
            ctx.on("chat", function (pk) {
                const e = pk && pk.sid, n = pk && pk.message;
                const t = Hg(e);
                if (!t) return;
                if (!Ei.includes(e) || ts?.bot?.sid === e) b(`${t.name}[${t.sid}]: `, n, z.sid == e || ts?.bot?.sid === e ? "#0aa8fc" : "#FFFFFF");
            });

            // ---- the ping loop (ey) and its display (pingSocketResponse) ----
            // The bundle pinged every 400 ms. This server allows "0" at 2/s, so the
            // loop runs at the fastest rate the loader's governor lets through; the
            // official client's own 2.5 s pings are dropped so the two never mix.
            const pingRate = (net && net.rateLimits && net.rateLimits.packets && net.rateLimits.packets["0"]) || [2, 4];
            const PING_INTERVAL = Math.max(400, Math.ceil(1000 / (pingRate[0] * 0.9)));
            let curPing = 0, wd = 0, Zg = null, Gg = -1;
            ctx.onOutgoing("ping", () => false);
            function ey() {
                Zg && clearTimeout(Zg);
                MooMoo.isReady() && (Gg = Date.now(), packet.send("0"));
                Zg = setTimeout(ey, PING_INTERVAL);
            }
            ctx.onCleanup(() => { Zg && clearTimeout(Zg); });
            ey();
            function g1(e) { return e < 75 ? 4 : e < 150 ? 3 : e < 250 ? 2 : 1; }
            ctx.on("pong", function (pk) {
                const e = pk && pk.ms != null ? pk.ms : curPing;
                curPing = e;
                bn = e;
                if (!Kg.checked) {
                    wd = e;
                } else {
                    const t = parseInt(Xg.value);
                    wd = f(Math.random() * t) + parseInt(Xg.value) + num("fakePingBase");
                }
                yt.push(e);
                if (yt.length >= 4) yt.shift();
                xt = yt.reduce((a, b2) => a + b2, 0) / yt.length;
                // after the official client's own pong handler has run
                setTimeout(() => {
                    win.pingTime = e;
                    const pt = doc && doc.getElementById("pingText");
                    if (pt) pt.textContent = e + (Kg.checked ? wd : "") + " ms";
                    const pd = Zh.el;
                    if (pd) pd.className = "tier" + g1(e);
                }, 0);
            });
            function pingNow() { return curPing; }
