// PROTOCOL BUILD
// The official client imports { BUILD_ID, mixKey, BUILD_SALT } from a module called
// "moomoo-protocol". moomoo.io serves it from a per-deploy path (e.g. /p/s16nr0.js)
// through an import map, so every deploy changes the key mixing and the packet table
// salt. Clients that still run an older build are rejected with close code 4002
// ("Game updated - please reload").
//
// This file generates an equivalent module for this server: a random build id, a
// random 32-bit table salt and a randomly parameterised ARX key mixer. The module text
// is written to disk, served to browsers, and imported here too, so both ends run the
// exact same mixKey implementation.

import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { pathToFileURL } from "node:url";

const randU32 = () => randomBytes(4).readUInt32LE(0);
const randInt = (min, max) => min + (randU32() % (max - min + 1));
const randId = (len) => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
    let out = "";
    for (const byte of randomBytes(len)) out += alphabet[byte % alphabet.length];
    return out;
};

function generateSource(params) {
    const { buildId, salt, constants, rounds, tapA, tapB, rotA, rotB, mult } = params;
    return `// moomoo-protocol | build ${buildId} | generated ${new Date(params.createdAt).toISOString()}
export const BUILD_ID = ${JSON.stringify(buildId)};
export const BUILD_SALT = ${salt};
const C = [${constants.join(", ")}];
export function mixKey(key, seed) {
  const s = new Uint32Array(8);
  seed >>>= 0;
  for (let i = 0; i < 8; i++) s[i] = (C[i] ^ Math.imul((seed + Math.imul(i + 1, 2654435769)) >>> 0, 2246822519)) >>> 0;
  for (let i = 0; i < key.length; i++) {
    const j = i & 7, n = s[(j + 1) & 7];
    s[j] = (Math.imul(s[j] ^ key[i], 16777619) + ((n << ${rotA}) | (n >>> ${32 - rotA}))) >>> 0;
  }
  for (let r = 0; r < ${rounds}; r++) {
    for (let j = 0; j < 8; j++) {
      const a = s[(j + ${tapA}) & 7], b = s[(j + ${tapB}) & 7];
      s[j] = (s[j] + (a ^ ((b << ${rotB}) | (b >>> ${32 - rotB})))) >>> 0;
      s[j] = Math.imul(s[j] ^ (s[j] >>> 15), ${mult}) >>> 0;
    }
  }
  const out = new Uint8Array(32);
  for (let j = 0; j < 8; j++) {
    out[j * 4] = s[j] & 255;
    out[j * 4 + 1] = (s[j] >>> 8) & 255;
    out[j * 4 + 2] = (s[j] >>> 16) & 255;
    out[j * 4 + 3] = (s[j] >>> 24) & 255;
  }
  return out;
}
`;
}

function randomParams() {
    let tapA = randInt(1, 7);
    let tapB = randInt(1, 7);
    while (tapB === tapA) tapB = randInt(1, 7);
    return {
        buildId: randId(10),
        salt: randU32(),
        constants: Array.from({ length: 8 }, randU32),
        rounds: randInt(4, 8),
        tapA,
        tapB,
        rotA: randInt(5, 27),
        rotB: randInt(5, 27),
        mult: (randU32() | 1) >>> 0,
        modulePath: randId(6),
        createdAt: Date.now()
    };
}

// Creates (or reuses, when PROTOCOL_BUILD_FILE pins one) the protocol build for this run.
export async function createProtocolBuild({ outDir, pinFile }) {
    let params = null;
    if (pinFile && fs.existsSync(pinFile)) {
        params = JSON.parse(fs.readFileSync(pinFile, "utf8"));
    } else {
        params = randomParams();
        if (pinFile) {
            fs.mkdirSync(path.dirname(pinFile), { recursive: true });
            fs.writeFileSync(pinFile, JSON.stringify(params, null, 2));
        }
    }

    const source = generateSource(params);
    fs.mkdirSync(outDir, { recursive: true });
    for (const old of fs.readdirSync(outDir)) {
        if (/\.m?js$/.test(old)) fs.rmSync(path.join(outDir, old));
    }
    const file = path.join(outDir, `${params.modulePath}.mjs`);
    fs.writeFileSync(file, source);

    const mod = await import(pathToFileURL(file).href + `?v=${params.createdAt}`);

    return {
        BUILD_ID: mod.BUILD_ID,
        BUILD_SALT: mod.BUILD_SALT,
        mixKey: mod.mixKey,
        // Browser-facing path used in the import map, mirroring moomoo.io's /p/<id>.js.
        publicPath: `/p/${params.modulePath}.js`,
        file,
        source,
        createdAt: params.createdAt
    };
}
