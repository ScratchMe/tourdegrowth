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

/** `T` with any branch left out; a leaf is still a whole string and an array is replaced whole (§21.8.1). */
export type DeepPartial<T> = T extends string ? T : T extends readonly unknown[] ? T : { [K in keyof T]?: DeepPartial<T[K]> };

/**
 * The base with every leaf the overlay carries replaced; arrays replaced whole. Never mutates either, and returns the
 * very branches of `base` the overlay does not touch. A key the overlay has and the base lacks is ignored: the type
 * forbids it, and `engine-copy-consumer.test.ts` holds that none exists.
 *
 * The one merge of the engine's island (`EngineWorkbench`): a type's words are the base's with the type's overlay on
 * top (§21.8.1), so a screen or a slide reads one `EngineStrings` and never asks which type it is on.
 */
export function mergeStrings<T>(base: T, overlay: DeepPartial<NoInfer<T>> | undefined): T {
  if (overlay === undefined) return base;
  if (!isBranch(base) || !isBranch(overlay)) return overlay as T;
  const over = overlay as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(base)) {
    out[key] = key in over && over[key] !== undefined ? mergeStrings(value, over[key] as DeepPartial<typeof value>) : value;
  }
  return out as T;
}

/** A plain object: neither a leaf (string, number…) nor an array, which an overlay replaces whole. */
function isBranch(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** One of the seventeen numbers, its prose resolved (§4.4). Placeholders ({month}, {cohort}, {n}, {event}, {variant}) are still raw. */
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

/** One of the five computed figures, resolved (§5.7). */
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
  "company-wide": "companyWide",
};

/**
 * The bases a number's sheet offers for an estimate. Never `company-wide`:
 * the company's margin stands in for a motion's margin only, offered in the
 * hybrid by its own « Reprendre la marge globale » on the two margin sheets
 * (C25 Q4, A7.3.c S3) — and `validate.ts` refuses it anywhere else.
 */
export const SHEET_BASES: readonly EstimateBasis[] = (Object.keys(BASIS_KEY) as EstimateBasis[]).filter((b) => b !== "company-wide");

/** Role and repair ids are already valid keys; spelled out so a renamed id breaks the build. */
export const ROLE_KEY: Record<RoleId, keyof EngineStrings["role"]> = {
  finance: "finance",
  data: "data",
  product: "product",
  marketing: "marketing",
  revops: "revops",
  support: "support",
  sales: "sales",
  "customer-success": "customer-success",
};

export const REPAIR_KEY: Record<RepairScale, keyof EngineStrings["repair"]> = {
  meeting: "meeting",
  afternoon: "afternoon",
  sprint: "sprint",
  quarter: "quarter",
};
