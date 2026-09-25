import { describe, expect, it } from "vitest";

import { formatPct } from "../format";
import { RETENTION_LEVEL, type RetentionCardId } from "../levels/retention";
import { fresh } from "../model";
import type { GameState } from "../types";
import { typingDurationMs, TYPE_TICK_MS } from "../ui-timing";
import {
  chartScale,
  CHURN_SCALE,
  clicksFor,
  clicksOverLaw,
  dashboardView,
  decemberView,
  monthFrames,
  patternCatalogue,
  phoneIds,
  phoneView,
  playbookCards,
  reportView,
  TRUST_SCALE,
  voiceLang,
  voiceParams,
  type PhoneItem,
} from "../view";
import { endingState, ENDING_PATHS, finalState, PATH_A, PATH_C, playPath } from "./paths";

// Plan §4.2, G1v: E4, P5-unit, X9-X12.
type Id = RetentionCardId;
const L = RETENTION_LEVEL;
const kinds = (items: PhoneItem[]) => items.map((i) => i.kind);
const item = <K extends PhoneItem["kind"]>(items: PhoneItem[], kind: K) =>
  items.find((i): i is Extract<PhoneItem, { kind: K }> => i.kind === kind);

describe("E4 — the clicks pill", () => {
  it("2 by default, 5 with bury, 6 with pause + cascade, a phone call with call, 3 with bury + three", () => {
    expect(clicksFor(L, [])).toBe(2);
    expect(clicksFor(L, ["bury"])).toBe(5);
    expect(clicksFor(L, ["pause", "cascade"])).toBe(6);
    expect(clicksFor(L, ["call"])).toBe("phone");
    expect(clicksFor(L, ["bury", "three"])).toBe(3);
  });

  it("the phone beats any number, and a card counted twice counts once", () => {
    expect(clicksFor(L, ["bury", "cascade", "call", "three"])).toBe("phone");
    expect(clicksFor(L, ["bury", "bury"])).toBe(5);
  });

  it("reads as a legal problem past three clicks, or when it takes a call", () => {
    expect(clicksOverLaw(2)).toBe(false);
    expect(clicksOverLaw(3)).toBe(false);
    expect(clicksOverLaw(4)).toBe(true);
    expect(clicksOverLaw("phone")).toBe(true);
  });
});

describe("P5-unit — the phone follows the cards", () => {
  it("a plain subscription: short breadcrumbs, a real cancel button", () => {
    const items = phoneView(L, []);
    expect(kinds(items)).toEqual(["appBar", "crumbs", "plan", "cancel"]);
    expect(item(items, "crumbs")).toEqual({ kind: "crumbs", buried: false });
    expect(item(items, "cancel")).toEqual({ kind: "cancel", variant: "button", buried: false });
  });

  it("bury: the long breadcrumbs, and the button becomes a small link", () => {
    const items = phoneView(L, ["bury"]);
    expect(item(items, "crumbs")).toEqual({ kind: "crumbs", buried: true });
    expect(item(items, "cancel")).toEqual({ kind: "cancel", variant: "buriedLink", buried: true });
  });

  it("pdef puts the pause first; with bury, its secondary link is the buried one", () => {
    expect(item(phoneView(L, ["pdef"]), "cancel")).toEqual({ kind: "cancel", variant: "pauseFirst", buried: false });
    expect(item(phoneView(L, ["pdef", "bury"]), "cancel")).toEqual({ kind: "cancel", variant: "pauseFirst", buried: true });
  });

  it("call wins: no button to style once you have to phone, and no shame pop-up either", () => {
    const items = phoneView(L, ["call", "pdef", "shame"]);
    expect(item(items, "cancel")?.variant).toBe("phone");
    expect(kinds(items)).not.toContain("areYouSure");
  });

  it("the pause offer shows only when nothing else has taken the pause's place", () => {
    expect(kinds(phoneView(L, ["pause"]))).toContain("pauseOffer");
    expect(kinds(phoneView(L, ["pause", "pdef"]))).not.toContain("pauseOffer");
    expect(kinds(phoneView(L, ["pause", "call"]))).not.toContain("pauseOffer");
  });

  it("the offers cascade carries the shaming button; shame alone asks « are you sure? »", () => {
    expect(item(phoneView(L, ["cascade", "shame"]), "retentionOffers")).toEqual({ kind: "retentionOffers", shamed: true });
    expect(item(phoneView(L, ["cascade"]), "retentionOffers")).toEqual({ kind: "retentionOffers", shamed: false });
    expect(kinds(phoneView(L, ["shame"]))).toContain("areYouSure");
    expect(kinds(phoneView(L, ["shame", "cascade"]))).not.toContain("areYouSure");
  });

  it("the notice period outranks the same-day cancellation at the bottom", () => {
    expect(kinds(phoneView(L, ["three"])).at(-1)).toBe("effectiveToday");
    expect(kinds(phoneView(L, ["three", "notice"])).at(-1)).toBe("noticePeriod");
    expect(kinds(phoneView(L, ["three", "notice"]))).not.toContain("effectiveToday");
  });

  it("everything at once comes in the brief's top-to-bottom order", () => {
    const all: Id[] = ["streak", "bury", "annual", "social", "remind", "pause", "cascade", "shame", "survey", "notice", "three"];
    expect(kinds(phoneView(L, all))).toEqual([
      "appBar", "streakPush", "crumbs", "plan", "socialProof", "reminder", "cancel",
      "pauseOffer", "retentionOffers", "exitSurvey", "noticePeriod",
    ]);
    expect(item(phoneView(L, all), "plan")).toEqual({ kind: "plan", annual: true });
  });

  it("reflects cards in production and cards ticked but not yet played", () => {
    const s: GameState<Id> = { ...fresh(L), active: ["bury", "pause"], picks: ["pause", "shame"] };
    expect(phoneIds(s)).toEqual(["bury", "pause", "shame"]);
  });
});

