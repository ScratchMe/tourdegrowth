/**
 * The revenue level's phone — Gainix's app, from the plans screen to the gem
 * shop and the account's renewal line (GAME-BRIEF §20.7,
 * `docs/game/revenue.md`): what the screen shows for each card, as typed
 * items, and what the end of the trial will charge, without anything saying
 * so. Pure, like `split-phone.ts` (referral), `planner-phone.ts` (activation),
 * `shop-phone.ts` (level 2) and `view.ts` (level 1); the words are copy
 * (`RevenuePhoneCopy`), the drawing is `components/game/FitPhone`.
 *
 * Like the other levels', the phone reflects the cards in production AND the
 * ones ticked but not yet played, so a tick shows what it changes at once.
 *
 * Relative imports only — see model.ts.
 */
import type { RevenueCardId } from "./levels/revenue";

export type FitPhoneItem =
  | { kind: "appBar" }
  /** The trial offer: `trial` (14 days, card, the yearly price in small print) or the base 7-day trial; `fullPrice` adds the yearly total first. */
  | { kind: "offer"; trial: boolean; fullPrice: boolean }
  /** The plan picked: the monthly price (`personal` with `pricing`), and `addon` ticked under it. */
  | { kind: "plans"; personal: boolean; addon: boolean }
  /** `trialmail`. */
  | { kind: "trialReminder" }
  /** `hiddensub`: the programme and its small print. */
  | { kind: "programme" }
  /** `programs`. */
  | { kind: "coaching" }
  /** `downgrade`. */
  | { kind: "downgrade" }
  /** The gem shop: `odd` packs with `gems` unless `roundpacks`; the euro price with `roundpacks`. */
  | { kind: "shop"; odd: boolean; euros: boolean }
  /** `lootbox`. */
  | { kind: "chest" }
  /** `express`. */
  | { kind: "express" }
  /** The account's renewal line: `notice` with `renewmail`, else `silent` with `renewal`, else `plain`. */
  | { kind: "renewal"; style: "plain" | "silent" | "notice" }
  /** `checkout`. */
  | { kind: "checkoutQuestion" };

/** Top to bottom: the offer, the plans, then what each card adds, the shop and the account (§20.7). */
export function fitPhoneView(ids: readonly string[]): FitPhoneItem[] {
  const has = (id: RevenueCardId) => ids.includes(id);
  const items: FitPhoneItem[] = [{ kind: "appBar" }];
  items.push({ kind: "offer", trial: has("trial"), fullPrice: has("fullprice") });
  items.push({ kind: "plans", personal: has("pricing"), addon: has("addon") });
  if (has("trialmail")) items.push({ kind: "trialReminder" });
  if (has("hiddensub")) items.push({ kind: "programme" });
  if (has("programs")) items.push({ kind: "coaching" });
  if (has("downgrade")) items.push({ kind: "downgrade" });
  items.push({ kind: "shop", odd: has("gems") && !has("roundpacks"), euros: has("roundpacks") });
  if (has("lootbox")) items.push({ kind: "chest" });
  if (has("express")) items.push({ kind: "express" });
  items.push({ kind: "renewal", style: has("renewmail") ? "notice" : has("renewal") ? "silent" : "plain" });
  if (has("checkout")) items.push({ kind: "checkoutQuestion" });
  return items;
}

export const MONTHLY_EUR = 7.99; // the copy's « 7,99 € »
export const MONTHLY_PERSONAL_EUR = 8.49; // `pricing`
export const YEARLY_EUR = 59.99; // `trial`
export const ADDON_EUR = 2.99; // `addon`

export interface TrialCharge {
  amount: number;
  silent: boolean;
  addon: boolean;
}

/**
 * The pill under the phone (§20.7) — what will be charged when the trial
 * ends, and whether anything announces it. A measurable fact, never a
 * judgement: no French text requires a reminder before a trial ends, so the
 * coral says a problem, never a law that does not exist. `trial` charges the
 * yearly price and ignores `pricing`; `addon` adds its price on top; `silent`
 * is a trial with no `trialmail`.
 */
export function trialCharge(ids: readonly string[]): TrialCharge {
  const has = (id: RevenueCardId) => ids.includes(id);
  const base = has("trial") ? YEARLY_EUR : has("pricing") ? MONTHLY_PERSONAL_EUR : MONTHLY_EUR;
  const amount = Math.round((base + (has("addon") ? ADDON_EUR : 0)) * 100) / 100;
  return { amount, silent: has("trial") && !has("trialmail"), addon: has("addon") };
}
