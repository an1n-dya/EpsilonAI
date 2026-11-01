// On Windows, Next 16's static export writes nested segment prefetch payloads
// into folders (`out/__next.!KHNpdGUp/__PAGE__.txt`) instead of the dot-joined
// files the client router requests (`out/__next.!KHNpdGUp.__PAGE__.txt`), so
// every segment prefetch 404s. The exporter swaps `/` for `.` but collects the
// paths with `path.relative`, which uses `\` there:
// https://github.com/vercel/next.js/issues/85374
// Linux and macOS builds (Netlify included) already emit the flat files, so
// there is nothing to move and this is a no-op.
import { readdir, rename, rm } from "node:fs/promises";
import { join } from "node:path";

async function flatten(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = join(dir, entry.name);
    if (entry.name.startsWith("__next.")) {
      await hoist(path, dir, entry.name);
      await rm(path, { recursive: true });
    } else {
      await flatten(path);
    }
  }
}

// Move every file under `dir` into `target`, joining its path onto `prefix`
// with dots.
async function hoist(dir, target, prefix) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const name = `${prefix}.${entry.name}`;
    if (entry.isDirectory()) await hoist(join(dir, entry.name), target, name);
    else await rename(join(dir, entry.name), join(target, name));
  }
}

await flatten("out");
