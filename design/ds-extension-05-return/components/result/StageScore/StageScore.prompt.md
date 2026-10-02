StageScore — design system extension 05. One stage's score, as a row of the score sheet.

"18/20 Acquisition ?" — the five sit in a `StageScores` list, AARRR order,
under the route profile (`StageProfile`), whose table they are. It replaces
`PillarChip`. It is a **value, not an action**: there is no box around it
and no button radius. It has no edge all the way round and no hover. You read
it as you read a line of a score sheet.

## How a row reads

- **The score first**: the figure at 600 in body ink, its `/20` in the row's
  ink. The figure is set right in tabular figures, so 8/20 sits under 18/20.
  The figure and its total always print, and the text is the whole reading
  for a screen reader ("18/20 Acquisition").
- **The meter** runs between score and name: the score's share of its total.
  Every row's track starts at the same x and has the same length (the list is
  the grid, each row a subgrid), so the five bars compare. It repeats the
  number, so it is hidden from assistive technology.
- **The name**, then, right after it, the one thing to touch: the stage's
  `?` (`GlossaryTerm`, passed as `children`).

## The stage that stalls

`tone="alert"` puts a red wash across the row and a solid 3px red rule down
its start edge. That is a diagnosis in this system: a wash or a solid red
edge. The figure, the `/20`, the name and the meter turn red, the name at
600, and the `?` takes `tone="alert"`. Never dashed: dashed red is advice,
and `PriorityMove`, the next action, is on the same screen.

Which rows are red follows `Bottleneck`'s `sharpness`, so the sheet always
agrees with the route profile above it:

- `clear`: one row (the profile flags one stage).
- `level`: no row (the profile flags nothing).
- `shared`: the profile flags every tied stage. Today the chips mark one at
  most, so the sheet and the profile disagree. Extension 05 recommends that
  the tied rows all take `alert`. This is Antoine's decision; until it is
  taken, mark one row.

## Two uses, one look

- **The result**: the name is text, the `?` is the action. The box no longer
  promises anything; the `?` is the only edge on the row that has one.
- **The landing's preview**: the stage name *is* the link to its glossary
  page (`href`), underlined in the row's ink, with a 44px strip of taps and
  no `?`. That way the link works without JavaScript. Give it `linkLabel`
  ("Acquisition — definition" / « Acquisition — définition »). That label
  contains the visible name and says where the link goes. The score is read
  as part of the row, not of the link.

## Never

- Never a box, a radius, or an edge all round the row. Never a hover on the
  row. Never make the whole row the link.
- Never `--text-link` red on the stage name. On this sheet, red belongs to the
  diagnosis.
- Never a `?` and an `href` on the same row: one action per row.
- Never a bare figure. Never the meter without the figure. Never a meter scale
  fitted to the data.
- Never a row outside a `StageScores` list.

## Examples

### The result

```jsx
<StageScores label="Score per stage, out of 20">
  {stages.map((s) => (
    <StageScore key={s.id} stage={s.label} score={s.score} tone={s.id === weakest ? "alert" : "neutral"}>
      <GlossaryTerm id={s.id} locale="en" openId={open} onOpenChange={setOpen}
        tone={s.id === weakest ? "alert" : "muted"}
        closeLabel="Close" labelTemplate="Definition: {term}" moreLabel="Learn more →" />
    </StageScore>
  ))}
</StageScores>
```

### The landing's preview

```jsx
<StageScores size="sm" label="Score par étape, sur 20">
  {stages.map((s) => (
    <StageScore key={s.id} stage={s.label} score={s.score}
      tone={s.id === weakest ? "alert" : "neutral"}
      href={`/fr/glossary/${s.id}`} linkLabel={`${s.label} — définition`} />
  ))}
</StageScores>
```
