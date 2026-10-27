import type { EngineStartProps, StartChoice, StartOffering } from "@/components/engine/EngineStart";
import type { AppMonetization } from "@/lib/engine/app-model";
import { shapesOf, type SetupShapes } from "@/lib/engine/catalog-shape";
import { defaultCohortMonth, defaultReferenceMonth } from "@/lib/engine/cohort";
import type { EngineStrings } from "@/lib/engine/strings";
import { SETUP_V2_DEFAULTS, type BusinessType, type Currency, type EngineSetup, type EngineState, type Motion, type Snapshot, type ToolId, type YearMonth } from "@/lib/engine/types";
import { isApp, isMarketplace, MKT_DEFAULTS, mktSetup } from "@/lib/engine/setup-type";
import type { Locale } from "@/lib/i18n/locale";
import { fill, formatMonth } from "./text";

/** The currency an engine starts in: the start screen's sentence says « en euros » (`start.defaults`). */
export const DEFAULT_CURRENCY: Currency = "EUR";
/** The two self-serve windows an engine starts with, the v1 defaults. */
export const DEFAULT_WINDOWS = { activationWindowDays: 7, paidWindowDays: 30 } as const satisfies Pick<EngineSetup, "activationWindowDays" | "paidWindowDays">;

/**
 * The type a start choice creates (§21.6.1, §22.6.1): the app's own card is a consumer app, the marketplace's a
 * marketplace, the three ways of selling are the SaaS's. Reads the choice, never an engine's type
 * (`business-type.test.ts`, guard 3).
 */
export function typeOf(choice: StartChoice): BusinessType {
  return choice === "app" ? "consumer-app" : choice === "mkt" ? "marketplace" : "b2b-saas";
}

/**
 * What the start card holds for a marketplace beyond the choice itself (§22.6.1): the words it is read in and whether
 * the sellers pay a subscription, which the setup stores as `offering` and `sellerSubscriptions`.
 */
export interface MktStart {
  offering: StartOffering;
  sellerSubscriptions: boolean;
}
/** The marketplace card's start: products, and the sellers pay nothing (D9, D10): what a setup reads when it says nothing. */
export const DEFAULT_MKT_START: MktStart = { offering: MKT_DEFAULTS.offering, sellerSubscriptions: MKT_DEFAULTS.sellerSubscriptions };

/**
 * The type a click on the settings card's type choice picks, or null when this build does not open it (§21.3). The
 * guard reads the types the build opens (`openTypes`, the SaaS always among them: `ALWAYS_OPEN_TYPE`), never the whole
 * list of types: a type that exists but is not opened (the marketplace, while `MARKETPLACE_SCREENS_READY` is false) is
 * no choice, whatever the dashed option's `disabled` says.
 */
export function pickedType(next: string, openTypes: readonly BusinessType[]): BusinessType | null {
  return openTypes.find((type) => type === next) ?? null;
}

/**
 * Everything the start screen does not ask (brief 07 Q4): the defaults the
 * full setup card opens on, and what « Commencer » creates. The months are
 * the ones the screen SHOWS — computed from the same `today` — not the
 * engine's own fallback: the two can differ around midnight. A consumer app
 * also writes what it earns from (§21.6.1), a marketplace its offering and
 * whether the sellers pay (§22.6.1; its three windows are read with their
 * defaults, D11, and its cohort is the one matured for the longest of them,
 * `defaultCohortMonth`); a SaaS carries none of these keys.
 */
export function startDefaults(
  choice: StartChoice,
  monetization: AppMonetization,
  today: Date,
  mkt: MktStart = DEFAULT_MKT_START,
): { setup: EngineSetup; referenceMonth: YearMonth; cohortMonth: YearMonth } {
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
    ...(type === "marketplace" ? { offering: mkt.offering, sellerSubscriptions: mkt.sellerSubscriptions } : {}),
  };
  return { setup, referenceMonth: defaultReferenceMonth(today), cohortMonth: defaultCohortMonth(setup, today) };
}

/**
 * The first screen's one question (design system extension 07, A18 T3.a):
 * how the company sells, as one radio group — self-serve, sales-assisted or
 * both — over the model's two motion booleans, which do not change. A
 * consumer app sells self-serve only (§21.1 D1); a marketplace ticks no
 * motion at all, its own is derived (§22.1 D1, §22.3).
 */
export function motionsOf(choice: StartChoice): Record<Motion, boolean> {
  return { plg: choice !== "sa" && choice !== "mkt", slg: choice === "sa" || choice === "both" };
}

/**
 * The two motion boxes the setup card of a SaaS opens on, given the motions it was handed: the start screen's answer, or a saved
 * engine's. A marketplace ticks none (§22.3), so a card opened on its answer and then switched to the SaaS would show two empty
 * boxes, and « Commencer » would refuse it: neither ticked opens on self-serve, the default of every start (C25 Q16).
 */
