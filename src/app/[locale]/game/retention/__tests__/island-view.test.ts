import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ClickPill } from "@/components/game/ClickPill";
import { RETENTION_CONTENT } from "@/content/game/retention";
import { ENDING_PATHS, PATH_A, PATH_C, PATH_D, PATH_M, playPath } from "@/lib/game/__tests__/paths";
import { resolveLevelCopy, type RetentionCopy } from "@/lib/game/copy";
import { RETENTION_LEVEL, type RetentionCardId } from "@/lib/game/levels/retention";
import { handIds } from "@/lib/game/model";
import { lastQuarterStart, runFrame } from "@/lib/game/phases";
import { gameReducer } from "@/lib/game/reducer";
import type { GameState } from "@/lib/game/types";
import { clicksFor, clicksOverLaw, monthFrames, phoneIds } from "@/lib/game/view";
import { LOCALES, type Locale } from "@/lib/i18n/locale";
import {
  bossMessage,
  clicksLabel,
  closingMonth,
  clicksSentence,
  dashboardProps,
  decemberContent,
  handView,
  journalEntries,
  quarterEndAnnouncement,
  reportContent,
  resumeContent,
  shareText,
  timelineSegments,
  yearClosedView,
  type IslandContext,
} from "../island-view";

/**
 * X27's companion for the words: every screen of the island, built from every
 * state a reference year passes through, in both languages.
 *
 * `fill` throws on a placeholder it was not given, but a template can also
 * leave one behind if the copy names it and the island passes a DIFFERENT
 * set — or a builder can interpolate `undefined` straight into a sentence.
 * Both reach a player as « {churn} » or « undefined ». This walks the output
 * of each builder and fails on either, so the check covers what the screen
 * shows rather than what the templates declare.
 */

type Id = RetentionCardId;
type State = GameState<Id>;
const L = RETENTION_LEVEL;
const reduce = gameReducer(L);

const contexts: IslandContext[] = LOCALES.map((locale: Locale) => ({
  copy: resolveLevelCopy<RetentionCopy>(RETENTION_CONTENT, locale),
  locale,
}));

/** Every string anywhere under a value, with its path for the failure message. */
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

/** Each state the island can draw on the way through a year: the call, the hand with 0-2 cards, the months, the report. */
function screensOf(path: readonly (readonly [Id, Id])[]): { label: string; state: State; prev?: State }[] {
  const out: { label: string; state: State; prev?: State }[] = [];
  const years = playPath(path);
  for (const [i, start] of years.entries()) {
    out.push({ label: `q${i} call`, state: start, prev: lastQuarterStart(L, start) });
    if (start.over) continue;
    let s = reduce(start, { type: "hangup" });
    out.push({ label: `q${i} hand`, state: s, prev: lastQuarterStart(L, s) });
    const picks = path[i];
    if (!picks) continue;
    for (const card of picks) {
      s = reduce(s, { type: "toggle", card });
      out.push({ label: `q${i} +${card}`, state: s, prev: lastQuarterStart(L, s) });
    }
    const next = years[i + 1]!;
    for (const point of monthFrames(s, next)) out.push({ label: `q${i} m${point.m}`, state: runFrame(s, point) });
  }
  return out;
}

const PATHS = { ...ENDING_PATHS, obeysAll: PATH_C, cleaned: PATH_M, honest: PATH_A };

describe("island-view — every screen of every reference year, in both languages", () => {
  for (const ctx of contexts) {
    for (const [name, path] of Object.entries(PATHS)) {
      it(`${ctx.locale} · ${name}: no placeholder, undefined or NaN reaches the screen`, () => {
        const found: string[] = [];
        const check = (label: string, value: unknown) => found.push(...defects(value).map((d) => `${label} ${d}`));
        for (const { label, state, prev } of screensOf(path)) {
          check(`${label} boss`, bossMessage(ctx, state));
          check(`${label} dashboard`, dashboardProps(ctx, state, prev, false));
          check(`${label} timeline`, timelineSegments(ctx, state));
          for (const hint of ["callOpen", "pick", "ready"] as const) check(`${label} hand`, handView(ctx, state, hint));
          check(`${label} clicks`, clicksLabel(ctx, clicksFor(L, phoneIds(state))));
          check(`${label} clicks said`, clicksSentence(ctx, clicksFor(L, phoneIds(state))));
          check(`${label} journal`, journalEntries(ctx, state));
          check(`${label} resume`, resumeContent(ctx, state));
          state.log.forEach((_, q) => {
            check(`${label} report ${q}`, reportContent(ctx, state, q));
            check(`${label} announce ${q}`, quarterEndAnnouncement(ctx, state, q));
          });
          if (state.over) {
            check(`${label} december`, decemberContent(ctx, state));
            check(`${label} year closed`, yearClosedView(ctx, state));
            check(`${label} share`, shareText(ctx, state, "https://www.tourdegrowth.com/fr/game/retention"));
          }
        }
        expect(found).toEqual([]);
      });
    }
  }

  it("the walk reaches every ending and every kind of screen — otherwise the sweep above proves little", () => {
    const endings = new Set<string>();
    let reports = 0;
    let frames = 0;
    for (const path of Object.values(PATHS)) {
      for (const { label, state } of screensOf(path)) {
        if (state.ending) endings.add(state.ending);
        if (/ m\d+$/.test(label)) frames += 1;
        reports += state.log.length;
      }
    }
    expect([...endings].sort()).toEqual(Object.keys(ENDING_PATHS).sort());
    expect(frames).toBeGreaterThan(30);
    expect(reports).toBeGreaterThan(30);
  });
});

