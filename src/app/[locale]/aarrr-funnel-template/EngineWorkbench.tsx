"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { motionOfMetric, motionShapes, shapeOf } from "@/lib/engine/catalog-shape";
import type { EngineStrings, ResolvedBridge, ResolvedDerived, ResolvedMetric } from "@/lib/engine/strings";
import { MAX_ENGINES, type EngineCalcContext, type EngineDerived, type EngineSetup, type EngineState, type LeverId, type MetricEntry, type MetricId, type Motion, type MotionDerived, type RoleId, type SharedCount, type SlideTitle, type Snapshot, type YearMonth } from "@/lib/engine/types";
import type { Locale } from "@/lib/i18n/locale";
import { Board } from "./_engine/Board";
import type { SeriesControls } from "./_engine/BoardHead";
import { DeckView } from "./_engine/deck/DeckView";
import { collectPlan } from "./_engine/collect";
import { latestTourWithAnswers } from "@/lib/engine/bridge";
import { pelotonTitle } from "@/lib/engine/deck";
import { relaysTitle, totalTitle } from "@/lib/engine/deck-motions";
import { deriveEngine } from "@/lib/engine/derive";
import { calendarFile, nextMonthStart } from "@/lib/engine/ics";
import { engineFileName, monthFileName, serializeEngine } from "@/lib/engine/io";
import { mergeEngines } from "@/lib/engine/merge";
import { markReminded, markRequested } from "@/lib/engine/request";
import { monthView, nextMonthOf, startNextMonth, withMonth } from "@/lib/engine/series";
import { teamTools } from "@/lib/engine/tools";
import { requestPersistence } from "@/lib/engine/storage";
import { newEngineState } from "@/lib/engine/validate";
import { propagateFrom, withSharedCount } from "@/lib/engine/shared-counts";
import { engineSetupDetail, engineStageDetail, trackEngine, type EngineStageDetail } from "./_engine/engine-events";
import { commit, erase, getClientSnapshot, getServerSnapshot, removeEngine, subscribe, switchEngine, type CommitResult } from "./_engine/engine-store";
import { tableTemplate, type TablePreview } from "./_engine/csv";
import { DeleteEngineDialog } from "./_engine/DeleteEngineDialog";
import { download, enginePageUrl } from "./_engine/download";
import { engineName } from "./_engine/EngineSwitcher";
import { EraseDialog } from "./_engine/EraseDialog";
import { ExampleView } from "./_engine/ExampleView";
import { ImportPanel, type ImportChoice } from "./_engine/ImportPanel";
import { NumberScreen } from "./_engine/NumberScreen";
import { Steps } from "./_engine/Steps";
import { resumePosition, type StepPosition } from "./_engine/steps-model";
import { Setup, type SetupChoice } from "./_engine/Setup";
import { domId, fill, formatMonth } from "./_engine/text";
import type { EngineActions, EngineView } from "./_engine/view";
import screens from "./_engine/Screens.module.css";

/**
 * The props contract of the growth engine's island — engine spec §4.4.
 * Everything arrives resolved to the page's language; the island imports no
 * content module and no dictionary (`engine-boundary.test.ts`), so it ships
 * one language's strings and none of the copy it doesn't render.
 */
export interface EngineWorkbenchProps {
  locale: Locale;
  /** `ENGINE_COPY` resolved (§14). */
  strings: EngineStrings;
  /** The seventeen numbers' prose, in catalogue order (`METRIC_SHAPES`). */
  metrics: ResolvedMetric[];
  /** The three computed figures (§5.7). */
  derived: ResolvedDerived[];
  /** The eight Tour bridges, question text and options in the Tour's order (§6.11). */
  bridges: ResolvedBridge[];
}

/**
 * The screens of the one route (§7): the board, the step-by-step, the
 * slides, the settings, the example, and the two file screens. The current
 * screen is NOT persisted — reopening costs a click, the entries are what is
 * kept; an engine found on arrival opens on the board.
 */
// `new` and `delete` since A14 T5 (§19.1.5): another engine's setup, and one engine's deletion.
// `number` since A18 T2.b: one number's own screen, opened from the board's list.
type Screen = "board" | "number" | "steps" | "deck" | "import" | "erase" | "settings" | "example" | "new" | "delete";

