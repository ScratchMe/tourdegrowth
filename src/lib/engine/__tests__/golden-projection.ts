import type { ListStage, RowStatus } from "@/app/[locale]/aarrr-funnel-template/_engine/number-list";
import type { LeverId } from "../types";

/**
 * What the complete engine adds to « Et si » (§19.3, A14 T3), and the goldens'
 * projection drops — the golden rule allows it for a field that is ADDED,
 * never for what a v1 or v2 build printed:
 *
 * - two levers: day-30 retention in self-serve, the referred share of
 *   opportunities in sales-assisted. A v1 or v2 engine gets them, a slider
 *   where it has the number, none where it doesn't;
 * - the sales-assisted scenario's opportunities (`opps`), today and
 *   projected, which the slide read from the link alone before.
 *
 * No slide, no title, no text of a v1 or v2 engine moves: a target on these
 * levers didn't exist before them.
 */
export const LEVERS_ADDED_BY_A14_T3: readonly LeverId[] = ["ret.d30", "slg.ref.referred-share"];

interface ScenarioLike {
  levers: { id: LeverId }[];
  today: Record<string, unknown>;
  projected: Record<string, unknown>;
}

/** The scenario as a v2 build derived it: without the levers A14 T3 adds, nor the opportunities. In place, on a JSON copy. */
export function asBeforeT3(scenario: unknown, slg: boolean): number {
  if (!scenario) return 0;
  const s = scenario as ScenarioLike;
  const before = s.levers.length;
  s.levers = s.levers.filter((l) => !LEVERS_ADDED_BY_A14_T3.includes(l.id));
  if (slg) {
    delete s.today.opps;
    delete s.projected.opps;
  }
  return before - s.levers.length;
}

/**
 * The money A20 adds to « Et si » (engine spec §20, `money.ts`), which the
 * goldens' projection drops — fields ADDED to each motion's figures, today
 * and projected, beside the ones a v1 or v2 build printed. Those keep
 * matching to the character, the MRR in twelve months above all: it is now
 * the last point of `mrrPath`, computed with the same operations.
 */
export const KPIS_ADDED_BY_A20 = ["arr", "arr12", "mrrPath", "ltvCac", "lifetime", "monthlyMargin", "afterPayback", "loss", "spend", "cash", "warning"] as const;

/** The scenario's figures without A20's, in place, on a JSON copy. Self-serve keeps its figures under `kpis`, sales-assisted at the top. Returns how many fields it dropped. */
export function asBeforeA20(scenario: unknown): number {
  if (!scenario) return 0;
  const s = scenario as { today: Record<string, unknown>; projected: Record<string, unknown> };
  let dropped = 0;
  for (const side of [s.today, s.projected]) {
    const kpis = (side.kpis ?? side) as Record<string, unknown>;
    for (const key of KPIS_ADDED_BY_A20) {
      if (key in kpis) dropped++;
      delete kpis[key];
    }
  }
  return dropped;
}

/**
 * The board's stage tabs as v1 and v2 builds printed them, from the list that
 * replaced them (« Tes chiffres », C41, A18 T2.b). The list says the same
 * things — one mark per number, ★ first, found out of those that apply, the
 * stage the diagnosis names — so the goldens keep holding them: this is the
 * old shape rebuilt from the new, nothing added, nothing dropped.
 */
export function asTabs(stages: readonly ListStage[]) {
  const KIND: Record<RowStatus, string> = { found: "found", est: "approximate", asked: "inProgress", todo: "inProgress", cant: "missing", na: "notApplicable" };
  return stages.map((s) => ({
    stage: s.stage,
    marks: s.rows.map((r) => ({ id: r.id, kind: KIND[r.status] })),
    found: s.found,
    applicable: s.applicable,
    named: s.holdsBack,
  }));
}

/**
 * Where the step-by-step resumed (`resumePosition`), which the goldens froze
 * with the rest. A18 T3.b folded the step-by-step into the board, and the
 * function went with it. It was never something a v1 or v2 engine printed —
 * no board, no slide, no text says it, only where a screen landed — so the
 * expected side drops it: the one field retired, not changed. Its successor,
 * the board's next step (`nextStepFor`, `continueFrom`), is pinned by its
 * own tests. On a JSON copy: the golden file is never touched.
 */
export function withoutResume(expected: unknown): unknown {
  const copy = JSON.parse(JSON.stringify(expected)) as Record<string, Record<string, unknown>>;
  for (const reading of Object.values(copy)) delete reading.resume;
  return copy;
}

