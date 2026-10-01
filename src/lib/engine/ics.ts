import { REMIND_AFTER_DAYS } from "./catalog-shape";
import { nextMonth } from "./cohort";
import type { EngineState, YearMonth } from "./types";

/**
 * ics.ts — the engine's two reminders, as calendar files (engine spec §19.9,
 * C32 Q15, A14 T6): « Relancer une demande » and « Démarrer le mois
 * suivant ». Written here, downloaded by the island, opened by the person's
 * own calendar — nothing is sent, nothing is scheduled by the site.
 *
 * Never a value in the file, nor the company's name: a calendar is shared,
 * synced and read on a lock screen. The request's reminder names the role
 * and the numbers asked for — the catalogue's names, never what was typed.
 *
 * RFC 5545: one VCALENDAR, one VEVENT, a random UID, DTSTAMP in UTC, the
 * event at 9:00 in the person's own time (a floating time: the calendar
 * reads it in its zone, which is the point of « 9 h »), lines ended by CRLF
 * and folded at 75 octets, text escaped. Pure, tested to the character.
 */

export interface CalendarEvent {
  uid: string;
  /** When the file is written: DTSTAMP, in UTC. */
  stamp: Date;
  /** The day of the event, local: it starts at 9:00 and lasts 30 minutes. */
  day: { year: number; month: number; date: number };
  title: string;
  description: string;
  /** The engine's page, without query or fragment: where the reminder sends the person back. */
  url: string;
}

const PRODID = "-//Tour de Growth//Moteur de growth//FR";

/** The calendar file of one event, CRLF line endings, folded and escaped. */
export function calendarFile(event: CalendarEvent): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${PRODID}`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${escapeText(event.uid)}`,
    `DTSTAMP:${utcStamp(event.stamp)}`,
    `DTSTART:${floating(event.day, 9, 0)}`,
    `DTEND:${floating(event.day, 9, 30)}`,
    `SUMMARY:${escapeText(event.title)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    ...(safeUrl(event.url) ? [`URL:${event.url}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.map(fold).join("\r\n")}\r\n`;
}

/** The request's reminder: the day it was asked, plus `REMIND_AFTER_DAYS` — the day the board starts saying « à relancer ». */
export function requestReminderDay(requestedAt: Date): CalendarEvent["day"] {
  const d = new Date(requestedAt.getFullYear(), requestedAt.getMonth(), requestedAt.getDate() + REMIND_AFTER_DAYS);
  return { year: d.getFullYear(), month: d.getMonth() + 1, date: d.getDate() };
}

/**
 * The month that comes next, and the day it can start (§19.2.1, §19.9): its
 * flows are over on its last day, so it starts on the first working day of
 * the month after it — Monday to Friday; a bank holiday is the calendar's
 * to know, not ours.
 */
export function nextMonthStart(state: EngineState): { month: YearMonth; day: CalendarEvent["day"] } {
  const last = state.snapshots[state.snapshots.length - 1]!;
  const month = nextMonth(last.referenceMonth);
  const [y, m] = nextMonth(month).split("-").map(Number) as [number, number];
  let date = 1;
  while ([0, 6].includes(new Date(y, m - 1, date).getDay())) date += 1;
  return { month, day: { year: y, month: m, date } };
}

/**
 * RFC 5545 §3.3.11: a backslash, a semicolon, a comma and a line break are
 * escaped in TEXT — a lone carriage return too — and any other control
 * character is dropped: no text can start a property of its own. Every text
 * here is the copy's or the catalogue's today; the escaping holds for
 * whatever a later caller passes (the security review of A14 T6).
 */
function escapeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "");
}

/** A URL goes in as it is, so it may hold no space and no control character: anything else leaves the property out. */
function safeUrl(url: string): string | null {
  return /^https?:\/\/[^\s\u0000-\u001f\u007f]+$/.test(url) ? url : null;
}

/**
 * RFC 5545 §3.1: a line is at most 75 octets; the rest continues on the next
 * line after a single space. Folded on characters, never inside one: a « é »
 * is two octets and must not be cut in half.
 */
function fold(line: string): string {
  const encoder = new TextEncoder();
  const out: string[] = [];
  let current = "";
  let size = 0;
  for (const char of line) {
    const n = encoder.encode(char).length;
    const limit = out.length === 0 ? 75 : 74;
    if (size + n > limit) {
      out.push(current);
      current = "";
      size = 0;
    }
    current += char;
    size += n;
  }
  out.push(current);
  return out.join("\r\n ");
}

const pad = (n: number) => String(n).padStart(2, "0");

function utcStamp(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
}

function floating(day: CalendarEvent["day"], hours: number, minutes: number): string {
  return `${day.year}${pad(day.month)}${pad(day.date)}T${pad(hours)}${pad(minutes)}00`;
}