describe("island-view — what the words must say", () => {
  const [en, fr] = [contexts.find((c) => c.locale === "en")!, contexts.find((c) => c.locale === "fr")!];
  const years = playPath(PATH_C);

  it("the hand lists every card on the table, the ordered one flagged, and locks them while the call is open", () => {
    const start = years[1]!;
    const view = handView(fr, start, "callOpen");
    expect(view.cards.map((c) => c.id)).toEqual(handIds(L, start));
    expect(view.cards.every((c) => c.state === "locked")).toBe(true);
    expect(view.cards.filter((c) => c.ordered).map((c) => c.id)).toEqual(start.order ? [start.order] : []);
    expect(view.canRun).toBe(false);
  });

  it("« Lancer » is live with exactly two cards once the call is over — the reducer's own rule", () => {
    let s = reduce(years[0]!, { type: "hangup" });
    expect(handView(en, s, "pick").canRun).toBe(false);
    s = reduce(s, { type: "toggle", card: PATH_C[0]![0] });
    expect(handView(en, s, "pick").canRun).toBe(false);
    s = reduce(s, { type: "toggle", card: PATH_C[0]![1] });
    const view = handView(en, s, "ready");
    expect(view.canRun).toBe(true);
    expect(reduce(s, { type: "run" })).not.toBe(s);
    // A third card is not on offer: the others turn unavailable, the two picked stay pressed.
    expect(view.cards.filter((c) => c.pressed).map((c) => c.id).sort()).toEqual([...PATH_C[0]!].sort());
    expect(view.cards.filter((c) => !c.pressed).every((c) => c.state === "unavailable")).toBe(true);
  });

  it("the dashboard never carries trust or radar before December, in any string", () => {
    for (const state of years.slice(0, -1)) {
      const props = dashboardProps(fr, state, lastQuarterStart(L, state), false);
      expect(props.trust.hidden).toBe(true);
      expect(props.radar.hidden).toBe(true);
      const all = strings(props).map((s) => s.text).join(" ");
      expect(all).not.toContain(String(Math.round(state.trust)));
    }
    const last = years.at(-1)!;
    expect(dashboardProps(fr, last, lastQuarterStart(L, last), true).trust.hidden).toBe(false);
  });

  it("a report after the last quarter points to December; the others to the next call", () => {
    const last = years.at(-1)!;
    expect(reportContent(en, last, last.log.length - 1).nextLabel).toBe(en.copy.report.toDecember);
    expect(reportContent(en, last, 0).nextLabel).toBe(en.copy.report.next);
    expect(reportContent(en, years[1]!, 0).nextLabel).toBe(en.copy.report.next);
  });

  it("the churn cell and the end of the churn curve are the same string (R5, X34)", () => {
    const d = decemberContent(fr, years.at(-1)!);
    expect(d.churnChart.ariaLabel).toContain(d.figures.churn);
  });

  it("the share text carries the page's URL, the ending's title and the two figures", () => {
    const last = years.at(-1)!;
    const url = "https://www.tourdegrowth.com/en/game/retention";
    const text = shareText(en, last, url);
    const d = decemberContent(en, last);
    expect(text).toContain(url);
    expect(text).toContain(d.hero.title);
    expect(text).toContain(d.figures.churn);
    expect(text).toContain(d.figures.trust);
  });

  it("where the hand stood, December says whether the year ran its course or was cut short (brief P9)", () => {
    for (const [name, path] of Object.entries(ENDING_PATHS)) {
      const last = playPath(path).at(-1)!;
      const closed = yearClosedView(fr, last);
      expect(closed.title, name).toBe(last.fired ? fr.copy.hand.yearInterrupted : fr.copy.hand.yearOver);
      expect(closed.fired, name).toBe(last.fired);
      expect(closed.hint, name).toBe(fr.copy.hand.yearClosedHint);
    }
    // The walk must reach both titles, or the loop above proves half of it.
    const fired = Object.values(ENDING_PATHS).map((p) => playPath(p).at(-1)!.fired);
    expect(fired).toContain(true);
    expect(fired).toContain(false);
    expect(yearClosedView(fr, playPath(PATH_D).at(-1)!).title).toBe("Année interrompue");
    expect(yearClosedView(en, years.at(-1)!).title).toBe("Year over");
  });

  it("a year cut short never says December: the reveal and the churn cell name the month it closed in", () => {
    const cutShort = playPath(PATH_D).at(-1)!;
    expect(cutShort.fired).toBe(true);
    expect(closingMonth(fr, cutShort)).toBe("juin");
    const d = decemberContent(fr, cutShort);
    expect(d.cellLabels.churn).toBe("Résiliations en juin");
    const tiles = dashboardProps(fr, cutShort, lastQuarterStart(L, cutShort), true);
    for (const tile of [tiles.trust, tiles.radar]) {
      expect(tile.hidden).toBe(false);
      if (!tile.hidden) expect(tile.sub).toBe("révélée en juin");
    }
    expect(decemberContent(en, cutShort).cellLabels.churn).toBe("Churn in June");
    // Nothing on the cut-short year's December names the month it never reached.
    expect(strings({ d, tiles }).map((s) => s.text).filter((t) => /décembre/.test(t) && !/objectif de décembre/.test(t))).toEqual([]);

    // A year that ran its course still says December.
    const full = years.at(-1)!;
    expect(decemberContent(fr, full).cellLabels.churn).toBe("Résiliations en décembre");
    const fullTiles = dashboardProps(en, full, lastQuarterStart(L, full), true);
    if (!fullTiles.trust.hidden) expect(fullTiles.trust.sub).toBe("revealed in December");
  });

  /**
   * A year saved after its last quarter reopens on December (`settledPhase`):
   * the last report is not shown again. Accepted — on the condition that
   * nothing it said is lost. What the report said is either on the last
   * journal entry or on December's dashboard, for every ending.
   */
  it("reopened on December, a year loses nothing its last report said", () => {
    for (const ctx of contexts) {
      for (const [name, path] of Object.entries(ENDING_PATHS)) {
        const year = playPath(path).at(-1)!;
        const last = year.log.length - 1;
        const report = reportContent(ctx, year, last);
        const entry = journalEntries(ctx, year)[last]!;
        const tiles = dashboardProps(ctx, year, lastQuarterStart(L, year), true);
        const label = `${ctx.locale} · ${name}`;

        expect(entry.picked, label).toEqual(report.picked);
        for (const line of [...report.effects, ...report.notes, report.bossLine]) {
          expect(entry.lines, `${label}: ${line}`).toContain(line);
        }
        if (report.mail) expect(entry.lines, label).toContain(report.mail.body);
        for (const clip of report.clippings) expect(entry.lines, `${label}: ${clip.text}`).toContain(clip.text);

        const [churn, subs, mrr, patience] = report.figures;
        // The churn figure, its target and the verdict — the target is what a « target hit » alone loses.
        expect(entry.result.text, label).toContain(churn!.value);
        expect(entry.result.text, label).toContain(churn!.note!);
        expect(entry.result.text, label).toContain(churn!.status!.text);
        // The three others are the year's closing figures, on December's dashboard.
        expect(tiles.subs.value, label).toBe(subs!.value);
        expect(tiles.mrr.value, label).toBe(mrr!.value);
        expect(tiles.patience.value, label).toBe(patience!.value);
      }
    }
  });

  it("the resume prompt lists one line per quarter played, and a finished year offers to review it", () => {
    const mid = years[2]!;
    const r = resumeContent(fr, mid);
    expect(r.previously?.lines).toHaveLength(2);
    const done = resumeContent(fr, years.at(-1)!);
    expect(done.previously).toBeUndefined();
    expect(done.accept).toBe(fr.copy.resume.review);
  });
});

