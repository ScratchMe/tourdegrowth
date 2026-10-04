import { motionsAllowed } from "./business-type";
import { migrateToV3 } from "./migrate";
import { BUSINESS_TYPES } from "./setup-type";
import type { EngineStrings } from "./strings";
import { ENGINE_SCHEMA_VERSION, MOTIONS, YEAR_MONTH_PATTERN, type BusinessType, type EngineState } from "./types";
import { validateEngine } from "./validate";

/**
 * io.ts — the engine's `.json` file: what leaves the device, what comes back
 * (engine spec §4.3, §7 E7).
 *
 * The file is the engine's only durable copy: there is no server, and Safari
 * erases a site's storage after seven days without a visit. Two properties,
 * the same two `lib/audit/io.ts` holds (rewritten here, not imported — the
 * engine never reaches `lib/audit`, `engine-boundary.test.ts`):
 *
 * 1. **Two exports of the same state are byte-identical.** Keys are sorted,
 *    arrays keep their order (the order of snapshots, of ask bullets, is
 *    data), the text is indented. Someone who keeps their monthly files in a
 *    folder or a repository can diff them; without sorting, the insertion
 *    order of properties changes between two saves and every diff is noise.
 * 2. **Reading never throws.** A truncated transfer, the wrong file, a
 *    newer version: each produces a message on the import screen, never a
 *    blank page.
 */

/** Indented JSON, sorted keys, trailing newline — stable from one export to the next. */
export function serializeEngine(state: EngineState): string {
  return `${JSON.stringify(state, sortedKeys, 2)}\n`;
}

function sortedKeys(_key: string, value: unknown): unknown {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return value;
  const source = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(source).sort()) out[k] = source[k];
  return out;
}

export interface ParsedEngineFile {
  state: EngineState | null;
  errors: string[];
  refusal?: "unknown-version" | "not-engine" | "unreadable" | "unsupported-setup";
  /** 1 or 2 when the file was an older engine, migrated on the way in (§18.3.2, §19.1.3): the import screen says so. */
  migratedFrom?: 1 | 2;
}

/**
 * Reads a file. Never throws. Four outcomes, and the fourth is the one that
 * matters:
 *
 * - not JSON → `unreadable`;
 * - JSON that isn't an engine (an audit mission, a random export) → `not-engine`,
 *   so the import screen doesn't offer to "replace" the user's engine with nothing;
 * - an engine from a NEWER schema version → `unknown-version`. Refused, not
 *   opened with errors: we can't read what that version means, and offering to
 *   work on a state we misread is how data gets silently rewritten;
 * - an engine of this version that the validator objects to → the state IS
 *   returned, with its errors. A half-filled engine is exactly what people
 *   carry between two laptops; refusing it because one estimate lacks its basis
 *   would lose the fourteen other numbers.
 */
export function parseEngineFile(text: string): ParsedEngineFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    return { state: null, errors: [`JSON: ${err instanceof Error ? err.message : "invalid"}`], refusal: "unreadable" };
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { state: null, errors: ["file: not an object"], refusal: "not-engine" };
  }
  const o = parsed as Record<string, unknown>;
  // The version is judged before the shape: a v2 file may well have moved its fields, and it must read
  // as "newer", not as "not an engine" — the first tells the user to update, the second that they picked the wrong file.
  if (typeof o.schemaVersion === "number" && o.schemaVersion > ENGINE_SCHEMA_VERSION && looksLikeAnyEngine(o)) {
    return { state: null, errors: [`schemaVersion: ${o.schemaVersion}`], refusal: "unknown-version" };
  }
  if (!READABLE_VERSIONS.includes(o.schemaVersion as number) || !looksLikeEngine(o)) {
    return { state: null, errors: ["file: not a growth engine"], refusal: "not-engine" };
  }
  // An older engine is migrated, then validated like any v3 one (§18.3.2, §19.1.3): nothing in its numbers changes.
  const migrated = migrateToV3(o);
  if (!migrated || !sellsSomehow(migrated.state)) {
    return { state: null, errors: ["setup: no known type or no way of selling"], refusal: "unsupported-setup" };
  }
  const { state, from } = migrated;
  return { state, errors: validateEngine(state), ...(from !== ENGINE_SCHEMA_VERSION ? { migratedFrom: from } : {}) };
}

/** Every version this build reads: the older ones are migrated on the way in. */
const READABLE_VERSIONS: readonly number[] = [1, 2, ENGINE_SCHEMA_VERSION];

/**
 * A setup the board can show at all (§18.3.2, §21.6.3): a known type, and at
 * least one way of selling ticked, every ticked one being one the type
 * allows (a consumer app sells self-serve only). Refused rather than opened
 * with errors — there would be nothing to draw, and « Remplacer » would
 * replace an engine with an empty one. The app's monetization is not read
 * here: an app without one opens, and the validator says so.
 */
function sellsSomehow(state: EngineState): boolean {
  const setup = state.setup as unknown as Record<string, unknown>;
  const motions = setup.motions as Record<string, unknown> | undefined;
  if (typeof setup.type !== "string" || !(BUSINESS_TYPES as readonly string[]).includes(setup.type)) return false;
  if (typeof motions !== "object" || motions === null) return false;
  const allowed = motionsAllowed(setup.type as BusinessType);
  const ticked = MOTIONS.filter((motion) => motions[motion] === true);
  return ticked.length > 0 && ticked.every((motion) => allowed.includes(motion));
}

/**
 * Shape only, before the validator: "does this look like an engine at all?".
 * Loose enough for a draft, strict enough that an audit mission (which also
 * has a `schemaVersion` and an `id`) is not listed as an empty engine.
 */
export function looksLikeEngine(o: Record<string, unknown>): boolean {
  return (
    typeof o.id === "string" &&
    typeof o.setup === "object" &&
    o.setup !== null &&
    Array.isArray(o.snapshots) &&
    typeof o.deck === "object" &&
    o.deck !== null
  );
}

/** A newer version keeps its id and some state — the one marker we can rely on without knowing its shape. */
function looksLikeAnyEngine(o: Record<string, unknown>): boolean {
  return typeof o.id === "string" && ("snapshots" in o || "setup" in o);
}

/**
 * `tdg-moteur-2026-08.json` / `tdg-engine-2026-08.json` — the month of the flows,
 * so twelve monthly saves sort in a folder. The template comes resolved from the
 * copy (`io.fileName`); a month that isn't `YYYY-MM` falls back to the creation
 * month rather than putting arbitrary text in a file name.
 */
export function engineFileName(state: EngineState, words: EngineStrings["io"]): string {
  return monthFileName(state, words.fileName);
}

/** Any of the engine's files named by its month (the `.json`, the table's template, A14 T5) — the same guard for each. */
export function monthFileName(state: EngineState, template: string): string {
  const latest = state.snapshots.at(-1)?.referenceMonth;
  const month = latest && YEAR_MONTH_PATTERN.test(latest) ? latest : state.createdAt.slice(0, 7);
  return template.replace("{month}", month);
}
