# moomoo.js — continuation brief

You are continuing a long-running project. Read this whole file, then read
`PORT.md`, before doing anything. Work in the current directory (the `MooMoo.js`
repo). The private server now lives **inside** this repo at `moomoo-clone-main/`.

## 1. Mission & hard rules (do not violate)
- We are building **moomoo.js**, a modding framework (loader + stable runtime/API)
  for the user's OWN private MooMoo.io-clone server. This is for **private,
  educational/testing use only**. Never publish, share, or upload any of this
  anywhere except where the user explicitly asks (the loader goes to the user's
  own pastebin as a `@require` target).
- The reference is `examplescript.js` at the repo root — a **23,510-line full
  modified game client bundle** a friend made (the game's own client with a big
  combat/sync mod woven in). Call this **"the bundle"**. We are recreating EVERY
  one of its features on top of the moomoo.js loader + runtime.
- **The goal is 1-1 behavioral parity.** The user has said repeatedly, in these
  words: *"copy every single workflow and every single feature exactly over so
  they behave 100% the same"*, *"i want everything"*, *"go as deep as the script
  is, everything should be 1-1, even if it means writing a lot of code"*, *"i
  dont care how substancial the work is, and i dont care if you say its
  unobservable. everything should be recreatable since we have the code."* So:
  implement every feature exactly as it appears in the bundle. Do not
  approximate, skip, or "simplify" because something seems unobservable or large.
- **BOTS ARE THE ONLY EXCLUSION.** The user said *"you dont need to do the bots.
  i want you to do EVERYTHING else tho."* Everything in the bundle's Bots tab,
  and the bot-coordination plumbing (the `ie`/`c` bot-mirror world, `fs.checked`
  "send ws" cross-bot messaging), is out of scope. Every other tab is in scope:
  Combat, Healing, Visuals, Keybinds/Quests, Throttles, Extra.
