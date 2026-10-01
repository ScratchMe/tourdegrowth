import { describe, expect, it } from "vitest";
import { buildRelays, slgNoDecimals, smallSampleOf, smallestSample } from "../relays";
import { currentSnapshot } from "../values";
import { estimated, hybridState, measured, missing, ratio, salesAssistedState, withEntry } from "./fixtures";
import { CTX_FR } from "./props";

// Engine spec §18.5.1 and §18.10.1 « relays » (A7.3.c S1). Non-vacuity,
// measured on 2026-10-01:
// - drawing an unknown relay as {lo: 0, hi: 0} fails seven: « never 0 », the
//   example and the four chains here, and downstream the hybrid's findings
//   (three) and the relay's chain-break sentence;
// - naming the lead base from anything but the variant fails « leadNoun »;
// - dropping the « ÷ 3 » of the upstream line fails the example (480, not 160);
// - comparing the base with `<=` instead of `<` (100 counted as small) fails
//   the boundary of « small samples ».

const hubspot = { kind: "tool", tool: "hubspot" } as const;

describe("relays — the §18.9 example", () => {
  const relays = buildRelays(hybridState(), CTX_FR);

  it("15 out of 100 MQL, 24 out of 100 closed opportunities, go-live unknown — each on its own base", () => {
    expect(relays.columns.map((c) => [c.metric, c.base])).toEqual([
      ["slg.acq.lead-to-opp", "leads"],
      ["slg.rev.win-rate", "closed-opps"],
      ["slg.act.go-live", "new-customers"],
    ]);
    expect(relays.columns[0]).toMatchObject({
      perHundred: { lo: 15, hi: 15 },
      confidence: "solid",
      source: hubspot,
      period: { from: "2026-05", to: "2026-07" },
      sampleSize: 480,
    });
    expect(relays.columns[1]).toMatchObject({ perHundred: { lo: 24, hi: 24 }, period: { from: "2026-06", to: "2026-08" }, sampleSize: 75 });
    expect(relays.columns[2]).toMatchObject({ perHundred: null, confidence: "unknown", source: null, period: null });
    expect(relays.chain).toBe("tail-break");
  });

  it("~160 MQL a month upstream: the cohort's 480 leads over three months", () => {
    expect(relays.leadNoun).toBe("mql");
    expect(relays.leadsPerMonth).toEqual({ lo: 160, hi: 160 });
  });

  it("is the same with or without self-serve: the relays read sales-assisted numbers only", () => {
    expect(buildRelays(salesAssistedState(), CTX_FR)).toEqual(relays);
  });
});

describe("relays — the rules", () => {
  it("never 0 for an unknown relay: todo, requested, missing all draw null", () => {
    for (const entry of [undefined, missing("not-tracked", "sprint"), { status: "requested", request: { role: "revops", requestedAt: "2026-09-20T09:00:00.000Z" }, updatedAt: "x" } as const]) {
      const r = buildRelays(withEntry(hybridState(), "slg.rev.win-rate", entry), CTX_FR);
      expect(r.columns[1]!.perHundred).toBeNull();
    }
  });

  it("the four chains, by the peloton's rule", () => {
    const at = (lead: boolean, win: boolean, live: boolean) => {
      let s = hybridState();
      if (!lead) s = withEntry(s, "slg.acq.lead-to-opp", undefined);
      if (!win) s = withEntry(s, "slg.rev.win-rate", undefined);
      s = withEntry(s, "slg.act.go-live", live ? measured(ratio(12, 15), hubspot) : undefined);
      return buildRelays(s, CTX_FR).chain;
    };
    expect(at(true, true, true)).toBe("complete");
    expect(at(true, false, true)).toBe("gap");
    expect(at(true, true, false)).toBe("tail-break");
    expect(at(false, false, false)).toBe("empty");
  });

  it("leadNoun follows the variant: leads by default, MQL when the team counts MQL", () => {
    const leads = withEntry(hybridState(), "slg.acq.lead-to-opp", measured(ratio(72, 480), hubspot, { variant: "all-leads", cohortMonth: "2026-07" }));
    expect(buildRelays(leads, CTX_FR).leadNoun).toBe("leads");
    expect(buildRelays(withEntry(hybridState(), "slg.acq.lead-to-opp", undefined), CTX_FR).leadNoun).toBe("leads");
  });

  it("an estimate is a range of whole people, approximate, with no source and no volume upstream", () => {
    const r = buildRelays(withEntry(hybridState(), "slg.acq.lead-to-opp", estimated(12, 18, { cohortMonth: "2026-07" })), CTX_FR);
    expect(r.columns[0]).toMatchObject({ perHundred: { lo: 12, hi: 18 }, confidence: "approximate", source: null, sampleSize: null });
    expect(r.leadsPerMonth).toBeNull();
  });
});

describe("small samples, sales-assisted (§18.5.1)", () => {
  it("one more or less moves the win rate by ~1.3 points on 75 closed opportunities, the renewal by 4 on 25 contracts", () => {
    const snapshot = currentSnapshot(hybridState());
    expect(smallSampleOf(snapshot, "slg.rev.win-rate")?.denominator).toBe(75);
    expect(smallSampleOf(snapshot, "slg.rev.win-rate")?.points).toBeCloseTo(1.333, 3);
    expect(smallSampleOf(snapshot, "slg.ret.renewal")).toEqual({ denominator: 25, points: 4 });
    // 480 MQL and 130 opportunities are not small; the margin's counts are amounts, never « small ».
    expect(smallSampleOf(snapshot, "slg.acq.lead-to-opp")).toBeNull();
    expect(smallSampleOf(snapshot, "slg.ref.referred-share")).toBeNull();
    expect(slgNoDecimals(snapshot, "slg.rev.win-rate")).toBe(true);
    expect(slgNoDecimals(snapshot, "slg.acq.lead-to-opp")).toBe(false);
  });

  it("the board's sentence goes to the counted ★ with the smallest base: the renewal, 25", () => {
    expect(smallestSample(currentSnapshot(hybridState()))).toEqual({ metric: "slg.ret.renewal", denominator: 25, points: 4 });
  });

  it("the boundary: 100 is not small, 99 is", () => {
    const at = (d: number) => smallSampleOf(currentSnapshot(withEntry(hybridState(), "slg.rev.win-rate", measured(ratio(18, d), hubspot))), "slg.rev.win-rate");
    expect(at(100)).toBeNull();
    expect(at(99)?.denominator).toBe(99);
  });

  it("never on the link, which makes no finding, nor on a rate typed without counts", () => {
    const snapshot = currentSnapshot(withEntry(hybridState(), "link.pql-handoff", measured(ratio(3, 13), hubspot)));
    expect(smallSampleOf(snapshot, "link.pql-handoff")).toBeNull();
    const typed = currentSnapshot(withEntry(hybridState(), "slg.ret.renewal", measured({ kind: "rate", percent: 88 }, hubspot)));
    expect(smallSampleOf(typed, "slg.ret.renewal")).toBeNull();
  });
});
