            // =====================================================================
            // 30-state — the script's variables (obfuscator name in the comment).
            // =====================================================================

            // _0x194e76(name): the original searched its copy of the game data (accessories,
            // hats, groups, weapons — first match wins) for an id by name. These are the only
            // names it ever looked up.
            const ID_BY_NAME = {
                "tank gear": 40, "corrupt x wings": 21, "polearm": 5, "musket": 15, "turret gear": 53,
                "monkey tail": 11, "shame!": 45, "bull helmet": 7, "winter cap": 15, "flipper hat": 31
            };
            function idOf(name) {
                const id = ID_BY_NAME[String(name).toLowerCase()];
                return id === undefined ? -1 : id;
            }

            // ---- F2 auto placement ----
            let antiTrapItem = "Spike";             // _0xa9e218  what goes around you when a trap lands on you
            let autoPlaceModal = null;              // _0x2b4410  #atS

            // ---- keys (keyCodes; 0 = unbound) ----
            let instaKey = 82;                      // _0xea3581  R: the insta
            let cloudySpikeKey = 113;               // _0x554250  CloudyMod's spike key (only ever compared to 0)
            let trapKey2 = 121;                     // _0x29ee86  the ESC menu's second trap key (121 = F10 on keydown)
            let spikeKey = 86;                      // _0x5d77cb  V
            let trapKey = 70;                       // _0x8276a8  F (the hold-F spammer captured 70 when it was made)
            let healDelayCloudy = 700000000000000;  // _0x44b193  CloudyMod's heal "speed" (a delay this big fires at once)
            let iPressKey, iPressPlaceItem, iPressHat;  // _0x4dab24 / _0x1b9bf4 / _0x25a1bf (set by scriptsourceapp only)
            // ESC hat menu boxes
            let tankKey = 0;                        // _0x41738b
            let bullKey = 0;                        // _0x965e2d
            let soldierKey = 0;                     // _0x4ae527
            let turretGearKey = 0;                  // _0x305130
            let spikeGearKey = 0;                   // _0x56cbf2
            let samuraiKey = 0;                     // _0x2d7e6c
            let bushKey = 0;                        // _0x400aea
            let millHatKey = 0;                     // _0x470b06  windmill hat + angel wings
            let empKey = 0;                         // _0x132d09
            let turretKey = 0;                      // _0x3cfd1e  (its box never worked, see 50-menus)
            let biomeKey = 16;                      // _0x53b05c  Shift: "Winter Flipper Booster"
            const soldierWings = 19;                // _0x5c1237  the accessory the soldier key puts on (Shadow Wings)
            // keys the author left at 0 (= off; a keyCode of 0 still matches them)
            const millRingKey = 0;                  // _0x2d53c0  five windmills
            const utilityRingKey = 0;               // _0x39ee17  four turrets
            const spawnRingKey = 0;                 // _0x3f6996  four "item 36"s
            const turretPairKey = 0;                // _0x23d5eb  two turrets at +-45 deg (bound twice)

            // ---- switches ----
            const removeMonkeyTail = true;          // _0x290e18  take the monkey tail off while swinging
            const biomeHatAlerts = false;           // _0x33bbc9  "Biome Hat Changed!" popups
            const hitHats = true;                   // _0x2788db  hat + accessory swap around every swing
            const badThingFix = false;              // _0x229932
            const clanNameScroll = 0;               // _0x5c006f  (its 200 ms loop never ran)
            const chatGlitchScroll = 0;             // _0x4bc5a0  (same)
            const unusedHealFlag = 0;               // _0x4244e9
            let autoHeal = 1;                       // _0x2a5ea6  on, though its checkbox starts unticked
            let autoHats = 1;                       // _0x5d01a9  biome / enemy hat every 25 ms
            let autoAim = false;                    // _0x4c86cc  aim at the nearest enemy (insta, bot mode, menu)
            let repeatLast = false;                 // _0x20f330  re-send your last chat on every message
            let cloudyAutoHeal = false;             // _0x4c74ca
            let cloudyHealToggles = 0;              // _0xc886bb
            let attackMode = false;                 // _0x4cb81f  (scriptsourceapp "attack")
            let runMode = false;                    // _0x48c430  (scriptsourceapp "run")
            const modeState = {                     // _0x5cee7d
                inwater: { active: false },
                nearenemy: { active: false },
                intrap: { active: false },
                ipress: { active: false }
            };

            // ---- hats ----
            let hitHat = idOf("Tank Gear");         // _0x233480  worn while swinging (Bull Helmet when an enemy is close)
            let hitAcc = idOf("Corrupt X Wings");   // _0x36366d
            let myHat = 0;                          // _0x31116e  the last hat you (or the script) put on
            let myAcc = 0;                          // _0x443be1
            let swinging = false;                   // _0x21109d  pauses the tracking of myHat / myAcc
            let biomeHat;                           // _0x47d66b  what the 25 ms loop wants on you
            let biomeAcc;                           // _0xcf4cee
            let appliedHat;                         // _0x41217d  what it last put on
            let appliedAcc;                         // _0x4b7db9
            let biome;                              // _0xbbccd5
            let ownsWinterCap = false;              // _0x26ae74
            let ownsFlipperHat = false;             // _0x4fe0e5
            const turretGear = idOf("turret gear"); // _0x34e892
            const monkeyTail = idOf("monkey tail"); // _0x27a59f
            const hiddenHats = [idOf("shame!")];    // _0x1800d6

            // ---- you ----
            const me = {                            // _0x5b2185, filled from every "33"
                id: null, x: null, y: null, dir: null, object: null, weapon: null,
                clan: null, isLeader: null, hat: null, accessory: null, isSkull: null
            };
            let isDead = false;                     // _0x41e91b
            let hasApple = true;                    // _0x2f7993
            let cloudyHealth = 100;                 // _0x23d14a
            let cloudySid;                          // _0x460f7d
            let cloudyClan = null;                  // _0x280981
            let lastChat = "";                      // _0xfff766
            let lastAim = 0;                        // _0x3ae383
            let rightClicked = false;               // _0x4bc125

            // ---- what's in your bar (actionBarItem visibility, see scanActionBar) ----
            let primarySlot;                        // _0x2ab2ea  weapons 0-8
            let secondarySlot;                      // _0x2a0723  weapons 9-15
            let foodSlot;                           // _0x1405f6
            let wallSlot;                           // _0x230362
            let spikeSlot;                          // _0x37728b
            let millSlot;                           // _0x52ccbf
            let mineSlot;                           // _0x81ca3e
            let trapSlot;                           // _0xa3735a  pit trap or boost pad
            let utilitySlot;                        // _0x21a116  turret ... teleporter (not the spawn pad)
            let spawnPadSlot;                       // _0x3eeff1
            let instaPrimary = idOf("polearm");     // _0x47b6cf  (the right click / B instas read the bar)
            let instaSecondary = idOf("musket");    // _0x2466e9

            // ---- enemies ----
            let enemyRows;                          // _0x394801  "33" rows not in your tribe
            let nearestEnemy;                       // _0x1aad29
            let enemyDir;                           // _0x3dc296  aim / bot direction
            let enemyNear;                          // _0x348d3b  within 205
            let cloudyEnemies = [];                 // _0x38bbd5
            let cloudyTarget;                       // _0x6275aa
            let cloudyAimDir = 0;                   // _0x4244bd  (the right click / B instas aim here: it stays 0)
            let nearbyTraps = [];                   // _0x5b752a
            let sawCrossbowShot = false;            // _0x4d8a45  a 1200-range shot was seen
            function CloudyPlayer(id, x, y, clan) { // _0x32454a
                this.id = id;
                this.x = x;
                this.y = y;
                this.clan = clan;
            }

            // ---- timings ----
            let healDelay = 120;                    // _0x129913  auto heal waits this long after a hit
            const instaTime = 230;                  // _0x5a4906
            let instaRunning = false;               // _0x4a3d74  the right click / B instas
            let boostDir;                           // _0x56ffa6

            // ---- mouse (the original only tracked it from io-init, which it never saw) ----
            let mouseX, mouseY, canvasW, canvasH;   // _0x568aca / _0x16c58a / _0x297ad3 / _0x3cdac0

            // ---- page ----
            let tripTarget = [false, false];        // _0x268bb9  autopilot destination
            const mapMarkers = {};                  // _0x49028c  object sid -> your buildings on the minimap
            let botText;                            // _0x304fc2
            let hatAlert = null;                    // _0x55658f  #hatChangeAlert
            let hatMenuModal = null;                // _0x38eaad  #simpleModal
            let menuContainer = null;               // _0x14bd5a  #mm-menu-container
