import { describe, expect, it } from "vitest";
import {
  caretAfterSignificant,
  displayNumber,
  groupTypedNumber,
  isUnreadableNumber,
  parseTypedNumber,
  regroupTypedNumber,
  significantBefore,
} from "../number";

/**
 * Counts are typed the way the reader writes them (spec D6). A number box
 * that silently drops "26 000" would store nothing and say nothing — the
 * reason the engine reads text itself instead of trusting `type="number"`.
 */
describe("parseTypedNumber", () => {
  it("reads French grouping with every space a French keyboard or Intl produces", () => {
    expect(parseTypedNumber("26 000", "fr")).toBe(26000);
    // Escaped rather than typed: an editor that normalises spaces would turn these two into the first.
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
    expect(parseTypedNumber("12 kg", "fr")).toBeNull();
    expect(parseTypedNumber("1.2.3", "en")).toBeNull();
  });

  it("keeps zero as a value, distinct from an empty box", () => {
    expect(parseTypedNumber("0", "fr")).toBe(0);
  });
});

/**
 * Grouping as the person types (Antoine, 2026-09-26: "2000000" stayed a row of
 * zeros). What the text becomes and where the caret goes are pure, so they are
 * tested here keystroke by keystroke; e2e/engine-steps.spec.ts checks that the
 * browser really shows it and really puts the caret there.
 */
describe("groupTypedNumber", () => {
  it("groups thousands the way each language writes them: NBSP in French, a comma in English", () => {
    expect(groupTypedNumber("2000000", "fr")).toBe("2 000 000");
    expect(groupTypedNumber("2000000", "en")).toBe("2,000,000");
    expect(groupTypedNumber("1234", "fr")).toBe("1 234");
    expect(groupTypedNumber("999", "en")).toBe("999");
  });

  it("matches what the field shows for a stored value, so a number reads the same typed or reloaded", () => {
    const shown = (n: number, locale: "fr" | "en") =>
      new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", { maximumFractionDigits: 6 }).format(n).replace(/ /g, " ");
    for (const n of [1234, 26000, 2000000, 1234.5, 0.25]) {
      for (const locale of ["fr", "en"] as const) {
        const typed = locale === "fr" ? String(n).replace(".", ",") : String(n);
        expect(groupTypedNumber(typed, locale), `${n} in ${locale}`).toBe(shown(n, locale));
      }
    }
  });

  it("regroups text already grouped — by hand or wrongly — and never changes a digit", () => {
    expect(groupTypedNumber("20 00000", "fr")).toBe("2 000 000");
    expect(groupTypedNumber("26’000", "fr")).toBe("26 000");
    expect(groupTypedNumber("2,00,0000", "en")).toBe("2,000,000");
    expect(groupTypedNumber("-12345", "en")).toBe("-12,345");
  });

  it("never swallows a decimal separator being typed, and writes the language's own", () => {
    expect(groupTypedNumber("1234,", "fr")).toBe("1 234,");
    expect(groupTypedNumber("1234.", "fr")).toBe("1 234,");
    expect(groupTypedNumber("1234.", "en")).toBe("1,234.");
    expect(groupTypedNumber("1234,56789", "fr")).toBe("1 234,56789");
    expect(groupTypedNumber(",5", "fr")).toBe(",5");
  });

  it("leaves text it cannot read untouched, so the error is about what was typed", () => {
    for (const raw of ["12 kg", "douze", "1.2.3", "-", ",", "1.234,5", ""]) expect(groupTypedNumber(raw, "fr"), raw).toBe(raw);
    for (const raw of ["12kg", "1.2.3", "."]) expect(groupTypedNumber(raw, "en"), raw).toBe(raw);
  });
});

