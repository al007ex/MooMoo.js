# moomoo.js: continuation brief

Read this whole file before you touch anything. `PORT.md` is the older running
log. This file supersedes it wherever the two disagree. Work in this repo
(`MooMoo.js`), on branch `claude/compassionate-ride-w2xudy`.

---

## 1. Main objective

The user runs their **own private MooMoo.io-clone server** (it is in this repo at
`moomoo-server/`). This repo is **moomoo.js**, a modding framework for it:

- a **loader**: a Tampermonkey userscript that hooks the game's WebSocket, decodes
  and encodes the server's keyed protocol, and exposes a stable API
  (`window.MooMoo`) plus engines (combat, objects, store, outgoing governor);
- **mods** that run on that API.

The reference is `examplescript.js` at the repo root: a 23.5k-line **modified old
game client** ("**the bundle**") with a big combat mod woven into it. It targeted
an old protocol and can't run on this server. **The goal is to have every one of
the bundle's features inside the new mod `mods/examplescript.js`, behaving exactly
1-1 with the bundle**, running on the loader against the user's server, plus
whatever extra moomoo.js API the work needs.

The user, verbatim: *"copy every single workflow and every single feature exactly
so they behave 100% the same"*, *"i want everything"*, *"go as deep as the script
is, everything should be 1-1 even if it means writing a lot of code"*, *"i dont
care how substantial the work is, and i dont care if you say it's unobservable"*,
*"i want every single visual feature accessible too. weapon reloads, object health
bars, etc. everything"*.

### Hard rules
- Private, educational/testing use only. Never publish or share anything, except
  the built loader, which goes to the user's own pastebin (the mod `@require`s it).
- **Exclusions** (user's decisions): **bots** (the whole Bots tab and bot plumbing:
  `ie`, `ts`, `es`, `Ci` formations, `Zy`, `w3`), and **chat commands** (`Xp`,
  pathfinder chat goals). Also the "send ws" relay (`Ki`/`Hn`). It never connects
  in the bundle anyway (a T5 bug).
