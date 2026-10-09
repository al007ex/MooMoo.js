# Porting examplescript.js → moomoo.js

`examplescript.js` is a full modified MooMoo.io client bundle (~23.5k lines) a
friend made — the game's own bundle with a big combat/sync mod woven into it. the
goal here is to recreate every feature (bots excluded, per your call) on top of the
moomoo.js loader + runtime, adding whatever the API is missing as we go, plus a
config menu like the one in the bundle.

the catch: the bundle **is** the game client, so it can touch rendering and input
directly. our loader only hooks the websocket and doesn't replace the client, so a
bunch of API has to be added:

- an **input/keybind** subsystem (the loader has to listen for keys + track mouse)
- **game-data tables** (weapons / items / hats / accessories with stats + ids)
- a **tick clock** + reload/cooldown tracking
- current **inventory / equipped / hat** state tracking
- combat helpers: aim-at, place-at, attack-pulse, hat-swap
- a **render/overlay** subsystem for the visual mods (draw over the game each frame)
- a **config menu** (tabbed overlay, toggles / sliders / dropdowns / keybinds)

## the config menu in the bundle

toggled with a key, an overlay with tabs: Combat, heal, Visuals, Keybinds, Bots,
Throttles, Extra. toggles are stored in localStorage by their label. we'll rebuild
this as a proper menu driven by the feature registry.

## feature catalog (from the bundle's menu + code)

### combat
- [ ] auto break (auto-attack / primary weapon spam)
- [ ] stop on break / stop break
- [ ] auto place (spike/trap placement toward a target)
- [ ] auto replace (re-place broken buildings)
- [ ] auto push (spike push)
- [ ] polearm aids ("polearm" harass combo)
- [ ] aids spike sync
- [ ] melee sync
- [ ] bleed insta (one-shot combo with bleed)
- [ ] apple insta (apple-in-combo)
- [ ] kbInsta (knockback insta)
- [ ] kbInsta without turret gear
- [ ] kbAssist
- [ ] stop on collision / movement on collision
- [ ] strict soldier / strict monkey (hat-locked combos)
- [x] auto equip fastest weapon (equips lowest-speed owned weapon; semantics TBD vs bundle)
- [x] auto attack (hold weapon on nearest enemy in range; off by default) + toggle key
- [x] strict soldier / strict monkey (autohat modifiers)
- [ ] break spike trap
- [ ] Auto Emp
- [~] autohat — baseline done (bull in range / soldier otherwise, debounced); bundle
      has fuller logic (emp near turrets, soldier-on-hit timing) to port
- [ ] APA slider (auto place accuracy / angle)

### healing
- [x] auto heal — SHAME-SAFE. the server shames + rate-limits (and disconnects)
      naive auto-heal that eats within 120ms of a hit. ours waits past that window
      like the real bundle, eats a bounded burst, and never loops/floods.
- [ ] autoQ

### important: the server's anti-auto-heal defense (learned the hard way)
`server/src/moomoo/modules/player.js` + `anticheat/config.js`:
- eating within 120ms of being hit, 8x in a row -> forced Shame hat + eating blocked.
- per-packet token buckets (F=[40,80], z=[20,40], c=[10,20], global=[150,300]);
  exceeding them = strikes, 40 strikes = kick.
- so: NEVER eat inside 120ms of a hit, and NEVER tight-loop packets. all auto-send
  features must be bounded + driven by server replies, not fired open-loop.

### visuals  (need the render/overlay subsystem first)
- [ ] reload bars / reload arcs / no arcs / no outline arcs / smooth reloads
- [ ] packet count
- [ ] all visuals master toggle
- [ ] building hp / building owner
- [ ] mill rotate
- [ ] regular grid
- [ ] stacked damages / stacked heal text / animated text
- [ ] show place duration / log autoplace / log projectiles
- [ ] spike kb visual
- [ ] skull / shame count
- [ ] shadows
- [ ] ChatLog
- [ ] vis aim
- [ ] hide name
- [ ] see through player
- [ ] Shaders / Legacy / Default / Op Visuals (visual presets)

### keybinds / quests
- [ ] Toggle Quest 1/2/3 + Quest Progress/Reward/Difficulty (custom quest widget)

### throttles
- [ ] Auto Place Accuracy

### extra
- [ ] Assassin
- [ ] send ws (raw packet sender UI)
- [ ] autobuy (auto-buy hats)
- [ ] fix ws
- [ ] fakePing (+ ping slider)

### bots  — SKIPPED per request

## build order

1. [x] game data tables (`shared/gamedata.js`) — 16 weapons, 23 items, 49 hats, 21 accessories
2. [x] foundation: runtime extensions + input subsystem + game helpers + config menu
   - `loader/src/input.js` — keybinds + mouse/aim tracking
   - `loader/src/helpers.js` — place/eat/attack/aim/hat/targeting verbs on `ctx`
   - `loader/src/configmenu.js` — the tabbed config overlay (` key / gear button)
   - `runtime.js` — tracks weapon/hat/inventory, ctx extensions, live settings, setting categories
   - `mods/examplescript.js` — the ported mod (one mod, many categorized settings)
3. [~] combat features (auto equip fastest ✓, autohat baseline ✓; rest pending)
4. [x] healing (auto heal ✓; autoQ pending)
5. [ ] render/overlay subsystem + visual features
6. [ ] extra features (send-ws panel, autobuy, fakePing, quest widget)

each feature gets read out of the bundle before it's ported, so the timings and
behaviour match.

## how to run it

1. rebuild the loader: `node loader/build.mjs` → `loader/dist/moomoo-loader.user.js`
2. re-upload that file to your pastebin (the loader changed a lot — new modules).
   don't minify it.
3. install `mods/examplescript.user.js` in Tampermonkey (it @requires the loader).
4. in game, press the ` key (or click the gear, bottom-right) for the config menu.
