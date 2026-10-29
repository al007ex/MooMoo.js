/*
 * Builds the MooMod Bots mod: wraps mods/bots.js (the readable source) into
 * mods/bots.user.js, an installable Tampermonkey userscript that @requires the
 * loader and is mangled so it is not easily read.
 * Run:  node mods/build-bots.mjs [loaderUrl]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { obfuscate } from "../build-common.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const LOADER_MIN = "1.3.1";
const loaderUrl = process.argv[2] || "https://pastebin.com/raw/jWDq3mmF";

const src = fs.readFileSync(path.join(here, "bots.js"), "utf8");

const HEADER = `// ==UserScript==
// @name         MooMod Bots
// @namespace    moomoo.js
// @version      ${LOADER_MIN}
// @description  Multi-box bots that follow your mouse, for your own private server. Press B.
// @author       you
// @match        *://*/*
// @run-at       document-start
// @inject-into  page
// @require      ${loaderUrl}?v=${LOADER_MIN}
// @grant        none
// ==/UserScript==
//
// This @requires the loader above (re-upload the freshly built loader there).
// Tampermonkey caches @require files; the ?v= part makes it fetch the new loader.
// EDIT @match to your private server's origin to scope it.
`;

const body = await obfuscate(src, { label: "bots mod" });
const outFile = path.join(here, "bots.user.js");
fs.writeFileSync(outFile, HEADER + "\n" + body + "\n");
console.log("wrote mods/bots.user.js  (@require " + loaderUrl + (body !== src ? ", mangled" : ", READABLE (not mangled)") + ")");
