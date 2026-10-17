# Writing mods

a mod is a Tampermonkey userscript that `@require`s the loader and asks it for the
`MooMoo` API through a small event handshake (there is no `window.MooMoo` — the loader
keeps nothing on the page for the server's anti-cheat to find; see the
**[getting-started](./getting-started)** `withMooMoo` helper). it does one thing: react
to game events and send game actions. this page walks through it with examples. every
event and action is in the **[packet reference](./packets)**.

## register a mod

`MooMoo.register(meta, setup)` gives your mod a **Mods** tab entry (on/off toggle +
settings) and a `ctx` that cleans itself up when the mod is turned off.

```js
MooMoo.register({
    id: "my-first-mod",
    name: "My First Mod",
    description: "Says hi when I spawn.",
    defaultEnabled: true
}, (ctx) => {
    ctx.on("setup", ({ sid }) => console.log("hello! my sid is " + sid));
});
```

prefer `ctx.on` / `ctx.every` / `ctx.onCleanup` over the bare `MooMoo.*` ones:
they're torn down automatically when the mod is disabled.

## reacting to events

`ctx.on("<event>", payload => …)` runs every time that packet shows up. the payload
is an object with named fields (the **[packet reference](./packets)** lists them).

```js
ctx.on("chat", ({ sid, message }) => console.log("player " + sid + " said: " + message));
```

## reading game state

`MooMoo.self` is you. `MooMoo.player(sid)` looks up someone else.

```js
ctx.on("health", ({ sid, value }) => {
    const me = MooMoo.self;
    if (value < 30 && sid === me.sid) console.log("low health! " + me.health);
});
```

`self` tracks `sid`, `health`, `x`, `y`, `dir`, and whatever else the server sends
you (`points`, `kills`, `wood`, …).

## sending actions

`MooMoo.send.<action>(...)` puts a packet on the wire.

```js
ctx.on("chat", ({ message }) => {
    if (message === "ping") MooMoo.send.chat("pong");
});
```

## settings

list `settings` in `register` and they show up under your mod in the in-game
**Mods** menu, saved between reloads. read them back with `ctx.settings.<key>`.

```js
MooMoo.register({
    id: "auto-reply",
    name: "Auto Reply",
    settings: [
        { key: "phrase", label: "Reply text", default: "hi there" },
        { key: "enabled", label: "Enabled", default: true }
    ]
}, (ctx) => {
    ctx.on("chat", ({ message }) => {
        if (ctx.settings.enabled && message === "hi") MooMoo.send.chat(ctx.settings.phrase);
    });
});
```

the type comes from the default: `true`/`false` makes a toggle, a number makes a
number field (with `min`/`max`/`step` it's a slider), a string makes a text field.
mark a setting `basic: true` to also surface it in the Mods tab; everything else
lives in your own menu if you build one. a big mod sets `liveSettings: true` so
flipping one setting doesn't tear the whole mod down and re-run it.

## timers

`ctx.every(ms, fn)` runs on a loop and is cleaned up when the mod is disabled.

```js
ctx.every(3000, () => MooMoo.send.ping());
```

## the game engines (`ctx`)

the loader does the heavy lifting a combat mod needs and hands it to you on `ctx`,
so you don't re-derive it per frame:

- `ctx.combat` — per-player prediction, reloads, damage potentials, shame timing
- `ctx.objects` — the buildings / resources / traps around you
- `ctx.store` — which hats and tails you own and wear, with `equip()`
- `ctx.render` — draw on an overlay lined up with the real picture (`layer`), or
  replace the whole frame (`replace`)
- `ctx.path` — A* pathfinding in a worker pool: `ctx.path.find({...})`
- `ctx.onOutgoing` — see / rewrite / drop the packets the official client sends

**MooMooPlus** (`mods/moomooplus/`) is the big worked example and uses all of them.

## turning mods on and off at runtime

you don't write any of this. the **Mods** menu gives every mod a toggle and draws
its settings. turning a mod off removes its `ctx` handlers and timers; turning it
back on re-runs `setup`. the state sticks across reloads.
