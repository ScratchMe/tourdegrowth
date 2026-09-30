import { describe, expect, it } from "vitest";
import { formatLongDate } from "../format-date";

/**
 * The date line of the prose pages (GEO audit, A8.2) and of the legal pages.
 * The value is a calendar day: it must print as that day in both languages,
 * whatever the time zone of the machine that builds the page.
 */
describe("formatLongDate", () => {
  it("prints the day in the reader's language", () => {
    expect(formatLongDate("2026-09-30", "fr")).toBe("30 septembre 2026");
    expect(formatLongDate("2026-09-30", "en")).toBe("September 30, 2026");
  });

  it("never slides to the day before, even on the first of a year", () => {
    expect(formatLongDate("2026-01-01", "fr")).toBe("1 janvier 2026");
    expect(formatLongDate("2026-01-01", "en")).toBe("January 1, 2026");
  });
});
