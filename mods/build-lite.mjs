/*
 * Builds the MooMoo Lite mod: wraps mods/lite.js (the readable source) into
 * mods/lite.user.js, an installable Tampermonkey userscript that @requires the
 * loader and is mangled so it is not easily read.
 * Run:  node mods/build-lite.mjs [loaderUrl]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { obfuscate } from "../build-common.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const LOADER_MIN = "1.3.1";
const loaderUrl = process.argv[2] || "https://pastebin.com/raw/jWDq3mmF";

const src = fs.readFileSync(path.join(here, "lite.js"), "utf8");

const HEADER = `// ==UserScript==
// @name         MooMoo Lite (MML)
// @namespace    moomoo.js
// @version      ${LOADER_MIN}
// @description  Place spammers, legit auto heal and hat hotkeys. Press the menu key (default O).
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

const body = await obfuscate(src, { label: "lite mod" });
const outFile = path.join(here, "lite.user.js");
fs.writeFileSync(outFile, HEADER + "\n" + body + "\n");
console.log("wrote mods/lite.user.js  (@require " + loaderUrl + (body !== src ? ", mangled" : ", READABLE (not mangled)") + ")");
