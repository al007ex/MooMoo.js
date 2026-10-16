/*
 * Builds the MooMooPlus (MMP) mod.
 *   1. concatenates mods/moomooplus/*.js (in file-name order) into
 *      mods/moomooplus.js — the readable mod the tests load directly;
 *   2. wraps that into mods/moomooplus.user.js, an installable Tampermonkey
 *      userscript that @requires the loader and is mangled so it is not easily read.
 * Run:  node mods/build-moomooplus.mjs [loaderUrl]
 * The loader URL defaults to the pastebin raw link; pass your own to override.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { obfuscate, applyMacros } from "../build-common.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const LOADER_MIN = "1.3.0";   // the loader this mod needs (bump with loader/src/loader.js VERSION)
const loaderUrl = process.argv[2] || "https://pastebin.com/raw/jWDq3mmF";

// Build-time macros. The readable test build keeps the debug view; the delivered
// userscript compiles it out.
const MACROS_TEST = { __MMP_DEBUG__: "true" };
const MACROS_SHIP = { __MMP_DEBUG__: "false" };

const partsDir = path.join(here, "moomooplus");
const parts = fs.readdirSync(partsDir).filter((f) => f.endsWith(".js")).sort();
const plugin = parts.map((f) => {
    const code = fs.readFileSync(path.join(partsDir, f), "utf8");
    return "/* ===== moomooplus/" + f + " ===== */\n" + code.replace(/\s+$/, "") + "\n";
}).join("\n");

// Readable concatenation (tests load this one).
fs.writeFileSync(path.join(here, "moomooplus.js"), applyMacros(plugin, MACROS_TEST));
console.log("wrote mods/moomooplus.js  (" + parts.length + " parts, " + plugin.split("\n").length + " lines)");

const HEADER = `// ==UserScript==
// @name         MooMooPlus (MMP)
// @namespace    moomoo.js
// @version      ${LOADER_MIN}
// @description  MooMooPlus: combat, movement, visuals and more for your private server. Press M for the menu.
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
`;

// Delivered userscript: wrap the parts in one IIFE (keeps their shared scope) and mangle it.
const wrapped = "(function(){\n" + plugin + "\n})();";
const body = await obfuscate(wrapped, { label: "moomooplus mod", define: MACROS_SHIP });
const outFile = path.join(here, "moomooplus.user.js");
fs.writeFileSync(outFile, HEADER + "\n" + body + "\n");
console.log("wrote mods/moomooplus.user.js  (@require " + loaderUrl + (body !== wrapped ? ", mangled" : ", READABLE (not mangled)") + ")");
