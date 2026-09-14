# Instrument d'audit growth — spécification de la phase 0

*Le schéma de données de l'instrument d'audit personnel d'Antoine, tel qu'il est
livré dans `src/lib/audit/` et `src/content/audit-catalog.ts` le 2026-09-13.
Ce document dit ce que les dix réponses d'Antoine ont tranché, ce que la
session a tranché seule, ce que le code applique, et ce qui reste à
construire. Il est au code ce que `SPEC.md` est au produit : quand ils
divergent, le code a tort et c'est le code qu'on corrige.*

---

## 0. Ce que c'est, et ce que ce n'est pas

**C'est** un instrument de travail pour une personne : le support d'un
diagnostic growth qu'Antoine mène en arrivant dans une entreprise — la
sienne aujourd'hui, la suivante demain. Il tient dans un fichier JSON par
entreprise, saisi à la main, relu à six mois, et il produit un livrable
direction à partir de ce fichier. Sa thèse tient en une ligne : *une revue de
croissance a besoin de répondre à N questions ; voici combien l'entreprise
peut documenter, combien elle n'a pas, et combien je n'ai pas pu voir.*

**Ce n'est pas** une fonctionnalité de Tour de Growth. Les chiffres qu'il
tient sont ceux d'un employeur, et `content/legal.ts` promet aux
utilisateurs du produit qu'aucun nom d'entreprise n'entre dans sa base. Donc :
navigateur seulement, zéro donnée serveur, jamais Firestore, jamais Gemini,
jamais l'analytics. `src/__tests__/audit-boundary.test.ts` rend ça vérifiable
à chaque build (§5).

**Ce n'est pas non plus** le « cockpit growth » discuté le 2026-09-12 (saisie
récurrente, API, connecteurs Zapier, seuils). Cette direction-là — et la
« Growth Intelligence » du document de l'expert — est une phase 3 qui ne
s'ouvre qu'après des entretiens et une vérification du contrat de travail
(AB Tasty est une plateforme d'expérimentation ; un SaaS qui lit des
expériences vend à ses acheteurs). Rien ici ne la présuppose ni ne l'interdit.

---

## 1. Ce que les dix réponses ont tranché

Réponses lues dans l'artifact « Grille d'audit growth » le 2026-09-13.

| # | Question | Réponse d'Antoine | Ce que ça fixe | Où |
|---|---|---|---|---|
| 1 | Mode par défaut | « Les deux, mais sans mandat par défaut : plus de latitude » | `MissionHeader.mandate`, défaut `no-mandate` | `schema.ts#DEFAULT_MANDATE` |
| 2 | Le mot « audit » quand salarié | « Ça revient au même ; si trop lourd, un synonyme » | Sans mandat : **Diagnostic growth** ; mandaté : Audit growth (§2) | `findings.ts#deliverableVocabulary` |
| 3 | Publier le score du Tour sous 50 | « Paramétrable, à moi de jauger » | `MissionHeader.showTourScore`, par mission | `schema.ts`, validé |
| 4 | Conventions canoniques | « Exactement le glossaire » | `canonicalDeviation` mesure l'écart à `content/glossary*.ts` ; aucune seconde convention | `AuditCatalogRow.glossary` |
| 5 | Seuils sans repère public | « Paramétrable : rien, ou mon seuil d'expert » | `Criterion.kind = argued-threshold` **avec** `justification` obligatoire | `validate.ts` |
| 6 | Relecture (2 h) ou entretiens (12 h) pour la cause de churn | Question renvoyée (« quelle ligne 16 ? ») | Défaut : relecture ; la méthode et le N sont sur la valeur (§2) | réponse dans l'artifact |
| 7 | Plafond de 8 headlines | Question renvoyée | 8, en constante (§2) | `schema.ts#HEADLINE_CAP` |
| 8 | Photo ou série | « Une photo appelée à devenir une série » | `Mission.passes[]` **et** `Entry.observations[]` | `schema.ts`, `diff.ts` |
| 9 | Langue | « D'accord avec ta proposition » | Outil en français ; `MissionHeader.deliverableLocale` | `schema.ts` |
| 10 | Coût de réparation | « Échelle fermée mais avec de quoi commenter » | `RepairCost { scale, comment? }`, requis sur toute absence | `schema.ts`, `validate.ts` |

