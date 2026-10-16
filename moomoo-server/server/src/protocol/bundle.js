// CLIENT BUNDLE
// The official client bundle this server hands out (dist/official/assets/index-*.js).
// The client reports its file name with every connection (?u=index-<hash>) and builds its
// code seal from SHA-256 of the exact bytes it loaded, so the server keeps both: the name,
// to spot pages still running an older bundle, and the digest of what it actually serves
// (including the IS_SANDBOX variant), to compute the same seal.

import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

export class ClientBundle {

    // transform(source) -> source lets the server serve a patched copy (IS_SANDBOX).
    constructor(assetsDir, { transform = null } = {}) {
        this.assetsDir = assetsDir;
        this.transform = transform;
        this.cache = null;
    }

    // { stem, url, bytes, digest } for the bundle on disk now, or null before `npm run build`.
    current() {
        const name = fs.existsSync(this.assetsDir) && fs.readdirSync(this.assetsDir).find(f => /^index-[\w-]+\.js$/.test(f));
        if (!name) return null;
        const file = path.join(this.assetsDir, name);
        const stat = fs.statSync(file);
        if (this.cache && this.cache.file === file && this.cache.mtimeMs === stat.mtimeMs && this.cache.size === stat.size) return this.cache;
        let source = fs.readFileSync(file, "utf8");
        if (this.transform) source = this.transform(source, name);
        const bytes = Buffer.from(source, "utf8");
        this.cache = {
            file,
            mtimeMs: stat.mtimeMs,
            size: stat.size,
            stem: name.slice(0, -3),
            url: `/assets/${name}`,
            bytes,
            // [vd] the client keeps the first 16 bytes of SHA-256(bundle)
            digest: new Uint8Array(createHash("sha256").update(bytes).digest().subarray(0, 16))
        };
        return this.cache;
    }
}
