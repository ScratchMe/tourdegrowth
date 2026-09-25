import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LEVEL_COPY_TEMPLATES, resolveLevelCopy, type RetentionCopy } from "@/lib/game/copy";
import * as retentionLevel from "@/lib/game/levels/retention";
import { RETENTION_DARK_IDS, RETENTION_HONEST_IDS } from "@/lib/game/levels/retention";
import type { Translatable } from "@/lib/i18n/translatable";
import { RETENTION_INTRO } from "../game/meta";
import { RETENTION_CONTENT } from "../game/retention";

/**
 * GAME-BRIEF.md §7.1, série C — the content of level 1 « S'ils reviennent ».
 *
 * C7 (the bundle guard) lives in `src/__tests__/game-bundles.test.ts`, with
 * the routes that it protects. Everything else about the copy is here: parity
 * between the two languages, the rules the cards are written under, the
 * brands the catalogue may name, the placeholders the island has to supply,
 * and — C11 — that the French is still the prototype's, word for word,
 * wherever it is not explicitly marked as corrected or new.
 */

type Leaf = { path: string; value: Translatable };

/** Every translatable of the tree, with its dotted path. A bare string anywhere is a failure of its own (C2). */
function walk(node: unknown, path = "", leaves: Leaf[] = [], bare: string[] = []): { leaves: Leaf[]; bare: string[] } {
  if (typeof node === "string") {
    bare.push(path);
  } else if (Array.isArray(node)) {
    node.forEach((child, i) => walk(child, path ? `${path}.${i}` : String(i), leaves, bare));
  } else if (node !== null && typeof node === "object") {
    const record = node as Record<string, unknown>;
    const keys = Object.keys(record);
    if (keys.length === 2 && typeof record.fr === "string" && typeof record.en === "string") {
      leaves.push({ path, value: record as Translatable });
    } else {
      for (const key of keys) walk(record[key], path ? `${path}.${key}` : key, leaves, bare);
    }
  }
  return { leaves, bare };
}

const { leaves: LEAVES, bare: BARE } = walk(RETENTION_CONTENT);
const HONEST = [...RETENTION_HONEST_IDS] as string[];
const DARK = [...RETENTION_DARK_IDS] as string[];

/** The CEO asks for these five and no other (GAME-BRIEF §5.10). */
const ORDER_POOL = ["pdef", "call", "bury", "cascade", "notice"];

function sorted(values: Iterable<string>): string[] {
  return [...values].sort();
}

// ---------------------------------------------------------------------------
// C1, C2 — both languages, everywhere, and nothing forgotten.
// ---------------------------------------------------------------------------

describe("C2 · parity between the two languages", () => {
  it("walks a tree that actually has content — otherwise every check below proves nothing", () => {
    expect(LEAVES.length).toBeGreaterThan(250);
  });

  it("has no bare string: every leaf is a Translatable", () => {
    expect(BARE).toEqual([]);
  });

  it("is non-empty in French and in English at every leaf", () => {
    const empty = LEAVES.filter(({ value }) => !value.fr.trim() || !value.en.trim()).map(({ path }) => path);
    expect(empty).toEqual([]);
  });

  it("names every card of the level, and only those", () => {
    expect(sorted(Object.keys(RETENTION_CONTENT.cards))).toEqual(sorted([...HONEST, ...DARK]));
    for (const [id, card] of Object.entries(RETENTION_CONTENT.cards)) {
      for (const field of [card.name, card.pitch]) {
        expect(field.fr.trim(), `${id} fr`).not.toBe("");
        expect(field.en.trim(), `${id} en`).not.toBe("");
      }
    }
  });

  it("resolves to one language, keeping the shape, the arrays and the flags", () => {
    for (const locale of ["fr", "en"] as const) {
      const copy = resolveLevelCopy<RetentionCopy>(RETENTION_CONTENT, locale);
      expect(copy.cards.pause.name).toBe(RETENTION_CONTENT.cards.pause.name[locale]);
      expect(copy.boss.t1).toBe(RETENTION_CONTENT.boss.t1[locale]);
      expect(copy.months).toHaveLength(12);
      expect(copy.months[0]).toBe(RETENTION_CONTENT.months[0]![locale]);
      expect(copy.phone.cascadeOffers).toHaveLength(3);
      expect(copy.endings.applause.win).toBe(true);
      expect(copy.endings.fine.win).toBe(false);
      // Not one Translatable survives resolution.
      expect(walk(copy).leaves).toEqual([]);
      expect(walk(copy).bare.length).toBe(LEAVES.length);
    }
  });

  it("has twelve months, twelve initials and four quarter ranges", () => {
    expect(RETENTION_CONTENT.months).toHaveLength(12);
    expect(RETENTION_CONTENT.monthInitials).toHaveLength(12);
    expect(RETENTION_CONTENT.timeline.ranges).toHaveLength(4);
  });

  it("keeps no second copy of the intro or of the zones — the page renders meta.ts and hub.ts (review R8)", () => {
    expect(Object.keys(RETENTION_CONTENT)).not.toContain("intro");
    expect(Object.keys(RETENTION_CONTENT)).not.toContain("zones");
  });
});

