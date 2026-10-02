"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/core/Button";
import { Select } from "@/components/core/Select";
import { EngineBar, type EngineBarGroup } from "@/components/engine/EngineBar";
import { NextStep, type NextStepLine, type NextStepProps } from "@/components/engine/NextStep";
import { motionShapes, shapeOf } from "@/lib/engine/catalog-shape";
import { periodRangeOf } from "@/lib/engine/cohort";
import { formatMonthRange, joinList } from "@/lib/engine/format";
import { nextMonthOf } from "@/lib/engine/series";
import type { EngineListing } from "@/lib/engine/storage";
import { ROLE_KEY } from "@/lib/engine/strings";
import { MAX_MONTHS, type EngineState, type MetricId, type RoleId } from "@/lib/engine/types";
import type { CollectPlan } from "./collect";
import { EngineSwitcher } from "./EngineSwitcher";
import { nextSelfNumber, nextStepFor, type NextStepChoice } from "./next-step";
import { RequestCopy } from "./RequestCopy";
import { draftFromEntry } from "./sheet-draft";
import { draftKey, keepDraft, keptDraft } from "./sheet-drafts";
import { daysBetween, fill, formatDate, formatMonth, metricById, midSentence } from "./text";
import type { EngineActions, EngineView } from "./view";

/** What the board needs to show the monthly series (engine spec §19.2, A14 T2). */
export interface SeriesControls {
  /** Every month of the engine, oldest first, by its index in `snapshots`. */
  months: { index: number; label: string }[];
  /** The month on screen. */
  shown: number;
  /** A past month being corrected: the board takes entries again, written back into that month. */
  correcting: boolean;
  /**
   * The next month (§19.2.1): ready to start, or the engine full; before the
   * flows' month is over, `later` — a reminder to start it (§19.9, A14 T6).
   */
  next: { kind: "ready"; label: string } | { kind: "full" } | { kind: "later"; label: string } | null;
  onPick: (index: number) => void;
  onCorrect: () => void;
  onDoneCorrecting: () => void;
  onStart: () => void;
  /** « Me rappeler de démarrer {mois} »: the calendar file for the day it can start. */
  onRemind?: () => void;
}

/**
 * Whether the device holds changes no file does yet (§4.3): never exported,
 * or edited since. Not dismissible: the engine lives in ONE browser, Safari
 * erases a site's data after seven days without a visit, and the only copy
 * that survives that is the `.json` the person downloads.
 */
export function needsBackup(state: EngineState): boolean {
  return !state.lastExportedAt || state.lastExportedAt < state.updatedAt;
}

/** The engines of the device (§19.1.5): the switcher in the menu, and the deletion of one in « Fichier ». */
export interface EngineControls {
  list: readonly EngineListing[];
  currentId: string;
  onSwitch: (id: string) => void;
  onNew: () => void;
  onDelete: () => void;
}

/**
 * The engine bar at the head of the board (design system extension 07,
 * A18 T2.a): the line that says what is on screen, the settings, and the
 * menu — « Ce moteur », « Mois », « Fichier » — that took in the switcher,
 * the month selector and its reminder, and the board's row of file actions.
 * « Reprendre le pas à pas » waits in « Ce moteur » until the step-by-step is
 * folded into the board (T3).
 */
