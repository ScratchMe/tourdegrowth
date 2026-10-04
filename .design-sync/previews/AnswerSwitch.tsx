import * as React from "react";
import { AnswerSwitch, Button, Checkbox, Choices, DefinitionTrigger, FieldRow, NumberField, Select, TextField } from "tour-de-growth";

/*
 * The value is the question, and the three other answers sit one tap under it
 * (design system extension 07, A18 T1): the boxes first, then « Pas de chiffre
 * sous la main ? » — estimate, ask, or say it can't be found. Choosing one
 * swaps the boxes for its editor, with « ← J'ai le chiffre, finalement »
 * above it; the three are toggle buttons (`aria-pressed`), never radios.
 *
 * Every prop is the product's own: the switch `MetricSheet`
 * (app/[locale]/aarrr-funnel-template/_engine/MetricSheet.tsx) builds, rendered
 * on the engine's fixtures with the resolved copy, at its first paint. The
 * entry decides what opens: a saved estimate opens on its editor, a request on
 * « Je le demande », a number that can't be found on its triage. The boxes and
 * editors are the form primitives `ValueEditor`, `MissingTriage` and
 * `RequestCopy` render; the island's wrappers (`Sheet.module.css`) are
 * inlined as styles. Each box keeps its value in a local `Live*` wrapper;
 * `onAnswer`, `onBack` and the saves are left out. Width: the sheet's body.
 */

const LiveNumber = ({ initial, ...rest }: { initial: number | null } & Omit<React.ComponentProps<typeof NumberField>, "value" | "onChange">) => {
  const [value, setValue] = React.useState<number | null>(initial);
  return <NumberField {...rest} value={value} onChange={setValue} />;
};

function LiveSelect<V extends string>({ initial, ...rest }: { initial: V | "" } & Omit<React.ComponentProps<typeof Select<V>>, "value" | "onChange">) {
  const [value, setValue] = React.useState<V | "">(initial);
  return <Select<V> {...rest} value={value} onChange={setValue} />;
}

function LiveChoices<V extends string>({ initial, ...rest }: { initial: V | null } & Omit<React.ComponentProps<typeof Choices<V>>, "value" | "onChange">) {
  const [value, setValue] = React.useState<V | null>(initial);
  return <Choices<V> {...rest} value={value} onChange={setValue} />;
}

const LiveCheckbox = ({ initial, ...rest }: { initial: boolean } & Omit<React.ComponentProps<typeof Checkbox>, "checked" | "onChange">) => {
  const [checked, setChecked] = React.useState(initial);
  return <Checkbox {...rest} checked={checked} onChange={setChecked} />;
};

const LiveText = ({ initial, ...rest }: { initial: string } & Omit<React.ComponentProps<typeof TextField>, "value" | "onChange">) => {
  const [value, setValue] = React.useState(initial);
  return <TextField {...rest} value={value} onChange={setValue} />;
};

/**
 * Nothing answered yet, in French: the sign-up rate of a fresh engine (`emptyState()`'s
 * shape). The boxes are the question — « Inscrits en août 2026 » sur « Visiteurs uniques en
 * août 2026 », both empty, never 0 — with the shared-count line and « Je n'ai que le taux »;
 * under the rule, « Pas de chiffre sous la main ? » and the three other answers, none pressed:
 * nothing is chosen for the person. No source box yet: it is asked once a value is typed.
 */
export const Untouched = () => (
  <div style={{ maxWidth: 658 }}>
    <AnswerSwitch
      legend={"Pas de chiffre sous la main ?"}
      options={[
        { value: "estimate", label: "Je peux l'estimer" },
        { value: "ask", label: "Je le demande" },
        { value: "cant", label: "Je ne le trouve pas" },
      ]}
      value={<div
        style={{ display: "flex", flexDirection: "column", gap: "var(--form-gap-sm)", minWidth: "0" }}
      >
        <FieldRow joiner="sur">
          <LiveNumber
            size="sm"
            id="untouched-acq-signup-rate-num"
            label={"Inscrits en août 2026"}
            initial={null}
            locale="fr"
            integer
            parseError={"Un nombre entier : on compte des personnes."}
          />
          <LiveNumber
            size="sm"
            id="untouched-acq-signup-rate-den"
            label={"Visiteurs uniques en août 2026"}
            initial={null}
            locale="fr"
            integer
            parseError={"Un nombre entier : on compte des personnes."}
          />
        </FieldRow>
        <p style={{ font: "var(--field-hint)", color: "var(--text-muted)", margin: "0" }}>
          {"Même nombre que pour part du premier canal : le modifier ici le modifie partout."}
        </p>
        <Button variant="quiet" size="sm" style={{ alignSelf: "flex-start" }}>
          {"Je n'ai que le taux"}
        </Button>
      </div>}
      backLabel={"← J'ai le chiffre, finalement"}
      legendId="untouched-acq-signup-rate-answers"
    />
  </div>
);

