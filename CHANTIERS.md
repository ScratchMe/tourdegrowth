# CHANTIERS.md — ce qui reste à faire, et qui le fait

*Établi le 2026-09-29, après la mise en production de #184 ; allégé le
2026-10-01 de ce qui était clos (A10, A11, l'index des décisions, parti dans
`docs/decisions.md`). Hors bons à tirer
(nº4, nº7, nº9 et les libellés que `CLAUDE.md` liste « hors de tout bon à
tirer ») : un autre agent les mène avec Antoine.*

Ce document est la **liste de travail**, rangée par agent. Chaque section se
traite dans une session à part, lancée avec son prompt (section **Les prompts**,
en fin de document). `CLAUDE.md` garde l'état courant, `JOURNAL.md` l'histoire.

- **Quand un item est livré**, la session qui l'a livré le retire d'ici et
  l'écrit au journal.
- **Quand une session découvre du travail**, elle l'ajoute ici, dans la bonne
  section : du code en A, une question pour Antoine en C, un geste d'Antoine
  en D.
- **Les chiffres cités ont été mesurés le 2026-09-29.** Une session les
  re-mesure avant d'agir : un constat déjà résolu se retire, il ne se corrige
  pas.

## Vue d'ensemble

| Groupe | Qui | Où | Quand |
|---|---|---|---|
| **A. Le travail autonome**, en quatre lots | Une session seule, une PR par lot (A7 : une PR par item) | Session cloud | A1 à A6 livrés le 2026-09-29, A7 et A8 le 2026-09-30. **Reste d'A7** : A7.3.d (le bon à tirer de la copie neuve), A7.4 après A7.3, et A7.12.c à l'ouverture. **A7.3.c est livré le 2026-10-01**, les textes de lancement de la ligne « Hors code » d'A7.3 le même jour (S0 à S5, PR d'intégration [#233](https://github.com/ScratchMe/tourdegrowth/pull/233), drapeau fermé). A10 (S-15), A11 et A7.3.e (les quatre termes du glossaire) livrés le 2026-09-30. **A12, le niveau 2 du jeu** : spécifié et chiffré le 2026-09-30, **validé le 2026-10-01 (C30)**, sa copie, l'îlot partagé, le téléphone de Pédalix et le branchement faits le même jour (A12.c à A12.f.2)  et ses specs (A12.g) : reste A12.h (le bon à tirer, puis la recette) et A12.i (le `?ref=` de la boucle inverse, trouvé par B6). **A14, le moteur complet** : spécifié et validé le 2026-10-01 (C32) ; **A14.c est livré le même jour**, T0 à T7 (neuf PR de #255 à #266, drapeau fermé), puis T6.2, l'image de partage, au retour de B5 le même soir ([#272](https://github.com/ScratchMe/tourdegrowth/pull/272)) ; reste A14.d, son bon à tirer. **A13** (trois alertes de dépendances, dont une critique sur `next`) livré le 2026-10-01. **A15**, la finition UI et UX d'après les reels et les lois de l'UX, ouvert le 2026-10-01 : tout livré le même jour : deux PR, puis A15.18 une fois C33 tranchée ; A15.19 est porté le 2026-10-02 par **A16** (la feuille de score) : A15 est clos. **A17** (le halo grisé des images de partage de contenu, trouvé par T6.2) est livré le 2026-10-02 ([#274](https://github.com/ScratchMe/tourdegrowth/pull/274)). **A18, le moteur simplifié** (le portage du retour 07, C38 et C40 à C42) : ouvert le 2026-10-02, T0 à T7 puis un bon à tirer unique, A18.d, qui absorbe A7.3.d et A14.d ; **T0, T1, T2, T3.a, T3.b et T3.c livrés le même jour** ([#283](https://github.com/ScratchMe/tourdegrowth/pull/283), [#285](https://github.com/ScratchMe/tourdegrowth/pull/285), [#290](https://github.com/ScratchMe/tourdegrowth/pull/290), [#291](https://github.com/ScratchMe/tourdegrowth/pull/291), [#293](https://github.com/ScratchMe/tourdegrowth/pull/293), [#294](https://github.com/ScratchMe/tourdegrowth/pull/294), [#295](https://github.com/ScratchMe/tourdegrowth/pull/295)), **T3.d, T4, T5, T6 et T7 le 2026-10-03** ([#297](https://github.com/ScratchMe/tourdegrowth/pull/297), [#298](https://github.com/ScratchMe/tourdegrowth/pull/298), [#299](https://github.com/ScratchMe/tourdegrowth/pull/299), [#300](https://github.com/ScratchMe/tourdegrowth/pull/300), [#301](https://github.com/ScratchMe/tourdegrowth/pull/301)) : **le code d'A18 est entier**, reste A18.d. **A19, l'en-tête compact** (le portage du retour 08, B11) est livré le 2026-10-02 ([#284](https://github.com/ScratchMe/tourdegrowth/pull/284)). **A20** (le moteur à la hauteur de son film) est ouvert le 2026-10-03 : sa spécification (`ENGINE.md` §20) et son modèle pur (A20.a) sont livrés le même jour, et le brief 09 est déposé (B14) ; **son retour est arrivé et recopié le même jour** (prompt F) : le portage attend C46 à C55. |
| **B. Design sync** | Une session, cloud ou locale | N'importe où : une session cloud pousse vers Claude Design depuis le 2026-09-29 | **À jour le 2026-10-02, après A16 et A19** (B9 et B12, une seule synchro : 91 composants, 308 cellules, 91 aperçus sur 91 rendus ; les briefs 04, 05, 06 et 08 et leurs retours retirés du projet, décision d'Antoine). Avant : B3 et la re-synchro d'A11, le 2026-09-30. Ouverts le 2026-10-01 : **B4** (la re-synchro du niveau 2 du jeu, faite le même jour), **B5** (l'image de partage du moteur, C32 Q17 : brief 06 écrit et déposé le même jour, retour reçu et porté en T6.2 le même soir), **B6** (la re-synchro d'A15 et de C33, faite le même jour : 90 composants, 303 cellules, les douze aperçus du jeu laissés par B4 régénérés) et **B7** (les puces d'étape, A15.19 : le retour 05 est recopié et porté le 2026-10-02, A16 ; la re-synchro qui l'emporte est **B9**, ouverte et close le même jour). **B8** (ouvert le 2026-10-01 au soir) : le volet Design System montre une copie compilée le 2026-09-11, 34 cartes, alors que les fichiers et l'agent sont à jour ; Claude Design ne rafraîchit plus ce projet à l'ouverture ; laissé en l'état par Antoine le même soir (signalement prêt en D13). **B10** (le 2026-10-02) : le brief 07, le moteur plus simple sans perdre son expertise, déposé, lancé et revenu le même jour ; le retour est recopié et son portage est A18. **B11** (le 2026-10-02) : l'en-tête collant, compact une fois la page défilée en paysage ; brief 08 déposé, lancé et revenu le même jour, recopié et porté (A19) : clos ; la re-synchro qui l'emporte est **B12**, ouverte et close le même jour. **B13** (le 2026-10-02) : la re-synchro d'A18, prête depuis T7 (le 2026-10-03), à lancer après A18.d (quatorze composants neufs, trois aperçus à reprendre). **B14** (le 2026-10-03) : le brief 09, l'argent du moteur (A20), déposé, lancé et revenu le même jour ; le retour est recopié et son portage est A20.d, sa re-synchro A20.f. Hors d'eux, rien à lancer tant qu'un composant, ou une copie qu'un aperçu reprend, ne change pas |
| **C. Tes décisions**, une par une | Toi, guidé, avec une recommandation par question | N'importe quelle session | **Tranchées le 2026-09-29** (C18 close à part, par la session D). C23 à C29 tranchées le 2026-09-30, C26 à C29 livrées le même jour, **C25** (la spécification de A7.3, `ENGINE.md` §18) dans sa propre session. **C30** (le niveau 2 du jeu, `GAME-BRIEF.md` §17) le 2026-10-01. **C31** (le bloc « Niveau suivant » du jeu) et **C32** (le moteur complet, `docs/engine/moteur-complet.md` §19.15) le 2026-10-01. **C33** (la carte du jeu sous les chiffres du lecteur, A15.18) ouverte et tranchée le 2026-10-01. **C34** et **C35** (le rouge des ex aequo, le nouveau « ? », nées du retour 05) tranchées le 2026-10-02, puis **C36** (la PR Dependabot #244 : React 19.3 seul, `firebase-admin` ≥ 14.4 mis en attente pour son poids) puis **C37** et **C39** (`next` 16.3.7, les types React 19.3 et `eslint-config-next` 16.3.7, mergés par #277 et #278) le même jour. **C38** (les bons à tirer du moteur attendent le portage du retour 07) et **C40 à C42** (le pas à pas fondu dans le tableau avec un écran Cibles gardé, la liste à la place des onglets, les renommages), nées du brief 07, tranchées le 2026-10-02, puis **C43** et **C44** (la course compacte comptée à part, la langue à 88 px partout), nées du retour 08, le même jour. **C45** (les films de motion design), **C46 à C52** (l'argent du moteur, A20) et **C53 à C55** (nées du retour du brief 09) ouvertes et **tranchées le 2026-10-03**, toutes sur la reco, avec, à C49, le mot « runway » et un plancher de 30 mois sans runway saisi. Rien n'est ouvert |
| **D. Tes actions**, pas à pas | Toi, accompagné | Session cloud | Selon ce qui est prêt. D10 (l'indexation) est prêt tout de suite. D2 attend les bons à tirer nº7 et nº9 (A18.d, qui remplace le nº8), la recette (D9) et, pour le moteur, le lot A18 (le moteur simplifié) et son bon à tirer unique A18.d, qui absorbe ceux d'A7.3 et d'A14 (C38) |
| **E. La veille** | Personne | — | Rien à lancer avant un déclencheur |

**L'ordre conseillé** : A18 (le moteur simplifié, T0 à T7), puis son bon à
tirer unique A18.d (`/bon-a-tirer`), qui absorbe A7.3.d et A14.d (C38), A7.4, puis D. A7.3.c, les textes de lancement d'A7.3 (ligne
« Hors code ») et A13 (l'alerte critique sur `next`) sont livrés le
2026-10-01. A7.3.e, qui se menait en parallèle, est livré le
2026-09-30. Le niveau 2 du jeu (A12.h, avec Antoine) peut avancer en
parallèle : il ne touche pas les mêmes fichiers. Le moteur ouvre avant le jeu (C23). A14.c
(le moteur complet) est livré le 2026-10-01, T6.2 compris ; son bon à tirer
passe dans A18.d, et le moteur n'ouvre qu'après A18 (C32 Q1, C38).
La section C est vide : C45 à C55 sont tranchées le 2026-10-03, C34 à C44 le 2026-10-02. **A20** (le moteur à la hauteur de son film) a sa spécification et son modèle depuis le 2026-10-03 (prompt E), son retour de Claude Design et ses décisions le même jour (prompt F) : **le portage A20.d est en cours**, puis son bon à tirer nº10 (A20.e), et l'ouverture du moteur les attend (C46).

**Deux sessions en parallèle** écrivent toutes deux à la fin de `JOURNAL.md`
et dans ce fichier. La seconde à merger fusionne `main` dans sa branche avant
sa PR et garde les deux entrées. Les lots A, eux, se suivent : ils touchent les
mêmes feuilles de style.

---

## A. Ce que la session fait seule

**Pour chaque lot :**
- une branche depuis `origin/main` ;
- chaque correctif a son test ou sa garde, avec sa non-vacuité (`TESTING.md`) ;
- une vérification à l'écran, dans les deux langues, à 1 280 et 390 px ;
- une PR, mergée par la session quand elle est verte, en suivant `/livrer`
  (lu, pas appelé) et sa barrière §0.

Une question produit ou de design rencontrée en route ne se tranche pas seule
en route. **Si Antoine est dans la session, elle se pose tout de suite**
(AskUserQuestion, la reco en premier), surtout quand le reste du travail en
dépend : il l'a demandé le 2026-10-01, après avoir découvert en fin de session
cinq questions du niveau 2 qu'il aurait pu trancher pendant. Sinon, elle part
en section C, avec une recommandation.

### A7 — Ce que les décisions du 2026-09-29 demandent

Les réponses d'Antoine à la section C, séance du 2026-09-29. Chaque item dit
ce qui est décidé ; **il ne se rediscute pas en route**. Une question neuve
rencontrée en le faisant repart en section C. Toute copie neuve porte
« TODO: à relire » (convention 6).

**Dans quel ordre.** Les items sont indépendants, sauf :
- A7.3 avant A7.4, parce que les liens promettent ce que le moteur fait ;

Le jeu n'attend rien du moteur.
**A7.1, A7.2, A7.5 à A7.11, A7.12.a, A7.12.b et A7.13 sont livrés (2026-09-30).** **A7.3.a est écrit et A7.3.b est close** : Antoine a validé la spécification le 2026-09-30 (C25, `ENGINE.md` §18.12). **A7.3.e est livré le 2026-09-30, et A7.3.c peut partir.**

#### A7.3 — Le B2B assisté et l'hybride dès la v1 (C4)

**Décidé** (`ENGINE.md`, décision 3) :
- **Le réglage** : un type, « SaaS B2B » (app grand public et place de
  marché restent affichées, plus tard), puis deux cases de motion,
  libre-service (PLG) et assisté (SLG), dont au moins une cochée.
- **L'hybride** (les deux cochées) : « deux moteurs, un total », **jamais en
  face-à-face**. Deux funnels côte à côte, chacun avec ses cibles et sa
  fuite ; le MRR additionné ; une slide d'unit economics avec les deux
  motions en regard (CAC, payback, panier, churn). Un chiffre de liaison
  optionnel compte les comptes qualifiés par le produit passés aux
  commerciaux.
- **Seule une cible d'équipe désigne une fuite** (A7.1) : cela vaut pour
  les deux motions.
- **L'ouverture du moteur attend tout le lot**, spécification comprise.

**Décidé en plus à la validation** (C25, 2026-09-30, `ENGINE.md` §18.12) :
- **Un client compte dans la motion qui a signé son contrat en cours**, et un
  passage du libre-service à l'assisté n'est pas un départ du libre-service
  (Q3) ;
- **l'activation assistée est la mise en production** (Q1), et **tout
  l'assisté se lit sur trois mois glissants**, sans réglage (Q2) ;
- **une marge brute par motion** (Q4) : l'assisté gagne
  `slg.rev.gross-margin`, avec un repli « Reprendre la marge globale »,
  compté approximatif ;
- **la liaison est un levier « Et si » dès la v1** (Q7), en nombre
  d'opportunités par trimestre, jamais candidate ni constat, et rien n'est
  retiré au libre-service ;
- **quatre termes de glossaire dès la v1** (Q8), écrits par une session à
  part (A7.3.e) ;
- les dix autres recos du §18.12 telles quelles.

**Dans l'ordre, et chaque étape attend la précédente** (A7.3.e, mené en
parallèle de A7.3.c, est livré le 2026-09-30 et retiré du tableau) :

