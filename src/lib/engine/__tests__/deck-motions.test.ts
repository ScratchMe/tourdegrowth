import { describe, expect, it } from "vitest";
import { deriveEngine } from "../derive";
import { linkSentence, relaysTitle, totalBlocks, totalIn12, totalSums, totalTitle } from "../deck-motions";
import { fillTemplate } from "../format";
import type { EngineState, MotionDerived } from "../types";
import { CTX_EN, CTX_FR, EN, FR } from "./props";
import { estimated, hybridState, measured, ratio, salesAssistedState, withEntry } from "./fixtures";

/**
 * The words the sales-assisted motion and the hybrid add to the board and the
 * deck (engine spec §18.8.2, A7.3.c S3): the relays' title, the total's title
 * and blocks, the link's sentence, the MRR in twelve months of both panels.
 * The board and the slides read the same functions.
 *
 * Non-vacuity, measured on 2026-10-01: dropping `capitalise` from the relays'
 * first clause fails « Sur 100 MQL » ; printing each block's part on its own
 * rounding instead of the sum's fails « an approximate sum » only (the
 * §18.9 example's exact parts print the same either way) ; returning the
 * known MRR as the total when the other is missing fails the S9 test.
 */

type Slg = Extract<MotionDerived, { motion: "slg" }>;
const NB = " ";
const nb = (s: string) => s.replace(/\^/g, NB);

function slgOf(state: EngineState, p = FR, ctx = CTX_FR) {
  const derived = deriveEngine(state, ctx, null, p.bridges, p.strings.units);
  return { derived, slg: derived.motions.find((m): m is Slg => m.motion === "slg")! };
}

describe("the relays' title (§18.8.2, slg:peloton)", () => {
  it("the §18.9 example: two clauses on their own base, go-live not measured — « on ne mesure pas »", () => {
    const state = hybridState();
    const { slg } = slgOf(state);
    const t = relaysTitle(state, slg.relays, FR.strings, FR.metrics, CTX_FR);
    expect(t.key).toBe("slgPelotonTailBreakOne");
    expect(fillTemplate(FR.strings.slideTitles[t.key], t.values)).toBe(
      nb("Sur 100 MQL, 15 deviennent une opportunité^; sur 100 opportunités conclues, 24 sont signées. **Au-delà, on ne sait pas les suivre^: on ne mesure pas la mise en production.**"),
    );
    const en = slgOf(state, EN, CTX_EN).slg;
    const tEn = relaysTitle(state, en.relays, EN.strings, EN.metrics, CTX_EN);
    expect(fillTemplate(EN.strings.slideTitles[tEn.key], tEn.values)).toBe(
      "Out of 100 MQLs, 15 become an opportunity; out of 100 closed opportunities, 24 are signed. **Beyond that, we can't follow them: go-live isn't measured.**",
    );
  });

  it("complete when go-live is measured — the last relay carries the accent, never a chain", () => {
    const state = withEntry(hybridState(), "slg.act.go-live", measured(ratio(12, 20), { kind: "tool", tool: "cs-platform" }));
    const { slg } = slgOf(state);
    const t = relaysTitle(state, slg.relays, FR.strings, FR.metrics, CTX_FR);
    expect(t.key).toBe("slgPelotonComplete");
    const text = fillTemplate(FR.strings.slideTitles[t.key], t.values);
    expect(text).toContain(nb("**sur 100 nouveaux clients, 60 sont en production à 90^jours**."));
    // Each relay on its own base: no « pour 100 leads » multiplied through.
    expect(text).not.toMatch(/clients pour 100 (leads|MQL)/);
  });

  it("empty: nothing to follow, with the leads' own noun", () => {
    const state = salesAssistedState();
    for (const id of ["slg.acq.lead-to-opp", "slg.rev.win-rate", "slg.act.go-live"] as const) state.snapshots[0]!.metrics[id] = undefined;
    const { slg } = slgOf(state);
    const t = relaysTitle(state, slg.relays, FR.strings, FR.metrics, CTX_FR);
    expect(t).toEqual({ key: "slgPelotonEmpty", values: { base: "leads" } });
  });
});

