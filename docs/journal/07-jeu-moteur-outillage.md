# Journal de Tour de Growth — 7. Le jeu, le moteur et l'outillage Claude Code

*Volume archivé : les entrées du 2026-09-23 au 2026-09-28. On y trouve les réécritures du nº5, le jeu et le moteur construits derrière leur drapeau, l'aperçu propriétaire, les premiers retours d'Antoine, l'installeur de plug-ins et l'outillage Claude Code, l'audit SEO, l'audit du kit, le DG redessiné, les six directions de design.*

*Le texte est celui du journal, déplacé tel quel le 2026-10-01 : rien n'y a été réécrit. Un « plus haut » ou un « voir l'entrée du… » peut donc désigner une entrée d'un autre volume. Le volume courant et la table des volumes sont dans [`JOURNAL.md`](../../JOURNAL.md), et `grep -rn "<motif>" JOURNAL.md docs/journal/` cherche partout.*

---

### Les quatre réécritures du bon à tirer nº5, et la classe que l'une d'elles désignait (2026-09-23)

Les quatre cartes qu'Antoine avait marquées « à changer » en clôturant le nº5,
traitées ensemble parce que trois d'entre elles sont le même genre de défaut.

**Le fait qui compte, et qu'une note de relecture ne pouvait pas dire :
deux des trois défauts existaient aussi ailleurs que là où il les a vus.**

- Le « deck » de `g-product-led-growth` (« Quel deck ? De quoi tu parles ? »)
  était **dans les deux langues** — l'anglais disait « not what the pitch deck
  says » alors que l'exemple s'intitule « A company that calls itself
  product-led » et ne mentionne aucun deck. Antoine relit le français ; une
  chaîne `Translatable` est deux textes, et rien ne garantit que la moitié
  qu'il ne lit pas soit saine. Remplacé des deux côtés par la comparaison à ce
  que l'entreprise dit d'elle-même.
- « un bord dangereux » (calque de « a dangerous edge ») apparaissait **deux
  fois sur le même terme** : dans la copie courte qu'il citait, et dans la
  fiche de formule de la page longue. Corriger seulement celle qui est citée,
  c'est l'erreur exacte de l'ACV la semaine dernière — patcher l'instance
  nommée et laisser la classe.

