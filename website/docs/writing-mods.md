---
title: Writing mods
---

# Writing mods

moomoo.js is a tiny language that does one thing: react to game events and send
game actions. this page just walks through it with examples. if you want the exact
grammar, that's in the **[language reference](./language-reference)**.

## a mod is a `mod` block

```
mod "My First Mod" {
    @description "Says hi when I spawn."

    on setup(sid) {
        log("hello! my sid is " + sid)
    }
}
```

`@description`, `@version`, `@match`, `@author` are just metadata. they end up in
the Tampermonkey header when you compile.

## reacting to events

`on <event>(params) { ... }` runs every time that packet shows up. the parameter
names are yours to pick, they just map in order onto the packet's fields (the
**[packet reference](./packets)** lists them all).

```
on chat(sid, message) {
    log("player " + sid + " said: " + message)
}
```

## reading game state

`self` is you. `players` is everyone you can see.

```
on health(sid, value) {
    if (value < 30 && sid == self.sid) {
        log("low health! " + self.health)
    }
}
```

`self` tracks `sid`, `health`, `x`, `y`, `dir`, and whatever else the server sends
you (`points`, `kills`, `wood`, …). `player(sid)` looks up someone else.

## sending actions

`send.<action>(...)` puts a packet on the wire. the arguments are positional.

```
on chat(sid, message) {
    if (message == "ping") {
        send.chat("pong")
    }
}
```

see the **[packet reference](./packets)** for every action and what it takes.

## settings

declare a `setting` and it shows up under your mod in the in-game **Mods** menu,
expandable and saved between reloads. read it back with `setting.<name>`.

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

the type comes from the default you give it: `true`/`false` makes a toggle, a
number makes a number field, a string makes a text field. changing a setting
re-applies the mod right away.

## timers

`every (ms) { ... }` runs on a loop. the timers get cleaned up on their own when
you disable the mod.

```
mod "Auto Ping" {
    every (3000) {
        send.ping()
    }
}
```

## variables, functions, control flow

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

you've got `let`, assignment, `if/else`, `while`, `repeat (n)`, `fn`, and the usual
operators. the math helpers (`floor`, `round`, `min`, `max`, `random`, `sin`,
`atan2`, `pi`, …) and `now()` are already there.

## turning mods on and off at runtime

you don't write any of this yourself. the loader's **Mods** menu gives every mod a
toggle and draws its settings for you. turning a mod off removes its event handlers
and clears its timers, turning it back on re-runs it. the state sticks around
across reloads.

## compiling

```bash
node compiler/cli.mjs my-mod.moomoo --loader "https://your-host/moomoo-loader.user.js"
```

or use the **[playground](/playground/)**, which compiles as you type. either way
you get a Tampermonkey userscript, install it and it works with the loader.
