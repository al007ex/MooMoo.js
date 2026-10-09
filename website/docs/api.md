---
title: window.MooMoo API
---

# `window.MooMoo` — runtime API

The stable object the loader exposes. Hand-written mods (and everything the
compiler emits) use only this. It never changes.

## Events

```js
MooMoo.on(event, handler)    // subscribe; returns an unsubscribe function
MooMoo.off(event, handler)
MooMoo.once(event, handler)
```

`handler` receives one payload object whose fields are the event's parameters
(see the **[packet reference](./packets)**):

```js
MooMoo.on("health", ({ sid, value }) => {
  if (sid === MooMoo.self.sid) console.log("hp", value);
});
```

Subscribe to `"*"` to see every event: `MooMoo.on("*", (event, payload) => …)`.

## Actions

```js
MooMoo.send.chat("gg");
MooMoo.send.spawn("Name", true, 0);
MooMoo.send.aim(1.57);
MooMoo.send.raw("6", ["gg"]);   // escape hatch: a raw wire packet
```

Each action accepts positional arguments (in the vocabulary's order) or a single
named object: `MooMoo.send.spawn({ name: "Bob", moofoll: true, skin: 0 })`.

## State

```js
MooMoo.self            // { sid, alive, health, x, y, dir, points, kills, ... }
MooMoo.players         // Map<sid, player>
MooMoo.player(sid)     // one player
MooMoo.isReady()       // connected + keys derived?
MooMoo.onReady(cb)     // run cb once ready (now, if already)
```

## Mods (managed units)

A mod is a named unit the in-game **Mods** menu can toggle and configure.

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

Enabled state and settings persist in `localStorage` per mod.

## Settings schema

```js
{ key, type, default, label?, options?, min?, max?, step? }
```

`type` is `"boolean" | "number" | "string" | "select"` (inferred from `default`
if omitted). `select` needs `options: [...]`; `number` may set `min`/`max`/`step`
to render a slider.

## Logging

```js
MooMoo.log("anything", 123);   // "[moomoo.js] anything 123"
```
