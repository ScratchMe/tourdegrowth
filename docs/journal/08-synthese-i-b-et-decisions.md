# Journal de Tour de Growth — 8. La synthèse I + B et la séance des décisions

*Volume archivé : les entrées du 2026-09-28 au 2026-09-29. On y trouve la synthèse I + B et ses cinq PR, le cookie de langue, la liste de travail rangée par agent, les lots A1 à A6, D1, la séance des vingt-deux décisions.*

*Le texte est celui du journal, déplacé tel quel le 2026-10-01 : rien n'y a été réécrit. Un « plus haut » ou un « voir l'entrée du… » peut donc désigner une entrée d'un autre volume. Le volume courant et la table des volumes sont dans [`JOURNAL.md`](../../JOURNAL.md), et `grep -rn "<motif>" JOURNAL.md docs/journal/` cherche partout.*

---

## La synthèse I + B (2026-09-28)

**La décision d'Antoine** : I pour la base, avec quatre signes de B, pour « une belle identité avec des points qui restent en tête sans avoir à tout refondre ». Ces signes sont le bandeau des étapes 1 · 2 · 3, le moteur en outremer (plutôt que le millimétré de I), la borne kilométrique et le profil d'étape.

**Ce qui a été maquetté** (`design/alternatives-2026-09/`, ids `ib` et `ib-ink`) :
- Le bandeau d'étape est accroché sous l'en-tête collant et remplace les dossards de I. Il est rouge pour le Tour, outremer pour le moteur, ocre pour le jeu.
- La borne porte le score.
- Le profil d'étape vient du calcul : la hauteur d'un col vaut les points manquants sur 20, et le col qui freine est marqué « HC ».
- Le hub du jeu montre cinq cols sous la légende « cinq cols, cinq entreprises ».
- L'image de partage porte la borne et le profil.

`ib-ink` est la même maquette avec le bandeau du Tour à l'encre. Les deux ont été captées sur les sept écrans, aux deux largeurs. L'audit des captures ne trouve aucun texte sous AA en 1280 px et aucun défilement horizontal.

**Deux questions ouvertes pour Antoine** :
1. Le bandeau du Tour, rouge ou encre ? La recommandation est l'encre, parce que le rouge de I a trois sens et seulement trois : action, diagnostic, conseil.
2. Le mot « étape », qui sert deux fois. Le bandeau dit « Étape 1/3 » au-dessus de « Étape 1 sur 5 — Acquisition » et d'« Une étape te freine ».

**Piège** : le serveur local des captures meurt quand la session redémarre, et le sous-agent qui capte n'a pas le droit de le relancer. Il faut donc vérifier `curl localhost:3300/fr` avant de relancer une capture.

**Coût d'une vraie mise en œuvre**, d'après la fiche `notes/ib.md` : deux à trois sessions. Il faut des jetons d'espace, deux composants neufs (`StageBand`, `StageProfile`, ce dernier en SVG pur et testable), la borne en CSS seul et le gabarit Satori. La garde de payload devra compter les cinq scores que le profil expose (convention 11).

**Tranché par Antoine le même jour** : le bandeau du Tour est à l'encre, et le rouge ne reste que sur le pictogramme. Le bandeau dit « 1/3 · Plaine », sans le mot « étape », qui reste réservé aux cinq étapes AARRR. Même règle sur l'image de partage.

**Et tant que le moteur et le jeu sont fermés** (Antoine, même jour) : le bandeau montre la course entière. Les espaces fermés sont grisés, marqués « bientôt » et sans lien. Ils deviennent des liens quand le build les voit ouverts.

## Kit I + B, 1/3 : jetons, en-tête collant, bandeau d'espace (2026-09-29)

**Ce qui est livré** :
- **Le bandeau d'espace** (`brand/SpaceBand`). Il est accroché sous l'en-tête de chaque page qui appartient à un espace : le Tour (accueil, quiz, résultat, Deep dive), le moteur, le jeu (hub et niveau). Les pages de lecture (glossaire, comparaisons, À propos) n'en ont pas.
- **Ses trois couleurs**, dans `tokens/spaces.css` : encre pour le Tour (le rouge ne reste que sur son pictogramme), outremer pour le moteur, ocre pour le jeu.
- **« 1/3 · Plaine »**, jamais « étape ».
- **La course complète à droite.** Un espace ouvert au build est un lien. Un espace fermé est grisé, en pointillé et marqué « bientôt », sans lien. Dans le quiz et le Deep dive, rien n'est un lien : pas de sortie au milieu d'un tunnel, la règle du pied de page.
- **Le drapeau du moteur** est inliné au build pour le code client (`TDG_ENGINE_OPEN_AT_BUILD`), comme celui du jeu. `next-config.test.ts` le tient à la règle d'`access.ts`.
- **Un seul en-tête** (`brand/SiteHeader`) pour les cinq qui recopiaient la même règle : accueil, pages de contenu, résultat, quiz, Deep dive. Il est collant, en verre dépoli, et porte le bandeau.
  - `--sticky-offset` (globals.css) donne sa hauteur mesurée (118 px avec bandeau, 74 px sans). Ancres et focus s'arrêtent sous l'en-tête (`scroll-padding-top`, WCAG 2.4.11).
  - La colonne du jeu et les chiffres « Et si », qui collaient déjà, collent maintenant sous lui.
- **La base de I** :
  - rayons 999 / 12 / 14 / 18 (étaient 4 / 6 / 8 / 10), ombres 6 / 4 / 3 (étaient 7 / 5 / 4) ;
  - titre de l'accueil fluide jusqu'à 80 px, 50 px sur téléphone, par ses propres jetons (`--display-landing`) ;
  - question du quiz en 700 34 px ; réponses en cartes avec une marque radio ;
  - bouton principal posé sur son ombre dure, bord encre ;
  - dossard « № 15 questions » plein ;
  - grain du papier.
- **Le titre héros des autres pages ne bouge pas** (62 / 40 px). Un premier essai l'avait passé à 80 / 50 px pour tout le monde, alors que I ne grandissait que celui de l'accueil. `open-door.spec.ts` l'a rattrapé : le titre français d'une page de lecture repassait au-dessus de 50 px sur téléphone, la taille qui lui faisait prendre six lignes. Les fins du jeu, des phrases entières en capitales, y échappent du même coup.

**Choix de tech lead** :
- **La palette ne bouge pas.** Celle de I est d'un cran plus claire pour le papier et plus sombre pour l'encre. L'écart est invisible à l'œil. L'adopter obligeait à re-mesurer et réécrire chaque ratio cité dans `colors.css` et `token-contrast.test.ts`.
- **`--display-section` reste à 30 px.** Vingt-trois fichiers le lisent, dont le jeu, et la maquette ne montrait pas ces écrans.

**Trois valeurs de la maquette qui ne passaient pas la mesure**. Les trois bornes sont maintenant des tests, dans `space-token-contrast.test.ts` et `e2e/page-ground.spec.ts` :
- **Le grain.** À 9 % d'encre, le grain le plus sombre fait passer `--state-good-text` à 4,18 et `--text-faint` à 4,35. Il est à 4,5 %, soit 4,57 et 4,53 au pire pixel. Le test échoue si on remet 9 % (vérifié).
- **Le verre de l'en-tête.** À 74 %, au-dessus d'un fond d'encre plein (le bureau de nuit du jeu, l'ombre dure d'une carte), le texte gris de la rangée tombe à 3,43 et le lien rouge à 3,20. Il est à 92 % : 4,98 et 4,65.
- **Les calques du fond.** `--ground-lift` compte déjà deux dégradés. Avec deux valeurs pour trois calques, la liste bouclait et le second dégradé prenait la taille et le `repeat` du grain, d'où des taches de 160 px sur toute la page. Premier essai du test de longueur : **vacuité**. Une liste calculée a toujours une valeur par calque, puisque c'est justement le bouclage. Le test lit donc la valeur de chaque calque, et sur la page fautive il voit `repeat, no-repeat, repeat`.

**Piège** : écrire `backdrop-filter` et `-webkit-backdrop-filter` côte à côte fait garder au compilateur CSS la forme préfixée seule, que Chrome ignore. L'en-tête a été construit sans flou et rien ne le montrait, sauf la valeur calculée (`none`). Il faut écrire la forme sans préfixe seule : Lightning CSS ajoute le préfixe pour Safari. `e2e/site-header.spec.ts` lit la valeur calculée.

**Specs remises à jour** :
- `selection-states` : le bouton principal repose sur son ombre, et l'appui le déplace de la longueur de l'ombre.
- `question-rhythm` et `prose-pages` : l'ombre de carte est de 6 px.
- `page-ground` : la couture se mesure sur une moyenne de 16 × 5 pixels, puisque le grain est un bruit au pixel.
- `targets` : chaque segment est centré dans la fenêtre avant d'être mesuré. Avec l'en-tête plus haut, le sélecteur de ton de la carte d'aperçu passait sous la ligne de flottaison à 390 px, et `elementFromPoint` hors de l'écran renvoie `null`.

**Suite complète, deux passages** :
- **Premier** : 557 passées, 5 ignorées par construction, 3 échecs. `open-door` et `targets` sont corrigés ci-dessus.
- **Second, après correction** : 559 passées, 5 ignorées, 1 échec (`locale-routing.spec.ts:76`).

**Le flake de `locale-routing`, mesuré plutôt que supposé.** Deux de ses tests échouent par intermittence : `:76` (l'ancien `:75`, le flake connu) et `:320` (le lecteur qui revient sur `/` après avoir choisi l'anglais). Le fichier a été répété sur ce build et sur `main`, construit dans un worktree :
- ce build : 1 échec sur 5 passages (`:320`) ;
- `main` : 3 échecs sur 10 (`:320` deux fois, `:76` une fois).

La course existe donc déjà sur `main`, à une fréquence égale ou supérieure. Ce changement ne la crée pas et ne touche ni le proxy, ni les cookies, ni les redirections. Elle n'est plus rare : un passage de fichier sur trois à cinq échoue. Les deux tests échouent sur le même geste, le cookie de langue qui ne reflète pas le dernier choix.

