import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ACTIVATION_SIDE, cookieSentence } from "@/app/[locale]/game/_island/sides";
import { CookiePill } from "@/components/game/CookiePill";
import { changedKeys } from "@/components/game/phone-flash";
import { PlannerPhone, plannerItemKey } from "@/components/game/PlannerPhone";
import { ACTIVATION_CONTENT } from "@/content/game/activation";
import { resolveLevelCopy, type ActivationCopy } from "@/lib/game/copy";
import { ACTIVATION_DARK_IDS, ACTIVATION_HONEST_IDS, type ActivationCardId } from "@/lib/game/levels/activation";
import { cookieRefusal, plannerPhoneView, REFUSE_CLICKS_EASY, REFUSE_CLICKS_HIDDEN } from "@/lib/game/planner-phone";
import { LOCALES, type Locale } from "@/lib/i18n/locale";

/**
 * The activation level's phone — Quandi's app, from the cookie banner to the
 * first screen (GAME-BRIEF §18.7, CHANTIERS.md A24, ACT-2): what it shows for
 * each card, what a tick flashes, and the cookie pill, the level's « N clics
 * pour résilier ». Every row of the pill's table in §18.7 is a case below, and
 * C13's other half — the clicks the pill says, against the constants of the
 * phone — lives here because those constants only exist from this unit on.
 */

const ALL = [...ACTIVATION_HONEST_IDS, ...ACTIVATION_DARK_IDS] as ActivationCardId[];
const kinds = (ids: readonly string[]) => plannerPhoneView(ids).map((item) => item.kind);
const copyOf = (locale: Locale) => resolveLevelCopy<ActivationCopy>(ACTIVATION_CONTENT, locale);

/** `&amp;` is decoded last, so an escaped « &amp;quot; » stays « &quot; » rather than being unescaped twice (CodeQL js/double-escaping). */
const decode = (html: string) => html.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");

/** The text a static render shows, tags stripped until nothing changes. */
function text(html: string): string {
  let out = html;
  for (let prev = ""; prev !== out; ) {
    prev = out;
    out = out.replace(/<[^>]*>/g, "");
  }
  return decode(out);
}

/** Every text node of a render, whole: « Accept » is not found inside « Accept all ». */
function nodes(html: string): string[] {
  return [...html.matchAll(/>([^<>]+)</g)].map((m) => decode(m[1]!));
}

function draw(ids: readonly string[], locale: Locale): string {
  return renderToStaticMarkup(createElement(PlannerPhone, { items: plannerPhoneView(ids), labels: copyOf(locale).phone }));
}

