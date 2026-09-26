"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { shapeOf } from "@/lib/engine/catalog-shape";
import type { EngineStrings, ResolvedBridge, ResolvedDerived, ResolvedMetric } from "@/lib/engine/strings";
import type { EngineSetup, EngineState, MetricEntry, MetricId, RoleId, SharedCount, Snapshot, YearMonth } from "@/lib/engine/types";
import type { Locale } from "@/lib/i18n/locale";
import type { Pillar } from "@/lib/scoring/pillars";
import { Board } from "./_engine/Board";
import { DeckView } from "./_engine/deck/DeckView";
import { collectPlan } from "./_engine/collect";
import { latestTourWithAnswers } from "@/lib/engine/bridge";
import { pelotonTitle } from "@/lib/engine/deck";
import { deriveEngine } from "@/lib/engine/derive";
import { engineFileName, serializeEngine } from "@/lib/engine/io";
import { markReminded, markRequested } from "@/lib/engine/request";
import { requestPersistence } from "@/lib/engine/storage";
import { newEngineState } from "@/lib/engine/validate";
import { propagateFrom, withSharedCount } from "@/lib/engine/shared-counts";
import { trackEngine } from "./_engine/engine-events";
import { commit, erase, getClientSnapshot, getServerSnapshot, subscribe, type CommitResult } from "./_engine/engine-store";
import { EraseDialog } from "./_engine/EraseDialog";
import { ExampleView } from "./_engine/ExampleView";
import { ImportPanel } from "./_engine/ImportPanel";
import { Steps } from "./_engine/Steps";
import { resumePosition, type StepPosition } from "./_engine/steps-model";
import { Setup, type SetupChoice } from "./_engine/Setup";
import { domId } from "./_engine/text";
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
  /** The fifteen numbers' prose, in catalogue order (`METRIC_SHAPES`). */
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
type Screen = "board" | "steps" | "deck" | "import" | "erase" | "settings" | "example";

// Once per page session, not per mount (§11.6: "first view of the island in the session").
let openedTracked = false;
// "The first save of a number of that stage in the session" (§11.6) — the stage, never the number.
const savedStages = new Set<Pillar>();
// navigator.storage.persist() asked once, at the first successful write (§4.3).
let persistenceAsked = false;

function lastSnapshot(state: EngineState): Snapshot {
  return state.snapshots[state.snapshots.length - 1]!;
}

function withSnapshot(state: EngineState, change: (snapshot: Snapshot) => Snapshot): EngineState {
  return { ...state, snapshots: [...state.snapshots.slice(0, -1), change(lastSnapshot(state))] };
}

