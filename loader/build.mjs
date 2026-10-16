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
// @inject-into  page
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

// `core` runs IN THE PAGE. Every module is a UMD that attaches itself to its
// `root` (normally the global object). We give them a PRIVATE namespace as that
// root instead, by shadowing self / globalThis / this with a local object, so the
// page's window is never littered with MooMoo* properties — only the public API
// (window.MooMoo / window.MooMooLoader) is exposed, by createLoader. The one
// unavoidable window flag (the re-require guard, shared across separately injected
// mods) is defined non-enumerable.
const core = `function core(){
  "use strict";
  try { if (window.__MOOMOO_LOADER__) return; } catch (e) {}   // a plugin may @require us more than once
  try { Object.defineProperty(window, "__MOOMOO_LOADER__", { value: ${JSON.stringify(VERSION)}, writable: true, configurable: true, enumerable: false }); }
  catch (e) { window.__MOOMOO_LOADER__ = ${JSON.stringify(VERSION)}; }
  var __ns = {};
  (function(self, globalThis, module, exports, require){
${bodies}
  }).call(__ns, __ns, __ns, undefined, undefined, undefined);
  try {
    __ns.MooMooLoaderCore.createLoader(window, { deps: __ns });
    console.log("%c[moomoo.js]", "color:#7cc;font-weight:bold", "loader ${VERSION} installed — window.MooMoo is ready for mods");
  } catch (e) {
    console.error("%c[moomoo.js]", "color:#e66", "loader failed to install:", e);
  }
}`;

const iife = `(function bootstrap(){
  ${core}
  // The loader MUST run in the page's own realm: that's the only place where
  // window.WebSocket is the constructor the game client actually uses (and is
  // writable). With "@inject-into page" + "@grant none" the body already runs
  // there, so we just call core(). In a userscript sandbox we inject the code
  // as a page <script> instead. We never fall back to running core() in the
  // sandbox realm — the WebSocket there isn't the game's, and replacing it
  // throws "read-only property".
  var inPage;
  try { inPage = (typeof unsafeWindow === "undefined") || (window === unsafeWindow); }
  catch (e) { inPage = true; }
  if (inPage) { core(); return; }

  var src = "(" + core.toString() + ")();";
  // 1) inline page <script> — synchronous, wins the document-start race.
  try {
    var s = document.createElement("script");
    s.textContent = src;
    (document.head || document.documentElement).appendChild(s);
    s.remove();
    return;
  } catch (e) { /* CSP blocked inline scripts; try a blob url */ }
  // 2) blob url <script> — clears many inline-script CSPs (loads async, so it
  //    may lose the timing race, but that beats not loading at all).
  try {
    var url = URL.createObjectURL(new Blob([src], { type: "text/javascript" }));
    var b = document.createElement("script");
    b.src = url;
    b.onload = b.onerror = function () { try { b.remove(); URL.revokeObjectURL(url); } catch (e) {} };
    (document.head || document.documentElement).appendChild(b);
    return;
  } catch (e) { /* blob blocked too */ }
  // 3) can't reach the page realm at all.
  try {
    console.error("%c[moomoo.js]", "color:#e66",
      "couldn't inject into the page (CSP). Set the script to run in page context: " +
      "Violentmonkey → @inject-into page, Tampermonkey → @grant none. " +
      "It can't run in the sandbox because the game's WebSocket isn't reachable there.");
  } catch (e) {}
})();
`;

// Mangle + compress the body (the UserScript header must stay verbatim for Tampermonkey).
const body = await obfuscate(iife, { label: "loader", toplevel: true });
const bootstrap = `${HEADER}\n${body}\n`;

fs.mkdirSync(distDir, { recursive: true });
const outFile = path.join(distDir, "moomoo-loader.user.js");
fs.writeFileSync(outFile, bootstrap);
console.log("wrote " + path.relative(path.join(here, "..", ".."), outFile) + "  (" + bootstrap.length + " bytes" + (body !== iife ? ", mangled" : ", READABLE (not mangled)") + ")");
