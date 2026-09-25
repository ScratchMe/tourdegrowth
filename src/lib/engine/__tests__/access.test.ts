import { afterEach, describe, expect, it } from "vitest";
import { isEngineOpenAtBuild, isEnginePath, resolveEngineAccess } from "../access";

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
    expect(isEnginePath("/aarrr-funnel-template/x")).toBe(false);
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
