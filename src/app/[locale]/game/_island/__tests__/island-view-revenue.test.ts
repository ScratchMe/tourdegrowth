import { describe, expect, it } from "vitest";
import { REVENUE_CONTENT } from "@/content/game/revenue";
import { ENDING_PATHS, PATH_A, PATH_C, PATH_D, playPath, type Id, type Path } from "@/lib/game/__tests__/paths-revenue";
import { resolveLevelCopy, type RevenueCopy } from "@/lib/game/copy";
import { formatEur, formatInt } from "@/lib/game/format";
import { REVENUE_LEVEL } from "@/lib/game/levels/revenue";
import { lastQuarterStart, runFrame } from "@/lib/game/phases";
import { gameReducer } from "@/lib/game/reducer";
import type { GameState } from "@/lib/game/types";
import { monthFrames } from "@/lib/game/view";
import { LOCALES, type Locale } from "@/lib/i18n/locale";
import {
  bossMessage,
  dashboardProps,
  decemberContent,
  handView,
  islandContext,
  journalEntries,
  newsContent,
  quarterEndAnnouncement,
  reportContent,
  resumeContent,
  shareText,
  timelineSegments,
  yearClosedView,
  type IslandContext,
} from "../island-view";

/**
 * The island is the same for every level (CHANTIERS.md A12.d): this runs its
 * builders on level 5, « Comment vous gagnez de l'argent » (Gainix), written
 * before any page played it (A24 REV-3 wired it). The level's number is
 * euros to the cent (revenue per user), and it goes UP, as on levels 2 and 4:
 * a builder that still assumed churn — a gap read the wrong way, a curve
 * ticked for a number going down — a rate — a « % » or a « pt » next to
 * euros — a coefficient — a bare « 4,30 » with no euro sign — or customers —
 * « clients » beside it — fails here before a player could read it.
 *
 * Non-vacuity (TESTING.md §1.1, 2026-10-06, each sabotage applied then
 * restored, the file compared with its backup after): see the journal entry
 * « A24, REV-3 ».
 */

const NBSP = "\u00a0";
const L = REVENUE_LEVEL;
const reduce = gameReducer(L);

const contexts: IslandContext[] = LOCALES.map((locale: Locale) =>
  islandContext(L, resolveLevelCopy<RevenueCopy>(REVENUE_CONTENT, locale), locale),
);
const fr = contexts.find((c) => c.locale === "fr")!;
const en = contexts.find((c) => c.locale === "en")!;

function strings(value: unknown, path = "$"): { path: string; text: string }[] {
  if (typeof value === "string") return [{ path, text: value }];
  if (value === null || typeof value !== "object") return [];
  if (Array.isArray(value)) return value.flatMap((item, i) => strings(item, `${path}[${i}]`));
  return Object.entries(value).flatMap(([key, child]) => strings(child, `${path}.${key}`));
}

function defects(value: unknown): string[] {
  return strings(value)
    .filter(({ text }) => /[{}]|undefined|NaN|\bnull\b/.test(text))
    .map(({ path, text }) => `${path}: ${text}`);
}

/** Each state the island can draw through a year: the call, the hand as cards are ticked, the months, the report. */
function screensOf(path: Path): { label: string; state: GameState<Id>; prev?: GameState<Id> }[] {
  const out: { label: string; state: GameState<Id>; prev?: GameState<Id> }[] = [];
  const years = playPath(path);
  for (const [i, start] of years.entries()) {
    out.push({ label: `q${i} call`, state: start, prev: lastQuarterStart(L, start) });
    if (start.over) continue;
    let s = reduce(start, { type: "hangup" });
    const picks = path[i];
    if (!picks) continue;
    for (const card of picks) {
      s = reduce(s, { type: "toggle", card });
      out.push({ label: `q${i} +${card}`, state: s, prev: lastQuarterStart(L, s) });
    }
    for (const point of monthFrames(s, years[i + 1]!)) out.push({ label: `q${i} m${point.m}`, state: runFrame(s, point) });
  }
  return out;
}

