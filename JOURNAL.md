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
telles quelles, en huit volumes rangés par période (un neuvième, le même jour, pour celles du 2026-09-30). **Quand ce fichier dépasse
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
| Ce fichier | depuis le 2026-10-01 | Le journal découpé, C30, A7.3.c de S1 à S5, A12 et A13, les textes de lancement, le moteur complet, et la suite |

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

## A7.3.c, S1 : le calcul de l'assisté, son diagnostic, son total et le levier de la liaison (2026-10-01)

Deuxième étape du lot, sur la même PR brouillon d'intégration ([#233](https://github.com/ScratchMe/tourdegrowth/pull/233)). Antoine a dit « Go pour S1 ». Tout est pur, dans `lib/engine`, et l'écran ne change pas encore : S3 et S4 le liront.

**Ce que S1 calcule** :
- **les trois relais** (`relays.ts`), chacun sur sa base de 100, sans chaîne multipliée : 15 sur 100 MQL, 24 sur 100 opportunités conclues, la mise en production inconnue, et « ~160 MQL par mois » en amont ;
- **le diagnostic de l'assisté**, par la même règle que le libre-service appliquée à ses cinq candidats (`diagnose(state, ctx, "slg")`) : la fonction qui nomme une étape est unique, et aucune ne voit les candidats des deux motions ;
- **l'impact en €** (`slg-impact.ts`), compté sur le trimestre puis ramené au mois : « 18 × 32/24 = 24 (+6) », « 6 × 2 000 € = 12 000 € de MRR nouveau par trimestre », « soit ~4 000 € par mois » ;
- **les unit economics de l'assisté**, sur l'ACV des nouveaux contrats et sa propre marge (Q4), avec la durée de vie plafonnée à 36 mois (Q6) et « clients perdus sur un an » des deux côtés (Q5) ;
- **le total** (`total.ts`) : un total n'existe que si ses deux parties existent (S9), et la somme affichée est la somme des parties affichées ;
- **le « Et si » de l'assisté** (`slg-scenario.ts`), levier de la liaison compris (Q7) : 31 → 40 opportunités venues du libre-service donnent +1,25 signature par trimestre, ~830 € de MRR nouveau par mois, et rien n'est retiré au libre-service ;
- les contrôles, les constats, le miroir du Tour, la couverture et la demande copiée, qui apprennent leur motion ; l'exemple hybride §18.9.

**L'exemple §18.9 sort exact, chiffre par chiffre** : couverture 21, 3, 3 et 5 sur 32 ; le taux de closing nommé, `clear`, à ~4 000 € par mois contre 2 400 et 600 ; à 30 % de cible, `shared` avec le passage lead → opportunité ; MRR 228 000 € exact ; nouveau MRR « ~5 000 € + ~12 000 € = ~17 000 € » ; MRR dans 12 mois « ~100 000 € + ~330 000 € à 340 000 € = ~430 000 € à 440 000 € » ; payback assisté 12,7 mois à 75 % de marge, 15,8 à 60 % (Q4).

**Deux écarts à la forme de §18.2.1, voulus, écrits dans `ENGINE.md` §18.11** :
- `Diagnosis` est générique sur ses candidats, le libre-service par défaut : ses positions ne portent que ceux de sa motion, et le compilateur refuse qu'on lise un candidat de l'autre ;
- `EngineDerived` garde le peloton, le diagnostic et les unit economics du libre-service en plus de `motions` et `total`. Ce sont les mêmes objets, et chaque écran et le deck v1 les lisent ; ils partent quand S4 aura déplacé le dernier lecteur.

**Trois précisions de la spécification, découvertes en codant** (§18.5.3 et §18.5.8) :
- **le « → » des gabarits ne passe pas sur une slide** : les trois fontes ne portent pas la flèche, et le test des glyphes l'a refusé. La copie écrit « , soit », comme en libre-service ;
- la seconde voie de W (« opportunités conclues × taux de closing ») n'existe pas dans les données : un taux saisi en comptes porte déjà W ;
- un seul constat « petits effectifs », sur le ★ au plus petit dénominateur, comme la phrase du tableau.

**La copie neuve** est le strict nécessaire au calcul, « à relire » : sujets et entrées manquantes de l'assisté, la chaîne `slgChain`, les constats et contrôles assistés, les mots de l'exemple hybride, les intertitres de la demande. La prose des 15 chiffres reste à S2.

**Le golden v1 reste vert** sans qu'un octet de ses fichiers bouge. Seule sa projection laisse de côté ce que S1 ajoute (`motions`, `total`, et le champ `motion` des diagnostics, contrôles, constats et lignes du miroir), comme son en-tête le prévoit.

**Non-vacuité, mesurée par sabotage** : trente-sept sabotages, le détail en tête de chaque test.
- **Indépendance des motions** : mille états tirés au hasard (graine fixe) de chaque côté. Un diagnostic du libre-service qui lirait le taux de closing fait tomber l'indépendance, le golden v1 et les constats hybrides. Un diagnostic assisté qui surveillerait l'ARPA du libre-service ne fait tomber que l'indépendance : aucun autre test ne voit cette fuite.
- **Trois de mes commentaires de non-vacuité étaient faux avant la mesure**, et sont corrigés :
  - la tolérance flottante de `clearlyAbove` est nécessaire aussi à la borne de 30 % de l'assisté ;
  - un relais de mise en production qui lirait l'activation fait aussi tomber les tests des relais ;
  - le renouvellement classé sur W ne fait tomber que la valeur de classement, la chaîne lisant D d'elle-même.
- **Un sabotage passait à travers** : arrondir chaque partie d'un total à ses propres deux chiffres. Une partie ronde au millier l'est aussi à la centaine, et la grille ne vérifiait que l'unité commune. Elle vérifie maintenant que chaque partie s'affiche à moins d'une demi-unité commune de sa valeur, et le sabotage tombe.
- Le tri final des constats, qu'aucun test ne faisait tomber jusqu'ici, est désormais tenu par l'ordre hybride : sans lui, tous les constats du libre-service passeraient avant la rupture de rang 1 de l'assisté.

**La relecture de la copie** (`relecteur-copie`) n'a trouvé aucune règle enfreinte, et deux vrais écarts à la spécification, corrigés avant le commit :
- le cas « moins d'un » du renouvellement disait « client » : il compte des contrats gardés, et a maintenant ses deux phrases ;
- les lignes « pour 100 » (sans compte de nouveaux clients) ne nommaient ni la base ni ce qu'on compte. Elles disent maintenant « 8 signatures de plus pour 100 opportunités conclues » ; la base voyage dans l'impact sous forme de clé de copie, jamais de mot.

Deux points restent pour le bon à tirer : la phrase des contrats mensuels sur un an n'a pas de formulation dans la spécification, et « lis la direction », texte exact de §18.5.1, tutoie. Ça va pour la fiche, pas pour une slide. Le message de `slg-cycle-long` tutoie aussi : la note d'orateur de S4 s'écrira à part (`ENGINE.md` §18.11).

