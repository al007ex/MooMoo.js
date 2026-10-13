/*
 * Builds the examplescript mod.
 *   1. concatenates mods/examplescript/*.js (in file-name order) into
 *      mods/examplescript.js — the mod the live tests load directly;
 *   2. wraps that into mods/examplescript.user.js, an installable Tampermonkey
 *      userscript that @requires the loader.
 * Run:  node mods/build-examplescript.mjs [loaderUrl]
 * The loader URL defaults to the pastebin raw link; pass your own to override.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const LOADER_MIN = "1.1.0";   // the loader this mod needs (bump with loader/src/loader.js VERSION)
const loaderUrl = process.argv[2] || "https://pastebin.com/raw/jWDq3mmF";

const partsDir = path.join(here, "examplescript");
const parts = fs.readdirSync(partsDir).filter((f) => f.endsWith(".js")).sort();
const plugin = parts.map((f) => {
    const code = fs.readFileSync(path.join(partsDir, f), "utf8");
    return "/* ===== examplescript/" + f + " ===== */\n" + code.replace(/\s+$/, "") + "\n";
}).join("\n");
fs.writeFileSync(path.join(here, "examplescript.js"), plugin);
console.log("wrote mods/examplescript.js  (" + parts.length + " parts, " + plugin.split("\n").length + " lines)");

const out = `// ==UserScript==
// @name         moomoo.js — Example Script
// @namespace    moomoo.js
// @version      ${LOADER_MIN}
// @description  The bundle's combat / heal / visuals features for your private server. Config menu on Escape.
// @author       you
// @match        *://*/*
// @run-at       document-start
// @require      ${loaderUrl}?v=${LOADER_MIN}
// @grant        none
// ==/UserScript==
//
// This @requires the loader above (re-upload the freshly built loader there).
// Tampermonkey caches @require files; the ?v= part makes it fetch the new loader.
// EDIT @match to your server's origin if you want to scope it.

${plugin}
`;

const outFile = path.join(here, "examplescript.user.js");
fs.writeFileSync(outFile, out);
console.log("wrote " + path.relative(path.join(here, ".."), outFile) + "  (@require " + loaderUrl + ")");