describe("« deux moteurs, un total » (§18.6.2, §18.8.2)", () => {
  it("the §18.9 total: 48 000 € + 180 000 € = 228 000 €, exact, and the title says what the blocks say", () => {
    const state = hybridState();
    const { derived } = slgOf(state);
    const t = totalTitle(derived.total!, state, FR.strings, CTX_FR);
    expect(t).toEqual({ key: "total", values: { total: nb("228^000^€"), plg: nb("48^000^€"), slg: nb("180^000^€") } });
    const blocks = totalBlocks(derived.total!, state, FR.strings, CTX_FR);
    // Self-serve first, always — and each block prints its part as the sum prints it.
    expect(blocks.map((b) => b.motion)).toEqual(["plg", "slg"]);
    expect(blocks.map((b) => b.mrr)).toEqual([t.values.plg, t.values.slg]);
    expect(blocks.map((b) => b.newMrr)).toEqual([nb("~5^000^€"), nb("~12^000^€")]);
    expect(totalSums(derived.total!, state, FR.strings, CTX_FR).map((s) => s.text)).toEqual([
      nb("Nouveau MRR du mois^: ~5^000^€ + ~12^000^€ = ~17^000^€"),
      nb("Dans 12^mois, au rythme actuel^: ~100^000^€ + ~330^000^€ à 340^000^€ = ~430^000^€ à 440^000^€"),
    ]);
  });

  it("an approximate sum: each block prints its part in the sum's one unit, not on its own two digits", () => {
    // Self-serve estimated (~47 000 € à 49 000 €) sets the unit at a thousand: sales-assisted's 183 400 € prints ~183 000 €, not ~180 000 €.
    const state = withEntry(withEntry(hybridState(), "rev.arpa", estimated(118, 122)), "slg.rev.arpa", measured(ratio(183_400, 100)));
    const { derived } = slgOf(state);
    const t = totalTitle(derived.total!, state, FR.strings, CTX_FR);
    expect(t.values).toEqual({ total: nb("~230^000^€ à 232^000^€"), plg: nb("~47^000^€ à 49^000^€"), slg: nb("~183^000^€") });
    expect(totalBlocks(derived.total!, state, FR.strings, CTX_FR).map((b) => b.mrr)).toEqual([t.values.plg, t.values.slg]);
  });

  it("a total exists only when both parts do (S9): the missing part is named, never the known one passed off as the total", () => {
    const noSlg = withEntry(hybridState(), "slg.rev.arpa", undefined);
    const { derived } = slgOf(noSlg);
    expect(totalTitle(derived.total!, noSlg, FR.strings, CTX_FR)).toEqual({ key: "totalUnknown", values: { motion: "de l'assisté" } });
    const blocks = totalBlocks(derived.total!, noSlg, FR.strings, CTX_FR);
    expect(blocks[0]!.mrr).toBe(nb("48^000^€"));
    expect(blocks[1]!.mrr).toBe("");
    expect(totalSums(derived.total!, noSlg, FR.strings, CTX_FR).map((s) => s.key)).not.toContain("mrr12");
    const neither = withEntry(noSlg, "rev.arpa", undefined);
    const both = slgOf(neither).derived;
    expect(totalTitle(both.total!, neither, FR.strings, CTX_FR).key).toBe("totalUnknownBoth");
  });

  it("the link: a share of the pipeline, counted, with its three months", () => {
    const state = hybridState();
    const { derived } = slgOf(state);
    expect(linkSentence(derived.total!, state, FR.strings, CTX_FR)).toBe("31 des 130 opportunités assistées viennent de comptes du libre-service (juin à août 2026).");
    const en = slgOf(state, EN, CTX_EN).derived;
    expect(linkSentence(en.total!, state, EN.strings, CTX_EN)).toBe("31 of the 130 sales-assisted opportunities come from self-serve accounts (June to August 2026).");
    const noLink = withEntry(state, "link.pql-handoff", undefined);
    expect(linkSentence(slgOf(noLink).derived.total!, noLink, FR.strings, CTX_FR)).toBeNull();
  });

  it("the MRR in twelve months of both panels: today, then with the what-ifs — a sum", () => {
    const state = hybridState();
    expect(totalIn12(state, FR.strings, CTX_FR)).toEqual({ today: nb("~430^000^€ à 440^000^€"), projected: null });
    const moved = { ...state, whatIf: { "link.pql-handoff": 40 } };
    const line = totalIn12(moved, FR.strings, CTX_FR)!;
    expect(line.today).toBe(nb("~430^000^€ à 440^000^€"));
    expect(line.projected).not.toBeNull();
    expect(line.projected).not.toBe(line.today);
    expect(totalIn12(withEntry(state, "slg.rev.arpa", undefined), FR.strings, CTX_FR)).toBeNull();
  });
});
