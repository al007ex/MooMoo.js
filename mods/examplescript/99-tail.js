            ctx.log("v1.0 loaded — config menu on Escape (as in the bundle) or the gear button");
        });
    }

    const w = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
    if (w.MooMoo) { boot(w.MooMoo); return; }
    let tries = 0;
    const iv = setInterval(function () {
        if (w.MooMoo) { clearInterval(iv); boot(w.MooMoo); }
        else if (++tries > 200) clearInterval(iv);
    }, 50);
    if (w.addEventListener) w.addEventListener("moomoo:ready", function () { if (w.MooMoo) { clearInterval(iv); boot(w.MooMoo); } });
})();