describe("X11 — before December, the dashboard does not carry trust or radar", () => {
  it("on every state of every year the tests play, until the year is over", () => {
    let hidden = 0;
    let revealed = 0;
    for (const path of Object.values(ENDING_PATHS)) {
      for (const s of playPath(path)) {
        const view = dashboardView(L, s);
        if (s.over) {
          expect(view.trust).toEqual({ hidden: false, value: s.trust });
          expect(view.radar).toEqual({ hidden: false, value: s.radar });
          revealed++;
        } else {
          // Not merely flagged: the value is not in the object at all.
          expect(view.trust).toStrictEqual({ hidden: true });
          expect(view.radar).toStrictEqual({ hidden: true });
          expect(JSON.stringify(view)).not.toMatch(/"(trust|radar)":\{[^}]*"value"/);
          hidden++;
        }
      }
    }
    expect(hidden).toBeGreaterThan(0);
    expect(revealed).toBe(Object.keys(ENDING_PATHS).length);
  });
});

describe("the dashboard", () => {
  it("on the first of January: the quarter's target, January, no comparison yet", () => {
    const view = dashboardView(L, fresh(L));
    expect(view).toMatchObject({
      churn: 0.06, target: 0.056, targetScope: "quarter", subs: 100_000,
      monthIndex: 0, monthEnd: false, mrrVsJanuary: null, patience: 55, patienceBar: 55, patienceLow: false,
      deltas: null,
    });
  });

  it("names the month that just ended — end of March after the first quarter, not April", () => {
    const [, q1] = playPath(PATH_A);
    if (!q1) throw new Error("path A");
    const view = dashboardView(L, q1);
    expect(view.monthIndex).toBe(2);
    expect(view.monthEnd).toBe(true);
    expect(view.target).toBe(0.051);
    expect(view.mrrVsJanuary).toBeCloseTo(q1.mrr - 1_299_000, 6);
    expect(dashboardView(L, finalState(PATH_A)).monthIndex).toBe(11);
  });

  it("switches to the board's 4 % once the year is over", () => {
    expect(dashboardView(L, finalState(PATH_A))).toMatchObject({ target: 0.04, targetScope: "board" });
  });

  it("marks patience low under 35, and keeps its bar inside 0-100", () => {
    expect(dashboardView(L, { ...fresh(L), patience: 34 }).patienceLow).toBe(true);
    expect(dashboardView(L, { ...fresh(L), patience: 35 }).patienceLow).toBe(false);
    expect(dashboardView(L, { ...fresh(L), patience: 130 }).patienceBar).toBe(100);
  });

  it("gives each change its meaning: churn down is good news, patience down is bad", () => {
    const [start, q1] = playPath(PATH_A);
    if (!start || !q1) throw new Error("path A");
    const { deltas } = dashboardView(L, q1, start);
    expect(deltas?.churn.sentiment).toBe("good"); // 6,0 → 5,7
    expect(deltas?.patience.sentiment).toBe("bad"); // 55 → 52
    expect(deltas?.patience.value).toBe(-3);
    expect(dashboardView(L, start, start).deltas?.subs.sentiment).toBe("flat");
  });

  it("the months that scroll after « Lancer » are the quarter's three", () => {
    const [start, q1] = playPath(PATH_A);
    if (!start || !q1) throw new Error("path A");
    expect(monthFrames(start, q1).map((p) => p.m)).toEqual([1, 2, 3]);
  });
});

