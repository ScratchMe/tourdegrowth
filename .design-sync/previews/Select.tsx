import * as React from "react";
import { Select } from "tour-de-growth";

/*
 * A closed list past three values, always the NATIVE <select>: keyboard,
 * type-to-find, screen readers and the phone's own picker come for free, and
 * the platform's chevron is the one glyph the system does not draw. A still
 * shows it closed: the `<optgroup>` heading and the order of the list are
 * only seen once it is opened, so each story's comment says what is inside.
 *
 * Every story is one real call site, with its props. The engine's strings
 * come from `src/content/engine-copy.ts` and the metric catalogue, resolved
 * the way the page resolves them; the source lists are the output of
 * `sourceOptions` (`_engine/sources.ts`) run on the activation rate's shape;
 * the audit's are inline in `app/(app)/admin/audit/` and its `labels.ts` —
 * French only, the tool is.
 */

type SourceValue = `tool:${string}` | "person" | "other";

/**
 * `sourceOptions(shapeOf("act.rate"), strings)`, English: the tools this
 * number usually comes from, « someone gave it to me » and « other », then
 * every other tool under its heading — offered, not hidden.
 */
const SOURCES_EN = [
  { value: "tool:amplitude", label: "Amplitude" },
  { value: "tool:mixpanel", label: "Mixpanel" },
  { value: "tool:ga4", label: "GA4" },
  { value: "tool:posthog", label: "PostHog" },
  { value: "person", label: "Someone gave it to me" },
  { value: "other", label: "Other" },
  {
    label: "Other tools",
    options: [
      { value: "tool:stripe", label: "Stripe" },
      { value: "tool:chargebee", label: "Chargebee" },
      { value: "tool:chartmogul", label: "ChartMogul" },
      { value: "tool:hubspot", label: "HubSpot" },
      { value: "tool:salesforce", label: "Salesforce" },
      { value: "tool:google-ads", label: "Google Ads" },
      { value: "tool:meta-ads", label: "Meta Ads" },
      { value: "tool:linkedin-ads", label: "LinkedIn Ads" },
      { value: "tool:app-store-connect", label: "App Store Connect" },
      { value: "tool:play-console", label: "Google Play Console" },
      { value: "tool:product-db", label: "Product database" },
      { value: "tool:spreadsheet", label: "Spreadsheet" },
    ],
  },
] as const;

/** The same list, French. */
const SOURCES_FR = [
  { value: "tool:amplitude", label: "Amplitude" },
  { value: "tool:mixpanel", label: "Mixpanel" },
  { value: "tool:ga4", label: "GA4" },
  { value: "tool:posthog", label: "PostHog" },
  { value: "person", label: "Quelqu'un me l'a donné" },
  { value: "other", label: "Autre" },
  {
    label: "Autres outils",
    options: [
      { value: "tool:stripe", label: "Stripe" },
      { value: "tool:chargebee", label: "Chargebee" },
      { value: "tool:chartmogul", label: "ChartMogul" },
      { value: "tool:hubspot", label: "HubSpot" },
      { value: "tool:salesforce", label: "Salesforce" },
      { value: "tool:google-ads", label: "Google Ads" },
      { value: "tool:meta-ads", label: "Meta Ads" },
      { value: "tool:linkedin-ads", label: "LinkedIn Ads" },
      { value: "tool:app-store-connect", label: "App Store Connect" },
      { value: "tool:play-console", label: "Google Play Console" },
      { value: "tool:product-db", label: "Base produit" },
      { value: "tool:spreadsheet", label: "Tableur" },
    ],
  },
] as const;

const CURRENCIES = (["EUR", "USD", "GBP", "CHF"] as const).map((c) => ({ value: c, label: c }));

function Live<V extends string>(props: { initial: V | "" } & Omit<React.ComponentProps<typeof Select<V>>, "value" | "onChange">) {
  const { initial, ...rest } = props;
  const [value, setValue] = React.useState<V | "">(initial);
  return <Select<V> {...rest} value={value} onChange={setValue} />;
}

/**
 * The metric sheet's « where does it come from? » (`_engine/ValueEditor.tsx`,
 * `sm`), before anything is chosen: `placeholder` adds « Choose… » as an
 * empty first option that stays choosable — a source nobody picked is not
 * the first tool in the list.
 */
export const NotChosen = () => (
  <div style={{ maxWidth: 480 }}>
    <Live<SourceValue> initial="" size="sm" label="Where does it come from?" placeholder="Choose…" options={SOURCES_EN} />
  </div>
);

