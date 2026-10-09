---
title: Language reference
---

# moomoo.js language reference

A compact reference for the whole language. moomoo.js compiles to JavaScript that
targets `window.MooMoo`.

## Program

A file is exactly one mod:

```
mod "Name" {
    <directives>
    <declarations and handlers>
}
```

## Directives

Metadata, written `@key "value"`. Repeatable keys collect into a list.

| Directive | Effect |
| --- | --- |
| `@name` | overrides the mod name (default: the `mod "…"` string) |
| `@version` | userscript `@version` (default `1.0.0`) |
| `@description` | userscript `@description` |
| `@author` | userscript `@author` |
| `@match` | userscript `@match` (repeatable; default `*://*/*`) |
| `@require` | extra `@require` URLs (repeatable) |
| `@grant` | userscript `@grant` (default `none`) |

## Declarations

### `setting`

```
setting <name> = <literal> [ "<label>" ]
```

Declares a persistent, UI-exposed setting. `<literal>` is a number, string, or
`true`/`false`; its type is inferred. Read it with `setting.<name>`.

### `fn`

```
fn <name>(<params>) { <statements> }
```

A function. `return <expr>` returns a value.

### `let`

```
let <name> = <expr>
```

A variable, scoped to its block.

## Handlers

### `on`

```
on <event>(<params>) { <statements> }
```

Subscribes to a semantic event. Parameters bind positionally to the event's
payload fields. See the **[packet reference](./packets)**. You may name fewer
params than the event provides; naming more is a compile error.

### `every`

```
every (<ms>) { <statements> }
```

Runs the body every `<ms>` milliseconds. Cleared automatically when the mod is
disabled.

## Statements

| Statement | Meaning |
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

## Expressions

- Literals: numbers, `"strings"`, `true`, `false`, `null`, arrays `[a, b]`,
  objects `{ k: v }`.
- Member `a.b`, index `a[i]`, call `f(a, b)`.
- Unary `!x`, `-x`.
- Binary, by precedence (low → high): `||`, `&&`, `== !=`, `< <= > >=`,
  `+ -`, `* / %`.
- Grouping `( … )`.

## Built-ins

Available without import inside a mod:

| Name | Is |
| --- | --- |
| `self` | your player: `sid`, `health`, `x`, `y`, `dir`, `points`, … |
| `players` | a `Map` of sid → player |
| `player(sid)` | look up a player |
| `send` | the actions object (`send.chat(…)`, `send.spawn(…)`, …) |
| `setting` | your settings (`setting.<name>`) |
| `log(…)` | console logger, tagged with the mod name |
| `now()` | `Date.now()` |
| math | `abs floor ceil round min max sqrt pow sign random sin cos tan atan2 hypot pi` |

## Comments

```
// line comment
/* block comment */
```

## Escape hatch

Need a packet the vocabulary doesn't name yet? `send.raw("<wire>", [args])` sends
a raw wire packet. Prefer named actions; see **[updating the loader](./updating-the-loader)**
to add a proper name.
