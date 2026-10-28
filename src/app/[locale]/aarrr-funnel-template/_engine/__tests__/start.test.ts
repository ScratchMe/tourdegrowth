import { describe, expect, it } from "vitest";
import { shapesOf } from "@/lib/engine/catalog-shape";
import { EN, FR } from "@/lib/engine/__tests__/props";
import { openTypesWith } from "@/lib/engine/access";
import { defaultCohortMonth, matureCohortMonth } from "@/lib/engine/cohort";
import { ALWAYS_OPEN_TYPE, BUSINESS_TYPES, DEFAULT_APP_MONETIZATION, mktSetup } from "@/lib/engine/setup-type";
import { savedTools, teamTools } from "@/lib/engine/tools";
import type { EngineSetup, EngineState, MetricId } from "@/lib/engine/types";
import { exampleState, marketplaceState } from "@/lib/engine/__tests__/fixtures";
import { cohortWindowOf, DEFAULT_MKT_START, motionsForCard, motionsOf, pickedType, settingsExisting, setupOfCard, startCopy, startDefaults, startMotionOf, startPlan, typeOf, withSettings, type SetupCard } from "../start";

/** What the card passes `startPlan` for a SaaS: its two motions, as the card reads them. */
const saas = (answer: "ss" | "sa" | "both") => ({ type: "b2b-saas" as const, motions: motionsOf(answer) });

/**
 * The first screen's question and its plan (design system extension 07,
 * A18 T3.a). The plan's counts come from the catalogue: the return measured
 * 5/7/5, 4/5/6 and 9/13/11, and the copy has no singular for them — every
 * count must stay at 2 or more, or the sentence needs one.
 */
describe("the start's question", () => {
  it("maps the three answers onto the model's two motions, and back", () => {
    expect(motionsOf("ss")).toEqual({ plg: true, slg: false });
    expect(motionsOf("sa")).toEqual({ plg: false, slg: true });
    expect(motionsOf("both")).toEqual({ plg: true, slg: true });
    for (const answer of ["ss", "sa", "both"] as const) expect(startMotionOf(motionsOf(answer))).toBe(answer);
  });
});

/**
 * The settings card's type guard (the security review of A23 MKT-0, 2026-10-18): a click picks a type only when the
 * build opens it (`openTypes`), not whenever it is a type there is — the marketplace is listed in `BUSINESS_TYPES`
 * since MKT-0 and only the dashed option's `disabled` kept it from being picked. Vitest mounts no component, so the
 * guard is this pure function and `Setup` calls it.
 *
 * Non-vacuity, measured on 2026-10-18 (each sabotage applied alone, this file run, the file restored): the guard
 * reading `BUSINESS_TYPES` again falls « the marketplace is a type there is and no choice » and « the app is a choice
 * only in a build that opens it » (2); answering with whatever string it is given falls those two and « a string that
 * is no type at all is no choice » (3). That `Setup` calls it is not tested: its `onChange` fires on a click, which
 * `renderToStaticMarkup` cannot send, and the option is `disabled`, so no e2e can click it either.
 */
describe("pickedType — the settings card's type guard", () => {
  it("the marketplace is a type there is and a choice only in a build that lists it in ENGINE_TYPES — its screens exist since MKT-7b", () => {
    expect((BUSINESS_TYPES as readonly string[]).includes("marketplace")).toBe(true);
    for (const env of [undefined, "", "consumer-app"]) {
      expect(pickedType("marketplace", openTypesWith(env)), `ENGINE_TYPES=${env}`).toBeNull();
    }
    for (const env of ["marketplace", "consumer-app,marketplace"]) {
      expect(pickedType("marketplace", openTypesWith(env)), `ENGINE_TYPES=${env}`).toBe("marketplace");
    }
  });

  it("the SaaS is always a choice: it is in every build's open types", () => {
    for (const env of [undefined, "", "consumer-app", "marketplace", "consumer-app,marketplace"]) {
      const open = openTypesWith(env);
      expect(open, `ENGINE_TYPES=${env}`).toContain(ALWAYS_OPEN_TYPE);
      expect(pickedType("b2b-saas", open)).toBe("b2b-saas");
    }
  });

  it("the app is a choice only in a build that opens it", () => {
    expect(pickedType("consumer-app", openTypesWith(undefined))).toBeNull();
    expect(pickedType("consumer-app", ["b2b-saas"])).toBeNull();
    expect(pickedType("consumer-app", openTypesWith("consumer-app"))).toBe("consumer-app");
    expect(pickedType("consumer-app", openTypesWith("consumer-app,marketplace"))).toBe("consumer-app");
  });

  it("a string that is no type at all is no choice", () => {
    expect(pickedType("", ["b2b-saas", "consumer-app"])).toBeNull();
    expect(pickedType("unknown-type", ["b2b-saas", "consumer-app"])).toBeNull();
    expect(pickedType("B2B-SAAS", ["b2b-saas"])).toBeNull();
  });
});

