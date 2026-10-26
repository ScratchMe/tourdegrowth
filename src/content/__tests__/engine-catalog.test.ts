import { describe, expect, it } from "vitest";
import { ENGINE_CATALOG, ENGINE_DERIVED_CATALOG, type EngineCatalogEntry, type EngineDerivedEntry } from "../engine-catalog";
import { ENGINE_CATALOG_MKT_SERVICES, ENGINE_DERIVED_CATALOG_MKT_SERVICES } from "../engine-catalog-mkt-services";
import { ENGINE_COPY } from "../engine-copy";
import { displayDerivedShapeOf, displayShapeOf } from "@/lib/engine/business-type";
import { ALL_DERIVED_SHAPES, ALL_METRIC_SHAPES, APP_DERIVED_SHAPES, APP_METRIC_SHAPES, LTV_CAP_MONTHS, MKT_DERIVED_SHAPES, MKT_METRIC_SHAPES } from "@/lib/engine/catalog-shape";
import { SHARED_COUNTS } from "@/lib/engine/shared-counts";
import { mergeStrings } from "@/lib/engine/strings";
import type { DerivedId, MetricId } from "@/lib/engine/types";
import { LOCALES } from "@/lib/i18n/locale";
import { catalogRules } from "./engine-test-helpers";

/**
 * The growth engine's catalogue prose (engine spec §5, content PR P3).
 *
 * The shape ↔ prose id match, the closed-list labels and "a caveat next to
 * every reference" are pinned by `lib/engine/__tests__/catalog-shape.test.ts`
 * (P0). This file pins what the PROSE promises on top of that: that its
 * references never drift from the approved glossary, that everything a slide
 * can print stays inside the three fonts, that its placeholders are the six
 * the consumers fill, and that French never needs an elision a template
 * cannot make. Every catalogue: self-serve's, sales-assisted's and the
 * link's (A7.3.c S2), whose records are keyed by every id the types know.
 */

// The rules that hold for every engine catalogue (references, placeholders, slides, the prose itself) live in
// `engine-test-helpers.ts#catalogRules`: this file runs them on the SaaS catalogue (all three motions' entries and
// the app's own six, which the record holds too), and `engine-catalog-consumer.test.ts` on the consumer app's.
catalogRules("", ENGINE_CATALOG, ENGINE_DERIVED_CATALOG, ALL_METRIC_SHAPES, ALL_DERIVED_SHAPES, { minReferences: 7, carriesPeriod: true });

describe("references never drift from the approved glossary", () => {
  it.each(["rev.ltv", "slg.rev.ltv", "app.rev.install-ltv", "mkt.rev.ltv", "mkt.sell.ltv"] as const)("writes the LTV cap with the constant the calculation uses (%s)", (id) => {
    const ltv = ENGINE_DERIVED_CATALOG[id];
    for (const locale of LOCALES) {
      expect(ltv.formula[locale]).toContain(String(LTV_CAP_MONTHS));
      expect(ltv.capNote?.[locale]).toContain(String(LTV_CAP_MONTHS));
      expect(ENGINE_COPY.slide.unitCap[locale]).toContain(String(LTV_CAP_MONTHS));
    }
  });
});

