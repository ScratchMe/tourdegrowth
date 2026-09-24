import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

/**
 * The import graph of `src/`, read from source text — shared by the guards
 * that walk it (`content-fan-in.test.ts`, `game-bundles.test.ts`) so they
 * agree on what an edge is.
 *
 * An edge is a VALUE import: `import type` is erased by TypeScript and never
 * reaches a bundle, so it is not one. Paths are relative to `src/`, with `/`.
 */
export const SRC = join(process.cwd(), "src");

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(name) ? [full] : [];
  });
}

export const FILES = walk(SRC).map((full) => ({
  path: relative(SRC, full).replaceAll("\\", "/"),
  source: readFileSync(full, "utf8"),
}));

export const BY_PATH = new Map(FILES.map((f) => [f.path, f.source]));

/** The imports that survive compilation — `import type` is erased. */
export function valueImports(source: string): string[] {
  return [...source.matchAll(/(^|\n)\s*(?:import|export)(\s+type)?\s[^;]*?from\s+["']([^"']+)["']/g)]
    .filter((m) => !m[2])
    .map((m) => m[3]!);
}

export function resolveSpecifier(fromPath: string, spec: string): string | null {
  let base: string;
  if (spec.startsWith("@/")) base = spec.slice(2);
  else if (spec.startsWith(".")) {
    const dir = fromPath.split("/").slice(0, -1);
    for (const part of spec.split("/")) {
      if (part === ".") continue;
      else if (part === "..") dir.pop();
      else dir.push(part);
    }
    base = dir.join("/");
  } else return null; // a package — outside our tree
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
    if (BY_PATH.has(candidate)) return candidate;
  }
  return null;
}

/** Every module reachable from `entry` through value imports, `entry` included. */
export function reachable(entry: string): Set<string> {
  const seen = new Set<string>();
  const queue = [entry];
  while (queue.length) {
    const current = queue.pop()!;
    if (seen.has(current)) continue;
    seen.add(current);
    const source = BY_PATH.get(current);
    if (!source) continue;
    for (const spec of valueImports(source)) {
      const resolved = resolveSpecifier(current, spec);
      if (resolved && !seen.has(resolved)) queue.push(resolved);
    }
  }
  return seen;
}

/** A file is a Client Component when `"use client"` opens it. */
export function isClientComponent(source: string): boolean {
  return /^\s*["']use client["'];?/m.test(source.split("\n").slice(0, 3).join("\n"));
}
