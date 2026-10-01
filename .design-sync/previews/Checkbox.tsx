import * as React from "react";
import { Checkbox, Field } from "tour-de-growth";

/*
 * Yes / no with its sentence: a drawn 20px square on a native checkbox, the
 * radio ring's family. No tick glyph, never the platform's box. One stands on
 * its own row; rows that follow each other are split by the dashed rule —
 * never cards — and a list that is one question is a Field `group` whose
 * legend asks it.
 *
 * Every story is one real call site, with its props. The engine's strings
 * come from `src/content/engine-copy.ts` and the metric catalogue, resolved
 * the way the page resolves them; the audit's are inline in
 * `app/(app)/admin/audit/` — French only, the tool is.
 */

const Live = (props: { initial: boolean } & Omit<React.ComponentProps<typeof Checkbox>, "checked" | "onChange">) => {
  const { initial, ...rest } = props;
  const [checked, setChecked] = React.useState(initial);
  return <Checkbox {...rest} checked={checked} onChange={setChecked} />;
};

/**
 * The setup card's Tour box (`_engine/Setup.tsx`), ticked: a new engine
 * offers the link to the Tour found on this device. On the card, the
 * sentence saying which Tour sits under the box as a paragraph of its own,
 * not as the box's hint.
 */
export const Checked = () => <Live initial label="Compare with that Tour" />;

/**
 * A new audit mission (`app/(app)/admin/audit/NewMissionForm.tsx`): showing a
 * score to a leadership team is decided per mission, so the box starts
 * unticked — a product decision, not a convenience.
 */
export const Unchecked = () => <Live initial={false} label="Montrer le score du Tour dans le livrable" />;

/**
 * The slides' settings (`_engine/deck/DeckView.tsx`), for an engine with a
 * company name and a linked Tour: three plain rows under the panel's own
 * heading (« Réglages des slides », not drawn here), split by the dashed
 * rule. The name and the credit start ticked;
 * the « declared × measured » slide starts left out, and its hint says when
 * to put it in.
 */
export const SettingsRows = () => (
  <div style={{ maxWidth: 480 }}>
    <Live initial label={"Nom de l'entreprise sur les slides"} />
    <Live initial label="Mention tourdegrowth.com" />
    <Live
      initial={false}
      label={"Slide « Déclaré × mesuré »"}
      hint={"Le Tour est une auto-évaluation : à montrer seulement si l'écart est ton argument."}
    />
  </div>
);

/**
 * The engine's settings, « How you sell » (`_engine/Setup.tsx`, A7.3.c): two
 * boxes in a Field group, at least one ticked. With self-serve the only one
 * ticked, its box is disabled and says why under its sentence
 * (`disabledReason`, `strings.settings.motionLast`) — a reason of its own,
 * unlike the list at its limit below, where the group's hint is the reason.
 * Each box stands in its own block, spaced rather than split by the dashed
 * rule, because a ticked motion unfolds its own windows under it (two
 * Segmented, left out of this card) — as `Screens.module.css` lays them out.
 */
export const LastMotion = () => (
  <div style={{ maxWidth: 560 }}>
    <Field group label="How you sell" hint="Both? Tick both: you get two engines and their total, never one against the other.">
      {({ describedBy }) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <div>
            <Checkbox
              label="Self-serve (PLG): customers sign up and pay on their own"
              checked
              onChange={() => undefined}
              disabled
              disabledReason="You need at least one way you sell."
              describedBy={describedBy}
            />
          </div>
          <div>
            <Live initial={false} label="Sales-assisted (SLG): a sales team signs the contracts" describedBy={describedBy} />
          </div>
        </div>
      )}
    </Field>
  </div>
);

type MeasureRow = { id: string; name: string; repair: string };

/** The ask form's « what to measure first » (`_engine/deck/AskForm.tsx`), as a Field group of rows. */
function MeasureFirst(props: { label: string; hint: string; rows: MeasureRow[]; checked: string[] }) {
  const [picked, setPicked] = React.useState<string[]>(props.checked);
  // Three at most: past that, the unticked boxes wait (AskForm's `disabled={!checked && full}`).
  const full = picked.length >= 3;
  return (
    <div style={{ maxWidth: 480 }}>
      <Field group size="sm" label={props.label} hint={props.hint}>
        {props.rows.map((row) => {
          const on = picked.includes(row.id);
          return (
            <Checkbox
              key={row.id}
              label={row.name}
              hint={row.repair}
              checked={on}
              disabled={!on && full}
              onChange={() => setPicked((prev) => (on ? prev.filter((id) => id !== row.id) : [...prev, row.id]))}
            />
          );
        })}
      </Field>
    </div>
  );
}

/**
 * The filled-in example's slides: its three missing numbers
 * (`missingByRepairCost`), cheapest to repair first, each with that cost as
 * its hint, all three ticked by the form's defaults (`askDefaults`).
 */
export const List = () => (
  <MeasureFirst
    label="What to measure first"
    hint="Three at most. The cheapest to fix are checked first."
    checked={["ret.churn-cause", "rev.gross-margin", "ret.d30"]}
    rows={[
      { id: "ret.churn-cause", name: "Main churn cause", repair: "a meeting" },
      { id: "rev.gross-margin", name: "Gross margin", repair: "a meeting" },
      { id: "ret.d30", name: "Day-30 retention", repair: "a sprint" },
    ]}
  />
);

/**
 * The same list in French, with a fourth number the team can't find (the
 * example, plus the viral coefficient marked « on ne le mesure pas », whose
 * proposed repair is a sprint). Three are ticked, so the fourth box waits,
 * dashed: the box carries no reason of its own — the group's hint, « trois au
 * plus », is the reason. Untick one and it frees.
 */
export const DisabledAtTheLimit = () => (
  <MeasureFirst
    label={"Ce qu'il faut d'abord mesurer"}
    hint={"Trois au plus. Les moins chers à réparer sont cochés d'abord."}
    checked={["ret.churn-cause", "rev.gross-margin", "ret.d30"]}
    rows={[
      { id: "ret.churn-cause", name: "Cause principale de churn", repair: "une réunion" },
      { id: "rev.gross-margin", name: "Marge brute", repair: "une réunion" },
      { id: "ret.d30", name: "Rétention à J30", repair: "un sprint" },
      { id: "ref.k-factor", name: "Coefficient viral (K)", repair: "un sprint" },
    ]}
  />
);
