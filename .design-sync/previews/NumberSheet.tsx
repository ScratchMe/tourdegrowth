import * as React from "react";
import { AnswerSwitch, Button, Checkbox, Choices, DefinitionTrigger, Disclosure, EngineProgress, Field, FieldRow, HowItCompares, NumberField, NumberSheet, Select, TextArea, TextField, TrapNote, WhereToFind } from "tour-de-growth";

/*
 * One number's screen (design system extension 07, A18 T1): the sheet fixes
 * the ORDER — where the number sits and what remains, its name, effort and
 * definition link, the one-liner and the formula, the Tour, the trap (open),
 * where to find it (folded), the value with the three other answers under it,
 * how it compares, « your definition and a note » (folded), the actions —
 * and the caller fills each slot with the components of this group:
 * TrapNote, WhereToFind, AnswerSwitch, HowItCompares.
 *
 * Every prop is the product's own. The engine's one call site, `MetricSheet`
 * (app/[locale]/aarrr-funnel-template/_engine/MetricSheet.tsx), opened by
 * `NumberScreen` while the month is walked, was rendered on the engine's
 * fixtures with the resolved copy (`resolveEngineProps`), and its first
 * paint written out here. Its island pieces are drawn with what they render:
 * `EngineTerm`'s « ? » is the system's `DefinitionTrigger` in its inline
 * anchor (closed); `ValueEditor`, `MissingTriage`, `RequestCopy` and
 * `TargetField` are the form primitives they render; the island's own
 * wrappers (`Sheet.module.css`: the editor column, the caveat, the live
 * line, the shared-count line, the save status) are inlined as styles. Each
 * box keeps its value in a local `Live*` wrapper so it can be typed into;
 * the save and the navigation handlers are left out — nothing is saved.
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

const LiveTextArea = ({ initial, ...rest }: { initial: string } & Omit<React.ComponentProps<typeof TextArea>, "value" | "onChange">) => {
  const [value, setValue] = React.useState(initial);
  return <TextArea {...rest} value={value} onChange={setValue} />;
};

/**
 * A fresh engine's first number, in French (`emptyState()`'s shape: every number to do, no
 * target — the example's months and setup), the sign-up rate the step-by-step opens first (e2e
 * `engine-numbers.spec.ts`, « Next number »). « Acquisition · 1 sur 3 » and « 17 à faire » in
 * the header, the effort as a neutral tag, the trap open with « Écrire ta définition », where
 * to find it folded, the two empty boxes and the three other answers under them; How it
 * compares has only the published range (no figure, no target, the empty target box). The
 * primary leads on (« Enregistre et continue → ») and « Passe pour l'instant » leaves it to
 * do.
 */
