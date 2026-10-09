# 🐮 moomoo.js

A **modding framework** for MooMoo.io-style **private servers**. Write mods
without ever touching the WebSocket, the crypto, or the packet format — subscribe
to named events, send named actions, and let the framework do the rest.

```
on health(sid, value) {
    if (sid == self.sid) {
        log("My health is now " + value)
    }
}
```

That's a complete, working mod.

> **Scope.** moomoo.js is built for **your own** private server — a hobby project
> you run and control — and for learning how these systems fit together. It
> targets the companion `moomoo-clone` server. Don't use it against servers you
> don't own.

---

## Two parts, by design

| | What | Changes when the server updates? |
| --- | --- | --- |
| **The loader** | a Tampermonkey userscript that hooks the socket, speaks the protocol, exposes `window.MooMoo`, and adds an in-game **Mods** menu | **yes** — this is the only piece that does |
| **The runtime + language** | the stable `window.MooMoo` API and the **moomoo.js** language; mods only ever touch these | **no, ever** |

The hinge between them is a tiny **binding** that maps wire packets to stable
names. Rename a packet on the server → change one line in the binding → every mod
ever written keeps working.

```
wire bytes ─(loader: hook + decode + binding)─▶ named events ─▶ your mod
your mod ─▶ named actions ─(loader: binding + encode + send)─▶ wire bytes
```

---

## Repository layout

```
shared/vocabulary.js      the stable packet vocabulary (the contract mods use)
loader/
  src/                    the loader, split into modules
    msgpack.js  sha256.js  protocol.js   ← the wire codec
    binding.js            ← wire ⇄ vocabulary (edit this on server updates)
    anticheat.js          ← the undetectable WebSocket proxy
    runtime.js            ← window.MooMoo: events, actions, state, mod registry
    menu.js               ← the in-game Mods tab + settings UI
    loader.js             ← wires it together
  build.mjs               bundles src/ → dist/moomoo-loader.user.js
  dist/moomoo-loader.user.js
compiler/
  moomoo-compiler.js      the moomoo.js language compiler (Node + browser)
  cli.mjs                 command-line compiler
examples/
  health-logger.moomoo    the sample mod (source)
  health-logger.user.js   compiled Tampermonkey userscript
  menu-preview.html       a static preview of the in-game Mods menu
tests/                    codec + loader + compiler tests
website/                  Docusaurus docs + the in-browser playground
```

---

## Quickstart

```bash
npm run build     # build loader/dist/moomoo-loader.user.js
npm test          # run all tests (checks the codec against the server if present)
```

1. **Install the loader.** Set its `@match` to your server, host it somewhere,
   and add it in Tampermonkey. Open the game — a **Mods** tab appears in the menu.
2. **Write a mod** in the [playground](website/static/playground/index.html) or in
   moomoo.js, then compile it:

   ```bash
   node compiler/cli.mjs examples/health-logger.moomoo \
     --loader "https://your-host/moomoo-loader.user.js"
   ```
3. **Install the compiled userscript.** It `@require`s the loader, so updating the
   loader updates every mod at once.

Full walkthrough: **`website/docs/getting-started.md`**.

---

## The moomoo.js language

A tiny language for one job: react to events, send actions. It has `mod`, `on`,
`every`, `fn`, `let`, `if/else`, `while`, `repeat`, `send.*`, `log`, and
per-mod `setting`s that show up in the in-game menu.

```
mod "Auto Reply" {
    setting phrase = "hi there" "Reply text"

    on chat(sid, message) {
        if (message == "hi") { send.chat(setting.phrase) }
    }
}
```

Compile it → a Tampermonkey plugin that pastes on top of the loader. See
`website/docs/language-reference.md`.

---

## The in-game Mods menu

The loader injects a **Mods** tab into the game's pause menu, matching the native
tabs. Every registered mod gets a runtime on/off toggle and, if it declares
settings, an expandable panel. State persists across reloads.

---

## The website

`website/` is a Docusaurus site with thorough docs and an interactive
**playground** — build mods with Scratch-style blocks or by writing moomoo.js,
with a live in-game-menu preview and one-click compile to a userscript.

```bash
cd website
npm install
npm start        # docs + playground at http://localhost:3000
```

The playground also runs standalone — just open
`website/static/playground/index.html`.

---

## Tests

```bash
npm test
```

- **`protocol.roundtrip`** — the loader's codec vs. the real server protocol and
  vs. `msgpack-lite`.
- **`loader.integration`** — the whole loader against a real server session in a
  simulated browser (hook, decode, re-encode, telemetry scrub, injection).
- **`bundle.vm`** — the assembled userscript, run in a sandbox.
- **`compiler`** — lexing, parsing, codegen, and runtime mod management.

The codec tests check against the `moomoo-clone` server when it sits next to this
repo (or at `$MOOMOO_SERVER_DIR`); otherwise they skip.

---

## Updating when the server changes

Watch the live packet stream, then fix the binding:

```js
MooMooLoader.onRaw((dir, name, args) => console.log(dir, name, args));
```

```js
// loader/src/binding.js — only the LEFT side moves
incoming["O"] = { event: "health", parse: (a) => ({ sid: a[0], value: a[1] }) };
```

Rebuild, re-host at the same URL, done. See `website/docs/updating-the-loader.md`.

---

## License

MIT. For educational use on your own private server.
