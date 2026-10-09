/*
 * Generates docs/packets.md from the canonical vocabulary so the packet
 * reference never drifts.  node website/gen-packets.mjs
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const VOCAB = require(path.join(here, "..", "shared", "vocabulary.js"));

function table(title, map, names, verb) {
    let md = "### " + title + "\n\n| Name | Parameters | Description |\n| --- | --- | --- |\n";
    for (const nm of names) {
        const spec = map[nm];
        const params = spec.params.map((p) => "`" + p.name + "`").join(", ") || "—";
        md += "| `" + verb + nm + "` | " + params + " | " + spec.summary.replace(/\|/g, "\\|") + " |\n";
    }
    return md + "\n";
}

const out = `---
title: Packet reference
---

# Packet reference

every packet moomoo.js knows about by name. these names are the stable vocabulary:
they don't change, even when the server reshuffles the wire. mods written against
them keep working across loader updates.

- **events** are things the server tells you. listen with \`on <event>(…)\`
  (moomoo.js) or \`MooMoo.on("<event>", handler)\` (JavaScript).
- **actions** are things you ask the server to do. call \`send.<action>(…)\`
  (moomoo.js) or \`MooMoo.send.<action>(…)\` (JavaScript).

events marked *passthrough* give you the raw decoded \`args\` array instead of named
fields, so you get at every packet but the shape isn't guaranteed to stay put.

## Events (server → you)

${table("All events", VOCAB.events, VOCAB.eventNames, "on ")}
## Actions (you → server)

${table("All actions", VOCAB.actions, VOCAB.actionNames, "send.")}
> Generated from \`shared/vocabulary.js\` by \`website/gen-packets.mjs\`.
`;

fs.writeFileSync(path.join(here, "docs", "packets.md"), out);
console.log("wrote docs/packets.md (" + VOCAB.eventNames.length + " events, " + VOCAB.actionNames.length + " actions)");
