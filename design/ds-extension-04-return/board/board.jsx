// Extension 04 — the states board. Every control, every state, in one world,
// one language, one width: board.html?world=paper|night&lang=en|fr&w=390|1280
// (index.html shows all eight). Strings are the brief's real ones; the engine
// copy is under review, so they are here for their length, not their words.
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Field } from "../components/core/Field/Field.jsx";
import { TextField } from "../components/core/TextField/TextField.jsx";
import { NumberField, groupAsTyped } from "../components/core/NumberField/NumberField.jsx";
import { Select } from "../components/core/Select/Select.jsx";
import { DateField } from "../components/core/DateField/DateField.jsx";
import { Choices } from "../components/core/Choices/Choices.jsx";
import { Checkbox } from "../components/core/Checkbox/Checkbox.jsx";
import { FieldRow } from "../components/core/FieldRow/FieldRow.jsx";
import { FormSummary } from "../components/core/FormSummary/FormSummary.jsx";
import { TextArea } from "../components/core/TextArea/TextArea.jsx";

const q = new URLSearchParams(location.search);
const world = q.get("world") === "night" ? "night" : "paper";
const lang = q.get("lang") === "fr" ? "fr" : "en";
const width = q.get("w") === "390" ? 390 : 1280;
document.documentElement.lang = lang;

const NB = " ";
const T = {
  en: {
    legend: "Where are you with this number?",
    choices: ["I have it", "I can estimate it", "I'll ask for it", "I can't find it"],
    model: "Your model",
    models: [
      "SaaS or web product, self-serve (trial or freemium)",
      "B2B with a sales team",
      "Consumer app",
      "Marketplace",
    ],
    soon: "Coming soon",
    soonNote: "their funnel has a different shape.",
    month: "Month for flows",
    monthHint: "Visitors, sign-ups, spend, churn and ARPA for that month. Default: the last full month.",
    months: ["August 2026", "July 2026", "June 2026", "May 2026"],
    source: "Where does it come from?",
    choose: "Choose…",
    sources: [
      { label: "The tools this usually comes from", options: ["Amplitude", "Mixpanel", "PostHog"] },
      { label: "Everything else", options: ["Google Analytics", "Stripe", "A spreadsheet", "Somewhere else"] },
    ],
    definition: "Your definition",
    optional: "optional",
    company: "Your SaaS or company name",
    companyValue: "Northwind Analytics",
    companyLong: "Northwind Analytics — the scheduling tool for independent physios",
    companyHint: "It only appears on your slides, and stays on this device like everything else.",
    count: (n, m) => `${n} of ${m} characters`,
    parse: "That isn't a readable number.",
    validation: "The minimum is above the maximum.",
    missing: "Still to fill in — the export will flag this line as incomplete.",
    required: "Choose where you are with this number before saving.",
    activated: "Activated within 7 days",
    signups: "Signed up in July 2026",
    outOf: "out of",
    minimum: "Low end",
    maximum: "High end",
    to: "to",
    spend: "Spend that month",
    target: "Your target",
    currency: "Currency",
    confirm: "Type ERASE to confirm",
    compare: "Compare with that Tour",
    compareHint: "Your Tour result sits next to the engine's numbers.",
    hd: "High definition",
    hdReason: "Only for decks under 20 slides.",
    measureFirst: "What to measure first",
    measureItems: ["Visitors", "Activation rate", "Paid conversion", "Referred sign-ups"],
    confirmCheck: "I understand this erases every number on this device",
    confirmCheckError: "Tick this to erase.",
    window: "Activation window",
    windows: ["7 days", "14 days", "30 days"],
    dateLabel: "Start of the mission",
    parts: { day: "Day", month: "Month", year: "Year" },
    monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    note: "Your definition",
    summaryTitle: "3 things before this saves",
    summaryLead: "The first one blocks the save. The other two don't: the line saves and the export flags it.",
    save: "Save this number",
    group: "grouped as typed",
    dollar: "$",
  },
  fr: {
    legend: `Où en es-tu avec ce chiffre${NB}?`,
    choices: ["Je l'ai", "Je peux l'estimer", "Je le demande", "Je ne le trouve pas"],
    model: "Ton modèle",
    models: [
      "SaaS ou produit web, en libre-service (essai ou freemium)",
      "B2B avec une équipe commerciale",
      "Application grand public",
      "Place de marché",
    ],
    soon: "Bientôt",
    soonNote: "leur funnel n'a pas la même forme.",
    month: "Mois des flux",
    monthHint: `Visiteurs, inscriptions, dépense, churn et ARPA de ce mois-là. Par défaut${NB}: le dernier mois terminé.`,
    months: ["août 2026", "juillet 2026", "juin 2026", "mai 2026"],
    source: `D'où vient ce chiffre${NB}?`,
    choose: "Choisir…",
    sources: [
      { label: "Les outils d'où il vient d'habitude", options: ["Amplitude", "Mixpanel", "PostHog"] },
      { label: "Tout le reste", options: ["Google Analytics", "Stripe", "Un tableur", "Ailleurs"] },
    ],
    definition: "Ta définition",
    optional: "facultatif",
    company: "Le nom de ton SaaS ou de ton entreprise",
    companyValue: "Northwind Analytics",
    companyLong: "Northwind Analytics — l'outil de planning des kinés indépendants",
    companyHint: "Il n'apparaît que sur tes slides, et reste sur cet appareil comme tout le reste.",
    count: (n, m) => `${n} caractères sur ${m}`,
    parse: "Ce n'est pas un nombre lisible.",
    validation: "Le minimum dépasse le maximum.",
    missing: `À compléter — l'export signalera cette ligne comme incomplète.`,
    required: "Choisis où tu en es avec ce chiffre avant d'enregistrer.",
    activated: "Activés sous 7 jours",
    signups: "Inscrits en juillet 2026",
    outOf: "sur",
    minimum: "Bas de la fourchette",
    maximum: "Haut de la fourchette",
    to: "à",
    spend: "Dépense du mois",
    target: "Ta cible",
    currency: "Devise",
    confirm: "Tape EFFACER pour confirmer",
    compare: "Comparer avec ce Tour",
    compareHint: "Ton résultat du Tour se place à côté des chiffres du moteur.",
    hd: "Haute définition",
    hdReason: "Seulement pour les decks de moins de 20 slides.",
    measureFirst: "Ce qu'il faut mesurer d'abord",
    measureItems: ["Visiteurs", "Taux d'activation", "Conversion en payant", "Inscrits recommandés"],
    confirmCheck: "Je comprends que cela efface tous les chiffres de cet appareil",
    confirmCheckError: "Coche cette case pour effacer.",
    window: "Fenêtre d'activation",
    windows: ["7 jours", "14 jours", "30 jours"],
    dateLabel: "Début de la mission",
    parts: { day: "Jour", month: "Mois", year: "Année" },
    monthNames: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
    note: "Ta définition",
    summaryTitle: `3 choses avant d'enregistrer`,
    summaryLead: "La première bloque l'enregistrement. Les deux autres non : la ligne s'enregistre et l'export la signale.",
    save: "Enregistrer ce chiffre",
    group: "groupé à la frappe",
    dollar: "$",
  },
}[lang];
// French typography: a no-break space before : ; ! ? %
if (lang === "fr") T.summaryLead = T.summaryLead.replace(" :", `${NB}:`);

