---
title: Introduction
slug: /intro
---

# moomoo.js

moomoo.js is a modding framework for my MooMoo.io-style private server. the whole
idea is you can write mods without ever having to touch the websocket, the crypto,
or the packet format. you listen for events, you send actions, and the framework
does the annoying parts for you.

```
on health(sid, value) {
    if (sid == self.sid) {
        log("My health is now " + value)
    }
}
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

2. **the runtime + language** is the stable half. `window.MooMoo` and the moomoo.js
   language don't change. a mod you wrote months ago still works after the server
   reshuffles every packet, because the loader just re-points the wire at the same
   names.

```
 wire bytes ──(loader: hook + decode + binding)──▶ named events ──▶ your mod
 your mod ──▶ named actions ──(loader: binding + encode + send)──▶ wire bytes
```

## what's in here

- the **loader** userscript (`moomoo-loader.user.js`), no dependencies.
- the stable **runtime** (`window.MooMoo`): events, actions, game state, and a
  per-mod registry with the in-game Mods menu (on/off toggles + settings).
- the **moomoo.js language** and a **compiler** that turns it into a Tampermonkey
  plugin that `@require`s the loader.
- a **[playground](/playground/)** where you write moomoo.js and compile it right
  in the browser.

## where to go next

- **[Architecture](./architecture)** — how the pieces actually fit together.
- **[Getting started](./getting-started)** — install the loader and run your first
  mod.
- **[Writing mods](./writing-mods)** — the moomoo.js language, by example.
- **[Packet reference](./packets)** — every event and action.
