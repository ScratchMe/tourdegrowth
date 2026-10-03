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
export const KPIS_ADDED_BY_A20 = ["arr", "arr12", "mrrPath", "ltvCac", "lifetime", "afterPayback", "loss", "cash"] as const;

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
