# MrrCurve — extension 10 delta

*The synced component (components/engine/MrrCurve, 2026-10-04) changes by
two optional props and their rules. Nothing it does today changes: with
neither prop, it draws exactly as now.*

## Why

Question 8. A marketplace's money levers re-price the whole base from the
next month: on demand, the order frequency, the average order value and the
take rate apply to every active buyer; on supply, the subscription price to
every paid seller. The what-if curve therefore **jumps at month 1** — a
steeper first segment than any other — where a SaaS curve bends smoothly.
Unexplained, the jump reads as an error or as a promise of a first month
that won't come. It needs a mark on the curve and a sentence under it.

## The props

```ts
interface MrrCurveProps {
  // … unchanged …
  /** Extension 10: the what-ifs include a money lever, which applies to
   *  every unit from next month. A ring on the what-if line at month 1. */
  step?: boolean;
  /** Extension 10: one line under the plot (and its keys). With `step`, it
   *  starts with the same ring as the plot's: the mark, said in words. */
  note?: React.ReactNode;
}
```

## The markup

- In the SVG, after the what-if line and before the start dot:
  `<circle class="MrrCurve_step" cx={x(1)} cy={y(mid(whatif[1]))} r={6} />`
  (`r={9}` on `medium="slide"`). Only when `whatif && step`.
- After the legend (if any), before the visually hidden summary:
  `<p class="MrrCurve_note MrrCurve_noteStep">{note}</p>`
  (`MrrCurve_noteStep` only with `step`).
- The `summary` (screen reader) is the board's, unchanged; the note is real
  text, read in order.

## The rules (`MrrCurve.delta.css`, added to `MrrCurve.module.css`)

- `.MrrCurve_step`: the card's paper inside, the what-if line's ink and a
  stamp-width ring (`--market-step-ring`): a ring, not a dot, because the
  line's own dots mean "here it ends".
- `.MrrCurve_note`: `--meta-sm`, `--text-body`, at most `--measure-read`;
  `.MrrCurve_noteStep::before` draws the same ring at text size.
- `.MrrCurve_slide .MrrCurve_note`: `--slide-meta`, a larger ring.

## The words (COPY.md, `curve.step.demand`)

« Mois 1 : la commission passe à 13 % sur chaque commande dès le mois
prochain — ~2 700 € de revenu net en plus par mois sur les seuls acheteurs
d'aujourd'hui. » The amount is the re-pricing of today's base (active
buyers × frequency × order value × the take rate's change), two significant
digits. Supply's price lever would say the same with its words (not in the
example: the brief's supply what-if is the conversion, which does not jump).

## Not changed

Its colours, line widths, keys, legend, start label, ticks, hatch, range
band: as synced. No red (a projection is never red): the ring is ink.
