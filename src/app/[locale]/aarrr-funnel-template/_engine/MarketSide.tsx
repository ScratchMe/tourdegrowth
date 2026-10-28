"use client";

import { useState } from "react";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import { Disclosure } from "@/components/core/Disclosure";
import { LeverCard } from "@/components/engine/LeverCard";
import { MrrCurve } from "@/components/engine/MrrCurve";
import { SideFunnel } from "@/components/engine/SideFunnel";
import { SideNote } from "@/components/engine/SideNote";
import { fillTemplate } from "@/lib/engine/format";
import { mktFunnelTitle } from "@/lib/engine/mkt-titles";
import { notEnoughBelowSentence, blindSentence } from "@/lib/engine/phrases";
import { mktSetup } from "@/lib/engine/setup-type";
import type { LeverId, MktSide } from "@/lib/engine/types";
import { BoardMoney } from "./BoardMoney";
import { Diagnosis } from "./Diagnosis";
import { EngineTerm } from "./EngineTerm";
import { mktAsideLines, mktLeverView, mktMoneyView, mktMotion, mktFunnelView } from "./mkt-view";
import { MktWhatIfPanel } from "./MktWhatIfPanel";
import { candidateValuesOf } from "./number-list";
import { targetAt, withTarget } from "./scenario-view";
import { previousLeakLine } from "./series-view";
import { formatMonth } from "./text";
import { Verdict } from "./Verdict";
import type { EngineView } from "./view";
import styles from "./Board.module.css";

type Targets = Partial<Record<LeverId, number>>;

/**
 * What the « Côté affiché » selector governs — one side of a marketplace, in the reading order of the self-serve board
 * (C54; engine spec §22.6.2, design system extension 10): its verdict (its funnel's sentence), its diagnosis, its money, its
 * « Et si » (the card and, folded, the panel), and its funnel — the one raised card of the screen.
 *
 * `view` carries THIS side's words (`marketplaceStrings(…, side)`, §22.8.1): nothing in here is read in another side's, and
 * nothing here reads the other side's numbers (D2). A part a side does not have says so in a sentence (`SideNote`), never by a
 * zero, an empty card or a red: the sellers who pay nothing have no money and no « Et si », and a side with too few targets
 * to name what holds it back says it in dashes.
 *
 * `verdictId`: the board's heading and focus target when no band tops it (the sellers paying nothing), else the hybrid's
 * `engine-motion-verdict` (the band's title is the heading).
 */
