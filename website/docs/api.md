---
title: window.MooMoo API
---

# `window.MooMoo` — runtime API

the stable object the loader hands you. mods you write by hand (and everything the
compiler spits out) only ever use this, and it doesn't change.

## Events

```js
MooMoo.on(event, handler)    // subscribe; returns an unsubscribe function
MooMoo.off(event, handler)
MooMoo.once(event, handler)
```

`handler` gets one payload object, and its fields are the event's parameters (see
the **[packet reference](./packets)**):

```js
MooMoo.on("health", ({ sid, value }) => {
  if (sid === MooMoo.self.sid) console.log("hp", value);
});
```

subscribe to `"*"` if you want to see every event: `MooMoo.on("*", (event, payload) => …)`.

## Actions

```js
MooMoo.send.chat("gg");
MooMoo.send.spawn("Name", true, 0);
MooMoo.send.aim(1.57);
MooMoo.send.raw("6", ["gg"]);   // escape hatch: a raw wire packet
```

each action takes positional arguments (in the vocabulary's order), or one named
object if you'd rather: `MooMoo.send.spawn({ name: "Bob", moofoll: true, skin: 0 })`.

## State

```js
MooMoo.self            // { sid, alive, health, x, y, dir, points, kills, ... }
MooMoo.players         // Map<sid, player>
MooMoo.player(sid)     // one player
MooMoo.isReady()       // connected + keys derived?
MooMoo.onReady(cb)     // run cb once ready (now, if already)
```

## Mods

a mod is a named thing the in-game **Mods** menu can toggle and configure.

```js
MooMoo.register({
  id: "auto-ping",                 // optional; derived from name otherwise
  name: "Auto Ping",
  version: "1.0.0",
  description: "Pings every few seconds.",
  defaultEnabled: true,
  settings: [
    { key: "interval", type: "number", default: 3000, min: 500, max: 10000, step: 500, label: "Interval (ms)" }
  ]
}, (ctx) => {
  ctx.every(ctx.settings.interval, () => MooMoo.send.ping());
  // ctx.on / ctx.once are auto-removed when the mod is disabled
  ctx.onCleanup(() => { /* optional teardown */ });
});
```

### The `ctx` passed to a mod's setup

| Member | Is |
| --- | --- |
| `ctx.on(event, h)` / `ctx.once(…)` | subscribe; auto-removed on disable |
| `ctx.every(ms, fn)` | interval; auto-cleared on disable |
| `ctx.send`, `ctx.self`, `ctx.players`, `ctx.player(sid)` | same as the globals |
| `ctx.settings` | live settings values (`ctx.settings.interval`) |
| `ctx.log(…)` | console logger tagged with the mod name |
| `ctx.onCleanup(fn)` | run `fn` when the mod is disabled |
| `ctx.mod` | `{ id, name, version }` |

### Managing mods

```js
MooMoo.getMods()                    // [{ id, name, enabled, settings, ... }]
MooMoo.setModEnabled(id, true)      // enable / disable
MooMoo.isModEnabled(id)
MooMoo.setSetting(id, key, value)   // persisted; re-applies the mod
MooMoo.onModsChanged(cb)            // the menu uses this to re-render
```

the enabled state and settings are saved per mod in `localStorage`.

## Settings schema

```js
{ key, type, default, label?, options?, min?, max?, step? }
```

`type` is `"boolean" | "number" | "string" | "select"` (worked out from `default` if
you leave it off). `select` needs `options: [...]`, and `number` can set
`min`/`max`/`step` to get a slider.

## Logging

```js
MooMoo.log("anything", 123);   // "[moomoo.js] anything 123"
```
