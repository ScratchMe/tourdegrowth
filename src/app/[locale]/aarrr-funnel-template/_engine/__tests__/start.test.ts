import { describe, expect, it } from "vitest";
import { shapesOf } from "@/lib/engine/catalog-shape";
import { EN, FR } from "@/lib/engine/__tests__/props";
import { DEFAULT_APP_MONETIZATION } from "@/lib/engine/setup-type";
import { savedTools, teamTools } from "@/lib/engine/tools";
import type { EngineSetup } from "@/lib/engine/types";
import { motionsOf, setupOfCard, startCopy, startDefaults, startMotionOf, startPlan, typeOf } from "../start";

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
