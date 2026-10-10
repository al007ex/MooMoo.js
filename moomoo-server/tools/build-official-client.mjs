#!/usr/bin/env node
// BUILD OFFICIAL CLIENT
// Turns the files saved from moomoo.io (client-official/source) into a client that runs
// against this server (dist/official):
//
//   index-*.js   patched so the game talks to this server instead of api.moomoo.io /
//                *.moomoo.io game servers (every patch must match exactly once)
//   page.html    the saved page, cleaned back to its static form (no injected consent
//                banner / captcha iframe / ads / browser-extension leftovers)
//   shim.js      local FRVR SDK + Turnstile + ads stand-ins
//
// Usage: node tools/build-official-client.mjs [--no-anti-debug]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "client-official/source");
const OUT = path.join(ROOT, "dist/official");
const ASSETS = path.join(OUT, "assets");
const args = new Set(process.argv.slice(2));

function pick(re) {
    const files = fs.readdirSync(SRC).filter(f => re.test(f));
    if (files.length !== 1) {
        throw new Error(`expected exactly one file matching ${re} in ${SRC}, found ${files.length}: ${files.join(", ")}`);
    }
    return files[0];
}

// ---------------------------------------------------------------- bundle patches
// The minifier renames identifiers on every moomoo.io build, so each patch is a pattern
// that captures the names instead of spelling them out. Every pattern must match exactly
// once; if one stops matching, the client changed in a way that needs a look.
const ID = "([A-Za-z_$][\\w$]*)";
const LOCALHOST = 'location\\.hostname==="localhost"\\|\\|location\\.hostname==="127\\.0\\.0\\.1"';
const PATCHES = [
    {
        name: "run as production (anti-tamper on, /join tickets, no dev globals)",
        from: new RegExp(`const ${ID}=${LOCALHOST};`),
        to: "const $1=!1;"
    },
    {
        name: "no localhost dev token (moo_dev_frvr_token)",
        from: new RegExp(`${ID}="moo_dev_frvr_token",${ID}=${LOCALHOST}`),
        to: '$1="moo_dev_frvr_token",$2=!1'
    },
    {
        name: "API base -> this server",
        from: new RegExp(`\\(${ID}="https://api\\.moomoo\\.io",${ID}="moomoo\\.io"\\)`),
        to: '($1=location.origin+"/api",$2="moomoo.io")'
    },
    {
        name: "servers in the \"local\" region live on this host (/s/<key>)",
        from: new RegExp(`function ${ID}\\(${ID}\\)\\{return \\2\\.region==0\\?"localhost":`),
        to: 'function $1($2){return $2.region=="local"?location.host+"/s/"+$2.key:'
    },
    {
        name: "ws:// when the page is served over http",
        from: new RegExp(`let ${ID}="wss"\\+"://"\\+${ID};`),
        to: 'let $1=(location.protocol==="https:"?"wss":"ws")+"://"+$2;'
    },
    {
        name: "server ping over the page protocol",
        from: new RegExp(`${ID}="https://"\\+${ID}\\(${ID}\\)\\+"/ping"`),
        to: '$1=location.protocol+"//"+$2($3)+"/ping"'
    },
    {
        name: "FRVR social API -> this server",
        from: new RegExp(`${ID}="https://crucible\\.frvr\\.com/v1/social"`),
        to: '$1=location.origin+"/api/social"'
    },
    {
        name: "\"Copy link\" (profiles / clans) points at this server",
        from: new RegExp(`${ID}=/\\(\\^\\|\\\\\\.\\)moomoo\\\\\\.io\\$/\\.test\\(location\\.hostname\\)\\?location\\.origin:"https://moomoo\\.io"`),
        to: "$1=location.origin"
    }
];

if (args.has("--no-anti-debug")) {
    PATCHES.push({
        name: "disable the debugger trap (development only)",
        from: new RegExp(`${ID}\\(\\{antiDebug:!0,detectUserscripts:!0\\}\\)`),
        to: "$1({antiDebug:!1,detectUserscripts:!0})"
    });
}

