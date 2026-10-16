/*
 * Assembles the loader's src/ modules into ONE Tampermonkey userscript:
 *   dist/moomoo-loader.user.js
 *
 * The modules are plain UMD files; concatenated inside a function that we inject
 * into the PAGE's JS context, they attach themselves to the page window
 * (window.MooMooMsgpack, ...). We then boot the loader there, so it can see the
 * page's real WebSocket, its import map, and expose window.MooMoo to mods.
 *
 * Run:  node extension/loader/build.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { obfuscate } from "../build-common.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcDir = path.join(here, "src");
const sharedDir = path.join(here, "..", "shared");
const distDir = path.join(here, "dist");

// Order matters: a module must appear after the ones it reads off the window.
const MODULES = [
    { label: "vocabulary", file: path.join(sharedDir, "vocabulary.js") },
    { label: "gamedata", file: path.join(sharedDir, "gamedata.js") },
    { label: "net/msgpack", file: path.join(srcDir, "net", "msgpack.js") },
    { label: "net/sha256", file: path.join(srcDir, "net", "sha256.js") },
    { label: "net/protocol", file: path.join(srcDir, "net", "protocol.js") },
    { label: "net/binding", file: path.join(srcDir, "net", "binding.js") },
    { label: "net/socket", file: path.join(srcDir, "net", "socket.js") },
    { label: "net/outgoing", file: path.join(srcDir, "net", "outgoing.js") },
    { label: "core/runtime", file: path.join(srcDir, "core", "runtime.js") },
    { label: "game/input", file: path.join(srcDir, "game", "input.js") },
    { label: "game/objects", file: path.join(srcDir, "game", "objects.js") },
    { label: "game/store", file: path.join(srcDir, "game", "store.js") },
    { label: "game/combat", file: path.join(srcDir, "game", "combat.js") },
    { label: "game/render", file: path.join(srcDir, "game", "render.js") },
    { label: "game/pathfind", file: path.join(srcDir, "game", "pathfind.js") },
    { label: "core/api", file: path.join(srcDir, "core", "api.js") },
    { label: "core/modstab", file: path.join(srcDir, "core", "modstab.js") },
    { label: "core/notice", file: path.join(srcDir, "core", "notice.js") },
    { label: "loader", file: path.join(srcDir, "loader.js") }
];

// one version for the userscript header and the runtime (loader.js VERSION)
const VERSION = /const VERSION = "([^"]+)"/.exec(fs.readFileSync(path.join(srcDir, "loader.js"), "utf8"))[1];

const HEADER = `// ==UserScript==
// @name         moomoo.js Loader
// @namespace    moomoo.js
// @version      ${VERSION}
// @description  moomoo.js mod loader — hooks the game socket and exposes window.MooMoo for mods. Update this file when the server's packets change.
// @author       al007ex
// @match        *://*/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
//
// EDIT @match to your private server's origin, e.g.  // @match https://play.myserver.io/*
// Host this file somewhere your plugins can @require it (or paste it as its own
// userscript). See the README.
`;

const bodies = MODULES.map((m) => {
    const code = fs.readFileSync(m.file, "utf8");
    return `/* ===== module: ${m.label} (${path.relative(path.join(here, ".."), m.file)}) ===== */\n${code}`;
}).join("\n\n");

// `core` runs IN THE PAGE. It defines every module on the page window, then boots.
const core = `function core(){
  "use strict";
  if (window.__MOOMOO_LOADER__) return;   // a plugin may @require us more than once
  window.__MOOMOO_LOADER__ = ${JSON.stringify(VERSION)};
${bodies}
  try {
    MooMooLoaderCore.createLoader(window);
    console.log("%c[moomoo.js]", "color:#7cc;font-weight:bold", "loader ${VERSION} installed — window.MooMoo is ready for mods");
  } catch (e) {
    console.error("%c[moomoo.js]", "color:#e66", "loader failed to install:", e);
  }
}`;

const iife = `(function bootstrap(){
  ${core}
  // Run core in the PAGE context. Under a userscript sandbox we inject a <script>;
  // if we are already in the page (e.g. @grant none page-context, or a bookmarklet)
  // we just call it.
  var inPage;
  try { inPage = (typeof unsafeWindow === "undefined") || (window === unsafeWindow); }
  catch (e) { inPage = true; }
  if (inPage) {
    core();
  } else {
    try {
      var s = document.createElement("script");
      s.textContent = "(" + core.toString() + ")();";
      (document.head || document.documentElement).appendChild(s);
      s.remove();
    } catch (e) {
      // Last resort: run in whatever context we are in.
      core();
    }
  }
})();
`;

// Mangle + compress the body (the UserScript header must stay verbatim for Tampermonkey).
const body = await obfuscate(iife, { label: "loader", toplevel: true });
const bootstrap = `${HEADER}\n${body}\n`;

fs.mkdirSync(distDir, { recursive: true });
const outFile = path.join(distDir, "moomoo-loader.user.js");
fs.writeFileSync(outFile, bootstrap);
console.log("wrote " + path.relative(path.join(here, "..", ".."), outFile) + "  (" + bootstrap.length + " bytes" + (body !== iife ? ", mangled" : ", READABLE (not mangled)") + ")");
