            // =====================================================================
            // DEBUG — a read-only view of the mod state for the live tests, only when
            // localStorage "mmj_debug" is "1". __MMP_DEBUG__ is a build macro: true in
            // the readable test build, false in the delivered userscript, where this
            // whole block is compiled out.
            // =====================================================================
            if (__MMP_DEBUG__) (function () {
                let on = false;
                try { on = win.localStorage && win.localStorage.getItem("mmj_debug") === "1"; } catch (e) { on = false; }
                if (!on) return;
                win.__mmp = {
                    state() {
                        return {
                            v, p, gt, Mt, hn, ct, Ot, At, Ct, St, Nt: !!Nt, jt, Ht, g0: g[0], y, ee, A, ry, ay, ly, uy, cy, dy, fy, hy,
                            dir: z.dir, bm: bm(), Dn, ui, He, We, et, un, fn, In, xt, Y: Y ? Y.sid : null,
                            hat: getHat(), tail: getTail(), owned: Nn.slice(), dmgpot: z.dmgpot ? { hp: z.dmgpot.hp, add: z.dmgpot.add, soldier: z.dmgpot.soldier } : null,
                            health: z.health, shame: z.shameCount, m: { lc: m.lc, rc: m.rc, mc: m.mc }
                        };
                    },
                    menu: () => menuApi,
                    eval(src) { return eval(src); }    // test-only: read any bundle variable by name
                };
                ctx.onCleanup(() => { delete win.__mmp; });
            })();
