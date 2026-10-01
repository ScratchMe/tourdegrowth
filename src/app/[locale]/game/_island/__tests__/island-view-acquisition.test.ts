import { describe, expect, it } from "vitest";
import { ACQUISITION_CONTENT } from "@/content/game/acquisition";
import { ENDING_PATHS, PATH_A, PATH_C, PATH_D, playPath, type Id, type Path } from "@/lib/game/__tests__/paths-acquisition";
import { resolveLevelCopy, type AcquisitionCopy } from "@/lib/game/copy";
import { formatEur } from "@/lib/game/format";
import { ACQUISITION_LEVEL } from "@/lib/game/levels/acquisition";
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
 * builders on level 2, « Comment les gens vous trouvent », written before any
 * page played it (A12.f wired it). A builder that still assumed churn — a « % » on a count of customers,
 * a gap in points, a curve ticked in percent — fails here before a player
 * could read it.
 */

const NBSP = " ";
const L = ACQUISITION_LEVEL;
const reduce = gameReducer(L);

const contexts: IslandContext[] = LOCALES.map((locale: Locale) =>
  islandContext(L, resolveLevelCopy<AcquisitionCopy>(ACQUISITION_CONTENT, locale), locale),
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

describe("the shared island on level 2 — every screen of every ending, in both languages", () => {
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
            check(`${label} share`, shareText(ctx, state, "https://www.tourdegrowth.com/fr/game/acquisition"));
          }
        }
        expect(found).toEqual([]);
      });
    }
  }

  it("never prints the level's number as a rate: no « % » and no « pt » next to new customers", () => {
    const year = playPath(PATH_A);
    const last = year.at(-1)!;
    for (const ctx of contexts) {
      const texts = [
        dashboardProps(ctx, last, lastQuarterStart(L, last), "shown").metric,
        timelineSegments(ctx, last),
        ...last.log.map((_, q) => reportContent(ctx, last, q).figures[0]),
        decemberContent(ctx, last).figures.metric,
        decemberContent(ctx, last).metricChart,
      ].flatMap((v) => strings(v).map((s) => s.text));
      expect(texts.filter((t) => /%|\bpts?\b/.test(t))).toEqual([]);
    }
  });
});

describe("level 2's number, as the island prints it", () => {
  const yearA = playPath(PATH_A);
  const endA = yearA.at(-1)!;

  it("shows new customers to the ten, with French digit groups", () => {
    const start = dashboardProps(fr, yearA[0]!, undefined, "hidden");
    expect(start.metric.value).toBe(`2${NBSP}000`);
    expect(start.metric.sub).toBe(`objectif du trimestre : 2${NBSP}150`.replace(" :", `${NBSP}:`));
    expect(dashboardProps(en, yearA[0]!, undefined, "hidden").metric.value).toBe("2,000");
    // §17.6 A: 2 100 at the end of the first quarter, 3 000 in December.
    expect(timelineSegments(fr, endA)[0]!.result?.value).toBe(`2${NBSP}100`);
    expect(decemberContent(fr, endA).figures.metric).toBe(`3${NBSP}000`);
  });

  it("says a missed quarter in customers, never in points, and never « 0 »", () => {
    // §17.6 D: 1 980 against 2 150 in the first quarter.
    const endD = playPath(PATH_D).at(-1)!;
    const status = reportContent(fr, endD, 0).figures[0]!.status!;
    expect(status.tone).toBe("bad");
    expect(status.text).toMatch(new RegExp(`^manqué de \\d+(${NBSP}\\d{3})?${NBSP}clients$`));
    expect(reportContent(en, endD, 0).figures[0]!.status!.text).toMatch(new RegExp(`^missed by [\\d,]+${NBSP}customers$`));
  });

  it("explains a quarter's move in tens of customers, and the lines add up to the tile's move", () => {
    for (const q of [0, 1, 2, 3]) {
      const report = reportContent(en, endA, q);
      const total = Number(report.drivers.heading.match(/: ([+−-]?[\d,]+)$/)![1]!.replace(/,/g, "").replace("−", "-"));
      const lines = report.drivers.lines.map((l) => Number(l.match(/: ([+−-]?[\d,]+)$/)![1]!.replace(/,/g, "").replace("−", "-")));
      for (const n of [total, ...lines]) expect(Math.abs(n % 10)).toBe(0);
      expect(lines.reduce((a, b) => a + b, 0)).toBe(total);
      const shown = (s: string) => Number(s.replace(/,/g, ""));
      const before = q === 0 ? 2_000 : shown(reportContent(en, endA, q - 1).figures[0]!.value);
      expect(total).toBe(shown(report.figures[0]!.value) - before);
    }
  });

  it("draws December's curve in customers: ticks, the board's line, and the curve ending on the cell", () => {
    const d = decemberContent(fr, endA);
    expect(d.metricChart.ticks).toEqual(d.view.metric.scale.ticks.map((t) => t.toLocaleString("fr-FR").replace(/ /g, NBSP)));
    expect(d.metricChart.reference).toBe(`objectif 3${NBSP}000`);
    expect(d.metricChart.ariaLabel).toContain(d.figures.metric);
    expect(d.rows).toHaveLength(12);
  });

  it("stamps an inspection as a criminal settlement of 150 000 €, never a fine", () => {
    const endC = playPath(PATH_C).at(-1)!;
    const q = endC.log.findIndex((log) => log.events.some((e) => e.kind === "control"));
    expect(q).toBe(2);
    for (const ctx of [fr, en]) {
      const clip = newsContent(ctx, endC, q).items.find((i) => i.kind === "clipping" && i.clipping.kind === "control");
      if (clip?.kind !== "clipping") throw new Error("no inspection on the news screen");
      const stamp = ctx.locale === "fr" ? `Transaction · ${formatEur("fr", 150_000)}` : `Settlement · ${formatEur("en", 150_000)}`;
      expect(clip.clipping.stamp).toEqual({ text: stamp, tone: "bad" });
    }
  });

  it("asks for its own orders, in the CEO's words", () => {
    // §17.6 A refuses three orders; the first, in the second quarter, is the stock badge.
    const atQ2 = yearA[1]!;
    expect(atQ2.order).toBe("stock");
    expect(bossMessage(fr, atQ2)).toContain(fr.copy.orders.stock!);
  });
});