/**
 * « I have it », in English: the example's CAC, an amount over a count — €21,000 of
 * acquisition spend out of 42 new paying customers, the line under them computing €500, then «
 * I only have the amount », where the value comes from (« Someone gave it to me », then who:
 * Finance), the denominator's own source left unticked, and what is counted (« Media only »).
 * No other answer pressed.
 */
export const HaveIt = () => (
  <div style={{ maxWidth: 658 }}>
    <AnswerSwitch
      legend={"No figure to hand?"}
      options={[
        { value: "estimate", label: "I can estimate it" },
        { value: "ask", label: "I'll ask for it" },
        { value: "cant", label: "I can't find it" },
      ]}
      value={<div
        style={{ display: "flex", flexDirection: "column", gap: "var(--form-gap-sm)", minWidth: "0" }}
      >
        <FieldRow joiner="out of">
          <LiveNumber
            size="sm"
            id="have-acq-cac-num"
            label="Acquisition spend in August 2026"
            initial={21000}
            locale="en"
            prefix={"€"}
            unitName="euros"
            parseError="Type a number, such as 1,250 or 18.5."
          />
          <LiveNumber
            size="sm"
            id="have-acq-cac-den"
            label="New paying customers in August 2026"
            initial={42}
            locale="en"
            integer
            parseError="A whole number: these are people."
          />
        </FieldRow>
        <p
          style={{ font: "var(--meta-md)", color: "var(--text-body)", margin: "0" }}
          aria-live="polite"
        >
          {"€500"}
        </p>
        <Button variant="quiet" size="sm" style={{ alignSelf: "flex-start" }}>
          {"I only have the amount"}
        </Button>
        <LiveSelect
          size="sm"
          id="have-acq-cac-source"
          label={"Where does it come from?"}
          initial={"person"}
          placeholder={"Choose…"}
          options={[
            { value: "tool:google-ads", label: "Google Ads" },
            { value: "tool:meta-ads", label: "Meta Ads" },
            { value: "tool:linkedin-ads", label: "LinkedIn Ads" },
            { value: "tool:stripe", label: "Stripe" },
            { value: "tool:chargebee", label: "Chargebee" },
            { value: "person", label: "Someone gave it to me" },
            { value: "other", label: "Other" },
            {
              label: "Other tools",
              options: [
                { value: "tool:ga4", label: "GA4" },
                { value: "tool:mixpanel", label: "Mixpanel" },
                { value: "tool:amplitude", label: "Amplitude" },
                { value: "tool:posthog", label: "PostHog" },
                { value: "tool:chartmogul", label: "ChartMogul" },
                { value: "tool:hubspot", label: "HubSpot" },
                { value: "tool:salesforce", label: "Salesforce" },
                { value: "tool:pipedrive", label: "Pipedrive" },
                { value: "tool:app-store-connect", label: "App Store Connect" },
                { value: "tool:play-console", label: "Google Play Console" },
                { value: "tool:product-db", label: "Product database" },
                { value: "tool:spreadsheet", label: "Spreadsheet" },
                {
                  value: "tool:cs-platform",
                  label: "Customer success platform (Gainsight, Vitally, Planhat…)",
                },
              ],
            },
          ]}
        />
        <LiveSelect
          size="sm"
          id="have-acq-cac-source-role"
          label={"Who gave it to you?"}
          initial={"finance"}
          options={[
            { value: "finance", label: "Finance" },
            { value: "data", label: "Data" },
            { value: "product", label: "Product" },
            { value: "marketing", label: "Marketing" },
            { value: "revops", label: "RevOps" },
            { value: "support", label: "Support" },
            { value: "sales", label: "Sales" },
            { value: "customer-success", label: "Customer success" },
          ]}
        />
        <LiveCheckbox
          id="have-acq-cac-split-source"
          label="The denominator comes from another tool"
          initial={false}
        />
        <LiveChoices
          size="sm"
          id="have-acq-cac-variant"
          legend={"What's counted"}
          initial={"media-only"}
          options={[
            { value: "media-only", label: "Media only" },
            { value: "plus-team", label: "+ marketing team" },
            { value: "fully-loaded", label: "Fully loaded" },
          ]}
        />
      </div>}
      backLabel={"← I have the figure after all"}
      legendId="have-acq-cac-answers"
    />
  </div>
);

