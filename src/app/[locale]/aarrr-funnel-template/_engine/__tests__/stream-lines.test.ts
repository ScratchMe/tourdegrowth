import { describe, expect, it } from "vitest";
import type { AppMonetization } from "@/lib/engine/app-model";
import { shapesOf } from "@/lib/engine/catalog-shape";
import type { MetricId } from "@/lib/engine/types";
import { streamChanges } from "../stream-lines";

/**
 * What the Settings of an app say of a way of earning ticked or unticked, before the save (§21.6.2, A22 APP-7): each
 * line counts as if its own way changed alone (decided by Antoine on 2026-10-07; the first letter put the whole
 * setting's before-and-after total on every line).
 *
 * Non-vacuity, measured on 2026-10-07 (each sabotage alone, this file run, 8 tests, then put back): counting each
 * way against the whole `now` (the total, as the first letter did) falls 3 (the two unticked together, the actives'
 * retention, the two ticked together); counting the unticked ones off every number shown rather than the entered ones
 * falls 2; flipping the unticked and ticked branches falls 5.
 */
const APP = "consumer-app";
const all: AppMonetization = { subscriptions: true, purchases: true, ads: true };
const subscriptionsOnly: AppMonetization = { subscriptions: true, purchases: false, ads: false };
const shown = (m: AppMonetization): MetricId[] => shapesOf({ type: APP, motions: { plg: true, slg: false }, monetization: m }).map((s) => s.id);
const everything = shown(all);

describe("streamChanges", () => {
  it("says nothing when no way changes", () => {
    expect(streamChanges(APP, all, all, everything)).toEqual([]);
  });

  it("one way unticked: its own count, the entered numbers only it hides", () => {
    // The ads alone: the cost per ad-active (`app.rev.ads-per-active`), the actives' retention staying for the purchases.
    expect(streamChanges(APP, all, { ...all, ads: false }, everything)).toEqual([{ stream: "ads", ticked: false, n: 1 }]);
    // The subscriptions alone: the five numbers of the paid side.
    expect(streamChanges(APP, all, { ...all, subscriptions: false }, everything)).toEqual([{ stream: "subscriptions", ticked: false, n: 5 }]);
  });

  it("two ways unticked at once: each line its own count, not the total on both", () => {
    const changes = streamChanges(APP, all, subscriptionsOnly, everything);
    expect(changes).toEqual([
      { stream: "purchases", ticked: false, n: 1 },
      { stream: "ads", ticked: false, n: 1 },
    ]);
    // The total the first letter put on each line: 3, the actives' retention being hidden once both are gone.
    const total = everything.filter((id) => !shown(subscriptionsOnly).includes(id)).length;
    expect(total).toBe(3);
    expect(changes.every((change) => change.n < total)).toBe(true);
  });

  it("the actives' retention, hidden only by the two ways together, is counted on neither line", () => {
    const retention: MetricId[] = ["app.ret.active-retention"];
    expect(streamChanges(APP, all, subscriptionsOnly, retention).map((change) => change.n)).toEqual([0, 0]);
  });

  it("counts what is entered, not what is shown: nothing entered, nothing hidden", () => {
    expect(streamChanges(APP, all, subscriptionsOnly, [])).toEqual([
      { stream: "purchases", ticked: false, n: 0 },
      { stream: "ads", ticked: false, n: 0 },
    ]);
    expect(streamChanges(APP, all, { ...all, subscriptions: false }, ["rev.arpa", "app.acq.cpi"])).toEqual([{ stream: "subscriptions", ticked: false, n: 1 }]);
  });

  it("one way ticked: the numbers that appear when it comes alone", () => {
    expect(streamChanges(APP, subscriptionsOnly, { ...subscriptionsOnly, ads: true }, [])).toEqual([{ stream: "ads", ticked: true, n: 2 }]);
  });

  it("two ways ticked at once: each line as if it came alone (the actives' retention comes with either)", () => {
    expect(streamChanges(APP, subscriptionsOnly, all, [])).toEqual([
      { stream: "purchases", ticked: true, n: 2 },
      { stream: "ads", ticked: true, n: 2 },
    ]);
  });

  it("one way ticked and another unticked: a line each, in the card's order", () => {
    const changes = streamChanges(APP, { subscriptions: true, purchases: false, ads: true }, { subscriptions: true, purchases: true, ads: false }, everything);
    expect(changes.map((change) => [change.stream, change.ticked])).toEqual([
      ["purchases", true],
      ["ads", false],
    ]);
  });
});
