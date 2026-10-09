((function(MooMoo){
  "use strict";
  MooMoo.register({
    id: "health-logger",
    name: "Health Logger",
    version: "1.0.0",
    description: "Logs your current health to the console whenever it changes.",
    settings: [
      { key: "onlyMine", type: "boolean", default: true, label: "Only my health" }
    ]
  }, function(ctx){
    var self = MooMoo.self, players = MooMoo.players, send = MooMoo.send;
    var setting = ctx.settings;
    var log = function(){ return ctx.log.apply(ctx, arguments); };
    var player = function(sid){ return MooMoo.player(sid); };
    var now = function(){ return Date.now(); };
    var abs=Math.abs, floor=Math.floor, ceil=Math.ceil, round=Math.round, min=Math.min, max=Math.max,
        sqrt=Math.sqrt, random=Math.random, pow=Math.pow, sign=Math.sign, sin=Math.sin, cos=Math.cos,
        tan=Math.tan, atan2=Math.atan2, hypot=Math.hypot, pi=Math.PI;

    ctx.on("setup", function(__e){
      var sid = __e["sid"];
      log(("joined the game — your sid is " + sid));
    });
    ctx.on("health", function(__e){
      var sid = __e["sid"];
      var value = __e["value"];
      if (setting.onlyMine) {
        if ((sid == self.sid)) {
          log(("My health is now " + value));
        }
      } else {
        log(((("player " + sid) + " health is now ") + value));
      }
    });
  });
}))(window.MooMoo);