describe("the shared island on level 5 — every screen of every ending, in both languages", () => {
  for (const ctx of contexts) {
    for (const [name, path] of Object.entries(ENDING_PATHS)) {
      it(`${ctx.locale} · ${name}: no placeholder, undefined or NaN reaches the screen`, () => {
        const found: string[] = [];
        const check = (label: string, value: unknown) => found.push(...defects(value).map((d) => `${label} ${d}`));
        for (const { label, state, prev } of screensOf(path)) {
          check(`${label} boss`, bossMessage(ctx, state));
          check(`${label} dashboard`, dashboardProps(ctx, state, prev, "hidden"));
          check(`${label} timeline`, timelineSegments(ctx, state));
          check(`${label} hand`, handView(ctx, state, "pick"));
          check(`${label} journal`, journalEntries(ctx, state));
          check(`${label} resume`, resumeContent(ctx, state));
          state.log.forEach((_, q) => {
            check(`${label} report ${q}`, reportContent(ctx, state, q));
            check(`${label} news ${q}`, newsContent(ctx, state, q));
            check(`${label} announce ${q}`, quarterEndAnnouncement(ctx, state, q));
          });
          if (state.over) {
            check(`${label} december`, decemberContent(ctx, state));
            check(`${label} year closed`, yearClosedView(ctx, state));
            check(`${label} share`, shareText(ctx, state, "https://www.tourdegrowth.com/fr/game/revenue"));
          }
        }
        expect(found).toEqual([]);
      });
    }
  }

  it("prints the level's number as euros to the cent: no « % », no « pt », never « clients » on the tile, the timeline, the report and December", () => {
    const year = playPath(PATH_A);
    const last = year.at(-1)!;
    for (const ctx of contexts) {
      const shown = [
        dashboardProps(ctx, last, lastQuarterStart(L, last), "shown").metric,
        timelineSegments(ctx, last),
        ...last.log.map((_, q) => reportContent(ctx, last, q).figures[0]),
        decemberContent(ctx, last).figures.metric,
        decemberContent(ctx, last).metricChart,
      ].flatMap((v) => strings(v).map((s) => s.text));
      expect(shown.filter((t) => /\b(clients|customers)\b/i.test(t)), ctx.locale).toEqual([]);
      // The two figures the spec forbids (§20.12): « % » and « pt », in either language. « sept. » is not one.
      expect(shown.filter((t) => /%|\bpts?\b/.test(t)), ctx.locale).toEqual([]);
      // The figures themselves: the tile, each quarter's result, December's cell — digits, the decimal separator, two digits, the euro sign.
      const values = [
        dashboardProps(ctx, last, lastQuarterStart(L, last), "shown").metric.value,
        ...timelineSegments(ctx, last).slice(0, 4).map((s) => s.result?.value ?? ""),
        decemberContent(ctx, last).figures.metric,
      ];
      expect(values).toHaveLength(6);
      for (const value of values) expect(value, ctx.locale).toMatch(ctx.locale === "fr" ? /^\d,\d\d\u00a0€$/ : /^€\d\.\d\d$/);
    }
  });
});

