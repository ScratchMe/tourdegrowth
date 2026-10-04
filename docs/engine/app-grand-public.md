# ENGINE.md, partie 5 — l'app grand public (§21)

*Écrit le 2026-10-04, contre le code de `main` (`5d98683`, A20.e livré), et
non contre les documents. C'est une **spécification d'exécution** : elle est
écrite pour qu'une session de code l'applique sans rien trancher. Chaque
décision y est prise, chaque nom de fichier, de type et de fonction y est
donné, et l'exemple chiffré sort du vrai moteur. Les décisions produit
attendent Antoine : ce sont **C56 à C63**, posées en §21.13 avec leur
recommandation, et le texte ci-dessous applique ces recommandations. Si
Antoine en renverse une, la section qu'elle touche est nommée dans sa ligne :
on corrige la section, puis on exécute.*

*Vérifié pour ce document : `types.ts`, `catalog-shape.ts`, `validate.ts`,
`io.ts`, `migrate.ts`, `merge.ts`, `example.ts`, `derive.ts`, `scenario.ts`,
`impact.ts`, `diagnose.ts`, `unit-economics.ts`, `money.ts`, `deck.ts`,
`deck-unit.ts`, `access.ts`, `tools.ts`, `shared-counts.ts`,
`engine-props.ts`, `EngineWorkbench.tsx`, `_engine/Setup.tsx`,
`_engine/start.ts`, `_engine/sources.ts`, `_engine/MetricSheet.tsx`,
`components/engine/EngineStart.tsx`, `content/engine-copy.ts` (`start`,
`setup`, `peloton`, `slideTitles`, `example`), `content/engine-catalog.ts`
(les dix-sept du libre-service et les cinq calculés),
`lib/analytics/goatcounter.ts` (vocabulaire du moteur), `.github/workflows/ci.yml`.
L'exemple de §21.9 a été calculé en faisant tourner `deriveEngine`,
`buildScenario`, `leverAlone` et `buildDeck` sur ses entrées, le 2026-10-04.*

*Les faits sur les outils (App Store Connect, Google Play Console,
RevenueCat, commissions des stores) sont sourcés en annexe. Toute la copie
citée ici est de la copie neuve : elle porte `TODO: à relire` dans le code
(convention 6) et passe au bon à tirer. La typographie finale (U+00A0 avant
`:` `;` `%` `€` `?` `!` et après `«`) se pose dans `src/content/`, pas dans ce
document : `copy-typography.test.ts` la vérifie.*

---

## 21. L'app grand public — spécification A21, premier jet du 2026-10-04

### 21.0 En une page

**Ce qui change.** Le réglage ouvre un deuxième **type**, « App grand public »
(`"consumer-app"`), qui n'existait qu'en option grisée « Plus tard ». Une app
grand public se vend **en libre-service, par abonnement** : elle réutilise
**tout le moteur du libre-service**, ses dix-sept chiffres (mêmes ids), ses
calculs, son diagnostic, ses « Et si », son argent (A20) et ses slides. Ce qui
change, ce sont les **mots** et les **sources** :

- la base n'est plus « 100 inscrits » mais **« 100 installations »**, et les
  visiteurs sont ceux de **la fiche de l'app sur l'App Store ou Google Play** ;
- les clients payants deviennent des **abonnés** ;
- les outils proposés sont **App Store Connect, Google Play Console,
  RevenueCat, AppsFlyer, Adjust**, en plus de GA4 (Firebase), Amplitude,
  Mixpanel ;
- la **commission des stores** entre dans la marge brute, et un piège le dit ;
- un seul repère publié vaut pour ce type, la rétention à J30 de 20 à 30 %
  (déjà approuvée dans le glossaire), et il **situe sans désigner** (C1) ;
- un exemple rempli propre au type, et une carte de départ qui propose le
  type quand il est ouvert.

**Ce qui ne change pas.**
- **Aucune formule ne bouge.** Un moteur « app » et un moteur « SaaS B2B »
  avec les mêmes chiffres donnent les mêmes nombres, au centime. Seuls les
  mots, les sources et les repères affichés diffèrent.
- **Aucun fichier ne change de forme** : un moteur « app » est un fichier v3
  avec `setup.type: "consumer-app"`. Pas de migration, pas de nouvelle clé de
  stockage. Les golden v1 et v2 restent verts sans projection.
- **Le SaaS B2B ne bouge pas d'un caractère** : écrans, slides, export texte,
  événements. Un test le garde (§21.10.2).
- Tout reste local, bilingue, déterministe ; seule une cible d'équipe nomme
  une étape (C1) ; jamais de rouge sur une projection (S-5).

**Ce que le type ne fait pas en v1** (C56) : les achats intégrés à l'unité,
la publicité, les apps payantes à l'installation sans abonnement, l'attribution
des installations payantes canal par canal, le web-to-app. Le moteur le dit
dans la fiche du chiffre concerné, jamais en le cachant.

**L'ouverture.** Le type s'ouvre par une variable d'environnement,
`ENGINE_TYPES` (§21.3), indépendante d'`ENGINE_ENABLED` : le moteur peut être
ouvert au public pendant que l'app grand public reste « Plus tard ». Rien de
ce lot n'attend l'ouverture du moteur, et l'ouverture du moteur n'attend rien
de ce lot (C62).

**L'effort.** Sept PR (U0 à U6), ~10 jours-agent (§21.11), puis un bon à
tirer. Calibrage : A7.3 était estimé à ~12 jours-agent et s'est fait en deux
jours de calendrier ; ce qui fixe le calendrier, ce sont les réponses
d'Antoine et le bon à tirer.

---

### 21.1 Les décisions de conception (décision · raison · alternative rejetée)

**D1 — Un type, pas une motion.** `BusinessType` gagne `"consumer-app"` ;
`Motion` ne bouge pas. Un moteur « app » a toujours
`motions: { plg: true, slg: false }`. *Raison* : une app grand public se vend
seule, et l'assisté n'y a pas de sens ; tout le pipeline du libre-service
s'applique tel quel. *Rejeté* : une troisième motion `"app"`, qui dédoublerait
dix-sept ids, le diagnostic, les « Et si » et le deck pour des formules
identiques.

**D2 — Les mêmes ids.** `acq.signup-rate` reste l'id du taux d'installation,
`rev.arpa` celui du revenu mensuel par abonné, etc. *Raison* : les calculs
lisent des ids, et un id est interne ; changer les ids changerait le contrat de
fichier, la validation et les goldens pour aucun gain. *Rejeté* : des ids
`app.*`, qui obligeraient à dupliquer chaque module qui nomme un id.

**D3 — Ce qui diffère par type tient en trois couches, chacune avec un seul
point d'entrée.**
1. **La forme affichée** : `sources`, `benchmark` et `glossary` d'un chiffre ou
   d'un calculé peuvent différer par type. Une seule fonction les lit :
   `displayShapeOf(id, type)` et `displayDerivedShapeOf(id, type)`, dans
   `src/lib/engine/business-type.ts` (§21.2.2). Tout le reste de la forme
   (unité, bornes, flux, fenêtre, effort, rôle, variantes, raisons « sans
   objet ») est **le même** : la validation et les calculs n'ont pas besoin du
   type.
2. **La prose du catalogue** : un second catalogue complet,
   `ENGINE_CATALOG_CONSUMER` (dix-sept entrées) et
   `ENGINE_DERIVED_CATALOG_CONSUMER` (cinq), dans
   `src/content/engine-catalog-consumer.ts` (§21.5).
3. **La copie de l'écran et des slides** : un calque partiel,
   `ENGINE_COPY_CONSUMER`, dans `src/content/engine-copy-consumer.ts`, fusionné
   par-dessus `ENGINE_COPY` **une seule fois**, en tête de l'îlot (§21.6).

*Raison* : trois couches, trois tests, et aucun composant qui teste le type.
*Rejeté* : des `if (type === "consumer-app")` dans les composants, qu'aucun test
ne peut énumérer.

**D4 — Les variantes et les raisons « sans objet » gardent leurs ids ; seul
leur libellé change.** `rev.paid-conversion` garde `naReasons: ["no-free-tier"]`,
libellé « App payante à l'installation » pour une app ; `rev.expansion` et
`rev.contraction` gardent `"not-subscription"`, libellé « Un seul plan ».
*Raison* : `validate.ts` reste sans type. *Rejeté* : de nouveaux ids de raison,
qui feraient dépendre la validation du type.

**D5 — Le type se choisit à la création et ne change plus** (C61). Les
Réglages l'affichent en lecture seule, avec « Pour changer de type, crée un
nouveau moteur ». *Raison* : un moteur SaaS B2B passé en app garderait des
chiffres saisis avec d'autres définitions (des inscrits devenus des
installations) ; plusieurs moteurs par appareil existent depuis A14 (dix au
plus). *Rejeté* : un type modifiable, qui demanderait l'écran « ce chiffre ne
décrit plus la même chose » pour dix-sept chiffres à la fois.