/**
 * « Je peux l'estimer » pressed, in French: the example's paid conversion, estimated at 6 to 9
 * % from an old number. The editor replaces the boxes — « ← J'ai le chiffre, finalement »
 * first, then « Au moins » / « Au plus » (a pair with no joiner) and what the estimate rests
 * on, two by two. The boxes stay passed (`value`), off screen while an answer is chosen.
 */
export const Estimate = () => (
  <div style={{ maxWidth: 658 }}>
    <AnswerSwitch
      legend={"Pas de chiffre sous la main ?"}
      options={[
        { value: "estimate", label: "Je peux l'estimer" },
        { value: "ask", label: "Je le demande" },
        { value: "cant", label: "Je ne le trouve pas" },
      ]}
      answer="estimate"
      value={<div
        style={{ display: "flex", flexDirection: "column", gap: "var(--form-gap-sm)", minWidth: "0" }}
      >
        <FieldRow joiner="sur">
          <LiveNumber
            size="sm"
            id="estimate-rev-paid-conversion-num"
            label={"Payants sous 30 jours"}
            initial={null}
            locale="fr"
            integer
            parseError={"Un nombre entier : on compte des personnes."}
          />
          <LiveNumber
            size="sm"
            id="estimate-rev-paid-conversion-den"
            label="Inscrits en juillet 2026"
            hint={<span>
              {"Prends les inscrits en juillet 2026 : ceux inscrits en août 2026 n'ont pas encore eu 30 jours."}
              <span style={{ display: "inline", marginInlineStart: "var(--space-2)" }}>
                <DefinitionTrigger term="cohorte" label={"Définition : cohorte"} />
              </span>
            </span>}
            initial={800}
            locale="fr"
            integer
            parseError={"Un nombre entier : on compte des personnes."}
          />
        </FieldRow>
        <p style={{ font: "var(--field-hint)", color: "var(--text-muted)", margin: "0" }}>
          {"Même nombre que pour taux d'activation, rétention à J30, part des inscrits recommandés et coefficient viral (K) : le modifier ici le modifie partout."}
        </p>
        <Button variant="quiet" size="sm" style={{ alignSelf: "flex-start" }}>
          {"Je n'ai que le taux"}
        </Button>
        <LiveSelect
          size="sm"
          id="estimate-rev-paid-conversion-source"
          label={"D'où vient ce chiffre ?"}
          initial={""}
          placeholder={"Choisir…"}
          options={[
            { value: "tool:product-db", label: "Base produit" },
            { value: "tool:stripe", label: "Stripe" },
            { value: "tool:chargebee", label: "Chargebee" },
            { value: "tool:hubspot", label: "HubSpot" },
            { value: "tool:salesforce", label: "Salesforce" },
            { value: "person", label: "Quelqu'un me l'a donné" },
            { value: "other", label: "Autre" },
            {
              label: "Autres outils",
              options: [
                { value: "tool:ga4", label: "GA4" },
                { value: "tool:mixpanel", label: "Mixpanel" },
                { value: "tool:amplitude", label: "Amplitude" },
                { value: "tool:posthog", label: "PostHog" },
                { value: "tool:chartmogul", label: "ChartMogul" },
                { value: "tool:pipedrive", label: "Pipedrive" },
                { value: "tool:google-ads", label: "Google Ads" },
                { value: "tool:meta-ads", label: "Meta Ads" },
                { value: "tool:linkedin-ads", label: "LinkedIn Ads" },
                { value: "tool:app-store-connect", label: "App Store Connect" },
                { value: "tool:play-console", label: "Google Play Console" },
                { value: "tool:spreadsheet", label: "Tableur" },
                {
                  value: "tool:cs-platform",
                  label: "Outil de Customer Success (Gainsight, Vitally, Planhat…)",
                },
              ],
            },
          ]}
        />
        <LiveCheckbox
          id="estimate-rev-paid-conversion-split-source"
          label={"Le dénominateur vient d'un autre outil"}
          initial={false}
        />
      </div>}
      editor={<div
        style={{ display: "flex", flexDirection: "column", gap: "var(--form-gap-sm)", minWidth: "0" }}
      >
        <FieldRow>
          <LiveNumber
            size="sm"
            id="estimate-rev-paid-conversion-low"
            label="Au moins"
            initial={6}
            locale="fr"
            suffix={" %"}
            unitName="pour cent"
            parseError={"Écris un nombre, par exemple 1 250 ou 18,5."}
          />
          <LiveNumber
            size="sm"
            id="estimate-rev-paid-conversion-high"
            label="Au plus"
            initial={9}
            locale="fr"
            suffix={" %"}
            unitName="pour cent"
            parseError={"Écris un nombre, par exemple 1 250 ou 18,5."}
          />
        </FieldRow>
        <LiveChoices
          size="sm"
          id="estimate-rev-paid-conversion-basis"
          legend={"Sur quoi repose l'estimation ?"}
          initial={"old-number"}
          options={[
            { value: "team-hunch", label: "Intuition d'équipe" },
            { value: "old-number", label: "Un ancien chiffre" },
            { value: "sample", label: "Un échantillon" },
            { value: "other", label: "Autre" },
          ]}
          columns={2}
        />
      </div>}
      backLabel={"← J'ai le chiffre, finalement"}
      legendId="estimate-rev-paid-conversion-answers"
    />
  </div>
);