describe("what the phone shows (§18.7)", () => {
  it("before any card: the app, the plain banner, the sign-up as it is, the empty first screen — nothing else", () => {
    expect(plannerPhoneView([])).toEqual([
      { kind: "appBar" },
      { kind: "banner", style: "plain" },
      { kind: "signup", minimal: false, phone: "none", prechecked: false, partners: false },
      { kind: "home", checklist: false, importer: false, tour: false },
    ]);
  });

  it("with every card, in the order someone arriving scrolls", () => {
    expect(kinds(ALL)).toEqual([
      "appBar", "permissions", "banner", "demo", "signup", "analysis", "home", "push", "welcome", "calls",
    ]);
    const items = plannerPhoneView(ALL);
    expect(items.find((item) => item.kind === "banner")).toEqual({ kind: "banner", style: "equal" });
    expect(items.find((item) => item.kind === "signup")).toEqual({
      kind: "signup", minimal: true, phone: "optional", prechecked: true, partners: true,
    });
    expect(items.find((item) => item.kind === "home")).toEqual({ kind: "home", checklist: true, importer: true, tour: true });
  });

  it("draws the banner `equal` with `refuse`, else `nudged` with `banner`, else `plain` — `refuse` wins", () => {
    const style = (ids: string[]) => plannerPhoneView(ids).find((item) => item.kind === "banner");
    expect(style([])).toEqual({ kind: "banner", style: "plain" });
    expect(style(["banner"])).toEqual({ kind: "banner", style: "nudged" });
    expect(style(["refuse"])).toEqual({ kind: "banner", style: "equal" });
    expect(style(["banner", "refuse"])).toEqual({ kind: "banner", style: "equal" });
  });

  it("asks for the number as required, or as optional once the sign-up is minimal, else not at all", () => {
    const phone = (ids: string[]) => {
      const signup = plannerPhoneView(ids).find((item) => item.kind === "signup");
      return signup?.kind === "signup" ? signup.phone : null;
    };
    expect(phone([])).toBe("none");
    expect(phone(["minimal"])).toBe("none");
    expect(phone(["phone"])).toBe("required");
    expect(phone(["phone", "minimal"])).toBe("optional");
  });

  it("puts each card's line on the first screen and the sign-up form where its flag says", () => {
    const home = (ids: string[]) => plannerPhoneView(ids).find((item) => item.kind === "home");
    expect(home(["checklist"])).toEqual({ kind: "home", checklist: true, importer: false, tour: false });
    expect(home(["import"])).toEqual({ kind: "home", checklist: false, importer: true, tour: false });
    expect(home(["tour"])).toEqual({ kind: "home", checklist: false, importer: false, tour: true });
    const signup = (ids: string[]) => plannerPhoneView(ids).find((item) => item.kind === "signup");
    expect(signup(["prechecked"])).toMatchObject({ prechecked: true, partners: false });
    expect(signup(["partners"])).toMatchObject({ prechecked: false, partners: true });
    expect(signup(["minimal"])).toMatchObject({ minimal: true });
  });

  it("gives every card a visible place on the phone, except the data review and the rollback", () => {
    const base = new Set(plannerPhoneView([]).map(plannerItemKey));
    const invisible = ALL.filter((id) => plannerPhoneView([id]).every((item) => base.has(plannerItemKey(item))));
    // `present` is a meeting; `clean` puts the phone back as it was (§18.7).
    expect(invisible.sort()).toEqual(["clean", "present"]);
  });

  it("keys every element uniquely, whatever is ticked", () => {
    for (const ids of [[], ALL, ["banner"], ["refuse", "banner"], ["phone", "minimal"], ["tour", "checklist", "import"]]) {
      const keys = plannerPhoneView(ids).map(plannerItemKey);
      expect(new Set(keys).size, ids.join("+")).toBe(keys.length);
    }
  });

  it("flashes what a tick changed, and only that", () => {
    const flashed = (before: string[], after: string[]) =>
      [...changedKeys(plannerPhoneView(before), plannerPhoneView(after), plannerItemKey)].sort();
    expect(flashed([], ["refuse"])).toEqual(["banner:equal"]);
    expect(flashed(["banner"], ["banner", "refuse"])).toEqual(["banner:equal"]);
    expect(flashed([], ["pixels"])).toEqual(["push"]);
    expect(flashed([], ["checklist"])).toEqual(["home:true:false:false"]);
    // The sign-up form changes whole: its key carries every flag.
    expect(flashed([], ["minimal"])).toEqual(["signup:true:none:false:false"]);
    expect(flashed(["phone"], ["phone", "minimal"])).toEqual(["signup:true:optional:false:false"]);
    // Taking a card back shows what is there again, but flashes nothing that was already on screen.
    expect(flashed(["pixels"], [])).toEqual([]);
  });
});

