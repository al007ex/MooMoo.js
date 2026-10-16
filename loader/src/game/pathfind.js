/*
 * moomoo.js loader — PATHFINDER  (ctx.path)
 * =========================================
 * A* on a 12 px grid over a 900 x 900 window around you, avoiding buildings the
 * way the game's movement does (trees / bushes shrink to 70%, enemy spikes grow
 * by 40, pit traps only block when they're an enemy's, boost pads / teleporters
 * block, your clan's buildings don't hurt). The search runs in a Web Worker pool
 * so a long search never stalls a frame; without Worker support (headless) it
 * runs inline.
 *
 *   ctx.path.find({ player, target, buildings, clan })
 *     player     { x2, y2, sid }        where you are (server position)
 *     target     { x, y }
 *     buildings  game objects near you  (x, y, scale, name, type, dmg, owner, ...)
 *     clan       sids of your clan
 *   -> Promise<{ ok, path, reason }>
 *        path    [x0, y0, x1, y1, ...] from you to the target (empty unless ok)
 *        reason  "reached target" | "reached max iterations" | "couldn't reach target"
 *
 * Part of the LOADER.
 */
(function (root, factory) {
    const value = factory();
    if (typeof module === "object" && module.exports) module.exports = value;
    if (typeof root !== "undefined") root.MooMooPathfind = value;
    if (typeof globalThis !== "undefined") globalThis.MooMooPathfind = value;
})(typeof self !== "undefined" ? self : this, function () {
    "use strict";

    // The search itself. Self-contained (only Math / JSON / Number), because its
    // source text is also what the worker runs.
    function makeSearch() {
        const sqrt = Math.sqrt, abs = Math.abs, floor = Math.floor, MAX = Number.MAX_VALUE;
        const SQRT2 = sqrt(2);
        const SPAN = 900;              // window size (px)
        const CELL = 12;               // grid step (px)
        const HALF = CELL / 2;
        const EMPTY = JSON.stringify(new Array(Math.round(SPAN / CELL)).fill([]));
        const N = JSON.parse(EMPTY).length;
        const STEPS = [0, -1, 0, 1, -1, 0, 1, 0, 1, 1, 1, -1, -1, 1, -1, -1];
        const dist = (x1, y1, x2, y2) => sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
        const stepCost = (dx, dy) => {
            const a = abs(dx), b = abs(dy);
            return ((a === 0) + (b === 0)) * CELL + (a !== 0 && b !== 0) * CELL * SQRT2;
        };
        function grid(sx, sy, obstacles, tx, ty) {
            const map = JSON.parse(EMPTY);
            let target = 0, start = 0;
            for (let i = 0; i < N; i++) {
                const col = map[i];
                for (let j = 0; j < N; j++) {
                    const n = col[j] = { x: i * CELL - SPAN / 2 + sx, y: j * CELL - SPAN / 2 + sy, obstacle: false, available: 1, n: i * N + j };
                    if (n.x < 0 || n.x > 14400 || n.y < 0 || n.y > 14400) { n.obstacle = 1; continue; }
                    for (let k = obstacles.length, o; k--, o = obstacles[k];) {
                        if (n.obstacle = abs(o.x - n.x) <= o.scale2 + 20 && abs(o.y - n.y) <= o.scale2 + 20 && sqrt((o.x - n.x) ** 2 + (o.y - n.y) ** 2) - o.scale2 - 20 <= 0) break;
                    }
                    n.target = abs(n.x - tx) <= HALF && abs(n.y - ty) <= HALF;
                    target = n.target * n.n + !n.target * target;
                    n.start = abs(n.x - sx) <= HALF && abs(n.y - sy) <= HALF;
                    start = n.start * n.n + !n.start * start;
                    n.fCost = n.start * -MAX;
                    n.gCost = !n.start * MAX;
                }
            }
            return { map, targetNode: target, startNode: start };
        }
        // what blocks you, and how far around it (the game's own collision radii)
        function blocking(b, me, clan) {
            b.scale2 = (b.owner == null || b.name == "sapling") && b.type === 0 ? b.scale * .7
                : b.dmg && !clan.includes(b?.owner?.sid) && b?.owner?.sid != me.sid ? b.scale + 40
                    : b.type === 1 && b.y < 12e3 && (b.teleport || b.boostSpeed) ? b.scale + 35
                        : b["do"] ? b.scale : b.scale - 10;
            return (b.ignoreCollision ? b.name === "pit trap" ? b?.owner?.sid != me.sid && !clan.includes(b.owner?.sid) : b.name === "boost pad" || b.name === "teleporter" : true) && dist(b.x, b.y, me.x2, me.y2) < SPAN;
        }
        return function search(job) {
            const me = job.player, to = job.target, clan = job.clan || [];
            if (dist(me.x2, me.y2, to.x, to.y) <= 0) return "reached target";
            const { map, startNode, targetNode } = grid(me.x2, me.y2, (job.buildings || []).filter((b) => blocking(b, me, clan)), to.x, to.y);
            void targetNode;
            let open = [startNode];
            const closed = [];
            let cur, budget = 1e5;
            while (open.length * budget--) {
                let best = Infinity, at;
                for (let e = open.length, nd; e--;) {
                    nd = map[floor(open[e] / N)][open[e] % N];
                    if (nd.fCost < best) { cur = nd; best = nd.fCost; at = e; }
                }
                open.splice(at, 1);
                closed.push(cur.n);
                if (cur.target) break;
                for (let s = 0, nb; s < STEPS.length; s++) {
                    nb = map[floor(cur.n / N) + STEPS[s]]?.[cur.n % N + STEPS[s + 1]];
                    if (!nb || closed.includes(nb.n)) continue;
                    const g = cur.gCost + stepCost(STEPS[s], STEPS[s + 1]);
                    if (!nb.obstacle && nb.available === 1) {
                        if (!open.includes(nb.n)) {
                            nb.parent = cur.n;
                            nb.gCost = g;
                            nb.hCost = dist(nb.x, nb.y, to.x, to.y);
                            nb.fCost = g + nb.hCost;
                            open.push(nb.n);
                        } else if (g < nb.gCost) {
                            nb.parent = cur.n;
                            nb.gCost = g;
                            nb.fCost = g + nb.hCost;
                        }
                    }
                }
            }
            if (budget === 0) return "reached max iterations";
            if (!open.length) return "couldn't reach target";
            const path = [];
            while (!cur.start) {
                path.push(cur.y, cur.x);
                cur = map[floor(cur.parent / N)][cur.parent % N];
            }
            return path.reverse();
        };
    }

    // Only the fields the search reads (game objects hold references that don't clone).
    function serialize(job) {
        const pl = job.player || {};
        return {
            player: { x2: pl.x2, y2: pl.y2, sid: pl.sid },
            target: { x: job.target.x, y: job.target.y },
            buildings: (job.buildings || []).map((b) => ({
                x: b.x, y: b.y, scale: b.scale, name: b.name, type: b.type, dmg: b.dmg,
                ignoreCollision: b.ignoreCollision, teleport: b.teleport, boostSpeed: b.boostSpeed,
                "do": b["do"], owner: b.owner == null ? null : { sid: b.owner.sid }
            })),
            clan: Array.isArray(job.clan) ? job.clan.slice() : []
        };
    }
    const toResult = (raw) => (typeof raw === "string"
        ? { ok: false, path: [], reason: raw }
        : { ok: raw.length > 0, path: raw, reason: raw.length ? "" : "couldn't reach target" });

    function createPathfinder(opts) {
        const win = (opts && opts.win) || (typeof self !== "undefined" ? self : null);
        const W = win && win.Worker, B = win && win.Blob, U = win && win.URL;
        let inline = null;
        const pool = [];      // { worker, free }
        let url = null;

        function spawn() {
            if (!url) url = U.createObjectURL(new B(["const search=(" + makeSearch.toString() + ")();onmessage=function(e){postMessage(search(e.data))};"]));
            const entry = { worker: new W(url), free: true };
            pool.push(entry);
            return entry;
        }
        function find(job) {
            const msg = serialize(job);
            if (!W || !B || !U) {
                inline = inline || makeSearch();
                return new Promise((resolve) => setTimeout(() => resolve(toResult(inline(msg))), 0));
            }
            return new Promise((resolve, reject) => {
                let entry;
                try { entry = pool.find((p) => p.free) || spawn(); }
                catch (e) { inline = inline || makeSearch(); resolve(toResult(inline(msg))); return; }
                entry.free = false;
                entry.worker.onmessage = (e) => { entry.free = true; resolve(toResult(e.data)); };
                entry.worker.onerror = (e) => { entry.free = true; reject(e); };
                entry.worker.postMessage(msg);
            });
        }
        function dispose() {
            for (const p of pool) { try { p.worker.terminate(); } catch (e) { /* gone */ } }
            pool.length = 0;
            if (url) { try { U.revokeObjectURL(url); } catch (e) { /* ignore */ } url = null; }
        }
        return { find, dispose, get workers() { return pool.length; } };
    }

    return { createPathfinder, makeSearch };
});
