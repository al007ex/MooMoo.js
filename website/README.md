# moomoo.js website

A [Docusaurus](https://docusaurus.io) documentation site plus the in-browser
**playground**.

## Run it

```bash
cd website
npm install
npm start          # http://localhost:3000  (docs + playground)
npm run build      # static production build in build/
```

> Needs **Node 18+**. (This uses Docusaurus 3.10+, which runs on current Node
> including 23. Older Docusaurus 3.5.x had a webpack path bug on recent webpack —
> if you ever pin it back, use Node 20 LTS.)

`npm start` / `npm run build` first run `sync-lib.mjs`, which copies the current
`shared/vocabulary.js`, `compiler/moomoo-compiler.js`, `loader/src/runtime.js`,
and `loader/src/menu.js` into `static/playground/lib/` so the playground always
reflects the latest framework.

## The playground works standalone

The playground is plain HTML/CSS/JS with no build step. You can open it directly,
without Docusaurus:

```
website/static/playground/index.html
```

(or serve the folder over HTTP so the `lib/*.js` modules load).

## Structure

```
docs/                 the documentation (Markdown)
src/pages/index.js    the landing page
src/css/custom.css    the green theme
static/playground/    the standalone moomoo.js code playground
static/img/           logo + favicon
docusaurus.config.js  site config
sidebars.js           docs sidebar
sync-lib.mjs          copies framework modules into the playground
gen-packets.mjs       regenerates docs/packets.md from the vocabulary
```

## Regenerate the packet reference

```bash
node gen-packets.mjs   # writes docs/packets.md from shared/vocabulary.js
```
