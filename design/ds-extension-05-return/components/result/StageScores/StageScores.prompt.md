StageScores — design system extension 05. The five stage scores as one score sheet.

An ordered list in AARRR order. Its rows are `StageScore`s, and in a roast
one `StampedPillar` takes the weakest stage's place. It is drawn the way the
system draws readings, like `DataTable`: one solid rule on top, a dashed
hairline between rows, and no box around the whole. It is the route
profile's table, so it sits right under `StageProfile`, in the same column.

- **One object, not five**: one sheet instead of five chips. At 48px a row
  (44px on a phone and on the landing), five rows take 240px on the result,
  against about 305px for the five chips.
- **One column at every width.** No two-up grid on a phone: the row is a
  single line that fits 320px, and five rows never leave a sixth cell empty.
- **Sizes**: `md` on the result, which shrinks below 760px by itself
  (CSS only, rendered on the server). `sm` on the landing's preview, at every
  width.
- **Rows never closer than 44px.** The `?` disc and the landing's link strip
  of two neighbouring rows touch and never overlap
  (`e2e/targets.spec.ts`).
- Give it `label` ("Score per stage, out of 20" / « Score par étape, sur 20 »)
  when no heading names it.

## Never

- Never inside a raised card on the result: the score card is the one loud
  thing. On the landing it sits inside the hero card, which is that screen's
  loud thing already.
- Never a second sheet of the same five on one screen.

```jsx
<StageProfile stages={profile} title="Route profile" legend="height = points missing out of 20" flag="HC" />
<StageScores label="Score per stage, out of 20">
  <StageScore stage="Acquisition" score={18}>{trigger("acquisition")}</StageScore>
  <StageScore stage="Activation" score={12}>{trigger("activation")}</StageScore>
  <StageScore stage="Retention" score={8} tone="alert">{trigger("retention", "alert")}</StageScore>
  <StageScore stage="Referral" score={16}>{trigger("referral")}</StageScore>
  <StageScore stage="Revenue" score={20}>{trigger("revenue")}</StageScore>
</StageScores>
```
