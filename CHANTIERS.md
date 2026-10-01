# CHANTIERS.md — ce qui reste à faire, et qui le fait

*Établi le 2026-09-29, après la mise en production de #184 ; allégé le
2026-10-01 de ce qui était clos (A10, A11, l'index des décisions, parti dans
`docs/decisions.md`). Hors bons à tirer
(nº4, nº7, nº8 et les libellés que `CLAUDE.md` liste « hors de tout bon à
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
| **A. Le travail autonome**, en quatre lots | Une session seule, une PR par lot (A7 : une PR par item) | Session cloud | A1 à A6 livrés le 2026-09-29, A7 et A8 le 2026-09-30. **Reste d'A7** : A7.3.d (le bon à tirer de la copie neuve), A7.4 après A7.3, et A7.12.c à l'ouverture. **A7.3.c est livré le 2026-10-01**, les textes de lancement de la ligne « Hors code » d'A7.3 le même jour (S0 à S5, PR d'intégration [#233](https://github.com/ScratchMe/tourdegrowth/pull/233), drapeau fermé). A10 (S-15), A11 et A7.3.e (les quatre termes du glossaire) livrés le 2026-09-30. **A12, le niveau 2 du jeu** : spécifié et chiffré le 2026-09-30, **validé le 2026-10-01 (C30)**, sa copie, l'îlot partagé, le téléphone de Pédalix et le branchement faits le même jour (A12.c à A12.f.2)  et ses specs (A12.g) : reste A12.h (le bon à tirer, puis la recette). **A14, le moteur complet** : spécifié le 2026-10-01, attend C31. **A13** (trois alertes de dépendances, dont une critique sur `next`) livré le 2026-10-01 |
| **B. Design sync** | Une session, cloud ou locale | N'importe où : une session cloud pousse vers Claude Design depuis le 2026-09-29 | **À jour le 2026-09-30, après A7.10, A10 et A11** (B3, puis la re-synchro d'A11 le soir même : 88 composants, 292 cellules, 88 aperçus sur 88 rendus). Rien à lancer tant qu'un composant, ou une copie qu'un aperçu reprend, ne change pas |
| **C. Tes décisions**, une par une | Toi, guidé, avec une recommandation par question | N'importe quelle session | **Tranchées le 2026-09-29** (C18 close à part, par la session D). C23 à C29 tranchées le 2026-09-30, C26 à C29 livrées le même jour, **C25** (la spécification de A7.3, `ENGINE.md` §18) dans sa propre session. **C30** (le niveau 2 du jeu, `GAME-BRIEF.md` §17) le 2026-10-01. **C31 est ouverte** (le moteur complet, `docs/engine/moteur-complet.md` §19.15) |
| **D. Tes actions**, pas à pas | Toi, accompagné | Session cloud | Selon ce qui est prêt. D10 (l'indexation) est prêt tout de suite. D2 attend les bons à tirer nº7 et nº8, la recette (D9) et, pour le moteur, la fin d'A7.3 (le code et les textes de lancement sont livrés le 2026-10-01 ; reste le bon à tirer A7.3.d) |
| **E. La veille** | Personne | — | Rien à lancer avant un déclencheur |

**L'ordre conseillé** : A7.3.d (le bon à tirer de la copie neuve du moteur,
`/bon-a-tirer`), A7.4, puis D. A7.3.c, les textes de lancement d'A7.3 (ligne
« Hors code ») et A13 (l'alerte critique sur `next`) sont livrés le
2026-10-01. A7.3.e, qui se menait en parallèle, est livré le
2026-09-30. Le niveau 2 du jeu (A12.h, avec Antoine) peut avancer en
parallèle : il ne touche pas les mêmes fichiers. Le moteur ouvre avant le jeu (C23). Dans la
section C, C31 attend (le moteur complet, A14) ; C30 est tranchée le 2026-10-01.

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
| A7.3.d | **Le bon à tirer** de la copie neuve | Par l'agent des bons à tirer, avec `/bon-a-tirer`, construit depuis le code, **les quatre termes d'A7.3.e compris** |
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

### A14 — Le moteur complet, pour le SaaS B2B (C31 ouverte le 2026-10-01)

Antoine a demandé le 2026-10-01 de faire tout ce qui manque encore au moteur
pour le SaaS B2B, avant l'app grand public et la place de marché : « on
devrait gérer tout ce que tu listes dans le point 3 ». Onze chantiers : la
série mensuelle, la rétention J30 et la part recommandée en €, la couverture
du pipeline, les outils au réglage et le contrôle « deux outils », coller un
tableau, plusieurs moteurs par appareil, la fusion à l'import, le fond blanc,
les rappels `.ics`, deux portes d'entrée et l'image de partage. L'export
PowerPoint reste hors du lot. La spécification est dans
`docs/engine/moteur-complet.md` (§19). **L'ouverture du moteur ne l'attend
pas** (Q1, à confirmer) : A14 vit sur sa branche d'intégration jusqu'à son
propre bon à tirer. Toute copie neuve porte « TODO: à relire » (convention 6).

| # | Quoi | Détail |
|---|---|---|
| A14.a | **La spécification** | **Écrite le 2026-10-01**, contre le code de `main` : §19.0 à §19.14, et dix-neuf questions en §19.15 |
| A14.b | **La validation par Antoine** | C31 : les questions de §19.15, une par une pour les plus lourdes (Q1, Q2, Q6, Q8, Q13), les autres en bloc. Les réponses se datent en §19.15 |
| A14.c | **Le code** | Après C31 : T0 à T7 sur une branche d'intégration, un seul merge (§19.14), ~16,5 jours-agent. T0 (le socle v3) d'abord, puis T1 à T6 en parallèle, T7 pour finir |
| A14.d | **Le bon à tirer de la copie neuve** | Après A14.c, avant le merge, construit depuis `grep -rn "TODO: à relire" src/` |

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

**B4, ouvert le 2026-10-01 : la re-synchro du niveau 2**, prête à lancer depuis A12.f.2.
A12.d a renommé des emplacements dans le contrat de six composants du jeu
(`Dashboard` : `metric`, `customers`, `revenue` ; `EndingCharts` et
`RevealCells` : `metric` ; `QuarterReport` : les clés de ses chiffres ;
`ActionBar` : `pill` ; `GameEntry` : `band.metric`). Les aperçus de
`.design-sync/previews/` sont à jour et vérifiés au type près, mais **Claude
Design montre encore les anciens noms**. A12.e ajoute deux composants neufs,
`ShopPhone` (le téléphone de Pédalix) et `BasketPill` (sa pastille), et retouche
`PhoneMock` (son cadre est maintenant partagé) ; A12.f.1 donne à `NextLevel` un
`href` (le bloc de décembre devient un lien vers l'autre niveau, deux aperçus
neufs) ; A12.f.2 fait proposer plusieurs niveaux à `GameEntry` (`levels`, deux aperçus neufs). Une seule
synchro pour tout, avec la recapture des composants touchés (`.design-sync/NOTES.md`, « Synced »).

**Hors de B4, rien d'ouvert.** La prochaine synchro se lance quand un composant change, ou
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

### Tranchées : C1 à C30

Les vingt-deux questions de la séance du 2026-09-29, puis C23 à C29 le
2026-09-30 et C30 le 2026-10-01. Chaque réponse est écrite là où vit la
question, et leur index (sujet, réponse, où c'est écrit, suite) est dans
`docs/decisions.md`, où une question tranchée gagne sa ligne.

### Encore ouvert

**C31 — Le moteur complet (A14), posée le 2026-10-01.**
- **Aujourd'hui** : le moteur couvre le SaaS B2B (libre-service, assisté ou les deux) sur un seul mois, un moteur par appareil, sans outils au réglage ni rappel.
- **Source** : `docs/engine/moteur-complet.md` §19.15, dix-neuf questions.
- **Reco** : les dix-neuf recommandations telles quelles. Les plus lourdes, à trancher une par une : Q1 (l'ouverture n'attend pas A14), Q2 (le mois suivant reprend les cibles et les définitions, jamais une valeur), Q6 (la rétention J30 en €), Q8 (la couverture du pipeline) et Q13 (la fusion à l'import).

C25 est tranchée le 2026-09-30 et C30 le 2026-10-01 (`docs/decisions.md`).

---

## D. Tes actions, pas à pas

Ce qui ne peut venir que de toi. **Jamais de secret dans une conversation**, et
rien de privé dans le dépôt, qui est public. Cela vaut pour les chiffres de
`/admin/stats`, les données d'une mission d'audit et les noms de clients.

| # | Action | Prête ? | Détail |
|---|---|---|---|
| D2 | **Ouvrir le jeu et le moteur à tout le monde** | Non : il faut les bons à tirer nº7 et nº8 signés et les liens d'ouverture (C7, A7.4) construits. **Pour le moteur, en plus : tout le lot A7.3** (le B2B assisté et l'hybride, décidés le 2026-09-29), bon à tirer compris. **Le jeu n'ouvre pas avant le moteur** (C23, 2026-09-30), et sa phrase sur le Digital Fairness Act est remise à jour avant d'ouvrir (section E) | Poser `GAME_ENABLED` et/ou `ENGINE_ENABLED` à `true` dans Vercel (Production), puis **redéployer** (`VERCEL.md` §1.11). Ensuite, la session vérifie la production : pages en 200, sitemap, pied de page, bandeau. Toi, tu demandes l'indexation des nouvelles pages dans Search Console |
| D5 | **Les entretiens, réorientés vers le moteur** (2026-09-30) | **Reportés par Antoine le 2026-09-30, sans date.** La trame attend en annexe d'`ENGINE.md` (validée le même jour). Une session ne les relance pas : c'est lui qui les rouvrira | Cinq à dix PM growth ou Heads of Growth, dans des boîtes où « on score sous 50 ». La question de fond : « quelqu'un taperait-il ses chiffres à la main, et pour obtenir quoi ? ». Ils servaient le Go / No-Go de l'audit ; l'audit étant entre parenthèses (`AUDIT-PLAN.md`, en tête), ils nourrissent le moteur (A7.3, les textes de lancement). **Les notes d'entretien restent hors du dépôt** : noms, entreprises, chiffres ; seule une synthèse anonyme y entre |
| D6 | **La distribution, vague 1** | **Non : rien ne part avant que le moteur et le jeu soient prêts** (C19, 2026-09-29). Rien n'est encore parti. Le Tour n'aura ni Show HN ni r/SaaS | Textes dans `marketing/launch/` et `marketing/campaigns/`. Tu postes sous pseudo, la session fournit et met à jour les textes. Annuaires dans l'ordre de `GROWTH-PLAN.md` 1.6. **Pas de LinkedIn ni de lancement en grande pompe pour l'instant** (C22 : une question de calendrier, pas d'anonymat) |
| D7 | **La distribution, vague 4** | Après deux semaines de lecture de la vague 1 | La session écrit les pitchs de newsletters et passe honnêtement le produit de chaque auteur au Tour ; tu envoies depuis `contact@`. Pour les listes « awesome », seulement si ton profil GitHub n'affiche pas ton nom (à vérifier d'abord sur github.com/ScratchMe) |
| D9 | **La recette du jeu** (`GAME-BRIEF.md` §7.3), avant d'ouvrir le jeu (D2) | Oui, dès que le nº7 est signé | Cinq testeurs qui ne connaissent pas le sujet, et les critères de §7.3. **Chronomètre chaque partie complète** (C13, 2026-09-29) : « vingt minutes » reste si la médiane tombe entre 15 et 25 minutes. Sinon, donne-moi la médiane : une session réécrit l'encart (`content/game/entry.ts:65`) et les textes de lancement. La relecture juridique du catalogue des cas réels est aussi à toi (`marketing/campaigns/README.md` §9) |
| D10 | **Le Tour au seul SEO, maintenant** (C20, 2026-09-29) | **Indexation : il reste le français**, dès que le quota de Search Console le permet. **Annuaires : Launching Next soumis le 2026-09-30 ; les suivants peuvent partir**, les captures du Tour sont refaites (A7.12.a, 2026-09-30) | Ce ne sont pas des posts, ils partent sans attendre le moteur et le jeu. 1) Search Console, « Demander l'indexation ». **Fait le 2026-09-29** : `/en` (déjà sur Google), les deux pages « porte ouverte » et les cinq « AARRR vs X » en anglais (aucune n'était sur Google), plus trois `/en/glossary/*` (ex-D8). Le sitemap est lu (74 pages, 2026-09-29). **Reste**, le quota étant dépassé le 2026-09-30 au matin (une dizaine de demandes par 24 h glissantes) : `/fr` (déjà sur Google), `/fr/growth-audit-checklist`, `/fr/startup-growth-diagnostic`, `/fr/aarrr-vs-north-star-metric`, `/fr/aarrr-vs-rarra`, `/fr/aarrr-vs-growth-loops`, `/fr/aarrr-vs-okr`, `/fr/aarrr-vs-heart`, et depuis A7.3.e (2026-09-30) les quatre termes de la vente assistée : `/en/glossary/win-rate`, `/en/glossary/sales-cycle`, `/en/glossary/acv`, `/en/glossary/lead-to-opportunity`, puis leurs adresses `/fr`. 2) Les annuaires restants de la vague 1, dans l'ordre de `GROWTH-PLAN.md` 1.6, avec les liens `relaunch_tour` de `marketing/kit.md` (`node scripts/utm-link.mjs directory:<slug> /en --campaign relaunch_tour`). Launching Next est fait. Pas de fil X/Bluesky pour le Tour |

---

## E. La veille : rien à faire avant un déclencheur

| Déclencheur | Ce qu'on fait alors | Où c'est décrit |
|---|---|---|
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
| Besoin de `guidelines/` du bundle d'extension 01 | Le demander à Claude Design (son README l'annonce, l'archive ne le contenait pas) | `design/ds-extension-01-return/README.md` |
| Un contrat de largeur qui descend à 320 px | À 320 px, le bandeau d'entrée au jeu passe sur trois lignes (la seconde, ≈ 270 px de texte, pour une colonne de 244). Laissé par décision d'Antoine (2026-09-29) : seule une copie plus courte le tiendrait. 360 px est réglé depuis le même jour. De même, `/r/<id>` déborde de 37 px à 320 px (le `PillarChip`) : hors contrat (`DESIGN-BRIEF.md` fixe 390 et exige 375-430), laissé par Antoine | `game/GameEntry.module.css`, `result/PillarChip.module.css` |

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
4. À la fin : mets à jour la section B de CHANTIERS.md, la ligne « Design system → Claude Design » de CLAUDE.md, « Synced » dans NOTES.md, et une entrée de JOURNAL.md. Ouvre la PR ; merge-la quand elle est verte.

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
