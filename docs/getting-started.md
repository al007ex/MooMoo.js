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
`moomoo-loader.user.js`, or just add it by url. it runs at `document-start` and hooks
the socket. it deliberately puts **nothing** on `window` — so the server's anti-cheat
has no `MooMoo*` global to find — and instead hands its API to mods through a small
event handshake (below). open the game and you should see a **Mods** tab in the pause
menu and this in the console:

```
[moomoo.js] loader 1.3.3 installed
```

## 3. write a mod

a mod is a Tampermonkey userscript that `@require`s the loader and asks it for the
API with a one-line handshake (there is no `window.MooMoo`). here's the whole thing:

```js
// ==UserScript==
// @name         Health Logger
// @match        https://play.my-private-server.example/*
// @run-at       document-start
// @inject-into  page
// @require      https://your-host/moomoo-loader.user.js
// @grant        none
// ==/UserScript==

// Ask the loader for its API. `MooMoo` (and `MooMooLoader`) are yours inside here.
withMooMoo((MooMoo) => {
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
});

// The handshake — paste this helper into any mod once. The loader answers the event
// synchronously, so `run` fires as soon as both are loaded (it @requires the loader,
// so that's immediately).
function withMooMoo(run) {
    const w = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
    function connect() {
        let mm = null, ld = null;
        try { w.dispatchEvent(new CustomEvent("moomoo.js:api", { detail: { resolve: (m, l) => { mm = m; ld = l; } } })); } catch (e) {}
        if (mm) { run(mm, ld); return true; }
        return false;
    }
    if (connect()) return;
    const iv = setInterval(() => { if (connect()) clearInterval(iv); }, 50);
    w.addEventListener("moomoo.js:ready", () => { if (connect()) clearInterval(iv); });
}
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
**MooMoo Lite** source (`mods/lite.js`) for a worked example.
