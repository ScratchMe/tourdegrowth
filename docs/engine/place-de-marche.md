# ENGINE.md, partie 6 — la place de marché (§22)

*Réécrit le 2026-10-04 sur les réponses d'Antoine (C64 à C74 et C93, §22.14),
contre le code de `main` (`9a7733d`) et les modèles purs livrés le même jour
(A23.b, #329). Le premier jet du même jour, écrit sur les recommandations,
est dans l'historique git ; il ne fait plus foi. **Il s'exécute après l'app
grand public** (§21, C74) : il suppose `shapesOf(setup)`, `business-type.ts`,
le drapeau `ENGINE_TYPES` et le mécanisme du calque de copie, que §21 crée.*

*C'est une **spécification d'exécution** pour un orchestrateur et des
sous-agents, selon [`executer-un-type.md`](executer-un-type.md) (§23). Un
sous-agent lit §22.0, §22.1, la fiche de son unité (§22.12) et ce qu'elle cite.
**Les écrans du tableau et les slides attendent le retour du brief 10 à Claude
Design** (C71) : leurs fiches (MKT-7, MKT-8) se complètent après ce retour, par
une PR de documentation de la session principale ; tout le reste s'exécute
sans lui. La copie neuve est écrite ici, ou produite par un lexique, et porte
`TODO: à relire` dans le code (convention 6).*

*Vérifié pour ce document : les mêmes modules que §21, plus
`slg-scenario.ts`, `slg-impact.ts`, `relays.ts`, `deck-slg.ts`, `total.ts`,
`_engine/MotionColumns.tsx`, `_engine/TotalBand.tsx`, `_engine/TargetsStart.tsx`.
Les définitions des chiffres sont sourcées en annexe.*

---

## 22. La place de marché — spécification A23

### 22.0 En une page

**Ce que c'est.** Le troisième type, « Place de marché » (`"marketplace"`).
Une place de marché a **deux côtés**, et chacun gagne à sa façon :

- **la demande** (les acheteurs) : la place de marché garde une **commission**
  sur chaque commande. Revenu net du mois = GMV × commission = acheteurs
  actifs × ce qu'un acheteur actif rapporte par mois (fréquence × panier ×
  commission). Les acheteurs actifs sont ceux qui ont commandé dans les 12
  derniers mois (C66) ;
- **l'offre** (les vendeurs) : **les abonnements des vendeurs** (C64, C93), un
  MRR comme celui du libre-service. Les nouveaux vendeurs abonnés du mois sont
  les vendeurs inscrits du mois × la conversion en abonné ; les abonnés partent
  à leur churn. Un réglage dit si les vendeurs paient un abonnement ; sans, la
  place de marché ne gagne que ses commissions.

Elle a donc son propre moteur, une troisième **motion**, `"mkt"`, qui ne se
combine avec rien, et **deux diagnostics, un par côté** (C70), comme les deux
moteurs de l'hybride : chaque côté a sa fuite, son « Et si », son économie
unitaire (un acheteur contre son CAC ; un vendeur abonné contre ce qu'il coûte),
et le tableau a un **sélecteur « côté affiché »** et un **total** (commissions
+ abonnements). Les deux côtés ne se comparent jamais et ne se classent jamais
entre eux.

- **Deux vocabulaires** (C65), réglés à la création : « produits » (acheteurs,
  vendeurs, commandes, annonces) ou « services » (clients, prestataires,
  réservations, profils). Le même moteur, deux calques de mots.
- **La liquidité** se lit en un chiffre, le **taux de service** : la part des
  demandes qui aboutissent à une commande. Il est chiffré sur les seuls
  nouveaux acheteurs, et le moteur dit que c'est un minimum (C68).
- **L'offre n'est chiffrée que par les abonnements** (C67) : garder un vendeur
  abonné, convertir un vendeur de plus. La première vente et le churn des
  vendeurs actifs sont nommés, sans montant.
- **Aucun repère publié** (C73). **Trois termes de glossaire** (GMV, take
  rate, liquidité) dans une unité à part (C72).
- **Les écrans et les slides passent d'abord par Claude Design** : le brief 10
  (C71) est écrit, déposé, puis lancé par Antoine ; son retour fixe les
  composants, puis les fiches MKT-7 et MKT-8 se complètent et s'exécutent.

**Les chiffres** : quatorze du premier jet, plus cinq pour les abonnements des
vendeurs (C93) : **19** avec les abonnements, **14** sans.

**Ce qui ne change pas.** Le SaaS, l'hybride et l'app : goldens v1, v2 et de
l'app verts **sans projection**. Aucune migration (des champs facultatifs dans
le réglage). Tout reste local, bilingue, déterministe ; seule une cible d'équipe
nomme une étape (C1) ; jamais de rouge sur une projection (S-5).

**Ce que le type ne fait pas en v1** (C64) : les annonces payantes et la
publicité vendues aux vendeurs, les places de marché où l'acheteur paie le
vendeur hors plateforme, la saisonnalité, l'effet de l'offre sur la demande.

**L'ouverture** : `ENGINE_TYPES=consumer-app,marketplace` (le drapeau de
§21.3), après le bon à tirer A23.

**L'effort** : quatorze unités (§22.12), ~31 jours-agent, plus l'aller-retour du
brief 10 (le temps de Claude Design et d'Antoine), puis le bon à tirer.

---

### 22.1 Les décisions de conception (décision · raison · alternative rejetée)

**D1 — Une motion dérivée, sans toucher aux cases.** `Motion` reste `"plg" |
"slg"` : les deux cases du réglage, et les ~130 lignes de code typées `Motion`
qui en dépendent ne changent pas. Un type plus large, `EngineMotion = Motion |
"mkt"`, sert là où une motion **dérivée** circule (le diagnostic, les
constats, les contrôles, les ponts, les slides, la série). Les motions actives
se dérivent : `activeMotions(setup)` vaut `["mkt"]` pour une place de marché,
les cases cochées sinon. *Raison* : élargir là où il faut plutôt que
restreindre partout ; le compilateur signale chaque endroit où une
`EngineMotion` atteint un paramètre `Motion`, et §22.2.5 dit quoi y faire.
*Rejeté* : `Motion` à trois valeurs (le premier jet), qui obligeait à revoir
toutes ces lignes et laissait passer en silence un `motion === "plg" ? … : …`
qui aurait lu la place de marché comme l'assisté ; un pipeline à part, qui
dupliquerait les écrans génériques.

**D2 — Deux côtés dans la motion, comme les deux moteurs de l'hybride** (C70).
`MotionDerived` de la motion `"mkt"` porte `sides: { demand, supply }`, chacun
avec son diagnostic et son économie unitaire, et un `total`. **Aucune fonction
ne voit les candidats des deux côtés** (le principe de §18.6.1) : il n'y a pas
de « plus grosse fuite des deux côtés ». *Rejeté* : une seule fuite pour les
deux côtés (la recommandation de C70, que la réponse a renversée).

**D3 — L'argent de la demande se compte en revenu net, sur le modèle du MRR**
(C66, premier jet inchangé) : R = acheteurs actifs × a ; la boucle du MRR,
gardée à 1 − churn des acheteurs, plus les nouveaux acheteurs × a ;
`mkt-model.ts#demandPath`.

**D4 — L'offre est chiffrée par ses abonnements seulement** (C67). La
conversion en vendeur abonné (un flux : les vendeurs inscrits du mois × la
conversion) et le churn des vendeurs abonnés (une rétention) sont chiffrés en
MRR des abonnements ; la première vente, le churn des vendeurs actifs **et le
taux d'inscription des vendeurs** sont nommés sans montant. *Raison* : C67
cite « garder un vendeur payant, convertir un vendeur de plus », et rien
d'autre ; attirer un vendeur de plus n'en fait pas un abonné. *À confirmer
par Antoine au bon à tirer* : chiffrer aussi l'inscription des vendeurs ne
change qu'une ligne (`SUPPLY_PRICED`, §22.5.6).

**D5 — Le taux de service est chiffré sur les seuls nouveaux acheteurs** (C68,
premier jet inchangé) ; l'hypothèse imprimée dit que c'est un minimum.

**D6 — Les leviers d'argent jouent sur tous, dès le mois suivant** (C69) : la
fréquence, le panier et la commission sur tous les acheteurs ; le prix des
abonnements sur tous les vendeurs abonnés. `mkt-model.ts#demandPath` et
`#sellerPath` le font (`moneyRatio`, `priceRatio`).

**D7 — Une marge par flux** (C93) : `mkt.rev.gross-margin` reste celle des
commissions ; `mkt.sell.gross-margin` est celle des abonnements.

**D8 — Le coût d'un vendeur abonné se déduit** (C93) : le chiffre saisi reste
le coût d'un nouveau vendeur **actif** (`mkt.sell.cac`, qui sert aussi sans
abonnements) ; le coût d'un vendeur abonné = ce coût × la première vente ÷ la
conversion en abonné, sur la même cohorte (`paidSellerCac`). « Un vendeur actif
coûte 100 € ; sur 100 inscrits, 30 vendent et 15 s'abonnent : un abonné coûte
100 × 30/15 = 200 €. »

