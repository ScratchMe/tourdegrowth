import { describe, expect, it } from "vitest";
import { TRAPS_ASKING_DEFINITION } from "../phrases";
import { EN, FR } from "./props";
import type { ResolvedMetric } from "../strings";

/**
 * A18 T1: a trap that tells the person to write their definition carries
 * « Écrire ta définition », which opens « Ta définition et une note ». The
 * list is held against the catalogue's own words, in both languages, so a
 * trap rewritten one day cannot keep a button it no longer asks for — nor
 * lose one it does.
 *
 * Non-vacuity: `act.rate` taken off the list fails the first test on that id;
 * a trap's « Write it in your definition » removed fails it on the other side.
 * The two CAC traps (« écris-le ») joined the return's three on this test.
 *
 * The marketplace's three (A23 MKT-1, §22.4.3: the fill rate, the take rate, the sellers' sign-up rate) are held on the
 * same terms, read in `typeCatalogs.marketplace.metrics` beside the SaaS's own props. Non-vacuity, measured on 2026-10-18:
 * `mkt.rev.take-rate` taken off the list falls 2 (the first test, naming that id, and the list of the three); the
 * marketplace's metrics left out of `allMetrics` — the SaaS's props alone — fall the first test and the French one.
 */
const asksEn = (trap: string) => /\bwrite (it|your definition|down)\b/i.test(trap);
// « Écris-le », « écris-la », « Écris ta définition », « Écris ce qui compte » (no \b before a non-ASCII letter).
const asksFr = (trap: string) => /(^|[\s,])[ée]cris(-l[ea]|\s)/i.test(trap);

/** The numbers of every catalogue the sheet can open: the SaaS's, then the marketplace's. */
const allMetrics = (props: typeof FR): ResolvedMetric[] => [...props.metrics, ...props.typeCatalogs.marketplace.metrics];

describe("the traps that ask for a definition (A18 T1)", () => {
  it("are exactly the ones whose English asks to write it down", () => {
    const asking = allMetrics(EN).filter((m) => asksEn(m.trap)).map((m) => m.id);
    expect(asking.sort()).toEqual([...TRAPS_ASKING_DEFINITION].sort());
  });

  it("and their French asks it too", () => {
    for (const id of TRAPS_ASKING_DEFINITION) {
      const trap = allMetrics(FR).find((m) => m.id === id)?.trap ?? "";
      expect(asksFr(trap), `${id}: ${trap}`).toBe(true);
    }
  });

  it("include the marketplace's three: what a request is, what the GMV counts, whether a seller page exists", () => {
    expect(TRAPS_ASKING_DEFINITION.filter((id) => id.startsWith("mkt."))).toEqual(["mkt.liq.fill-rate", "mkt.rev.take-rate", "mkt.sell.signup-rate"]);
  });
});
