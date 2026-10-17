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
T = [flags, untrustedEvents, probeResult, seal, salt]
```

- **flags** — a bitfield. bit 2 is "socket hooked" and gets you kicked; the rest
  (userscript manager, render hooked, debugger trap) are flags.
- **probeResult** — a bitmask of which probes matched. the probes are salted
  hashes, so the client can't see what's being looked for; they check things like
  "is `WebSocket.prototype.send` still native code" and "was this constructor
  wrapped".
- **seal** — a hash of the **code seal** (see below).
- **salt** — the probe round's salt, echoed back.

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
the client answers a probe round it runs the outgoing `T` through a scrub that

- zeroes **flags**, **untrustedEvents** and **probeResult** (nothing to report), and
- keeps the **seal** and **salt** (the loader derives the correct seal itself).

so the server always gets a clean, valid answer, and the "telemetry missing" kick
never fires. the scrub lives in `loader/src/net/binding.js` (`telemetry.scrub`),
part of the changeable half, so it moves with the protocol.

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
