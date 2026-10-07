import type { EngineStartProps, StartChoice } from "@/components/engine/EngineStart";
import type { AppMonetization } from "@/lib/engine/app-model";
import { shapesOf, type SetupShapes } from "@/lib/engine/catalog-shape";
import { defaultCohortMonth, defaultReferenceMonth } from "@/lib/engine/cohort";
import type { EngineStrings } from "@/lib/engine/strings";
import { SETUP_V2_DEFAULTS, type BusinessType, type Currency, type EngineSetup, type Motion, type ToolId, type YearMonth } from "@/lib/engine/types";
import { isApp } from "@/lib/engine/setup-type";
import type { Locale } from "@/lib/i18n/locale";
import { fill, formatMonth } from "./text";

/** The currency an engine starts in: the start screen's sentence says « en euros » (`start.defaults`). */
export const DEFAULT_CURRENCY: Currency = "EUR";
/** The two self-serve windows an engine starts with, the v1 defaults. */
export const DEFAULT_WINDOWS = { activationWindowDays: 7, paidWindowDays: 30 } as const satisfies Pick<EngineSetup, "activationWindowDays" | "paidWindowDays">;

/**
 * The type a start choice creates (§21.6.1): the app's own card is a consumer app, the three ways of selling are the
 * SaaS's. Reads the choice, never an engine's type (`business-type.test.ts`, guard 3).
 */
export function typeOf(choice: StartChoice): BusinessType {
  return choice === "app" ? "consumer-app" : "b2b-saas";
}

/**
 * Everything the start screen does not ask (brief 07 Q4): the defaults the
 * full setup card opens on, and what « Commencer » creates. The months are
 * the ones the screen SHOWS — computed from the same `today` — not the
 * engine's own fallback: the two can differ around midnight. A consumer app
 * also writes what it earns from (§21.6.1); a SaaS carries no such key.
 */
export function startDefaults(choice: StartChoice, monetization: AppMonetization, today: Date): { setup: EngineSetup; referenceMonth: YearMonth; cohortMonth: YearMonth } {
  const type = typeOf(choice);
  const setup: EngineSetup = {
    type,
    motions: motionsOf(choice),
    currency: DEFAULT_CURRENCY,
    ...DEFAULT_WINDOWS,
    qualificationWindowDays: SETUP_V2_DEFAULTS.qualificationWindowDays,
    goLiveWindowDays: SETUP_V2_DEFAULTS.goLiveWindowDays,
    // A copy: the screen's boxes are never the state's object.
    ...(type === "consumer-app" ? { monetization: { ...monetization } } : {}),
  };
  return { setup, referenceMonth: defaultReferenceMonth(today), cohortMonth: defaultCohortMonth(setup, today) };
}

/**
 * The first screen's one question (design system extension 07, A18 T3.a):
 * how the company sells, as one radio group — self-serve, sales-assisted or
 * both — over the model's two motion booleans, which do not change. A
 * consumer app sells self-serve only (§21.1 D1).
 */
export function motionsOf(choice: StartChoice): Record<Motion, boolean> {
  return { plg: choice !== "sa", slg: choice === "sa" || choice === "both" };
}

/** The radio a setup's motions read as. Neither ticked cannot be stored (`shapesOf` throws): it reads as self-serve. */
export function startMotionOf(motions: Readonly<Record<Motion, boolean>>): StartChoice {
  if (motions.plg && motions.slg) return "both";
  return motions.slg ? "sa" : "ss";
}

/**
 * « 17 chiffres : 5 se lisent en cinq minutes, 7 demandent environ une heure
 * chacun, 5 sont à demander à quelqu'un » — from the catalogue's effort tags,
 * never typed: 17, 15 or 33 numbers for a SaaS (the hybrid's link counts, as
 * it does on the board), an app's own count for its monetization. A number to
 * build counts with the hour-long ones.
 */
export function startPlan(setup: SetupShapes): { n: number; quick: number; hour: number; ask: number } {
  const shapes = shapesOf(setup);
  const count = (efforts: readonly string[]) => shapes.filter((s) => efforts.includes(s.effort)).length;
  return { n: shapes.length, quick: count(["self-5min"]), hour: count(["self-1h", "build"]), ask: count(["ask"]) };
}

/** What `EngineStart` is given for the app's boxes, before its caller adds the two functions and the message. */
export type StartEarnsCopy = Omit<NonNullable<EngineStartProps["earns"]>, "onChange" | "error">;

