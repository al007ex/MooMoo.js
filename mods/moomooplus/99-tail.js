            ctx.log("loaded — press M for the menu");
        });
    }

    // Fetch the loader's API through its event handshake — there is no window.MooMoo.
    const w = (typeof unsafeWindow !== "undefined") ? unsafeWindow : window;
    function connect() {
        let mm = null, ld = null;
        try { w.dispatchEvent(new CustomEvent("moomoo.js:api", { detail: { resolve: function (m, l) { mm = m; ld = l; } } })); } catch (e) {}
        if (mm) { boot(mm, ld); return true; }
        return false;
    }
    if (connect()) return;
    let tries = 0;
    const iv = setInterval(function () { if (connect() || ++tries > 200) clearInterval(iv); }, 50);
    if (w.addEventListener) w.addEventListener("moomoo.js:ready", function () { if (connect()) clearInterval(iv); });
})();