export const FirstNumber = () => (
  <div style={{ maxWidth: 720 }}>
    <NumberSheet
      name={"Taux d'inscription"}
      headingId="first-number-title"
      position={"Acquisition · 1 sur 3"}
      progress={<EngineProgress size="sm" remaining={"17 à faire"} />}
      effort={"Seul, 5 min"}
      definitionLabel={"Définition →"}
      definitionHref="/fr/glossary/acquisition"
      definition={"La part des visiteurs du mois qui créent un compte."}
      formulaLabel="Formule"
      formula={"inscrits du mois ÷ visiteurs uniques du mois"}
      trap={<TrapNote
        label={"Le piège, avant de taper"}
        action={<Button variant="quiet" size="sm" aria-controls="first-acq-signup-rate-words">
          {"Écrire ta définition"}
        </Button>}
      >
        {"Les visiteurs viennent de l'analytics, les inscrits souvent de ta base : les deux ne comptent pas les mêmes personnes (bloqueurs, appareils multiples). Écris-le dans ta définition."}
      </TrapNote>}
      where={<WhereToFind
        label={"Où le trouver"}
        tools={[
          {
            tool: "GA4",
            path: "le total Utilisateurs du mois (la métrique Utilisateurs, à ajouter au rapport Acquisition de trafic si elle n'y est pas), pas Sessions",
            yours: false,
          },
          {
            tool: "Mixpanel ou Amplitude",
            path: "un entonnoir en deux étapes, page vue puis inscription, sur le mois",
            yours: false,
          },
          {
            tool: "Base produit",
            path: "les comptes créés sur le mois : le compte le plus fiable pour les inscrits",
            yours: false,
          },
        ]}
        yoursLabel="ton outil"
        also={[
          {
            tool: "ga4",
            label: "Aussi dans GA4 : ",
            items: [
              { id: "acq.top-channel-share", label: "part du premier canal" },
              { id: "act.rate", label: "taux d'activation" },
              { id: "act.ttv", label: "time-to-value médian" },
              { id: "ret.d30", label: "rétention à J30" },
            ],
          },
          {
            tool: "mixpanel",
            label: "Aussi dans Mixpanel : ",
            items: [
              { id: "act.rate", label: "taux d'activation" },
              { id: "ret.d30", label: "rétention à J30" },
              { id: "ref.k-factor", label: "coefficient viral (K)" },
            ],
          },
          {
            tool: "product-db",
            label: "Aussi dans Base produit : ",
            items: [
              { id: "ref.referred-share", label: "part des inscrits recommandés" },
              { id: "ref.k-factor", label: "coefficient viral (K)" },
            ],
          },
        ]}
      />}
      answer={<AnswerSwitch
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
              id="first-acq-signup-rate-num"
              label={"Inscrits en août 2026"}
              initial={null}
              locale="fr"
              integer
              parseError={"Un nombre entier : on compte des personnes."}
            />
            <LiveNumber
              size="sm"
              id="first-acq-signup-rate-den"
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
        legendId="first-acq-signup-rate-answers"
      />}
      compare={<HowItCompares
        title="Comment il se situe"
        domain={[0, 10]}
        band={[2, 5]}
        chartLabel={"Taux d'inscription : pas encore de chiffre. Repère 2 à 5 %. Pas de cible."}
        legend={[
          {
            kind: "band",
            label: <>
              {"Repère 2 à 5 %"}
              <span style={{ display: "inline", marginInlineStart: "var(--space-2)" }}>
                <DefinitionTrigger term={"repère"} label={"Définition : repère"} />
              </span>
            </>,
          },
        ]}
        caveat={"Pour situer, sans désigner d'étape : pour du trafic payant froid, bien plus pour du trafic chaud ; ton trafic est un mélange"}
        targetField={<LiveNumber
          size="sm"
          id="first-acq-signup-rate-target"
          label={"La cible de ton équipe"}
          optional="facultatif"
          hint={<>
            {"Seule une cible désigne l'étape qui freine. Sans cible, le chiffre compte quand même."}
            <span style={{ display: "inline", marginInlineStart: "var(--space-2)" }}>
              <DefinitionTrigger term="cible" label={"Définition : cible"} />
            </span>
          </>}
          initial={null}
          locale="fr"
          digits={5}
          suffix={" %"}
          unitName="pour cent"
          parseError={"Écris un nombre, par exemple 1 250 ou 18,5."}
        />}
      />}
      words={<Disclosure summary={"Ta définition et une note"} id="first-acq-signup-rate-words">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--form-gap-sm)" }}>
          <Field
            size="sm"
            id="first-acq-signup-rate-definition"
            label={"Ta définition"}
            optional="facultatif"
            hint={"Par exemple « actif = au moins un projet modifié ». Elle apparaît dans l'annexe des slides et dans les demandes que tu copies."}
          >
            {({ id, describedBy, invalid }) => (
              <LiveTextArea
                id={id}
                initial={""}
                maxLength={200}
                invalid={invalid}
                aria-describedby={describedBy}
                rows={2}
              />
            )}
          </Field>
          <Field
            size="sm"
            id="first-acq-signup-rate-note"
            label="Note pour toi"
            optional="facultatif"
            hint="Jamais sur une slide."
          >
            {({ id, describedBy, invalid }) => (
              <LiveTextArea
                id={id}
                initial={""}
                maxLength={400}
                invalid={invalid}
                aria-describedby={describedBy}
                rows={3}
              />
            )}
          </Field>
        </div>
      </Disclosure>}
      actions={<>
        <Button>{"Enregistre et continue →"}</Button>
        <Button variant="quiet">{"Passe pour l'instant"}</Button>
      </>}
      footer={<p
        style={{ font: "var(--meta-sm)", color: "var(--text-body)", margin: "0" }}
        role="status"
        aria-live="polite"
      />}
    />
  </div>
);

/**
 * The engine's example in English (`exampleEngine` with the page's English words,
 * `lib/engine/example.ts`): the activation rate, 144 out of 800, with the line the counts
 * compute, its cohort's « ? », its source and the shared-count line. How it compares draws the
 * bar (18%), the published range (20–40%) and the team's target (20%); the tag « Below the
 * target » is red because it is measured against that TARGET, never the reference (C1).
 * Nothing is left to do, so the primary reads « Save and see your engine → », and a found
 * number has no « skip ».
 */
