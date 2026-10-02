import { describe, expect, it } from "vitest";
import { TRAPS_ASKING_DEFINITION } from "../phrases";
import { EN, FR } from "./props";

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
 */
const asksEn = (trap: string) => /\bwrite (it|your definition|down)\b/i.test(trap);
// « Écris-le », « écris-la », « Écris ta définition », « Écris ce qui compte » (no \b before a non-ASCII letter).
const asksFr = (trap: string) => /(^|[\s,])[ée]cris(-l[ea]|\s)/i.test(trap);

describe("the traps that ask for a definition (A18 T1)", () => {
  it("are exactly the ones whose English asks to write it down", () => {
    const asking = EN.metrics.filter((m) => asksEn(m.trap)).map((m) => m.id);
    expect(asking.sort()).toEqual([...TRAPS_ASKING_DEFINITION].sort());
  });

  it("and their French asks it too", () => {
    for (const id of TRAPS_ASKING_DEFINITION) {
      const trap = FR.metrics.find((m) => m.id === id)?.trap ?? "";
      expect(asksFr(trap), `${id}: ${trap}`).toBe(true);
    }
  });
});