const noop = () => {};
const monthOptions = T.months.map((m, i) => ({ value: `2026-${String(8 - i).padStart(2, "0")}`, label: m }));
const sourceOptions = T.sources.map((g) => ({ label: g.label, options: g.options.map((o) => ({ value: o, label: o })) }));
const statusOptions = T.choices.map((c, i) => ({ value: `s${i}`, label: c }));
const n = (text) => groupAsTyped(text, lang);
const money = (value) =>
  lang === "fr" ? { suffix: "€", value: n(value) } : { prefix: "€", value: n(value) };

/* ── Board chrome ──────────────────────────────────────────────────────── */
const State = ({ name, force, wide, children }) => (
  <div className={`B_state ${wide ? "B_wide" : ""}`}>
    <p className="B_stateName">{name}</p>
    <div className={force ? `force-${force}` : undefined}>{children}</div>
  </div>
);
const Section = ({ id, title, note, children }) => (
  <section className="B_section" aria-labelledby={id}>
    <div className="B_head">
      <h2 id={id} className="B_title">{title}</h2>
      {note ? <p className="B_note">{note}</p> : null}
    </div>
    <div className="B_grid">{children}</div>
  </section>
);

/* A live field, so the grouping and the caret can be felt, not read. */
const LiveNumber = (props) => {
  const [v, setV] = useState(props.initial ?? "");
  return <NumberField {...props} value={v} onChange={setV} />;
};

