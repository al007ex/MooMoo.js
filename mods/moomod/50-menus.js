            // =====================================================================
            // 50-menus — F2 auto placement, the ESC hat menu, the "-" MooMod menu,
            //            the minimap autopilot and the hat change alert.
            // =====================================================================
            const notChatting = () => document.activeElement.id.toLowerCase() !== "chatbox";
            const isShown = (el) => el.offsetParent !== null;        // _0x3a787f

            function addStyle(css, parent) {
                const style = own(document.createElement("style"));
                style.type = "text/css";
                style.appendChild(document.createTextNode(css));
                parent.appendChild(style);
                return style;
            }

            // ---- F2: "Auto placement Settings" ----
            // (F2 only ever OPENS it: the original wrote `if (display = "none")`. Close it with the
            // red x or by clicking next to it.)
            function autoPlaceMenu() {
                const card = own(document.createElement("div"));
                card.className = "menuCard";
                card.id = "mainSettings";
                card.innerHTML = AUTO_PLACE_HTML;
                document.body.appendChild(card);
                autoPlaceModal = byId("atS");
                byId("myCheck0").addEventListener("change", function () {
                    antiTrapItem = this.checked ? "Trap" : "Spike";
                });
                addStyle(AUTO_PLACE_CSS, document.head);
                $("#adCard").css({ display: "none" });
                listen(document, "keydown", function (e) {
                    if (e.keyCode == 113) autoPlaceModal.style.display = "block";
                });
                document.getElementsByClassName("closeit")[0].addEventListener("click", function () { autoPlaceModal.style.display = "none"; });
                listen(win, "click", function (e) { if (e.target == autoPlaceModal) autoPlaceModal.style.display = "none"; });
            }

            // the target marker image (only the CloudyMod bot showed it) and the hat change alert box
            function hiddenBits() {
                const link = own(document.createElement("link"));
                link.rel = "stylesheet";
                link.href = "https://cdnjs.cloudflare.com/ajax/libs/jquery-confirm/3.3.0/jquery-confirm.min.css";
                document.head.appendChild(link);
                const marker = own(document.createElement("img"));
                marker.src = "https://i.imgur.com/gWzcwQR.png";
                marker.id = "tbtn";
                document.body.prepend(marker);
                hatAlert = own(document.createElement("div"));
                hatAlert.id = "hatChangeAlert";
                document.body.prepend(hatAlert);
            }

            // the hat / accessory picker dialogs and the alert's buttons. Every one of these was
            // registered twice by the original (so "Switch Back!" equips your hat twice).
            function alertHandlers() {
                $(document).on("click.moomod", ".inalertHat", (e) => {
                    $(".chosenhat").removeClass("chosenhat");
                    $(e.target.tagName == "DIV" ? e.target : $(e.target).parent()).addClass("chosenhat");
                });
                $(document).on("click.moomod", ".inalertWing", (e) => {
                    $(".chosenwing").removeClass("chosenwing");
                    $(e.target.tagName == "DIV" ? e.target : $(e.target).parent()).addClass("chosenwing");
                });
                $(document).on("click.moomod", "#okbtn", () => {
                    $("#hatChangeAlert").animate({ opacity: 0, top: -300 });
                });
                $(document).on("click.moomod", "#sback", () => {
                    send(["13c", [0, myHat, 0]]);
                    $("#hatChangeAlert").animate({ opacity: 0, top: -300 });
                });
            }

            // _0x59aa4e: slide the "Biome Hat Changed!" alert in for 5 s (biomeHatAlerts is off)
            function showHatAlert(name, id) {
                hatAlert.innerHTML = hatAlertHtml(name, id);
                $("#hatChangeAlert").animate({ opacity: 1, top: "20px" });
                setTimeout(() => { $("#hatChangeAlert").animate({ opacity: 0, top: -300 }); }, 5000);
            }

            function cloudyStyles() {
                addStyle(CLOUDY_CSS, document.head);
                $("#adCard").css({ display: "none" });
                // the minimap loses its dark backing (the "Use biome map" box puts a map behind it)
                keepCss(byId("mapDisplay"), BACKGROUND);
                $("#mapDisplay").css({ background: "url('')" });
            }

            // ---- minimap click: "You are currently in CloudyMod auto-pilot." ----
            // A red pulse on the spot you clicked every 0.7 s and an ETA box with Cancel. It never
            // actually walked anywhere: its steering lived in a packet branch that never ran.
            function autopilot() {
                $("#mapDisplay").on("click.moomod", (e) => {
                    if (!tripTarget.every((v) => v === false)) return;
                    $("#spotDiv").css({ zIndex: 10000 });
                    const x = e.pageX - $("#mapDisplay").offset().left;
                    const y = e.pageY - $("#mapDisplay").offset().top;
                    tripTarget = [x / $("#mapDisplay").width() * 14365, y / $("#mapDisplay").height() * 14365];
                    const info = document.createElement("div");
                    info.innerHTML = AUTOPILOT_HTML;
                    info.id = "infoDiv";
                    document.body.prepend(info);
                    const pulse = () => {
                        const spot = document.createElement("div");
                        spot.id = "spotDiv";
                        spot.className = "spotDiv";
                        document.body.prepend(spot);
                        $("#spotDiv").css({ left: e.pageX, top: e.pageY });
                        $("#spotDiv").animate({ width: "50px", height: "50px", marginLeft: "-25px", marginTop: "-25px", borderRadius: "25px", opacity: 0 }, 2000);
                    };
                    pulse();
                    const loop = setInterval(() => {
                        if (tripTarget.every((v) => v === false)) {
                            clearInterval(loop);
                            for (const spot of document.getElementsByClassName("spotDiv")) document.body.removeChild(spot);
                        } else pulse();
                    }, 700);
                });
                $(document).on("click.moomod", "#cancelTrip", () => {
                    tripTarget = [false, false];
                    send(["3", [null]]);                 // the old "stop" packet (no such packet: dropped)
                    $("#infoDiv").animate({ opacity: 0 });
                });
            }

            // ---- "-": the MooMod menu ----
            function mooModMenu() {
                // PORT: the old main menu card was #setupCard; on this client it's the play card
                const setupCard = byId("setupCard") || document.querySelector('#menuDialog .menuView[data-view="play"]') || byId("menuDialog");
                const button = own(document.createElement("button"));
                menuContainer = own(document.createElement("div"));
                const style = own(document.createElement("style"));
                menuContainer.classList.add("i-container");
                menuContainer.id = "mm-menu-container";
                style.type = "text/css";
                style.innerHTML = MENU_CSS;
                menuContainer.innerHTML = MENU_HTML;
                button.classList.add("menuButton");
                button.classList.add("open-menu-button");
                button.textContent = "Open MooMod menu";
                listen(win, "keydown", function (e) {
                    if (e.key === "-") {
                        e.preventDefault();
                        toggleMenu();
                    }
                });
                button.addEventListener("click", toggleMenu);
                if (setupCard) setupCard.appendChild(button);
                document.body.appendChild(style);
                document.body.appendChild(menuContainer);
                const tabs = ["main", "offense", "defense", "support", "map", "controls", "help"];
                document.querySelectorAll(".i-tab-menu-item").forEach((item) => {
                    item.addEventListener("click", function (e) {
                        const target = e.target;
                        for (const id of tabs) document.querySelector("#mm-" + id + "-menu").style.display = "none";
                        document.querySelectorAll(".i-tab-menu-item").forEach((t) => t.classList.remove("is-active"));
                        for (const id of tabs) if (target.textContent.toLowerCase() == id) document.querySelector("#mm-" + id + "-menu").style.display = "block";
                        target.classList.add("is-active");
                    });
                });
                $("#mm-controls-menu").css({ "-webkit-overflow-scrolling": "touch" });
                toggleMenu();       // "" -> block
                toggleMenu();       // block -> none: starts closed
                byId("myCheck").addEventListener("change", biomeMap);
            }
            function toggleMenu() {
                menuContainer.style.display = menuContainer.style.display == "block" ? "none" : "block";
            }
            function biomeMap() {
                if (this.checked) $("#mapDisplay").css({ background: BIOME_MAP_BG });
                else $("#mapDisplay").css({ background: "rgba(0, 0, 0, 0)" });
            }

            // ---- ESC: "MooMod Hat settings" ----
            // Each box takes one character; its key code is that character upper-cased. Boxes
            // that start empty show the replacement character: the original put
            // String.fromCharCode(0) in their value. Nothing is saved, like before.
            function hatMenuHtml() {
                const keys = [spikeKey, trapKey, turretKey, bullKey, soldierKey, turretGearKey, bushKey, spikeGearKey, samuraiKey, empKey, millHatKey, tankKey, biomeKey];
                let html = HAT_MENU_PARTS[0];
                for (let i = 0; i < keys.length; i++) html += String.fromCharCode(keys[i]) + HAT_MENU_PARTS[i + 1];
                return html;
            }
            function hatMenu() {
                const card = own(document.createElement("div"));
                card.className = "menuCard";
                card.id = "mainSettings";
                card.innerHTML = hatMenuHtml();
                document.body.appendChild(card);

                const upperCode = (id) => { const v = $(id).val(); return v ? v.toUpperCase().charCodeAt(0) : null; };
                const bind = (id, set) => $(id).on("input", () => { const code = upperCode(id); if (code != null) set(code); });
                bind("#spikeControl", (c) => { spikeKey = c; });
                // the turret box never took: its handler read the spike key's charCodeAt and threw
                $("#turretControl").on("input", () => { const v = $("#turretControl").val(); if (v) turretKey = v.toUpperCase(); });
                bind("#bullHelm", (c) => { bullKey = c; });
                bind("#trapControl", (c) => { trapKey = c; });             // (the hold-F spammer keeps F)
                bind("#soldier", (c) => { soldierKey = c; });
                bind("#turret", (c) => { turretGearKey = c; });
                bind("#tank", (c) => { tankKey = c; });
                bind("#samu", (c) => { samuraiKey = c; });
                bind("#mill", (c) => { millHatKey = c; });
                bind("#bushg", (c) => { bushKey = c; });
                bind("#spikeg", (c) => { spikeGearKey = c; });
                bind("#emp", (c) => { empKey = c; });
                bind("#WFB", (c) => { biomeKey = c; });
                // second handlers on the spike / trap boxes, from CloudyMod: the raw (not upper-cased) code
                $("#spikeControl").on("input", () => { const v = $("#spikeControl").val(); if (v) cloudySpikeKey = v.charCodeAt(0); });
                $("#trapControl").on("input", () => { const v = $("#trapControl").val(); if (v) trapKey2 = v.charCodeAt(0); });
                alertHandlers();                                            // ...the second set
                addStyle(HAT_MENU_CSS, document.head);
                $("#adCard").css({ display: "none" });

                // its keys. ESC only ever OPENS the menu (same `display = "none"` slip as F2).
                listen(document, "keydown", function (e) {
                    const k = e.keyCode;
                    if (k == millHatKey && notChatting()) {
                        send(["13c", [0, 14, 0]]);                              // windmill hat
                        send(["13c", [0, 13, 1]]);                              // angel wings
                    } else if (k == 27) {
                        hatMenuModal.style.display = "block";
                    } else if (k == spikeKey && notChatting()) {
                        place(spikeSlot);
                    } else if (k == soldierKey && notChatting()) {
                        send(["13c", [0, 6, 0]]);                               // soldier helmet
                        send(["13c", [0, soldierWings, 1]]);
                    } else if (k == bullKey && notChatting()) {
                        send(["13c", [0, 7, 0]]);                               // bull helmet
                    } else if (k == trapKey2 && notChatting()) {
                        place(trapSlot);
                    } else if (k == bushKey && notChatting()) {
                        send(["13c", [0, 10, 0]]);                              // bush gear
                    } else if (k == samuraiKey && notChatting()) {
                        send(["13c", [0, 20, 0]]);                              // samurai armor
                    } else if (k == spikeGearKey && notChatting()) {
                        send(["13c", [0, 11, 0]]);                              // spike gear
                    } else if (k == turretGearKey && notChatting()) {
                        send(["13c", [0, 53, 0]]);                              // turret gear
                    } else if (k == empKey && notChatting()) {
                        send(["13c", [0, 22, 0]]);                              // emp helmet
                    } else if (k == biomeKey && notChatting()) {               // Winter Flipper Booster
                        if (me.y < 2400) setHat(15);
                        else if (me.y > 6850 && me.y < 7550) setHat(31);
                        else setHat(12);
                        setAcc(11);
                    }
                });
                hatMenuModal = byId("simpleModal");
                document.getElementsByClassName("closeBtn")[0].addEventListener("click", function () { hatMenuModal.style.display = "none"; });
                listen(win, "click", function (e) { if (e.target == hatMenuModal) hatMenuModal.style.display = "none"; });

                // the MooMod menu's checkboxes
                byId("myCheck").addEventListener("change", biomeMap);
                byId("mm-autoAim").addEventListener("change", function () {
                    autoAim = !!this.checked;
                    send(["ch", [this.checked ? "Auto Aim : On" : "Auto Aim : Off"]]);
                });
                byId("mm-autoHeal").addEventListener("change", function () {
                    send(["ch", [this.checked ? "Auto Heal : On" : "Auto Heal : Off"]]);
                    autoHeal = this.checked ? 1 : 0;
                });
                byId("mm-autochat").addEventListener("change", function () {
                    repeatLast = !!this.checked;
                });
            }
