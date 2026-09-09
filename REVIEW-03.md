# Revue externe « Product & Growth Teardown » — recoupements, critique, direction

*Tour de Growth · 2026-09-08 · rédigé par la session de code à la demande d'Antoine, à partir de `evolutions_tour_de_growth.md` (revue d'un expert growth, septembre 2026)*

Ce document fait trois choses, dans l'ordre demandé : il regarde ce qui se recoupe avec le brief R2-29 déjà écrit, il critique la revue, puis il propose une direction et un plan d'actions en justifiant chaque choix. Comme `REVIEW.md` et `REVIEW-02.md`, chaque affirmation sur l'état du produit a été vérifiée dans le code au moment de l'écrire, pas déduite de mémoire.

---

## 0. En une page

**La thèse centrale de la revue est juste, et c'est déjà la direction du produit.** « Un score est intéressant, un diagnostic est utile, une action est précieuse » : c'est exactement ce que le Deep dive fait depuis SPEC-ADDENDUM-01 — dix questions de plus, une action prioritaire et une recommandation par étape, générées par Gemini. Ce que la revue nomme sans le savoir, c'est **le trou que le mode Quick a laissé** quand la recommandation en a été retirée (§0 de l'addendum, signalé à l'époque dans `CLAUDE.md` : « si ce retrait n'est pas voulu, une bibliothèque de recommandations statiques reste à écrire »). Aujourd'hui, 100 % des gens reçoivent un score, un pilier faible nommé dans une phrase et cinq constats ; seuls ceux qui font le Deep dive reçoivent une action. La revue dit : c'est l'action qui vaut le partage et le retour. Elle a raison.

**La revue a audité la surface, pas le produit.** Sur ses treize initiatives, **huit existent déjà** en tout ou partie (pilier faible nommé, « pourquoi » par étape, méthodologie publique, questions de contexte, progression entre deux Tours, funnel instrumenté, image de partage, histoire du fondateur), une est **en contradiction** avec une décision qu'elle recommande elle-même ailleurs (les benchmarks), et elle ne mentionne ni le Deep dive, ni le ton roast, ni le bilinguisme — soit la moitié du produit. Ça ne l'invalide pas : ça dit que ses P0 sont pour l'essentiel des questions de **structure de l'écran de résultat**, pas de fonctionnalités à construire.

**Recoupement avec R2-29 : le brief 02 ne doit pas partir tel quel.** Il pose une question (« comment un visiteur apprend-il que le roast existe ? ») sur la carte d'aperçu de la landing **telle qu'elle est**. Si le résultat change de structure — pilier faible en tête, prochaine action visible — la carte d'aperçu change avec lui, et la question du roast se pose sur la nouvelle carte. Un seul brief (03) qui traite l'écran de résultat, la carte d'aperçu et le roast ensemble, plutôt que deux briefs dont le second défera le premier.

**Direction proposée, en une phrase : faire de l'étape qui freine la première chose qu'on lit, et donner une prochaine action à tout le monde — déterministe en Quick, personnalisée en Deep dive.** Le plan tient en trois lots : (A) le résultat dit quoi faire, (B) la landing le promet, (C) une raison de revenir. Sept décisions à prendre, listées en §6.

---

## 1. Recoupements avec R2-29

