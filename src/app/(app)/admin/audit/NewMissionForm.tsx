"use client";

import { useState } from "react";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { Segmented } from "@/components/core/Segmented";
import { AUDIT_PROFILE_MODELS, type AuditProfileModel } from "@/lib/audit/profiles";
import { ACV_BANDS, CONTRACT_TERMS, MANDATES, type AcvBand, type ContractTerm, type Mandate, type MissionHeader } from "@/lib/audit/schema";
import { LOCALES, type Locale } from "@/lib/i18n/locale";
import { Checkbox } from "@/components/core/Checkbox";
import { Field } from "@/components/core/Field";
import { Select } from "@/components/core/Select";
import { TextField } from "@/components/core/TextField";
import { IsoDateField } from "./IsoDateField";
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
        <Button size="sm" variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
      </div>

      <Card elevation="panel" className={styles.form}>
        <TextField
          size="sm"
          id="company"
          label="Entreprise"
          hint="Le seul champ que la purge efface. Il ne quitte jamais cet appareil."
          value={company}
          onChange={setCompany}
          autoFocus
          placeholder="Nom de l'entreprise"
        />

        {/* A Segmented in a form: its label shown by the Field, and its name that label (extension 04, Q15). */}
        <Field group size="sm" id="mandate" label="Mandat" hint="Sans mandat, le livrable dit « diagnostic » et jamais « audit ».">
          {({ labelId }) => (
            <Segmented<Mandate>
              labelledBy={labelId}
              value={mandate}
              options={MANDATES.map((id) => ({ id, label: MANDATE_LABELS[id] }))}
              onChange={setMandate}
            />
          )}
        </Field>

        <Select
          size="sm"
          id="model"
          label="Modèle"
          hint="Il décide des lignes applicables du catalogue."
          value={model}
          options={optionsFrom(AUDIT_PROFILE_MODELS, PROFILE_MODEL_LABELS)}
          onChange={(value) => value && setModel(value)}
        />

        <Select
          size="sm"
          id="acv"
          label="Tranche d'ACV"
          hint="Annual Contract Value : le montant annuel d'un contrat client type, dans la devise déclarée plus bas. Sert de repère à la couverture de pipeline. « Sans objet » pour un modèle sans contrat annuel."
          value={acvBand}
          options={optionsFrom(ACV_BANDS, ACV_BAND_LABELS)}
          onChange={(value) => value && setAcvBand(value)}
        />

        <Select
          size="sm"
          id="term"
          label="Durée d'engagement"
          value={contractTerm}
          options={optionsFrom(CONTRACT_TERMS, CONTRACT_TERM_LABELS)}
          onChange={(value) => value && setContractTerm(value)}
        />

        <TextField
          size="sm"
          id="scope"
          label="Périmètre"
          hint="Entité, ligne de produit, région. Écrire « tout » plutôt que laisser vide."
          value={scope}
          onChange={setScope}
        />

        <TextField size="sm" id="currency" label="Devise" value={currency} onChange={setCurrency} />

        <Select
          size="sm"
          id="locale"
          label="Langue du livrable"
          hint="L'outil reste en français quelle que soit cette valeur."
          value={deliverableLocale}
          options={optionsFrom(LOCALES, LOCALE_LABELS)}
          onChange={(value) => value && setDeliverableLocale(value)}
        />

        <IsoDateField id="passDate" label="Date d'arrêté de la passe 1" value={passDate} onChange={setPassDate} />

        <Checkbox id="showTourScore" label="Montrer le score du Tour dans le livrable" checked={showTourScore} onChange={setShowTourScore} />

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
