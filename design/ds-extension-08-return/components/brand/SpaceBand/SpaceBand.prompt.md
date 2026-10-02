SpaceBand — design system extension 08. The band is unchanged; its race is
now its own export, `SpaceRace`, drawn twice by SiteHeader: in the band
(variant "band", today's) and in the compact line (variant "compact").

## What changed, and only this

1. **`SpaceRace` is exported** from SpaceBand.js. `SpaceBand` renders
   `<SpaceRace variant="band">`, with the same markup as today's race.
2. **`variant="compact"`**, for SiteHeader only:
   - `nav.SpaceBand_race.SpaceBand_raceCompact[data-space]` — same
     `aria-label` as the band's race ("Le Tour en trois parties" / "The
     Tour in three parts"); SiteHeader keeps only one of the two exposed
     at a time.
   - The current leg: pictogram, number and short name, filled with the
     space's colour (`--space-*-bg` / `--space-*-text`; the Tour's
     pictogram in `--space-tour-mark`), with an ink edge so the ochre pill
     holds 3:1 against the paper.
   - The other legs: their number in a 28px outlined pill, the name in a
     visually hidden span. A closed leg: greyed (`--text-muted`), dashed
     (`--border-soft`), « bientôt » for screen readers, never a link.
   - Links get `tabIndex={-1}`; clicks are tracked with the source
     `space_band_compact` (today's `space_band` stays for the band).
   - 16px between pills (`--space-7`): each 28px pill reaches 44px through
     its hit strip, 8px out on each side, so the targets abut and never
     overlap.
   - Hover: `--mark-hover-bg` behind the number (the band's hover was an
     underline on the name, which the numbers do not have).
3. **The band's container-query rules are scoped to `.SpaceBand_inner`.**
   Today they read `@container (max-width: 900px) { .SpaceBand_label {…} }`:
   unscoped, they would also hit the compact race, which sits in the
   header row's container. Same rules, same results in the band.

## Rules

- The race is a map of three legs: always three pills, in order, this one
  filled. Never drop a leg to save room; drop its name, then the current
  leg's pictogram (SiteHeader.css does this below a 640px and a 560px line).
- `linked={false}` on the quiz and the Deep dive: every pill a span.
- Never a link to a closed leg, in either variant.

## Seen while doing this (not changed)

- `.SpaceBand_inner { padding-block: 7px }` sits inside
  `@container (max-width: 560px)` on `.SpaceBand_inner` itself, which is the
  container: an element cannot query its own container, so the rule never
  applies. Harmless today (the band is 46px either way); delete it, or move
  it to a child, when the band is next touched.
- Under a 560px band (a phone upright, a phone on its side at 568px), the
  race's three number pills are 28px wide 4px apart: their 44px hit strips
  overlap, so each target measures 32px across. Fixing it (16px apart, as
  in the compact race) would change the phone-upright header, which this
  brief keeps as it is — so it is left for the next band brief.
