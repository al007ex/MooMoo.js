# Anti-tamper & the socket hook

:::warning educational, own-server only
this page is about how the loader's socket hook keeps working against my own
server's anti-tamper. it's here so i (and you, if it's your server) understand the
defense from both sides. don't use it to get an edge on servers you don't run.
:::

## how the server checks the client

the reference server (`moomoo-clone`) trusts the client to tell on itself. once
you're in, the server sends an **integrity probe** packet `q = [salt, probes]`
(5s after you spawn, then every 60s) and the client has to answer with a telemetry
packet:

```
T = [flags, untrustedEvents, probeResult, seal, salt, seq, ledger]
```

- **flags** — a bitfield. bit 2 is "socket hooked" and gets you kicked; the rest
  (userscript manager, render hooked, debugger trap) are flags.
- **untrustedEvents** — how many script-dispatched (untrusted) inputs the client
  refused; a clean client reports 0.
- **probeResult** — a bitmask of which probes matched. the probes are salted
  hashes, so the client can't see what's being looked for. there are **nine probe
  kinds** — window property names (1), name=value (2), localStorage keys (3),
  elements by id (4), a constructor replaced by a wrapper (5), symbols (6), a
  function that isn't native (7), elements by class (8), and a `CustomEvent` a
  listener resolves (9) — covering things like "is `WebSocket.prototype.send` still
  native code" and "was this constructor wrapped".
- **seal** — a hash of the **code seal** (see below).
- **salt** — the probe round's salt, echoed back.
- **seq** and **ledger** — the running **frame ledger** (see below), the thing with
  the most teeth after the seal: `seq` is the last sequence number the client
  assigned and `ledger` is a rolling FNV-1a hash of every client→server body sent so
  far, both as they stood *before* this `T` frame. the server keeps the same two
  numbers and kicks on any drift, so a `T` has to carry the real ones.

and it's required: no answer within the window and you're kicked, so you can't just
block it.

## the code seal

this is the one that actually bites. the page ships a `moomoo-seal` import whose
file name is 16 random bytes in hex. the client builds

```
seal = sealBytes XOR SHA-256(its own bundle)[0..16]
```

and, in the server's **bind** mode, XORs that into the session key. so if the seal
is wrong by a single bit, every keyed frame fails its HMAC tag and the connection
dies on the first packet — there's nothing to "report clean", the transport just
doesn't work.

the loader reproduces the seal the same way the real (unmodified) client does: it
reads the `moomoo-seal` file name off the import map and SHA-256s the exact bundle
bytes the page loaded, then folds the result into the key. because the loader only
proxies the platform `WebSocket` and never patches the client's own functions, the
bundle it hashes is untouched, so the seal matches. that's in
`loader/src/net/protocol.js`, fed by the page lookups in `loader.js`.

### spotting an outdated loader

the same bundle lookup powers an "am i out of date" check. the loader is built for
one exact client build; the served file is `/assets/index-<stem>.js`, where `<stem>`
is a content hash FRVR puts in the name, so it changes whenever the client's bytes
do. `loader/build.mjs` bakes the stem it was built against into the loader, and at
runtime the loader reads the stem the page actually loaded — if they differ it shows
a dismissible "this loader may be out of date" card pointing you at the newest build
on Discord (or to copy a report). the stem is immune to the IS_SANDBOX byte transform
(that rewrites content, never the file name), so it never false-alarms on a dev
server. more in `docs/updating-the-loader.md`.

## the frame ledger

the newest thing with teeth, and why `T` grew two fields. per connection the server
keeps the last client→server **sequence number** it accepted and a rolling **FNV-1a
hash of every client→server body** it has decoded — the "ledger". every `T` reports
both as they stood just *before* that frame, and the server compares them to its own
copy; one wrong body, one dropped or reordered frame, and they diverge and you're
kicked. the loader keeps the identical pair because it *is* the thing encoding the
stream (it owns the sequence numbers), folding each body into its ledger exactly as
the server does, so the two stay in lock-step. it's in `loader/src/net/protocol.js`
(`fnvLedger`, the `ClientSession` ledger). this is also why a mod can't quietly drop
or forge a frame behind the loader's back — everything goes through the loader's
encoder, which keeps the ledger honest.

## why the socket hook doesn't get caught

the probes include "is `WebSocket.prototype.send` native" and "was `WebSocket`
wrapped". the loader is built so the honest answer is "no hook" anyway:

1. **it swaps the constructor, not the prototype, and does it first.**
   `window.WebSocket` becomes a `Proxy` of the native constructor, installed at
   `document-start`, before the client captures its reference. the interception
   happens per-socket in the `construct` trap.
2. **`WebSocket.prototype.send` is replaced by a `Proxy` of the native send.** a
   function proxy still reports `[native code]` from `Function.prototype.toString`,
   so the "is it native" probe is satisfied while the `apply` trap still sees every
   frame.

## the scrub

the loader already owns the client→server stream (it re-encodes every frame to put
its own gap-free sequence numbers on, which is what makes injection work), so when
the client answers a probe round it reconstructs the outgoing `T` so that

- **flags** and **untrustedEvents** are zeroed — a clean, unmodified client always
  reports 0 for both, so these are pure loader/mod footprint;
- **probeResult** is run through `cleanProbeResult`, which clears exactly the bits a
  probe matched *because of* the loader or a mod (a hooked function, a swapped
  constructor, one of our localStorage keys, one of our elements by id or class —
  the mods' own GUIs (`mml-*`), the in-game Mods tab and notice cards (`mmj-*`), and
  any unprefixed element nested inside one of those panels — or the loader's own
  `CustomEvent` handshake) and leaves every **canary** bit — a thing a real client
  genuinely has — in place. that's the subtle part: the server mixes in canary probes
  that a real client *must* match, so blanket-zeroing the result would itself be a
  tell. what remains is exactly what the original client would send;
- **seal**, **salt**, **seq** and **ledger** are carried through as the real values,
  the loader deriving the seal itself and reading the live seq + ledger off its own
  stream.

a companion `auditProbeResult` raises an alarm if a probe round ever carries an
**unknown kind** the sanitiser has no rule for, a strip that **silently failed**
(a footprint bit still set in what goes out), or a telemetry global that has gone
blind to the page — so a brand-new anti-cheat trick shouts instead of leaking
quietly. this lives in `loader/src/net/binding.js` (`telemetry.scrub` /
`cleanProbeResult` / `auditProbeResult`) and `loader/src/core/antidetect.js`, the
changeable half, so it moves with the protocol.

## the shame window

not a hook check, but it bites auto heal. the server counts an eat as shame when it
lands within 120ms of your last hit, and 8 of those put the shame hat on you: no
eating for 30 seconds. on a real server your ping alone usually pushes an eat past
that window. on your own server (localhost, ~1ms) an instant heal lands inside it
every single time.

so the loader exposes `ctx.combat.shameWait()`: how long to wait until an eat is
safe, worked out from when you saw the hit and your quickest recent round trip. it's
`0` on a laggy connection and about 125ms locally. MooMoo Lite's auto heal waits
for it when its "shame-safe" setting is on.

## the takeaway for your own anti-cheat

client-reported telemetry is only ever as trustworthy as the client. the one check
here with teeth is the **seal bound into the key**, because it fails the transport
instead of asking the client a question — but even that only proves the *bundle* is
unmodified, not that nothing is reading or re-sending its frames from outside. if
you're hardening your own server, the lesson is the same: the checks that actually
matter are server-side — movement validation, rate limits, sequence integrity —
all of which the reference server does and the loader respects.
