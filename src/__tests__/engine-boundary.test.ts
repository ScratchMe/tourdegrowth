import { describe, expect, it } from "vitest";
import {
  ENGINE_DECK_OPENED_EVENT,
  ENGINE_EXPORT_FORMATS,
  ENGINE_EXPORTED_EVENT,
  ENGINE_OPENED_EVENT,
  ENGINE_REQUEST_COPIED_EVENT,
  ENGINE_STAGE_SAVED_EVENT,
  ENGINE_STAGES,
  ENGINE_TOUR_LINKED_EVENT,
} from "@/lib/analytics/goatcounter";
import { BY_PATH, FILES, reachable, stripComments, valueImports } from "./helpers/import-graph";

/**
 * Engine spec §11.4 — the growth engine's boundary, rules 1-6.
 *
 * The promise the page makes in writing (D16) is that no number and no text
 * the user types leaves the browser. A canary spec proves it end to end
 * (`e2e/engine-canary.spec.ts`); these static rules make it hold for every
 * commit, and they fail a build instead of surviving as a comment:
 *
 * 1. Nothing under `lib/engine/` nor the engine's route imports Firebase,
 *    Gemini, the submissions layer, the audit instrument, the OG pipeline or
 *    the dictionary — and `lib/engine` imports no content VALUE at all: it is
 *    pure and browser-side, the page resolves copy and passes props.
 * 2. The island reaches none of that transitively, however many hops away —
 *    R2-14 found three separate paths that brought the dictionary back into
 *    a bundle after it had supposedly been taken out, none of them direct.
 * 3. No primitive that sends something somewhere is written in the engine's
 *    code — the request APIs, a form, and the ways a page makes the browser
 *    fetch a URL it built: an injected `<img>`/`<script>`/`<link>`/`<iframe>`,
 *    `new Image()`, a navigation, `window.open`. A static scan can only name
 *    what it knows; the promise itself is held by the canary spec, which
 *    records every request a real session makes.
 * 4. `html-to-image` is never imported statically, anywhere in `src/`: it is
 *    reached only by the deck's `import()` on the first export click (§10.3),
 *    so it lands in its own chunk and no page downloads it for nothing.
 * 5. Every analytics call in the engine goes through `trackEngine`, and every
 *    `trackEngine` names an event and a detail from the closed lists of
 *    `lib/analytics/goatcounter.ts` — never a number, never a label typed by
 *    someone (§11.6). An event path is a way out like any other.
 * 6. The rules are not vacuous: the island exists and the walk walks.
 *
 * The import graph is `helpers/import-graph.ts`, shared with the other walks:
 * value imports only (`import type` is erased by the compiler), and since the
 * engine's review (R21) a dynamic `import("x")` and a bare `import "x"` are
 * edges too — a guard that read `from "x"` alone could be walked around by
 * either.
 */
const ISLAND = "app/[locale]/aarrr-funnel-template/EngineWorkbench.tsx";
/**
 * The deck screen, walked from on its own too: the island mounts it, but a
 * walk that starts at the screen that renders every number the user typed
 * says so even if the island's wiring changes.
 */
const DECK = "app/[locale]/aarrr-funnel-template/_engine/deck/DeckView.tsx";
const PNG_EXPORT = "app/[locale]/aarrr-funnel-template/_engine/deck/export-png.ts";
const EVENTS_DOOR = "app/[locale]/aarrr-funnel-template/_engine/engine-events.ts";

/** The engine's shipped code: its pure library and its route. Tests are not shipped. */
const ENGINE = FILES.filter(
  (f) =>
    (f.path.startsWith("lib/engine/") || f.path.startsWith("app/[locale]/aarrr-funnel-template/")) &&
    !f.path.includes("__tests__/"),
);

const FORBIDDEN = [
  /^@\/lib\/firebase/,
  /^firebase(-admin)?(\/|$)/,
  /^@\/lib\/gemini/,
  /^@\/lib\/submissions/,
  /^@\/lib\/audit(\/|$)/,
  /^@\/content\/audit-catalog$/,
  /^@\/lib\/og(\/|$)/,
  /^@\/lib\/i18n\/dictionary$/,
];

