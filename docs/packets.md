# Packet reference

every packet moomoo.js knows about by name. these names are the stable vocabulary:
they don't change, even when the server reshuffles the wire. mods written against
them keep working across loader updates.

- **events** are things the server tells you. listen with `on <event>(…)`
  (moomoo.js) or `MooMoo.on("<event>", handler)` (JavaScript).
- **actions** are things you ask the server to do. call `send.<action>(…)`
  (moomoo.js) or `MooMoo.send.<action>(…)` (JavaScript).

events marked *passthrough* give you the raw decoded `args` array instead of named
fields, so you get at every packet but the shape isn't guaranteed to stay put.

## Events (server → you)

### All events

| Name | Parameters | Description |
| --- | --- | --- |
| `on setup` | `sid` | You joined / spawned. Carries YOUR own player slot id (sid). |
| `on init` | `data` | Initial game data sent right after connecting. |
| `on disconnect` | `reason` | The server is dropping you. Carries a reason string. |
| `on health` | `sid`, `value` | A player's health changed. Fires for you and for others in view. |
| `on playerAdd` | `data`, `isYou` | A player entered your view (or you spawned). |
| `on playerRemove` | `sid` | A player left your view. |
| `on playersUpdate` | `positions`, `attributes`, `hidden` | Per-tick movement + attribute update for everyone in view. |
| `on playerValue` | `key`, `value`, `updateView` | A named value about you changed (points, kills, wood, food, ...). |
| `on upgrades` | `points`, `age` | Your available upgrade points / current upgrade age. |
| `on inventory` | `list`, `isWeapon` | Your item list or weapon list was replaced. |
| `on age` | `args` | Your XP / age progress. |
| `on died` | — | You died. No payload. |
| `on chat` | `sid`, `message` | A chat message was said by a player. |
| `on showText` | `x`, `y`, `value`, `type` | Floating world text (damage numbers, gold gained, ...). |
| `on mapPing` | `x`, `y` | A teammate pinged the map. |
| `on leaderboard` | `args` | Leaderboard refresh. |
| `on objectsLoad` | `args` | New world objects entered view. |
| `on animalsUpdate` | `args` | Animal/AI movement + state update. |
| `on animalAttack` | `args` | An animal played its attack animation. |
| `on gatherAnimation` | `args` | A player played a gather/attack swing. |
| `on wiggle` | `args` | An object wiggled (was hit). |
| `on turretShoot` | `args` | A turret fired. |
| `on objectKilled` | `args` | One object was destroyed. |
| `on objectsKilled` | `args` | Several objects were destroyed. |
| `on itemCount` | `args` | Placed-item count changed (e.g. windmills). |
| `on projectileAdd` | `args` | A projectile spawned. |
| `on projectileRemove` | `args` | A projectile despawned. |
| `on shutdownNotice` | `args` | Server shutdown countdown. |
| `on tribeAdd` | `args` | A tribe was created. |
| `on tribeDelete` | `args` | A tribe was deleted. |
| `on tribeJoinRequest` | `args` | Someone asked to join your tribe. |
| `on tribeSet` | `args` | Your tribe membership changed. |
| `on tribeMembers` | `args` | Your tribe's member list. |
| `on storeUpdate` | `args` | A hat/accessory was bought or equipped. |
| `on minimap` | `args` | Minimap dots for your tribe. |
| `on pong` | — | Reply to your ping (latency probe). |
| `on effect` | `args` | A visual effect was triggered. |
| `on stats` | `args` | Live stats card for a watched player. |
| `on profile` | `args` | A player's profile card (reply to watchStats). |
| `on probes` | `salt`, `probes` | Server integrity probes; the client answers with telemetry. The loader handles this. |
| `on updateCountdown` | `args` | A new build is out; countdown to the forced reload. |
| `on dive` | `sid`, `state` | A player dived under / surfaced (water). |


## Actions (you → server)

### All actions

| Name | Parameters | Description |
| --- | --- | --- |
| `send.spawn` | `name`, `moofoll`, `skin` | Spawn into the game. |
| `send.aim` | `dir` | Face a direction (radians). |
| `send.move` | `dir` | Move in a direction (radians), or null to stop. |
| `send.stopMove` | — | Stop moving (window-blur style reset). |
| `send.mouse` | `down`, `dir` | Press/release the attack button, optionally with a build direction. |
| `send.selectItem` | `index`, `isWeapon` | Select a weapon or buildable item. |
| `send.upgrade` | `index` | Choose an upgrade. |
| `send.toggle` | `which` | Toggle 0 = lock rotation, 1 = auto gather. |
| `send.createTribe` | `name` | Create a tribe. |
| `send.leaveTribe` | — | Leave your tribe. |
| `send.joinTribe` | `name` | Ask to join a tribe. |
| `send.answerJoin` | `sid`, `accept` | Accept/deny a join request. |
| `send.kickMember` | `sid` | Kick a tribe member. |
| `send.store` | `action`, `id`, `isAccessory` | Buy (0) or equip (1) a hat/accessory. |
| `send.chat` | `message` | Say something in chat. |
| `send.pingMap` | — | Ping the map for your tribe. |
| `send.ping` | — | Latency probe; replies with `pong`. |
| `send.watchStats` | `sid` | Watch another player's live stats card (-1 = none). |
| `send.report` | `args` | Report / staff action (advanced). |
| `send.admin` | `args` | Admin command (requires admin role). |
| `send.anon` | `on` | Turn anonymous mode on/off (signed-in players). |


> Generated from `shared/vocabulary.js` by `website/gen-packets.mjs`.
