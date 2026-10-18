import { afterEach, describe, expect, it, vi } from "vitest";
import { isEngineOpenAtBuild, isEnginePath, openTypesWith, resolveEngineAccess } from "../access";

// Engine spec §13.1 "access" — the pure half of the flag. The proxy half is
// in src/__tests__/proxy.test.ts.
describe("resolveEngineAccess", () => {
  it("is open for everybody only when ENGINE_ENABLED is exactly \"true\"", () => {
    expect(resolveEngineAccess({ env: "true", ownerPreview: false })).toBe("open");
    for (const env of [undefined, "", "TRUE", "1", "yes", "true "]) {
      expect(resolveEngineAccess({ env, ownerPreview: false })).toBe("closed");
    }
  });

  it("opens for the owner's verified preview, whatever the variable says", () => {
    // The verification itself (a signature, not a mere cookie) is
    // lib/owner-preview.ts; this resolver only takes its verdict.
    expect(resolveEngineAccess({ env: undefined, ownerPreview: true })).toBe("open");
    expect(resolveEngineAccess({ env: "no", ownerPreview: true })).toBe("open");
    expect(resolveEngineAccess({ env: undefined, ownerPreview: false })).toBe("closed");
  });
});

describe("isEnginePath", () => {
  it("matches the engine's page and nothing that merely starts like it", () => {
    expect(isEnginePath("/aarrr-funnel-template")).toBe(true);
    // Everything under the page is the engine's — its share image first.
    expect(isEnginePath("/aarrr-funnel-template/opengraph-image/fr")).toBe(true);
    expect(isEnginePath("/aarrr-funnel-template/x")).toBe(true);
    // The files the build writes beside the page: its RSC payload (2026-10-05).
    expect(isEnginePath("/aarrr-funnel-template.segments/_full.segment.rsc")).toBe(true);
    expect(isEnginePath("/aarrr-funnel-templates")).toBe(false);
    expect(isEnginePath("/aarrr-vs-okr")).toBe(false);
    expect(isEnginePath("/")).toBe(false);
  });
});

describe("isEngineOpenAtBuild", () => {
  const ORIGINAL = process.env.ENGINE_ENABLED;
  afterEach(() => {
    if (ORIGINAL === undefined) delete process.env.ENGINE_ENABLED;
    else process.env.ENGINE_ENABLED = ORIGINAL;
  });

  it("follows the env var, never a cookie", () => {
    delete process.env.ENGINE_ENABLED;
    expect(isEngineOpenAtBuild()).toBe(false);
    process.env.ENGINE_ENABLED = "yes";
    expect(isEngineOpenAtBuild()).toBe(false);
    process.env.ENGINE_ENABLED = "true";
    expect(isEngineOpenAtBuild()).toBe(true);
  });
});

// The marketplace's barrier (engine spec §22.3, A23 MKT-0): `ENGINE_TYPES` listing the type is not enough while its
// screens do not exist. The constant is `false` in the code, so the other half — what the flag does once MKT-7b lifts
// it — is measured on a copy of the module graph where `setup-type.ts` says `true`. Non-vacuity, measured on
// 2026-10-18 (each sabotage applied alone, the whole of `src/lib/engine` run, the file restored): `openTypesWith`
// without the barrier falls the first test here (1) and two of `business-type.test.ts`'s; the constant at `true` falls
// the same three and `io.test.ts`'s. The second test passes in both of those states, as it must: it falls on the
// other sabotage, a marketplace left out for good (`type !== "marketplace"` without the constant), alone (1) — the
// proof that the barrier is the only thing keeping the type out.
describe("openTypesWith — the barrier of the marketplace's screens", () => {
  afterEach(() => {
    vi.doUnmock("../setup-type");
    vi.resetModules();
  });

  it("keeps the marketplace out while the barrier is down, whatever the variable lists", () => {
    expect(openTypesWith("consumer-app,marketplace")).toEqual(["b2b-saas", "consumer-app"]);
    expect(openTypesWith("marketplace")).toEqual(["b2b-saas"]);
  });

  it("lists it, in the order of the types, once the barrier is lifted — and only when the variable names it", async () => {
    vi.resetModules();
    vi.doMock("../setup-type", async (importOriginal) => ({ ...(await importOriginal<typeof import("../setup-type")>()), MARKETPLACE_SCREENS_READY: true }));
    const lifted = await import("../access");
    expect(lifted.openTypesWith("consumer-app,marketplace")).toEqual(["b2b-saas", "consumer-app", "marketplace"]);
    expect(lifted.openTypesWith("marketplace,consumer-app")).toEqual(["b2b-saas", "consumer-app", "marketplace"]);
    expect(lifted.openTypesWith("marketplace")).toEqual(["b2b-saas", "marketplace"]);
    expect(lifted.openTypesWith("consumer-app")).toEqual(["b2b-saas", "consumer-app"]);
    expect(lifted.openTypesWith(undefined)).toEqual(["b2b-saas"]);
  });
});
