// ==UserScript==
// @name         Health Logger
// @namespace    moomoo.js
// @version      1.0.0
// @description  Logs your current health to the console whenever it changes.
// @author       you
// @match        *://*/*
// @run-at       document-start
// @require      https://your-host.example/moomoo-loader.user.js
// @grant        none
// ==/UserScript==

/* Compiled from moomoo.js by the moomoo.js compiler v1.0.0. Do not edit by hand. */
(function () {
  "use strict";
  var __BOOT__ = "(function(){var run=(function(MooMoo){\n  \"use strict\";\n  MooMoo.register({\n    id: \"health-logger\",\n    name: \"Health Logger\",\n    version: \"1.0.0\",\n    description: \"Logs your current health to the console whenever it changes.\",\n    settings: [\n      { key: \"onlyMine\", type: \"boolean\", default: true, label: \"Only my health\" }\n    ]\n  }, function(ctx){\n    var self = MooMoo.self, players = MooMoo.players, send = MooMoo.send;\n    var setting = ctx.settings;\n    var log = function(){ return ctx.log.apply(ctx, arguments); };\n    var player = function(sid){ return MooMoo.player(sid); };\n    var now = function(){ return Date.now(); };\n    var abs=Math.abs, floor=Math.floor, ceil=Math.ceil, round=Math.round, min=Math.min, max=Math.max,\n        sqrt=Math.sqrt, random=Math.random, pow=Math.pow, sign=Math.sign, sin=Math.sin, cos=Math.cos,\n        tan=Math.tan, atan2=Math.atan2, hypot=Math.hypot, pi=Math.PI;\n\n    ctx.on(\"setup\", function(__e){\n      var sid = __e[\"sid\"];\n      log((\"joined the game — your sid is \" + sid));\n    });\n    ctx.on(\"health\", function(__e){\n      var sid = __e[\"sid\"];\n      var value = __e[\"value\"];\n      if (setting.onlyMine) {\n        if ((sid == self.sid)) {\n          log((\"My health is now \" + value));\n        }\n      } else {\n        log((((\"player \" + sid) + \" health is now \") + value));\n      }\n    });\n  });\n});function start(){ run(window.MooMoo); }if(window.MooMoo&&window.MooMoo.onReady){window.MooMoo.onReady(start);}else{window.addEventListener('moomoo:ready',function(){window.MooMoo&&window.MooMoo.onReady?window.MooMoo.onReady(start):start();},{once:true});}})();";
  function inject(code){ var s=document.createElement('script'); s.textContent=code; (document.head||document.documentElement).appendChild(s); s.remove(); }
  var inPage;
  try { inPage = (typeof unsafeWindow==='undefined')||(window===unsafeWindow); } catch(e){ inPage=true; }
  if (inPage) { (0, eval)(__BOOT__); } else { inject(__BOOT__); }
})();