| # | Quoi | Précisions |
|---|---|---|
| A7.3.a | **La spécification** — **écrite le 2026-09-30 : `ENGINE.md` §18** | Le catalogue assisté (14 chiffres, 15 depuis Q4 ; trois relais sur leur propre base de 100), le modèle de données (`type` + `motions`, ids `slg.*`, `schemaVersion` 2 et sa migration testée au caractère près), l'hybride en « deux moteurs, un total » et ses garde-fous contre le face-à-face, le deck, l'exemple rempli calculé à la main, les tests et le découpage en PR. Seize questions produit en §18.12, reprises en C25 |
| A7.3.b | **La validation par Antoine** — **close le 2026-09-30** | C25 : treize recos retenues, trois reprises (Q4, Q7, Q8) et Q3 précisée. Les réponses sont datées en `ENGINE.md` §18.12, et les sections qu'elles changent sont corrigées |
| A7.3.c | **Le code**, sur le modèle du moteur actuel — **livré le 2026-10-01, dans la session d'Antoine : S0 le 2026-09-30** (golden v1 figé d'abord, puis le contrat v2, la migration, le fichier, le stockage, la validation, les trois comptes et les trois mois), **S1 le 2026-10-01** (le moteur pur de l'assisté : relais, diagnostic, impact, unit economics, total, « Et si » et levier de la liaison, l'exemple hybride ; l'exemple §18.9 sort exact), **S2 le même jour** (la prose des seize fiches et des trois calculés, `{period}`, toute la copie neuve de l'assisté et de l'hybride, « à relire »), **S3, S4 et S5 le même jour** (les écrans, le deck, Q14, la phrase de confidentialité et les e2e de §18.10.3). Ce que le lot laisse est listé en `ENGINE.md` §18.11 | Dans l'ordre du **§18.11** : branche d'intégration `feat/engine-slg`, six PR (S0 contrats et migration → S1 moteur pur → S4 deck → S5 intégration, avec S2 contenu et S3 écrans en parallèle), **un seul merge sur `main`**, drapeau fermé. Se lance avec le prompt A sur « le lot A7.3.c ». **Les slugs d'A7.3.e sont en place** (2026-09-30), dans `GlossaryTermId` : S2 lie `slg.acq.lead-to-opp` à `lead-to-opportunity`, `slg.acq.cycle` à `sales-cycle`, `slg.rev.win-rate` à `win-rate` et `slg.rev.acv` à `acv`. Aucun n'écrit de repère : les « pas de repère publiable » du §18.4 tiennent. Le seul chiffre cité, sur la page `acv` (Janz, 2014), cadre un modèle économique et n'est pas un repère de fiche. Moteur pur dans `lib/engine/`, catalogue et copie dans `content/engine-*.ts` (« à relire »), la vue sous `aarrr-funnel-template/_engine/`. Tests du moteur pur avec leur non-vacuité, e2e dans les deux langues, à 1 280 et 390 px, par l'aperçu propriétaire. Le canari « rien ne quitte le navigateur » couvre la nouvelle saisie |
| A7.3.d | **Le bon à tirer** de la copie neuve | **Absorbé par A18.d le 2026-10-02 (C38)** : relu en une passe avec la copie du moteur simplifié. Par l'agent des bons à tirer, avec `/bon-a-tirer`, construit depuis le code, **les quatre termes d'A7.3.e compris** |
| Hors code | Les textes de lancement disaient « v1 : SaaS en libre-service » | **Livré le 2026-10-01**, après A7.3.c : `marketing/kit.md`, `campaigns/README.md` (§0, §3, §8), `competitive-brief.md` et les six textes de `campaigns/engine/` disent les deux motions (dix-sept chiffres en libre-service, quinze en vente assistée, ou les deux en « deux moteurs, un total »), ne traduisent plus les noms d'étape et n'annoncent plus de nombre de slides (de 5 à 17 et plus, selon les chiffres). Au passage, le kit et le §3 du brief laissaient encore une fourchette publiée désigner la fuite, contre C1. Relevé par la relecture de S3 |

#### A7.4 — Les liens d'ouverture du moteur (C7)

**Décidé** : un lien vers le moteur depuis `/how-it-works`,
`/growth-audit-checklist` et `/startup-growth-diagnostic`, là où le texte
parle déjà de chiffres. **Pas de section à part sur l'accueil** : la carte
« Le moteur » de la bande « trois parties » (`SpaceStrip`) devient le lien,
avec la règle de C15. **Pas de lien au pied de page.**

| Où | Quoi |
|---|---|
| Les trois pages | Un lien en contexte (une phrase, pas un bandeau), en FR et en EN. Il n'apparaît que si le moteur est ouvert au build : même garde que la bande, `SPACE_OPEN_AT_BUILD.engine` (`SpaceBand.tsx:37`), et même raison que le sitemap (R2-28). La copie neuve est « à relire » |
| Mesure | **L'événement existe depuis A7.9 (2026-09-30)** : `engine_entry_clicked/<source>` (`ENGINE_ENTRY_DETAILS` dans `lib/analytics/goatcounter.ts`, déjà lu par `/admin/stats`), avec `home_strip` et `space_band`. Ajouter à la liste une source par page (`how_it_works`, `growth_audit_checklist`, `startup_growth_diagnostic`), et poser les liens avec `TrackedLink` comme la bande de l'accueil |
| Tests | Un e2e par page : le lien existe moteur ouvert et mène à `/{locale}/aarrr-funnel-template`. Un test sur un build fermé : il n'existe pas (les specs « jeu fermé » montrent la façon de faire) |
| Quand | Construit avant l'ouverture (D2), après A7.3 : les liens promettent ce que le moteur fait, hybride compris |

#### A7.12.c — Refaire les captures du moteur et du jeu à l'ouverture (C21)

**A7.12.a et A7.12.b sont livrés le 2026-09-30** : les captures du Tour sont
refaites (après I + B, A7.7 et A7.10), et celles du moteur et du jeu sont là,
préfixées `provisoire-` et listées comme telles dans `marketing/kit.md`.

**Reste**, à l'ouverture de chaque produit (D2) : les refaire contre le
produit ouvert (`scripts/kit-capture.config.ts`, qui dit comment), puis
retirer le préfixe `provisoire-` et la mention dans `kit.md`. Fait partie de
la vérification d'ouverture.

### A9 — Ce que la design sync du 2026-09-30 a trouvé dans le produit

Vus en notant les 244 cellules, puis **re-mesurés le 2026-09-30 sur `main`
d'après A5** avant d'être écrits ici, et **encore ouverts le 2026-10-01**
(A9.1 est livré avec A10.c). Chacun est petit ; ils peuvent partir dans une
seule PR, ou avec le lot qui touche le même fichier.

| # | Quoi | Où, et comment le voir |
|---|---|---|
| A9.2 | **Le tableau de bord du jeu coupe « 100,000 » sur deux lignes** entre 761 et 850 px de large (une ligne à 920) | La tuile « Subscribers » de `Dashboard`, dans la rangée de six : `StatTile` laisse le chiffre se couper au milieu. Mesuré dans l'aperçu `YearStart` par les rectangles du texte. Un chiffre ne se coupe jamais (`white-space: nowrap` sur la valeur, et une tuile qui s'élargit ou passe à la ligne) |
| A9.3 | **La courbe de churn touche l'étiquette « target 4.0% »** dans la fin `DarkYear` | `EndingCharts` la reçoit de `Sparkline`, qui dessine l'étiquette de la ligne d'objectif (`.referenceLabel`, `viz/Sparkline.module.css`) au-dessus de la ligne, là où passe une courbe proche de 5 %. Placer l'étiquette du côté sans données, ou lui donner un fond |
| A9.4 | **Une règle morte dans `SpaceBand.module.css`** : `.inner { padding-block: 7px }` sous `@container (max-width: 560px)` | `.inner` est lui-même le conteneur, et une requête de conteneur ne s'applique jamais au conteneur qu'elle interroge. Soit la retirer, soit la poser sur un enfant (et vérifier à 360 px que la bande ne change pas) |


### A10 — Ce que le portage des primitives a laissé

