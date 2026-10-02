import { describe, expect, it } from "vitest";
import { buildDeck, deckMarkdown, renderTitle } from "../deck";
import { EVOLUTION_ROWS, seasonalNote } from "../deck-series";
import { deriveEngine } from "../derive";
import type { DeckModel, EngineState, SlideId } from "../types";
import { exampleState, hybridState, measured, ratio, withMonthBefore } from "./fixtures";
import { CTX_EN, CTX_FR, EN, FR } from "./props";

/**
 * « Ce qui a bougé » and `notes.series` (engine spec §19.2.6, §19.13, A14 T1):
 * where the slide sits, that it stays unticked until the team ticks it, its
 * three readings, its rows in catalogue order, and the note that takes over
 * from `notes.seasonal` from the second month — while a one-month engine's
 * deck stays what it was, to the character (the goldens hold the rest).
 *
 * Non-vacuity: see the journal's T1 entry.
 */

const props = { fr: { ...FR, ctx: CTX_FR }, en: { ...EN, ctx: CTX_EN } };
const amplitude = { kind: "tool", tool: "amplitude" } as const;
const stripe = { kind: "tool", tool: "stripe" } as const;

function deck(state: EngineState, locale: "fr" | "en" = "fr"): DeckModel {
  const p = props[locale];
  const derived = deriveEngine(state, p.ctx, null, p.bridges, p.strings.units);
  return buildDeck(state, derived, p.strings, p.metrics, p.ctx, { derived: p.derived, bridges: p.bridges });
}
const ids = (model: DeckModel) => model.slides.map((s) => s.id);
const slide = (model: DeckModel, id: SlideId) => model.slides.find((s) => s.id === id)!;
const title = (model: DeckModel, id: SlideId, locale: "fr" | "en" = "fr") => renderTitle(slide(model, id).title, props[locale].strings).replace(/\*\*/g, "");

/** July closed before the example's August: activation 15 % then 18 %, churn 3 % then 2,5 %, ARPA 115 € then 120 €. */
function moved(): EngineState {
  return withMonthBefore(exampleState(), (july) => {
    july.metrics["act.rate"] = measured(ratio(120, 800), amplitude);
    july.metrics["ret.logo-churn"] = measured(ratio(12, 400), stripe);
    july.metrics["rev.arpa"] = measured(ratio(46_000, 400), stripe);
  });
}

describe("« Ce qui a bougé » — present from the second month, unticked (§19.2.6, C32 Q5)", () => {
  it("a one-month engine has no such slide at all, in either deck", () => {
    for (const state of [exampleState(), hybridState()]) {
      const model = deck(state);
      expect(ids(model)).not.toContain("evolution");
      expect(ids(model)).not.toContain("slg:evolution");
    }
  });

  it("self-serve alone: right after the leak and its what-ifs, before visibility — unticked, unnumbered", () => {
    const state = { ...moved(), whatIf: { "act.rate": 24 } };
    const model = deck(state);
    const order = ids(model);
    expect(order.slice(0, 5)).toEqual(["peloton", "leak", "whatif:act.rate", "evolution", "visibility"]);
    expect(slide(model, "evolution")).toMatchObject({ present: true, included: false, index: null });
  });

  it("ticked, it is numbered and goes into the text export", () => {
    const state = moved();
    state.deck.include.evolution = true;
    const model = deck(state);
    expect(slide(model, "evolution")).toMatchObject({ included: true, index: 3 });
    expect(deckMarkdown(model, props.fr.strings)).toContain("## 3. **3 chiffres ont bougé** depuis juillet 2026\u00a0; l'activation reste la fuite\n\n- Taux d'activation · 15\u00a0%, puis 18\u00a0%");
  });

  it("the hybrid: one per motion, each in its own motion's group", () => {
    const state = withMonthBefore(hybridState(), (july) => void (july.metrics["slg.rev.win-rate"] = measured(ratio(15, 75), { kind: "tool", tool: "hubspot" })));
    const model = deck(state);
    const order = ids(model);
    expect(order.indexOf("evolution")).toBe(order.indexOf("leak") + 1);
    expect(order.indexOf("slg:evolution")).toBe(order.indexOf("slg:leak") + 1);
    expect(order.indexOf("slg:evolution")).toBeLessThan(order.indexOf("visibility"));
    expect(slide(model, "evolution").motion).toBe("plg");
    expect(slide(model, "slg:evolution").motion).toBe("slg");
    expect(title(model, "slg:evolution")).toBe("1 chiffre a bougé depuis juillet 2026 ; le taux de closing reste la fuite");
  });
});

