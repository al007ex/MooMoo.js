# MooMoo.io Private Server

A local MooMoo.io server that runs the **current official client** (v1.9.1, bundle
`index-04fd22e2.js`, API version 1.28), speaking the real packet protocol and anti-tamper
system, with a local stand-in for every online service the client expects (accounts,
friends, servers, clans, profiles, Discord linking, captcha, ads).

> Fan project for personal use. MooMoo.io, its client code, art and names belong to their
> owners (MooMoo.io / FRVR). The game's real server code isn't public: anything marked
> **reconstructed** below was designed for this server from what the client shows and
> may differ from how the live game behaves.
>
> Run it on your own computer only. Don't host it publicly or put `client-official/source/`
> in a public repository: those files are FRVR's, and the sign-in screen looks exactly like
> the real one.

---

## Quick start

```bash
npm install
npm run build      # patches the official client into dist/official
npm start          # http://localhost:8080
```

Open <http://localhost:8080>. Press **Play as Guest**, or **Sign In** with any email and any
6-digit code.

Admin console (in a second terminal while the server runs):

```bash
npm run console              # interactive prompt
npm run console -- tp me falls
```

---


### New in v1.9.1 **[client UI / local backend]**
Everything below arrived with the October update (`index-04fd22e2.js`) and works here:

- **Friends:** add players by name, accept or decline requests, see who's online and on
  which server, **Join** them or send an **Invite** (a banner pops up for them). Signed-in
  players find it under **Friends** in the menu and in the in-game menu.
- **New account settings:** *Friend Notifications*, *Allow Friend Requests* and *Allow Clan
  Invitations*. With requests or invites turned off, the client says *"That player isn't
  taking friend requests"* / *"That player isn't taking clan invitations"*.
- **Report reasons:** after **Report**, the client asks *"What for?"* (Bot / Hack /
  Autoheal / Abuse). Staff see it on the profile panel: *"Reported by X for Bot"*.
- **Staff panel on guests:** staff who click a guest on the leaderboard get the guest's
  reports and anti-cheat flags, with **Kick**, **Ban**, **IP ban**, **Shadow** and **Clear**.
- **Copy link** on profiles and clans: `http://localhost:8080/player/<name>` and
  `/clan/<name>` open the game with that card (`?profile=` / `?clan=`).
- **Discord linking:** `discord <username>` in the console plays the part of the Discord
  bot's `/link` command and prints a link. Opening it while signed in asks *"Link your
  MooMoo.io account to the Discord account …?"*.