describe("regroupTypedNumber — the caret stays where the person is typing", () => {
  it("typing at the end keeps the caret at the end", () => {
    expect(regroupTypedNumber("2000", 4, "fr")).toEqual({ text: "2 000", caret: 5 });
    expect(regroupTypedNumber("2,0000", 6, "en")).toEqual({ text: "20,000", caret: 6 });
  });

  it("typing in the middle keeps the caret right after the digit just typed", () => {
    // "1 234" with the caret between 2 and 3, then "9": the text becomes "12 934", caret after the 9.
    expect(regroupTypedNumber("1 2934", 4, "fr")).toEqual({ text: "12 934", caret: 4 });
    // Then "8" at that caret: "129 834", caret after the 8 — not at the end, where it would have typed "129 348".
    expect(regroupTypedNumber("12 9834", 5, "fr")).toEqual({ text: "129 834", caret: 5 });
  });

  it("a Backspace that only removed a separator puts it back and leaves the caret before it", () => {
    // "1 |234" and Backspace: the space is gone, it comes back, the caret sits after the 1 — the next Backspace removes a digit.
    expect(regroupTypedNumber("1234", 1, "fr")).toEqual({ text: "1 234", caret: 1 });
  });

  it("a forward Delete that only removed a separator steps past it, so the next Delete removes a digit", () => {
    expect(regroupTypedNumber("1234", 1, "fr", "forward")).toEqual({ text: "1 234", caret: 2 });
  });

  it("a trailing decimal separator keeps the caret after it", () => {
    expect(regroupTypedNumber("1234,", 5, "fr")).toEqual({ text: "1 234,", caret: 6 });
  });

  it("unreadable or unchanged text keeps the caret where the browser left it", () => {
    expect(regroupTypedNumber("12 kg", 2, "fr")).toEqual({ text: "12 kg", caret: 2 });
    expect(regroupTypedNumber("123", 1, "en")).toEqual({ text: "123", caret: 1 });
    expect(regroupTypedNumber("12345", null, "en")).toEqual({ text: "12,345", caret: null });
  });

  it("the caret helpers count only what carries the number", () => {
    expect(significantBefore("-1 234,5", 7, "fr")).toBe(6);
    expect(caretAfterSignificant("-1 234,5", 2, "fr")).toBe(2);
    expect(caretAfterSignificant("-1 234,5", 2, "fr", true)).toBe(3);
    expect(caretAfterSignificant("12", 9, "en")).toBe(2);
  });
});

describe("displayNumber (a stored value as the box shows it on load)", () => {
  it("groups the way the reader writes, with U+00A0 in French — not Intl's U+202F", () => {
    expect(displayNumber(26000, "fr")).toBe("26 000");
    expect(displayNumber(26000, "fr")).not.toContain(" ");
    expect(displayNumber(26000, "en")).toBe("26,000");
    expect(displayNumber(1.5, "fr")).toBe("1,5");
  });

  it("shows an empty box for null, never 0", () => {
    expect(displayNumber(null, "fr")).toBe("");
    expect(displayNumber(0, "en")).toBe("0");
  });

  it("reads back to the same number it shows", () => {
    for (const n of [0, 7, 26000, 2000000, 12.25]) {
      expect(parseTypedNumber(displayNumber(n, "fr"), "fr")).toBe(n);
      expect(parseTypedNumber(displayNumber(n, "en"), "en")).toBe(n);
    }
  });
});

/**
 * A15.2: a field that writes on blur must tell an empty box (remove the
 * value) from an unreadable one (keep it). Both reach it as `null`.
 */
describe("isUnreadableNumber", () => {
  it("is false for an empty box, blanks included: empty means remove", () => {
    expect(isUnreadableNumber("", "fr")).toBe(false);
    expect(isUnreadableNumber("   ", "en")).toBe(false);
  });

  it("is false for a number the reader wrote their way", () => {
    expect(isUnreadableNumber("1 250,5", "fr")).toBe(false);
    expect(isUnreadableNumber("1,250.5", "en")).toBe(false);
    expect(isUnreadableNumber("25", "en")).toBe(false);
  });

  it("is true for text that reads as no number", () => {
    expect(isUnreadableNumber("abc", "fr")).toBe(true);
    expect(isUnreadableNumber("25 kg", "en")).toBe(true);
  });

  it("is true for a decimal where a whole number is required, and only then", () => {
    expect(isUnreadableNumber("12,5", "fr", true)).toBe(true);
    expect(isUnreadableNumber("12,5", "fr")).toBe(false);
  });
});

/**
 * A15.10 (2026-10-01), Postel: the unit a box already shows is accepted along
 * with the number — a spreadsheet's « 18 % », a billing tool's « 1 200 € » —
 * and dropped from the box, which shows its own.
 */
describe("the unit a box shows, typed or pasted with the number", () => {
  it("reads a percent or a currency sign, before or after, in both languages", () => {
    expect(parseTypedNumber("18 %", "fr")).toBe(18);
    expect(parseTypedNumber("18%", "en")).toBe(18);
    expect(parseTypedNumber("12,5 %", "fr")).toBe(12.5);
    expect(parseTypedNumber("1 200 €", "fr")).toBe(1200);
    expect(parseTypedNumber("€1,200", "en")).toBe(1200);
    expect(parseTypedNumber("$1,200.50", "en")).toBe(1200.5);
    expect(parseTypedNumber("£300", "en")).toBe(300);
  });

  it("drops the sign from the box, keeping the grouping and the caret on the digits", () => {
    expect(groupTypedNumber("1200 €", "fr")).toBe("1\u00a0200");
    expect(groupTypedNumber("18%", "en")).toBe("18");
    expect(regroupTypedNumber("1200€", 5, "fr")).toEqual({ text: "1\u00a0200", caret: 5 });
  });

  it("still refuses what no sign explains", () => {
    expect(parseTypedNumber("12 kg", "fr")).toBeNull();
    expect(parseTypedNumber("%", "fr")).toBeNull();
    expect(isUnreadableNumber("€", "en")).toBe(true);
  });
});