/** Modules the island must never reach: content, and the scoring modules that pull the copy library in (§6). */
const UNREACHABLE = [
  /^content\//,
  /^lib\/scoring\/(score|questions|bottleneck|verdict|next-move)\.ts$/,
  /^app\/\[locale\]\/aarrr-funnel-template\/engine-props\.ts$/,
];

/**
 * Every specifier, type-only included — for the "never imported at all" rule.
 * `from "x"` read raw, plus the dynamic and bare forms read from code (R21):
 * `await import("@/lib/og")` must break rule 1 as surely as a static import.
 */
const ALL_IMPORTS = (source: string) => [
  ...[...source.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]!),
  ...[...stripComments(source).matchAll(/\bimport\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]!),
  ...[...stripComments(source).matchAll(/(?:^|\n|;)\s*import\s+["']([^"']+)["']/g)].map((m) => m[1]!),
];

/**
 * Rule 3's primitives. The request APIs, then the ways a page makes the
 * browser GET a URL it built (an element that loads its `src`/`href`, a
 * navigation, a new window). `createElement("a")` and `("textarea")` are not
 * here on purpose: the downloads and the clipboard fallback use them, and an
 * anchor loads nothing until someone clicks it — which is what a download
 * link is. `<a href>` to a glossary page is a link, not a carrier: its
 * address comes from the catalogue, never from what the person typed.
 */