describe("the consumer app's prose (engine spec §21.4.4 and §21.4.5, A22 APP-1)", () => {
  it("has the prose of its six numbers and four figures — the records are keyed by every id, so none can be missing", () => {
    for (const shape of APP_METRIC_SHAPES) expect(ENGINE_CATALOG[shape.id], shape.id).toBeDefined();
    for (const shape of APP_DERIVED_SHAPES) expect(ENGINE_DERIVED_CATALOG[shape.id], shape.id).toBeDefined();
    expect(APP_METRIC_SHAPES).toHaveLength(6);
    expect(APP_DERIVED_SHAPES).toHaveLength(4);
  });

  it("prints no reference caveat for them (D14: none carries a reference) — a 'no reference' reason instead", () => {
    for (const shape of APP_METRIC_SHAPES) {
      expect(ENGINE_CATALOG[shape.id].benchmarkCaveat, shape.id).toBeUndefined();
      expect(ENGINE_CATALOG[shape.id].noReferenceReason, shape.id).toBeDefined();
    }
    for (const shape of APP_DERIVED_SHAPES) expect(ENGINE_DERIVED_CATALOG[shape.id].caveat, shape.id).toBeUndefined();
  });

  it("names both counts of each, so the sheet can ask for them (and `cpi` and the two per-active revenues share theirs)", () => {
    for (const shape of APP_METRIC_SHAPES) {
      const inputs = ENGINE_CATALOG[shape.id].inputs;
      expect(inputs, shape.id).toBeDefined();
      for (const l of LOCALES) expect(inputs!.numerator[l].trim() && inputs!.denominator[l].trim(), `${shape.id}.${l}`).toBeTruthy();
    }
    expect(ENGINE_CATALOG["app.rev.purchases-per-active"].inputs?.denominator).toEqual(ENGINE_CATALOG["app.rev.ads-per-active"].inputs?.denominator);
  });

  it("gives the cost per install the variants of the CAC, id for id and label for label", () => {
    expect(ENGINE_CATALOG["app.acq.cpi"].variants).toEqual(ENGINE_CATALOG["acq.cac"].variants);
  });
});

