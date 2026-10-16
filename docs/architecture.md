# Architecture

moomoo.js has a part that changes (the loader) and a part that doesn't (the
runtime). in between them is a small translation layer i call the **binding**.
that split is pretty much the whole point, so it's worth getting.

## the part that changes — the loader

the loader runs in the page at `document-start`, before the game's own client. it:

1. **hooks the socket.** it swaps `window.WebSocket` for a `Proxy` of the real
   constructor (see [the loader](./loader) and [anti-cheat](./anticheat) for the
   details).
2. **speaks the protocol.** from the server's `io-init` handshake it works out the
   same per-connection packet tables and masks the real client uses, then decodes
   incoming frames and encodes outgoing ones. it grabs the per-deploy key material
   from the page's `moomoo-protocol` module the same way the client does, so it
   keeps working across redeploys.
3. **translates.** the binding maps raw wire packets to the stable names and back.
4. **exposes `window.MooMoo`** and injects the Mods menu.

anything that can change when i update the server — packet letters, argument
order, key mixing, the telemetry format — lives in here.

## the part that doesn't — the runtime

- **`window.MooMoo`** is the API mods call. events, actions, game state, the mod
  registry: none of it knows anything about the wire. it's a fixed thing you can
  rely on.
- **the vocabulary** is the list of names for every packet (`health`, `chat`,
  `spawn`, …) and the shape of each one. it doesn't change.
- on top of that the loader builds **game engines** — combat prediction, world
  objects, store, overlay/renderer, pathfinder — handed to each mod on `ctx`.

## the binding — where the two meet

the binding is one file in the loader:

```js
incoming["O"] = { event: "health", parse: (a) => ({ sid: a[0], value: a[1] }) };
outgoing["chat"] = { wire: "6", build: (d) => [d.message] };
```

when the server renames `O` to something else, you change that one line and
rebuild the loader. every mod anyone ever wrote keeps working, because the name
`health` on the left side never moves.

## how data flows

**coming in** (server → mod):

```
frame → [loader] decode → "O" → [binding] → health {sid, value} → [runtime] → on health(...)
```

**going out** (mod → server):

```
send.chat("gg") → [runtime] → chat {message} → [binding] → "6" ["gg"] → [loader] encode → frame
```

the loader **owns** the client→server stream. it re-encodes every outgoing frame
with its own gap-free sequence number, and that's what makes it possible for mods
to inject packets at all, and what lets the loader scrub the anti-tamper
telemetry.

## how it's packaged

| piece | form | who installs it | changes? |
| --- | --- | --- | --- |
| loader | `moomoo-loader.user.js` | everyone, once | when the server updates |
| a mod | a tiny userscript that `@require`s the loader | per mod | never |
| MooMooPlus | `mods/moomooplus.user.js` (built) | you, once | with the loader |

since every mod `@require`s the one loader, updating the loader updates every mod
in one go.
