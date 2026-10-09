---
title: The compiler
---

# The compiler

the compiler takes moomoo.js source and turns it into a JavaScript plugin that
targets `window.MooMoo`, and it can wrap that as a Tampermonkey userscript.

```
source ──lex──▶ tokens ──parse──▶ AST ──generate──▶ JS (a MooMoo.register call)
```

it's one file with no dependencies, `compiler/moomoo-compiler.js`, and it runs both
in Node (the CLI) and in the browser (the playground).

## CLI

```bash
node compiler/cli.mjs <input.moomoo> [options]
```

| option | what it does |
| --- | --- |
| `-o, --out <file>` | output path (defaults to `<input>.user.js`) |
| `--loader <url>` | the loader url to `@require` |
| `--plain` | emit a bare `(function(MooMoo){…})(window.MooMoo)` instead of a full userscript |
| `--print` | write to stdout |

example:

```bash
node compiler/cli.mjs health-logger.moomoo \
  --loader "https://your-host/moomoo-loader.user.js" \
  -o health-logger.user.js
```

## what comes out

each mod compiles to a `MooMoo.register(meta, setup)` call. `meta` holds the id,
name, version, description, and settings schema. `setup(ctx)` wires up the handlers
and timers through `ctx.on` / `ctx.every` so the runtime can tear them down when the
mod gets turned off.

the userscript wrapper drops the plugin into the **page** context (where
`window.MooMoo` actually lives) and waits for the loader to be ready before it runs.

## using it from code

```js
const C = require("./compiler/moomoo-compiler.js");
const r = C.compile(source);
if (r.ok) {
  const userscript = C.wrapUserscript(r, { loaderUrl: "https://…/moomoo-loader.user.js" });
  const plain = C.toPlainPlugin(r);
} else {
  console.error(r.error, "at line", r.line);
}
```

## checks at compile time

the compiler checks your mod against the vocabulary, so you catch mistakes before
they hit runtime:

- `on <event>` has to be a real event; unknown names are an error.
- naming more handler params than the event actually has is an error.
- `send.<action>` that isn't a known action gives you a warning.
- `setting` defaults have to be literals.

syntax errors come with a line and column.
