/*
 * Builds MooMod (Nuro's MooMod, ported onto moomoo.js — its own standalone script).
 *   1. concatenates mods/moomod/*.js (in file-name order), bundles jQuery + jquery-confirm
 *      in front of it, and writes mods/moomod.js — the readable mod the tests load;
 *   2. mangles that into mods/moomod.user.js, an installable Tampermonkey userscript that
 *      @requires the loader.
 * Run:  node mods/build-moomod.mjs [loaderUrl]
 *
 * Why the libraries are bundled: the original @required jQuery + jquery-confirm. Every
 * moomoo.js script has to run at document-start (so the loader hooks the socket before the
 * game makes it), and jQuery can't start before the page has an <html> element. So they ride
 * along as plain functions and MooMod starts them on DOM ready — privately, nothing is added
 * to the page's window (like the original, which ran in Tampermonkey's sandbox).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { obfuscate } from "../build-common.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const LOADER_MIN = "1.3.0";
const loaderUrl = process.argv[2] || "https://pastebin.com/raw/jWDq3mmF";

const jqueryFile = require.resolve("jquery/dist/jquery.min.js");
const confirmFile = path.join(path.dirname(require.resolve("jquery-confirm/package.json")), "dist", "jquery-confirm.min.js");
const jqueryVersion = JSON.parse(fs.readFileSync(path.join(path.dirname(jqueryFile), "..", "package.json"), "utf8")).version;
const confirmVersion = JSON.parse(fs.readFileSync(path.join(path.dirname(confirmFile), "..", "package.json"), "utf8")).version;

const VENDOR = `
// ---- bundled libraries: jQuery ${jqueryVersion} (c) OpenJS Foundation, MIT · jquery-confirm ${confirmVersion} (c) Boniface Pereira, MIT
// (see build-moomod.mjs for why). MOOMOD_JQUERY(window) starts them once and returns that jQuery.
var MOOMOD_JQUERY = (function () {
    function jquery(window, module) {
${fs.readFileSync(jqueryFile, "utf8")}
    }
    function jqueryConfirm(jQuery, window) {
${fs.readFileSync(confirmFile, "utf8")}
    }
    var instance = null;
    return function (win) {
        if (instance) return instance;
        var holder = { exports: {} };
        jquery.call(win, win, holder);          // CommonJS path: no window.jQuery / window.$
        jqueryConfirm.call(win, holder.exports, win);
        return (instance = holder.exports);
    };
})();
`;

const partsDir = path.join(here, "moomod");
const parts = fs.readdirSync(partsDir).filter((f) => f.endsWith(".js")).sort();
const mod = parts.map((f) => {
    const code = fs.readFileSync(path.join(partsDir, f), "utf8");
    return "/* ===== moomod/" + f + " ===== */\n" + code.replace(/\s+$/, "") + "\n";
}).join("\n");
// one outer (non-strict: the libraries expect it) scope holds the libraries and the mod
const src = "(function () {\n" + VENDOR + "\n" + mod + "\n})();\n";

fs.writeFileSync(path.join(here, "moomod.js"), src);
console.log("wrote mods/moomod.js  (" + parts.length + " parts + jQuery " + jqueryVersion + " / jquery-confirm " + confirmVersion + ", " + src.split("\n").length + " lines)");

const HEADER = `// ==UserScript==
// @name         MooMod
// @namespace    moomoo.js
// @version      ${LOADER_MIN}
// @description  Nuro's MooMod on moomoo.js. - = MooMod menu, ESC = hat menu, F2 = auto placement.
// @author       Nuro (ported to moomoo.js)
// @match        *://*/*
// @run-at       document-start
// @inject-into  page
// @require      ${loaderUrl}?v=${LOADER_MIN}
// @grant        none
// ==/UserScript==
//
// This @requires the loader above (re-upload the freshly built loader there).
// Tampermonkey caches @require files; the ?v= part makes it fetch the new loader.
// EDIT @match to your server's origin if you want to scope it.
//
// Includes jQuery v${jqueryVersion} (c) OpenJS Foundation and other contributors, MIT license (jquery.org/license)
// and jquery-confirm v${confirmVersion} (c) 2013-2017 Boniface Pereira, MIT license.
`;

const body = await obfuscate(src, { label: "moomod" });
fs.writeFileSync(path.join(here, "moomod.user.js"), HEADER + "\n" + body + "\n");
console.log("wrote mods/moomod.user.js  (@require " + loaderUrl + (body !== src ? ", mangled" : ", READABLE (not mangled)") + ")");
