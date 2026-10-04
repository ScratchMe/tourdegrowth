# GAME-BRIEF.md, §21 — Construire un niveau depuis sa spécification

*Écrit le 2026-10-04 (`CHANTIERS.md` A24), en même temps que les spécifications
des trois derniers niveaux : [`activation.md`](activation.md) (§18),
[`referral.md`](referral.md) (§19) et [`revenue.md`](revenue.md) (§20). Ce guide
vaut pour les trois : la spécification d'un niveau dit **quoi**, ce guide dit
**comment**, dans quel ordre, et comment savoir que c'est fini. Un renvoi « §n »
sans nom de fichier désigne `GAME-BRIEF.md`.*

---

## 21.0 Pour qui, et la règle

Pour l'agent qui construit un niveau, une session à la fois, un niveau à la fois.
**Il exécute, il ne décide pas.** Tout ce qui demande un jugement de produit, de
droit ou de copie est déjà tranché dans la spécification du niveau, ou listé
dans sa section « Questions pour Antoine ». Trois règles en découlent :

1. **Aucune copie inventée.** Chaque chaîne que voit un joueur est écrite, en
   français et en anglais, dans la spécification du niveau. L'agent la recopie
   telle quelle, typographie comprise (§21.5). S'il manque une chaîne que le
   contrat de copie exige, il s'arrête et la demande : il ne l'écrit pas.
2. **Aucun chiffre recalculé à la main.** Les chiffres d'une spécification sont
   ceux que produit le modèle déjà codé (`src/lib/game/levels/<niveau>.ts`) et
   que ses tests épinglent (`src/lib/game/__tests__/<niveau>.test.ts`). Si un
   test du modèle rougit, c'est le code qui a dérivé, pas la table.
3. **Une contradiction arrête le travail.** Si la spécification contredit le
   code de `main`, un test, `CLAUDE.md` ou une autre spécification, l'agent ne
   choisit pas : il écrit la contradiction en une question au format de
   `CHANTIERS.md` C (aujourd'hui, la reco, ce qui casse si on se trompe) et la
   pose à Antoine.

## 21.1 Avant de commencer

- **Les questions du niveau sont tranchées.** La section « Questions pour
  Antoine » de la spécification porte une colonne « Réponse ». Si une case est
  vide, le niveau ne se construit pas : demander à Antoine. Une réponse qui
  n'est pas la reco change la spécification **avant** le code (une PR de
  documentation, puis le code).
- **Lire, dans cet ordre** : `CLAUDE.md` (et sa table de déclencheurs : avant
  d'annoncer quoi que ce soit de vérifié, `TESTING.md` ; avant de merger,
  `GITHUB.md` et `/livrer`), la section 4 de `GAME-BRIEF.md` (les décisions à
  ne pas rouvrir), la spécification du niveau en entier, puis ce guide.
- **Lire le niveau 2 comme modèle**, parce que chaque étape ci-dessous a déjà
  été faite une fois pour lui, et que son code est la référence de style :
  `docs/game/niveau-2.md`, `src/lib/game/levels/acquisition.ts`,
  `src/content/game/acquisition.ts`, `src/lib/game/shop-phone.ts`,
  `src/components/game/ShopPhone.tsx`, `src/app/[locale]/game/acquisition/`,
  `e2e/game-level2.spec.ts`, et les entrées du journal « A12.c » à « A12.g »
  (`docs/journal/10-niveau-2-assiste-moteur-complet.md`).
- **Une branche par PR**, créée avant la première écriture
  (`git checkout -B <branche>`, convention 2 ; un hook refuse d'écrire sur
  `main`). `npm ci` si `node_modules` manque.

## 21.2 Ce qui est déjà fait

Le 2026-10-04, pour les trois niveaux à la fois (journal, « A24 ») :

- **Le moteur sait faire tourner les trois.** Trois économies nouvelles
  (`Economy` dans `src/lib/game/types.ts` : `activation`, `viral`, `arpu`), la
  bonne presse qui agit sur le chiffre du niveau dès qu'il n'est pas un
  abonnement, deux formats de chiffre (`MetricDisplay.kind` : `ratio`, le
  coefficient au centième, et `money`, les euros au centime ; `formatRatio`,
  `formatEuros`, `DeltaKind` `hundredths` et `cents` dans
  `src/lib/game/format.ts`). Les niveaux 1 et 2 en sortent identiques au bit
  près (vérifié sur 6 000 années jouées au hasard, avant et après).