- **Clans:** owners can **Stop requests to join** (visitors see *"Not taking requests to
  join."*). Rude clan tags are refused.
- **Name rules:** *"That name would show as "Zo Moo" in game - pick another"* for characters
  the game strips, and *"That name isn't allowed - pick another"* for names its word filter
  blocks. Social handles get the same treatment (*"just the handle - letters, numbers,
  dots, underscores and hyphens"*).
- **Server failover:** when a server shuts down, open games show *"MB has closed - switched
  you to LC. Press play."* Signed-in players are moved to a members server unless they
  picked a server themselves.
- **Client-only extras:** *Show Grid* and *Camera Lock* settings, the skin colour is
  remembered, key bindings by item (*Wall*, *Spikes*, *Windmill*, *Age 7 Item*…) and for
  menus (*Shop*, *Tribes*, *Game Menu*), double-tapping an item in the action bar on a touch
  screen places it at once, iPads get the touch controls, and the shop is sorted by price.

### Raid boss: the Crab King **[client visuals / reconstructed fight]**
A 480,000 HP crab that fights alone in the **secret pool** west of the map. Its health bar appears at the top
of the screen while you're in the pool. It turns **blue** while the King is underwater,
when it can't be hurt.

| Move | What you see | Preview |
|---|---|---|
| Dive | sinks into a dark silhouette with bubbles, glides under the water, surfaces with a blue ring and a white splash | `boss crab attack dive` |
| Slam | orange danger circle around the King, then a heavy knockback | `boss crab attack slam` |
| Geysers | the whole pool fills with dotted bubble geysers that erupt together | `boss crab attack geysers` |
| Claw | red chevron lines race out toward players | `boss crab attack claw` |

- It attacks faster as its health drops (`boss crab hp 30` jumps to a late phase).
- On a kill, everyone who did at least 5% of the damage earns the **Crab Shell** hat. The
  🦀 *"Killed the Crab King"* badge appears next to their name on the leaderboard.
  The whole server gets a chat announcement, and clans get a "raid boss kill".
- It respawns 10 minutes later. `bossfight crab me god` starts a fresh fight on demand.

The effect visuals (colours, rings, chevrons, bubbles, the blue bar and the dive animation)
are drawn by the official client. The attack choice, timing and damage are reconstructed,
based on footage of the real fight.

### The secret area **[client map / reconstructed physics]**
West of the map edge at river level is a **gorge** leading to **The Falls**, a chain
of **pools** and a **waterfall**. The map (gorge walls, sand, water, waterfall) is drawn by the
client from its `secretPool` config. The server lets players walk there (the client's own
map-edge clamp would not) and treats the pools as deep water.

`tp me gorge`, `tp me falls`, `tp me pool`, `tp me waterfall`

### Other bosses **[client]**
| Boss | Where | Preview |
|---|---|---|
| **MOOSTAFA**: 18k HP, leaps, 1-minute respawn | desert | `bossfight moostafa me` |
| **MOOFIE**: giant fast wolf, charges players, 30 s respawn | snow | `bossfight moofie me` |
| **Treasure**: 20k HP chest worth 5,000 gold | grassland | `bossfight treasure me` |

### New mobs **[client]**
| Mob | Notes | Preview |
|---|---|---|
| Boar | hostile, charges, 900 HP | `spawn boar 3` |
| Yeti | hostile, leaps, 3,200 HP (lives in the snow) | `spawn yeti` |
| Sheep | passive, drops 150 food | `spawn sheep 5` |

### Hidden staff features **[hidden / client UI]**
The client contains a full staff toolkit. Make your account an admin (`npm run console --
role <your name> admin`, then rejoin) and a **shield button** appears next to the store:

- **Powers:** God, **Aura** (glowing aura around the player), **Godlike**, **Boss** (you become a
  raid boss: everyone else sees a boss health bar for *you*), Invisible
- **Multipliers:** size, damage, speed and health
- **Spawn** any animal, **go to** The Falls / Centre / Snow, **go to mob** (Crab King, MOOSTAFA…),
  **go to / summon** players
- **Give** any weapon in any variant (including **emerald**), items, and 1k of each resource
- **Delete tribe**, the staff **minimap** (shows everyone), joining full servers
- **Moderation:** **Ban** and **Shadow** buttons in the report menu, a staff panel on
  profiles and on guests (reports with reasons, anti-cheat flags, verdicts, Kick / Ban /
  IP ban / Shadow / Clear), shadowing players on the top boards

Same from the console: `godlike me`, `aura me`, `bossmode me`, `invisible me`, `size me 3`.

### New gear **[client data / reconstructed effects]**
- **Hats:** Scout Hat (faster, more damage taken), Frost Helm (normal speed in snow, less damage),
  **Crab Shell** (Crab King drop: reflects damage, less damage taken). `hat me crab shell equip`
- **Emerald weapons:** the 5th variant above ruby, **members only**, with **15% lifesteal**.
  `weapon me katana emerald`
- **Accessory effects:** every accessory now has a real effect. The client only ships the
  descriptions, so the numbers are reconstructed: Tree / Stone / Cookie Cape (+1 resource per
  hit), Cow Cape (1.5× from cows), Snowball / Winter Cape (less or no snow slowdown), Skull Cape
  (3× gold for killing the kill leader), Dash Cape (+5% speed), Dragon Cape (+5% damage after a
  hit), Super Cape (after a kill: +5% damage, +15% speed), Troll Cape (2× gold for spike kills),
  Thorns (heals a little on hit), Blockades (−25% projectile damage), Devils Tail (bleed).
  `accessory me dragon cape equip`

### Accounts, profiles, clans, friends **[client UI / local backend]**
- **Sign in** with the real email-code card (any code works), or "Use password instead"
  (any password). Your first name becomes **permanent**.
- **Members-only servers** in the server picker (shield icon, 80 players). Signed-in players
  get them by default.
- **Profiles:** lifetime combat stats, K/D, resources, animal and boss kills per species, best
  score, lives, playtime, recent day / week / month stats, socials, a **live** "this life"
  panel while the player is in game, and **Copy link**.
- **Clans:** persistent 3–4 letter clans with owner / officer / member ranks, invites, join
  requests (which owners can switch off), past members, clan stats and raid kills. Clan tags
  appear on the leaderboard (`[CLAN]`, `[tribe:CLAN]`, `[solo:CLAN]`).
- **Friends:** requests, online status with the server each friend is on, Join, Invite,
  "is now online" / "has joined …" notices, and the three account settings.
- **Top boards:** players and clans by kills this week, this month and all time, plus the menu
  spotlight ("Player of the week: …").

To show friends in a video, sign in with two different emails (for example in a normal and a
private window) and add each other by name, or run `befriend <name> <name>` in the console.

### Anti-cheat you can demo **[client + server]**
- **Userscript detection:** with Tampermonkey or Violentmonkey installed, a red banner appears:
  *"…that can modify the game was detected"*.
- **Shame!** hat: eat 8 times within 120 ms of being hit and you're shamed for 30 s
  (no eating). `shame me` forces it.
- **Debugger trap:** with DevTools open, the page keeps pausing (the client's anti-debug).
- **Tamper-proof traffic:** edited, replayed or forged packets get you disconnected
  ("Could not verify the connection").
- **Old client:** after `npm run start:new-build`, open pages show *"Game updated - please reload"*.

### Dormant code found in the client **[hidden]**
- `DAY_INTERVAL` = 24 minutes: a day/night cycle constant whose rendering has been removed.
- `MAX_ATTACK`, `MAX_SPEED`, `MAX_TURN_SPEED`: animal tuning that's multiplied by 0 (inactive).
- **Crab** and **Crabling**: two diving crab mobs defined in the client's animal table
  (entries 13 and 14) that never appear in the game. The Crab King is the only crab.
- **Texture packs** (*"Texture pack (dev)"* in Settings): new in v1.9.1, but the client only
  loads the editor (`texture-pack-*.js`) on moomoo's dev servers, so it stays hidden here as
  it does on moomoo.io.
- A localhost developer mode (`?api=local`, `?cf=interactive`, `?atlas=`, a
  `moo_dev_frvr_token` sign-in shortcut, debug renderer globals). The build patches it out so
  the page behaves exactly like moomoo.io.

---

## Admin console

The console runs inside the server and is reached through `npm run console`. It only accepts
requests from this computer that carry the token in `server/data/admin.token`.

```text
moomoo> me alex                       # tell it who "me" is
moomoo> tp me falls
moomoo> spawn yeti 3 near me
moomoo> bossfight crab me god
moomoo> boss crab attack geysers
```

Players can be named by name, prefix, `#sid` or `me`. Places: `centre river snow desert gorge
falls pool lair waterfall nw ne sw se moostafa moofie treasure` (`places` lists coordinates).

| Command | What it does |
|---|---|
| `players`, `where <p>`, `status` | who is online, positions, biomes, servers |
| `tp <p> <place \| x y \| player \| mob <animal>>` | teleport |
| `bring <p> [to <p>]` | pull a player to you |
| `spawn <animal> [n] [near <p> \| at <place\|x y>]` | spawn animals (they don't respawn) |
| `animals [list]`, `clear <animal\|spawned\|all> [server]` | list or remove animals |
| `boss <crab\|moostafa\|moofie\|treasure> status\|spawn\|tp <p>\|hp <1-100>` | boss control |
| `boss crab attack <slam\|geysers\|claw\|dive>` | force a Crab King move |
| `bossfight <boss> [p] [god]` | fresh boss + teleport into the arena |
| `bossmode <p> [on\|off]` | turn a player into a raid boss |
| `god`, `godlike`, `aura`, `invisible <p> [on\|off]` | powers |
| `size`, `speed`, `damage`, `maxhealth <p> <x>` | multipliers |
| `heal <p>`, `kill <p>`, `shame <p> [s]` | health |
| `give <p> <wood\|food\|stone\|gold> <n>`, `age <p> <n>` | resources and ages (with upgrade picks) |
| `weapon <p> <name> [gold\|diamond\|ruby\|emerald]`, `item <p> <name>` | gear |
| `hat <p> <name> [equip]`, `accessory <p> <name> [equip]` | cosmetics (incl. Crab Shell) |
| `friends <account>` | an account's friends, requests, settings and Discord link |
| `befriend <account> <account>` | make two accounts friends straight away |
| `discord <discord username>` | stand-in for the Discord bot's `/link`: prints a link to open |
| `announce <text>`, `restart <s>` | chat notice, "Server restarting in m:ss" banner (stays until players rejoin) |
| `kick`, `ban` (IP + device + account), `unban`, `role <name> <admin\|mod\|none>`, `flags <p>` | moderation |

### Scene scripts for a video
```text
# Crab King raid
bossfight crab me god
boss crab attack dive
boss crab attack geysers
boss crab attack claw
boss crab hp 25            # final phase: faster attacks
god me off

# Tour of the secret area
tp me gorge
tp me falls
tp me waterfall

# Mob parade
tp me centre
spawn boar 2
spawn yeti
spawn sheep 4

# Become the raid boss
bossmode me on
announce A wild boss appeared!

# Friends and Discord (two signed-in accounts, e.g. a normal and a private window)
befriend alex bob          # then open Friends: Join / Invite
discord moo_fan            # open the printed link while signed in
```

---

## How it works

```
browser (official client, patched)                 this server
------------------------------------------------   --------------------------------------
index.html  import map -> /p/<id>.js  ------------> protocol build (BUILD_ID, salt, mixKey)
shim.js     FRVR SDK, Turnstile, ads  ------------> /api/auth/*  (any code / password)
            FRVR social (friends)  ---------------> /api/social/*, /api/social/ws (presence, invites)
fetch(Ce + ...) servers, join, profiles, clans ---> /api/*       accounts, clans, top, tickets
WebSocket ws://host/s/<server>?token=tk:..&b=.. --> gate -> io-init -> keyed frames -> Game
```

### Official client (`client-official/`, `tools/build-official-client.mjs`)
`client-official/source/` holds the files saved from moomoo.io, unmodified. The previous
version (v1.9.0, `index-228e9652.js`) is kept in `client-official/archive/`.
`npm run build` creates `dist/official/` by:

1. **Patching the bundle.** moomoo's minifier renames things on every build, so each patch is
   a pattern that captures the names. Each must match exactly once, so a newer build fails
   loudly instead of half-working:
   - `const Ae=!1` makes the client behave as on moomoo.io: anti-tamper on, `/join` tickets,
     no dev globals.
   - The localhost sign-in shortcut (`moo_dev_frvr_token`) is switched off.
   - The API base `Ce` points to `/api` on this server.
   - Servers in region `"local"` live on this host at `/s/<key>`.
   - Sockets use `ws://` when the page is served over `http://`.
   - Server pings use the page's protocol.
   - The FRVR social API points to this server.
   - **Copy link** builds links to this server instead of moomoo.io.
2. **Restoring the static page** from the saved snapshot. It removes the injected CookiePro
   banner, the Turnstile iframe, ads and browser-extension leftovers, empties the containers
   the game fills itself, resets the signed-in state a saved page can carry (disabled name box,
   account row, account settings), and adds the import map, `shim.js` and the module script.
3. **Adding `shim.js`**, a local FRVR SDK (bootstrapper, tracker, ads, profile, **auth** with
   `getFRVRID` and `authenticatedFetch`, and **social**), an instant-pass Turnstile, and ad /
   consent no-ops. The social part copies the SDK: REST calls go to `/api/social`, and the
   live socket speaks the SDK's `{code, data}` messages (`ON_CONNECT`, `FRIEND_STATUS_UPDATED`,
   `RECEIVE_GAME_INVITE`, `UPDATE_STATUS`, `SEND_GAME_INVITE`) with game id `moomoo`.

`npm run build:no-anti-debug` also turns off the debugger trap. Use it if you need DevTools.

### Protocol (`server/src/protocol/`)
Everything here mirrors the client function named in brackets (names from
`index-04fd22e2.js`; they change on every build). The protocol didn't change in v1.9.1, and it
was verified against the new client's own code with 14,900 automated checks.

- **Build module** `/p/<id>.js` exports `BUILD_ID`, `BUILD_SALT` and `mixKey`, as moomoo.io's
  per-deploy module does. This server generates its own: a random id, salt and ARX key mixer.
  It's kept in `server/data/protocol-build.json`, and `npm run start:new-build` rolls it.
- **URL** `ws://host/s/<server>?token=tk:<ticket>&b=<BUILD_ID>`
- **Handshake** (the only plain frame): `["io-init", [socketId, seed, keyHex, 1, 1]]`
  - `key = mixKey(hex(keyHex), seed)`
  - packet tables are a mulberry32 Fisher–Yates shuffle of the packet names, seeded with
    `seed ^ imul(BUILD_SALT, 2654435761)` [ml/xl/ou]
- **Client → server frame:** `tag(6) || mask(msgpack([id, args, seq]))`
  - `tag` = HMAC-SHA256(key, body)[0..6] [su/ru]
  - `mask` = xorshift32 keystream seeded with `c2sSeed ^ u32(tag)` [pl/du]
  - `seq` must be exactly the previous `seq` + 1
- **Server → client frame:** `mask(msgpack([id, args]))`, seeded with
  `s2cSeed ^ imul(n, 2654435761)` for the n-th frame [cu]
- **Close codes:**

  | Code | Client message |
  |---|---|
  | 4001 | Invalid Connection |
  | 4002 | Game updated - please reload |
  | 4003 | Sign in to play on this server |
  | 4004 | Please play at moomoo.io |

**Client → server packets (21):**

| Id | Meaning | Id | Meaning |
|---|---|---|---|
| `M` | spawn `{name, moofoll, skin}` | `D` | aim direction |
| `9` | move direction (null = stop) | `e` | reset movement |
| `F` | mouse `[down, buildDir]` | `z` | select `[index, isWeapon]` |
| `H` | upgrade pick | `K` | `0` lock rotation, `1` auto-gather |
| `L` | create tribe | `N` | leave tribe |
| `b` | request to join | `P` | answer request `[sid, accept]` |
| `Q` | kick member | `c` | store `[0 buy \| 1 equip, id, isAccessory]` |
| `6` | chat (≤30 characters) | `S` | map ping |
| `0` | ping | `T` | **telemetry** `[flags, untrustedEvents]` |
| `R` | report `[sid]`, its reason `[sid, 0, 1 Bot \| 2 Hack \| 3 Autoheal \| 4 Abuse]`, or staff `[sid, 1 shadow \| 2 ban]` | `A` | admin command |
| `V` | watch live stats `[sid]` | | |

**Server → client packets (38):**

| Id | Meaning | Id | Meaning |
|---|---|---|---|
| `io-init` | handshake | `A` | `{teams}` |
| `B` | disconnect reason (`kicked`, `server is full`, `Server is restarting - pick another`…) | `C` | your sid |
| `D` | player data (13 fields incl. aura, boss mode, clan) | `E` | player left |
| `a` | positions `[sid,x,y,dir·100]`, changed attributes `[sid,build,weapon,variant,team,leader,hat,tail,icon,z]`, hidden sids | `G` | leaderboard (entries, roles, dead, 🦀, clan tags, tribes) |
| `H` | new objects | `I` | animals `[sid,type,x,y,dir·100,hp,name,state]` + hidden |
| `J` | animal attack animation | `K` | swing animation |
| `L` | object wiggle | `M` | turret shot |
| `N` | resource / stat value | `O` | health |
| `P` | you died | `Q` | object removed |
| `R` | objects removed | `S` | item count |
| `T` | XP / age | `U` | upgrade picks |
| `V` | item / weapon list | `X` | new projectile |
| `Y` | projectile ended | `Z` | restart countdown |
| `g` | tribe created | `1` | tribe deleted |
| `2` | join request | `3` | your tribe |
| `4` | tribe members | `5` | store update |
| `6` | chat / server notice | `7` | minimap |
| `8` | damage text | `9` | map ping |
| `0` | pong | `W` | boss telegraph `[kind,x,y,r,ms,x2,y2]` |
| `F` | live stats (staff watching a guest also get the guest's session id) | | |

When the server stops (Ctrl+C), it sends the `Z` countdown and then `B` *"Server is
restarting - pick another"*, which makes the client look for another server.

### Anti-cheat
**In the client** (official code, runs exactly as on moomoo.io; unchanged in v1.9.1):
- `window.WebSocket` is locked (not writable).
- F12, Ctrl+Shift+I/J/C and Ctrl+U are blocked.
- A `debugger` trap runs every second.
- Tampermonkey and Violentmonkey are probed via `chrome-extension://` images, plus a check for
  `GM_*` / `unsafeWindow`.
- WebSocket send, canvas, WebGL and `requestAnimationFrame` are checked for being native.
- Script-dispatched (untrusted) clicks are refused and counted.
- The results go to the server in packet **`T`** (5 s after joining, then every 60 s; the
  timer now restarts with each connection).
  Flags: `1` userscript manager, `2` socket hooked, `4` render hooked, `8` debugger paused.

**On the server** (`server/src/anticheat/`, everything configurable in `config.js`):

| Check | Default action |
|---|---|
| Bad HMAC tag, replayed or out-of-order `seq`, unknown packet id, malformed frame | close 4001 |
| Wrong `?b=` build | close 4002 |
| Foreign `Origin` | close 4004 |
| Missing, reused or expired join ticket, or a ticket for a different server | close 4001 |
| Guest on a members server | close 4003 |
| Telemetry `T` missing for 50 s, or stopped for 105 s | kick |
| `T` flag 2 (socket hooked) | kick |
| `T` flags 1 / 4 / 8, or 20+ untrusted events | flag (logged, shown on the staff panel) |
| Per-packet rate limits (tuned to real client send rates) and argument validation | drop the packet + strike (40 strikes = kick) |
| Shame! (auto-heal detection), straight from the original game logic | 30 s Shame! hat |
| Bans (IP + device + account), shadow-bans, reports with reasons | `server/data/bans.json`, `moderation.json`, `reports.jsonl` |

### Game logic (`server/src/moomoo/`)
The Player, animal, object and projectile classes are ported **function for function** from
the client bundle, where moomoo.io ships them as shared code. Server-only parts are marked
`SERVER:`:
- spawning and world generation
- windmill payouts
- the Turret Gear
- secret-area walking
- the Crab King (diving, telegraphed attacks)
- accessory effects
- emerald members-only lifesteal
- stats

Config, items, hats, accessories and animal types are **identical to the client's data**:
`shared/config.js`, `shared/config/*.js`, `server/src/moomoo/modules/aiManager.js`.
Names go through the client's own word filter (`server/src/moomoo/libs/nameFilter.js`: the
bad-words list it bundles plus the game's extra words), so a name like *Sidney* shows as
*unknown*, as it does on moomoo.io.

Two game servers run side by side: **LC** (public, 40 players) and **MB** (members only, 80).
They're configured at the top of `server/src/index.js`.

### Local backend (`server/src/api/`)
| Area | Endpoints |
|---|---|
| Auth | `/api/auth/*` (any code / password, signed JWTs) |
| Servers & join | `/servers`, `/join` (single-use tickets for the server asked for, device id) |
| Account | `/account` (incl. settings), `/account/prefs`, `/name` (permanent names, game name filter), `/name-check`, `/account/socials` (handle rules) |
| Friends | `/names-for`, `/friends/allow` (moomoo side), `/social/friends/*` and `/social/ws` (FRVR social stand-in, `api/social.js`) |
| Profiles & boards | `/profile`, `/top` |
| Clans | `/clan`, `/clan-check`, `/clan/*` (incl. `/clan/requests`) |
| Discord | `/discord/link` |
| Staff | `/mod/player`, `/mod/verdict`, `/mod/kick`, `/mod/role`, `/mod/clan` (accounts by name, guests by session id) |
| Share links | `/player/<name>`, `/clan/<name>` (outside `/api`) |
| Misc | `/client-log` |

Account ids use FRVR's 24-character format; older accounts are converted when the server
starts, and existing sign-ins keep working. Data lives in `server/data/` (git-ignored).

---

## Updating to a newer moomoo.io build
1. Save the page from moomoo.io as *Webpage, Complete*. You get the HTML and a `_files`
   folder with `index-*.js`, `vendor-*.js` and the live `main.css`.
2. Move the current files into `client-official/archive/<bundle name>/` and put the new ones
   in `client-official/source/` (rename the page to `page.html`).
3. Run `npm run build`. If a patch reports `matched 0 times`, the client changed there; update
   that pattern in `tools/build-official-client.mjs`.
4. If the new client changed packets, the build itself won't break, but the game may. Compare
   its packet lists with `server/src/protocol/constants.js`, and diff it against the archived
   bundle for new API calls.

## Missing assets
The client requests these images, which this project doesn't have yet. Save them from
moomoo.io (`https://moomoo.io/<path>`) into `client/public/<path>`:

```
img/hats/hat_59.png      img/hats/hat_60.png      img/hats/hat_61.png
img/weapons/bow_1_d.png
```
Until then those hats (Scout Hat, Frost Helm, Crab Shell) and the diamond bow are invisible
(the game still works). The icon font is also loaded from Google Fonts, because moomoo.io's own
copy (`css/fonts/material-icons.woff2`) isn't in the saved files.

## Settings and tips
| Variable / command | Effect |
|---|---|
| `PORT=8080`, `HOST=127.0.0.1` | where the server listens (`HOST=0.0.0.0` exposes it to your network) |
| `OWNER_EMAIL=you@example.com` | makes that account an admin at startup |
| `DEBUG_PACKETS=1` | logs every decoded client packet |
| `npm run start:new-build` | rolls a new protocol build (simulates a moomoo.io deploy) |
| `npm run build:no-anti-debug` | client without the debugger trap |
| `IS_SANDBOX=1` | sandbox rules (free building, higher limits) |

## Differences from the real game
- The real server code isn't public. Treat boss attack patterns, accessory numbers, animal
  spawn counts and locations, and the secret-area water as reconstructions.
- `mixKey` and `BUILD_SALT` are this server's own: the real ones are secret per-deploy values,
  so the official servers' traffic can't be read with this.
- Friends only exist between accounts on this server. Presence and invites go through this
  server instead of FRVR's.
- There's no Discord bot; the console's `discord` command hands out the link codes.
- Guests on a VPN aren't blocked (moomoo.io says *"VPNs and proxies can't join as a guest"*).
- Ads, analytics and the real captcha are stubbed out.
- `client/` holds the old webpack clone client (old protocol). It's kept for reference only;
  build it with `npm run build:legacy`.

## Project layout
```
client-official/   official client sources (+ archive of the previous build) + shim.js
tools/             build-official-client.mjs, console.mjs
server/src/
  index.js         HTTP / WebSocket entry, servers, admin route, share links
  protocol/        constants, crypto, build module generator, session
  anticheat/       config + checks + moderation store
  api/             accounts store, REST routes, FRVR social (friends) stand-in
  admin/           console commands
  network/         connection gate + packet handlers
  moomoo/          game (server.js) + ported modules + name filter
shared/            config, items, store (identical to the client's data)
dist/              build output (git-ignored)
server/data/       accounts, tokens, bans, protocol build (git-ignored)
```