**Le balayage a trouvé six renvois inter-pages, pas cinq.** La ligne du tableau
des points ouverts, que j'avais écrite moi-même, en annonçait cinq. Le sixième
— la fiche de formule du CAC payback, « La page CAC détaille pourquoi… » — n'a
été vu qu'en relançant la recherche avec un motif de forme différente. C'est la
leçon du run nº8 (« une recherche ne prouve que ce qu'elle a regardé »),
appliquée cette fois à une **liste que j'avais écrite et que je relisais comme
un fait établi**. Deux motifs valent mieux qu'un, et l'union des deux vaut
mieux que la confiance dans le premier.

**La forme du correctif, telle qu'Antoine l'a validée** : le **pointeur** part,
les **chiffres partagés** restent. Ils ne coûtent rien à quelqu'un qui arrive
par le SEO pour une définition, et ils restent cohérents pour qui lit plusieurs
pages — c'est le pointeur, pas le chiffre, qui suppose que tout le glossaire se
lit d'un bloc. Un seul demandait une vraie réécriture, celui du playbook
d'expansion, parce que le renvoi nommait la page d'où il venait : il décrit
maintenant son déclencheur (l'offre au moment où un compte atteint sa limite de
sièges). Celui du PQL était en plus **mort** depuis la coupe
d'`activation-rate` le 2026-09-14 — le retirer corrige les deux défauts d'un
coup.

**Vérifié en réel** : lint, tsc, 709 tests unitaires, seuils de couverture,
`next build`, **286 specs Playwright**. Débordement horizontal **mesuré** à 390
et 1280 px sur les neuf pages touchées (aucun), et les deux passages les plus
réécrits relus en capture — ce qui a confirmé un effet que je n'avais pas prévu
en écrivant : nommer « L'argument » au lieu de « Il » rétablit le parallèle
avec « L'argument est le plus fort » deux paragraphes plus haut, qui était
manifestement l'intention d'origine.

**Le flake de `locale-routing.spec.ts:75` a une cinquième occurrence, et elle
est plus large.** Pour la première fois il a rougi **au niveau du fichier** et
pas seulement en suite complète, ce que ce fichier annonçait comme impossible.
Avant de conclure quoi que ce soit, le mécanisme lui-même a été vérifié en HTTP
direct contre le build : `/en` pose `tdg_locale=en`, `/fr` le bascule en `fr`,
`/quiz` rend bien `<html lang="fr">`. Puis 5 passages du seul test et 3 du
fichier entier, tous verts. Donc toujours dépendant de la charge, toujours pas
un défaut produit, et sans rapport avec des modifications qui ne touchent que
des chaînes de contenu. **Non durcie**, conformément à la règle déjà posée.

**Mergé et vérifié en production le jour même** (`7ff07aa`, PR #163 — un seul
merge pour tout ce que le gel avait accumulé : la déduplication du chunk de
contenu, les six fichiers de conventions par outil, ces réécritures). Les huit
sites de réécriture ont été contrôlés sur le site déployé, dans les deux
langues et **dans les deux sens** — le nouveau texte présent et l'ancien
absent.

**Et c'est ce contrôle qui a produit le piège le plus utile de la journée**,
consigné en `TESTING.md` §2.3bis : ma première sonde a rapporté « le renvoi
est encore là » sur `nrr-grr`, ce qui était **faux**. React échappe
l'apostrophe en `&#x27;` dans le HTML servi, donc trois de mes quatre sondes
ne pouvaient mécaniquement rien matcher — et sur de la copie française, une
sonde sur deux porte une apostrophe. Le vice est que la sonde cherchant une
*absence* rend alors un faux « c'est corrigé », et qu'une requête qui échoue
(j'en ai eu une à 0 octet) satisfait d'un coup toutes les assertions
d'absence. Décoder les entités avant de chercher, et asserter que le corps a
une taille plausible avant de conclure quoi que ce soit.

**Les quatre réponses sont écrites sous les notes d'Antoine dans l'artifact**
(champ `reply`), pas dans le salon — la conversation de relecture vit avec la
décision. Elles disent aussi ce que je n'ai **pas** touché : la dernière phrase
de l'encadré de `g-nrr-grr` finit par « et une seule est dans le deck », un
autre « deck » que celui de la page product-led (ici générique, le board deck)
qu'il avait lu sans le relever. À lui de trancher en un mot.

### Reprise anticipée : quatre chantiers menés en parallèle (2026-09-24)

Le quota Vercel s'est réinitialisé plus tôt que prévu et Antoine a demandé de reprendre sans attendre le 26, sur quatre chantiers à la fois : le jeu « Le côté obscur » (qualité « La Bataille du budget »), le moteur de croissance local (l'« audit à la cool » : saisie des chiffres AARRR, visualisation dépliable, slides CODIR, rien stocké chez nous), une remise en cause du design system avec les plugins Design et UI UX Pro Max, et une passe marketing (audit SEO, copie, campagnes de lancement). Cette entrée couvre la méthode et ce qui a été livré sur les branches ; le jeu et le moteur ont leurs propres entrées plus bas.

**La méthode, parce qu'elle se réutilisera.** Tout a été mené par des workflows d'agents, chacun dans son propre worktree git et sur sa propre branche, puis intégré à la main sur la branche de travail. Quatre contraintes de la machine (4 CPU, ~15 Go partagés par une dizaine d'agents) ont décidé de la forme :
- **Deux agents au plus par workflow** (la limite vaut CPU − 2) : pour avoir huit agents en vol, il faut quatre workflows, pas un.
- **Les worktrees partent d'`origin/main`, pas de l'état local.** D'où une branche `integ/base`, avancée par l'orchestrateur après chaque intégration verte, et que chaque agent reprend avec `git checkout -B <branche> integ/base`.
- **`node_modules` en liens physiques** (`cp -al`), jamais en lien symbolique : Turbopack refuse un lien qui sort de la racine du projet. Et jamais de `npm install` dans un worktree, qui corromprait le dossier partagé.
- **Un sémaphore à deux places** (`flock`) devant tout ce qui est lourd (build, suite couverte, Playwright), et **un port par agent** (`E2E_PORT`, que `playwright.config.ts` lit désormais). Sans le port dédié, `reuseExistingServer` a fait tester en silence le build d'un autre agent.

Deux pièges d'outillage rencontrés par presque tous les agents, à connaître : `pkill -f <motif>` tue le shell quand le motif figure dans sa propre ligne de commande (sortie 144), et **le processus `next-server` ne porte pas le port dans sa ligne de commande** — seul son parent `sh -c next start -p N` le porte. On identifie son propre serveur par `readlink /proc/<pid>/cwd`, puis on tue par PID. Et après la suppression d'une route d'aperçu locale, `tsc` échoue sur `.next/types/validator.ts` tant qu'un nouveau build ne l'a pas régénéré : ce n'est pas une erreur du code.

**Hygiène du dépôt public** (demandes d'Antoine du matin). `SECURITY.md` créé, avec l'adresse `contact@` et une promesse de délai qu'un projet tenu par une personne peut tenir. Une section « Contributing » dans le README dit la posture tranchée le 2026-09-17 : lecture bienvenue, PR non attendues — donc ni `CONTRIBUTING.md` ni gabarits d'issue, qui promettraient un processus qui n'existe pas ; les issues restent ouvertes. Les actions de `ci.yml` sont épinglées par SHA de commit comme celles des deux autres workflows, et `src/__tests__/workflows-pinned.test.ts` le vérifie pour **tous** les workflows. L'alerte CodeQL de `create-submission.ts` est fermée par la ligne annoncée (`%s` plutôt qu'une interpolation dans le gabarit de `console.error`), avec la même correction sur le `console.warn` de la route Deep dive.

**Vercel : l'`ignoreCommand` étendu est implémenté** (conception arrêtée le 2026-09-15, `VERCEL.md` §2.2). `scripts/vercel-ignore.sh`, POSIX : hors production il saute ; en production il compare `VERCEL_GIT_PREVIOUS_SHA` (sinon `HEAD^`) à `HEAD` avec `--no-renames`, et ne saute que si **chaque** fichier du diff est de la doc sans effet sur le build (`*.md` à la racine seulement, `LICENSE`, `.github/`, `marketing/`, `design/`, `.design-sync/`, `scripts/live/`). Tout le reste construit, et surtout : base introuvable, diff en erreur ou diff vide construisent (`exit 1`). Un seul `exit 0` possible, celui qui a tout vérifié. `vercel-config.test.ts` exécute le vrai script contre des dépôts git temporaires (24 cas, dont un renommage de `design/` vers `src/` qui ne doit pas sauter).

**Le design system v3** (critique complète dans `scratchpad/phase1/ds-critique.md`, livrée en sept branches `ds/*`) :
- **Trois couches de jetons** dans `colors.css` : primitives sur `:root`, sémantique papier sur `:root, [data-world="paper"]`, dérivés sur `:root, [data-world]`. La raison du troisième bloc est le piège le plus important de la journée : **une propriété personnalisée qui utilise `var()` est résolue là où elle est DÉCLARÉE, puis héritée comme valeur finie**. Rebinder `--shadow-color` sur une section nuit ne change pas un `--shadow-card` déclaré sur `:root`. Vérifié dans Chromium dans les deux sens.
- `src/styles/tokens/tokens.ts` est la source typée des couleurs pour tout ce que le CSS n'atteint pas (Satori, slides) ; `token-sources.test.ts` échoue sur toute divergence dans un sens ou dans l'autre. **Ça retire le point ouvert « resynchroniser `lib/og/tokens.ts` à la main »** : ce fichier lit désormais ses primitives là.
- Le contraste devient une propriété des jetons, plus seulement des pages rendues : `token-contrast.test.ts` épingle 54 ratios papier et leur seuil de rôle.
- Les 31 références directes à une primitive dans le CSS des composants passent sur des alias sémantiques, et `no-primitives.test.ts` l'interdit désormais partout hors `src/styles/tokens` (styles en ligne compris).
- Cibles tactiles : le `Segmented` compact et le déclencheur de glossaire gagnent une zone de 44 px mesurée par `elementFromPoint` (`e2e/targets.spec.ts`). Au passage, l'`overflow: hidden` de la piste compacte **rognait l'anneau de focus clavier** du sélecteur de langue et du toggle de ton : aucun lecteur clavier n'avait de focus visible sur ces deux contrôles, et axe ne mesure pas la visibilité du focus.
- `globals.css` : une **seconde couture** dans le fond de page, invisible à la spec de 2026-09-05 parce qu'elle n'échantillonnait que la gouttière gauche (la couture était à droite, là où se trouve le halo `88% 74%`). Corrigée par `background-attachment: fixed`, et la spec échantillonne maintenant les deux gouttières. Plus un lien de base à spécificité nulle (`:where(a)`), un lien d'évitement « Aller au contenu » et `text-wrap: balance` sur les `h1`.
- **Le constat qui compte le plus : la barrière « contraste vérifié par la CI, zéro exception » (convention 7) n'avait jamais couvert le texte posé sur le fond de page.** axe ne sait pas mesurer un contraste sur un dégradé : ~20 nœuds par page (en-tête, hero, prose) revenaient « incomplete », jamais « violation », à toutes les largeurs. `accessibility.spec.ts` aplatit maintenant le fond avant de lancer axe — ce qui a aussitôt trouvé le logotype mobile (« GROWTH » à 3,56:1), accepté par l'exemption WCAG 1.4.3 des logotypes et exclu par son balisage, pas par sa paire de couleurs. La passe tourne aussi en 390 px (nouveau projet Playwright `mobile`).
- États de sélection unifiés (réponses, puces de segment, cartes de ton : fond encre, texte papier ; le survol n'ajoute qu'une ombre et disparaît sous `hover: none`), et `Button` gagne survol, appui et `loading`.
- **La famille des pages de prose** : `brand/ProsePage` (+ `ProseSection`, `ProseText`, `ProseList`, `ProseActions`) et `core/Callout` (`caveat` | `cta`, jamais rouge). Neuf familles de pages y passent, plus aucun fichier n'importe le module CSS de `/how-it-works`, et `page-styles-scope.test.ts` l'interdit. Une carte en relief au plus par écran.
- **Le monde nuit** (`world-night.css`) rebinde **chaque** jeton sémantique, y compris ceux dont la valeur ne change pas — un jeton oublié hérite sa valeur papier dans la nuit (le lavis rouge papier sous du texte nuit donne 1,2:1). `NIGHT_WORLD satisfies Record<keyof typeof SEMANTIC, …>` fait échouer `tsc` le jour où un jeton papier est ajouté sans sa valeur nuit. `NightSurface` doit aussi peindre `color` : un descendant hérite de la couleur CALCULÉE du `body`.
- **La data-viz, sans bibliothèque** : `lib/viz/*` (échelles, graduations, sparkline, bullet, tri — 42 tests), `core/DataTable`, `viz/{StatTile, Sparkline, BulletChart, ChartFrame}`. La tuile cachée du jeu est un leurre en formes, pas en texte flouté : axe mesurait le contraste d'un texte flou `aria-hidden`, et un texte peut se copier.

Restent ouverts côté DS, signalés plutôt qu'absorbés : les aplats rouges sous texte blanc de petite taille (`Tag tone="red"`, `StampedPillar`, badge roast) sont à 4,42:1 — la même paire que R-22 a retirée du bouton ; le `Segmented` compact fait 40 px de large ; `--text-faint` tombe à 4,49:1 sur le point le plus sombre du fond (il n'est utilisé que sur des cartes aujourd'hui).

**Revue de copie v1** (`copy/review-v1`, 12 commits) : les dix changements de la revue plus une fiche terminologique. « Diagnostic » partout en français, « Deep dive » comme nom propre ; « étape » au lieu de « pilier » pour le lecteur (36 chaînes) ; CTA à flèche à l'impératif, deuxième personne ; la réassurance sous le choix du ton ne promet plus un aller-retour qui n'existe que dans un sens. Le badge FR de l'image de partage a été **mesuré** avant de trancher : « DIAGNOSTIC AARRR — 3 MIN » tient (~316 px), donc « Bilan » n'était pas nécessaire. **La typographie française est corrigée à la source, pas au rendu** : 742 chaînes réécrites par un script qui ne touche une chaîne que si sa valeur est française et jamais anglaise. `copy-typography.test.ts` lit désormais les **valeurs** des modules (le français s'y écrit sous cinq formes). Deux pièges : `toHaveText` et `toContainText` normalisent les espaces des deux côtés (`\s` couvre U+00A0), donc ne prouvent rien sur une insécable ; et un détecteur de coupure de ligne doit encadrer la lettre de l'autre côté de l'espace, une espace en fin de ligne n'ayant pas de boîte.

Au passage, les textes de lancement de la vague 1 affirmaient que le modèle écrit le roast — faux depuis SPEC-ADDENDUM-01 §0 : le roast du résultat rapide est une bibliothèque de phrases relues. Corrigé, avec deux chiffres (62 verdicts, 24 termes).

**Audit SEO v1** (`seo/audit-v1`, 6 commits) : `/quiz` gagne canonical, Open Graph et sa propre image par langue (route `/quiz/share/[locale]`, prérendue — un fichier `opengraph-image` sous le groupe `(app)` recevrait une adresse hachée et ne choisirait pas la langue). **18 des 72 URL du sitemap n'avaient pas d'`og:image`** : les pages de contenu reçoivent l'image de la landing en repli. Mesuré sur le build, contre la documentation : **une image déclarée dans la config des métadonnées remplace l'image-fichier du même segment**, donc une page qui a sa propre image passe `ownShareImage`. Titres ≤ 60 caractères et descriptions 70-160 vérifiés par un test unitaire et par un e2e sur le HTML rendu ; `Article` porte `datePublished`/`dateModified` ; un bloc « comparé à » sur `/glossary/aarrr` ; `comparison-index.ts` sépare les titres de la prose, ce qui fait tomber le fan-in de `comparisons.ts` de 6 routes à 4 ; et une cinquième comparaison, **`/aarrr-vs-heart`**.

**Dates du sitemap** : la revue de copie avait réécrit des mots sur neuf pages et neuf termes sans bouger `CONTENT_UPDATED_AT`, qui nourrit maintenant aussi `dateModified`. La liste des dates à bouger vient d'un **diff par mots** entre production et la branche (insécables et points de suspension normalisés), pour que le passage typographique seul ne déplace aucune date.

**Campagnes de lancement v2** (`marketing/campaigns/`) : trois lancements séquencés (le Tour relancé, le moteur, le jeu), une campagne UTM par lancement (`--campaign`, nom inconnu refusé), un calendrier, une matrice de canaux, un brief concurrentiel et une revue de marque. **GoatCounter ne lit les UTM que sur les pages vues** : aucun événement ne s'attribue à une campagne, d'où une campagne par lancement et un grand canal par jour, la seule façon de lire chaque lancement. `marketing/check-lengths.mjs` vérifie chaque compte de caractères annoncé ; à son premier passage il a trouvé 16 comptes faux et 3 descriptions au-delà de leur limite, dont les deux descriptions de 800 caractères du Tour, à 840 et 864 depuis la vague 1. Et le kit disait que les réponses du Tour « ne quittent le navigateur que pour calculer le score » — faux (elles sont stockées avec le résultat), et c'est précisément la phrase qui aurait affaibli la vraie promesse du moteur, qui ne stocke rien. Aucun texte ne nomme l'auteur ; rien n'est posté ; quatre décisions (D1-D4) attendent Antoine dans le README des campagnes.

### Le jeu « Le côté obscur », niveau 1, derrière `GAME_ENABLED` (2026-09-24/25)

Demande d'Antoine : un jeu pour apprendre la croissance, « vraiment qualitatif », sur le modèle de *La Bataille du budget*. Le brief (`GAME-BRIEF.md`, version 1.2, section 15 pour les seize écarts assumés) et le prototype validé en quatre itérations (`design/game/prototype-s-ils-reviennent.html`) font foi ; le plan d'implémentation est resté dans la session. Le niveau 1, « S'ils reviennent », met le joueur à la place du PM growth d'une appli de streaming fictive : chaque trimestre, deux cartes à jouer, honnêtes ou sombres ; en décembre, le catalogue nomme chaque manipulation, la loi qui la vise et un cas réel.

**Où ça vit.** `src/lib/game/` (moteur pur, rejoue les parcours de référence du brief au centième), `src/content/game/` (toute la copie, résolue côté serveur et passée en une prop), `src/components/game/` (présentation seule), `src/app/[locale]/game/` (hub et niveau, **prérendus ●**), l'encart sur la page de résultat quand la rétention est dans le groupe du goulot, et deux familles d'images de partage. Le monde « nuit » du design system v3 habille le jeu (voir l'entrée « Reprise anticipée »).

**Le drapeau.** `GAME_ENABLED` au build **et** à la requête ; `?game=preview` pose un cookie qui ouvre l'aperçu (`noindex, nofollow`, pas de hreflang). Fermé sans cookie : 404 localisée. Sur Vercel, une bascule demande un redéploiement (voir la correction de l'entrée R2-28). Les sept décisions par défaut prises pour avancer (placement de l'encart, goulot partagé inclus, noms de zones bilingues, « vingt minutes » gardé seulement si le temps mesuré le porte…) sont à renverser en une phrase si Antoine le veut.

**Ce qui a été trouvé en vérifiant, pas en relisant** — les pièges à garder :
- **Une e2e qui joue la vraie suite d'écrans a trouvé ce qu'un test par état ne pouvait pas voir** : le tableau de bord révélait confiance et radar dès le rapport du **dernier** trimestre, parce que la vue révélait sur `over` seul, et la boucle du test unitaire faisait `years.slice(0, -1)` — exactement l'état sauté.
- **Une tuile cachée ne doit porter aucun chiffre dans le DOM**, et le vérifier est piégeux : les classes CSS Modules sont hachées avec des chiffres (exclure `class` et `style`), et il faut tester nom **et** valeur d'attribut ensemble, sinon `data-trust="60"` passe.
- **`position: sticky` ne marche que dans son parent** : une barre d'action enveloppée dans son propre `div` ne colle jamais (mesurée à y=1430). Et le défilement du focus clavier ignore une barre collante : 9 cartes sur 33 finissaient dessous. `scroll-margin-bottom` n'y change rien, c'est `scroll-padding-bottom` **sur la racine de défilement** que le focus lit — posé via `:global(html):has(.bar)`, donc seulement tant que la barre existe.
- **La file d'attente GoatCounter d'A4 inversait l'ordre** : vidée seulement par son poll de 150 ms, un clic dans cet intervalle doublait un événement de montage mis en file avant lui. `trackEvent` vide maintenant la file d'abord.
- **Un drapeau de build se teste en séparant build et exécution** : construit fermé, servi ouvert, exactement les 4 specs du drapeau de build tombent et les 10 du drapeau d'exécution passent. Et les surfaces « ouvertes au build » se vérifient sur le HTML prérendu, pas sur un serveur lancé avec la variable.
- Divers : la synthèse vocale de Chromium ne se bouchonne qu'avec `Object.defineProperty` (la propriété est un getter) ; `toHaveText` ne compare pas avec `innerText` (prendre `textContent`) ; une année écourtée atteint « décembre » en juin, donc toute chaîne qui nomme décembre sur cette page est un gabarit sur le mois de clôture ; `animation-fill-mode: both` sur un tracé en `clip-path` garde le clip après l'animation.

**Vérification des faits du catalogue (2026-09-25)** : toutes les affirmations sur le monde réel du jeu, du moteur et des textes de lancement ont été vérifiées contre des sources primaires (FTC, ministère américain de la Justice, Légifrance, règlement DSA, CNIL, documentation des outils). Sur 86 affirmations : 52 justes, 16 imprécises, 5 fausses, 13 invérifiables. Corrigé : Basic-Fit (l'amende vient de la DDPP du Nord, pas de la DGCCRF nationale), le harcèlement d'interface (une quinzaine d'exemples chez deceptive.design, aucun d'Amazon), le confirmshaming (pas « le plus documenté »), le Digital Fairness Act (aucun texte n'existe encore), deux causalités sans source ; côté lancement, une phrase qui disait les réponses du Tour jamais conservées, et « la police ne s'embarque pas dans un PowerPoint » (c'est notre export navigateur qui ne le peut pas). Le chiffre Amazon (2,5 milliards de dollars, parcours « Iliad ») est juste. Le test C11 de fidélité au prototype exige qu'une correction de fait passe par `NOT_FROM_PROTOTYPE` : être fidèle au prototype n'est pas une raison d'imprimer une erreur.

### Le moteur de croissance, P0 à P7, derrière `ENGINE_ENABLED` (2026-09-24/25)

L'« audit à la cool » demandé par Antoine : saisir les quinze chiffres du funnel AARRR étape par étape, voir le funnel et déplier ce qu'il y a derrière chaque étape, sortir des slides CODIR, **rien stocké chez nous**. La spécification est **`ENGINE.md`** (versionnée le 25, elle ne vivait que dans la session), avec ses sept décisions par défaut en tête. Route `/{locale}/aarrr-funnel-template` (la requête sans concurrent de l'audit SEO), **prérendue ● que le drapeau soit ouvert ou fermé** ; `?engine=preview` pour la tester.

**Architecture, en huit branches parallèles** : P0 la frontière (`engine-boundary.test.ts`), P1 le moteur pur (`src/lib/engine/` : dérivations, diagnostic, « et si », deck en modèle, demande copiée), P2 le stockage (`tdg.engine.v1`, jamais d'écrasement de ce qu'on ne sait pas lire), P3 la copie (`engine-copy.ts`, `engine-catalog.ts`), P4 la saisie (l'îlot, le tableau, les fiches), P5 les visuels, P6 les slides (`_engine/deck/`, PDF par l'impression du navigateur, PNG par `html-to-image` chargé au clic), P7 l'alignement des phrases et la finition.

**Le vrai enseignement : deux contrats écrits indépendamment ne se rencontrent qu'à l'intégration.** P7a a réécrit la forme des lignes que le modèle du deck écrit (`text`, `label`, `id` finis, choisis dans `phrases.ts`) sans savoir que les slides de P6 existaient ; `rowsOf()` écartait en silence toute ligne mal formée, donc **chaque slide aurait perdu des lignes sans une erreur**. C'est le test de contrat de P6 (`deck-rows.test.ts`, le vrai `buildDeck` sur l'exemple §6.0, chaque sorte de ligne exercée) qui l'a dit, et rien d'autre. Le réalignement a trouvé dans la foulée que `DeckView` appelait `buildDeck` sans sa prose : les libellés dérivés sortaient vides, masqués parce que les slides réassemblaient leurs propres phrases par-dessus.

**Un seul endroit choisit les mots** (`lib/engine/phrases.ts`) : un stade dans une phrase est un groupe nominal avec son article (« Sans chiffre pour la rétention à J30 », jamais « pour La rétention ») ; la place d'une valeur se dit depuis le sens de la métrique (un churn en retard est **au-dessus** de son repère — le tableau, la fiche et la slide « peloton » passent tous par `positionLabel`, les clés « Sous le repère » aveugles au sens sont supprimées) ; un nom s'accorde avec le nombre imprimé. `sentences-guard.test.ts` balaie toutes les phrases que le moteur sait écrire (45 états × 2 langues, 17 règles, chacune sabotée pour prouver qu'elle mord).

**La promesse « rien ne quitte le navigateur » est un test, pas une phrase** : `e2e/engine-canary.spec.ts` plante un canari dans chaque champ libre et chaque nombre, joue tout le parcours jusqu'aux exports, enregistre chaque requête et échoue si l'une porte un canari ou si une requête non-GET part ; le `.json` téléchargé, lui, doit les contenir. Sabotage fait : un `fetch` POST de l'état dans `persist` produit 49 fuites listées. Les gardes statiques voient maintenant les `import()` dynamiques et les imports à effet de bord (`helpers/import-graph.ts`), `html-to-image` n'est permis qu'en import dynamique dans `export-png.ts`, et la règle 3 cherche aussi `createElement('img'|…)`, `location.*`, `window.open`.

**Le reste de P7** : le vocabulaire analytics fermé (`engine_opened`, `engine_stage_saved/<étape>`, `engine_request_copied`, `engine_deck_opened`, `engine_exported/<format>`, `engine_tour_linked`) exporté de `goatcounter.ts`, ajouté à la liste exacte de `goatcounter-api.ts` (R-11) et à `/admin/stats` ; titre ramené sous 60 caractères et couvert par `page-meta.test.ts` ; JSON-LD `WebApplication` + fil d'Ariane ; la page n'entre au sitemap que si le drapeau est ouvert au build ; la politique de confidentialité dit ce que le navigateur garde et ce qui est compté ; les glyphes que l'utilisateur tape sur une slide passent par `slideGlyphs()` (liste blanche §10.4 : un emoji ne fait plus de carré vide dans un PDF).

**Piège de build** : un dossier `.next` recopié dans un worktree fait échouer `next build` sur « next/font/google queries have exactly one entry » pour chaque police, ce qui ressemble à une panne réseau. `rm -rf .next`.

### Revue adversariale du diff intégré, et ce qu'elle a corrigé (2026-09-24/25)

Une fois les quatre chantiers intégrés, huit zones du diff sont passées chacune par un chercheur puis deux sceptiques chargés de réfuter. Les constats confirmés ont été corrigés en deux branches (`fix/review-a`, `fix/review-b`) ; ceux qui touchaient le jeu et le moteur ont été repris par leurs branches d'intégration. Deux corrections de ce fichier en sortent, faites en place : **une variable Vercel modifiée n'atteint que les nouveaux déploiements** (l'entrée R2-28 disait le contraire pour `METRICS_PAGE_ENABLED`), et **le runner Vitest sait rendre un composant** — `renderToStaticMarkup` n'a besoin d'aucun DOM et Vite rend les classes CSS Modules hachées en environnement `node` (`src/components/viz/__tests__/viz-markup.test.ts` en est le premier usage ; seul l'interactif demande l'e2e).

**Le reste ouvert côté DS dans l'entrée « Reprise anticipée » est fermé pour sa première moitié** : les aplats rouges sous petit texte blanc (`Tag tone="red"`, `StampedPillar`, badge roast) étaient à 4,42:1 dans les deux mondes. Un jeton sémantique `--surface-accent` (= `--paint-red-action`, 4,65:1) sert désormais tout aplat rouge sous texte, `--accent-mark` restant le rouge des traits et du grand texte ; les deux tests de contraste de jetons épinglent la paire.

**Pièges d'outillage de cette session à grande échelle** (à relire avant d'orchestrer plus de deux agents) : `vitest --coverage` n'écrit **aucun** rapport de couverture dès qu'un test échoue, donc les seuils ne sont jamais évalués — `--coverage.reportOnFailure` ; le processus `next-server` ne porte pas le port dans sa ligne de commande (seul son parent `sh -c next start -p N` le porte), on l'identifie par `readlink /proc/<pid>/cwd` ; `pgrep -f` avec un motif présent dans sa propre commande tue le shell ; après la suppression d'une route d'aperçu, `tsc` échoue sur `.next/types/validator.ts` jusqu'au prochain build ; un `tsc | head` suivi de `&&` masque l'échec de `tsc`.

### L'aperçu du jeu et du moteur devient celui du propriétaire seul (2026-09-25)

Demande d'Antoine : « aller en prod avec tout ça, mais avec un feature flag que moi seul pourrait activer ». Le jeu et le moteur étaient déjà fermés derrière `GAME_ENABLED` / `ENGINE_ENABLED` — mais **l'aperçu, lui, ne l'était pas** : `?game=preview` sur n'importe quelle URL posait un cookie qui valait `"1"`, et le paramètre comme la valeur sont écrits dans ce dépôt public. N'importe quel lecteur du code pouvait ouvrir les deux fonctionnalités en production. Ce n'était pas « moi seul ».

**Le mécanisme.** `src/lib/owner-preview.ts` : le cookie (`tdg_game_preview`, `tdg_engine_preview`, mêmes noms) vaut désormais une **signature HMAC-SHA256** de `tdg-owner-preview:v1:<fonctionnalité>` sous `ADMIN_DASHBOARD_PASSWORD`, en base64url. Le seul endroit qui la pose est `POST /admin/preview`, déjà derrière la Basic Auth du proxy ; la page elle-même (`src/app/(app)/admin/preview/`) montre l'état de chaque fonctionnalité et deux boutons, « Ouvrir sur ce navigateur » et « Refermer ». Le proxy (pages et images du jeu, page du moteur) et la page de résultat (encart du jeu) **vérifient** la signature ; `resolveGameAccess` / `resolveEngineAccess` prennent maintenant `{ env, ownerPreview: boolean }`, le verdict vérifié, plus jamais la valeur brute du cookie.

**Pourquoi le mot de passe admin comme clé** : c'est le seul secret qu'Antoine seul tape et qui existe déjà dans Vercel — zéro variable nouvelle, même contrat « échoue fermé » (pas de mot de passe, pas d'aperçu, pour personne), et le changer révoque d'un coup tous les aperçus émis. Le message est cloisonné par fonctionnalité : une signature du moteur recopiée dans le cookie du jeu n'ouvre rien (testé). Limite dite plutôt que tue : le cookie est un jeton porteur, et une signature volée permettrait en théorie une attaque hors ligne sur un mot de passe faible — d'où l'intérêt d'un mot de passe long, ce qui était déjà le cas.

**Trois décisions de forme :**
- **POST, pas GET.** Un GET qui bascule quelque chose est déclenché par le premier préchargeur de lien ou dépliant qui voit l'URL ; un test vérifie qu'un GET sur `/admin/preview?game=on`, même authentifié, ne pose rien. Le proxy répond 303 vers la page, donc un rechargement ne resoumet jamais.
- **Web Crypto, pas `node:crypto`** : le proxy reste indépendant du runtime (la règle de `constantTimeEqual`, qui déménage dans `src/lib/constant-time.ts` et reste réexporté par le proxy). Conséquence : `proxy` devient `async`, et les 45 appels de `proxy.test.ts` passent en `await`.
- **`Secure` posé sur HTTPS seulement** (`request.nextUrl.protocol`), pour que les specs contre `http://localhost` gardent le cookie.

**Aucune route ne perd son prérendu** : les 4 pages du jeu et les 2 du moteur restent `●` ; ce qui les ferme reste une réécriture du proxy vers une adresse sans route. Seule `/admin/preview` est dynamique, comme tout `/admin`.

**Les specs passent par le vrai chemin du propriétaire.** `grantOwnerPreview(request, …features)` (`e2e/helpers.ts`) fait le `POST /admin/preview` avec le mot de passe, et le cookie signé atterrit dans le bocal du contexte. Toutes les specs qui ajoutaient `?engine=preview` ou `?game=preview` y passent, et **sautent avec `SKIP_ADMIN_REASON` sans mot de passe** — jamais faussement vertes (R-11), jamais faussement rouges (R2-26). La CI pose déjà `ADMIN_DASHBOARD_PASSWORD: e2e-admin`. Nouvelles specs de sécurité, en bout en bout **et** en unitaire : `?…=preview` est inerte (404, aucun cookie), un cookie deviné (`1`, `true`, `preview`) ouvre rien, une signature sous un autre mot de passe ou pour l'autre fonctionnalité ouvre rien, pas de mot de passe ⇒ rien ne s'ouvre même avec un cookie jadis valide, et le tableau de bord ouvre puis referme réellement la page. Le jeton est aussi vérifié contre `node:crypto#createHmac`, pour que l'implémentation Web Crypto ne soit pas « une HMAC » seulement de nom.

**Non-vacuité mesurée finement, deux sabotages** : accepter la valeur `"1"` dans `hasOwnerPreview` fait tomber **exactement les trois** tests qui portent sur une valeur devinable ; déplacer le traitement du POST avant la barrière admin fait tomber **exactement** « asks for the password first ».

**Vérifié en réel** : `tsc`, `eslint`, 1 952 tests unitaires avec les seuils de couverture ; deux builds de production — **fermé**, c'est-à-dire exactement ce que la production recevra (420 specs vertes, 76 sautées par construction : l'état ouvert du jeu) et **ouvert comme la CI** (491 vertes, 5 sautées : les specs « jeu fermé »). Au passage, une garde existante a rappelé que tout `<main>` porte `id="main"` (cible du lien d'évitement) : la nouvelle page l'a oublié, la garde l'a vu.

**Mergé et vérifié en production le jour même** ([PR #164](https://github.com/ScratchMe/tourdegrowth/pull/164), squash `23292b0`, 548 fichiers — le premier merge sur `main` depuis le 2026-09-23). CodeQL avait levé six alertes « high » sur la PR, **toutes dans du code de test** (un décodage d'entités dans le mauvais ordre, une RegExp sensible à la casse, un retrait de balises en une seule passe, trois RegExp qui n'échappaient que le point) : corrigées plutôt que fermées, et la passe suivante n'en a plus trouvé. En production, par requête HTTP directe : `/fr/game`, `/en/game/retention`, l'image du jeu et `/fr/aarrr-funnel-template` en **404** ; `?engine=preview` et `?game=preview` en 404 **sans aucun `Set-Cookie`** ; un cookie `tdg_*_preview=1` forgé en 404 ; `/admin/preview` en **401** en GET comme en POST, sans cookie posé ; `/r/sample?game=preview` sans l'encart du jeu ; ni le sitemap ni le pied de page ne mentionnent le jeu ou le moteur ; `/fr/aarrr-vs-heart` (nouveau) en 200. **Ce qui n'est pas vérifiable d'ici** : le chemin positif en production, puisqu'il demande le vrai mot de passe admin, qui n'existe que dans Vercel — il est couvert en bout en bout contre un build de production, et c'est le premier geste d'Antoine ci-dessous.

**Ce qu'Antoine fait après le déploiement** : ouvrir `https://www.tourdegrowth.com/admin/preview`, taper le mot de passe admin, cliquer « Ouvrir sur ce navigateur » pour le jeu et/ou le moteur. Les anciens cookies `"1"` de son navigateur sont désormais refusés (inoffensifs, écrasés au premier clic). Ouvrir **pour tout le monde** reste une autre opération : poser `GAME_ENABLED` / `ENGINE_ENABLED` à `true` dans Vercel **puis redéployer** (VERCEL.md §1.11).

### « Démarre ton Tour » repart de zéro après un Tour déjà soumis (2026-09-25, signalé par Antoine)

**Le constat d'Antoine** : quelqu'un qui a déjà fait un Tour et revient ne repart pas de zéro en cliquant « Démarre ton Tour » ; pour refaire un Tour, il faut retrouver l'ancien résultat puis cliquer « Refaire le Tour ». Pénible, et on voit mal qu'on est dans un ancien Tour.

**La cause, plus grave que le symptôme.** `tdg.quiz.answers.v1` existe pour le Tour **en cours** : c'est lui qui permet de reprendre après un rechargement ou une soumission ratée (SPEC.md §4). Mais rien ne l'effaçait une fois le résultat créé. Au retour, `/quiz` voyait quinze réponses complètes et envoyait directement sur le dernier écran (segment, puis ton), **à un clic de soumettre à nouveau les réponses de l'ancien Tour**. Seul le bouton « Refaire le Tour » de la page de résultat vidait le stockage. Effet de bord sur la mesure : ce Tour-là ne commençait jamais par une première réponse, donc ni `quiz_started` ni `retake_started` (A4) n'étaient émis — la rétention de l'outil était sous-comptée précisément sur les visiteurs qui reviennent.

**Le correctif, en deux temps :**
- **À la création du résultat**, `handleGetScore` efface les réponses en cours, juste après les avoir rangées avec le résultat (`tdg.results.v1`, R-12). Un échec n'atteint jamais cette ligne : la promesse de l'écran d'erreur reste intacte.
- **Pour les navigateurs d'avant ce correctif**, qui gardent des réponses soumises : `isSubmittedTour(answers, results)` (`lib/quiz/storage.ts`, pur) les reconnaît à leur égalité exacte avec les réponses d'un résultat stocké, et `/quiz` repart alors de la question 1. Deux limites assumées et écrites sur place : un résultat d'avant R-12 ne porte pas ses réponses, donc rien n'est reconnu et l'ancien comportement se produit une dernière fois ; et un Tour en cours **identique à la réponse près** à un ancien serait remis à zéro par un rechargement avant soumission — il donnerait de toute façon le même score.

Un Tour **inachevé** reprend toujours là où il s'était arrêté : le correctif ne touche qu'un Tour déjà transformé en résultat.

**Vérifié en réel** : 3 tests unitaires sur `isSubmittedTour` (égalité exacte, une réponse ou une question de différence, résultats sans réponses) et `e2e/new-tour.spec.ts` (4 specs) : après un vrai parcours jusqu'au résultat, le stockage est vide et le CTA de la landing ouvre la question 1 ; un navigateur « d'avant » repart de zéro et sa première réponse émet bien `quiz_started` **et** `retake_started` ; un Tour complet non soumis et un Tour face à un résultat sans réponses reprennent sur le dernier écran. **Non-vacuité** : correctif retiré et build refait, exactement les 2 specs du correctif tombent, et les 2 qui protègent la reprise passent dans les deux états (ce sont des assertions compagnes).

### Premiers retours d'Antoine sur le jeu et le moteur (2026-09-25/26)

Antoine a joué une partie et essayé le moteur, puis envoyé une liste de retours : « C'est un début. Si on fixe tout ça, j'y verrai déjà plus clair. » Tout est traité, et reste derrière les deux drapeaux.

**Le jeu passe au modèle v2** (détail : `GAME-BRIEF.md` §16). Les chantiers n'apparaissent qu'une fois l'appel du DG raccroché. La main dit que deux chantiers, c'est ce que l'équipe produit peut livrer. Le questionnaire rend ses réponses dans le rapport du trimestre et débloque « Point données avec le DG », qui n'est plus distribué sans lui. Chaque rapport dit enfin **pourquoi le churn a bougé**, en cinq lignes : les chantiers du trimestre, ce qui tournait déjà, les astuces retirées après un contrôle, le bouche-à-oreille et le marché. L'attribution est séquentielle, avec un résidu, et les lignes s'arrondissent au plus fort reste pour que leur somme tombe exactement sur le mouvement des tuiles.

- **Choix assumé : rendre le mouvement lisible plutôt que le lisser.** Une simulation de ~55 000 années a montré que les sauts viennent du contrecoup différé de la confiance et du retrait forcé des astuces : c'est la leçon du jeu. Lisser reste possible si la lecture ne suffit pas.
- **Trouvé en route** : le rapport montrait l'effet d'une carte avec le bonus d'un questionnaire joué le même trimestre, qui n'avait pas encore agi (« Offre de pause : −5 % » au lieu de −4 %). Les effets sont maintenant lus avant l'arrivée des réponses, et le test unitaire qui encodait le bug est corrigé.
- `modelVersion` passe à 2 : une partie sauvegardée sous v1 est ignorée plutôt que reprise dans un monde qui ne tombe plus juste. Les parcours C et D ne sont plus jouables tels quels ; ils ont été remplacés par simulation et les fixtures régénérées.

**Le moteur : refonte de la saisie** (détail en tête d'`ENGINE.md`) :
- deux façons de remplir, le pas à pas (par défaut) ou le tableau ;
- une base commune : les inscrits de la cohorte étaient demandés cinq fois, ceux du mois deux fois ; ils se tapent maintenant une fois ;
- « Et si ? » sorti des fiches pour devenir un panneau qui redessine tout le funnel ;
- les explications pliées (les quinze fiches, « où le trouver », la liste à aller chercher) et les onglets supprimés ;
- la durée annoncée avant l'outil, comptée depuis les étiquettes d'effort du catalogue ;
- un exemple rempli en lecture seule, funnel et slides ;
- des réglages modifiables après coup.

Et les petits correctifs : l'effacement ignore la casse et le dit, le nom se dit « de ton SaaS ou de ton entreprise », et le peloton dit combien d'inscrits réels il ramène à 100.

**Deux défauts trouvés en vérifiant, pas en relisant :**
- **La base perdait la moitié de ce qu'on y tapait.** L'écran appelait `setBase` deux fois de suite ; les deux écritures partaient du même état, donc la seconde effaçait la première. C'est l'e2e qui l'a vu : la fiche d'activation ne reprenait pas les 800 inscrits. `setBase` prend maintenant toutes les valeurs en **une seule écriture**, et la spec vérifie la base stockée entière. **À retenir pour tout l'îlot** : une action qui écrit à partir de `current` ne s'appelle jamais deux fois dans le même tick.
- **Les deux cases de comptage se décalaient** dès qu'une seule avait une indication (« même nombre que pour… ») : la grille aligne le bas des champs, et l'indication soulevait l'une des deux. Les indications passent sous la paire. Vu sur une capture, mesuré ensuite (même `y` à 1280 et 390).

**Deux écarts, écrits plutôt que tus :**
- Sur le tableau, « Et si » est **plié** : le funnel qu'il redessine est déjà juste au-dessus, et deux funnels complets ouverts rallongeaient la page dont Antoine trouvait déjà qu'elle l'était trop.
- Le panneau « Et si » passait son curseur au parent par un effet, ce que le compilateur React refusait. Il devient une **render prop** : le curseur possède la cible, et il n'y a rien à garder synchronisé.

**Vérifié en réel** : 1 979 tests unitaires, seuils de couverture tenus, `tsc` et lint propres, `next build`. Côté Playwright, 506 specs : 501 passent et 5 sont ignorées par construction. Parmi elles, `e2e/engine-steps.spec.ts` (4 nouvelles) couvre le pas à pas, la base, l'exemple et les réglages. Les specs du moteur sont passées au nouveau parcours. Captures relues sur 27 écrans (FR desktop, FR et EN à 390 px), aucun défilement horizontal.

**Ce qui reste** : toute la copie neuve porte `TODO: à relire` et devra passer au prochain bon à tirer, en même temps que les nº7 et nº8.

**Vercel n'est plus une contrainte de cadence** (Antoine, 2026-09-26, en donnant le feu vert de ce merge). La convention 13 tient donc pour mémoire de ce que coûte un merge, plus comme une limite à respecter ; le détail de ce qui a changé côté compte reste à consigner quand il le précisera.

### La fin du trimestre en plein écran, et la FAQ du moteur dépliable (2026-09-26)

Deux retours d'Antoine, après une partie où la DGCCRF lui a retiré ses chantiers sans qu'il comprenne pourquoi : « ce n'est pas assez visible, on ne comprend pas pourquoi ça arrive » ; le bilan convient pour la relecture, mais il faut « un deuxième affichage choc », comme la fin de manche de *La Bataille du budget* — un écran qui masque tout et livre les news une par une. Puis, pour le moteur : « la FAQ aussi, on devrait la rendre dépliable ». Détail côté jeu : `GAME-BRIEF.md` §16.1.

**Une phase de plus, pas un effet par-dessus le bilan.** `lib/game/phases.ts` gagne `news` entre `running` et `report` ; sous `prefers-reduced-motion`, « Lancer » va directement à `news` (l'écran n'est pas sauté, seule son animation l'est). `settledPhase` ne rend jamais `news` : un rechargement pendant les news reprend sur le bilan. La vue (`island-view.ts#newsContent`) est construite depuis `reportContent` — les mêmes mots, jamais une seconde copie — et un test le vérifie carte par carte.

**Pourquoi un `<dialog>` modal et pas un calque.** `showModal()` met l'écran dans la couche supérieure et rend la page derrière inerte : pas de Tab, pas de lecteur d'écran qui y descend, et Échap arrive en `cancel` (traité comme « Passer au bilan »). Le focus reste sur le bouton principal d'une carte à l'autre, donc Entrée lit le trimestre d'un bout à l'autre ; chaque carte est annoncée par la scène, une région `polite` lue en entier. L'annonce « Fin du trimestre… » n'est faite que si les news ont été sautées — lues, elles l'ont déjà dite.

**Ce qu'une spec doit savoir** : une fois l'écran ouvert, rien derrière ne se clique. `e2e/game-helpers.ts` gagne `skipNews` et `readNews`, `pickAndRun` passe les news, et les phases enregistrées deviennent `hand → news → report` (et `hand → running → news → report` avec le mouvement). `e2e/game-news.spec.ts` (7 specs) : l'ordre des cartes, le chiffre du verdict, le contrôle du parcours C (le « pourquoi », les astuces nommées, le tampon « Amende · 106 000 € », le même « pourquoi » dans le bilan), Échap, le rechargement, et axe + débordement horizontal sur **chaque** carte à 1280 et 390 px.

**Deux défauts trouvés à la capture, invisibles à la relecture :**
- **Le bouton « Suivant → » passait sous la ligne de flottaison** sur la carte du contrôle à 390 px (le « pourquoi » l'allonge). Barre d'action collante au bas du dialogue, et le défilement repart en haut à chaque carte.
- « Passer au bilan » se coupait sur deux lignes (trois sur téléphone), et les segments de progression sortaient en lentilles : `--radius-round` vaut `50 %`, le rayon d'un disque, pas celui d'un segment (`--radius-tag`, comme `StageProgress`).

**Non-vacuité mesurée** : avec `show()` au lieu de `showModal()`, exactement les 4 specs qui dépendent du mode modal tombent (dont les trois qui ferment par Échap) ; sans la barre collante, seule la spec téléphone tombe, sur `toBeInViewport`.

**La FAQ du moteur** : chaque question devient un `core/Disclosure` fermé, sa réponse dedans. Le texte reste dans le HTML prérendu — un `<details>` fermé le garde, et c'est ce qu'un moteur de recherche lit — ce que la spec sans JavaScript vérifie désormais question par question. La question reprend le corps de texte (pas les capitales mono du résumé de `Disclosure`), pour se lire comme une question.

**Copie neuve, donc `TODO: à relire`** : le « pourquoi » du contrôle et des signalements, et toute la copie de l'écran (`news.*`). **Signalé, pas corrigé** : le mot du DG concatène deux répliques qui peuvent se contredire — au 3ᵉ trimestre du parcours C, « Ce n'est pas ce qu'on avait dit. » suivi de « Merci d'avoir fait ce que j'ai demandé. ». C'est la ligne du bilan telle qu'elle existait (verdict sur l'objectif + réaction à l'ordre) ; l'écran plein ne fait que la rendre plus visible. À trancher dans la copie.

**Vérifié en réel** : `tsc`, lint, **1 986 tests unitaires** (+7) avec les seuils de couverture, `next build` (jeu ouvert comme la CI), **514 specs Playwright** (509 passées, 5 ignorées par construction). Captures relues : FR 1280 (verdict, contrôle, mot du DG), FR et EN 390 (message, verdict, contrôle), FAQ FR 1280 et 390, aucun débordement.

### Moteur, deuxième série de retours : 17 chiffres, onglets, « Et si » cumulés et leurs slides (2026-09-26/27)

Antoine a rejoué le moteur après la refonte de la saisie et envoyé une deuxième liste : la question de statut posée à ce qui n'est pas un chiffre, les grands nombres illisibles à la frappe, la marge brute qui redemandait le MRR, un « Et si » sur le taux d'inscription qui ne montrait rien, les chiffres de croissance (MRR, NRR, GRR, CAC, LTV) absents du « Et si », l'activation qui devait aussi faire bouger J30, un « Et si » de parrainage, une slide par « Et si » plus une slide cumulée, le tableau à dérouler chiffre par chiffre, et le tampon du peloton décalé. Il a tranché une question en route : collecter l'expansion **et** la rétrogradation (17 chiffres). Détail côté spécification : le bloc « Deuxième série de retours » en tête d'`ENGINE.md`.

**Mené en trois agents parallèles puis intégré à la main** : A (17 chiffres, NRR/GRR calculés, base MRR partagée, petits correctifs), B (onglets par étape), C (les slides « Et si »). **C a été coupé par sa limite hebdomadaire** avant de committer ; son travail non committé a été repris par patch et fini ici plutôt que relancé. Les décisions de chacun sont dans leurs messages de commit et dans `ENGINE.md` ; les deux à connaître :
- **GRR = 100 − churn − rétrogradation, NRR = GRR + expansion**, toujours « approximatives » : le churn logo tient lieu de churn en revenu, et la slide le dit.
- **Le modèle « Et si » est à part** (`lib/engine/scenario.ts`) : huit leviers qui se composent, un funnel en personnes qui commence aux visiteurs, et chaque hypothèse qui a servi rendue avec le résultat. `impact.ts#whatIf` reste la chaîne de la slide `leak`.

**Ce que la vérification a trouvé, et qu'aucune relecture n'aurait vu :**

1. **Les slides « Et si » débordaient toutes sous leur pied de page.** Le nouveau `e2e/engine-deck-whatif.spec.ts` mesure le bas du corps contre le haut du pied, avec les huit leviers déplacés : 8 slides en défaut en français (la slide « ensemble » de ~450 px), 2 en anglais. En cause, trois choses mesurées sur capture en pleine résolution : des tableaux au corps de 24 px dont la colonne des libellés passait à trois lignes (« Nouveau MRR par mois »), un pied de page d'hypothèses de 4 à 7 lignes en chasse fixe, et trois tableaux côte à côte sur la slide « ensemble ». Tableaux à 20 px, pied dense (15 px, plus large), et la slide « ensemble » ramenée à deux colonnes (leviers | chiffres de croissance + effet composé) : **le funnel n'y est plus**, il reste sur chaque slide de levier et dans l'export texte. C'est un choix, pas un oubli.
2. **Deux fautes d'arrondi du même genre, à deux endroits.** Sur les slides, un écart collait son signe au tilde (« +~6 600 € ») ; il s'écrit maintenant « +6 600 € », la colonne « avec » juste à côté portant déjà le « ~ ». Dans le panneau, les écarts étaient imprimés **au centime** (« +29 916,28 € » sous une tuile « ~130 000 € ») : tout montant projeté est arrondi à deux chiffres significatifs, comme les slides. Un test unitaire interdit « +~ » dans un écart ; sabotage mesuré.
3. **Bouger le dernier curseur faisait sortir les chiffres de l'écran** : huit leviers font deux fois la hauteur des tuiles. La colonne des chiffres est collante sur ordinateur, et un e2e vérifie que la tuile du MRR reste visible pendant qu'on bouge l'ARPA — il échoue sans la règle.

**Trois pièges à retenir :**
- **J'ai d'abord lancé les tests unitaires du moteur seuls**, et annoncé l'état sur cette base. La suite complète a trouvé ce qu'ils ne pouvaient pas voir : le test de frontière (`engine-boundary.test.ts`) exigeait encore que l'îlot atteigne `WhatIf.tsx`, supprimé, et deux specs e2e (`engine-steps`) parlaient encore de 15 chiffres et ouvraient les fiches par les lignes d'étape que B a supprimées. Un changement qui retire un fichier se vérifie sur **toute** la suite, pas sur le dossier touché.
- **`locator("summary")` est devenu ambigu** le jour où le panneau « Et si » a contenu son propre dépliant (les hypothèses) : `getByTestId(…).locator(":scope > summary")` vise le résumé du pli lui-même. Même piège que les `getByRole` de `Disclosure` (le nom accessible n'est pas le texte visible) : un conteneur générique ne se cible pas par un descendant générique.
- **Une capture d'élément plus haute que la fenêtre montre les éléments `position: fixed` là où ils ne sont pas.** Le lien d'évitement (« Aller au contenu », translaté hors écran) apparaissait en « tenu » par-dessus le diagnostic sur la capture du tableau. Vérifié sur une capture de la fenêtre au même endroit : rien. Avant de corriger un chevauchement vu sur une capture d'élément, le reprendre en capture de fenêtre.

**Ménage.** Le panneau cumulé a laissé du mort : `lib/engine/projection.ts` (lu par ses seuls tests), l'échelle de cibles et le passe-plat vers `chainTemplate` de `visual-model.ts`, et 17 clés de copie que plus rien ne lit — vérifiées une à une, accès dynamiques compris (`whatIfPointsOne` reste : `numbered()` le lit). Les tests de choix de phrase qui passaient par le passe-plat ont été **déplacés** sur `chainTemplate` dans `phrases.test.ts`, pas supprimés : une partie de ce qu'ils couvraient n'était couvert nulle part ailleurs.

**Vérifié en réel** : `tsc`, `eslint`, **2 063 tests unitaires** avec les seuils de couverture, `next build` (build comme la CI), **539 specs Playwright** (534 passées, 5 ignorées par construction). Captures relues : les neuf slides « Et si » en FR et EN à pleine résolution, le tableau en onglets et le panneau à 1280 et 390 px, sans défilement horizontal. **Toute la copie neuve porte `TODO: à relire`** — le bon à tirer nº8 du moteur est antérieur à cette série et devra être reconstruit depuis le grep.

### L'installeur de plug-ins de Ramille, porté (2026-09-27)

Demande d'Antoine : installer ici le mécanisme construit pour Ramille le 24/09/2026 (ScratchMe/Ramille#261, commit `aa06744`). Le fait qui le rend nécessaire, la commande et les règles sont dans la section « Les plug-ins s'installent à la main, dans le dépôt », en tête de ce fichier. Aucun plug-in n'est installé : chacun se décide avec Antoine, un par un.

**Copié, pas réécrit.** `scripts/installer-un-plugin.mjs` et son test viennent de Ramille, inchangés là-bas depuis `aa06744` (vérifié dans l'historique du dépôt cloné). Ce qui a changé au passage :
- **L'interface reste celle de Ramille** : nom du script, options en français (`--prefixe`, `--manuel`, `--retirer`…), dossier `.claude/plugins-importes/`, clés d'`installation.json`. C'est un choix, pas un oubli : un même mécanisme doit se lire pareil dans les deux dépôts, et une provenance copiée de l'un doit pouvoir être retirée par l'autre.
- **Le reste suit ce dépôt** : commentaires, messages et noms internes en anglais, comme tout le code ici. L'avis posé dans un fichier modifié dit « Modified for Tour de Growth », et les dossiers temporaires commencent par `tdg-`.
- **Le test passe de Jest à Vitest**, sous `src/__tests__/` comme les autres tests de scripts (`vercel-config.test.ts`, `utm-channels.test.ts`), donc il tourne en CI avec le reste.

**Rejouer les mutations n'était pas optionnel.** Le portage change la langue des messages sur lesquels le test s'appuie, donc les quarante-quatre mutations passées à Ramille ne prouvaient plus rien ici. Dix-huit ont été rejouées par un harnais qui refuse un remplacement qui ne s'applique pas exactement une fois, puis restaure le script octet pour octet : au moins une par famille, dont les six que la demande nommait. Chacune fait tomber le test attendu, et lui seul, avec les mêmes comptes qu'à Ramille. La liste est en tête du fichier de test.

**Un test de plus, propre à ce dépôt.** Il vérifie qu'ESLint ignore `.claude/` (par `isPathIgnored`, pas en relisant la config) et que `tsconfig` l'exclut. Les deux exclusions existaient déjà pour les worktrees des workflows. Un plug-in qui apporte des scripts ferait sinon rougir la CI sur du code qu'on n'a pas écrit. Les deux gardes tombent quand on retire l'exclusion. Le chargement d'`eslint-config-next` prend plusieurs secondes : ce test a un délai de 60 s.

**Piège trouvé en écrivant l'étape CI** : `command -v unzip zip python3` sort en 0 même quand un des trois manque, parce que bash se contente d'en trouver un. La première version de l'étape ne vérifiait donc rien, et on l'a vu en l'essayant sur un nom qui n'existe pas. Elle teste maintenant un outil à la fois, et ce contre-exemple a été rejoué.

**Vérifié** : `tsc` et `eslint` propres, **2 093 tests unitaires** (+30) avec les seuils de couverture. La CLI a été lancée dans ce dépôt sans rien écrire : usage, option inconnue et `--retirer` d'un plug-in absent sont refusés en sortie 1.

### Le plug-in Claude Code Setup, joué sans être installé, et l'outillage qui en sort (2026-09-27)

Premier plug-in apporté par Antoine après l'installeur, avec une consigne nouvelle : « on ne l'installe pas mais on le joue ». Claude Code Setup (Anthropic, Apache 2.0) ne contient qu'un skill en lecture seule, qui analyse un dépôt et recommande de l'outillage Claude Code : serveurs MCP, skills, hooks, sous-agents, plug-ins.

**L'installeur a servi de lecteur.** Passé sur l'archive avec `--racine` vers un dépôt jetable, c'est son premier passage sur un vrai plug-in hors Ramille : 6 fichiers, aucun hook, aucun connecteur, aucun script. Les cinq « liens morts » qu'il signale sont des exemples de code dans une référence, pas de vrais liens. Le dépôt n'a pas bougé (`git status` vide).

**Joué, le skill a surtout trouvé ce que ses listes ne couvrent pas** : `CLAUDE.md` faisait 591 000 caractères, dont 93 % de journal, soit environ 150 000 tokens chargés dans chaque session. Claude Code avertit dès 40 000. Antoine a validé toutes les recommandations.

**Le découpage.** Le journal part tel quel dans `JOURNAL.md`, sans un mot changé : 41 702 + 549 451 = 591 153 caractères, rien de perdu. `CLAUDE.md` garde les règles, la table des déclencheurs (qui gagne `JOURNAL.md`), l'état courant et les conventions. Il descend à environ 39 000 caractères.
- **Pour les 134 renvois à `CLAUDE.md` du dépôt, une redirection plutôt qu'une réécriture.** Ceux qui visent une règle, une leçon ou une convention restent justes. Ceux qui visent une entrée (« étape 5 », « R-12 ») sont couverts par une phrase en tête de `CLAUDE.md` et du journal : un renvoi antérieur au 2026-09-27 désigne une entrée de `JOURNAL.md`. Retoucher une quarantaine de fichiers de code pour des commentaires aurait été du bruit. Ont en revanche été corrigés les documents vivants qui disent où écrire la **prochaine** entrée : `AUDIT-PLAN.md`, `GROWTH-PLAN.md`, `ENGINE.md`, les en-têtes des six fichiers d'outil et le README public.
- L'état du projet perd trois lignes closes (l'alerte CodeQL, les jetons des images de partage, la phase 1 de l'audit). Le coût Gemini détaillé part dans `GEMINI.md` §2.2, et les paragraphes historiques sont condensés : leur histoire est dans le journal.
- **Le budget est un test** (`src/__tests__/claude-md-budget.test.ts`) : `CLAUDE.md` doit rester sous 40 000 caractères. Non-vacuité : en y recollant le journal, exactement ce test tombe.

**La doc de Next est déjà sur le disque.** `node_modules/next/dist/docs/` contient 452 fichiers pour la 16.3.4. On y lit `revalidateTag(tag, profile)` et la dépréciation de la forme à un argument, un des pièges du journal. C'est ce que sert l'outil `nextjs_docs` du serveur MCP officiel ; ses autres outils demandent un `next dev` qui tourne, donc pas de MCP. `NEXTJS.md` gagne un §1.0, et la table des déclencheurs le cite.

**Le hook** (`.claude/settings.json` et `.claude/hooks/refuse-edits-on-main.mjs`) refuse tout Edit, Write, MultiEdit ou NotebookEdit dans ce dépôt tant que la branche courante est `main` : c'est la convention 2, écrite après la PR #50 vide.
- Contrat vérifié dans la doc de Claude Code avant d'écrire : `file_path` pour les quatre outils, sortie 2 qui bloque avec stderr montré à l'agent, `$CLAUDE_PROJECT_DIR` exporté. Les hooks sont relus à chaud.
- **Il échoue ouvert** (entrée illisible, pas de git) : c'est une garde contre une erreur, pas une frontière de sécurité. Il ne regarde que ce dépôt, donc un clone dans le scratchpad ou un worktree de workflow passent. **Une écriture par Bash passe à travers**, et c'est dit dans le fichier.
- 10 tests sur de vrais dépôts git temporaires. Non-vacuité, trois sabotages : sans branche protégée, les trois refus tombent ; sans le contrôle « même dépôt », le clone tombe ; **le cas du worktree ne tombe que si l'on retire aussi la lecture de la branche du fichier**. Deux mécanismes le tiennent à la fois, ce que ma première version de l'en-tête affirmait à tort autrement.
- **Vérifié en réel dans cette session** : sur un `main` local pointé sur le même commit, un vrai Edit a été refusé avec le message. Retour ensuite sur la branche, `main` local remis sur `origin/main`.

**Les deux skills** (`.claude/skills/`), appelables par Antoine seulement (`disable-model-invocation: true`) :
- `/livrer` : la séquence de merge, jusqu'ici dispersée entre les conventions et quatre fichiers d'outil.
- `/bon-a-tirer` : construire puis appliquer un bon à tirer. Il repart du gabarit du dernier publié plutôt que de réécrire le moteur de la page, et le contrat `cards/<id>` a été relu sur la page nº8 (`status`, `note`, `reply`, lecture par `snap.docs` puis `data()`).

**Les deux sous-agents** (`.claude/agents/`) sont en lecture seule (Read, Grep, Glob) : `relecteur-securite` et `relecteur-copie`, chacun avec une checklist propre au dépôt.
- Chaque chemin cité a été vérifié ; un seul n'existait pas et a été retiré.
- Chaque affirmation a été confrontée au code : les règles de `copy-typography.test.ts`, les en-têtes de `next.config.mjs`, les déclencheurs des workflows.
- Pas de champ `model` : ils héritent de la session, et aucun identifiant de modèle n'entre dans le dépôt.

**Pas construit, volontairement** : le lint ou le type-check après chaque édition (mesuré à environ 7 s par édition) et le hook `Stop` sur `tsc`, proposé comme option et non comme recommandation. Ce sont deux lignes de `.claude/settings.json` si Antoine les veut.

**Vérifié** : `tsc` et `eslint` propres, **2 105 tests unitaires** (+12), seuils de couverture tenus. Ce travail rejoint la PR #169 : la branche de travail est unique et portait encore l'installeur, non mergé.

### Quatre plug-ins passés en revue, un seul installé : Data, en manuel (2026-09-27)

Antoine a apporté quatre archives (Security Guidance, Product Tracking, Engineering, Data) et demandé un avis avant toute installation, comme le veut la règle des plug-ins. Chacune a été lue dans le scratchpad, puis passée à l'installeur **dans un dépôt jetable** (`--racine`) : c'est le seul moyen de voir ce qu'il poserait et ce qu'il signalerait sans rien écrire ici.

**Écartés, avec la raison qui a tranché :**
- **Security Guidance** : uniquement des hooks, donc l'installeur le refuse (« nothing this script installs »). Le brancher serait un câblage à la main de Python dans `.claude/settings.json`. Surtout, il relit le diff avec Opus **à chaque fin de tour et à chaque sous-agent** (nos workflows en lancent jusqu'à dix), sur le même forfait qui a déjà coupé un agent ; il installe le SDK Agent par pip à chaque démarrage de session ; et son modèle de revue par défaut est un identifiant codé en dur sans repli (leçon nº3). CodeQL, `relecteur-securite` et les gardes statiques couvrent déjà l'essentiel. Piste si un jour : la seule revue au commit (`ENABLE_STOP_REVIEW=0`), à l'essai sur une branche.
- **Product Tracking** (auteur : Accoil, un éditeur d'analytics) : pensé pour un SaaS B2B avec comptes (`identify`, `group`), 24 destinations dont pas GoatCounter. Il contredit le produit (ni compte ni identification, promis par la politique de confidentialité) et créerait dans `.telemetry/` un second plan d'événements à côté de celui de `goatcounter.ts` — le piège de R-11. Son agent se déclare « à utiliser de lui-même », en arrière-plan, avec le terminal. À l'essai à blanc, le nom dépassait 64 caractères sans `--prefixe`. Sa place est dans les missions d'audit d'Antoine, depuis son compte, pas dans ce dépôt.
- **Engineering** : dix skills génériques dont nos versions sont plus précises (`/livrer`, `relecteur-securite`, `TESTING.md`), un standup et une gestion d'incident faits pour une équipe d'astreinte, dix connecteurs sans usage ici. Ses descriptions se déclencheraient sur des phrases courantes et plaqueraient des consignes génériques sur nos conventions. L'archive n'a pas de licence.

**Installé : Data, en `--manuel`**, décision d'Antoine sur recommandation. La plupart de ses skills ne s'appliquent pas (SQL d'entrepôt, graphiques Python ou Chart.js), mais `validate-data` est une check-list de méthode (dénominateur qui glisse, moyenne de moyennes, biais de survie) qui vise exactement la classe d'erreur du K-factor (R2-01), et `statistical-analysis` sert à lire les chiffres du lancement. En `--manuel`, rien n'est chargé dans les sessions et tout reste appelable par son nom ; les trois skills que l'amont réservait à l'agent sont rendus à la personne.

**Relu avant de committer** : l'en-tête des dix skills (`disable-model-invocation` partout, noms préfixés, l'avis de modification présent dans les dix), les renvois à `CONNECTORS.md` réécrits vers la provenance, aucune publicité, aucune consigne de git ni d'écriture hors d'un fichier de sortie. Les deux adresses signalées sont les CDN de Chart.js **avec intégrité SRI**, dans un gabarit de tableau de bord HTML autonome. Le script Python signalé zippe un dossier de skill en local, sans réseau. Les huit connecteurs (Snowflake, BigQuery, Amplitude…) ne sont pas installés.

**Règle du dépôt qui passe devant les consignes du plug-in** : ses skills disent d'enregistrer un tableau de bord ou un graphique dans un fichier. Appliqués aux chiffres privés (`/admin/stats`, Search Console), ces fichiers vont dans le scratchpad, jamais dans le dépôt public. C'est écrit dans `CLAUDE.md`.

**Vérifié** : lint, `tsc` et tests unitaires, dont celui de l'installeur qui vérifie que `.claude/` reste hors du lint et du type-check.

### Cinq autres plug-ins passés en revue : Design installé en manuel, le reste lu sans être installé (2026-09-27)

Deuxième lot d'archives apporté par Antoine, pour un plan qu'il a fixé : **auditer le design kit, proposer cinq alternatives de design (deux qui gardent l'identité, trois qui en changent), puis améliorer le kit selon l'audit**, quel que soit le choix. Chaque archive a été lue dans le scratchpad, et les quatre installables sont passées à l'installeur dans un dépôt jetable avant toute décision.

- **Design (Anthropic) : installé en `--manuel`**, sur décision d'Antoine. Sept skills (critique, accessibilité, système, copie d'interface, handoff, recherche). L'archive ne porte pas de licence : l'Apache 2.0 est jointe par `--licence`, avec le texte de l'archive Data (même dépôt d'amont, anthropics/knowledge-work-plugins), comme CLAUDE.md le prévoyait pour Design. Les neuf connecteurs (Figma, Slack…) ne sont pas installés. Relu : rien qui se déclare incontournable, aucune commande shell, aucune adresse.
- **UI UX Pro Max** : pas installé, décision d'Antoine. Il sert à l'audit depuis le scratchpad (moteur de recherche local, références), comme le 2026-09-24.
- **Modern Web Guidance** (Google Chrome) : pas installé. Son skill se déclare « MANDATORY: Execute FIRST for all HTML/CSS », et chaque usage lance `npx -y modern-web-guidance@latest` — la dernière version d'un paquet npm, téléchargée et exécutée sans version fixée. Ses 147 guides sont dans l'archive : ils sont lus comme référence pour l'audit, sans rien exécuter.
- **SearchFit SEO** : pas installé. Même publicité que sur Ramille (plusieurs skills finissent par « try SearchFit.ai at … »), trois agents, et l'audit SEO v1 est déjà fait.
- **Product Management** (Anthropic) : pas installé pour l'instant. Rien dans le plan ne s'en sert, et le travail de PM d'Antoine a lieu dans Cowork.

**À savoir pour l'audit qui suit** : le 2026-09-24, les mêmes versions de Design (1.2) et d'UI UX Pro Max (2.13) ont déjà servi à l'audit dont est sorti le design system v3. Le nouvel audit part donc de l'état v3, des écrans qui n'existaient pas alors (fin de trimestre du jeu, onglets et slides « Et si » du moteur) et des trois points que la v3 avait laissés ouverts.

**Piège d'outillage rencontré** : pour l'essai à blanc, recopier `.claude/` entier dans le dépôt jetable a pris plus de deux minutes, parce que `.claude/worktrees/` garde les worktrees des workflows d'agents du 2026-09-24, avec leurs `node_modules`. Ne recopier que `.claude/skills` et `.claude/plugins-importes`. Et, une fois de plus, `pgrep -f` avec un motif présent dans sa propre ligne de commande a tué le shell (sortie 144) : utiliser un motif du type `'du -s[h]'`.

### Audit SEO du 25/09 : ce qui restait vraiment, point par point (2026-09-28)

Antoine a apporté une mission en sept lots, écrite d'après un audit SEO fait sur un build de `7ff07aa`. **Le lot 0 a montré que le constat était en grande partie périmé** : la PR #164 du 25/09 avait déjà livré l'« audit SEO v1 » (entrée « Reprise anticipée »), qui corrigeait les points 1 à 3 et une partie de 4 et 5. Mesuré sur un build de `main` avec l'URL de production, en relisant les 74 URL du sitemap (72 + `/aarrr-vs-heart`, ajoutée par #164) : 0 page sans image de partage, 0 titre au-delà de 60 caractères, 0 description hors 70-160, et la base intacte (200, `lang`, canonical, hreflang réciproque, un seul h1, JSON-LD lisible, 0 lien cassé). Arrêt avant de coder, comme la mission le demandait sur un fait faux.

**La méthode de décision, à reprendre** : Antoine traverse une période où la concentration est limitée. Un rapport de six décisions d'un coup était trop ; il a demandé les points un par un, chacun avec une explication courte, les options et une recommandation. Six questions à un clic, puis tout le travail d'une traite, sans le faire attendre entre deux questions. Il a suivi la recommandation sur les six.

**Ce qui a été fait, un commit par point :**
1. **Images de partage** : rien à corriger, la garde est complétée (`twitter:image` identique à `og:image`, PNG 1200×630 lu dans ses octets). La réexportation du fichier d'image par segment, préférée par la mission, a été écartée sur une mesure : **le `?<hash>` d'une image-fichier est un hash du fichier source, pas de l'image** (`NEXTJS.md` §1.3). Les commentaires qui le présentaient comme un rafraîchissement ont été corrigés.
2. **Titres et descriptions** : copie et `metaTitle` gardés (la règle mécanique de la mission aurait produit « North Star Metric — métrique phare — Tour de Growth »). Une garde nouvelle sur chaque URL du sitemap : un h1, canonical sur soi, trio hreflang réciproque, JSON-LD qui se parse.
3. **Maillage** : la décision écrite « le bloc « comparé à » reste sur AARRR seul » est levée par Antoine. `TERM_COMPARISONS` : AARRR → les cinq comparatifs, North Star → `aarrr-vs-north-star-metric`, growth loop → `aarrr-vs-growth-loops`, rétention → `aarrr-vs-rarra`, plus AARRR → la page méthode. Pages sources recomptées : méthode 3 → 4, trois comparatifs 7 → 8. Deux libellés neufs à relire : « Comparatif lié » (d'abord « Comparé à AARRR », faux sur la page rétention, qui est une étape d'AARRR et non l'autre côté du comparatif — relevé par `relecteur-copie`) et « Mettre AARRR en pratique ».
4. **Données structurées** : `@id` `…/#app` sur le `WebApplication` de la landing (celui que déclare l'étude de cas du site CV), repris par `AboutPage.about`, pas sur celui du moteur ; `og:type` `article` et `article:*` sur les 14 pages Article, avec les dates d'`articleDates`. La publication de HEART passe au 25/09 (jour de mise en ligne, pas d'écriture).
5. **Redirection de `/`** : 307 au lieu de 308, et `Cache-Control: no-store` sur toutes les redirections de langue. **Le bug décrit était réel en local et masqué en production** : Vercel ajoute `max-age=0, must-revalidate` à un 308 du proxy, `next start` rien (`VERCEL.md` §1.8). Mesuré dans Chromium dans les deux configurations, la seconde via un relais local qui pose exactement l'en-tête de production (Chromium ne fait pas confiance au certificat du proxy du bac à sable, et la vérification TLS n'a pas été désactivée).
6. **Liens vers le CV** : `cvUrl(locale)` ; les pages anglaises (pied de page, `/about`, crédit et carte du Deep dive sur le résultat) ouvrent `/en/`, vérifié en ligne le jour même. L'identité JSON-LD ne bouge pas.

**Pièges de la journée** :
- **Tout `route()` de Playwright désactive le cache HTTP de Chromium** : le premier essai du point 5 n'a pas reproduit le bug pour cette seule raison, et la fixture `page` du dépôt en pose un. Le test du point 5 lance son propre contexte persistant (`TESTING.md` §4).
- Un `pgrep -f` dont le motif figure dans la commande a encore tué le shell une fois (déjà dans `TESTING.md` §4) : `pgrep -f 'next-serve[r]'` puis comparaison de `readlink /proc/<pid>/cwd`.
- Ajouter un lien « AARRR vs RARRA » sur la page rétention a rendu ambigu un sélecteur `getByRole("link", { name: "AARRR" })` d'une autre spec (correspondance partielle par défaut) : rendu `exact`.

**Non-vacuité, trois builds sabotés** : (a) repli d'image retiré → exactement les 20 pages qui en dépendent tombent ; second h1, canonical faussé, `x-default` retiré, JSON-LD illisible → la garde du point 2 nomme exactement ces pages ; (b) réciprocité hreflang faussée, bloc « comparé à » réduit à AARRR, `@id` par langue, dates d'article retirées ou incohérentes → chaque test nomme ses cibles ; (c) le test du navigateur contre l'ancien proxy échoue sur la dernière étape (`/fr` au lieu de `/en`), la spec des liens CV contre l'ancien build nomme exactement les pages anglaises. Plus une garde statique (aucune adresse brute du CV dans un composant), sabotée en place.

**Relectures** : `relecteur-copie` (le libellé ci-dessus, et un marqueur « à relire » par chaîne plutôt qu'un pour deux) et `relecteur-securite` (rien de bloquant ; `~NOTFOUND` plutôt que `0.0.0.0` dans `--host-resolver-rules`, puisque 0.0.0.0 désigne la machine locale sous Linux), les deux appliqués.

**Vérifié**, build avec `GAME_ENABLED=true` comme la CI : lint et `tsc` propres, **2 113 tests unitaires** (+8), seuils de couverture tenus, `next build` propre, **545 specs Playwright** (+6 : 540 passées, 5 ignorées par construction), puis les specs touchées rejouées après les retouches des relecteurs. Les critères de chaque point sur un build avec l'URL de production (`@id` exact, 14 `og:type` article, 307 et 308 au `curl`, liens CV).

**À faire par Antoine après le merge** : passer une page comparatif et la checklist dans le Post Inspector de LinkedIn ; tester `/en`, `/en/aarrr-vs-okr` et `/en/glossary/activation` dans le test des résultats enrichis de Google ; au prochain run `gsc`, comparer les impressions des comparatifs et de la page méthode.

### Audit du design kit, puis les correctifs qui ne dépendent d'aucun choix (2026-09-27 → 28)

**L'audit** (artifact « Audit du design kit », privé, dans le scratchpad pour ses sources) : le kit v3 audité avec le plug-in Design, UI UX Pro Max (lu, pas installé), la méthode « review » de transitions.dev et les guides Modern Web de Chrome, et relevé sur 136 écrans réels (FR/EN × 1280/390, jeu et moteur ouverts). 27 constats nouveaux, aucun critique ; complétude moyenne 9,15/10. **transitions.dev ne s'installe pas en skill** : sa licence interdit de redistribuer la collection, et un dépôt public redistribue. On s'en sert comme référence ; seules des transitions adaptées une à une entrent dans notre CSS, sous nos noms de jetons.

**Les décisions d'Antoine (2026-09-28)**, prises par questions une à une (l'encadré « Ce que j'attends de toi » de l'artifact, rédigé en constats, ne se lisait pas comme quatre questions — il ne l'a pas vu) :
1. **Cinq directions à maquetter : A « Jour de course », B « Affiche et carnet de route »** (gardent l'identité), **H « Heure bleue », E « Le Journal du growth », F « L'arcade du côté obscur »** (en changent). C, G et D écartées.
2. **Un Tour, trois étapes** pour enchaîner le quiz, le moteur et le jeu ; en plus, un élément visuel qui distingue les trois espaces.
3. **« Et si » s'aligne sur les slides** : plus de rouge pour un levier bougé ni pour un gain projeté.
4. **Feu vert pour les correctifs indépendants, avant les alternatives.**

**Ce qui est livré ici :**
- **S-1, le mouvement de marque ne jouait pas, depuis la migration v2 (#14).** `tdg-stamp` et `tdg-pulse` étaient des `@keyframes` globales nommées depuis quatre CSS Modules (ScoreDisplay, StageProgress, EndingHero, QuarterNews) ; Lightning CSS scope un nom d'animation comme une classe, la référence devenait `…module__…__tdg-stamp`, et le navigateur ne crée aucune animation pour un nom inconnu (vérifié dans Chromium : 0 animation). Lightning CSS n'a pas d'échappement `global()` pour un nom d'animation : il le recopie tel quel. Les keyframes vivent maintenant dans `styles/motion.module.css` ; un consommateur fait `composes: stamp from …` et ne pose que des longhands (le raccourci remettrait `animation-name` à `none`). Gardes : `motion-keyframes.test.ts` (tout nom d'animation d'un module a sa keyframe dans le même fichier ; aucun raccourci sur une classe qui compose) et `e2e/motion.spec.ts` (`document.getAnimations()` sur `/r/sample` et `/quiz`). `accessibility.spec.ts` attend désormais la fin des animations finies avant axe, sans quoi il mesurerait un score à mi-fondu. Le réglage du tampon (260 ms, dépassement) reste pour la passe d'amélioration : il n'avait jamais été vu.
- **S-2, `/design-sync` se reconstruit** : `QuarterNews` dans `componentSrcMap`, un aperçu en trois histoires, et `conventions.md` dit « une seule modale ». L'aperçu contient la modale : `showModal()` sort de tout ancêtre transformé, alors `InFrame` masque `showModal` sur cette seule instance dans un effet de layout (qui passe avant l'effet du composant), et le composant prend son repli documenté. Bundle reconstruit et validé : 71 composants, 71 aperçus rendus proprement, un troisième avertissement permanent `[GRID_OVERFLOW] QuarterNews` expliqué dans `NOTES.md`. **La CI ne construit pas le bundle** : c'est l'audit qui a trouvé la casse, deux jours après.
- **S-4, « Et si »** : la grille des sept tuiles était elle-même une région `aria-live`, relue à chaque cran de curseur, sous un commentaire qui promettait l'inverse. Une seule phrase (`kpiAnnouncement`, les chiffres qui ont bougé), écrite 500 ms après le dernier mouvement ; rien à l'ouverture (une référence, pas un drapeau de premier rendu, pour que le double effet de développement de React ne l'annonce pas) ; les `<output>` des leviers en `aria-live="off"` (le curseur dit déjà sa valeur).
- **S-5, pas de rouge dans « Et si »** : levier bougé en gras souligné d'un filet plein, points gagnés en anneau à centre plein, perdus en anneau barré, comme la grammaire des slides. `whatif-no-red.test.ts` lit les jetons rouges dans `colors.css` (le lien et l'anneau de focus exceptés : conventions d'interaction) et n'en admet aucun dans le module.
- **Copie du moteur** : « Quinze chiffres, trois par étape » → « Dix-sept chiffres, trois par étape et cinq pour Revenue » ; l'intro du catalogue et « Et cinq chiffres calculés » (la page en listait cinq sous « trois »). Tout en « à relire ». `engine-copy-counts.test.ts` lit les comptes dans le catalogue et exige que la copie les dise. `updated-at` de la page du moteur au 2026-09-28.

**Relecture** : `relecteur-copie` a relevé que le français garde « Revenue » comme nom d'étape (« pour les revenus » corrigé), un marqueur « à relire » qui ne couvrait pas explicitement trois clés, la date de la page, et quatre écarts de l'aperçu `QuarterNews` avec le produit (ordre des cartes, « Revenu », « 0.1 pts » de `formatPoints`, texte entier du contrôle et son « pourquoi ») — tous corrigés, « 0.1 pts » aussi dans les aperçus `QuarterReport` et `GameJournal`.

**Non-vacuité** : les trois gardes unitaires rougissent chacune sur son sabotage (comptes écrits dans chaque fichier). Build saboté (ScoreDisplay revenu à `animation: tdg-stamp`, `aria-live` remis sur les tuiles) : exactement la spec du tampon et celle de S-4 tombent ; la pulsation et la spec « mouvement réduit » restent vertes.

**Pièges** : la branche de travail avait été supprimée d'office après le merge de #171, donc `--force-with-lease` refusait (« stale info ») : `git fetch --prune` puis un push simple. Chromium de Playwright refuse le certificat du proxy pour Google Fonts : pour l'aperçu local de l'artifact, les polices ont été téléchargées par `curl` (qui lit le CA), jamais en désactivant la vérification.

**Vérifié**, build avec `GAME_ENABLED=true` comme la CI, sur le code final : lint et `tsc` propres, **2 125 tests unitaires** (+12), seuils de couverture tenus, `next build` propre, **549 specs Playwright** (+4 : 544 passées, 5 ignorées par construction). À l'écran (build local, aperçu propriétaire) : « Et si » en FR à 1 280 px et en EN à 390 px (leviers bougés en gras souligné, points gagnés en anneau, aucun rouge hors des liens « Remettre à aujourd'hui »), la phrase annoncée lue dans la région (« Tes chiffres de croissance, avec tes « Et si » : MRR dans 12 mois ~110 000 € (+6 600 €, mieux)… »), le « 74 » de `/r/sample` capturé à mi-tampon, et le bundle Claude Design reconstruit et validé (71/71 aperçus, `QuarterNews` avec son « pourquoi »).

**Laissé tel quel, à dire à Antoine** : dans « Et si », une tuile qui se dégrade garde son écart en rouge (« −0,4 pt · moins bien ») : c'est `StatTile` (écart = signe + mot + couleur), et « ce qu'on perd » est le cas que sa décision laissait ouvert.

### « Et si » : les écarts à l'encre, et une paire qui imprime l'écart qu'elle a (2026-09-28)

**La question qui restait de l'audit**, posée d'abord en mots (« une tuile qui se dégrade garde son écart en rouge ») : Antoine ne voyait pas de quoi il s'agissait. Posée ensuite avec une capture côte à côte du vrai écran (en production, puis la même tuile à l'encre, puis la slide du même scénario), elle s'est tranchée en une réponse. **Une question de design se pose avec l'image**, pas avec sa description.

**Décisions d'Antoine (2026-09-28)** :
1. **Les écarts des tuiles sont à l'encre, en gras, gains comme pertes**, comme la colonne « écart » des slides : ni vert ni rouge.
2. **Une paire aujourd'hui → avec les « Et si » gagne un chiffre quand l'écart est plus fin que l'arrondi.** C'est la capture qui l'a montré : le scénario de l'exemple (inscription 3,2 → 3,6 %, churn logo 2,5 → 3,1 %) imprimait « ~100 000 € → ~110 000 € » pour un écart de « +3 000 € », et la GRR « 96 % → 96 % » avec « −0,6 point » sur la slide, alors que la tuile n'affichait aucun écart.

**Ce qui est livré :**
- **`StatTile` prend `sentiment: "neutral"`** : un écart qui est l'information mais le verdict de personne (encre `--text-body`, gras). Le panneau « Et si » l'utilise pour toutes ses tuiles. **Pourquoi S-5 ne l'avait pas vu** : `whatif-no-red.test.ts` lit la feuille du panneau, et ce rouge venait d'un composant rendu par le panneau. La garde est donc côté navigateur (`engine-whatif.spec.ts`) : elle compare la couleur peinte de chaque écart à l'encre de sa tuile, avec un « mieux » et un « moins bien » à l'écran.
- **`pairPrecision` dans `format.ts`** : les deux côtés d'une paire gagnent un chiffre, puis un second, tant que leur différence imprimée s'écarte de plus de moitié de l'écart réel ; au-delà, c'est du bruit. `approxRounding` et `rateRounding` sont les arrondis habituels, un ou deux chiffres plus fins ; un taux affine garde son zéro final (« 96,0 % » à côté de « 95,6 % ») ; `noDecimals` (petits effectifs) n'est jamais affiné. **L'écran (`scenario-view.ts`) et la slide (`deck.ts`) appellent la même règle** : « ~104 000 € → ~107 000 € », « 96,5 % → 95,9 % », « 99,6 % → 99,0 % ». Un chiffre seul garde partout sa précision habituelle.
- **Un troisième cas trouvé par balayage, pas par la capture** : sur la slide, la part de recommandés fait bouger les visiteurs, arrondis à deux chiffres, et la ligne imprimait « ~26 000 | ~26 000 | –490 ». Les visiteurs de la slide suivent donc la même règle. L'écran n'avait pas ce défaut : il y écrit les visiteurs en entier (« 25 510 »).
- **Filet sur la slide** : deux chiffres qui s'impriment pareil, même affinés de deux chiffres, donnent « stable », comme la tuile qui n'affiche alors aucun écart. Aucun levier de l'exemple ne l'atteint une fois les paires affinées (balayage de chaque curseur sur toute sa plage). C'est dit dans le code : un filet, pas un comportement qu'un test observe.

**Non-vacuité** : `pairPrecision` forcé à 0 fait tomber 6 tests (format, écran, slide). Retirer l'arrondi fin des visiteurs, avec le filet, fait tomber le balayage de la slide sur `ref.referred-share` exactement. Un build saboté, avec les tuiles revenues à `good`/`bad`, fait tomber la seule nouvelle spec, sur le vert du premier écart.

**Relecture** : `relecteur-copie` n'a relevé aucune règle de copie enfreinte (aucune chaîne de `src/content/` ne change) ; il a trouvé que le contrat de `StatTile` envoyé à Claude Design (`.design-sync/config.json`) ne connaissait pas `neutral`, que l'aperçu utilise. Corrigé ; bundle reconstruit et validé (71/71 aperçus rendus, la tuile « MRR in 12 months » à l'encre, les deux avertissements `GRID_OVERFLOW` attendus). `relecteur-securite` non lancé : ni route, ni proxy, ni payload, ni prompt, ni workflow touchés.

**Vérifié**, build avec `GAME_ENABLED=true` comme la CI, sur le code final : lint et `tsc` propres, **2 134 tests unitaires** (+9), seuils de couverture tenus, `next build` propre, **550 specs Playwright** (+1 : 545 passées, 5 ignorées par construction). À l'écran (build local, aperçu propriétaire), le scénario de la capture en FR à 1 280 et 390 px : tuiles « ~107 000 € · +3 000 € · mieux · aujourd'hui ~104 000 € », NRR « 99,0 % » (aujourd'hui 99,6 %), GRR « 95,9 % » (aujourd'hui 96,5 %), tous les écarts en gras à l'encre ; et la slide « ensemble » du même scénario, qui imprime les mêmes paires.

**Remarqué et laissé** : le CAC d'aujourd'hui s'écrit « ~500 € » sur la tuile et « 500 € » sur la slide. La slide imprime le chiffre mesuré tel quel, ce qu'elle documente ; l'écran l'arrondit comme une projection. C'est antérieur, sans conséquence de lecture.

### Le DG redessiné (2026-09-28)

**La demande d'Antoine** : « on a peut-être possibilité d'avoir un meilleur rendu du DG ? son visuel est un peu raté aujourd'hui ». Diagnostic : une tête en œuf sans cou, deux taches sombres en guise d'oreilles, une cravate qui pend sous un triangle détaché des épaules, des épaules réduites à une bosse fondue dans le bureau. En colère, le visage entier virait au saumon, ce qui se lisait plus comme un défaut de rendu que comme de la colère. Trois esquisses dans le vrai cadre de la visio et en avatar : illustration éditoriale, pochoir sérigraphié, contre-jour. **La première est retenue.**

**Ce qui est livré** : `DgFace` redessiné.
- Le personnage : cou, col ouvert, veston à revers, lunettes, tempes grises.
- La lumière : celle de l'écran à sa gauche, l'ombre à sa droite.
- Le décor : bureau flou derrière (fenêtre sur la ville la nuit, étagère, plante) et vignettage de webcam.

**Le contrat d'expression n'a pas bougé.** Les tracés de `#browL`, `#browR` et `#mouthShape` (table §5.10 de `GAME-BRIEF.md`, lue par P10 et par `game-call.test.ts`) sont restés identiques ; c'est le dessin qui s'y ajuste. Les lunettes sont posées un cran sous les sourcils, pour que ceux de la colère viennent buter contre la monture. Le nez est remonté au-dessus de la bouche. En colère, les joues rougissent et un pli se forme entre les sourcils. Le §5.10 le dit maintenant, en gardant l'ancien teint en mémoire. Les jetons `--dg-*` sont redéfinis : costume anthracite, ombres, fenêtre, ville. `--dg-skin-angry` et `--dg-tie` sont retirés : plus de cravate, le col est ouvert. Chaque nouveau jeton a son contraste mesuré ou sa raison écrite (`game-token-contrast.test.ts`). Le pire cas du nouveau dessin, le bout du sourcil droit et la monture sur la joue dans l'ombre, tient à 3,67 et 4,61.

**Vérifié** :
- lint et `tsc` propres ;
- **2 132 tests unitaires** (−4 mesures du teint colère, +2 mesures de la joue dans l'ombre) ;
- `next build` propre dans une copie de travail séparée : le build principal servait les maquettes des six directions ;
- **116 specs Playwright** du jeu et d'accessibilité passées (5 ignorées par construction), dont P10 ;
- bundle Claude Design reconstruit et validé (71/71), avec le DG dans tous les états de la visio : sonnerie, ouverte, colère avec son halo, raccrochée, terminée en gris.

**Piège** : Turbopack refuse un `node_modules` en lien symbolique qui sort de la racine du projet (« Symlink … points out of the filesystem root »). Pour construire dans une copie de travail, il faut `cp -al` (liens physiques, instantané, sans disque en plus), pas `ln -s`.

### Bons à tirer nº7 et nº8 remis d'accord avec le code (2026-09-28, demandé par Antoine)

**Le constat, mesuré mot à mot et non de mémoire.** Chaque texte des quatre pages ouvertes a été cherché tel quel dans le code. Le nº4 et le nº6 sont fidèles (depuis le nº4, le catalogue d'audit n'a changé que de typographie). Le nº7 et le nº8 ne l'étaient plus : le nº8 affichait 21 textes français qui n'existent plus (« quinze chiffres », l'ancien « Et si », des réglages disparus), et il manquait environ 200 chaînes neuves des retours du 25 au 27 septembre. Au nº7, cinq cartes avaient bougé et la copie neuve des 25-26/09 manquait. **Aucune décision n'était prise** : les trois collections `cards/` étaient vides, et chaque page écrit bien dans `cards/` (vérifié dans son code). Les deux pages ont donc été republiées **aux mêmes adresses**, sans rien perdre.

**La méthode, pour la prochaine fois.** Quatre sondes jetables sous `scripts/live/`, lancées avec `vitest.live.config.ts` puis supprimées (`git status` propre à chaque fois) :
1. la copie aplatie en `clé → { fr, en }` : `ENGINE_COPY`, le catalogue, la copie du jeu, le dictionnaire ;
2. le catalogue rempli avec l'exemple §6.0 par `catalogueValues`, et la ligne de repère composée comme dans `MetricSheet` ;
3. l'export texte des slides (`deckMarkdown`) de l'exemple, seul puis avec deux « Et si » (activation à 24 %, churn logo à 1,5 %) : les exemples des chapôs viennent du vrai moteur (« 13 chiffres sur 17 » remplace « 11 sur 15 ») ;
4. un exemple de `formatList` pour les astuces nommées par le contrôle.

Le nº8 est reconstruit par un script qui repart des clés de chaque ancienne carte. **Sa fidélité se juge sur ce qu'il n'a pas le droit de changer** : il reproduit à l'identique les 32 cartes dont le texte n'a pas bougé. Les 672 clés d'`ENGINE_COPY` sont toutes placées, et les 1 842 textes de la page sont retrouvés mot pour mot dans le code. Au nº7, 756 textes sont vérifiés ; seuls les exemples de la carte « Unités » n'y sont pas, puisque c'est le formateur qui les produit.

**Ce qui a changé sur les pages :**
- **nº8, de 67 à 82 cartes** : 15 nouvelles (durée, réglages, pas à pas, exemple rempli, six cartes du panneau « Et si », deux pour les slides « Et si », expansion et rétrogradation), 25 dont le texte a changé et 42 au texte inchangé. Les slides perdent leur numéro dans les titres de carte : les slides « Et si » s'insèrent après la fuite, et la visibilité passe en tête sous deux ★ connus. La carte « À trancher » cite maintenant aussi l'encart de durée et l'écran des cibles, qui dépendent de la même décision. Les exemples anglais du catalogue prennent enfin l'événement en anglais (« created a first project ») : l'ancienne page y mettait le français.
- **nº7, de 35 à 38 cartes** : 3 nouvelles (la fin du trimestre en plein écran, « pourquoi le churn a bougé », « pourquoi ce contrôle ») et 5 retouchées. Les quatre phrases validées du prototype réécrites à la demande d'Antoine (le bouton de la visio, « chantiers », les deux aides de la main, l'effet du questionnaire) sont montrées avant → après, comme les faits corrigés. La contradiction possible du « mot du DG », signalée le 26/09, est écrite sur la carte de l'écran plein, pour qu'elle se tranche avec la copie.

**Deux pièges de vérification :**
- **Une comparaison qui normalise les espaces a déclaré les faits corrigés « fidèles »** alors que la page portait des espaces simples là où le code a des insécables (passe typographique du 24/09). Une comparaison exacte les a vus. La page reprend maintenant le texte du code, marques de différence comprises.
- **Un premier contrôle a signalé à tort les plages de la frise** : la page les joint par « · » en une seule ligne. Il faut comparer les éléments d'une liste, pas la ligne jointe.

**Vérifié** : les deux pages rendues dans Chromium à 1 280 et 390 px, avec `scrollWidth === clientWidth`, aucune carte hors de l'écran et aucune erreur de page. Le payload publié, relu depuis le service, est identique au local (82 et 38 cartes). Ce qui a été regardé à l'écran : la main du nº7 (avant → après), l'écran plein à 390 px, une carte du catalogue et les titres des slides « Et si » du nº8.

**Reste hors de tout bon à tirer** : les deux libellés SEO du 28/09 (`glossaryPage.relatedComparisonLabel`, `applyAarrrLabel`), déjà en ligne.

### Six directions de design, posées sur le vrai site (2026-09-28)

**La demande** : les cinq directions retenues après l'audit du kit (A, B, H, E, F), plus une sixième qu'Antoine a ajoutée : « l'existant, en mieux », moderne, avec un signe distinctif entre les trois espaces. La contrainte vient de sa décision du matin : « un Tour, trois étapes », et chaque direction doit distinguer le Tour, le moteur et le jeu.

**La méthode** : pas de maquettes hors sol. Chaque direction est une surcouche CSS, plus un peu de DOM décoratif, posée sur le **build de production local**. Les pages, la copie et les chiffres sont donc ceux du produit. Un harnais capture sept écrans (accueil FR et EN, question du quiz, résultat FR et EN, moteur, hub du jeu) en 1280 et 390 px. Chaque direction a aussi son image de partage en HTML et sa fiche : contrastes mesurés, polices, risques, coût. I a été faite dans la session ; A, B, H, E et F par cinq sous-agents, sur un brief commun (`design/alternatives-2026-09/BRIEF.md`), relus un par un. La page de comparaison (artifact privé) montre la grille des trois espaces, chaque écran en entier, le mode « face à aujourd'hui » et les fiches.

**Correction d'Antoine en cours de route** : le jeu ne se décrit jamais par son seul niveau jouable (l'appli de streaming), puisque quatre autres niveaux arrivent. Le brief a été corrigé, les sous-agents prévenus, la carte « № 3 » de I réécrite avec les mots du hub. L'encart du jeu sur le résultat garde sa copie : il ne s'affiche que quand la rétention freine et ouvre ce niveau-là, il est donc juste à sa place.

**Pièges** :
- Une capture pleine page peint un fond `fixed` sur une seule hauteur d'écran, d'où une couture qu'aucun lecteur ne voit. Le harnais passe le fond en `scroll` pour les captures.
- Pixelify Sans ferme ses C : « CROISSANCE » se lit « OROISSANOE ». F ne l'emploie donc qu'en minuscules, au-dessus de 32 px.
- Le « 4 » de pochoir a une barre détachée et se lit « 74· ». B pose les chiffres du score en Big Shoulders plein.
- Aucune des polices Google en sous-ensemble latin n'a le №. Une vraie livraison doit l'embarquer : Plex Mono complet, comme aujourd'hui.

**Archive** : `design/alternatives-2026-09/`. On y trouve les surcouches, leurs sources, les images de partage, les fiches, le brief, le harnais et la page. Les captures sont dans la page publiée, les polices se retéléchargent. Rien de tout ça n'est importé par l'application.
