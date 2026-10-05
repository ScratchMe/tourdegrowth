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

Un niveau se construit en quatre PR (T1 à T4), comme le niveau 2 (A12.c,
A12.e, A12.f.1, A12.g). Avant le premier niveau, une PR commune, **T0**
(l'unité U0), que les deux suivants n'ont pas à refaire.

Chaque PR suit la cadence de `CLAUDE.md` : relecteurs avant la PR
(`relecteur-copie` sur toute copie neuve, `relecteur-securite` dès qu'une route,
le proxy ou un payload vers le client bouge), CI verte, puis merge par la
session selon `/livrer` (lu, pas appelé). Chaque PR ajoute son entrée à la fin
de `JOURNAL.md` ; l'orchestrateur coche l'unité dans `CHANTIERS.md` A24 sur la
branche de la PR, avant le merge (§21.9).

### T0 — Ce qui change quand le jeu passe de deux à trois niveaux (une seule fois)

**Fait le 2026-10-04** (U0, [#335](https://github.com/ScratchMe/tourdegrowth/pull/335)) : ce qui
suit décrit ce qui existe. Les choix d'exécution d'U0 dont les unités
suivantes héritent : `nextLevels` est une prop obligatoire de `GameIsland` ;
`nextLevelFor` part du haut du Tour pour un slug absent de la table ; la route
d'image du hub lève si `GAME_OPEN_COUNT_WORDS` n'a pas de mot pour le nombre de
niveaux ouverts ; `game-hub.test.ts` lit le texte rempli par
`generateImageMetadata`, la vraie route ; `LEVEL_TEASERS.acquisition` en
français est la ligne du prototype, gardée par son nom dans
`game-retention.test.ts` (C11).

À faire une seule fois, avant le premier X-1 (l'unité U0, §21.9). Les décisions qu'elle
applique sont les questions communes QC1 et QC2 (§21.8), tranchées une fois
pour les trois niveaux (C75 et C76, le 2026-10-04, ni l'une ni l'autre sur la
reco).

1. **Le bloc qui clôt décembre** (`nextLevel`, C31, puis C75). À deux niveaux,
   chacun renvoie à l'autre ; à trois et plus, la règle devient (C75) : **le
   premier niveau ouvert que le joueur n'a pas encore fini, dans l'ordre du
   Tour (acquisition, activation, rétention, referral, revenue) à partir du
   niveau suivant, en bouclant**. « Fini » veut dire qu'une fin est enregistrée
   pour ce niveau dans la collection (`loadCollection().endings[slug]`, écrite
   en décembre par `recordYearEnd`, quelle que soit la fin). Si tous les autres
   niveaux ouverts sont finis, c'est le suivant dans l'ordre du Tour ; si le
   niveau est le seul ouvert, le bloc ne s'affiche pas.
   - `src/lib/game/levels.ts` : ajouter
     `export function nextLevelFor<S extends string>(slug: S, finished: ReadonlySet<string>, levels: Partial<Record<Pillar, { slug: S; enabled: boolean }>>): S | null`,
     pure et **sans valeur par défaut** (un défaut typé `GameLevelTable` ne
     s'assigne pas au paramètre générique). Elle parcourt `PILLARS` (importé
     en relatif, `../scoring/pillars`, comme le veut l'en-tête du fichier :
     les specs Playwright importent le moteur ; `Pillar` reste un
     `import type` depuis `@/lib/scoring/pillars`) à partir du pilier qui suit
     celui du niveau (l'entrée de `levels` dont le `slug` est le sien), en
     bouclant, garde les niveaux `enabled` autres que lui-même, et rend le
     premier qui n'est pas dans `finished`, sinon le premier gardé ; `null`
     si elle n'en garde aucun. Tests dans `levels.test.ts` : à deux niveaux
     ouverts (`GAME_LEVELS_BY_PILLAR`), l'acquisition rend la rétention et la
     rétention rend l'acquisition, finies ou non (C31 tient). Les tables à
     cinq niveaux des tests se déclarent
     `Partial<Record<Pillar, { slug: ModelSlug; enabled: boolean }>>`
     (`ModelSlug` est dans `types.ts` ; `LevelSlug` n'a que deux membres
     jusqu'au premier X-3) : rien de fini, l'activation rend la rétention et
     le revenue rend l'acquisition ; la rétention finie, l'activation rend le
     referral ; tous les autres finis, le suivant dans l'ordre ; un niveau
     fermé est sauté ; un seul niveau ouvert rend `null`.
   - `src/lib/game/storage.ts` : ajouter
     `finishedLevels(collection: GameCollection): Set<LevelSlug>`, les clés
     de `collection.endings`, avec un test dans `storage.test.ts`.
   - **Le calcul se fait dans le navigateur, en décembre.** Décembre ne se rend
     jamais sur le serveur (l'îlot n'y arrive qu'après un clic, ou une reprise
     lue dans `localStorage` après le montage) : lire la collection à ce
     moment ne casse pas l'hydratation. Dans `GameIsland.tsx`, juste après
     `const december = …` :
     `const inDecember = december !== null;` puis
     `const nextSlug = useMemo(() => (inDecember ? nextLevelFor(slug, finishedLevels(loadCollection()), GAME_LEVELS_BY_PILLAR) : null), [inDecember, slug]);`
     (cet extrait passe l'ESLint du dépôt, `react-hooks` compris).
     (`recordYearEnd` a déjà écrit la fin de l'année en cours ; le niveau
     lui-même est de toute façon exclu).
   - Le titre du bloc annonce le niveau **visé** : il vient donc du niveau
     visé, et non plus de la copie du niveau qui l'affiche.
     `LEVEL_TEASERS: Record<LevelSlug, Translatable>` dans
     `src/content/game/hub.ts`, une ligne par niveau, celle qui l'annonce
     ailleurs. Celles des niveaux 1 et 2 existent déjà, déplacées telles
     quelles : `LEVEL_TEASERS.retention` ← `ACQUISITION_CONTENT.nextLevel.title`
     (le décembre de l'acquisition annonçait la rétention), et
     `LEVEL_TEASERS.acquisition` ← `RETENTION_CONTENT.nextLevel.title`. Chaque
     nouveau niveau ajoute la sienne à son unité X-3 (§21.9), quand son slug
     entre dans `LevelSlug` ; son texte est dans la section .11 de sa
     spécification, ligne `LEVEL_TEASERS`.
   - `nextLevel` ne garde, dans chaque copie de niveau, que `eyebrow` et
     `status` (le type `LevelCopy` perd `title`). Celui du niveau 1
     (`retention.ts`) dit déjà « Niveau suivant » / « jouable » ; celui du
     niveau 2 disait « L'autre niveau », vrai à deux niveaux seulement : il
     devient `nextLevel: L1.nextLevel`, repris par référence, comme le seront
     ceux des trois nouveaux niveaux. Aucune chaîne neuve.
   - **Ce que la page passe à l'îlot** : tous les niveaux que le bloc peut
     viser, puisque le choix se fait dans le navigateur. Dans
     `src/app/[locale]/game/_level/LevelPage.tsx`, à côté d'`otherLevelHref` :
     `export interface NextLevelLink { href: string; title: string }` et
     `export function nextLevelLinks(locale: Locale, slug: LevelSlug): Partial<Record<LevelSlug, NextLevelLink>>`,
     une entrée par niveau `enabled` autre que `slug` :
     `const href = otherLevelHref(locale, s); if (href) links[s] = { href, title: tc(LEVEL_TEASERS[s], locale) };`
     (`otherLevelHref` rend `string | undefined`).
     Chaque `page.tsx` passe `nextLevels={nextLevelLinks(locale, SLUG)}` ;
     `GameIsland` perd `nextLevelHref` et gagne `nextLevels`, et rend
     `const next = nextSlug ? nextLevels[nextSlug] : undefined;` puis, si
     `next` existe seulement,
     `<NextLevel eyebrow={copy.nextLevel.eyebrow} title={next.title} status={copy.nextLevel.status} href={next.href} />`.
     `NextLevel` ne change pas ; le `?from=other_level` d'`otherLevelHref`
     non plus. Dans `GameIsland.tsx`, le type s'importe
     `import type { NextLevelLink } from "../_level/LevelPage"`, jamais
     `import { type NextLevelLink }` : le second compte comme un import de
     valeur pour `game-bundles.test.ts` (règle 4), et rougit.
   - `e2e/game-level2.spec.ts` (le décembre de l'année A, l.160-164) : « Niveau
     suivant » à la place de « L'autre niveau », et le commentaire « C31 »
     devient « C31, C75 ». U0 fait tourner cette spec avant de pousser.
   - L'aperçu `.design-sync/previews/NextLevel.tsx` suit (« Niveau suivant »
     et le titre de la rétention), et la doc-comment de
     `src/components/game/NextLevel.tsx`, qui cite encore « L'autre niveau » ; la re-synchro avec
     Claude Design est un item de la section B de `CHANTIERS.md`, pas de cette
     PR.
2. **Le budget d'URL des statistiques** (`src/lib/analytics/__tests__/goatcounter-api.test.ts`,
   `MAX_URL = 4_000`). Mesuré le 2026-10-04 : 3 600 caractères aujourd'hui, et
   chaque niveau en ajoute environ 520 (ses 14 chemins `game_*`). Le premier
   niveau branché le fait passer au-dessus de 4 000. **Passer `MAX_URL` à
   6 000** (5 160 attendus à cinq niveaux, les trois quarts des ~8 Ko où les
   proxys refusent un GET), en réécrivant le commentaire du test avec ces
   chiffres.
3. **Le nombre de niveaux ouverts écrit en toutes lettres** : seule
   `GAME_META.hub.shareImageAlt` (`src/content/game/meta.ts`, « dont deux sont
   ouvertes ») est concernée ; les autres résultats de
   `grep -rn "deux niveaux\|two levels\|deux sont\|two of them" src/` ne sont
   pas à toucher. Elle devient un gabarit : FR « Le côté obscur de Tour de
   Growth : les cinq étapes du Tour, dont {open} sont ouvertes. », EN « The
   dark side of Tour de Growth: the five stages of the Tour, {open} of them
   open. ». Les nombres en lettres vivent à côté, dans `meta.ts` :
   `GAME_OPEN_COUNT_WORDS: Record<2 | 3 | 4 | 5, Translatable>` = deux / two,
   trois / three, quatre / four, cinq / five. Le gabarit se remplit dans
   `src/app/[locale]/game/opengraph-image.tsx` (`generateImageMetadata`, seul
   lecteur), avec `fill` (`src/lib/game/format.ts`) et
   `enabledLevelSlugs().length`. Le gabarit se déclare là où la copie du hub
   déclare les siens, et le test, dans `src/content/__tests__/game-hub.test.ts`,
   lit le texte **rempli** et y trouve « deux » / « two » tant que deux niveaux
   sont ouverts (`game-share-images.spec.ts` ne vérifie que `/.+/` : un `{open}`
   non rempli y passerait).
4. **Le bandeau d'un niveau** (`<NIVEAU>_INTRO.eyebrow`, `content/game/meta.ts`)
   dit l'étape, sans numéro (C76), sur les cinq niveaux, avec le nom de
   l'étape en anglais dans les deux langues, comme partout sur le site
   (`UI_STRINGS.pillars`, « Retention » sans accent) : « Le côté obscur ·
   retention » / "The dark side · retention" (`RETENTION_INTRO`, qui disait
   « niveau 1 »), « Le côté obscur · acquisition » / "The dark side ·
   acquisition" (`ACQUISITION_INTRO`, qui disait « niveau 2 »). Les trois
   nouveaux niveaux ont le leur dans leur spécification, section .11. Le
   bandeau sert aussi de surtitre à l'image de partage du niveau
   (`src/lib/og/game-level-share-text.ts`, `kicker`) : rien à y changer, il
   suit. Dans `src/content/updated-at.ts`, les dates de `/game/retention` et
   de `/game/acquisition` passent au jour de la PR (les mots de la page
   changent).
5. **Copie neuve « à relire »** (convention 6) : les deux bandeaux du point
   4, le gabarit de `shareImageAlt` et ses nombres en lettres (le
   `nextLevel` du niveau 2 est repris du niveau 1, ce n'est pas une chaîne
   neuve). Chaque chaîne porte
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
  niveau 1 » et le test « nomme son entreprise, jamais celle d'un autre niveau » (Flixo, Pédalix, et chaque niveau déjà construit : Quandi depuis ACT-1, REF-1).
  **Deux différences** que chaque spécification précise : la règle C1 « cite un
  article » nomme les textes admis pour ce niveau (le Code de la consommation
  n'est pas le seul), et la règle propre au contrôle (au niveau 2, C14 « jamais
  amende ») est remplacée par celle de la spécification.
- **Ce que chaque test de contenu doit savoir**, quel que soit le niveau :
  - `nextLevel: L1.nextLevel` (après U0) et les `endings.*.win` : `true` pour
    `applause` et `cleanMiss`, `false` pour les cinq autres, comme
    `acquisition.ts` ;
  - **C13 de T1 ne lit que la copie** : les nombres que la copie écrit
    plusieurs fois sont égaux entre eux, en chiffres écrits. La liaison aux
    constantes du téléphone (`CONTACTS`, `REFUSE_CLICKS_*`, `MONTHLY_EUR`…) est
    dans le test du téléphone, en T2 : ces constantes n'existent pas encore
    en T1 ;
  - **C1** : la forme que la spécification donne (une sous-chaîne ou une
    expression régulière), jamais celle du niveau 2 recopiée ;
  - **la règle du contrôle** : retirer `{fine}` avant de chercher un mot
    (`text.replace(/\{fine\}/g, "")`, comme C14), et chercher un mot anglais
    en mot entier (`/\bfine\b/`, `/\bsettlement\b/`), « to settle » apparaissant
    dans des cas ;
  - **C6** : les trois listes (`BRANDS`, `BRAND_WORDS`, `NOT_BRANDS`)
    exactement comme la spécification les donne, calculées avec `CAPITALISED`
    sur ses `cas` : le test « stale entry » refuse un mot de trop, et le test
    des marques un mot de moins ;
  - `src/content/__tests__/game-hub.test.ts` : étendre ses deux tests (les
    longueurs de titre et de description, les trois étapes de l'intro) à
    `GAME_META.<niveau>` et `<NIVEAU>_INTRO`.
- **Aucune route n'importe encore cette copie** : ni build ni Playwright
  nécessaires à cette PR (la CI construit quand même).

### T2 — Le téléphone et sa pastille (modèle : A12.e, PR #246)

- **`src/lib/game/<téléphone>-phone.ts`**, où `<téléphone>` est le nom que la
  section .12 de la spécification donne (`planner`, `split`, `fit`), comme
  `shop-phone.ts` au niveau 2 : pur. Le type
  des éléments du téléphone (`<Niveau>PhoneItem`), la fonction qui les rend de
  haut en bas d'après les cartes en production et cochées, et la fonction de
  la pastille, **exactement** comme la spécification les écrit (elle donne le
  type TypeScript, l'ordre, et la table de vérité de la pastille). Tests dans
  `src/__tests__/game-<téléphone>-phone.test.ts`, sur le modèle de
  `game-shop-phone.test.ts` : chaque ligne de la table de vérité de la
  spécification est un cas, et la liaison des constantes aux chaînes de la
  copie (C13, côté téléphone) que la spécification donne.
- **`src/components/game/<Nom>Phone.tsx`** et son `.module.css` : le dessin,
  dans le cadre partagé (`PhoneFrame.module.css`, l'éclair `phone-flash.ts`).
  Une figure de texte, sans faux boutons (E9) : un bouton dessiné est un
  `<span>` stylé, jamais un `<button>`. **La couleur de marque est un jeton,
  jamais un hexadécimal dans le module** (`game-no-hex.test.ts` refuse toute
  couleur littérale sous `src/components/game/`) : la spécification donne son
  nom et sa valeur, à ajouter dans `src/styles/tokens/game.css` (bloc `:root`,
  après le dernier jeton de marque des téléphones, `--shop-brand`, puis
  `--planner-brand`… dans l'ordre de construction ; REF-2), avec sa ligne dans les `PAIRS` de
  `src/__tests__/game-token-contrast.test.ts` (sinon « measures every color
  token » rougit) ; le module pose `--phone-brand: var(--<nom>-brand)`, comme
  `ShopPhone.module.css`. Les identifiants de test, la clé de l'éclair et
  l'ordre des lignes à l'intérieur de chaque élément sont dans la
  spécification.
- **`src/components/game/<Nom>Pill.tsx`** : la pastille, sur le modèle de
  `BasketPill.tsx` : elle importe `ClickPill.module.css` (pas de feuille à
  elle), `announce` à `false` dans le bureau, corail quand la spécification
  le dit. Elle reçoit des chaînes **déjà formatées** et des booléens, et
  n'importe `lib/game` qu'en `import type` (sinon la règle 2 de
  `game-bundles.test.ts` rougit) ; le formatage se fait dans `sides.tsx`.
- **`src/app/[locale]/game/_island/sides.tsx`** : `<NIVEAU>_SIDE: IslandSide<…>`
  et la fonction de phrase de la pastille, comme `ACQUISITION_SIDE` :
  `render` dessine le téléphone et la pastille (`announce={false}`), `pill`
  rend la forme courte de la barre d'action (sans suffixe) et son `alert`,
  `announce` rend `null` quand la pastille n'a pas changé, sinon la phrase
  entière. La spécification nomme la fonction de phrase. Pas encore dans
  `ISLAND_SIDES` : c'est T3.
- **Deux aperçus** pour Claude Design (`.design-sync/previews/<Nom>Phone.tsx`,
  `<Nom>Pill.tsx`), sur le modèle de `ShopPhone.tsx` et `BasketPill.tsx` :
  vérifiés au type près contre les composants (un `tsc` sur un barrel jetable,
  comme le dit l'entrée A12.d du journal). Inscrire les deux composants dans
  `.design-sync/config.json` (`componentSrcMap`, et le téléphone aussi dans
  `dtsPropsFor`), comme `ShopPhone` et `BasketPill` : sinon
  `check-inventory.mjs` fait échouer la synchro suivante. La re-synchro
  elle-même est un item B.
- **Vérification visuelle** (leçon nº 1 de `CLAUDE.md`) : le téléphone rendu
  dans chacun des états de la table de vérité, à 390 px, en français et en
  anglais, sur une page de développement jetable **jamais commitée**
  (`git status` propre avant le commit, comme A12.e), capturée par
  Playwright. Pour atteindre un trimestre ou décembre, une spec jetable hors
  du dépôt pose la sauvegarde avec `e2e/game-helpers.ts` et les années de
  `src/lib/game/__tests__/paths-<niveau>.ts`, comme le fait
  `e2e/game-level2.spec.ts` (U0 l'a fait ainsi). Le compte rendu donne le
  chemin des PNG. Rien ne déborde ; si
  quelque chose déborde, s'arrêter et le dire.

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
| `src/lib/game/events.ts` | le slug dans `GAME_LEVEL_SLUGS` (gardé par `GameLevelsCovered`), et `"result/<niveau>"`, `"deep_dive/<niveau>"` dans `GAME_ENTRY_DETAILS` |
| `src/content/game/entry.ts` | `GAME_ENTRY_COPY.<niveau>` : l'encart du résultat (titre, corps, bouton, bande), depuis la spécification |
| `src/content/game/hub.ts` | `zones.<pilier>.company` (le nom de l'entreprise, depuis la spécification), la ligne du niveau dans `LEVEL_TEASERS` (section .11), et dans `ENDINGS_BY_LEVEL` le libellé de la fin `fine` du niveau **si la section .11 en donne un** : « aucune entrée » quand celui du niveau 1 (« le contrôle et l'amende ») est juste (l'activation et le referral ; ACT-3) |
| `src/app/[locale]/game/_island/sides.tsx` | `IslandCopies.<niveau>` et `ISLAND_SIDES.<niveau>` |
| `src/app/[locale]/game/_island/GameIsland.tsx`, `useGame.ts` | ce que le compilateur demande (le modèle du niveau, sa copie) |
| `src/app/[locale]/game/<niveau>/page.tsx` | sur le modèle d'`acquisition/page.tsx` : l'intro, les deux mots du glossaire (dans la spécification), la copie, l'îlot, `nextLevels={nextLevelLinks(locale, SLUG)}` (T0) |
| `src/app/[locale]/game/<niveau>/opengraph-image.tsx` | sur le modèle d'`acquisition/opengraph-image.tsx` |
| `src/lib/og/game-level-share-text.ts`, `src/app/(app)/admin/stats/game.ts` | rien d'habitude : génériques depuis #247 ; vérifier que tsc ne demande rien |
| `src/app/(app)/r/[id]/game-entry.ts` | `LEVEL_MODELS.<niveau>: <NIVEAU>_LEVEL` (le chiffre de la bande) ; le détail `${from}/${slug}` compile une fois `GAME_ENTRY_DETAILS` complété (`events.ts`). Jamais de cast |
| `e2e/game-helpers.ts` | `MODEL_VERSIONS.<niveau>` (tsc l'exige) et `<NIVEAU>_PATH = { en: "/en/game/<niveau>", fr: "/fr/game/<niveau>" }`, comme `LEVEL2_PATH` |
| `src/lib/game/types.ts` | au dernier X-3, `DraftLevelSlug` devient `never`, comme l'a fait #247 |
| `src/content/updated-at.ts` | la date des pages touchées, comme A12.f.1, dont `/game` (sa zone devient jouable, et le texte de son image dit un niveau ouvert de plus) et les pages des niveaux déjà ouverts (leur navigation des zones lie le nouveau, et leur bloc « Niveau suivant » peut le viser ; ACT-3) |

Puis les tests que le niveau 2 a dû toucher, à étendre au nouveau niveau :
`src/__tests__/content-fan-in.test.ts` (un plafond par page, chacun avec sa
raison ; la page du nouveau niveau tire la copie du niveau 1 par référence),
`src/__tests__/proxy.test.ts` (boucle déjà sur les niveaux ouverts : vérifier
qu'il couvre le nouveau), `src/__tests__/game-entry-wiring.test.ts`,
`src/app/__tests__/sitemap.test.ts`, `src/app/[locale]/game/__tests__/game-metadata.test.ts`,
`src/lib/game/__tests__/{levels,events,storage,build-flag}.test.ts`,
`src/lib/analytics/__tests__/goatcounter-api.test.ts` (les chemins du niveau),
`src/lib/og/fonts.test.ts`, `src/app/(app)/admin/stats/__tests__/game.test.ts`,
`src/content/__tests__/game-hub.test.ts` (le test « reads « deux » / « two »
while two levels are open » tombe à l'ouverture du troisième niveau, voulu : il
devient « trois » / « three », la phrase entière écrite en dur dans les deux
langues, puis « quatre » et « cinq » aux X-3 suivants),
`src/app/(app)/r/[id]/__tests__/game-entry.test.ts`,
`src/lib/submissions/__tests__/growth-stats.test.ts` (l'étape qui gagne son
niveau entre dans le compte : ouvrir l'activation fait passer le cas
« Activation has no level » de `{ allTime: 4, last30Days: 3 }` à
`{ allTime: 5, last30Days: 4 }`), et un
`src/app/[locale]/game/_island/__tests__/island-view-<niveau>.test.ts` sur le
modèle d'`island-view-acquisition.test.ts` (chaque écran de chaque fin, dans
les deux langues, sans gabarit ni `undefined`, le chiffre dans son unité).
**Un test qui s'appuie sur une étape « sans niveau »** (`levels.test.ts`,
`game-entry.test.ts`, `growth-stats.test.ts`) passe à une étape encore fermée,
ou à une table `levels` explicite où elle est `enabled: false` ; on ne
supprime jamais le cas (au dernier X-3, il n'y a plus d'étape sans niveau :
la table explicite est la seule voie). **Préférer la table explicite**
(ACT-3 : `RETENTION_ONLY`, `ACQUISITION_AND_RETENTION`) : une étape encore
fermée ne l'est plus au X-3 suivant, qui refait le travail.

Côté e2e, les specs communes que le niveau 2 a touchées : `game-flag`,
`game-endings`, `game-share-images`, `share-previews`, `accessibility`,
`result-real` (une fixture de résultat dont le goulot est l'étape du niveau,
lue dans l'émulateur ; `e2e/real-results.ts` : la spécification donne la
fixture, ses réponses et le texte de la bande, et la spec vérifie aussi que la
bande `game-entry-band` tient sur une ligne, hauteur ≤ 44 px à 1 280 px).

**Le lien de décembre des niveaux déjà construits change** (C75) : ouvrir un
niveau change le niveau visé par le décembre des autres. À chaque X-3, chaque
spec e2e qui lit `game-next-level-link` d'un autre niveau se recalcule avec
`nextLevelFor` sur la nouvelle table, et s'écrit en dur. Par exemple, ouvrir
l'activation fait viser l'activation au décembre de l'acquisition
(`e2e/game-level2.spec.ts`, `/fr/game/activation?from=other_level`, titre
`LEVEL_TEASERS.activation`) ; celui de la rétention ne change pas tant que le
referral et le revenue sont fermés (il boucle sur l'acquisition).

### T4 — Les specs Playwright du niveau (modèle : A12.g, PR #250)

`e2e/game-<niveau>.spec.ts`, sur le modèle de `e2e/game-level2.spec.ts` : le
premier écran (P1, P2), le téléphone et la pastille qui suivent les cartes
(P5), les années A en français et C en anglais jouées à l'interface **d'après
les tables de la spécification, jamais recalculées**, l'année D renvoyée en
juin (P9), la sauvegarde sous sa propre clé, 390 px à chaque phase (P17), axe
sur décembre (P21) et l'analytique par niveau (P20). Et, pour le bloc
« Niveau suivant » (C75), deux décembres semés : sans collection, son lien va
au niveau ouvert qui suit dans l'ordre du Tour ; avec une fin enregistrée pour
ce niveau-là (`localStorage["tdg.game.collection.v1"]`, posé avant le
chargement, par exemple
`{"patterns":{},"endings":{"retention":{"id":"applause","at":"2026-10-04T00:00:00.000Z"}}}`),
il va au suivant encore. Les deux `href` attendus se calculent dans la spec
avec `nextLevelFor` importé en relatif (`../src/lib/game/levels`) sur
`GAME_LEVELS_BY_PILLAR`, puisque les niveaux ouverts dépendent de l'ordre de
construction.

**Trois choses du niveau 2 qui ne se recopient pas** : ses assertions
négatives sur l'autorité (« jamais DGCCRF » aux T1 et T2, « jamais fine » à la
fin) ne valent pas ailleurs, la spécification dit lesquelles valent ; « jamais
« % » » ne vise que la tuile, la frise, le premier chiffre du bilan, la
cellule et la courbe de décembre (`game-dash-metric`, `game-chart-metric`…),
pas les lignes d'effet qui disent « +{pct} % » ; et les cases du P5 et leurs
textes attendus sont ceux de la spécification, pas ceux du niveau 2.

### T5 — Ce qui n'est pas à l'agent

- **La re-synchro avec Claude Design** (les composants neufs et changés) :
  un item `B<n>` de la section B de `CHANTIERS.md`, ajouté par la PR X-3 (le
  prompt d'unité le dit), mené dans une session de design sync
  (`.design-sync/NOTES.md`).
- **Le bon à tirer** de la copie neuve : `/bon-a-tirer`, appelé par Antoine
  seul. La ligne A24.bat de `CHANTIERS.md` existe déjà : ne pas la dupliquer ;
  la session ne construit pas le bon à tirer d'elle-même.
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
  `/bon-a-tirer`). Sa forme : `// TODO: à relire — <date du commit> (<unité>) :
  <ce qui est neuf>`, sur sa propre ligne, au-dessus d'une JSDoc s'il y en a
  une.
- **Recopier par script, jamais retaper** (U0) : les fichiers de copie
  contiennent déjà des U+00A0 invisibles ; une chaîne existante retapée à la
  main n'est plus la même, et un remplacement qui la cherche échoue ou, pire,
  la change. Lire la chaîne dans le fichier (ou `git show origin/main:…`) et la
  recopier par script. **L'outil Write ne garde pas ce qu'on tape** : il a
  remplacé une U+00A0 tapée par une espace ordinaire (ACT-1), puis un
  échappement `\u00a0` tapé par une insécable littérale (ACT-4). Dans du code
  écrit à la main, l'échappement `\u00a0`, posé par un script (`chr(92)`), et
  vérifié après l'écriture : `grep -c $'\u00a0'` sur le fichier, et le nombre
  d'échappements attendu.
- **Une chaîne du prototype qui change de fichier garde sa garde** (U0) : C11
  (`game-retention.test.ts`) ne parcourt que `RETENTION_CONTENT` et ce qu'il
  nomme. Une ligne validée déplacée ailleurs se vérifie par son nom, et le
  commentaire de son nouveau fichier dit son état (validée, ou « à relire »).
- **Une chaîne visible déjà relue qui change** (au niveau 1, au niveau 2 ou
  au hub, que montre la page du bon à tirer nº7) s'inscrit à la ligne A12.h de
  `CHANTIERS.md`, en une phrase, comme U0 pour ses bandeaux : ce bon à tirer
  la relira. À X-3, la zone du niveau qui devient jouable au hub en est une.
- **Les commentaires que ton changement rend faux** (doc-comments, en-têtes,
  commentaires de test) se corrigent dans les fichiers que tu touches, et
  seulement là.
- **`pkill -f` tue ton propre shell** quand son motif figure dans sa propre
  ligne de commande (U0, et l'orchestrateur avant lui) : `pgrep -f
  'next[-]server'` (ou `firestore`), puis `kill <PID>`, dans une commande à
  part.
- **Les années de référence se jouent à l'interface** dans les specs e2e, en
  cliquant ce que la table dit, carte par carte : le moteur est déjà tenu par
  les tests unitaires, les specs tiennent l'écran.
- **Un volume du journal par période, après chaque fusion de `main`**
  (2026-10-04) : d'autres sessions (A22, A23) mergent le même jour, et un
  sous-agent et une autre session ont archivé en parallèle les mêmes entrées
  de `JOURNAL.md` dans deux volumes de `docs/journal/`. Après
  `git merge origin/main`, `ls docs/journal/` : deux volumes qui couvrent la
  même période, on garde celui de `main` et on retire l'autre (sa ligne de
  table comprise).
- **X-3 est l'unité la plus lourde d'un niveau** (la page, la route d'image,
  la suite Playwright complète, la mesure du poids avant le merge) : compter
  environ 1 h 15 entre le lancement du sous-agent et le merge. L'orchestrateur
  n'en lance pas une si la pause qu'on lui a donnée tombe avant.
- **`npm ci` peut réécrire `package-lock.json`** (ACT-3 : npm 10.9.4 en
  retire des champs `libc`) : un artefact d'outil, jamais un changement de
  l'unité. `git checkout -- package-lock.json` avant le commit ; un lockfile
  dans le diff fait aussi tomber la barrière de `/livrer` §0.

## 21.6 Vérifier avant de pousser

```sh
npx tsc --noEmit
npx eslint .
npx vitest run --coverage   # comme la CI (ci.yml) : avec ses seuils
# build comme la CI (ci.yml, bloc env) :
NEXT_PUBLIC_GOATCOUNTER_CODE=e2e-stub ADMIN_DASHBOARD_PASSWORD=e2e-admin GAME_ENABLED=true npm run build
# tuer un `next start` resté d'avant (il sert l'ancien build) : pgrep -f 'next[-]server', puis kill <PID>
# Playwright contre ce build, avec l'émulateur Firestore (recette de TESTING.md §5).
# Les variables sont lues à chaque requête : sans GAME_ENABLED, le jeu répond 404.
CI=1 GAME_ENABLED=true NEXT_PUBLIC_GOATCOUNTER_CODE=e2e-stub ADMIN_DASHBOARD_PASSWORD=e2e-admin npx playwright test e2e/game-<niveau>.spec.ts
CI=1 GAME_ENABLED=true NEXT_PUBLIC_GOATCOUNTER_CODE=e2e-stub ADMIN_DASHBOARD_PASSWORD=e2e-admin npx playwright test   # la suite complète en U0, X-3 et X-4
```

Puis, à l'écran (leçon nº 1), sur le build : l'intro du niveau, le bureau avec
son téléphone et la pastille dans la barre d'action, une année C jusqu'à la
sanction, le bloc de décembre, le hub ; à 1 280 et 390 px, en français et en
anglais ; aucun défilement horizontal.

Les fichiers de travail (captures, specs et pages jetables, journaux, le jar
de l'émulateur Firestore que `TESTING.md` §5 fait télécharger) vont **hors du
dépôt**, dans un dossier temporaire ; `git status` ne montre que les fichiers
de l'unité.

**Juste avant de pousser** : `git fetch origin && git merge origin/main`. Les
autres sessions mergent souvent dans la journée, et **une PR en conflit ne
lance pas sa CI** (U0 : « Types, tests, build » n'apparaissait pas). Sur un
conflit dans `JOURNAL.md`, les deux entrées se gardent entières, la tienne en
dernier ; ailleurs, s'arrêter et rendre compte. Puis `tsc` et `vitest` une
dernière fois.

Une relance de correction qui ne touche que des commentaires, des tests
unitaires ou des documents saute le build et Playwright, et le dit.

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
- L'entrée du journal de chaque PR, et, dans la même PR, ceux des nombres
  des chiffres de référence de `CLAUDE.md` qui ont changé (tests unitaires,
  specs Playwright, specs ignorées par construction). L'état du jeu dans
  `CLAUDE.md` ne change qu'à X-3 (la ligne `src/lib/game/` de la carte du
  repo) ; à X-4, seuls les nombres bougent, et le niveau fini se lit dans
  A24 de `CHANTIERS.md` (ACT-4).

## 21.8 Questions communes aux trois niveaux

Au format de `CHANTIERS.md` C. Chaque spécification est écrite selon la reco ;
une autre réponse change ce guide et les spécifications avant le code.

| # | Question | Reco | Si on se trompe | Réponse |
|---|---|---|---|---|
| QC1 | **Le bloc qui clôt décembre, à trois niveaux et plus** : vers quel niveau renvoie-t-il ? (C31 ne tranche que le cas à deux.) | **Le niveau suivant dans l'ordre du Tour, parmi les niveaux ouverts, en bouclant** (T0, point 1), sous le bandeau « Niveau suivant » pour tous. Calculé sur le serveur : la page reste prérendue. | Écarté : renvoyer vers le niveau que le joueur n'a pas encore fini, qui demande de lire la sauvegarde dans le navigateur et rend le bloc instable au rechargement. Changer de règle plus tard ne touche qu'une fonction pure. | **Non : le premier niveau ouvert que le joueur n'a pas encore fini** (C75, Antoine, 2026-10-04). T0 point 1 réécrit : calculé dans le navigateur, en décembre. |
| QC2 | **Le bandeau de l'intro, « Le côté obscur · niveau N »** : N au rang d'ouverture ? | **Oui** : le troisième niveau construit est le « niveau 3 », quel que soit son étape. C'est ce que disent déjà les niveaux 1 et 2. | Écarté : remplacer le numéro par l'étape (« Le côté obscur · activation ») sur les cinq niveaux ; plus juste dans l'ordre du hub, mais deux bandeaux validés changent. | **Non : l'étape, sans numéro, sur les cinq niveaux** (C76, Antoine, 2026-10-04). T0 point 4 réécrit ; les bandeaux des niveaux 1 et 2 changent en U0. |
| QC3 | **Les sanctions de la CNIL, citées sans le nom de l'entreprise** ? La CNIL anonymise ses délibérations deux ans après leur publication ; Google, Facebook, Microsoft et TikTok sont déjà « [X] » sur Légifrance pour leurs amendes sur les cookies. | **Oui** : « un moteur de recherche », « un courtier en données de neuf salariés ». Une entreprise est nommée quand un tribunal la nomme (Google, par le Conseil d'État) ou quand l'autorité n'est pas la CNIL (Twitter, par la FTC). | Écarté : nommer d'après la presse. Plus parlant, mais le jeu prolongerait une publicité que la CNIL a voulue limitée dans le temps, et chaque nom aurait une date d'expiration à surveiller. | **Oui** (C77, Antoine, 2026-10-04). |

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
  route, le proxy ou un payload bouge), ouvre la PR en brouillon, lit son
  numéro sur GitHub et pousse sur la même branche un commit qui coche l'unité
  dans A24 avec ce numéro (convention 8 ; la case part dans le squash), suit la
  CI, passe la PR en prête (`draft: false` : GitHub refuse de merger un
  brouillon), merge selon `/livrer` (lu, pas appelé), et s'arrête si on le lui
  a demandé. Il ne code pas lui-même, sauf une
  correction d'une ligne trouvée en relisant.
- **Le sous-agent** (Sonnet, `model: "sonnet"` dans l'outil Agent) : une unité,
  une branche, des commits poussés. Il ne merge pas et n'ouvre pas de PR. Il
  s'arrête et rend compte dès qu'il bute sur une contradiction ou une chaîne
  manquante (§21.0). Si la CI rougit sur sa PR, l'orchestrateur relance un
  sous-agent avec le journal de la CI et la même branche (une « relance de
  correction », dans le prompt).
- **Les relecteurs avant la PR** (ACT-1, le 2026-10-04) : la CI tourne
  environ 13 minutes et chaque push la relance. L'orchestrateur attend donc
  le retour des relecteurs, applique leurs corrections, puis ouvre la PR et
  pousse aussitôt la case cochée (ce push annule un run qui vient de partir,
  sans rien coûter). Une correction poussée en pleine CI la recommence.
- **Un seul clone pour les deux** : tant que le sous-agent travaille (l'outil
  Agent peut le lancer en arrière-plan), l'orchestrateur ne change pas de
  branche et n'écrit rien dans le clone ; il peut lire. Les modifications non
  commitées qu'il y voit sont celles du sous-agent.

### Les unités, dans l'ordre

Un niveau se construit d'un bout à l'autre avant le suivant : les unités de deux
niveaux touchent les mêmes fichiers (`copy.ts`, `sides.tsx`, `types.ts`,
`events.ts`, `entry.ts`) et se gêneraient en parallèle. L'ordre entre les
trois niveaux est libre.

| Unité | Ce qu'elle livre | Prérequis | Relecteurs | Point de pause après |
|---|---|---|---|---|
| **U0** | T0 (§21.3) : `nextLevelFor`, `finishedLevels`, `nextLevelLinks`, `LEVEL_TEASERS` avec les deux niveaux existants (typé `Record<LevelSlug, …>`, il ne peut pas encore nommer un niveau en brouillon), les deux `nextLevel.eyebrow` « Niveau suivant », les bandeaux des niveaux 1 et 2 à l'étape, `MAX_URL` à 6 000, le gabarit `{open}` de `shareImageAlt` | QC1 à QC3 tranchées (C75 à C77, faites) | copie, sécurité (`nextLevels` part vers le client) | oui |
| **X-1** | T1 : la copie du niveau, ses types, son intro et ses métadonnées, son test de contenu | questions du niveau tranchées ; U0 pour le premier niveau | copie | oui |
| **X-2** | T2 : le téléphone, sa pastille, le côté de l'îlot, les aperçus, leurs tests, les captures | X-1 | copie (les chaînes du téléphone) | oui |
| **X-3** | T3 : le slug déplacé et tout ce que le compilateur demande (dont la ligne du niveau dans `LEVEL_TEASERS`), la page, l'image, l'encart du résultat, le hub, les tests et specs communs | X-2 ; U0 | copie, sécurité | oui |
| **X-4** | T4 : `e2e/game-<niveau>.spec.ts` | X-3 | — | oui, et le niveau est fini (§21.7) |

`X` vaut `ACT` (activation, §18), `REF` (referral, §19) ou `REV` (revenue, §20) :
U0, puis ACT-1 à ACT-4, REF-1 à REF-4 et REV-1 à REV-4, soit treize unités. U0
passe une fois, avant le premier niveau construit ; chaque niveau ajoute sa
ligne dans `LEVEL_TEASERS` à son X-3, quand son slug devient un `LevelSlug`.

**Les branches** s'appellent `a24-<unité en minuscules>` : `a24-u0`,
`a24-act-1`, `a24-ref-3`… **Reprendre après une pause** : avant de choisir
l'unité, `git fetch --prune origin`, puis la liste des PR ouvertes et des
branches `a24-*`. Une unité poussée mais pas mergée se reprend (relance de
correction), jamais ne se recrée.

**Si `main` a bougé** (`mergeable_state` autre que `clean`) : **une PR en
conflit (`dirty`) ne lance pas sa CI**, et la seule trace en est l'absence de
« Types, tests, build » dans ses checks (U0, le 2026-10-04 : deux merges
d'une autre session pendant l'unité). Relance de correction avec
`git fetch origin && git merge origin/main`, en gardant les
deux entrées de `JOURNAL.md` (la nôtre en dernier), puis les vérifications du
§21.6 et un `push` ordinaire. Un numéro de PR décalé par Dependabot se relit
sur GitHub (convention 8).

**X-3 ajoute une route d'image** : `/livrer` §0 s'applique. Mesurer le poids
disque selon `VERCEL.md` §1.2 avant et après ; au-delà d'environ 1 Mo d'écart,
question à Antoine avant le merge.

### Le prompt d'une unité

L'orchestrateur remplit les champs entre chevrons et le passe tel quel
(`<DOSSIER>` : le clone, `/home/user/tourdegrowth` en session cloud ;
`<ATTRIBUTION>` : les deux lignes de fin de commit que sa session donne, avec
le nom du modèle du sous-agent). Pour U0, `<SPÉCIFICATION>` valait « aucune :
§21.3 T0 et §21.8 ».

```text
Tu construis une unité du jeu « Le côté obscur » de Tour de Growth : <UNITÉ>
(par exemple « ACT-2, le téléphone du niveau activation »). Tu exécutes une
spécification déjà tranchée : tu ne décides rien de ce qui touche au produit,
au droit ou à la copie. Le dépôt est cloné dans <DOSSIER> : travaille là.

Lis d'abord, en entier : CLAUDE.md ; docs/game/construire-un-niveau.md (§21.0,
§21.1, §21.2, la section de ton unité au §21.3, §21.5, §21.6) ; puis
<SPÉCIFICATION> (docs/game/activation.md, referral.md ou revenue.md). Lis aussi
le modèle de l'étape au niveau 2 que le §21.3 cite pour ton unité.

Mode : <MODE> (« nouvelle unité » ou « relance de correction »). Fais d'abord
git fetch --prune origin. Nouvelle unité : git checkout -B <BRANCHE>
origin/main avant toute écriture. Relance de correction : git checkout -B
<BRANCHE> origin/<BRANCHE>, et tu ne corriges que ceci : <À CORRIGER>. Jamais
de push --force. Une relance qui ne touche que des commentaires, des tests
unitaires ou des documents saute le build et Playwright, et le dit. Fais exactement
ce que la section de ton unité demande, avec les chaînes et les chiffres de la
spécification, recopiés tels quels, espaces insécables posées selon le §21.5.
Ne touche pas aux fichiers d'autres unités, ni au modèle
(src/lib/game/levels/<niveau>.ts), sauf, à X-3, son commentaire d'en-tête
(« in DRAFT » s'en va, et la phrase de remplacement est dans la section .12 de
la spécification). À X-3, ajoute aussi dans CHANTIERS.md, section B, l'item
B<n+1> : la re-synchro du téléphone et de la pastille du niveau (et de
NextLevel au premier niveau) ; la ligne A24.bat existe déjà.

Arrête-toi et rends compte, sans contourner, si : une chaîne exigée par le
contrat de copie manque dans la spécification ; la spécification contredit le
code ou un test ; un test du modèle (src/lib/game/__tests__/<niveau>.test.ts)
rougit ; tu as besoin d'une décision.

Tes fichiers de travail (captures, specs jetables, journaux, le jar de
l'émulateur) vont hors du dépôt, dans un dossier temporaire.

Avant de pousser, fais passer les vérifications du §21.6 qui concernent ton
unité, ajoute l'entrée de ton unité à la fin de JOURNAL.md (ce qui est livré,
les choix d'exécution, ce qui est vérifié, avec les chiffres réels des
commandes), remplace dans CLAUDE.md ceux des nombres des chiffres de
référence (tests unitaires, specs Playwright, specs ignorées par construction)
qui ont changé, et, à X-3, l'état du niveau dans la ligne src/lib/game/ de la
carte du repo, sans ajouter de phrase (il reste moins de 1 200 caractères de
marge). Juste avant de pousser,
git fetch origin && git merge origin/main (§21.6 : un conflit dans JOURNAL.md
garde les deux entrées, la tienne en dernier ; ailleurs, arrête-toi), puis tsc
et vitest une dernière fois. Commit et pousse ta branche (git push -u origin
<BRANCHE> ; sur une erreur réseau seulement, jusqu'à quatre reprises après 2,
4, 8 et 16 s). Tes messages de commit se terminent par ces lignes :
<ATTRIBUTION>. N'écris aucun identifiant de modèle ailleurs (code,
commentaires, journal). Ne coche rien dans CHANTIERS.md : l'orchestrateur le
fait avec le numéro de PR. Si
src/__tests__/claude-md-budget.test.ts rougit sur JOURNAL.md, archive selon
l'en-tête de JOURNAL.md (les entrées les plus anciennes, entières, dans un
nouveau volume de docs/journal/, avec sa ligne de table). N'ouvre pas de PR et
ne merge pas.

Ton compte rendu, en français : ce qui est fait, fichier par fichier ; la sortie
résumée de chaque commande (tests passés sur total) ; les captures d'écran
prises et leur chemin ; tout écart à la spécification et pourquoi ; les
questions ouvertes. N'écris « vérifié » que pour ce que tu as fait tourner.
Termine par une section « Ce que j'ai dû deviner » : chaque endroit où la
spécification ou le guide ne suffisait pas et où tu as dû interpréter, même
légèrement, avec ce que tu as choisi.
```

### Ce que l'orchestrateur vérifie avant de merger

1. Le compte rendu cite des commandes réellement lancées, et leurs sorties
   sont vertes ; la CI de la PR est verte. Juste après l'ouverture de la PR,
   son `mergeable_state` : `dirty` veut dire que la CI ne tournera pas.
   **La section « Ce que j'ai dû deviner »** du compte rendu se lit : ce qui
   y relève du guide ou d'une spécification s'y corrige (une PR de
   documentation) avant l'unité suivante.
2. Les relecteurs n'ont rien de bloquant, ou leurs remarques sont corrigées par
   un sous-agent relancé sur la même branche.
3. Pour X-2 et X-3, il lit lui-même (outil Read) deux des PNG dont le compte
   rendu donne le chemin (390 px, une en français, une en anglais) : leçon nº 1
   de `CLAUDE.md`.
4. La case de l'unité est cochée dans A24, sur la branche, avec le numéro de PR
   lu sur GitHub (convention 8), et la PR a mis à jour les chiffres de
   référence de `CLAUDE.md`.
5. Après le merge, `git show --stat` du squash (convention 1).
