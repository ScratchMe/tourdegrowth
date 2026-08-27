import { describe, expect, it } from "vitest";
import { tc, type Translatable } from "../dictionary";

describe("tc", () => {
  const entry: Translatable = { en: "Hello", fr: "Bonjour" };

  it("picks the requested locale", () => {
    expect(tc(entry, "en")).toBe("Hello");
    expect(tc(entry, "fr")).toBe("Bonjour");
  });

  it("falls back to the default locale if a translation is missing", () => {
    const partial = { en: "Hello" } as Translatable;
    expect(tc(partial, "fr")).toBe("Hello");
  });
});
