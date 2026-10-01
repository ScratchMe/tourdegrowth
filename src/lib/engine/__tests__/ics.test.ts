import { describe, expect, it } from "vitest";
import { calendarFile, nextMonthStart, requestReminderDay } from "../ics";
import { exampleState, withMonthBefore } from "./fixtures";

/**
 * The two reminders as calendar files (engine spec §19.9, C32 Q15, A14 T6):
 * RFC 5545 to the character, never a value nor the company's name.
 */

const EVENT = {
  uid: "4f1c2a1e-0000-4000-8000-000000000001@tourdegrowth.com",
  stamp: new Date(Date.UTC(2026, 9, 1, 14, 3, 7)),
  day: { year: 2026, month: 10, date: 6 },
  title: "Relancer Finance : 2 chiffres du moteur",
  description: "Marge brute\nARPA mensuel",
  url: "https://www.tourdegrowth.com/fr/aarrr-funnel-template",
};

describe("calendarFile", () => {
  it("one VCALENDAR, one VEVENT, at 9:00 local for 30 minutes, to the character", () => {
    expect(calendarFile(EVENT)).toBe(
      [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Tour de Growth//Moteur de growth//FR",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VEVENT",
        "UID:4f1c2a1e-0000-4000-8000-000000000001@tourdegrowth.com",
        "DTSTAMP:20261001T140307Z",
        "DTSTART:20261006T090000",
        "DTEND:20261006T093000",
        "SUMMARY:Relancer Finance : 2 chiffres du moteur",
        "DESCRIPTION:Marge brute\\nARPA mensuel",
        "URL:https://www.tourdegrowth.com/fr/aarrr-funnel-template",
        "END:VEVENT",
        "END:VCALENDAR",
        "",
      ].join("\r\n"),
    );
  });

  it("escapes a backslash, a semicolon, a comma and a line break in text", () => {
    const file = calendarFile({ ...EVENT, title: "a;b,c\\d", description: "x\r\ny" });
    expect(file).toContain("SUMMARY:a\\;b\\,c\\\\d\r\n");
    expect(file).toContain("DESCRIPTION:x\\ny\r\n");
  });

  /** The security review of A14 T6: a lone CR, or another control character, must never open a property of its own. */
  it("no text can start a property: a lone return is escaped, other control characters dropped; a bad URL is left out", () => {
    const file = calendarFile({ ...EVENT, title: "a\rATTENDEE:x", description: "b\u0000\u001bc", url: "https://x.example/\r\nATTENDEE:y" });
    expect(file).toContain("SUMMARY:a\\nATTENDEE:x\r\n");
    expect(file).toContain("DESCRIPTION:bc\r\n");
    expect(file).not.toContain("URL:");
    expect(file.split("\r\n").filter((l) => l.startsWith("ATTENDEE"))).toEqual([]);
  });

  it("folds a line past 75 octets on characters, never inside one, each continuation after a space", () => {
    const description = "é".repeat(60);
    const file = calendarFile({ ...EVENT, description });
    const lines = file.split("\r\n");
    const start = lines.findIndex((l) => l.startsWith("DESCRIPTION:"));
    const folded = [lines[start]!, ...lines.slice(start + 1).filter((l, i, all) => all.slice(0, i + 1).every((x) => x.startsWith(" ")))];
    for (const line of folded) expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    expect(folded.length).toBeGreaterThan(1);
    // Unfolded (RFC 5545 §3.1: remove each CRLF and the space after it), the text is whole.
    expect(file.replace(/\r\n /g, "")).toContain(`DESCRIPTION:${description}\r\n`);
  });
});

describe("time zones", () => {
  /*
   * The suite runs in UTC, where local and UTC hours agree: a DTSTAMP written
   * in local time would pass. Measured on 2026-10-01 (A14 T6), it did — hence
   * a zone fourteen hours ahead, where the two part ways.
   */
  it("DTSTAMP is UTC whatever the zone, and the reminder's day is the person's own calendar day", () => {
    const zone = process.env.TZ;
    process.env.TZ = "Pacific/Kiritimati";
    try {
      expect(calendarFile(EVENT)).toContain("DTSTAMP:20261001T140307Z\r\n");
      // 12:00 UTC on 1 October is 2:00 on 2 October in Kiritimati: five days from THAT day.
      expect(requestReminderDay(new Date(Date.UTC(2026, 9, 1, 12)))).toEqual({ year: 2026, month: 10, date: 7 });
    } finally {
      if (zone === undefined) delete process.env.TZ;
      else process.env.TZ = zone;
    }
  });
});

describe("the two days", () => {
  it("a request is reminded five days after it was asked — the day the board says « à relancer »", () => {
    expect(requestReminderDay(new Date(2026, 9, 1, 18, 0))).toEqual({ year: 2026, month: 10, date: 6 });
    // Across a month's end.
    expect(requestReminderDay(new Date(2026, 8, 28, 8, 0))).toEqual({ year: 2026, month: 10, date: 3 });
  });

  it("the next month starts on the first working day after its flows: August's engine starts September in October", () => {
    // 1 October 2026 is a Thursday.
    expect(nextMonthStart(exampleState())).toEqual({ month: "2026-09", day: { year: 2026, month: 10, date: 1 } });
    // A month whose first day is a Saturday: 1 August 2026 → Monday 3 August, for July's flows.
    const june = withMonthBefore(exampleState());
    june.snapshots = [june.snapshots[0]!];
    june.snapshots[0]!.referenceMonth = "2026-06";
    expect(nextMonthStart(june)).toEqual({ month: "2026-07", day: { year: 2026, month: 8, date: 3 } });
  });
});
