/*
 * Builds the Freecam + Zoom mod: wraps mods/freecam.js (the readable source) into
 * mods/freecam.user.js, an installable Tampermonkey userscript that @requires the
 * loader. Readable by default so it can be audited; set MOOMOO_MANGLE=1 to minify.
 * Run:  node mods/build-freecam.mjs [loaderUrl]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { obfuscate } from "../build-common.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const LOADER_MIN = "1.3.1";
const loaderUrl = process.argv[2] || "https://pastebin.com/raw/jWDq3mmF";

const src = fs.readFileSync(path.join(here, "freecam.js"), "utf8");

const HEADER = `// ==UserScript==
// @name         MooMoo Freecam + Zoom
// @namespace    moomoo.js
// @version      ${LOADER_MIN}
// @description  Detach the camera and fly around with WASD while your body stays put; scroll to zoom. Press F.
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

// Readable by default (auditable). MOOMOO_MANGLE=1 minifies it like the delivered loader.
const body = process.env.MOOMOO_MANGLE === "1" ? await obfuscate(src, { label: "freecam mod" }) : src;
const outFile = path.join(here, "freecam.user.js");
fs.writeFileSync(outFile, HEADER + "\n" + body + "\n");
console.log("wrote mods/freecam.user.js  (@require " + loaderUrl + (body !== src ? ", mangled" : ", READABLE (not mangled)") + ")");
