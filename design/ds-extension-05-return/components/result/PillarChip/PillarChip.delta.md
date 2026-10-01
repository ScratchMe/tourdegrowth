# PillarChip — retired by extension 05

`PillarChip` is replaced by `StageScore`, inside a `StageScores` list
(`components/result/StageScore/`, `components/result/StageScores/`).

| PillarChip | StageScore |
|---|---|
| `pillar` | `stage` |
| `score`, `total` | `score`, `total`, unchanged |
| `weak` | `tone="alert"` (the S-16 vocabulary: `alert` is the red of a diagnosis) |
| `size="md" \| "sm"` | on the list: `StageScores size="md" \| "sm"` |
| `stretch` | gone. Every row fills its sheet, and the subgrid gives every meter the same track |
| `children` (the `?`) | `children`, unchanged |
| a `<span>` | an `<li>` in an `<ol>` |
| (the landing wrapped each chip in a link) | `href` + `linkLabel`: the stage name is the link |

Port order: the result (`/r/<id>`, `/r/sample`), the landing's preview, then
the stories (`Chips`, `Stretch`, `Small` → `StageScore` / `StageScores`;
`GlossaryTerm`'s `InPillarChips` → `InStageScores`). Remove `PillarChip` and
its CSS once nothing imports it. The rule "Pillar-and-score is `PillarChip`"
in the system README becomes "A stage and its score is `StageScore`, five
of them a `StageScores`".