A10 (S-15, les primitives de formulaire de l'extension 04) est **livré le
2026-09-30** en quatre PR (#218, #221, #223 et #224), et A11, ce
que la design sync B3 a trouvé ensuite, le même soir (#227). Le détail, et les
écarts assumés contre le retour de Claude Design, sont au journal. **Restent**,
hors du périmètre qu'A10 s'était donné :

| # | Quoi | Détail |
|---|---|---|
| A10.1 | **Mesurer `--select-inset` dans WebKit et Gecko** | La session d'A10 n'avait que Chromium |
| A10.2 | **Porter le curseur du « Et si » et les deux boutons d'import de fichier** | Le retour 04 pose ses conditions : un `Field`, et un `NumberField` à côté du curseur. `form-controls-source.test.ts` les excepte nommément jusque-là |
| A10.3 | **Une garde générale contre toute opacité sur du texte** | Suggérée par le retour 04 ; les primitives ont déjà la leur |
| A10.4 | **« Pour enregistrer, il manque : … »** dans la fiche du moteur | Deviendrait naturellement un `FormSummary`, mais il lui faut un titre qui compte, donc de la copie neuve : **une question pour la section C** avant d'être du code |

### A12 — Le niveau 2 du jeu, « Comment les gens vous trouvent » (C30 tranchée le 2026-10-01)

Antoine a retenu le 2026-09-30 un deuxième niveau avant le lancement, et
l'acquisition pour ce niveau (six astuces sur huit absentes du niveau 1, une
autorité déjà connue du jeu, des cas publics récents : `GAME-BRIEF.md`
§17.1). **Fait le même jour** : la spécification (`GAME-BRIEF.md` §17, dans `docs/game/niveau-2.md` depuis le 2026-10-01), le
moteur généralisé (un chiffre qui monte comme un chiffre qui baisse, une
boutique comme un abonnement, le niveau 1 identique au bit près) et le modèle
du niveau 2 codé en brouillon, sans page ni texte, avec ses quatre années de
référence en tests (`lib/game/levels/acquisition.ts`, `acquisition.test.ts`).
**C30 est tranchée le 2026-10-01** : les cinq recos retenues, la
spécification validée telle quelle. A12.c, A12.d et A12.e sont faites le même jour,
A12.f.1, A12.f.2 et A12.g aussi : le niveau est jouable, derrière le drapeau, l'encart du résultat propose les deux niveaux quand ils freinent ensemble, et ses specs Playwright tournent. Reste A12.h, le bon à tirer et la recette, avec Antoine. Toute copie neuve porte
« TODO: à relire » (convention 6).

| # | Quoi | Détail |
|---|---|---|
| A12.a | **La spécification et le modèle** | **Faits le 2026-09-30.** `GAME-BRIEF.md` §17 (`docs/game/niveau-2.md`) : univers (Pédalix), chiffre du board (nouveaux clients par mois), constantes, les dix-sept cartes et leur rôle au niveau 1, le DG, les quatre années de référence, le téléphone, les événements, les fins, et le catalogue vérifié sur les sources primaires. Cinq questions en §17.10, reprises en C30 |
| A12.b | **La validation par Antoine** — **close le 2026-10-01** | C30 : nouveaux clients par mois, Pédalix, transaction de 150 000 €, les huit cas tels quels, une carte qui propose les deux niveaux. Réponses datées en `GAME-BRIEF.md` §17.10 |
| A12.c | **La copie** | **Faite le 2026-10-01** ([#242](https://github.com/ScratchMe/tourdegrowth/pull/242)). `content/game/acquisition.ts`, FR et EN, « à relire », ce que le niveau 1 dit de toute année repris par référence ; le chapeau et les métadonnées dans `meta.ts` ; la série C du §7.1 tenue par les règles communes (`game-copy-checks.ts`), plus C12 (insécables des nombres), C13 (l'arithmétique du téléphone) et C14 (jamais « amende »). Le catalogue relu sur les sources primaires le même jour (huit corrections, `GAME-BRIEF.md` §17.9) |
| A12.d | **L'îlot partagé** | **Fait le 2026-10-01** ([#245](https://github.com/ScratchMe/tourdegrowth/pull/245)). L'îlot vit sous `app/[locale]/game/_island/`, le même pour tout niveau : un niveau y apporte son modèle, sa copie, le format de son chiffre (`metricFormat` : un dixième de point, une dizaine de clients) et son téléphone (`sides.tsx`). Les six composants qui portaient les noms du niveau 1 (`churn`, `subs`, `mrr`, `clicks`) prennent `metric`, `customers`, `revenue`, `pill` ; leurs aperçus suivent, la re-synchro avec Claude Design est B4, après A12.e. Testé sur les deux niveaux : chaque écran de chaque fin du niveau 2 passe par l'îlot sans « % » ni « pt » |
| A12.e | **Le téléphone de Pédalix** | **Fait le 2026-10-01** ([#246](https://github.com/ScratchMe/tourdegrowth/pull/246)). `ShopPhone` et `BasketPill` (§17.7), calculés par `lib/game/shop-phone.ts` (`shopPhoneView`, `basketFor`) et branchés dans `sides.tsx` (`ACQUISITION_SIDE`), pas encore dans `ISLAND_SIDES` (A12.f). Le cadre du téléphone (`PhoneFrame.module.css`) et son éclair (`phone-flash.ts`) sont partagés avec celui de Flixo ; la pastille reprend les styles de `ClickPill`. Un vert à Pédalix (`--shop-brand`). Deux aperçus pour Claude Design, synchronisés par B4 |
| A12.f.1 | **Le branchement : le niveau jouable** | **Fait le 2026-10-01** ([#247](https://github.com/ScratchMe/tourdegrowth/pull/247)). `LevelSlug` gagne l'acquisition, et le compilateur a listé ce qu'il exigeait : la clé de sauvegarde (`tdg.game.acquisition.v1`), la copie de l'encart du résultat (« Le côté obscur de l'acquisition », « Nouveaux clients 2 000 »), le modèle et le côté dans l'îlot (devenu générique sur le niveau), le vocabulaire analytique. **Une page de niveau commune** aux deux (`app/[locale]/game/_level/LevelPage.tsx`), chaque `page.tsx` n'apportant que son intro, ses deux mots du glossaire (acquisition et CAC pour le niveau 2), sa copie et son îlot. Ensuite : l'image de partage (son texte reçoit le niveau en paramètre), le sitemap, le hub « jouable » avec sa propre fin (« le contrôle et la transaction »), et les deux pages qui se renvoient l'une à l'autre (zones, et le bloc de décembre devenu lien, « jouable », C31). **Analytique** : les fins comptées par niveau (`game_ending/<niveau>/<fin>`), une porte `other_level`, et le passage résultat → jeu calculé sur tout goulot qui a un niveau. Copie neuve « à relire » |
| A12.f.2 | **L'encart qui propose les deux niveaux** | **Fait le 2026-10-01** ([#248](https://github.com/ScratchMe/tourdegrowth/pull/248)). `gameEntriesFor` rend une liste : chaque étape du goulot qui a un niveau, la plus faible d'abord, sans doublon. `GameEntry` reçoit `levels`. À un niveau, la carte est inchangée ; à plusieurs, une carte qui les propose tous (C30 Q5, `GAME-BRIEF.md` §15.4). Sa bande est empilée, avec le chiffre de chaque niveau puis la confiance absente. Elle prend sa propre copie, « à relire » (`GAME_ENTRY_SEVERAL` : « Le côté obscur de tes étapes »), et une rangée par étape, son nom au-dessus de son bouton. Aucun chemin analytique neuf : chaque bouton compte la porte de son niveau. Une fixture e2e, un vrai résultat à goulot acquisition + rétention lu dans l'émulateur |
| A12.g | **Les specs Playwright** | **Faites le 2026-10-01** ([#250](https://github.com/ScratchMe/tourdegrowth/pull/250)). `e2e/game-level2.spec.ts`, sur le modèle de P1 à P27, dans les deux langues, à 1 280 et 390 px. Ses specs : le premier écran (P1, P2), le téléphone et le panier qui suivent les cartes (P5), les années A en français et C en anglais jouées à l'interface d'après les tables du §17.6, l'année D renvoyée en juin (P9), la sauvegarde sous sa propre clé, 390 px à chaque phase (P17), axe sur décembre (P21) et l'analytique par niveau (P20). Les assistants de `game-helpers.ts` prennent le niveau en paramètre |
| A12.h | **Le bon à tirer, puis la recette** | Un bon à tirer du niveau 2 (`/bon-a-tirer`), puis une recette (D9) qui couvre les deux niveaux, relecture juridique du catalogue comprise |
| A12.i | **La boucle inverse ne porte pas `?ref=`** (trouvé par la re-synchro B6, le 2026-10-01) | GAME-BRIEF 13.3 D : en fin de niveau, « Où en est ta croissance ? » renvoie au Tour, et « le lien porte `?ref=` comme les autres entrées du Tour si un identifiant de résultat est connu ». `TourLoop` sait le faire (`refId`, `tourLoopHref`), mais `GameIsland.tsx` ne le lui passe jamais : le lien mène toujours à `/quiz` nu. À trancher avant d'ouvrir le jeu : quel identifiant est « connu » (celui du lien partagé par lequel le joueur est arrivé, ou son propre résultat), puis le brancher, avec une spec e2e qui lit le `href`. Le jeu est fermé : rien ne fuit aujourd'hui |

### A14 — Le moteur complet, pour le SaaS B2B (C32 tranchée le 2026-10-01)

Antoine a demandé le 2026-10-01 de faire tout ce qui manque encore au moteur
pour le SaaS B2B, avant l'app grand public et la place de marché : « on
devrait gérer tout ce que tu listes dans le point 3 ». Onze chantiers : la
série mensuelle, la rétention J30 et la part recommandée en €, la couverture
du pipeline, les outils au réglage et le contrôle « deux outils », coller un
tableau, plusieurs moteurs par appareil, la fusion à l'import, le fond blanc,
les rappels `.ics`, deux portes d'entrée et l'image de partage. L'export
PowerPoint reste hors du lot (Q19). La spécification est dans
`docs/engine/moteur-complet.md` (§19), **validée le même jour (C32)**.
**L'ouverture du moteur attend tout le lot** (Q1, contre la reco), bon à tirer
compris : chaque PR se merge donc sur `main` dès qu'elle est verte, drapeau
fermé, sans branche d'intégration. Toute copie neuve porte « TODO: à relire »
(convention 6).

| # | Quoi | Détail |
|---|---|---|
| A14.a | **La spécification** | **Écrite le 2026-10-01**, contre le code de `main` : §19.0 à §19.14 |
| A14.b | **La validation par Antoine** — **close le 2026-10-01** | C32 : dix-sept recos retenues, deux reprises (Q1 : l'ouverture attend A14 ; Q17 : l'image passe d'abord par Claude Design) et Q5 précisée (la slide « Ce qui a bougé » décochée par défaut). Réponses datées en §19.15 |
| A14.c | **Le code** | T0 à T7 (§19.14), ~16,5 jours-agent, une PR chacune mergée dès qu'elle est verte. **T0 livré le 2026-10-01** ([#255](https://github.com/ScratchMe/tourdegrowth/pull/255) : golden v2 figé avant toute ligne, le fichier v3, plusieurs moteurs dans le stockage, la validation neuve, le correctif `ALL_TOOLS`). **T1 livré le même jour** ([#256](https://github.com/ScratchMe/tourdegrowth/pull/256) : la série mensuelle en moteur pur — mois clos relus à leur date, mois suivant, comparaison de deux mois, fuite du mois d'avant, slide « Ce qui a bougé » décochée, `notes.series`). **T2 livré le même jour** ([#258](https://github.com/ScratchMe/tourdegrowth/pull/258) : démarrer le mois suivant, le sélecteur de mois, un mois passé en lecture seule et « Corriger ce mois », l'écart sur chaque ligne, la fuite du mois d'avant, les propositions de la fiche, la mise en page de la slide). **T3 livré le même jour** ([#259](https://github.com/ScratchMe/tourdegrowth/pull/259) : la rétention J30 et la part recommandée chiffrées dans les deux motions, jusqu'à une cible de 50 %, et deux leviers « Et si » neufs). **T3.2 livré le même jour** ([#260](https://github.com/ScratchMe/tourdegrowth/pull/260) : la couverture du pipeline, saisie sous les relais, objectif et seuil dans les Réglages, sur la slide des relais). **T4 livré le même jour** ([#261](https://github.com/ScratchMe/tourdegrowth/pull/261) : les outils de l'équipe cochés au réglage, proposés d'abord dans la fiche, « À faire toi-même » rangé par outil, le contrôle « deux outils »). **T5 livré le même jour** ([#263](https://github.com/ScratchMe/tourdegrowth/pull/263) : plusieurs moteurs sur l'appareil, l'import à trois choix avec la fusion et son aperçu, « Saisie en tableau » avec son modèle CSV). **T6 livré le même jour** ([#264](https://github.com/ScratchMe/tourdegrowth/pull/264) : le fond blanc du deck, les deux rappels d'agenda en `.ics`, les deux portes vers le moteur, sur le résultat et sur l'accueil). **T7 livré le même jour** ([#266](https://github.com/ScratchMe/tourdegrowth/pull/266) : les cinq événements de §19.12 dans le vocabulaire fermé et au tableau de bord, la phrase de confidentialité, les écrans d'A14 mesurés de 320 à 430 px et lus par axe, le fond blanc à l'impression, l'état d'`ENGINE.md`). **T6.2 livré le même soir** ([#272](https://github.com/ScratchMe/tourdegrowth/pull/272) : l'image de partage, portée du retour de B5 ; le chronomètre de la page et le pictogramme du bandeau plutôt que leurs redessins, `docs/engine/moteur-complet.md` §19.11). **A14.c est fini** |
| A14.d | **Le bon à tirer de la copie neuve** | **Absorbé par A18.d le 2026-10-02 (C38)** : relu en une passe avec la copie du moteur simplifié. Prêt depuis le 2026-10-01 : A14.c est livré, T6.2 compris. La copie de l'image de partage (la ligne, la promesse et le texte alternatif, écrits par Claude Design, `content/engine-share.ts`) en fait partie. Avant l'ouverture (D2), construit depuis `grep -rn "TODO: à relire" src/`. Les relectures de copie de T4 à T6 ont laissé des points de voix, dans l'entrée du journal de chaque PR (`grep -n "A14.d" JOURNAL.md`) |

### A15 — La finition UI et UX avant le lancement (ouvert le 2026-10-01)

Antoine envoie des reels sur l'UI et l'UX, un sujet chacun, et le 2026-10-01
le recueil [Laws of UX](https://lawsofux.com/). **La méthode, qu'il a fixée** :
lire la légende (pas la vidéo), confronter chaque règle au code, et ne faire
que ce qui manque vraiment. Une règle qui est un goût contraire au système (la
direction I, les jetons) se dit et ne se code pas. Chaque reel traité a son
entrée au journal, avec ce qui a été retenu et écarté : la chercher avant de
rouvrir un sujet (`grep -n "reel" JOURNAL.md`). Les règles tirées des lois de
l'UX vivent dans `design/LOIS-UX.md`. **Une PR par lot, pas par item**
(Antoine, 2026-10-01 : moins de déploiements Vercel). A15.1 à A15.6 sont
livrés le 2026-10-01 dans la première (#252 ; le journal, à « A15 »).

**Ce que les lois de l'UX laissaient** (2026-10-01, `design/LOIS-UX.md`) est
livré le même jour dans une seconde PR ([#257](https://github.com/ScratchMe/tourdegrowth/pull/257)), comme Antoine l'a choisi : les
correctifs A15.7 à A15.14 et les décisions A15.15 à A15.17 et A15.20, qu'il a
tranchées sur les recos (le détail, et ce que chaque test prouve, sont au
journal, à « A15.7 à A15.20 »). **A15.18 suit le même jour** ([#262](https://github.com/ScratchMe/tourdegrowth/pull/262)), une fois C33 tranchée : « Dans le jeu » au-dessus de la carte du jeu (le journal, à « C33 »). **A15.19 suit le 2026-10-02** : le brief 05 à Claude Design (B7), puis son
portage, **A16** ([#271](https://github.com/ScratchMe/tourdegrowth/pull/271)) : la puce d'étape devient une ligne d'une feuille de score
(`StageScore`, `StageScores`), avec C34 et C35 tranchées le même jour (le
journal, à « A16 »). **A15 est clos.**

### A17 — Ce que le portage de l'image du moteur a trouvé (T6.2, 2026-10-01)

**Livré le 2026-10-02** ([#274](https://github.com/ScratchMe/tourdegrowth/pull/274), le journal à « A17 »). Le halo des images de
partage de contenu (l'accueil, « Comment ça marche », le glossaire, le quiz)
était gris, pas clair : son dégradé finissait sur `transparent`, que Satori
mélange à travers le noir. Il finit maintenant sur sa propre couleur à alpha
nul, comme la lampe de la nuit du jeu. L'accent rouge de l'image de l'accueil
repasse au-dessus des 3:1 de sa taille (2,76 avant). Une garde tient la règle
(`src/lib/og/ground-lift.test.ts`). **A17 est clos.**

---

### A18 — Le moteur simplifié : le portage du retour 07 (C38, C40 à C42, 2026-10-02)

**Ouvert le 2026-10-02**, au retour du brief 07 (B10). La source est
[`design/ds-extension-07-return/`](design/ds-extension-07-return/README.md) :
son README (les vingt réponses, les mesures), `INVENTORY.md` (où va chaque
morceau de l'expertise), `COPY.md` (121 chaînes neuves ou changées), quatorze
composants et la planche, à rejouer comme le dit son `COPIE.md`. **Tranché par
Antoine, planche sous les yeux** :
- **C40** : le pas à pas et le tableau ne font plus qu'un. Le tableau est la
  progression, avec une seule prochaine étape (les chiffres de 5 minutes, puis
  les demandes en un écran, puis les chiffres d'une heure), et « Tout voir
  d'un coup » disparaît. **Contre la reco, un écran « Cibles » est gardé au
  début**, sautable, pour une équipe qui les a sous la main ; la cible se
  saisit aussi sur l'écran de son chiffre et dans les Réglages. L'écran
  « Base » part : un nombre partagé se tape dans le premier chiffre qui le
  porte ;
- **C41** : une seule liste par étape à la place des cinq onglets, ce qui
  renverse la décision du 2026-09-26 ;
- **C42** : tous les renommages du retour (flux, base, peloton, miroir,
  statuts, « À demander », la position d'un chiffre), relus au bon à tirer ;
- **C38** : le portage d'abord, puis **un seul bon à tirer**, A18.d, qui
  absorbe A7.3.d et A14.d. L'ouverture du moteur attend les deux.

Le modèle de données ne change pas (README, contrainte 15) : le rôle par
défaut d'une demande existe déjà (`defaultRole`, `catalog-shape.ts`). Drapeau
fermé tout du long, une PR par étape, mergée verte. Chaque étape apporte sa
copie, « à relire ».

| # | Quoi | Détail |
|---|---|---|
| T0 | **Le socle** — **livré le 2026-10-02** ([#283](https://github.com/ScratchMe/tourdegrowth/pull/283)) ; les jetons que T0 ne lit pas attendent dans `dead-tokens.test.ts`, sous l'étape qui les lira, et chaque étape les en retire | `tokens/engine.css` dans `src/styles/tokens/` ; les deltas de `Disclosure` (`defaultOpen`, `open` et `onOpenChange`, `id`) et de `BulletChart` (`band`, `value: null`) ; le choix pur de la prochaine étape (l'ordre de `NextStep.prompt.md`), testé |
| T1 | **L'écran d'un chiffre** — **livré le 2026-10-02** ([#285](https://github.com/ScratchMe/tourdegrowth/pull/285)) ; trois écarts voulus au retour (pas de `<form>`, « Pas de réponse » au-dessus d'une réponse, le verdict par `positionLabel`), dans le journal | `NumberSheet`, `AnswerSwitch`, `TrapNote`, `WhereToFind`, `HowItCompares` et « Ta définition et une note » remplacent `MetricSheet`, au tableau comme au premier passage ; mêmes écritures (`sheet-draft.ts`) ; la cible dans « Comment il se situe » |
| T2 | **Le tableau**, en trois PR : **T2.a** (la barre et la prochaine étape) **livré le 2026-10-02** ([#290](https://github.com/ScratchMe/tourdegrowth/pull/290)) ; **T2.b** (`EngineProgress`, `NumberList`, l'écran d'un chiffre) **livré le 2026-10-02** ([#291](https://github.com/ScratchMe/tourdegrowth/pull/291)) ; **T2.c** (`LeverCard`) **livré le même jour**, dans la même PR | `EngineBar` et son menu (moteurs, mois, fichier, saisie en tableau, phrase de sauvegarde), `NextStep` à la place des bandeaux, `EngineProgress`, `NumberList` à la place des onglets (C41), `LeverCard` devant le panneau « Et si » complet ; verdict, diagnostic et peloton inchangés |
| T3 | **Le parcours**, en quatre PR : **T3.a** (la question et l'écran « Cibles ») **livré le 2026-10-02** ([#293](https://github.com/ScratchMe/tourdegrowth/pull/293)) ; **T3.b** (« Enregistre et continue », le pas à pas fondu dans le tableau) **livré le 2026-10-02** ([#294](https://github.com/ScratchMe/tourdegrowth/pull/294)) ; **T3.c** (`AskList` à la place de « À aller chercher ») **livré le 2026-10-02** ([#295](https://github.com/ScratchMe/tourdegrowth/pull/295)) ; **T3.d** (les cibles et les nombres partagés dans les Réglages) **livré le 2026-10-03** ([#297](https://github.com/ScratchMe/tourdegrowth/pull/297)) : **T3 est fini** | `EngineStart` (une question, les défauts en une phrase), l'écran « Cibles » gardé au début et sautable (C40), `AskList`, le pas à pas fondu dans le tableau ; les Réglages reçoivent ce que le réglage quitte, les cibles et les nombres partagés |
| T4 | **La page** — **livré le 2026-10-03** ([#298](https://github.com/ScratchMe/tourdegrowth/pull/298)) | `EngineLanding` : le script d'avant le premier rendu (il ne lit que l'existence de la clé ; à hacher si un `script-src` arrive un jour, `next.config.mjs`), la page courte au retour, la promesse en une ligne, « Combien de temps ça prend » sous l'outil ; ce que lisent les moteurs de recherche ne change pas |
| T5 | **L'hybride** — **livré le 2026-10-03** ([#299](https://github.com/ScratchMe/tourdegrowth/pull/299)) | `TotalBand`, puis un moteur à la fois sous « Moteur affiché » ; la vue de l'assisté (liste, relais, couverture du pipeline, petit échantillon), que la planche ne dessine pas, avec les mêmes composants |
| T6 | **Les mots** — **livré le 2026-10-03** ([#300](https://github.com/ScratchMe/tourdegrowth/pull/300)) ; les slides qui disent encore « motion », figées par golden-v2, attendent A18.d | les renommages de C42 partout où ils s'écrivent, les cinq entrées du glossaire (`?`), la parité FR/EN |
| T7 | **L'intégration** — **livré le 2026-10-03** ([#301](https://github.com/ScratchMe/tourdegrowth/pull/301)) ; elle a trouvé les champs à 42 px sous le doigt dans une boîte de 48, sur tout le site, corrigés dans `Field.module.css` sans rien changer à l'écran | `e2e/engine-screens.spec.ts` : dix écrans, contraste et 44 px de 320 à 1 280 px ; l'avant, le retour et le portage mesurés par `scripts/engine-density.capture.ts`, remis d'accord avec le parcours (`design/ds-extension-07-after/`) ; `ENGINE.md` ; la re-synchro est B13, après A18.d |
| A18.d | **Le bon à tirer unique** (C38) — **construit le 2026-10-03** : [nº9](https://claude.ai/artifact/5oYQ3ZF2sCUd6yiVajifC7), 120 cartes dont six décisions, décisions dans `cards/`. **Les six décisions sont tranchées et appliquées le même jour** ([#302](https://github.com/ScratchMe/tourdegrowth/pull/302)) (« motion » devient « moteur » partout, slides comprises, golden-v2 refigé par projection ; deux libellés du retour ; les deux effacements renommés ; la clause rouge, la relance à cinq jours et « 2,6× » gardées) ; reste la relecture des 114 autres cartes, puis leur application (`/bon-a-tirer appliquer`) | Après T7 : toute la copie neuve et ce qu'A7.3.d et A14.d auraient relu, en une passe, depuis `grep -rn "TODO: à relire" src/`. On y pose aussi la clause rouge du verdict, qui peut nommer une autre étape que le diagnostic (le retour, trouvaille 9) |


### A19 — L'en-tête compact : le portage du retour 08 (B11, 2026-10-02)

**Livré le 2026-10-02** ([#284](https://github.com/ScratchMe/tourdegrowth/pull/284), le journal à « A19 »). Dans une fenêtre en paysage,
une fois la page défilée, l'en-tête devient une ligne de 48 px : la marque, la
course (l'étape où l'on est, remplie de la couleur de son espace), les
contrôles de la page, sur la couleur du bandeau réduite à un liseré. **54 px
peints au lieu de 118**, 50 au lieu de 74 sans bandeau ; un téléphone en
paysage passe de 30,3 % de l'écran à 13,8 %. La boîte de l'en-tête garde sa
hauteur, seules des couches bougent, par transformation : rien ne bouge
dessous, et l'état ne peut pas se nourrir du défilement. Plein en haut de page
et tant que le focus clavier est dedans. Téléphone tenu droit, sans
JavaScript, avant l'hydratation : l'en-tête d'avant. `--sticky-offset` suit
l'état, mesuré, et les chiffres « Et si » du moteur comme la colonne d'un
niveau du jeu glissent avec lui. Antoine a tranché les deux points que le
retour laissait (C43 : les clics sur la course compacte comptés à part,
`space_band_compact` ; C44 : le sélecteur de langue à 88 px partout, 44 × 44
par cible). **A19.1**, le même jour, sur une question d'Antoine :
`--sticky-offset` est mesuré aussi dans l'état plein, sur toutes les pages et
à toutes les largeurs ([#287](https://github.com/ScratchMe/tourdegrowth/pull/287), le journal à « A19.1 »). **A19 est clos** ; la
re-synchro qui l'emporte vers Claude Design est B12, faite le même jour.

### A20 — Le moteur à la hauteur de son film (ouvert le 2026-10-03)

**Ouvert le 2026-10-03**, au retour des films de motion design
([`marketing/motion/`](marketing/motion/README.md)). Le film « Le moteur »
montre l'argent : un MRR qui monte, un client qui coûte plus qu'il ne
rapporte, « Et si ? » qui fait bouger le MRR dans 12 mois et l'ARR, des slides
pour un board ou un investisseur. Antoine pensait que le moteur le montrait
déjà. **La spécification est `ENGINE.md` §20**, dans
[`docs/engine/argent.md`](docs/engine/argent.md).

**L'écart, re-vérifié ligne à ligne le 2026-10-03 sur `db7fc72`** (le relevé
d'origine datait de `9c81844`, avant #302) :

- **Déjà là.**
  - Les « Et si » cumulés (`WhatIfPanel`), avec MRR dans 12 mois, nouveau MRR, NRR, GRR, CAC, LTV et payback qui bougent ensemble.
  - Ce que chaque levier rapporte seul, et l'effet composé.
  - « Freine ici », par une cible d'équipe.
  - Les slides : le funnel (son titre est le verdict), la fuite, unit economics (dont le LTV:CAC), « Et si » par levier et cumulée.
- **Manquait**, et le modèle l'a depuis A20.a (aucun écran ne le montre encore) :
  1. L'ARR, nulle part (seul le glossaire le définit).
  2. La trajectoire du MRR mois par mois, aujourd'hui contre « Et si » : le panneau et les slides n'ont que des tableaux et des tuiles.
  3. Le LTV:CAC dans « Et si » : il n'est que sur les slides d'unit economics (la libre-service et celle des deux moteurs en regard).
  4. Un constat quand le LTV passe sous le CAC : `findings.ts` n'a que `unit-econ-uncomputable`.
  5. Rien ne signale un CAC payback long, alors que c'est la trésorerie qui le paie. La fiche `cac-payback` du glossaire le dit (`src/content/glossary-deep.ts`), le moteur n'a aucune notion de trésorerie, et la slide d'unit economics place le payback sur un axe de 0 à 36 mois, avec la graduation de 12 mois, sans rien en dire. Ajouté par Antoine le 2026-10-03. Le modèle a depuis A20.a les deux faits que l'alerte lirait (le payback face à la durée de vie, la trésorerie immobilisée) ; l'alerte attend C49.
- **Caché.**
  - L'argent n'ouvre pas le tableau, qui ouvre sur le verdict du funnel et la prochaine étape. *Corrigé le 2026-10-03* : il n'en est pas absent. La carte du levier montre le MRR dans 12 mois, et en hybride `TotalBand` ouvre le tableau sur le MRR des deux moteurs et leur total (A18 T5). Le MRR d'aujourd'hui, l'ARR, le CAC face au LTV et le payback n'y sont pas, hors hybride pour le MRR.
  - « Et si » est plié derrière une carte à un seul levier (`BoardLever`).
  - La promesse de la page dit « CODIR » (« leadership meeting » en anglais), jamais board ni investisseurs, et la description de la page aussi.
  - L'exemple intégré (`example.ts`) n'a pas de marge : son LTV et son payback sont incalculables.
- **Le film a tort sur deux points.**
  - Il colore en rouge ce que les « Et si » ajoutent, et l'ARR projeté. Le produit garde sa règle (audit S-5 : une projection n'est jamais rouge, le rouge c'est la fuite).
  - *Trouvé le 2026-10-03* : il imprime les montants projetés à l'euro (80 212 €) et calcule ses écarts sur ces montants arrondis (13 344 € = 93 556 − 80 212). Le moteur imprime une projection à deux chiffres significatifs (`ENGINE.md` §6.2, « ~80 000 € »).
  Les films se remettent d'accord avec le moteur porté (A20.g, prompt F).

**Les étapes :**

| # | Quoi | Qui | État |
|---|---|---|---|
| A20.a | **Le modèle pur** (`ENGINE.md` §20.1 à §20.7) : par motion, aujourd'hui et avec les « Et si », l'ARR, la courbe du MRR sur 13 points (le MRR dans 12 mois en est le dernier point), le LTV:CAC, la durée de vie et les mois de marge après le remboursement, le constat de perte (détecté, pas encore dans `findings()`), la trésorerie immobilisée, et les sommes de l'hybride | Session | **Livré le 2026-10-03** ([#306](https://github.com/ScratchMe/tourdegrowth/pull/306) : `lib/engine/money.ts`, 31 tests, goldens tenus) |
| A20.b | **Le brief 09** à Claude Design, avec les captures de l'état actuel et sa densité | Session, puis Antoine qui le lance | Écrit, déposé, lancé et revenu le 2026-10-03 (B14) ; le retour est recopié dans `design/ds-extension-09-return/` |
| A20.c | **Les décisions** : C46 à C52, puis celles que le retour demande | Antoine | **Tranchées le 2026-10-03**, C46 à C55, toutes sur la reco ; à C49, le mot « runway » avec un « ? » (« tes mois de trésorerie ») et, sans runway saisi, une alerte dès 30 mois de payback (`docs/engine/argent.md` §20.8, §20.13) |
| A20.d | **Le portage**, une PR par étape, `ENGINE_ENABLED` fermé, une fois A20.c tranchée (prompt F). Découpage revu sur le retour (ses composants entre parenthèses) : T1, le constat de perte dans `findings()` (`unit-econ-loss` et `unit-econ-loss-maybe`, leurs rangs et leurs phrases, C48), la règle de l'alerte (`paybackWarning` : le runway, sinon 30 mois, C49) et le runway dans l'état (`setup.runwayMonths`) ; T2, l'argent sur le tableau, après le diagnostic (les jetons `tokens/money.css`, `MoneyBlock`, `WorthBars`, C47, C54) ; T3, « Et si » remonté (`LeverCard` avec `MrrCurve`, le panneau en tableaux `WhatIfFigures` et `LeverSum`, la carte de l'assisté, `TotalBand` et ses sommes, C51, C54) ; T4, les slides (`PaybackChart`, `SlideUnitEconomics` titrée par la perte en nº 2, `SlideWhatIf` avec sa courbe, les chiffres des titres, C48, C53) ; T5, l'alerte de payback long à l'écran (`CashWarning`), le runway saisi dans les Réglages (le mot « runway » et son « ? ») ; T6, la promesse (C52) et l'exemple (C50) ; T7, la densité avant contre après (`scripts/engine-density.capture.ts`) et les captures. Chaque écran en FR et en EN, à 1 280 et 390 px | Session | **Livré le 2026-10-03** : T1 livré ([#310](https://github.com/ScratchMe/tourdegrowth/pull/310), le constat de perte, l'alerte et le runway dans le modèle) ; T2 livré ([#311](https://github.com/ScratchMe/tourdegrowth/pull/311), l'argent sur le tableau, après le diagnostic, dans chaque motion) ; T3 coupé en deux : T3.a livré ([#312](https://github.com/ScratchMe/tourdegrowth/pull/312), la carte « Et si » remontée sous l'argent, avec la courbe du MRR, l'ARR dans 12 mois, la ligne du client et le total de l'hybride), puis T3.b livré ([#313](https://github.com/ScratchMe/tourdegrowth/pull/313), le panneau en trois tableaux, `LeverSum`, les totaux de `TotalBand`) ; T4 coupé en quatre : T4.a livré ([#314](https://github.com/ScratchMe/tourdegrowth/pull/314), les chiffres des titres à l'encre, C53), T4.b livré ([#315](https://github.com/ScratchMe/tourdegrowth/pull/315), les slides « Et si » avec leur courbe), T4.c livré ([#316](https://github.com/ScratchMe/tourdegrowth/pull/316), l'unit economics du libre-service seul et de l'assisté seul : six tuiles, `PaybackChart`, la perte en titre et en nº 2), T4.d livré ([#317](https://github.com/ScratchMe/tourdegrowth/pull/317), celle de l'hybride, les deux moteurs côte à côte) ; T5 livré ([#318](https://github.com/ScratchMe/tourdegrowth/pull/318), le runway dans les Réglages, son « ? », l'alerte qui s'y mesure) ; T6 livré ([#319](https://github.com/ScratchMe/tourdegrowth/pull/319), l'exemple et sa marge estimée, C50, la promesse, C52, et les trois défauts de mise en page que les fourchettes ont révélés) ; T7 ([#320](https://github.com/ScratchMe/tourdegrowth/pull/320), la densité avant contre après, mesurée par le même script : `design/ds-extension-09-after/`) |
| A20.e | **Le bon à tirer** de la copie neuve (le nº9 ou un nº10, au choix d'Antoine) | Agent des bons à tirer, puis Antoine | **Construit le 2026-10-03** : le [nº10](https://claude.ai/artifact/EcXYgaHaXXtAE3vqnkpbAd), 22 cartes dont trois décisions (la promesse et le reste du site, la note de l'hybride contre le retour, l'alerte quand la perte est possible), 136 chaînes ; décisions dans `cards/`. Attend Antoine, puis on applique (`/bon-a-tirer` §5) |
| A20.f | **La re-synchro** des composants touchés (prompt B) | Session | Après A20.e |
| A20.g | **Le film remis d'accord** avec le moteur porté (`marketing/motion/`, son README dit comment republier la page et réexporter les MP4) : les vrais écrans, aucune projection en rouge, les montants projetés à deux chiffres significatifs, l'alerte de trésorerie (C49), et les étiquettes « Chiffres d'exemple » qui manquent | Session | Après A20.d |

---

## B. Design sync

**Une session cloud suffit** depuis le 2026-09-29 : l'outil `DesignSync` y
répond avec la connexion claude.ai, et le convertisseur vient avec le skill
`/design-sync`. L'autorisation locale qui manquait le 2026-09-11 n'est plus un
prérequis. **B1 et B3 sont faits** : le projet Claude Design est à jour du
2026-09-30 après A7.10 et A10, puis re-synchronisé le soir même après A11, C28
et C29 (cinq composants recapturés, ancre `8235f4e6de01`), avec **88
composants, 292 cellules et 88 aperçus sur 88 rendus** (`JOURNAL.md`, « Design sync B3 », et `.design-sync/NOTES.md`,
« Synced »). B2, le brief S-15, est clos avec A10.

**B4 est fait le 2026-10-01** ([#253](https://github.com/ScratchMe/tourdegrowth/pull/253)) : le projet Claude Design est à jour du niveau 2 et d'A7.3.c, avec **90 composants et 303 cellules**, toutes notées « bon » (ancre `fee6cc7084fe`). Ce que B4 attendait est fait : les six contrats renommés par A12.d, `ShopPhone` et `BasketPill`, `PhoneMock`, `NextLevel`, `GameEntry`. La recherche de dérive et la régénération des aperçus par les fonctions de l'îlot ont trouvé huit aperçus faux de plus : `ZoneNav`, `Choices`, `Checkbox`, `HubMountain`, `Tag`, puis `RevealCells` et `QuarterTimeline`, dont les chiffres ne sont la fin d'aucune année, et `PhoneMock`. Elles ont trouvé aussi **un défaut du produit**, corrigé avec une garde e2e : une case cochée et désactivée perdait son remplissage, et la dernière façon de vendre des réglages du moteur avait l'air décochée. Le détail est dans `.design-sync/NOTES.md`, « Found in the 2026-10-01 re-sync (B4) », avec la liste des aperçus du jeu à régénérer à la prochaine synchro.

**B5, ouvert le 2026-10-01 : l'image de partage du moteur** (C32 Q17). Un
brief à Claude Design pour l'image de la page `/aarrr-funnel-template`, en
1 200 × 630, dans les deux langues : le titre de la page, et jamais de vrais
chiffres (un peloton du jeu d'exemple, si l'image en dessine un). Ce qui
revient se porte dans `lib/og/` en T6.2, une PR à part : T6 est livré sans
elle (`docs/engine/moteur-complet.md` §19.11). Les images du jeu sont le
modèle. **Le brief 06 est écrit le même jour** : [`design/DS-EXTENSION-BRIEF-06.md`](design/DS-EXTENSION-BRIEF-06.md)
et ses dix captures (`design/ds-extension-06/` : les images de partage du site
telles qu'elles sont, la page du moteur, le peloton de l'exemple). Il pose
quatre questions (le fond, l'image, les mots, la pastille « 2/3 ») et demande
un cadre que Satori rend tel quel : flex seulement, mesures en px, couleurs par
jeton. **Déposé le même jour** dans le projet Claude Design, aux mêmes chemins
sous `design/`, sous un plan à lui (onze fichiers, aucune suppression, ni le
bundle ni `_ds_sync.json` touchés). Tu l'as lancé le même jour
(D12, retirée depuis), et le retour s'est déposé dans
`design/ds-extension-06-return/`. **Retour reçu et porté le même soir** (T6.2,
[#272](https://github.com/ScratchMe/tourdegrowth/pull/272)) : recopié dans le dépôt (huit fichiers texte ; les rendus restent dans
le projet, `COPIE.md` dit pourquoi), puis porté dans `lib/og/engine-frame.tsx`.
Le portage est identique au pixel au rendu des sources du retour, sauf deux
dessins repris du produit plutôt que de leurs redessins : le chronomètre de la
page et le pictogramme du bandeau. **B5 est clos.**

**B6 est fait le 2026-10-01** ([#265](https://github.com/ScratchMe/tourdegrowth/pull/265)) : le projet Claude Design est à jour d'A15 et de C33, avec **90 composants et 303 cellules**, toutes notées « bon » (14 composants téléversés, aucune suppression, `design/` intact). Une seconde passe, le même soir, a emporté les deux jetons qu'A14 T6 a ajoutés pendant la relecture, `--paper-white` et `--surface-white` (ancre `6da5e42a15ef`). Ce que B6 attendait est parti : `ErrorScreen` (`retry`), `LoadingScreen` (la variante `deep` racontée par l'horloge), `Button` (la bande de 44 px de `sm`), `MetaLabel` (`as`) et `GameEntry` (`eyebrow`). La recherche de dérive a trouvé `NumberField` et `FieldRow`, qui citaient encore les deux messages du moteur réécrits par A15 ; le contrôle ponctuel a trouvé la doc de `MetaLabel` (« ce n'est pas un titre », faux depuis A15.13). **Les douze aperçus du jeu que B4 avait laissés sont régénérés** depuis le modèle : sept étaient justes, cinq ne l'étaient pas (`ShareRow`, `ResumePrompt`, `PatternCatalogue`, `EventClipping`, `VideoCall`). La re-synchro a aussi trouvé A12.i (la boucle inverse du jeu ne porte jamais `?ref=`) et une phrase fausse dans la JSDoc de `DgFace`, corrigée. Le détail est dans `.design-sync/NOTES.md`, « Found in the 2026-10-01 re-sync (B6) ».

**B7 est fait : les puces d'étape** (A15.19, la loi de similarité,
`design/LOIS-UX.md`). Le brief 05 est déposé le 2026-10-01
([#268](https://github.com/ScratchMe/tourdegrowth/pull/268),
[`design/DS-EXTENSION-BRIEF-05.md`](design/DS-EXTENSION-BRIEF-05.md) et ses
dix captures), Antoine l'a lancé dans Claude Design, et **le retour est
recopié le 2026-10-02** ([#270](https://github.com/ScratchMe/tourdegrowth/pull/270)) dans
[`design/ds-extension-05-return/`](design/ds-extension-05-return/README.md) :
22 fichiers, la planche toute en source, rejouée dans Chromium aux huit
cadres (`COPIE.md`). Claude Design n'a rien touché hors de son dossier. **Le
portage (A16) est livré le 2026-10-02**, [#271](https://github.com/ScratchMe/tourdegrowth/pull/271) ; la re-synchro qui l'emporte vers le
projet est B9, faite le même jour.

**B8 : l'index du projet Claude Design, réécrit le 2026-10-01 au soir.** Antoine
ne voyait pas la borne kilométrique dans le projet ; ses captures montraient un
`Bottleneck` et un `LoadingScreen` de septembre. Les fichiers étaient à jour,
mais **l'index du volet Design System (`_ds_manifest.json`) était resté à
l'envoi du 2026-09-11** : 34 cartes sur 90, et les jetons d'avant le design I + B.
Claude Design ne l'a jamais recompilé, malgré six synchros. L'index est réécrit
(90 composants, 90 cartes, 368 jetons) et relu identique en ligne.
`.design-sync/build-manifest.mjs` le régénère à chaque synchro
(`.design-sync/NOTES.md`, « `_ds_manifest.json` »). **Le volet n'a pas bougé
pour autant** (ta vérification, le même soir) : il montre une copie compilée le
2026-09-11, pas les fichiers du projet. **L'agent, lui, lit les fichiers du
jour** : le retour du brief 05 en recopie les jetons, `--radius-tag: 999px`
compris. Tes maquettes sont donc construites sur le design system actuel.
**Le diagnostic** : d'après le texte du skill `/design-sync`, Claude Design
efface la sentinelle `_ds_needs_recompile` et rafraîchit sa copie à chaque
ouverture du projet. Ici, rien de tout cela ne se produit : ni à l'ouverture, ni
avec le bouton « Actualiser », ni en fenêtre privée, et il n'existe ni bouton
« Publier » ni état « brouillon ». La panne date au moins du premier envoi après
le 11 septembre. C'est un défaut de Claude Design, qu'aucun fichier envoyé par
la synchro ne contourne. **Antoine, le 2026-10-01 : « on laisse comme ça, ce n'est pas si dérangeant ».** Le signalement reste prêt (D13) s'il change d'avis. Le portage ne l'attend pas,
puisque l'agent voit le design system à jour.

**B9, ouvert le 2026-10-02 : la re-synchro d'A16.** Ce qu'elle emporte :
`StageScore` et `StageScores` (nouveaux ; leurs aperçus sont écrits sur des
plateaux `clear`, `shared`, `level` et roast que le quiz peut produire ou que
`/r/sample` affiche), `PillarChip` retiré (ses fichiers sortent du projet par
`upload.deletePaths`, qui ne doit rien nommer sous `design/`), `StampedPillar`
et `DefinitionTrigger` redessinés, les aperçus de `GlossaryTerm`,
`DefinitionTrigger`, `StampedPillar`, `StageProfile` et `Tag`, `conventions.md`,
trois jetons de plus (`--score-row-height-md`, `--score-row-height-sm`, `--radius-stamp`) et deux de moins
(`--pad-chip*`). Attendu : 91 composants. Le retour 05, sous `design/` dans le
projet, peut en partir exprès maintenant qu'il est porté (`.design-sync/NOTES.md`,
« Synced ») : à décider avec Antoine au moment de la synchro.
**Faite le 2026-10-02 avec B12, en une seule synchro** ([#289](https://github.com/ScratchMe/tourdegrowth/pull/289)) : 91 composants,
308 cellules, toutes notées bonnes ; `PillarChip` sorti du projet. Deux
aperçus corrigés en route : la feuille en roast et `StampedPillar` dessinaient
les voisins du tampon sans leur « ? », que `ResultView` leur donne.
Antoine a choisi de retirer du projet les briefs 04, 05, 06 et 08 et leurs
retours (171 fichiers, tous dans ce dépôt) ; seul le 07, en cours de portage
(A18), y reste. **B9 est clos.**

**B10, ouvert le 2026-10-02 : le moteur plus simple, sans perdre son
expertise.** Antoine : la saisie du moteur reste « extrêmement dense », au
retour comme dans le pas à pas. Le brief 07
([`design/DS-EXTENSION-BRIEF-07.md`](design/DS-EXTENSION-BRIEF-07.md))
demande à Claude Design de repenser le parcours, pas un composant : ce que
chaque écran montre d'emblée, ce qui reste à un geste, l'ordre des questions,
la première visite et le retour. Il donne la densité mesurée sur un build de
production (l'outil commence à 1 267 px du haut de la page, aux deux visites ;
le tableau de bord fait 2 463 px, 12 blocs et 75 contrôles ; le pas à pas
compte 21 écrans, 38 en hybride), l'inventaire de ce qui existe, ce qui doit
rester (chaque chiffre garde sa définition, sa formule, où le trouver, son
piège et son repère ; seule une cible d'équipe désigne l'étape qui freine),
vingt questions et quinze contraintes. Il exige en retour un `INVENTORY.md`
qui dit où est passé chaque morceau de l'expertise, et un `COPY.md` pour ton
bon à tirer. Seize écrans dans `design/ds-extension-07/`, en français à
1 280 px et en anglais à 390 px, et `CATALOGUE.md`, le texte de chaque chiffre
tel que la page l'imprime. **Déposé le même jour** dans le projet (28 fichiers,
un plan à eux, aucune suppression), lancé par Antoine, et **revenu le même
jour** : recopié dans [`design/ds-extension-07-return/`](design/ds-extension-07-return/README.md),
101 fichiers identiques au caractère près, sauf quatre lignes changées pour CodeQL (`COPIE.md` dit lesquelles et comment), la
planche rejouée sur 162 états. Antoine a tranché C38 et C40 à C42 dessus ;
**son portage est A18**, qui mesure l'après avec le même script
(`scripts/engine-density.capture.ts`). **B10 est clos.**

**B11, ouvert le 2026-10-02 : l'en-tête collant, compact une fois la page
défilée.** Antoine : sur un téléphone tenu droit, l'en-tête collant est
agréable ; sur un écran de bureau, en paysage, il prend trop de place. Il veut
une hauteur réduite au défilement, qui garde de quoi savoir où l'on est, avec
une transition élégante, dessinée par Claude Design. **Mesuré sur un build de
production du jour** : 118 px avec le bandeau, soit 16,4 % d'un écran de
1 280 × 720 et **30,3 % d'un téléphone en paysage** (844 × 390), contre
13,5 % en portrait (114 px). Le problème est la fenêtre en paysage, pas la
fenêtre large. **Le brief 08 est écrit et déposé le même jour** :
[`design/DS-EXTENSION-BRIEF-08.md`](design/DS-EXTENSION-BRIEF-08.md) et ses
seize captures (`design/ds-extension-08/` : l'accueil, le résultat, le
moteur et ses chiffres « Et si » collés sous l'en-tête, le jeu, une page de
lecture, le téléphone en paysage et en portrait, l'en-tête seul sur chaque
sorte de page). Il fixe ce qui doit rester (l'espace où l'on est, le portrait
inchangé, le bouton principal de l'accueil, A15.15, la langue, la course,
44 px, le contraste du verre), la mécanique (rien ne bouge sous l'en-tête,
rien sans JavaScript, mouvement réduit, l'échelle de `motion.css`,
`--sticky-offset` qui suit l'état, le clavier) et pose huit questions, avec
notre penchant : toute fenêtre en paysage, déclenché par la position et non
par le sens du défilement, un changement d'état plutôt qu'un défilement
asservi, une ligne d'environ 56 px. Numéroté 08 parce que le 07 (B10, le
moteur plus simple) était déjà dans le projet. **Lancé par Antoine et revenu
le même jour** : recopié dans
[`design/ds-extension-08-return/`](design/ds-extension-08-return/README.md)
(28 fichiers, avec `COPIE.md`), la planche rejouée sur 252 états sans un
problème. Antoine a tranché C43 et C44 dessus, et **son portage, A19, est
livré le même jour**. Le retour a suivi trois de nos quatre penchants ;
la hauteur diffère : une ligne de 48 px, pas 56. **B11 est clos.**
Ce que ce paragraphe annonçait du quiz était trop étroit : dans l'état plein,
`--sticky-offset` était posé à la main (118, 74), juste au bureau seulement.
Le quiz avait 25 px de trop au bureau, 30 à 390 px de large et 12 à 320 ; sur
un téléphone tenu droit, chaque page en avait 4 (114 et 70 px peints). Rien
n'était masqué. **Mesuré lui aussi depuis le 2026-10-02** (A19.1, [#287](https://github.com/ScratchMe/tourdegrowth/pull/287)), 118 et 74
restant le repli sans script.

**B12, ouvert le 2026-10-02 : la re-synchro d'A19.** Ce qu'elle emporte :
`SiteHeader` (le verre devient une couche à part, la course compacte vit dans
la ligne, son `.prompt.md` dit l'état compact), `SpaceBand` (la course est
sortie en `SpaceRace`, que le bandeau rend et que l'en-tête reprend en
variante compacte ; ses règles de conteneur sont limitées au bandeau),
`Segmented` (`sm` à 42 px de large), deux fichiers de jetons
(`tokens/header.css`, neuf, et `--flip` dans `motion.css`). `SpaceRace` et
`SiteHeaderCompactor` sont hors de l'inventaire (`componentSrcMap` à `null`) :
le premier n'a de sens que dans un en-tête, le second ne rend rien. Un aperçu
de l'état compact demande de poser `data-compact="true"` et les mesures à la
main : à décider au moment de la synchro. Le retour 08, sous `design/` dans le
projet, peut en partir exprès maintenant qu'il est porté.
**Faite le 2026-10-02 avec B9** (le détail est au paragraphe de B9 et dans
`.design-sync/NOTES.md`, « Found in the 2026-10-02 re-sync »). L'état compact
n'a pas de cellule : il est posé par un script au défilement et mesuré, une
carte immobile ne le montre pas ; la documentation de `SiteHeader` le décrit,
avec le filet du cas sans espace qui n'apparaît qu'au défilement depuis A19.
Deux autres aperçus corrigés : `Segmented` (les 42 px de C44), `Disclosure`
(`defaultOpen`, depuis A18 T0, au lieu de l'attribut natif). **B12 est clos.**

**B13, ouvert le 2026-10-02 : la re-synchro d'A18, à la fin de son
portage.** A18 T1 ([#285](https://github.com/ScratchMe/tourdegrowth/pull/285)) est arrivé sur `main` pendant B9 et B12. Il
ajoute cinq composants sous `src/components/engine/` (`NumberSheet`,
`AnswerSwitch`, `TrapNote`, `WhereToFind`, `HowItCompares`) que
`componentSrcMap` ne connaît pas : la construction du paquet échoue sur
`check-inventory` tant qu'ils n'y sont pas, et c'est voulu (un composant
entre dans Claude Design par décision). Il retire aussi de la copie que
trois aperçus citent encore : `Choices` (« Where are you with this
number? », « I have it »), `NumberField` (« Seule une cible d'équipe permet
de dire quelle étape freine. ») et `FieldRow` (sa documentation).
**Le code d'A18 est entier depuis T7 (2026-10-03)**, et B13 emportera :
- les quatorze composants neufs de `src/components/engine/` : les cinq de
  T1, puis `EngineBar`, `NextStep`, `EngineProgress`, `NumberList`,
  `LeverCard`, `EngineStart`, `AskList`, `EngineLanding` et `TotalBand` ;
- les deltas de `Disclosure` et de `BulletChart` (T0) ;
- le retour de focus sans défilement de `DefinitionPopover` (T6) ;
- le champ qui couvre le bord de sa boîte (`Field.module.css`, T7), qui ne
  change aucun rendu.

Les captures du portage sont dans `design/ds-extension-07-after/`. **À
lancer après A18.d** : le bon à tirer peut encore changer la copie que
citent les aperçus écrits à la main. Le brief 07 et son retour pourront
alors quitter `design/` dans le projet.
Elle emportera aussi l'en-tête du jeu, passé à la largeur des deux autres
espaces le 2026-10-02 : les JSDoc de `ProsePage` et de `ContentHeader`, et
deux aperçus retouchés dans le dépôt (la doc de `ContentHeader`, la carte
« Phone » de `SiteHeader` en `wide`). Les cartes ne changent pas de rendu.

**B14, ouvert le 2026-10-03 : le brief 09, l'argent du moteur (A20).**
[`design/DS-EXTENSION-BRIEF-09.md`](design/DS-EXTENSION-BRIEF-09.md)
demande à Claude Design où vit l'argent : le MRR, l'ARR, le MRR dans 12 mois
et « ce que rapporte un client » (le CAC face au LTV, le constat de perte)
sur le tableau, sans défaire ce qu'A18 a allégé ; l'avertissement de
trésorerie (le payback, ce qu'il immobilise, l'alerte quand il est long,
distincte de la perte et sans le rouge de la fuite) ; « Et si » en sommet
(la courbe du MRR, l'ARR, le LTV:CAC, le payback et la trésorerie qui
bougent, l'effet composé, où vit le panneau) ; les slides « Et si » avec leur
courbe et le payback sur la slide d'unit economics, lisibles par un board ou
un investisseur ; la promesse de la page. Les contraintes sont en tête :
jamais de rouge pour une projection (S-5), aucun repère ne désigne (C1), un
chiffre incalculable s'imprime « ? », jamais de LTV ni de payback sans marge,
FR et EN, AA, 390 px, et ne pas re-densifier le tableau. Il donne le modèle
déjà calculé (A20.a), les chiffres du SaaS du film, quatorze questions, les
états attendus, et demande en retour un `INVENTORY.md` (où va chaque
chiffre) et un `COPY.md`. **Vingt et une captures** dans
`design/ds-extension-09/` (le SaaS du film, en français à 1 280 px et en
anglais à 390 px), prises par `scripts/engine-density.capture.ts` (tests
« brief 09 »), avec la densité mesurée : le tableau du film fait 3 438 px et
26 contrôles à 1 280, le levier « Et si » y commence à 3 237 px, et le
panneau ouvert ajoute 1 774 px et 9 contrôles. **Déposé le même jour** ([#306](https://github.com/ScratchMe/tourdegrowth/pull/306)) dans
le projet `23b9671c-…`, aux mêmes chemins sous `design/` (22 fichiers, un
plan à eux, aucune suppression ; ni le bundle ni `_ds_sync.json` touchés),
relu par `get_file` et `list_files`. **Lancé par Antoine et revenu le même
jour** : le retour est recopié dans
[`design/ds-extension-09-return/`](design/ds-extension-09-return/README.md)
(106 fichiers au caractère près, trois lignes corrigées pour CodeQL comme au
retour 07, dit dans son `COPIE.md`), sa planche rejouée (210 états, ses mesures
retrouvées au pixel), et ses décisions posées (C46 à C55). Neuf composants
neufs, `LeverCard` et `TotalBand` changés, aucun composant synchronisé touché
(pas de `*.delta.md`). B14 se ferme avec la re-synchro qui suivra le portage
(A20.f).

**Hors de B13 et de la suite de B14 (A20.f), rien d'ouvert.** La prochaine synchro se lance quand un composant change, ou
quand change une copie, un chiffre du modèle ou un comportement qu'un aperçu
reprend : c'est ainsi que B3 a trouvé l'amende du jeu et les cartes de
`SpaceStrip` restées d'avant A7.8 et A7.9, dans des notes reportées. Ce qu'elle
a trouvé dans le produit (A11, C28 et C29) est livré le soir même.

---

## C. Tes décisions, une par une

Chaque question a :
- **Aujourd'hui** : ce qui est en place ;
- **Source** : où elle vit ;
- **Reco** : la recommandation de la session.

La session qui les pose recopie chaque réponse, avec sa date, à l'endroit où
vit la question. Une réponse qui demande du code devient un item de la
section A, un geste d'Antoine un item de la section D.

### Tranchées : C1 à C55

Les vingt-deux questions de la séance du 2026-09-29, puis C23 à C29 le
2026-09-30, C30 à C33 le 2026-10-01, et C34 et C35 (du retour 05), C36, C37 et C39 (les PR Dependabot), puis C38 et C40 à C42 (du brief 07 et de son retour), et C43 et C44 (du retour 08) le 2026-10-02. **C45 à C55 le 2026-10-03** : les films (C45), puis l'argent du moteur (C46 à C52, et C53 à C55 nées du retour du brief 09), toutes sur la reco, avec deux précisions d'Antoine à C49 : le mot « runway », expliqué par un « ? » (« tes mois de trésorerie »), et, sans runway saisi, un plancher : **un CAC payback de 30 mois ou plus alerte**. Les réponses d'A20 sont dans `docs/engine/argent.md` §20.13, celle des films dans `marketing/motion/README.md`. Chaque réponse est écrite là où vit la
question, et leur index (sujet, réponse, où c'est écrit, suite) est dans
`docs/decisions.md`, où une question tranchée gagne sa ligne.

### Encore ouvert

Rien.

---

## D. Tes actions, pas à pas

Ce qui ne peut venir que de toi. **Jamais de secret dans une conversation**, et
rien de privé dans le dépôt, qui est public. Cela vaut pour les chiffres de
`/admin/stats`, les données d'une mission d'audit et les noms de clients.

| # | Action | Prête ? | Détail |
|---|---|---|---|
| D2 | **Ouvrir le jeu et le moteur à tout le monde** | Non : il faut les bons à tirer nº7 et nº9 (A18.d, qui remplace le nº8) signés et les liens d'ouverture (C7, A7.4) construits. **Pour le moteur, en plus : tout le lot A7.3** (le B2B assisté et l'hybride, décidés le 2026-09-29), bon à tirer compris, **et tout le lot A14** (le moteur complet, C32 Q1) : le code est livré le 2026-10-01, image de partage comprise (T6.2). **Et le lot A18** (le moteur simplifié, 2026-10-02) avec son bon à tirer unique A18.d, qui absorbe ceux d'A7.3 et d'A14 (C38). **Et le portage d'A20** (l'argent du moteur, que montre son film) et son bon à tirer nº10 (C46 et C55, tranchées le 2026-10-03). **Le jeu n'ouvre pas avant le moteur** (C23, 2026-09-30), et sa phrase sur le Digital Fairness Act est remise à jour avant d'ouvrir (section E) | Poser `GAME_ENABLED` et/ou `ENGINE_ENABLED` à `true` dans Vercel (Production), puis **redéployer** (`VERCEL.md` §1.11). Ensuite, la session vérifie la production : pages en 200, sitemap, pied de page, bandeau. Toi, tu demandes l'indexation des nouvelles pages dans Search Console |
| D5 | **Les entretiens, réorientés vers le moteur** (2026-09-30) | **Reportés par Antoine le 2026-09-30, sans date.** La trame attend en annexe d'`ENGINE.md` (validée le même jour). Une session ne les relance pas : c'est lui qui les rouvrira | Cinq à dix PM growth ou Heads of Growth, dans des boîtes où « on score sous 50 ». La question de fond : « quelqu'un taperait-il ses chiffres à la main, et pour obtenir quoi ? ». Ils servaient le Go / No-Go de l'audit ; l'audit étant entre parenthèses (`AUDIT-PLAN.md`, en tête), ils nourrissent le moteur (A7.3, les textes de lancement). **Les notes d'entretien restent hors du dépôt** : noms, entreprises, chiffres ; seule une synthèse anonyme y entre |
| D6 | **La distribution, vague 1** | **Non : rien ne part avant que le moteur et le jeu soient prêts** (C19, 2026-09-29). Rien n'est encore parti. Le Tour n'aura ni Show HN ni r/SaaS | Textes dans `marketing/launch/` et `marketing/campaigns/`. Tu postes sous pseudo, la session fournit et met à jour les textes. Annuaires dans l'ordre de `GROWTH-PLAN.md` 1.6. **Pas de LinkedIn ni de lancement en grande pompe pour l'instant** (C22 : une question de calendrier, pas d'anonymat) |
| D7 | **La distribution, vague 4** | Après deux semaines de lecture de la vague 1 | La session écrit les pitchs de newsletters et passe honnêtement le produit de chaque auteur au Tour ; tu envoies depuis `contact@`. Pour les listes « awesome », seulement si ton profil GitHub n'affiche pas ton nom (à vérifier d'abord sur github.com/ScratchMe) |
| D9 | **La recette du jeu** (`GAME-BRIEF.md` §7.3), avant d'ouvrir le jeu (D2) | Oui, dès que le nº7 est signé | Cinq testeurs qui ne connaissent pas le sujet, et les critères de §7.3. **Chronomètre chaque partie complète** (C13, 2026-09-29) : « vingt minutes » reste si la médiane tombe entre 15 et 25 minutes. Sinon, donne-moi la médiane : une session réécrit l'encart (`content/game/entry.ts:65`) et les textes de lancement. La relecture juridique du catalogue des cas réels est aussi à toi (`marketing/campaigns/README.md` §9) |
| D10 | **Le Tour au seul SEO, maintenant** (C20, 2026-09-29) | **Indexation : il reste les huit adresses des quatre termes de la vente assistée.** **Annuaires : Launching Next soumis le 2026-09-30 ; les suivants peuvent partir**, les captures du Tour sont refaites (A7.12.a, 2026-09-30) | Ce ne sont pas des posts, ils partent sans attendre le moteur et le jeu. 1) Search Console, « Demander l'indexation ». **Fait le 2026-09-29** : `/en` (déjà sur Google), les deux pages « porte ouverte » et les cinq « AARRR vs X » en anglais (aucune n'était sur Google), plus trois `/en/glossary/*` (ex-D8). Le sitemap est lu (74 pages, 2026-09-29). **Le français est fait** (signalé par Antoine le 2026-10-02) : `/fr` était déjà sur Google, et l'indexation des deux pages « porte ouverte » et des cinq « AARRR vs X » en français est demandée. **Reste**, depuis A7.3.e (2026-09-30), une dizaine de demandes par 24 h glissantes, les quatre termes de la vente assistée (en 200 dans les deux langues et dans le sitemap, vérifié le 2026-10-02) : `/en/glossary/win-rate`, `/en/glossary/sales-cycle`, `/en/glossary/acv`, `/en/glossary/lead-to-opportunity`, puis leurs adresses `/fr`. 2) Les annuaires restants de la vague 1, dans l'ordre de `GROWTH-PLAN.md` 1.6, avec les liens `relaunch_tour` de `marketing/kit.md` (`node scripts/utm-link.mjs directory:<slug> /en --campaign relaunch_tour`). Launching Next est fait. **Uneed est soumis le 2026-10-02**, lancement prévu le 2027-02-21. Smol Launch est écarté (badge exigé sur notre site, `marketing/kit.md`). **SaaSHub est soumis le 2026-10-02.** MicroLaunch et StartupBase ne se connectent que par Google ou X : mis de côté jusqu'au compte X de la marque, qui **n'existe pas encore** (le journal du 2026-09-14 le disait créé ; le créer est sans date, `GROWTH-PLAN.md` 0.6). Les suivants : BetaList (par lien magique sur `contact@`), AlternativeTo, puis les trois annuaires IA. Pas de fil X/Bluesky pour le Tour |
| D13 | **Signaler à Anthropic le volet Design System figé** (B8) | Facultatif : laissé en l'état le 2026-10-01 (« ce n'est pas si dérangeant »), prêt si tu changes d'avis | Par le moyen de retour de Claude Design, ou [support.claude.com](https://support.claude.com). Le texte, prêt à coller : *Design-system project 23b9671c-a55b-452e-aa41-39906ee71ba8 ("Tour de Growth"): the Design System pane has not refreshed since the first /design-sync upload on 2026-09-11. Six later uploads (the last on 2026-10-01) wrote current files and re-armed `_ds_needs_recompile`, but opening the project, its Refresh button and a private window all leave the sentinel in place and the pane on the September cards. `_ds_manifest.json` had stayed at the September version (34 cards); rewriting it by hand to 90 cards changed nothing in the pane. The design agent does read the current files: its own copy of `_ds_bundle.css`, taken on 2026-10-02, is current. Expected: opening the project clears the sentinel and shows the new cards.* Dis-moi la réponse : une session la consigne dans `.design-sync/NOTES.md` |

---

## E. La veille : rien à faire avant un déclencheur

| Déclencheur | Ce qu'on fait alors | Où c'est décrit |
|---|---|---|
| **Le 21 février 2027** | Uneed lance la fiche du Tour. Rien à faire, et ne demander aucun vote. Une semaine après, regarder si elle est restée publiée (10 votes) et si `directory_uneed` apparaît dans GoatCounter | `marketing/kit.md` |
| 50 soumissions | Poser `METRICS_PAGE_ENABLED`, publier la page benchmark (vague 2.5), et C2 de `REVIEW-03.md` (l'étape qui freine le plus ce mois-ci) | `CLAUDE.md`, `GROWTH-PLAN.md` |
| Quelques centaines de soumissions | Le percentile, « mieux que X % des Tours » (vague 3.4) | `GROWTH-PLAN.md` |
| Un abus réel | La limite de débit sur un stockage partagé (Upstash) ou le pare-feu Vercel (R-15) | `REVIEW.md` |
| Le Deep dive à ~70 s devient la norme | Réduire le **nombre** de générations, pas le plafond de temps | `GEMINI.md` §2 |
| `eslint-config-next` suit | TypeScript 7 et ESLint 10, testés en installant, pas en lisant les plages de peer. Aujourd'hui, `typescript-eslint` refuse TS ≥ 6.1 et `eslint-plugin-react` plante sur ESLint 10 ; Dependabot les ignore en majeure depuis le 2026-09-08 | `GITHUB.md` §1.7 et §2 |
| Un mois après l'ouverture du jeu | La place de l'encart (C10) et le bouton principal (C16), sur les chiffres | Section C |
| **La Commission clôt l'action CPC contre Temu** (engagements, sanction ou abandon) | Le catalogue du niveau 2 dit l'action « toujours en cours » (`content/game/acquisition.ts`, `patterns.countdown.cas`), vrai au 2026-10-01. Le réécrire d'après la décision publiée, sans présenter un engagement comme une sanction ; copie neuve, donc « à relire » | `GAME-BRIEF.md` §17.9, la page CPC de la Commission (« Market places and digital services ») |
| **La Commission publie sa proposition de Digital Fairness Act** (visée pour novembre 2026) | Rien à lancer : le jeu ne sera pas ouvert (C23). Mais la copie du jeu dit la proposition « attendue fin 2026 » (`content/game/retention.ts:487-488`, et son test `game-retention.test.ts:503`). La réécrire d'après le texte publié, en vérifiant ce qu'il dit vraiment du design addictif et des séries, avant l'ouverture du jeu (D2). C'est une copie neuve, donc « à relire » | `GAME-BRIEF.md` §1 et §3, `marketing/campaigns/README.md` §10 |
| **Juin 2027** | La fenêtre Tour de France (R2-30) : Grand Départ le 2 juillet 2027 à Édimbourg. À construire en juin, pour partir pendant le Tour | `GROWTH-PLAN.md` |
| Une demande d'effacement (RGPD) | Supprimer le document **et** purger le cache CDN de `/r/<id>/*` : l'image de partage (depuis le 2026-09-14) et le badge (A3) y sont gardés un an sous une adresse immuable, et le badge l'est aussi chez GitHub (camo), hors de notre main. Vérifier d'abord comment Vercel purge par chemin. Relevé par la relecture de sécurité d'A3 | `legal.ts`, `VERCEL.md` §1.8 |
| Des badges en 429 dans des README | Le proxy compte `/r/<id>/…` dans le budget de lectures (120 par 10 minutes et par IP) **avant** le cache CDN, et les images d'un README passent par les quelques IP de camo. Mesurer avant de conclure ; si c'est réel, sortir `/r/<id>/badge/…` du budget, puisque la route ne lit Firestore qu'au premier passage | `src/proxy.ts`, `isResultReadPath` |
| Une facture Vercel qui surprend | `VERCEL.md` §1.6 et §2.2 | `VERCEL.md` |
| **Un `@google-cloud/firestore` 9.x demande `@google-cloud/firestore-api` ≥ 0.4** (`npm view @google-cloud/firestore dependencies`), ou une alerte de sécurité sur `firebase-admin` 14.3 | Retirer l'exclusion de `firebase-admin` de `dependabot.yml` et laisser Dependabot proposer la montée. Mesurer le poids hors ligne avant de la prendre : elle ne passe seule que si les bundles serveur ne grossissent plus (C36 : +11,4 Mo par déploiement, pour deux `google-gax`). Une alerte de sécurité se décide avec Antoine, poids en main | `.github/dependabot.yml`, `VERCEL.md` §2.2 |
| Besoin de `guidelines/` du bundle d'extension 01 | Le demander à Claude Design (son README l'annonce, l'archive ne le contenait pas) | `design/ds-extension-01-return/README.md` |
| Un contrat de largeur qui descend à 320 px | À 320 px, le bandeau d'entrée au jeu passe sur trois lignes (la seconde, ≈ 270 px de texte, pour une colonne de 244). Laissé par décision d'Antoine (2026-09-29) : seule une copie plus courte le tiendrait. 360 px est réglé depuis le même jour. `/r/<id>` tient depuis 320 px depuis le 2026-10-02, dans les quatre états de l'en-tête (exemple, roast, Deep dive, les deux) vus en visiteur, et jusqu'à 1 280 sans défilement de côté, tablettes en portrait comprises (A16 pour la feuille de score, puis [#273](https://github.com/ScratchMe/tourdegrowth/pull/273) : sur téléphone, le tag Deep dive et le badge roast descendent en tête de page, et les cartes de forces et de faiblesses ne se mettent côte à côte que si chacune a 240 px, ce qui supprime le débordement de 8 px à 761 px ; `e2e/result-header.spec.ts`). Hors contrat (`DESIGN-BRIEF.md` fixe 390 et exige 375-430) | `game/GameEntry.module.css` |

Un relevé par `stats.yml`, une fois par mois, suffit à voir passer les trois
premiers. La méthode est la ligne « Lecture des stats par la session » de
`CLAUDE.md`. **Aucun chiffre n'entre dans le dépôt** : on n'y écrit que
« atteint », « présent » ou « absent ». Le premier relevé date du 2026-09-29
(`JOURNAL.md`) : aucun des trois n'était atteint.

---

## Les prompts

À copier dans une nouvelle session. Chaque prompt suppose `main` à jour :
ce fichier doit y être avant de lancer.

### Prompt A — le travail autonome (une session par lot)

Remplace `A1` par le lot voulu. Pour enchaîner plusieurs lots dans une même
session, écris « les lots A1 à A3, dans l'ordre, une PR par lot ».

```text
Tu reprends Tour de Growth en autonomie sur le lot A1 de CHANTIERS.md.

1. Lis CLAUDE.md (chargé d'office), la section A de CHANTIERS.md et ton lot, puis les fichiers d'outil que ses déclencheurs imposent (VERCEL.md avant tout merge, TESTING.md avant d'annoncer quoi que ce soit comme vérifié, FIRESTORE.md si tu ajoutes une lecture publique).
2. Re-mesure chaque constat avant d'y toucher : les chiffres datent du 2026-09-29. Un constat déjà résolu se retire, il ne se corrige pas.
3. Crée ta branche depuis origin/main avant la première édition.
4. Chaque correctif a son test ou sa garde, et sa non-vacuité. Vérifie à l'écran, en français et en anglais, à 1280 et 390 px. Toute copie neuve porte « // TODO: à relire (convention 6). ».
5. Avant la PR : tsc, lint, vitest --coverage, build avec GAME_ENABLED=true NEXT_PUBLIC_GOATCOUNTER_CODE=e2e-stub ADMIN_DASHBOARD_PASSWORD=e2e-admin, Playwright complet, et les relecteurs qui s'appliquent (relecteur-securite pour une route, le proxy ou un payload ; relecteur-copie pour de la copie).
6. Une PR par lot. Merge-la toi-même quand elle est verte, en suivant /livrer (lu, pas appelé), sauf si sa barrière §0 dit de me demander. Vérifie en production.
7. Si tu rencontres une question produit ou de design, ne la tranche pas : ajoute-la en section C de CHANTIERS.md avec ta recommandation, et continue le reste.
8. À la fin : retire de CHANTIERS.md ce qui est livré, ajoute l'entrée de JOURNAL.md, mets à jour CLAUDE.md si l'état courant change.

Réponds-moi en français, court : ce qui est livré, ce qui est vérifié et comment, ce qui reste.
```

### Prompt B — la design sync (session cloud ou locale)

```text
Mission : la section B de CHANTIERS.md, sur une branche (jamais main).

1. Lis .design-sync/NOTES.md en entier avant toute commande : ce dépôt est une app, pas un paquet de composants. Les sections « The emitted contracts come from dist/types », « The four standing validate warnings », « Synced » et « Re-sync risks » disent ce qui a coûté du temps.
2. Lance /design-sync pour mettre à jour le projet Claude Design existant (23b9671c-a55b-452e-aa41-39906ee71ba8), sans en créer un nouveau. Lance cfg.buildCmd avant le driver. Recompte les composants, les cellules et les aperçus rendus : au 2026-09-30 (B3), c'était 88, 292 et 88/88. Quatre avertissements sont attendus (« Impact », GRID_OVERFLOW sur DefinitionPopover, QuarterNews et GlossaryTerm) ; n'applique pas le cardMode "single" suggéré. Tout autre avertissement ou erreur : arrête-toi et explique-moi avant de corriger.
3. Note chaque cellule que le driver met en attente, et recapture en contrôle les composants dont le code a changé sans que leur aperçu change. Cherche aussi ce qui a changé dans le modèle et la copie depuis le dernier envoi (la méthode est dans NOTES.md, « Re-sync risks ») : une note reportée ne voit pas une amende qui change dans levels/retention.ts. Une cellule qui rend proprement mais dit quelque chose de faux est un défaut : corrige l'aperçu depuis les sources du produit, jamais de mémoire.
4. Après le convertisseur et avant _ds_sync.json, régénère l'index du volet : node .design-sync/build-manifest.mjs --bundle ./ds-bundle, et mets _ds_manifest.json dans le plan d'envoi. Claude Design ne le recompile pas, et sans lui le volet reste sur l'ancien design system (B8). Après l'envoi, relis-le avec get_file : autant de cartes que de composants.
5. À la fin : mets à jour la section B de CHANTIERS.md, la ligne « Design system → Claude Design » de CLAUDE.md, « Synced » dans NOTES.md, et une entrée de JOURNAL.md. Ouvre la PR ; merge-la quand elle est verte.

Réponds-moi en français.
```

### Prompt C — tes décisions, une par une

```text
Tu es là pour me faire trancher, une par une, les décisions de la section C de CHANTIERS.md. Tu n'écris pas de code.

1. Lis CLAUDE.md, la section C, et pour chaque question sa source.
2. Avant de poser une question, vérifie qu'elle est encore ouverte : dans le code, le journal et le document source.
3. Pose-les une par une avec AskUserQuestion, dans l'ordre. Pour chacune : ce que c'est, ce qui est en jeu, ce qui est en place aujourd'hui, ta recommandation en premier avec « (Recommandé) », et ce qu'on casse si on se trompe. Une question de design se pose avec une capture du vrai écran (build local avec GAME_ENABLED et ENGINE_ENABLED, ou l'aperçu propriétaire), pas avec sa description.
4. Après chaque réponse, consigne-la tout de suite, datée, là où vit la question (ENGINE.md, marketing/campaigns/README.md, CHANTIERS.md), puis passe à la suivante. « On verra » se note aussi.
5. Toute réponse qui demande du code devient un item de la section A de CHANTIERS.md, assez précis pour qu'une session autonome le fasse sans me reposer la question. Toute réponse qui demande un geste de ma part devient un item de la section D.
6. À la fin : chaque question tranchée sort de « Encore ouvert » et gagne sa ligne dans docs/decisions.md ; mets à jour la ligne « Décisions qui attendent Antoine » de CLAUDE.md, ajoute l'entrée de JOURNAL.md, ouvre une PR de doc seule et merge-la quand elle est verte (/livrer lu, pas appelé).

Réponds-moi en français.
```

### Prompt D — tes actions, pas à pas

```text
Tu m'accompagnes pas à pas dans les actions qui ne peuvent venir que de moi : la section D de CHANTIERS.md.

1. Lis CLAUDE.md, la section D, et pour chaque action sa source (AUDIT-PLAN.md §4, GROWTH-PLAN.md, marketing/, VERCEL.md §1.11).
2. Commence par me dire ce qui est prêt maintenant et ce qui attend quelque chose. Demande-moi ensuite par quoi on commence (AskUserQuestion).
3. Une action à la fois, en étapes courtes : où aller, quoi cliquer ou taper, ce que je dois voir. Attends ma confirmation avant l'étape suivante.
4. Vérifie toi-même tout ce qui se vérifie d'ici (la production par curl, GitHub par l'API, les stats par le workflow chiffré) et dis-moi ce que tu as constaté. Pour le reste, demande-moi ce que je vois.
5. Ne me demande jamais un mot de passe, une clé ou un secret. Rien de privé ne va dans le dépôt : il est public (chiffres de /admin/stats, données d'une mission d'audit, noms de clients).
6. Promotion : pas de LinkedIn ni de lancement en grande pompe pour l'instant, c'est une question de calendrier, pas d'anonymat (C22, `GROWTH-PLAN.md` option A). Tu fournis les textes, je poste sous le compte du projet.
7. Quand une action est faite : retire-la de CHANTIERS.md, mets à jour CLAUDE.md si l'état change, ajoute l'entrée de JOURNAL.md ; PR de doc seule, mergée quand elle est verte. Si une action révèle du code à écrire, ne l'écris pas ici : ajoute-le en section A.

Réponds-moi en français.
```

### Prompt E — le moteur à la hauteur de son film (A20)

Écrit le 2026-10-03 avec les films (`marketing/motion/`). **Lancé le même
jour** : la spécification (`ENGINE.md` §20), le modèle pur (A20.a), le brief 09
(B14) et C46 à C52 sont livrés. Au retour du brief 09, le prompt F.

```text
Tu reprends Tour de Growth sur une mission neuve : mettre le moteur de growth à la hauteur de son film, le lot A20 de CHANTIERS.md. Le film « Le moteur » (44 s) est dans l'artifact https://claude.ai/artifact/MDSptVBYtkDuT8vFPJW49Z, onglet « Le moteur », storyboard dessous. Lis-le avec l'outil Artifact, pas avec WebFetch. Sa source et ses chiffres d'exemple sont dans marketing/motion/.

L'écart est relevé dans CHANTIERS.md, A20 (déjà là, manque 1 à 5, caché, et le point où le film a tort). Il date du 2026-10-03, sur 9c81844 : re-vérifie chaque ligne avant d'y toucher (convention 10). Une ligne déjà résolue se retire, elle ne se corrige pas.

1. Lis ENGINE.md (dont le bloc A18), docs/engine/v1.md (§5.7 et §6.8), docs/engine/moteur-complet.md, docs/engine/assiste-et-hybride.md (l'assisté a son propre payback), design/LOIS-UX.md, la fiche cac-payback de src/content/glossary-deep.ts, lib/engine/scenario.ts, unit-economics.ts, findings.ts, example.ts, _engine/WhatIfPanel.tsx, BoardLever.tsx, Board.tsx, les slides deck/SlideWhatIf, SlideScenario et SlideUnitEconomics, marketing/motion/README.md, et design/ds-extension-07-return/README.md : il dit pourquoi le tableau a été allégé, et ce qu'il ne faut pas re-densifier.
2. Découpe A20 en étapes (le modèle, puis le portage), ouvre l'entrée B du brief 09, et pose en section C les questions ci-dessous avec ta recommandation. Prends les prochains numéros libres, vérifiés dans le fichier (convention 8 ; C45 est prise par les films). Ne tranche rien toi-même :
   - l'ouverture du moteur attend-elle ce lot ?
   - où l'ARR s'affiche-t-il ?
   - le constat de perte : sa formulation, sa place, et peut-il titrer la première slide ?
   - l'alerte de payback long : qu'est-ce qui la déclenche ? Options : une trésorerie de l'équipe en mois (saisie facultative, l'alerte quand le payback la dépasse), une cible de payback de l'équipe, ou les repères du glossaire (12 mois pour un SaaS vendu aux petites entreprises, 18 à 24 mois en vente entreprise). Ces repères situent sans désigner (C1). Sa formulation, et sa différence avec le constat de perte ;
   - faut-il donner une marge à l'exemple intégré (golden-v1 et golden-v2 bougeraient) ?
   - « Et si » doit-il être déplié par défaut ?
   - board et investisseurs dans la promesse ?
3. Écris la spécification (une section d'ENGINE.md, ou un fichier sous docs/engine/ avec un renvoi). Elle dit pour chaque ajout : la formule, les intervalles, les cas incalculables, les hypothèses imprimées.
4. Crée ta branche depuis origin/main, puis code en pur, dans src/lib/engine, avec tests et non-vacuité, ce qui ne dépend pas du design :
   a. l'ARR (MRR × 12) aujourd'hui et dans 12 mois, en intervalle comme le reste ;
   b. la trajectoire du MRR sur 13 points, aujourd'hui et avec les « Et si », tirée de la même boucle que twelveMonths : le MRR dans 12 mois est son dernier point, une seule source ;
   c. le LTV:CAC dans ScenarioKpis, aujourd'hui et projeté ;
   d. un constat de perte quand le LTV est entièrement sous le CAC (borne haute du LTV sous la borne basse du CAC). Il dit « peut-être » quand les intervalles se chevauchent, et rien quand une entrée manque. Ce n'est pas un repère (C1), c'est de l'arithmétique sur les chiffres de l'équipe, et il ne désigne aucune étape ;
   e. le payback face à la trésorerie, en deux faits toujours calculables sans repère :
      - le payback face à la durée de vie d'un client (1 ÷ churn, le plafond de 36 mois de lifetimeMonths compris) ;
      - la trésorerie que le rythme d'acquisition du mois immobilise avant de revenir (nouveaux payants × CAC, étalés sur le payback). Spécifie la formule et imprime ses hypothèses : remboursement linéaire ; le churn qui allonge le retour n'est pas compté, donc c'est un minimum.
      Puis l'alerte elle-même, codée derrière la règle que je trancherai : sans choix de ma part, ne code que les deux faits. Par motion : le libre-service et l'assisté ont chacun leur payback. Dans « Et si », le payback et la trésorerie bougent avec les leviers qui les touchent (ARPA, activation à dépense égale, etc. : vérifie dans scenario.ts lesquels).
   Pas d'écran neuf avant le retour de Claude Design.
5. Écris design/DS-EXTENSION-BRIEF-09.md sur le modèle du 07. Joins les captures de l'état actuel dans design/ds-extension-09/ (FR à 1 280 px, EN à 390 px), avec la densité mesurée par scripts/engine-density.capture.ts. Le brief demande à Claude Design :
   - l'argent sur le tableau : MRR, ARR, MRR dans 12 mois au rythme actuel, et « ce que rapporte un client » (le CAC face au LTV, le constat de perte), sans défaire ce qu'A18 a allégé ;
   - l'alerte de trésorerie : le payback, ce qu'il immobilise, et l'avertissement quand il est long. C'est un avertissement, pas une alarme : il se distingue du constat de perte (on gagne de l'argent, mais tard) et ne prend pas le rouge de la fuite ;
   - « Et si » en sommet : la courbe du MRR, l'ARR, le LTV:CAC, le payback et la trésorerie qui bougent, l'effet composé lisible, et où le panneau vit ;
   - la slide « Et si » avec sa courbe, et la place du payback et de la trésorerie sur la slide d'unit economics, lisibles par un board ou un investisseur ;
   - la promesse de la page.
   En tête du brief, les contraintes : jamais de rouge pour une projection (S-5) ; aucun repère ne désigne (C1) ; un chiffre incalculable s'imprime « ? », jamais 0 ; sans marge, pas de LTV ni de payback (jamais calculés sur le revenu) ; FR et EN ; contraste AA ; 390 px. Livrables demandés : les écrans en FR à 1 280 et en EN à 390, un COPY.md pour le bon à tirer, un INVENTORY.md qui dit où va chaque chiffre.
   Dépose le brief dans le projet Claude Design 23b9671c-a55b-452e-aa41-39906ee71ba8, comme pour les briefs 07 et 08, puis arrête-toi : c'est moi qui le lance.
6. Une PR pour la spécification, le modèle et le brief. Merge-la quand elle est verte en suivant /livrer (lu, pas appelé). Ajoute l'entrée de JOURNAL.md à la fin.

Réponds-moi en français, court : l'écart que tu as confirmé ou corrigé, ce qui est codé et vérifié, les questions posées, et ce que je dois faire dans Claude Design.
```

### Prompt F — au retour du brief 09 (A20)

**Lancé le 2026-10-03** : le retour est recopié et C46 à C55 sont posées. Le
portage (A20.d à A20.g) reprend avec ce même prompt une fois qu'elles sont
tranchées.

```text
Le retour du brief 09 est dans le projet Claude Design. Recopie-le dans design/ds-extension-09-return/ comme pour le 07, compare-le au brief, et pose-moi en section C de CHANTIERS.md les décisions qu'il demande, avec ta recommandation.

Une fois que je les ai tranchées, porte-le (le lot A20, une PR par étape, ENGINE_ENABLED fermé) :
- chaque écran vérifié en FR et en EN, à 1 280 et 390 px ;
- la densité mesurée avec scripts/engine-density.capture.ts, avant contre après ;
- toute copie neuve en « TODO: à relire », ajoutée au bon à tirer que j'aurai choisi (le nº9 ou un nº10) ;
- puis la re-synchro (prompt B) ;
- et le film « Le moteur » remis d'accord avec le moteur porté (marketing/motion/, son README dit comment republier la page et réexporter les MP4) : les vrais écrans, aucune projection en rouge, et l'alerte de trésorerie si tu l'as retenue.

Réponds-moi en français, court.
```
