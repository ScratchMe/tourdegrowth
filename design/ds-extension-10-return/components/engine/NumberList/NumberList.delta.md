# NumberList — extension 10 delta

*The synced component (components/engine/NumberList, 2026-10-04) changes by
two optional props and their rules. Without them it draws exactly as now.*

## Why

Question 9. A marketplace's 19 numbers (14 without the subscriptions) stay
**one list by stage** (C41) — Acquisition, Activation, Retention, Referral,
Revenue — and each row says its side: « Acheteurs », « Vendeurs »,
« Liquidité » (the given words; services: « Clients », « Prestataires »,
« Liquidité »).

## The props

```ts
interface NumberRow {
  // … unchanged …
  /** Extension 10: the row's side, in words: « Acheteurs ». */
  side?: React.ReactNode;
}
interface NumberListProps {
  // … unchanged …
  /** Extension 10: one line under the title. */
  lead?: React.ReactNode;
}
```

## The markup

- In each row's button, first: `<span class="NumberList_side">{row.side}</span>`,
  then the name, value, status as today.
- Under the title, before `progress`: `<p class="NumberList_lead">{lead}</p>`.

## The rules (`NumberList.delta.css`, added to `NumberList.module.css`)

- `.NumberList_side`: a fixed column (`--market-side-tag-width`, 9.5em, so
  the names align; « Prestataires » is the longest), `--meta-2xs`,
  uppercase, tracked, `--text-muted`. **Plain words, never a `Tag`**: in
  this list a Tag is a status (estimated, asked, can't be found); a side is
  not one, and a boxed side would read as one. No colour per side: colour
  would set them apart as rivals.
- On a phone the side goes on its own line above the name (`flex-basis:
  100%`), the row's 44px height kept.
- `.NumberList_lead`: `--body-sm`, `--text-muted`, close under the title.

## How the board uses it (not a component change)

- The stage groups **mix** the sides, in the brief's table order within a
  stage (buyers, sellers, liquidity; Revenue: liquidity, buyers, sellers).
  Splitting each stage by side would make two lists in one.
- The list is shared: it sits after the side's part, under the selector's
  reach but not inside it. Its one red — the stage flagged « Te freine » —
  follows the side shown (demand: Activation, for the fill rate; supply:
  Revenue, for the subscription conversion; supply without subscriptions:
  none). One red per screen, the shown side's. The lead says it: « Les deux
  côtés, une liste par étape. L'étape signalée est celle que nomme le côté
  affiché. »

## Not changed

The stage heads, marks, progress, statuses, the computed fold: as synced.
