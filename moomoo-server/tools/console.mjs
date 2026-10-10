#!/usr/bin/env node
// Admin console client.
//   npm run console                       interactive prompt
//   npm run console -- tp me falls        single command
// Talks to the running server on PORT (default 8080) with the token in server/data/admin.token.

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TOKEN_FILE = path.join(ROOT, "server/data/admin.token");
const PORT = Number(process.env.PORT || 8080);

if (!fs.existsSync(TOKEN_FILE)) {
    console.error("No admin token yet - start the server once (npm start).");
    process.exit(1);
}
const token = fs.readFileSync(TOKEN_FILE, "utf8").trim();

async function run(command) {
    try {
        const res = await fetch(`http://127.0.0.1:${PORT}/admin/console`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Admin-Token": token },
            body: JSON.stringify({ command })
        });
        const body = await res.json();
        console.log((body.lines || [`error: ${body.error}`]).join("\n"));
    } catch {
        console.log(`error: can't reach the server on port ${PORT} - is it running?`);
    }
}

const args = process.argv.slice(2);
if (args.length) {
    await run(args.join(" "));
} else {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: "moomoo> " });
    console.log("MooMoo admin console - type help, Ctrl+C to quit");
    rl.prompt();
    rl.on("line", async (line) => {
        if (line.trim()) await run(line);
        rl.prompt();
    });
}
