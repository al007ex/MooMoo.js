# Getting started

you install the loader once, then you write and run a mod. that's the whole flow.

## 1. build the loader

from the repo:

```bash
npm install   # one-time: pulls esbuild, used to mangle the builds
npm run build
```

that writes `loader/dist/moomoo-loader.user.js`. open it and set the `@match` line
to your server's origin:

```js
// @match https://play.my-private-server.example/*
```

then host that file somewhere your mods can reach it (a pastebin raw url, your own
static host, GitHub Pages, whatever). that url is what your mods will `@require`.

## 2. install the loader

in Tampermonkey (or Violentmonkey), make a new script and paste in the contents of
`moomoo-loader.user.js`, or just add it by url. it runs at `document-start`, hooks
the socket, and sets up `window.MooMoo`. open the game and you should see a **Mods**
tab in the pause menu and this in the console:

```
[moomoo.js] loader 1.3.0 installed — window.MooMoo is ready for mods
```

## 3. write a mod

a mod is a Tampermonkey userscript that `@require`s the loader and talks to
`window.MooMoo`. here's the whole thing:

```js
// ==UserScript==
// @name         Health Logger
// @match        https://play.my-private-server.example/*
// @run-at       document-start
// @require      https://your-host/moomoo-loader.user.js
// @grant        none
// ==/UserScript==

MooMoo.register({
    id: "health-logger",
    name: "Health Logger",
    settings: [{ key: "onlyMine", label: "Only my health", default: true }]
}, (ctx) => {
    ctx.on("setup", ({ sid }) => console.log("joined as " + sid));
    ctx.on("health", ({ sid, value }) => {
        if (ctx.settings.onlyMine && sid !== MooMoo.self.sid) return;
        console.log("health " + sid + " -> " + value);
    });
});
```

`register` gives you a **Mods** tab entry with an on/off toggle and your settings,
and a `ctx` whose `on` / `every` / `onCleanup` tear themselves down when the mod is
turned off. (`MooMoo.on(...)` works too, for a quick throwaway.)

## 4. run it

install that userscript in Tampermonkey. because it `@require`s your loader, the
loader loads first. join the game, open the **Mods** tab, and you'll see **Health
Logger** with a toggle and an **Only my health** setting. take a hit and watch the
console.

## what just happened

- the **loader** hooked the socket, decoded the `health` packet, and fired the
  `health` event.
- your **mod** got it through `ctx.on`.
- the **Mods menu** let you toggle the mod and change its setting while playing.

next up: **[Writing mods](./writing-mods)** for the rest of the API, and the
**MooMooPlus** source (`mods/moomooplus/`) for a big worked example.
