import { describe, expect, it } from "vitest";
import { REMIND_AFTER_DAYS } from "../catalog-shape";
import { buildRequest, daysSinceRequest, isRequestStale, isStale, markReminded, markRequested, requestClock } from "../request";
import { CTX_EN, CTX_FR, EN, FR } from "./props";
import { EXAMPLE_NOW_ISO, exampleState, measured, ratio, withEntry } from "./fixtures";

// Engine spec §13.1 "request". The copied message says what to pull, for
// which period, under which definition — and carries NO value the user
// entered. Non-vacuity, measured: restarting the clock at `requestedAt`
// instead of `remindedAt` fails "the clock restarts at the reminder" only.

const tool = { kind: "tool", tool: "amplitude" } as const;

describe("buildRequest", () => {
  const state = withEntry(
    exampleState(),
    "act.rate",
    measured(ratio(144, 800), tool, { definitionNote: "activé = un projet créé", note: "PRIVATE-NOTE-7" }),
  );

  it("period, names and definitions, in the page's language", () => {
    const fr = buildRequest("data", ["act.rate", "ret.d30", "acq.cac"], FR.strings, FR.metrics, state, CTX_FR);
    // The event is a noun phrase with its article, the user's words quoted inside it — never « ont fait a créé ».
    expect(fr).toContain(
      "pour les inscrits en juillet 2026, combien ont déclenché l'événement «\u00a0a créé un premier projet\u00a0» sous 7\u00a0jours",
    );
    expect(fr).toContain("(activé = un projet créé)");
    expect(fr).toContain("combien étaient encore actifs trente jours après leur inscription");
    // « en août », never « de août »: a month may start with a vowel, and a template cannot elide.
    expect(fr).toContain("la dépense d'acquisition en août 2026 (média seul)");
    expect(fr).not.toMatch(/\bde (août|avril|octobre)/);
    expect(fr.startsWith("Bonjour")).toBe(true);
    expect(fr.split("\n").filter((l) => l.startsWith("– "))).toHaveLength(3);
    const en = buildRequest("data", ["act.rate"], EN.strings, EN.metrics, state, CTX_EN);
    expect(en).toContain('for the sign-ups from July 2026, how many triggered the "a créé un premier projet" event within 7 days');
  });

  it("no value the user entered: no count, no amount, no label, no private note", () => {
    const all = buildRequest("finance", ["act.rate", "acq.cac", "acq.top-channel-share", "rev.arpa", "ret.logo-churn"], FR.strings, FR.metrics, state, CTX_FR);
    for (const entered of ["144", "800", "21 000", "21000", "48 000", "Recherche naturelle", "PRIVATE-NOTE-7", "410"]) {
      expect(all, entered).not.toContain(entered);
    }
  });

  it("without the user's event, a generic noun phrase stands in — never the catalogue's label", () => {
    const noEvent = withEntry(state, "act.event", undefined);
    const fr = buildRequest("data", ["act.rate"], FR.strings, FR.metrics, noEvent, CTX_FR);
    expect(fr).not.toContain("a créé un premier projet");
    expect(fr).toContain("combien ont déclenché l'événement d'activation sous 7\u00a0jours");
    const en = buildRequest("data", ["act.rate"], EN.strings, EN.metrics, noEvent, CTX_EN);
    expect(en).toContain("how many triggered the activation event within 7 days");
  });

  it("quotes the user typed around their own event are not doubled", () => {
    const quoted = withEntry(state, "act.event", measured({ kind: "text", text: " « a créé un premier projet » " }, tool));
    const fr = buildRequest("data", ["act.rate"], FR.strings, FR.metrics, quoted, CTX_FR);
    expect(fr).toContain("l'événement «\u00a0a créé un premier projet\u00a0» sous");
    const en = buildRequest("data", ["act.rate"], EN.strings, EN.metrics, withEntry(state, "act.event", measured({ kind: "text", text: '"created a project"' }, tool)), CTX_EN);
    expect(en).toContain('the "created a project" event');
  });
});

describe("the follow-up clock", () => {
  const snapshot = exampleState().snapshots[0]!;

  it("a request goes stale after REMIND_AFTER_DAYS; a future or unreadable date invents no delay", () => {
    const now = new Date("2026-09-24T09:00:00.000Z");
    expect(REMIND_AFTER_DAYS).toBe(5);
    expect(isStale("2026-09-19T09:00:00.000Z", now)).toBe(true);
    expect(isStale("2026-09-20T09:00:00.000Z", now)).toBe(false);
    expect(isStale("2026-10-01T09:00:00.000Z", now)).toBe(false);
    expect(isStale("not a date", now)).toBe(false);
  });

  it("the clock restarts at the reminder, not the request", () => {
    const now = new Date("2026-09-24T09:00:00.000Z");
    const asked = markRequested(snapshot, ["ret.d30"], "data", "2026-09-10T09:00:00.000Z");
    expect(isRequestStale(asked.metrics["ret.d30"], now)).toBe(true);
    expect(daysSinceRequest(asked.metrics["ret.d30"], now)).toBe(14);
    const chased = markReminded(asked, ["ret.d30"], "2026-09-23T09:00:00.000Z");
    expect(requestClock(chased.metrics["ret.d30"])).toBe("2026-09-23T09:00:00.000Z");
    expect(chased.metrics["ret.d30"]!.request!.requestedAt).toBe("2026-09-10T09:00:00.000Z");
    expect(isRequestStale(chased.metrics["ret.d30"], now)).toBe(false);
    expect(daysSinceRequest(chased.metrics["ret.d30"], now)).toBe(1);
  });

  it("copying again is not a new request; another role is", () => {
    const first = markRequested(snapshot, ["ret.d30"], "data", "2026-09-10T09:00:00.000Z");
    const again = markRequested(first, ["ret.d30"], "data", EXAMPLE_NOW_ISO);
    expect(again.metrics["ret.d30"]!.request).toEqual({ role: "data", requestedAt: "2026-09-10T09:00:00.000Z" });
    const other = markRequested(first, ["ret.d30"], "product", EXAMPLE_NOW_ISO);
    expect(other.metrics["ret.d30"]!.request).toEqual({ role: "product", requestedAt: EXAMPLE_NOW_ISO });
    // Pure: the snapshot passed in is untouched.
    expect(snapshot.metrics["ret.d30"]!.status).toBe("missing");
    expect(first.metrics["ret.d30"]!.status).toBe("requested");
  });

  it("a reminder only touches running requests", () => {
    const chased = markReminded(snapshot, ["act.rate"], EXAMPLE_NOW_ISO);
    expect(chased.metrics["act.rate"]).toEqual(snapshot.metrics["act.rate"]);
    expect(requestClock(snapshot.metrics["act.rate"])).toBeNull();
    expect(requestClock(snapshot.metrics["ref.k-factor"])).toBe("2026-09-20T09:00:00.000Z");
  });
});
