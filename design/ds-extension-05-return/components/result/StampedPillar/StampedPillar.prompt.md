StampedPillar — the roast's stamp, as extension 05 redraws it (proposed name: `StageStamp`).

In a roast, the weakest stage leaves the score sheet as a stamp: "RETENTION
· 8/20 · DEAD LAST", inked across its row of `StageScores`, in AARRR order.
The second-lowest takes `StageScore tone="alert"`.

It is an **inked rubber stamp**: red ink on a red wash, a 3px solid edge
(`--border-width-stamp`, the system's inked mark), soft 4px corners, and a
degree askew. It is not a red-filled pill. A solid red fill is the primary
action, and on a result the primary action is the one button that counts.
Wash plus solid red edge is a diagnosis, and that is what the stamp says.

The score and its total stay in the stamp's text, so the row still reads
"Retention 8/20 dead last". The stamp has no meter: it is a verdict, not a
reading.

## Never

- Never outside a roast. Never more than one. Never on any element but this
  one: do not rotate anything else to match it.
- Never the red fill (`--surface-accent`) again.

```jsx
<StageScores>
  <StageScore stage="Acquisition" score={18}>{t("acquisition")}</StageScore>
  <StageScore stage="Activation" score={12} tone="alert">{t("activation", "alert")}</StageScore>
  <StampedPillar pillar="Retention" score={8} suffix="dead last" />
  <StageScore stage="Referral" score={16}>{t("referral")}</StageScore>
  <StageScore stage="Revenue" score={20}>{t("revenue")}</StageScore>
</StageScores>
```