**`main` a bougé pendant S1** : les quatre termes d'A7.3.e (#235), la documentation remise d'accord avec le code et le journal découpé en volumes (#237), puis C30 (#234). `main` est fusionné dans la branche en gardant les deux côtés. L'entrée de S0 reste à sa date, entre A7.3.e et la refonte de la doc, et les lignes d'A7.3.c de `CHANTIERS.md` disent S0 et S1 livrés, avec les slugs d'A7.3.e en place pour S2.

**Vérifié** : `eslint` et `tsc` propres, **2 529 tests unitaires** avant la fusion, **2 550 après**, `vitest --coverage` au-dessus de ses seuils (lignes 97 %). Build de production avec les variables de la CI, puis :
- les 150 specs Playwright du moteur, de `targets` et de `platform-native` passent ;
- la suite complète passe aussi : **670 specs, 647 passées, aucun échec**, 23 ignorées par construction.

Ces deux passages ont tourné avant les deux correctifs de la relecture. Ceux-ci ne touchent qu'une copie qu'aucun écran n'affiche encore.

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

## A13 : la faille critique de `next/og` corrigée, et `npm audit` revenu à zéro (2026-10-01)

**La demande** : Antoine, sur le compte rendu d'A7.3.e : « Go pour fixer la faille critique ». Ce « go » valait l'accord que `/livrer` §0 exige pour un merge qui touche une dépendance, sous réserve d'un poids de bundle sans surprise.

**L'avis, lu à la source** : [GHSA-vcvr-r3jv-pc5j](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j), publié le 2026-09-22, critique (CVSS 9,5). Il permet une exécution de code à distance dans `ImageResponse` de `next/og`, sur le runtime **Node**, quand l'application passe des valeurs contrôlées par un attaquant dans le contenu, les attributs ou les styles du SVG. Il touche `next` de 16.2.0 à 16.3.5 et se corrige en 16.3.6. Le runtime Edge n'est pas touché.

**Notre exposition, à notre lecture : faible, mais réelle sur le principe.**
- Toutes nos routes tournent sur Node, et un test l'impose (`next-config.test.ts`). Les images de partage passent donc par la voie vulnérable.
- Le modèle de l'image de résultat (`shareImageModel`) ne contient que des valeurs calculées côté serveur : le total, l'étape qui freine, l'action tirée de notre bibliothèque, la langue et deux booléens. Aucun texte libre, ni d'un visiteur ni de Gemini, n'atteint le SVG.
- La montée s'imposait quand même : une seule valeur mal bornée un jour aurait suffi.

**Les choix** :
- **`next` en 16.3.6, pas en 16.3.8**, alors que npm prenait la plus haute version d'office. 16.3.6 est la version corrective nommée par l'avis, publiée depuis neuf jours, et c'est celle que Dependabot propose. 16.3.7 et 16.3.8 apportent d'autres changements, publiés la veille. Le plancher de `package.json` passe à `^16.3.6`, pour qu'aucune installation ne puisse retomber sur une version vulnérable.
- **Les deux alertes transitives par `npm audit fix`** : `@grpc/grpc-js` en 1.14.5 (par `firebase-admin`) et `brace-expansion` en 2.1.7. S'y ajoute la même alerte sur cinq copies imbriquées de `brace-expansion` dans l'outillage ESLint, en développement seulement. Le lockfile ne change rien d'autre : la liste a été relue paquet par paquet.
- **Pas la PR groupée de Dependabot** ([#238](https://github.com/ScratchMe/tourdegrowth/pull/238), ouverte la même nuit). Elle monte aussi React en mineure (19.2 → 19.3) et `firebase-admin` (14.3 → 14.5), ce qui est trop pour un correctif de sécurité. Elle reste ouverte et se réduira d'elle-même au rebase.
- **Un piège d'outillage** : `npm audit fix --omit=dev` élague aussi les dépendances de développement de `node_modules`, sans toucher au lockfile. Le `npm audit fix` complet qui suivait les a remises (« added 337 packages »). Un `npm ci` a ensuite reconstruit l'arbre exact du lockfile avant toute vérification.

**Poids des bundles serveur** (`VERCEL.md` §1.2, `vercel build` hors ligne, `filePathMap` des six bundles physiques) : **46,66 Mo avant, 46,70 Mo après**, soit +0,04 Mo, très loin du seuil d'environ 1 Mo.

**Vérifié** :
- `npm audit` à 0, en production comme en développement, après un `npm ci` depuis le lockfile neuf.
- `eslint` et `tsc` propres, **2 403 tests unitaires** (2 405 après la fusion de #240, qui ajoute la garde des liens des documents), `vitest --coverage` au-dessus de ses seuils, et `next build` propre sous « Next.js 16.3.6 ».
- La suite Playwright complète, avec les variables de la CI et l'émulateur Firestore : **688 specs, 683 passées, 5 ignorées par construction, aucun échec ni rejeu**. Elle comprend les specs des images de partage (`share-previews`, `game-share-images`, `result-real`), qui exercent `ImageResponse`.

**En production (2026-10-01)** : [#241](https://github.com/ScratchMe/tourdegrowth/pull/241), squash `e82eeae`, 5 fichiers, arbre identique à la tête. Le statut `Vercel` du commit est `success` : le quota quotidien, épuisé la veille au soir (`VERCEL.md` §1.12), était rétabli. Vérifié en HTTP sur `www.tourdegrowth.com` : `/en`, `/quiz`, `/r/sample`, `/en/how-it-works` et `/fr/glossary/acv` répondent 200. Les images de partage de l'accueil, du résultat d'exemple et de `/fr/glossary/win-rate` sont servies en PNG 1200 × 630.

## A12.c : la copie du niveau 2 du jeu, relue sur les sources (2026-10-01)

**Ce qui est livré** ([#242](https://github.com/ScratchMe/tourdegrowth/pull/242)) : tout le texte du niveau 2 « Comment les gens vous trouvent », sans rien brancher (`content/game/acquisition.ts`, le chapeau et les métadonnées dans `meta.ts`). Aucune route ne l'importe : le joueur ne voit rien de neuf, et le niveau 1 ne change pas d'un mot. Tout est « à relire », d'après les premiers jets du §17.

**Les choix** :
- **Ce que le niveau 1 dit de toute année est repris par référence**, pas recopié : les mois, la frise, la visio, les nouvelles du trimestre, les mots du DG, le playbook, la boucle vers le Tour, le pied de page. Une correction faite au niveau 1, par exemple par le bon à tirer nº7, vaut pour les deux. Un test le tient (`ACQUISITION_CONTENT.months === RETENTION_CONTENT.months`, etc.).
- **Le téléphone et la pastille deviennent propres à chaque niveau** (`RetentionCopy`, `AcquisitionCopy` dans `lib/game/copy.ts`), comme `effects.extra`, qu'aucune carte du niveau 2 ne produit. Les gabarits suivent (`RETENTION_COPY_TEMPLATES`, `ACQUISITION_COPY_TEMPLATES`). La pastille du niveau 2 dit ce que le panier ajoute au prix affiché (« +29 € au panier »), un fait que la loi encadre, comme les clics du niveau 1.
- **Les règles de la série C sont extraites du test du niveau 1** (`game-copy-checks.ts`) : le niveau 2 y est tenu à l'identique. Trois tests de plus : **C12** (les espaces insécables des nombres, que la garde de typographie du dépôt ne voit pas), **C13** (l'arithmétique du téléphone : 1 290 + 29 = 1 319, + 19 = 1 338, −19 %, et des avis triés moins nombreux), **C14** (jamais « amende » pour une transaction pénale ; la règle rougit sur le texte du niveau 1).
- **Deux noms fictifs changés** : le vélo devient « Pédalix Ville 7 », parce qu'un « Urban 7 » réel (MAXTRON) était trop proche du « Urbain 7 » de la spec ; la marque partenaire inventée est « Ferlune », introuvable à la recherche du jour.

**C31, posée et tranchée en route** (Antoine était dans la session, la question s'est posée tout de suite) : à la fin du niveau 2, le bloc « Niveau suivant » renvoie vers le niveau 1, « jouable ». Les deux niveaux se renvoient l'un à l'autre ; écartés : un niveau 3 « bientôt », ni spécifié ni décidé, et pas de bloc du tout. Les liens viennent avec A12.f. `docs/decisions.md`, `GAME-BRIEF.md` §17.8.

**Deux relectures, et ce qu'elles ont trouvé** :
- **La relecture de copie** (`relecteur-copie`) : rien de bloquant, mais un téléphone qui contredisait sa carte. Trier et modérer les avis ne fait pas passer « 38 avis » à « 1 204 », et « dont 31 vérifiés » ne tient pas dans 29 avis : c'est maintenant « 4,6 ★ · 29 avis », « dont 24 vérifiés », et C13 le tient. Aussi : le titre anglais qui ne disait pas la même chose que le français, un chapeau qui supposait le niveau 1 joué, la fin `fine` qui disait que les clients « ne sont pas revenus » quand le modèle les fait revenir moins.
- **La vérification juridique**, sur Légifrance, la DGCCRF, la Commission, la CMA et la FTC : huit corrections, le détail dans `GAME-BRIEF.md` §17.9. Les plus importantes : le 28° dit « modifier » des avis, pas « déformer » (le mot de la directive) ; l'article 5-2 de la loi influenceurs accepte « une mention équivalente » depuis l'ordonnance de 2024 ; seule la livraison peut s'indiquer à part, **avec son montant** ; l'action CPC contre Temu est **toujours en cours**, et l'amende de 200 M€ du 28 mai 2026 porte sur le DSA, pas sur les fausses échéances. Une veille est posée en section E pour le jour où l'action se conclut.

**Piège** : un remplacement scripté a glissé des guillemets droits dans une chaîne anglaise elle-même entre guillemets droits ; le parseur a cassé l'import du module, et la garde de typographie a rougi sur « reads a French corpus » avant toute autre chose. Le test qui dit « le corpus existe » est aussi celui qui voit un module qui ne se charge plus.

**Vérifié** : `tsc` et `eslint` propres ; la suite unitaire complète verte (dont 38 tests du niveau 2 et les 37 du niveau 1, inchangés sur les règles extraites) ; un nouveau test refuse un mot « ordinaire » que plus aucun cas n'emploie : il a trouvé « Une », resté de la première version du cas Temu. Ni build ni Playwright : aucune route ne lit ces fichiers, la CI construit quand même.

**Reste au §17 et en lecture humaine** : le 28° et l'article 5-2 ont été lus par un outil de lecture, à relire à l'œil sur Légifrance avant l'ouverture (D9) ; le chapeau qui nomme Flixo, et les ajouts aux fins par rapport au premier jet du §17 (« La vraie vie non plus. », « Regarde la confiance… »), sont à montrer dans le bon à tirer du niveau 2 (A12.h).

**Fusionné avec le découpage de `GAME-BRIEF.md`** (#240, mergée pendant cette PR) : le §17 vit maintenant dans `docs/game/niveau-2.md`. Les cinq passages que cette PR y changeait (l'en-tête, le téléphone, décembre, les corrections du §17.9, le §17.11) y sont reportés tels quels ; les renvois « `GAME-BRIEF.md` §17.x » restent valides par la règle du nouveau fichier.

**En production (2026-10-01)** : [#242](https://github.com/ScratchMe/tourdegrowth/pull/242), squash `48bc535`, 14 fichiers, arbre identique à la tête. Le statut `Vercel` du commit est `success` ; `/en` et `/fr` répondent 200 sur le nouveau build (`age: 0`, `PRERENDER`). Rien de visible : aucune route n'importe encore la copie du niveau 2.

## A12.d : l'îlot du jeu, le même pour tout niveau (2026-10-01, #245)

**Ce qui change** : l'îlot du niveau 1 (le tableau de bord, la visio, la main, le rapport, les nouvelles, décembre) quitte `app/[locale]/game/retention/` pour `app/[locale]/game/_island/`, un dossier privé que Next ne route pas. Il ne sait plus rien du niveau 1 : un niveau y apporte son modèle, sa copie, le format de son chiffre et son téléphone. La page du niveau 1 lui passe `slug="retention"` ; rien ne change à l'écran.

**Les choix** :
- **Le format du chiffre vient du niveau** (`metricFormat` dans `lib/game/format.ts`, lu dans `level.display`) : le churn au dixième de point, les nouveaux clients à la dizaine (« 2 150 »). Un écart manqué se dit dans l'unité du niveau (« manqué de 170 clients ») et **jamais sous un pas** : le modèle compare des valeurs brutes, donc un trimestre peut manquer de 4 clients en affichant 2 150 pour un objectif de 2 150, et « manqué de 0 client » contredirait le verdict. La même règle vaut au niveau 1, où le cas pouvait déjà arriver en dixièmes (« manqué de 0,0 pt » devient « 0,1 pt ») : le seul changement visible du niveau 1, sur un cas rare. Une variation de clients s'arrondit à la dizaine (`DeltaKind "tens"`), comme les tuiles.
- **Le téléphone et sa pastille sont le « côté » d'un niveau** (`_island/sides.tsx`, `IslandSide`) : ce qu'il dessine, la forme courte de sa pastille pour la barre d'action, et ce que la région vivante dit quand une carte la change. Les fonctions de clics du niveau 1 y ont déménagé. `ISLAND_SIDES` est typé par `LevelSlug` : un niveau rendu jouable ne compile pas sans son côté.
- **Six composants perdent les noms du niveau 1** : `Dashboard` (`metric`, `customers`, `revenue`, et leurs `data-testid`), `EndingCharts` et `RevealCells` (`metric`), `QuarterReport` (les clés de ses chiffres), `ActionBar` (`pill`), `GameEntry` (`band.metric`). Les specs e2e et les aperçus de `.design-sync/previews/` suivent ; les aperçus sont vérifiés au type près contre les composants, par un `tsc` sur un barrel jetable (le bundle `tour-de-growth` n'existe que chez Claude Design). **Claude Design montre encore les anciens contrats** : la re-synchro est `CHANTIERS.md` B4, groupée avec A12.e et son composant neuf.
- **Les années de référence du niveau 2 sont partagées** (`lib/game/__tests__/paths-acquisition.ts`) entre les fixtures du modèle et l'îlot.

**Vérifié** :
- `tsc` et `eslint` propres, **2 464 tests unitaires**. Le test de l'îlot passe inchangé sur le niveau 1 (41 tests), et un nouveau le fait tourner sur **le niveau 2**, qu'aucune page ne joue encore : chaque écran de chaque fin, dans les deux langues, sans gabarit ni `undefined` ; jamais « % » ni « pt » à côté des nouveaux clients ; l'écart en clients ; le « pourquoi » en dizaines, dont les lignes font le mouvement de la tuile ; la courbe de décembre graduée en clients jusqu'à « objectif 3 000 » ; le tampon « Transaction · 150 000 € ».
- Build de production avec les variables de la CI, puis Playwright : **les 99 specs du jeu** (94 passées, 5 ignorées par construction, les specs « jeu fermé ») et les 76 des autres specs qui visitent ses pages (accessibilité, mouvement, en-tête, bande de l'accueil…).
- À l'écran, sur le même build : le tableau de bord du niveau 1 au 1er janvier (FR, 1 280 px) et décembre d'une année C (EN, 390 px), identiques à avant.

**En production (2026-10-01)** : [#245](https://github.com/ScratchMe/tourdegrowth/pull/245), squash `3bb1b1e`, 41 fichiers, arbre identique à la tête. Le statut `Vercel` du commit est `success` et `/fr` répond 200. Rien de visible : le jeu est fermé, et le niveau 1 ne change pas à l'écran.

## A12.e : le téléphone de Pédalix et sa pastille (2026-10-01, #246)

**Ce qui est livré** : le téléphone du niveau 2 et la pastille qui le suit (§17.7), sans rien brancher. Aucune page ne joue encore le niveau 2 : c'est A12.f qui l'inscrit dans `ISLAND_SIDES`.

**Les choix** :
- **Le dessin du téléphone est séparé de son écran.** Le cadre (légende, coque, écran, barre d'appli, éclair « ce qui vient de changer ») sort de `PhoneMock.module.css` vers `PhoneFrame.module.css`, partagé par les deux niveaux ; chaque téléphone ne garde que son contenu. Le point de couleur de la barre lit `--phone-brand`, que chaque téléphone pose : le bleu de Flixo, le vert de Pédalix. L'éclair passe dans un hook commun (`phone-flash.ts`) ; `PhoneMock` garde ses exports.
- **Ce que montre le téléphone est calculé, pas dessiné** (`lib/game/shop-phone.ts`, pur comme `view.ts`) : `shopPhoneView` donne la liste des éléments dans l'ordre où un visiteur fait défiler la page, `basketFor` ce que le panier ajoute. La livraison compte comme « en plus » tant que la fiche ne l'annonce pas (`delivery` ou `allin`) ; seuls des frais de service hors du prix (`teaser`) font passer la pastille au corail. Les montants (29 €, 19 €) sont des constantes que C13 tient d'accord avec la copie : la pastille et les lignes du panier ne peuvent pas se contredire.
- **`BasketPill` reprend les styles de `ClickPill`** : un seul objet sous le téléphone, dans les deux niveaux. Le montant arrive déjà formaté dans la langue de la page.
- **Un vert à Pédalix** (`--shop-brand`, 6,47:1 en texte sur blanc), mesuré par `game-token-contrast.test.ts` ; le prix lit un pas de l'échelle de l'appli (`--app-text-price`).

**Les gardes du design system ont attrapé trois écarts** avant la PR, tous dans le CSS neuf : une taille de prix en pixels (A1.5), des bordures en pixels pour le triangle de lecture et les roues (S-17), et un jeton « blanc sur le vert » que rien ne lisait (A1.6). Le triangle est maintenant un `clip-path`, les roues lisent `--border-width`, et le jeton orphelin est retiré avec sa paire de contraste.

**CodeQL a rougi sur la PR** (une alerte « high », *double unescaping*) : l'assistant de test qui lit le texte d'un rendu décodait `&amp;` avant `&quot;` et `&#x27;`, donc un `&amp;quot;` échappé serait devenu un guillemet. Sans conséquence dans un test, mais l'alerte est juste : `&amp;` se décode en dernier.

**Pour Claude Design** : deux aperçus neufs (`ShopPhone` : le départ, une année honnête, le bureau du troisième trimestre d'une année C, toutes les cartes sombres en français ; `BasketPill` : ses trois états, en français, en petit), construits sur des états que le jeu atteint vraiment, puis vérifiés au type près contre les composants. Les deux sont inscrits dans `componentSrcMap`, et `ShopPhone` dans `dtsPropsFor`, comme `PhoneMock` : la liste de ses éléments vient de `lib/`, et sans épingle le contrat n'en montrerait que le nom. La synchro elle-même est B4.

**Vérifié** :
- `tsc` et `eslint` propres, **2 479 tests unitaires**, dont 14 neufs sur le téléphone et la pastille : chaque carte a sa place à l'écran (sauf la revue des données, une réunion, et le retour en arrière, qui remet le téléphone comme avant), l'éclair ne marque que ce qu'une carte change, la phrase annoncée est mot pour mot celle de la pastille, aucun contrôle dans le dessin, et la remise affichée seulement à côté du prix de rayon.
- À l'écran, sur une page de développement jetable (non commitée), en français et en anglais, à 1 280 et 390 px : le départ, une année honnête, le bureau d'une année C, toutes les cartes sombres, toutes les cartes à la fois. Rien ne déborde de l'écran du téléphone, aucune erreur en console ; cocher `anchor` fait clignoter le prix, puis `allin` le prix et le panier, rien d'autre.

**Mergée, pas encore en production (2026-10-01)** : [#246](https://github.com/ScratchMe/tourdegrowth/pull/246), squash `a8d0456`, 19 fichiers, arbre identique à la tête. Le statut `Vercel` du commit est **`failure`** : « Deployment rate limited — retry in 24 hours », le quota quotidien de déploiements du compte épuisé (`VERCEL.md` §1.12). La production reste sur A12.d, sans dommage (le jeu est fermé, rien de visible), et le prochain déploiement de production, une fois la fenêtre passée, emportera tout ce qui aura été mergé entre-temps. Sans merge d'ici là, il faudra un « Redeploy » du dernier commit de `main`.

## A7.3.c, S2 : la prose de l'assisté, `{period}` et toute la copie neuve de l'hybride (2026-10-01)

Antoine : « Go pour S2 ». Trois commits sur la PR brouillon [#233](https://github.com/ScratchMe/tourdegrowth/pull/233) : `78f9abd` (la prose et `{period}`), `222f34e` (la copie et ses gardes), puis les corrections de la relecture. Rien n'est encore lu par un écran ni par une slide : S3 et S4 posent cette copie, et `ENGINE.md` §18.11 liste ce que chacun reprend.

**La prose du catalogue** (`engine-catalog.ts`) : les quinze chiffres de l'assisté, la liaison et les trois calculés, « à relire ». Les deux dictionnaires sont maintenant typés sur **tous** les identifiants (`Record<MetricId, …>`), si bien qu'une fiche sans prose ne compile plus. Le serveur résout tout le catalogue ; c'est l'îlot qui filtre par `shapesOf(motions)`, et la fiche ne propose « aussi dans cet outil » que les chiffres que la configuration demande. Les quatre fiches d'A7.3.e pointent vers leurs termes. Les trois comptes partagés de l'assisté ont un libellé identique dans chaque groupe, et le test des libellés partagés les couvre désormais, dans les deux langues.

**`{period}` porte sa préposition** : « de mai à juillet 2026 », « d'août à octobre 2026 », « en août 2026 » pour un seul mois, et l'année n'est écrite qu'une fois. Une préposition dans le gabarit aurait buté sur l'élision (« de août »), la même raison qui interdit « de {month} ». Trois remplisseurs l'ont : `catalogueValues` (demandes, annexe), la page statique (« [sur trois mois] ») et `catalogFill`. Ce dernier, le remplisseur propre à la fiche, aurait laissé passer « Leads créés {period} » comme libellé de champ : aucun test de `lib/engine` ne le lisait, et un test le garde maintenant.

**La copie neuve**, toute « à relire » : le réglage (type, motions, fenêtres, périodes de l'assisté), les réglages après coup (§18.1.2), `hybrid`, `total`, `relays`, les titres et pieds des slides des deux motions, les notes d'orateur de §18.8.3, la fiche (période, marge globale, pièges hybrides), le pas à pas par motion, le panneau « Et si » de l'assisté avec ses dix hypothèses, la reprise, l'import, et la sixième question de la FAQ, qui s'affiche déjà sur la page fermée (sa date passe au 2026-10-01). Les pièges hybrides des cinq fiches du libre-service ne sortent qu'en hybride (`phrases.ts#hybridTrapOf`).

**Trois formulations s'écartent de §18.8.2**, écrites dans `ENGINE.md` §18.11 :
- les titres des relais disent « on ne mesure pas {étapes} » : le taux de closing et la mise en production n'ont pas le même genre, et l'accord ne peut pas suivre les deux ;
- le cas « un seul payback » dit « il manque {entrée} », comme la slide du libre-service ;
- ce cas a deux gabarits plutôt qu'un `{libre-service|assisté}` : le libre-service est nommé d'abord même quand seul l'assisté est calculable. Le tableau de §18.8.2 contredisait la règle 1 de §18.6.4 ; la règle gagne. C'est la relecture qui l'a vu.

**Les gardes** :
- aucun comparatif dans `hybrid.*`, `total.*` et les titres des deux motions. La phrase fixe « chacune se lit contre ses cibles, pas contre l'autre » est la seule exception, et l'exception porte sur la phrase entière, pas sur le mot ;
- le libre-service avant l'assisté, dans les placeholders et dans les mots, partout où les deux sont nommés côte à côte ;
- aucune préposition devant `{period}`, et `{period}` absent des fiches du libre-service ;
- le contrat exact des dix-neuf titres neufs. Le test qui exige que chaque titre soit produit par le deck les tient dans `AWAITING_DECK` : S4 vide la liste, et le test tombe dès qu'un titre de la liste est produit sans en avoir été retiré.

**Non-vacuité, mesurée par sabotage** (onze plus deux) : chaque sabotage fait tomber au moins un test. Il y en a un par garde ci-dessus, plus `catalogFill` sans `{period}`, la page statique sans `{period}`, un libellé de compte partagé qui diverge, un libellé d'un autre groupe recopié, et le serveur réduit au catalogue du libre-service. **Un sabotage n'est tombé que par chance** : `{period}` glissé dans une fiche du libre-service, en anglais seulement. C'est la parité des placeholders qui l'a attrapé, pas le test fait pour ça, qui ne lisait que le français. Il lit maintenant les deux langues ; resaboté, il tombe.

**La relecture de la copie** (`relecteur-copie`), rien de bloquant :
- **corrigé** : l'ordre des motions dans le cas « un seul payback » (ci-dessus) ; la date de la page ; la réserve « beaucoup de praticiens » perdue dans la note de plafond de la LTV assistée ; « tout se lit sur trois mois », faux pour la NRR à douze mois ; « came » au passé en anglais face au présent français ; la note du levier de la liaison, dont le « en » n'avait d'antécédent qu'après la phrase de liaison ; « reporting de la direction, souvent trimestriel », sans source et différent de l'anglais ; « trois ordres de grandeur » sur l'ACV, quand son terme de glossaire dit « plusieurs » ; un piège de mise en production faux à 30 jours ; la ligne amont des relais, qui lisait « ~1 leads » ; le nom accessible du sélecteur, qui finissait sur « de » ; « Leads passés en opportunité » devenu « Passage des leads en opportunités » ; et la coquille « Quatre fiches » de §18.4.6, qui en liste cinq ;
- **pour le bon à tirer** : « Passer à l'assisté → » est à l'infinitif, comme dans la spécification et comme les boutons voisins, alors que l'en-tête de la copie veut des impératifs ; et la phrase de liaison nomme « assistées » avant « libre-service ». C'est le texte de §18.6.3, une phrase sur l'une des motions, pas une liste.

**Vérifié** : `tsc` et `eslint` propres, **2 560 tests unitaires** (contre 2 550 avant S2), couverture au-dessus de ses seuils. Build de production avec les variables de la CI : les 151 specs Playwright du moteur et de l'accessibilité passent, puis, après les corrections, les 137 du moteur, des données structurées et de `llms`. La page du moteur pèse ~242 Ko en HTML (FR), catalogue de l'assisté compris.

## A7.3.c, S3 : les écrans du moteur à deux motions (2026-10-01)

Antoine : « Go pour S3, S4 puis S5 ». Deux commits sur la PR brouillon [#233](https://github.com/ScratchMe/tourdegrowth/pull/233) : `da3f2c4` (les écrans), puis `74fef3a` (les tests de la vue, les e2e et les retours des captures).

**La configuration** choisit ses motions : deux cases, au moins une, chacune dépliant ses fenêtres (activation et paiement, qualification et mise en production), la cohorte suivie seulement si le libre-service est coché, et la ligne des trois mois que lit l'assisté. Dans les réglages, la dernière case cochée ne se décoche pas, et chaque changement de motion dit avant l'enregistrement ce qui reste sur l'appareil (« Décocher l'assisté le retire du tableau et des slides. Ses 15 chiffres… restent ») : décocher masque, n'efface jamais.

**Le tableau a trois mises en page** : le libre-service seul est celui de la v1 ; l'assisté seul a ses relais et son diagnostic ; l'hybride ouvre sur « Deux moteurs, un total » (le titre en pochoir est celui de la slide `total`, deux blocs de texte, le libre-service toujours à gauche, la liaison entre eux avec sa flèche dessinée et ce qu'elle n'est pas, puis les sommes), puis deux colonnes (couverture, diagnostic, peloton ou relais), la phrase « deux motions, deux segments », et un sélecteur qui montre les étapes et les « Et si » d'une motion à la fois. La liaison a son bloc sous l'acquisition de l'assisté, facultatif. Les titres des relais et du total vivent dans `lib/engine/deck-motions.ts`, lus par le tableau comme par le deck.

**Le reste** : la fiche (les trois mois, la phrase des petits effectifs, « Reprendre la marge globale » sur les deux fiches de marge en hybride, les pièges hybrides), le pas à pas par motion (les cibles groupées, les deux bases, « Passer à l'assisté → » puis « Passer aux « Et si » → », la liaison sautée), le « Et si » de l'assisté (ses leviers dont la liaison en opportunités entières, son trimestre, et le MRR total dans 12 mois sous les deux panneaux ; « tout remettre » ne touche que ses propres leviers), la reprise et l'import qui comptent par motion, l'exemple dans les motions cochées, et la page statique avec les deux catalogues et le lien.

**Vérifié en réel** : captures FR et EN à 390 et 1 280, relues. Elles ont trouvé deux défauts, corrigés : la ligne des mois de l'assisté était à l'encre d'alerte (une information n'est pas une mise en garde), et le « Et si » de l'assisté parlait du « funnel du mois » et intitulait « Levier » la colonne de son trimestre. Tests de la vue par motion (onglets, collecte, scénario) ; **un sabotage n'a rien fait tomber** : afficher chaque bloc du total avec son propre arrondi passait, parce que les parts de l'exemple sont exactes. Un cas de somme approchée les sépare maintenant. e2e : `engine-hybrid.spec.ts`, et quatre specs existantes mises au pas (la page compte 41 fiches, la configuration n'a plus de « modèle »).

## A7.3.c, S4 : le deck des deux motions (2026-10-01)

Commit `65728bb`. **Le modèle** : en hybride, `total`, puis les slides du libre-service, puis celles de l'assisté (relais, fuite, « Et si », la liaison en dernier, leur cumul), puis visibilité, unit economics, miroir, demande et annexe. L'assisté seul garde cet ordre sans total ni slide du libre-service. Le libre-service seul reste le deck v1 au caractère près : `buildDeck` n'emprunte le nouveau chemin que si l'assisté est coché, et le golden v1 est resté vert à chaque étape. La fuite est une seule fonction pour les deux motions (`buildLeak` lit le diagnostic qu'on lui donne) ; les slides neuves sont dans `lib/engine/deck-slg.ts`. Une motion qui a moins de deux ★ connus perd sa fuite et garde son funnel ; les deux aveugles, la visibilité monte après le total.

**Chaque motion porte son kicker, sa pastille et son pied** (`DeckModel.byMotion`) : « · assisté » dans le kicker, ses propres comptes, « Flux assistés de juin à août 2026 · leads de mai à juillet 2026 · sources : HubSpot et Stripe ». Les unit economics de l'hybride sont un tableau de cinq lignes en regard, jamais trié ; la visibilité, des pastilles par étape et par motion ; l'annexe, trois groupes avec leur en-tête (la pagination compte la place de ces en-têtes) ; le formulaire de la demande ne propose plus rien quand les deux motions nomment une étape. Le balayage des phrases (`sentences-guard`) a vu sa liste `AWAITING_DECK` vidée : chaque titre neuf est produit par un état du balayage, et toutes les règles de forme passent dessus.

**Ce que la vérification a trouvé**, trois défauts corrigés avec leur test :
- la slide de visibilité de l'hybride débordait sous le pied (trente-deux noms et huit cartes). Elle suit maintenant le texte de §18.8.2, « deux colonnes d'étapes × pastilles », et ses introuvables tiennent sur deux colonnes ;
- le miroir plantait dès qu'un Tour était relié à un hybride : il cherchait la LTV de l'assisté parmi les calculés du seul libre-service. C'est l'e2e qui l'a vu (le test unitaire du contrat des lignes utilisait un Tour à quatre réponses, sans ce pont) ;
- le miroir de l'hybride, une ligne par question et par motion, débordait de 170 px : deux colonnes, une par motion.

Deux sabotages ne sont d'abord pas tombés : une motion aveugle gardant sa fuite (le cas de test n'avait de toute façon pas de fuite) et une proposition faite quand les deux motions nomment (aucun test ne le couvrait). Les deux ont maintenant leur cas.

## A7.3.c, S5 : l'intégration (2026-10-01)

Commit `70bdec2`. **Q14** (C25, tranchée oui) : `engine_setup/<plg|slg|hybrid>` à la création du moteur et quand les réglages changent les motions, et les étapes de l'assisté comptées à part (`engine_stage_saved/slg-revenue`). Les listes sont épelées dans `lib/analytics/goatcounter.ts`, jamais construites ; la porte de l'îlot, le tableau de bord `/admin/stats` et la règle 5 de `engine-boundary.test.ts` lisent les mêmes. **La phrase de confidentialité** (D16) le dit : « la façon de vendre cochée (libre-service, assisté ou les deux), le premier chiffre enregistré dans chaque étape de chaque motion » ; elle repart « à relire », et la page est datée du 2026-10-01.

**Les e2e de §18.10.3** : le parcours hybride FR/EN × 1 280/390 (l'assisté saisi par ses fiches, le total exact, les deux diagnostics, la couverture de chaque motion, un rechargement, l'assisté décoché puis recoché, le fichier exporté, l'appareil vidé, le fichier réimporté) ; le canari étendu aux textes de l'assisté, à un compte à neuf chiffres et au changement de motions (aucune requête autre que GET) ; `engine-deck-hybrid.spec.ts` ; `engine-mobile.spec.ts`, qui n'existait pas (largeurs 360, 390 et 430 tenues, 320 mesuré à 0 partout, relais dans leur carte, colonnes de même hauteur, axe sur le tableau hybride, le clavier seul jusqu'au taux de closing).

**Deux pièges de mesure, à connaître** :
- un sabotage CSS peut être vide sans que la garde le soit : un `min-width: 400px` écrit au-dessus du `min-width: 0` de la même règle était annulé au build. Forcé pour de bon, il fait déborder le tableau de 190 à 260 px et les six tests de largeur tombent ;
- la lecture d'une vignette du deck juste après l'avoir fait défiler est revenue vide une fois sur huit (`content-visibility: auto`). La spec attend maintenant que chaque slide ait son texte avant de le lire, plutôt que d'accepter un vide.

**CodeQL a relevé un vrai défaut sur la PR** (*overly permissive regular expression range*) : la classe des glyphes permis d'`engine-deck-hybrid.spec.ts`, recopiée d'`engine-deck.spec.ts`, avait perdu l'espace insécable qui ouvre sa seconde plage. « ` -ÿ` » partait alors de l'espace ordinaire et laissait passer U+007F à U+009F, les contrôles C1 compris. Les deux plages sont maintenant écrites en échappements (` -~ -ÿ`), pour qu'une copie ne les perde plus. **Une plage de caractères copiée se relit en code point**, pas à l'œil.

**Vérifié** (sur la tête de branche, après la fusion d'A12.e) :
- `eslint` et `tsc` propres. **2 684 tests unitaires**, couverture au-dessus de ses seuils.
- Build de production avec les variables de la CI, puis **toute la suite Playwright** : 732 specs, 709 passées, 23 ignorées. Les 18 qui lisent un vrai `/r/<id>` sautent sans l'émulateur Firestore, et les 5 « jeu fermé » par construction. Une première suite complète, avant la fusion, était passée sans échec.
- **Une spec a échoué une fois, puis passé au second essai** : `platform-native.spec.ts:291`, la hauteur du `Disclosure` cinq images après son ouverture. Elle mesurait 46 px, la hauteur fermée, au lieu d'une valeur intermédiaire. Le test vient de #196, et cette PR ne lui change que la clé de stockage. Rejoué 30 fois seul, puis 36 fois à côté des specs qui impriment un PDF, il n'a plus échoué. Cause non trouvée, test non durci : un prochain échec se lit à partir d'ici.
- Le poids des bundles serveur (`VERCEL.md` §1.2) passe de 46,72 Mo sur `main` à 46,89 Mo sur la branche, soit +0,17 Mo. Tout l'écart est sur la page du moteur (6,75 → 6,92 Mo), sous le seuil de `/livrer` §0.

**Ce qui reste, et qui n'est pas du code de ce lot** :
- le bon à tirer de la copie neuve (A7.3.d), construit depuis `grep -rn "TODO: à relire" src/` ;
- `EngineDerived` garde ses trois champs du libre-service (`peloton`, `diagnosis`, `unit`), que §18.11 prévoyait de retirer après S4 : chaque écran du libre-service et le golden v1 les lisent, et les retirer n'apporte rien à l'utilisateur ;
- les textes de lancement : `marketing/kit.md`, `marketing/campaigns/README.md` §8, et la campagne du moteur, qui dit encore « quinze chiffres, trois par étape », « seulement le libre-service, pour l'instant » et traduit les noms d'étape (la relecture de S3 l'a relevé) ;
- sortir le §18 d'`ENGINE.md` vers `docs/engine/`, une fois #233 mergé (`CHANTIERS.md`, section E).

**En production (2026-10-01)** : [#233](https://github.com/ScratchMe/tourdegrowth/pull/233), squash `bed81fb`, 149 fichiers, arbre identique à la tête de branche. Le statut `Vercel` du commit est `success` : le quota de déploiements, épuisé pour les aperçus de la PR, n'a pas bloqué la production. `/fr/privacy` et `/en/privacy` portent la nouvelle phrase et la date du 1er octobre, et `/fr/aarrr-funnel-template` comme `/en/aarrr-funnel-template` répondent 404, drapeau fermé. Les deux derniers points ci-dessus sont livrés le même jour (l'entrée « Les textes de lancement du moteur… », plus bas).

## A12.f.1 : le niveau 2 jouable (2026-10-01, #247)

**Ce qui change** : le niveau 2 « Comment les gens vous trouvent » a sa page, `/{locale}/game/acquisition`, son image de partage, sa sauvegarde, sa place au sitemap et au hub, « jouable ». Le jeu reste fermé derrière son drapeau : rien de visible pour le public, tout pour l'aperçu propriétaire. A12.f est coupé en deux, parce que l'encart qui propose les deux niveaux (C30 Q5) touche la page la plus exposée et un composant du design system : A12.f.2 le fera seul. D'ici là, un goulot partagé entre acquisition et rétention offre l'acquisition seule, la première dans l'ordre AARRR.

**Les choix** :
- **Déplacer le slug, et laisser le compilateur lister le reste.** `LevelSlug` gagne `acquisition` ; `DraftLevelSlug` devient `never`, gardé pour le niveau suivant. Le compilateur a demandé la clé de sauvegarde (`tdg.game.acquisition.v1`), la copie de l'encart du résultat, le modèle et le côté dans l'îlot, les deux portes du résultat dans le vocabulaire. Ce qu'il ne voit pas (`GAME_LEVEL_SLUGS`, une liste) est maintenant gardé par un type, `GameLevelsCovered`, comme les fins et les humeurs.
- **Une page de niveau commune** (`app/[locale]/game/_level/LevelPage.tsx`), plutôt qu'une copie de celle du niveau 1 : la règle « une feuille de style de page reste avec sa page » (`page-styles-scope.test.ts`) interdisait de reprendre `retention/page.module.css` depuis un autre dossier, et deux pages identiques auraient dérivé. Chaque `page.tsx` n'apporte que son intro, ses deux mots du glossaire (acquisition et CAC au niveau 2), sa copie et son îlot.
- **L'îlot devient générique sur le niveau** (`GameIsland<S extends LevelSlug>`) : avec deux niveaux, une union de props perdait le lien entre le slug, la copie et le téléphone ; un paramètre de type le garde, et une page ne peut pas donner la copie du niveau 1 au téléphone du niveau 2.
- **Les deux niveaux se renvoient l'un à l'autre** (C31) : la zone de l'autre niveau devient un lien dans la navigation des zones, et le bloc qui clôt décembre aussi, avec un bord plein au lieu du pointillé du « pas encore ». Celui du niveau 1 dit « jouable ». Les liens portent `?from=other_level`, une porte nouvelle du vocabulaire.
- **Les fins se comptent par niveau** (`game_ending/<niveau>/<fin>`) : une amende chez Flixo et une transaction chez Pédalix ne sont pas la même année. Le jeu étant fermé, aucun compte n'est perdu ; plus tard, le changement aurait coupé la série. Le tableau de bord montre les fins et les années commencées par niveau, et le passage résultat → jeu se calcule sur tout goulot qui a un niveau, par la règle même de l'encart (`gameEntryFor`), pour que les deux ne dérivent pas.
- **L'image de partage reçoit le niveau en paramètre** : celle du niveau 1 ne tire pas la copie du niveau 2 dans sa fonction. La page et l'image du niveau 2 tirent en revanche celle du niveau 1, que sa copie reprend par référence (A12.c) : les plafonds de `content-fan-in.test.ts` montent, chacun avec sa raison.
- **Le chiffre de l'encart et de l'image vient du format du niveau** (`metricFormat`) : « Nouveaux clients 2 000 », jamais un pourcentage.

**Copie neuve, « à relire »** : l'encart du résultat du niveau 2 (titre, corps, bouton, « Nouveaux clients {metric} »), la fin du hub « le contrôle et la transaction », Pédalix nommé dans sa zone du hub comme Flixo dans la sienne, le texte de l'image du hub (« dont deux sont ouvertes »), le bloc de décembre du niveau 1 passé à « jouable ».

**Piège** : le budget de la requête GoatCounter (3 000 caractères d'URL) a rougi à 3 118, avec les fins par niveau. Il passe à 4 000, la moitié des ~8 Ko où les proxys refusent un GET, avec la raison dans le test.

**Deux relectures** (les sous-agents du dépôt) : rien de bloquant. La copie : deux chaînes neuves n'étaient couvertes que par le marqueur d'en-tête de leur fichier, que le bon à tirer nº7 a déjà absorbé ; elles ont maintenant leur marqueur daté. « Des nouveaux clients » devient « de nouveaux clients ». Et le nº7 ne dit plus ce que dit le code (« jouable », la zone et l'image du hub, la bande `{metric}`) : noté dans `CLAUDE.md`, à remettre d'accord ou à renvoyer au bon à tirer du niveau 2. La sécurité : aucun test ne disait que le jeu fermé ferme aussi la nouvelle page et son image. C'est le préfixe `/game/` qui les ferme, mais un jour quelqu'un pourrait le resserrer en une liste de noms. `proxy.test.ts` boucle maintenant sur les niveaux ouverts, sans en nommer aucun, et rougit si `isGamePath` ne couvre plus que `retention` (essayé).

**Vérifié** :
- `tsc` et `eslint` propres, **2 487 tests unitaires**.
- Build de production avec les variables de la CI, émulateur Firestore lancé : **la suite Playwright complète, 695 passées, 6 ignorées par construction, aucun échec**, dont les specs neuves : les deux niveaux au sitemap, au hub et en hreflang, chaque fin nommée par son niveau sur le hub, la page du niveau 2 et ses mots du glossaire, les zones qui se renvoient d'un niveau à l'autre, l'image du niveau 2, son accessibilité, et sur un vrai résultat lu dans l'émulateur l'encart du niveau 2, porte Deep dive, « New customers 2,000 ».
- Après la dernière retouche (l'étiquette « jouable » pleine), les specs du jeu et d'accessibilité repassées sur le nouveau build : 129 passées.
- À l'écran, à 1 280 et 390 px, en français et en anglais : l'intro de Pédalix, le bureau avec son téléphone et la pastille dans la barre d'action, une année C jusqu'à la transaction, le bloc de décembre qui mène au niveau 1, le hub à deux zones jouables. Aucun défilement horizontal.

**En production (2026-10-01)** : [#247](https://github.com/ScratchMe/tourdegrowth/pull/247), squash `9b8bfb3`, 57 fichiers, arbre identique à la tête (après une fusion de `main`, qui avait reçu A7.3.c). Cette fois, le statut `Vercel` du commit est `success` : le déploiement de production a emporté A12.e (#246), refusé le matin par le quota, avec A12.f.1 et A7.3.c. Le jeu reste fermé : `/fr/game`, `/fr/game/acquisition` et son image répondent 404, et le sitemap ne nomme aucune page du jeu.

## A12.f.2 : une carte, les deux niveaux (2026-10-01, #248)

**Ce qui change** : quand l'acquisition et la rétention freinent ensemble, l'encart du résultat propose les deux niveaux sur une seule carte, étape par étape (C30 Q5). Jusqu'ici, l'ordre AARRR choisissait à la place du lecteur. Une carte à un seul niveau ne change pas d'un pixel, et la bande reste à 44 px sur ordinateur.

**Les choix** :
- **`gameEntryFor` devient `gameEntriesFor` et rend une liste** : chaque étape du goulot qui a un niveau, la plus faible d'abord, sans doublon. Le renommage casse chaque appel à la compilation, ce qui est voulu pour un changement de sens. Le dénominateur de `/admin/stats` suit la même règle (`.length > 0`).
- **`GameEntry` reçoit `levels`**, une entrée par niveau proposé (l'étape, le lien, le bouton, le chiffre, la porte analytique). Le titre, le corps, la mention et la confiance absente sont communs à la carte. Il n'y a aucun chemin analytique neuf : chaque bouton compte la porte de son niveau.
- **La mise en page de la carte à plusieurs niveaux** : la bande toujours empilée, un chiffre par ligne puis la confiance ; une rangée par étape, son nom au-dessus de son bouton ; la mention une seule fois.

**Ce que l'écran a trouvé** (à 1 280 px, avant la correction) : un « · » suspendu en fin de première ligne quand la bande passait à la ligne, et deux mises en page dans la même carte, le nom « Acquisition » renvoyé au-dessus d'un bouton trop long alors que « Retention » restait à côté du sien. D'où la bande empilée et le nom toujours au-dessus.

**Copie neuve, « à relire »** : `GAME_ENTRY_SEVERAL` (« Le côté obscur de tes étapes », son corps, « vingt minutes par niveau, gratuit »). La relecture de copie a trouvé une phrase fausse sur certains résultats : « un niveau pour chacune des étapes qui te freinent » ne tient pas quand trois étapes sont à égalité et que deux seulement ont un niveau, alors que la page au-dessus dit « 3 étapes te freinent ». C'est devenu « les étapes ci-dessous » et « huit astuces par niveau », et un test tient le cas.

**Vérifié** :
- `tsc` et `eslint` propres, **2 698 tests unitaires**, dont les cas de la liste : deux niveaux dans l'ordre du goulot, un seul quand une seule étape du goulot en a un, jamais deux fois le même, l'ouverture Deep dive pour toute la carte.
- Une fixture e2e neuve : un vrai résultat lu dans l'émulateur, avec l'acquisition et la rétention à 0/20. Sa spec voit une carte, deux boutons dans l'ordre, les deux chiffres.
- Les specs du jeu, des résultats et d'accessibilité : 160 passées, 6 ignorées par construction.
- À l'écran, en français et en anglais, à 1 280, 390 et 360 px : la carte à deux niveaux et celle à un niveau, sans défilement horizontal.

**Mergée, pas encore en production (2026-10-01)** : [#248](https://github.com/ScratchMe/tourdegrowth/pull/248), squash `976e3e9`, 17 fichiers, arbre identique à la tête. Le déploiement de production a été refusé par le quota du jour (`VERCEL.md` §1.12), comme celui d'A12.e le matin. Le jeu étant fermé, rien n'est en retard pour le public, et le prochain déploiement l'emportera.

## Les textes de lancement du moteur, et le §18 d'`ENGINE.md` sorti dans `docs/engine/` (2026-10-01)

Demandé par Antoine après le merge d'A7.3.c : « ce qui reste, hors code », sauf le bon à tirer A7.3.d, qu'il mène avec un autre agent.

**Les textes de lancement** (`CHANTIERS.md` A7.3, ligne « Hors code ») : `marketing/kit.md`, `campaigns/README.md` (§0, §3, §8), `competitive-brief.md` et les six textes de `campaigns/engine/` disent maintenant ce que fait le moteur livré.
- **Deux motions à cocher** : dix-sept chiffres en libre-service (trois par étape, cinq au revenu), quinze en vente assistée (lus sur trois mois), ou les deux. L'hybride se montre en « deux moteurs, un total », jamais l'un contre l'autre (C4) : une ligne de risque neuve, au §8 du brief, le tient.
- **La FAQ du Show HN** « Only self-serve SaaS? » devient « What about sales-led B2B? ». La limite connue ne garde que l'appli grand public et la place de marché.
- **Le fil social ne nomme plus les étapes** : il les traduisait en français, alors que le produit les garde en anglais.
- **Aucun texte n'annonce plus un nombre de slides.** « 4 à 7 » était faux avant même l'assisté. Mesuré sur les jeux d'exemple des tests, le deck compte 5 slides en libre-service sans aucun chiffre, 7 sur l'exemple, 7 sur l'exemple assisté et 13 sur l'exemple hybride, puis une de plus par levier « Et si » déplacé, et une slide de cumul dès que deux leviers d'un même moteur bougent (17 avec trois leviers, dont deux sur l'assisté). Le kit dit maintenant de ne jamais en annoncer un.

**Trouvé en relisant, hors de la liste de `CHANTIERS.md`** :
- le kit et le §3 du brief laissaient encore une des deux fourchettes publiées désigner la fuite. C'était la décision 5 du 2026-09-24, que C1 a remplacée le 2026-09-29. Les textes prêts à coller le disaient déjà juste ; les deux documents qui servent à les vérifier, non ;
- le post Indie Hackers avançait « ~7 KB » pour la bibliothèque PNG, ce que le kit range parmi ce qu'il ne faut pas avancer tant que ce n'est pas remesuré. Il dit maintenant « a small library » ;
- la liste des événements du kit gagne `engine_setup/<plg|slg|hybrid>` (Q14).

**Le §18 d'`ENGINE.md`** (le B2B assisté et l'hybride) est sorti dans `docs/engine/assiste-et-hybride.md`, à côté de `v1.md`. Le texte est déplacé tel quel : ses 2 071 lignes sont identiques, à l'octet près, à celles de `main`. `ENGINE.md` passe de 2 371 à 300 lignes, et son tableau « Où vit la spécification » pointe le nouveau fichier : les renvois « `ENGINE.md` §18.12 » du code et des documents restent valides. Suivent l'en-tête de `v1.md`, l'index du `README.md`, la carte du dépôt de `CLAUDE.md`, et deux renvois d'`ENGINE.md` : « §18 de ce document », et « §4, §7 et §8 plus bas », périmé depuis le premier découpage.

**Vérifié** :
- `node marketing/check-lengths.mjs` : 71 longueurs, aucune au-delà de sa limite. Les deux descriptions de 800 caractères ont perdu « deux moteurs, un total » pour tenir.
- `vitest` : 2 699 tests passent, sur la tête fusionnée avec A12.f.2,, dont les liens de la documentation et les plafonds du journal et de `CLAUDE.md`. `main` compte 745 specs Playwright depuis A12.f.1 ; les chiffres de référence de `CLAUDE.md` restent ceux d'A7.3.c, mesurés avant.
- `relecteur-copie` sur le diff de `marketing/` : rien de bloquant sur les règles de la promotion ni sur la typographie. Il a relevé trois affirmations de la FAQ du Show HN contraires au code, toutes corrigées : « only two » repères (il y en a plusieurs, qui tous situent), « the one deliberate simplification » (chaque slide de fuite porte la sienne en pied depuis l'assisté) et une liste d'événements donnée pour complète qui en omettait trois. Corrigés aussi : « deux fourchettes » dans le kit et le brief, la règle du brief « Antoine n'est jamais nommé », qui contredisait C22, « moteur de croissance » (C2), le NRR assisté lu sur douze mois et non trois, une slide de cumul que le compte oubliait, et le marqueur `TODO : à relire` du Show HN, écrit avec une insécable que le grep ne voit pas. Laissés tels quels : deux écarts de parité anciens (« four tools » / « quatre onglets », et une demi-phrase absente de la description française de 800 caractères, qui la ferait dépasser).
- Un merge de documentation seule ne déploie rien (`scripts/vercel-ignore.sh`).

## A12.g : les specs Playwright du niveau 2 (2026-10-01, #250)

**Ce qui est livré** : `e2e/game-level2.spec.ts`, huit specs sur le modèle de celles du niveau 1. Les années de référence y sont écrites telles que le §17.6 les tabule, jamais recalculées : les tests unitaires tiennent le moteur à ces tables, ces specs tiennent l'écran. Les nouveaux clients s'affichent à la dizaine, sans « % » ni « pt ».
- **P1, P2** : le premier écran, en nouveaux clients, avec le téléphone de Pédalix et « +29 € au panier » ; aucune carte ne dit ce qu'elle rapporte.
- **P5** : un badge de pression apparaît sur la fiche sans changer le panier, et une livraison annoncée vide la pastille.
- **A, en français** : les ordres refusés, chaque trimestre au chiffre près, des applaudissements en décembre et le lien vers le niveau 1 (C31).
- **C, en anglais** : les frais de service du panier signalés en toutes lettres au T3, le contrôle au T3 et jamais avant, une transaction et jamais une amende, six astuces retirées.
- **D** : l'année renvoyée en juin, « Année interrompue » là où était la main.
- **La sauvegarde** sous `tdg.game.acquisition.v1`, sans toucher à celle du niveau 1.
- **P17** : 390 px à chaque phase. **P21** : axe sur décembre.
- **P20** : `game_started/acquisition/…` et `game_ending/acquisition/…`.

**Les assistants** (`game-helpers.ts`) prennent maintenant le niveau en paramètre : `seedGame` reçoit la clé et la version du modèle de chaque niveau, et `pickAndRun` accepte les cartes de l'un ou de l'autre.

**Vérifié** : la non-vacuité, d'abord. Avec les frais de service désactivés exprès dans `basketFor` puis reconstruit, l'année C rougit exactement sur `data-fees` et sur rien d'autre ; le code a été remis en place avant de reconstruire. Ensuite, sur le build final, les specs du jeu et d'accessibilité : 137 passées, 6 ignorées par construction. `tsc` et `eslint` sont propres.


## A14.a : la spécification du moteur complet, et le journal archivé une fois de plus (2026-10-01)

Demandé par Antoine : « on devrait gérer tout ce que tu listes dans le point 3 ». C'est-à-dire tout ce qui manque au moteur pour le SaaS B2B, avant l'app grand public et la place de marché. La spécification est le §19 d'`ENGINE.md`, écrite directement dans `docs/engine/moteur-complet.md` pour n'avoir pas à la déplacer après. Elle compte onze chantiers, un découpage en huit PR (~16,5 jours-agent), et dix-neuf questions pour C32, chacune avec sa recommandation. L'export PowerPoint reste hors du lot, comme la spec v1 le voulait.

**Écrite contre le code, pas contre les documents.** Trois relevés en parallèle (série et stockage ; outils et collecte ; chiffrage et surfaces) ont lu le code de `main`, avec un renvoi `fichier:ligne` pour chaque fait. Ce qu'ils ont trouvé et qui change la spec :
- **les périodes d'un mois dépendent de la date du jour** (`values.ts:141-142`, `cohort.ts:155-168`). Relu plus tard, un mois clos changerait de période et de confiance. La série pose donc `closedAt` et `windows` sur chaque mois clos ;
- **la source est stockée une fois par chiffre**, pas une fois par numérateur et par dénominateur : le contrôle « deux outils » demande un champ de plus (`denominatorSource`) ;
- **la formule de la boucle de recommandation existe déjà** dans le « Et si » (`scenario.ts:260-265`). Le chiffrage en € la reprend, pour que la slide de fuite et le « Et si » ne puissent pas se contredire ;
- **le design system n'a pas de blanc pur** : sa surface la plus claire, `--paper-0`, tire sur le crème. Le fond blanc demande un jeton primitif, et c'est une question (Q14) ;
- **un défaut** : `ALL_TOOLS` (`_engine/sources.ts`) oublie Pipedrive et la plateforme de customer success, qui ne paraissent donc jamais sous « Autres outils ». Le correctif entre dans T0.

**Le golden v1 ne bougera pas** : aucun de ses sept jeux n'a de cible sur la rétention J30 ni sur la part recommandée, vérifié dans `golden-v1-inputs.json`. Les chiffrer en € ne change donc ni une slide ni une ligne pour un fichier v1. Un golden v2 sera figé sur les jeux de l'hybride avant la première ligne de T0, comme le v1 l'avait été avant A7.3.c.

**Le journal, archivé une fois de plus.** À environ 197 000 caractères pour un plafond de 200 000, avec plusieurs sessions qui y écrivent le même jour, les entrées du 2026-09-30 sont parties telles quelles dans `docs/journal/09-decisions-codees-et-extension-04.md`. La table des volumes gagne sa ligne, et ce fichier repart à environ 72 000 caractères.

**Vérifié** :
- `vitest` : les liens de la documentation et les plafonds du journal et de `CLAUDE.md` passent. La spec, le neuvième volume et les index sont lus par le test des liens.
- Documentation seule : rien n'est déployé (`scripts/vercel-ignore.sh`).


## C32 : le moteur complet, validé (2026-10-01)

Les dix-neuf questions de `docs/engine/moteur-complet.md` §19.15, tranchées dans la session qui les avait écrites : les quatre plus lourdes d'abord, puis par groupes de quatre, Antoine ayant préféré les voir une par une plutôt qu'en bloc. Les réponses sont datées dans la spec, et les sections qu'elles changent sont corrigées.

**Deux reprises de la reco, une précision** :
- **Q1 : l'ouverture du moteur attend A14**, bon à tirer compris. Conséquence pour la livraison : sans ouverture d'ici là, chaque PR du lot se merge sur `main` dès qu'elle est verte, drapeau fermé, comme celles du niveau 2 du jeu. La branche d'intégration n'avait de raison que si le moteur ouvrait pendant le lot. Le bon à tirer A14.d passe avant l'ouverture (D2).
- **Q17 : l'image de partage passe d'abord par Claude Design.** Elle devient le brief B5 de la design sync, et T6 attend son retour pour la porter dans `lib/og/`.
- **Q5 : la slide « Ce qui a bougé » existe, mais décochée par défaut.**

Le reste suit la reco : le mois suivant reprend les cibles et les définitions, jamais une valeur ; les mois passés en lecture seule avec « Corriger » ; des écarts sans couleur ; la rétention J30 et la part recommandée en € ; la couverture du pipeline comme indicateur avancé ; les outils, le contrôle « deux outils », le modèle de tableau, dix moteurs au plus, la fusion avec aperçu, le blanc pur, les deux rappels `.ics`, les deux portes d'entrée, trois ajouts à GoatCounter, et pas de PowerPoint.

**Une question d'Antoine en route** (Q16) : la carte « Le moteur » de l'accueil et la pastille de la bande noire deviendront-elles cliquables ? Oui, et sans rien à construire : C15 (A7.9) les a câblées sur le même drapeau que l'ouverture, mesurées par `home_strip` et `space_band`. La bande reste sans lien dans le questionnaire et le Deep dive (`bandLinked={false}`), pour ne faire sortir personne en plein parcours. Avis donné : la garder cliquable ailleurs, puisque c'est la seule navigation entre les trois espaces.

**Un numéro rattrapé** : la décision s'appelait C31 dans le premier jet. `docs/decisions.md` montrait C31 déjà prise le matin même par le jeu (le bloc « Niveau suivant »), que la liste de `CHANTIERS.md` ne reportait pas encore. Renumérotée C32 avant le merge. Comme pour un numéro de PR (convention 8), un numéro de décision se lit dans l'index, pas dans une liste qui peut être en retard.

## Design sync B4 : le niveau 2 et A7.3.c dans Claude Design, et ce que la régénération a trouvé (2026-10-01, #253)

Antoine a lancé `/design-sync`. B4 devait recapturer les neuf composants changés par A12 et les deux nouveaux (`ShopPhone`, `BasketPill`) ; le projet est à jour avec **90 composants, 303 cellules** (ancre `fee6cc7084fe`, 463 fichiers, aucune suppression, `design/` laissé tel quel).

**Deux méthodes ont trouvé plus que la liste de B4**, et aucune n'était de regarder une planche :
- **La recherche de dérive** de `.design-sync/NOTES.md`, passée en script (chaque chaîne retirée du produit depuis le dernier envoi, cherchée dans les aperçus) : `ZoneNav` montrait encore la zone acquisition « bientôt », `Choices` citait le choix de modèle d'avant A7.3.c, `Tag` un « coming soon » qui n'existe plus. Lire les nouveaux appels a ajouté `Checkbox.LastMotion` : A7.3.c a branché l'état désactivé avec sa raison.
- **Régénérer chaque aperçu du jeu** avec les fonctions de l'îlot (`dashboardProps`, `decemberContent`, `reportContent`, `newsContent`, `timelineSegments`, `journalEntries`, `phoneView`, `shopPhoneView`, `basketFor`, `clicksFor`) et comparer octet par octet : `RevealCells` (4,1 % / 18 / 81) et `QuarterTimeline` montraient des chiffres qu'aucune année n'atteint, notés « bon » depuis le 2026-09-29. Ils viennent maintenant d'années jouées ; une marche aléatoire sur le reducer trouve en secondes une année de la forme voulue (le labyrinthe : 4,0 % pile, confiance 31, radar 74).

**Un défaut du produit, trouvé en mesurant `LastMotion` dans un navigateur** : `.disabled .input`, de même poids que `.input:checked` et plus loin dans la feuille, repeignait le fond d'une case cochée et désactivée. Dans les réglages du moteur, la dernière façon de vendre avait l'air décochée juste au-dessus de « Il faut au moins une façon de vendre ». Corrigé dans `Checkbox.module.css` (le remplissage, coupé à l'intérieur du bord en tirets) avec une mesure du fond calculé dans `engine-hybrid.spec.ts` ; non-vacuité : sans la règle, 1 test sur 11 tombe, sur cette ligne.

**Ce qui ne part pas** : le motif par défaut des guides incluait `docs/*.md`, et le build copiait `docs/decisions.md` comme guide de design ; `guidelinesGlob: []`. `relecteur-copie` a confirmé chaque chaîne affichée et corrigé six affirmations des commentaires et de `conventions.md`.

**Vérifié** : 2 699 tests unitaires, `tsc`, `eslint` ; les specs du moteur et d'accessibilité (28) sur un build de production ; le rendu des 90 composants (0 « bad ») ; chaque fichier envoyé relu dans la liste du projet.

**Pour la prochaine synchro** : une note reportée dit que la planche avait l'air juste, pas que ses chiffres sont ceux du modèle. Les aperçus du jeu que B4 n'a pas régénérés sont listés dans `NOTES.md`, avec la recette.

## A15 : la finition UI et UX, d'après les reels et les lois de l'UX (2026-10-01)

Une seule PR pour tout le lot, à la demande d'Antoine (moins de déploiements Vercel). Le numéro était A14 jusqu'à ce que #254 prenne A14 pour le moteur complet, mergée la première : la section, les commentaires et les specs sont passés à A15 à la fusion.

### Le premier reel : le bouton

Parti d'un reel envoyé par Antoine, lu par sa légende : six règles pour un bouton principal (taille, libellé, contraste, relief, détail, mouvement). Confrontées à `Button` :
- **quatre déjà tenues** : la taille par défaut fait 47 px de haut sur 24 px de côté, le contraste est gardé par la CI (convention 7), le retour visuel part à l'image suivante (la transition de 120 ms n'est pas un délai), les libellés sont un verbe et un objet (« Démarre ton Tour → ») ;
- **deux écartées** : le rayon égal à la demi-hauteur et le relief doux, lumière venue du haut, sont un style, contraire à l'autocollant de la direction I (2026-09-28) ;
- **un écart réel** : `size="sm"`, dessiné et touché à 39 px, sous `--hit-min` (« jamais moins »).

**Ce qui change** : `.sm` porte la bande transparente de `quiet` (`::before`, 44 px au moins sur chaque axe, centrée sur le bouton). 39 px dessinés, 44 touchés, rien ne bouge autour. Côté public : l'appel de l'en-tête de l'accueil (masqué sous 760 px, visible sur une tablette), « Reprendre la marge globale » du moteur, le « réessayer » d'un graphique en erreur, « Copier le Markdown » du badge ; et les boutons de l'audit. La bande plutôt qu'un `min-height` sur écran tactile, parce que c'est déjà la règle du système pour ce qui est dessiné petit (`quiet`, `Segmented` compact, les `?` du glossaire).

**Vérifié** :
- `targets.spec.ts` : les aides de `quiet` deviennent `expectTapTargets`, pour tout bouton, et trois tests neufs (l'en-tête à 820 px, la marge de l'hybride à 390 px, le badge d'un vrai résultat lu dans l'émulateur) tiennent les trois mêmes affirmations. Non-vacuité : sans `.sm::before`, exactement ces trois tombent, sur la bande (39,5, 40 et 39,75 px), les neuf autres passent.
- Le doigt volé à un voisin, balayé : la bande dépasse de 2,5 px, et le voisin le plus proche d'un petit bouton est à 12 px (l'audit), 20 px (l'en-tête), 36 px (le résultat) et 50 px (le moteur, dont les deux fiches de marge sont les seules, sur 130 ouvertes en trois états à 390 et 1 280 px, à en porter un). La spec le dit, plutôt que d'exiger un voisin qui n'existe pas.
- À l'écran, en français et en anglais : l'en-tête, le badge et la fiche du moteur inchangés.
- `tsc`, `eslint`, `next build` propres ; `vitest --coverage` : 2 699 tests, seuils tenus. La suite Playwright complète, avec l'émulateur : 750 specs, 743 passées, 6 ignorées par construction (« jeu fermé »), une tombée : la miniature « total » du deck hybride lue vide (`engine-deck-hybrid.spec.ts:87`, en anglais), pendant que `vitest` tournait à côté. C'est la lecture que le commentaire de la spec décrit déjà ; rejouée seule six fois dans les deux langues, 12 sur 12.
- Pas de re-synchro Claude Design : rien de visible. Le contrat de `Button.tsx` dit la bande ; la prochaine re-synchro l'emportera.


### A15.1 à A15.6, livrés dans la même PR

- **A15.1, les autres cibles sous 44 px** : pastilles de la bande d'espace, logo, retour et termes liés du glossaire, étapes de « Comment ça marche » et de la checklist, comparaisons. Une bande partagée, `styles/hit.module.css`, composée. Les termes liés tiennent en rangées : à 12 px d'écart, les bandes de deux rangées se rencontraient (« LTV » touché sur 31 px) ; elles passent à 26 px. Non-vacuité : sans la bande, les sept tests tombent ; rangées à 10 px, seul celui des termes liés.
- **A15.2, un objectif effacé par une faute de frappe** : `isUnreadableNumber` sort de `NumberField` vers `lib/forms/number.ts`, et les deux champs d'objectif n'écrivent rien tant que la case ne se lit pas. Non-vacuité, un champ à la fois.
- **A15.3, l'enregistrement refusé d'une fiche** : le focus va au premier champ en cause ; un taux hors de 0 à 100, un montant ou une durée négatifs se disent en quittant la case ; un négatif n'est plus « manquant » ; les bornes estimées d'un taux sont tenues à 0–100. Le double message (sous le champ et sous le bouton) est gardé : c'est la règle écrite en tête de `sheet-problems.ts`. **Un sabotage a passé** : la vérification au départ de la case, retirée, laissait le test vert, parce que le test tapait le taux APRÈS un enregistrement refusé, et qu'une fiche déjà essayée relit ses règles à chaque frappe. Test réordonné, puis les deux sabotages tombent chacun sur leur ligne.
- **A15.4, l'écran d'erreur** : REVIEW.md R-04 voulait le code court et stable sous la phrase, pour le support ; il est gardé. Ce qui change : la phrase dit la panne (hors ligne, limite horaire avec l'attente lue dans `Retry-After`, ou nous), et le code n'est jamais ce qu'a levé la requête (`Failed to fetch`, `Request failed (504)`, une phrase de validation) : `HTTP_504`, `NETWORK`. `lib/quiz/request-failure.ts`, quiz et Deep dive.
- **A15.5, « Réessayer »** : `reset()` → `retry()`, stable depuis Next 16.3 (lu dans `node_modules/next/dist/docs`). Testé par le comportement : un clic envoie une requête pour la page ; avec `reset`, aucune.
- **A15.6, l'attente du Deep dive**, validée par Antoine : un message, une barre qui suit l'horloge contre la minute habituelle sans jamais se remplir (`lib/quiz/wait-progress.ts`), le temps écoulé, la ligne R2-09 à 5,2 s. Testé à l'horloge de Playwright, avancée de deux minutes. À l'écran, la première version dessinait le rouge entre deux pointillés : le contour passe en pseudo-élément, sous une pastille pleine. `message2` et `--dur-wait` partent, sans lecteur (`motion-scale.test.ts` l'a dit).

**Copie neuve ou réécrite, « à relire »** : `errorOffline`, `errorRateLimited` ; dans le moteur, `notANumber` (« Écris un nombre, par exemple 1 250 ou 18,5 »), `lowAboveHigh` (« Échange les deux… »), `amountNegative`, `durationNegative`. Elles changent la copie du nº8, à remettre d'accord.

**Vérifié sur la tête finale** (fusionnée avec #254) : `eslint`, `tsc`, `next build` propres ; `vitest --coverage` 2 719 tests, seuils tenus ; la suite Playwright complète avec l'émulateur et `CI=1`, 770 passées et 6 ignorées par construction, sur 776.

**Claude Design** : trois contrats changent (`ErrorScreen` prend `retry`, `LoadingScreen` dessine autrement, `Button` `sm` décrit sa bande) ; aperçus et conventions suivent dans le dépôt, la re-synchro reste à faire (B).

### Les lois de l'UX

Le recueil Laws of UX (30 lois), confronté au code par trois agents en lecture seule, un par parcours ; chaque écart retenu revérifié à la source. Les règles sont dans `design/LOIS-UX.md` ; huit correctifs (A15.7 à A15.14) et six décisions (A15.15 à A15.20) dans `CHANTIERS.md`. Antoine a retenu les cinq recos qui se codent le même jour, et choisi de merger cette PR seule : correctifs et décisions suivent dans une seconde. Écartés : l'effet esthétique-utilisabilité, les biais cognitifs (déjà « never claim more than the numbers support »), Occam, Pareto, Parkinson, Prägnanz, la connexion uniforme, et le flow du jeu, où rien n'est à corriger.

**Trois autres reels, le même jour** (chargement, validation de formulaire, cartes), confrontés au code par trois agents en lecture seule, chaque constat retenu revérifié à la source. Retenus : A15.2 à A15.6 dans `CHANTIERS.md`. Écartés, avec la raison :
- les squelettes : aucune page n'attend de données mises en page ;
- la coche verte sur un champ juste : « Enregistré » existe déjà ;
- « pas de récapitulatif en tête » : contraire au GOV.UK Design System, qui met le message sous le champ *et* un récapitulatif à liens ;
- la grille de 8 stricte : l'échelle est hors grille à dessein (`spacing.css`) ;
- le rouge réservé à l'action : c'est la marque ;
- l'ombre venue du haut : la direction I ;
- 150 à 300 ms : notre 120 ms au survol est plus rapide, et le reel du bouton du même compte demandait un retour en moins de 100 ms ;
- les rayons concentriques d'un bouton dans une carte : 2 px au lieu de 12 casseraient le bouton.


## A14.c, T0 : le socle v3, plusieurs moteurs par appareil (2026-10-01, #255)

La première PR du moteur complet (`docs/engine/moteur-complet.md` §19.1 et §19.13), drapeau fermé. Rien ne change à l'écran : T0 pose ce que T1 à T6 vont remplir.

**Le golden v2, figé avant la première ligne.** Six états v2 (l'exemple en libre-service, l'hybride, l'hybride avec « Et si » et Tour lié, l'hybride sans chiffre de l'assisté, l'assisté seul et l'assisté vide), et ce que le build v2 en tirait en français et en anglais : le tableau dérivé entier, le deck entier et son export texte, les deux scénarios, les onglets de chaque motion, la reprise et le plan de collecte. Écrits une fois, au commit « golden v2 figé », par le code v2. Comme pour le golden v1, seule la fonction qui ouvre un v2 peut suivre la version suivante ; ce que le v2 imprimait, non.

**Le fichier passe en version 3.** Un v2 n'y gagne que son numéro : `setup.tools`, `setup.pipeline`, `deck.theme`, et sur un mois `closedAt`, `windows` et `pipelineOpen`, sont **optionnels**, absents voulant dire « pas dit » ou « papier ». C'est un écart à la spec, qui prévoyait d'écrire `tools: []` et `theme: "paper"` à la migration ; il est noté au §19.1.2. Un build v2 refuse proprement un fichier v3 (« version inconnue »), et ce build refuse un v4 de la même façon.

**Plusieurs moteurs par appareil.** Un index sous `tdg.engines.v3` (le moteur à l'écran et l'ordre), et une entrée par moteur sous `tdg.engine.v3.<id>`, de la même forme que l'ancienne clé unique. Dix moteurs au plus (Q12), refusés en `full` au-delà. Les trois règles d'avant tiennent pour chaque clé : une écriture qui échoue est rendue à l'appelant, une entrée illisible n'est jamais prise pour un appareil vide ni écrasée, et l'ancienne copie (`tdg.engine.v2`, ou `v1` derrière elle) reste jusqu'à une sauvegarde exportée plus récente. L'îlot appelle toujours `loadEngine`, `saveEngine` et `clearEngine`, et rien ne change pour lui : sans `add`, un autre moteur **remplace** celui à l'écran, comme l'import « Remplacer » le faisait. `listEngines`, `setActiveEngine`, `deleteEngine` et `saveEngine(…, { add: true })` attendent leur écran, en T5.

**La validation** connaît les règles neuves du §19.1.6 : au plus 36 mois, des mois strictement croissants, `closedAt` sur chacun sauf le dernier, des outils connus et sans doublon, un pipeline positif, un dénominateur venu d'un autre outil vérifié comme une source, et un deck papier ou blanc.

**Le défaut trouvé en écrivant la spec est corrigé** : Pipedrive et la plateforme de customer success manquaient à `ALL_TOOLS`, et donc à « Autres outils ». La liste se déduit maintenant d'un objet typé `satisfies Record<ToolId, true>` : un outil ajouté au type sans être ajouté là ne compile plus.

**Les specs e2e écrivaient l'ancienne clé** : quatorze fichiers posaient `tdg.engine.v2` avec des états v3, que le lecteur de l'ancienne clé refuse (il exige un état v2 dedans). Un assistant, `e2e/engine-helpers.ts`, construit les deux clés comme `storage.ts` les écrit et relit l'entrée du moteur à l'écran. `engine-migration.spec.ts` couvre maintenant un appareil v1 **et** un appareil v2, plus un fichier v2 ouvert sans note de migration.

**Non-vacuité**, mesurée en sabotant puis en restaurant le code. Chaque sabotage fait tomber les tests qui le visent, et aucun autre :
- garder l'entrée remplacée, revenir au premier moteur après une suppression, oublier les entrées dans « Tout effacer », lever le plafond de dix ;
- côté validation : un mois ouvert avant le dernier, deux fois le même mois, un outil en double, un objectif à zéro, un dénominateur non vérifié ;
- faire refuser le v3 par `io.ts` (six tests) ;
- perdre `whatIf` à la migration : les deux goldens, sur leurs états avec « Et si ».

**Un test était trop faible, et le sabotage l'a montré** : une migration v2 → v3 qui étale l'état au lieu de le copier en profondeur passait tout. Le test « laisse l'objet v2 tel quel » ne regardait que l'objet lui-même. Il modifie maintenant l'intérieur de l'état migré et vérifie que la copie v2 n'a pas bougé.

**Un test lent sous charge** : « a row never says a change… » (`deck.test.ts`) prend 1,5 s seul. Il a dépassé ses 5 s une fois, pendant qu'un sabotage tournait à côté de la suite Playwright. Seul, il passe. Relevé ici, pas durci.

**Vérifié** :
- `vitest --coverage` : 2 727 tests passés sur la branche seule, 2 747 une fois fusionnée avec B4 et A15, au-dessus des seuils ;
- `tsc`, `eslint` et `next build` (avec `GAME_ENABLED=true`, comme la CI) propres ;
- Playwright sur la branche seule : 757 specs, 730 passées et 27 ignorées, aucune au second essai. Puis, fusionnée avec B4 et A15 (`CI=1`) : 778 specs, 750 passées et 28 ignorées (22 faute d'émulateur, dont la spec d'A15 dans `targets.spec.ts` ; 6 « jeu fermé », par construction), aucun échec. Les cinq specs de migration, dont les deux appareils v1 et v2, passent du premier coup.
- **Deux fusions de `main` en route**, B4 (#253) puis A15 (#252), mergées pendant que la PR attendait. Tant que la PR était en conflit, GitHub ne lançait pas `ci.yml` : seul CodeQL tournait, et rien ne le disait. La seconde fusion a aussi apporté une graine d'A15 qui écrivait encore l'ancienne clé `tdg.engine.v2` ; elle passe par `writeEngineSeed`. Relevé dans `GITHUB.md` avec T1.
- la barrière de `/livrer` §0 relève deux fichiers non TypeScript ajoutés sous `src/` : `golden-v2-inputs.json` et `golden-v2.json` (1 Mo à eux deux). Ce sont des données de test lues par `readFileSync` dans Vitest seulement, comme celles du golden v1 ; aucun `.nft.json` du build ne les trace, donc aucun bundle serveur ne les porte.


## A15.7 à A15.20 : ce que les lois de l'UX laissaient à faire (2026-10-01, #257)

La seconde PR d'A15, comme Antoine l'a choisi (#252 mergée seule d'abord). Huit correctifs et quatre des cinq décisions qu'il a tranchées sur les recos ; la cinquième, A15.18, n'a pas tenu à l'écran et lui revient (C33). A15.19 part à Claude Design (B7).

**Les correctifs** :
- **A15.7, le quiz se corrige après la 15ᵉ réponse** : un retour discret sur les écrans du profil et du ton, et leur en-tête dit ce qui reste (« Plus que deux écrans », puis « Dernier écran ») au lieu de « 15 / 15 répondues ».
- **A15.8, les centimes d'un montant** : cinq taux dont les deux termes sont des montants (marge brute, expansion, contraction, NRR, marge assistée) portent `amounts` dans `catalog-shape.ts` ; leurs deux cases prennent les décimales, l'unité « € » et le message d'un montant.
- **A15.9, l'étape « base » ne jette plus rien** : une valeur illisible, décimale ou nulle arrête l'étape et dit pourquoi (« Un nombre plus grand que zéro : on compte des personnes. »). Elle lit la case brute : `NumberField` rend `null` pour une case illisible comme pour une case vide.
- **A15.10, Postel** : « 18 % », « 1 200 € », « €1,200 » se lisent (`lib/forms/number.ts` retire les signes d'unité, que la case affiche déjà) ; un compte négatif est refusé dans la fiche comme à l'import. Le test d'A15.2 qui tapait « 25 %% » comme exemple illisible tape maintenant « 25 kg ».
- **A15.11** : « Imprimer ou enregistrer en PDF », le geste que fait le bouton.
- **A15.12, une fiche garde sa saisie** d'un onglet à l'autre ou repliée : `sheet-drafts.ts`, en mémoire seulement (l'appareil garde ce qui est enregistré, jamais une saisie à moitié), effacé avec le moteur ou à l'import. **Il renverse un comportement tenu par un test** : `platform-native.spec.ts` gardait « replier une ligne jette ce qui a été tapé, comme la fermer l'a toujours fait », écrit le 2026-09-29 quand la ligne repliée est restée dans la page (`hidden="until-found"`) pour garder l'ancien comportement, pas pour le décider. La suite complète l'a montré ; le test tient maintenant le contraire, et vérifie que rien de la saisie n'atteint l'appareil.
- **A15.13, les sections du résultat sont des titres** : `MetaLabel` prend `as` (`h2` pour les forces et les faiblesses). Son rendu par défaut ne change pas ; le contrat part à la re-synchro (B6).
- **A15.14** : quand une des forces montrées est faible, la section dit « Ce qui tient le mieux », pas « Points forts ». Une fixture d'émulateur neuve, `low` (toutes les réponses au plus bas), le montre. Sur ce tableau à zéro partout, la section nomme encore deux étapes ex aequo : honnête avec ce titre, gardé.

**Les décisions** :
- **A15.15** : sur téléphone, l'accueil se ferme sur « Démarre ton Tour », sous l'encart du fondateur ; sur un écran plus large, l'en-tête collant garde le sien et le bloc est masqué (deux primaires seraient en vue).
- **A15.16, « Reprends ton Tour »** : `TourCta` lit les réponses gardées après le montage et dit où l'on reprend. **La vérification à l'écran a changé la copie** : « Reprends ton Tour (question 4 sur 15) → » laissait « 15) → » seul sur une seconde ligne à 390 px. Mesuré sur six formulations : « (Q 8 / 15) », le compteur du quiz lui-même, tient sur une ligne jusqu'à 360 px, lié par des espaces insécables pour se reporter entier à 320. Les quinze réponses données : « Termine ton Tour → ».
- **A15.17, finir sur le partage** : le bloc Markdown du badge, pour développeurs, est replié (`Disclosure`) et passe avant la carte de partage. Sur téléphone, la mention légale reste après le partage, comme une note de bas de page : la remonter mettrait une mention entre le score et l'action, et l'ordre de lecture est tenu par `result-reading-order.test.ts`.
- **A15.20, Entrée enregistre une fiche** : d'abord fait avec un `<form>`. **`engine-boundary.test.ts` l'a refusé** (règle 3 : un formulaire est un porteur ; si son envoi partait un jour sans notre code, avant l'hydratation ou sur une erreur, le navigateur mettrait ce qui a été tapé dans une URL, et rien de ce qui est tapé dans le moteur ne quitte l'appareil, `ENGINE.md` §11.4). La fiche garde son `div` et lit la touche : Entrée dans une case de texte, hors composition, quand le bouton Enregistrer prendrait le clic.

**A15.18, revenu à Antoine (C33)** : « dans le jeu » sur la bande de la carte du jeu. Trois placements essayés (un élément à part, en ligne, raccourci en « Jeu : ») ; les trois cassent P23, une ligne de 44 px sur ordinateur et 56 px au plus à 360 px, et il ne reste que 9 px en français sur ordinateur. Rien n'a été gardé du code. La reco, un surtitre hors de la bande, est en C33.

**Non-vacuité** : un build saboté sur tous les items à la fois fait tomber les 17 tests neufs, et aucun test existant. Puis, après la vérification à l'écran et le passage d'A15.20 sans formulaire, un second : la touche ignorée, « Termine » jamais choisi et l'ancienne copie de reprise font tomber exactement les trois tests qui les tiennent (Entrée, « Termine ton Tour », la ligne à 360 px, 72 px au lieu de 55), les douze autres des deux fichiers passent.

**Ce que les deux relecteurs ont trouvé**, corrigé dans la même PR :
- **sécurité** : les brouillons d'A15.12 ne partaient qu'avec un import par-dessus un stockage illisible (`replace`). Un import depuis le tableau les gardait, et une métrique que le nouveau moteur n'a pas remplie a la même clé (`id@new`) : la saisie de l'entreprise A revenait dans la fiche de l'entreprise B, à un Entrée de son export. Tout moteur qui arrive (`fresh`) les efface maintenant ; un test e2e importe un moteur depuis le tableau et rouvre la fiche. **Sa première version passait sur le bug** : elle rouvrait la fiche avec l'aide `openSheet`, qui recharge la page, et un rechargement vide à lui seul des brouillons gardés en mémoire. Rouverte sans naviguer, elle tombe sur le build saboté (`dropAllDrafts()` sous `replace` seul, comme avant), la case « je l'ai » cochée par la saisie de l'autre moteur ;
- **copie** : un marqueur « à relire » décalé d'une ligne (`amountNegative`) ; « un compte ne peut pas être négatif » dit d'un montant en euros (le second terme d'une marge, l'MRR de l'ARPA), qui dit maintenant « un montant » comme la case qu'il dessine ; et « on compte des personnes » sur la base assistée, qui compte des opportunités, des affaires et des clients (`countPositiveSlg`). **Le même défaut existait avant** dans `workbench.notAWholeNumber` (« Un nombre entier : on compte des personnes »), sur les mêmes cases de la base assistée : copie validée, hors de cette PR, à porter au bon à tirer A7.3.d.

**Copie neuve ou réécrite, « à relire »** : `toneSelector.headerTwoLeft`, `headerLast` (le retour reprend le « Retour » du quiz) ; `landing.ctaResume`, `ctaResumeLast` ; `result.strengthsTitleRelative` ; dans le moteur, `steps.countPositive`, `countPositiveSlg`, `workbench.countNegative`, `pdf`. Celles du moteur changent la copie du nº8.

**Vérifié** : à l'écran, en français et en anglais (le retour et l'en-tête du ton, l'appel de fin à 390 px, l'étape « base » en erreur, le tableau `low`, le badge replié, puis la reprise mesurée à 390, 360 et 320 px). `eslint`, `tsc`, `next build` propres ; `vitest --coverage` 2 724 tests, seuils tenus. La suite Playwright complète avec l'émulateur et `CI=1`, sur la tête d'avant les relectures : 788 passées, 6 ignorées par construction (« jeu fermé »), une tombée, le test du repli qu'A15.12 renverse (plus haut), réécrit. Puis, sur la tête finale, les 193 specs du moteur et de `platform-native` : 192 passées, une au second essai, la miniature du deck hybride déjà relevée dans l'entrée d'A15 (`engine-deck-hybrid.spec.ts:87`). **Fusionnée avec A14.c T0 (#255)**, mergée pendant ce temps, et qui range chaque moteur sous sa propre clé : le test du repli lit tout le stockage de l'appareil, et A14.c note pour T2 et T5 que changer de mois ou de moteur doit vider les brouillons. Sur la tête fusionnée : `vitest --coverage` 2 752 tests, et la suite Playwright complète avec l'émulateur et `CI=1`, 792 passées et 6 ignorées par construction sur 798, aucune au second essai.


## A14.c, T1 : la série mensuelle, moteur pur (2026-10-01, #256)

La deuxième PR du moteur complet (`docs/engine/moteur-complet.md` §19.2), drapeau fermé. T0 est en production le même jour (#255, squash `647834a`). Aucun écran ne permet encore de démarrer un deuxième mois, c'est T2 ; mais un fichier v3 à deux mois s'importe déjà, et il se lit en entier.

**`lib/engine/series.ts`**, pur, sans horloge :
- `monthView` relit un mois clos tel qu'il a été vu : les mois jusqu'à lui, ses fenêtres (`windows`), et le jour de sa clôture (`closedAt`) pour « aujourd'hui ». Chaque module dérivé lit le dernier mois ; il suffit donc de lui passer cette vue pour qu'un mois d'août relu en novembre garde sa période et sa confiance. Le test le montre, et montre aussi qu'une lecture naïve, sur la date du jour, aurait changé la confiance ;
- `nextMonthOf` et `startNextMonth` : le mois suivant s'ouvre quand le mois des flux est clos, avec les cibles du précédent et rien d'autre (§19.2.2). Les définitions, variantes et sources sont proposées par la fiche (`proposedFromBefore`), jamais copiées ; après un trou de plusieurs mois, c'est le dernier mois clos qui s'ouvre, et la cohorte suivie avance d'autant. Au-delà de 36 mois, `full` ;
- `comparable` et `delta` (§19.2.5) : deux mois se comparent quand les deux valeurs sont mesurées, saisies de la même façon (des comptes les deux fois, ou un taux les deux fois), avec la même variante, la même note de définition et la même fenêtre. Sinon, la raison : « définition changée », « saisi autrement », « pas mesuré en juillet », « estimé », « deux lectures ». L'écart s'écrit en points pour un taux, en valeur et en pour cent pour un montant ou une durée ;
- `deriveSeries`, appelé par `deriveEngine` à partir du deuxième mois seulement : sans lui, aucune clé `series`, et les goldens v1 et v2 ne bougent pas d'un caractère. La fuite du mois d'avant est celle que l'équipe a vue alors, puisque ce mois est relu par `monthView`.

**« Ce qui a bougé »** (`deck-series.ts`, §19.2.6), une par motion, juste après la fuite et ses « Et si », **décochée par défaut** (Q5). Trois lectures :
- des chiffres ont bougé : « 3 chiffres ont bougé depuis juillet 2026 ; l'activation reste la fuite », et au plus six lignes dans l'ordre du catalogue ;
- rien n'a bougé : « Rien n'a bougé depuis juillet 2026 », avec les chiffres restés stables ;
- rien ne se compare : « juillet 2026 et août 2026 ne se comparent pas encore », et la raison de chaque chiffre.

`notes.series` remplace `notes.seasonal` dès le deuxième mois, sur les quatre slides qui la portaient. Toute la copie neuve porte « TODO: à relire ».

**Écarts à la spec**, notés au §19.2.6 :
- une ligne s'écrit « 15 %, puis 18 % (+3 points) », sans flèche : les polices des slides ne dessinent pas « → », et la garde de `engine-copy.test.ts` l'a refusée ;
- « vers la cible » ne se dit que d'un chiffre **en retard** le mois d'avant qui a bougé dans le bon sens. La lecture littérale (« s'en rapprocher ») écrivait « vers la cible » sous une activation tombée de 25 % à 18 % pour une cible à 20 %. Le sondage de la slide l'a montré avant tout test ;
- la slide existe dès le deuxième mois, même quand rien ne se compare ; ses identifiants forment un type à part, `SeriesSlideId` ;
- son composant est livré dès T1, en version minimale (les lignes « À côté » de la slide de fuite), pour qu'aucune slide du modèle ne reste sans rendu. La mise en page vient avec T2.

**Les gardes existantes ont fait leur travail.** Avant tout test neuf, cinq ont refusé la première version :
- une flèche sur une slide ;
- « vers ta cible » (une slide ne tutoie pas) ;
- les quatre titres neufs, ni remplis par l'échantillon, ni déclenchés par le balayage des phrases ;
- deux sortes de lignes que le contrat des lignes ne connaissait pas.

Le balayage des phrases a gagné six scénarios à deux mois, et le contrat des lignes deux états.

**Non-vacuité**, mesurée en sabotant puis en restaurant le code. Chaque sabotage fait tomber les tests qui le visent :
- un mois clos lu à la date du jour : 2 tests ; avec les fenêtres du jour : 1 ;
- une note de définition ou une fenêtre ignorées à la comparaison ;
- le mois suivant qui reprend les valeurs ;
- `leakChanged` inversé ;
- la slide cochée par défaut ;
- `notes.seasonal` gardée au deuxième mois ;
- les lignes triées par écart ;
- « reste la fuite » écrit quand la fuite a changé ;
- une série calculée sur un seul mois : 130 tests, dont tout le deck.

**Un sabotage est d'abord passé** : « vers la cible » sans la condition « en retard le mois d'avant » laissait les 1 001 tests verts. Il manquait le cas d'un chiffre déjà au-delà de sa cible qui progresse encore. Ce cas est ajouté, et le sabotage tombe.

**Un piège de Git, consigné dans `GITHUB.md` §1.9.** T1 s'est construit dans un worktree, pendant que la suite Playwright de T0 occupait le dépôt principal, avec un `node_modules` partagé par lien symbolique. Le `git add -A` du worktree a suivi ce lien, parce que la règle `/node_modules/` ne vise que les dossiers. Rejouer les commits sur `main` a remplacé le vrai `node_modules` par le lien, puis l'a supprimé. Un `npm ci` a réparé (lockfile intact). La règle de `.gitignore` s'écrit maintenant sans barre finale. Turbopack, lui, refuse de construire avec un `node_modules` lié : le build se fait dans le dépôt principal.

**Vérifié** :
- `vitest --coverage` : 2 780 tests passés, au-dessus des seuils ;
- `tsc`, `eslint` et `next build` (avec `GAME_ENABLED=true`) propres ;
- `e2e/engine-series.spec.ts`, nouveau : deux mois offrent la slide décochée, et cochée elle imprime ses trois lignes en FR et en EN, sans déborder ; un moteur à un mois n'en a pas ; l'hybride en a une par motion. Captures relues dans les deux langues ;
- Playwright complet (`CI=1`) : 782 specs, 754 passées dont une au second essai, et 28 ignorées (22 faute d'émulateur, 6 par construction).
- après la fusion d'A15.7-A15.20 (#257), mergée pendant que la CI de T1 tournait : 2 785 tests unitaires, et Playwright complet sur l'arbre fusionné, 802 specs, 771 passées et 31 ignorées (25 faute d'émulateur, 6 par construction), aucune au second essai.

**Le test passé au second essai** : « every slide prints filled templates… » de `engine-deck-hybrid.spec.ts`, en anglais, avec « total is empty ». Il est antérieur à T1, qui ne touche pas au deck d'un moteur à un mois. Le test connaissait déjà le piège de `content-visibility: auto` (une vignette lue hors écran rend un texte vide) et attendait que chaque vignette soit rendue. Mais il relisait ensuite toutes les vignettes une seconde fois, en remontant à la première, et cette seconde lecture est tombée trop tôt une fois sous charge. Il lit maintenant chaque vignette une seule fois, au moment où le sondage voit son texte : 10 passages sur 10 sans nouvel essai, en français et en anglais.

**La relecture de copie** (`relecteur-copie`) a relevé trois points, corrigés :
- des marqueurs « à relire » qui ne nommaient pas les clés qu'ils couvraient : `/bon-a-tirer` part d'un `grep` et n'aurait pas su lesquelles relire ;
- `notes.series` renvoyait à « la slide « Ce qui a bougé » ». Cette slide est décochée par défaut, et aucun de ses titres ne porte ce nom. La note ne renvoie plus à rien ;
- un commentaire de `SlideEvolution` décrivait encore une flèche.

## A14.c, T2 : les écrans de la série (2026-10-01, #258)

La troisième PR du moteur complet (`docs/engine/moteur-complet.md` §19.2.2 à §19.2.6), drapeau fermé. T1 est sur `main` le même jour (#256, squash `9d78ef5`). Avec T2, un moteur passe d'un mois au suivant sans quitter la page.

**Ce qui change à l'écran** :
- **« Démarrer septembre »** : dès que le mois des flux est clos, un bandeau au-dessus du tableau dit « Mois clos : août 2026 » et propose le suivant. Le mois s'ouvre vide, avec les cibles du précédent (`startNextMonth`). Au-delà de 36 mois, le bandeau dit de sauvegarder le fichier et de démarrer un nouveau moteur ;
- **le sélecteur de mois**, dès deux mois, le plus récent en tête. Un mois passé se relit à sa date (`monthView`), en lecture seule : ses lignes ne s'ouvrent pas, et les « Et si », la liste « À aller chercher », le bandeau de reprise et les boutons de fichier et de slides sont cachés ;
- **« Corriger ce mois »** rend la saisie d'un mois passé. Ce qui s'enregistre retourne dans ce mois, et les mois suivants sont recollés derrière (`withMonth`) : l'écart du mois suivant se recalcule. Le réglage, le deck et le Tour restent ceux du moteur. Partir vers le deck, les Réglages, le pas à pas, l'import ou l'effacement ramène au mois en cours ;
- **un écart sur chaque ligne** : « +3 points depuis juillet 2026, vers ta cible », « stable depuis juillet 2026 », ou la raison (« estimé en juillet 2026 », « définition changée »). Les chiffres sont imprimés par les mêmes fonctions que la slide (`evolutionPrinted`, `evolutionApartText`) ; seule la phrase autour est celle du tableau, au « tu » (`_engine/series-view.ts`) ;
- **« En juillet 2026, la fuite était le churn logo. »** sous le diagnostic, quand la fuite a changé d'étape ;
- **la fiche d'un nouveau mois** propose la variante, le libellé, la note de définition et la source du mois d'avant, jamais la valeur (`withProposals`), et seulement sur un chiffre que personne n'a encore touché ce mois-ci ;
- **les Réglages** ne proposent plus un mois des flux antérieur à celui du mois d'avant : la validation l'aurait refusé au chargement suivant ;
- **la slide « Ce qui a bougé »** reçoit sa mise en page : une ligne par chiffre, avec son nom, le mois d'avant, une flèche dessinée (les polices des slides n'ont pas « → »), ce mois-ci et l'écart, signé, jamais coloré. « vers la cible » s'écrit dessous quand il le faut.

Les écarts à la spec sont notés au §19.2.4.

**La rencontre avec A15.12** (#257, mergée pendant la CI de T1). Une fiche garde maintenant sa saisie non enregistrée quand elle est remontée. Au rebase de T2, les deux se sont rencontrées dans `MetricSheet` : le brouillon gardé passe d'abord, sinon les propositions du mois d'avant. La clé d'un brouillon porte aussi son mois. Sans cela, un chiffre pas encore saisi ce mois-ci et le même chiffre corrigé dans un mois passé, tous deux sans entrée, auraient partagé leur saisie.

**Pièges rencontrés** :
- la copie disait d'abord « {month} est clos ». Un mois en tête de phrase s'écrit en minuscule (« août 2026 est clos »), et « de {month} » est refusé par la garde d'élision (« de août »). D'où « Mois clos : {month}. » ;
- le tableau affichait « estimé en août » à côté de l'étiquette « Estimé » : `rowDelta` tait les raisons qui portent sur le mois en cours ;
- un test supposait que la variante d'une fiche était une liste déroulante. C'est un groupe de boutons radio (`Choices`) ;
- un build de T1 laissé en place a servi les specs de T2. Reconstruire après chaque changement de branche ;
- un test de `withMonth` se contredisait : il changeait la fenêtre du réglage, donc la définition. Il est coupé en deux.

**Non-vacuité** : neuf sabotages, chacun fait tomber les tests qui le visent :
- `withMonth` qui garde le réglage du mois relu : 1 test ; qui laisse tomber les mois suivants : 2 ;
- les propositions posées sur une fiche déjà remplie : 1 ; qui perdent la source : 2 ;
- l'écart qui dit la raison du mois en cours : 1 ; qui ne dit jamais « vers ta cible » : 1 ;
- la fuite du mois d'avant dite même quand elle n'a pas changé : 1 ;
- en e2e, les lignes d'un mois passé qui s'ouvrent : la spec du mois suivant, en FR et en EN ; une correction enregistrée sans les mois suivants : la spec de la correction, en FR et en EN.

**La relecture de copie** (`relecteur-copie`) a relevé quatre points, corrigés :
- des marqueurs « à relire » manquants, dont celui de `slide.evolutionToward` ;
- `{list}` et `{max}` non documentés ;
- « read only » sans son trait d'union ;
- le plafond de 36 mois écrit en dur, devenu `{max}`.

**Vérifié** :
- `vitest --coverage` : 2 797 tests, au-dessus des seuils ;
- `tsc`, `eslint` et `next build` (avec `GAME_ENABLED=true`) propres ;
- `e2e/engine-series.spec.ts` gagne neuf specs, 13 en tout : démarrer le mois, la lecture seule, la correction et son recalcul, la fuite du mois d'avant, les propositions de la fiche, les largeurs à 390 et 1 280 px, la garde des Réglages ;
- Playwright complet (`CI=1`), sur l'arbre rebasé sur T1 : 811 specs, 780 passées, aucune au second essai, et 31 ignorées (25 faute d'émulateur, 6 par construction) ;
- captures relues en FR et en EN, à 1 280 et 390 px : le bandeau du mois suivant, le tableau avec ses écarts, un mois passé en lecture seule, la correction, et la slide.

## A14.c, T3 : la rétention J30 et la part recommandée chiffrées, et leurs leviers (2026-10-01, #259)

La quatrième PR du moteur complet (`docs/engine/moteur-complet.md` §19.3), drapeau fermé. Elle part de T2 (#258). La couverture du pipeline (§19.4), prévue dans le même lot, part dans la PR suivante : elle demande trois champs de saisie neufs, ce que le chiffrage n'a pas.

**Ce qui se chiffre maintenant** :
- **la rétention à J30**, comme l'activation. Les payants sont supposés parmi les inscrits encore actifs à J30, donc N les suit : `N × (t/r − 1) × ARPA`. Le pied de slide dit l'hypothèse ;
- **la part recommandée, dans les deux motions**, avec la règle du « Et si » (`referral-on-top`) : les recommandés s'ajoutent aux autres, qui restent les mêmes, donc les nouveaux clients croissent de `(1 − r) ÷ (1 − t) − 1`. La chaîne s'écrit « 42 × (100 – 6)/(100 – 10) = 44 (+2) », et se recalcule à la main ;
- **la borne de 50 %** : au-delà, rien n'est chiffré. La slide de fuite reste, sans montant, et son pied dit « au-delà d'une cible de 50 %, le moteur ne chiffre plus la part des recommandations » ;
- **la mise en production** (assisté) reste seule sans montant (`UNPRICED_CANDIDATES`). Une seule fonction, `isPricedAt`, dit ce qui se chiffre : le classement, les chaînes et les slides la lisent toutes.

**Les deux leviers neufs** :
- **J30 en libre-service** : quand il bouge, les payants le suivent, et l'activation ne fait que le plafonner ;
- **la part des opportunités recommandées en assisté** : les opportunités créées et W croissent du même facteur. Le panneau et la slide lisent les opportunités projetées sur le scénario lui-même (`opps`), et non plus sur la seule liaison.

**Écarts à la spec**, notés au §19.3.3 :
- la part recommandée se chiffre sur N et W, les nouveaux clients, et non sur les inscrits (S) ni sur les opportunités (O). C'est le même N et le même W que les autres flux et que le « Et si ». Sur l'exemple, S × la conversion donne 49 à 74 payants pour 42 comptés, et O × le taux de closing 31 clients pour 18 gagnés. La slide et le « Et si » se seraient contredits ;
- sans W, la part recommandée de l'assisté se lit pour 100 opportunités créées ;
- la couverture du pipeline part dans sa propre PR.

**Les goldens v1 et v2 ne bougent pas.** Ils avaient échoué : les deux leviers neufs entraient dans le scénario de chaque moteur, et `opps` dans celui de l'assisté. Aucun titre, aucune slide, aucun texte n'avait bougé. Leur projection retire ces champs ajoutés, et rien d'autre (`__tests__/golden-projection.ts`), comme la règle des goldens le permet. Un test vérifie que ces champs sont bien là avant d'être retirés.

**Sabotages** : douze, dont dix font tomber les tests qui les visent :
- le gain de la part recommandée sans son dénominateur (100 − t) : 5 tests ;
- pas de borne à 50 % : 9 ;
- une part au-delà de 50 % qui fait passer tout le classement en écart relatif : 2 ;
- la chaîne de la part recommandée en t/r : 4 ;
- les payants qui ignorent le levier J30 : 1 ;
- le levier de la part assistée qui ne bouge rien : 2 ;
- le pied « sans montant » à la place de celui de la borne : 2 ;
- l'hypothèse de J30 absente du pied : 1 ;
- la projection des goldens qui ne retire rien : 14 ;
- les opportunités du panneau lues sur la seule liaison : 2.

Deux sont d'abord passés :
- **la chaîne de la part recommandée imprimée avec le gabarit d'un flux.** Les tests vérifiaient le gabarit, jamais la slide. Un test du deck lit maintenant la ligne imprimée, et le sabotage tombe ;
- **J30 retirée des flux du classement.** C'est un mutant équivalent : l'appartenance aux flux ne sert qu'à vérifier qu'ils sont tous chiffrés ensemble, et ils partagent le même N et le même ARPA. J30 reste dans la liste, pour dire ce qu'elle est.

**La relecture de copie** (`relecteur-copie`) :
- un marqueur « à relire » manquait (`leverSubject["slg.ref.referred-share"]`) ;
- la ligne « pour 100 opportunités créées » disait « 114 sur 100 », elle dit maintenant « pour 100 opportunités créées aujourd'hui » ;
- l'anglais de la part assistée nomme sa base (« 20% of opportunities referred ») ;
- « ne chiffre plus une part » est devenu « ne chiffre plus la part des recommandations » ;
- « the paying » est devenu « paying customers ».

**Vérifié** :
- `vitest --coverage` : 2 812 tests, au-dessus des seuils ;
- `tsc`, `eslint` et `next build` (avec `GAME_ENABLED=true`) propres ;
- Playwright complet (`CI=1`), sur l'arbre rebasé sur T2 : 813 specs, 782 passées, aucune au second essai, et 31 ignorées (25 faute d'émulateur, 6 par construction). La première passe en avait fait tomber six : la slide « ensemble » à neuf leviers débordait de 4 px sur son pied (un cran plus serré à partir de neuf leviers), et la spec de la slide sans montant prenait J30, chiffrée désormais (elle prend la part recommandée au-delà de 50 %) ;
- `engine-deck-whatif.spec.ts` imprime maintenant neuf leviers et « ensemble », rien sous 18 px, chaque corps au-dessus de son pied ; deux specs neuves bougent le levier J30 et celui de la part assistée ;
- captures relues en FR et en EN : la slide « ensemble » à neuf leviers, la fuite de J30 chiffrée, celle de la part assistée.

## A14.c, T3.2 : la couverture du pipeline (2026-10-01, #260)

La cinquième PR du moteur complet (`docs/engine/moteur-complet.md` §19.4, C32 Q8), drapeau fermé. Elle était prévue dans T3 et part seule, juste après lui (#259) : elle demande trois champs de saisie neufs.

**Ce que fait la couverture** : c'est un indicateur avancé sous la carte des relais. Ce n'est jamais un seizième chiffre, jamais une étape que le diagnostic peut nommer, jamais un montant, jamais une comparaison avec un repère publié (C1). Concrètement :
- `lib/engine/pipeline.ts`, pur : le pipeline ouvert du trimestre, divisé par l'objectif de nouveaux contrats du trimestre, tous deux en ACV. « Sous » ne se dit que contre le seuil de l'équipe, quand elle en a saisi un. Sans les deux nombres, ou hors de l'assisté, pas de couverture ;
- le tableau affiche « Couverture : 2,6× l'objectif du trimestre, sous ton seuil de 3× », puis « En juillet 2026 : 2,1× » ;
- le pipeline ouvert se saisit sous les relais, chaque mois. Il s'enregistre en quittant la case, comme une cible (A15.2). Un mois passé montre sa couverture sans case ;
- l'objectif et le seuil se saisissent dans les Réglages. Sans objectif, la carte dit où l'ajouter ;
- la slide des relais porte la ligne sans « ton », et la couverture du mois d'avant va dans les notes.

**La slide des relais n'avait pas la place.** La ligne posée sous les grilles prenait leur hauteur : la colonne du milieu passait sous elle (fin à 855, ligne à 815). Posée sur la ligne de la légende, elle chevauchait encore cette colonne (884 contre 873). Ce second écart existait déjà sans la couverture : quand l'en-tête « Opportunités conclues · juin à août 2026 » passe sur deux lignes, la colonne descend de 11 px dans la ligne de la légende. L'écart entre les éléments d'une colonne passe de 12 à 8 px, la ligne de couverture tient sur une seule ligne à droite de la légende, et le mois d'avant va dans les notes. Une spec e2e le mesure : chaque colonne au-dessus de la légende, la ligne au-dessus du pied, rien sous 18 px.

**Au passage** : les Réglages perdaient les outils (`tools`, §19.5) qu'un fichier v3 apportait, parce qu'ils reconstruisent tout le réglage. Ils les gardent maintenant.

**Sabotages** : huit, chacun fait tomber les tests qui le visent :
- « sous » sans seuil : 2 ;
- une couverture hors de l'assisté : 1 ;
- le mois d'avant lu sur le mois en cours : 2 ;
- le rapport à l'envers : 4 ;
- la slide qui tutoie : 2, dont la garde des phrases ;
- la note du mois d'avant absente : 1 ;
- la ligne absente de la slide : 3, dont le contrat des lignes ;
- en e2e, la case de saisie laissée sur un mois passé : 1.

**La relecture de copie** (`relecteur-copie`) a relevé cinq points, tous corrigés :
- le « × » s'écrivait dans le code : il passe par une clé (`pipeline.ratio`), sous le marqueur, pour que le bon à tirer le voie. Le choix entre « × » et « fois » en français lui revient ;
- les gardes des slides (glyphes, tutoiement) ne voyaient pas les trois clés qui vont sur la slide et dans ses notes ;
- en anglais, « target » servait pour l'objectif du trimestre alors qu'il désigne la cible d'équipe (C1) : c'est « goal » ;
- les libellés anglais prenaient un article que leurs voisins n'ont pas ;
- l'aide disait « ce mois-ci » pour une case qui se remplit pour le mois du tableau : « ce mois-là ».

**Vérifié** :
- `vitest --coverage` : 2 817 tests, au-dessus des seuils ;
- `tsc`, `eslint` et `next build` (avec `GAME_ENABLED=true`) propres ;
- Playwright complet (`CI=1`) : 819 specs, 788 passées, aucune au second essai, et 31 ignorées (25 faute d'émulateur, 6 par construction) ;
- `e2e/engine-pipeline.spec.ts`, nouveau : l'objectif saisi dans les Réglages, la couverture qui apparaît, le mois d'avant, un mois passé sans case, la slide mesurée en FR et en EN, 390 px sans défilement de côté ;
- captures relues : le tableau, les Réglages, la slide, la colonne de l'hybride à 390 px.

## A14.c, T4 : les outils de l'équipe (2026-10-01, #261)

La sixième PR du moteur complet (`docs/engine/moteur-complet.md` §19.5, C32 Q9 et Q10), drapeau fermé.

**Ce que font les outils** : l'équipe coche ses outils, et rien n'est obligatoire. Sans outil coché, le moteur se lit exactement comme avant : les goldens v1 et v2 n'ont pas bougé. Avec des outils cochés :
- `lib/engine/tools.ts`, pur : cinq familles (analytique, facturation, CRM, publicité, autres), dans l'ordre où le réglage les montre. App Store Connect et Play Console ne sont pas proposés : aucun chiffre ne les cite, ils attendent l'app grand public (C32 Q9). Un fichier qui les apporte les garde, sans les lire ;
- « Tes outils » est un repli facultatif, au premier réglage comme dans les Réglages, avec une case par outil sous le nom de sa famille ;
- la fiche propose les outils de l'équipe d'abord, en commençant par ceux qu'on attend pour ce chiffre. Les autres outils attendus restent proposés, sous « Autres outils » ;
- « À faire toi-même » se range par outil, et chaque chiffre y porte le chemin de menu du catalogue. Un chiffre est rangé sous le premier outil coché que cite son `where`. Un chiffre qu'aucun outil coché ne donne passe dans « À demander », au rôle qui le tient ;
- la fiche a une case « Le dénominateur vient d'un autre outil », qui ouvre une seconde liste de sources. Quand les deux comptes d'un taux viennent de deux outils, le contrôle « deux outils » le dit, sans jamais bloquer. Il paraît dans la fiche et dans la liste « à vérifier » de l'écran du deck, précédé du nom du chiffre. Il ne paraît pas sur la slide de visibilité, où aucun contrôle ne figure aujourd'hui.

**Un bug trouvé par l'e2e avant la PR** : dans la liste par outil, le chemin de menu sortait brut (« Événements › {event} »). La fiche le remplit, la liste ne le faisait pas. Elle passe maintenant par le même remplissage (`catalogFill`), et la spec vérifie qu'aucune accolade ne reste.

**Sabotages** : huit. Sept tombent du premier coup :
- un chiffre non couvert gardé dans « À faire toi-même » : 2 ;
- `byTool` présent sans outil coché : 14, dont les goldens v1 ;
- les outils de l'équipe ignorés dans la fiche : 1 ;
- « deux outils » pour un seul outil : 1 ;
- la source du dénominateur non enregistrée : 2 ;
- la case cochée sans source exigée : 1 ;
- les outils hors de l'ordre des familles : 1.

Le huitième passait : le dernier outil cité à la place du premier. Aucun chiffre du test n'était cité par deux des outils cochés. Un test couvre maintenant ce cas, et le sabotage tombe.

**La relecture de copie** (`relecteur-copie`) a relevé trois défauts, tous corrigés :
- l'aide de « Tes outils » disait que « À aller chercher » se range par outil. C'est « À faire toi-même » ;
- dans la liste « à vérifier » du deck, la phrase « deux outils » ne nommait pas le chiffre, et deux taux tirés des mêmes outils auraient donné deux lignes identiques. Le nom du chiffre la précède, comme pour « premier compte plus grand que le second » ;
- le nom de l'outil de customer success porte déjà des parenthèses (« Gainsight, Vitally, Planhat… »). La phrase les retire, pour ne pas imbriquer deux parenthèses.

Trois points de vocabulaire vont au bon à tirer A14.d :
- la fiche dit maintenant « numérateur / dénominateur » (le libellé du §19.5.3), alors que ses messages voisins disent « premier compte / second compte » ;
- la case promet « un autre outil », alors que la liste qu'elle ouvre propose aussi une personne et « Autre » ;
- l'anglais dit « the sheet » dans l'aide des outils, et « the cards » pour la même fiche dans `catalogueToggle`.

**Vérifié** :
- `vitest --coverage` : 2 832 tests, au-dessus des seuils ;
- `tsc`, `eslint` et `next build` (avec `GAME_ENABLED=true`) propres ;
- Playwright complet (`CI=1`) : 823 specs, 792 passées, aucune au second essai, et 31 ignorées (25 faute d'émulateur, 6 par construction) ;
- `e2e/engine-tools.spec.ts`, nouveau, quatre specs : les outils cochés et enregistrés dans l'ordre des familles, la liste rangée par outil sans accolade brute ; un chiffre qu'aucun outil ne donne, passé dans « À demander » ; la fiche avec Mixpanel d'abord, la seconde source, le contrôle « deux outils », puis la liste du deck ; à 390 px en français, sans défilement de côté ;
- captures relues : le repli des outils dans les Réglages (FR, 1280 px), « À faire toi-même » rangé par GA4, Stripe et HubSpot avec ses chemins remplis, et la fiche à 390 px en anglais avec le contrôle « deux outils ».


## C33 : « Dans le jeu » au-dessus de la carte du jeu (2026-10-01, #262)

A15.18, revenue à Antoine parce que « dans le jeu » ne tenait pas sur la bande de la carte (une ligne de 44 px sur desktop, deux de 56 px au plus à 360 px, P23 ; 9 px de reste en français). **Tranché sur captures** : avant, la reco (un surtitre au-dessus de la carte, hors de la bande) et une variante plus explicite, « Dans le jeu, pas dans tes chiffres », chacune capturée sur `/r/sample` à 1 280, 390 et 360 px depuis un vrai build d'essai, jamais poussé. Antoine a pris la version courte.

**Ce qui change** : `GameEntry` prend `eyebrow`, un `MetaLabel wide` à 10 px au-dessus de la carte, le rythme des sections du résultat (« Ce qui tient le mieux »). Ce n'est pas un titre : celui de la carte l'est. Le surtitre vaut pour la carte à un niveau comme pour celle qui en propose plusieurs (`GAME_ENTRY_EYEBROW`, à relire, pour le bon à tirer nº7 ou celui du niveau 2, A12.h). `className` place maintenant l'ensemble, surtitre et carte, dans la page. La bande ne bouge pas d'un pixel : ses tests P23 de hauteur passent tels quels.

**Vérifié** :
- un test unitaire (les deux langues, et la carte à plusieurs niveaux) et trois e2e : le surtitre au-dessus de la bande, à moins de 16 px, aligné, sur une ligne, en français et en anglais à 1 280 px et en français à 390 px ;
- **non-vacuité** : un build où le surtitre n'est pas rendu fait tomber exactement ces trois e2e, les neuf autres de `game-entry.spec.ts` passent ;
- `eslint`, `tsc`, `next build` propres ; `vitest --coverage` 2 833 tests, seuils tenus ; la suite Playwright complète avec l'émulateur et `CI=1` : 816 passées, 6 ignorées par construction, 4 tombées, toutes dans `game-entry.spec.ts` et toutes du test, pas du produit. Mes trois tests comparaient le surtitre au bord de la bande, qui commence 2 px plus loin, dans la bordure de la carte : ils le comparent maintenant au bord de la carte, comme tout intitulé de section. Et le test du téléphone mesurait les 22 px entre la carte de partage et la carte du jeu, où le surtitre s'intercale maintenant : il les mesure jusqu'au surtitre, puis du surtitre à la carte. Rejoué sur le même build, `game-entry.spec.ts` passe en entier (12, et 3 ignorées « jeu fermé ») : 820 passées sur 826.

**Claude Design** : le contrat de `GameEntry` change, son aperçu est à jour dans le dépôt ; la re-synchro rejoint B6.
## A14.c, T5 : plusieurs moteurs, la fusion, la saisie en tableau (2026-10-01, #263)

La septième PR du moteur complet (`docs/engine/moteur-complet.md` §19.1.5, §19.6 et §19.7, C32 Q11 à Q13), drapeau fermé. Le stockage à plusieurs moteurs existait depuis T0 : T5 y met les écrans, la fusion et le tableau.

**Ce que fait T5** :
- **Plusieurs moteurs** : « Moteur : {nom} » en tête du tableau, un repli qui liste les moteurs de l'appareil (« Ouvrir » sur chacun), « Nouveau moteur » (grisé à dix, avec sa raison) et « Supprimer ce moteur », qui propose d'abord la sauvegarde. « Tout effacer » dit combien de moteurs partent.
- **L'import à trois choix** : « Ajouter comme nouveau moteur » par défaut, « Remplacer », « Fusionner », grisé avec sa raison quand les deux moteurs ne mesurent pas la même chose (motions, devise, fenêtres, plus de 36 mois).
- **La fusion**, `lib/engine/merge.ts`, pure : mois par mois, un côté vide prend l'autre, deux lectures différentes gardent la plus récente, les cibles, les comptes partagés et le pipeline du fichier ne comblent que ce qui manque. Chaque changement est listé avant d'écrire.
- **« Saisie en tableau »**, `_engine/csv.ts`, dans l'îlot : le modèle CSV (« ; » et virgule décimale en français), pré-rempli des chiffres trouvés, et un tableau collé depuis un tableur, lu et montré ligne par ligne (nouveau, modifié avec l'ancienne valeur, inchangé, refusé avec sa raison) avant « Appliquer ». Chaque ligne passe par les règles de la fiche (`entryFromDraft`), et un chiffre que le tableau déplace par un compte partagé est listé aussi.

**La relecture de sécurité** (`relecteur-securite`) a trouvé huit constats, tous corrigés avant la PR :
- **L'id d'un fichier importé était repris tel quel.** Un id vide verrouillait l'index, et le seul chemin de sortie (« Ouvrir un fichier » sur l'écran « illisible ») effaçait alors tous les moteurs. « Ajouter » donne maintenant toujours un id neuf, « Remplacer » donne l'id du moteur à l'écran. Le stockage refuse (`conflict`) un ajout dont l'id est déjà listé, un id vide, et l'écriture d'un moteur que l'appareil ne liste plus.
- **Ce dernier cas fermait aussi un piège entre deux onglets** : un moteur supprimé dans un onglet, enregistré dans l'autre, prenait la place du moteur à l'écran et le supprimait.
- **Un fichier ouvert sur l'écran « illisible » vidait l'appareil** (`clearEngine`) : avec dix moteurs, un seul illisible coûtait les neuf autres. `saveOverUnreadable` garde les moteurs encore lisibles, reconstruit un index illisible à partir des entrées, et laisse en place l'entrée qu'il n'a pas pu lire.
- **Un tableau collé suivait le changement de moteur**, et « Appliquer » l'aurait écrit dans le second. Le tableau de bord est maintenant monté par moteur (`key`).
- **Une cellule du modèle pouvait devenir une formule** : un compte arrivé en texte par un fichier fusionné partait tel quel dans le CSV. Seul un nombre fini est écrit, et une cellule qui commence comme une formule est écrite en texte.
- **La fusion plantait la page sur une clé inconnue** (un chiffre ou un compte d'une version ultérieure) : elle ne prend plus que les clés du catalogue.
- **Le nom du fichier CSV** passe par le même contrôle de mois que celui du `.json` (`monthFileName`).
- **Le choix d'import restait d'un fichier à l'autre** : chaque fichier repart du choix par défaut.
- Pour information, sans correctif : la zone de collage n'a pas de limite dure. Seul l'onglet de la personne peut geler.

**La relecture de copie** (`relecteur-copie`) a relevé neuf constats et deux remarques hors copie, tous corrigés :
- « Remplacer celui de cet appareil » ne désignait plus un seul moteur : le bouton dit « Remplacer », le choix dit lequel ;
- « Rien ne s'écrit avant l'aperçu » était faux : c'est avant « Appliquer » ;
- « cible de {name} » et « celui de {other} » écrivaient « de Expansion mensuelle » : les deux phrases sont tournées autrement, et le test qui interdit « de {month} » couvre maintenant `{name}` et `{other}` ;
- « motions » et « façons de vendre » dans le même diff : « façons de vendre », comme au réglage ;
- les limites (36 mois, dix moteurs) sont écrites avec `{max}`, depuis les constantes ;
- « 1 ligne sans chiffre » a sa variante, et le bouton « Appliquer 0 chiffres » ne s'affiche plus ;
- un marqueur manquait sur les noms de comptes, et l'anglais de la question du choix est aligné ;
- hors copie, un modèle téléchargé dans l'autre langue était lu comme vide, sans message : il se relit dans l'ordre du modèle ;
- les nouveaux boutons entrent dans la garde de longueur ;
- « Tout effacer », avec plusieurs moteurs, demande « EFFACER » plutôt que le nom du moteur affiché.

Points pour le bon à tirer A14.d : ce que « Remplacer » change exactement (le nom, les réglages, les cibles, « Et si »), « Moteur : Moteur sans nom, créé le… », et « le fichier est dans tes téléchargements », affirmé dès le clic.

**Sabotages** : dix-neuf sur les modules purs, et chacun fait tomber au moins un test. Deux de plus sur un build, pour les specs neuves de la relecture de sécurité : sans la `key` du tableau de bord, le tableau collé suit le changement de moteur ; avec l'ancien effacement, l'import sur l'écran « illisible » perd l'autre moteur. Les deux specs tombent.

**Vérifié** :
- `vitest --coverage` : 2 876 tests, au-dessus des seuils ;
- `tsc`, `eslint` et `next build` (avec `GAME_ENABLED=true`) propres ;
- Playwright complet (`CI=1`) : 833 specs, 802 passées, aucune au second essai, et 31 ignorées (25 faute d'émulateur, 6 par construction) ;
- après la fusion de C33 (#262), mergée pendant la PR : 2 877 tests unitaires, et Playwright complet sur l'arbre fusionné, cette fois avec l'émulateur Firestore comme la CI : 836 specs, 830 passées, aucune au second essai, 6 ignorées par construction ;
- `e2e/engine-engines.spec.ts`, nouveau, dix specs : deux moteurs créés, basculés et supprimés ; la limite de dix ; une sauvegarde rouverte ajoutée sous un id neuf ; la fusion avec son aperçu, refusée pour une autre devise ; le tableau en français (modèle, aperçu, application, `engine_stage_saved`) ; les tabulations d'un tableur en anglais et « Annuler » ; un tableau qui ne suit pas le changement de moteur ; l'import sur un moteur illisible qui garde l'autre ; « Tout effacer » qui compte les moteurs ; 390 px sans défilement de côté ;
- le canari passe maintenant aussi par le modèle, un tableau collé et une fusion ;
- captures relues : le sélecteur, le tableau collé avec son aperçu, l'import à trois choix avec l'aperçu de la fusion, et la suppression, en français à 1 280 px et en anglais à 390 px.

## A14.c, T6 : le fond blanc, les rappels d'agenda, les deux portes (2026-10-01, #264)

La huitième PR du moteur complet (`docs/engine/moteur-complet.md` §19.8 à §19.10, C32 Q14 à Q16), drapeau fermé. L'image de partage du moteur (§19.11) n'en fait pas partie : elle attend la passe de Claude Design (B5).

**Ce que fait T6** :
- **« Fond blanc »** au deck : une case, décochée par défaut, qui peint chaque slide en blanc pur (`--paper-white`, `--surface-white`), sans le relief du papier, à l'écran, au PNG et au PDF. Le choix est rangé avec le moteur (`deck.theme`).
- **Deux rappels d'agenda**, `lib/engine/ics.ts`, pur. « Me le rappeler » paraît une fois une demande copiée : le rappel tombe cinq jours plus tard, le jour où le tableau dit « à relancer ». « Me rappeler de démarrer {mois} » remplace le bandeau du mois suivant tant que ses flux ne sont pas clos : le rappel tombe le premier jour ouvré du mois qui suit. Chaque rappel est un fichier `.ics` téléchargé, à 9 h à l'heure de l'agenda : rien n'est envoyé, rien n'est programmé par le site. Il ne porte jamais une valeur ni le nom de l'entreprise, parce qu'un agenda se partage et s'affiche sur un écran verrouillé.
- **Deux portes vers le moteur**, ouvertes seulement sur un build où le moteur l'est :
  - sous le coup prioritaire d'un résultat, pour son propriétaire, quand une étape est nommée : « Tu mesures déjà cette étape ? Mets tes vrais chiffres dans le moteur → » ;
  - sur l'accueil, quand l'appareil porte un moteur : « Ton moteur : août 2026, 11 sur 17 chiffres — le reprendre → ». La ligne est lue par `lib/engine/resume.ts`.

**La relecture de sécurité** (`relecteur-securite`) a relevé cinq constats, tous traités :
- **Le canari ne passait pas par les rappels.** Il télécharge maintenant les deux `.ics` et vérifie qu'aucune valeur saisie ni le nom de l'entreprise n'y figure.
- **L'accueil lisait le stockage du moteur hors de sa route, sans règle.** La lecture vit dans son propre composant, `app/[locale]/EngineResume.tsx`. Une règle 8 de `engine-boundary.test.ts` en fait le seul lecteur hors de la route, sans primitive réseau ni appel d'analytics : un compte affiché là ne peut pas devenir le détail d'un événement.
- **Une entrée de forme lisible mais de contenu incomptable faisait planter l'accueil** (un brouillon sans façon de vendre, un mois mal écrit). `engineResume` rend maintenant `null` plutôt que de jeter, et l'`import()` a son `.catch`.
- **Le texte d'un rappel pouvait ouvrir une propriété**, parce qu'un retour chariot seul et les autres caractères de contrôle passaient. Désormais :
  - tout saut de ligne est échappé et les autres caractères de contrôle sont retirés ;
  - une adresse qui n'est pas un `http(s)` sans espace laisse le champ URL de côté.

  Tous les textes viennent aujourd'hui de la copie ou du catalogue ; l'échappement tient pour un appelant futur.
- **Un accueil construit moteur fermé portait-il le code du moteur ?** Deux verrous l'en empêchent :
  - `page.tsx` ne passe la ligne qu'à un build ouvert ;
  - `EngineResume` lit le drapeau du build par l'accès littéral à `process.env` que Next remplace, avant l'`import()`.

  Sur le build fermé, aucun morceau ne porte plus `engineResume` : l'import est retiré à la construction, pas seulement jamais appelé. L'e2e des portes lit tous les scripts que la page charge vraiment et y cherche la clé de stockage du moteur. Il n'en trouve aucun sur un build fermé, et au moins un sur un build ouvert. Une première vérification, statique, sur les balises `<script>` de l'accueil ne voyait rien non plus sur le build ouvert, parce que le morceau s'atteint par un chargeur rangé dans un autre fichier : elle a été jetée.

**La relecture de copie** (`relecteur-copie`) a relevé neuf constats, dont trois défauts, tous traités :
- « 1 chiffres sur 17 » : la ligne de l'accueil s'accorde avec le total, « 11 sur 17 chiffres » ;
- « Demandés à Finance : » pour un seul chiffre : la description a sa variante au singulier ;
- « septembre 2026 est clos » commençait par une minuscule : « Mois clos : septembre 2026. » ;
- « Reprendre → » après un tiret : « le reprendre → », comme « le revoir → » du même bloc, et « pick it up → » en anglais ;
- « template » avait trois sens en anglais : « company slide template » ;
- l'adresse de la page entre aussi dans la description, que tous les agendas affichent, alors que le champ URL ne s'affiche pas partout ;
- les deux boutons de rappel entrent dans la garde de longueur, mois rempli.

Points pour le bon à tirer A14.d : le rôle placé dans la phrase (« Relancer Commercial : … ») ou en étiquette ; « cette étape » plutôt que le nom de l'étape, que la carte du dessus porte déjà ; « le reprendre → » à l'infinitif ou « reprends-le → ».

**Un piège de test** : la suite unitaire tourne en UTC, où l'heure locale et l'heure UTC se confondent. Un `DTSTAMP` écrit en heure locale passait (le sabotage « stamp local »). Un test sous `Pacific/Kiritimati`, quatorze heures d'avance, les sépare, et le sabotage tombe maintenant.

**Sabotages** :
- quinze sur les modules purs, dont quatorze font tomber au moins un test ;
- le quinzième (`resume.ts` qui ne refuse plus que le cas « vide ») est devenu équivalent avec la relecture de sécurité : un moteur illisible jette, et le `try` rend `null` quand même ;
- un de plus sur un build fermé, pour l'e2e des portes : la ligne toujours montée et le drapeau lu après l'`import()`. La ligne reste absente, mais le code du moteur se charge, et l'e2e tombe sur « a closed build loaded the engine's code on the landing ». Un premier essai, qui ne retirait que le second verrou, passait : sans le premier, la ligne n'est jamais montée.

**Vérifié** :
- `vitest --coverage` : 2 896 tests, au-dessus des seuils ;
- `tsc`, `eslint` et `next build` propres, moteur fermé comme la CI et moteur ouvert ;
- Playwright complet sur le build fermé, avec l'émulateur Firestore et `CI=1` : 845 specs, 839 passées, aucune au second essai, 6 ignorées par construction ;
- sur un build `ENGINE_ENABLED=true`, avec l'émulateur : les specs des portes, de la porte du résultat (`result-real.spec.ts`), des rappels, du fond blanc, du canari et du retour à l'accueil, 42, toutes passées ;
- neuf specs neuves : `e2e/engine-deck-theme.spec.ts` (la couleur peinte d'une slide à l'écran et un pixel du PNG, dans les deux thèmes, en français et en anglais), `e2e/engine-reminders.spec.ts` (les deux `.ics` téléchargés, leur jour, leur nom, sans valeur ni nom d'entreprise), `e2e/engine-entries.spec.ts` (la ligne de l'accueil et le code qu'elle charge, selon le build) et une de plus dans `result-real.spec.ts` ;
- captures relues : l'accueil en français à 1 280 px (le moteur seul) et en anglais à 390 px (sous le dernier score), la demande copiée avec « Me le rappeler », le rappel du mois sous les comptes, et la slide en blanc à 1 280 et 390 px.


## Design sync B6 : Claude Design à jour d'A15 et de C33, et les douze aperçus du jeu rejoués (2026-10-01, #265)

**Ce qui est parti** : les cinq contrats qui avaient changé depuis l'ancre de B4 (`fee6cc7084fe`). Ce sont `ErrorScreen` (`retry`), `LoadingScreen` (la variante `deep` racontée par l'horloge), `Button` (la bande de 44 px de `sm`), `MetaLabel` (`as`) et `GameEntry` (le surtitre de C33). La synchro passe par le chemin atomique, celui d'un projet épinglé : sentinelle d'abord, le contenu en quatre appels (96, 5, 180, 180), aucune suppression, la sentinelle de nouveau, puis `_ds_sync.json` seul et en dernier. `list_files` confirme les 463 fichiers, et `design/` (le brief 04 et son retour) n'a pas bougé. Ancre `edc539adcbbf`, 14 composants téléversés, 76 reportés avec leur note.

**Une seconde passe, le même soir** : A14 T6 (#264) a été mergé pendant la relecture de cette PR. Il ajoute deux jetons, `--paper-white` et `--surface-white` (le fond blanc du deck), et les confiait à B6. Le pilote, relancé sur la branche rebasée et contre l'ancre que la première passe venait de poser, ne trouve aucun composant changé : sources et rendus sont identiques. Seuls partent les fichiers partagés (101 : aperçus compilés, `_vendor/`, polices, bundle, CSS, README), entre les deux sentinelles, puis `_ds_sync.json`. Le rendu est revérifié (90 sur 90, aucun mauvais), et l'ancre devient `6da5e42a15ef`.

**Trois méthodes, trois trouvailles** :
- **la recherche de dérive** (chaque aperçu relu contre la copie qu'il cite) : `NumberField` et `FieldRow` citaient encore les deux messages du moteur qu'A15.2 et A15.3 ont réécrits. Une erreur de saisie ne se rend pas dans une image fixe, donc aucune capture ne pouvait le montrer : la phrase partait vers l'agent de design par les exemples du `.prompt.md` ;
- **le contrôle ponctuel** des composants dont le code avait changé sans leur aperçu (`Button`, `MetaLabel`, `SpaceBand`, `WordmarkLink`) : les rendus sont justes, mais la doc de `MetaLabel` disait « ce n'est pas un titre », faux depuis A15.13. Son histoire `Tracking` dessine maintenant les deux titres du résultat comme `ResultView` (`as="h2" wide`) ;
- **la régénération des douze aperçus du jeu que B4 avait laissés** (Antoine : « Tout maintenant »). Chaque chiffre est rejoué par `playPath`, `finalState` et `endingState` et les fonctions de l'îlot, chaque feuille comparée octet par octet. Sept étaient justes. Cinq ne l'étaient pas, tous notés « bon » depuis le 2026-09-29 :
  - `ShareRow` : un texte de partage tapé à la main, que le modèle ne produit pas ;
  - `ResumePrompt` : deux taux qu'aucune année n'atteint, la même paire inventée que `QuarterTimeline` en B4 ;
  - `PatternCatalogue` : 4 et 3 entrées sous « les huit ficelles », et des répartitions qu'aucune année ne donne. `ThreeGroups` vient maintenant d'une année trouvée par une marche aléatoire, nommée dans l'histoire ;
  - `EventClipping` : une seule des deux coupures du trimestre en français ;
  - `VideoCall` : `Ringing` passait un message vide, alors que l'îlot passe toujours `bossMessage`.

**Dans le produit** :
- la JSDoc de `framing` dans `DgFace` plaçait l'avatar dans « le journal », qui ne dessine aucun visage : c'est le rapport et l'écran des nouvelles. Corrigé. Elle n'avait jamais atteint Claude Design, parce que le `.d.ts` émis coupe une JSDoc vers 120 caractères, avant ce membre de phrase ;
- **A12.i**, ouvert dans `CHANTIERS.md` : rien ne passe `refId` à `TourLoop`. Le lien de fin de niveau « Où en est ta croissance ? » ne porte donc jamais `?ref=`, contre GAME-BRIEF 13.3 D. Le jeu est fermé, rien ne fuit ;
- noté sans y toucher : « 83 / 100 » garde des espaces simples autour de la barre en français.

**Vérifié** :
- `dist/types` n'a pas été reconstruit après la correction de `DgFace` (`cfg.buildCmd` se lance à la main, le pilote ne le fait pas). C'est sans effet ici : le `.d.ts` émis coupe avant la phrase corrigée. Mais une correction de JSDoc plus courte, elle, ne partirait qu'après `cfg.buildCmd` ;
- trois passes du pilote ;
- `package-validate` : 90 aperçus rendus sur 90, aucun mauvais, mince ou identique (`report_validate` envoyé), 303 cellules, et seulement les quatre avertissements permanents ;
- les 13 composants modifiés sont notés « bon », cellule par cellule, sur leurs captures ;
- `conventions.md` relu contre le build : tous les noms qu'il cite existent, rien à changer.

## A14.c, T7 : l'intégration — les comptes, la confidentialité, les écrans ensemble (2026-10-01, #266)

La dernière PR du code du moteur complet (`docs/engine/moteur-complet.md` §19.12 à §19.14), drapeau fermé. **Avec elle, A14.c est fini**, sauf T6.2, l'image de partage, qui attend la passe de Claude Design (B5). Reste le bon à tirer A14.d, puis l'ouverture (D2). Neuf PR en un jour : #255, #256, #258, #259, #260, #261, #263, #264 et celle-ci.

**Ce que fait T7** :
- **Cinq chemins d'analytics de plus** (§19.12), dans le vocabulaire fermé et au tableau de bord `/admin/stats` :
  - `engine_month_started`, le seul signal d'un usage répété : compté une fois le mois enregistré sur l'appareil, jamais lequel ;
  - `engine_exported/ics` et `engine_exported/csv` : un rappel et le modèle de tableau ;
  - `engine_entry_clicked/result_owner` et `engine_entry_clicked/landing_resume` : les deux portes de T6.
- **Une porte se compte par `trackEngineEntry`**, typé sur la liste : jamais une chaîne libre, donc ni l'étape ni le score de la page autour.
- **La porte de l'accueil compte son clic sans rien voir.** `EngineResume`, seul lecteur du moteur hors de sa route, n'a pas le droit d'appeler l'analytics (règle 8). Il reçoit de `LastResult` un rappel `onFollow`, appelé une fois, sur le clic, sans argument ; le côté qui compte est une flèche sans paramètre.
- **La phrase de confidentialité** dit maintenant tout ce qui est compté : le démarrage d'un nouveau mois, l'ouverture des slides, leur export ou la copie de leur texte, l'export d'un fichier (sauvegarde, rappel ou modèle) et le lien par lequel on entre dans le moteur. Elle disait « l'ouverture ou l'export des slides », et taisait la sauvegarde `.json` et les portes, comptées depuis la v1 et A7.9. Elle repart « à relire », et elle est visible dès le merge, comme celle de S5.
- **Les écrans d'A14, mesurés ensemble** (§19.13). Chaque PR avait tenu les siens à la largeur où elle les construisait. `engine-mobile.spec.ts` les reprend tous, comme ceux des deux motions :
  - les dix écrans : le bandeau du mois suivant, un mois démarré, un mois passé en lecture seule, le sélecteur, le réglage d'un nouveau moteur, la suppression, l'aperçu d'un tableau collé, la fusion, le rappel d'une demande et le deck en blanc ;
  - à 360, 390 et 430 px dans les deux langues, sans un pixel de trop ; à 320 px, mesurés sans être tenus, 0 partout ;
  - puis axe sur les panneaux : le sélecteur, le tableau, les choix d'import et la suppression.
- **Le fond blanc à l'impression.** Le PDF est l'impression du navigateur, sans fichier à lire au pixel. La spec lit donc la feuille d'impression là où elle s'applique : en média d'impression, la slide garde son blanc, ou son papier, avec `print-color-adjust: exact`.
- **L'état** d'`ENGINE.md`, de `CHANTIERS.md` et de `CLAUDE.md`.

Hors de ce qui précède, §19.13 ne manquait de rien : la série, les deux moteurs, la fusion, le tableau collé, les `.ics` et les portes avaient leurs specs depuis leur PR. Les gardes statiques aussi : le collage par la règle 7, `ics.ts` par la règle 3.

**La relecture de sécurité** (`relecteur-securite`) n'a trouvé aucune fuite, mais des gardes nominales (convention 11). Ses quatre constats sont traités :
- **La vérification d'`onFollow` regardait la forme de l'appel, pas ce qui traverse.** Un appel vide dans une boucle ou dans un effet passait encore, et transmettait un compte ou un bit sans clic. Le côté qui compte n'était tenu par rien. La règle 8 exige maintenant :
  - trois mentions d'`onFollow` dans `EngineResume` (la prop, sa déstructuration, un seul appel) ;
  - cet appel sur le clic, sans argument ;
  - côté `LastResult`, exactement `onFollow={() => trackEngineEntry("landing_resume")}`.
- **La règle 8 ne voyait que les imports directs** : un `TrackedLink` dans `EngineResume` l'aurait contournée. Elle suit maintenant les imports de proche en proche, et le module d'analytics ne doit pas être atteint.
- **Les deux portes envoyaient une chaîne libre, et la CI, qui construit moteur fermé, ne les joue jamais.** D'où `trackEngineEntry`, et une règle 9 : hors de la route, chaque porte passe par lui avec un littéral de la liste. Seuls les deux anciens composants, `SpaceStrip` et `SpaceBand`, nomment encore l'événement, et aucun fichier n'écrit un événement du moteur en toutes lettres.
- **La phrase de confidentialité oubliait la copie du texte des slides, et les portes** : complétée, voir plus haut.

**La relecture de copie** (`relecteur-copie`) a relevé dix constats. Les huit mécaniques ou d'exactitude sont corrigés :
- la phrase de confidentialité et le commentaire de son marqueur ;
- dans `CHANTIERS.md`, l'ordre conseillé qui se contredisait, la ligne D qui ne nommait pas A14, et la place de la copie de T6.2 ;
- dans `ENGINE.md`, les conditions d'ouverture, qui se lisaient comme complètes, et le compte des PR ;
- « the deck's four » : le deck exporte trois formats, plus la sauvegarde.

Points pour le bon à tirer A14.d : la phrase de confidentialité elle-même, plus longue qu'au nº6, et « ton moteur » au singulier dans le paragraphe qui la précède, alors qu'un appareil en garde jusqu'à dix depuis T5.

**Un piège de git, rattrapé avant la PR** : regrouper les commits de T7 avec `git reset --soft origin/main`, juste après un `fetch` qui venait d'amener B6 (#265, mergée par une autre session pendant la vérification), a produit un commit qui défaisait B6 : 36 fichiers au lieu de 24. Poussé sur la branche, jamais en PR : le `--stat` l'a montré. Le commit a été reconstruit sur sa vraie base, puis rebasé sur B6, les deux entrées du journal gardées. La règle est dans `GITHUB.md` §1.10.

**Sabotages** :
- sur un build fermé, trois : une largeur forcée sur l'aperçu du tableau fait tomber les six tests de largeur d'A14 ; la règle d'impression retirée fait tomber la spec du PDF ; l'événement du mois retiré fait tomber les deux specs de la série ;
- sur un build ouvert, les deux clics de porte retirés font tomber les deux specs de l'accueil et celle du résultat ;
- sept sur les gardes statiques, et chacun fait tomber la règle 8 ou la règle 9 :
  - `onFollow` appelé depuis un effet ;
  - `onFollow` qui porte la ligne ;
  - un `TrackedLink` importé dans `EngineResume` ;
  - `LastResult` qui lit un argument ;
  - l'étape du résultat dans la porte ;
  - un `trackEvent` libre à la place de la porte typée ;
  - le même, à côté d'elle. Celui-ci n'est tombé qu'avec la dernière vérification, celle qui interdit d'écrire un événement en toutes lettres : avant, le sabotage précédent ne tombait que parce qu'il retirait l'appel typé.

**Vérifié** :
- `vitest --coverage` : 2 897 tests, au-dessus des seuils ;
- `tsc`, `eslint` et `next build` propres, moteur fermé comme la CI et moteur ouvert ;
- Playwright complet sur le build fermé, avec l'émulateur Firestore et `CI=1` : 855 specs, 849 passées, aucune au second essai, 6 ignorées par construction ;
- sur un build `ENGINE_ENABLED=true`, avec l'émulateur : les specs des portes, de la porte du résultat, des rappels et du canari, 30, toutes passées, clics comptés compris ;
- dix specs neuves : neuf dans `engine-mobile.spec.ts` (les largeurs dans les deux langues, 320 px mesuré, axe) et une dans `engine-deck-theme.spec.ts` (l'impression) ; les événements neufs sont lus dans les specs de la série, du tableau, des rappels, des portes et du canari ;
- captures relues : les dix écrans d'A14 en français à 390 px et en anglais à 1 280 px, et la page de confidentialité dans les deux langues.


## B7 : le brief 05 des puces d'étape, déposé dans Claude Design (2026-10-01, #268)

**La demande d'Antoine** : A15.19, le seul écart que les lois de l'UX ont laissé (`design/LOIS-UX.md`, similarité). Écrire et déposer un brief pour Claude Design, sans toucher au composant.

**Le constat, relu dans le code et mesuré dans un vrai build** : `PillarChip` est une valeur dessinée comme un `Button` secondaire. Même rayon (`--radius-button`, le jeton des boutons), même bord plein de 2 px, presque la même hauteur (54,5 px au bureau, 50 px au téléphone et en `sm`, contre 47 et 55 px pour le bouton), aucune ombre au repos. Seuls la police (mono contre Inter) et une nuance de bord les séparent sur papier. **La nuit, même cette nuance disparaît** : le monde nuit lie `--border-soft` et `--border-hard` au même `--night-line`. Le fond n'y est pour rien : dans la carte de l'accueil, il est celui de la carte, et la puce n'y est plus qu'un bord, comme un bouton secondaire transparent. Sur le résultat, seul le `?` se touche ; **sur l'accueil, la puce entière est un lien** vers sa page du glossaire (R2-13), sans survol, et son nom accessible est le seul nom de l'étape, sans la note. Les deux vont dans le brief comme questions, pas comme correctifs.

**Les captures** (`design/ds-extension-05/`, dix PNG) : `/r/sample` et l'accueil, en français et en anglais, à 1 280 et 390 px, tirés d'un `next build` puis `next start` comme la CI (`GAME_ENABLED=true`, d'où la carte du jeu sur le résultat, dite dans le brief). S'y ajoutent deux gros plans à 3× d'une puce normale et de la rouge à côté du vrai « Partager ce résultat », clonés depuis la même page pour que la CSS de production dessine les trois. **Deux pièges de capture** :
- `fullPage` avec un cadrage coupait le fond de la page net à 900 px, un artefact de l'outil et pas du produit. Les captures défilent maintenant la vraie fenêtre ;
- l'en-tête est collant aux deux largeurs (118 px au bureau, 114 au téléphone) et translucide (alpha 0,92, voulu). Le premier cadrage glissait le titre du profil dessous. Le défilement retranche maintenant sa hauteur.

À l'accueil, à 1 280 px, « Voir un résultat d'exemple » et la première rangée de puces partent à 2 px l'un de l'autre sur la même ligne : la confusion en place, sans montage.

**Le brief** (`design/DS-EXTENSION-BRIEF-05.md`, en anglais, sur la forme du 04) :
- ce qui doit rester : la note sur 20, le rouge de l'étape qui freine (un diagnostic, jamais en tirets), le `?` et sa cible de 44 px, et le contraste AA de la CI ; la jauge aussi, sauf avis contraire ;
- ce qu'on attend : une puce qui se lit comme une valeur, en papier comme en nuit ;
- les contrastes d'aujourd'hui, mesurés composés sur leur vrai fond, aux deux mondes ;
- huit questions, les dix contraintes, et les états à dessiner ;
- le retour demandé dans `design/ds-extension-05-return/`, sous la forme du 04. Une précision vient de `ds-extension-04-return/COPIE.md` : la planche doit s'ouvrir depuis sa source, puisque ses PNG et son `board.js` construit n'avaient pas pu être rapatriés.

**Le dépôt** : onze fichiers écrits par `DesignSync` dans le projet `23b9671c-…`, aux mêmes chemins que dans le dépôt, sous un plan qui ne nommait qu'eux, sans suppression. Le bundle, la sentinelle et `_ds_sync.json` ne sont pas touchés (ancre `6da5e42a15ef`, relue avant). Comme pour le 04, **rien ne tourne côté Claude Design tant qu'Antoine ne le lance pas** : c'est D11, avec le prompt à coller.

**Vérifié** :
- `list_files` relu après l'envoi : les onze chemins y sont, et le brief 04 et son retour n'ont pas bougé ;
- le brief relu côté projet par `get_file` : identique au fichier du dépôt ;
- les dix captures sont distinctes (sommes de contrôle) et relues à l'œil une par une ;
- chaque chaîne citée relue dans `dictionary.ts` et `glossary-terms.ts`, chaque contraste recalculé depuis les jetons.

**Consigné** : `CHANTIERS.md` (vue d'ensemble, A15.19, B7, D11), `design/README.md` (l'index), `design/LOIS-UX.md` (la ligne de la similarité), `.design-sync/NOTES.md` (« Synced » : ce que le projet garde sous `design/`). Que de la doc et des images sous `design/` : `vercel-ignore.sh` ne déploie pas.

## B5 : le brief 06 de l'image de partage du moteur (2026-10-01, #267)

Antoine a demandé le brief de B5 le soir de la fin d'A14.c : l'image de partage du moteur se dessine d'abord dans Claude Design (C32 Q17), puis se porte en T6.2. Personne d'autre ne s'en occupait : la seule autre session de design en cours écrivait le brief des puces d'étape (B7).

**Ce qui est livré** : `design/DS-EXTENSION-BRIEF-06.md`, en anglais comme les briefs précédents. Ses captures sont dans `design/ds-extension-06/`, prises sur un build de production du jour, moteur ouvert :
- les images de partage du site telles qu'elles sont : l'accueil (ce que montre aujourd'hui un lien vers le moteur, comme toutes les pages de contenu), un résultat, et les deux images du jeu ;
- le haut de la page du moteur, en français à 1 280 px et en anglais à 390 px ;
- le peloton de l'exemple public, sur la page et en slide. Les captures passent par le bouton « exemple » de la page : aucun vrai chiffre.

**Ce que le brief pose** :
- le constat : un lien vers le moteur se déplie aujourd'hui en « № 15 questions », c'est-à-dire en Tour ;
- le cadre commun des images du site, à garder ;
- les contraintes du produit : jamais de vrais chiffres (l'image est la même pour tous, et rien ne quitte le navigateur), le titre dans les deux langues, et les chaînes existantes, toutes à relire ;
- les contraintes du moteur de rendu, Satori : flex seulement, pas de variables CSS, les cinq polices et leur sous-ensemble, le contraste ;
- quatre questions : le fond (papier ou outremer), l'image (le chronomètre, le peloton, les deux ou aucun), les mots, la pastille « 2/3 » ;
- ce qu'on attend en retour : les deux images en cadre portable, mesures en px et couleurs par jeton, le contrôle à 320 px, le texte alternatif, la liste des chaînes et un README des réponses, le tout en sources lisibles depuis le projet. Cette dernière exigence vient du retour du 04, dont la planche construite n'avait pas pu être rapatriée.

**Une course de numéros, rattrapée avant le merge.** Le brief est d'abord parti sous le numéro 05. Pendant sa CI, B7 a été mergée (#268) avec son propre brief 05, ses captures dans `design/ds-extension-05/` et la même ligne d'index. Avant le merge, la branche a été refaite sur le nouveau `main` : le brief de B5 devient le 06, ses captures passent dans `ds-extension-06/`, et l'index, B5 et le journal sont réécrits sur le texte de B7, sans toucher au sien.

**Une erreur corrigée en route.** La première version de cette entrée disait que `DesignSync` ne servait pas à envoyer un brief. B7 a montré le contraire : un brief se dépose dans le projet Claude Design par `DesignSync`, sous `design/`, sous un plan qui ne nomme que ses fichiers, puis Antoine le lance (D11).

**Le dépôt**, à la demande d'Antoine, le même soir : onze fichiers écrits par `DesignSync` dans le projet `23b9671c-…`, aux mêmes chemins que dans le dépôt, sous un plan qui ne nommait qu'eux, sans suppression. Le bundle, la sentinelle et `_ds_sync.json` ne sont pas touchés. Vérifié :
- `get_project` avant l'envoi : un design system, modifiable ;
- `list_files` avant : rien sous `design/ds-extension-06/` ; après : les onze chemins y sont, et les briefs 04 et 05 comme le retour du 04 n'ont pas bougé ;
- le brief relu côté projet par `get_file`, en entier : le même texte que dans le dépôt ;
- les fichiers envoyés sont ceux du commit de la PR (`git diff` vide sur `design/`).

`.design-sync/NOTES.md` (« Synced ») dit maintenant ce que le projet garde sous `design/`, brief 06 compris.

**Ce qui reste** : D12 (le lancer). Le retour va dans `design/ds-extension-06-return/`, une session le recopie dans le dépôt et le porte en T6.2 ; sa copie rejoint le bon à tirer du moteur.

## B8 : l'index du volet Design System, resté au 11 septembre (2026-10-01, #269)

**Ce qu'Antoine a vu** : pas de borne kilométrique dans le projet Claude Design. Ses deux captures montraient un `Bottleneck` qui ouvrait sur le chiffre au pochoir et sur « Solid engine, one flat tyre », une copie de maquette retirée le 2026-09-29, et un `LoadingScreen` à trois messages et trois barres, d'avant A15.

**Ce qui était en ligne, lu par `DesignSync` (lecture seule d'abord)** :
- les fichiers sont à jour : `_preview/Bottleneck.js` ouvre sur `ScoreDisplay variant="marker"` et « Retention is lagging… » ; `_preview/ScoreDisplay.js` exporte `Marker` et `MarkerSmall` ; le `.prompt.md` de `ScoreDisplay` documente la variante ; `_ds_sync.json` porte l'ancre de B6 (`6da5e42a15ef`, 90 composants) ;
- **`_ds_manifest.json`, l'index dont le volet tire ses cartes, est celui de l'envoi du 2026-09-11** : 34 composants, 34 cartes en cinq groupes, sans jeu, sans graphiques, sans les primitives de formulaire de l'extension 04. Ses 123 jetons sont aux valeurs de septembre (`--radius-tag: 4px`, `--radius-panel: 8px`) ;
- la sentinelle `_ds_needs_recompile` est toujours là : la recompilation qu'elle demande à Claude Design n'a tourné après aucun des six envois depuis le 11 septembre.

**Pourquoi personne ne l'a vu** : chaque synchro relisait `list_files` (les fichiers) et l'ancre de `_ds_sync.json`. Aucun des deux ne dit ce que montre le volet. Un ticket public décrit le même cas : rien ne déclenche la compilation pour des fichiers écrits par `DesignSync`, et le contournement est d'écrire le manifeste.

**Ce qui est fait, avec le feu vert d'Antoine** :
- **les 90 marqueurs `@dsCard` relus en ligne, un par un.** Groupe = dossier du composant, `viewport="900x700"` exactement pour les 30 cartes en colonne de `config.json`, sans exception ;
- **un nouvel index** : 90 composants, 90 cartes en sept groupes, et 368 jetons. Ce sont les déclarations de `globals.css` et de ses imports dont le sélecteur contient `:root`. Un premier jet n'acceptait que `:root` seul et perdait les 34 jetons sémantiques déclarés sous `:root, [data-world="paper"]` (`--surface-card`, `--text-body`…) : rattrapé en comparant à l'ancien index. Trois anciens jetons manquent, retirés exprès du produit (`--dur-message`, `--texture-spray-strong`, `--width-mobile`, gardés dehors par des tests de jetons morts) ;
- **l'envoi** : un plan qui ne nommait que `_ds_manifest.json`, sans suppression. Ni la sentinelle, ni le bundle, ni `_ds_sync.json`, ni `design/` ne sont touchés. L'index en ligne a été relu juste avant, inchangé.

**Vérifié** :
- l'index relu en ligne après l'envoi est identique, octet pour octet, au fichier envoyé ;
- `.design-sync/build-manifest.mjs` produit le même fichier, octet pour octet, par ses deux chemins : depuis `config.json`, et depuis un bundle dont chaque carte porte le marqueur relu en ligne ;
- non-vacuité : un `viewport` faussé dans une carte change la sortie, et une carte sans marqueur fait échouer le script.

**Ce que l'index n'a pas réparé** : Antoine a rechargé le volet après l'envoi, et rien n'a changé. Le volet ne lit donc ni l'index du projet en direct, ni les fichiers de ses cartes : il montre une copie compilée le 2026-09-11. Les captures le laissaient prévoir, puisque `Bottleneck` et `LoadingScreen` étaient déjà indexés et montraient pourtant leur rendu de septembre. La sentinelle est toujours là après le rechargement.

**Ce qui n'est pas touché** : l'agent de Claude Design lit les fichiers du jour. Le retour du brief 05 contient sa copie du `_ds_bundle.css` en ligne (`design/ds-extension-05-return/board/system-snapshot.css`, datée du 2026-10-02), avec `--radius-tag: 999px`, `--paper-white` et le monde nuit. Les maquettes sont construites sur le design system actuel ; seul le catalogue du volet est figé.

**Le diagnostic, avec Antoine** :
- la piste de la publication est écartée : il n'y a ni bouton « Publier » ni état « brouillon » dans le projet ;
- le bouton « Actualiser » ne change rien ;
- une fenêtre privée montre la même chose, ce n'est donc pas un cache du navigateur.

Le texte du skill `/design-sync` (trouvé en ligne) dit que l'application « clears the sentinel whenever the user opens the project » et que les nouvelles cartes « appear next time the user opens or refreshes the project ». Chez nous, la sentinelle survit à chaque ouverture : **le rafraîchissement de Claude Design échoue sur ce projet**, au moins depuis le premier envoi après le 11 septembre, donc avant que `design/` ne contienne quoi que ce soit. Aucun fichier envoyé par la synchro ne le relance. Le signalement à Anthropic est prêt (D13, texte à coller). **Antoine, le même soir : « on laisse comme ça, ce n'est pas si dérangeant »** ; D13 devient facultatif. Le script et l'index restent : l'index est juste, et le script le tiendra juste quand le rafraîchissement remarchera.

**Consigné** : `.design-sync/NOTES.md` (« `_ds_manifest.json` », le chemin d'envoi, « Synced », « Re-sync risks », les 30 cartes en colonne), `CHANTIERS.md` (B8, la vue d'ensemble, le prompt B), `CLAUDE.md` (la correction de « les 90 composants y sont »). Que de la doc et un script hors de `src/` : `vercel-ignore.sh` ne déploie pas.