- **Chaque niveau a son modèle, en brouillon** : `src/lib/game/levels/<niveau>.ts`
  (les identifiants des cartes, les chiffres, les ordres du DG), son slug dans
  `DraftLevelSlug` (`src/lib/game/types.ts`), ses années de référence
  (`src/lib/game/__tests__/paths-<niveau>.ts`) et ses tests
  (`src/lib/game/__tests__/<niveau>.test.ts`, série F18, F19 ou F20).
- **Rien d'autre** : ni copie, ni téléphone, ni page, ni entrée depuis le Tour.

**Ne pas modifier le modèle** (`levels/<niveau>.ts`) en construisant le niveau,
sauf le montant de la sanction (`control.fine`) si la réponse d'Antoine le
change, et le commentaire d'en-tête qui dit « DRAFT » (§21.3, T3).

## 21.3 Les PR, dans l'ordre

Un niveau se construit en cinq PR, comme le niveau 2 (A12.c à A12.g). La
première des trois constructions ajoute devant elles une PR commune, **T0**,
que les deux suivantes n'ont pas à refaire.

Chaque PR suit la cadence de `CLAUDE.md` : relecteurs avant la PR
(`relecteur-copie` sur toute copie neuve, `relecteur-securite` dès qu'une route,
le proxy ou un payload vers le client bouge), CI verte, puis merge par la
session selon `/livrer` (lu, pas appelé). Chaque PR ajoute son entrée à la fin
de `JOURNAL.md` et met à jour `CHANTIERS.md` A24.

### T0 — Ce qui change quand le jeu passe de deux à trois niveaux (une seule fois)

À faire dans la première construction, avant sa PR T3. Les décisions qu'elle
applique sont les questions communes QC1 et QC2 (§21.8), tranchées une fois
pour les trois niveaux.

1. **Le bloc qui clôt décembre** (`nextLevel`, C31). À deux niveaux, chacun
   renvoie à l'autre ; à trois et plus, la règle devient : **le niveau suivant
   dans l'ordre du Tour (acquisition, activation, rétention, referral, revenue),
   parmi les niveaux ouverts, en bouclant** (le revenue renvoie à l'acquisition).
   - `src/lib/game/levels.ts` : ajouter `nextLevelFor(slug: LevelSlug, levels = GAME_LEVELS_BY_PILLAR): LevelSlug | null`,
     pure, qui parcourt `PILLARS` à partir du pilier suivant celui du niveau,
     en bouclant, et rend le premier niveau `enabled` qui n'est pas lui-même ;
     `null` s'il n'y en a pas. Tests dans `levels.test.ts` : à deux niveaux
     ouverts, l'acquisition rend la rétention et la rétention rend
     l'acquisition (C31 tient) ; à cinq, la boucle complète ; un niveau fermé
     est sauté ; un seul niveau ouvert rend `null`.
   - Le titre du bloc annonce le niveau **visé** : il vient donc du niveau
     visé, et non plus de la copie du niveau qui l'affiche.
     `LEVEL_TEASERS: Record<LevelSlug, Translatable>` dans
     `src/content/game/hub.ts`, une ligne par niveau, celle qui l'annonce
     ailleurs. Celles des niveaux 1 et 2 existent déjà : ce sont les
     `nextLevel.title` actuels d'`acquisition.ts` (qui annonce la rétention) et
     de `retention.ts` (qui annonce l'acquisition), déplacés tels quels. Chaque
     nouveau niveau ajoute la sienne à son unité X-3 (§21.9), quand son slug
     entre dans `LevelSlug` ; son texte est dans la section .11 de sa
     spécification, ligne `LEVEL_TEASERS`.
   - `nextLevel` ne garde, dans chaque copie de niveau, que `eyebrow` et
     `status`. L'`eyebrow` devient « Niveau suivant » / « Next level » pour
     tous les niveaux (celui du niveau 2 disait « L'autre niveau », vrai à deux
     niveaux seulement) ; `status` reste « jouable » / « playable ».
   - Chaque `page.tsx` calcule `const next = nextLevelFor(SLUG)` et passe
     `nextLevelHref={next ? otherLevelHref(locale, next) : undefined}` et le
     teaser de `next` à l'îlot (`GameIsland` gagne une prop `nextLevelTitle`,
     qui remplace `copy.nextLevel.title`). `NextLevel` ne change pas.
   - L'aperçu `.design-sync/previews/NextLevel.tsx` suit ; la re-synchro avec
     Claude Design est un item de la section B de `CHANTIERS.md`, pas de cette
     PR.
2. **Le budget d'URL des statistiques** (`src/lib/analytics/__tests__/goatcounter-api.test.ts`,
   `MAX_URL = 4_000`). Mesuré le 2026-10-04 : 3 600 caractères aujourd'hui, et
   chaque niveau en ajoute environ 520 (ses 14 chemins `game_*`). Le premier
   niveau branché le fait passer au-dessus de 4 000. **Passer `MAX_URL` à
   6 000** (5 160 attendus à cinq niveaux, les trois quarts des ~8 Ko où les
   proxys refusent un GET), en réécrivant le commentaire du test avec ces
   chiffres.
