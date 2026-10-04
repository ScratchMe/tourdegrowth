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
telles quelles, en huit volumes rangés par période (un neuvième, le même jour, pour celles du 2026-09-30 ; un dixième le 2026-10-02, pour celles du 2026-10-01 ; un onzième le 2026-10-03, pour celles du 2026-10-02). **Quand ce fichier dépasse
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
| [11. Le moteur simplifié et l'en-tête compact](docs/journal/11-moteur-simplifie-en-tete-compact.md) | 2026-10-02 | Le retour 05 et C34–C35, A16, l'image de partage du moteur (T6.2), A17, C36 à C39, les briefs et retours 07 et 08 (C38, C40 à C44), A19, la design sync B9 et B12, A18 de T0 à T3.c |
| Ce fichier | depuis le 2026-10-03 | A18 de T3.d à T7 et son bon à tirer nº9, les films (C45), A20 (la spécification, le brief 09, son retour, C46 à C55, le portage), et la suite |

## A18 T3.d : les cibles et les nombres partagés dans les Réglages (2026-10-03, #297)

Neuvième étape du portage du retour 07, drapeau fermé, et la dernière de T3 : **les Réglages reçoivent ce que le parcours a quitté**, les cibles de l'écran « Cibles » (T3.a) et la base du pas à pas (« Ta base », partie avec T3.b). T3 est fini.

**Maintenant** :
- **« Cibles »** : une case par chiffre qui peut nommer une étape (C1), libellée par son nom, son `oneLiner` en aide, un groupe par moteur coché (le titre du moteur seulement dans l'hybride). Les mêmes cases que sur l'écran « Cibles » et sur l'écran de chacun de ces chiffres.
- **« Nombres partagés »** : un champ par compte que plusieurs chiffres utilisent (`settingsSharedCounts`, testé) : les inscrits de la cohorte et du mois en libre-service ; les affaires gagnées et les clients en assisté, et les opportunités créées dans l'hybride, où le lien les porte aussi. Le libellé est celui du catalogue dans le premier chiffre qui le porte, ses mois remplis (`{period}`) ; l'aide dit « Utilisé par {list}. », les noms en milieu de phrase.
- **Écrits avec le reste** : tapés dans les Réglages, cibles et nombres attendent « Enregistrer les réglages » comme tous les autres champs, et « Annuler » les laisse tomber. L'écran « Cibles » et l'écran d'un chiffre, eux, écrivent toujours en quittant la case. Un nombre changé s'écrit dans la base et dans chaque chiffre qui le porte (`withSettingsNumbers`, sur `withSharedCount`), dans la même écriture que les réglages.
- **Les gardes** : une case illisible arrête l'enregistrement, le focus dessus (A15.2) ; un nombre partagé à zéro, négatif ou effacé aussi, avec « Un nombre entier plus grand que zéro. » (la garde d'A15.9, partie avec la base).
- **`settings.lead`** sous le titre : « Tout ici a une valeur par défaut. Change-la quand un chiffre le demande. »
- **`targetsStart.lead`** dit maintenant « ou dans les Réglages ».

**Ce qui n'y est pas** :
- **Les deux MRR** restent sur l'écran de leurs chiffres : un montant dans une devise se tape avec le chiffre auquel il appartient.
- **Un compte qu'un seul chiffre porte** n'est pas offert : en assisté seul, les opportunités créées (leur second chiffre est le lien de l'hybride). La fiche, de même, ne dit rien d'autres chiffres quand aucun ne porte le nombre.
- **L'avertissement de fenêtre sous la fenêtre**, dès qu'elle change (le retour, `settings.windowWarn`) : les réglages le disent toujours en bas de la carte, avant l'enregistrement (`resets`, depuis le 2026-09-25). À voir avec T7.

**Ce qui part** : l'action `setBase`, sans appelant depuis T3.b.

**La copie** : sept clés neuves dans `settings`, « à relire ». `lead`, `targets`, `targetsLead`, `shared` et `sharedHint` viennent du retour ; `sharedLead` et `wholeCount` sont de la session.
- `targetsLead` y disait « de chaque chiffre », ramené à « de chacun de ces chiffres », la correction de T3.a sur `targetsStart.lead`.
- `pipeline.noTarget` passe à « in Settings » en anglais, comme `targetsStart.lead`.
- **La relecture (`relecteur-copie`)** a trouvé six points :
  - deux libellés de l'assisté affichaient `{period}` brut, le défaut que `text.test.ts` décrit déjà pour la fiche ;
  - les noms des chiffres étaient en majuscule en milieu de phrase ;
  - le compte à un seul porteur ;
  - « de chaque chiffre » ;
  - l'anglais de `noTarget` ;
  - et `settings.lead`.
- Les cinq premiers sont appliqués, et la spec de l'hybride vérifie maintenant qu'aucune accolade ne reste à l'écran.

**Pour le bon à tirer A18.d** :
- `settings.lead` n'est plus vrai des cibles ni des nombres partagés, qui n'ont pas de valeur par défaut ;
- « Utilisé par {list}. » cite des noms sans article, et « Utilisé » se lit sous des libellés au féminin pluriel (« Opportunités créées… »).

**Les specs** :
- `engine-settings.spec.ts`, neuve (4 tests) :
  - les cibles et les nombres tapés dans les Réglages, enregistrés avec eux, oubliés par « Annuler », le nombre écrit dans les chiffres qui le portent, axe sur la carte ;
  - les gardes (zéro, effacé, cible illisible), rien d'écrit ;
  - l'hybride en français (un groupe par moteur, cinq nombres, aucune accolade) ;
  - l'assisté seul (deux nombres).
- `engine-mobile` mesure les réglages de l'hybride à 360, 390 et 430 px, et à 320.
- **Non-vacuité, mesurée** : l'enregistrement des réglages qui écrit l'état d'avant les nombres fait échouer le premier test sur la cible enregistrée (le 2026-10-03, sur les trois tests d'alors ; les deux autres passaient : ils n'enregistrent rien).
- Les tests unitaires de `settingsSharedCounts` et `withSettingsNumbers` (4).

**Vérifié** :
- `tsc` et `npm run lint` propres ;
- **3 045 tests unitaires** verts, dont les 4 des deux fonctions neuves ;
- `next build` avec les variables de la CI ;
- les **304 specs** du moteur, des cibles, de l'accessibilité et de la plateforme sur le build final : 303 passées, une ignorée par construction ; 917 specs au total (`--list`, hors captures temporaires) ;
- **captures** des réglages, en libre-service et en hybride, en français et en anglais, à 1 280, 390 et 320 px, sans défilement horizontal : les libellés de l'assisté disent leurs mois, les aides leurs chiffres en minuscule.

## A18 T4 : la page courte au retour, avant le premier rendu (2026-10-03, #298)

Dixième étape du portage du retour 07, drapeau fermé : **la page** (brief 07 Q1, `EngineLanding`).

**Avant** : une seule page prérendue, la même pour tous. Un lecteur qui revenait voyait l'introduction d'un premier passage (le chapeau, le positionnement, la carte de confidentialité, l'appel, « Combien de temps ça prend ») avant son moteur, qui ne s'affichait qu'à l'hydratation, à plus de 1 000 px sous le haut de la page.

**Maintenant** :
- **Un script inline avant le contenu** (`engineKnownScript`, `lib/engine/known-script.ts`) demande seulement si l'une des clés du moteur existe (l'index v3, ou une clé v2 ou v1 d'avant la migration). Si oui, il pose `data-engine="known"` sur `<html>`. Il ne lit aucune valeur, n'envoie rien, n'écrit rien. Si le stockage lève (fenêtre privée), il ne fait rien : la page du premier passage est alors la bonne.
- **La version courte est du CSS seul** (`EngineLanding`, neuf dans `components/engine/`) :
  - le surtitre ;
  - le H1 à la taille d'une section (`--engine-landing-title`) ;
  - la promesse en une ligne (`page.promiseLine`), jamais repliée ;
  - puis l'outil.
  
  Le chapeau, le positionnement, la carte, l'appel et le chronomètre restent dans le HTML, cachés : un moteur de recherche, qui n'a pas de stockage, lit toujours la page entière.
- **La place de l'outil est tenue** par une boîte en pointillés (« Ouverture de ton moteur… », `--engine-reserve`, 560 px, 640 au téléphone). Elle part dès que l'îlot dit qu'il est prêt (`.tool:has(> [data-state="ready"])`) : rien ne saute au-dessus du pli.
- **L'outil commence à 356 px à 1 280 et 298 px à 390**, mesuré : le retour annonçait 287 et 288, contre 1 267 et 1 849 avant.
- **L'îlot pose aussi l'attribut**, une fois, à sa première lecture. Une navigation côté client ne lance pas le script inline. Ensuite il n'y touche plus : un moteur créé, importé ou effacé dans la session ne replie ni ne déplie l'introduction au-dessus de la personne, et la visite suivante relit. Un moteur illisible compte comme connu : son tableau dit ce qui ne va pas, jamais le premier passage.
- **« Entre tes chiffres → »** devient secondaire (une ancre) : le seul bouton principal de la page est celui de la carte de départ.
- **« Combien de temps ça prend »** passe sous l'outil, pour tous : la carte de départ dit les mêmes comptes en une ligne.

**Écarts au retour** :
- **Le chronomètre** reste à côté de l'introduction à partir de 1 100 px, comme depuis la synthèse I + B (le retour le montrait dès 761 px). La carte de confidentialité garde son bord outremer plein et son ombre, que tient `spaces-kit.spec.ts`.
- **La boîte de réserve vit dans la section de l'outil**, pas dans `EngineLanding` : elle s'en va par `:has()` dès que l'îlot y est prêt, sans état ni effet.

**La règle 3 d'`engine-boundary`** (aucune primitive qui envoie quelque chose, dans le code du moteur) interdisait tout `<script>`. Elle reçoit une exception nommée, tenue par son propre test :
- ce script-là, sans `src` ;
- une seule fois, dans `page.tsx` ;
- le nom lié au vrai import ;
- et son texte épinglé à l'octet par `known-script.test.ts`.

Mesuré : sans l'exception, la règle nomme la page. La règle couvre aussi `components/engine/`, que l'îlot atteint.

**La relecture de sécurité (`relecteur-securite`)**, rien de bloquant. Appliqué :
- le script ne prend plus d'argument ;
- il échappe `<` comme `JsonLd` ;
- sa sortie exacte est épinglée ;
- l'import est épinglé dans l'exception ;
- `components/engine/` est entré dans la règle 3 ;
- le canari recharge la page une fois le moteur rempli, pour enregistrer aussi la branche « connu » ;
- la spec de ce que lit un moteur de recherche passe par la requête du contexte, qui porte l'aperçu.

La note sur un futur `script-src` (l'autoriser par le hash de ce script, jamais par un nonce qui rendrait la page dynamique) est dans `NEXTJS.md` §2.2, pas dans `next.config.mjs` : la barrière de `/livrer` exige ce fichier intact pour un merge sans Antoine.

**La copie** : `page.promiseLine` et `page.reserve`, neuves et « à relire », reprises du retour. La date de la page passe au 2026-10-03.

**La relecture (`relecteur-copie`)** :
- elle a demandé de bouger la date, ce qui est fait ;
- pour le bon à tirer A18.d, elle relève que la question de la FAQ sur l'assisté dit « Coche « Assisté » au réglage […] coche les deux », alors que la carte de départ est un choix unique depuis T3.a, avec « Les deux » pour troisième option.

**Les specs** :
- **`engine-landing.spec.ts`**, neuve, 5 tests :
  - le premier passage ;
  - le retour avant que l'îlot ne tourne, à 1 280 et 390 px, avec les scripts de la build bloqués : le script inline court seul ;
  - le retour lu, la réserve remplacée par le tableau ;
  - ce que lit un moteur de recherche.
- **`engine-page`** : « Combien de temps ça prend » vient après l'outil.
- **`engine-canary`** recharge la page avant de compter les requêtes.
- **Les tests unitaires** : 4 du script, 4 du composant, 1 de l'exception.
- **`dead-tokens`** : les quatre jetons de T4 sortent de la liste d'attente.

**Pas vérifié en e2e** : la navigation côté client vers la page. Les liens qui y mènent sans recharger (la bande des espaces, le dernier résultat de l'accueil) n'existent qu'avec le moteur ouvert au build ; celui du résultat (`/r/<id>`) change de layout racine, donc recharge.

**Vérifié** :
- `tsc` et `npm run lint` propres ;
- **3 054 tests unitaires** verts, dont les 9 neufs ;
- `next build` avec les variables de la CI, et la page reste prérendue (●) dans les deux langues ;
- les **318 specs** du moteur, du kit des espaces, des cibles, de l'accessibilité et de la plateforme sur le build final : 317 passées, une ignorée par construction ; 922 specs au total (`--list`, hors captures temporaires) ;
- **captures** du haut de la page, premier passage et retour (avant l'îlot et lu), en français et en anglais, à 1 280 et 390 px : l'outil commence au même endroit avant et après la lecture.

## A18 T5 : l'hybride, un total et un moteur à la fois (2026-10-03, #299)

Onzième étape du portage du retour 07, drapeau fermé : **le tableau hybride** (brief 07 Q18, `TotalBand`), l'écran le plus dense du moteur.

**Avant** :
- la bande « Deux moteurs, un total » avec le verdict en pochoir, deux blocs (MRR et nouveau MRR du mois), la liaison fléchée, les deux sommes ;
- puis les deux motions côte à côte, chacune avec sa couverture, son diagnostic et son dessin compact ;
- la phrase des deux segments, le petit échantillon, « Motion affichée : étapes et « Et si » », la liste et les leviers d'une motion, et le MRR dans 12 mois.

**Maintenant** :
- **`TotalBand`, une fois, en haut** (neuf dans `components/engine/`). Son titre est celui de la slide `total`, et c'est le titre et la cible du focus du tableau (`engine-verdict`). Viennent ensuite le MRR du libre-service, celui de l'assisté et le MRR total, puis la liaison en dernière ligne, avec sa note : une part du pipeline, pas une attribution.
  - **Une somme, jamais une comparaison** : ni barre, ni part ; l'ordre est fixe, le libre-service d'abord, quelles que soient les valeurs.
  - **Ni « + » ni « = »** : le total est séparé par un filet plein, à côté, ou au-dessus au téléphone, où les trois termes s'empilent.
  - **Le titre est sans l'accent rouge** : en 19 px semi-gras, le rouge (3,57) ne passe pas AA.
- **Puis la prochaine étape**, une seule pour les deux moteurs.
- **Puis « Moteur affiché »** (`hybrid.selectorLabel`, renommé, C42) : le même sélecteur, qui choisit maintenant **tout le tableau en dessous**. On y voit :
  - le verdict du moteur, le titre de sa propre slide (`pelotonTitle`, `relaysTitle`) ;
  - son diagnostic ;
  - son dessin (le peloton, ou les relais avec la couverture du pipeline) ;
  - sa liste, son levier.
  
  Jamais deux colonnes. Le petit échantillon de l'assisté se lit juste sous le sélecteur quand l'assisté est affiché, et la phrase des deux segments sous le sélecteur.
- **Le MRR dans 12 mois avec les « Et si »** passe dans le panneau « Et si » complet (l'inventaire du retour).

**Où vont les pièces qui quittent la bande** : le nouveau MRR du mois et les deux sommes, qu'on refait à la calculatrice, restent sur la slide `total` (`SlideTotal`), qui les avait déjà.

**L'exemple rempli** garde ses deux colonnes (`MotionColumns`) sous la nouvelle bande : il n'a pas de sélecteur, et il montre les deux moteurs d'un coup. À revoir avec T7.

**Ce qui part du tableau** : `MotionColumns` (reste à l'exemple), les styles de l'ancienne bande, et les pastilles de couverture par colonne. Chaque moteur dit son compte dans « Tes chiffres » (`EngineProgress`).

**Les jetons** : `--engine-figure`, le dernier de la liste d'attente d'A18, est lu ; la liste est vide.

**La copie** :
- `total.ssMrr`, `total.saMrr`, `total.sumMrr`, neuves et « à relire », reprises du retour ;
- `hybrid.selectorLabel`, « Moteur affiché » / "Engine shown", renommé et marqué « retouché ».

**La relecture (`relecteur-copie`)** :
- **Appliqué** :
  - la question de la FAQ sur la vente assistée ne dit plus « deux moteurs côte à côte », et la date de la page le dit ;
  - les commentaires qui situaient encore la copie « sous les deux diagnostics » ou « sous les deux panneaux » sont corrigés ;
  - la spec construit la phrase de la liaison depuis `total.link`.
- **Laissé à T6** : `hybrid.twoSegments` dit encore « Deux motions » sous « Moteur affiché ». Elle est aussi au pied d'une slide que golden-v2 fige à la lettre : son renommage va avec ceux de C42, et une projection du golden.
- **Pour le bon à tirer A18.d** :
  - `scenario.totalIn12Row` parle des « Et si » des deux panneaux, qu'on ne voit plus qu'un à la fois ;
  - le titre de la bande (`slideTitles.total`) redit les trois montants que la bande affiche juste dessous, alors que le retour proposait une autre phrase.

**Les specs** :
- **`engine-hybrid`** :
  - la bande (l'ordre, le total après son filet, ni « + » ni « = », la liaison, plus de sommes, un seul verdict en tête) ;
  - **un moteur à la fois**, qui remplace « deux colonnes » : son verdict, son diagnostic, son dessin, le petit échantillon sous le sélecteur avant le verdict de l'assisté, rien de l'autre moteur ;
  - à 390 px, les trois termes empilés et le total sous son filet.
- **`engine-hybrid-journey`** : chaque moteur dit son compte sous « Moteur affiché ».
- **`engine-mobile`** : les relais lus sur l'assisté affiché, et l'axe avec son diagnostic rouge à l'écran. « Les deux colonnes aussi hautes l'une que l'autre » part avec les colonnes.
- **`engine-pipeline`** : la couverture se lit sur l'assisté affiché.
- **Le test unitaire de `TotalBand`** (5 tests).
- **`breakpoints`** : la requête de conteneur du tableau s'ouvre sur les colonnes de l'exemple. **`dead-tokens`** : la liste vide.

**Vérifié** :
- `tsc` et `npm run lint` propres ;
- **3 059 tests unitaires** verts, dont les 5 de `TotalBand` ;
- `next build` avec les variables de la CI ;
- les **317 specs** du moteur, du kit des espaces, des cibles, de l'accessibilité et de la plateforme sur le build de T5 : 316 passées, une ignorée par construction ; après la relecture, les 77 de l'hybride, de la page, du téléphone, du pipeline et de l'accessibilité repassent ; 921 specs au total (`--list`, hors captures temporaires) ;
- **captures** du tableau hybride, le libre-service puis l'assisté affichés, en français et en anglais, à 1 280 et 390 px, sans défilement horizontal.

## A18 T6 : les mots, les renommages de C42 et les cinq « ? » (2026-10-03, #300)

Douzième étape du portage du retour 07, drapeau fermé : **les mots**. Le retour liste 49 chaînes changées (sa colonne « *was* »), et C42 retient tous les renommages, relus au bon à tirer.

**D'abord, un relevé chaîne par chaîne contre le code.** La plupart étaient déjà portées par T1 à T5 avec les écrans qui les portent :
- « Comment vends-tu ? », « Moteur, mois et fichier », « Dernière visite » ;
- « Le piège, avant de taper », « Comment il se situe », « La cible de ton équipe » ;
- « Tes chiffres », « À demander », « Moteur affiché », « Cibles », « Nombres partagés »…

**Ce que T6 renomme, sur les écrans** :
- « Mois des flux » → **« Mois des chiffres »** (`setup.referenceMonth`, le champ du mois). Le retour proposait « Chiffres de », qui, lu avec la liste, donnait « Chiffres de août 2026 » (jamais « de {month} ») ; « Mois des chiffres » est la phrase de la carte de départ ;
- « Liaison avec le libre-service » → **« La liaison entre les deux »** (`hybrid.linkBlock`) ;
- « Ce que tu as déclaré au Tour × ce que tu retrouves ici » → **« Le Tour et tes chiffres »** (`mirror.title`) ;
- le peloton reçoit son titre, **« Pour 100 inscrits »** (`board.pelotonTitle`, la légende de sa figure, sur le tableau). Le retour disait « Tes 100 inscrits », mais la ligne sous le dessin dit que tes inscrits sont « ramenés à 100 », et ce 100 a déjà été lu comme un vrai chiffre ;
- « Deux motions, deux segments : chacune… » → **« Deux moteurs, deux segments : chacun… »**, sous une clé neuve pour les écrans (`hybrid.twoEngines`, sous « Moteur affiché » et sous les colonnes de l'exemple) ;
- « motion » → « moteur » dans l'aide de la marge globale (`sheet.companyWideHint`) ;
- en anglais, « the relays » → « the steps of a deal » dans la bannière de l'exemple de l'assisté (`rename.relays` ; le français garde « les relais »).

**Ce que T6 ne renomme pas, et pourquoi** :
- **Les slides et leurs notes**, qui disent encore « motion » (le pied « chacune se lit contre ses cibles », la règle « un client compte dans la motion qui a signé », la marge « des deux motions ») : golden-v2 fige à la lettre ce qu'une build v2 imprimait, et la règle du golden n'autorise une projection que pour un champ ajouté. Renommer une slide est une décision du bon à tirer A18.d, qui refigerait le golden en connaissance de cause. Les deux pièges du catalogue qui disent la même règle (`engine-catalog.ts`, la marge et « qui compte où ») restent avec elles, pour que l'écran et la slide ne disent pas la règle de deux façons.
- **Les choix déjà tranchés par une relecture**, gardés et listés pour A18.d :
  - « Commence → » (la carte de départ, T3.a) contre « Commencer par ton premier chiffre → » ;
  - « Passe au chiffre suivant : {number} → », à l'impératif comme les autres appels fléchés, contre « Chiffre suivant : {number} → » ;
  - la phrase de la liaison avec ses chiffres et sa note (« n des m opportunités… ») contre « {n} opportunités sont venues du libre-service » ;
  - « Pas assez de cibles pour conclure » contre « Aucune étape désignée : aucun des six chiffres… » ;
  - les phrases de la fiche (`value.cohortHint`, `value.invalid`) et l'avertissement de fenêtre, que les écrans de T1 et des Réglages disent déjà à leur façon.
- **« Effacer ce moteur »** : le menu garde « Supprimer ce moteur » (un moteur parmi plusieurs, A14 T5) et « Tout effacer » (l'appareil) ; le retour fond les deux, à trancher au bon à tirer.

**Les cinq « ? »** (le retour, « Glossary entries: 5 new ») : « cohorte », « cible », « repère », « fenêtre », « nombre partagé ». Chacun est là où son mot sert pour la première fois :
- sur les mois d'un chiffre de cohorte du libre-service ;
- dans l'aide de la case de cible ;
- dans la légende du repère de « Comment il se situe » ;
- sous la fenêtre d'activation, dans une aide neuve (`settings.windowHint`) ;
- sur les titres « Cibles » et « Nombres partagés » des Réglages.

Une définition est ouverte à la fois (`EngineTermScope`, autour de chaque écran de l'îlot).

**Un défaut trouvé par la spec, dans le design system** : la bulle (`DefinitionPopover`) rend le focus à son « ? » quand elle se ferme (R-19). Un appui sur un autre « ? » la ferme dès son `pointerdown`, et ce retour de focus faisait défiler la page jusqu'au premier « ? ». Le second partait de sous le pointeur avant la fin de l'appui : le clic ne tombait sur rien, aucune définition ne s'ouvrait.
- Mesuré sur l'écran d'un chiffre, deux « ? » à 400 px l'un de l'autre : le `pointerdown` sur la cible, le `click` sur le corps de la fiche.
- Correctif : le focus revient sans défiler (`preventScroll`), pour tous les « ? » du site.
- La spec qui ouvre la cohorte puis la cible le tient : elle échouait avant.

**La mécanique** :
- **Pourquoi pas `GlossaryTerm`** : il lit le glossaire du site, que l'îlot n'importe jamais (`engine-boundary`, règle 2). Les cinq mots viennent donc avec la copie du moteur (`strings.terms`), résolue côté serveur comme tout le reste.
- **`EngineTerm`** monte le déclencheur et la bulle du design system (`DefinitionTrigger`, `DefinitionPopover`), sans « En savoir plus » : ces mots n'ont pas de page.
- **Jamais dans un `<label>`** : un bouton y deviendrait le contrôle qu'il nomme. Le « ? » se met dans une aide, une légende ou un titre.

**La relecture (`relecteur-copie`)** a trouvé quatre points bloquants, appliqués :
- « Chiffres de » (« de {month} ») ;
- la définition de la cohorte, qui disait « la cohorte du mois précédent » alors que la cohorte suivie recule avec la fenêtre de paiement et se choisit ;
- celle du repère, « pour des entreprises comparables », plus que ce que dit sa réserve ;
- celle du nombre partagé, « le modifie dans tous », alors qu'un chiffre borné que le nouveau nombre rendrait impossible garde sa base (`withSharedCount`) ; `settings.sharedLead` (T3.d) avait le même défaut.

Pour le bon à tirer A18.d :
- le seul « ? » de « fenêtre » est sous le choix de la fenêtre, alors que sa définition renvoie aux Réglages ;
- la ligne des périodes de l'assisté, juste sous le champ renommé, dit encore « les flux » ;
- les deux pièges du catalogue et les slides qui disent « motion ».

**La copie** : le groupe `terms` (les deux mots de la bulle reprennent ceux du glossaire, validés), `settings.windowHint`, `board.pelotonTitle`, `hybrid.twoEngines`, et les renommages, tous « à relire ». La garde des comparatifs de l'hybride (`engine-copy.test.ts`) admet la phrase des deux moteurs, comme elle admettait celle des deux motions.

**Les specs** :
- `engine-terms.spec.ts`, neuve, 6 tests :
  - l'écran d'un chiffre de cohorte, les trois « ? », un à la fois, axe avec la bulle ouverte ;
  - les Réglages ;
  - les libellés renommés à l'écran ;
  - chacun en français et en anglais.
- `engine-series` cherche le champ du mois par son libellé dans la copie, `engine-hybrid` lit `twoEngines`.

**Vérifié** :
- `tsc` et `npm run lint` propres ;
- **3 059 tests unitaires** verts ;
- `next build` avec les variables de la CI ;
- les **359 specs** du moteur, du kit des espaces, des cibles, de l'accessibilité, de la plateforme, du clavier, du glossaire et du quiz (les autres « ? » du site, que le correctif de la bulle touche) sur le build final : 358 passées, une ignorée par construction ; 927 specs au total (`--list`, hors captures temporaires).

## A18 T7 : l'intégration, l'avant et l'après mesurés, et les champs qui prenaient 42 px (2026-10-03, #301)

Treizième et dernière étape du portage du retour 07, drapeau fermé : **l'intégration**. Le code du moteur simplifié est entier ; reste son bon à tirer unique, A18.d.

**Le script de densité, remis d'accord avec le portage** (`scripts/engine-density.capture.ts`). Il visait encore les identifiants du pas à pas, de l'écran de la base, des onglets et de « À aller chercher ». Il parcourt maintenant :
- la carte de départ, puis le réglage complet derrière « Changer » ;
- l'écran « Cibles » et le premier chiffre, intact, puis « Où le trouver » ouvert ;
- les demandes, toutes sur un écran ;
- le levier, sur le tableau ;
- le tableau du retour, l'écran d'un chiffre ouvert depuis sa ligne, et la prochaine étape ;
- l'hybride, le mois suivant, les deux pages entières et la slide, comme avant.

Ses lignes MEASURE portent maintenant les clés du retour (`board/measures.js`), lues de la même façon : l'outil est `#engine`, un contrôle est visible et hors d'un `<details>` fermé. Les trois colonnes se lisent donc côte à côte : l'avant (B10), la proposition du retour, et le portage.

**Mesuré sur un build de production** (`ENGINE_ENABLED=true`, la même horloge et les mêmes données que B10 ; en anglais, à 1 280 puis 390 px) :
- **l'outil commence à 811 / 955 px** à la première visite (1 267 / 1 849 avant, 735 / 956 au retour 07), **et à 356 / 298 px au retour** (1 267 / 1 849 avant, 287 / 288 proposés). L'écart avec le retour 07 vient de la page courte, qui garde le H1, la promesse et la durée au-dessus de l'outil (T4) ;
- **la première carte fait 618 / 781 px et 7 contrôles**, exactement la proposition, contre 1 431 px et 36 contrôles pour l'ancienne carte de réglage ;
- **le tableau du retour a 27 contrôles**, comme proposé, contre 75 avant. Il mesure 3 463 / 4 132 px, contre 3 136 / 3 627 proposés : trois choses que la planche ne dessinait pas l'allongent d'environ 330 px. Ce sont la phrase de sauvegarde dans la prochaine étape, les deux plis du pied (« Tous les leviers ensemble » et « Saisie en tableau ») et la carte du Tour ;
- **un chiffre intact : 1 169 / 1 488 px et 15 contrôles** (1 113 / 1 422 proposés) ; avec « Où le trouver » ouvert, 1 807 / 2 361 (1 689 / 2 206 proposés) ;
- **8 écrans de « Commencer » jusqu'aux demandes** (le départ, les cibles, cinq chiffres, les demandes), là où le pas à pas en comptait 21 en tout. Le premier chiffre arrive au troisième écran, contre deux proposés, à cause de l'écran « Cibles » gardé (C40).

Le tableau complet et les 26 captures sont dans `design/ds-extension-07-after/`, numérotées comme celles de B10 là où l'écran a survécu. **Le catalogue n'a pas bougé** : le texte des 41 fiches par langue, réextrait de la page portée, est identique à celui de B10 au caractère près. C'est l'expertise que le brief demandait de garder.

**Deux pièges de mesure, corrigés dans le script** :
- **un trait bleu barrait le tableau à 900 px de son haut.** Pour capturer un élément plus haut que la fenêtre, le script passait les éléments collants en `static`. Depuis A19, le bord de l'en-tête est une couche absolue : l'en-tête redevenu statique, ce bord tombait au bas du premier écran. Un élément collant passe maintenant en `relative`. C'était un artefact de capture, pas un défaut du produit ;
- **la hauteur d'un chiffre aux plis ouverts variait d'un passage à l'autre** (1 668 puis 1 476 px, en français à 1 280) : on mesurait pendant la transition d'ouverture. Le script attend maintenant la fin des animations, et deux passages donnent les mêmes chiffres.

**La spec d'intégration** (`e2e/engine-screens.spec.ts`, 6 tests). Elle parcourt dix écrans dans les deux langues :
- le départ et son réglage complet, les cibles ;
- un chiffre intact, puis tous ses plis ouverts ;
- les demandes ;
- le tableau, menu fermé puis ouvert ;
- les Réglages, et l'hybride.

Sur chacun, à 1 280 et 390 px : aucune violation axe sérieuse ou critique (le contraste compris), une bande de 44 px sous le doigt au travers de chaque contrôle, et rien qui pousse la page de côté. À 320 px, le contraste et les 44 px sont tenus, et la largeur est mesurée sans être tenue (§18.10.3) : elle valait 0 sur chaque écran.

**Ce qu'elle a trouvé au premier passage, dans le design system.** Les champs prenaient 42 px sous le doigt dans une boîte de 48 (38 dans 44, pour un champ de chiffre), sur tout le site :
- **la cause** : la boîte du champ (`core/Field.module.css`) dessine un bord de 3 px, 2 de bordure et 1 de marge interne. Ce bord appartenait à la boîte, et un appui dessus, en haut comme en bas, n'atteignait pas le champ ;
- **pourquoi personne ne l'avait vu** : la mesure du retour 07 comptait la boîte comme cible, et `targets.spec.ts` ne mesure que les boutons ;
- **le correctif** : le champ déborde de 3 px sur ce bord, haut et bas, et rend ces 3 px en marge interne. Son fond s'arrête à son contenu, pour qu'une couleur d'autoremplissage ne couvre jamais le bord. Le bord vaut 3 px dans les deux états, puisqu'un champ invalide a une bordure de 3 px et aucune marge interne ;
- **vérifié sans rien changer à l'écran** : captures avant et après d'un champ de texte au repos et au focus, d'un champ de chiffre vide, rempli, invalide et avec son unité, et d'un écran de chiffre entier, identiques au pixel. Le seul écart, le champ invalide, était le rouge saisi en pleine transition (120 ms). Une capture faite après la transition donne #d2402c, la couleur du jeton ;
- **la garde** : un test de `form-controls.test.ts` tient la règle. Le champ déborde de `--field-edge-invalid`, la boîte garde 1 px de marge interne et sa bordure, et 2 px plus 1 font les 3 px du bord invalide. Il échoue sur ses deux sabotages : la marge rendue à 0, puis un bord invalide passé à 4 px.

`TESTING.md` §2.2 gagne la leçon : une cible se mesure là où le doigt tombe, pas sur la boîte dessinée.

**`ENGINE.md`** : un bloc dit maintenant ce qu'est le moteur après A18 (un seul parcours, l'écran d'un chiffre, la prochaine étape, le tableau, la page, l'hybride, les mots, ce qui n'a pas bougé). Dans les blocs plus anciens, ce qui le contredit est de l'histoire.

**B13, la re-synchro d'A18**, est prête à lancer. Ce qu'elle emportera :
- les quatorze composants neufs de `src/components/engine/` : `NumberSheet`, `AnswerSwitch`, `TrapNote`, `WhereToFind`, `HowItCompares`, `EngineBar`, `NextStep`, `EngineProgress`, `NumberList`, `LeverCard`, `EngineStart`, `AskList`, `EngineLanding` et `TotalBand` ;
- les deltas de `Disclosure` et de `BulletChart` ;
- le retour de focus sans défilement de `DefinitionPopover` (T6) ;
- le champ qui couvre son bord (ici), qui ne change aucun aperçu.

**Restes connus, laissés à A18.d ou à plus tard** :
- l'avertissement de fenêtre des Réglages se lit sous la fenêtre, pas dans la carte ;
- `ExampleView` garde ses deux colonnes pour l'exemple de l'hybride ;
- la page courte du retour commence à 356 px au bureau, au lieu des 287 proposés (T4, choisi).

**Vérifié** :
- `tsc` et `npm run lint` propres (après le retrait des specs de capture temporaires, jamais versionnées) ;
- **3 060 tests unitaires** verts ;
- `next build` avec les variables de la CI ;
- **422 specs** sur ce build : celles du moteur, du kit des espaces, des cibles, de l'accessibilité (aux deux largeurs), de la plateforme, du clavier, de l'audit (l'autre écran qui dessine des champs) et du glossaire. 421 passent, une est ignorée par construction ; 933 specs au total (`--list`).

## A18.d : le bon à tirer unique du moteur, construit (nº9, 2026-10-03)

**Ce qui est construit** : le [bon à tirer nº9](https://claude.ai/artifact/5oYQ3ZF2sCUd6yiVajifC7), tout le texte du moteur après A18, en une passe (C38) : 120 cartes, 1 786 chaînes, chacune en français et en anglais. Les décisions s'écrivent dans `cards/`, comme depuis le nº5. Il suit l'ordre où l'on rencontre le moteur :
- **À trancher**, six décisions en tête. Chaque carte cite les chaînes concernées, qui se relisent aussi sur leur propre carte ;
- la page, le départ, l'écran d'un chiffre, les demandes, le tableau de bord, « Et si », l'assisté et l'hybride, les réglages et les fichiers, les slides ;
- le catalogue, une carte par chiffre (17 du libre-service, 15 de l'assisté, la liaison) et deux pour les calculés ;
- **hors de l'outil** : l'image de partage, la reprise du moteur sur l'accueil et sur un résultat du Tour, les deux paragraphes de la confidentialité, le repère du churn réécrit (C1), et les quatre termes du glossaire de la vente assistée (A7.3.e).

**Ce qu'il absorbe** : A7.3.d et A14.d, comme C38 l'a voulu. **Et il remplace le nº8**, décision de cette session, à renverser d'un mot. Le nº8 avait été construit le 2026-09-28, avant A7.3, A14 et A18, et la plupart de ses 82 cartes décrivaient des écrans qui n'existent plus (le pas à pas, la base, les onglets). Une seule y était tranchée, les deux repères (C1), et le code l'applique. Le garder ouvert aurait fait relire la même copie dans deux documents, ce que la méthode interdit.

**Les six décisions** :
- la clause rouge du verdict et l'étape du diagnostic, qui peuvent nommer deux étapes en rouge sur le même écran (la trouvaille 9 du retour) ;
- « motion » sur les slides, les notes et deux pièges du catalogue, que golden-v2 fige ;
- « Supprimer ce moteur » et « Tout effacer », contre le seul « Effacer ce moteur » du retour ;
- quatre libellés gardés contre le retour (« Commence → », « Passe au chiffre suivant : {number} → », la phrase de la liaison, « Pas assez de cibles pour conclure ») ;
- la relance d'une demande après cinq jours, ou sept ;
- « × » ou « fois ».

**Les relevés des relectures**, de T1 à T7, d'A7.3 et d'A14, sont posés chacun sur la carte de la chaîne qu'ils visent, dans son paragraphe gris, et vérifiés contre le code avant d'y entrer. Trois ne tenaient plus et sont restés dehors :
- « Le pas à pas garde ta place » (réécrit à T3.b) ;
- le montant négatif dit comme un compte (corrigé à A14) ;
- « ton moteur » au singulier, qui visait la confidentialité et pas le menu.

**Trouvé en construisant** : la demande à copier (`request.message`) dit encore « notre moteur de croissance », alors que l'outil s'appelle « moteur de growth » depuis C2. C'est le seul texte du moteur qui quitte l'appareil. Posé en gras sur la carte de la demande, pas corrigé : la copie se tranche au bon à tirer.

**La méthode**, celle de `/bon-a-tirer` (le skill, lu et suivi, pas appelé ; Antoine a demandé d'aller jusqu'au bout du chantier) :
- l'inventaire part de `grep -rn "TODO: à relire" src/`. `engine-copy.ts` et `engine-catalog.ts` sont marqués en tête, donc entiers. Hors de l'îlot, chaque marqueur est rangé par sa provenance : A7.3.e, C1, C2, A14 T6. Les autres (le jeu, A15, la bande des espaces, `llms`, l'audit) restent à leurs bons à tirer ou dans la liste « hors de tout bon à tirer » ;
- les textes viennent du code, par la sonde jetable `scripts/live/_bat-export.live.ts`, supprimée ensuite ;
- la page est celle du nº8 : seuls changent la charge utile, l'en-tête et le titre, et la barre collante gagne l'encart de sécurité du haut ;
- chaque carte dit, depuis le nº8, combien de ses chaînes sont neuves ou changées.

**Vérifié** :
- chaque chaîne des sources entières est dans une carte et une seule (le générateur refuse sinon) ;
- les 120 identifiants sont uniques ;
- rendu dans Chromium à 1 280 et 390 px, sans défilement de côté et sans erreur de script ;
- la collection `cards` est vide à la publication ;
- l'écriture d'une décision ne s'exerce que depuis un clic sur la page, pas d'ici.

**Ce qui reste** : les réponses d'Antoine, puis leur application (`/bon-a-tirer appliquer`), qui lèvera les marqueurs. Ensuite B13, la re-synchro, et l'ouverture du moteur (D2), qui attend aussi le nº7.

## Plus d'aperçus Vercel : seul `main` déploie (2026-10-03, #296)

**Le problème** : le quota de déploiements du compte (100 par 24 heures, `VERCEL.md` §1.12) se vidait sans aucun merge. Chaque push de branche crée un déploiement d'aperçu ; `ignoreCommand` en saute le build, mais il tourne **après** la création, donc l'entrée existe (annulée) et compte. Relevé le 2026-10-03 sur GitHub : la tête de #295, poussée le 2026-10-02 à 23 h 58 UTC, porte un statut `Vercel` en `failure`, « Deployment rate limited — retry in 24 hours ». Un relevé fait par Antoine dans une autre session comptait 48 déploiements annulés sur 24 heures ; la session ne peut pas le relire (`list_deployments` répond toujours 403, `VERCEL.md` §1.9).

**La décision** (Antoine, sur la méthode d'une autre session qui l'avait appliquée à Ramille) : `vercel.json` gagne `"git": { "deploymentEnabled": { "**": false, "main": true } }`. Un push de branche ne crée plus aucun déploiement ; un merge sur `main` en crée un, comme avant.

**Vérifié avant d'écrire** :
- la documentation Vercel (*Git configuration*) : les motifs sont du minimatch, une branche absente vaut `true`, et une branche qui répond à plusieurs motifs déploie dès que l'un d'eux vaut `true` ; `main` déploie donc malgré `"**": false` ;
- minimatch, exécuté : `*` ne couvre ni `claude/sharp-ptolemy-iyis9j` ni `dependabot/npm_and_yarn/…`, `**` les couvre ;
- la branche de production est `main` : branche par défaut du dépôt, et domaine `tourdegrowth-git-main-…` du projet Vercel ;
- le ruleset de `main` (`/rules/branches/main`) n'exige que `Types, tests, build` : le statut `Vercel` qui disparaît des PR ne bloque aucun merge, et aucun workflow ne lit un aperçu.

**Ce qui change** :
- `vercel.json`, et `src/__tests__/vercel-config.test.ts` : deux tests neufs, l'un exige `"main": true`, l'autre `"**": false` sans clé `"*"`. Non-vacuité : réglage cassé des deux façons, chaque test rougit seul ;
- `scripts/vercel-ignore.sh` : sa règle 1 (« seule la production construit ») reste, pour une branche d'avant le réglage ou un déploiement fait à la main ; le commentaire le dit ;
- `VERCEL.md` : §1.10 réécrit (le réglage, pourquoi `ignoreCommand` ne suffit pas, les trois pièges, la vérification), §1.6 corrigé (un build sauté ne produit pas de fonction, mais son entrée existe et compte), §1.12 renvoie au correctif ;
- le commentaire d'en-tête de `ci.yml`, qui disait « Vercel builds every push ».

**Le piège qui reste** : le réglage suit la branche. Vercel lit le `vercel.json` du commit poussé, donc une branche ouverte avant le merge déploie encore à chaque push tant qu'elle n'a pas récupéré `main`.

**Vérifié** :
- `eslint` et `tsc` propres ; 3 062 tests unitaires après la fusion de `main`, qui avait reçu #295 et #297 à #301 entre-temps (3 060 + 2), couverture au-dessus des seuils. Build et Playwright sautés : `next build` ne lit pas `vercel.json`, et le reste du diff est de la doc et des commentaires.
- **Le réglage tient déjà sur la branche, avant le merge** : aucun statut `Vercel` ni commentaire du robot sur les deux commits poussés, quatre minutes après. Sur la tête de #295, le statut était arrivé cinq secondes après le commit, et un déploiement refusé par le quota laisse lui aussi un statut (`failure`). Aucun déploiement n'a donc été créé. C'est la preuve que Vercel lit bien le `vercel.json` du commit poussé.

## A18.d : les six décisions du bon à tirer nº9, appliquées (2026-10-03, #302)

**Ce qu'Antoine a tranché**, en tête du [nº9](https://claude.ai/artifact/5oYQ3ZF2sCUd6yiVajifC7), ses six cartes « À trancher » (lues dans `cards/`) :
- **la clause rouge du verdict** : option 1. Les deux rouges restent : le verdict dit ce qu'on ne voit pas, le diagnostic ce qui freine parmi ce qu'on voit. Rien ne change ;
- **« motion » sur les slides** : option 1, tout passe à « moteur » et le golden se refige (voir plus bas) ;
- **les deux effacements** : option 2, les deux gestes gardés, renommés ;
- **les quatre libellés gardés contre le retour** : `next.goNumber` et `total.link` prennent la version du retour ; « Commence → » et « Pas assez de cibles pour conclure » restent ;
- **la relance après cinq jours** : ça passe ;
- **« 2,6× »** : ça passe.

**Ce qui change, chaîne par chaîne** :
- **« motion » devient « moteur »**, accords au masculin compris (« chacun », « aucun des deux moteurs », « le seul moteur »). Sont concernés :
  - le pied de la slide du total ;
  - la marge globale des deux moteurs, et le titre unit economics sans marge ;
  - les notes « Pourquoi ne pas comparer les deux ? » et « Qui compte où ? » ;
  - les deux pièges du catalogue (l'ARPA et la marge brute de l'assisté) ;
  - un paragraphe de la confidentialité (« chaque étape de chaque moteur »), dont la date passe au 2026-10-03.

  `hybrid.twoSegments` disparaît : au mot « moteur », c'était mot pour mot `twoEngines`, que la slide côte à côte imprime maintenant ;
- **`next.goNumber`** : « Chiffre suivant : {number} → » / "Next number: {number} →" ;
- **`total.link`** : « {n} opportunités sont venues du libre-service ({period}). » / "{n} opportunities came from self-serve ({period})." (et le singulier). Le retour écrivait « en août 2026 », un mois. Le nôtre en tient trois, donc la période reste entre parenthèses. « de juin à août » aurait marché en français, mais aurait donné en anglais "came from self-serve from June…". Le compte des opportunités (`{m}`) n'est plus dit ;
- **l'effacement de l'appareil** : « Tout effacer sur cet appareil » / "Erase everything on this device", au menu et en titre de l'écran. Il se distingue ainsi de « Supprimer ce moteur ». L'exemple de la carte, « Effacer tout l'appareil », aurait pu se lire comme une réinitialisation du téléphone. L'écart est dit à Antoine sous sa note.

**Le golden refigé, sans réécrire son fichier.** golden-v2 fige à la lettre ce qu'une version v2 imprimait, et sa règle ne laisse bouger un texte que par une décision. La décision est écrite comme ce qu'elle change : `withDecidedWords` (`golden-projection.ts`) remplace les fragments décidés dans le côté attendu, sur une copie. Le fichier `golden-v2.json` n'est pas touché, et tout autre caractère doit toujours correspondre.
- Sans elle, trois cas de l'hybride échouaient : c'est la non-vacuité, observée.
- Un test neuf vérifie que la projection réécrit bien les slides de l'hybride v2 dans les deux langues, et qu'il n'y reste plus « motion » comme mot.
- golden-v1 n'a pas d'hybride et ne bouge pas.

**Les tests** : les deux qui citaient l'ancienne liaison, la garde des slides (`hybrid.twoEngines` est maintenant sur une slide), la garde des comparatifs (une seule phrase admise, au masculin) et le titre d'une spec.

**La relecture (`relecteur-copie`)** :
- **bloquant, corrigé** : les deux libellés d'effacement n'avaient que le marqueur d'en-tête du fichier. Ils ont maintenant le leur ;
- **appliqué** :
  - des marqueurs traçables (« retouché le 2026-10-03 (A18.d) ») sur chaque chaîne réécrite ;
  - l'exception de `goNumber` à la règle de l'impératif, écrite pour qu'on ne la « corrige » pas ;
  - la clé `m` morte dans `linkSentence`, retirée ;
- **pour le bon à tirer**, posés sur leurs cartes :
  - `linkNote` dit « ces comptes », qui n'a plus d'antécédent depuis que la liaison parle d'opportunités. Une première correction a été retirée : la note s'imprime sur les slides, et golden-v2 l'a refusée, à raison, puisque seule une décision fait bouger une slide ;
  - `asks.done` dit encore « passe au chiffre suivant » ;
  - « moteur » prend deux sens dans la même phrase de la confidentialité ;
  - « motion » reste dans le glossaire anglais (le terme GTM usuel) et dans `marketing/` (la fiche de faits, deux posts) : hors du moteur, à trancher.

**Vérifié** :
- `tsc` et `npm run lint` propres ;
- **3 061 tests unitaires** verts ;
- `next build` avec les variables de la CI ;
- les **272 specs** du moteur et de la confidentialité, toutes passées sur ce build.

## Les quatre films de motion design, et l'écart qu'ils révèlent dans le moteur (2026-10-03, #303)

**La demande d'Antoine**, en quatre temps dans la même session :
1. un film qui donne envie de se servir de tout Tour de Growth (le diagnostic, le moteur, le jeu), puis un film par espace ;
2. du son (« pour les réseaux, c'est impératif »), les versions 1:1 et 9:16, et un film du moteur plus fort : « Et si ? » au centre, la growth rendue lisible pour un board ou un investisseur, et le vrai problème, « je ne sais pas où en est ma growth », jusqu'au cas où chaque nouveau client creuse l'ARR ;
3. le prompt pour mettre le moteur à la hauteur du film (« je pensais honnêtement que c'était déjà le cas »), puis l'alerte quand le CAC payback est long, parce que c'est la trésorerie qui le paie ;
4. tout pousser dans le dépôt, prompts compris, pour qu'une autre session reprenne le sujet.

**Ce qui entre dans le dépôt** :
- `marketing/motion/` : la source de la page publiée (https://claude.ai/artifact/MDSptVBYtkDuT8vFPJW49Z, identique au caractère près), `films.mjs` (la page autonome, les MP4, les images à un instant donné), et un README qui dit comment la page est faite, d'où viennent les chiffres du moteur et ce qui reste à reprendre ;
- **C45** en section C de `CHANTIERS.md` : la direction, le calendrier et la copie neuve des films, avec une recommandation pour chacun ;
- **A20**, le moteur à la hauteur de son film : l'écart relevé dans le code, puis les **prompts E et F**. E écrit la spécification, code le modèle pur et envoie le brief 09 à Claude Design. F porte le retour, puis remet le film d'accord avec le moteur.

**Les films** : 47 s pour le Tour entier, 29 s pour le diagnostic, 44 s pour le moteur, 34 s pour le jeu. Chacun existe en trois formats et deux langues. Le fil rouge est le road book : la plaine, le contre-la-montre, la montagne, et la nuit qui tombe en montant. Retention traverse le film d'ensemble : le diagnostic la nomme, le moteur la chiffre, le jeu montre la tentation de tricher. Le film du moteur tient sur un SaaS d'exemple dont les chiffres sortent des formules du moteur (`scenario.ts#twelveMonths`, `unit-economics.ts`). Le client coûte 1 900 € et rapporte 1 500 € de marge. « Et si ? » fait passer le MRR dans 12 mois de 80 212 € à 122 402 €, et l'ARR de 963 k€ à 1 469 k€. Les hypothèses et le détail par levier sont dans le README.

**Les pièges** :
- **Une animation en `forwards` avec un délai montre l'élément avant son entrée.** Ce mode ne remplit qu'après la fin ; pendant le délai, l'élément garde son état de base, visible. Les entrées sont passées en `both`, et seules les animations de sortie gardent `forwards` (`FWD`).
- **La leçon 2 de `CLAUDE.md`, encore.** Le gros bouton de lecture avait un `display: flex`, et il restait affiché avec `hidden`. Corrigé par `.big-play[hidden] { display: none; }`.
- **La police pochoir met tout en capitales**, et « k€ » devenait « K€ ». Les chiffres en Stardos Stencil ont maintenant `text-transform: none`.
- **Google Fonts n'a pas chargé pendant l'un des rendus de contrôle.** Les trois polices sont maintenant embarquées en base64 (sous-ensemble latin, licence OFL) : un export ne dépend plus du réseau.
- **Le son rendu en une passe prenait 15 s** et bloquait la lecture. Il est maintenant rendu par tranches de 3 s, plus une passe pour les bourdons, soit environ 1,5 s. L'image part tout de suite et la musique la rejoint.
- **Deux exports ne sont pas identiques à l'octet.** Les indices de son sont les mêmes, mais le rendu audio hors ligne de Chromium varie au huitième chiffre d'un lancement à l'autre, et l'encodeur en fait un écart de la taille de son propre bruit (46 dB de PSNR au pire sur l'image). C'est le même film : le README et l'en-tête de `films.mjs` le disent, au lieu de promettre une copie à l'identique.
- **Le film a tort sur un point, laissé tel quel.** Il colore en rouge ce que les « Et si » ajoutent, alors que la règle du produit dit qu'une projection n'est jamais rouge (audit S-5). Le film suivra le moteur porté (prompt F), et pas l'inverse.

**L'écart du moteur (A20)**, relevé sur `9c81844`. Le moteur calcule déjà presque tout ce que montre le film : les « Et si » cumulés, ce que chaque levier rapporte seul, l'effet composé, le LTV:CAC sur une slide. Mais il le garde plié derrière une carte à un levier, et l'argent n'est pas sur le tableau. Il lui manque cinq choses :
1. l'ARR ;
2. la trajectoire du MRR mois par mois ;
3. le LTV:CAC dans « Et si » ;
4. un constat quand le LTV passe sous le CAC ;
5. un signal quand le payback est long. La fiche `cac-payback` du glossaire le dit déjà, mais le moteur n'a aucune notion de trésorerie.

Le prompt E code ce qui ne dépend pas du design. Il laisse à Antoine ce qui déclenche l'alerte de payback (une trésorerie de l'équipe en mois, une cible, ou les repères du glossaire, qui situent sans désigner, C1), et à Claude Design la place de chaque chiffre.

**La relecture (`relecteur-copie`)**, après l'ouverture de la PR :
- **bloquant, corrigé** :
  - le marqueur `TODO: à relire` manquait dans le README et la page : un `grep` sur `marketing/` ne trouvait pas les films ;
  - deux entrées étiquetées « produit » ne l'étaient pas mot pour mot. L'anglais de `pitch3` était retouché, et le français de `pitch1` avait des espaces ordinaires dans ses guillemets ;
  - le README disait la copie « marquée une par une ». C'est faux : quinze entrées neuves ne sont citées par aucune scène du storyboard, et quelques libellés sont écrits en dur hors de `C`. Le bon à tirer se construit donc depuis `C`, et le README liste les libellés en dur ;
  - **le calendrier contredisait C19 et C20** (« le Tour au seul SEO, sans fil ») : le diagnostic était proposé aux réseaux tout de suite. Il va maintenant à la page d'accueil et aux annuaires, et les réseaux attendent l'ouverture du moteur ;
- **corrigé aussi** :
  - le curseur du quiz choisissait « On peut le sortir… » (7 points), alors que l'action montrée ensuite est celle d'un « Non » à `ret-1` (`sample.ts`). Il choisit maintenant « Non », dans les deux films, et la cible du curseur a suivi ;
  - deux insécables, les guillemets droits en anglais, deux entrées du produit marquées `p: 1` ;
  - « The more you grow » au lieu de « The faster you grow », pour coller au français ;
  - « pour l'instant » ajouté à la règle sur LinkedIn ;
- **laissé au bon à tirer des films** :
  - « board » (voulu par Antoine pour le film) contre « CODIR » dans le moteur : c'est la question d'A20 ;
  - « growth » contre « croissance » ;
  - « La retention freine » ;
  - Amazon, « a accepté de payer » ;
  - les insécables des notes de la page ;
  - « Ton action » contre « Prochaine action » ;
  - « Expansion du mois » contre « Expansion mensuelle » ;
  - les étiquettes « Chiffres d'exemple » qui manquent sur quelques plans (listés dans le README).

Les écrans touchés ont été refaits en image et regardés : le quiz dans les deux films, les cartes et le catalogue du jeu en FR et en EN dans les trois formats, la phrase du moteur en 9:16. L'artifact est republié à la même adresse.

**Les MP4 ne sont pas versionnés.** Les douze en français pèsent environ 55 Mo, plus que tout le dépôt (44 Mo). Ils resteraient dans l'historique, et chaque checkout les téléchargerait. Ils ont été remis à Antoine dans la session, et `node marketing/motion/films.mjs mp4` les reconstruit en une vingtaine de minutes.

**Vérifié** :
- **Chaque film**, dans les trois formats et les deux langues, sur des planches de contact (aucun débordement, rien dans les 20 % du bas en 9:16) ;
- **le son**, par la mesure et par l'image de la forme d'onde : −15,2 LUFS intégrés sur le MP4 du diagnostic, pour une cible de −14 (`loudnorm` en une passe reste un peu sous la cible) ;
- **la page** : lecture et pause, le son, le changement de format, et 390 px sans défilement horizontal ;
- **`films.mjs` depuis le dépôt** : `page`, `frames`, et `mp4` sur le diagnostic en 16:9 (870 images, 52 s, H.264 1920×1080 et AAC), lancé deux fois pour comparer les deux sorties ;
- **`npm run lint`, `tsc` et `vitest --coverage`** : propres, 3 063 tests verts (liens de documentation et budget de `CLAUDE.md` compris) ;

Rien sous `src/` ne change, donc ni build ni Playwright. `scripts/vercel-ignore.sh` ignore `marketing/` et le Markdown de la racine : ce merge ne déploie rien.

## `films.mjs` : la page autonome écrite d'un coup (2026-10-03, #304)

En réexportant les vingt-quatre films (FR et EN, un format par terminal comme le conseille l'en-tête du script), l'export 9:16 anglais a échoué au démarrage : `window.__tdg` était indéfini. Chaque processus réécrit `out/films.html` en ouvrant sa page, et celui-ci l'a chargée pendant qu'un autre était en train de l'écrire : une page tronquée, sans son script. `standalonePage()` écrit maintenant dans un fichier temporaire propre au processus, puis le renomme : un lecteur voit l'ancienne page entière ou la nouvelle, jamais une moitié. L'export relancé avec le correctif est passé, cinq autres tournant en même temps.

## Les films passent du 1:1 au 4:5 (2026-10-03, #305)

**La demande** : on a dit à Antoine que le 4:5 valait mieux que le 1:1. La session l'a confirmé : en 1080×1350, la vidéo prend un quart de hauteur de plus dans un fil sur téléphone, et c'est le format que Meta recommande pour le fil. Elle a recommandé de **remplacer** le 1:1 plutôt que de l'ajouter, pour garder trois formats qui ont chacun leur usage. Antoine a dit oui.

**Comment** :
- La clé `s` de la page désigne maintenant le 4:5 : une scène de 960×1200 au lieu de 960×960, le bouton « 4:5 », et un export en 1080×1350 (`films.mjs`, nom `4x5`).
- **Un premier passage par script** (resté dans le scratchpad) a multiplié par 1,25 chaque position verticale du format `s` : 107 valeurs, avec les tailles intactes. La largeur ne change pas, donc les blocs ne peuvent pas grossir ; ils gagnent de l'air.
- **Puis une retouche scène par scène**, sur des planches de contact (une image par seconde, les quatre films, FR et EN) :
  - le road book de la course et celui de la fin sont recentrés ;
  - les deux cartes du moteur du film d'ensemble passent de côte à côte réduites à décalées en diagonale, à taille réelle ;
  - les éventails de slides sont agrandis et descendus ;
  - le quiz, le choix du ton, le résultat et la fin du diagnostic, l'accroche, la carte « Et si ? », les « 17 chiffres » et la fin du moteur, et la main de cartes du jeu sont redescendus pour équilibrer le cadre.
- **Ce que le script ne pouvait pas voir** : des positions écrites en texte, une transformation CSS (`translate(0px,210px)`), un `top:640px` dans une chaîne, et l'objet `{ right, top }` de l'étiquette des clics. Cette étiquette chevauchait le bas du téléphone du jeu et passait derrière une tuile ; elle est revenue sous le téléphone, dans les deux films.

**Vérifié** :
- les planches des quatre films en 4:5, en français et en anglais : rien ne déborde ni ne se chevauche, et « WHAT IF? » passe sur deux lignes en anglais, comme dans le carré ;
- **le 16:9 et le 9:16 ne bougent pas** : quatre images du film d'ensemble et du jeu, dans les deux formats, sont identiques au pixel près avant et après ;
- les huit MP4 en 4:5 (1080×1350, de 29 à 47 s, son AAC) : deux images de chacun regardées, puis remis à Antoine en deux zips ;
- la page en 4:5, à 1 280 et 390 px : le bouton « 4:5 », un écran de 520 × 650 et de 350 × 438, sans défilement horizontal. L'artifact est republié à la même adresse.

## A20, prompt E : l'argent du moteur, spécifié, modélisé et briefé (2026-10-03, #306)

**La demande** (Antoine, prompt E de `CHANTIERS.md`) : mettre le moteur à la hauteur de son film. Le film « Le moteur » montre l'ARR, la courbe du MRR, un client qui coûte plus qu'il ne rapporte et des slides pour un board ; le moteur n'en montrait qu'une partie. Cette session écrit la spécification, code en pur ce qui ne dépend pas du design, pose les questions et dépose le brief 09. Aucun écran ne change.

**L'écart, re-vérifié sur `db7fc72`** (le relevé datait de `9c81844`) : confirmé ligne à ligne, avec deux corrections et un ajout.
- *Corrigé* : « l'argent n'est pas sur le tableau » était trop fort. La carte du levier montre le MRR dans 12 mois, et en hybride `TotalBand` ouvre le tableau sur le MRR des deux moteurs et leur total (A18 T5, déjà sur `9c81844`).
- *Corrigé* : le LTV:CAC est aussi sur la slide des deux moteurs en regard, pas seulement sur celle d'unit economics.
- *Ajouté* : le film a tort sur un second point. Il imprime les montants projetés à l'euro et calcule ses écarts sur ces arrondis (13 344 € = 93 556 − 80 212), là où le moteur imprime une projection à deux chiffres significatifs (§6.2). Trouvé en tenant les chiffres du film par un test : le film se remettra d'accord au prompt F, comme pour le rouge.

**La spécification** : `ENGINE.md` §20, dans [`docs/engine/argent.md`](docs/engine/argent.md), avec un renvoi dans la table d'`ENGINE.md` et un bloc en tête. Pour chaque ajout : la formule, les intervalles, les cas incalculables, les hypothèses imprimées, ce qui bouge avec quel levier (§20.9, vérifié dans `scenario.ts` et `slg-scenario.ts`), et l'exemple chiffré du film.

**Le modèle (A20.a)**, `src/lib/engine/money.ts`, et deux interfaces qui l'étendent (`ScenarioKpis`, `SlgScenarioKpis` gagnent `MoneyKpis`), aujourd'hui et avec les « Et si », par motion :
- **l'ARR** et l'ARR dans 12 mois (× 12) ;
- **la courbe du MRR**, 13 points. `twelveMonths` rend maintenant ses treize points, et le MRR dans 12 mois **est** `mrrPath[12]` : une seule boucle. En assisté, `slgMrrPath` remplace `twelveMonthsOfNew`. Les contrats annuels arrivent à échéance également répartis (la base en ligne droite), les mensuels se composent ; cette forme est une hypothèse neuve, à imprimer sous la courbe, qui ne change aucun chiffre déjà imprimé ;
- **le LTV:CAC** dans « Et si », égal au bit à celui de la slide aujourd'hui ;
- **le constat de perte** (`lossCheck`) : `loss` si `LTV.hi < CAC.lo`, `maybe` si les fourchettes se chevauchent, `none` si le LTV couvre le CAC (l'équilibre compris), rien si une entrée manque, et l'écart par client. Il n'est **pas encore dans `findings()`** : sa phrase, son rang et sa place sont C48 ;
- **la durée de vie comptée et les mois de marge après le remboursement**. Avec le plafond de 36 mois, une perte **est** un payback au-delà de la durée de vie : un test le vérifie sur 2 000 cas tirés d'une graine fixe, les trois verdicts rencontrés ;
- **la trésorerie qu'un mois d'acquisition immobilise** : dépense × payback ÷ 2, soit l'intégrale d'un remboursement linéaire au rythme d'une cohorte par mois. C'est un plancher, sauf quand l'expansion peut dépasser les départs (`floor: false`), et ses hypothèses (`CashAssumption`) sont rendues **à part** de `assumptions`, pour qu'aucune phrase neuve n'apparaisse dans le panneau avant le portage. **La dépense est celle d'aujourd'hui**, quels que soient les leviers : recalculée depuis les payants et le CAC projetés, l'arithmétique des intervalles l'élargissait sans que rien n'ait bougé ;
- **les sommes de l'hybride** (`total.ts`) : `timesTwelve` (l'ARR d'une ligne du total, S9 tenue), `sumPaths`, `addBoth`. Aucune somme du LTV, du payback ni de la perte : chaque moteur a les siens.

**L'alerte de payback long n'est pas codée.** Son déclencheur attend C49 ; seuls les deux faits qu'elle lirait le sont.

**Les goldens tiennent au caractère près.** Les champs ajoutés sortent de leur projection (`golden-projection.ts#asBeforeA20`), et un test de `golden-v2` vérifie qu'elle en retire exactement huit par côté, puis zéro. Le MRR dans 12 mois est identique au bit, dans les deux motions.

**Les tests** : `money.test.ts`, trente tests, dont le SaaS du film de bout en bout (`filmState` et `FILM_LEVERS`, partagés avec le script de capture dans `__tests__/fixtures.ts`). **Non-vacuité mesurée**, chaque sabotage prouvé appliqué :
- la dépense projetée fait rougir « la dépense ne bouge jamais » ;
- `≤` pour une perte fait rougir « l'équilibre n'est pas une perte » ;
- la trésorerie sans « ÷ 2 » fait rougir trois tests ;
- la base annuelle en géométrique fait rougir « à mi-année, la moitié de la NRR » ;
- **un sabotage passe**, et c'est écrit en tête du test (`TESTING.md` §1.2) : la ligne droite écrite `M × (1 + (f − 1) × m/12)` garde les goldens verts, parce que sur les NRR de l'exemple (1,04 et 1,08) `1 + (f − 1)` vaut `f` au bit. La forme choisie le garantit pour toutes les NRR : une assurance, pas un correctif observable.

**Les questions, C46 à C52**, avec une reco chacune : l'ouverture attend-elle A20 (oui, le portage et son bon à tirer) ; où l'ARR (à côté de chaque MRR, en second) ; le constat de perte (rang 1 si certain ; il titre la slide d'unit economics, qui monte après le funnel, pas la première) ; l'alerte (la trésorerie de l'équipe en mois, facultative, les repères en contexte seulement) ; la marge de l'exemple (oui, estimée 70-80 %) ; « Et si » déplié (non, la carte porte la courbe) ; board et investisseurs dans la promesse (oui, une fois A20 porté). **Une prémisse corrigée dans C50** : les goldens v1 et v2 ne bougeraient pas avec une marge dans l'exemple, ils lisent des entrées figées en JSON (`buildInputs` ne sert qu'à leur écriture) ; ce qui bougerait, ce sont l'écran, les slides, la couverture et les 61 fichiers de tests et de specs qui lisent §6.0.

**Le brief 09** : [`design/DS-EXTENSION-BRIEF-09.md`](design/DS-EXTENSION-BRIEF-09.md), sur le modèle du 07, contraintes en tête. Il demande l'argent sur le tableau sans défaire A18, l'avertissement de trésorerie distinct de la perte et sans le rouge de la fuite, « Et si » en sommet avec la courbe, les slides pour un board, la promesse ; quatorze questions, les états attendus, un `INVENTORY.md` et un `COPY.md` en retour. **Vingt et une captures** dans `design/ds-extension-09/`, prises sur le SaaS du film par `scripts/engine-density.capture.ts` (tests « brief 09 », lignes `MEASURE09`), regardées une à une :
- le tableau du film fait 3 438 px et 26 contrôles à 1 280 ;
- le levier « Et si » y commence à 3 237 px ;
- le panneau ouvert ajoute 1 774 px et 9 contrôles (2 485 px à 390) ;
- le tableau de référence du brief 07, au retour, fait 3 480 px et 27 contrôles, 3 contrôles au premier écran.

Le « % » du levier paraît rogné à droite sur la capture, déjà dans celles d'A18 : mesuré, la boîte de la valeur finit au bord exact de la carte, sans débordement. Seule la capture rogne l'encre du glyphe.

**Le dépôt** : 22 fichiers écrits par `DesignSync` dans le projet `23b9671c-…`, aux mêmes chemins que dans le dépôt, sous un plan qui ne nommait qu'eux, sans suppression ; le brief redéposé seul une fois, pour une précision sur `EngineTerm`. Vérifiés : `get_project` (un design system, modifiable) ; `list_files` avant (aucun `09` dans le projet, seul le 07 sous `design/`) et après (le brief, les 21 captures, rien d'autre de changé) ; le brief relu par `get_file`. Le bundle, la sentinelle et `_ds_sync.json` ne sont pas touchés. **Rien ne tourne côté Claude Design tant qu'Antoine ne le lance pas** : c'est D16, avec le message à coller.

**Un piège d'environnement** : en session cloud, `next build` échouait sur « next/font/google queries have exactly one entry », le message que `NEXTJS.md` attribue à un `.next` recopié. Ici, c'était le réseau : le `fetch` de Node n'utilise pas `HTTPS_PROXY`. `NODE_USE_ENV_PROXY=1` le règle, et c'est écrit dans `NEXTJS.md` §1.9.

**Consigné** :
- `CHANTIERS.md` : A20 réécrit (l'écart re-vérifié, les étapes A20.a à A20.g), B14, C46 à C52, D16, la vue d'ensemble ;
- `ENGINE.md` : le renvoi vers §20 ;
- `design/README.md` : la ligne du brief 09 ;
- `CLAUDE.md` : l'état (les décisions ouvertes, le nombre de tests) ;
- `NEXTJS.md` : le piège du proxy.

**Vérifié** :
- `npm run lint` et `tsc` propres ;
- `vitest --coverage` : 3 094 tests verts, 31 de plus, seuils tenus ;
- le build comme la CI, puis Playwright complet sur ce build (résultat dans la PR) ;
- les captures regardées.

**Ce qui reste** : D16 (Antoine lance le brief), C46 à C52, puis le prompt F au retour : recopier le retour, poser ses décisions, porter A20.d.

## Les films : le jeu s'annonce comme un jeu, et tout finit sur une note positive (2026-10-03, #307)

**Le retour d'Antoine** : « c'est peut-être la partie jeu qui pêche un peu maintenant ». Même dans le film d'ensemble, qui finit par le jeu, « on ne comprend pas trop ce qu'on y fait ». Il demandait d'être clair dès le début sur ce qu'est le jeu (apprendre ce qu'il faut faire et ne pas faire), une musique plus positive, et surtout de finir sur une note positive : « maintenant tu sais quoi faire, let's go ».

**Le film du jeu (34 → 42,5 s)** :
- **une annonce de 3,2 s** : « Tour de Growth · le jeu » (le sur-titre du hub, repris tel quel), LE CÔTÉ OBSCUR au pochoir, et « Un jeu pour apprendre ce qu'il ne faut pas faire. » ;
- **puis l'ancien film, décalé de 3,2 s** : la visio, le dashboard, la main, le téléphone, décembre, le catalogue ;
- **« Cette fois, sans tricher. »** Le jour revient, et trois actions honnêtes du même niveau tombent : Offre de pause, Rappel avant prélèvement, et Résiliation en trois clics, le miroir exact des deux astuces jouées. Une courbe de confiance monte en vert, sans chiffre. Le tampon « Le playbook qui a marché » (le titre de la fin du jeu, repris tel quel) arrive avec « Chaque action honnête rapporte moins ce trimestre, et davantage sur l'année. » (adapté de la conclusion du jeu) ;
- **la fin, sur fond clair** : « Maintenant, tu sais quoi faire. » au pochoir, « À toi de jouer. » en rouge, le bouton.

**Le film d'ensemble (47 → 52 s)** :
- la nuit tombe sur une carte qui annonce le jeu : LE CÔTÉ OBSCUR, et « Un jeu pour apprendre ce qu'il ne faut pas faire. » ;
- la partie jouée suit, décalée de 2 s ;
- puis la bascule « Et ce qui marche, sans tricher. », avec les trois mêmes actions honnêtes ;
- l'arrivée, décalée de 4,4 s : sa promesse en trois temps cède la place à « Maintenant, tu sais quoi faire. C'est parti ! ».

**La musique** :
- une progression claire est ajoutée (`BRIGHT` : do, sol, la mineur, fa) ;
- la seule section sombre qui reste est décembre, dans les deux films ;
- la montagne passe d'un mode sombre à la mineur ordinaire ;
- la bascule monte en majeur, et les fins jouent un groove plein en majeur jusqu'au dernier coup.

**Un outil pour décaler une scène** : `TS`, un décalage global que lisent `an()`, `cue()`, les compteurs, les sous-titres, l'horloge de la visio et le point du road book. Il a évité de retaper une centaine de temps. Le premier rendu a buté sur une variable déjà déclarée plus haut dans le film du jeu (`ux`), renommée.

**Toute la copie neuve est marquée** `p: 0` (à relire), et le bon à tirer des films la reprendra. Les reprises du produit sont marquées `p: 1` : le sur-titre du hub, « Résiliation en trois clics » et « Le playbook qui a marché ».

**Vérifié** :
- les planches des nouvelles scènes, dans les trois formats et les deux langues : rien ne déborde, et en 9:16 tout reste au-dessus des 20 % du bas ;
- les deux bandes son : continues, sans trou, à −20 et −19,5 LUFS avant normalisation, comme les autres films ;
- les douze MP4 des deux films (trois formats, deux langues ; 52 s et 42,5 s, son AAC) : des images de chacun regardées, puis remis à Antoine en zips ;
- la page republiée à la même adresse, identique au fichier du dépôt.

## Les films : tout télécharger en un zip, depuis la page (2026-10-03, #308)

**La demande** : « Tu ne peux pas me faire une fois un zip avec tout ensemble ? » Après les envois successifs (les douze premiers MP4, les zips par format, le 4:5, la refonte du jeu), Antoine ne savait plus où trouver la dernière version de chaque format.

**Le blocage** : le zip complet pèse 115 Mo, et l'envoi de fichiers d'une session plafonne à 30 Mo. L'erreur le dit maintenant en clair ; plus tôt dans la journée, deux essais à 104 et 52 Mo étaient revenus en 502, sans motif.

**La solution** : les vingt-quatre MP4 sont stockés avec la page des films (l'outil Artifact, `asset: true`, en un appel ; chacun pèse moins de 8 Mo). La page gagne une section « Télécharger les films » et un bouton « Tout télécharger · zip » :
- la page récupère les vingt-quatre fichiers ;
- elle écrit un zip « stocké » (sans compression : les vidéos ne se compressent pas), avec un petit assembleur maison de quelques dizaines de lignes, sans bibliothèque ;
- elle le propose à l'enregistrement par la capacité `downloads`.

Le zip est rangé par langue puis par format, avec un LISEZ-MOI. La section n'apparaît que sur claude.ai : sur la page autonome de `films.mjs` et pendant un export, elle reste masquée. Après un nouvel export, il faudra réenvoyer les MP4 et remplacer la liste `DL_FILES`.

**Vérifié** :
- l'assembleur, en local, sur trois vraies vidéos servies en HTTP : `unzip -t` sans erreur, les fichiers extraits identiques au MD5 près, un nom accentué intact ;
- la section masquée hors de claude.ai ;
- les vingt-quatre fichiers stockés : ils sont bien les derniers exports. Le diagnostic et le moteur n'ont pas changé depuis le leur, et le Tour et le jeu sont ceux de #307 ;
- **pas vérifié d'ici** : le clic lui-même dans claude.ai (le téléchargement depuis le stockage de la page, et la confirmation d'enregistrement), qui ne se joue que dans le lecteur.

## A20, prompt F : le retour du brief 09 recopié, comparé, ses décisions posées (2026-10-03, #309)

**La demande** : recopier le retour dans `design/ds-extension-09-return/` comme pour le 07, le comparer au brief, poser en section C les décisions qu'il demande, avec une reco ; ne rien porter avant qu'Antoine ait tranché.

**La copie** : 106 fichiers, lus par `DesignSync` puis écrits par un script depuis les réponses brutes de `get_file` gardées dans la transcription (une réponse trop longue pour l'écran, `system-snapshot.css`, est lue dans son fichier de résultat). Les 104 U+202F et 2 U+00A0 sont intacts. Trois fichiers de la planche ramenaient les trois lignes que CodeQL avait relevées au retour 07 (`r07/EngineLanding.js`, `make-copy.mjs`, et `board.js`, que CodeQL a relevé sur la PR : sa garde `SCREENS.some(…)` rendait la chaîne de l'adresse) : corrigées de la même façon, dit dans `COPIE.md`.

**Ce qui a été vérifié** :
- `COPY.md` régénéré par `make-copy.mjs` : identique à l'octet ;
- la planche rejouée dans Chromium, sur une copie hors du dépôt, avec les polices de `.design-sync/fonts/` : 210 états (35 écrans, deux langues, 1 280, 390 et 320 px), zéro erreur, zéro défilement, zéro cible sous 44 px, et `measures.js` retrouvé au pixel ;
- sa réplique du modèle (`board/money.js`) contre `lib/engine/money.ts` sur le SaaS du film : le MRR dans 12 mois, le LTV, le CAC, le payback, la durée de vie, les mois après, la dépense et la trésorerie immobilisée tombent juste, aujourd'hui, avec les trois leviers et avec chacun seul ;
- quatre écrans regardés en capture (l'argent du film, sa slide d'unit economics, la carte, l'hybride).

**Les écarts trouvés** :
- le tableau « sain » est un moteur inventé, pas l'exemple : l'exemple, avec une marge estimée de 70 à 80 %, donne un payback de 5 à 6 mois et un LTV:CAC de 6 à 7 (un test jetable, retiré), donc jamais l'alerte à 9 mois ;
- son « avant » est redessiné, plus court que le produit (3 151 px contre 3 438 à 1 280 en français) : seuls ses écarts servent ;
- son assisté a son propre modèle simplifié ; le produit garde le sien ;
- il écrit « runway » en français, là où la fiche `cac-payback` dit « ta trésorerie ».

**Les décisions** : C46 à C52 gagnent chacune une ligne « Le retour » (il suit les recos de C47, C48, C51 et C52, et dessine l'option 1 de C49) ; trois sont neuves. C53 : les chiffres des titres de slides à l'encre, le rouge gardé au verdict et au diagnostic, comme Antoine l'a tranché au nº9 (d-verdict-red). C54 : le tableau réordonné, avec l'argent après le diagnostic, « Et si » remonté et le panneau en tableaux. C55 : un bon à tirer nº10 plutôt qu'ajouter au nº9, déjà en cours de lecture (ses six décisions sont tranchées). Le découpage d'A20.d est revu sur les composants du retour ; D16 est retirée (faite) ; B14 attend la re-synchro d'A20.f.

## A20.d T1 : C45 à C55 tranchées, le constat de perte et l'alerte de payback dans le modèle (2026-10-03, #310)

**Les décisions** : Antoine a pris toutes les recos de C45 à C55, avec deux précisions à C49. Le mot sera « runway », avec un « ? » qui dit « tes mois de trésorerie ». Et sans runway saisi, **un CAC payback de 30 mois ou plus alerte quand même** : un plancher du produit, pas un repère publié (ceux-là sont 12 et 18-24 mois), donc C1 tient. Les réponses d'A20 sont dans `docs/engine/argent.md` §20.13, celle des films dans `marketing/motion/README.md`, l'index dans `docs/decisions.md`. La section C de `CHANTIERS.md` est vide.

**Ce qui est codé, sans écran** :
- `findings()` dit la perte : `unit-econ-loss` au rang 1 quand elle est certaine, `unit-econ-loss-maybe` au rang 2 quand les fourchettes se chevauchent, sur le LTV et le CAC d'aujourd'hui de chaque motion. Le CAC s'imprime tel que saisi, le LTV et l'écart en estimations ; la phrase est celle du retour, « à relire » ;
- `money.ts` porte la règle : `paybackLimit(runwayMonths)` puis `paybackWarning(payback, loss, limit)`. Au-delà du runway (strictement), ou dès 30 mois sans runway, « peut-être » quand la fourchette chevauche la limite, jamais avec une perte certaine. `MoneyKpis.warning` la calcule par motion, aujourd'hui et projetée ;
- `setup.runwayMonths`, facultatif, de 0 exclu à 240 mois, validé à l'import. Un champ v3 de plus, absent = comme avant.

**Les goldens** tiennent : aucun cas n'a de perte, donc aucun constat neuf, et la projection retire le champ `warning` (neuf champs par côté au lieu de huit).

**Non-vacuité**, sept sabotages, chacun prouvé appliqué, chacun rougit son test :
- le plancher compté au-delà de 30 au lieu de 30 compris ;
- le runway compté dès l'égalité ;
- l'alerte laissée parler sur une perte certaine (deux tests) ;
- la perte certaine au rang 2 ;
- un constat sur un verdict « aucun » ;
- 0 mois de runway accepté ;
- le plafond de 240 retiré.

**Le journal est archivé** une fois de plus : les 24 entrées du 2026-10-02 sont parties telles quelles dans `docs/journal/11-moteur-simplifie-en-tete-compact.md`. Le bloc a été vérifié identique, et ce fichier repart à environ 78 000 caractères.

## A20.d T2 : l'argent sur le tableau, après le diagnostic (2026-10-03, #311)

**Ce qui se voit** (drapeau fermé) : sous le diagnostic de chaque motion, avant le peloton (C54), un bloc plat « L'argent · <mois> » en trois temps, tel que le retour 09 le dessine. Le MRR et son ARR (« le MRR × 12 », dit dans le libellé), sauf dans l'hybride, dont la bande des totaux portera la somme (T3). « Ce que vaut un nouveau client » : la phrase du constat d'abord, puis les barres (coûte, rapporte, l'écart mesuré et nommé), puis les mois (un client reste ~17 mois, le rembourser en prendrait 21 : il part avant). « Trésorerie » : la dépense d'acquisition du mois, ce qu'elle immobilise, si elle revient et quand, l'emplacement de l'alerte, et ce que le chiffre suppose.

**Les règles tenues, testées plutôt que regardées** (`_engine/money-view.ts`, pur) :
- chaque chiffre est celui d'aujourd'hui, lu dans le scénario du panneau sans levier bougé (`scenarioFor`, `slgScenarioFor`) : le bloc, la carte et les slides ne peuvent pas se contredire ;
- la perte se dit une fois, en argent, avec la phrase du constat de T1 (`findingText`) : une seule source pour le tableau, les slides et un export. Son étiquette est à l'encre (le ton `ink` de `Tag`), son « peut-être » en pointillé, **jamais en rouge** (S-5, C48) ; ses mois sont son chiffre, pas une seconde nouvelle ;
- un inconnu est « ? », dit ce qui manque, jamais 0, et rien ne se calcule sur le chiffre d'affaires : l'exemple du §6.0, sans marge, montre la case hachurée et pourquoi (C50 changera sa marge en T6) ;
- un fait (le MRR, un CAC saisi, la dépense du mois) s'imprime à l'unité ; une estimation ou une projection à deux chiffres significatifs, avec « ~ » ;
- l'alerte vient de `paybackWarning` (T1) : jamais avec une perte certaine. Le film ne l'affiche donc pas ; elle se voit dès qu'un payback dépasse le runway ou 30 mois, et sa saisie arrive en T5.

**Les composants** : `MoneyBlock`, `WorthBars` et `CashWarning` dans `src/components/engine/`, sur les jetons `tokens/money.css`. Leurs variantes de slide et les tailles de slide du retour (`--money-slide-*`) ne sont pas portées : le retour dessinait ses slides à 960 × 540, le deck les dessine à 1 920 × 1 080 avec sa propre échelle, que T4 lira. Les jetons de la courbe et de la somme attendent T3 dans `dead-tokens.test.ts`. Deux termes neufs, avec leur « ? » : « immobilisé » (`cashTied`) et « après le payback » (`afterPayback`).

**La copie** : la section `money` d'`engine-copy.ts` (36 chaînes par langue) et les deux termes, reprises du retour, toutes « à relire » ; elles iront au bon à tirer nº10 (A20.e, C55). Le relecteur de copie y a trouvé quatre écarts, corrigés avant la PR : l'espace insécable de « 100 % » (que la garde typographique ne regarde pas) et entre un nombre et « mois », les 30 mois du plancher lus dans `{n}` plutôt qu'écrits en dur, l'anglais de « trésorerie immobilisée » rendu au retour (« la moitié de la dépense d'un payback », pas d'un mois, et le français précisé dans ce sens), et deux tournures ambiguës (« le compte s'arrête à 36 mois » dans la vente assistée, « pour le comparer à ta trésorerie » dont l'antécédent était le runway).

**Vérifié** : en FR et en EN, à 1 280 et 390 px, sur le SaaS du film (la perte) et sur l'exemple (la marge qui manque), captures regardées et e2e (`e2e/engine-money.spec.ts`) : l'étiquette a le fond de `--ink-0`, pas d'alerte avec la perte, le bloc au-dessus du peloton, aucun défilement horizontal ; l'assisté a son bloc, l'hybride celui du moteur affiché, sans MRR ni ARR propres. **Non-vacuité**, quatre sabotages, chacun rougit son test : l'étiquette de la perte passée en `alert`, la case inconnue qui affiche 0, la dépense du mois imprimée en estimation, les mois de la perte dits avec la phrase du « peut-être ».

## A20.d T3.a : la carte « Et si » remontée sous l'argent, avec la courbe du MRR (2026-10-03, #312)

**T3 est coupé en deux PR** : la carte d'abord (celle-ci), le panneau en tableaux, `LeverSum` et les totaux de `TotalBand` ensuite (T3.b).

**Ce qui se voit** (drapeau fermé) : le tableau suit l'ordre de C54, le diagnostic, l'argent, puis la carte « Et si ? » et son panneau toujours plié (C51), puis le peloton et la liste. On bouge un levier et l'ARR bouge juste sous l'argent. La carte porte :
- **la courbe du MRR** mois par mois (`MrrCurve`, nouveau), au rythme d'aujourd'hui en encre d'axe, avec les « Et si » en pleine encre, l'écart entre les deux lavé, une fourchette hachurée, jamais de rouge ;
- **le MRR et l'ARR dans 12 mois**. L'ARR remplace les nouveaux payants du mois, qui restent dans le funnel du panneau ; leurs deux chaînes sont retirées ;
- **une ligne sur un nouveau client**, quand le tableau dit une perte certaine et qu'un « Et si » a bougé : plus de perte (la phrase du retour, « ~2 300 € pour 1 900 € : ~350 € de plus » sur le film), plus de perte certaine, une perte réduite (« de ~210 € au lieu de ~400 € »), ou toujours la même, parce que les leviers bougés ne changent ni le LTV ni le CAC (l'expansion). Trois de ces phrases ne sont pas dans le retour : elles sont écrites ici, « à relire » ;
- **en vente assistée**, pourquoi sa ligne est droite. Le relecteur a vu que, sans durée de contrat connue, la phrase affirmait des contrats annuels : une variante dit maintenant que le calcul les suppose ;
- **dans l'hybride**, une fois un levier bougé, le MRR des deux moteurs dans 12 mois, une somme.

**La courbe se dessine à la largeur réelle de sa colonne** (mesurée, `ResizeObserver`), pas dans un `viewBox` étiré comme `Sparkline` : ses deux lignes sont nommées au bout en texte SVG, qu'un étirement grossirait. Sous 520 px, les noms passent en légende sous le tracé. Sa géométrie est pure et testée (`src/lib/viz/mrr-curve.ts`) ; une largeur fixe la dessinera sur les slides (T4). Les jetons de la courbe sortent de la liste d'attente de `dead-tokens.test.ts`.

**La vue est pure** (`money-view.ts#leverMoneyView`) : le même scénario que le panneau, avec les mêmes cibles. Le total de l'hybride lit ces cibles, pas `state.whatIf` à part. Une paire « aujourd'hui → avec les Et si » gagne un chiffre seulement quand deux chiffres imprimeraient la même chose.

**Vérifié** : en FR et en EN, à 1 280 et 390 px, captures regardées (le film intact et avec ses trois « Et si », l'assisté et sa bande hachurée). L'e2e (`engine-lever.spec.ts`) vérifie, dans les quatre combinaisons, l'argent au-dessus de la carte et la carte au-dessus du peloton, la courbe à la largeur de sa colonne et en légende à 390 px, la perte qui disparaît avec un churn à 4 %, et l'absence de défilement horizontal ; l'hybride a aussi son total. Les 304 specs du moteur et d'accessibilité passent en local. **Non-vacuité**, cinq sabotages, chacun rougit son test : la ligne du client sans perte certaine aujourd'hui, le CAC toujours imprimé en estimation, « tes Et si » à la place de « ce levier », les noms des lignes jamais écartés, le total de l'hybride affiché sans levier bougé.

**Pour le bon à tirer nº10** (le relecteur de copie) : « ne change ni ce que rapporte un client » est vrai dans le calcul, où le LTV ignore l'expansion, pas dans la réalité. Antoine voudra peut-être « dans le calcul ».

## A20.d T3.b : le panneau « Et si » en trois tableaux, l'effet composé dessiné, les totaux de la bande hybride (2026-10-03, #313)

**Ce qui se voit** (drapeau fermé), une fois le panneau ouvert :
- **les sept tuiles deviennent trois tableaux** (`WhatIfFigures`, nouveau) : Croissance (nouveau MRR, NRR, GRR ; l'assisté met ses nouveaux clients du trimestre à la place de la GRR), Un nouveau client (CAC, LTV, LTV:CAC, par nouveau client, CAC payback, mois après remboursement), Trésorerie (la dépense du mois, la trésorerie immobilisée). Chaque tableau montre aujourd'hui, avec les « Et si » et l'écart. Le MRR et l'ARR dans 12 mois n'y sont pas répétés : la carte, juste au-dessus, les porte. Sur le film avec ses trois « Et si » : CAC « −480 € · mieux », par nouveau client « il manque ~400 € » puis « ~830 € de plus », « part avant » puis « ~9 mois », la dépense « stable », la trésorerie « −250 000 € · mieux » ;
- **l'effet composé dessiné** (`LeverSum`, nouveau), avec les chiffres du retour : chaque levier seul (+18 000 €, +13 000 €, +6 400 €), « Chacun seul, additionnés » ~38 000 €, « Ensemble » +42 000 €, le crochet sur l'écart et sa phrase (« ~4 400 € de plus… C'est l'effet composé ») ;
- **les règles de l'argent** rejoignent « Ce que le calcul suppose », quand le tableau imprime le LTV et la trésorerie (la variante de l'assisté est écrite ici) ;
- **la bande hybride gagne sa ligne des totaux** : l'ARR total, le MRR dans 12 mois au rythme actuel, la trésorerie immobilisée totale. Un terme dont une part manque disparaît, parce qu'un total partiel n'est pas un total. Sur téléphone, les deux moteurs côte à côte au-dessus de leur total, et les totaux deux par deux. La ligne « MRR total dans 12 mois » quitte le panneau : la carte dit ce total avec les « Et si » (T3.a), la bande le dit sans.

**Trois écarts au retour, voulus** :
- **l'écart garde son sens en mots** (« · mieux », « · moins bien »), en encre grasse comme les tuiles depuis la décision d'Antoine du 2026-09-28 ; le retour ne mettait que le signe ;
- **les tableaux sont dessinés par `WhatIfFigures`**, pas par `DataTable`, dont une cellule ne prend que du texte : sur une colonne étroite (une requête de conteneur, pas les 760 px de l'écran), « aujourd'hui » se replie en seconde ligne de la cellule « avec tes Et si ». Les colonnes sont fixes, les mêmes dans les trois tableaux, pour s'aligner sur toute la hauteur ;
- **`LeverSum` passe sous les deux colonnes**, pas dans celle des chiffres. Le retour l'y dessinait sans la colonne collante ; ici il l'aurait rendue plus haute que l'écran. Même ainsi, les trois tableaux font ~650 px : à 1 280 × 800, quand on bouge le dernier levier, le haut (« Croissance ») sort de l'écran, et la colonne reste collée à la fin des leviers avec « Un nouveau client » visible. L'e2e est réécrit pour dire ce qui tient, et le dit dans son en-tête.

**La copie** : 24 chaînes neuves, « à relire ». `aloneLever`, `aloneGain`, `totalIn12` et `totalIn12Row` sont retirées. `together` et `togetherNoExtra` restent pour les slides jusqu'à T4. Le relecteur de copie a demandé un marqueur propre aux deux règles de l'assisté (absentes du retour), « la NRR sur 12 mois » comme ailleurs, et le ménage de trois commentaires orphelins ; c'est fait. Pour le bon à tirer nº10, il relève quatre écarts au retour : « unchanged » en anglais (le retour disait « stable »), « Total cash tied up » (aligné sur « Total MRR »), les deux règles de l'assisté, et « chacun seul, additionnés », qui accorde un singulier avec un pluriel.

**Vérifié** : en FR et en EN, à 1 280 et 390 px, captures regardées (les tableaux, le repli d'« aujourd'hui », `LeverSum`, la bande et ses totaux à 390). L'e2e `engine-whatif.spec.ts` couvre les quatre combinaisons ; celles du moteur sont adaptées (les lignes des tableaux à la place des tuiles, la bande à deux listes et sa disposition sur téléphone, le total sur la carte) ; 308 specs du moteur et d'accessibilité passent en local. La garde « pas de rouge » (`whatif-no-red.test.ts`) lit maintenant aussi les feuilles de la courbe, des tableaux, de `LeverSum`, des barres et de la carte, et suit un jeton rouge à travers `engine.css` et `money.css` (seul `--money-warning-edge` l'est, l'alerte). Le build a attrapé un sélecteur `..list` laissé par une substitution, que les tests ne lisaient pas. **Non-vacuité**, cinq sabotages, chacun rougit son test : l'écart sans « stable », le crochet toujours dessiné, le « ? » sans ce qui manque, la règle de trésorerie toujours imprimée, l'écart peint en rouge.

## A20.d T4.a : les chiffres des titres à l'encre, le rouge gardé au verdict et au diagnostic (C53, 2026-10-03, #314)

**T4 est coupé en trois PR** : les titres d'abord (celle-ci), puis les slides « Et si » avec leur courbe (T4.b), puis l'unit economics, `PaybackChart` et la perte en titre, en nº 2 (T4.c).

**La règle** (`src/lib/engine/title-accent.ts`) : C53 dit « à l'encre grasse dans tout le deck ; le rouge reste au verdict et au diagnostic ». La carte d-verdict-red du nº 9, relue dans sa base, dit lesquels : « le verdict dit ce qu'on ne voit pas, le diagnostic dit ce qui freine parmi ce qu'on voit ». Seize titres gardent donc leur rouge :
- le verdict : le trou du funnel, sa rupture, le funnel qu'on ne sait pas suivre (libre-service et assisté), les deux moteurs qu'on ne sait pas encore additionner ;
- le diagnostic : l'étape qui freine sans montant, les étapes en retard ensemble, l'étape sous sa cible sans rien à comparer, et « rien ne freine ».

Tout autre accent passe à l'encre, sans couleur, au poids du titre (déjà 700) : les payants du funnel, le montant d'une fuite chiffrée (une projection), le gain des « Et si », l'unit economics, le total, la demande, le miroir, la visibilité, « ce qui a bougé ». La même règle sert la slide (`SlideFrame`), le verdict du tableau (`Verdict`, qui reprend le titre de la première slide) et l'aperçu de la demande. Le copier-coller en Markdown garde ses `**` : c'est l'accent du texte, pas sa couleur.

**Vérifié** : trois tests unitaires (les seize, chacun a bien un accent dans les deux langues, les titres chiffrés à l'encre), deux sabotages qui rougissent chacun leur test (un titre « Et si » rendu rouge, un verdict retiré de la liste) ; en e2e, les titres des « Et si », de « tous ensemble » et de la visibilité n'ont plus d'accent rouge, et la première slide de l'exemple, qui dit ce qu'on ne voit pas, garde le sien. 119 specs du deck, du tableau et d'accessibilité passent en local.

## A20.d T4.b : les slides « Et si » avec leur courbe, l'effet composé dessiné (2026-10-03, #315)

**Ce qui se voit** (drapeau fermé), sur chaque slide d'un levier et sur « tous ensemble », en libre-service comme en assisté :
- **la courbe du MRR** mois par mois, au rythme d'aujourd'hui contre cet « Et si » (ou « les 3 « Et si » »). Elle est dessinée par `MrrCurve` à l'échelle du deck (`medium="slide"`, 18 px et plus sur la toile de 1 920 px), sa légende sous le tracé pour lui laisser la largeur. Le modèle la porte (`DeckSlide.curve`, `slideCurve`) : un dessin, pas une ligne de texte ;
- **un seul tableau** à droite, celui du retour : MRR et ARR dans 12 mois, NRR, CAC, LTV, LTV:CAC, CAC payback, trésorerie immobilisée. Le nouveau MRR du mois et la GRR quittent la slide (le panneau les garde). L'assisté imprime les mêmes lignes, sa NRR sur douze mois ;
- **le funnel du mois** ne liste plus que les étapes que le levier bouge, sous la courbe et dans sa carte. Un levier qui le laisse tel quel le dit en une ligne (« Ce levier laisse le funnel du mois tel quel. », et le trimestre pour l'assisté) : une ligne de « stable » ne dit rien. L'export texte garde toutes les étapes ;
- **« tous ensemble » dessine ses leviers** (`LeverSum`, `medium="slide"`) sous la courbe : chacun seul, additionnés, ensemble, le crochet. Sur le film : +18 000 €, +13 000 €, +6 400 €, ~38 000 €, +42 000 €. La phrase de l'effet composé reste celle du deck (`scenario.together`).

**La place, mesurée** : le corps d'une slide n'a que 460 à 525 px sous un titre de deux ou trois lignes. La courbe fait donc 250 px seule et 135 px partagée. Les tableaux des « Et si » passent au pas de 18 px (`--slide-table`), les cartes à 14 px de rembourrage. À partir de quatre leviers, « tous ensemble » garde sa liste resserrée, sans courbe : dessinée, elle passait sous le pied (les neuf leviers et leurs hypothèses). Le texte SVG de la police UI perdait des espaces sur la slide (« août2026 ») : il est en mono, comme l'étiquette de départ, qui s'affichait bien. Les lignes de `LeverSum` sont des sous-grilles : en `display: contents`, elles n'avaient pas de boîte, et la mesure des e2e lisait 1 623 px. Ces mesures ignorent aussi l'intérieur d'un `<svg>`, que la boîte du `<svg>` borne : hors écran, une vignette ne calcule pas ses formes.

**Les goldens** tiennent par une projection écrite (`golden-projection.ts`), sans toucher aux fichiers. Côté obtenu, elle retire ce qui est ajouté : la courbe, l'effet composé dessiné et les trois lignes neuves. Côté attendu, elle retire les deux lignes retirées et leurs lignes Markdown. Un test dit qu'il y avait bien de quoi retirer des deux côtés.

**Le nom de la variante** : `medium="slide"`, pas `size` (convention S-16, `variant-names.test.ts` l'a rappelé).

**Vérifié** : captures en haute définition regardées, en FR et en EN (le film, ses trois leviers, l'hybride, les neuf leviers et le pire cas : un titre sur trois lignes avec cinq étapes du funnel). Les 62 specs du deck passent en local, dont celles qui mesurent chaque corps au-dessus de son pied et rien sous 18 px. **Non-vacuité**, quatre sabotages, chacun rougit son test : la courbe sans sa ligne « Et si », la ligne d'ARR retirée, la somme d'un seul levier, la courbe laissée par la projection.

**La copie** : quatre chaînes neuves, « à relire » : les deux noms de la courbe (« avec cet « Et si » », « avec les {n} « Et si » ») et les deux lignes du funnel et du trimestre. Le relecteur de copie a fait préciser celle du trimestre, écrite ici : « les opportunités et les signatures du trimestre », car « le trimestre » se lisait comme son MRR, que la courbe montre bouger.

## A20.d T4.c : la slide d'unit economics avec l'argent, titrée par la perte et montée en nº 2 (C48, 2026-10-03, #316)

**Ce qui se voit** (drapeau fermé), en libre-service seul et en assisté seul (l'hybride est T4.d) :
- **six tuiles sur une ligne**, celles du retour : CAC, LTV, LTV:CAC, CAC payback, mois après remboursement, trésorerie immobilisée. Sous zéro, les mois après remboursement disent la perte en mois (« –4 mois · part ~4 mois avant d'avoir remboursé »). La trésorerie dit « ne revient pas toute » avec la perte, « un plancher · facturation mensuelle » sinon. Le LTV:CAC imprime en contexte le 3 pour 1 couramment cité, lu dans le catalogue (C1 : il situe, ne juge pas). Les chiffres passent de 64 à 34 px pour que « ~2 300 000 € » tienne dans un sixième de la slide ;
- **le graphique d'un client, mois par mois** (`PaybackChart`), qui remplace la barre de 0 à 36 mois. La ligne horizontale est ce qu'a coûté le client, la ligne montante la marge qu'il rapporte jusqu'à son départ. Le pointillé de 12 mois reste un repère. Quand le client part avant d'avoir remboursé, la ligne s'arrête court. Le crochet mesure l'écart (« il manque ~400 € ») et un fil tireté montre où il aurait remboursé. Quand il rembourse, un point marque le croisement et un crochet les mois de marge après. Sans marge, c'est la boîte « ? » sous un coût connu. Sans CAC, pas de graphique ;
- **à côté**, la GRR et la NRR sur une ligne avec leur approximation (elles étaient deux tuiles), l'alerte de payback long au « nous » d'une slide (C49), ce que suppose la trésorerie, et le plafond de 36 mois ;
- **une perte certaine titre la slide** (« Chaque nouveau client nous coûte 1 900 € et en rapporte ~1 500 € : on perd ~400 € sur chacun. »), son accent à l'encre (C53). La slide monte alors en nº 2, juste après le funnel, et la première slide ne bouge pas (`moveToSecond`). Les mêmes règles valent pour l'assisté seul.

**Une seule source** : `deck-unit.ts` lit l'argent du jour dans le même scénario que le bloc du tableau (`buildScenario`, `buildSlgScenario`, rien de bougé). Le tableau et la slide ne peuvent pas se contredire. L'histoire que raconte le graphique (perte ou remboursement) est décidée par le verdict de perte du modèle, puis passée à la géométrie. La géométrie ne la relit pas depuis les milieux, sinon le dessin et ses mots pourraient se contredire. Une perte possible se dessine par ses milieux, et ses libellés disent « peuvent se croiser ».

**La mise en page, regardée en captures** : le libellé du coût part de la gauche (dans les deux histoires, c'est là que la marge est encore au ras de l'axe), le pointillé de 12 mois part sous la ligne de coût, un crochet court finit son libellé à son bout droit. Un libellé accroché trop près de la fin du tracé bascule à gauche de son point. Un payback au-delà de 36 mois (l'assisté à 95) n'a pas de fil hors du tracé : son libellé se pose au bout droit. À la durée plafonnée, le client ne « part » pas : « compté jusqu'à 36 mois, le plafond ».

**Les goldens** tiennent par la projection : côté obtenu, elle retire le graphique, la ligne de contexte du LTV:CAC et les cinq lignes neuves ; côté attendu, les tuiles GRR et NRR et leurs lignes Markdown. Aucun moteur des goldens n'a de perte certaine, donc aucun titre ni aucun ordre ne bouge : ils restent comparés au caractère près. Un test dit qu'il y avait de quoi retirer des deux côtés.

**Vérifié** : captures en haute définition regardées en FR et en EN (la perte du film, le payback de 32 mois sans runway puis contre un runway de 24 mois, l'exemple sans marge, l'assisté à 95 mois). Quatorze specs neuves (`engine-deck-unit.spec.ts`), à 1 280 et à 390 px, dans les deux langues : la slide en nº 2, le titre sans accent rouge, six tuiles, le graphique et son histoire, le corps au-dessus du pied, rien au-delà de la marge droite, rien sous 18 px, le bord tireté de l'alerte. **Non-vacuité**, dix sabotages, chacun rougit son test : pas de montée en nº 2, pas de titre de perte, l'alerte du tableau (« tu ») sur la slide, l'alerte malgré la perte (le premier test ne la voyait pas : le payback du film est sous le plancher, il tient maintenant contre un runway de 12 mois), « part vers 36 mois » au plafond, la géométrie qui relit les milieux, le fil hors du tracé, la projection qui garde les lignes neuves ou les tuiles GRR et NRR, le LTV:CAC sans contexte.

**La copie** : trente et une chaînes neuves, « à relire » : le titre de perte, les notes des tuiles, la ligne de rétention, les quatre alertes au « nous », les quatre hypothèses de trésorerie, et les mots et les quatre résumés du graphique. Le relecteur de copie n'a rien trouvé de bloquant. Corrigé : deux insécables (« GRR ? » ne se coupe plus), la provenance dans le marqueur (la plupart de ces chaînes sont de la session, pas du retour) et l'anglais des hypothèses aligné sur le panneau (« the month's »). **Pour le bon à tirer nº10**, trois points de fond relevés par le relecteur. D'abord, l'alerte dit « nous gagnons de l'argent » même quand la perte n'est que possible (à l'écran aussi). Ensuite, les résumés disent « reste 36 mois » au plafond. Enfin, le pointillé de 12 mois sur la slide assistée vient d'un repère des petites entreprises.

## A20.d T4.d : l'unit economics de l'hybride, les deux moteurs côte à côte (C48, 2026-10-03, #317)

**Ce qui se voit** (drapeau fermé), d'après `slide-unit-both` du retour du brief 09 :
- **deux colonnes**, libre-service puis assisté, jamais additionnées ni triées (§18.6.4, C4). Chacune a son nom, ses cinq tuiles (le CAC avec sa variante, la LTV, le LTV:CAC, le payback, la trésorerie immobilisée sur deux colonnes) et son graphique en petit (`PaybackChart`, `size="sm"`) : sa ligne de mois sur l'axe (« part vers 17 mois ; rembourserait à 21 mois », « remboursé à 13 mois, puis ~23 mois de marge »), sans libellé de coût ni fin d'axe, le crochet de la perte gardé ;
- **une note sous les deux** : les clients perdus sur un an des deux côtés (« libre-service ~26 % (2,5 % par mois, composé) · assisté 12 % des contrats échus »), ce que suppose la trésorerie, le pointillé de 12 mois. Le pied reste celui du modèle : deux moteurs, le plafond, la marge globale, deux CAC qui ne comptent pas la même dépense ;
- **une perte certaine d'un côté titre la slide**, à l'encre : « Libre-service : on perd ~400 € par nouveau client. Assisté : remboursé en 13 mois. » La slide monte alors en nº 2, juste après le total. Sans perte certaine, les titres côte à côte du §18.6.4 ne changent pas.

**Ce qui part** : les cinq lignes de deux cellules (le CAC, le payback, le panier, les clients perdus en un an, le LTV:CAC) et leur copie (`unitRows`, `unitBasket*`, `unitUncomputable`). La LTV et la trésorerie prennent la place du panier. Les clients perdus sur un an passent dans la note. Le panier (ARPA, ACV) reste dans l'annexe.

**Une décision gardée contre le retour** : sa note mettait la GRR et la NRR par mois du libre-service à côté du renouvellement par an de l'assisté. C25 Q5 (2026-09-30) écarte exactement ce cas : « une seule unité par ligne », jamais un taux mensuel à côté d'un taux annuel. Le retour ne lève pas cette décision, et rien ne l'a levée depuis. La note garde donc les clients perdus sur un an des deux côtés (`lostInAYear`, `unitLost*`, sa copie d'avant). C'est le relecteur de copie qui l'a vu.

**Deux reprises, sur captures** : sans marge, la boîte « ? » redisait ce que disent déjà les tuiles, et sous un titre de trois lignes elle repoussait le corps sous le titre. Une colonne n'en dessine donc pas. La ligne des mois, centrée, touchait « 36 months » : elle part de la gauche, et la fin d'axe se tait (le plafond est au pied). Le corps est aussi resserré (le graphique à 150 px, des tuiles plus basses) : il dépassait de 60 px sur le pied.

**L'export** dit le manque sans « ? » nu (« Libre-service · il manque la marge brute ») : le balayage des phrases a vu l'espace devant le « ? ».

**Les goldens** : la projection retire, côté obtenu, les tuiles marquées de leur moteur, les graphiques et la note, et côté attendu, les cinq lignes et leurs lignes Markdown. Le pied, le titre et l'ordre des hybrides des goldens (aucun n'a de perte certaine) restent comparés au caractère près. Un test dit qu'il y avait de quoi retirer des deux côtés.

**Vérifié** : captures en haute définition regardées (la perte du libre-service en FR et en EN, sans marge sous un titre de trois lignes, les deux qui remboursent). Huit specs neuves dans `engine-deck-unit.spec.ts` (FR et EN, 1 280 et 390 px) : nº 2 après le total, deux colonnes de cinq tuiles, deux histoires, le corps entre le titre et le pied, rien au-delà de la marge, rien sous 18 px. Un nouvel état de test, `hybridLossState` (le libre-service du film et une marge assistée de 75 %). **Non-vacuité**, sept sabotages, chacun rougit son test : pas de montée en nº 2, pas de titre des deux côtés, les colonnes inversées, la note de plancher dans une colonne, la projection qui garde les tuiles ou l'ancien tableau, le « ? » nu dans l'export.

**La copie** : onze chaînes neuves, « à relire » : le titre des deux côtés et ses trois fragments, les trois lignes de mois, et les quatre morceaux de la note. Leur marqueur dit leur provenance (le retour, découpé, ou la session). Retouches du relecteur : « d'acquisition » rétabli dans la note ; « ce n'est donc plus un plancher » quand l'expansion peut dépasser les départs ; le côté inconnu dit ce qu'on ne peut pas dire (« on ne peut pas encore dire ce que rapporte un client ») ; le pointillé lu dans le catalogue ; « compté jusqu'à 36 mois » sur la ligne des mois aussi.

## A20.d T5 : le runway dans les Réglages, l'alerte qui s'y mesure (C49, 2026-10-03, #318)

**Ce qui se voit** (drapeau fermé) : une section « Trésorerie » dans les Réglages, avec une seule case, « Runway, en mois », facultative, de 0 exclu à 240 mois. Le mot reste « runway » ; son « ? » dit « Tes mois de trésorerie : le nombre de mois que couvre ta trésorerie au rythme actuel des dépenses… » (Antoine). Le « ? » est dans l'aide, jamais dans le `<label>`. Une fois le runway saisi, l'alerte du tableau (T2) et celle de la slide (T4.c) comparent le payback au runway (« plus que ton runway (24 mois) »). Une fois effacé, elles reprennent le plancher de 30 mois. Hors de sa plage, l'enregistrement s'arrête sur la case, avec la règle, et n'écrit rien. Le runway vaut pour l'entreprise, donc pour les deux moteurs d'un hybride.

**Un piège évité** : les Réglages reconstruisent `setup` à chaque enregistrement. Un runway non repris à cet endroit aurait été effacé par n'importe quel enregistrement, une fenêtre changée par exemple. Il est repris, et l'e2e vérifie qu'il survit à un second passage.

**Vérifié** : huit specs neuves (`engine-runway.spec.ts`, FR et EN, à 1 280 et 390 px). Elles couvrent : le plancher, puis le runway saisi, gardé, effacé, et l'état stocké à chaque fois ; le « ? » et sa définition ; 300 et 0 refusés, la case prise par le focus, rien d'écrit ; aucun défilement de côté. Captures regardées : la section, le « ? » sur téléphone, l'alerte contre le runway. **Non-vacuité** : deux sabotages dans un même build (le runway non repris à l'enregistrement, la garde de plage retirée), chacun rougit son test sur les quatre combinaisons.

**La copie** : sept chaînes neuves, « à relire ». Quatre viennent du retour du brief 09 (`settings.cash`, `settings.runway`, `settings.runwayHint` sans son « Facultatif. » que la case dit déjà, `settings.months`, ici `runwayMonths`) ; trois sont de la session (son singulier, la règle de plage, et la définition du « ? », celle du retour ouverte par « Tes mois de trésorerie »).

**Le relecteur de copie a trouvé deux défauts réels**, que T5 rend visibles. Le suffixe anglais commençait par une espace ordinaire, que la case avale (« 24months »). Le pluriel était figé (« 1 months »), dans la case comme dans les huit alertes du tableau et de la slide, où `{n}` vaut le runway saisi. La case passe donc par `wordUnit` (« 1 month », « 24 months »), et les alertes reçoivent une durée déjà formatée (« 24 mois », « 1 month ») au lieu d'un nombre suivi de « mois » écrit en dur. Le texte du plancher reste identique (« 30 mois »).

## A20.d T6 : l'exemple a sa marge (C50), la promesse nomme le board (C52) (2026-10-03, #319)

**Ce qui se voit** (drapeau fermé) : l'exemple intégré (§6.0) a une marge brute **estimée, 70 à 80 %** (« ancien chiffre »). Son argent apparaît donc partout, en fourchettes : LTV ~3 000 à 3 500 €, payback 5 à 6 mois, LTV:CAC 6 à 6,9, ~30 à 31 mois de marge après le remboursement, trésorerie immobilisée ~55 000 à 63 000 € (un plancher). Ni perte ni alerte : l'exemple est sain, et sa slide d'unit economics reste à sa place. Dans l'hybride de l'exemple, la colonne du libre-service a son image, l'assisté dit ce qui lui manque (le titre `unitEconomicsOneSidePlg`). La promesse de la page (C52) dit maintenant « … vois où ton moteur perd du monde et ce que te rapporte chaque nouveau client, et repars avec des slides pour ton CODIR, ton board ou tes investisseurs ».

**Ce qui reste testé sans marge** : deux états, `noMarginState()` et `hybridNoMarginState()` (`__tests__/fixtures.ts`), l'exemple tel qu'il était. Chaque test dont le sujet est l'absence de marge (le « ? » qui dit ce qui manque, jamais de LTV sur le revenu, le titre « aucune des deux marges », le point aveugle du pont avec le Tour, l'annonce des chiffres qui ne lit pas une LTV inconnue) y passe ; ceux qui décrivent l'exemple (ses comptes, sa couverture, ses marques dans la liste) prennent ses nouveaux chiffres : un approximatif de plus, un introuvable de moins.

**Trois défauts que l'exemple a révélés**, tous trois corrigés ici :
- **La slide « Ensemble », neuf leviers bougés** : avec l'argent connu, son tableau compte huit lignes, et trois libellés (« MRR dans 12 mois », « ARR dans 12 mois », « Trésorerie immobilisée ») passaient sur deux lignes. Résultat : 41 px sous le pied, en français. Le défaut existait pour tout état avec une marge, mais aucune spec ne le couvrait. En mode dense, la grille passe à 1 : 1,4 et les cellules se resserrent (`padding: 3px 0 3px 10px`). Les libellés peuvent toujours passer à la ligne, sans jamais sortir de la carte. Mesuré par injection de CSS avant de reconstruire, six variantes comparées : celle-ci laisse 21 px au-dessus du pied en français, et chaque levier tient sur une ligne. La variante qui interdisait la coupure des libellés tenait aussi, mais elle aurait fait déborder la carte dès qu'un montant s'allonge.
- **Les fourchettes dans les six tuiles** : « ~3 000 € à 3 500 € » et « ~55 000 € à 63 000 € » sortaient de leur tuile, la seconde jusque hors de la slide. T4.c n'avait été vu qu'avec des valeurs simples, celles du film. Une valeur peut maintenant passer à la ligne autour du « à » (ou après le tiret demi-cadratin), jamais au milieu d'un montant, dont les espaces sont insécables. L'écart entre les tuiles et l'image passe de 40 à 24 px : la rangée plus haute laissait sinon le corps 3 px sous le pied.
- **L'étiquette du croisement dans l'image** : avec un remboursement à 5 à 6 mois, « remboursé : 5 à 6 mois », alignée à droite contre le croisement, partait hors de la slide et passait sur « ce que coûte un nouveau client ». Une règle pure et testée, `paysBackLabels` (`lib/viz/payback-chart.ts`), décide maintenant. Quand l'étiquette ne tient pas à gauche sans heurter celle du coût, le croisement n'a plus d'étiquette propre, et la ligne sous le crochet dit les deux (« remboursé à 5 à 6 mois, puis ~30 à 31 mois de marge »), comme le fait déjà l'image compacte, à droite du croisement. Un remboursement tardif garde ses deux étiquettes.

**La mesure qui ne voyait rien** : la spec de l'unit economics mesurait des boîtes, et la boîte d'une tuile restait en place pendant que son texte en sortait. Elle mesure maintenant le texte lui-même (un `Range` par tuile), la gauche des étiquettes de l'image, et leurs chevauchements deux à deux. Ces trois contrôles s'appliquent aux cinq tests qui mesurent la slide.

**Vérifié** :
- 3 212 tests unitaires (13 rougissent si l'exemple perd sa marge) ;
- `paysBackLabels` : quatre tests ; le sabotage « toujours une étiquette au croisement » en rougit deux, « jamais » en rougit un ;
- les 336 specs du moteur, puis, après les corrections, les 104 du deck, de l'argent et de la liste, toutes vertes ; « every lever moved » rougissait sur l'ancien CSS (41 px) ;
- deux specs neuves, l'exemple seul et l'exemple hybride, dans `engine-deck-unit.spec.ts`, en FR et en EN, à 1 280 et 390 px ;
- captures regardées, en FR et en EN, à 1 280 et 390 px : la promesse, le bloc d'argent de l'exemple (rien ne dépasse, mesuré à 0 px), la slide de l'exemple, celle de l'hybride, la slide « Ensemble » dense ;
- `tsc` et `eslint` propres.

**La copie** : une chaîne réécrite, `page.promise`, « à relire », pour le bon à tirer nº10 (C55, la carte de la promesse du nº9 y passe). « prêtes » / « ready » y sont retirés, comme dans le retour. Le relecteur de copie n'a trouvé aucun défaut. Deux points sont signalés pour le bon à tirer : la meta description et la bande de l'accueil disent encore « des slides pour ton CODIR » seul.

## A20.d T7 : la densité avant contre après, mesurée par le même script (2026-10-03, #320)

**La méthode** : `scripts/engine-density.capture.ts`, tests « brief 09 », sur le SaaS du film, sur un build local où le moteur est ouvert. L'**avant** est le code juste après T1 (`b95c7c2`, #310), construit et mesuré par le même script : ses chiffres retombent au pixel sur ceux du brief 09 (3 438 px, 26 contrôles, levier à 3 237 px à 1 280 en français). L'**après** est la branche de T7. Le **retour** est `design/ds-extension-09-return/board/measures.js`, sa propre planche avant et après : son « avant » est redessiné, plus court que le produit, donc seuls ses écarts se comparent.

| Mesure (FR · 1 280) | Avant | Après | Écart | Écart du retour |
|---|---|---|---|---|
| Tableau | 3 438 px | 4 295 px | +857 | +822 |
| Contrôles du tableau | 26 | 27 | +1 | +1 |
| Contrôles au premier écran | 3 | 3 | 0 | 0 |
| Haut du levier « Et si » | 3 237 px | 1 943 px | −1 294 | −1 243 |
| Carte du levier | 262 px | 480 px | +218 | +218 |
| Panneau « Et si » ouvert | 1 774 px · 9 contrôles | 1 774 px · 9 | 0 | 0 |

En anglais à 1 280 : tableau 3 372 → 4 212 (+840, le retour +828). À 390 : tableau 4 077 → 5 032 en français (+955, le retour +934), 4 102 → 5 039 en anglais. Le levier passe de 3 760 à 2 074 px en français. Le premier écran garde ses trois contrôles partout.

**Un écart avec le retour, à 390 seulement** : le panneau « Et si » ouvert passe de 2 485 à 2 775 px en français (+290, +12 %) et de 2 450 à 2 757 en anglais, là où le retour le raccourcissait de 60 px. Mis côte à côte, l'espacement du portage est même plus serré (les leviers). Mais ses trois tableaux (croissance, un nouveau client, trésorerie) portent huit lignes d'argent de plus que les six tuiles d'avant : le LTV:CAC, ce que rapporte un nouveau client, le payback, les mois après le remboursement, la dépense du mois, la trésorerie immobilisée. C'est le contenu qui grandit, à 1 280 les tableaux tiennent côte à côte et le panneau garde sa hauteur. Rien à reprendre sans décision ; noté pour la re-synchro (A20.f).

**Les captures** : 27 dans `design/ds-extension-09-after/`, numérotées comme celles du brief (`design/ds-extension-09/`). Deux changements, pour qu'un écran montre encore ce qu'il montrait : la 10 (« l'exemple sans marge ») part de `noMarginState()`, l'exemple ayant maintenant sa marge ; trois écrans sont neufs, l'argent de l'exemple (13), sa slide (14), et la slide « Ensemble », neuf leviers bougés (15), en FR sur bureau et en EN sur téléphone. Regardées : le tableau avant contre après (l'ordre de C54 : diagnostic, argent, carte « Et si », puis le peloton), le panneau à 390 avant contre après, et les écrans neufs, déjà vus pendant T6.

**Un piège de mesure** : `pkill -f "next start"` lancé depuis le shell de l'outil tue ce shell lui-même, dont la ligne de commande contient le motif. Le serveur, lui, s'appelle `next-server` et survit : le build suivant est alors servi par l'ancien processus, sans hydratation (`data-state="ssr"`). Arrêter le serveur par son PID (`ps aux | grep next-serve[r]`).

**Consigné** : `CLAUDE.md` (3 212 tests unitaires, 982 specs Playwright, A20.d fait) ; `CHANTIERS.md` (A20.d livré, A20.e à faire) ; le script de densité (son en-tête, les trois écrans neufs).

## A20.e : le bon à tirer nº10, l'argent du moteur (C55, 2026-10-03, #320)

**Le document** : le [nº10](https://claude.ai/artifact/EcXYgaHaXXtAE3vqnkpbAd), 22 cartes, 136 chaînes, 1 755 mots en français. Il prend tout ce que le portage A20 a écrit ou réécrit, de T1 à T6, et rien d'autre : le nº9 reste ouvert pour le reste du moteur. Trois décisions en tête : la promesse et le reste du site (la description et la bande de l'accueil disent encore « CODIR » seul) ; la note de l'hybride, qui garde « clients perdus sur un an » (C25 Q5) contre la proposition du retour, citée sur la carte ; l'alerte de payback long, qui dit « tu gagnes de l'argent » même quand la perte est possible. Les relevés des relectures (les « reste 36 mois » au plafond, le pointillé à 12 mois de l'assisté, l'unité deux fois dans la case du runway) sont dans le paragraphe gris de leur carte.

**La méthode** (`/bon-a-tirer`, suivie sans être appelée : Antoine a demandé le nº10 au prompt F et à C55) : l'inventaire vient d'une comparaison, jamais de la mémoire. Une sonde jetable importe l'objet `ENGINE_COPY` d'avant A20.d (`f712a46`) et celui d'aujourd'hui, et compare chaque feuille `{fr, en}`. Elle trouve 135 chaînes neuves, une changée (la promesse) et 14 retirées. Le grep des marqueurs datés A20 tombe sur les mêmes blocs. Le constructeur refuse une chaîne sur deux cartes, une chaîne sur aucune carte et un id en double. La page reprend le gabarit du nº9 (lu par l'outil, son moteur de rendu intact), et seuls changent le payload, le bandeau et le titre. La sonde et la copie d'avant sont supprimées ensuite.

**Le nº9 bouge sur deux points**, dits dans le bandeau du nº10 : sa carte du haut de page garde ses autres chaînes, mais la promesse se tranche au nº10 ; et ses cartes sur les 14 chaînes retirées par A20 (`slide.unitRows.*`, `unitBasket*`, `unitUncomputable`, `scenario.aloneLever`, `aloneGain`, `totalIn12*`, `lever.payingMonth`, `payingPerHundred`) ne correspondent plus à rien.

**Vérifié** : le rendu dans Chromium à 1 280 et 390 px (22 cartes, 140 blocs, `scrollWidth === clientWidth` aux deux largeurs, aucune erreur), puis la base des décisions lue une fois après publication (`cards/`, vide).

## A20.g : les films remis d'accord avec le moteur porté (2026-10-03, #321)

**Ce qui change** (`marketing/motion/`, rien sous `src/`) : le film « Le moteur » et la partie moteur du film d'ensemble partagent leurs dessins, et les deux reprennent maintenant les écrans du moteur porté.
- **L'argent** (`moneyCard`, à la place de l'ancien `ueCard`) : le bloc du tableau tel quel, MRR et ARR, ce que vaut un nouveau client avec l'étiquette « Perte » à l'encre, les deux barres et le crochet de ce qui manque, les mois, puis la trésorerie (93 480 € dépensés, ~990 000 € immobilisés, « et elle ne revient pas toute »). Le hachuré rouge et le tampon rouge « −400 € » disparaissent (C48). Dans le film d'ensemble, la carte réduite ne garde que la valeur d'un client, et son minutage est accéléré (`o.sp`) pour tenir dans ses deux secondes à l'écran.
- **« Et si ? »** : les barres rouges du MRR deviennent la courbe du moteur (le rythme d'aujourd'hui en gris, la courbe avec les « Et si » à l'encre, la bande entre les deux remplie), qui monte d'un cran à chaque levier. Le MRR et l'ARR dans 12 mois sont arrondis comme le moteur arrondit une projection (un format `aeur`, à deux chiffres significatifs) : ~80 000 € → ~94 000 € → ~100 000 € → ~120 000 €, et ~960 000 € → ~1 500 000 €. Le chiffre d'aujourd'hui est rappelé dessous. Les pastilles rouges et vertes du LTV:CAC et du payback cèdent la place à la ligne du client que la carte du moteur affiche (« plus de perte. Il rapporte ~2 300 € pour ~1 400 € : ~830 € de plus »). Le grand ARR final est à l'encre, avec un tampon à l'encre « +510 000 € » (S-5).
- **Les slides** : le kicker du deck, « Chiffres d'exemple » dans le coin, le verdict du moteur pour ce SaaS (sa clause rouge, la seule rouge), l'unit economics titrée par la perte avec ses six tuiles, et « Et si » avec sa courbe et le titre du moteur.
- « Chiffres d'exemple » est visible dès le premier plan du film du moteur (il n'apparaissait qu'à 4,2 s), et sur la partie moteur du film d'ensemble.

**D'où viennent les mots et les chiffres** : du moteur lui-même. Deux sondes jetables ont lancé ses vues sur `filmState()` : `moneyView`, `leverMoneyView` à chaque étape des leviers, `kpiRows`, et `buildDeck` avec trois leviers et avec un seul. Leur sortie, en français et en anglais, est recopiée dans l'objet `C` avec `p: 1`. Les sondes sont ensuite supprimées.

**L'alerte de trésorerie (C49) n'est pas dans le film, et c'est voulu** : ce SaaS perd de l'argent sur chaque client, et le moteur n'affiche alors pas l'alerte de payback long (la perte parle seule). Avec les trois leviers, le payback tombe à 16 mois, sous le plancher de 30. Le film montre donc ce que le moteur affiche à la place : la trésorerie immobilisée qui ne revient pas toute. Le README le dit.

**Deux pièges** :
- un assistant de style (`eyebrow()`) qui finissait sans point-virgule collait la déclaration d'animation suivante à la sienne et la rendait invalide : les étiquettes des étapes intermédiaires de la courbe ne s'effaçaient jamais. Vu sur une image, puis lu dans le style calculé. L'assistant ajoute maintenant le point-virgule.
- en remplaçant d'un bloc la section des dessins, `numbersCard`, qui s'y trouvait aussi, était parti ; le film d'ensemble ne se construisait plus (`ReferenceError`). Il est rétabli depuis git, tel quel.

**Vérifié** : des images clés de chaque scène touchée, regardées en 16:9, 4:5 et 9:16, en français et en anglais (le bloc d'argent, la courbe à chaque étape, le grand ARR, les trois slides, l'éventail, la partie moteur du film d'ensemble), puis les douze MP4 des deux films réexportés (durée, format, et une image tirée de deux d'entre eux). La page publiée était identique à la source du dépôt avant d'être republiée. Les douze MP4 sont envoyés dans sa réserve, `DL_FILES` pointe sur leurs nouveaux identifiants, et la page est republiée à la même adresse (version 10) ; les anciens fichiers des deux films restent dans la réserve, plus référencés.

## A20.e : le bon à tirer nº10 appliqué (2026-10-04, #322)

**Tranché par Antoine le 2026-10-04** : les 22 cartes du [nº10](https://claude.ai/artifact/EcXYgaHaXXtAE3vqnkpbAd), 20 « ça passe » et 2 « à changer ». Les décisions vivent dans `cards/`, et les réponses sous ses deux notes (`cards/<id>.reply`).
- **Les trois décisions en tête** : la promesse telle quelle, la description et la bande de l'accueil aussi (`d-promise`) ; la note de l'hybride portée, C25 Q5 tenue contre la proposition du retour (`d-hybrid-note`) ; l'alerte de payback long reste aussi quand la perte n'est que possible, option 1, « la plus vraie » (`d-warn-gain`).
- **`d-warn-gain`, la formulation** : « Rembourser un client prend {payback} » se lisait comme rembourser le client. Antoine a pris la tournure de la carte des mois, « rembourser son coût », en gardant « son coût », sans quoi la phrase change de sens. Les huit chaînes de l'alerte (quatre à l'écran, quatre sur la slide) disent maintenant « Un client met {payback} à rembourser son coût », et l'anglais « A customer takes {payback} to pay back its cost ». La même classe de défaut était dans l'aide du runway (`settings.runwayHint`), corrigée du même coup. Ce qui n'a pas bougé, et pourquoi : « partir avant d'avoir remboursé » et « remboursé : 11 mois », où le client est le sujet ; « Elle revient toute, au fil des remboursements », validée sur sa carte.
- **`money-head`** : un « ? » sur l'ARR du bloc d'argent (`terms.arr`). L'ARR est extrapolé du revenu mensuel, ce n'est pas un revenu acquis. Antoine demandait aussi s'il fallait poser la durée des contrats : laissé de côté sur la reco, l'ARR reste le MRR × 12 et le churn porte déjà les résiliations. L'idée est en section E de `CHANTIERS.md`, avec ce qui la ferait revenir. Le « ? » n'est que sur le bloc d'argent, là où le mot sert pour la première fois : pas sur « ARR dans 12 mois » de la carte « Et si », pas sur les slides.

**Les marqueurs** : ceux des 20 cartes deviennent « Validé au bon à tirer nº10 (2026-10-04) », comme au nº6. Les trois plus anciens de la promesse aussi (le 2026-09-28, A7.1 et A7.3.c), puisque toute la chaîne a été jugée au nº10 (C55) : le relecteur de copie avait vu les deux premiers restés « à relire ». Restent « à relire » les neuf chaînes réécrites (les huit de l'alerte, l'aide du runway) et la définition neuve de l'ARR : copie neuve (convention 6), avec un marqueur juste au-dessus de chaque groupe (les quatre `warn*`, les quatre `unitWarn*`, `runwayHint`, `terms.arr`) pour que le prochain `grep` les trouve. L'anglais de l'ARR dit « guaranteed revenue », pas « revenue in the bank » : « acquis » veut dire garanti, et « bank » sert déjà, au sens propre, à la trésorerie immobilisée du même bloc (relecteur de copie).

**Un piège, le mien** : la définition de l'ARR avait deux espaces ordinaires devant les deux-points, et la CI l'a refusée (`copy-typography.test.ts`). Je n'avais lancé en local que les tests du moteur, pas toute la suite. Une chaîne française neuve se vérifie avec `copy-typography.test.ts`, qui couvre toute la copie.

**Un défaut vu à l'écran** : la définition du « ? » de l'ARR prenait les capitales du libellé, parce que la bulle s'ouvre dans le `<dt>`. Le libellé d'une ligne de trésorerie avait déjà sa remise à zéro (`.factLabel [role="dialog"]`) ; celui d'un chiffre la partage maintenant (`MoneyBlock.module.css`), et la spec du « ? » vérifie que la bulle n'est pas en capitales.

**Les films** : Antoine les a regardés le 2026-10-04, « les films sont OK » (A20.g).

**Vérifié** : 3 212 tests unitaires ; 88 specs e2e du moteur passées sur un build de production (`engine-money`, `engine-deck-unit`, `engine-runway`, `engine-terms`, `engine-deck`), dont la spec neuve du « ? » de l'ARR en FR et en EN ; captures du bloc d'argent, bulle ouverte, en FR à 390 et en EN à 1 280, avant et après la remise à zéro des capitales, et de l'alerte réécrite à 390.

## B13 et A20.f : le moteur entre dans Claude Design (2026-10-04, #323)

**Lancé par Antoine** (`/design-sync`), avec trois réponses : écrire les aperçus des 21 composants du moteur, synchroniser maintenant plutôt qu'après le bon à tirer nº9 (les cartes citent la copie du jour, « à relire » comprise), et retirer du projet les briefs 07 et 09 avec leurs retours. Une seule synchro pour A18 et A20 : B13 attendait A18.d, qui est absorbé par le nº9, et le nº9 n'est pas tranché.

**Ce qui est parti** : 112 composants, 408 cellules, toutes notées bonnes ; 30 composants envoyés (les 21 du moteur, neufs, et 9 dont l'aperçu ou la doc a changé), 82 reportés ; 571 fichiers entre les deux sentinelles, puis l'index (`_ds_manifest.json`, 112 cartes dont 21 `engine`, relu identique par `get_file`), puis l'ancre (`6850313bcfa9`) ; 257 chemins retirés sous `design/`, qui n'existe plus dans le projet. Trois passes du pilote, les quatre avertissements attendus et aucun autre. Le détail est dans `.design-sync/NOTES.md` (« Synced », « The engine group », « Found in the 2026-10-04 re-sync »).

**La méthode des 21 aperçus** : chaque prop vient d'un appel du produit exécuté, pas lu. Les enveloppes de l'îlot sans hook (`BoardLever`, `BoardBar`, `AskScreen`…) sont appelées comme des fonctions, et l'élément qu'elles rendent est l'appel ; celles qui ont un hook sont rendues une fois et leur élément capturé ; la page elle-même est attendue (`await EnginePage(…)`). Les états viennent des fixtures du moteur, la copie de `FR` et `EN` résolus, et un générateur imprime le fichier entier, pour que les insécables survivent. Cinq agents en parallèle, sur un harnais commun, chacun sur un lot disjoint ; MoneyBlock d'abord, à la main, comme exemple. Ce qu'une carte ne peut pas montrer (les formes téléphone choisies par une media query de fenêtre, un menu ouvert au clic) est dit dans sa doc. Une section `engine` s'ajoute aux conventions (le « ? » jamais 0, aucune projection ni perte en rouge, le conseil de `CashWarning`).

**Ce qui a été corrigé en route** : six aperçus citaient une copie qu'A18 ou A20 a retirée (`Choices`, `DateField`, `NumberField`, `FieldRow`, `StatTile`, puis `Checkbox` en les reconstruisant) ; quatre docs de `src/` promettaient ce que le code ne fait plus (`NextStep`, `TrapNote`, `StatTile`, `Sheet.module.css`), corrigées ici parce qu'elles partent dans les contrats que lit l'agent de Claude Design. Deux pièges de présentation : le fond de l'aperçu est blanc quand celui du produit est papier (les halos des courbes faisaient des boîtes beiges), et les radios d'`EngineStart` ont un `name` fixe (plusieurs cellules sur une page ne formaient qu'un groupe).

**Ce qui a été vu dans le produit, et laissé** : huit défauts possibles, aucun dans une cellule, inscrits en A21 de `CHANTIERS.md`, à reproduire avant de corriger.

**Deux leçons** :
- **La recherche de dérive part du dernier build envoyé, pas du dernier merge de synchro.** Je l'ai d'abord lancée depuis le merge de B9 et B12 (`cca4b8d`) : A18 T1 était arrivé sur `main` pendant cette synchro, la base était fausse et la recherche manquait la moitié. Relancée depuis `44f2a2a`, le commit du build réellement envoyé, elle a trouvé les cinq aperçus.
- **Un aperçu qui se rend bien peut mentir.** `MoneyBlock` « dans l'hybride » partait d'abord de `hybridState()`, qui n'a pas de marge pour l'assisté : la carte était propre et contredisait sa doc. Les notes jugent maintenant aussi « vrai » : la cellule montre ce que sa doc dit, avec les chiffres du modèle et les mots du produit.

**Vérifié** : le rendu des 112 cartes (112 sur 112, 0 vide, 0 mince, 0 identique), chaque feuille de capture lue avant sa note, les 21 aperçus du moteur et les six repris type-checkés contre les vrais composants ; après l'envoi, `list_files` (aucun chemin sous `design/`, les 21 dossiers `components/engine/`), l'ancre relue, l'index relu identique au local. Le volet Design System, lui, n'est pas vérifiable d'ici : il montrait encore la copie du 2026-09-11 (B8).

## A21 : les huit défauts vus par les aperçus, et l'export PNG des graphiques (2026-10-04, PR_A21)

**Demandé par Antoine** après le merge de #323 : « lance-toi sur les corrections en A21 ». Les huit défauts possibles notés par la re-synchro sont reproduits un par un avant d'être corrigés. Tous étaient réels ; A21.7 était peut-être voulu, et la règle du composant l'a tranché.

- **A21.1, « Dernière visite » sur un mois passé** : reproduit en e2e (juillet clos le 3 août, visite le 20 septembre, ouverture le 24 : « aujourd'hui »). Sur un mois passé, `ctx.today` est le jour de clôture du mois (`monthView`), et l'écart avec une visite plus récente tombait à zéro. Compté maintenant jusqu'au jour d'ouverture (`openedAt`, de l'`engine-store` jusqu'à `BoardNextStep`).
- **A21.2, « Mois après remboursement »** : reproduit en unitaire (churn 6 → 5 % : « part avant | part avant | stable »). Deux pertes de tailles différentes s'imprimaient pareil, et l'écart, calculé sur deux textes identiques, disait « stable ». La perte se dit maintenant en mois (« part ~4 mois avant », « leaves ~4 months early ») : l'écart s'additionne à ce qu'on lit (−4 → +4 : +8 mois). `leavesFirst` est réécrite, donc « à relire ».
- **A21.3, « pas de chiffre » dans `TotalBand`** : le composant ne savait pas qu'il recevait des mots. `missing` sur un moteur et sur le total : police du texte, en gris. L'aperçu `TotalUnknown` le passe déjà.
- **A21.4, les halos** : `--chart-halo`, le fond du parent, avec le papier par défaut. La carte de courbe d'une slide et le thème blanc du deck le posent. L'e2e du thème lit la couleur du trait d'une étiquette, papier puis blanc.
- **A21.5, deux étiquettes croisées** : les mois après un remboursement tardif descendent jusqu'à ce que la ligne montante passe à leur gauche, en restant au-dessus de l'axe (`paysBackLabels`, qui reçoit maintenant la largeur de l'étiquette). La perte en `size="sm"`, trop petite pour tenir dans son crochet, passe au-dessus de la ligne du coût (`shortLabelY`). En taille normale, elle n'y monte que si elle ne heurte pas « ce que coûte un nouveau client ».
- **A21.6, le résumé de la courbe** : `curveSummaryWhatif` prend `{key}`, la légende de la courbe. La phrase du tableau ne change pas (« avec tes « Et si » ») ; la slide dit « avec cet « Et si » » ou « avec les 3 « Et si » ».
- **A21.7, la légende d'une estimation** : `HowItCompares` dit lui-même que la légende dessine chaque marque comme le graphique. Sans barre, il n'y a donc plus de pastille de barre.
- **A21.8, ce qui reste dans l'hybride** : l'en-tête d'un chiffre compte maintenant ce qui reste dans les deux moteurs, puisque « Enregistre et continue » les parcourt tous les deux. `hybridState()` suffisait à le reproduire : libre-service complet, `slg.act.time-to-live` encore à faire. `remainingText` prend un compte, plus un `ListProgress`.

**A21.9, trouvé en vérifiant A21.4** : le PNG d'une slide perdait ses graphiques. Plus de ligne du coût, plus de ligne de marge ni d'axe, la courbe du MRR remplie de noir (le remplissage par défaut d'une polyligne), les étiquettes dans la police par défaut. C'est le cas depuis que les slides portent `MrrCurve` et `PaybackChart` (A20.d T4). La cause est dans `html-to-image` 1.11 : il copie un `<svg>` avec `cloneNode(true)` sans en parcourir les enfants, qui arrivent dans l'image sans les feuilles de style de la page. `renderSlidePng` écrit donc en ligne, le temps de l'export, le style calculé des enfants de chaque `<svg>` (`inlineSvgStyles`), et remet l'attribut après. Aucun test ne pouvait le voir : celui du thème lisait un pixel de coin, et les specs du deck lisent le DOM, pas l'image. Le test neuf lit le pixel du PNG sous la ligne du coût. Leçon : **un export d'image se vérifie sur l'image**, pas sur la page dont elle part.

**Une erreur, la mienne** : en annulant le sabotage d'A21.9 par `git checkout -- <fichier>`, j'ai aussi effacé l'implémentation, qui n'était pas commitée. Je l'ai réappliquée à l'identique (même diff). Un sabotage se fait sur un fichier commité, ou s'annule par l'inverse exact de son édition.

**Vérifié** : 3 226 tests unitaires et la couverture ; 127, 57 puis 98 specs e2e du moteur (collecte, série, « Et si », hybride, argent, levier, écrans à 320 px, deck, thème, image de partage) sur un build de production. **Non-vacuité** : chacune des neuf corrections retirée fait rougir son test (huit en unitaire, quatre en e2e sur deux builds sabotés, dont A21.1 qui affiche alors exactement « Dernière visite · aujourd'hui »). Captures regardées, en FR et en EN : la fiche de juillet, le panneau « Et si » avec churn à 5 %, la bande de l'hybride sans MRR assisté, les PNG pleine taille de l'unit economics (tardif, papier et blanc), de la slide « Et si » sur fond blanc et de l'unit economics de l'hybride en taille réduite, la fiche de marge de l'exemple et celle de l'hybride.