/* Segmented as the synced system draws it, labelled by its Field (Q15). */
const SegmentedPreview = ({ labelledBy, options, value }) => (
  <div className="Segmented_group Segmented_md" role="radiogroup" aria-labelledby={labelledBy}>
    <div className="Segmented_track">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={o === value}
          className={`Segmented_option ${o === value ? "Segmented_on" : ""}`}
        >
          {o}
        </button>
      ))}
    </div>
  </div>
);

const Board = () => (
  <main className="B_main">
    <header className="B_header">
      <p className="B_kicker">Tour de Growth · extension 04 · {world} · {lang.toUpperCase()} · {width}px</p>
      <h1 className="B_h1">{lang === "fr" ? "Les primitives de formulaire" : "The form primitives"}</h1>
    </header>

    <Section id="tf" title="TextField" note="Field + one line. Count from 80% of the soft limit, in the label row.">
      <State name="empty · placeholder">
        <TextField label={T.company} optional={T.optional} value="" onChange={noop} maxLength={60} placeholder="Northwind" hint={T.companyHint} />
      </State>
      <State name="filled">
        <TextField label={T.company} optional={T.optional} value={T.companyValue} onChange={noop} maxLength={60} hint={T.companyHint} />
      </State>
      <State name="hover · pointer only · on paper the edge is already ink" force="hover">
        <TextField label={T.company} optional={T.optional} value={T.companyValue} onChange={noop} maxLength={60} />
      </State>
      <State name="focus-visible" force="focus">
        <TextField label={T.company} optional={T.optional} value={T.companyValue} onChange={noop} maxLength={60} />
      </State>
      <State name="close to the limit (count appears)">
        <TextField label={T.company} optional={T.optional} value={T.companyLong.slice(0, 52)} onChange={noop} maxLength={60} countLabel={T.count} />
      </State>
      <State name="over the soft limit">
        <TextField label={T.company} optional={T.optional} value={T.companyLong} onChange={noop} maxLength={60} countLabel={T.count} />
      </State>
      <State name="invalid">
        <TextField label={T.confirm} value="ERAES" onChange={noop} error={lang === "fr" ? "Ce n'est pas le mot demandé." : "That isn't the word asked for."} />
      </State>
      <State name="missing (saves, flagged)">
        <TextField label={lang === "fr" ? "Unité" : "Unit"} value="" onChange={noop} missing={T.missing} />
      </State>
      <State name="disabled, with its reason">
        <TextField label={T.company} value={T.companyValue} onChange={noop} disabled disabledReason={T.hdReason} />
      </State>
    </Section>

    <Section id="nf" title="NumberField" note={`Figures set right, tabular, in a box as wide as the magnitude. Unit inside, placed by locale. Live fields below: type, it groups (${T.group}).`}>
      <State name="empty">
        <NumberField label={T.spend} onChange={noop} locale={lang} {...money("")} unitName="euros" digits={9} />
      </State>
      <State name="filled · live">
        <LiveNumber label={T.spend} locale={lang} {...(lang === "fr" ? { suffix: "€" } : { prefix: "€" })} unitName="euros" digits={9} initial={n("26000")} />
      </State>
      <State name="filled · percent · live">
        <LiveNumber label={T.target} optional={T.optional} locale={lang} suffix={lang === "fr" ? `${NB}%` : "%"} unitName={lang === "fr" ? "pour cent" : "percent"} digits={4} initial="30" />
      </State>
      <State name="filled · millions">
        <NumberField label={T.signups} value={n("2000000")} onChange={noop} locale={lang} digits={11} />
      </State>
      <State name="hover" force="hover">
        <NumberField label={T.spend} onChange={noop} locale={lang} {...money("26000")} digits={9} />
      </State>
      <State name="focus-visible" force="focus">
        <NumberField label={T.spend} onChange={noop} locale={lang} {...money("26000")} digits={9} />
      </State>
      <State name="invalid · parse error (kept as typed)">
        <NumberField label={T.signups} value="12o" onChange={noop} locale={lang} digits={9} error={T.parse} />
      </State>
      <State name="missing">
        <NumberField label={T.signups} value="" onChange={noop} locale={lang} digits={9} missing={T.missing} />
      </State>
      <State name="disabled, with its reason">
        <NumberField label={T.spend} onChange={noop} locale={lang} {...money("26000")} digits={9} disabled disabledReason={T.hdReason} />
      </State>
      <State name="a count out of a count · FieldRow · one parse error" wide>
        <FieldRow joiner={T.outOf}>
          <NumberField label={T.activated} value={n("26000")} onChange={noop} locale={lang} digits={9} size="sm" />
          <NumberField label={T.signups} value="12o" onChange={noop} locale={lang} digits={9} size="sm" error={T.parse} />
        </FieldRow>
      </State>
      <State name="a range · FieldRow · validation error on the pair" wide>
        <FieldRow joiner={T.to} error={T.validation}>
          <NumberField label={T.minimum} value="40" onChange={noop} locale={lang} suffix={lang === "fr" ? `${NB}%` : "%"} digits={4} size="sm" />
          <NumberField label={T.maximum} value="20" onChange={noop} locale={lang} suffix={lang === "fr" ? `${NB}%` : "%"} digits={4} size="sm" />
        </FieldRow>
      </State>
    </Section>

    <Section id="sel" title="Select · DateField" note="Native select. An empty first option keeps 'not chosen yet' a value. Dates are selects in the page's language.">
      <State name="empty · not chosen yet">
        <Select label={T.source} value="" onChange={noop} placeholder={T.choose} options={sourceOptions} />
      </State>
      <State name="filled · grouped options">
        <Select label={T.source} value="Amplitude" onChange={noop} placeholder={T.choose} options={sourceOptions} />
      </State>
      <State name="hover" force="hover">
        <Select label={T.source} value="Amplitude" onChange={noop} options={sourceOptions} />
      </State>
      <State name="focus-visible" force="focus">
        <Select label={T.source} value="Amplitude" onChange={noop} options={sourceOptions} />
      </State>
      <State name="invalid">
        <Select label={T.source} value="" onChange={noop} placeholder={T.choose} options={sourceOptions} error={lang === "fr" ? "Choisis une source." : "Choose a source."} />
      </State>
      <State name="missing">
        <Select label={T.source} value="" onChange={noop} placeholder={T.choose} options={sourceOptions} missing={T.missing} />
      </State>
      <State name="disabled, with its reason">
        <Select label={T.currency} value="EUR" onChange={noop} fit="content" options={["EUR", "USD", "GBP", "CHF"].map((c) => ({ value: c, label: c }))} disabled disabledReason={T.hdReason} />
      </State>
      <State name="fit content · currency">
        <Select label={T.currency} value="EUR" onChange={noop} fit="content" options={["EUR", "USD", "GBP", "CHF"].map((c) => ({ value: c, label: c }))} />
      </State>
      <State name="DateField · month">
        <DateField precision="month" label={T.month} value="2026-08" onChange={noop} months={monthOptions} hint={T.monthHint} />
      </State>
      <State name="DateField · day · one part missing">
        <DateField precision="day" label={T.dateLabel} value={{ day: "29", month: "09", year: "" }} onChange={noop} monthNames={T.monthNames} years={[2025, 2026, 2027]} partLabels={T.parts} missing={T.missing} />
      </State>
    </Section>

    <Section id="ch" title="Choices" note="Native radios in a fieldset, drawn with AnswerOption's ring. Two columns from a 560px container.">
      <State name="empty · nothing chosen · 2 columns" wide>
        <Choices legend={T.legend} options={statusOptions} value={null} onChange={noop} columns={2} />
      </State>
      <State name="selected" wide>
        <Choices legend={T.legend} options={statusOptions} value="s0" onChange={noop} columns={2} />
      </State>
      <State name="hover (2nd) · focus-visible (1st)" force="hover-focus" wide>
        <Choices legend={T.legend} options={statusOptions} value="s0" onChange={noop} columns={2} />
      </State>
      <State name="invalid · nothing chosen on save" wide>
        <Choices legend={T.legend} options={statusOptions} value={null} onChange={noop} columns={2} error={T.required} />
      </State>
      <State name="disabled with a reason · compact (sheet)" wide>
        <Choices
          legend={T.model}
          size="sm"
          value="m0"
          onChange={noop}
          options={T.models.map((m, i) => ({
            value: `m${i}`,
            label: m,
            disabled: i > 0,
            disabledLead: T.soon,
            disabledNote: T.soonNote,
          }))}
        />
      </State>
    </Section>

    <Section id="cb" title="Checkbox" note="A drawn 20px square on a native checkbox. A list is a fieldset with a legend and plain rows.">
      <State name="unchecked">
        <Checkbox label={T.compare} hint={T.compareHint} checked={false} onChange={noop} />
      </State>
      <State name="checked (selected)">
        <Checkbox label={T.compare} hint={T.compareHint} checked onChange={noop} />
      </State>
      <State name="hover" force="hover">
        <Checkbox label={T.compare} checked={false} onChange={noop} />
      </State>
      <State name="focus-visible" force="focus">
        <Checkbox label={T.compare} checked onChange={noop} />
      </State>
      <State name="invalid">
        <Field group label={T.confirm} error={T.confirmCheckError} size="sm">
          {() => <Checkbox label={T.confirmCheck} checked={false} invalid onChange={noop} />}
        </Field>
      </State>
      <State name="disabled, with its reason">
        <Checkbox label={T.hd} checked={false} disabled disabledReason={T.hdReason} onChange={noop} />
      </State>
      <State name="a list · Field group" wide>
        <Field group label={T.measureFirst} size="sm">
          {() => (
            <div>
              {T.measureItems.map((m, i) => (
                <Checkbox key={m} label={m} checked={i % 2 === 0} onChange={noop} />
              ))}
            </div>
          )}
        </Field>
      </State>
    </Section>

    <Section id="wrap" title="Field around the others" note="Segmented and TextArea keep their own look; Field gives them their visible label.">
      <State name="Segmented, labelled by its Field">
        <Field group label={T.window}>
          {({ labelId }) => <SegmentedPreview labelledBy={labelId} options={T.windows} value={T.windows[0]} />}
        </Field>
      </State>
      <State name="TextArea · optional · filled">
        <Field label={T.definition} optional={T.optional}>
          {({ id, describedBy }) => (
            <TextArea id={id} aria-describedby={describedBy} value={lang === "fr" ? "Actif = au moins un projet modifié." : "Active = at least one project edited."} onChange={noop} maxLength={200} rows={3} />
          )}
        </Field>
      </State>
      <State name="TextArea · over the soft limit">
        <Field label={T.definition} optional={T.optional}>
          {({ id, describedBy }) => (
            <TextArea id={id} aria-describedby={describedBy} value={T.companyLong + " " + T.companyHint + " " + T.monthHint} onChange={noop} maxLength={120} rows={3} />
          )}
        </Field>
      </State>
      <State name="TextArea · focus-visible" force="focus">
        <Field label={T.definition} optional={T.optional}>
          {({ id, describedBy }) => <TextArea id={id} aria-describedby={describedBy} value="" onChange={noop} maxLength={200} rows={3} />}
        </Field>
      </State>
    </Section>

    <Section id="sum" title="FormSummary · and the button it sits over" note="One line per field, each a link to it. The primary action stays the loudest thing.">
      <State name="a refused save" wide>
        <div className="B_stack">
          <FormSummary
            title={T.summaryTitle}
            lead={T.summaryLead}
            items={[
              { targetId: "x1", label: T.signups, message: T.parse, kind: "invalid" },
              { targetId: "x2", label: lang === "fr" ? "Unité" : "Unit", kind: "missing" },
              { targetId: "x3", label: T.source, kind: "missing" },
            ]}
          />
          <div>
            <button type="button" className="Button_button Button_primary Button_md">
              {T.save}
            </button>
          </div>
        </div>
      </State>
      <State name="the sheet, compact, next to its button" wide>
        <div className="B_stack B_sheet">
          <Choices legend={T.legend} options={statusOptions} value="s0" onChange={noop} columns={2} size="sm" />
          <FieldRow joiner={T.outOf}>
            <NumberField label={T.activated} value={n("26000")} onChange={noop} locale={lang} digits={9} size="sm" />
            <NumberField label={T.signups} value={n("120000")} onChange={noop} locale={lang} digits={9} size="sm" />
          </FieldRow>
          <Select label={T.source} value="Amplitude" onChange={noop} placeholder={T.choose} options={sourceOptions} size="sm" />
          <TextField label={T.definition} optional={T.optional} value="" onChange={noop} maxLength={200} size="sm" />
          <div>
            <button type="button" className="Button_button Button_primary Button_md">
              {T.save}
            </button>
          </div>
        </div>
      </State>
    </Section>
  </main>
);

const host = document.getElementById("root");
host.setAttribute("data-world", world);
document.body.setAttribute("data-world", world);
document.body.style.setProperty("--board-width", `${width}px`);
document.body.classList.add(width === 390 ? "B_phone" : "B_desk");
createRoot(host).render(<Board />);