// Non-vacuity, measured on 2026-10-18 (each sabotage alone, the tests of `src/lib/engine`, `src/content`, `src/app` and
// `src/__tests__` run, then put back): the `mkt.sell.first-sale` reason replaced by its own words falls the « same reason »
// test (1); `mkt.liq.fill-rate`'s variant label back at its first length (47 characters, for a limit of 40) falls the
// short-enough rule of `catalogRules` (1); a `benchmarkCaveat` added to a marketplace number falls the no-reference test
// below and « a caveat next to every reference » of catalog-shape.test.ts (2); the cap note taken off `mkt.sell.ltv`
// falls the cap test and the figures test (2).
describe("the marketplace's prose (engine spec §22.4.4, A23 MKT-1)", () => {
  it("has the prose of its nineteen numbers and six figures — the records are keyed by every id, so none can be missing", () => {
    for (const shape of MKT_METRIC_SHAPES) expect(ENGINE_CATALOG[shape.id], shape.id).toBeDefined();
    for (const shape of MKT_DERIVED_SHAPES) expect(ENGINE_DERIVED_CATALOG[shape.id], shape.id).toBeDefined();
    expect(MKT_METRIC_SHAPES).toHaveLength(19);
    expect(MKT_DERIVED_SHAPES).toHaveLength(6);
  });

  it("prints no reference caveat for them (D12, C73: none carries a reference) — a 'no reference' reason each", () => {
    for (const shape of MKT_METRIC_SHAPES) {
      expect(ENGINE_CATALOG[shape.id].benchmarkCaveat, shape.id).toBeUndefined();
      expect(ENGINE_CATALOG[shape.id].noReferenceReason, shape.id).toBeDefined();
    }
    // The two paybacks carry the commonly-cited-reference caveat and nothing else; the LTV:CACs none.
    expect(Object.keys(ENGINE_DERIVED_CATALOG).filter((id) => id.startsWith("mkt.") && ENGINE_DERIVED_CATALOG[id as keyof typeof ENGINE_DERIVED_CATALOG].caveat)).toEqual(["mkt.rev.cac-payback", "mkt.sell.cac-payback"]);
    expect(ENGINE_DERIVED_CATALOG["mkt.sell.cac-payback"].caveat).toEqual(ENGINE_DERIVED_CATALOG["mkt.rev.cac-payback"].caveat);
  });

  it("names both counts of each, so the sheet can ask for them", () => {
    for (const shape of MKT_METRIC_SHAPES) {
      const inputs = ENGINE_CATALOG[shape.id].inputs;
      expect(inputs, shape.id).toBeDefined();
      for (const l of LOCALES) expect(inputs!.numerator[l].trim() && inputs!.denominator[l].trim(), `${shape.id}.${l}`).toBeTruthy();
    }
  });

  it("copies the reasons the specification says to copy: the first sale's from the first order, the sellers' churn from the buyers', the frequency's from the second order's", () => {
    expect(ENGINE_CATALOG["mkt.sell.first-sale"].noReferenceReason).toEqual(ENGINE_CATALOG["mkt.buy.first-order"].noReferenceReason);
    expect(ENGINE_CATALOG["mkt.sell.churn"].noReferenceReason).toEqual(ENGINE_CATALOG["mkt.buy.churn"].noReferenceReason);
    expect(ENGINE_CATALOG["mkt.rev.frequency"].noReferenceReason).toEqual(ENGINE_CATALOG["mkt.buy.repeat"].noReferenceReason);
  });

  it("gives both costs the variants of the CAC, id for id — the sellers' team label its own — and the fill rate its two kinds of request", () => {
    const cac = ENGINE_CATALOG["acq.cac"].variants!;
    expect(ENGINE_CATALOG["mkt.buy.cac"].variants).toEqual(cac);
    expect(ENGINE_CATALOG["mkt.sell.cac"].variants?.map((v) => v.id)).toEqual(cac.map((v) => v.id));
    expect(ENGINE_CATALOG["mkt.sell.cac"].variants?.filter((v) => v.id !== "plus-team")).toEqual(cac.filter((v) => v.id !== "plus-team"));
    expect(ENGINE_CATALOG["mkt.sell.cac"].variants?.find((v) => v.id === "plus-team")?.label).toEqual({ fr: "+ équipe offre", en: "+ supply team" });
    expect(ENGINE_CATALOG["mkt.liq.fill-rate"].variants?.map((v) => v.id)).toEqual(["requests", "searches"]);
  });

  it("writes the figures as the app's: an 'uncomputable' line each, a cap note on the two LTVs only", () => {
    for (const shape of MKT_DERIVED_SHAPES) {
      const entry = ENGINE_DERIVED_CATALOG[shape.id];
      expect(entry.uncomputable, shape.id).toEqual(ENGINE_DERIVED_CATALOG["rev.ltv"].uncomputable);
      expect(entry.capNote !== undefined, shape.id).toBe(shape.id === "mkt.rev.ltv" || shape.id === "mkt.sell.ltv");
    }
    expect(ENGINE_DERIVED_CATALOG["mkt.rev.ltv"].capNote).toEqual(ENGINE_DERIVED_CATALOG["rev.ltv"].capNote);
    expect(ENGINE_DERIVED_CATALOG["mkt.sell.ltv"].capNote).toEqual(ENGINE_DERIVED_CATALOG["rev.ltv"].capNote);
  });

  it("names the Tour-bridged and liquidity numbers in the marketplace's own words: the first order, the first sale, the fill rate", () => {
    expect(ENGINE_CATALOG["mkt.buy.first-order"].name.fr).toBe("Première commande");
    expect(ENGINE_CATALOG["mkt.sell.first-sale"].name.fr).toBe("Première vente");
    expect(ENGINE_CATALOG["mkt.liq.fill-rate"].name.en).toBe("Fill rate");
  });
});

// ------------------------------------------------------------------------------------------------ « services » (MKT-S)

