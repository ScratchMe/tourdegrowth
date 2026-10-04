import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * Every component synced to Claude Design keeps its description (B15,
 * 2026-10-04). The converter writes a component's `.prompt.md` — the design
 * agent's usage reference — from the doc comment directly above its export;
 * anything between the two (a constant, the props interface) and the
 * description silently drops out. A21 slipped a one-line helper above
 * `TotalBand`; `PaybackChart` had two constants there since A20.d, and
 * `WordmarkLink` its doc on the props interface. No error anywhere: the
 * contracts simply opened on « Props ».
 *
 * The inventory is `.design-sync/config.json`'s `componentSrcMap`, the same
 * list the sync reads (`.design-sync/check-inventory.mjs` keeps it complete).
 *
 * Non-vacuity (2026-10-04): the helper put back between `TotalBand`'s doc
 * and its function fails this test, naming TotalBand.
 */

const config = JSON.parse(readFileSync(".design-sync/config.json", "utf8")) as {
  componentSrcMap: Record<string, string | null>;
};
const pinned = Object.entries(config.componentSrcMap).filter((e): e is [string, string] => e[1] !== null);

/** The line just above `export function Name` / `export const Name`, blank lines skipped; null when not found. */
function lineAbove(source: string, name: string): string | null {
  const lines = source.split("\n");
  const at = lines.findIndex((l) => new RegExp(`^export (?:function|const) ${name}\\b`).test(l));
  if (at < 0) return null;
  for (let i = at - 1; i >= 0; i--) if (lines[i]!.trim() !== "") return lines[i]!;
  return "";
}

describe("component doc comments", () => {
  it("reads a real inventory", () => {
    expect(pinned.length).toBeGreaterThan(100);
  });

  it("every synced component has its doc comment directly above its export", () => {
    const orphaned = pinned.filter(([name, file]) => !lineAbove(readFileSync(file, "utf8"), name)?.trimEnd().endsWith("*/"));
    expect(orphaned.map(([name, file]) => `${name} (${file})`)).toEqual([]);
  });
});
