import { describe, expect, it } from "vitest";
import { isGamePath, resolveGameAccess } from "../access";

// GAME-BRIEF.md 13.6 — série G, the pure half.
describe("resolveGameAccess", () => {
  it("is open for everybody only when GAME_ENABLED is exactly \"true\"", () => {
    expect(resolveGameAccess({ env: "true", ownerPreview: false })).toBe("open");
    for (const env of [undefined, "", "TRUE", "1", "yes", "true "]) {
      expect(resolveGameAccess({ env, ownerPreview: false })).toBe("closed");
    }
  });

  it("opens for the owner's verified preview, whatever the variable says", () => {
    // The verification itself (a signature, not a mere cookie) is
    // lib/owner-preview.ts; this resolver only takes its verdict.
    expect(resolveGameAccess({ env: undefined, ownerPreview: true })).toBe("open");
    expect(resolveGameAccess({ env: "no", ownerPreview: true })).toBe("open");
    expect(resolveGameAccess({ env: undefined, ownerPreview: false })).toBe("closed");
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
