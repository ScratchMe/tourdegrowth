"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Tag } from "@/components/core/Tag";
import { LINK_METRIC_SHAPES, candidatesOf, metricsOfStageIn, type MetricShape } from "@/lib/engine/catalog-shape";
import { positionIn, positionLabel, type AnyDiagnosis } from "@/lib/engine/phrases";
import { STATUS_KEY } from "@/lib/engine/strings";
import type { MetricId, Motion } from "@/lib/engine/types";
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
  motion = "plg",
}: {
  view: EngineView;
  actions: EngineActions;
  current: Pillar;
  onSelect: (stage: Pillar) => void;
  /** Remounts the panel — every row folded again, except `focusMetric` when it belongs here. */
  panelKey: string;
  focusMetric: MetricId | null;
  /** Whose numbers the tabs hold (A7.3.c S3): one motion at a time, the hybrid's selector picks it (§18.7). */
  motion?: Motion;
}) {
  const { strings } = view;
  const snapshot = view.state.snapshots[view.state.snapshots.length - 1]!;
  const diagnosis = diagnosisOf(view, motion);
  const tabs = stageTabs(snapshot, diagnosis, motion);
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
    // The room kept at each edge: the strip's scroll padding where its edge
    // arrows draw over the tabs (Board.module.css), its padding elsewhere.
    const style = getComputedStyle(box);
    const room = parseFloat(style.scrollPaddingInlineStart) || parseFloat(style.paddingLeft) || 0;
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

  const link = linkOf(view, motion, current);
  const inStage = focusMetric && [...metricsOfStageIn(current, motion), ...(link ? [link] : [])].some((s) => s.id === focusMetric) ? focusMetric : null;

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
        key={`${motion}:${panelKey}`}
        stage={current}
        index={PILLARS.indexOf(current) + 1}
        view={view}
        actions={actions}
        initiallyOpen={inStage}
        motion={motion}
        diagnosis={diagnosis}
        link={link}
      />
    </div>
  );
}

/** A motion's diagnosis — the one its tabs stamp and its panel heads word. Self-serve's is the v1 field. */
function diagnosisOf(view: EngineView, motion: Motion): AnyDiagnosis {
  return view.derived.motions.find((m) => m.motion === motion)?.diagnosis ?? view.derived.diagnosis;
}

/**
 * The link (§18.6.3): under sales-assisted's three Acquisition numbers, in
 * the hybrid only, as its own block. It is neither motion's number — no tab
 * mark counts it, no diagnosis names it — and it is optional.
 */
function linkOf(view: EngineView, motion: Motion, stage: Pillar): MetricShape | null {
  const { plg, slg } = view.state.setup.motions;
  return motion === "slg" && stage === "acquisition" && plg && slg ? LINK_METRIC_SHAPES[0]! : null;
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
 * A folded row's sheet is in the page, `hidden="until-found"` (audit du kit
 * §6, CHANTIERS.md A4, 2026-09-29): Ctrl+F finds a word inside it and the
 * browser opens that row, which `beforematch` makes the row's own state.
 * Where the value is not understood (Safari) it is a plain `hidden`, the
 * row folded as before. A sheet holds a draft, so a folded one is drawn
 * again from the engine each time the engine changes, and each time the
 * row folds: opening a row still shows what is saved, never an edit left
 * behind or a count another number has since changed.
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
  motion,
  diagnosis,
  link,
}: {
  stage: Pillar;
  index: number;
  view: EngineView;
  actions: EngineActions;
  initiallyOpen: MetricId | null;
  motion: Motion;
  diagnosis: AnyDiagnosis;
  link: MetricShape | null;
}) {
  const { strings, state, ctx } = view;
  const snapshot = state.snapshots[state.snapshots.length - 1]!;
  const shapes = metricsOfStageIn(stage, motion);
  // A folded sheet's key: the engine it was drawn from, and how many times its row has folded.
  // An open row keeps the key it opened with, so opening never redraws what Ctrl+F just found.
  const revision = revisionOf(snapshot);
  const [folds, setFolds] = useState<Partial<Record<MetricId, number>>>({});
  const foldedKey = (metricId: MetricId) => `${revision}:${folds[metricId] ?? 0}`;
  const [open, setOpen] = useState<ReadonlyMap<MetricId, string>>(
    () => new Map(initiallyOpen ? [[initiallyOpen, foldedKey(initiallyOpen)]] : []),
  );
  const unfold = (metricId: MetricId) =>
    setOpen((was) => (was.has(metricId) ? was : new Map(was).set(metricId, foldedKey(metricId))));
  const toggle = (metricId: MetricId) => {
    if (!open.has(metricId)) return unfold(metricId);
    setOpen((was) => {
      const next = new Map(was);
      next.delete(metricId);
      return next;
    });
    setFolds((was) => ({ ...was, [metricId]: (was[metricId] ?? 0) + 1 }));
  };

  const namedIds = new Set<MetricId>(diagnosis.state === "clear" || diagnosis.state === "shared" ? diagnosis.named : []);
  const candidates: readonly MetricId[] = candidatesOf(motion);
  const positions = shapes.flatMap((shape) => {
    if (!candidates.includes(shape.id)) return [];
    const at = positionIn(diagnosis, shape.id as Parameters<typeof positionIn>[1]);
    // A position is only worded for a value someone has: an unknown sits nowhere.
    if (!at || knownIn(state, shape.id, ctx).kind !== "known") return [];
    const label = positionLabel(at.position, at.comparator, strings);
    return label ? [{ id: shape.id, text: `${metricById(view.metrics, shape.id).name} · ${label}`, named: namedIds.has(shape.id) }] : [];
  });

  const row = (shape: MetricShape) => {
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
        <FoldedBody id={bodyId} open={isOpen} onFound={() => unfold(shape.id)}>
          <MetricSheet key={open.get(shape.id) ?? foldedKey(shape.id)} id={shape.id} view={view} actions={actions} />
        </FoldedBody>
      </div>
    );
  };

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
      data-motion={motion}
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

      {shapes.map(row)}
      {link ? (
        <div className={styles.linkBlock} data-testid="engine-link-block">
          <h4 className={styles.linkTitle}>
            {strings.hybrid.linkBlock} <span className={styles.linkOptional}>{strings.workbench.optional}</span>
          </h4>
          {row(link)}
        </div>
      ) : null}
    </div>
  );
}

/** One number per engine snapshot object: what a folded sheet was drawn from (StagePanel). */
const revisions = new WeakMap<object, number>();
let lastRevision = 0;
function revisionOf(snapshot: object): number {
  let revision = revisions.get(snapshot);
  if (revision === undefined) {
    revision = ++lastRevision;
    revisions.set(snapshot, revision);
  }
  return revision;
}

/**
 * A row's body, `hidden="until-found"` while folded. Set on the element
 * rather than as a prop: React writes any `hidden` it is given as a bare
 * boolean, which would drop the value that makes it findable. A layout
 * effect, so a folded body is never painted open for a frame.
 */
function FoldedBody({ id, open, onFound, children }: { id: string; open: boolean; onFound: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (open) ref.current?.removeAttribute("hidden");
    else ref.current?.setAttribute("hidden", "until-found");
  }, [open]);
  useEffect(() => {
    const body = ref.current;
    body?.addEventListener("beforematch", onFound);
    return () => body?.removeEventListener("beforematch", onFound);
  }, [onFound]);
  return (
    <div ref={ref} id={id} className={styles.metricBody} data-testid="engine-metric-body">
      {children}
    </div>
  );
}
