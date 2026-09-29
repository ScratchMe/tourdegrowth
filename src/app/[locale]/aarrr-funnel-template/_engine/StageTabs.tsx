"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Tag } from "@/components/core/Tag";
import { CANDIDATE_IDS, metricsOfStage, type MetricShape } from "@/lib/engine/catalog-shape";
import { positionLabel } from "@/lib/engine/phrases";
import { STATUS_KEY } from "@/lib/engine/strings";
import type { CandidateId, MetricId } from "@/lib/engine/types";
import { knownIn } from "@/lib/engine/values";
import { PILLARS, type Pillar } from "@/lib/scoring/pillars";
import { displayInterval, unknownReason } from "./display";
import type { PillKind } from "./keys";
import { MetricSheet } from "./MetricSheet";
import { stageForKey, stageTabs } from "./stage-tabs";
import { domId, fill, metricById, stageName } from "./text";
import type { EngineActions, EngineView } from "./view";
import styles from "./Board.module.css";

const PILL_CLASS: Record<PillKind, string> = {
  found: styles.pillFound!,
  approximate: styles.pillApprox!,
  missing: styles.pillMissing!,
  inProgress: styles.pillProgress!,
  notApplicable: styles.pillNa!,
};

const tabId = (stage: Pillar) => `engine-tab-${stage}`;
const panelId = (stage: Pillar) => `engine-panel-${stage}`;

/**
 * The five stages as a horizontal menu with ONE panel under it (Antoine,
 * 2026-09-26: « c'est rude de devoir scroller autant sur chaque chiffre » —
 * five vertical rows, then a drawer with its ★ sheet open, made a long page
 * per number). A real WAI-ARIA tab list: `role="tab"` buttons with
 * `aria-selected` / `aria-controls`, a roving tabindex so the list is ONE
 * Tab stop, Left/Right (wrapping) and Home/End to move, and automatic
 * activation — a panel of folded rows renders at once, so a tab follows
 * focus without making anyone wait.
 *
 * Each tab carries what the old row's pills said (one mark per number,
 * `stage-tabs.ts`) and, on a stage the diagnosis names, the red wash and a
 * stamp that says it in words (WCAG 1.4.1). Red only for a NAMED stage —
 * the rule `Diagnosis` and the peloton follow: a stage below its reference
 * that the diagnosis does not name gets its words in the panel head, not
 * the red.
 *
 * The strip is ONE row at every width. From 960px the five tabs share the
 * board's width; under it they keep their natural width and the strip
 * scrolls sideways INSIDE its own box (the page itself never does — measured
 * in e2e). Chosen over a wrap: wrapped, the five tabs took three lines on a
 * phone, about 200px of menu above the numbers, which is the scrolling this
 * change exists to remove; one row keeps the numbers right under it, and the
 * third tab showing cut at the edge says there is more. The selected tab is
 * kept in view when it is chosen from elsewhere ("Fill in", "Continue").
 */
