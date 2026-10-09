---
title: Language reference
---

# moomoo.js language reference

the whole language in one place. moomoo.js compiles to JavaScript that targets
`window.MooMoo`.

## program

a file is exactly one mod:

```
mod "Name" {
    <directives>
    <declarations and handlers>
}
```

## directives

metadata, written `@key "value"`. keys that can repeat collect into a list.

| directive | what it does |
| --- | --- |
| `@name` | overrides the mod name (defaults to the `mod "…"` string) |
| `@version` | userscript `@version` (defaults to `1.0.0`) |
| `@description` | userscript `@description` |
| `@author` | userscript `@author` |
| `@match` | userscript `@match` (repeatable; defaults to `*://*/*`) |
| `@require` | extra `@require` urls (repeatable) |
| `@grant` | userscript `@grant` (defaults to `none`) |

## declarations

### `setting`

```
setting <name> = <literal> [ "<label>" ]
```

a setting that persists and shows up in the menu. `<literal>` is a number, string,
or `true`/`false`, and the type is figured out from it. read it with
`setting.<name>`.

### `fn`

```
fn <name>(<params>) { <statements> }
```

a function. `return <expr>` hands back a value.

### `let`

```
let <name> = <expr>
```

a variable, scoped to its block.

## handlers

### `on`

```
on <event>(<params>) { <statements> }
```

subscribes to an event. the params bind in order to the event's fields (see the
**[packet reference](./packets)**). you can name fewer params than the event has;
naming more is a compile error.

### `every`

```
every (<ms>) { <statements> }
```

runs the body every `<ms>` milliseconds. cleared on its own when the mod is turned
off.

## statements

| statement | means |
| --- | --- |
| `let x = e` | declare a variable |
| `x = e` | assign (to a name, `a.b`, or `a[i]`) |
| `if (c) { } else { }` | conditional; `else if` chains |
| `while (c) { }` | loop while `c` |
| `repeat (n) { }` | loop `n` times |
| `return e` | return from a `fn` |
| `send.action(args)` | send a packet (see below) |
| `log(e)` | print to the console, tagged with the mod name |
| `e` | any expression (usually a call) |

## expressions

- literals: numbers, `"strings"`, `true`, `false`, `null`, arrays `[a, b]`,
  objects `{ k: v }`.
- member `a.b`, index `a[i]`, call `f(a, b)`.
- unary `!x`, `-x`.
- binary, low to high precedence: `||`, `&&`, `== !=`, `< <= > >=`, `+ -`,
  `* / %`.
- grouping `( … )`.

## built-ins

these are just there inside a mod, no import needed:

| name | what it is |
| --- | --- |
| `self` | your player: `sid`, `health`, `x`, `y`, `dir`, `points`, … |
| `players` | a `Map` of sid → player |
| `player(sid)` | look up a player |
| `send` | the actions object (`send.chat(…)`, `send.spawn(…)`, …) |
| `setting` | your settings (`setting.<name>`) |
| `log(…)` | console logger, tagged with the mod name |
| `now()` | `Date.now()` |
| math | `abs floor ceil round min max sqrt pow sign random sin cos tan atan2 hypot pi` |

## comments

```
// line comment
/* block comment */
```

## escape hatch

need a packet the vocabulary doesn't have a name for yet? `send.raw("<wire>",
[args])` sends a raw wire packet. use named actions when you can though, and see
**[updating the loader](./updating-the-loader)** for how to add a proper name.
