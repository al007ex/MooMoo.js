# 🐮 moomoo.js

a modding framework for my MooMoo.io-style private server. you write mods without
ever touching the websocket, the crypto, or the packet format. you just listen for
events, send actions, and let the framework do the rest.

```
on health(sid, value) {
    if (sid == self.sid) {
        log("My health is now " + value)
    }
}
```

that's a complete, working mod.

> **heads up.** this is built for my own private server (a hobby thing i run) and
> for figuring out how all this fits together. it targets the companion
> `moomoo-clone` server. don't use it against servers you don't own.

---

## two parts

| | what | changes when the server updates? |
| --- | --- | --- |
| **the loader** | a Tampermonkey userscript that hooks the socket, speaks the protocol, exposes `window.MooMoo`, and adds the in-game **Mods** menu | **yes** — it's the only piece that does |
| **the runtime + language** | the stable `window.MooMoo` API and the **moomoo.js** language; mods only ever touch these | **never** |

the thing connecting them is a tiny **binding** that maps wire packets to stable
names. rename a packet on the server, change one line in the binding, and every mod
anyone ever wrote keeps working.

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

1. **install the loader.** set its `@match` to your server, host it somewhere, and
   add it in Tampermonkey. open the game and a **Mods** tab shows up in the menu.
2. **write a mod** in the [playground](website/static/playground/index.html) or in
   moomoo.js, then compile it:

   ```bash
   node compiler/cli.mjs examples/health-logger.moomoo \
     --loader "https://your-host/moomoo-loader.user.js"
   ```
3. **install the compiled userscript.** it `@require`s the loader, so updating the
   loader updates every mod at once.

full walkthrough: **`website/docs/getting-started.md`**.

---

## the moomoo.js language

a tiny language for one job: react to events, send actions. it's got `mod`, `on`,
`every`, `fn`, `let`, `if/else`, `while`, `repeat`, `send.*`, `log`, and per-mod
`setting`s that show up in the in-game menu.

```
mod "Auto Reply" {
    setting phrase = "hi there" "Reply text"

    on chat(sid, message) {
        if (message == "hi") { send.chat(setting.phrase) }
    }
}
```

compile it and you get a Tampermonkey plugin that sits on top of the loader. see
`website/docs/language-reference.md`.

---

## the in-game Mods menu

the loader drops a **Mods** tab into the game's pause menu, styled to match the
native tabs. every registered mod gets an on/off toggle you can flip while playing,
and if it has settings, an expandable panel for them. the state sticks around across
reloads.

---

## the website

`website/` is a Docusaurus site with the full docs and an interactive
**playground** where you write moomoo.js, see a live preview of the in-game menu,
and compile to a userscript in one click.

```bash
cd website
npm install
npm start        # docs + playground at http://localhost:3000
```

the playground also runs standalone, just open
`website/static/playground/index.html`.

---

## Tests

```bash
npm test
```

- **`protocol.roundtrip`** — the loader's codec vs. the real server protocol and vs.
  `msgpack-lite`.
- **`loader.integration`** — the whole loader against a real server session in a fake
  browser (hook, decode, re-encode, telemetry scrub, injection).
- **`bundle.vm`** — the assembled userscript, run in a sandbox.
- **`compiler`** — lexing, parsing, codegen, and runtime mod management.

the codec tests run against the `moomoo-clone` server when it's sitting next to this
repo (or at `$MOOMOO_SERVER_DIR`). otherwise they just skip.

---

## updating when the server changes

watch the live packet stream, then fix the binding:

```js
MooMooLoader.onRaw((dir, name, args) => console.log(dir, name, args));
```

```js
// loader/src/binding.js — only the LEFT side moves
incoming["O"] = { event: "health", parse: (a) => ({ sid: a[0], value: a[1] }) };
```

rebuild, re-host at the same url, done. see `website/docs/updating-the-loader.md`.

---

## License

MIT. educational use on your own private server.