// Once per page session, not per mount (§11.6: "first view of the island in the session").
let openedTracked = false;
// "The first save of a number of that stage in the session" (§11.6) — the stage, never the number.
const savedStages = new Set<EngineStageDetail>();
// navigator.storage.persist() asked once, at the first successful write (§4.3).
let persistenceAsked = false;

/** The first save of a number of its stage in the session (§11.6). Sales-assisted's stages count apart, prefixed (Q14); the link's block sits under its acquisition. */
function stageSaved(id: MetricId): void {
  const stageDetail = engineStageDetail(shapeOf(id).stage, motionOfMetric(id));
  if (savedStages.has(stageDetail)) return;
  savedStages.add(stageDetail);
  trackEngine({ name: "engine_stage_saved", detail: stageDetail });
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const newId = (): string => globalThis.crypto.randomUUID();
/** A file opened on an empty device keeps its id when it is one this build would have made; anything else gets a new one. */
const importedId = (id: unknown): string => (typeof id === "string" && UUID.test(id) ? id : newId());

function lastSnapshot(state: EngineState): Snapshot {
  return state.snapshots[state.snapshots.length - 1]!;
}

function withSnapshot(state: EngineState, change: (snapshot: Snapshot) => Snapshot): EngineState {
  return { ...state, snapshots: [...state.snapshots.slice(0, -1), change(lastSnapshot(state))] };
}

/**
 * The engine's client island (spec §7): a small state machine over ONE
 * route — setup, the board and its two tabs, the slides, import, erase —
 * like `/quiz`, with no URL per screen.
 *
 * What is on this device is read through `useSyncExternalStore` (the store
 * module), never in a mount effect: the server snapshot is `null`, so the
 * prerendered HTML and the first client render are the same empty shell,
 * and the stored engine arrives on the next render with no mismatch (R15).
 * `data-state` says which of the two is on screen — e2e helpers wait on it.
 *
 * Every write goes through `persist`: it stamps `updatedAt`, commits (the
 * screen keeps what was typed even if the device refuses — D15), and says
 * so when it did refuse. Focus moves only when a PERSON moved between
 * screens (R-19): to the verdict on entering the board, to a number's
 * heading when its screen opens, back to its row in « Tes chiffres » on the
 * way back — never on first paint.
 */
export function EngineWorkbench({ locale, strings, metrics, derived: derivedCopy, bridges }: EngineWorkbenchProps) {
  const snap = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const [screen, setScreen] = useState<Screen>("board");
  const [stepsFrom, setStepsFrom] = useState<StepPosition>({ phase: "targets" });
  // The number whose own screen is open (A18 T2.b): opened from its row in « Tes chiffres », the next step, or the collect list.
  const [numberId, setNumberId] = useState<MetricId | null>(null);
  // The hybrid's selector (§18.7): the motion of the number opened last in this session, else self-serve.
  const [motionView, setMotionView] = useState<Motion | null>(null);
  // The motions the setup card had ticked when « Voir un exemple rempli » was pressed (§18.7).
  const [exampleMotions, setExampleMotions] = useState<Record<Motion, boolean>>({ plg: true, slg: false });
  const [writeFailed, setWriteFailed] = useState(false);
  // The monthly series (§19.2.4): the month on screen — null, the month being filled — and whether a past one is being corrected.
  const [monthIndex, setMonthIndex] = useState<number | null>(null);
  const [correcting, setCorrecting] = useState(false);
  const [focusRequest, setFocusRequest] = useState<{ id: string; n: number } | null>(null);
  // « Renommer » (A18 T2.a): the settings open at the company's name, not at their title.
  const [renaming, setRenaming] = useState(false);

  useEffect(() => {
    if (focusRequest) document.getElementById(focusRequest.id)?.focus();
  }, [focusRequest]);

  useEffect(() => {
    if (snap && !openedTracked) {
      openedTracked = true;
      trackEngine({ name: "engine_opened" });
    }
  }, [snap]);

  const state = snap?.result.kind === "ok" ? snap.result.state : null;
  const openedAt = snap?.openedAt ?? null;
  const tourResults = snap?.tourResults;
  const computed = useMemo(() => {
    if (!state || !openedAt) return null;
    // A past month is read as it was seen (§19.2.3): the months up to it, its windows, the day it was closed.
    // Every screen below reads the LAST month of the state it gets, so the past month is simply that state's last.
    const month = monthIndex !== null && monthIndex < state.snapshots.length - 1 ? monthIndex : null;
    const lens = month === null ? { state, today: new Date(openedAt) } : monthView(state, month, new Date(openedAt));
    const ctx = { today: lens.today, locale };
    const tourResult = state.tourLink ? (tourResults?.find((r) => r.id === state.tourLink?.resultId) ?? null) : null;
    const derived = deriveEngine(lens.state, ctx, tourResult, bridges, strings.units);
    // The board's title is its first slide's title, from the same function (§7 E2, §9.3, §18.8):
    // the screen and the slide cannot word one engine two ways.
    const verdict = verdictOf(lens.state, derived, strings, metrics, ctx);
    // The team's tools, when ticked (§19.5.2): « À faire toi-même » by tool, with each number's `where` in the catalogue's order.
    const selected = teamTools(lens.state.setup.tools);
    const citedBy = (id: MetricId) =>
      (metrics.find((m) => m.id === id)?.where ?? []).flatMap((w) => (w.source.kind === "tool" ? [w.source.tool] : []));
    const plan = collectPlan(lastSnapshot(lens.state), ctx.today, motionShapes(lens.state.setup.motions), { selected, citedBy });
    const deviceTour = latestTourWithAnswers(tourResults ?? []);
    const tourOnDevice = deviceTour !== null;
    const view: EngineView = { state: lens.state, derived, strings, metrics, derivedCopy, bridges, ctx, tourResult, tourOnDevice, deviceTour };
    return { view, verdict, plan, month };
  }, [state, openedAt, tourResults, locale, bridges, strings, metrics, derivedCopy, monthIndex]);

  const focus = (id: string) => setFocusRequest((current) => ({ id, n: (current?.n ?? 0) + 1 }));

  function persist(next: EngineState, options: { fresh?: boolean; stamp?: boolean; overUnreadable?: boolean; add?: boolean } = {}): CommitResult {
    const stamped = options.stamp === false ? next : { ...next, updatedAt: new Date().toISOString() };
    const result = commit(stamped, { fresh: options.fresh, overUnreadable: options.overUnreadable, add: options.add });
    setWriteFailed(!result.ok);
    if (result.ok && !persistenceAsked) {
      persistenceAsked = true;
      void requestPersistence();
    }
    return result;
  }

  function openBoard() {
    setScreen("board");
    focus("engine-verdict");
  }

  /** Back to the month being filled: every screen but the board works on it (the deck, the settings, the steps, the files). */
  function toCurrentMonth() {
    setMonthIndex(null);
    setCorrecting(false);
  }

  function openSteps(from: StepPosition) {
    setStepsFrom(from);
    setScreen("steps");
    focus("engine-steps-title");
  }

  function openExample(motions?: Record<Motion, boolean>) {
    if (motions) setExampleMotions(motions);
    setScreen("example");
    focus("engine-example-title");
  }

  const hydrated = snap !== null;
  const shell = (children: ReactNode) => (
    <div data-testid="engine-workbench" data-state={hydrated ? "ready" : "ssr"} data-locale={locale}>
      {children}
    </div>
  );

  if (!snap) return shell(null);

  // --- Nothing (usable) on this device: setup, import, or the unreadable notice.
  if (!state || !computed) {
    if (screen === "example") {
      return shell(
        <ExampleView
          locale={locale}
          strings={strings}
          metrics={metrics}
          derivedCopy={derivedCopy}
          bridges={bridges}
          motions={exampleMotions}
          onBack={() => {
            setScreen("board");
            focus("engine-setup-title");
          }}
        />,
      );
    }
    if (screen === "import") {
      return shell(
        <ImportPanel
          strings={strings}
          locale={locale}
          metrics={metrics}
          device={null}
          onOpen={(imported) => {
            // Over an unreadable store the device refuses to write (it will not overwrite what it
            // can't read). Choosing a file here IS the confirmed way past it, so clear first.
            // Over an unreadable store, under an id of its own: it must not land on an entry nobody could read (A14 T5).
            if (snap.result.kind === "unreadable") persist({ ...imported, id: newId() }, { fresh: true, stamp: false, overUnreadable: true });
            else persist({ ...imported, id: importedId(imported.id) }, { fresh: true, stamp: false });
            openBoard();
          }}
          onCancel={() => setScreen("board")}
        />,
      );
    }
    if (snap.result.kind === "unreadable") {
      if (screen === "erase") {
        return shell(
          <EraseDialog
            strings={strings}
            engines={snap.stored}
            companyLabel={undefined}
            onErase={() => {
              erase();
              setScreen("board");
              focus("engine-setup-title");
            }}
            onCancel={() => setScreen("board")}
          />,
        );
      }
      return shell(
        <Card elevation="flat" className={screens.panel} data-testid="engine-unreadable">
          <p className={screens.notice} role="alert">
            {strings.storage.unreadable}
          </p>
          <div className={screens.panelActions}>
            <Button variant="secondary" onClick={() => setScreen("import")}>
              {strings.actions.import}
            </Button>
            <Button variant="quiet" onClick={() => setScreen("erase")}>
              {strings.actions.erase}
            </Button>
          </div>
        </Card>,
      );
    }
    const tour = latestTourWithAnswers(snap.tourResults);
    return shell(
      <Setup
        strings={strings}
        locale={locale}
        today={new Date(snap.openedAt)}
        tour={tour}
        onImport={() => {
          setScreen("import");
          focus("engine-import-title");
        }}
        onExample={openExample}
        onStart={(choice: SetupChoice) => {
          const nowIso = new Date().toISOString();
          // The months the setup screen SHOWED, not the engine's fallback: the two can
          // differ around midnight, and the person chose what they saw.
          const created = newEngineState(choice.setup, nowIso, {
            referenceMonth: choice.referenceMonth,
            cohortMonth: choice.cohortMonth,
          });
          const next: EngineState = {
            ...created,
            tourLink: choice.tourResultId ? { resultId: choice.tourResultId, linkedAt: nowIso } : null,
          };
          persist(next, { fresh: true, stamp: false });
          // Which boxes were ticked (Q14): a choice, never a number or a word typed.
          const motions = engineSetupDetail(choice.setup.motions);
          trackEngine({ name: "engine_setup", detail: motions });
          if (choice.tourResultId) trackEngine({ name: "engine_tour_linked" });
          if (choice.start === "steps") openSteps({ phase: "targets" });
          else openBoard();
        }}
      />,
    );
  }

  const { view, verdict, plan, month } = computed;
  const current = state;
  // What the board's actions edit: the month on screen. A past month is written back in its place (`withMonth`),
  // and only while it is being corrected — read only, nothing on screen offers to write.
  const lensState = view.state;
  const write = (next: EngineState): CommitResult => persist(month === null ? next : withMonth(current, month, next));

  const actions: EngineActions = {
    saveEntry(id: MetricId, entry: MetricEntry) {
      // A count this number shares with others (shared-counts.ts) becomes the base and is
      // written into them: typed once, never contradicting itself across the board.
      const result = write(withSnapshot(lensState, (s) => propagateFrom({ ...s, metrics: { ...s.metrics, [id]: entry } }, id)));
      if (result.ok) stageSaved(id);
      return result;
    },
    setTarget(id: MetricId, target: number | null) {
      write(
        withSnapshot(lensState, (s) => {
          const targets = { ...s.targets };
          if (target === null) delete targets[id];
          else targets[id] = target;
          return { ...s, targets };
        }),
      );
    },
    // Every count in ONE write: two calls in the same tick would both start from the
    // same `current`, and the second would silently drop the first.
    setBase(counts: Partial<Record<SharedCount, number>>) {
      write(
        withSnapshot(lensState, (s) =>
          (Object.entries(counts) as [SharedCount, number][]).reduce((acc, [count, value]) => withSharedCount(acc, count, value), s),
        ),
      );
    },
    setPipelineOpen(open: number | null) {
      write(
        withSnapshot(lensState, (s) => {
          const { pipelineOpen: _previous, ...rest } = s;
          return open === null ? rest : { ...rest, pipelineOpen: open };
        }),
      );
    },
    setWhatIf(targets: Partial<Record<LeverId, number>>) {
      // An empty map is « all back to today »: the field goes, so a file never carries an empty scenario.
      const { whatIf: _previous, ...rest } = current;
      persist(Object.keys(targets).length > 0 ? { ...rest, whatIf: targets } : rest);
    },
    markRequested(ids: MetricId[], role: RoleId) {
      write(withSnapshot(lensState, (s) => markRequested(s, ids, role, new Date().toISOString())));
    },
    markReminded(ids: MetricId[]) {
      write(withSnapshot(lensState, (s) => markReminded(s, ids, new Date().toISOString())));
    },
    openMetric(id: MetricId) {
      // Its own screen, its heading focused: a move between screens the person asked for (R-19).
      // The link is sales-assisted's: its motion, for the selector the way back lands on.
      setMotionView(motionOfMetric(id));
      setNumberId(id);
      setScreen("number");
      focus("engine-number-title");
    },
    linkTour(resultId: string | null) {
      // Only the id is stored (D13): the Tour is read from `tdg.results.v1`, never copied, and
      // unlinking leaves it on the device (C8).
      const result = persist({ ...current, tourLink: resultId ? { resultId, linkedAt: new Date().toISOString() } : null });
      if (result.ok && resultId) trackEngine({ name: "engine_tour_linked" });
    },
  };

  function exportJson() {
    // The file records its own export, so re-importing it doesn't raise the backup band.
    const saved: EngineState = { ...current, lastExportedAt: new Date().toISOString() };
    download(serializeEngine(saved), engineFileName(saved, strings.io));
    persist(saved, { stamp: false });
    trackEngine({ name: "engine_exported", detail: "json" });
  }

  // The engines on this device (§19.1.5): the switcher's list, the name the import and the deletion say.
  const engines = snap.engines ?? [];
  const currentName = engineName({ createdAt: current.createdAt, ...(current.setup.companyLabel ? { companyLabel: current.setup.companyLabel } : {}) }, strings, locale);

  /** Leaves whatever the board was showing — a past month, a number, the engine shown — for another engine's. */
  function resetBoard() {
    toCurrentMonth();
    setNumberId(null);
    setMotionView(null);
  }

  if (screen === "import") {
    return shell(
      <ImportPanel
        strings={strings}
        locale={locale}
        metrics={metrics}
        device={{ state: current, name: currentName, canAdd: engines.length < MAX_ENGINES }}
        onOpen={(imported, choice: ImportChoice | null) => {
          if (choice === "merge") {
            const merged = mergeEngines(current, imported);
            if (merged.kind !== "ok") return;
            persist(merged.state);
          } else if (choice === "add") {
            // Beside the others, always under a new id: the file's own may be another engine of the device
            // (one's own save reopened), an entry nobody could read, or no id at all (the security review of A14 T5).
            persist({ ...imported, id: newId() }, { fresh: true, stamp: false, add: true });
          } else {
            // « Remplacer » the engine on screen — and only it: the file takes its id, so it is written in its place.
            persist({ ...imported, id: current.id }, { fresh: true, stamp: false });
          }
          resetBoard();
          openBoard();
        }}
        onCancel={openBoard}
      />,
    );
  }

  if (screen === "new") {
    return shell(
      <Setup
        strings={strings}
        locale={locale}
        today={new Date(snap.openedAt)}
        tour={view.deviceTour}
        onCancel={openBoard}
        onStart={(choice: SetupChoice) => {
          const nowIso = new Date().toISOString();
          const created = newEngineState(choice.setup, nowIso, { referenceMonth: choice.referenceMonth, cohortMonth: choice.cohortMonth });
          const next: EngineState = { ...created, tourLink: choice.tourResultId ? { resultId: choice.tourResultId, linkedAt: nowIso } : null };
          persist(next, { fresh: true, stamp: false, add: true });
          const motions = engineSetupDetail(choice.setup.motions);
          trackEngine({ name: "engine_setup", detail: motions });
          if (choice.tourResultId) trackEngine({ name: "engine_tour_linked" });
          resetBoard();
          if (choice.start === "steps") openSteps({ phase: "targets" });
          else openBoard();
        }}
      />,
    );
  }

  if (screen === "delete") {
    return shell(
      <DeleteEngineDialog
        name={currentName}
        strings={strings}
        onSave={exportJson}
        onDelete={() => {
          const last = engines.length <= 1;
          const result = removeEngine(current.id);
          setWriteFailed(!result.ok);
          resetBoard();
          setScreen("board");
          // The next engine's board, or — the last one gone — the setup.
          focus(last && result.ok ? "engine-setup-title" : "engine-verdict");
        }}
        onCancel={openBoard}
      />,
    );
  }

  if (screen === "erase") {
    return shell(
      <EraseDialog
        strings={strings}
        engines={snap.stored}
        companyLabel={current.setup.companyLabel}
        onErase={() => {
          erase();
          setScreen("board");
          setNumberId(null);
          focus("engine-setup-title");
        }}
        onCancel={openBoard}
      />,
    );
  }

  if (screen === "settings") {
    const snapshot = lastSnapshot(current);
    return shell(
      <Setup
        strings={strings}
        locale={locale}
        today={view.ctx.today}
        tour={view.deviceTour}
        linked={current.tourLink !== null}
        after={current.snapshots[current.snapshots.length - 2]?.referenceMonth}
        initial={{ setup: current.setup, referenceMonth: snapshot.referenceMonth, cohortMonth: snapshot.cohortMonth }}
        existing={{
          activation: snapshot.metrics["act.rate"] !== undefined,
          paid: snapshot.metrics["rev.paid-conversion"] !== undefined,
          qualification: snapshot.metrics["slg.acq.lead-to-opp"] !== undefined,
          goLive: snapshot.metrics["slg.act.go-live"] !== undefined,
          any: Object.keys(snapshot.metrics).length > 0,
          entered: enteredCounts(snapshot),
        }}
        focusCompany={renaming}
        onCancel={() => {
          setRenaming(false);
          openBoard();
        }}
        onStart={(choice) => {
          setRenaming(false);
          // The Tour box (C8): ticked keeps the link there is, or links this Tour; unticked unlinks —
          // and the Tour stays on the device either way.
          const settled = withSettings(current, choice.setup, choice.referenceMonth, choice.cohortMonth);
          const linking = choice.tourResultId !== null && current.tourLink === null;
          const tourLink = choice.tourResultId === null ? null : (current.tourLink ?? { resultId: choice.tourResultId, linkedAt: new Date().toISOString() });
          const result = persist({ ...settled, tourLink });
          if (result.ok && linking) trackEngine({ name: "engine_tour_linked" });
          // A motion ticked or unticked after the fact is a new choice of motions (Q14).
          const changed = engineSetupDetail(choice.setup.motions);
          if (result.ok && changed !== engineSetupDetail(current.setup.motions)) trackEngine({ name: "engine_setup", detail: changed });
          openBoard();
        }}
      />,
    );
  }

  if (screen === "example") {
    return shell(
      <ExampleView locale={locale} strings={strings} metrics={metrics} derivedCopy={derivedCopy} bridges={bridges} motions={current.setup.motions} onBack={openBoard} />,
    );
  }

  if (screen === "steps") {
    return shell(
      <Steps
        view={view}
        actions={actions}
        initial={stepsFrom}
        onBoard={openBoard}
        onSave={exportJson}
        onDeck={() => {
          setScreen("deck");
          trackEngine({ name: "engine_deck_opened" });
          focus("engine-deck-title");
        }}
      />,
    );
  }

  if (screen === "deck") {
    // DeckView owns the section, its heading (focused on arrival) and its back button (§7 E5).
    // html-to-image stays a dynamic import inside it, never in this island's first chunk.
    return shell(
      <DeckView
        locale={locale}
        strings={strings}
        metrics={metrics}
        derivedCopy={derivedCopy}
        bridges={bridges}
        state={current}
        derived={view.derived}
        ctx={view.ctx}
        onDeckChange={(deck) => persist({ ...current, deck })}
        onBack={openBoard}
        onSaveJson={exportJson}
        onExported={(kind) => trackEngine({ name: "engine_exported", detail: kind })}
      />,
    );
  }

  // The monthly series (§19.2): every month by its flows' month, the next month once its flows are over.
  const lastIndex = current.snapshots.length - 1;
  const today = new Date(snap.openedAt);
  const next = nextMonthOf(current, today);
  const series: SeriesControls = {
    months: current.snapshots.map((s, index) => ({ index, label: formatMonth(s.referenceMonth, locale) })),
    shown: month ?? lastIndex,
    correcting: month !== null && correcting,
    next:
      next.kind === "ready"
        ? { kind: "ready", label: formatMonth(next.referenceMonth, locale) }
        : next.kind === "full"
          ? { kind: "full" }
          : { kind: "later", label: formatMonth(nextMonthStart(current).month, locale) },
    onPick(index) {
      setMonthIndex(index === lastIndex ? null : index);
      setCorrecting(false);
      setNumberId(null);
      focus("engine-verdict");
    },
    onCorrect() {
      setCorrecting(true);
    },
    onDoneCorrecting() {
      setCorrecting(false);
    },
    onRemind() {
      // The day the next month can start (§19.9): its flows' month name, never a number of the engine.
      const r = strings.reminders;
      const { month, day } = nextMonthStart(current);
      const label = formatMonth(month, locale);
      const file = calendarFile({
        uid: `${globalThis.crypto.randomUUID()}@tourdegrowth.com`,
        stamp: new Date(),
        day,
        title: fill(r.monthTitle, { month: label }),
        description: `${fill(r.monthDescription, { month: label })}\n\n${enginePageUrl()}`,
        url: enginePageUrl(),
      });
      const date = `${day.year}-${String(day.month).padStart(2, "0")}-${String(day.date).padStart(2, "0")}`;
      download(file, fill(r.fileName, { date }), "text/calendar;charset=utf-8");
      trackEngine({ name: "engine_exported", detail: "ics" });
    },
    onStart() {
      // The month that ends is closed with today's date and the setup's windows; the new one starts with its targets only (§19.2.2).
      const started = startNextMonth(current, today, new Date().toISOString());
      if (!started) return;
      // The one sign of a series in use (§19.12) — counted once the device holds it, never which month.
      if (persist(started).ok) trackEngine({ name: "engine_month_started" });
      toCurrentMonth();
      setNumberId(null);
      focus("engine-verdict");
    },
  };

  if (screen === "number" && numberId) {
    const id = numberId;
    return shell(
      <NumberScreen
        id={id}
        view={view}
        actions={actions}
        onBack={() => {
          setScreen("board");
          // Back to its row (the list's), as « ← Tes chiffres » says.
          focus(`engine-metric-${domId(id)}`);
        }}
      />,
    );
  }

  return shell(
    // Keyed by the engine: another engine's board starts fresh — no pasted table, open sheet or pinned tab follows it (A14 T5).
    <Board
      key={current.id}
      view={view}
      actions={actions}
      verdict={verdict}
      series={series}
      plan={plan}
      returningFrom={snap.returningFrom}
      motionView={motionView}
      onMotion={setMotionView}
      writeFailed={writeFailed}
      onDeck={() => {
        toCurrentMonth();
        setScreen("deck");
        trackEngine({ name: "engine_deck_opened" });
        focus("engine-deck-title");
      }}
      onSave={exportJson}
      onImport={() => {
        toCurrentMonth();
        setScreen("import");
        focus("engine-import-title");
      }}
      onErase={() => {
        toCurrentMonth();
        setScreen("erase");
        focus("engine-erase-title");
      }}
      onSettings={() => {
        toCurrentMonth();
        setRenaming(false);
        setScreen("settings");
        focus("engine-setup-title");
      }}
      onSteps={() => {
        toCurrentMonth();
        openSteps(resumePosition(lastSnapshot(current), current.setup.motions));
      }}
      onRename={() => {
        toCurrentMonth();
        setScreen("settings");
        setRenaming(true);
      }}
      engines={
        engines.length > 0
          ? {
              list: engines,
              currentId: current.id,
              onSwitch: (id) => {
                const result = switchEngine(id);
                if (!result.ok) return;
                resetBoard();
                focus("engine-verdict");
              },
              onNew: () => {
                resetBoard();
                setScreen("new");
                focus("engine-setup-title");
              },
              onDelete: () => {
                resetBoard();
                setScreen("delete");
                focus("engine-delete-title");
              },
            }
          : undefined
      }
      onTemplate={() => {
        // The month being filled, its ticked motions, the page's language: « ; » and the decimal comma in French.
        const text = tableTemplate(current, motionShapes(current.setup.motions), metrics, strings, locale);
        download(`\uFEFF${text}`, monthFileName(current, strings.table.fileName), "text/csv;charset=utf-8");
        trackEngine({ name: "engine_exported", detail: "csv" });
      }}
      onApplyTable={(preview: TablePreview) => {
        const result = persist(withSnapshot(current, () => preview.snapshot));
        // A pasted number is a number saved (§19.12): the first of each stage counts once, as from its sheet.
        if (result.ok) for (const row of preview.rows) if (row.kind === "new" || row.kind === "changed") stageSaved(row.id);
        return result.ok;
      }}
    />,
  );
}

/**
 * The engine with new settings (Antoine, 2026-09-25: they could not be
 * changed without erasing everything). A window is part of a number's
 * definition — activation within n days, paid within n days — so changing
 * it sends that number back to "to fill in": kept, it would claim a
 * definition it was not measured on. The settings card says so before the
 * save. A month changed keeps every entry: the card asks to reread them.
 */
function withSettings(state: EngineState, setup: EngineSetup, referenceMonth: YearMonth, cohortMonth: YearMonth): EngineState {
  const snapshot = lastSnapshot(state);
  const metrics = { ...snapshot.metrics };
  if (setup.activationWindowDays !== state.setup.activationWindowDays) delete metrics["act.rate"];
  if (setup.paidWindowDays !== state.setup.paidWindowDays) delete metrics["rev.paid-conversion"];
  // The sales-assisted windows are part of their numbers' definitions too (§18.1.2): the same rule.
  if (setup.qualificationWindowDays !== state.setup.qualificationWindowDays) delete metrics["slg.acq.lead-to-opp"];
  if (setup.goLiveWindowDays !== state.setup.goLiveWindowDays) delete metrics["slg.act.go-live"];
  const hadCompany = Boolean(state.setup.companyLabel);
  return {
    ...state,
    // Unticking a motion loses nothing (§18.1.2): its entries, targets, what-ifs and slide boxes stay in
    // the state, the storage and the file; the board, the coverage, the diagnosis and the deck ignore them.
    setup,
    // A name given for the first time goes on the slides, as it does at creation.
    deck: !hadCompany && setup.companyLabel ? { ...state.deck, showCompany: true } : state.deck,
    snapshots: [...state.snapshots.slice(0, -1), { ...snapshot, referenceMonth, cohortMonth, metrics }],
  };
}

/**
 * The board's verdict, by the motions (§18.7, §18.8): self-serve alone, the
 * peloton's title (v1, to the character); sales-assisted alone, the relays';
 * the hybrid, « deux moteurs, un total ». Each is its deck's first slide.
 */
function verdictOf(state: EngineState, derived: EngineDerived, strings: EngineStrings, metrics: ResolvedMetric[], ctx: EngineCalcContext): SlideTitle {
  const { plg, slg } = state.setup.motions;
  if (plg && slg && derived.total) return totalTitle(derived.total, state, strings, ctx);
  const relays = derived.motions.find((m): m is Extract<MotionDerived, { motion: "slg" }> => m.motion === "slg");
  if (!plg && relays) return relaysTitle(state, relays.relays, strings, metrics, ctx);
  return pelotonTitle(state, derived.peloton, strings, metrics, ctx);
}

/** The numbers already entered on each side (anything but « à faire »): what the settings say a motion keeps (§18.1.2). */
function enteredCounts(snapshot: Snapshot): Record<Motion, number> {
  const counts: Record<Motion, number> = { plg: 0, slg: 0 };
  for (const [id, entry] of Object.entries(snapshot.metrics)) {
    if (!entry || entry.status === "todo") continue;
    counts[motionOfMetric(id as MetricId)] += 1;
  }
  return counts;
}
