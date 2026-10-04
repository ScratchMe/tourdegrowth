import * as React from "react";
import { Choices } from "tour-de-growth";

/*
 * Pick one of a handful, as cards: a real radio group under its visible
 * question, native radios drawn with AnswerOption's ring, the inverse fill
 * once chosen. Not AnswerOption generalised — that one moves the quiz on after
 * a tap; Choices waits for a save. Nothing is chosen for the person.
 *
 * Every story is one of the growth engine's radio lists, with its props:
 * `sm` on a number's screen and in the slides' form, `md` (the default) for
 * the engine's first questions — the settings card's type of company, and
 * the start screen's « how do you sell » inside `EngineStart`. The props are
 * captured from the call sites (paths under
 * `src/app/[locale]/aarrr-funnel-template/`) run on the engine's fixtures
 * (`src/lib/engine/__tests__/fixtures.ts`) with the copy of
 * `src/content/engine-copy.ts` and the catalogue, resolved the way the page
 * resolves them.
 */

function Live<V extends string>(props: { initial: V | null } & Omit<React.ComponentProps<typeof Choices<V>>, "value" | "onChange">) {
  const { initial, ...rest } = props;
  const [value, setValue] = React.useState<V | null>(initial);
  return <Choices<V> {...rest} value={value} onChange={setValue} />;
}

/**
 * A number whose answer is a choice (`_engine/ValueEditor.tsx`, `kind: "choice"`): the
 * referral mechanism, in English, before anything is picked (`emptyState()`). The legend is
 * the number's own name and the 3 answers are its catalogue's (`ref.mechanism`); nothing is
 * pre-selected. (The sheet's « where are you with this number » question is no longer a radio
 * list since A18: it is `AnswerSwitch`.)
 */
export const Empty = () => (
  <div style={{ maxWidth: 640 }}>
    <Live
      initial={null}
      size="sm"
      legend={"Referral mechanism"}
      options={[
        { value: "none", label: "None" },
        { value: "communication", label: "In communication only" },
        { value: "product", label: "In the product" },
      ]}
    />
  </div>
);

/**
 * « Je ne le trouve pas », on the gross margin of the example without its margin
 * (`noMarginState()`: missing, no access, a meeting to fix — the page's example has had an
 * estimated margin since C50), in French (`_engine/MissingTriage.tsx`): « Pourquoi ? »
 * answered « no access », one option per row because the answers are sentences, then the
 * repair cost the answer proposes (`proposedRepair`: a meeting), two by two. 5 answers here:
 * « ça ne s'applique pas à nous » is only offered where the catalogue has a reason for it, and
 * the gross margin has none.
 */
export const Chosen = () => (
  <div style={{ display: "grid", gap: 26, maxWidth: 640 }}>
    <Live
      initial="no-access"
      size="sm"
      legend={"Pourquoi ?"}
      options={[
        { value: "not-tracked", label: "On ne le mesure pas" },
        { value: "not-computed", label: "Ça existe, mais personne ne l'a calculé" },
        { value: "no-access", label: "Ça existe, mais je n'y ai pas accès" },
        { value: "no-definition", label: "Personne n'est d'accord sur la définition" },
        { value: "conflicting", label: "J'ai deux chiffres qui ne collent pas" },
      ]}
    />
    <Live
      initial="meeting"
      size="sm"
      columns={2}
      legend={"Le réparer prendrait"}
      options={[
        { value: "meeting", label: "une réunion" },
        { value: "afternoon", label: "une après-midi" },
        { value: "sprint", label: "un sprint" },
        { value: "quarter", label: "un trimestre" },
      ]}
    />
  </div>
);

/**
 * « I can estimate it », bounds typed and saved without a basis (`MetricSheet.tsx`,
 * `error={need("basis")}`), on the paid conversion of an empty engine: the message names what
 * the save still needs, in the words of the legend, under the group — the edge of no option
 * turns. Only after a save was tried.
 */
export const Invalid = () => (
  <div style={{ maxWidth: 640 }}>
    <Live
      initial={null}
      size="sm"
      columns={2}
      legend={"What is the estimate based on?"}
      error={"To save, still missing: What is the estimate based on?"}
      options={[
        { value: "team-hunch", label: "Team hunch" },
        { value: "old-number", label: "An old number" },
        { value: "sample", label: "A sample" },
        { value: "other", label: "Other" },
      ]}
    />
  </div>
);

/**
 * The settings card's type of company (`_engine/Setup.tsx`, since A7.3.c), at the default `md`
 * — the size of the engine's first questions (the start screen's « How do you sell? », inside
 * `EngineStart`, is the other). B2B SaaS is the only type open; the two others are shown, not
 * hidden, so a consumer app learns why the numbers below won't fit it yet: dashed, their
 * reason (`disabledNote`) at full contrast, never faded. « Later », never « Coming soon » (C25
 * Q16). How the company sells — self-serve, sales-assisted, or both — is not a choice here: it
 * is two checkboxes under this list (Checkbox, `LastMotion`).
 */
export const DisabledWithAReason = () => (
  <div style={{ maxWidth: 496 }}>
    <Live
      initial="b2b-saas"
      legend={"Your type of company"}
      options={[
        { value: "b2b-saas", label: "B2B SaaS" },
        { value: "consumer-app", label: "Consumer app", disabled: true, disabledNote: "Later: their funnel has a different shape." },
        { value: "marketplace", label: "Marketplace", disabled: true, disabledNote: "Later: their funnel has a different shape." },
      ]}
    />
  </div>
);

/**
 * The slides' « what it costs » (`_engine/deck/AskForm.tsx`), in French, as the form opens on
 * the example: « pas encore chiffré ». Three options, and still Choices rather than a
 * Segmented: in French the three measured 367px in one track, inside a 342px card at 390px —
 * rows of radios stay in their column at every width.
 */
export const InsteadOfASegmented = () => (
  <div style={{ maxWidth: 480 }}>
    <Live
      initial="none"
      size="sm"
      legend={"Ce que ça coûte"}
      options={[
        { value: "none", label: "Pas encore chiffré" },
        { value: "money", label: "Un montant" },
        { value: "team", label: "Une équipe" },
      ]}
    />
  </div>
);