export function BoardBar({
  view,
  series,
  engines,
  past,
  correcting,
  onSettings,
  onRename,
  onSteps,
  onSave,
  onImport,
  onErase,
  onTable,
}: {
  view: EngineView;
  series?: SeriesControls;
  engines?: EngineControls;
  /** A closed month on screen; `correcting` while it is being corrected. */
  past: boolean;
  correcting: boolean;
  onSettings: () => void;
  onRename: () => void;
  onSteps: () => void;
  onSave: () => void;
  onImport: () => void;
  onErase: () => void;
  /** Opens « Saisie en tableau » on the board. Absent on a past month: a table writes the month being filled. */
  onTable?: () => void;
}) {
  const { strings, state, ctx } = view;
  const b = strings.bar;
  const snapshot = state.snapshots[state.snapshots.length - 1]!;
  const { plg, slg } = state.setup.motions;

  // What the eyebrow said, minus the cohort — said where it is used, the denominator of a cohort's number.
  // Sales-assisted alone reads three months of flows (C25 Q2); the hybrid, the flows' month.
  const flows = periodRangeOf(shapeOf("slg.rev.win-rate"), undefined, snapshot, state.setup, ctx.today);
  const model = !slg ? strings.workbench.modelShort.selfserve : plg ? strings.workbench.modelShort.hybrid : strings.workbench.modelShort.salesAssisted;
  const month = slg && !plg && flows ? formatMonthRange(flows, ctx.locale, strings.units) : formatMonth(snapshot.referenceMonth, ctx.locale);
  const name = state.setup.companyLabel?.trim() || b.unnamed;
  const line = fill(past ? (correcting ? b.lineCorrecting : b.lineReadOnly) : b.line, { name, model, month });

  const backup = needsBackup(state);
  const groups: EngineBarGroup[] = [];

  const engineItems: ReactNode[] = [];
  if (engines && engines.list.length > 0) {
    engineItems.push(
      <EngineSwitcher
        key="switcher"
        engines={engines.list}
        currentId={engines.currentId}
        strings={strings}
        locale={ctx.locale}
        onSwitch={engines.onSwitch}
        onNew={engines.onNew}
      />,
    );
  }
  engineItems.push(
    <Button variant="quiet" size="sm" onClick={onRename} key="engine-rename" data-testid="engine-rename">
      {b.rename}
    </Button>,
    <Button variant="quiet" size="sm" onClick={onSteps} key="engine-open-steps" data-testid="engine-open-steps">
      {strings.board.steps}
    </Button>,
  );
  groups.push({ title: b.groupEngine, items: engineItems });

  const monthItems: ReactNode[] = [];
  if (series && series.months.length > 1) {
    monthItems.push(
      <Select
        key="month"
        label={b.monthField}
        size="sm"
        fit="content"
        value={String(series.shown)}
        onChange={(value) => value !== "" && series.onPick(Number(value))}
        // Newest first: the month being filled is the one most often wanted.
        options={[...series.months].reverse().map((m) => ({ value: String(m.index), label: m.label }))}
        data-testid="engine-month-select"
      />,
    );
  }
  // Its flows are not over yet: the way to be reminded of the day it can start (§19.9).
  if (series?.next?.kind === "later" && series.onRemind) {
    monthItems.push(
      <Button variant="quiet" size="sm" onClick={series.onRemind} key="engine-month-remind" data-testid="engine-month-remind">
        {fill(strings.reminders.month, { month: series.next.label })}
      </Button>,
    );
  }
  if (monthItems.length > 0) groups.push({ title: strings.series.monthLabel, items: monthItems });

  const fileItems: ReactNode[] = [
    <Button variant="quiet" size="sm" onClick={onSave} key="engine-save-json" data-testid="engine-save-json">
      {strings.actions.save}
    </Button>,
    <Button variant="quiet" size="sm" onClick={onImport} key="engine-import-open-screen" data-testid="engine-import-open-screen">
      {strings.actions.import}
    </Button>,
  ];
  if (onTable) {
    fileItems.push(
      <Button variant="quiet" size="sm" onClick={onTable} key="engine-table-open" data-testid="engine-table-open">
        {strings.table.title}
      </Button>,
    );
  }
  // This engine alone, its file offered first; « Tout effacer » stays, for every engine of the device at once.
  if (engines && engines.list.length > 0) {
    fileItems.push(
      <Button variant="quiet" size="sm" onClick={engines.onDelete} key="engine-delete-open" data-testid="engine-delete-open">
        {strings.engines.delete}
      </Button>,
    );
  }
  fileItems.push(
    <Button variant="quiet" size="sm" onClick={onErase} key="engine-erase-open" data-testid="engine-erase-open">
      {strings.actions.erase}
    </Button>,
  );
  groups.push({ title: b.groupFile, items: fileItems });

  return (
    <EngineBar
      line={line}
      pending={
        backup ? (state.lastExportedAt ? fill(strings.storage.lastExported, { date: formatDate(state.lastExportedAt, ctx.locale) }) : strings.storage.neverExported) : undefined
      }
      menuLabel={b.menu}
      groups={groups}
      note={backup ? strings.storage.backupWarning : undefined}
      settingsLabel={strings.board.settings}
      onSettings={onSettings}
      data-testid="engine-bar"
    />
  );
}

/** The board's one next step for the engine on screen — what `BoardNextStep` shows, and what the board's foot reads. */
export function boardNextStep(view: EngineView, plan: CollectPlan, writeFailed: boolean, past: boolean): NextStepChoice {
  const { state, ctx } = view;
  return nextStepFor({ plan, shapes: motionShapes(state.setup.motions), writeFailed, viewingPast: past, nextMonth: nextMonthOf(state, ctx.today) });
}

