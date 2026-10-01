# ENGINE.md, partie 3 — le moteur complet (§19)

*Écrite le 2026-10-01, directement dans `docs/engine/` : le numéro de section
suit le §18, et un renvoi « `ENGINE.md` §19.3 » se lit ici. Les décisions du
moteur et la trame des entretiens restent dans [`ENGINE.md`](../../ENGINE.md) ;
la v1 libre-service est dans [`v1.md`](v1.md), le B2B assisté et l'hybride
dans [`assiste-et-hybride.md`](assiste-et-hybride.md).*

---

## 19. Le moteur complet — spécification A14.a, validée le 2026-10-01 (C32)

*Premier jet du 2026-10-01, demandé par Antoine (« on devrait gérer tout ce
que tu listes dans le point 3 »), écrit contre le code de `main` (`d70ea4f`)
et non contre les documents. **Validée par Antoine le même jour** (C32) : ses
dix-neuf réponses sont en §19.15, et les sections qu'elles changent sont
corrigées (Q1 en §19.0 et §19.14, Q5 en §19.2.6, Q17 en §19.11). Rien n'est
encore codé. Toute la copie citée est de la copie
neuve, **`TODO: à relire`** (convention 6), et sa typographie finale est posée
dans `content/engine-*.ts`, pas dans ce document.*

*Vérifié pour ce jet : `types.ts` (`EngineState`, `Snapshot`, `MetricEntry`,
`EngineSetup`, `EngineDeck`, `ToolId`, `SourceRef`, `FixedSlideId`),
`catalog-shape.ts` (`sources`, `UNPRICED_CANDIDATES`, leviers),
`engine-catalog.ts` (`where`), `values.ts` (`currentSnapshot`), `cohort.ts`,
`validate.ts`, `io.ts`, `storage.ts`, `migrate.ts`, `impact.ts`,
`slg-impact.ts`, `scenario.ts` (levier `ref.referred-share`), `collect.ts`,
`request.ts`, `deck.ts` (fuite, « Et si », `notes.seasonal`),
`golden-v1.test.ts` et ses entrées, et côté îlot `EngineWorkbench.tsx`,
`Setup.tsx`, `MetricSheet.tsx`, `ValueEditor.tsx`, `sources.ts`,
`sheet-draft.ts`, `CollectHub.tsx`, `ImportPanel.tsx`, `DeckView.tsx`,
`SlideFrame.tsx`, `deck.module.css`, `export-png.ts`. Hors de l'îlot :
`ResultView.tsx`, `LastResult.tsx`, `SpaceBand.tsx`, `lib/og/`,
`lib/i18n/meta.ts`, `engine/access.ts`, `lib/analytics/goatcounter.ts`,
`legal.ts`, `engine-boundary.test.ts`.*

---

### 19.0 En une page

**Ce qui change.** Onze chantiers, tous pour le SaaS B2B (libre-service,
assisté ou les deux), qu'aucun nouveau type d'entreprise n'accompagne :

1. **La série mensuelle** (§19.2) : « Démarrer septembre » ouvre un nouveau
   mois, les mois passés se relisent, chaque chiffre dit de combien il a
   bougé, et une slide « Ce qui a bougé » entre dans le deck.
2. **La rétention J30 et la part recommandée chiffrées en €** (§19.3), dans
   les deux motions pour la recommandation.
3. **La couverture du pipeline** de l'assisté (§19.4), le seul indicateur
   avancé, lue contre un seuil d'équipe seulement.
4. **Tes outils au réglage** (§19.5) : la fiche les propose d'abord, et la
   liste « À faire toi-même » se range par outil.
5. **Le contrôle « deux outils »** (§19.5) : un numérateur et un dénominateur
   tirés de deux outils différents déclenchent un « à vérifier ».
6. **Coller un tableau** (§19.6) : un modèle CSV à remplir dans un tableur,
   recollé d'un coup, avec un aperçu avant d'écrire quoi que ce soit.
7. **Plusieurs moteurs par appareil** (§19.1) : un par entreprise ou par
   produit, avec un sélecteur.
8. **La fusion à l'import** (§19.7) : un fichier peut s'ajouter comme nouveau
   moteur, remplacer l'actuel, ou y fusionner ses mois.
9. **Un thème de slide sur fond blanc** (§19.8), pour les gabarits
   d'entreprise.
10. **Les rappels `.ics`** (§19.9) : relancer une demande, démarrer le mois
    suivant.
11. **Deux portes d'entrée** (§19.10, §19.11) : une ligne depuis le résultat
    du propriétaire, une ligne de reprise sur l'accueil, et une image de
    partage propre à la page.

Ce lot corrige aussi un défaut relevé en le préparant : `ALL_TOOLS`
(`_engine/sources.ts:7-24`) oublie `pipedrive` et `cs-platform`, qui
n'apparaissent donc jamais sous « Autres outils ».

**Ce qui ne change pas.**
- Tout reste local : aucun chiffre ni texte saisi ne quitte le navigateur, y
  compris un tableau collé ou un rappel exporté. Le canari couvre les
  nouvelles saisies.
- La saisie se fait en comptes ; le diagnostic et les montants sont
  déterministes, avec leur hypothèse imprimée au pied de la slide.
- **C1** : seule une cible d'équipe désigne une fuite. Aucun repère publié
  n'entre ici, et la couverture du pipeline ne se lit que contre ton seuil.
- **Jamais de face-à-face** entre motions, ni entre mois : « Ce qui a bougé »
  suit l'ordre AARRR, jamais un classement par écart.