export function StageTabs({
  view,
  actions,
  current,
  onSelect,
  panelKey,
  focusMetric,
}: {
  view: EngineView;
  actions: EngineActions;
  current: Pillar;
  onSelect: (stage: Pillar) => void;
  /** Remounts the panel — every row folded again, except `focusMetric` when it belongs here. */
  panelKey: string;
  focusMetric: MetricId | null;
}) {
  const { strings } = view;
  const snapshot = view.state.snapshots[view.state.snapshots.length - 1]!;
  const tabs = stageTabs(snapshot, view.derived.diagnosis);
  const strip = useRef<HTMLDivElement>(null);

  // Keep the selected tab inside the strip's box — by moving the strip's own
  // scroll, never scrollIntoView, which would scroll the page as well (and on
  // the board's first paint, too).
  useEffect(() => {
    const box = strip.current;
    const tab = box ? document.getElementById(tabId(current)) : null;
    if (!box || !tab) return;
    const b = box.getBoundingClientRect();
    const t = tab.getBoundingClientRect();
    const room = parseFloat(getComputedStyle(box).paddingLeft) || 0;
    if (t.left < b.left + room) box.scrollLeft -= b.left + room - t.left;
    else if (t.right > b.right - room) box.scrollLeft += t.right - (b.right - room);
  }, [current]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const next = stageForKey(current, event.key);
    if (!next) return;
    event.preventDefault();
    onSelect(next);
    document.getElementById(tabId(next))?.focus();
  }

  const inStage = focusMetric && metricsOfStage(current).some((s) => s.id === focusMetric) ? focusMetric : null;

  return (
    <div className={styles.stages} data-testid="engine-stages">
      <div ref={strip} role="tablist" aria-label={strings.board.stagesLabel} className={styles.tabs} onKeyDown={onKeyDown} data-testid="engine-tabs">
        {tabs.map((tab, i) => {
          const selected = tab.stage === current;
          return (
            <button
              key={tab.stage}
              type="button"
              role="tab"
              id={tabId(tab.stage)}
              aria-selected={selected}
              aria-controls={panelId(tab.stage)}
              tabIndex={selected ? 0 : -1}
              className={[styles.tab, tab.named ? styles.tabNamed : ""].filter(Boolean).join(" ")}
              onClick={() => onSelect(tab.stage)}
              data-testid={`engine-tab-${tab.stage}`}
              data-named={tab.named ? "true" : undefined}
            >
              <span className={styles.tabHead}>
                <span className={styles.tabIndex} aria-hidden="true">
                  {i + 1}
                </span>
                <span className={styles.tabName} data-testid={`engine-tab-name-${tab.stage}`}>
                  {stageName(tab.stage)}
                </span>
              </span>
              <span className={styles.tabStatus}>
                {/* The marks are shapes, not colours (found · hatched · dashed · outline · dash); the
                    fraction next to them is their words. Each number's own status is spelled out in
                    the panel, one row each. */}
                <span className={styles.pills} aria-hidden="true">
                  {tab.marks.map((mark) => (
                    <span key={mark.id} className={[styles.pill, PILL_CLASS[mark.kind]].join(" ")} />
                  ))}
                </span>
                <span className={styles.tabFound}>{fill(strings.board.tabFound, { n: tab.found, N: tab.applicable })}</span>
              </span>
              {tab.named ? <span className={styles.tabStamp}>{strings.board.tabNamed}</span> : null}
            </button>
          );
        })}
      </div>
      <StagePanel
        key={panelKey}
        stage={current}
        index={PILLARS.indexOf(current) + 1}
        view={view}
        actions={actions}
        initiallyOpen={inStage}
      />
    </div>
  );
}

/**
 * What a folded row says without opening anything: the number when there is
 * one — through the board's own formatter, so a row and a slide cannot print
 * one value two ways — the words the person typed or picked, or, for a
 * number they could not find, why. Nothing for a number still to fill,
 * requested or not applicable: its status tag already says so.
 */
function rowValue(shape: MetricShape, view: EngineView): { text: string; kind: "number" | "words" | "cause" } | null {
  const { state, strings, ctx } = view;
  const entry = state.snapshots[state.snapshots.length - 1]!.metrics[shape.id];
  if (entry?.status === "measured" && entry.value?.kind === "text") {
    // The person's own words, quoted as the catalogue quotes the activation event (text.ts#catalogFill).
    return { text: ctx.locale === "fr" ? `«\u00A0${entry.value.text}\u00A0»` : `"${entry.value.text}"`, kind: "words" };
  }
  if (entry?.status === "measured" && entry.value?.kind === "choice") {
    const choice = entry.value.choice;
    const label = metricById(view.metrics, shape.id).choices?.find((c) => c.id === choice)?.label;
    return label ? { text: label, kind: "words" } : null;
  }
  // knownIn, not knownOf: a cohort number entered on a month younger than its window reads as
  // approximate (§6.3) — the same reading the peloton and the slides make.
  const known = knownIn(state, shape.id, ctx);
  if (known.kind === "known") {
    return { text: displayInterval(known.value, known.confidence, shape, state.setup.currency, ctx, strings), kind: "number" };
  }
  if (known.why === "todo" || known.why === "requested" || known.why === "not-applicable") return null;
  return { text: unknownReason(known, strings), kind: "cause" };
}

/**
 * The selected stage's panel: its numbers as folded rows, EVERY one folded
 * on arrival (Antoine: « replier tous les chiffres, comme ça on peut bien
 * voir le statut de chaque et déplier en fonction »). A row is an accordion
 * toggle — `aria-expanded` / `aria-controls` — that unfolds that number's
 * full sheet, and only that one. `initiallyOpen` is the one exception: a
 * number opened from elsewhere ("Fill in" in the collect list, "Continue"
 * in the resume band) lands open, and the island moves focus to its toggle.
 *
 * The head keeps what the old stage row said beyond the pills: where each
 * of the stage's candidate rates sits against its comparator, in words
 * (`phrases.ts#positionLabel`, the one wording the sheet and the peloton
 * use), in the alert red when the diagnosis names it.
 */
