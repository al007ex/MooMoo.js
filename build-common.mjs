/*
 * Shared build helper: OBFUSCATION.
 * =================================
 * The delivered loader and mod userscripts are mangled + compressed so they are
 * small and not easily readable. We minify with esbuild (preferred — it parses
 * modern syntax like ?. and ??), falling back to terser if that's all that's
 * around, and to readable output if neither is installed, so the repo still
 * builds without its dev tooling.
 *
 * Only LOCAL identifiers and whitespace are crushed; property and global names
 * are left alone, so everything the loader hangs on window (MooMooProtocol,
 * MooMoo, __MOOMOO_LOADER__, ...) and the whole mod/API surface keep working.
 */
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

async function loadEsbuild() {
    try { return await import("esbuild"); } catch (_) { return null; }
}

function loadTerser() {
    const bases = [process.env.MOOMOO_SERVER_DIR, path.resolve(here, "..", "moomoo-clone-main"), here].filter(Boolean);
    for (const base of bases) {
        for (const pkg of [path.join(base, "package.json"), path.join(base, "server", "package.json")]) {
            try { return createRequire(pkg)("terser"); } catch (_) { /* next */ }
        }
    }
    try { return createRequire(import.meta.url)("terser"); } catch (_) { return null; }
}

const esbuild = await loadEsbuild();
const terser = esbuild ? null : loadTerser();
export const obfuscator = esbuild ? "esbuild" : terser ? "terser" : null;
export const hasObfuscator = Boolean(obfuscator);

// Mangle + compress `code`. `toplevel` (terser only) crushes top-level names too.
// `define` = build-time macros: { NAME: "literal" } swaps every NAME for that literal before
// minifying, so `if (NAME)` blocks set to false are dropped from the output entirely.
export async function obfuscate(code, { toplevel = true, label = "", define = {} } = {}) {
    try {
        if (esbuild) {
            const res = await esbuild.transform(code, { minify: true, target: "es2020", legalComments: "none", define, drop: ["debugger"] });
            if (!res.code) throw new Error("esbuild produced no output");
            return res.code;
        }
        if (terser) {
            const res = await terser.minify(code, {
                compress: { passes: 3, drop_debugger: true, global_defs: Object.fromEntries(Object.entries(define).map(([k, v]) => [k, JSON.parse(v)])) },
                mangle: { toplevel, reserved: ["unsafeWindow"] },
                output: { comments: false, beautify: false }
            });
            if (res.error) throw res.error;
            if (!res.code) throw new Error("terser produced no output");
            return res.code;
        }
        console.warn("  ! no minifier found (run `npm install` in the framework repo) — " + (label || "output") + " left readable");
        return applyMacros(code, define);
    } catch (e) {
        console.warn("  ! obfuscation of " + (label || "output") + " failed (" + (e && e.message) + ") — left readable");
        return applyMacros(code, define);
    }
}

// Textual macro swap for builds that are NOT minified (the readable test copy, or a
// checkout without esbuild): whole-word NAME -> literal.
export function applyMacros(code, define = {}) {
    let out = code;
    for (const [name, literal] of Object.entries(define)) out = out.replace(new RegExp("\\b" + name + "\\b", "g"), literal);
    return out;
}
