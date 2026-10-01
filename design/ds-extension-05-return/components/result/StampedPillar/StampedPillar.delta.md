# StampedPillar — what extension 05 changes

| | Was | Now | Why |
|---|---|---|---|
| Fill | `--surface-accent` (the primary action's red) | `--surface-alert` (the wash) | A red fill is the primary action. A stamp is a diagnosis |
| Text | `--text-inverse` (paper on red) | `--text-alert` | Red ink, as a stamp is inked |
| Edge | none | 3px solid `--border-alert` (`--border-width-stamp`) | The system's own inked mark over an edge |
| Radius | `--radius-tag` (a pill) | `--radius-stamp` (4px) | A rubber stamp, not a tag |
| Type | `--meta-sm` 600 | the same, uppercase, `--meta-tracking` | A stamp is set in capitals |
| Tilt | `rotate: -1deg` | `--stamp-tilt` (−1deg) | Unchanged, now a token |
| Element | a `<span>` placed in the chips' grid | an `<li>`, a row of `StageScores` | It takes the weakest stage's row in the sheet |
| Text read | "Retention 9/20 dead last" | the same, with the spaces as text nodes | The flex row ignores them; a screen reader needs them |

The props are unchanged. The proposed rename to `StageStamp` (Q7) can come
later, in the same family move as `PillarChip → StageScore`.

`StampedPillar.css` and `StampedPillar.js` in this folder are the reference.
Lines that changed are marked ◆.

Contrast: the text on the wash is 5.28 on paper and 5.56 at night. The edge
measures 3.57 against the page and 4.42 against a card on paper, and 4.04
against the page and 3.76 against a card at night.
