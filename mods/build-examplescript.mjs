/*
 * Wraps mods/examplescript.js into an installable Tampermonkey userscript that
 * @requires the loader. Run:  node mods/build-examplescript.mjs [loaderUrl]
 * The loader URL defaults to the pastebin raw link; pass your own to override.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const loaderUrl = process.argv[2] || "https://pastebin.com/raw/jWDq3mmF";
const plugin = fs.readFileSync(path.join(here, "examplescript.js"), "utf8");

const out = `// ==UserScript==
// @name         moomoo.js — Example Script
// @namespace    moomoo.js
// @version      0.1.0
// @description  Ported combat/heal features for your private server. Config menu on the \` key.
// @author       you
// @match        *://*/*
// @run-at       document-start
// @require      ${loaderUrl}
// @grant        none
// ==/UserScript==
//
// This @requires the loader above (re-upload the freshly built loader there).
// EDIT @match to your server's origin if you want to scope it.

${plugin}
`;

const outFile = path.join(here, "examplescript.user.js");
fs.writeFileSync(outFile, out);
console.log("wrote " + path.relative(path.join(here, ".."), outFile) + "  (@require " + loaderUrl + ")");
