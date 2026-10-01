import { describe, expect, it } from "vitest";
import { METRIC_SHAPES, motionShapes } from "@/lib/engine/catalog-shape";
import { EN, FR } from "@/lib/engine/__tests__/props";
import { emptyState, exampleState, measured, ratio, withEntry } from "@/lib/engine/__tests__/fixtures";
import { SHARED_COUNTS } from "@/lib/engine/shared-counts";
import type { EngineState, MetricId } from "@/lib/engine/types";
import { readTable, separatorOf, tablePreview, tableTemplate, type TableRow } from "../csv";

/**
 * « Saisie en tableau » (engine spec §19.6, C32 Q11, A14 T5): the engine's
 * template, to the character, and what a pasted table would write — shown
 * row by row before anything is.
 */

const NOW = "2026-10-01T12:00:00.000Z";
const PLG = METRIC_SHAPES;

function preview(text: string, state: EngineState = exampleState(), locale: "en" | "fr" = "en") {
  const props = locale === "en" ? EN : FR;
  return tablePreview(text, state, motionShapes(state.setup.motions), props.metrics, props.strings, locale, NOW);
}

const rowOf = (rows: TableRow[], id: MetricId) => rows.find((r) => r.id === id);
const lines = (text: string) => text.split("\r\n");

describe("the template", () => {
  it("one line per number of the ticked motions, its found values filled, in English with « , »", () => {
    const t = lines(tableTemplate(exampleState(), PLG, EN.metrics, EN.strings, "en"));
    expect(t[0]).toBe("id,number,stage,numerator,denominator,value,unit,source");
    expect(t).toHaveLength(PLG.length + 2);
    expect(t[t.length - 1]).toBe("");
    expect(t[1]).toBe("acq.signup-rate,Sign-up rate,Acquisition,820,26000,,%,GA4");
    // A person's source is the role's name; money says its sign.
    expect(t.find((l) => l.startsWith("acq.cac,"))).toBe("acq.cac,CAC,Acquisition,21000,42,,€,Finance");
    // An estimate or a cause is the sheet's: blank.
    expect(t.find((l) => l.startsWith("act.ttv,"))).toBe("act.ttv,Median time to value,Activation,,,,days,");
    expect(t.find((l) => l.startsWith("ret.d30,"))).toBe("ret.d30,Day-30 retention,Retention,,,,%,");
  });

  it("in French: « ; », the decimal comma, the French words", () => {
    const state = withEntry(exampleState(), "acq.top-channel-share", measured({ kind: "rate", percent: 12.5 }, { kind: "tool", tool: "ga4" }));
    const t = lines(tableTemplate(state, PLG, FR.metrics, FR.strings, "fr"));
    expect(separatorOf("fr")).toBe(";");
    expect(t[0]).toBe("id;chiffre;étape;numérateur;dénominateur;valeur;unité;source");
    expect(t.find((l) => l.startsWith("acq.top-channel-share;"))).toBe("acq.top-channel-share;Part du premier canal;Acquisition;;;12,5;%;GA4");
    expect(t.find((l) => l.startsWith("acq.cac;"))).toBe("acq.cac;CAC;Acquisition;21000;42;;€;Finance");
  });

  it("a cell holding the separator or a quote is quoted, its quotes doubled", () => {
    const state = withEntry(exampleState(), "act.rate", measured(ratio(144, 800), { kind: "tool", tool: "cs-platform" }));
    const t = lines(tableTemplate(state, PLG, EN.metrics, EN.strings, "en"));
    expect(t.find((l) => l.startsWith("act.rate,"))).toBe('act.rate,Activation rate,Activation,144,800,,%,"Customer success platform (Gainsight, Vitally, Planhat…)"');
    const fr = lines(tableTemplate(exampleState(), PLG, FR.metrics, FR.strings, "fr"));
    // « Ce que « en production » veut dire » is sales-assisted; self-serve's names hold no « ; ».
    expect(fr.every((l) => !l.includes('"'))).toBe(true);
  });

  /** The security review of A14 T5: a count a file carried as text must never reach a spreadsheet as a formula. */
  it("no cell a spreadsheet would run: a count that is not a number is left blank, a formula-like cell is text", () => {
    const state = withEntry(exampleState(), "act.rate", measured({ kind: "ratio", numerator: '=HYPERLINK("https://x.example")' as unknown as number, denominator: 800 }));
    const row = lines(tableTemplate(state, PLG, EN.metrics, EN.strings, "en")).find((l) => l.startsWith("act.rate,"));
    expect(row).toBe("act.rate,Activation rate,Activation,,800,,%,GA4");
    // A negative amount stays a number; a cell that only looks like a formula is quoted as text.
    const negative = withEntry(exampleState(), "rev.gross-margin", measured({ kind: "ratio", numerator: -1200, denominator: 48_000 }, { kind: "tool", tool: "stripe" }));
    expect(lines(tableTemplate(negative, PLG, EN.metrics, EN.strings, "en")).find((l) => l.startsWith("rev.gross-margin,"))).toBe("rev.gross-margin,Gross margin,Revenue,-1200,48000,,%,Stripe");
    // No word of ours starts like a formula today; one that did would still be written as text.
    const strings = { ...EN.strings, tools: { ...EN.strings.tools, ga4: "=cmd|' /C calc'!A0" } };
    expect(lines(tableTemplate(exampleState(), PLG, EN.metrics, strings, "en"))[1]).toBe("acq.signup-rate,Sign-up rate,Acquisition,820,26000,,%,'=cmd|' /C calc'!A0");
  });

  it("read back, the template writes nothing: every row unchanged or empty", () => {
    for (const [locale, props] of [["en", EN], ["fr", FR]] as const) {
      const state = exampleState();
      const p = preview(tableTemplate(state, PLG, props.metrics, props.strings, locale), state, locale);
      expect(p.rows.every((r) => r.kind === "same")).toBe(true);
      expect(p.count).toBe(0);
      expect(p.following).toEqual([]);
      expect(p.snapshot).toBe(state.snapshots[0]);
      expect(p.rows.length + p.empty).toBe(PLG.length);
    }
  });
});

