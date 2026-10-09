/*
 * Copies the canonical runtime/compiler/vocabulary into the playground's lib
 * folder so the website bundles a current snapshot. Run after changing any of
 * them:   node website/sync-lib.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const dest = path.join(here, "static", "playground", "lib");
fs.mkdirSync(dest, { recursive: true });

const files = [
    ["shared/vocabulary.js", "vocabulary.js"],
    ["compiler/moomoo-compiler.js", "moomoo-compiler.js"],
    ["loader/src/runtime.js", "runtime.js"],
    ["loader/src/menu.js", "menu.js"]
];
for (const [from, to] of files) {
    fs.copyFileSync(path.join(root, from), path.join(dest, to));
    console.log("synced " + to);
}