**D6 — Le drapeau des types est une liste lue au build** (C62) :
`ENGINE_TYPES="consumer-app"` ouvre le type ; absent ou vide, seul le SaaS
B2B est ouvert. *Raison* : la page est prérendue, comme pour
`isEngineOpenAtBuild()`. *Rejeté* : un cookie d'aperçu par type, que la page
statique ne peut pas lire.

**D7 — Pas de `next.config.mjs`.** La liste ouverte passe par les props que la
page calcule au build (`openTypes`), pas par une variable inlinée côté client.
*Raison* : `/livrer` §0 demande Antoine pour tout changement de réglage de
build ; celui-ci n'en a pas besoin.

---

### 21.2 Le contrat

#### 21.2.1 `src/lib/engine/types.ts`

```ts
// Avant
export type BusinessType = "b2b-saas"; // later: | "consumer-app" | "marketplace"
// Après (U0)
/**
 * Decision 3 (C4), then §21 (C56-C63): the TYPE of business. The consumer app
 * sells self-serve subscriptions and reuses the self-serve engine as is: same
 * ids, same formulas, its own words, sources and references
 * (`business-type.ts`). The marketplace comes later (shown, disabled).
 */
export type BusinessType = "b2b-saas" | "consumer-app"; // later: | "marketplace"
```

`ToolId` gagne trois outils (U1), à la fin de l'union, dans cet ordre :
`"revenuecat" | "appsflyer" | "adjust"`. `"app-store-connect"` et
`"play-console"` existent déjà. Firebase n'est pas un outil à part : ses
rapports sont ceux de GA4 (`"ga4"`, libellé « GA4 (Firebase) » dans la prose de
l'app).

Rien d'autre ne change dans `types.ts`. En particulier ni `EngineSetup`, ni
`Snapshot`, ni `ENGINE_SCHEMA_VERSION` (reste 3).

#### 21.2.2 `src/lib/engine/business-type.ts` (nouveau, pur, sans copie)

```ts
import type { Benchmark, MetricShape, DerivedShape } from "./catalog-shape";
import { shapeOf, derivedShapeOf } from "./catalog-shape";
import type { BusinessType, DerivedId, EngineSetup, MetricId, Motion, PlgDerivedId, PlgMetricId, ToolId } from "./types";

/** Every type the code knows, in the order the setup lists them. */
export const BUSINESS_TYPES: readonly BusinessType[] = ["b2b-saas", "consumer-app"];

/** The type every build opens, whatever ENGINE_TYPES says. */
export const ALWAYS_OPEN_TYPE: BusinessType = "b2b-saas";

/** What a type may tick (§21.1 D1): the consumer app sells self-serve only. */
export function motionsAllowed(type: BusinessType): readonly Motion[] {
  return type === "consumer-app" ? ["plg"] : ["plg", "slg"];
}

/** The fields of a shape a type may show differently. Nothing a computation reads. */
export type DisplayFields = Pick<MetricShape, "sources" | "glossary"> & { benchmark?: Benchmark };
export type DerivedDisplayFields = Pick<DerivedShape, "glossary"> & { benchmark?: Benchmark };

/**
 * Per type, per self-serve number: what replaces the b2b-saas display fields.
 * An id absent from the record keeps the b2b-saas shape. `benchmark: undefined`
 * written explicitly REMOVES the b2b-saas reference (a key present with
 * undefined, tested with `"benchmark" in override`).
 */
export const DISPLAY_OVERRIDES: Readonly<Record<Exclude<BusinessType, "b2b-saas">, Partial<Record<PlgMetricId, Partial<DisplayFields>>>>> = {
  "consumer-app": { /* §21.5.1, table « Forme affichée » */ },
};
export const DERIVED_DISPLAY_OVERRIDES: Readonly<Record<Exclude<BusinessType, "b2b-saas">, Partial<Record<PlgDerivedId, Partial<DerivedDisplayFields>>>>> = {
  "consumer-app": { /* §21.5.1 */ },
};

/** The shape as the screens and the deck show it for this type. Same object as `shapeOf(id)` for b2b-saas. */
export function displayShapeOf(id: MetricId, type: BusinessType): MetricShape { /* merge, see below */ }
export function displayDerivedShapeOf(id: DerivedId, type: BusinessType): DerivedShape { /* idem */ }

/** The setup tools listed for a type (§21.4.4): b2b-saas keeps SETUP_TOOLS as today. */
export function setupToolsFor(type: BusinessType): readonly ToolId[] { /* … */ }
```

Règle de fusion de `displayShapeOf` : `{ ...shapeOf(id), ...override }`, où un
`benchmark` présent avec la valeur `undefined` retire le repère. Pour
`"b2b-saas"`, la fonction **renvoie l'objet de `shapeOf(id)` lui-même** (même
référence), ce qui garantit qu'aucun écran SaaS ne change.

`business-type.ts` n'importe aucune valeur de `content/` (la règle de
`engine-boundary.test.ts` le vérifie déjà pour tout `lib/engine/`).

#### 21.2.3 Les points de lecture à faire passer par `displayShapeOf`

Relevés le 2026-10-04 par `grep -rn "\.benchmark\b\|\.sources\b\|\.glossary\b"`
sur `src/app/[locale]/aarrr-funnel-template`, `src/lib/engine` et
`src/components/engine`, tests exclus. À refaire au moment d'U1 (convention
10) :

| Fichier:ligne | Lecture | Ce que fait U1 |
|---|---|---|
| `_engine/sources.ts:51` | `shape.sources` dans `sourceOptions` | reçoit la forme affichée : l'appelant passe `displayShapeOf(id, type)` |
| `_engine/MetricSheet.tsx:248` | `shape.benchmark` | `displayShapeOf(id, setup.type).benchmark` |
| `lib/engine/deck-unit.ts:53` | `ALL_DERIVED_SHAPES…benchmark?.lo` (le repère de 12 mois de `PaybackChart`) | `displayDerivedShapeOf(id, state.setup.type).benchmark?.lo ?? null` : pas de pointillé pour une app (§21.8) |
| `engine-props.ts:27,33` | `shape.glossary` → `glossaryHref` | les métriques de l'app sont résolues avec `displayShapeOf(id, "consumer-app").glossary` (§21.5.3) |
| `page.tsx:77,183` | `shape.benchmark` dans le catalogue statique de la page | **inchangé** : la page publique ne montre que le catalogue SaaS (C63) |

Un test statique d'U1 (`business-type.test.ts`) reprend ce `grep` et échoue si
une lecture de `.benchmark`, `.sources` ou `.glossary` apparaît hors de cette
liste et de `business-type.ts`, `catalog-shape.ts` et `page.tsx`.

---

### 21.3 Le drapeau des types (U0)

**`src/lib/engine/access.ts`** gagne, à côté d'`engineEnvFlag` (c'est le seul
module autorisé à lire ces variables, `engine-boundary.test.ts`) :

```ts
/** The raw ENGINE_TYPES value: a comma-separated list of extra business types (§21.3). */
export function engineTypesFlag(): string | undefined {
  return process.env.ENGINE_TYPES;
}

/**
 * The business types open in THIS build: always b2b-saas, plus each known
 * type listed in ENGINE_TYPES (comma-separated, spaces ignored, unknown names
 * ignored, duplicates once). Pure on its input, like `engineOpenWith`.
 */
export function openTypesWith(env: string | undefined): BusinessType[];

/** Read at build by the page, never by the island: the page is static (●). */
export function openTypesAtBuild(): BusinessType[] {
  return openTypesWith(engineTypesFlag());
}
```

L'ordre du résultat est celui de `BUSINESS_TYPES`.

