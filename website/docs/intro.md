---
title: Introduction
slug: /intro
---

# moomoo.js

**moomoo.js** is a modding framework for MooMoo.io-style **private servers**. It
lets people write mods without ever touching the WebSocket, the crypto, or the
packet format. You subscribe to named events and send named actions; the
framework does the rest.

```
on health(sid, value) {
    if (sid == self.sid) {
        log("My health is now " + value)
    }
}
```

That is a complete, working mod.

:::note Scope
moomoo.js is built for **your own** private server — a hobby project you run and
control. It is for learning how these systems fit together. Don't use it against
servers you don't own.
:::

## Two parts

moomoo.js is deliberately split in two so that mods never rot:

1. **The loader** — a Tampermonkey userscript that hooks the game socket, speaks
   the wire protocol, and exposes a stable `window.MooMoo` API. It also adds a
   **Mods** tab to the in-game menu. The loader is the *only* piece that changes
   when the server updates its protocol.

2. **The runtime + language** — the stable half. `window.MooMoo` and the
   **moomoo.js** language never change. A mod written today keeps working after
   the server reshuffles every packet, because the loader re-points the wire at
   the same stable names.

```
 wire bytes ──(loader: hook + decode + binding)──▶ named events ──▶ your mod
 your mod ──▶ named actions ──(loader: binding + encode + send)──▶ wire bytes
```

## What you get

- A zero-dependency **loader** userscript (`moomoo-loader.user.js`).
- A stable **runtime** (`window.MooMoo`): events, actions, game state, and a
  per-mod registry with an in-game Mods menu (enable/disable + settings).
- The **moomoo.js language** and a **compiler** that turns it into a Tampermonkey
  plugin which `@require`s the loader.
- A **[playground](/playground/)**: build mods with Scratch-style blocks or by
  writing moomoo.js, and compile right in the browser.

## Next steps

- **[Architecture](./architecture)** — how the pieces fit together.
- **[Getting started](./getting-started)** — install the loader and run your
  first mod in five minutes.
- **[Writing mods](./writing-mods)** — the moomoo.js language by example.
- **[Packet reference](./packets)** — every event and action.
