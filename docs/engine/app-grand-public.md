# ENGINE.md, partie 5 — l'app grand public (§21)

*Réécrit le 2026-10-04 sur les réponses d'Antoine (C56 à C63 et C92, §21.13),
contre le code de `main` (`d91ab24`) et les modèles purs livrés le même jour
(A22.b, #329). Le premier jet du même jour, écrit sur les recommandations,
est dans l'historique git ; il ne fait plus foi.*

*C'est une **spécification d'exécution**, écrite pour un orchestrateur qui
lance un sous-agent par unité (§21.11), selon le guide commun
[`executer-un-type.md`](executer-un-type.md) (§23). Un sous-agent lit la
section 21.0, la section 21.1, puis **la fiche de son unité** et ce qu'elle
cite : rien d'autre. Chaque décision est prise ici ; chaque nom de fichier, de
type et de fonction est donné ; chaque chiffre de l'exemple sort des modèles
purs ou d'un script de référence (§21.9). Toute la copie neuve est écrite ici
en français et en anglais, ou produite par le lexique de §21.8.3, et porte
`TODO: à relire` dans le code (convention 6).*

*Vérifié pour ce document, en plus du premier jet : `types.ts`,
`catalog-shape.ts`, `shared-counts.ts`, `scenario.ts`, `impact.ts`,
`diagnose.ts`, `unit-economics.ts`, `money.ts`, `total.ts`, `derive.ts`,
`coverage.ts`, `peloton.ts`, `findings.ts`, `sanity.ts`, `validate.ts`,
`io.ts`, `merge.ts`, `deck.ts`, `deck-unit.ts`, `lib/viz/payback-chart.ts`,
`_engine/money-view.ts`, `_engine/scenario-view.ts`,
`_engine/whatif-figures.ts`, `_engine/Board.tsx`, `_engine/BoardLever.tsx`,
`_engine/Setup.tsx`, `_engine/start.ts`, `content/engine-copy.ts` (les blocs
`money`, `scenario`, `lever`, `whatIf`, `slide`, `slideTitles`, `faq`) et les
tests de garde qui énumèrent les chiffres (§21.10.1). Les numéros de ligne
cités sont ceux de `d91ab24` : **les relire avant d'écrire** (convention 10).*

---

## 21. L'app grand public — spécification A22

### 21.0 En une page

**Ce que c'est.** Le réglage ouvre un deuxième **type**, « App grand public »
(`"consumer-app"`). Une app se vend en libre-service : elle garde la motion
`"plg"` et **tout le moteur du libre-service** pour son flux d'abonnements, et
y ajoute **une couche « app »** :

- **Trois façons de gagner de l'argent, cochées au réglage** (C56, C92) : les
  abonnements, les achats intégrés, la publicité. Au moins une.
- **Deux flux de revenu** (C92). Les abonnements sont le MRR du libre-service,
  inchangé. Les achats et la pub se gagnent sur **les actifs du mois** : actifs
  × ce qu'un actif rapporte. Les actifs sont gardés chaque mois à leur
  rétention mensuelle, et les installations encore là à J30 les rejoignent. Le
  revenu du mois est la somme des flux cochés.
- **La commission des stores est un chiffre à part** (C59), prise sur ce que
  les stores encaissent (abonnements et achats), jamais sur la pub. La marge
  brute se saisit « après commission ».
- **L'économie se lit par installation** (C92) : ce qu'une installation coûte
  (le coût par installation, qui remplace le CAC) contre ce qu'elle rapporte,
  mois par mois, en 12 mois (le ratio) et en 36 mois (la perte, comme la LTV
  du SaaS). Son remboursement se lit sur une **courbe**, pas une droite.
- **Les mots et les sources** : « 100 installations », les visiteurs de la
  fiche du store, des abonnés ; App Store Connect, Google Play Console,
  RevenueCat, AppsFlyer, Adjust (C57).
- **Un seul repère** situe, la rétention à J30 de 20 à 30 % ; les repères SaaS
  sont retirés (C60). Aucun ne désigne une étape (C1).
- **Une phrase sur la page publique**, dans une réponse de la FAQ, une fois le
  type ouvert au build (C63).

**Les chiffres d'une app** : les dix-sept du libre-service, moins le CAC et la
marge brute (remplacés), moins les cinq de l'abonnement si les abonnements ne
sont pas cochés ; plus six chiffres `app.*` selon ce qui est coché. **21 au
plus** (les trois façons cochées), 18 pour les abonnements seuls, 14 pour la
pub seule (§21.4.1). Les actifs du mois se saisissent comme un **nombre
partagé**, le dénominateur des deux chiffres « par actif ».

**Ce qui ne change pas.**
- **Le SaaS B2B ne bouge pas d'un caractère** : écrans, slides, export texte,
  événements, goldens v1 et v2 verts **sans toucher à `golden-projection.ts`**.
  C'est le critère de chaque unité.
- Aucune migration : un moteur « app » est un fichier v3 avec `setup.type:
  "consumer-app"` et `setup.monetization`.
- Tout reste local, bilingue, déterministe ; seule une cible d'équipe nomme
  une étape (C1) ; jamais de rouge sur une projection (S-5) ni sur une perte
  (C48).

**Ce que le type ne fait pas en v1** : l'attribution des installations
payantes canal par canal, le web-to-app, une rétention par cohorte (J1, J7,
J90), la saisonnalité, la trésorerie immobilisée (D11). Un iOS et un Android
séparés se font en deux moteurs (C58).

**L'ouverture** : `ENGINE_TYPES=consumer-app` au build (C62), indépendante
d'`ENGINE_ENABLED`. Le moteur SaaS ouvre d'abord ; l'app ne l'attend pas et
ne le retarde pas.

**L'effort** : douze unités (§21.11), ~19 jours-agent (C92 en annonçait ~16),
puis le bon à tirer d'Antoine. Chaque unité est une PR, mergée seule ; on peut s'arrêter
après n'importe laquelle, rien de visible ne sort tant que le type est fermé.

---

### 21.1 Les décisions de conception (décision · raison · alternative rejetée)

**D1 — Un type sur la motion du libre-service, avec une couche « app ».**
`BusinessType` gagne `"consumer-app"` ; `Motion` ne bouge pas ; un moteur app a
toujours `motions: { plg: true, slg: false }`. Ce qui est propre à l'app vit
dans **un seul module de calcul**, `src/lib/engine/app.ts`, qui importe les
modèles purs (`app-model.ts`, `stream.ts`) et le moteur du libre-service.
*Raison* : le flux d'abonnements d'une app est exactement le MRR du
libre-service, et l'assisté n'y a pas de sens. *Rejeté* : une troisième
motion `"app"`, qui dédoublerait quinze ids, le diagnostic et le deck pour des
formules identiques sur le flux d'abonnements.

**D2 — Quinze ids gardés, six ids `app.*`.** Les quinze chiffres du
libre-service qu'une app garde gardent leur id (`acq.signup-rate` est le taux
d'installation). **Deux ne s'affichent jamais pour une app**, remplacés par un
id à elle, parce que leur définition change et que des comptes partagés en
dépendent : `acq.cac` (coût d'un nouveau payant ; son dénominateur nourrit le
nombre de payants du libre-service) devient `app.acq.cpi` (coût par
installation) ; `rev.gross-margin` (marge sur le MRR, qui partage `mrrEnd`)
devient `app.rev.gross-margin` (marge sur tout le revenu après commission).
Quatre ids de plus : `app.ret.active-retention`,
`app.rev.purchases-per-active`, `app.rev.ads-per-active`,
`app.rev.commission`. *Raison* : un id qui change de sens selon le type
casserait les comptes partagés et les calculs du libre-service qui le lisent.
*Rejeté* : redéfinir `acq.cac` pour l'app et brancher le type dans
`impact.ts`, `scenario.ts`, `sanity.ts` et `unit-economics.ts`.

**D3 — Les chiffres affichés se calculent depuis le réglage : `shapesOf(setup)`.**
La fonction prend le réglage (`type`, `motions`, `monetization`) au lieu des
motions. Pour le SaaS, elle rend exactement la liste d'aujourd'hui. Tous ses
appelants passent le réglage (le compilateur les liste). *Raison* : c'est le
seul endroit où la liste des chiffres se décide, et la place de marché (§22)
en aura besoin aussi. *Rejeté* : un `if (type)` dans chaque écran.

**D4 — Une seule couture pour les calculs : `scenarioOf`, `leverAloneOf`,
`leverIdsOf`** (`src/lib/engine/scenario-of.ts`). Ce sont les points d'entrée
des « Et si », de l'argent et des slides ; pour le SaaS ils rendent
`buildScenario`, `leverAlone` et `LEVER_IDS`, pour une app `buildAppScenario`,
`appLeverAlone` et `appLeverIds(setup)`. Le diagnostic choisit ses règles par
type dans `diagnose.ts` ; `derive.ts` choisit l'économie unitaire. **Un test
statique** (§21.10.1) liste les seuls fichiers autorisés à lire `setup.type`.
*Raison* : l'écran ne sait pas quel modèle tourne, il lit un `Scenario`.
*Rejeté* : des composants qui testent le type.

**D5 — Le scénario d'une app a la forme de celui du libre-service.**
`buildAppScenario` rend un `Scenario` (le type de `scenario.ts`), dont les
champs prennent le sens de l'app (§21.5.3) : `mrr` est le revenu du mois des
flux cochés, `mrrPath` sa courbe, `newMrr` le nouveau revenu du mois, `cac` le
coût par installation, `ltv` la valeur d'une installation sur 36 mois,
`ltvCac` sa valeur sur 12 mois ÷ son coût, `payback` son remboursement. Un
sous-objet facultatif `app` porte ce qui n'a pas d'équivalent (les deux
courbes, la valeur sur 12 mois, la courbe de remboursement). *Raison* : le
bloc de l'argent, la carte du levier, le panneau « Et si », les slides « Et
si » et la courbe lisent ces champs ; ils servent tels quels, avec les mots de
l'app (§21.8). *Rejeté* : un type de scénario à part et des écrans copiés.
*Garde* : le sous-objet `app` n'est **jamais** posé pour le SaaS (une clé
absente ne change pas les goldens).

**D6 — Les variantes et les raisons « sans objet » gardent leurs ids ; seul
leur libellé change** (premier jet, inchangé). `app.acq.cpi` reprend les
variantes de `acq.cac` (`media-only`, `plus-team`, `fully-loaded`).

**D7 — Le type se choisit à la création et ne change plus** (C61). Les
Réglages l'affichent grisé, avec « Pour changer de type, crée un nouveau
moteur. ». **Ce que l'app gagne, lui, se change dans les Réglages**, comme les
motions du SaaS : décocher une façon de gagner de l'argent masque ses chiffres
sans les effacer, et une phrase le dit avant l'enregistrement.

**D8 — Le drapeau des types est une liste lue au build** (C62, premier jet
inchangé) : `ENGINE_TYPES="consumer-app"`, passé par les props de la page
(`openTypes`), jamais inliné dans le client ; pas de `next.config.mjs`.

**D9 — Les flux qui mènent à J30 nourrissent aussi les actifs.** Pour le
diagnostic et les « Et si », les nouveaux actifs du mois sont les
installations du mois × J30 ; l'installation, la part recommandée,
l'activation et J30 les font varier **dans la même proportion** que les
nouveaux abonnés (les actifs sont pris parmi les activés, comme les payants,
`impact.ts`). La conversion en abonné et le churn des abonnés ne touchent pas
les actifs. *Raison* : la même hypothèse que le libre-service, sur la même
population ; elle s'écrit en une phrase. *Rejeté* : une élasticité de l'usage
à l'activation, invérifiable.

**D10 — La perte d'une installation se lit sur 36 mois ; le ratio sur 12.**
`loss = lossCheck(valeur sur 36 mois, coût par installation)`, comme la LTV
plafonnée du SaaS : « l'installation n'a pas remboursé son coût dans la durée
comptée ». Le ratio affiché est la valeur sur 12 mois ÷ le coût (C92).
*Raison* : une perte sur 12 mois appellerait « perte » une installation qui se
rembourse en 13 mois. *Rejeté* : une perte sur 12 mois. *Antoine peut le
renverser au bon à tirer* : une ligne de `appKpis` (§21.5.3).

**D11 — Pas de trésorerie immobilisée pour une app.** `cash` vaut `null`, et
le bloc de l'argent dit pourquoi (`money.lineApp`). *Raison* : la formule
d'A20 (dépense × payback ÷ 2) suppose qu'un client rembourse en parts égales ;
la marge d'une installation baisse chaque mois. *Rejeté* : la formule
appliquée quand même (un chiffre faux présenté comme un plancher). *Antoine
peut le renverser au bon à tirer.*