function patchBundle(source) {
    let out = source;
    for (const patch of PATCHES) {
        const global = new RegExp(patch.from.source, "g");
        const count = (out.match(global) || []).length;
        if (count !== 1) {
            throw new Error(`patch "${patch.name}" matched ${count} times (expected 1). The client build changed - update tools/build-official-client.mjs.`);
        }
        out = out.replace(patch.from, patch.to);
        console.log(`  patched: ${patch.name}`);
    }
    return out;
}

// ---------------------------------------------------------------- html cleanup
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const TAG_RE = /<!--[\s\S]*?-->|<(\/?)([a-zA-Z][\w-]*)\b((?:[^>"']|"[^"]*"|'[^']*')*)>/g;

// Returns [start, end, openEnd] of every element whose opening tag satisfies `test`.
function findElements(html, test) {
    const found = [];
    TAG_RE.lastIndex = 0;
    let m;
    while ((m = TAG_RE.exec(html))) {
        if (m[0].startsWith("<!--") || m[1]) continue;
        const tag = m[2].toLowerCase();
        if (!test(tag, m[3])) continue;
        const start = m.index;
        const openEnd = TAG_RE.lastIndex;
        if (VOID.has(tag) || /\/\s*$/.test(m[3])) {
            found.push([start, openEnd, openEnd]);
            continue;
        }
        let depth = 1;
        const inner = new RegExp(TAG_RE.source, "g");
        inner.lastIndex = openEnd;
        let n;
        while ((n = inner.exec(html))) {
            if (n[0].startsWith("<!--") || n[2].toLowerCase() !== tag) continue;
            depth += n[1] ? -1 : 1;
            if (depth === 0) {
                found.push([start, inner.lastIndex, openEnd, n.index]);
                break;
            }
        }
        TAG_RE.lastIndex = openEnd;
    }
    return found;
}

const hasId = (id) => (_tag, attrs) => new RegExp(`\\bid="${id}"`).test(attrs);

function removeAll(html, test) {
    const ranges = findElements(html, test).sort((a, b) => b[0] - a[0]);
    let lastStart = Infinity;
    for (const [start, end] of ranges) {
        if (end > lastStart) continue; // nested inside something already removed
        html = html.slice(0, start) + html.slice(end);
        lastStart = start;
    }
    return html;
}

function emptyElement(html, id) {
    const [el] = findElements(html, hasId(id));
    if (!el || el[3] === undefined) return html;
    return html.slice(0, el[2]) + html.slice(el[3]);
}

function setStyle(html, id, style) {
    const re = new RegExp(`(<[a-zA-Z]+\\b[^>]*\\bid="${id}")([^>]*)>`);
    return html.replace(re, (_all, open, rest) => {
        rest = rest.replace(/\sstyle="[^"]*"/, "");
        return `${open}${rest}${style ? ` style="${style}"` : ""}>`;
    });
}

function buildHtml(page, files) {
    let html = page.replace(/<!-- saved from url=[^>]*-->\s*/, "");

    // scripts, iframes, injected consent / captcha / ad / extension markup
    html = removeAll(html, (tag) => tag === "script" || tag === "iframe" || tag === "ins" || tag === "noscript");
    html = removeAll(html, (tag, attrs) => tag === "style" && /onetrust|ot-sdk/i.test(attrs));
    html = html.replace(/<style[^>]*>[^<]*(?:onetrust|ot-sdk-btn)[\s\S]*?<\/style>/gi, "");
    for (const id of ["onetrust-consent-sdk", "volume-booster-visusalizer", "cdm-zone-end"]) {
        html = removeAll(html, hasId(id));
    }
    html = removeAll(html, (tag, attrs) => tag === "audio" && /audio-output/.test(attrs));
    html = html.replace(/<link\b[^>]*rel="(?:preconnect|preload|modulepreload|stylesheet)"[^>]*>/gi, "");
    html = html.replace(/<link\b[^>]*href="[^"]*(?:material-icons|hammersmith-one|main)\.css"[^>]*>/gi, "");

    // containers the game fills at runtime
    for (const id of ["actionBar", "turnstileWidget", "leaderboardData", "upgradeHolder", "storeHolder", "allianceHolder", "allianceManager", "adminHolder", "itemInfoHolder", "noticationDisplay", "regionSelect", "serverSelect", "keybindHolder", "topBoard", "topTabs", "friendList", "friendRequests", "profileStats", "profilePeriods", "profileSocials", "profileActions", "clanBody", "reportHolder", "gameSettingsBody", "topSpot"]) {
        html = emptyElement(html, id);
    }

    // restore the pre-load state of elements the game toggles
    html = setStyle(html, "mainMenu", "");
    html = setStyle(html, "loadingText", "");
    html = setStyle(html, "menuCardHolder", "display:none");
    html = setStyle(html, "gameCanvas", "");
    html = setStyle(html, "textCanvas", "display:none");
    html = setStyle(html, "touch-controls-fullscreen", "");
    html = setStyle(html, "gameUI", "display:none");
    html = setStyle(html, "topSpot", "display:none");

    // signed-out menu: the game switches these as soon as it knows who is signed in, but a
    // page saved while signed in would otherwise flash the account row first
    html = html.replace(/(<input\b[^>]*\bid="nameInput"[^>]*?)\s+disabled(?:="[^"]*")?/, "$1");
    html = html.replace(/(<div\b[^>]*\bid="enterGame"[^>]*>\s*<span>)Enter Game(<\/span>)/, "$1Play as Guest$2");
    html = setStyle(html, "signInButton", "");
    html = setStyle(html, "signInHint", "");
    html = setStyle(html, "accountRow", "display: none;");
    html = emptyElement(html, "accountRow");
    html = setStyle(html, "accountPrefs", "display:none");

    // local favicon / manifest
    html = html.replace(/href="https:\/\/moomoo\.io\/manifest\.json"/, 'href="/manifest.json"');
    html = html.replace(/href="https:\/\/moomoo\.io\/img\/favicon\.png\?v=2"/, 'href="/img/favicon.png"');

    const head = [
        '<script type="importmap">{"imports":{"moomoo-protocol":"__PROTOCOL_MODULE__"}}</script>',
        '<link rel="stylesheet" href="/assets/main.css">',
        '<link rel="stylesheet" href="/css/material-icons.css">',
        '<link rel="stylesheet" href="/css/hammersmith-one.css">',
        `<script type="module" crossorigin src="/assets/${files.index}"></script>`,
        `<link rel="modulepreload" crossorigin href="/assets/${files.vendor}">`
    ].join("");
    html = html.replace(/(<meta http-equiv="Content-Type"[^>]*>)/, `$1${head}`);

    const body = [
        '<script src="/assets/shim.js"></script>',
        '<script defer src="/assets/howler.core.min.js"></script>'
    ].join("");
    html = html.replace(/(<body[^>]*>)/, `$1${body}`);

    if (!html.includes("__PROTOCOL_MODULE__") || !html.includes("/assets/shim.js")) {
        throw new Error("could not inject the import map / shim into page.html");
    }
    return html;
}

// ---------------------------------------------------------------- build
function main() {
    const files = {
        index: pick(/^index-[\w]+\.js$/),
        vendor: pick(/^vendor-[\w]+\.js$/)
    };
    console.log(`building official client from ${path.relative(ROOT, SRC)}`);
    console.log(`  bundle: ${files.index}, vendor: ${files.vendor}`);

    fs.rmSync(OUT, { recursive: true, force: true });
    fs.mkdirSync(ASSETS, { recursive: true });

    const bundle = fs.readFileSync(path.join(SRC, files.index), "utf8");
    fs.writeFileSync(path.join(ASSETS, files.index), patchBundle(bundle));
    fs.copyFileSync(path.join(SRC, files.vendor), path.join(ASSETS, files.vendor));
    fs.copyFileSync(path.join(SRC, "main.css"), path.join(ASSETS, "main.css"));
    fs.copyFileSync(path.join(SRC, "howler.core.min.js"), path.join(ASSETS, "howler.core.min.js"));
    fs.copyFileSync(path.join(ROOT, "client-official/shim.js"), path.join(ASSETS, "shim.js"));

    const page = fs.readFileSync(path.join(SRC, "page.html"), "utf8");
    const html = buildHtml(page, files);
    fs.writeFileSync(path.join(OUT, "index.html"), html);
    console.log(`  index.html: ${(page.length / 1024).toFixed(0)} KB -> ${(html.length / 1024).toFixed(0)} KB`);
    console.log(`done -> ${path.relative(ROOT, OUT)}`);
}

main();