Les questions 6 et 7 ont reçu une réponse dans l'artifact, sous sa note ; les
défauts retenus tiennent tant qu'il ne les contredit pas.

---

## 2. Ce que la session a tranché seule

À contester si l'un déplaît ; chacun est une ligne de code, pas une
architecture.

- **« Diagnostic » plutôt qu'« audit » sans mandat.** C'est le mot que le
  produit emploie déjà (« Obtenir mon diagnostic », Deep dive), et il n'a pas
  la connotation de contrôle. `FORBIDDEN_WITHOUT_MANDATE` liste les trois
  formules d'auditeur externe qu'un livrable sans mandat n'imprime jamais
  (« audit », « limitation d'étendue », « refus de conclure ») ; un test balaie
  tout ce que le module de vocabulaire produit.
- **Cause de churn : la relecture de dossiers par défaut.** Cohérente avec le
  mode sans mandat (aucune demande à personne). La méthode n'est pas un champ
  du catalogue : elle vit sur l'observation (`sourceKind`, `obtainedHow`) et le
  N examiné fait partie de la valeur, donc le livrable dit toujours laquelle a
  servi.
- **Le plafond de 8 reste 8**, et c'est une constante — pas un réglage par
  mission. Le changer est une ligne et un test.
- **Le catalogue est en français.** Un livrable en anglais demande sa
  traduction, c'est de la phase 2. Le champ `deliverableLocale` existe déjà
  pour que rien ne soit à migrer.
- **Quatre profils, pas trois.** `AuditProfileModel` distingue B2B assisté et
  B2B self-serve là où `SegmentModel` (R2-26) ne le fait pas : les deux ne
  mesurent pas l'activation ni la rétention avec les mêmes lignes.
- **Trois exceptions à « le socle s'applique partout »**, toutes argumentées
  dans un test : NRR/GRR et consommation ÷ engagement en B2B seulement ; churn
  logo et concentration du revenu hors B2C, qui a ses propres formes (J1/J7/J30,
  premier centile de dépensiers).
- **`betterWhen`** (higher / lower / contextual) et **`valueShape`** ajoutés au
  catalogue. Le premier est ce qui permet de dire « mesuré et bon » sans
  deviner ; `contextual` fait écrire « mesuré, sans repère » au readout plutôt
  qu'un verdict.
- **`tourQuestionId` n'est posé que là où la question du Tour porte
  littéralement sur le fait de mesurer cette ligne** (« Connais-tu ton coût
  d'acquisition ? » → CAC). Dix lignes sur trente-neuf ; la liste exacte est
  épinglée par un test pour qu'un ajout soit une décision.
- **Le demi-point d'une ligne « communiquée sans définition » est partagé** :
  ½ en documenté, ½ en « l'entreprise ne l'a pas ». Découvert par le test qui
  exige que les compteurs se somment au dénominateur : la grille de départ
  donnait le demi-point à « documenté » et faisait disparaître l'autre moitié.
  La lecture est aussi la bonne : le chiffre existe, personne ne peut le
  reconstruire.
- **Un fichier purgé porte un drapeau `purged`**, et le validateur relâche
  pour lui exactement deux règles (une valeur mesurée sans observation valuée,
  un seuil argumenté sans son argument). Découvert par le test « un fichier
  purgé se recharge » : sans le drapeau, la purge produisait un fichier que
  l'outil refusait de rouvrir.
- **« Non accessible » a son propre quadrant** (`unverifiable`) au lieu d'être
  rangé en angle mort ou en lacune connue : c'est un fait sur mon accès, pas
  sur leur système.

---

## 3. Le modèle de données

```
Mission                      un fichier par entreprise
├── header                   entreprise, mandat, profil, périmètre, devise, langue du livrable, showTourScore
├── catalog                  COPIE du catalogue (version + 39 lignes) au moment de la création
├── definitions{}            MetricDefinition immuables, indexées par `id@version`
└── passes[]                 un passage daté de l'audit — la première est la photo, les suivantes la série
    ├── tourAnswers          les 15 réponses du Tour, remplies par l'auditeur (jamais en auto-évaluation)
    ├── entries[]            une par ligne du catalogue examinée
    │   ├── status           mesuré · estimé · communiqué sans définition · contesté · absent · non accessible · non applicable
    │   ├── absentCause      si absent — défaut « type non établi », jamais deviné
    │   ├── repairCost       si absent — échelle fermée (réunion · après-midi · sprint · trimestre) + commentaire
    │   ├── definitionRef    `id@version`, requis dès qu'il y a une valeur
    │   ├── observations[]   la SÉRIE : période, valeur, source, qui l'a fournie (un rôle), date de tirage
    │   ├── criterion        repère public (avec population et n) · seuil argumenté (avec justification) · tendance interne
    │   ├── canonicalDeviation, decisionAtStake, exposure, ownerRole, systemCause
    │   └── tracking         relances, niveau de mandat, routage — jamais imprimé
    ├── findings[]           un CONSTAT référence N valeurs : 5C + Decision Ledger + gap + headline/priority
    └── brief                constat principal, UNE action, la preuve — budget 400 mots
```

Les cinq décisions irrattrapables une fois le schéma figé, toutes prises :

1. **Une valeur est une série**, jamais un scalaire. Un NRR de 105 % stable et
   un NRR de 105 % qui descend de 120 % sont deux entreprises. Et une mission
   est une série de passes : « la couverture est passée de 16/24 à 21/24 » est
   la phrase qui prouve que l'instrument a servi.
2. **Un constat est un objet distinct de la métrique** et référence N valeurs.
   Les constats qui valent quelque chose lient deux ou trois lignes.
3. **La prose est dans le JSON.** Sans ça le readout est édité à la main dès la
   première mission, et la régénération, le diff et la purge tombent.
4. **Le catalogue est versionné et embarqué**, pas référencé. Si la grille
   passe de 39 à 30 lignes, chaque mission reste lisible sur la sienne.
5. **Chaque absence porte son coût de réparation** sur une échelle fermée.
   C'est ce qui ordonne le readout.

Deux cadres empruntés au document de l'expert, adoptés tels quels :
`Finding.gap` (capability · evidence · decision · learning) et
`Finding.ledger` (problem → evidence → hypothesis → decision → expected →
actual → learning → next).

---

## 4. Les règles que le code applique

**Les trois compteurs** (`coverage.ts`). Dénominateur = lignes du catalogue
embarqué dont `appliesTo` nomme le profil. Rien de saisi ne le change : un
refus baisse « documenté ». Documenté = mesuré + estimé + ½ communiqué ;
l'entreprise ne l'a pas = absent + contesté + ½ communiqué ; je n'y ai pas eu
accès = non accessible. Un quatrième compteur, `pending`, compte les lignes
pas encore examinées et doit valoir zéro pour un readout. Sa pire valeur
(0 documenté) est atteignable — testé. Rendu en fraction, jamais en
pourcentage nu.

**L'escalade.** Sous un tiers de lignes documentées, le titre du livrable
devient l'absence elle-même. Mandaté : « cet audit ne peut pas conclure sur X,
et c'est le constat principal ». Sans mandat : « ce diagnostic ne peut pas
*encore* conclure », au présent de la prise de poste.

**La promotion** (`findings.ts`). Une ligne n'entre dans la grille des
constats que si elle a un critère ET une décision en jeu. Un repère public
sans population ni n est rétrogradé en tendance interne avec la mention « pas
de repère externe pour ce chiffre » — imprimée, jamais masquée.

**La rareté.** Une seule action prioritaire par passe (`setPriority` démarque
la précédente), au plus `HEADLINE_CAP = 8` autres headlines. Le validateur le
refuse, l'UI n'aura pas à le retenir.

**Le croisement méthode × réalité** (`quadrants.ts`). Pour chaque ligne :
mesuré-et-bon · mesuré-et-mauvais · mesuré-sans-repère · angle mort (l'équipe
déclare mesurer à 20 points, rien ne le documente) · lacune connue ·
invérifiable · non applicable · en attente. L'axe méthode est la réponse du
Tour à la question qui mesure littéralement cette ligne ; l'axe réalité est le
statut et, s'il y a un critère, le verdict contre lui.

**La confiance est dérivée, jamais saisie** (`schema.ts#confidenceOf`) :
source et complétude de la définition. Un chiffre entendu en réunion est
`low` quoi qu'il arrive.

**Le validateur** (`validate.ts`) refuse : un `non applicable` saisi à la main
sur une ligne applicable ; une absence sans cause ou sans coût de réparation ;
une valeur sans observation valuée ou sans définition enregistrée ; un
`contesté` à moins de deux observations ; un seuil argumenté sans argument ;
deux priorités ; plus de 8 headlines ; un constat sans référence ou vers une
ligne hors catalogue ; du texte libre là où le schéma veut une liste fermée
(cause système, statut, gap). Il rend des chemins lisibles, jamais une
exception.

---

## 5. Détention des chiffres et séparabilité

Le JSON sur l'ordinateur d'Antoine est le même objet juridique qu'une base :
un MRR consolidé d'une société détenue par un fonds est de l'information non
publique, et un NDA ne distingue pas un serveur d'un disque. Trois
conséquences dans le code, une hors du code.

1. **Rien ne sort du navigateur.** `lib/audit/**` et le catalogue n'importent
   ni Firebase, ni Gemini, ni l'analytics, ni la couche submissions ; rien
   hors de l'instrument et de sa future route `/admin/audit` ne les importe ;
   aucun Client Component n'importe le catalogue (le serveur résout et passe
   des props). `audit-boundary.test.ts` échoue le build sinon.
2. **Les valeurs et la structure sont séparables** (`purge.ts`). La purge
   retire le nom, le périmètre, toute valeur, toute exposition, toute prose,
   les systèmes nommés et le routage ; elle garde les statuts, les causes, les
   coûts de réparation, les définitions, les critères et les écarts de
   convention. Les compteurs et le diff sont identiques avant et après —
   testé — donc un fichier purgé reste un exemple montrable de ce que
   l'instrument produit.
3. **`canonicalDeviation` est gardé par la purge**, et c'est le seul champ
   rédigé qui l'est. Règle d'écriture : y décrire une convention (« MRR calculé
   sur le facturé, pas le reconnu »), jamais un chiffre.
4. **Hors du code** : tant que le fichier n'est pas purgé, il est sous NDA.
   Rien de ce que l'instrument produit ne se partage sans purge — et la
   purge est irréversible par construction, ce qui est le but.

---

## 6. Le readout — la cible, pas encore construite

Rappel de ce que la grille avait fixé et que le schéma rend possible ; rien
de cette section n'est livré en phase 0.

- **Ordre des sections** : bloc de tête (400 mots, compteur visible) → les deux
  axes côte à côte (couverture et score du Tour, jamais moyennés) → « ce qui
  n'est pas mesuré », classé par coût de réparation et non par pilier, avec
  une colonne « à qualifier » pour `type non établi` → bloc accès (mandaté
  seulement ; sans mandat il part en annexe de travail) → les constats en 5C,
  groupés par pilier → annexe générée (détail du Tour, matrices avec leurs N,
  définitions versionnées, journal de collecte, lignes non applicables avec
  leur motif — pour que le dénominateur soit contestable).
- **Quatre artefacts d'un même JSON** : la coupe par interlocuteur (générée au
  milieu de la mission, sans compteur global ni score), le build lecture (HTML
  imprimable, phrases autoportantes), le build projection (un titre, un
  nombre par écran, jamais le même fichier), et des blocs Markdown copiables
  par constat.