describe("the quarter report", () => {
  it("a near miss and a bad miss read differently; a hit is a hit", () => {
    const a = finalState(PATH_A).log;
    const c = finalState(PATH_C).log;
    const near = a[0];
    const bad = c[3];
    const hit = c[0];
    if (!near || !bad || !hit) throw new Error("logs");
    expect(reportView(L, near).status).toEqual({ kind: "missed", by: near.gap, severe: false });
    expect(reportView(L, bad).status).toMatchObject({ kind: "missed", severe: true });
    expect(reportView(L, hit).status).toEqual({ kind: "hit" });
  });

  it("covers the quarter's months and carries its journal as is", () => {
    const entry = finalState(PATH_C).log[2];
    if (!entry) throw new Error("log");
    const view = reportView(L, entry);
    expect([view.monthFrom, view.monthTo]).toEqual([6, 8]);
    expect(view.events).toBe(entry.events);
    expect(view.picked).toEqual(["social", "notice"]);
    expect(view.order).toBe("notice");
  });
});

describe("X9 — the December frame holds its data", () => {
  it("2-9 % when the year stays inside it", () => {
    expect(chartScale([6, 5.7, 4.2, 4.0], CHURN_SCALE)).toEqual({ min: 2, max: 9, ticks: [3, 5, 7, 9] });
  });

  it("stretches to 12 for an 11 % spike, and every value stays in the frame", () => {
    const values = [6, 7.8, 9.4, 11];
    const scale = chartScale(values, CHURN_SCALE);
    expect(scale.max).toBe(12);
    expect(scale.ticks).toEqual([3, 5, 7, 9, 11]);
    for (const v of values) expect(v >= scale.min && v <= scale.max).toBe(true);
  });

  it("drops its floor for a churn at the model's 1,2 % minimum", () => {
    const scale = chartScale([1.2, 3], CHURN_SCALE);
    expect(scale.min).toBeLessThanOrEqual(1.2);
    expect(scale.min).toBeGreaterThanOrEqual(0);
  });

  it("trust keeps 0-100 and its quarter gridlines", () => {
    expect(chartScale([60, 83], TRUST_SCALE)).toEqual({ min: 0, max: 100, ticks: [25, 50, 75, 100] });
  });

  it("on every year the tests play, the curves stay inside their frames", () => {
    for (const ending of Object.keys(ENDING_PATHS) as (keyof typeof ENDING_PATHS)[]) {
      const d = decemberView(L, endingState(ending));
      for (const curve of [d.churn, d.trust]) {
        for (const v of curve.values) expect(v >= curve.scale.min && v <= curve.scale.max).toBe(true);
      }
    }
  });
});

