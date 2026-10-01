# Journal de Tour de Growth

Ce fichier est le **journal** du projet : chaque décision d'architecture, chaque
piège rencontré et ce qui a été vérifié en réel, dans l'ordre où c'est arrivé,
depuis le scaffold. Il vivait dans `CLAUDE.md` jusqu'au 2026-09-27. Il en est
sorti parce que `CLAUDE.md` est chargé dans **chaque** session : à 591 000
caractères, dont 93 % de journal, il pesait environ 150 000 tokens par session,
pour un avertissement de Claude Code qui tombe dès 40 000 caractères.

**Il ne se lit pas au démarrage : il se cherche**, ici et dans ses volumes :
`grep -rn "<motif>" JOURNAL.md docs/journal/` (un nom de fichier, un numéro
d'item `R-12`, une date). À chaque livraison, l'entrée habituelle s'ajoute **à
la fin de ce fichier** : la décision prise, les pièges, ce qui a été vérifié en
réel.

**Ce fichier est le volume courant.** Le 2026-10-01, à 834 000 caractères, les
entrées d'avant le 2026-09-30 sont parties dans `docs/journal/`, déplacées
telles quelles, en huit volumes rangés par période. **Quand ce fichier dépasse
200 000 caractères** (`src/__tests__/claude-md-budget.test.ts` rougit), ses
entrées les plus anciennes partent dans un volume de plus, par entrées
entières et sans rien réécrire, et la table ci-dessous gagne sa ligne.

Un renvoi « `JOURNAL.md`, <entrée> » désigne une entrée de ce fichier ou d'un
volume : le `grep` ci-dessus la trouve. Un renvoi écrit avant le 2026-09-27
sous la forme « `CLAUDE.md`, étape 5 », « l'entrée R-12 de `CLAUDE.md` » ou
« `CLAUDE.md`, 2026-09-14 » désigne aussi une entrée du journal. Les règles,
les leçons et les conventions numérotées, elles, sont restées dans `CLAUDE.md`.

| Volume | Période | Ce qu'il raconte |
|---|---|---|
| [1. Du scaffold au lancement](docs/journal/01-du-scaffold-au-lancement.md) | jusqu'au 2026-08-29 | Les étapes 1 à 13, du scaffold au Deep dive, puis le plan de croissance |
| [2. La première revue](docs/journal/02-premiere-revue.md) | 2026-09-05 → 06 | `REVIEW.md` (R-01 à R-26), la CI, les premières sondes réelles, l'extension 01 |
| [3. La deuxième revue](docs/journal/03-deuxieme-revue.md) | 2026-09-06 → 08 | `REVIEW-02.md`, le glossaire long, les pages légales, `/metrics` fermée |
| [4. La troisième revue, l'extension 03 et les bons à tirer](docs/journal/04-troisieme-revue.md) | 2026-09-09 → 11 | `REVIEW-03.md`, la bibliothèque d'actions, l'extension 03, Claude Design, les nº1 à nº3 |
| [5. L'instrument d'audit, la distribution et les stats](docs/journal/05-audit-distribution-stats.md) | 2026-09-13 → 14 | L'audit (phases 0 et 1), le plan de distribution, Fluid CPU, les stats privées |
| [6. Le SEO, le glossaire et le poids sur Vercel](docs/journal/06-seo-glossaire-vercel.md) | 2026-09-14 → 15 | Les portes ouvertes, le glossaire à 24 termes, « AARRR vs X », Functions Storage |
| [7. Le jeu, le moteur et l'outillage Claude Code](docs/journal/07-jeu-moteur-outillage.md) | 2026-09-23 → 28 | Le jeu et le moteur fermés, l'aperçu propriétaire, les plug-ins, l'audit du kit |
| [8. La synthèse I + B et la séance des décisions](docs/journal/08-synthese-i-b-et-decisions.md) | 2026-09-28 → 29 | Le kit I + B, les lots A1 à A6, les vingt-deux décisions |
| Ce fichier | depuis le 2026-09-30 | C23 et A7, l'extension 04, les design syncs B3, C25 à C29, le niveau 2 du jeu, et la suite |

## C23 : le jeu attend le moteur (2026-09-30)

**La question**, née de C4 la veille : puisque le moteur attend le lot A7.3 (le B2B assisté), le jeu, prêt bien plus tôt, doit-il l'attendre ? C19 disait « rien ne part avant que les deux soient prêts ».

**Vérifié avant de la poser** :
- **L'avancement des deux produits** : aucun item A7 livré. Le bon à tirer nº7 (le jeu) n'a aucune carte tranchée sur 38. Le nº8 (le moteur) en a 5 sur 82, et sera à refaire après A7.
- **La date du Digital Fairness Act**, sur laquelle reposait la reco écrite la veille : la Commission vise novembre 2026, le 18 étant une date envisagée (MLex, 23/09/2026). Le programme de travail 2026 disait « quatrième trimestre ».
- **Le créneau réactif** du calendrier des campagnes, qui ne joue « que si C est ouvert ».

**La réponse d'Antoine : on attend les deux, le moteur d'abord.** La recommandation était de lancer le jeu seul pour profiter du DFA, sans jamais sauter la recette ni la relecture juridique. Elle n'a pas été suivie, en connaissance de ce coût. C19 tient, le calendrier garde B puis C, et le créneau du DFA est abandonné.

**Ce qui en découle** : la copie du jeu dit la proposition du DFA « attendue fin 2026 » (`content/game/retention.ts:487-488`). Le jeu ouvrira après la proposition, et la phrase serait alors fausse. Un déclencheur en section E de `CHANTIERS.md`, et D2, imposent de la réécrire d'après le texte publié avant l'ouverture. Le créneau réactif est barré dans `marketing/campaigns/README.md` §5 et §8, et dans `game/social.md`, gardé pour mémoire.

**Consigné** : `marketing/campaigns/README.md` §10 (réponse du 2026-09-30), `GAME-BRIEF.md` §3, `CHANTIERS.md` (C, D2, E), `CLAUDE.md` (la ligne des décisions, où C24 prend la place de C23).

## A7.1 : aucun repère ne désigne l'étape qui freine (2026-09-30)

La décision 5 renversée par Antoine le 2026-09-29 (C1), codée. **Seule une cible d'équipe nomme l'étape qui freine.** Les repères publiés (activation 20-40 %, churn logo 1-2 %/mois, et tous les autres) restent affichés, avec leur réserve, « pour situer, sans désigner d'étape ».

**Le choix d'implémentation** : le comparateur « repère » est retiré du moteur, pas seulement éteint. Un drapeau `designates` laissé à `false` partout aurait gardé vivants une branche de `comparatorOf`, cinq mots `side`, deux phrases du tableau, deux gabarits du « Et si » et la réserve du pied de la slide « fuite ». Tout cela était du code sans chemin, qu'un `true` suffisait à rallumer. Ce qui disparaît :
- `Benchmark.designates` ;
- `Comparator.kind` et `Comparator.term` : un comparateur est la cible, un point `lo === hi` ;
- les mots `side.*Reference`, `diagnosis.belowReference` / `aboveReference` / `maybeBelow` (ce dernier était déjà mort) ;
- `whatIf.targetReference` / `targetReferenceHigh`, `sheet.referenceDesignates`, `slide.leakCaveat`, et le segment `{caveat}` du pied de la slide.

**L'exemple §6.0** porte les cibles de son équipe fictive (`EXAMPLE_TARGETS` : activation 20 %, churn 2 %). Ce sont les bornes que les deux repères lui prêtaient : son diagnostic ne bouge pas (activation nommée, ~600 € contre ~240 €, `clear`), mais la slide dit maintenant « 20 % (cible de l'équipe) ». Son bandeau le dit aussi, avec des valeurs lues dans les données plutôt que recopiées : « l'équipe fictive vise 20 % d'activation et 2 % de churn logo par mois ».

**La copie**, toute « à relire » :
- **Moteur** : la promesse, l'encart de durée, l'écran des cibles, la FAQ « D'où viennent les repères ? », « Pas assez de cibles pour conclure », les titres `leakShared` / `leakLevel`, et les trois « sans cible » (ligne du tableau, slide, note d'orateur).
- **Catalogue** : la réserve du churn devient « pour le SaaS B2B à panier élevé ; les petits paniers tournent bien plus haut, les contrats entreprise bien plus bas ».
- **Glossaire** : la page churn cite ChartMogul (médiane de 6,1 %/mois sous 25 $ d'ARPA mensuel, 2,2 % au-dessus de 500 $, vérifié sur leur page le jour même), et la page rétention reprend la même population. C'est de la copie validée qui change : elle repasse « à relire ».

**Vérifié** :
- **Non-vacuité** : remettre un repère désignant dans `comparatorOf` (le churn, sans cible) fait rougir exactement « no reference ever names ». Un test du catalogue refuse aussi tout champ de plus sur un repère.
- lint et `tsc` propres, 2 237 tests unitaires. Deux tests fusionnés : les mots de position n'ont plus qu'une famille.
- Les 110 e2e du moteur passent sur un build de production.
- À l'écran, en FR et en EN, à 1 280 et 390 px : le bandeau de l'exemple, « 18 %, sous ta cible (20 %) », le tampon « Sous la cible », et la slide « fuite » « Ramener l'activation à 20 % (cible de l'équipe)… », sans réserve de repère au pied.

**Pièges** :
- La copie française porte des espaces insécables U+00A0 avant `:` `;` `?` `%` `»` et après `«`. Un remplacement scripté écrit avec des espaces ordinaires ne trouve pas son texte, et une chaîne neuve tapée ainsi échouerait au test de typographie. Le remplacement cherche donc « espace ou insécable », et pose l'insécable dans les chaînes `fr`.
- `emptyState()` (fixtures) partait de l'exemple, et héritait donc de ses nouvelles cibles : le pas à pas reprenait à « base » au lieu de « cibles ». Un état vide n'a pas de cible : c'est corrigé dans la fixture, pas dans le test.

**Le relecteur de copie** a trouvé ce que la première passe avait laissé, tout corrigé avant la PR :
- un marqueur manquant sur le pied de la slide ;
- « fixe-en une », qui s'écrit « fixes-en une » (l'impératif reprend son *s* devant *en*) ;
- deux phrases qui contredisaient encore C1 : l'aide du champ cible (« une cible d'équipe sert de repère ») et la réserve du taux d'inscription (« donc ce repère ne désigne jamais », qui isolait ce repère comme si les autres désignaient) ;
- les dates de contenu : `updatedAt` des pages churn et rétention, et celle du moteur dans `updated-at.ts`.

Il signale aussi, pour le bon à tirer, un écart qui existait déjà et devient visible : la page rétention donne 97-99 % de rétention mensuelle (1 à 3 % de churn), la page churn 1-2 %, pour la même population désormais nommée à l'identique. Les chiffres validés ne sont pas touchés ici.

**Hors code** : `ENGINE.md` suit (D8 et décision 5 marquées, §5.1, §5.3, §6.0, §6.6, §9.3, §13.1, §14). Le bon à tirer nº8 cite l'exemple et ces phrases : sa page est à remettre d'accord avec le code par l'agent des bons à tirer, comme A7.2 et A7.3 le demanderont aussi.

