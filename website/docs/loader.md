---
title: The loader
---

# The loader

the loader is the part that changes: one Tampermonkey userscript, built from
`loader/src/*` by `loader/build.mjs`. it runs in the page at `document-start`.

## what it does, in order

1. **installs the socket hook.** `window.WebSocket` becomes a `Proxy` of the real
   constructor. the actual interception happens per-socket in the `construct` trap,
   and `WebSocket.prototype` is never touched (see [anti-cheat](./anticheat) for why
   that matters).
2. **grabs the game socket.** the first frame on a socket is the plaintext
   `io-init` handshake. from its `[socketId, seed, keyHex, mode, pinned]` payload,
   plus the page's `moomoo-protocol` module (`mixKey`, `BUILD_SALT`), it builds the
   same packet tables and masks the real client uses.
3. **reads incoming frames.** it decodes each server→client frame, looks it up in
   the binding, and fires the matching event on the runtime.
4. **owns outgoing frames.** it decodes what the client is trying to send, maybe
   transforms it (like scrubbing telemetry), and re-encodes it with its own
   gap-free sequence. that's what makes packet injection possible.
5. **exposes `window.MooMoo`** and injects the Mods menu.

## startup

key derivation needs the `moomoo-protocol` module, which gets fetched lazily. if a
frame shows up before the keys are ready, the loader buffers it and runs it in order
the second the session is set up, so the game never stalls and the sequence never
desyncs. if the module can't be resolved at all, the loader falls back to plain
pass-through so the game still works (mods are just off on that connection).

## the files

| file | what it's for |
| --- | --- |
| `loader/src/msgpack.js` | MessagePack codec (byte-for-byte with the server) |
| `loader/src/sha256.js` | synchronous SHA-256 / HMAC for the frame tag |
| `loader/src/protocol.js` | tables, masks, and the per-connection `ClientSession` |
| `loader/src/binding.js` | **wire ⇄ vocabulary** — the file you edit on updates |
| `loader/src/anticheat.js` | the `WebSocket` proxy that stays hidden |
| `loader/src/runtime.js` | `window.MooMoo`: events, actions, state, mod registry |
| `loader/src/menu.js` | the in-game Mods tab + settings UI |
| `loader/src/loader.js` | wires it all together |
| `shared/vocabulary.js` | the stable packet names |

build it with `npm run build` → `loader/dist/moomoo-loader.user.js`.

## diagnostics

the loader also gives you `window.MooMooLoader`:

```js
MooMooLoader.diag          // { version, buildId, resolvedProtocol, failedProtocol, sockets }
MooMooLoader.onRaw(fn)     // fn(dir, name, args) for EVERY decoded packet, in or out
MooMooLoader.sendRaw(w, a) // send a raw wire packet
MooMooLoader.native        // the real WebSocket constructor
```

`onRaw` is the quickest way to figure out a new packet's shape when the server
changes: watch the stream, spot the packet, update the binding.

## resolving the protocol module

by default the loader imports `moomoo-protocol` through the page's import map, with
a fallback that reads the `<script type="importmap">` directly. if your server
names the module something else, set a resolver before the socket opens:

```js
window.__moomooResolveProtocol = () => import("https://your-server/p/xyz.js");
```
