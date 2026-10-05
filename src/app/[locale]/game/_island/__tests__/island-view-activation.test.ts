import { describe, expect, it } from "vitest";
import { ACTIVATION_CONTENT } from "@/content/game/activation";
import { ENDING_PATHS, PATH_A, PATH_C, PATH_D, playPath, type Id, type Path } from "@/lib/game/__tests__/paths-activation";
import { resolveLevelCopy, type ActivationCopy } from "@/lib/game/copy";
import { formatEur } from "@/lib/game/format";
import { ACTIVATION_LEVEL } from "@/lib/game/levels/activation";
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
 * builders on level 3, « Comment ils comprennent ce que vous apportez »,
 * written before any page played it (A24 ACT-3 wired it). The level's number
 * is a rate again, as on level 1, but it goes UP, as on level 2: a builder
 * that still assumed churn — a gap read the wrong way, a curve ticked for a
 * number going down — or customers — « clients » next to a rate — fails here
 * before a player could read it.
 *
 * Non-vacuity (TESTING.md §1.1, 2026-10-05, each sabotage applied then
 * restored, the file compared with its backup after): the level's display kind
 * switched to "count", or to "ratio", fails the same 6 of the 22 tests (the
 * rate with its unit, the tenths, the four quarters, the miss in points, the
 * drivers, December's curve); the board's last target moved to 46 % fails 1
 * (December's curve reference); the second and third orders swapped fails 1
 * (the CEO's orders). The 14 « every screen of every ending » tests move with
 * none of them, rightly: they read for placeholders, not for values.
 */

const NBSP = " ";
const L = ACTIVATION_LEVEL;
const reduce = gameReducer(L);

const contexts: IslandContext[] = LOCALES.map((locale: Locale) =>
  islandContext(L, resolveLevelCopy<ActivationCopy>(ACTIVATION_CONTENT, locale), locale),
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

describe("the shared island on level 3 — every screen of every ending, in both languages", () => {
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
            check(`${label} share`, shareText(ctx, state, "https://www.tourdegrowth.com/fr/game/activation"));
          }
        }
        expect(found).toEqual([]);
      });
    }
  }

  it("prints the level's number as a rate, in its own unit: a « % » on the tile, the timeline, the report and December, never « clients »", () => {
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
      // The figures themselves carry their « % »: the tile, each quarter's result, December's cell.
      const values = [
        dashboardProps(ctx, last, lastQuarterStart(L, last), "shown").metric.value,
        ...timelineSegments(ctx, last).slice(0, 4).map((s) => s.result?.value ?? ""),
        decemberContent(ctx, last).figures.metric,
      ];
      expect(values).toHaveLength(6);
      for (const value of values) expect(value, ctx.locale).toMatch(ctx.locale === "fr" ? /\d\u00a0%$/ : /\d%$/);
    }
  });
});

describe("level 3's number, as the island prints it", () => {
  const yearA = playPath(PATH_A);
  const endA = yearA.at(-1)!;

  it("shows the activation rate to the tenth of a point, with its unit and the French no-break space", () => {
    const start = dashboardProps(fr, yearA[0]!, undefined, "hidden");
    expect(start.metric.value).toBe(`30,0${NBSP}%`);
    expect(start.metric.sub).toBe(`objectif du trimestre${NBSP}: 32,3${NBSP}%`);
    expect(dashboardProps(en, yearA[0]!, undefined, "hidden").metric.value).toBe("30.0%");
    expect(dashboardProps(en, yearA[0]!, undefined, "hidden").metric.sub).toBe("quarter target: 32.3%");
  });

  it("closes each quarter of the reference year A on the rate the spec gives (§18.6), and December at 45,0 %", () => {
    // §18.6 A: 31,5 · 32,4 · 39,8 · 45,0.
    // The fifth segment is December itself, with no quarter result.
    expect(timelineSegments(fr, endA).slice(0, 4).map((s) => s.result?.value)).toEqual(
      ["31,5", "32,4", "39,8", "45,0"].map((v) => `${v}${NBSP}%`),
    );
    expect(timelineSegments(en, endA).slice(0, 4).map((s) => s.result?.value)).toEqual(["31.5%", "32.4%", "39.8%", "45.0%"]);
    expect(decemberContent(fr, endA).figures.metric).toBe(`45,0${NBSP}%`);
    expect(decemberContent(en, endA).figures.metric).toBe("45.0%");
  });

  it("says a missed quarter in points, never in customers, and never « 0 »", () => {
    // §18.6 D: 29,7 % against 32,3 % in the first quarter.
    const endD = playPath(PATH_D).at(-1)!;
    const status = reportContent(fr, endD, 0).figures[0]!.status!;
    expect(status.tone).toBe("bad");
    expect(status.text).toBe(`manqué de 2,6${NBSP}pt`);
    expect(reportContent(en, endD, 0).figures[0]!.status!.text).toBe(`missed by 2.6${NBSP}pts`);
  });

  it("explains a quarter's move in points, and the lines add up to the tile's move", () => {
    const points = (s: string) => Number(s.match(/([+−-]?\d+[.,]\d)\u00a0pts?$/)![1]!.replace(",", ".").replace("−", "-"));
    for (const q of [0, 1, 2, 3]) {
      const report = reportContent(en, endA, q);
      const total = points(report.drivers.heading);
      const lines = report.drivers.lines.map(points);
      expect(Math.round(lines.reduce((a, b) => a + b, 0) * 10)).toBe(Math.round(total * 10));
      const shown = (s: string) => Number(s.replace("%", ""));
      const before = q === 0 ? 30 : shown(reportContent(en, endA, q - 1).figures[0]!.value);
      expect(Math.round(total * 10)).toBe(Math.round((shown(report.figures[0]!.value) - before) * 10));
    }
  });

  it("draws December's curve in percent: ticks, the board's line, and the curve ending on the cell", () => {
    const d = decemberContent(fr, endA);
    expect(d.metricChart.ticks).toEqual(["15", "30", "45", "60"].map((t) => `${t}${NBSP}%`));
    expect(d.metricChart.reference).toBe(`objectif 45,0${NBSP}%`);
    expect(d.metricChart.ariaLabel).toContain(d.figures.metric);
    expect(d.rows).toHaveLength(12);
  });

  it("stamps an inspection as an administrative fine of 100 000 €, from the CNIL's sanctions committee", () => {
    const endC = playPath(PATH_C).at(-1)!;
    const q = endC.log.findIndex((log) => log.events.some((e) => e.kind === "control"));
    expect(q).toBe(2);
    for (const ctx of [fr, en]) {
      const clip = newsContent(ctx, endC, q).items.find((i) => i.kind === "clipping" && i.clipping.kind === "control");
      if (clip?.kind !== "clipping") throw new Error("no inspection on the news screen");
      const fine = formatEur(ctx.locale, 100_000);
      const stamp = ctx.locale === "fr" ? `Amende · ${fine}` : `Fined · ${fine}`;
      expect(clip.clipping.stamp).toEqual({ text: stamp, tone: "bad" });
      expect(clip.clipping.text).toContain(fine);
      expect(clip.clipping.text).toContain("CNIL");
    }
  });

  it("asks for its own orders, in the CEO's words", () => {
    // §18.6 A refuses three orders; the first, in the second quarter, is the permissions screen.
    const atQ2 = yearA[1]!;
    expect(atQ2.order).toBe("bundle");
    expect(bossMessage(fr, atQ2)).toContain(fr.copy.orders.bundle!);
    expect(bossMessage(en, atQ2)).toContain(en.copy.orders.bundle!);
  });
});