describe("startPlan", () => {
  it("counts the catalogue's numbers by effort, as the return measured them", () => {
    expect(startPlan(saas("ss"))).toEqual({ n: 17, quick: 5, hour: 7, ask: 5 });
    expect(startPlan(saas("sa"))).toEqual({ n: 15, quick: 4, hour: 5, ask: 6 });
    // The hybrid's link is one of its numbers (an hour's work).
    expect(startPlan(saas("both"))).toEqual({ n: 33, quick: 9, hour: 13, ask: 11 });
  });

  it("adds up, and never needs a singular", () => {
    for (const answer of ["ss", "sa", "both"] as const) {
      const plan = startPlan(saas(answer));
      expect(plan.quick + plan.hour + plan.ask).toBe(plan.n);
      expect(Math.min(plan.quick, plan.hour, plan.ask)).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("startDefaults", () => {
  it("the v1 defaults: euros, 7 and 30 days, the last full month and the cohort the payment window has matured", () => {
    const { setup, referenceMonth, cohortMonth } = startDefaults("ss", DEFAULT_APP_MONETIZATION, new Date(2026, 8, 24, 12));
    expect(setup).toMatchObject({ type: "b2b-saas", currency: "EUR", activationWindowDays: 7, paidWindowDays: 30, qualificationWindowDays: 30, goLiveWindowDays: 90 });
    expect(referenceMonth).toBe("2026-08");
    expect(cohortMonth).toBe("2026-07");
  });

  it("the motions are a copy: the screen's choice is never the state's object", () => {
    const motions = motionsOf("both");
    const { setup } = startDefaults("both", DEFAULT_APP_MONETIZATION, new Date(2026, 8, 24, 12));
    expect(setup.motions).toEqual(motions);
    expect(setup.motions).not.toBe(motions);
  });
});

/**
 * The card with the app type closed is the SaaS's alone, to the character (§21.6.1, APP-7's stop condition): these six
 * snapshots were written by the code of before the card moved out of `EngineWorkbench` and learned `openTypes`, and the
 * same call, `openTypes: ["b2b-saas"]`, must keep answering them. The CI builds with the type open, so no e2e sees the
 * closed card: this is its guard.
 */
describe("startCopy, the card as it was before the app (§21.6.1)", () => {
  const TODAY = new Date(2026, 8, 24, 12);
  it("fr, self-serve", () => {
    expect(startCopy(FR.strings, "fr", "ss", TODAY, ["b2b-saas"], DEFAULT_APP_MONETIZATION)).toMatchInlineSnapshot(`
      {
        "defaults": {
          "cohortMonth": "2026-07",
          "referenceMonth": "2026-08",
          "setup": {
            "activationWindowDays": 7,
            "currency": "EUR",
            "goLiveWindowDays": 90,
            "motions": {
              "plg": true,
              "slg": false,
            },
            "paidWindowDays": 30,
            "qualificationWindowDays": 30,
            "type": "b2b-saas",
          },
        },
        "props": {
          "changeLabel": "Modifier",
          "defaults": "Réglé pour un SaaS B2B, en euros. Mois des chiffres : août 2026 ; inscrits suivis : juillet 2026.",
          "legend": "Comment vends-tu ?",
          "motion": "ss",
          "options": [
            {
              "label": "Libre-service",
              "note": "On s'inscrit et on paie seul (PLG).",
              "value": "ss",
            },
            {
              "label": "Assisté",
              "note": "Un commercial signe les contrats (SLG).",
              "value": "sa",
            },
            {
              "label": "Les deux",
              "note": "Deux moteurs, un total.",
              "value": "both",
            },
          ],
          "plan": "17 chiffres : 5 se lisent en cinq minutes, 7 demandent environ une heure chacun, 5 sont à demander à quelqu'un.",
          "startLabel": "Commence →",
          "title": "Avant de commencer",
        },
      }
    `);
  });
  it("fr, sales-assisted", () => {
    expect(startCopy(FR.strings, "fr", "sa", TODAY, ["b2b-saas"], DEFAULT_APP_MONETIZATION)).toMatchInlineSnapshot(`
      {
        "defaults": {
          "cohortMonth": "2026-07",
          "referenceMonth": "2026-08",
          "setup": {
            "activationWindowDays": 7,
            "currency": "EUR",
            "goLiveWindowDays": 90,
            "motions": {
              "plg": false,
              "slg": true,
            },
            "paidWindowDays": 30,
            "qualificationWindowDays": 30,
            "type": "b2b-saas",
          },
        },
        "props": {
          "changeLabel": "Modifier",
          "defaults": "Réglé pour un SaaS B2B, en euros, sur trois mois de chiffres jusqu'à août 2026.",
          "legend": "Comment vends-tu ?",
          "motion": "sa",
          "options": [
            {
              "label": "Libre-service",
              "note": "On s'inscrit et on paie seul (PLG).",
              "value": "ss",
            },
            {
              "label": "Assisté",
              "note": "Un commercial signe les contrats (SLG).",
              "value": "sa",
            },
            {
              "label": "Les deux",
              "note": "Deux moteurs, un total.",
              "value": "both",
            },
          ],
          "plan": "15 chiffres : 4 se lisent en cinq minutes, 5 demandent environ une heure chacun, 6 sont à demander à quelqu'un.",
          "startLabel": "Commence →",
          "title": "Avant de commencer",
        },
      }
    `);
  });
  it("fr, both", () => {
    expect(startCopy(FR.strings, "fr", "both", TODAY, ["b2b-saas"], DEFAULT_APP_MONETIZATION)).toMatchInlineSnapshot(`
      {
        "defaults": {
          "cohortMonth": "2026-07",
          "referenceMonth": "2026-08",
          "setup": {
            "activationWindowDays": 7,
            "currency": "EUR",
            "goLiveWindowDays": 90,
            "motions": {
              "plg": true,
              "slg": true,
            },
            "paidWindowDays": 30,
            "qualificationWindowDays": 30,
            "type": "b2b-saas",
          },
        },
        "props": {
          "changeLabel": "Modifier",
          "defaults": "Réglé pour un SaaS B2B, en euros. Mois des chiffres : août 2026 ; inscrits suivis : juillet 2026.",
          "legend": "Comment vends-tu ?",
          "motion": "both",
          "options": [
            {
              "label": "Libre-service",
              "note": "On s'inscrit et on paie seul (PLG).",
              "value": "ss",
            },
            {
              "label": "Assisté",
              "note": "Un commercial signe les contrats (SLG).",
              "value": "sa",
            },
            {
              "label": "Les deux",
              "note": "Deux moteurs, un total.",
              "value": "both",
            },
          ],
          "plan": "33 chiffres : 9 se lisent en cinq minutes, 13 demandent environ une heure chacun, 11 sont à demander à quelqu'un.",
          "startLabel": "Commence →",
          "title": "Avant de commencer",
        },
      }
    `);
  });
  it("en, self-serve", () => {
    expect(startCopy(EN.strings, "en", "ss", TODAY, ["b2b-saas"], DEFAULT_APP_MONETIZATION)).toMatchInlineSnapshot(`
      {
        "defaults": {
          "cohortMonth": "2026-07",
          "referenceMonth": "2026-08",
          "setup": {
            "activationWindowDays": 7,
            "currency": "EUR",
            "goLiveWindowDays": 90,
            "motions": {
              "plg": true,
              "slg": false,
            },
            "paidWindowDays": 30,
            "qualificationWindowDays": 30,
            "type": "b2b-saas",
          },
        },
        "props": {
          "changeLabel": "Change",
          "defaults": "Set for a B2B SaaS, in euros, on August 2026's figures and July 2026's sign-ups.",
          "legend": "How do you sell?",
          "motion": "ss",
          "options": [
            {
              "label": "Self-serve",
              "note": "People sign up and pay on their own (PLG).",
              "value": "ss",
            },
            {
              "label": "Sales-assisted",
              "note": "A salesperson signs the deals (SLG).",
              "value": "sa",
            },
            {
              "label": "Both",
              "note": "Two engines, one total.",
              "value": "both",
            },
          ],
          "plan": "17 numbers: 5 take five minutes, 7 about an hour each, 5 come from someone else.",
          "startLabel": "Start →",
          "title": "Before you start",
        },
      }
    `);
  });
  it("en, sales-assisted", () => {
    expect(startCopy(EN.strings, "en", "sa", TODAY, ["b2b-saas"], DEFAULT_APP_MONETIZATION)).toMatchInlineSnapshot(`
      {
        "defaults": {
          "cohortMonth": "2026-07",
          "referenceMonth": "2026-08",
          "setup": {
            "activationWindowDays": 7,
            "currency": "EUR",
            "goLiveWindowDays": 90,
            "motions": {
              "plg": false,
              "slg": true,
            },
            "paidWindowDays": 30,
            "qualificationWindowDays": 30,
            "type": "b2b-saas",
          },
        },
        "props": {
          "changeLabel": "Change",
          "defaults": "Set for a B2B SaaS, in euros, on three months of figures up to August 2026.",
          "legend": "How do you sell?",
          "motion": "sa",
          "options": [
            {
              "label": "Self-serve",
              "note": "People sign up and pay on their own (PLG).",
              "value": "ss",
            },
            {
              "label": "Sales-assisted",
              "note": "A salesperson signs the deals (SLG).",
              "value": "sa",
            },
            {
              "label": "Both",
              "note": "Two engines, one total.",
              "value": "both",
            },
          ],
          "plan": "15 numbers: 4 take five minutes, 5 about an hour each, 6 come from someone else.",
          "startLabel": "Start →",
          "title": "Before you start",
        },
      }
    `);
  });
  it("en, both", () => {
    expect(startCopy(EN.strings, "en", "both", TODAY, ["b2b-saas"], DEFAULT_APP_MONETIZATION)).toMatchInlineSnapshot(`
      {
        "defaults": {
          "cohortMonth": "2026-07",
          "referenceMonth": "2026-08",
          "setup": {
            "activationWindowDays": 7,
            "currency": "EUR",
            "goLiveWindowDays": 90,
            "motions": {
              "plg": true,
              "slg": true,
            },
            "paidWindowDays": 30,
            "qualificationWindowDays": 30,
            "type": "b2b-saas",
          },
        },
        "props": {
          "changeLabel": "Change",
          "defaults": "Set for a B2B SaaS, in euros, on August 2026's figures and July 2026's sign-ups.",
          "legend": "How do you sell?",
          "motion": "both",
          "options": [
            {
              "label": "Self-serve",
              "note": "People sign up and pay on their own (PLG).",
              "value": "ss",
            },
            {
              "label": "Sales-assisted",
              "note": "A salesperson signs the deals (SLG).",
              "value": "sa",
            },
            {
              "label": "Both",
              "note": "Two engines, one total.",
              "value": "both",
            },
          ],
          "plan": "33 numbers: 9 take five minutes, 13 about an hour each, 11 come from someone else.",
          "startLabel": "Start →",
          "title": "Before you start",
        },
      }
    `);
  });
});

/**
 * The app's start card (engine spec §21.6.1, A22 APP-7): a fourth answer when the type is open, its three ways of
 * earning, its plan counted from its own numbers, and the card of the SaaS untouched by any of it.
 *
 * Non-vacuity, measured on 2026-10-07 (each sabotage alone, this file and `engine-start.test.ts` run, 31 tests, then put
 * back; the count is the tests that fall): `motionsOf("app")` leaving `slg` on (the old `choice !== "ss"`) falls 2;
 * `startPlan` counting the SaaS's list falls 3; the app option shown with the type closed falls 7, the six snapshots among
 * them; the typed labels used with the type closed falls 7; `startDefaults` writing the monetization of a SaaS falls 7.
 * For `setupOfCard`: dropping the monetization falls 2, the tools 2, the type 1.
 */
describe("the app on the start card (§21.6.1)", () => {
  const TODAY = new Date(2026, 8, 24, 12);
  const BOTH_OPEN = ["b2b-saas", "consumer-app"] as const;
  const app = (monetization: { subscriptions: boolean; purchases: boolean; ads: boolean }) =>
    ({ type: "consumer-app" as const, motions: motionsOf("app"), monetization });

  it("the app sells self-serve, and its choice makes the app type, never the SaaS's", () => {
    expect(motionsOf("app")).toEqual({ plg: true, slg: false });
    expect(typeOf("app")).toBe("consumer-app");
    for (const answer of ["ss", "sa", "both"] as const) expect(typeOf(answer)).toBe("b2b-saas");
    // The radio a setup's motions read as is never the app's: the type says it, not the boxes.
    expect(startMotionOf(motionsOf("app"))).toBe("ss");
  });

  it("its plan counts its own numbers, by what it earns from — 21, 18, 15, 14, 20, 20 and 16 (§21.4.1)", () => {
    const counts = [
      [{ subscriptions: true, purchases: true, ads: true }, 21],
      [{ subscriptions: true, purchases: false, ads: false }, 18],
      [{ subscriptions: false, purchases: true, ads: false }, 15],
      [{ subscriptions: false, purchases: false, ads: true }, 14],
      [{ subscriptions: true, purchases: false, ads: true }, 20],
      [{ subscriptions: true, purchases: true, ads: false }, 20],
      [{ subscriptions: false, purchases: true, ads: true }, 16],
    ] as const;
    for (const [monetization, n] of counts) {
      const plan = startPlan(app(monetization));
      expect(plan.n, JSON.stringify(monetization)).toBe(n);
      expect(plan.quick + plan.hour + plan.ask).toBe(plan.n);
      // The sentence has no singular: every count stays at 2 or more.
      expect(Math.min(plan.quick, plan.hour, plan.ask)).toBeGreaterThanOrEqual(2);
      expect(plan.n).toBe(shapesOf(app(monetization)).length);
    }
  });

  it("an app starts with what the card ticked, as a copy; a SaaS carries no such key", () => {
    const ticked = { subscriptions: false, purchases: true, ads: true };
    const { setup } = startDefaults("app", ticked, TODAY);
    expect(setup).toMatchObject({ type: "consumer-app", motions: { plg: true, slg: false }, monetization: ticked });
    expect(setup.monetization).not.toBe(ticked);
    for (const answer of ["ss", "sa", "both"] as const) expect("monetization" in startDefaults(answer, ticked, TODAY).setup, answer).toBe(false);
  });

  it("with the type open: the SaaS's labels say SaaS, the app is a fourth answer, and the rest of the SaaS's card is as it was", () => {
    for (const [locale, text] of [["fr", FR], ["en", EN]] as const) {
      const closed = startCopy(text.strings, locale, "ss", TODAY, ["b2b-saas"], DEFAULT_APP_MONETIZATION).props;
      const open = startCopy(text.strings, locale, "ss", TODAY, BOTH_OPEN, DEFAULT_APP_MONETIZATION).props;
      const st = text.strings.start;
      expect(open.legend).toBe(st.legendTypes);
      expect(open.options.map((o) => o.value)).toEqual(["ss", "sa", "both", "app"]);
      expect(open.options.map((o) => o.label)).toEqual([st.ssTyped, st.saTyped, st.bothTyped, st.app]);
      expect(open.options.map((o) => o.note)).toEqual([st.ssNote, st.saNote, st.bothNote, st.appNote]);
      // The plan and the sentence of the defaults of the SaaS, word for word, the type open or not.
      expect(open.plan).toBe(closed.plan);
      expect(open.defaults).toBe(closed.defaults);
      expect("earns" in open).toBe(false);
    }
  });

  it("closed: no app option, whatever the monetization", () => {
    const closed = startCopy(FR.strings, "fr", "ss", TODAY, ["b2b-saas"], { subscriptions: true, purchases: true, ads: true }).props;
    expect(closed.options.map((o) => o.value)).toEqual(["ss", "sa", "both"]);
    expect(closed.legend).toBe(FR.strings.start.legend);
  });

  it("the app chosen: its three boxes as the card holds them, its plan, its sentence of defaults", () => {
    for (const [locale, text, month, cohort] of [["fr", FR, "août 2026", "juillet 2026"], ["en", EN, "August 2026", "July 2026"]] as const) {
      const monetization = { subscriptions: true, purchases: false, ads: true };
      const { props, defaults } = startCopy(text.strings, locale, "app", TODAY, BOTH_OPEN, monetization);
      const st = text.strings.start;
      expect(props.motion).toBe("app");
      expect(props.earns).toEqual({
        legend: st.appEarnsLegend,
        options: [
          { id: "subscriptions", label: st.appEarns.subscriptions },
          { id: "purchases", label: st.appEarns.purchases },
          { id: "ads", label: st.appEarns.ads },
        ],
        value: monetization,
      });
      expect(props.defaults).toBe(st.defaultsApp.replace("{month}", month).replace("{cohort}", cohort));
      expect(props.plan).toContain("20");
      expect(defaults.setup).toMatchObject({ type: "consumer-app", monetization });
    }
  });

  it("the app's card counts the subscriptions alone at 18, the number the spec names", () => {
    const { props } = startCopy(EN.strings, "en", "app", TODAY, BOTH_OPEN, DEFAULT_APP_MONETIZATION);
    expect(props.plan.startsWith("18 numbers")).toBe(true);
  });
});

/**
 * What the setup card writes on a save (§21.6.2, A22 APP-7). The card rebuilds the setup from zero: an app saved
 * without a change must come back with its type, its monetization and its tools, or the save erases them. Vitest mounts
 * no component (§23.8), so the rebuilding is a pure function of the card's fields, tested here.
 */
describe("setupOfCard", () => {
  const SAVED_APP: EngineSetup = {
    type: "consumer-app",
    motions: { plg: true, slg: false },
    monetization: { subscriptions: true, purchases: true, ads: false },
    currency: "EUR",
    activationWindowDays: 14,
    paidWindowDays: 60,
    qualificationWindowDays: 30,
    goLiveWindowDays: 90,
    companyLabel: "Calmly",
    tools: ["revenuecat", "stripe"],
    runwayMonths: 18,
    pipeline: { threshold: 3 },
  };
  /** The card as it opens on a setup: what its state holds before anyone touches it, through the same functions. */
  const opened = (setup: EngineSetup) => ({
    type: setup.type,
    motions: setup.motions,
    monetization: setup.monetization ?? DEFAULT_APP_MONETIZATION,
    currency: setup.currency,
    activationWindowDays: setup.activationWindowDays,
    paidWindowDays: setup.paidWindowDays,
    qualificationWindowDays: setup.qualificationWindowDays,
    goLiveWindowDays: setup.goLiveWindowDays,
    company: setup.companyLabel ?? "",
    tools: savedTools(teamTools(setup.tools, setup.type), setup.tools, setup.type),
    quarterTarget: setup.pipeline?.quarterTarget ?? null,
    threshold: setup.pipeline?.threshold ?? null,
    runway: setup.runwayMonths ?? null,
  });

  it("an app saved without a change keeps its type, its monetization, its tools and everything else", () => {
    const saved = setupOfCard(opened(SAVED_APP));
    expect(saved).toEqual(SAVED_APP);
    // A copy of what the card holds, never the card's own objects.
    expect(saved.monetization).not.toBe(SAVED_APP.monetization);
    expect(saved.motions).not.toBe(SAVED_APP.motions);
  });

  it("a tool the type does not offer, brought by a file, is kept once and unread; the app's own is never written twice", () => {
    const withHubspot: EngineSetup = { ...SAVED_APP, tools: ["revenuecat", "hubspot"] };
    expect(setupOfCard(opened(withHubspot)).tools).toEqual(["revenuecat", "hubspot"]);
  });

  it("what the app earns from, changed on the card, is what is written; a SaaS never carries the key", () => {
    const changed = setupOfCard({ ...opened(SAVED_APP), monetization: { subscriptions: false, purchases: true, ads: true } });
    expect(changed.monetization).toEqual({ subscriptions: false, purchases: true, ads: true });
    const saas = setupOfCard({ ...opened(SAVED_APP), type: "b2b-saas" });
    expect("monetization" in saas).toBe(false);
  });

  it("the optional fields stay out when empty, as before the app", () => {
    const bare = setupOfCard({ ...opened(SAVED_APP), company: "  ", tools: [], quarterTarget: null, threshold: null, runway: null });
    for (const key of ["companyLabel", "tools", "pipeline", "runwayMonths"]) expect(key in bare, key).toBe(false);
    expect(setupOfCard({ ...opened(SAVED_APP), quarterTarget: 0, threshold: -1 }).pipeline).toBeUndefined();
  });
});

/**
 * The marketplace on the start card (engine spec §22.6.1, A23 MKT-6): a fifth answer when the type is open (after the
 * app's, whether the app is open or not), its two answers of its own, its plan counted from its own numbers, and the
 * card of the SaaS and of the app untouched by any of it.
 *
 * Non-vacuity, measured on 2026-10-27 (each sabotage alone, the eleven nearest test files run — 405 tests, 406 for the last one measured, green before each —, the file put back and its sha compared; the count is the tests that fall): `typeOf("mkt")` answering the SaaS falls 4; `motionsOf("mkt")` leaving the self-serve box on 2; `startDefaults` writing
 * neither the offering nor the sellers' box 3; the marketplace's radio left out of `startCopy` 2; the card typed by the app alone (the marketplace open, the
 * app closed) 1; the marketplace's two answers never handed to the card 1; `motionsForCard` handing the marketplace's empty boxes back 2 (here, and the Settings card's markup).
 */
describe("the marketplace on the start card (§22.6.1)", () => {
  const TODAY = new Date(2026, 8, 24, 12);
  const BOTH_TYPES = ["b2b-saas", "consumer-app", "marketplace"] as const;
  const mkt = (sellerSubscriptions: boolean) => ({ type: "marketplace" as const, motions: motionsOf("mkt"), sellerSubscriptions });

  it("a marketplace ticks no selling motion, and its choice makes the marketplace type, never the SaaS's or the app's", () => {
    expect(motionsOf("mkt")).toEqual({ plg: false, slg: false });
    expect(typeOf("mkt")).toBe("marketplace");
    for (const answer of ["ss", "sa", "both"] as const) expect(typeOf(answer)).toBe("b2b-saas");
    expect(typeOf("app")).toBe("consumer-app");
    // The other answers keep the motions they had.
    expect(motionsOf("app")).toEqual({ plg: true, slg: false });
    expect(motionsOf("ss")).toEqual({ plg: true, slg: false });
    expect(motionsOf("both")).toEqual({ plg: true, slg: true });
  });

  it("its plan counts its own numbers: 19 with the sellers' subscription, 14 without (§22.4.1)", () => {
    for (const [sellerSubscriptions, n] of [[true, 19], [false, 14]] as const) {
      const plan = startPlan(mkt(sellerSubscriptions));
      expect(plan.n, `sellerSubscriptions ${sellerSubscriptions}`).toBe(n);
      expect(plan.n).toBe(shapesOf(mkt(sellerSubscriptions)).length);
      expect(plan.quick + plan.hour + plan.ask).toBe(plan.n);
      // The sentence has no singular: every count stays at 2 or more.
      expect(Math.min(plan.quick, plan.hour, plan.ask)).toBeGreaterThanOrEqual(2);
    }
  });

  it("a marketplace starts with its offering, whether the sellers pay, and the cohort matured for its longest window — May on 24 September", () => {
    const { setup, referenceMonth, cohortMonth } = startDefaults("mkt", DEFAULT_APP_MONETIZATION, TODAY);
    expect(setup).toMatchObject({ type: "marketplace", motions: { plg: false, slg: false }, currency: "EUR", offering: "products", sellerSubscriptions: false });
    expect(referenceMonth).toBe("2026-08");
    // 90 days with the defaults (the longest of 30, 90 and 60), not the SaaS's 30: May, not July.
    expect(cohortMonth).toBe("2026-05");
    expect(cohortMonth).toBe(defaultCohortMonth(setup, TODAY));
    // The windows are read with their defaults (D11): the start writes none, the settings card writes the three.
    for (const key of ["firstOrderWindowDays", "repeatWindowDays", "firstSaleWindowDays", "monetization"]) expect(key in setup, key).toBe(false);
  });

  it("what the card chose is what the setup holds, and a SaaS or an app carries none of it", () => {
    const { setup } = startDefaults("mkt", DEFAULT_APP_MONETIZATION, TODAY, { offering: "services", sellerSubscriptions: true });
    expect(setup).toMatchObject({ type: "marketplace", offering: "services", sellerSubscriptions: true });
    for (const answer of ["ss", "sa", "both", "app"] as const) {
      const other = startDefaults(answer, DEFAULT_APP_MONETIZATION, TODAY, { offering: "services", sellerSubscriptions: true }).setup;
      for (const key of ["offering", "sellerSubscriptions"]) expect(key in other, `${answer} ${key}`).toBe(false);
    }
  });

  it("with the marketplace open: a fifth radio after the app's, the labels typed, and the plan and sentence of the SaaS word for word", () => {
    for (const [locale, text] of [["fr", FR], ["en", EN]] as const) {
      const open = startCopy(text.strings, locale, "ss", TODAY, BOTH_TYPES, DEFAULT_APP_MONETIZATION).props;
      const closed = startCopy(text.strings, locale, "ss", TODAY, ["b2b-saas"], DEFAULT_APP_MONETIZATION).props;
      const st = text.strings.start;
      expect(open.legend).toBe(st.legendTypes);
      expect(open.options.map((o) => o.value)).toEqual(["ss", "sa", "both", "app", "mkt"]);
      expect(open.options.map((o) => o.label)).toEqual([st.ssTyped, st.saTyped, st.bothTyped, st.app, st.mkt]);
      expect(open.options.map((o) => o.note)).toEqual([st.ssNote, st.saNote, st.bothNote, st.appNote, st.mktNote]);
      expect(open.plan).toBe(closed.plan);
      expect(open.defaults).toBe(closed.defaults);
      expect("earns" in open).toBe(false);
      expect("mkt" in open).toBe(false);
    }
  });

  it("with the marketplace open and the app closed: the card is typed all the same, and the app has no radio", () => {
    const props = startCopy(FR.strings, "fr", "ss", TODAY, ["b2b-saas", "marketplace"], DEFAULT_APP_MONETIZATION).props;
    expect(props.legend).toBe(FR.strings.start.legendTypes);
    expect(props.options.map((o) => o.value)).toEqual(["ss", "sa", "both", "mkt"]);
    expect(props.options.map((o) => o.label)).toEqual([FR.strings.start.ssTyped, FR.strings.start.saTyped, FR.strings.start.bothTyped, FR.strings.start.mkt]);
  });

  it("closed, whatever the choice in progress: no marketplace radio, the SaaS's own card", () => {
    const props = startCopy(FR.strings, "fr", "ss", TODAY, ["b2b-saas", "consumer-app"], DEFAULT_APP_MONETIZATION).props;
    expect(props.options.map((o) => o.value)).toEqual(["ss", "sa", "both", "app"]);
  });

  it("the marketplace chosen: its words and its box as the card holds them, its plan, its sentence of defaults", () => {
    for (const [locale, text, month, cohort] of [["fr", FR, "août 2026", "mai 2026"], ["en", EN, "August 2026", "May 2026"]] as const) {
      const st = text.strings.start;
      const unpaid = startCopy(text.strings, locale, "mkt", TODAY, BOTH_TYPES, DEFAULT_APP_MONETIZATION);
      expect(unpaid.props.motion).toBe("mkt");
      expect(unpaid.props.mkt).toEqual({
        legend: st.mktOffering,
        options: [
          { value: "products", label: st.mktOfferingProducts },
          { value: "services", label: st.mktOfferingServices },
        ],
        offering: "products",
        subscriptionsLabel: st.mktSellerSubscriptions,
        sellerSubscriptions: false,
      });
      expect("earns" in unpaid.props).toBe(false);
      expect(unpaid.props.defaults).toBe(st.defaultsMkt.replace("{month}", month).replace("{cohort}", cohort));
      expect(unpaid.props.plan.startsWith("14 ")).toBe(true);
      expect(unpaid.defaults.setup).toMatchObject({ type: "marketplace", offering: "products", sellerSubscriptions: false });
      // The sellers paying: nineteen numbers, and the card says what was ticked and chosen.
      const paid = startCopy(text.strings, locale, "mkt", TODAY, BOTH_TYPES, DEFAULT_APP_MONETIZATION, { offering: "services", sellerSubscriptions: true });
      expect(paid.props.plan.startsWith("19 ")).toBe(true);
      expect(paid.props.mkt).toMatchObject({ offering: "services", sellerSubscriptions: true });
      expect(paid.defaults.setup).toMatchObject({ offering: "services", sellerSubscriptions: true });
    }
  });

  it("the SaaS's card opened on the marketplace's answer opens on self-serve, never on two empty boxes; any other answer is kept", () => {
    expect(motionsForCard(motionsOf("mkt"))).toEqual({ plg: true, slg: false });
    for (const answer of ["ss", "sa", "both", "app"] as const) expect(motionsForCard(motionsOf(answer)), answer).toEqual(motionsOf(answer));
    // A copy, never the state's object.
    const given = motionsOf("both");
    expect(motionsForCard(given)).not.toBe(given);
  });

  it("starts from products with the sellers paying nothing (D9, D10)", () => {
    expect(DEFAULT_MKT_START).toEqual({ offering: "products", sellerSubscriptions: false });
  });
});

/**
 * What the settings card writes for a marketplace (§22.6.1, MKT-R finding 35: « a field it forgets here is erased »). The
 * card rebuilds the setup from zero, so a marketplace saved without a change must come back with its offering, whether the
 * sellers pay and its three windows. Vitest mounts no component (§23.8): the rebuilding is `setupOfCard`'s, tested here.
 *
 * Non-vacuity, measured on 2026-10-27 (each sabotage alone, the eleven nearest test files run — 405 tests, 406 for the last one measured, green before each —, the file put back and its sha compared; the count is the tests that fall): the marketplace's fields left out of `setupOfCard` falls 4 (three here, and the save that writes the defaults); one window left out of them 4.
 */
describe("setupOfCard, a marketplace (§22.6.1)", () => {
  const SAVED: EngineSetup = {
    type: "marketplace",
    motions: { plg: false, slg: false },
    offering: "services",
    sellerSubscriptions: true,
    firstOrderWindowDays: 7,
    repeatWindowDays: 180,
    firstSaleWindowDays: 90,
    currency: "EUR",
    activationWindowDays: 7,
    paidWindowDays: 30,
    qualificationWindowDays: 30,
    goLiveWindowDays: 90,
    companyLabel: "Meublix",
    // In the order the marketplace's families list them (analytics, then billing): the order the card writes.
    tools: ["ga4", "stripe"],
    runwayMonths: 18,
  };
  /** The card as it opens on a setup: what its state holds before anyone touches it, through the same functions. */
  const opened = (setup: EngineSetup): SetupCard => {
    const held = mktSetup(setup);
    return {
      type: setup.type,
      motions: setup.motions,
      monetization: setup.monetization ?? DEFAULT_APP_MONETIZATION,
      offering: held.offering,
      sellerSubscriptions: held.sellerSubscriptions,
      firstOrderWindowDays: held.firstOrderWindowDays,
      repeatWindowDays: held.repeatWindowDays,
      firstSaleWindowDays: held.firstSaleWindowDays,
      currency: setup.currency,
      activationWindowDays: setup.activationWindowDays,
      paidWindowDays: setup.paidWindowDays,
      qualificationWindowDays: setup.qualificationWindowDays,
      goLiveWindowDays: setup.goLiveWindowDays,
      company: setup.companyLabel ?? "",
      tools: savedTools(teamTools(setup.tools, setup.type), setup.tools, setup.type),
      quarterTarget: setup.pipeline?.quarterTarget ?? null,
      threshold: setup.pipeline?.threshold ?? null,
      runway: setup.runwayMonths ?? null,
    };
  };

  it("saved without a change, a marketplace keeps its offering, its sellers' subscription, its three windows and everything else", () => {
    const saved = setupOfCard(opened(SAVED));
    expect(saved).toEqual(SAVED);
    expect(saved.motions).not.toBe(SAVED.motions);
    expect("monetization" in saved).toBe(false);
  });

  it("each field changed on the card is the one written", () => {
    const base = opened(SAVED);
    expect(setupOfCard({ ...base, offering: "products" })).toMatchObject({ offering: "products", sellerSubscriptions: true, firstOrderWindowDays: 7 });
    expect(setupOfCard({ ...base, sellerSubscriptions: false })).toMatchObject({ offering: "services", sellerSubscriptions: false, repeatWindowDays: 180 });
    expect(setupOfCard({ ...base, firstOrderWindowDays: 90 }).firstOrderWindowDays).toBe(90);
    expect(setupOfCard({ ...base, repeatWindowDays: 60 }).repeatWindowDays).toBe(60);
    expect(setupOfCard({ ...base, firstSaleWindowDays: 30 }).firstSaleWindowDays).toBe(30);
  });

  it("a card that holds none of the five (a start that wrote none, D11) writes their defaults, never a hole", () => {
    const { offering: _o, sellerSubscriptions: _s, firstOrderWindowDays: _f, repeatWindowDays: _r, firstSaleWindowDays: _w, ...bare } = opened(SAVED);
    expect(setupOfCard(bare)).toMatchObject({ offering: "products", sellerSubscriptions: false, firstOrderWindowDays: 30, repeatWindowDays: 90, firstSaleWindowDays: 60 });
  });

  it("a SaaS and an app carry none of the marketplace's fields, whatever the card holds", () => {
    for (const type of ["b2b-saas", "consumer-app"] as const) {
      const saved = setupOfCard({ ...opened(SAVED), type, motions: { plg: true, slg: false } });
      for (const key of ["offering", "sellerSubscriptions", "firstOrderWindowDays", "repeatWindowDays", "firstSaleWindowDays"]) expect(key in saved, `${type} ${key}`).toBe(false);
    }
  });
});

/**
 * The cohort the card follows (§22.2.3, MKT-R finding 34): it reads `cohortWindowOf` where it read `Math.max(30, paid)`,
 * and `defaultCohortMonth` is the same rule on a whole setup — the two must month alike, or the card would open on July
 * where the start screen's sentence says May.
 */
describe("cohortWindowOf", () => {
  const TODAY = new Date(2026, 8, 24, 12);
  const base = { paidWindowDays: 30 as const };

  it("a SaaS and an app: the payment window, 30 days at the least", () => {
    for (const type of ["b2b-saas", "consumer-app"] as const) {
      expect(cohortWindowOf({ type, paidWindowDays: 30 })).toBe(30);
      expect(cohortWindowOf({ type, paidWindowDays: 60 })).toBe(60);
      expect(cohortWindowOf({ type, paidWindowDays: 90 })).toBe(90);
      // The marketplace's windows mean nothing to them.
      expect(cohortWindowOf({ type, ...base, repeatWindowDays: 180 })).toBe(30);
    }
  });

  it("a marketplace: the longest of its three, 90 days with the defaults, whatever the payment window", () => {
    expect(cohortWindowOf({ type: "marketplace", ...base })).toBe(90);
    expect(cohortWindowOf({ type: "marketplace", paidWindowDays: 90, firstOrderWindowDays: 7, repeatWindowDays: 60, firstSaleWindowDays: 30 })).toBe(60);
    expect(cohortWindowOf({ type: "marketplace", ...base, repeatWindowDays: 180 })).toBe(180);
    expect(cohortWindowOf({ type: "marketplace", ...base, firstOrderWindowDays: 90, repeatWindowDays: 60, firstSaleWindowDays: 30 })).toBe(90);
  });

  it("matures the very month `defaultCohortMonth` does, for every window a card offers", () => {
    for (const paid of [30, 60, 90] as const) {
      for (const first of [7, 30, 90] as const) {
        for (const repeat of [60, 90, 180] as const) {
          for (const sale of [30, 60, 90] as const) {
            const setup: EngineSetup = {
              ...startDefaults("mkt", DEFAULT_APP_MONETIZATION, TODAY).setup,
              paidWindowDays: paid,
              firstOrderWindowDays: first,
              repeatWindowDays: repeat,
              firstSaleWindowDays: sale,
            };
            expect(matureCohortMonth(cohortWindowOf(setup), TODAY), JSON.stringify([paid, first, repeat, sale])).toBe(defaultCohortMonth(setup, TODAY));
          }
        }
      }
      const saas = { ...startDefaults("ss", DEFAULT_APP_MONETIZATION, TODAY).setup, paidWindowDays: paid };
      expect(matureCohortMonth(cohortWindowOf(saas), TODAY)).toBe(defaultCohortMonth(saas, TODAY));
    }
  });
});

/**
 * What a change of window does when the Settings are saved (§22.6.1, MKT-R finding 33, « bloquant »): `withSettings` deletes
 * the number the window defines, as it does for the SaaS's four, and `settingsExisting` is what the card asks before. A window
 * is compared as `mktSetup` reads it: the start card writes none (D11), the settings card writes the three, and a card that
 * writes the default over an absent one changes nothing — or saving the Settings untouched would erase two numbers.
 *
 * Non-vacuity, measured on 2026-10-27 (each sabotage alone, the eleven nearest test files run — 405 tests, 406 for the last one measured, green before each —, the file put back and its sha compared; the count is the tests that fall): the first sale's window no longer sending the sellers' paid conversion back falls 2; windows compared raw, without `mktSetup` (an absent one against its default), 1; `settingsExisting` reading the first sale alone 1; and, for `cohortWindowOf`, the marketplace read as 30 days 3 (two here, and the Settings card's hint).
 */
describe("withSettings and settingsExisting, a marketplace (§22.6.1)", () => {
  const MONTHS = { referenceMonth: "2026-08" as const, cohortMonth: "2026-05" as const };
  const kept = (state: EngineState) => Object.keys(state.snapshots.at(-1)!.metrics).sort() as MetricId[];
  /** The numbers the three windows define, and the numbers they do not. */
  const FIRST_ORDER: MetricId[] = ["mkt.buy.first-order"];
  const REPEAT: MetricId[] = ["mkt.buy.repeat"];
  const FIRST_SALE: MetricId[] = ["mkt.sell.first-sale", "mkt.sell.paid-conversion"];
  const settle = (setup: Partial<EngineSetup>) => {
    const state = marketplaceState();
    return { state, saved: withSettings(state, { ...state.setup, ...setup }, MONTHS.referenceMonth, MONTHS.cohortMonth) };
  };
  const lost = (setup: Partial<EngineSetup>) => {
    const { state, saved } = settle(setup);
    return kept(state).filter((id) => !kept(saved).includes(id));
  };

  it("the example holds all of them before any change", () => {
    const entered = kept(marketplaceState());
    for (const id of [...FIRST_ORDER, ...REPEAT, ...FIRST_SALE]) expect(entered, id).toContain(id);
  });

  it("the first order's window sends the first order back to « à faire », and nothing else", () => {
    expect(lost({ firstOrderWindowDays: 7 })).toEqual(FIRST_ORDER);
    expect(lost({ firstOrderWindowDays: 90 })).toEqual(FIRST_ORDER);
  });

  it("the second order's window sends the second order back, and nothing else", () => {
    expect(lost({ repeatWindowDays: 180 })).toEqual(REPEAT);
    expect(lost({ repeatWindowDays: 60 })).toEqual(REPEAT);
  });

  it("the first sale's window sends back the first sale AND the sellers' paid conversion, and nothing else", () => {
    expect(lost({ firstSaleWindowDays: 90 })).toEqual([...FIRST_SALE].sort());
    expect(lost({ firstSaleWindowDays: 30 })).toEqual([...FIRST_SALE].sort());
  });

  it("two windows changed together send back what each defines", () => {
    expect(lost({ repeatWindowDays: 180, firstSaleWindowDays: 90 })).toEqual([...REPEAT, ...FIRST_SALE].sort());
  });

  it("a window written at the value it already had (its default, over an absent one) sends nothing back", () => {
    // The start card writes none of the three; the settings card writes all three with their defaults on a save.
    expect(marketplaceState().setup.firstOrderWindowDays).toBeUndefined();
    expect(lost({ firstOrderWindowDays: 30, repeatWindowDays: 90, firstSaleWindowDays: 60 })).toEqual([]);
    expect(lost({})).toEqual([]);
    // And the card's own rebuild of the setup is exactly that.
    const state = marketplaceState();
    const card = setupOfCard({
      type: state.setup.type,
      motions: state.setup.motions,
      monetization: DEFAULT_APP_MONETIZATION,
      currency: state.setup.currency,
      activationWindowDays: state.setup.activationWindowDays,
      paidWindowDays: state.setup.paidWindowDays,
      qualificationWindowDays: state.setup.qualificationWindowDays,
      goLiveWindowDays: state.setup.goLiveWindowDays,
      company: "",
      tools: [],
      quarterTarget: null,
      threshold: null,
      runway: null,
    });
    expect(card).toMatchObject({ offering: "products", sellerSubscriptions: false, firstOrderWindowDays: 30, repeatWindowDays: 90, firstSaleWindowDays: 60 });
    const saved = withSettings(state, { ...card, sellerSubscriptions: true }, MONTHS.referenceMonth, MONTHS.cohortMonth);
    expect(kept(saved)).toEqual(kept(state));
  });

  it("the other settings send nothing back: the offering, the sellers' box, the currency, the SaaS's windows", () => {
    expect(lost({ offering: "services" })).toEqual([]);
    expect(lost({ sellerSubscriptions: false })).toEqual([]);
    expect(lost({ currency: "USD" })).toEqual([]);
    expect(lost({ activationWindowDays: 14, paidWindowDays: 60, qualificationWindowDays: 60, goLiveWindowDays: 30 })).toEqual([]);
  });

  it("writes the setup and the months it is given, and keeps the targets and the month's other fields", () => {
    const { state, saved } = settle({ repeatWindowDays: 180, offering: "services" });
    expect(saved.setup).toMatchObject({ type: "marketplace", offering: "services", repeatWindowDays: 180 });
    const last = saved.snapshots.at(-1)!;
    expect(last.referenceMonth).toBe(MONTHS.referenceMonth);
    expect(last.cohortMonth).toBe(MONTHS.cohortMonth);
    expect(last.targets).toEqual(state.snapshots.at(-1)!.targets);
    expect(last.base).toEqual(state.snapshots.at(-1)!.base);
  });

  it("the SaaS keeps its four windows' rule: activation and payment send their numbers back, a marketplace window means nothing to it", () => {
    const state = exampleState();
    const moved = withSettings(state, { ...state.setup, activationWindowDays: 14 }, MONTHS.referenceMonth, MONTHS.cohortMonth);
    expect(kept(state)).toContain("act.rate");
    expect(kept(moved)).not.toContain("act.rate");
    expect(kept(moved)).toContain("rev.paid-conversion");
    const unchanged = withSettings(state, { ...state.setup }, MONTHS.referenceMonth, MONTHS.cohortMonth);
    expect(kept(unchanged)).toEqual(kept(state));
  });

  it("settingsExisting: which of the three a window change would reach, from what is entered — the first sale's by either of its two", () => {
    const state = marketplaceState();
    const snapshot = state.snapshots.at(-1)!;
    expect(settingsExisting(snapshot)).toMatchObject({ firstOrder: true, repeat: true, firstSale: true, any: true });
    const without = (...ids: MetricId[]) => ({ ...snapshot, metrics: Object.fromEntries(Object.entries(snapshot.metrics).filter(([id]) => !ids.includes(id as MetricId))) });
    expect(settingsExisting(without(...FIRST_ORDER))).toMatchObject({ firstOrder: false, repeat: true, firstSale: true });
    expect(settingsExisting(without(...REPEAT))).toMatchObject({ firstOrder: true, repeat: false, firstSale: true });
    // One of the two is enough: the window defines both.
    expect(settingsExisting(without("mkt.sell.first-sale"))).toMatchObject({ firstSale: true });
    expect(settingsExisting(without("mkt.sell.paid-conversion"))).toMatchObject({ firstSale: true });
    expect(settingsExisting(without(...FIRST_SALE))).toMatchObject({ firstSale: false });
    expect(settingsExisting({ ...snapshot, metrics: {} })).toEqual({ activation: false, paid: false, qualification: false, goLive: false, firstOrder: false, repeat: false, firstSale: false, any: false });
    // A SaaS reads the same four it always did.
    expect(settingsExisting(exampleState().snapshots[0]!)).toMatchObject({ activation: true, paid: true, firstOrder: false, repeat: false, firstSale: false });
  });
});
