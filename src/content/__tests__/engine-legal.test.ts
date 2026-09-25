import { describe, expect, it } from "vitest";
import { PRIVACY } from "../legal";
import { tc } from "@/lib/i18n/translatable";
import { LOCALES } from "@/lib/i18n/locale";

/**
 * Engine spec §11.5. The privacy policy lists what the browser keeps
 * (« Ton navigateur garde… »): the day the growth engine opens, that list is
 * false without a line for it. Checked on the section's own paragraphs, not
 * on the whole page, so a mention in the wrong place (say, the Gemini
 * section) cannot satisfy it.
 */
const ENGINE = { fr: /moteur de croissance/, en: /growth engine/ } as const;

function paragraphs(heading: RegExp, locale: "en" | "fr"): string[] {
  const section = PRIVACY.sections.find((s) => heading.test(tc(s.heading, locale)));
  expect(section, `no section matching ${heading}`).toBeDefined();
  return section!.blocks.flatMap((b) => (b.kind === "paragraph" ? [tc(b.text, locale)] : []));
}

describe("the privacy policy knows about the growth engine", () => {
  it.each(LOCALES)("says what the engine keeps on the device, and that none of it is sent (%s)", (locale) => {
    const device = paragraphs(locale === "fr" ? /^Sur ton appareil$/ : /^On your device$/, locale);
    const line = device.find((p) => ENGINE[locale].test(p));
    expect(line, "no paragraph names the engine").toBeDefined();
    expect(line).toMatch(locale === "fr" ? /n'est envoyé/ : /None of it is sent/);
    // The only ways out, named, so "nothing is sent" isn't read as "nothing ever leaves".
    expect(line).toMatch(locale === "fr" ? /télécharges.*copies/ : /download.*copy/);
  });

  it.each(LOCALES)("says what the engine counts, and that it is never a number you typed (%s)", (locale) => {
    const audience = paragraphs(locale === "fr" ? /^Mesure d'audience$/ : /^Audience measurement$/, locale);
    const line = audience.find((p) => ENGINE[locale].test(p));
    expect(line, "no audience paragraph names the engine").toBeDefined();
    expect(line).toMatch(locale === "fr" ? /jamais un chiffre/ : /never a number/);
  });

  it("was dated again when it gained those lines", () => {
    expect(PRIVACY.updatedAt >= "2026-09-24").toBe(true);
  });
});