describe("C1 · every trick has its four catalogue fields", () => {
  it("covers the eight tricks exactly", () => {
    expect(sorted(Object.keys(RETENTION_CONTENT.patterns))).toEqual(sorted(DARK));
  });

  it("has official, law, cas and tell, non-empty, in both languages", () => {
    for (const [id, pattern] of Object.entries(RETENTION_CONTENT.patterns)) {
      for (const field of ["official", "law", "cas", "tell"] as const) {
        expect(pattern[field].fr.trim(), `${id}.${field} fr`).not.toBe("");
        expect(pattern[field].en.trim(), `${id}.${field} en`).not.toBe("");
      }
    }
  });
});

// ---------------------------------------------------------------------------
// C3, C9 — the cards describe, they never judge (brief §5.5).
// ---------------------------------------------------------------------------

/** Word boundaries that understand accents: JavaScript's \b does not, even with the u flag. */
const word = (alternatives: string) => new RegExp(`(?<![\\p{L}])(?:${alternatives})(?![\\p{L}])`, "iu");

const FORBIDDEN = {
  fr: word("lente?s?|rapides?|efficaces?|honnêtes?|astuces?|faux|fausses?|pièges?|certains partiront|ils n'existent pas"),
  en: word("slow(?:ly)?|fast|quick(?:ly)?|effective|efficient|honest|tricks?|fake|traps?|some will leave|(?:don't|do not) exist"),
};
const PERCENT = /%/;
/** A signed number: + − or - right before a digit, not inside a word like « e-mail » or « L215-1-1 ». */
const SIGNED = /(?<![\p{L}\d])[+\-−]\s?\d/u;

function judgementIn(text: string, locale: "fr" | "en"): string | null {
  if (PERCENT.test(text)) return "a percentage";
  if (SIGNED.test(text)) return "a signed number";
  const hit = text.match(FORBIDDEN[locale]);
  return hit ? `the word « ${hit[0]} »` : null;
}

