# moomoo.js

moomoo.js is a modding framework for my MooMoo.io-style private server. the whole
idea is you can write mods without ever having to touch the websocket, the crypto,
or the packet format. you listen for events, you send actions, and the framework
does the annoying parts for you.

```js
MooMoo.on("health", ({ sid, value }) => {
    if (sid === MooMoo.self.sid) console.log("my health is now " + value);
});
```

that's a full working mod. that's all of it.

:::note heads up
this is built for my own private server, basically a hobby thing i run, and for
figuring out how all this stuff fits together. don't point it at servers you don't
own.
:::

## the two parts

i split it in two on purpose, so that mods don't rot every time the server
changes:

1. **the loader** is a Tampermonkey userscript. it hooks the game socket, speaks
   the wire protocol, and hands you a stable `window.MooMoo` to work with. it also
   adds the **Mods** tab to the in-game menu. this is the only part that changes
   when the server updates its protocol.

2. **the runtime** is the stable half. `window.MooMoo` doesn't change. a mod you
   wrote months ago still works after the server reshuffles every packet, because
   the loader just re-points the wire at the same names.

```
 wire bytes ──(loader: hook + decode + binding)──▶ named events ──▶ your mod
 your mod ──▶ named actions ──(loader: binding + encode + send)──▶ wire bytes
```

## what's in here

- the **loader** userscript (`moomoo-loader.user.js`), no dependencies.
- the stable **runtime** (`window.MooMoo`): events, actions, game state, and a
  per-mod registry with the in-game Mods menu (on/off toggles + settings).
- the loader's **game engines** a mod can build on: combat prediction, the world
  objects, the store, an overlay/renderer, and an A* pathfinder (all on `ctx`).
- the **mods that ship with it**: **MooMoo Lite** (`mods/lite.js`) — place spammers,
  legit auto heal, an instakill combo, hold-a-mouse-button loadouts, hat hotkeys and
  player / animal arrows, in its own in-game menu, and the worked example for writing
  your own; **MooMod Bots** (`mods/bots.js`) — multi-box bots that follow your mouse on
  your own server; and **Freecam + Zoom** (`mods/freecam.js`) — detach the camera and
  fly it around with WASD while your body stays parked (a ghost marks where it is), with
  its settings in the Mods menu.

## where to go next

- **[Architecture](./architecture)** — how the pieces actually fit together.
- **[Getting started](./getting-started)** — install the loader and run your first
  mod.
- **[Writing mods](./writing-mods)** — the API, by example.
- **[Packet reference](./packets)** — every event and action.