**D12 — Une app sans abonnements n'a pas de ★ au Revenue, et son peloton a
deux colonnes.** La colonne « abonnés » disparaît (elle n'est pas « inconnue ») ;
le titre du peloton a sa forme à deux colonnes. *Raison* : un chiffre qui
n'existe pas pour ce modèle n'est pas un trou de mesure. *Rejeté* : la marquer
« sans objet », qui ferait dire au titre « on ne sait pas les suivre ».

**D13 — La commission ne touche que les marges.** Le levier « commission »
ne change aucun revenu ; il change la valeur d'une installation et son
remboursement. Sa slide « Et si » le dit avec son propre titre
(`whatIfLeverMargin`). *Raison* : le revenu se compte avant commission, comme
le MRR de RevenueCat ; la commission est un coût (C59).

**D14 — Les repères** (C60) : `ret.d30` gagne le repère 20 à 30 % du terme
`retention` ; tous les repères SaaS des quinze chiffres et des calculés sont
retirés pour l'app ; les six chiffres `app.*` et les quatre calculés de l'app
n'en ont pas.

**D15 — La phrase de la page publique** (C63) : une phrase ajoutée à la
réponse de la cinquième question de la FAQ (« En quoi est-ce différent du Tour
? »), seulement quand le type est ouvert au build. La sixième réponse
(« Et si on vend avec une équipe commerciale ? ») fait déjà 294 caractères,
et le plafond d'une réponse est 400. Texte en §21.8.4.

**D16 — Pas de slide des deux flux en v1.** Le partage abonnements / achats et
pub s'affiche sur le tableau (une bande, §21.6.4) ; le deck montre le total.
*Raison* : le deck d'un CODIR parle d'abord de la fuite et de l'argent total.
*Antoine peut en demander une au bon à tirer.*

---

### 21.2 Le contrat

Chaque bloc dit l'unité qui l'écrit (§21.11). Rien d'autre ne change dans ces
fichiers.

#### 21.2.1 `src/lib/engine/types.ts`

```ts
// APP-0
import type { AppMonetization } from "./app-model";
/**
 * Decision 3 (C4), then §21 (C56-C63, C92): the TYPE of business. The consumer
 * app sells self-serve: the self-serve engine carries its subscriptions, an
 * app layer its in-app purchases, ads and per-install economics (`app.ts`).
 * The marketplace comes later (shown, disabled).
 */
export type BusinessType = "b2b-saas" | "consumer-app"; // later: | "marketplace"

export interface EngineSetup {
  // … every field of today, unchanged, then:
  /**
   * Consumer app only (C56, C92): what it earns from, at least one ticked.
   * Required when `type` is "consumer-app", absent otherwise (validate.ts).
   */
  monetization?: AppMonetization;
}

// APP-1
/** The consumer app's own numbers (§21.4.1): two that replace self-serve ones (CAC, margin), four of its own. */
export type AppMetricId =
  | "app.acq.cpi"
  | "app.ret.active-retention"
  | "app.rev.purchases-per-active"
  | "app.rev.ads-per-active"
  | "app.rev.commission"
  | "app.rev.gross-margin";
export type MetricId = PlgMetricId | SlgMetricId | LinkMetricId | AppMetricId;

/** The consumer app's computed figures (§21.4.2): per install. */
export type AppDerivedId = "app.rev.install-value" | "app.rev.install-ltv" | "app.rev.install-payback" | "app.rev.value-to-cost";
export type DerivedId = PlgDerivedId | SlgDerivedId | AppDerivedId;

export type SharedCount = /* today's seven */ | "appActives";

/** The three tools a consumer app reads, at the end of the union. */
export type ToolId = /* today's */ | "revenuecat" | "appsflyer" | "adjust";

/**
 * Inputs of the computed figures, phrased in `unitInput` (engine-copy.ts): gains the app's six. Not `ret.d30` nor
 * `rev.paid-conversion`, though the app's figures read them: in the SaaS « il manque » names them without an article
 * today, and must go on doing so (§21.4.5).
 */
export type UnitInputId =
  /* today's ten */
  | "app.acq.cpi" | "app.rev.gross-margin" | "app.rev.commission" | "app.ret.active-retention"
  | "app.rev.purchases-per-active" | "app.rev.ads-per-active";

// APP-4
/** The consumer app's levers (§21.5.3), after the self-serve ones in panel order. */
export type AppLeverId = "app.ret.active-retention" | "app.rev.purchases-per-active" | "app.rev.ads-per-active" | "app.rev.commission";
export type LeverId = PlgLeverId | SlgLeverId | AppLeverId;

// APP-5
/** The consumer app's own candidate (§21.5.4): the actives' monthly retention, priced in money only, like churn. */
export type AppCandidateId = "app.ret.active-retention";
/** A self-serve engine's candidates, whatever its type: the SaaS ranks the first six, an app may add its own. */
export type SelfServeCandidateId = PlgCandidateId | AppCandidateId;
export type CandidateId = PlgCandidateId | SlgCandidateId | AppCandidateId;

export interface Diagnosis<C extends CandidateId = SelfServeCandidateId> {
  // … unchanged, except:
  /**
   * One entry per candidate the motion's rules position. Absent: not a
   * candidate of this engine (an app without subscriptions has no paid
   * conversion). Partial since §21, A22 — readers use `?.`.
   */
  positions: Partial<Record<C, { position: Position; comparator?: Comparator; impact?: Impact }>>;
}

// APP-6
/** What only an app derives (§21.5.5). Absent for every other type: the goldens never see the key. */
export interface AppDerived {
  monetization: AppMonetization;
  /** The value of an install over twelve months — the ratio's numerator (C92). */
  value12: DerivedValue;
  /** The two streams and their total: this month, new a month, in twelve months (the board's band, §21.6.4). */
  streams: {
    now: { subscriptions: DerivedValue | null; usage: DerivedValue | null; total: DerivedValue };
    newPerMonth: { subscriptions: DerivedValue | null; usage: DerivedValue | null; total: DerivedValue };
    in12Months: { subscriptions: DerivedValue | null; usage: DerivedValue | null; total: DerivedValue };
  };
}
export interface EngineDerived {
  // … unchanged, except:
  diagnosis: Diagnosis<SelfServeCandidateId>;   // APP-5
  /** Consumer app only (§21.5.5). */
  app?: AppDerived;                             // APP-6
}
// MotionDerived, plg branch: diagnosis: Diagnosis<SelfServeCandidateId> (APP-5).
```

`null` dans `streams` : le flux n'est pas coché. `DerivedValue` « incalculable »
: il est coché mais il manque un chiffre (`missing` le nomme, comme `total.ts`).

**Ce qui ne change pas** : `Motion`, `ENGINE_SCHEMA_VERSION` (3), `Snapshot`,
`PlgMetricId`, `PlgCandidateId`, `PlgLeverId`, `ScenarioKpis` (le sous-objet
`app` de D5 est déclaré dans `scenario.ts`, §21.5.3).

#### 21.2.2 `src/lib/engine/setup-type.ts` et `business-type.ts` (nouveaux, purs, sans copie)

**Deux modules, pour qu'aucun cycle de valeurs ne naisse** : `catalog-shape.ts`
a besoin de savoir si un réglage est une app, et `business-type.ts` (APP-2)
importe `shapeOf` de `catalog-shape.ts`. Le premier lit donc un module
**feuille**, `setup-type.ts`, qui n'importe que des types ; un test d'APP-0
vérifie que chaque `import` de `setup-type.ts` est un `import type` (avec
`valueImports` et `BY_PATH` de `src/__tests__/helpers/import-graph.ts` :
`valueImports(BY_PATH.get("lib/engine/setup-type.ts")!)` est vide).

**`BUSINESS_TYPES` et `ALWAYS_OPEN_TYPE` vivent aussi dans la feuille**, pas
dans `business-type.ts` : `access.ts` les lit, et `access.ts` est importé par
`proxy.ts` (Edge), `sitemap.ts`, `llms.ts`, `owner-preview.ts` et
`admin/preview/page.tsx`. Lus depuis `business-type.ts`, qui importe
`catalog-shape.ts` dès APP-2, ils tireraient tout le catalogue des formes
(~970 lignes) dans le bundle du proxy. Le test d'APP-0 le garde :
`reachable("lib/engine/access.ts")` (même helper) ne contient ni
`lib/engine/business-type.ts` ni `lib/engine/catalog-shape.ts`.

```ts
// APP-0 — src/lib/engine/setup-type.ts (a leaf: type imports only)
import type { AppMonetization } from "./app-model";
import type { BusinessType, EngineSetup } from "./types";

/** Every type the code knows, in the order the setup lists them. Here, not in business-type.ts: access.ts (read by the Edge proxy) imports it. */
export const BUSINESS_TYPES: readonly BusinessType[] = ["b2b-saas", "consumer-app"];
/** The type every build opens, whatever ENGINE_TYPES says. */
export const ALWAYS_OPEN_TYPE: BusinessType = "b2b-saas";
/** An app starts with subscriptions only (the start card's default, §21.6.1). */
export const DEFAULT_APP_MONETIZATION: AppMonetization = { subscriptions: true, purchases: false, ads: false };
export function isApp(setup: Pick<EngineSetup, "type">): boolean {
  return setup.type === "consumer-app";
}
/**
 * The app's monetization, or null for any other type. A stored app can carry one that is not (a file opens
 * with its errors, io.ts, and is stored as it came): the stored value is returned only when it is an object
 * whose three boxes are booleans with one at least true, and the subscriptions-only default otherwise.
 */
export function monetizationOf(setup: Pick<EngineSetup, "type" | "monetization">): AppMonetization | null {
  if (setup.type !== "consumer-app") return null;
  const stored: unknown = setup.monetization;
  if (typeof stored !== "object" || stored === null || Array.isArray(stored)) return DEFAULT_APP_MONETIZATION;
  const { subscriptions, purchases, ads } = stored as Record<string, unknown>;
  const threeBooleans = typeof subscriptions === "boolean" && typeof purchases === "boolean" && typeof ads === "boolean";
  return threeBooleans && (subscriptions || purchases || ads) ? (stored as AppMonetization) : DEFAULT_APP_MONETIZATION;
}
```

*Corrigé après APP-0 (#341, la relecture sécurité)* : le premier texte
rendait `setup.monetization ?? DEFAULT_APP_MONETIZATION` et affirmait qu'une
app stockée en a toujours une. Un fichier s'ouvre pourtant avec ses erreurs :
une monétisation `"x"` serait arrivée typée `AppMonetization` jusqu'aux
calculs d'APP-1 et d'après. Tout lecteur passe donc par `monetizationOf`,
jamais par `setup.monetization`.

```ts
// APP-0 — src/lib/engine/business-type.ts
import type { BusinessType, Motion } from "./types";
export { ALWAYS_OPEN_TYPE, BUSINESS_TYPES, DEFAULT_APP_MONETIZATION, isApp, monetizationOf } from "./setup-type";

/** What a type may tick (§21.1 D1): the consumer app sells self-serve only. */
export function motionsAllowed(type: BusinessType): readonly Motion[] {
  return type === "consumer-app" ? ["plg"] : ["plg", "slg"];
}

// APP-2 (the display layer, §21.4.3)
export type DisplayFields = Pick<MetricShape, "sources" | "glossary"> & { benchmark?: Benchmark };
export type DerivedDisplayFields = Pick<DerivedShape, "glossary"> & { benchmark?: Benchmark };
export const DISPLAY_OVERRIDES: Readonly<Record<"consumer-app", Partial<Record<PlgMetricId, Partial<DisplayFields>>>>>;
export const DERIVED_DISPLAY_OVERRIDES: Readonly<Record<"consumer-app", Partial<Record<PlgDerivedId, Partial<DerivedDisplayFields>>>>>;
/** The shape as the screens and the deck show it. The same object as `shapeOf(id)` for b2b-saas, and for any app.* id. */
export function displayShapeOf(id: MetricId, type: BusinessType): MetricShape;
export function displayDerivedShapeOf(id: DerivedId, type: BusinessType): DerivedShape;
/** The setup's tool list (§21.6.5): b2b-saas keeps SETUP_TOOLS as today. */
export function setupToolsFor(type: BusinessType): readonly ToolId[];
```

Règle de fusion de `displayShapeOf` : `{ ...shapeOf(id), ...override }`, où un
`benchmark` présent avec la valeur `undefined` **retire** le repère (tester
avec `"benchmark" in override`). Pour `"b2b-saas"` et pour un id `app.*`, la
fonction rend **l'objet de `shapeOf(id)` lui-même** (même référence).
`business-type.ts` n'importe aucune valeur de `content/`
(`engine-boundary.test.ts`, règle 1).

#### 21.2.3 `src/lib/engine/catalog-shape.ts`

```ts
// APP-1
export interface MetricShape<Id extends MetricId = MetricId> {
  // … unchanged, except:
  scope: "plg" | "slg" | "link" | "app";
}
/** §21.4.1. Never part of a SaaS engine; `shapesOf` adds them to an app's. */
export const APP_METRIC_SHAPES: readonly MetricShape<AppMetricId>[];
/** §21.4.2. */
export const APP_DERIVED_SHAPES: readonly DerivedShape<AppDerivedId>[];
export const ALL_METRIC_SHAPES = [...METRIC_SHAPES, ...SLG_METRIC_SHAPES, ...LINK_METRIC_SHAPES, ...APP_METRIC_SHAPES];
export const ALL_DERIVED_SHAPES = [...DERIVED_SHAPES, ...SLG_DERIVED_SHAPES, ...APP_DERIVED_SHAPES];

/** The two self-serve numbers an app never shows (§21.1 D2), and the five of its subscription stream. */
export const APP_REPLACED: readonly PlgMetricId[] = ["acq.cac", "rev.gross-margin"];
export const SUBSCRIPTION_METRICS: readonly PlgMetricId[] = ["ret.logo-churn", "rev.paid-conversion", "rev.arpa", "rev.expansion", "rev.contraction"];

/** What `shapesOf` reads of a setup. */
export type SetupShapes = Pick<EngineSetup, "type" | "motions" | "monetization">;

/**
 * The numbers a setup shows, in catalogue order (§18.2.1, §21.4.1). A SaaS:
 * today's rule, unchanged. An app: the self-serve numbers minus APP_REPLACED,
 * minus SUBSCRIPTION_METRICS when subscriptions are unticked, then the app's
 * numbers its monetization calls for (`appShapeShown`). Throws on a SaaS with
 * no motion, as today.
 */
export function shapesOf(setup: SetupShapes): MetricShape[];
/** shapesOf, the link left out. */
export function motionShapes(setup: SetupShapes): MetricShape[];
/**
 * Which app number a monetization shows: the cost per install and the margin
 * always; the commission with subscriptions or purchases (what the stores
 * bill); the actives' retention with purchases or ads; each per-active
 * revenue with its own stream.
 */
export function appShapeShown(id: AppMetricId, m: AppMonetization): boolean;
/** One motion's numbers of a stage, ★ first — for an app, among shapesOf(setup). `setup` absent: today's behaviour. */
export function metricsOfStageIn(stage: Pillar, motion: Motion, setup?: SetupShapes): MetricShape[];
/** The derived figures a setup shows: a SaaS's as today; an app's: rev.grr and rev.nrr with subscriptions, then APP_DERIVED_SHAPES. */
export function derivedShapesOf(setup: SetupShapes): DerivedShape[];
```

**Les imports, fixés pour qu'aucun cycle de valeurs ne naisse** (aucun outil
ne les détecte : un cycle ne casse qu'à l'exécution) : `catalog-shape.ts`
importe `isApp` et `monetizationOf` de **`setup-type.ts`**, jamais de
`business-type.ts` ; `appShapeShown` lit `m.purchases || m.ads` lui-même et
n'importe **rien** d'`app-model.ts` (qui importe `catalog-shape.ts`) ; un
type de `app-model.ts` (`AppMonetization`) s'importe par `import type`.

`derivedShapesOf(setup)` pour un SaaS : `DERIVED_SHAPES` avec le
libre-service, `SLG_DERIVED_SHAPES` avec l'assisté, les deux pour l'hybride
(le libre-service d'abord).

`UNIT_INPUT_IDS` (nouveau, exporté) : l'ensemble des ids que « il manque »
écrit avec `unitInput` : les entrées de `DERIVED_SHAPES` et
`SLG_DERIVED_SHAPES`, plus les seuls ids `app.*` des entrées
d'`APP_DERIVED_SHAPES`. `phrases.ts` le lit à la place de son `UNIT_INPUTS`
local, et le test d'`engine-copy.test.ts` (les clés d'`unitInput`) le compare
à lui. Le SaaS ne change pas d'un caractère : `ret.d30` et
`rev.paid-conversion` restent écrits par leur nom, sans article, comme
aujourd'hui.

L'ordre de `shapesOf` pour une app : les quinze du libre-service gardés, dans
l'ordre de `METRIC_SHAPES`, puis les chiffres `app.*` montrés, dans l'ordre
d'`APP_METRIC_SHAPES`. Les écrans par étape trient déjà par étape (★ en tête).

`motionOfMetric(id)` ne change pas : un id `app.*` est de la motion `"plg"`.
`candidatesOf(motion)` ne change pas (elle sert le SaaS) ; une app lit
`appCandidates(setup)` (§21.5.4).

#### 21.2.4 `src/lib/engine/shared-counts.ts` (APP-1)

```ts
monthSignups: [
  { metric: "acq.signup-rate", side: "numerator" },
  { metric: "acq.top-channel-share", side: "denominator" },
  // §21: an app's installs of the month are its cost per install's base.
  { metric: "app.acq.cpi", side: "denominator" },
],
// §21: the month's actives, the two per-active revenues' base (C92).
appActives: [
  { metric: "app.rev.purchases-per-active", side: "denominator" },
  { metric: "app.rev.ads-per-active", side: "denominator" },
],
```

`WHOLE_SHARED_COUNTS` gagne `"appActives"` (des personnes). Rien d'autre :
le dénominateur de `app.ret.active-retention` (les actifs du mois d'avant)
n'est pas un compte partagé.

---

### 21.3 Le drapeau des types (APP-0)

**`src/lib/engine/access.ts`** gagne, à côté d'`engineEnvFlag` (le seul
module autorisé à lire ces variables, `engine-boundary.test.ts`) :

```ts
/** The raw ENGINE_TYPES value: a comma-separated list of extra business types (§21.3). */
export function engineTypesFlag(): string | undefined {
  return process.env.ENGINE_TYPES;
}
/**
 * The business types open in THIS build: always b2b-saas, plus each known
 * type listed in ENGINE_TYPES (comma-separated, spaces ignored, unknown names
 * ignored, duplicates once), in BUSINESS_TYPES order. Pure on its input.
 */
export function openTypesWith(env: string | undefined): BusinessType[];
/** Read at build by the page, never by the island: the page is static (●). */
export function openTypesAtBuild(): BusinessType[] {
  return openTypesWith(engineTypesFlag());
}
```

- `access.ts` importe `BUSINESS_TYPES` et `ALWAYS_OPEN_TYPE` de
  **`setup-type.ts`** (§21.2.2 : jamais de `business-type.ts`).
- **Les noms se comparent tels quels**, casse comprise, après un `trim()` de
  chacun : `Consumer-App` n'ouvre rien.
- **`page.tsx`** passe `openTypes` à `EngineWorkbench` ;
  `EngineWorkbenchProps` gagne `openTypes: BusinessType[]` (obligatoire) ;
  `resolveEngineProps` ne le calcule pas (il ne lit pas l'environnement) : son
  type de retour devient **`Omit<EngineWorkbenchProps, "openTypes">`**, et la
  page fait `<EngineWorkbench {...props} openTypes={openTypesAtBuild()} />`.
  `__tests__/props.ts` (les props des tests) ne change pas ; un test qui monte
  `EngineWorkbench` avec elles ajoute `openTypes={["b2b-saas"]}` (retouche
  d'appel). Les props qu'APP-2 et APP-3 ajoutent (`typeCatalogs`,
  `typeStrings`) sont remplies par `resolveEngineProps` et restent
  obligatoires.
- **`engine-boundary.test.ts`** : le test « the flag has one reader »
  (`only lib/engine/access.ts reads ENGINE_ENABLED`) gagne la même assertion
  pour `ENGINE_TYPES` (même expression régulière, le nom changé ; lecteurs :
  `["lib/engine/access.ts"]`). Cette expression n'a pas de borne de mot,
  comme celle d'`ENGINE_ENABLED` : on la garde telle quelle.
- **`src/__tests__/next-config.test.ts`** gagne « never exposes ENGINE_TYPES
  itself to the client bundles », à côté du même test pour `ENGINE_ENABLED`
  (D8 : la variable n'est jamais inlinée dans le client ; ajouté par APP-0
  après sa relecture sécurité).
- **Un type fermé** est grisé dans `Setup` (« Plus tard ») et absent de la
  carte de départ. **Un fichier** d'un type fermé s'ouvre quand même : l'import
  ne dépend pas du build.
- **`.github/workflows/ci.yml`** : `ENGINE_TYPES: "consumer-app"` dans le bloc
  `env:` du workflow, à côté de `GAME_ENABLED: "true"`. Lire `GITHUB.md`
  d'abord (déclencheur : « écrire ou modifier un workflow »).
- **`.env.local.example`** : juste après la ligne `ENGINE_ENABLED=`, une
  ligne vide puis, comme elle, un bloc de commentaires et une affectation
  vide **non commentée** :

  ```sh
  # Les types d'entreprise ouverts en plus du SaaS B2B (§21.3), séparés par
  # des virgules : consumer-app, puis marketplace. Vide : le SaaS B2B seul.
  ENGINE_TYPES=
  ```
- **Pour Antoine** : ouvrir le type, c'est poser `ENGINE_TYPES=consumer-app`
  dans Vercel puis redéployer ; pour le tester avant son bon à tirer, sur
  l'environnement **Preview** seulement.

---

### 21.4 Les chiffres de l'app

#### 21.4.1 Les six chiffres `app.*` (`APP_METRIC_SHAPES`, APP-1)

Tous : `primary: false`, `scope: "app"`, `span: 1`, aucun `benchmark` (D14),
aucun `tourQuestionId`.

| Id | Étape | `valueKinds` → `unit` | Bornes, montants | `flow` | Effort | Rôle | `sources` (dans cet ordre) | Glossaire | Variantes | Réparation |
|---|---|---|---|---|---|---|---|---|---|---|
| `app.acq.cpi` | acquisition | `["ratio", "amount"]` → money | non bornée | month | ask | finance | appsflyer, adjust, google-ads, meta-ads | `cac` | `media-only`, `plus-team`, `fully-loaded` | meeting |
| `app.ret.active-retention` | retention | `["ratio", "rate"]` → percent | bornée | month | self-1h | data | amplitude, mixpanel, ga4 | `retention` | — | sprint |
| `app.rev.purchases-per-active` | revenue | `["ratio"]` → money | non bornée | month | self-1h | finance | revenuecat, app-store-connect, play-console | `arpu` | — | afternoon |
| `app.rev.ads-per-active` | revenue | `["ratio"]` → money | non bornée | month | ask | finance | spreadsheet | `arpu` | — | afternoon |
| `app.rev.commission` | revenue | `["ratio", "rate"]` → percent | bornée, `amounts: true` | month | self-1h | finance | revenuecat, app-store-connect, play-console | `cac-payback` | — | meeting |
| `app.rev.gross-margin` | revenue | `["ratio", "rate"]` → percent | bornée, `amounts: true` | month | ask | finance | spreadsheet | `cac-payback` | — | meeting |

Les deux revenus par actif se saisissent **en comptes seulement** (`["ratio"]`,
comme un seul chiffre du catalogue aujourd'hui) : le dénominateur, les actifs
du mois, est la base du flux d'usage (§21.5.3), et une valeur saisie sans lui
laisserait le revenu de l'usage incalculable sans rien à nommer. Une
estimation (une fourchette sans comptes) reste possible : les actifs se
saisissent alors dans les Réglages (§21.6.2), et tant qu'ils manquent, « il
manque » les nomme (`io.sharedCount.appActives`, §21.6.4).

**Ce que montre une monétisation** (`appShapeShown`) :

| Chiffre | Abonnements | Achats | Pub |
|---|---|---|---|
| `app.acq.cpi`, `app.rev.gross-margin` | toujours | toujours | toujours |
| `app.rev.commission` | ✓ | ✓ | — |
| `app.ret.active-retention` | — | ✓ | ✓ |
| `app.rev.purchases-per-active` | — | ✓ | — |
| `app.rev.ads-per-active` | — | — | ✓ |
| les cinq de `SUBSCRIPTION_METRICS` | ✓ | — | — |

Un chiffre est montré dès qu'**une** des façons cochées l'appelle. Les comptes,
tenus par un test d'APP-1 : 21 chiffres avec les trois ; 18 avec les
abonnements seuls ; 15 avec les achats seuls ; 14 avec la pub seule ; 20 avec
abonnements et pub ; 20 avec abonnements et achats ; 16 avec achats et pub.

*Les ★* : une app garde les ★ du libre-service parmi ses chiffres montrés.
Sans abonnements, `rev.paid-conversion` n'est pas montré : le Revenue n'a pas
de ★ (D12).

#### 21.4.2 Les quatre calculés de l'app (`APP_DERIVED_SHAPES`, APP-1)

Étape revenue, sans repère, sans `tourQuestionId`. Leurs `inputs` sont **la
liste complète** ; le calcul n'en lit que ceux de la monétisation cochée
(`appInputsOf`, §21.5.2), pour que « il manque … » ne cite jamais un chiffre
caché.

| Id | `inputs` | Glossaire |
|---|---|---|
| `app.rev.install-value` | app.rev.gross-margin, app.rev.commission, rev.paid-conversion, rev.arpa, ret.logo-churn, ret.d30, app.rev.purchases-per-active, app.rev.ads-per-active, app.ret.active-retention | `ltv` |
| `app.rev.install-ltv` | les mêmes | `ltv` |
| `app.rev.install-payback` | les mêmes, puis app.acq.cpi | `cac-payback` |
| `app.rev.value-to-cost` | les mêmes, puis app.acq.cpi | `ltv` |

`derivedShapesOf(setup)` pour une app : `rev.grr` et `rev.nrr` si les
abonnements sont cochés, puis ces quatre. Les trois calculés SaaS
(`rev.ltv`, `rev.cac-payback`, `rev.ltv-cac`) ne s'affichent jamais pour une
app (ils lisent `acq.cac` et `rev.gross-margin`, D2).

#### 21.4.3 La forme affichée des quinze (`DISPLAY_OVERRIDES["consumer-app"]`, APP-2)

| Id | `sources` (dans cet ordre) | `benchmark` | `glossary` |
|---|---|---|---|
| `acq.signup-rate` | app-store-connect, play-console, appsflyer | **retiré** (le 2-5 % porte sur du trafic web payant froid) | `acquisition` |
| `acq.top-channel-share` | app-store-connect, play-console, appsflyer, adjust | — | `acquisition` |
| `act.event` | [] | — | `aha-moment` |
| `act.rate` | ga4, amplitude, mixpanel | **retiré** (le 20-40 % porte sur l'onboarding SaaS) | `activation` |
| `act.ttv` | ga4, amplitude, mixpanel | — | `time-to-value` |
| `ret.d30` | ga4, amplitude, mixpanel | **ajouté** : `{ term: "retention", lo: 20, hi: 30, direction: "higher" }` | `retention` |
| `ret.logo-churn` | revenuecat, stripe | **retiré** (le 1-2 % porte sur le SaaS B2B à panier élevé) | `churn` |
| `ret.churn-cause` | revenuecat, product-db | — | `churn` |
| `ref.mechanism` | [] | — | `referral` |
| `ref.referred-share` | product-db, appsflyer, adjust | — | `referral` |
| `ref.k-factor` | product-db, amplitude, mixpanel | gardé (0,15-0,5, « la plupart des produits ») | `viral-coefficient` |
| `rev.paid-conversion` | revenuecat, product-db | — | `revenue` |
| `rev.arpa` | revenuecat, stripe | — | `arpu` |
| `rev.expansion` | revenuecat, stripe | — | `nrr-grr` |
| `rev.contraction` | revenuecat, stripe | — | `nrr-grr` |

`DERIVED_DISPLAY_OVERRIDES["consumer-app"]` : vide (`rev.grr` et `rev.nrr` n'ont
pas de repère ; les trois calculés SaaS ne s'affichent pas).

Le repère de `ret.d30` vient mot pour mot du terme approuvé `retention`
(« les applis mobiles grand public gardent souvent 20-30 % d'une cohorte à
J30 ») ; le test des repères (`engine-catalog.test.ts`, bornes dans le texte du
terme) s'applique aussi à la forme affichée de l'app (APP-2 l'étend).

**Les points de lecture à faire passer par `displayShapeOf`** (relevés sur
`d91ab24` par `grep -rn "\.benchmark\b\|\.sources\b\|\.glossary\b"` hors
tests ; à refaire à APP-2) :

| Fichier:ligne | Lecture | Ce que fait APP-2 |
|---|---|---|
| `_engine/sources.ts:51` | `shape.sources` dans `sourceOptions` | l'appelant passe `displayShapeOf(id, setup.type)` |
| `_engine/MetricSheet.tsx:248` | `shape.benchmark` | `displayShapeOf(id, setup.type).benchmark` |
| `lib/engine/deck-unit.ts:53` | le repère de 12 mois du `PaybackChart` | `displayDerivedShapeOf("rev.cac-payback", state.setup.type).benchmark?.lo ?? null` ; pour une app, la slide d'unit economics a sa propre variante (§21.7.3) et ne lit pas ce repère |
| `engine-props.ts:27,33` | `shape.glossary` → `glossaryHref` | les chiffres de l'app sont résolus avec `displayShapeOf(id, "consumer-app").glossary` |
| `page.tsx:77,183` | le catalogue statique de la page | **inchangé** : la page publique ne montre que le catalogue SaaS |

Un test d'APP-2 (`business-type.test.ts`) reprend ce `grep` et échoue si une
lecture de `.benchmark`, `.sources` ou `.glossary` apparaît hors de cette liste,
de `business-type.ts`, de `catalog-shape.ts` et de `page.tsx`. **Sa portée** :
les fichiers de `FILES` (`src/__tests__/helpers/import-graph.ts`) dont le
chemin commence par `lib/engine/`, `app/[locale]/aarrr-funnel-template/` ou
`components/engine/`, hors `__tests__/` ; l'expression,
`/\.(benchmark|sources|glossary)\b/` sur `stripComments(source)`. Le reste du
site (`UI_STRINGS.benchmark`, le glossaire, le Tour) n'est pas concerné. La
liste permise nomme des fichiers, pas des lignes : une ligne qui bouge ne
casse rien.

#### 21.4.4 La prose des six chiffres `app.*` (APP-1)

Dans `ENGINE_CATALOG` (`src/content/engine-catalog.ts`, typé
`Record<MetricId, …>` : le compilateur les exige), dans un bloc
`// --- Consumer app (§21) ---` en fin de record, sous un marqueur
`// TODO: à relire — copie neuve (convention 6), §21 (A22)`. Les règles
d'écriture de l'en-tête d'`engine-catalog.ts` valent (rapport vérifié, aucun
menu inventé, réserve sans chiffre propre). Les noms d'écrans d'outils sont
sourcés en annexe.

**`app.acq.cpi`**
- name : « Coût par installation » / "Cost per install"
- oneLiner : « Ce que coûte, en moyenne, une installation de ton app. » / "What one install of your app costs, on average."
- formula : « dépense d'acquisition du mois ÷ installations du mois, organiques comprises » / "acquisition spend in the month ÷ installs in the month, organic included"
- inputs : numérateur « Dépense pour les installations en {month} » / "Spend on installs in {month}" ; dénominateur « Installations en {month} » / "Installs in {month}" (le numérateur ne reprend pas « Dépense d'acquisition en {month} », le libellé d'`acq.cac` : deux libellés identiques du catalogue doivent être un compte partagé, `shared-counts.test.ts`)
- where :
  1. appsflyer · « AppsFlyer ou Adjust » · « le tableau de bord Overview : le coût du mois et les installations, toutes sources » / "the Overview dashboard: the month's cost and installs, all sources"
  2. google-ads · « Apple Search Ads, Google Ads, Meta Ads Manager » · « le montant dépensé en {month}, toutes campagnes confondues » / "the amount spent in {month}, all campaigns together"
  3. role finance · « Finance » · recopier le chemin de `acq.cac` (ses variantes)
- trap : « Divise par toutes les installations du mois, organiques comprises. Le CPI d'une régie ne divise que par les installations qu'elle s'attribue : il paraît plus cher. » / "Divide by every install in the month, organic included. An ad network's CPI only divides by the installs it claims: it looks dearer."
- request : « la dépense d'acquisition en {month} ({variant}) et le nombre d'installations du même mois, toutes sources » / "the acquisition spend in {month} ({variant}) and the number of installs that same month, all sources"
- noReferenceReason : « un coût par installation se juge contre ce qu'une installation rapporte, pas contre celui des autres apps » / "a cost per install is judged against what an install brings in, not against other apps'"
- variants : mêmes ids et mêmes libellés que `acq.cac`.

**`app.ret.active-retention`**
- name : « Rétention mensuelle des actifs » / "Monthly active retention"
- oneLiner : « La part des actifs du mois d'avant encore actifs ce mois-ci. » / "The share of last month's actives still active this month."
- formula : « actifs du mois déjà actifs le mois d'avant ÷ actifs du mois d'avant » / "actives this month who were already active the month before ÷ actives the month before"
- inputs : numérateur « Actifs en {month}, déjà actifs avant » / "Actives in {month}, already active before" ; dénominateur « Actifs le mois d'avant » / "Actives the month before"
- where :
  1. amplitude · « Amplitude ou Mixpanel » · « un graphique de rétention au mois : les actifs d'un mois, revenus le mois suivant » / "a monthly retention chart: one month's actives who came back the next month"
  2. ga4 · « GA4 (Firebase) » · « pas de rétention d'un mois sur l'autre dans les rapports standards : à demander à la data, depuis l'export des événements » / "no month-over-month retention in the standard reports: ask the data team, from the event export"
- trap : « Compte les mêmes personnes d'un mois sur l'autre, pas deux totaux d'actifs : deux mois à 15 000 actifs ne font pas 100 % si 3 000 sont nouveaux. » / "Count the same people from one month to the next, not two totals of actives: two months at 15,000 actives aren't 100% if 3,000 are new."
- request : « le nombre d'actifs le mois d'avant {month}, et combien d'entre eux ont encore été actifs en {month} » / "the number of actives the month before {month}, and how many of them were still active in {month}"
- noReferenceReason : « elle dépend du rythme d'usage que l'app vise, chaque jour ou chaque semaine ; suis-la contre ta propre cible » / "it depends on how often the app is meant to be used, daily or weekly; follow it against your own target"

**`app.rev.purchases-per-active`**
- name : « Achats par actif » / "Purchases per active"
- oneLiner : « Ce que les achats intégrés rapportent, par actif et par mois. » / "What in-app purchases bring in, per active and per month."
- formula : « revenu des achats intégrés du mois, avant commission ÷ actifs du mois » / "in-app purchase revenue in the month, before commission ÷ actives in the month"
- inputs : numérateur « Revenu des achats en {month} » / "Purchase revenue in {month}" ; dénominateur « Actifs en {month} » / "Actives in {month}"
- where :
  1. app-store-connect · « App Store Connect » · « Sales and Trends : Sales moins Subscription Sales, sur le mois — les achats qui ne sont pas des abonnements » / "Sales and Trends: Sales minus Subscription Sales over the month — the purchases that aren't subscriptions"
  2. play-console · « Google Play Console » · « le rapport des revenus (Earnings) : les ventes du mois au type de produit « One-time product » » / "the Earnings report: the month's charges with product type \"One-time product\""
  3. revenuecat · « RevenueCat » · « le graphique Revenue du mois, vue Revenue (net of taxes), sans les abonnements » / "the month's Revenue chart, Revenue (net of taxes) view, subscriptions left out"
- trap : « Divise par tous les actifs du mois, payeurs ou non, abonnés compris : c'est ce qui l'additionne aux abonnements sans double compte. Et prends le revenu avant commission. » / "Divide by every active in the month, paying or not, subscribers included: that is what lets it add to subscriptions without double counting. And take revenue before commission."
- request : « le revenu des achats intégrés en {month}, avant commission des stores, et le nombre d'actifs du même mois » / "the in-app purchase revenue in {month}, before the stores' commission, and the number of actives that same month"
- noReferenceReason : « ce qu'un actif dépense dépend de la catégorie et du prix des achats ; compare-toi à toi-même » / "what an active spends depends on the category and on purchase prices; compare with yourself"

**`app.rev.ads-per-active`**
- name : « Publicité par actif » / "Ads per active"
- oneLiner : « Ce que la publicité rapporte, par actif et par mois. » / "What ads bring in, per active and per month."
- formula : « revenu publicitaire versé par les régies pour le mois ÷ actifs du mois » / "ad revenue paid by the networks for the month ÷ actives in the month"
- inputs : numérateur « Revenu publicitaire en {month} » / "Ad revenue in {month}" ; dénominateur « Actifs en {month} » / "Actives in {month}"
- where :
  1. role finance · « Finance » · « les relevés des régies pour le mois (AdMob, AppLovin, ironSource…) : ce qu'elles te versent » / "the networks' statements for the month (AdMob, AppLovin, ironSource…): what they pay you"
  2. spreadsheet · « Ton suivi des revenus » · « le revenu publicitaire du mois, et les actifs du mois depuis ton outil d'analytics » / "the month's ad revenue, and the month's actives from your analytics tool"
- trap : « Prends ce que les régies te versent, pas ce que les annonceurs paient : la régie garde sa part avant. Et divise par tous les actifs du mois, comme pour les achats. » / "Take what the networks pay you, not what advertisers pay: the network keeps its share first. And divide by every active in the month, as for purchases."
- request : « le revenu publicitaire versé par les régies pour {month}, et le nombre d'actifs du même mois » / "the ad revenue the networks paid for {month}, and the number of actives that same month"
- noReferenceReason : « il dépend du pays, du format et du temps passé dans l'app ; suis-le contre ta propre cible » / "it depends on the country, the format and the time spent in the app; follow it against your own target"

**`app.rev.commission`**
- name : « Commission des stores » / "Store commission"
- oneLiner : « La part de ce que les stores encaissent pour toi qu'ils gardent. » / "The share of what the stores collect for you that they keep."
- formula : « commission gardée par l'App Store et Google Play ÷ ce qu'ils ont encaissé (abonnements et achats, hors taxes) » / "commission kept by the App Store and Google Play ÷ what they collected (subscriptions and purchases, excluding tax)"
- inputs : numérateur « Commission en {month} » / "Commission in {month}" ; dénominateur « Encaissé par les stores en {month} » / "Collected by the stores in {month}"
- where :
  1. revenuecat · « RevenueCat » · « le graphique Revenue du mois : l'écart entre la vue Revenue (net of taxes) et la vue Proceeds » / "the month's Revenue chart: the gap between the Revenue (net of taxes) and Proceeds views"
  2. play-console · « Google Play Console » · « le rapport des revenus (Earnings) : la somme des lignes « Google fee », divisée par celle des ventes » / "the Earnings report: the sum of the \"Google fee\" lines, divided by the charges"
  3. app-store-connect · « App Store Connect » · « Sales and Trends : Sales et Proceeds du mois ; Proceeds retire la commission et les taxes » / "Sales and Trends: the month's Sales and Proceeds; Proceeds takes off the commission and taxes"
- trap : « Si tes ventes mélangent un taux réduit et le taux plein, ta moyenne est entre les deux. La publicité ne paie pas de commission : ne la mets pas au dénominateur. » / "If your sales mix a reduced rate and the full rate, your average sits between the two. Ads pay no commission: keep them out of the denominator."
- request : « la commission gardée par les stores en {month}, et ce qu'ils ont encaissé ce mois-là, abonnements et achats, hors taxes » / "the commission the stores kept in {month}, and what they collected that month, subscriptions and purchases, excluding tax"
- noReferenceReason : « les taux des stores sont fixés par leurs règles, pas par un marché : vérifie le tien dans tes relevés » / "the stores' rates are set by their rules, not by a market: check yours in your statements"

**`app.rev.gross-margin`**
- name : « Marge brute, après commission » / "Gross margin, after commission"
- oneLiner : « Ce qu'il te reste d'un euro encaissé, commission déduite, après le coût de servir tes utilisateurs. » / "What is left of each euro you receive, commission deducted, after the cost of serving your users."
- formula : « (revenu après commission – coûts directs : serveurs, contenus, frais de paiement du web, support) ÷ revenu après commission » / "(revenue after commission – direct costs: servers, content, web payment fees, support) ÷ revenue after commission"
- inputs : numérateur « Marge brute en {month} » / "Gross margin in {month}" ; dénominateur « Revenu après commission en {month} » / "Revenue after commission in {month}"
- where : 1. role finance · « Finance » · « le compte de résultat du dernier trimestre clos : le revenu net des commissions des stores, puis les coûts directs » / "the income statement of the last closed quarter: revenue net of the stores' commission, then the direct costs"
- trap : « Ne déduis pas la commission une deuxième fois : elle a son propre chiffre, que le moteur applique aux abonnements et aux achats, jamais à la pub. » / "Don't deduct the commission twice: it has its own number, which the engine applies to subscriptions and purchases, never to ads."
- request : « la marge brute du dernier trimestre clos, calculée sur le revenu après commission des stores, et ce que ses coûts directs comprennent » / "the gross margin of the last closed quarter, computed on revenue after the stores' commission, and what its direct costs include"
- noReferenceReason : « les repères de marge publiés portent sur le SaaS, sans commission de store ni coût de contenu » / "the published margin references are for SaaS, with no store commission or content cost"

#### 21.4.5 La prose des quatre calculés (APP-1)

Dans `ENGINE_DERIVED_CATALOG` (`Record<DerivedId, …>`), même bloc, même
marqueur.

| Id | name (FR / EN) | formula (FR / EN) | uncomputable (FR / EN) |
|---|---|---|---|
| `app.rev.install-value` | « Valeur d'une installation sur 12 mois » / "An install's 12-month value" | « la marge qu'une installation apporte en 12 mois : sa part d'abonné, qui baisse avec le churn des abonnés, et sa part d'actif, qui baisse avec la rétention des actifs » / "the margin an install brings in 12 months: its share of a subscriber, falling with subscriber churn, and its share of an active, falling with active retention" | « incalculable — il manque {input} » / "can't be computed — missing: {input}" (la ponctuation des entrées existantes) |
| `app.rev.install-ltv` | « Valeur d'une installation sur 36 mois » / "An install's 36-month value" | « la même marge, comptée sur 36 mois au plus, le plafond du moteur » / "the same margin, counted over 36 months at most, the engine's cap" | idem |
| `app.rev.install-payback` | « Remboursement d'une installation » / "Install payback" | « les mois qu'il faut à cette marge, mois par mois, pour rembourser le coût par installation » / "the months this margin takes, month by month, to pay back the cost per install" | idem |
| `app.rev.value-to-cost` | « Valeur sur 12 mois ÷ coût » / "12-month value ÷ cost" | « valeur d'une installation sur 12 mois ÷ coût par installation » / "an install's 12-month value ÷ cost per install" | idem |

`app.rev.install-ltv` porte aussi `capNote` : « valeur plafonnée à 36 mois,
comme la durée de vie d'un client du libre-service : au-delà, une
installation ne se projette plus » / "value capped at 36 months, like a
self-serve customer's lifetime: beyond that, an install is no longer
projected". Le test `it.each(["rev.ltv", "slg.rev.ltv"])`
d'`engine-catalog.test.ts` (le plafond écrit avec la constante du calcul,
dans `formula` et `capNote`) gagne `"app.rev.install-ltv"` : la formule et la
note ci-dessus disent « 36 ».

**`unitInput`** (`engine-copy.ts`, `Record<UnitInputId, …>`, chaque français
commence par le/la/les/l') gagne : `app.acq.cpi` « le coût par installation »
/ "the cost per install" ; `app.rev.gross-margin` « la marge brute après
commission » / "the gross margin after commission" ; `app.rev.commission`
« la commission des stores » / "the store commission" ;
`app.ret.active-retention` « la rétention des actifs » / "active retention" ;
`app.rev.purchases-per-active` « les achats par actif » / "purchases per
active" ; `app.rev.ads-per-active` « la publicité par actif » / "ads per
active". **Pas** `ret.d30` ni `rev.paid-conversion`, que les calculés de
l'app lisent aussi : `UNIT_INPUT_IDS` (§21.2.3) les laisse dehors, et « il
manque » les écrit par leur nom, sans article, comme le SaaS aujourd'hui.

**`io.sharedCount.appActives`** (`Record<SharedCount, …>`, à côté de
`monthSignups` : un nom en minuscules, lu au milieu d'une phrase) : « actifs du
mois » / "actives in the month".

#### 21.4.6 La prose des quinze, dans les mots de l'app (`src/content/engine-catalog-consumer.ts`, APP-2)


```ts
// TODO: à relire — copie neuve (convention 6), §21 (A22 APP-2)
import type { EngineCatalogEntry, EngineDerivedEntry } from "./engine-catalog";
import type { PlgMetricId } from "@/lib/engine/types";
/** The fifteen self-serve numbers an app shows, in its words (§21.1 D2: acq.cac and rev.gross-margin never show). */
export type ConsumerPlgMetricId = Exclude<PlgMetricId, "acq.cac" | "rev.gross-margin">;
export const ENGINE_CATALOG_CONSUMER: Record<ConsumerPlgMetricId, EngineCatalogEntry> = { … };
/** The two self-serve computed figures an app shows (with subscriptions). */
export const ENGINE_DERIVED_CATALOG_CONSUMER: Record<"rev.grr" | "rev.nrr", EngineDerivedEntry> = { … };
```

Des entrées **complètes** (pas des surcharges partielles) : un test peut alors
vérifier chaque entrée avec les mêmes règles que le catalogue SaaS (les six
placeholders, la parité FR/EN, les longueurs, les glyphes des slides, chaque
outil de `where` présent dans `displayShapeOf(id, "consumer-app").sources`,
`benchmarkCaveat` ⇔ repère affiché, `noReferenceReason` sinon). Les règles
d'écriture de l'en-tête d'`engine-catalog.ts` valent ici, en particulier :
« Où le trouver » nomme un rapport vérifié, jamais un menu inventé (les noms
d'écrans ci-dessous sont sourcés en annexe), et une réserve ne porte jamais ses
propres chiffres.

`variants`, `naReasons` et `choices` : **mêmes ids que le catalogue SaaS**,
dans le même ordre (D6) ; les libellés sont ceux d'ici quand ils sont donnés,
sinon ceux du SaaS recopiés.

Le texte, chiffre par chiffre. Les formulations sont un premier jet pour le bon
à tirer ; l'exécutant les recopie telles quelles, typographie posée.

**`acq.signup-rate`**
- name : « Taux d'installation » / "Install rate"
- oneLiner : « La part des visiteurs de ta fiche qui installent l'app. » / "The share of your store page's visitors who install the app."
- formula : « premières installations du mois ÷ visiteurs uniques de ta fiche App Store ou Google Play du mois » / "first-time installs in the month ÷ unique visitors to your App Store or Google Play page in the month"
- inputs : numérateur « Installations en {month} » / "Installs in {month}" ; dénominateur « Visiteurs de la fiche en {month} » / "Store page visitors in {month}"
- where :
  1. app-store-connect · « App Store Connect » · « Analytics : la métrique Product Page Views (vues uniques de la fiche) et la métrique First-Time Downloads, sur le mois » / "Analytics: the Product Page Views metric (unique views of your page) and the First-Time Downloads metric, over the month"
  2. play-console · « Google Play Console » · « Grow users, Store performance, Conversion analysis : Store listing visitors et Store listing acquisitions sur le mois » / "Grow users, Store performance, Conversion analysis: Store listing visitors and Store listing acquisitions over the month"
  3. appsflyer · « AppsFlyer ou Adjust » · « les installations du mois, toutes sources ; les visiteurs de la fiche viennent des stores » / "the month's installs, all sources; store page visitors come from the stores"
- trap : « La « Conversion Rate » d'App Store Connect porte sur les impressions, pas sur les visiteurs de la fiche. Additionne les deux stores dans les deux comptes, ou fais un moteur par store. » / "App Store Connect's \"Conversion Rate\" is on impressions, not page visitors. Add both stores up in both counts, or keep one engine per store."
- request : « le nombre de visiteurs uniques de la fiche et le nombre de premières installations en {month}, App Store et Google Play additionnés » / "the number of unique store page visitors and of first-time installs in {month}, App Store and Google Play added up"
- noReferenceReason : « la conversion d'une fiche dépend de la catégorie et de la part de visiteurs venus d'une pub ; suis-la contre ta propre cible » / "a page's conversion depends on the category and on the share of visitors who came from an ad; follow it against your own target"

**`acq.top-channel-share`**
- name : « Part de la première source » / "Top source share"
- oneLiner : « La part de tes installations qui vient de ta source principale. » / "The share of your installs that comes from your main source."
- formula : « installations venues de la première source ÷ installations du mois » / "installs from the top source ÷ installs in the month"
- inputs : « Installations de la première source » / "Installs from the top source" ; « Installations en {month} » / "Installs in {month}"
- where :
  1. app-store-connect · « App Store Connect » · « Analytics : First-Time Downloads ventilées par type de source (recherche dans l'App Store, navigation, référent web, référent app) » / "Analytics: First-Time Downloads broken down by source type (App Store search, browse, web referrer, app referrer)"
  2. play-console · « Google Play Console » · « Conversion analysis, filtrée par source de trafic » / "Conversion analysis, filtered by traffic source"
  3. appsflyer · « AppsFlyer ou Adjust » · « les installations du mois par media source, organiques compris » / "the month's installs by media source, organic included"
- trap : « Quelqu'un qui voit une pub puis cherche l'app compte en « recherche ». Sur iOS, les pubs s'attribuent par un cadre d'Apple agrégé et en retard : lis les sources payantes dans ton outil d'attribution. » / "Someone who sees an ad then searches for the app counts as \"search\". On iOS, ads are attributed through an aggregated, delayed Apple framework: read paid sources in your attribution tool."
- request : « le nombre d'installations en {month}, ventilé par source » / "the number of installs in {month}, broken down by source"
- noReferenceReason : recopier celle du SaaS.

**`act.event`**
- name : recopier ; oneLiner : « L'action qui montre qu'une installation devient un usage. » / "The action that shows an install has turned into use."
- formula : recopier.
- where : role product · « Produit » · recopier.
- trap : « Ouvrir l'app n'est pas un moment de valeur. Celui qui compte distingue les installations qui restent de celles qui partent : une première séance terminée, un premier contenu créé. » / "Opening the app isn't a moment of value. The one that counts separates the installs that stay from those that leave: a first session completed, a first piece of content created."
- request : recopier.

**`act.rate`**
- name : recopier ; oneLiner : « La part des installations qui atteignent la première valeur à temps. » / "The share of installs that reach first value in time."
- formula : « installations de la cohorte ayant déclenché {event} sous {n} jours ÷ installations de la cohorte » / "cohort installs that triggered {event} within {n} days ÷ cohort installs"
- inputs : « Activées sous {n} jours » / "Activated within {n} days" ; « Installations en {cohort} » / "Installs from {cohort}"
- where :
  1. ga4 · « GA4 (Firebase) » · « une exploration de l'entonnoir (onglet Explorer) : first_open puis {event}, sous {n} jours » / "a funnel exploration (Explore tab): first_open then {event}, within {n} days"
  2. amplitude · « Amplitude » · « un graphique Funnel Analysis : première ouverture puis {event}, fenêtre de conversion de {n} jours » / "a Funnel Analysis chart: first open then {event}, {n}-day conversion window"
  3. mixpanel · « Mixpanel » · « un entonnoir première ouverture puis {event}, avec une fenêtre de conversion de {n} jours » / "a funnel from first open to {event}, with a conversion window of {n} days"
- trap : « Sans compte, l'app compte des appareils : une personne qui réinstalle ou change de téléphone compte deux fois. Écris-le dans ta définition. » / "Without accounts, the app counts devices: someone who reinstalls or changes phones counts twice. Write it in your definition."
- request : « pour les installations en {cohort}, combien ont déclenché {event} sous {n} jours, et combien d'installations au total » / "for the installs from {cohort}, how many triggered {event} within {n} days, and how many installs in total"
- noReferenceReason : « les ordres de grandeur publiés portent sur l'onboarding SaaS ; suis ce taux contre ta propre cible » / "the published orders of magnitude are for SaaS onboarding; follow this rate against your own target"

**`act.ttv`**
- oneLiner : « Le temps qu'il faut à une installation pour atteindre la première valeur. » / "How long an install takes to reach first value."
- formula : « médiane du délai entre la première ouverture et {event} » / "median time between first open and {event}"
- where : 1. ga4 · « GA4 (Firebase) » · « pas de médiane dans les rapports standards : à demander à la data, depuis l'export des événements » / "no median in the standard reports: ask the data team, from the event export" ; 2. amplitude · « Amplitude ou Mixpanel » · « l'entonnoir première ouverture puis {event}, affiché en temps de conversion » / "the first open then {event} funnel, shown as time to convert"
- trap, noReferenceReason, variants : recopier.
- request : « le délai médian entre la première ouverture et {event}, pour les installations en {cohort} » / "the median time between first open and {event}, for the installs from {cohort}"

**`ret.d30`**
- oneLiner : « La part des installations encore actives un mois après. » / "The share of installs still active a month later."
- formula : « installations de la cohorte encore actives 30 jours après la première ouverture ÷ installations de la cohorte » / "cohort installs still active 30 days after first open ÷ cohort installs"
- inputs : « Actives à J30 » / "Active at day 30" ; « Installations en {cohort} » / "Installs from {cohort}"
- where :
  1. ga4 · « GA4 (Firebase) » · « une exploration de cohortes (onglet Explorer), cohorte par date de première ouverture, lue au jour 30 » / "a cohort exploration (Explore tab), cohort by first-open date, read at day 30"
  2. amplitude · « Amplitude » · « un graphique Retention Analysis : événement de départ la première ouverture, retour ton action d'usage » / "a Retention Analysis chart: starting event first open, return event your usage action"
  3. mixpanel · « Mixpanel » · « un rapport de rétention sur la cohorte, lu au trentième jour » / "a retention report on the cohort, read at day 30"
- trap : recopier celui du SaaS (« Actif » doit être écrit…).
- request : « pour les installations en {cohort}, combien étaient encore actives trente jours après la première ouverture, et combien d'installations au total » / "for the installs from {cohort}, how many were still active thirty days after first open, and how many installs in total"
- noReferenceReason : **aucune** (la forme affichée de l'app gagne un repère, §21.4.3, et le catalogue veut un `noReferenceReason` seulement quand aucun repère ne s'affiche) ; ne pas recopier celle du SaaS.
- benchmarkCaveat : « pour les applis mobiles grand public, qui tombent souvent sous 10 % à J90 ; compare-toi dans ta catégorie » / "for consumer mobile apps, which often fall below 10% by day 90; compare within your category". *La réserve cite « 10 % » : ce chiffre est dans le terme `retention` (« moins de 10 % à J90 »), la règle d'en-tête est tenue ; le test la vérifie.*

**`ret.logo-churn`**
- name : « Churn mensuel des abonnés » / "Monthly subscriber churn"
- oneLiner : « La part des abonnés payants qui partent dans le mois. » / "The share of paying subscribers who leave in the month."
- formula : « abonnés payants perdus dans le mois ÷ abonnés payants au 1er du mois » / "paying subscribers lost in the month ÷ paying subscribers at the start of the month"
- inputs : « Abonnés perdus en {month} » / "Subscribers lost in {month}" ; « Abonnés payants au 1er {month} » / "Paying subscribers at the start of {month}"
- where :
  1. revenuecat · « RevenueCat » · « le graphique Churn, au mois : il compte des abonnements, pas des personnes » / "the Churn chart, by month: it counts subscriptions, not people"
  2. stripe · « Stripe » · « pour les abonnements vendus sur le web : le graphique « Subscriber churn rate », recompté au mois » / "for subscriptions sold on the web: the \"Subscriber churn rate\" chart, recounted by month"
- trap : « Un essai qui ne convertit pas n'est pas un abonné perdu. Et un abonnement annuel ne part qu'à son échéance : un mois calme peut précéder un mois de renouvellements annuels. » / "A trial that doesn't convert isn't a lost subscriber. And an annual subscription only leaves when it is due: a quiet month can come before a month of annual renewals."
- request : « le nombre d'abonnés payants au 1er {month} et le nombre de ceux perdus pendant le mois, essais exclus » / "the number of paying subscribers at the start of {month} and the number lost during the month, trials excluded"
- noReferenceReason : « les repères publiés portent sur le SaaS B2B ; une app grand public tourne bien plus haut, et l'écart entre formules mensuelles et annuelles change tout » / "the published references are for B2B SaaS; a consumer app runs much higher, and the mix of monthly and annual plans changes everything". *Ni chiffre ni repère : la règle tient.*
- naReasons : `not-subscription` · « Pas d'abonnement » (recopié).

**`ret.churn-cause`**
- oneLiner : « Pourquoi les utilisateurs partent, et comment tu le sais. » / "Why users leave, and how you know."
- where :
  1. revenuecat · « RevenueCat » · « le graphique Play Store Cancel Reasons, pour Android ; Apple ne transmet pas de raison » / "the Play Store Cancel Reasons chart, for Android; Apple doesn't pass on a reason"
  2. role support · « Support » · « relire les avis du store et les messages des derniers départs » / "read the store reviews and the messages of the latest cancellations"
- trap, request, choices : recopier tels quels (ils ne nomment ni clients ni abonnés).

**`ref.mechanism`** : recopier tout, sauf trap : « Le bouche-à-oreille existe sans mécanisme : ne pas en avoir ne dispense pas de mesurer la part des installations recommandées. » / "Word of mouth exists without a mechanism: not having one doesn't excuse you from measuring the referred share of installs."

**`ref.referred-share`**
- name : « Part des installations recommandées » / "Referred install share"
- oneLiner : « La part des installations amenées par un utilisateur. » / "The share of installs brought in by a user."
- formula : « installations arrivées par un utilisateur (lien de partage, code offert, invitation) ÷ installations de la cohorte » / "installs that came through a user (share link, gift code, invite) ÷ cohort installs"
- inputs : « Installations recommandées » / "Referred installs" ; « Installations en {cohort} » / "Installs from {cohort}"
- where :
  1. product-db · « Base produit ou outil de parrainage » · « les installations en {cohort} rattachées à un code ou à un lien de partage » / "the installs from {cohort} attached to a code or a share link"
  2. appsflyer · « AppsFlyer ou Adjust » · « les installations venues des liens d'invitation ou de partage, si tu les y suis » / "the installs that came through invite or share links, if you track them there"
- trap : « Les installations « organiques » des stores mélangent recherche, bouche-à-oreille et effet des pubs : elles ne sont pas une mesure de la recommandation. » / "The stores' \"organic\" installs mix search, word of mouth and the effect of ads: they don't measure referral."
- request : « pour les installations en {cohort}, combien sont arrivées par un code, un lien de partage ou une invitation » / "for the installs from {cohort}, how many came through a code, a share link or an invite"
- noReferenceReason : recopier.

**`ref.k-factor`**
- oneLiner : « Le nombre de nouvelles installations que chaque installation amène, en moyenne. » / "How many new installs each install brings in, on average."
- formula : « installations invitées par la cohorte ÷ installations de la cohorte » / "installs invited by the cohort ÷ cohort installs"
- inputs : « Installations invitées par la cohorte » / "Installs invited by the cohort" ; « Installations en {cohort} » / "Installs from {cohort}"
- where : 1. product-db · « Table d'invitations » / "Invitations table" · « les invités qui ont installé, rattachés à la cohorte de celui qui les a invités » / "the invitees who installed, attached to the cohort of whoever invited them" ; 2. amplitude · « Amplitude ou Mixpanel » · recopier le chemin du SaaS.
- trap : « K se divise par toutes les installations de la cohorte, pas seulement par celles qui ont invité quelqu'un. » / "K divides by every install in the cohort, not just by those that invited someone."
- request : « pour les installations en {cohort}, le nombre de personnes qui ont installé grâce à leurs invitations » / "for the installs from {cohort}, the number of people who installed through their invites"
- benchmarkCaveat, naReasons : recopier.

**`rev.paid-conversion`**
- name : « Conversion en abonné » / "Subscriber conversion"
- oneLiner : « La part des installations qui deviennent des abonnés payants dans la fenêtre. » / "The share of installs that become paying subscribers within the window."
- formula : « installations de la cohorte devenues abonnés payants sous {n} jours ÷ installations de la cohorte » / "cohort installs that became paying subscribers within {n} days ÷ cohort installs"
- inputs : « Abonnés payants sous {n} jours » / "Paying subscribers within {n} days" ; « Installations en {cohort} » / "Installs from {cohort}"
- where :
  1. revenuecat · « RevenueCat » · « le graphique Conversion to Paying, sur la cohorte : sa cohorte part de la première ouverture avec RevenueCat, pas toujours de l'installation » / "the Conversion to Paying chart, on the cohort: its cohort starts at the first open with RevenueCat, not always at the install"
  2. role data · « Data » · « une jointure entre les premières ouvertures et les premiers paiements, sur l'identifiant de l'utilisateur » / "a join between first opens and first payments, on the user id"
- trap : « Un essai gratuit d'une semaine tient dans la fenêtre de 30 jours ; un essai d'un mois demande la fenêtre de 60. Un essai démarré n'est pas un abonné : compte le premier paiement. » / "A one-week free trial fits the 30-day window; a one-month trial needs the 60-day window. A started trial isn't a subscriber: count the first payment."
- request : « pour les installations en {cohort}, combien sont devenues des abonnés payants sous {n} jours, et combien d'installations au total » / "for the installs from {cohort}, how many became paying subscribers within {n} days, and how many installs in total"
- noReferenceReason : « aucun taux publié ne porte sur la même base que le tien : essai ou non, paywall à l'ouverture ou plus tard » / "no published rate uses the same base as yours: trial or not, paywall at first open or later"
- naReasons : `no-free-tier` · « App payante à l'installation » / "Paid app at install"

**`rev.arpa`**
- name : « Revenu mensuel par abonné » / "Monthly revenue per subscriber"
- oneLiner : « Le revenu mensuel moyen d'un abonné payant. » / "The average monthly revenue of a paying subscriber."
- formula : « MRR ÷ abonnés payants » / "MRR ÷ paying subscribers"
- inputs : « MRR à fin {month} » / "MRR at the end of {month}" ; « Abonnés payants à fin {month} » / "Paying subscribers at the end of {month}"
- where :
  1. revenuecat · « RevenueCat » · « les graphiques Monthly Recurring Revenue et Active Subscriptions, à fin {month}, en vue Revenue (avant commission) » / "the Monthly Recurring Revenue and Active Subscriptions charts, at the end of {month}, in the Revenue view (before commission)"
  2. stripe · « Stripe » · « pour le web : la page Billing overview, MRR et abonnés actifs » / "for the web: the Billing overview page, MRR and active subscribers"
- trap : « Prends le MRR avant commission : RevenueCat appelle « Proceeds » le montant après commission et taxes. Un abonnement annuel compte pour un douzième de son prix chaque mois. » / "Take MRR before commission: RevenueCat calls the amount after commission and taxes \"Proceeds\". An annual plan counts for a twelfth of its price each month."
- request : « le MRR à fin {month}, avant commission des stores, et le nombre d'abonnés payants à la même date » / "the MRR at the end of {month}, before the stores' commission, and the number of paying subscribers on the same date"
- noReferenceReason : recopier.

**`rev.expansion`**
- oneLiner : « Le revenu que les abonnés déjà là ajoutent dans le mois : passage à l'offre famille ou premium. » / "The revenue existing subscribers add in the month: moving to a family or premium plan."
- where : 1. revenuecat · « RevenueCat » · « les changements de produit du mois vers une offre plus chère, dans les événements d'abonnement » / "the month's product changes to a dearer plan, in the subscription events" ; 2. stripe · « Stripe » · « pour le web : les mouvements de MRR du mois, ligne « expansion » »
- trap : « Les nouveaux abonnés ne sont pas de l'expansion. Et passer d'un abonnement mensuel à un annuel moins cher par mois fait baisser le MRR : c'est une rétrogradation, pas une expansion. » / "New subscribers aren't expansion. And moving from a monthly plan to an annual one that costs less per month lowers the MRR: that is contraction, not expansion."
- request : « le MRR au 1er {month} et le MRR ajouté par les abonnés déjà là, sans les nouveaux » / "the MRR at the start of {month} and the MRR added by existing subscribers, without new ones"
- noReferenceReason : « la place pour l'expansion dépend de ta gamme : forte avec une offre famille, nulle avec un seul plan » / "the room for expansion depends on your range: large with a family plan, none with a single plan"
- naReasons : `not-subscription` · « Un seul plan » / "A single plan"

**`rev.contraction`**
- oneLiner : « Le revenu que les abonnés qui restent retirent dans le mois : offre moins chère, passage à l'annuel. » / "The revenue staying subscribers take away in the month: a cheaper plan, a move to annual."
- where, request : comme `rev.expansion`, ligne « rétrogradation » / "contraction".
- trap : « Un abonné parti n'est pas une rétrogradation : il est dans le churn. » / "A subscriber who left isn't contraction: they're in the churn."
- noReferenceReason : comme `rev.expansion` ; naReasons : `not-subscription` · « Un seul plan ».

**Les deux calculés** (`ENGINE_DERIVED_CATALOG_CONSUMER`) : recopier `rev.grr`
et `rev.nrr` du SaaS en remplaçant, dans leurs réserves, « le churn logo tient
lieu de churn en revenu, comme si les clients partis payaient l'ARPA moyen »
par « le churn des abonnés tient lieu de churn en revenu, comme si les abonnés
partis payaient le revenu moyen » / "subscriber churn stands in for revenue
churn, as if the subscribers who left paid the average revenue".

#### 21.4.7 Ce que la page passe à l'îlot (`engine-props.ts`, APP-2)

`EngineWorkbenchProps` gagne :

```ts
/** §21.4: the consumer app's prose, resolved like `metrics`/`derived`: the fifteen in its words, then the six app.* from ENGINE_CATALOG, in shapesOf order. */
typeCatalogs: { "consumer-app": { metrics: ResolvedMetric[]; derived: ResolvedDerived[] } };
```

`resolveEngineProps` les remplit avec `resolveTree` : `metrics` = les quinze
d'`ENGINE_CATALOG_CONSUMER` dans l'ordre de `METRIC_SHAPES`, puis les six
`app.*` d'`ENGINE_CATALOG` dans l'ordre d'`APP_METRIC_SHAPES` ; `derived` =
`rev.grr`, `rev.nrr` d'`ENGINE_DERIVED_CATALOG_CONSUMER`, puis les quatre
calculés de l'app d'`ENGINE_DERIVED_CATALOG`. `glossaryHref` depuis
`displayShapeOf(id, "consumer-app").glossary`. Les props `metrics` et
`derived` d'aujourd'hui (le SaaS) **ne gagnent pas** les ids `app.*` : le SaaS
ne les affiche jamais. *Exception* : le catalogue statique de la page
(`page.tsx`) reste celui du SaaS.

**Dans l'îlot**, une seule paire de fonctions choisit (`_engine/view.ts`, qui
ne tenait que des types et gagne ces deux fonctions pures) :

```ts
/** The catalogue a type's screens read (§21.4.7): b2b-saas → p.metrics; consumer-app → p.typeCatalogs["consumer-app"].metrics. */
export function metricsFor(p: Pick<EngineWorkbenchProps, "metrics" | "typeCatalogs">, type: BusinessType): ResolvedMetric[];
/** Same, for the derived figures (what EngineWorkbench passes as `derivedCopy` today). */
export function derivedFor(p: Pick<EngineWorkbenchProps, "derived" | "typeCatalogs">, type: BusinessType): ResolvedDerived[];
```

`EngineWorkbench` les appelle et passe le résultat partout où il passe
aujourd'hui `metrics` et `derivedCopy`. **Quel type, écran par écran** :
- le tableau, la fiche d'un chiffre, le deck, les Réglages, l'import par
  fusion : `current.setup.type` (le moteur à l'écran) ;
- l'exemple (`ExampleView`) : `"b2b-saas"` jusqu'à APP-10, puis le type de
  l'exemple ouvert (APP-10, §21.9) ;
- la carte de réglage (`Setup`) et la carte de départ, avant qu'un moteur
  existe : le type du choix en cours ; `EngineWorkbench` leur passe une
  fonction `metricsOf: (type: BusinessType) => ResolvedMetric[]` (fermée sur
  ses props) au lieu d'un tableau (APP-7) ;
- l'aperçu d'un fichier importé (`ImportPanel`) : le type du fichier lu,
  par la même fonction `metricsOf` (APP-7).

**Le poids.** Ces props voyagent dans le HTML de la page, prérendu. APP-2 et
APP-3 le mesurent avant et après, et l'écrivent dans l'entrée du journal :
- **la procédure** : `npm run build` avec le bloc `env:` de `ci.yml`
  (§23.8) ; le fichier est `.next/server/app/fr/aarrr-funnel-template.html`
  (prérendu au build, quel que soit `ENGINE_ENABLED`, qui ne joue qu'à
  l'exécution) ; la taille brute `wc -c < <fichier>`, gzip `gzip -c
  <fichier> | wc -c`. « Avant » se mesure sur la branche juste créée, avant
  le premier changement de l'unité ;
- **les ordres de grandeur** (mesurés le 2026-10-04) : les props résolues en
  français pèsent 125 ko bruts, 35 ko gzip (`metrics` 38 / 9,4, `strings`
  81 / 25) ; les 21 + 6 entrées du catalogue de l'app ajoutent ~26 ko bruts,
  `typeStrings` ~18 ko bruts, soit ~11-12 ko gzip à eux deux ;
- **l'arrêt** : au-delà de **+25 ko gzip** à APP-2 et APP-3 ensemble,
  s'arrêter et le dire à Antoine.

---

### 21.5 Le modèle branché (`src/lib/engine/app.ts`, `scenario-of.ts`)

Tout est pur, en intervalles (`interval.ts`), comme le reste du moteur ;
une valeur inconnue est `null`, jamais 0. Les fonctions de `app-model.ts` et
`stream.ts` **s'importent, ne se modifient pas** (§23.2). Les noms ci-dessous
sont imposés.

#### 21.5.1 La couture (`src/lib/engine/scenario-of.ts`, APP-4)

```ts
import { LEVER_IDS } from "./catalog-shape";
import { appLeverAlone, appLeverIds, buildAppScenario } from "./app";
import { buildScenario, leverAlone, type Scenario } from "./scenario";
import type { EngineCalcContext, EngineSetup, EngineState, LeverId } from "./types";

/** The levers `leverViews` takes: never the link's. */
export type PanelLeverId = Exclude<LeverId, "link.pql-handoff">;
/** The self-serve levers a setup moves, in panel order: the SaaS's nine, or an app's (§21.5.3). Never the sales-assisted ones. */
export function leverIdsOf(setup: Pick<EngineSetup, "type" | "motions" | "monetization">): readonly PanelLeverId[] {
  return setup.type === "consumer-app" ? appLeverIds(setup) : LEVER_IDS;
}
/** The self-serve scenario, whatever the type (§21.1 D4): one entry point for the board, the panel and the slides. */
export function scenarioOf(state: EngineState, targets: Partial<Record<LeverId, number>>, ctx: EngineCalcContext): Scenario {
  return state.setup.type === "consumer-app" ? buildAppScenario(state, targets, ctx) : buildScenario(state, targets, ctx);
}
export function leverAloneOf(state: EngineState, id: LeverId, ctx: EngineCalcContext): Scenario | null {
  return state.setup.type === "consumer-app" ? appLeverAlone(state, id, ctx) : leverAlone(state, id, ctx);
}
/**
 * The candidates a setup's targets and diagnosis read, for one motion (APP-5): the SaaS's `candidatesOf(motion)`,
 * or, for an app's self-serve, `appCandidates(setup)` (§21.5.4). Every screen that offers a target loops on it.
 */
export function candidatesFor(setup: Pick<EngineSetup, "type" | "motions" | "monetization">, motion: Motion): readonly CandidateId[] {
  return setup.type === "consumer-app" && motion === "plg" ? appCandidates(setup) : candidatesOf(motion);
}
```

`appLeverIds` et `PanelLeverId` : `app.ts` importe le type de
`scenario-of.ts` par `import type` (pas de cycle de valeurs). `candidatesFor`
s'ajoute en APP-5, avec ses imports (`appCandidates` d'`app.ts`,
`candidatesOf` de `catalog-shape.ts`, les types `CandidateId`, `Motion`).

**Qui passe par la couture** (relevé sur `d91ab24` ; refaire `grep -rn
"buildScenario(\|leverAlone(\|LEVER_IDS" src --include=*.ts --include=*.tsx`
hors tests) :

| Appel | Devient | Unité |
|---|---|---|
| `_engine/scenario-view.ts#scenarioFor` (`buildScenario`) | `scenarioOf` | APP-8 |
| `_engine/scenario-view.ts#leverGains` (`leverAlone`) | `leverAloneOf` | APP-8 |
| `deck.ts#movedLevers` (`LEVER_IDS`, `leverAlone`) | `leverIdsOf(state.setup)`, `leverAloneOf` | APP-9 |
| `deck.ts#buildUnitEconomics` et `#buildWhatIfSlides` (`buildScenario`) | `scenarioOf` | APP-9 |
| `total.ts#buildTotal` | **inchangé** : l'hybride est un SaaS | — |
| `scenario.ts#leverAlone`, `#buildScenario` (définitions) | inchangés | — |

`money-view.ts`, `whatif-figures.ts`, `BoardLever.tsx` et `WhatIfPanel.tsx`
lisent `scenarioFor` : ils passent par la couture sans changer d'appel.

#### 21.5.2 Lire les chiffres d'une app (`appInputs`, APP-4)

```ts
export interface AppInputs {
  m: AppMonetization;
  /** The month's installs: the shared count monthSignups, as a point; null if not typed. */
  installs: Interval | null;
  d30: Interval | null;            // ret.d30
  paid: Interval | null;           // rev.paid-conversion — null when subscriptions are unticked
  arpa: Interval | null;           // rev.arpa — idem
  churn: Interval | null;          // ret.logo-churn — idem
  /** The month's actives: the shared count appActives, as a point; null if not typed. */
  actives: Interval | null;
  activeRetention: Interval | null; // app.ret.active-retention — null when neither purchases nor ads
  purchases: Interval | null;       // app.rev.purchases-per-active — null when unticked
  ads: Interval | null;             // app.rev.ads-per-active — null when unticked
  commission: Interval | null;      // app.rev.commission — null when neither subscriptions nor purchases
  margin: Interval | null;          // app.rev.gross-margin
  cpi: Interval | null;             // app.acq.cpi
}
export function appInputs(state: EngineState, ctx: EngineCalcContext): AppInputs;
/** The inputs a computed figure reads under this monetization (§21.4.2): the missing list names only these. */
export function appInputsOf(id: AppDerivedId, m: AppMonetization): MetricId[];
```

Chaque valeur se lit par `knownIn(state, id, ctx)` (`known` → sa valeur, sinon
`null`) ; un chiffre que la monétisation ne montre pas vaut `null` sans être
lu. `appInputsOf` : la marge toujours ; avec les abonnements, la conversion en
payant, le revenu par abonné, le churn des abonnés et la commission ; avec les
achats, J30, les achats par actif, la commission et la rétention des actifs ;
avec la pub, J30, la pub par actif et la rétention des actifs ; pour
`install-payback` et `value-to-cost`, le coût par installation en plus. Sans
doublon, dans l'ordre des `inputs` de §21.4.2.

#### 21.5.3 Le scénario d'une app (`buildAppScenario`, APP-4)

```ts
/** What only an app's scenario carries (§21.1 D5). Never set by buildScenario: the SaaS goldens never see the key. */
export interface AppKpis {
  /** The subscriptions' MRR month by month (13 points), null when unticked. */
  subscriptionsPath: Interval[] | null;
  /** Purchases and ads month by month (13 points), null when neither is ticked. */
  usagePath: Interval[] | null;
  newSubscriptions: Interval | null;
  newUsage: Interval | null;
  /** An install's margin over its first twelve months (C92's numerator). */
  value12: Interval | null;
  /** The payback chart's curve: 37 points, months 0 to 36 (`installCumulative`). */
  curve: { lo: number[]; hi: number[] } | null;
  /** The worst case isn't paid back within 36 months: the payback's high bound reads the cap. */
  paybackBeyondCap: boolean;
  /**
   * The usage stream is ticked and the month's actives are not known (an estimated per-active revenue, no count typed):
   * every « il manque » of a usage figure then ends with `io.sharedCount.appActives` (§21.6.4). False without usage.
   */
  activesMissing: boolean;
}
// in scenario.ts, ScenarioKpis gains:  app?: AppKpis;   (declared there, set only by app.ts)

export function appLeverIds(setup: Pick<EngineSetup, "monetization">): readonly PanelLeverId[];  // PanelLeverId: scenario-of.ts
export function buildAppScenario(state: EngineState, targets: Partial<Record<LeverId, number>>, ctx: EngineCalcContext): Scenario;
export function appLeverAlone(state: EngineState, id: LeverId, ctx: EngineCalcContext): Scenario | null;
```

**Les leviers** (`appLeverIds`), dans cet ordre : ceux de `LEVER_IDS` dont le
chiffre est montré (sans abonnements : `acq.signup-rate`,
`ref.referred-share`, `act.rate`, `ret.d30` seulement), puis, s'ils sont
montrés, `app.ret.active-retention`, `app.rev.purchases-per-active`,
`app.rev.ads-per-active`, `app.rev.commission`. Les domaines, dans
`scenario.ts` :
- `MONEY_LEVERS` gagne les deux revenus par actif ; **leur pas est 0,01**
  (`stepOf` : `if (id === "app.rev.purchases-per-active" || id ===
  "app.rev.ads-per-active") return 0.01;`, avant la règle de l'argent), leur
  domaine celui de l'argent (la moitié au double) ;
- `LOWER_IS_BETTER` gagne `app.rev.commission` (de 0 au double, plafonné à 100) ;
- `app.ret.active-retention` suit la règle des taux (la moitié au triple,
  plafonné à 100).

**Le calcul**, colonne par colonne (`today` puis `projected`) ; `v(id)` est
`valueOf(levers, id, projected)` :

1. `levers = leverViews(state, targets, ctx, appLeverIds(setup))` ; `moved` =
   ceux qui ont une cible, dans cet ordre.
2. `base = buildScenario(state, plgTargets, ctx)`, où `plgTargets` garde les
   cibles des leviers de `LEVER_IDS`. Il porte le flux d'abonnements (MRR,
   nouveau MRR, courbe, NRR, GRR) et le funnel du mois.
3. **Les nouveaux actifs** : `base.<colonne>.funnel.d30` quand
   `funnel.perHundred` est faux (les installations du mois sont connues),
   `null` sinon. *C'est D9* : le funnel du libre-service fait déjà varier J30
   avec l'installation, la part recommandée, l'activation et J30.
4. **Le flux d'usage** (si achats ou pub cochés) : `perToday =
   revenuePerActive(m, inputs.purchases, inputs.ads)` ; `perProjected =
   revenuePerActive(m, v(purchases), v(ads))` ;
   `usagePath(inputs.actives, nouveauxActifs, v("app.ret.active-retention"),
   perToday, projected ? perProjected : perToday)`.
5. **Le revenu** : `mrrPath = appRevenuePath(m, base.<col>.kpis.mrrPath,
   usage)` ; `mrr = appRevenueToday(m, base.today.kpis.mrr, usage?.[0] ?? null)`
   (le même dans les deux colonnes, comme le SaaS) ; `newMrr =
   appRevenueToday(m, base.<col>.kpis.newMrr, nouveauxActifs × per<col>)` ;
   `mrr12 = mrrPath?.[12] ?? null` ; `arr = arrOf(mrr)` ; `arr12 =
   arrOf(mrr12)`.
6. **La rétention du revenu** : `nrr` et `grr` de `base` si les abonnements
   sont cochés, sinon `null`.
7. **Le coût par installation** : aujourd'hui `inputs.cpi` ; en projeté, **à
   dépense égale**, `div(inputs.cpi, fInstalls)`, où **`fInstalls =
   div(base.projected.funnel.signups, base.today.funnel.signups)`** : le
   funnel du libre-service fait déjà varier les installations avec le taux
   d'installation et la part recommandée (et vaut 100 sur 100 quand les
   installations du mois manquent : le rapport reste juste). Aucune ligne de
   `buildScenario` n'est recopiée. Un test le tient sur l'exemple : taux
   d'installation 30 → 40 % et part recommandée 5 → 8 %, coût projeté = 1,50
   ÷ (16 521,74 ÷ 12 000) = 1,0895 €. `spend = acquisitionSpend(installs,
   inputs.cpi)`, le même dans les deux colonnes.
8. **L'économie d'une installation** : `margins = installMargins(m, { paidConversion:
   tauxPayant<col>, arpa: v("rev.arpa"), d30: tauxJ30<col>, purchasesPerActive:
   v(purchases), adsPerActive: v(ads), commission: v("app.rev.commission"),
   margin: inputs.margin })`, où `tauxPayant<col> = funnel.paying ÷
   funnel.signups × 100` et `tauxJ30<col> = funnel.d30 ÷ funnel.signups × 100`
   (le funnel du libre-service les a déjà ajustés aux leviers, plafonds
   compris ; sur 100 quand `perHundred`). Puis, avec `churn = v("ret.logo-churn")`
   et `retention = v("app.ret.active-retention")` :
   - `value12 = installValue(margins, churn, retention, 12)` ;
   - `ltv = installValue(margins, churn, retention, 36)` ;
   - `curve = installCumulative(margins, churn, retention)` ;
   - `pb = installPayback(cpi<col>, margins, churn, retention)` ;
     `payback = installPaybackInterval(pb)` ; `paybackBeyondCap = pb?.hi === null` ;
   - `loss = installLossCheck(ltv, cpi<col>)` (D10) ;
   - `ltvCac = valueToCost(value12, cpi<col>)` ;
   - `warning = installPaybackWarning(pb, loss, paybackLimit(state.setup.runwayMonths))` ;
   - `monthlyMargin = margins ? add(margins.subscription, margins.usage) : null` (le premier mois) ;
   - `lifetime = null`, `afterPayback = null`, `cash = null` (D11).
9. **Les hypothèses** : avec les abonnements, celles de `base.assumptions`
   sans `same-spend` (le CAC n'existe pas pour une app) ; **sans les
   abonnements, seulement `signup-same-visitors` et `referral-on-top`** de
   `base.assumptions` (les autres parlent des payants, de l'ARPA, du churn des
   abonnés, de l'expansion ou de la NRR, qu'une app sans abonnements n'a pas ;
   `actives-follow-d30` dit ce que l'activation et J30 font aux actifs). Puis,
   dans cet ordre et seulement quand elles ont servi :
   - `actives-follow-d30` : un levier de flux a bougé et l'usage est coché ;
   - `per-active-all-actives` : un revenu par actif a bougé ;
   - `commission-margin-only` : la commission a bougé ;
   - `same-spend-installs` : `fInstalls ≠ 1` ;
   - `install-months` : `ltv` est calculée ;
   - `usage-twelve-months` : la courbe d'usage est calculée.
   `ScenarioAssumption` gagne ces six ids ; leur texte est en §21.8.4.
10. Le résultat : `{ levers, moved, today: { funnel: base.today.funnel, kpis },
    projected: { funnel: base.projected.funnel, kpis }, assumptions }`, où
    chaque `kpis` est un `ScenarioKpis` complet **avec** `app: AppKpis`.

`appLeverAlone(state, id, ctx)` : comme `leverAlone`, sur `buildAppScenario`.

**Les chiffres que l'exemple doit rendre** sont en §21.9.2 ; ceux du modèle
pur sont déjà épinglés par `app-model.test.ts`.

#### 21.5.4 Le diagnostic d'une app (`diagnose.ts`, `app.ts`, APP-5)

- **`MotionRules`** : le champ `retention: C` devient `retentions: readonly
  C[]` (les candidats classés en argent seulement). `PLG_RULES.retentions =
  ["ret.logo-churn"]`, `SLG_RULES.retentions = ["slg.ret.renewal"]` ;
  `diagnoseWith` lit `rules.retentions.includes(id)` partout où il lisait
  `id === rules.retention` (deux endroits : le choix de la base, et `kind`
  dans `numericImpact`). Le SaaS ne change pas (goldens).
- **`appCandidates(setup): SelfServeCandidateId[]`** (`app.ts`) : les
  `CANDIDATE_IDS` dont le chiffre est montré, dans leur ordre, puis
  `app.ret.active-retention` s'il est montré.
- **`appRules(setup): MotionRules<SelfServeCandidateId>`** (`app.ts`) :
  `motion: "plg"` ; `candidates: appCandidates(setup)` ; `price:
  appRankingImpact` ; `isFlow: (id) => id !== "app.ret.active-retention" &&
  isFlow(id)` (celui d'`impact.ts`, inchangé, enveloppé : il ne prend qu'un
  `PlgCandidateId`, et la comparaison rétrécit le type ; le passer tel quel
  ne compile pas) ;
  `retentions: ["ret.logo-churn", "app.ret.active-retention"]` ;
  `blindWatch` : les ★ de `shapesOf(setup)`, puis `ret.logo-churn` (avec les
  abonnements), puis `app.ret.active-retention` (s'il est montré).
- **`MotionRules`** (`diagnose.ts:99`) n'est pas exporté aujourd'hui : APP-5
  l'exporte (`export interface MotionRules<C>`), et `app.ts` l'importe par
  `import type`.
- **`diagnose(state, ctx)`** (motion `"plg"`) : `isApp(state.setup) ?
  diagnoseWith(appRules(state.setup), state, ctx) : diagnoseWith(PLG_RULES,
  state, ctx)`. La règle qui nomme une étape reste une
  seule fonction (§18.5.2).
- **`appRankingImpact(state, id, target, ctx): { gap?: Interval; mrr?: Interval }`** :

```text
m = la monétisation ; in = appInputs(state, ctx)
perActive = revenuePerActive(m, in.purchases, in.ads)        // null sans usage
si id = app.ret.active-retention :
    si in.activeRetention, in.actives et perActive sont connus :
        rendre { mrr: activeRetentionGain(in.actives, in.activeRetention, target, perActive) }
    sinon rendre {}
sub = rankingImpact(state, id, target, ctx)                   // le libre-service, inchangé
part abonnements = m.subscriptions ? (sub.mrr ?? null) : point(0)
part usage :
    sans usage coché                                    → point(0)
    id ∈ { rev.paid-conversion, ret.logo-churn }        → point(0)
    sinon (un flux) : na = newActivesPerMonth(in.installs, in.d30)
        si sub.gap, na et perActive sont connus         → usageFlowGain(na, sub.gap, perActive)
        sinon                                           → null
argent = appRankingGain(m, part abonnements, part usage)
rendre argent ? { gap: sub.gap, mrr: argent } : sub.gap ? { gap: sub.gap } : {}
```

- **La règle du classement ne change pas** (`diagnoseWith`) : en argent quand
  tous les flux sous leur cible sont chiffrés, sinon en écart relatif ; les
  deux rétentions ne se classent qu'en argent.
- **`subject["app.ret.active-retention"]`** (`engine-copy.ts`,
  `Record<CandidateId, …>`) : « la rétention des actifs » / "active retention".
- **`series.ts`** (la série mensuelle, « Ce qui a bougé ») : l'ensemble
  `CANDIDATES` gagne `app.ret.active-retention`, et **les chiffres comparés
  sont ceux du réglage** : dans `deriveSeries`, la boucle
  `for (const shape of SHAPES[motion])` devient `for (const shape of
  isApp(state.setup) ? shapesOf(state.setup) : SHAPES[motion])` (pour une
  app, `motion` ne vaut que `"plg"`, D1). Sans ça, une app comparerait
  `acq.cac` et `rev.gross-margin`, qu'elle n'a pas, et tairait ses chiffres
  `app.*`. Le SaaS ne change pas.
- **`phrases.ts#notEnoughBelowValues`** (`phrases.ts:281`) cherche l'étape
  sous sa cible parmi `candidatesOf(diagnosis.motion)` : pour une app dont la
  seule étape sous sa cible est `app.ret.active-retention`, la phrase
  tomberait. Elle lit **`Object.keys(diagnosis.positions)`** à la place (les
  clés suivent l'ordre des candidats de la règle, donc celui de
  `candidatesOf` pour le SaaS : rien ne bouge).
- **Les lecteurs de `positions`** (relevés sur `d91ab24`) : dans le code,
  `diagnose.ts:168, 169, 177, 189` (un `!` : `diagnoseWith` vient de les
  poser) et `deck/ask-defaults.ts:49` (le transtypage devient
  `Partial<…>`) ; les douze autres lisent déjà par `?.` ou un transtypage.
  Dans les tests, la liste de §21.10.1. `phrases.ts:68` : `AnyDiagnosis =
  Diagnosis<SelfServeCandidateId> | SlgDiagnosis` (sinon `tsc` signale ~25
  lignes : `Board.tsx`, `BoardNumbers.tsx`, `ExampleView.tsx`,
  `MetricSheet.tsx`, `MotionColumns.tsx`, `deck.ts`, et des tests). `deck.ts`
  (l'aparté de la slide de la fuite, ligne 476) itère sur les clés de
  `positions` au lieu de `CANDIDATE_IDS` (APP-9).
- **Une cible pour la rétention des actifs** : `phrases.ts#isCandidate(id)`
  vaut aussi vrai pour `app.ret.active-retention` (APP-5), ce qui ouvre la
  saisie de sa cible sur l'écran du chiffre (`MetricSheet.tsx`, qui lit
  `isCandidate`). Chaque écran qui propose des cibles boucle sur
  `candidatesFor(setup, motion)` (§21.5.1) au lieu de `candidatesOf(motion)` :
  `TargetsStart.tsx:31, 55` et `settings-numbers.ts:31` (APP-7),
  `MotionColumns.tsx:36` et `Board.tsx:145-148` (`candidateValues`, APP-8),
  `deck/ask-defaults.ts:81` (APP-9), `ExampleView.tsx:127` (APP-10). Pour le
  SaaS, `candidatesFor` rend `candidatesOf` : rien ne bouge.

#### 21.5.5 La dérivation (`derive.ts`, `findings.ts`, `sanity.ts`, `peloton.ts`, APP-6)

- **`derive.ts`** : pour une app, `unit = appUnitEconomics(state, ctx)` au lieu
  de `unitEconomics`, et la clé `app: appDerived(state, ctx)` ; pour le SaaS,
  rien ne change et la clé `app` n'existe pas.
- **`appUnitEconomics(state, ctx): UnitEconomics`** (`app.ts`), depuis
  `buildAppScenario(state, {}, ctx).today.kpis` (appelé directement : passer
  par `scenarioOf` ferait importer `scenario-of.ts` par `app.ts`, qu'il
  importe, un cycle de valeurs) : `ltv` (id
  `app.rev.install-ltv`), `payback` (`app.rev.install-payback`), `ltvCac`
  (`app.rev.value-to-cost`) ; chacun `known` avec la confiance `solid` si
  toutes ses entrées de `appInputsOf` sont connues et `solid`, `approximate`
  sinon ; `uncomputable` avec `missing` = ses entrées de `appInputsOf` non
  connues. `grr` et `nrr` : ceux d'`unitEconomics(state, ctx)` avec les
  abonnements ; sans, `{ kind: "uncomputable", missing: [] }` (jamais
  affichés : §21.6, §21.7). `cacVariant` : la variante d'`app.acq.cpi`.
- **`appDerived(state, ctx): AppDerived`** : `value12` (id
  `app.rev.install-value`, même règle) ; `streams`, depuis `kpis` et
  `kpis.app` d'aujourd'hui, par la règle de `total.ts` (une part connue, ou
  incalculable avec ce qui lui manque ; un total seulement si toutes ses parts
  cochées sont connues, S9). Parts : `now` (le point 0 de chaque courbe ;
  confiance `solid` pour les abonnements si `mrrEnd` est saisi, pour l'usage si
  `appActives` est saisi et chaque revenu par actif coché saisi en comptes ;
  `approximate` sinon) ; `newPerMonth` (`newSubscriptions`, `newUsage`) et
  `in12Months` (le point 12) toujours `approximate`. Manques : abonnements
  `["rev.arpa"]`, `["rev.arpa", "rev.paid-conversion"]`, `["rev.arpa",
  "rev.paid-conversion", "ret.logo-churn"]` ; usage : les revenus par actif
  cochés, puis `ret.d30`, puis `app.ret.active-retention`.
- **`peloton.ts#buildPeloton`** : les colonnes sont celles de
  `PELOTON_METRICS` **montrées** par `shapesOf(setup)` (deux pour une app sans
  abonnements) ; `chainOf` porte sur elles. Le commentaire « always 3 »
  devient « 3, or 2 for an app without subscriptions (§21 D12) ».
  `_engine/Peloton.module.css` : `.columns` passe de `repeat(4, …)` à
  `repeat(var(--peloton-columns, 4), …)`, et `Peloton.tsx` pose
  `--peloton-columns` en style en ligne à `columns.length + 1` (les inscrits,
  puis les colonnes) : 4 pour le SaaS, à l'identique, 3 pour une app sans
  abonnements (APP-8).
- **`coverage.ts`** : `motionCoverage(snapshot, motion, setup?)` compte
  `shapesOf(setup)` pour la motion `"plg"` d'une app ; `setupCoverage` lit
  déjà `shapesOf(setup)` depuis APP-1. `derive.ts:58` lui passe le réglage.
  **L'aperçu d'un fichier importé** compte ailleurs : `ImportPanel.tsx:78`,
  `coverage(snapshot)`, dont la liste par défaut est `METRIC_SHAPES` (« n sur
  17 » pour une app). Il devient `coverage(snapshot, isApp(state.setup) ?
  shapesOf(state.setup) : METRIC_SHAPES)` ; le SaaS ne change pas.
  (`ImportPanel.tsx:211`, dans `previewLine`, ne sert qu'aux fichiers de
  l'assisté : rien à y faire.)
- **Les chiffres masqués ne se lisent pas** (D7 : décocher une façon de
  gagner masque ses chiffres, sans les effacer). Pour une app seulement :
  - `sanity.ts#selfServeChecks` ne lance un contrôle que si tous les ids
    qu'il lit sont dans `shapesOf(setup)` (sans abonnements,
    `paid-gt-retained` et le `churn-high` de `ret.logo-churn` ne partent
    plus, même si leurs chiffres restent stockés) ;
  - `peloton.ts#cohortIsSmall(snapshot, setup?)` gagne un second paramètre
    facultatif : avec une app, il ne regarde que les ids de `COHORT_SIZED`
    montrés par `shapesOf(setup)`. Ses deux appelants le lui passent
    (`peloton.ts:80`, `impact.ts:159`). Sans le paramètre, ou pour le SaaS :
    le comportement d'aujourd'hui.
- **Le miroir du Tour** (`bridge.ts#buildMirror`) : pour une app, il saute
  les ponts dont le chiffre n'est ni dans `shapesOf(setup)` ni dans
  `derivedShapesOf(setup)` (`acq.cac` et `rev.ltv` : une app n'en a pas ;
  sinon `Mirror.tsx` afficherait l'id brut). Pas de pont propre à l'app en v1
  (un choix d'exécution, signalé au bon à tirer A22.d).
- **`findings.ts#selfServeFindings`**, pour une app :
  - `no-definition` et `conflict` bouclent sur les chiffres `"plg"` et `"app"`
    de `shapesOf(setup)` au lieu de `METRIC_SHAPES` ;
  - `unit-econ-uncomputable` : `["app.rev.install-payback", ...missing]` ;
  - `unit-econ-loss` et `…-maybe` : `lossFinding(state, m.unit.ltv,
    "app.acq.cpi", ctx, words, add)` ; `lossFinding` accepte ce troisième id
    et nomme la paire `["app.rev.install-ltv", "app.acq.cpi"]` ;
  - le reste, inchangé.
- **`sanity.ts`**, pour une app :
  - `margin-odd` lit `app.rev.gross-margin` (même id de contrôle, même seuil
    `MARGIN_ODD`) ;
  - **`commission-high`** (nouveau `SanityId`) : `app.rev.commission` connue et
    `lo > COMMISSION_HIGH_PERCENT` (30, dans `catalog-shape.ts` à côté de
    `CHURN_HIGH_PERCENT`) ; texte en §21.8.4 ; « à vérifier », jamais
    bloquant ;
  - `reconcile-gap` ne se déclenche pas (il lit `acq.cac`, qu'une app n'a pas).

---

### 21.6 Les écrans

#### 21.6.1 La carte de départ (`components/engine/EngineStart.tsx`, `_engine/start.ts`, APP-7)

- `StartMotion` est renommé **`StartChoice = "ss" | "sa" | "both" | "app"`** (le
  renommage suit dans `EngineWorkbench.tsx`, `start.ts` et les tests ;
  `data-testid="engine-start-motion"` est gardé).
- **Si `openTypes` ne contient que `"b2b-saas"`**, la carte est **identique à
  aujourd'hui**, au caractère près. Le test qui le garde : `startCopy`
  (aujourd'hui privée, `EngineWorkbench.tsx:867`) **passe dans
  `_engine/start.ts`**, exportée, avec la signature `startCopy(strings,
  locale, choice: StartChoice, today: Date, openTypes: readonly
  BusinessType[], monetization: AppMonetization)` ; elle rend les props
  d'`EngineStart` sans les fonctions. **Avant de la déplacer**, écrire dans
  `start.test.ts` un test qui fige sa sortie d'aujourd'hui pour `ss`, `sa` et
  `both`, en français et en anglais (`toMatchInlineSnapshot()`, rempli par le
  code d'avant) ; après le déplacement, le même test, appelé avec
  `openTypes: ["b2b-saas"]`, reste vert sans toucher au snapshot. La CI
  construit avec le type ouvert : aucun e2e de la CI ne voit la carte fermée,
  ce test unitaire est la garde.
- **Les ids que les e2e lisent ne changent pas**, type ouvert ou non :
  `engine-start`, `#engine-start-motion-ss|sa|both` (et `-app`, neuf),
  `engine-start-plan`, `engine-start-defaults`, `engine-start-go`,
  `engine-start-change`, `engine-start-import`, `engine-start-example`. Avec le
  type ouvert (la CI depuis APP-0), seuls la légende et les libellés des trois
  options du SaaS changent ; le plan et la phrase des défauts de `ss`, `sa` et
  `both` restent mot pour mot (« B2B SaaS, in euros » ; 17, 33…) :
  `engine-collect`, `engine-forms`, `engine-hybrid`, `engine-mobile` et
  `engine-engines` les lisent.
- **Si `"consumer-app"` est ouvert** : la légende devient `start.legendTypes`,
  les options sont `ss` (`start.ssTyped`), `sa` (`start.saTyped`), `both`
  (`start.bothTyped`), `app` (`start.app`, note `start.appNote`), les notes du
  SaaS inchangées.
- **Avec `app` choisi**, sous les options, un groupe de trois cases
  (`Checkbox`, les primitives de formulaire existantes), légende
  `start.appEarnsLegend`, cases `start.appEarns.subscriptions`, `.purchases`,
  `.ads`, cochées au départ selon `DEFAULT_APP_MONETIZATION` (abonnements).
  Aucune cochée : le bouton « Commencer » reste actif, et un clic affiche
  `start.appEarnsNone` sous le groupe (le motif de l'erreur « aucune motion »
  de `Setup.tsx`) sans créer le moteur. **Qui tient quoi** :
  `EngineWorkbench` tient le choix (`startMotion`, renommé `startChoice`), la
  monétisation (`useState<AppMonetization>(DEFAULT_APP_MONETIZATION)`) et
  `startTried` (`useState(false)`, remis à `false` quand le choix ou une case
  change) ; « Commencer » avec `app` et aucune case pose `startTried` et ne
  crée rien.
- **Les props d'`EngineStart`** : `options` et `motion` passent à
  `StartChoice` ; une prop neuve, facultative (absente : rien ne s'affiche,
  la carte du SaaS) :

  ```ts
  /** §21.6.1: the app's three ways of earning, shown when `motion === "app"`. */
  earns?: {
    legend: ReactNode;
    options: readonly { id: "subscriptions" | "purchases" | "ads"; label: ReactNode }[];
    value: AppMonetization;
    onChange: (next: AppMonetization) => void;
    /** `start.appEarnsNone`, set by the caller after a click on « Commencer » with nothing ticked. */
    error?: ReactNode;
  };
  ```

  Ses `data-testid` : `engine-start-earns` (le groupe),
  `engine-start-earns-subscriptions`, `-purchases`, `-ads` (les cases),
  `engine-start-earns-error` (l'erreur).
- Le plan (`start.plan`) se calcule par `startPlan(setup)` (la fonction prend
  le réglage, D3) ; la phrase des défauts est `start.defaultsApp`. **« Voir un
  exemple rempli »** : jusqu'à APP-10, avec `app` choisi, il ouvre l'exemple
  du SaaS (`openExample(motionsOf(choice))`, inchangé) ; APP-10 change la
  signature en `openExample(choice: StartChoice, monetization:
  AppMonetization)` et ouvre l'exemple de l'app (§21.9).
- **`start.ts`** : `motionsOf("app") = { plg: true, slg: false }` ;
  `typeOf(choice): BusinessType` (`"consumer-app"` pour `app`, `"b2b-saas"`
  sinon) ; `startDefaults(choice, monetization, today)` écrit `type`, et
  `monetization` pour une app ; `startPlan(setup)` compte `shapesOf(setup)`.

#### 21.6.2 La carte de réglage et les Réglages (`_engine/Setup.tsx`, APP-7)

- **Les props de `Setup`** gagnent : `openTypes: readonly BusinessType[]` ;
  `startType?: BusinessType` et `startMonetization?: AppMonetization` (le
  choix de la carte de départ, comme `startMotions` aujourd'hui) ;
  `stringsFor?: (type: BusinessType) => EngineStrings` (§21.8.1 : absent,
  `strings` comme aujourd'hui ; présent, `Setup` lit `stringsFor(type)` pour
  tous ses textes) ; `existing.enteredIds: readonly MetricId[]` (les chiffres
  saisis, tout statut sauf « à faire », calculés dans `EngineWorkbench` à côté
  d'`enteredCounts`).
- **Le type devient un état** (`useState<BusinessType>`, depuis
  `initial?.setup.type ?? startType ?? "b2b-saas"`). Le groupe des types,
  **à la création** : `value` = l'état ; `consumer-app` désactivé
  **seulement** s'il n'est pas dans `openTypes` (note `setup.typeLater`) ;
  `marketplace` reste désactivé. **Dans les Réglages** (D7), ce n'est plus un
  `Choices` : `Choices` grise chaque option désactivée en pointillés « pas
  encore », raison obligatoire, ce qui dirait du type actuel qu'il vient plus
  tard. C'est un texte en lecture seule, dans le même `Field` et sous la même
  légende que le groupe, qui dit le type (`setup.types.b2bSaas` ou
  `.consumerApp`), avec `setup.typeFixed` en `hint` ; `data-testid`
  `engine-setup-type-fixed`. Pour le SaaS aussi (une ligne de texte de plus :
  rien ne change dans ce qu'on peut faire).
- **`Setup.start()`** reconstruit le réglage de zéro (`Setup.tsx:219`,
  `type: SETUP_V2_DEFAULTS.type`) : il écrit maintenant `type` (l'état) et,
  pour une app, `monetization` (l'état des trois cases).
- **Type `consumer-app`** :
  - le champ « Comment tu vends » est remplacé par la ligne `setup.appSells`,
    puis les deux fenêtres du libre-service (activation, paiement), mêmes
    contrôles, mêmes ids ;
  - un champ **« Comment l'app gagne de l'argent »** (`setup.appEarnsLegend`),
    les trois cases (`start.appEarns.*`), au moins une (erreur
    `start.appEarnsNone`) ;
  - le nom : `setup.companyLabelApp` ;
  - les outils : `setupToolsFor("consumer-app")` (§21.6.5) ;
  - `onStart` écrit `type: "consumer-app"`, `motions: { plg: true, slg:
    false }` et `monetization`.
- **Dans les Réglages d'une app**, changer la monétisation dit, avant
  l'enregistrement, ce que ça fait (le motif de `motionLines`) : pour chaque
  façon décochée, `settings.streamOffNone` / `streamOffOne` / `streamOff`
  (« {n} » = les chiffres saisis qui se masquent : ceux
  d'`existing.enteredIds` qui sont dans `shapesOf(avant)` et pas dans
  `shapesOf(après)`) ; pour chaque façon cochée, `settings.streamOnOne` /
  `streamOn` (« {n} » = les chiffres qui apparaissent : `shapesOf(après)`
  moins `shapesOf(avant)`). Rien n'est effacé ; une dernière
  façon cochée ne se décoche pas (le motif de `motionLast`).
- **Les actifs du mois dans les Réglages** : `shared-counts.ts#settingsSharedCounts`
  propose un compte partagé quand au moins deux chiffres montrés le portent ;
  il propose **aussi `appActives` quand un seul le porte** (une app avec les
  achats seuls, ou la pub seule), pour qu'une estimation du revenu par actif
  ait ses actifs (§21.4.1). Son libellé suit la règle d'aujourd'hui
  (`settings-numbers.ts` : le libellé du catalogue de son premier chiffre,
  « Actifs en {month} »). Rien ne change pour les comptes du SaaS.
- **Rien ne change pour `b2b-saas`**, ni l'ordre ni les ids des champs.

#### 21.6.3 La validation, l'import, la fusion (APP-0)

- **`validate.ts#setupErrors`**, la chaîne exacte (les messages dans cet
  ordre ; les tests en `toEqual([...])` en dépendent) :

  ```ts
  if (!oneOf(BUSINESS_TYPES, setup.type)) errors.push("setup.type: unknown type");
  const motions = setup.motions;
  if (!isObj(motions) || !isBool(motions.plg) || !isBool(motions.slg)) errors.push("setup.motions: not two booleans (plg, slg)");
  else if (!motions.plg && !motions.slg) errors.push("setup.motions: none ticked");
  else if (setup.type === "consumer-app" && (!motions.plg || motions.slg)) errors.push("setup.motions: a consumer app sells self-serve only");
  // Just after the motions, before the currency:
  if (setup.type === "consumer-app") {
    const m = setup.monetization;
    if (!isObj(m) || !isBool(m.subscriptions) || !isBool(m.purchases) || !isBool(m.ads) || !(m.subscriptions || m.purchases || m.ads)) {
      errors.push("setup.monetization: not three booleans, one at least true");
    }
  } else if (setup.monetization !== undefined) errors.push("setup.monetization: only for a consumer app");
  ```

  Une app sans aucune case cochée reçoit donc « none ticked » seul ; un type
  inconnu avec une `monetization` reçoit les deux messages (« unknown type »,
  puis « only for a consumer app »). `validate.ts` compare le type en clair
  (il fait partie des fichiers permis par la garde 3 de §21.10.1).
- **`validate.ts`**, le reste : `METRIC_IDS` et `ALL_LEVER_IDS` incluent les ids
  de l'app (ils lisent les listes de `catalog-shape.ts`, APP-1 et APP-4) ; une
  valeur de `whatIf` pour un levier `app.*` suit la règle d'aujourd'hui
  (nombre ≥ 0, ≤ 100 pour un pourcentage borné).
- **`io.ts#sellsSomehow`** : un réglage de `BUSINESS_TYPES` dont **toutes**
  les motions cochées sont dans `motionsAllowed(type)`, et au moins une. Elle
  ne lit pas la monétisation. Le test qui refuse `"consumer-app"`
  (`io.test.ts:107-114`) refuse désormais `"marketplace"` ; celui de
  `validate.test.ts:123` (« marketplace » inconnu) reste vrai et ne change
  pas. Les cas suivants s'ajoutent :
  - l'app s'ouvre (`refusal` absent, `errors` vide) ;
  - la place de marché est toujours refusée (`refusal: "unsupported-setup"`) ;
  - une app avec l'assisté coché est refusée (`refusal: "unsupported-setup"`,
    `motionsAllowed` ne l'autorise pas) ;
  - une app **sans monétisation** n'est **pas** refusée : `parseEngineFile`
    rend l'état, sans `refusal`, avec `errors` qui contient
    `"setup.monetization: not three booleans, one at least true"` (l'assertion
    du test porte sur ce message).
- **`merge.ts`** : rien pour le type (deux types différents refusent déjà, avec
  `"type"`). Deux apps de monétisations différentes refusent avec `"motions"`
  (la phrase existante dit qu'ils ne vendent pas de la même façon) ; la
  condition s'ajoute à côté de celle des motions, par une petite fonction
  `sameMonetization(a, b)` qui compare les trois cases de `monetizationOf`.
- **`migrate.ts`**, `storage.ts` : rien.

#### 21.6.4 Le tableau (`_engine/Board.tsx`, `money-view.ts`, APP-8)

`plgBody` ne change pas d'ordre : diagnostic, argent, « Et si », peloton. Ce
qui change pour une app :

- **La bande des deux flux** (`_engine/AppStreamsBand.tsx`, nouveau), rendue
  dans `plgBody` juste avant `BoardMoney`, **seulement** quand l'app a les
  abonnements **et** au moins un flux d'usage. Elle compose le composant
  présentationnel `components/engine/TotalBand.tsx`, sans passer par
  `formatSum` (qui n'imprime rien tant qu'une part manque, et arrondit les
  parts à une unité commune) :
  - `eyebrow` : `appStreams.eyebrow` ; `title` : `appStreams.titlePurchases`,
    `titleAds` ou `titleBoth` selon l'usage coché ; `headingId` :
    `"engine-app-streams-title"` ; `data-testid` : `"engine-app-streams"` ;
  - `engines` : deux lignes, `{ id: "subscriptions", label:
    appStreams.subscriptions }` puis `{ id: "usage", label:
    appStreams.usagePurchases | usageAds | usageBoth }`, chacune avec la part
    `now` de `derived.app.streams` : connue, `factMoney` (le format exact du
    MRR du bloc de l'argent) ; sinon `strings.slide.noNumber` et `missing:
    true` ;
  - `total` : `appStreams.total`, la part `now.total` : connue, `factMoney` ;
    incalculable, `strings.slide.noNumber` et `missing: true` (S9 : jamais une
    part seule présentée comme le total) ;
  - `totals` : `{ key: "new", label: appStreams.newPerMonth }` et `{ key:
    "in12", label: appStreams.in12Months }`, **le total seul**, par
    `formatApproxMoneyInterval` (deux chiffres significatifs, comme `kpiRows` :
    l'exemple imprime « ~43 000 € » dans 12 mois, la même chose que la courbe
    et le panneau) ; une ligne dont le total est incalculable n'est pas
    rendue. Pas de lien, pas de trésorerie.
- **`appKpiInputs(m: AppMonetization)`** (`scenario-view.ts`, à côté de
  `KPI_INPUTS`) : `Record<Exclude<KpiId, "won">, readonly MetricId[]> & {
  value12: readonly MetricId[] }`, chaque liste dans cet ordre (il fixe
  l'ordre de « il manque … ») :
  - `newMrr` : avec les abonnements `rev.arpa`, `rev.paid-conversion` ; puis,
    avec l'usage, `ret.d30`, puis `app.rev.purchases-per-active` et
    `app.rev.ads-per-active` s'ils sont cochés ;
  - `mrr12` : avec les abonnements `rev.arpa`, `rev.paid-conversion`,
    `ret.logo-churn` ; puis, avec l'usage, `ret.d30`, les revenus par actif
    cochés, `app.ret.active-retention` ;
  - `nrr`, `grr` : ceux de `KPI_INPUTS` ;
  - `cac` : `["app.acq.cpi"]` ;
  - `ltv` : `appInputsOf("app.rev.install-ltv", m)` ; `payback` :
    `appInputsOf("app.rev.install-payback", m)` ; `value12` :
    `appInputsOf("app.rev.install-value", m)`.
  **Ses quatre lecteurs** prennent `isApp(state.setup) ?
  appKpiInputs(monetizationOf(state.setup)!) : KPI_INPUTS` là où ils
  prennent `KPI_INPUTS` : `kpiRows` (`scenario-view.ts:181`), `moneyView`
  (`money-view.ts:102`), `leverMoneyView` (`money-view.ts:287`, sa liste
  `mrr12`) et `whatIfFigureGroups` (`whatif-figures.ts:80`).
- **Les actifs qui manquent** (`kpis.app.activesMissing`, §21.5.3) : dans ces
  quatre lecteurs, une figure de revenu (`mrr`, `newMrr`, `mrr12`, `ltv`,
  `payback`, `value12`) inconnue d'une app dont `activesMissing` est vrai dit
  « il manque » suivi de ses entrées manquantes **puis**
  `io.sharedCount.appActives` (« les actifs du mois »), joints par `joinList`
  ; sans entrée manquante, les actifs seuls. Une fonction de
  `scenario-view.ts`, `appMissingPhrase(absent, activesMissing, strings,
  metrics)`, le fait pour les quatre. Les actifs se saisissent dans les
  Réglages (§21.6.2), même quand un seul chiffre les porte.
- **Les types** : `MoneyKpisWithBase` (`money-view.ts:43`) et `Kpis`
  (`whatif-figures.ts:62`) gagnent `app?: AppKpis`.
- **`moneyView(…, "plg")`** pour une app (`money-view.ts`) :
  - `inputs` : `appKpiInputs` (ci-dessus) ; `marginId` vaut
    `app.rev.gross-margin` ;
  - les libellés passent par le calque (`money.mrr`, `money.arr`,
    `money.worthTitle`, `money.healthy`, `money.noLtv`, `money.noCac`,
    `money.noMarginNote`, `money.warn*` : §21.8.4) ;
  - **le temps** : `monthsText` (`money-view.ts:153-157`) ne s'applique pas à
    une app (sa durée de vie vaut `null`) ; une branche à part rend
    `money.monthsApp` (`{ payback }`) quand le verdict n'est pas une perte et
    que `payback` est connu, **suivie**, quand `kpis.app.paybackBeyondCap`,
    d'une espace et de `money.monthsAppBeyond` (deux phrases, une seule
    chaîne) ; rien pour une perte (la phrase du constat suffit) ;
    `monthsTerm` vaut faux ;
  - **la trésorerie** (D11) : `MoneyView.cash.tied` devient `… | null` ; pour
    une app il vaut `null`, `cash.line` vaut `money.lineApp`, `assumptions`
    `null`. **`BoardMoney.tsx:48-67`** construit `facts` sans l'entrée `tied`
    (ni son `<EngineTerm id="cashTied">`) quand `cash.tied` est `null`. Le
    SaaS ne change pas.
- **`scenario-view.ts`** :
  - `kpiRows` pour une app : sans abonnements, les lignes `nrr` et `grr`
    disparaissent ; les libellés passent par le calque.
  - `scenarioFor` → `scenarioOf`, `leverGains` → `leverAloneOf` (§21.5.1).
  - **Le nom d'un levier `app.*`** sur son curseur : le `name` du catalogue,
    comme les autres (`leverRows`, ligne 324) ; ses valeurs en argent passent
    par `formatMoney`, qui imprime déjà les centimes d'un montant non entier
    (« 0,30 € ») : rien à changer.
  - **Un gain exactement nul** : `signed(text, d)` (`scenario-view.ts:256`)
    rend `text` sans signe quand `d === 0` (aujourd'hui « −0 € ») ; le levier
    de la commission seul imprime donc « 0 € » (D13), et la ligne de la somme
    des leviers seuls aussi. Aucun golden ne contient « −0 ».
- **`whatif-figures.ts`** pour une app : `growth` = `newMrr`, puis `nrr` et
  `grr` avec les abonnements ; `customer` = `cac`, **`value12`** (nouvelle
  ligne, `scenario.rowValue12`, depuis `kpis.app.value12`), `ltv`, `ltvCac`,
  `gap`, `payback` (pas de ligne `after`) ; `cash` = la seule ligne `spend`.
  `moneyAssumptions` pour une app : `scenario.assumeLtvApp` quand `ltv` est
  connue ; jamais `assumeCash`. Le ratio (`ltvCac`) se calcule sur les valeurs
  non arrondies, comme le LTV:CAC aujourd'hui : « ~1,40 € » pour 1,50 €
  peut voisiner avec « 0,95 ».
- **`WhatIfPanel.tsx`** : sans abonnements, la ligne `paying` du funnel du mois
  n'est pas rendue. Le reste passe par la couture.
- **`BoardLever.tsx`** : rien (il lit `leverMoneyView`, qui lit `scenarioFor`) ;
  `cardLever` lit les lignes de `leverRows`, donc les leviers de l'app. Le
  levier de la commission n'est la carte que si aucun autre levier n'est
  saisi (`cardLever` prend le levier de l'étape nommée, sinon le premier
  saisi dans l'ordre du panneau, où la commission est la dernière) ; dans ce
  cas, la carte montre ce qu'elle montre pour tout levier qui ne bouge pas le
  revenu. Aucun code de plus.
- **`Board.tsx:145-148`** : `candidateValues` boucle sur `candidatesFor(setup,
  motion)` (§21.5.4), pour que `Diagnosis.tsx` imprime la valeur et « sous ta
  cible » d'une rétention des actifs nommée ; **`MotionColumns.tsx:36`** de
  même.
- **`BoardNumbers.tsx`**, **`number-list.ts`** : `listStages(snapshot,
  diagnosis, motion, setup?)` (`number-list.ts:66`), le réglage en
  **quatrième paramètre facultatif** (son absence garde la règle
  d'aujourd'hui : `golden-v2.test.ts:93` l'appelle à trois) ; il lit
  `metricsOfStageIn(stage, motion, setup)` (D3) ; `BoardNumbers.tsx:73` lui
  passe `state.setup` ; les chiffres `app.*` se rangent dans leur étape.
- **`Peloton.tsx`** : itère sur `peloton.columns` (2 ou 3) et pose
  `--peloton-columns` (§21.5.5) ; le titre « Pour 100 inscrits » passe par le
  calque (« Pour 100 installations »).
- **`BoardHead.tsx`** (la barre) : `workbench.modelShort.app` pour une app.

#### 21.6.5 Les outils (APP-1 pour les ids, APP-2 pour les familles)

- `types.ts` : `ToolId` + `"revenuecat" | "appsflyer" | "adjust"` (APP-1 ; leurs
  libellés `tools.*` « RevenueCat », « AppsFlyer », « Adjust », identiques dans
  les deux langues : les noms d'outils sont exemptés du test « FR ≠ EN »).
- `_engine/sources.ts` : `TOOL_ORDER` gagne les trois, après `"play-console"`
  (APP-1 : `satisfies Record<ToolId, true>` le force) ; `validate.ts#TOOL_SET`
  aussi (APP-1).
- `lib/engine/tools.ts` (APP-2) : **`TOOL_FAMILIES` ne change pas** (les cinq
  familles du SaaS, sans store), donc `SETUP_TOOLS` et `tools.test.ts` non
  plus. Il gagne :

```ts
export type ToolFamily = "mobile" | "analytics" | "billing" | "crm" | "ads" | "other";
/** A consumer app's families (§21.6.5): the stores and the mobile tools first. */
export const APP_TOOL_FAMILIES: readonly { family: ToolFamily; tools: readonly ToolId[] }[] = [
  { family: "mobile", tools: ["app-store-connect", "play-console", "revenuecat", "appsflyer", "adjust"] },
  { family: "analytics", tools: ["ga4", "amplitude", "mixpanel", "posthog"] },
  { family: "ads", tools: ["google-ads", "meta-ads"] },
  { family: "billing", tools: ["stripe"] },
  { family: "other", tools: ["product-db", "spreadsheet"] },
];
/** The families a type's setup lists. b2b-saas: TOOL_FAMILIES, as today. */
export function toolFamiliesFor(type: BusinessType): readonly { family: ToolFamily; tools: readonly ToolId[] }[];
/** The team's tools the engine reads, among the type's offered ones (`type` absent: b2b-saas, today's behaviour). */
export function teamTools(tools: readonly ToolId[] | undefined, type: BusinessType = "b2b-saas"): ToolId[];
```

  `business-type.ts#setupToolsFor(type)` vaut
  `toolFamiliesFor(type).flatMap((f) => f.tools)`. Les appelants de
  `teamTools` qui ont le réglage lui passent `setup.type` ; `Setup.tsx` rend
  les familles de `toolFamiliesFor(setup.type)`, **et ses outils gardés
  (`Setup.tsx:148`, `keptTools`) se calculent sur `setupToolsFor(type)` au lieu
  de `SETUP_TOOLS`** : sinon un outil de l'app (`revenuecat`) compterait comme
  « gardé » **et** comme coché, s'écrirait deux fois, et `validate.ts`
  refuserait le réglage (« a tool listed twice »). Un test de `Setup` le
  garde : une app avec `tools: ["revenuecat"]` enregistrée sans changement
  garde `["revenuecat"]`. `setup.toolFamily.mobile` :
  « Stores et abonnements » / "Stores and subscriptions". `tools.test.ts`
  garde ses deux tests et en gagne un : les familles de l'app, et
  `teamTools(["revenuecat", "chargebee"], "consumer-app")` vaut
  `["revenuecat"]`.

#### 21.6.6 Le graphique de remboursement d'une installation (`lib/viz/install-payback-chart.ts`, `components/engine/InstallPaybackChart.tsx`, APP-9)

**`PaybackChart` ne change pas** : sa géométrie raconte un client qui
rembourse en droite et part à la fin de sa durée de vie ; une installation
rembourse sur une courbe qui ralentit, sans date de départ. Le second récit a
son propre graphique, plus simple, sur la slide de l'économie unitaire d'une
app seulement (`PaybackChart` ne sert qu'aux slides : `SlideUnitEconomics`,
`SlideUnitBoth`).

**La géométrie** (`src/lib/viz/install-payback-chart.ts`, pure, testée) :

```ts
export interface InstallChartInput {
  /** installCumulative (app-model.ts): 37 points, months 0 to 36. */
  curve: { lo: readonly number[]; hi: readonly number[] };
  /** What one install costs (app.acq.cpi), a range when estimated. */
  cost: [number, number];
  /** installPaybackInterval: null for a loss (or no margin). hi = 36 when the worst case is beyond the cap. */
  payback: [number, number] | null;
  story: "pays-back" | "loss";
  width: number;
  height: number;
}
export interface InstallChartGeometry {
  plot: { left: number; right: number; top: number; bottom: number };
  /** The months' ticks: 0, 12, 24, 36. */
  ticks: { month: 0 | 12 | 24 | 36; x: number }[];
  /** The cost: a line at its middle, and a band when it is a range. */
  cost: { y: number; band: { y: number; height: number } | null };
  /** The value of an install month by month: the middle line, and the lo-hi band when they differ. SVG path data. */
  mid: string;
  band: string | null;
  /** Pays back: a tick on the cost line at payback.lo, and a band to payback.hi when they differ. */
  payback: { x: number; xHi: number; y: number } | null;
  /** Loss: the gap at month 36, between the curve's end (its middle) and the cost line. */
  short: { x: number; y1: number; y2: number } | null;
}
export const INSTALL_CHART_PX = { left: 8, right: 16, top: 26, bottom: 44 } as const;
export function installChartGeometry(input: InstallChartInput): InstallChartGeometry;
```

Règles : `x(m) = left + m / 36 × (width − left − right)` ; `yMax = 1,15 ×
max(cost[1], max(curve.hi))` ; `y(v) = height − bottom − v / yMax × (height −
top − bottom)` ; `mid` relie les 37 points `(lo[k] + hi[k]) / 2` ; `band` est le
polygone `lo` (de 0 à 36) puis `hi` (de 36 à 0), `null` quand `lo[k] === hi[k]`
partout ; `cost.y = y((cost[0] + cost[1]) / 2)`, sa bande de `y(cost[1])` à
`y(cost[0])` quand ils diffèrent ; `payback` (story `pays-back`) : `x =
x(payback[0])`, `xHi = x(payback[1])`, `y = cost.y` ; `short` (story `loss`) :
`x = x(36)`, `y1 = y(mid au mois 36)`, `y2 = cost.y`. Tests : l'exemple de
l'app (§21.9.2 : remboursée à 13,01 mois, le tic à `x(13,0132)`), l'app sans
abonnements (perte : `short` posé, `payback` nul), un coût en fourchette.

**Le composant** (`src/components/engine/InstallPaybackChart.tsx` et son
`.module.css`, présentationnel, props seulement, sur le modèle de
`PaybackChart.tsx`) : `geometry`, `labels: { start, end, cost, paysBack,
loss }`, `size?: "md" | "sm"`, `data-testid`. Il dessine, dans cet ordre : la
bande du coût (le motif hachuré de `PaybackChart`), la ligne du coût, la bande
de la courbe (le même motif, plus clair), la courbe (l'encre, jamais le
rouge : S-5, C48), le tic du remboursement et son étiquette `paysBack` sous la
ligne du coût, ou l'accolade `short` et son étiquette `loss` à droite ; les
étiquettes `start` et `end` sous l'axe ; `cost` au-dessus de la ligne du coût,
à gauche. Ses jetons et ses tailles de texte sont ceux de
`PaybackChart.module.css` (recopiés, pas importés). L'export PNG des slides
(`deck/export-png.ts#inlineSvgStyles`) traite déjà tout `<svg>` de la slide :
rien à y ajouter, mais un test d'export le couvre (le motif du test de
`PaybackChart`).

**Les mots** (APP-9) : `start` = `formatNumber(0, locale)` et `end` =
`formatDuration(36, "months", …)`, comme `deck-unit.ts:162-163` ; `cost` =
`slide.chartCost` (le calque de l'app le réécrit en « ce que coûte une
installation ») ; `paysBack` = `slide.installChartPaysBack` ; `loss` =
`slide.installChartLoss` ; et la phrase qui décrit le graphique
(`figcaption`, comme `summary` pour `PaybackChart`) :
`slide.installChartSummaryHealthy` ou `slide.installChartSummaryLoss`
(§21.8.4 b).

### 21.7 Les slides (`deck.ts`, `deck-unit.ts`, `phrases.ts`, `_engine/deck/*`, APP-9)

Le modèle du deck d'une app est celui du libre-service : mêmes slides, même
ordre, mêmes cases cochées par défaut. Ce qui change :

#### 21.7.1 Le peloton

- `pelotonTitle` (`deck.ts:274`) itère sur `peloton.columns.map((c) =>
  c.metric)` au lieu de `PELOTON_METRICS` (même résultat pour le SaaS). Ses
  clauses se lisent aujourd'hui **par position** (`CLAUSES[i]`, `deck.ts:261`)
  : elles se lisent désormais **par chiffre**, `CLAUSES` devenant un record
  `{ "act.rate": ["clauseActivated", "a"], "ret.d30": ["clauseD30", "r"],
  "rev.paid-conversion": ["clausePaid", "p"] }`, et la liste des étapes
  inconnues (`unknown`) se calcule sur les mêmes colonnes. Deux colonnes
  complètes donnent le titre **`pelotonCompleteTwo`** (`{ activated, d30 }`) ;
  les titres `pelotonGap*`, `pelotonTailBreak*` et `pelotonEmpty` servent
  tels quels.
- `pelotonLines` et `SlidePeloton.tsx` itèrent déjà sur `peloton.columns`.

#### 21.7.2 La fuite (`buildLeak`, la chaîne de l'app)

`buildLeak` appelle `appWhatIf` au lieu de `whatIf` pour une app (`app.ts`,
mêmes paramètres, même type de retour `Impact | null`). L'aparté (les autres
candidats et ce qu'ils valent) itère sur les clés de `diagnosis.positions`.

**`appWhatIf(state, candidate, target, ctx, words)`** construit la chaîne
affichée, **à partir des nombres affichés** (la règle de `whatIf` : chaque
ligne se recompte à la calculatrice depuis celle du dessus) :

1. **La rétention des actifs** (`app.ret.active-retention`), `kind:
   "retained-mrr"` :
   - `today` : `whatIf.todayActives` « {retention} des actifs gardés d'un mois sur l'autre, sur {base} actifs » ;
   - `if` : `whatIf.ifFlow` (existant) ;
   - `then` : `whatIf.thenActives` / `thenActivesOne` « {base} × ({target} – {retention}) = {n} actifs gardés de plus par mois » (`count` = n, arrondi) ;
   - `times` : `whatIf.timesActives` « {perActive} par actif, soit {amount} de revenu des actifs préservé chaque mois » ;
   - `annual` : `whatIf.annualApp` avec `amount × twelveMonthFactor(100 − target)`.
2. **Un flux** (`acq.signup-rate`, `act.rate`, `ret.d30`, `ref.referred-share`),
   `kind: "new-mrr"` :
   - avec les abonnements : les lignes `today`, `if`, `then`, `times` de
     `whatIf(state, candidate, target, ctx, words)`, **sans** sa ligne
     `annual` ;
   - sans les abonnements : les mêmes quatre clés, sur les actifs —
     `today` : `whatIf.todayActivesFlow` / `todayActivesFlowOne` « {rate}, soit {n} nouveaux actifs par mois » ;
     `then` : `whatIf.thenFlow` ou `thenReferral` (existants) ; `times` :
     `whatIf.timesActivesFlow` « {perActive} par actif, soit {amount} de revenu des actifs ajouté chaque mois » ;
   - avec les abonnements **et** l'usage, après les quatre lignes :
     `usage-then` : `whatIf.usageThenFlow` « Et {n} nouveaux actifs × {target}/{rate} = {m} (+{delta}) » (ou `usageThenReferral`, « … × (100 – {rate})/(100 – {target}) = … ») ; `usage-times` : `whatIf.timesActivesFlow` ; `sum` : `whatIf.sumApp` « Soit {amount} de revenu ajouté chaque mois. » ;
   - `annual` : `whatIf.annualApp` « Soit {amount} de revenu de plus au bout d'un an, départs compris. », avec `abonnements × twelveMonthFactor(churn) + usage × twelveMonthFactor(100 − rétention des actifs)`, chaque part à partir de son montant affiché.
3. **La conversion en payant et le churn des abonnés** : la chaîne de `whatIf`
   telle quelle (l'usage ne bouge pas), sans sa ligne `annual`, puis
   `annual` (`whatIf.annualApp`, la part des abonnements seule).

`ImpactLine.key` gagne `"usage-then" | "usage-times" | "sum"`.

**Quelle chaîne, pour `chainTemplate`.** `phrases.ts#chainTemplate(line,
impact, words, locale)` choisit aujourd'hui son gabarit par `impact.metric`
et `impact.kind` ; pour une app, deux chaînes de même `metric` et même `kind`
(un flux avec ou sans abonnements) prennent des gabarits différents. `Impact`
gagne donc un champ :

```ts
/** §21.7.2: which of the app's chains `appWhatIf` built; absent for the SaaS (today's templates, unchanged). */
appChain?: "subscriptions" | "actives-flow" | "actives-retention";
```

`appWhatIf` le pose toujours ; `chainTemplate` prend `Pick<Impact, "metric"
| "kind" | "appChain">` et, quand il est là :

| `appChain` | `today` | `then` | `times` | `usage-then` | `usage-times` | `sum` | `annual` |
|---|---|---|---|---|---|---|---|
| `"subscriptions"` (un flux, la conversion ou le churn, avec les abonnements, avec ou sans usage) | comme le SaaS | comme le SaaS | comme le SaaS | `usageThenReferral` pour `ref.referred-share`, `usageThenFlow` sinon | `timesActivesFlow` | `sumApp` | `annualApp` |
| `"actives-flow"` (un flux, sans les abonnements) | `todayActivesFlow` / `…One` (par `numbered`) | `thenReferral` pour `ref.referred-share`, `thenFlow` sinon | `timesActivesFlow` | — | — | — | `annualApp` |
| `"actives-retention"` (`app.ret.active-retention`) | `todayActives` | `thenActives` / `…One` (par `numbered`) | `timesActives` | — | — | — | `annualApp` |

`if` reste `ifFlow` partout. Une clé marquée « — » lève une erreur, comme
`per-month` aujourd'hui ; sans `appChain`, `usage-then`, `usage-times` et
`sum` lèvent aussi. `SlideLeak.tsx` ajoute les trois clés neuves à
`CHAIN_STEPS` (la carte de calcul).

**Le titre** (`impact.ts#impactHeadline`) lit aujourd'hui le montant de la
première ligne `times` : pour une app avec les abonnements et l'usage, ce
serait la part des abonnements seule (~580 €), pas le total (~830 €). Il lit
**d'abord la ligne `sum`** quand elle existe (`if (sum?.values.amount)
return { amount: sum.values.amount }`, avant `times`), puis comme
aujourd'hui. `Impact.mrrPerMonth` = le total affiché. Le titre est
`leakClearMrrNew` ou `leakClearMrrRetained`, avec les mots de l'app
(§21.8).

**L'exemple** (J30 de 12 à 15 %, §21.9) doit imprimer, en français :
« 12 %, soit 360 nouveaux abonnés par mois » · « La rétention à J30 atteint
15 % (cible de l'équipe) » · « 360 × 15/12 = 450 (+90) » · « 6,40 € par
abonné, soit ~580 € d'abonnements ajoutés chaque mois » · « Et 1 440 nouveaux
actifs × 15/12 = 1 800 (+360) » · « 0,70 € par actif, soit ~250 € d'achats et
de pub ajoutés chaque mois » · « Soit ~830 € de revenu ajouté chaque mois. ».
*Les arrondis « ~ » suivent `formatApproxMoneyInterval` (deux chiffres
significatifs) ; APP-9 relève les chaînes réelles dans son journal et
s'arrête si un nombre exact (360, 450, 90, 1 440, 1 800, 360) diffère.*

#### 21.7.3 L'économie d'une installation (`buildUnitEconomics`)

Pour une app, `buildUnitEconomics` lit `scenarioOf(state, {}, ctx).today.kpis`
et `derived.unit` (§21.5.5), et rend :

- **Le titre** : `unitEconomics` (`{ m: payback, x: ltvCac }`, les mots de
  l'app), sinon `unitEconomicsUnknown`, et `unitEconomicsLoss` pour une perte
  (§21.8.4).
- **Les lignes**, dans cet ordre : `cac` (le coût par installation, avec sa
  variante), **`value12`** (nouvelle ligne, `slide.unitValue12`), `ltv`,
  `ltvCac`, `payback` ; puis `retention` (GRR et NRR des abonnements,
  seulement avec les abonnements), `warning`, `assume` (`slide.unitAssumeApp`)
  ; puis `cap` (`slide.unitCap`). **Ni `after` ni `cash`** (D11).
- **Le graphique** : pour une app, la slide ne porte pas `paybackChart` mais
  **`installChart?: SlideInstallChart`** (nouveau champ du type `Slide`, à côté
  de `paybackChart`, dans `types.ts`) : `{ curve, cost, payback, story, labels,
  summary }` (§21.6.6), avec `curve = kpis.app.curve`, `cost = cpi`, `payback
  = kpis.payback` (déjà plafonné à 36 par `installPaybackInterval`), `story` =
  `"loss"` quand `payback` est `null` (le meilleur cas ne rembourse pas en 36
  mois), `"pays-back"` sinon ; `summary` : `installChartSummaryHealthy` (`{
  cpi, payback }`) ou `installChartSummaryLoss` (`{ cpi, ltv, gap }`, `gap` =
  `cpi − ltv` arrondi comme `money.short`) ; absent quand `curve` est `null`
  (pas de marge : la slide garde ses « ? »).
  `SlideUnitEconomics.tsx` rend `InstallPaybackChart` quand `installChart` est
  là, `PaybackChart` sinon, au même endroit.
- **La rangée des tuiles** : celle du SaaS en a six (`styles.figureRowSix`,
  `repeat(6, …)`, `deck.module.css:1156`), celle d'une app cinq (`cac`,
  `value12`, `ltv`, `ltvCac`, `payback`). `.figureRowSix` lit
  `repeat(var(--figure-columns, 6), minmax(0, 1fr))`, et
  `SlideUnitEconomics.tsx` pose `--figure-columns: 5` en style en ligne
  **seulement** quand `installChart` est là (le motif du peloton, §21.5.5) :
  le SaaS ne change pas d'un pixel.
- **`deck-unit.ts`** : la slide d'une app se construit dans une fonction à
  part, `appUnitMoney`, à côté d'`unitMoney` (que le SaaS et l'assisté
  partagent, et qui ne change pas).
- `deck/deck-rows.ts` : `value12` rejoint les lignes `ROW_FIELDS` de la slide
  (son test, `deck-rows.test.ts`, la vérifie contre le vrai `buildDeck`) ;
  `SlideUnitEconomics.tsx` rend sa tuile entre `cac` et `ltv`.

#### 21.7.4 Les « Et si »

- `movedLevers` : `leverIdsOf(state.setup)` et `leverAloneOf` (§21.5.1).
- **Le titre d'un levier** : `whatIfLever` quand le gain sur le revenu dans
  12 mois s'imprime (la règle `isPricedGain` d'aujourd'hui) ; sinon, **pour
  un levier qui ne touche que les marges** (`app.rev.commission`) et dont le
  remboursement change à l'impression : **`whatIfLeverMargin`** `{ stage,
  from, to, payback, paybackToday }` ; sinon `whatIfLeverPlain`.
- `leverSubject` gagne les quatre leviers de l'app (§21.8.4).
- **La slide `scenario`** : ses lignes de chiffres pour une app sont une liste
  à part, `APP_WHATIF_KPI_IDS` (`deck.ts`, à côté de `WHATIF_KPI_IDS`, qui ne
  change pas : `deck-slg.ts:219` la lit aussi) : `mrr12`, `arr12`, `nrr`
  (avec les abonnements), `cac`, `value12` (`kpis.app.value12`, libellé
  `scenario.kpiValue12`), `ltv`, `ltvCac`, `payback` ; jamais `cash`.
  `WhatIfKpiId` gagne `"value12"`. Ses lignes de funnel (`STEP_ROWS`) perdent
  `paying` sans les abonnements.
- `deck.ts:1251` (`starsKnown`) compte les ★ de `shapesOf(state.setup)`.

#### 21.7.5 Le reste

- **L'annexe** imprime la prose de `metricsFor(type)` (§21.4.7), donc « Où le
  trouver » avec App Store Connect et RevenueCat.
- **L'export texte** (`deckMarkdown`) : mêmes règles, mots de l'app.
- **`title-accent.ts`** : rien à écrire (l'encre est le défaut, `RED` est une
  liste explicite qui ne les contient pas) ; `title-accent.test.ts` ne change
  pas.
- **`TITLE_CONTRACT`** (`engine-copy.test.ts`) gagne `pelotonCompleteTwo:
  ["activated", "d30"]` et `whatIfLeverMargin: ["from", "payback",
  "paybackToday", "stage", "to"]`.

---

### 21.8 La copie

#### 21.8.1 Le mécanisme du calque (APP-3)

- **`src/lib/engine/strings.ts`** gagne deux types et une fonction pure :

```ts
export type DeepPartial<T> = T extends string ? T : T extends readonly (infer U)[] ? T : { [K in keyof T]?: DeepPartial<T[K]> };
/** The base with every leaf the overlay carries replaced; arrays replaced whole. Never mutates either. */
export function mergeStrings<T>(base: T, overlay: DeepPartial<T> | undefined): T;
```

- **`src/content/engine-copy-consumer.ts`** (nouveau, serveur seulement,
  `// TODO: à relire — copie neuve (convention 6), §21 (A22 APP-3)` en tête) :

```ts
import type { DeepPartialTranslatable } from "@/lib/i18n/translatable";
import type { ENGINE_COPY } from "./engine-copy"; // type only
export const ENGINE_COPY_CONSUMER: DeepPartialTranslatable<typeof ENGINE_COPY> = { … };
```

  `DeepPartialTranslatable` est **exporté de `src/lib/i18n/translatable.ts`**
  (APP-3 l'y ajoute, à côté de `Translatable`), parce que la place de marché
  s'en sert aussi (§22.8.1) :

```ts
/** A copy tree where any branch may be left out; a leaf is still a whole { fr, en }; an array is replaced whole. */
export type DeepPartialTranslatable<T> = T extends Translatable ? Translatable : T extends readonly unknown[] ? T : { [K in keyof T]?: DeepPartialTranslatable<T[K]> };
```

  Il ne contient **que** les feuilles qui changent. `resolveEngineProps` le
  résout avec `resolveTree` (qui accepte un arbre partiel, à l'exécution comme
  au typage, vérifié le 2026-10-04 ; APP-3 ajoute le test dans
  `translatable.test.ts`, §21.8.3) et le passe en
  `typeStrings: { "consumer-app": DeepPartial<EngineStrings> }`.
- **`EngineWorkbench.tsx`** est **le seul** fichier de l'îlot qui fusionne.
  Il définit une fonction mémoïsée par type,

  ```ts
  const stringsFor = (type: BusinessType): EngineStrings =>
    type === "consumer-app" ? mergeStrings(props.strings, props.typeStrings["consumer-app"]) : props.strings;
  ```

  et calcule `const strings = stringsFor(current.setup.type)` : tout ce qui
  est en dessous reçoit `strings` comme aujourd'hui. **Avant qu'un moteur
  existe, ou pour un autre type que le moteur à l'écran**, l'écran reçoit
  `stringsFor` lui-même (une fonction, pas `typeStrings`) :
  - la carte de réglage (`Setup`) lit `stringsFor(type choisi)` pour ses
    textes, dont `setup.referenceMonthHint` et `setup.cohortHint`, que la
    règle désigne (APP-7) ;
  - l'exemple (`ExampleView`) lit `stringsFor(type de l'exemple)` (APP-10).

  Le test statique de §21.8.3 garde qu'un seul fichier de l'îlot nomme
  `typeStrings`.

#### 21.8.2 Le lexique (FR / EN)

| SaaS B2B | App grand public | Accords, exemples |
|---|---|---|
| inscrit, inscrits (m.) | installation, installations (f.) | « nouvelles installations », « installations recommandées », « 100 installations », « activées », « actives à J30 » |
| inscription | installation | « le taux d'installation » |
| visiteurs, visiteurs uniques | visiteurs de la fiche | « ~333 visiteurs de la fiche pour 100 installations » |
| client(s), client(s) payant(s), payant(s) — *hors économie unitaire* | abonné(s), abonné(s) payant(s) | « nouvel abonné », « abonnés perdus » |
| un (nouveau) client — *dans l'économie unitaire* : `money.*`, `lever.worth*`, `scenario.figuresCustomer`, `scenario.rowGap`, `slide.unit*`, `slide.chart*`, `slideTitles.unitEconomics*`, `findings.unitEcon*` | une installation | « ce que coûte une installation » |
| MRR | revenu | « nouveau revenu », « revenu préservé », « revenu dans 12 mois » ; *mais* dans la chaîne de la fuite d'un abonnement : « abonnements » (« 576 € d'abonnements ajoutés ») |
| ARR | revenu annualisé | — |
| CAC | coût par installation | — |
| LTV | valeur sur 36 mois | — |
| LTV:CAC | valeur sur 12 mois ÷ coût | — |
| CAC payback, payback | remboursement (d'une installation) | — |
| ARPA | revenu par abonné | sur une slide si la place manque : « revenu par abonné » |
| SaaS, ton SaaS | app, ton app | « Nom de ton app » |
| sign-up(s), signed up | install(s), installed | "new installs", "referred installs" |
| visitors | store page visitors | — |
| customer(s), paying customer(s) — *outside unit economics* | subscriber(s), paying subscriber(s) | — |
| a (new) customer — *in unit economics* | an install | "what an install costs" |
| MRR / ARR / CAC / LTV / LTV:CAC / ARPA | revenue / annualised revenue / cost per install / 36-month value / 12-month value ÷ cost / revenue per subscriber | — |

La NRR et la GRR **gardent leur nom** (celles des abonnements, comme dans
RevenueCat) ; « des abonnements » s'ajoute quand la phrase pourrait se lire sur
tout le revenu.

#### 21.8.3 Ce que le calque doit couvrir — la règle, et son test (APP-3)

**La règle.** Pour chaque feuille d'`ENGINE_COPY` hors des chemins exclus
(plus bas), on cherche dans son texte **une fois ses gabarits `{…}` retirés**
(sinon `{cac}` ou `{arpa}` compteraient) :
- en français, sans tenir compte de la casse, `inscrit`, `inscription`,
  `client`, `payant`, `SaaS` ou `visiteur` ; ou, comme mot entier **en
  respectant la casse**, `ARPA`, `MRR`, `ARR`, `CAC` ou `LTV` ;
- en anglais, sans tenir compte de la casse, `sign-up`, `signup`, `signed up`,
  `sign up`, `customer`, `paying`, `SaaS` ou `visitor` ; ou, comme mot entier en
  respectant la casse, `ARPA`, `MRR`, `ARR`, `CAC` ou `LTV`.

Une feuille où l'une des deux langues en contient un : `ENGINE_COPY_CONSUMER`
porte **la même feuille**, réécrite avec le lexique de §21.8.2, sans rien
ajouter ni retrancher au sens. **Les feuilles de §21.8.4 a s'écrivent mot pour
mot**, y compris les feuilles d'accord que la règle ne désigne pas (« Activés »
→ « Activées ») ; une feuille du calque qui les contredit se corrige sur elles.
Mesuré le 2026-10-04 avec ces exclusions : **138 feuilles désignées** (un ordre
de grandeur, pas un critère).

**Une feuille désignée qui ne se réécrit pas par le lexique sans changer de
sens** : ne pas s'arrêter. L'ajouter à `APP_OVERLAY_SKIPPED`, une liste
exportée du test (son chemin, une ligne de commentaire qui dit pourquoi), et
la nommer dans le compte rendu de l'unité : l'orchestrateur la relaie à
Antoine à la pause. Une feuille désignée que l'exécutant croit jamais affichée
pour une app, et qui n'est pas dans les exclusions : il la réécrit quand même
(sans risque), il ne l'exclut pas.

**Les chemins exclus** (ce qu'une app n'affiche jamais). Une feuille est
exclue dès qu'**une** de ces lignes la désigne ; la liste vit dans le test sous
le nom `APP_EXCLUDED`, ligne pour ligne, dans le même ordre.

1. **Les clés de premier niveau** `hybrid`, `total`, `relays`, `pipeline`,
   `slgChain`, `faq`, `meta`, `page`, `start` (la carte de départ porte ses
   clés par type), `tools` et `role` (des noms de métier : « Customer
   Success » reste tel quel).
2. **Un segment du chemin qui contient** `slg`, `Slg`, `hybrid`, `Hybrid`,
   `link`, `Link`, `Plg` ou `Both`, **ou qui commence par** `mkt` (la place de
   marché, §22). Pas `plg` en minuscules : `slide.plgLeakAssumption`, le pied
   de la fuite du libre-service, s'imprime pour une app et se réécrit.
3. **Un segment qui est exactement** `sa`, `saNote`, `saTyped`, `both`,
   `bothNote` ou `bothTyped`.
4. **Le réglage des autres types** (le chemin, et tout ce qui est dessous) :
   `setup.types`, `setup.typeLater`, `setup.motions`, `setup.motionsRequired`,
   `setup.motionPlg`, `setup.motionSlg`, `setup.companyLabel`,
   `settings.motionLast`, `workbench.modelShort`, `example.bannerTitle`,
   `example.company`, `example.bannerBody`, `example.liveEvent`,
   `example.lossCause`, `example.pqlThreshold`.
5. **Ce que seuls l'hybride et l'assisté impriment** :
   `slideTitles.total`, `slideTitles.totalUnknown`,
   `slideTitles.unitEconomicsNoneDifferent`,
   `slideTitles.unitEconomicsNoneMargins`, `slideTitles.unitEconomicsSides`,
   `notes.cycleLong`, `notes.whoCountsWhere`, `notes.whyNotCompare`,
   `notes.selfServeFeeds`, `notes.selfServeLever`, `findings.base` (et ses
   feuilles), `sanity.cacVariantsDiffer`, `scenario.kpiWon`, `scenario.won`,
   `slide.unitSideLoss`, `slide.unitSideUnknown`, `worth.customersQuarter`,
   `worth.customersQuarterOne`, `worth.lessThanOneQuarter`.
6. **Ce que la trésorerie et la durée de vie du SaaS impriment, qu'une app
   n'imprime pas (D10, D11)** : `money.assume*`, `money.line*` sauf
   `money.lineApp`, `money.months*` sauf `money.monthsApp*`,
   `money.slgAnnual`, `money.tied`, `scenario.assumeCash*`,
   `scenario.assumeLtv` et `scenario.assumeLtvSlg`, `scenario.rowCash`,
   `scenario.rowAfter`, `slide.unitFloor*`, `slide.unitBilled*`,
   `slide.unitNotAllBack`, `slide.unitMayNotAllBack`,
   `slide.unitCompanyWide*`, `slide.unitLost*`, `slide.unitLeavesBefore`,
   `slide.unitMayLeaveBefore`, **toutes les feuilles `slide.chart*` sauf
   `slide.chartCost`** (le graphique d'une app est `InstallPaybackChart`,
   §21.6.6), `slide.unitRatioReference`, `slide.unitReference`,
   `slide.unitBothReference`, `terms.cashTied`, `terms.afterPayback`.
7. **Ce qu'une app ne déclenche jamais** : `findings.reconcile`,
   `findings.reconcileOne`, `sanity.reconcileGap`, `sanity.reconcileGapOne`
   (le contrôle lit `acq.cac`, qu'une app n'a pas, §21.5.5).

**Le test** (`src/content/__tests__/engine-copy-consumer.test.ts`), critère
d'acceptation d'APP-3 :
1. **la couverture** : il parcourt `ENGINE_COPY`, applique la règle et
   `APP_EXCLUDED`, et vérifie que chaque feuille désignée existe dans
   `ENGINE_COPY_CONSUMER`, hors `APP_OVERLAY_SKIPPED` ; et que chaque feuille
   de §21.8.4 a y est ; en cas d'échec, il imprime la liste de ce qui manque ;
2. **plus aucun mot du SaaS** : aucune feuille de `mergeStrings(ENGINE_COPY,
   ENGINE_COPY_CONSUMER)` que la règle désigne ne contient encore un mot de la
   règle (cherché comme la règle le cherche : gabarits retirés, acronymes en
   mots entiers et en respectant la casse), **après avoir retiré** les
   expressions cibles du lexique qui en contiennent : `visiteurs de la fiche`,
   `abonné payant`, `abonnés payants` ; `store page visitors`, `paying
   subscriber`, `paying subscribers`. Sauf les exceptions nommées une par une,
   chacune commentée (par exemple une phrase qui dit que le repère ne vaut que
   pour le SaaS) ;
3. **pas de clé orpheline** : chaque feuille du calque existe dans
   `ENGINE_COPY` et a **les mêmes gabarits** (`{…}`) que la feuille qu'elle
   remplace, dans les deux langues ;
4. **les contrats de la copie** : les tests de contrat d'`engine-copy.test.ts`
   s'appliquent **aussi** à la copie fusionnée. APP-3 paramètre sur
   `[ENGINE_COPY, mergeStrings(ENGINE_COPY, ENGINE_COPY_CONSUMER)]`
   (`describe.each`) ses blocs de contrat : `TITLE_CONTRACT`, les longueurs,
   les glyphes des slides, `**`, « de {month} », pas de tutoiement sur les
   slides, les mots bannis, FR ≠ EN. Pas les blocs qui ne lisent que des clés
   exclues (`faq`, `meta`, `stages`, le piège de l'hybride).

Et `src/lib/i18n/__tests__/translatable.test.ts` gagne un test : `resolveTree`
résout un arbre partiel (le calque) sans ajouter de clé.

**Un seul fichier de l'îlot nomme `typeStrings`** : un test de
`src/__tests__/engine-boundary.test.ts` parcourt `reachable(ISLAND)` (les
modules que l'îlot atteint ; `engine-props.ts`, côté serveur, n'en est pas)
et vérifie que seul `app/[locale]/aarrr-funnel-template/EngineWorkbench.tsx`
contient le mot `typeStrings` hors commentaires.

#### 21.8.4 Le texte, mot pour mot

Toute chaîne ci-dessous porte `TODO: à relire` dans le code. La typographie
(U+00A0 avant `:` `;` `%` `€` `?` `!`, après « et avant ») se pose en
recopiant ; `copy-typography.test.ts` la vérifie.

**a. Le calque de l'économie et de la fuite** (`ENGINE_COPY_CONSUMER`, APP-3)

| Feuille | FR | EN |
|---|---|---|
| `money.mrr` | Revenu du mois | Revenue this month |
| `money.arr` | Revenu annualisé, le revenu du mois × 12 | Annualised revenue, the month's revenue × 12 |
| `money.worthTitle` | Ce que vaut une installation | What an install is worth |
| `money.healthy` | Chaque installation coûte {cac} et rapporte {ltv} de marge en 36 mois : {gap} de plus que ce qu'elle coûte. | Each install costs {cac} and brings back {ltv} of margin over 36 months: {gap} more than it costs. |
| `money.noLtv` | On ne peut pas encore dire ce que rapporte une installation : il manque {input}. | We can't yet say what an install brings back: {input} is missing. |
| `money.noCac` | Une installation rapporte {ltv} de marge en 36 mois ; ce qu'elle coûte, on ne le sait pas encore : il manque {input}. | An install brings back {ltv} of margin over 36 months; what it costs, we don't know yet: {input} is missing. |
| `money.noMarginNote` | Sans elle, ni valeur d'une installation ni remboursement : calculés sur le chiffre d'affaires, ils flatteraient ton app. | Without it, no install value and no payback: computed on revenue, they would flatter your app. |
| `money.warnRunway` | Une installation met {payback} à rembourser son coût, plus que ton runway ({n}) : tu gagnes de l'argent, mais peut-être après la fin de ta trésorerie. | An install takes {payback} to pay back its cost, longer than your runway ({n}): you make money, but maybe after your cash runs out. |
| `money.warnRunwayMaybe` | Une installation met {payback} à rembourser son coût : peut-être plus que ton runway ({n}). | An install takes {payback} to pay back its cost: maybe longer than your runway ({n}). |
| `money.warnFloor` | Une installation met {payback} à rembourser son coût : {n} ou plus. Tu gagnes de l'argent, mais tard. Saisis ton runway dans les Réglages pour y comparer ce remboursement. | An install takes {payback} to pay back its cost: {n} or more. You make money, but late. Enter your runway in the Settings to compare this payback with it. |
| `money.warnFloorMaybe` | Une installation met {payback} à rembourser son coût : peut-être {n} ou plus. Saisis ton runway dans les Réglages pour y comparer ce remboursement. | An install takes {payback} to pay back its cost: maybe {n} or more. Enter your runway in the Settings to compare this payback with it. |
| `findings.unitEconLoss` | Chaque installation coûte {cac} et rapporte {ltv} de marge en 36 mois : tu perds {gap} sur chacune. | Each install costs {cac} and brings back {ltv} of margin over 36 months: you lose {gap} on each one. |
| `findings.unitEconLossMaybe` | Une installation coûte {cac} et rapporte {ltv} de marge en 36 mois : elle ne rembourse peut-être pas ce qu'elle coûte. | An install costs {cac} and brings back {ltv} of margin over 36 months: it may not pay back what it costs. |
| `slideTitles.unitEconomics` | Une installation rembourse son coût en **{m}** et rapporte **{x}** ce qu'elle coûte en un an. | An install pays back its cost in **{m}** and brings in **{x}** what it costs within a year. |
| `slideTitles.unitEconomicsUnknown` | **On ne peut pas encore dire ce que rapporte une installation.** Il manque {input}. | **We can't yet say what an install is worth.** Missing: {input}. |
| `slideTitles.unitEconomicsLoss` | Chaque installation nous coûte {cac} et en rapporte {ltv} en 36 mois : **on perd {gap} sur chacune**. | Each install costs us {cac} and brings back {ltv} over 36 months: **we lose {gap} on each one**. |
| `slideTitles.leakClearMrrNew` | Ramener {stage} à {target} vaudrait **{amount} de revenu nouveau** chaque mois. | Bringing {stage} to {target} would be worth **{amount} of new revenue** every month. |
| `slideTitles.leakClearMrrRetained` | Ramener {stage} à {target} vaudrait **{amount} de revenu préservé** chaque mois. | Bringing {stage} to {target} would be worth **{amount} of retained revenue** every month. |
| `slideTitles.leakClearCustomers` | Ramener {stage} à {target} ajouterait **{n} abonnés payants** par mois. | Bringing {stage} to {target} would add **{n} paying subscribers** a month. |
| `slideTitles.leakClearCustomersOne` | Ramener {stage} à {target} ajouterait **{n} abonné payant** par mois. | Bringing {stage} to {target} would add **{n} paying subscriber** a month. |
| `slideTitles.leakClearKept` | Ramener {stage} à {target} garderait **{n} abonnés payants** de plus par mois. | Bringing {stage} to {target} would keep **{n} more paying subscribers** a month. |
| `slideTitles.leakClearKeptOne` | Ramener {stage} à {target} garderait **{n} abonné payant** de plus par mois. | Bringing {stage} to {target} would keep **{n} more paying subscriber** a month. |
| `slideTitles.leakClearPerHundred` | Ramener {stage} à {target} ajouterait **{n} abonnés pour 100 installations**. | Bringing {stage} to {target} would add **{n} subscribers per 100 installs**. |
| `slideTitles.pelotonComplete` | Sur 100 installations, {activated}, {d30} et **{paid}**. | Out of 100 installs, {activated}, {d30} and **{paid}**. |
| `slideTitles.whatIfLever` | Si {stage} passait à {to} (aujourd'hui : {from}), le revenu dans 12 mois gagnerait **{gain}**. | If {stage} went to {to} (today: {from}), revenue in 12 months would gain **{gain}**. |
| `slideTitles.scenario` | Avec les {n} « Et si » ensemble, le revenu dans 12 mois gagnerait **{gain}**. | With the {n} what-ifs together, revenue in 12 months would gain **{gain}**. |
| `whatIf.times` | × revenu par abonné | × revenue per subscriber |
| `whatIf.todayFlow` / `…One` | {rate}, soit {n} nouveaux abonnés par mois / {rate}, soit {n} nouvel abonné par mois | {rate}, i.e. {n} new subscribers a month / {rate}, i.e. {n} new subscriber a month |
| `whatIf.todayPerHundred` / `…One` | {rate}, soit {n} abonnés pour 100 installations / {rate}, soit {n} abonné pour 100 installations | {rate}, i.e. {n} subscribers per 100 installs / {rate}, i.e. {n} subscriber per 100 installs |
| `whatIf.timesFlow` | {arpa} par abonné, soit {amount} d'abonnements ajoutés chaque mois | {arpa} per subscriber, i.e. {amount} of subscriptions added every month |
| `whatIf.todayChurn` | {churn} de churn sur {base} abonnés payants | {churn} churn on {base} paying subscribers |
| `whatIf.thenChurn` | {base} × ({churn} – {target}) = {n} abonnés gardés par mois | {base} × ({churn} – {target}) = {n} subscribers kept a month |
| `whatIf.thenChurnOne` | {base} × ({churn} – {target}) = {n} abonné gardé par mois | {base} × ({churn} – {target}) = {n} subscriber kept a month |
| `whatIf.timesChurn` | {arpa} par abonné, soit {amount} d'abonnements préservés chaque mois | {arpa} per subscriber, i.e. {amount} of subscriptions kept every month |
| `whatIf.lessThanOne` | Moins d'un abonné de plus par mois. | Less than one more subscriber a month. |
| `scenario.kpiMrr12` | Revenu dans 12 mois | Revenue in 12 months |
| `scenario.kpiNewMrr` | Nouveau revenu par mois | New revenue a month |
| `scenario.kpiNrr` | NRR mensuelle des abonnements | Subscriptions' monthly NRR |
| `scenario.kpiGrr` | GRR mensuelle des abonnements | Subscriptions' monthly GRR |
| `scenario.kpiCac` | Coût par installation | Cost per install |
| `scenario.kpiLtv` | Valeur sur 36 mois | 36-month value |
| `scenario.kpiPayback` | Remboursement d'une installation | Install payback |
| `scenario.figuresCustomer` | Une installation | One install |
| `scenario.rowLtvCac` | Valeur sur 12 mois ÷ coût | 12-month value ÷ cost |
| `scenario.rowGap` | Par installation, sur 36 mois | Per install, over 36 months |
| `scenario.aloneTitle` | Ce que chaque levier rapporte seul, sur le revenu dans 12 mois | What each lever brings alone, on revenue in 12 months |
| `scenario.assumption.churn-as-revenue` | Le churn des abonnés tient lieu de churn en revenu, comme si les abonnés partis payaient le revenu moyen. | Subscriber churn stands in for revenue churn, as if the subscribers who left paid the average revenue. |
| `scenario.assumption.arpa-new-customers` | Le nouveau revenu par abonné s'applique aux nouveaux abonnés ; les abonnements déjà là gardent leur prix. | The new revenue per subscriber applies to new subscribers; the subscriptions already there keep their price. |
| `scenario.assumption.twelve-months` | Sur 12 mois, au rythme de ce mois : les abonnements gardés à leur NRR chaque mois, plus les nouveaux abonnements du mois. Ni saisonnalité, ni saturation. | Over 12 months, at this month's pace: the subscriptions kept at their NRR each month, plus the month's new subscriptions. No seasonality, no saturation. |
| `lever.arr12` | Revenu annualisé dans 12 mois | Annualised revenue in 12 months |
| `lever.curveSummary` | Le revenu mois par mois, de {start} aujourd'hui à {today} dans 12 mois au rythme actuel. | Revenue month by month, from {start} today to {today} in 12 months at today's pace. |
| `lever.worthOut` | Une installation : plus de perte. Elle rapporte {ltv} pour {cac} : {gap} de plus. | One install: no longer a loss. It brings back {ltv} for {cac}: {gap} more. |
| `lever.worthMaybe` | Une installation : plus de perte certaine. Elle rapporte {ltv} pour {cac} : les deux fourchettes se chevauchent. | One install: no longer a certain loss. It brings back {ltv} for {cac}: the two ranges overlap. |
| `lever.worthStill` | Une installation : toujours une perte de {gap}. Ce levier ne change ni ce que rapporte une installation ni ce qu'elle coûte. | One install: still a loss of {gap}. This lever changes neither what an install brings back nor what it costs. |
| `slide.chartCost` | ce que coûte une installation | what an install costs |
| `peloton.upstream` | ~{n} visiteurs de la fiche pour 100 installations · {source} · {month} | ~{n} store page visitors per 100 installs · {source} · {month} |
| `peloton.signups` | Installations | Installs |
| `board.pelotonTitle` | Pour 100 installations | Per 100 installs |
| `slide.unitRetention` | GRR {grr} · NRR {nrr} des abonnements par mois — approximatives : le churn des abonnés tient lieu de churn en revenu, comme si les abonnés partis payaient le revenu moyen. | Subscriptions' monthly GRR {grr} · NRR {nrr} — approximate: subscriber churn stands in for revenue churn, as if the subscribers who left paid the average revenue. |
| `slide.plgLeakAssumption["ret.d30"]` | les abonnés sont supposés parmi les installations encore actives à J30 | subscribers are assumed to be among the installs still active at day 30 |
| `slide.plgLeakAssumption["ref.referred-share"]` | les installations recommandées s'ajoutent aux autres et convertissent comme elles | referred installs come on top of the others and convert like them |

**Les feuilles d'accord** (même tableau, même calque) : une installation est
féminine, un inscrit masculin. Ces feuilles ne portent pas toutes un mot de la
règle ; elles s'écrivent quand même, mot pour mot :

| Feuille | FR | EN |
|---|---|---|
| `peloton.activated` | Activées | Activated |
| `peloton.d30` | Actives à J30 | Active at day 30 |
| `peloton.paid` | Abonnées à J{n} | Subscribed by day {n} |
| `peloton.legendReferred` | venues par recommandation ({n}) | came through a referral ({n}) |
| `peloton.unmeasured.paid` | la conversion en abonné | subscriber conversion |
| `scenario.activated` | Activées | Activated |
| `scenario.d30` | Actives à J30 | Active at day 30 |
| `scenario.paying` | Nouveaux abonnés | New subscribers |
| `scenario.referred` | dont recommandées | of which referred |
| `scenario.assumption.activation-drives-downstream` | Les installations actives à J30 et celles qui s'abonnent font partie des installations activées : elles suivent l'activation dans la même proportion, sans jamais la dépasser. | Installs active at day 30 and those that subscribe are among the activated installs: they follow activation in the same proportion, never above it. |
| `subject["rev.paid-conversion"]` | la conversion en abonné | subscriber conversion |
| `leverSubject["rev.paid-conversion"]` | la conversion en abonné | subscriber conversion |
| `settings.paidReset` | La fenêtre de paiement fait partie de la définition de la conversion en abonné : ton chiffre déjà saisi repassera « à faire », pour que tu le remesures sur {n} jours. | The payment window is part of the subscriber conversion's definition: the number you already entered will go back to "to do", so you can measure it again over {n} days. |

L'anglais de trois d'entre elles ne change pas (« Activated », « Active at day
30 », « came through a referral ({n}) ») : le calque porte quand même la
feuille entière, `{ fr, en }`, comme toutes les autres.

*Si une feuille de ce tableau n'existe pas sous ce chemin dans `ENGINE_COPY`
(les chemins sont relevés sur `d91ab24`), chercher la feuille qui porte le
texte SaaS correspondant et la signaler dans le compte rendu ; ne pas créer
de clé.*

**b. Les feuilles neuves d'`ENGINE_COPY`** (elles servent l'app ; le SaaS ne
les affiche pas). Chaque unité ajoute celles qu'elle utilise.

| Unité | Clé | FR | EN |
|---|---|---|---|
| APP-1 | `tools.revenuecat` · `appsflyer` · `adjust` | RevenueCat · AppsFlyer · Adjust | idem |
| APP-1 | `unitInput.*` (six), `io.sharedCount.appActives` | §21.4.5 | §21.4.5 |
| APP-2 | `setup.toolFamily.mobile` | Stores et abonnements | Stores and subscriptions |
| APP-4 | `leverSubject["app.ret.active-retention"]` | la rétention des actifs | active retention |
| APP-4 | `leverSubject["app.rev.purchases-per-active"]` | les achats par actif | purchases per active |
| APP-4 | `leverSubject["app.rev.ads-per-active"]` | la publicité par actif | ads per active |
| APP-4 | `leverSubject["app.rev.commission"]` | la commission des stores | the store commission |
| APP-4 | `scenario.assumption.actives-follow-d30` | Les nouveaux actifs suivent les installations encore là à J30 : ils bougent avec l'installation, la recommandation, l'activation et J30, comme les abonnés. | New actives follow the installs still there at day 30: they move with installs, referral, activation and day 30, like subscribers. |
| APP-4 | `scenario.assumption.per-active-all-actives` | Un revenu par actif qui change joue sur tous les actifs, dès le mois suivant. | A change in revenue per active applies to every active, from the next month. |
| APP-4 | `scenario.assumption.commission-margin-only` | La commission ne change aucun revenu : seulement ce qu'il en reste, donc la valeur d'une installation et son remboursement. | The commission changes no revenue: only what is left of it, so an install's value and its payback. |
| APP-4 | `scenario.assumption.same-spend-installs` | À dépense égale : plus d'installations font baisser le coût par installation dans la même proportion. | Same spend: more installs lower the cost per install in the same proportion. |
| APP-4 | `scenario.assumption.install-months` | Une installation : sa marge baisse chaque mois avec les départs (le churn des abonnés, la rétention des actifs, selon ce qu'elle rapporte), sur 36 mois au plus. | An install: its margin falls every month as people leave (subscriber churn, active retention, depending on what it earns from), over 36 months at most. |
| APP-4 | `scenario.assumption.usage-twelve-months` | Sur 12 mois, les actifs gardés à leur rétention chaque mois, plus les nouveaux actifs du mois, chacun au revenu par actif. | Over 12 months, the actives kept at their retention each month, plus the month's new actives, each at the revenue per active. |
| APP-5 | `subject["app.ret.active-retention"]` | la rétention des actifs | active retention |
| APP-6 | `sanity.commissionHigh` (le bloc de `churnHigh`, `marginOdd`) | Au-delà de 30 %, la TVA ou des frais de paiement sont souvent comptés avec la commission : vérifie. | Above 30%, VAT or payment fees are often counted in with the commission: check. |
| APP-7 | `start.legendTypes` | Qu'est-ce que tu fais tourner ? | What are you running? |
| APP-7 | `start.ssTyped` · `saTyped` · `bothTyped` | SaaS B2B, en libre-service · SaaS B2B, en vente assistée · SaaS B2B, les deux | B2B SaaS, self-serve · B2B SaaS, sales-assisted · B2B SaaS, both |
| APP-7 | `start.app` · `start.appNote` | App grand public · Abonnements, achats intégrés ou pub, sur l'App Store ou Google Play. | Consumer app · Subscriptions, in-app purchases or ads, on the App Store or Google Play. |
| APP-7 | `start.appEarnsLegend` | Elle gagne de l'argent par | It makes money through |
| APP-7 | `start.appEarns.subscriptions` · `purchases` · `ads` | Des abonnements · Des achats intégrés · De la publicité | Subscriptions · In-app purchases · Ads |
| APP-7 | `start.appEarnsNone` | Coche au moins une façon de gagner de l'argent. | Tick at least one way of making money. |
| APP-7 | `start.defaultsApp` | Réglé pour une app grand public, en euros. Mois des chiffres : {month} ; installations suivies : {cohort}. | Set for a consumer app, in euros, on {month}'s figures and {cohort}'s installs. |
| APP-7 | `setup.appSells` | Une app grand public se vend en libre-service. | A consumer app sells self-serve. |
| APP-7 | `setup.appEarnsLegend` | Comment l'app gagne de l'argent | How the app makes money |
| APP-7 | `setup.typeFixed` | Pour changer de type, crée un nouveau moteur. | To change type, create a new engine. |
| APP-7 | `setup.companyLabelApp` | Nom de ton app | Your app's name |
| APP-7 | `settings.streamSubject.subscriptions` · `purchases` · `ads` | Les abonnements · Les achats intégrés · La publicité | Subscriptions · In-app purchases · Ads |
| APP-7 | `settings.streamOffNone` | {stream} : rien n'est saisi, rien ne se perd. | {stream}: nothing is entered, nothing is lost. |
| APP-7 | `settings.streamOffOne` | {stream} : 1 chiffre saisi se masque ; il revient si tu recoches. | {stream}: 1 entered number is hidden; it comes back if you tick it again. |
| APP-7 | `settings.streamOff` | {stream} : {n} chiffres saisis se masquent ; ils reviennent si tu recoches. | {stream}: {n} entered numbers are hidden; they come back if you tick it again. |
| APP-7 | `settings.streamOnOne` | {stream} : 1 chiffre de plus à remplir. | {stream}: 1 more number to fill in. |
| APP-7 | `settings.streamOn` | {stream} : {n} chiffres de plus à remplir. | {stream}: {n} more numbers to fill in. |
| APP-7 | `workbench.modelShort.app` | App grand public | Consumer app |
| APP-8 | `appStreams.eyebrow` | Deux flux | Two streams |
| APP-8 | `appStreams.titlePurchases` · `titleAds` · `titleBoth` | Abonnements et achats · Abonnements et pub · Abonnements, achats et pub | Subscriptions and purchases · Subscriptions and ads · Subscriptions, purchases and ads |
| APP-8 | `appStreams.subscriptions` · `total` | Abonnements · Revenu du mois | Subscriptions · Revenue this month |
| APP-8 | `appStreams.usagePurchases` · `usageAds` · `usageBoth` | Achats intégrés · Publicité · Achats et pub | In-app purchases · Ads · Purchases and ads |
| APP-8 | `appStreams.newPerMonth` · `in12Months` | Nouveau revenu par mois · Revenu dans 12 mois, au rythme actuel | New revenue a month · Revenue in 12 months, at today's pace |
| APP-8 | `money.monthsApp` | Elle rembourse son coût en {payback}, puis continue de rapporter, de moins en moins, à mesure que ses utilisateurs s'en vont. | It pays back its cost in {payback}, then keeps bringing in, less and less, as its users leave. |
| APP-8 | `money.monthsAppBeyond` | Dans le pire des cas, elle ne l'a pas remboursé au bout de 36 mois. | In the worst case, it hasn't paid it back after 36 months. |
| APP-8 | `money.lineApp` | Pas de trésorerie immobilisée pour une app : sa formule suppose qu'une installation rembourse son coût en parts égales, alors que sa marge baisse chaque mois. | No cash tied up for an app: its formula assumes an install pays back its cost in equal parts, while its margin falls every month. |
| APP-8 | `scenario.rowValue12` | Valeur sur 12 mois | 12-month value |
| APP-8 | `scenario.assumeLtvApp` | Valeur d'une installation : sa marge mois par mois, qui baisse avec les départs (le churn des abonnés, la rétention des actifs, selon ce qu'elle rapporte), sur 36 mois au plus. Le ratio se lit sur 12 mois. | An install's value: its margin month by month, falling as people leave (subscriber churn, active retention, depending on what it earns from), over 36 months at most. The ratio is read over 12 months. |
| APP-9 | `slide.installChartPaysBack` | remboursée : {payback} | paid back: {payback} |
| APP-9 | `slide.installChartLoss` | pas remboursée en 36 mois, il manque {gap} | not paid back in 36 months, {gap} short |
| APP-9 | `slide.installChartSummaryHealthy` | Une installation, mois par mois : sa marge baisse à mesure que ses utilisateurs s'en vont ; elle rembourse ses {cpi} à {payback}. | One install, month by month: its margin falls as its users leave; it pays back its {cpi} at {payback}. |
| APP-9 | `slide.installChartSummaryLoss` | Une installation, mois par mois : sa marge baisse à mesure que ses utilisateurs s'en vont ; en 36 mois, elle rapporte {ltv}, {gap} de moins que ses {cpi}. | One install, month by month: its margin falls as its users leave; in 36 months it brings back {ltv}, {gap} short of its {cpi}. |
| APP-9 | `slideTitles.pelotonCompleteTwo`, la feuille de base (le texte du SaaS) | Sur 100 inscrits, {activated} et **{d30}**. | Out of 100 sign-ups, {activated} and **{d30}**. |
| APP-9 | `slideTitles.pelotonCompleteTwo`, **sa réécriture dans `ENGINE_COPY_CONSUMER`**, ajoutée par APP-9 avec la feuille de base (APP-3 ne peut pas l'écrire : sa feuille n'existe pas encore, et le test « pas de clé orpheline » rougirait ; le titre ne se déclenche qu'avec APP-9) | Sur 100 installations, {activated} et **{d30}**. | Out of 100 installs, {activated} and **{d30}**. |
| APP-9 | `slideTitles.whatIfLeverMargin` | Si {stage} passait à {to} (aujourd'hui : {from}), une installation se rembourserait en **{payback}** au lieu de {paybackToday}. | If {stage} went to {to} (today: {from}), an install would pay back in **{payback}** instead of {paybackToday}. |
| APP-9 | `whatIf.todayActives` | {retention} des actifs gardés d'un mois sur l'autre, sur {base} actifs | {retention} of actives kept from one month to the next, out of {base} actives |
| APP-9 | `whatIf.thenActives` / `…One` | {base} × ({target} – {retention}) = {n} actifs gardés de plus par mois / … {n} actif gardé de plus par mois | {base} × ({target} – {retention}) = {n} more actives kept a month / … {n} more active kept a month |
| APP-9 | `whatIf.timesActives` | {perActive} par actif, soit {amount} de revenu des actifs préservé chaque mois | {perActive} per active, i.e. {amount} of revenue from actives kept every month |
| APP-9 | `whatIf.todayActivesFlow` / `…One` | {rate}, soit {n} nouveaux actifs par mois / {rate}, soit {n} nouvel actif par mois | {rate}, i.e. {n} new actives a month / {rate}, i.e. {n} new active a month |
| APP-9 | `whatIf.timesActivesFlow` | {perActive} par actif, soit {amount} de revenu des actifs ajouté chaque mois | {perActive} per active, i.e. {amount} of revenue from actives added every month |
| APP-9 | `whatIf.usageThenFlow` | Et {n} nouveaux actifs × {target}/{rate} = {m} (+{delta}) | And {n} new actives × {target}/{rate} = {m} (+{delta}) |
| APP-9 | `whatIf.usageThenReferral` | Et {n} nouveaux actifs × (100 – {rate})/(100 – {target}) = {m} (+{delta}) | And {n} new actives × (100 – {rate})/(100 – {target}) = {m} (+{delta}) |
| APP-9 | `whatIf.sumApp` | Soit {amount} de revenu ajouté chaque mois. | That's {amount} of revenue added every month. |
| APP-9 | `whatIf.annualApp` | Soit {amount} de revenu de plus au bout d'un an, départs compris. | That's {amount} more revenue after a year, departures included. |
| APP-9 | `slide.unitValue12` | Valeur sur 12 mois | 12-month value |
| APP-9 | `slide.unitAssumeApp` | Une installation : sa marge baisse chaque mois avec les départs ; le remboursement se lit sur cette courbe. | One install: its margin falls each month as people leave; the payback is read on that curve. |
| APP-9 | `scenario.kpiValue12` | Valeur d'une installation sur 12 mois | An install's 12-month value |
| APP-10 | `example.bannerTitleApp` · `example.companyApp` | Exemple : une app grand public fictive · Exemple d'app | Example: a fictional consumer app · Example app |
| APP-10 | `example.eventApp` · `example.channelApp` | a terminé une première séance · Recherche App Store | completed a first session · App Store search |
| APP-10 | `example.churnCauseApp` | l'essai se termine avant la troisième séance | the trial ends before the third session |
| APP-10 | `example.bannerBodyApp` | Chiffres et cibles inventés, pour montrer le funnel et les slides une fois remplis : l'équipe fictive vise {d30} de rétention à J30, {paid} de conversion en abonné et {retention} de rétention des actifs. Rien n'est enregistré, et ça ne touche pas à ton moteur. | Made-up numbers and targets, to show the funnel and the slides once filled in: the fictional team aims for {d30} day-30 retention, {paid} subscriber conversion and {retention} active retention. Nothing is saved, and it doesn't touch your engine. |
| APP-11 | `faqTypeNote.consumerApp` | Il sert aussi les apps grand public : choisis-la sur la carte de départ. | It also works for consumer apps: pick one on the start card. |

---

### 21.9 L'exemple chiffré de l'app (APP-10)

#### 21.9.1 Les entrées (`exampleConsumerMetrics(words)`, `lib/engine/example.ts`)

Une app de méditation guidée fictive, EUR, mois des flux `2026-08`, cohorte
suivie `2026-07`, activation sous 7 jours, paiement sous 30 jours,
`type: "consumer-app"`, `motions: { plg: true, slg: false }`,
`monetization: { subscriptions: true, purchases: true, ads: true }`.
« Aujourd'hui » : le 24 septembre 2026 (`EXAMPLE_TODAY_ISO`).

| Id | Statut · source | Valeur saisie |
|---|---|---|
| `acq.signup-rate` | measured · app-store-connect | 12 000 installations ÷ 40 000 visiteurs de la fiche (août) |
| `acq.top-channel-share` | measured · app-store-connect | 5 400 ÷ 12 000, libellé « Recherche App Store » / "App Store search" |
| `act.event` | measured · produit | « a terminé une première séance » / "completed a first session" |
| `act.rate` | measured · amplitude | 4 025 ÷ 11 500 installations (juillet) |
| `act.ttv` | measured · amplitude | 3 heures, médiane |
| `ret.d30` | measured · amplitude | 1 380 ÷ 11 500 |
| `ret.logo-churn` | measured · revenuecat | 315 perdus ÷ 4 500 abonnés au 1er août |
| `ret.churn-cause` | measured · data, par les données | « l'essai se termine avant la troisième séance » / "the trial ends before the third session" |
| `ref.mechanism` | measured · produit | dans le produit |
| `ref.referred-share` | measured · product-db | 575 ÷ 11 500 |
| `ref.k-factor` | **requested** · data | — |
| `rev.paid-conversion` | measured · revenuecat | 345 ÷ 11 500 |
| `rev.arpa` | measured · revenuecat | 28 800 € de MRR ÷ 4 500 abonnés |
| `rev.expansion` | measured · revenuecat | 284 € ÷ 28 400 € de MRR au 1er août |
| `rev.contraction` | measured · revenuecat | 142 € ÷ 28 400 € |
| `app.acq.cpi` | measured · appsflyer, variante `media-only` | 18 000 € ÷ 12 000 installations (août) |
| `app.ret.active-retention` | measured · amplitude | 13 500 ÷ 15 000 actifs de juillet |
| `app.rev.purchases-per-active` | measured · revenuecat | 4 500 € ÷ 15 000 actifs d'août |
| `app.rev.ads-per-active` | measured · finance | 6 000 € ÷ 15 000 actifs d'août |
| `app.rev.commission` | measured · revenuecat | 7 326 € ÷ 33 300 € encaissés par les stores |
| `app.rev.gross-margin` | measured · finance | 25 579,20 € ÷ 31 974 € de revenu après commission |

`base` : `monthSignups 12 000`, `cohortSignups 11 500`, `mrrEnd 28 800`,
`mrrStart 28 400`, `appActives 15 000`. **Cibles de l'équipe fictive**
(`EXAMPLE_CONSUMER_TARGETS`) : rétention à J30 15 %, conversion en abonné 4 %,
rétention des actifs 92 %. **« Et si » de l'exemple**
(`EXAMPLE_CONSUMER_WHATIF`, une constante d'`example.ts`, jamais posée dans
l'état de l'exemple : `consumerState()` n'a pas de `whatIf`) : rétention à
J30 15 %, commission 15 %. Les tests et l'entrée « avec ses deux « Et si » »
du golden l'appliquent par `{ ...consumerState(), whatIf:
EXAMPLE_CONSUMER_WHATIF }` ou en cibles du scénario.

*Cohérence des entrées* : 33 300 € encaissés = 28 800 € d'abonnements + 4 500 €
d'achats (la pub ne passe pas par les stores) ; 31 974 € = 39 300 € de revenu −
7 326 € de commission.

`exampleEngine(words, motions, type?, monetization?)` : deux paramètres
facultatifs de plus ; avec `"consumer-app"`, il construit ce jeu (et refuse
`motions.slg`). La signature d'aujourd'hui reste valable. `fixtures.ts` gagne
`consumerState()` et `consumerUsageOnlyState()` (le même jeu, monétisation
`{ subscriptions: false, purchases: true, ads: true }`), sur le modèle
d'`exampleState()` et dans la règle de l'en-tête de `fixtures.ts` (des
imports **relatifs**, jamais l'alias `@/` ni un module de contenu :
Playwright importe ce fichier). APP-4 les écrit avec les entrées de §21.9.1
(par `withEntry` et `measured`, sans `exampleEngine`, que l'app n'a pas
encore) ; APP-10 les fait lire `exampleEngine(…, "consumer-app", …)`.

#### 21.9.2 Ce que le moteur doit en sortir

Les chiffres du modèle pur sont épinglés par `app-model.test.ts` ; ceux qui
dépendent du câblage ont été calculés par le script de référence
(`docs/engine/reference/app-example.mjs`, livré avec ce document, qui réécrit la
boucle et les sommes sans code du moteur : `node docs/engine/reference/app-example.mjs`). Les intervalles sont des points
(tout est mesuré).

| Grandeur | Valeur |
|---|---|
| Couverture | 21 chiffres : 20 trouvés, 0 approximatif, 0 introuvable, 1 en cours (demandé) |
| Peloton | ~333 visiteurs de la fiche pour 100 installations ; 5 recommandées ; activées 35, actives à J30 12, abonnées 3 ; chaîne `complete` ; trois colonnes |
| Diagnostic | `shared`, base `mrr`, nommées `ret.d30` puis `rev.paid-conversion` ; prix : `ret.d30` 828 €/mois (576 d'abonnements + 252 d'usage), `rev.paid-conversion` 768 €/mois, `app.ret.active-retention` 210 €/mois (sous sa cible, hors du groupe) ; 828 < 768 × 1,25 = 960 |
| Constats | un `below-comparator` par étape nommée ; aucun constat de perte |
| Contrôles de cohérence | aucun |
| Revenu du mois / annualisé | 39 300 € (28 800 € d'abonnements, 10 500 € d'achats et de pub) / 471 600 € |
| Nouveau revenu du mois | 3 312 € (2 304 € d'abonnements, 1 008 € d'usage) |
| Revenu dans 12 mois / annualisé | 42 677,83 € (32 479,21 € + 10 198,62 €) / 512 133,93 € |
| Courbe (13 points, arrondis) | 39 300 · 39 690 · 40 056 · 40 400 · 40 722 · 41 025 · 41 309 · 41 575 · 41 825 · 42 059 · 42 279 · 42 485 · 42 678 |
| GRR / NRR mensuelles des abonnements | 92,5 % / 93,5 % (approximatives) |
| Coût par installation | 1,50 € ; dépense d'un mois : 18 000 € |
| Marge d'une installation, premier mois | 0,119808 € d'abonnement + 0,060864 € d'usage |
| Valeur sur 12 mois / sur 36 mois | 1,4318 € / 2,1809 € |
| Valeur sur 12 mois ÷ coût | 0,95 |
| Remboursement | 13,01 mois (13,0132) ; pas de perte (`none`) ; pas d'alerte (sous le plancher de 30 mois) |
| Trésorerie immobilisée | aucune (D11) |
| « Et si » : J30 à 15 % et commission à 15 % | revenu dans 12 mois 49 391,72 € (+6 713,89 €) ; nouveau revenu 4 140 € ; coût par installation 1,50 € (installations inchangées) ; valeur sur 12 mois 1,9195 € ; sur 36 mois 2,9287 € ; ratio 1,28 ; remboursement 8,20 mois |
| Courbe de l'« Et si » (arrondie) | 39 300 · 40 518 · 41 649 · 42 701 · 43 678 · 44 586 · 45 430 · 46 215 · 46 946 · 47 625 · 48 257 · 48 845 · 49 392 |
| Chaque levier seul | J30 à 15 % : +6 713,89 € sur le revenu dans 12 mois, remboursement 9,07 mois ; commission à 15 % : +0 € de revenu (D13), remboursement 11,55 mois, titre `whatIfLeverMargin` |
| Hypothèses de l'« Et si » | `d30-drives-paying`, `churn-as-revenue`, `twelve-months`, puis `actives-follow-d30`, `commission-margin-only`, `install-months`, `usage-twelve-months` |
| L'app sans abonnements (`consumerUsageOnlyState`) | 16 chiffres (15 trouvés, 1 en cours) ; peloton à deux colonnes (activées 35, actives à J30 12), titre `pelotonCompleteTwo` ; valeur sur 36 mois 0,5949 € pour 1,50 € : **perte** (`loss`), pas de remboursement, pas d'alerte ; diagnostic `shared` : `ret.d30` (252 €/mois d'usage) et `app.ret.active-retention` (210 €/mois), 252 < 210 × 1,25 = 262,5 ; revenu du mois 10 500 € |

*À vérifier par APP-10 avant d'écrire le golden* : chaque ligne de ce tableau
se retrouve dans `derived`, le scénario ou le deck ; un écart arrête l'unité
(§21.12).

---

### 21.10 Plan de tests

#### 21.10.1 Les tests existants qui changent, et les gardes neuves

Relevés sur `d91ab24` (les tests qui énumèrent les chiffres, les candidats ou
les leviers). Chaque ligne dit l'unité qui le change et **comment** : un test
qui rougit hors de cette liste arrête l'unité (§21.12).

**Une retouche permise, partout** : un test dont **seul l'appel** change parce
qu'une signature a changé (un réglage au lieu des cases, un `!` ou un `?.` sur
`positions`, un argument de type), avec **les mêmes valeurs attendues**, n'est
pas un test qui rougit : l'unité le retouche et le liste dans son entrée du
journal. « Les goldens inchangés » veut dire leurs sorties JSON et
`golden-projection.ts`, pas leurs lignes d'appel.

| Test | Ce qui change | Unité |
|---|---|---|
| `lib/engine/__tests__/catalog-shape.test.ts:137` | l'assertion sur les portées hors `plg`/`slg` compare un **ensemble** : `new Set(…)` vaut `new Set(["link", "app"])` (la liste a sept éléments, un `link` et six `app`) | APP-1 |
| `catalog-shape.test.ts:146-152` | `shapesOf` reçoit des réglages SaaS (`{ type: "b2b-saas", motions }`) ; mêmes comptes (17, 15, 33) | APP-1 |
| `catalog-shape.test.ts:265-272` | `motionOfMetric(id) === (scope === "slg" \|\| scope === "link" ? "slg" : "plg")` | APP-1 |
| `catalog-shape.test.ts` (nouveau bloc) | les comptes de §21.4.1 pour les sept monétisations ; `appShapeShown` ; l'ordre de `shapesOf` d'une app ; `derivedShapesOf` (SaaS et app) ; `UNIT_INPUT_IDS` | APP-1 |
| `content/__tests__/engine-copy.test.ts:65-69` | les clés d'`unitInput` se comparent à `UNIT_INPUT_IDS` (§21.2.3) au lieu de l'union des entrées d'`ALL_DERIVED_SHAPES` | APP-1 |
| `engine-copy.test.ts:44-48` | `subject` couvre `app.ret.active-retention` | APP-5 |
| `engine-copy.test.ts:107-173` | `TITLE_CONTRACT` gagne `pelotonCompleteTwo` et `whatIfLeverMargin` | APP-9 |
| `content/__tests__/engine-catalog.test.ts` | couvre les six chiffres et les quatre calculés de l'app (les records les contiennent) ; aucun `benchmarkCaveat` pour eux ; le `it.each` du plafond gagne `app.rev.install-ltv` | APP-1 |
| `shared-counts.test.ts:15-43` (la parité des libellés) | les places `app.*` d'un groupe se comparent au **catalogue de l'app** : en APP-1, la boucle saute les places `app.*` (une exemption nommée, commentée « catalogue de l'app : APP-2 »), **et saute un groupe dont il ne reste aucune place** (`appActives`, sinon `labels.size` vaut 0) ; en APP-2, un second bloc compare, pour chaque groupe qui contient une place `app.*`, ses libellés lus dans le catalogue de l'app (`ENGINE_CATALOG_CONSUMER` pour les quinze, `ENGINE_CATALOG` pour les `app.*`) : « Installations en {month} » trois fois pour `monthSignups`, « Actifs en {month} » deux fois pour `appActives` | APP-1, APP-2 |
| `shared-counts.test.ts:138` | l'appel `shapesOf({ type: "b2b-saas", motions: { plg, slg } })` | APP-1 |
| `golden-v2.test.ts:94` | l'appel `motionShapes(state.setup)` ; la sortie JSON inchangée | APP-1 |
| `cohort.test.ts:93`, `cohort.ts:110` | **rien** : `defaultMonths` est construit sur `METRIC_SHAPES` et n'a pas de clé `app.*` | — |
| `io.test.ts:107-114` (et des cas neufs dans `validate.test.ts`) | l'app s'ouvre avec sa monétisation ; la place de marché reste refusée ; une app avec l'assisté est refusée ; une app sans monétisation s'ouvre, avec l'erreur `setup.monetization` (§21.6.3). `validate.test.ts:123` ne change pas | APP-0 |
| `_engine/__tests__/collect.test.ts`, `csv.test.ts`, `next-step.test.ts`, `annex-pages.test.ts:90` | l'appel : `shapesOf` / `motionShapes` reçoivent un réglage ; mêmes résultats | APP-1 |
| `diagnose.test.ts` (21 lignes), `diagnose-slg.test.ts` (8), `phrases.test.ts` (4), `sentences-guard.test.ts` (1), `deck/__tests__/ask-defaults.test.ts:49` (1) | `positions` devient `Partial` : un `!` là où le test lit une position qu'il sait présente ; mêmes valeurs | APP-5 |
| `_engine/__tests__/start.test.ts:20-24, 37-41` | `startPlan(setup)` ; `typeOf` ; les comptes du SaaS inchangés ; l'app à 18 (abonnements seuls) | APP-7 |
| `tools.test.ts` | ses deux tests inchangés ; un troisième (§21.6.5) | APP-2 |
| `sentences-guard.test.ts:634-644` | APP-6 : le balayage gagne trois scénarios d'app (`consumerState()`, `consumerUsageOnlyState()`, l'app à commission 35 %), avec `type: "consumer-app"` et `deck: false` (§21.11, APP-6) ; « every finding kind and every sanity check » gagne `commission-high`. APP-9 : les trois scénarios perdent `deck: false`, et « fires every slide title template » voit `pelotonCompleteTwo` et `whatIfLeverMargin` | APP-6, APP-9 |
| `src/__tests__/engine-boundary.test.ts` | la règle 5 ne change pas (elle importe `ENGINE_SETUP_DETAILS`) ; deux tests neufs : le lecteur unique d'`ENGINE_TYPES` (APP-0, §21.3) et « un seul fichier de l'îlot nomme `typeStrings` » (APP-3, §21.8.3) | APP-0, APP-3 |
| `src/lib/analytics/__tests__/goatcounter-api.test.ts:347, :394` | **ses valeurs changent** (pas une retouche d'appel) : la liste des chemins gagne `engine_setup/app` ; `setup` gagne `app: 0` | APP-7 |
| `golden-v1.test.ts`, `golden-v2.test.ts` | **leurs sorties ne bougent pas** : ils restent verts sans toucher à `golden-projection.ts` (seule une ligne d'appel peut changer, ci-dessus) | toutes |

**Les gardes neuves** (`src/lib/engine/__tests__/business-type.test.ts`) :
1. *(APP-0)* `openTypesWith` (vide, inconnu, doublons, espaces, ordre ; le nom
   inconnu du test est `"unknown-type"`, jamais `"marketplace"`, que §22
   ajoute aux types connus) ;
   `motionsAllowed` ; `monetizationOf`.
2. *(APP-2)* `displayShapeOf` rend la même référence pour `b2b-saas` et pour un
   id `app.*` ; les retraits et l'ajout de repère de §21.4.3 ; la garde
   statique des lectures de forme (§21.4.3).
3. *(APP-4)* **qui lit le type** : un balayage des fichiers de `src/` (hors
   tests) qui échoue si `setup.type ===` ou `.type === "consumer-app"`
   apparaît hors de `setup-type.ts`, `business-type.ts`, `scenario-of.ts`,
   `validate.ts`, `io.ts`, `merge.ts`, `migrate.ts` et `example.ts`. Partout ailleurs, on
   appelle `isApp(setup)` ou `monetizationOf(setup)`.
4. *(APP-4)* l'invariance du SaaS : pour l'exemple SaaS, l'exemple hybride et
   200 états SaaS tirés au hasard (graine fixe), `scenarioOf` rend
   **exactement** `buildScenario` et `leverAloneOf` `leverAlone`
   (`toEqual`) ; et la clé `app` n'existe pas (`expect("app" in
   kpis).toBe(false)`, pour `today` et `projected` : `toEqual` ne voit pas
   une clé qui vaut `undefined`).

**Les tests des unités de calcul** (`src/lib/engine/__tests__/app.test.ts`,
APP-4 à APP-6) : chaque ligne de §21.9.2 qui relève de l'unité, sur
`consumerState()` et `consumerUsageOnlyState()` ; `fInstalls` (la garde de
§21.5.3, point 7) ; `appInputsOf` pour les sept monétisations ; les leviers
de l'app (domaine, pas de 0,01) ; `appRankingImpact` pour chaque candidat ;
`diagnose` de l'exemple (`shared`, les trois prix) ; `appUnitEconomics` et
`appDerived` (les flux, S9 : un flux coché inconnu laisse le total
incalculable) ; les constats et les contrôles de l'app.

#### 21.10.2 Le golden de l'app (APP-10)

`golden-consumer.test.ts`, sur le modèle de `golden-v2.test.ts` : entrées
`golden-consumer-inputs.json` (l'exemple ; l'exemple sans cibles ; l'exemple
avec ses deux « Et si » ; l'app sans abonnements ; un moteur app vide),
sortie `golden-consumer.json`, écrite **une fois** avec
`ENGINE_GOLDEN_CONSUMER_WRITE=1` : `derived` entier, `deck`, `markdown`,
`scenario` (`scenarioOf` avec `whatIf`), en français et en anglais. **Avant
d'écrire le golden**, APP-10 vérifie que chaque nombre de §21.9.2 y est ; un
écart arrête l'unité.

#### 21.10.3 E2E (Playwright, build de production, aperçu propriétaire, APP-11)

`e2e/engine-consumer.spec.ts`, sur le modèle d'`engine-hybrid-journey.spec.ts`,
en français à 1 280 px et en anglais à 390 px :
1. la carte de départ propose « App grand public » ; la choisir montre les trois
   cases, abonnements cochés ; tout décocher puis « Commencer » affiche
   « Coche au moins une façon de gagner de l'argent. » et ne crée rien ;
2. cocher les trois, commencer, passer les cibles : la barre dit « App grand
   public » ; la liste des chiffres dit « Taux d'installation », « Coût par
   installation », « Achats par actif », « Commission des stores » ;
3. l'écran d'`acq.signup-rate` propose d'abord App Store Connect et Google Play
   Console ; celui de `ret.d30` montre le repère 20 à 30 %, « pour situer » ;
   celui de `ret.logo-churn` n'en montre aucun ;
4. l'exemple de l'app : le titre du peloton dit « Sur 100 installations » ;
   l'argent dit 39 300 € ; la bande des deux flux dit 28 800 € et 10 500 € ; le
   remboursement d'une installation dit 13 mois ; aucune trésorerie
   immobilisée, et la phrase `money.lineApp` ;
5. les Réglages d'une app : le type est grisé avec « Pour changer de type, crée
   un nouveau moteur. » ; décocher la publicité affiche la phrase
   `settings.streamOff*` avant l'enregistrement ; après, « Publicité par actif »
   n'est plus dans la liste ; la recocher la ramène avec sa valeur ;
5 bis. une app avec les achats : l'écran de « Rétention des actifs » propose
   une cible ; la poser à 95 % ; le tableau la montre, et si elle est nommée,
   le diagnostic imprime sa valeur et « sous ta cible » ;
6. l'import d'un fichier « app » ; la fusion d'un fichier « app » dans un
   moteur SaaS est refusée avec la phrase existante ;
7. la FAQ de la page (sans JavaScript) : la cinquième réponse contient
   « Il sert aussi les apps grand public » ;
8. **build sans `ENGINE_TYPES`** (spec « type fermé », comme les specs « jeu
   fermé ») : la carte de départ est celle d'aujourd'hui, « App grand public »
   est grisée dans la carte complète, et la phrase de la FAQ est absente.
   **La CI ne la fait jamais tourner** (elle construit avec
   `ENGINE_TYPES=consumer-app`) : la spec saute quand le type est ouvert, sur
   le motif inversé de `test.skip(!GAME_OPEN, …)` de `game-flag.spec.ts`, et
   ne se lance qu'en local, sur un build sans la variable ; le compte rendu
   d'APP-11 dit qu'elle a tourné. Dans la CI, la garde de ce cas est
   unitaire : le test de `startCopy` (§21.6.1) et `openTypesWith("")` (garde
   1 de §21.10.1).

Et les specs existantes étendues : `engine-screens.spec.ts` (la carte de départ
à quatre options et ses cases, le tableau d'une app, passés à axe et aux
largeurs 1 280, 390 et 320), `engine-canary.spec.ts` (un parcours app où chaque
champ libre est rempli, et aucune requête ne le transporte),
`engine-deck.spec.ts` (le deck de l'exemple de l'app : la courbe de
remboursement, pas de pointillé de 12 mois, pas de tuile de trésorerie).

#### 21.10.4 Non-vacuité, à mesurer à la livraison de chaque unité (`TESTING.md` §1.2)

| Sabotage | Ce qui doit rougir | Unité |
|---|---|---|
| `appShapeShown` qui montre la commission avec la pub seule | les comptes de §21.4.1 | APP-1 |
| `displayShapeOf` qui copie l'objet au lieu de le rendre pour le SaaS | « même référence » | APP-2 |
| Une feuille désignée retirée du calque | `engine-copy-consumer.test.ts`, point 1 | APP-3 |
| `scenarioOf` qui pose `kpis.app` pour le SaaS | l'invariance du SaaS ; golden v2 | APP-4 |
| Les nouveaux actifs qui ne suivent pas J30 (le funnel d'aujourd'hui en projeté) | la courbe de l'« Et si » de §21.9.2 | APP-4 |
| `fInstalls` calculé autrement que le funnel | la garde de §21.5.3, point 7 | APP-4 |
| La part d'usage comptée pour la conversion en payant | le diagnostic de l'exemple (`shared` → `clear`) | APP-5 |
| `retentions` qui oublie `app.ret.active-retention` (classée en écart) | le prix de la rétention des actifs | APP-5 |
| La perte lue sur 12 mois au lieu de 36 | le constat de l'exemple (perte à tort) | APP-6 |
| La colonne « abonnés » gardée sans abonnements | APP-6 : `peloton.columns.length` vaut 2 (le titre n'existe pas encore) ; APP-9 : le titre `pelotonCompleteTwo` | APP-6, APP-9 |
| `sum` ignoré par `impactHeadline` (le titre lit la part des abonnements) | le titre de la fuite de l'exemple (~830 €, pas ~580 €) | APP-9 |
| Un chiffre masqué lu par un contrôle (`paid-gt-retained` sans abonnements) | le test de §21.5.5 (les chiffres masqués) | APP-6 |
| `keptTools` calculé sur `SETUP_TOOLS` | le test de `Setup` (un outil de l'app écrit deux fois) | APP-2 |
| `ENGINE_TYPES` ignoré par la page | e2e 1 ; e2e 8 en local | APP-11 |
| `money.lineApp` jamais affichée (la trésorerie du SaaS calculée) | e2e 4 | APP-8, APP-11 |
| `installChart` posé sur la slide d'un SaaS | golden v2 | APP-9 |
| Un gain nul imprimé « −0 € » | le test de `signed` ; le levier de la commission seul | APP-8 |
| `candidateValues` qui boucle encore sur `candidatesOf` | e2e 5 bis (la cible de la rétention des actifs) | APP-8, APP-11 |

---

### 21.11 L'exécution : douze unités

Le format des fiches, les rôles, le prompt d'une unité et ce que
l'orchestrateur vérifie avant de merger sont dans
[`executer-un-type.md`](executer-un-type.md) (§23). **Toutes les unités** ont
en commun :
- **Acceptation commune** : `npx tsc --noEmit`, `npx eslint .`, `npx vitest
  run` verts ; les goldens v1 et v2 inchangés **sans** toucher à
  `golden-projection.ts` ; l'entrée de l'unité à la fin de `JOURNAL.md` ; la
  case de l'unité cochée dans `CHANTIERS.md` A22 ; toute chaîne neuve marquée
  `TODO: à relire`.
- **Pause commune** : le type est fermé en production tant qu'`ENGINE_TYPES`
  n'y est pas posé ; une unité mergée ne change rien de visible pour le SaaS.

#### Le graphe

```text
APP-0 ─► APP-1 ─┬─► APP-2 ─► APP-3 ─────────────┐
                └─► APP-4 ─► APP-5 ─► APP-6 ─────┴─► APP-7 ─► APP-8 ─► APP-9 ─► APP-10 ─► APP-11
```

Les deux branches (la copie : APP-2, APP-3 ; le calcul : APP-4 à APP-6)
peuvent avancer en parallèle **si la session peut pousser deux branches** ;
avec une branche imposée, dans l'ordre APP-2, APP-3, APP-4, APP-5, APP-6.
**Points d'arrêt naturels** : après APP-1 (les chiffres existent), après APP-6
(le modèle est complet, rien d'affiché), après APP-9 (les écrans et les slides
sont là), après APP-11 (fini, reste le bon à tirer).

| Unité | Ce qu'elle livre | Prérequis | Relecteurs | Jours-agent |
|---|---|---|---|---|
| APP-0 | le type, le drapeau, le fichier | — | sécurité (props de la page) | 1 |
| APP-1 | les chiffres de l'app : formes, listes, `shapesOf(setup)`, comptes partagés, prose des six et des quatre | APP-0 | copie | 2 |
| APP-2 | la forme affichée et la prose des quinze, les outils, `typeCatalogs` | APP-1 | copie | 1,5 |
| APP-3 | le calque de copie | APP-2 | copie | 2 |
| APP-4 | le scénario de l'app et la couture | APP-1 | — | 2 |
| APP-5 | le diagnostic de l'app | APP-4 | copie (`subject`) | 1 |
| APP-6 | la dérivation, les constats, les contrôles, le peloton | APP-5 | copie (`commissionHigh`) | 1,5 |
| APP-7 | la carte de départ, le réglage, les Réglages, l'événement | APP-3, APP-6 | copie, sécurité | 1,5 |
| APP-8 | les écrans de l'argent, la bande des deux flux, la cible de la rétention des actifs | APP-7 | copie | 2 |
| APP-9 | les slides, et le graphique de remboursement d'une installation | APP-8 | copie | 2,5 |
| APP-10 | l'exemple et le golden | APP-9 | copie | 1 |
| APP-11 | la phrase de la page, les e2e, la documentation | APP-10 | copie, sécurité | 1,5 |

Total ≈ **19,5 jours-agent** (C92 en annonçait ~16 ; le graphique de
remboursement d'une installation et le calque de l'économie unitaire en
ajoutent trois et demi). Puis **A22.d**, le bon
à tirer de toute la copie neuve (`/bon-a-tirer`, depuis `grep -rn "TODO: à
relire" src/`), puis l'ouverture par Antoine.

---

#### APP-0 — Le type, le drapeau, le fichier

- **But** : un fichier « app » se valide, s'importe et se stocke ; le build sait
  quels types sont ouverts. Rien d'affiché ne change.
- **À lire** : §21.1 (D1, D7, D8), §21.2.1 (le bloc APP-0), §21.2.2 (le bloc
  APP-0), §21.3, §21.6.3 ; le code : `types.ts:48-60, 303-342`, `access.ts`,
  `validate.ts:259-297`, `io.ts:41-102`, `merge.ts:37-66`, `page.tsx`,
  `engine-props.ts`, `EngineWorkbench.tsx` (ses props),
  `src/__tests__/engine-boundary.test.ts` (son dernier test),
  `src/__tests__/helpers/import-graph.ts`, `.github/workflows/ci.yml`,
  `.env.local.example`, `GITHUB.md` (avant le workflow).
- **Fichiers** : `src/lib/engine/types.ts`, `setup-type.ts` et
  `business-type.ts` (nouveaux), `access.ts`, `validate.ts`, `io.ts`, `merge.ts`,
  `src/app/[locale]/aarrr-funnel-template/page.tsx`, `engine-props.ts` (son
  type de retour), `EngineWorkbench.tsx` (la prop seulement),
  `.github/workflows/ci.yml`, `.env.local.example`,
  `src/__tests__/engine-boundary.test.ts`, leurs tests.
- **Étapes** :
  1. `types.ts` : `BusinessType`, `EngineSetup.monetization` (§21.2.1).
  2. `setup-type.ts` et `business-type.ts` : les blocs APP-0 de §21.2.2.
  3. `access.ts` : `engineTypesFlag`, `openTypesWith`, `openTypesAtBuild`.
  4. `validate.ts`, `io.ts`, `merge.ts` : §21.6.3.
  5. `page.tsx` → `openTypes` ; `EngineWorkbenchProps.openTypes` (lu nulle part
     encore) ; `resolveEngineProps` rend `Omit<EngineWorkbenchProps,
     "openTypes">` (§21.3).
  6. `ci.yml` : `ENGINE_TYPES: "consumer-app"` dans le bloc `env:` ;
     `.env.local.example`.
  7. Tests : `business-type.test.ts` (garde 1 de §21.10.1 ; chaque
     `import` de `setup-type.ts` est un `import type` ; `access.ts` n'atteint
     ni `business-type.ts` ni `catalog-shape.ts`, §21.2.2) ;
     `engine-boundary.test.ts` (le lecteur unique d'`ENGINE_TYPES`, §21.3) ; `validate.test.ts`,
     `io.test.ts`, `merge.test.ts` (une app valide ; sans monétisation ; avec
     l'assisté ; la place de marché toujours refusée ; deux apps de
     monétisations différentes refusées avec `"motions"`).
- **Acceptation** : commune. Depuis cette unité, **toute la suite Playwright
  de la CI tourne avec `ENGINE_TYPES=consumer-app`** : rien n'y change avant
  APP-7 (la carte de départ ne lit `openTypes` qu'à partir d'elle).
- **Arrêt** : un test existant hors de §21.10.1 rougit ; `ci.yml` demande plus
  qu'une ligne.
- **Relecteurs** : sécurité (une prop de plus vers le client).
- **Pause** : rien de visible.

#### APP-1 — Les chiffres de l'app

- **But** : les six chiffres et les quatre calculés existent, avec leur prose ;
  `shapesOf` prend le réglage ; une app montre ses chiffres selon sa
  monétisation. Aucun écran ne l'utilise encore, et les props du SaaS ne
  gagnent rien.
- **À lire** : §21.1 (D2, D3, D12, D14), §21.2.1 (APP-1), §21.2.3, §21.2.4,
  §21.4.1, §21.4.2, §21.4.4, §21.4.5, §21.10.1 (les lignes APP-1) ; le code :
  `catalog-shape.ts` (en entier), `shared-counts.ts`, `coverage.ts`,
  `phrases.ts:130-145` (`UNIT_INPUTS`), `engine-props.ts:20-35`,
  `validate.ts:75-94` (`TOOL_SET`), `_engine/sources.ts`,
  `content/engine-catalog.ts:56-130` (les types et une entrée),
  `content/engine-copy.ts` (`unitInput`, `io.sharedCount`, `tools`).
- **Fichiers** : `types.ts`, `catalog-shape.ts`, `shared-counts.ts`,
  `coverage.ts`, `phrases.ts` (`UNIT_INPUT_IDS`), `engine-props.ts` (le
  filtre), `validate.ts` (`TOOL_SET`), `_engine/sources.ts` (`TOOL_ORDER`),
  `content/engine-catalog.ts`, `content/engine-copy.ts` (`unitInput`,
  `io.sharedCount.appActives`, `tools.*`), les appelants de `shapesOf` et
  `motionShapes` (la liste ci-dessous), et les fichiers que `tsc` signale
  parce qu'un `Record<MetricId | DerivedId | ToolId | SharedCount, …>` veut
  ses nouvelles clés (relevé : `engine-copy.ts`, `engine-catalog.ts`,
  `shared-counts.ts`, `sources.ts`, `validate.ts`) ; leurs tests.
- **Les appelants de `shapesOf` et `motionShapes`** (relevés sur `d91ab24`,
  24 lignes) : `deck.ts` (cinq), `EngineWorkbench.tsx` (cinq),
  `BoardHead.tsx` (deux), `sanity.ts`, `coverage.ts`, `TableEntry.tsx`,
  `MetricSheet.tsx`, `deck/ask-defaults.ts`, `settings-numbers.ts`,
  `start.ts` ; dans les tests : `catalog-shape.test.ts` (cinq),
  `collect.test.ts` (quatre), `next-step.test.ts` (deux), `csv.test.ts`,
  `annex-pages.test.ts`, `shared-counts.test.ts`, `golden-v2.test.ts`. Là où
  l'état est à portée : `shapesOf(state.setup)` (ou le réglage de l'appelant).
  Là où seules les cases le sont (`start.ts#startPlan(motions)`,
  `settings-numbers.ts`) : `shapesOf({ type: "b2b-saas", motions })`, jusqu'à
  APP-7 qui leur passe le réglage. Dans les tests, **l'appel seul change**
  (`{ type: "b2b-saas", motions: { plg, slg } }`), jamais une valeur attendue :
  c'est une retouche permise (§21.10.1).
- **Étapes** :
  1. `types.ts` : `AppMetricId`, `MetricId`, `AppDerivedId`, `DerivedId`,
     `SharedCount`, `ToolId`, `UnitInputId` (§21.2.1, bloc APP-1).
  2. `catalog-shape.ts` : `scope`, `APP_METRIC_SHAPES` (§21.4.1),
     `APP_DERIVED_SHAPES` (§21.4.2), `ALL_*`, `APP_REPLACED`,
     `SUBSCRIPTION_METRICS`, `SetupShapes`, `appShapeShown`, `shapesOf(setup)`,
     `motionShapes(setup)`, `metricsOfStageIn(…, setup?)`, `derivedShapesOf`,
     `UNIT_INPUT_IDS` (§21.2.3) ; `phrases.ts` lit `UNIT_INPUT_IDS`.
  3. Les appelants (la liste ci-dessus). Mécanique ; le SaaS rend exactement
     la même liste.
  4. `shared-counts.ts` : §21.2.4.
  5. `coverage.ts` : `motionCoverage(snapshot, motion, setup?)` (§21.5.5).
  6. `engine-props.ts` : les props `metrics` et `derived` du SaaS **filtrent**
     les formes `scope === "app"` et les calculés dont l'id commence par
     `app.` (APP-2 les remplace par `typeCatalogs`) ; un test fige leurs
     comptes (33 chiffres, 8 calculés).
  7. `validate.ts` : `TOOL_SET` gagne `revenuecat`, `appsflyer`, `adjust` ;
     `_engine/sources.ts` : `TOOL_ORDER` les gagne après `"play-console"`
     (§21.6.5 ; `satisfies Record<ToolId, true>` les exige dès APP-1).
  8. La prose : §21.4.4 et §21.4.5, dans `engine-catalog.ts` ; `unitInput`,
     `io.sharedCount.appActives`, `tools.*` dans `engine-copy.ts`.
  9. Les tests de §21.10.1 (lignes APP-1).
- **Acceptation** : commune ; plus les comptes de §21.4.1 ; les comptes des
  props SaaS (33, 8) ; et `git diff origin/main --
  src/lib/engine/__tests__/golden-v2.json` vide.
- **Arrêt** : un `Record<…>` dont la valeur pour un id `app.*` n'est ni donnée
  ici ni évidente par la règle de §21.10.1 ; une chaîne de §21.4.4 qui dépasse
  sa longueur (`engine-catalog.test.ts`) ; une source citée qui n'existe plus
  (annexe).
- **Relecteurs** : copie.
- **Pause** : rien de visible (les props SaaS ne gagnent pas les ids `app.*`).

#### APP-2 — La forme affichée et la prose des quinze

- **But** : une app affiche ses sources, ses repères et ses mots de catalogue ;
  l'îlot reçoit le catalogue de l'app.
- **À lire** : §21.1 (D6, D14), §21.2.2 (APP-2), §21.4.3, §21.4.6, §21.4.7,
  §21.6.5 ; le code : les cinq points de lecture de §21.4.3,
  `engine-props.ts`, `_engine/view.ts`, `lib/engine/tools.ts`,
  `content/engine-catalog.ts` (l'en-tête : ses règles d'écriture).
- **Fichiers** : `business-type.ts`, `_engine/sources.ts`, `MetricSheet.tsx`,
  `deck-unit.ts` (la lecture du repère), `engine-props.ts`, `_engine/view.ts`,
  `EngineWorkbench.tsx` (`metricsFor`/`derivedFor`), `lib/engine/tools.ts`,
  les appelants de `teamTools` (`EngineWorkbench.tsx:192`, `Setup.tsx:147` et
  `:230`, `MetricSheet.tsx:280`, `ValueEditor.tsx:127`,
  `MissingTriage.tsx:211` : ils passent `setup.type`), `Setup.tsx` (les
  familles de `toolFamiliesFor`), `content/engine-catalog-consumer.ts`
  (nouveau), `content/engine-copy.ts` (`setup.toolFamily.mobile`),
  `shared-counts.test.ts` (le second bloc de parité, §21.10.1), leurs tests.
- **Étapes** :
  1. `DISPLAY_OVERRIDES`, `displayShapeOf`, `displayDerivedShapeOf`,
     `setupToolsFor` (§21.2.2, §21.4.3, §21.6.5).
  2. Les cinq points de lecture passent par `displayShapeOf`.
  3. `engine-catalog-consumer.ts` (§21.4.6), recopié tel quel.
  4. `typeCatalogs` (§21.4.7) ; `metricsFor`, `derivedFor`.
  5. Les outils : `APP_TOOL_FAMILIES`, `toolFamiliesFor`, `teamTools(tools,
     type)` et leurs appelants (§21.6.5).
  6. Tests : `engine-catalog-consumer.test.ts` (nouveau) applique au
     catalogue de l'app les règles d'`engine-catalog.test.ts`. Ces règles
     sont écrites au niveau du module sur `ENGINE_CATALOG` et
     `ALL_*_SHAPES` : **les extraire** en une fonction
     `catalogRules(name, catalog, derivedCatalog, shapes, derivedShapes)`
     dans `src/content/__tests__/engine-test-helpers.ts` (qui déclare ses
     `describe` et ses `it`), qu'`engine-catalog.test.ts` appelle avec le
     catalogue du SaaS (ses tests gardent leurs noms et leurs assertions :
     une retouche d'appel) et `engine-catalog-consumer.test.ts` avec
     `ENGINE_CATALOG_CONSUMER` et les formes **affichées**
     (`displayShapeOf(id, "consumer-app")`), pour que la règle « restates
     every range » vérifie le 20-30 % neuf de `ret.d30` contre le terme
     `retention`. Et : chaque outil de `where` dans
     `displayShapeOf(id, "consumer-app").sources`. Puis la garde 2 de
     §21.10.1 ; le second bloc de parité de `shared-counts.test.ts` ;
     `tools.test.ts` (dont le test de `Setup` de §21.6.5) ;
     `src/__tests__/content-fan-in.test.ts` gagne une ligne de `BUDGETS`
     pour `content/engine-catalog-consumer.ts` (`max: 1`, la page du moteur
     seule) ; le poids du HTML mesuré (§21.4.7).
- **Acceptation** : commune ; le poids écrit au journal.
- **Arrêt** : le poids dépasse +25 ko gzip (§21.4.7) ; un point de lecture
  hors de la liste de §21.4.3 dont la bonne lecture n'est pas évidente.
- **Relecteurs** : copie.
- **Pause** : rien de visible (le type est fermé, la carte de départ ne le
  propose pas encore).

#### APP-3 — Le calque de copie

- **But** : un moteur app lit la copie de l'écran et des slides dans ses mots.
- **À lire** : §21.8 en entier ; le code : `lib/engine/strings.ts`,
  `lib/i18n/translatable.ts` (`resolveTree`), `engine-props.ts`,
  `EngineWorkbench.tsx` (où `strings` descend), `content/engine-copy.ts` (pour
  appliquer la règle), `content/__tests__/engine-copy.test.ts`.
- **Fichiers** : `strings.ts`, `lib/i18n/translatable.ts`
  (`DeepPartialTranslatable` exporté), `content/engine-copy-consumer.ts`
  (nouveau), `engine-props.ts`, `EngineWorkbench.tsx` (`stringsFor`),
  `engine-copy.test.ts` (paramétré),
  `content/__tests__/engine-copy-consumer.test.ts` (nouveau),
  `lib/engine/__tests__/strings.test.ts`,
  `lib/i18n/__tests__/translatable.test.ts`,
  `src/__tests__/engine-boundary.test.ts` (le test « un seul fichier nomme
  `typeStrings` »), `src/__tests__/content-fan-in.test.ts` (une ligne de
  `BUDGETS` pour `content/engine-copy-consumer.ts`, `max: 1`).
- **Étapes** :
  1. `DeepPartial`, `mergeStrings` et leurs tests (feuille remplacée, tableau
     remplacé entier, base jamais mutée, calque vide = base) ;
     `DeepPartialTranslatable` exporté de `translatable.ts`.
  2. Écrire d'abord le test de §21.8.3 : il liste les feuilles désignées.
  3. `ENGINE_COPY_CONSUMER` : le tableau de §21.8.4 a mot pour mot, puis chaque
     autre feuille désignée par le lexique de §21.8.2.
  4. `typeStrings` en props ; `stringsFor` et la fusion unique dans
     `EngineWorkbench.tsx` (§21.8.1).
  5. Paramétrer les tests de contrat sur la copie fusionnée (§21.8.3, point
     4) ; le test de `translatable.test.ts` ; le test « un seul fichier » ;
     la ligne de `BUDGETS`.
- **Acceptation** : commune ; le test de §21.8.3 vert sur ses quatre points ;
  le nombre de feuilles du calque écrit au journal, et `APP_OVERLAY_SKIPPED`
  listée dans le compte rendu, vide ou non ; le poids du HTML mesuré.
- **Arrêt** : une feuille de §21.8.4 a introuvable sous son chemin ; le poids
  d'APP-2 et APP-3 ensemble dépasse +25 ko gzip ; un test de contrat qui
  rougit sur une feuille de §21.8.4 a (le texte mot pour mot ne tient pas un
  contrat : la session principale le reprend).
- **Relecteurs** : copie.
- **Pause** : rien de visible.

#### APP-4 — Le scénario de l'app et la couture

- **But** : `scenarioOf` rend, pour une app, le scénario de §21.5.3 ; le SaaS
  est identique.
- **À lire** : §21.1 (D4, D5, D9, D10, D11, D13), §21.5.1, §21.5.2, §21.5.3,
  §21.9 ; le code : `scenario.ts` (en entier), `money.ts`, `app-model.ts`,
  `stream.ts`, `catalog-shape.ts` (`LEVER_IDS`), `values.ts` (`knownIn`),
  `shared-counts.ts` (`knownSharedCount`).
- **Fichiers** : `types.ts` (`AppLeverId`, `LeverId`), `catalog-shape.ts`
  (`APP_LEVER_IDS`, `ALL_LEVER_IDS`), `scenario.ts` (`AppKpis`,
  `ScenarioKpis.app`, `ScenarioAssumption`, `MONEY_LEVERS`, `LOWER_IS_BETTER`,
  `stepOf`), `app.ts` (nouveau), `scenario-of.ts` (nouveau, sans
  `candidatesFor`, qui vient en APP-5), `example.ts`
  (`EXAMPLE_CONSUMER_WHATIF`), `__tests__/fixtures.ts`,
  `content/engine-copy.ts` (`leverSubject`, `scenario.assumption` : §21.8.4 b),
  `src/lib/engine/__tests__/app.test.ts` (nouveau), `business-type.test.ts`.
- **Étapes** :
  1. Les types et les listes ; `validate.ts` lit `ALL_LEVER_IDS` (rien à
     écrire si la liste suit).
  2. `app.ts` : `appInputs`, `appInputsOf`, `appLeverIds`, `buildAppScenario`,
     `appLeverAlone` (§21.5.2, §21.5.3), en important `app-model.ts`.
  3. `scenario-of.ts` (§21.5.1). **Ne pas encore** brancher les appelants
     (APP-8, APP-9).
  4. La copie de §21.8.4 b (APP-4).
  5. Tests : les lignes de §21.9.2 du scénario (revenu, courbes, « Et si »,
     chaque levier seul, hypothèses, l'app sans abonnements) sur
     `consumerState()` — APP-4 crée `consumerState()` et
     `consumerUsageOnlyState()` dans `fixtures.ts` à partir de §21.9.1 (un état
     vide au réglage de l'exemple, puis `withEntry`), et
     `EXAMPLE_CONSUMER_WHATIF` dans `example.ts` ; le coût par installation
     projeté (§21.5.3, point 7 : 1,0895 €) ; les hypothèses d'une app sans
     abonnements (§21.5.3, point 9) ; `activesMissing` (une app aux achats
     estimés, sans actifs saisis) ; les gardes 3 et 4 de §21.10.1.
- **Acceptation** : commune ; chaque nombre de §21.9.2 qui relève du scénario.
- **Arrêt** : un nombre de §21.9.2 qui ne sort pas (après avoir vérifié les
  entrées) ; le SaaS qui change d'un bit (garde 4) ; une modification de
  `app-model.ts` qui semblerait nécessaire.
- **Relecteurs** : aucun (pas de copie visible ; les hypothèses passent au bon
  à tirer).
- **Pause** : rien de visible.

#### APP-5 — Le diagnostic de l'app

- **But** : une app classe ses fuites avec ses deux flux et sa rétention des
  actifs.
- **À lire** : §21.5.4 ; le code : `diagnose.ts` (en entier), `impact.ts`
  (`rankingImpact`, `isFlow`, `newPayersPerMonth`), `types.ts`
  (`Diagnosis`), `series.ts:215-230`, les 17 lecteurs de `positions`
  (`grep -rn "positions\[" src`).
- **Fichiers** : `types.ts` (`AppCandidateId`, `SelfServeCandidateId`,
  `CandidateId`, `Diagnosis.positions`, `EngineDerived.diagnosis`,
  `MotionDerived`), `diagnose.ts`, `app.ts` (`appCandidates`, `appRules`,
  `appRankingImpact`), `scenario-of.ts` (`candidatesFor`), `phrases.ts`
  (`isCandidate`, `AnyDiagnosis`, `notEnoughBelowValues`), `series.ts`
  (`CANDIDATES`, les chiffres comparés), `deck/ask-defaults.ts:49` (le
  transtypage), les fichiers que `tsc` signale ensuite (§21.5.4 en donne la
  liste relevée), les tests de §21.10.1 (lignes APP-5),
  `content/engine-copy.ts` (`subject`), `app.test.ts`.
- **Étapes** :
  1. Les types ; `positions` devient `Partial` ; `AnyDiagnosis` (§21.5.4) ;
     corriger les lecteurs par `?.` ou `!` là où la présence est garantie
     (dans `diagnoseWith`), sans changer leur logique, et les tests listés en
     §21.10.1 (le `!` seul).
  2. `retentions` (§21.5.4).
  3. `appCandidates`, `appRules`, `appRankingImpact` ; `diagnose` choisit par
     `isApp`.
  4. `candidatesFor` (§21.5.1) ; `isCandidate` vrai pour
     `app.ret.active-retention` (§21.5.4) ; aucun écran ne l'appelle encore
     (APP-7 à APP-10).
  5. `subject` ; `series.ts` ; `notEnoughBelowValues` (§21.5.4) ;
     `MotionRules` exporté.
  6. Tests : le diagnostic de l'exemple et de l'app sans abonnements (§21.9.2) ;
     la série d'une app sur deux mois ne compare que `shapesOf(setup)` ;
     `notEnoughBelowValues` nomme `app.ret.active-retention` quand elle est la
     seule sous sa cible ;
     chaque candidat de `appRankingImpact` ; `candidatesFor` (SaaS : égal à
     `candidatesOf` ; app : `appCandidates`) ; le SaaS inchangé (goldens).
- **Acceptation** : commune ; `shared`, 828 / 768 / 210 ; l'app sans abonnements
  `shared`, 252 / 210.
- **Arrêt** : un lecteur de `positions` dont la logique devrait changer.
- **Relecteurs** : copie (`subject`).
- **Pause** : rien de visible.

#### APP-6 — La dérivation, les constats, les contrôles, le peloton

- **But** : `deriveEngine` d'une app rend son économie par installation, ses
  deux flux, son peloton (deux ou trois colonnes), ses constats et ses
  contrôles.
- **À lire** : §21.1 (D10, D11, D12), §21.2.1 (`AppDerived`), §21.5.5 ; le
  code : `derive.ts`, `unit-economics.ts`, `total.ts` (la règle des parts),
  `peloton.ts`, `findings.ts:89-260`, `sanity.ts:89-171`, `sentences.ts:140-150`.
- **Fichiers** : `types.ts` (`AppDerived`, `EngineDerived.app`, `SanityId`),
  `derive.ts`, `app.ts` (`appUnitEconomics`, `appDerived`), `peloton.ts`
  (`cohortIsSmall`), `impact.ts` (l'appel de `cohortIsSmall`, ligne 159),
  `coverage.ts`, `bridge.ts` (`buildMirror`), `_engine/ImportPanel.tsx`
  (ligne 78), `findings.ts`, `sanity.ts`, `sentences.ts`,
  `catalog-shape.ts` (`COMMISSION_HIGH_PERCENT`), `content/engine-copy.ts`
  (`sanity.commissionHigh`), `app.test.ts`, `sentences-guard.test.ts`.
- **Étapes** : §21.5.5 dans l'ordre ; puis les tests :
  - les lignes de §21.9.2 de la dérivation ; `commission-high` déclenché et
    non déclenché ; le peloton à deux colonnes (`peloton.columns.length`
    vaut 2 sans abonnements) ; sans abonnements, `paid-gt-retained` ne part
    pas même avec ses chiffres stockés ; le miroir d'une app sans ligne
    `acq.cac` ;
  - **le balayage de `sentences-guard.test.ts`**, sans le deck : il gagne
    trois scénarios d'app, `consumerState()`, `consumerUsageOnlyState()`, et
    « l'app, commission à 35 % » (`withEntry(consumerState(),
    "app.rev.commission", measured(ratio(11_655, 33_300),
    tool("revenuecat")))`, qui déclenche `commission-high`). Chaque scénario
    du tableau `SCENARIOS` gagne deux champs facultatifs : `type?:
    "consumer-app"`, qui fait lire à `sweep()` les props de l'app
    (`strings: mergeStrings(p.strings, p.typeStrings["consumer-app"])`,
    `metrics: p.typeCatalogs["consumer-app"].metrics`, `derived:
    p.typeCatalogs["consumer-app"].derived`), et `deck?: false`, qui lui
    fait sauter `buildDeck` et `deckMarkdown` (le deck d'une app casserait
    avant APP-9 : `deck.ts:476` et `pelotonTitle`) ; les trois scénarios de
    l'app portent `deck: false`, qu'APP-9 retire. Le test « fires every
    finding kind and every sanity check » gagne `"commission-high"`.
- **Acceptation** : commune ; couverture 21 (20, 0, 0, 1) et 16 ; la valeur, le
  remboursement et le ratio de §21.9.2 dans `derived.unit` et `derived.app`.
- **Arrêt** : un lecteur des trois colonnes du peloton (`columns[2]`) qui
  casserait à deux.
- **Relecteurs** : copie.
- **Pause** : **le modèle est complet** ; rien d'affiché.

#### APP-7 — La carte de départ, le réglage, les Réglages, l'événement

- **But** : quand le type est ouvert, on crée un moteur app, on choisit ce
  qu'il gagne, et on le change dans les Réglages.
- **À lire** : §21.1 (D7), §21.6.1, §21.6.2, §21.8.4 b (APP-7) ; le code :
  `components/engine/EngineStart.tsx`, `_engine/start.ts`,
  `_engine/Setup.tsx` (en entier), `EngineWorkbench.tsx:180-260, 580-640,
  860-940`, `_engine/BoardHead.tsx:100-110`, `lib/analytics/goatcounter.ts:330-345`,
  `src/app/(app)/admin/stats/EngineSection.tsx`,
  `src/lib/analytics/__tests__/goatcounter-api.test.ts:340-400`,
  `components/core/Choices.tsx` (ses options désactivées),
  `scripts/engine-density.capture.ts` (l'en-tête : les captures).
- **Fichiers** : ceux-là, `_engine/TargetsStart.tsx` et
  `_engine/settings-numbers.ts` (les cibles par `candidatesFor`, §21.5.4 ;
  `settingsNumbers` reçoit le réglage au lieu des cases),
  `lib/engine/shared-counts.ts` (`settingsSharedCounts` et `appActives`,
  §21.6.2), `content/engine-copy.ts` (APP-7), leurs tests.
- **Étapes** :
  1. Le test qui fige `startCopy` (§21.6.1), **avant** tout changement.
  2. §21.6.1 (dont `startCopy` déplacé, les props d'`EngineStart`,
     `startTried`) ; §21.6.2 (dont les props de `Setup`, le type en lecture
     seule dans les Réglages, `Setup.start()`, `enteredIds`).
  3. Les cibles (`TargetsStart`, les Réglages) par `candidatesFor(setup,
     motion)` ; `workbench.modelShort.app` dans la barre.
  4. L'analytique : `ENGINE_SETUP_DETAILS` gagne `"app"` ;
     `engineSetupDetail(setup)` (`lib/analytics/goatcounter.ts:341`,
     réexportée par `engine-events.ts`) prend le réglage et rend `"app"` par
     `isApp(setup)` (jamais `.type === "consumer-app"`, garde 3) ; ses deux
     appels passent le réglage. `/admin/stats` (`EngineSection.tsx:45`, en
     anglais comme toute la page) : « Set up — self-serve {…plg},
     sales-assisted {…slg}, both {…hybrid}, consumer app {engine.setup.app} ».
  5. Les tests : `start.test.ts` ; `goatcounter-api.test.ts` (ses valeurs
     attendues changent, ce n'est pas une retouche d'appel : ligne 347, la
     liste des chemins gagne `engine_setup/app` ; ligne 394, `setup` gagne
     `app: 0`) ; un test de `Setup` (une app enregistrée sans changement
     garde son type, sa monétisation et ses outils).
  6. Les e2e, contre un build `ENGINE_TYPES=consumer-app` comme la CI :
     `engine-collect`, `engine-forms`, `engine-hybrid`, `engine-engines`,
     `engine-settings`, `engine-screens`, `engine-canary`, `engine-mobile`,
     tous verts et inchangés.
- **Acceptation** : commune ; captures de la carte de départ (avec `app`
  choisi, et l'erreur « aucune case ») et du réglage d'une app, FR à 1 280 px
  et EN à 390 px, regardées (leçon nº 1), prises comme §23.8 le dit (une spec
  jetable hors du dépôt sur le modèle de `scripts/engine-density.capture.ts`,
  `engineSeed` d'`e2e/engine-helpers.ts`, un build `ENGINE_ENABLED=true
  ENGINE_TYPES=consumer-app`).
- **Arrêt** : la carte du SaaS change d'un caractère quand le type est fermé.
- **Relecteurs** : copie, sécurité (l'analytique).
- **Pause** : un moteur app se crée derrière le drapeau ; ses écrans de
  l'argent sont encore ceux du SaaS (APP-8).

#### APP-8 — Les écrans de l'argent

- **But** : le bloc de l'argent, la bande des deux flux, la carte du levier et
  le panneau « Et si » d'une app ; la cible de la rétention des actifs sur le
  tableau.
- **À lire** : §21.1 (D5, D11, D16), §21.5.1 (les appels APP-8), §21.5.3
  (`activesMissing`), §21.6.4, §21.8.4 b (APP-8) ; le code : `money-view.ts`,
  `BoardMoney.tsx`, `scenario-view.ts`, `whatif-figures.ts`,
  `WhatIfPanel.tsx`, `Board.tsx:130-280`, `MotionColumns.tsx`,
  `_engine/TotalBand.tsx` (le modèle de la bande),
  `components/engine/TotalBand.tsx`, `BoardNumbers.tsx`, `number-list.ts`,
  `Peloton.tsx`, `Peloton.module.css`.
- **Fichiers** : ceux-là, `_engine/AppStreamsBand.tsx` (nouveau),
  `content/engine-copy.ts` (APP-8), leurs tests. **Pas** `.design-sync/` : les
  aperçus se mettent à jour à la re-synchro, un geste d'Antoine.
- **Étapes** : la couture dans `scenario-view.ts` (§21.5.1) ; `appKpiInputs`
  et ses quatre lecteurs ; `appMissingPhrase` ; `signed` sans signe pour 0 ;
  `AppStreamsBand` ; `moneyView` et `BoardMoney` ; `whatif-figures.ts` et
  `WhatIfPanel.tsx` ; `Board.tsx` (`candidateValues`) et `MotionColumns.tsx` ;
  `listStages` et `BoardNumbers` ; le peloton à `--peloton-columns` (§21.5.5).
- **Acceptation** : commune ; le tableau de l'exemple SaaS inchangé (ses
  captures avant et après, identiques) ; **captures du tableau d'une app**,
  FR 1 280 et EN 390, regardées : l'exemple de l'app n'existe qu'en APP-10,
  donc les captures se prennent par un test Playwright jetable qui pose
  `consumerState()` par `engineSeed` (`e2e/engine-helpers.ts`, comme les
  tests « brief 09 » de `scripts/engine-density.capture.ts` posent
  `filmState()`), sur un build avec `ENGINE_TYPES=consumer-app` ; le test ne
  se commite pas.
- **Arrêt** : un écran SaaS qui change ; un composant présentationnel qui
  devrait apprendre le type.
- **Relecteurs** : copie.
- **Pause** : le tableau d'une app est complet derrière le drapeau.

#### APP-9 — Les slides

- **But** : le deck d'une app : peloton, fuite avec ses deux flux, « Et si »,
  économie d'une installation avec son graphique en courbe.
- **À lire** : §21.6.6, §21.7 ; §21.8.4 b (APP-9) ; le code : `deck.ts`
  (`pelotonTitle`, `buildLeak`, `buildUnitEconomics`, `movedLevers`,
  `buildWhatIfSlides`, `scenarioLines`), `deck-unit.ts` (en entier : le
  graphique et son `summary`), `phrases.ts:340-380`, `impact.ts#whatIf`,
  `lib/viz/payback-chart.ts` et `components/engine/PaybackChart.tsx` (les
  modèles, à ne pas modifier), `deck/SlideLeak.tsx`,
  `deck/SlideUnitEconomics.tsx`, `deck/deck-rows.ts`, `deck/ask-defaults.ts`,
  `deck/export-png.ts`, `title-accent.ts`.
- **Fichiers** : ceux-là (sauf `payback-chart.ts` et `PaybackChart.tsx`),
  `lib/viz/install-payback-chart.ts` et
  `components/engine/InstallPaybackChart.tsx` + `.module.css` (nouveaux ; le
  commentaire de doc juste au-dessus de `export function
  InstallPaybackChart`, que `src/__tests__/component-docs.test.ts` lit),
  `.design-sync/config.json` (`componentSrcMap` gagne `"InstallPaybackChart":
  "src/components/engine/InstallPaybackChart.tsx"` : tout composant exporté
  de `src/components/` y est épinglé, sinon la prochaine synchro casse,
  `.design-sync/NOTES.md`),
  `app.ts` (`appWhatIf`), `impact.ts` (`impactHeadline`), `types.ts`
  (`ImpactLine.key`, `Impact.appChain`, `SlideInstallChart`,
  `Slide.installChart`, `SlideTitleKey`, `WhatIfKpiId`),
  `deck/deck.module.css` (`--figure-columns`),
  `lib/engine/__tests__/sentences-guard.test.ts` (les trois scénarios de
  l'app perdent `deck: false`), `content/engine-copy.ts` (APP-9,
  dont `slideTitles.pelotonCompleteTwo`), `content/engine-copy-consumer.ts`
  (la réécriture de `pelotonCompleteTwo`), `engine-copy.test.ts`
  (`TITLE_CONTRACT`), leurs tests.
- **Étapes** : §21.7.1 à §21.7.5 dans l'ordre (dont `deck.ts:476`, l'aparté
  de la fuite, sur les clés de `positions`, et `pelotonTitle` par chiffre) ;
  la chaîne de l'exemple (§21.7.2) vérifiée ligne par ligne ; `chainTemplate`
  testé sur ses trois `appChain` ; §21.6.6 (la géométrie et ses tests
  d'abord, puis le composant, puis `installChart` dans `buildUnitEconomics`) ;
  `ask-defaults.ts:81` par `candidatesFor` ; enfin `deck: false` retiré des
  trois scénarios de l'app dans `sentences-guard.test.ts` (§21.10.1) : le
  balayage passe sur leur deck.
- **Acceptation** : commune ; captures des slides de l'exemple (peloton, fuite,
  économie avec la courbe, un « Et si »), FR et EN, et de la slide de
  l'économie de l'app sans abonnements (la perte), regardées, par un test
  jetable comme celui d'APP-8 ; un PNG exporté de la slide de l'économie, ouvert : la
  courbe y est ; le deck de l'exemple SaaS inchangé (golden v2).
- **Arrêt** : un nombre exact de la chaîne de §21.7.2 qui diffère ; un titre qui
  ne passe pas `TITLE_CONTRACT` sans changer de sens ; `PaybackChart` ou sa
  géométrie qui sembleraient devoir changer.
- **Relecteurs** : copie.
- **Pause** : les écrans et les slides sont là.

#### APP-10 — L'exemple et le golden

- **But** : « Voir un exemple rempli » montre l'app de §21.9 ; le golden de
  l'app fige tout.
- **À lire** : §21.9, §21.10.2 ; le code : `example.ts`, `_engine/ExampleView.tsx`,
  `golden-v2.test.ts` (le modèle).
- **Fichiers** : `example.ts`, `ExampleView.tsx`, `content/engine-copy.ts`
  (APP-10), `golden-consumer.test.ts`, `golden-consumer-inputs.json`,
  `golden-consumer.json` (nouveaux), `fixtures.ts` (`consumerState` lit
  désormais `exampleEngine`).
- **Étapes** :
  1. **Les mots de l'exemple** : `ExampleWords` (`example.ts:29`) gagne
     `churnCause?: string` (lu par `exampleConsumerMetrics` seulement).
     `exampleConsumerMetrics(words)` écrit `act.event` et
     `acq.top-channel-share` comme `exampleMetrics` (avec `words.event` et
     `words.channel`), et `"ret.churn-cause": measured({ kind: "text", text:
     words.churnCause ?? "" }, { kind: "person", role: "data" }, { evidence:
     "data" })`. Pour une app, `ExampleView` passe `{ event: e.eventApp,
     channel: e.channelApp, company: e.companyApp, churnCause:
     e.churnCauseApp }` (§21.8.4 b), où `e` est `stringsFor("consumer-app").example`
     (§21.8.1).
  2. `exampleEngine(words, motions, type?, monetization?)` (§21.9.1) ;
     `consumerState()` le lit.
  3. `ExampleView` gagne les props `type: BusinessType`, `monetization?:
     AppMonetization` et `stringsFor` ; pour une app, son bandeau lit
     `example.bannerTitleApp` et `example.bannerBodyApp` (`{d30}`, `{paid}`,
     `{retention}` remplis depuis `EXAMPLE_CONSUMER_TARGETS`), ses cibles
     passent par `candidatesFor` (`ExampleView.tsx:127`), ses chiffres par
     `metricsFor(props, "consumer-app")`. `EngineWorkbench` lui passe le type
     de l'exemple demandé : `openExample(choice, monetization)` (§21.6.1)
     garde le choix et la monétisation de la carte de départ.
  4. Vérifier §21.9.2 dans les sorties ; **puis seulement** écrire le golden
     (l'entrée « avec ses deux « Et si » » = `{ ...consumerState(), whatIf:
     EXAMPLE_CONSUMER_WHATIF }`).
- **Acceptation** : commune ; le golden écrit une fois.
- **Arrêt** : un nombre de §21.9.2 absent des sorties.
- **Relecteurs** : copie.
- **Pause** : l'exemple de l'app est visible derrière le drapeau.

#### APP-11 — La page, les e2e, la documentation

- **But** : la phrase de la FAQ quand le type est ouvert ; le parcours complet
  tenu par Playwright ; la documentation à jour.
- **À lire** : §21.1 (D15), §21.10.3, §21.10.4 ; le code : `page.tsx` (la FAQ),
  `e2e/engine-hybrid-journey.spec.ts`, `e2e/engine-screens.spec.ts`,
  `e2e/engine-canary.spec.ts`, `e2e/engine-deck.spec.ts`, les specs « jeu
  fermé » (le motif du build sans variable), `TESTING.md` §5.
- **Fichiers** : `page.tsx`, `content/engine-copy.ts` (`faqTypeNote`),
  `e2e/engine-consumer.spec.ts` (nouveau), les trois specs étendues,
  `ENGINE.md` (la ligne §21 de la table, l'état), `CLAUDE.md` (l'état du
  moteur, les chiffres de référence), `CHANTIERS.md` (A22 : les douze cases,
  A22.d le bon à tirer).
- **Étapes** : la phrase (ajoutée à la cinquième réponse quand
  `openTypes` contient `"consumer-app"`) ; les e2e ; la non-vacuité de §21.10.4
  mesurée et écrite au journal ; la documentation.
- **Acceptation** : commune ; la suite Playwright verte en CI.
- **Arrêt** : un e2e existant qui rougit sur le SaaS.
- **Relecteurs** : copie, sécurité.
- **Pause** : **A22 est fini** ; reste le bon à tirer d'Antoine (A22.d) et
  l'ouverture.

---

### 21.12 Ce que l'exécutant ne tranche jamais, et quand il s'arrête

En plus des conditions de chaque fiche et de §23.0, le sous-agent **s'arrête et
rend compte**, sans contourner, quand :
- un nombre de §21.9.2 ne sort pas de son code (après avoir vérifié les
  entrées) : il ne corrige ni le test ni ce document pour le faire tomber
  juste ;
- un golden v1 ou v2 rougit, quelle que soit la raison ;
- un test existant rougit hors de la liste de §21.10.1 ;
- `app-model.ts` ou `stream.ts` semble devoir changer ;
- une phrase ne passe pas un test de copie (longueur, glyphe, gabarit) sans
  changer de sens ;
- un nom d'écran d'outil cité n'existe plus dans la documentation de l'outil
  (il garde alors une description générique, comme le dit l'en-tête
  d'`engine-catalog.ts`, et le signale).

Il ne change jamais : une formule, un id, une décision de §21.1, la forme du
fichier, la copie validée du SaaS, le vocabulaire fermé de l'analytique
au-delà de `app`.

---
### 21.13 Les décisions d'Antoine (C56 à C63, C92)

*Posées et tranchées le 2026-10-04, une par une. Ce document applique la
colonne de droite ; les deux premières colonnes gardent la question telle
qu'elle a été posée, sur le premier jet.*

| # | Question | Recommandation | Si on renverse | Réponse d'Antoine |
|---|---|---|---|---|
| C56 | **Le périmètre** : les abonnements seulement en v1 (ni achats à l'unité, ni publicité, ni app payante sans abonnement) ? | **Oui.** Le modèle du MRR, de la LTV et de l'argent (A20) vaut tel quel pour un abonnement ; RevenueCat parle en MRR et en ARR. Les achats à l'unité et la publicité demandent un autre modèle de revenu (revenu par utilisateur actif, LTV tirée de la courbe de rétention) : un lot à part, ~5 jours-agent de plus | §21.0, §21.5 (deux chiffres de plus), §21.7 (des calculs propres au type), §21.9 | **2026-10-04 : non, contre la reco — les achats intégrés et la publicité entrent dans la v1.** Le second modèle de revenu est à concevoir et à valider (question de suivi), puis §21.0, §21.5, §21.7 et §21.9 se réécrivent avant l'exécution |
| C57 | **La base** : « 100 installations », et les visiteurs de la fiche du store ? | **Oui.** C'est la base des rapports d'App Store Connect, de Google Play et de RevenueCat (ses cohortes partent de la première ouverture) | La base « comptes créés » garderait « inscrits » : le calque serait plus petit, mais la conversion de la fiche, le premier chiffre d'une app, sortirait du funnel | **2026-10-04 : oui, la reco.** 100 installations, et les visiteurs de la fiche du store |
| C58 | **iOS et Android** : un seul moteur, les deux stores additionnés ? | **Oui**, et le piège de §21.5.2 le dit ; qui veut les séparer fait deux moteurs (A14 en permet dix) | Un réglage « store » et des chiffres par store : un lot de plus | **2026-10-04 : oui, la reco.** Un moteur, les deux stores additionnés ; un moteur par store pour qui veut les séparer |
| C59 | **La commission des stores** dans la marge brute, sans chiffre à part ? | **Oui** : un chiffre de moins, et la finance la compte déjà dans ses coûts directs ; le piège de la marge et celui du revenu par abonné le disent deux fois | Un dix-huitième chiffre, « commission moyenne des stores », et une marge « hors commission » : §21.5, §21.7 (un calcul de plus), §21.9 | **2026-10-04 : non, contre la reco — un chiffre à part, « commission moyenne des stores »**, une marge brute « hors commission », et un levier « Et si » sur la commission (le passage au programme à 15 %, par exemple). Elle porte sur les abonnements et les achats intégrés, jamais sur la publicité (C56). §21.5, §21.7 et §21.9 se réécrivent avec le modèle de revenu |
| C60 | **Les repères** : seule la rétention à J30 (20 à 30 %, déjà approuvée dans le glossaire) situe ; les repères SaaS (activation, churn, marge, payback, LTV:CAC) sont retirés ? | **Oui.** Un repère SaaS sur une app situerait mal ; aucun ne désigne de toute façon (C1) | Garder les repères SaaS avec une réserve « pour le SaaS » : moins de code (pas de retrait), mais un contexte trompeur | **2026-10-04 : oui, la reco.** Le seul repère de J30 (20 à 30 %), les repères SaaS retirés |
| C61 | **Le type** se choisit à la création et ne change plus ? | **Oui** (D5) | Un type modifiable : l'écran « ce chiffre ne décrit plus la même chose » sur dix-sept chiffres, ~1 jour-agent de plus | **2026-10-04 : oui, la reco.** Figé à la création, grisé dans les Réglages |
| C62 | **L'ouverture** : le type s'ouvre par `ENGINE_TYPES`, indépendamment du moteur ; l'ouverture du moteur n'attend pas ce lot ? | **Oui.** Le moteur SaaS ouvre d'abord (son bon à tirer nº9 est le seul verrou) ; l'app suit, drapeau à part | Si l'ouverture du moteur attend l'app : D2 de `CHANTIERS.md` gagne A22 et son bon à tirer | **2026-10-04 : oui, la reco.** `ENGINE_TYPES` à part ; le moteur SaaS ouvre d'abord, sans attendre A22 ni A23 |
| C63 | **La page publique** : rien de neuf (ni section, ni FAQ, ni terme de glossaire, ni changement de la promesse) ; l'app n'apparaît que sur la carte de départ ? | **Oui** en v1 : la page vise « AARRR funnel template », une requête SaaS, et la FAQ est tenue à six questions par un test. Un terme de glossaire (« taux d'installation » ou « rétention J1/J7/J30 ») pourra venir avec un relevé Search Console qui le justifie | Une septième question de FAQ (le test passe à sept) ou une section : copie neuve, et le test des six questions à changer | **2026-10-04 : non, contre la reco — une phrase sur la page.** Elle dit que le moteur sert aussi les apps grand public et les places de marché. Elle va dans une réponse existante de la FAQ (le compte reste à six) plutôt que dans la promesse, validée au bon à tirer nº10. Elle n'apparaît qu'une fois le type ouvert au build, et passe au bon à tirer. Ni section, ni terme de glossaire pour l'app |
| C92 | **Le modèle de revenu de l'app** (question de suivi de C56, posée le 2026-10-04). Les abonnements restent ceux du libre-service (MRR). Les achats intégrés et la publicité forment un second flux sur les utilisateurs actifs du mois (actifs × revenu par actif), projeté par la boucle du MRR avec la rétention mensuelle des actifs ; les installations encore là à J30 rejoignent les actifs. Le revenu du mois est la somme des deux flux. Les unit economics se lisent par installation (coût par installation contre ce qu'une installation rapporte en 12 mois). Un réglage « Comment l'app gagne de l'argent » coche abonnements, achats, pub. Quatre chiffres de plus | **Oui** : deux flux, chacun avec la boucle du MRR, explicables en une phrase ; ~16 jours-agent au lieu de ~10 | Un modèle par cohorte (LTV tirée de J1, J7, J30, J90) ou un modèle au jour (ARPDAU) : plus fin pour un jeu, plus dur à saisir et à ré-expliquer | **2026-10-04 : oui, la reco.** §21 se réécrit sur ce modèle avant l'exécution |

---

### Annexe — Les faits vérifiés pour ce document (2026-10-04)

- **App Store Connect** : les métriques *Impressions*, *Product Page Views*
  (vues uniques de la fiche), *Conversion Rate* (téléchargements et
  précommandes ÷ impressions uniques) et *First-Time Downloads*, dans
  Analytics. Sources : [App Store Connect Help, app metrics](https://developer.apple.com/help/app-store-connect/reference/app-metrics),
  [Measuring app performance](https://developer.apple.com/app-store-connect/analytics).
- **Google Play Console** : *Grow users › Store performance › Conversion
  analysis*, avec *Store listing visitors*, *Store listing acquisitions* et le
  taux de conversion, filtrable par source de trafic. Source :
  [Play Console Help](https://support.google.com/googleplay/android-developer/answer/9859173).
- **RevenueCat** : MRR normalisé au mois (un abonnement à 120 $ par an compte
  10 $ par mois) ; trois vues du revenu, *Revenue*, *Revenue (net of taxes)* et
  *Proceeds* (après taxes et commission) ; les graphiques *Active
  Subscriptions*, *Churn* (abonnements perdus et jamais repris), *Conversion to
  Paying*, *Paid Subscriptions*, *Monthly Recurring Revenue Movement*, *Play
  Store Cancel Reasons*. Sources :
  [MRR chart](https://www.revenuecat.com/docs/dashboard-and-metrics/charts/monthly-recurring-revenue-mrr-chart),
  [MRR movement chart](https://www.revenuecat.com/docs/dashboard-and-metrics/charts/monthly-recurring-revenue-movement-chart),
  [Charts](https://www.revenuecat.com/docs/dashboard-and-metrics/charts).
- **Commissions** : Apple prend 30 % en standard, 15 % dans le Small Business
  Program (moins d'un million de dollars de recettes l'année précédente) et
  15 % sur un abonnement après un an ; Google Play prend 15 % sur les
  abonnements depuis le 1er janvier 2022. Sources :
  [Adapty, Small Business Program](https://adapty.io/blog/app-store-small-business-program/),
  [9to5Google, 2021-10-21](https://9to5google.com/2021/10/21/google-play-subscription-fee/).
  *Ces taux bougent (règles européennes, programmes) : la prose dit « 15 % ou
  30 % selon le store, ton programme et l'âge de l'abonnement », jamais une
  règle complète.*
- **App Store Connect, Sales and Trends** : les métriques *Sales* (le montant
  facturé) et *Proceeds* (« Customer Price minus applicable taxes and Apple's
  commission »), *Subscription Sales* ; le type de contenu *In-App Purchases*
  compte aussi les abonnements. Source :
  [Sales and Trends metrics and dimensions](https://developer.apple.com/help/app-store-connect/reference/sales-and-trends-metrics-and-dimensions/).
- **Google Play Console, rapport des revenus (Earnings)** : les colonnes
  *Product Type* (« Subscription », « One-time product », « Paid app ») et
  *Transaction Type* (« Charge », « Google fee », « Tax »…) ; Google décrit la
  somme des lignes « Google fee » divisée par celle des ventes comme le taux de
  frais de la période. Sources :
  [Download sales and payout reports](https://support.google.com/googleplay/android-developer/answer/2482017),
  [Report columns](https://support.google.com/googleplay/android-developer/answer/6135870).
- **RevenueCat, graphique Revenue** : trois vues, *Revenue*, *Revenue (net of
  taxes)* et *Proceeds* (taxes et commission déduites) ; il compte aussi les
  achats non renouvelables. Source :
  [Revenue chart](https://www.revenuecat.com/docs/dashboard-and-metrics/charts/revenue-chart).
- **Attribution iOS** : AdAttributionKit succède à SKAdNetwork (WWDC 2024),
  agrégé et différé ; il n'attribue pas les installations organiques. Source :
  [AppsFlyer, SKAdNetwork data insights](https://www.appsflyer.com/blog/trends-insights/skadnetwork-data-insights),
  [PPC Land, AttributionKit](https://ppc.land/apple-introduces-attributionkit/).
- **AppsFlyer** : installations par *media source*, coût et eCPI dans le
  tableau de bord *Overview*. Source :
  [AppsFlyer support](https://support.appsflyer.com/hc/en-us/articles/360008981698).
- **Firebase** : l'événement automatique `first_open` et les explorations de
  GA4 (entonnoir, cohortes).
