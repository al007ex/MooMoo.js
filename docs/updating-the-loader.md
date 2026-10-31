# Updating the loader

when the server ships a new build, the mods should keep working and the only thing
you touch is the loader. here's how that goes.

## the three things that can change

1. **packet letters / argument order.** you fix these in `loader/src/net/binding.js`.
2. **key mixing / build id.** handled for you. the loader pulls `mixKey` and
   `BUILD_SALT` from the page's `moomoo-protocol` module every connection, so a plain
   redeploy needs no change at all.
3. **the stable constants baked into the client bundle** — the packet-name lists,
   the mixing multipliers, how the packet tables are built, the telemetry format,
   and the **code seal** (the server can bind a hash of the client bundle into the
   session key). rarer. you fix these in `loader/src/net/protocol.js` and
   `loader/src/net/binding.js`. the current server does all of the above; the loader
   mirrors it (tables built base-shuffle + hashed-extension, the seal read off the
   page's `moomoo-seal` import, telemetry answered as the probe reply).

## finding out what changed

install the loader, open the console, and watch the raw packet stream:

```js
MooMooLoader.onRaw((dir, name, args) => console.log(dir, name, args));
```

do something in game (take a hit, chat, place an item) and watch which wire letter
carries it and what order its arguments come in. that tells you how to fix the
binding.

## fixing the binding

`loader/src/net/binding.js` is where the two halves meet. to re-point an event:

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
2. point the binding at it in `loader/src/net/binding.js`.
3. rebuild (`npm run build`).

existing mods don't care, and new mods can use the new name right away.

## rebuild and ship

```bash
npm run build          # loader/dist/moomoo-loader.user.js
npm test               # make sure the codec still matches the server
```

re-host the new `moomoo-loader.user.js` at the **same url**. since every mod
`@require`s that url, they all pick up the fix on the next load and nobody has to
republish anything.

## the loader tells players when it's out of date

every build is pinned to the client bundle it was made for. `loader/build.mjs` reads
the server's current `dist/official/assets/index-<stem>.js` (via `$MOOMOO_SERVER_DIR`
or a sibling `moomoo-clone-main` checkout) and bakes that `<stem>` — the content hash
FRVR puts in the file name — into the loader. at runtime the loader compares it to the
bundle the page actually loaded:

- **same stem** — the loader is current, nothing to see.
- **different stem** — the client changed since this loader was built, so it shows a
  dismissible "this loader may be out of date" card: the two stems, a copyable report,
  and a link to grab the newest build from the Discord. the player can still join.

so when you ship a new client and rebuild + re-host the loader, anyone still on the old
one is told to update (and to report it, if they're already current). the check is off
until a build pins a stem — the readable source and Node test runs leave it unpinned —
and it keys on the file *name*, which the server's IS_SANDBOX byte transform never
touches, so a dev server never false-alarms. none of it reaches the wire; it's a local
heads-up, invisible to the server.

## checking it against the server

the test suite round-trips the loader's codec against the real server protocol when
the server is checked out next to this repo (or at `$MOOMOO_SERVER_DIR`). keep it
green and you know the wire layer is right.