export const Found = () => (
  <div style={{ maxWidth: 720 }}>
    <NumberSheet
      name="Activation rate"
      headingId="found-number-title"
      position={"Activation · 1 of 3"}
      progress={<EngineProgress size="sm" remaining="None to go" />}
      effort={"On your own, ~1 h"}
      definitionLabel={"Definition →"}
      definitionHref="/en/glossary/activation"
      definition="The share of sign-ups who reach first value in time."
      formulaLabel="Formula"
      formula={"cohort sign-ups who triggered \"created a first project\" within 7 days ÷ cohort sign-ups"}
      trap={<TrapNote
        label="The trap, before you type"
        action={<Button variant="quiet" size="sm" aria-controls="found-act-rate-words">
          {"Write your definition"}
        </Button>}
      >
        {"Change the chosen action and the rate can double or halve. Write your definition down, and keep it from one month to the next."}
      </TrapNote>}
      where={<WhereToFind
        label="Where to find it"
        tools={[
          {
            tool: "Amplitude",
            path: "a Funnel Analysis chart: sign-up then \"created a first project\", 7-day conversion window",
            yours: false,
          },
          {
            tool: "Mixpanel or PostHog",
            path: "a funnel from sign-up to \"created a first project\", with a conversion window of 7 days",
            yours: false,
          },
          {
            tool: "GA4",
            path: "a funnel exploration (Explore tab), if \"created a first project\" is sent to GA4",
            yours: false,
          },
        ]}
        yoursLabel="your tool"
        also={[
          {
            tool: "amplitude",
            label: "Also in Amplitude: ",
            items: [
              { id: "act.ttv", label: "median time to value" },
              { id: "ret.d30", label: "day-30 retention" },
            ],
          },
          {
            tool: "mixpanel",
            label: "Also in Mixpanel: ",
            items: [
              { id: "acq.signup-rate", label: "sign-up rate" },
              { id: "ret.d30", label: "day-30 retention" },
              { id: "ref.k-factor", label: "viral coefficient (K)" },
            ],
          },
          {
            tool: "ga4",
            label: "Also in GA4: ",
            items: [
              { id: "acq.signup-rate", label: "sign-up rate" },
              { id: "acq.top-channel-share", label: "top channel share" },
              { id: "act.ttv", label: "median time to value" },
              { id: "ret.d30", label: "day-30 retention" },
            ],
          },
        ]}
      />}
      answer={<AnswerSwitch
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
              id="found-act-rate-num"
              label="Activated within 7 days"
              initial={144}
              locale="en"
              integer
              parseError="A whole number: these are people."
            />
            <LiveNumber
              size="sm"
              id="found-act-rate-den"
              label="Sign-ups from July 2026"
              hint={<span>
                {"Use the sign-ups from July 2026: those from August 2026 haven't had 7 days yet."}
                <span style={{ display: "inline", marginInlineStart: "var(--space-2)" }}>
                  <DefinitionTrigger term="cohort" label="Definition: cohort" />
                </span>
              </span>}
              initial={800}
              locale="en"
              integer
              parseError="A whole number: these are people."
            />
          </FieldRow>
          <p style={{ font: "var(--field-hint)", color: "var(--text-muted)", margin: "0" }}>
            {"Same number as for day-30 retention, referred sign-up share, viral coefficient (K) and paid conversion: changing it here changes it everywhere."}
          </p>
          <p
            style={{ font: "var(--meta-md)", color: "var(--text-body)", margin: "0" }}
            aria-live="polite"
          >
            {"18%, i.e. 18 in 100 sign-ups from July 2026"}
          </p>
          <Button variant="quiet" size="sm" style={{ alignSelf: "flex-start" }}>
            {"I only have the rate"}
          </Button>
          <LiveSelect
            size="sm"
            id="found-act-rate-source"
            label={"Where does it come from?"}
            initial={"tool:amplitude"}
            placeholder={"Choose…"}
            options={[
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
                  { value: "tool:pipedrive", label: "Pipedrive" },
                  { value: "tool:google-ads", label: "Google Ads" },
                  { value: "tool:meta-ads", label: "Meta Ads" },
                  { value: "tool:linkedin-ads", label: "LinkedIn Ads" },
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
          <LiveCheckbox
            id="found-act-rate-split-source"
            label="The denominator comes from another tool"
            initial={false}
          />
        </div>}
        backLabel={"← I have the figure after all"}
        legendId="found-act-rate-answers"
      />}
      compare={<HowItCompares
        title="How it compares"
        value={18}
        domain={[0, 80]}
        band={[20, 40]}
        target={20}
        chartLabel={"Activation rate: 18%. Reference 20–40%. Target 20%."}
        legend={[
          { kind: "value", label: "Your figure 18%" },
          {
            kind: "band",
            label: <>
              {"Reference 20–40%"}
              <span style={{ display: "inline", marginInlineStart: "var(--space-2)" }}>
                <DefinitionTrigger term="reference" label="Definition: reference" />
              </span>
            </>,
          },
          { kind: "target", label: "Your team's target 20%" },
        ]}
        caveat={"For context, never to name a stage: for SaaS onboarding, often lower for free trials; it all depends on how demanding the chosen event is"}
        verdict={{ tone: "below", label: "Below the target" }}
        targetField={<LiveNumber
          size="sm"
          id="found-act-rate-target"
          label={"Your team's target"}
          optional="optional"
          hint={<>
            {"Only a target names the stage that holds you back. Without one, the figure still counts."}
            <span style={{ display: "inline", marginInlineStart: "var(--space-2)" }}>
              <DefinitionTrigger term="target" label="Definition: target" />
            </span>
          </>}
          initial={20}
          locale="en"
          digits={5}
          suffix={"%"}
          unitName="per cent"
          parseError="Type a number, such as 1,250 or 18.5."
        />}
      />}
      words={<Disclosure summary="Your definition and a note" id="found-act-rate-words">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--form-gap-sm)" }}>
          <Field
            size="sm"
            id="found-act-rate-definition"
            label="Your definition"
            optional="optional"
            hint={"For example \"active = at least one project edited\". It appears in the slides' appendix and in the requests you copy."}
          >
            {({ id, describedBy, invalid }) => (
              <LiveTextArea
                id={id}
                initial={""}
                maxLength={200}
                invalid={invalid}
                aria-describedby={describedBy}
                rows={2}
              />
            )}
          </Field>
          <Field
            size="sm"
            id="found-act-rate-note"
            label="Note to self"
            optional="optional"
            hint="Never on a slide."
          >
            {({ id, describedBy, invalid }) => (
              <LiveTextArea
                id={id}
                initial={""}
                maxLength={400}
                invalid={invalid}
                aria-describedby={describedBy}
                rows={3}
              />
            )}
          </Field>
        </div>
      </Disclosure>}
      actions={<Button>{"Save and see your engine →"}</Button>}
      footer={<p
        style={{ font: "var(--meta-sm)", color: "var(--text-body)", margin: "0" }}
        role="status"
        aria-live="polite"
      />}
    />
  </div>
);

