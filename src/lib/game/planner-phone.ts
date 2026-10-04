/**
 * The activation level's phone — Quandi's app, from the cookie banner to the
 * first screen (GAME-BRIEF §18.7, `docs/game/activation.md`): what it shows,
 * as typed items, and how many clicks it takes to refuse the cookies. Pure,
 * like `shop-phone.ts` (level 2) and `view.ts` (level 1); the words are copy
 * (`ActivationPhoneCopy`), the drawing is `components/game/PlannerPhone`.
 *
 * Like the other levels', the phone reflects the cards in production AND the
 * ones ticked but not yet played, so a tick shows what it changes at once.
 *
 * Relative imports only — see model.ts.
 */
import type { ActivationCardId } from "./levels/activation";

export type PlannerPhoneItem =
  | { kind: "appBar" }
  /** `bundle`: one sheet asking for everything, one button. */
  | { kind: "permissions" }
  /** The cookie banner: `equal` with `refuse`, else `nudged` with `banner`, else `plain`. */
  | { kind: "banner"; style: "plain" | "nudged" | "equal" }
  /** `demo`: a sample schedule before any account. */
  | { kind: "demo" }
  /** The sign-up form. `phone`: `required` with `phone`, `optional` when `minimal` is there too, else `none`. */
  | { kind: "signup"; minimal: boolean; phone: "none" | "required" | "optional"; prechecked: boolean; partners: boolean }
  /** `analysis`: the progress bar. */
  | { kind: "analysis" }
  /** The first screen: the checklist (`checklist`), the import (`import`), the tooltip (`tour`). */
  | { kind: "home"; checklist: boolean; importer: boolean; tour: boolean }
  /** `pixels`: the push that gives the tracking away. */
  | { kind: "push" }
  /** `welcome`: tomorrow's email. */
  | { kind: "welcome" }
  /** `calls`: the call offer. */
  | { kind: "calls" };

/** Top to bottom, the way someone arriving scrolls. */
export function plannerPhoneView(ids: readonly string[]): PlannerPhoneItem[] {
  const has = (id: ActivationCardId) => ids.includes(id);
  const items: PlannerPhoneItem[] = [{ kind: "appBar" }];
  if (has("bundle")) items.push({ kind: "permissions" });
  items.push({ kind: "banner", style: has("refuse") ? "equal" : has("banner") ? "nudged" : "plain" });
  if (has("demo")) items.push({ kind: "demo" });
  items.push({
    kind: "signup",
    minimal: has("minimal"),
    phone: has("phone") ? (has("minimal") ? "optional" : "required") : "none",
    prechecked: has("prechecked"),
    partners: has("partners"),
  });
  if (has("analysis")) items.push({ kind: "analysis" });
  items.push({ kind: "home", checklist: has("checklist"), importer: has("import"), tour: has("tour") });
  if (has("pixels")) items.push({ kind: "push" });
  if (has("welcome")) items.push({ kind: "welcome" });
  if (has("calls")) items.push({ kind: "calls" });
  return items;
}

/** Clicks to refuse the cookies — `refuse` wins over `banner`, as `three` does over the clicks on level 1. */
export const REFUSE_CLICKS_EASY = 1;
export const REFUSE_CLICKS_HIDDEN = 3; // « Personnaliser », tout décocher, « Enregistrer »

/**
 * The pill under the phone (§18.7) — the activation level's « N clics pour
 * résilier »: a measurable fact the CNIL frames (refusing must be as simple as
 * accepting), never a judgement. Only a banner that buries the refusal, with
 * no « Tout refuser » beside « Tout accepter », makes it three clicks and
 * turns the pill coral.
 */
export function cookieRefusal(ids: readonly string[]): { clicks: 1 | 3; alert: boolean } {
  const hidden = ids.includes("banner") && !ids.includes("refuse");
  return { clicks: hidden ? REFUSE_CLICKS_HIDDEN : REFUSE_CLICKS_EASY, alert: hidden };
}
