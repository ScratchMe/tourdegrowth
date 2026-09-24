import type { Resolved } from "@/lib/i18n/translatable";
import type { ENGINE_COPY } from "@/content/engine-copy"; // type only: erased, never a bundle edge
import type {
  DerivedId,
  Effort,
  EstimateBasis,
  MetricId,
  MetricStatus,
  MissingCause,
  RepairScale,
  RoleId,
  SourceRef,
} from "./types";

/**
 * What the server hands the growth engine's client island — engine spec §4.4.
 * Types and key maps only, no text: every string arrives already resolved to the page's
 * language, as props. The island never imports `content/`, so neither the
 * other language nor any copy it doesn't render reaches the browser
 * (`engine-boundary.test.ts` walks its value imports to keep it that way).
 *
 * The `import type` above is erased by the compiler: naming `ENGINE_COPY`'s
 * shape here costs the bundle nothing, and it is what makes a key renamed in
 * the copy a compile error in every consumer rather than an `undefined` on
 * screen.
 */

export type { Resolved };

/** `ENGINE_COPY` resolved to one language: every `{ en, fr }` leaf is a string. */
export type EngineStrings = Resolved<typeof ENGINE_COPY>;

/** One of the fifteen numbers, its prose resolved (§4.4). Placeholders ({month}, {cohort}, {n}, {event}, {variant}) are still raw. */
export interface ResolvedMetric {
  id: MetricId;
  name: string;
  oneLiner: string;
  formula: string;
  trap: string;
  /** Labels of the two counts. */
  inputs?: { numerator: string; denominator: string };
  /**
   * ≤ 3 places to find it. `source` instead of the spec's bare `tool`: some
   * places are a role, not a tool ("Finance — the income statement").
   */
  where: { source: SourceRef; label: string; path: string }[];
  /** "What to pull", for the copied request. Never a value. */
  request: string;
  noReferenceReason?: string;
  benchmarkCaveat?: string;
  variants?: { id: string; label: string }[];
  naReasons?: { id: string; label: string }[];
  choices?: { id: string; label: string }[];
  /** `localePath(locale, "/glossary/<term>")`, opened in a new tab (§5.8). */
  glossaryHref: string;
}

/** One of the three computed figures, resolved (§5.7). */
export interface ResolvedDerived {
  id: DerivedId;
  name: string;
  formula: string;
  /** "can't be computed — missing: {input}" */
  uncomputable: string;
  capNote?: string;
  caveat?: string;
  glossaryHref: string;
}

/** A Tour question the engine bridges to (§6.11), resolved: its text and its three options with their points. */
export interface ResolvedBridge {
  questionId: string;
  metric: MetricId | DerivedId;
  question: string;
  options: { label: string; points: number }[];
}

/*
 * Closed vocabularies are kebab-case ids in the data (they end up in the
 * user's .json file) and camelCase keys in the copy. These maps are the one
 * place the two meet, so a screen never builds a copy key by string surgery
 * — and a status added to the union without its label fails to compile.
 */

export const STATUS_KEY: Record<MetricStatus, keyof EngineStrings["status"]> = {
  todo: "todo",
  requested: "requested",
  measured: "measured",
  estimated: "estimated",
  conflicting: "conflicting",
  missing: "missing",
  "not-applicable": "notApplicable",
};

export const EFFORT_KEY: Record<Effort, keyof EngineStrings["effort"]> = {
  "self-5min": "self5",
  "self-1h": "self1h",
  ask: "ask",
  build: "build",
};

export const CAUSE_KEY: Record<MissingCause, keyof EngineStrings["cause"]> = {
  "not-tracked": "notTracked",
  "not-computed": "notComputed",
  "no-access": "noAccess",
  "no-definition": "noDefinition",
};

export const BASIS_KEY: Record<EstimateBasis, keyof EngineStrings["basis"]> = {
  "team-hunch": "teamHunch",
  "old-number": "oldNumber",
  sample: "sample",
  other: "other",
};

/** Role and repair ids are already valid keys; spelled out so a renamed id breaks the build. */
export const ROLE_KEY: Record<RoleId, keyof EngineStrings["role"]> = {
  finance: "finance",
  data: "data",
  product: "product",
  marketing: "marketing",
  revops: "revops",
  support: "support",
};

export const REPAIR_KEY: Record<RepairScale, keyof EngineStrings["repair"]> = {
  meeting: "meeting",
  afternoon: "afternoon",
  sprint: "sprint",
  quarter: "quarter",
};