- **Un fichier v1 ou v2 s'ouvre sans perte** et donne, au caractère près, le
  même tableau et les mêmes slides (le golden v1 reste vert : aucun de ses
  jeux n'a de cible sur la rétention J30 ou la part recommandée, vérifié).
- Toute la copie neuve est « à relire », et son bon à tirer (A14.d) passe
  avant l'ouverture.

**Ce qui reste hors de ce lot.** L'export PowerPoint (la spec v1 le réserve
au cas où les retours le demandent), l'app grand public et la place de
marché, le chiffrage de la mise en service assistée (il faudrait relier la
mise en service au renouvellement, §18.5.2), et des recettes vérifiées outil
par outil (§19.5).

**L'ouverture attend ce lot** (Q1, Antoine, 2026-10-01) : le moteur n'ouvre
au public qu'une fois A14 livré et sa copie relue (A14.d).

**Chiffrage.** Huit PR, chacune mergée sur `main` dès qu'elle est verte,
drapeau fermé : ~16,5 jours-agent (§19.14).

---

### 19.1 Le socle : le fichier v3 et plusieurs moteurs par appareil

#### 19.1.1 Pourquoi une version 3

Le lot ajoute des champs (§19.1.2) et, surtout, donne un sens à plusieurs
`snapshots`. Un build d'avant lirait un fichier à plusieurs mois en ne
montrant que le dernier, sans le dire. Une version 3 le fait refuser
proprement (`io.ts:74`, « version inconnue »), comme aujourd'hui pour une
version supérieure à 2.

#### 19.1.2 Types (`src/lib/engine/types.ts`)

```ts
// EngineSetup, nouveaux champs
tools: ToolId[];               // §19.5 — vide = « pas dit » ; jamais requis
pipeline?: {                   // §19.4 — assisté seulement
  quarterTarget?: number;      // objectif de nouveaux contrats du trimestre, en ACV
  threshold?: number;          // seuil d'équipe, en multiple (2.5 = « 2,5× »)
};

// Snapshot, nouveaux champs
closedAt?: string;             // ISO : posé quand le mois suivant démarre (§19.2.3)
windows?: SnapshotWindows;     // les fenêtres du réglage au moment de la clôture
pipelineOpen?: number;         // §19.4 — pipeline ouvert du trimestre, en ACV

// MetricEntry, nouveau champ
denominatorSource?: SourceRef; // §19.5 — absent = même source que le numérateur

// EngineDeck, nouveau champ
theme: "paper" | "white";      // §19.8 — "paper" par défaut

// Slides
type FixedSlideId = … | "evolution";   // §19.2.6 ; "slg:evolution" en hybride
```

`schemaVersion: 3` ; `EngineStore` devient l'index du §19.1.4.

*Écart au code, T0 (2026-10-01).* `tools` et `theme` sont **optionnels** :
absent veut dire « pas dit » pour l'un, `"paper"` pour l'autre. La migration
n'écrit donc que la version (§19.1.3), un moteur créé par T0 n'a rien de plus
à porter, et le golden v2 compare un v2 migré à un état identique au
caractère près. `EngineStore` reste la forme d'**une entrée**
(`{ schemaVersion, state }`, celle du v2 sous sa clé unique) et l'index a son
propre type, `EngineIndex`. Enfin, `MAX_MONTHS` (36) et `MAX_ENGINES` (10)
sont des constantes de `types.ts`.

#### 19.1.3 Migration (`migrate.ts`)

`migrateToV3(input)` enchaîne : un v1 passe par `migrateToV2` (inchangé, que
le golden appelle encore), puis un v2 reçoit la version 3, et rien d'autre
(`setup.tools` et `deck.theme` restent absents, voir l'écart du §19.1.2). Aucun id ne change, aucun chiffre n'est
recalculé. Les tests qui attendent aujourd'hui le refus d'un v3
(`io.test.ts:65-70`, `storage.test.ts:94-114`, `migrate.test.ts:77`) passent
au refus d'un v4.

#### 19.1.4 Stockage (`storage.ts`) : plusieurs moteurs

- **Un index** sous `tdg.engines.v3` : `{ schemaVersion: 3, activeId, order:
  id[] }`.
- **Une entrée par moteur** sous `tdg.engine.v3.<id>` : un moteur qui ne
  s'écrit pas ne corrompt pas les autres, et le quota de `localStorage` reste
  loin (un moteur de 24 mois pèse quelques dizaines de Ko).
- **La reprise de l'ancien** : `tdg.engine.v2` (et `tdg.engine.v1` derrière
  lui) se lit une fois, migre en mémoire et devient le premier moteur de
  l'index. L'ancienne clé ne s'efface qu'après une sauvegarde exportée plus
  récente, comme aujourd'hui pour le v1 (`storage.ts:116-120`).
- **Au plus 10 moteurs** (Q12). « Nouveau moteur » est grisé au-delà, avec la
  raison.
- `saveEngine` refuse toujours d'écraser une entrée illisible.

#### 19.1.5 Écrans

- **Le sélecteur** : en tête du tableau, « Moteur : {nom} ▾ ». Le nom est
  `companyLabel`, sinon « Moteur sans nom, créé le {date} ». La liste propose
  chaque moteur, puis « Nouveau moteur » (le réglage) et « Supprimer ce
  moteur ».
- **Supprimer** demande une confirmation qui propose d'abord d'exporter la
  sauvegarde, et ne touche jamais aux autres moteurs.
- **L'export et l'import** portent toujours sur un moteur (§19.7).

#### 19.1.6 Validation (`validate.ts`)

Règles neuves : au plus 36 mois ; `referenceMonth` strictement croissant et
unique ; `closedAt` présent sur tous les mois sauf le dernier ; `tools` sans
doublon et dans `ToolId` ; `pipeline` positif. Le validateur reste indulgent
pour ce qui traîne (`validate.ts:32`) et strict pour ce que le statut exige.