/**
 * « I'll ask for it » pressed, in English: the example's viral coefficient, asked of Data on
 * 20 September. Who to ask (Data), when the request was copied and that the engine will remind
 * you, then the request's own button — « Follow up », since it was copied already — with its
 * quiet status line, empty until a copy.
 */
export const Ask = () => (
  <div style={{ maxWidth: 658 }}>
    <AnswerSwitch
      legend={"No figure to hand?"}
      options={[
        { value: "estimate", label: "I can estimate it" },
        { value: "ask", label: "I'll ask for it" },
        { value: "cant", label: "I can't find it" },
      ]}
      answer="ask"
      value={<div
        style={{ display: "flex", flexDirection: "column", gap: "var(--form-gap-sm)", minWidth: "0" }}
      >
        <FieldRow joiner="out of">
          <LiveNumber
            size="sm"
            id="ask-ref-k-factor-num"
            label="Sign-ups invited by the cohort"
            initial={null}
            locale="en"
            integer
            parseError="A whole number: these are people."
          />
          <LiveNumber
            size="sm"
            id="ask-ref-k-factor-den"
            label="Sign-ups from July 2026"
            initial={800}
            locale="en"
            integer
            parseError="A whole number: these are people."
          />
        </FieldRow>
        <p style={{ font: "var(--field-hint)", color: "var(--text-muted)", margin: "0" }}>
          {"Same number as for activation rate, day-30 retention, referred sign-up share and paid conversion: changing it here changes it everywhere."}
        </p>
        <LiveSelect
          size="sm"
          id="ask-ref-k-factor-source"
          label={"Where does it come from?"}
          initial={""}
          placeholder={"Choose…"}
          options={[
            { value: "tool:mixpanel", label: "Mixpanel" },
            { value: "tool:amplitude", label: "Amplitude" },
            { value: "tool:product-db", label: "Product database" },
            { value: "person", label: "Someone gave it to me" },
            { value: "other", label: "Other" },
            {
              label: "Other tools",
              options: [
                { value: "tool:ga4", label: "GA4" },
                { value: "tool:posthog", label: "PostHog" },
                { value: "tool:stripe", label: "Stripe" },
                { value: "tool:chargebee", label: "Chargebee" },
                { value: "tool:chartmogul", label: "ChartMogul" },
                { value: "tool:hubspot", label: "HubSpot" },
                { value: "tool:salesforce", label: "Salesforce" },
                { value: "tool:pipedrive", label: "Pipedrive" },
                { value: "tool:google-ads", label: "Google Ads" },
                { value: "tool:meta-ads", label: "Meta Ads" },
                { value: "tool:linkedin-ads", label: "LinkedIn Ads" },
                { value: "tool:app-store-connect", label: "App Store Connect" },
                { value: "tool:play-console", label: "Google Play Console" },
                { value: "tool:spreadsheet", label: "Spreadsheet" },
                {
                  value: "tool:cs-platform",
                  label: "Customer success platform (Gainsight, Vitally, Planhat…)",
                },
              ],
            },
          ]}
        />
        <LiveCheckbox
          id="ask-ref-k-factor-split-source"
          label="The denominator comes from another tool"
          initial={false}
        />
      </div>}
      editor={<div
        style={{ display: "flex", flexDirection: "column", gap: "var(--form-gap-sm)", minWidth: "0" }}
      >
        <LiveSelect
          size="sm"
          id="ask-ref-k-factor-role"
          label={"Who to ask?"}
          initial={"data"}
          options={[
            { value: "finance", label: "Finance" },
            { value: "data", label: "Data" },
            { value: "product", label: "Product" },
            { value: "marketing", label: "Marketing" },
            { value: "revops", label: "RevOps" },
            { value: "support", label: "Support" },
            { value: "sales", label: "Sales" },
            { value: "customer-success", label: "Customer success" },
          ]}
        />
        <p style={{ font: "var(--body-sm)", color: "var(--text-muted)", margin: "0" }}>
          {"Copied on September 20, 2026. Your engine will remind you to follow it up."}
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
            alignItems: "flex-start",
          }}
        >
          <Button variant="secondary">{"Follow up"}</Button>
          <p
            style={{ font: "var(--meta-sm)", color: "var(--text-body)", margin: "0", minHeight: "1em" }}
            role="status"
            aria-live="polite"
          />
        </div>
      </div>}
      backLabel={"← I have the figure after all"}
      legendId="ask-ref-k-factor-answers"
    />
  </div>
);