function StagePanel({
  stage,
  index,
  view,
  actions,
  initiallyOpen,
}: {
  stage: Pillar;
  index: number;
  view: EngineView;
  actions: EngineActions;
  initiallyOpen: MetricId | null;
}) {
  const { strings, state, ctx } = view;
  const diagnosis = view.derived.diagnosis;
  const snapshot = state.snapshots[state.snapshots.length - 1]!;
  const shapes = metricsOfStage(stage);
  const [open, setOpen] = useState<ReadonlySet<MetricId>>(() => new Set(initiallyOpen ? [initiallyOpen] : []));
  const toggle = (metricId: MetricId) =>
    setOpen((was) => {
      const next = new Set(was);
      if (next.has(metricId)) next.delete(metricId);
      else next.add(metricId);
      return next;
    });

  const namedIds = new Set<MetricId>(diagnosis.state === "clear" || diagnosis.state === "shared" ? diagnosis.named : []);
  const positions = shapes.flatMap((shape) => {
    if (!(CANDIDATE_IDS as readonly MetricId[]).includes(shape.id)) return [];
    const at = diagnosis.positions[shape.id as CandidateId];
    // A position is only worded for a value someone has: an unknown sits nowhere.
    if (!at || knownIn(state, shape.id, ctx).kind !== "known") return [];
    const label = positionLabel(at.position, at.comparator, strings);
    return label ? [{ id: shape.id, text: `${metricById(view.metrics, shape.id).name} · ${label}`, named: namedIds.has(shape.id) }] : [];
  });

  return (
    <div
      role="tabpanel"
      id={panelId(stage)}
      aria-labelledby={tabId(stage)}
      // The head is text, not a control: the panel itself takes the Tab after the tab list
      // (WAI-ARIA tabs pattern), so a screen reader lands on its start, not on its first row.
      tabIndex={0}
      className={styles.panel}
      data-testid="engine-panel"
      data-stage={stage}
    >
      <div className={styles.panelHead}>
        <h3 className={styles.panelTitle}>{fill(strings.sheet.stageEyebrow, { i: index, stage: stageName(stage) })}</h3>
        {positions.length ? (
          <ul className={styles.panelPositions} data-testid="engine-panel-positions">
            {positions.map((p) => (
              <li key={p.id} className={[styles.panelPosition, p.named ? styles.panelPositionNamed : ""].filter(Boolean).join(" ")}>
                {p.text}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {shapes.map((shape) => {
        const metric = metricById(view.metrics, shape.id);
        const status = snapshot.metrics[shape.id]?.status ?? "todo";
        const isOpen = open.has(shape.id);
        const bodyId = `engine-metric-body-${domId(shape.id)}`;
        const value = rowValue(shape, view);
        return (
          <div key={shape.id} className={styles.metric} data-open={isOpen ? "true" : "false"}>
            <h4 className={styles.metricHeading}>
              <button
                type="button"
                id={`engine-metric-${domId(shape.id)}`}
                className={styles.metricToggle}
                aria-expanded={isOpen}
                aria-controls={bodyId}
                onClick={() => toggle(shape.id)}
                data-testid={`engine-metric-${domId(shape.id)}`}
              >
                <span className={styles.metricName}>{metric.name}</span>
                <span className={styles.metricMeta}>
                  {value ? (
                    <span className={styles.metricValue} data-kind={value.kind} data-testid={`engine-row-value-${domId(shape.id)}`}>
                      {value.text}
                    </span>
                  ) : null}
                  {/* Ink for found, outline for the rest — never the red tag: red on this board
                      is the stage the diagnosis names (the tab's stamp), and a number's status is
                      not a diagnosis. Contrast is not the reason: the red Tag reads
                      --surface-accent, 4.65:1 (design audit S-9). */}
                  <Tag tone={status === "measured" ? "ink" : "outline"} className={styles.metricStatus}>
                    {strings.status[STATUS_KEY[status]]}
                  </Tag>
                </span>
                <span className={styles.metricMarker} aria-hidden="true" data-open={isOpen ? "true" : "false"} />
              </button>
            </h4>
            {isOpen ? (
              <div id={bodyId} className={styles.metricBody}>
                <MetricSheet id={shape.id} view={view} actions={actions} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