3. **Le nombre de niveaux ouverts écrit en toutes lettres** :
   `GAME_META.hub.shareImageAlt` (`src/content/game/meta.ts`, « dont deux sont
   ouvertes ») devient un gabarit `{open}` rempli par le nombre de niveaux
   `enabled`, écrit en lettres (« deux », « trois », « quatre », « toutes les
   cinq » / « two », « three », « four », « all five »), avec un test qui le
   lie à `GAME_LEVELS_BY_PILLAR`. Chercher toute autre mention codée en dur :
   `grep -rn "deux niveaux\|two levels\|deux sont\|two of them" src/`.
4. **Le bandeau d'un niveau** (`Le côté obscur · niveau N`, `content/game/meta.ts`) :
   N est le rang d'ouverture, pas la place dans le Tour. Le troisième niveau
   construit est le « niveau 3 », quel qu'il soit, le quatrième le « niveau
   4 », etc. La spécification écrit `niveau {N}` : l'agent y met le rang.
5. **Copie neuve « à relire »** (convention 6) : les trois `eyebrow` changés,
   le gabarit de `shareImageAlt` et ses nombres en lettres. Chaque chaîne porte
   son marqueur daté (`// TODO: à relire — <date> (A24.T0) : …`).

### T1 — La copie du niveau (modèle : A12.c, PR #242)

- **`src/lib/game/copy.ts`** : le type de copie du niveau, sur le modèle
  d'`AcquisitionCopy` : `LevelCopy<CardId, DarkId, OrderId> & { phone: …PhoneCopy; <pastille>: …PillCopy }`,
  plus `<Niveau>OrderId` (les cinq ordres de la spécification) et les deux
  interfaces du téléphone et de la pastille, **champ pour champ comme la
  spécification les liste** (« Le téléphone », tableau des chaînes), avec la
  même doc-comment d'une ligne par champ. Déclarer `<NIVEAU>_COPY_TEMPLATES`
  sur le modèle d'`ACQUISITION_COPY_TEMPLATES` : toujours
  `{ ...LEVEL_COPY_TEMPLATES, … }`, puis les gabarits de la pastille s'il y en a,
  sous la clé que la spécification donne à la pastille (sans le spread, le test
  ne vérifie plus les gabarits communs).
- **`src/content/game/<niveau>.ts`** : l'objet `<NIVEAU>_CONTENT: DeepTranslatable<<Niveau>Copy>`,
  construit comme `acquisition.ts` : ce que le niveau 1 dit de toute année est
  **repris par référence** (`L1.months`, `L1.boss.t2Hit`…), jamais recopié ;
  seules les chaînes que la spécification donne sont écrites. La liste exacte
  des clés écrites et des clés reprises est dans la spécification (« La copie,
  clé par clé »). L'en-tête du fichier reprend celui d'`acquisition.ts`
  (« What comes from level 1 », « The English », « What stays fictional »,
  « House rule for the cards », « Typography ») avec les noms du niveau, et le
  marqueur `TODO: à relire` daté.
- **`src/content/game/meta.ts`** : `GAME_META.<niveau>` (titre, description,
  fil d'Ariane, texte alternatif de l'image) et `<NIVEAU>_INTRO` (bandeau,
  titre, chapeau ; les trois étapes et le `glossaryLead` repris du niveau 1),
  depuis la spécification.
- **`src/content/__tests__/game-<niveau>.test.ts`**, sur le modèle de
  `game-acquisition.test.ts`, avec les règles communes de
  `game-copy-checks.ts` : C1 (les quatre champs du catalogue), C2 (parité),
  C3 et C9 (aucune carte ne dit son effet), C4 (les objectifs que la copie cite
  sont ceux du modèle), C5 (identifiants, ordres), C6 (marques : la liste
  blanche du niveau, dans sa spécification), C8 (gabarits), C10 (séparateurs
  décimaux), C12 (insécables des nombres), C13 (l'arithmétique du téléphone,
  dont la spécification donne les égalités à tenir), le test « repris du
  niveau 1 » et le test « nomme son entreprise, jamais Flixo ni Pédalix ».
  **Deux différences** que chaque spécification précise : la règle C1 « cite un
  article » nomme les textes admis pour ce niveau (le Code de la consommation
  n'est pas le seul), et la règle propre au contrôle (au niveau 2, C14 « jamais
  amende ») est remplacée par celle de la spécification.
