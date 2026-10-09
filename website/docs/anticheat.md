---
title: Anti-tamper & the socket hook
---

# Anti-tamper & the socket hook

:::warning Educational, own-server only
This page documents how the loader's socket hook stays invisible to the
reference server's anti-tamper. It's here so you understand your **own** private
server's defenses from both sides. Don't use it to gain an advantage on servers
you don't run.
:::

## How the server detects a hook

The reference server (`moomoo-clone`) trusts the client to self-report tampering.
Every pinned client sends a telemetry packet, `T = [flags, untrustedEvents]`, 5s
after joining and then every 60s. `flags` is a bitfield:

| Bit | Meaning | Server action |
| --- | --- | --- |
| 1 | userscript manager present | flag |
| 2 | **socket hooked** | **kick** |
| 4 | render hooked | flag |
| 8 | debugger trap tripped | flag |

The client sets bit 2 when **either** of these is true:

```js
window.WebSocket !== pr        // pr = the reference captured at client startup
|| !isNative(WebSocket.prototype.send)   // toString() must contain "[native code]"
```

Telemetry is also **required**: if it never arrives, or stops, the server kicks
you. So you can't just suppress it.

## Why the loader's hook is invisible

The loader satisfies **both** conditions by construction:

1. **It replaces the *constructor*, not the prototype, and does it first.**
   `window.WebSocket` becomes a `Proxy` of the native constructor, installed at
   `document-start` — *before* the client runs and captures `pr`. So the client
   captures the proxy as `pr`, and later `window.WebSocket === pr` is true.
2. **It never touches `WebSocket.prototype`.** Every property read on the proxy
   forwards to the native target, so `WebSocket.prototype.send` is the real
   native function and `isNative(...)` passes. Interception happens per-socket in
   the proxy's `construct` trap.

Both reference checks therefore stay false — bit 2 is never set.

## The belt-and-suspenders scrub

Because the loader already **owns** the client→server stream (it re-encodes every
frame to assign its own sequence numbers, which is what makes packet injection
possible), it also passes the outgoing `T` packet through a scrub that clears the
tamper bits and zeroes the untrusted-event count. Even if some future detection
path set a bit, the server would still receive clean telemetry. The heartbeat
keeps flowing, so the "telemetry missing" kick never fires either.

This scrub lives in `loader/src/binding.js` (`telemetry.scrub`) — it's part of the
volatile half, so it moves with the protocol.

## The lesson for your own anti-cheat

Client-reported telemetry is only as trustworthy as the client. A hook that
installs before your detection code — and leaves the prototype native — defeats
reference and `toString` checks. If you're hardening your own server, the takeaway
is that **the client cannot be trusted to report on itself**: meaningful checks
have to be server-side (movement validation, rate limits, sequence integrity —
all of which the reference server also does, and which the loader respects).
