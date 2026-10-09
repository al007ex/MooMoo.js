/*
 * Runs every moomoo.js test file and aggregates the result.
 *   npm test   (or)   node tests/run-all.mjs
 *
 * The codec tests check against the real server when it is found next to this
 * repo (../moomoo-clone-main) or via $MOOMOO_SERVER_DIR; otherwise they SKIP.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

// Always rebuild the bundle first so bundle.vm tests the latest.
console.log("» building loader bundle");
spawnSync(process.execPath, [path.join(root, "loader", "build.mjs")], { stdio: "inherit" });

const files = fs.readdirSync(here).filter((f) => f.endsWith(".test.mjs")).sort();
let failed = 0;
for (const f of files) {
    console.log("\n================= " + f + " =================");
    const r = spawnSync(process.execPath, [path.join(here, f)], { stdio: "inherit" });
    if (r.status !== 0) failed++;
}
console.log("\n=======================================");
console.log(failed === 0 ? "ALL TEST FILES PASSED" : (failed + " TEST FILE(S) FAILED"));
process.exit(failed === 0 ? 0 : 1);
