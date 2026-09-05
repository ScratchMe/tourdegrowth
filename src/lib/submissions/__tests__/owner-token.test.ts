import { describe, expect, it } from "vitest";
import { generateOwnerToken, hashOwnerToken, verifyOwnerToken } from "../owner-token";

/** REVIEW.md R-01 — the ownership proof behind the Deep dive gate. */
describe("owner tokens", () => {
  it("generates a distinct token every time", () => {
    const tokens = new Set(Array.from({ length: 50 }, generateOwnerToken));
    expect(tokens.size).toBe(50);
  });

  it("hashes to a stable 64-char hex digest that is not the token itself", () => {
    const token = generateOwnerToken();
    const hash = hashOwnerToken(token);

    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).not.toBe(token);
    expect(hashOwnerToken(token)).toBe(hash);
  });

  it("accepts the matching token", () => {
    const token = generateOwnerToken();
    expect(verifyOwnerToken(token, hashOwnerToken(token))).toBe(true);
  });

  it("rejects a different token", () => {
    expect(verifyOwnerToken(generateOwnerToken(), hashOwnerToken(generateOwnerToken()))).toBe(false);
  });

  it("fails closed on a submission with no stored hash (created before R-01)", () => {
    const token = generateOwnerToken();
    expect(verifyOwnerToken(token, null)).toBe(false);
    expect(verifyOwnerToken(token, undefined)).toBe(false);
    expect(verifyOwnerToken(token, "")).toBe(false);
  });

  it("rejects a missing, empty or non-string presented token", () => {
    const hash = hashOwnerToken(generateOwnerToken());
    expect(verifyOwnerToken(undefined, hash)).toBe(false);
    expect(verifyOwnerToken(null, hash)).toBe(false);
    expect(verifyOwnerToken("", hash)).toBe(false);
    expect(verifyOwnerToken(42, hash)).toBe(false);
    expect(verifyOwnerToken({}, hash)).toBe(false);
  });

  it("rejects a malformed stored hash instead of throwing", () => {
    const token = generateOwnerToken();
    expect(verifyOwnerToken(token, "not-hex")).toBe(false);
    expect(verifyOwnerToken(token, "abcd")).toBe(false);
  });
});
