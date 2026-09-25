import { describe, expect, it } from "vitest";
import type { DeckSlide } from "@/lib/engine/types";
import { lineOf, linesOf } from "../deck-lines";
import { fill } from "../slide-text";

const slide = (lines: Record<string, string>[]): DeckSlide => ({
  id: "leak",
  present: true,
  included: true,
  index: 2,
  title: { key: "leakClearMrrNew", values: {} },
  lines,
  notes: [],
});

describe("deck lines — the contract between buildDeck and the slides", () => {
  it("returns the records of one kind in the order the model wrote them", () => {
    const s = slide([
      { kind: "calc", step: "today", text: "a" },
      { kind: "annual", text: "b" },
      { kind: "calc", step: "if", text: "c" },
    ]);
    expect(linesOf(s, "calc").map((l) => l.text)).toEqual(["a", "c"]);
    expect(lineOf(s, "annual")?.text).toBe("b");
    expect(lineOf(s, "blind")).toBeUndefined();
  });

  it("ignores a record whose kind it doesn't know, rather than drawing it from the wrong fields", () => {
    const s = slide([{ kind: "calcul", step: "today", text: "renamed kind" }, { text: "no kind at all" }]);
    expect(linesOf(s, "calc")).toEqual([]);
  });
});

describe("fill — placing finished strings, never formatting them", () => {
  it("substitutes every known placeholder, as many times as it appears", () => {
    expect(fill("{a} × {b} = {a}{b}", { a: "42", b: 7 })).toBe("42 × 7 = 427");
  });

  it("leaves an unknown placeholder visible: a raw brace reads as the bug it is, a blank would read as a sentence", () => {
    expect(fill("Sur 100 inscrits, {clauses}.", {})).toBe("Sur 100 inscrits, {clauses}.");
  });

  it("does not treat inherited object keys as values", () => {
    expect(fill("{toString}", {})).toBe("{toString}");
  });
});