/** A download that never touches the network: a Blob URL on an anchor IN the document (a detached one doesn't download everywhere), revoked later so a slow start isn't cut. */
function download(text: string, fileName: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.hidden = true;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
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
 * screens (R-19): to the verdict on entering the board, to a drawer's title
 * when a row opens, back to the row when it closes — never on first paint.
 */
export function EngineWorkbench({ locale, strings, metrics, derived: derivedCopy, bridges }: EngineWorkbenchProps) {
  const snap = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const [screen, setScreen] = useState<Screen>("board");
  const [stepsFrom, setStepsFrom] = useState<StepPosition>({ phase: "targets" });
  const [selected, setSelected] = useState<Pillar | null>(null);
  const [drawerSeq, setDrawerSeq] = useState(0);
  const [focusMetric, setFocusMetric] = useState<MetricId | null>(null);
  const [writeFailed, setWriteFailed] = useState(false);
  const [focusRequest, setFocusRequest] = useState<{ id: string; n: number } | null>(null);

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
    const ctx = { today: new Date(openedAt), locale };
    const tourResult = state.tourLink ? (tourResults?.find((r) => r.id === state.tourLink?.resultId) ?? null) : null;
    const derived = deriveEngine(state, ctx, tourResult, bridges, strings.units);
    // The board's title is the peloton slide's title, from the same function (§7 E2, §9.3):
    // the screen and the slide cannot word one engine two ways.
    const verdict = pelotonTitle(state, derived.peloton, strings, metrics, ctx);
    const plan = collectPlan(lastSnapshot(state), ctx.today);
    const tourOnDevice = latestTourWithAnswers(tourResults ?? []) !== null;
    const view: EngineView = { state, derived, strings, metrics, derivedCopy, bridges, ctx, tourResult, tourOnDevice };
    return { view, verdict, plan };
  }, [state, openedAt, tourResults, locale, bridges, strings, metrics, derivedCopy]);

  const focus = (id: string) => setFocusRequest((current) => ({ id, n: (current?.n ?? 0) + 1 }));

  function persist(next: EngineState, options: { fresh?: boolean; stamp?: boolean; replace?: boolean } = {}): CommitResult {
    const stamped = options.stamp === false ? next : { ...next, updatedAt: new Date().toISOString() };
    const result = commit(stamped, { fresh: options.fresh, replace: options.replace });
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

  function openSteps(from: StepPosition) {
    setStepsFrom(from);
    setScreen("steps");
    focus("engine-steps-title");
  }

  function openExample() {
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
          hasEngine={false}
          onOpen={(imported) => {
            // Over an unreadable store the device refuses to write (it will not overwrite what it
            // can't read). Choosing a file here IS the confirmed way past it, so clear first.
            persist(imported, { fresh: true, stamp: false, replace: snap.result.kind === "unreadable" });
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
          if (choice.tourResultId) trackEngine({ name: "engine_tour_linked" });
          if (choice.start === "steps") openSteps({ phase: "targets" });
          else openBoard();
        }}
      />,
    );
  }

  const { view, verdict, plan } = computed;
  const current = state;

  const actions: EngineActions = {
    saveEntry(id: MetricId, entry: MetricEntry) {
      // A count this number shares with others (shared-counts.ts) becomes the base and is
      // written into them: typed once, never contradicting itself across the board.
      const result = persist(withSnapshot(current, (s) => propagateFrom({ ...s, metrics: { ...s.metrics, [id]: entry } }, id)));
      const stage = shapeOf(id).stage;
      if (result.ok && !savedStages.has(stage)) {
        savedStages.add(stage);
        trackEngine({ name: "engine_stage_saved", detail: stage });
      }
      return result;
    },
    setTarget(id: MetricId, target: number | null) {
      persist(
        withSnapshot(current, (s) => {
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
      persist(
        withSnapshot(current, (s) =>
          (Object.entries(counts) as [SharedCount, number][]).reduce((acc, [count, value]) => withSharedCount(acc, count, value), s),
        ),
      );
    },
    markRequested(ids: MetricId[], role: RoleId) {
      persist(withSnapshot(current, (s) => markRequested(s, ids, role, new Date().toISOString())));
    },
    markReminded(ids: MetricId[]) {
      persist(withSnapshot(current, (s) => markReminded(s, ids, new Date().toISOString())));
    },
    openMetric(id: MetricId) {
      setScreen("board");
      setSelected(shapeOf(id).stage);
      setFocusMetric(id);
      setDrawerSeq((n) => n + 1);
      focus(`engine-metric-${domId(id)}`);
    },
  };

  function exportJson() {
    // The file records its own export, so re-importing it doesn't raise the backup band.
    const saved: EngineState = { ...current, lastExportedAt: new Date().toISOString() };
    download(serializeEngine(saved), engineFileName(saved, strings.io));
    persist(saved, { stamp: false });
    trackEngine({ name: "engine_exported", detail: "json" });
  }

  if (screen === "import") {
    return shell(
      <ImportPanel
        strings={strings}
        locale={locale}
        hasEngine
        onOpen={(imported) => {
          persist(imported, { fresh: true, stamp: false });
          setSelected(null);
          openBoard();
        }}
        onCancel={openBoard}
      />,
    );
  }

  if (screen === "erase") {
    return shell(
      <EraseDialog
        strings={strings}
        companyLabel={current.setup.companyLabel}
        onErase={() => {
          erase();
          setScreen("board");
          setSelected(null);
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
        tour={null}
        initial={{ setup: current.setup, referenceMonth: snapshot.referenceMonth, cohortMonth: snapshot.cohortMonth }}
        existing={{
          activation: snapshot.metrics["act.rate"] !== undefined,
          paid: snapshot.metrics["rev.paid-conversion"] !== undefined,
          any: Object.keys(snapshot.metrics).length > 0,
        }}
        onCancel={openBoard}
        onStart={(choice) => {
          persist(withSettings(current, choice.setup, choice.referenceMonth, choice.cohortMonth));
          openBoard();
        }}
      />,
    );
  }

  if (screen === "example") {
    return shell(
      <ExampleView locale={locale} strings={strings} metrics={metrics} derivedCopy={derivedCopy} bridges={bridges} onBack={openBoard} />,
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

  return shell(
    <Board
      view={view}
      actions={actions}
      verdict={verdict}
      plan={plan}
      selected={selected}
      onSelect={(stage) => {
        const was = selected;
        setSelected(stage);
        setFocusMetric(null);
        if (stage) focus(`engine-drawer-${stage}-title`);
        else if (was) focus(`engine-row-${was}`);
      }}
      drawerSeq={drawerSeq}
      focusMetric={focusMetric}
      returningFrom={snap.returningFrom}
      writeFailed={writeFailed}
      onDeck={() => {
        setScreen("deck");
        trackEngine({ name: "engine_deck_opened" });
        focus("engine-deck-title");
      }}
      onSave={exportJson}
      onImport={() => {
        setScreen("import");
        focus("engine-import-title");
      }}
      onErase={() => {
        setScreen("erase");
        focus("engine-erase-title");
      }}
      onSettings={() => {
        setScreen("settings");
        focus("engine-setup-title");
      }}
      onSteps={() => openSteps(resumePosition(lastSnapshot(current)))}
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
  const hadCompany = Boolean(state.setup.companyLabel);
  return {
    ...state,
    // The model is not editable (one profile in v1), nor is anything the card doesn't show.
    setup: { ...setup, profile: state.setup.profile },
    // A name given for the first time goes on the slides, as it does at creation.
    deck: !hadCompany && setup.companyLabel ? { ...state.deck, showCompany: true } : state.deck,
    snapshots: [...state.snapshots.slice(0, -1), { ...snapshot, referenceMonth, cohortMonth, metrics }],
  };
}
