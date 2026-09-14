"use client";

import { useState } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { Segmented } from "@/components/core/Segmented";
import { AUDIT_PROFILE_MODELS, type AuditProfileModel } from "@/lib/audit/profiles";
import { ACV_BANDS, CONTRACT_TERMS, MANDATES, type AcvBand, type ContractTerm, type Mandate, type MissionHeader } from "@/lib/audit/schema";
import { LOCALES, type Locale } from "@/lib/i18n/locale";
import { DateInput } from "./_ui/DateInput";
import { Field } from "./_ui/Field";
import { Select } from "./_ui/Select";
import { TextInput } from "./_ui/TextInput";
import { ACV_BAND_LABELS, CONTRACT_TERM_LABELS, MANDATE_LABELS, PROFILE_MODEL_LABELS, optionsFrom } from "./labels";
import styles from "./page.module.css";

const LOCALE_LABELS: Record<Locale, string> = { fr: "Français", en: "Anglais" };

/**
 * Créer une mission, et sa première passe dans le même geste (décision 6 du
 * §3.3 : une seconde passe est un besoin à six mois, son écran est en phase
 * 2). D'où la date d'arrêté demandée ici : c'est celle de la passe 1.
 *
 * Deux défauts sont des DÉCISIONS PRODUIT, pas des commodités :
 * - `mandate` vaut `no-mandate` (q1). Le mandat change le vocabulaire de tout
 *   le livrable (`deliverableVocabulary`), et se tromper dans ce sens-là est
 *   le seul sens sûr : sans mandat, le document ne dit jamais « audit ».
 * - `showTourScore` est décoché (q3). Montrer un score à une direction est un
 *   arbitrage par mission, jamais le défaut.
 */
export function NewMissionForm({
  today,
  onCancel,
  onCreate,
}: {
  today: string;
  onCancel: () => void;
  onCreate: (header: MissionHeader, passDate: string) => void;
}) {
  const [company, setCompany] = useState("");
  const [mandate, setMandate] = useState<Mandate>("no-mandate");
  const [model, setModel] = useState<AuditProfileModel>("b2b-assiste");
  const [acvBand, setAcvBand] = useState<AcvBand>("25k-100k");
  const [contractTerm, setContractTerm] = useState<ContractTerm>("annual");
  const [scope, setScope] = useState("tout");
  const [currency, setCurrency] = useState("EUR");
  const [deliverableLocale, setDeliverableLocale] = useState<Locale>("fr");
  const [showTourScore, setShowTourScore] = useState(false);
  const [passDate, setPassDate] = useState(today);

  const canCreate = company.trim().length > 0 && passDate.length === 10;

  return (
    <section className={styles.screen}>
      <div className={styles.screenHead}>
        <h2 className={styles.h2}>Nouvelle mission</h2>
        <Button compact variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
      </div>

      <Card elevation="panel" className={styles.form}>
        <Field label="Entreprise" htmlFor="company" hint="Le seul champ que la purge efface. Il ne quitte jamais cet appareil.">
          <TextInput id="company" value={company} onChange={setCompany} autoFocus placeholder="Nom de l'entreprise" />
        </Field>

        <Field label="Mandat" htmlFor="mandate" hint="Sans mandat, le livrable dit « diagnostic » et jamais « audit ».">
          <Segmented<Mandate>
            label="Mandat"
            value={mandate}
            options={MANDATES.map((id) => ({ id, label: MANDATE_LABELS[id] }))}
            onChange={setMandate}
            size="compact"
          />
        </Field>

        <Field label="Modèle" htmlFor="model" hint="Il décide des lignes applicables du catalogue.">
          <Select id="model" value={model} options={optionsFrom(AUDIT_PROFILE_MODELS, PROFILE_MODEL_LABELS)} onChange={setModel} />
        </Field>

        <Field label="Tranche d'ACV" htmlFor="acv">
          <Select id="acv" value={acvBand} options={optionsFrom(ACV_BANDS, ACV_BAND_LABELS)} onChange={setAcvBand} />
        </Field>

        <Field label="Durée d'engagement" htmlFor="term">
          <Select id="term" value={contractTerm} options={optionsFrom(CONTRACT_TERMS, CONTRACT_TERM_LABELS)} onChange={setContractTerm} />
        </Field>

        <Field label="Périmètre" htmlFor="scope" hint="Entité, ligne de produit, région. Écrire « tout » plutôt que laisser vide.">
          <TextInput id="scope" value={scope} onChange={setScope} />
        </Field>

        <Field label="Devise" htmlFor="currency">
          <TextInput id="currency" value={currency} onChange={setCurrency} />
        </Field>

        <Field label="Langue du livrable" htmlFor="locale" hint="L'outil reste en français quelle que soit cette valeur.">
          <Select id="locale" value={deliverableLocale} options={optionsFrom(LOCALES, LOCALE_LABELS)} onChange={setDeliverableLocale} />
        </Field>

        <Field label="Date d'arrêté de la passe 1" htmlFor="passDate">
          <DateInput id="passDate" value={passDate} onChange={setPassDate} />
        </Field>

        <div className={styles.checkboxRow}>
          <input
            id="showTourScore"
            type="checkbox"
            checked={showTourScore}
            onChange={(event) => setShowTourScore(event.target.checked)}
          />
          <label htmlFor="showTourScore">Montrer le score du Tour dans le livrable</label>
        </div>

        <Button
          onClick={() =>
            onCreate(
              {
                company: company.trim(),
                mandate,
                profile: { model, acvBand, contractTerm },
                scope: scope.trim(),
                currency: currency.trim(),
                deliverableLocale,
                showTourScore,
              },
              passDate,
            )
          }
          data-testid="create-mission"
          {...(canCreate ? {} : { disabled: true })}
        >
          Créer la mission
        </Button>
      </Card>
    </section>
  );
}