Le brief `design/DS-EXTENSION-BRIEF-02.md` (PR #89, mergé, **jamais envoyé** à Claude Design — c'est une action d'Antoine) pose une seule question : comment rendre le roast visible avant la quinzième question. Il propose trois formes, toutes sur la **carte d'aperçu** de la landing ou juste au-dessus.

Trois points de la revue touchent exactement la même surface :

| Revue de l'expert | Ce que ça touche | Recoupement avec le brief 02 |
|---|---|---|
| §11 « Section Example » — montrer un exemple de résultat avec `YOUR BOTTLENECK / RETENTION / Your next 3 moves` sur la homepage | La carte d'aperçu | **Même objet.** Le brief 02 demande de décider si cette carte montre le roast ; la revue demande qu'elle montre le pilier faible et les prochaines actions. Ce sont deux modifications du même composant, à décider ensemble. |
| §25 Experiment 2 « Show the result » — voir la récompense avant de commencer | La carte d'aperçu | Le brief 02 dit la même chose de la forme A (le toggle « montre plutôt que raconte, c'est la version la plus forte ») — les deux textes s'accordent sur le principe, sans le savoir. |
| §12 « Growth Card » | L'image de partage | Le brief 02 la fournit en capture (`07-og-roast.png`) comme référence aval. La revue veut en faire l'objet central du partage. Si la carte change (ajout d'un « next move », suppression ou non du score en tête), la version roast change aussi. |

Et un point où la revue **conforte** R2-29 sans le nommer : elle ne mentionne jamais le roast. Un expert qui passe du temps sur le produit et ne voit pas son élément le plus partageable, c'est précisément le constat de R2-29. Le brief avait raison de rouvrir la question.

**Conclusion.** Ne pas envoyer le brief 02. Écrire un brief 03 qui reprend sa question intacte, la replace dans une refonte de l'écran de résultat et de la carte d'aperçu, et l'étend à la carte de partage. Le brief 02 reste dans `design/` comme document d'entrée du 03 — rien n'est perdu, et Claude Design reçoit une question cohérente au lieu de deux qui se marchent dessus.

---

## 2. Ce que la revue recommande, et ce qui existe déjà

Vérifié fichier par fichier. « Existe » veut dire : en production, aujourd'hui.

| # | Recommandation | État réel | Verdict |
|---|---|---|---|
| §6 N2 | Le pilier faible immédiatement visible | **Existe en partie.** Le headline sous le score le nomme (`SUMMARY_HEADLINES[weakestPillar]` : « Bon moteur global, un pneu à plat : la rétention. »), le chip du pilier est en rouge, et en roast il est tamponné. Mais ce n'est pas un **élément structurel** : c'est une phrase, au milieu de cinq chips égaux. | À restructurer, pas à créer |
| §6 N3 | « Why we think so » | **Existe, dispersé.** Une phrase par pilier selon sa bande de score (`PILLAR_VERDICTS`, 60 entrées), affichées dans « Points forts » / « Là où tu perds du temps ». Le propriétaire a en plus le dépliant du calcul (R-12). Ce qui manque : les cadrer comme *raisons* du diagnostic plutôt que comme constats parallèles. | À recadrer |
| §6 N4 | « Your next 3 moves » | **N'existe pas en Quick, existe en Deep dive** (`priorityAction` + une recommandation par étape, Gemini, deux tons, deux langues). En Quick, l'emplacement est une carte « Action prioritaire — verrouillée » qui renvoie au Deep dive. **C'est le vrai trou.** | À construire |
| §7 | Le score comme signal, pas comme vérité | **Existe.** `HOW_IT_WORKS.limitationNotice` : « une estimation rapide et directionnelle, pas un audit professionnel… un point de départ de conversation, pas un verdict définitif », affiché sous les CTA de chaque résultat et sur `/how-it-works`. | Fait |
| §8 | Niveau de confiance | **N'existe pas.** Voir critique §3.2 : faisable de façon déterministe. | À décider |
| §11 | Homepage : hero, Problem, How it works, Example | **Partiel.** Hero et carte d'aperçu existent ; « How it works » est une page à part ; pas de section « Problem » ; pas de mention d'une priorité dans la promesse. | À compléter |
| §12 | Growth Card | **Existe** : l'image OG 1200×630 porte le score, les cinq étapes, le pilier faible en rouge, « {pilier} est là où cette croissance cale. Et la tienne ? », le domaine — avec une variante roast. Ce qui manque : elle n'est **visible nulle part** sur la page de résultat (on la découvre après avoir partagé) et elle n'est pas téléchargeable. | À exposer |
| §15 | « Why I built this » | **Existe** sur `/about` (R2-04, première personne, six sections). Absent de la landing. | À relier |
| §16 | Preuve sociale | **Construit et fermé** : `/metrics` derrière `METRICS_PAGE_ENABLED`, benchmark masqué sous 30 soumissions. « Most common bottleneck this month » n'existe pas mais se calcule en une ligne sur `weakestPillar`. | Plus tard, gated |
| §17 | Questions de contexte (modèle, stade) | **Livré la veille** (R2-26, PR #92) : stade × modèle, facultatif, jamais noté. | Fait |
| §20-21 | Retake / Growth Journey | **Existe en partie** (R2-27) : progression entre les deux derniers Tours sur la landing et le résultat, depuis l'appareil. Pas de relance à 30 jours — et **aucun canal** pour la faire (pas d'email, par conception). | À compléter sur l'appareil |
| §23 | Funnel instrumenté | **Existe** (R-11) : `quiz_started`, `quiz_stage_completed/1..5`, `segment_answered`, `tone_selected`, `submission_completed`, `share/<ton>/<méthode>`, `take_own_tour`, `deep_dive_*`, `profile_click/*`. Manquent : le retour et le re-test. | À compléter |
| §24 | North Star = % de Tours suivis d'une action de valeur | **N'existe pas** comme chiffre. Les composants sont presque tous mesurés. | À calculer |
| §26 P0 « Repenser le résultat » | — | C'est le sujet. | Le lot A |

Huit « existe » ou « fait », trois « à construire/compléter » réels, deux à décider. Le rapport entre les deux dit ce que la revue vaut : une bonne grille de lecture, appliquée à une photo incomplète.

---

## 3. Critique de la revue

### 3.1 Ce qu'elle voit juste

- **La hiérarchie score → diagnostic → action.** C'est la bonne échelle de valeur, et le « test du lundi matin » (§32 : « est-ce que cet écran aide à savoir quoi faire lundi ? ») est un critère utilisable pour chaque bloc de la page de résultat. Il devrait entrer dans `CLAUDE.md` comme règle de conception du résultat.
- **Le nombre limité d'actions** (§6 : « trois maximum, pas une todo-list de 25 »). Le Deep dive donne aujourd'hui une action prioritaire *plus* cinq recommandations par étape — six choses. La revue a raison qu'une seule ou trois valent mieux que six.
- **La retenue** (§18, §29 : pas de comptes, pas de plateforme, « make the first three minutes insanely valuable »). C'est cohérent avec SPEC.md §5 et avec ce qu'on a fait.
- **Le résultat doit *donner envie* d'être partagé, pas juste avoir un bouton** (§14). Notre boucle est instrumentée, notre carte existe, mais la revue pointe ce qu'aucun test ne mesure : la *raison* de partager. Un score de 74 se partage si on en est fier ; un diagnostic se partage parce qu'il dit quelque chose à l'équipe.
- **Ne pas optimiser la complétion seule** (§22). Notre funnel s'arrête à `share` ; il n'a pas de notion de « valeur reçue ».

### 3.2 Ce qu'elle voit mal, ou pas

**Elle n'a pas vu la moitié du produit.** Aucune mention du Deep dive, du ton roast, du bilinguisme, du glossaire (quinze pages longues), de `/about`, du dépliant du calcul. Conséquence directe : son P0 le plus fort (« Next 3 moves ») est présenté comme absent alors qu'il existe derrière le Deep dive. La bonne question n'est pas « faut-il des recommandations » mais « **où** doivent-elles vivre : derrière dix questions de plus, ou dès le résultat Quick ». C'est une question de produit qu'on avait déjà posée, et la revue y répond sans le savoir : dès le Quick.

**Le « niveau de confiance » risque la fausse précision.** Quinze questions à trois options ne permettent pas un « Confidence: High » au sens statistique, et la revue ne dit pas comment le calculer. Mais il existe une version **déterministe et ré-explicable en dix secondes** (non négociable de `CLAUDE.md`) : la bande du pilier le plus faible comparée à celle du suivant (les bandes existent déjà : faible ≤ 9, en développement 10-15, forte 16-20). Si le deuxième plus faible est dans une bande supérieure, le goulot est **net** ; s'il est dans la même bande, il est **partagé**, et la page doit alors nommer les deux ; si les cinq sont dans la bande forte, il n'y a pas de goulot à tamponner. Le départage actuel (ordre AARRR canonique en cas d'égalité, SPEC.md §6) reste pour le *classement*, mais l'affichage cesserait de prétendre à une netteté qu'il n'a pas. Ce n'est pas un score de confiance, c'est une **netteté**, et le mot compte.

**La Growth Card aux feux tricolores** (`🟢🟠🔴`) heurte deux règles : le design system n'autorise qu'un seul emoji (le `🔥` roast), et coder l'information par la couleur seule est un défaut d'accessibilité que la passe axe rougirait. L'idée juste derrière — la carte est l'objet du partage, elle doit être *vue* avant d'être partagée — se réalise avec l'image OG existante, exposée sur la page.

**Une contradiction interne sur les benchmarks.** §18 et §28 classent benchmarks et personnalisation comme prématurés (P2), tandis que §17 met les questions de contexte en P1 et §16 propose « Most common bottleneck this month » — qui *est* un benchmark. On a résolu cette tension de la seule façon honnête : construit, mais **gated** (30 soumissions par segment, page de métriques fermée). La revue aurait dû arbitrer plutôt que lister les deux.

**« Retake in 30 days » suppose un canal de relance qui n'existe pas.** Pas d'email, pas de compte — c'est une décision de confidentialité (SPEC.md §5, pages légales). La seule relance possible est **sur l'appareil**, quand la personne revient d'elle-même : la landing sait déjà quel est son dernier score et de quand il date. C'est plus faible qu'un email, et c'est le prix du choix qu'on a fait.

**Le test de headline n'est pas testable.** Avec le trafic actuel, un A/B entre « Where does your growth stall? » et « Find your growth bottleneck in 3 minutes » ne sera significatif dans aucune fenêtre raisonnable. La décision se prendra au jugement et au design, pas à la mesure — autant le dire. Sur le fond : la revue loue la formulation actuelle (§3) puis propose de la remplacer (§10). « Stall » parle du problème en mots simples ; « bottleneck » nomme le livrable en jargon, et « goulot d'étranglement » est lourd en français là où « l'étape qui te freine » reste dans la métaphore du Tour. Le H1 est aussi de la copie approuvée par le design. La bonne réponse est probablement : garder le H1, et faire porter la **promesse de priorité** par la ligne du dessous.

**« AARRR est le moteur, pas la différenciation » — vrai pour un produit, incomplet pour celui-ci.** SPEC.md §1 dit ce que le projet est : la démonstration, pour un CV, d'une maîtrise d'AARRR. Le cadre doit rester *visible*, pas seulement sous le capot. Les deux se concilient : la promesse peut être « trouve l'étape qui te freine », l'écran doit continuer à montrer les cinq étapes nommées.

**Le vocabulaire d'événements proposé** (§23) doublonne l'existant sous d'autres noms. Le renommer fragmenterait l'historique GoatCounter (leçon de R-10). On mappe, on ne renomme pas.

**La contrainte bilingue est absente.** Chaque chaîne proposée existe en deux langues, chaque génération Gemini en quatre exemplaires (deux tons × deux langues), et le résultat se rend dans la langue du *lecteur* (R-09). Une « Growth Card » qui embarque du texte doit le faire dans la langue de l'auteur (règle de l'image OG). Ce n'est pas un détail : c'est ce qui a coûté le plus d'aller-retours dans ce projet.

**Le déterminisme n'est pas nommé.** Le non-négociable « le score et son explication sont déterministes ; Gemini ne fait que la synthèse » s'applique à toute recommandation en Quick : elle doit venir d'une bibliothèque, pas d'un modèle. La revue met « AI recommendations » en P2 — c'est le Deep dive, qui existe. En Quick, ce sera de la copie écrite.

### 3.3 Ce qu'elle vaut, au net

Une revue de produit générique de bonne facture, dont la thèse est juste et la photo incomplète. Elle ne remplace pas une décision ; elle en clarifie une qu'on avait laissée ouverte : **le mode Quick doit-il donner une action ?** Tout le reste — structure du résultat, carte visible, promesse de la landing — en découle.

---

## 4. Direction proposée

**Faire de l'étape qui freine la première chose qu'on lit, et donner une prochaine action à tout le monde.**

Concrètement, l'écran de résultat Quick se lirait ainsi, de haut en bas :

1. **Score** — inchangé, mais plus le seul élément dominant.
2. **L'étape qui te freine** — bloc structurel : nom du pilier, son score, une **netteté** (« goulot net » / « partagé avec … »), le headline actuel comme phrase d'accroche.
3. **Pourquoi** — les cinq constats existants, recadrés : « Acquisition et Revenue tiennent, Activation est correcte, la Rétention est l'étape la plus faible » — c'est la lecture qu'on fait déjà en regardant les chips, écrite en une fois.
4. **Ta prochaine action** — une à trois actions **déterministes**, tirées d'une bibliothèque indexée par pilier × bande, pour le pilier qui freine. Nouveau.
5. **Aller plus loin** — le Deep dive, repositionné : « des recommandations personnalisées à *ton* contexte », et non plus « débloquer l'action prioritaire » (puisqu'il y en aura déjà une).
6. **Ta carte** — l'image de partage, visible, avec Partager et Enregistrer.
7. Les deux CTA existants, le disclaimer, le dépliant du calcul (propriétaire).