**En production** : PR [#203](https://github.com/ScratchMe/tourdegrowth/pull/203), mergée le 2026-09-30 à 9 h 42 UTC (squash `c8ec215`, 36 fichiers, identique à la tête de la PR), servie à 9 h 43 UTC. Relevé par HTTP, entités décodées : `/fr/glossary/churn` porte « panier élevé » et « ChartMogul », et plus « petites entreprises » ; `/en/glossary/retention` porte « high-ticket ». Le moteur reste en 404 derrière son drapeau.

## La design sync depuis une session cloud : B1, B2, et B3 jusqu'à A5 (2026-09-29 → 2026-09-30)

**La demande d'Antoine** : la section B de `CHANTIERS.md`, par son prompt B — pousser le bundle vers le projet Claude Design existant (`23b9671c-a55b-452e-aa41-39906ee71ba8`), écrire le brief S-15, tenir les documents à jour ; tout avertissement autre que les trois connus, s'arrêter et lui expliquer.

**Ce que le prompt supposait, et qui était faux** : « sur ta machine ». La session tournait dans le cloud, et c'est là qu'elle a tout fait. `DesignSync` y répond avec la connexion claude.ai ; le convertisseur vient avec le skill `/design-sync` ; Chromium est préinstallé. L'autorisation locale qui manquait le 2026-09-11 n'est plus un prérequis.

**Deux envois, par le chemin atomique** (ancre relue juste avant, sentinelle, contenu par paquets, sentinelle, `_ds_sync.json` en dernier, `list_files` relu) :
- **2026-09-29** : 77 composants, 238 cellules, 398 fichiers, ancre `17cca5e0909b` ;
- **2026-09-30**, après la fusion d'A2, A4 et A5 : **79 composants, 244 cellules, 79/79 rendus**, 408 fichiers, aucune suppression, `report_validate` 79/0/0/0, ancre `f3b4bf9eb3c5`. Un premier bundle d'après A2 n'est pas parti : main avait pris A4 et A5 entre-temps, il aurait été périmé en arrivant.

**La notation a trouvé ce que le rendu ne montrait pas** : 64 cellules sur 245, dans 43 composants, rendaient proprement et disaient faux (copie des maquettes, chiffres plausibles que le modèle ne produit pas, commentaires qui promettent plus que la cellule). Antoine a choisi « corriger puis pousser » ; chaque aperçu a été refait depuis les sources du produit, le détail est dans `.design-sync/NOTES.md`. Une seule était un défaut du produit : la coupure de journal en pilule, livrée à part (#192, son entrée du 2026-09-29).

**Les avertissements** : `ActionCard` en a levé un quatrième (`GRID_OVERFLOW`, ses cartes à leur vraie largeur de 294 px) ; Antoine a choisi la carte en colonne. `GlossaryTerm` en a levé un autre après A4, que B3 annonçait : un seul popover ouvert par page, dans la couche supérieure, donc l'histoire `French` s'affichait fermée et le panneau d'`Open` pendait sous sa cellule. Antoine a choisi le 2026-09-30 de l'accepter et de rendre la carte honnête (`French` fermée exprès, de la place sous `Open`). Il y a donc **quatre** avertissements permanents.

**Le compte annoncé n'était pas le bon** : A1 puis A2 comptaient à partir de 244 (245, puis 251). La notation du 2026-09-29 avait retiré sept cellules, doublons ou fausses (245 → 238) ; 238 + 3 + 3 = 244. Le compte vient de ce que les aperçus exportent, pas des annonces.

**B2** : `design/DS-EXTENSION-BRIEF-04.md`, sur la forme des briefs 01 et 03, avec neuf captures du moteur et de l'audit dans `design/ds-extension-04/`. Il attend la relecture d'Antoine et son envoi (D3). Rien n'est parti vers Claude Design.

**Pièges** :
- **Le driver ne lance pas `cfg.buildCmd`.** Après A5, le rendu était à jour (il se construit depuis `src/`) mais les contrats disaient encore `Button compact` et `Segmented size="compact"` : `dist/types/` datait de la fusion précédente. Vu en relisant les `.prompt.md` avant l'envoi, pas par un avertissement.
- **Une note suit l'aperçu, pas le composant.** A4 et A5 ont changé neuf composants dont l'aperçu n'a pas bougé ; leurs notes auraient été reportées sans capture. Recapturés en contrôle, c'est comme ça que `GlossaryTerm` s'est vu.
- **Fusionner main au milieu d'une synchro** : onze aperçus en conflit avec les renommages d'A5, et deux valeurs retirées restées sur des lignes que seule la branche avait ajoutées (`StatTile size="responsive"`, `DgFace size="avatar"`). Une valeur inconnue retombe sur le défaut sans rien casser à l'œil ; seul un `grep` des valeurs retirées les trouve.
- **Le conteneur a redémarré deux fois.** `ds-bundle/` et les notes (`.design-sync/.cache/`, non commités) ont survécu ; l'ancre relue avant chaque envoi dit si quelqu'un a poussé entre-temps.
- **La capture par histoire fait 900 × 700** : les cellules hautes (le jeu) sont coupées, et `SpaceBand`, qui n'a sa mise en page large qu'à partir de 950 px, a été noté sur un rendu à 1 200.

**Trouvé dans le produit, laissé en A9 de `CHANTIERS.md`** après re-mesure sur main d'après A5 : les guillemets de l'audit à espaces ordinaires (17 lignes de copie, hors de la garde de typographie), « 100,000 » coupé en deux entre 761 et 850 px dans le tableau de bord du jeu, la courbe de churn qui touche l'étiquette d'objectif dans `EndingCharts`, et une règle morte dans `SpaceBand.module.css`. **Deux constats de la notation se sont révélés faux à la re-mesure** et n'y sont pas : l'état `locked` d'`ActionCard` n'est pas mort (`island-view.ts` le pose), et le premier compte de l'audit (69 lignes) comptait les commentaires.

**Consigné** : `.design-sync/NOTES.md` (« Synced », les quatre avertissements, le piège de `dist/types`, les risques de re-synchro), `.design-sync/conventions.md` (le `medium="slide"` qu'A5 avait laissé en `size`), `CHANTIERS.md` (B réécrite : B1 retiré, B2 en attente, B3 après A7.10 ; D3 ; le prompt B ; A9), `CLAUDE.md` (le paragraphe de synchro, la ligne des avertissements, la ligne « Design system → Claude Design »).

**Vérifié, et comment** : 79 aperçus sur 79 rendus sans erreur (aucun vide, fin ou identique) ; les 244 cellules notées « good » une à une sur leur capture, plus dix composants recapturés en contrôle ; les contrats relus après régénération (`grep` des props retirées : zéro) ; `conventions.md` confronté au build (noms de composants, jetons retirés) ; l'envoi relu par `list_files`. Aucun code de `src/` dans cette PR : que de la doc, des aperçus et des captures sous `design/`, que `vercel-ignore.sh` ne déploie pas.

## A7.2 : « Moteur de growth » (2026-09-30)

Le nom tranché par Antoine le 2026-09-29 (C2), codé. En français, le moteur s'appelle « Moteur de growth » (« Ton moteur de growth », minuscule dans le texte courant). En anglais, il reste "Growth engine". **L'adresse `/aarrr-funnel-template` ne change pas.**

**Ce qui change** :
- **La copie**, « à relire » : le fil d'Ariane (donc aussi le nom du `WebApplication` et du fil en JSON-LD, qui le lisent), le titre de la page, l'en-tête du tableau et le kicker des slides.
- **La confidentialité** : ses deux paragraphes sur le moteur, et sa date, qui passe au 2026-09-30.
- **L'aperçu propriétaire**, et les commentaires qui nommaient l'outil.
- **Hors `src/`** : `ENGINE.md`, `CLAUDE.md`, les textes de lancement (`marketing/kit.md`, `README.md`, `campaigns/README.md`, `competitive-brief.md`, `campaigns/engine/*.md`) et le relecteur de sécurité.

**Ce qui ne change pas**, par décision : les deux demandes à copier (« un point sur notre moteur de croissance ») parlent du moteur **de l'entreprise**, pas de l'outil. La comparaison OKR (« pas un moteur de croissance ») est l'usage générique. Le titre `meta.title` (« Modèle de funnel AARRR… ») porte la requête. Le nom court « Le moteur » du bandeau et de la bande de l'accueil reste aussi.

**Et ce qu'A7.1 rendait faux dans les textes de lancement** : cinq textes du lancement B disaient encore qu'une fuite peut être nommée « contre une fourchette publiée » (Show HN, Reddit, Indie Hackers, newsletters, fil X/Bluesky, annuaires, brief concurrentiel). Ils disent maintenant « contre une cible que tu fixes ; les fourchettes publiées servent à situer ». Le récit d'Indie Hackers gagne l'histoire du churn 1-2 % qui signalait l'exemple à tort. Les longueurs déclarées des annuaires sont recalculées par `check-lengths.mjs --fix`.

**Vérifié** : `grep -rn "oteur de croissance"` ne trouve plus dans `src/`, `e2e/` et `marketing/` que les trois usages génériques gardés.

**En production** : PR [#204](https://github.com/ScratchMe/tourdegrowth/pull/204), mergée le 2026-09-30 à 10 h 07 UTC (squash `9417d70`, 25 fichiers, identique à la tête de la PR), servie à 10 h 08 UTC. Relevé par HTTP, entités décodées : `/fr/privacy` porte « moteur de growth » dans ses deux paragraphes et la date du 30 septembre 2026. Le moteur reste en 404 derrière son drapeau.

## A7.6 : la slide « fuite » d'une étape sans prix (2026-09-30)

C9, tranché par Antoine le 2026-09-29, codé. Quand le diagnostic nomme **seule** une étape que le modèle ne sait pas chiffrer en argent (la rétention à J30, la part d'inscrits recommandés), la slide « fuite » **existe**. Jusque-là, `buildLeak` l'omettait sans rien dire, et le deck perdait la conclusion que le tableau affiche. Quand combler l'écart rapporterait **moins d'un client** par mois, l'omission est gardée : ce n'est pas un argument de comité.

**Ce qui la compose** :
- **Le titre** `leakClearUnpriced`, qui nomme la valeur et la cible sans montant : « **La rétention à J30 freine le moteur** : 5 %, pour 20 % (cible de l'équipe). »
- **Le pied** `leakFooterUnpriced`, qui dit pourquoi il n'y a pas de montant : « Sans montant : le moteur ne relie pas ce chiffre au MRR ».
- **Pas de carte « Le calcul »**, puisqu'il n'y a pas de chaîne à montrer. La colonne « À côté » prend alors toute la largeur (`.leak[data-calc="false"]`), plutôt que de laisser une colonne vide.
- **L'export texte et les notes** suivent sans code à part, puisqu'ils lisent le même modèle de slide.
- Les deux gabarits neufs sont « à relire ». Les deux conditions que `!impact || less-than-one` confondait sont maintenant deux branches.

**Vérifié** :
- **Non-vacuité** : remettre l'omission fait rougir le test de la slide, et le garde-fou des phrases, qui exige qu'un scénario déclenche chaque titre.
- **Tests unitaires** : une rétention à J30 seule sous sa cible donne une slide avec un titre sans « € » ni « MRR », sans ligne de calcul, et « ## 2. » dans l'export, en FR et en EN. Un gain d'un tiers de client ne donne pas de slide.
- **Un e2e**, en FR et en EN, à 1 280 et 390 px : la slide rendue, sans « Le calcul », avec « À côté » et le pied, sans défilement horizontal.

**En production** : PR [#206](https://github.com/ScratchMe/tourdegrowth/pull/206), mergée le 2026-09-30 à 10 h 20 UTC (squash `2bded69`, 12 fichiers, identique au diff de la PR ; #205, d'une autre session, s'était glissée entre les deux). Déploiement de production Vercel `READY` sur ce commit, lu par l'API. La slide n'est pas observable en production : le moteur reste en 404 derrière son drapeau.

## D10 : le Tour au seul SEO, l'indexation anglaise et Launching Next (2026-09-29 → 30)

**La demande** : la suite de la section D, pas à pas avec Antoine (prompt D). L'action a commencé sous le nom de D6, semaine S1 du calendrier des campagnes. La séance des décisions ([#193](https://github.com/ScratchMe/tourdegrowth/pull/193)), mergée en parallèle, l'a renommée D10 (C20 : le Tour au seul SEO, sans post). Rien de ce qui a été fait ne la contredit.

**Le relevé de départ d'abord** : `stats.yml` (portée `both`), déclenché avant toute soumission, déchiffré dans le scratchpad de la session. Les chiffres sont restés dans la conversation.

**Search Console, le 2026-09-29** :
- **Anglais** : `/en` était déjà sur Google. Les deux pages « porte ouverte » et les cinq « AARRR vs X » ne l'étaient pas, deux semaines après leur mise en ligne. Indexation demandée pour les huit. Le rapport chiffré le disait déjà : aucune impression sur ces pages.
- **Le sitemap** : lu par Google le jour même, avec ses 74 pages. Google connaît donc les adresses et ne les a pas encore explorées. Ce n'est pas un problème de découverte.
- **D8, clos** : pour `/en/glossary/viral-coefficient`, `activation` et `aha-moment`, les deux canoniques (« déclarée » et « sélectionnée par Google ») s'affichent « Sans objet ». Cela veut dire que Google ne les a jamais explorées : s'il les avait lues, il afficherait au moins la canonique déclarée, qui est la bonne (revérifié en production, avec `hreflang` en, fr et `x-default`). Google n'a donc pas choisi l'ancienne adresse contre la nouvelle. Rien à coder. Indexation demandée.
- **Français** : le 2026-09-30 au matin, le quota était encore dépassé. Il se compte sur une fenêtre glissante de 24 heures, pas par jour calendaire. `/fr` est déjà sur Google. Les sept autres adresses sont listées dans D10.

**Launching Next, soumis le 2026-09-30** : formulaire revérifié la veille depuis la session, identique à la table de `marketing/kit.md`. Lien `directory_launchingnext` en campagne `relaunch_tour`, soumetteur « Tour de Growth » et `contact@`, option payante refusée. Les 15 questions, les 10 du Deep dive, les 24 termes du glossaire et la licence AGPL de la description ont été revérifiés contre le code avant de coller. Le titre de 5 à 8 mots (« A 3-minute AARRR growth check-up, with roast mode ») est neuf : il est tiré de la tagline du kit et relu par Antoine en le collant.

**Les annuaires suivants attendent A7.12.a** : les captures du Tour sont antérieures à I + B, et la décision C20 les fait refaire avant. Launching Next ne prend aucune image, donc rien de périmé n'est parti.

**Au passage** : cette session a été lancée avec le prompt D d'avant C22 (« jamais mon nom »), que la séance des décisions a réécrit depuis dans `CHANTIERS.md`. C22 fait nommer Antoine en réponse à « qui est derrière ? ». Sans effet ici : aucun post ne part, et le champ soumetteur d'un annuaire reçoit « Tour de Growth ».

## A7.5 : relier un Tour après coup (2026-09-30)

C8, tranché par Antoine le 2026-09-29, codé. La case « Comparer avec ce Tour » n'existait que sur la carte de départ. Un Tour fait après le début du moteur, ou une case décochée par mégarde, ne pouvait donc plus jamais être relié. Le tableau n'affichait alors rien, alors que le miroir sans Tour invite justement à en faire un : une impasse.

**Ce qui change** :
- **Le miroir a un troisième état**, `data-state="unlinked"`, quand un Tour avec réponses est sur l'appareil et que le moteur n'y est pas relié. Il affiche le titre du miroir, une ligne avec la date et le score du Tour (ou sans score, `unlinkedNoScore`), et un bouton « Relier ce Tour ». Le bouton pose `tourLink`, comme la carte de départ, et compte `engine_tour_linked`.
- **Les Réglages portent la case**. Elle s'ouvre sur l'état actuel. Cochée, elle garde le lien existant ou relie ce Tour. Décochée, elle délie, et une ligne dit que le Tour reste sur l'appareil.
- **Seul l'identifiant du Tour est stocké** (D13) : relier ne fait que lire `tdg.results.v1`.
- **La copie neuve** (la ligne, sa variante sans score, le bouton, la ligne des Réglages) est « à relire ».
- **La date du Tour passe par le formateur du moteur** (`formatDate`), dans le miroir relié comme non relié : « 1er septembre 2026 », "September 1, 2026", comme la carte des Réglages qui nomme le même Tour. Le miroir la formatait à la main, en `en-GB` en anglais et sans « 1er » en français. Trouvé par `relecteur-copie`. Le Tour de l'e2e est daté du 1er septembre : remettre l'ancien format fait rougir les quatre parcours « relier depuis le tableau », en FR et en EN, et eux seuls.

**Vérifié** : `e2e/engine-tour-link.spec.ts`, en FR et en EN.
- **Le parcours complet, à 1 280 et 390 px** : moteur commencé sans Tour, invitation (`none`), un Tour déposé sur l'appareil, retour au tableau, état `unlinked` avec le score, « Relier ce Tour », état `linked`, qui tient au rechargement. L'événement est compté, le Tour reste intact dans `tdg.results.v1`, aucune requête autre qu'un GET ne part (hors compteur), et la page ne défile pas de côté.
- **Relier puis délier par les Réglages** : la ligne « Délier garde ton Tour… » s'affiche, et le Tour reste sur l'appareil.
- **La suite Playwright complète** sur la branche rebasée : 630 specs, 625 passées, 5 ignorées par construction, aucun échec. Puis les 120 specs du moteur après le correctif de date.

**En production** : PR [#209](https://github.com/ScratchMe/tourdegrowth/pull/209), mergée le 2026-09-30 à 10 h 47 UTC (squash `8fcdb4a`, 11 fichiers, identique à la tête de la PR ; #207, d'une autre session, était passée avant, d'où un rebase). Déploiement de production Vercel `READY` sur ce commit, lu par l'API. Le moteur reste en 404 derrière son drapeau : le miroir n'est pas observable en production.

## Le brief 04 déposé dans le projet Claude Design (D3, 2026-09-30)

**La demande d'Antoine** : lancée pour porter S-15, la session s'est arrêtée à l'étape 0, parce que le retour de Claude Design n'existait pas : ni `design/ds-extension-04-return/` (cherché sur `main` et sur les trois branches du dépôt), ni « Send to Claude Code Web ». Antoine a répondu : « Envoie-le à Claude Design ».

**Ce qui est parti** : `design/DS-EXTENSION-BRIEF-04.md` (la version de #205) et ses neuf captures, **aux mêmes chemins que dans le dépôt**, pour que les renvois du brief (`design/ds-extension-04/…png`) se lisent tels quels dans le projet. Dix fichiers, écrits par `DesignSync` sous un plan qui ne nommait qu'eux (`design/DS-EXTENSION-BRIEF-04.md`, `design/ds-extension-04/*.png`, aucune suppression). Aucun fichier du design system n'a été touché : ni le bundle, ni la sentinelle, ni `_ds_sync.json`, dont l'ancre `bundleSha12` est toujours `f3b4bf9eb3c5`.

**Ce que « envoyer » veut dire ici, et ce que ça ne veut pas dire** : les briefs 01 à 03 avaient été déposés par Antoine lui-même dans une conversation Claude Design. La session, elle, n'écrit que des fichiers dans le projet : **rien ne tourne côté Claude Design tant que personne ne le lui demande**. D3 devient donc « lancer le brief », avec le prompt à coller dans `CHANTIERS.md`.

**Un piège évité d'avance** : le projet porte maintenant un dossier `design/` que le bundle ne connaît pas. `.design-sync/NOTES.md` dit de vérifier qu'`upload.deletePaths` n'y touche pas lors de la prochaine re-synchro (B3), et de le retirer exprès une fois le retour porté.

**Vérifié** : les neuf captures sont distinctes (sommes de contrôle ; le brief 03 avait envoyé deux fois la même image, `JOURNAL.md` 2026-09-09) ; `list_files` relu après l'envoi, et les dix chemins y sont ; l'ancre relue après l'envoi. Le contenu n'a pas été relu octet par octet côté projet.

**Consigné** : `CHANTIERS.md` (vue d'ensemble, B2, D3 avec son prompt), `CLAUDE.md` (la ligne « Design system → Claude Design »), `.design-sync/NOTES.md` (« Synced »). Que de la doc : `vercel-ignore.sh` ne déploie pas.

## L'instrument d'audit entre parenthèses, les entretiens réorientés vers le moteur (2026-09-30)

**La décision d'Antoine**, prise pendant la session D (prompt D, action D5) : « mettre le projet d'audit entre parenthèses et se concentrer sur le moteur à la place ». Elle devance ce que la mission de la phase 1 bis devait trancher (C6 : l'instrument fait-il doublon avec le moteur ?). Trois précisions ont été demandées avant d'écrire, et Antoine y a répondu :

- **Le périmètre** : tout est suspendu, sauf l'usage personnel. La mission de la phase 1 bis (D4), le bon à tirer nº4 et les phases 2 et 3 s'arrêtent. Antoine peut se servir de l'outil en mission quand ça l'arrange, mais ce n'est plus un chantier : une friction ne devient une PR que s'il la demande. **Le code reste** : `/admin/audit`, `lib/audit`, le catalogue et leurs tests. Rouvrir ne coûte rien.
- **Les entretiens** (D5) sont gardés et réorientés vers le moteur. Leur question de fond était déjà la sienne : « quelqu'un taperait-il ses chiffres à la main, et pour obtenir quoi ? ». D5 perd ce qui ne servait que la phase 3 de l'audit.
- **Ce que le dépôt en dit** : la décision seulement.

**Écrit** : un en-tête daté dans `AUDIT-PLAN.md` (le plan reste tel quel, pour le jour où il rouvre), une ligne en tête d'`AUDIT.md`, la suite de la décision 6 d'`ENGINE.md`, la ligne C6 et D5 de `CHANTIERS.md`, D4 retiré. Dans `CLAUDE.md` : le paragraphe de l'instrument, sa ligne dans « ce qui reste ouvert », et le nº4 marqué suspendu. A9.1 (les guillemets de l'audit) reste en section A : c'est une correction typographique et une garde, pas un chantier de l'audit.

**La trame d'entretien**, écrite avec Antoine et validée le jour même, est rangée en annexe d'`ENGINE.md` (« Les entretiens ») : qui interroger (dont au moins deux profils en vente assistée ou hybrides), huit questions sur ce que la personne a fait, une démo en fin d'entretien, ce qu'on note, et la règle du dépôt (notes hors du dépôt, synthèse anonyme à partir de cinq).

**Les entretiens sont ensuite reportés par Antoine, sans date** : la trame attend, et aucune session ne les relance d'elle-même.

**Ce qui ne change pas pour le moteur** : la décision 6 d'`ENGINE.md` dit déjà « public, gratuit et local », aucun connecteur, rien ne quitte le navigateur, pas un produit commercial. La changer passe par Antoine.

## A7.8 : l'amende du jeu plafonnée à 75 000 € (2026-09-30)

C14, tranché par Antoine le 2026-09-29, codé. Le contrôle de la DGCCRF inflige **75 000 €**, quel que soit le radar. La formule d'avant (60 000 + radar × 500) donnait de 97 500 € à 110 000 €, au-dessus de ce que la loi permet, dans un jeu qui tient sa crédibilité de faits vérifiés.

**La source, lue sur Légifrance le 2026-09-30** (par un sous-agent, WebFetch, quatre lectures concordantes ; `curl` direct reçoit un 403) :
- Code de la consommation, **art. L. 241-3-1**, créé par la loi nº 2022-1158 du 16 août 2022 (art. 15). Il est en vigueur depuis le 18 août 2022, et aucune autre version n'est listée.
- Le texte : « Tout manquement aux dispositions de l'article L. 215-1-1 relatives aux modalités de résiliation par voie électronique des contrats est passible d'une amende administrative dont le montant ne peut excéder 15 000 € pour une personne physique et 75 000 € pour une personne morale. »
- L'amende est prononcée par la DGCCRF (L. 522-1, R. 522-1), sur décision motivée après procédure contradictoire (L. 522-5).
- Il n'y a pas de doublement en cas de réitération. Plusieurs manquements se cumulent (L. 522-7), mais le jeu n'en compte qu'un.

L'article cité par CHANTIERS était présumé « L. 242-… » : c'est L. 241-3-1, et le montant est bien celui attendu. Il n'y avait donc pas lieu de remonter en section C.

**Ce qui change** :
- `control.fineBase` et `control.finePerPoint` deviennent `control.fine: 75_000`, avec la citation en commentaire dans `levels/retention.ts`. `GAME-BRIEF.md`, règle 5, cite l'article.
- Le texte de l'événement (« amende de {fine} ») ne change pas : seul le nombre change. Aucun texte de lancement ne citait de montant (`grep` sur 97 500, 110 000, 106 000).

**Vérifié** :
- **Non-vacuité** : l'ancienne formule fait rougir le test du contrôle et le nouveau test « 75 000 € à radar 75 et à radar 100 ».
- L'e2e des nouvelles (le trimestre de l'inspection, chemin C) attend maintenant « 75 000 » sur le tampon, au lieu de « 106 ».
- **La suite complète**, lancée une fois sur le haut de la pile A7.8 → A7.13 (2026-09-30) : 642 specs Playwright, 637 passées, 5 ignorées par construction, aucun échec ; 2 245 tests unitaires avec la couverture, `tsc` et lint propres.

**En production** : PR [#211](https://github.com/ScratchMe/tourdegrowth/pull/211), mergée le 2026-09-30 à 11 h 20 UTC (squash `11688b6`, 9 fichiers, identique au commit de la PR). Déploiement de production Vercel `READY` sur ce commit, lu par l'API. Le jeu reste en 404 derrière son drapeau (`/fr/jeu`, `/en/game`) : l'amende n'est pas observable en production.

## A7.7 : l'encart du jeu sous le bouton principal, sur desktop (2026-09-30)

C10, tranché par Antoine le 2026-09-29, codé. Sur desktop, l'encart du jeu passe **sous** la rangée de boutons du résultat, dans la colonne de droite. Placé au-dessus, il faisait descendre de 350 px le « Fais ton propre Tour » du visiteur, qui est le cœur de la boucle `?ref=`. Sur mobile, rien ne change : l'encart vient déjà après le bouton et la carte de partage.

**Comment** :
- **Dans le JSX**, `GameEntry` suit maintenant la rangée de boutons, juste avant l'avertissement. C'est la même place pour le visiteur et le propriétaire : le premier rendu est celui du visiteur, et un ordre qui dépendrait d'`isOwner` décalerait la page après le montage.
- **Dans la feuille de style**, la réinitialisation desktop `.slotGame { order: 6 }` disparaît. La valeur mobile (9) est aussi la bonne dans la colonne de droite (CTA 7, jeu 9, avertissement 10). L'ordre de chaque colonne desktop est donc à nouveau son ordre source, sans exception.

**Vérifié** :
- `result-reading-order.test.ts` : les huit variantes gardent leurs coûts sur mobile (1 et 2 sans l'encart, 2 et 3 avec ; `slotShare` reste le bloc le plus déplacé, recalculé). Le test desktop exige « sous le CTA, au-dessus de l'avertissement », et aucune réinitialisation.
- `game-entry.spec.ts`, à 1 280 px : le bas du bouton principal est au-dessus du haut de l'encart. À 390 px : le bouton, puis le partage, puis l'encart.
- **Non-vacuité** : l'ancien ordre source fait rougir le test desktop, dans l'unitaire comme dans l'e2e.
- **La suite complète** sur le haut de la pile A7.8 → A7.13 : 642 specs Playwright, 637 passées, 5 ignorées par construction, aucun échec. Plus tard, 49 specs du résultat et du jeu sur l'émulateur Firestore (A7.11), vue propriétaire comprise.

**En production** : PR [#212](https://github.com/ScratchMe/tourdegrowth/pull/212), mergée le 2026-09-30 à 11 h 28 UTC (squash `5cf4bca`, 7 fichiers, identique à la tête de la PR). Déploiement de production Vercel `READY` sur ce commit, lu par l'API. Le jeu reste en 404 derrière son drapeau : l'encart ne s'affiche pas en production.

## A7.9 et C24 : la bande de l'accueil en portes mesurées, et l'exemple qui suit le ton (2026-09-30)

C15, tranché par Antoine le 2026-09-29, et C24, tranchée le 2026-09-30 (« OK pour C24 »), codés.

**La bande « Le Tour en trois parties »** (`SpaceStrip`) : chaque carte d'un espace **ouvert** devient une porte.
- **Un seul lien par carte** : son nom (le `h3`), étiré sur toute la carte par un `::after`. Un clic n'importe où sur la carte y mène, et un lecteur d'écran entend un nom, pas toute la carte. Le pitch sert de description (`aria-describedby`).
- **Les destinations** : le Tour mène à `/quiz` par un `<a>` simple (un chargement de document, comme toutes les entrées du quiz), le moteur à `/{locale}/aarrr-funnel-template`, le jeu à `/{locale}/game`.
- **Une carte fermée n'a pas de lien.** C'est le cas du moteur sur le build de la CI.
- **Visuellement secondaire** : pas de remplissage rouge. Le survol souligne le nom et soulève la carte (`--shadow-hover`, sauf le Tour qui a déjà la sienne), et le focus clavier entoure toute la carte. Aucune couleur de texte ne change, donc le contraste ne bouge pas (convention 7).

**La mesure** :
- **Le jeu** : `game_entry_clicked/home_strip` depuis la bande, `game_entry_clicked/space_band` depuis la pastille du bandeau.
- **Le moteur** : un événement d'entrée neuf, `engine_entry_clicked/<source>`, avec les mêmes deux sources. A7.4 y ajoutera ses trois pages.
- **Le Tour** : un **clic à part**, `tour_entry_clicked/home_strip`, et non une source sur `quiz_started`. CHANTIERS disait « l'événement de démarrage existant, avec la source home_strip ». Mais `quiz_started` est le dénominateur du funnel depuis R-11, et lui ajouter un détail l'aurait coupé en deux chemins (la raison de `retake_started`, écrite dans `goatcounter.ts`). Le clic se lit donc à côté des démarrages, sur la même ligne de `/admin/stats`.
- **Pas la pastille du Tour** : elle ramène à l'accueil, ce n'est l'entrée de rien.
- **`/admin/stats`** affiche les nouvelles sources : entrées du jeu et du moteur, clics de la carte du Tour.

**C24** : « Voir un résultat d'exemple » suit le sélecteur de ton de l'aperçu. En roast, il mène à `/r/sample?tone=roast`, l'exemple roast d'A3.3 avec sa propre carte de partage.
- L'aperçu et le bouton sont deux îlots dans deux colonnes. Ils partagent le ton par une petite valeur de module lue avec `useSyncExternalStore` (`sample-tone.ts`), sans fournisseur de contexte.
- L'instantané serveur est « Direct », donc le premier rendu et la page hydratée disent la même chose.

**Vérifié** :
- `e2e/home-strip-doors.spec.ts`, en FR et en EN, à 1 280 et 390 px : un clic dans le coin de la carte du Tour mène à `/quiz`, compte `tour_entry_clicked/home_strip`, et ne déclenche pas `quiz_started`. La carte du moteur, fermée, n'a pas de lien. La carte et la pastille du jeu comptent chacune leur source. Le bouton d'exemple suit le ton, aller et retour. Le survol souligne, et le focus entoure la carte.
- `spaces-kit.spec.ts` ne dit plus « pas de portes » : un lien par carte ouverte, aucun sur une fermée.
- `accessibility.spec.ts` passe (axe sur l'accueil, FR et EN).
- **Non-vacuité**, sur un build saboté (le bouton figé sur l'exemple direct, un détail `home` au lieu de `home_strip`) : 8 tests rougissent (les quatre du Tour, les deux du jeu, les deux de C24). Les 3 qui restent verts (la carte fermée, le survol) ne portent pas sur ce qui a été cassé.
- **Piège** : dans le test, la carte est sous le pli à toutes les largeurs. Un `page.mouse.click` sur les coordonnées de sa boîte, sans la faire défiler d'abord, ne touche rien et ne dit rien.

**En production** : PR [#213](https://github.com/ScratchMe/tourdegrowth/pull/213), mergée le 2026-09-30 à 11 h 40 UTC (squash `ab25349`, 21 fichiers, identique à la tête de la PR). Déploiement de production Vercel `READY` sur ce commit, lu par l'API. Relevé par HTTP, en FR et en EN : la carte du Tour porte `space-strip-link-tour`, et celles du moteur et du jeu, fermés en production, n'ont pas de lien. Le bouton d'exemple mène à `/r/sample` avec `data-tone="straight"`, et `/r/sample?tone=roast` répond 200.

## A7.3.a : la spécification du B2B assisté et de l'hybride (2026-09-30)

La décision 3 renversée par Antoine le 2026-09-29 (C4) : le B2B assisté (SLG) entre dans la v1 du moteur, et l'hybride se lit en « deux moteurs, un total ». Sa spécification est écrite dans **`ENGINE.md` §18**, sur la forme des §4 à §9. Elle attend la validation d'Antoine (**C25**), et rien ne se code avant.

**Comment elle a été écrite** :
- **Le premier jet** vient d'un sous-agent, écrit contre le code de `main` après A7.1 (types, catalogue, validation, stockage, diagnostic, deck, exemple, réglage) et non contre les documents. Son arithmétique d'exemple a été refaite au script.
- **La relecture** d'intégration a vérifié les points qui ne se discutent pas :
  - C1 vaut dans les deux motions ;
  - aucun chiffre de marché n'est inventé : le seul repère gardé, NRR 110-130 %, est lu mot pour mot dans `glossary-deep.ts` ;
  - les ordres de grandeur de l'instrument d'audit restent dehors (non relus au nº4, et la décision 6 interdit l'import) ;
  - aucun gabarit ne met les deux motions en face-à-face, et un test est prévu pour le garder.
- **La numérotation** : la section devient §18, et non §15, déjà pris par « Reporté ». Les §15 à §17 ne bougent pas.

**Ce qu'elle tranche, sous réserve de C25** :
- **Le réglage** porte deux axes, `type` et `motions: {plg, slg}`. L'hybride se dérive, il n'est jamais stocké. Décocher une motion ne perd rien.
- **Les chiffres assistés** vivent dans le même `Snapshot.metrics`, sous des ids `slg.*` ; les ids du libre-service ne changent pas. La marge brute est commune aux deux motions.
- **Le catalogue assisté** compte 14 chiffres (trois au plus par étape), plus la liaison `link.pql-handoff`, facultative et hors couverture.
- **Le funnel assisté** se dessine en **trois relais**, chacun sur sa propre base de 100, jamais en chaîne multipliée. Tout l'assisté se lit sur trois mois glissants.
- **Le fichier** passe en `schemaVersion` 2, avec une migration pure. Un test « golden » exige qu'un moteur v1 donne, après migration, le même tableau et les mêmes slides au caractère près.
- **Un correctif de validation** est nécessaire : le refus au-dessus de 100 % ne doit plus valoir que pour les chiffres bornés, sinon une NRR réelle ne s'enregistre pas.

**Les seize questions** sont en §18.12, chacune avec sa reco et ce qui casse si on se trompe. C25 recommande de trancher d'abord Q3 (un client compte dans la motion qui a signé son contrat en cours : c'est ce qui évite de compter deux fois le MRR total), Q1 (l'activation assistée est la mise en production) et Q2 (trois mois glissants), puis les autres en bloc.

**En production** : PR [#214](https://github.com/ScratchMe/tourdegrowth/pull/214), mergée le 2026-09-30 à 11 h 49 UTC (squash `62e3618`, 4 fichiers, identique à la tête de la PR). Doc seule : Vercel ignore le build, et rien ne change sur le site.

## A8 : l'audit GEO, et la date sur la page (2026-09-30)

L'angle **GEO** (être lu et cité par les moteurs de réponse IA) n'avait jamais été audité. Le plug-in « claude-site-audit », proposé par Antoine le 2026-09-29, a été lu mais **pas installé** : ses contrôles, sa notation et son générateur ne sont pas dans l'archive, et il n'a pas de licence. L'audit a donc été joué à la main. **Si l'amont publie les fichiers manquants, la question repart en section C.**

**A8.1, le relevé**, en lecture seule contre `www.tourdegrowth.com`, sur 74 pages dans les deux langues :
- **Ce qui tenait déjà** : tout le JSON-LD se parse ; chaque page porte son `lang` et ses trois `hreflang` ; la définition d'un terme est en tête du HTML servi sans JavaScript ; l'auteur est nommé au pied de chaque page. Neuf robots d'IA ou de recherche (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, PerplexityBot, CCBot, Bytespider, Applebot) reçoivent la même page que Googlebot, au même octet.
- **`/robots.txt`** laisse tout passer (`User-Agent: *`, `Allow: /`). **`/llms.txt`** répond par la page 404 du site.
- **Deux trous** : `/how-it-works`, la page qui explique le score, était la seule page de prose sans `Article` ni date. Et **aucune page n'affichait sa date**, alors que le JSON-LD et le sitemap la portaient : ni un lecteur, ni un moteur qui cite la page, ne pouvait distinguer une définition revue la semaine dernière d'une définition vieille d'un an.

**A8.2, ce qui ne demandait aucun choix** :
- **`/how-it-works` devient un `Article`**, publié le 2026-08-28 (#14, lu dans l'historique) et mis à jour le 2026-09-24. Son `og:type` passe à `article`, avec les mêmes dates.
- **La ligne de date** « Dernière mise à jour : … » / "Last updated: …" s'imprime sur :
  - les huit articles, au-dessus du titre, comme sur les pages légales ;
  - les 24 termes, sous le titre, puisque le lien de retour tient la place au-dessus.
- **Le jour affiché est toujours celui du `<lastmod>`**, dans un `<time dateTime>`. `termUpdatedAt()` devient la source unique du sitemap et de la page de terme. `formatLongDate()` est partagée avec les pages légales.
- **Le libellé** était celui des pages légales (`LEGAL_UI`, validé avec elles). Il passe dans le dictionnaire (`UI_STRINGS.prosePage.updatedAt`) et repart « à relire », pour son usage neuf.
- **Pas de nouveau composant** dans `src/components/` : `UpdatedLine` vit sous `src/app/[locale]/_prose/`. C'est de l'assemblage de page, et un composant du système demanderait un aperçu de design sync qu'une session cloud ne peut pas reconstruire.
- **Pas de date en JSON-LD sur les termes** : `DefinedTerm` n'est pas une `CreativeWork`, et `dateModified` n'y est pas défini. Le sitemap et la page portent la date.

**A8.3, ce qui est une décision**, en section C avec une reco :
- **C26, les robots d'IA** : tout laisser, et l'écrire.
- **C27, `llms.txt`** : oui, court et généré, sans `llms-full.txt`. Le fichier n'est encore lu par presque personne : 97 % des fichiers sans aucune requête d'IA en mai 2026 selon [PPC Land](https://ppc.land/llms-txt-adoption-rises-8-8x-but-97-of-files-get-zero-ai-requests/), et Google a dit en juillet 2025 ne pas le lire. D'où « court » : le gain est faible, le coût aussi.
- **`FAQPage` n'est pas rouvert** : le refus de septembre tient.

**Vérifié** :
- **Gardes** :
  - `e2e/structured-data.spec.ts` inclut `/how-it-works` dans ses deux tests d'`Article`, sur une liste unique.
  - Un test neuf parcourt le sitemap et exige, sur chaque article, terme et page légale dans les deux langues, la ligne de date. Son `<time>` doit valoir le `<lastmod>` et son texte le jour écrit dans la langue de la page. Il compte 68 pages, pour qu'une famille perdue par le sitemap ne passe pas en silence.
  - Tests unitaires : `formatLongDate` en FR et en EN, sans glisser au jour d'avant ; `termUpdatedAt` ; la liste des pages `Article`.
- **Non-vacuité**, dans un seul build, en retirant l'`Article` et la ligne de `/how-it-works` et en affichant la date de repli sur les termes : les trois tests rougissent. Ils nomment exactement `/en` et `/fr/how-it-works`, puis chacun des 24 termes dans les deux langues, et rien d'autre.
- **À l'écran**, en FR et en EN, à 1 280 et 390 px (`/how-it-works`, `/aarrr-vs-okr`, `/glossary/churn`, `/privacy`) : la ligne est à sa place, sans défilement horizontal.

**Au passage, `CLAUDE.md`** frôlait son budget de 40 000 caractères. La ligne « Hygiène de dépôt public », close depuis le 2026-09-29, en sort. Sa seule règle encore utile, l'épinglage par SHA de tous les workflows et le test qui l'exige, passe dans `GITHUB.md` §2 : c'est le fichier qu'on ouvre avant de toucher un workflow.

**En production** : PR [#215](https://github.com/ScratchMe/tourdegrowth/pull/215), mergée le 2026-09-30 à 12 h 00 UTC (squash `382eb99`, 20 fichiers, identique à la tête de la PR). Déploiement de production Vercel `READY` sur ce commit, lu par l'API. Relevé par HTTP : `/fr/how-it-works` et `/en/how-it-works` portent un `Article` en JSON-LD, `og:type` à `article` et la ligne « 24 septembre 2026 » / "September 24, 2026" ; `/fr/glossary/churn` et `/en/glossary/churn` portent le 30 septembre, et le sitemap dit `2026-09-24` et `2026-09-30` pour les mêmes adresses. `/en/aarrr-vs-okr` et `/fr/privacy` portent aussi leur ligne.

## A7.13 : « Qui est derrière ? », une réponse qui nomme Antoine (2026-09-30)

C22, tranché par Antoine le 2026-09-29 : c'est une question de calendrier, pas d'anonymat. La réponse le nomme, simplement. La promotion reste discrète pour l'instant : pas de LinkedIn, pas de lancement en grande pompe, et `linkedin` reste dans `EXCLUDED` (`scripts/utm-channels.mjs`).

**Ce qui change** :
- **La FAQ des trois Show HN** (le Tour, le moteur, le jeu) répond à "Who's behind this?" : « I'm Antoine Berthaud, a growth PM; this is a side project, posted from its own account. My name is in the site's footer, and the About page says how it's made. » Pas de lien, donc aucun lien nu, et aucun LinkedIn. « À relire ». Show HN est en anglais seulement : il n'y a pas de texte français à suivre.
- **La règle de `marketing/README.md`** passe de « Jamais le nom » à « Discret pour l'instant : le nom seulement si on le demande, jamais LinkedIn ». Le compte qui poste reste celui du projet, `tourdegrowth`.
- **`brand-review.md`** : le crédit de l'auteur et le relevé d'anonymat sont redatés. Le nom figure désormais dans une ligne collable par Show HN, et nulle part ailleurs ; `LinkedIn` et `cv.` restent absents. Le §8 des campagnes parle d'un « compte de projet », discret pour l'instant.
- **L'outillage d'abord**, puisqu'il aurait arrêté cet item : `relecteur-copie` §5 et `/livrer` §3 ne disent plus « jamais le nom d'Antoine », mais « seulement dans la réponse à « qui est derrière ? », jamais LinkedIn ». Le commentaire de `utm-channels.test.ts` dit « pas maintenant », et le test garde `linkedin` exclu.

**Ne change pas** : les mentions « pseudonyme » qui désignent le compte `tourdegrowth` (le kit, le calendrier des Show HN), `GROWTH-PLAN.md` (déjà précisé le 2026-09-29) et le relevé de référence de `brand-review.md` (ce qui a été appliqué le 2026-09-24).

**Vérifié** : `grep` de `Antoine`, `Berthaud`, `LinkedIn` et `cv.` dans les lignes collables de `marketing/` : le nom n'apparaît que dans les trois réponses, et ni LinkedIn ni le CV nulle part. `check-lengths.mjs` : 71 longueurs, aucun écart. `utm-channels.test.ts` : 15 tests passent.

**En production** : PR [#216](https://github.com/ScratchMe/tourdegrowth/pull/216), mergée le 2026-09-30 à 12 h 12 UTC (squash `e456679`, 11 fichiers, identique à la tête de la PR). Déploiement de production Vercel `READY` sur ce commit, lu par l'API : le commentaire d'un test sous `src/` déclenche un build, sans rien changer au site. Le texte vit dans `marketing/`, pas sur une page.

## A7.11 : les e2e de `/r/<id>` par le vrai chemin, sur l'émulateur Firestore (2026-09-30)

C17, délégué à la session le 2026-09-29 : **aucune porte de test dans le code de production**, un vrai `/r/<id>` lu dans l'émulateur Firestore. Jusqu'ici, toute spec de composition passait par `/r/sample`, une branche à part qui ne lit jamais Firestore et ne rend jamais la vue propriétaire. Le chemin des lecteurs (un document stocké, rétréci par le modèle de vue, sérialisé vers le client) n'avait aucun e2e.

**Comment** :
- **L'émulateur est le jar** que la CLI Firebase téléchargerait (v1.22.0, 136 Mo). La CI le télécharge directement, vérifie son SHA-256 et le lance sur le JDK 21 de l'image. C'était l'option la plus légère des trois chiffrées : `firebase-tools` en `devDependency` télécharge le même jar en plus du paquet, et l'image Docker gcloud dépasse le gigaoctet. **Pas de dépendance npm**, donc pas de barrière §0.
- **Les identifiants sont inventés pour le job** : un projet `demo-` (que l'émulateur traite hors ligne) et une clé RSA générée à la volée, que `cert()` exige bien formée et que l'émulateur ne vérifie pas. **`admin.ts` ne change pas.** Vérifié en local avant d'écrire la CI : `firebase-admin` écrit et relit l'émulateur avec cette clé.
- **Les données** : `e2e/global-setup.ts` écrit quatre résultats par `createSubmissionFlow` et le vrai `saveSubmission`, le chemin de `/api/submissions` : un goulot net (la rétention), un partagé, un « à niveau », et un résultat avec un Deep dive écrit par le vrai `saveDeepDive`. Il écrit aussi un document **volontairement mal formé**. Il refuse une adresse d'émulateur qui ne serait pas locale.
- **La spec** `e2e/result-real.spec.ts` (12 tests) :
  - **la garde de payload compte ce qui traverse** (convention 11). Elle lit le document stocké, en tire **toutes** ses clés, et exige qu'aucune ne traverse, hors une liste de clés publiques qui donne chacune sa raison. Une valeur sentinelle ne doit jamais apparaître non plus ;
  - l'étape et l'action pour un visiteur ;
  - l'image de partage, qui se charge ;
  - l'encart du jeu ;
  - la vue propriétaire (le détail du score et le Deep dive) ;
  - les deux autres états du bloc goulot ;
  - l'action du Deep dive.
- **`seedOwnedResult` prend les réponses en option** : le détail du score les lit sur l'appareil, jamais sur la page (R-12).

**Ce que la relecture de sécurité a trouvé, et corrigé avant la PR** :
- **La clé jetable serait partie en clair dans le log public** : le runner imprime les variables de `$GITHUB_ENV` en tête de chaque étape suivante. Elle n'ouvrait rien, mais c'était une « clé privée dans un log » à trier pour chaque scanner. Elle attend maintenant dans un fichier de `$RUNNER_TEMP`, que seule l'étape e2e lit.
- **`error-page.spec.ts` serait devenue vacante** : elle comptait sur l'absence de Firestore pour qu'un UUID inconnu fasse échouer la lecture. Avec l'émulateur, c'est une 404, que sa regex acceptait aussi. L'écran d'erreur (R2-23) se prouve maintenant sur le document mal formé, et la 404 a son propre test.
- **La garde ne voyait pas les champs du Deep dive** tant que tous les résultats avaient `deepDive: null`. Le résultat `deep` porte `modelUsed` et les deux champs hérités d'avant R2-20 (`contextAnswers`, `freeContext`), marqués d'une sentinelle.
- **La recette locale** vérifie aussi le SHA-256. Six commentaires qui disaient « la CI n'a pas Firestore » sont remis à jour.

**Vérifié** :
- **Non-vacuité, deux fois** :
  - remettre `resolveBottleneck(submission.pillars)` (la fuite historique de `rawPoints`) fait rougir la garde sur les deux résultats qui nomment une étape, et sur `rawPoints` seul ;
  - passer le Deep dive brut au lieu de `toDeepDiveView` la fait rougir sur le résultat `deep` seul, en nommant exactement les six clés stockées.
- **Sans l'émulateur**, les 12 tests sautent avec leur raison, comme le nouveau test de 404, et `global-setup.ts` n'écrit rien.
- **La suite complète avec l'émulateur** : 639 specs, 634 passées, 5 ignorées par construction, aucun échec. Aucune spec existante n'a changé de comportement.
- `relecteur-securite` est passé sur le diff. Ses trois constats sont traités, et ses deux angles morts aussi (le SHA n'est pas recoupé contre Google, mais un faux hash échoue fermé ; les champs du Deep dive sont couverts ci-dessus).

**En production** : PR [#217](https://github.com/ScratchMe/tourdegrowth/pull/217), mergée le 2026-09-30 à 12 h 22 UTC (squash `47f8e75`, 18 fichiers, identique à la tête de la PR). **Le premier passage de la CI avec l'émulateur**, lu dans le log du job : 650 specs passées et 5 ignorées, les cinq « jeu fermé » par construction, donc les 12 de `result-real.spec.ts` et le test de 404 ont tourné, et le processus `java` de l'émulateur est arrêté au nettoyage. Déploiement de production Vercel `READY` sur ce commit, lu par l'API : rien ne change sur le site, seuls la CI, les e2e et un commentaire de test bougent.

## A7.10 : chez le propriétaire, « Partager » est le primaire (2026-09-30)

C16, tranché par Antoine le 2026-09-29, captures de la vue propriétaire à l'appui. Sur son propre résultat, le propriétaire a **« Partager ce résultat » comme seul bouton plein**. « Refaire le Tour » passe secondaire. Le visiteur ne change pas : son primaire reste « Fais ton propre Tour → », et le bouton de la carte de partage reste secondaire chez lui.

**Ce qui change** :
- **`ShareCard`** prend `shareVariant` (`secondary` par défaut). C'est la page qui le choisit, d'après `isOwner`, jamais le défaut. Aucune copie neuve : les libellés existaient.
- **`ResultView`** : « Refaire le Tour » passe en `secondary`, et la racine porte `data-owner` chez le propriétaire.
- **Sur mobile, chez le propriétaire, la carte de partage passe au-dessus de la rangée de boutons** (`.layout[data-owner]`). C'est ce qui avait fait annuler le premier essai : un primaire sous un secondaire. Sur desktop, rien ne bouge, puisque les deux sont dans des colonnes différentes.
- **Le coût, mesuré et épinglé** : le lecteur d'écran du propriétaire entend la carte de partage en dernier, mais la voit avant les boutons. Son pire écart d'ordre de lecture passe de 2 à 3, et de 3 à 4 avec l'encart du jeu. `slotShare` est le pire dans les quatre cas. `result-reading-order.test.ts` lit maintenant l'ordre propriétaire dans la feuille, et vérifie aussi que, sur desktop, chaque colonne reste dans l'ordre de la source. Remonter la carte dans la source ferait payer chaque visiteur, le lecteur de la boucle de croissance. Les chiffres du visiteur ne bougent pas.
- **Le contrat de design** : `ShareCard.prompt.md` (retour 03), `.design-sync/conventions.md` et l'aperçu disent « secondaire pour un visiteur, primaire pour le propriétaire ». L'aperçu gagne une histoire `Owner`, d'où 245 cellules attendues à la prochaine synchro (B3).
- **Le commentaire de la rangée de boutons** raconte la décision au lieu de l'essai annulé.

**La mesure** : l'événement de partage existe déjà. **Le changement date du merge de cette PR, le 2026-09-30** : c'est la date à partir de laquelle lire l'avant et l'après dans `/admin/stats`.

**Vérifié** : un vrai `/r/<id>` sur l'émulateur (A7.11), dans `result-real.spec.ts`.
- **Le propriétaire, en FR et en EN, à 1 280 et 390 px** :
  - le seul bouton plein visible est « Partager », et « Refaire le Tour » est en contour ;
  - à 390 px, la carte de partage est au-dessus de la rangée ;
  - le décalage de mise en page qui suit le montage reste sous 0,1, le seuil « bon » des Web Vitals. La bascule se fait sous le premier écran d'un téléphone.
- **Le visiteur** : son Tour reste le seul primaire, et le partage vient après, à 390 px.
- **Non-vacuité** : remettre l'ancien primaire et retirer l'ordre propriétaire fait rougir les quatre tests propriétaire, et eux seuls, ainsi que trois variantes du test d'ordre de lecture.
- **À l'écran**, en FR et en EN, à 1 280 et 390 px.

**En production** : PR [#219](https://github.com/ScratchMe/tourdegrowth/pull/219), mergée le 2026-09-30 à 12 h 33 UTC (squash `6d6f2bc`, 11 fichiers, identique à la tête de la PR ; #218, d'une autre session, a pris le numéro d'avant). Le log de sa CI : 655 specs passées, 5 ignorées par construction. Déploiement de production Vercel `READY` sur ce commit, lu par l'API. Relevé par HTTP : la feuille servie par `/r/sample` porte la règle `data-owner`, et la page du visiteur n'a ni `data-owner` ni d'autre bouton plein que « Take your own Tour → » ; le partage y reste en contour. La vue propriétaire n'est pas observable en production sans le cookie de l'appareil : elle est prouvée par `result-real.spec.ts` sur l'émulateur.

## Extension 04 du design system, lot a : les primitives de formulaire, rien de câblé (2026-09-30)

**Le retour.** Déposé dans le projet Claude Design par la session (#208), lancé par Antoine, écrit par Claude Design dans le projet même, sous `design/ds-extension-04-return/`. Recopié ici par la session, fichier par fichier : **les sous-agents n'ont pas `DesignSync`** (« disabled for this session, in subagents as well »), quatre l'ont confirmé. 46 fichiers texte ; les huit planches PNG, le build de la planche et son instantané de feuilles sont restés dans le projet (`design/ds-extension-04-return/COPIE.md` dit pourquoi, et que les espaces insécables de la prose ont pu devenir des espaces). Le retour fait autorité, comme 01 et 03.

**Les dix-huit réponses, pour ne pas rouvrir le document** : le libellé est une phrase en Inter (`--field-label`), jamais le méta-libellé mono ; une erreur se lit sans couleur (bord à 3 px, message en 600 derrière un filet de 3 px) ; seul un champ facultatif porte un mot ; un rayon de champ à 6 px pour qu'un champ et un bouton ne se ressemblent plus ; le compteur d'une ligne va dans la rangée du libellé, à partir de 80 % ; un nombre ressemble à un nombre (chiffres tabulaires en Inter, boîte à la taille de la grandeur, unité dans la boîte, placée par la langue) ; une erreur de lecture et une règle ont le même traitement, une règle sur deux champs appartient à la paire ; le chevron de la plateforme reste (le système n'a pas de glyphe vers le bas) ; un mois est une liste, un jour trois listes natives ; un seul rond de radio, celui d'`AnswerOption` ; `Choices` n'est pas `AnswerOption` généralisé ; une case à cocher dessinée ; une liste de cases est un fieldset de lignes, pas des cartes ; `Segmented` reçoit `labelledBy` et `SegmentedField` disparaît ; les noms suivent le système, plus un axe `fit` ; deux densités sur `size` ; et onze choses que les copies faisaient mal, dont la raison d'une option « bientôt » à **1,91:1** (l'opacité, que la CI ne mesure pas), les champs à 15 px qui font zoomer iOS et l'anneau rouge de l'audit. **Aucune ne contredit une contrainte du brief** : vérifié sur les fichiers eux-mêmes (aucune couleur en dur, aucun primitif, aucune opacité, 44 px partout, natif dessous, aucune icône).

**Une question, tranchée par Antoine le même jour** : l'audit venait d'être mis entre parenthèses (#210, après la mission S-15). Le porter quand même ? Oui : c'est un portage qui retire une copie, pas une fonctionnalité.

**Ce qui est porté** : `Field` (et `FieldRow`, dont la mise en page nomme les parties de `Field` et vit donc dans sa feuille), `TextField`, `NumberField`, `Select`, `DateField`, `Choices`, `Checkbox`, `FormSummary` dans `src/components/core/` ; `TextArea` selon son delta ; `Segmented` avec `labelledBy` ; `AnswerOption` lit `--size-mark` et `--mark-inset`. Les jetons sont **répartis dans leurs couches** plutôt que dans un `forms.css` à part : `colors.css` et `tokens.ts` (seize dérivés), `typography.css`, `shape.css`, `spacing.css`. La logique pure va dans `src/lib/forms/` : `number.ts` **déplacé du moteur** (plus complet que le `groupAsTyped` du retour : suppression vers l'avant, apostrophes, décimale en cours de frappe), `field.ts`, `date.ts`. Aucun écran ne monte les primitives : le moteur et l'audit les prennent en b et c.

**Écarts assumés, signalés plutôt qu'absorbés** :
- **`NumberField` prend un nombre** (`number | null`) et garde le texte tapé, comme le moteur ; le retour le voulait en texte analysé par l'appelant, ce qui aurait redonné une copie de la logique de brouillon au moteur et à l'audit. Son erreur de lecture (`parseError`) paraît quand on quitte la case, comme le retour le demande.
- **`--mark-color: currentColor` n'est pas un jeton** : `token-sources.test.ts` exige une couleur littérale. Les marques écrivent `currentColor`.
- **Trois seuils ne sont pas des jetons** (80 %, 480 px, 560 px) : aucune feuille ne pourrait les lire. `--form-gap-*` arrive en b avec son premier lecteur (`dead-tokens.test.ts`).

**Ce qui change en production** : seul le `TextArea` du Deep dive, selon son delta. Mesuré dans le navigateur : rayon de 14 à **6 px**, corps de 15 à **16 px**, anneau décalé de **2 px**, bord à 3 px au-delà de la limite. Vu en EN à 1 280 et en FR à 390.

**Trouvé en vérifiant, et corrigé** : au clavier, l'`<input>` d'un `TextField` traçait son propre anneau sous le bord de la boîte, en plus de celui de la boîte. La règle globale `:focus-visible` pèse ce que pèse `.control` et vient après ; `.control:focus-visible { outline: none }` la reprend.

**Gardes, chacune avec sa non-vacuité** :
- `form-controls.test.ts` : un seul anneau (`--field-focus-ring`, qui est `--focus-ring`) sur toutes les feuilles de contrôle, aucune ne lit `--focus-ring-invert` ; l'input dans la boîte ne trace pas le sien ; aucune opacité autre que `1` pour dessiner un état. Rouge sur les trois erreurs remises une à une (l'anneau rouge sur `Select`, la règle de l'input retirée, `opacity: 0.45` sur une option désactivée), vert sur le code porté.
- Les paires de contraste des nouveaux jetons, papier (16) et nuit (22) : **toutes les valeurs du tableau du retour sont exactes**, au centième.
- 23 tests de balisage par rendu statique (libellé relié, message lu avant l'indice puis le compteur, jamais `type="number"`, « 26 000 » affiché avec U+00A0, rien de pré-sélectionné, trois listes natives pour un jour, raison d'une option désactivée lue avec elle, `labelledBy`), et les tests de `lib/forms` (mois à cheval sur une année, 31 février, aller-retour `aaaa-mm-jj`, seuil du compteur).

**Vérifié à l'écran** sur une page d'échafaudage jamais commitée qui rejoue la planche du retour avec les vrais composants : papier et nuit, FR et EN, 390 et 1 280, **aucun débordement horizontal dans les huit** ; sections relues en papier/EN/1 280 et nuit/FR/390, anneau au clavier de nuit sur les quatre familles, et `--select-inset` mesuré au pixel : la valeur d'un `Select` commence sur la même colonne que celle d'un `TextField` (18 px du bord, écart nul, Chromium seulement). La ligne choisie en ambre est grande dans une feuille compacte de nuit, comme Claude Design le signalait : c'est le langage de sélection du système, à revoir sur le vrai écran du moteur en b.

**Design sync** : les neuf primitives sont dans `componentSrcMap` avec leurs aperçus, les conventions ont une section « Forms » et l'axe `fit` ; rien n'est envoyé (la session n'avait pas le skill `/design-sync`). Les aperçus ont été vérifiés par le compilateur contre les vrais composants, pas rendus par le pilote.

**Vérifié** : `tsc` et `eslint` propres, `next build` propre, **2 328 tests unitaires** (194 fichiers) après la fusion de `main`, couverture au-dessus des seuils, et la suite Playwright complète sur un build de production (`GAME_ENABLED=true`, comme la CI) : **636 passées, aucun échec, 5 ignorées par construction** sur 641, dont le moteur, l'audit, l'accessibilité et le contraste.

**Reste** : A10.b, c et d ; `--select-inset` dans WebKit et Gecko ; la re-synchro.

## A7.12.a et A7.12.b : les captures du Tour refaites, celles du moteur et du jeu provisoires (2026-09-30)

C21, tranché par Antoine le 2026-09-29 : capturer maintenant, refaire à l'ouverture.

**A7.12.a, le Tour** : les 22 fichiers de `marketing/assets/` (`01` à `05`, `og-*`) sont refaits par `scripts/kit-screenshots.mjs`. Ils sont pris contre un build de production local **aux produits fermés**, comme la production : le bandeau dit « bientôt » pour le moteur et le jeu. Le code est celui du haut de la pile, donc après I + B, l'encart du jeu sous le bouton (A7.7) et la carte de partage du propriétaire (A7.10). Les 13,8 Mo passent à 3,05 Mo en palette. Les annuaires de D10 peuvent partir.

**A7.12.b, le moteur et le jeu** : douze fichiers `provisoire-*`, listés comme tels dans `kit.md`, avec la consigne de ne jamais les publier tels quels. On y trouve :
- le tableau du moteur sur l'exemple rempli (§6.0), en FR et en EN, desktop et mobile ;
- le hub du jeu, aux mêmes quatre formats ;
- un trimestre et décembre (le chemin A), en desktop.

Ils sont pris par `scripts/kit-provisional.capture.ts`, un fichier Playwright avec sa propre configuration (`scripts/kit-capture.config.ts`), hors de `e2e/`, donc jamais lancé par la CI. Il reprend les aides du jeu et les fixtures du moteur des specs : les mêmes données que les tests. Refaire ces captures à l'ouverture (A7.12.c) se fait donc en une commande.

**Relues avant d'être nommées**, et deux corrections en route :
- la première capture « tableau du moteur » montrait l'intro, le tableau étant sous la ligne de flottaison. Elle défile maintenant jusqu'au tableau ;
- les pages du jeu, prérendues, affichaient le moteur « bientôt » : le bandeau lit le drapeau du moteur au build. Le build des captures pose donc les deux drapeaux, et la configuration le dit.

**Reste A7.12.c** : refaire à l'ouverture de chaque produit, puis retirer le préfixe.

**En production** : PR [#220](https://github.com/ScratchMe/tourdegrowth/pull/220), mergée le 2026-09-30 à 13 h 00 UTC (squash `9a359c3`, 40 fichiers, identique à la tête de la PR, rebasée sur #218 d'une autre session). Les captures sont servies par le dépôt public à ce commit, au même poids que dans la branche (`01-landing-fr-desktop.png` : 266 313 octets ; `provisoire-07-game-hub-fr-desktop.png` : 156 163). Le déploiement de production Vercel de ce commit porte aussi le code de #218, arrivé juste avant : `READY`, lu par l'API. Rien de cette PR ne change le site.

## Extension 04 du design system, lot b : le moteur sur les primitives (2026-09-30)

**Ce qui est porté** : tous les champs du moteur passent sur les primitives de `src/components/core/`. Cela couvre les réglages et la mise en route (`Setup`), les deux écrans d'étapes (la cible, la base), la fiche d'un chiffre (`MetricSheet`, `ValueEditor`), le triage « Je ne le trouve pas » et ses deux lectures, la confirmation d'effacement, l'import et la copie de secours d'une demande. Le constructeur de slides suit : `deck/AskForm.tsx` perd son `Field`, son `DraftInput` et son analyseur, et les cinq cases à cocher de l'écran du deck deviennent des `Checkbox`. `deck.module.css` perd `.field`, `.control`, `.check` et leurs voisines. Plus aucun fichier du moteur n'importe `_engine/_ui/`, que A10.d supprime avec les autres copies. Densités, comme le retour le fixe : `md` pour la mise en route et les étapes à une question, `sm` pour une fiche et pour le deck. `--form-gap-sm` et `--form-gap-md` arrivent avec leurs premiers lecteurs.

**Ce qui change à l'écran** :
- Les libellés sont des phrases en Inter, et non plus du méta en capitales.
- L'unité est dans la boîte : « % » (« 30 % » avec son espace insécable en français), et la devise placée par la langue (« €26,000 », « 26 000 € »). Elle est cachée des lecteurs d'écran, qui entendent à la place un mot pris dans `Intl` (« per cent », « euros »). **Aucun mot de copie neuve.**
- Deux comptes forment une `FieldRow` avec « sur » : les boîtes restent sur une ligne quelle que soit la hauteur des libellés et des indices partagés, et le bloc qui plaçait ces indices sous la paire disparaît.
- « Au moins » et « Au plus » forment une paire sans joint (`FieldRow` le permet désormais : le joint vide reste en place, caché). « Le minimum dépasse le maximum » appartient à la paire.
- Le mois est un `DateField`, la devise un `Select` à sa taille, et les deux fenêtres un `Field group` avec `Segmented labelledBy`.
- Les modèles « bientôt » sont en tirets, à pleine lisibilité : l'opacité à 0,45 mettait leur raison à 1,91:1.
- Une pièce qui manque à l'enregistrement se dit aussi sous son propre champ. La ligne sous le bouton reste l'index de toutes. Aucune copie neuve : c'est `saveNeeds`, rempli avec le seul nom du champ.

**Deux défauts corrigés** :
- **Le constructeur de slides lisait « 26,000 » (anglais) comme 26.** Son montant passe maintenant par `NumberField`, qui lit comme le lecteur écrit.
- **Un défaut d'A10.a, vu à l'écran ici.** Quand une unité a son nom pour les lecteurs d'écran, le `span` caché était le dernier enfant de la boîte ; `.affix:last-child` ne trouvait plus le signe, qui collait à 3 px du bord au lieu de 14. Le `span` sort de la boîte. La page d'échafaudage d'A10.a ne l'avait pas montré : elle ne donnait pas de nom à une unité qui suit. Un test de balisage le garde : il rougit sur l'ancien code.

**Deux choix, signalés** :
- La limite des textes du deck devient souple, comme partout. Au-delà, le texte reste à l'écran avec son compte et son message, mais n'est pas transmis : `validate.ts` refuserait tout l'état pour une puce trop longue. Avant, un `maxlength` dur coupait un collage au milieu d'un mot.
- Le montant du deck garde sa devise dans le libellé (« Montant (€) ») : pas de signe dans la boîte en plus, pour ne pas toucher à la copie.

**Gardes, avec leur non-vacuité** :
- `e2e/engine-forms.spec.ts` vérifie trois choses (non-vacuité : sur un build où `NumberField` lit avec `Number(text)` et où `Select` reprend l'anneau rouge, les trois rougissent) :
  - « 26 000 » tapé en français est lu 26 000 : le taux vivant suit, et la boîte se regroupe avec l'espace insécable ;
  - « 26,000 » tapé en anglais dans le deck est stocké 26 000 ;
  - un seul anneau de focus, celui du système, sur chaque sorte de contrôle du moteur : une rangée de choix, un mois, la devise, un texte, un compte, la source, une case, le texte du deck.
- Côté unitaire, quatre ajouts :
  - `sources.test.ts` : la place de l'unité par langue, son nom, et l'ordre de la liste des sources ;
  - le signe d'une unité reste le dernier enfant de la boîte ;
  - la `FieldRow` sans joint ;
  - les `data-testid` posés sur le contrôle natif.

**Vérifié** : `tsc`, `eslint` et `next build` propres ; **2 335 tests unitaires** (195 fichiers), avec la couverture au-dessus de ses seuils. La suite Playwright complète tourne sur un build de production (`GAME_ENABLED=true`) : **663 specs, 640 passées, aucun échec**. Les 23 ignorées le sont par construction : 5 « jeu fermé », et les specs d'A7.11 sans l'émulateur Firestore local. Cela inclut les e2e du moteur, de l'accessibilité et du contraste. **À l'écran**, en FR et EN, à 390 et 1 280 px :
- la mise en route ;
- une fiche, sous quatre états : deux comptes, un enregistrement refusé, une estimation inversée, deux lectures en conflit ;
- le constructeur de slides et ses réglages.

Aucun débordement horizontal sur les seize vues mesurées. Le « % » de la cible a été re-mesuré après correctif : à 14 px du bord intérieur. Le monde nuit ne concerne pas le moteur, qui est sur papier.

**Hors d'A10, noté** : la ligne « Pour enregistrer, il manque : … » deviendrait naturellement un `FormSummary`. Il faudrait pour cela un titre qui compte, donc de la copie neuve, et c'est une décision qui ne relève pas du portage.

## Extension 04 du design system, lot c : l'audit sur les primitives, avec A9.1 (2026-09-30)

**Porté, bien que l'audit soit entre parenthèses** (#210) : Antoine l'a tranché avant le lot a. C'est un portage qui retire une copie, pas une fonctionnalité. Tous les écrans de `/admin/audit` qui saisissent quelque chose passent sur `src/components/core/` : la nouvelle mission, la ligne et sa définition, les observations, le repère, le contexte, la matrice, le constat et la purge. Tous en densité `sm`, une fiche de champs. Plus rien n'importe `admin/audit/_ui/`, que A10.d supprime.

**Le gros du portage est mécanique** : chaque `Field` + `TextInput`, `NumberInput`, `DateInput` ou `TextArea` devient le champ du système, 82 des 85 champs réécrits par un script jamais commité. Il ne touchait que la forme exacte « un `Field`, un seul contrôle dedans » et laissait le reste à la main : les listes à option vide, devenues des `placeholder`, le mandat en `Segmented` et les deux cases à cocher. En le relisant, une chose avait disparu : la `key` d'un `Field` dans une boucle de la matrice. Le lint l'a vue.

**Ce qui change à l'écran** :
- **Un nombre se lit comme on l'écrit** : « 1 200 000 » ou « 26 000 » sont lus, là où l'ancien `type="number"` les lisait comme rien du tout.
- **Une date se choisit en trois listes, en français** : jour, mois (« janvier »…), année. Plus de `<input type="date">` à la langue du navigateur. Le format du fichier ne change pas (`aaaa-mm-jj`) : `IsoDateField`, une composition de `DateField` et non une copie, fait la traduction. Une date à moitié choisie reste à l'écran sans s'enregistrer, et le 31 février le dit.
- **Le paragraphe rouge des champs manquants disparaît** : c'était la chose la plus bruyante de l'écran, pour un état qui enregistre quand même. Chaque champ requis de la définition porte maintenant l'état `missing`, en tirets, avec « À compléter — l'export signalera cette ligne comme incomplète. » L'argument d'un seuil argumenté porte sa phrase d'origine. Un `FormSummary` au-dessus du bouton les liste, un lien par champ, qui y porte le focus.
- **L'anneau de focus est à l'encre partout**, bouton d'import compris : le rouge donnait au rouge un quatrième sens.

**A9.1 dans la même PR** : 46 guillemets et 26 chaînes à ponctuation haute passent à l'espace insécable. `copy-typography.test.ts` lit désormais le dossier de l'audit, commentaires retirés. Les guillemets sont vérifiés partout, la ponctuation haute seulement dans les chaînes entre guillemets droits : `a ? b : c` est du code. Le texte entre balises JSX n'est pas lu pour la ponctuation haute, aucun motif ne le distingue du code.

**Copie neuve, « à relire »** (`FORM_COPY` dans `labels.ts`) :
- la phrase de lecture, reprise du moteur ;
- la phrase « à compléter » et les trois libellés de la date, repris de la planche du retour ;
- le titre compté du résumé ;
- deux phrases pour une date à moitié choisie et pour un jour qui n'existe pas.

Le paragraphe d'ouverture du résumé reprend la phrase de l'ancien paragraphe rouge.

**Relu par le sous-agent `relecteur-copie`, qui a trouvé trois choses justes** :
- **Un marqueur manquait** sur la phrase de l'argument, devenue une constante reprise dans le résumé.
- **Il restait 18 espaces ordinaires** avant « : » ou « ; » dans du texte JSX que la garde ne lit pas, un dans un gabarit, et un avant « % ». Corrigés.
- **Cette phrase promettait « l'export refusera cette ligne »**, ce qui est faux : l'export écrit le fichier, c'est le validateur qui signale. La même correction avait déjà été faite une fois sur la définition, en phase 1.3b. Elle dit maintenant « le validateur signalera cette ligne », marquée « à relire ».

**Gardes, avec leur non-vacuité** :
- **« 1 200 000 » tapé dans la valeur d'une observation est exporté 1200000** (`audit-rows.spec.ts`). Sur un build où `NumberField` lit avec `Number(text)`, la spec rougit : la valeur manque.
- **La typographie du dossier** (`copy-typography.test.ts`) : remettre des espaces ordinaires dans un seul indice de `DefinitionEditor.tsx` fait rougir les deux vérifications.

**Les e2e de l'audit suivent l'écran** :
- les dates se choisissent par `pickDay` (trois listes) ;
- le résumé remplace les deux paragraphes : `row-missing` contient « Unité », puis disparaît ;
- son lien porte le focus dans le champ ;
- le champ lui-même annonce « À compléter ».

**Vérifié** :
- `tsc`, `eslint` et `next build` propres ; **2 338 tests unitaires**.
- La suite Playwright complète : **663 specs, 640 passées, aucun échec**. Les 23 ignorées le sont par construction : 5 « jeu fermé », et celles d'A7.11 sans l'émulateur.
- **À l'écran**, à 390 et 1 280 px :
  - la nouvelle mission ;
  - une ligne mesurée : définition en `missing`, « 26 000 » dans sa boîte, un 31 février refusé, une date à moitié choisie, et le résumé au-dessus du bouton.

  Aucun débordement horizontal.

## Extension 04 du design system, lot d : les trois copies supprimées, et une garde contre une quatrième (2026-09-30)

**Supprimé** : `_engine/_ui/` (neuf fichiers) et `admin/audit/_ui/` (six fichiers). Le `Field` local et le `.control` du constructeur de slides étaient partis avec A10.b, dont c'étaient les seuls lecteurs. Plus rien ne dessine un contrôle de formulaire hors de `src/components/core/`.

**La garde** (`form-controls-source.test.ts`) lit tous les `.tsx` de `src/` hors de `core/`, commentaires retirés. Elle refuse tout `<select>`, et tout `<input>` dont le `type` n'est pas `file` ou `range`. Restent donc, par leur type, le bouton de fichier de l'import (moteur et audit) et le curseur du « et si ». Le retour pose ses conditions pour les porter : un `Button` secondaire sur un `input` caché, et un curseur toujours à côté d'un `NumberField` qui tient la même valeur. Ce portage est hors A10. **Non-vacuité** : lancée avant la suppression, elle rougissait sur les neuf contrôles des deux copies, un par un.

**Décisions remplacées, et dites** : D17 d'`ENGINE.md` (« composants de saisie locaux à la route ») et la décision 1 de la phase 1 d'`AUDIT-PLAN.md` (« `_ui/` sous la route, jamais ajouté à `src/components/` ») portent une note datée. Le commentaire de `form-controls.test.ts` suit : seul `core/` dessine un contrôle.

**Vérifié** : `tsc`, `eslint` et `next build` propres, **2 340 tests unitaires**. La suite Playwright complète tourne sur la pile c + d : **663 specs, 640 passées, aucun échec**, 23 ignorées par construction. Ni le moteur ni l'audit n'importaient plus rien des dossiers supprimés : `tsc` le confirme, et aucune spec ne bouge.

**En production, A10 (2026-09-30)** :
- **A10.a** ([#218](https://github.com/ScratchMe/tourdegrowth/pull/218), squash `675f4f3`) et **A10.b** ([#221](https://github.com/ScratchMe/tourdegrowth/pull/221), squash `ce0f91d`) sont déployées. Vérifié par le statut `Vercel` du commit (`success`) et par les jetons servis : `--radius-field`, `--field-value`, puis `--form-gap-sm/md`. Le moteur reste fermé (404).
- **A10.c** ([#223](https://github.com/ScratchMe/tourdegrowth/pull/223), `cb13646`) et **A10.d** ([#224](https://github.com/ScratchMe/tourdegrowth/pull/224), `bd32dab`) sont sur `main`, squashs vérifiés (25 et 23 fichiers, arbres identiques aux têtes). Mais **leurs déploiements ont été refusés par Vercel** : « Deployment rate limited — retry in 24 hours », le quota quotidien du compte, un jour de merges en parallèle. Le site répond (200), `/admin/audit` reste fermé (401), et la production tourne sur A10.b. Le piège est dans `VERCEL.md` §1.12, le geste dans `CHANTIERS.md` D11.
- **La re-synchro vers Claude Design** (B3 : 88 composants, 284 cellules attendus) n'est pas faite : cette session n'avait pas `/design-sync`.

## Design sync B3 : les primitives de formulaire dans Claude Design (2026-09-30)

**Envoyé** au projet Claude Design existant (`23b9671c…`), par le chemin atomique : 453 fichiers, aucune suppression, le dossier `design/` du projet laissé tel quel. **88 composants, 292 cellules, 88 aperçus sur 88 rendus**, toutes les cellules notées « bonnes ». Seuls les quatre avertissements connus sont sortis : « Impact », et `GRID_OVERFLOW` sur `DefinitionPopover`, `QuarterNews` et `GlossaryTerm`. L'en-tête de conventions a été relu contre le build : ses 41 jetons et ses noms de composants existent, il n'a pas changé. Ancre : `d1835d51cffd`.

**Les aperçus des primitives ont été refaits**, et c'est le gros du travail. A10.a les avait écrits depuis la planche du brief 04, avant qu'A10.b et A10.c ne les branchent, et seul le compilateur les avait vus. Rendus et notés, huit composants sur onze disaient des choses fausses :
- de la copie de la planche ou de mémoire (« Northwind », une liste de sources inventée, le message « à compléter » de l'audit avec deux-points au lieu du tiret) ;
- un message qui contredisait sa cellule : « moins de 120 caractères » au-dessus d'un compteur à 104/120 ;
- des états qu'aucun appel ne produit : champs désactivés avec une raison inventée, `Select` à compléter, case invalide, ligne invalide du résumé ;
- un doublon : `Segmented.InAForm` refaisait `Field.AroundSegmented`.

Trois agents les ont repris en parallèle, chacun sur des composants distincts, depuis les vrais appels du moteur et de l'audit : copie mot pour mot, valeurs tirées des fonctions du produit sur le moteur d'exemple (`sourceOptions`, `moneyUnit`, `missingByRepairCost`…). Les états jamais produits sont retirés plutôt que réécrits, parce qu'une carte enseigne un usage à l'agent de design. De 46 cellules, les onze composants passent à 54 : d'où 292 et non les 284 annoncés.

**La recapture de contrôle a trouvé deux aperçus faux dans des notes reportées**, sans qu'aucun composant ne soit en cause :
- l'amende du jeu, fixée à 75 000 € par A7.8 dans `levels/retention.ts` : `EventClipping` et `QuarterNews` disaient encore 106 000 € et l'ancien barème ;
- `SpaceStrip`, dont la doc affirmait « the cards are not links » alors qu'A7.9 en a fait des portes.

La méthode pour les trouver la prochaine fois est dans `.design-sync/NOTES.md` (« Re-sync risks ») : lister les commits du modèle et de la copie depuis le dernier envoi, puis chercher les anciennes valeurs dans les aperçus.

**Un défaut du produit corrigé dans la même PR** : les rangées de `Checkbox` étaient arrondies, si bien que le trait tireté posé sur leur bord supérieur s'enroulait vers le bas à ses deux bouts, dans toutes les listes de cases du produit. L'arrondi ne dessinait rien d'autre. `form-controls.test.ts` garde qu'une rangée qui porte un trait n'est pas arrondie ; le test rougissait sur l'ancien CSS. Vérifié à l'écran, à 4×, avant et après.

**Vu et laissé au produit**, sans rien « corriger » dans un aperçu :
- `CHANTIERS.md` A11 : « 1 jours », pas de bord rouge sur un 31 février, le joint de `FieldRow` qui s'écarte de sa boîte, et une espace ordinaire entre un nombre et son mot dans trois chaînes du moteur ;
- deux questions de design : C28, les 6 px entre une unité et son chiffre (c'est le dessin du retour lui-même, « € 500 ») ; C29, « facultatif » écrit dans les libellés alors que la prop `optional` n'est passée par aucun appel.

**Vérifié** : le driver final a reporté les 15 notes sans en effacer aucune et n'a rien laissé en attente. `report_validate` : 88, 0 défaut. Après l'envoi, `list_files` montre les 88 dossiers de composants.

## A11, C28 et C29 : ce que B3 avait trouvé, livré le soir même, et Claude Design re-synchronisé (2026-09-30)

**Les deux décisions d'Antoine**, prises le soir même dans une séance « point par point, plusieurs options et une reco » :
- **C28** : l'unité porte son espace, la boîte n'en ajoute plus (la reco). `Field.module.css` retire les 6 px entre l'affixe et le chiffre ; `NumberField` réserve la même largeur. La chaîne donne « €500 » et « 20% » en anglais, « 21 000 € » et « 20 % » en français. `moneyUnit` reprend l'espace qu'`Intl` met à côté du signe, au lieu de la supposer : aucune dans « €500 », une insécable dans « 500 € » comme dans « CHF 500 ».
- **C29** : « facultatif » passe par la prop `optional` (la reco). Le mot sort des quatre libellés du moteur (`companyLabel`, `definitionNote`, `target`, `repairComment`) et se dessine plus discret après eux, comme le dessine le retour 04. La nouvelle clé `workbench.optional` et les quatre libellés raccourcis sont « à relire » (convention 6).

**A11, livré** ([#227](https://github.com/ScratchMe/tourdegrowth/pull/227)) :
- **A11.1** : `wordUnit` choisit le mot par `Intl.PluralRules`, avec la nouvelle clé `workbench.day`, « à relire ». On lit « 1 jour », « 1,5 jour », « 2 jours », « 1 day », « 0 days ». Chaque borne de l'estimation prend l'unité de son propre chiffre.
- **A11.2** : quand les trois parties d'une date sont choisies et que le jour n'existe pas, les trois passent en invalide. Une date incomplète ne marque que ses parties vides.
- **A11.3** : le premier champ d'une `FieldRow` couvre aussi la colonne du joint, et son libellé ne dimensionne plus les colonnes (`contain: inline-size`). « sur » se pose contre la boîte.

**A11.4 est clos sans changement, après mesure.** La copie validée n'a pas de convention unique entre un nombre et son mot. Sur les chaînes françaises évaluées, « {n} jours » prend une espace ordinaire dans 25 chaînes (glossaire, catalogue d'audit, jeu, moteur) et l'insécable dans 16 ; « mois » et « min » sont partagés de même, et un compte de choses prend partout l'espace ordinaire. Une garde limitée aux jours a été écrite, puis retirée : elle rougissait sur ces 25 chaînes validées. Harmoniser serait une passe de copie à faire relire par Antoine, pas un correctif.

**Gardes, chacune rouge sur l'ancien code** :
- `sources.test.ts` : l'espace de l'unité (« €500 », « 500 € », « CHF 500 », « 20 % ») et les pluriels. Quatre tests rougissent sur l'ancien `sources.ts`.
- `form-controls.test.ts` : aucun `padding` entre l'affixe et le chiffre. Rouge sur l'ancien CSS.
- `form-primitives.test.ts` : le 31 février donne trois `aria-invalid`, une date incomplète aucun. Rouge sur l'ancien `DateField`.
- `engine-copy.test.ts` : aucun libellé ne contient « facultatif » ou « optional ». Rouge sur l'ancienne copie.
- `engine-forms.spec.ts`, sur la fiche du CAC en français : le joint est à 9 px de la boîte, pour un écart de colonne de 12. Il était à 114 px avant.

**Vérifié** :
- `tsc` et `eslint` propres, **2 345 tests unitaires** ;
- les e2e d'accessibilité (bureau et mobile), de l'audit, du moteur et des contrôles natifs : **221 passées** sur un build de production ;
- à l'écran, en français et en anglais, à 390 et 1 280 px : « 21 000 € », « €21,000 », « 1 jour / 3 jours », « 1 day / 3 days », les mots « facultatif » et « optional » après leur libellé, le joint contre sa boîte, et le 31 février bordé de rouge sur ses trois listes.

**Claude Design, re-synchronisé deux fois ce soir-là.** Le premier envoi porte l'ancre `f8933d513a1e` : cinq composants recapturés et renotés (26 cellules). Ensuite, le relecteur de copie (`relecteur-copie`, lancé sur le diff avant la PR) n'a rien trouvé dans le produit, mais trois choses dans ce qui part vers l'agent de design :
- l'en-tête de l'aperçu `TextField` disait encore qu'aucun appel ne passe `optional` ;
- celui de `FieldRow` décrivait encore le joint d'avant A11.3 ;
- des numéros de ligne cités par les aperçus étaient décalés par le diff lui-même, et les exemples de l'insécable (`conventions.md`, `NumberField`) étaient tapés avec des espaces ordinaires.

Corrigés, les numéros de ligne remplacés par les noms de clés, qui ne bougent pas. `conventions.md` dit aussi maintenant son exception : le contexte libre du quiz, écran à une question, écrit « (optionnel) » dans la question. Second envoi : rendus identiques, sources seules ; 88 composants, 292 cellules, 453 fichiers, ancre `8235f4e6de01`.

**En production le soir même, et D11 n'a plus d'objet.** Le squash de #227 (`c8b869a`, 23 fichiers, arbre identique à la tête) a été déployé à 21 h 12 UTC : statut `Vercel` du commit à `success`, là où celui d'A10.d (`bd32dab`) dit encore « Deployment rate limited ». Le quota s'était libéré. Comme `main` porte tout, ce déploiement emporte aussi A10.c, A10.d et B3, que Vercel avait refusés. D11 est retiré de `CHANTIERS.md`, et le rappel du lendemain est supprimé.

Vérifié en HTTP :
- `/en`, `/fr` et `/en/glossary` en 200 ;
- le moteur et le jeu fermés (404) ;
- `/admin/audit` en 401.

Les champs eux-mêmes sont derrière l'aperçu propriétaire et le mot de passe admin : ils ne se vérifient pas d'ici. Ce que la production sert est le build que la CI a fait passer sur la même tête.

## C26 et C27 : les robots d'IA laissés et nommés, `/llms.txt` et `/llms-full.txt` générés (2026-09-30)

**Les deux décisions**, prises par Antoine le 2026-09-30, une question à la fois, chacune avec sa reco :
- **C26, « tout laisser, et l'écrire »** (la reco). `robots.txt` servait `User-Agent: *` / `Allow: /` sans rien dire des robots d'IA : c'était un défaut, c'est maintenant un choix écrit.
- **C27, « court et généré, plus `llms-full.txt` »**. La reco était le fichier court seul : l'entrée A8 ci-dessus disait « sans `llms-full.txt` ». Antoine a choisi d'y ajouter le texte intégral.

**C26.** `src/lib/seo/ai-agents.ts` tient deux listes, et `robots.ts` les sert en deux groupes, tous en `Allow: /`, avant le groupe `*` :
- les robots d'**entraînement** : GPTBot, ClaudeBot, Google-Extended, Applebot-Extended, CCBot ;
- les robots de **réponse**, qui lisent une page pour répondre à quelqu'un ou l'indexer pour une recherche par IA : OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User.

Google-Extended et Applebot-Extended sont des jetons, pas des robots : ils ne visitent rien, ils disent ce que Google et Apple peuvent faire de ce que leurs robots de recherche ont lu. Le commentaire le dit, pour qu'une session future ne les « corrige » pas. `robots.test.ts` refuse tout `Disallow` dans n'importe quel groupe : en ajouter un, c'est rouvrir C26, et le test est l'endroit qui le dit.

**C27.** Deux routes statiques (`force-static`), `src/app/llms.txt/route.ts` et `llms-full.txt/route.ts`, qui ne font qu'appeler un constructeur de `src/lib/seo/` :
- **`/llms.txt`** (~10 Ko) suit la forme de llmstxt.org : un H1, un résumé cité, un paragraphe, puis une section H2 de liens par famille de pages. Chaque titre est le H1 de la page, chaque description sa méta-description ou sa définition : rien n'y est écrit à la main, hors l'en-tête. **Sa portée est celle du sitemap, drapeaux compris** : le jeu et le moteur n'y figurent que s'ils sont ouverts au build. En anglais, chaque ligne porte l'adresse française à côté.
- **`/llms-full.txt`** (~188 Ko) porte le texte anglais de `/how-it-works`, des deux pages « porte ouverte », des cinq comparaisons et des 24 termes, construit depuis les champs que les pages impriment et dans leur ordre. Chaque intertitre est un libellé que la page imprime déjà (`UI_STRINGS`), et chaque partie s'ouvre sur ses deux adresses et le jour de sa mise à jour, celui que la page affiche depuis A8. Il laisse de côté la landing et About, déjà listées, les pages légales, et le jeu et le moteur, qui sont des outils et non du texte.
- **Les deux constructeurs ne s'importent pas l'un l'autre** : ce qu'ils partagent (le résumé, la forme d'une adresse) est dans `llms-shared.ts`, pour que la route du texte intégral n'embarque ni le moteur ni le jeu.

**Ce qui les tient aux pages** (`llms.test.ts`) :
- l'ensemble des liens de `/llms.txt` est exactement celui du sitemap, jeu et moteur fermés comme ouverts ;
- `/llms-full.txt` couvre chaque clé de `CONTENT_PUBLISHED_AT` et chaque terme, une fois chacun ;
- il contient chaque définition, chaque verdict, chaque question du Tour, la première réponse de chaque FAQ et le texte du barème ;
- il n'a ni français ni gabarit non rendu (`{n}`, `[object`, `NaN`).

La garde « undefined » a dû être resserrée : le glossaire dit lui-même « an undefined moment ».

**Non-vacuité** :
- un `disallow` ajouté à un groupe fait rougir `robots.test.ts` ;
- retirer une comparaison ou un terme de `/llms-full.txt` fait rougir quatre tests.

**Le poids, mesuré plutôt que supposé.** Les plafonds de `content-fan-in.test.ts` ont rougi sur sept modules de contenu, puisque deux points d'entrée de plus les atteignent. Un `vercel build --prod` hors ligne a montré que :
- les deux routes sont préconstruites, mais leur fonction est un lien vers le bundle partagé de `quiz/share/[locale]`, avec `robots.txt` et `sitemap.xml` ;
- elles l'alourdissent de 386 Ko, dont 284 Ko pour le morceau du glossaire, soit 6,35 Mo au total ;
- c'est sous le seuil d'~1 Mo de `/livrer` §0, donc pas de question à Antoine.

Les plafonds sont relevés, chacun avec sa raison, et le paragraphe du test cite la mesure.

**La relecture de la copie** (`relecteur-copie`) a trouvé deux chaînes neuves sans marqueur : le libellé de la version française dans `/llms.txt` (en minuscule, alors que l'autre fichier écrivait `French`) et les deux libellés de langue de chaque adresse de `/llms-full.txt`. Les deux sont maintenant sous un marqueur. Elle a aussi relevé quatre inexactitudes, toutes corrigées :
- « Full text of these pages » alors que le fichier ne les couvre pas toutes ;
- « The Tour » comme titre d'une section qui n'est pas le Tour ;
- « each link » alors que le lien du texte intégral n'a pas de version française ;
- un résumé qui promettait toujours une étape, alors que l'état « level » n'en nomme aucune.

Tout l'en-tête est « à relire » et hors de tout bon à tirer, comme `CLAUDE.md` le liste.

**La relecture de sécurité** (`relecteur-securite`) n'a rien trouvé de bloquant. Elle a vérifié quatre points :
- rien de non public dans les deux fichiers, ni nom, ni LinkedIn, ni variable d'environnement autre que `SITE_URL` ;
- aucune lecture par requête ;
- l'aperçu propriétaire ne peut pas fuir dans un fichier construit, puisque les deux drapeaux sont lus avec `ownerPreview: false` ;
- le proxy n'est pas touché.

Elle a relevé un trou : seules les lignes d'adresse de `/llms-full.txt` étaient comparées au sitemap, pas ses autres liens (termes liés, étapes du diagnostic). Un test le comble : toute adresse du texte intégral doit être dans le sitemap le plus petit, jeu et moteur fermés. Il rougit sur un lien vers `/r/sample` ajouté pour l'essai.

**CodeQL** a levé une alerte haute sur la PR : « Incomplete string escaping ». Les cellules du tableau des comparaisons échappaient `|` sans échapper d'abord `\`, si bien qu'une barre oblique déjà dans le texte aurait rendu la barre verticale à la colonne. Aucune copie n'en contient aujourd'hui, et la sortie est identique. `tableCell` échappe maintenant les deux, dans le bon ordre. Son test rougit sans l'échappement de la barre oblique.

**Un piège de mesure, pas un bug** : un build avec `GAME_ENABLED=true` servi par un `next start` sans la variable liste `/en/game` dans `/llms.txt`, et le proxy y répond 404. C'est le « construit ouvert, fermé à l'exécution » que décrit `build-flag.ts`, qui n'existe qu'en local : la CI pose la variable au niveau du workflow, pour le build comme pour le serveur.

**Vérifié** : `tsc` et `eslint` propres, **2 352 tests unitaires** (onze de plus), `vitest --coverage` au-dessus de ses seuils, `next build` propre, avec les trois routes en statique. La suite Playwright complète, avec les variables de la CI : **666 specs, 643 passées, aucun échec**, 23 ignorées par construction. `llms-robots.spec.ts` (trois specs, dont une qui demande chaque adresse listée et exige un 200) a été rejouée après les corrections de la relecture, sur un build refait.

**`main` a bougé deux fois pendant la PR** : A11, C28 et C29 (#227), puis la ligne de production d'A11 (#229), touchaient les mêmes lignes de `CHANTIERS.md`, de `CLAUDE.md` et de la fin du journal. `main` a été fusionné deux fois dans la branche en gardant les deux côtés, et la ligne des décisions de `CLAUDE.md` a été resserrée pour rester sous le budget de 40 000 caractères : seule C25 y reste ouverte. Re-mesuré sur l'arbre fusionné : **2 356 tests unitaires**, **667 specs, 644 passées, aucun échec**, 23 ignorées par construction.

**En production (2026-09-30)** : [#228](https://github.com/ScratchMe/tourdegrowth/pull/228), squash `4f804ea`, 15 fichiers, arbre identique à la tête. Déployé : le statut `Vercel` du commit est à `success`. Vérifié en HTTP sur `www.tourdegrowth.com` :
- `/robots.txt`, `/llms.txt` et `/llms-full.txt` répondent 200 en `text/plain; charset=utf-8`, pour 369 o, 10 403 o et 188 394 o ;
- `robots.txt` sert les deux groupes nommés et le groupe `*`, tous en `Allow: /`, sans aucun `Disallow` ;
- les adresses de `/llms.txt` sont exactement les 74 du sitemap de production, plus le lien du texte intégral. Chacune répond 200. Ni le jeu ni le moteur n'y figurent, puisqu'ils sont fermés ;
- `/llms-full.txt` a ses 32 parties et ne cite ni `/r/`, ni `/admin`, ni le moteur.

## C25 : la spécification du B2B assisté et de l'hybride, validée (2026-09-30)

Antoine a tranché C25 dans sa propre session, avec le prompt C25 : les seize questions du §18.12 d'`ENGINE.md` (A7.3.a, [#214](https://github.com/ScratchMe/tourdegrowth/pull/214)). **A7.3.b est close**, et le code (A7.3.c) peut partir dans l'ordre du §18.11. Chaque réponse est datée dans une colonne « Tranché » du §18.12, et **les sections qu'elle change sont corrigées le même jour**. Aucune ligne de code.

**Avant de poser** : `src/lib/engine/` n'a pas bougé depuis `62e3618`. A10 n'a changé que les écrans, que le §18 écrivait déjà avec `Choices` et `Segmented`. Ni le journal ni le nº8 (une seule carte tranchée, C1) ne contenaient de réponse. Un écart mineur est corrigé en passant : le §18.10.3 « étendait » `engine-mobile.spec.ts`, qui n'a jamais existé.

**Q3, Q1 et Q2, une par une, sur l'exemple §18.9** :
- **Q3, oui : un client compte dans la motion qui a signé son contrat en cours.** Le double compte a été montré sur l'exemple : 5 comptes à 2 000 € par mois comptés par Stripe et par HubSpot donnent 228 000 € affichés pour 218 000 € réels. Rien à l'écran ne le montre. **Un ajout de la séance** : un passage du libre-service à l'assisté n'est pas un départ du libre-service. Compté comme tel, il ajoute ~0,4 point à un churn de 2,5 % dont la cible est 2 %. S8 et §18.4.6 (une ligne de piège sur cinq fiches du libre-service, en hybride seulement) sont corrigés.
- **Q1, oui : l'activation assistée est la mise en production.**
- **Q2, oui : trois mois glissants, fixes.** Montré : au mois (~6 signées sur 25), une seule signature de plus fait passer l'étape nommée du taux de closing au passage lead → opportunité. Sur trois mois, elle ne la change pas.

**Q4 à Q16 en bloc** : dix recos retenues. Q10 et Q12 ont été posées sur l'écran actuel du moteur (build local, aperçu propriétaire, l'exemple rempli à 1 280 et 390 px) et sur un croquis de l'écran hybride fait avec les chiffres de §18.9. Les images sont restées dans le scratchpad. **Constat en posant Q12** : le bloc de diagnostic du tableau ne montre aucun montant (`Diagnosis.tsx`). Les deux montants (~600 € et ~4 000 €) ne vivent que sur deux slides, à deux slides d'écart. La reco « oui » tient donc à plus forte raison.

**Trois reprises, posées une par une** :
- **Q4 : une marge brute par motion.** Antoine : « ça change tout, il faut qu'on ait la différence ». L'assisté gagne `slg.rev.gross-margin` : 15 chiffres propres, une union de 32, plus de chiffre « commun ». **Aucune migration**, puisque `rev.gross-margin` reste au libre-service. Un repli « Reprendre la marge globale » existe en hybride seulement : la valeur s'enregistre en estimation (base `company-wide`), comptée approximative, jamais trouvée. Par symétrie, la fiche du libre-service offre le même repli. Montré : payback assisté de 13 mois à 75 % de marge, de 16 à 60 %. Quatorze sections sont corrigées, dont l'exemple (« 24 chiffres sur 32 ») et un gabarit neuf pour « les deux marges manquent ».
- **Q7 : la liaison devient un levier « Et si » dès la v1.** Antoine : « c'est justement un point important dans ces organisations hybrides ». Le levier se chiffre **en nombre** d'opportunités venues du libre-service par trimestre, et non en part, qui monte aussi quand les autres baissent. Il est **jamais candidat** : une cible sur la liaison ferait dire au diagnostic de l'assisté « le libre-service ne passe pas assez ». Son gain s'écrit dans l'assisté et le total, et rien n'est retiré au libre-service. Exemple : 31 → 40 donne +1,25 signature par trimestre, soit ~830 € de MRR nouveau par mois.
- **Q8 : quatre termes de glossaire dès la v1, par une session à part.** Ce sont « taux de closing », « cycle de vente », « ACV » et « conversion lead → opportunité » ; le §18.4.2 annonçait ce quatrième, que Q8 oubliait. Ils deviennent l'item **A7.3.e**, avec son prompt dans `CHANTIERS.md`, en parallèle d'A7.3.c. S2 attend leurs slugs. Le glossaire passera à 28 termes et 56 pages.

**Mis d'accord en passant** : C29, tranchée entre-temps par une autre session, fait passer « facultatif » par la prop `optional`. Le bloc de liaison du §18.6.3 le suit.

**Aucune question neuve** pour la section C. Chiffrage revu : ≈ 12 jours-agent avec A7.3.e, et le même chemin critique de ~6 jours.

**`main` a bougé pendant la séance** : A11, C28, C29 (#227, #229), puis C26 et C27 (#228, #230). Ces PR touchaient `CHANTIERS.md`, `CLAUDE.md` et la fin de ce journal. `main` a été fusionné avant d'y écrire, en gardant les deux côtés. `CLAUDE.md` reste sous 40 000 caractères.

## Le niveau 2 du jeu : la spécification, le moteur généralisé, le modèle en brouillon (2026-09-30)

**La demande.** Antoine veut un deuxième niveau du jeu avant le lancement, et demande lequel. La comparaison des quatre esquisses du §11 avec le vrai catalogue du niveau 1 a désigné l'acquisition : six astuces sur huit absentes du niveau 1 (contre trois pour l'activation et le referral), la DGCCRF comme autorité, des cas publics récents, et aucun terrain déjà occupé, alors que le bandeau cookies de l'activation l'est par le quiz de la CNIL et Cookie Consent Speed.Run. Antoine a répondu « OK go ». Tout est dans `GAME-BRIEF.md` §17 ; la construction attend C30.

**Le brief se trompait sur le moteur.** Le §11 promettait « le même modèle, avec deux constantes renommées ». Le code disait autre chose : 35 mentions du churn dans `model.ts`, 25 dans `view.ts`, 11 composants, une formule qui ne sait que faire baisser un chiffre, une économie d'abonnement. Le moteur est donc généralisé, sans rien changer au niveau 1 :
- `direction` : le chiffre du board baisse (le churn) ou monte (les nouveaux clients). `shortfall` et `reachesBoard` lisent le signe à un seul endroit ;
- `economy` : abonnement ou boutique, une union plutôt que des champs facultatifs ;
- le `red` du brief devient `gain`, le `mrr` d'une carte `revenueMult`, `ChurnDrivers` devient `MetricDrivers` ;
- l'état passe en `v: 2` (`metric`, `customers`, `revenue`) sous une clé de sauvegarde `v2`. Le jeu est fermé : seules les parties de l'aperçu sont perdues ;
- `DraftLevelSlug` : un niveau peut exister comme modèle testé avant d'avoir une page. Mettre `"acquisition"` dans `LevelSlug` aurait exigé une clé de sauvegarde, un encart et un vocabulaire analytique pour un niveau que personne ne peut jouer.

Les composants de `components/game` gardent leurs noms d'emplacement (`churn`, `subs`, `mrr`) : ce sont des contrats synchronisés avec Claude Design, et les renommer demande une re-synchro. L'îlot du niveau 1 traduit. Ce sera A12.d.

**Vérifié au bit près.** Avant de toucher au code, 3 000 années ont été jouées au hasard et enregistrées en entier : états, tableaux de bord, rapports, lignes du « pourquoi », décembres, téléphones. Rejouées après la refonte, une fois les noms rendus, elles sont identiques au JSON près, et les fixtures F1 à F5 restent vertes sans une tolérance touchée. La formule du niveau 1 garde son ordre de facteurs exact, pour cette raison.

**Le modèle du niveau 2, en brouillon.** Chaque carte tient le rôle d'une carte du niveau 1. Le premier réglage, avec les mêmes chiffres, ratait les quatre années de référence : un gain de x fait moins qu'une baisse de x (A virée en septembre, C sans atteindre le T2). Les gains ×1,3 et les plafonds 0,43 et 0,82 (≈ 1/0,70 et 1/0,55) rendent le profil : l'année A a exactement la patience du niveau 1 (51, 42, 46, 73), C subit le contrôle au T3, D est virée en juin. Joué au hasard, le niveau 2 pardonne un peu plus au joueur honnête (43 % d'applaudissements contre 35 %) : noté en §17.6, la recette tranchera.

**Trouvé en route** : `driverRows` divisait par zéro pour un pas d'une dizaine de clients, puisque `Math.round(1 / 10)` vaut 0. C'est le test du niveau 2 qui l'a vu. Un pas inférieur à un se compte en multipliant par son inverse, exactement le produit de toujours (`x * 1000`, jamais `x / 0.001`), un pas d'un ou plus en divisant.

**Le droit, vérifié sur les sources primaires** (Légifrance, DGCCRF, Commission, FTC, CMA), par un agent de recherche, relancé une fois pour le cas de la publicité déguisée. Le §11.1 avait quatre erreurs, corrigées en place :
- « DSA article 27 » ne s'applique pas à une boutique qui vend son propre stock : c'est le L121-4 25° ;
- les faux avis relèvent du L121-4 28° et 27°, pas du seul L121-2 ;
- « prix total obligatoire » allait trop loin : la livraison peut s'afficher à part si elle est annoncée (L121-3 3°, arrêté du 3 décembre 1987) ;
- le faux prix barré n'a pas d'amende administrative à lui : l'article L131-5 ne vise que l'article L112-1 et ses arrêtés, et l'arrêté de 2015 sur les annonces de réduction est abrogé. C'est une pratique commerciale trompeuse, un délit, que la DGCCRF règle par transaction pénale.

D'où le contrôle du niveau 2 : une transaction de 150 000 €, à trancher (C30 Q3). Deux pièges pour la copie à venir : la mention « Publicité » ou « Collaboration commerciale » n'est plus une obligation littérale depuis l'ordonnance du 8 novembre 2024, et les fiches de la DGCCRF citent encore des peines d'avant l'aggravation en ligne de 2024.

**Le nom.** « Braquet », premier candidat, est porté par deux magasins de vélos. « Pédalix » ne sort nulle part ; l'INPI reste à consulter (C30 Q2).

**`CLAUDE.md` dépassait son budget avant cette entrée** (40 529 caractères pour 40 000). Il repasse dessous en resserrant deux lignes que le journal raconte déjà (le nº5, le flake de `locale-routing`) et la convention 13, qui n'est plus une contrainte et dont le détail chiffré est dans `VERCEL.md` §2.3.

**Vérifié** : `tsc` et `eslint` propres, **2 382 tests unitaires** (vingt-six de plus, ceux du niveau 2 et du sens « vers le haut »), `vitest --coverage` au-dessus de ses seuils, `next build` propre avec les variables de la CI. La suite Playwright complète, avec l'émulateur Firestore et le mot de passe d'administration posés : **667 specs, 662 passées, aucun échec**, 5 ignorées par construction (les specs « jeu fermé »). À l'écran, sur un second serveur du même build : la première vue du niveau 1 en français à 1 280 px et en anglais à 390 px, et décembre des années A (anglais, 1 280 px) et C (français, 390 px), chiffres, fins et courbes compris, les placeholders renommés remplis.

**La relecture de la copie** (`relecteur-copie`) a confirmé qu'aucun texte lu par un joueur n'a changé dans `content/game/retention.ts`, en français comme en anglais : seules les clés et les noms de placeholders bougent, des deux côtés de chaque paire. Dans les premiers jets du §17, elle a relevé :
- un `{titre}` là où le contrat attend `{title}` ;
- un cas Temu qui présentait comme établi ce qu'une notification énonce ;
- surtout, des textes d'événements et de fins qui nommaient des cartes (« les guides », « les prix barrés », « avis vérifiés »), alors que ces événements se déclenchent sur des seuils de radar et de confiance, pas sur ce qui a été joué. L'année D, virée, n'a écrit aucun guide.

Tout est corrigé, et le §17.8 pose la règle. Elle a aussi mis en doute, de mémoire, que le faux prix barré échappe à l'amende administrative. La vérification sur Légifrance le confirme, et le texte le dit maintenant avec sa source plutôt qu'en une phrase absolue.

**En production (2026-10-01)** : [#232](https://github.com/ScratchMe/tourdegrowth/pull/232), squash `24c862a`, 36 fichiers, arbre identique à la tête. Déployé, mais prouvé après coup. Sur le moment, la seule preuve était l'en-tête `age` de `/en` : reparti de zéro une minute après le merge, puis monté sans nouvelle remise à zéro pendant cinq minutes. L'API de Vercel répond 403 à cette session. Or `VERCEL.md` §1.12 prévient qu'un site qui répond ne prouve rien quand le quota de déploiements est épuisé, et il l'était le soir même : la prévisualisation de #234 a été refusée, « more than 100 » par jour. La preuve est venue de #235, mergée après #232 : ses pages (`/en/glossary/win-rate`) sont servies en production, et un déploiement emporte tout `main`. Vérifié en HTTP sur `www.tourdegrowth.com` :
- `/fr` et `/en` répondent 200 ;
- `/fr/game`, `/fr/game/retention`, `/en/game/retention` et `/en/aarrr-funnel-template` répondent 404, puisque le jeu et le moteur restent fermés ;
- `/r/sample` répond 200, sans l'encart du jeu, et le sitemap ne cite aucune adresse du jeu.

Ce que la refonte change pour un joueur ne se voit qu'avec le jeu ouvert. C'est vérifié dans la suite Playwright et à l'écran sur le build local, pas en production.

## A7.3.e : les quatre termes de la vente assistée, avant le code qui les cite (2026-09-30)

**La demande** : l'item A7.3.e de `CHANTIERS.md`, né de C25 (Q8). Quatre pages de glossaire, FR et EN, sur le modèle de la vague 2.2 : « taux de closing », « cycle de vente », « ACV » et « conversion lead → opportunité ». Elles s'écrivent **avant** A7.3.c, qu'une autre session construit en même temps, pour que chaque fiche assistée du moteur puisse renvoyer à son terme. Rien sous `lib/engine/`, `content/engine-*.ts` ni `aarrr-funnel-template/` n'a été touché.

**Les requêtes d'abord.** `stats.yml` (portée `gsc`), clé `age` créée dans le scratchpad, rapport déchiffré sur place : aucun chiffre n'entre ici. **Aucune requête ne touche encore la vente assistée**, ce qui était attendu, puisque le site n'a aucune page pour en recevoir. Le rapport confirme en revanche la **forme** de ce qui arrive : des définitions courtes, des développements de sigle et des traductions. Les recherches du jour confirment les quatre slugs proposés (« win rate », « sales cycle length », « ACV », « lead to opportunity conversion rate »). Les FAQ sont donc écrites sur ces variantes : « comment calculer », « c'est quoi un bon… », « ACV, ça veut dire quoi ? », « ACV ou ARR », « MQL, SQL, opportunité : dans quel ordre ? ».

**Les choix, un par un** :
- **Slugs** : `win-rate`, `sales-cycle`, `acv` et `lead-to-opportunity`, en anglais dans les deux langues (R2-16). Les titres suivent la requête de chaque langue : « Taux de closing — win rate » et « Win rate », « Cycle de vente » et « Sales cycle length », « ACV — Annual Contract Value » (le sigle développé, comme ARPU et NPS), « Conversion lead → opportunité » et « Lead-to-opportunity rate », le nom de la fiche du moteur. « Conversion rate » est dans la définition anglaise, pour la requête. Aucun titre ne dépasse 56 caractères.
- **Les exemples reprennent le §18.9, rien d'autre** : 72 opportunités sur 480 MQL, 18 gagnées sur 75 conclues et 130 créées, 64 jours de cycle médian, 432 000 € sur 18 contrats, un CAC de 19 000 €, 180 000 € de MRR sur 100 clients et les cibles de 18 % et 32 %. Les marges de 75 % et 60 % sont les cas de test du §18.9.6, et la page les pose en hypothèses. Chaque exemple en tire une leçon qui n'existait pas encore. **Le dénominateur** : 18 ÷ 130 donnerait 14 % au lieu de 24 %. **La médiane** : allonger d'un an la plus longue des 18 affaires ajoute 365 ÷ 18 ≈ 20 jours à la moyenne et rien à la médiane. **L'ACV n'est pas l'ARPA × 12** : 2 000 € contre 1 800 €, parce que les deux ne comptent pas les mêmes clients. **La cohorte n'est pas le flux** : 130 ÷ 480 donnerait 27 %, en mélangeant un flux et une cohorte.
- **Aucun ordre de grandeur de l'instrument d'audit.** Les recherches du jour répètent partout le « 25-35 % » de l'audit : c'est exactement ainsi qu'il serait entré. Les sections « Ordres de grandeur » disent donc ce qu'un chiffre publié vaut, ou donnent un ordre de grandeur **interne** : sur 75 affaires, une affaire vaut 1,3 point, et sur 480 MQL une opportunité vaut 0,2 point. **Une seule source primaire est citée**, en contexte : Christoph Janz, « Five ways to build a $100 million business » (5 octobre 2014), relu le jour même. Il y parle de revenu par compte et non d'ACV, et la page le dit. C'est un cadrage de modèle économique : il ne désigne rien (C1), et ce n'est pas un repère de fiche.
- **« Dans le Tour »** : le Tour ne pose aucune de ces questions. Chaque page prend la question la plus proche et dit honnêtement le lien. `win-rate` va à `rev-1` (une perte dont la raison est écrite est un test de prix), `sales-cycle` à `acq-3` (le cycle décide si le CAC est une mesure ou un ordre de grandeur). `acv` va à `rev-2` (la première entrée de la LTV), `lead-to-opportunity` à `acq-1` (un canal est mesuré quand on connaît ses opportunités, pas ses leads).

**Le maillage était saturé**, comme le lot 2 l'avait prévu. Toutes les pages voisines étaient au plafond de quatre liens. Le plafond n'a pas été desserré : **huit échanges**, chacun contre un lien plus lâche vers une page qui en reçoit beaucoup. `revenue` passe de 7 liens entrants à 4, et `activation` de 8 à 6. `cac` et `revenue` mènent à `win-rate`, `cac-payback` et `time-to-value` (le dernier créneau libre utile) à `sales-cycle`. `arpu` et `ltv` mènent à `acv`, `acquisition` et `pql` à `lead-to-opportunity`. La règle mesurée à la main après chaque lot de 2.2 devient un test : tout terme reçoit au moins deux liens, et les quatre neufs en reçoivent deux de pages qui existaient avant eux. Les pages qui ne gagnent qu'un lien gardent leur date : un lien n'est pas du contenu.

**Deux défauts vus à l'écran, pas à la relecture** (leçon nº1, encore) : « 5 » seul en fin de ligne avant « octobre 2014 », et « 13 » séparé de « mois ». Les nombres de ce corpus n'avaient reçu l'insécable que dans les groupes de chiffres et avant « % ». Les chaînes neuves la portent aussi entre un nombre et son unité de temps, et dans les dates. La flèche de « lead → opportunité » est liée au mot qui la suit : liée au mot d'avant, elle faisait passer le titre sur trois lignes à 390 px.

**Les gardes, avec leur non-vacuité** (écrite dans les fichiers) :
- `glossary.test.ts` lit les ordres de grandeur **dans** `audit-catalog.ts` (24 ce jour-là, dont 25-35, 12-18 et 3×) et exige qu'aucun n'apparaisse sur les quatre pages. Écrire « 25-35 % » dans le français de `win-rate` et « 3× » dans l'anglais d'`acv` fait tomber exactement les deux cas de langue, et rien d'autre.
- La règle des deux liens entrants : remettre `activation` dans `pql.related` la fait tomber seule.
- `acronyms.test.ts` développe ACV, et les sigles empruntés : ARR, TCV et ARPA sur `acv`, MQL, SQL et PQL sur `lead-to-opportunity`.
- Un e2e par terme, par langue et par largeur : les six sections, la vraie question du Tour, les liens voisins, et aucun débordement. `french-typography.spec.ts` couvre `acv` et `win-rate`.

**Copie neuve, donc `TODO: à relire`** (convention 6). Elle ira au bon à tirer d'A7.3.d, qui les comprend déjà.

**Le relecteur-copie** a trouvé six choses, toutes corrigées :
- un « vous » au milieu du tutoiement ;
- une durée inventée (« deux semaines ») ;
- un seul marqueur « à relire » pour les quatre entrées longues, alors que `/bon-a-tirer` regroupe par terme ;
- une définition anglaise de `lead-to-opportunity` qui ne disait pas la même chose que la française ;
- deux ordres de grandeur sans source dans le texte d'`acv` ;
- « la TCV » au féminin, quand l'ACV est au masculin partout ailleurs.

**Vérifié** :
- `tsc` et `eslint` propres, **2 400 tests unitaires** (après la fusion de #232), `vitest --coverage` au-dessus de ses seuils, `next build` propre, avec 56 pages de terme prérendues.
- La suite Playwright complète, avec les variables de la CI et l'émulateur Firestore : **688 specs, 683 passées, 5 ignorées par construction, aucun échec ni rejeu**. Elle a tourné trois fois : avant les retours du relecteur, après, puis sur la tête fusionnée.
- À l'écran, les quatre pages, en FR et en EN, à 1 280 et 390 px : réponse 200, aucun débordement, `hreflang` fr, en et x-default, JSON-LD `DefinedTerm` et fil d'Ariane, ligne de date.
- Le sitemap porte 56 pages de terme, `/llms.txt` les 28 termes, et `/llms-full.txt` les quatre parties neuves.
- Mesuré : 1 143 à 1 468 mots par langue et par terme, des extraits de 122 à 160 caractères et des titres de 34 à 56.

**Trouvé en se vérifiant, hors de cette PR** : `npm audit --omit=dev` n'est plus à zéro sur `main`. Il relève trois alertes, dont une **critique sur `next`**, dans `ImageResponse` de `next/og`, que le site utilise pour ses images de partage. Elles deviennent **A13** de `CHANTIERS.md` : une PR à part. Son merge attend l'accord d'Antoine, parce qu'elle touche une dépendance (`/livrer` §0).

**`main` a bougé pendant la PR** : #232 (le niveau 2 du jeu) a pris le numéro A12, et les alertes sont donc devenues A13. `main` a été fusionné en gardant les deux côtés de `CHANTIERS.md`, de `CLAUDE.md` et de ce journal.

**En production (2026-10-01)** : [#235](https://github.com/ScratchMe/tourdegrowth/pull/235), squash `bf06fc2`, 16 fichiers, arbre identique à la tête. Vérifié en HTTP sur `www.tourdegrowth.com` :
- les huit pages répondent 200 avec leur titre, leur canonique, leur `hreflang` fr, en et x-default, leur `DefinedTerm`, et la date « 30 septembre 2026 » ;
- l'index du glossaire liste les quatre termes ;
- le sitemap porte 82 adresses, les 74 d'avant et les huit neuves, dont 56 pages de terme ;
- `/llms.txt` liste les quatre termes, et `/llms-full.txt` porte leurs quatre parties ;
- les liens échangés sont servis : `pql` mène à `lead-to-opportunity`, et `revenue` à `win-rate`.

IndexNow a été lancé à la main le même soir (run 20, succès). La demande d'indexation des huit adresses dans Search Console revient à Antoine : elles sont ajoutées à D10.

## La documentation remise d'accord avec le code, et le journal découpé en volumes (2026-10-01, demandé par Antoine)

Antoine a demandé de mettre à jour le README et toute documentation qui ne
l'était plus, avec la liberté de découper des documents pour économiser des
tokens. Trois audits en lecture seule ont d'abord relevé, contre le code de
`main` (`24c862a`), ce qui était faux **aujourd'hui** : les fichiers d'outil,
les documents secondaires, puis l'état de `CLAUDE.md` et de `CHANTIERS.md`.

**Le découpage.** `JOURNAL.md` faisait 834 000 caractères : trop pour que
GitHub l'affiche, et cher à ouvrir pour une session. Les entrées d'avant le
2026-09-30 partent **telles quelles** dans `docs/journal/`, huit volumes par
période, et `JOURNAL.md` garde le volume courant (113 000 caractères) avec la
table des volumes. Vérifié : les 4 651 lignes non vides d'avant le découpage
se retrouvent, dans le même ordre, dans les volumes suivis du volume courant ;
aucun lien relatif n'existait dans le texte déplacé. La règle d'archivage est
un test (`claude-md-budget.test.ts`) : le volume courant reste sous 200 000
caractères, et la table nomme exactement les volumes du disque. Non-vacuité :
remettre les volumes dans `JOURNAL.md` fait rougir le premier test, un volume
ajouté sans sa ligne le second. Dans `CHANTIERS.md`, l'index des
vingt-neuf décisions tranchées part dans `docs/decisions.md`, remis dans
l'ordre des numéros (C25 était après C28), et A10 et A11, clos, laissent la
place aux quatre restes d'A10 qui n'avaient pas de numéro (A10.1 à A10.4).
`CHANTIERS.md` passe de 55 000 à 41 000 caractères ; `CLAUDE.md` perd onze
lignes du tableau des points ouverts, qui doublaient la section E de
`CHANTIERS.md` ou `.design-sync/NOTES.md`, et sa carte du dépôt nomme enfin ce
qu'elle oubliait (`proxy.ts`, `llms.txt`, `lib/forms`, `.github/`, `docs/`…).

**Ce qui n'a pas été découpé, et pourquoi.** `ENGINE.md` (318 000) et
`GAME-BRIEF.md` (145 000) gagneraient à sortir leur §18 et leur §17, mais la PR
#233 (A7.3.c) écrit dans le §18 et une session C30 écrira dans le §17 : git ne
suit pas un texte déplacé d'un fichier à l'autre, et ces sessions hériteraient
d'un conflit. C'est une ligne de la section E de `CHANTIERS.md`. Pour la même
raison, les modifications de `CLAUDE.md` et `CHANTIERS.md` évitent les lignes
que touchent #233, #234 et la branche d'A7.3.e (sans PR à cette heure) : la
fusion à trois de chacune de ces branches avec celle-ci a été simulée
(`git merge-file`), fichier par fichier, sans aucun conflit hors de la fin
de `JOURNAL.md` (où deux entrées se suivent, comme à chaque livraison en
parallèle), et le `CLAUDE.md` comme le `JOURNAL.md` fusionnés restent sous
leurs budgets.

**Ce qui est supprimé**, Antoine ayant ouvert la suppression en cours de
route (« tu peux aussi supprimer les documents ou des parties de documents que
tu jugerais inutiles ») :
- de `CLAUDE.md`, la section sur les plug-ins (5 400 caractères chargés dans
  chaque session, pour un usage rare) : elle part telle quelle dans
  `PLUGINS.md`, un fichier d'outil de plus dans la table des déclencheurs,
  qui garde dans sa cellule la règle « un plug-in se décide avec Antoine ». Et
  la consigne « lis dans cet ordre : ce fichier → `SPEC.md` →
  `DESIGN-BRIEF.md` », écrite pour la première session, devient une lecture
  sur déclencheur : 44 000 caractères surtout historiques qu'une session
  obéissante relisait à chaque démarrage. `CLAUDE.md` passe de 38 900 à
  33 800 caractères ;
- d'`ENGINE.md`, le §14, l'inventaire de la copie de la v1 clé par clé
  (50 000 caractères), devenu une copie périmée du code (quinze chiffres au
  lieu de dix-sept, les renommages d'A7). Un paragraphe le remplace et dit où
  lire chaque clé ; les renvois « §14.x » restent lisibles. Le reste du
  document n'est pas touché : #233 y écrit ;
- de `SPEC.md`, le prompt de la première session (§13) et la liste « avant de
  lancer Claude Code », et une note sur le §12, dont la consigne « ne pas
  inventer la copie » est levée depuis le 2026-09-11.

Rien d'autre n'a semblé inutile au point d'être retiré : les trois revues et
les volumes du journal sont l'histoire que le README met en avant, le plan
d'audit attend sa réouverture tel quel, et le brief 02 jamais envoyé garde sa
place dans la trace de R2-29.

**`docs/` entre dans la liste « doc seule » de `scripts/vercel-ignore.sh`**,
pour qu'archiver un volume ne déploie rien. C'est un réglage de build : la
session l'avait sorti de la PR en attendant l'accord d'Antoine (`/livrer` §0),
qui l'a donné en cours de route. Un cas de plus dans `vercel-config.test.ts`,
qui rougit sans le changement du script (vérifié).

**Ce qui était faux, et ne l'est plus** :
- `README.md` décrivait le produit du lancement : il dit maintenant ce que fait
  le Tour (l'étape qui freine, l'action, l'image), ce qui l'entoure (glossaire,
  comparaisons, `llms.txt`), ce qui est construit et fermé (le moteur, le jeu,
  `/metrics`), comment le lancer et tester, et où vit chaque document ;
- `SPEC.md` gagne un encart « ce qui a changé depuis ce draft » (barème
  20/7/0, verdict sans Gemini, deux questions de contexte, partage par
  `/r/<id>` et K sur toutes les analyses, une adresse par langue, Firestore et
  `next/og`), sans toucher au texte d'origine ;
- `TESTING.md` disait que Vitest ne rend pas un composant (il le fait par
  `renderToStaticMarkup`) et tenait encore le flake de `locale-routing` pour
  ouvert ; `/livrer` aussi ;
- `VERCEL.md` : 82 pages de contenu (depuis A7.3.e) et non 72, le quota de déploiements que le
  « push gratuit » oubliait, un renvoi au mauvais paragraphe, et la cadence du
  §2.3 marquée caduque depuis le 2026-09-26 ;
- `GITHUB.md` : quatre workflows et non trois, et l'émulateur dans `ci.yml` ;
- `GEMINI.md` : le pire cas d'abus était compté sur une génération au lieu de
  quatre (~5 à 7 $ par adresse et par jour, pas 2,4) ;
- `.env.local.example` se disait complet sans six variables d'outils et de
  tests, et ses commentaires sur le mot de passe admin et sur `ENGINE_ENABLED`
  (« jusqu'au bon à tirer nº6 ») étaient faux ;
- les portiers du moteur et du jeu dans `marketing/` (le nº8 et non le nº6, le
  nº7 et C23 pour le jeu), l'inventaire de `marketing/assets/`, les en-têtes
  datés de `GROWTH-PLAN.md` et `AUDIT-PLAN.md`, R2-29 et R2-31 dans
  `REVIEW-02.md`, et la note de `DESIGN-BRIEF.md` qui interdisait encore
  d'écrire la copie. `design/` gagne un index (`design/README.md`).

**Trouvé en route, pas corrigé ici** : `npm audit --omit=dev` n'est plus à
zéro sur `main`. Trois alertes, dont une **critique** sur `next` 16.3.4
(GHSA-vcvr-r3jv-pc5j, exécution de code dans `ImageResponse` de `next/og`,
dont se servent toutes nos images de partage), corrigées dans leurs plages
semver. C'est une montée de dépendances, donc une PR à part avec l'accord
d'Antoine ; la session d'A7.3.e l'a aussi relevée (A13 sur sa branche), et
`CLAUDE.md` la met en tête de ses points ouverts. A7.3.e a été mergé (#235)
pendant cette PR, avec A13 : la ligne de `CLAUDE.md` y renvoie.

**Vérifié** : `eslint` et `tsc` propres, `vitest --coverage` vert et au-dessus
de ses seuils, la vérification des longueurs de `marketing/` (71, aucune
erreur). Ni build ni Playwright en local : seuls des documents et un test
unitaire changent, aucun fichier que le build lit ; la CI les passe quand même.

## C30 : le niveau 2 du jeu, validé (2026-10-01)

**Posé dans la session qui avait écrit la spécification**, à la demande d'Antoine, qui a demandé pourquoi les questions ne lui avaient pas été posées pendant l'implémentation, alors qu'il était disponible. La réponse honnête : la convention de `CHANTIERS.md` A (« une question produit rencontrée en route part en section C ») a été lue comme « ne pas déranger ». Or elle disait seulement de ne pas trancher seul. Q1, le chiffre du board, conditionnait tout le chiffrage du niveau, et a été posée après. La règle est réécrite : **si Antoine est dans la session, une question produit se pose tout de suite**, surtout quand le reste du travail en dépend ; la section C est pour les questions sans lui.

**Les cinq réponses, toutes selon la reco** (`GAME-BRIEF.md` §17.10) :
- Q1 : le DG réclame les **nouveaux clients par mois**, pas le taux de conversion. Elle a été posée avec la définition de l'acquisition dans le Tour et les huit astuces rangées par ce qu'elles font monter ;
- Q2 : **Pédalix** ;
- Q3 : une **transaction pénale de 150 000 €**, posée à côté de l'amende du niveau 1 et des montants publiés. Écartés : 1,3 M€ et le plafond de 3,75 M€ ;
- Q4 : **les huit cas tels quels**, Temu compris, dit comme une notification en cours ;
- Q5 : **une carte qui propose les deux niveaux** quand plusieurs étapes du goulot en ont un. C'est la reco de C11, tranchée avant l'ouverture du niveau 2, et §15.4 est à jour.

**Ce qui en découle** : rien ne bouge dans le modèle, les tests ni les chiffres du §17. A12.b est close et A12.c (la copie) peut partir. L'encart à deux niveaux rejoint A12.f. Le déclencheur « un deuxième niveau ouvre » sort de la veille (section E), puisque sa question est tranchée, et le prompt C30 sort de `CHANTIERS.md`, puisqu'il a servi. Les commentaires du code qui disaient « en attente d'Antoine » (`levels/acquisition.ts`, `types.ts`) sont mis à jour : sans eux, la session d'A12.c aurait lu une validation pendante.

**Fusionné avec la documentation en volumes** (#237, mergée pendant cette PR) : C30 gagne sa ligne dans `docs/decisions.md`, où C11 renvoie désormais à A12.f, et le découpage de `GAME-BRIEF.md` (section E) n'attend plus qu'A7.3.c.

## ENGINE.md et GAME-BRIEF.md découpés à leur tour (2026-10-01, demandé par Antoine)

Le matin, ce découpage avait été reporté : #233 (A7.3.c) écrivait dans le §18
d'`ENGINE.md`, une session C30 allait écrire dans le §17 de `GAME-BRIEF.md`, et
git ne suit pas un texte déplacé d'un fichier à l'autre. Antoine a demandé
s'il était possible désormais. Relevé sur GitHub avant d'agir : C30 est mergée
(#234), aucune branche ouverte ne touche `GAME-BRIEF.md`, et #233, toujours
ouverte, ne modifie `ENGINE.md` qu'à partir du §18 (ses sept blocs commencent à
la ligne 2380 ; le §18 commence à la 2167).

**Ce qui est fait** :
- `GAME-BRIEF.md` (147 000 caractères) : le §17, la spécification du niveau 2,
  part tel quel dans `docs/game/niveau-2.md` (39 000). Le brief garde ce qui
  vaut pour tous les niveaux, une entrée « Organisation » dans son journal des
  versions et un §17 qui renvoie au fichier. Chaque niveau suivant aura le sien
  à côté : le brief ne grossira plus d'un niveau à l'autre.
- `ENGINE.md` (268 000) : la spécification de la v1 (§0 à §17) et son annexe
  des vérifications partent telles quelles dans `docs/engine/v1.md` (129 000).
  `ENGINE.md` (141 000) garde les décisions, un tableau « Où vit la
  spécification », le §18 en cours et la trame des entretiens. **Le §18 reste
  là jusqu'au merge d'A7.3.c** : c'est la ligne de la section E de
  `CHANTIERS.md`, mise à jour.
- Les numéros de section ne changent pas : un renvoi « `ENGINE.md` §9.3 » ou
  « `GAME-BRIEF.md` §17.10 », dans le code comme dans les documents, se lit
  dans le fichier que donne l'index en tête de l'original. Les documents
  vivants (`CHANTIERS.md`, `CLAUDE.md`, `README.md`, `docs/decisions.md`)
  nomment directement le nouveau fichier.

**La garde** : `src/__tests__/doc-links.test.ts` exige que chaque lien relatif
des documents (la racine, `docs/`, les README de `design/` et de `marketing/`,
34 fichiers) mène à un fichier qui existe. Aucun lien mort le jour du
découpage. Non-vacuité : renommer `docs/engine/v1.md` fait rougir le test, qui
nomme les deux index qui y renvoient (`ENGINE.md`, `README.md`).

**Vérifié** : les lignes non vides de chaque partie déplacée sont identiques,
dans le même ordre, et la tête, le §18 et la trame d'`ENGINE.md` sont intacts ;
la fusion à trois de #233 avec le nouvel `ENGINE.md` est propre (simulée par
`git merge-file`).
