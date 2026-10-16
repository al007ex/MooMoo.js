            // =====================================================================
            // 90-init — the original's setup, in its order. Order matters: several
            // listeners answer the same key (V places from three of them), and of two
            // styles that tie, the later one wins.
            // =====================================================================
            function init() {
                if (!alive) return;
                keepProp(document, "title");
                keepHudColours();
                autoPlaceMenu();          // F2: modal, style, F2 / close / click-outside
                canvasCursor();
                $("#consentBlock").css({ display: "none" });
                hideAds();
                win.onbeforeunload = null;
                forceConnectNote();
                fullServerAlert();
                adStubs();
                documentHandles();
                hiddenBits();             // jquery-confirm css, #tbtn, #hatChangeAlert
                alertHandlers();
                cloudyStyles();           // CloudyMod css, minimap backing off
                installHook();            // from here the script sees every frame going out
                autopilot();              // minimap click
                document.dns = send;
                cloudyKeys();             // keypress: g, l, Shift+B, Shift+P
                rightClickInsta();
                mooModMenu();             // "-", its button on the main menu, tabs, biome map box
                rebrand();                // the red MooMod logo + texts
                featuredHacker();
                win.onbeforeunload = null;
                fpsCounter();
                loops();                  // auto aim (0 ms), hats (25 ms)
                arrowKeys();
                autoTrapKey();            // K
                botModeKey();             // P
                mainKeys();               // holds, rings, R, H, V + keyup
                document.title = "MooMod";
                hideAds();
                hatMenu();                // ESC menu, its keys, the MooMod menu's checkboxes
                document.ps = placeRaw;
            }
            // the original ran on $(document).ready: the same moment, DOMContentLoaded
            function ready() {
                if (!alive) return;
                $ = MOOMOD_JQUERY(win);
                init();
            }
            if (document.readyState === "loading") listen(document, "DOMContentLoaded", ready);
            else ready();