describe("level 5's number, as the island prints it", () => {
  const yearA = playPath(PATH_A);
  const endA = yearA.at(-1)!;

  it("shows the revenue per user in euros to the cent, with the French no-break space before the euro sign and before the colon", () => {
    const start = dashboardProps(fr, yearA[0]!, undefined, "hidden");
    expect(start.metric.value).toBe(`4,00${NBSP}€`);
    expect(start.metric.sub).toBe(`objectif du trimestre${NBSP}: 4,30${NBSP}€`);
    expect(dashboardProps(en, yearA[0]!, undefined, "hidden").metric.value).toBe("€4.00");
    expect(dashboardProps(en, yearA[0]!, undefined, "hidden").metric.sub).toBe("quarter target: €4.30");
  });

  it("closes each quarter of the reference year A on the figure the spec gives (§20.6), and December at 6,01 €", () => {
    // §20.6 A: 4,20 · 4,32 · 5,31 · 6,01 €. The fifth segment is December itself, with no quarter result.
    expect(timelineSegments(fr, endA).slice(0, 4).map((s) => s.result?.value)).toEqual([`4,20${NBSP}€`, `4,32${NBSP}€`, `5,31${NBSP}€`, `6,01${NBSP}€`]);
    expect(timelineSegments(en, endA).slice(0, 4).map((s) => s.result?.value)).toEqual(["€4.20", "€4.32", "€5.31", "€6.01"]);
    expect(decemberContent(fr, endA).figures.metric).toBe(`6,01${NBSP}€`);
    expect(decemberContent(en, endA).figures.metric).toBe("€6.01");
  });

  it("closes the year C on the figures of §20.6 C — 4,62, 4,82, 4,64, then 1,93 € once the inspection has taken everything down", () => {
    const yearC = playPath(PATH_C);
    expect(timelineSegments(en, yearC.at(-1)!).slice(0, 4).map((s) => s.result?.value)).toEqual(["€4.62", "€4.82", "€4.64", "€1.93"]);
    expect(decemberContent(fr, yearC.at(-1)!).figures.metric).toBe(`1,93${NBSP}€`);
  });

  it("says a missed quarter in euros to the cent, and never « 0 »", () => {
    // §20.6 D: 3,96 € against 4,30 € in the first quarter.
    const endD = playPath(PATH_D).at(-1)!;
    const status = reportContent(fr, endD, 0).figures[0]!.status!;
    expect(status.tone).toBe("bad");
    expect(status.text).toBe(`manqué de 0,34${NBSP}€`);
    expect(reportContent(en, endD, 0).figures[0]!.status!.text).toBe("missed by €0.34");
  });

  it("explains a quarter's move in euros to the cent, and the lines add up to the tile's move", () => {
    const cents = (s: string) => Math.round(Number(s.match(/([+\u2212-])€(\d+\.\d\d)$/)!.slice(1).join("").replace("\u2212", "-")) * 100);
    const shown = (s: string) => Math.round(Number(s.replace("€", "")) * 100);
    for (const q of [0, 1, 2, 3]) {
      const report = reportContent(en, endA, q);
      const total = cents(report.drivers.heading);
      const lines = report.drivers.lines.map(cents);
      expect(lines.reduce((a, b) => a + b, 0)).toBe(total);
      const before = q === 0 ? 400 : shown(reportContent(en, endA, q - 1).figures[0]!.value);
      expect(total).toBe(shown(report.figures[0]!.value) - before);
    }
  });

  it("draws December's curve in euros: ticks 2 to 8 €, the board's line at 6,00 €, and the curve ending on the cell", () => {
    const d = decemberContent(fr, endA);
    expect(d.metricChart.ticks).toEqual([`2${NBSP}€`, `4${NBSP}€`, `6${NBSP}€`, `8${NBSP}€`]);
    expect(d.metricChart.reference).toBe(`objectif 6,00${NBSP}€`);
    expect(d.metricChart.ariaLabel).toContain(d.figures.metric);
    expect(d.rows).toHaveLength(12);
    const e = decemberContent(en, endA);
    expect(e.metricChart.ticks).toEqual(["€2", "€4", "€6", "€8"]);
    expect(e.metricChart.reference).toBe("target €6.00");
  });

  it("stamps an inspection « Contrôle · 375 000 € » — a settlement and a fine, never « Sanctions » — and counts the users who leave", () => {
    const endC = playPath(PATH_C).at(-1)!;
    const q = endC.log.findIndex((log) => log.events.some((e) => e.kind === "control"));
    expect(q).toBe(2);
    for (const ctx of [fr, en]) {
      const clip = newsContent(ctx, endC, q).items.find((i) => i.kind === "clipping" && i.clipping.kind === "control");
      if (clip?.kind !== "clipping") throw new Error("no inspection on the news screen");
      const fine = formatEur(ctx.locale, 375_000);
      const stamp = ctx.locale === "fr" ? `Contrôle · ${fine}` : `Inspection · ${fine}`;
      expect(clip.clipping.stamp).toEqual({ text: stamp, tone: "bad" });
      expect(clip.clipping.text).toContain(fine);
      expect(clip.clipping.text).toContain(ctx.locale === "fr" ? "transaction pénale" : "settlement");
      expect(clip.clipping.text).toContain(ctx.locale === "fr" ? "amende administrative" : "administrative fine");
      // §20.6 C: 2 738 users close their account.
      expect(clip.clipping.text).toContain(formatInt(ctx.locale, 2_738));
    }
  });

  it("asks for its own orders, in the CEO's words", () => {
    // §20.6 A refuses three orders; the first, in the second quarter, is the Coach+ add-on ticked in advance.
    const atQ2 = yearA[1]!;
    expect(atQ2.order).toBe("addon");
    expect(bossMessage(fr, atQ2)).toContain(fr.copy.orders.addon!);
    expect(bossMessage(en, atQ2)).toContain(en.copy.orders.addon!);
  });
});
