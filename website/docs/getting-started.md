---
title: Getting started
---

# Getting started

You'll install the loader once, then write and run a mod.

## 1. Build the loader

From the repo:

```bash
npm run build
```

This writes `loader/dist/moomoo-loader.user.js`. Open it and set the `@match`
line to your server's origin:

```js
// @match https://play.my-private-server.example/*
```

Host that file somewhere your mods can reach it (a gist raw URL, your own static
host, GitHub Pages…). That URL is what mods will `@require`.

## 2. Install the loader

In Tampermonkey (or Violentmonkey), create a new script and paste the contents of
`moomoo-loader.user.js`, **or** add it by URL. It runs at `document-start`, hooks
the socket, and exposes `window.MooMoo`. Open the game — you'll see a **Mods** tab
in the pause menu (empty for now) and this in the console:

```
[moomoo.js] loader 1.0.0 installed — window.MooMoo is ready for mods
```

## 3. Write a mod

Two ways:

### A. In the playground (easiest)

Open the **[playground](/playground/)**, snap blocks together or write moomoo.js,
paste your loader URL into the **Loader @require URL** box, and hit **Copy** or
**Download .user.js**. Done.

### B. With the compiler

Write `health-logger.moomoo`:

```
mod "Health Logger" {
    @match "https://play.my-private-server.example/*"
    setting onlyMine = true "Only my health"

    on setup(sid) {
        log("joined as " + sid)
    }
    on health(sid, value) {
        if (setting.onlyMine) {
            if (sid == self.sid) { log("My health is now " + value) }
        }
    }
}
```

Compile it to a userscript:

```bash
node compiler/cli.mjs health-logger.moomoo --loader "https://your-host/moomoo-loader.user.js"
```

That produces `health-logger.user.js`.

## 4. Run it

Install the compiled `health-logger.user.js` in Tampermonkey. Because it
`@require`s your loader, the loader loads first. Join the game: open the **Mods**
tab, and you'll see **Health Logger** with a toggle and an **Only my health**
setting. Take a hit — the console logs your health.

## What just happened

- The **loader** hooked the socket, decoded the `health` packet, and fired the
  `health` event.
- Your **mod** (compiled to call `window.MooMoo`) received it.
- The **Mods menu** let you toggle the mod and change its setting at runtime.

Next: **[Writing mods](./writing-mods)** for the full language.
