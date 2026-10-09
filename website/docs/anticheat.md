---
title: Anti-tamper & the socket hook
---

# Anti-tamper & the socket hook

:::warning educational, own-server only
this page is about how the loader's socket hook stays invisible to my own server's
anti-tamper. it's here so i (and you, if it's your server) understand the defense
from both sides. don't use it to get an edge on servers you don't run.
:::

## how the server spots a hook

the reference server (`moomoo-clone`) trusts the client to tell on itself. every
pinned client sends a telemetry packet, `T = [flags, untrustedEvents]`, 5s after
joining and then every 60s. `flags` is a bitfield:

| bit | meaning | what the server does |
| --- | --- | --- |
| 1 | userscript manager present | flag |
| 2 | **socket hooked** | **kick** |
| 4 | render hooked | flag |
| 8 | debugger trap tripped | flag |

the client sets bit 2 if **either** of these is true:

```js
window.WebSocket !== pr        // pr = the reference captured at client startup
|| !isNative(WebSocket.prototype.send)   // toString() has to contain "[native code]"
```

and telemetry is required: if it never shows up, or stops, you get kicked. so you
can't just block it.

## why the hook doesn't get caught

the loader beats both checks by how it's built:

1. **it swaps the constructor, not the prototype, and it does it first.**
   `window.WebSocket` becomes a `Proxy` of the native constructor, installed at
   `document-start`, before the client runs and captures `pr`. so the client ends up
   capturing the proxy as `pr`, and later `window.WebSocket === pr` is still true.
2. **it never touches `WebSocket.prototype`.** every property you read off the proxy
   forwards straight to the native target, so `WebSocket.prototype.send` is still the
   real native function and `isNative(...)` passes. the interception happens
   per-socket in the `construct` trap instead.

so both checks stay false and bit 2 never gets set.

## the extra scrub, just in case

the loader already owns the client→server stream (it re-encodes every frame to put
its own sequence numbers on, which is what makes injection work), so it also runs
the outgoing `T` packet through a scrub that clears the tamper bits and zeroes the
untrusted-event count. even if some future check did set a bit, the server would
still get clean telemetry. the heartbeat keeps flowing too, so the "telemetry
missing" kick never fires.

the scrub lives in `loader/src/binding.js` (`telemetry.scrub`), which is part of the
changeable half, so it moves along with the protocol.

## the takeaway for your own anti-cheat

client-reported telemetry is only ever as trustworthy as the client. a hook that
goes in before your detection code, and leaves the prototype native, beats both the
reference check and the `toString` check. if you're trying to harden your own
server, the lesson is the client can't be trusted to report on itself. the checks
that actually matter are server-side: movement validation, rate limits, sequence
integrity, all of which the reference server does and the loader respects.
