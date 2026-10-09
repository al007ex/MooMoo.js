---
title: The loader
---

# The loader

The loader is the volatile half: a single Tampermonkey userscript, built from
`loader/src/*` by `loader/build.mjs`. It runs in the page at `document-start`.

## What it does, in order

1. **Installs the socket hook.** `window.WebSocket` becomes a `Proxy` of the
   native constructor. Interception happens per-socket in the `construct` trap;
   `WebSocket.prototype` is never touched. (See [anti-cheat](./anticheat) for why
   that matters.)
2. **Adopts the game socket.** The first frame on a socket is the plaintext
   `io-init` handshake. From its `[socketId, seed, keyHex, mode, pinned]` payload,
   plus the page's `moomoo-protocol` module (`mixKey`, `BUILD_SALT`), it builds the
   same packet tables and masks the official client uses.
3. **Reads incoming frames.** It decodes each server→client frame, looks it up in
   the **binding**, and fires the matching event on the runtime.
4. **Owns outgoing frames.** It decodes what the client tries to send, optionally
   transforms it (scrubbing telemetry), and re-encodes it with its own gap-free
   sequence. This is what lets mods inject packets.
5. **Exposes `window.MooMoo`** and injects the **Mods** menu.

## Robust startup

Key derivation needs the `moomoo-protocol` module, which is fetched lazily. If a
frame arrives before the keys are ready, the loader **buffers** it and processes
it in order the instant the session is set up — the game never stalls and the
sequence never desyncs. If the module can't be resolved at all, the loader falls
back to pure pass-through so the game still works (mods are disabled on that
connection).

## File map

| File | Responsibility |
| --- | --- |
| `loader/src/msgpack.js` | MessagePack codec (byte-compatible with the server) |
| `loader/src/sha256.js` | synchronous SHA-256 / HMAC for the frame tag |
| `loader/src/protocol.js` | tables, masks, and the per-connection `ClientSession` |
| `loader/src/binding.js` | **wire ⇄ vocabulary** — the file you edit on updates |
| `loader/src/anticheat.js` | the undetectable `WebSocket` proxy |
| `loader/src/runtime.js` | `window.MooMoo`: events, actions, state, mod registry |
| `loader/src/menu.js` | the in-game **Mods** tab + settings UI |
| `loader/src/loader.js` | wires it all together |
| `shared/vocabulary.js` | the stable semantic packet names |

Build with `npm run build` → `loader/dist/moomoo-loader.user.js`.

## Diagnostics

The loader also exposes `window.MooMooLoader`:

```js
MooMooLoader.diag          // { version, buildId, resolvedProtocol, failedProtocol, sockets }
MooMooLoader.onRaw(fn)     // fn(dir, name, args) for EVERY decoded packet, in or out
MooMooLoader.sendRaw(w, a) // send a raw wire packet
MooMooLoader.native        // the real WebSocket constructor
```

`onRaw` is the fastest way to discover a new packet's shape when the server
changes — watch the stream, find the packet, then update the binding.

## Resolving the protocol module

By default the loader imports `moomoo-protocol` through the page's import map,
with a fallback that reads the `<script type="importmap">` directly. If your
server names the module differently, set a resolver before the socket opens:

```js
window.__moomooResolveProtocol = () => import("https://your-server/p/xyz.js");
```
