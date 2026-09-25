/**
 * The visuals' door to the engine's number formatting.
 *
 * P5 built the visuals before the pure engine's `format.ts` existed and
 * shipped a stub here with the same signatures; integration replaced its
 * body with this re-export, so the board, the slides and the text export
 * print every figure through ONE function per kind of number (engine spec
 * §6.2). Kept as a file rather than repointing every import so the visuals
 * keep a single place to reach formatting from.
 */
export { formatInterval, formatMoney, formatNumber, formatPercent, joinList } from "@/lib/engine/format";