---

### 19.2 La série mensuelle

#### 19.2.1 Ce que voit la personne

À partir du moment où le mois des flux est clos (le dernier mois fermé de
`cohort.ts:93-95` est postérieur au `referenceMonth` du dernier mois), le
bandeau de reprise propose **« Démarrer septembre »**. Le nouveau mois
s'ouvre vide de chiffres, avec ses cibles et ses définitions reprises
(§19.2.2). Dès qu'un chiffre est saisi dans les deux mois, sa ligne dit de
combien il a bougé : « 24 % · +6 pts depuis août ». La slide « Ce qui a
bougé » entre dans le deck.

#### 19.2.2 Ce que le mois suivant reprend (Q2)

| Repris | Jamais repris |
|---|---|
| Les cibles (`targets`) | Les valeurs, même estimées |
| Pour chaque chiffre : la variante, le libellé, la note de définition, la source et `denominatorSource`, comme **valeurs proposées** dans la fiche | Les comptes partagés (`base`) : ce sont ceux du mois |
| Les réglages (`setup`), qui restent au niveau du moteur | Les demandes en cours (`request`) : elles portaient sur le mois d'avant, et la liste « À demander » repart des chiffres manquants |
| `whatIf` et `deck`, qui restent au niveau du moteur | `conflict`, `missing`, `naReason` : un constat se refait chaque mois |

#### 19.2.3 Les mois passés gardent leur date (`closedAt`, `windows`)

Aujourd'hui, les périodes de l'assisté et le classement des cohortes
« immatures » dépendent de la date du jour (`values.ts:141-142`,
`cohort.ts:155-168`). Relu en novembre, un mois d'août changerait donc de
période et de niveau de confiance. Démarrer un mois pose sur le précédent
`closedAt` (la date du jour) et `windows` (les fenêtres du réglage à ce
moment-là). Tous les calculs d'un mois passé prennent `closedAt` pour « aujourd'hui »,
et ses fenêtres à lui : un mois clos se relit tel qu'il a été vu.

#### 19.2.4 Relire et corriger un mois passé (Q3)

Un sélecteur « Mois : août ▾ » à côté du sélecteur de moteur affiche un mois
passé **en lecture seule** : le même tableau, sans « Et si » ni bouton de
saisie, avec le bandeau « Tu regardes août. Revenir à septembre ». Un bouton
« Corriger ce mois » ouvre la saisie sur ce mois. Les écarts du mois suivant
se recalculent, et le deck se construit toujours sur le dernier mois.

#### 19.2.5 Les écarts d'un mois à l'autre (Q4)

Un écart ne s'affiche que si les deux mois sont **comparables** :
- les deux valeurs sont mesurées, du même type (deux taux en comptes, deux
  montants…), avec la même variante ;
- les fenêtres du chiffre sont les mêmes dans les deux mois (`windows`) ;
- la note de définition n'a pas changé.

Sinon, la ligne dit pourquoi : « définition changée », « estimé en août »,
« pas mesuré en août ».

Forme : les taux en points (« +6 pts »), les montants et les durées en valeur
et en pour cent (« +1 200 € · +8 % »), les comptes en valeur. **Une flèche et
un signe, jamais de couleur** : le moteur ne réserve le rouge qu'à la fuite.
Le mot « vers ta cible » s'ajoute seulement quand une cible existe et que
l'écart s'en rapproche. Le diagnostic gagne une ligne quand la fuite a changé
d'étape : « En août, la fuite était Activation. »

Tout vit dans un module pur, `lib/engine/series.ts`
(`comparable(prev, cur, shape)`, `delta(prev, cur, shape)`), qui ne lit
jamais la date du jour.

#### 19.2.6 La slide « Ce qui a bougé » (Q5)

- **Place** : après la fuite et ses « Et si », avant la visibilité. En
  hybride, une par motion, chacune dans le groupe de sa motion (`evolution`,
  `slg:evolution`).
- **Titre** : « {n} chiffres ont bougé depuis août ; {étape} reste la fuite »
  (ou « devient la fuite »). Quand rien n'est comparable : « Août et septembre
  ne se comparent pas encore », et la slide dit pourquoi.
- **Corps** : au plus six lignes, dans l'ordre AARRR, jamais triées par
  écart, chacune « Activation : 18 % → 24 % (+6 pts) ».
- **Décochée par défaut** (Q5, Antoine, 2026-10-01) : elle se propose dès
  que deux mois existent et qu'un écart au moins est comparable, et la
  personne la coche.
- **La note d'orateur** `notes.seasonal` (« la comparaison viendra avec le
  suivant », `engine-copy.ts:1809-1811`) cède la place à `notes.series` dès le
  deuxième mois. Un fichier à un seul mois garde la note d'aujourd'hui, au
  caractère près.

*Écarts au code, T1 (2026-10-01).*
- **La forme d'une ligne** : « Activation : 15 %, puis 18 % (+3 points) »,
  sans flèche. Les trois polices des slides ne dessinent pas « → » (§10.4,
  gardé par `engine-copy.test.ts`) ; une slide qui veut la flèche la dessine,
  comme la slide de la demande. Les points s'écrivent « points », comme sur les
  slides « Et si », et pas « pts ».
- **« Vers la cible »** ne se dit que d'un chiffre qui était **en retard** sur
  sa cible le mois d'avant, et qui a bougé dans le bon sens. « S'en rapprocher »
  à la lettre aurait écrit « vers la cible » sous une activation tombée de 25 %
  à 18 % pour une cible à 20 %. Seule la cible d'une étape candidate a un sens ;
  celle d'un autre chiffre ne dit jamais « vers ».
