/*
 * moomoo.js — COMPILER
 * ====================
 * Compiles the moomoo.js language into a JavaScript plugin that targets the
 * stable window.MooMoo API, and can wrap that plugin as a ready-to-paste
 * Tampermonkey userscript which @requires the loader.
 *
 * Pipeline:   source --lex--> tokens --parse--> AST --gen--> JS body
 *
 * The language is small on purpose. A program is one `mod` block containing
 * metadata directives, event handlers (`on`), timers (`every`), functions
 * (`fn`) and ordinary statements. See docs for the full grammar.
 *
 * Universal module (Node + browser). Uses the shared vocabulary to validate
 * event/action names and to map handler parameters onto packet payload fields.
 */
(function (root, factory) {
    const vocab = (typeof require === "function" && typeof module === "object")
        ? require("../shared/vocabulary.js")
        : root.MooMooVocabulary;
    const value = factory(vocab);
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooCompiler = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooCompiler = value;
})(typeof self !== "undefined" ? self : this, function (VOCAB) {
    "use strict";

    const VERSION = "1.0.0";

    function CompileError(message, line, col) {
        const e = new Error(message + (line ? " (line " + line + ":" + col + ")" : ""));
        e.name = "CompileError";
        e.line = line; e.col = col; e.shortMessage = message;
        return e;
    }

    // ---------------------------------------------------------------- LEXER
    const KEYWORDS = new Set(["mod", "on", "every", "if", "else", "while", "repeat", "let", "fn", "return", "true", "false", "null"]);
    const PUNCT3 = [];
    const PUNCT2 = ["==", "!=", "<=", ">=", "&&", "||"];
    const PUNCT1 = "+-*/%<>=!(){}[],.:;";

    function lex(src) {
        const tokens = [];
        let i = 0, line = 1, col = 1;
        const peek = (o) => src[i + (o || 0)];
        const adv = (n) => { n = n || 1; while (n-- > 0) { if (src[i] === "\n") { line++; col = 1; } else col++; i++; } };
        const push = (type, value, l, c) => tokens.push({ type, value, line: l, col: c });

        while (i < src.length) {
            const c = src[i], l = line, cc = col;
            // whitespace
            if (c === " " || c === "\t" || c === "\r" || c === "\n") { adv(); continue; }
            // comments
            if (c === "/" && peek(1) === "/") { while (i < src.length && src[i] !== "\n") adv(); continue; }
            if (c === "/" && peek(1) === "*") { adv(2); while (i < src.length && !(src[i] === "*" && peek(1) === "/")) adv(); adv(2); continue; }
            // @directive
            if (c === "@") {
                adv(); let name = "";
                while (i < src.length && /[A-Za-z]/.test(src[i])) { name += src[i]; adv(); }
                if (!name) throw CompileError("expected a directive name after '@'", l, cc);
                push("AT", name, l, cc); continue;
            }
            // string
            if (c === '"' || c === "'") {
                const quote = c; adv(); let str = "";
                while (i < src.length && src[i] !== quote) {
                    if (src[i] === "\\") {
                        adv();
                        const e = src[i];
                        str += e === "n" ? "\n" : e === "t" ? "\t" : e === "r" ? "\r" : e;
                        adv();
                    } else { str += src[i]; adv(); }
                }
                if (src[i] !== quote) throw CompileError("unterminated string", l, cc);
                adv();
                push("STRING", str, l, cc); continue;
            }
            // number
            if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(peek(1)))) {
                let num = "";
                while (i < src.length && /[0-9.]/.test(src[i])) { num += src[i]; adv(); }
                if ((num.match(/\./g) || []).length > 1) throw CompileError("malformed number '" + num + "'", l, cc);
                push("NUMBER", parseFloat(num), l, cc); continue;
            }
            // identifier / keyword
            if (/[A-Za-z_$]/.test(c)) {
                let id = "";
                while (i < src.length && /[A-Za-z0-9_$]/.test(src[i])) { id += src[i]; adv(); }
                push(KEYWORDS.has(id) ? "KEYWORD" : "IDENT", id, l, cc); continue;
            }
            // punctuators
            const two = src.substr(i, 2);
            if (PUNCT2.indexOf(two) >= 0) { adv(2); push("PUNCT", two, l, cc); continue; }
            if (PUNCT1.indexOf(c) >= 0) { adv(); push("PUNCT", c, l, cc); continue; }
            throw CompileError("unexpected character '" + c + "'", l, cc);
        }
        push("EOF", null, line, col);
        return tokens;
    }

    // --------------------------------------------------------------- PARSER
    function parse(tokens) {
        let pos = 0;
        const peek = (o) => tokens[pos + (o || 0)];
        const next = () => tokens[pos++];
        const isP = (v) => peek().type === "PUNCT" && peek().value === v;
        const isK = (v) => peek().type === "KEYWORD" && peek().value === v;
        const expectP = (v) => { if (!isP(v)) err("expected '" + v + "'"); return next(); };
        const err = (m) => { const t = peek(); throw CompileError(m + " but found " + describe(t), t.line, t.col); };
        const describe = (t) => t.type === "EOF" ? "end of input" : (t.type === "STRING" ? "string" : "'" + t.value + "'");

        function parseProgram() {
            // skip leading nothing; expect a single mod
            if (!isK("mod")) err("a program must start with `mod \"Name\" { ... }`");
            const mod = parseMod();
            if (peek().type !== "EOF") err("unexpected content after the mod block");
            return { type: "Program", mod };
        }

        function parseMod() {
            const kw = next(); // mod
            let name = "mod";
            if (peek().type === "STRING") name = next().value;
            expectP("{");
            const meta = {}; const body = [];
            while (!isP("}") && peek().type !== "EOF") {
                if (peek().type === "AT") {
                    const d = next();
                    const val = peek().type === "STRING" ? next().value : (peek().type === "NUMBER" ? String(next().value) : err("@" + d.value + " needs a string value"));
                    (meta[d.value] = meta[d.value] || []).push(val);
                    continue;
                }
                body.push(parseStatement(true));
            }
            expectP("}");
            return { type: "Mod", name, meta, body, line: kw.line };
        }

        function parseBlock() {
            expectP("{");
            const stmts = [];
            while (!isP("}") && peek().type !== "EOF") stmts.push(parseStatement(false));
            expectP("}");
            return stmts;
        }

        function parseParamList() {
            expectP("(");
            const params = [];
            while (!isP(")")) {
                if (peek().type !== "IDENT") err("expected a parameter name");
                params.push(next().value);
                if (isP(",")) next(); else break;
            }
            expectP(")");
            return params;
        }

        function parseStatement(topLevel) {
            const t = peek();
            // Contextual `setting <name> = <literal> ["Label"]` declaration (mod top level).
            if (topLevel && t.type === "IDENT" && t.value === "setting" && peek(1).type === "IDENT") {
                next(); // setting
                const key = next().value;
                expectP("=");
                const value = parseExpr();
                let label = null;
                if (peek().type === "STRING") label = next().value;
                optSemi();
                return { type: "Setting", key, value, label, line: t.line };
            }
            if (t.type === "KEYWORD") {
                switch (t.value) {
                    case "on": {
                        if (!topLevel) err("`on` handlers are only allowed at the top level of a mod");
                        next();
                        if (peek().type !== "IDENT" && peek().type !== "KEYWORD") err("expected an event name after `on`");
                        const event = next().value;
                        const params = isP("(") ? parseParamList() : [];
                        const body = parseBlock();
                        return { type: "On", event, params, body, line: t.line, col: t.col };
                    }
                    case "every": {
                        next(); expectP("(");
                        const ms = parseExpr(); expectP(")");
                        const body = parseBlock();
                        return { type: "Every", ms, body, line: t.line };
                    }
                    case "fn": {
                        next();
                        if (peek().type !== "IDENT") err("expected a function name after `fn`");
                        const name = next().value;
                        const params = parseParamList();
                        const body = parseBlock();
                        return { type: "Fn", name, params, body, line: t.line };
                    }
                    case "let": {
                        next();
                        if (peek().type !== "IDENT") err("expected a variable name after `let`");
                        const name = next().value;
                        expectP("=");
                        const value = parseExpr();
                        optSemi();
                        return { type: "Let", name, value, line: t.line };
                    }
                    case "if": return parseIf();
                    case "while": {
                        next(); expectP("(");
                        const cond = parseExpr(); expectP(")");
                        const body = parseBlock();
                        return { type: "While", cond, body, line: t.line };
                    }
                    case "repeat": {
                        next(); expectP("(");
                        const count = parseExpr(); expectP(")");
                        const body = parseBlock();
                        return { type: "Repeat", count, body, line: t.line };
                    }
                    case "return": {
                        next();
                        const value = (isP(";") || isP("}")) ? null : parseExpr();
                        optSemi();
                        return { type: "Return", value, line: t.line };
                    }
                    default: err("unexpected keyword '" + t.value + "'");
                }
            }
            // expression or assignment statement
            const expr = parseExpr();
            if (isP("=")) {
                next();
                const value = parseExpr();
                optSemi();
                if (!isAssignable(expr)) throw CompileError("left side of '=' is not assignable", t.line, t.col);
                return { type: "Assign", target: expr, value, line: t.line };
            }
            optSemi();
            return { type: "ExprStmt", expr, line: t.line };
        }

        function optSemi() { if (isP(";")) next(); }

        function parseIf() {
            const t = next(); // if
            expectP("(");
            const cond = parseExpr();
            expectP(")");
            const then = parseBlock();
            let otherwise = null;
            if (isK("else")) {
                next();
                otherwise = isK("if") ? [parseIf()] : parseBlock();
            }
            return { type: "If", cond, then, otherwise, line: t.line };
        }

        function isAssignable(n) { return n.type === "Ident" || n.type === "Member" || n.type === "Index"; }

        // Expression precedence (low -> high): || && equality relational add mul unary postfix primary
        function parseExpr() { return parseOr(); }
        function binary(sub, ops) {
            return function () {
                let left = sub();
                while (peek().type === "PUNCT" && ops.indexOf(peek().value) >= 0) {
                    const op = next().value;
                    const right = sub();
                    left = { type: "Binary", op, left, right };
                }
                return left;
            };
        }
        const parseMul = binary(() => parseUnary(), ["*", "/", "%"]);
        const parseAdd = binary(() => parseMul(), ["+", "-"]);
        const parseRel = binary(() => parseAdd(), ["<", "<=", ">", ">="]);
        const parseEq = binary(() => parseRel(), ["==", "!="]);
        const parseAnd = binary(() => parseEq(), ["&&"]);
        const parseOr = binary(() => parseAnd(), ["||"]);

        function parseUnary() {
            if (isP("!") || isP("-")) {
                const op = next().value;
                return { type: "Unary", op, arg: parseUnary() };
            }
            return parsePostfix();
        }

        function parsePostfix() {
            let node = parsePrimary();
            for (;;) {
                if (isP(".")) {
                    next();
                    if (peek().type !== "IDENT" && peek().type !== "KEYWORD") err("expected a property name after '.'");
                    node = { type: "Member", object: node, property: next().value };
                } else if (isP("[")) {
                    next();
                    const index = parseExpr();
                    expectP("]");
                    node = { type: "Index", object: node, index };
                } else if (isP("(")) {
                    next();
                    const args = [];
                    while (!isP(")")) { args.push(parseExpr()); if (isP(",")) next(); else break; }
                    expectP(")");
                    node = { type: "Call", callee: node, args };
                } else break;
            }
            return node;
        }

        function parsePrimary() {
            const t = peek();
            if (t.type === "NUMBER") { next(); return { type: "Num", value: t.value }; }
            if (t.type === "STRING") { next(); return { type: "Str", value: t.value }; }
            if (t.type === "IDENT") { next(); return { type: "Ident", name: t.value }; }
            if (t.type === "KEYWORD" && (t.value === "true" || t.value === "false")) { next(); return { type: "Bool", value: t.value === "true" }; }
            if (t.type === "KEYWORD" && t.value === "null") { next(); return { type: "Null" }; }
            if (isP("(")) { next(); const e = parseExpr(); expectP(")"); return e; }
            if (isP("[")) {
                next(); const elements = [];
                while (!isP("]")) { elements.push(parseExpr()); if (isP(",")) next(); else break; }
                expectP("]");
                return { type: "Array", elements };
            }
            if (isP("{")) {
                next(); const props = [];
                while (!isP("}")) {
                    let key;
                    if (peek().type === "STRING" || peek().type === "IDENT") key = next().value;
                    else err("expected a property name");
                    expectP(":");
                    props.push({ key, value: parseExpr() });
                    if (isP(",")) next(); else break;
                }
                expectP("}");
                return { type: "Object", props };
            }
            err("unexpected token");
        }

        return parseProgram();
    }

    // -------------------------------------------------------------- CODEGEN
    // Identifiers the generated code is allowed to reference for free (bound in
    // the preamble). Everything else must be a user let/fn/param.
    const BUILTINS = new Set([
        "self", "players", "send", "log", "player", "now",
        "abs", "floor", "ceil", "round", "min", "max", "sqrt", "random", "pow", "sign",
        "sin", "cos", "tan", "atan2", "hypot", "pi",
        "Math", "JSON", "Date", "String", "Number", "Boolean", "Array", "Object"
    ]);

    const SETTING_LITERAL = { Num: "number", Str: "string", Bool: "boolean" };

    function generate(program, warnings) {
        const mod = program.mod;

        // Pull out `setting` declarations -> the register() settings schema.
        const settings = [];
        const bodyStmts = [];
        for (const s of mod.body) {
            if (s.type === "Setting") {
                const litType = SETTING_LITERAL[s.value.type];
                if (!litType) throw CompileError("setting '" + s.key + "' default must be a number, string or true/false literal", s.line, 0);
                const def = s.value.type === "Str" ? JSON.stringify(s.value.value) : (s.value.type === "Bool" ? String(s.value.value) : String(s.value.value));
                settings.push({ key: s.key, type: litType, default: def, label: s.label });
            } else {
                bodyStmts.push(s);
            }
        }

        function genBlock(stmts, indent) {
            return stmts.map((s) => genStmt(s, indent)).join("\n");
        }

        function genStmt(s, indent) {
            const pad = "  ".repeat(indent);
            switch (s.type) {
                case "On": {
                    if (!VOCAB.isEvent(s.event)) throw CompileError("unknown event '" + s.event + "'. See the packet reference for valid events.", s.line, s.col);
                    const spec = VOCAB.events[s.event];
                    if (s.params.length > spec.params.length) {
                        throw CompileError("event '" + s.event + "' provides " + spec.params.length + " value(s), but you named " + s.params.length, s.line, s.col);
                    }
                    const binds = s.params.map((p, idx) => pad + "  var " + p + " = __e[" + JSON.stringify(spec.params[idx].name) + "];").join("\n");
                    return pad + "ctx.on(" + JSON.stringify(s.event) + ", function(__e){\n" +
                        (binds ? binds + "\n" : "") +
                        genBlock(s.body, indent + 1) + "\n" + pad + "});";
                }
                case "Every":
                    return pad + "ctx.every(" + genExpr(s.ms) + ", function(){\n" + genBlock(s.body, indent + 1) + "\n" + pad + "});";
                case "Fn":
                    return pad + "function " + s.name + "(" + s.params.join(", ") + "){\n" + genBlock(s.body, indent + 1) + "\n" + pad + "}";
                case "Let":
                    return pad + "var " + s.name + " = " + genExpr(s.value) + ";";
                case "Assign":
                    return pad + genExpr(s.target) + " = " + genExpr(s.value) + ";";
                case "ExprStmt":
                    return pad + genExpr(s.expr) + ";";
                case "If": {
                    let code = pad + "if (" + genExpr(s.cond) + ") {\n" + genBlock(s.then, indent + 1) + "\n" + pad + "}";
                    if (s.otherwise) {
                        if (s.otherwise.length === 1 && s.otherwise[0].type === "If") code += " else " + genStmt(s.otherwise[0], indent).trimStart();
                        else code += " else {\n" + genBlock(s.otherwise, indent + 1) + "\n" + pad + "}";
                    }
                    return code;
                }
                case "While":
                    return pad + "while (" + genExpr(s.cond) + ") {\n" + genBlock(s.body, indent + 1) + "\n" + pad + "}";
                case "Repeat": {
                    const v = "__i" + (indent);
                    return pad + "for (var " + v + " = 0, __n = (" + genExpr(s.count) + "); " + v + " < __n; " + v + "++) {\n" + genBlock(s.body, indent + 1) + "\n" + pad + "}";
                }
                case "Return":
                    return pad + "return" + (s.value ? " " + genExpr(s.value) : "") + ";";
                default:
                    throw CompileError("cannot generate statement of type " + s.type, s.line || 0, 0);
            }
        }

        function genExpr(e) {
            switch (e.type) {
                case "Num": return String(e.value);
                case "Str": return JSON.stringify(e.value);
                case "Bool": return e.value ? "true" : "false";
                case "Null": return "null";
                case "Ident": return e.name;
                case "Array": return "[" + e.elements.map(genExpr).join(", ") + "]";
                case "Object": return "{" + e.props.map((p) => JSON.stringify(p.key) + ": " + genExpr(p.value)).join(", ") + "}";
                case "Member": return genExpr(e.object) + "." + e.property;
                case "Index": return genExpr(e.object) + "[" + genExpr(e.index) + "]";
                case "Call": {
                    // Validate send.<action>(...) against the vocabulary (nice early errors).
                    if (e.callee.type === "Member" && e.callee.object.type === "Ident" && e.callee.object.name === "send") {
                        if (e.callee.property !== "raw" && !VOCAB.isAction(e.callee.property)) {
                            warnings.push("send." + e.callee.property + "(...) is not a known action; it will fail at runtime unless the loader defines it.");
                        }
                    }
                    return genExpr(e.callee) + "(" + e.args.map(genExpr).join(", ") + ")";
                }
                case "Unary": return e.op + "(" + genExpr(e.arg) + ")";
                case "Binary": return "(" + genExpr(e.left) + " " + e.op + " " + genExpr(e.right) + ")";
                default: throw CompileError("cannot generate expression of type " + e.type, 0, 0);
            }
        }

        const meta = normalizeMeta(mod);
        const settingsJs = settings.map((s) =>
            "      { key: " + JSON.stringify(s.key) + ", type: " + JSON.stringify(s.type) +
            ", default: " + s.default + (s.label ? ", label: " + JSON.stringify(s.label) : "") + " }"
        ).join(",\n");

        const metaJs = [
            "  MooMoo.register({",
            "    id: " + JSON.stringify(slug(meta.name)) + ",",
            "    name: " + JSON.stringify(meta.name) + ",",
            "    version: " + JSON.stringify(meta.version) + ",",
            "    description: " + JSON.stringify(meta.description) + ",",
            "    settings: [" + (settingsJs ? "\n" + settingsJs + "\n    " : "") + "]",
            "  }, function(ctx){",
            PREAMBLE,
            "",
            genBlock(bodyStmts, 2),
            "  });"
        ].join("\n");

        return { code: metaJs, settings };
    }

    function slug(s) { return String(s || "mod").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "mod"; }

    const PREAMBLE = [
        "    var self = MooMoo.self, players = MooMoo.players, send = MooMoo.send;",
        "    var setting = ctx.settings;",
        "    var log = function(){ return ctx.log.apply(ctx, arguments); };",
        "    var player = function(sid){ return MooMoo.player(sid); };",
        "    var now = function(){ return Date.now(); };",
        "    var abs=Math.abs, floor=Math.floor, ceil=Math.ceil, round=Math.round, min=Math.min, max=Math.max,",
        "        sqrt=Math.sqrt, random=Math.random, pow=Math.pow, sign=Math.sign, sin=Math.sin, cos=Math.cos,",
        "        tan=Math.tan, atan2=Math.atan2, hypot=Math.hypot, pi=Math.PI;"
    ].join("\n");

    // --------------------------------------------------------------- COMPILE
    function compile(source) {
        const warnings = [];
        try {
            const tokens = lex(source);
            const program = parse(tokens);
            const gen = generate(program, warnings);
            const meta = normalizeMeta(program.mod);
            return { ok: true, body: gen.code, settings: gen.settings, meta, warnings, version: VERSION };
        } catch (e) {
            if (e.name === "CompileError") return { ok: false, error: e.message, line: e.line, col: e.col, warnings };
            throw e;
        }
    }

    function normalizeMeta(mod) {
        const m = mod.meta || {};
        const first = (k, d) => (m[k] && m[k][0]) || d;
        return {
            name: first("name", mod.name),
            version: first("version", "1.0.0"),
            description: first("description", "A moomoo.js mod."),
            author: first("author", "you"),
            match: m.match && m.match.length ? m.match : ["*://*/*"],
            require: m.require && m.require.length ? m.require : [],
            grant: first("grant", "none")
        };
    }

    // The compiled mod as a standalone function-expression string. The body is
    // a MooMoo.register(...) call; the mod's logic lives in its setup function.
    function toFunctionSource(result) {
        return "(function(MooMoo){\n  \"use strict\";\n" + result.body + "\n})";
    }

    // Run-now form (assumes window.MooMoo already exists; used in tests/embeds).
    function toPlainPlugin(result) {
        return "(" + toFunctionSource(result) + ")(window.MooMoo);\n";
    }

    // Full Tampermonkey userscript. `loaderUrl` is the @require of the loader.
    function wrapUserscript(result, options) {
        const opts = options || {};
        const meta = result.meta;
        const loaderUrls = (meta.require || []).slice();
        if (opts.loaderUrl && loaderUrls.indexOf(opts.loaderUrl) < 0) loaderUrls.unshift(opts.loaderUrl);

        const header = [
            "// ==UserScript==",
            "// @name         " + meta.name,
            "// @namespace    moomoo.js",
            "// @version      " + meta.version,
            "// @description  " + meta.description,
            "// @author       " + meta.author
        ];
        for (const mt of meta.match) header.push("// @match        " + mt);
        header.push("// @run-at       document-start");
        if (!loaderUrls.length) {
            header.push("// @require      <PASTE THE LOADER URL HERE>   // moomoo-loader.user.js");
        } else {
            for (const u of loaderUrls) header.push("// @require      " + u);
        }
        header.push("// @grant        " + (meta.grant || "none"));
        header.push("// ==/UserScript==");

        const fnSrc = toFunctionSource(result);
        // Boot runs in PAGE context: wait for window.MooMoo, then run the mod.
        const boot =
            "(function(){" +
            "var run=" + fnSrc + ";" +
            "function start(){ run(window.MooMoo); }" +
            "if(window.MooMoo&&window.MooMoo.onReady){window.MooMoo.onReady(start);}" +
            "else{window.addEventListener('moomoo:ready',function(){window.MooMoo&&window.MooMoo.onReady?window.MooMoo.onReady(start):start();},{once:true});}" +
            "})();";

        const wrapper = [
            header.join("\n"),
            "",
            "/* Compiled from moomoo.js by the moomoo.js compiler v" + VERSION + ". Do not edit by hand. */",
            "(function () {",
            '  "use strict";',
            "  var __BOOT__ = " + JSON.stringify(boot) + ";",
            "  function inject(code){ var s=document.createElement('script'); s.textContent=code; (document.head||document.documentElement).appendChild(s); s.remove(); }",
            "  var inPage;",
            "  try { inPage = (typeof unsafeWindow==='undefined')||(window===unsafeWindow); } catch(e){ inPage=true; }",
            "  if (inPage) { (0, eval)(__BOOT__); } else { inject(__BOOT__); }",
            "})();",
            ""
        ].join("\n");
        return wrapper;
    }

    return { VERSION, compile, lex, parse, toFunctionSource, toPlainPlugin, wrapUserscript, CompileError };
});