/**
 * An answer, not a figure, in French: the activation event of the example, with the engine
 * linked to a Tour whose answer to « act-1 » was the first one (`tourResult({ "act-1": 0 })`,
 * fixtures). The Tour line sits under the formula; the value is words, so there is no « Je
 * peux l'estimer » and the legend asks « Pas de réponse sous la main ? »; with no reference
 * and no stage to name, there is no How it compares. Last number: « Enregistre et vois ton
 * moteur → ».
 */
export const FromTheTour = () => (
  <div style={{ maxWidth: 720 }}>
    <NumberSheet
      name={"Événement d'activation"}
      headingId="tour-number-title"
      position={"Activation · 2 sur 3"}
      progress={<EngineProgress size="sm" remaining={"Plus rien à faire"} />}
      effort={"Seul, 5 min"}
      definitionLabel={"Définition →"}
      definitionHref="/fr/glossary/aha-moment"
      definition={"L'action qui montre qu'un inscrit a touché la valeur du produit."}
      formulaLabel="Formule"
      formula={"le nom de l'action, et le nombre de jours laissés pour la faire"}
      tour={<span>{"Dans le Tour, tu as répondu : « Oui, et on le mesure »"}</span>}
      trap={<TrapNote label={"Le piège, avant de taper"}>
        {"Une action choisie parce qu'elle est facile à compter n'est pas un moment de valeur. Celle qui compte distingue les inscrits qui restent de ceux qui partent."}
      </TrapNote>}
      where={<WhereToFind
        label={"Où le trouver"}
        tools={[
          {
            tool: "Produit",
            path: "une décision de l'équipe produit, pas un chiffre qu'un outil sort tout seul",
            yours: false,
          },
        ]}
        yoursLabel="ton outil"
      />}
      answer={<AnswerSwitch
        legend={"Pas de réponse sous la main ?"}
        options={[
          { value: "ask", label: "Je le demande" },
          { value: "cant", label: "Je ne le trouve pas" },
        ]}
        value={<div
          style={{ display: "flex", flexDirection: "column", gap: "var(--form-gap-sm)", minWidth: "0" }}
        >
          <LiveText
            size="sm"
            id="tour-act-event-text"
            label={"Événement d'activation"}
            initial={"a créé un premier projet"}
            maxLength={120}
          />
        </div>}
        backLabel={"← J'ai la réponse, finalement"}
        legendId="tour-act-event-answers"
      />}
      words={<Disclosure summary={"Ta définition et une note"} id="tour-act-event-words">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--form-gap-sm)" }}>
          <Field
            size="sm"
            id="tour-act-event-definition"
            label={"Ta définition"}
            optional="facultatif"
            hint={"Par exemple « actif = au moins un projet modifié ». Elle apparaît dans l'annexe des slides et dans les demandes que tu copies."}
          >
            {({ id, describedBy, invalid }) => (
              <LiveTextArea
                id={id}
                initial={""}
                maxLength={200}
                invalid={invalid}
                aria-describedby={describedBy}
                rows={2}
              />
            )}
          </Field>
          <Field
            size="sm"
            id="tour-act-event-note"
            label="Note pour toi"
            optional="facultatif"
            hint="Jamais sur une slide."
          >
            {({ id, describedBy, invalid }) => (
              <LiveTextArea
                id={id}
                initial={""}
                maxLength={400}
                invalid={invalid}
                aria-describedby={describedBy}
                rows={3}
              />
            )}
          </Field>
        </div>
      </Disclosure>}
      actions={<Button>{"Enregistre et vois ton moteur →"}</Button>}
      footer={<p
        style={{ font: "var(--meta-sm)", color: "var(--text-body)", margin: "0" }}
        role="status"
        aria-live="polite"
      />}
    />
  </div>
);

