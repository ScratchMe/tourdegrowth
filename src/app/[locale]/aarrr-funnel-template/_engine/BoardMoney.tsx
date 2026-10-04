"use client";

import { CashWarning } from "@/components/engine/CashWarning";
import { MoneyBlock } from "@/components/engine/MoneyBlock";
import { WorthBars } from "@/components/engine/WorthBars";
import type { Motion } from "@/lib/engine/types";
import { EngineTerm } from "./EngineTerm";
import { moneyView } from "./money-view";
import type { EngineView } from "./view";

/**
 * The money on the board (design system extension 09, A20.d T2): right after
 * the diagnosis, one flat ruled block — the MRR and its ARR, what one new
 * customer is worth, the cash it ties up and, past the team's runway or 30
 * months, the warning. The words it teaches carry the engine's « ? »
 * (`EngineTerm`): « ARR » (bon à tirer nº10, 2026-10-04), « trésorerie immobilisée », « mois après
 * remboursement ».
 */
export function BoardMoney({ view, motion, hybrid }: { view: EngineView; motion: Motion; hybrid: boolean }) {
  const m = moneyView(view, motion, hybrid);
  const { strings } = view;
  return (
    <MoneyBlock
      eyebrow={m.eyebrow}
      headingId={`engine-money-title-${motion}`}
      figures={
        m.figures?.map((f) =>
          f.key === "arr"
            ? {
                ...f,
                label: (
                  <>
                    {f.label}
                    <EngineTerm id="arr" strings={strings} />
                  </>
                ),
              }
            : f,
        ) ?? null
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
        note: m.worth.note ?? undefined,
      }}
      cash={{
        title: m.cash.title,
        facts: [
          { key: "spend", label: m.cash.spend.label, value: m.cash.spend.value, missing: m.cash.spend.missing ?? undefined },
          {
            key: "tied",
            label: (
              <>
                {m.cash.tied.label}
                <EngineTerm id="cashTied" strings={strings} />
              </>
            ),
            value: m.cash.tied.value,
            missing: m.cash.tied.missing ?? undefined,
          },
        ],
        line: m.cash.line,
        warning: m.cash.warning ? (
          <CashWarning maybe={m.cash.warning.maybe} data-testid="engine-money-warning">
            {m.cash.warning.text}
          </CashWarning>
        ) : undefined,
        assumptions: m.cash.assumptions ?? undefined,
      }}
      data-testid={`engine-money-${motion}`}
    />
  );
}