/**
 * Plan E5: one live region on the island. The pill keeps its own
 * `aria-live` wherever it stands alone, and is silent inside the island,
 * which says the new count in its region instead — in the pill's own words,
 * so a screen-reader user hears what a sighted one reads.
 */
describe("the clicks pill and the one live region", () => {
  const pill = (ctx: IslandContext, clicks: number | "phone", announce?: boolean) =>
    renderToStaticMarkup(
      createElement(ClickPill, { clicks, overLaw: clicksOverLaw(clicks), labels: ctx.copy.clicks, announce }),
    );
  const text = (html: string) => html.replace(/<[^>]+>/g, "");

  it("speaks for itself by default, and not when the island speaks for it", () => {
    const [ctx] = contexts;
    expect(pill(ctx!, 5)).toContain('aria-live="polite"');
    expect(pill(ctx!, 5, false)).not.toContain("aria-live");
  });

  for (const ctx of contexts) {
    it(`${ctx.locale}: the island says exactly the sentence the pill shows`, () => {
      for (const clicks of [2, 3, 4, 5, "phone"] as const) {
        expect(clicksSentence(ctx, clicks), String(clicks)).toBe(text(pill(ctx, clicks, false)));
      }
      // Past the legal path the sentence says why, not just how many.
      expect(clicksSentence(ctx, 5)).toContain(ctx.copy.clicks.lawSuffix);
      expect(clicksSentence(ctx, "phone")).toContain(ctx.copy.clicks.phoneSuffix);
      expect(clicksSentence(ctx, 2)).not.toContain(ctx.copy.clicks.lawSuffix);
    });
  }
});
