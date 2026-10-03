import { SETUP_V2_DEFAULTS, type EngineSetup, type EngineSetupV1, type EngineState } from "./types";

/**
 * migrate.ts — an older engine becomes a v3 one: v1 → v2 (engine spec
 * §18.3.1, A7.3.c S0), then v2 → v3 (§19.1.3, A14 T0).
 *
 * v2 → v3 changes the version and nothing else. Every field v3 adds is
 * optional and means « as before » when absent (`setup.tools`,
 * `setup.pipeline`, `deck.theme`, a month's `closedAt`, `windows`,
 * `pipelineOpen`, an entry's `denominatorSource`, and since A20
 * `setup.runwayMonths`), so a v2 engine gives, to
 * the character, the same board and the same slides —
 * `__tests__/golden-v2.test.ts` holds that promise, as `golden-v1.test.ts`
 * holds the v1 one through both steps.
 *
 * v1 → v2:
 *
 * The v2 file separates the type of business from how it sells (decision 3,
 * `CHANTIERS.md` C4): `setup.profile: "selfserve"` becomes `setup.type:
 * "b2b-saas"` with only the self-serve motion ticked, and the two
 * sales-assisted windows arrive at their defaults. **Everything else is
 * copied as it is**: no number id changes (the self-serve ones keep their v1
 * names, §18.2 S5), so a v1 engine gives, to the character, the same board
 * and the same slides — `__tests__/golden-v1.test.ts` holds that promise.
 *
 * Pure, and never throws: a v1 file is untrusted input like any other. It
 * returns `null` for anything that is neither a recognisable v1 engine nor a
 * v2 one, and hands a v2 state back unchanged (idempotent, byte for byte).
 * Validation is NOT its job: a half-filled v1 file migrates, and the
 * validator then reports what it reported before.
 */

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

/** An engine at all, whatever its version: an id, a setup, its snapshots and its deck (`io.ts#looksLikeEngine`). */
function looksLikeEngine(o: Obj): boolean {
  return typeof o.id === "string" && isObj(o.setup) && Array.isArray(o.snapshots) && isObj(o.deck);
}

/** A state as a v2 build wrote it: the v3 shape minus its optional fields, at version 2. */
export type EngineStateV2 = Omit<EngineState, "schemaVersion"> & { schemaVersion: 2 };

export interface MigratedV2 {
  state: EngineStateV2;
  /** The version the state was read as: 1 when it was migrated, 2 when it already was v2. */
  from: 1 | 2;
}

export interface Migrated {
  state: EngineState;
  /** The version the state was read as: 1 or 2 when it was migrated, 3 when it already was v3. */
  from: 1 | 2 | 3;
}

/**
 * Any engine this build understands, as a v3 one. Never throws, `null` for
 * anything else (a newer version included), and a copy whenever it migrates:
 * the caller's object — a parsed file, an old store — stays what it was. A v3
 * state comes back unchanged (idempotent, byte for byte).
 */
export function migrateToV3(input: unknown): Migrated | null {
  if (!isObj(input) || !looksLikeEngine(input)) return null;
  if (input.schemaVersion === 3) return { state: input as unknown as EngineState, from: 3 };
  const v2 = migrateToV2(input);
  if (!v2) return null;
  const state = { ...(v2.from === 2 ? structuredClone(v2.state) : v2.state), schemaVersion: 3 } as EngineState;
  return { state, from: v2.from };
}

export function migrateToV2(input: unknown): MigratedV2 | null {
  if (!isObj(input) || !looksLikeEngine(input)) return null;
  if (input.schemaVersion === 2) return { state: input as unknown as EngineStateV2, from: 2 };
  if (input.schemaVersion !== 1) return null;

  const v1Setup = input.setup as Partial<EngineSetupV1> & Obj;
  // No v1 build could write another profile: anything else is not a v1 engine we understand.
  if (v1Setup.profile !== "selfserve") return null;

  const { profile: _profile, ...kept } = v1Setup;
  const setup = {
    ...kept,
    type: SETUP_V2_DEFAULTS.type,
    motions: { ...SETUP_V2_DEFAULTS.motions },
    qualificationWindowDays: SETUP_V2_DEFAULTS.qualificationWindowDays,
    goLiveWindowDays: SETUP_V2_DEFAULTS.goLiveWindowDays,
  } as EngineSetup;
  // A copy: the caller's v1 object (a parsed file, the v1 store) stays what it was.
  const state = { ...structuredClone(input), schemaVersion: 2, setup } as unknown as EngineStateV2;
  return { state, from: 1 };
}