**`page.tsx`** passe `openTypes={openTypesAtBuild()}` à `EngineWorkbench`.
**`EngineWorkbenchProps`** gagne `openTypes: BusinessType[]`. **`resolveEngineProps`**
ne le calcule pas (il ne lit pas l'environnement) : la page l'ajoute.

**Un type fermé** est grisé dans `Setup` avec la note « Plus tard » (comme
aujourd'hui), et **absent** de la carte de départ (§21.4.1). Un **fichier**
d'un type fermé s'ouvre quand même : `io.ts` et `validate.ts` connaissent le
type, et rien n'est faussé. C'est voulu : l'import ne dépend pas du build.

**`.github/workflows/ci.yml`** : ajouter `ENGINE_TYPES: "consumer-app"` dans le
bloc `env:` du workflow (ligne 25), à côté de `GAME_ENABLED: "true"` (ligne 45),
pour que le build des e2e ouvre le type. Lire `GITHUB.md` avant (déclencheur :
« écrire ou modifier un workflow »). Les specs « type fermé » (§21.10.3)
tournent sur un build sans la variable, sur le modèle des specs « jeu fermé ».

**`.env.local.example`** : une ligne `ENGINE_TYPES=` commentée, sur le modèle
d'`ENGINE_ENABLED`.

**Pour Antoine** (D2 de `CHANTIERS.md`) : ouvrir le type, c'est poser
`ENGINE_TYPES=consumer-app` dans Vercel puis redéployer. Pour le tester avant
son bon à tirer alors que le moteur est déjà ouvert au public, la variable se
pose sur l'environnement **Preview** de Vercel seulement.

---

### 21.4 Le réglage, la carte de départ, les Réglages (U3)

#### 21.4.1 La carte de départ (`components/engine/EngineStart.tsx`)

Aujourd'hui une question, « Comment vends-tu ? », trois options (`ss`, `sa`,
`both`). Après U3 :

- `StartMotion` est renommé **`StartChoice = "ss" | "sa" | "both" | "app"`**
  (le renommage suit dans `EngineWorkbench.tsx`, `_engine/start.ts` et les
  tests ; `data-testid="engine-start-motion"` est **gardé** tel quel, pour ne
  pas casser les e2e existants).
- **Si `openTypes` ne contient que `"b2b-saas"`**, la carte est **identique à
  aujourd'hui**, au caractère près (légende, trois options, notes). Un test le
  garde.
- **Si `"consumer-app"` est ouvert**, la légende devient `start.legendTypes`
  (« Qu'est-ce que tu fais tourner ? » / "What are you running?") et les
  options sont, dans cet ordre :

| `value` | Libellé (FR / EN) | Note (FR / EN) |
|---|---|---|
| `ss` | `start.ssTyped` « SaaS B2B, en libre-service » / "B2B SaaS, self-serve" | `start.ssNote` (inchangée) |
| `sa` | `start.saTyped` « SaaS B2B, en vente assistée » / "B2B SaaS, sales-assisted" | `start.saNote` (inchangée) |
| `both` | `start.bothTyped` « SaaS B2B, les deux » / "B2B SaaS, both" | `start.bothNote` (inchangée) |
| `app` | `start.app` « App grand public » / "Consumer app" | `start.appNote` « Des abonnements, sur l'App Store ou Google Play. » / "Subscriptions, on the App Store or Google Play." |

- Avec `app` choisi :
  - le plan (`start.plan`) se calcule comme pour `ss` (dix-sept chiffres, mêmes
    efforts : `startPlan({ plg: true, slg: false })`) ;
  - la phrase des défauts est `start.defaultsApp` : « Réglé pour une app grand
    public, en euros. Mois des chiffres : {month} ; installations suivies :
    {cohort}. » / "Set for a consumer app, in euros, on {month}'s figures and
    {cohort}'s installs." ;
  - « Voir un exemple rempli » ouvre l'exemple de l'app (§21.9).

**`_engine/start.ts`** : `motionsOf(choice)` renvoie `{ plg: true, slg: false }`
pour `app`, et une nouvelle fonction pure `typeOf(choice): BusinessType`
renvoie `"consumer-app"` pour `app`, `"b2b-saas"` sinon. `startDefaults`
écrit `type: typeOf(choice)` au lieu de `SETUP_V2_DEFAULTS.type`.

#### 21.4.2 La carte de réglage complète (`_engine/Setup.tsx`)

- **Le type devient un état** (`useState<BusinessType>`, initialisé depuis
  `initial?.type ?? startType`, une nouvelle prop). Le `Choices` des lignes
  305-317 :
  - `value` = l'état ; `onChange` l'écrit ;
  - `consumer-app` est `disabled` **seulement** s'il n'est pas dans
    `openTypes` (la note reste `setup.typeLater`) ;
  - `marketplace` reste `disabled` avec sa note (§22 l'ouvrira) ;
  - **dans les Réglages** (`initial` posé), tout le groupe est `disabled`,
    avec la note `setup.typeFixed` : « Pour changer de type, crée un nouveau
    moteur. » / "To change type, create a new engine." (D5).
- **Type `consumer-app` choisi** :
  - le champ « Comment tu vends » (lignes 322-422) est **remplacé** par une
    ligne fixe, `setup.appSells` : « Une app grand public se vend en
    libre-service. » / "A consumer app sells self-serve.", suivie des deux
    fenêtres du libre-service (activation 7/14/30, paiement 30/60/90), mêmes
    contrôles, mêmes ids ;
  - `onStart` écrit `type: "consumer-app"` et `motions: { plg: true, slg: false }` ;
  - le mois de la cohorte reste affiché (la condition `motions.plg` le permet
    déjà) ;
  - le libellé du nom est `setup.companyLabelApp` : « Nom de ton app » / "Your
    app's name" ;
  - la liste des outils (lignes 565-582) lit `setupToolsFor(type)` (§21.4.4).
- **Rien ne change pour `b2b-saas`**, ni dans l'ordre ni dans les ids des
  champs.

#### 21.4.3 La validation, l'import, la fusion (U0)

- **`validate.ts:263`** : `if (!BUSINESS_TYPES.includes(setup.type))
  errors.push("setup.type: unknown type")`. Puis, nouvelle règle :
  `if (setup.type === "consumer-app" && setup.motions.slg)
  errors.push("setup.motions: a consumer app sells self-serve only")`.
- **`io.ts:98-102`** (`sellsSomehow`) : accepte tout type de `BUSINESS_TYPES`
  qui respecte `motionsAllowed(type)` et a au moins une motion ; sinon
  `unsupported-setup`, comme aujourd'hui. Les tests existants qui refusent
  `"consumer-app"` (`io.test.ts:107-114`) et `"marketplace"`
  (`validate.test.ts:123`) changent : `"consumer-app"` s'ouvre, `"marketplace"`
  est toujours refusé, et une app avec l'assisté coché est refusée.
- **`migrate.ts`** : rien. Un fichier v1 ou v2 reste `"b2b-saas"`.
- **`merge.ts:61`** : rien. Deux moteurs de types différents refusent déjà la
  fusion (`"type"`), et `io.copy` a déjà la phrase.

#### 21.4.4 Les outils (U1)

- **`types.ts`** : `ToolId` + `"revenuecat" | "appsflyer" | "adjust"`.
- **`_engine/sources.ts`** : `TOOL_ORDER` gagne les trois, après
  `"play-console"`, dans cet ordre (`satisfies Record<ToolId, true>` le force).
- **`lib/engine/tools.ts`** : nouvelle famille `"mobile"` :
  `["app-store-connect", "play-console", "revenuecat", "appsflyer", "adjust"]`.
  `TOOL_FAMILIES` la contient, mais **`setupToolsFor("b2b-saas")` ne la montre
  pas** (le SaaS ne change pas). `setupToolsFor("consumer-app")` donne, dans
  l'ordre des familles : `mobile`, puis `analytics` (ga4, amplitude, mixpanel,
  posthog), puis `ads` (google-ads, meta-ads), puis `billing` (stripe, pour
  les abonnements vendus sur le web), puis `other` (product-db, spreadsheet).
  `crm` et `linkedin-ads` n'y sont pas. Le commentaire de `tools.ts:10-12`
  (« they wait for the consumer app ») est remplacé.
- **`engine-copy.ts`**, `tools` : trois libellés, « RevenueCat », « AppsFlyer »,
  « Adjust » (identiques dans les deux langues, ce que le test « FR jamais
  identique à EN » tolère déjà pour les noms d'outils : vérifier, sinon
  ajouter l'exception comme pour les autres noms propres). `setup.toolFamily`
  gagne `mobile` : « Stores et abonnements » / "Stores and subscriptions".
- **`validate.ts`** accepte les trois ids nouveaux (il lit `ALL_TOOLS`).

#### 21.4.5 Les événements (U3)

`lib/analytics/goatcounter.ts` :
- `ENGINE_SETUP_DETAILS = ["plg", "slg", "hybrid", "app"] as const` ;
- `engineSetupDetail(setup: Pick<EngineSetup, "type" | "motions">)` renvoie
  `"app"` pour `"consumer-app"`, sinon la règle d'aujourd'hui. Les deux appels
  (`EngineWorkbench.tsx:245-246` et `:625-626`) passent le setup, pas les
  motions ;
- `engine_stage_saved/<stage>` ne change pas (une app enregistre des étapes du
  libre-service) ;
- `/admin/stats` (`EngineSection.tsx`) affiche la ligne `app` avec les autres ;
  le libellé « App grand public » est dans la copie de l'admin, à côté des
  trois autres ;
- `engine-boundary.test.ts`, règle 5, verra le nouveau détail : il doit être
  émis quelque part (il l'est, par `createEngine`).

---

### 21.5 Le catalogue de l'app (U1)

#### 21.5.1 La forme affichée (`DISPLAY_OVERRIDES["consumer-app"]`)

| Id | `sources` (dans cet ordre) | `benchmark` | `glossary` |
|---|---|---|---|
| `acq.signup-rate` | app-store-connect, play-console, appsflyer | **retiré** (le 2-5 % porte sur du trafic web payant froid) | `acquisition` |
| `acq.top-channel-share` | app-store-connect, play-console, appsflyer, adjust | — (aucun aujourd'hui) | `acquisition` |
| `acq.cac` | google-ads, meta-ads, revenuecat | — | `cac` |
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
| `rev.gross-margin` | spreadsheet, revenuecat | **retiré** (le 70-85 % porte sur le SaaS, sans commission de store) | `cac-payback` |
| `rev.expansion` | revenuecat, stripe | — | `nrr-grr` |
| `rev.contraction` | revenuecat, stripe | — | `nrr-grr` |

Les calculés (`DERIVED_DISPLAY_OVERRIDES["consumer-app"]`) :
`rev.cac-payback` et `rev.ltv-cac` **perdent leur repère** (12-24 mois et 3:1
sont des repères SaaS) ; les trois autres n'en ont pas.

Le repère de `ret.d30` vient mot pour mot du terme approuvé `retention`
(`glossary-deep.ts:888-889` : « les applis mobiles grand public gardent souvent
20-30 % d'une cohorte à J30 »). Le test du catalogue qui vérifie que les bornes
d'un repère figurent dans le texte du terme lié (`engine-catalog.test.ts:87-135`)
s'applique au catalogue de l'app comme à l'autre (U1 l'étend).

#### 21.5.2 La prose (`src/content/engine-catalog-consumer.ts`)

```ts
// TODO: à relire — copie neuve (convention 6), §21 (A21 U1)
import type { EngineCatalogEntry, EngineDerivedEntry } from "./engine-catalog";
import type { PlgDerivedId, PlgMetricId } from "@/lib/engine/types";
export const ENGINE_CATALOG_CONSUMER: Record<PlgMetricId, EngineCatalogEntry> = { … };
export const ENGINE_DERIVED_CATALOG_CONSUMER: Record<PlgDerivedId, EngineDerivedEntry> = { … };
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
dans le même ordre (D4) ; les libellés sont ceux d'ici quand ils sont donnés,
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
- trap : « La « Conversion Rate » d'App Store Connect se calcule sur les impressions, pas sur les visiteurs de la fiche : ce n'est pas ce chiffre. Additionne l'App Store et Google Play dans les deux comptes, ou fais un moteur par store. » / "App Store Connect's \"Conversion Rate\" is computed on impressions, not on page visitors: it isn't this number. Add the App Store and Google Play up in both counts, or keep one engine per store."
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
- trap : « Quelqu'un qui voit une pub puis cherche l'app compte en « recherche », pas en pub. Et sur iOS, l'attribution des pubs passe par un cadre d'Apple agrégé et en retard : les sources payantes se lisent dans ton outil d'attribution, jamais dans le store seul. » / "Someone who sees an ad then searches for the app counts as \"search\", not as the ad. And on iOS, ad attribution goes through an aggregated, delayed Apple framework: paid sources are read in your attribution tool, never in the store alone."
- request : « le nombre d'installations en {month}, ventilé par source » / "the number of installs in {month}, broken down by source"
- noReferenceReason : recopier celle du SaaS.

**`acq.cac`**
- name : « CAC par abonné » / "CAC per subscriber"
- oneLiner : « Ce que coûte, en moyenne, un nouvel abonné payant. » / "What a new paying subscriber costs, on average."
- formula : « dépense d'acquisition du mois ÷ nouveaux abonnés payants du mois » / "acquisition spend in the month ÷ new paying subscribers in the month"
- inputs : « Dépense d'acquisition en {month} » / "Acquisition spend in {month}" ; « Nouveaux abonnés payants en {month} » / "New paying subscribers in {month}"
- where :
  1. google-ads · « Apple Search Ads, Google Ads, Meta Ads Manager » · « le montant dépensé en {month}, toutes campagnes confondues » / "the amount spent in {month}, all campaigns together"
  2. role finance · « Finance » · recopier le chemin du SaaS (variantes « + équipe » et « tout chargé »)
  3. revenuecat · « RevenueCat » · « le graphique Paid Subscriptions du mois : les premières périodes payées, essais exclus » / "the Paid Subscriptions chart for the month: first paid periods, trials excluded"
- trap : « Le coût par installation n'est pas un CAC : divise par les abonnés payants, pas par les installations. » / "Cost per install isn't a CAC: divide by paying subscribers, not by installs."
- request : « la dépense d'acquisition en {month} ({variant}) et le nombre de nouveaux abonnés payants du même mois » / "the acquisition spend in {month} ({variant}) and the number of new paying subscribers that same month"
- noReferenceReason : « il n'y a pas de bon CAC dans l'absolu : il se juge contre ce qu'un abonné rapporte (payback, LTV:CAC) » / "there is no good CAC in absolute terms: it is judged against what a subscriber brings in (payback, LTV:CAC)"
- variants : mêmes ids et libellés que le SaaS.

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
- where : 1. ga4 · « GA4 (Firebase) » · « pas de médiane dans les rapports standards : à demander à la data, depuis l'export des événements » ; 2. amplitude · « Amplitude ou Mixpanel » · « l'entonnoir première ouverture puis {event}, affiché en temps de conversion » / "the first open then {event} funnel, shown as time to convert"
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
- oneLiner : « Pourquoi les abonnés partent, et comment tu le sais. » / "Why subscribers leave, and how you know."
- where :
  1. revenuecat · « RevenueCat » · « le graphique Play Store Cancel Reasons, pour Android ; Apple ne transmet pas de raison » / "the Play Store Cancel Reasons chart, for Android; Apple doesn't pass on a reason"
  2. role support · « Support » · « relire les avis du store et les messages des derniers départs » / "read the store reviews and the messages of the latest cancellations"
- trap, request, choices : recopier (« clients » → « abonnés » dans le texte).

**`ref.mechanism`** : recopier ; trap : « … la part des installations recommandées » / "… the referred share of installs".

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
- where : 1. product-db · « Table d'invitations » · « les invités qui ont installé, rattachés à la cohorte de celui qui les a invités » ; 2. amplitude · « Amplitude ou Mixpanel » · recopier.
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
- trap : « Prends le MRR avant la commission des stores : RevenueCat appelle « Proceeds » le montant après commission et taxes. La commission va dans la marge brute, pas ici. Un abonnement annuel compte pour un douzième de son prix chaque mois. » / "Take the MRR before the stores' commission: RevenueCat calls the amount after commission and taxes \"Proceeds\". The commission goes into the gross margin, not here. An annual plan counts for a twelfth of its price each month."
- request : « le MRR à fin {month}, avant commission des stores, et le nombre d'abonnés payants à la même date » / "the MRR at the end of {month}, before the stores' commission, and the number of paying subscribers on the same date"
- noReferenceReason : recopier.

**`rev.gross-margin`**
- name : recopier ; oneLiner : « Ce qu'il reste d'un abonnement après la commission des stores et le coût de servir l'abonné. » / "What is left of a subscription after the stores' commission and the cost of serving the subscriber."
- formula : « (revenu – commission des stores – coûts directs : serveurs, frais de paiement du web, support) ÷ revenu » / "(revenue – store commission – direct costs: servers, web payment fees, support) ÷ revenue"
- inputs : recopier (« Marge brute sur ce MRR », « MRR à fin {month} »).
- where :
  1. role finance · « Finance » · recopier le chemin du SaaS.
  2. revenuecat · « RevenueCat » · « l'écart entre la vue Revenue et la vue Proceeds du même mois : la commission et les taxes retenues par les stores » / "the gap between the Revenue and the Proceeds views for the same month: the commission and taxes the stores keep"
- trap : « La commission des stores est souvent ton premier coût, à 15 % ou 30 % selon le store, ton programme et l'âge de l'abonnement. L'oublier gonfle la LTV et raccourcit le payback. » / "The stores' commission is often your largest cost, at 15% or 30% depending on the store, your programme and the subscription's age. Leaving it out inflates the LTV and shortens the payback."
- request : « la marge brute du dernier trimestre clos, commission des stores déduite, et ce que ses coûts directs comprennent » / "the gross margin of the last closed quarter, store commission deducted, and what its direct costs include"
- noReferenceReason : « les repères publiés portent sur le SaaS, sans commission de store » / "the published references are for SaaS, with no store commission"

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

**Les cinq calculés** (`ENGINE_DERIVED_CATALOG_CONSUMER`) : recopier ceux du
SaaS en remplaçant :
- dans les formules, « ARPA » par « revenu mensuel par abonné » / "monthly
  revenue per subscriber" ;
- dans les réserves de GRR et NRR, « le churn logo tient lieu de churn en
  revenu, comme si les clients partis payaient l'ARPA moyen » par « le churn
  des abonnés tient lieu de churn en revenu, comme si les abonnés partis
  payaient le revenu moyen » / "subscriber churn stands in for revenue churn,
  as if the subscribers who left paid the average revenue" ;
- `rev.cac-payback` et `rev.ltv-cac` **sans** `caveat` de repère (leur repère
  est retiré, §21.5.1) : `caveat` absent.

#### 21.5.3 Ce que la page passe à l'îlot (`engine-props.ts`)

`EngineWorkbenchProps` gagne :

```ts
/** §21.5: the consumer app's prose, resolved like `metrics`/`derived`. Only the 17 + 5 self-serve ids. */
typeCatalogs: { "consumer-app": { metrics: ResolvedMetric[]; derived: ResolvedDerived[] } };
/** §21.6: the consumer app's copy overlay, resolved; merged once at the top of the island. */
typeStrings: { "consumer-app": DeepPartial<EngineStrings> };
```

`resolveEngineProps` les remplit avec `resolveTree`, dans l'ordre de
`METRIC_SHAPES` et `DERIVED_SHAPES`, et `glossaryHref` depuis
`displayShapeOf(id, "consumer-app").glossary`.

**Le poids.** Ces props voyagent dans le HTML de la page, prérendu. U1 et U2
mesurent le HTML de `/fr/aarrr-funnel-template` avant et après (taille brute et
gzip), et l'écrivent dans l'entrée du journal ; au-delà de +60 ko gzip,
s'arrêter et le dire à Antoine (`VERCEL.md` n'est plus une contrainte, mais le
premier rendu l'est).

**Dans l'îlot**, une seule fonction choisit : `metricsFor(type)` et
`derivedFor(type)` renvoient le catalogue SaaS pour `"b2b-saas"`, celui de
l'app pour `"consumer-app"`. `EngineWorkbench` les appelle une fois, sur le
moteur à l'écran, et passe le résultat partout où il passe aujourd'hui
`metrics` et `derived`.

---

### 21.6 La copie de l'écran et des slides (U2)

#### 21.6.1 Le mécanisme

- **`src/lib/engine/strings.ts`** gagne deux types et une fonction pure :

```ts
export type DeepPartial<T> = T extends string ? T : T extends readonly (infer U)[] ? T : { [K in keyof T]?: DeepPartial<T[K]> };
/** The base with every leaf the overlay carries replaced; arrays replaced whole. Never mutates either. */
export function mergeStrings<T>(base: T, overlay: DeepPartial<T> | undefined): T;
```

- **`src/content/engine-copy-consumer.ts`** (nouveau, serveur seulement,
  `// TODO: à relire` en tête) :

```ts
import type { Translatable } from "@/lib/i18n/translatable";
import type { ENGINE_COPY } from "./engine-copy"; // type only
/** A copy tree where any branch may be left out; a leaf is still a whole { fr, en }; an array is replaced whole. */
type DeepPartialTranslatable<T> = T extends Translatable ? Translatable : T extends readonly unknown[] ? T : { [K in keyof T]?: DeepPartialTranslatable<T[K]> };
export const ENGINE_COPY_CONSUMER: DeepPartialTranslatable<typeof ENGINE_COPY> = { … };
```

  Il ne contient **que** les feuilles qui changent. `resolveEngineProps` le
  résout avec `resolveTree` (qui accepte un arbre partiel : vérifier, sinon
  ajouter le test dans `translatable.test.ts`).
- **`EngineWorkbench.tsx`** calcule, une fois par rendu et **seulement là** :
  `const strings = setup.type === "consumer-app" ? mergeStrings(props.strings,
  props.typeStrings["consumer-app"]) : props.strings;` (mémoïsé sur le type).
  Tout ce qui est en dessous reçoit `strings` comme aujourd'hui. La carte de
  départ et l'exemple, avant qu'un moteur existe, prennent le type du choix
  en cours.
- Rien d'autre ne lit `typeStrings`. Un test statique le garde (un seul
  fichier de l'îlot nomme `typeStrings`).

#### 21.6.2 Le lexique (FR / EN)

| SaaS B2B | App grand public | Accord |
|---|---|---|
| inscrit, inscrits (m.) | installation, installations (f.) | « nouvelles installations », « installations recommandées », « 100 installations », « activées », « actives à J30 » |
| inscription | installation | « le taux d'installation » |
| inscrits de la cohorte | installations de la cohorte | — |
| visiteurs, visiteurs uniques | visiteurs de la fiche | « ~333 visiteurs de la fiche pour 100 installations » |
| client, clients (payants) | abonné, abonnés (payants) | « nouvel abonné », « abonnés perdus » |
| ARPA | revenu mensuel par abonné | sur une slide : « revenu par abonné » si la place manque |
| SaaS, ton SaaS | app, ton app | « Nom de ton app » |
| sign-up(s) | install(s) | "new installs", "referred installs" |
| visitors | store page visitors | — |
| customer(s), paying customer(s) | subscriber(s), paying subscriber(s) | — |

Le MRR, l'ARR, le CAC, la LTV, le payback, la NRR et la GRR **gardent leur
nom** : RevenueCat les emploie pour les apps (annexe).

#### 21.6.3 Ce que le calque doit couvrir — la règle, et son test

**La règle.** Pour chaque feuille de `ENGINE_COPY` hors des chemins exclus
ci-dessous, si son français contient (insensible à la casse) `inscrit`,
`inscription`, `client`, `SaaS`, `visiteur` ou `ARPA`, ou son anglais
`sign-up`, `signup`, `signed up`, `sign up`, `customer`, `SaaS`, `visitor` ou
`ARPA`, alors `ENGINE_COPY_CONSUMER` porte **la même feuille**, réécrite avec
le lexique de §21.6.2.

**Les chemins exclus** (ce qu'une app ne montre jamais, puisque l'assisté n'y
existe pas) :
- les clés de premier niveau `hybrid`, `total`, `relays`, `pipeline`,
  `slgChain`, `faq`, `meta` et `page` (la page publique ne change pas, C63) ;
- toute feuille dont un segment du chemin **contient** `slg`, `Slg`,
  `hybrid`, `Hybrid`, `link` ou `Link` ;
- toute feuille dont un segment du chemin **est exactement** `sa`, `saNote`,
  `saTyped`, `both`, `bothNote` ou `bothTyped` (les options de la carte de
  départ propres au SaaS) ;
- ces chemins exacts, qui nomment les types eux-mêmes ou que l'app remplace
  par ses propres clés (§21.6.4) : toute la clé `start` (la carte de départ
  s'affiche avant qu'un type existe, et porte ses clés par type), `setup.types`,
  `setup.typeLater`, `setup.motions`, `setup.motionPlg`, `setup.motionSlg`,
  `setup.companyLabel`, `workbench.modelShort`, `example.bannerTitle`,
  `example.company`, et `tools` (des noms de produits).

Si une autre feuille désignée n'est jamais affichée pour une app, l'exécutant
ne l'ajoute pas aux exclusions de lui-même : il la réécrit (c'est sans risque),
ou il demande.

Le test imprime la liste des feuilles désignées quand il échoue, pour que
l'exécutant voie ce qui manque.

**Le test** (`src/content/__tests__/engine-copy-consumer.test.ts`), qui est le
critère d'acceptation d'U2 :
1. il parcourt `ENGINE_COPY`, applique la règle et les exclusions, et vérifie
   que chaque feuille désignée existe dans `ENGINE_COPY_CONSUMER` ;
2. il vérifie qu'aucune feuille de `mergeStrings(ENGINE_COPY,
   ENGINE_COPY_CONSUMER)`, hors chemins exclus, ne contient plus un des mots
   de la règle (avec une liste d'exceptions **nommées une par une**, chacune
   commentée : par exemple un libellé d'outil, ou une phrase qui parle du
   SaaS pour dire que le repère ne vaut pas pour une app) ;
3. il vérifie que chaque feuille du calque existe dans `ENGINE_COPY` (pas de
   clé orpheline) et a les **mêmes placeholders** que la feuille qu'elle
   remplace, dans les deux langues ;
4. les tests de contrat existants (`engine-copy.test.ts` : `TITLE_CONTRACT`,
   longueurs, glyphes des slides, `**`, « de {month} », tutoiement absent des
   slides, mots bannis, FR jamais identique à l'EN) s'appliquent **aussi** à
   la copie fusionnée de l'app : U2 les paramètre sur
   `[ENGINE_COPY, mergeStrings(ENGINE_COPY, ENGINE_COPY_CONSUMER)]`.

Le nombre de feuilles désignées a été estimé le 2026-10-04 à une centaine (le
français d'`engine-copy.ts` compte 45 lignes avec « inscrit », 99 avec
« client », 7 avec « SaaS », dont une partie dans les chemins exclus).

#### 21.6.4 Les feuilles nouvelles (pas des réécritures)

Ajoutées à `ENGINE_COPY` lui-même (elles servent aux deux types), « à relire » :

| Clé | FR | EN |
|---|---|---|
| `start.legendTypes` | Qu'est-ce que tu fais tourner ? | What are you running? |
| `start.ssTyped` | SaaS B2B, en libre-service | B2B SaaS, self-serve |
| `start.saTyped` | SaaS B2B, en vente assistée | B2B SaaS, sales-assisted |
| `start.bothTyped` | SaaS B2B, les deux | B2B SaaS, both |
| `start.app` | App grand public | Consumer app |
| `start.appNote` | Des abonnements, sur l'App Store ou Google Play. | Subscriptions, on the App Store or Google Play. |
| `start.defaultsApp` | Réglé pour une app grand public, en euros. Mois des chiffres : {month} ; installations suivies : {cohort}. | Set for a consumer app, in euros, on {month}'s figures and {cohort}'s installs. |
| `setup.appSells` | Une app grand public se vend en libre-service. | A consumer app sells self-serve. |
| `setup.typeFixed` | Pour changer de type, crée un nouveau moteur. | To change type, create a new engine. |
| `setup.companyLabelApp` | Nom de ton app | Your app's name |
| `setup.toolFamily.mobile` | Stores et abonnements | Stores and subscriptions |
| `workbench.modelShort.app` | App grand public | Consumer app |
| `tools.revenuecat` / `appsflyer` / `adjust` | RevenueCat / AppsFlyer / Adjust | idem |
| `example.bannerTitleApp` | Exemple : une app d'abonnement fictive | Example: a fictional subscription app |
| `example.companyApp` | Exemple d'app | Example app |

`workbench.modelShort.app` est le libellé de la barre du moteur
(`BoardHead.tsx:106`) : la règle de choix devient `type === "consumer-app" ?
modelShort.app : <la règle d'aujourd'hui>`.

**Les phrases que le calque doit écrire en premier** (les plus visibles ; elles
fixent le ton du reste) :
- `slideTitles.pelotonComplete` : « Sur 100 installations, {activated}, {d30} et **{paid}**. » / "Out of 100 installs, {activated}, {d30} and **{paid}**."
- `peloton.upstream` : « ~{n} visiteurs de la fiche pour 100 installations · {source} · {month} » / "~{n} store page visitors for 100 installs · {source} · {month}"
- `peloton.signups` : « Installations » / "Installs"
- `peloton.sameHundredCount` : « Tes {n} installations en {cohort} sont ramenées à 100 pour se lire en pourcentages : chaque colonne est comptée sur ces mêmes 100. Pour changer ce nombre, change tes installations de la cohorte, pas le 100. »
- `slideTitles.leakClearCustomers` : « Ramener {stage} à {target} ajouterait **{n} abonnés payants** par mois. » / "… would add **{n} paying subscribers** a month."

---

### 21.7 Les calculs : rien ne bouge, et c'est un test

Aucun module de `lib/engine/` ne lit `setup.type` pour calculer, à une
exception près : `deck-unit.ts` pour le pointillé du repère (§21.8). Les
hypothèses imprimées (« mêmes visiteurs », « le churn logo tient lieu de
churn en revenu »…) gardent leurs ids ; leurs **mots** passent par le calque
(§21.6), par exemple `churn-as-revenue` : « le churn des abonnés tient lieu de
churn en revenu ».

**Le test d'invariance** (`business-type.test.ts`, U0) : pour l'exemple SaaS
(§6.0), l'exemple hybride pris en libre-service seul, l'exemple de l'app
(§21.9) et 200 états tirés au hasard (graine fixe), `deriveEngine`,
`buildScenario` et `leverAlone` donnent des objets **égaux en profondeur** que
`setup.type` vaille `"b2b-saas"` ou `"consumer-app"`, à `strings` égales. Le
sabotage qui doit le faire rougir : un `if (setup.type === "consumer-app")` qui
change un nombre dans `unit-economics.ts`.

---

### 21.8 Les slides

- **Le modèle du deck ne change pas** : mêmes slides, même ordre, mêmes cases
  cochées. Les titres et les lignes passent par les `strings` fusionnées
  (§21.6), donc par le lexique.
- **`PaybackChart`** : pour une app, `reference: null` (le repère de 12 mois
  est retiré, §21.5.1), donc ni pointillé ni étiquette « 12 mois · repère
  couramment cité ». `deck-unit.ts:53` lit le repère par
  `displayDerivedShapeOf("rev.cac-payback", state.setup.type)`. Pour le SaaS,
  rien ne change (golden v2 vert).
- **Le crédit et le fond** : inchangés.
- **L'export texte** (`deckMarkdown`) : mêmes règles, mots de l'app.
- **L'annexe** imprime la prose du catalogue de l'app (`metricsFor(type)`),
  donc « Où le trouver » avec App Store Connect et RevenueCat.

---

### 21.9 L'exemple chiffré de l'app

#### 21.9.1 Les entrées (`exampleConsumerMetrics(words)`, `lib/engine/example.ts`)

Une app d'abonnement fictive (méditation guidée), EUR, mois des flux
`2026-08`, cohorte suivie `2026-07`, activation sous 7 jours, paiement sous 30
jours, `type: "consumer-app"`, `motions: { plg: true, slg: false }`. « Aujourd'hui »
est le 24 septembre 2026 (`EXAMPLE_TODAY`, comme l'exemple SaaS).

| Id | Statut · source | Valeur saisie |
|---|---|---|
| `acq.signup-rate` | measured · app-store-connect | 12 000 installations ÷ 40 000 visiteurs de la fiche (août) |
| `acq.top-channel-share` | measured · app-store-connect | 5 400 ÷ 12 000, libellé « Recherche App Store » / "App Store search" |
| `acq.cac` | measured · finance, média seul | 18 000 € ÷ 360 nouveaux abonnés (août) |
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
| `rev.gross-margin` | **estimated** · ancien chiffre | 62 à 68 % (commission des stores comprise) |
| `rev.expansion` | measured · revenuecat | 284 € ÷ 28 400 € de MRR au 1er août |
| `rev.contraction` | measured · revenuecat | 142 € ÷ 28 400 € |

`base` : `monthSignups 12 000`, `cohortSignups 11 500`, `mrrEnd 28 800`,
`mrrStart 28 400`. **Cibles de l'équipe fictive** (`EXAMPLE_CONSUMER_TARGETS`) :
rétention à J30 15 %, conversion en abonné 4 %. Les mots
(`ExampleWords`) : l'événement et le libellé du canal ci-dessus.

`exampleEngine(words, motions)` gagne un troisième paramètre facultatif,
`type: BusinessType = "b2b-saas"` ; avec `"consumer-app"`, il construit ce jeu
(et refuse `motions.slg`). La signature d'aujourd'hui reste valable.

Pour les tests de `src/lib/engine/__tests__/`, `fixtures.ts` gagne
`consumerState()`, construit sur `exampleEngine(CONSUMER_WORDS, { plg: true,
slg: false }, "consumer-app")`.

#### 21.9.2 Ce que le moteur en sort (calculé le 2026-10-04 par le vrai moteur)

Valeurs brutes (les intervalles sont des points quand tout est mesuré ;
l'affichage arrondit selon `format.ts`, et ce sont les titres de slides ci-dessous
qui font foi pour l'affichage) :

| Grandeur | Valeur |
|---|---|
| Couverture | 17 chiffres : 15 trouvés, 1 approximatif, 0 introuvable, 1 en cours (demandé) |
| Peloton | ~333 visiteurs de la fiche pour 100 installations ; 5 recommandées ; activées 35, actives à J30 12, abonnées 3 ; chaîne `complete` ; cohorte non petite |
| Diagnostic | `clear`, nommée : `rev.paid-conversion`, base `mrr` ; `ret.d30` `below` (576 €/mois de MRR nouveau) ; `rev.paid-conversion` `below` (768 €/mois) ; 768 > 576 × 1,25 = 720 |
| LTV | 56,69 à 62,17 € (approximative : la marge est estimée) |
| CAC payback | 11,49 à 12,60 mois |
| LTV:CAC | 1,13 à 1,24 |
| GRR / NRR mensuelles | 92,5 % / 93,5 % (approximatives) |
| Contrôles de cohérence | aucun |
| Constats | un seul : rang 2, `below-comparator`, `rev.paid-conversion` |
| MRR / ARR aujourd'hui | 28 800 € / 345 600 € |
| Nouveau MRR du mois | 2 304 € (360 × 6,40 €) |
| MRR dans 12 mois | 32 479,21 € (ARR dans 12 mois 389 750,49 €) |
| Courbe (13 points, arrondis) | 28 800 · 29 232 · 29 636 · 30 014 · 30 367 · 30 697 · 31 006 · 31 294 · 31 564 · 31 816 · 32 052 · 32 273 · 32 479 |
| Durée de vie | 14,29 mois (100 ÷ 7) |
| Marge par abonné et par mois | 3,968 à 4,352 € |
| Mois de marge après le remboursement | 1,68 à 2,80 |
| Constat de perte | aucun (`none`, LTV – CAC = 6,69 à 12,17 €) |
| Alerte de payback long | aucune (sous le plancher de 30 mois) |
| Dépense d'un mois d'acquisition | 18 000 € |
| Trésorerie immobilisée | 103 401 à 113 407 €, un plancher |
| « Et si » conversion en abonné à 4 % seule | MRR dans 12 mois 39 020,02 € |
| « Et si » rétention à J30 à 15 % seule | MRR dans 12 mois 37 384,82 € |
| « Et si » les deux | MRR dans 12 mois 45 560,83 € ; nouveau MRR 3 840 € (la conversion suit la rétention : 4 % × 15/12 = 5 %, hypothèse `d30-drives-paying`) ; CAC 30 € à dépense égale ; payback 6,89 à 7,56 mois ; LTV:CAC 1,89 à 2,07 |

Les slides par défaut (français) : `peloton` (« Sur 100 installations, 35
atteignent la première valeur, 12 sont encore là à J30 et **3 paient**. »),
`leak` (`leakClearMrrNew` : la conversion en abonné, cible 4 %, ~770 €),
`visibility` (`visibilityOne` : 16 chiffres sur 17, « en un sprint »),
`unit-economics` (11 à 13 mois, 1,1 à 1,2 fois), `annex` et `annex:2`. `mirror`
et `ask` présentes, décochées. *Les fragments des titres viennent des
`peloton.clause*` et `subject` actuels ; le calque peut les réécrire, et le
golden de l'app (§21.10.2) fige ce qu'U2 aura écrit.*

---

### 21.10 Plan de tests

#### 21.10.1 Unitaires (Vitest)

| Fichier | Ce qu'il tient |
|---|---|
| `src/lib/engine/__tests__/business-type.test.ts` (U0, U1) | `openTypesWith` (vide, inconnu, doublons, espaces, ordre) ; `motionsAllowed` ; `displayShapeOf` renvoie la même référence pour `b2b-saas` ; les retraits et l'ajout de repère de §21.5.1 ; `setupToolsFor` ; l'invariance des calculs (§21.7) ; la garde statique des lectures de forme (§21.2.3) |
| `validate.test.ts`, `io.test.ts` (U0) | `consumer-app` accepté ; `consumer-app` avec l'assisté refusé ; `marketplace` toujours refusé ; un fichier SaaS inchangé |
| `src/content/__tests__/engine-catalog-consumer.test.ts` (U1) | les règles du catalogue SaaS appliquées au catalogue de l'app (§21.5.2) ; les ids des variantes et raisons identiques au SaaS |
| `src/content/__tests__/engine-copy-consumer.test.ts` (U2) | les quatre points de §21.6.3 |
| `src/lib/engine/__tests__/strings.test.ts` (U2) | `mergeStrings` : feuille remplacée, tableau remplacé entier, base jamais mutée, calque vide = base |
| `start.test.ts` (U3) | `typeOf`, `motionsOf("app")`, `startDefaults` ; la carte identique quand seul le SaaS est ouvert |
| `goatcounter` (U3) | `engineSetupDetail` : `app` pour l'app, inchangé sinon ; la liste fermée |
| `golden-consumer.test.ts` (U4) | voir ci-dessous |

#### 21.10.2 Le golden de l'app, et la garde du SaaS

- **`golden-consumer.test.ts`** (U4), sur le modèle de `golden-v2.test.ts` :
  entrées `golden-consumer-inputs.json` (l'exemple de l'app, l'exemple sans
  cibles, l'exemple avec les deux « Et si » de §21.9.2, un moteur vide de
  type app), sortie `golden-consumer.json` écrite **une fois** avec
  `ENGINE_GOLDEN_CONSUMER_WRITE=1` : `derived` entier, `deck`, `markdown`,
  `scenario`, en français et en anglais. Avant d'écrire le golden, U4 vérifie
  à la main que les nombres de §21.9.2 y sont ; s'ils diffèrent, s'arrêter et
  le dire (un écart veut dire que le moteur ou ce document a changé).
- **Le SaaS ne bouge pas** : `golden-v1` et `golden-v2` restent verts **sans
  toucher à `golden-projection.ts`**. C'est le critère d'acceptation de chaque
  PR U0 à U6.

#### 21.10.3 E2E (Playwright, build de production, aperçu propriétaire)

`e2e/engine-consumer.spec.ts` (U6), sur le modèle d'`engine-hybrid.spec.ts` :
1. la carte de départ propose « App grand public » ; la choisir, commencer,
   passer les cibles : la barre dit « App grand public », la liste des chiffres
   dit « Taux d'installation », « Conversion en abonné », « Revenu mensuel par
   abonné » ; en français à 1 280 px et en anglais à 390 px ;
2. l'écran d'un chiffre (`acq.signup-rate`) propose d'abord App Store Connect
   et Google Play Console dans ses sources ;
3. l'écran de `ret.d30` montre le repère 20 à 30 %, « pour situer » ;
   celui de `ret.logo-churn` n'en montre aucun ;
4. l'exemple de l'app : le titre du peloton dit « Sur 100 installations »,
   l'argent dit 28 800 € ;
5. les Réglages d'un moteur « app » : le type est grisé, avec « Pour changer de
   type, crée un nouveau moteur », et le champ de l'assisté n'existe pas ;
6. l'import d'un fichier « app » ; la fusion d'un fichier « app » dans un
   moteur SaaS est refusée avec la phrase existante ;
7. **build sans `ENGINE_TYPES`** (spec « type fermé », comme les specs « jeu
   fermé ») : la carte de départ est celle d'aujourd'hui, et « App grand
   public » est grisée dans la carte complète.

Et les specs existantes étendues :
- `engine-screens.spec.ts` : la carte de départ à cinq options, le tableau d'un
  moteur « app », passés à axe et aux largeurs 1 280, 390 et 320 ;
- `engine-canary.spec.ts` : un parcours « app » où chaque champ libre est
  rempli, et aucune requête ne le transporte ;
- `engine-deck.spec.ts` : le deck de l'exemple de l'app, sans pointillé de
  12 mois sur la slide d'unit economics.

#### 21.10.4 Non-vacuité, à mesurer à la livraison (`TESTING.md` §1.2)

| Sabotage | Ce qui doit rougir |
|---|---|
| Une feuille désignée retirée du calque | `engine-copy-consumer.test.ts`, point 1 |
| « inscrits » laissé dans une feuille du calque | point 2 |
| `displayShapeOf` qui copie l'objet au lieu de le renvoyer pour le SaaS | « même référence » de `business-type.test.ts` |
| Le repère de `ret.d30` mis à 20-35 | le test des bornes dans le texte du terme |
| Un `if (type === "consumer-app")` qui change la marge | l'invariance des calculs |
| `ENGINE_TYPES` ignoré par la page | la spec e2e 1 et la spec « type fermé » |

---

### 21.11 Découpage en PR

Chaque PR part de `main`, se merge dès qu'elle est verte en suivant `/livrer`
(lu, pas appelé), et garde le type fermé en production tant
qu'`ENGINE_TYPES` n'y est pas posé : rien de visible ne sort avant le bon à
tirer. Toute copie neuve porte « TODO: à relire ». Chaque PR ajoute son entrée
à la fin de `JOURNAL.md`.

| PR | Contenu | Fichiers principaux | Dépend de | Critère d'acceptation | Jours-agent |
|---|---|---|---|---|---|
| **U0 — Contrat et drapeau** | `BusinessType` élargi ; `business-type.ts` (sans les surcharges) ; `access.ts` (`openTypesWith`, `openTypesAtBuild`) ; `validate.ts`, `io.ts` ; `openTypes` en props ; `ci.yml` ; `.env.local.example` | `types.ts`, `business-type.ts`, `access.ts`, `validate.ts`, `io.ts`, `page.tsx`, `EngineWorkbench.tsx`, `ci.yml` | — | tests de §21.10.1 (U0) verts ; goldens v1 et v2 verts sans projection ; aucun écran changé | 1 |
| **U1 — Forme et prose** | `DISPLAY_OVERRIDES`, `displayShapeOf` branché aux cinq points de §21.2.3 ; trois outils et la famille `mobile` ; `engine-catalog-consumer.ts` ; `typeCatalogs` en props ; `metricsFor` | `business-type.ts`, `tools.ts`, `sources.ts`, `MetricSheet.tsx`, `deck-unit.ts`, `engine-props.ts`, `engine-catalog-consumer.ts`, `engine-copy.ts` (`tools`, `setup.toolFamily`) | U0 | `engine-catalog-consumer.test.ts` vert ; la garde statique ; le poids mesuré | 2 |
| **U2 — La copie de l'écran** | `DeepPartial`, `mergeStrings` ; `engine-copy-consumer.ts` ; `typeStrings` en props ; la fusion unique en tête de l'îlot | `strings.ts`, `engine-copy-consumer.ts`, `engine-props.ts`, `EngineWorkbench.tsx` | U1 | `engine-copy-consumer.test.ts` vert ; les tests de contrat sur la copie fusionnée ; le poids mesuré | 2,5 |
| **U3 — Le départ et le réglage** | `StartChoice`, `typeOf` ; la carte de départ à cinq options ; `Setup` avec le type en état ; les Réglages en lecture ; les feuilles nouvelles de §21.6.4 ; l'événement `engine_setup/app` | `EngineStart.tsx`, `start.ts`, `Setup.tsx`, `EngineWorkbench.tsx`, `BoardHead.tsx`, `engine-copy.ts`, `goatcounter.ts`, `EngineSection.tsx` | U2 | `start.test.ts` ; la carte inchangée sans le type ouvert ; captures FR 1 280 et EN 390 relues | 1,5 |
| **U4 — L'exemple de l'app** | `exampleEngine(…, type)` ; `consumerState()` ; l'exemple dans `ExampleView` ; `golden-consumer` | `example.ts`, `fixtures.ts`, `ExampleView.tsx`, `golden-consumer*.json`, `golden-consumer.test.ts` | U3 | les nombres de §21.9.2 retrouvés dans le golden | 1 |
| **U5 — Les slides** | le pointillé retiré pour l'app ; vérification visuelle du deck de l'exemple, FR et EN | `deck-unit.ts` (si pas déjà fait en U1), `SlideUnitEconomics.tsx` | U4 | captures des slides relues ; `engine-deck.spec.ts` étendu | 0,5 |
| **U6 — Intégration** | `engine-consumer.spec.ts` ; `engine-screens`, `engine-canary`, `engine-deck` étendus ; captures ; `ENGINE.md` (l'état) ; `CHANTIERS.md` (A21) | `e2e/`, `ENGINE.md`, `CHANTIERS.md`, `JOURNAL.md` | U5 | la suite e2e verte en CI ; la non-vacuité de §21.10.4 mesurée et écrite au journal | 1,5 |

Total ≈ **10 jours-agent**, chemin critique linéaire (U0 → U6). Vient ensuite
**A21.b**, le bon à tirer de toute la copie neuve de l'app (`/bon-a-tirer`,
depuis `grep -rn "TODO: à relire" src/`), puis l'ouverture du type par Antoine
(`ENGINE_TYPES=consumer-app` dans Vercel, puis redéployer).

---

### 21.12 Ce que l'exécutant ne tranche jamais, et quand il s'arrête

L'exécutant applique ce document. Il **s'arrête et pose la question à
Antoine**, sans coder de contournement, quand :
- un nombre de §21.9.2 ne sort pas du moteur (après avoir vérifié qu'il a bien
  saisi les entrées de §21.9.1) ;
- un golden v1 ou v2 rougit, quelle que soit la raison ;
- un point de lecture de forme existe hors de la liste de §21.2.3 et sa
  bonne lecture n'est pas évidente ;
- le poids de la page dépasse +60 ko gzip (§21.5.3) ;
- une phrase de la copie ne peut pas se réécrire avec le lexique sans changer
  de sens ;
- un nom d'écran d'outil cité ici n'existe plus dans la documentation de
  l'outil (il remplace alors le chemin par une description générique, comme le
  dit l'en-tête d'`engine-catalog.ts`, et le signale dans la PR).

Il ne change jamais : une formule, un id, la forme du fichier, la copie
validée du SaaS, le vocabulaire fermé de l'analytique au-delà de `app`.

---

### 21.13 Questions pour Antoine (C56 à C63)

*Posées le 2026-10-04. Le document applique chaque recommandation ; la
colonne « Si on renverse » dit ce qui change.*

| # | Question | Recommandation | Si on renverse |
|---|---|---|---|
| C56 | **Le périmètre** : les abonnements seulement en v1 (ni achats à l'unité, ni publicité, ni app payante sans abonnement) ? | **Oui.** Le modèle du MRR, de la LTV et de l'argent (A20) vaut tel quel pour un abonnement ; RevenueCat parle en MRR et en ARR. Les achats à l'unité et la publicité demandent un autre modèle de revenu (revenu par utilisateur actif, LTV tirée de la courbe de rétention) : un lot à part, ~5 jours-agent de plus | §21.0, §21.5 (deux chiffres de plus), §21.7 (des calculs propres au type), §21.9 |
| C57 | **La base** : « 100 installations », et les visiteurs de la fiche du store ? | **Oui.** C'est la base des rapports d'App Store Connect, de Google Play et de RevenueCat (ses cohortes partent de la première ouverture) | La base « comptes créés » garderait « inscrits » : le calque serait plus petit, mais la conversion de la fiche, le premier chiffre d'une app, sortirait du funnel |
| C58 | **iOS et Android** : un seul moteur, les deux stores additionnés ? | **Oui**, et le piège de §21.5.2 le dit ; qui veut les séparer fait deux moteurs (A14 en permet dix) | Un réglage « store » et des chiffres par store : un lot de plus |
| C59 | **La commission des stores** dans la marge brute, sans chiffre à part ? | **Oui** : un chiffre de moins, et la finance la compte déjà dans ses coûts directs ; le piège de la marge et celui du revenu par abonné le disent deux fois | Un dix-huitième chiffre, « commission moyenne des stores », et une marge « hors commission » : §21.5, §21.7 (un calcul de plus), §21.9 |
| C60 | **Les repères** : seule la rétention à J30 (20 à 30 %, déjà approuvée dans le glossaire) situe ; les repères SaaS (activation, churn, marge, payback, LTV:CAC) sont retirés ? | **Oui.** Un repère SaaS sur une app situerait mal ; aucun ne désigne de toute façon (C1) | Garder les repères SaaS avec une réserve « pour le SaaS » : moins de code (pas de retrait), mais un contexte trompeur |
| C61 | **Le type** se choisit à la création et ne change plus ? | **Oui** (D5) | Un type modifiable : l'écran « ce chiffre ne décrit plus la même chose » sur dix-sept chiffres, ~1 jour-agent de plus |
| C62 | **L'ouverture** : le type s'ouvre par `ENGINE_TYPES`, indépendamment du moteur ; l'ouverture du moteur n'attend pas ce lot ? | **Oui.** Le moteur SaaS ouvre d'abord (son bon à tirer nº9 est le seul verrou) ; l'app suit, drapeau à part | Si l'ouverture du moteur attend l'app : D2 de `CHANTIERS.md` gagne A21 et son bon à tirer |
| C63 | **La page publique** : rien de neuf (ni section, ni FAQ, ni terme de glossaire, ni changement de la promesse) ; l'app n'apparaît que sur la carte de départ ? | **Oui** en v1 : la page vise « AARRR funnel template », une requête SaaS, et la FAQ est tenue à six questions par un test. Un terme de glossaire (« taux d'installation » ou « rétention J1/J7/J30 ») pourra venir avec un relevé Search Console qui le justifie | Une septième question de FAQ (le test passe à sept) ou une section : copie neuve, et le test des six questions à changer |

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
- **Attribution iOS** : AdAttributionKit succède à SKAdNetwork (WWDC 2024),
  agrégé et différé ; il n'attribue pas les installations organiques. Source :
  [AppsFlyer, SKAdNetwork data insights](https://www.appsflyer.com/blog/trends-insights/skadnetwork-data-insights),
  [PPC Land, AttributionKit](https://ppc.land/apple-introduces-attributionkit/).
- **AppsFlyer** : installations par *media source*, coût et eCPI dans le
  tableau de bord *Overview*. Source :
  [AppsFlyer support](https://support.appsflyer.com/hc/en-us/articles/360008981698).
- **Firebase** : l'événement automatique `first_open` et les explorations de
  GA4 (entonnoir, cohortes).