- **La slide existe dès le deuxième mois**, décochée, même quand rien ne se
  compare : c'est le cas « ne se comparent pas encore », qui dit pourquoi. Elle
  n'est cochée par défaut dans aucun cas (Q5).
- **Ses identifiants** ne sont pas des `FixedSlideId` mais un type à part,
  `SeriesSlideId` (`"evolution" | "slg:evolution"`) : un moteur à un mois, donc
  tout fichier v1 ou v2, n'a pas de slide de ce nom, et ses goldens n'en voient
  aucune.
- **Le corps** montre au plus six chiffres qui ont bougé, dans l'ordre du
  catalogue. Quand aucun n'a bougé, il montre ceux qui sont restés stables
  (« Rien n'a bougé depuis juillet »). Quand rien ne se compare, il donne la
  raison de chacun, sauf pour un chiffre qui manque encore ce mois-ci.
- **Le composant de la slide** est livré avec T1, en version minimale (les lignes
  « À côté » de la slide de fuite), pour qu'aucune slide du modèle ne reste sans
  rendu. Sa mise en page propre vient avec T2.

---

### 19.3 La rétention J30 et la part recommandée en €

Aujourd'hui, `UNPRICED_CANDIDATES` (`catalog-shape.ts:837`) exclut du
chiffrage `ret.d30`, `ref.referred-share`, `slg.act.go-live` et
`slg.ref.referred-share` : « il faudrait un modèle de rétention et un modèle
de boucle » (`impact.ts:35-37`). Ce lot en chiffre trois, avec un modèle
simple et dit.

#### 19.3.1 La rétention J30 (libre-service, Q6)

**Hypothèse** : les payants sont supposés parmi les inscrits encore actifs à
J30. C'est le prolongement de celle qui chiffre déjà l'activation (« les
payants sont supposés parmi les activés », `engine-copy.ts:1435`). Aucune
fenêtre de paiement proposée (30, 60, 90 jours) n'est plus courte que 30
jours, donc l'hypothèse ne contredit aucun réglage.

**Calcul**, la même chaîne que l'activation (`impact.ts:98-101`) : N nouveaux
payants par mois × (cible ÷ réel − 1) × ARPA. Le pied de slide dit
l'hypothèse. Dans le « Et si », `ret.d30` devient un levier, et le nombre de
payants y suit le produit activation × J30.

*Rejeté* : chiffrer la rétention J30 comme un churn de clients payants. Ce
sont des inscrits, pas des clients, et le montant serait faux d'un ordre de
grandeur.

#### 19.3.2 La part recommandée (les deux motions, Q7)

La formule existe déjà dans le « Et si » (`scenario.ts:260-265`, hypothèse
`referral-on-top`) : S' = S × (1 − r) ÷ (1 − t), où r est la part réelle et t
la cible. Le chiffrage la reprend telle quelle, pour que la slide de fuite et
le « Et si » ne se contredisent jamais :
- **Libre-service** : inscrits en plus = S × ((1 − r) ÷ (1 − t) − 1), × la
  conversion inscription → payant × ARPA. Pied : « les inscrits recommandés
  s'ajoutent aux autres et convertissent comme eux ».
- **Assisté** (`slg.ref.referred-share`) : opportunités en plus = O × ((1 − r)
  ÷ (1 − t) − 1), × taux de closing × ACV ÷ 12, sur le trimestre puis par
  mois, comme le passage lead → opportunité (`slg-impact.ts:93`). Il devient
  aussi un levier « Et si ».
- **Borne** : une cible au-delà de 50 % n'est pas chiffrée. Le multiplicateur
  explose quand t approche 100 %, et la slide le dit (« au-delà de 50 %, le
  moteur ne chiffre plus »).

#### 19.3.3 Ce qui reste sans montant

`slg.act.go-live` seul. `leakClearUnpriced` et son pied (C9) restent pour lui.

---

### 19.4 La couverture du pipeline (assisté, Q8)

**Pourquoi elle était hors v1** (Q15 de C25) : elle suppose un objectif de
revenu et un seuil qui dépend du ticket, donc un repère qu'on n'a pas. La
fourchette de l'audit (« 3× à 6× ») est exclue par la décision 6.

**Proposition** : ni un seizième chiffre, ni une étape diagnostiquée, mais un
**indicateur avancé** sur la carte des relais :
- deux nombres saisis, « Pipeline ouvert du trimestre (en ACV) » au mois
  (`pipelineOpen`), et « Objectif de nouveaux contrats du trimestre (en ACV) »
  au réglage (`pipeline.quarterTarget`) ;
- un seuil d'équipe facultatif (`pipeline.threshold`) ;
- l'affichage « Couverture : 2,6× l'objectif du trimestre », complété par
  « sous ton seuil de 3× » quand un seuil existe et n'est pas tenu.

Elle n'est jamais une fuite, jamais chiffrée en €, jamais comparée à un repère
publié (C1). Elle entre dans la slide des relais et dans la série (§19.2).

---

### 19.5 Les outils : au réglage, dans la collecte, et le contrôle « deux outils »

#### 19.5.1 « Tes outils » au réglage (Q9)

Une liste facultative, rangée par famille :
- analytics produit : GA4, Mixpanel, Amplitude, PostHog ;
- facturation : Stripe, Chargebee, ChartMogul ;
- CRM : HubSpot, Salesforce, Pipedrive ;
- publicité : Google Ads, Meta Ads, LinkedIn Ads ;
- autres : base produit, tableur, plateforme de customer success.

App Store Connect et Play Console n'y sont pas : aucun chiffre ne les cite,
elles attendent l'app grand public. Ne rien cocher est permis, et rien ne
change alors par rapport à aujourd'hui.

#### 19.5.2 Ce que les outils cochés changent

- **La fiche** propose tes outils d'abord, puis les autres sous « Autres
  outils » (`sources.ts:32-48`).
- **La collecte** (`collect.ts`). « À faire toi-même » se range **par outil** :
  un chiffre y entre sous le premier de tes outils que cite son `where`, avec
  le chemin de menu que le catalogue donne déjà (`where.path`). Un chiffre
  qu'aucun de tes outils ne couvre passe dans « À demander », sous son rôle
  par défaut, même s'il est « à faire soi-même » : si tu n'as pas l'outil,
  quelqu'un d'autre l'a. Sans outil coché, la collecte reste rangée par
  effort, comme aujourd'hui.
- **La demande copiée** ne change pas.

*Rejeté pour ce lot* : des recettes de deux à cinq étapes vérifiées outil
par outil (`verifiedAt`). C'est un travail de contenu par outil × chiffre,
qu'on ne peut vérifier que dans les outils eux-mêmes ; `where.path` en tient
lieu.

#### 19.5.3 Le contrôle « deux outils » (Q10)

Aujourd'hui, la source est stockée une fois par chiffre
(`types.ts:168-171`) : rien ne sait que le numérateur vient de Stripe et le
dénominateur de GA4. La fiche d'un taux en comptes gagne donc la case
« Le dénominateur vient d'un autre outil », qui ouvre un second choix de
source (`denominatorSource`). Quand les deux diffèrent, un contrôle
« à vérifier » (`sanity.ts`), jamais bloquant, dit : « Numérateur ({outil A})
et dénominateur ({outil B}) viennent de deux outils : vérifie qu'ils comptent
la même chose sur la même période. » Il paraît dans la fiche et sur la slide
de visibilité, comme les autres contrôles.

---

### 19.6 Coller un tableau (Q11)

**Le modèle.** Dans la collecte, « Saisie en tableau » propose :
1. **« Télécharger le modèle »** : un CSV d'une ligne par chiffre des motions
   cochées, pré-rempli avec les valeurs déjà saisies. Les colonnes sont `id`,
   chiffre, étape, numérateur, dénominateur, valeur, unité, source. Le
   séparateur est `;` en français et `,` en anglais, la décimale suit la langue.
2. **« Coller depuis un tableur »** : une zone qui accepte ce qu'un tableur
   met dans le presse-papiers (des tabulations) ou un CSV. Les lignes se
   rattachent par `id`, sinon par le nom du chiffre dans la langue de la page.

**L'aperçu, toujours.** Avant d'écrire quoi que ce soit, un tableau dit, pour
chaque ligne, si elle est nouvelle, modifiée (avec l'ancienne valeur),
inchangée ou refusée (avec sa raison : nombre illisible, dénominateur nul,
chiffre inconnu, chiffre texte ou choix à saisir dans sa fiche). « Appliquer
{n} chiffres » écrit d'un coup ; « Annuler » ne touche à rien. Les nombres
passent par `parseTypedNumber` (`lib/forms/number.ts:16`). La source est celle
de la colonne, sinon « tableur ».

*Rejeté* : lire les exports propres à Stripe, GA4 ou HubSpot. Leurs formats
changent sans prévenir et ne se vérifient qu'avec un compte ; le modèle du
moteur, lui, est stable et testé.

---

### 19.7 La fusion à l'import (Q13)

Avec plusieurs moteurs, ouvrir un fichier propose trois choix :
- **« Ajouter comme nouveau moteur »**, par défaut : rien n'est perdu ni
  mélangé ;
- **« Remplacer {nom} »** : le comportement d'aujourd'hui ;
- **« Fusionner dans {nom} »** : seulement si le type, les motions et les
  fenêtres des deux moteurs sont les mêmes. Sinon, le choix est grisé avec la
  raison : des fenêtres différentes, ce sont des définitions différentes.

**Règles de fusion**, par `referenceMonth` :
- un mois présent d'un seul côté est ajouté ;
- pour un mois présent des deux côtés, chiffre par chiffre : un côté vide
  prend l'autre ; deux valeurs égales restent ; deux valeurs différentes, la
  plus récente (`updatedAt`) gagne ;
- les cibles du fichier ne comblent que les cibles absentes.

**L'aperçu, comme pour le tableau** : avant d'appliquer, la liste de chaque
mois ajouté et de chaque valeur remplacée, avec l'ancienne et la nouvelle.
Jamais rien de silencieux. Le module est pur : `lib/engine/merge.ts`,
`mergeEngines(into, from): { state, changes }`.

---

### 19.8 Le thème de slide sur fond blanc (Q14)

Les slides sont toujours « papier » (`SlideFrame.tsx:105-106`,
`data-world="paper"`, fond `--surface-page` et `--ground-lift`). Une case
dans les réglages du deck, « Fond blanc (pour un gabarit d'entreprise) »,
pose `deck.theme: "white"` :
- `data-theme="white"` sur chaque slide ;
- le fond passe au blanc pur, sans le halo `--ground-lift`. Le design system
  n'a pas de blanc : sa surface la plus claire, `--paper-0` (#fbf9f2), tire
  sur le crème, ce qu'un gabarit d'entreprise ne veut pas. Le seul ajout est
  donc un jeton primitif, `--paper-white` (#ffffff), et un jeton de surface
  qui le nomme ;
- les encres, le rouge de la fuite et les accents ne changent pas.

Le PDF et le PNG suivent. `token-contrast.test.ts` mesure chaque paire sur le
blanc comme sur le papier. Un e2e lit, pour la première fois, la couleur de fond peinte d'une
slide dans les deux thèmes (`engine-deck.spec.ts` ne vérifie aujourd'hui
aucune couleur peinte).

---

### 19.9 Les rappels `.ics` (Q15)

Deux rappels, générés dans le navigateur et téléchargés comme un fichier :
- **Relancer une demande** : à côté de « Copier la demande » (`RequestCopy`),
  « Me le rappeler » crée un événement à la date de la demande + 5 jours
  (`REMIND_AFTER_DAYS`, `catalog-shape.ts:879`), à 9 h. Le titre est
  « Relancer {rôle} : {n} chiffres du moteur » ; la description donne la liste
  des chiffres demandés et l'adresse de la page.
- **Démarrer le mois suivant** : sur le tableau, « Me rappeler de démarrer
  octobre » crée un événement au premier jour ouvré du mois suivant, à 9 h.

Jamais une valeur dans le fichier, ni le nom de l'entreprise. Format RFC 5545
(`VCALENDAR`, un `VEVENT`, `UID` aléatoire, `DTSTAMP`), écrit par un module
pur, `lib/engine/ics.ts`, et testé au caractère près. Le téléchargement
généralise `download` d'`EngineWorkbench.tsx:76-87`, dont le type MIME est
aujourd'hui figé à `application/json`.

---

### 19.10 Deux portes d'entrée (Q16)

Les deux n'existent que si le moteur est ouvert au build
(`SPACE_OPEN_AT_BUILD.engine`, `SpaceBand.tsx:37-41`), comme la bande de
l'accueil et les liens d'A7.4 :
- **Depuis le résultat, pour son propriétaire seulement**
  (`ResultView.tsx:154-168`), sous l'action prioritaire (`PriorityMove`,
  `:528-551`). Une ligne : « Tu mesures déjà {étape} ? Mets tes vrais
  chiffres dans le moteur → », où l'étape est celle qui freine. Un visiteur
  arrivé par un lien partagé ne la voit pas.
- **Sur l'accueil, dans `LastResult`** (`[locale]/page.tsx:112-125`), quand un
  moteur existe sur l'appareil : « Ton moteur : septembre, 11 chiffres sur 17
  → Reprendre ». La lecture du stockage est locale, en lecture seule, et ne
  passe jamais par le serveur.

Chacune est mesurée par `engine_entry_clicked/<result_owner|landing_resume>`.

---

### 19.11 L'image de partage du moteur (Q17)

Aujourd'hui la page prend l'image générique de l'accueil
(`aarrr-funnel-template/page.tsx:42-57`). Elle gagne la sienne,
`aarrr-funnel-template/opengraph-image.tsx`, en 1 200 × 630. **Elle se
dessine d'abord dans Claude Design** (Q17, Antoine, 2026-10-01), comme les
images du jeu : un brief part par la design sync (`CHANTIERS.md` B5), puis
l'image se porte dans `lib/og/` sur ce qui revient. Deux contraintes pour le
brief : jamais de vrais chiffres (un peloton du jeu d'exemple, si l'image en
dessine un), et le titre de la page dans les deux langues.

`contentMetadata` reçoit `ownShareImage`. Moteur fermé, la route répond 404 :
elle le vérifie elle-même, comme le jeu (`game/opengraph-image.tsx:20-24`),
parce que `isEnginePath` ne reconnaît que le chemin exact
(`engine/access.ts:45-47`).

---

### 19.12 Analytics et confidentialité (Q18)

Vocabulaire fermé, ajouts seulement :
- `engine_month_started` : le seul signal d'un usage répété, ce que la série
  doit prouver ;
- `engine_exported/<ics|csv>` : le rappel et le modèle de tableau ;
- `engine_entry_clicked/<result_owner|landing_resume>`.

Coller un tableau et fusionner un fichier ne comptent rien de plus :
`engine_stage_saved` compte déjà le premier chiffre de chaque étape.

La phrase de confidentialité (`legal.ts:253-254`) devient : « …le premier
chiffre enregistré dans chaque étape de chaque motion, le démarrage d'un
nouveau mois, la copie d'une demande, le rapprochement avec ton Tour,
l'ouverture des slides et l'export d'un fichier (slides, sauvegarde, rappel
ou modèle) — jamais un chiffre, un statut ni un texte que tu y saisis. » Elle
repart « à relire », et la page change de date.

Mises à jour qui suivent : `engine-events.ts`, `goatcounter-api.ts` et
`/admin/stats`, `goatcounter-api.test.ts:325-344`,
`engine-boundary.test.ts:151-159`.

---

### 19.13 Plan de tests

**Unitaires (`src/lib/engine/__tests__/`).**
- `migrate` : un v1 et un v2 deviennent un v3 sans perte, et un v4 est refusé.
- `storage` : l'index, un moteur par clé, la reprise de l'ancien, au plus 10
  moteurs, une entrée illisible jamais écrasée.
- `validate` : mois croissants et uniques, `closedAt`, `tools`, `pipeline`.
- `series` : comparabilité (variante, fenêtres, définition, statut), écarts
  par type, formulation, et aucune lecture de la date du jour.
- La date d'un mois clos : un mois clos en août et relu en novembre donne la
  même période et la même confiance.
- `impact` et `slg-impact` : les chaînes de la rétention J30 et de la part
  recommandée, calculées à la main sur l'exemple ; la borne de 50 % ; même
  montant sur la slide de fuite et dans le « Et si » (titre = corps).
- `collect` par outil, sources en tête, contrôle « deux outils ».
- `csv` (analyse et aperçu), `merge`, `ics`, au caractère près.
- `deck` : la slide « Ce qui a bougé » (place, ordre fixe, cas « ne se
  comparent pas »), `notes.series`, le thème blanc.
- **Golden v1 inchangé**, et un golden v2 neuf figé avant toute ligne du lot,
  sur les jeux de l'hybride.

**Gardes statiques.** `engine-boundary.test.ts` : la lecture du presse-papiers
et l'analyse du CSV restent dans l'îlot ; `ics.ts` ne fait aucun envoi. Le
contraste des jetons en thème blanc. La typographie de la copie neuve.

**E2E** (build de production, aperçu propriétaire), en FR et EN, à 1 280 et
390 px :
- la série : démarrer le mois suivant, les écarts, relire et corriger un mois
  passé, la slide ;
- deux moteurs : créer, basculer, supprimer, exporter, réimporter comme
  nouveau ;
- la fusion avec son aperçu ;
- coller un tableau (séparateurs, décimale à virgule) ;
- le thème blanc en PDF et en PNG, avec la couleur peinte ;
- les deux `.ics` ;
- les portes d'entrée, sur un build ouvert et sur un build fermé ;
- l'image de partage, en 1 200 × 630 et en 404 quand le moteur est fermé.

Le canari s'étend au tableau collé et à la fusion. `engine-mobile.spec.ts`
s'étend aux nouveaux écrans.

**Non-vacuité**, mesurée par sabotage à chaque PR, comme pour A7.3.c.

---

### 19.14 Découpage en PR

**Chaque PR se merge sur `main` dès qu'elle est verte**, drapeau fermé, comme
les PR du niveau 2 du jeu : puisque l'ouverture attend tout le lot (Q1), aucune
copie neuve n'est visible avant le bon à tirer A14.d. Seule exception : la
phrase de confidentialité de T7, visible dès son merge, comme celle de S5.

| PR | Contenu | Dépend de | Jours-agent |
|---|---|---|---|
| **T0 — Socle v3** | golden v2 figé d'abord ; types, `migrateToV3`, stockage à plusieurs moteurs, `io`, `validate`, correctif `ALL_TOOLS` | — | 2,5 |
| **T1 — Série, moteur pur** | `series.ts`, `closedAt` et `windows`, diagnostic du mois d'avant, slide « Ce qui a bougé » (modèle), `notes.series` | T0 | 1,5 |
| **T2 — Série, écrans** | « Démarrer le mois suivant », sélecteur de mois, lecture seule et correction, écarts sur les lignes, composants de la slide | T1 | 2 |
| **T3 — Chiffrer et anticiper** | rétention J30 et part recommandée en € (deux motions), leviers « Et si », couverture du pipeline | T0 | 2 |
| **T4 — Outils** | « Tes outils » au réglage, sources en tête, collecte par outil, `denominatorSource` et son contrôle | T0 | 2 |
| **T5 — Plusieurs moteurs, fusion, tableau** | sélecteur, création et suppression, trois choix à l'import, `merge.ts` et son aperçu, modèle CSV et collage | T0 | 3 |
| **T6 — Slides et portes** | thème blanc, `.ics`, image de partage, ligne du résultat, ligne de l'accueil | T0 (T2 pour le rappel du mois) | 2 |
| **T7 — Intégration** | e2e de §19.13, captures relues, analytics et phrase de confidentialité, journal, état d'ENGINE.md | T1-T6 | 1,5 |

Total ≈ **16,5 jours-agent**. Chemin critique T0 → T1 → T2 → T7, soit environ
7,5 jours ; T3 à T6 avancent en parallèle une fois T0 livré. Chaque PR porte
sa copie, « à relire ». Vient ensuite **A14.d**, le bon à tirer de toute la
copie neuve, construit depuis `grep -rn "TODO: à relire" src/`, puis
l'ouverture (`CHANTIERS.md` D2). L'image de partage de T6 attend le retour de
Claude Design (B5).

---

### 19.15 Questions produit — tranchées le 2026-10-01 (C32)

| # | Question | Proposition | Recommandation, et « si on se trompe » | Réponse d'Antoine |
|---|---|---|---|---|
| Q1 | **L'ouverture du moteur attend-elle ce lot ?** | Non : le moteur ouvre dès A7.3.d et le nº8 signés, et A14 vit sur sa branche d'intégration jusqu'à son propre bon à tirer | **Non, on n'attend pas.** Un seul merge garantit qu'aucune copie neuve ne part en production sans relecture, que le moteur soit ouvert ou non. *Si on se trompe* : on ouvre un moteur sans série, et les premiers retours la demanderont | **2026-10-01 : oui, l'ouverture attend A14**, contre la reco. Les PR se mergent une à une, drapeau fermé (§19.14) |
| Q2 | **Que reprend le mois suivant ?** | Les cibles et les définitions (variante, libellé, note, sources), comme valeurs proposées ; jamais une valeur, ni les comptes partagés, ni les demandes | **Oui.** Recopier une valeur serait la présenter comme mesurée. *Si on se trompe* : il faudra resaisir une note de définition, rien de faux n'apparaît | **2026-10-01 : oui, la reco** |
| Q3 | **Les mois passés : lecture seule, avec « Corriger ce mois » ?** | Un sélecteur de mois, un bandeau, un bouton de correction ; le deck toujours sur le dernier mois | **Oui.** *Si on se trompe* : un deck d'un mois passé se demandera ; il suffira alors de construire le deck sur le mois choisi | **2026-10-01 : oui, la reco** |
| Q4 | **Les écarts : quand, et sous quelle forme ?** | Seulement entre deux mesures comparables (§19.2.5), en points, valeur ou pour cent, avec une flèche et un signe, sans couleur | **Oui.** La couleur dirait « bien » ou « mal », ce que seule une cible peut dire (C1). *Si on se trompe* : une lecture un peu plus lente, rien de faux | **2026-10-01 : oui, la reco** |
| Q5 | **La slide « Ce qui a bougé »** | Après la fuite et ses « Et si », une par motion, ordre AARRR, incluse dès deux mois comparables | **Oui.** *Si on se trompe* : une case à décocher | **2026-10-01 : oui, mais décochée par défaut** : la personne la coche (§19.2.6) |
| Q6 | **La rétention J30 en €, avec « les payants sont supposés parmi les actifs à J30 » ?** | La même chaîne que l'activation, l'hypothèse au pied de la slide, et J30 devient un levier | **Oui.** C'est le prolongement exact de l'hypothèse de l'activation. *Si on se trompe* : le montant gonfle quand des clients paient avant J30 puis partent ; le pied de slide le dit | **2026-10-01 : oui, la reco** |
| Q7 | **La part recommandée en €, dans les deux motions, avec la formule du « Et si » et une borne à 50 % ?** | (1 − r) ÷ (1 − t), puis la conversion (libre-service) ou le closing et l'ACV (assisté) | **Oui.** La même formule partout : la slide de fuite et le « Et si » ne peuvent pas se contredire. *Si on se trompe* : la boucle surestime quand les recommandés convertissent moins bien ; le pied de slide le dit | **2026-10-01 : oui, la reco** |
| Q8 | **La couverture du pipeline : un indicateur avancé, lu contre ton seuil seulement ?** | Deux nombres saisis (pipeline ouvert du trimestre, objectif du trimestre), un seuil facultatif ; jamais une fuite, jamais en € | **Oui.** C'est le seul indicateur qui regarde devant. *Si on se trompe* : deux champs de plus que personne ne remplit ; ils sont facultatifs | **2026-10-01 : oui, la reco** |
| Q9 | **« Tes outils » au réglage, collecte rangée par outil, sans recettes vérifiées ?** | Liste facultative ; « À faire toi-même » par outil avec `where.path` ; un chiffre sans ton outil passe à « À demander » | **Oui.** Les recettes vérifiées coûteraient un travail de contenu par outil, invérifiable d'ici. *Si on se trompe* : un chemin de menu moins détaillé qu'une recette | **2026-10-01 : oui, la reco** |
| Q10 | **Le contrôle « deux outils » : une source pour le dénominateur, et un « à vérifier » non bloquant ?** | Une case dans la fiche d'un taux, un second choix de source, un contrôle en fiche et sur la slide de visibilité | **Oui.** *Si on se trompe* : une case que peu de gens cochent ; le contrôle ne se déclenche alors jamais | **2026-10-01 : oui, la reco** |
| Q11 | **Coller un tableau : le modèle du moteur, avec aperçu, et pas les exports des outils ?** | Un CSV à télécharger et à recoller (tabulations ou CSV), rattaché par `id`, avec un aperçu avant d'écrire | **Oui.** *Si on se trompe* : il faut recopier une colonne d'export dans le modèle ; c'est l'affaire d'une minute | **2026-10-01 : oui, la reco** |
| Q12 | **Plusieurs moteurs : au plus 10, une clé chacun, nommés par l'entreprise ?** | §19.1.4 et §19.1.5 | **Oui.** *Si on se trompe* : la limite se relève en une ligne | **2026-10-01 : oui, la reco** |
| Q13 | **La fusion : trois choix à l'import, la valeur la plus récente gagne, un aperçu, refusée si les réglages diffèrent ?** | §19.7 | **Oui.** « Ajouter comme nouveau moteur » par défaut : le choix qui ne perd rien. *Si on se trompe* : une valeur plus ancienne mais plus juste est écrasée ; l'aperçu la montre avant | **2026-10-01 : oui, la reco** |
| Q14 | **Le fond blanc : une case, « papier » par défaut, un blanc pur (`--paper-white`, #ffffff) et aucune autre couleur ?** | §19.8 ; l'autre choix est `--paper-0` (#fbf9f2), déjà là mais crème | **Oui, le blanc pur**, sans passe de Claude Design : seul le fond change. *Si on se trompe* : un rendu plat sur blanc, qu'une passe de design reprendra | **2026-10-01 : oui, le blanc pur** |
| Q15 | **Les rappels `.ics` : relancer une demande et démarrer le mois suivant, sans valeur ni nom d'entreprise ?** | §19.9 | **Oui.** *Si on se trompe* : un fichier que personne ne télécharge | **2026-10-01 : oui, la reco** |
| Q16 | **Les deux portes : une ligne pour le propriétaire du résultat, une ligne de reprise sur l'accueil ?** | §19.10, moteur ouvert seulement | **Oui.** *Si on se trompe* : une ligne de plus sous l'action prioritaire, qu'on retire | **2026-10-01 : oui, les deux.** Antoine a demandé si la carte « Le moteur » de l'accueil et la pastille de la bande noire deviendront cliquables : oui, c'est déjà câblé par C15 (A7.9) sur le même drapeau, et la bande reste sans lien dans le questionnaire et le Deep dive |
| Q17 | **L'image de partage : le cadre de contenu et un peloton de l'exemple ?** | §19.11 | **Oui.** *Si on se trompe* : une image moins travaillée que celles du jeu, qu'une passe de design reprendra | **2026-10-01 : avec une passe de design**, contre la reco : l'image se dessine d'abord dans Claude Design (§19.11, `CHANTIERS.md` B5) |
| Q18 | **Analytics : `engine_month_started`, `engine_exported/<ics\|csv>`, deux sources d'entrée, et la phrase de confidentialité réécrite ?** | §19.12 | **Oui.** Sans `engine_month_started`, on ne saura pas si la série fait revenir. *Si on se trompe* : un événement de trop, retiré en une PR | **2026-10-01 : oui, la reco** |
| Q19 | **L'export PowerPoint reste hors du lot ?** | La spec v1 le réserve au cas où les retours le demandent | **Oui, hors du lot.** *Si on se trompe* : il se spécifiera seul, plus tard | **2026-10-01 : oui, hors du lot** |