/**
 * The board's one next step (design system extension 07, A18 T2.a): the
 * reason, the one primary chosen by `nextStepFor`, then what else waits — a
 * request to follow up, the backup, the engine's last month. It took in the
 * resume band, the next month's band, the past month's band, the backup band
 * and the « refused to save » line.
 */
export function BoardNextStep({
  choice,
  view,
  actions,
  plan,
  returningFrom,
  series,
  past,
  correcting,
  onSave,
  onDeck,
  onRequests,
}: {
  /** `boardNextStep`. */
  choice: NextStepChoice;
  view: EngineView;
  actions: EngineActions;
  plan: CollectPlan;
  /** The last visit, on a return; null during a first visit. */
  returningFrom: string | null;
  series?: SeriesControls;
  past: boolean;
  correcting: boolean;
  onSave: () => void;
  onDeck: () => void;
  /** Rank 5, two or more: opens the requests, by role. */
  onRequests: () => void;
}) {
  const { strings, state, ctx } = view;
  const n = strings.next;
  const snapshot = state.snapshots[state.snapshots.length - 1]!;
  const shapes = motionShapes(state.setup.motions);
  // The roles followed up in this session: their line stays, so the copy's confirmation and « Me le rappeler » stay with it.
  const [followedUp, setFollowedUp] = useState<Partial<Record<RoleId, MetricId[]>>>({});

  const nameOf = (id: MetricId) => metricById(view.metrics, id).name;
  const ago = (days: number) => (days === 0 ? n.today : days === 1 ? n.yesterday : fill(n.daysAgo, { n: days }));
  const lastLabel = series ? (series.months[series.months.length - 1]?.label ?? "") : "";
  const shownLabel = series ? (series.months[series.shown]?.label ?? "") : "";

  /** A number's screen, on the board. « Je le demande » open when the person is sent there to ask for it. */
  const openNumber = (id: MetricId, ask = false) => {
    if (ask) {
      const entry = snapshot.metrics[id];
      const key = draftKey(id, entry, snapshot.referenceMonth);
      if (!keptDraft(key)) keepDraft(key, { ...draftFromEntry(entry, shapeOf(id)), mode: "ask" });
    }
    actions.openMetric(id);
  };
  /** What « Continuer {mois} » and « Taper d'abord le chiffre suivant » open: the step the month would not have taken over. */
  const resumeButton = (label: string, testId: string, rest: NextStepChoice): ReactNode => {
    const go =
      rest.kind === "number" ? () => openNumber(rest.id) : rest.kind === "ask-one" ? () => openNumber(rest.id, true) : rest.kind === "ask-all" ? onRequests : null;
    return go ? (
      <Button variant="quiet" onClick={go} data-testid={testId}>
        {label}
      </Button>
    ) : undefined;
  };

  let step: Pick<NextStepProps, "lead" | "leadTone" | "announce" | "primary" | "secondary">;
  const extra: NextStepLine[] = [];
  switch (choice.kind) {
    case "save-file":
      step = {
        lead: strings.storage.writeFailed,
        leadTone: "advice",
        announce: true,
        primary: { label: n.goSaveFile, onClick: onSave, "data-testid": "engine-next-save" },
      };
      break;
    case "back-to-current":
      step = {
        lead: fill(correcting ? strings.series.correcting : strings.series.viewing, { month: shownLabel }),
        primary: { label: fill(n.goBack, { month: lastLabel }), onClick: () => series?.onPick(series.months.length - 1), "data-testid": "engine-month-back" },
        secondary: correcting ? (
          <Button variant="quiet" onClick={series?.onDoneCorrecting} data-testid="engine-month-done">
            {strings.series.doneCorrecting}
          </Button>
        ) : (
          <Button variant="quiet" onClick={series?.onCorrect} data-testid="engine-month-correct">
            {strings.series.correct}
          </Button>
        ),
      };
      break;
    case "start-month": {
      const label = formatMonth(choice.referenceMonth, ctx.locale);
      step = {
        lead: fill(strings.series.ready, { month: label }),
        primary: { label: fill(n.goMonth, { month: label }), onClick: () => series?.onStart(), "data-testid": "engine-month-start" },
        secondary: resumeButton(
          fill(n.keepFilling, { month: formatMonth(snapshot.referenceMonth, ctx.locale) }),
          "engine-next-keep",
          nextStepFor({ plan, shapes, writeFailed: false, viewingPast: false, nextMonth: { kind: "not-yet" } }),
        ),
      };
      break;
    }
    case "number":
      step = {
        lead: choice.effort === "self-5min" ? n.leadQuick : choice.effort === "self-1h" ? n.leadLong : n.leadBuild,
        primary: {
          label: fill(n.goNumber, { number: midSentence(nameOf(choice.id), ctx.locale) }),
          onClick: () => openNumber(choice.id),
          "data-testid": "engine-next-number",
        },
      };
      break;
    case "ask-one":
      step = {
        // The catalogue's name is a label, after the colon (engine-copy.ts): French never agrees with it.
        lead: fill(nextSelfNumber(plan, shapes) ? n.leadAskOne : n.leadAskOneOnly, { number: midSentence(nameOf(choice.id), ctx.locale) }),
        primary: {
          label: fill(n.goAsk, { role: strings.role[ROLE_KEY[choice.role]], number: midSentence(nameOf(choice.id), ctx.locale) }),
          onClick: () => openNumber(choice.id, true),
          "data-testid": "engine-next-ask",
        },
      };
      break;
    case "ask-all": {
      const self = nextSelfNumber(plan, shapes);
      step = {
        lead: fill(self ? n.leadAskAll : n.leadAskAllOnly, { n: choice.ids.length }),
        primary: { label: fill(n.goRequests, { n: choice.ids.length }), onClick: onRequests, "data-testid": "engine-next-requests" },
        secondary: self ? resumeButton(n.skipRequests, "engine-next-skip", { kind: "number", ...self }) : undefined,
      };
      break;
    }
    case "slides":
      step = {
        lead: choice.waiting.length === 0 ? n.leadAnswered : choice.waiting.length === 1 ? n.leadWaitingOne : fill(n.leadWaiting, { n: choice.waiting.length }),
        primary: { label: strings.actions.deck, onClick: onDeck, "data-testid": "engine-open-deck" },
      };
      extra.push({ text: n.verdictIsSlide });
      break;
  }

  const lines: NextStepLine[] = [];
  // The requests to follow up, one line per role, the oldest request's day said (§7 E6). Not on a past month: it is read, not chased.
  if (!past) {
    for (const group of plan.ask) {
      const kept = followedUp[group.role];
      if (group.stale.length === 0 && !kept) continue;
      const ids = group.stale.length > 0 ? group.stale : kept!;
      const days = Math.max(...ids.map((id) => daysBetween(snapshot.metrics[id]?.request?.requestedAt ?? "", ctx.today)));
      const role = strings.role[ROLE_KEY[group.role]];
      lines.push({
        text: fill(n.asked, { role, ago: ago(days), list: joinList(ids.map((id) => midSentence(nameOf(id), ctx.locale)), strings.grammar) }),
        tone: "pending",
        action: (
          <RequestCopy
            role={group.role}
            ids={group.stale}
            label={n.followUp}
            view={view}
            variant="quiet"
            inline
            onCopied={() => {
              setFollowedUp((current) => ({ ...current, [group.role]: group.stale }));
              actions.markReminded(group.stale);
            }}
          />
        ),
        "data-testid": `engine-next-asked-${group.role}`,
      });
    }
  }
  lines.push(...extra);
  // The backup, while the device holds what no file does (§4.3). The refused save says it in its lead already.
  if (needsBackup(state) && choice.kind !== "save-file") {
    lines.push({
      text: state.lastExportedAt ? fill(n.backupChanged, { date: formatDate(state.lastExportedAt, ctx.locale) }) : n.backup,
      tone: "advice",
      action: (
        <Button variant="quiet" size="sm" onClick={onSave} data-testid="engine-backup-save">
          {strings.actions.save}
        </Button>
      ),
      "data-testid": "engine-backup",
    });
  }
  if (!past && series?.next?.kind === "full") lines.push({ text: fill(strings.series.full, { max: MAX_MONTHS }), "data-testid": "engine-month-full" });

  return (
    <NextStep
      eyebrow={returningFrom ? fill(n.since, { ago: ago(daysBetween(returningFrom, ctx.today)) }) : n.where}
      {...step}
      lines={lines}
      data-testid="engine-next"
      data-step={choice.kind}
    />
  );
}
