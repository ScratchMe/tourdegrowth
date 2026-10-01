import { describe, expect, it } from "vitest";
import { parseEngineFile, serializeEngine } from "../io";
import { migrateToV2, migrateToV3 } from "../migrate";
import type { EngineState } from "../types";
import { exampleState } from "./fixtures";
import { fullState, toV1 } from "./storage-fixtures";

/**
 * The v1 → v2 migration — engine spec §18.3.1 and §18.3.5, tests 2 to 4
 * (A7.3.c S0) — and v2 → v3 (§19.1.3, A14 T0). Test 1 of each, the golden,
 * lives in `golden-v1.test.ts` and `golden-v2.test.ts`.
 *
 * Non-vacuity, measured on 2026-09-30 (this file, `io.test.ts`, the golden):
 * - ticking the sales-assisted motion in the migration (`slg: true`) fails
 *   the three setup tests here and « a v1 file is migrated » in io — and
 *   nothing in the golden yet, since no module reads the motions before S1;
 * - forgetting `activationWindowDays` fails 12: four here, the two v1 files
 *   of io, and all seven states of the golden;
 * - returning the v1 object itself instead of a copy fails « leaves the v1
 *   object as it was », and only it.
 *
 * And on 2026-10-01 (A14 T0): a v2 → v3 that spreads the v2 state instead of
 * copying it all the way down passed every test until « leaves the v2 object
 * as it was » changed the migrated state's insides; it fails that test alone.
 * Dropping `whatIf` on the way fails the two goldens' what-if states.
 */

describe("migrateToV2 — a v1 engine", () => {
  it("the setup, field by field: the profile becomes a type and ONE motion, self-serve; the rest is copied", () => {
    const migrated = migrateToV2(toV1(fullState()));
    expect(migrated?.from).toBe(1);
    expect(migrated!.state.setup).toEqual({
      type: "b2b-saas",
      motions: { plg: true, slg: false },
      currency: "EUR",
      activationWindowDays: 7,
      paidWindowDays: 30,
      qualificationWindowDays: 30,
      goLiveWindowDays: 90,
      companyLabel: "Mon produit",
    });
    expect("profile" in migrated!.state.setup).toBe(false);
  });

  it("self-serve only: a v1 engine never comes out as a hybrid", () => {
    expect(migrateToV2(toV1(exampleState()))!.state.setup.motions).toEqual({ plg: true, slg: false });
  });

  it("copies everything else as it is — no number id changes (S5)", () => {
    const v3 = fullState();
    const migrated = migrateToV2(toV1(v3))!.state;
    expect(migrated.schemaVersion).toBe(2);
    expect(migrated).toEqual({ ...v3, schemaVersion: 2 });
  });

  it("leaves the v1 object as it was: a parsed file or a v1 store is never rewritten in place", () => {
    const v1 = toV1(fullState());
    const before = JSON.stringify(v1);
    migrateToV2(v1);
    expect(JSON.stringify(v1)).toBe(before);
  });
});

/** The same engine as a v2 build wrote it: v3 minus nothing but its version. */
const toV2 = (state: EngineState) => ({ ...structuredClone(state), schemaVersion: 2 as const });

describe("migrateToV3 — a v2 engine, and a v1 one through both steps (§19.1.3)", () => {
  it("v2 → v3 changes the version and nothing else", () => {
    const v3 = fullState();
    const migrated = migrateToV3(toV2(v3));
    expect(migrated?.from).toBe(2);
    expect(migrated!.state).toEqual(v3);
  });

  it("v1 → v3 goes through v2: the same setup the v1 migration gives, at version 3", () => {
    const migrated = migrateToV3(toV1(fullState()));
    expect(migrated?.from).toBe(1);
    expect(migrated!.state).toEqual(fullState());
  });

  it("leaves the v2 object as it was: a parsed file or a v2 store is never rewritten in place", () => {
    const v2 = toV2(fullState());
    const before = JSON.stringify(v2);
    const migrated = migrateToV3(v2);
    expect(JSON.stringify(v2)).toBe(before);
    expect(migrated!.state).not.toBe(v2);
    // A copy all the way down: what the screen then changes in the v3 state never reaches the v2 copy kept on the device.
    migrated!.state.setup.motions.slg = true;
    migrated!.state.snapshots[0]!.metrics = {};
    expect(JSON.stringify(v2)).toBe(before);
  });

  it("a v3 engine comes back unchanged, byte for byte", () => {
    const v3 = fullState();
    const before = serializeEngine(v3);
    const again = migrateToV3(v3);
    expect(again?.from).toBe(3);
    expect(again!.state).toBe(v3);
    expect(serializeEngine(again!.state)).toBe(before);
  });
});

describe("§18.3.5 and §19.1.3 — round trip, idempotence, refusals", () => {
  it("test 2 — serialize(migrate(v1)) then parse gives an equal state, without a warning", () => {
    const migrated = migrateToV3(toV1(fullState()))!.state;
    const parsed = parseEngineFile(serializeEngine(migrated));
    expect(parsed.errors).toEqual([]);
    expect(parsed.state).toEqual(migrated);
    expect(parsed.migratedFrom).toBeUndefined();
  });

  it("a v2 file opens migrated, and says so; a v1 file too", () => {
    const fromV2 = parseEngineFile(JSON.stringify(toV2(fullState())));
    expect(fromV2.state).toEqual(fullState());
    expect(fromV2.migratedFrom).toBe(2);
    expect(fromV2.errors).toEqual([]);
    expect(parseEngineFile(JSON.stringify(toV1(fullState()))).migratedFrom).toBe(1);
  });

  it("test 3 — migrate(v2) to v2 gives v2 back unchanged, byte for byte", () => {
    const v2 = toV2(fullState());
    const again = migrateToV2(v2);
    expect(again?.from).toBe(2);
    expect(again!.state).toBe(v2);
  });

  it("test 4 — refused: an unknown v1 profile, an unknown version, what isn't an engine", () => {
    expect(migrateToV2({ ...toV1(fullState()), setup: { ...(toV1(fullState()).setup as object), profile: "sales-led" } })).toBeNull();
    expect(migrateToV3({ ...toV1(fullState()), setup: { ...(toV1(fullState()).setup as object), profile: "sales-led" } })).toBeNull();
    expect(migrateToV2({ ...toV1(fullState()), schemaVersion: 3 })).toBeNull();
    expect(migrateToV3({ ...fullState(), schemaVersion: 4 })).toBeNull();
    for (const other of [null, 42, [], { schemaVersion: 1 }, { schemaVersion: 1, id: "m-1", header: {}, passes: [] }]) {
      expect(migrateToV2(other)).toBeNull();
      expect(migrateToV3(other)).toBeNull();
    }
  });
});