- Extend the loader API whenever a feature needs something it lacks — that is
  expected (*"add new methods and new functionality and features to the api
  itself as you go"*). But keep the public vocabulary (`shared/vocabulary.js`)
  stable; game-specific logic belongs in the loader's volatile modules.
- **Do NOT reproduce the slur** that appears as a default bot-name string in the
  bundle (`bi = "..."` around line 648). Use a neutral default. Bots are excluded
  anyway; never carry that string over.
- Keep the loader **undetectable** and never break the disconnect fix (see §6).
- **Never minify the loader** you deliver (terser breaks it).

## 2. Layout
- `examplescript.js` (repo root, ~903 KB) — THE BUNDLE (reference client+mod).
- `mods/examplescript.js` — OUR PORT of the bundle's mod (the deliverable mod).
  Built into `mods/examplescript.user.js` (a Tampermonkey userscript that
  `@require`s the loader) by `node mods/build-examplescript.mjs`.
- `loader/src/*.js` — the loader (volatile half). Key modules:
  - `protocol.js`, `msgpack.js`, `sha256.js`, `binding.js` — wire/codec. `binding.js`
    is the ONLY place that maps wire letters ↔ semantic event/action names.
  - `runtime.js` — `window.MooMoo`: tracks `self`/`players`, dispatches events,
    exposes `send.*`, mod registry, ctx. Dispatch calls `updateState` THEN listeners.
  - `anticheat.js` — the `WebSocket.prototype.send` Proxy (the disconnect fix) +
    telemetry scrub. **Do not touch without re-reading §6.**
  - `input.js` — keybinds + mouse/aim tracking (DOM).
  - `objectmanager.js` — world objects (DONE, see §4).
  - `combat.js` — the combat engine = the bundle's `updatePlayers` (DONE, see §4).
  - `helpers.js` — combat/placement/targeting verbs injected into every mod's ctx.
  - `configmenu.js` — the tabbed config overlay (the `` ` `` key / gear button).
  - `loader.js` — assembles everything, owns c2s re-encoding + sequence.
- `shared/gamedata.js` — weapons/items/hats/accessories/projectiles tables +
  lookups (`data.weapon(id)`, `data.item(id)`, `data.hat(id)`, …). Items carry a
  resolved `group` object.
- `shared/vocabulary.js` — the stable event/action contract (don't churn it).
- `loader/build.mjs` — concatenates `loader/src/*` (+ shared) into
  `loader/dist/moomoo-loader.user.js`. Module order matters; new modules go in the
  `MODULES` list.
- `moomoo-clone-main/` — the private SERVER (ground truth for all mechanics).
  Read `moomoo-clone-main/server/src/**` whenever you need exact server behavior:
  `network/packets.js` (c2s handlers), `moomoo/server.js` (sync loops, s2c),
  `moomoo/modules/{player,objectManager,gameObject,items,projectileManager}.js`,
  `anticheat/config.js`, `shared/config.js` (map/player/variant constants).
- `tests/*.test.mjs` — unit tests (`node --test tests/*.test.mjs`).
- `tests/live/*` — the LIVE harness (real server + real Chrome). See §5.

## 3. Standards / workflow (follow for every feature)
1. **Read the feature in the bundle first.** Find its toggle handle (see the
   glossary in §7), grep its `.checked`/`.value` usages, read the exact block, and
   resolve every minified symbol it touches. Port the logic line-for-line.
2. **Check the server** (`moomoo-clone-main/server/src`) for the real mechanic and
   constants rather than guessing.
3. **Port onto the engines**, not from scratch: read world objects via
   `ctx.objects`, combat state via `ctx.combat`. Translate the bundle's raw sends
   to loader verbs (see §7's packet/equip mapping).
4. **Unit-test it** (`tests/*.test.mjs`) — drive the runtime with `MooMoo._dispatch`.
5. **Live-verify it** against the real server + real client (§5). Never tell the
   user a feature works without proving it live. Watch for ANY anti-cheat action
   (close/kick/shame/strike) in server incidents.
6. **Rebuild + deliver**: `node loader/build.mjs`, `node mods/build-examplescript.mjs`,
   run the full unit suite + the relevant live tests, then send the built loader
   (and, if the mod changed, `mods/examplescript.user.js`) to the user with
   `SendUserFile`. Remind them to re-upload the loader to pastebin (unminified).
7. Keep `PORT.md` updated as you complete features.

## 4. What is already DONE and live-verified (build on it; don't redo)
- **Disconnect-on-damage fix** (`anticheat.js`): the client caches
  `dl = WebSocket.prototype.send` and sends via `dl.call(socket, frame)`, bypassing
  per-instance hooks. We Proxy `WebSocket.prototype.send` (still reports
  `[native code]`, so the server's SOCKET_HOOKED check stays false), re-sequence
  EVERY outgoing frame through one counter, and scrub the client's `T` telemetry.
- **Config menu** (`configmenu.js`): tabbed overlay, document-start-safe.
- **Object manager** (`objectmanager.js`, `ctx.objects`): mirrors the bundle's
  `GameObject`. Parses `H`(objectsLoad, flat `[sid,x,y,dir,scale,type,id,ownerSid]`),
  `Q`(objectKilled `[sid]`), `R`(objectsKilled `[ownerSid]` → remove all of owner),
  `L`(wiggle/hit `[dir,sid]`), `M`(turretShoot `[sid,dir]` → turret `.time=2200`
  reload), `S`(itemCount). Derives name/group/realScale/pathScale/trap/dmg/pDmg/
  owner. Queries: `near/spikes/walls/mills/traps/turrets/buildings/trapAt`,
  `isEnemyObject` (team-aware). Unit: `tests/objectmanager.test.mjs`. Live:
  `tests/live/objects.live.test.mjs`.
- **Combat engine** (`combat.js`, `ctx.combat`) = the bundle's `updatePlayers`
  (the `a`/playersUpdate handler), which is where the bundle runs its ENTIRE combat
  brain on the server tick. Per tick it reconstructs, for `self`(z) + every visible
  player: `x2/y2`+`preX/preY`, velocity/`movDir`/`movSpd`, `primary/secondary`
  +`primaryVar/secondaryVar`, `weaponR`; the reload clocks `pr`/`sr`/`tr`
  (`min(1, r + (delta>190?delta:ce)/(speed*samRP))`, reset to 0 on the `K` swing
  echo, samRP/samRS=0.78 under Samurai Armor hat 20); `np = l4(player)` (accel/
  decel/real next-position prediction, ported line-for-line); and on each health
  change the 9-tick **bull cadence** `lastBull`/`bleed`. Loadout
  (`ee/A/ly/uy/ay/ry/cy/dy/hy/fy`) resolves from `self.weapons/items`. Predicates
  `_y`/`Vy`/`o4` + geometry `se/B/S4/angleDist` ported 1-1. Exposed: `ctx.combat.{self,
  target(Y), visibleEnemies(vn), loadout, tick(v), et, se,B,S4,_y,Vy,o4,l4,x4,
  variantVal,weaponSpeed,weaponRange, K,ce,EN}`. Unit: `tests/combat.test.mjs`.
  Live: `tests/live/combat-engine.live.test.mjs`.
- **Inventory-default fix** (`runtime.js`): the server only sends `V`(inventory) on
  UPGRADE, never on spawn, so the loader started empty. The runtime now seeds the
  client defaults on spawn/respawn: `weapons [0]`, `items [0,3,6,10]`.
- Already shipped earlier: **auto-heal** (shame-safe), **autohat** (soldier/bull
  via `predictedDamage`; replace with real `dmgpot` once potentials land),
  **auto-attack** (basic), **auto-equip-fastest**, strict soldier/monkey.
- All unit tests + live tests currently green.

## 5. The live harness (this is how you prove parity)
- `tests/live/live-server.mjs` boots an ISOLATED copy of the server (never touches
  the real checkout/data) and gives login/join/protocol helpers + a server-incident
  tap. `tests/live/live-client.mjs` has a browser-like ws + an admin bot.
- The strongest tests inject the built loader + `mods/examplescript.js` into the
  REAL official client in headless Chrome (installed Google Chrome; bundled Chrome
  isn't downloaded). See `realclient.live.test.mjs` / `combat.live.test.mjs` /
  `objects.live.test.mjs` / `combat-engine.live.test.mjs` for the pattern.
- **Run them like this** (the server is now nested in this repo, and a scratch dir
  is required because the harness `mkdtemp`s inside it):
  ```
  MOOMOO_SERVER_DIR="$PWD/moomoo-clone-main" MOOMOO_TEST_TMP=/tmp/mmj-live \
    node tests/live/combat-engine.live.test.mjs
  ```
  (`mkdir -p /tmp/mmj-live` first; `LIVE_ECHO=1` to watch logs, `HEADFUL=1` to see
  the browser.) Also consider adding `path.resolve(root, "moomoo-clone-main")` as a
  candidate in `tests/server-fixture.mjs` so the nested copy is found without the
  env var — right now it auto-finds the sibling `../moomoo-clone-main` first.
- Sandbox: start the test server with `env: { IS_SANDBOX: "1", SANDBOX_UNLIMITED:
  "1" }` when a feature needs resources/placement (the user's server runs sandbox).
- The real spawn is crowded; when placing buildings, sweep directions until one
  lands (the `F` packet's dir sets the build angle; `this.dir` is used server-side).

## 6. The disconnect fix — never regress it
The server's anti-cheat (`moomoo-clone-main/server/src/anticheat/config.js`):
per-packet token buckets (F=[40,80], z=[20,40], c=[10,20], global=[150,300]),
40 strikes = kick; transport bad sequence/tag = immediate close; `SOCKET_HOOKED`
telemetry bit = kick; eating within 120ms of a hit 8× = forced Shame hat + eating
blocked. Therefore every auto-send feature MUST be bounded and driven by server
replies, never an open loop; never eat inside 120ms of a hit; and the loader must
keep owning a single gap-free c2s sequence (that's why `anticheat.js` Proxies the
prototype send). If you add outgoing sends, route them through the loader's
`send.*`/ctx verbs so they get sequenced, and keep rates under the buckets.

## 7. Bundle reverse-engineering cheat-sheet
**Where the combat system lives:** `async function updatePlayers(i)` (~line 15985)
is the `a`/playersUpdate handler and runs the WHOLE combat brain on the server tick
— reconstruction (the giant per-player line ~16009), then ALL the combos
(~16185–16415). The combos are NOT independent: they share frame-local state
(`g[0]`,`y`,`p`,`ct`,`Nt`,`Sg`) and the `Bg` swing helper, so port the tail as one
cohesive block, not feature-by-feature in isolation.

**Globals → engine/ctx:**
- `z` = self = `ctx.combat.self` (= MooMoo.self, enriched). `Y` = target =
  `ctx.combat.target`. `vn` = sorted visible enemies = `ctx.combat.visibleEnemies`.
  `J` = all players = MooMoo.players. `v` = tick = `ctx.combat.tick`. `et` =
  `ctx.combat.et`. `ce = 1000/9`, `u = ce*2` (combo duration).
- Loadout slots (`ctx.combat.loadout`): `ee`=primary weapon id, `A`=secondary
  weapon id, `ry`=food item, `ay`=wall, `ly`=spike, `cy`=mill, `dy`=mine/sapling,
  `uy`=trap, `hy`=turret/platform/etc, `fy`=spawn pad. Also `.spike/.wall/.food/
  .windmill/.utility` item defs.
- `Q` = objects within ~800px, `Xt` = within ~2000px, `kh` = all buildings. Use
  `ctx.objects.near(z.x2,z.y2,range,filter)` etc. `te(sid)` = is me/teammate =
  `ctx.objects.isFriendly(sid)` (so `!te(owner.sid)` = enemy object =
  `ctx.objects.isEnemyObject(o)`). `Nt` = self standing in an enemy spike-trap
  (compute via `ctx.objects.trapAt`). `Sg` = emp-able enemy turrets (auto-emp).
- Combo flags (module-local in the port): `p` = combo busy (blocks others; reset
  after `u`), `ct` = aim/attacking latch, `gt`/`Mt` = polearm-aids state (false
  unless polearm aids is on), `jt` = stop-on-collision state. `g[0]` = pending aim
  dir, `y` = pending weapon to select.
- Settings handles (the bundle reads DOM checkboxes; the port reads `ctx.settings`):
  `Cs`=apple insta, `Bs`=bleed insta, `to`=kbInsta, `Ds`=auto break, `Ps`=stop
  break, `cs`=auto place, `ms`=auto replace, `Js`=auto push, `fo`=polearm aids,
  `ko`=aids spike sync, `Xs`=melee sync, `Vs`=break spike trap, `no`=Auto Emp,
  `Ts`=autoQ, `Ys`=stop on collision, `zs`=movement on collision, `Hs`=autohat,
  `js`=strict soldier, `Ws`=strict monkey, `Ms`=auto equip fastest, `ls`=Auto Place
  Accuracy (APA slider), plus the Visuals/Extra handles (grep `getElementById`).

**Geometry/predicate primitives (already in `ctx.combat`):**
- `se(a,b,type)` edge distance (type `"player"`→ −63, `"object"`→ −b.scale, else 0)
  on predicted positions (`x2/y2` fallback `x/y`). `S4` center distance. `B(a,b)`
  angle a→b. `angleDist` smallest angle (bundle `Ay`/`getAngleDist`). `Z(deg)`=
  `toRad`. `_y(e,t=111)` = enemy reload readiness after t ms (==1 ready). `Vy(e,t,n,
  i)` = in range n now or on predicted-real positions. `o4(e,t)` = not shielded
  against us (weapon 11 = shield). `x4(p)` = movement speed multiplier.
- Variant damage mult `En = [1,1.1,1.18,1.18]` = `ctx.combat.variantVal(i)` /
  `ctx.combat.EN`; server's `K.weaponVariants[i].val` matches.

**Outgoing send translation (bundle `packet.send` aliases → wire → loader verb):**
- `packet.send("G", id, isWeapon)` → wire `z` → `MooMoo.send.selectItem(id,
  isWeapon)` (or `ctx.selectWeapon/selectItem`). Note `d`→`F`, `a`→`9`, `G`→`z`.
- `packet.send("D", dir)` → wire `D` → `ctx.aim(dir)`.
- `packet.send("d", 1, dir)` (alias `F`) → `ctx.place(...)` / mouse-down build.
- `packet.send("F", 1)` → `ctx.startAttack(dir)`; `packet.send("F", null, 0)` →
  `ctx.stopAttack()`.
- `equip(hatId, accId)` → `ctx.setHat(hatId)` / `ctx.setTail(accId)` (the bundle
  only equips OWNED hats and unequips to 0 otherwise; track owned hats/accessories
  if you need that guard — `Nn` = owned hats, `On` = owned accessories).
- `c4(item, dir, weapon)` / `u5(...)` = place helpers (buildings toward an angle).
- `Bg(dir, weapon, variant, hat, mode)` = the attack-with-equip helper (equip the
  right weapon+hat, aim, swing). Read it (~line 15838) and port it; the combos
  depend on it.

**Key mechanic references in the bundle (read before porting each):**
- apple insta ~16234, bleed insta ~16258, kbInsta ~16656, auto break ~16293–16347,
  auto place ~23019 (+ `Jm`/APA), auto replace ~13867/13892, auto push (`Ly`),
  break spike trap (`z.spikeTrap` ~16231), auto emp (`Sg` ~16288), polearm aids
  ~21170–21265, spike sync ~21098. Potentials: `p5`(self dmgpot ~21767),
  `m5`(enemy dmgpot ~21801), `w5`(kbpot ~21888), `O5`(placePot ~22495) + helpers
  `v3`(~18636), `P3`(~18896), `U5`, `y5`. `l4`(np) ~23240 (already ported in
  `combat.js` — reuse it). Reload fill `xy` ~16789, swing reset `k2` ~14623,
  health/bull `updateHealth` ~15646 (ported into `combat.js`).

## 8. Remaining work (in dependency order)
1. **Combo layer**: port the `updatePlayers` tail as one block — the control flags
   (`p/ct/gt/Mt/Nt/Sg`) + `Bg`/`c4`/`u5` helpers, then apple insta, bleed insta,
   auto break, melee sync. (apple/bleed insta + auto break need only `ctx.combat`;
   kbInsta/auto push need the potentials below.)
2. **Potentials**: `dmgpot`(p5/m5), `kbpot`(w5), `placePot`(O5) + `v3/U5/y5`. Then
   make autohat use the real `dmgpot` (replace the `predictedDamage` approximation),
   and enable kbInsta / auto push.
3. **Object-aware combat**: auto place / auto replace, break spike trap, auto emp
   (turret `.time`), polearm aids, aids spike sync, APA slider, autoQ.
4. **Visuals tab**: build a render/overlay subsystem (the loader doesn't draw the
   game — add a canvas overlay synced to the game camera), then reload bars/arcs,
   building hp/owner, grid, stacked damages/heal, skull, shame count, shadows,
   animated text, ChatLog, vis aim, hide name, see-through player, visual presets.
5. **Extra tab**: send-ws raw packet panel, autobuy, fakePing (+ ping slider).
   (Skip the bot-coordination parts of "send ws".)

Verify each against the live harness before telling the user it's done, and keep
every auto-send bounded + sequenced so the anti-cheat never fires.
