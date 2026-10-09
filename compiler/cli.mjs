#!/usr/bin/env node
/*
 * moomoo.js compiler CLI
 * ======================
 *   node compiler/cli.mjs <input.moomoo> [options]
 *
 * Options:
 *   -o, --out <file>      output path (default: <input>.user.js)
 *   --loader <url>        URL to @require the loader from (goes in the header)
 *   --plain               emit a bare `(function(MooMoo){...})(window.MooMoo)`
 *                         plugin instead of a Tampermonkey userscript
 *   --print               write to stdout instead of a file
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const Compiler = require(path.join(here, "moomoo-compiler.js"));

const argv = process.argv.slice(2);
if (!argv.length || argv.includes("-h") || argv.includes("--help")) {
    console.log("usage: node compiler/cli.mjs <input.moomoo> [-o out.user.js] [--loader <url>] [--plain] [--print]");
    process.exit(argv.length ? 0 : 1);
}

const opts = { plain: false, print: false, loader: "", out: "" };
let input = "";
for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-o" || a === "--out") opts.out = argv[++i];
    else if (a === "--loader") opts.loader = argv[++i];
    else if (a === "--plain") opts.plain = true;
    else if (a === "--print") opts.print = true;
    else if (!input) input = a;
    else { console.error("unexpected argument: " + a); process.exit(1); }
}

const source = fs.readFileSync(input, "utf8");
const result = Compiler.compile(source);

if (!result.ok) {
    console.error("✗ compile error: " + result.error);
    process.exit(1);
}
for (const w of result.warnings) console.error("  warning: " + w);

const output = opts.plain ? Compiler.toPlainPlugin(result) : Compiler.wrapUserscript(result, { loaderUrl: opts.loader });

if (opts.print) {
    process.stdout.write(output);
} else {
    const outPath = opts.out || (input.replace(/\.moomoo$/, "") + (opts.plain ? ".plugin.js" : ".user.js"));
    fs.writeFileSync(outPath, output);
    console.log("✓ " + result.meta.name + " v" + result.meta.version + "  ->  " + outPath);
    if (!opts.plain && !opts.loader && !(result.meta.require || []).length) {
        console.log("  note: no loader URL set. Edit the @require line, or pass --loader <url>.");
    }
}
