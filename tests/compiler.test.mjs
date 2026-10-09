/*
 * Compiles moomoo.js source and runs the generated plugin against the real
 * runtime, proving lexer + parser + codegen + vocabulary param-mapping all work.
 *
 * Run:  node extension/tests/compiler.test.mjs
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import assert from "node:assert";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const Compiler = require(path.join(here, "..", "compiler", "moomoo-compiler.js"));
const Runtime = require(path.join(here, "..", "loader", "src", "runtime.js"));
require(path.join(here, "..", "shared", "vocabulary.js")); // sets globalThis.MooMooVocabulary (used by runtime)

let pass = 0, fail = 0;
const realLog = console.log;
let currentBuf = null;
// Capture mod output (ctx.log -> console.log("%c[moomoo.js] <name>", style, ...));
// let everything else (headers, results) print normally.
console.log = (...a) => {
    if (typeof a[0] === "string" && a[0].indexOf("[moomoo.js]") >= 0) { if (currentBuf) currentBuf.push(a.slice(2).join(" ")); }
    else realLog(...a);
};
const ok = (name, fn) => { try { fn(); pass++; realLog("  ✓ " + name); } catch (e) { fail++; realLog("  ✗ " + name + "\n      " + (e && (e.stack || e.message))); } };

function runPlugin(result, sink) {
    const MooMoo = Runtime.createRuntime({ sink: sink || { sendAction() {}, sendRaw() {} } });
    MooMoo._setReady(true);
    currentBuf = [];
    // Evaluate the compiled mod function and run it with our runtime. It calls
    // MooMoo.register(...), which (enabled by default) wires up the handlers.
    const fnSrc = Compiler.toFunctionSource(result);
    (0, eval)(fnSrc)(MooMoo);
    return { MooMoo, logs: currentBuf };
}

console.log("\n== compile the sample health logger ==");
const sampleSrc = fs.readFileSync(path.join(here, "..", "examples", "health-logger.moomoo"), "utf8");
const sample = Compiler.compile(sampleSrc);

ok("sample compiles without error", () => {
    assert.ok(sample.ok, "compile failed: " + sample.error);
    assert.strictEqual(sample.meta.name, "Health Logger");
    assert.strictEqual(sample.meta.description, "Logs your current health to the console whenever it changes.");
});

ok("sample behaves correctly against the runtime", () => {
    const { MooMoo, logs } = runPlugin(sample);
    MooMoo._dispatch("setup", { sid: 5 });
    MooMoo._dispatch("health", { sid: 5, value: 88 });   // us -> should log
    MooMoo._dispatch("health", { sid: 9, value: 50 });   // someone else -> ignored (onlyMine)
    MooMoo._dispatch("health", { sid: 5, value: 71 });   // us -> should log
    assert.deepStrictEqual(logs, [
        "joined the game — your sid is 5",
        "My health is now 88",
        "My health is now 71"
    ]);
});

console.log("\n== runtime mod management (toggle + settings) ==");
ok("a mod can be disabled and re-enabled at runtime", () => {
    const { MooMoo, logs } = runPlugin(sample);
    MooMoo._dispatch("setup", { sid: 5 });
    logs.length = 0;
    MooMoo.setModEnabled("health-logger", false);
    MooMoo._dispatch("health", { sid: 5, value: 10 });   // disabled -> nothing
    assert.deepStrictEqual(logs, []);
    assert.strictEqual(MooMoo.isModEnabled("health-logger"), false);
    MooMoo.setModEnabled("health-logger", true);
    MooMoo._dispatch("health", { sid: 5, value: 20 });   // enabled -> logs
    assert.deepStrictEqual(logs, ["My health is now 20"]);
});

ok("changing a setting re-applies the mod", () => {
    const { MooMoo, logs } = runPlugin(sample);
    MooMoo._dispatch("setup", { sid: 5 });
    logs.length = 0;
    MooMoo.setSetting("health-logger", "onlyMine", false); // now log everyone
    MooMoo._dispatch("health", { sid: 9, value: 33 });
    assert.deepStrictEqual(logs, ["player 9 health is now 33"]);
    const info = MooMoo.getMods().find((m) => m.id === "health-logger");
    assert.strictEqual(info.enabled, true);
    assert.strictEqual(info.hasSettings, true);
    assert.strictEqual(info.settings[0].key, "onlyMine");
    assert.strictEqual(info.settings[0].value, false);
});

console.log("\n== language features ==");
ok("fn, let, if/else, repeat, every, send, math", () => {
    const src = `
    mod "Feature Test" {
      fn double(n) { return n * 2 }
      let total = 0
      on health(sid, value) {
        if (value < 30) { send.chat("low hp!") }
        else { log("ok") }
        total = total + double(value)
        repeat (3) { total = total + 1 }
      }
    }`;
    const r = Compiler.compile(src);
    assert.ok(r.ok, "compile failed: " + r.error);
    const sent = [];
    const { MooMoo } = runPlugin(r, { sendAction: (a, p) => sent.push([a, p]), sendRaw() {} });
    MooMoo._dispatch("health", { sid: 1, value: 20 });
    assert.deepStrictEqual(sent, [["chat", { message: "low hp!" }]], "send.chat should fire for low hp");
});

ok("unknown event is a compile error", () => {
    const r = Compiler.compile('mod "X" { on notARealEvent(a) { log(a) } }');
    assert.ok(!r.ok, "should have failed");
    assert.match(r.error, /unknown event/);
});

ok("too many handler params is a compile error", () => {
    const r = Compiler.compile('mod "X" { on health(a, b, c) { log(a) } }');
    assert.ok(!r.ok, "should have failed");
    assert.match(r.error, /provides 2 value/);
});

ok("syntax error reports a line", () => {
    const r = Compiler.compile('mod "X" {\n on health(a {\n } \n}');
    assert.ok(!r.ok);
    assert.ok(r.line >= 1, "should carry a line number");
});

console.log("\n== userscript wrapping ==");
ok("wrapUserscript produces a valid-looking header with the loader @require", () => {
    const out = Compiler.wrapUserscript(sample, { loaderUrl: "https://example.com/moomoo-loader.user.js" });
    assert.match(out, /==UserScript==/);
    assert.match(out, /@name\s+Health Logger/);
    assert.match(out, /@require\s+https:\/\/example\.com\/moomoo-loader\.user\.js/);
    assert.match(out, /@run-at\s+document-start/);
    assert.match(out, /window\.MooMoo/);
});

console.log("\n----------------------------------------");
console.log((fail === 0 ? "ALL PASS" : "FAILURES") + ":  " + pass + " passed, " + fail + " failed");
process.exit(fail === 0 ? 0 : 1);