/**
 * The start screen's words and defaults (design system extension 07, A18
 * T3.a; the app's card, §21.6.1): how the company sells, the plan its answer
 * means, and every other default in one sentence. A Tour with answers on this
 * device is linked at « Commencer », as the setup's box was ticked by default
 * (C8); the Settings and the board's mirror unlink or link it.
 *
 * Closed to the app (`openTypes` without `"consumer-app"`), the card is the
 * SaaS's alone, to the character: `start.test.ts` pins it. Open, the legend
 * and the three labels say « SaaS B2B », and the app is a fourth answer.
 * Returns the `EngineStart` props without their functions.
 */
export function startCopy(strings: EngineStrings, locale: Locale, choice: StartChoice, today: Date, openTypes: readonly BusinessType[], monetization: AppMonetization) {
  const st = strings.start;
  const typed = openTypes.includes("consumer-app");
  const defaults = startDefaults(choice, monetization, today);
  const motions = defaults.setup.motions;
  const options: EngineStartProps["options"] = [
    { value: "ss", label: typed ? st.ssTyped : st.ss, note: st.ssNote },
    { value: "sa", label: typed ? st.saTyped : st.sa, note: st.saNote },
    { value: "both", label: typed ? st.bothTyped : st.both, note: st.bothNote },
    ...(typed ? [{ value: "app" as const, label: st.app, note: st.appNote }] : []),
  ];
  const months = { month: formatMonth(defaults.referenceMonth, locale), cohort: formatMonth(defaults.cohortMonth, locale) };
  const props = {
    title: strings.setup.title,
    legend: typed ? st.legendTypes : st.legend,
    options,
    motion: choice,
    plan: fill(st.plan, startPlan(defaults.setup)),
    // An app says its own type; sales-assisted alone follows no self-serve cohort (D7): its three months are in the settings.
    defaults: fill(choice === "app" ? st.defaultsApp : motions.plg ? st.defaults : st.defaultsSlg, months),
    changeLabel: st.change,
    startLabel: st.go,
    ...(choice === "app"
      ? {
          earns: {
            legend: st.appEarnsLegend,
            options: [
              { id: "subscriptions" as const, label: st.appEarns.subscriptions },
              { id: "purchases" as const, label: st.appEarns.purchases },
              { id: "ads" as const, label: st.appEarns.ads },
            ],
            value: monetization,
          } satisfies StartEarnsCopy,
        }
      : {}),
  };
  return { props, defaults };
}

/** What the setup card holds when it is saved (§21.6.2): the fields of an engine's setup as the card keeps them. */
export interface SetupCard {
  type: BusinessType;
  motions: Readonly<Record<Motion, boolean>>;
  /** Read for an app only. */
  monetization: AppMonetization;
  currency: Currency;
  activationWindowDays: EngineSetup["activationWindowDays"];
  paidWindowDays: EngineSetup["paidWindowDays"];
  qualificationWindowDays: EngineSetup["qualificationWindowDays"];
  goLiveWindowDays: EngineSetup["goLiveWindowDays"];
  company: string;
  /** `savedTools`: the ticked ones the type offers, then the ones the setup held that it does not. */
  tools: readonly ToolId[];
  quarterTarget: number | null;
  threshold: number | null;
  runway: number | null;
}

/**
 * The setup a save of the card writes. The card rebuilds the setup from zero, so a field it forgets here is erased:
 * the type and, for an app, what it earns from are written (§21.6.2), the tools, the pipeline and the runway kept.
 */
export function setupOfCard(card: SetupCard): EngineSetup {
  const pipeline = {
    ...(card.quarterTarget !== null && card.quarterTarget > 0 ? { quarterTarget: card.quarterTarget } : {}),
    ...(card.threshold !== null && card.threshold > 0 ? { threshold: card.threshold } : {}),
  };
  return {
    type: card.type,
    // A copy: the state's object is never the card's.
    motions: { ...card.motions },
    // What an app earns from; a SaaS carries no such key.
    ...(isApp(card) ? { monetization: { ...card.monetization } } : {}),
    currency: card.currency,
    activationWindowDays: card.activationWindowDays,
    paidWindowDays: card.paidWindowDays,
    qualificationWindowDays: card.qualificationWindowDays,
    goLiveWindowDays: card.goLiveWindowDays,
    ...(card.company.trim() ? { companyLabel: card.company.trim() } : {}),
    ...(card.tools.length > 0 ? { tools: [...card.tools] } : {}),
    ...(Object.keys(pipeline).length > 0 ? { pipeline } : {}),
    // Kept across a save: a runway left out would be erased.
    ...(card.runway !== null ? { runwayMonths: card.runway } : {}),
  };
}
