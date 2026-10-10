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
- [x] autohat — bundle soldier/bull logic (soldier when an incoming hit would
      leave us low via predictedDamage, bull otherwise), debounced. emp-near-turret
      pending the object manager.
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

## DISCONNECT ROOT CAUSE — FIXED + verified live
The official client caches `dl = WebSocket.prototype.send` and sends via
`dl.call(socket, frame)`. The loader's old per-socket `ws.send` hook never saw
those frames, so injected packets collided with the client's own sequence →
server `close (bad sequence)` the instant auto-heal fired.

Fix (`loader/src/anticheat.js`): hook `WebSocket.prototype.send` with a Proxy of
the native send (still reports `[native code]`, so SOCKET_HOOKED stays false). The
loader now re-sequences EVERY outgoing frame (client + injected) through one
counter and scrubs the client's own `T` telemetry.

Proven by `tests/live/realclient.live.test.mjs`: the REAL official client in
headless Chrome + the built loader + examplescript, hit 8x on the REAL server —
survives, heals 75→95→100 each time, no anti-cheat action, config menu mounts.
Also `tests/live/autoheal.live.test.mjs` (emulated client) and a new unit
regression in `loader.integration.test.mjs` (`dl.call` + injection share one seq).

## combat subsystem added (loader/src/helpers.js) + proven live
Reconstructed the client's combat state so features can match it:
- weapon reload readiness (ctx.primaryReady/secondaryReady) from the "K" gather
  packet + weapon.speed*samRP (Samurai Armor 0.78), exactly like the client fills pr/sr.
- weapon-variant damage multipliers [1,1.1,1.18,1.18], predictedDamage(range).
- ctx.combat.{tick,primaryReady,secondaryReady,variantVal,samRP,markSwing}.

Live-verified by tests/live/combat.live.test.mjs: autohat + auto-attack + auto-heal
all ON through 12s of sustained combat on the real server -> no close/kick/shame/
strike, hat-swaps stay under the "c" rate bucket.

### live test harness (tests/live/)
- live-server.mjs  — boots an ISOLATED copy of the server (never touches your real
  checkout/data), test-account login + join tickets, protocol module, log tap.
- live-client.mjs  — browser-like ws + an official-client emulation + an admin bot.
- autoheal.live.test.mjs, realclient.live.test.mjs (real Chrome), combat.live.test.mjs
Run with MOOMOO_TEST_TMP set to a scratch dir; LIVE_ECHO=1 to watch.

## object manager added (loader/src/objectmanager.js) + proven live
Rebuilt the world the combat features read, 1-1 with the bundle's GameObject model.
Parses the wire exactly:
- objectsLoad "H"  flat [sid,x,y,dir,scale,type,id,ownerSid]*N  -> add (data=item(id))
- objectKilled "Q" [sid] -> remove one;  objectsKilled "R" [ownerSid] -> remove all of owner
- wiggle "L" [dir,sid] -> hit;  turretShoot "M" [sid,dir] -> turret reload (.time=2200)
- itemCount "S" [group,count];  setup/died -> clear
Derives name/group/realScale/pathScale/trap/dmg/pDmg/owner just like GameObject.
Queries: near/spikes/walls/mills/traps/turrets/buildings/trapAt + isEnemyObject (team).
Exposed as ctx.objects. Unit: tests/objectmanager.test.mjs (7). Live:
tests/live/objects.live.test.mjs — real resources tracked on spawn + a placed spike
read back with exact fields (name/group/dmg/health/owner/realScale) + spatial query.

## combat engine added (loader/src/combat.js) = the bundle's updatePlayers, 1-1
Runs the whole combat brain on the server tick (the "a" packet), exactly where the
bundle does. Every tick, for self + every visible player, it reconstructs:
- predicted position window (x2/y2 = this tick, preX/preY = last), velocity, movDir/movSpd
- primary/secondary + their variants, weaponR
- reload clocks pr (primary), sr (secondary), tr (turret gear) — filled by the real
  formula ((delta>190?delta:ce)/(speed*samRP)), reset to 0 on the "K" swing echo,
  with samRP/samRS = 0.78 under Samurai Armor
- np = l4(player): the accel/decel/real next-position prediction, ported line-for-line
and on each health change, the 9-tick BULL cadence (lastBull/bleed) the insta combos
time against. Loadout (ee/A/ly/uy/ay/ry/cy/dy/hy/fy) resolves from self.weapons/items.
Predicates _y / Vy / o4 and geometry se/B/S4/angleDist ported 1-1. Exposed as
ctx.combat (self=z, target=Y, visibleEnemies=vn, loadout, …).

Fixed a real correctness bug found doing this: the server only sends your inventory
("V") on upgrade, never on spawn, so the loader started with an empty loadout. The
client seeds the default kit (weapons [0], items [0,3,6,10]); the runtime now does too.

Unit: tests/combat.test.mjs (6 — loadout, reconstruction/np, reload cycle, bull
cadence, targeting, team filter). Live: tests/live/combat-engine.live.test.mjs —
real client: np present, loadout resolves, pr cycles 1->0->1 on real swings.

### still to port (onto the two engines above)
- combo layer: apple insta, bleed insta, kbInsta, auto break, melee sync, plus the
  combo control flags (p/ct/gt/Mt/Nt) and action helpers (Bg attack-with-equip, c4
  place, u5). apple/bleed insta + auto break need only the combat engine; kbInsta +
  auto push need the potentials below.
- potentials: dmgpot (p5/m5), kbpot (w5), placePot (O5) + helpers v3/U5/y5 — damage/
  knockback/placement prediction per enemy. Needed for kbInsta, auto push, and exact
  autohat (replaces the predictedDamage approximation).
- auto place / replace, break spike trap, auto emp (object-manager turret .time),
  polearm aids, spike sync — read the object manager + potentials.
- visuals tab: needs a render/overlay subsystem (the loader doesn't draw the game).
- extra tab: send-ws panel, autobuy, fakePing.