describe("reading a pasted table", () => {
  it("a spreadsheet's tabs, a CSV's « ; » or « , », quotes, a byte-order mark, line breaks and blank lines", () => {
    expect(readTable("a\tb\tc\r\n1\t2,5\t3\n")).toEqual([["a", "b", "c"], ["1", "2,5", "3"]]);
    expect(readTable("﻿a;b\n\n1;\"x;y\"\n")).toEqual([["a", "b"], ["1", "x;y"]]);
    expect(readTable('a,b\n"say ""hi""","two\nlines"')).toEqual([["a", "b"], ['say "hi"', "two\nlines"]]);
    expect(readTable("a,b\n1,2")).toEqual([["a", "b"], ["1", "2"]]);
  });
});

describe("the preview", () => {
  it("a changed row says what it replaces, and keeps the number's source", () => {
    const state = exampleState();
    const before = state.snapshots[0]!.metrics["acq.signup-rate"]!;
    const p = preview("id,number,stage,numerator,denominator,value,unit,source\nacq.signup-rate,Sign-up rate,Acquisition,820,27000,,%,GA4\n", state);
    expect(p.rows).toEqual([
      { line: 2, kind: "changed", id: "acq.signup-rate", before, entry: { status: "measured", value: ratio(820, 27_000), source: { kind: "tool", tool: "ga4" }, updatedAt: NOW } },
    ]);
    expect(p.count).toBe(1);
    expect(p.snapshot.metrics["acq.signup-rate"]?.value).toEqual(ratio(820, 27_000));
    // The visitors are this number's alone: nothing else in the month moved.
    expect({ ...p.snapshot.metrics, "acq.signup-rate": before }).toEqual(state.snapshots[0]!.metrics);
  });

  it("rows matched by name, columns by the header's words, in any order; no source is the spreadsheet", () => {
    const p = preview("number\tnumerator\tdenominator\tsource\nViral coefficient (K)\t12\t800\t\n");
    // K was only asked for: a new number.
    expect(rowOf(p.rows, "ref.k-factor")).toMatchObject({ kind: "new", entry: { value: ratio(12, 800), source: { kind: "tool", tool: "spreadsheet" } } });
  });

  it("a template downloaded in the other language is read in the template's order, never as empty", () => {
    // The page holds one language's words: English headers on the French page match none but « id ».
    const p = preview("id,number,stage,numerator,denominator,value,unit,source\nref.k-factor,Viral coefficient (K),Referral,12,800,,,Mixpanel\n", exampleState(), "fr");
    expect(p.rows).toHaveLength(1);
    expect(rowOf(p.rows, "ref.k-factor")).toMatchObject({ kind: "new", line: 2, entry: { value: ratio(12, 800) } });
  });

  it("no header: the template's column order", () => {
    const p = preview("ref.k-factor,Viral coefficient (K),Referral,12,800,,,Mixpanel");
    expect(rowOf(p.rows, "ref.k-factor")).toMatchObject({ kind: "new", line: 1, entry: { source: { kind: "tool", tool: "mixpanel" } } });
  });

  it("a value alone is a rate or an amount, in the page's language", () => {
    const fr = preview("id;chiffre;étape;numérateur;dénominateur;valeur;unité;source\nacq.top-channel-share;;;;;12,5 %;%;GA4\nrev.arpa;;;;;1 250,50;€;Stripe\n", exampleState(), "fr");
    expect(rowOf(fr.rows, "acq.top-channel-share")).toMatchObject({ kind: "changed", entry: { value: { kind: "rate", percent: 12.5 } } });
    expect(rowOf(fr.rows, "rev.arpa")).toMatchObject({ kind: "changed", entry: { value: { kind: "amount", amount: 1250.5 } } });
  });

  it("a number with a closed list keeps its choice, or goes back to its sheet", () => {
    // The example's CAC has its variant: a pasted CAC keeps it.
    const kept = preview("acq.cac,CAC,Acquisition,24000,40,,€,Finance");
    expect(rowOf(kept.rows, "acq.cac")).toMatchObject({ kind: "changed", entry: { variant: "media-only", source: { kind: "person", role: "finance" } } });
    // A month with no CAC yet has no variant to keep.
    expect(rowOf(preview("acq.cac,CAC,Acquisition,24000,40,,€,Finance", emptyState()).rows, "acq.cac")).toMatchObject({ kind: "refused", reason: "sheet" });
  });

  it("a duration keeps its statistic, and reads its unit from the row", () => {
    const state = withEntry(exampleState(), "act.ttv", measured({ kind: "duration", value: 2, unit: "days", statistic: "median" }, { kind: "tool", tool: "amplitude" }));
    expect(rowOf(preview("act.ttv,,,,,36,hours,Amplitude", state).rows, "act.ttv")).toMatchObject({
      kind: "changed",
      entry: { value: { kind: "duration", value: 36, unit: "hours", statistic: "median" } },
    });
    // No duration yet: hours or days and the median or the mean are the sheet's to choose.
    expect(rowOf(preview("act.ttv,,,,,36,hours,Amplitude").rows, "act.ttv")).toMatchObject({ kind: "refused", reason: "sheet" });
  });

  it("each refusal says why, and nothing refused is written", () => {
    const text = [
      "made.up,Made-up rate,,1,2,,,",
      "slg.rev.win-rate,Win rate,,10,40,,,",
      "act.rate,,,abc,800,,,",
      "ret.logo-churn,,,12,,,,",
      "rev.paid-conversion,,,12,0,,,",
      "acq.signup-rate,,,-5,100,,,",
      "acq.top-channel-share,,,,,120,,",
      "act.event,,,,,created a project,,",
      "ref.mechanism,,,,,1,,",
      "ref.k-factor,,,,,0.03,,",
      "ret.d30,,,900,800,,,",
      "ret.d30,,,300,800,,,",
    ].join("\n");
    const p = preview(text);
    expect(p.rows.map((r) => (r.kind === "refused" ? `${r.line}:${r.reason}` : `${r.line}:${r.kind}`))).toEqual([
      "1:unknown",
      "2:hidden",
      "3:unreadable",
      "4:incomplete",
      "5:denominator-zero",
      "6:negative",
      "7:percent-range",
      "8:text",
      "9:sheet",
      "10:incomplete",
      "11:num-gt-den",
      "12:duplicate",
    ]);
    expect(p.rows[0]).toMatchObject({ id: null, label: "Made-up rate" });
    expect(p.count).toBe(0);
    expect(p.snapshot.metrics).toEqual(exampleState().snapshots[0]!.metrics);
  });

  it("a shared count must say the same on every row: the later row is refused, naming the earlier", () => {
    const p = preview("act.rate,,,144,800,,,Amplitude\nret.d30,,,300,790,,,Amplitude\n");
    expect(rowOf(p.rows, "ret.d30")).toMatchObject({ kind: "refused", reason: "shared", other: "act.rate" });
    expect(p.snapshot.metrics["ret.d30"]).toEqual(exampleState().snapshots[0]!.metrics["ret.d30"]);
  });

  it("a number the table moves through a shared count, without a row of its own, is listed", () => {
    const state = exampleState();
    const p = preview("act.rate,,,144,810,,,Amplitude\n", state);
    const carriers = SHARED_COUNTS.cohortSignups
      .map((slot) => slot.metric)
      .filter((id) => id !== "act.rate" && state.snapshots[0]!.metrics[id]?.value?.kind === "ratio");
    expect(carriers.length).toBeGreaterThan(0);
    expect(p.following.map((f) => f.id).sort()).toEqual([...carriers].sort());
    for (const f of p.following) expect(f.after.value).toMatchObject({ denominator: 810 });
    expect(p.snapshot.base?.cohortSignups).toBe(810);
  });

  it("the source column: a tool by id or name, a role, someone, anything else « Autre »", () => {
    const src = (cell: string) => (rowOf(preview(`act.rate,,,150,800,,,${cell}`).rows, "act.rate") as { entry: { source: unknown } }).entry.source;
    expect(src("stripe")).toEqual({ kind: "tool", tool: "stripe" });
    expect(src("Customer success platform")).toEqual({ kind: "tool", tool: "cs-platform" });
    expect(src("finance")).toEqual({ kind: "person", role: "finance" });
    // « Someone » names no role: the number's usual one, which the sheet would offer too.
    expect(src("Someone gave it to me")).toEqual({ kind: "person", role: "data" });
    expect(src("Zapier")).toEqual({ kind: "other" });
  });

  it("the denominator's own source holds only while the row keeps the number's source", () => {
    const split = measured(ratio(144, 800), { kind: "tool", tool: "amplitude" }, { denominatorSource: { kind: "tool", tool: "ga4" } });
    const state = withEntry(exampleState(), "act.rate", split);
    const same = rowOf(preview("act.rate,,,150,800,,,Amplitude", state).rows, "act.rate") as { entry: { denominatorSource?: unknown } };
    expect(same.entry.denominatorSource).toEqual({ kind: "tool", tool: "ga4" });
    const other = rowOf(preview("act.rate,,,150,800,,,Mixpanel", state).rows, "act.rate") as { entry: { denominatorSource?: unknown } };
    expect(other.entry.denominatorSource).toBeUndefined();
  });

  it("the empty lines of the template are counted, never listed", () => {
    const p = preview("id,number\nact.rate,Activation rate,,,,,,\nret.d30,,,,,,,\n");
    expect(p.rows).toEqual([]);
    expect(p.empty).toBe(2);
  });
});
