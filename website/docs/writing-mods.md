---
title: Writing mods
---

# Writing mods

moomoo.js is a tiny language built for one job: react to game events and send
game actions. This page teaches it by example. For the exact grammar see the
**[language reference](./language-reference)**.

## A mod is a `mod` block

```
mod "My First Mod" {
    @description "Says hi when I spawn."

    on setup(sid) {
        log("hello! my sid is " + sid)
    }
}
```

`@description`, `@version`, `@match`, `@author` are metadata. They flow into the
Tampermonkey header when you compile.

## Reacting to events

`on <event>(params) { ... }` runs every time that packet arrives. The parameter
names are yours; they map, in order, onto the packet's fields (see the
**[packet reference](./packets)**).

```
on chat(sid, message) {
    log("player " + sid + " said: " + message)
}
```

## Reading game state

`self` is you; `players` is everyone in view.

```
on health(sid, value) {
    if (value < 30 && sid == self.sid) {
        log("low health! " + self.health)
    }
}
```

`self` tracks `sid`, `health`, `x`, `y`, `dir`, and any value the server sends you
(`points`, `kills`, `wood`, …). `player(sid)` looks up another player.

## Sending actions

`send.<action>(...)` puts a packet on the wire. Arguments are positional.

```
on chat(sid, message) {
    if (message == "ping") {
        send.chat("pong")
    }
}
```

See the **[packet reference](./packets)** for every action and its parameters.

## Settings

Declare a `setting` and it appears — expandable, persistent — under your mod in
the in-game **Mods** menu. Read it as `setting.<name>`.

```
mod "Auto Reply" {
    setting phrase = "hi there" "Reply text"
    setting enabled = true "Enabled"

    on chat(sid, message) {
        if (setting.enabled && message == "hi") {
            send.chat(setting.phrase)
        }
    }
}
```

The type is inferred from the default: `true/false` → a toggle, a number → a
number field, a string → a text field. Changing a setting re-applies the mod
immediately.

## Timers

`every (ms) { ... }` runs on an interval. Timers are cleaned up automatically when
the mod is disabled.

```
mod "Auto Ping" {
    every (3000) {
        send.ping()
    }
}
```

## Variables, functions, control flow

```
mod "Math" {
    fn double(n) { return n * 2 }

    on health(sid, value) {
        let doubled = double(value)
        repeat (3) {
            log("x" + doubled)
        }
    }
}
```

moomoo.js has `let`, assignment, `if/else`, `while`, `repeat (n)`, `fn`, and the
usual operators. Math helpers (`floor`, `round`, `min`, `max`, `random`, `sin`,
`atan2`, `pi`, …) and `now()` are built in.

## Enable, disable, and settings at runtime

You don't write any of this — the loader's **Mods** menu gives every mod a toggle
and renders its settings. Disabling a mod removes its event handlers and clears
its timers; enabling re-runs it. State persists across reloads.

## Compiling

```bash
node compiler/cli.mjs my-mod.moomoo --loader "https://your-host/moomoo-loader.user.js"
```

…or use the **[playground](/playground/)**, which compiles as you type. The output
is a Tampermonkey userscript; install it and it works with the loader.
