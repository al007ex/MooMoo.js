# 🐮 moomoo.js

a modding framework for my MooMoo.io-style private server. you write mods without
ever touching the websocket, the crypto, or the packet format. you just listen for
events, send actions, and let the framework do the rest.

```js
MooMoo.on("health", ({ sid, value }) => {
    if (sid === MooMoo.self.sid) console.log("my health is now " + value);
});
```

that's a complete, working mod.

> **heads up.** this is built for my own private server (a hobby thing i run) and
> for figuring out how all this fits together. it targets the companion
> `moomoo-clone` server. don't use it against servers you don't own.

---

## two parts

| | what | changes when the server updates? |
| --- | --- | --- |
| **the loader** | a Tampermonkey userscript that hooks the socket, speaks the protocol, hands its API to mods through an event handshake (no window global — nothing for the server to find), and adds the in-game **Mods** menu | **yes** — it's the only piece that does |
| **the runtime** | the stable `window.MooMoo` API mods are written against | **never** |

the thing connecting them is a tiny **binding** that maps wire packets to stable
names. rename a packet on the server, change one line in the binding, and every mod
anyone ever wrote keeps working. on top of the runtime the loader also builds the
**game engines** (combat, objects, store, renderer, pathfinder) that a mod gets on
its `ctx`.

```
wire bytes ─(loader: hook + decode + binding)─▶ named events ─▶ your mod
your mod ─▶ named actions ─(loader: binding + encode + send)─▶ wire bytes
```

and the mod that ships with it is **MooMoo Lite** — place spammers, legit auto heal,
an instakill combo, hold-a-mouse-button hat/accessory loadouts, hat hotkeys and
on-screen player / animal arrows, all in its own in-game menu.

---

## Repository layout

```
shared/vocabulary.js      the stable packet vocabulary (the contract mods use)
loader/
  src/
    net/    msgpack · sha256 · protocol · binding · socket · outgoing   (the wire)
    core/   runtime (window.MooMoo) · api (ctx verbs) · modstab (Mods tab)
    game/   combat · objects · store · render · pathfind                (the ctx engines)
    loader.js                 wires it all together
  build.mjs                   bundles + mangles src/ → dist/moomoo-loader.user.js
  dist/moomoo-loader.user.js
mods/
  lite.js                     MooMoo Lite — the mod (place spammers, legit auto heal,
  build-lite.mjs              an instakill combo, mouse-button loadouts, hat hotkeys,
                              player / animal arrows, own menu) → lite.user.js
  ac-monitor.user.js          a small anti-cheat telemetry monitor (dev tool)
build-common.mjs              the shared mangle step (esbuild)
examples/                     a tiny standalone mod + a menu preview
tests/                        codec + loader + live tests
docs/                         full documentation (Markdown)
```

---

## Quickstart

```bash
npm install       # one-time: esbuild, used to mangle the builds
npm run build      # loader/dist/moomoo-loader.user.js
npm run build:lite # mods/lite.user.js
npm test           # all tests (checks the codec against the server if present)
```

1. **install the loader.** set its `@match` to your server, host it somewhere, and
   add it in Tampermonkey. open the game and a **Mods** tab shows up in the menu.
2. **install a mod.** `mods/lite.user.js` is ready to go — it `@require`s the
   loader, so updating the loader updates every mod at once. your own mod is a tiny
   userscript that does the same.

full walkthrough: **`docs/getting-started.md`**.

---

## writing a mod

a mod registers against `window.MooMoo` and gets a `ctx` that cleans itself up:

```js
MooMoo.register({
    id: "auto-reply",
    name: "Auto Reply",
    settings: [{ key: "phrase", label: "Reply text", default: "hi there" }]
}, (ctx) => {
    ctx.on("chat", ({ message }) => {
        if (message === "hi") MooMoo.send.chat(ctx.settings.phrase);
    });
});
```

`register` gives it a **Mods** tab entry (toggle + settings). for combat-grade mods
`ctx` also carries `combat`, `objects`, `store`, `render`, `path` and `onOutgoing`.
see `docs/writing-mods.md`, and `mods/lite.js` for the real thing.

---

## the builds are mangled

the delivered userscripts are minified + identifier-mangled by esbuild
(`build-common.mjs`), so they're small and not easily read. property names are left
alone, so the whole API still works. a readable `mods/lite.js` is kept for the tests,
and `build-common.mjs` also supports build-time macros (`define`) — that's how a
test build can keep a debug view the delivered build compiles out.

---

## the in-game Mods menu

the loader drops a **Mods** tab into the game's pause menu. every registered mod
gets an on/off toggle and its "basic" settings there; a mod with its own menu (like
MooMoo Lite) points you at it. state sticks across reloads.

---

## Tests

```bash
npm test
```

- **`protocol.roundtrip`** — the loader's codec (incl. the code seal) vs. the real
  server protocol and vs. `msgpack-lite`.
- **`loader.integration`** — the whole loader against a real server session in a fake
  browser (hook, decode, re-encode, telemetry scrub, injection).
- **`bundle.vm`** — the assembled, mangled userscript, run in a sandbox.
- **`combat` / `objectmanager`** — the game engines.
- **`tests/live/*`** — real Chrome + a real server copy (the end-to-end proof).

the codec tests run against the `moomoo-clone` server when it's next to this repo
(or at `$MOOMOO_SERVER_DIR`). otherwise they skip.

---

## updating when the server changes

watch the live packet stream, then fix the binding:

```js
MooMooLoader.onRaw((dir, name, args) => console.log(dir, name, args));
```

```js
// loader/src/net/binding.js — only the LEFT side moves
incoming["O"] = { event: "health", parse: (a) => ({ sid: a[0], value: a[1] }) };
```

rebuild, re-host at the same url, done. see `docs/updating-the-loader.md`.

the loader also checks itself against the server as it connects. on a clean join it
shows a short notice; if the server has moved ahead of the binding it shows a
mismatch report you can copy and send over, and if it's certain the loader can't keep
up it stops the connection rather than let you get flagged. see `docs/anticheat.md`.

---

## Author & support

made by **Nuro** ([@al007ex](https://github.com/al007ex)).

- GitHub: https://github.com/al007ex/MooMoo.js
- Discord: https://discord.gg/NMS3YR9Q5R

bugs, questions and mismatch reports are all welcome there.

---

## License

MIT. educational use on your own private server.