/**
 * The same field in French, with the source the filled-in example gives its
 * activation rate (`lib/engine/example.ts`): Amplitude, the first of the
 * usual tools.
 */
export const Chosen = () => (
  <div style={{ maxWidth: 480 }}>
    <Live<SourceValue> initial="tool:amplitude" size="sm" label={"D'où vient ce chiffre ?"} placeholder="Choisir…" options={SOURCES_FR} />
  </div>
);

/**
 * After « Save » with no source (`ValueEditor.tsx`, `error={need("source")}`):
 * the sheet names what the save still needs under the field itself, in the
 * words of its label. Only after a save was tried — never while filling in.
 */
export const Invalid = () => (
  <div style={{ maxWidth: 480 }}>
    <Live<SourceValue>
      initial=""
      size="sm"
      label="Where does it come from?"
      placeholder="Choose…"
      options={SOURCES_EN}
      error="To save, still missing: Where does it come from?"
    />
  </div>
);

/**
 * The setup card's currency (`_engine/Setup.tsx`), in both languages: a
 * three-letter code gets a box its size (`fit="content"`), not the column's.
 * `md`, as every field of that one-question card; no placeholder — the
 * engine starts in EUR.
 */
export const Currency = () => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 40 }}>
    <Live initial="EUR" label="Currency" fit="content" options={CURRENCIES} />
    <Live initial="EUR" label="Devise" fit="content" options={CURRENCIES} />
  </div>
);

/**
 * The slides' « What you're asking for » (`_engine/deck/AskForm.tsx`, `sm`),
 * as the filled-in example opens it. Here the placeholder is an answer, not
 * a prompt: with « No deadline » the slide's goal simply carries no quarter,
 * with « None » the slide has no goal line — and either can be chosen again
 * later. The horizon offers the eight quarters after the
 * example's August 2026 (`horizonOptions`, Q3 2026 to Q2 2028); the success
 * metric is the one the diagnosis names, activation (`suggestedSuccess`),
 * out of the six rates a diagnosis can name.
 */
export const PlaceholderIsAnAnswer = () => (
  <div style={{ display: "grid", gap: 18, maxWidth: 480 }}>
    <Live
      initial=""
      size="sm"
      label="By"
      placeholder="No deadline"
      options={[
        { value: "2026-3", label: "Q3 2026" },
        { value: "2026-4", label: "Q4 2026" },
        { value: "2027-1", label: "Q1 2027" },
        { value: "2027-2", label: "Q2 2027" },
        { value: "2027-3", label: "Q3 2027" },
        { value: "2027-4", label: "Q4 2027" },
        { value: "2028-1", label: "Q1 2028" },
        { value: "2028-2", label: "Q2 2028" },
      ]}
    />
    <Live
      initial="act.rate"
      size="sm"
      label="How we'll know"
      placeholder="None"
      options={[
        { value: "acq.signup-rate", label: "Sign-up rate" },
        { value: "act.rate", label: "Activation rate" },
        { value: "ret.d30", label: "Day-30 retention" },
        { value: "rev.paid-conversion", label: "Paid conversion" },
        { value: "ref.referred-share", label: "Referred sign-up share" },
        { value: "ret.logo-churn", label: "Monthly logo churn" },
      ]}
    />
  </div>
);

/**
 * The audit's row status (`app/(app)/admin/audit/RowEditor.tsx`, `sm`), on a
 * line nobody has examined yet: nothing is pre-selected, « pas encore
 * examinée » is a value of the list while the line has no status — and
 * leaves it once a status is chosen, since a status never goes back to
 * empty. The hint says why. Six statuses behind it (« Hors profil » is set by the
 * catalogue, never chosen by hand, so it is not offered).
 */
export const NotYetExamined = () => (
  <div style={{ maxWidth: 480 }}>
    <Live
      initial=""
      size="sm"
      label="Statut"
      hint={"Rien n'est présélectionné : une ligne pas encore examinée est « en attente », jamais absente."}
      placeholder="— pas encore examinée —"
      options={[
        { value: "measured", label: "Mesuré" },
        { value: "estimated", label: "Estimé" },
        { value: "reported-without-definition", label: "Communiqué sans définition" },
        { value: "contested", label: "Contesté (deux chiffres divergents)" },
        { value: "absent", label: "L'entreprise ne l'a pas" },
        { value: "not-accessible", label: "Pas accessible (mon accès)" },
      ]}
    />
  </div>
);