const NETWORK = [
  /\bfetch\s*\(/,
  /\bXMLHttpRequest\b/,
  /\bsendBeacon\b/,
  /\bWebSocket\b/,
  /\bEventSource\b/,
  /<form[\s>]/i,
  /\bnew\s+Image\s*\(/,
  /createElement\(\s*["'`](img|script|link|iframe)["'`]\s*\)/,
  /<(img|script|iframe)[\s>/]/i,
  /\blocation\.(href|assign|replace)\b/,
  /\bwindow\.open\s*\(/,
];

/**
 * A floor on how much the walk from the island covers. The spec's rule 6 asks
 * for ≥ 10 once the screens exist. With the collection screens on the real
 * pure engine and P5's four visuals mounted, the walk measured 71 modules
 * (2026-09-25; 48 while P4 still ran on a stand-in barrel). The floor sits
 * under that so a refactor that merges a few files does not trip it, and far
 * over 10 so a walk that silently stops following the island's imports —
 * or an island that stops mounting the engine — goes red.
 */
const MIN_ISLAND_MODULES = 60;

/** What the island must reach by value: the pure engine that computes, and the four visuals that draw it. */
const ISLAND_MUST_REACH = [
  "lib/engine/derive.ts",
  "lib/engine/impact.ts",
  "lib/engine/deck.ts",
  "lib/engine/storage.ts",
  "app/[locale]/aarrr-funnel-template/_engine/Peloton.tsx",
  "app/[locale]/aarrr-funnel-template/_engine/Diagnosis.tsx",
  "app/[locale]/aarrr-funnel-template/_engine/WhatIf.tsx",
  "app/[locale]/aarrr-funnel-template/_engine/Mirror.tsx",
] as const;

/**
 * Rule 5's closed vocabulary, keyed by event: `null` when the event carries
 * no detail. Read from the shared lists, never retyped — the same lists the
 * dashboard asks GoatCounter for.
 */
const ENGINE_EVENTS: Record<string, readonly string[] | null> = {
  [ENGINE_OPENED_EVENT]: null,
  [ENGINE_REQUEST_COPIED_EVENT]: null,
  [ENGINE_DECK_OPENED_EVENT]: null,
  [ENGINE_TOUR_LINKED_EVENT]: null,
  [ENGINE_STAGE_SAVED_EVENT]: ENGINE_STAGES,
  [ENGINE_EXPORTED_EVENT]: ENGINE_EXPORT_FORMATS,
};

interface TrackCall {
  file: string;
  name: string | null;
  detail: string | null;
  raw: string;
}

/** The text between the `(` at `open` and its matching `)` — balanced, so a template's `${…}` cannot end it early. */
function argumentsAt(code: string, open: number): string {
  let depth = 0;
  for (let i = open; i < code.length; i += 1) {
    if (code[i] === "(") depth += 1;
    else if (code[i] === ")" && --depth === 0) return code.slice(open + 1, i);
  }
  return code.slice(open + 1);
}

/**
 * Every `trackEngine(…)` call in the engine's code (its declaration aside),
 * with its `name` and `detail` expressions. EVERY call is returned, parsed or
 * not: a regex that skipped calls it could not read would let exactly the
 * unusual ones — a template with braces in it — through unchecked.
 */
function trackEngineCalls(): TrackCall[] {
  return ENGINE.flatMap((f) => {
    const code = stripComments(f.source);
    return [...code.matchAll(/\btrackEngine\s*\(/g)]
      .filter((m) => !/function\s+$/.test(code.slice(0, m.index)))
      .map((m) => {
        const args = argumentsAt(code, m.index! + m[0].length - 1).trim();
        const object = /^\{([\s\S]*)\}$/.exec(args)?.[1] ?? null;
        return {
          file: f.path,
          name: object === null ? null : (/\bname:\s*("[^"]*"|[^,]+?)\s*(,|$)/.exec(object)?.[1]?.trim() ?? null),
          detail: object === null ? null : (/\bdetail:\s*([\s\S]+?)\s*(,\s*\w+:|$)/.exec(object)?.[1]?.trim() ?? null),
          raw: `trackEngine(${args.replace(/\s+/g, " ")})`,
        };
      });
  });
}

/**
 * What a `detail` may be. A string literal from the event's list; or a plain
 * identifier or member access (`stage`, `kind`, `shape.stage`), because
 * `trackEngine`'s parameter type binds the detail to the same lists and
 * `tsc` refuses anything else. What it may NOT be is anything that builds a
 * string at run time or silences the type: a template, a concatenation, a
 * cast, a call, a number.
 */
function detailProblem(detail: string, allowed: readonly string[]): string | null {
  const literal = /^"([^"]*)"$/.exec(detail);
  if (literal) return allowed.includes(literal[1]!) ? null : `"${literal[1]}" is not in the list`;
  if (/^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$/.test(detail)) return null;
  return `\`${detail}\` is not a literal from the list nor a typed identifier`;
}

describe("growth engine boundary (engine spec §11.4)", () => {
  it("rule 6 — the engine's code exists and the island is where the spec puts it", () => {
    expect(ENGINE.filter((f) => f.path.startsWith("lib/engine/")).length).toBeGreaterThanOrEqual(4);
    expect(BY_PATH.has(ISLAND), ISLAND).toBe(true);
    expect(BY_PATH.get(ISLAND)!, "the island must be a Client Component").toMatch(/^\s*["']use client["']/);
  });

  it("rule 6 — the walk follows value imports and ignores erased type-only ones", () => {
    // The page DOES resolve the copy on the server, through engine-props.ts:
    // if the walk can't find that chain, rule 2 below proves nothing.
    const fromPage = reachable("app/[locale]/aarrr-funnel-template/page.tsx");
    expect([...fromPage]).toContain("content/engine-copy.ts");
    expect([...fromPage]).toContain("content/engine-catalog.ts");
    // strings.ts names ENGINE_COPY's shape with `import type`: erased, not an edge.
    expect(BY_PATH.get("lib/engine/strings.ts")).toMatch(/import type \{ ENGINE_COPY \}/);
    expect([...reachable("lib/engine/strings.ts")]).not.toContain("content/engine-copy.ts");
    // And the island's own walk covers at least the floor.
    const walk = reachable(ISLAND);
    expect(walk.size).toBeGreaterThanOrEqual(MIN_ISLAND_MODULES);
    // The island computes with the REAL pure engine and mounts the real visuals — not a
    // stand-in barrel (P4 built against one while P1 was in flight; it is gone, and a new
    // one would make the board and the slides compute the same numbers two ways).
    for (const reached of ISLAND_MUST_REACH) expect([...walk], reached).toContain(reached);
  });

  /**
   * R21, the half a real file cannot show: the three import forms the walk
   * must follow, and the two it must not, on synthetic sources — so the
   * guard is proven to see a dynamic import of content even on a day when no
   * file in the tree has one.
   */
  it("rule 6 — a dynamic or bare import is an edge; a type-level or commented one is not", () => {
    expect(valueImports('const copy = await import("@/content/engine-copy");')).toContain("@/content/engine-copy");
    expect(valueImports('void import(\n  "@/content/engine-catalog"\n);')).toContain("@/content/engine-catalog");
    expect(valueImports('import "@/content/engine-copy";\nexport const x = 1;')).toContain("@/content/engine-copy");
    expect(valueImports('type T = typeof import("@/content/engine-copy");')).not.toContain("@/content/engine-copy");
    expect(valueImports('// await import("@/content/engine-copy")\n/* import "@/content/engine-copy" */')).toEqual([]);
    // And ALL_IMPORTS, rule 1's reader, sees the same two forms.
    expect(ALL_IMPORTS('await import("@/lib/og/fonts")')).toContain("@/lib/og/fonts");
    expect(ALL_IMPORTS('import "@/lib/i18n/dictionary";')).toContain("@/lib/i18n/dictionary");
  });

  it("rule 1 — nothing in the engine imports Firebase, Gemini, submissions, the audit instrument, the OG pipeline or the dictionary", () => {
    const offenders = ENGINE.flatMap((f) =>
      ALL_IMPORTS(f.source)
        .filter((spec) => FORBIDDEN.some((re) => re.test(spec)))
        .map((spec) => `${f.path} → ${spec}`),
    );
    expect(offenders).toEqual([]);
  });

  it("rule 1 — lib/engine imports no content value: it is pure, the page resolves copy and passes props", () => {
    const offenders = ENGINE.filter((f) => f.path.startsWith("lib/engine/")).flatMap((f) =>
      valueImports(f.source)
        .filter((spec) => spec.startsWith("@/content/"))
        .map((spec) => `${f.path} → ${spec}`),
    );
    expect(offenders).toEqual([]);
  });

  /**
   * Non-vacuity, measured when this rule was written: add
   * `import { ENGINE_COPY } from "@/content/engine-copy"` to the island and
   * this test names content/engine-copy.ts; import `./engine-props` instead
   * and it names engine-props.ts AND the three content modules behind it.
   * Since R21, `void import("@/content/engine-copy")` in the island fails it
   * the same way (measured 2026-09-25) — a dynamic import is still a chunk the
   * page downloads.
   */
  it("rule 2 — nothing the island (or the deck it mounts) reaches, at any depth, is content, a copy-pulling scoring module, or the server-side resolver", () => {
    expect(BY_PATH.get(DECK)!, "the deck screen must be a Client Component").toMatch(/^\s*["']use client["']/);
    // Non-vacuity: the deck's walk reaches its slides and its PNG export.
    const fromDeck = reachable(DECK);
    expect([...fromDeck]).toContain(PNG_EXPORT);
    expect([...fromDeck]).toContain("app/[locale]/aarrr-funnel-template/_engine/deck/SlidePeloton.tsx");
    const reached = [...reachable([ISLAND, DECK])];
    expect(reached.filter((p) => UNREACHABLE.some((re) => re.test(p))).sort()).toEqual([]);
  });

  /**
   * Non-vacuity, measured 2026-09-25: a `document.createElement("img")` in
   * the island fails this test on its own pattern, while the downloads'
   * `createElement("a")` and the clipboard fallback's `("textarea")` — both
   * already in the code — pass, as they should.
   */
  it("rule 3 — no primitive that sends something somewhere is written in the engine's code", () => {
    const offenders = ENGINE.flatMap((f) => {
      const code = stripComments(f.source);
      return NETWORK.filter((re) => re.test(code)).map((re) => `${f.path} → ${re}`);
    });
    expect(offenders).toEqual([]);
  });

  /**
   * Non-vacuity, measured when this rule was written: add
   * `import { toBlob } from "html-to-image";` to export-png.ts and the first
   * assertion names it; replace its `import("html-to-image")` with a static
   * import and the second one fails too — the guard can't pass by finding
   * no deck at all. The graph now also counts the dynamic import as an edge
   * (R21); that is consistent, not a contradiction: rule 4 is about WHICH
   * chunk carries the library, and only a static import puts it in the
   * island's first one.
   */
  it("rule 4 — html-to-image is never imported statically in src/, only through the deck's import() on click", () => {
    const staticImport =
      /(?:^|\n)\s*(?:import|export)\b[^;]*?from\s+["']html-to-image["']|\bimport\s+["']html-to-image["']|\brequire\(\s*["']html-to-image["']\s*\)/;
    const offenders = FILES.filter((f) => staticImport.test(stripComments(f.source))).map((f) => f.path);
    expect(offenders).toEqual([]);
    const dynamic = FILES.filter((f) => /\bimport\(\s*["']html-to-image["']\s*\)/.test(stripComments(f.source))).map((f) => f.path);
    expect(dynamic).toEqual([PNG_EXPORT]);
    // The walk agrees: the dynamic import IS a value edge of export-png.ts.
    expect(valueImports(BY_PATH.get(PNG_EXPORT)!)).toContain("html-to-image");
  });

  /**
   * Non-vacuity, measured 2026-09-25: a `trackEvent("engine_x")` written in
   * RequestCopy fails the first assertion; `detail: \`${1}\` as "json"` in the
   * island fails the third — and it is the case that first slipped through,
   * because a `{[^}]*}` regex could not read a template with braces in it and
   * silently skipped the call. Hence the balanced-parenthesis reader, which
   * returns every call, parsed or not. The door's own type is checked too,
   * so that a detail typed `string` (which `tsc` would then accept anywhere)
   * goes red here.
   */
  it("rule 5 — every analytics call goes through trackEngine, with an event and a detail from the closed lists", () => {
    const directCalls = ENGINE.filter((f) => f.path !== EVENTS_DOOR && /\btrackEvent\s*\(|\bgoatcounter\b/.test(stripComments(f.source))).map(
      (f) => f.path,
    );
    expect(directCalls, "only engine-events.ts may call trackEvent").toEqual([]);

    const calls = trackEngineCalls();
    // Non-vacuity: every event of the vocabulary is emitted somewhere (the deck's
    // exports arrive through the island's onExported, one call for four formats).
    expect(new Set(calls.map((c) => c.name?.replace(/"/g, ""))).size).toBe(Object.keys(ENGINE_EVENTS).length);

    const problems = calls.flatMap((call) => {
      const name = call.name && /^"([^"]*)"$/.exec(call.name)?.[1];
      if (!name || !(name in ENGINE_EVENTS)) return [`${call.file}: ${call.raw} — the name is not a literal of the closed list`];
      const allowed = ENGINE_EVENTS[name]!;
      if (allowed === null) return call.detail ? [`${call.file}: ${call.raw} — ${name} carries no detail`] : [];
      if (!call.detail) return [`${call.file}: ${call.raw} — ${name} needs a detail`];
      const problem = detailProblem(call.detail, allowed);
      return problem ? [`${call.file}: ${call.raw} — ${problem}`] : [];
    });
    expect(problems).toEqual([]);

    // The door binds each detail to its list at the type level.
    const door = BY_PATH.get(EVENTS_DOOR)!;
    expect(door).toMatch(/detail:\s*\(typeof ENGINE_STAGES\)\[number\]/);
    expect(door).toMatch(/detail:\s*\(typeof ENGINE_EXPORT_FORMATS\)\[number\]/);
    expect(door).not.toMatch(/detail\??:\s*string\b/);
  });

  it("the flag has one reader: only lib/engine/access.ts reads ENGINE_ENABLED", () => {
    const readers = FILES.filter(
      (f) => !f.path.includes("__tests__/") && /process\.env\.ENGINE_ENABLED|process\.env\[["']ENGINE_ENABLED["']\]/.test(f.source),
    ).map((f) => f.path);
    expect(readers).toEqual(["lib/engine/access.ts"]);
  });
});