describe("its three readings, in both languages", () => {
  it("numbers moved: how many, the leak, and each row « before, then now (change) », in AARRR order", () => {
    const fr = deck(moved());
    expect(title(fr, "evolution")).toBe("3 chiffres ont bougé depuis juillet 2026 ; l'activation reste la fuite");
    const rows = slide(fr, "evolution").lines.filter((l) => l.row === "evolution");
    expect(rows.map((r) => r.id)).toEqual(["act.rate", "ret.logo-churn", "rev.arpa"]);
    expect(rows.map((r) => r.text)).toEqual([
      "15 %, puis 18 % (+3 points, vers la cible)",
      "3 %, puis 2,5 % (–0,5 point, vers la cible)",
      "115 €, puis 120 € (+5 € · +4,3 %)",
    ]);
    const en = deck(moved(), "en");
    expect(title(en, "evolution", "en")).toBe("3 numbers moved since July 2026; activation is still the leak");
    expect(slide(en, "evolution").lines.find((l) => l.id === "rev.arpa")?.text).toBe("€115, then €120 (+€5 · +4.3%)");
  });

  it("the leak that changed stage « devient la fuite »", () => {
    const state = withMonthBefore(exampleState(), (july) => {
      july.metrics["act.rate"] = measured(ratio(200, 800), amplitude);
      july.metrics["ret.logo-churn"] = measured(ratio(16, 400), stripe);
    });
    expect(title(deck(state), "evolution")).toBe("2 chiffres ont bougé depuis juillet 2026 ; l'activation devient la fuite");
    expect(title(deck(state, "en"), "evolution", "en")).toBe("2 numbers moved since July 2026; activation is now the leak");
  });

  it("nothing moved: « Rien n'a bougé », and the numbers that held, six at most", () => {
    const model = deck(withMonthBefore(exampleState()));
    expect(title(model, "evolution")).toBe("Rien n'a bougé depuis juillet 2026 ; l'activation reste la fuite");
    const rows = slide(model, "evolution").lines.filter((l) => l.row === "evolution");
    expect(rows).toHaveLength(EVOLUTION_ROWS);
    expect(rows.every((r) => r.tone === "stable")).toBe(true);
  });

  it("nothing compares: the two months named, and why for each number", () => {
    const state = withMonthBefore(exampleState(), (july) => {
      for (const id of Object.keys(july.metrics) as (keyof typeof july.metrics)[]) delete july.metrics[id];
      july.metrics["act.rate"] = { ...measured(ratio(120, 800), amplitude), definitionNote: "un projet créé" };
    });
    const model = deck(state);
    expect(title(model, "evolution")).toBe("juillet 2026 et août 2026 ne se comparent pas encore");
    const apart = slide(model, "evolution").lines.filter((l) => l.row === "apart");
    expect(apart.find((l) => l.id === "act.rate")?.text).toBe("définition changée");
    expect(apart.find((l) => l.id === "acq.signup-rate")?.text).toBe("pas mesuré en juillet 2026");
    expect(apart.length).toBeLessThanOrEqual(EVOLUTION_ROWS);
    expect(slide(model, "evolution").lines.at(-1)).toMatchObject({ row: "footer" });
  });
});

describe("notes.series takes over from notes.seasonal from the second month", () => {
  it("one month: the seasonal note, as before; two: the series note, on every slide that had it", () => {
    expect(seasonalNote(exampleState(), props.fr.strings)).toBe(props.fr.strings.notes.seasonal);
    const series = seasonalNote(moved(), props.fr.strings);
    expect(series).toContain("2 mois sont suivis");
    const notes = deck(moved()).slides.flatMap((s) => s.notes);
    expect(notes).toContain(series);
    expect(notes).not.toContain(props.fr.strings.notes.seasonal);
    const single = deck(exampleState()).slides.flatMap((s) => s.notes);
    expect(single).toContain(props.fr.strings.notes.seasonal);
  });
});