- **Le score du Tour n'est jamais le titre**, ne s'affiche qu'avec son détail,
  et seulement si `showTourScore`. Deux neutralisations automatiques : en
  B2B assisté, Referral s'affiche « non comparable » ; une réponse à 7 points
  sur `acq-3` avec un CAC `non calculé` s'annote « estimation déclarée,
  convention d'attribution absente ».

---

## 7. Plan

**Le plan détaillé — phases, étapes PR par PR, ordre, critères de sortie,
Go/No-Go — vit dans `AUDIT-PLAN.md`.** Ce document-ci reste la spécification
du schéma ; celui-là dit dans quel ordre on construit et pourquoi. Résumé :

| Phase | Contenu | État |
|---|---|---|
| **0 — Schéma** | Types, validateur, compteurs, promotion, quadrants, diff, purge, catalogue versionné et embarqué, garde de frontière, ce document | **Livrée** (PR #129, 2026-09-13) |
| **1 — Saisie** | Route `/admin/audit` derrière le Basic Auth existant, import/export JSON, purge — six PR détaillées dans `AUDIT-PLAN.md` §3 | **Livrée** (PR #131 à #153, 2026-09-14) |
| **1 bis — Première mission réelle** | AB Tasty, sans mandat, `pending = 0`, journal des frictions | **C'est le prochain chantier**, et il est côté Antoine |
| **2 — Readouts** | Les quatre artefacts du §6 ; passes multiples et diff ; catalogue en anglais si un livrable EN existe | Après la phase 1 bis **et** le bon à tirer nº4 |
| **2 bis → Go/No-Go → 3** | Trois à cinq missions réelles, une décision écrite, puis seulement ce qui ressemble à un produit | Fermée tant que : entretiens non faits, contrat de travail non vérifié |

Côté Antoine, hors code : mener la mission AB Tasty dans l'outil (phase 1
bis), en tenant le journal des frictions — c'est lui qui dira ce que la
phase 2 doit construire, et il n'y a aucune façon de le deviner d'ici. Puis
les entretiens, avant toute phase 3.

---

## 8. Vérification

`src/lib/audit/__tests__/` (schema, validate, coverage, findings, quadrants,
diff, purge, definitions, entry-fields, observation-fields, criterion-fields,
tracking, restitution, tour-entry, finding-draft, storage, io),
`src/content/__tests__/audit-catalog.test.ts`,
`src/__tests__/audit-boundary.test.ts`. Côté écran, `e2e/audit-*.spec.ts`
contre un vrai build de production.

**Trois specs valent plus que les autres**, parce qu'elles tiennent des
promesses que ce document fait et qu'aucun attribut ne prouve :

- `e2e/audit-canary.spec.ts` — des chaînes canari semées dans le nom de
  l'entreprise, une valeur et un texte de constat, tout le parcours joué,
  **toutes** les requêtes du navigateur enregistrées. Assertions : aucune ne
  porte un canari, aucune requête non-`GET` de toute la session, et le
  fichier exporté contient bien les canaris — sans cette dernière, une spec
  qui aurait cessé de saisir quoi que ce soit passerait en ne prouvant rien.
- `e2e/audit-acceptance.spec.ts` — le critère de sortie du §3.1 du plan : le
  `localStorage` est **réellement vidé** entre l'export et l'import, et les
  compteurs sont comparés au caractère près. Sans le vidage, on vérifierait
  que l'état React a survécu à un clic, pas que le fichier porte le travail.
- `e2e/keyboard.spec.ts` (bloc audit) — une ligne se renseigne et
  s'enregistre sans souris. Un `tabindex` correct sur chaque champ ne dit
  rien de ça.

Ce que les tests ont trouvé plutôt que la relecture : le demi-point qui
disparaissait (§2), le fichier purgé qui ne se rouvrait pas (§2), une
assertion de purge trop large — le catalogue embarqué cite légitimement
« Stripe » —, la ligne `m19` qui gardait une cause d'absence périmée, le
champ de confirmation de purge sans nom accessible (trouvé en étendant la
passe axe à un écran qu'aucune spec ne traversait), et le compteur de lignes
renseignées qui comptait les entrées semées d'office.