/**
 * The words Antoine decided at bon à tirer nº9 (A18.d, 2026-10-03), which a v2
 * build printed the old way. The golden rule allows a slide's text to move
 * only by a decision, and this is the decision, written as what it changes:
 *
 * - « motion » becomes « moteur » on the slides and their notes too (option
 *   1), masculine agreement included (« chacun », « aucun des deux ») ; the
 *   side-by-side slide's foot takes the screens' sentence (`twoEngines`);
 * - the link takes the return 07's sentence (« {n} opportunités sont venues
 *   du libre-service »), its three months still in parentheses.
 *
 * Applied to the EXPECTED side, on a JSON copy: the golden file is never
 * touched, and every other character a v2 build printed still has to match.
 * Fragments, not whole sentences, so a French no-break space before « : » is
 * never retyped.
 */
const DECIDED_WORDS: readonly [RegExp, string][] = [
  [/Deux motions, deux segments/g, "Deux moteurs, deux segments"],
  [/chacune se lit contre ses cibles/g, "chacun se lit contre ses cibles"],
  [/Two motions, two segments/g, "Two engines, two segments"],
  [/dans la motion qui a signé/g, "dans le moteur qui a signé"],
  [/in the motion that signed/g, "in the engine that signed"],
  [/dans la seule motion qui a signé/g, "dans le seul moteur qui a signé"],
  [/in the one motion that signed/g, "in the one engine that signed"],
  [/reprise dans les deux motions/g, "reprise dans les deux moteurs"],
  [/used for both motions/g, "used for both engines"],
  [/dans aucune des deux motions/g, "dans aucun des deux moteurs"],
  [/for either motion\b/g, "for either engine"],
  [/Les deux motions vendent/g, "Les deux moteurs vendent"],
  [/The two motions sell/g, "The two engines sell"],
  [/la marge par motion/g, "la marge par moteur"],
  [/the margin by motion/g, "the margin by engine"],
  [/(\S+) des \S+ opportunités assistées viennent de comptes du libre-service \(/g, "$1 opportunités sont venues du libre-service ("],
  [/(\S+) des \S+ opportunités assistées vient d'un compte du libre-service \(/g, "$1 opportunité est venue du libre-service ("],
  [/(\S+) of the \S+ sales-assisted opportunities come from self-serve accounts \(/g, "$1 opportunities came from self-serve ("],
  [/(\S+) of the \S+ sales-assisted opportunities comes from a self-serve account \(/g, "$1 opportunity came from self-serve ("],
];

export function withDecidedWords(expected: unknown): unknown {
  const rewrite = (v: unknown): unknown => {
    if (typeof v === "string") return DECIDED_WORDS.reduce((t, [from, to]) => t.replace(from, to), v);
    if (Array.isArray(v)) return v.map(rewrite);
    if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, rewrite(x)]));
    return v;
  };
  return rewrite(JSON.parse(JSON.stringify(expected)));
}

/**
 * The what-if slides of design system extension 09 (A20.d T4.b), which the
 * return of brief 09 redrew and Antoine had ported (prompt F, « porte-le »):
 *
 * - ADDED, dropped from the side a build prints now: each what-if slide's
 *   curve and the « together » slide's compounding drawn (`curve`,
 *   `leverSum`, drawings no text carries), and three rows of their table —
 *   the ARR in twelve months, the LTV:CAC, the cash tied up;
 * - RETIRED, dropped from the golden's side, on a JSON copy: the new MRR of
 *   the month and the GRR, which left the slide's table for them (the panel
 *   keeps both). Their markdown lines go with them, as the export wrote
 *   them (`- {label} · {text}`).
 *
 * Every other row, every title, every word of the what-if slides still has
 * to match to the character.
 */
export const WHATIF_ROWS_ADDED_BY_A20 = ["arr12", "ltvCac", "cash"] as const;
export const WHATIF_ROWS_RETIRED_BY_A20 = ["newMrr", "grr"] as const;

type SlideLike = { id: string; lines: Record<string, string>[]; curve?: unknown; leverSum?: unknown; paybackChart?: unknown; paybackCharts?: unknown };
const isWhatIf = (id: string) => id.startsWith("whatif:") || id === "scenario" || id === "slg:scenario";
const kpiIn = (ids: readonly string[]) => (line: Record<string, string>) => line.row === "kpi" && ids.includes(line.id ?? "");

/**
 * The unit-economics slide of design system extension 09 (A20.d T4.c), which
 * the return of brief 09 redrew and Antoine had ported:
 *
 * - ADDED, dropped from the side a build prints now: the picture
 *   (`paybackChart`, a drawing no text carries), the context line under a
 *   known LTV:CAC (« repère couramment cité : environ 3 pour 1 »), and five
 *   rows — the months after payback, the cash tied up, the GRR and NRR in one
 *   line, the long-payback warning, what the cash assumes;
 * - RETIRED, dropped from the golden's side: the GRR and NRR tiles, which
 *   that one line replaced. Their markdown lines go with them.
 *
 * The title moves only with a certain loss (C48), and the slide with it, to
 * nº 2: none of the goldens' engines has one, so every title, every other
 * row and the slides' order still have to match to the character.
 */
export const UNIT_ROWS_ADDED_BY_A20 = ["after", "cash", "retention", "warning", "assume"] as const;
export const UNIT_ROWS_RETIRED_BY_A20 = ["grr", "nrr"] as const;

/**
 * The hybrid's unit economics (A20.d T4.d): the two engines side by side, as
 * the return of brief 09 draws them (`slide-unit-both`).
 *
 * - ADDED, dropped from the side a build prints now: each engine's tiles
 *   (rows tagged with their `motion`), its picture (`paybackCharts`), its
 *   warning, and the note under both (`assume`);
 * - RETIRED, dropped from the golden's side: the five rows of two cells
 *   (`unitRow`: the CAC, the payback, the basket, the customers lost in a
 *   year, the LTV:CAC), which the columns replace — the LTV and the cash
 *   take the basket's and the year's places, the note keeps GRR, NRR and the
 *   renewal. Their markdown lines go with them.
 *
 * The footer stays to the character; the title moves only with a certain loss
 * (C48), which none of the goldens' hybrids has.
 */
export const UNIT_BOTH_ROW_RETIRED_BY_A20 = "unitRow";
const rowIn = (ids: readonly string[]) => (line: Record<string, string>) => ids.includes(line.row ?? "");

/** The deck a build prints now, without what A20.d T4.b adds to its what-if slides and T4.c to its unit economics. On a JSON copy. */
export function deckBeforeA20<T>(deck: T): T {
  const copy = JSON.parse(JSON.stringify(deck)) as { slides: SlideLike[] };
  for (const slide of copy.slides) {
    if (slide.id === "unit-economics") {
      delete slide.paybackChart;
      delete slide.paybackCharts;
      slide.lines = slide.lines
        // The hybrid's tiles carry their engine; a single engine's rows don't.
        .filter((line) => !line.motion)
        .filter((line) => !rowIn(UNIT_ROWS_ADDED_BY_A20)(line))
        .map((line) => (line.row === "ltvCac" && line.value ? { ...line, note: "", text: line.value } : line));
      continue;
    }
    if (!isWhatIf(slide.id)) continue;
    delete slide.curve;
    delete slide.leverSum;
    slide.lines = slide.lines.filter((line) => !kpiIn(WHATIF_ROWS_ADDED_BY_A20)(line));
  }
  return copy as T;
}

/** The golden's readings without the rows the what-if slides and the unit economics retired, in its deck and its markdown. On a JSON copy. */
export function withoutRetiredWhatIfRows(expected: unknown): unknown {
  // One reading per locale: { fr: { deck, markdown, … }, en: { … } }.
  const copy = JSON.parse(JSON.stringify(expected)) as Record<string, { deck?: { slides: SlideLike[] }; markdown?: string }>;
  for (const out of Object.values(copy)) {
    if (!out?.deck || typeof out.markdown !== "string") continue;
    const gone = new Set<string>();
    for (const slide of out.deck.slides) {
      if (slide.id === "unit-economics") {
        const retired = rowIn([...UNIT_ROWS_RETIRED_BY_A20, UNIT_BOTH_ROW_RETIRED_BY_A20]);
        for (const line of slide.lines.filter(retired)) gone.add(`- ${line.label} · ${line.text}`);
        slide.lines = slide.lines.filter((line) => !retired(line));
        continue;
      }
      if (!isWhatIf(slide.id)) continue;
      for (const line of slide.lines.filter(kpiIn(WHATIF_ROWS_RETIRED_BY_A20))) gone.add(`- ${line.label} · ${line.text}`);
      slide.lines = slide.lines.filter((line) => !kpiIn(WHATIF_ROWS_RETIRED_BY_A20)(line));
    }
    out.markdown = out.markdown
      .split("\n")
      .filter((l) => !gone.has(l))
      .join("\n");
  }
  return copy;
}
