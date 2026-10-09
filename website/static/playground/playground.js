/* moomoo.js Playground — code editor + compiler, all client-side. */
(function () {
  "use strict";
  var VOCAB = window.MooMooVocabulary, Compiler = window.MooMooCompiler;
  var $ = function (s) { return document.querySelector(s); };
  function el(tag, cls) { var n = document.createElement(tag); if (cls) n.className = cls; return n; }

  // Starter mod shown in the editor on first load.
  var STARTER = [
    'mod "My Mod" {',
    '    @description "What this mod does."',
    '    @version "1.0.0"',
    '',
    '    // A setting shows up (expandable) under this mod in the in-game Mods',
    '    // tab, persists across reloads, and reads back as `setting.onlyMine`.',
    '    setting onlyMine = true "Only my health"',
    '',
    '    // Fires once when you join. `setup` carries your own player id.',
    '    on setup(sid) {',
    '        log("joined the game — your sid is " + sid)',
    '    }',
    '',
    '    // Fires every time any player\'s health changes.',
    '    on health(sid, value) {',
    '        if (setting.onlyMine) {',
    '            if (sid == self.sid) {',
    '                log("My health is now " + value)',
    '            }',
    '        } else {',
    '            log("player " + sid + " health is now " + value)',
    '        }',
    '    }',
    '}'
  ].join("\n");

  var outTab = "userscript", lastSource = "", lastResult = null;

  function compileNow() {
    var src = $("#codeArea").value; lastSource = src;
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
    if (!lastResult || !lastResult.ok) txt = "// fix the errors above to see output";
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
  function init() {
    if (!$("#codeArea").value.trim()) $("#codeArea").value = STARTER;
    buildReference();
    $("#codeArea").oninput = compileNow;
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