describe("C3 · no card shows an effect", () => {
  it("names and pitches carry no percentage, no signed number, no forbidden word, in either language", () => {
    const offenders: string[] = [];
    for (const [id, card] of Object.entries(RETENTION_CONTENT.cards)) {
      for (const field of ["name", "pitch"] as const) {
        for (const locale of ["fr", "en"] as const) {
          const why = judgementIn(card[field][locale], locale);
          if (why) offenders.push(`${id}.${field} ${locale}: ${why}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("would catch one — the rule is not vacuous", () => {
    expect(judgementIn("Réduit les départs de 5 %", "fr")).toBe("a percentage");
    expect(judgementIn("Confiance −4", "fr")).toBe("a signed number");
    expect(judgementIn("Une astuce rapide", "fr")).toMatch(/astuce|rapide/);
    expect(judgementIn("An honest fix", "en")).toMatch(/honest/);
    // …and does not mistake a hyphenated word for a sign.
    expect(judgementIn("Un e-mail trois jours avant", "fr")).toBeNull();
  });
});

describe("C9 · the hand's hints and the order badge are held to the same rule", () => {
  it("never announces what a card does before the quarter is played", () => {
    const offenders: string[] = [];
    for (const [key, value] of Object.entries(RETENTION_CONTENT.hand)) {
      for (const locale of ["fr", "en"] as const) {
        const why = judgementIn(value[locale], locale);
        if (why) offenders.push(`hand.${key} ${locale}: ${why}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// C4, C5 — the numbers the copy states, the ids it keys on.
// ---------------------------------------------------------------------------

type LevelLike = {
  constants: { targets: readonly number[] };
  honestOrder: readonly string[];
  darkOrder: readonly string[];
  darkFirstQuarter: readonly string[];
  orderPool: readonly string[];
  cards: Record<string, unknown>;
};

function isLevelLike(value: unknown): value is LevelLike {
  if (value === null || typeof value !== "object") return false;
  const v = value as Partial<LevelLike>;
  return Array.isArray(v.constants?.targets) && Array.isArray(v.honestOrder) && Array.isArray(v.darkOrder);
}

/**
 * The engine (chunk G1) fills the LevelDefinition into the same module as the
 * ids, in parallel with this chunk. It is looked up by shape rather than by
 * export name, so these checks switch on the moment it lands — and are
 * reported as skipped, never as passing, until then.
 */
const LEVEL = Object.values(retentionLevel as Record<string, unknown>).find(isLevelLike);

describe("C4 · the targets the copy states", () => {
  it("agree with each other across both languages", () => {
    const { boss, dashboard } = RETENTION_CONTENT;
    // The first quarter's target is written out in the T1 message, and again in T2's reproach.
    expect(boss.t1.fr).toContain("5,6 %");
    expect(boss.t1.en).toContain("5.6%");
    expect(boss.t2Miss.fr).toContain("au lieu de 5,6.");
    expect(boss.t2Miss.en).toContain("instead of 5.6.");
    // The board's target, 4 %, everywhere it is stated rather than templated.
    for (const text of [boss.t1, boss.t4Hit, boss.t4Miss, RETENTION_INTRO.lead]) {
      expect(text.fr).toContain("4 %");
      expect(text.en).toContain("4%");
    }
    // The dashboard never hardcodes a target: the island fills it from the model.
    expect(dashboard.quarterTarget.fr).toContain("{target}");
    expect(dashboard.boardTarget.fr).toContain("{target}");
  });

  it.skipIf(!LEVEL)("match the model: strictly decreasing, ending at 4 %, and T1 is the 5,6 the CEO names", () => {
    const targets = LEVEL!.constants.targets;
    for (let i = 1; i < targets.length; i++) expect(targets[i]!).toBeLessThan(targets[i - 1]!);
    expect(targets[targets.length - 1]).toBeCloseTo(0.04, 10);
    // The T1 message is static text: if the model's first target moves, the CEO lies.
    expect(targets[0]).toBeCloseTo(0.056, 10);
  });
});

describe("C5 · identifiers", () => {
  it("are unique across the two families", () => {
    expect(new Set([...HONEST, ...DARK]).size).toBe(HONEST.length + DARK.length);
  });

  it("keys the CEO's orders on tricks, exactly the five he asks for", () => {
    expect(sorted(Object.keys(RETENTION_CONTENT.orders))).toEqual(sorted(ORDER_POOL));
    for (const id of Object.keys(RETENTION_CONTENT.orders)) expect(DARK).toContain(id);
  });

  it.skipIf(!LEVEL)("agrees with the model's orders, and the first-quarter tricks are tricks", () => {
    for (const id of LEVEL!.honestOrder) expect(HONEST).toContain(id);
    for (const id of LEVEL!.darkOrder) expect(DARK).toContain(id);
    for (const id of LEVEL!.darkFirstQuarter) expect(LEVEL!.darkOrder).toContain(id);
    expect(sorted(LEVEL!.orderPool)).toEqual(sorted(Object.keys(RETENTION_CONTENT.orders)));
    expect(sorted(Object.keys(LEVEL!.cards))).toEqual(sorted(Object.keys(RETENTION_CONTENT.cards)));
  });
});

// ---------------------------------------------------------------------------
// C6 — real brands, only in the catalogue's cases (brief §8.3).
// ---------------------------------------------------------------------------

/** The whitelist. A new brand is a decision (legal review J5), not an edit. */
const BRANDS = ["Basic-Fit", "Amazon", "Adobe", "Google", "deceptive.design"];

/**
 * Every other capitalised word a case may use: sentence openers, public
 * bodies, places, and two names that belong to a whitelisted brand's own
 * story (Amazon's Prime and its internal « Iliad »). A capitalised word
 * missing from both lists fails the test, which is what makes a new brand
 * impossible to slip in unnoticed.
 */
const NOT_BRANDS = new Set([
  "Aux", "C'est", "DGCCRF", "Elles", "La", "Le", "Les", "Proposer", "États-Unis",
  "Daily", "Fake", "France's", "In", "It", "Offering", "Switching", "The", "They", "United", "States",
  "Prime", "Iliad",
]);

const CAPITALISED = /(?<![\p{L}'-])\p{Lu}[\p{L}'’-]*/gu;
const DOMAIN = /\b[a-z]+\.[a-z]{2,}\b/g;

describe("C6 · brands", () => {
  it("names in a case only whitelisted brands, public bodies and ordinary words", () => {
    const unknown: string[] = [];
    for (const [id, pattern] of Object.entries(RETENTION_CONTENT.patterns)) {
      for (const locale of ["fr", "en"] as const) {
        const text = pattern.cas[locale];
        for (const token of text.match(CAPITALISED) ?? []) {
          if (!BRANDS.includes(token) && !NOT_BRANDS.has(token)) unknown.push(`${id} ${locale}: ${token}`);
        }
        for (const domain of text.match(DOMAIN) ?? []) {
          if (!BRANDS.includes(domain)) unknown.push(`${id} ${locale}: ${domain}`);
        }
      }
    }
    expect(unknown).toEqual([]);
  });

  it("cites every whitelisted brand at least once — or the whitelist is stale", () => {
    const cases = Object.values(RETENTION_CONTENT.patterns).map((p) => `${p.cas.fr} ${p.cas.en}`).join(" ");
    for (const brand of BRANDS) expect(cases).toContain(brand);
  });

  it("keeps real brands out of the game itself: cards, phone, events, CEO", () => {
    const outside = LEAVES.filter(({ path }) => !/^patterns\.[^.]+\.cas$/.test(path));
    const leaks = outside.flatMap(({ path, value }) =>
      BRANDS.filter((brand) => value.fr.includes(brand) || value.en.includes(brand)).map((brand) => `${path}: ${brand}`),
    );
    expect(leaks).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// C8 — the placeholders are a contract with the island.
// ---------------------------------------------------------------------------

const PLACEHOLDER = /\{([a-zA-Z]+)\}/g;

function placeholders(text: string): string[] {
  return sorted(new Set([...text.matchAll(PLACEHOLDER)].map((m) => m[1]!)));
}

function patternFor(path: string): string | undefined {
  return Object.keys(LEVEL_COPY_TEMPLATES).find((pattern) =>
    new RegExp(`^${pattern.replace(/\./g, "\\.").replace(/\*/g, "[^.]+")}$`).test(path),
  );
}

/** The same contract `format.ts#fill` enforces: every placeholder must be supplied. */
function fillStrict(template: string, vars: Record<string, string>): string {
  return template.replace(PLACEHOLDER, (_, name: string) => {
    if (!(name in vars)) throw new Error(`no value for {${name}}`);
    return vars[name]!;
  });
}

describe("C8 · templates", () => {
  const templated = LEAVES.filter(({ value }) => value.fr.includes("{") || value.en.includes("{"));

  it("finds the templates — otherwise the checks below prove nothing", () => {
    expect(templated.length).toBeGreaterThan(30);
  });

  it("uses the same placeholders in French and in English", () => {
    const mismatched = templated
      .filter(({ value }) => placeholders(value.fr).join() !== placeholders(value.en).join())
      .map(({ path, value }) => `${path}: fr {${placeholders(value.fr)}} en {${placeholders(value.en)}}`);
    expect(mismatched).toEqual([]);
  });

  it("puts a placeholder only where the contract declares one, and fills with exactly the declared names", () => {
    const problems: string[] = [];
    for (const { path, value } of templated) {
      const pattern = patternFor(path);
      if (!pattern) {
        problems.push(`${path}: not a declared template`);
        continue;
      }
      const vars = Object.fromEntries(LEVEL_COPY_TEMPLATES[pattern]!.map((name) => [name, "X"]));
      for (const locale of ["fr", "en"] as const) {
        try {
          const filled = fillStrict(value[locale], vars);
          if (/[{}]/.test(filled)) problems.push(`${path} ${locale}: a brace survives filling`);
        } catch (err) {
          problems.push(`${path} ${locale}: ${(err as Error).message}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });

  it("declares no template that the content does not have", () => {
    const paths = templated.map(({ path }) => path);
    const stale = Object.keys(LEVEL_COPY_TEMPLATES).filter((pattern) => !paths.some((path) => patternFor(path) === pattern));
    expect(stale).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// C10 — the decimal separator of the right language (La Bataille's « −1.0 Md€ »).
// ---------------------------------------------------------------------------

describe("C10 · decimal separators", () => {
  const FR_POINT = /\d\.\d/;
  /** A comma between digits that is not a thousands separator (followed by exactly three digits). */
  const EN_COMMA = /\d,(?!\d{3}(?!\d))\d/;

  it("has no decimal point in French and no decimal comma in English", () => {
    const offenders = LEAVES.flatMap(({ path, value }) => [
      ...(FR_POINT.test(value.fr) ? [`${path} fr: ${value.fr.slice(0, 60)}`] : []),
      ...(EN_COMMA.test(value.en) ? [`${path} en: ${value.en.slice(0, 60)}`] : []),
    ]);
    expect(offenders).toEqual([]);
  });

  it("tells a decimal from a thousands separator", () => {
    expect(EN_COMMA.test("€12,99")).toBe(true);
    expect(EN_COMMA.test("€68,500")).toBe(false);
    expect(FR_POINT.test("2.5 milliards")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// C11 — the prototype's French, word for word.
// ---------------------------------------------------------------------------

const PROTOTYPE = readFileSync(join(process.cwd(), "design/game/prototype-s-ils-reviennent.html"), "utf8");
const SCRIPT = PROTOTYPE.slice(PROTOTYPE.indexOf("<script>"), PROTOTYPE.lastIndexOf("</script>"));

/** NBSP is the repo's typography, not a word change (copy-typography.test.ts); whitespace runs collapse. */
const normalise = (text: string) => text.replace(/ /g, " ").replace(/\s+/g, " ").trim();

/**
 * Everything the prototype says, in two forms: the raw file (attribute values
 * such as `aria-label` live there) and the file with its tags removed (so a
 * sentence split by `<b>…</b>` reads as one). JavaScript's escaped
 * apostrophes are unescaped in both.
 */
const CORPUS = normalise(
  `${PROTOTYPE} ${PROTOTYPE.replace(/<\/?[a-zA-Z][^>]*>/g, " ")}`.replace(/\\'/g, "'"),
);

/** Evaluates one literal of the prototype's script. A local, trusted design file: this is a snapshot, not input. */
function literal<T>(name: string, closing: "]" | "}", scope: Record<string, unknown> = {}): T {
  const match = SCRIPT.match(new RegExp(`const ${name} = ([\\[{][\\s\\S]*?\\n  \\${closing});`));
  if (!match) throw new Error(`prototype literal ${name} not found`);
  const params = Object.keys(scope);
  return new Function(...params, `return (${match[1]});`)(...params.map((p) => scope[p])) as T;
}

type ProtoCard = { id: string; kind: "h" | "d"; name: string; pitch: string; official?: string; law?: string; cas?: string; tell?: string };
const PROTO_CARDS = literal<ProtoCard[]>("CARDS", "]");
const PROTO_ORDERS = literal<Record<string, string>>("ORDER_TEXT", "}");
/** The endings' text() functions, run with stubs that print the placeholder names the content uses. */
const PROTO_ENDINGS = literal<Record<string, { win: boolean; eyebrow: string; title: string; text: () => string }>>(
  "ENDINGS",
  "}",
  {
    fmtPct: (v: string) => `{${v}}`,
    fmtInt: (v: string) => `{${v}}`,
    Math: { round: (v: string) => `{${v}}` },
    S: { churn: "churn", subs: "subs", trust: "trust", radar: "radar", patience: "patience" },
  },
);
const PROTO_MONTHS = (SCRIPT.match(/const MONTHS = (\[[^\]]*\]);/)?.[1] ?? "[]").match(/'([^']+)'/g)!.map((s) => s.slice(1, -1));

/**
 * Where the French is NOT the prototype's, and why. Every path here carries a
 * « TODO: à relire » in the content module (convention 6); every path NOT
 * here is checked against the prototype below.
 */
const NOT_FROM_PROTOTYPE: Record<string, string> = {
  "timeline.*": "new — plan §1.3",
  "dashboard.patienceLow": "new — plan §2.6",
  "dashboard.hiddenValue": "new — plan §2.6",
  "dashboard.revealed": "new — plan §2.6",
  "dashboard.delta": "new — plan §1.3",
  "visio.ringing": "new — plan §1.3",
  "visio.pickUp": "new — plan §1.3",
  "visio.reread": "new — plan §1.3",
  "hand.chosen": "new — plan §2.6",
  "report.statusHit": "new — plan §2.6",
  "report.statusMissed": "new — plan §2.6",
  "report.effectsHeading": "new — plan §2.6",
  "report.mailHeader": "new — plan §2.6",
  "report.next": "new — plan §1.3",
  "report.toDecember": "new — plan §1.3",
  "journal.*": "new — plan §2.6 (GameJournal had no title key)",
  "clippings.*": "new — plan §2.6",
  "december.gameNumbers": "new — plan §2.7",
  "december.churnChart.reference": "new — plan §2.6",
  "december.trustChart.reference": "new — plan §2.6",
  "december.trustChart.caption": "R6",
  "december.trend": "new — plan §2.6 (a curve states its trend)",
  "december.dataToggle": "new — plan §3.6",
  "december.table.*": "new — plan §3.6",
  "catalogue.hiddenEffect": "R7",
  // A real brand or a law stated as fact: the prototype's wording was wrong,
  // and being faithful to it is not a reason to print it (review 2026-09-25).
  "patterns.bury.cas": "fact check — Basic-Fit's 2023 fine was about disclosure, not a cancellation path",
  "patterns.cascade.law": "legal check — DSA art. 25.2 excludes practices covered by the UCPD",
  "patterns.notice.cas": "fact check — Adobe's $150M is half penalty, half free services",
  "nextLevel.status": "R15",
  "footer.*": "R15",
  "tourLoop.*": "new — brief §13.3 D",
  "resume.*": "new — brief §9.5, plan §2.6",
  "a11y.*": "new — plan §3.5",
};

function exceptionFor(path: string): string | undefined {
  return Object.keys(NOT_FROM_PROTOTYPE).find((pattern) =>
    new RegExp(`^${pattern.replace(/\./g, "\\.").replace(/\*/g, ".+")}$`).test(path),
  );
}

/**
 * The clauses of a French string that must appear in the prototype. A
 * placeholder stands where the prototype concatenated a number, and the
 * prototype often built one sentence from several string pieces (« −N % de
 * résiliations ce trimestre » + « , l'effet monte encore »), so the check is
 * per clause: any changed word breaks its clause, any reordering inside a
 * clause too. Clauses shorter than four characters (a number, « sur ») carry
 * no wording to protect.
 */
function clausesOf(text: string): string[] {
  return normalise(text)
    .split(/\{[a-zA-Z]+\}|[,.:;!?«»·—()]+/)
    .map((clause) => clause.trim())
    .filter((clause) => clause.length >= 4);
}

function missingClauses(text: string): string[] {
  return clausesOf(text).filter((clause) => !CORPUS.includes(clause));
}

describe("C11 · the prototype's French, word for word", () => {
  it("reads the prototype — otherwise every comparison below proves nothing", () => {
    expect(PROTO_CARDS).toHaveLength(17);
    expect(Object.keys(PROTO_ORDERS)).toHaveLength(5);
    expect(Object.keys(PROTO_ENDINGS)).toHaveLength(7);
    expect(PROTO_MONTHS).toHaveLength(12);
    expect(CORPUS.length).toBeGreaterThan(20000);
  });

  it("keeps every card's name and pitch exactly", () => {
    for (const card of PROTO_CARDS) {
      const content = RETENTION_CONTENT.cards[card.id as keyof typeof RETENTION_CONTENT.cards];
      expect(normalise(content.name.fr), card.id).toBe(normalise(card.name));
      expect(normalise(content.pitch.fr), card.id).toBe(normalise(card.pitch));
    }
  });

  it("keeps every trick's catalogue entry exactly", () => {
    for (const card of PROTO_CARDS.filter((c) => c.kind === "d")) {
      const pattern = RETENTION_CONTENT.patterns[card.id as keyof typeof RETENTION_CONTENT.patterns];
      for (const field of ["official", "law", "cas", "tell"] as const) {
        if (exceptionFor(`patterns.${card.id}.${field}`)) continue;
        expect(normalise(pattern[field].fr), `${card.id}.${field}`).toBe(normalise(card[field]!));
      }
    }
  });

  it("keeps every order of the CEO exactly", () => {
    for (const [id, text] of Object.entries(PROTO_ORDERS)) {
      expect(normalise(RETENTION_CONTENT.orders[id as keyof typeof RETENTION_CONTENT.orders].fr), id).toBe(normalise(text));
    }
  });

  it("keeps every ending exactly, its numbers becoming the placeholders the island fills", () => {
    for (const [id, ending] of Object.entries(PROTO_ENDINGS)) {
      const content = RETENTION_CONTENT.endings[id as keyof typeof RETENTION_CONTENT.endings];
      expect(content.win, id).toBe(ending.win);
      expect(normalise(content.eyebrow.fr), id).toBe(normalise(ending.eyebrow));
      expect(normalise(content.title.fr), id).toBe(normalise(ending.title));
      expect(normalise(content.text.fr), id).toBe(normalise(ending.text()));
    }
  });

  it("keeps the level's lead paragraph — rendered from meta.ts — as the prototype wrote it", () => {
    // The one prototype string that lives outside this module since review
    // R8: the walk below does not reach it, so it is checked by name.
    expect(missingClauses(RETENTION_INTRO.lead.fr)).toEqual([]);
  });

  it("keeps the months exactly", () => {
    expect(RETENTION_CONTENT.months.map((m) => m.fr)).toEqual(PROTO_MONTHS);
  });

  it("keeps every other French string, clause by clause", () => {
    const checked = LEAVES.filter(({ path }) => !exceptionFor(path));
    expect(checked.length).toBeGreaterThan(200);
    const drifted = checked
      .map(({ path, value }) => ({ path, missing: missingClauses(value.fr) }))
      .filter(({ missing }) => missing.length > 0)
      .map(({ path, missing }) => `${path}: « ${missing.join(" » « ")} »`);
    expect(drifted).toEqual([]);
  });

  it("lists as corrected or new only paths that exist", () => {
    const stale = Object.keys(NOT_FROM_PROTOTYPE).filter(
      (pattern) => !LEAVES.some(({ path }) => exceptionFor(path) === pattern),
    );
    expect(stale).toEqual([]);
  });

  it("really corrects R6, R7 and R15 — a correction that still reads like the prototype corrected nothing", () => {
    const { december, catalogue, nextLevel, footer } = RETENTION_CONTENT;
    for (const corrected of [december.trustChart.caption, catalogue.hiddenEffect, nextLevel.status, footer.note]) {
      expect(missingClauses(corrected.fr).length, corrected.fr).toBeGreaterThan(0);
    }
    // R6: the viral thread fires at 35 or less (brief §5.8, point 6), and the legend says so.
    expect(december.trustChart.caption.fr).toContain("35");
    expect(december.trustChart.caption.en).toContain("35");
    // R7: the hidden effect applies once, when the card is picked.
    expect(catalogue.hiddenEffect.fr).not.toContain("par trimestre");
    expect(catalogue.hiddenEffect.fr).toContain("une seule fois");
    // R15 and P19: the footer says these are game numbers, and no longer calls itself a prototype.
    expect(footer.note.fr).toContain("chiffres du jeu");
    expect(footer.note.en).toContain("game numbers");
    expect(normalise(`${footer.note.fr} ${nextLevel.status.fr}`)).not.toMatch(/prototype/i);
  });

  it("would catch a changed word — the clause check is not vacuous", () => {
    expect(missingClauses(RETENTION_CONTENT.boss.t1.fr)).toEqual([]);
    expect(missingClauses(RETENTION_CONTENT.boss.t1.fr.replace("direct", "franc"))).not.toEqual([]);
  });
});
