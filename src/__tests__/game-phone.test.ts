import { describe, expect, it } from "vitest";

import { RETENTION_DARK_IDS, RETENTION_HONEST_IDS, RETENTION_LEVEL, type RetentionCardId } from "@/lib/game/levels/retention";
import { phoneView, type PhoneItem } from "@/lib/game/view";
import { changedPhoneKeys, phoneItemKey } from "@/components/game/PhoneMock";

// Game plan §4.2, G7b — the one piece of logic in the phone: which elements
// a tick just changed, so the flash lands on them and only on them.

const L = RETENTION_LEVEL;
const view = (ids: RetentionCardId[]) => phoneView(L, ids);

describe("phone element keys", () => {
  it("are unique within a screen, whatever is ticked", () => {
    const all = [...RETENTION_HONEST_IDS, ...RETENTION_DARK_IDS] as RetentionCardId[];
    for (const ids of [[], all, ["pdef", "bury"], ["call", "cascade", "shame"], ["pause", "survey"]] as RetentionCardId[][]) {
      const keys = view(ids).map(phoneItemKey);
      // React keys the elements by this: a duplicate would reuse the wrong one.
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("change with every flag that changes what an element shows", () => {
    const variants: PhoneItem[] = [
      { kind: "crumbs", buried: false },
      { kind: "crumbs", buried: true },
      { kind: "plan", annual: false },
      { kind: "plan", annual: true },
      { kind: "cancel", variant: "button", buried: false },
      { kind: "cancel", variant: "buriedLink", buried: true },
      { kind: "cancel", variant: "pauseFirst", buried: false },
      { kind: "cancel", variant: "pauseFirst", buried: true },
      { kind: "cancel", variant: "phone", buried: false },
      { kind: "retentionOffers", shamed: false },
      { kind: "retentionOffers", shamed: true },
    ];
    const keys = variants.map(phoneItemKey);
    expect(new Set(keys).size).toBe(variants.length);
  });
});

describe("what a tick changed", () => {
  it("nothing, on an identical screen", () => {
    expect(changedPhoneKeys(view(["bury"]), view(["bury"])).size).toBe(0);
  });

  it("ticking bury lengthens the path and shrinks the button — both flash, nothing else does", () => {
    const changed = changedPhoneKeys(view([]), view(["bury"]));
    expect([...changed].sort()).toEqual(["cancel:buriedLink:true", "crumbs:true"]);
  });

  it("adding a pop-up flashes the pop-up only", () => {
    expect([...changedPhoneKeys(view(["bury"]), view(["bury", "survey"]))]).toEqual(["exitSurvey"]);
  });

  it("the shaming line on the three offers flashes the whole stack it rewrote", () => {
    expect([...changedPhoneKeys(view(["cascade"]), view(["cascade", "shame"]))]).toEqual(["retentionOffers:true"]);
  });

  it("unticking removes, and a removal has nothing left to outline", () => {
    expect(changedPhoneKeys(view(["survey"]), view([])).size).toBe(0);
  });
});