describe("the cookie pill (§18.7)", () => {
  // The four rows of the table: cards in production or ticked → the pill, and whether it is coral.
  const TABLE: { ids: string[]; clicks: 1 | 3; alert: boolean }[] = [
    { ids: [], clicks: 1, alert: false },
    { ids: ["banner"], clicks: 3, alert: true },
    { ids: ["refuse"], clicks: 1, alert: false },
    { ids: ["banner", "refuse"], clicks: 1, alert: false },
  ];
  const SENTENCES: Record<Locale, { easy: string; hidden: string }> = {
    fr: {
      easy: "Refuser les cookies : 1 clic",
      hidden: "Refuser les cookies : 3 clics · le refus doit être aussi simple que l'accord",
    },
    en: {
      easy: "Refusing cookies: 1 click",
      hidden: "Refusing cookies: 3 clicks · refusing must be as easy as agreeing",
    },
  };

  it("counts one click, or three when the banner buries the refusal and nothing refuses as easily as it accepts", () => {
    for (const row of TABLE) expect(cookieRefusal(row.ids), row.ids.join("+") || "none").toEqual({ clicks: row.clicks, alert: row.alert });
    expect(REFUSE_CLICKS_EASY).toBe(1);
    expect(REFUSE_CLICKS_HIDDEN).toBe(3);
    // Other cards change nothing: the same four answers with the honest and the dark ones around.
    const others = ALL.filter((id) => id !== "banner" && id !== "refuse");
    expect(cookieRefusal(others)).toEqual({ clicks: 1, alert: false });
    expect(cookieRefusal([...others, "banner"])).toEqual({ clicks: 3, alert: true });
    expect(cookieRefusal(ALL)).toEqual({ clicks: 1, alert: false });
  });

  for (const locale of LOCALES) {
    it(`${locale}: each row of the table says its sentence, the same one in the pill, the island and the action bar`, () => {
      const copy = copyOf(locale);
      for (const row of TABLE) {
        const label = row.ids.join("+") || "none";
        const r = cookieRefusal(row.ids);
        const html = renderToStaticMarkup(
          createElement(CookiePill, { clicks: r.clicks, alert: r.alert, labels: copy.cookies, announce: false }),
        );
        const expected = row.alert ? SENTENCES[locale].hidden : SENTENCES[locale].easy;
        expect(text(html), label).toBe(expected);
        expect(cookieSentence(copy, r), label).toBe(expected);
        expect(html, label).toContain(`data-clicks="${row.clicks}"`);
        expect(html, label).toContain(`data-alert="${row.alert}"`);
        // The action bar's short form carries no suffix, and the alert says the rest.
        const pill = ACTIVATION_SIDE.pill({ ids: row.ids, copy, locale });
        expect(pill, label).toEqual({ text: row.alert ? copy.cookies.hidden : copy.cookies.easy, alert: row.alert });
        expect(expected.startsWith(pill.text), label).toBe(true);
      }
    });
  }

  for (const locale of LOCALES) {
    it(`${locale}: C13 — the clicks the pill says are the constants of the phone`, () => {
      const { cookies } = copyOf(locale);
      const unit = locale === "fr" ? ["clic", "clics"] : ["click", "clicks"];
      expect(cookies.easy).toMatch(new RegExp(`\\b${REFUSE_CLICKS_EASY}\\s+${unit[0]}\\b`));
      expect(cookies.hidden).toMatch(new RegExp(`\\b${REFUSE_CLICKS_HIDDEN}\\s+${unit[1]}\\b`));
      // The one number each sentence states.
      expect(cookies.easy.match(/\d+/g)).toEqual([String(REFUSE_CLICKS_EASY)]);
      expect(cookies.hidden.match(/\d+/g)).toEqual([String(REFUSE_CLICKS_HIDDEN)]);
    });
  }

  it("emphasises the figure, and the sentence stays whole", () => {
    const copy = copyOf("en");
    const html = renderToStaticMarkup(createElement(CookiePill, { clicks: 3, alert: true, labels: copy.cookies, announce: false }));
    expect(html).toMatch(/<b class="[^"]*">3<\/b>/);
    expect(text(html)).toBe(`${copy.cookies.hidden} · ${copy.cookies.lawSuffix}`);
  });

  it("announces a tick only when it changed the clicks", () => {
    const copy = copyOf("fr");
    const announce = (before: string[], after: string[]) => ACTIVATION_SIDE.announce({ before, after, copy, locale: "fr" });
    expect(announce([], ["demo"])).toBeNull();
    // `refuse` over a plain banner: still one click, nothing to say.
    expect(announce([], ["refuse"])).toBeNull();
    expect(announce([], ["banner"])).toBe(cookieSentence(copy, { clicks: 3, alert: true }));
    expect(announce(["banner"], ["banner", "refuse"])).toBe(copy.cookies.easy);
    expect(announce(["banner"], [])).toBe(copy.cookies.easy);
    expect(announce(["banner"], ["banner", "demo"])).toBeNull();
  });

  it("speaks for itself by default, and not inside the island", () => {
    const copy = copyOf("fr");
    const pill = (announce?: boolean) =>
      renderToStaticMarkup(createElement(CookiePill, { clicks: 3, alert: true, labels: copy.cookies, announce }));
    expect(pill()).toContain('aria-live="polite"');
    expect(pill(false)).not.toContain("aria-live");
    const side = renderToStaticMarkup(ACTIVATION_SIDE.render({ ids: ["banner"], copy, locale: "fr" }));
    expect(side).toContain('data-testid="game-phone"');
    expect(side).toContain('data-testid="game-cookies"');
    expect(side).not.toContain("aria-live");
  });
});

