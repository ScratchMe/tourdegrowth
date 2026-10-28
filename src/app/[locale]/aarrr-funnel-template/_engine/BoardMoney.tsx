"use client";

import { CashWarning } from "@/components/engine/CashWarning";
import { MoneyBlock } from "@/components/engine/MoneyBlock";
import { WorthBars } from "@/components/engine/WorthBars";
import type { Motion } from "@/lib/engine/types";
import { EngineTerm } from "./EngineTerm";
import { moneyView, type MoneyView } from "./money-view";
import type { EngineView } from "./view";

/**
 * The money on the board (design system extension 09, A20.d T2): right after
 * the diagnosis, one flat ruled block — the MRR and its ARR, what one new
 * customer is worth, the cash it ties up and, past the team's runway or 30
 * months, the warning. An app (§21.6.4) has no cash tied up (D11): its block
 * says why and lists the month's spend alone. The words it teaches carry the engine's « ? »
 * (`EngineTerm`): « ARR » (bon à tirer nº10, 2026-10-04), « trésorerie immobilisée », « mois après
 * remboursement ».
 */
export function BoardMoney({
  view,
  motion,
  hybrid,
  model,
  idKey,
}: {
  view: EngineView;
  /** The SaaS's motions (`moneyView`); absent with a `model`. */
  motion?: Motion;
  hybrid?: boolean;
  /**
   * A marketplace side's money (§22.6.2, `mkt-view.ts#mktMoneyView`), read from the side's own scenario with its own words: the block
   * is the same. `view.strings` is then that side's too, and `idKey` the side (« demand »): the ids and test ids follow the side, not the motion.
   */
  model?: MoneyView;
  idKey?: string;
}) {
  const m = model ?? moneyView(view, motion ?? "plg", hybrid ?? false);
  const key = idKey ?? motion ?? "plg";
  const { strings } = view;
  const tied = m.cash.tied;
  return (
    <MoneyBlock
      eyebrow={m.eyebrow}
      headingId={`engine-money-title-${key}`}
      figures={
        // The « ? » of the word each figure teaches: the ARR's (the board's rule), or the one the figure names — a marketplace's net revenue, GMV (C101, C72).
        m.figures?.map((f) => {
          const term = f.term ?? (f.key === "arr" ? "arr" : null);
          return term
            ? {
                key: f.key,
                label: (
                  <>
                    {f.label}
                    <EngineTerm id={term} strings={strings} />
                  </>
                ),
                value: f.value,
              }
            : f;
        }) ?? null
      }
      worth={{
        title: m.worth.title,
        tag: m.worth.tag ?? undefined,
        finding: m.worth.finding,
        bars: m.worth.bars ? <WorthBars {...m.worth.bars} data-testid="engine-money-bars" /> : undefined,
        months: m.worth.months ? (
          <>
            {m.worth.months}
            {m.worth.monthsTerm ? <EngineTerm id="afterPayback" strings={strings} /> : null}
          </>
        ) : undefined,
        note: m.worth.note ? (
          <>
            {m.worth.note}
            {m.worth.noteTerm ? <EngineTerm id={m.worth.noteTerm} strings={strings} /> : null}
          </>
        ) : undefined,
      }}
      cash={{
        title: m.cash.title,
        facts: [
          { key: "spend", label: m.cash.spend.label, value: m.cash.spend.value, missing: m.cash.spend.missing ?? undefined },
          ...(tied
            ? [
                {
                  key: "tied",
                  label: (
                    <>
                      {tied.label}
                      <EngineTerm id="cashTied" strings={strings} />
                    </>
                  ),
                  value: tied.value,
                  missing: tied.missing ?? undefined,
                },
              ]
            : []),
        ],
        line: m.cash.line,
        warning: m.cash.warning ? (
          <CashWarning maybe={m.cash.warning.maybe} data-testid="engine-money-warning">
            {m.cash.warning.text}
          </CashWarning>
        ) : undefined,
        assumptions: m.cash.assumptions ?? undefined,
      }}
      data-testid={`engine-money-${key}`}
    />
  );
}
