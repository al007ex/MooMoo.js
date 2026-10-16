            // =====================================================================
            // 40-page — what MooMod does to the page itself.
            // =====================================================================
            const byId = (id) => document.getElementById(id);

            // remember the inline css we're about to change / html / a property, so disabling
            // puts it back (only those properties: the game keeps styling these elements too)
            function keepCss(el, props) {
                if (!el) return;
                const before = props.map((p) => [p, el.style.getPropertyValue(p), el.style.getPropertyPriority(p)]);
                remember(function () {
                    for (const [p, v, prio] of before) {
                        if (v) el.style.setProperty(p, v, prio);
                        else el.style.removeProperty(p);
                    }
                });
            }
            const BACKGROUND = ["background-color", "background-image", "background-repeat", "background-position", "background-size", "background-attachment", "background-origin", "background-clip"];
            function keepHtml(el) {
                if (!el) return;
                const html = el.innerHTML;
                remember(function () { el.innerHTML = html; });
            }
            function keepProp(obj, key) {
                // (assign back what was there — that also covers setters like body.oncontextmenu)
                const existed = key in obj, value = obj[key];
                remember(function () { if (existed) obj[key] = value; else delete obj[key]; });
            }

            function hideAds() {
                // the 728x90 home banner (moomoo.io's ad slot — not on this page, so this just fails quietly)
                try {
                    byId("moomooio_728x90_home").style.display = "none";
                    $("#moomooio_728x90_home").parent().css({ display: "none" });
                } catch (e) { /* "error removing ad" */ }
            }

            function canvasCursor() {
                keepCss(byId("gameCanvas"), ["cursor"]);
                $("#gameCanvas").css("cursor", "url(http://cur.cursors-4u.net/user/use-1/use153.cur), default");
            }

            // ?fc=<server> force connect (moomoo.io's server list; nothing to connect to here)
            function forceConnectNote() {
                try {
                    const url = new URL(win.location.href);
                    win.sessionStorage.force = url.searchParams.get("fc");
                    const force = win.sessionStorage.force;
                    if (force != "false" && force && force.toString() != "null") {
                        const header = document.getElementsByClassName("menuHeader")[0];
                        if (header) { keepHtml(header); header.innerHTML = "Servers <span style=\"color: red;\">Force (" + force + ")</span>"; }
                    }
                } catch (e) { /* no sessionStorage */ }
            }

            // every alert() became this jquery-confirm box
            function fullServerAlert() {
                keepProp(win, "alert");
                win.alert = function () {
                    $.alert({
                        title: "Full Server!",
                        content: "This server is full! Would you like to force connect?",
                        useBootstrap: false,
                        buttons: {
                            Back: () => {
                                win.onbeforeunload = null;
                                win.location = win.location.origin;           // PORT: was http://moomoo.io
                            },
                            Yes: () => {
                                const server = new URL(win.location.href).searchParams.get("server");
                                win.sessionStorage.force = server;
                                win.sessionStorage.dog = server;
                                setTimeout(() => { win.location = win.location.origin + "?force-connect=" + server; }, 500);
                            }
                        }
                    });
                };
            }

            function adStubs() {
                keepProp(win, "admob");
                win.admob = { requestInterstitialAd: () => {}, showInterstitialAd: () => {} };
            }

            // the menu's "MOOMOO.io" logo becomes a red 3D "MooMod", plus the loading / name / chat texts
            function rebrand() {
                const name = byId("gameName"), loading = byId("loadingText"), nameInput = byId("nameInput"), chatBox = byId("chatBox");
                keepCss(name, ["color", "text-shadow", "text-align", "font-size", "margin-bottom"]);
                keepHtml(name); keepHtml(loading);
                if (nameInput) keepProp(nameInput, "placeholder");
                if (chatBox) keepProp(chatBox, "placeholder");
                if (name) { name.style.color = "Red"; name.innerHTML = "MooMod"; }
                if (loading) loading.innerHTML = "Hack Made By Nuro.";
                if (nameInput) nameInput.placeholder = "Nuro.";
                if (chatBox) chatBox.placeholder = "Message";
                $("#gameName").css({
                    color: "#000000",
                    "text-shadow": LOGO_SHADOW,
                    "text-align": "center",
                    "font-size": "140px",
                    "margin-bottom": "-30px"
                });
                $("#consentBlock").css({ display: "none" });
                $("#promoImgHolder").css({
                    position: "absolute",
                    bottom: "-7%",
                    left: "0px",
                    width: "0px",
                    height: "0px",
                    "padding-bottom": "0px",
                    "margin-top": "0px"
                });
                // (the original aimed this at "pingDisplay" without the #, so it never matched anything)
                $("pingDisplay").css({ color: "#ff0202", "text-shadow": PING_SHADOW, "text-align": "center", "font-size": "156px", "margin-bottom": "-30px" });
            }

            // the main menu's "Featured YouTuber" box becomes "Featured Hacker: Nuro."
            function featuredHacker() {
                // PORT: old moomoo.io had this box on its main menu and MooMod rewrote it. This client
                // doesn't have one, so it's put back where it was (this page still styles #youtuberOf).
                if (!byId("youtuberOf")) {
                    const menu = byId("mainMenu");
                    if (menu) { const box = own(document.createElement("div")); box.id = "youtuberOf"; menu.appendChild(box); }
                }
                const showOther = false;
                setInterval(() => {
                    if (showOther == false) $("#youtuberOf").html(FEATURED_NURO);
                    else $("#youtuberOf").html(FEATURED_JABIDDLE);
                }, 1000);
            }

            // the FPS counter in the top left corner (its colours come from the page background)
            function fpsCounter() {
                let lastAt = 0, frames = 0;
                const box = own(document.createElement("div"));
                box.style.padding = "5px";
                box.style.font = "16px Arial";
                box.style.display = "block";
                box.style.position = "fixed";
                box.style.top = "0px";
                box.style.left = "0px";
                box.textContent = "Calculating...";
                document.body.appendChild(box);
                function parse(color) {
                    let parts;
                    if (color.startsWith("rgba")) parts = color.substring(5, color.length - 1).split(",");
                    else if (color.startsWith("rgb")) parts = color.substring(4, color.length - 1).split(",");
                    else if (color.startsWith("#") && color.length === 4) parts = ["" + parseInt("0x" + color.substr(1, 1)), "" + parseInt("0x" + color.substr(2, 1)), "" + parseInt("0x" + color.substr(3, 1))];
                    else if (color.startsWith("#") && color.length === 7) parts = ["" + parseInt("0x" + color.substr(1, 2)), "" + parseInt("0x" + color.substr(3, 2)), "" + parseInt("0x" + color.substr(5, 2))];
                    else return { r: 255, g: 255, b: 255 };
                    return { r: Number(parts[0]), g: Number(parts[1]), b: Number(parts[2]) };
                }
                function frame() {
                    if (!alive) return;
                    const bg = parse(getComputedStyle(document.body, null).getPropertyValue("background-color"));
                    box.style.color = "rgb(" + (255 - bg.r) + "," + (9 - bg.g) + "," + (9 - bg.b) + ")";
                    box.style.background = "rgba(" + bg.r + "," + bg.g + "," + bg.b + ",0.7)";
                    const now = Date.now(), elapsed = now - lastAt;
                    if (elapsed < 700) ++frames;
                    else {
                        box.textContent = Math.round(frames / (elapsed / 1000)) + " FPS";
                        frames = 0;
                        lastAt = now;
                    }
                    win.requestAnimationFrame(frame);
                }
                lastAt = Date.now();
                win.requestAnimationFrame(frame);
            }

            // the HUD texts MooMod colours by biome / danger (see 60-game)
            const HUD = ["scoreDisplay", "woodDisplay", "stoneDisplay", "killCounter", "foodDisplay", "ageText", "allianceButton", "chatButton", "storeButton", "leaderboard"];
            function keepHudColours() {
                const kept = HUD.map((id) => { const el = byId(id); return [el, el ? el.style.color : ""]; });
                remember(function () { for (const [el, c] of kept) if (el) el.style.color = c; });
            }
            function hudColour(color, leaderboardColor) {
                byId("scoreDisplay").style.color = color;
                byId("woodDisplay").style.color = color;
                byId("stoneDisplay").style.color = color;
                byId("killCounter").style.color = color;
                byId("foodDisplay").style.color = color;
                byId("ageText").style.color = color;
                byId("allianceButton").style.color = color;
                byId("chatButton").style.color = color;
                byId("storeButton").style.color = color;
                if (leaderboardColor) byId("leaderboard").style.color = leaderboardColor;
            }

            // the debugging handles the original hung on document
            function documentHandles() {
                for (const k of ["dns", "ps", "timeTween"]) keepProp(document, k);
                document.timeTween = 130;                   // the right click insta reads it for its weapon swap
            }
