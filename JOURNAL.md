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
telles quelles, en huit volumes rangés par période (un neuvième, le même jour, pour celles du 2026-09-30 ; un dixième le 2026-10-02, pour celles du 2026-10-01). **Quand ce fichier dépasse
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
| [9. Les décisions codées, l'extension 04 et C25](docs/journal/09-decisions-codees-et-extension-04.md) | 2026-09-30 | C23 et A7, A8, l'extension 04, la design sync B3, C25 à C29, la spécification du niveau 2 du jeu, S0 d'A7.3.c |
| [10. Le niveau 2 du jeu, le B2B assisté et le moteur complet](docs/journal/10-niveau-2-assiste-moteur-complet.md) | 2026-10-01 | Le journal découpé, C30, A7.3.c de S1 à S5, A12 et A13, les textes de lancement, A14 (la spécification, C32, T0 à T7), A15, les design sync B4 et B6, les briefs B5, B7 et B8 |
| Ce fichier | depuis le 2026-10-02 | Le retour 05 et C34–C35, A16, l'image de partage du moteur (T6.2), A17, l'en-tête du résultat sur téléphone, les branches actives et C36–C37, et la suite |

## B7 : le retour 05 de Claude Design recopié, C34 et C35 tranchées (2026-10-02, #270)

**Ce qui est revenu** : Claude Design a répondu au brief 05 dans le projet, sous `design/ds-extension-05-return/`, et rien hors de ce dossier n'a changé. La liste des fichiers est celle d'avant, le dossier `ds-extension-06` étant celui de B5. `DefinitionTrigger.jsx` garde l'empreinte de `_ds_sync.json` (`sha256`, 12 caractères : la méthode est trouvée ici, elle servira), et les deux contrats qu'un agent de design aurait pu retoucher ne parlent pas de l'extension 05. La consigne ajoutée au prompt de lancement (« ne change aucun fichier hors de ce dossier ») a tenu.

**La réponse** : la puce devient **une ligne d'une feuille de score**, sous le profil du parcours dont elle est la table. La ligne porte la note, une jauge, le nom de l'étape, puis le `?`. Sans cadre, sans rayon de bouton, réglée comme `DataTable` (un filet plein en tête, des tirets fins entre les lignes). Les huit réponses :
- l'étape qui freine prend un lavis et un filet rouge plein de 3 px ;
- la jauge rouge passe au rouge du texte, l'autre mesurait 2,65:1 contre sa piste ;
- une seule colonne à toutes les largeurs : fini Revenue seul sur sa ligne au téléphone ;
- le `?` devient plein, avec un survol, et prend le remplissage inverse une fois ouvert ;
- à l'accueil, le lien passe sur le nom de l'étape ;
- le tampon du roast perd le rouge plein de l'action principale et devient un tampon encré ;
- les noms `StageScore`, `StageScores`, et `StageStamp` proposé ;
- six trouvailles hors du brief.

**Recopié** : les 22 fichiers, par `get_file`, aux mêmes chemins. Pour la première fois, rien ne reste dans le projet, puisque la planche est toute en source comme le brief le demandait. Le sous-agent lancé pour la planche n'avait pas l'outil `DesignSync` et n'a rien fait : tout est passé par la session. Une insécable déclarée par `board.js` est remise ; ailleurs, `COPIE.md` dit où une insécable a pu devenir une espace.

**La planche rejouée** dans Chromium, servie en http avec les polices de `.design-sync/fonts/` (elle les cherche à la racine du projet Claude Design, que le dépôt n'a pas), aux huit cadres : aucune erreur de script, aucun défilement horizontal, des lignes de 44 px au moins, les cinq jauges d'une feuille de même longueur (220 et 166 px ; le retour annonce 223 et 163 avec ses polices).

**Tranché par Antoine**, planche sous les yeux, dans la session (la règle d'A : poser tout de suite quand il est là) :
- **C34** : sur un frein partagé, **toutes les étapes ex aequo en rouge**, comme le profil, qui les signale déjà. Aujourd'hui une seule puce l'est, et l'écran se contredit ;
- **C35** : le nouveau `?` **partout, quiz compris** ;
- le portage dans la même session : **A16**.

**Consigné** : `design/ds-extension-05-return/COPIE.md`, `docs/decisions.md` (C34, C35), `CHANTIERS.md` (B7 fait, A15.19, A16 ouvert, D11 retiré), `design/README.md`, `design/LOIS-UX.md`, `.design-sync/NOTES.md` (« Synced »). Que de la doc sous `design/`, `docs/` et à la racine : rien ne se déploie.


## A16 : la feuille de score portée, C34 et C35 codées (2026-10-02, #271)

**Ce qui change à l'écran** : les cinq puces d'étape du résultat et de l'aperçu de l'accueil deviennent **une feuille de score** (`StageScores`, une `<ol>` nommée « Score par étape, sur 20 »), juste sous le profil du parcours dont elle est la table. Une ligne par étape (`StageScore`, un `<li>`) : la note, une jauge, le nom, le `?`. Ni boîte, ni coin arrondi : un filet plein en tête, des tirets fins entre les lignes, comme `DataTable`. Une seule colonne à toutes les largeurs, 48 px par ligne sur le résultat, 44 px au téléphone et sur l'accueil. La liste est la grille et chaque ligne une sous-grille : les cinq jauges partent du même x et se comparent. `PillarChip` est retiré, ses deux jetons de rembourrage avec lui (le test des jetons morts l'a exigé).

**C34, codée** : le rouge de la feuille suit la netteté du frein. Une ligne sur `clear`, sur `shared`, tout le groupe que nomme le frein (`bottleneck.pillars` : les étapes à moins de 4 points de la plus basse, `CLEAR_GAP`, et pas fortes), aucune sur `level`, comme le profil. En roast, l'étape la plus basse sort de la feuille en tampon et la deuxième prend le rouge, sauf sur `level`. La prop `weakestPillar`, qui ne servait qu'à la puce rouge unique, disparaît de `ResultView`.

**C35, codée** : le `?` (`DefinitionTrigger`) a un vrai bord plein de la couleur du texte au repos, un survol (seulement sur un appareil qui survole), et le remplissage inverse de `--state-selected-*` une fois ouvert. Partout, quiz compris.

**Le tampon du roast** (`StampedPillar`) : encre rouge sur le lavis, bord plein de 3 px, coins de 4 px (`--radius-stamp`), un degré de travers. C'était le rouge plein de l'action principale. Il devient une ligne de la feuille (un `<li>`), lu en mots, ses points cachés.

**À l'accueil**, le lien quitte la puce entière pour le **nom de l'étape**, souligné, nommé « Activation — définition » (nouvelle clé `stageLinkLabelTemplate`, avec `stageScoresLabel` : les deux « à relire », convention 6). La note reste hors du lien. Une bande de 44 px, centrée sur le nom, garde la cible tactile.

**Les jetons, un écart assumé avec le retour** : `tokens/scores.css` proposait onze alias de couleur (`--score-alert-bg: var(--surface-alert)`…) et une dizaine de tailles. Le portage lit les jetons sémantiques directement : un alias qui ne fait que renommer un jeton est un nom de plus à tenir, pour aucun changement de valeur. Restent trois jetons neufs, ceux qui portent une valeur que le système n'avait pas : `--score-row-height-md` et `--score-row-height-sm` (48 et 44 px) et `--radius-stamp`. Le `-1deg` du tampon reste écrit en dur : `individual-transforms.test.ts` compte ces littéraux, et le tampon n'en est qu'un de plus.

**Le contraste, vérifié par les tests de jetons** (le retour l'annonçait, la CI le tient) : le texte rouge sur le lavis mesure 5,28 sur papier et 5,56 la nuit, la jauge rouge 5,28 contre le lavis, et le filet rouge 3,47.

**Tests** :
- unitaires : `stage-scores.test.ts` fixe le balisage (une liste ordonnée nommée, le texte d'une ligne est toute sa lecture, la jauge cachée et à l'échelle, le lien sur le nom seul, le tampon lu en mots) ;
- e2e : `result-composition.spec.ts` mesure la feuille à 1280 en anglais et à 390 en français (aucun rayon, aucun fond hors de la ligne rouge, lignes de 44 px au moins, sans chevauchement, colonnes alignées) ; `result-real.spec.ts` tient C34 sur deux vrais résultats (un frein partagé : deux lignes rouges ; un profil plat : aucune) ; `targets.spec.ts` déclare la bande de 44 px des noms de l'accueil ;
- **non-vacuité, sur un build muté** : un rayon de bouton sur la ligne fait échouer la mesure de la feuille (« 12px » au lieu de « 0px ») ; le rouge calculé sur la seule première étape du frein fait échouer le test du frein partagé (une ligne rouge au lieu de deux) ; le test du profil plat, lui, reste vert, comme attendu. Mutations retirées, build refait.

**Les suites, sur la branche** : 2 908 tests unitaires verts ; 859 specs Playwright, 853 passées en local avec l'émulateur et `CI=1`, 6 ignorées par construction (les specs « jeu fermé ») ; `tsc` et `eslint` propres.

**CodeQL a rougi sur la PR** (une alerte « high », *incomplete multi-character sanitization*) : l'assistant de `stage-scores.test.ts` qui lit le texte d'un rendu retirait les balises en une seule passe. Sans conséquence dans un test, mais l'alerte est juste : il retire maintenant jusqu'à ce que rien ne change, comme celui de `game-shop-phone.test.ts`, déjà corrigé pour la même famille d'alerte. Un assistant de ce genre se copie depuis un test existant, pas de mémoire.

**À 320 px** (hors contrat, remesuré parce que `CHANTIERS.md` E citait la puce) : la feuille tient, tampon compris, et `/r/sample` ne déborde plus (il débordait de 37 px). Un résultat en roast déborde encore de 14 px, par le badge de l'en-tête, hors d'A16 : noté en E.

**Le tampon garde son suffixe** (`stampedSuffix`, « bon dernier ») mais sa composition change : « RETENTION · 8/20 · BON DERNIER » au lieu de « 8/20 RETENTION — bon dernier », capitales comprises. La chaîne n'a pas bougé, donc le grep du bon à tirer ne la verrait pas : elle reprend un « TODO: à relire » pour que le prochain bon à tirer la montre.

**Captures** du vrai build, avant et après, aux deux langues, 1280 et 390 (le résultat, le `?` ouvert, le roast au téléphone avec le tampon et l'Activation en rouge, l'accueil, le `?` du quiz) : conformes à la planche du retour.

**Le design system** : `.design-sync/config.json` retire `PillarChip` et ajoute `StageScore` et `StageScores` (91 composants, `check-inventory` vert) ; les aperçus de `StampedPillar`, `GlossaryTerm` et `DefinitionTrigger` sont réécrits sur la feuille, ceux de `Tag` et `StageProfile` corrigés dans leurs commentaires, ceux de `StageScore` et `StageScores` neufs ; `conventions.md` suit. **La re-synchro vers Claude Design est B9**, pas faite ici.

**Consigné** : `CHANTIERS.md` (A15 clos, A16 retiré, B7, B9 ouvert), `docs/decisions.md` (C34 et C35 codées), `design/README.md`, `design/LOIS-UX.md` (la loi de similarité : tenue).

## A14.c, T6.2 : l'image de partage du moteur, portée du retour de B5 (2026-10-02, #272)

Antoine a lancé le brief 06 dans Claude Design le soir même du dépôt (D12), puis a dit « Claude Design a terminé ». Cette PR recopie le retour dans le dépôt et le porte : c'était la dernière pièce d'A14.c.

**Le retour, recopié** (`design/ds-extension-06-return/`) : les huit fichiers texte, lus un par un par `DesignSync` (`get_file`) et traités comme des données. Ce sont le README des quatre réponses, les quatre sources de `og/` (le cadre, le chronomètre, les jetons, les chaînes) et l'aperçu navigateur. Les quatre PNG de `render/` restent dans le projet : l'outil ne rapatrie pas une image. Ils ne manquent pas, parce que les sources ont été rendues telles quelles par le Satori du dépôt (`next/og`, les cinq polices de `src/lib/og/fonts/`). `COPIE.md` le dit, avec l'insécable de `NB` remise à U+00A0. Les réponses de Claude Design :
- **le fond** : du papier ;
- **l'image** : le chronomètre seul, sans peloton, parce qu'en fil les chiffres de l'exemple se liraient comme ceux de qui partage ;
- **les mots** : l'eyebrow, le titre de la page sur deux lignes avec « moteur » en outremer, une ligne neuve et une promesse neuve en capitales mono ;
- **la pastille** : « 2/3 · CONTRE-LA-MONTRE », oui, à la place où le résultat porte « 1/3 · PLAINE ».

**Le portage** : `lib/og/engine-frame.tsx`, servi par `aarrr-funnel-template/opengraph-image.tsx`, une image par langue, prérendue (●), sur le modèle du jeu. La page déclare son image par la convention de fichier (`ownShareImage`). Les mesures sont celles du retour, sans exception. **Rendu par le même Satori, le portage est identique au pixel aux sources du retour partout, sauf deux zones voulues**, mesurées au seuil de 16 sur 255 par canal : 0 pixel d'écart hors du chronomètre et du pictogramme, aux deux langues.

**Les deux dessins repris du produit plutôt que du retour.** Claude Design a redessiné à la main le chronomètre et le pictogramme de la pastille, en disant reprendre ceux de la page et du bandeau. Ses versions s'en écartent : la lunette est hors du cadran au lieu d'être dedans, le temps couru fait 38 % au lieu de 70 %, les boutons sont autres, et les traits de vitesse du pictogramme sont placés ailleurs. Un second dessin aurait fait un second emblème le jour où l'un des deux bouge. Leurs formes sont donc devenues des données :
- `components/brand/stopwatch-geometry.ts`, que `Stopwatch.tsx` peint en CSS et l'image en littéraux ;
- `components/brand/space-pictos.ts`, d'où `SpaceBand` tire ses trois pictogrammes. L'image du résultat y prend celui du Tour, dont elle gardait une copie.

Le balisage du composant `Stopwatch` est identique avant et après, au caractère près. Celui des pictogrammes l'est attribut par attribut, à un `fill="none"` explicite près sur trois lignes ouvertes. L'image du résultat rend les mêmes octets avant et après : sa version d'adresse (`SHARE_IMAGE_VERSION`) ne bouge pas. Pas de re-synchro due à Claude Design (`.design-sync/NOTES.md`).

**Les autres écarts** (`docs/engine/moteur-complet.md` §19.11) :
- La route ne lit pas le drapeau elle-même. `isEnginePath` couvre désormais tout ce qui est sous la page, comme `isGamePath`, et le proxy rend l'image en 404 avec la page ; l'aperçu propriétaire l'ouvre avec elle. La spec disait « comme le jeu, elle le vérifie elle-même », mais le jeu ne le fait pas.
- Les capitales sont posées dans `lib/og/engine-share-text.ts`, comme pour les images du jeu, pas par `textTransform` : `fonts.test.ts` vérifie ainsi ce qui est dessiné.
- Le titre et l'eyebrow de la page vivent maintenant dans `content/engine-share.ts`, que lit `engine-copy.ts`. Le titre dessiné et le H1 sont une seule chaîne. L'image n'atteint que ce module de la copie du moteur (budget de fan-in : 3 routes), pas `engine-copy.ts`.
- L'outremer entre dans les jetons typés (`SPACE_PRIMITIVES`, tenu égal à `spaces.css`), d'où `OG_ULTRAMARINE`.
- Le texte alternatif est un gabarit rempli avec ce qui est dessiné (la pastille, le H1, la ligne, la promesse, l'adresse), et il ne peut pas en dériver. Vérifié une fois contre le retour : identique au caractère près dans les deux langues, insécables comprises. En production, l'adresse est celle de `NEXT_PUBLIC_SITE_URL` (`www.`), comme le badge dessiné.

**Les gardes** :
- `engine-share-text.test.ts` : le titre est le H1, un seul mot est en outremer, la pastille porte les mots du bandeau, l'alt est sans trou, et les règles françaises sont tenues. Un H1 renommé sous l'image, ou un mot accentué perdu, fait échouer le build plutôt que de dessiner un demi-titre.
- `brand-marks.test.ts` : les épaisseurs de trait de `Stopwatch.module.css` et le mélange du temps couru sont ceux que l'image dessine. Aucun fichier source n'écrit le tracé d'un pictogramme hors de `space-pictos.ts`.
- `token-sources.test.ts` : l'outremer typé est celui de `spaces.css`.
- `engine-boundary.test.ts`, règle 1 : la route d'image est la seule porte de l'OG sous la route du moteur. Elle n'atteint rien du moteur que son titre, et rien du moteur ne l'atteint.
- `fonts.test.ts` lit les chaînes par `engineShareText`.
- `proxy.test.ts` ferme et ouvre l'image avec la page.
- `e2e/engine-share-image.spec.ts` couvre trois choses :
  - moteur fermé, un 404 sans aperçu et avec un cookie deviné ;
  - le PNG en 1 200 × 630, différent d'une langue à l'autre ;
  - l'unique `og:image` de la page, qui pointe sur elle, avec son alt.

**Relectures** :
- sécurité : un constat réel, et un durcissement.
  - **Le constat** : moteur fermé, `/xx/aarrr-funnel-template/opengraph-image/en` répondait 200 avec l'image anglaise, et de même pour tout premier segment autre que `en` ou `fr`, `/EN/` compris. **Les images du jeu, fermé en production, avaient le même défaut depuis G4b**, et celle de l'accueil coûtait un rendu Satori par segment inventé. La cause : le proxy ne ferme que ce que `splitLocalePath` reconnaît, et `dynamicParams = false` ne s'applique pas à une route de métadonnées. Next la rend à la demande, et le loader retire même ce réglage des réexports (`NEXTJS.md` §1.11). Reproduit sur un build de production : 200 et un PNG pour `/xx/game/opengraph-image/en` comme pour `/xx/opengraph-image/en`. **Corrigé pour toutes les routes d'image** par `lib/og/image-metadata.ts` : aucune image pour une langue inconnue, et le `GET` généré par Next répond 404 avant tout rendu. `share-image-routes.test.ts` parcourt chaque fichier `opengraph-image` de l'arbre (huit). La spec de `share-previews` vérifie les huit adresses sous `xx`, `EN` et `en-US`, avec un témoin qui répond 200 ; elle a été vue rouge sur l'ancien build avant le correctif.
  - **Le durcissement** : la garde de la règle 1 nommait quatre modules. Elle compte maintenant tout ce que l'image atteint contre la liste interdite, et exige que le reste du moteur n'atteigne de `lib/og` que `tokens.ts` (pour `OG_SIZE`, par `meta.ts`). Deux sabotages la font tomber : un fichier de l'îlot qui importe `lib/og/picto`, et le texte de l'image qui atteint le dictionnaire. ;
- copie : un défaut, traité. L'eyebrow déplacé avait perdu la couverture du marqueur de tête d'`engine-copy.ts` : il a maintenant le sien. Toute la copie neuve (la ligne, la promesse, le gabarit de l'alt) va au bon à tirer A14.d. La carte doit montrer l'alt de production, qui finit en `www.tourdegrowth.com`.

**Vérifié** :
- **Le rendu** : le portage comparé au pixel au rendu des sources du retour par le même Satori (0 écart hors des deux zones voulues). Lu à l'œil en français et en anglais à 1 200 px, puis à 320 px : le titre, le mot bleu, le logo et le chronomètre se lisent.
- **Les octets** : l'image du résultat est identique avant et après la sortie de son pictogramme ; le balisage du composant `Stopwatch` aussi.
- **Les mots** : l'alt, la ligne, la promesse, l'eyebrow, la pastille et la coupe du titre sont identiques à `og/strings.og.mjs`, aux deux langues.
- **Les tests unitaires** : `vitest --coverage`, 2 942 tests dans 230 fichiers, au-dessus des seuils, sur l'arbre rebasé après A16 (#271).
- **Les contrôles statiques** : `tsc` et `eslint` propres ; `next build` propre moteur fermé et moteur ouvert, l'image prérendue (●) les deux fois.
- **Playwright complet, build fermé comme la CI**, avec l'émulateur Firestore et `CI=1` : 861 specs, 855 passées, 6 ignorées par construction, aucune au second essai. Rejoué après le rebase sur A16 (#271), qui touchait le résultat et les jetons : 865 specs, 859 passées, 6 ignorées.
- **Build `ENGINE_ENABLED=true`**, avec l'émulateur : les specs `engine-*`, `share-previews`, `game-share-images`, `result-real` et `locale-routing`, soit 310. 299 passées et 5 ignorées par construction. Les six de `engine-flag.spec.ts` sont rouges, comme il se doit : elles sont écrites pour un serveur fermé (leur en-tête le dit), et le motif `engine-*` les a prises. L'image y répond à tous, et la page la déclare avec son alt.
- **Les sabotages** : seize sur les gardes neuves, tous tombés.
  - Un glyphe absent du sous-ensemble dans la ligne (« ≈ » : la flèche, elle, est dans le sous-ensemble d'Inter et passe à juste titre).
  - L'outremer typé décalé de `spaces.css`, et `OG_STONE_3` sur le mauvais papier.
  - La lunette à 7 px en CSS, le temps couru à 20 %, une seconde copie d'un pictogramme.
  - Un H1 renommé et un mot accentué perdu (le module ne se charge plus), un trou dans l'alt.
  - L'îlot qui importe `lib/og`, l'image qui atteint `engine-copy.ts` (la règle et le fan-in tombent) ou `lib/engine`, et les deux sabotages de la garde durcie.
  - `isEnginePath` remis au chemin exact (le proxy et l'accès tombent), et le repli `"en"` remis à l'image du jeu.

**Consigné** : `CHANTIERS.md` (A14.c, A14.d, B5 clos, D12 retirée, D2, et A17 pour le halo grisé des images de contenu, trouvé en route : `transparent` dans un dégradé Satori se mélange à travers le noir), `ENGINE.md`, `docs/engine/moteur-complet.md` §19.11, `NEXTJS.md` §1.10 et §1.11, `design/README.md`, `.design-sync/NOTES.md`, `CLAUDE.md` (l'état et les chiffres).

## A17 : le halo des images de partage, clair et plus gris (2026-10-02, #274)

Trouvé par le portage de l'image du moteur (T6.2) et confié par Antoine le même soir.

**Le défaut** : l'image de partage de l'accueil, que reprennent « Comment ça marche », le glossaire et le quiz (`lib/og/content-frame.tsx`), pose sur le papier un halo blanc en haut à gauche. Son dégradé finissait sur `transparent`, que Satori mélange à travers le noir. Le halo dessinait donc une bande grise : le fond tombait à (204, 199, 188) sous le sous-titre, contre (231, 225, 210) pour le papier nu. Rien ne cassait, et seule une comparaison au rendu correct du moteur l'a montré. **Ce que ça coûtait** : l'accent rouge « cale-t-elle ? » descendait à 2,76:1 sur ce gris, sous les 3:1 de sa taille d'affichage, et le sous-titre à 4,50:1. La lampe de la nuit du jeu (`game-frame.tsx`) avait la même forme, sans dommage visible à 6 %.

**Le correctif** : chaque dégradé finit sur sa propre couleur à alpha nul. Celui du halo et celui de la lampe changent. Ceux des ombres noires sont écrits `rgba(0, 0, 0, 0)` au lieu de `transparent`, au pixel près pareil, pour que la règle se lise sans exception.

**Mesuré sur les dix images** (accueil, quiz, hub et deux niveaux du jeu, aux deux langues), avant contre après :
- **sens des écarts** : chaque pixel qui change s'éclaircit, aucun ne s'assombrit ;
- **amplitude** : jusqu'à 32 niveaux de luminance sur le papier, 4 sur la nuit ;
- **contrastes au pire** dans la bande sans texte : le sous-titre passe de 4,50 à 5,81:1, l'accent rouge de 2,76 à 3,57:1. Ce sont les valeurs du papier nu, que le halo ne fait plus qu'éclaircir.

Sur la nuit, la lampe la plus claire ne change pas : seul son milieu remonte. Le gris clair de la nuit reste au-dessus de 7,6:1.

**La garde** (`src/lib/og/ground-lift.test.ts`) :
- aucun cadre d'image (`lib/og`, et les routes `opengraph-image` et `share`) n'écrit `transparent` dans un dégradé ;
- l'image de l'accueil, rendue, n'est nulle part plus sombre que son papier, dans la bande de 46 px que le texte ne traverse pas, hors de la ligne de route.

Le PNG est décodé avec `node:zlib` : `sharp` n'arrive que par `next`, en dépendance optionnelle, et un test ne s'y adosse pas. **Deux sabotages** : `transparent` remis fait tomber les deux gardes ; le même défaut écrit `rgba(0,0,0,0)` ne fait tomber que la seconde, comme prévu.

**Ce qui ne bouge pas** : l'adresse de l'image de l'accueil garde son `?hash`, qui est celui du fichier de la route et non de l'image (`lib/i18n/meta.ts`). Une plateforme qui l'a déjà en cache la garde jusqu'à sa prochaine lecture. Rien n'est encore lancé sur les réseaux (C22), donc rien à forcer.

**Vérifié** :
- les dix images relues avant et après, en paires ;
- `vitest`, 2 944 tests ;
- `tsc` et `eslint` propres ;
- Playwright complet sur un build fermé comme la CI, avec l'émulateur et `CI=1` : 865 specs, 859 passées, 6 ignorées par construction.

**Consigné** : `CHANTIERS.md` (A17 clos), `NEXTJS.md` §1.10.


## L'en-tête du résultat sur téléphone : les états descendent en tête de page (2026-10-02, #273)

**La demande** (Antoine) : à 320 px, un résultat en roast débordait de 14 px, par le badge roast de l'en-tête (`CHANTIERS.md` E, noté par A16).

**Mesuré sur un vrai build, avec l'émulateur, dans tous les états de l'en-tête** (le logo, puis à droite la langue, le tag Deep dive, le badge roast) et non dans le seul où le défaut avait été vu :

| État | 320 px | 360 px | 375 px | 390 px (contrat) |
|---|---|---|---|---|
| l'exemple, sans état | tient | tient | tient | tient |
| roast | +14 px | tient | tient | tient |
| Deep dive | +13 px | tient | tient | tient |
| roast + Deep dive | +79 px | +39 px | +24 px | **+9 px** |

Le dernier état débordait **dans le contrat**, et aucun test ne le voyait : seul `/r/sample`, sans état, était mesuré au téléphone (`landing-mobile.spec.ts` et `result-composition.spec.ts`, entre autres). Les captures ont montré un second défaut, sans débordement : le badge roast se coupait en « 🔥 ROAST / MODE » dès 390 px, et dès 430 px quand le tag Deep dive était à côté, lui-même coupé en « DEEP / DIVE ».

**Pourquoi pas comme R-21** : l'accueil a réglé le même problème en masquant au téléphone ce que le pied de page porte déjà, et en refusant un en-tête sur deux lignes (132 à 171 px). Ici, rien d'autre sur la page ne dit « roast », et ce mot est ce qui prévient le lecteur d'un lien partagé que le ton dur a été choisi. Masquer était exclu.

**Ce qui change**, au point de rupture de l'app (la bascule est en CSS seul, sans JavaScript) :
- jusqu'à 760 px, l'en-tête garde le logo et la langue, et les deux états descendent sur leur propre ligne en tête de page, là où l'exemple porte son badge d'exemple ;
- à partir de 761 px, rien ne bouge ;
- les états sont rendus deux fois (`stateTags`), et celui qui ne s'affiche pas est en `display: none`, donc hors de l'arbre d'accessibilité ;
- le badge roast ne se coupe plus jamais (`white-space: nowrap`).

**Tests** :
- un vrai résultat de plus dans l'émulateur, `roastDeep` (roast, avec un Deep dive, 54/100), l'état le plus large de l'en-tête ;
- `e2e/result-header.spec.ts` couvre les quatre états, aux deux langues. Au téléphone (320, 360, 375, 390, 430 et 760 px), la page ne défile pas de côté, les états sont en tête de page et pas dans l'en-tête, et chacun tient sur une ligne. À 761 et 1 280 px, la ligne de l'en-tête tient et les états y sont ;
- **non-vacuité, sur un build sans le correctif** : les six cas branchés sur l'émulateur échouent dès 320 px (de 13 à 79 px de trop), et l'exemple passe, comme attendu ;
- le contrôle « une ligne » est éprouvé à part, sur le même build, avec le badge roast : coupé, il fait 36 px de contenu, et il ressort faux ; sur une ligne, il fait 18 px ;
- **la relecture de copie a trouvé une borne sans marge** : le premier jet comptait en tailles de police (moins de deux). Or le tag Deep dive est composé plein (`--meta-2xs`, hauteur de ligne 1) : coupé, il fait exactement deux tailles de police, et seul le `<` strict l'attrapait. La borne compte maintenant en hauteurs de ligne (moins d'une et demie), et elle est éprouvée sur le tag Deep dive coupé aussi.

**Trouvé en mesurant, puis réglé à la demande d'Antoine dans la même PR** : `/r/sample` débordait de 8 px à 761 px et de 1 px à 768 (un iPad en portrait), quoi que tienne l'en-tête. La cause n'était ni l'en-tête ni le seuil des deux colonnes, comme je l'avais d'abord écrit, mais **les cartes de forces et de faiblesses** (`.cardGrid`). Au-dessus de 760 px, elles passaient toujours à deux colonnes `1fr 1fr`. À 761 px, la colonne de droite n'a que 249 px (713 − 420 − 44), donc deux cartes de 120 px, avec 76 px de texte par ligne. Un mot de l'exemple n'y tenait pas, et la grille réclamait 281 px (278 en français). Les vrais résultats tenaient seulement parce que leurs mots étaient plus courts, aussi à l'étroit.

**Le correctif** : la grille se règle sur sa propre largeur, `repeat(auto-fill, minmax(min(100%, 240px), 1fr))`, donc deux cartes côte à côte seulement si chacune a 240 px. Concrètement, une carte par ligne de 761 à environ 1 000 px, puis deux, de 260 px à pleine largeur comme avant. `auto-fill` plutôt qu'`auto-fit` : la seule force d'un roast garde sa demi-largeur au bureau, comme avec `1fr 1fr`. Mesuré : 249, 388, puis 240 + 240 et 260 + 260 px à 761, 900, 1 000 et 1 280 px, sans défilement de côté.

**Le test** : à partir de 761 px, `result-header.spec.ts` mesure maintenant toute la page, et non plus la seule ligne de l'en-tête, à 761, 768, 834, 1 024 et 1 280 px. **Non-vacuité** : sur le build sans ce correctif, l'exemple échoue à 761 px dans les deux langues, et les vrais résultats passent.

**Les suites, sur la branche** : 2 942 tests unitaires verts ; 882 specs Playwright, 876 passées en local avec l'émulateur et `CI=1`, 6 ignorées par construction ; `tsc` et `eslint` propres.

**Captures** du vrai build, à 320, 390 et 1 280 px, avant et après, pour le roast, le Deep dive et les deux ensemble. Au téléphone, l'en-tête est fin et les deux tags sont lisibles sur une ligne au-dessus de la carte du score. Au bureau, l'en-tête est inchangé.


## Les branches encore actives : une orpheline, deux PR Dependabot, et React 19.3 seul (2026-10-02, #275)

**La demande** (Antoine) : « Il y a plusieurs branches qui sont encore actives, vérifie si c'est normal », puis « go pour tous les points » sur les quatre propositions.

**Lu sur GitHub, pas dans le clone** (convention 10) : quatre branches, `main`, `claude/repo-technical-functional-audit-e9xr8t`, et celles des PR Dependabot #239 et #244.

- **`claude/repo-technical-functional-audit-e9xr8t` était orpheline.** Son bout, `4dc96cb`, est le squash même de #185 (2026-09-29). La session qui avait livré #128 à #185 sous ce nom l'avait donc repoussée depuis `main` après le merge, puis n'y avait plus rien mis. Sans PR, la suppression automatique ne l'a jamais touchée. Elle avait 0 commit d'avance et 86 de retard. La session n'a pas pu la supprimer : le proxy git refuse en 403 toute écriture hors de la branche désignée. Antoine l'a supprimée sur GitHub pendant la session.
- **#239 et #244 étaient normales**, puisqu'une PR Dependabot vit tant qu'elle est ouverte et que `/livrer` §0 demande Antoine pour toute dépendance. **Mais aucun document ne les suivait** : rien dans `CHANTIERS.md`, aucune question posée. #244 remplaçait #238, écartée par A13.

**Un piège de mesure** : le clone de la session est superficiel (50 commits). `git merge-base --is-ancestor` y répondait que la branche orpheline n'était pas dans `main`, avec 5 commits d'avance. Après `git fetch --unshallow`, elle était ancêtre de `main`, avec 0 commit d'avance. C'est écrit dans `GITHUB.md` §1.2.

**#239 est mergée** (`0357c4e`) : vitest 5.0.2, eslint-config-next 16.3.6 (aligné sur `next`), @types/node 22.20.4. Le lockfile a été relu entrée par entrée. Tout y est `dev`, sauf `@types/node` (des `.d.ts`, tirés par `protobufjs`) et le `fsevents` de Playwright (version inchangée). La PR a été remise à jour sur `main` par un commit de fusion, la CI est passée verte sur cette tête, et le squash lui est identique. Production vérifiée : statut Vercel du commit à `success`, pages servies en 200.

**#244, mesurée hors ligne** (`VERCEL.md` §1.2), bundle serveur par bundle serveur, en Mo :

| Bundle | `main` | `main` + #244 | `main` + React seul |
|---|---|---|---|
| `admin/stats/json` | 11,73 | 15,52 | 11,73 |
| `admin/audit` | 11,71 | 15,50 | 11,71 |
| `api/submissions/[id]/deep-dive` | 8,80 | 12,59 | 8,80 |
| `[locale]/aarrr-funnel-template` | 7,14 | 7,14 | 7,14 |
| `quiz/share/[locale]` | 6,69 | 6,70 | 6,70 |
| `_middleware` | 1,77 | 1,77 | 1,77 |
| **Total** | **47,83** | **59,21** | **47,84** |

Paquet par paquet, en comparant les `filePathMap` : `@google-cloud/firestore-api` ajoute 1,71 Mo, `google-gax` en tête 1,71 (5.0.8 → 6.7.0), et une seconde `google-gax` 5.0.8, imbriquée sous `firestore-api`, 0,84. `@google-cloud/firestore` perd 0,75, parce que sa couche générée est partie dans `firestore-api`. Le reste est en miettes. React pèse +0,00.

**La cause est en amont.** `firebase-admin` 14.4 et après demande `@google-cloud/firestore` ^9.1.0. Toutes les 9.x, jusqu'à 9.3.1 (2026-10-01), tournent sur `google-gax` ^6 mais épinglent `@google-cloud/firestore-api` ^0.2.0, dont la seule version est sur `google-gax` ^5. Les versions 0.4 et suivantes de `firestore-api` sont sur `google-gax` 6, mais hors de la plage. Des `overrides` npm forceraient l'arbre, mais ils mettraient en production une combinaison que personne n'a testée.

Les suites passaient pourtant sur `main` + #244 : lint, `tsc`, 2 944 tests unitaires et 876 specs Playwright sur 882 avec l'émulateur (6 ignorées par construction).

**C36, tranchée par Antoine** : React 19.3 seul. Ce que fait cette PR :
- `react` et `react-dom` passent en ^19.3.0. Le lockfile est régénéré par npm 11, parce que npm 10 retirait le champ `libc` de dix entrées, et ce bruit n'avait rien à faire là. Trois entrées changent, `react`, `react-dom` et `scheduler` 0.28.0, identiques à celles de Dependabot ;
- `firebase-admin` ≥ 14.4 est ignoré dans `dependabot.yml`, avec sa raison ;
- le déclencheur pour y revenir est en `CHANTIERS.md` E, et la décision en `VERCEL.md` §2.2.

`npm audit` reste à 0.

**Entre-temps, Dependabot a refait #244 en #276.** Le merge de #239 l'avait mise en conflit : deux PR groupées se touchent toujours dans `package.json`. #276 ajoute `next` 16.3.7 (un seul correctif de Turbopack rétroporté) et les types React 19.3. Mesuré sur `main` + React 19.3 + ce reste, exactement les treize entrées de lockfile que Dependabot écrit : 47,84 Mo, aucun écart. Lint, `tsc`, 2 944 tests unitaires et `npm audit` sont propres. **C37, tranchée par Antoine** : la prendre, une fois que Dependabot l'aura réduite à ce reste. Ce n'est pas le choix d'A13, qui avait écarté 16.3.7 la veille de sa publication : il s'agit maintenant d'un correctif seul, publié depuis deux jours, et sa CI complète passera avant le merge.

**Vérifié sur la branche** (React seul, `firebase-admin` 14.3) : lint et `tsc` propres, 2 944 tests unitaires verts avec la couverture au-dessus de ses seuils, et 882 specs Playwright, dont 876 passées avec l'émulateur et `CI=1`, 6 ignorées par construction. Le poids est mesuré plus haut. Il est aussi vérifié que la nouvelle règle de `dependabot.yml` se lit : le contrôle de GitHub sur ce fichier est vert.

**Le journal, archivé une fois de plus.** Cette entrée portait `JOURNAL.md` à environ 202 000 caractères, pour un plafond de 200 000, et le test rougissait. Les 35 entrées du 2026-10-01 sont parties telles quelles dans `docs/journal/10-niveau-2-assiste-moteur-complet.md`. Il est vérifié que le bloc s'y retrouve à l'identique, et que les entrées du 2026-10-02 n'ont pas bougé. La table des volumes gagne sa ligne, et ce fichier repart à environ 37 000 caractères.

**Ce qui reste pour la suite, et pourquoi ce fichier le dit** : `GITHUB.md` §2 pose maintenant qu'une PR Dependabot ouverte se mesure et se pose en question dans `CHANTIERS.md` C. Sans cette règle, #244 serait restée ouverte, ou aurait été mergée par une session pressée, avec 11 Mo de plus par déploiement.

## B10 : le brief 07 du moteur, plus simple sans perdre son expertise (2026-10-02)

**La demande d'Antoine** : la saisie du moteur reste « extrêmement dense », au retour comme dans le pas à pas. Faire travailler Claude Design sur le moteur seul, pour une fonctionnalité plus simple à comprendre et à utiliser, « sans retirer toute l'expertise et la connaissance qu'il va apporter ».

**Ce qui est livré** : `design/DS-EXTENSION-BRIEF-07.md`, en anglais comme les précédents, et pour la première fois sur un parcours plutôt qu'un composant. Ses seize écrans sont dans `design/ds-extension-07/`, chacun en français à 1 280 px et en anglais à 390 px, sauf six qui n'existent qu'une fois (la liste « À aller chercher », l'hybride, le mois suivant, les deux pages entières à 1×, la slide). `CATALOGUE.md`, dans le même dossier, est le texte de chaque chiffre tel que la page l'imprime, extrait du HTML prérendu dans les deux langues : 41 fiches par langue, les 17 + 15 + 1 chiffres et les huit calculés.

**Mesuré sur un build de production** (`ENGINE_ENABLED=true`, horloge au 24 septembre 2026, l'exemple §6.0, et pour le retour le même exemple avec quatre chiffres remis « à faire », touché douze jours plus tôt) :
- l'outil commence à 1 267 px du haut de la page au bureau et à 1 849 px au téléphone, **à la première visite comme au retour** : les deux captures d'arrivée sont identiques à l'octet, et une seule est gardée ;
- la carte de réglage fait 1 431 px et 36 contrôles ; le tableau de bord du retour, 2 463 px, 12 blocs et 75 contrôles visibles (3 597 px au téléphone) ; un chiffre ouvert, 1 667 px et 15 contrôles ;
- le pas à pas compte 21 écrans en libre-service, 38 en hybride.

**Ce que le brief pose** : l'inventaire de ce qui existe, sept raisons de la densité (à contester), ce qui doit rester (chaque chiffre garde sa définition, sa formule, où le trouver, son piège, son repère et son effort, joignables au moment de le saisir ; les quatre réponses ; seule une cible d'équipe désigne l'étape, C1 ; le verdict est le titre de la première slide ; le local seul et la promesse avant l'appel ; la série mensuelle ; « deux moteurs, un total » ; le contenu que lit un moteur de recherche), ce qui peut changer (l'ordre, les réglages, la granularité du pas à pas, la composition du tableau, toute la copie), vingt questions, quinze contraintes dont une nouvelle (les données ne bougent pas sans décision d'Antoine), et les états à dessiner. **En retour, deux pièces neuves** : `INVENTORY.md`, où est passé chaque morceau de l'expertise (c'est ainsi qu'Antoine vérifie que rien ne s'est perdu), et `COPY.md` pour son bon à tirer.

**Deux pièges de capture** :
- une capture d'élément plus haute que la fenêtre dessinait l'en-tête collant du site en travers, au milieu du tableau de bord. Les éléments `sticky` et `fixed` sont passés en `static` avant chaque capture d'élément ;
- la souris, laissée là par le dernier clic, mettait « Je l'ai » en survol sur l'écran d'un chiffre vierge. Elle est ramenée dans le coin avant chaque capture.

**Le script reste** : `scripts/engine-density.capture.ts`, avec sa propre config hors de `e2e/` (la CI ne le lance pas), refait les captures, le catalogue et les mesures. Relancé sous un autre `OUT`, il redonne le même catalogue à l'octet. Le portage du retour le relancera pour mesurer l'après de la même façon.

**Vérifié contre le code** : chaque chaîne citée relue dans `engine-copy.ts` (deux corrigées : « Motion shown: stages and what-ifs », et l'assisté a cinq cibles possibles, pas trois) ; les comptes d'écrans contre `steps-model.ts` ; les sept chiffres de la base contre `shared-counts.ts` ; les défauts du réglage contre la capture.

**Le dépôt** : 28 fichiers écrits par `DesignSync` dans le projet `23b9671c-…`, aux mêmes chemins que dans le dépôt, sous un plan qui ne nommait qu'eux, sans suppression. `get_project` avant (un design system, modifiable) ; `list_files` avant (rien sous `design/ds-extension-07/`) et après (les 28 chemins, les briefs 04 à 06 et leurs retours inchangés) ; le brief relu côté projet par `get_file`, identique au fichier du commit.

**Ouvert** : D14 (le lancer, avec le prompt à coller) et C38 (les bons à tirer A7.3.d et A14.d attendent-ils le portage du retour ? Reco : oui, une copie relue avant la refonte serait relue deux fois). `ENGINE.md` dit qu'une refonte est demandée.

## Les suites de C36 : `next` 16.3.7 et les outils de développement alignés (2026-10-02, #277, #278)

**Ce qui s'est passé après #275**, et pourquoi ce n'est pas #276 qui a été mergée : Dependabot recrée sa PR groupée chaque fois que `main` la met en conflit ou que sa configuration change. #244 est devenue #276 après #239, puis #277 après #275, qui avait pris React et fait ignorer `firebase-admin`. Chaque fois, le numéro écrit dans les documents devenait faux (convention 8, une fois de plus) : `docs/decisions.md` nomme maintenant la PR qui a réellement porté la montée.

- **#277 (C37)** : la seule montée de `next` 16.3.6 → 16.3.7, un correctif de Turbopack rétroporté. Mesurée avant le merge sur `main` + React 19.3 + ce reste : 47,84 Mo, aucun écart. CI verte sur sa tête, squash `519436e` identique à elle. Production vérifiée : statut Vercel du commit à `success`, pages servies en 200.
- **#278 (C39, Antoine)** : les types React passent en 19.3, et `eslint-config-next` en 16.3.7 pour suivre `next`. Ils étaient dans #276 et sont partis dans le groupe de développement. Toutes les entrées du lockfile sont de développement. La PR a été remise à jour sur `main`, `next` 16.3.7 compris, avant le merge, et la CI est passée verte sur cette tête. Squash `f856e45`, identique à cette tête fusionnée avec #279, mergée entre-temps sans toucher aux dépendances. **Une collision de numéros** : le titre de ce squash dit « C38 », parce que la session de #279 avait ouvert sa propre C38 au même moment (les bons à tirer du moteur et le brief 07, encore ouverte). La décision de #278 est donc C39 dans `CHANTIERS.md` et `docs/decisions.md`, et le titre du commit, déjà sur `main`, reste tel quel.

**Un échec de CI qui n'était pas de cette PR** : le premier passage de #280 (doc seule) a échoué au `next build`, « next/font/google queries have exactly one entry » pour chaque fichier de la police Inter. Le même code sur `main` construisait en CI comme en local, et le runner partait sans cache, donc ce n'était pas le `.next` périmé de `NEXTJS.md` §1.9. Il restait la réponse de Google Fonts à ce moment-là. Le job a été relancé une fois, la raison est en commentaire sur la PR, et la CI de la tête mergée, la même doc remise sur `main`, est verte.

**État au soir** : `next` 16.3.7, React 19.3.0, `firebase-admin` 14.3.0 (ignoré à partir de 14.4, C36), `npm audit` à 0. Aucune PR Dependabot ouverte. La ligne de `CLAUDE.md` sur les chiffres de référence le dit.

## B11 : le brief 08 de l'en-tête collant compact, déposé dans Claude Design (2026-10-02, #281)

**La demande** (Antoine) : l'en-tête collant est agréable sur un téléphone tenu droit, mais sur un écran de bureau, en paysage, il prend beaucoup de place. Il veut le réduire au défilement, en gardant de quoi savoir où l'on est dans l'app, avec une transition élégante, et passer par Claude Design pour la qualité du rendu.

**Mesuré sur un build de production du jour** (`next build` avec le jeu et le moteur ouverts, puis `next start`), sur huit pages et huit fenêtres :
- avec le bandeau d'espace, l'en-tête fait 118 px au bureau (une ligne de 72 px, tenue par les 44 px du sélecteur de langue, et un bandeau de 46 px). C'est 16,4 % d'un écran de 1 280 × 720, 15,4 % à 1 366 × 768 et 10,9 % à 1 920 × 1 080 ;
- **sur un téléphone en paysage (844 × 390), c'est 30,3 %**, contre 13,5 % en portrait (114 px), le cas qu'Antoine trouve agréable. Le problème est donc la fenêtre en paysage, pas la fenêtre large, ce qu'Antoine disait déjà ;
- sans bandeau (glossaire, pages de lecture), 74 px ; dans le quiz, 93 px.

**Trouvé en mesurant** : dans le quiz, `--sticky-offset` vaut 118 px pour un en-tête de 93 px au bureau (106 px sur téléphone). La valeur est mesurée une fois par sorte d'en-tête, et la ligne du quiz n'a pas de contrôle de 44 px. Les ancres et le focus s'y arrêtent 25 px trop bas, ce qui ne masque rien. Le portage, qui fera suivre l'état à `--sticky-offset`, le rendra juste (`CHANTIERS.md` B11).

**Le brief** (`design/DS-EXTENSION-BRIEF-08.md`, en anglais, sur la forme du 05) :
- le constat chiffré, puis l'en-tête tel que le code le dessine : un composant pour toutes les pages, le verre à 92 %, une borne de contraste et non un goût, la ligne, le bandeau et ses trois largeurs, le filet tiré au défilement, ce que chaque page met à droite, et ce qui dépend de la hauteur (`scroll-padding-top`, les chiffres « Et si » du moteur, la colonne d'un niveau du jeu) ;
- ce qui doit rester : l'espace où l'on est, le portrait inchangé, **le bouton principal de l'accueil** (A15.15 a masqué le bloc de fin de page au-dessus de 760 px parce que l'en-tête garde le sien), le sélecteur de langue, que rien d'autre ne porte, la course à trois étapes, les 44 px, le contraste ;
- sept règles de mécanique : rien ne bouge sous l'en-tête et le changement ne se nourrit pas du défilement (sans quoi l'en-tête clignote à son seuil), l'en-tête d'aujourd'hui sans JavaScript, le mouvement réduit (la garde unique coupe toute transition), l'échelle de `motion.css`, ce qui colle dessous le suit, le clavier, un composant pour les deux langues ;
- huit questions, avec notre penchant : toute fenêtre en paysage, téléphone compris ; un déclenchement par la position, pas par le sens du défilement ; un changement d'état plutôt qu'une animation asservie au défilement ; une ligne d'environ 56 px ;
- le retour demandé : un README des réponses, **la spécification du mouvement** (propriété, valeurs, durée et courbe par jeton, dans les deux sens, et la version en mouvement réduit), `SiteHeader` et son `.prompt.md`, et une planche **qui défile vraiment**, ouvrable depuis ses sources.

Seize captures dans `design/ds-extension-08/`, toutes relues à l'œil et toutes distinctes. Celle du moteur a demandé un état d'exemple écrit dans le stockage, comme le font les specs : depuis A14, l'exemple public n'a plus de panneau « Et si ». Les chiffres collent à 134 px, 118 + 16.

**Une course de numéros, évitée avant l'envoi.** Le brief est parti sous le numéro 07. `list_files` a montré, avant le plan d'envoi, un `design/DS-EXTENSION-BRIEF-07.md` déjà dans le projet : le moteur plus simple (B10), déposé le même jour par une autre session, dont la PR n'était pas mergée. Le brief de l'en-tête devient le 08, et B11 et D15 suivent les B10 et D14 de cette branche. Il signale le 07 et dit que les deux ne se recouvrent pas. Avant de numéroter un brief, il faut lire `design/` dans le projet, pas seulement dans le dépôt (`.design-sync/NOTES.md`, « Synced »).

**Le dépôt** : dix-sept fichiers écrits par `DesignSync` dans le projet `23b9671c-…`, aux mêmes chemins que dans le dépôt, sous un plan qui ne nommait qu'eux, sans suppression. Le bundle, la sentinelle et `_ds_sync.json` ne sont pas touchés. Vérifié :
- `get_project` avant l'envoi : un design system, modifiable ;
- `list_files` avant : rien sous un numéro 08 ; après : les dix-sept chemins y sont, et les briefs 04 à 07 comme les retours 04 à 06 n'ont pas bougé ;
- le brief relu côté projet par `get_file`, en entier : le même texte que dans le dépôt ;
- les fichiers envoyés sont ceux du commit (`git diff` vide sur `design/`).

**Consigné** : `CHANTIERS.md` (vue d'ensemble, B11, D15), `design/README.md`, `.design-sync/NOTES.md` (« Synced »). Il n'y a que de la doc et des images sous `design/`, donc `vercel-ignore.sh` ne déploie pas.

**Ce qui reste** : D15 (le lancer). Le retour va dans `design/ds-extension-08-return/`, une session le recopie dans le dépôt et ouvre son portage en A.

## B10 : le retour 07 de Claude Design recopié, C38 et C40 à C42 tranchées (2026-10-02)

**Ce qui est revenu** : Claude Design a répondu au brief 07 le jour même, sous `design/ds-extension-07-return/`, et rien d'autre n'a changé dans le projet (les seuls ajouts hors de ce dossier sont le brief 08 et ses captures, déposés par B11). Le retour tient en cinq mouvements :
- la page sait qu'on revient **avant son premier rendu** : un script en tête ne lit que l'existence de la clé du moteur, et la page courte se dessine par CSS. L'outil commence à 287 px au lieu de 1 267 ;
- **le tableau est la progression** : sous le verdict, une seule carte (`NextStep`) dit ce qui a changé et propose **une** action, choisie dans un ordre fixe ;
- **le réglage pose une question**, « Comment vends-tu ? », déjà répondue par défaut ;
- **un chiffre, une question** : les cases de la valeur sont la question, le piège est ouvert juste au-dessus, « Où le trouver » nomme les outils dans son résumé, repère et cible ne font plus qu'un objet ;
- **une liste par étape** à la place des onglets, les demandes en un écran, « Et si » par un seul levier, l'hybride un moteur à la fois sous le total.

Quatorze composants neufs, deux deltas (`Disclosure`, `BulletChart`), aucun changement du modèle de données. `INVENTORY.md` dit où va chaque ligne des 41 fiches du catalogue et chaque bloc d'aujourd'hui. Le rôle par défaut d'une demande, que le retour demandait de confirmer, existe déjà (`defaultRole`).

**Recopié au caractère près, une première.** Les retours 04 et 05 avaient perdu leurs espaces insécables en passant par un modèle (`COPIE.md` de chacun le dit). Les sous-agents lancés en arrière-plan n'avaient pas `DesignSync` (trois lots sur cinq n'ont rien copié), ceux du premier plan l'avaient. Après une première copie, **les 101 fichiers ont été réécrits par un script depuis les réponses brutes de `get_file`**, que les transcriptions de la session gardent en JSON. 95 étaient déjà identiques, 6 ne différaient que par des insécables, dont `const NNBSP` de `board/copy.js` : la typographie française de toute la copie. Après, les 101 sont identiques : 86 U+202F et 2 U+00A0 retrouvées. Un sous-agent a aussi vu l'outil Write transformer des échappements `—` du source en tirets réels ; le passage par script l'a rattrapé.

**CodeQL a rougi sur la PR** : quatre alertes dans le code recopié (deux hautes, deux moyennes). Elles sont corrigées sur place plutôt qu'écartées, comme les précédentes du dépôt, et `COPIE.md` en tient la liste. Le script d'avant le premier rendu échappe ce qui pourrait fermer un `<script>` en ligne, une règle que le portage gardera. La planche n'appelle un écran que si elle le connaît. Le générateur de `COPY.md` échappe les barres obliques inverses, et perd un remplacement qui ne faisait rien. `COPY.md` régénéré reste identique à l'octet ; 98 fichiers sur 101 restent identiques au retour.

**La planche rejouée** dans Chromium, servie en http avec les polices de `.design-sync/fonts/` : les 27 écrans, deux langues, 1 280, 390 et 320 px, soit 162 états, sans erreur de script ni défilement horizontal. À 320 px, elle s'ouvre sans `w=` : elle ne connaît que 390 et 1 280. `tsc` passe avec les `.d.ts` du retour, le lint ignore `design/`.

**Tranché par Antoine**, planche sous les yeux :
- **C40** : le pas à pas et le tableau fondus en un, **mais un écran « Cibles » gardé au début**, sautable, contre la reco ;
- **C41** : une liste par étape, la reco, qui renverse la décision du 2026-09-26 ;
- **C42** : tous les renommages, relus au bon à tirer ;
- **C38** : le portage d'abord, puis un seul bon à tirer, A18.d, qui absorbe A7.3.d et A14.d.

**Ouvert** : **A18**, le portage, en huit étapes (T0 à T7) puis A18.d. La clause rouge du verdict, qui peut nommer une autre étape que le diagnostic (trouvaille 9 du retour), est posée au bon à tirer.

**Consigné** : `design/ds-extension-07-return/COPIE.md`, `docs/decisions.md` (C38, C40 à C42), `CHANTIERS.md` (A18 ouvert, A7.3.d et A14.d absorbés, B10 clos, C sans question ouverte, D14 retiré, D2), `ENGINE.md`, `CLAUDE.md` (l'état), `design/README.md`, `.design-sync/NOTES.md`.

## A18 T0 : le socle du moteur simplifié, les jetons, deux deltas et la prochaine étape (2026-10-02, #283)

Première étape du portage du retour 07 (A18), drapeau fermé : rien ne change à l'écran, tout ce qui suit sert T1 à T5.

**Les jetons** : `src/styles/tokens/engine.css`, importé par `globals.css`, tels que le retour les donne, à un sélecteur près. Le bloc des couleurs est déclaré sur `:root, [data-world]` et non `[data-world=paper]` : la règle des mondes du dépôt (`token-sources.test.ts`, dont le balayage couvre maintenant `engine.css`) veut qu'un jeton bâti sur un jeton sémantique suive un monde qui le redéfinit. Le moteur ne sort jamais du papier, la valeur ne change donc pas. Non-vacuité : le sélecteur du retour remis fait tomber le test sur `--engine-advice-edge`. **Trente-cinq jetons ne sont lus par rien en T0**, et `dead-tokens.test.ts` refuse un jeton sans lecteur : ils attendent dans sa liste, chacun sous l'étape dont le composant le lit le premier (T1, T2, T4, T5, d'après le CSS du retour), et le test oblige chaque étape à les retirer en les lisant. `--engine-verdict` n'est lu par aucun composant du retour, seulement par la planche : c'est T2. Le plancher de 11 px (`type-scale.test.ts`) lit aussi `engine.css`.

**`BulletChart`** reçoit le delta : `value: null` (aucune barre), `target: null`, et `band`, la fourchette publiée en crochet **sous** la piste. Sa géométrie est pure (`bandGeometry`, `lib/viz/bullet.ts`) : bornée au domaine comme la barre et le trait, et **rien** quand la fourchette tombe entièrement hors du domaine, là où la planche l'aurait écrasée en un crochet sur le bord ; elle accepte un domaine descendant. Une valeur qui n'est pas un nombre ne dessine plus une barre de largeur nulle mais rien, ce qui revient au même à l'écran.

**`Disclosure`** reçoit `defaultOpen`, `open` avec `onOpenChange`, et `id`, toujours un `<details>` natif. Le balisage est épinglé sans DOM. **L'événement `toggle` n'est exercé en navigateur qu'en T1**, par son premier appelant (le piège qui ouvre « Ta définition et une note »).

**La prochaine étape** : `nextStepFor` (`_engine/next-step.ts`), les huit rangs de `NextStep.prompt.md`, le premier qui s'applique gagne, l'ordre du tunnel dans un rang. Elle part du plan de collecte, pour que la carte et les listes ne se contredisent jamais : un chiffre qu'aucun outil de l'équipe ne couvre y est « à demander » comme dans la liste. Les sept états de la planche sont épinglés avec le moteur qu'ils montrent (« Demander le CAC à la finance » au retour), ainsi que l'hybride (étape par étape, les deux moteurs ensemble, pas l'un puis l'autre) et les outils cochés. Non-vacuité : les rangs 4 et 5 inversés font tomber cinq tests, l'ordre du catalogue seul fait tomber les deux de l'hybride.

**Deux lectures du retour, faites ici et à confirmer au bon à tirer (A18.d)** :
- le prompt donne l'écran des demandes à « deux ou plus **à une première visite** » et ne dit rien d'un retour. Un retour avec deux demandes ou plus non envoyées reçoit le même écran : une demande par écran les étalerait sur plusieurs visites, ce que le rang 5 évite ;
- le prompt relance une demande « après sept jours », le moteur après **cinq** (`REMIND_AFTER_DAYS`, §6.13, la même durée que le rappel d'agenda). T2 gardera cinq et lira `isRequestStale`.

**Vérifié** : `tsc` et `eslint` propres, 2 977 tests unitaires, `next build` avec les variables de la CI, et les 315 specs e2e du moteur, des niveaux du jeu (le `BulletChart` du tableau de bord), de la composition du résultat (des `Disclosure`) et de l'accessibilité, toutes passées. Un premier passage de la CI a rougi sur le lint (`react/no-children-prop`, dans le test du `Disclosure` réécrit pour `tsc` après le passage d'`eslint`) : le lint se relance après toute retouche, même d'un test.

## A19 : l'en-tête compact, le retour 08 recopié et porté (2026-10-02, #284)

**Ce qui est revenu** : Claude Design a répondu au brief 08 le jour même, sous `design/ds-extension-08-return/` (28 fichiers, tout en source). Il suit trois de nos quatre penchants : toute fenêtre en paysage, déclenché par la position, un changement d'état et non un défilement asservi. La hauteur diffère : une ligne de 48 px, pas 56, sur un liseré de 6 px, soit 7,5 % d'un écran de portable au lieu de 16,4 %. Dans cette ligne, la marque, la course (l'étape où l'on est, remplie de la couleur de son espace) et les contrôles de la page, sur la couleur du bandeau réduite à un liseré. `MOTION.md` donne chaque valeur du mouvement, dans les deux sens. Recopié fichier par fichier par `DesignSync`, la planche rejouée par son propre `check.cjs` : 252 états, aucun problème (`COPIE.md`).

**Tranché par Antoine** sur les trois points que le retour laissait à confirmer :
- **C43** : les clics sur la course compacte se comptent à part, `space_band_compact`, dans les deux listes fermées (jeu et moteur), et `/admin/stats` les montre ;
- **C44** : le sélecteur de langue passe à 88 px partout, téléphone tenu droit compris (`Segmented` `sm` à 42 px de large) : ses cibles font enfin 44 × 44 ;
- la règle de `globals.css` qui coupe le `scroll-padding-top` quand le focus est dans l'en-tête est portée telle quelle : elle corrige un défaut d'aujourd'hui, où trois tabulations depuis 800 px ramenaient la page en haut.

**Le portage** :
- **la boîte de l'en-tête garde sa hauteur** (118, 93 ou 74 px) : seules des couches bougent, par transformation. Le verre devient une couche à part, réduite par `scaleY` depuis le haut ; la ligne monte ; le bandeau se replie sous le verre avec le liseré dont il pend. Rien ne bouge sous l'en-tête, et l'état ne peut pas se nourrir du défilement ;
- **le comportement** (`compact-header.ts`, navigateur seulement) pose `data-compact` dès que la page a défilé, regroupé par `requestAnimationFrame`. Il garde l'en-tête plein tant qu'un focus `:focus-visible` est dedans, et mesure la ligne, ses décalages et `--sticky-offset-compact` sur la vraie hauteur de la ligne (72, 68 ou 47 px dans le quiz). Le rapprochement à droite de ce qui reste se fait par `translateX`, au-dessus de la place de ce qui part. Les transitions ne s'allument qu'après deux images : une page rechargée à mi-hauteur s'ouvre compacte, sans mouvement. Son seul morceau client est `SiteHeaderCompactor`, un marqueur vide ; sans JavaScript, l'en-tête d'avant ;
- **tout le visuel est en CSS**, sous `(orientation: landscape)` : un téléphone tenu droit ne voit jamais d'en-tête compact, et la course compacte n'y est pas même dessinée (`display: none`, rien ne peut élargir la page) ;
- **la course** sort de `SpaceBand` en `SpaceRace`, que le bandeau rend et que l'en-tête reprend en variante compacte. Ses liens sont hors de l'ordre de tabulation, puisqu'une tabulation dans l'en-tête le rend plein, et une seule des deux courses est exposée à la fois (`visibility`). Le détail de ses clics est typé contre les deux listes fermées : une faute de frappe ne compile plus (constat F-1 du relecteur sécurité, vérifié en sabotant le détail) ;
- **ce qui colle sous l'en-tête le suit** : `--sticky-offset` prend la valeur mesurée en compact, et les chiffres « Et si » du moteur comme la colonne d'un niveau du jeu glissent avec `top` sur `--dur-state` ;
- sur l'accueil, les deux liens discrets portent la marque `data-header-compact="leave"` sur un `<span>` : posée sur le `Button`, la transition de l'en-tête aurait écrasé celle de son survol.

**Adapté aux gardes du dépôt**, sans rien changer au rendu :
- le retour écrivait `0s` pour les bascules franches (la visibilité, l'opacité du filet d'un en-tête sans bandeau). Le test de l'échelle de mouvement refuse toute durée littérale, `0s` compris, et exige que chaque `--dur-*` dépasse `--dur-fast`. D'où un jeton nommé pour ce qu'il est, `--flip: 0s`, dans `motion.css`, hors de l'échelle ;
- ses couches avaient des `z-index` chiffrés (0 à 3) : ils lisent maintenant `--z-raised` et `calc(var(--z-raised) + 1)`, comme le veut le test des couches ;
- son `tokens/header.css` avait onze jetons ; le test des jetons morts n'en garde que les quatre que le CSS lit par `var()`. Les autres mesures restent en commentaire ;
- les règles de conteneur du bandeau sont limitées à `.inner` : la ligne de l'en-tête devient un conteneur à son tour, et elles auraient touché la course compacte ;
- `SpaceRace` et `SiteHeaderCompactor` sont hors de l'inventaire de la design sync (`componentSrcMap` à `null`).

**Mesuré sur un build de production** (le jeu et le moteur ouverts), la hauteur peinte et `--sticky-offset` ensemble :
- en paysage compact, **54 px avec le bandeau et 50 sans**, et `--sticky-offset` égal, à 1 280 × 720, 1 440 × 900, 1 024 × 768, 844 × 390 et 568 × 320. Un téléphone en paysage passe de 30,3 % de l'écran à 13,8 % ;
- en portrait, à 390 × 844 et 320 × 568 : 114 et 70 px, `--sticky-offset` à 118 et 74, comme avant ;
- aucun défilement horizontal ; à 568 × 320, la pastille de la course ne garde que son numéro, comme le retour le prévoit sous 560 px ;
- la colonne d'un niveau du jeu colle à 140 px sous l'en-tête plein, à 76 sous l'en-tête compact.

Captures relues : l'accueil compact en français, le moteur compact avec ses chiffres, 844 × 390, le quiz à 568 × 320, le portrait, une page de glossaire sans bandeau.

**Une correction à ce que B11 annonçait** : le portage ne rend `--sticky-offset` juste que dans l'état compact, qu'il mesure. Dans l'état plein, le quiz garde 118 px pour un en-tête de 93, comme avant. Rien n'y colle, et les ancres et le focus s'y arrêtent 25 px trop bas sans rien masquer : c'est une ligne de la section E de `CHANTIERS.md`, pas un défaut de ce portage.

**Les specs** : `e2e/site-header-compact.spec.ts`, 22 specs :
- l'accueil se replie et se déplie dans les deux langues, et une page sans bandeau fait 50 px ;
- rien ne bouge sous l'en-tête à `scrollY = 1` ;
- une tabulation ouvre l'en-tête sans faire défiler la page, et rien de caché ne prend le focus ;
- les cibles du sélecteur font 44 × 44, et la colonne du jeu suit ;
- le clic sur la course compacte est compté `space_band_compact` ;
- axe sur l'en-tête compact de quatre pages ;
- le mouvement réduit, sans JavaScript, le portrait, et 844 × 390.

**Non-vacuité** : sans `SiteHeaderCompactor`, 15 rougissent ; les 7 qui restent vertes sont celles qui gardent l'en-tête d'avant. Trois specs existantes suivent la nouvelle forme :
- `site-header.spec.ts` lit le flou sur la couche du verre ;
- `home-strip-doors.spec.ts` remonte en haut de page avant de cliquer la pastille du bandeau : le clic sur la carte avait fait défiler la page, et le bandeau était replié ;
- `landing-mobile.spec.ts` lit le `display: none` sur l'élément qui porte le lien, désormais le `<span>`.

**Relu par les deux sous-agents** : rien à corriger côté copie (aucune chaîne neuve pour un visiteur ; seul un libellé de `/admin/stats` est aligné entre le jeu et le moteur). Côté sécurité, rien de bloquant : l'île client ne prend aucune prop, et le script ne lit que de la géométrie et n'écrit que des attributs fixes. Le seul constat, F-1, est corrigé.

**Vérifié** :
- `vitest`, 2 977 tests après la fusion de `main` (A18 T0 en apporte 33) ;
- `tsc` et `eslint` propres ;
- Playwright complet sur un build comme la CI (le jeu ouvert, le moteur fermé), avec l'émulateur et `CI=1`, avant la fusion d'A18 T0 : 904 specs, 898 passées, 6 ignorées par construction. A18 T0 n'ajoute aucune spec, et la CI rejoue la suite sur la tête fusionnée.

**Consigné** :
- `CHANTIERS.md` : A19 clos, B11 clos, B12 ouvert, C43 et C44, D15 retiré, une ligne en E ;
- `docs/decisions.md`, `design/README.md`, `.design-sync/NOTES.md` ;
- `design/ds-extension-08-return/COPIE.md`, `CLAUDE.md` (les chiffres de référence).

## D10 : l'indexation française demandée (2026-10-02)

Antoine a demandé l'indexation des sept pages françaises que la session lui avait listées : les deux pages « porte ouverte » et les cinq « AARRR vs X ». `/fr` était déjà sur Google. Le rappel de la session avait vérifié avant que les huit adresses répondaient en 200. Il reste dans D10 les huit adresses des quatre termes de la vente assistée ajoutés par A7.3.e (`win-rate`, `sales-cycle`, `acv`, `lead-to-opportunity`, en anglais puis en français), vérifiées en 200 et présentes dans le sitemap le 2026-10-02. Les annuaires peuvent repartir depuis A7.12.a.

## A19.1 : le `--sticky-offset` plein, mesuré lui aussi (2026-10-02, #287)

**La question** (Antoine, après A19) : « tu as quelque chose à corriger vis-à-vis de ça ? », à propos du quiz, où les ancres et le focus s'arrêtaient « 25 px trop bas ».

**Mesuré sur le build de production de `main`** (le jeu ouvert), en haut de page, la hauteur de l'en-tête contre `--sticky-offset` :

| Fenêtre | Bandeau | Quiz | Sans bandeau |
|---|---|---|---|
| 1 280 × 720, 1 024 × 768, 768 × 1 024 | 118 pour 118 | 93 pour 118 (+25) | 74 pour 74 |
| 390 × 844 | 114 pour 118 (+4) | 88 pour 118 (+30) | 70 pour 74 (+4) |
| 320 × 568 | 114 pour 118 (+4) | 106 pour 118 (+12) | 70 pour 74 (+4) |

**Deux choses écrites étaient fausses** :
- l'entrée B11 donnait au quiz « 106 px sur téléphone » : ce n'est vrai qu'à 320 px ; à 390, il fait 88 px ;
- A19 parlait de 25 px, dans le quiz seulement. C'est 25 px au bureau, 30 et 12 sur téléphone, et **4 px sur chaque page d'un téléphone tenu droit**, que personne n'avait relevés.

L'offset n'était jamais sous la hauteur de l'en-tête : rien n'était masqué, les ancres et le focus s'arrêtaient seulement plus bas que prévu.

**Le correctif** : `compact-header.ts` mesurait déjà l'en-tête pour l'état compact. Il pose aussi `--sticky-offset-full`, la hauteur de la boîte, filet compris, arrondie au pixel supérieur. Elle ne change pas avec l'état, seulement avec la largeur, et le `ResizeObserver` existant la suit. `globals.css` la lit à la place de 118 et 74, qui restent le repli tant que le script n'a pas tourné et sans JavaScript.

**Les specs** :
- `site-header.spec.ts` : l'offset égale la hauteur de l'en-tête, au pixel près, sur l'accueil, un résultat, le quiz et une page de glossaire, à 1 280, 390 et 320 px. Ces specs remplacent les deux qui ne demandaient que « au moins ». Sans JavaScript, trois specs vérifient que le repli couvre toujours l'en-tête, aux trois largeurs ;
- `site-header-compact.spec.ts`, le portrait : la spec lisait l'offset juste après le chargement, donc le repli. Elle attend maintenant la mesure, et compare à la boîte de l'en-tête : son aide `painted` s'arrête au liseré et laisse de côté le filet de 2 px d'un en-tête sans bandeau.

**Non-vacuité** : sans la ligne qui pose `--sticky-offset-full`, 7 specs rougissent (les trois d'égalité et les quatre du portrait) ; les trois sans JavaScript restent vertes, comme elles le doivent.

**Ce qui ne bouge pas** : au bureau, hors du quiz, les valeurs sont celles d'avant (118, 74), donc la colonne d'un niveau du jeu et les chiffres « Et si » du moteur collent au même endroit.

**Vérifié** :
- `vitest`, 2 977 tests ;
- `tsc` et `eslint` propres ;
- Playwright complet sur un build comme la CI, `CI=1` : 908 specs, 860 passées et 48 ignorées sans l'émulateur. Les 42 specs des vrais résultats, rejouées avec l'émulateur, passent : 902 passées, 6 ignorées par construction.

**Consigné** : `CHANTIERS.md` (B11 corrigé, A19.1, la ligne de veille du quiz retirée de la section E), `CLAUDE.md` (les chiffres de référence).

## A18 T1 : l'écran d'un chiffre, une question et son savoir à côté (2026-10-02, #285)

Deuxième étape du portage du retour 07, drapeau fermé. L'écran d'un chiffre, au tableau comme dans le pas à pas, suit maintenant l'ordre du `NumberSheet` : ce que le chiffre est et sa formule sur une ligne, le Tour en une ligne, **le piège ouvert avant la valeur**, « Où le trouver » replié avec les outils dans son résumé, **les cases d'abord**, « Comment il se situe » (repère, cible, verdict en un objet), puis « Ta définition et une note » repliées.

**Les cinq composants** sont dans `src/components/engine/` : `NumberSheet`, `AnswerSwitch`, `TrapNote`, `WhereToFind`, `HowItCompares`, avec leurs tests de balisage. Les jetons qu'ils lisent quittent la liste d'attente de `dead-tokens.test.ts`. `ComparisonStrip` part avec les classes de `Sheet.module.css` que plus rien ne lisait. Les écritures n'ont pas bougé (`sheet-draft.ts`), sauf sur un point : **une sauvegarde sans autre réponse choisie lit les cases**, et nomme les cases vides plutôt qu'une réponse à cocher. « Je l'ai » n'existe plus comme choix, taper dans une case l'est.

**Trois écarts au retour, voulus** :
- **pas de `<form>`** : le `NumberSheet` du retour en est un, et la règle du dépôt l'interdit (A15.20) : avant l'hydratation, son envoi mettrait ce qui est tapé dans l'adresse. Entrée dans une case appelle `onSubmit`, comme avant ;
- **« Pas de réponse sous la main ? »** au-dessus des trois réponses qui ne sont pas des chiffres (l'événement d'activation, la cause de churn, le mécanisme), sans estimation : « Pas de chiffre » y aurait refait l'erreur que relevait Antoine le 2026-09-26. `statusQuestionOf` reste l'unique endroit qui choisit, et les deux anciennes questions sortent de la copie ;
- **le verdict reprend `positionLabel`**, pas « Sous la cible / À la cible ou au-dessus » du retour : pour la résiliation, être derrière sa cible, c'est être **au-dessus**, et le tableau le disait déjà ainsi. Le tag n'existe que contre une cible d'équipe (C1) ; « peut-être sous » se dit en toutes lettres, sans tag.

**« Écrire ta définition »** est sur cinq pièges, pas les trois du retour : sa règle (« quand le piège dit d'écrire quelque chose ») couvre aussi les deux CAC (« décale la dépense et écris-le »). La liste, `TRAPS_ASKING_DEFINITION`, est tenue contre le texte du catalogue dans les deux langues par un test. Non-vacuité : `act.rate` retiré de la liste fait tomber le premier.

**Ce qui a bougé de place** : la phrase de la cohorte est l'indice du dénominateur, la phrase du nombre partagé une ligne pleine sous la rangée (aucun chiffre ne partage ses deux comptes), la source n'apparaît qu'une fois une valeur tapée, la cible se saisit aussi dans le pas à pas (C40 : sur l'écran de son chiffre). Le pas à pas passe sa position, son titre et ses boutons au `NumberSheet`, qui porte la carte ; au tableau, la feuille s'ouvre sans titre ni carte sous sa ligne, jusqu'à T2.

**Copie neuve**, « à relire » : le piège, les trois autres réponses, « Comment il se situe » et sa légende, le graphique en mots, la définition et la note. Les clés mortes sortent (`haveIt`, `target`, `targetHint`, `declaredAtTour`, `hybridTrapTitle`, `statusQuestion`, `statusQuestionAnswer`).

**Les specs** du moteur suivent : plus de « Je l'ai » à cocher, les trois réponses sont des boutons, `openWords` déplie la définition et la note avant d'y taper, le test « une réponse n'est pas un chiffre » lit la nouvelle légende, celui de la résiliation lit le verdict.

**Relevé en route** : le relecteur de copie a vu que « ← J'ai le chiffre, finalement » restait au-dessus de l'événement d'activation, que la légende avait épargné : « ← J'ai la réponse, finalement » y est. La réponse du Tour est entre guillemets, comme l'ancienne ligne. Et la première passe e2e a trouvé « Reprendre la marge globale » rangé dans les cases : une marge déjà « introuvable » (l'exemple hybride) s'ouvrait sur l'éditeur, sans lui. Il est offert au-dessus des réponses, quelle que soit celle affichée (C25 Q4). Deux specs lisaient la source avant toute valeur : elle n'apparaît qu'une fois un compte tapé, elles en tapent un d'abord.

**Vérifié** : `tsc` et `eslint` propres, les tests unitaires, `next build` avec les variables de la CI, les 285 specs du moteur, des cibles et de l'accessibilité (onze échecs à la première passe, tous dans les specs qui visaient l'ancien écran, puis les cinq fichiers repassés : 84 sur 84), et des captures de l'écran en français et en anglais, à 1 280 et 390 px, dans le pas à pas et au tableau, sans défilement horizontal. Le `toggle` du `Disclosure` livré en T0 est exercé en vrai : « Écrire ta définition » déplie la note et y met le focus, vérifié par Playwright.

## D10 : Uneed soumis, Smol Launch écarté (2026-10-02)

**Uneed** : soumis par Antoine le 2026-10-02 dans la file gratuite, avec le lien `directory_uneed` en campagne `relaunch_tour`, le compte créé avec `contact@` et la fiche sous « Tour de Growth ». La session lui avait transmis le logo et les trois captures refaites par A7.12.a (accueil, résultat, sélecteur de ton). Uneed a fixé le lancement au **21 février 2027**, ce que la section E de `CHANTIERS.md` note. Relevé sur leur page de tarifs le même jour : la fiche doit atteindre 10 votes pour rester publiée, et 20 pour le lien en dofollow. On n'en demande jamais (`GROWTH-PLAN.md`).

**Smol Launch**, le premier de l'ordre de `GROWTH-PLAN.md` 1.6, était noté « annoncé gratuit et dofollow » dans le kit depuis le 2026-09-13. Revérifié le 2026-10-02 : le gratuit exige d'afficher leur badge sur notre site, et le dofollow est réservé aux formules payantes (19 $ et plus). Écarté pour l'instant, comme Fazier : un badge tiers sur le site serait du code et une décision. Leur soumission « par un agent » passe par un serveur MCP. Elle n'a pas été utilisée, puisque brancher un connecteur se décide à part (`PLUGINS.md`).

**SaaSHub, le même soir** : soumis par Antoine, avec le lien `directory_saashub` en campagne `relaunch_tour` et l'offre payante refusée. La page bloque les robots (défi Cloudflare), et AlternativeTo aussi : la session n'a rien pu en vérifier, Antoine l'a vue seul. **MicroLaunch et StartupBase** ne se connectent que par Google ou X (StartupBase : Google, LinkedIn ou X, vérifié par la session ; MicroLaunch : constaté par Antoine). Ils sont mis de côté, parce que **le compte X de la marque n'existe pas** : la ligne du 2026-09-14 de `GROWTH-PLAN.md` §7 le disait créé, et la correction y est datée. Le créer reste un geste d'Antoine, sans date (0.6). BetaList accepte aussi un lien magique par e-mail.

## B9 et B12 : la re-synchro d'A16 et d'A19 (2026-10-02, #289)

**Ce qu'elle emporte**, en une seule synchro vers le projet Claude Design, faite sur `main` à `44f2a2a` :
- B9, la feuille de scores : `StageScore` et `StageScores` (nouveaux), `PillarChip` sorti du projet, `StampedPillar` et `DefinitionTrigger` redessinés, les rangs rouges de C34 ;
- B12, l'en-tête compact : `SiteHeader`, `SpaceBand` (la course sortie en `SpaceRace`, hors inventaire comme `SiteHeaderCompactor`), `Segmented` à 42 px de large (C44), `tokens/header.css` ;
- `Disclosure`, qui a gagné `defaultOpen` et une forme contrôlée avec A18 T0.

**Le résultat** : 91 composants, 308 cellules, toutes notées bonnes. Le pilote a classé 5 composants comme changés, 2 comme nouveaux et 1 comme retiré ; la vérification de 18 autres, dont le code a changé sans leur aperçu, les a trouvés conformes. 14 composants envoyés, 77 reportés, 466 fichiers. `report_validate` : 91, 0 mauvais, 0 maigre, 0 identique ; l'index relu identique (91 cartes) ; ancre `59b524b3669b`.

**Cinq aperçus corrigés**, chacun une carte qui s'affichait bien et disait faux :
- la feuille en roast de `StageScores` et la carte de `StampedPillar` dessinaient les voisins du tampon sans leur « ? », que `ResultView` leur donne ;
- `Disclosure` passait l'attribut natif `open`, devenu la prop contrôlée avec A18 T0 : `defaultOpen` à la place ;
- `SiteHeader` disait le filet toujours tracé (il n'apparaît qu'au défilement depuis A19) et ne disait rien de l'état compact. Une carte immobile ne peut pas le montrer : sa documentation le décrit ;
- `Segmented` ne disait pas les 42 px de C44.

**`design/` dans le projet** : décision d'Antoine, les briefs 04, 05, 06 et 08 et leurs retours en sont retirés, puisqu'ils sont portés. 171 fichiers, listés depuis le projet et non depuis le dépôt : les retours n'y sont pas fichier pour fichier les copies d'ici. Seuls le brief 07 et son retour restent, A18 étant en cours. Tout ce qui est retiré est dans ce dépôt.

**Ce que la synchro a trouvé après coup** : A18 T1 (#285) est arrivé sur `main` pendant qu'elle tournait. Il ajoute cinq composants sous `src/components/engine/` qui ne sont pas dans `componentSrcMap` (la prochaine construction du paquet échouera sur `check-inventory`, et c'est voulu), et retire de la copie que trois aperçus citent encore (`Choices`, `NumberField`, `FieldRow`). A18 n'est pas fini : c'est **B13**, la re-synchro à la fin de son portage, ouverte dans `CHANTIERS.md`.

**Le volet Design System** reste sur sa copie du 2026-09-11 (B8) : l'agent de Claude Design, lui, lit les fichiers à jour.

**Consigné** : `.design-sync/NOTES.md` (« Synced », « Found in the 2026-10-02 re-sync », la méthode de vérification des types, un risque de plus), `CHANTIERS.md` (B9 et B12 clos, B13 ouvert), `CLAUDE.md`.

## A18 T2.a : la barre du moteur et la prochaine étape, une seule action (2026-10-02, #290)

Troisième étape du portage du retour 07, drapeau fermé. **T2 est coupé en trois PR** : T2.a (la tête du tableau, celle-ci), T2.b (`EngineProgress` et `NumberList` à la place des onglets), T2.c (`LeverCard`). Les onglets touchent plus de la moitié des specs du moteur : les changer dans la même PR que la tête aurait mêlé deux réécritures de specs.

**La tête du tableau** est maintenant : la barre (`EngineBar`), le verdict, la couverture (jusqu'à T2.b), puis la prochaine étape (`NextStep`). Cinq choses en sont sorties : le sélecteur de moteur, l'eyebrow, le sélecteur de mois et son bandeau, le bandeau de reprise, le bandeau de sauvegarde, la ligne « impossible d'enregistrer », et la rangée d'actions du bas.

- **La barre** dit ce qui est à l'écran (« Moteur sans nom · libre-service · août 2026 », « · lecture seule » sur un mois passé), porte l'étiquette pointillée « Jamais sauvegardé » tant qu'une sauvegarde est due, les Réglages, et le menu « Moteur, mois et fichier » : le sélecteur de moteurs, « Renommer » (les Réglages, le focus sur le nom de l'entreprise), le mois affiché et le rappel, puis Sauvegarder, Importer, Saisie en tableau, Supprimer ce moteur et Tout effacer, la phrase de Safari en dernier. La cohorte quitte la ligne : elle est dite là où elle sert, au dénominateur (T1).
- **La prochaine étape** est une carte, une seule action principale, choisie par `nextStepFor` (T0) : la sauvegarde en fichier si l'appareil a refusé d'écrire (annoncée, `role="alert"`), le retour au mois courant, le mois suivant, le chiffre de cinq minutes, la demande, le chiffre d'une heure, les slides. Dessous, ce qui attend : une ligne par rôle à relancer (« Demandé à Data il y a 7 jours : coefficient viral (K), pas encore de réponse. », avec « Relancer »), la sauvegarde due, le plafond de mois. L'en-tête dit « Dernière visite · il y a 3 jours » au retour, « Où tu en es » sinon.
- **Les slides** sont l'action principale quand plus rien n'est à taper ; sinon, un lien discret en bas du tableau, « Préparer tes slides avec ce que tu as → ».
- **Le verdict** passe à `--engine-verdict` (40 px, 25 px sous 760) : il était à la taille du héros de la page d'accueil.

**Quatre choix de portage, à relire avec A18.d** :
- **« Reprendre le pas à pas »** reste, dans « Ce moteur » : le retour le retire, mais le pas à pas n'est fondu dans le tableau qu'en T3. Il part avec lui ;
- **« Supprimer ce moteur » et « Tout effacer »** restent tous deux dans « Fichier » ; le retour n'a qu'« Effacer ce moteur ». Fondre les deux retirerait l'effacement de tout l'appareil en un geste : c'est une décision, pas un portage ;
- **« Comparer deux mois »** n'est pas dans le menu : le retour le donne pour « la vue d'aujourd'hui, inchangée », et le tableau n'en a pas (la comparaison est une slide, A14) ;
- **les renommages du retour attendent T6** (C42) : la barre et la carte reprennent les libellés existants (« Sauvegarder (.json) », « Tout effacer », « Saisie en tableau », « Réglages »). Seules les phrases neuves sont neuves.

**« Copier tes {n} demandes »** ouvre et met le focus sur « À aller chercher », en attendant `AskList` (T3). **« Demander à {rôle} : {chiffre} »** ouvre l'écran du chiffre avec « Je le demande » déjà choisi (un brouillon posé dans `sheet-drafts.ts`, qui ne s'écrit nulle part). **« Saisie en tableau »** ouvre le tableau, resté à sa place en bas du tableau de bord, et y met le focus : le `Disclosure` contrôlé de T0 sert pour la première fois.

**Code** : `EngineBar` et `NextStep` dans `src/components/engine/`, avec leurs tests de balisage ; leur câblage dans `_engine/BoardHead.tsx` (`BoardBar`, `BoardNextStep`, `boardNextStep`), qui reprend `needsBackup` et le type `SeriesControls`. `nextSelfNumber` sort de `nextStepFor` pour « Taper d'abord le chiffre suivant » et « Continuer {mois} », testé. `MonthBar`, `ResumeBand` et `BackupBar` partent, avec leur CSS ; les clés qu'ils étaient seuls à lire aussi (`resume.*`, `series.start`, `series.backTo`, `engines.current`, `board.eyebrow`, `board.eyebrowNoCohort`, `workbench.lastVisit*`). Quatre jetons quittent la liste d'attente (`--engine-pending-edge`, `--engine-accent`, `--engine-verdict`, `--engine-verdict-mobile`).

**Relevé en route** : la première coupe de la copie a cherché le commentaire de `board.eyebrow` par son texte, qui ouvre aussi celui du fil d'Ariane plus haut, et a emporté 240 lignes. Le diff l'a montré avant tout test : fichier restauré, coupe refaite bornée au groupe. Et dans la carte, « Relancer » montait au-dessus de sa ligne : la confirmation de `RequestCopy`, vide mais gardée pour être annoncée, prenait une ligne sous le bouton. Elle se met à côté (`inline`).

**La relecture de copie** (le relecteur, sur la PR ouverte) a trouvé de quoi changer, appliqué :
- le nom d'un chiffre passait en sujet de phrase (« Opportunités recommandées vient de quelqu'un d'autre ») : il est une étiquette après les deux-points, comme la règle du fichier le veut ;
- « Demander à Produit » : le rôle est une étiquette sans article, d'où « à l'équipe {rôle} ». **Le même défaut est déjà dans `reminders.requestTitle` et `requestDescription`** (« Relancer {rôle} ») : laissé pour A18.d ;
- « Copier tes 3 demandes » comptait des chiffres, pas des demandes (une par rôle) : « Demande tes {n} chiffres », et « {n} chiffres demandés » au rang 7 ;
- « remplis le reste en attendant » quand plus rien n'est à faire seul : deux variantes qui s'arrêtent à « envoie la demande maintenant » ;
- les boutons fléchés passent à l'impératif avec « ton », la règle de l'en-tête du fichier (« Passe au chiffre suivant », « Reviens à », « Démarre », « Sauvegarde ton moteur ») ; l'infinitif venait du retour ;
- la phrase de Safari dit la règle entière (« sept jours d'utilisation sans passage ici »), comme celle du menu ; « il y a {n} jours » prend son espace insécable ; « read-only » comme ailleurs.

**Reste pour A18.d** : « Moteur, mois et fichier » annonce un mois que le menu n'a pas quand le moteur n'a qu'un mois et que le suivant est à démarrer (le groupe est vide, donc absent).

**Vérifié** : `tsc` et `eslint` propres ; 3 008 tests unitaires ; `next build` avec les variables de la CI ; les 284 specs (et les 77 que touche la relecture, rejouées après elle) du moteur, des cibles et de l'accessibilité (une ignorée par construction) ; les specs du bandeau, du kit et des aperçus de partage, avec `GAME_ENABLED=true` aussi côté serveur (sans lui, les pages du jeu manquent et trois specs tombent, ce qui n'est pas ce changement) ; des captures en français et en anglais, à 1 280 et 390 px : le retour, le menu ouvert, le mois à démarrer, un mois passé, sans défilement horizontal.

## A18 T2.b : « Tes chiffres », une liste à la place des onglets, et l'écran d'un chiffre (2026-10-02)

Quatrième étape du portage du retour 07, drapeau fermé, et la décision C41 d'Antoine : **les cinq onglets d'étape du 2026-09-26 sont remplacés par une liste**. Toutes les étapes sont visibles, chaque chiffre est une ligne (nom, valeur ou statut), et une ligne ouvre l'écran du chiffre, au lieu de déplier sa fiche sur place (1 667 px pour un chiffre, sur un téléphone).

- **« Tes chiffres »** (`NumberList`) : l'en-tête dit d'abord ce qui reste (`EngineProgress` : « 6 à faire », « Plus qu'un », « Plus rien à faire »), puis les comptes (« 11 trouvés · 2 estimés · 1 demandé · 3 introuvables », les zéros omis), puis une marque par chiffre et leur légende.
- **Chaque étape** dit ses marques et « 2 sur 3 trouvés ». Celle que nomme une cible d'équipe (C1) porte « Freine ici » et le filet rouge du diagnostic ; aucune autre n'a de rouge.
- **Une ligne** : un chiffre trouvé montre sa valeur, sans étiquette. Les autres portent une étiquette : neutre pour l'estimé et l'introuvable, pointillée pour le demandé et l'à-faire. Une note dessous dit pourquoi un chiffre est introuvable, et de combien il a bougé depuis le mois d'avant.
- **Un mois clos** : ses lignes se lisent et ne s'ouvrent pas.
- **Dans l'hybride** : la liste est celle du moteur affiché. La liaison est dans un groupe fermé à la fin de la liste de l'assisté.
- **L'écran d'un chiffre** (`NumberScreen`) est la fiche de T1, en carte, avec sa place (« Activation · 2 sur 3 ») et ce qui reste à droite. « ← Tes chiffres » ramène à la ligne et lui rend le focus. « Chiffre suivant » de la carte, « Renseigner » de « À aller chercher » et la demande ouvrent ce même écran.
- **La couverture en pastilles** quitte la tête du tableau à un moteur : la liste la dit. L'hybride garde la sienne dans ses colonnes jusqu'à T5.

**Ce qui part, et pourquoi c'est voulu** :
- **`hidden="until-found"`** : les fiches repliées étaient dans la page pour Ctrl+F (A4). Elles ne sont plus dans la page, donc ne se trouvent plus par la recherche du navigateur ; chaque nom de chiffre, lui, est dans la liste ;
- **les positions** en tête de panneau (« Taux d'activation · sous ta cible ») : l'écran de chaque chiffre le dit dans « Comment il se situe », et l'étape nommée le dit par son filet ;
- **le clavier des onglets** (flèches, Origine, Fin) : la liste est une suite de boutons, que la tabulation parcourt.

**Les goldens tiennent** : `golden-v1` et `golden-v2` figeaient la sortie des onglets. Une projection (`asTabs`, `golden-projection.ts`) reconstruit l'ancienne forme depuis la liste, et les deux passent sans toucher aux fichiers : la liste dit exactement ce que disaient les onglets.

**Code** :
- `EngineProgress` et `NumberList` dans `src/components/engine/`, avec leurs tests de balisage ;
- `_engine/number-list.ts`, le modèle pur, prend la place de `stage-tabs.ts`, et ses tests ceux des onglets ;
- `_engine/BoardNumbers.tsx` et `_engine/NumberScreen.tsx` sont neufs, et l'îlot gagne un écran `number` ;
- `StageTabs.tsx` part, avec ses règles CSS et les clés `board.stagesLabel`, `tabFound` et `tabNamed`. « Freine ici » passe dans le groupe `list`, avec la copie neuve « à relire » ;
- neuf jetons quittent la liste d'attente.

Deux tests de gouvernance suivent, chacun avec sa raison écrite :
- `breakpoints` : la requête de conteneur du tableau est lue par les colonnes de l'hybride, plus par les onglets ;
- `hard-shadows` : le seuil de non-vacuité passe de 60 à 50, car les ombres des onglets sont parties.

**Les specs** : `engine-board-tabs.spec.ts` devient `engine-numbers.spec.ts`, qui dit maintenant :
- toutes les étapes sont à l'écran, une seule freine, et ce qui reste est dit ;
- une ligne ouvre son écran, et le retour rend le focus à la ligne ;
- « Renseigner » et « Chiffre suivant » ouvrent l'écran d'un chiffre ;
- les lignes font 48 px à 390 px, sans défilement horizontal.

Trois aides dans `engine-helpers.ts` :
- `openNumber` ouvre un chiffre depuis la liste, en ouvrant au besoin le groupe fermé ;
- `backToBoard` revient au tableau ;
- `expectFound` lit les comptes de la liste.

`openEngineMenu` revient d'abord au tableau. Trois specs de `platform-native` partent ou changent : la recherche dans les fiches repliées et les flèches de la bande d'onglets partent ; « garder ce qui est tapé » se rejoue sur l'écran d'un chiffre.

**Relevé en route** :
- La première passe e2e a eu 31 échecs, tous dans des specs qui enregistraient sur l'écran d'un chiffre puis cherchaient le tableau. Elles reviennent d'abord à la liste.
- Un vrai défaut aussi : le retour ne rendait pas le focus à la ligne, faute d'`id` sur le bouton. C'est réparé, et la spec le tient.

**Pas fait ici** : le groupe « Calculés à partir des tiens » du retour. Les chiffres calculés ne sont pas sur le tableau aujourd'hui (seulement dans les slides), donc ce serait un ajout, pas un portage.

**Vérifié** :
- `tsc` et `eslint` propres ; 3 014 tests unitaires ; `next build` avec les variables de la CI ;
- les 295 specs du moteur, des cibles, de l'accessibilité et de la plateforme passent (une ignorée par construction), avec `GAME_ENABLED=true` côté serveur ;
- des captures de la liste et de l'écran d'un chiffre, en français et en anglais, à 1 280 et 390 px, sans défilement horizontal.