La landing promet ce que le résultat tient : le H1 reste, la ligne du dessous dit « 15 questions · 5 étapes · 1 priorité claire », la carte d'aperçu montre le nouveau résultat — et c'est sur cette carte-là que la question du roast (R2-29) se pose.

**Ce que ça respecte :** le déterminisme (les actions Quick viennent d'une bibliothèque), le partage comme cœur (la carte devient visible), « exactement 2 CTA » (R-23 — les nouveaux blocs ne sont pas des boutons), le bilinguisme (tout en deux langues, actions dans la langue du lecteur comme les verdicts), et la retenue de la revue (aucune nouvelle route, aucun compte, aucun appel Gemini de plus).

**Ce que ça change de position produit :** le Deep dive cesse d'être *le seul endroit où il y a une action* pour devenir *l'endroit où l'action est la tienne*. C'est un meilleur argument d'upgrade : on ne retient plus la valeur, on la personnalise.

---

## 5. Plan d'actions

Trois lots, dans l'ordre. Chaque item dit qui fait quoi, et pourquoi il est là et pas ailleurs.

### Lot A — Le résultat dit quoi faire

**A1. L'étape qui freine, en bloc structurel, avec sa netteté.**
*Quoi* : un composant au-dessus des chips (ou remplaçant la ligne de headline) : pilier, score, netteté, phrase. Netteté = écart avec le deuxième plus faible, en trois états (net / partagé / tout se tient — quand les cinq sont dans la bande forte). Déterministe, testable, ré-explicable.
*Pourquoi maintenant* : c'est la réponse à « Et alors ? » (§4 de la revue), et c'est du réagencement de données qu'on a déjà. Coût principal : le design (brief 03) et trois chaînes de copie.
*Qui* : brief 03 → Claude Design ; code : session ; copie : Antoine.

**A2. « Ta prochaine action » en mode Quick — bibliothèque déterministe.**
*Quoi* : `content/next-moves.ts`, indexé par pilier × bande (faible, en développement), une à trois actions par entrée. Affiché pour le pilier qui freine. Recommandation de dimensionnement : **actions sans variante de ton** — une action est une action, la voix roast vit dans les verdicts, et ça évite d'écrire des « actions » qui se moquent, ce que le garde-fou anti-moquerie n'a pas à arbitrer. Bande « forte » exclue (si l'étape qui freine est forte, tout l'est : un message unique). Soit **5 × 2 bandes × 3 actions × 2 langues = 60 chaînes courtes** plus un message — la taille d'un lot de glossaire.
*Pourquoi* : c'est le P0 réel de la revue et le trou laissé par l'addendum 01. Sans lui, la valeur du Quick plafonne au constat.
*Pourquoi pas Gemini* : non négociable. Et la latence : le Quick est instantané, il doit le rester.
*Qui* : premier jet par la session (comme le glossaire long), relecture Antoine — **après** la relecture en cours, pas empilé dessus.

**A3. La carte, visible et enregistrable.**
*Quoi* : afficher l'image OG réelle sur la page de résultat (c'est une URL, elle existe déjà dans les deux tons) dans un bloc « Ta carte », avec Partager (existant) et Enregistrer l'image. Pas de feux tricolores. Éventuellement une ligne « ta prochaine action » sur l'image — à décider avec le design, car l'image est « highest care » dans le brief d'origine.
*Pourquoi* : on ne partage bien que ce qu'on a vu. Aujourd'hui l'auteur découvre sa carte dans LinkedIn.
*Qui* : brief 03 (placement) ; code : session.