**Après le merge (#177), tranché par Antoine** : sur téléphone, un espace fermé reste un chiffre grisé en pointillé, sans le mot « bientôt » (le lecteur d'écran l'entend). Le bandeau garde ses deux lignes plutôt que d'en prendre une troisième, collante.

## Kit I + B, 2/3 : la borne, le profil du parcours, les jauges, l'image de partage (2026-09-29, #178)

La deuxième PR de la passe retenue par Antoine le 2026-09-28, lancée sur son « ok go pour la deuxième PR ». Elle touche le résultat, la carte d'aperçu de l'accueil et l'image de partage.

**Ce qui change à l'écran** :
- **La borne kilométrique porte le score** (`ScoreDisplay variant="marker"`) : tête rouge qui porte le libellé, chiffre, « /100 » sous un filet, socle. Elle se tient à gauche du bloc « l'étape qui freine », dans un nouvel emplacement `lead` de `Bottleneck` ; le verdict court dessous, pleine largeur. Même composition sur la carte d'aperçu de l'accueil.
- **Le profil du parcours** (`viz/StageProfile`, nouveau) est posé en tête de la colonne des puces : un col par étape, aussi haut que les points qui lui **manquent** sur 20, l'écart écrit au sommet (« −8 »). Les étapes que le bloc `Bottleneck` nomme sont en rouge et portent « HC » : une seule sur un goulot net, toutes les ex æquo sur un goulot partagé, aucune sur un tableau de niveau. Jamais la deuxième puce rouge du roast, qui est de l'emphase et pas un diagnostic.
- **Chaque puce porte une jauge**, bord plein au lieu de pointillé (le pointillé rouge reste le conseil, le trait plein rouge est le diagnostic).
- **L'image de partage** (version 2) : la mise en page de I, la borne à la place du chiffre nu, le profil sous l'action, la pilule « 1/3 · PLAINE » à côté du mot-symbole. La première version écrivait « 1/3 · LE DIAGNOSTIC » ; `relecteur-copie` a rappelé la décision du 2026-09-28 (« même règle sur l'image de partage ») et la pilule reprend le compteur du bandeau.

**Choix de tech lead** :
- **Le profil s'appelle « Profil du parcours »**, pas « Profil de l'étape » comme dans la maquette : les cinq cols SONT les étapes, et la règle du 2026-09-28 réserve le mot aux étapes AARRR.
- **Une géométrie, deux rendus.** `lib/viz/stage-profile.ts` est pure et déterministe (la maquette faisait onduler la crête avec un bruit ; ici des collines lisses). La page la tend dans un `viewBox` 0-100 avec des traits qui ne s'étirent pas et des mots en HTML placés en pourcentage, comme `Sparkline` ; Satori la dessine aux pixels de l'image.
- **Le profil est `aria-hidden`.** Les puces dessous sont sa vue tableau, et le bloc au-dessus a déjà nommé l'étape. Un lecteur d'écran n'entend rien de nouveau, et rien de moins.
- **Un emplacement plutôt que `display: contents`.** La maquette posait la borne et le bloc dans une grille en rendant le bloc transparent. Un élément en `display: contents` n'a plus de boîte : `result-composition.spec.ts`, qui vérifie que le bloc est DANS la carte, n'aurait plus rien mesuré.
- **La colonne gauche du résultat passe de 400 à 420 px** sur desktop : le nom de l'étape a besoin de la place à côté de la borne. La maquette disait 440, mais la mise en page fait 992 px de large, pas 1 040 : à 440 px, la colonne droite tombait à 508 px, sous les 519 px dont la carte du jeu a besoin pour garder son bandeau sur une ligne. `game-entry.spec.ts` l'a vu.

**Ce que la mesure a corrigé** :
- **Des jauges qui ne se comparaient pas.** Une jauge a la largeur de sa puce. Sur téléphone et sur la carte d'aperçu, les puces avaient la largeur de leur texte : la barre d'un 16/20 était aussi longue que celle d'un 18/20, et Revenue, qui occupait toute la dernière ligne du résultat, aurait eu une piste deux fois plus longue. Les puces sont maintenant étirées dans des cellules égales partout (`stretch` vaut à toutes les largeurs), la carte d'aperçu passe en grille à deux colonnes, et Revenue n'occupe plus toute la ligne. `e2e/marker-profile.spec.ts` exige des pistes de même longueur.
- **« ACQUISITION » débordait.** Le nom se dimensionne sur la place que laisse la borne (`min(30px, 14cqi)`, la tête est un conteneur). À 15cqi, il débordait de 2 à 4 px à 390 et 1 280 px (mesuré en injectant le nom le plus long et trois ex æquo dans la page).
- **Des libellés lus par position.** L'image indexait les abréviations par rang, alors que le profil saute un pilier absent : un pilier manquant aurait décalé les libellés. Le serveur en calcule toujours cinq, mais chaque col porte maintenant son pilier (`relecteur-securite`), et un test couvre le cas.
- **Un repli trop tôt.** Sous une certaine largeur la rangée passe à la ligne, la borne au-dessus des noms, pour ne pas écrire un nom en 11 px (320 px, hors contrat mais atteignable). Premier seuil à 150 px : un téléphone de 390 px en donne 146, et le repli cassait exactement la mise en page qu'il protégeait. C'est la nouvelle spec qui l'a vu. Il est à 120 px.
- **Les drapeaux touchaient l'ombre de la carte d'action** sur l'image quand les cinq étapes sont à 0/20 : la marge au-dessus des cols passe de 36 à 50 px. La phrase d'action la plus longue de la bibliothèque tient en trois lignes dans les deux langues. Les six cas (échantillon, phrase la plus longue, roast, goulot partagé, niveau, tout à zéro) ont été rendus hors navigateur avant d'être gardés.

**L'image de partage** : `SHARE_IMAGE_VERSION` passe à 2, donc toutes les adresses déjà en cache se renouvellent. Le modèle porte les cinq scores (haché, jamais envoyé ; ils sont déjà publics sur `/r/<id>`) et `profileOf` les signale avec le même résolveur que la page. `fonts.test.ts` lit les nouveaux textes (pilule, abréviations, « HC », « /100 » passé en Plex Mono) à travers `shareImageStrings`, pas recopiés. `OG_RED_ACTION` rejoint les jetons OG : blanc sur le rouge d'action, 4,65, pour la tête de la borne, les drapeaux et l'adresse.

**Contrastes des paires nouvelles** (calculés sur la palette du dépôt, pas celle de la maquette) : blanc sur `--surface-accent` 4,65 (tête de la borne, « HC ») ; `--viz-highlight` sur le lavis 3,47 et sur la carte 4,42 (crête du col HC, marques) ; rouge profond sur la carte 6,72 (écart et abréviation du col HC) ; `--viz-axis` sur la carte 7,20 (les autres).

**La jauge mangeait la cible du « ? ».** `targets.spec.ts` mesure la zone de toucher de 44 px de chaque « ? » de glossaire en balayant `elementFromPoint`. Deux échecs l'un derrière l'autre :
- d'abord 0 px : le profil pousse les puces sous la ligne de flottaison à 1 280 × 720, et `elementFromPoint` ne voit que la fenêtre. La spec centre maintenant chaque « ? » avant de le mesurer, comme pour le sélecteur de ton dans la PR 1 ;
- puis 40 px en hauteur, soit 44 moins les 4 px de la jauge : positionnée, elle passait au-dessus de la zone de toucher. Elle est décorative, elle laisse passer les touchers (`pointer-events: none`).

**Deux délais dépassés dans le moteur** au premier passage complet (`engine-collect.spec.ts:609`, l'analyse axe ; `engine-deck-whatif.spec.ts:58`, l'attente des polices). Ce changement ne touche pas le moteur. Relancés seuls, trois fois chacun : 9 sur 9. Ce sont des lenteurs sous la charge de la suite entière, pas une casse.

**design-sync** : `StageProfile` entre dans l'inventaire (74 composants), avec un aperçu en quatre histoires ; `ScoreDisplay`, `Bottleneck` et `PillarChip` montrent leur nouvelle forme, `Bottleneck` en cartes pleine largeur (en grille, la rangée se repliait sous la borne). Bundle reconstruit et validé : 74/74 aperçus rendus, les trois avertissements permanents seulement.

**Vérifié avant la PR** : 2 185 tests unitaires, `tsc`, `eslint`, `next build` propres, couverture au-dessus de ses seuils, `npm audit --omit=dev` à zéro. Suite Playwright complète sur le dernier build : 567 passées, 5 ignorées par construction, 1 échec, `locale-routing.spec.ts:320`, le flake déjà mesuré sur `main`. Bundle design-sync revalidé : 74/74. Relectures : `relecteur-securite` sans constat bloquant (il signale, hors de ce changement, qu'une adresse d'image au jeton inventé force un rendu Satori non mis en cache : à ranger avec R-15 si un abus apparaît), `relecteur-copie` a trouvé la pilule et le vocabulaire, corrigés.

## Bon à tirer nº6 clos, et les marqueurs que le nº5 avait laissés (2026-09-29)

**La décision.** Antoine : « le bon à tirer nº6 est vu et tout est OK ». Dans la base de la page, 36 cartes sur 37 portaient « ça passe », sans aucune note. La 37ᵉ (`g-referral`) n'avait aucune décision en base : elle est enregistrée « ok » d'après son message, avec une réponse sous la carte qui le dit. Aucune chaîne ne change, donc aucun `updatedAt` ne bouge.

**Les marqueurs levés se décident à partir du texte, pas du commentaire du marqueur.** Pour chacun des 94 marqueurs hors jeu, moteur et audit, un script a relevé le français qu'il couvre et l'a cherché mot pour mot dans la page du nº6. Pour les en-têtes de fichier et de lot, il l'a cherché aussi dans le nº5. Les cas que le script ne savait pas lire ont été vérifiés un par un : les `t(en, fr)` du glossaire long, les `p()` de la confidentialité, les commentaires sur plusieurs lignes. Résultat :
- **82 marqueurs du nº6** : leur texte est celui qu'Antoine a validé. Dans `antoine-credit.ts`, la seule différence est une espace finale, qui sert à coller le lien.
- **9 restes du nº5**, dont le texte est identique à ce qui avait été tranché le 2026-09-22 (réécritures du 23 comprises) : les en-têtes « premier jet » d'`open-door.ts` et de `comparisons.ts`, les trois lots du glossaire, les libellés `openDoor`, `comparisonPage`, `quizHeading` et `nav-strings.checklist`. **La clôture du nº5 n'avait pas levé ses marqueurs** : chaque grep suivant les recomptait comme à relire, et le prochain bon à tirer les aurait resoumis.
- **3 restent marqués**, faute d'être passés dans un bon à tirer : le verdict de la comparaison OKR réécrit le 25/09 (« des quatre » était devenu faux avec la page HEART) et les deux libellés SEO du 28/09.

Chaque levée garde sa raison : « TODO: à relire — revue de copie v1… » devient « Validé au bon à tirer nº6 (2026-09-29) — revue de copie v1… ». C'est la forme du nº3.

**Vérifié** : lint et `tsc` propres, **2 169 tests unitaires** verts. Aucune chaîne affichée ne change, seulement des commentaires.

## Le cookie de langue ne suit plus les préchargements (2026-09-29)

Demandé par Antoine après #178 (« fais le correctif du cookie »). C'est la cause du flake `locale-routing.spec.ts` (`:76`, `:320`), qui échouait 3 fois sur 10 sur `main` et avait fait rougir la CI de #178 à l'essai comme à la reprise.

**Le mécanisme, reproduit avant d'être corrigé.** Un script Playwright rejoue le scénario de `:320` : navigateur en français, `/fr`, clic sur « EN », puis retaper `/`. Il trace chaque requête après le clic, avec son cookie et son `Set-Cookie`. Il échouait 2 à 3 fois sur 20 à 25, puis 6 fois sur 40.
- La réponse de `/en` pose bien `tdg_locale=en`.
- La page `/fr` qu'on quitte continue de précharger ses liens (`next/link`), et certains de ces préchargements partent après le clic.
- Le proxy traite toute requête vers `/fr/…` comme un choix explicite et renvoie `Set-Cookie: tdg_locale=fr`.
- Le lecteur retape l'adresse et retombe sur `/fr`. Un vrai lecteur pouvait perdre son choix de langue de la même façon.

**Premier correctif, faux, et pourquoi.** Il ignorait les requêtes portant `next-router-prefetch: 1`. Ses tests unitaires passaient, et le navigateur échouait toujours 6 fois sur 40. Next retire ses en-têtes de routeur (`rsc`, `next-router-prefetch`…) avant d'appeler le proxy ; la doc installée le dit (`proxy.md`, « RSC requests and rewrites »). Les tests construisaient des requêtes qui n'arrivent jamais telles quelles. C'est le piège de `NEXTJS.md` §1.1, « une logique parfaitement testée unitairement qui n'a strictement aucun effet », et il y est maintenant écrit.

**Le correctif.** Le proxy n'écrit le cookie que sur une navigation : `Sec-Fetch-Mode: navigate`, ou pas d'en-tête du tout (vieux navigateur, script), ce qui reproduit le comportement d'avant. Tout `fetch` de `next/link` est en mode `cors` et n'écrit plus. Aucune navigation douce ne change de langue : le seul lien entre les deux langues est le sélecteur, fait de `<a>` simples exprès. Un prérendu du navigateur (`Sec-Purpose: prefetch;prerender`) est en mode `navigate` et peut devenir la navigation elle-même : il écrit. L'exclusion par le `matcher`, que la doc propose, a été écartée : le proxy ne tournerait plus sur ces requêtes, et un préchargement de `/admin` passerait la garde.

**Vérifié** :
- le rejeu : 0 échec sur 40, contre 6 sur 40 ;
- `locale-routing.spec.ts` répété 10 fois : 240/240 ;
- les specs d'attribution, d'en-têtes de sécurité, d'aperçus de partage et d'en-tête : 34/34 ;
- une sonde directe : un `fetch` en mode `cors` avec le cookie `en` ne reçoit plus de `Set-Cookie`, une navigation vers la même page écrit toujours `fr`.

Non-vacuité, écrite dans `proxy.test.ts` : sans la condition, exactement le test « un fetch de `next/link` n'écrit pas » tombe. Les deux compagnons (une navigation écrit, une requête sans métadonnées écrit) passent dans les deux états.

**Durcissement ajouté sur l'avis de `relecteur-securite`** : un test épingle `config.matcher` à sa chaîne exacte. Coller l'exemple de la doc (`missing: [{ type: "header", key: "next-router-prefetch" }]`) sortirait les préchargements du proxy. Or `/admin/stats/json` n'a pas de garde à lui : un seul en-tête suffirait alors pour le lire sans mot de passe.

**Suite complète sur ce correctif** : 568 passées, 5 ignorées par construction, **aucun échec**. C'est le premier passage entier sans le flake depuis qu'il est mesuré. Unitaires : 2 189.

## Kit I + B, 3/4 : les signes des trois espaces (2026-09-29, #181)

Demandé par Antoine : « go PR 3 », puis « Deux PR » (les signes d'abord, le reste de l'audit ensuite). Cette PR pose les quatre signes de la synthèse I + B qui restaient hors du résultat ; le reste de l'audit du kit est la PR 4.

**Ce qui change à l'écran** :
- **L'accueil** : sous le héros, « Le Tour en trois parties » en trois cartes (`brand/SpaceStrip`). Chacune porte la couleur et le signe de son espace (pictogramme, numéro), dit quand il vient (« Maintenant », « Ensuite », « Pour finir ») et ce qu'il donne. Le titre est le nom accessible du bandeau : jamais « étape ». La carte du jeu est posée dans la nuit. Un espace fermé garde sa place, en pointillés, avec « bientôt » à la place de « Ensuite » : le mot et le trait, jamais la couleur seule.
- **Le moteur** porte son outremer : sur-titre, promesse de confidentialité (bord plein et ombre outremer au lieu du pointillé du `Callout`), les quatre durées, le trait au-dessus de l'outil, la puce « trouvés » du tableau. À droite de l'intro, le chrono de la maquette (`brand/Stopwatch`), à partir de 1 100 px seulement : en dessous, il repousserait le titre dans une colonne étroite, et le pictogramme du bandeau dit déjà « contre-la-montre ».
- **Le hub du jeu** : l'intro devient une affiche de nuit aussi large que l'écran (`ProsePage introWorld="night"`), avec deux champs d'étoiles, une lueur ambrée et la montagne (`game/HubMountain`) : cinq cols pour cinq zones, celle qu'on peut jouer en ocre avec son numéro sur un drapeau, une lune. La liste des zones reste sur papier ; la zone jouable y prend une ombre ocre cerclée d'encre.
- **Le pied de page**, sur toutes les pages : « TOUR DE GROWTH » aussi large que la colonne, à 7 % de l'encre, le pied des lettres coupé par le bord de la page. La règle d'extension 01 (« pas de mot-symbole ») est levée par la décision I + B, et la JSDoc le dit.

**Décisions prises par défaut, chacune réversible en une phrase** :
- **Les cartes de l'accueil ne sont pas des liens.** Le bouton du héros est la porte de l'accueil, le bandeau la navigation de la course. Si Antoine veut des portes, il faudra aussi décider comment les mesurer : ni le bandeau ni cette bande ne passent par `game_entry_clicked`, dont le vocabulaire (`result/retention`, `deep_dive/retention`, `footer`, `hub`) alimente `/admin/stats`. À trancher à l'ouverture du jeu.
- **La phrase du diagnostic répète « 15 questions, 3 minutes »**, déjà sur le dossard du héros. `dictionary.ts` déconseille de le dire deux fois à quelques lignes d'écart ; ici, un écran plus bas. Elle part au bon à tirer comme le reste.
- **Les hauteurs de la montagne sont un dessin** (9, 12, 17, 11, 14 sur 20), pas une mesure. La légende ne dit pas ce que vaut une hauteur, rien n'est noté sur le hub, et la figure est cachée aux lecteurs d'écran.

**Deux jetons de plus** (`spaces.css`) : `--space-game-night-accent`, l'ambre de la nuit (10,13 sur la nuit, 1,42 sur papier, d'où la règle : il ne quitte jamais la nuit), et `--space-game-night-glow`, cet ambre à 12 %. Le titre, le chapeau et le sur-titre sont posés sur la lueur, donc mesurés dessus, composée sur la nuit : 13,15, 6,65 et 8,13 (`space-token-contrast.test.ts`, qui vérifie aussi que la lueur est bien l'accent à 12 %). Le chrono lit `--space-engine-accent`, `--border-hard`, `--surface-card` et `--shadow-color` ; aucun composant ne lit de primitive.

**Le chrono et la colonne de l'intro, calculés avant d'être posés.** L'intro fait 760 px et le cadre du moteur 960 : avec 280 px de chrono, les deux se seraient chevauchés de 80 px. Au-dessus de 1 100 px, l'intro laisse donc 320 px au chrono (`min(760px, 100% - 320px)`) ; le texte courant, plafonné à la mesure de lecture, n'y perd presque rien. La spec vérifie qu'aucun titre, paragraphe ni lien ne passe sous le dessin.

**Le mot-symbole est mesuré, pas deviné.** À corps 100, « TOUR DE GROWTH » en Stardos Stencil fait 905 unités d'avance et 902 d'encre, pour des capitales de 71. Le dessin fait donc 902 × 66, avec la ligne de base à 72 : la page coupe le pied des lettres. `textLength` tient la largeur si la police de repli dessine à la place. En SVG et caché aux lecteurs d'écran : un `::after` aurait été lu par certains lecteurs, et un texte HTML à 7 % aurait été un faux échec de contraste pour axe.

**Ce que la mesure a corrigé** :
- **Une assertion vide dans la nouvelle spec.** Pour prouver que le pied des lettres est coupé, la première version comparait le bas de la boîte du texte au bas du dessin. La boîte d'un texte SVG inclut la descente de la police : elle dépasse toujours, même avec une ligne de base remontée de 40 unités. La spec vérifie maintenant la règle elle-même, une ligne de base sous le bord du dessin.

**e2e** (`e2e/spaces-kit.spec.ts`, 8 tests, 1 280 px en anglais et 390 px en français) :
- la bande nomme les trois espaces dans l'ordre et lit les mêmes drapeaux que le bandeau ;
- un espace fermé est en pointillés et dit « bientôt », la carte du jeu est dans la nuit, aucune carte n'est un lien ;
- trois colonnes sur grand écran, une sur téléphone ;
- les couleurs calculées du moteur sont l'outremer, le chrono est caché aux lecteurs d'écran, visible à 1 280 px et absent à 390 px ;
- l'intro du hub est dans la nuit, pleine largeur, et les drapeaux de la montagne sont exactement les zones jouables de la liste ;
- le mot-symbole a la largeur de la colonne des liens, termine la page, et reste sous 10 % d'opacité.
Aucune page ne défile de côté.

**design-sync** : `SpaceStrip`, `Stopwatch` et `HubMountain` entrent dans l'inventaire (77 composants), avec leurs aperçus, plus une histoire `NightIntro` pour `ProsePage`. `conventions.md` dit où chaque espace porte sa couleur. Deux choses vues seulement dans le rendu du bundle :
- **La bande se repliait sur la fenêtre, pas sur sa largeur.** Dans l'histoire « Phone » (350 px dans un volet large), les trois cartes restaient côte à côte, écrasées : la règle était une media query. C'est maintenant une requête de conteneur, comme le bandeau ; la bande tient dans n'importe quelle colonne, et passe à une colonne sous 760 px de large.
- **`RENDER_THIN` sur le chrono** : le validateur lit un aperçu sans texte comme vide, alors que le dessin est bien là. Les deux histoires ont maintenant une légende, plutôt qu'un quatrième avertissement permanent.

**Relectures.** `relecteur-securite` : aucun constat. La bande ne révèle rien que le bandeau ne dise déjà sur l'accueil (les mêmes drapeaux inlinés), aucun aperçu propriétaire ne peut la faire passer « ouverte », rien ne rend la page dynamique, et rien de nouveau ne part vers le client. `relecteur-copie` : rien de bloquant, et ceci corrigé :
- les dates de contenu de `/` et `/game` (`updated-at.ts`) ;
- deux écarts de vocabulaire en anglais : "the stage holding you back", comme partout ailleurs, et "leadership meeting", la traduction de « CODIR » fixée par le moteur ;
- « stage » employé pour un espace dans deux JSDoc et deux aperçus, qui partent chez Claude Design à côté de la règle qui l'interdit ;
- les espaces insécables et une copie périmée (« pillar ») dans les aperçus de `ProsePage`.
Restent pour Antoine, au bon à tirer : « cinq cols » (la métaphore du dessin) là où le jeu dit « zones », et « 17 » en chiffres là où le moteur écrit « dix-sept ».

**Vérifié avant la PR** :
- **2 195 tests unitaires** (6 de plus : les contrastes de la nuit), `tsc`, `eslint`, `next build` propres ;
- couverture au-dessus de ses seuils, `npm audit --omit=dev` à zéro ;
- suite Playwright complète : **576 passées, 5 ignorées par construction, aucun échec** ;
- après les corrections des relecteurs et le passage en requête de conteneur, 71 specs repassées sur le nouveau build : la nouvelle spec, l'accessibilité, l'accueil, les pages de prose, la typographie, les données structurées ;
- bundle design-sync : 77/77 aperçus rendus, les trois avertissements permanents seulement.

## Kit I + B, 4/4 : le reste de l'audit du kit (2026-09-29, #182)

La dernière des quatre PR de la passe I + B, décidée par Antoine (« Deux PR » : les signes, puis l'audit). Elle solde ce que l'audit statique du kit (2026-09-27) laissait ouvert en dehors des signes : le moteur ramené dans le système, une échelle de mouvement, et les constats faibles. Les constats de l'audit sont cités par leur numéro (S-, M-, L-).

**Le mouvement : une échelle, nommée par usage (S-12, L-6, S-13, S-19, S-21, S-25).**
- **`motion.css` porte une échelle complète**, nommée par ce que fait le mouvement et non par sa vitesse :
  - `--dur-fast` (survol, pression) ;
  - `--dur-close` < `--dur-open` : partir est plus rapide qu'arriver ;
  - `--dur-state` (un changement sur place) et `--dur-stamp` ;
  - `--dur-shake`, `--dur-pulse`, `--dur-reveal`, `--dur-draw` ;
  - trois boucles d'attente (`--dur-wait`, `--dur-breathe`, `--dur-dots`) ;
  - une distance, `--dist-step` (8 px).
- **Ce qui a été retiré.**
  - Les jetons morts (`--dur-exit`, `--dur-message`, `--game-dur-trace`).
  - Les deux jetons du jeu que l'échelle couvre maintenant (`--game-dur-enter`, `--game-enter-rise`).
  - `--dur-reveal`, déménagé de `game.css` : le test du jeu l'attendait (« le jour où motion.css l'adopte, il doit quitter ce fichier »).
  - Les huit copies de `ui-timing.ts` qui recopiaient une durée CSS : aucun fichier ne les importait.
- **Plus aucune durée littérale** dans un `animation` ou un `transition`. `motion-scale.test.ts` exige aussi que chaque jeton ait un consommateur.
- **Le tampon (L-6).** Il passe à 260 ms avec `--ease-stamp`, la paire du DESIGN-BRIEF, et ses images clés à deux arrêts. Les trois arrêts d'avant dépassaient déjà la cible, et une accélération qui dépasse, appliquée à chaque segment, faisait rebondir le chiffre deux fois.
- **Le coup de tampon (S-13) devient une seule image clé partagée, `slam`.** Elle n'anime que `scale` et `opacity`. L'inclinaison de repos est la propriété `rotate` de chaque tampon, donc la même image clé sert au verdict à −4° et à la coupure de presse à −6°. Ces deux copies différaient de quelques degrés.
- **`QuarterNews` passe sur l'échelle.**
  - La secousse dure 280 ms, en quatre oscillations dont la première vaut `--dist-step`.
  - Chaque carte monte de 8 px en 250 ms, sans changement d'échelle (avant : 28 px et `scale(0.97)` en 420 ms).
  - Un seul effet par carte : le verdict est tamponné, le chiffre ne l'est plus en plus.
  - La sortie est animée : l'écran s'efface en 150 ms avant que l'îlot ne le démonte.
- **Les points de suspension du Deep dive (S-19)** sont une boucle CSS, un `clip-path` par paliers, au lieu d'un `setInterval` qui tournait ~70 s hors de toute garde de mouvement réduit.
- **`color` (et `border-color`) se transitionnent** là où le fond le faisait déjà seul (S-21).
- **Une seule garde de mouvement réduit**, dans `motion.css` : `globals.css` la répétait mot pour mot (S-25).

**Le piège : la sortie de `QuarterNews` recopiait sa durée.** Première version : une constante `NEWS_CLOSE_MS = 150` dans `ui-timing.ts`, tenue égale à `--dur-close` par un test, plus le crochet de mouvement réduit. `game-bundles.test.ts` l'a refusée, puisqu'un composant du jeu n'importe `lib/game` que pour ses types. La version gardée lit la durée de l'animation sur le dialogue lui-même (`getComputedStyle(…).animationDuration`). Plus aucune copie, et sous mouvement réduit l'animation est coupée : sa durée vaut 0 s et l'écran part aussitôt, sans code pour ce cas.

Un test « `ui-timing.ts` ne recopie aucune durée CSS » a été écrit puis retiré. Comparant des valeurs, il a pris le pas des mois (600 ms) pour une copie de `--dur-reveal` (600 ms). Un contrôle par valeur ne distingue pas une copie d'une coïncidence, et un contrôle par nom serait aveugle au suivant (convention 11). La règle est écrite en tête du fichier.

**Le survol de nuit entre dans le système (S-7).** `--state-hover-border` est un jeton sémantique des deux mondes. Sur papier, c'est le bord qu'un contrôle a déjà, puisque le survol y vit dans l'ombre soulevée. La nuit, où l'ombre noire est à 1,20:1, c'est `--night-muted` (8,28 / 7,70 / 6,76). `Button`, `AnswerOption`, les choix et les onglets du moteur, et `ActionCard` le lisent. `--game-hover-border` et `--game-hover-lift` quittent `game.css`.

**Le moteur ramené dans le système (S-3, S-9, S-14, S-26, S-23, S-24).**
- **Les choix du moteur** (le modèle, les modes d'un chiffre) sélectionnent par le remplissage encre de tout le reste du site, au lieu d'un bord plein sur fond creux. Leur survol est l'ombre, gardée par `(hover: none)`. Un choix fermé garde son pointillé.
- **Les trois tampons rouges** (tableau, peloton, slides) lisent `--surface-accent` / `--text-inverse`, le rôle fait pour ça, et non plus les jetons du bouton principal. Le commentaire de `StageTabs.tsx` qui justifiait l'étiquette encre par un 4,42:1 périmé est corrigé.
- **Les onglets d'étape, les lignes de chiffres et les accordéons** ont un survol gardé et une transition. Le marqueur +/− des lignes est celui de `Disclosure`, par `composes`, et non une copie à 24 px.
- **Les libellés d'axe de 11 px** passent au `--chart-label` de 12 px. Le compteur de caractères n'est plus à 11 px en encre pâle.
- **L'utilitaire « visuellement caché »** du moteur cède la place à la classe globale.

**Les constats faibles.**
- **Requêtes de conteneur (S-18).** Le tableau, le panneau « Et si », le hub de collecte, les tuiles de décembre et le catalogue des pratiques suivent leur propre largeur. Les seuils : 860 px de composant, soit la largeur qu'un tableau avait depuis une fenêtre de 960 px ; 520 px, soit ce qu'une fenêtre de 560 px laissait. Le « Et si » est dans le tableau ET dans le pas-à-pas, à deux largeurs : seule sa propre boîte sait laquelle.
  - **Le piège vérifié avant** : `container-type` impose une contention de mise en page, donc le conteneur devient le bloc de référence de tout descendant en `position: fixed`. Aucun des cinq ne contient de popover de glossaire, seul élément fixe qui aurait pu s'y trouver ; les dialogues passent en couche supérieure.
- **Les seuils de fenêtre (L-11)** sont une liste écrite, chacun avec sa raison :
  - 760, la ligne du téléphone ;
  - 640, le popover qui se range en bas de la fenêtre ;
  - 960, une page qui sort de sa colonne ;
  - 1 100, le chrono du moteur.
  `breakpoints.test.ts` échoue sur un cinquième tant qu'il n'y est pas ajouté avec sa raison.
- **Contraste sur le sol composé (L-10, S-20).** Le sol de la page n'est pas le `--paper-1` à plat : `--ground-lift` l'assombrit sous un halo noir à 5 %, là où se posent une ligne de crédit ou le « gagné » de décembre sans carte dessous.
  - Au point le plus sombre, `--text-faint` mesurait 4,50 et `--state-good-text` 4,47. `--ink-faint` passe de 0,65 à 0,67 (4,79 sous le halo, toujours plus pâle que le gris atténué) et le vert de `#1f6b3f` à `#1e693e` (4,60), la plus petite retouche qui passe.
  - Le nouveau vert passe même sur `--paper-2` (4,61), où l'ancien était réservé au grand texte.
  - `token-contrast.test.ts` mesure maintenant chaque encre de texte du papier sous le halo lu dans `shape.css`, pas recopié. Les deux couleurs de série sous 4,5 y sont épinglées comme marques.
  - Le grain, empilé sur le halo, n'est pas mesuré : il demanderait de changer les rouges de la marque, et un glyphe ne se dessine jamais sur un seul pixel de bruit. Le commentaire de décembre, qui donnait ses deux rapports à l'envers, est corrigé.
- **La croix de fermeture du popover** fait 44 px (S-22). Des marges négatives rendent la place au padding, donc la ligne ne grandit pas.
- **Les tailles et les couches.**
  - `--chart-value-compact` remplace le 17 px écrit deux fois à la main (S-27) ; les deux tailles de valeur du jeu, lues par rien, sont retirées.
  - Le chiffre du score lit `--size-score-xl` / `--size-score-lg` (M-10).
  - Chaque `z-index` lit l'échelle (L-7, `z-index.test.ts`) ; `--z-toast`, sans consommateur, est retiré et `--z-raised` ajouté pour la barre d'action du jeu.

**Ce que cette PR ne fait pas, et pourquoi.**
- **S-6, S-8, S-10, S-11, S-15, S-16, S-17** n'étaient pas dans son périmètre. Les slides gardent leurs 23 tailles littérales (S-8).
- **Il reste 17 `font-size` littéraux hors des slides.** Dont deux libellés à 10 px, ajoutés par la PR 2 : le drapeau « HC » et la tête de la borne. Ils sont sous le plancher de 11 px. Les remonter change la borne mesurée à 390 px : c'est un sujet à part.
- **Les opportunités « plateforme » de l'audit (§6)** restent ouvertes : popover en couche supérieure, accordéon animé par `::details-content`, View Transitions entre les écrans du moteur.

**Vérifié avant la PR** :
- **2 220 tests unitaires**, `tsc`, `eslint` et `next build` propres ; couverture au-dessus de ses seuils ; `npm audit --omit=dev` à zéro.
- **Suite Playwright complète : 576 passées, 5 ignorées par construction, aucun échec.** Les specs du moteur (onglets, collecte, « Et si », slides), du jeu (nouvelles, îlot, fins), du mouvement et d'accessibilité passent sur les nouvelles règles.
- **Non-vacuité** de `motion-scale.test.ts`, par sabotage : un jeton ajouté sans consommateur et une durée écrite en dur font tomber exactement les deux cas visés.
- **Captures du moteur** à 1 280 px (français) et 390 px (anglais) : choix au remplissage encre, choix fermés en pointillés, onglets en grille ou en défilement selon la largeur du tableau, aucun défilement horizontal.
- **Popover** mesuré dans l'application à 390 px : la croix fait 44 × 44 px, à sa place, et la ligne garde sa hauteur.
- **Bundle design-sync** : 77/77 aperçus rendus, les trois avertissements permanents seulement.
- **Relectures non lancées**, et pourquoi : la PR ne touche ni route, ni proxy, ni payload, ni prompt, ni workflow, et n'ajoute aucune copie visible (les seuls textes changés sont des commentaires).

## Kit I + B, fidélité : ce que la maquette dessinait et que le rendu n'avait pas (2026-09-29, #183)

Demandé par Antoine après le merge de #182 : « il me semble qu'il y a quelques écarts encore entre ce qui était prévu et ce qu'on obtient. Par exemple, la couleur du background où le titre "Tour de Growth" est présent était censé être plus clair que le background du body ».

**La méthode : mesurer l'écart plutôt que le chercher à l'œil.** La feuille de la maquette (`design/alternatives-2026-09/designs/ib-ink.css`) est posée sur le build courant, et chaque style calculé qu'elle change est relevé : six écrans, 1 280 et 390 px. Les réglages déjà tranchés sont retirés d'abord (palette, grain, titre héros des autres pages, titre de section). Restent environ soixante écarts par écran. Chacun a été classé : choix consigné dans ce journal, bruit (la maquette dessine en pseudo-élément ce que le code rend en élément), ou oubli. L'en-tête n'est pas sorti du relevé : la maquette visait les trois anciens en-têtes, fondus depuis dans `SiteHeader`. Il a été traité à part.

**Ce qui change à l'écran** :
- **L'en-tête est en papier relevé** (`--surface-card`, `--paper-0`), un cran plus clair que la page (`--paper-1`). Le premier build l'avait vitré avec le papier de la page elle-même, donc l'en-tête se confondait avec le sol : 3 niveaux d'écart par canal, mesurés dans la gouttière droite ; 21 à 32 maintenant (vitre 249, 247, 239 sur un sol à 228, 222, 207). Les 92 % d'opacité, qui sont une borne de contraste, ne bougent pas. Au-dessus d'une encre pleine, le texte gris de la rangée monte de 4,98 à 6,14 et le lien rouge de 4,65 à 5,73.
- **Le sol de la page n'a plus de halo gris.** La maquette l'éclaire d'un seul lavis blanc venu d'au-dessus du coin haut gauche, rien d'autre. Le halo noir à `88% 74%` grisait la moitié droite de chaque fenêtre. Le lavis est écrit en pourcentage de la boîte qu'il éclaire : sur 1 280 × 860, c'est à trois pixels près le `1200px 700px at 12% -10%` de la maquette (1 203 × 697), et une slide ou une carte de papier dans la nuit est éclairée pareil.
- **Le pied de page s'ouvre sur un trait plein d'encre**, et non plus sur le pointillé des séparations internes.
- **La citation du fondateur** devient une citation en exergue : 600 24 px (`--title-quote`).
- **L'action unique** se pose sur une ombre dure rouge (`--shadow-advice`), et sa phrase passe en 600 18 px (`--title-move`). Sur l'accueil comme sur le résultat.
- **Le bandeau du jeu, sur le résultat, porte la montagne** en ambre de nuit, empruntée à `SPACE_PICTO` et non redessinée.
- **Le quiz** : segments de progression de 10 px (au lieu de 18/16), réponses de 72 px (`--hit-answer`, puisque les cartes d'action du jeu gardent `--hit-option`), 64 px d'air sous le bandeau sur desktop.
- **L'accueil** : sous-titre en 19 px (`--body-lead`), titre resserré (−0,012 em), boutons larges en 17 px.
- **Une ombre de 8 px** (`--shadow-hero`, `Card elevation="hero"`) pour les deux cartes qui SONT l'écran : l'aperçu de l'accueil et la question.
- **La carte du jeu de la bande d'accueil, ouverte, perd son liseré gris.** Fermée, elle garde son pointillé, qui dit « bientôt » sans le mot.

**Tranché par Antoine** : la colonne gauche de l'accueil reste **calée en haut**. La maquette la centre face à la carte d'aperçu. Le bouton principal descendrait alors d'environ 180 px et passerait sous la ligne de flottaison d'un portable 1 366 × 768.

**Choix de tech lead** :
- **Les boutons larges ont 20 px de côté, pas 26.** Avec 26, les deux appels de l'accueil font 515 px en français pour une colonne de 495 : le premier build a coupé chaque libellé en deux. Avec 20, c'est 491 px. La colonne de la maquette faisait 515 px, par un effet de sa grille sur la carte d'aperçu. Sur téléphone, où ils prennent toute la largeur, ils gardent 16 px. La rangée passe en `flex-wrap` : là où ils ne tiennent pas, le second bouton descend entier au lieu de couper les deux libellés.
- **La montagne du bandeau fait 22 × 14 et non 30 × 20, avec 20 px de côté au lieu de 26.** La ligne française fait 443 px de texte dans une carte de 528. À la taille de la maquette, elle ne tenait plus sur une ligne. À celle-ci, il faut 515 px. La spec du bandeau sur une ligne à 1 280 px reste verte.
- **L'ombre rouge de l'action ne se confond pas avec celle de `DetourCard tone="fault"`** (nos pannes) : le pointillé fait la différence. `conventions.md` et les deux JSDoc le disent.
- **`--ink-faint` 0,67 et le vert `#1e693e` (#182) restent** : ils passent avec plus de marge sur un sol qui ne fait plus qu'éclaircir, et le vert sert encore sur `--paper-2`.

**Écarts laissés, et pourquoi** :
- Les rayons hors de l'échelle 999/12/14/18 : dossard 8, question 22, cartes d'analyse et action 16.
- L'interlettrage mono de 0,12 em de la maquette (nous : 0,08). Il élargirait chaque étiquette de 4 % et renverrait le bandeau du jeu sur deux lignes.
- Le chapeau du hub en `#d9d1c2` sur la nuit : il demanderait une primitive de plus.
- Les autres encadrés du moteur en outremer : la maquette ne montrait que la promesse de confidentialité.
- Les 8 px d'air du moteur.

**Deux gardes nouvelles, prouvées par sabotage** :
- `space-token-contrast.test.ts` exige que la vitre soit plus claire que la page qu'elle survole : luminance supérieure de 10 %. Remise sur `--surface-page`, la vitre fait tomber six tests.
- `token-contrast.test.ts` exige que le sol ne fasse qu'éclaircir : aucun arrêt de couleur plus sombre que le blanc. Il mesure aussi les encres de texte sur `--paper-1`, devenu le plancher. Le halo remis fait tomber le test.
- `e2e/kit-fidelity.spec.ts` le vérifie aux pixels, sur quatre pages : la vitre dépasse le sol de plus de 10 niveaux par canal. Il vérifie aussi que les deux appels de l'accueil tiennent côte à côte, un libellé par ligne, dans les deux langues.
- Sabotage sur le build : vitre remise sur le papier de la page, 26 px de côté. Les quatre pages tombent (vitre 231, 225, 210 contre un sol à 228, 222, 207 : l'écart qu'avait vu Antoine), ainsi que le français. L'anglais passe, puisqu'il tient même à 26.

**Vérifié avant la PR** :
- `tsc`, `eslint`, **2 220 tests unitaires**, `next build` ;
- **suite Playwright complète : 582 passées, 5 ignorées par construction, aucun échec** ;
- captures 1 280 / 390, en français et en anglais, comparées à celles de la maquette, et relevé calculé relancé : il ne reste que les écarts listés ci-dessus et le bruit ;
- bundle design-sync : 77/77 aperçus, les trois avertissements permanents seulement. L'histoire `Elevations` de `Card` montre `hero`.

**Relectures non lancées**, et pourquoi : aucune route, aucun proxy, aucun payload ni prompt n'est touché, et aucune copie visible n'est ajoutée (seuls des commentaires changent).

**Après la PR, une règle de merge nouvelle** (Antoine) : « quand les PR sont vertes, tu peux merge, n'attends pas forcément mon GO, tant que tu sais que tu ne vas pas provoquer soudainement une grosse hausse de functions storage côté Vercel ». Écrite là où une session la lit avant d'agir : `CLAUDE.md` (l'outillage), `GITHUB.md` §2 et `/livrer` §0. Ce dernier donne la barrière vérifiable : aucun changement à `package.json`, au verrou, à `next.config.mjs` ni à `vercel.json`, et aucune route de fonction ajoutée. #183 la passe : du style (dix composants rendus autrement, six fichiers de composant retouchés), des tests et de la doc.

## Kit I + B, passe de vérification après merge (2026-09-29, #184)

Demandée par Antoine une fois #183 en production : « fais une dernière passe de vérification de ton travail là-dessus ». Trois voies, dont deux indépendantes de l'auteur :
- **La suite complète sur `main` (`cbe11da`)** : `tsc`, `eslint`, `npm audit` propres, build, 582 specs passées et 5 ignorées par construction, aucun échec.
  - `vitest --coverage` a d'abord rendu deux échecs, deux dépassements de 5 s. Seuls, ces deux tests prennent 112 et 884 ms. Leurs fichiers n'ont pas bougé depuis #169, et la CI était verte sur le même code. La cause est la charge : 4 processeurs, 177 workers sous couverture, et deux relecteurs qui tournaient en même temps. Rejouée à machine calme, la suite fait 2 220/2 220, seuils compris.
- **Une relecture adversariale du diff de #183**, par un agent qui a mesuré dans un Chromium les vraies feuilles construites.
- **Un balayage du dépôt** pour les traces périmées de toute la passe.

**Ce qu'elles ont trouvé, et qui est corrigé ici** :
- **Une régression réelle : le bandeau du jeu passait sur trois lignes sur téléphone** (74 px au lieu de 56, en français de 375 à 393 px, en anglais à 360). La montagne ajoutée par #183 prenait 32 px à une colonne qui tenait tout juste. Mes captures à 390 px étaient en anglais, qui passe encore. Sous 350 px de carte, la montagne rend sa place (requête de conteneur), et la spec téléphone exige maintenant une hauteur de 56 px au plus et une montagne cachée. Elle ne vérifiait que le « · » et le défilement latéral.
- **Une garde devenue aveugle** : `prose-pages` compte « une seule carte haute » avec les ombres de 6 px. Une carte `hero` (8 px) lui échappait.
- **L'ombre du roast était restée à 7 px** quand l'échelle passait à 6. Le score roast et la carte de panne se tenaient un pixel plus haut que leurs jumeaux.
- **La barrière Functions Storage de `/livrer`, écrite le jour même, vérifiait la mauvaise chose.** Elle citait `VERCEL.md` §1.6 au lieu de §1.1-1.2, et bloquait sur une route ajoutée, qui ne coûte presque rien. Elle laissait passer ce qui coûte : du code, une police ou un fichier tiré dans un bundle serveur. Réécrite, avec deux commandes (dépendances et réglages de build ; binaires ajoutés sous `src/`) et une mesure de poids au-delà d'~1 Mo. Elle compare maintenant avec `origin/main...HEAD`, ce que la branche change.
- **La garde « le sol ne fait qu'éclaircir » se contournait.** Elle ne lisait que `rgba()` et `#hex`, donc un arrêt `black`, `hsl()` ou `var(--ink-0)` passait sans bruit. Chaque arrêt est maintenant posé sur le papier et doit l'éclaircir, et un arrêt illisible échoue par son nom. Sabotages : le halo, `black` et `var(--ink-0)` tombent ; un blanc chaud, qui éclaircit, passe (l'ancienne version l'aurait refusé à tort).
- **Des commentaires et des aperçus design-sync** citaient les anciennes valeurs : ombres 7/5/4, question 28/22 px, bouton `lg` « mobile », halo.
- **Les comptes de `.design-sync/NOTES.md`** : 77 composants, 244 cellules, 28 cartes en colonne.
- **`CLAUDE.md`** : passe close, bundle 77/244, trois avertissements permanents, carte du dépôt.
- **Deux formulations du journal** : « exactement » (1 203 × 697) et « six composants ».
- **Deux restes plus anciens** : `DgFace` nommait une classe inexistante (#175), et `.wrap` de `StageProgress` était mort depuis #14.

**Un flake débusqué en route, et sa cause** : `retake-nudge.spec.ts:54` a échoué une fois dans la suite, puis réussi au second essai. Ce n'était pas le produit.
- La spec retient le premier clic du lien de relance (un `preventDefault` posé par `page.evaluate`) pour lire l'événement dans le document qui l'a tiré. Mais la relance ne s'affiche qu'après l'effet qui lit l'appareil, et `querySelector` n'attend pas.
- Sous charge, il ne trouvait rien, `?.` ne retenait rien, le clic naviguait, et la liste d'événements toute neuve du quiz était vide.
- Deux essais qui soignaient le symptôme ont échoué au test de charge : lire par sondage, puis attendre le script d'analytics. La vraie cause se lisait dans la liste vide, sans même `landing_return`, l'événement de montage : on avait changé de document.
- Correctif : attendre le lien avant de le retenir, et lever une erreur s'il manque.
- Mesure : 280 passages à quatre workers sans reprise (spec et bandeau du jeu, 20 fois chacun). 1 à 2 échecs avant, aucun après.

**Vérifié et juste** :
- les rapports de contraste de la vitre, recalculés ;
- les deux calques du sol ;
- les seuils du bandeau sur desktop (515 px nécessaires, sans « · » pendant à partir de 520) ;
- les deux appels de l'accueil de 761 à 1 280 px ;
- les points d'échantillonnage de `kit-fidelity` ;
- les comptes de tests.

**Laissé, et listé comme reste** : deux jetons morts d'avant la passe (`--width-mobile` et `--texture-spray-strong`), et le rayon de 6 px du message de chargement, hors de l'échelle.

**En production** : mergée le 2026-09-29 (squash `b708d43`, 25 fichiers, identique à la tête de la PR), servie à 16 h 35 UTC. Relevé par `curl` sur les feuilles servies : `--shadow-card-roast:6px 6px 0` et `@container game-entry (max-width:349px)`.

## La liste de travail rangée par agent (2026-09-29)

**La demande d'Antoine** : tout ce qui reste à faire, hors bons à tirer, documenté clairement et regroupé par sujets qu'une session peut traiter seule, avec un prompt par agent (le travail autonome, la design sync, ses décisions une par une, ses gestes pas à pas), pour clore cette session et repartir sur des sessions plus fines.

**Ce qui est livré** : `CHANTIERS.md`, et un renvoi depuis `CLAUDE.md`. Cinq sections :
- A, le travail autonome, en six lots ;
- B, la design sync, sur la machine d'Antoine ;
- C, ses 22 décisions, chacune avec une recommandation ;
- D, ses gestes ;
- E, la veille sur déclencheur.

Le document se termine par les quatre prompts. La règle d'usage est écrite en tête : une session retire ce qu'elle livre et ajoute ce qu'elle trouve.

**Reconstruit depuis les sources, pas depuis l'inventaire de la veille** :
- les constats restants de l'audit du kit (S-6, S-8, S-10, S-11, S-15 à S-17) et ses opportunités de plateforme (§6), relus dans l'artifact ;
- les sept décisions du moteur, dans `ENGINE.md` ;
- D1 à D4 des campagnes ;
- les vagues 3 et 4 de `GROWTH-PLAN.md` ;
- la phase 1 bis d'`AUDIT-PLAN.md` ;
- `.design-sync/NOTES.md`.

**Chaque compte est re-mesuré par `grep`, et trois ont bougé depuis l'audit** :
- quinze `font-size` littéraux hors des slides (et non dix-sept) ;
- une cinquantaine de `2px solid|dashed` en dur ;
- quinze jetons `--viz-*` sans usage.

Des seize opportunités de plateforme, douze sont absentes de `src/`, `text-wrap: pretty` est déjà posé, et trois étaient déjà traitées (S-4, S-18, S-19).

**Deux choses qui n'existaient que hors du dépôt, maintenant dedans** : les sept décisions par défaut du jeu (2026-09-24), jusque-là seulement dans le répertoire de travail d'une session, et le numéro du projet Claude Design.

**Une affirmation vérifiée avant d'être écrite** : « les liens d'ouverture du moteur ne sont pas construits ». `ENGINE_PATH` n'est lu que par `SpaceBand`, `sitemap.ts` et `/admin/preview`, donc la phrase dit aussi que le bandeau d'étape, lui, y mène.

**Déplacé** : le relevé des événements `retake_started` et `landing_return` passe des gestes d'Antoine au travail de la session (A6.1). Le workflow chiffré lit `/admin/stats` sans lui depuis le 2026-09-14.

## A1 : accessibilité et cohérence du système (2026-09-29)

**Le lot** : A1 de `CHANTIERS.md`, huit constats, dont cinq de l'audit du kit (S-6, S-11, S-17, les libellés de 10 px, les tailles littérales). Chacun re-mesuré avant d'y toucher : tous tenaient, sauf une part de S-6 (`--dur-stamp` n'était plus détourné par l'appel, l'échelle de mouvement S-12 l'avait déjà réglé).

**A1.1, le bouton texte (S-11).** Trois recettes coexistaient : `Button variant="quiet"` (31 px de haut, ni survol ni pression), le `linkButton` du moteur (32 px) et le « Remettre à aujourd'hui » d'« Et si » (44 px).
- `quiet` est maintenant la seule. Il reste dessiné comme une ligne de texte soulignée, et se tape sur une bande d'au moins 44 px sur chaque axe : un `::before` transparent centré sur le libellé, qui ne déplace rien.
- Survol : l'encre du texte (`--text-body`, le texte le plus contrasté de chaque monde, déjà mesuré par les tests de contraste) et un soulignement de 2 px. Pression : le soulignement remonte contre les lettres. Coupé sur écran tactile, comme les autres boutons.
- Les deux actions sous un champ (« Je n'ai que le taux », « J'ai les deux comptes ») et les resets d'« Et si » passent sur `Button quiet compact`. Le seul usage restant de `linkButton`, un lien au milieu d'une phrase (« aussi dans Amplitude : … »), devient `inlineLink`, un lien dans la police de sa phrase : pas un bouton texte, et WCAG 2.5.8 exempte une cible posée dans une ligne de texte.
- **Le test a trouvé un vrai défaut au premier build** : la ligne du pied de levier tenait ses 44 px du seul ancien reset. Plus courte, elle laissait la bande de frappe du reset mordre sur le curseur au-dessus (« Back to today covers a neighbour: INPUT »). Un levier bougé garde maintenant une ligne de 44 px ; un levier au repos, sans reset, garde sa ligne unique, comme avant (une première version les agrandissait tous, vue en relisant le diff).
- `targets.spec.ts` mesure les trois revendications avec `elementFromPoint` : une bande de 44 px qui atteint le bouton, aucune cible voisine qui perd un point de sa surface, et un dessin qui n'a pas grandi. Plus un test de survol et de pression. Chaque test mesure dans la zone qu'il vise : une fiche ouverte immobilise la page, et les boutons « Fill in » derrière elle ne peuvent pas être atteints (`scrollIntoView` les laissait à y = 2 885 px, bande mesurée à 0).

**A1.2, les épaisseurs (S-17).** Deux jetons s'ajoutent à `--border-width` (2 px), chacun pour un usage : `--border-width-stamp` (3 px, une marque encrée sur un bord : le tampon, le bord du DG en colère, le trimestre en cours, la bande d'accent d'un espace) et `--border-width-hairline` (1 px, sous le contenu : la grille d'un graphique, les lignes d'un tableau, les écrans de l'appli de Flixo). Les 52 `2px solid|dashed` écrits en dur lisent désormais le jeton (ou le raccourci exact, `--border-solid`, `--border-dashed`, `--border-rule`), et les trois raccourcis lisent `--border-width` eux aussi. Dans le jeu : la pastille des clics et la case vide du bandeau passent à 2 px, le bord du DG de 4 à 3 px (comme celui du rapport), le trimestre en cours de 5 à 3 px (sa boîte suit, les libellés ne bougent pas). `border-width.test.ts` refuse toute épaisseur littérale sous `src/`, sauf trois traits de 1,5 px listés un par un et partis en A2.3.

**A1.3, l'appel vidéo (S-6).** La transition de `filter` visait le cadre, alors que c'est le portrait qu'on grise ou qu'on assombrit : chaque changement d'humeur coupait au lieu de fondre. Elle est sur le SVG. Le halo rouge flou de 90 px devient un anneau dur à l'épaisseur du tampon ; le jeton `--visio-halo-angry` est retiré, et `GAME-BRIEF.md` §5.10 le dit. Mesuré dans le navigateur : 120 ms après le passage à « cold », `main` affiche déjà le gris final, la branche est à mi-chemin. `hard-shadows.test.ts` refuse toute ombre floue dans les feuilles (jetons compris) et exige la transition sur l'élément dont le filtre change ; `motion.spec.ts` décroche un vrai appel et exige un `transitionrun` sur `filter`.

**A1.4 et A1.5, la typographie.** Les deux libellés de 10 px (le drapeau « HC », la tête de la borne) étaient des surcharges d'un jeton qui vaut 11 : retirées. Les tailles littérales lisent l'échelle : un pas existant quand le littéral en était à ½ px (13,5 → `--meta-md`, 12,5 → 13), un pas ajouté et nommé par son usage sinon (`--display-wordmark-sm`/`-lg`, `--display-section-lg`, `--display-loading`, `--size-score-suffix-*`, `--size-score-total`, `--body-lg-mobile`, et `--size-display-section` pour le titre du goulot qui rétrécit avec son conteneur). Le nom du bandeau d'espace prend son pas de 19 px sur téléphone (il était à 18) : mesuré sans débordement jusqu'à 320 px, dans les deux langues. `type-scale.test.ts` refuse une taille littérale hors des slides (A2.1) et toute taille sous 11 px, jetons compris. Deux exceptions nommées : le filigrane SVG du pied de page (unités du viewBox) et le crédit « Built by », en Inter 12 px sous le plancher de 13,5 px que l'échelle se donne, parti en question C23.

**A1.6 et A1.7.** `--width-mobile` et `--texture-spray-strong` sont retirés. `dead-tokens.test.ts` exige un lecteur pour chaque jeton déclaré, avec une liste d'attente motivée : les quinze `--viz-cat|seq-*` (A2.2), `--state-warn-text` (le milieu du triplet de statuts, mesuré) et `--surface-desk` (gardé hors d'usage exprès, L-10 ; sa garde ne compte plus un fichier de test comme lecteur). Le message de chargement prend `--radius-button` (6 px était ce pas avant que le design I arrondisse l'échelle) ; trois pilules écrites en pixels passent sur `--radius-tag`, au rendu identique. `radius-scale.test.ts` refuse un rayon littéral au-dessus de 3 px.

**A1.8 laissé** (facultatif, hors contrat) : à 320 px, la seconde ligne du bandeau d'entrée au jeu fait ≈ 270 px de texte pour une colonne de 228. Pas gratuit : parti en veille (section E).

**Non-vacuité** (comptes écrits dans chaque fichier) : chaque garde unitaire tombe sur son sabotage, et seulement lui (le bord de 4 px et un `2px solid` remis ; le halo remis, puis la transition remise sur le cadre ; `--width-mobile` remis ; un `font-size: 10px` remis, puis `--meta-2xs` à 10 px ; le rayon de 6 px remis). Côté navigateur, l'état d'avant sert de sabotage : contre le build de `main`, les quatre nouveaux tests de `targets` et le nouveau de `motion` tombent (bande de 31,75 px, pas de survol, `box-shadow` seul au décroché). Un build sans le `::before` fait tomber exactement les trois tests du moteur, sur des bandes de 31,75, 31,75 et 29,75 px.

**À l'écran**, `main` contre la branche, FR et EN, 1 280 et 390 px : le levier d'« Et si », la fiche d'activation, la borne et le profil du résultat, le bandeau d'entrée au jeu, l'appel (forcé en colère : l'anneau), la frise, le journal et le rapport du trimestre, le sélecteur de ton, l'écran d'attente, et le survol de « Glossaire » dans l'en-tête.

**Pas fait ici** : le bundle design-sync n'a pas été reconstruit. Le convertisseur (`.ds-sync/`) n'est pas dans une session cloud. L'aperçu `Button` gagne une histoire `Quiet`, son contrat et `conventions.md` sont à jour : reconstruction et validation en B3. Relecteurs non lancés, et pourquoi : ni route, ni proxy, ni payload, ni workflow (`relecteur-securite`), et aucune chaîne de copie ajoutée ou modifiée (`relecteur-copie`).

**Pièges** : un `pkill -f` dont le motif figurait dans sa propre ligne de commande a tué le shell (TESTING.md §4 le disait) : tuer par PID. Et `rsync` n'est pas installé dans le conteneur : copier la branche vers une copie de construction par `tar`.

**Vérifié** : lint et `tsc` propres, **2 235 tests unitaires** (+15, les cinq gardes), couverture au-dessus de ses seuils, `next build` propre avec `GAME_ENABLED=true`, **592 specs Playwright** (+5 : 587 passées, 5 ignorées par construction, aucun échec, sans reprise). CodeQL a relevé dans la PR un échappement incomplet dans la regex de `dead-tokens.test.ts` (seul le tiret était échappé) : corrigé, tous les métacaractères le sont.

**En production** : PR [#186](https://github.com/ScratchMe/tourdegrowth/pull/186), mergée le 2026-09-29 (squash `e9508b2`, 66 fichiers, identique à la tête de la PR), servie à 17 h 56 UTC. Relevé par HTTP sur les trois feuilles servies par `/en`, `/fr`, `/r/sample` (FR et EN) et `/quiz`, toutes en 200 : présents `--border-width-stamp:3px`, `--border-width-hairline:1px`, `--border-solid:var(--border-width) solid`, `--display-loading`, `--size-display-section`, la bande `::before` du `quiet` sur `--hit-min` et son survol à `--text-body` ; absents `--width-mobile`, `--texture-spray-strong`, `font-size:10px`, `2px solid var(` et `2px dashed var(`. Le moteur et le jeu restent en 404, fermés derrière leur drapeau. La mesure au navigateur sur la production n'a pas pu se faire d'ici : le Chromium de Playwright refuse le certificat du proxy de sortie, et on ne désactive pas la vérification.

## Les suites d'A1, tranchées par Antoine (2026-09-29)

**La demande** : les points laissés par A1, expliqués avec des options et une recommandation chacun (hors design-sync, qu'Antoine traite lui-même). **Réponse d'Antoine : « je suis OK avec toutes tes recos »**, le 2026-09-29.

**Une reco a changé en la mesurant, avant qu'il la lise.** Pour le crédit « Conçu par Antoine Berthaud, Senior Growth PM » (C23), j'avais proposé le mono 12 px. Mesuré sur le build : en mono, le crédit passe sur deux lignes à 390 px, alors qu'il tient sur une en Inter 12. La reco est devenue « garder le rendu, en faire un pas nommé de l'échelle ».

**Les décisions, et ce qui est livré ici :**
- **C23, le crédit** : `--body-credit` (Inter 500 12 px/1,4) dans l'échelle, lu par `.builtByCredit`. Rien ne bouge à l'écran. En l'écrivant, le plancher de 13,5 px d'Inter s'est révélé avoir déjà une exception : le bouton compact (`--label-button-sm`, 13 px). Le commentaire de l'échelle nomme les deux, et `type-scale.test.ts` exige exactement cette liste (non-vacuité : `--body-sm` passé à 13 px le fait tomber, sur ce seul jeton). C23 sort de `CHANTIERS.md`.
- **A2.3, les traits hors jeton** :
  - les deux traits de 1,5 px du bandeau d'espace deviennent `--border-width-fine`, argumenté dans `shape.css` (traits clairs sur fond sombre : à 2 px ils paraîtraient plus lourds qu'un bord sur papier). Même valeur, rien ne bouge ;
  - le bord de 2,5 px de la borne reste un paramètre local du composant, comme sa largeur, et le dit ;
  - la case « inconnu » du peloton est rattachée à A2.2 (elle prendra le trait de `DotGrid`) ; c'est la dernière ligne de la liste de `border-width.test.ts`.
- **Le bandeau d'entrée au jeu** : à 360 px (une largeur Android courante), le français passait sur trois lignes, « pas sur ton / dashboard » coupé en deux et la case vide réduite à 16 px. Une requête de conteneur ramène les marges latérales à 12 px quand la carte fait moins de 320 px : deux lignes à 360 px dans les deux langues (56 px, case à 17 px). 320 px reste sur trois lignes, par décision : seule une copie plus courte le tiendrait. Un e2e l'exige à 360 px en français ; contre le build de `main`, il tombe (74 px).
- **A2.1, les slides** : le plancher de 18 px est confirmé ; un tableau qui ne tient pas se coupe en deux slides. Écrit dans la ligne d'A2.1, rien à coder ici.
- **Les choix faits en route par A1, validés** : trimestre en cours 5 → 3 px et bord du DG en colère 4 → 3 px dans le jeu, nom de l'espace à 19 px sur téléphone, actions texte du moteur sur le bouton `quiet`.

**Vérifié** : lint et `tsc` propres, **2 236 tests unitaires** (+1), couverture au-dessus de ses seuils, `next build` propre avec `GAME_ENABLED=true`, **593 specs Playwright** (+1 : 588 passées, 5 ignorées par construction, aucun échec, sans reprise). À l'écran : le bandeau à 320, 360 et 390 px en français et en anglais ; le crédit mesuré à 360, 390 et 1 280 px (une ligne à 390, inchangé).

**En production** : PR [#188](https://github.com/ScratchMe/tourdegrowth/pull/188), mergée le 2026-09-29 (squash `f62469d`, 13 fichiers, identique à la tête de la PR), servie à 18 h 55 UTC. Relevé par HTTP sur les feuilles servies par `/en` et `/fr` : présents `--border-width-fine:1.5px`, `--body-credit:500 12px/1.4 var(--font-ui)` et la requête de conteneur `game-entry (max-width:319px)` qui ramène les marges du bandeau à `--space-5`.

## A6 : le premier relevé chiffré (2026-09-29)

**La demande** : le lot A6 de `CHANTIERS.md`, tout ce que la session peut lire seule par `stats.yml` (portées `admin` et `gsc`), sans qu'un chiffre entre dans le dépôt. Deux runs lus : `both`, puis `admin` seul pour relancer la fenêtre « All-time ». Clé `age` créée dans le scratchpad de la session, jamais commitée ; les rapports déchiffrés y sont restés.

**A6.1, les événements d'A4 dans le vrai GoatCounter.** La section funnel porte bien les trois champs attendus, dans les deux fenêtres : `landingReturn` et `valueActionsPerResult` sont présents (des vrais retours sur l'accueil ont été comptés), `retakeStarted` est présent mais pas encore déclenché : personne n'a refait son Tour. Le point de la table « ce qui reste ouvert » de `CLAUDE.md` est retiré.

**Au passage, `take_own_tour` absent depuis le début.** C'était le seul événement du funnel à zéro sur toutes les fenêtres, avec `retake_started`. Vérifié que ce n'est pas l'envoi : Firestore ne compte aucune soumission arrivée par un lien partagé (`referredSubmissions`, `kFactor` et `conversionPerShare` absents eux aussi), et `visitor-cta.spec.ts` exige l'événement au clic. Les deux sources concordent : c'est le volume, pas l'instrumentation.

**A6.2, Search Console.** Les anciennes adresses `/glossary/*` (d'avant R-13) sont encore créditées sur 28 et 90 jours, les `/fr/glossary/*` le sont aussi, et aucune `/en/glossary/*`. Côté site, tout est en place, vérifié en production le même jour : la 308 de `/glossary/aarrr` vers `/en/glossary/aarrr`, la canonique, `hreflang` en, fr et `x-default` sur `/en/`, et un sitemap qui ne liste aucune adresse non préfixée. C'est donc Google qui garde l'ancienne adresse comme représentante, pour l'anglais seulement. Rien à coder ; le geste qui tranche est dans Search Console : geste **D8** de `CHANTIERS.md` (inspection de l'URL, lire la canonique choisie par Google, demander l'indexation).

**A6.3, les déclencheurs de volume.** Ni les 50 soumissions, ni quelques centaines, ni aucun signe d'abus. Rien ne s'ouvre dans la section E.

**La fenêtre « All-time » a renvoyé une 404 de GoatCounter** au premier run, comme le 2026-09-14. Relancée seule quelques minutes plus tard, elle répond. Deux occurrences, deux fois passée à la relance : c'est une réponse passagère de leur API sur la plus longue fenêtre, pas notre code. La règle « relancer avant d'enquêter » tient, et elle est maintenant dans la ligne « Lecture des stats » de `CLAUDE.md`, pas seulement ici.

**Ce qui change dans les documents** : A6 sort de `CHANTIERS.md` (la section A passe à quatre lots), la section E dit qu'un relevé mensuel suffit et renvoie à la méthode, D8 s'ajoute. Dans `CLAUDE.md`, la ligne des événements d'A4 est retirée et celle de la lecture des stats mise à jour.

## D1 : les réglages du dépôt, vérifiés et clos (2026-09-29)

**La demande** : la section D de `CHANTIERS.md`, pas à pas avec Antoine (prompt D). Première action choisie : D1.

**Ce que l'API disait avant le moindre clic** (`GET /repos/ScratchMe/tourdegrowth`) : `has_projects` et `has_discussions` déjà à `false`, la description et les neuf topics de `GROWTH-PLAN.md` 0.2 en place. `CHANTIERS.md` écrivait pourtant « Activés » à la ligne C18, le matin même : un document dit ce qui était vrai quand il a été écrit (convention 10). Antoine a confirmé à l'écran (Settings → General → Features).

**Le seul geste** : la page d'accueil du dépôt pointait vers l'apex `https://tourdegrowth.com`, qui répond en 308 vers `www`. Antoine l'a passée à `https://www.tourdegrowth.com`, l'adresse que prévoyait 0.2. Relu par l'API après coup.

**Retiré de `CHANTIERS.md`** : D1, et C18, sans objet puisque l'état recommandé était déjà en place et qu'Antoine l'a validé. La section C passe à 21 questions. La ligne « Hygiène de dépôt public » de `CLAUDE.md` n'a plus rien côté Antoine.

**Pas vérifiable d'ici, pour D7** : si le profil github.com/ScratchMe affiche un nom. L'API des profils est refusée à une session cloud, bornée aux routes du dépôt. Antoine le regardera avant la vague 4.

## La coupure de journal et la citation du DG ne sont plus des pilules (2026-09-29)

**Trouvé par la design sync, pas par un test.** En notant les aperçus avant l'envoi vers Claude Design (section B de `CHANTIERS.md`), la coupure de journal du jeu (`EventClipping`) est apparue en **ellipse** : ses paragraphes débordaient sur le fond de nuit, illisibles. Cause : le design I (#177) a passé `--radius-tag` de 4 à 999 px, et trois boîtes de plusieurs lignes le lisaient encore, la coupure et les deux encadrés de citation du DG (`.boss` de `QuarterNews` et de `QuarterReport`), devenus des pilules. Le jeu est fermé derrière son drapeau : personne ne l'a vu en public.

**Le correctif** : les trois prennent `--radius-panel` (14 px), le rayon que l'échelle donne aux boîtes de texte (options de réponse, cartes d'analyse, popovers). Un choix de tech lead, la maquette I ne dessinant pas la coupure ; il se réverse en une ligne. Les autres usages de `--radius-tag` ont été relus un par un : étiquettes, segments, pistes de jauge, tampons (« Amende · 106 000 € », le verdict du trimestre), tous d'une ligne, la pilule y est voulue.

**La garde** compte ce qui est à l'écran, pas des noms de classes (convention 11) : `multiLinePills` (`e2e/helpers.ts`) relève toute boîte peinte dont le plus petit rayon atteint la moitié de son petit côté et dont le texte tient sur plus d'une ligne (des fragments de texte regroupés par recouvrement vertical, pour qu'une ligne tournée de 1° reste une ligne). `game-news.spec.ts` la passe sur chaque carte du trimestre de l'inspection et sur son rapport, à 1 280 et 390 px, et exige qu'elle ait vu des pilules (les tampons), pour qu'elle ne passe pas à vide.

**Non-vacuité**, écrite dans le spec : la pilule remise sur la coupure seule fait tomber ce seul test (7 autres passent), qui nomme la coupure sur les cartes 3 et 4 et dans le rapport, aux deux largeurs (jusqu'à 22 lignes dans une pilule) ; remise sur les deux encadrés seuls, il tombe seul aussi et nomme la carte 5 et le rapport.

**À l'écran**, FR et EN, 1 280 et 390 px : la coupure de l'inspection, celle du fil viral, la citation du DG et le rapport du trimestre 3.

**Piège** : un worktree dont `node_modules` est un lien symbolique vers le clone principal fait paniquer Turbopack (« Symlink [project]/node_modules is invalid, it points out of the filesystem root »). Une copie en liens physiques (`cp -al`) passe, instantanée et sans place disque.

**Vérifié** : lint et `tsc` propres, **2 236 tests unitaires**, couverture au-dessus de ses seuils, `next build` propre avec `GAME_ENABLED=true`, **594 specs Playwright** (+1 : 589 passées, 5 ignorées par construction, aucun échec, sans reprise). Relecteurs non lancés : ni route, ni proxy, ni payload, ni workflow, ni copie.

## La séance des décisions : les vingt-deux questions de la section C (2026-09-29)

**La demande d'Antoine** : faire trancher, une par une, les décisions de la section C de `CHANTIERS.md`, sans écrire de code. Chaque question est vérifiée ouverte avant d'être posée ; les questions de design sont posées avec une capture du vrai écran ; chaque réponse est consignée tout de suite, datée, là où vit la question ; le code devient un item A, un geste d'Antoine un item D.

**Ce qui est tranché** (l'index complet est dans `CHANTIERS.md` C, le raisonnement là où vit chaque question) :
- **Le moteur change de périmètre** (C4) : le B2B assisté entre dans la v1. Le réglage sépare le type (SaaS B2B) de la motion (PLG, SLG, cochables, au moins une), et l'hybride se rend en « deux moteurs, un total », jamais en face-à-face. L'idée des deux motions cochables est d'Antoine ; la session a proposé le rendu. L'ouverture du moteur attend désormais la spécification, sa validation, le code et le bon à tirer (A7.3).
- **Aucun repère ne désigne plus la fuite** (C1) : seule une cible d'équipe. La carte correspondante du bon à tirer nº8 n'avait aucune décision ; elle en porte une maintenant.
- **« Moteur de growth »** (C2), à la même adresse. Antoine a délégué l'adresse sur le seul critère SEO. Les résultats de recherche du jour montrent que « AARRR funnel template » est occupé par des diagrammes et des modèles de slides (Miro, Creately, Ayoa), sans aucun outil qui calcule : la formule « sans concurrent » voulait dire « sans outil concurrent ».
- **Quatre recommandations de `CHANTIERS.md` revues en séance** sur des faits neufs, et suivies par Antoine :
  - la slide fuite d'une étape sans prix existe, car un titre vrai existe sans montant (C9) ;
  - l'encart du jeu passe sous le bouton principal : mesuré, il le faisait descendre de 350 px, pas de ~30 (C10) ;
  - « un mois de chiffres » ne dira rien sous 50 soumissions ;
  - l'invitation « Fais le Tour » du miroir menait à une impasse, faute de pouvoir relier un Tour après la carte de départ (C8).
- **Trois recommandations non suivies** : le partage devient le primaire du propriétaire (C16), le Tour reste au seul SEO (C20), et les captures sont prises dès maintenant (C21).
- **Deux délégations** : l'adresse du moteur (C2), et la porte de test (C17), tranchée par la session. Pas de porte dans le code : l'émulateur Firestore, que `firebase-admin` lit nativement.
- **C6 ouvre une question de fond** : Antoine tient l'instrument d'audit pour un doublon du moteur public, auquel il croit davantage. Le sort de l'audit se décide sur la mission de la phase 1 bis, avec une colonne « le moteur le faisait déjà ? » dans le journal des frictions (`AUDIT-PLAN.md` §4). Les trois clauses du contrat à relire sont précisées en D5.
- **C22 précise l'option A du 13/09** : la réserve « jamais le nom, jamais LinkedIn » est une question de calendrier, pas d'anonymat. La réponse à « qui est derrière ? » nommera Antoine. Seule la décision est écrite dans le dépôt, pas ses raisons.
- **C18 n'a pas été posée** : l'API GitHub donne déjà `has_projects: false` et `has_discussions: false`. La session D l'a constaté et clos en parallèle (entrée précédente), avec D1. Une question neuve est née de C4, l'ordre des lancements (C23), laissée ouverte.

**Hors de la section C** : Antoine a proposé en cours de séance le plug-in « claude-site-audit » (Rob Spence, MIT). Il a été **lu, pas installé** : l'archive ne contient pas ses 17 contrôles, sa notation ni son générateur de PDF ; il appelle des outils de claude.ai ; il est cadré pour le secteur public américain ; et il n'a pas de fichier de licence. L'idée est gardée : l'angle GEO n'avait jamais été audité ici (pas de `llms.txt`, robots d'IA non traités). Cela devient A8.

**Pièges de la séance** :
- **Le conteneur a redémarré deux fois** en cours de séance. Les fichiers non commités ont survécu, mais pas le serveur local. D'où un commit poussé après chaque groupe de réponses, et une seule PR à la fin.
- **`/r/sample` ne rend jamais la vue propriétaire**, parce que la branche échantillon ne passe pas d'identifiant à `ResultView`. Aucun e2e ne rend donc cette vue. Pour la capturer, il a fallu un build jetable dans un worktree hors du dépôt, avec `id="sample"` ajouté, jamais commité, puis supprimé. C'est l'argument concret de A7.11.
- **Turbopack refuse un `node_modules` en lien symbolique hors de la racine** du projet (« Symlink [project]/node_modules is invalid, it points out of the filesystem root »). Pour un worktree jetable, il faut une copie en liens physiques : `cp -al node_modules <worktree>/`, sur le même système de fichiers.
- **Les captures du Tour** (`marketing/assets/`) datent du 2026-09-14, d'avant la synthèse I + B. Les annuaires de D10 attendent qu'elles soient refaites (A7.12.a).

**Vérifié, et comment** : l'état de chaque question dans le code avant de la poser (`catalog-shape.ts`, `example.ts`, `Setup.tsx`, `Board.tsx`, `deck.ts#buildLeak`, `levels.ts#gameEntryFor`, `retention.ts`, `SiteFooter.tsx`, `SpaceBand.tsx`). Les écrans, sur un build de production local avec `GAME_ENABLED` et `ENGINE_ENABLED` : l'accueil, le tableau du moteur (miroir relié et non relié), `/r/sample` en visiteur et en propriétaire, à 1 280 et 390 px, et le hub du jeu. Les positions sont mesurées par script, pas estimées. Les réglages du dépôt, par l'API GitHub. La base du bon à tirer nº8 a été lue avant d'y écrire.

## A2 : les slides à 18 px, et une seule grille de points (2026-09-29)

**La demande** : le lot A2 de `CHANTIERS.md` (constats S-8 et S-10 de l'audit du kit), en autonomie, une PR.

**Re-mesuré d'abord**, sur le build de `main`, chaque slide de l'exemple §6.0 avec le miroir et les huit leviers bougés : cinq éléments sous 18 px (le pied des slides « Et si » à 15 px, les en-têtes de leurs tableaux à 14, l'écart de levier à 16, et l'annexe entière à 15, ses dix-sept lignes serrées pour tenir sur une page). Puis la même mesure avec tout forcé à 18 px : les slides « Et si » tiennent, la slide « ensemble » passe 93 px sous son pied (FR), l'annexe court jusqu'à 1 211 px sur une page de 1 080. Les grilles : 210 px au peloton, 190 à « Et si », 200 sur la slide, chacune avec ses traits.

**A2.1, l'échelle des slides.** Les 23 tailles écrites à la main sont des pas de `--slide-*` : `--slide-numeral` à 92 (le 104 d'avant n'était jamais rendu, ses deux lecteurs le surchargeaient), `--slide-figure`, six pas de libellé (`-xs` à `-xl`), `--slide-body-xs`, `--slide-figures` (les tableaux « Et si »), `--slide-caption`, `--slide-note`, `--slide-table` passé de 17 à 18, `--size-slide-wordmark`. Aucun n'est sous 18 px.
- **La slide « ensemble »** : les hypothèses du modèle sont de la prose ; elles passent en Inter 18 (`--slide-note`) sur toute la largeur que la signature laisse, et la signature s'empile sur deux lignes dans ce pied-là seulement. Les en-têtes des tableaux prennent la moitié de l'interlettrage des slides, pour que « Avec les « Et si » » tienne sur une ligne. Avec huit leviers et sept hypothèses, 28 px séparent maintenant le corps du pied, contre 15 avant.
- **L'annexe se coupe, elle ne rétrécit plus** (règle d'Antoine du 2026-09-29). La coupe est celle du modèle, avant tout rendu, pour que l'écran, le PDF, le PNG et le texte copié comptent les mêmes pages : `lib/engine/annex-pages.ts` estime la hauteur de chaque ligne en enroulant ses mots aux largeurs des colonnes (des glyphes comptés larges, une espace insécable qui ne coupe pas), prend le plus petit nombre de pages qui tiennent, puis les équilibre. L'exemple fait deux pages (8 et 9 lignes) ; le pire cas, toutes les définitions à 200 caractères, en fait six, chacune au-dessus de son pied. Les pages sont `annex`, `annex:2`…, une seule case « inclure » pour toutes. Le catalogue ne tient jamais sur une page à 18 px, donc le titre porte toujours la page : « Définitions et sources ({i}/{n}) », à relire (convention 6). La colonne « Confiance » passe de 8 à 10 % (« CONFIDENCE » coupait en deux à 18 px), prise sur la formule.
- **Gardes** : `type-scale.test.ts` n'exclut plus les slides, exige un pas `--slide-*` pour toute taille de slide et refuse un pas sous 18 px ; `annex-pages.test.ts` tient les largeurs contre la feuille, l'exemple sur deux pages équilibrées, le pire cas, et le fait que l'annexe ne tient jamais sur une page. En e2e : la plus petite taille rendue de chaque slide (plus de 200 éléments mesurés), le pire cas de l'annexe avec l'export PNG de sa dernière page, et le plancher ajouté au test « tous les leviers bougés ».

**A2.2, `viz/DotGrid`.** Un composant (`DotGrid`, et `DotLegend` pour les légendes) que composent le peloton, le panneau « Et si » et la slide peloton. Deux tailles : `screen` (200 px, 118 sur téléphone) et `slide` (200 px, le trait plus épais des slides). Les traits sont des proportions du bord du système (`--border-width`) : ¾ pour un contour, deux fois pour l'anneau d'un inscrit recommandé, une fois pour un point gagné ou perdu, à chaque taille. Les trois feuilles ne gardent que le placement de leurs grilles. La case « inconnu » du peloton prend le trait de la grille : `border-width.test.ts` n'a plus aucune exception. Aperçus design-sync écrits (trois histoires chacun) et composants ajoutés à `componentSrcMap`.
- **Les quinze jetons `--viz-cat-*` et `--viz-seq-*` sont retirés**, comme le lot demandait de trancher. Aucun écran ne les lisait depuis le DS v3, la doctrine du système nomme les étapes au lieu de les colorer, et la grille dit un compte par une forme. Leurs valeurs et leurs mesures de contraste restent dans l'historique git : un graphique qui aurait besoin d'une série nominale ou d'une intensité les reprend de là, avec leurs lignes de test. `colors.css`, `world-night.css`, `tokens.ts` et les deux tests de contraste suivent ; `conventions.md` le dit à Claude Design.
- **Gardes** : `dot-grid.test.ts` (le balisage : un point par marque, le panneau inconnu sans point, la mise en rouge refusée à un inconnu ; puis « une seule grille dans le système » : seul `DotGrid.tsx` dessine un point, seule sa feuille pose une grille de dix colonnes, et les trois vues le composent). En e2e, à 1 280 et 390 px, les grilles d'« Et si » ont la taille et le point du peloton.

**Non-vacuité.** Unitaires, par sabotage (comptes écrits dans chaque fichier) : le `font-size: 15px` de l'annexe remis fait tomber deux tests de `type-scale`, `--slide-table` remis à 17 en fait tomber un ; la grille locale de la slide remise fait tomber « seul DotGrid dessine un point », une grille de dix colonnes remise dans le peloton fait tomber l'autre. Navigateur, contre le build de `main` : les six tests d'A2.1 tombent (l'annexe à 15 px, le pied à 14, pas de page 2), et « même taille » tombe à 1 280 px (210 contre 190 ; à 390 px les deux faisaient déjà 118).

**À l'écran**, FR et EN, 1 280 et 390 px : le peloton et le panneau « Et si » (grilles, légendes, panneau inconnu, anneaux), et en PNG à taille réelle la slide peloton, la slide « ensemble », les deux pages de l'annexe et une page du pire cas.

**Vérifié** : lint et `tsc` propres, **2 211 tests unitaires** (46 lignes de contraste parties avec les quinze jetons, 21 tests ajoutés), couverture au-dessus de ses seuils, `next build` propre avec `GAME_ENABLED=true`, **599 specs Playwright** (+6 : 594 passées, 5 ignorées par construction, aucun échec, sans reprise).

**Piège** : un premier passage complet avait 4 échecs et 87 specs ignorées. Le serveur de test avait été lancé sans `GAME_ENABLED=true` : le build le portait, pas le `next start`, et le drapeau du jeu se lit à l'exécution. Relancé avec le drapeau, comme la CI : vert.

**Pas fait ici** : le bundle design-sync n'est pas reconstruit (le convertisseur n'est pas dans une session cloud) ; B3 de `CHANTIERS.md` dit ce qu'il doit emporter. Relecteur de copie lancé sur le titre d'annexe ; relecteur de sécurité non lancé : ni route, ni proxy, ni payload, ni workflow.

**En production** : PR [#194](https://github.com/ScratchMe/tourdegrowth/pull/194), mergée le 2026-09-29 (squash `2e2977c`, 39 fichiers, identique à la tête de la PR après deux fusions de `main`, #190/#192 puis #193, qui n'avaient touché que des documents et une feuille du jeu), servie à 21 h 11 UTC. Relevé par HTTP sur les feuilles servies par `/en` : présents `--slide-note:500 18px/1.4`, `--slide-caption:500 20px/1.45`, `--slide-table:500 18px/1.35`, `--slide-numeral:700 92px/.9` ; absents `--viz-cat-1` et `--viz-seq-1`. Le moteur reste en 404, fermé derrière son drapeau. **Piège** : la PR est restée sans CI tant qu'elle était en conflit avec `main`. GitHub ne lance pas un `pull_request` qu'il ne peut pas fusionner, et rien ne le signale sur la PR, sauf `mergeable_state: dirty`. Trois autres sessions mergeaient en même temps.

## A3 : le badge README, le partage avec l'image, l'exemple roast (2026-09-29)

**La demande** : le lot A3 de `CHANTIERS.md`, la vague 3 de `GROWTH-PLAN.md`, en autonomie, une PR.

**A3.1, le badge.** `GET /r/<id>/badge/<jeton>.svg` : « Tour de Growth · 74/100 », dans le style shields, blanc sur encre et blanc sur le rouge fait pour le petit texte blanc (les jetons de l'image de partage). Il dit le total et rien d'autre, la règle de l'image de partage. Il ne porte ni étape, ni ton, ni identifiant, ni lien, ni script, ni police : le texte est en Verdana, ajusté par `textLength` à une largeur mesurée ici, pour qu'une police de substitution ne déborde pas.
- **Une adresse versionnée**, comme l'image de partage (`VERCEL.md` §1.8) : un résultat ne change jamais de total, donc le jeton courant est servi `immutable` un an, et une vue répétée ne coûte rien à l'origine (`FIRESTORE.md` §1.3). Un jeton plus ancien répond avec le badge courant, gardé une heure ; un README ne se corrige jamais pour nous suivre. L'identifiant est validé avant toute lecture ; le budget de lecture du proxy couvre la route, comme la page et l'image.
- **Pas de CSP propre à la route** : `next.config.mjs` pose `frame-ancestors 'none'` sur toute réponse, et cet en-tête remplace celui d'une route du même nom (mesuré en e2e). Y toucher franchirait la barrière §0 de `/livrer`. Le SVG n'est construit qu'à partir d'un nombre, et `nosniff` le garde image.
- **Chez le propriétaire seulement**, sous la carte de partage : le badge, la ligne Markdown à sélectionner à la main, et « Copier le Markdown ». L'événement `badge_copied` compte la copie ; il a sa ligne dans `/admin/stats` et n'entre pas dans le ratio « actions de valeur par résultat », dont la définition (REVIEW-03 A4) ne change pas en silence. Copie neuve « à relire », le texte du badge compris.
- **Le budget de contenu** (`content-fan-in.test.ts`) a arrêté la première version : la route importait `sample.ts` pour le total de l'échantillon, et tirait la bibliothèque de verdicts dans une fonction de plus. Les chiffres fixes de l'échantillon vivent maintenant seuls dans `sample-result.ts`.

**A3.2, le partage avec l'image.** Là où `navigator.canShare({ files })` le permet, « Partager ce résultat » envoie l'image de partage elle-même, avec le lien dans le texte (une cible qui reçoit un fichier laisse souvent tomber `url`). Sinon, le partage du lien, comme avant. Le fichier se prépare quand le bloc approche de l'écran, au moment où sa propre `<img>` paresseuse charge la même adresse immuable : la requête touche le cache, et un lecteur qui ne descend pas jusque-là ne paie rien. Il est prêt avant le geste parce que Safari refuse la feuille de partage si un `await fetch` s'intercale entre le geste et `navigator.share`. Le funnel distingue `share/<ton>/image` de `native` et `copy`, et les compte tous trois comme des partages.

**A3.3, l'exemple roast.** `/r/sample?tone=roast` : l'échantillon ouvert sur son verdict roast, avec sa propre carte de partage, dans la page et en `og:image`. La route d'image reconnaît les jetons des deux tons pour l'échantillon, et tout autre ton donne l'échantillon neutre. **Pas de copie neuve** : le verdict roast de l'échantillon vient de la bibliothèque existante, comme tout vrai résultat roast. **Parti en C24** : faut-il que « Voir un exemple » de la landing suive son sélecteur de ton ? La reco est oui.

**Gardes.** En unitaires :
- `badge.test.ts` : le badge ne dit que le total, ce n'est qu'une image, ses couleurs viennent des jetons, `textLength` est posé, et son jeton suit le dessin ;
- `badge-snippet.test.ts` : le balisage du bloc, et son câblage (propriétaire seulement, jamais sur l'échantillon) ;
- les partages `image` et le compte du badge dans le funnel ;
- les jetons de l'échantillon roast.

En e2e, `growth-loop.spec.ts` couvre :
- la route du badge : SVG immuable, adresse ancienne gardée une heure, 404 ;
- le partage qui emporte le fichier, et son repli par lien ;
- l'exemple roast, dans la page, en `og:image` et au partage.

Le test d'ordre de lecture du résultat se repère désormais sur l'enveloppe du bloc de partage, qui porte la carte et le badge.

**Non-vacuité.** Unitaires, un sabotage par test, chacun tombant seul : `textLength` retiré, le jeton haché sur la seule version, un lien glissé dans le SVG, `isOwner &&` retiré de la condition, un `badge` passé dans la branche de l'échantillon. Navigateur, contre le build de `main` d'avant A3 : les quatre tests qui portent A3 tombent. Les deux qui passent gardent ce qui reste : le partage par lien quand aucun fichier n'est pris, et l'échantillon neutre sous un autre ton.

**Barrière `/livrer` §0** : ni dépendance ni réglage de build, aucun fichier non-code sous `src/`. La route du badge tombe dans le même groupe de fonction que celle de l'image de partage (API, même arbre de layout, même configuration, `VERCEL.md` §1.3). Mesuré sur les `.nft.json` du build : elle n'ajoute que 16,4 Ko de fichiers que sa voisine ne tirait pas déjà, pour un seuil d'environ 1 Mo. La CLI Vercel n'est pas dans la session, d'où cette mesure plutôt que celle de §1.2.

**Relectures.**
- **Sécurité** : rien de bloquant. Un durcissement appliqué : le total arrive de Firestore sans validation, et c'est le premier champ stocké à devenir du balisage sur notre origine, gardé un an. `renderBadgeSvg` refuse donc tout ce qui n'est pas un entier de 0 à 100, et la route répond 404 (test et sabotage). Deux points partent en veille (section E) : une demande d'effacement doit aussi purger le cache CDN de `/r/<id>/*` (c'était déjà vrai pour l'image de partage depuis le 2026-09-14), et des badges en 429 derrière camo, à mesurer avant d'agir.
- **Copie** : conforme, avec une correction : le texte du badge lui-même porte maintenant son marqueur « à relire », comme l'étiquette d'espace de l'image de partage.

**Vérifié** : lint et `tsc` propres, **2 227 tests unitaires** (+16), couverture au-dessus de ses seuils, `next build` propre avec `GAME_ENABLED=true`, **606 specs Playwright** (+6 : 601 passées, 5 ignorées par construction, aucun échec, sans reprise ; la garde du total, ajoutée après ce passage, a été rejouée avec les specs du partage : 19 sur 19).

**À l'écran.** L'exemple roast, en FR et en EN, à 1 280 et 390 px : la pastille « Roast mode », le verdict roast de la bibliothèque, la carte de partage dans son cadre roast, et aucun défilement horizontal. L'extrait du propriétaire ne peut pas se rendre en e2e, faute de Firestore (C17 : l'émulateur arrivera en A7.11). Il a donc été vu dans un build jetable, jamais commité, où l'échantillon reçoit un badge et où la condition « propriétaire » est levée : FR et EN, 1 280 et 390 px. Résultat : ni défilement horizontal, un badge lisible, et le bouton qui copie, dit « Markdown copié » et envoie `badge_copied`.

**En production** : PR [#195](https://github.com/ScratchMe/tourdegrowth/pull/195), mergée le 2026-09-29 (squash `93bf1f4`, 25 fichiers, identique à la tête de la PR), servie à 21 h 32 UTC. Relevé par HTTP : le badge de l'échantillon à son adresse courante répond en SVG, `immutable`, `nosniff`, et `HIT` au second appel ; `/r/sample?tone=roast` déclare en `og:image` une adresse distincte de celle du neutre, qui répond en PNG 1 200 × 630 dans le cadre roast.

## A4 : ce que la plateforme fait à notre place (2026-09-29)

**La demande** : le lot A4 de `CHANTIERS.md`, les remplacements natifs pointés par l'audit du kit (§6), en amélioration progressive, une PR.

**Re-mesuré d'abord** : aucun des douze n'était dans `src/` (`grep`), et la modale des nouvelles n'avait pas `text-wrap: pretty` (aucune de ses règles de texte). Le support de chaque fonction a été lu sur webstatus.dev avant de l'écrire ; chacune a sa condition (`@supports`, ou un repli qui est l'ancien comportement), et chaque animation neuve est sous `prefers-reduced-motion: no-preference`.

**Ce qui est livré**, item par item :
- **Monde nuit** : `color-scheme: dark` sous `[data-world="night"]`, `light` sous le papier qui s'y niche. Barres de défilement et contrôles natifs suivent le monde.
- **Deck** : `content-visibility: auto` sur les vignettes, forcé à `visible` à l'impression. Une levée pendant l'export PNG a été écrite, puis **mesurée inutile** : html-to-image dessine une copie, et une slide exportée de très loin hors écran sort identique à l'octet à la même exportée à l'écran. Retirée.
- **Tampons** : les inclinaisons au repos passent à `rotate:`, et les keyframes `stamp` et `slam` n'animent plus que `scale` / `rotate` / `opacity`. Une keyframe partagée se compose avec l'inclinaison propre d'un tampon au lieu de l'écraser.
- **`motion.css`** : `--ease-stamp` en `linear()`, le cubic-bezier du brief échantillonné, et son dépassement dans un seul jeton, `--stamp-overshoot` (5,3 %, à mi-course, comme la courbe d'origine).
- **`Disclosure`** : l'accordéon glisse, sans script (`::details-content` et `interpolate-size`, Chromium). La fermeture garde le contenu dessiné pendant qu'il se replie.
- **`StageTabs`** : la fiche d'une ligne repliée reste dans la page, `hidden="until-found"`. Ctrl+F trouve un mot dedans et `beforematch` ouvre la ligne. React écrit tout `hidden` en booléen, donc l'attribut est posé sur l'élément, dans un effet de mise en page. Une fiche porte un brouillon : repliée, elle est redessinée à chaque changement du moteur et à chaque repli. Ouvrir une ligne montre donc toujours ce qui est enregistré, comme quand la fiche était démontée.
- **Barres collantes** : l'en-tête du site ne tire son filet qu'une fois la page défilée dessous, et la barre des nouvelles un filet en haut tant que la carte continue dessous (`scroll-state`, Chromium 133). Une requête `scroll-state` ne stylise pas l'élément qu'elle interroge, mais ses pseudo-éléments oui (mesuré) : la bordure garde sa place, transparente, et rien ne bouge d'un pixel. La barre d'action du jeu garde sa bordure : c'est le bord de son panneau, pas un filet.
- **Onglets du moteur** : quand la bande défile, une flèche au bord qui a encore des onglets, sur un fondu. Ce sont deux pseudo-éléments collants de la bande, qui rendent leur place par une marge négative. Un `scroll-padding` garde l'onglet choisi hors d'elles.
- **`QuarterNews`** : une seule sortie, la fermeture du dialogue. « Passer au bilan » est `command="request-close"`, la requête même d'Escape. Le dernier « Suivant » ferme avec la valeur `read`. Là où le bouton ne connaît pas `command`, son clic ferme le dialogue lui-même. Le fondu est une transition sur `open` (`@starting-style`, `display` et `overlay` en `allow-discrete`), plus de classe `closing`. La durée attendue avant de rendre la main se lit sur le dialogue, comme avant. Le texte des cartes est en `text-wrap: pretty`.
- **`Segmented`** : un seul remplissage pour la piste, sous l'option choisie, qui glisse de l'une à l'autre (ancrage et `anchor-scope`, Chromium 131). Les options, positionnées, se peignent au-dessus sans `z-index`. En compact, la pilule arrondit seulement son bout extérieur.
- **Glossaire** : `GlossaryTerm` ouvre un seul `DefinitionPopover`, placement `auto`, en couche supérieure (`popover="manual"`). Il était rendu deux fois, avec trois `z-index`. À partir de 641 px et là où l'ancrage existe, il pend sous son déclencheur. Sinon, c'est la feuille en bas d'écran, avec son ✕. Le focus y entre maintenant aussi sur téléphone.

**Deux pièges mesurés, et les choix qu'ils ont dictés** :
- **Le `::backdrop` d'un popover ne prend aucun clic** (Chromium 141 ; celui d'un dialogue modal, si). Un tap hors de la feuille serait passé à la page, par exemple à une réponse du quiz. Sur téléphone, le popover est donc l'écran entier, transparent, et la feuille une carte à l'intérieur : le tap tombe sur lui.
- **Une transition discrète lit encore son ancienne valeur à sa première frame.** Avec `content-visibility` en transition à l'ouverture, le contenu d'un accordéon qui s'ouvre refusait le focus pendant une frame, et un e2e qui focalisait le curseur « Et si » l'a montré. `content-visibility`, `display` et `overlay` ne transitent donc qu'à la fermeture. À l'ouverture, le contenu est là tout de suite, et seules la hauteur ou l'opacité bougent.

**Ce que l'e2e ne peut pas faire** : piloter Ctrl+F. En Chromium headless, ni `window.find()` ni un fragment de texte ne révèlent `hidden="until-found"`, même sur une page statique. Le test lit donc l'attribut, le texte présent, la hauteur nulle et ce que fait `beforematch`.

**Gardes.**

`e2e/platform-native.spec.ts`, quatorze tests :
- l'accordéon, qui glisse et dont le contenu est là dès la première frame, et sous mouvement réduit ;
- les lignes repliées trouvables ;
- le brouillon abandonné au repli ;
- les flèches des onglets, l'onglet gardé hors d'elles, la largeur de défilement inchangée ;
- le deck, l'export compris ;
- le filet de l'en-tête ;
- le remplissage de `Segmented`, avec le contraste du libellé mesuré sur le vrai remplissage dans les deux tons, qu'axe ne voit pas sous un pseudo-élément ;
- le popover en bulle et en feuille, tap extérieur compris ;
- la sortie des nouvelles et son repli sans `command` ;
- le monde nuit.

En unitaires :
- `individual-transforms.test.ts` : aucune inclinaison en `transform: rotate()`, les keyframes partagées, `linear()` et son jeton ;
- `quarter-news.test.ts` : la lecture de la durée ;
- `z-index.test.ts` : l'échelle ne garde aucune couche sans lecteur, `--z-popover` retiré ;
- `motion-scale.test.ts` : un jeton qui règle un autre jeton lu est vivant.

**Non-vacuité** : chaque sabotage fait tomber son test, sur un build :
- le bloc `@supports` de l'accordéon retiré ;
- la fiche rendue seulement ouverte ;
- le bloc `scroll-state` de l'en-tête retiré ;
- la marge négative des flèches retirée ;
- `command` et le repli du bouton retirés ;
- le bloc d'ancrage de `Segmented` retiré ;
- `color-scheme` retiré ;
- le popover remis en `anchored` ;
- l'ancien CSS d'ouverture, qui fait lire `hidden` à la première frame ;
- l'onglet gardé à 8 px, qui passait sous la flèche.

Deux tests passent sur l'ancien code par construction, parce qu'ils gardent ce qui reste : l'accordéon sous mouvement réduit, et le brouillon abandonné au repli.

**Specs existantes ajustées, chacune pour une raison mesurée** :
- **Moteur** : les fiches repliées sont maintenant dans le DOM, cachées. « Aucune fiche » devient « aucune fiche visible ».
- **Cibles tactiles** : un voisin compte s'il est touchable (`checkVisibility()`). Une fiche repliée rend encore une boîte à `getBoundingClientRect`.
- **Diapos** : `innerText` d'une vignette hors écran est vide. Le deck commence à ~2 000 px, sous le panneau d'export. Les trois lectures de texte des slides passent donc par `readEachOnScreen`. L'une d'elles (le test des glyphes « Et si ») n'avait pas de plancher de longueur et aurait passé à vide : elle en a un.
- **Accordéons** : ouvrir un accordéon puis focaliser tout de suite loin dedans tombe court pendant l'ouverture. Aucun humain ne le fait en 250 ms, un test si : `openFold` attend la fin de l'ouverture. La légende d'audit se lit une fois dessinée.

**Vérifié** :
- lint et `tsc` propres ;
- **2 235 tests unitaires** (+8), couverture au-dessus de ses seuils ;
- `next build` propre avec `GAME_ENABLED=true` ;
- **620 specs Playwright** (+14) : 615 passées, 5 ignorées par construction, aucun échec, sans reprise ;
- les specs « Et si » rejouées quatre fois en parallèle : 228 sur 228.

**À l'écran**, FR et EN, 1 280 et 390 px :
- le popover en bulle et en feuille ;
- le contrôle de ton dans ses deux tons ;
- l'en-tête en haut de page et défilé ;
- la bande d'onglets et ses flèches ;
- les nouvelles, carte de texte et courriel du DG.

**Barrière `/livrer` §0** : ni dépendance ni réglage de build, aucun fichier non-code sous `src/`, aucune route touchée. Le changement est du CSS et des composants client.

**Pas fait ici** :
- **Le bundle design-sync** n'est pas reconstruit ; B3 dit ce qu'il doit emporter, dont deux histoires `GlossaryTerm` à regarder.
- **Sans ancrage** (Firefox tant qu'il ne l'a pas), un desktop reçoit la feuille au lieu de la bulle : juste, moins proche. Il deviendra bulle seul.
- **Relecteurs non lancés** : ni route, ni proxy, ni payload, ni workflow, et aucune copie neuve (les flèches sont décoratives, avec un texte alternatif vide).

**En production** : PR [#196](https://github.com/ScratchMe/tourdegrowth/pull/196), mergée le 2026-09-29 (squash `74aacdf`, 40 fichiers, identique à la tête de la PR), servie à 23 h 00 UTC. Relevé par HTTP sur les feuilles servies par `/en`, `/fr/glossary/cac` et `/r/sample` : présents `--stamp-overshoot`, `scroll-state(stuck:top)`, `anchor-scope:--segmented-on`, `position-anchor:--glossary-definition`, `interpolate-size:allow-keywords` et `color-scheme:dark` ; absent `--z-popover`. **Pas de navigateur contre la production** : le Chromium de la session ne reconnaît pas l'autorité du proxy, même en build complet, et la vérification TLS ne se désactive pas. Le comportement est celui que l'e2e a vu sur le même build.

## A5, première famille : la table de nommage, et `desktop|mobile` devient `md|sm` (2026-09-29)

**La demande** : le lot A5 de `CHANTIERS.md` (constat S-16), une famille de composants par PR.

**Re-mesuré d'abord**, sur `src/components` :
- quatre vocabulaires pour `size` : `desktop|mobile` (sept composants du quiz et du résultat), `sm|md|lg`, `md|compact`, et des noms propres (`frame|avatar`, `screen|slide`, `mini`, `hero|responsive`) ;
- un drapeau `compact` à côté de la taille de `Button`, qui est en fait une troisième taille ;
- `Tag tone="red"`, dont le seul usage produit (le catalogue du jeu, une astuce encore en place) est un diagnostic, soit le rôle d'`alert`.

`desktop|mobile` n'a jamais été un appareil : le quiz passe toujours `"desktop"`, la taille de base qui rétrécit seule sous 760 px, et `"mobile"` ne sert qu'à l'aperçu réduit de l'accueil et à l'écran d'audit. C'est une échelle.

**La table** (« Variant names » dans `.design-sync/conventions.md`) : un mot par axe.
- `size` ne dit que l'échelle : `xs`, `sm`, `md`, `lg`, et `auto` pour « selon la largeur ». `md` est le défaut, et c'est lui qui rétrécit seul sur un téléphone.
- Ce qui change plus que l'échelle prend sa propre prop (la grille de points d'une slide sera `medium="slide"`).
- Le rouge d'un diagnostic est `alert`, jamais `red`.
- Chaque nom retiré a sa cible et sa famille.

**Cette PR** : les sept composants du quiz et du résultat passent de `desktop|mobile` à `md|sm`, avec leurs classes, leurs appelants (accueil, quiz, écran d'audit) et leurs aperçus. Les histoires `Mobile` et `Desktop` deviennent `Small` et `Medium`. Aucun changement visible : c'est un renommage.

**Garde** : `variant-names.test.ts`.
- `size` ne prend que l'échelle, `red` n'est pas un ton, et une taille n'est pas un drapeau `compact`.
- Ce qui n'a pas encore bougé est listé par fichier, et la liste ne peut que rétrécir : elle refuse un mot qu'un fichier n'a plus.
- Non-vacuité : `desktop|mobile` remis sur `AnswerOption` fait tomber le premier test ; une ligne en trop dans la liste fait tomber le dernier.

**Vérifié** :
- lint et `tsc` propres ;
- **2 239 tests unitaires** (+4), couverture au-dessus de ses seuils ;
- `next build` propre avec `GAME_ENABLED=true` ;
- **620 specs Playwright** : 615 passées, 5 ignorées par construction, aucun échec.

**À l'écran, au pixel près** : l'accueil, le quiz, le résultat, et le « Et si » et un panneau du moteur, en FR et EN, à 1 280 et 390 px (20 captures pleine page) ont été comparés à l'octet avec le build de `main`. Dix-neuf sont identiques. La vingtième (le « Et si » FR à 1 280) variait déjà d'une capture à l'autre sur `main`, et trois recaptures sur la branche lui sont identiques.

**Pas fait ici** : les familles core, viz et jeu, une PR chacune ; le bundle design-sync, qui suit en B3.

**En production** : PR [#197](https://github.com/ScratchMe/tourdegrowth/pull/197), mergée le 2026-09-29 (squash `68c0ac4`, 30 fichiers, identique à la tête de la PR), servie à 23 h 21 UTC. Relevé par HTTP, en FR et EN : l'accueil porte les classes `__sm` de `PillarChip`, `ScoreDisplay` et `Bottleneck`, le résultat leurs classes `__md`, et aucune page ne porte plus de `__mobile` ni de `__desktop`.

## A5, famille core : `Segmented`, `ToneToggle`, `Button` et `Tag` (2026-09-29)

**Ce qui bouge** :
- `Segmented` et `ToneToggle` passent de `md|compact` à `md|sm`. Appelants : le sélecteur de langue, l'aperçu de l'accueil, le formulaire de mission.
- `Button` perd son drapeau `compact`, qui était une troisième taille posée par-dessus `md` (police `--label-button-sm`, padding réduit) : c'est maintenant `size="sm"`. Il y avait une quarantaine d'appelants, dans l'admin d'audit, le moteur, l'accueil, le graphe et l'extrait du badge ; `tsc` a donné la liste complète.
- `Tag` passe de `tone="red"` à `"alert"`. Son seul usage produit, le catalogue du jeu, marque une astuce encore en place : un diagnostic, pas l'accent roast que l'aperçu annonçait.

Les histoires `Compact` deviennent `Small`, et l'exemple de `Tag` dit ce qu'il marque vraiment. La liste d'attente de `variant-names.test.ts` perd ses quatre lignes core.

**Vérifié** : lint et `tsc` propres ; 2 239 tests unitaires ; `next build` propre avec `GAME_ENABLED=true` ; **620 specs Playwright** (615 passées, 5 ignorées par construction, aucun échec).

**Au pixel près** : les 36 captures (accueil, quiz, résultat, moteur, tableau de bord et rapport du jeu, slide peloton, admin d'audit ; FR et EN ; 1 280 et 390 px) sont identiques à celles de `main`. Elles ont été prises sur l'empilement des trois familles restantes, qui contient celle-ci.

**En production** : PR [#198](https://github.com/ScratchMe/tourdegrowth/pull/198), mergée le 2026-09-29 (squash `beb7fc0`, 39 fichiers, identique à la tête de la PR), servie à 23 h 38 UTC. Relevé par HTTP : l'accueil FR et EN porte les classes `__sm` de `Segmented` et de `Button`, et plus aucun `__compact`.

## A5, famille viz : `StatTile`, `BulletChart`, `DotGrid` et `DotLegend` (2026-09-29)

**Ce qui bouge** :
- `StatTile` : `hero|md|compact|responsive` → `lg|md|sm|auto`. `auto` est la tuile `md` au-dessus de 760 px, `sm` en dessous, basculée en CSS. Appelants : le tableau de bord du jeu et les chiffres du « Et si ».
- `BulletChart` : `mini|md` → `sm|md`, `sm` par défaut.
- `DotGrid` et `DotLegend` : `size="screen" | "slide"` devient `medium="screen" | "slide"`. Ce n'est pas une échelle : la grille d'une slide a le trait plus épais d'une projection. Appelant : la slide peloton.
- Le contrat de `StatTile` écrit à la main dans `.design-sync/config.json` était déjà en retard d'une valeur (`responsive` n'y figurait pas) : il suit maintenant le composant.

Les aperçus suivent, et la liste d'attente de `variant-names.test.ts` perd ses trois lignes viz.

**Vérifié** : lint et `tsc` propres, 2 239 tests unitaires. `next build` propre et **620 specs Playwright** (615 passées, 5 ignorées par construction, aucun échec) sur cet arbre, avant le rebase sur #198 : le code sous `src/` et `e2e/` en est identique (vérifié par `git diff`). Les 36 captures au pixel près, prises sur l'empilement qui contient cette famille, restent identiques à `main` : le tableau de bord du jeu et la slide peloton en font partie.

**En production** : PR [#199](https://github.com/ScratchMe/tourdegrowth/pull/199), mergée le 2026-09-29 (squash `77f0fff`, 18 fichiers, identique à la tête de la PR), servie à 23 h 51 UTC. Le jeu et le moteur, seuls à rendre ces composants, restent en 404 derrière leurs drapeaux. La feuille globale servie par `/en` porte `StatTile …__auto` et `BulletChart …__sm`, et plus `__responsive` ni `__mini`.

## A5, famille jeu, et le lot clos (2026-09-29)

**Ce qui bouge** :
- `DgFace` : `size="frame" | "avatar"` devient `framing="call" | "avatar"`. `call` dessine l'appel entier en 16:9 avec le bureau, `avatar` recadre la tête : ce qui est dans l'image, pas sa taille. C'est la règle de la table, et la cible écrite d'abord (`lg|sm`) la contredisait : corrigée avant cette PR. Appelants : le rapport du trimestre et les nouvelles.
- `ClickPill` : `md|compact` → `md|sm`.
- Les aperçus suivent (`Frame` → `Call`, `FrameMoods` → `CallMoods`, `Compact` → `Small`).
- La liste d'attente de `variant-names.test.ts` est vide : un composant qui arrive avec un nom retiré se renomme, il ne s'y inscrit pas.

**Le lot A5 est clos** : quatre PR (#197, #198, #199 et #200), une famille chacune, toutes selon la table « Variant names » de `conventions.md`. S-16 est livré. Aucune ne change quoi que ce soit à l'écran : 36 captures pleine page (accueil, quiz, résultat, moteur, tableau de bord et rapport du jeu, slide peloton, admin d'audit ; FR et EN ; 1 280 et 390 px) sont identiques à l'octet à celles de `main`, sur l'empilement des familles. Le bundle design-sync est à reconstruire (B3 dit ce qu'il doit emporter).

**Vérifié** : lint et `tsc` propres ; 2 239 tests unitaires ; `next build` propre avec `GAME_ENABLED=true` ; **620 specs Playwright** (615 passées, 5 ignorées par construction, aucun échec), passées sur l'empilement des quatre familles, dont le code sous `src/`, `e2e/` et `.design-sync/` est identique à celui de cette branche (vérifié par `git diff`).

**En production** : PR [#200](https://github.com/ScratchMe/tourdegrowth/pull/200), mergée le 2026-09-30 à 0 h 01 UTC (squash `bd8b24c`, 12 fichiers, identique à la tête de la PR), servie à 0 h 03 UTC. Le jeu et le moteur restent en 404 derrière leurs drapeaux. La feuille globale servie par `/en` porte `ClickPill …__sm`, et plus `__compact`. `DgFace` garde ses classes `__frame` et `__avatar` : seul le nom de la prop a changé (`framing`), pas la feuille.

**Piège** : un `git rebase --onto` qui part d'une base trop ancienne rejoue des commits déjà squashés dans `main` et s'arrête sur un conflit fantôme (convention 12). La base à donner est le dernier commit de la branche du dessous, pas son premier. Ici, `--skip` a suffi : le contenu était déjà là.