- If the bundle and the server disagree, **translate the bundle's way into what the
  server does** (user's rule). Examples already done: store `c` action is swapped
  (bundle 0=equip/1=buy, server 0=buy/1=equip); `D`/`9` source tags are dropped
  from the wire; the ping loop runs at the server's `0` bucket rate; sandbox comes
  from `window.config.inSandbox`; and there is a 5th weapon variant (`En[4]=1.18`).
- Never reproduce the slur in the bundle's default bot-name string (~line 648).
- **Never minify** the delivered loader.
- **Never regress the disconnect fix**: the `WebSocket.prototype.send` Proxy, one
  gap-free c2s sequence for all frames, and the telemetry `T` scrubbed to `[0,0]`.
  Keep the loader undetectable.
- Keep `shared/vocabulary.js` stable. Game logic goes in loader modules or the mod.
- Never commit the official client (FRVR's). The repo is public.
  `moomoo-server/client-official/`, `client/`, `dist/` and `server/data/` are gitignored.
- Commit trailers: `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` and
  the session link. Pushing currently fails with **403**: the user must reconnect
  GitHub / install the Claude app (https://claude.ai/connect-github). All work is
  committed locally.

---

## 2. Architecture (how the port is built)

### Loader (`loader/src/*.js` → `node loader/build.mjs` → `loader/dist/moomoo-loader.user.js`)
- `anticheat.js`: WebSocket constructor and `prototype.send` Proxies (the disconnect fix).
- `protocol.js`, `msgpack.js`, `sha256.js`, `binding.js`: the codec. `binding.js` is the
  only wire↔name map. It also has `outgoingParse` and `rateLimits`, which mirror
  the server's anti-cheat buckets.
- `loader.js`: owns the single c2s sequence. Every official-client frame is decoded,
  passed through mods' `onOutgoing` filters (they can drop or rewrite it), then
  governed and re-encoded. Exposes `MooMooLoader.{net,store,config,combat,...}`.
- `outgoing.js`: the governor. It refuses anything that would overflow a server
  bucket (no strike), and handles ping timing (`pong` payload carries `ms`).
- `runtime.js`: `window.MooMoo`, the event dispatch, `send.*`, the mod registry, and ctx.
  ctx includes `onOutgoing`, `onSent`, `after`, `onCleanup`, `onSettingChange`, and
  `settings`/`setSetting`.
- `combat.js`: **the bundle's player model and tick pipeline (`updatePlayers`)**.
  It reconstructs every visible player per tick exactly like the bundle. Reload
  resets (`k2`) and projectile owners (`tg`) are deferred via `pn`. Health analysis
  (`l5`: shame, bull cadence, spike hits) runs in the next frame. It provides `A4()`
  next-tick promises, the O3 building-damage inference, animals, projectile
  stepping, the sandbox flag, and the render-rate interpolation (`x/y/dir`).
  **Hook points at the bundle's exact places**: `onPreTick`, `onTickStart`
  (after v++), `onPostReconstruct`, `onAfterSleep` (after the 1 ms wait + Xt/Q),
  `onDeferredFlushed`, `onAfterPlayers`, `onFrame` (before `by()`), `onFrameLate`
  (after `by()`), `onFramePlayer(i, "died"|"damage"|"deathAnim")`, `onProjectile`,
  `onPlayerAdded`, `onBuildingDamage`.
- `objectmanager.js`: the bundle's `GameObject` (`Gl.init`, `getScale`, and now
  `update`: wiggle ease-out plus mill rotation gated by a hook), plus `onRemove` taps.
- `store.js`: owned/equipped hats and tails from `"5"`, with the bundle's
  `equip()` semantics and `forgetEquipped()`.
- `configmenu.js`: the tabbed settings menu. The toggle key is now dynamic, and the
  mod sets it to **Escape** like the bundle.
- `helpers.js`: legacy ctx helpers from the first port (still loaded, mostly unused now).

### The mod (`mods/examplescript/*.js` → `node mods/build-examplescript.mjs` → `mods/examplescript.js` + `.user.js`)
The parts are concatenated in name order into **one function body**, so they share
one scope. **The bundle's minified names are kept on purpose**, so any line can be
compared side by side with the bundle. The glossary is at the top of `10-env.js`.

| part | contents (bundle line refs inside) |
|---|---|
| `00-head.js` | SETTINGS (the bundle's exact menu: Combat/heal/Visuals/Keybinds/Throttles/Extra), `MooMoo.register` |
| `10-env.js` | globals with the bundle's initial values, the config constants `K`, `x` items, `X` utils, toggle handles (`tog()` → `.checked/.value`), engine aliases, `sync()` (mirrors engine state at every hook), `own()`/`listen()` cleanup helpers |
| `11-packet.js` | the bundle's `packet.send` (aliases, its own He/We limiter, move dedupe, St/qt) and `toWire()` translation; `equip/Rp/Mp`; the takeover (drops the official client's aim/move/mouse/toggle) |
| `20-world.js` | object manager `C` (`add`, `checkItemLocation*`, fake objects `Ze/$e/Je`) |
| `30-input.js` | keys/mouse (`Tm`/`Cm`), movement `Om`, spike-stop `E3`, zoom (q+wheel, p), Escape → menu, store-reply bookkeeping (Fn/Gt/Kt), item select/map ping owned by the mod |
| `40-potentials.js` | `p5 m5 y5 w5 v3 k3 O5 U5 j5 H5 W5 Q5 Y5 l3 h3 m3 g3` (damage/kb/place potentials, spike-kb visual) |
| `50-placement.js` | `c4 d4 h4 u4 p4 f4 u5 Z5 L5 F5 _5 J5 Jm q5 $5 e4` (auto place), auto replace (`$m` via `objects.onRemove`), `i4`, spike-tick helpers, `kx Ax Og d5` |
| `55-autopush.js` | `Oy Ly Fy Py` + the A* worker (`F3/U3`) |
| `60-combat.js` | the whole `updatePlayers` tail on the engine hooks: autoQ, heal, autohat `Vg/b5`, `Tg Cg Bg Rg`, apple/bleed/kb (`sy`)/r-R (`P5`)/Numpad* (`Nx/Mx`) instas, polearm aids `Qx/Yx`, spike sync `jx`, auto break / break spike trap, anti-boost, anti bow insta, Auto Emp, Assassin, shame leak, aim/weapon/auto-gather sends, `A5 t3 s4 Iy $y`, death/damage logs |
| `70-chatlog.js` | the bundle's chat-log panel `b()` (ChatLog visual), chat lines, the ping loop + display (fakePing) |
| `80-overlay.js` | the overlay canvas, inserted after `#textCanvas` with pointer-events off; the floating text `U1` (`Ml/Nl`); the frame driver |
| `81-render-lib.js` | **verbatim** bundle draw functions (`b2 c2 A2 I2 C2 M2 O2 F2 j2 H2 ...`, `Le`, icons) |
| `82-render.js` | the bundle's main render loop `l2` + the per-player overlay + chat bubbles (verbatim), camera, `sm()` 0.7× canvas, entity swing animations, client-side projectiles, `"8"` damage numbers |
| `83-minimap.js` | `Sp()` extras: destroyed-out-of-view buildings (`Yt`) drawn with the bundle's item icons over the official minimap |
| `90-debug.js` | test-only `window.__mmjES` (only when `localStorage.mmj_debug === "1"`) |
| `99-tail.js` | closes setup and boot |

**The visuals decision:** the bundle drew the whole game itself, and most of its
visuals live inside that drawing (custom player colours, sprite shadows,
see-through players, hit pulses, placement previews, hidden names, its grid,
tints, zoom). The official client renders with WebGL, which can't be altered. So
the overlay draws **the bundle's complete frame, opaque**, over the official
canvas. Every Visuals toggle then behaves as in the bundle. The overlay shows only
once you've spawned. If a frame throws, it is cleared so the official rendering
shows through. DOM UI (leaderboard, action bar, store, minimap, chat) stays above it.

---

## 3. What is done and verified

- All of the above is written and builds. `eslint no-undef` is clean (use
  `/opt/node-tools/node_modules/.bin/eslint` with a config like the one described
  in §5; only harmless `var` redeclarations from verbatim bundle code remain).
- Unit tests: `node --test tests/*.test.mjs` → **21/21 pass**.
- Live tests (real server + real Chrome), **all pass**:
  - `tests/live/examplescript.live.test.mjs` (new): spawn, ticks, chat log,
    overlay mounted, Escape menu, tail running, **auto heal live** (75→95→100 per
    hit), "Encountered" log, **zero anti-cheat incidents**, no page errors. It also
    writes a screenshot to `/tmp/mmj-es.png`.
  - `realclient`, `combat-engine`, `objects`, `combat`, `autoheal` (old tests, still green).
- Seen live, but not asserted: anti-boost walls/spikes you in when an enemy rushes
  you (the admin bot's teleports trigger it). The bundle renderer draws grid, tint,
  shadowed resources, sid numbers, gain/leak text, neon health bars, the far-target
  name and animal health.

## 4. What still needs to be done (priority order)

1. **Feature-level live verification.** Not yet done for most combat features.
   Write `tests/live/examplescript.features.live.test.mjs` with the admin bot
   (packets.js admin: `weapon <id> <variant> <target>`, `item <id> <target>`,
   `give <0..3> <amt> <target>` (3 = points), `goto`, `summon`, `tp`, `spawn`).
   Give the player a polearm (5) + great hammer (10) and items (spikes 6/7, pit trap 15).
   For points, buy hats through `MooMoo.send.store` (or let sandbox autobuy do it).
   Then prove, with zero incidents:
   - **autohat**: soldier near an enemy, biome hat when idle, emp vs turrets.
   - **auto break**: the bot places a pit trap on the player (bot `goto` puts it at
     +70 px, so a trap placed facing the player lands on them) → the player breaks
     it with hammer + tank gear.
   - **auto place / auto replace** near an enemy.
   - The instas (apple/bleed/kb/r-R/TA/PA) show their chat-log lines.
   - **auto push**, **autoQ**. autoQ needs ping ≥ 95, so add latency.

   Use `window.__mmjES.state()` / `.eval("name")` (needs `localStorage.mmj_debug="1"`)
   to read bundle variables. The live test server runs in **sandbox** (`_n` true).
2. **Fidelity review.** The `bundle-port-fidelity` workflow was stopped early (only
   1 of 6 chunks returned). Re-run a line-by-line comparison of every part against
   the bundle ranges listed in the part comments. The parts written earlier
   (`40-potentials`, `50-placement`, `20-world`) were transcribed from memory in a
   previous context and are the most likely to drift. Known open item from that
   review: `c3` (18415) and `g5` (21864) are unported. They are never called, so
   adding them is optional.
3. **Visual check against the bundle.** Compare screenshots for colours/tints/
   positions. Known gaps:
   - **zoom** works on the overlay, but the official client underneath keeps its
     fixed view (harmless, it's covered).
   - **"hide name"** works, because the overlay is opaque.
   - The official **boss health bar and map markers** drawn in the canvas are
     covered (the bundle didn't have them).
   - Official-only content the bundle can't draw (new AI types without sprites) needs checking.
   - The minimap only adds the `Yt` icons; the rest is the official minimap.
4. **Pathfinder (`si`/`ri`, Xy/Jy, bundle 17336-18290) is not ported.** It is
   driven by chat commands, which the user said to skip. Still reachable without
   commands: the `K` key quick waypoint and its waypoint drawing (minimap +
   `drawWaypoints`). Port `Jy` waypoints if the user wants them.
5. **Performance.** Two renderers now run (official WebGL + the bundle's 2D at
   0.7×). Consider `visibility:hidden` on `#gameCanvas`/`#textCanvas` while the
   overlay is drawing. That stops their compositing; the client logic is unaffected.
6. **Cleanup.** `loader/src/helpers.js` holds legacy helpers from the first port
   (e.g. its `fastestWeapon` picks the shield). Prune or fix it once nothing
   uses it. Update `PORT.md`. Re-check the "fix ws", "send ws", "melee sync" and
   quest toggles: they exist in the menu but are dead in the bundle too (fine).
7. **Deliver after each change**: `node loader/build.mjs && node mods/build-examplescript.mjs`.
   Send the user `loader/dist/moomoo-loader.user.js` (to re-upload, **unminified**,
   to their pastebin, `https://pastebin.com/raw/jWDq3mmF`) and
   `mods/examplescript.user.js`.

## 5. How to work

- Per feature: read the bundle → check `moomoo-server/server/src/**` (ground truth
  for mechanics: `network/packets.js`, `moomoo/server.js`, `moomoo/modules/*`,
  `anticheat/config.js`) → port 1-1 with the bundle's names → unit test → **live
  test** → build → deliver. Never tell the user a feature works without live proof.
- Live tests:
  ```
  mkdir -p /tmp/mmj-live
  MOOMOO_SERVER_DIR="$PWD/moomoo-server" MOOMOO_TEST_TMP=/tmp/mmj-live node tests/live/examplescript.live.test.mjs
  ```
  Set `LIVE_ECHO=1` for logs and `HEADFUL=1` to watch. Chrome runs as root with
  `--no-sandbox` (`chromeArgs()`). Watch `srv.incidents()`: any close, kick,
  strike or shame is a failure.
- Server anti-cheat buckets ([refill/s, burst]): global [150,300], D[60,120],
  9[40,80], F[40,80], z[20,40], c[10,20], K[10,20], H[10,20], 0[2,4], S[1,2],
  6[2,4], T[1,3]. 40 strikes = kick. Eating 8× within 120 ms of a hit = Shame.
  The loader governor refuses anything over a bucket instead of sending it.
- Lint the built mod for undefined names with eslint 10 (`/opt/node-tools`), using a
  flat config with `no-undef` and browser globals (window, document, Image, Blob,
  Worker, URL, OffscreenCanvas, createImageBitmap, MutationObserver, ...). The
  config file must sit inside the repo dir.
- Bundle landmarks: `updatePlayers` 15985 (tail 16074-16413), render `l2` 14065,
  draw helpers 14470-15135, keys `Tm` 13412 / `Cm` 13514, `Om` 13609, menu HTML
  ~470, globals 599-797, config `K` 2005-2180, items with icon urls ~3500-3810.
