import { describe, expect, it } from "vitest";
import { isGamePath, previewRequest, resolveGameAccess } from "../access";

// GAME-BRIEF.md 13.6 — série G, the pure half.
describe("resolveGameAccess", () => {
  it("is open only when GAME_ENABLED is exactly \"true\"", () => {
    expect(resolveGameAccess({ env: "true", cookie: null })).toBe("open");
    for (const env of [undefined, "", "TRUE", "1", "yes", "true "]) {
      expect(resolveGameAccess({ env, cookie: null })).toBe("closed");
    }
  });

  it("opens for a browser holding the preview cookie, and only its exact value", () => {
    expect(resolveGameAccess({ env: undefined, cookie: "1" })).toBe("open");
    expect(resolveGameAccess({ env: undefined, cookie: "0" })).toBe("closed");
    expect(resolveGameAccess({ env: undefined, cookie: "" })).toBe("closed");
  });
});

describe("previewRequest", () => {
  it("reads only the two exact values", () => {
    expect(previewRequest("preview")).toBe("preview");
    expect(previewRequest("off")).toBe("off");
    for (const v of [null, "", "on", "Preview", "true"]) expect(previewRequest(v)).toBeNull();
  });
});

describe("isGamePath", () => {
  it("matches the hub and its levels, nothing that merely starts with 'game'", () => {
    expect(isGamePath("/game")).toBe(true);
    expect(isGamePath("/game/retention")).toBe(true);
    expect(isGamePath("/gamers")).toBe(false);
    expect(isGamePath("/glossary/game")).toBe(false);
    expect(isGamePath("/")).toBe(false);
  });
});