/**
 * The marketplace's prose in the words of "services" (engine spec §22.4.4 and §22.8.4, A23 MKT-S): partial entries over the
 * "products" ones, merged as the page merges them (`engine-props.ts`: `mergeStrings`, whole `where` and `variants`). The
 * rules every catalogue keeps (`catalogRules`: the limits of length, the six placeholders, the glyphs, the vocabulary)
 * run on the merged whole; the words of "produits" the services catalogue must no longer hold are
 * `engine-copy-marketplace.test.ts`'s (point 5, which reads the page's props).
 *
 * Non-vacuity, measured on 2026-10-26 (each sabotage alone, on a copy of the sources outside the repository, the seven nearest
 * test files run, then put back): a name of §22.4.4's table changed in the overlay falls 3 (the names test, point 5 on the
 * page's props, the words test of `engine-props.test.ts`); a field of an entry left equal to its "products" text 1 (the
 * no-op test); a `where` source changed to another tool 3 (the sources test here, « names a tool the shape lists » of
 * `catalogRules`, the shape of the props in `engine-props.test.ts`); the sellers' churn formula put back to the lexicon's
 * own 2 (the word-for-word test, and the limit of a formula, which that version exceeds); "Seller" put back in a shared
 * count's label in one place 2 (the parity test, point 5); « un panier » put back in the first order's trap 2 (the written-
 * out test and point 5).
 */
const SERVICES_CATALOG = Object.fromEntries(MKT_METRIC_SHAPES.map((shape) => [shape.id, mergeStrings(ENGINE_CATALOG[shape.id], ENGINE_CATALOG_MKT_SERVICES[shape.id])])) as Record<string, EngineCatalogEntry>;
const SERVICES_DERIVED = Object.fromEntries(MKT_DERIVED_SHAPES.map((shape) => [shape.id, mergeStrings(ENGINE_DERIVED_CATALOG[shape.id], ENGINE_DERIVED_CATALOG_MKT_SERVICES[shape.id])])) as Record<string, EngineDerivedEntry>;

// No reference to restate (C73: none for a marketplace): the floor is zero, and the tests of the two blocks above hold that none exists.
catalogRules(
  "the marketplace's catalogue in the words of services",
  SERVICES_CATALOG,
  SERVICES_DERIVED,
  MKT_METRIC_SHAPES.map((shape) => displayShapeOf(shape.id, "marketplace")),
  MKT_DERIVED_SHAPES.map((shape) => displayDerivedShapeOf(shape.id, "marketplace")),
  { minReferences: 0, carriesPeriod: false },
);

