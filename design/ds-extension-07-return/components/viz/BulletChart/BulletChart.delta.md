# BulletChart — delta (design system extension 07)

**Why.** Brief 07, Q9: the reference strip, the range with its caveat, the
target box and "below the target" become one object, `HowItCompares`. Its
chart is a BulletChart — value as the bar, the team's target as the red
tick — plus the one thing BulletChart cannot draw today: the **published
range**. Drawing a second strip beside it would be the "three objects" the
brief asks us to merge.

## Props: two changes, both backwards compatible

```ts
export interface BulletChartProps {
  /** NEW: may be null — a number with a target and a reference but no
   *  figure yet (the screen before the value is typed). No bar is drawn. */
  value: number | null;
  /** unchanged */
  target: number;
  /** unchanged */
  domain: readonly [number, number];
  /** NEW, optional: the published range [low, high], drawn as a bracket
   *  UNDER the track — never on it, so the bar never hides it and it never
   *  reads as a second value. It situates; it never designates (C1): no
   *  red, no tag, ever. Say it in `ariaLabel` too ("Reference 2–5%"). */
  band?: readonly [number, number];
  ariaLabel: string;
  size?: "md" | "sm";
  className?: string;
  "data-testid"?: string;
}
```

## Markup

When `band` is set, after `.BulletChart_track`:

```html
<div class="BulletChart_bandRow">
  <span class="BulletChart_band" style="left: 20%; width: 30%"></span>
</div>
```

`left` and `width` are percentages of `domain`, clamped to 0–100, as the bar
and the tick already are.

## CSS

`BulletChart.delta.css` (this folder): `.BulletChart_bandRow`,
`.BulletChart_band`. New tokens `--viz-band-edge` (2px solid `--viz-axis`)
and `--viz-band-height` (6px), in `tokens/engine.css`.

## Contrast

The bracket is `--viz-axis` (`--ink-1`, #5b5346) on the card
(`--paper-0`): **7.20:1** — past the 3:1 a graphical mark needs. It sits on
the card's ground, not on the track, so nothing else is next to it.

## Usage rule to add to BulletChart.prompt.md

> `band` is for a published reference only. Never draw a team's target as a
> band (it is the tick), and never colour the band: a reference situates, it
> never names a stage.
