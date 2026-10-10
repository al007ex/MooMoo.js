export const UTILS = {};

// MATH UTILS:
var mathABS = Math.abs;
var mathCOS = Math.cos;
var mathSIN = Math.sin;
var mathPOW = Math.pow;
var mathSQRT = Math.sqrt;
var mathABS = Math.abs;
var mathATAN2 = Math.atan2;
var mathPI = Math.PI;

// GLOBAL UTILS:
UTILS.randInt = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
UTILS.randFloat = function(min, max) {
    return Math.random() * (max - min + 1) + min;
};
UTILS.lerp = function(value1, value2, amount) {
    return value1 + (value2 - value1) * amount;
};
UTILS.decel = function(val, cel) {
    if (val > 0) {
        val = Math.max(0, val - cel);
    } else {
        if (val < 0) {
            val = Math.min(0, val + cel);
        }
    }
    return val;
};
UTILS.getDistance = function(x1, y1, x2, y2) {
    return mathSQRT((x2 -= x1) * x2 + (y2 -= y1) * y2);
};
UTILS.getDirection = function(x1, y1, x2, y2) {
    return mathATAN2(y1 - y2, x1 - x2);
};
UTILS.getAngleDist = function(a, b) {
    var p = mathABS(b - a) % (mathPI * 2);
    return p > mathPI ? mathPI * 2 - p : p;
};
UTILS.isNumber = function(n) {
    return typeof n == "number" && !isNaN(n) && isFinite(n);
};
UTILS.isString = function(s) {
    return s && typeof s == "string";
};
UTILS.kFormat = function(num) {
    return num > 999 ? (num / 1000).toFixed(1) + 'k' : num;
};
UTILS.capitalizeFirst = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
UTILS.fixTo = function(n, v) {
    return parseFloat(n.toFixed(v));
};
UTILS.sortByPoints = function(a, b) {
    return parseFloat(b.points) - parseFloat(a.points);
};
UTILS.lineInRect = function(recX, recY, recX2, recY2, x1, y1, x2, y2) {
    var minX = x1;
    var maxX = x2;
    if (x1 > x2) {
        minX = x2;
        maxX = x1;
    }
    if (maxX > recX2) {
        maxX = recX2;
    }
    if (minX < recX) {
        minX = recX;
    }
    if (minX > maxX) {
        return false;
    }
    var minY = y1;
    var maxY = y2;
    var dx = x2 - x1;
    if (Math.abs(dx) > 0.0000001) {
        var a = (y2 - y1) / dx;
        var b = y1 - a * x1;
        minY = a * minX + b;
        maxY = a * maxX + b;
    }
    if (minY > maxY) {
        var tmp = maxY;
        maxY = minY;
        minY = tmp;
    }
    if (maxY > recY2) {
        maxY = recY2;
    }
    if (minY < recY) {
        minY = recY;
    }
    if (minY > maxY) {
        return false;
    }
    return true;
};
UTILS.randomString = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};
UTILS.countInArray = function(array, val) {
    var count = 0;
    for (var i = 0; i < array.length; i++) {
        if (array[i] === val) {
            count++;
        }
    }
    return count;
};