import { describe, expect, it } from "vitest";
import { parseTypedNumber } from "../_ui/number";

/**
 * Counts are typed the way the reader writes them (spec D6). A number box
 * that silently drops "26 000" would store nothing and say nothing — the
 * reason the engine reads text itself instead of trusting `type="number"`.
 */
describe("parseTypedNumber", () => {
  it("reads French grouping with every space a French keyboard or Intl produces", () => {
    expect(parseTypedNumber("26 000", "fr")).toBe(26000);
    expect(parseTypedNumber("26 000", "fr")).toBe(26000);
    expect(parseTypedNumber("26 000", "fr")).toBe(26000);
    expect(parseTypedNumber("26’000", "fr")).toBe(26000);
  });

  it("reads the decimal comma in French and the decimal point in English", () => {
    expect(parseTypedNumber("1,5", "fr")).toBe(1.5);
    expect(parseTypedNumber("1.5", "en")).toBe(1.5);
  });

  it("treats a comma as a group separator in English — and says so in a test, because it is a choice", () => {
    expect(parseTypedNumber("26,000", "en")).toBe(26000);
    expect(parseTypedNumber("12,5", "en")).toBe(125);
  });

  it("returns null for an empty box and for anything that is not a number once the separators are gone", () => {
    expect(parseTypedNumber("", "fr")).toBeNull();
    expect(parseTypedNumber("   ", "en")).toBeNull();
    expect(parseTypedNumber("douze", "fr")).toBeNull();
    expect(parseTypedNumber("12 %", "fr")).toBeNull();
    expect(parseTypedNumber("1.2.3", "en")).toBeNull();
  });

  it("keeps zero as a value, distinct from an empty box", () => {
    expect(parseTypedNumber("0", "fr")).toBe(0);
  });
});
