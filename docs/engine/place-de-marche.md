# ENGINE.md, partie 6 — la place de marché (§22)

*Écrit le 2026-10-04, contre le code de `main` (`5d98683`, A20.e livré). C'est
une **spécification d'exécution** : une session de code l'applique sans rien
trancher. Le modèle y est donné formule par formule, avec un **modèle de
référence** (§22.11) qui a calculé l'exemple de §22.10 ; chaque nom de fichier,
de type et de fonction est fixé. Les décisions produit attendent Antoine : ce
sont **C64 à C74** (§22.15), et le texte applique leurs recommandations. Si
Antoine en renverse une, la ligne de la question nomme les sections à corriger
avant d'exécuter.*

*Ce lot passe **après** celui de l'app grand public (§21, `docs/engine/app-grand-public.md`,
C74) : il réutilise ce que §21 crée (`business-type.ts`, `ENGINE_TYPES`,
`mergeStrings` et les calques de copie par type). Si l'ordre s'inverse, M0
crée d'abord ces trois pièces telles que §21.2.2, §21.3 et §21.6.1 les
décrivent, sans rien de propre à l'app.*

*Vérifié pour ce document, en plus de la liste de §21 : `diagnose.ts`
(`MotionRules`, `diagnoseWith`), `impact.ts` (`rankingImpact`, `whatIf`,
`twelveMonthFactor`), `scenario.ts` (`ScenarioKpis`, `twelveMonths`,
`mrrPath`, `buildScenario`), `money.ts`, `unit-economics.ts`, `findings.ts`,
`sanity.ts`, `series.ts`, `cohort.ts` (`windowDaysOf`, `defaultCohortMonth`),
`shared-counts.ts`, `relays.ts`, `total.ts`, `deck.ts` (`buildDeck`,
`buildMotionsDeck`, `DEFAULT_INCLUDE`), `deck-slg.ts`, `_engine/Board.tsx`,
`_engine/money-view.ts`, `_engine/BoardLever.tsx`, `_engine/WhatIfPanel.tsx`,
`_engine/SlgWhatIfPanel.tsx`, `_engine/Peloton.tsx`, `_engine/number-list.ts`,
`_engine/TargetsStart.tsx`, `_engine/settings-numbers.ts`, `deck/DeckView.tsx`.
Les définitions métier (GMV, take rate, liquidité, taux de service) sont
sourcées en annexe.*

*Toute la copie citée est neuve : `TODO: à relire` dans le code (convention 6),
puis bon à tirer. La typographie finale se pose dans `src/content/`.*

---

> **État au 2026-10-04, à lire avant tout le reste.** C64 à C74 et C93 sont
> tranchées (§22.15). Quatre réponses vont contre la recommandation (C64 : les
> abonnements des vendeurs sont modélisés ; C65 : un réglage « produits ou
> services » ; C70 : deux diagnostics, un par côté ; C71 : un brief 10 à Claude
> Design avant les écrans), et C93 fixe le modèle des abonnements des vendeurs,
> avec une marge par flux. **Les sections §22.0 à §22.14 ci-dessous décrivent
> encore la version d'avant ces réponses : elles se réécrivent (`CHANTIERS.md`
> A23.b). Ne rien exécuter de ce document avant cette réécriture.**

## 22. La place de marché — spécification A23, premier jet du 2026-10-04

### 22.0 En une page

**Ce qui change.** Le réglage ouvre le troisième type, « Place de marché »
(`"marketplace"`). Une place de marché a **deux côtés**, les acheteurs et les
vendeurs, et gagne **une commission sur chaque commande**. Elle a donc son
propre moteur, construit comme l'assisté l'a été en A7.3 : une troisième
**motion**, `"mkt"`, avec **son catalogue** (quatorze chiffres), **son
funnel**, **son diagnostic**, **ses « Et si »**, **son argent** et **ses
slides**. Un moteur « place de marché » n'a que cette motion : il ne se
combine ni avec le libre-service ni avec l'assisté.

- **Le funnel des acheteurs** se lit « pour 100 inscrits » : combien passent
  une première commande dans la fenêtre, combien en passent une deuxième.
- **L'offre** se lit à côté : combien de vendeurs inscrits font une première
  vente, combien de vendeurs actifs partent chaque mois. **La liquidité** se
  lit en un chiffre, le **taux de service** : la part des demandes qui
  aboutissent à une commande.
- **L'argent** : le **revenu net** (ce que la place de marché garde) remplace
  le MRR. Revenu net = volume d'affaires (GMV) × commission (take rate). Le
  moteur projette le revenu net dans 12 mois comme il projette le MRR, à
  partir des **acheteurs actifs** (au moins une commande sur 12 mois) et de
  leur churn.
- **Une seule fuite** pour les deux côtés, nommée par une cible d'équipe
  (C1), chiffrée en revenu net quand le modèle le peut. **L'offre n'est jamais
  chiffrée en euros** : elle est nommée, pas évaluée (C67).
- **Les « Et si »** : huit leviers, dont la commission, le panier et la
  fréquence de commande.

**Ce qui ne change pas.**
- Le libre-service, l'assisté, l'hybride et l'app grand public ne bougent pas
  d'un caractère : goldens v1, v2 et de l'app verts **sans projection**.
- Aucune migration : un moteur « place de marché » est un fichier v3, avec
  trois fenêtres facultatives de plus dans le réglage.
- Tout reste local, bilingue, déterministe ; seule une cible d'équipe nomme
  une étape (C1) ; aucun repère publié n'est affiché pour ce type (C73) ;
  jamais de rouge sur une projection (S-5) ; jamais « offre contre demande »
  (C70).

**Ce que le type ne fait pas en v1** (C64) : les revenus hors commission
(abonnements des vendeurs, annonces payantes, publicité), les places de
marché où l'acheteur paie au vendeur hors plateforme, la saisonnalité, la
modélisation de l'effet de l'offre sur la demande.

**L'ouverture** : `ENGINE_TYPES=…,marketplace` (le drapeau de §21.3).

**L'effort.** Neuf PR (M0 à M8), ~23 jours-agent (§22.13), puis un bon à
tirer. Le chemin critique (M0 à M7) en fait ~21, M8 avançant en parallèle ;
au rythme observé sur A7.3 et A14 (estimés à 12 et 16,5 jours-agent, faits en
deux jours et un jour de calendrier), compter une à deux semaines, faites
surtout des réponses d'Antoine, de la relecture des captures et du bon à
tirer.

---

### 22.1 Les décisions de conception (décision · raison · alternative rejetée)