describe("the marketplace's prose in the words of services (engine spec §22.4.4, §22.8.4, A23 MKT-S)", () => {
  /** §22.4.4, « Les noms en mots « services » », written out here: the table is the oracle, not the code. */
  const NAMES: Record<string, [fr: string, en: string]> = {
    "mkt.buy.signup-rate": ["Taux d'inscription des clients", "Client sign-up rate"],
    "mkt.buy.cac": ["CAC client", "Client CAC"],
    "mkt.sell.cac": ["Coût d'un prestataire actif", "Cost per active provider"],
    "mkt.sell.signup-rate": ["Taux d'inscription des prestataires", "Provider sign-up rate"],
    "mkt.buy.first-order": ["Première réservation", "First booking"],
    "mkt.sell.first-sale": ["Première réservation reçue", "First booking received"],
    "mkt.liq.fill-rate": ["Taux de service", "Fill rate"],
    "mkt.buy.repeat": ["Deuxième réservation", "Second booking"],
    "mkt.buy.churn": ["Churn mensuel des clients", "Monthly client churn"],
    "mkt.sell.churn": ["Churn mensuel des prestataires", "Monthly provider churn"],
    "mkt.sell.paid-churn": ["Churn mensuel des prestataires abonnés", "Monthly paid provider churn"],
    "mkt.buy.referred-share": ["Part des clients recommandés", "Referred client share"],
    "mkt.rev.take-rate": ["Commission (take rate)", "Take rate"],
    "mkt.rev.aov": ["Montant moyen d'une réservation", "Average booking value"],
    "mkt.rev.frequency": ["Fréquence de réservation", "Booking frequency"],
    "mkt.rev.gross-margin": ["Marge sur le revenu net", "Margin on net revenue"],
    "mkt.sell.paid-conversion": ["Conversion en prestataire abonné", "Provider subscription conversion"],
    "mkt.sell.arpa": ["Revenu mensuel par prestataire abonné", "Monthly revenue per paid provider"],
    "mkt.sell.gross-margin": ["Marge sur les abonnements prestataires", "Margin on provider subscriptions"],
    "mkt.rev.ltv": ["LTV client", "Client LTV"],
    "mkt.rev.cac-payback": ["CAC payback client", "Client CAC payback"],
    "mkt.rev.ltv-cac": ["LTV:CAC client", "Client LTV:CAC"],
    "mkt.sell.ltv": ["LTV prestataire abonné", "Paid provider LTV"],
    "mkt.sell.cac-payback": ["Payback d'un prestataire abonné", "Paid provider payback"],
    "mkt.sell.ltv-cac": ["LTV:CAC prestataire abonné", "Paid provider LTV:CAC"],
  };
  const plain = (text: string) => text.replace(/ /g, " ");

  it("has an overlay for each of the nineteen numbers and the six figures, no more, in the shapes' order", () => {
    expect(Object.keys(ENGINE_CATALOG_MKT_SERVICES)).toEqual(MKT_METRIC_SHAPES.map((s) => s.id));
    expect(Object.keys(ENGINE_DERIVED_CATALOG_MKT_SERVICES)).toEqual(MKT_DERIVED_SHAPES.map((s) => s.id));
    expect(MKT_METRIC_SHAPES).toHaveLength(19);
    expect(MKT_DERIVED_SHAPES).toHaveLength(6);
    expect(Object.keys(NAMES)).toHaveLength(25);
  });

  it("names the nineteen numbers and the six figures as §22.4.4's table does, in both languages — within the limit of a name", () => {
    for (const [id, [fr, en]] of Object.entries(NAMES)) {
      const entry = SERVICES_CATALOG[id] ?? SERVICES_DERIVED[id];
      expect(entry, id).toBeDefined();
      expect([plain(entry!.name.fr), entry!.name.en], id).toEqual([fr, en]);
      expect(Math.max(entry!.name.fr.length, entry!.name.en.length), `${id}: the name's limit (catalogRules)`).toBeLessThanOrEqual(40);
    }
  });

  it("writes the two churn formulas word for word, as §22.8.4's table does (the typography apart)", () => {
    expect(plain(SERVICES_CATALOG["mkt.buy.churn"]!.formula.fr)).toBe("clients sortis des actifs dans le mois ÷ clients actifs au 1er du mois (actif : au moins une réservation sur les 12 derniers mois)");
    expect(SERVICES_CATALOG["mkt.buy.churn"]!.formula.en).toBe("clients who left the active base in the month ÷ active clients at the start of the month (active: at least one booking in 12 months)");
    expect(plain(SERVICES_CATALOG["mkt.sell.churn"]!.formula.fr)).toBe("prestataires sortis des actifs dans le mois ÷ prestataires actifs au 1er du mois (actif : réservé au moins une fois en 12 mois)");
    expect(SERVICES_CATALOG["mkt.sell.churn"]!.formula.en).toBe("providers who left the active base in the month ÷ active providers at the start of the month (active: booked at least once in 12 months)");
  });

  it("carries, in an overlay, only the fields whose text differs from the entry it lies on — a field left equal is a no-op", () => {
    const equal: string[] = [];
    const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
    for (const [id, overlay] of Object.entries(ENGINE_CATALOG_MKT_SERVICES)) {
      const before = ENGINE_CATALOG[id as MetricId];
      for (const [key, value] of Object.entries(overlay)) if (same(value, before[key as keyof typeof before])) equal.push(`${id}.${key}`);
    }
    for (const [id, overlay] of Object.entries(ENGINE_DERIVED_CATALOG_MKT_SERVICES)) {
      const before = ENGINE_DERIVED_CATALOG[id as DerivedId];
      for (const [key, value] of Object.entries(overlay)) if (same(value, before[key as keyof typeof before])) equal.push(`${id}.${key}`);
    }
    expect(equal).toEqual([]);
  });

  it("gives `where` and `variants` whole when it rewrites one of them: the same sources, the same ids, in the same order (`mergeStrings` replaces an array as a whole)", () => {
    let wheres = 0;
    let variants = 0;
    for (const [id, overlay] of Object.entries(ENGINE_CATALOG_MKT_SERVICES)) {
      const before = ENGINE_CATALOG[id as MetricId];
      if (overlay.where) {
        wheres += 1;
        expect(overlay.where.map((w) => w.source), `${id} where`).toEqual(before.where.map((w) => w.source));
      }
      if (overlay.variants) {
        variants += 1;
        expect(overlay.variants.map((v) => v.id), `${id} variants`).toEqual(before.variants!.map((v) => v.id));
      }
      for (const key of ["naReasons", "choices"] as const) expect(overlay[key], `${id} ${key}`).toBeUndefined();
    }
    // Not vacuous: a dozen entries rewrite their places to look, and the fill rate its variant (« une annonce consultée »).
    expect(wheres).toBeGreaterThan(10);
    expect(variants).toBeGreaterThan(0);
    expect(SERVICES_CATALOG["mkt.liq.fill-rate"]!.variants?.map((v) => v.label.fr)).toEqual(["Demandes envoyées : réservation, devis…", "Recherches avec un profil consulté"].map((t) => t.replace(" :", " :")));
    expect(SERVICES_CATALOG["mkt.buy.cac"]!.variants).toEqual(ENGINE_CATALOG["mkt.buy.cac"].variants);
  });

  it("labels every place of a shared count alike, in both languages, in the catalogue of services — the shared line the sheet prints (§22.2.4)", () => {
    const label = (id: string, side: "numerator" | "denominator", locale: "fr" | "en") => SERVICES_CATALOG[id]?.inputs?.[side]?.[locale];
    const groups = Object.entries(SHARED_COUNTS).filter(([, slots]) => slots.some((slot) => slot.metric.startsWith("mkt.")));
    expect(groups.map(([count]) => count)).toEqual(["mktCohortSignups", "mktOrders", "mktGmv", "mktNetRevenue", "mktSellerCohortSignups", "mktSellerMrrEnd"]);
    const read = Object.fromEntries(
      (["fr", "en"] as const).map((locale) => [
        locale,
        Object.fromEntries(
          groups.map(([count, slots]) => {
            const labels = slots.map((slot) => label(slot.metric, slot.side, locale));
            expect(new Set(labels).size, `${locale} ${count}: ${JSON.stringify(labels)}`).toBe(1);
            expect(labels[0], `${locale} ${count}`).toBeTruthy();
            return [count, labels[0]];
          }),
        ),
      ]),
    );
    expect(read).toEqual({
      fr: {
        mktCohortSignups: "Inscrits clients en {cohort}",
        mktOrders: "Réservations en {month}",
        mktGmv: "Volume d'affaires (GMV) en {month}",
        mktNetRevenue: "Revenu net en {month}",
        mktSellerCohortSignups: "Prestataires inscrits en {cohort}",
        mktSellerMrrEnd: "MRR prestataires à fin {month}",
      },
      en: {
        mktCohortSignups: "Client sign-ups from {cohort}",
        mktOrders: "Bookings in {month}",
        mktGmv: "Gross merchandise value (GMV) in {month}",
        mktNetRevenue: "Net revenue in {month}",
        mktSellerCohortSignups: "Provider sign-ups from {cohort}",
        mktSellerMrrEnd: "Provider MRR at the end of {month}",
      },
    });
  });

  it("reads the lexicon on the places that need an accord or a verb: « ne reçoit plus de réservation », « mais reçoit encore », « un profil consulté »", () => {
    expect(SERVICES_CATALOG["mkt.sell.churn"]!.trap.fr).toContain("un prestataire qui ne reçoit plus de réservation");
    expect(SERVICES_CATALOG["mkt.sell.churn"]!.trap.en).toContain("a provider who no longer gets booked");
    expect(SERVICES_CATALOG["mkt.sell.paid-churn"]!.trap.fr).toContain("mais reçoit encore des réservations");
    expect(SERVICES_CATALOG["mkt.liq.fill-rate"]!.trap.fr).toContain("regardé un profil");
    expect(SERVICES_CATALOG["mkt.liq.fill-rate"]!.trap.en).toContain("looked at a profile");
    expect(SERVICES_CATALOG["mkt.rev.aov"]!.noReferenceReason!.fr).toBe("il dépend entièrement de ce qui est réservé chez toi");
    expect(SERVICES_CATALOG["mkt.rev.frequency"]!.noReferenceReason!.fr).toContain("fréquence de réservation");
    expect(SERVICES_CATALOG["mkt.sell.first-sale"]!.trap.fr).toContain("sans être réservé");
    expect(SERVICES_CATALOG["mkt.sell.first-sale"]!.trap.fr).toContain("pas le profil");
  });

  it("carries the four corrections of the review of 2026-10-26: the date of the first booking received, its trap, the fill rate's two places to look", () => {
    const first = SERVICES_CATALOG["mkt.sell.first-sale"]!;
    // The participle agrees with the booking they received, not with « la date ».
    expect(first.where[0]!.path.fr).toBe("les prestataires inscrits en {cohort} et la date de la première réservation payée qu'ils ont reçue");
    expect(first.where[0]!.path.en).toBe("the providers who signed up in {cohort} and the date of the first paid booking they received");
    expect(first.trap.fr).toBe("Un prestataire qui publie son profil sans être réservé n'est pas activé\u00a0: c'est la réservation reçue qui compte, pas le profil.");
    expect(first.trap.en).toBe("A provider who puts up a profile without getting booked isn't activated: the booking received counts, not the profile.");
    const fill = SERVICES_CATALOG["mkt.liq.fill-rate"]!;
    // « demandes de réservation, devis ou missions »: the sentence no longer goes round (« réservations » then « une réservation »).
    expect(fill.where[0]!.path.fr).toBe("les demandes de réservation, devis ou missions publiées en {month}, et celles qui ont abouti à une réservation");
    expect(fill.where[0]!.path.en).toBe("the booking requests, quotes or jobs posted in {month}, and those that ended in a booking");
    // « un profil consulté », as the entry's trap and variant say, and the English.
    expect(fill.where[1]!.path.fr).toBe("les sessions avec une recherche et un profil consulté, et celles qui se terminent par une réservation");
    expect(fill.where[1]!.path.en).toBe("the sessions with a search and a profile viewed, and those that end in a booking");
    for (const entry of [first, fill]) for (const w of entry.where) for (const lang of ["fr", "en"] as const) expect(w.path[lang], `${lang}: no « fiche », no "listing"`).not.toMatch(/\bfiche\b|\blisting\b/i);
  });

  it("writes out the three places the lexicon cannot carry (the basket, the software sold, the first booking received's), each marked in the file", () => {
    // « pas un panier » is not « pas un montant de la réservation »: the clause goes, the request sent stays.
    expect(SERVICES_CATALOG["mkt.buy.first-order"]!.trap.fr).toBe("Compte une réservation payée, pas une demande envoyée. Une réservation annulée ou remboursée en entier ne compte pas.");
    expect(SERVICES_CATALOG["mkt.buy.first-order"]!.trap.en).toBe("Count a paid booking, not a request sent. A booking cancelled or refunded in full doesn't count.");
    // « logiciel vendu seul » is software, not a sale of the marketplace.
    expect(SERVICES_CATALOG["mkt.sell.gross-margin"]!.noReferenceReason!.fr).toContain("le logiciel proposé seul");
    expect(SERVICES_CATALOG["mkt.sell.gross-margin"]!.noReferenceReason!.en).toContain("software offered on its own");
    // "the first sale's" would be "the first booking received's".
    expect(SERVICES_CATALOG["mkt.sell.paid-conversion"]!.trap.en).toContain("The window is that of the first booking received");
    expect(SERVICES_CATALOG["mkt.sell.paid-conversion"]!.trap.fr).toContain("La fenêtre est celle de la première réservation reçue");
  });
});
