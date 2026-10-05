// Board stand-in for the synced MoneyBlock (components/engine/MoneyBlock, the live
// system, 2026-10-04): its markup and class names, so the live CSS draws
// it (system-snapshot.css). Unchanged by extension 10. Not ported.
import React from "react";
import { MetaLabel, Tag } from "tour-de-growth";

const h = React.createElement;

/**
 * Q1–Q6. One flat block (not a card: the peloton stays the one raised
 * card), right after the diagnosis and before "What if?". No button, no
 * field: it adds no control to the board except the "?" of the two words
 * it teaches.
 *
 * 1. `figures` — the MRR and its ARR, side by side, MRR first (it is the
 *    typed fact; the ARR is MRR × 12, said so in its label). In the hybrid,
 *    TotalBand carries the MRRs and the totals: pass `figures={null}`.
 * 2. `worth` — what one new customer is worth:
 *    - the finding first, in words; `tag` names it when there is one —
 *      the loss as an ink tag (solid: today's numbers say so), its "maybe"
 *      as the same tag dashed (the ranges overlap: not yet). Never red: the
 *      loss is arithmetic on the team's own numbers, not the stage a target
 *      names. No tag when the customer pays back, or when it can't be said;
 *    - `bars` (WorthBars): what it costs, what it brings back;
 *    - `months`: the finding's figure — how long a customer stays, how long
 *      paying back its cost takes. A loss IS a payback longer than the
 *      lifetime: the months are said here, inside the finding, never as a
 *      second piece of news;
 *    - `note`: with no margin, why nothing is computed on revenue.
 * 3. `cash` — the month's acquisition spend and the cash it keeps tied up,
 *    `line` (does it come back, and when), the `warning` slot (CashWarning,
 *    or nothing) and the printed `assumptions`. With no margin there is no
 *    payback and so no cash figure: pass the spend alone and `line` says
 *    why.
 */
export const MoneyBlock = ({ eyebrow, headingId = "money-title", figures, worth, cash, className }) =>
  h("section", { className: ["MoneyBlock_root", className].filter(Boolean).join(" "), "aria-labelledby": headingId },
    h(MetaLabel, { as: "h2", id: headingId, size: "sm", tone: "muted", wide: true }, eyebrow),
    figures
      ? h("dl", { className: "MoneyBlock_figures" },
          figures.map((f) =>
            h("div", { key: f.key ?? f.label, className: "MoneyBlock_figure" },
              h("dt", { className: "MoneyBlock_figureLabel" }, f.label),
              h("dd", { className: "MoneyBlock_figureValue" }, f.value),
              f.note ? h("dd", { className: "MoneyBlock_figureNote" }, f.note) : null)))
      : null,
    h("div", { className: "MoneyBlock_part" },
      h("h3", { className: "MoneyBlock_partTitle" }, worth.title),
      h("p", { className: "MoneyBlock_finding" },
        worth.tag ? h(Tag, { tone: worth.tag.maybe ? "outline" : "ink", className: "MoneyBlock_tag" }, worth.tag.label) : null,
        worth.tag ? " " : null,
        worth.finding),
      worth.bars ?? null,
      worth.months ? h("p", { className: "MoneyBlock_months" }, worth.months) : null,
      worth.note ? h("p", { className: "MoneyBlock_note" }, worth.note) : null),
    cash
      ? h("div", { className: "MoneyBlock_part" },
          h("h3", { className: "MoneyBlock_partTitle" }, cash.title),
          h("dl", { className: "MoneyBlock_facts" },
            cash.facts.map((f) =>
              h("div", { key: f.key ?? f.label, className: "MoneyBlock_fact" },
                h("dt", { className: "MoneyBlock_factLabel" }, f.label),
                // An unknown is the dashed "?" box, never 0 (constraint 3),
                // and says what is missing.
                f.value === "?"
                  ? h("dd", { className: "MoneyBlock_factValue" },
                      h("span", { className: "MoneyBlock_unknown" }, h("span", { className: "MoneyBlock_unknownMark" }, "?")),
                      f.missing ? h("span", { className: "MoneyBlock_missing" }, f.missing) : null)
                  : h("dd", { className: "MoneyBlock_factValue" }, f.value)))),
          cash.line ? h("p", { className: "MoneyBlock_cashLine" }, cash.line) : null,
          cash.warning ?? null,
          cash.assumptions ? h("p", { className: "MoneyBlock_assumptions" }, cash.assumptions) : null)
      : null);