/**
 * « Je ne le trouve pas » pressed, in French, on an answer rather than a figure: the example's
 * main churn cause, which nobody agrees how to define. Words have no estimate, so only two
 * other answers, and the way back reads « ← J'ai la réponse, finalement ». The triage: why («
 * Personne n'est d'accord sur la définition »), what repairing it would take (a meeting), an
 * optional precision, and the glossary's « Définition → ».
 */
export const CantFind = () => (
  <div style={{ maxWidth: 658 }}>
    <AnswerSwitch
      legend={"Pas de réponse sous la main ?"}
      options={[
        { value: "ask", label: "Je le demande" },
        { value: "cant", label: "Je ne le trouve pas" },
      ]}
      answer="cant"
      value={<div
        style={{ display: "flex", flexDirection: "column", gap: "var(--form-gap-sm)", minWidth: "0" }}
      >
        <LiveText
          size="sm"
          id="cant-ret-churn-cause-text"
          label="Cause principale de churn"
          initial={""}
          maxLength={120}
        />
        <LiveChoices
          size="sm"
          id="cant-ret-churn-cause-evidence"
          legend={"Comment le sais-tu ?"}
          initial={null}
          options={[
            { value: "data", label: "Par les données" },
            { value: "interviews", label: "Par des entretiens" },
            { value: "hunch", label: "Par intuition" },
          ]}
        />
      </div>}
      editor={<div
        style={{ display: "flex", flexDirection: "column", gap: "var(--form-gap-sm)", minWidth: "0" }}
      >
        <LiveChoices
          size="sm"
          id="cant-ret-churn-cause-triage"
          legend={"Pourquoi ?"}
          initial={"no-definition"}
          options={[
            { value: "not-tracked", label: "On ne le mesure pas" },
            { value: "not-computed", label: "Ça existe, mais personne ne l'a calculé" },
            { value: "no-access", label: "Ça existe, mais je n'y ai pas accès" },
            { value: "no-definition", label: "Personne n'est d'accord sur la définition" },
          ]}
        />
        <LiveChoices
          size="sm"
          id="cant-ret-churn-cause-repair"
          legend={"Le réparer prendrait"}
          initial={"meeting"}
          options={[
            { value: "meeting", label: "une réunion" },
            { value: "afternoon", label: "une après-midi" },
            { value: "sprint", label: "un sprint" },
            { value: "quarter", label: "un trimestre" },
          ]}
          columns={2}
        />
        <LiveText
          size="sm"
          id="cant-ret-churn-cause-repair-comment"
          label={"Précision"}
          optional="facultatif"
          initial={""}
          maxLength={200}
        />
        <a
          style={{
            font: "var(--meta-sm)",
            color: "var(--text-link)",
            textUnderlineOffset: "3px",
            display: "inline-flex",
            alignItems: "center",
            minHeight: "var(--hit-compact)",
          }}
          href="/fr/glossary/churn"
          target="_blank"
          rel="noopener"
        >
          {"Définition →"}
        </a>
      </div>}
      backLabel={"← J'ai la réponse, finalement"}
      legendId="cant-ret-churn-cause-answers"
    />
  </div>
);