export function motionsForCard(given: Readonly<Record<Motion, boolean>>): Record<Motion, boolean> {
  return given.plg || given.slg ? { ...given } : { ...SETUP_V2_DEFAULTS.motions };
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

/** What `EngineStart` is given for the marketplace's two answers, before its caller adds their two functions (§22.6.1). */
export type StartMktCopy = Omit<NonNullable<EngineStartProps["mkt"]>, "onOfferingChange" | "onSellerSubscriptionsChange">;

/**
 * The start screen's words and defaults (design system extension 07, A18
 * T3.a; the app's card, §21.6.1): how the company sells, the plan its answer
 * means, and every other default in one sentence. A Tour with answers on this
 * device is linked at « Commencer », as the setup's box was ticked by default
 * (C8); the Settings and the board's mirror unlink or link it.
 *
 * Closed to the other types (`openTypes` holding the SaaS alone), the card is
 * the SaaS's alone, to the character: `start.test.ts` pins it. With another
 * type open, the legend and the three labels say « SaaS B2B », and the app
 * and the marketplace are further answers, in that order, each when its type
 * is open (§22.6.1). The marketplace's two answers, its offering and its
 * sellers' subscription, are its own and are asked under the choice, as the
 * app's ways of earning are. Returns the `EngineStart` props without their
 * functions.
 */
export function startCopy(
  strings: EngineStrings,
  locale: Locale,
  choice: StartChoice,
  today: Date,
  openTypes: readonly BusinessType[],
  monetization: AppMonetization,
  mkt: MktStart = DEFAULT_MKT_START,
) {
  const st = strings.start;
  const appOpen = openTypes.includes("consumer-app");
  const mktOpen = openTypes.includes("marketplace");
  // Typed as soon as the card offers more than the three ways of selling: the question is no longer only how you sell.
  const typed = appOpen || mktOpen;
  const defaults = startDefaults(choice, monetization, today, mkt);
  const motions = defaults.setup.motions;
  const options: EngineStartProps["options"] = [
    { value: "ss", label: typed ? st.ssTyped : st.ss, note: st.ssNote },
    { value: "sa", label: typed ? st.saTyped : st.sa, note: st.saNote },
    { value: "both", label: typed ? st.bothTyped : st.both, note: st.bothNote },
    ...(appOpen ? [{ value: "app" as const, label: st.app, note: st.appNote }] : []),
    ...(mktOpen ? [{ value: "mkt" as const, label: st.mkt, note: st.mktNote }] : []),
  ];
  const months = { month: formatMonth(defaults.referenceMonth, locale), cohort: formatMonth(defaults.cohortMonth, locale) };
  const props = {
    title: strings.setup.title,
    legend: typed ? st.legendTypes : st.legend,
    options,
    motion: choice,
    plan: fill(st.plan, startPlan(defaults.setup)),
    // An app says its own type; sales-assisted alone follows no self-serve cohort (D7): its three months are in the settings.
    defaults: fill(choice === "app" ? st.defaultsApp : choice === "mkt" ? st.defaultsMkt : motions.plg ? st.defaults : st.defaultsSlg, months),
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
    ...(choice === "mkt"
      ? {
          mkt: {
            legend: st.mktOffering,
            options: [
              { value: "products" as const, label: st.mktOfferingProducts },
              { value: "services" as const, label: st.mktOfferingServices },
            ],
            offering: mkt.offering,
            subscriptionsLabel: st.mktSellerSubscriptions,
            sellerSubscriptions: mkt.sellerSubscriptions,
          } satisfies StartMktCopy,
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
  /** Read for a marketplace only (§22.6.1): the words it is read in, whether the sellers pay, and its three windows. Absent: their defaults (D11). */
  offering?: StartOffering;
  sellerSubscriptions?: boolean;
  firstOrderWindowDays?: EngineSetup["firstOrderWindowDays"];
  repeatWindowDays?: EngineSetup["repeatWindowDays"];
  firstSaleWindowDays?: EngineSetup["firstSaleWindowDays"];
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
 * the type and, for an app, what it earns from are written (§21.6.2), and, for a marketplace, its offering, whether the
 * sellers pay and its three windows (§22.6.1: saving the Settings must keep them); the tools, the pipeline and the runway kept.
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
    // A marketplace's own fields, each as the card holds it or its default; a SaaS and an app carry none.
    ...(isMarketplace(card) ? marketplaceFields(card) : {}),
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

/** A marketplace's own setup fields as a card writes them: `mktSetup` reads each from the card or its default, so none is ever left out. */
function marketplaceFields(card: SetupCard): Pick<EngineSetup, "offering" | "sellerSubscriptions" | "firstOrderWindowDays" | "repeatWindowDays" | "firstSaleWindowDays"> {
  const { offering, sellerSubscriptions, firstOrderWindowDays, repeatWindowDays, firstSaleWindowDays } = mktSetup(card);
  return { offering, sellerSubscriptions, firstOrderWindowDays, repeatWindowDays, firstSaleWindowDays };
}

/**
 * The longest window the followed cohort must have had (§6.3): self-serve's payment window, 30 days at the least; a
 * marketplace's longest of its three (§22.2.3, 90 days with the defaults). The setup card reads it for its default
 * cohort and the hint under it; `defaultCohortMonth` is the same rule on a whole setup, and `start.test.ts` holds that
 * the two month from the same window.
 */
export function cohortWindowOf(setup: Pick<EngineSetup, "type" | "paidWindowDays" | "firstOrderWindowDays" | "repeatWindowDays" | "firstSaleWindowDays">): number {
  if (isMarketplace(setup)) {
    const { firstOrderWindowDays, repeatWindowDays, firstSaleWindowDays } = mktSetup(setup);
    return Math.max(firstOrderWindowDays, repeatWindowDays, firstSaleWindowDays);
  }
  return Math.max(30, setup.paidWindowDays);
}

/**
 * The engine with new settings (Antoine, 2026-09-25: they could not be
 * changed without erasing everything). A window is part of a number's
 * definition — activation within n days, paid within n days — so changing
 * it sends that number back to "to fill in": kept, it would claim a
 * definition it was not measured on. The settings card says so before the
 * save (`settingsExisting`). A month changed keeps every entry: the card asks
 * to reread them.
 *
 * Here since A23 MKT-6, next to `setupOfCard`, which writes the setup it is given: a unit test holds the three windows of a
 * marketplace (§22.6.1), which a component cannot be mounted to show (§23.8).
 */
export function withSettings(state: EngineState, setup: EngineSetup, referenceMonth: YearMonth, cohortMonth: YearMonth): EngineState {
  const snapshot = state.snapshots[state.snapshots.length - 1]!;
  const metrics = { ...snapshot.metrics };
  if (setup.activationWindowDays !== state.setup.activationWindowDays) delete metrics["act.rate"];
  if (setup.paidWindowDays !== state.setup.paidWindowDays) delete metrics["rev.paid-conversion"];
  // The sales-assisted windows are part of their numbers' definitions too (§18.1.2): the same rule.
  if (setup.qualificationWindowDays !== state.setup.qualificationWindowDays) delete metrics["slg.acq.lead-to-opp"];
  if (setup.goLiveWindowDays !== state.setup.goLiveWindowDays) delete metrics["slg.act.go-live"];
  // A marketplace's three are the same (§22.6.1), compared as `mktSetup` reads them: a window left out of a setup is its default,
  // so a card that writes the default over an absent one changes nothing. The first sale's is the sellers' paid conversion's too.
  const was = mktSetup(state.setup);
  const now = mktSetup(setup);
  if (now.firstOrderWindowDays !== was.firstOrderWindowDays) delete metrics["mkt.buy.first-order"];
  if (now.repeatWindowDays !== was.repeatWindowDays) delete metrics["mkt.buy.repeat"];
  if (now.firstSaleWindowDays !== was.firstSaleWindowDays) {
    delete metrics["mkt.sell.first-sale"];
    delete metrics["mkt.sell.paid-conversion"];
  }
  const hadCompany = Boolean(state.setup.companyLabel);
  return {
    ...state,
    // Unticking a motion loses nothing (§18.1.2): its entries, targets, what-ifs and slide boxes stay in
    // the state, the storage and the file; the board, the coverage, the diagnosis and the deck ignore them.
    setup,
    // A name given for the first time goes on the slides, as it does at creation.
    deck: !hadCompany && setup.companyLabel ? { ...state.deck, showCompany: true } : state.deck,
    snapshots: [...state.snapshots.slice(0, -1), { ...snapshot, referenceMonth, cohortMonth, metrics }],
  };
}

/**
 * Which numbers a change of window would send back to « à faire » (what `withSettings` deletes), as the Settings card asks
 * before the save: each is whether the number the window defines holds an entry now. A marketplace's first-sale window
 * defines two (§22.6.1): the first sale and the sellers' paid conversion, so either one entered counts.
 */
export function settingsExisting(snapshot: Snapshot): {
  activation: boolean;
  paid: boolean;
  qualification: boolean;
  goLive: boolean;
  firstOrder: boolean;
  repeat: boolean;
  firstSale: boolean;
  any: boolean;
} {
  const { metrics } = snapshot;
  return {
    activation: metrics["act.rate"] !== undefined,
    paid: metrics["rev.paid-conversion"] !== undefined,
    qualification: metrics["slg.acq.lead-to-opp"] !== undefined,
    goLive: metrics["slg.act.go-live"] !== undefined,
    firstOrder: metrics["mkt.buy.first-order"] !== undefined,
    repeat: metrics["mkt.buy.repeat"] !== undefined,
    firstSale: metrics["mkt.sell.first-sale"] !== undefined || metrics["mkt.sell.paid-conversion"] !== undefined,
    any: Object.keys(metrics).length > 0,
  };
}