describe("X12 — one number, one form: the end of a curve is written like its cell", () => {
  it("the curve's end is the cell's value, in the cell's unit, on all seven endings", () => {
    for (const ending of Object.keys(ENDING_PATHS) as (keyof typeof ENDING_PATHS)[]) {
      const s = endingState(ending);
      const d = decemberView(L, s);
      expect(d.churn.end).toBe(d.cells.churn);
      expect(d.trust.end).toBe(d.cells.trust);
      expect(d.churn.values.at(-1)).toBeCloseTo(d.churn.end * 100, 12);
      for (const locale of ["fr", "en"] as const) {
        expect(formatPct(locale, d.churn.end)).toBe(formatPct(locale, d.cells.churn));
      }
    }
  });

  it("path A ends at 3,99 %: the cell and the curve both read « 4,0 % »", () => {
    const d = decemberView(L, finalState(PATH_A));
    expect(formatPct("fr", d.churn.end)).toBe("4,0\u00A0%");
  });

  it("the reference lines are the board's target and the viral threshold", () => {
    const d = decemberView(L, finalState(PATH_A));
    expect(d.churn.reference).toBeCloseTo(4, 12);
    expect(d.trust.reference).toBe(35);
    expect(d.churn.months).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });
});

describe("December's lists", () => {
  it("the playbook: honest cards in the order first played, each once", () => {
    expect(playbookCards(L, finalState(PATH_A))).toEqual(["pause", "survey", "onboard", "present", "annual", "reco", "remind"]);
    expect(playbookCards(L, finalState(PATH_C))).toEqual(["pause", "present"]);
  });

  it("the catalogue: every pattern, grouped as used, refused or never dealt", () => {
    const c = patternCatalogue(L, finalState(PATH_C));
    expect(c.map((p) => p.id)).toEqual([...L.darkOrder]);
    const used = c.filter((p) => p.group === "used").map((p) => p.id);
    expect(used.sort()).toEqual(["bury", "call", "cascade", "notice", "pdef", "social"]);
    expect(c.filter((p) => p.group === "used").every((p) => p.status === "removed")).toBe(true);

    const a = patternCatalogue(L, finalState(PATH_A));
    expect(a.filter((p) => p.group === "used")).toEqual([]);
    expect(a.filter((p) => p.group === "refused").map((p) => p.id)).toEqual(["pdef", "bury", "cascade", "shame", "call"]);
    expect(a.filter((p) => p.group === "unseen").map((p) => p.id)).toEqual(["social", "notice", "streak"]);
    expect(a.every((p) => p.status === null)).toBe(true);
  });

  it("a pattern still running at the year's end is « live »", () => {
    const lab = patternCatalogue(L, endingState("labyrinth"));
    expect(lab.some((p) => p.status === "live")).toBe(true);
  });

  it("a pattern cleaned out and then shipped again is « live », not « removed »", () => {
    // `clean` pulls pdef out of production, and nothing stops the hand from
    // dealing it again. Played, not written: the catalogue must agree with
    // the ending on the same December screen, which sees a live pattern.
    const s = finalState([["pause", "survey"], ["pdef", "onboard"], ["clean", "present"], ["pdef", "annual"]]);
    expect(s.active).toContain("pdef");
    expect(s.removedDark).toContain("pdef");
    expect(s.ending).toBe("labyrinth");
    expect(patternCatalogue(L, s).find((p) => p.id === "pdef")).toEqual({ id: "pdef", group: "used", status: "live" });
  });
});

describe("X10 — the CEO's voice (§5.10)", () => {
  it("matches the brief's table", () => {
    expect(voiceParams("calm")).toEqual({ rate: 1.02, pitch: 0.85, volume: 0.9 });
    expect(voiceParams("firm")).toEqual({ rate: 1.02, pitch: 0.78, volume: 0.9 });
    expect(voiceParams("angry")).toEqual({ rate: 1.18, pitch: 0.62, volume: 1 });
    expect(voiceParams("cold")).toEqual({ rate: 0.92, pitch: 0.7, volume: 0.9 });
  });

  it("always sets the language of the page", () => {
    expect(voiceLang("fr")).toBe("fr-FR");
    expect(voiceLang("en")).toBe("en-US");
  });

  it("types two characters every 28 ms, 18 when angry", () => {
    expect(TYPE_TICK_MS.angry).toBe(18);
    expect(typingDurationMs("abcde", "calm")).toBe(3 * 28);
    expect(typingDurationMs("abcd", "angry")).toBe(2 * 18);
  });
});
