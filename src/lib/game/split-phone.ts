/**
 * The referral level's phone — Partix's app, the invitation seen from both
 * sides (GAME-BRIEF §19.7, `docs/game/referral.md`): what Thomas's screen shows
 * when he invites, what Léa receives, as typed items, and how many messages
 * went out in Thomas's name without his writing them. Pure, like
 * `planner-phone.ts` (activation), `shop-phone.ts` (level 2) and `view.ts`
 * (level 1); the words are copy (`ReferralPhoneCopy`), the drawing is
 * `components/game/SplitPhone`.
 *
 * Like the other levels', the phone reflects the cards in production AND the
 * ones ticked but not yet played, so a tick shows what it changes at once.
 *
 * Relative imports only — see model.ts.
 */
import type { ReferralCardId } from "./levels/referral";

export type SplitPhoneItem =
  | { kind: "appBar" }
  /** Always: the group and its total. */
  | { kind: "group" }
  /** `bigshare`: the expense just added, the big button, the grey link. */
  | { kind: "continue" }
  /** The referral offer: `clear` with `fairbonus`, else `loud` with `bonus`, else nothing (no item). */
  | { kind: "bonus"; style: "loud" | "clear" }
  /** `unlock`: the locked features. */
  | { kind: "locked" }
  /** The invitation screen: every contact ticked (`contacts` without `chosen`), picked one by one (`chosen`), the group link (`grouplink`). */
  | { kind: "invite"; preselected: boolean; chosen: boolean; groupLink: boolean }
  /** `autoinvite`: what went out on its own. */
  | { kind: "autoSent" }
  /** `reviewgate`: the two-way prompt. */
  | { kind: "review" }
  /** `recap`: the readable recap. */
  | { kind: "recap" }
  /** Always: « Ce que reçoit Léa ». */
  | { kind: "guestDivider" }
  /** Always: Léa's message, personalised with `fakeinvite`. */
  | { kind: "guestMessage"; personalised: boolean }
  /** `shadow`: what the app already knows about Léa. */
  | { kind: "guestShadow" }
  /** `guestpage`: the group without installing. */
  | { kind: "guestPage" }
  /** `guests`: the question to guests who don't join. */
  | { kind: "guestQuestion" }
  /** `nobook`: the promise at the bottom; its second sentence only without `shadow`, which keeps the numbers. */
  | { kind: "noBook"; numbers: boolean };

/** Top to bottom: Thomas's half, then Léa's, then the promise at the foot (§19.7). */
export function splitPhoneView(ids: readonly string[]): SplitPhoneItem[] {
  const has = (id: ReferralCardId) => ids.includes(id);
  const items: SplitPhoneItem[] = [{ kind: "appBar" }, { kind: "group" }];
  if (has("bigshare")) items.push({ kind: "continue" });
  if (has("fairbonus")) items.push({ kind: "bonus", style: "clear" });
  else if (has("bonus")) items.push({ kind: "bonus", style: "loud" });
  if (has("unlock")) items.push({ kind: "locked" });
  items.push({ kind: "invite", preselected: has("contacts") && !has("chosen"), chosen: has("chosen"), groupLink: has("grouplink") });
  if (has("autoinvite")) items.push({ kind: "autoSent" });
  if (has("reviewgate")) items.push({ kind: "review" });
  if (has("recap")) items.push({ kind: "recap" });
  items.push({ kind: "guestDivider" }, { kind: "guestMessage", personalised: has("fakeinvite") });
  if (has("shadow")) items.push({ kind: "guestShadow" });
  if (has("guestpage")) items.push({ kind: "guestPage" });
  if (has("guests")) items.push({ kind: "guestQuestion" });
  if (has("nobook")) items.push({ kind: "noBook", numbers: !has("shadow") });
  return items;
}

export const CONTACTS = 214; // the copy's « 214 contacts »
export const MESSAGES_PER_CONTACT = 3; // one invitation, two follow-ups

/**
 * The pill under the phone (§19.7) — the referral level's « N clics pour
 * résilier »: the messages sent in Thomas's name that he did not write. A fact
 * the law frames (marketing by message without consent), never a judgement.
 * `autoinvite` sends the invitation and two follow-ups to every contact,
 * `fakeinvite` one message to each; `chosen` and `nobook` leave the count
 * where it was, because an honest screen does not switch an automation off:
 * only `clean` takes it back.
 */
export function sentInYourName(ids: readonly string[]): { messages: number; alert: boolean } {
  const auto = ids.includes("autoinvite") ? CONTACTS * MESSAGES_PER_CONTACT : 0; // 642
  const personalised = ids.includes("fakeinvite") ? CONTACTS : 0; // 214
  const messages = auto + personalised;
  return { messages, alert: messages > 0 };
}
