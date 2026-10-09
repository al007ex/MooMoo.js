/* moomoo.js Playground — blocks + code editor + compiler, all client-side. */
(function () {
  "use strict";
  var VOCAB = window.MooMooVocabulary, Compiler = window.MooMooCompiler;
  var $ = function (s) { return document.querySelector(s); };
  function el(tag, cls) { var n = document.createElement(tag); if (cls) n.className = cls; return n; }

  // ---------------- block model ----------------
  var uid = 1;
  var CONTAINERS = { on: 1, if: 1, repeat: 1, every: 1 };
  function isContainer(t) { return !!CONTAINERS[t]; }
  function node(type, fields) {
    return { id: uid++, type: type, fields: fields || {}, children: isContainer(type) ? [] : null, elseChildren: null };
  }
  function defaults(type) {
    switch (type) {
      case "on": return { event: VOCAB.events.health ? "health" : VOCAB.eventNames[0] };
      case "send": return { action: "chat", args: {} };
      case "if": return { cond: "self.health < 50" };
      case "repeat": return { count: "3" };
      case "every": return { ms: "1000" };
      case "let": return { name: "x", expr: "0" };
      case "set": return { target: "x", expr: "0" };
      case "log": return { expr: '"hello"' };
      case "setting": return { name: "speed", default: "1", label: "Speed" };
    }
    return {};
  }

  var CLS = { on: "event", send: "packet", if: "control", repeat: "control", every: "control", let: "value", set: "value", log: "console", setting: "setting" };

  var PALETTE = [
    { cat: "Events", items: [{ type: "on", label: "on «event»" }] },
    { cat: "Send packet", items: [{ type: "send", label: "send «action»" }] },
    { cat: "Control", items: [{ type: "if", label: "if … { }" }, { type: "repeat", label: "repeat (n) { }" }, { type: "every", label: "every (ms) { }" }] },
    { cat: "Values", items: [{ type: "let", label: "let x = …" }, { type: "set", label: "x = …" }] },
    { cat: "Console", items: [{ type: "log", label: "log( … )" }] },
    { cat: "Settings", items: [{ type: "setting", label: "setting x = …" }] }
  ];

  // starter mod
  var root = [];
  (function seed() {
    root.push(node("setting", { name: "onlyMine", default: "true", label: "Only my health" }));
    var onSetup = node("on", { event: "setup" });
    onSetup.children.push(node("log", { expr: '"joined as " + sid' }));
    root.push(onSetup);
    var onHealth = node("on", { event: "health" });
    var iff = node("if", { cond: "setting.onlyMine" });
    var inner = node("if", { cond: "sid == self.sid" });
    inner.children.push(node("log", { expr: '"My health is now " + value' }));
    iff.children.push(inner);
    iff.elseChildren = [node("log", { expr: '"player " + sid + " hp " + value' })];
    onHealth.children.push(iff);
    root.push(onHealth);
  })();

  var target = null; // insertion target container (null = top level)

  // ---------------- palette ----------------
  function buildPalette() {
    var pal = $("#palette"); pal.textContent = "";
    PALETTE.forEach(function (group) {
      var h = el("div", "pg-cat"); h.textContent = group.cat; pal.appendChild(h);
      group.items.forEach(function (it) {
        var b = el("button", "pal-block " + CLS[it.type]); b.textContent = it.label;
        b.onclick = function () { addNode(it.type); };
        pal.appendChild(b);
      });
    });
  }
  function addNode(type) {
    var n = node(type, defaults(type));
    (target ? target.children : root).push(n);
    renderCanvas(); compileNow();
  }

  // ---------------- find / move / remove ----------------
  function findParentList(id, list) {
    list = list || root;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list;
      var n = list[i];
      if (n.children) { var r = findParentList(id, n.children); if (r) return r; }
      if (n.elseChildren) { var r2 = findParentList(id, n.elseChildren); if (r2) return r2; }
    }
    return null;
  }
  function removeNode(n) { var l = findParentList(n.id); if (l) { l.splice(l.indexOf(n), 1); renderCanvas(); compileNow(); } }
  function moveNode(n, dir) {
    var l = findParentList(n.id); if (!l) return;
    var i = l.indexOf(n), j = i + dir;
    if (j < 0 || j >= l.length) return;
    l.splice(i, 1); l.splice(j, 0, n); renderCanvas(); compileNow();
  }

  // ---------------- render blocks ----------------
  function tool(label, title, fn) { var b = el("button"); b.textContent = label; b.title = title; b.onclick = function (e) { e.stopPropagation(); fn(); }; return b; }
  function field(value, cls, oninput) {
    var i = el("input", cls); i.type = "text"; i.value = value == null ? "" : value; i.spellcheck = false;
    i.oninput = function () { oninput(i.value); compileNow(); };
    i.onclick = function (e) { e.stopPropagation(); };
    return i;
  }
  function dropdown(options, value, onchange) {
    var s = el("select"); options.forEach(function (o) { var op = el("option"); op.value = o; op.textContent = o; if (o === value) op.selected = true; s.appendChild(op); });
    s.onchange = function () { onchange(s.value); renderCanvas(); compileNow(); };
    s.onclick = function (e) { e.stopPropagation(); };
    return s;
  }

  function renderBlock(n) {
    var wrap = el("div", "blk " + CLS[n.type]);
    wrap.draggable = true;
    wrap.ondragstart = function (e) { e.stopPropagation(); e.dataTransfer.setData("text/mmid", String(n.id)); e.dataTransfer.effectAllowed = "move"; };
    var head = el("div", "blk-head");

    if (n.type === "on") {
      head.appendChild(kw("on"));
      head.appendChild(dropdown(VOCAB.eventNames, n.fields.event, function (v) { n.fields.event = v; }));
      var ev = VOCAB.events[n.fields.event];
      if (ev) { var ph = el("span", "pnames"); ph.textContent = "(" + ev.params.map(function (p) { return p.name; }).join(", ") + ")"; head.appendChild(ph); }
    } else if (n.type === "send") {
      head.appendChild(kw("send"));
      head.appendChild(dropdown(VOCAB.actionNames, n.fields.action, function (v) { n.fields.action = v; n.fields.args = {}; }));
      var ac = VOCAB.actions[n.fields.action];
      if (ac) ac.params.forEach(function (p) {
        var inp = field(n.fields.args[p.name], "expr", function (val) { n.fields.args[p.name] = val; });
        inp.placeholder = p.name; inp.title = p.desc || p.name; head.appendChild(inp);
      });
    } else if (n.type === "if") {
      head.appendChild(kw("if")); head.appendChild(field(n.fields.cond, "expr", function (v) { n.fields.cond = v; }));
    } else if (n.type === "repeat") {
      head.appendChild(kw("repeat")); head.appendChild(field(n.fields.count, "expr", function (v) { n.fields.count = v; }));
      head.appendChild(kw("times"));
    } else if (n.type === "every") {
      head.appendChild(kw("every")); head.appendChild(field(n.fields.ms, "expr", function (v) { n.fields.ms = v; })); head.appendChild(kw("ms"));
    } else if (n.type === "let") {
      head.appendChild(kw("let")); head.appendChild(field(n.fields.name, "", function (v) { n.fields.name = v; })); head.appendChild(kw("="));
      head.appendChild(field(n.fields.expr, "expr", function (v) { n.fields.expr = v; }));
    } else if (n.type === "set") {
      head.appendChild(field(n.fields.target, "", function (v) { n.fields.target = v; })); head.appendChild(kw("="));
      head.appendChild(field(n.fields.expr, "expr", function (v) { n.fields.expr = v; }));
    } else if (n.type === "log") {
      head.appendChild(kw("log(")); head.appendChild(field(n.fields.expr, "expr", function (v) { n.fields.expr = v; })); head.appendChild(kw(")"));
    } else if (n.type === "setting") {
      head.appendChild(kw("setting")); head.appendChild(field(n.fields.name, "", function (v) { n.fields.name = v; })); head.appendChild(kw("="));
      head.appendChild(field(n.fields.default, "", function (v) { n.fields.default = v; }));
      head.appendChild(field(n.fields.label, "expr", function (v) { n.fields.label = v; })).placeholder = "label";
    }

    var tools = el("div", "blk-tools");
    if (isContainer(n.type)) tools.appendChild(tool("⊕", "add blocks inside this", function () { target = n; renderCanvas(); }));
    if (n.type === "if") tools.appendChild(tool(n.elseChildren ? "−else" : "+else", "toggle else", function () { n.elseChildren = n.elseChildren ? null : []; renderCanvas(); compileNow(); }));
    tools.appendChild(tool("↑", "move up", function () { moveNode(n, -1); }));
    tools.appendChild(tool("↓", "move down", function () { moveNode(n, 1); }));
    tools.appendChild(tool("✕", "delete", function () { removeNode(n); }));
    head.appendChild(tools);
    wrap.appendChild(head);

    if (isContainer(n.type)) {
      wrap.appendChild(bodyFor(n, n.children, false));
      if (n.type === "if" && n.elseChildren) {
        var e = el("div", "blk-else"); e.textContent = "else"; wrap.appendChild(e);
        wrap.appendChild(bodyFor(n, n.elseChildren, true));
      }
    }
    if (target === n) wrap.style.outline = "2px solid rgba(255,255,255,.85)";
    return wrap;
  }
  function kw(t) { var s = el("span", "kw"); s.textContent = t; return s; }
  function bodyFor(n, list, isElse) {
    var body = el("div", "blk-body" + (list.length ? "" : " empty"));
    list.forEach(function (c) { body.appendChild(renderBlock(c)); });
    body.ondragover = function (e) { e.preventDefault(); e.stopPropagation(); };
    body.ondrop = function (e) { e.preventDefault(); e.stopPropagation(); onDrop(e, list); };
    body.onclick = function (e) { if (e.target === body) { target = n; renderCanvas(); } };
    return body;
  }

  function onDrop(e, list) {
    var id = parseInt(e.dataTransfer.getData("text/mmid"), 10); if (!id) return;
    var from = findParentList(id); if (!from) return;
    var moving = from[from.indexOf(from.filter(function (x) { return x.id === id; })[0])];
    moving = from.filter(function (x) { return x.id === id; })[0];
    if (!moving) return;
    // don't drop a container into itself
    if (containsNode(moving, list)) return;
    from.splice(from.indexOf(moving), 1);
    list.push(moving);
    renderCanvas(); compileNow();
  }
  function containsNode(n, list) {
    if (n.children === list || n.elseChildren === list) return true;
    function walk(ls) { for (var i = 0; i < ls.length; i++) { var c = ls[i]; if (c.children && (c.children === list || walk(c.children))) return true; if (c.elseChildren && (c.elseChildren === list || walk(c.elseChildren))) return true; } return false; }
    return n.children ? walk(n.children) : false;
  }

  function renderCanvas() {
    var c = $("#canvas"); c.textContent = "";
    c.className = "pg-canvas" + (root.length ? "" : " empty");
    root.forEach(function (n) { c.appendChild(renderBlock(n)); });
    c.ondragover = function (e) { e.preventDefault(); };
    c.ondrop = function (e) { e.preventDefault(); onDrop(e, root); };
    c.onclick = function (e) { if (e.target === c) { target = null; renderCanvas(); } };
  }

  // ---------------- codegen: blocks -> moomoo.js ----------------
  function pad(i) { return new Array(i + 1).join("    "); }
  function genNode(n, ind, out) {
    var p = pad(ind);
    switch (n.type) {
      case "on": {
        var ev = VOCAB.events[n.fields.event];
        var params = ev ? ev.params.map(function (x) { return x.name; }).join(", ") : "";
        out.push(p + "on " + n.fields.event + "(" + params + ") {");
        n.children.forEach(function (c) { genNode(c, ind + 1, out); });
        out.push(p + "}"); break;
      }
      case "send": {
        var ac = VOCAB.actions[n.fields.action]; var ps = ac ? ac.params : [];
        var vals = ps.map(function (pp) { return (n.fields.args[pp.name] || "").trim(); });
        while (vals.length && vals[vals.length - 1] === "") vals.pop();
        out.push(p + "send." + n.fields.action + "(" + vals.join(", ") + ")"); break;
      }
      case "if": {
        out.push(p + "if (" + (n.fields.cond || "true") + ") {");
        n.children.forEach(function (c) { genNode(c, ind + 1, out); });
        if (n.elseChildren) { out.push(p + "} else {"); n.elseChildren.forEach(function (c) { genNode(c, ind + 1, out); }); }
        out.push(p + "}"); break;
      }
      case "repeat": out.push(p + "repeat (" + (n.fields.count || "1") + ") {"); n.children.forEach(function (c) { genNode(c, ind + 1, out); }); out.push(p + "}"); break;
      case "every": out.push(p + "every (" + (n.fields.ms || "1000") + ") {"); n.children.forEach(function (c) { genNode(c, ind + 1, out); }); out.push(p + "}"); break;
      case "let": out.push(p + "let " + (n.fields.name || "x") + " = " + (n.fields.expr || "0")); break;
      case "set": out.push(p + (n.fields.target || "x") + " = " + (n.fields.expr || "0")); break;
      case "log": out.push(p + "log(" + (n.fields.expr || '""') + ")"); break;
      case "setting": out.push(p + "setting " + (n.fields.name || "x") + " = " + (n.fields.default || "0") + (n.fields.label ? " " + JSON.stringify(n.fields.label) : "")); break;
    }
  }
  function genSource() {
    var name = $("#modName").value || "My Mod";
    var out = ["mod " + JSON.stringify(name) + " {"];
    root.forEach(function (n) { genNode(n, 1, out); });
    out.push("}");
    return out.join("\n");
  }

  // ---------------- compile + output ----------------
  var mode = "blocks", outTab = "userscript", lastSource = "", lastResult = null;
  function currentSource() { return mode === "blocks" ? genSource() : $("#codeArea").value; }

  function compileNow() {
    var src = currentSource(); lastSource = src;
    var res = Compiler.compile(src); lastResult = res;
    var status = $("#status");
    if (!res.ok) {
      status.className = "pg-status err"; status.textContent = "✗ " + res.error;
    } else {
      var w = res.warnings && res.warnings.length ? "  ·  " + res.warnings.length + " warning(s)" : "";
      status.className = "pg-status ok"; status.textContent = "✓ compiled " + res.meta.name + " v" + res.meta.version + w;
    }
    renderOutput();
    updatePreview(res);
  }

  function renderOutput() {
    var box = $("#output").firstChild, txt = "";
    if (outTab === "source") txt = lastSource;
    else if (!lastResult || !lastResult.ok) txt = "// fix the errors above to see output";
    else if (outTab === "userscript") txt = Compiler.wrapUserscript(lastResult, { loaderUrl: $("#loaderUrl").value.trim() });
    else txt = Compiler.toPlainPlugin(lastResult);
    box.textContent = txt;
  }

  // ---------------- live preview ----------------
  var previewRT = null, previewMenu = null;
  function ensurePreview() {
    if (previewRT) return;
    previewRT = window.MooMooRuntime.createRuntime({ sink: { sendAction: function () {}, sendRaw: function () {} } });
    previewRT._setReady(true);
    window.MooMoo = previewRT;
    previewMenu = window.MooMooMenu.installMenu(window, previewRT);
    if (previewMenu) previewMenu.showMods();
  }
  function updatePreview(res) {
    ensurePreview();
    if (!previewRT) return;
    if (previewRT._clearMods) previewRT._clearMods();
    if (!res.ok) { if (previewMenu) previewMenu.render(); return; }
    try {
      var fn = (0, eval)(Compiler.toFunctionSource(res));
      fn(previewRT);
    } catch (e) { /* preview is best-effort */ }
    if (previewMenu) { previewMenu.showMods(); previewMenu.render(); }
  }

  // ---------------- packet reference ----------------
  function buildReference() {
    var body = $("#refBody");
    function col(title, map, names) {
      var c = el("div", "pg-ref-col"); var h = el("h3"); h.textContent = title; c.appendChild(h);
      names.forEach(function (nm) {
        var spec = map[nm]; var item = el("div", "pg-ref-item");
        var line = el("div");
        var n = el("span", "nm"); n.textContent = nm;
        var pr = el("span", "pr"); pr.textContent = " (" + spec.params.map(function (p) { return p.name; }).join(", ") + ")";
        line.appendChild(n); line.appendChild(pr); item.appendChild(line);
        var ds = el("span", "ds"); ds.textContent = spec.summary; item.appendChild(ds);
        c.appendChild(item);
      });
      return c;
    }
    body.appendChild(col("Events  (on …)", VOCAB.events, VOCAB.eventNames));
    body.appendChild(col("Actions  (send …)", VOCAB.actions, VOCAB.actionNames));
  }

  // ---------------- wiring ----------------
  function setMode(m) {
    mode = m;
    $("#mode-blocks").classList.toggle("active", m === "blocks");
    $("#mode-code").classList.toggle("active", m === "code");
    $("#blocksView").hidden = m !== "blocks";
    $("#codeView").hidden = m !== "code";
    $("#sourceTabBtn").style.display = m === "blocks" ? "" : "none";
    if (m === "code" && !$("#codeArea").value.trim()) $("#codeArea").value = genSource();
    compileNow();
  }

  function init() {
    buildPalette(); renderCanvas(); buildReference();
    $("#mode-blocks").onclick = function () { setMode("blocks"); };
    $("#mode-code").onclick = function () { setMode("code"); };
    $("#codeArea").oninput = function () { if (mode === "code") compileNow(); };
    $("#modName").oninput = compileNow;
    $("#loaderUrl").oninput = function () { if (outTab === "userscript") renderOutput(); };
    document.querySelectorAll(".pg-tab").forEach(function (t) {
      t.onclick = function () {
        document.querySelectorAll(".pg-tab").forEach(function (x) { x.classList.remove("active"); });
        t.classList.add("active"); outTab = t.getAttribute("data-out"); renderOutput();
      };
    });
    $("#copyBtn").onclick = function () {
      var txt = $("#output").textContent;
      navigator.clipboard && navigator.clipboard.writeText(txt);
      var b = $("#copyBtn"); var o = b.textContent; b.textContent = "Copied!"; setTimeout(function () { b.textContent = o; }, 1200);
    };
    $("#downloadBtn").onclick = function () {
      if (!lastResult || !lastResult.ok) return;
      var txt = $("#output").textContent;
      var name = (lastResult.meta.name || "mod").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      var blob = new Blob([txt], { type: "text/javascript" });
      var a = el("a"); a.href = URL.createObjectURL(blob); a.download = name + (outTab === "userscript" ? ".user.js" : ".plugin.js"); a.click();
    };
    $("#refToggle").onclick = function () { var b = $("#refBody"); b.hidden = !b.hidden; $("#refToggle").textContent = "Packet reference (all events & actions) " + (b.hidden ? "▾" : "▴"); };
    compileNow();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
