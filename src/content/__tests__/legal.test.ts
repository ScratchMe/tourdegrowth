import { describe, expect, it } from "vitest";
import {
  CONTACT_EMAIL,
  EMAIL_PLACEHOLDER,
  FIRESTORE_REGION,
  GEMINI_TIER,
  PRIVACY,
  splitOnEmail,
  TERMS,
  type LegalDocument,
} from "../legal";
import { LOCALES } from "@/lib/i18n/locale";
import { tc } from "@/lib/i18n/translatable";

/**
 * REVIEW-02.md R2-03. Two of these tests are about the copy's shape; the
 * first one is a GUARD: it stays red until Antoine provides the address, and
 * while it is red this PR stays a draft. A privacy policy that tells people
 * to write to an address that does not exist is worse than none (GDPR
 * art. 12 gives a month to answer; the person would believe they wrote).
 */
describe("the contact address (the guard that keeps R2-03 a draft)", () => {
  it("CONTACT_EMAIL is set to an address that can receive mail", () => {
    expect(CONTACT_EMAIL).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });
});

function everyText(document: LegalDocument, locale: "en" | "fr"): string[] {
  const out = [tc(document.title, locale), tc(document.metaDescription, locale), tc(document.intro, locale)];
  for (const section of document.sections) {
    out.push(tc(section.heading, locale));
    for (const block of section.blocks) {
      if (block.kind === "paragraph") out.push(tc(block.text, locale));
      else if (block.kind === "bullets") out.push(...block.items.map((i) => tc(i, locale)));
      else out.push(...block.items.flatMap((i) => [tc(i.term, locale), tc(i.text, locale)]));
    }
  }
  return out;
}

describe.each([
  ["privacy", PRIVACY],
  ["terms", TERMS],
] as const)("the %s document", (_name, document) => {
  it("is dated with an ISO day, which the page prints and the sitemap reuses", () => {
    expect(document.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it.each(LOCALES)("has a title, an intro and non-empty sections in %s", (locale) => {
    expect(tc(document.title, locale).length).toBeGreaterThan(3);
    expect(tc(document.intro, locale).length).toBeGreaterThan(20);
    expect(document.sections.length).toBeGreaterThanOrEqual(8);
    for (const text of everyText(document, locale)) {
      expect(text.trim(), text).not.toBe("");
      expect(text, text).not.toMatch(/TODO/);
    }
  });

  it("names the contact address through the placeholder, never typed into the prose", () => {
    const texts = [...everyText(document, "en"), ...everyText(document, "fr")];
    expect(texts.some((t) => t.includes(EMAIL_PLACEHOLDER))).toBe(true);
    // A half-typed token ("{ email }", "{mail}") would render literally.
    for (const t of texts) expect(t, t).not.toMatch(/\{(?!email\})[^}]*\}/);
    // And no raw address anywhere but the constant.
    for (const t of texts) expect(t, t).not.toMatch(/[^\s@]+@[^\s@]+\.[a-z]{2,}/i);
  });

  it("says the same number of things in both languages", () => {
    expect(everyText(document, "en")).toHaveLength(everyText(document, "fr").length);
  });
});

describe("the two facts about where the data goes (2026-09-07)", () => {
  const privacyText = [...everyText(PRIVACY, "fr"), ...everyText(PRIVACY, "en")].join(" ");

  it("says the data is in the EU, because Firestore is on eur3", () => {
    expect(FIRESTORE_REGION).toBe("eu");
    expect(privacyText).toMatch(/Union européenne/);
    expect(privacyText).toMatch(/European Union/);
  });

  /**
   * The whole point of the constant: the free tier's terms differ from the
   * paid tier's on the one thing a founder typing about their business would
   * care about. Whichever tier is set, the notice has to say so — a constant
   * flipped without the sentence following it is the failure this catches.
   */
  it("states the tier's actual data-use terms, whichever tier is set", () => {
    if (GEMINI_TIER === "free") {
      expect(privacyText).toMatch(/palier gratuit/);
      expect(privacyText).toMatch(/améliorer ses produits/);
      expect(privacyText).toMatch(/free tier/);
      expect(privacyText).toMatch(/improve its products/);
    } else if (GEMINI_TIER === "paid") {
      expect(privacyText).toMatch(/palier payant/);
      expect(privacyText).toMatch(/n['’]utilise pas pour améliorer/);
      expect(privacyText).toMatch(/paid tier/);
      expect(privacyText).toMatch(/does not use it to improve/);
    }
  });
});

describe("splitOnEmail", () => {
  it("isolates the token so the page can turn it into a link", () => {
    expect(splitOnEmail("write to {email}.")).toEqual(["write to ", "{email}", "."]);
    expect(splitOnEmail("{email}")).toEqual(["{email}"]);
    expect(splitOnEmail("no token here")).toEqual(["no token here"]);
    expect(splitOnEmail("a {email} b {email}")).toEqual(["a ", "{email}", " b ", "{email}"]);
  });
});