**D1 — Une troisième motion, exclusive.** `Motion` devient
`"plg" | "slg" | "mkt"`. Le réglage stocke toujours deux cases
(`motions: Record<SellingMotion, boolean>`, `SellingMotion = "plg" | "slg"`),
et la liste des motions actives se **dérive** : `activeMotions(setup)` vaut
`["mkt"]` pour une place de marché, la règle d'aujourd'hui sinon. *Raison* :
l'assisté a été ajouté exactement ainsi (catalogue, `MotionRules`, diagnostic,
constats, contrôles, série, deck par motion) ; le compilateur signale chaque
`Record<Motion, …>` et chaque `switch` à compléter, ce qui fait de la liste des
fichiers à toucher une sortie de `tsc`, pas une mémoire. *Rejeté* : un
pipeline à part, branché en tête de l'îlot, qui dupliquerait les écrans
génériques (liste des chiffres, écran d'un chiffre, demandes, Réglages).

**D2 — Pas de nouvelle version de fichier.** Les trois fenêtres de la place
de marché sont des champs **facultatifs** d'`EngineSetup`, lus par
`mktWindows(setup)` avec leurs défauts. *Raison* : un fichier v3 d'avant reste
valide tel quel ; les goldens ne bougent pas. *Rejeté* : un v4 avec migration,
pour trois champs qu'aucun autre type ne lit.

**D3 — L'argent se compte en revenu net, sur le modèle du MRR.**
- Revenu net du mois **R** = commandes × panier moyen × commission =
  acheteurs actifs × **a**, où **a** = fréquence × panier × commission est le
  revenu net d'un acheteur actif par mois.
- Les acheteurs actifs sont ceux qui ont commandé **au moins une fois sur les
  12 derniers mois** ; leur churn mensuel joue le rôle du churn logo.
- La projection est **la boucle du MRR** (`twelveMonths`) : chaque mois,
  `R ← R × (1 − churn) + N × a`, où **N** est le nombre de nouveaux acheteurs
  du mois.
*Raison* : c'est le seul modèle explicable en dix secondes qui réutilise
l'argent d'A20 (courbe, LTV, payback, trésorerie, alerte) sans le réécrire. La
fenêtre de 12 mois évite le piège d'une place de marché à achat rare, où un
acheteur « inactif ce mois-ci » n'est pas perdu. *Rejeté* : des acheteurs
actifs au mois (le churn y serait énorme et faux pour un achat rare) ; une
rétention du GMV par cohorte (juste, mais introuvable dans la plupart des
outils et impossible à projeter simplement).

**D4 — L'offre est nommée, jamais chiffrée en euros** (C67). Les chiffres des
vendeurs (première vente, churn des vendeurs) peuvent être nommés comme
l'étape qui freine, par une cible, mais sans montant. *Raison* : relier « plus
de vendeurs » à « plus de commandes » demande un modèle de la liquidité que
personne ne peut vérifier ; le taux de service, mesuré, en tient lieu. *Rejeté* :
une élasticité commandes/vendeurs, qui serait une hypothèse déguisée en
chiffre.

**D5 — Le taux de service est chiffré sur les seuls nouveaux acheteurs**
(C68). Un taux de service de 9 à 12 % multiplie les premières commandes par
12/9 ; l'effet sur les acheteurs déjà là n'est **pas** compté, et une
hypothèse imprimée le dit (c'est un minimum). *Raison* : c'est la même
mécanique que les autres flux (un même N, un même a), donc le diagnostic les
classe sans règle nouvelle ; et le moteur ne surestime jamais. *Rejeté* : le
taux de service appliqué à toutes les commandes, qui gagnerait presque
toujours le classement par construction.

**D6 — Les leviers d'argent jouent sur tous les acheteurs, dès le mois
suivant** (C69). La fréquence, le panier et la commission changent **a** pour
tout le monde à partir du mois 1 ; le mois 0 reste aujourd'hui. *Raison* : une
commission s'applique à toutes les commandes, pas aux nouveaux clients
seulement (à la différence de l'ARPA du libre-service, `arpa-new-customers`).
*Rejeté* : le comportement du libre-service, qui sous-estimerait une hausse de
commission d'un facteur dix.

**D7 — Une seule fuite, jamais « offre contre demande »** (C70). Le
diagnostic de la motion `"mkt"` positionne les huit candidats des deux côtés
et nomme une étape, ou un groupe. Aucun gabarit ne compare les deux côtés ; un
test garde les mots (`vs`, « plutôt que », « plus que l'offre »…).

**D8 — Un vocabulaire** (C65) : acheteurs, vendeurs, commandes, annonces. Une
place de marché de services lit « clients » et « prestataires » dans sa note
de définition (`definitionNote`), pas dans la copie.

**D9 — Pas de brief à Claude Design** (C71). Les écrans se composent avec les
composants existants ; deux composants neufs, présentationnels, sans jeton
neuf : `MktPeloton` (deux colonnes du peloton) et `SupplyBand` (l'offre et la
liquidité). Antoine relit les captures à M4 ; il peut demander un brief
ensuite.

**D10 — Aucun repère publié** (C73). Les catalogues publics de chiffres de
places de marché (take rate « du bas d'un chiffre au milieu des trente »,
etc.) ne sont pas dans le glossaire approuvé : chaque chiffre porte un
`noReferenceReason`.

---

### 22.2 Le contrat

#### 22.2.1 `src/lib/engine/types.ts`

```ts
export type BusinessType = "b2b-saas" | "consumer-app" | "marketplace";

/** The two ways a SaaS sells, the two boxes the setup stores (§18.2). */
export type SellingMotion = "plg" | "slg";
export const SELLING_MOTIONS: readonly SellingMotion[] = ["plg", "slg"];
/**
 * Every motion an engine can derive: the two selling motions, and the
 * marketplace's own (§22), which is never stored — `activeMotions(setup)`
 * derives it from `setup.type` — and never combines with the others.
 */
export type Motion = SellingMotion | "mkt";
/** The canonical order, the only one: screens, slides, lists. */
export const MOTIONS: readonly Motion[] = ["plg", "slg", "mkt"];

export type MktMetricId =
  | "mkt.buy.signup-rate"
  | "mkt.buy.cac"
  | "mkt.sell.cac"
  | "mkt.buy.first-order"
  | "mkt.sell.first-sale"
  | "mkt.liq.fill-rate"
  | "mkt.buy.repeat"
  | "mkt.buy.churn"
  | "mkt.sell.churn"
  | "mkt.buy.referred-share"
  | "mkt.rev.take-rate"
  | "mkt.rev.aov"
  | "mkt.rev.frequency"
  | "mkt.rev.gross-margin";
export type MetricId = PlgMetricId | SlgMetricId | LinkMetricId | MktMetricId;

export type MktDerivedId = "mkt.rev.ltv" | "mkt.rev.cac-payback" | "mkt.rev.ltv-cac";
export type DerivedId = PlgDerivedId | SlgDerivedId | MktDerivedId;

/** The marketplace's candidates (§22.5.6): both sides, one diagnosis. Two read « lower is better ». */
export type MktCandidateId =
  | "mkt.buy.signup-rate"
  | "mkt.buy.first-order"
  | "mkt.liq.fill-rate"
  | "mkt.sell.first-sale"
  | "mkt.buy.repeat"
  | "mkt.buy.churn"
  | "mkt.sell.churn"
  | "mkt.buy.referred-share";
export type CandidateId = PlgCandidateId | SlgCandidateId | MktCandidateId;
export type MktDiagnosis = Diagnosis<MktCandidateId>;

/** The marketplace's levers (§22.5.7), in panel order: down the funnel, then the money. */
export type MktLeverId =
  | "mkt.buy.signup-rate"
  | "mkt.buy.referred-share"
  | "mkt.buy.first-order"
  | "mkt.liq.fill-rate"
  | "mkt.buy.churn"
  | "mkt.rev.frequency"
  | "mkt.rev.aov"
  | "mkt.rev.take-rate";
export type LeverId = PlgLeverId | SlgLeverId | MktLeverId;
```

`SharedCount` gagne quatre comptes (§22.5.1) :
`"mktCohortSignups" | "mktOrders" | "mktGmv" | "mktNetRevenue"`.

`EngineSetup` :

```ts
  /** Which boxes are ticked; a marketplace stores both false (§22.3). */
  motions: Record<SellingMotion, boolean>;
  /** Marketplace (§22.2.3): part of mkt.buy.first-order's definition. Absent = 30. */
  firstOrderWindowDays?: 7 | 30 | 90;
  /** Marketplace: part of mkt.buy.repeat's definition (a second order within it). Absent = 90. */
  repeatWindowDays?: 60 | 90 | 180;
  /** Marketplace: part of mkt.sell.first-sale's definition. Absent = 60. */
  firstSaleWindowDays?: 30 | 60 | 90;
```

`SnapshotWindows` gagne les trois mêmes champs, facultatifs (la série compare
les définitions, §19.2.3).

`SanityId` gagne `"mkt-repeat-gt-first" | "mkt-take-high"`.

`UnitInputId` gagne `"mkt.buy.cac" | "mkt.rev.frequency" | "mkt.rev.aov" |
"mkt.rev.take-rate" | "mkt.rev.gross-margin" | "mkt.buy.churn"`.

`FixedSlideId` ne change pas ; `SlideId` gagne `"mkt:funnel"`.

`LeverView.unit` (`scenario.ts`) gagne `"ratio"` (la fréquence de commande,
un nombre simple, comme K).

`MotionDerived` gagne une branche, et les types dérivés de §22.5 :

```ts
  | { motion: "mkt"; coverage: Coverage; funnel: MktFunnel; diagnosis: MktDiagnosis; unit: MktUnitEconomics };
```

`Impact.metric` accepte déjà `CandidateId` (donc les candidats de la place de
marché). `Impact.kind` ne change pas : `"new-mrr"` se lit « revenu net
nouveau » pour la motion `"mkt"`, et la copie choisit ses mots par motion.

`TotalView` : ses `Record<Motion | "total", …>` deviennent
`Record<SellingMotion | "total", …>` (le total n'existe qu'en hybride).
`DeckModel.byMotion` devient `Partial<Record<Motion, DeckMotionChrome>>`.

#### 22.2.2 `src/lib/engine/business-type.ts` (créé par §21, complété)

```ts
export const BUSINESS_TYPES: readonly BusinessType[] = ["b2b-saas", "consumer-app", "marketplace"];

/** What a type may tick: a marketplace ticks nothing — its motion is derived. */
export function motionsAllowed(type: BusinessType): readonly SellingMotion[] {
  if (type === "marketplace") return [];
  return type === "consumer-app" ? ["plg"] : ["plg", "slg"];
}

/** The motions an engine derives, in MOTIONS order (§22.1 D1). */
export function activeMotions(setup: Pick<EngineSetup, "type" | "motions">): Motion[] {
  if (setup.type === "marketplace") return ["mkt"];
  return SELLING_MOTIONS.filter((m) => setup.motions[m]);
}

export const MKT_WINDOW_DEFAULTS = { firstOrderWindowDays: 30, repeatWindowDays: 90, firstSaleWindowDays: 60 } as const;
/** The three marketplace windows, each from the setup or its default. */
export function mktWindows(setup: EngineSetup): { firstOrderWindowDays: 7 | 30 | 90; repeatWindowDays: 60 | 90 | 180; firstSaleWindowDays: 30 | 60 | 90 };
```

`setupToolsFor("marketplace")` : `analytics` (ga4, mixpanel, amplitude,
posthog), `billing` (stripe), `crm` (hubspot, salesforce, pipedrive : l'offre
se recrute souvent à la main), `ads` (google-ads, meta-ads, linkedin-ads),
`other` (product-db, spreadsheet).

#### 22.2.3 `src/lib/engine/catalog-shape.ts`

- `MetricShape.scope` : `"plg" | "slg" | "link" | "mkt"`.
- `MetricShape.window` : ajouter `"first-order" | "repeat" | "first-sale"`.
- `MetricShape` gagne `side?: "buy" | "sell" | "match"` (le côté, pour
  l'étiquette de la liste des chiffres ; posé sur les seuls chiffres de la
  place de marché).
- **`shapesOf` change de signature** : `shapesOf(setup: Pick<EngineSetup,
  "type" | "motions">)`. Elle renvoie `MKT_METRIC_SHAPES` pour une place de
  marché, et la règle d'aujourd'hui sinon (elle lève toujours une erreur sur
  un SaaS sans motion). `motionShapes` suit. **Tous les appelants** passent le
  setup (ou `{ type, motions }`) au lieu des motions : `tsc` les liste. C'est
  un changement mécanique, sans effet sur le SaaS.
- `candidatesOf(motion)` : `"mkt"` → `MKT_CANDIDATE_IDS`.
- `motionOfMetric(id)` : préfixe `mkt.` → `"mkt"`, avant la règle actuelle.
- `metricsOfStageIn(stage, motion)` : `"mkt"` → `MKT_METRIC_SHAPES`.
- `cohort.ts#windowDaysOf` : les trois fenêtres, via `mktWindows(setup)`.
- `cohort.ts#defaultCohortMonth` : pour une place de marché,
  `matureCohortMonth(Math.max(firstOrder, repeat, firstSale), today)` (avec
  les défauts : 90 jours, donc la cohorte de mai pour un « aujourd'hui » au
  24 septembre 2026).

Les listes neuves, à côté de celles de l'assisté (contenu en §22.4) :
`MKT_METRIC_SHAPES`, `MKT_DERIVED_SHAPES`, `MKT_CANDIDATE_IDS`,
`MKT_LEVER_IDS`, `MKT_ENGINE_BRIDGES`. `ALL_METRIC_SHAPES`,
`ALL_DERIVED_SHAPES` et `ALL_LEVER_IDS` les incluent, **à la fin** (l'ordre
existant ne bouge pas : `engine-props.ts` les sert dans cet ordre).

Les règles partagées :
- `UNPRICED_CANDIDATES` += `"mkt.buy.repeat"`, `"mkt.sell.first-sale"`,
  `"mkt.sell.churn"` (D4 ; la deuxième commande n'est pas reliée au revenu
  par le modèle, §22.5.6) ;
- `REFERRAL_CANDIDATES` += `"mkt.buy.referred-share"` (même formule, même
  plafond de 50 %) ;
- nouvelle constante `LOWER_IS_BETTER_CANDIDATES = ["ret.logo-churn",
  "mkt.buy.churn", "mkt.sell.churn"]`, que `diagnose.ts#directionOf` lit à la
  place du test sur `"ret.logo-churn"` ;
- `TAKE_RATE_HIGH_PERCENT = 50` (§22.5.8).

---

### 22.3 Le fichier, la validation, l'import

- **Le réglage d'une place de marché** stocke `type: "marketplace"`,
  `motions: { plg: false, slg: false }`, les quatre fenêtres du SaaS à leurs
  défauts (champs obligatoires du type, sans usage ici) et ses trois fenêtres.
- **`validate.ts`** :
  - `type` dans `BUSINESS_TYPES` ;
  - si `type === "marketplace"` : les deux cases à `false` (sinon
    `"setup.motions: a marketplace ticks no selling motion"`) ;
  - sinon, au moins une case cochée, et rien hors de `motionsAllowed(type)`
    (règle de §21.4.3) ;
  - les trois fenêtres, si présentes, dans leurs listes ;
  - `whatIf` : `ALL_LEVER_IDS` inclut les leviers de la place de marché ;
    `mkt.rev.frequency` est un nombre ≥ 0 (pas un pourcentage) ;
  - `company-wide` (la marge globale prise en estimation, C25 Q4) reste
    réservé aux deux marges du SaaS : `mkt.rev.gross-margin` ne l'accepte pas.
- **`io.ts#sellsSomehow`** : un SaaS ou une app avec au moins une motion
  permise, ou une place de marché sans aucune. Sinon `unsupported-setup`.
- **`migrate.ts`** : rien.
- **`merge.ts`** : rien (deux types différents refusent déjà la fusion).
- **`storage.ts`** : rien.
- **`shared-counts.ts`** : quatre comptes de plus (§22.5.1) ;
  `WHOLE_SHARED_COUNTS` += `mktCohortSignups`, `mktOrders` (les deux autres
  sont des montants).

---

### 22.4 Le catalogue

#### 22.4.1 La forme (`MKT_METRIC_SHAPES`)

Tous : `scope: "mkt"`, `span: 1`. Les ★ portent la colonne ou la ligne de leur
étape.

| Id | Étape | ★ | `side` | `valueKinds` → `unit` | Bornes, montants | `flow` / `window` | Effort | Rôle | `sources` | Glossaire | Tour | Variantes, raisons | Réparation |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `mkt.buy.signup-rate` | acquisition | ★ | buy | ratio, rate → percent | bornée | month | self-5min | marketing | ga4, mixpanel, amplitude, product-db | `acquisition` | — | — | afternoon |
| `mkt.buy.cac` | acquisition | | buy | ratio, amount → money | — | month | ask | finance | google-ads, meta-ads, product-db | `cac` | `acq-3` | variants `media-only`, `plus-team`, `fully-loaded` | meeting |
| `mkt.sell.cac` | acquisition | | sell | ratio, amount → money | — | month | ask | finance | hubspot, spreadsheet, linkedin-ads | `cac` | — | mêmes variantes | meeting |
| `mkt.buy.first-order` | activation | ★ | buy | ratio, rate → percent | bornée | cohort / `first-order` | self-1h | data | product-db, amplitude, mixpanel | `activation` | `act-2` | — | sprint |
| `mkt.sell.first-sale` | activation | | sell | ratio, rate → percent | bornée | cohort / `first-sale` | self-1h | data | product-db | `activation` | — | — | sprint |
| `mkt.liq.fill-rate` | activation | | match | ratio, rate → percent | bornée | month | ask | data | product-db, amplitude, mixpanel | `activation` (puis le terme de M8) | — | variants `requests`, `searches` | sprint |
| `mkt.buy.repeat` | retention | ★ | buy | ratio, rate → percent | bornée | cohort / `repeat` | self-1h | data | product-db, amplitude | `retention` | `ret-1` | — | sprint |
| `mkt.buy.churn` | retention | | buy | ratio, rate → percent | bornée | month | ask | data | product-db | `churn` | — | — | afternoon |
| `mkt.sell.churn` | retention | | sell | ratio, rate → percent | bornée | month | ask | data | product-db | `churn` | — | — | afternoon |
| `mkt.buy.referred-share` | referral | ★ | buy | ratio, rate → percent | bornée | cohort | self-1h | marketing | product-db, hubspot | `referral` | — | — | sprint |
| `mkt.rev.take-rate` | revenue | ★ | match | ratio, rate → percent | bornée, montants | month | self-5min | finance | stripe, spreadsheet, product-db | `revenue` (puis M8) | — | — | meeting |
| `mkt.rev.aov` | revenue | | buy | ratio, amount → money | — | month | self-5min | finance | product-db, stripe | `arpu` | — | — | meeting |
| `mkt.rev.frequency` | revenue | | buy | ratio → ratio | non bornée | month | self-1h | data | product-db | `retention` | — | — | afternoon |
| `mkt.rev.gross-margin` | revenue | | match | ratio, rate → percent | bornée, montants | month | ask | finance | spreadsheet | `cac-payback` | — | — | meeting |

Efforts : 3 en cinq minutes, 5 en une heure, 6 à demander (14). Aucun
`benchmark` (D10). `mkt.buy.first-order` ne dépend d'aucun événement (la
commande est l'événement).

**Les calculés** (`MKT_DERIVED_SHAPES`, étape revenue, sans repère) :

| Id | `inputs` | Glossaire | Tour |
|---|---|---|---|
| `mkt.rev.ltv` | `mkt.rev.frequency`, `mkt.rev.aov`, `mkt.rev.take-rate`, `mkt.rev.gross-margin`, `mkt.buy.churn` | `ltv` | `rev-2` |
| `mkt.rev.cac-payback` | `mkt.buy.cac`, `mkt.rev.frequency`, `mkt.rev.aov`, `mkt.rev.take-rate`, `mkt.rev.gross-margin` | `cac-payback` | — |
| `mkt.rev.ltv-cac` | les six | `ltv` | — |

**Les listes** :
- `MKT_CANDIDATE_IDS` : `mkt.buy.signup-rate`, `mkt.buy.first-order`,
  `mkt.liq.fill-rate`, `mkt.sell.first-sale`, `mkt.buy.repeat`,
  `mkt.buy.churn`, `mkt.sell.churn`, `mkt.buy.referred-share` (ordre
  canonique, celui de l'AARRR puis des côtés) ;
- `MKT_LEVER_IDS` : l'ordre de `MktLeverId` (§22.2.1) ;
- `MKT_ENGINE_BRIDGES` : `acq-3` → `mkt.buy.cac`, `act-2` →
  `mkt.buy.first-order`, `ret-1` → `mkt.buy.repeat`, `rev-2` → `mkt.rev.ltv`
  (dérivés des formes, comme les deux autres listes).

#### 22.4.2 La prose (`ENGINE_CATALOG`, `ENGINE_DERIVED_CATALOG`)

Les entrées s'ajoutent aux deux records existants (ils sont typés
`Record<MetricId, …>` et `Record<DerivedId, …>` : le compilateur les exige),
dans un bloc `// --- Marketplace (§22) ---` en fin de record, sous un
marqueur `TODO: à relire`. Toutes portent un `noReferenceReason`. Les règles
d'écriture d'`engine-catalog.ts` s'appliquent (rapports vérifiés, aucun menu
inventé, six placeholders, glyphes des slides, « jamais de {month} »).

**`mkt.buy.signup-rate`**
- name : « Taux d'inscription des acheteurs » / "Buyer sign-up rate"
- oneLiner : « La part des visiteurs du mois qui créent un compte acheteur. » / "The share of the month's visitors who create a buyer account."
- formula : « comptes acheteurs créés dans le mois ÷ visiteurs uniques du mois » / "buyer accounts created in the month ÷ unique visitors in the month"
- inputs : « Inscrits acheteurs en {month} » / "Buyer sign-ups in {month}" ; « Visiteurs uniques en {month} » / "Unique visitors in {month}"
- where : 1. ga4 · « GA4 » · recopier le chemin de `acq.signup-rate` ; 2. mixpanel · « Mixpanel ou Amplitude » · recopier ; 3. product-db · « Base produit » · « les comptes acheteurs créés sur le mois » / "the buyer accounts created in the month"
- trap : « Si on peut commander sans compte, compte la première commande avec une adresse e-mail neuve comme une inscription, sinon tes taux suivants sont faussés. Les vendeurs qui s'inscrivent n'entrent pas ici. » / "If people can order without an account, count a first order with a new email address as a sign-up, or your next rates are skewed. Sellers who sign up don't belong here."
- request : « le nombre de visiteurs uniques et le nombre de comptes acheteurs créés en {month} » / "the number of unique visitors and of buyer accounts created in {month}"
- noReferenceReason : « la conversion dépend de ce qu'il faut pour voir l'offre sans compte ; suis-la contre ta propre cible » / "conversion depends on how much people can see without an account; follow it against your own target"

**`mkt.buy.cac`**
- name : « CAC acheteur » / "Buyer CAC"
- oneLiner : « Ce que coûte, en moyenne, un nouvel acheteur. » / "What a new buyer costs, on average."
- formula : « dépense d'acquisition côté acheteurs du mois ÷ nouveaux acheteurs du mois (première commande) » / "buyer-side acquisition spend in the month ÷ new buyers in the month (first order)"
- inputs : « Dépense d'acquisition des acheteurs en {month} » / "Buyer acquisition spend in {month}" ; « Nouveaux acheteurs en {month} » / "New buyers in {month}"
- where : 1. google-ads · « Google Ads, Meta Ads Manager » · « le montant dépensé en {month} pour les campagnes qui visent les acheteurs » / "the amount spent in {month} on the campaigns aimed at buyers" ; 2. role finance · « Finance » · recopier le chemin des variantes ; 3. product-db · « Base de commandes » · « les acheteurs dont la première commande date de {month} » / "the buyers whose first order is in {month}"
- trap : « La dépense pour recruter des vendeurs n'entre pas ici : elle a son propre chiffre. Un nouvel acheteur est quelqu'un qui commande pour la première fois, pas quelqu'un qui s'inscrit. » / "Spend to recruit sellers doesn't belong here: it has its own number. A new buyer is someone who orders for the first time, not someone who signs up."
- request : « la dépense d'acquisition côté acheteurs en {month} ({variant}) et le nombre de nouveaux acheteurs du même mois » / "the buyer-side acquisition spend in {month} ({variant}) and the number of new buyers that same month"
- noReferenceReason : « il se juge contre ce qu'un acheteur rapporte (payback, LTV:CAC), pas dans l'absolu » / "it is judged against what a buyer brings in (payback, LTV:CAC), not in absolute terms"
- variants : mêmes libellés que `acq.cac`.

**`mkt.sell.cac`**
- name : « Coût d'un vendeur actif » / "Cost per active seller"
- oneLiner : « Ce que coûte, en moyenne, un vendeur qui fait sa première vente. » / "What a seller who makes a first sale costs, on average."
- formula : « dépense pour recruter des vendeurs du mois ÷ vendeurs qui ont fait leur première vente dans le mois » / "spend to recruit sellers in the month ÷ sellers who made their first sale in the month"
- inputs : « Dépense pour l'offre en {month} » / "Supply spend in {month}" ; « Nouveaux vendeurs actifs en {month} » / "New active sellers in {month}"
- where : 1. hubspot · « HubSpot ou ton CRM » · « les vendeurs recrutés par l'équipe et le temps passé, si l'offre se recrute à la main » / "the sellers recruited by the team and the time spent, if supply is recruited by hand" ; 2. spreadsheet · « Finance » · « les salaires de l'équipe offre et les campagnes qui visent les vendeurs » / "the supply team's salaries and the campaigns aimed at sellers"
- trap : « Il se lit à côté du CAC acheteur, jamais contre lui : les deux côtés ne se remplacent pas. » / "It is read next to the buyer CAC, never against it: one side doesn't replace the other."
- request : « la dépense pour recruter des vendeurs en {month} ({variant}) et le nombre de vendeurs qui ont fait leur première vente ce mois-là » / "the spend to recruit sellers in {month} ({variant}) and the number of sellers who made their first sale that month"
- noReferenceReason : « le moteur ne relie pas un vendeur à un revenu : ce coût se suit, il ne se rembourse pas sur une slide » / "the engine doesn't tie a seller to revenue: this cost is followed, it isn't paid back on a slide"
- variants : mêmes ids ; libellé de `plus-team` : « + équipe offre » / "+ supply team".

**`mkt.buy.first-order`**
- name : « Première commande » / "First order"
- oneLiner : « La part des inscrits qui passent une première commande à temps. » / "The share of sign-ups who place a first order in time."
- formula : « inscrits acheteurs de la cohorte ayant passé une première commande sous {n} jours ÷ inscrits acheteurs de la cohorte » / "cohort buyer sign-ups who placed a first order within {n} days ÷ cohort buyer sign-ups"
- inputs : « Première commande sous {n} jours » / "First order within {n} days" ; « Inscrits acheteurs en {cohort} » / "Buyer sign-ups from {cohort}"
- where : 1. product-db · « Base de commandes » · « les inscrits en {cohort} et la date de leur première commande payée » / "the sign-ups from {cohort} and the date of their first paid order" ; 2. amplitude · « Amplitude ou Mixpanel » · « un entonnoir inscription puis commande payée, avec une fenêtre de conversion de {n} jours » / "a funnel from sign-up to paid order, with a conversion window of {n} days"
- trap : « Compte une commande payée, pas un panier ni une demande envoyée. Une commande annulée ou remboursée en entier ne compte pas. » / "Count a paid order, not a basket or a request sent. An order cancelled or refunded in full doesn't count."
- request : « pour les inscrits acheteurs en {cohort}, combien ont passé une première commande payée sous {n} jours, et combien d'inscrits au total » / "for the buyer sign-ups from {cohort}, how many placed a first paid order within {n} days, and how many sign-ups in total"
- noReferenceReason : « aucun taux publié ne porte sur la même base que le tien ; compare-toi à toi-même » / "no published rate uses the same base as yours; compare with yourself"

**`mkt.sell.first-sale`**
- name : « Première vente » / "First sale"
- oneLiner : « La part des vendeurs inscrits qui vendent une première fois à temps. » / "The share of seller sign-ups who make a first sale in time."
- formula : « vendeurs inscrits de la cohorte ayant fait une première vente sous {n} jours ÷ vendeurs inscrits de la cohorte » / "cohort seller sign-ups who made a first sale within {n} days ÷ cohort seller sign-ups"
- inputs : « Première vente sous {n} jours » / "First sale within {n} days" ; « Vendeurs inscrits en {cohort} » / "Seller sign-ups from {cohort}"
- where : 1. product-db · « Base produit » · « les vendeurs inscrits en {cohort} et la date de leur première vente payée » / "the sellers who signed up in {cohort} and the date of their first paid sale"
- trap : « Un vendeur qui publie sans vendre n'est pas activé : c'est la vente qui compte, pas l'annonce. » / "A seller who lists without selling isn't activated: the sale counts, not the listing."
- request : « pour les vendeurs inscrits en {cohort}, combien ont fait une première vente payée sous {n} jours, et combien de vendeurs inscrits au total » / "for the sellers who signed up in {cohort}, how many made a first paid sale within {n} days, and how many seller sign-ups in total"
- noReferenceReason : recopier celle de `mkt.buy.first-order`.

**`mkt.liq.fill-rate`**
- name : « Taux de service » / "Fill rate"
- oneLiner : « La part des demandes qui trouvent une offre et aboutissent à une commande. » / "The share of requests that find supply and end in an order."
- formula : « demandes qui aboutissent à une commande ÷ demandes du mois ({variant}) » / "requests that end in an order ÷ requests in the month ({variant})"
- inputs : « Demandes servies en {month} » / "Requests filled in {month}" ; « Demandes en {month} » / "Requests in {month}"
- where : 1. product-db · « Base produit » · « les demandes, réservations ou missions publiées en {month}, et celles qui ont abouti à une commande » / "the requests, bookings or jobs posted in {month}, and those that ended in an order" ; 2. amplitude · « Amplitude ou Mixpanel » · « les sessions avec une recherche et une fiche consultée, et celles qui se terminent par une commande » / "the sessions with a search and a listing viewed, and those that end in an order"
- trap : « Écris ce qu'est une demande. Avec des recherches, ne compte que celles où quelqu'un a regardé une annonce : une recherche vide n'est pas une demande. » / "Write down what a request is. With searches, only count those where someone looked at a listing: an empty search isn't a request."
- request : « le nombre de demandes en {month} ({variant}) et le nombre de celles qui ont abouti à une commande » / "the number of requests in {month} ({variant}) and how many ended in an order"
- noReferenceReason : « il dépend de ce que tu comptes comme une demande ; c'est le chiffre qui dit si ta place de marché tient sa promesse, suis-le contre ta cible » / "it depends on what you count as a request; it is the number that says whether your marketplace keeps its promise, follow it against your target"
- variants : `requests` · « Demandes explicites (réservation, devis, mission) » / "Explicit requests (booking, quote, job)" ; `searches` · « Recherches avec une annonce consultée » / "Searches with a listing viewed"

**`mkt.buy.repeat`**
- name : « Deuxième commande » / "Second order"
- oneLiner : « La part des inscrits qui reviennent commander une deuxième fois à temps. » / "The share of sign-ups who come back for a second order in time."
- formula : « inscrits acheteurs de la cohorte ayant passé au moins deux commandes sous {n} jours ÷ inscrits acheteurs de la cohorte » / "cohort buyer sign-ups who placed at least two orders within {n} days ÷ cohort buyer sign-ups"
- inputs : « Deux commandes sous {n} jours » / "Two orders within {n} days" ; « Inscrits acheteurs en {cohort} » / "Buyer sign-ups from {cohort}"
- where : 1. product-db · « Base de commandes » · « les inscrits en {cohort} qui ont au moins deux commandes payées dans les {n} jours qui suivent leur inscription » / "the sign-ups from {cohort} with at least two paid orders in the {n} days after signing up" ; 2. amplitude · « Amplitude » · « un graphique Retention Analysis, retour une commande payée, lu sur {n} jours » / "a Retention Analysis chart, return event a paid order, read over {n} days"
- trap : « La fenêtre court depuis l'inscription, pas depuis la première commande : c'est ce qui garde les deux colonnes sur les mêmes 100 inscrits. » / "The window runs from sign-up, not from the first order: that is what keeps both columns on the same 100 sign-ups."
- request : « pour les inscrits acheteurs en {cohort}, combien ont passé au moins deux commandes payées sous {n} jours, et combien d'inscrits au total » / "for the buyer sign-ups from {cohort}, how many placed at least two paid orders within {n} days, and how many sign-ups in total"
- noReferenceReason : « la fréquence d'achat d'une catégorie à l'autre va de la semaine à l'année ; compare-toi à toi-même » / "purchase frequency ranges from weekly to yearly across categories; compare with yourself"

**`mkt.buy.churn`**
- name : « Churn mensuel des acheteurs » / "Monthly buyer churn"
- oneLiner : « La part des acheteurs actifs qui cessent de l'être dans le mois. » / "The share of active buyers who stop being active in the month."
- formula : « acheteurs sortis des actifs dans le mois ÷ acheteurs actifs au 1er du mois (actif : au moins une commande sur les 12 derniers mois) » / "buyers who left the active base in the month ÷ active buyers at the start of the month (active: at least one order in the last 12 months)"
- inputs : « Acheteurs sortis en {month} » / "Buyers who left in {month}" ; « Acheteurs actifs au 1er {month} » / "Active buyers at the start of {month}"
- where : 1. product-db · « Base de commandes » · « les acheteurs actifs au 1er {month} dont la dernière commande atteint ses 12 mois pendant le mois sans nouvelle commande » / "the buyers active at the start of {month} whose last order turns 12 months old during the month with no new order"
- trap : « Sans liste des départs, il se déduit : actifs au 1er + nouveaux acheteurs – actifs à fin de mois, divisé par les actifs au 1er. Un acheteur qui revient après plus d'un an compte alors comme resté. » / "Without a list of who left, it can be derived: active at the start + new buyers – active at month end, divided by active at the start. A buyer who comes back after more than a year then counts as kept."
- request : « le nombre d'acheteurs actifs (au moins une commande sur 12 mois) au 1er {month}, et le nombre de ceux qui ne l'étaient plus à la fin du mois » / "the number of active buyers (at least one order in 12 months) at the start of {month}, and how many were no longer active at month end"
- noReferenceReason : « il dépend de la fréquence d'achat de ta catégorie ; suis-le contre ta propre cible » / "it depends on how often your category buys; follow it against your own target"

**`mkt.sell.churn`**
- name : « Churn mensuel des vendeurs » / "Monthly seller churn"
- oneLiner : « La part des vendeurs actifs qui cessent de l'être dans le mois. » / "The share of active sellers who stop being active in the month."
- formula : « vendeurs sortis des actifs dans le mois ÷ vendeurs actifs au 1er du mois (actif : au moins une vente sur les 12 derniers mois) » / "sellers who left the active base in the month ÷ active sellers at the start of the month (active: at least one sale in the last 12 months)"
- inputs : « Vendeurs sortis en {month} » / "Sellers who left in {month}" ; « Vendeurs actifs au 1er {month} » / "Active sellers at the start of {month}"
- where : 1. product-db · « Base produit » · « les vendeurs actifs au 1er {month} et ceux dont la dernière vente atteint ses 12 mois sans nouvelle vente » / "the sellers active at the start of {month} and those whose last sale turns 12 months old with no new sale"
- trap : « Un vendeur qui ferme son compte et un vendeur qui ne vend plus partent tous les deux : compte les deux. » / "A seller who closes their account and a seller who no longer sells both leave: count both."
- request : « le nombre de vendeurs actifs au 1er {month}, et le nombre de ceux qui ne l'étaient plus à la fin du mois » / "the number of active sellers at the start of {month}, and how many were no longer active at month end"
- noReferenceReason : recopier celle de `mkt.buy.churn`.

**`mkt.buy.referred-share`**
- name : « Part des acheteurs recommandés » / "Referred buyer share"
- oneLiner : « La part des inscrits acheteurs amenés par un utilisateur. » / "The share of buyer sign-ups brought in by a user."
- formula : « inscrits acheteurs arrivés par un utilisateur (parrainage, lien partagé, réponse « comment nous as-tu connus ? ») ÷ inscrits acheteurs de la cohorte » / "buyer sign-ups who came through a user (referral, shared link, \"how did you hear about us?\" answer) ÷ cohort buyer sign-ups"
- inputs : « Inscrits acheteurs recommandés » / "Referred buyer sign-ups" ; « Inscrits acheteurs en {cohort} » / "Buyer sign-ups from {cohort}"
- where : 1. product-db · « Outil de parrainage ou base produit » · « les inscrits en {cohort} qui ont un parrain, un code ou un lien partagé par un vendeur ou un acheteur » / "the sign-ups from {cohort} with a referrer, a code or a link shared by a seller or a buyer" ; 2. hubspot · « HubSpot » · recopier le chemin de `ref.referred-share`
- trap : « Un vendeur qui partage son annonce amène des acheteurs : c'est de la recommandation, compte-la. La source « referral » de GA4 n'en est pas. » / "A seller who shares their listing brings buyers: that is referral, count it. GA4's \"referral\" source isn't."
- request : « pour les inscrits acheteurs en {cohort}, combien sont arrivés par un parrainage, un lien partagé ou une recommandation déclarée » / "for the buyer sign-ups from {cohort}, how many came through a referral, a shared link or a stated recommendation"
- noReferenceReason : recopier celle de `ref.referred-share`.

**`mkt.rev.take-rate`**
- name : « Commission (take rate) » / "Take rate"
- oneLiner : « La part du volume d'affaires que la place de marché garde. » / "The share of the gross volume the marketplace keeps."
- formula : « revenu net du mois (commissions et frais facturés) ÷ volume d'affaires du mois (GMV) » / "net revenue in the month (commissions and fees charged) ÷ gross merchandise value in the month (GMV)"
- inputs : « Revenu net en {month} » / "Net revenue in {month}" ; « Volume d'affaires (GMV) en {month} » / "Gross merchandise value (GMV) in {month}"
- where : 1. stripe · « Stripe Connect » · « le volume des paiements du mois et les frais que la plateforme a prélevés » / "the month's payment volume and the fees the platform collected" ; 2. spreadsheet · « Finance » · « le chiffre d'affaires de commissions du mois et le volume qui l'a produit » / "the month's commission revenue and the volume that produced it" ; 3. product-db · « Base de commandes » · « la somme des commandes payées du mois et la commission de chacune » / "the sum of the month's paid orders and each one's commission"
- trap : « Le GMV compte ce que paient les acheteurs, frais de livraison et taxes selon ta définition : écris-la. Un remboursement retire sa commande des deux côtés. Les abonnements des vendeurs et la publicité n'entrent pas dans le revenu net du moteur. » / "GMV counts what buyers pay, shipping and taxes depending on your definition: write it down. A refund takes its order off both sides. Seller subscriptions and advertising don't go into the engine's net revenue."
- request : « le volume d'affaires (GMV) de {month} et le revenu net que la place de marché en a gardé (commissions et frais) » / "the gross merchandise value (GMV) of {month} and the net revenue the marketplace kept from it (commissions and fees)"
- noReferenceReason : « elle dépend de ce que la place de marché fait pour la transaction (paiement, garantie, livraison) ; elle se suit contre ta cible » / "it depends on what the marketplace does for the transaction (payment, guarantee, delivery); follow it against your target". *Pas de fourchette : aucune n'est dans le glossaire approuvé (règle d'en-tête d'`engine-catalog.ts`). M8 pourra en sourcer une dans le terme « take rate ».*

**`mkt.rev.aov`**
- name : « Panier moyen » / "Average order value"
- oneLiner : « Ce que vaut, en moyenne, une commande. » / "What an order is worth, on average."
- formula : « volume d'affaires du mois ÷ commandes du mois » / "gross merchandise value in the month ÷ orders in the month"
- inputs : « Volume d'affaires (GMV) en {month} » / "Gross merchandise value (GMV) in {month}" ; « Commandes en {month} » / "Orders in {month}"
- where : 1. product-db · « Base de commandes » · « la somme et le nombre des commandes payées du mois » / "the sum and the number of the month's paid orders" ; 2. stripe · « Stripe Connect » · « le volume et le nombre des paiements du mois » / "the month's payment volume and count"
- trap : « Garde la même définition du GMV que pour la commission : les deux partagent ce chiffre. » / "Keep the same definition of GMV as for the take rate: both share this number."
- request : « le volume d'affaires (GMV) et le nombre de commandes payées en {month} » / "the gross merchandise value (GMV) and the number of paid orders in {month}"
- noReferenceReason : « il dépend entièrement de ce qui se vend chez toi » / "it depends entirely on what sells on your marketplace"

**`mkt.rev.frequency`**
- name : « Fréquence de commande » / "Order frequency"
- oneLiner : « Le nombre moyen de commandes d'un acheteur actif dans le mois. » / "The average number of orders an active buyer places in the month."
- formula : « commandes du mois ÷ acheteurs actifs à fin de mois (actif : au moins une commande sur 12 mois) » / "orders in the month ÷ active buyers at month end (active: at least one order in 12 months)"
- inputs : « Commandes en {month} » / "Orders in {month}" ; « Acheteurs actifs à fin {month} » / "Active buyers at the end of {month}"
- where : 1. product-db · « Base de commandes » · « le nombre de commandes payées du mois, et le nombre d'acheteurs avec au moins une commande sur les 12 derniers mois à la fin du mois » / "the number of paid orders in the month, and the number of buyers with at least one order in the last 12 months at month end"
- trap : « Elle se lit sur les acheteurs actifs sur 12 mois, pas sur ceux du mois : 0,3 veut dire qu'un acheteur actif commande à peu près une fois tous les trois mois. » / "It is read on buyers active over 12 months, not on the month's: 0.3 means an active buyer orders about once every three months."
- request : « le nombre de commandes payées en {month} et le nombre d'acheteurs actifs (au moins une commande sur 12 mois) à la fin du mois » / "the number of paid orders in {month} and the number of active buyers (at least one order in 12 months) at month end"
- noReferenceReason : recopier celle de `mkt.buy.repeat`.

**`mkt.rev.gross-margin`**
- name : « Marge sur le revenu net » / "Margin on net revenue"
- oneLiner : « Ce qu'il reste du revenu net après le coût direct de chaque commande. » / "What is left of net revenue after the direct cost of each order."
- formula : « (revenu net – coûts directs : frais de paiement, assurance, support des commandes, remboursements à ta charge) ÷ revenu net » / "(net revenue – direct costs: payment fees, insurance, order support, refunds you bear) ÷ net revenue"
- inputs : « Marge sur ce revenu net » / "Margin on that net revenue" ; « Revenu net en {month} » / "Net revenue in {month}"
- where : 1. role finance · « Finance » · « le compte de résultat du dernier trimestre clos : le revenu net, puis les coûts directs des commandes » / "the income statement of the last closed quarter: net revenue, then the direct cost of orders"
- trap : « Les frais de paiement se paient sur tout le GMV, pas sur ta commission : à 12 % de commission, 2 % de frais sur le GMV mangent déjà un sixième de ton revenu net. » / "Payment fees are paid on the whole GMV, not on your commission: at a 12% take rate, 2% fees on GMV already eat a sixth of your net revenue."
- request : « la marge sur le revenu net du dernier trimestre clos, et ce que ses coûts directs comprennent » / "the margin on net revenue of the last closed quarter, and what its direct costs include"
- noReferenceReason : « les repères de marge publiés portent sur le logiciel, pas sur une commission » / "the published margin references are for software, not for a commission"

**Les trois calculés** (`ENGINE_DERIVED_CATALOG`) :
- `mkt.rev.ltv` : name « LTV acheteur » / "Buyer LTV" ; formula « fréquence × panier moyen × commission × marge × durée de vie (1 ÷ churn mensuel des acheteurs, au plus 36 mois) » / "frequency × average order value × take rate × margin × lifetime (1 ÷ monthly buyer churn, at most 36 months)" ; uncomputable et capNote : recopier ceux de `rev.ltv`.
- `mkt.rev.cac-payback` : name « CAC payback acheteur » / "Buyer CAC payback" ; formula « CAC acheteur ÷ (fréquence × panier moyen × commission × marge), en mois » / "buyer CAC ÷ (frequency × average order value × take rate × margin), in months" ; caveat : « la vraie comparaison reste la trésorerie » / "the real comparison is still the cash in the bank".
- `mkt.rev.ltv-cac` : name « LTV:CAC acheteur » / "Buyer LTV:CAC" ; formula « LTV acheteur ÷ CAC acheteur » ; caveat : « un repère, pas une loi ».

---

### 22.5 Le modèle pur (`src/lib/engine/`)

Tout est en intervalles (`interval.ts` : `mul`, `div`, `scale`, `sub`,
`mapBounds`, `point`), comme le reste du moteur ; une valeur inconnue est
`null`, jamais 0. Les noms de fonctions sont imposés.

#### 22.5.1 Les nombres partagés (`shared-counts.ts`)

```ts
mktCohortSignups: [
  { metric: "mkt.buy.first-order", side: "denominator" },
  { metric: "mkt.buy.repeat", side: "denominator" },
  { metric: "mkt.buy.referred-share", side: "denominator" },
],
mktOrders: [
  { metric: "mkt.rev.frequency", side: "numerator" },
  { metric: "mkt.rev.aov", side: "denominator" },
],
mktGmv: [
  { metric: "mkt.rev.aov", side: "numerator" },
  { metric: "mkt.rev.take-rate", side: "denominator" },
],
mktNetRevenue: [
  { metric: "mkt.rev.take-rate", side: "numerator" },
  { metric: "mkt.rev.gross-margin", side: "denominator" },
],
```

Lecture des valeurs : rien de neuf. `values.ts#readingValue` lit déjà un
ratio en pourcentage pour une unité `percent`, et en quotient simple sinon
(la fréquence 4 212 ÷ 14 040 = 0,3 ; le panier 273 780 ÷ 4 212 = 65 €).

#### 22.5.2 Les grandeurs de base (`mkt-economics.ts`, nouveau)

```ts
/** a: net revenue of one active buyer in a month = frequency × AOV × take rate / 100. null if one is unknown. */
export function mktRevenuePerBuyer(state: EngineState, ctx: EngineCalcContext): Interval | null;
/** R: the month's net revenue — the shared mktNetRevenue when typed (solid), else a × active buyers (the frequency's denominator). */
export function mktNetRevenueToday(state: EngineState, ctx: EngineCalcContext): Interval | null;
/** GMV of the month — the shared mktGmv when typed, else R ÷ (take rate / 100). */
export function mktGmvToday(state: EngineState, ctx: EngineCalcContext): Interval | null;
/** N: new buyers in the month — mkt.buy.cac's denominator when > 0, else the buyer sign-ups of the month × first order / 100. */
export function mktNewBuyersPerMonth(state: EngineState, ctx: EngineCalcContext): Interval | null;
/** The active buyers on the 1st: mkt.buy.churn's denominator, or null. */
export function mktActiveBuyersStart(state: EngineState): number | null;
```

Les inscrits acheteurs du mois sont le numérateur de `mkt.buy.signup-rate`
(un seul emplacement : pas de nombre partagé).

#### 22.5.3 Le funnel des acheteurs, l'offre, la liquidité (`mkt-funnel.ts`, nouveau)

```ts
export interface MktFunnelColumn {
  metric: "mkt.buy.first-order" | "mkt.buy.repeat";
  /** null = unknown, never 0. Rounded per bound, like the peloton. */
  perHundred: Interval | null;
  confidence: Confidence;
  source: SourceRef | null;
  period: YearMonth | null;
}
export interface MktFunnel {
  /** 100 ÷ buyer sign-up rate × 100: the visitors behind 100 sign-ups. */
  visitorsPerHundred: Interval | null;
  /** The referred share, rounded: the red dots of the sign-ups grid. */
  referredPerHundred: Interval | null;
  upstreamSource: SourceRef | null;
  upstreamPeriod: YearMonth | null;
  /** Always 2, first order then second order, both on the same 100 sign-ups. */
  columns: MktFunnelColumn[];
  chain: Peloton["chain"];
  /** A cohort under SMALL_COHORT_SIZE (buyer sign-ups or seller sign-ups). */
  smallCohort: boolean;
  supply: {
    /** Seller sign-ups of the cohort who sold within the window, per 100. */
    firstSalePerHundred: Interval | null;
    firstSaleConfidence: Confidence;
    firstSaleSource: SourceRef | null;
    churn: Known;
  };
  /** The fill rate as known, and which kind of request it counts. */
  fill: Known;
  fillVariant: "requests" | "searches" | null;
}
export function buildMktFunnel(state: EngineState, ctx: EngineCalcContext): MktFunnel;
```

Même règle que `peloton.ts` : `perHundred = mapBounds(known.value,
Math.round)`, `visitorsPerHundred = div(point(10_000), signupRate)`, la même
fonction `chainOf` (à exporter de `peloton.ts` si elle ne l'est pas), avec
les inscrits en tête comme colonne connue.

#### 22.5.4 L'économie d'un acheteur et l'argent (`mkt-economics.ts`)

```ts
export interface MktUnitEconomics {
  cacVariant: string | null;
  /** a, per month. */
  revenuePerBuyer: DerivedValue;
  ltv: DerivedValue; // months capped at LTV_CAP_MONTHS
  payback: DerivedValue; // months
  ltvCac: DerivedValue;
  /** The cost of one new active seller, as known: shown, never compared or paid back (D4). */
  sellerCac: Known;
}
export function mktUnitEconomics(state: EngineState, ctx: EngineCalcContext): MktUnitEconomics;
```

Formules, exactement celles du libre-service avec **a** à la place de l'ARPA :
- `monthlyMargin = mul(a, scale(margin, 1/100))` ;
- `ltv = mul(monthlyMargin, lifetimeMonths(buyerChurn))` (la fonction
  existante, plafond de 36 mois) ;
- `payback = mapBounds(div(cac, monthlyMargin), v => Math.max(0, v))` ;
- `ltvCac = div(ltv, cac)` ;
- confiance `solid` seulement si toutes les entrées de la forme du calculé le
  sont ; incalculable : `missing` = les entrées inconnues (même fonction
  `missingOf` que le libre-service, rendue générique si besoin).

L'argent d'A20 (`MoneyKpis`) se calcule avec les fonctions de `money.ts`,
inchangées : `arr = arrOf(R)` (le revenu net annualisé), `loss =
lossCheck(ltv, cac)`, `afterPayback = afterPayback(lifetime, payback)`,
`spend = acquisitionSpend(N, cac)`, `cash = cashTiedUp(spend, payback,
false)` (pas d'expansion : c'est un plancher), `warning =
paybackWarning(payback, loss, paybackLimit(setup.runwayMonths))`.

#### 22.5.5 La projection (`mkt-scenario.ts`, nouveau)

```ts
/**
 * Net revenue month by month (§22.1 D3, D6): 13 points, [0] = today's R.
 * From month 1 the money levers apply to every buyer (`start` = R × fA);
 * each month the base is kept at q = 1 − buyer churn and the new buyers'
 * revenue (N' × a') comes on top. Each bound from the bounds that push it
 * the same way, like `mrrPath`.
 */
export function mktPath(R0: Interval | null, start: Interval | null, newRevenue: Interval | null, q: Interval | null): Interval[] | null;
```

```text
lo : [R0.lo, puis 12 fois : t ← t × q.lo + newRevenue.lo, en partant de t = start.lo]
hi : la même chose avec .hi
q = { lo: 1 − churn.hi / 100, hi: 1 − churn.lo / 100 }
```

Aujourd'hui (aucun levier) : `start = R0`, `newRevenue = N × a` ; c'est alors
exactement `mrrPath(R0, N × a, 100 × q)`. Un test le vérifie.

#### 22.5.6 Le diagnostic, le prix d'une fuite, la chaîne affichée

**Les règles** (`diagnose.ts`) :

```ts
const MKT_RULES: MotionRules<MktCandidateId> = {
  motion: "mkt",
  candidates: MKT_CANDIDATE_IDS,
  price: mktRankingImpact,
  isFlow: (id) => ["mkt.buy.signup-rate", "mkt.buy.first-order", "mkt.liq.fill-rate", "mkt.buy.referred-share"].includes(id),
  retention: "mkt.buy.churn",
  blindWatch: [...MKT_METRIC_SHAPES.filter((s) => s.primary).map((s) => s.id), "mkt.buy.churn", "mkt.liq.fill-rate"],
};
export function diagnose(state: EngineState, ctx: EngineCalcContext, motion: "mkt"): MktDiagnosis; // overload
```

`diagnoseWith` ne change pas : la règle qui nomme une étape reste une seule
fonction (§18.5.2).

**Le prix** (`mkt-impact.ts`, nouveau), la copie de `impact.ts#rankingImpact`
avec ces substitutions :

| Libre-service | Place de marché |
|---|---|
| `rev.arpa` | **a** = `mktRevenuePerBuyer` |
| `newPayersPerMonth` | **N** = `mktNewBuyersPerMonth` |
| `payingBase` (dénominateur du churn logo) | `mktActiveBuyersStart` |
| `ret.logo-churn` | `mkt.buy.churn` |

```ts
export function mktRankingImpact(state: EngineState, candidate: MktCandidateId, target: number, ctx: EngineCalcContext): { gap?: Interval; mrr?: Interval } {
  // unpriced (repeat, seller first sale, seller churn) or unknown → {}
  // mkt.buy.churn: kept = floor0(base × (r − target) / 100) ; mrr = kept × a
  // flows: gap = referral ? referralGain(r, target) : floor0({ lo: target / r.hi − 1, hi: target / r.lo − 1 }) ; mrr = N × gap × a
}
```

Le champ s'appelle `mrr` (le type de `MotionRules` l'impose) ; il vaut ici du
**revenu net nouveau par mois** (flux) ou **préservé par mois** (churn). La
copie dit « revenu net ».

**La chaîne affichée** : `mktWhatIf(state, candidate, target, ctx, words):
Impact | null`, la copie de `impact.ts#whatIf` avec les mêmes substitutions,
les mêmes lignes (`today`, `if`, `then`, `times`, `annual`, `less-than-one`)
et le même facteur annuel (`twelveMonthFactor(churn des acheteurs)`). Les
gabarits de ses lignes sont sous `mkt.whatIf.*` (§22.8). `deck.ts#buildLeak`
et l'écran du levier appellent `whatIf`, `slgWhatIf` ou `mktWhatIf` selon
`diagnosis.motion`.

**Ce qui n'est jamais chiffré** (D4, et la deuxième commande) : `mkt.buy.repeat`,
`mkt.sell.first-sale`, `mkt.sell.churn`. Sous leur cible, ils sont nommés
(seuls, ou dans `belowUnpriced`), avec le titre `leakClearUnpriced` existant.

#### 22.5.7 « Et si » (`mkt-scenario.ts`)

```ts
export type MktScenarioAssumption =
  | "signup-same-visitors"        // existing words
  | "referral-on-top"             // existing words
  | "fill-new-buyers-only"        // D5
  | "new-buyer-spends-average"
  | "money-levers-all-buyers"     // D6
  | "same-spend"                  // existing words
  | "active-twelve-months"        // D3
  | "supply-not-priced"           // D4
  | "twelve-months";              // existing words
export interface MktScenarioFunnel {
  perHundred: boolean;
  visitors: Interval | null;
  signups: Interval | null;
  referred: Interval | null;
  /** New buyers in the month (first order). */
  newBuyers: Interval | null;
}
export interface MktScenarioKpis extends MoneyKpis {
  /** R, the month's net revenue (the MRR's place). */
  mrr: Interval | null;
  /** N' × a': the new buyers' net revenue in a month. */
  newMrr: Interval | null;
  /** R in twelve months: mktPath's last point. */
  mrr12: Interval | null;
  revenuePerBuyer: Interval | null;
  gmv: Interval | null;
  cac: Interval | null;
  ltv: Interval | null;
  payback: Interval | null;
}
export interface MktScenario {
  levers: LeverView[];
  moved: MktLeverId[];
  today: { funnel: MktScenarioFunnel; kpis: MktScenarioKpis };
  projected: { funnel: MktScenarioFunnel; kpis: MktScenarioKpis };
  assumptions: MktScenarioAssumption[];
}
export function buildMktScenario(state: EngineState, targets: Partial<Record<LeverId, number>>, ctx: EngineCalcContext): MktScenario;
export function mktLeverAlone(state: EngineState, id: MktLeverId, ctx: EngineCalcContext): MktScenario | null;
```

**Les leviers** (`leverViews(state, targets, ctx, MKT_LEVER_IDS)`, la
fonction existante) :
- domaines : la règle d'aujourd'hui (taux de la moitié au triple, plafonnés à
  100 ; churn de 0 au double ; argent de la moitié au double) ;
  `mkt.rev.aov` rejoint `MONEY_LEVERS` ; `mkt.buy.churn` rejoint
  `LOWER_IS_BETTER` ; `mkt.rev.frequency` est un levier `unit: "ratio"`, de la
  moitié au triple d'aujourd'hui, pas de 0,01 ;
- un levier dont la valeur d'aujourd'hui est inconnue n'a pas de curseur.

**Les facteurs** (chacun par `correlatedRatio(today, () => target)`, la
fonction existante, quand le levier a une cible ; 1 sinon) :
- `fSignup = t / s` ; `fRefSignups = (1 − rf) / (1 − t)` (cible plafonnée à
  99, et prix seulement jusqu'à 50, `REFERRAL_PRICING_CEILING`) ;
- `fFirst = t / f1` ; `fFill = t / fill` ;
- `fN = fSignup × fRefSignups × fFirst × fFill` ;
- `fA = fFreq × fAov × fTake`, chacun `t / aujourd'hui` ;
- churn projeté = la cible du churn, sinon celui d'aujourd'hui.

**Les KPI projetés** :
- `N' = N × fN` ; `a' = a × fA` ; `newMrr = N' × a'` ;
- `path = mktPath(R0, R0 × fA, N' × a', q')` ; `mrr12 = path[12]` ;
  `arr12 = mrr12 × 12` ; `mrr` reste R0 dans les deux colonnes ;
- `cac = cac × (1 / fN)` (« à dépense égale », hypothèse `same-spend`) ;
- `monthlyMargin = a' × marge` ; `ltv`, `payback`, `ltvCac`, `lifetime`,
  `afterPayback`, `loss`, `warning` comme §22.5.4 avec a', le churn projeté et
  le CAC projeté ;
- `spend` et `cash` : la dépense **d'aujourd'hui** (N × CAC) dans les deux
  colonnes, comme le libre-service ;
- `gmv` : aujourd'hui seulement (`null` en projeté).

**Le funnel du mois** : `signups' = signups × fSignup × fRefSignups` ;
`visitors' = signups × 100 / s × fRefSignups` ; `referred' = signups' × rf'
/ 100` ; `newBuyers' = N'`. Sans les inscrits du mois, le funnel se lit sur
100 (`perHundred: true`), et l'argent ne s'en sert jamais.

**Les hypothèses imprimées**, seulement celles qui ont servi, dans l'ordre du
type : `signup-same-visitors` si l'inscription bouge ; `referral-on-top` si la
part recommandée bouge ; `fill-new-buyers-only` si le taux de service bouge ;
`new-buyer-spends-average` toujours quand `newMrr` est calculable ;
`money-levers-all-buyers` si la fréquence, le panier ou la commission bouge ;
`same-spend` si `fN ≠ 1` ; `active-twelve-months` toujours ;
`supply-not-priced` toujours ; `twelve-months` toujours.

**L'effet composé** : comme le libre-service (`deck.ts#buildWhatIfSlides`),
le gain de chaque levier seul (`mktLeverAlone`), leur somme, et l'écart avec
l'ensemble. Le gain d'un levier est `mrr12(projeté) − mrr12(aujourd'hui)`.

#### 22.5.8 Les contrôles de cohérence (`sanity.ts`, `marketplaceChecks`)

« À vérifier », jamais bloquants (sauf `num-gt-den`, générique) :

| Id | Déclencheur | Chiffres |
|---|---|---|
| `mkt-repeat-gt-first` | deuxième commande `lo` > première commande `hi` | `mkt.buy.repeat`, `mkt.buy.first-order` |
| `churn-high` (existant, `motion: "mkt"`) | churn des acheteurs ou des vendeurs `lo` > `CHURN_HIGH_PERCENT` (30) | le churn concerné |
| `margin-odd` (existant) | marge hors de `MARGIN_ODD` | `mkt.rev.gross-margin` |
| `mkt-take-high` | commission `lo` > `TAKE_RATE_HIGH_PERCENT` (50) : souvent un GMV compté sans les frais, ou un revenu compté brut | `mkt.rev.take-rate` |
| `cohort-mismatch` (existant) | les deux colonnes du funnel n'ont pas la même cohorte | les deux |
| `reconcile-gap` (existant) | (inscrits acheteurs du mois × première commande / 100) ÷ dénominateur du CAC acheteur hors de `RECONCILE_BAND` | `mkt.buy.signup-rate`, `mkt.buy.first-order`, `mkt.buy.cac` |
| `two-tools` (existant) | comme partout | — |

#### 22.5.9 Les constats (`findings.ts`, `marketplaceFindings`)

La copie de `selfServeFindings`, sur la motion `"mkt"` :
- `chain-break` : une colonne du funnel nulle dont le chiffre est `missing` ;
- `no-definition`, `conflict` : comme partout ;
- `below-comparator` : pour chaque étape nommée ;
- `unit-econ-uncomputable` : `["mkt.rev.cac-payback", ...missing]` ;
- `unit-econ-loss` et `unit-econ-loss-maybe` : `lossFinding` sur la LTV
  acheteur et `mkt.buy.cac`, chiffres `["mkt.rev.ltv", "mkt.buy.cac"]` ;
- `reconcile-gap` (depuis le contrôle) ; `small-cohort` (cohorte des
  acheteurs ou des vendeurs sous 100).
Chaque constat porte `motion: "mkt"`. Les rangs ne changent pas.

#### 22.5.10 La série, le pont, la dérivation

- **`series.ts`** : `SHAPES` gagne `mkt: MKT_METRIC_SHAPES` ; `CANDIDATES`
  gagne `MKT_CANDIDATE_IDS` ; `namedLeak` lit `diagnose(state, ctx, "mkt")`.
  La slide « Ce qui a bougé » d'une place de marché est `evolution`, avec
  `motion: "mkt"` (un moteur n'a qu'une motion : pas de collision d'id).
- **`bridge.ts`** : `MKT_ENGINE_BRIDGES`, une ligne par question, `motion:
  "mkt"` ; `engine-props.ts` sert ces ponts après les deux autres listes.
- **`derive.ts`** : après le bloc de l'assisté,

```ts
  if (activeMotions(state.setup).includes("mkt")) {
    motions.push({
      motion: "mkt",
      coverage: motionCoverage(snapshot, "mkt"),
      funnel: buildMktFunnel(state, ctx),
      diagnosis: diagnose(state, ctx, "mkt"),
      unit: mktUnitEconomics(state, ctx),
    });
  }
```

  et les deux tests `ticked.plg` / `ticked.slg` lisent `activeMotions`. Les
  champs du haut (`peloton`, `diagnosis`, `unit`) restent ceux d'un
  libre-service vide pour une place de marché, comme pour un assisté seul.
  `total` reste `null`. Aucune clé neuve dans `EngineDerived` : le golden v2
  (qui fige l'objet entier) ne bouge pas.

---

### 22.6 Les écrans

#### 22.6.1 La carte de départ, le réglage, les cibles, les Réglages (M3)

- **`EngineStart`** : `StartChoice` gagne `"mkt"`, présent si `"marketplace"`
  est ouvert, après `app`. Libellé `start.mkt` « Place de marché » /
  "Marketplace" ; note `start.mktNote` « Une commission sur chaque commande. »
  / "A commission on every order." ; défauts `start.defaultsMkt` « Réglé pour
  une place de marché, en euros. Mois des chiffres : {month} ; inscrits
  suivis : {cohort}. » / "Set for a marketplace, in euros, on {month}'s
  figures and {cohort}'s sign-ups." ; le plan compte 14 chiffres (3, 5, 6).
  `typeOf("mkt") = "marketplace"`, `motionsOf("mkt") = { plg: false, slg:
  false }`.
- **`Setup`** : type `marketplace` choisi → le champ des motions est remplacé
  par `setup.mktSides` « Une place de marché a deux côtés : les acheteurs et
  les vendeurs. » / "A marketplace has two sides: buyers and sellers.", puis
  les trois fenêtres :
  - `setup.firstOrderWindow` « Première commande sous » / "First order within" (7, 30, 90 jours ; 30 par défaut) ;
  - `setup.repeatWindow` « Deuxième commande sous » / "Second order within" (60, 90, 180 jours ; 90) ;
  - `setup.firstSaleWindow` « Première vente sous » / "First sale within" (30, 60, 90 jours ; 60).
  Le nom : `setup.companyLabelMkt` « Nom de ta place de marché » / "Your
  marketplace's name". Les outils : `setupToolsFor("marketplace")`.
- **`_engine/start.ts#startDefaults`** : pour `mkt`, le réglage de §22.3, et
  la cohorte par `defaultCohortMonth` (§22.2.3).
- **`TargetsStart`** : les huit candidats de la motion `"mkt"`, sans titre de
  groupe (un seul moteur). Rien de neuf : la boucle lit
  `activeMotions(setup)` au lieu de `["plg","slg"].filter(…)`.
- **Les Réglages** (`EngineWorkbench.tsx`, écran `settings`) :
  - `existing` (lignes 597-604) apprend les chiffres de la place de marché ;
  - `withSettings` (lignes 896-914) : changer une fenêtre renvoie « à faire »
    le chiffre qu'elle définit (`firstOrderWindowDays` →
    `mkt.buy.first-order`, `repeatWindowDays` → `mkt.buy.repeat`,
    `firstSaleWindowDays` → `mkt.sell.first-sale`), comme les quatre autres ;
  - `settingsNumbers` lit `candidatesOf("mkt")` et `shapesOf(setup)` ;
  - le type est grisé (§21.4.2).

#### 22.6.2 Le tableau (M4)

`Board.tsx` gagne `mktBody`, choisi quand `activeMotions(setup)` vaut
`["mkt"]`, dans le même ordre que `plgBody` : `Diagnosis`, `BoardMoney`
(motion `"mkt"`), le « Et si » (`BoardLever` puis `MktWhatIfPanel` plié),
`MktFunnelView`, l'encadré « petite cohorte ». Pas de sélecteur « Moteur
affiché », pas de `TotalBand`. Le verdict (`verdictOf`, lignes 921-927) :
pour la motion `"mkt"`, le titre `mktFunnelTitle` (le titre de la slide du
funnel, §22.7).

- **`MktFunnelView`** (`_engine/MktFunnelView.tsx`) assemble :
  - **`MktPeloton`** : la grille du peloton à deux colonnes (« Première
    commande à J{n} », « Deuxième commande à J{n} »), sur les mêmes 100
    inscrits, avec la ligne amont (« ~{n} visiteurs pour 100 inscrits ») et les
    points des recommandés. **Méthode imposée** : extraire de `Peloton.tsx` sa
    partie présentationnelle en `PelotonGrid` (props : colonnes `{ key, label,
    perHundred, confidence, sourceLabel, periodLabel }[]`, ligne amont,
    recommandés, texte « mêmes 100 ») ; `Peloton` (libre-service) et
    `MktPeloton` l'utilisent. **Critère** : le rendu de `Peloton` pour
    l'exemple SaaS et l'exemple hybride est identique avant et après
    (`renderToStaticMarkup` comparé dans un test, FR et EN).
  - **`SupplyBand`** (`src/components/engine/SupplyBand.tsx`, présentationnel,
    props seulement, sur le modèle des 21 autres) : un titre `mkt.supply.title`
    « L'offre et la liquidité » / "Supply and liquidity", puis trois lignes
    `<dl>` :
    - « Première vente » : `{n} sur 100 vendeurs inscrits vendent sous {d} jours` ;
    - « Churn des vendeurs » : `{c} par mois` ;
    - « Taux de service » : `{fill} des demandes aboutissent` (avec la
      variante entre parenthèses).
    Une valeur inconnue s'écrit « ? » avec le statut (`status.*`), jamais 0.
    Le marqueur « Freine ici » s'y pose si le diagnostic nomme l'une des
    trois. Jetons existants seulement ; contraste AA et 44 px vérifiés par
    `engine-screens.spec.ts`.
- **`BoardMoney` / `money-view.ts`** : la branche `"mkt"` lit
  `buildMktScenario(state, {}, ctx).today.kpis` et les entrées de la forme
  des calculés. Les libellés viennent de `mkt.money.*` : « Revenu net du
  mois » / "Net revenue this month", « Revenu net annualisé » / "Annualised
  net revenue" (le « ? » de l'ARR devient `terms.netRunRate` : « Le revenu net
  du mois × 12 : une extrapolation, pas un revenu acquis. » / "This month's
  net revenue × 12: an extrapolation, not guaranteed revenue." ;
  `_engine/EngineTerm.tsx` gagne l'id `netRunRate`), « Volume
  d'affaires du mois (GMV) » / "Gross volume this month (GMV)", « Revenu net
  par acheteur actif » / "Net revenue per active buyer". Le reste du bloc
  (LTV, CAC, payback, trésorerie, alerte, constat de perte) garde ses
  composants, avec « un acheteur » à la place d'« un client » dans les
  phrases (`mkt.money.*`).
- **`BoardLever` et `MktWhatIfPanel`** : la carte du levier suit la règle du
  libre-service (`cardLever`) sur `MKT_LEVER_IDS` ; le panneau
  (`_engine/MktWhatIfPanel.tsx`) est la copie de `WhatIfPanel.tsx` branchée sur
  `buildMktScenario`, `mktLeverAlone` et les lignes de `mkt.scenario.*` : le
  funnel du mois (visiteurs, inscrits, recommandés, nouveaux acheteurs) et les
  chiffres de croissance (revenu net dans 12 mois, revenu net annualisé dans
  12 mois, revenu net nouveau par mois, CAC, LTV, payback, LTV:CAC), puis les
  hypothèses de §22.5.7. `whatif-figures.ts` gagne la branche `"mkt"`.
- **La liste des chiffres** (`NumberList`, `number-list.ts`) : la même liste
  par étape (C41), avec une étiquette de côté par ligne, `mkt.side.buy`
  « Acheteurs » / "Buyers", `mkt.side.sell` « Vendeurs » / "Sellers",
  `mkt.side.match` « Liquidité » / "Liquidity" (la prop facultative `tag` de
  `NumberRow`, nouvelle, présentationnelle).
- **L'écran d'un chiffre** (`MetricSheet`) : `marginSheet` vaut aussi pour
  `mkt.rev.gross-margin` (sans le repli « marge globale », réservé au SaaS) ;
  l'indice de période lit la cohorte pour les chiffres `flow: "cohort"` de la
  motion `"mkt"` ; `sample` reste réservé à l'assisté.
- **La barre du moteur** : `workbench.modelShort.marketplace` « Place de
  marché » ; mois : le mois des flux.
- **L'import** (`ImportPanel.tsx:207-216`) : une ligne de comptage pour la
  motion `"mkt"`.
- **`next-step.ts`, `AskScreen`, `collect.ts`, `csv.ts`** : génériques sur les
  formes ; ils reçoivent `shapesOf(setup)` et n'ont rien d'autre à apprendre.

#### 22.6.3 L'exemple (M6)

`exampleEngine(words, motions, type)` (§21.9.1) accepte `"marketplace"` et
construit le jeu de §22.10. `ExampleView` choisit son rendu par motion : pour
`"mkt"`, `Verdict`, `Coverage`, `Diagnosis`, `MktFunnelView`. Copie :
`example.bannerTitleMkt` « Exemple : une place de marché fictive » / "Example:
a fictional marketplace", `example.companyMkt` « Exemple de place de marché »
/ "Example marketplace", et `example.bannerBodyMkt` qui nomme les cibles de
l'équipe fictive (sur le modèle de `bannerBody`).

---

### 22.7 Le deck (M5)

`deck.ts#buildDeck` : en tête, `if (activeMotions(state.setup)[0] === "mkt")
return buildMarketplaceDeck(state, derived, strings, metrics, ctx, prose);`
(avant le test de l'assisté). `buildMarketplaceDeck` vit dans
`src/lib/engine/deck-mkt.ts` et suit `buildDeck` du libre-service :

**Ordre** : `mkt:funnel`, `leak`, `whatif:<levier>` (ordre de
`MKT_LEVER_IDS`), `scenario` (dès deux leviers), `evolution` (dès deux mois,
décochée), `visibility`, `unit-economics`, `mirror`, `ask`, `annex`,
`annex:2`… Moins de deux ★ connus : `visibility` en tête et pas de `leak`.
Perte certaine : `unit-economics` monte en deuxième (`moveToSecond`). Chaque
slide porte `motion: "mkt"`. `DEFAULT_INCLUDE["mkt:funnel"] = true`.

**Les composants** (`deck/DeckView.tsx#slideComponent`) : `mkt:funnel` →
`SlideMktFunnel` (nouveau : les deux colonnes et les trois lignes de l'offre,
en texte et en barres, sur le modèle de `SlidePeloton`) ; `leak`, `whatif:*`,
`scenario`, `evolution`, `visibility`, `mirror`, `ask`, `annex` → les
composants existants ; `unit-economics` → `SlideUnitEconomics` avec les
lignes de la place de marché (`PaybackChart` d'un acheteur, sans repère de 12
mois, comme l'app : §21.8).

**Les titres** (`slideTitles`, nouvelles clés ; ajouter chacune au
`TITLE_CONTRACT` d'`engine-copy.test.ts`) :

| Clé | FR | EN |
|---|---|---|
| `mktFunnelComplete` | Sur 100 inscrits côté acheteurs, {first} et **{repeat}**. | Out of 100 buyer sign-ups, {first} and **{repeat}**. |
| `mktFunnelGap` / `mktFunnelGapOne` | Sur 100 inscrits côté acheteurs, {clauses}. **Ensuite, on ne voit rien : {stages} ne sont pas mesurées.** (One : « n'est pas mesurée ») | Out of 100 buyer sign-ups, {clauses}. **After that, we see nothing: {stages} aren't measured.** (One: "isn't measured") |
| `mktFunnelEmpty` | **On ne sait pas encore suivre 100 inscrits jusqu'à leur première commande.** | **We can't yet follow 100 sign-ups to their first order.** |
| `mktLeakClearNew` | Ramener {stage} à {target} vaudrait **{amount} de revenu net nouveau** chaque mois. | Bringing {stage} to {target} would be worth **{amount} of new net revenue** every month. |
| `mktLeakClearRetained` | Ramener {stage} à {target} vaudrait **{amount} de revenu net préservé** chaque mois. | Bringing {stage} to {target} would be worth **{amount} of retained net revenue** every month. |
| `mktLeakClearBuyers` / `…One` | Ramener {stage} à {target} ajouterait **{n} nouveaux acheteurs** par mois. (One : « **{n} nouvel acheteur** ») | Bringing {stage} to {target} would add **{n} new buyers** a month. (One: "**{n} new buyer**") |
| `mktLeakClearKept` / `…One` | Ramener {stage} à {target} garderait **{n} acheteurs actifs** de plus par mois. (One : « **{n} acheteur actif** ») | Bringing {stage} to {target} would keep **{n} more active buyers** a month. (One: "**{n} more active buyer**") |
| `mktWhatIfLever` | Si {lever} passait à {target} (aujourd'hui : {today}), le revenu net mensuel dans 12 mois gagnerait **{gain}**. | If {lever} went to {target} (today: {today}), monthly net revenue in 12 months would gain **{gain}**. |
| `mktWhatIfLeverPlain` | Et si {lever} passait à {target} (aujourd'hui : {today}) ? | What if {lever} went to {target} (today: {today})? |
| `mktScenario` / `mktScenarioPlain` | Avec ces {n} changements, le revenu net mensuel dans 12 mois gagnerait **{gain}**. / Et si ces {n} changements se faisaient ensemble ? | With these {n} changes, monthly net revenue in 12 months would gain **{gain}**. / What if these {n} changes happened together? |
| `mktUnitEconomics` | Un acheteur rembourse son coût d'acquisition en **{m}**, et rapporte {x} ce qu'il a coûté. | A buyer pays back their acquisition cost in **{m}**, and brings in {x} what they cost. |
| `mktUnitEconomicsUnknown` | On ne sait pas encore ce que rapporte un acheteur : **il manque {missing}**. | We don't know yet what a buyer brings in: **{missing} is missing**. |
| `mktUnitEconomicsLoss` | Chaque nouvel acheteur coûte plus qu'il ne rapporte : **il manque {short}** par acheteur. | Each new buyer costs more than they bring in: **{short} short** per buyer. |

Les titres `leakClearUnpriced`, `leakShared`, `leakNotEnoughBelow`,
`leakLevel`, `visibility*`, `mirror`, `ask*`, `annex`, `evolution*` servent
tels quels (ils ne nomment que des étapes et des chiffres). **Avant d'écrire
les gabarits du tableau ci-dessus, relire les gabarits existants qu'ils
imitent** (`leakClearMrrNew`, `whatIfLever`, `scenario`, `unitEconomics`,
`unitEconomicsUnknown`, `unitEconomicsLoss`) et reprendre leur forme exacte
(placeholders, accent, ponctuation) : les phrases ci-dessus en donnent le
sens, la forme des gabarits existants fait foi. `title-accent.ts` : les
`mktFunnelGap*` et `mktFunnelEmpty` sont rouges, comme les `pelotonGap*` ; les
autres sont à l'encre (C53).

**Les notes d'orateur** (`notes.*`) : une note par slide neuve, sur le modèle
des existantes ; pour `mkt:funnel`, elle dit « les deux colonnes sont comptées
sur les mêmes 100 inscrits ; l'offre se lit à côté, jamais contre la demande ».

**L'export texte** (`deckMarkdown`) : générique.

---

### 22.8 La copie

- **Un espace de noms `mkt`** dans `ENGINE_COPY`, pour tout ce qu'un écran ou
  une slide de la place de marché dit avec ses propres mots : `mkt.side`,
  `mkt.supply`, `mkt.funnel` (les libellés de colonnes, la ligne amont, « mêmes
  100 », les phrases des clauses du titre : « {n} passent une première
  commande », « {n} en passent une deuxième »), `mkt.money`, `mkt.whatIf`
  (les gabarits des lignes de la chaîne, sur le modèle de `whatIf`),
  `mkt.scenario` (les libellés du panneau et les neuf hypothèses), `mkt.unit`.
  Les hypothèses, en clair :
  - `fill-new-buyers-only` : « Un meilleur taux de service ne compte que pour les nouveaux acheteurs : l'effet sur les acheteurs déjà là n'est pas compté, c'est un minimum. » / "A better fill rate only counts for new buyers: the effect on existing buyers isn't counted, so this is a minimum."
  - `new-buyer-spends-average` : « Un nouvel acheteur dépense comme l'acheteur actif moyen. » / "A new buyer spends like the average active buyer."
  - `money-levers-all-buyers` : « Une fréquence, un panier ou une commission qui changent jouent sur tous les acheteurs, dès le mois suivant. » / "A change in frequency, order value or take rate applies to every buyer, from the next month."
  - `active-twelve-months` : « Un acheteur est actif s'il a commandé dans les 12 derniers mois ; ses départs sont le churn des acheteurs. » / "A buyer is active if they ordered in the last 12 months; their departures are the buyer churn."
  - `supply-not-priced` : « L'offre n'est pas chiffrée : plus de vendeurs n'ajoutent des commandes qu'à travers le taux de service. » / "Supply isn't priced: more sellers only add orders through the fill rate."
  - les quatre autres reprennent les mots du libre-service, avec « acheteurs » et « revenu net ».
- **Les records indexés par id** (`subject`, `unitInput`, `event` le cas
  échéant, `settings.sharedCount`…) gagnent leurs entrées : le compilateur les
  liste (`satisfies Record<MetricId, …>`, `Record<SharedCount, …>`).
- **Un calque `ENGINE_COPY_MARKETPLACE`** (`src/content/engine-copy-marketplace.ts`,
  le mécanisme de §21.6.1) pour les feuilles **génériques** qu'un écran de la
  place de marché affiche et qui disent « client », « MRR », « SaaS » ou
  « abonné » ; il est petit, et c'est la garde de §22.12.3 qui le remplit.
- **Ce qui ne bouge pas** : la page publique (C63 vaut aussi ici : pas de
  section, FAQ à six questions), le catalogue statique de la page.

---

### 22.9 L'analytique (M3)

- `ENGINE_SETUP_DETAILS` += `"mkt"` ; `engineSetupDetail` renvoie `"mkt"` pour
  une place de marché.
- `engine_stage_saved/<stage>` : `ENGINE_MARKET_STAGES` = les cinq étapes
  préfixées `mkt-` (comme `ENGINE_SALES_STAGES` avec `slg-`) ;
  `engineStageDetail(stage, motion)` les produit pour la motion `"mkt"`.
- `/admin/stats` affiche les nouvelles lignes ; `engine-boundary.test.ts`
  vérifie qu'elles sont émises.

---

### 22.10 L'exemple chiffré

#### 22.10.1 Les entrées

Une place de marché fictive de mobilier d'occasion, EUR, mois des flux
`2026-08`, **cohorte suivie `2026-05`** (mûre pour la fenêtre de 90 jours au 24
septembre 2026), fenêtres par défaut (30, 90, 60), `type: "marketplace"`,
`motions: { plg: false, slg: false }`.

| Id | Statut · source | Valeur saisie |
|---|---|---|
| `mkt.buy.signup-rate` | measured · ga4 | 3 000 inscrits acheteurs ÷ 60 000 visiteurs (août) |
| `mkt.buy.cac` | measured · finance, média seul | 18 000 € ÷ 600 nouveaux acheteurs (août) |
| `mkt.sell.cac` | **requested** · finance | — |
| `mkt.buy.first-order` | measured · product-db | 580 ÷ 2 900 inscrits (mai) |
| `mkt.sell.first-sale` | measured · product-db | 126 ÷ 420 vendeurs inscrits (mai) |
| `mkt.liq.fill-rate` | measured · amplitude, variante `searches` | 2 340 ÷ 26 000 (août) |
| `mkt.buy.repeat` | measured · product-db | 145 ÷ 2 900 |
| `mkt.buy.churn` | measured · product-db | 560 ÷ 14 000 acheteurs actifs au 1er août |
| `mkt.sell.churn` | measured · product-db | 96 ÷ 3 200 vendeurs actifs au 1er août |
| `mkt.buy.referred-share` | measured · product-db | 232 ÷ 2 900 |
| `mkt.rev.take-rate` | measured · stripe | 32 853,60 € ÷ 273 780 € |
| `mkt.rev.aov` | measured · product-db | 273 780 € ÷ 4 212 commandes |
| `mkt.rev.frequency` | measured · product-db | 4 212 commandes ÷ 14 040 acheteurs actifs à fin août |
| `mkt.rev.gross-margin` | **estimated** · ancien chiffre | 55 à 65 % |

`base` : `mktCohortSignups 2 900`, `mktOrders 4 212`, `mktGmv 273 780`,
`mktNetRevenue 32 853,6`. **Cibles de l'équipe fictive**
(`EXAMPLE_MKT_TARGETS`) : première commande 25 %, taux de service 12 %,
première vente 40 %. « Aujourd'hui » : le 24 septembre 2026.

#### 22.10.2 Ce que le moteur doit en sortir (modèle de référence, §22.11)

| Grandeur | Valeur |
|---|---|
| Couverture | 14 chiffres : 12 trouvés, 1 approximatif (la marge), 0 introuvable, 1 en cours (demandé) |
| Funnel des acheteurs | 2 000 visiteurs pour 100 inscrits ; 8 recommandés ; première commande 20, deuxième commande 5 ; chaîne `complete` |
| Offre et liquidité | première vente 30 sur 100 vendeurs ; churn des vendeurs 3 % ; taux de service 9 % (recherches) |
| a, revenu net par acheteur actif et par mois | 2,34 € (0,3 × 65 € × 12 %) |
| Revenu net du mois (R) / annualisé | 32 853,60 € / 394 243,20 € |
| GMV du mois / annualisé | 273 780 € / 3 285 360 € |
| Nouveaux acheteurs du mois (N) / revenu net nouveau | 600 / 1 404 € |
| Diagnostic | `clear`, nommé : `mkt.liq.fill-rate`, base `mrr` ; prix : taux de service 468 €/mois (600 × (12/9 – 1) × 2,34), première commande 351 €/mois (600 × 0,25 × 2,34) ; 468 > 351 × 1,25 = 438,75 ; `belowUnpriced` : `mkt.sell.first-sale` (30 % sous 40 %) |
| Constats | rang 2, `below-comparator`, `mkt.liq.fill-rate` |
| Contrôles de cohérence | aucun |
| Marge par acheteur et par mois | 1,287 à 1,521 € |
| Durée de vie | 25 mois (100 ÷ 4) |
| LTV acheteur | 32,18 à 38,03 € (approximative) |
| CAC payback | 19,72 à 23,31 mois |
| LTV:CAC | 1,07 à 1,27 |
| Mois de marge après le remboursement | 1,69 à 5,28 |
| Constat de perte | aucun (`none`) |
| Alerte de payback long | aucune (sous le plancher de 30 mois) |
| Dépense d'un mois d'acquisition | 18 000 € |
| Trésorerie immobilisée | 177 515 à 209 790 €, un plancher |
| Revenu net dans 12 mois (au rythme actuel) | 33 723,61 € (annualisé : 404 683,31 €) |
| Courbe (13 points, arrondis) | 32 854 · 32 943 · 33 030 · 33 113 · 33 192 · 33 268 · 33 342 · 33 412 · 33 479 · 33 544 · 33 607 · 33 666 · 33 724 |
| Chaîne de la fuite (taux de service à 12 %) | 600 nouveaux acheteurs par mois ; à 12 %, 800 (600 × 12/9) : +200 ; × 2,34 € = 468 € de revenu net nouveau par mois ; sur un an, × 9,6823 (`twelveMonthFactor(4)`) = 4 531,30 € |
| « Et si » taux de service 12 %, première commande 25 %, commission 13 % | N' = 1 000 ; a' = 2,535 € ; revenu net nouveau 2 535 € ; revenu net dans 12 mois 46 351,72 € (annualisé 556 220,61 €) ; gain 12 628,11 € ; CAC 18 € à dépense égale ; LTV 34,86 à 41,19 € ; payback 10,92 à 12,91 mois ; LTV:CAC 1,94 à 2,29 |
| Chaque levier seul (gain du revenu net dans 12 mois) | taux de service 4 531,30 € ; première commande 3 398,47 € ; commission 2 810,30 € ; somme 10 740,07 € ; effet composé +1 888,04 € |
| Courbe de l'« Et si » (arrondie) | 32 854 · 36 703 · 37 770 · 38 794 · 39 777 · 40 721 · 41 627 · 42 497 · 43 332 · 44 134 · 44 904 · 45 642 · 46 352 |

Le gain du taux de service seul (4 531,30 €) est égal à la dernière ligne de
sa chaîne : c'est voulu (le même N, le même a, le même churn), et un test le
garde.

---

### 22.11 Le modèle de référence (normatif)

Ce code a produit §22.10.2. Il n'est pas à recopier dans `src/` (le code de
production réutilise `interval.ts`, `money.ts` et `lifetimeMonths`) : il sert
d'oracle aux tests de M2, qui doivent retrouver ses nombres.

```js
const I = (lo, hi = lo) => ({ lo, hi });
const mul = (a, b) => { const p = [a.lo*b.lo, a.lo*b.hi, a.hi*b.lo, a.hi*b.hi]; return I(Math.min(...p), Math.max(...p)); };
const div = (a, b) => (b.lo <= 0 && b.hi >= 0) ? null : mul(a, I(1/b.hi, 1/b.lo));
const scale = (a, k) => k >= 0 ? I(a.lo*k, a.hi*k) : I(a.hi*k, a.lo*k);
const sub = (a, b) => I(a.lo - b.hi, a.hi - b.lo);
const lifetime = (churn) => { const m = c => c <= 0 ? 36 : Math.min(100/c, 36); return I(m(churn.hi), m(churn.lo)); };
const twelve = (start, newR, q) => { const p = []; let t = start; for (let k = 0; k < 12; k++) { t = t*q + newR; p.push(t); } return p; };
const mktPath = (R0, start, newR, q) => { const lo = [R0.lo, ...twelve(start.lo, newR.lo, q.lo)]; const hi = [R0.hi, ...twelve(start.hi, newR.hi, q.hi)]; return lo.map((v, i) => I(v, hi[i])); };
const tmf = c => { c = c/100; return c <= 0 ? 12 : (1 - Math.pow(1-c, 12))/c; };

// Inputs of §22.10.1
const s = I(5), f1 = I(20), churn = I(4), cac = I(30), freq = I(0.3), aov = I(65), take = I(12), fill = I(9), margin = I(55, 65);
const R0 = I(32853.6), N = I(600);
const a = mul(mul(freq, aov), scale(take, 1/100));                 // 2.34
const q = I(1 - churn.hi/100, 1 - churn.lo/100);                    // 0.96
const m = mul(a, scale(margin, 1/100));                             // 1.287..1.521
const L = lifetime(churn);                                          // 25
const ltv = mul(m, L), payback = div(cac, m), ltvCac = div(ltv, cac);
const loss = ltv.hi < cac.lo ? "loss" : ltv.lo >= cac.hi ? "none" : "maybe";
const today = mktPath(R0, R0, mul(N, a), q);                        // [12] = 33 723.61
const tied = scale(mul(mul(N, cac), payback), 1/2);                 // 177 515..209 790
// Ranking (flows): mrr = N × (t/r − 1) × a
const fillPrice = mul(mul(N, I(12/9 - 1)), a);                      // 468
const firstPrice = mul(mul(N, I(25/20 - 1)), a);                    // 351
// What-if: fill 12, first order 25, take 13
const fN = (12/9) * (25/20), fA = 13/12;
const whatif = mktPath(R0, scale(R0, fA), mul(scale(N, fN), scale(a, fA)), q);   // [12] = 46 351.72
const cacW = scale(cac, 1/fN);                                      // 18
const alone = (fNa, fAa) => mktPath(R0, scale(R0, fAa), mul(scale(N, fNa), scale(a, fAa)), q)[12].lo - today[12].lo;
// alone(12/9, 1) = 4 531.30 = 200 × 2.34 × tmf(4) ; alone(25/20, 1) = 3 398.47 ; alone(1, 13/12) = 2 810.30
```

---

### 22.12 Plan de tests

#### 22.12.1 Unitaires (Vitest, `src/lib/engine/__tests__/`)

| Fichier | Ce qu'il tient |
|---|---|
| `catalog-shape.test.ts` (M1) | 14 chiffres, 8 candidats, 8 leviers, 4 ponts ; un ★ par étape ; les efforts 3/5/6 ; aucun repère ; `shapesOf` d'une place de marché ; `motionOfMetric("mkt.…") === "mkt"` |
| `business-type.test.ts` (M0) | `activeMotions` des trois types ; `motionsAllowed` ; `mktWindows` et ses défauts |
| `validate.test.ts`, `io.test.ts` (M0) | une place de marché valide ; avec une case cochée, refusée ; une fenêtre hors liste, refusée ; un SaaS et une app inchangés |
| `mkt-economics.test.ts` (M2) | a, R, GMV, N et leurs replis (§22.5.2) ; l'économie d'un acheteur ; l'argent de §22.10.2 au centime |
| `mkt-funnel.test.ts` (M2) | le funnel et l'offre de §22.10.2 ; les quatre chaînes ; la petite cohorte (acheteurs, puis vendeurs) |
| `mkt-scenario.test.ts` (M2) | `mktPath` égal à `mrrPath` sans levier ; la courbe et les KPI de l'« Et si » de §22.10.2 ; chaque levier seul ; l'effet composé ; « dépense égale » ; les hypothèses imprimées selon les leviers bougés ; un levier inconnu sans curseur |
| `mkt-impact.test.ts` (M2) | les prix du classement ; la chaîne du taux de service (600, 800, +200, 468, 4 531,30) ; le gain seul égal à la chaîne ; les trois candidats jamais chiffrés |
| `diagnose-mkt.test.ts` (M2) | le diagnostic de l'exemple ; `level`, `not-enough`, `shared` (deux flux à moins de 25 % d'écart) ; seuls des candidats non chiffrés sous leur cible → nommés, base `none` ; le churn des vendeurs « plus bas = mieux » |
| `sanity.test.ts`, `findings.test.ts` (M2) | les contrôles de §22.5.8 et les constats de §22.5.9, chacun déclenché et non déclenché |
| `series.test.ts` (M2) | deux mois d'une place de marché : les écarts, la fuite du mois d'avant |
| `motions-independence.test.ts` (M2) | étendu : sur mille états tirés au hasard, changer un chiffre de la place de marché ne change rien au libre-service ni à l'assisté d'un état SaaS, et inversement |
| `golden-mkt.test.ts` (M6) | le golden de la place de marché : l'exemple, l'exemple sans cibles, l'exemple avec les trois « Et si », un moteur vide ; `derived`, `deck`, `markdown`, `scenario`, FR et EN ; écrit une fois avec `ENGINE_GOLDEN_MKT_WRITE=1`, après avoir vérifié à la main les nombres de §22.10.2 |

`golden-v1`, `golden-v2` et `golden-consumer` restent verts **sans toucher à
`golden-projection.ts`** : c'est le critère de chaque PR M0 à M8.

#### 22.12.2 Contenu (`src/content/__tests__/`)

- `engine-catalog.test.ts` couvre les quatorze et les trois sans changement
  (les records les contiennent) ; il vérifie en plus qu'aucun n'a de
  `benchmarkCaveat`.
- `engine-copy.test.ts` : `TITLE_CONTRACT` gagne les clés de §22.7 ; un test
  « jamais offre contre demande » sur toutes les feuilles `mkt.*` et les
  titres `mkt*` : aucun `vs`, « contre l'offre », « plutôt que », « plus que
  la demande », « offre ou demande » (même forme que le test de l'hybride,
  `engine-copy.test.ts:377-425`).

#### 22.12.3 La garde des mots (M7)

Le calque de la place de marché se remplit par une garde, pas par une liste
écrite d'avance :
- **unitaire** : `deckMarkdown` de l'exemple de la place de marché, en
  français et en anglais, ne contient aucun de ces mots : `MRR`, `client`,
  `customer`, `SaaS`, `abonn`, `subscri`, `inscrit payant` ; exceptions
  nommées une par une, commentées ;
- **e2e** : le texte visible (`innerText` de `main`) du tableau, de chacun des
  quatorze écrans de chiffre, du panneau « Et si », des Réglages et de
  l'exemple ne contient aucun de ces mots, en français et en anglais.
Chaque feuille que la garde attrape s'écrit dans `ENGINE_COPY_MARKETPLACE`.

#### 22.12.4 E2E (`e2e/engine-marketplace.spec.ts`, M7)

Sur le modèle d'`engine-hybrid-journey.spec.ts`, en français à 1 280 px et en
anglais à 390 px :
1. choisir « Place de marché » sur la carte de départ, commencer, poser les
   trois cibles de l'exemple sur l'écran « Cibles » ;
2. remplir les quatorze chiffres de §22.10.1 par l'interface (« Enregistre et
   continue »), et retrouver : « Freine ici » sur le taux de service ; le
   revenu net du mois ; la LTV, le CAC et le payback ; l'offre et la liquidité
   dans `SupplyBand` ;
3. bouger trois leviers dans « Et si » et retrouver le gain du revenu net dans
   12 mois (arrondi à deux chiffres significatifs, comme le moteur l'imprime) ;
4. ouvrir les slides : l'ordre de §22.7, le titre du funnel, la slide « Et
   si » avec sa courbe ;
5. changer la fenêtre de la deuxième commande dans les Réglages : le chiffre
   repasse « à faire » ;
6. exporter le fichier, effacer, réimporter : tout revient ;
7. build sans `marketplace` dans `ENGINE_TYPES` : l'option est absente de la
   carte de départ et grisée dans la carte complète.
Et : `engine-screens.spec.ts` (le tableau, l'écran d'un chiffre, `SupplyBand`
et le panneau, passés à axe, de 320 à 1 280 px), `engine-canary.spec.ts` (un
parcours de place de marché, rien ne sort), `engine-deck.spec.ts` (le deck de
l'exemple).

#### 22.12.5 Non-vacuité à mesurer à la livraison

| Sabotage | Ce qui doit rougir |
|---|---|
| Le taux de service appliqué aussi à **a** (D5 trahie) | le gain seul égal à la chaîne ; la courbe de l'« Et si » |
| Les leviers d'argent appliqués aux seuls nouveaux acheteurs (D6 trahie) | la courbe de l'« Et si » (son point 1) |
| `mkt.sell.first-sale` retiré de `UNPRICED_CANDIDATES` | « l'offre n'est jamais chiffrée » |
| `directionOf` qui oublie `mkt.sell.churn` | « le churn des vendeurs, plus bas = mieux » |
| La cohorte par défaut à 30 jours | « la cohorte de mai » |
| Un mot « MRR » laissé dans le panneau | la garde e2e de §22.12.3 |
| Un gabarit qui dit « offre contre demande » | le test des mots de §22.12.2 |

---

### 22.13 Découpage en PR

Chaque PR part de `main`, se merge verte en suivant `/livrer` (lu, pas
appelé), garde le type fermé en production tant qu'`ENGINE_TYPES` ne le
liste pas, porte sa copie « à relire » et son entrée de `JOURNAL.md`.

| PR | Contenu | Dépend de | Critère d'acceptation | Jours-agent |
|---|---|---|---|---|
| **M0 — Contrat** | `types.ts` (§22.2.1) ; `business-type.ts` (§22.2.2) ; `shapesOf(setup)` et tous ses appelants ; `activeMotions` à la place des `MOTIONS.filter(…)` ; `validate.ts`, `io.ts` ; `cohort.ts` (fenêtres, cohorte par défaut) ; les `Record<Motion, …>` que `tsc` signale | §21 livré | `tsc` propre ; goldens v1, v2, app verts sans projection ; les tests de M0 | 2 |
| **M1 — Catalogue** | `MKT_METRIC_SHAPES`, `MKT_DERIVED_SHAPES`, les listes, les règles partagées ; la prose des quatorze et des trois ; `shared-counts.ts` ; `engine-props.ts` (ponts) | M0 | `catalog-shape.test.ts`, `engine-catalog.test.ts` ; le poids de la page mesuré | 2,5 |
| **M2 — Modèle pur** | `mkt-economics.ts`, `mkt-funnel.ts`, `mkt-impact.ts`, `mkt-scenario.ts` ; `diagnose.ts` (`MKT_RULES`, `directionOf`) ; `sanity.ts`, `findings.ts`, `series.ts`, `bridge.ts`, `coverage`, `derive.ts` ; `example.ts` (le jeu, sans écran) et `fixtures.ts` (`marketplaceState()`) | M1 | les tests de §22.12.1 (sauf le golden) ; chaque nombre de §22.10.2 retrouvé ; la non-vacuité des trois premiers sabotages | 5 |
| **M3 — Départ et réglage** | `EngineStart` (`mkt`), `start.ts`, `Setup` (les trois fenêtres), `TargetsStart`, les Réglages, `withSettings`, l'analytique (§22.9) | M2 | specs unitaires de la carte ; captures FR 1 280 et EN 390 relues | 1,5 |
| **M4 — Tableau** | `mktBody` ; `PelotonGrid`, `MktPeloton`, `SupplyBand`, `MktFunnelView` ; `money-view.ts`, `BoardMoney`, `BoardLever`, `MktWhatIfPanel`, `whatif-figures.ts` ; `NumberRow.tag` ; `MetricSheet` ; la barre ; l'import | M3 | le rendu de `Peloton` inchangé (`renderToStaticMarkup`) ; les écrans passés à axe ; **captures relues par Antoine** (D9) | 3,5 |
| **M5 — Deck** | `deck-mkt.ts`, `SlideMktFunnel`, les titres de §22.7 et le contrat, les notes, `DEFAULT_INCLUDE`, `title-accent.ts` | M4 | l'ordre et les titres de l'exemple ; le texte exporté ; `engine-deck.spec.ts` étendu | 3 |
| **M6 — Exemple et golden** | `ExampleView` (motion `mkt`), la copie de l'exemple, `golden-mkt` | M5 | le golden écrit après vérification à la main | 1,5 |
| **M7 — Intégration** | la garde des mots et le calque `ENGINE_COPY_MARKETPLACE` ; `engine-marketplace.spec.ts` ; `engine-screens`, `engine-canary`, `engine-deck` ; `ENGINE.md`, `CHANTIERS.md` (A23) ; la non-vacuité de §22.12.5 au journal | M6 | la suite e2e verte en CI | 2 |
| **M8 — Glossaire** (C72) | trois termes, « GMV », « take rate », « liquidité » (slugs `gmv`, `take-rate`, `marketplace-liquidity`), sur le modèle d'A7.3.e ; les liens `glossary` des chiffres de la place de marché y passent | M1 (peut partir en parallèle de M2) | `glossary.test.ts` (500 mots, liens, `inTheTour`) ; le sitemap | 2 |

Total ≈ **23 jours-agent** ; chemin critique M0 → M7 ≈ 21 (M8 en
parallèle). Vient ensuite **A23.b**, le bon à tirer de la copie neuve, puis
l'ouverture (`ENGINE_TYPES=consumer-app,marketplace` dans Vercel, puis
redéployer), puis la re-synchro avec Claude Design qui emporte `SupplyBand`,
`MktPeloton` et `PelotonGrid` (geste d'Antoine, `/design-sync`).

---

### 22.14 Ce que l'exécutant ne tranche jamais, et quand il s'arrête

Il s'arrête et pose la question à Antoine, sans contournement, quand :
- un nombre de §22.10.2 ne sort pas de son code (après avoir vérifié les
  entrées) : il ne corrige ni le test ni ce document pour le faire tomber
  juste ;
- un golden v1, v2 ou de l'app rougit ;
- `tsc` signale un `Record<Motion, …>` dont la valeur pour `"mkt"` n'est pas
  évidente (il la laisse en erreur et demande, plutôt que de mettre `null`) ;
- l'extraction de `PelotonGrid` change d'un caractère le rendu du peloton
  du libre-service ;
- une phrase de §22.4.2 ou §22.7 ne passe pas un test de copie (longueur,
  glyphe, placeholder) sans changer de sens ;
- le poids de la page dépasse +60 ko gzip après M1.

Il ne change jamais : une formule de §22.5, une décision de §22.1, un id de
§22.2, le SaaS ou l'app, la règle « seule une cible nomme une étape », le
rouge réservé à la fuite.

---

### 22.15 Questions pour Antoine (C64 à C74)

*Posées le 2026-10-04. Le document applique chaque recommandation.*

| # | Question | Recommandation | Si on renverse | Réponse d'Antoine |
|---|---|---|---|---|
| C64 | **Le périmètre** : le revenu net, ce sont les commissions et frais prélevés sur les commandes ; les abonnements des vendeurs, les annonces payantes et la publicité sont hors v1 ? | **Oui.** C'est ce que fait la majorité des places de marché transactionnelles, et c'est le seul revenu que le funnel explique | Un chiffre « autres revenus » ajouté au revenu net, sans levier : §22.4, §22.5.2, §22.10 | **2026-10-04 : non, contre la reco — les abonnements des vendeurs sont modélisés.** Un second flux récurrent côté offre (vendeurs payants, prix moyen, churn), additionné au revenu net des commissions. Les annonces payantes et la publicité restent hors v1. Le modèle exact est une question de suivi ; §22.0, §22.4, §22.5 et §22.10 se réécrivent ensuite |
| C65 | **Un vocabulaire** : acheteurs, vendeurs, commandes ; les places de marché de services l'écrivent dans leur note de définition ? | **Oui** (D8) | Un réglage « produits ou services » et une seconde copie : ~2 jours-agent de plus, et un bon à tirer plus gros | **2026-10-04 : non, contre la reco — un réglage « produits ou services ».** Deux jeux de mots : acheteurs, vendeurs, commandes, annonces pour les produits ; clients, prestataires, réservations, offres pour les services. La copie de la place de marché existe deux fois, par le même mécanisme de calque que §21.6, et le bon à tirer relit les deux. §22.1 D8, §22.4.2, §22.6 à §22.8 se réécrivent |
| C66 | **L'argent** : revenu net = GMV × commission ; acheteurs actifs sur 12 mois ; leur churn mensuel ; la projection du MRR appliquée au revenu net ? | **Oui** (D3) | Une rétention du GMV par cohorte : plus juste, introuvable dans la plupart des outils ; §22.5 réécrit | **2026-10-04 : oui, la reco.** GMV × commission, acheteurs actifs sur 12 mois, la boucle du MRR ; les abonnements des vendeurs (C64) s'y ajoutent en second flux |
| C67 | **L'offre n'est jamais chiffrée en euros**, seulement nommée par une cible ? | **Oui** (D4) | Une élasticité commandes/vendeurs saisie par l'équipe : un chiffre de plus, invérifiable | **2026-10-04 : oui, la reco revue avec C64.** Les étapes de l'offre ne sont jamais chiffrées par les commissions (aucune élasticité vendeurs-commandes). Elles le sont par les abonnements des vendeurs quand le chiffre les touche directement (garder un vendeur payant, convertir un vendeur de plus) ; sinon, nommées sans montant |
| C68 | **Le taux de service** chiffré sur les seuls nouveaux acheteurs, avec une hypothèse « c'est un minimum » ? | **Oui** (D5) | Appliqué à toutes les commandes : il gagnerait presque toujours le classement ; §22.5.6, §22.5.7, §22.10 | **2026-10-04 : oui, la reco.** Les seuls nouveaux acheteurs, avec l'hypothèse « c'est un minimum » |
| C69 | **La commission, le panier et la fréquence** jouent sur tous les acheteurs dès le mois suivant ? | **Oui** (D6) | Sur les nouveaux seulement, comme l'ARPA du libre-service : une hausse de commission paraîtrait dix fois plus petite qu'elle n'est | **2026-10-04 : oui, la reco.** Commission, panier et fréquence jouent sur tous les acheteurs dès le mois suivant |
| C70 | **Une seule fuite** pour les deux côtés, jamais « offre contre demande » ? | **Oui** (D7) | Deux diagnostics, un par côté, comme l'hybride : deux fuites à l'écran, et la question « laquelle d'abord ? » laissée au lecteur | **2026-10-04 : non, contre la reco — deux diagnostics, un par côté**, comme l'hybride du SaaS : la demande (acheteurs, taux de service, commissions) et l'offre (vendeurs, abonnements des vendeurs, C64) ont chacune leur fuite, leur prochaine étape et leurs slides, avec un sélecteur « côté affiché » et un total. La règle de l'hybride vaut : les deux fuites ne se comparent jamais et ne se classent jamais entre elles. §22.1 D1 et D7, §22.5.6, §22.6 et §22.7 se réécrivent |
| C71 | **Pas de brief à Claude Design** : deux composants neufs composés avec l'existant, captures relues à M4 ? | **Oui** (D9) ; un brief reste possible après M4 | Un brief 10 avant M4 : un aller-retour de plus, et M4 attend son retour | **2026-10-04 : non, contre la reco — un brief 10 à Claude Design avant les écrans.** Le modèle pur et le réglage avancent sans lui ; le tableau, le funnel des vendeurs, le bloc liquidité et les slides attendent son retour, puis se portent. Le brief est écrit par la session, déposé, puis lancé par Antoine (comme les briefs 07 et 09). §22.1 D9, §22.6, §22.7 et le découpage se réécrivent |
| C72 | **Trois termes de glossaire** (GMV, take rate, liquidité) dans une PR à part, M8 ? | **Oui**, en parallèle de M2 : ils donnent aux chiffres un lien juste et trois pages de plus aux deux langues | Sans termes : les liens restent sur les termes voisins (`activation`, `revenue`) | **2026-10-04 : oui, la reco.** Les trois termes (GMV, take rate, liquidité) dans une PR à part, en parallèle du modèle pur |
| C73 | **Aucun repère publié** pour la place de marché ? | **Oui** (D10) : aucun n'est dans le glossaire approuvé | Des repères sourcés, ajoutés d'abord au glossaire (M8), puis aux formes, toujours sans désigner (C1) | **2026-10-04 : oui, la reco.** Aucun repère en v1 |
| C74 | **L'ordre** : l'app grand public (§21) d'abord, la place de marché ensuite ? | **Oui** : §21 est plus petit, plus demandé, et crée le drapeau et les calques dont §22 se sert | La place de marché d'abord : M0 crée ces pièces (le chapeau de ce document le dit) | **2026-10-04 : oui, la reco.** L'app d'abord ; le brief 10 de la place de marché (C71) peut partir pendant que l'app se code |
| C93 | **Le modèle des abonnements des vendeurs** (question de suivi de C64, posée le 2026-10-04). Un flux récurrent côté offre, projeté par la boucle du MRR : il garde (1 – churn des vendeurs abonnés) et les nouveaux abonnés (vendeurs inscrits du mois × conversion en abonné) ajoutent le leur. Quatre chiffres de plus côté offre : le taux d'inscription des vendeurs, la conversion en abonné (cohorte, fenêtre de la première vente), le revenu mensuel par vendeur abonné, le churn mensuel des vendeurs abonnés. Les unit economics de l'offre (coût d'un vendeur contre ce que rapporte un vendeur abonné). Le total = commissions + abonnements vendeurs, comme l'hybride | **Oui**, avec une seule marge pour les deux flux | Une marge par flux (un chiffre de plus) ; ou sans taux d'inscription des vendeurs | **2026-10-04 : la proposition, avec une marge par flux.** Cinq chiffres de plus côté offre : les quatre proposés et la marge des abonnements vendeurs (`mkt.rev.gross-margin` reste celle des commissions). §22 se réécrit sur ce modèle |

---

### Annexe — Les définitions sourcées (2026-10-04)

- **GMV** : le volume total des ventes qui passent par la place de marché sur
  une période, ce que dépense le côté acheteur. **Take rate** : la part du GMV
  que la place de marché garde ; elle va du bas d'un chiffre au milieu des
  trente pour cent selon la fragmentation, les substituts et ce que la
  plateforme apporte à la transaction. Sources :
  [Lenny's Newsletter, The most important marketplace metrics](https://lennysnewsletter.com/p/the-most-important-marketplace-metrics),
  [a16z, 13 metrics for marketplace companies](https://a16z.com/13-metrics-for-marketplace-companies/).
- **Taux de service (fill rate, match rate)** : la part des sessions avec une
  intention qui aboutissent à une conversion, « la mesure ultime de la santé
  d'une place de marché » ; sa définition dépend de chaque place de marché.
  Sources : Lenny's Newsletter (ci-dessus), [a16z, The marketplace glossary](https://a16z.com/the-marketplace-glossary/).
- **Liquidité** : la probabilité qu'une demande trouve une offre dans un délai
  raisonnable. Source : [Causo, Marketplace liquidity](https://hub.causo.ai/guides/marketplace-liquidity-seed).
- **Taux de réachat** : la part des clients qui achètent plus d'une fois.
  Source : [Stripe, 14 key marketplace metrics](https://stripe.com/ie/resources/more/14-key-marketplace-metrics).
- **Stripe Connect** : le produit de Stripe pour les plateformes et places de
  marché (paiements pour des comptes connectés, frais de la plateforme).
