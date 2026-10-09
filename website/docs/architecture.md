---
title: Architecture
---

# Architecture

moomoo.js has a **volatile half** (the loader) and a **stable half** (the runtime
and language). The boundary between them is a small translation layer called the
**binding**. Understanding this split is the whole idea.

## The volatile half — the loader

The loader runs in the page at `document-start`, before the game's client. It:

1. **Hooks the socket.** It replaces `window.WebSocket` with a `Proxy` of the
   native constructor (see [the loader](./loader) and [anti-cheat](./anticheat)).
2. **Speaks the protocol.** From the server's `io-init` handshake it derives the
   same per-connection packet tables and masks the official client uses, then
   decodes incoming frames and encodes outgoing ones. It fetches the per-deploy
   key material from the page's `moomoo-protocol` module, exactly like the client,
   so it survives redeploys.
3. **Translates.** The **binding** maps raw wire packets to the stable vocabulary
   and back.
4. **Exposes `window.MooMoo`** and injects the **Mods** menu.

Everything that can change when the server updates — packet letters, argument
order, key mixing, the telemetry format — lives here.

## The stable half — runtime + language

- **`window.MooMoo`** is the API mods call. Events, actions, game state, the mod
  registry: none of it references the wire. It is a fixed contract.
- **The vocabulary** names every semantic packet (`health`, `chat`, `spawn`, …)
  and the shape of its payload. It never changes.
- **The moomoo.js language** compiles to code that only touches `window.MooMoo`.

## The binding — the hinge

The binding is one file in the loader:

```js
incoming["O"] = { event: "health", parse: (a) => ({ sid: a[0], value: a[1] }) };
outgoing["chat"] = { wire: "6", build: (d) => [d.message] };
```

When the server renames `O` to something else, you change **one line** in the
binding and rebuild the loader. Every mod ever written keeps working, because the
name `health` on the left never moves.

## Data flow

**Incoming** (server → mod):

```
frame → [loader] decode → "O" → [binding] → health {sid, value} → [runtime] → on health(...)
```

**Outgoing** (mod → server):

```
send.chat("gg") → [runtime] → chat {message} → [binding] → "6" ["gg"] → [loader] encode → frame
```

The loader **owns** the client→server stream: it re-encodes every outgoing frame
with its own gap-free sequence number, which is what lets mods inject packets at
all, and what lets the loader scrub the anti-tamper telemetry.

## Packaging

| Piece | Form | Who installs it | Changes? |
| --- | --- | --- | --- |
| Loader | `moomoo-loader.user.js` | everyone, once | when the server updates |
| A mod | a tiny userscript that `@require`s the loader | per mod | never |
| Compiler / playground | website + CLI | mod authors | rarely |

Because every mod `@require`s the one loader, updating the loader updates every
mod at once.