- **Aucune route n'importe encore cette copie** : ni build ni Playwright
  nécessaires à cette PR (la CI construit quand même).

### T2 — Le téléphone et sa pastille (modèle : A12.e, PR #246)

- **`src/lib/game/<niveau>-phone.ts`** : pur, comme `shop-phone.ts`. Le type
  des éléments du téléphone (`<Niveau>PhoneItem`), la fonction qui les rend de
  haut en bas d'après les cartes en production et cochées, et la fonction de
  la pastille, **exactement** comme la spécification les écrit (elle donne le
  type TypeScript, l'ordre, et la table de vérité de la pastille). Tests dans
  `src/__tests__/game-<niveau>-phone.test.ts`, sur le modèle de
  `game-shop-phone.test.ts` : chaque ligne de la table de vérité de la
  spécification est un cas.
- **`src/components/game/<Nom>Phone.tsx`** et son `.module.css` : le dessin,
  dans le cadre partagé (`PhoneFrame.module.css`, l'éclair `phone-flash.ts`),
  avec la couleur de marque que la spécification donne (`--phone-brand`). Une
  figure de texte, sans faux boutons (E9) : un bouton dessiné est un `<span>`
  stylé, jamais un `<button>`.
- **`src/components/game/<Nom>Pill.tsx`** : la pastille, sur le modèle de
  `BasketPill.tsx` (mêmes styles que `ClickPill`, `announce` à `false` dans le
  bureau, corail quand la spécification le dit).
- **`src/app/[locale]/game/_island/sides.tsx`** : `<NIVEAU>_SIDE: IslandSide<…>`
  et les fonctions de phrase de la pastille, comme `ACQUISITION_SIDE`. Pas
  encore dans `ISLAND_SIDES` : c'est T3.
- **Deux aperçus** pour Claude Design (`.design-sync/previews/<Nom>Phone.tsx`,
  `<Nom>Pill.tsx`), sur le modèle de `ShopPhone.tsx` et `BasketPill.tsx` :
  vérifiés au type près contre les composants (un `tsc` sur un barrel jetable,
  comme le dit l'entrée A12.d du journal). La re-synchro est un item B.
- **Vérification visuelle** (leçon nº 1 de `CLAUDE.md`) : le téléphone rendu
  dans chacun des états de la table de vérité, à 390 px, en français et en
  anglais, dans une page de test jetable ou via les aperçus. Rien ne déborde.

### T3 — Le branchement : le niveau jouable (modèle : A12.f.1, PR #247)

**Déplacer le slug, et laisser le compilateur lister le reste** : dans
`src/lib/game/types.ts`, le slug passe de `DraftLevelSlug` à `LevelSlug`, et
l'en-tête de `levels/<niveau>.ts` perd « in DRAFT ». Puis `npx tsc --noEmit`
liste ce qu'il exige ; le niveau 2 a eu besoin de tout ce qui suit, et le
nouveau niveau aussi :

| Fichier | Ce qu'il faut ajouter |
|---|---|
| `src/lib/game/storage-keys.ts` | `GAME_SAVE_KEYS.<niveau>: "tdg.game.<niveau>.v1"` |
| `src/lib/game/levels.ts` | `<pilier>: { slug: "<niveau>", enabled: true }` dans `GAME_LEVELS_BY_PILLAR`, à sa place dans l'ordre AARRR |
| `src/lib/game/events.ts` | le slug dans `GAME_LEVEL_SLUGS` (gardé par `GameLevelsCovered`) |
| `src/content/game/entry.ts` | `GAME_ENTRY_COPY.<niveau>` : l'encart du résultat (titre, corps, bouton, bande), depuis la spécification |
| `src/content/game/hub.ts` | `zones.<pilier>.company` (le nom de l'entreprise, depuis la spécification), et dans `ENDINGS_BY_LEVEL` le libellé de la fin `fine` du niveau |
| `src/app/[locale]/game/_island/sides.tsx` | `IslandCopies.<niveau>` et `ISLAND_SIDES.<niveau>` |
| `src/app/[locale]/game/_island/GameIsland.tsx`, `useGame.ts` | ce que le compilateur demande (le modèle du niveau, sa copie) |
| `src/app/[locale]/game/<niveau>/page.tsx` | sur le modèle d'`acquisition/page.tsx` : l'intro, les deux mots du glossaire (dans la spécification), la copie, l'îlot, `nextLevelFor` (T0) |
| `src/app/[locale]/game/<niveau>/opengraph-image.tsx` | sur le modèle d'`acquisition/opengraph-image.tsx` |
| `src/lib/og/game-level-share-text.ts` | ce que le compilateur demande pour le niveau |
| `src/app/(app)/admin/stats/game.ts` | ce que le compilateur demande (les fins et les départs par niveau) |
| `src/app/(app)/r/[id]/game-entry.ts` | rien d'habitude : `gameEntriesFor` lit la table ; vérifier |
| `src/content/updated-at.ts` | la date des pages touchées, comme A12.f.1 |

Puis les tests que le niveau 2 a dû toucher, à étendre au nouveau niveau :
`src/__tests__/content-fan-in.test.ts` (un plafond par page, chacun avec sa
raison ; la page du nouveau niveau tire la copie du niveau 1 par référence),
`src/__tests__/proxy.test.ts` (boucle déjà sur les niveaux ouverts : vérifier
qu'il couvre le nouveau), `src/__tests__/game-entry-wiring.test.ts`,
`src/app/__tests__/sitemap.test.ts`, `src/app/[locale]/game/__tests__/game-metadata.test.ts`,
`src/lib/game/__tests__/{levels,events,storage,build-flag}.test.ts`,
`src/lib/analytics/__tests__/goatcounter-api.test.ts` (les chemins du niveau),
`src/lib/og/fonts.test.ts`, `src/app/(app)/admin/stats/__tests__/game.test.ts`,
`src/app/(app)/r/[id]/__tests__/game-entry.test.ts`, et un
`src/app/[locale]/game/_island/__tests__/island-view-<niveau>.test.ts` sur le
modèle d'`island-view-acquisition.test.ts` (chaque écran de chaque fin, dans
les deux langues, sans gabarit ni `undefined`, le chiffre dans son unité).

Côté e2e, les specs communes que le niveau 2 a touchées : `game-flag`,
`game-endings`, `game-share-images`, `accessibility`, `result-real` (une
fixture de résultat dont le goulot est l'étape du niveau, lue dans
l'émulateur ; voir `e2e/real-results.ts`).

### T4 — Les specs Playwright du niveau (modèle : A12.g, PR #250)

`e2e/game-<niveau>.spec.ts`, sur le modèle de `e2e/game-level2.spec.ts` : le
premier écran (P1, P2), le téléphone et la pastille qui suivent les cartes
(P5), les années A en français et C en anglais jouées à l'interface **d'après
les tables de la spécification, jamais recalculées**, l'année D renvoyée en
juin (P9), la sauvegarde sous sa propre clé, 390 px à chaque phase (P17), axe
sur décembre (P21) et l'analytique par niveau (P20).

### T5 — Ce qui n'est pas à l'agent

- **La re-synchro avec Claude Design** (les composants neufs et changés) :
  un item de la section B de `CHANTIERS.md`, à créer par la PR T3, mené dans
  une session de design sync (`.design-sync/NOTES.md`).
- **Le bon à tirer** de la copie neuve : `/bon-a-tirer`, appelé par Antoine
  seul. La PR T3 crée l'item dans `CHANTIERS.md` A24 ; la session ne construit
  pas le bon à tirer d'elle-même.
- **La relecture juridique et la recherche INPI du nom** : à Antoine (D9).
- **L'ouverture** : le niveau est jouable derrière le drapeau du jeu, comme le
  reste du jeu (C23 : le jeu attend le moteur).

## 21.4 Ce qu'une spécification de niveau contient, et où

Les trois spécifications ont la même table des matières, celle du §17 du
niveau 2, plus deux sections :

| Section | Ce que l'agent en tire |
|---|---|
| .0 En une page | rien à coder : le résumé |
| .1 Pourquoi ce niveau, ce qui change depuis l'esquisse du §11 | rien à coder |
| .2 L'univers et le chiffre du board | le nom de l'entreprise, les chiffres de l'intro |
| .3 Le modèle | déjà codé : ne rien changer (§21.2) |
| .4 Les cartes | `cards` de la copie : nom et pitch, FR et EN |
| .5 Le DG | `boss`, `orders` |
| .6 Parcours de référence | les tables des specs T4 ; déjà épinglées en unitaire |
| .7 Le téléphone | T2 : le type, l'ordre, les chaînes, la pastille et sa table de vérité |
| .8 Tableau de bord, événements, décembre | le reste de la copie, clé par clé |
| .9 Le catalogue | `patterns`, et la liste blanche des marques (C6) |
| .10 Questions pour Antoine | à trancher **avant** T1 |
| .11 La copie autour du jeu | `meta.ts`, `entry.ts`, `hub.ts`, l'annonce du niveau (T0), les mots du glossaire |
| .12 Plan d'exécution | les PR T1 à T4 du niveau, et ses tests propres |

## 21.5 Les pièges déjà rencontrés

Tous vécus sur les niveaux 1 et 2 ; chacun a coûté au moins une relecture.

- **Typographie française** : U+00A0 (jamais U+202F) avant `: ; ! ?`, `%`, `€`
  et `★`, après « et avant », et dans les groupes de chiffres (« 10 000 »).
  Les spécifications n'en ont pas : l'agent les pose en recopiant. C12 les
  vérifie pour les nombres ; la garde du dépôt, pour la ponctuation.
- **Guillemets dans les chaînes** : un remplacement scripté a un jour glissé des
  guillemets droits dans une chaîne anglaise elle-même entre guillemets droits,
  et cassé l'import du module (A12.c). En anglais, les citations utilisent des
  guillemets droits doubles dans une chaîne entre apostrophes simples, comme
  dans `acquisition.ts`.
- **Un événement ne nomme jamais une carte** : les événements (contrôle,
  signalements, fil viral, presse) se déclenchent sur des seuils de radar et
  de confiance, pas sur ce qui a été joué. Une fin non plus : l'année D, virée,
  n'a joué presque aucune carte. Deux exceptions, voulues et déjà écrites :
  `applause` nomme des astuces que l'année n'a pas jouées, et `firedClean`
  celle que le remplaçant met en production l'année suivante. Les
  spécifications respectent cette règle ; l'agent ne « précise » rien.
- **Un engagement, un accord transactionnel ou une procédure en cours n'est
  jamais une sanction**, dans la copie comme dans les tests (C6). Chaque cas du
  catalogue dit sa nature exacte ; ne pas la reformuler.
- **Le chiffre a son unité partout** : le format vient du niveau
  (`metricFormat(level.display)`) ; jamais « % » ni « pt » à côté d'un
  coefficient ou d'euros, jamais « clients » à côté d'un taux.
- **Plafonds de `content-fan-in.test.ts`** : chaque page qui tire la copie d'un
  autre niveau fait monter un plafond ; le monter avec sa raison, jamais le
  supprimer.
- **Une feuille de style reste avec sa page** (`page-styles-scope.test.ts`) :
  ne jamais importer le `.module.css` d'une autre route ; la page de niveau
  commune (`_level/LevelPage.tsx`) est faite pour ça.
- **`hidden` et `display`** (leçon nº 2) : `.classe[hidden]{display:none}`
  explicite sur tout élément qui a un `display`.
- **Le marqueur « à relire »** : `TODO: à relire`, avec une espace ordinaire
  après « TODO » (un `TODO : à relire` avec insécable échappe au grep de
  `/bon-a-tirer`).
- **Les années de référence se jouent à l'interface** dans les specs e2e, en
  cliquant ce que la table dit, carte par carte : le moteur est déjà tenu par
  les tests unitaires, les specs tiennent l'écran.

## 21.6 Vérifier avant de pousser

```sh
npx tsc --noEmit
npx eslint .
npx vitest run
# build comme la CI (ci.yml, bloc env) :
NEXT_PUBLIC_GOATCOUNTER_CODE=e2e-stub ADMIN_DASHBOARD_PASSWORD=e2e-admin GAME_ENABLED=true npm run build
# Playwright contre ce build, avec l'émulateur Firestore : recette de TESTING.md §5
CI=1 npx playwright test e2e/game-<niveau>.spec.ts
CI=1 npx playwright test   # la suite complète avant T3 et T4
```

Puis, à l'écran (leçon nº 1), sur le build : l'intro du niveau, le bureau avec
son téléphone et la pastille dans la barre d'action, une année C jusqu'à la
sanction, le bloc de décembre, le hub ; à 1 280 et 390 px, en français et en
anglais ; aucun défilement horizontal.

Avant d'écrire « vérifié » quelque part : `TESTING.md`. Avant d'annoncer un
merge livré : `git show --stat <sha>` (convention 1).

## 21.7 Définition de terminé, pour un niveau

- T1 à T4 mergées (et T0 pour le premier des trois), CI verte sur chacune.
- Les tests du modèle (`<niveau>.test.ts`) n'ont pas bougé d'un chiffre.
- Le niveau est jouable derrière le drapeau, au hub, au sitemap, depuis
  l'encart du résultat quand son étape freine, et son décembre renvoie au
  niveau suivant ouvert.
- Toute chaîne neuve porte « à relire » ; l'item du bon à tirer existe dans
  `CHANTIERS.md` A24, celui de la re-synchro dans la section B.
- L'entrée du journal de chaque PR, et `CLAUDE.md` mis à jour (l'état du jeu,
  les chiffres de référence).

## 21.8 Questions communes aux trois niveaux

Au format de `CHANTIERS.md` C. Chaque spécification est écrite selon la reco ;
une autre réponse change ce guide et les spécifications avant le code.

| # | Question | Reco | Si on se trompe | Réponse |
|---|---|---|---|---|
| QC1 | **Le bloc qui clôt décembre, à trois niveaux et plus** : vers quel niveau renvoie-t-il ? (C31 ne tranche que le cas à deux.) | **Le niveau suivant dans l'ordre du Tour, parmi les niveaux ouverts, en bouclant** (T0, point 1), sous le bandeau « Niveau suivant » pour tous. Calculé sur le serveur : la page reste prérendue. | Écarté : renvoyer vers le niveau que le joueur n'a pas encore fini, qui demande de lire la sauvegarde dans le navigateur et rend le bloc instable au rechargement. Changer de règle plus tard ne touche qu'une fonction pure. | |
| QC2 | **Le bandeau de l'intro, « Le côté obscur · niveau N »** : N au rang d'ouverture ? | **Oui** : le troisième niveau construit est le « niveau 3 », quel que soit son étape. C'est ce que disent déjà les niveaux 1 et 2. | Écarté : remplacer le numéro par l'étape (« Le côté obscur · activation ») sur les cinq niveaux ; plus juste dans l'ordre du hub, mais deux bandeaux validés changent. | |
| QC3 | **Les sanctions de la CNIL, citées sans le nom de l'entreprise** ? La CNIL anonymise ses délibérations deux ans après leur publication ; Google, Facebook, Microsoft et TikTok sont déjà « [X] » sur Légifrance pour leurs amendes sur les cookies. | **Oui** : « un moteur de recherche », « un courtier en données de neuf salariés ». Une entreprise est nommée quand un tribunal la nomme (Google, par le Conseil d'État) ou quand l'autorité n'est pas la CNIL (Twitter, par la FTC). | Écarté : nommer d'après la presse. Plus parlant, mais le jeu prolongerait une publicité que la CNIL a voulue limitée dans le temps, et chaque nom aurait une date d'expiration à surveiller. | |

## 21.9 L'orchestration : un agent Opus, des sous-agents Sonnet

Le travail se découpe en **treize unités**, chacune menée par **un sous-agent
Sonnet** et livrée en **une PR**. Entre deux unités, tout est mergé et noté :
on peut s'arrêter après n'importe laquelle et reprendre plus tard, dans une
autre session, sans rien relire d'autre que l'état d'A24.

### Les rôles

- **L'orchestrateur** (Opus, la session principale) : il lit l'état d'A24 dans
  `CHANTIERS.md`, choisit l'unité suivante, lance un sous-agent avec le prompt
  ci-dessous, lit son compte rendu, lance les relecteurs du dépôt
  (`relecteur-copie` sur toute copie neuve, `relecteur-securite` dès qu'une
  route, le proxy ou un payload bouge), ouvre la PR en brouillon, suit la CI,
  merge selon `/livrer` (lu, pas appelé), coche l'unité dans A24 avec le numéro
  de PR, et s'arrête si on le lui a demandé. Il ne code pas lui-même, sauf une
  correction d'une ligne trouvée en relisant.
- **Le sous-agent** (Sonnet, `model: "sonnet"` dans l'outil Agent) : une unité,
  une branche, des commits poussés. Il ne merge pas et n'ouvre pas de PR. Il
  s'arrête et rend compte dès qu'il bute sur une contradiction ou une chaîne
  manquante (§21.0). Si la CI rougit sur sa PR, l'orchestrateur relance un
  sous-agent avec le journal de la CI et la même branche.

### Les unités, dans l'ordre

Un niveau se construit d'un bout à l'autre avant le suivant : les unités de deux
niveaux touchent les mêmes fichiers (`copy.ts`, `sides.tsx`, `types.ts`,
`events.ts`, `entry.ts`) et se gêneraient en parallèle. L'ordre entre les
trois niveaux est libre.

| Unité | Ce qu'elle livre | Prérequis | Relecteurs | Point de pause après |
|---|---|---|---|---|
| **U0** | T0 (§21.3) : `nextLevelFor`, `LEVEL_TEASERS` avec les deux niveaux existants (typé `Record<LevelSlug, …>`, il ne peut pas encore nommer un niveau en brouillon), les bandeaux « Niveau suivant », `MAX_URL` à 6 000, le gabarit `{open}` de `shareImageAlt` | QC1 à QC3 tranchées | copie | oui |
| **X-1** | T1 : la copie du niveau, ses types, son intro et ses métadonnées, son test de contenu | questions du niveau tranchées ; U0 pour le premier niveau | copie | oui |
| **X-2** | T2 : le téléphone, sa pastille, le côté de l'îlot, les aperçus, leurs tests, les captures | X-1 | copie (les chaînes du téléphone) | oui |
| **X-3** | T3 : le slug déplacé et tout ce que le compilateur demande (dont la ligne du niveau dans `LEVEL_TEASERS`), la page, l'image, l'encart du résultat, le hub, les tests et specs communs | X-2 ; U0 | copie, sécurité | oui |
| **X-4** | T4 : `e2e/game-<niveau>.spec.ts` | X-3 | — | oui, et le niveau est fini (§21.7) |

`X` vaut `ACT` (activation, §18), `REF` (referral, §19) ou `REV` (revenue, §20) :
U0, puis ACT-1 à ACT-4, REF-1 à REF-4 et REV-1 à REV-4, soit treize unités. U0
passe une fois, avant le premier niveau construit ; chaque niveau ajoute sa
ligne dans `LEVEL_TEASERS` à son X-3, quand son slug devient un `LevelSlug`.

### Le prompt d'une unité

L'orchestrateur remplit les trois champs entre chevrons et le passe tel quel :

```text
Tu construis une unité du jeu « Le côté obscur » de Tour de Growth : <UNITÉ>
(par exemple « ACT-2, le téléphone du niveau activation »). Tu exécutes une
spécification déjà tranchée : tu ne décides rien de ce qui touche au produit,
au droit ou à la copie.

Lis d'abord, en entier : CLAUDE.md ; docs/game/construire-un-niveau.md (§21.0,
§21.1, §21.2, la section de ton unité au §21.3, §21.5, §21.6) ; puis
<SPÉCIFICATION> (docs/game/activation.md, referral.md ou revenue.md). Lis aussi
le modèle de l'étape au niveau 2 que le §21.3 cite pour ton unité.

Travaille sur la branche <BRANCHE>, créée depuis origin/main avant toute
écriture (git checkout -B <BRANCHE> origin/main). Fais exactement ce que la
section de ton unité demande, avec les chaînes et les chiffres de la
spécification, recopiés tels quels, espaces insécables posées selon le §21.5.
Ne touche pas aux fichiers d'autres unités, ni au modèle (src/lib/game/levels/).

Arrête-toi et rends compte, sans contourner, si : une chaîne exigée par le
contrat de copie manque dans la spécification ; la spécification contredit le
code ou un test ; un test du modèle (src/lib/game/__tests__/<niveau>.test.ts)
rougit ; tu as besoin d'une décision.

Avant de pousser, fais passer les vérifications du §21.6 qui concernent ton
unité, ajoute l'entrée de ton unité à la fin de JOURNAL.md (ce qui est livré,
les choix d'exécution, ce qui est vérifié, avec les chiffres réels des
commandes), puis commit et pousse ta branche. N'ouvre pas de PR et ne merge pas.

Ton compte rendu, en français : ce qui est fait, fichier par fichier ; la sortie
résumée de chaque commande (tests passés sur total) ; les captures d'écran
prises et leur chemin ; tout écart à la spécification et pourquoi ; les
questions ouvertes. N'écris « vérifié » que pour ce que tu as fait tourner.
```

### Ce que l'orchestrateur vérifie avant de merger

1. Le compte rendu cite des commandes réellement lancées, et leurs sorties
   sont vertes ; la CI de la PR est verte.
2. Les relecteurs n'ont rien de bloquant, ou leurs remarques sont corrigées par
   un sous-agent relancé sur la même branche.
3. Pour X-2 et X-3, il ouvre lui-même deux captures (390 px, une en français,
   une en anglais) : leçon nº 1 de `CLAUDE.md`.
4. `git show --stat` du squash après le merge (convention 1), puis la case de
   l'unité dans A24, avec le numéro de PR lu sur GitHub (convention 8).