/**
 * The hybrid example's sales-assisted win rate, in English (`exampleEngine` with both
 * motions): three months counted together (« from June to August 2026 », said above the boxes
 * and in each count's label), 18 deals won out of 75 closed, the small-sample line under them
 * (« one more or less moves the rate by 1.3 points »), and no published reference — the rate
 * is followed against its own target, 32%, so the tag says « Below the target ». Another
 * number follows: « Save and continue → ».
 */
export const SalesAssisted = () => (
  <div style={{ maxWidth: 720 }}>
    <NumberSheet
      name="Win rate"
      headingId="sales-number-title"
      position={"Revenue · 1 of 4"}
      progress={<EngineProgress size="sm" remaining="Last one to go" />}
      effort="On your own, 5 min"
      definitionLabel={"Definition →"}
      definitionHref="/en/glossary/win-rate"
      definition="The share of closed opportunities that are won."
      formulaLabel="Formula"
      formula={"new-customer opportunities won ÷ new-customer opportunities closed (won + lost) from June to August 2026"}
      trap={<TrapNote label="The trap, before you type">
        {"Dead deals never marked \"lost\" inflate the rate, and a \"no decision\" is a loss. Sales to existing customers don't belong here."}
      </TrapNote>}
      where={<WhereToFind
        label="Where to find it"
        tools={[
          {
            tool: "Salesforce",
            path: "the new-customer opportunities closed over the period: won ÷ closed",
            yours: false,
          },
          {
            tool: "HubSpot",
            path: "the new-business deals closed over the period: won ÷ (won + lost)",
            yours: false,
          },
          {
            tool: "Pipedrive",
            path: "deal conversion over the period, in the reports",
            yours: false,
          },
        ]}
        yoursLabel="your tool"
        also={[
          {
            tool: "salesforce",
            label: "Also in Salesforce: ",
            items: [
              { id: "acq.top-channel-share", label: "top channel share" },
              { id: "slg.acq.lead-to-opp", label: "lead-to-opportunity rate" },
              { id: "slg.acq.cycle", label: "median sales cycle" },
              { id: "slg.ret.renewal", label: "contract renewal rate" },
              { id: "slg.ret.nrr", label: "12-month NRR" },
              { id: "slg.ref.referred-share", label: "referred opportunities" },
              { id: "slg.rev.acv", label: "new-contract ACV" },
              { id: "link.pql-handoff", label: "opportunities from self-serve" },
            ],
          },
          {
            tool: "hubspot",
            label: "Also in HubSpot: ",
            items: [
              { id: "acq.top-channel-share", label: "top channel share" },
              { id: "ret.churn-cause", label: "main churn cause" },
              { id: "ref.referred-share", label: "referred sign-up share" },
              { id: "rev.paid-conversion", label: "paid conversion" },
              { id: "slg.acq.lead-to-opp", label: "lead-to-opportunity rate" },
              { id: "slg.acq.cac", label: "sales-assisted CAC" },
              { id: "slg.acq.cycle", label: "median sales cycle" },
              { id: "slg.act.go-live", label: "go-live rate" },
              { id: "slg.act.time-to-live", label: "time to go-live" },
              { id: "slg.ret.loss-cause", label: "main reason for non-renewal" },
              { id: "slg.ref.referred-share", label: "referred opportunities" },
              { id: "slg.ref.referenceable", label: "reference customers" },
              { id: "slg.rev.acv", label: "new-contract ACV" },
              { id: "link.pql-handoff", label: "opportunities from self-serve" },
            ],
          },
          {
            tool: "pipedrive",
            label: "Also in Pipedrive: ",
            items: [
              { id: "slg.acq.lead-to-opp", label: "lead-to-opportunity rate" },
              { id: "slg.acq.cycle", label: "median sales cycle" },
            ],
          },
        ]}
      />}
      answer={<AnswerSwitch
        legend={"No figure to hand?"}
        options={[
          { value: "estimate", label: "I can estimate it" },
          { value: "ask", label: "I'll ask for it" },
          { value: "cant", label: "I can't find it" },
        ]}
        value={<>
          <p style={{ font: "var(--body-sm)", color: "var(--text-muted)", margin: "0" }}>
            <span>{"Take the three months from June to August 2026: a single month has too few deals."}</span>
          </p>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "var(--form-gap-sm)", minWidth: "0" }}
          >
            <FieldRow joiner="out of">
              <LiveNumber
                size="sm"
                id="sales-slg-rev-win-rate-num"
                label="New-customer deals won from June to August 2026"
                initial={18}
                locale="en"
                integer
                parseError="A whole number: these are people."
              />
              <LiveNumber
                size="sm"
                id="sales-slg-rev-win-rate-den"
                label="Opportunities closed from June to August 2026"
                initial={75}
                locale="en"
                integer
                parseError="A whole number: these are people."
              />
            </FieldRow>
            <p style={{ font: "var(--field-hint)", color: "var(--text-muted)", margin: "0" }}>
              {"Same number as for new-contract ACV and sales-assisted CAC: changing it here changes it everywhere."}
            </p>
            <p
              style={{ font: "var(--meta-md)", color: "var(--text-body)", margin: "0" }}
              aria-live="polite"
            >
              {"24%, i.e. 24 in 100 opportunities closed from June to August 2026"}
            </p>
            <Button variant="quiet" size="sm" style={{ alignSelf: "flex-start" }}>
              {"I only have the rate"}
            </Button>
            <LiveSelect
              size="sm"
              id="sales-slg-rev-win-rate-source"
              label={"Where does it come from?"}
              initial={"tool:hubspot"}
              placeholder={"Choose…"}
              options={[
                { value: "tool:salesforce", label: "Salesforce" },
                { value: "tool:hubspot", label: "HubSpot" },
                { value: "tool:pipedrive", label: "Pipedrive" },
                { value: "person", label: "Someone gave it to me" },
                { value: "other", label: "Other" },
                {
                  label: "Other tools",
                  options: [
                    { value: "tool:ga4", label: "GA4" },
                    { value: "tool:mixpanel", label: "Mixpanel" },
                    { value: "tool:amplitude", label: "Amplitude" },
                    { value: "tool:posthog", label: "PostHog" },
                    { value: "tool:stripe", label: "Stripe" },
                    { value: "tool:chargebee", label: "Chargebee" },
                    { value: "tool:chartmogul", label: "ChartMogul" },
                    { value: "tool:google-ads", label: "Google Ads" },
                    { value: "tool:meta-ads", label: "Meta Ads" },
                    { value: "tool:linkedin-ads", label: "LinkedIn Ads" },
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
            <LiveCheckbox
              id="sales-slg-rev-win-rate-split-source"
              label="The denominator comes from another tool"
              initial={false}
            />
          </div>
          <p style={{ font: "var(--body-sm)", color: "var(--text-muted)", margin: "0" }}>
            {"Out of 75 closed opportunities, one more or less moves the rate by 1.3 points: read the direction."}
          </p>
        </>}
        backLabel={"← I have the figure after all"}
        legendId="sales-slg-rev-win-rate-answers"
      />}
      compare={<HowItCompares
        title="How it compares"
        value={24}
        domain={[0, 48]}
        target={32}
        chartLabel={"Win rate: 24%. Target 32%."}
        legend={[
          { kind: "value", label: "Your figure 24%" },
          { kind: "target", label: "Your team's target 32%" },
        ]}
        caveat="No reference worth publishing: the rate depends on deal size and on what counts as an opportunity: it is followed against its own target."
        verdict={{ tone: "below", label: "Below the target" }}
        targetField={<LiveNumber
          size="sm"
          id="sales-slg-rev-win-rate-target"
          label={"Your team's target"}
          optional="optional"
          hint={<>
            {"Only a target names the stage that holds you back. Without one, the figure still counts."}
            <span style={{ display: "inline", marginInlineStart: "var(--space-2)" }}>
              <DefinitionTrigger term="target" label="Definition: target" />
            </span>
          </>}
          initial={32}
          locale="en"
          digits={5}
          suffix={"%"}
          unitName="per cent"
          parseError="Type a number, such as 1,250 or 18.5."
        />}
      />}
      words={<Disclosure summary="Your definition and a note" id="sales-slg-rev-win-rate-words">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--form-gap-sm)" }}>
          <Field
            size="sm"
            id="sales-slg-rev-win-rate-definition"
            label="Your definition"
            optional="optional"
            hint={"For example \"active = at least one project edited\". It appears in the slides' appendix and in the requests you copy."}
          >
            {({ id, describedBy, invalid }) => (
              <LiveTextArea
                id={id}
                initial={""}
                maxLength={200}
                invalid={invalid}
                aria-describedby={describedBy}
                rows={2}
              />
            )}
          </Field>
          <Field
            size="sm"
            id="sales-slg-rev-win-rate-note"
            label="Note to self"
            optional="optional"
            hint="Never on a slide."
          >
            {({ id, describedBy, invalid }) => (
              <LiveTextArea
                id={id}
                initial={""}
                maxLength={400}
                invalid={invalid}
                aria-describedby={describedBy}
                rows={3}
              />
            )}
          </Field>
        </div>
      </Disclosure>}
      actions={<Button>{"Save and continue →"}</Button>}
      footer={<p
        style={{ font: "var(--meta-sm)", color: "var(--text-body)", margin: "0" }}
        role="status"
        aria-live="polite"
      />}
    />
  </div>
);

/**
 * Self-serve's gross margin in the hybrid example, in French: estimated at 70 to 80 % from an
 * old number, so the sheet opens on the estimate's editor (« Je peux l'estimer » pressed, « ←
 * J'ai le chiffre, finalement » above the bounds). Only on the two margin sheets of the
 * hybrid, a secondary « Reprendre la marge globale » sits above the answers (C25 Q4). The
 * margin cannot name a stage: How it compares has no bar for an estimate (the legend says the
 * range), the published range, and « Ce chiffre situe ; il ne désigne pas d'étape. » The value
 * boxes stay passed while the editor shows, as the call site passes them.
 */
export const CompanyMargin = () => (
  <div style={{ maxWidth: 720 }}>
    <NumberSheet
      name="Marge brute"
      headingId="margin-number-title"
      position={"Revenue · 3 sur 5"}
      progress={<EngineProgress size="sm" remaining={"Plus rien à faire"} />}
      effort={"À demander"}
      definitionLabel={"Définition →"}
      definitionHref="/fr/glossary/cac-payback"
      definition={"Ce qu'il reste d'un paiement après le coût de servir le client."}
      formulaLabel="Formule"
      formula={"(revenu – coût direct de service : hébergement, frais de paiement, support) ÷ revenu"}
      trap={<TrapNote label={"Le piège, avant de taper"}>
        {"Prendre le revenu au lieu de la marge flatte le payback : c'est la marge qui rembourse le CAC."}
      </TrapNote>}
      where={<WhereToFind
        label={"Où le trouver"}
        tools={[
          {
            tool: "Finance",
            path: "le compte de résultat du dernier trimestre clos : le revenu, puis les coûts directs de service",
            yours: false,
          },
        ]}
        yoursLabel="ton outil"
      />}
      answer={<>
        <div
          style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-5)" }}
        >
          <Button variant="secondary" size="sm">{"Reprendre la marge globale"}</Button>
        </div>
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
                id="margin-rev-gross-margin-num"
                label="Marge brute sur ce MRR"
                initial={null}
                locale="fr"
                suffix={" €"}
                unitName="euros"
                parseError={"Écris un nombre, par exemple 1 250 ou 18,5."}
              />
              <LiveNumber
                size="sm"
                id="margin-rev-gross-margin-den"
                label={"MRR à fin août 2026"}
                initial={48000}
                locale="fr"
                suffix={" €"}
                unitName="euros"
                parseError={"Écris un nombre, par exemple 1 250 ou 18,5."}
              />
            </FieldRow>
            <p style={{ font: "var(--field-hint)", color: "var(--text-muted)", margin: "0" }}>
              {"Même nombre que pour ARPA mensuel : le modifier ici le modifie partout."}
            </p>
            <Button variant="quiet" size="sm" style={{ alignSelf: "flex-start" }}>
              {"Je n'ai que le taux"}
            </Button>
            <LiveSelect
              size="sm"
              id="margin-rev-gross-margin-source"
              label={"D'où vient ce chiffre ?"}
              initial={""}
              placeholder={"Choisir…"}
              options={[
                { value: "tool:spreadsheet", label: "Tableur" },
                { value: "person", label: "Quelqu'un me l'a donné" },
                { value: "other", label: "Autre" },
                {
                  label: "Autres outils",
                  options: [
                    { value: "tool:ga4", label: "GA4" },
                    { value: "tool:mixpanel", label: "Mixpanel" },
                    { value: "tool:amplitude", label: "Amplitude" },
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
                    { value: "tool:product-db", label: "Base produit" },
                    {
                      value: "tool:cs-platform",
                      label: "Outil de Customer Success (Gainsight, Vitally, Planhat…)",
                    },
                  ],
                },
              ]}
            />
            <LiveCheckbox
              id="margin-rev-gross-margin-split-source"
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
                id="margin-rev-gross-margin-low"
                label="Au moins"
                initial={70}
                locale="fr"
                suffix={" %"}
                unitName="pour cent"
                parseError={"Écris un nombre, par exemple 1 250 ou 18,5."}
              />
              <LiveNumber
                size="sm"
                id="margin-rev-gross-margin-high"
                label="Au plus"
                initial={80}
                locale="fr"
                suffix={" %"}
                unitName="pour cent"
                parseError={"Écris un nombre, par exemple 1 250 ou 18,5."}
              />
            </FieldRow>
            <LiveChoices
              size="sm"
              id="margin-rev-gross-margin-basis"
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
          legendId="margin-rev-gross-margin-answers"
        />
      </>}
      compare={<HowItCompares
        title="Comment il se situe"
        domain={[0, 170]}
        band={[70, 85]}
        chartLabel={"Marge brute : 70 à 80 %. Repère 70 à 85 %. Pas de cible."}
        legend={[
          { kind: "value", label: "Ton chiffre 70 à 80 %" },
          {
            kind: "band",
            label: <>
              {"Repère 70 à 85 %"}
              <span style={{ display: "inline", marginInlineStart: "var(--space-2)" }}>
                <DefinitionTrigger term={"repère"} label={"Définition : repère"} />
              </span>
            </>,
          },
        ]}
        caveat={"Pour situer, sans désigner d'étape : en SaaS ; bien moins dès qu'il y a de l'humain dans la livraison"}
        note={"Ce chiffre situe ; il ne désigne pas d'étape."}
      />}
      words={<Disclosure summary={"Ta définition et une note"} id="margin-rev-gross-margin-words">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--form-gap-sm)" }}>
          <Field
            size="sm"
            id="margin-rev-gross-margin-definition"
            label={"Ta définition"}
            optional="facultatif"
            hint={"Par exemple « actif = au moins un projet modifié ». Elle apparaît dans l'annexe des slides et dans les demandes que tu copies."}
          >
            {({ id, describedBy, invalid }) => (
              <LiveTextArea
                id={id}
                initial={""}
                maxLength={200}
                invalid={invalid}
                aria-describedby={describedBy}
                rows={2}
              />
            )}
          </Field>
          <Field
            size="sm"
            id="margin-rev-gross-margin-note"
            label="Note pour toi"
            optional="facultatif"
            hint="Jamais sur une slide."
          >
            {({ id, describedBy, invalid }) => (
              <LiveTextArea
                id={id}
                initial={""}
                maxLength={400}
                invalid={invalid}
                aria-describedby={describedBy}
                rows={3}
              />
            )}
          </Field>
        </div>
      </Disclosure>}
      actions={<Button>{"Enregistre et continue →"}</Button>}
      footer={<p
        style={{ font: "var(--meta-sm)", color: "var(--text-body)", margin: "0" }}
        role="status"
        aria-live="polite"
      />}
    />
  </div>
);