**D9 — Les abonnements des vendeurs sont un réglage** (C64) : la case « Les
vendeurs paient un abonnement » (`setup.sellerSubscriptions`), **décochée par
défaut**, modifiable dans les Réglages (comme les motions : rien n'est perdu).
Décochée, les cinq chiffres des abonnements ne s'affichent pas, l'offre n'a
pas d'argent, et le total est le revenu net des commissions. *Raison* : la
plupart des places de marché transactionnelles n'en ont pas ; une case évite
cinq chiffres « sans objet ». *Antoine peut changer le défaut au bon à tirer.*

**D10 — Deux vocabulaires par un réglage et un calque** (C65) :
`setup.offering: "products" | "services"`, choisi à la création, modifiable
dans les Réglages (il ne change que des mots). La copie de la place de marché
est écrite avec les mots « produits » ; le calque « services »
(`ENGINE_COPY_MKT_SERVICES`, le mécanisme de §21.8.1) et la prose « services »
du catalogue (`ENGINE_CATALOG_MKT_SERVICES`) réécrivent par le lexique de
§22.8.4.

**D11 — Pas de nouvelle version de fichier** : les champs de la place de marché
(`offering`, `sellerSubscriptions`, trois fenêtres) sont facultatifs dans
`EngineSetup`, lus avec leurs défauts.

**D12 — Aucun repère publié** (C73). Chaque chiffre porte un
`noReferenceReason`.

**D13 — Les écrans attendent Claude Design** (C71). Le contrat de données des
écrans (ce que chaque écran doit montrer, dans quel ordre de lecture, avec
quels chiffres) est fixé ici (§22.6.2, §22.7) ; **la forme** (composants,
disposition) vient du retour du brief 10. Le modèle, le réglage, la copie et
l'exemple n'attendent pas.

**D14 — Jamais « offre contre demande »**. Aucun gabarit ne compare les deux
côtés ; un test garde les mots (§22.8.3, point 6).

**D15 — Un calque de mots par côté** (§22.8.1). Les écrans et les slides
génériques (la fuite, l'argent, l'« Et si », l'économie unitaire) servent les
deux côtés tels quels ; leurs feuilles qui disent « client » ou « MRR » se
réécrivent, par une règle testée, en « acheteur » et « revenu net » pour la
demande, en « vendeur abonné » et « MRR des abonnements » pour l'offre.
*Raison* : le mécanisme de l'app (§21.8), sans dupliquer un seul gabarit ni un
seul écran ; les accords tiennent parce que les genres concordent. *Rejeté* :
des titres `mkt*` copiés de chaque titre générique (le premier jet), qui
doublaient le contrat des titres et laissaient l'offre sans mots.

---

### 22.2 Le contrat

#### 22.2.1 `src/lib/engine/types.ts`

Chaque bloc dit l'unité qui l'écrit : un type qui élargit une union indexée
par un `Record<…>` (un id de chiffre, de candidat, de levier, de compte
partagé) s'ajoute **avec** les entrées que ce `Record` exige, donc dans
l'unité qui les écrit.

```ts
// MKT-0
export type BusinessType = "b2b-saas" | "consumer-app" | "marketplace";
// Motion ("plg" | "slg") and MOTIONS are unchanged.

/** Every motion an engine derives (§22.1 D1): the two the setup ticks, and the marketplace's own — derived from `setup.type`, never stored, never combined. */
export type EngineMotion = Motion | "mkt";
export const ENGINE_MOTIONS: readonly EngineMotion[] = ["plg", "slg", "mkt"];

export interface EngineSetup {
  // … unchanged (`motions: Record<Motion, boolean>`: a marketplace stores both false, §22.3), plus:
  /** Marketplace (C65): the words it is read in. Absent = "products". */
  offering?: "products" | "services";
  /** Marketplace (C64, D9): sellers pay a subscription. Absent = false. */
  sellerSubscriptions?: boolean;
  /** Marketplace: part of mkt.buy.first-order's definition. Absent = 30. */
  firstOrderWindowDays?: 7 | 30 | 90;
  /** Marketplace: part of mkt.buy.repeat's definition (a second order within it). Absent = 90. */
  repeatWindowDays?: 60 | 90 | 180;
  /** Marketplace: part of mkt.sell.first-sale's and mkt.sell.paid-conversion's definitions. Absent = 60. */
  firstSaleWindowDays?: 30 | 60 | 90;
}

/** The marketplace's two sides (C70): each its diagnosis, its levers, its unit economics. */
export type MktSide = "demand" | "supply";

export interface Diagnosis<C extends CandidateId = SelfServeCandidateId> {
  motion: EngineMotion;          // was Motion
  // … the rest as §21.2.1, plus:
  /** Marketplace only: which side this diagnosis is (C70). */
  side?: MktSide;
}
// The other derived `motion` fields widen the same way, and only these:
// SanityCheck.motion?, Finding.motion?, BridgeRow.motion, Slide.motion? (the deck's), MotionSeries.motion → EngineMotion.
// Finding and SanityCheck also gain `side?: MktSide`.

// MKT-1
export type MktMetricId =
  // the first draft's fourteen
  | "mkt.buy.signup-rate" | "mkt.buy.cac" | "mkt.sell.cac" | "mkt.buy.first-order" | "mkt.sell.first-sale"
  | "mkt.liq.fill-rate" | "mkt.buy.repeat" | "mkt.buy.churn" | "mkt.sell.churn" | "mkt.buy.referred-share"
  | "mkt.rev.take-rate" | "mkt.rev.aov" | "mkt.rev.frequency" | "mkt.rev.gross-margin"
  // the sellers' subscriptions (C64, C93)
  | "mkt.sell.signup-rate" | "mkt.sell.paid-conversion" | "mkt.sell.arpa" | "mkt.sell.paid-churn" | "mkt.sell.gross-margin";
export type MetricId = PlgMetricId | SlgMetricId | LinkMetricId | AppMetricId | MktMetricId;

export type MktDerivedId =
  | "mkt.rev.ltv" | "mkt.rev.cac-payback" | "mkt.rev.ltv-cac"        // a buyer
  | "mkt.sell.ltv" | "mkt.sell.cac-payback" | "mkt.sell.ltv-cac";    // a paid seller
export type DerivedId = PlgDerivedId | SlgDerivedId | AppDerivedId | MktDerivedId;

export type SharedCount =
  /* today's eight (with appActives) */
  | "mktCohortSignups" | "mktOrders" | "mktGmv" | "mktNetRevenue"
  | "mktSellerCohortSignups" | "mktSellerMrrEnd";
// UnitInputId gains the inputs of the six derived figures (§22.4.3).

// MKT-2
export interface MktUnitEconomics {
  /** The side's CAC variant (mkt.buy.cac, or mkt.sell.cac for the supply). */
  cacVariant: string | null;
  /** a for a buyer; the subscription for a paid seller. */
  revenuePerMonth: DerivedValue;
  ltv: DerivedValue;
  payback: DerivedValue;
  ltvCac: DerivedValue;
  /** Supply only: what a paid seller costs (D8). */
  cac?: DerivedValue;
}

// MKT-3
export type MktDemandLeverId =
  | "mkt.buy.signup-rate" | "mkt.buy.referred-share" | "mkt.buy.first-order" | "mkt.liq.fill-rate"
  | "mkt.buy.churn" | "mkt.rev.frequency" | "mkt.rev.aov" | "mkt.rev.take-rate";
export type MktSupplyLeverId = "mkt.sell.paid-conversion" | "mkt.sell.paid-churn" | "mkt.sell.arpa";
export type LeverId = PlgLeverId | SlgLeverId | AppLeverId | MktDemandLeverId | MktSupplyLeverId;
// LeverView.unit (scenario.ts) gains "ratio" (the order frequency).

// MKT-4
export type MktDemandCandidateId =
  | "mkt.buy.signup-rate" | "mkt.buy.first-order" | "mkt.liq.fill-rate"
  | "mkt.buy.referred-share" | "mkt.buy.repeat" | "mkt.buy.churn";
export type MktSupplyCandidateId =
  | "mkt.sell.signup-rate" | "mkt.sell.first-sale" | "mkt.sell.paid-conversion"
  | "mkt.sell.churn" | "mkt.sell.paid-churn";
export type MktCandidateId = MktDemandCandidateId | MktSupplyCandidateId;
export type CandidateId = PlgCandidateId | SlgCandidateId | AppCandidateId | MktCandidateId;
// SanityId gains "mkt-repeat-gt-first" | "mkt-take-high".

/** One side of a marketplace, derived on its own (C70, §18.6.1's rule). */
export interface MktSideDerived {
  side: MktSide;
  diagnosis: Diagnosis<MktCandidateId>;
  unit: MktUnitEconomics;
}
/** Commissions + the sellers' subscriptions (S9: a total only when both counted parts are known). */
export interface MktTotal {
  now: { demand: DerivedValue; supply: DerivedValue | null; total: DerivedValue };
  newPerMonth: { demand: DerivedValue; supply: DerivedValue | null; total: DerivedValue };
  in12Months: { demand: DerivedValue; supply: DerivedValue | null; total: DerivedValue };
}
export type MotionDerived =
  | /* the plg and slg branches, unchanged */
  | { motion: "mkt"; coverage: Coverage; funnel: MktFunnel; sides: { demand: MktSideDerived; supply: MktSideDerived }; total: MktTotal };
```

`null` pour `supply` dans `MktTotal` : les vendeurs ne paient pas d'abonnement.
`TotalView` garde ses `Record<Motion | "total", …>` (le total de l'hybride).
`DeckModel.byMotion` reste `Record<Motion, …>` : ce que le deck d'une place de
marché porte par côté vient du retour du brief 10 (MKT-8).

#### 22.2.2 `src/lib/engine/setup-type.ts` et `business-type.ts` (MKT-0)

Ce que `catalog-shape.ts`, `cohort.ts` ou `derive.ts` lisent du type va dans le
module feuille **`setup-type.ts`** (§21.2.2 : des `import type` seulement, pour
qu'aucun cycle de valeurs ne naisse) ; `business-type.ts` le réexporte.

```ts
// src/lib/engine/setup-type.ts — gains (MOTIONS is a value of types.ts, which imports nothing of the engine)
import { MOTIONS } from "./types";
/** §21.2.2 put the list here (access.ts, read by the Edge proxy, imports it): it gains the marketplace. */
export const BUSINESS_TYPES: readonly BusinessType[] = ["b2b-saas", "consumer-app", "marketplace"];
export function isMarketplace(setup: Pick<EngineSetup, "type">): boolean {
  return setup.type === "marketplace";
}
/** The motions an engine derives, in ENGINE_MOTIONS order (§22.1 D1). */
export function activeMotions(setup: Pick<EngineSetup, "type" | "motions">): EngineMotion[] {
  if (setup.type === "marketplace") return ["mkt"];
  return MOTIONS.filter((m) => setup.motions[m]);
}
/** The narrowing §22.2.5 uses where an EngineMotion reaches code written for the two selling motions. */
export function isSellingMotion(m: EngineMotion): m is Motion {
  return m !== "mkt";
}
export const MKT_DEFAULTS = { offering: "products", sellerSubscriptions: false, firstOrderWindowDays: 30, repeatWindowDays: 90, firstSaleWindowDays: 60 } as const;
/** The marketplace's own setup, each field from the setup or its default. */
export function mktSetup(setup: Pick<EngineSetup, "type" | "offering" | "sellerSubscriptions" | "firstOrderWindowDays" | "repeatWindowDays" | "firstSaleWindowDays">): {
  offering: "products" | "services"; sellerSubscriptions: boolean;
  firstOrderWindowDays: 7 | 30 | 90; repeatWindowDays: 60 | 90 | 180; firstSaleWindowDays: 30 | 60 | 90;
};
```

`setup-type.ts` importe la **valeur** `MOTIONS` de `types.ts` : c'est permis
(`types.ts` n'importe aucune valeur du moteur) ; le test d'APP-0 (« chaque
import est un `import type` ») gagne cette seule exception, nommée.

```ts
// src/lib/engine/business-type.ts — changes
export { isMarketplace, activeMotions, isSellingMotion, MKT_DEFAULTS, mktSetup } from "./setup-type";
/** What a type may tick: a marketplace ticks nothing — its motion is derived. */
export function motionsAllowed(type: BusinessType): readonly Motion[] {
  if (type === "marketplace") return [];
  return type === "consumer-app" ? ["plg"] : ["plg", "slg"];
}
```

`tools.ts` (§21.6.5) gagne `MKT_TOOL_FAMILIES`, que `toolFamiliesFor("marketplace")`
rend : `analytics` (ga4, mixpanel, amplitude, posthog), `billing` (stripe),
`crm` (hubspot, salesforce, pipedrive : l'offre se recrute souvent à la main),
`ads` (google-ads, meta-ads, linkedin-ads), `other` (product-db, spreadsheet).
La garde « qui lit le type » de §21.10.1 (garde 3) reste vraie : la place de
marché se lit par `isMarketplace`, `activeMotions` ou `mktSetup`.

#### 22.2.3 `src/lib/engine/catalog-shape.ts` (MKT-1)

- `MetricShape.scope` : `"plg" | "slg" | "link" | "app" | "mkt"`.
- `MetricShape.window` : ajouter `"first-order" | "repeat" | "first-sale"`.
- `MetricShape` gagne `side?: "buy" | "sell" | "match"` (l'étiquette de la liste
  des chiffres) et `sellerSubscription?: true` (les cinq chiffres que montre la
  case de D9).
- `shapesOf(setup)` : pour une place de marché, `MKT_METRIC_SHAPES`, moins les
  `sellerSubscription` quand `mktSetup(setup).sellerSubscriptions` est faux.
- `derivedShapesOf(setup)` : les trois calculés d'un acheteur, puis ceux d'un
  vendeur abonné avec les abonnements.
- `candidatesOf(motion)` ne sert pas la place de marché ; elle lit
  `mktCandidates(side, setup)` (§22.5.6).
- `motionOfMetric(id)` : préfixe `mkt.` → `"mkt"`, avant la règle actuelle ;
  son type de retour devient `EngineMotion` (§22.2.5 dit quoi faire là où le
  compilateur le signale).
- `metricsOfStageIn(stage, "mkt", setup)` : parmi `shapesOf(setup)`.
- `cohort.ts#windowDaysOf` : les trois fenêtres, via `mktSetup(setup)` ;
  `cohort.ts#defaultCohortMonth` : pour une place de marché,
  `matureCohortMonth(Math.max(firstOrder, repeat, firstSale), today)` (avec les
  défauts : 90 jours, la cohorte de mai pour un « aujourd'hui » au 24 septembre
  2026).
- Les listes : `MKT_METRIC_SHAPES`, `MKT_DERIVED_SHAPES`,
  `MKT_DEMAND_CANDIDATE_IDS`, `MKT_SUPPLY_CANDIDATE_IDS`,
  `MKT_DEMAND_LEVER_IDS`, `MKT_SUPPLY_LEVER_IDS`, `MKT_ENGINE_BRIDGES` ;
  `ALL_METRIC_SHAPES`, `ALL_DERIVED_SHAPES`, `ALL_LEVER_IDS` les incluent **à la
  fin**.
- Les règles partagées : `UNPRICED_CANDIDATES` += `mkt.buy.repeat`,
  `mkt.sell.first-sale`, `mkt.sell.churn`, `mkt.sell.signup-rate` (D4) ;
  `REFERRAL_CANDIDATES` += `mkt.buy.referred-share` ; une constante
  `LOWER_IS_BETTER_CANDIDATES = ["ret.logo-churn", "mkt.buy.churn",
  "mkt.sell.churn", "mkt.sell.paid-churn"]`, que `diagnose.ts#directionOf` lit à
  la place du test sur `"ret.logo-churn"` ; `TAKE_RATE_HIGH_PERCENT = 50`.

#### 22.2.4 `src/lib/engine/shared-counts.ts` (MKT-1)

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
// C93: the seller cohort and the sellers' subscription MRR.
mktSellerCohortSignups: [
  { metric: "mkt.sell.first-sale", side: "denominator" },
  { metric: "mkt.sell.paid-conversion", side: "denominator" },
],
mktSellerMrrEnd: [
  { metric: "mkt.sell.arpa", side: "numerator" },
  { metric: "mkt.sell.gross-margin", side: "denominator" },
],
```

`WHOLE_SHARED_COUNTS` += `mktCohortSignups`, `mktOrders`,
`mktSellerCohortSignups` (des personnes et des commandes ; les trois autres
sont des montants).

#### 22.2.5 Là où une `EngineMotion` arrive (MKT-0, MKT-1, MKT-4)

Élargir les champs de §22.2.1, puis `motionOfMetric` (MKT-1), fait signaler au
compilateur chaque endroit où une `EngineMotion` atteint du code typé `Motion`.
À chacun, **une seule** de ces trois réponses, dans cet ordre :

1. **Le code ne sert que le SaaS** (il est appelé depuis une branche `plg` ou
   `slg`, une slide du libre-service ou de l'assisté, le total de l'hybride) :
   rétrécir à l'appel, `if (!isSellingMotion(m)) continue;` (ou `return`), et
   ne rien changer d'autre.
2. **Un record de mots ou de libellés indexé par motion** (`Record<Motion, …>`
   dans `content/`, dans l'analytique, dans un composant) que la place de
   marché doit lire : l'élargir à `Record<EngineMotion, …>` et y mettre
   l'entrée `mkt` que ce document donne (§22.8.5, §22.9) ; **si ce document ne
   la donne pas, s'arrêter** et la lister dans le compte rendu.
3. **Une fonction générique sur les formes** (couverture, constats, contrôles,
   série, ponts, liste des chiffres) : l'élargir à `EngineMotion` et la faire
   lire `shapesOf(setup)` pour `"mkt"` (§22.2.3).

Jamais un `as Motion`, jamais un `motion === "plg" ? … : …` qui laisserait
`"mkt"` tomber dans la branche de l'assisté : un test de MKT-0
(`business-type.test.ts`) balaie `src/` hors tests et échoue sur `as Motion`.
Chaque endroit traité est listé, avec sa réponse, dans l'entrée du journal de
l'unité.

**Les endroits que `tsc` signale à MKT-1** (`motionOfMetric` rend une
`EngineMotion` ; relevés sur `9a7733d`, avant A22), avec leur réponse :

| Endroit | Réponse |
|---|---|
| `bridge.ts:86` (`state.setup.motions[motion]`) | 3 : `activeMotions(state.setup).includes(motion)` (les ponts de la place de marché passent) |
| `sanity.ts:105` (`addFor(motionOfMetric(shape.id))`) | 3 : `addFor` accepte une `EngineMotion` |
| `deck.ts:525` | 1 |
| `EngineWorkbench.tsx:92`, `:423`, `:935` (des comptes par motion) | 2 : `Record<EngineMotion, number>`, l'entrée `mkt` à `0` (un nombre, pas un mot : la règle 2 n'a pas besoin de copie ici) |
| `BoardNumbers.tsx:73`, `:86` | 1 jusqu'à MKT-7 |

**Ce que `tsc` ne signale pas** (des comparaisons sur un champ élargi, et des
boucles sur les deux cases), relevé sur `9a7733d`, avec l'unité qui le traite.
Une boucle `(["plg", "slg"] as const)` filtrée par `setup.motions[m]` ne rend
rien pour une place de marché (ses deux cases sont fausses) : c'est juste là
où elle ne doit pas passer, et à remplacer par `activeMotions` là où elle doit.

| Endroit | Ce qui se passerait | Traitement | Unité |
|---|---|---|---|
| `phrases.ts:77` `retentionOf` (`motion === "plg" ? … : "slg.ret.renewal"`) | une place de marché lue comme l'assisté | par côté : `diagnosis.side === "demand"` → `mkt.buy.churn`, `"supply"` → `mkt.sell.paid-churn` | MKT-4 |
| `phrases.ts:279-281` `notEnoughBelowValues` (`candidatesOf(diagnosis.motion)`) | aucune valeur pour l'offre `not-enough` | `Object.keys(diagnosis.positions) as CandidateId[]` : **APP-5 le fait déjà** (§21.5.4) ; MKT-4 vérifie seulement que l'offre `not-enough` reçoit sa phrase | MKT-4 |
| `series.ts:245` (boucle sur les deux cases) | la série d'une place de marché vide | `activeMotions(setup)` | MKT-4 |
| `deck.ts:377` `buildLeak` (`diagnosis.motion === "slg"`) | la fuite d'un côté lue par la chaîne du libre-service | aucune place de marché n'y passe : `buildMarketplaceDeck` construit ses fuites par `mktWhatIf` | MKT-8 |
| `deck-motions.ts:102`, `deck.ts:1601`, `deck-slg.ts:474`, `deck/SlideMirror.tsx:29`, `deck/SlideVisibility.tsx:54`, `deck/ask-defaults.ts:81` | rien pour une place de marché | `activeMotions` là où le deck de la place de marché les lit | MKT-8 |
| `Diagnosis.tsx:97`, `:139` ; `deck/SlideWhatIf.tsx:126`, `:137` | un côté lu comme le libre-service | selon le retour du brief 10 | MKT-7, MKT-8 |
| `settings-numbers.ts:26`, `TargetsStart.tsx:31`, `:50` | aucune cible proposée | `activeMotions`, puis les candidats d'un côté (§22.6.1) | MKT-6 |
| `ImportPanel.tsx:209` (la ligne d'aperçu d'un fichier) | aucune ligne pour une place de marché | une ligne par `activeMotions` | MKT-7 |

**Les lecteurs de `.diagnosis` sur `MotionDerived`** (`tsc` les signale à
MKT-4, quand la branche `mkt` n'a plus de `diagnosis`) passent par une
fonction de `phrases.ts`, à côté d'`AnyDiagnosis`, `diagnosesOf(m:
MotionDerived): AnyDiagnosis[]`
(`[m.diagnosis]` pour le libre-service et l'assisté ; `[demand, supply]` pour
la place de marché, dans cet ordre) :

| Endroit | Traitement |
|---|---|
| `deck/ask-defaults.ts:45` (`derived.motions.map((m) => m.diagnosis)`) | `derived.motions.flatMap(diagnosesOf)` (deux côtés qui nomment chacun une étape : rien n'est proposé, la règle d'aujourd'hui pour l'hybride) |
| `deck.ts:669` (`d.diagnosis.blind`) | `derived.motions.flatMap(diagnosesOf).some((d) => d.blind.includes(…))` |
| `findings.ts:125` (le type du paramètre de `namedFindings`) | `AnyDiagnosis` |
| `BoardNumbers.tsx:17` `diagnosisOf`, `MetricSheet.tsx:235` | 1 : la garde de type `m.motion !== "mkt"` dans le `find` ; MKT-7 leur donne la lecture par côté |
| `golden-v2.test.ts:93` | la même garde dans l'appel (une retouche d'appel, §21.10.1) |

**Le type élargi à travers le code d'A22** (`BusinessType` gagne
`"marketplace"`) : `displayShapeOf(id, "marketplace")` et
`displayDerivedShapeOf` rendent l'objet de `shapeOf(id)` lui-même (aucune
surcharge, comme pour `b2b-saas`) ; `toolFamiliesFor("marketplace")` rend
`MKT_TOOL_FAMILIES` (§22.2.2, MKT-0, `tools.ts`) ; `motionsAllowed` : §22.2.2 ;
`SetupShapes` (§21.2.3) devient `Pick<EngineSetup, "type" | "motions" |
"monetization" | "sellerSubscriptions">` ; `mktSetup` prend un `Pick<EngineSetup,
"type" | "offering" | "sellerSubscriptions" | "firstOrderWindowDays" |
"repeatWindowDays" | "firstSaleWindowDays">`.

---

### 22.3 Le fichier, la validation, l'import (MKT-0)

- **Le réglage d'une place de marché** stocke `type: "marketplace"`,
  `motions: { plg: false, slg: false }`, les quatre fenêtres du SaaS à leurs
  défauts (champs obligatoires, sans usage ici), et ses champs facultatifs.
- **`validate.ts#setupErrors`**, dans le style des messages existants
  (`"setup.<champ>: <raison>"`) : `type` dans `BUSINESS_TYPES`. Une place de
  marché :
  - une case cochée → `"setup.motions: a marketplace ticks no selling motion"` ;
  - `offering` présent et hors liste → `"setup.offering: not products or services"` ;
  - `sellerSubscriptions` présent et non booléen → `"setup.sellerSubscriptions: not a boolean"` ;
  - `firstOrderWindowDays` → `"setup.firstOrderWindowDays: not 7, 30 or 90"` ;
    `repeatWindowDays` → `"setup.repeatWindowDays: not 60, 90 or 180"` ;
    `firstSaleWindowDays` → `"setup.firstSaleWindowDays: not 30, 60 or 90"` ;
  - `monetization` présent → `"setup.monetization: only a consumer app has one"`.
  Un SaaS ou une app : la règle de §21.6.3, et chaque champ de la place de
  marché présent → `"setup.<champ>: only a marketplace has one"`.
- **Les fenêtres d'un mois clos** (`SnapshotWindows`, `types.ts`) gagnent trois
  champs facultatifs aux noms du réglage (`firstOrderWindowDays?`,
  `repeatWindowDays?`, `firstSaleWindowDays?`) ; `series.ts#windowsOf` les
  écrit pour une place de marché (depuis `mktSetup`), jamais pour un SaaS ou
  une app (les goldens n'y voient aucune clé neuve) ; `monthView`, qui étale
  `snapshot.windows` dans le réglage, n'a rien à apprendre ; `validate.ts` les
  accepte absents, ou dans leurs listes. `comparable` lit déjà la fenêtre d'un
  chiffre par `windowDaysOf` (§22.2.3) : un changement de fenêtre entre deux
  mois clos se voit.
- **`io.ts#sellsSomehow`** : un SaaS ou une app avec au moins une motion
  permise, ou une place de marché sans aucune — **et seulement quand
  `MARKETPLACE_SCREENS_READY`** (ci-dessous).
- **`merge.ts#mergeRefusal`** : deux places de marché dont
  `sellerSubscriptions` diffère refusent avec `"motions"` ; dont une des trois
  fenêtres (`mktSetup`) diffère, avec `"windows"` ; dont `offering` diffère,
  **fusionnent** (des mots seulement, le réglage de l'état reçu l'emporte).
- **La barrière des écrans** (`setup-type.ts`) : `export const
  MARKETPLACE_SCREENS_READY = false;`. Tant qu'elle vaut `false`,
  `access.ts#openTypesWith` ne rend jamais `"marketplace"` (même listée dans
  `ENGINE_TYPES` : la carte de départ ne la propose pas, la carte de réglage la
  grise) et `io.ts#sellsSomehow` refuse une place de marché (un fichier de
  place de marché importé reçoit le refus d'aujourd'hui, celui d'un fichier qui
  ne vend rien) : **aucun état de place de marché n'atteint l'îlot** avant
  que le tableau existe. MKT-7 la passe à `true` (et ses
  tests). Un test d'MKT-0 (`business-type.test.ts`) vérifie qu'elle vaut
  `false` ; les captures d'MKT-6 se prennent avec la constante passée à `true`
  **en local seulement**, remise à `false` avant le commit (`git diff` du
  fichier vide), ce que le test garde.
- `migrate.ts`, `storage.ts` : rien. `validate.ts#whatIf` lit `ALL_LEVER_IDS` :
  il accepte les leviers de la place de marché dès qu'MKT-3 les y met.

### 22.4 Le catalogue (MKT-1)

#### 22.4.1 La forme (`MKT_METRIC_SHAPES`)

Tous : `scope: "mkt"`, `span: 1`, aucun `benchmark` (D12). Les ★ portent la
colonne ou la ligne de leur étape côté demande ; l'offre n'en a pas (ses
colonnes sont décidées par le retour du brief 10). La dernière colonne marque
les cinq chiffres que montre la case des abonnements (D9, C93).

| Id | Étape | ★ | `side` | `valueKinds` → `unit` | Bornes, montants | `flow` / `window` | Effort | Rôle | `sources` | Glossaire | Tour | Variantes | Réparation | Abonnement |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `mkt.buy.signup-rate` | acquisition | ★ | buy | ratio, rate → percent | bornée | month | self-5min | marketing | ga4, mixpanel, amplitude, product-db | `acquisition` | — | — | afternoon | |
| `mkt.buy.cac` | acquisition | | buy | ratio, amount → money | — | month | ask | finance | google-ads, meta-ads, product-db | `cac` | `acq-3` | `media-only`, `plus-team`, `fully-loaded` | meeting | |
| `mkt.sell.cac` | acquisition | | sell | ratio, amount → money | — | month | ask | finance | hubspot, spreadsheet, linkedin-ads | `cac` | — | mêmes | meeting | |
| `mkt.sell.signup-rate` | acquisition | | sell | ratio, rate → percent | bornée | month | self-5min | marketing | ga4, mixpanel, amplitude, product-db | `acquisition` | — | — | afternoon | ✓ |
| `mkt.buy.first-order` | activation | ★ | buy | ratio, rate → percent | bornée | cohort / `first-order` | self-1h | data | product-db, amplitude, mixpanel | `activation` | `act-2` | — | sprint | |
| `mkt.sell.first-sale` | activation | | sell | ratio, rate → percent | bornée | cohort / `first-sale` | self-1h | data | product-db | `activation` | — | — | sprint | |
| `mkt.liq.fill-rate` | activation | | match | ratio, rate → percent | bornée | month | ask | data | product-db, amplitude, mixpanel | `activation` (puis le terme de MKT-G) | — | `requests`, `searches` | sprint | |
| `mkt.buy.repeat` | retention | ★ | buy | ratio, rate → percent | bornée | cohort / `repeat` | self-1h | data | product-db, amplitude | `retention` | `ret-1` | — | sprint | |
| `mkt.buy.churn` | retention | | buy | ratio, rate → percent | bornée | month | ask | data | product-db | `churn` | — | — | afternoon | |
| `mkt.sell.churn` | retention | | sell | ratio, rate → percent | bornée | month | ask | data | product-db | `churn` | — | — | afternoon | |
| `mkt.sell.paid-churn` | retention | | sell | ratio, rate → percent | bornée | month | self-5min | finance | stripe, product-db | `churn` | — | — | afternoon | ✓ |
| `mkt.buy.referred-share` | referral | ★ | buy | ratio, rate → percent | bornée | cohort | self-1h | marketing | product-db, hubspot | `referral` | — | — | sprint | |
| `mkt.rev.take-rate` | revenue | ★ | match | ratio, rate → percent | bornée, montants | month | self-5min | finance | stripe, spreadsheet, product-db | `revenue` (puis MKT-G) | — | — | meeting | |
| `mkt.rev.aov` | revenue | | buy | ratio, amount → money | — | month | self-5min | finance | product-db, stripe | `arpu` | — | — | meeting | |
| `mkt.rev.frequency` | revenue | | buy | ratio → ratio | non bornée | month | self-1h | data | product-db | `retention` | — | — | afternoon | |
| `mkt.rev.gross-margin` | revenue | | match | ratio, rate → percent | bornée, montants | month | ask | finance | spreadsheet | `cac-payback` | — | — | meeting | |
| `mkt.sell.paid-conversion` | revenue | | sell | ratio, rate → percent | bornée | cohort / `first-sale` | self-1h | data | product-db, stripe | `revenue` | — | — | sprint | ✓ |
| `mkt.sell.arpa` | revenue | | sell | ratio, amount → money | — | month | self-5min | finance | stripe, product-db | `arpu` | — | — | meeting | ✓ |
| `mkt.sell.gross-margin` | revenue | | sell | ratio, rate → percent | bornée, montants | month | ask | finance | spreadsheet | `cac-payback` | — | — | meeting | ✓ |

`mkt.buy.first-order` ne dépend d'aucun événement (la commande est
l'événement). L'ordre du tableau est l'ordre de `MKT_METRIC_SHAPES`.

#### 22.4.2 Les calculés (`MKT_DERIVED_SHAPES`)

Étape revenue, sans repère.

| Id | `inputs` | Glossaire | Tour | Abonnement |
|---|---|---|---|---|
| `mkt.rev.ltv` | `mkt.rev.frequency`, `mkt.rev.aov`, `mkt.rev.take-rate`, `mkt.rev.gross-margin`, `mkt.buy.churn` | `ltv` | `rev-2` | |
| `mkt.rev.cac-payback` | `mkt.buy.cac`, `mkt.rev.frequency`, `mkt.rev.aov`, `mkt.rev.take-rate`, `mkt.rev.gross-margin` | `cac-payback` | — | |
| `mkt.rev.ltv-cac` | les six d'un acheteur | `ltv` | — | |
| `mkt.sell.ltv` | `mkt.sell.arpa`, `mkt.sell.gross-margin`, `mkt.sell.paid-churn` | `ltv` | — | ✓ |
| `mkt.sell.cac-payback` | `mkt.sell.cac`, `mkt.sell.first-sale`, `mkt.sell.paid-conversion`, `mkt.sell.arpa`, `mkt.sell.gross-margin` | `cac-payback` | — | ✓ |
| `mkt.sell.ltv-cac` | les six d'un vendeur abonné | `ltv` | — | ✓ |

#### 22.4.3 Les listes

- `MKT_DEMAND_CANDIDATE_IDS` : `mkt.buy.signup-rate`, `mkt.buy.first-order`,
  `mkt.liq.fill-rate`, `mkt.buy.referred-share`, `mkt.buy.repeat`,
  `mkt.buy.churn` (ordre canonique).
- `MKT_SUPPLY_CANDIDATE_IDS` : `mkt.sell.signup-rate`, `mkt.sell.first-sale`,
  `mkt.sell.paid-conversion`, `mkt.sell.churn`, `mkt.sell.paid-churn` ; sans
  abonnements, `mktCandidates("supply", setup)` retire les trois candidats qui
  sont des chiffres d'abonnement (`signup-rate`, `paid-conversion`,
  `paid-churn`) et garde `mkt.sell.first-sale` et `mkt.sell.churn`, tous deux
  nommés sans montant.
- `MKT_DEMAND_LEVER_IDS` : `mkt.buy.signup-rate`, `mkt.buy.referred-share`,
  `mkt.buy.first-order`, `mkt.liq.fill-rate`, `mkt.buy.churn`,
  `mkt.rev.frequency`, `mkt.rev.aov`, `mkt.rev.take-rate`.
- `MKT_SUPPLY_LEVER_IDS` : `mkt.sell.paid-conversion`, `mkt.sell.paid-churn`,
  `mkt.sell.arpa` (avec les abonnements seulement).
- `MKT_ENGINE_BRIDGES` : `acq-3` → `mkt.buy.cac`, `act-2` →
  `mkt.buy.first-order`, `ret-1` → `mkt.buy.repeat`, `rev-2` → `mkt.rev.ltv`
  (dérivés des formes).
- `UNIT_INPUT_IDS` (`catalog-shape.ts`, §21.2.3) gagne les ids des entrées de
  `MKT_DERIVED_SHAPES` (tous `mkt.*`).
- **Ce que la page passe à l'îlot** (`engine-props.ts`, comme §21.4.7 pour
  l'app) : les props `metrics` et `derived` du SaaS **filtrent** les formes
  `scope === "mkt"` et les calculés dont l'id commence par `mkt.` (un test
  fige leurs comptes, ceux qu'A22 a posés) ; `typeCatalogs` gagne
  `marketplace` : les 19 chiffres et les six calculés d'`ENGINE_CATALOG`, dans
  l'ordre de `MKT_METRIC_SHAPES` et de `MKT_DERIVED_SHAPES`, résolus par
  `resolveTree` ; `_engine/view.ts#metricsFor(p, "marketplace")` et
  `derivedFor(p, "marketplace")` (§21.4.7) les rendent (MKT-S ajoute les mots
  « services »). Le poids du HTML se mesure (§21.4.7).
- **`phrases.ts#TRAPS_ASKING_DEFINITION`** gagne `mkt.liq.fill-rate`,
  `mkt.rev.take-rate` et `mkt.sell.signup-rate` (leurs pièges disent « Écris… »
  / "Write…" : ils portent le bouton « Écrire ta définition ») ;
  `trap-definition.test.ts` lit les chiffres de `EN.metrics` **et** de
  `EN.typeCatalogs.marketplace.metrics` (et de même en français).
- `unitInput` (`engine-copy.ts`) gagne les entrées des six calculés (douze ids) qui n'y
  sont pas (le test les exige) : `mkt.rev.frequency` « la fréquence de
  commande » / "order frequency" ; `mkt.rev.aov` « le panier moyen » / "the
  average order value" ; `mkt.rev.take-rate` « la commission » / "the take
  rate" ; `mkt.rev.gross-margin` « la marge sur le revenu net » / "the margin on
  net revenue" ; `mkt.buy.churn` « le churn des acheteurs » / "buyer churn" ;
  `mkt.buy.cac` « le CAC acheteur » / "the buyer CAC" ; `mkt.sell.arpa` « le
  revenu par vendeur abonné » / "revenue per paid seller" ;
  `mkt.sell.gross-margin` « la marge sur les abonnements vendeurs » / "the
  margin on seller subscriptions" ; `mkt.sell.paid-churn` « le churn des
  vendeurs abonnés » / "paid seller churn" ; `mkt.sell.cac` « le coût d'un
  vendeur actif » / "the cost per active seller" ; `mkt.sell.first-sale` « la
  première vente » / "the first sale" ; `mkt.sell.paid-conversion` « la
  conversion en vendeur abonné » / "seller subscription conversion".

#### 22.4.4 La prose (`ENGINE_CATALOG`, `ENGINE_DERIVED_CATALOG`)

Les entrées s'ajoutent aux deux records existants, dans un bloc
`// --- Marketplace (§22) ---` en fin de record, sous un marqueur
`// TODO: à relire — copie neuve (convention 6), §22 (A23)`. Toutes portent un
`noReferenceReason`. Les règles d'écriture d'`engine-catalog.ts` s'appliquent
(rapports vérifiés, aucun menu inventé, six placeholders, glyphes des slides,
« jamais de {month} »). Le texte est écrit avec les mots « produits » ; les mots
« services » viennent du calque de §22.8.4.

**`mkt.buy.signup-rate`**
- name : « Taux d'inscription des acheteurs » / "Buyer sign-up rate"
- oneLiner : « La part des visiteurs du mois qui créent un compte acheteur. » / "The share of the month's visitors who create a buyer account."
- formula : « comptes acheteurs créés dans le mois ÷ visiteurs uniques du mois » / "buyer accounts created in the month ÷ unique visitors in the month"
- inputs : « Inscrits acheteurs en {month} » / "Buyer sign-ups in {month}" ; « Visiteurs uniques côté acheteurs en {month} » / "Unique buyer-side visitors in {month}"
- where : 1. ga4 · « GA4 » · « le total Utilisateurs du mois (la métrique Utilisateurs, à ajouter au rapport Acquisition de trafic si elle n'y est pas), pas Sessions » / "the month's total Users (the Users metric; add it to the Traffic acquisition report if it isn't there), not Sessions" ; 2. mixpanel · « Mixpanel ou Amplitude » · « un entonnoir en deux étapes, page vue puis inscription d'un acheteur, sur le mois » / "a two-step funnel, page view then buyer sign-up, over the month" ; 3. product-db · « Base produit » · « les comptes acheteurs créés sur le mois » / "the buyer accounts created in the month"
- trap : « Si on peut commander sans compte, compte une première commande avec une adresse e-mail neuve comme une inscription. Les vendeurs inscrits n'entrent pas ici. » / "If people can order without an account, count a first order with a new email address as a sign-up. Seller sign-ups don't belong here."
- request : « le nombre de visiteurs uniques et le nombre de comptes acheteurs créés en {month} » / "the number of unique visitors and of buyer accounts created in {month}"
- noReferenceReason : « la conversion dépend de ce qu'il faut pour voir l'offre sans compte ; suis-la contre ta propre cible » / "conversion depends on how much people can see without an account; follow it against your own target"

**`mkt.buy.cac`**
- name : « CAC acheteur » / "Buyer CAC"
- oneLiner : « Ce que coûte, en moyenne, un nouvel acheteur. » / "What a new buyer costs, on average."
- formula : « dépense d'acquisition côté acheteurs du mois ÷ nouveaux acheteurs du mois (première commande) » / "buyer-side acquisition spend in the month ÷ new buyers in the month (first order)"
- inputs : « Dépense d'acquisition des acheteurs en {month} » / "Buyer acquisition spend in {month}" ; « Nouveaux acheteurs en {month} » / "New buyers in {month}"
- where : 1. google-ads · « Google Ads, Meta Ads Manager » · « le montant dépensé en {month} pour les campagnes qui visent les acheteurs » / "the amount spent in {month} on the campaigns aimed at buyers" ; 2. role finance · « Finance » · « les salaires et les outils des équipes marketing, pour les variantes « + équipe » et « tout chargé » » / "marketing salaries and tools, for the \"+ team\" and \"fully loaded\" variants" ; 3. product-db · « Base de commandes » · « les acheteurs dont la première commande a eu lieu en {month} » / "the buyers whose first order was in {month}"
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
- noReferenceReason : « il se juge contre ce que rapporte un vendeur abonné, quand tes vendeurs paient un abonnement ; sinon, il se suit sans se rembourser » / "it is judged against what a paid seller brings in, when your sellers pay a subscription; otherwise it is followed without being paid back"
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
- variants : `requests` · « Demandes : réservation, devis, mission » / "Requests: booking, quote, job" ; `searches` · « Recherches avec une annonce consultée » / "Searches with a listing viewed"

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
- trap : « Sans liste des départs, déduis-le : actifs au 1er + nouveaux acheteurs – actifs à fin de mois, divisé par les actifs au 1er. Un acheteur revenu après un an compte comme resté. » / "Without a list of who left, derive it: active at the start + new buyers – active at month end, divided by active at the start. A buyer back after a year counts as kept."
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
- formula : « inscrits acheteurs arrivés par un utilisateur (parrainage, lien partagé, « comment nous avez-vous connus ? ») ÷ inscrits acheteurs de la cohorte » / "buyer sign-ups who came through a user (referral, shared link, \"how did you hear about us?\") ÷ cohort buyer sign-ups"
- inputs : « Inscrits acheteurs recommandés » / "Referred buyer sign-ups" ; « Inscrits acheteurs en {cohort} » / "Buyer sign-ups from {cohort}"
- where : 1. product-db · « Outil de parrainage ou base produit » · « les inscrits en {cohort} qui ont un parrain, un code ou un lien partagé par un vendeur ou un acheteur » / "the sign-ups from {cohort} with a referrer, a code or a link shared by a seller or a buyer" ; 2. hubspot · « HubSpot » · « une propriété « comment nous avez-vous connus ? » remplie à l'inscription » / "a \"how did you hear about us?\" property filled in at sign-up"
- trap : « Un vendeur qui partage son annonce amène des acheteurs : c'est de la recommandation, compte-la. La source « referral » de GA4 n'en est pas. » / "A seller who shares their listing brings buyers: that is referral, count it. GA4's \"referral\" source isn't."
- request : « pour les inscrits acheteurs en {cohort}, combien sont arrivés par un parrainage, un lien partagé ou une recommandation déclarée » / "for the buyer sign-ups from {cohort}, how many came through a referral, a shared link or a stated recommendation"
- noReferenceReason : « de presque rien à la majorité selon que le produit se voit ou non ; compare-toi à toi-même » / "from almost none to a majority depending on whether other people see the product; compare with yourself" (le texte de `ref.referred-share`).

**`mkt.rev.take-rate`**
- name : « Commission (take rate) » / "Take rate"
- oneLiner : « La part du volume d'affaires que la place de marché garde. » / "The share of the gross volume the marketplace keeps."
- formula : « revenu net du mois (commissions et frais facturés) ÷ volume d'affaires du mois (GMV) » / "net revenue in the month (commissions and fees charged) ÷ gross merchandise value in the month (GMV)"
- inputs : « Revenu net en {month} » / "Net revenue in {month}" ; « Volume d'affaires (GMV) en {month} » / "Gross merchandise value (GMV) in {month}"
- where : 1. stripe · « Stripe Connect » · « le volume des paiements du mois et les frais que la plateforme a prélevés » / "the month's payment volume and the fees the platform collected" ; 2. spreadsheet · « Finance » · « le chiffre d'affaires de commissions du mois et le volume qui l'a produit » / "the month's commission revenue and the volume that produced it" ; 3. product-db · « Base de commandes » · « la somme des commandes payées du mois et la commission de chacune » / "the sum of the month's paid orders and each one's commission"
- trap : « Écris ce que ton GMV compte (livraison, taxes). Un remboursement retire sa commande des deux côtés. Les abonnements des vendeurs ont leur propre chiffre. » / "Write down what your GMV counts (shipping, taxes). A refund takes its order off both sides. Seller subscriptions have their own number."
- request : « le volume d'affaires (GMV) en {month} et le revenu net que la place de marché en a gardé (commissions et frais) » / "the gross merchandise value (GMV) in {month} and the net revenue the marketplace kept from it (commissions and fees)"
- noReferenceReason : « elle dépend de ce que la place de marché fait pour la transaction (paiement, garantie, livraison) ; elle se suit contre ta cible » / "it depends on what the marketplace does for the transaction (payment, guarantee, delivery); follow it against your target". *Pas de fourchette : aucune n'est dans le glossaire approuvé (règle d'en-tête d'`engine-catalog.ts`). L'unité du glossaire (MKT-G) pourra en sourcer une dans le terme « take rate ».*

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

**`mkt.sell.signup-rate`**
- name : « Taux d'inscription des vendeurs » / "Seller sign-up rate"
- oneLiner : « La part des visiteurs de ta page vendeurs qui créent un compte vendeur. » / "The share of your seller page's visitors who create a seller account."
- formula : « comptes vendeurs créés dans le mois ÷ visiteurs uniques de la page vendeurs du mois » / "seller accounts created in the month ÷ unique visitors to the seller page in the month"
- inputs : « Vendeurs inscrits en {month} » / "Seller sign-ups in {month}" ; « Visiteurs de la page vendeurs en {month} » / "Seller page visitors in {month}"
- where : 1. ga4 · « GA4 » · « les visiteurs uniques de ta page pour devenir vendeur, et l'événement de création d'un compte vendeur, sur le mois » / "the unique visitors to your become-a-seller page, and the seller account creation event, over the month" ; 2. product-db · « Base produit » · « les comptes vendeurs créés sur le mois » / "the seller accounts created in the month"
- trap : « Sans page à part pour les vendeurs, divise par tous les visiteurs du mois et écris-le : le taux sera bas, mais comparable d'un mois à l'autre. » / "With no separate page for sellers, divide by all the month's visitors and write it down: the rate will be low, but comparable month to month."
- request : « le nombre de visiteurs de la page vendeurs et le nombre de comptes vendeurs créés en {month} » / "the number of seller page visitors and of seller accounts created in {month}"
- noReferenceReason : « il dépend de ce que tu offres aux vendeurs et de l'endroit où tu les recrutes ; suis-le contre ta propre cible » / "it depends on what you offer sellers and where you recruit them; follow it against your own target"

**`mkt.sell.paid-conversion`**
- name : « Conversion en vendeur abonné » / "Seller subscription conversion"
- oneLiner : « La part des vendeurs inscrits qui prennent un abonnement à temps. » / "The share of seller sign-ups who take a subscription in time."
- formula : « vendeurs inscrits de la cohorte abonnés sous {n} jours ÷ vendeurs inscrits de la cohorte » / "cohort seller sign-ups subscribed within {n} days ÷ cohort seller sign-ups"
- inputs : « Abonnés sous {n} jours » / "Subscribed within {n} days" ; « Vendeurs inscrits en {cohort} » / "Seller sign-ups from {cohort}"
- where : 1. stripe · « Stripe Billing » · « les premiers paiements d'abonnement des vendeurs inscrits en {cohort}, sous {n} jours » / "the first subscription payments of the sellers who signed up in {cohort}, within {n} days" ; 2. product-db · « Base produit » · « les vendeurs inscrits en {cohort} et la date de leur premier paiement d'abonnement » / "the sellers who signed up in {cohort} and the date of their first subscription payment"
- trap : « Un essai gratuit n'est pas un abonnement : compte le premier paiement. La fenêtre est celle de la première vente : les deux se lisent sur les mêmes vendeurs inscrits. » / "A free trial isn't a subscription: count the first payment. The window is the first sale's: both are read on the same seller sign-ups."
- request : « pour les vendeurs inscrits en {cohort}, combien ont payé un premier abonnement sous {n} jours, et combien de vendeurs inscrits au total » / "for the sellers who signed up in {cohort}, how many paid a first subscription within {n} days, and how many seller sign-ups in total"
- noReferenceReason : « elle dépend de ce que l'abonnement apporte au vendeur ; compare-toi à toi-même » / "it depends on what the subscription gives the seller; compare with yourself"

**`mkt.sell.arpa`**
- name : « Revenu mensuel par vendeur abonné » / "Monthly revenue per paid seller"
- oneLiner : « Ce que paie en moyenne un vendeur abonné, par mois. » / "What a paid seller pays on average, per month."
- formula : « MRR des abonnements vendeurs ÷ vendeurs abonnés » / "sellers' subscription MRR ÷ paid sellers"
- inputs : « MRR vendeurs à fin {month} » / "Seller MRR at the end of {month}" ; « Vendeurs abonnés à fin {month} » / "Paid sellers at the end of {month}"
- where : 1. stripe · « Stripe Billing » · « le MRR et les abonnés actifs, filtrés sur les produits d'abonnement des vendeurs » / "MRR and active subscribers, filtered to the sellers' subscription products" ; 2. product-db · « Base produit » · « les abonnements vendeurs actifs à fin {month} et leur prix mensuel » / "the active seller subscriptions at the end of {month} and their monthly price"
- trap : « Un abonnement annuel compte pour un douzième de son prix chaque mois. Les commissions n'entrent pas ici : elles ont leur chiffre. » / "An annual plan counts for a twelfth of its price each month. Commissions don't belong here: they have their own number."
- request : « le MRR des abonnements vendeurs à fin {month} et le nombre de vendeurs abonnés à la même date » / "the sellers' subscription MRR at the end of {month} and the number of paid sellers on the same date"
- noReferenceReason : « il dépend entièrement de ta grille d'abonnements » / "it depends entirely on your subscription plans"

**`mkt.sell.paid-churn`**
- name : « Churn mensuel des vendeurs abonnés » / "Monthly paid seller churn"
- oneLiner : « La part des vendeurs abonnés qui arrêtent leur abonnement dans le mois. » / "The share of paid sellers who end their subscription in the month."
- formula : « vendeurs abonnés perdus dans le mois ÷ vendeurs abonnés au 1er du mois » / "paid sellers lost in the month ÷ paid sellers at the start of the month"
- inputs : « Abonnés perdus en {month} » / "Paid sellers lost in {month}" ; « Vendeurs abonnés au 1er {month} » / "Paid sellers at the start of {month}"
- where : 1. stripe · « Stripe Billing » · « les abonnements vendeurs annulés dans le mois, et les abonnés au 1er » / "the seller subscriptions cancelled in the month, and the subscribers at the start" ; 2. product-db · « Base produit » · « les abonnements vendeurs actifs au 1er {month} et ceux qui ne l'étaient plus à la fin » / "the seller subscriptions active at the start of {month} and those no longer active at the end"
- trap : « Un vendeur qui arrête son abonnement mais vend encore n'a pas quitté la place de marché : il compte ici, pas dans le churn des vendeurs. » / "A seller who ends their subscription but still sells hasn't left the marketplace: they count here, not in seller churn."
- request : « le nombre de vendeurs abonnés au 1er {month} et le nombre de ceux qui ont arrêté leur abonnement pendant le mois » / "the number of paid sellers at the start of {month} and how many ended their subscription during the month"
- noReferenceReason : « il dépend de ce que l'abonnement apporte ; suis-le contre ta propre cible » / "it depends on what the subscription gives; follow it against your own target"

**`mkt.sell.gross-margin`**
- name : « Marge sur les abonnements vendeurs » / "Margin on seller subscriptions"
- oneLiner : « Ce qu'il reste des abonnements des vendeurs après ce qu'ils coûtent à servir. » / "What is left of the sellers' subscriptions after what they cost to serve."
- formula : « (MRR vendeurs – coûts directs : outils fournis aux vendeurs, support, frais de paiement) ÷ MRR vendeurs » / "(seller MRR – direct costs: tools provided to sellers, support, payment fees) ÷ seller MRR"
- inputs : « Marge sur ce MRR » / "Margin on that MRR" ; « MRR vendeurs à fin {month} » / "Seller MRR at the end of {month}"
- where : 1. role finance · « Finance » · « le compte de résultat du dernier trimestre clos : le chiffre d'affaires des abonnements vendeurs, puis leurs coûts directs » / "the income statement of the last closed quarter: the seller subscription revenue, then its direct costs"
- trap : « Ce n'est pas la marge des commissions : un abonnement coûte peu à servir, une commande coûte ses frais de paiement. Chaque flux a sa marge. » / "This isn't the commissions' margin: a subscription costs little to serve, an order costs its payment fees. Each stream has its own margin."
- request : « la marge sur les abonnements vendeurs du dernier trimestre clos, et ce que ses coûts directs comprennent » / "the margin on seller subscriptions of the last closed quarter, and what its direct costs include"
- noReferenceReason : « les repères de marge publiés portent sur le logiciel vendu seul, pas sur l'abonnement d'une place de marché » / "the published margin references are for software sold on its own, not for a marketplace's subscription"

**Les six calculés** (`ENGINE_DERIVED_CATALOG`). Pour les six, `uncomputable`
vaut « incalculable — il manque {input} » / "can't be computed — missing:
{input}" ; pour les deux LTV, `capNote` vaut « durée de vie plafonnée à 36
mois : beaucoup de praticiens plafonnent entre trois et cinq ans, on prend le
bas » / "lifetime capped at 36 months: many practitioners cap it between three
and five years, we take the low end" (le texte de `rev.ltv`), et le test du
plafond (`it.each` d'`engine-catalog.test.ts`) gagne `mkt.rev.ltv` et
`mkt.sell.ltv` :
- `mkt.rev.ltv` : name « LTV acheteur » / "Buyer LTV" ; formula « fréquence × panier moyen × commission × marge × durée de vie (1 ÷ churn mensuel des acheteurs, au plus 36 mois) » / "frequency × average order value × take rate × margin × lifetime (1 ÷ monthly buyer churn, at most 36 months)" 
- `mkt.rev.cac-payback` : name « CAC payback acheteur » / "Buyer CAC payback" ; formula « CAC acheteur ÷ (fréquence × panier moyen × commission × marge), en mois » / "buyer CAC ÷ (frequency × average order value × take rate × margin), in months" ; caveat « la vraie comparaison reste la trésorerie » / "the real comparison is still the cash in the bank".
- `mkt.rev.ltv-cac` : name « LTV:CAC acheteur » / "Buyer LTV:CAC" ; formula « LTV acheteur ÷ CAC acheteur » / "buyer LTV ÷ buyer CAC".
- `mkt.sell.ltv` : name « LTV vendeur abonné » / "Paid seller LTV" ; formula « revenu par vendeur abonné × marge × durée de vie (1 ÷ churn mensuel des vendeurs abonnés, au plus 36 mois) » / "revenue per paid seller × margin × lifetime (1 ÷ monthly paid seller churn, at most 36 months)" 
- `mkt.sell.cac-payback` : name « Payback d'un vendeur abonné » / "Paid seller payback" ; formula « (coût d'un vendeur actif × première vente ÷ conversion en abonné) ÷ (revenu par vendeur abonné × marge), en mois » / "(cost per active seller × first sale ÷ subscription conversion) ÷ (revenue per paid seller × margin), in months" ; caveat recopié de `mkt.rev.cac-payback`.
- `mkt.sell.ltv-cac` : name « LTV:CAC vendeur abonné » / "Paid seller LTV:CAC" ; formula « LTV vendeur abonné ÷ coût d'un vendeur abonné » / "paid seller LTV ÷ cost per paid seller".

**Les noms en mots « services »** (`ENGINE_CATALOG_MKT_SERVICES`, MKT-S ; le
reste de chaque entrée se réécrit par le lexique de §22.8.4) :

| Id | FR | EN |
|---|---|---|
| `mkt.buy.signup-rate` | Taux d'inscription des clients | Client sign-up rate |
| `mkt.buy.cac` | CAC client | Client CAC |
| `mkt.sell.cac` | Coût d'un prestataire actif | Cost per active provider |
| `mkt.sell.signup-rate` | Taux d'inscription des prestataires | Provider sign-up rate |
| `mkt.buy.first-order` | Première réservation | First booking |
| `mkt.sell.first-sale` | Première réservation reçue | First booking received |
| `mkt.liq.fill-rate` | Taux de service | Fill rate |
| `mkt.buy.repeat` | Deuxième réservation | Second booking |
| `mkt.buy.churn` | Churn mensuel des clients | Monthly client churn |
| `mkt.sell.churn` | Churn mensuel des prestataires | Monthly provider churn |
| `mkt.sell.paid-churn` | Churn mensuel des prestataires abonnés | Monthly paid provider churn |
| `mkt.buy.referred-share` | Part des clients recommandés | Referred client share |
| `mkt.rev.take-rate` | Commission (take rate) | Take rate |
| `mkt.rev.aov` | Montant moyen d'une réservation | Average booking value |
| `mkt.rev.frequency` | Fréquence de réservation | Booking frequency |
| `mkt.rev.gross-margin` | Marge sur le revenu net | Margin on net revenue |
| `mkt.sell.paid-conversion` | Conversion en prestataire abonné | Provider subscription conversion |
| `mkt.sell.arpa` | Revenu mensuel par prestataire abonné | Monthly revenue per paid provider |
| `mkt.sell.gross-margin` | Marge sur les abonnements prestataires | Margin on provider subscriptions |
| `mkt.rev.ltv` · `cac-payback` · `ltv-cac` | LTV client · CAC payback client · LTV:CAC client | Client LTV · Client CAC payback · Client LTV:CAC |
| `mkt.sell.ltv` · `cac-payback` · `ltv-cac` | LTV prestataire abonné · Payback d'un prestataire abonné · LTV:CAC prestataire abonné | Paid provider LTV · Paid provider payback · Paid provider LTV:CAC |

---

### 22.5 Le modèle branché (`src/lib/engine/mkt-*.ts`)

Tout est pur, en intervalles ; une valeur inconnue est `null`, jamais 0.
`mkt-model.ts` et `stream.ts` **s'importent, ne se modifient pas** (§23.2). Les
noms sont imposés.

#### 22.5.1 Les grandeurs de base (`mkt-economics.ts`, MKT-2)

```ts
// The demand (the first draft, unchanged)
/** a: what one active buyer brings a month — mkt-model.ts#revenuePerBuyer on frequency, AOV, take rate. */
export function mktRevenuePerBuyer(state: EngineState, ctx: EngineCalcContext): Interval | null;
/** R: the month's net revenue — the shared mktNetRevenue when typed (solid), else a × the active buyers at month end (the frequency's denominator). */
export function mktNetRevenueToday(state: EngineState, ctx: EngineCalcContext): Interval | null;
/** GMV of the month — the shared mktGmv when typed, else R ÷ (take rate / 100). */
export function mktGmvToday(state: EngineState, ctx: EngineCalcContext): Interval | null;
/** N: new buyers in the month — mkt.buy.cac's denominator when > 0, else the buyer sign-ups of the month × first order / 100. */
export function mktNewBuyersPerMonth(state: EngineState, ctx: EngineCalcContext): Interval | null;
/** The active buyers on the 1st: mkt.buy.churn's denominator, or null. */
export function mktActiveBuyersStart(state: EngineState): number | null;

// The supply's subscriptions (C64, C93) — null for each when sellerSubscriptions is off
/** The month's seller sign-ups: mkt.sell.signup-rate's numerator, or null. */
export function mktSellerSignups(state: EngineState): number | null;
/** NS: new paid sellers a month — mkt-model.ts#newPaidSellersPerMonth(seller sign-ups, paid conversion). */
export function mktNewPaidSellers(state: EngineState, ctx: EngineCalcContext): Interval | null;
/** S: the sellers' subscription MRR — the shared mktSellerMrrEnd when typed (solid), else mkt.sell.arpa × the paid sellers (its denominator). */
export function mktSellerMrrToday(state: EngineState, ctx: EngineCalcContext): Interval | null;
/** The paid sellers on the 1st: mkt.sell.paid-churn's denominator, or null. */
export function mktPaidSellersStart(state: EngineState): number | null;
/** What a paid seller costs (D8): mkt-model.ts#paidSellerCac(mkt.sell.cac, first sale, paid conversion). */
export function mktPaidSellerCac(state: EngineState, ctx: EngineCalcContext): Interval | null;
```

Les inscrits acheteurs du mois sont le numérateur de `mkt.buy.signup-rate`.

#### 22.5.2 Les funnels (`mkt-funnel.ts`, MKT-2)

```ts
export interface MktFunnelColumn {
  metric: "mkt.buy.first-order" | "mkt.buy.repeat" | "mkt.sell.first-sale" | "mkt.sell.paid-conversion";
  /** null = unknown, never 0. Rounded per bound, like the peloton. */
  perHundred: Interval | null;
  confidence: Confidence;
  source: SourceRef | null;
  period: YearMonth | null;
}
export interface MktSideFunnel {
  /** 100 ÷ sign-up rate × 100: the visitors behind 100 sign-ups (the buyers', or the seller page's). */
  visitorsPerHundred: Interval | null;
  upstreamSource: SourceRef | null;
  upstreamPeriod: YearMonth | null;
  /** Demand: first order, then second order. Supply: first sale, then paid conversion (with subscriptions). Same 100 sign-ups. */
  columns: MktFunnelColumn[];
  chain: Peloton["chain"];
  /** The cohort under SMALL_COHORT_SIZE. */
  smallCohort: boolean;
}
export interface MktFunnel {
  demand: MktSideFunnel & {
    /** The referred share, rounded: the red dots of the sign-ups grid. */
    referredPerHundred: Interval | null;
    /** The fill rate as known, and which kind of request it counts. */
    fill: Known;
    fillVariant: "requests" | "searches" | null;
  };
  supply: MktSideFunnel & {
    /** The active sellers' churn, and the paid sellers' (with subscriptions). */
    churn: Known;
    paidChurn: Known | null;
  };
}
export function buildMktFunnel(state: EngineState, ctx: EngineCalcContext): MktFunnel;
```

**La petite cohorte** (`smallCohort`) : le dénominateur saisi de
`mkt.buy.first-order` (les inscrits acheteurs de la cohorte), pour la demande,
et de `mkt.sell.first-sale` (les vendeurs inscrits de la cohorte), pour
l'offre, sous `SMALL_COHORT_SIZE` (lus par `countsOf(entryOf(snapshot, id))`,
comme `peloton.ts#cohortIsSmall`). `fillVariant` vaut la variante de l'entrée
de `mkt.liq.fill-rate`, ou `null` quand elle n'en a pas.

La règle de `peloton.ts` : `perHundred = mapBounds(known.value, Math.round)`,
`visitorsPerHundred = div(point(10_000), signupRate)`, la même fonction
`chainOf` (à exporter de `peloton.ts` si elle ne l'est pas), avec les inscrits
en tête comme colonne connue. Sans abonnements, le funnel de l'offre n'a qu'une
colonne (la première vente), `visitorsPerHundred`, `upstreamSource` et
`upstreamPeriod` valent `null` (le taux d'inscription des vendeurs n'est pas
affiché) et `paidChurn` vaut `null`.

#### 22.5.3 L'économie d'un côté (`mkt-economics.ts`, MKT-2)

```ts
export function mktUnitEconomics(state: EngineState, ctx: EngineCalcContext, side: MktSide): MktUnitEconomics;
```

Chacune est `mkt-model.ts#sideEconomics` en `DerivedValue` (confiance `solid`
si toutes les entrées du calculé le sont, sinon `approximate` ; `uncomputable`
avec les entrées inconnues). Les deux règles sont celles de
`unit-economics.ts` : MKT-2 **exporte** ses fonctions `missingOf` et
`confidenceOfInputs` (aujourd'hui privées), sans les changer, et les
importe :
- **la demande** : `sideEconomics(a, mkt.rev.gross-margin, mkt.buy.churn,
  mkt.buy.cac)` ; ids `mkt.rev.ltv`, `mkt.rev.cac-payback`, `mkt.rev.ltv-cac` ;
  `revenuePerMonth` = a ;
- **l'offre** (avec les abonnements) : `sideEconomics(mkt.sell.arpa,
  mkt.sell.gross-margin, mkt.sell.paid-churn, mktPaidSellerCac)` ; ids
  `mkt.sell.ltv`, `mkt.sell.cac-payback`, `mkt.sell.ltv-cac` ; `cac` = le coût
  d'un vendeur abonné ; sans abonnements, tout est `uncomputable` avec
  `missing: []`, jamais affiché.

L'argent d'A20 par côté (`MoneyKpis` : perte, mois après le remboursement,
dépense, trésorerie, alerte) **n'est pas dans `MktUnitEconomics`** : il vit dans
le scénario de chaque côté (`MktScenarioKpis extends MoneyKpis`, MKT-3), comme
pour le libre-service, et se calcule avec `money.ts`, inchangé :
`arr = arrOf(R)` (demande) ou `arrOf(S)` (offre), `loss = lossCheck(ltv, cac)`,
`afterPayback`, `spend = acquisitionSpend(N, cac)` ou `(NS, coût d'un vendeur
abonné)`, `cash = cashTiedUp(spend, payback, false)` (un plancher : le
remboursement est linéaire pour un acheteur et pour un abonné),
`warning = paybackWarning(payback, loss, paybackLimit(setup.runwayMonths))`.

#### 22.5.4 La projection, par côté et au total (`mkt-scenario.ts`, MKT-3)

```ts
export type MktScenarioAssumption =
  | "signup-same-visitors" | "referral-on-top"          // the self-serve words
  | "fill-new-buyers-only"                               // C68
  | "new-buyer-spends-average"
  | "money-levers-all-buyers"                            // C69
  | "price-all-paid-sellers"                             // C69, the supply's price
  | "same-spend"
  | "active-twelve-months"
  | "supply-priced-by-subscriptions"                     // C67
  | "twelve-months";
export interface MktScenarioKpis extends MoneyKpis {
  /** R (demand) or S (supply): the side's revenue this month (the MRR's place). */
  mrr: Interval | null;
  /** N' × a' (demand) or NS' × price' (supply): the side's new revenue in a month. */
  newMrr: Interval | null;
  /** The side's revenue in twelve months: its path's last point. */
  mrr12: Interval | null;
  revenuePerUnit: Interval | null;   // a, or the subscription price
  gmv: Interval | null;              // demand only, today only
  cac: Interval | null;              // a buyer's, or a paid seller's
  ltv: Interval | null;
  payback: Interval | null;
}
/** The month's funnel of one side, today and with the what-ifs (the panel's « Ton funnel du mois »). null = unknown. */
export interface MktScenarioFunnel {
  /** The month's visitors: the sign-up rate's denominator (demand), the seller sign-up rate's (supply). */
  visitors: Interval | null;
  /** The month's sign-ups: the sign-up rate's numerator × fSignup × fRefSignups (demand), the seller sign-ups (supply). */
  signups: Interval | null;
  /** Demand only: the referred among them (signups × referred share / 100). null for the supply. */
  referred: Interval | null;
  /** N (new buyers) or NS (new paid sellers), and their projection N × fN, NS × fConv. */
  newUnits: Interval | null;
}
export interface MktScenario {
  side: MktSide;
  levers: LeverView[];
  moved: LeverId[];
  today: { funnel: MktScenarioFunnel; kpis: MktScenarioKpis };
  projected: { funnel: MktScenarioFunnel; kpis: MktScenarioKpis };
  assumptions: MktScenarioAssumption[];
}
export function buildMktScenario(state: EngineState, targets: Partial<Record<LeverId, number>>, ctx: EngineCalcContext, side: MktSide): MktScenario;
export function mktLeverAlone(state: EngineState, id: LeverId, ctx: EngineCalcContext): MktScenario | null; // the side of `id`
/** The total (S9): today and with the what-ifs of both sides, 13 points each — mkt-model.ts#marketplaceRevenuePath. */
export function mktTotalPaths(state: EngineState, targets: Partial<Record<LeverId, number>>, ctx: EngineCalcContext): { today: Interval[] | null; projected: Interval[] | null };
```

**La demande**, colonne par colonne (`today`, puis `projected` avec les
cibles). `k(id)` est la valeur connue d'aujourd'hui (`knownIn`, sinon `null`),
`t(id)` la cible d'un levier connu (sinon `null`), `one = point(1)` ; chaque
facteur vaut `one` quand son chiffre ou sa cible manque. Les lignes
reprennent celles de `scenario.ts#buildScenario` (lignes ~276-292) :

```ts
const fSignup = s && t(signup) !== null ? (div(point(t(signup)), s) ?? one) : one;          // s = k("mkt.buy.signup-rate")
const fRef = r && t(ref) !== null ? correlatedRatio(mapBounds(r, (x) => 1 - x / 100), () => 1 - Math.min(t(ref), 99) / 100) : one; // r = k("mkt.buy.referred-share")
const fRefSignups = mapBounds(fRef, (f) => 1 / f);
const fFirst = f1 && t(first) !== null ? correlatedRatio(f1, () => t(first)) : one;       // f1 = k("mkt.buy.first-order")
const fFill = fill && t(fillId) !== null ? correlatedRatio(fill, () => t(fillId)) : one;  // fill = k("mkt.liq.fill-rate")
const fN = mul(mul(mul(fSignup, fRefSignups), fFirst), fFill);
const fFreq = …, fAov = …, fTake = …;          // each: correlatedRatio(k(id), () => t(id)), or one
const fA = mul(mul(fFreq, fAov), fTake);
const churn = t("mkt.buy.churn") !== null ? point(t("mkt.buy.churn")) : k("mkt.buy.churn");
```

Puis : `N' = mul(N, fN)` ; `a' = mul(a, fA)` ; `newMrr = mul(N', a')` ;
`path = demandPath(R0, newMrr, churn, fA)` (`mkt-model.ts`, 13 points) ; `mrr
= R0` dans les deux colonnes ; `mrr12 = path[12]` ; `revenuePerUnit = a'` ;
`gmv` aujourd'hui seulement (`null` en projeté) ; `cac = mul(cac, mapBounds(fN,
(f) => 1 / f))` à dépense égale ; `ltv`, `payback`, `ltvCac` par
`sideEconomics(a', mkt.rev.gross-margin, churn, cac)` ; l'argent d'A20
(`money.ts`) : `arr = arrOf(mrr)`, `arr12 = arrOf(mrr12)`, `loss =
lossCheck(ltv, cac)`, `lifetime` (la durée de vie de `sideEconomics`),
`afterPayback(lifetime, payback)`, `spend = acquisitionSpend(N, cac
d'aujourd'hui)` dans les deux colonnes, `cash = cashTiedUp(spend, payback,
false)`, `warning = paybackWarning(payback, loss,
paybackLimit(setup.runwayMonths))`. **Le funnel du scénario** (`MktScenarioFunnel`)
: `visitors` = le dénominateur de `mkt.buy.signup-rate` ; `signups` = son
numérateur × `fSignup` × `fRefSignups` ; `referred` = `signups` × la part
recommandée (sa cible en projeté) ÷ 100 ; `newUnits` = `N'`. Pour l'exemple :
60 000, 3 000, 240, 600 aujourd'hui ; 60 000, 3 000, 240, 1 000 avec les « Et
si » (aucun ne touche l'inscription ni la recommandation).

**L'offre** (avec les abonnements), de même :

```ts
const fConv = conv && t(convId) !== null ? correlatedRatio(conv, () => t(convId)) : one;   // conv = k("mkt.sell.paid-conversion")
const fPrice = price && t(priceId) !== null ? correlatedRatio(price, () => t(priceId)) : one; // price = k("mkt.sell.arpa")
const paidChurn = t("mkt.sell.paid-churn") !== null ? point(t("mkt.sell.paid-churn")) : k("mkt.sell.paid-churn");
```

Puis : `NS' = mul(NS, fConv)` ; `price' = mul(price, fPrice)` ; `newMrr =
mul(NS', price')` ; `path = sellerPath(S0, newMrr, paidChurn, fPrice)` ; `mrr
= S0` ; `mrr12 = path[12]` ; `revenuePerUnit = price'` ; `gmv = null` ; le
coût d'un vendeur abonné `cac = paidSellerCac(k("mkt.sell.cac"),
k("mkt.sell.first-sale"), conv')`, où `conv'` est la cible de la conversion
(sinon `conv`) : à dépense égale, il baisse quand la conversion monte ;
`ltv`, `payback`, `ltvCac` par `sideEconomics(price', mkt.sell.gross-margin,
paidChurn, cac)` ; l'argent d'A20 comme pour la demande, avec `spend =
acquisitionSpend(NS, cac d'aujourd'hui)`. Le funnel : `visitors` = le
dénominateur de `mkt.sell.signup-rate`, `signups` = son numérateur,
`referred = null`, `newUnits = NS'` (8 000, 400, —, 60 ; puis 80 avec la
conversion à 20 %).

**L'offre sans abonnements** : `levers = []`, `moved = []`, chaque chiffre de
`kpis` et du funnel vaut `null`, `assumptions = []` (rien n'a servi) ; l'écran
dit pourquoi (`mkt.money.supplyNone`, §22.6.2).

**Les coutures d'A22** : `scenarioOf`, `leverAloneOf`, `leverIdsOf` et
`candidatesFor` (§21.5.1) **ne servent pas** la place de marché et ne
changent pas : `scenarioOf` d'un état de place de marché rend
`buildScenario`, dont tous les chiffres sont inconnus, sans erreur (la
barrière de §22.3 garde l'îlot ; les écrans d'une place de marché appellent
`buildMktScenario`, MKT-7).

**Les domaines des leviers** (`leverViews(…, ids)`, la fonction existante) :
la règle d'aujourd'hui ; `mkt.rev.aov` et `mkt.sell.arpa` rejoignent
`MONEY_LEVERS` ; `mkt.buy.churn` et `mkt.sell.paid-churn` rejoignent
`LOWER_IS_BETTER` ; `mkt.rev.frequency` est un levier `unit: "ratio"` :
`stepOf` rend `0.01` pour lui (`if (id === "mkt.rev.frequency") return 0.01;`,
avant la règle de l'argent), et son domaine est la règle générale de `domain`
(de la moitié au triple d'aujourd'hui, plafond 400 : il n'est pas borné) ;
pour l'exemple (0,3 commande par acheteur actif et par mois), de 0,15 à 0,9.

**Les hypothèses imprimées**, seulement celles qui ont servi, dans l'ordre du
type : `signup-same-visitors` (l'inscription bouge) ; `referral-on-top` ;
`fill-new-buyers-only` (le taux de service bouge) ; `new-buyer-spends-average`
(demande, toujours quand `newMrr` est calculable) ; `money-levers-all-buyers`
(fréquence, panier ou commission) ; `price-all-paid-sellers` (le prix des
abonnements) ; `same-spend` (`fN ≠ 1`, ou la conversion des vendeurs bouge) ;
`active-twelve-months` (demande, toujours) ; `supply-priced-by-subscriptions`
(offre avec abonnements, toujours) ; `twelve-months` (demande toujours ; offre
avec abonnements). L'offre sans abonnements n'en imprime aucune.

**Le total** : `marketplaceRevenuePath(sellerSubscriptions, demande, offre)`
(`mkt-model.ts`), aujourd'hui et avec les « Et si » des deux côtés ensemble.

#### 22.5.5 Ce qu'un côté gagne à fermer une fuite (`mkt-impact.ts`, MKT-4)

```ts
export function mktRankingImpact(state: EngineState, candidate: MktCandidateId, target: number, ctx: EngineCalcContext): { gap?: Interval; mrr?: Interval };
```

- **La demande**, la copie de `impact.ts#rankingImpact` : les flux
  (`mkt.buy.signup-rate`, `mkt.buy.first-order`, `mkt.liq.fill-rate`,
  `mkt.buy.referred-share`) → `gap` = `relativeGap(r, t)` (ou
  `referralGain`) et `mrr = flowGain(N, gap, a)` ; `mkt.buy.churn` → `mrr =
  keptGain(point(mktActiveBuyersStart), r, t, a, "lower")` ;
  `mkt.buy.repeat` → `{}` (jamais chiffré).
- **L'offre** (C67, D4) : `mkt.sell.paid-conversion` → `gap =
  relativeGap(r, t)`, `mrr = flowGain(NS, gap, prix)` ;
  `mkt.sell.paid-churn` → `mrr = keptGain(point(mktPaidSellersStart), r, t,
  prix, "lower")` ; `mkt.sell.signup-rate`, `mkt.sell.first-sale`,
  `mkt.sell.churn` → `{}`. `SUPPLY_PRICED = ["mkt.sell.paid-conversion",
  "mkt.sell.paid-churn"]` est la seule liste à changer si Antoine renverse D4.

Le champ s'appelle `mrr` (le type de `MotionRules` l'impose) ; il vaut du
revenu net nouveau ou préservé par mois (demande), du MRR d'abonnements nouveau
ou préservé (offre). La copie dit l'un ou l'autre.

**La chaîne affichée** : `mktWhatIf(state, candidate, target, ctx, words):
Impact | null`, la copie de `impact.ts#whatIf` avec ces substitutions : N, a,
`mktActiveBuyersStart`, `twelveMonthFactor(churn des acheteurs)` pour la
demande ; NS, prix, `mktPaidSellersStart`, `twelveMonthFactor(churn des
abonnés)` pour l'offre. MKT-4 **exporte** `twelveMonthFactor` d'`impact.ts`
(aujourd'hui privée), sans la changer. Sa règle « sans décimale » (une
petite cohorte) lit la petite cohorte du côté (§22.5.2). Mêmes clés de lignes (`today`, `if`, `then`, `times`,
`annual`, `less-than-one`) ; les gabarits sont ceux de `whatIf.*`, que le
calque de chaque côté réécrit (§22.8.5 c).

#### 22.5.6 Les deux diagnostics (`diagnose.ts`, MKT-4)

```ts
/** The candidates one side positions: its own, the supply's subscription ones only when sellers pay one. */
export function mktCandidates(side: MktSide, setup: EngineSetup): MktCandidateId[];
/** One side's rules, built per setup like the app's (§21.5.4): its candidates and blindWatch depend on the subscriptions box. */
export function mktRules(side: MktSide, setup: EngineSetup): MotionRules<MktCandidateId>;
export function diagnoseSide(state: EngineState, ctx: EngineCalcContext, side: MktSide): Diagnosis<MktCandidateId>;
```

- **La demande** (`mktRules("demand", setup)`) : `side: "demand"` ;
  `candidates: mktCandidates("demand", setup)` ; `price: mktRankingImpact` ;
  `isFlow` : les quatre flux de la demande ; `retentions: ["mkt.buy.churn"]` ; `blindWatch` : les ★ (`mkt.buy.signup-rate`,
  `mkt.buy.first-order`, `mkt.buy.repeat`, `mkt.buy.referred-share`,
  `mkt.rev.take-rate`), `mkt.buy.churn`, `mkt.liq.fill-rate`.
- **L'offre** (`mktRules("supply", setup)`) : `side: "supply"` ; `candidates:
  mktCandidates("supply", setup)` ; `price: mktRankingImpact` ; `isFlow` : `mkt.sell.paid-conversion` (le seul flux
  chiffré ; les trois autres ne sont pas chiffrés) ; `retentions:
  ["mkt.sell.paid-churn"]` ; `blindWatch` : `mkt.sell.first-sale`,
  `mkt.sell.churn`, puis avec les abonnements `mkt.sell.paid-conversion`,
  `mkt.sell.paid-churn`.
- Chaque diagnostic porte `motion: "mkt"` et son `side` ; `MotionRules.motion`
  devient `EngineMotion`, et `MotionRules` gagne `side?: MktSide`, recopié dans
  le diagnostic. `diagnoseWith` ne
  change pas : la règle qui nomme une étape reste une seule fonction ; **aucune
  fonction ne reçoit les candidats des deux côtés**.
- `directionOf` lit `LOWER_IS_BETTER_CANDIDATES` (§22.2.3).

#### 22.5.7 Les contrôles de cohérence (`sanity.ts`, `marketplaceChecks`, MKT-4)

« À vérifier », jamais bloquants (sauf `num-gt-den`, générique). Chaque
contrôle porte `motion: "mkt"` et le `side` de la colonne « Côté ». Un chiffre
du côté `match` (§22.4.1 : le taux de service, la commission, la marge des
commissions) est de la **demande**.

| Id | Déclencheur | Chiffres | Côté |
|---|---|---|---|
| `mkt-repeat-gt-first` | deuxième commande `lo` > première commande `hi` | `mkt.buy.repeat`, `mkt.buy.first-order` | demande |
| `churn-high` (existant) | **un contrôle par churn** dont `lo` > `CHURN_HIGH_PERCENT` (30), donc jusqu'à trois | le churn concerné | `mkt.buy.churn` : demande ; les deux autres : offre |
| `margin-odd` (existant) | un contrôle par marge hors de `MARGIN_ODD` | la marge concernée | `mkt.rev.gross-margin` : demande ; `mkt.sell.gross-margin` : offre |
| `mkt-take-high` | commission `lo` > `TAKE_RATE_HIGH_PERCENT` (50) : souvent un GMV compté sans les frais, ou un revenu compté brut | `mkt.rev.take-rate` | demande |
| `cohort-mismatch` (existant) | les colonnes d'un même funnel n'ont pas la même cohorte | les deux | celui du funnel |
| `reconcile-gap` (existant) | (inscrits acheteurs du mois × première commande / 100) ÷ dénominateur du CAC acheteur hors de `RECONCILE_BAND` ; ses valeurs `{ p, n, month }` comme le libre-service | `mkt.buy.signup-rate`, `mkt.buy.first-order`, `mkt.buy.cac` | demande |
| `two-tools` (existant) | comme partout | — | celui du chiffre |

`sentences.ts#SANITY_KEY` (que `tsc` force) gagne `"mkt-repeat-gt-first":
"mktRepeatGtFirst"` et `"mkt-take-high": "mktTakeHigh"` (§22.8.5 f).

#### 22.5.8 Les constats (`findings.ts`, `marketplaceFindings`, MKT-4)

La copie de `selfServeFindings`, sur la motion `"mkt"`. Chaque constat porte son
`side` : `marketplaceFindings` construit un `add` par côté (`const addFor =
(side: MktSide): Add => (kind, metrics, values, count) => …push({ kind,
metrics, values, count, motion: "mkt", side })`) et donne à chaque constat
celui de son chiffre (le côté `match` : la demande).
- `chain-break` : une colonne d'un funnel nulle dont le chiffre est `missing` ;
  le verbe vient de `findings.verbMkt` (§22.8.5 j) ;
- `no-definition`, `conflict` : comme partout, sur `shapesOf(setup)` ;
- `below-comparator` : pour chaque étape nommée, de chaque côté
  (`namedFindings`, sur le diagnostic de ce côté) ;
- `unit-econ-uncomputable`, `unit-econ-loss`, `unit-econ-loss-maybe` : pour un
  acheteur (`["mkt.rev.ltv", "mkt.buy.cac"]`, le CAC lu par `knownIn`), et pour
  un vendeur abonné avec les abonnements (`["mkt.sell.ltv", "mkt.sell.cac"]`,
  **le coût d'un vendeur abonné** : `findings.ts#lossFinding` gagne un dernier
  paramètre facultatif, `cacValue?: Interval`, qui remplace la lecture de
  `cacId` quand il est donné ; l'offre lui passe `mktPaidSellerCac`, 200 € dans
  l'exemple, pas les 100 € d'un vendeur actif). Le type de `cacId` gagne
  `"mkt.buy.cac" | "mkt.sell.cac"` ;
- `reconcile-gap` (depuis le contrôle, côté demande) ; `small-cohort` (la
  petite cohorte d'un côté, §22.5.2, avec ce côté).

#### 22.5.9 La série, le pont, la dérivation (MKT-4)

- **`series.ts`** : la boucle des motions passe par `activeMotions(setup)`
  (§22.2.5) ; les chiffres d'une place de marché sont `shapesOf(setup)` (19 ou
  14), pas une liste fixe (`SHAPES` garde le libre-service et l'assisté) ;
  `CANDIDATES` gagne les deux listes de candidats. `MotionSeries` gagne
  `sides?: Record<MktSide, { previousLeak: CandidateId[]; leakChanged: boolean
  }>`, posé pour la motion `"mkt"` seulement : `namedLeak` s'appelle **une fois
  par côté**, sur `diagnoseSide(state, ctx, side)` (jamais les deux côtés dans
  un même appel, D2) ; pour `"mkt"`, `previousLeak` vaut `[]` et `leakChanged`
  `false` (les écrans lisent `sides`). La slide « Ce qui a bougé » d'une place
  de marché est `evolution`, `motion: "mkt"` (MKT-8).
- **`bridge.ts`** : `MKT_ENGINE_BRIDGES` (MKT-1) ; `engine-props.ts` les sert
  après les autres.
- **`derive.ts`** : après le bloc de l'assisté,

```ts
  if (activeMotions(state.setup).includes("mkt")) {
    motions.push({
      motion: "mkt",
      coverage: motionCoverage(snapshot, "mkt", state.setup),
      funnel: buildMktFunnel(state, ctx),
      sides: {
        demand: { side: "demand", diagnosis: diagnoseSide(state, ctx, "demand"), unit: mktUnitEconomics(state, ctx, "demand") },
        supply: { side: "supply", diagnosis: diagnoseSide(state, ctx, "supply"), unit: mktUnitEconomics(state, ctx, "supply") },
      },
      total: mktTotal(state, ctx),
    });
  }
```

  Les champs du haut (`peloton`, `diagnosis`, `unit`) restent ceux d'un
  libre-service vide pour une place de marché, comme pour un assisté seul ;
  `total` (de l'hybride) reste `null`.
- **`mktTotal(state, ctx): MktTotal`** (`mkt-scenario.ts`, MKT-4), depuis
  `buildMktScenario(state, {}, ctx, side).today.kpis` de chaque côté : `now` =
  `mrr`, `newPerMonth` = `newMrr`, `in12Months` = `mrr12`. Chaque part est une
  `DerivedValue` : connue, avec la confiance `solid` pour `now` quand le compte
  partagé du côté est saisi (`mktNetRevenue`, `mktSellerMrrEnd`),
  `approximate` sinon et toujours pour `newPerMonth` et `in12Months` ;
  inconnue, `uncomputable` avec ses manques, parmi ceux qui ne sont pas connus
  : demande `now` : `mkt.rev.frequency`, `mkt.rev.aov`, `mkt.rev.take-rate` ;
  `newPerMonth` : les mêmes, puis `mkt.buy.cac` ; `in12Months` : les mêmes,
  puis `mkt.buy.churn` ; offre `now` : `mkt.sell.arpa` ; `newPerMonth` : puis
  `mkt.sell.signup-rate`, `mkt.sell.paid-conversion` ; `in12Months` : puis
  `mkt.sell.paid-churn`. `supply` vaut `null` sans abonnements. `total` :
  connu quand la demande l'est et que l'offre l'est ou vaut `null` (la somme ;
  la confiance la plus faible des deux) ; sinon `uncomputable`, avec l'union
  des manques (S9 : jamais une part présentée comme le total).

### 22.6 Les écrans

#### 22.6.1 La carte de départ, le réglage, les Réglages (MKT-6)

Ils se composent avec les composants existants (le choix, les cases, les
listes de la carte de réglage) : ils n'attendent pas le brief 10.

- **`EngineStart`** : `StartChoice` gagne `"mkt"`, présent si `"marketplace"` est
  ouvert, après `app`. Libellé `start.mkt`, note `start.mktNote`. Avec `mkt`
  choisi : un choix à deux options, `start.mktOffering` (« produits » ou
  « services », `start.mktOfferingProducts` / `…Services`, produits par
  défaut) et une case `start.mktSellerSubscriptions` (décochée par défaut,
  D9). La phrase des défauts : `start.defaultsMkt`. Le plan compte
  `shapesOf(setup)` (19, ou 14 sans les abonnements).
- **`start.ts`** : `typeOf("mkt") = "marketplace"` ; `motionsOf("mkt") = { plg:
  false, slg: false }` ; `startDefaults` écrit `offering`, `sellerSubscriptions`
  et la cohorte par `defaultCohortMonth` (§22.2.3).
- **`Setup`** : type `marketplace` → le champ des motions est remplacé par
  `setup.mktSides`, puis le choix « produits ou services »
  (`setup.mktOfferingLegend`), la case des abonnements, et les trois fenêtres :
  - `setup.firstOrderWindow` (7, 30, 90 jours ; 30) ;
  - `setup.repeatWindow` (60, 90, 180 jours ; 90) ;
  - `setup.firstSaleWindow` (30, 60, 90 jours ; 60) ;
  le nom : `setup.companyLabelMkt` ; les outils : `setupToolsFor("marketplace")`.
- **`TargetsStart`** : deux groupes, un par côté (titres
  `mkt.side.demandTitle`, `mkt.side.supplyTitle`), avec les candidats de
  `mktCandidates(side, setup)`. La boucle lit `activeMotions(setup)` au lieu de
  `["plg","slg"].filter(…)`.
- **Les Réglages** : le type grisé (§21.6.2) ; « produits ou services » se
  change (des mots seulement) ; la case des abonnements se change, avec les
  phrases des façons de gagner de §21.6.2 (`settings.streamOff*` /
  `streamOn*`, sujet `settings.streamSubject.sellerSubscriptions`) ; changer une
  fenêtre renvoie « à faire » le chiffre qu'elle définit
  (`firstOrderWindowDays` → `mkt.buy.first-order`, `repeatWindowDays` →
  `mkt.buy.repeat`, `firstSaleWindowDays` → `mkt.sell.first-sale` et
  `mkt.sell.paid-conversion`) ; `settingsNumbers` lit `mktCandidates` et
  `shapesOf(setup)`.
- **La barre** : `workbench.modelShort.marketplace` ; le mois des flux.

#### 22.6.2 Le tableau et les slides : ce qu'ils montrent (le contrat de données du brief 10)

**La forme est celle du retour du brief 10** (D13). Ce qui suit est fixé : ce
que chaque écran doit permettre de lire, et d'où viennent les chiffres. MKT-7
et MKT-8 se spécifient sur ce contrat **et** sur le retour.

- **Le sélecteur « côté affiché »** (`mkt.side.selector` : « Côté affiché » /
  "Side shown" ; options « Demande » / « Offre »), comme « Moteur affiché » de
  l'hybride : un côté à la fois, jamais côte à côte en comparaison.
- **Le total** (commissions + abonnements, `derived.motions[mkt].total`) au-dessus
  du sélecteur quand les vendeurs paient un abonnement : ce mois-ci, nouveau
  par mois, dans 12 mois. Sinon, le revenu net seul.
- **Chaque côté**, dans l'ordre de lecture du libre-service (C54) : son
  diagnostic (sa fuite, nommée par une cible) ; son argent (demande : revenu
  net du mois, annualisé, GMV, ce que vaut un acheteur ; offre : MRR des
  abonnements, annualisé, ce que vaut un vendeur abonné ; sans abonnements, une
  phrase `mkt.money.supplyNone`) ; son « Et si » (ses leviers, sa courbe) ; son
  funnel (demande : les deux colonnes sur 100 inscrits, les recommandés, le
  taux de service ; offre : première vente et conversion en abonné sur 100
  vendeurs inscrits, les deux churns).
- **La liste des chiffres** : par étape (C41), une étiquette de côté par ligne
  (`mkt.side.buy`, `mkt.side.sell`, `mkt.side.match`).
- **Le deck** : par côté, les slides du libre-service (funnel, fuite, « Et si
  », économie unitaire), plus une slide du total quand les vendeurs paient ;
  jamais une slide qui met les deux côtés face à face.

### 22.7 Le brief 10 (MKT-B)

Le brief est écrit : [`design/DS-EXTENSION-BRIEF-10.md`](../../design/DS-EXTENSION-BRIEF-10.md),
en anglais comme les briefs 07 et 09, avec les chiffres de l'exemple (§22.10)
et les mots déjà écrits (§22.8.5). L'unité MKT-B prend les captures qu'il
liste, les range dans `design/ds-extension-10/`, ajoute la ligne du brief à
`design/README.md`, et **s'arrête** : Antoine dépose le dossier dans Claude Design et lance le brief
(comme les briefs 07 et 09). Au retour, la session principale (pas un
sous-agent) recopie le retour dans `design/ds-extension-10-return/`, pose à
Antoine les questions qu'il ouvre (format `CHANTIERS.md` C), puis complète les
fiches MKT-7 et MKT-8 dans une PR de documentation. MKT-B peut partir **dès
maintenant**, pendant que l'app se code (C74).

### 22.8 La copie

Toute chaîne neuve porte `TODO: à relire` dans le code (convention 6). La
typographie (U+00A0 avant `:` `;` `%` `€` `?` `!`, après « et avant ») se pose
en code ; les tableaux ci-dessous l'écrivent avec des espaces ordinaires.

#### 22.8.1 Le mécanisme (MKT-5, puis MKT-S pour les mots « services »)

Le mécanisme de §21.8.1 (`mergeStrings`, `DeepPartialTranslatable`, une seule
fusion dans l'îlot), avec **un calque par côté** : une feuille générique qui dit
« client » se lit « acheteur » sur la demande et « vendeur abonné » sur l'offre.

- **`DeepPartialTranslatable`** est exporté de `src/lib/i18n/translatable.ts`
  (APP-3 l'y met, §21.8.1) : les deux types l'importent de là.
- **`src/content/engine-copy-marketplace.ts`** (nouveau, MKT-5, serveur
  seulement, `// TODO: à relire — copie neuve (convention 6), §22 (A23 MKT-5)`
  en tête) : `ENGINE_COPY_MKT: { demand: DeepPartialTranslatable<typeof
  ENGINE_COPY>; supply: DeepPartialTranslatable<typeof ENGINE_COPY> }`.
- **`src/content/engine-copy-mkt-services.ts`** (nouveau, MKT-S, même en-tête,
  « MKT-S ») : `ENGINE_COPY_MKT_SERVICES: { common; demand; supply }` (même
  type de feuille) : les mots « services » (§22.8.4) ; `common` réécrit ce qui
  vient de la base et de `mkt.*`, `demand` et `supply` ce qui vient de leur
  calque.
- **`src/content/engine-catalog-mkt-services.ts`** (nouveau, MKT-S) :
  `ENGINE_CATALOG_MKT_SERVICES` et `ENGINE_DERIVED_CATALOG_MKT_SERVICES`, des
  entrées partielles pour les 19 chiffres et les six calculés (les noms de
  §22.4.4 mot pour mot, les deux formules de §22.8.4 mot pour mot, le reste par
  le lexique de §22.8.4).
- **Les nouvelles feuilles `mkt.*`** vivent dans `ENGINE_COPY`, sous une clé de
  premier niveau `mkt` (§22.8.5), écrites avec les mots « produits » :
  `mkt.side`, `mkt.funnel`, `mkt.money`, `mkt.total`, et `mkt.assumption` (les
  six hypothèses neuves, §22.8.5 d) ; les titres neufs dans `slideTitles`
  (MKT-8) ; les sujets, les entrées d'`unitInput`, les comptes partagés et les
  contrôles à leur place (`subject`, `unitInput`, `io.sharedCount`, `sanity`),
  sous des clés qui commencent par `mkt`.
- **`src/lib/engine/strings.ts`** gagne un type et une fonction pure, la seule
  qui connaisse l'ordre des calques :

```ts
/** The marketplace's overlays, resolved in one language, as the page passes them. MKT-5 fills `products`; `services` is { common: {}, demand: {}, supply: {} } until MKT-S. */
export interface MarketplaceLayers<T> {
  products: { demand: DeepPartial<T>; supply: DeepPartial<T> };
  services: { common: DeepPartial<T>; demand: DeepPartial<T>; supply: DeepPartial<T> };
}
/** The strings a marketplace screen or slide reads (§22.8.1): base, then the side's products words, then the services words. Generic, so the tests pass ENGINE_COPY itself. */
export function marketplaceStrings<T>(base: T, layers: MarketplaceLayers<T>, offering: "products" | "services", side: MktSide | null): T;
```

  Ordre : `base` → `products[side]` (si `side` n'est pas `null`) →
  `services.common` → `services[side]` (ces deux derniers seulement pour
  `"services"`, et le dernier seulement si `side` n'est pas `null`).
- **`engine-props.ts`** : `typeStrings` (§21.8.1) devient `{ "consumer-app":
  DeepPartial<EngineStrings>; marketplace: MarketplaceLayers<EngineStrings> }`,
  résolu par `resolveTree` (MKT-5) ; `typeCatalogs` gagne
  `"marketplace-services"` (MKT-S ; `marketplace` vient de MKT-1, §22.4.3).
  `_engine/view.ts#metricsFor(p, type, offering?)` et `derivedFor(p, type,
  offering?)` (la signature de §21.4.7, qui gagne `offering`) rendent
  `p.typeCatalogs["marketplace-services"]` pour `("marketplace", "services")`.
- **`stringsFor(type)`** (§21.8.1, `EngineWorkbench.tsx`) gagne la place de
  marché : `stringsFor("marketplace")` rend `marketplaceStrings(…, offering,
  null)` (le jeu neutre), et les écrans d'avant le moteur (la carte de
  réglage, l'exemple) le lisent comme pour l'app.
- **Dans l'îlot**, `EngineWorkbench.tsx` étend la ligne unique de §21.8.1 :
  pour une place de marché, `strings = marketplaceStrings(…, null)` (les mots
  neutres : la barre, la liste, l'écran d'un chiffre, le total) et
  `stringsForSide = (side) => marketplaceStrings(…, side)`, passé aux écrans
  d'un côté. **Dans le deck**, `buildMarketplaceDeck` reçoit les deux jeux et
  construit chaque slide d'un côté avec le sien. Le test statique de §21.8.1
  (un seul fichier de l'îlot nomme `typeStrings`) reste vrai.

#### 22.8.2 Le lexique de chaque côté (FR / EN)

**La demande** (calque `demand`) :

| SaaS B2B | Demande | Accords, exemples |
|---|---|---|
| client(s), client(s) payant(s), payant(s), abonné(s) | acheteur(s) ; acheteur(s) actif(s) quand le mot désigne ceux qui sont déjà là (« clients au 1er », « sur {base} clients payants ») | « nouveaux acheteurs », « acheteurs gardés », « sur {base} acheteurs actifs » |
| un (nouveau) client | un (nouvel) acheteur | « Ce que vaut un nouvel acheteur », « Par nouvel acheteur » |
| MRR | revenu net | « revenu net nouveau », « revenu net préservé », « revenu net dans 12 mois », « revenu net ajouté » ; « le MRR » seul, le stock : « le revenu net du mois » |
| ARR | revenu net annualisé | — |
| ARPA | revenu net par acheteur actif | dans la chaîne : « {arpa} par acheteur » |
| SaaS, ton SaaS | place de marché, ta place de marché | — |
| customer(s), paying customer(s), subscriber(s) | buyer(s) ; active buyer(s) for those already there | "new buyers", "buyers kept", "on {base} active buyers" |
| a (new) customer | a (new) buyer | "What one new buyer is worth" |
| MRR / ARR / ARPA | net revenue / annualised net revenue / net revenue per active buyer | "new net revenue", "net revenue in 12 months" |
| SaaS | marketplace | — |

« inscrit(s) », « visiteurs », CAC, LTV, payback et LTV:CAC **gardent leur
nom** sur la demande (les inscrits sont ceux du côté acheteurs).

**L'offre** (calque `supply`) :

| SaaS B2B | Offre | Accords, exemples |
|---|---|---|
| client(s), client(s) payant(s), payant(s), abonné(s) | vendeur(s) abonné(s) | « nouveaux vendeurs abonnés », « vendeurs abonnés gardés » |
| un (nouveau) client | un (nouveau) vendeur abonné | « Ce que vaut un nouveau vendeur abonné » |
| inscrit(s) | vendeur(s) inscrit(s) | « 100 vendeurs inscrits », « pour 100 vendeurs inscrits » |
| visiteurs | visiteurs de la page vendeurs | — |
| MRR | MRR des abonnements | « nouveau MRR des abonnements », « MRR des abonnements préservé », « MRR des abonnements dans 12 mois » |
| ARR | ARR des abonnements | — |
| ARPA | revenu par vendeur abonné | dans la chaîne : « {arpa} par vendeur abonné » |
| CAC | coût d'un vendeur abonné | « le coût d'un vendeur abonné » |
| SaaS, ton SaaS | place de marché, ta place de marché | — |
| customer(s), paying customer(s), subscriber(s) | paid seller(s) | "new paid sellers" |
| a (new) customer | a (new) paid seller | — |
| sign-up(s), signed up | seller sign-up(s) | "100 seller sign-ups" |
| visitors | seller page visitors | — |
| MRR / ARR / ARPA / CAC | subscription MRR / subscription ARR / revenue per paid seller / cost per paid seller | — |
| SaaS | marketplace | — |

LTV, payback et LTV:CAC gardent leur nom. **Les genres concordent** (client,
acheteur et vendeur abonné sont masculins ; le MRR et le revenu net aussi) :
une réécriture ne touche jamais aux accords du reste de la phrase, sauf
« nouveau » devant une voyelle (« un nouvel acheteur »).

#### 22.8.3 Ce que les calques doivent couvrir — la règle, et son test (MKT-5)

**La règle.** Pour chaque feuille d'`ENGINE_COPY` hors des chemins exclus
(plus bas), on cherche dans son texte **une fois ses gabarits `{…}` retirés**
(sinon `{arpa}` compterait), les mots « sans tenir compte de la casse » en
sous-chaîne, les mots entiers (`MRR`, `ARR`, `ARPA`, `CAC`) **en respectant
la casse** (comme §21.8.3). Deux désignations **indépendantes** :
- **les mots des deux côtés** — son français contient, sans tenir compte de la
  casse, `client`, `abonné`, `payant` ou `SaaS`, ou comme mot entier `MRR`,
  `ARR` ou `ARPA` ; ou son anglais `customer`, `subscriber`, `paying` ou
  `SaaS`, ou comme mot entier `MRR`, `ARR` ou `ARPA` : **`demand` et `supply`
  portent chacun la feuille**, réécrite avec leur lexique (§22.8.2) ;
- **les mots de l'offre** — son français contient `inscrit` ou `visiteur`, ou
  comme mot entier `CAC` ; ou son anglais `sign-up`, `signup`, `signed up`,
  `sign up` ou `visitor`, ou comme mot entier `CAC` : **`supply` porte la
  feuille**, réécrite.

Une feuille peut porter les deux sortes de mots : `demand` la porte (pour les
premiers), `supply` aussi (et réécrit les deux sortes). Les feuilles de
§22.8.5 c s'écrivent mot pour mot, **même si la règle ne les désigne pas** ou
qu'elles sont exclues ; une feuille du calque qui les contredit se corrige sur
elles. Mesuré le 2026-10-04 : environ 125 feuilles pour les deux côtés et 25
pour l'offre seule (un ordre de grandeur, pas un critère).

**Une feuille désignée qui ne se réécrit pas par le lexique sans changer de
sens** : ne pas s'arrêter. L'ajouter à `MKT_OVERLAY_SKIPPED` (§22.11.3)
(son chemin, une ligne de commentaire qui dit pourquoi), et la nommer dans le
compte rendu de l'unité : l'orchestrateur la relaie à Antoine à la pause. Une feuille désignée que l'exécutant croit jamais
affichée pour une place de marché, et qui n'est pas dans les exclusions : il
la réécrit quand même (sans risque), il ne l'exclut pas.

**Les jeux de mots que lit chaque écran.** Un écran ou une slide **d'un côté**
lit `marketplaceStrings(…, side)` ; **l'écran d'un chiffre** lit le jeu du côté
de ce chiffre (`"supply"` pour un id qui commence par `mkt.sell.`, `"demand"`
pour tous les autres, `mkt.liq.*` et `mkt.rev.*` compris) ; la barre, la liste
et le total lisent le jeu neutre (`side` à `null`), qui n'a pas de calque
« produits » : ils n'affichent que des feuilles `mkt.*`, le catalogue, et des
feuilles que la règle ne désigne pas. La garde à l'écran de §22.11.3 (MKT-10)
le vérifie ; une feuille qu'elle y attrape se règle comme §22.11.3 le dit.

**Les chemins exclus.** Une feuille est exclue dès qu'**une** de ces lignes la
désigne. La liste vit dans `src/content/__tests__/mkt-words.ts` sous le nom
`MKT_EXCLUDED`, ligne pour ligne, et dans le même ordre (§22.11.3).

1. **Les clés de premier niveau** qu'une place de marché n'affiche pas :
   `hybrid`, `total`, `relays`, `pipeline`, `slgChain`, `peloton` (son funnel
   a ses feuilles, `mkt.funnel`), `faq`, `meta`, `page`, `start`, `tools`,
   `role` (des noms de métier : « Customer Success » reste tel quel) ; et
   `mkt` (écrite pour elle).
2. **Dans `subject`, `leverSubject` et `unitInput`** : chaque entrée dont la
   clé ne commence pas par `mkt` (ce sont les phrases des chiffres du SaaS et
   de l'app ; celles de la place de marché ont leur propre clé, §22.8.5).
3. **Un segment du chemin qui contient** `slg`, `Slg`, `plg`, `Plg`, `hybrid`,
   `Hybrid`, `link`, `Link`, `peloton`, `Peloton`, `Both` ou `Mkt`, **ou qui
   commence par** `mkt` (les feuilles écrites pour la place de marché :
   `io.sharedCount.mkt*`, `subject["mkt.…"]`, `sanity.mkt*`, `slideTitles.mkt*`,
   `example.bannerTitleMkt`, `findings.verbMkt`…).
4. **Un segment qui est exactement** `sa`, `saNote`, `saTyped`, `both`,
   `bothNote`, `bothTyped`, `app` ou `appNote`.
5. **Le réglage des autres types** (le chemin, et tout ce qui est dessous) :
   `setup.types`, `setup.typeLater`, `setup.motions`, `setup.motionsRequired`,
   `setup.companyLabel`, `settings.motionLast`, `workbench.modelShort`,
   `example.bannerTitle`, `example.bannerBody`, `example.company`,
   `example.liveEvent`, `example.lossCause`, `example.pqlThreshold`,
   `slideTitles.total`, `slideTitles.totalUnknown`.
6. **Ce que seul l'hybride imprime** : `slideTitles.unitEconomicsNoneMargins`,
   `slideTitles.unitEconomicsNoneDifferent`, `slideTitles.unitEconomicsSides`,
   `notes.whoCountsWhere`, `notes.cycleLong`, `notes.whyNotCompare`,
   `notes.selfServeFeeds`, `notes.selfServeLever`, `findings.base` (et ses
   feuilles), `sanity.cacVariantsDiffer`.
7. **Ce que seul le SaaS imprime** : `scenario.kpiNrr`, `scenario.kpiGrr`,
   `scenario.kpiNrr12`, `slide.unitRetention`, `slide.unitRetentionUnknown`,
   `slide.unitRetentionMissing` (la GRR et la NRR : la place de marché n'en a
   pas) ; les hypothèses `scenario.assumption.activation-drives-downstream`,
   `…d30-drives-paying`, `…arpa-new-customers`, `…churn-as-revenue`,
   `…expansion-unknown`, `…contraction-unknown` ; `slide.leakAssumption` ;
   `slide.unitReference`, `slide.unitRatioReference`,
   `slide.unitBothReference` (aucun repère, D12) ; `slide.unitCompanyWide*`
   (la marge globale est réservée au SaaS) ; `sanity.paidGtRetained`,
   `sanity.retainedGtActivated` (les contrôles du funnel du SaaS ; ceux de la
   place de marché sont `sanity.mkt*`).
8. **Ce que seule l'app imprime** : les clés neuves de §21.8.4 b (son tableau
   en est la liste ; MKT-5 les recopie une par une).

**Le test** (`src/content/__tests__/engine-copy-marketplace.test.ts`), critère
d'acceptation de MKT-5, sur le modèle d'`engine-copy-consumer.test.ts` :
1. **la couverture** : il parcourt `ENGINE_COPY`, applique la règle et
   `MKT_EXCLUDED`, et vérifie que chaque feuille désignée pour les deux côtés
   existe dans `ENGINE_COPY_MKT.demand` et dans `ENGINE_COPY_MKT.supply`, et
   chaque feuille désignée pour l'offre dans `supply` ; hors
   `MKT_OVERLAY_SKIPPED`. En cas d'échec, il imprime la liste de ce qui manque ;
2. **plus aucun mot du SaaS** : pour chaque côté, chaque feuille de
   `marketplaceStrings(ENGINE_COPY, layers, "products", side)` que la règle
   désigne pour ce côté ne contient plus un mot de la règle de ce côté, **après
   avoir retiré** les expressions cibles du lexique, qui en contiennent :
   - pour `supply` : `vendeur abonné`, `vendeurs abonnés`, `vendeur inscrit`,
     `vendeurs inscrits`, `visiteurs de la page vendeurs`, `MRR des
     abonnements`, `ARR des abonnements`, `LTV:CAC` ; `subscription MRR`,
     `subscription ARR`, `seller sign-up`, `seller sign-ups`, `seller page
     visitors`, `LTV:CAC` ;
   - pour `demand` : aucune (son lexique n'en contient pas) ;

   sauf les exceptions nommées une par une, chacune commentée ;
3. **pas de clé orpheline** : chaque feuille d'un calque existe dans
   `ENGINE_COPY`, et a **les mêmes gabarits** (`{…}`) que la feuille qu'elle
   remplace, dans les deux langues ;
4. **les contrats de la copie** : les tests de contrat d'`engine-copy.test.ts`
   (`TITLE_CONTRACT`, longueurs, glyphes des slides, `**`, « de {month} », pas
   de tutoiement sur les slides, mots bannis, FR ≠ EN) s'appliquent **aussi**
   aux copies fusionnées : MKT-5 ajoute à leur paramétrage (§21.8.3, point 4)
   les deux fusions `marketplaceStrings(…, "products", "demand" | "supply")`,
   et MKT-S les deux fusions `"services"` ;
5. **la règle « services »** (écrite par MKT-S, §22.8.4) : dans les quatre
   fusions `marketplaceStrings(…, "services", "demand" | "supply" | null)` —
   le jeu neutre compris —, aucune feuille hors de `MKT_SERVICES_EXCLUDED` ne
   contient comme mot entier, sans tenir compte de la casse :
   - en français : `acheteur(s)`, `vendeur(s)`, `commande(s)`, `commander`,
     `annonce(s)`, `panier`, `vente(s)`, `vend`, `vendent`, `vendu(e)(s)`,
     `achat(s)` ;
   - en anglais : `buyer(s)`, `seller(s)`, `order(s)`, `ordered`, `listing(s)`,
     `sale(s)`, `sell`, `sells`, `sold`, `purchase(s)`, `basket`, `buy`,
     `buys` ;

   ni aucun texte d'une entrée de `typeCatalogs["marketplace-services"]`
   (ses noms, formules, pièges, demandes et chemins). Les mots se cherchent en
   mots entiers **au sens Unicode** (`/(^|[^\p{L}])mot(?!\p{L})/iu`, pas `\b`, qui
   tient les lettres accentuées pour des séparateurs). `MKT_SERVICES_EXCLUDED` est
   `MKT_EXCLUDED` **sans** ses lignes qui visent les feuilles écrites pour la
   place de marché (la clé `mkt` de la ligne 1, les clés `mkt…` de la ligne 2,
   et `Mkt` et le préfixe `mkt` de la ligne 3) : la règle « services » les
   couvre, puisqu'elles sont écrites avec les mots « produits ». Exception
   nommée dès MKT-S : `io.unsupportedSetup` (« comment l'entreprise vend »,
   affiché quand un fichier ne dit pas son type, donc avant qu'on sache si
   c'est une place de marché de services) ;
6. **jamais « offre contre demande »** (D14) : aucune feuille `mkt.*`, aucune
   feuille des calques, aucun titre `mkt*` ne contient `vs`, `contre l'offre`,
   `contre la demande`, `plutôt que`, `plus que la demande`, `plus que l'offre`,
   `offre ou demande`, `demande ou offre` (anglais : `vs`, `versus`, `rather
   than`, `more than supply`, `more than demand`, `supply or demand`, `demand or
   supply`), même forme que le test de l'hybride (`engine-copy.test.ts`, le
   bloc qui garde « jamais l'un contre l'autre »).

Les points 1 à 4 et 6 sont écrits par MKT-5, le point 5 et les deux fusions
« services » du point 4 par MKT-S.

#### 22.8.4 Le lexique « services » (FR / EN, MKT-S)

Appliqué par `ENGINE_COPY_MKT_SERVICES` et `ENGINE_CATALOG_MKT_SERVICES` à
chaque feuille que la règle 5 de §22.8.3 attrape dans les fusions « services »
(les feuilles `mkt.*`, celles des deux calques « produits », celles du réglage
comme `setup.mktSides` ou `setup.firstOrderWindow`), et à toute la prose des 25
entrées du catalogue. `services.common` réécrit ce qui vient de la base ou de
`mkt.*` ; `services.demand` et `services.supply` réécrivent ce qui vient du
calque « produits » de leur côté. Une feuille que `services.demand` et
`services.supply` écriraient à l'identique s'écrit une fois, dans `common`
(qui passe avant eux et après les calques « produits », §22.8.1) ; jamais une
feuille dont les deux réécritures diffèrent.

| Produits | Services | Accords, exemples |
|---|---|---|
| acheteur(s) | client(s) | « nouveaux clients », « clients actifs », « un nouveau client » (et plus « nouvel ») |
| vendeur(s) | prestataire(s) | « prestataires abonnés », « prestataire actif » |
| commande(s), commander, passer une commande | réservation(s), réserver, faire une réservation | « première réservation », « deuxième réservation » |
| achat(s), acheter | réservation(s), réserver | « fréquence de réservation » |
| annonce(s) | profil(s) | « un profil consulté » (masculin : l'accord suit) |
| panier moyen ; panier seul | montant moyen d'une réservation ; montant de la réservation | — |
| vente(s) seule, première vente | réservation(s) reçue(s), première réservation reçue | « {a} reçoivent une première réservation » |
| vendre ; vend, vendent ; vendu(e)(s) | être réservé ; reçoit une réservation, reçoivent une réservation ; réservé(e)(s) | « un prestataire qui ne reçoit plus de réservation » |
| page vendeurs | page prestataires | — |
| buyer(s) · seller(s) · order(s), to order, place an order · purchase(s), to buy, buy(s) · listing(s) | client(s) · provider(s) · booking(s), to book, make a booking · booking(s), to book, book(s) · profile(s) | — |
| average order value ; basket alone · first sale ; sale(s) alone · to sell, sell(s), sold · seller page | average booking value ; booking amount · first booking received ; booking(s) received · to get booked, get(s) booked, booked · provider page | — |

Le GMV, la commission (take rate), le taux de service et la liquidité **gardent
leur nom**. Les genres concordent (acheteur et client, vendeur et prestataire
masculins ; commande et réservation, vente et réservation féminins), sauf
« nouvel acheteur » → « nouveau client » et « annonce » (féminin) → « profil »
(masculin) : l'adjectif qui suit s'accorde (« consultée » → « consulté »).
« Offre » ne s'emploie jamais pour une annonce : c'est le nom d'un côté.

**Le catalogue « services »** tient les mêmes plafonds que celui des produits
(`engine-catalog.test.ts` : nom ≤ 40, oneLiner ≤ 110, formule ≤ 140, piège
≤ 200, demande ≤ 160, `noReferenceReason` ≤ 160, chemin ≤ 180, entrée ≤ 48,
libellé de variante ≤ 40, pas de « de {month} ») : MKT-S étend ce test à
`typeCatalogs["marketplace-services"]`. Les noms sont ceux de §22.4.4 ; les
deux formules de churn, où le lexique ne suffit pas (« une vente » ne dit pas
qui l'a reçue), s'écrivent mot pour mot :

| Id | FR | EN |
|---|---|---|
| `mkt.buy.churn` | clients sortis des actifs dans le mois ÷ clients actifs au 1er du mois (actif : au moins une réservation sur les 12 derniers mois) | clients who left the active base in the month ÷ active clients at the start of the month (active: at least one booking in 12 months) |
| `mkt.sell.churn` | prestataires sortis des actifs dans le mois ÷ prestataires actifs au 1er du mois (actif : réservé au moins une fois en 12 mois) | providers who left the active base in the month ÷ active providers at the start of the month (active: booked at least once in 12 months) |

#### 22.8.5 Le texte neuf, mot pour mot

Dans une cellule de clés, « · » sépare les clés, et leurs textes dans le même
ordre ; « `…Suffixe` » répète la clé qui précède, suivie du suffixe
(`start.mktOffering` · `…Products` désigne `start.mktOfferingProducts`).

**a. Le réglage, la carte de départ, les Réglages** (MKT-6, dans
`ENGINE_COPY` à leur place) :

| Clé | FR | EN |
|---|---|---|
| `start.mkt` · `start.mktNote` | Place de marché · Une commission sur chaque commande, et peut-être un abonnement pour les vendeurs. | Marketplace · A commission on every order, and maybe a subscription for sellers. |
| `start.mktOffering` · `…Products` · `…Services` | Elle met en relation · Acheteurs et vendeurs de produits · Clients et prestataires de services | It connects · Buyers and sellers of products · Clients and service providers |
| `start.mktSellerSubscriptions` | Les vendeurs paient un abonnement | Sellers pay a subscription |
| `start.defaultsMkt` | Réglé pour une place de marché, en euros. Mois des chiffres : {month} ; inscrits suivis : {cohort}. | Set for a marketplace, in euros, on {month}'s figures and {cohort}'s sign-ups. |
| `setup.mktSides` | Une place de marché a deux côtés : les acheteurs et les vendeurs. | A marketplace has two sides: buyers and sellers. |
| `setup.mktOfferingLegend` | Ce qu'elle met en relation | What it connects |
| `setup.firstOrderWindow` · `repeatWindow` · `firstSaleWindow` | Première commande sous · Deuxième commande sous · Première vente sous | First order within · Second order within · First sale within |
| `setup.companyLabelMkt` | Nom de ta place de marché | Your marketplace's name |
| `settings.streamSubject.sellerSubscriptions` | Les abonnements des vendeurs | Seller subscriptions |
| `workbench.modelShort.marketplace` | Place de marché | Marketplace |

La carte de départ (`start.*`, un chemin exclu) nomme les deux vocabulaires et
ne passe jamais par le calque « services ». Les feuilles `setup.*` ci-dessus qui
portent un mot « produits » ont leur réécriture dans `services.common` (par
exemple `setup.mktSides` : « Une place de marché a deux côtés : les clients et
les prestataires. » / "A marketplace has two sides: clients and providers.").

**b. Les feuilles `mkt.*`** (MKT-5, `ENGINE_COPY.mkt`) :

| Clé | FR | EN |
|---|---|---|
| `mkt.side.demandTitle` · `supplyTitle` | La demande : les acheteurs · L'offre : les vendeurs | Demand: the buyers · Supply: the sellers |
| `mkt.side.buy` · `sell` · `match` | Acheteurs · Vendeurs · Liquidité | Buyers · Sellers · Liquidity |
| `mkt.side.selector` · `demand` · `supply` | Côté affiché · Demande · Offre | Side shown · Demand · Supply |
| `mkt.funnel.upstream` | ~{n} visiteurs du mois pour 100 inscrits · {source} · {month} | ~{n} visitors a month for 100 sign-ups · {source} · {month} |
| `mkt.funnel.sellerUpstream` | ~{n} visiteurs de la page vendeurs pour 100 vendeurs inscrits · {source} · {month} | ~{n} seller page visitors for 100 seller sign-ups · {source} · {month} |
| `mkt.funnel.signups` · `sellerSignups` | Inscrits · Vendeurs inscrits | Sign-ups · Seller sign-ups |
| `mkt.funnel.first` · `repeat` | Première commande sous {n} jours · Deuxième commande sous {n} jours | First order within {n} days · Second order within {n} days |
| `mkt.funnel.firstSale` · `paid` | Première vente sous {n} jours · Abonnés sous {n} jours | First sale within {n} days · Subscribed within {n} days |
| `mkt.funnel.legendReferred` | venus par recommandation ({n}) | came through a referral ({n}) |
| `mkt.funnel.sameHundred` | Tes inscrits en {cohort} sont ramenés à 100 pour se lire en pourcentages : chaque colonne est comptée sur ces mêmes 100. | Your {cohort} sign-ups are scaled to 100 so they read as percentages: every column is counted on those same 100. |
| `mkt.funnel.sellerSameHundred` | Tes vendeurs inscrits en {cohort} sont ramenés à 100 pour se lire en pourcentages : chaque colonne est comptée sur ces mêmes 100. | Your {cohort} seller sign-ups are scaled to 100 so they read as percentages: every column is counted on those same 100. |
| `mkt.funnel.slideSameHundred` · `slideSellerSameHundred` | Chaque colonne est comptée sur les mêmes 100 inscrits. · Chaque colonne est comptée sur les mêmes 100 vendeurs inscrits. | Every column is counted on the same 100 sign-ups. · Every column is counted on the same 100 seller sign-ups. |
| `mkt.funnel.clauseFirst` · `…One` | {a} passent une première commande · {a} passe une première commande | {a} place a first order · {a} places a first order |
| `mkt.funnel.clauseRepeat` · `…One` | {r} en passent une deuxième · {r} en passe une deuxième | {r} place a second one · {r} places a second one |
| `mkt.funnel.clauseFirstSale` · `…One` | {a} font une première vente · {a} fait une première vente | {a} make a first sale · {a} makes a first sale |
| `mkt.funnel.clausePaid` · `…One` | {p} s'abonnent · {p} s'abonne | {p} subscribe · {p} subscribes |
| `mkt.funnel.unmeasured.first` · `repeat` · `firstSale` · `paid` | la première commande · la deuxième commande · la première vente · la conversion en abonné | first order · second order · first sale · subscription conversion |
| `mkt.funnel.fillRequests` · `fillSearches` · `fillUnknown` | Taux de service : {fill} des demandes aboutissent à une commande · Taux de service : {fill} des recherches aboutissent à une commande · Taux de service : non mesuré | Fill rate: {fill} of requests end in an order · Fill rate: {fill} of searches end in an order · Fill rate: not measured |
| `mkt.funnel.churn` · `paidChurn` | Churn des vendeurs : {c} par mois · Churn des vendeurs abonnés : {c} par mois | Seller churn: {c} a month · Paid seller churn: {c} a month |
| `mkt.funnel.newBuyers` · `newPaidSellers` | Nouveaux acheteurs · Nouveaux vendeurs abonnés | New buyers · New paid sellers |
| `mkt.funnel.tableCaption` · `sellerTableCaption` | La demande, en chiffres · L'offre, en chiffres | Demand, in numbers · Supply, in numbers |
| `mkt.money.gmv` | Volume d'affaires du mois (GMV) | Gross volume this month (GMV) |
| `mkt.money.perBuyer` · `perSeller` | Revenu net par acheteur actif et par mois · Revenu par vendeur abonné et par mois | Net revenue per active buyer a month · Revenue per paid seller a month |
| `mkt.money.sellerCost` · `sellerCostNote` | Coût d'un vendeur abonné · Le coût d'un vendeur actif × la première vente ÷ la conversion en abonné, sur la même cohorte. | Cost per paid seller · The cost per active seller × first sale ÷ subscription conversion, on the same cohort. |
| `mkt.money.supplyNone` | Tes vendeurs ne paient pas d'abonnement : l'offre ne rapporte rien en direct, elle se lit dans le taux de service. | Your sellers pay no subscription: supply brings in nothing directly, it shows in the fill rate. |
| `mkt.total.title` | Deux flux, un total | Two streams, one total |
| `mkt.total.demand` · `supply` · `sum` · `sumArr` | Commissions (revenu net) · Abonnements des vendeurs · Total par mois · Total annualisé | Commissions (net revenue) · Seller subscriptions · Total a month · Annualised total |
| `mkt.total.newSum` | Nouveau par mois : {demand} + {supply} = {total} | New a month: {demand} + {supply} = {total} |
| `mkt.total.sum12` | Dans 12 mois, au rythme actuel : {demand} + {supply} = {total} | In 12 months, at the current pace: {demand} + {supply} = {total} |
| `mkt.total.ofDemand` · `ofSupply` | le revenu net des commissions · le MRR des abonnements | commission net revenue · subscription MRR |
| `mkt.total.footer` | Revenu net et MRR des abonnements à fin {month} · sources : {tools} | Net revenue and subscription MRR at the end of {month} · sources: {tools} |

**c. Les feuilles génériques à écrire mot pour mot dans les calques** (MKT-5 ;
le reste suit la règle et le lexique). Elles fixent le ton ; une feuille du
calque qui les contredit se corrige sur elles.

| Feuille | Langue | `demand` | `supply` |
|---|---|---|---|
| `slideTitles.leakClearMrrNew` | FR | Ramener {stage} à {target} vaudrait **{amount} de revenu net nouveau** chaque mois. | Ramener {stage} à {target} vaudrait **{amount} de nouveau MRR des abonnements** chaque mois. |
| | EN | Bringing {stage} to {target} would be worth **{amount} of new net revenue** every month. | Bringing {stage} to {target} would be worth **{amount} of new subscription MRR** every month. |
| `slideTitles.leakClearMrrRetained` | FR | Ramener {stage} à {target} vaudrait **{amount} de revenu net préservé** chaque mois. | Ramener {stage} à {target} vaudrait **{amount} de MRR des abonnements préservé** chaque mois. |
| | EN | Bringing {stage} to {target} would be worth **{amount} of retained net revenue** every month. | Bringing {stage} to {target} would be worth **{amount} of retained subscription MRR** every month. |
| `slideTitles.leakClearCustomers` | FR | Ramener {stage} à {target} ajouterait **{n} nouveaux acheteurs** par mois. | Ramener {stage} à {target} ajouterait **{n} vendeurs abonnés** par mois. |
| | EN | Bringing {stage} to {target} would add **{n} new buyers** a month. | Bringing {stage} to {target} would add **{n} paid sellers** a month. |
| `slideTitles.leakClearCustomersOne` | FR | Ramener {stage} à {target} ajouterait **{n} nouvel acheteur** par mois. | Ramener {stage} à {target} ajouterait **{n} vendeur abonné** par mois. |
| | EN | Bringing {stage} to {target} would add **{n} new buyer** a month. | Bringing {stage} to {target} would add **{n} paid seller** a month. |
| `slideTitles.leakClearKept` | FR | Ramener {stage} à {target} garderait **{n} acheteurs actifs** de plus par mois. | Ramener {stage} à {target} garderait **{n} vendeurs abonnés** de plus par mois. |
| | EN | Bringing {stage} to {target} would keep **{n} more active buyers** a month. | Bringing {stage} to {target} would keep **{n} more paid sellers** a month. |
| `slideTitles.leakClearKeptOne` | FR | Ramener {stage} à {target} garderait **{n} acheteur actif** de plus par mois. | Ramener {stage} à {target} garderait **{n} vendeur abonné** de plus par mois. |
| | EN | Bringing {stage} to {target} would keep **{n} more active buyer** a month. | Bringing {stage} to {target} would keep **{n} more paid seller** a month. |
| `slideTitles.whatIfLever` | FR | Si {stage} passait à {to} (aujourd'hui : {from}), le revenu net dans 12 mois gagnerait **{gain}**. | Si {stage} passait à {to} (aujourd'hui : {from}), le MRR des abonnements dans 12 mois gagnerait **{gain}**. |
| | EN | If {stage} went from {from} to {to}, net revenue in 12 months would gain **{gain}**. | If {stage} went from {from} to {to}, subscription MRR in 12 months would gain **{gain}**. |
| `slideTitles.scenario` | FR | Avec les {n} « Et si » ensemble, le revenu net dans 12 mois gagnerait **{gain}**. | Avec les {n} « Et si » ensemble, le MRR des abonnements dans 12 mois gagnerait **{gain}**. |
| | EN | With the {n} what-ifs together, net revenue in 12 months would gain **{gain}**. | With the {n} what-ifs together, subscription MRR in 12 months would gain **{gain}**. |
| `slideTitles.unitEconomics` | FR | Un acheteur rembourse son coût d'acquisition en **{m}** et rapporte **{x}** ce qu'il coûte. | Un vendeur abonné rembourse son coût d'acquisition en **{m}** et rapporte **{x}** ce qu'il coûte. |
| | EN | A buyer pays back their acquisition cost in **{m}** and brings in **{x}** what they cost. | A paid seller pays back their acquisition cost in **{m}** and brings in **{x}** what they cost. |
| `slideTitles.unitEconomicsUnknown` | FR | **On ne peut pas encore dire ce que rapporte un acheteur.** Il manque {input}. | **On ne peut pas encore dire ce que rapporte un vendeur abonné.** Il manque {input}. |
| | EN | **We can't yet say what a buyer is worth.** Missing: {input}. | **We can't yet say what a paid seller is worth.** Missing: {input}. |
| `slideTitles.unitEconomicsLoss` | FR | Chaque nouvel acheteur nous coûte {cac} et en rapporte {ltv} : **on perd {gap} sur chacun**. | Chaque nouveau vendeur abonné nous coûte {cac} et en rapporte {ltv} : **on perd {gap} sur chacun**. |
| | EN | Each new buyer costs us {cac} and brings back {ltv}: **we lose {gap} on each one**. | Each new paid seller costs us {cac} and brings back {ltv}: **we lose {gap} on each one**. |
| `money.mrr` | FR | Revenu net | MRR des abonnements |
| | EN | Net revenue | Subscription MRR |
| `money.arr` | FR | Revenu net annualisé, le revenu net × 12 | ARR des abonnements, leur MRR × 12 |
| | EN | Annualised net revenue, net revenue × 12 | Subscription ARR, their MRR × 12 |
| `money.worthTitle` | FR | Ce que vaut un nouvel acheteur | Ce que vaut un nouveau vendeur abonné |
| | EN | What one new buyer is worth | What one new paid seller is worth |
| `whatIf.times` | FR | × revenu net par acheteur actif | × revenu par vendeur abonné |
| | EN | × net revenue per active buyer | × revenue per paid seller |
| `whatIf.timesFlow` | FR | {arpa} par acheteur, soit {amount} de revenu net ajouté chaque mois | {arpa} par vendeur abonné, soit {amount} de MRR des abonnements ajouté chaque mois |
| | EN | {arpa} per buyer, i.e. {amount} of net revenue added every month | {arpa} per paid seller, i.e. {amount} of subscription MRR added every month |
| `sanity.reconcileGap` | FR | Ta chaîne prédit ~{p} nouveaux acheteurs en {month} ; ton CAC acheteur en compte {n}. Au moins une définition ne porte pas sur la même population. | (jamais affichée pour l'offre : la réécrire par le lexique) |
| | EN | Your chain predicts ~{p} new buyers in {month}; your buyer CAC counts {n}. At least one definition doesn't cover the same population. | — |
| `sanity.reconcileGapOne` | FR | Ta chaîne prédit ~{p} nouvel acheteur en {month} ; ton CAC acheteur en compte {n}. Au moins une définition ne porte pas sur la même population. | (idem) |
| | EN | Your chain predicts ~{p} new buyer in {month}; your buyer CAC counts {n}. At least one definition doesn't cover the same population. | — |
| `findings.reconcile` · `findings.reconcileOne` | FR, EN | le texte de `sanity.reconcileGap` · `sanity.reconcileGapOne` ci-dessus, mot pour mot (§22.8.5 j) | (jamais affichées pour l'offre : les réécrire par le lexique) |
| `scenario.assumption.same-spend` | FR | À dépense égale : plus de nouveaux acheteurs font baisser le CAC dans la même proportion. | À dépense égale : plus de vendeurs abonnés font baisser le coût d'un vendeur abonné dans la même proportion. |
| | EN | Same spend: more new buyers lower the CAC in the same proportion. | Same spend: more paid sellers lower the cost per paid seller in the same proportion. |
| `scenario.assumption.twelve-months` | FR | Sur 12 mois, au rythme de ce mois : le revenu net gardé chaque mois au rythme du churn des acheteurs, plus le revenu net nouveau du mois. Ni saisonnalité, ni saturation. | Sur 12 mois, au rythme de ce mois : le MRR des abonnements gardé chaque mois au rythme du churn des vendeurs abonnés, plus le nouveau MRR des abonnements du mois. Ni saisonnalité, ni saturation. |
| | EN | Over 12 months, at this month's pace: the net revenue kept each month at the buyer churn's pace, plus the month's new net revenue. No seasonality, no saturation. | Over 12 months, at this month's pace: the subscription MRR kept each month at the paid seller churn's pace, plus the month's new subscription MRR. No seasonality, no saturation. |
| `scenario.assumeLtv` | FR | LTV : la marge mensuelle sur la durée de vie comptée d'un acheteur (1 ÷ churn des acheteurs, plafonnée à 36 mois), au revenu net par acheteur actif d'aujourd'hui. | LTV : la marge mensuelle sur la durée de vie comptée d'un vendeur abonné (1 ÷ churn des vendeurs abonnés, plafonnée à 36 mois), au revenu par vendeur abonné d'aujourd'hui. |
| | EN | LTV: the monthly margin over a buyer's counted lifetime (1 ÷ buyer churn, capped at 36 months), on today's net revenue per active buyer. | LTV: the monthly margin over a paid seller's counted lifetime (1 ÷ paid seller churn, capped at 36 months), on today's revenue per paid seller. |
| `scenario.kpiCac` | FR | (la règle ne la désigne pas : « CAC ») | Coût d'un vendeur abonné |
| | EN | — | Cost per paid seller |
| `scenario.kpiPayback` | FR | (la règle ne la désigne pas : « CAC payback ») | Payback |
| | EN | — | Payback |

**d. Les hypothèses neuves** (MKT-3, sous **`mkt.assumption.<id>`** :
`scenario.assumption` est un `Record<ScenarioAssumption, …>` fermé, et les ids
de la place de marché sont un autre type, `MktScenarioAssumption`). Le texte
d'une hypothèse de la place de marché se lit dans `mkt.assumption[id]` pour
les six neuves, dans `scenario.assumption[id]` (réécrite par le calque du
côté) pour les quatre partagées :

| Id | FR | EN |
|---|---|---|
| `fill-new-buyers-only` | Un meilleur taux de service ne compte que pour les nouveaux acheteurs : l'effet sur les acheteurs déjà là n'est pas compté, c'est un minimum. | A better fill rate only counts for new buyers: the effect on existing buyers isn't counted, so this is a minimum. |
| `new-buyer-spends-average` | Un nouvel acheteur dépense comme l'acheteur actif moyen. | A new buyer spends like the average active buyer. |
| `money-levers-all-buyers` | Une fréquence, un panier ou une commission qui changent jouent sur tous les acheteurs, dès le mois suivant. | A change in frequency, order value or take rate applies to every buyer, from the next month. |
| `price-all-paid-sellers` | Un prix d'abonnement qui change joue sur tous les vendeurs abonnés, dès le mois suivant. | A change in subscription price applies to every paid seller, from the next month. |
| `active-twelve-months` | Un acheteur est actif s'il a commandé dans les 12 derniers mois ; ses départs sont le churn des acheteurs. | A buyer is active if they ordered in the last 12 months; their departures are the buyer churn. |
| `supply-priced-by-subscriptions` | L'offre ne se chiffre que par ses abonnements : convertir un vendeur, garder un abonné. La première vente et le départ d'un vendeur actif sont nommés, sans montant. | Supply is priced only through its subscriptions: converting a seller, keeping a subscriber. The first sale and an active seller leaving are named, without an amount. |

`signup-same-visitors`, `referral-on-top`, `same-spend` et `twelve-months`
servent les deux côtés, réécrites par les calques (la règle les désigne).

**e. Les titres neufs des slides** (MKT-8, `slideTitles`, chacun ajouté au
`TITLE_CONTRACT` d'`engine-copy.test.ts` et déclenché par le balayage de
`sentences-guard.test.ts`, §22.11.1) :

| Clé | FR | EN |
|---|---|---|
| `mktFunnelComplete` | Sur 100 inscrits côté acheteurs, {first} et **{repeat}**. | Out of 100 buyer sign-ups, {first} and **{repeat}**. |
| `mktFunnelGapOne` | Sur 100 inscrits côté acheteurs, {clauses}. **Entre les deux, on ne voit rien : {stages} n'est pas mesurée.** | Out of 100 buyer sign-ups, {clauses}. **In between, we see nothing: {stages} isn't measured.** |
| `mktFunnelTailBreakOne` | Sur 100 inscrits côté acheteurs, {clauses}. **Au-delà, on ne sait pas les suivre : {stages} n'est pas mesurée.** | Out of 100 buyer sign-ups, {clauses}. **Beyond that, we can't follow them: {stages} isn't measured.** |
| `mktFunnelEmpty` | **On ne sait pas encore suivre 100 inscrits jusqu'à leur première commande.** | **We can't yet follow 100 sign-ups to their first order.** |
| `mktSupplyFunnelComplete` | Sur 100 vendeurs inscrits, {first} et **{paid}**. | Out of 100 seller sign-ups, {first} and **{paid}**. |
| `mktSupplyFunnelCompleteOne` | Sur 100 vendeurs inscrits, **{first}**. | Out of 100 seller sign-ups, **{first}**. |
| `mktSupplyFunnelGapOne` | Sur 100 vendeurs inscrits, {clauses}. **Entre les deux, on ne voit rien : {stages} n'est pas mesurée.** | Out of 100 seller sign-ups, {clauses}. **In between, we see nothing: {stages} isn't measured.** |
| `mktSupplyFunnelTailBreakOne` | Sur 100 vendeurs inscrits, {clauses}. **Au-delà, on ne sait pas les suivre : {stages} n'est pas mesurée.** | Out of 100 seller sign-ups, {clauses}. **Beyond that, we can't follow them: {stages} isn't measured.** |
| `mktSupplyFunnelEmpty` | **On ne sait pas encore suivre 100 vendeurs inscrits jusqu'à leur première vente.** | **We can't yet follow 100 seller sign-ups to their first sale.** |
| `mktTotal` | La place de marché rapporte **{total}** par mois : {demand} de commissions, {supply} d'abonnements des vendeurs. | The marketplace brings in **{total}** a month: {demand} in commissions, {supply} in seller subscriptions. |
| `mktTotalUnknown` | **On ne peut pas encore additionner les deux flux** : {stream} n'est pas mesuré. | **We can't add the two streams up yet**: {stream} isn't measured. |
| `mktTotalUnknownBoth` | **On ne peut pas encore additionner les deux flux** : aucun des deux n'est mesuré. | **We can't add the two streams up yet**: neither is measured. |

`{stream}` : `mkt.total.ofDemand` ou `mkt.total.ofSupply`. Avec deux colonnes,
seules les variantes `One` existent (une colonne inconnue au plus après une
connue) ; `chainOf` (`peloton.ts`) dit laquelle. `title-accent.ts` : les
`mkt*FunnelGap*`, `mkt*FunnelTailBreak*` et `mkt*FunnelEmpty` comme leurs
équivalents `peloton*` ; les `mktTotal*` comme les `total*`. Les titres
génériques qui ne nomment que des étapes (`leakClearUnpriced`, `leakShared`,
`leakNotEnoughBelow`, `leakLevel`, `visibility*`, `mirror`, `ask*`, `annex`,
`evolution*`, `whatIfLeverPlain`, `scenarioPlain`) servent tels quels.
**Si le retour du brief 10 demande d'autres textes**, la session principale
les écrit dans la PR de documentation qui complète MKT-7 et MKT-8 (§22.7) :
un sous-agent n'en écrit jamais.

**f. Les sujets des candidats et les deux contrôles neufs** (MKT-4, dans
`subject` et `sanity`) :

| Clé | FR | EN |
|---|---|---|
| `subject["mkt.buy.signup-rate"]` | le taux d'inscription des acheteurs | the buyer sign-up rate |
| `subject["mkt.buy.first-order"]` | la première commande | the first order |
| `subject["mkt.liq.fill-rate"]` | le taux de service | the fill rate |
| `subject["mkt.buy.referred-share"]` | la part des inscrits recommandés | the referred share of sign-ups |
| `subject["mkt.buy.repeat"]` | la deuxième commande | the second order |
| `subject["mkt.buy.churn"]` | le churn des acheteurs | buyer churn |
| `subject["mkt.sell.signup-rate"]` | le taux d'inscription des vendeurs | the seller sign-up rate |
| `subject["mkt.sell.first-sale"]` | la première vente | the first sale |
| `subject["mkt.sell.paid-conversion"]` | la conversion en vendeur abonné | seller subscription conversion |
| `subject["mkt.sell.churn"]` | le churn des vendeurs | seller churn |
| `subject["mkt.sell.paid-churn"]` | le churn des vendeurs abonnés | paid seller churn |
| `sanity.mktRepeatGtFirst` | Plus de deuxièmes commandes que de premières : les deux chiffres portent-ils sur la même cohorte et la même fenêtre ? | More second orders than first ones: do both numbers cover the same cohort and window? |
| `sanity.mktTakeHigh` | Une commission au-dessus de 50 % : le GMV est-il compté sans les frais, ou le revenu net compté brut ? | A take rate above 50%: is GMV counted without fees, or net revenue counted gross? |

**g. Les comptes partagés** (MKT-1, `io.sharedCount`, `Record<SharedCount,
…>` : un nom en minuscules, lu au milieu d'une phrase, comme `monthSignups`) :

| Clé | FR | EN |
|---|---|---|
| `io.sharedCount.mktCohortSignups` | inscrits côté acheteurs de la cohorte suivie | buyer sign-ups in the followed cohort |
| `io.sharedCount.mktOrders` | commandes du mois | orders in the month |
| `io.sharedCount.mktGmv` | GMV du mois | GMV in the month |
| `io.sharedCount.mktNetRevenue` | revenu net du mois | net revenue in the month |
| `io.sharedCount.mktSellerCohortSignups` | vendeurs inscrits de la cohorte suivie | seller sign-ups in the followed cohort |
| `io.sharedCount.mktSellerMrrEnd` | MRR des abonnements vendeurs en fin de mois | seller subscription MRR at the month's end |

**h. La phrase de la page** (MKT-10 ; la règle de D15 de §21 : une phrase
ajoutée à la cinquième réponse de la FAQ, seulement quand le type est ouvert au
build). `faqTypeNote` gagne deux variantes, et `page.tsx` choisit selon
`openTypes` : l'app seule `consumerApp` (A22), la place de marché seule
`marketplace`, les deux `both`.

| Clé | FR | EN |
|---|---|---|
| `faqTypeNote.marketplace` | Il sert aussi les places de marché : choisis-la sur la carte de départ. | It also works for marketplaces: pick one on the start card. |
| `faqTypeNote.both` | Il sert aussi les apps grand public et les places de marché : choisis ton type sur la carte de départ. | It also works for consumer apps and marketplaces: pick your type on the start card. |

**i. Les sujets des leviers** (MKT-3, `leverSubject`, `Record<LeverId, …>`) :

| Clé | FR | EN |
|---|---|---|
| `leverSubject["mkt.buy.signup-rate"]` | le taux d'inscription des acheteurs | the buyer sign-up rate |
| `leverSubject["mkt.buy.referred-share"]` | la part des inscrits recommandés | the referred share of sign-ups |
| `leverSubject["mkt.buy.first-order"]` | la première commande | the first order |
| `leverSubject["mkt.liq.fill-rate"]` | le taux de service | the fill rate |
| `leverSubject["mkt.buy.churn"]` | le churn des acheteurs | buyer churn |
| `leverSubject["mkt.rev.frequency"]` | la fréquence de commande | order frequency |
| `leverSubject["mkt.rev.aov"]` | le panier moyen | the average order value |
| `leverSubject["mkt.rev.take-rate"]` | la commission | the take rate |
| `leverSubject["mkt.sell.paid-conversion"]` | la conversion en vendeur abonné | seller subscription conversion |
| `leverSubject["mkt.sell.paid-churn"]` | le churn des vendeurs abonnés | paid seller churn |
| `leverSubject["mkt.sell.arpa"]` | le prix de l'abonnement des vendeurs | the seller subscription price |

**j. Les constats** (MKT-4) : le verbe d'une colonne de funnel qui casse la
chaîne (`findings.chainBreak`, « Sur 100 inscrits, on ne sait pas dire combien
{verb}. » : le calque de l'offre en fait « Sur 100 vendeurs inscrits ») :

| Clé | FR | EN |
|---|---|---|
| `findings.verbMkt.first` · `repeat` | passent une première commande · en passent une deuxième | place a first order · place a second one |
| `findings.verbMkt.firstSale` · `paid` | font une première vente · s'abonnent | make a first sale · subscribe |

`sentences.ts` (le cas `chain-break`) prend `f.verbMkt[…]` quand la colonne
est un chiffre `mkt.*` (`MKT_CHAIN_VERB`, à côté de `CHAIN_VERB` :
`mkt.buy.first-order` → `first`, `mkt.buy.repeat` → `repeat`,
`mkt.sell.first-sale` → `firstSale`, `mkt.sell.paid-conversion` → `paid`).
Le constat `reconcile-gap` de la demande dit la même chose que son contrôle :
le calque de la demande porte `findings.reconcile` et `findings.reconcileOne`
mot pour mot comme `sanity.reconcileGap` et `sanity.reconcileGapOne` (§22.8.5
c : « … ton CAC acheteur en compte {n} … », la source du compte, qui n'est pas
une facturation).

### 22.9 L'analytique (MKT-6)

- `ENGINE_SETUP_DETAILS` += `"mkt"` ; `engineSetupDetail(setup)` rend `"mkt"`
  pour une place de marché.
- `engine_stage_saved/<stage>` : `ENGINE_MARKET_STAGES` = les cinq étapes
  préfixées `mkt-` (comme `ENGINE_SALES_STAGES` avec `slg-`) ;
  `engineStageDetail(stage, motion)` les produit pour la motion `"mkt"`.
- `/admin/stats` affiche les nouvelles lignes ; `engine-boundary.test.ts`
  vérifie qu'elles sont émises.

---

### 22.10 L'exemple chiffré (MKT-9)

#### 22.10.1 Les entrées (`exampleMarketplaceMetrics(words)`, `lib/engine/example.ts`)

Une place de marché fictive de mobilier d'occasion, EUR, mois des flux
`2026-08`, **cohorte suivie `2026-05`** (mûre pour la fenêtre de 90 jours au 24
septembre 2026), fenêtres par défaut (30, 90, 60), `type: "marketplace"`,
`motions: { plg: false, slg: false }`, `offering: "products"`,
**`sellerSubscriptions: true`**. « Aujourd'hui » : le 24 septembre 2026
(`EXAMPLE_TODAY_ISO`).

| Id | Statut · source | Valeur saisie |
|---|---|---|
| `mkt.buy.signup-rate` | measured · ga4 | 3 000 inscrits côté acheteurs ÷ 60 000 visiteurs (août) |
| `mkt.buy.cac` | measured · google-ads, variante `media-only` | 18 000 € ÷ 600 nouveaux acheteurs (août) |
| `mkt.sell.cac` | measured · spreadsheet, variante `media-only` | 12 000 € ÷ 120 nouveaux vendeurs actifs (août) |
| `mkt.sell.signup-rate` | measured · ga4 | 400 vendeurs inscrits ÷ 8 000 visiteurs de la page vendeurs (août) |
| `mkt.buy.first-order` | measured · product-db | 580 ÷ 2 900 inscrits (mai) |
| `mkt.sell.first-sale` | measured · product-db | 126 ÷ 420 vendeurs inscrits (mai) |
| `mkt.liq.fill-rate` | measured · amplitude, variante `searches` | 2 340 ÷ 26 000 (août) |
| `mkt.buy.repeat` | measured · product-db | 145 ÷ 2 900 |
| `mkt.buy.churn` | measured · product-db | 560 ÷ 14 000 acheteurs actifs au 1er août |
| `mkt.sell.churn` | measured · product-db | 96 ÷ 3 200 vendeurs actifs au 1er août |
| `mkt.sell.paid-churn` | measured · stripe | 27 ÷ 900 vendeurs abonnés au 1er août |
| `mkt.buy.referred-share` | measured · product-db | 232 ÷ 2 900 |
| `mkt.rev.take-rate` | measured · stripe | 32 853,60 € ÷ 273 780 € |
| `mkt.rev.aov` | measured · product-db | 273 780 € ÷ 4 212 commandes |
| `mkt.rev.frequency` | measured · product-db | 4 212 commandes ÷ 14 040 acheteurs actifs à fin août |
| `mkt.rev.gross-margin` | **estimated** · 55 à 65 %, `old-number` | — |
| `mkt.sell.paid-conversion` | measured · stripe | 63 ÷ 420 vendeurs inscrits (mai) |
| `mkt.sell.arpa` | measured · stripe | 26 100 € ÷ 900 vendeurs abonnés à fin août |
| `mkt.sell.gross-margin` | measured · spreadsheet | 22 185 € ÷ 26 100 € |

`base` : `mktCohortSignups 2 900`, `mktOrders 4 212`, `mktGmv 273 780`,
`mktNetRevenue 32 853,6`, `mktSellerCohortSignups 420`, `mktSellerMrrEnd
26 100`. **Cibles de l'équipe fictive** (`EXAMPLE_MKT_TARGETS`) : première
commande 25 %, taux de service 12 % (la demande) ; première vente 40 %,
conversion en abonné 20 %, churn des vendeurs abonnés 2,5 % (l'offre).
**« Et si » de l'exemple** (`whatIf`) : taux de service 12 %, première commande
25 %, commission 13 % ; conversion en abonné 20 %.

*Cohérence des entrées* : 3 000 inscrits × 20 % = 600 nouveaux acheteurs, le
dénominateur du CAC acheteur ; 400 vendeurs inscrits × 30 % = 120 nouveaux
vendeurs actifs, celui du coût d'un vendeur actif ; 60 nouveaux vendeurs
abonnés (400 × 15 %) × 200 € = 12 000 €, la même dépense.

**Les constantes** (`example.ts`, MKT-2) : `exampleMarketplaceMetrics()` (le
tableau ci-dessus ; sans mots : aucune entrée de l'exemple n'a de texte libre),
`EXAMPLE_MKT_TARGETS` (les cinq cibles), `EXAMPLE_MKT_WHATIF` (les quatre « Et
si », jamais posé dans l'état de l'exemple). **Les états** (`fixtures.ts`,
MKT-2, par `withEntry` et `measured` depuis un état vide au réglage de
l'exemple, comme APP-4 le fait pour l'app) : `marketplaceState()` et
`marketplaceNoSubscriptionsState()` (le même jeu, `sellerSubscriptions:
false` : les cinq chiffres des abonnements restent saisis, cachés, et ne
comptent nulle part). **MKT-9** : `exampleEngine(words, motions, type?,
monetization?, mkt?)` gagne un cinquième paramètre facultatif, `mkt?: {
offering?: "products" | "services"; sellerSubscriptions?: boolean }` (défaut :
`"products"`, `true`), construit ce jeu pour `"marketplace"` (il refuse une
case cochée), et les deux fixtures le lisent alors.

#### 22.10.2 Ce que le moteur doit en sortir

Les chiffres du modèle pur sont épinglés par `mkt-model.test.ts` ; ceux qui
dépendent du câblage sortent du script de référence
(`node docs/engine/reference/mkt-example.mjs`, qui réécrit la boucle et les
sommes sans code du moteur). Une ligne de ce tableau qui ne se retrouve pas
dans `derived`, un scénario ou le deck arrête l'unité (§22.13).

**La demande**

| Grandeur | Valeur |
|---|---|
| Funnel des acheteurs | 2 000 visiteurs pour 100 inscrits ; 8 recommandés ; première commande 20, deuxième commande 5 ; chaîne `complete` ; taux de service 9 % (recherches) |
| a, revenu net par acheteur actif et par mois | 2,34 € (0,3 × 65 € × 12 %) |
| Revenu net du mois (R) / annualisé | 32 853,60 € / 394 243,20 € |
| GMV du mois / annualisé | 273 780 € / 3 285 360 € |
| Nouveaux acheteurs du mois (N) / revenu net nouveau | 600 / 1 404 € |
| Diagnostic | `clear`, nommé `mkt.liq.fill-rate`, base `mrr` ; prix : taux de service 468 €/mois (600 × (12/9 − 1) × 2,34), première commande 351 €/mois (600 × (25/20 − 1) × 2,34) ; 468 > 351 × 1,25 = 438,75 ; `belowUnpriced` vide |
| Un acheteur | marge 1,287 à 1,521 € par mois ; durée de vie 25 mois ; LTV 32,17 à 38,03 € (approximative) ; CAC payback 19,72 à 23,31 mois ; LTV:CAC 1,07 à 1,27 ; 1,69 à 5,28 mois de marge après le remboursement ; pas de perte (`none`) ; pas d'alerte (sous le plancher de 30 mois) |
| Trésorerie | 18 000 € dépensés par mois ; 177 514,79 à 209 790,21 € immobilisés, un plancher |
| Revenu net dans 12 mois / annualisé | 33 723,61 € / 404 683,31 € |
| Courbe (13 points, arrondis) | 32 854 · 32 943 · 33 030 · 33 113 · 33 192 · 33 268 · 33 342 · 33 412 · 33 479 · 33 544 · 33 607 · 33 666 · 33 724 |
| Chaîne de la fuite (taux de service à 12 %) | 600 nouveaux acheteurs par mois ; à 12 %, 800 (600 × 12/9) : +200 ; × 2,34 € = 468 € de revenu net nouveau par mois ; sur un an, × 9,68 (`twelveMonthFactor(4)`) = 4 531,30 € |
| « Et si » de la demande | N' = 1 000 ; a' = 2,535 € ; revenu net nouveau 2 535 € ; revenu net dans 12 mois 46 351,72 € (annualisé 556 220,61 €), gain 12 628,11 € ; CAC 18 € à dépense égale ; LTV 34,86 à 41,19 € ; payback 10,92 à 12,91 mois ; LTV:CAC 1,94 à 2,29 |
| Courbe de l'« Et si » (arrondie) | 32 854 · 36 703 · 37 770 · 38 794 · 39 777 · 40 721 · 41 627 · 42 497 · 43 332 · 44 134 · 44 904 · 45 642 · 46 352 |
| Chaque levier seul | taux de service 4 531,30 € ; première commande 3 398,47 € ; commission 2 810,30 € ; somme 10 740,07 € ; effet composé +1 888,04 € |
| Hypothèses de l'« Et si » | `fill-new-buyers-only`, `new-buyer-spends-average`, `money-levers-all-buyers`, `same-spend`, `active-twelve-months`, `twelve-months` |

Le gain du taux de service seul (4 531,30 €) est égal à la dernière ligne de
sa chaîne : c'est voulu (le même N, le même a, le même churn), et un test le
garde.

**L'offre**

| Grandeur | Valeur |
|---|---|
| Funnel des vendeurs | 2 000 visiteurs de la page vendeurs pour 100 vendeurs inscrits ; première vente 30, abonnés 15 ; chaîne `complete` ; churn des vendeurs 3 % ; churn des vendeurs abonnés 3 % |
| MRR des abonnements (S) / annualisé | 26 100 € / 313 200 € |
| Nouveaux vendeurs abonnés (NS) / nouveau MRR | 60 / 1 740 € |
| Diagnostic | `clear`, nommé `mkt.sell.paid-conversion`, base `mrr` ; prix : conversion en abonné 580 €/mois (60 × (20/15 − 1) × 29), churn des abonnés 130,50 €/mois (900 × 0,5 % × 29) ; 580 > 130,50 × 1,25 = 163,13 ; `belowUnpriced` : `mkt.sell.first-sale` (30 % pour 40 %) |
| Un vendeur abonné | coût 200 € (100 × 30 ÷ 15) ; marge 24,65 € par mois ; durée de vie 33,33 mois ; LTV 821,67 € ; payback 8,11 mois ; LTV:CAC 4,11 ; 25,22 mois de marge après le remboursement ; pas de perte ; pas d'alerte |
| Trésorerie | 12 000 € dépensés par mois ; 48 681,54 € immobilisés, un plancher |
| MRR des abonnements dans 12 mois / annualisé | 35 866,43 € / 430 397,14 € |
| Courbe (arrondie) | 26 100 · 27 057 · 27 985 · 28 886 · 29 759 · 30 606 · 31 428 · 32 225 · 32 999 · 33 749 · 34 476 · 35 182 · 35 866 |
| Chaîne de la fuite (conversion à 20 %) | 60 nouveaux vendeurs abonnés par mois ; à 20 %, 80 : +20 ; × 29 € = 580 € de nouveau MRR des abonnements par mois ; sur un an, × 10,21 (`twelveMonthFactor(3)`) = 5 919,05 € |
| « Et si » de l'offre (conversion 20 %) | MRR des abonnements dans 12 mois 41 785,48 €, gain 5 919,05 € ; nouveau MRR 2 320 € ; coût d'un vendeur abonné 150 € ; payback 6,09 mois ; LTV:CAC 5,48 |
| Courbe de l'« Et si » (arrondie) | 26 100 · 27 637 · 29 128 · 30 574 · 31 977 · 33 338 · 34 657 · 35 938 · 37 180 · 38 384 · 39 553 · 40 686 · 41 785 |
| Chaque levier seul | conversion 20 % : 5 919,05 € ; churn des abonnés 2,5 % : 1 630,64 € ; prix 35 € : 7 420,64 € (mois 1 : 32 655 €) |
| Hypothèses de l'« Et si » | `same-spend`, `supply-priced-by-subscriptions`, `twelve-months` |

**Le total, la couverture, les contrôles**

| Grandeur | Valeur |
|---|---|
| Total ce mois-ci / annualisé | 58 953,60 € (32 853,60 € + 26 100 €) / 707 443,20 € |
| Nouveau par mois | 3 144 € (1 404 € + 1 740 €) ; avec les « Et si » : 4 855 € (2 535 € + 2 320 €) |
| Total dans 12 mois | 69 590,04 € ; avec les « Et si » des deux côtés : 88 137,19 € |
| Courbe du total (arrondie) | 58 954 · 60 000 · 61 015 · 61 998 · 62 951 · 63 875 · 64 770 · 65 637 · 66 478 · 67 293 · 68 083 · 68 848 · 69 590 |
| Courbe du total avec les « Et si » | 58 954 · 64 340 · 66 898 · 69 368 · 71 754 · 74 059 · 76 285 · 78 435 · 80 512 · 82 518 · 84 456 · 86 328 · 88 137 |
| Couverture | 19 chiffres : 18 trouvés, 1 approximatif (la marge des commissions), 0 introuvable, 0 en cours |
| Constats | un `below-comparator` par côté (`mkt.liq.fill-rate`, `mkt.sell.paid-conversion`) ; aucun constat de perte |
| Contrôles de cohérence | aucun (3 000 × 20 % ÷ 600 = 1, dans `RECONCILE_BAND`) |

**Sans les abonnements** (`marketplaceNoSubscriptionsState`) : 14 chiffres (13
trouvés, 1 approximatif) ; la demande inchangée ; le funnel de l'offre à une
colonne (première vente 30), sans visiteurs ; le diagnostic de l'offre
`not-enough` (une seule étape a une cible : la première vente) ; l'économie
d'un vendeur abonné `uncomputable` avec `missing: []`, jamais affichée ; le
total = le revenu net seul (32 853,60 € ; 33 723,61 € dans 12 mois), `supply:
null`.

---

### 22.11 Plan de tests

#### 22.11.1 Les tests existants qui changent, et les gardes neuves

Relevés sur `9a7733d` ; A22 en aura déplacé les lignes, d'où les noms seuls.
Un test qui rougit hors de cette liste arrête l'unité (§22.13).

| Test | Ce qui change | Unité |
|---|---|---|
| `business-type.test.ts` (créé par A22) | `MARKETPLACE_SCREENS_READY` vaut `false` (jusqu'à MKT-7) ; `openTypesWith("consumer-app,marketplace")` rend `["b2b-saas", "consumer-app"]` tant qu'elle vaut `false` ; `BUSINESS_TYPES` à trois ; `motionsAllowed("marketplace")` vide ; `activeMotions` des trois types ; `isSellingMotion` ; `mktSetup` et ses défauts ; le balayage qui refuse `as Motion` (§22.2.5) ; la garde « qui lit le type » de §21.10.1 gagne `isMarketplace` | MKT-0 |
| `validate.test.ts`, `io.test.ts`, `merge.test.ts`, `series.test.ts` | `validateEngine` : une place de marché valide (avec et sans abonnements, en « services ») ; chaque message de §22.3 déclenché ; un champ de la place de marché sur un SaaS, refusé ; l'app et le SaaS inchangés. `io.ts` : un fichier de place de marché refusé tant que la barrière est fermée (MKT-7 retourne ce test). `mergeRefusal` : abonnements différents → `"motions"` ; une des trois fenêtres différente → `"windows"` ; `offering` différent → fusion. `windowsOf` : les trois fenêtres pour une place de marché, aucune clé neuve pour un SaaS | MKT-0 |
| `cohort.test.ts` | les trois fenêtres ; la cohorte par défaut d'une place de marché (mai pour le 24 septembre 2026) | MKT-0 |
| `catalog-shape.test.ts` | l'ensemble des portées hors `plg`/`slg` vaut `new Set(["link", "app", "mkt"])` (la ligne qu'A22 a passée en ensemble) ; `shapesOf` d'une place de marché : 19, 14 sans abonnements, dans l'ordre de `MKT_METRIC_SHAPES` ; `derivedShapesOf` : 6 ou 3 ; un ★ par étape côté demande ; aucun repère ; les listes de §22.4.3 ; `motionOfMetric("mkt.…") === "mkt"` ; `UNPRICED_CANDIDATES`, `LOWER_IS_BETTER_CANDIDATES` | MKT-1 |
| `shared-counts.test.ts` | les six comptes partagés de §22.2.4 : la parité des libellés tient d'elle-même (§22.4.4 écrit les mêmes, et aucun libellé de la place de marché ne reprend un libellé du SaaS ou de l'app) ; en MKT-S, la même parité sur le catalogue « services » | MKT-1, MKT-S |
| `content/__tests__/engine-catalog.test.ts` | couvre les 19 et les 6 ; aucun `benchmarkCaveat`, un `noReferenceReason` chacun ; en MKT-S, les mêmes plafonds sur le catalogue « services » (§22.8.4) | MKT-1, MKT-S |
| `content/__tests__/engine-copy.test.ts` | `unitInput` couvre les entrées des six calculés (§22.4.3) ; `subject` couvre les candidats de la place de marché ; `TITLE_CONTRACT` gagne les titres de §22.8.5 e | MKT-1, MKT-4, MKT-8 |
| `content/__tests__/engine-copy-marketplace.test.ts` (nouveau) | les points 1 à 4 et 6 de §22.8.3 ; le point 5 en MKT-S | MKT-5, MKT-S |
| `sentences-guard.test.ts` | le balayage gagne `marketplaceState()` et `marketplaceNoSubscriptionsState()` : en MKT-4 pour les constats et les contrôles, avec la copie de base ; en MKT-8 pour le deck, rendu avec les mots de chaque côté (`marketplaceStrings`), en « produits » et en « services » ; « fires every slide title template » couvre les titres `mkt*` ; « every finding kind and every sanity check » gagne `mkt-repeat-gt-first` et `mkt-take-high` | MKT-4, MKT-8 |
| `src/__tests__/engine-boundary.test.ts` | `ENGINE_SETUP_DETAILS` gagne `"mkt"`, et `ENGINE_MARKET_STAGES` ses cinq détails, émis par l'îlot | MKT-6 |
| `golden-v1.test.ts`, `golden-v2.test.ts`, `golden-consumer.test.ts` | **rien** : ils restent verts sans toucher à `golden-projection.ts` | toutes |

**Les tests des unités de calcul** (`src/lib/engine/__tests__/`) :

| Fichier | Ce qu'il tient | Unité |
|---|---|---|
| `mkt-economics.test.ts` | a, R, GMV, N, NS, S et leurs replis (§22.5.1) ; le coût d'un vendeur abonné ; `mktUnitEconomics` des deux côtés, et `uncomputable` sans abonnements ; la marge, la durée de vie, la LTV, le payback, le LTV:CAC d'un acheteur et d'un vendeur abonné, et le coût d'un vendeur abonné, de §22.10.2, au centime | MKT-2 |
| `mkt-funnel.test.ts` | les deux funnels de §22.10.2 ; les quatre chaînes (`complete`, `gap`, `tail-break`, `empty`) de chaque côté ; le funnel de l'offre sans abonnements ; la petite cohorte (acheteurs, puis vendeurs) | MKT-2 |
| `mkt-scenario.test.ts` | sans levier, chaque côté égal à `demandPath` / `sellerPath` d'aujourd'hui ; l'argent d'A20 de chaque côté (perte, mois après le remboursement, dépense, trésorerie, alerte) de §22.10.2 ; les courbes et les KPI des deux « Et si » de §22.10.2 ; chaque levier seul ; l'effet composé ; « dépense égale » des deux côtés ; les hypothèses imprimées selon les leviers bougés ; un levier inconnu sans curseur ; l'offre sans abonnements sans levier ; `mktTotalPaths` (aujourd'hui, avec les « Et si », sans abonnements) | MKT-3 |
| `mkt-impact.test.ts` | les prix de classement des deux côtés ; les deux chaînes (taux de service, conversion en abonné) ligne par ligne ; le gain seul égal à la dernière ligne de la chaîne, des deux côtés ; les candidats jamais chiffrés (`{}`) ; `SUPPLY_PRICED` | MKT-4 |
| `diagnose-mkt.test.ts` | les deux diagnostics de l'exemple ; `not-enough` de l'offre sans abonnements ; `level`, `shared` (deux flux de la demande à moins de 25 % d'écart) ; seuls des candidats non chiffrés sous leur cible → nommés, base `none` ; les trois churns « plus bas = mieux » ; **aucune fonction ne reçoit les candidats des deux côtés** (les candidats de `MKT_DEMAND_RULES` et de `MKT_SUPPLY_RULES` sont disjoints, et `diagnoseSide` n'appelle `diagnoseWith` qu'une fois) | MKT-4 |
| `sanity.test.ts`, `findings.test.ts` | les contrôles de §22.5.7 et les constats de §22.5.8, chacun déclenché et non déclenché, avec leur `side` | MKT-4 |
| `series.test.ts` | deux mois d'une place de marché : les écarts, la fuite du mois d'avant de chaque côté | MKT-4 |
| `motions-independence.test.ts` | étendu : sur des états tirés au hasard (graine fixe), changer un chiffre de la place de marché ne change rien au libre-service ni à l'assisté d'un état SaaS, ni à une app, et inversement ; changer un chiffre de l'offre ne change ni le diagnostic ni le scénario de la demande, et inversement (seul le total bouge) | MKT-4 |

#### 22.11.2 Le golden de la place de marché (MKT-9)

`golden-mkt.test.ts`, sur le modèle de `golden-consumer.test.ts` : entrées
`golden-mkt-inputs.json` (l'exemple ; l'exemple sans cibles ; l'exemple avec
ses quatre « Et si » ; l'exemple sans abonnements ; l'exemple en « services » ;
un moteur vide), sortie `golden-mkt.json`, écrite **une fois** avec
`ENGINE_GOLDEN_MKT_WRITE=1` : `derived` entier, `deck`, `markdown`, les deux
scénarios et le total, en français et en anglais. **Avant d'écrire le golden**,
MKT-9 vérifie que chaque nombre de §22.10.2 y est ; un écart arrête l'unité.

#### 22.11.3 La garde des mots, à l'écran (MKT-10)

Le test de §22.8.3 garde la copie ; celle-ci garde **ce qui s'affiche**. Ses
listes de mots sont celles de §22.8.3, jamais recopiées : MKT-5 les écrit dans
un module sans test, `src/content/__tests__/mkt-words.ts` (`DEMAND_WORDS`,
`SUPPLY_WORDS`, `SUPPLY_TARGETS` — les expressions retirées avant de chercher,
point 2 —, `MKT_EXCLUDED`, `MKT_OVERLAY_SKIPPED`), MKT-S y ajoute
`SERVICES_BANNED` et `MKT_SERVICES_EXCLUDED`, et le test de §22.8.3, celui-ci
et l'e2e l'importent (un e2e importe déjà de `src/`, comme
`e2e/engine-canary.spec.ts`).

- **Unitaire** (`src/lib/engine/__tests__/mkt-words-guard.test.ts`) : le deck
  de l'exemple (§22.10), en français et en anglais, en « produits » et en
  « services », avec et sans abonnements des vendeurs. Le texte de chaque slide
  est sa section de `deckMarkdown` (de la ligne `## {index}. …` à la
  suivante), rapportée à sa slide par `index`. Sur chaque slide :
  - `side: "demand"` : aucun mot de `DEMAND_WORDS` ;
  - `side: "supply"` : aucun mot de `SUPPLY_WORDS` une fois `SUPPLY_TARGETS`
    retirées ;
  - sans côté (le titre, le total, l'annexe…) : jamais `SaaS` ; en
    « produits », ni `client` ni `customer` ;
  - en « services », en plus, aucun mot de `SERVICES_BANNED`.

  Exceptions nommées une par une, chacune commentée.
- **E2E** (dans `e2e/engine-marketplace.spec.ts`) : MKT-7 pose
  `data-testid="mkt-side"` sur l'élément qui contient tout ce que le sélecteur
  « Côté affiché » gouverne, et `data-testid="mkt-total"` sur le total. Le
  texte visible (`innerText`) :
  - de `mkt-side`, côté demande : aucun mot de `DEMAND_WORDS` (en
    « services », `client` y est permis : c'est son mot pour l'acheteur, et
    `DEMAND_WORDS` ne s'y applique qu'en « produits ») ;
  - de `mkt-side`, côté offre : aucun mot de `SUPPLY_WORDS` une fois
    `SUPPLY_TARGETS` retirées ;
  - de `main`, sur le tableau, l'écran d'un chiffre de chaque côté, le
    panneau « Et si », les Réglages et l'exemple : jamais `SaaS` ; en
    « services », aucun mot de `SERVICES_BANNED`.

Une feuille qu'elle attrape manquait à la règle de §22.8.3 : MKT-10 l'ajoute au
calque **et** élargit la règle (son test) pour qu'elle la désigne, puis le dit
dans son compte rendu. Un mot attrapé dans une feuille `mkt.*` du jeu neutre se
corrige dans `ENGINE_COPY` (la feuille `mkt.*` est fautive), pas dans un calque.

#### 22.11.4 E2E (`e2e/engine-marketplace.spec.ts`, MKT-10)

Sur le modèle d'`engine-hybrid-journey.spec.ts` et d'`engine-consumer.spec.ts`,
en français à 1 280 px et en anglais à 390 px :
1. la carte de départ propose « Place de marché » ; la choisir montre le choix
   « produits ou services » (produits par défaut) et la case des abonnements
   (décochée) ; cocher la case, commencer ; l'écran des cibles a deux groupes ;
   poser les cinq cibles de l'exemple ;
2. remplir les 19 chiffres de §22.10.1 par l'interface, et retrouver sur la
   demande « Freine ici » sur le taux de service, 32 853,60 € de revenu net, le
   payback d'un acheteur ; basculer le sélecteur sur l'offre : « Freine ici »
   sur la conversion en abonné, 26 100 € de MRR des abonnements ; le total
   58 953,60 € ;
3. bouger les quatre leviers de l'« Et si » de l'exemple et retrouver le gain
   de chaque côté, arrondi comme le moteur l'imprime ;
4. ouvrir les slides : le funnel de chaque côté, la fuite de chaque côté, la
   slide du total ; aucune slide ne met les deux côtés face à face ;
5. passer en « services » dans les Réglages : « clients », « prestataires »,
   « réservations » à l'écran, plus un « acheteur » ;
6. décocher les abonnements : les cinq chiffres disparaissent de la liste,
   l'offre dit `mkt.money.supplyNone`, le total devient le revenu net ;
   recocher : les valeurs reviennent ;
7. changer la fenêtre de la deuxième commande : le chiffre repasse « à faire » ;
8. exporter le fichier, effacer, réimporter : tout revient ; fusionner un
   fichier de place de marché dans un moteur SaaS : refusé ;
9. **build sans `marketplace` dans `ENGINE_TYPES`** (la spec « type fermé »
   d'A22, étendue) : l'option est absente de la carte de départ et grisée dans
   la carte de réglage.

Et les specs existantes étendues : `engine-screens.spec.ts` (le tableau des
deux côtés, l'écran d'un chiffre, passés à axe, de 320 à 1 280 px),
`engine-canary.spec.ts` (un parcours de place de marché où chaque champ libre
est rempli, rien ne sort), `engine-deck.spec.ts` (le deck de l'exemple).

#### 22.11.5 Non-vacuité, à mesurer à la livraison de chaque unité (`TESTING.md` §1.2)

| Sabotage | Ce qui doit rougir | Unité |
|---|---|---|
| Un `as Motion` ajouté dans `src/` | le balayage de `business-type.test.ts` | MKT-0 |
| `shapesOf` qui garde le taux d'inscription des vendeurs sans abonnements | les comptes 19 / 14 | MKT-1 |
| Le taux de service appliqué aussi à **a** (D5 trahie) | le gain seul égal à la chaîne ; la courbe de l'« Et si » de la demande | MKT-3 |
| Les leviers d'argent appliqués aux seuls nouveaux acheteurs (D6 trahie) | le point 1 de la courbe de l'« Et si » de la demande | MKT-3 |
| Le prix des abonnements appliqué aux seuls nouveaux abonnés | « prix 35 € : mois 1 = 32 655 € » | MKT-3 |
| Le coût d'un vendeur abonné qui ne baisse pas quand la conversion monte | « coût 150 € » de l'« Et si » de l'offre | MKT-3 |
| `mkt.sell.first-sale` retiré de `UNPRICED_CANDIDATES` | « la première vente n'est jamais chiffrée » ; `belowUnpriced` de l'offre | MKT-4 |
| `directionOf` qui oublie `mkt.sell.paid-churn` | « les trois churns, plus bas = mieux » ; le prix du churn des abonnés | MKT-4 |
| Un diagnostic qui reçoit les candidats des deux côtés | le test des candidats disjoints ; l'indépendance des côtés | MKT-4 |
| Une feuille désignée retirée du calque de l'offre | `engine-copy-marketplace.test.ts`, point 1 | MKT-5 |
| Un gabarit qui dit « offre contre demande » | `engine-copy-marketplace.test.ts`, point 6 | MKT-5 |
| « commande » laissé dans une feuille `mkt.funnel` en « services » | `engine-copy-marketplace.test.ts`, point 5 | MKT-S |
| La cohorte par défaut à 30 jours | « la cohorte de mai » | MKT-0 |
| Un mot « MRR » laissé sur l'écran de la demande | la garde e2e de §22.11.3 | MKT-10 |
| `ENGINE_TYPES` ignoré pour la place de marché | e2e 1 et 9 | MKT-10 |

---

### 22.12 L'exécution : quatorze unités

Le format des fiches, les rôles, le prompt d'une unité et ce que
l'orchestrateur vérifie avant de merger sont dans
[`executer-un-type.md`](executer-un-type.md) (§23). **Toutes les unités** ont
en commun :
- **Prérequis commun** : A22 fini (§21 : `business-type.ts`, le drapeau
  `ENGINE_TYPES`, `mergeStrings` et le calque de l'app, `scenario-of.ts`,
  `retentions`), **puis la relecture à blanc de §22 traitée** (ci-dessous,
  « MKT-R »), sauf MKT-B.
- **Acceptation commune** : `npx tsc --noEmit`, `npx eslint .`, `npx vitest
  run` verts ; les goldens v1, v2 et de l'app inchangés **sans** toucher à
  `golden-projection.ts` ; l'entrée de l'unité à la fin de `JOURNAL.md` (avec,
  pour MKT-0, MKT-1 et MKT-4, la liste des endroits de §22.2.5 et la réponse
  donnée à chacun) ; la case de l'unité cochée dans `CHANTIERS.md` A23 ; toute
  chaîne neuve marquée `TODO: à relire`.
- **Pause commune** : le type est fermé en production tant qu'`ENGINE_TYPES`
  ne le liste pas ; une unité mergée ne change rien de visible pour le SaaS
  ni pour l'app.

#### Le graphe

```text
MKT-B (dès maintenant) ──────────► [retour du brief 10 → PR de documentation : fiches MKT-7, MKT-8] ──────────────┐
                                                                                                                 │
A22 ─► MKT-R [relecture à blanc → PR de documentation]                                                           │
         │                                                                                                       │
         └─► MKT-0 ─► MKT-1 ─┬─► MKT-2 ─► MKT-3 ─► MKT-4 ─┐                                                      │
                             ├─► MKT-5 ─┬─────────────────┴─► MKT-6 ─────────────────────────────────────────────┤
                             │          └─► MKT-S ───────────────────────────────────────────────────────────────┴─► MKT-7 ─► MKT-8 ─► MKT-9 ─► MKT-10
                             └─► MKT-G
```

Avec une branche imposée, dans l'ordre MKT-R, MKT-0, MKT-1, MKT-2, MKT-3, MKT-4,
MKT-5, MKT-S, MKT-G, MKT-6, puis MKT-7 à MKT-10 une fois le retour porté dans les
fiches. **MKT-B ne dépend de rien** : elle part pendant qu'A22 se code (C74).
**Points d'arrêt naturels** : après MKT-R (§22 remise d'accord avec le code
d'après A22), après MKT-1 (les chiffres existent), après MKT-4
(le modèle est complet, rien d'affiché), après MKT-6 (on crée une place de
marché ; le tableau attend le brief), après MKT-8 (les écrans et les slides
sont là), après MKT-10 (fini, reste le bon à tirer).

| Unité | Ce qu'elle livre | Prérequis | Relecteurs | Jours-agent |
|---|---|---|---|---|
| MKT-B | les captures du brief 10, rangées ; la ligne de `design/README.md` | — | — | 0,5 |
| MKT-R | la relecture à blanc de §22 contre le code d'après A22, et la PR de documentation qui la traite (l'orchestrateur, pas une unité de code) | A22 | — | 0,5 |
| MKT-0 | le contrat, le type, `EngineMotion`, la validation, les fenêtres | MKT-R | sécurité (le fichier importé) | 2,5 |
| MKT-1 | les 19 chiffres et les 6 calculés : formes, listes, comptes partagés, prose ; les ponts | MKT-0 | copie | 2,5 |
| MKT-2 | les grandeurs de base, les deux funnels, l'économie de chaque côté | MKT-1 | — | 2 |
| MKT-3 | les deux scénarios et le total | MKT-2 | copie (hypothèses) | 2,5 |
| MKT-4 | le prix des fuites, les deux diagnostics, les contrôles, les constats, la série, la dérivation | MKT-3 | copie (`subject`) | 3 |
| MKT-5 | les feuilles `mkt.*`, les calques « produits » des deux côtés, `marketplaceStrings` | MKT-1 | copie | 3 |
| MKT-S | les trois calques « services » et le catalogue « services » | MKT-5 | copie | 2 |
| MKT-G | trois termes de glossaire (GMV, take rate, liquidité) | MKT-1 | copie | 2 |
| MKT-6 | la carte de départ, le réglage, les cibles, les Réglages, l'analytique | MKT-4, MKT-5 | copie, sécurité | 2 |
| MKT-7 | le tableau des deux côtés et le total | MKT-6, MKT-S, le retour porté | copie | 3 (à confirmer au retour) |
| MKT-8 | les slides | MKT-7 | copie | 2,5 (à confirmer au retour) |
| MKT-9 | l'exemple et le golden | MKT-8 | copie | 1 |
| MKT-10 | la garde à l'écran, les e2e, `ci.yml`, la documentation | MKT-9 | copie, sécurité | 2 |

Total ≈ **31 jours-agent**, plus la demi-journée de MKT-R et l'aller-retour du brief 10 (le temps de
Claude Design et d'Antoine). Puis **A23.d**, le bon à tirer de toute la copie
neuve (`/bon-a-tirer`, depuis `grep -rn "TODO: à relire" src/`, en
« produits » et en « services »), puis l'ouverture par Antoine
(`ENGINE_TYPES=consumer-app,marketplace` dans Vercel, puis redéployer).

---

#### MKT-R — La relecture à blanc, avant MKT-0 (l'orchestrateur, prompt H)

- **Pourquoi** : §22 a été écrite, puis relue à blanc, contre le code d'avant
  A22 (le 2026-10-04). A22 déplace des lignes et a pu choisir, dans ses
  « choix d'exécution », autre chose que ce que §21 prévoit. Les renvois
  `fichier:ligne` de §22.2.5 et les pièces d'A22 que §22 suppose se
  revérifient donc avant que la première unité parte, sur le code réel.
- **Prérequis** : A22 fini (APP-11 mergée). MKT-B ne l'attend pas.
- **Qui** : un sous-agent Sonnet **en lecture seule** (outil Agent, model
  `"sonnet"`, subagent_type `"general-purpose"`, au premier plan), avec le
  prompt ci-dessous ; puis l'orchestrateur, qui corrige §22 de ce qu'il trouve
  dans une PR de documentation, mergée avant MKT-0. Un constat qui demande une
  décision (produit, copie, architecture) se pose à Antoine au format de
  `CHANTIERS.md` C, avec la reco ; il ne se tranche pas dans la PR.
- **Ce qu'elle revérifie** :
  1. **Les pièces d'A22 dont §22 dépend**, sous le nom et la signature que §22
     écrit : `setup-type.ts` (module feuille, imports de types seulement :
     `isApp`, `monetizationOf`, `DEFAULT_APP_MONETIZATION`) ;
     `BUSINESS_TYPES` (dans `setup-type.ts` depuis la deuxième relecture de
     §21) ; `business-type.ts` (`motionsAllowed`) ;
     `access.ts#openTypesWith` ; `catalog-shape.ts` (`shapesOf(setup)`,
     `SetupShapes`, `UNIT_INPUT_IDS`, `displayShapeOf`, `DISPLAY_OVERRIDES`) ;
     `strings.ts#mergeStrings` ; `DeepPartialTranslatable` dans
     `lib/i18n/translatable.ts` ; `engine-props.ts` (`typeStrings`,
     `typeCatalogs`) ; `_engine/view.ts#metricsFor` ; `scenario-of.ts`
     (`scenarioOf`, `candidatesFor`, `leverIdsOf`) ; `MotionRules.retentions` ;
     `tools.ts#toolFamiliesFor` ; `phrases.ts#isCandidate` ; la phrase « il
     manque » du SaaS.
  2. **Les renvois des tables de §22.2.5**, retrouvés par la fonction ou
     l'expression qu'ils citent, et les comparaisons `=== "plg"` /
     `=== "slg"` et boucles `["plg", "slg"]` qu'A22 a ajoutées sans qu'aucune
     table ne les liste.
  3. **Les mesures** : les erreurs de `tsc` après les types de MKT-0, de
     MKT-1, puis de MKT-3 et MKT-4 (5, 28 puis 35 le 2026-10-04, avant A22) ;
     les feuilles que la règle de §22.8.3 désigne sur l'`ENGINE_COPY`
     d'après A22 (environ 125 pour les deux côtés, 25 pour l'offre seule, avant
     A22) ; les caractères de `JOURNAL.md` et de `CLAUDE.md` (§23.7, point 6).
  4. **MKT-0 à MKT-6, MKT-S et MKT-G jouées à blanc**, chacune depuis l'état
     que laisse la précédente.
- **Le prompt du sous-agent** (l'orchestrateur remplit `<DOSSIER>`, le clone,
  et `<SCRATCH>`, un dossier temporaire hors du dépôt) :

```text
Tu relis une spécification d'exécution AVANT qu'on l'implémente, à la place du sous-agent Sonnet qui l'exécutera ensuite unité par unité sans pouvoir rien décider du produit, de la copie ni de l'architecture. Ton travail : trouver chaque endroit où tu serais bloqué, où tu devrais deviner, ou où la spécification contredit le code réel. Ne modifie AUCUN fichier de <DOSSIER> et ne lance aucune commande git qui change quelque chose (ni checkout, ni commit, ni stash, ni worktree).

Lis, dans l'ordre : CLAUDE.md ; docs/engine/executer-un-type.md (§23) ; docs/engine/place-de-marche.md (§22) : §22.0, §22.1, les fiches de §22.12 (dont MKT-R, qui dit ce que tu revérifies), puis chaque section qu'elles citent ; les entrées du journal d'A22 (grep -n "APP-" JOURNAL.md docs/journal/), surtout leurs choix d'exécution ; puis le code que les fiches citent.

§22 a été écrite et relue contre le code d'avant l'app grand public (A22), qui est maintenant mergée. Fais, dans l'ordre :
1. Pour chaque pièce d'A22 de la liste « Ce qu'elle revérifie », point 1, de la fiche MKT-R : existe-t-elle sous le nom et la signature que §22 écrit ? Sinon, qu'est-ce qui existe à la place, et quelles phrases de §22 sont à reprendre ?
2. Pour chaque ligne des tables de §22.2.5 : retrouve l'endroit par la fonction ou l'expression citée et donne son fichier:ligne actuel. Cherche les comparaisons === "plg" / === "slg" et les boucles ["plg", "slg"] que le code d'A22 a ajoutées et qu'aucune table ne liste.
3. Mesure, dans une copie jetable : mkdir -p <SCRATCH>/dryrun22, copie-y src, tsconfig.json, next-env.d.ts et package.json, fais un lien symbolique vers <DOSSIER>/node_modules, puis npx tsc --noEmit -p . après les types de MKT-0, de MKT-1, puis de MKT-3 et MKT-4 (§22.2.1). Par un script dans cette copie, compte les feuilles d'ENGINE_COPY que la règle de §22.8.3 désigne (les deux côtés, l'offre seule), et liste toute feuille désignée qu'aucune exclusion n'écarte et que le lexique de §22.8.2 ne sait pas réécrire sans changer le sens. Supprime ce seul dossier à la fin.
4. Joue à blanc MKT-0, MKT-1, MKT-2, MKT-3, MKT-4, MKT-5, MKT-S, MKT-6 et MKT-G, chacune depuis l'état que laisse la précédente : chaque étape de sa fiche contre le code réel, comme si tu allais la taper. Les fichiers de sa rubrique « Fichiers » couvrent-ils tout ce que ses étapes obligent à toucher (tests qui rougiront, specs e2e, goldens) ?

Ton compte rendu, en français : une liste numérotée de constats, rangés par unité ; pour chacun, l'endroit de la spécification (section, courte citation), l'endroit du code (fichier:ligne), ce qui manque ou contredit, et l'information exacte qui débloquerait l'exécutant (un nom, une signature, une valeur, une règle, le texte exact) ; chacun classé BLOQUANT (l'exécutant devrait deviner, ou casserait quelque chose), LACUNE (il s'en sortirait mais pourrait se tromper) ou DÉTAIL. Puis la table des renvois de §22.2.5 à jour (ancien renvoi, nouveau). Puis tes mesures. Puis ce que tu as vérifié et trouvé juste. Pas de compliment, pas de résumé de la spécification.
```

- **Acceptation** : la PR de documentation mergée, qui met à jour les renvois
  de §22.2.5 et les mesures, et traite dans le texte chaque constat BLOQUANT
  et LACUNE (ou le pose à Antoine) ; son entrée au journal (les constats, ce
  qui a changé) ; la ligne MKT-R cochée dans le tableau d'A23.
- **Arrêt** : plus de 40 fichiers signalés par `tsc` à une étape (le découpage
  de MKT-0 et MKT-1 est alors à revoir avec Antoine, pas à forcer) ; une pièce
  d'A22 absente dont §22 a besoin et dont le remplacement change une décision
  de §22.14.
- **Pause** : rien ne change dans le code ; §22 est remise d'accord avec lui.

---

#### MKT-B — Les captures du brief 10

- **But** : le dossier que le brief 10 demande est prêt à déposer dans Claude
  Design ; Antoine n'a plus qu'à le lancer.
- **Prérequis** : aucun.
- **À lire** : §22.7 ; `design/DS-EXTENSION-BRIEF-10.md` (en entier : sa
  section « The screenshots » liste les captures, leurs noms et leurs
  largeurs) ; `design/README.md` ; `scripts/engine-density.capture.ts` (son
  en-tête et ses tests « brief 09 », le modèle) ;
  `src/lib/engine/__tests__/fixtures.ts` (`exampleState`, `hybridState`) ;
  `TESTING.md` (avant d'annoncer une capture prise).
- **Fichiers** : `scripts/engine-density.capture.ts` (des tests « brief 10 »,
  sur le modèle des tests « brief 09 », et une ligne de l'en-tête qui dit
  comment les lancer), `design/ds-extension-10/` (nouveau : les captures et
  un `README.md` qui les liste), `design/README.md` (une ligne).
- **Étapes** :
  1. Les tests « brief 10 » : une capture par ligne du tableau du brief, aux
     largeurs et dans les langues qu'il dit, nommée comme il la nomme ; l'état
     public de l'exemple pour le libre-service, `hybridState()` pour
     l'hybride et l'assisté ; pour `08`, deux leviers bougés comme le font les
     tests « brief 09 ».
  2. Construire et lancer comme l'en-tête du script le dit ; `OUT=design/ds-extension-10
     npx playwright test --config scripts/engine-density.config.ts --grep "brief 10"`.
  3. Écrire `design/ds-extension-10/README.md` : la liste, une ligne par
     capture (ce qu'elle montre), la date et le commit du build.
  4. Ajouter la ligne du brief 10 à `design/README.md`, sur le modèle des
     briefs 07 et 09 (« déposé, à lancer par Antoine »).
- **Acceptation** : chaque capture listée existe et s'ouvre, regardée ; le
  script tourne sans toucher aux tests « brief 07 » et « brief 09 » ;
  `npx tsc --noEmit` et `npx eslint .` verts.
- **Arrêt** : une capture demandée ne peut pas se prendre (un écran qui
  n'existe pas, un sélecteur introuvable) : la laisser de côté et le dire.
- **Relecteurs** : aucun.
- **Pause** : le brief attend Antoine. Quand son retour arrive, c'est la
  session principale qui le traite (§22.7), pas un sous-agent.

#### MKT-0 — Le contrat, le type, la validation

- **But** : une place de marché se valide, s'importe, se stocke et dérive sa
  motion ; `EngineMotion` existe et le compilateur est vert. Rien d'affiché
  ne change.
- **Prérequis** : MKT-R (et donc A22).
- **À lire** : §22.1 (D1, D9, D10, D11), §22.2.1 (le bloc MKT-0), §22.2.2,
  §22.2.5, §22.3 ; le code : `types.ts`, `setup-type.ts`, `business-type.ts`,
  `validate.ts`, `io.ts`, `merge.ts`, `cohort.ts`, `diagnose.ts`
  (`MotionRules`), et chaque fichier que `tsc` signale ensuite.
- **Fichiers** : `src/lib/engine/types.ts` (dont `SnapshotWindows`),
  `setup-type.ts` (dont `MARKETPLACE_SCREENS_READY`), `business-type.ts`,
  `tools.ts` (`MKT_TOOL_FAMILIES`), `access.ts` (la barrière dans
  `openTypesWith`), `catalog-shape.ts` (`SetupShapes` seulement),
  `validate.ts`, `io.ts`, `merge.ts`, `cohort.ts`, `series.ts`
  (`windowsOf`), `diagnose.ts` (le type de `MotionRules.motion` seulement),
  les fichiers que `tsc` signale (§22.2.5), leurs tests.
- **Étapes** :
  1. `types.ts` : le bloc MKT-0 de §22.2.1, rien d'autre (les ids de
     chiffres, de leviers, de candidats et de comptes partagés viennent avec
     les unités qui écrivent leurs entrées).
  2. `setup-type.ts` et `business-type.ts` : §22.2.2.
  3. **Ne pas remplacer** les `MOTIONS.filter((m) => setup.motions[m])` du
     code : pour une place de marché (deux cases fausses), ils rendent `[]`,
     et le code du SaaS ne fait rien pour elle. `activeMotions` s'appelle là
     où une fiche le dit (`derive.ts` en MKT-4, `TargetsStart.tsx` en MKT-6,
     le deck en MKT-8). Traiter ce que `tsc` signale (les champs élargis)
     selon §22.2.5.
  4. `validate.ts`, `io.ts`, `merge.ts`, `SnapshotWindows` et `windowsOf`,
     la barrière : §22.3. `tools.ts` : `MKT_TOOL_FAMILIES` (§22.2.2).
  5. `cohort.ts` : `windowDaysOf` et `defaultCohortMonth` (§22.2.3, le tiret
     de la cohorte).
  6. Tests : §22.11.1, lignes MKT-0.
- **Acceptation** : commune.
- **Arrêt** : §22.2.5, réponse 2 sans valeur donnée ; un test existant hors de
  §22.11.1 rougit ; plus de 40 fichiers signalés par `tsc` (le dire avant de
  continuer).
- **Relecteurs** : sécurité (la validation d'un fichier importé).
- **Pause** : rien de visible.

#### MKT-1 — Les chiffres de la place de marché

- **But** : les 19 chiffres et les 6 calculés existent avec leur prose ;
  `shapesOf` d'une place de marché les rend selon la case des abonnements.
  Aucun écran ne les montre encore.
- **Prérequis** : MKT-0.
- **À lire** : §22.1 (D4, D7, D12), §22.2.3, §22.2.4, §22.2.5, §22.4 ; le code :
  `catalog-shape.ts` (les formes de l'app, le modèle à suivre), `shared-counts.ts`,
  `bridge.ts`, `engine-props.ts`, `content/engine-catalog.ts` (son en-tête :
  les règles d'écriture), `content/engine-copy.ts` (`unitInput`).
- **Fichiers** : `catalog-shape.ts`, `shared-counts.ts`, `bridge.ts`,
  `engine-props.ts` (les ponts, le filtre des props du SaaS,
  `typeCatalogs.marketplace`), `_engine/view.ts` (`metricsFor`,
  `derivedFor`), `phrases.ts` (`TRAPS_ASKING_DEFINITION`),
  `content/engine-catalog.ts`, `content/engine-copy.ts` (`unitInput`), les
  fichiers que `tsc` signale et ceux que §22.2.5 marque « MKT-1 », leurs tests
  (dont `trap-definition.test.ts`).
- **Étapes** :
  1. `MKT_METRIC_SHAPES` dans l'ordre et avec les champs de §22.4.1 ;
     `MKT_DERIVED_SHAPES` (§22.4.2) ; les listes et les règles partagées
     (§22.2.3, §22.4.3).
  2. `shapesOf(setup)`, `derivedShapesOf(setup)`, `motionOfMetric`,
     `metricsOfStageIn` (§22.2.3) ; ce que `tsc` signale (§22.2.5).
  3. `shared-counts.ts` (§22.2.4).
  4. La prose des 19 et des 6 (§22.4.4), en fin de record, sous le marqueur.
  5. `unitInput` (§22.4.3) ; `MKT_ENGINE_BRIDGES`.
  6. Ce que la page passe à l'îlot (§22.4.3) : le filtre `scope === "mkt"`
     des props du SaaS, `typeCatalogs.marketplace`, `metricsFor` et
     `derivedFor` ; `TRAPS_ASKING_DEFINITION` et `trap-definition.test.ts`.
  7. Tests : §22.11.1, lignes MKT-1.
- **Acceptation** : commune ; le poids de `/fr/aarrr-funnel-template` mesuré
  avant et après (taille brute et gzip), écrit au journal.
- **Arrêt** : une chaîne de §22.4.4 qui dépasse une limite de longueur
  d'`engine-catalog.test.ts` ; un nom d'écran d'outil qui n'existe plus ;
  +60 ko gzip.
- **Relecteurs** : copie.
- **Pause** : rien de visible.

#### MKT-2 — Les grandeurs, les funnels, l'économie de chaque côté

- **But** : chaque grandeur de base de la place de marché se lit d'un état ;
  les deux funnels et l'économie de chaque côté sont calculés.
- **Prérequis** : MKT-1.
- **À lire** : §22.1 (D3, D7, D8), §22.5.1 à §22.5.3, §22.10 ; le code :
  `mkt-model.ts` (à importer), `money.ts`, `unit-economics.ts` (`missingOf`),
  `peloton.ts` (`chainOf`, l'arrondi), `knownIn`.
- **Fichiers** : `src/lib/engine/mkt-economics.ts`, `mkt-funnel.ts`
  (nouveaux), `peloton.ts` (exporter `chainOf` s'il ne l'est pas),
  `unit-economics.ts` (exporter `missingOf` et `confidenceOfInputs`, sans les
  changer), `example.ts` (`exampleMarketplaceMetrics()`,
  `EXAMPLE_MKT_TARGETS`, `EXAMPLE_MKT_WHATIF`, sans écran), `fixtures.ts`
  (`marketplaceState`, `marketplaceNoSubscriptionsState`), leurs tests.
- **Étapes** : §22.5.1 ; §22.5.2 ; §22.5.3 ; le jeu de §22.10.1 ; les tests
  `mkt-economics.test.ts` et `mkt-funnel.test.ts` (§22.11.1).
- **Acceptation** : commune ; dans §22.10.2, chaque ligne des funnels, de
  « a », du revenu net et du MRR des abonnements du mois (et annualisés), du
  GMV, de N et NS, et, pour « Un acheteur » et « Un vendeur abonné », la
  marge, la durée de vie, la LTV, le payback, le LTV:CAC et le coût d'un
  vendeur abonné, retrouvées. (La perte, les mois après le remboursement,
  l'alerte et la trésorerie sont à MKT-3.)
- **Arrêt** : un nombre de §22.10.2 qui ne sort pas ; `mkt-model.ts` qui
  semble devoir changer.
- **Relecteurs** : aucun.
- **Pause** : rien de visible.

#### MKT-3 — Les deux scénarios et le total

- **But** : l'« Et si » de chaque côté et le total se calculent.
- **Prérequis** : MKT-2.
- **À lire** : §22.1 (D5, D6), §22.5.4, §22.8.5 d, §22.10.2 ; le code :
  `scenario.ts` (`leverViews`, `correlatedRatio`, `MONEY_LEVERS`,
  `LOWER_IS_BETTER`, `LeverView`), `scenario-of.ts` (la couture d'A22),
  `slg-scenario.ts` (le modèle d'un scénario à part), `total.ts`.
- **Fichiers** : `src/lib/engine/mkt-scenario.ts` (nouveau), `types.ts` (le
  bloc MKT-3 de §22.2.1), `catalog-shape.ts` (`MKT_DEMAND_LEVER_IDS`,
  `MKT_SUPPLY_LEVER_IDS`, `ALL_LEVER_IDS`), `scenario.ts` (`MONEY_LEVERS`,
  `LOWER_IS_BETTER`, `stepOf`, `LeverView.unit`), `content/engine-copy.ts`
  (`mkt.assumption`, §22.8.5 d : MKT-3 crée la clé `mkt` avec ce seul
  sous-arbre ; `leverSubject`, §22.8.5 i, que `satisfies Record<LeverId, …>`
  exige), les fichiers que `tsc` signale (`deck.ts:1160`, `:1182`, `:1216`
  indexent `leverSubject` : rien à y changer une fois les entrées écrites),
  leurs tests. **Pas** `scenario-of.ts` (§22.5.4, les coutures d'A22).
- **Étapes** : les ids et les listes de leviers, leurs domaines ;
  `leverSubject` ; `buildMktScenario` (la demande, puis l'offre, puis l'offre
  sans abonnements) ; `mktLeverAlone` ; `mktTotalPaths` ; les hypothèses ;
  `mkt-scenario.test.ts`.
- **Acceptation** : commune ; chaque ligne « Et si », « levier seul »,
  « courbe », « Trésorerie » et « Total » de §22.10.2 retrouvée, et, pour un
  acheteur et un vendeur abonné, la perte (`none`), les mois après le
  remboursement et l'alerte (aucune).
- **Arrêt** : un nombre de §22.10.2 qui ne sort pas.
- **Relecteurs** : copie (les six hypothèses).
- **Pause** : rien de visible.

#### MKT-4 — Les fuites, les diagnostics, la dérivation

- **But** : `derive(state)` d'une place de marché rend sa motion `"mkt"` avec
  ses deux côtés et son total ; constats, contrôles et série la suivent.
- **Prérequis** : MKT-3.
- **À lire** : §22.1 (D2, D4, D14), §22.2.5 (les deux tables : `retentionOf`,
  `notEnoughBelowValues`, `series.ts`, les lecteurs de `.diagnosis`),
  §22.5.5 à §22.5.9, §22.8.5 f et j ; le code : `impact.ts`
  (`rankingImpact`, `whatIf`, `twelveMonthFactor`), `diagnose.ts`,
  `phrases.ts` (`isCandidate`, `retentionOf`, `AnyDiagnosis`,
  `notEnoughBelowValues`), `sentences.ts` (`chain-break`, `SANITY_KEY`),
  `sanity.ts`, `findings.ts` (`lossFinding`, `namedFindings`), `series.ts`,
  `derive.ts`, `total.ts`, `coverage.ts`, `content/engine-copy.ts`
  (`subject`, `sanity`, `findings`).
- **Fichiers** : `src/lib/engine/mkt-impact.ts` (nouveau), `mkt-scenario.ts`
  (`mktTotal`), `types.ts` (le bloc MKT-4 de §22.2.1, `MotionSeries.sides`),
  `catalog-shape.ts` (`directionOf` lit `LOWER_IS_BETTER_CANDIDATES`, les
  listes de candidats), `impact.ts` (exporter `twelveMonthFactor`),
  `diagnose.ts`, `phrases.ts` (`isCandidate` gagne les candidats `mkt.*` ;
  `retentionOf` par côté ; `AnyDiagnosis` gagne `Diagnosis<MktCandidateId>` ;
  `notEnoughBelowValues` ; `diagnosesOf`), `sentences.ts`, `sanity.ts`,
  `findings.ts`, `series.ts`, `derive.ts`, les lecteurs de `.diagnosis` de
  §22.2.5 (`deck/ask-defaults.ts`, `deck.ts`, `BoardNumbers.tsx`,
  `MetricSheet.tsx`, l'appel de `golden-v2.test.ts`),
  `content/engine-copy.ts` (`subject`, `sanity.mktRepeatGtFirst`,
  `sanity.mktTakeHigh`, `findings.verbMkt` : §22.8.5 f et j), les autres
  fichiers que `tsc` signale (§22.2.5), leurs tests.
- **Étapes** : `mktRankingImpact` et `mktWhatIf` ; `mktCandidates`,
  `mktRules`, `diagnoseSide` ; le groupe de `phrases.ts` ; `marketplaceChecks`
  et `SANITY_KEY` ; `marketplaceFindings` et `lossFinding` ; `series.ts` ;
  `mktTotal` ; la branche de `derive.ts` et les lecteurs de `.diagnosis` ; les
  tests. Dans `sentences-guard.test.ts`, MKT-4 ajoute `marketplaceState()` et
  `marketplaceNoSubscriptionsState()` **pour les constats et les contrôles
  seulement** (le deck d'une place de marché n'existe qu'en MKT-8) : « every
  finding kind and every sanity check » gagne `mkt-repeat-gt-first` et
  `mkt-take-high` (déclenchés par deux états modifiés de l'exemple : une
  deuxième commande à 30 %, une commission à 60 %).
- **Acceptation** : commune ; les lignes « Diagnostic », « Chaîne de la
  fuite », « Constats », « Contrôles », « Couverture » et le total de
  §22.10.2 retrouvés dans `derive(marketplaceState())`.
- **Arrêt** : un nombre de §22.10.2 qui ne sort pas ; une fonction qui
  semblerait devoir recevoir les deux côtés.
- **Relecteurs** : copie.
- **Pause** : **le modèle est complet** ; rien d'affiché (la barrière de §22.3
  est fermée).

#### MKT-5 — Les mots « produits » : `mkt.*` et les calques des deux côtés

- **But** : les feuilles `mkt.*` existent ; les calques `demand` et `supply`
  réécrivent toute feuille générique qui dit « client » ou « MRR », et passent
  leur test ; `marketplaceStrings` et la fusion dans l'îlot sont en place. Les
  mots « services » sont l'unité suivante (MKT-S).
- **Prérequis** : MKT-1 (MKT-4 si les feuilles `subject` sont déjà là ;
  sinon, sans elles).
- **À lire** : §22.1 (D10, D14, D15), §22.8.1 à §22.8.3, §22.8.5 b et c ;
  §21.8.1 et §21.8.3 (le mécanisme et le test de l'app, à imiter) ; le code : `strings.ts` (`mergeStrings`),
  `lib/i18n/translatable.ts` (`DeepPartialTranslatable`, qu'APP-3 y a mis),
  `content/engine-copy-consumer.ts`, `engine-copy-consumer.test.ts`,
  `engine-copy.test.ts` (le paramétrage des contrats, §21.8.3 point 4),
  `engine-props.ts`, `EngineWorkbench.tsx` (la ligne de fusion).
- **Fichiers** : `content/engine-copy.ts` (les feuilles `mkt.*` de §22.8.5
  b), `content/engine-copy-marketplace.ts` (nouveau : §22.8.5 c mot pour mot,
  et le reste), `strings.ts` (`MarketplaceLayers`, `marketplaceStrings`),
  `engine-props.ts` (`typeStrings.marketplace`, avec `services` vide),
  `EngineWorkbench.tsx` (la fusion, sans rien afficher de neuf),
  `content/__tests__/mkt-words.ts` et
  `content/__tests__/engine-copy-marketplace.test.ts` (nouveaux),
  `engine-copy.test.ts` (deux fusions de plus dans le paramétrage), les tests
  de `strings.ts`, `src/__tests__/content-fan-in.test.ts` (une ligne de
  `BUDGETS` pour `content/engine-copy-marketplace.ts`, `max: 1` : la page du
  moteur seule).
- **Étapes** :
  1. Les feuilles `mkt.*` de §22.8.5 b.
  2. `mkt-words.ts` (les listes de §22.8.3 et §22.11.3 qui sont à MKT-5),
     puis le test de §22.8.3, points 1 à 4 et 6, qui imprime les feuilles
     désignées.
  3. Les calques `demand` et `supply` : §22.8.5 c mot pour mot, le reste par
     le lexique de §22.8.2, feuille par feuille, jusqu'à ce que le point 1
     passe ; puis le point 2.
  4. `marketplaceStrings` (l'ordre des calques de §22.8.1, et un test par
     étape de l'ordre), `typeStrings.marketplace`, la fusion dans l'îlot.
- **Acceptation** : commune ; le poids de la page mesuré (comme MKT-1) ;
  `engine-copy-marketplace.test.ts` vert sur ses points 1 à 4 et 6 ;
  `MKT_OVERLAY_SKIPPED` listée dans le compte rendu, vide ou non.
- **Arrêt** : +60 ko gzip à MKT-1 et MKT-5 ensemble ; un test de contrat
  d'`engine-copy.test.ts` qui rougit sur une feuille de §22.8.5 c (le texte
  mot pour mot ne tient pas un contrat : la session principale le reprend).
- **Relecteurs** : copie.
- **Pause** : rien de visible.

#### MKT-S — Les mots « services »

- **But** : une place de marché de services dit « clients », « prestataires »,
  « réservations » et « profils » partout : les trois calques « services » et
  le catalogue « services » existent et passent la règle 5.
- **Prérequis** : MKT-5.
- **À lire** : §22.1 (D8, D15), §22.4.4 (le tableau des noms « services »),
  §22.8.1, §22.8.3 (la règle 5 et `MKT_SERVICES_EXCLUDED`), §22.8.4 ; le code :
  ce que MKT-5 a écrit (`engine-copy-marketplace.ts`, `mkt-words.ts`,
  `engine-copy-marketplace.test.ts`, `marketplaceStrings`),
  `content/engine-catalog.ts`, `engine-catalog.test.ts`, `engine-props.ts`,
  `_engine/view.ts`.
- **Fichiers** : `content/engine-copy-mkt-services.ts`,
  `content/engine-catalog-mkt-services.ts` (nouveaux), `engine-props.ts`
  (`typeStrings.marketplace.services`, `typeCatalogs["marketplace-services"]`),
  `_engine/view.ts` (`metricsFor(p, type, offering?)`, `derivedFor`), le passage
  de `setup.offering` là où l'îlot appelle `marketplaceStrings` et
  `metricsFor`, `mkt-words.ts` (`SERVICES_BANNED`, `MKT_SERVICES_EXCLUDED`),
  `engine-copy-marketplace.test.ts` (le point 5), `engine-copy.test.ts` (les
  deux fusions « services »), `engine-catalog.test.ts` (étendu au catalogue
  « services », §22.8.4), `src/__tests__/content-fan-in.test.ts` (une ligne
  de `BUDGETS`, `max: 1`, pour `content/engine-copy-mkt-services.ts` et pour
  `content/engine-catalog-mkt-services.ts`), leurs tests.
- **Étapes** :
  1. `SERVICES_BANNED`, `MKT_SERVICES_EXCLUDED`, puis le point 5 du test, qui
     imprime ce qu'il attrape.
  2. `ENGINE_CATALOG_MKT_SERVICES` et `ENGINE_DERIVED_CATALOG_MKT_SERVICES` :
     les noms de §22.4.4, les deux formules de §22.8.4 mot pour mot, le reste
     par le lexique ; `engine-catalog.test.ts` étendu.
  3. `services.common`, `services.demand`, `services.supply`, par le lexique,
     jusqu'à ce que le point 5 passe.
  4. Les props, `metricsFor` et `derivedFor` avec `offering`, la fusion dans
     l'îlot qui passe `setup.offering`.
- **Acceptation** : commune ; `engine-copy-marketplace.test.ts` vert sur ses
  six points ; le poids de la page mesuré.
- **Arrêt** : +40 ko gzip sur la mesure de MKT-5 ; un plafond
  d'`engine-catalog.test.ts` qu'un nom de §22.4.4 dépasse.
- **Relecteurs** : copie.
- **Pause** : rien de visible.

#### MKT-G — Trois termes de glossaire (C72)

- **But** : « GMV », « take rate » et « liquidité » sont des termes du
  glossaire, aux deux langues ; les chiffres de la place de marché y pointent.
- **Prérequis** : MKT-1, et **le texte des trois termes**, écrit par la
  session principale dans `docs/engine/glossaire-mkt.md` (une PR de
  documentation, avant de lancer l'unité) : c'est la seule copie de ce lot qui
  n'est pas dans ce document. La session l'écrit à partir des seules
  définitions sourcées de l'annexe, sur le modèle des quatre termes d'A7.3.e,
  champ par champ, sans fourchette chiffrée qui n'y soit pas.
- **À lire** : C72 (§22.14) ; `docs/engine/glossaire-mkt.md` ; l'entrée du
  journal d'A7.3.e ; `content/glossary.ts`, `content/glossary-deep.ts`,
  `content/glossary-terms.ts`, leurs tests.
- **Fichiers** : `content/glossary-terms.ts`, `content/glossary.ts`,
  `content/glossary-deep.ts`, `catalog-shape.ts` (le champ `glossary` de
  `mkt.rev.take-rate` → `take-rate`, de `mkt.liq.fill-rate` →
  `marketplace-liquidity`), leurs tests.
- **Étapes** : recopier les trois termes (slugs `gmv`, `take-rate`,
  `marketplace-liquidity`) de `glossaire-mkt.md`, comme A7.3.e les quatre
  siens ; les liens des formes.
- **Acceptation** : commune ; `glossary.test.ts` (longueur, liens,
  `inTheTour`) ; le sitemap compte six pages de plus.
- **Arrêt** : un champ exigé par le type ou un test que `glossaire-mkt.md` ne
  donne pas.
- **Relecteurs** : copie.
- **Pause** : **visible en production** : six pages de glossaire de plus (le
  terme ne dépend pas d'`ENGINE_TYPES`). C'est voulu (C72) ; la copie passe au
  bon à tirer A23.d.

#### MKT-6 — Le départ, le réglage, les cibles, les Réglages

- **But** : on crée une place de marché depuis la carte de départ, on la règle,
  on pose ses cibles par côté ; l'analytique la compte.
- **Prérequis** : MKT-4, MKT-5.
- **À lire** : §22.6.1, §22.8.5 a, §22.9 ; §21.6.1 et §21.6.2 (ce qu'A22 a fait
  pour l'app) ; le code : `components/engine/EngineStart.tsx`,
  `_engine/start.ts`, `_engine/Setup.tsx`, `_engine/TargetsStart.tsx`, les
  Réglages (`_engine/Settings*.tsx`, `settings-numbers.ts`),
  `lib/analytics/goatcounter.ts`, `engine-boundary.test.ts`.
- **Fichiers** : ceux-là, `content/engine-copy.ts` (§22.8.5 a), leurs tests.
- **Étapes** : §22.6.1 dans l'ordre (la carte, `start.ts`, `Setup`,
  `TargetsStart` — un groupe par côté, ses candidats par
  `mktCandidates(side, setup)` —, les Réglages, la barre) ; les endroits de
  §22.2.5 marqués « MKT-6 » ; §22.9.
- **Acceptation** : commune ; captures de la carte de départ, de la carte de
  réglage et de l'écran des cibles d'une place de marché, en « produits » et en
  « services », FR 1 280 et EN 390, regardées, sur un build
  `ENGINE_TYPES=consumer-app,marketplace` (§23.8) **avec
  `MARKETPLACE_SCREENS_READY` passée à `true` en local seulement** (§22.3),
  remise à `false` avant le commit.
- **Arrêt** : un e2e existant qui rougit (le type fermé en CI ne doit rien
  changer).
- **Relecteurs** : copie, sécurité (l'analytique).
- **Pause** : on crée une place de marché derrière le drapeau ; le tableau
  montre encore ce qu'il montre à un moteur vide. **Point d'arrêt** jusqu'au
  retour du brief 10.

#### MKT-7 — Le tableau (à compléter au retour du brief 10)

- **But** : le tableau d'une place de marché : le total, le sélecteur de côté,
  et pour chaque côté son diagnostic, son argent, son « Et si » et son funnel ;
  la liste des chiffres avec son étiquette de côté ; l'écran d'un chiffre.
- **Prérequis** : MKT-6, MKT-S, et **la PR de documentation qui porte le
  retour du brief 10 dans cette fiche**.
- **Contrat** : §22.6.2 et les mots de §22.8.5 b et c. La forme (composants,
  disposition, états) est celle du retour ; les rubriques « À lire »,
  « Fichiers », « Étapes » et « Acceptation » s'écrivent alors, au format de
  §23.4, par la session principale. **Ce qui est déjà fixé**, quel que soit le
  retour :
  - MKT-7 passe `MARKETPLACE_SCREENS_READY` à `true` (§22.3) et met à jour ses
    tests (`business-type.test.ts`, `access.test.ts` pour `openTypesWith`,
    `io.test.ts` pour `sellsSomehow`) ;
  - les endroits de §22.2.5 marqués « MKT-7 » : `Diagnosis.tsx`,
    `ImportPanel.tsx:209`, `BoardNumbers.tsx` et `MetricSheet.tsx` (la
    lecture par côté) ;
  - les jeux de mots de chaque écran (§22.8.3, « Les jeux de mots que lit
    chaque écran ») ;
  - `data-testid="mkt-side"` et `data-testid="mkt-total"` (§22.11.3).
  - tout composant neuf exporté de `src/components/` s'épingle dans
    `componentSrcMap` de `.design-sync/config.json` (sinon la prochaine
    synchro casse, `.design-sync/NOTES.md`), avec son commentaire de doc
    juste au-dessus de son `export` (`src/__tests__/component-docs.test.ts`) ;
    de même en MKT-8.
- **Arrêt** : tant que cette fiche n'a pas ses rubriques, l'unité ne part pas.

#### MKT-8 — Les slides (à compléter au retour du brief 10)

- **But** : le deck d'une place de marché : par côté, le funnel, la fuite,
  les « Et si », l'économie unitaire ; la slide du total quand les vendeurs
  paient ; jamais une slide qui met les deux côtés face à face.
- **Prérequis** : MKT-7.
- **Contrat** : §22.6.2 ; les titres de §22.8.5 e ; `buildMarketplaceDeck`
  dans `src/lib/engine/deck-mkt.ts`, appelé en tête de `deck.ts#buildDeck`
  (`if (activeMotions(state.setup)[0] === "mkt") return
  buildMarketplaceDeck(…)`), qui construit chaque slide d'un côté avec les
  mots de ce côté (§22.8.1) ; chaque slide porte `motion: "mkt"` et son côté ;
  le balayage de `sentences-guard.test.ts` étendu (§22.11.1). Le reste vient
  du retour, comme pour MKT-7. **Ce qui est déjà fixé**, quel que soit le
  retour :
  - `DeckSlide` (`types.ts`) : `motion?: EngineMotion` (au lieu de `Motion`)
    et un champ neuf `side?: MktSide` ; une slide d'un côté porte `motion:
    "mkt"` et son `side`, une slide commune (le titre, le total, l'annexe)
    aucun des deux ; la garde de §22.11.3 lit `side` ;
  - les endroits de §22.2.5 marqués « MKT-8 » : `deck.ts:377` (`buildLeak`,
    où aucune place de marché ne passe), les boucles de `deck-motions.ts`,
    `deck.ts`, `deck-slg.ts`, `deck/SlideMirror.tsx`,
    `deck/SlideVisibility.tsx`, `deck/ask-defaults.ts`, et
    `deck/SlideWhatIf.tsx`.

#### MKT-9 — L'exemple et le golden

- **But** : « Voir un exemple rempli » montre la place de marché de §22.10 ; le
  golden la fige.
- **Prérequis** : MKT-8.
- **À lire** : §22.10, §22.11.2 ; §21.9 et §21.10.2 (ce qu'A22 a fait) ; le
  code : `example.ts`, `_engine/ExampleView.tsx`, `golden-consumer.test.ts`.
- **Fichiers** : `example.ts`, `ExampleView.tsx`, `content/engine-copy.ts`
  (`example.bannerTitleMkt` « Exemple : une place de marché fictive » /
  "Example: a fictional marketplace", `example.companyMkt` « Exemple de place
  de marché » / "Example marketplace", `example.bannerBodyMkt` : la phrase de
  `example.bannerBody` réécrite par le lexique de la demande, et ses cibles
  nommées par le même gabarit), `golden-mkt.test.ts`,
  `golden-mkt-inputs.json`, `golden-mkt.json` (nouveaux).
- **Étapes** : `exampleEngine(…, "marketplace")` ; l'exemple dans
  `ExampleView` (le rendu du tableau de MKT-7) ; vérifier §22.10.2 dans les
  sorties ; **puis seulement** écrire le golden.
- **Acceptation** : commune ; le golden écrit une fois.
- **Arrêt** : un nombre de §22.10.2 absent des sorties.
- **Relecteurs** : copie.
- **Pause** : l'exemple de la place de marché est visible derrière le drapeau.

#### MKT-10 — La garde à l'écran, les e2e, la documentation

- **But** : le parcours complet tenu par Playwright ; la CI ouvre la place de
  marché ; la documentation à jour.
- **Prérequis** : MKT-9.
- **À lire** : §22.11.3 à §22.11.5 ; le code : `e2e/engine-consumer.spec.ts`
  (le modèle), `e2e/engine-screens.spec.ts`, `e2e/engine-canary.spec.ts`,
  `e2e/engine-deck.spec.ts`, la spec « type fermé » d'A22,
  `.github/workflows/ci.yml`, `GITHUB.md` (avant le workflow), `TESTING.md` §5.
- **Fichiers** : `e2e/engine-marketplace.spec.ts` (nouveau), les specs
  étendues, `.github/workflows/ci.yml` (`ENGINE_TYPES:
  "consumer-app,marketplace"`), le test unitaire de la garde, le calque si la
  garde y trouve une feuille (§22.11.3), `page.tsx` et
  `content/engine-copy.ts` (la phrase de la FAQ, §22.8.5 h),
  `ENGINE.md` (la ligne §22 de la table, l'état), `CLAUDE.md` (l'état du
  moteur, les chiffres de référence), `CHANTIERS.md` (A23 : toutes les cases,
  A23.d le bon à tirer).
- **Étapes** : `ci.yml` ; la phrase de la FAQ (§22.8.5 h) ; la garde ; les
  e2e (dont : la FAQ sans JavaScript contient `faqTypeNote.both` quand les
  deux types sont ouverts, et la spec « type fermé ») ; la non-vacuité de
  §22.11.5 mesurée et écrite au journal ; la documentation.
- **Acceptation** : commune ; la suite Playwright verte en CI.
- **Arrêt** : un e2e existant qui rougit sur le SaaS ou l'app ; `ci.yml` qui
  demande plus qu'une valeur changée.
- **Relecteurs** : copie, sécurité.
- **Pause** : **A23 est fini** ; reste le bon à tirer d'Antoine (A23.d) et
  l'ouverture (A23.e).

---

### 22.13 Ce que l'exécutant ne tranche jamais, et quand il s'arrête

En plus des conditions de chaque fiche et de §23.0, le sous-agent **s'arrête et
rend compte**, sans contourner, quand :
- un nombre de §22.10.2 ne sort pas de son code (après avoir vérifié les
  entrées) : il ne corrige ni le test ni ce document pour le faire tomber
  juste ;
- un golden v1, v2 ou de l'app rougit, quelle que soit la raison ;
- un test existant rougit hors de la liste de §22.11.1 ;
- `mkt-model.ts` ou `stream.ts` semble devoir changer ;
- `tsc` signale un endroit où aucune des trois réponses de §22.2.5 ne
  s'applique, ou où la réponse 2 n'a pas de valeur dans ce document ;
- une phrase ne passe pas un test de copie (longueur, glyphe, gabarit) sans
  changer de sens, ou une feuille ne se réécrit pas par un lexique sans
  changer de sens ;
- une fonction semblerait devoir voir les candidats des deux côtés, ou un
  texte comparer les deux côtés (D2, D14) ;
- le poids de la page dépasse +60 ko gzip à MKT-1 et MKT-5 ensemble.

Il ne change jamais : une formule de §22.5, une décision de §22.1, un id de
§22.2, le SaaS ou l'app, la règle « seule une cible nomme une étape », le
rouge réservé à la fuite, la copie validée du SaaS.

---

### 22.14 Les décisions d'Antoine (C64 à C74, C93, C94 à C103)

*Posées et tranchées le 2026-10-04, une par une, puis C93 en suivi de C64.
**C94 à C103**, nées du retour du brief 10 (`design/ds-extension-10-return/`),
sont posées et tranchées le 2026-10-05, toutes sur la reco ; le texte de §22
les applique avec les fiches de MKT-7 et MKT-8. Ce
document applique la colonne de droite ; les deux premières colonnes gardent la
question telle qu'elle a été posée, sur le premier jet (ses renvois D1 à D10
sont ceux du premier jet).*

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
| C94 | **Le prochain pas** d'une place de marché : partagé, au-dessus du sélecteur, ou celui du côté affiché (le brief 10) ? | **Partagé** (le retour) : l'action est celle du moteur (un deck, un fichier, une liste) ; s'il suivait le sélecteur, qui part sur la demande, l'action de la demande serait celle de tout le monde (C70). Il nomme le côté quand l'action porte sur un chiffre d'un côté | `NextStep` sous `SideShown`, `nextStepFor` avec un `side` ; le sélecteur sur le premier écran | **2026-10-05 : oui, la reco.** Partagé, au-dessus du sélecteur |
| C95 | **Les ★ de l'offre** (§22.4.1 les laissait au retour) : première vente, churn des vendeurs, conversion en abonné ? | **Oui, les trois** : ce que dessine le funnel de l'offre (deux colonnes, la ligne des taux). Les efforts et la phrase de la carte de départ ne changent pas | Un ★ de plus ou de moins : une ligne de `MKT_METRIC_SHAPES` et de son test | **2026-10-05 : oui, la reco.** `mkt.sell.first-sale`, `mkt.sell.churn`, et avec les abonnements `mkt.sell.paid-conversion` |
| C96 | **La trésorerie immobilisée** hors de la bande du total, que l'hybride additionne ? | **Oui** : la bande additionne les flux de revenu (§22.6.2) ; additionnée, la trésorerie serait dominée par un côté et se lirait en parts | Une entrée de `totals` de plus | **2026-10-05 : oui, la reco.** Chaque côté garde la sienne dans son argent |
| C97 | **Le montant d'une fuite** : « ~470 € » (la règle du moteur) ou « 468 € » (la valeur écrite au §22.8.5) ? | **« ~470 € »** : deux chiffres significatifs et « ~ », comme toute projection du moteur (« ~600 € » dans le libre-service) ; le golden garde les valeurs exactes | Un chiffre à l'euro près, qui se lit plus précis qu'il n'est | **2026-10-05 : oui, la reco.** Les quatre fuites s'impriment ~470, ~350, ~580 et ~130 € |
| C98 | **Les mots** : où le retour et §22 nomment la même chose autrement (« vendeur payant », « MRR d'abonnement », ses noms de chiffres, "Gross booking value (GMV)"), §22 l'emporte ? | **Oui** : sur une place de marché, tout vendeur paie déjà la commission, et « abonné » dit pour quoi il paie ; les noms de §22.4.4 tiennent les plafonds du catalogue et le lexique testé ; GBV n'est pas GMV. Le retour fournit les chaînes que §22 n'a pas, recopiées avec les mots de §22 | §22.4.4, §22.8.2 et le lexique réécrits sur les mots du retour | **2026-10-05 : oui, la reco.** §22 l'emporte partout où il a déjà ses mots |
| C99 | **Le taux de service sur des demandes** : « demandes envoyées » (le retour), contre la collision avec « Demande », le nom du côté ? | **Oui, dans les deux vocabulaires**, chaque fois que la variante est `requests`. Seule exception à C98 | Un mot de plus dans quatre chaînes | **2026-10-05 : oui, la reco.** « Demandes envoyées » / "requests sent" |
| C100 | **Le premier jalon d'un prestataire** : « première réservation reçue » (§22.8.4) ou « première prestation » (le retour) ? | **§22.8.4** : le chiffre compte la première commande reçue, pas le travail fait ; « reçue » et l'étiquette du côté lèvent l'ambiguïté | Une phrase plus courte, qui mesure autre chose | **2026-10-05 : oui, la reco.** « Première réservation reçue » |
| C101 | **Un « ? » pour le revenu net**, en plus des trois termes de C72 ? | **Oui, un « ? » du moteur seul, sans page de glossaire** : c'est le premier chiffre de la place de marché et un mot que le moteur n'employait pas | Le mot se lit sans aide, comme MRR dans le libre-service | **2026-10-05 : oui, la reco.** Sur « Revenu net annualisé », dans l'argent de la demande |
| C102 | **La slide de la fuite** : les autres étapes sous leur cible, à l'encre (le retour) ? Le libre-service et l'assisté les mettent en rouge (`deck.ts`, `tone: "below"`) | **À l'encre pour la place de marché seule** : avec deux côtés, chaque rouge de plus ferait lire une fuite de plus (C70) ; le libre-service et l'assisté ne changent pas | Les deux decks diraient le rouge pareil : à l'encre partout (un item hors A23), ou en rouge partout | **2026-10-05 : oui, la reco.** À l'encre, la place de marché seule |
| C103 | **Trois choix de forme** qui découlent de C70 : une étape signalée dans « Tes chiffres », celle du côté affiché ; aucune courbe du total ; le deck en total, puis les quatre slides des acheteurs, puis celles des vendeurs ? | **Oui aux trois** : jamais face à face, un rouge par côté ; rien dans §22 ne les contredit | Chacun se reprend dans la fiche de MKT-7 ou de MKT-8, sans toucher au modèle | **2026-10-05 : oui, la reco.** Les trois |

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
