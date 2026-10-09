---
title: The compiler
---

# The compiler

The compiler turns moomoo.js source into a JavaScript plugin that targets
`window.MooMoo`, and can wrap it as a Tampermonkey userscript.

```
source ──lex──▶ tokens ──parse──▶ AST ──generate──▶ JS (a MooMoo.register call)
```

It's one dependency-free file, `compiler/moomoo-compiler.js`, that runs in Node
(the CLI) and in the browser (the playground).

## CLI

```bash
node compiler/cli.mjs <input.moomoo> [options]
```

| Option | Effect |
| --- | --- |
| `-o, --out <file>` | output path (default `<input>.user.js`) |
| `--loader <url>` | the loader URL to `@require` |
| `--plain` | emit a bare `(function(MooMoo){…})(window.MooMoo)` instead of a userscript |
| `--print` | write to stdout |

Example:

```bash
node compiler/cli.mjs health-logger.moomoo \
  --loader "https://your-host/moomoo-loader.user.js" \
  -o health-logger.user.js
```

## What it emits

Each mod compiles to a `MooMoo.register(meta, setup)` call. `meta` carries the id,
name, version, description, and settings schema; `setup(ctx)` wires up the
handlers and timers via `ctx.on` / `ctx.every` so the runtime can tear them down
when the mod is disabled.

The userscript wrapper injects the plugin into the **page** context (where
`window.MooMoo` lives) and waits for the loader to be ready before running.

## Programmatic use

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

## Compile-time checks

The compiler validates against the vocabulary, so you catch mistakes before
runtime:

- `on <event>` must be a real event; unknown names are an error.
- Naming more handler parameters than the event provides is an error.
- `send.<action>` that isn't a known action produces a warning.
- `setting` defaults must be literals.

Syntax errors carry a line and column.
