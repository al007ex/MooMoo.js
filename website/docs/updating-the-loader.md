---
title: Updating the loader
---

# Updating the loader

When the private server ships a new build, mods should keep working and only the
loader should need a touch. Here's how to do that update.

## The three things that can change

1. **Packet letters / argument order.** Fixed in `loader/src/binding.js`.
2. **Key mixing / build id.** Handled automatically — the loader fetches
   `mixKey` and `BUILD_SALT` from the page's `moomoo-protocol` module every
   connection, so a redeploy needs no change.
3. **Stable constants in the client bundle** (the packet-name lists, the mixing
   multipliers, the telemetry format). Rare. Fixed in `loader/src/protocol.js`
   and `loader/src/binding.js`.

## Finding what changed

Install the loader, open the console, and watch the raw packet stream:

```js
MooMooLoader.onRaw((dir, name, args) => console.log(dir, name, args));
```

Do something in game (take a hit, chat, place an item) and watch which wire
letter carries it and in what order its arguments come. That tells you how to fix
the binding.

## Fixing the binding

`loader/src/binding.js` is the hinge. To re-point an event:

```js
// before: health was packet "O"
incoming["O"] = { event: "health", parse: (a) => ({ sid: a[0], value: a[1] }) };

// after: the server moved health to "Q" and swapped the args
incoming["Q"] = { event: "health", parse: (a) => ({ sid: a[1], value: a[0] }) };
```

The **left** side (wire letter, argument order) changes. The **right** side (the
name `health`, the field names `sid`/`value`) does **not** — that's the contract
mods depend on. Do the same for outgoing actions in the `outgoing` map.

## Adding a new packet to the vocabulary

If the server adds a packet you want named:

1. Add it to `shared/vocabulary.js` (events or actions) with its field names.
2. Point the binding at it in `loader/src/binding.js`.
3. Rebuild (`npm run build`) and re-sync the website (`node website/sync-lib.mjs`).

Existing mods are unaffected; new mods can use the new name immediately.

## Rebuild and ship

```bash
npm run build          # loader/dist/moomoo-loader.user.js
npm test               # verify the codec still matches the server
```

Re-host the new `moomoo-loader.user.js` at the **same URL**. Because every mod
`@require`s that URL, they all pick up the fix on next load — no mod needs
republishing.

## Verifying against the server

The test suite round-trips the loader's codec against the real server protocol
when it's checked out next to this repo (or at `$MOOMOO_SERVER_DIR`). Keep it
green and you know the wire layer is correct.
