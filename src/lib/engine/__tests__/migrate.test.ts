import { describe, expect, it } from "vitest";
import { parseEngineFile, serializeEngine } from "../io";
import { migrateToV2 } from "../migrate";
import { exampleState } from "./fixtures";
import { fullState, toV1 } from "./storage-fixtures";

/**
 * The v1 → v2 migration — engine spec §18.3.1 and §18.3.5, tests 2 to 4
 * (A7.3.c S0). Test 1, the golden, lives in `golden-v1.test.ts`.
 *
 * Non-vacuity, measured on 2026-09-30 (this file, `io.test.ts`, the golden):
 * - ticking the sales-assisted motion in the migration (`slg: true`) fails
 *   the three setup tests here and « a v1 file is migrated » in io — and
 *   nothing in the golden yet, since no module reads the motions before S1;
 * - forgetting `activationWindowDays` fails 12: four here, the two v1 files
 *   of io, and all seven states of the golden;
 * - returning the v1 object itself instead of a copy fails « leaves the v1
 *   object as it was », and only it.
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
    const v2 = fullState();
    const migrated = migrateToV2(toV1(v2))!.state;
    expect(migrated.schemaVersion).toBe(2);
    expect(migrated).toEqual(v2);
  });

  it("leaves the v1 object as it was: a parsed file or a v1 store is never rewritten in place", () => {
    const v1 = toV1(fullState());
    const before = JSON.stringify(v1);
    migrateToV2(v1);
    expect(JSON.stringify(v1)).toBe(before);
  });
});

describe("§18.3.5 — round trip, idempotence, refusals", () => {
  it("test 2 — serialize(migrate(v1)) then parse gives an equal state, without a warning", () => {
    const migrated = migrateToV2(toV1(fullState()))!.state;
    const parsed = parseEngineFile(serializeEngine(migrated));
    expect(parsed.errors).toEqual([]);
    expect(parsed.state).toEqual(migrated);
    expect(parsed.migratedFrom).toBeUndefined();
  });

  it("test 3 — migrate(v2) gives v2 back unchanged, byte for byte", () => {
    const v2 = fullState();
    const before = serializeEngine(v2);
    const again = migrateToV2(v2);
    expect(again?.from).toBe(2);
    expect(again!.state).toBe(v2);
    expect(serializeEngine(again!.state)).toBe(before);
  });

  it("test 4 — refused: an unknown v1 profile, an unknown version, what isn't an engine", () => {
    expect(migrateToV2({ ...toV1(fullState()), setup: { ...(toV1(fullState()).setup as object), profile: "sales-led" } })).toBeNull();
    expect(migrateToV2({ ...toV1(fullState()), schemaVersion: 3 })).toBeNull();
    for (const other of [null, 42, [], { schemaVersion: 1 }, { schemaVersion: 1, id: "m-1", header: {}, passes: [] }]) {
      expect(migrateToV2(other)).toBeNull();
    }
  });
});
