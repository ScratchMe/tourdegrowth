/**
 * The appendix, cut into pages — design audit S-8 (CHANTIERS.md A2.1,
 * 2026-09-29).
 *
 * Nothing on a slide is set under 18px, and a table that does not hold at
 * 18px becomes two slides, never smaller type (Antoine, 2026-09-29). The
 * appendix lists every number of the engine, and a row grows with the team's
 * own definition (up to 200 characters, TEXT_LIMITS.definitionNote): at 18px
 * one page holds about eleven plain rows, and the §6.0 example has seventeen.
 * Until then the table took a 15px « dense » step past twelve rows.
 *
 * The cut is the model's, before anything renders: the slides and their
 * numbers are decided once, and the screen, the PDF, the PNG and the text
 * export all read them. So each row's height is ESTIMATED here, by wrapping
 * its cells' words at the widths `.annex` gives its columns in
 * deck.module.css, with glyph widths on the generous side: the estimate errs
 * towards a row being taller than it is. A page cut too early keeps some
 * room; one cut too late would run under the footer.
 * e2e/engine-deck.spec.ts measures the rendered pages — the §6.0 example and
 * the worst case, every definition at its limit — in both languages, and
 * annex-pages.test.ts checks these widths against the stylesheet.
 *
 * The pages are then evened out: the fewest pages that hold, each as close
 * to the same height as the rows allow, so a second page is never a lone
 * straggler row.
 */

/** A row of the appendix, as `buildAnnex` finishes it (lib/engine/deck.ts). */
export interface AnnexCells {
  label: string;
  formula: string;
  definition: string;
  window: string;
  period: string;
  source: string;
  status: string;
  confidence: string;
}

/** The share of the table's width each column takes — `.annex thead th:nth-child(n)` in deck.module.css. */
export const ANNEX_COLUMNS = {
  label: 0.17,
  formula: 0.35,
  window: 0.08,
  period: 0.11,
  source: 0.11,
  status: 0.08,
  confidence: 0.1,
} as const satisfies Record<Exclude<keyof AnnexCells, "definition">, number>;

/** A slide is 1920px wide with 120px of padding each side (`.slide`). */
const TABLE_WIDTH = 1920 - 2 * 120;
/** `.annex th, .annex td { padding: 8px 12px }`, and the hairline under each row. */
const CELL_PADDING_X = 24;
const CELL_PADDING_Y = 16 + 1;
/** --slide-table: 18px at a line height of 1.35. */
const LINE_HEIGHT = 18 * 1.35;
/** `.annexDefinition { margin-top: 4px }`. */
const DEFINITION_GAP = 4;
/**
 * Inter at 18px, per glyph, on the generous side: its lower case averages
 * about 8.6px and its capitals and figures about 11px. The row's label is
 * semibold, a little wider. A space is where a line may break; a no-break
 * space (« 5 000 € », « « Et si » ») is not, so it counts as a glyph.
 */
const GLYPH = 9.6;
const GLYPH_SEMIBOLD = 10.2;
const SPACE = 5;

/**
 * The room the rows have on one page: from under the header row to the top
 * of the footer, measured on the rendered appendix (a one-line title, the
 * header on one line): 596px. Less a margin, for what an estimate cannot see.
 */
export const ANNEX_PAGE_HEIGHT = 560;

/** A group's heading row in the hybrid's appendix: one line of the table's type, its padding and its rule. */
export const ANNEX_GROUP_HEIGHT = CELL_PADDING_Y + LINE_HEIGHT;

/** How many lines a cell's text takes at a width, wrapping at spaces only (and inside a word too long for the line: `overflow-wrap: anywhere`). */
export function wrappedLines(text: string, width: number, glyph = GLYPH): number {
  const words = text.split(/[ \t\n]+/).filter(Boolean);
  // An empty cell prints « — »: one line.
  if (words.length === 0) return 1;
  let lines = 1;
  let used = 0;
  for (const word of words) {
    const w = [...word].length * glyph;
    if (w > width) {
      if (used > 0) lines++;
      lines += Math.ceil(w / width) - 1;
      used = w - (Math.ceil(w / width) - 1) * width;
      continue;
    }
    const next = used === 0 ? w : used + SPACE + w;
    if (next > width) {
      lines++;
      used = w;
    } else {
      used = next;
    }
  }
  return lines;
}

