---
title: Getting started
---

# Getting started

you install the loader once, then you write and run a mod. that's the whole flow.

## 1. build the loader

from the repo:

```bash
npm run build
```

that writes `loader/dist/moomoo-loader.user.js`. open it and set the `@match` line
to your server's origin:

```js
// @match https://play.my-private-server.example/*
```

then host that file somewhere your mods can reach it (a gist raw url, your own
static host, GitHub Pages, whatever). that url is what your mods will `@require`.

## 2. install the loader

in Tampermonkey (or Violentmonkey), make a new script and paste in the contents of
`moomoo-loader.user.js`, or just add it by url. it runs at `document-start`, hooks
the socket, and sets up `window.MooMoo`. open the game and you should see a **Mods**
tab in the pause menu (empty for now) and this in the console:

```
[moomoo.js] loader 1.0.0 installed — window.MooMoo is ready for mods
```

:::tip don't minify the loader
if you run the built userscript through a minifier it can break it. just use the
file as it comes out of the build.
:::

## 3. write a mod

two ways to do this.

### a. in the playground (easiest)

open the **[playground](/playground/)**, write your moomoo.js, paste your loader
url into the **Loader @require URL** box, and hit **Copy** or **Download .user.js**.
done.

### b. with the compiler

write `health-logger.moomoo`:

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

compile it into a userscript:

```bash
node compiler/cli.mjs health-logger.moomoo --loader "https://your-host/moomoo-loader.user.js"
```

that gives you `health-logger.user.js`.

## 4. run it

install the compiled `health-logger.user.js` in Tampermonkey. because it
`@require`s your loader, the loader loads first. join the game, open the **Mods**
tab, and you'll see **Health Logger** sitting there with a toggle and an **Only my
health** setting. take a hit and watch the console log your health.

## what just happened

- the **loader** hooked the socket, decoded the `health` packet, and fired the
  `health` event.
- your **mod** (compiled down to `window.MooMoo` calls) got it.
- the **Mods menu** let you toggle the mod and change its setting while playing.

next up: **[Writing mods](./writing-mods)** for the rest of the language.
