import { afterEach, describe, expect, it } from "vitest";
import { isEngineOpenAtBuild, isEnginePath, previewRequest, resolveEngineAccess } from "../access";

// Engine spec §13.1 "access" — the pure half of the flag. The proxy half is
// in src/__tests__/proxy.test.ts.
describe("resolveEngineAccess", () => {
  it("is open only when ENGINE_ENABLED is exactly \"true\"", () => {
    expect(resolveEngineAccess({ env: "true", cookie: null })).toBe("open");
    for (const env of [undefined, "", "TRUE", "1", "yes", "true "]) {
      expect(resolveEngineAccess({ env, cookie: null })).toBe("closed");
    }
  });

  it("opens for a browser holding the preview cookie, and only its exact value", () => {
    expect(resolveEngineAccess({ env: undefined, cookie: "1" })).toBe("open");
    for (const cookie of ["0", "", "true", undefined, null]) {
      expect(resolveEngineAccess({ env: undefined, cookie })).toBe("closed");
    }
  });
});

describe("previewRequest", () => {
  it("reads only the two exact values", () => {
    expect(previewRequest("preview")).toBe("preview");
    expect(previewRequest("off")).toBe("off");
    for (const v of [null, "", "on", "Preview", "true", "OFF"]) expect(previewRequest(v)).toBeNull();
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