**A4. Mesurer la valeur, pas seulement la complétion.** — **Fait** (PR #102)
*Quoi* : deux événements — `retake_started` et `landing_return` — et un chiffre dans `/admin/stats` : **actions de valeur par résultat** = (partages + « fais ton propre Tour » + Deep dive démarrés + re-tests) ÷ résultats créés. C'est la North Star de la revue (§24), simplifiée.
*Pourquoi* : sans ce chiffre, on ne saura pas si le lot A a changé quoi que ce soit. À poser **avant** A1-A3, pour avoir un avant.
*Trois écarts par rapport à ce plan, assumés à la livraison* : (1) `retake_started` est un **événement à part** et non un détail `quiz_started/retake` — `quiz_started` est le dénominateur de tous les taux de déperdition depuis R-11, et un suffixe l'aurait figé pour en démarrer deux nouveaux ; (2) le chiffre n'est **pas un taux** et n'est pas affiché en pourcentage — un même résultat peut être partagé deux fois, ouvert par deux visiteurs *et* mener à un Deep dive, donc il dépasse légitimement 1 (l'appeler un taux referait l'erreur de R2-01) ; (3) les deux moitiés viennent de GoatCounter, jamais une de Firestore — un visiteur qui bloque les scripts est invisible pour l'un et visible pour l'autre.
*Qui* : session, code seul, immédiat.

### Lot B — La landing promet la priorité

**B1. La promesse.** Garder le H1. Ligne du dessous : « 15 questions · 5 étapes · 1 priorité claire » (ou dans le `bibTag`). Une décision de copie, deux chaînes.
*Pourquoi* : le H1 pose le problème, la ligne dit le livrable. Changer le H1 sans mesure possible serait un pari sur de la copie approuvée.

**B2. La carte d'aperçu montre le nouveau résultat — et c'est là que R2-29 se règle.** Même composant que A1/A2 en taille réduite ; la question du roast (toggle, ligne, carte alternée, rien) est posée sur cette carte-là dans le brief 03.

**B3. Une phrase de fondateur, sous la ligne de flottaison, vers `/about`.** La copie existe (`about.ts`, intro). Une phrase et un lien, pas une section.

**B4. Une section « Problème » de deux lignes** (« La croissance ne cale rarement partout. La plupart des équipes ont une étape qui freine plus que les autres. »). Nouvelle copie, courte, à relire. Design : brief 03.

### Lot C — Une raison de revenir

**C1. Relance sur l'appareil.** `LastResult` (landing) sait déjà le dernier score et sa date. Après 30 jours : « Ton dernier Tour date de N semaines — refais-le ? ». Zéro canal, zéro donnée nouvelle.
*Pourquoi cette forme* : c'est la seule compatible avec « pas d'email, pas de compte ». Elle ne touche que ceux qui reviennent d'eux-mêmes — c'est faible, et c'est honnête.

**C2. « L'étape qui freine le plus souvent ce mois-ci »** — calculée sur `weakestPillar`, gated à 30 comme le benchmark, affichée sur `/metrics` d'abord, sur la landing ensuite si le chiffre tient.
*Pourquoi plus tard* : c'est de la preuve sociale, elle n'a de valeur qu'avec du volume, et on a déjà l'infrastructure (agrégats, seuils, cache).

### Ce qu'on ne fait pas, et pourquoi

| Proposition | Décision | Raison |
|---|---|---|
| Comptes, équipes, backlog, bibliothèque d'expériences (§28) | Non | La revue elle-même le dit (§18, §29). SPEC.md §5 aussi. |
| A/B test du headline (§25 Exp. 1) | Non | Pas le trafic pour une significativité. Décision au jugement + design. |
| Renommer les événements analytics (§23) | Non | Fragmenterait l'historique GoatCounter. On mappe. |
| Feux tricolores emoji sur la carte (§12) | Non | Un seul emoji dans la marque ; couleur seule = défaut d'accessibilité. |
| Relance par email à 30 jours (§20) | Non | Aucun canal, par choix de confidentialité. Version sur l'appareil (C1). |
| IA pour les recommandations Quick (§28) | Non | Non négociable : déterministe en Quick. L'IA, c'est le Deep dive, qui existe. |
| « Confidence: High » (§8) | Pas sous cette forme | Fausse précision. Version « netteté » déterministe (A1). |
| Remplacer « Where does your growth stall? » (§10) | Pas maintenant | Copie approuvée, et « stall » est plus clair que « bottleneck ». La promesse passe par la ligne du dessous (B1). |

### Ordre et dépendances

1. **A4 d'abord** (code seul, une PR) — pour mesurer un avant.
2. **Brief 03** (A1, A2 côté affichage, A3, B2 + R2-29, B4) — **écrit** (`design/DS-EXTENSION-BRIEF-03.md` + 10 captures dans `design/ds-extension-03/`), **à envoyer par Antoine** à Claude Design. Remplace et absorbe le brief 02.
3. **A2, la bibliothèque d'actions** — premier jet par la session, relecture Antoine après la relecture en cours. Peut être écrite pendant que le design travaille : les deux ne dépendent pas l'un de l'autre.
4. **Port du retour design** + A1/A2/A3/B2/B4 dans le code, en une extension 03.
5. **B1, B3** — deux petites PR de copie, quand Antoine tranche.
6. **C1** — une PR, quand le lot A est en production.
7. **C2** — quand `/metrics` ouvre.

Pendant la relecture en cours, la session peut faire seule : A4, le brief 03, le premier jet de A2, et les corrections de copie au fil de l'eau. Rien de tout ça ne demande une décision avant demain.

---

## 6. Décisions — **prises le 2026-09-09**

Antoine a répondu **oui aux sept**, avec une précision sur la 6 (« oui avec prochaine action » : l'action figure bien sur l'image) et sur la 2 (**sans variante de ton**). Le plan du §5 est donc adopté tel quel ; l'ordre du §« Ordre et dépendances » s'applique.

Réponses, dans l'ordre : 1 oui · 2 oui, sans ton (60 chaînes) · 3 oui · 4 oui · 5 oui · 6 oui, avec la prochaine action sur l'image · 7 oui.

Ce que ça débloque, dans l'ordre : **A4** (fait, PR #102) → **brief 03** (`design/DS-EXTENSION-BRIEF-03.md`, **écrit**, à envoyer par Antoine à Claude Design) → **A2** (premier jet session, relecture Antoine) → port du retour design → B1/B3 → C1 → C2.

<details>
<summary>Les questions telles qu'elles ont été posées</summary>

Dans l'ordre où elles débloquent le reste. Ma recommandation entre parenthèses.

1. **Adopter la direction « l'étape qui freine d'abord, une action pour tous »** — oui / non. *(Oui : c'est la thèse juste de la revue, et elle ferme le trou laissé par l'addendum 01.)*
2. **Une action en mode Quick, tirée d'une bibliothèque déterministe** — oui / non. Et si oui : sans variante de ton (60 chaînes) ou avec (120) ? *(Oui, sans ton : une action n'a pas à être drôle, et ça divise la copie par deux.)*
3. **Fusionner R2-29 dans un brief 03** plutôt qu'envoyer le brief 02 — oui / non. *(Oui : sinon le retour du 02 sera périmé par le 03.)*
4. **La « netteté » du goulot** (net / partagé / tout se tient) — oui / non. *(Oui : déterministe, une ligne, et ça évite de tamponner « Rétention » quand Activation est à un point.)*
5. **Garder le H1** et faire porter la priorité par la ligne du dessous — oui / non. *(Oui.)*
6. **La carte visible sur le résultat** — oui / non ; avec la prochaine action dessus ou non ? *(Oui ; l'action sur l'image, à voir avec le design : c'est l'image la plus soignée du produit.)*
7. **La relance sur l'appareil à 30 jours** — oui / non. *(Oui, c'est trois lignes et c'est la seule forme possible.)*

Si les réponses sont celles entre parenthèses, la prochaine PR est A4, et le document suivant est le brief 03.

</details>