export function MarketSide({
  view,
  side,
  past,
  verdictId,
  onWhatIf,
  onTargets,
  onSettings,
}: {
  view: EngineView;
  side: MktSide;
  /** A closed month on screen, read only: no « Et si ». */
  past: boolean;
  verdictId: string;
  onWhatIf: (targets: Targets) => void;
  /** « Fixe les cibles de tes acheteurs → »: the targets' screen, as after the setup. */
  onTargets: () => void;
  /** « Coche-le dans les Réglages »: the settings, where the sellers' subscription box is. */
  onSettings: () => void;
}) {
  const { state, derived, ctx, strings, metrics } = view;
  const motion = mktMotion(derived);
  const { diagnosis } = motion.sides[side];
  const [whatIfOpen, setWhatIfOpen] = useState(false);
  const reveal = (id: string) =>
    requestAnimationFrame(() => {
      const summary = document.querySelector<HTMLElement>(`#${id} > summary`);
      summary?.focus();
      summary?.scrollIntoView({ block: "start" });
    });
  const targets: Targets = state.whatIf ?? {};
  const sellersPay = mktSetup(state.setup).sellerSubscriptions;
  // The sellers who pay nothing have no money to say, so no « Et si » either (§22.8.5 k): the part is a sentence.
  const hasMoney = side === "demand" || sellersPay;

  const verdict = mktFunnelTitle(side === "demand" ? motion.funnel.demand : motion.funnel.supply, side, state, strings, ctx);
  const funnel = mktFunnelView(view, side);
  const { base, ...funnelProps } = funnel;
  const asides = mktAsideLines(view, side);
  const lever = past || !hasMoney ? null : mktLeverView(view, side, targets);
  const d = strings.diagnosis;
  const snapshot = state.snapshots[state.snapshots.length - 1]!;
  const funnelData = side === "demand" ? motion.funnel.demand : motion.funnel.supply;

  // The « À côté » lines say each other stage under its target; the generic « aussi en retard » note would say it a second time.
  const covered = new Set(asides.map((line) => line.id));
  const shownDiagnosis = { ...diagnosis, belowUnpriced: diagnosis.belowUnpriced.filter((id) => !covered.has(id)) };

  return (
    <div className={styles.sideBody} data-testid="mkt-side" data-side={side}>
      <Verdict title={verdict} strings={strings} id={verdictId} />

      {diagnosis.state === "not-enough" ? (
        <SideNote
          kind="pending"
          title={d.notEnough}
          headingId={`engine-diagnosis-${side}-title`}
          action={
            <Button variant="quiet" onClick={onTargets} data-testid={`mkt-note-targets-${side}`}>
              {side === "demand" ? strings.mkt.note.targetsDemand : strings.mkt.note.targetsSupply}
            </Button>
          }
          data-testid={`engine-diagnosis-${side}`}
        >
          <p>{notEnoughBelowSentence(diagnosis, strings, metrics) ?? d.notEnoughBody}</p>
          {blindSentence(diagnosis.blind, strings, metrics) ? <p>{blindSentence(diagnosis.blind, strings, metrics)}</p> : null}
        </SideNote>
      ) : (
        <Diagnosis
          diagnosis={shownDiagnosis}
          strings={strings}
          locale={ctx.locale}
          metrics={view.metrics}
          values={candidateValuesOf(state, ctx, side)}
          previous={previousLeakLine(view, "mkt", side)}
          aside={asides.map((line) => line.text)}
        />
      )}

      {/* The money, right after the diagnosis (extension 09, C54); « Et si ? » under it. A side with no money says so, once. */}
      {hasMoney ? (
        <BoardMoney view={view} model={mktMoneyView(view, side)} idKey={side} />
      ) : (
        <SideNote
          kind="absent"
          eyebrow={fillTemplate(strings.money.eyebrow, { month: formatMonth(snapshot.referenceMonth, ctx.locale) })}
          title={strings.mkt.money.supplyNone}
          headingId={`engine-money-title-${side}`}
          action={
            <Button variant="quiet" onClick={onSettings} data-testid="mkt-note-money-action">
              {strings.mkt.note.moneyAction}
            </Button>
          }
          data-testid={`engine-money-${side}`}
        >
          <p>{strings.mkt.note.moneyBody}</p>
          <p>{strings.mkt.note.moneyWhatIf}</p>
        </SideNote>
      )}

      {past || !hasMoney ? null : (
        <>
          {lever ? (
            <LeverCard
              eyebrow={lever.eyebrow}
              title={lever.title}
              lever={{
                id: lever.lever.elementId,
                label: lever.lever.label,
                min: lever.lever.min,
                max: lever.lever.max,
                step: lever.lever.step,
                value: lever.lever.position,
                valueText: lever.lever.valueText,
                onChange: (position) => onWhatIf(withTarget(targets, lever.lever.id, targetAt({ today: lever.lever.today, step: lever.lever.step }, position))),
              }}
              curve={
                lever.curve ? (
                  <MrrCurve
                    id={`engine-lever-curve-${side}`}
                    today={lever.curve.today}
                    whatif={lever.curve.whatif}
                    keys={lever.curve.keys}
                    start={lever.curve.start}
                    xLabels={lever.curve.xLabels}
                    summary={lever.curve.summary}
                    step={lever.curve.step}
                    note={lever.curve.note ?? undefined}
                    data-testid="engine-lever-curve"
                  />
                ) : undefined
              }
              figures={lever.figures.map((f) => ({ key: f.key, label: f.label, value: f.value, unknown: f.unknown, today: f.today ?? undefined }))}
              worth={lever.worth ?? undefined}
              allLabel={lever.allLabel}
              onAll={() => {
                setWhatIfOpen(true);
                reveal("engine-whatif-full");
              }}
              resetLabel={lever.resetLabel}
              onReset={() => onWhatIf(withTarget(targets, lever.lever.id, null))}
              moved={lever.moved}
              data-testid="engine-lever"
            />
          ) : null}
          <Disclosure summary={strings.lever.panel} open={whatIfOpen} onOpenChange={setWhatIfOpen} id="engine-whatif-full" data-testid="engine-board-whatif">
            <div className={styles.whatIf}>
              <MktWhatIfPanel view={view} side={side} onChange={onWhatIf} />
            </div>
          </Disclosure>
        </>
      )}

      {/* The funnel, the screen's one raised card: the liquidity's base is the buyers' only, and its « ? » is the board's. */}
      <SideFunnel
        {...funnelProps}
        headingId={`engine-funnel-${side}`}
        base={
          base
            ? {
                title: (
                  <>
                    {base.title}
                    <EngineTerm id={base.term} strings={strings} />
                  </>
                ),
                column: base.column,
                line: base.line,
              }
            : undefined
        }
        data-testid="engine-board-peloton"
      />
      {funnelData.smallCohort ? (
        <Callout tone="caveat" data-testid="engine-small-cohort">
          <p>{strings.board.smallCohort}</p>
        </Callout>
      ) : null}
    </div>
  );
}