const inner = (column: keyof typeof ANNEX_COLUMNS) => ANNEX_COLUMNS[column] * TABLE_WIDTH - CELL_PADDING_X;

/** A row's estimated height in slide pixels: its tallest cell, the formula carrying the definition under it. */
export function annexRowHeight(row: AnnexCells): number {
  const formula = wrappedLines(row.formula, inner("formula")) + (row.definition ? wrappedLines(row.definition, inner("formula")) : 0);
  const tallest = Math.max(
    wrappedLines(row.label, inner("label"), GLYPH_SEMIBOLD),
    formula,
    wrappedLines(row.window, inner("window")),
    wrappedLines(row.period, inner("period")),
    wrappedLines(row.source, inner("source")),
    wrappedLines(row.status, inner("status")),
    wrappedLines(row.confidence, inner("confidence")),
  );
  return CELL_PADDING_Y + tallest * LINE_HEIGHT + (row.definition ? DEFINITION_GAP : 0);
}

/**
 * The rows, in order, cut into the fewest pages that each hold within
 * `pageHeight`, as even as the rows allow (the tallest page as short as it
 * can be). A row taller than a page — none can be today — gets a page of its
 * own rather than being dropped.
 */
export function annexPages<T extends AnnexCells>(rows: readonly T[], pageHeight = ANNEX_PAGE_HEIGHT): T[][] {
  if (rows.length === 0) return [[]];
  // The hybrid's rows carry their group (« Libre-service », « Assisté », « Liaison », §18.8.2): a heading row
  // opens each group, and each page restates the group it starts in — room taken from the rows.
  const groupOf = (row: T) => (row as T & { group?: string }).group;
  const grouped = rows.some((row) => groupOf(row) !== undefined);
  const heights = rows.map((row, i) => annexRowHeight(row) + (grouped && i > 0 && groupOf(rows[i - 1]!) !== groupOf(row) ? ANNEX_GROUP_HEIGHT : 0));
  if (grouped) pageHeight -= ANNEX_GROUP_HEIGHT;

  // The fewest pages: fill each one until the next row would not hold.
  let fewest = 1;
  let used = 0;
  for (const h of heights) {
    if (used > 0 && used + h > pageHeight) {
      fewest++;
      used = 0;
    }
    used += h;
  }
  if (fewest === 1) return [rows.slice()];

  // Then the same number of pages, evened out: `best[j][i]` is the tallest
  // page when the first `i` rows are cut into `j` pages, minimised.
  const n = rows.length;
  const prefix = [0];
  for (const h of heights) prefix.push(prefix[prefix.length - 1]! + h);
  const sum = (from: number, to: number) => prefix[to]! - prefix[from]!;
  const best: number[][] = Array.from({ length: fewest + 1 }, () => Array<number>(n + 1).fill(Infinity));
  const cut: number[][] = Array.from({ length: fewest + 1 }, () => Array<number>(n + 1).fill(0));
  best[0]![0] = 0;
  for (let j = 1; j <= fewest; j++) {
    for (let i = j; i <= n; i++) {
      for (let k = j - 1; k < i; k++) {
        const tallest = Math.max(best[j - 1]![k]!, sum(k, i));
        // `<`: on a tie the earlier cut wins, so the first page is the fuller one.
        if (tallest < best[j]![i]!) {
          best[j]![i] = tallest;
          cut[j]![i] = k;
        }
      }
    }
  }
  const pages: T[][] = [];
  let end = n;
  for (let j = fewest; j >= 1; j--) {
    const start = cut[j]![end]!;
    pages.unshift(rows.slice(start, end));
    end = start;
  }
  return pages;
}