describe("the drawing", () => {
  for (const locale of LOCALES) {
    it(`${locale}: with every card ticked, every line is on the phone, and the phone has no control`, () => {
      const copy = copyOf(locale);
      const html = draw(ALL, locale);
      const shown = nodes(html);
      for (const key of [
        "caption", "appName", "time", "permissions", "permissionsAllow", "bannerText", "bannerRejectAll", "bannerAcceptAll",
        "bannerCustomise", "demo", "signupTitle", "fieldsMinimal", "phoneOptional", "prechecked", "partners", "submit",
        "analysis", "homeEmpty", "homeCreate", "checklist", "checklistClose", "importer", "tour", "push", "welcome", "calls",
      ] as const) {
        expect(shown, key).toContain(copy.phone[key]);
      }
      for (const answer of copy.phone.callsAnswers) expect(shown).toContain(answer);
      // « Créer mon compte » is the screen's title and its button: said twice, on purpose.
      expect(shown.filter((node) => node === copy.phone.signupTitle)).toHaveLength(2);
      // A drawing, never an interface (plan R14, E9).
      expect(html).not.toMatch(/<(button|a|input|select|textarea)\b/);
      expect(html).toContain("<figure");
      expect(html).toContain("<figcaption");
      expect(html).toContain('data-testid="game-phone"');
    });

    it(`${locale}: what cannot be seen with every card ticked`, () => {
      const copy = copyOf(locale);
      const shown = nodes(draw(ALL, locale));
      // `minimal` replaces the fields and makes the number optional; `refuse` makes the banner `equal`.
      for (const key of ["phoneRequired", "fields", "bannerTextNudged", "bannerAccept", "bannerContinue"] as const) {
        expect(shown, key).not.toContain(copy.phone[key]);
      }
    });
  }

  it("draws each banner with its own words and buttons", () => {
    const copy = copyOf("fr").phone;
    const banner = (ids: string[]) => {
      const html = draw(ids, "fr");
      return { html, shown: nodes(html.split('data-testid="game-planner-banner"')[1]!.split("</div>")[0]!) };
    };
    const plain = banner([]);
    expect(plain.html).toContain('data-style="plain"');
    expect(plain.shown).toEqual([copy.bannerText, copy.bannerAccept, copy.bannerContinue]);
    const nudged = banner(["banner"]);
    expect(nudged.html).toContain('data-style="nudged"');
    expect(nudged.shown).toEqual([copy.bannerTextNudged, copy.bannerAcceptAll, copy.bannerCustomise]);
    const equal = banner(["refuse"]);
    expect(equal.html).toContain('data-style="equal"');
    expect(equal.shown).toEqual([copy.bannerText, copy.bannerRejectAll, copy.bannerAcceptAll, copy.bannerCustomise]);
  });

  it("draws the sign-up with the number, the ticked box and the partners line that its cards bring", () => {
    const copy = copyOf("fr").phone;
    const signup = (ids: string[]) => {
      const html = draw(ids, "fr");
      return { html, shown: nodes(html.split('data-testid="game-planner-signup"')[1]!.split("</div>")[0]!) };
    };
    expect(signup([]).html).toContain('data-phone="none"');
    expect(signup([]).shown).toEqual([copy.signupTitle, copy.fields, copy.submit]);
    expect(signup(["phone"]).html).toContain('data-phone="required"');
    expect(signup(["phone"]).shown).toEqual([copy.signupTitle, copy.fields, copy.phoneRequired, copy.submit]);
    expect(signup(["phone", "minimal"]).html).toContain('data-phone="optional"');
    expect(signup(["phone", "minimal"]).shown).toEqual([copy.signupTitle, copy.fieldsMinimal, copy.phoneOptional, copy.submit]);
    // The ticked box sits above the button, the small print below it.
    expect(signup(["prechecked", "partners"]).shown).toEqual([
      copy.signupTitle, copy.fields, copy.prechecked, copy.submit, copy.partners,
    ]);
  });

  it("draws the first screen's tooltip, checklist and import link after the empty schedule and its button", () => {
    const copy = copyOf("en").phone;
    const home = nodes(draw(["tour", "checklist", "import"], "en").split('data-testid="game-planner-home"')[1]!.split("</div>")[0]!);
    expect(home).toEqual([copy.homeEmpty, copy.homeCreate, copy.tour, copy.checklist, copy.checklistClose, copy.importer]);
  });
});
