/*
 * Unit test for the notice watchdog's BUNDLE-OUTDATED check (loader/src/core/notice.js).
 *
 * The loader bakes the content-hash stem of the client bundle it was built for; at runtime the
 * notice compares it to the stem the page actually loaded and, if they differ, warns that the
 * loader may be out of date. This proves:
 *   - a matching (or absent) stem produces no mismatch / no warning
 *   - a different stem is flagged, lands in the copyable report, and renders the "out of date" card
 *   - the stem is immune to the server's IS_SANDBOX byte transform (filename is unchanged)
 *
 * Run:  node tests/notice.test.mjs
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import path from "node:path";
import assert from "node:assert";

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const { create } = require(path.join(here, "..", "loader", "src", "core", "notice.js"));

let pass = 0, fail = 0;
const ok = (name, fn) => {
    try { fn(); pass++; console.log("  ✓ " + name); }
    catch (e) { fail++; console.log("  ✗ " + name + "\n      " + (e && e.stack || e)); }
};

// ---- a tiny DOM stub, just enough for the notice to build + mount a card without a browser ----
function makeDom() {
    const mk = () => {
        const n = {
            children: [], style: {}, _cls: "", _html: "", _text: "",
            get className() { return this._cls; }, set className(v) { this._cls = v; },
            get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; },
            get textContent() { return this._text; }, set textContent(v) { this._text = v; },
            appendChild(c) { this.children.push(c); return c; },
            removeChild(c) { const i = this.children.indexOf(c); if (i >= 0) this.children.splice(i, 1); return c; },
            setAttribute() {}, addEventListener() {}, removeEventListener() {}, remove() {},
            getClientRects: () => [{}], onclick: null, parentNode: null, href: "", target: "", rel: "", focus() {}, select() {}, value: ""
        };
        return n;
    };
    const body = mk(), head = mk();
    const doc = {
        baseURI: "https://localhost/", body, head, documentElement: mk(),
        createElement: () => mk(),
        querySelector: () => null, querySelectorAll: () => [],
        getElementById: () => null, execCommand() {}
    };
    const win = {
        document: doc, location: { href: "https://localhost/" }, navigator: {},
        getComputedStyle: () => ({ display: "block" }),
        setTimeout: () => 0, clearInterval() {}, setInterval: () => 0,
        addEventListener() {}, removeEventListener() {}, open() {}
    };
    return { win, doc };
}

const CONTRACT = { ioInitFields: 6, telemetryFields: 7, c2s: [], s2c: [] };

// Collect every card the notice mounts by scraping the title text out of the DOM stub.
function cardTitles(doc) {
    const titles = [];
    const walk = (n) => { if (!n || !n.children) return; if (n._cls === "mmj-nt-title") titles.push(n._html || n._text); n.children.forEach(walk); };
    walk(doc.body);
    return titles;
}

ok("no baked stem -> no bundle mismatch, clean verdict", () => {
    const { win } = makeDom();
    const n = create({ win, version: "1.3.3", contract: CONTRACT, expectedBundle: null, bundleStem: () => "993d072d" });
    assert.strictEqual(n.bundleMismatch(), null);
    assert.strictEqual(n.evaluate().verdict, "ok");
});

ok("stem matches -> no mismatch (survives the IS_SANDBOX transform, which never renames)", () => {
    const { win } = makeDom();
    const n = create({ win, version: "1.3.3", contract: CONTRACT, expectedBundle: "993d072d", bundleStem: () => "993d072d" });
    assert.strictEqual(n.bundleMismatch(), null);
});

ok("different stem -> mismatch object with expected + actual", () => {
    const { win } = makeDom();
    const n = create({ win, version: "1.3.3", contract: CONTRACT, expectedBundle: "993d072d", bundleStem: () => "deadbeef" });
    const bm = n.bundleMismatch();
    assert.ok(bm, "should report a mismatch");
    assert.strictEqual(bm.expected, "993d072d");
    assert.strictEqual(bm.actual, "deadbeef");
});

ok("the mismatch lands in the copyable report", () => {
    const { win } = makeDom();
    const n = create({ win, version: "1.3.3", contract: CONTRACT, expectedBundle: "993d072d", bundleStem: () => "deadbeef" });
    const report = n._report();
    assert.ok(/\[bundle\]/.test(report), "report has a [bundle] line");
    assert.ok(/index-deadbeef/.test(report) && /index-993d072d/.test(report), "report names both stems");
    assert.ok(/outdated/.test(report), "verdict mentions outdated");
});

ok("renders the 'out of date' card without throwing", () => {
    const { win, doc } = makeDom();
    const n = create({ win, version: "1.3.3", contract: CONTRACT, expectedBundle: "993d072d", bundleStem: () => "deadbeef" });
    n._showOutdated();
    const titles = cardTitles(doc);
    assert.ok(titles.some((t) => /out of date/i.test(t)), "an 'out of date' card was mounted; titles=" + JSON.stringify(titles));
});

ok("a missing live stem (bundle script not in DOM yet) is NOT a false mismatch", () => {
    const { win } = makeDom();
    const n = create({ win, version: "1.3.3", contract: CONTRACT, expectedBundle: "993d072d", bundleStem: () => null });
    assert.strictEqual(n.bundleMismatch(), null);
});

console.log(fail === 0 ? "\n  ✓ NOTICE OK (" + pass + ")" : "\n  " + fail + " FAILED (" + pass + " passed)");
process.exit(fail === 0 ? 0 : 1);
