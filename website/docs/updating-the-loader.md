---
title: Updating the loader
---

# Updating the loader

when the server ships a new build, the mods should keep working and the only thing
you touch is the loader. here's how that goes.

## the three things that can change

1. **packet letters / argument order.** you fix these in `loader/src/binding.js`.
2. **key mixing / build id.** handled for you. the loader pulls `mixKey` and
   `BUILD_SALT` from the page's `moomoo-protocol` module every connection, so a plain
   redeploy needs no change at all.
3. **the stable constants baked into the client bundle** (the packet-name lists, the
   mixing multipliers, the telemetry format). rare. you fix these in
   `loader/src/protocol.js` and `loader/src/binding.js`.

## finding out what changed

install the loader, open the console, and watch the raw packet stream:

```js
MooMooLoader.onRaw((dir, name, args) => console.log(dir, name, args));
```

do something in game (take a hit, chat, place an item) and watch which wire letter
carries it and what order its arguments come in. that tells you how to fix the
binding.

## fixing the binding

`loader/src/binding.js` is where the two halves meet. to re-point an event:

```js
// before: health was packet "O"
incoming["O"] = { event: "health", parse: (a) => ({ sid: a[0], value: a[1] }) };

// after: the server moved health to "Q" and swapped the args
incoming["Q"] = { event: "health", parse: (a) => ({ sid: a[1], value: a[0] }) };
```

the **left** side (the wire letter, the argument order) is what changes. the
**right** side (the name `health`, the field names `sid`/`value`) does not, because
that's the thing mods depend on. do the same for outgoing actions in the `outgoing`
map.

## adding a new packet to the vocabulary

if the server adds a packet you want a name for:

1. add it to `shared/vocabulary.js` (events or actions) with its field names.
2. point the binding at it in `loader/src/binding.js`.
3. rebuild (`npm run build`) and re-sync the website (`node website/sync-lib.mjs`).

existing mods don't care, and new mods can use the new name right away.

## rebuild and ship

```bash
npm run build          # loader/dist/moomoo-loader.user.js
npm test               # make sure the codec still matches the server
```

re-host the new `moomoo-loader.user.js` at the **same url**. since every mod
`@require`s that url, they all pick up the fix on the next load and nobody has to
republish anything.

## checking it against the server

the test suite round-trips the loader's codec against the real server protocol when
the server is checked out next to this repo (or at `$MOOMOO_SERVER_DIR`). keep it
green and you know the wire layer is right.
