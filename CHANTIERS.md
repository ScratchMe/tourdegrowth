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
| **A. Le travail autonome**, en quatre lots | Une session seule, une PR par lot (A7 : une PR par item) | Session cloud | A1 à A6 livrés le 2026-09-29, A7 et A8 le 2026-09-30. **Reste d'A7** : A7.3.c (le code) et A7.3.e (les quatre termes du glossaire), **prêts depuis C25** (2026-09-30), A7.3.d après A7.3.c, A7.4 après A7.3, et A7.12.c à l'ouverture. A10 (S-15) et A11 livrés le 2026-09-30. **A12, le niveau 2 du jeu** : spécifié et chiffré le 2026-09-30, la construction attend C30 |
| **B. Design sync** | Une session, cloud ou locale | N'importe où : une session cloud pousse vers Claude Design depuis le 2026-09-29 | **À jour le 2026-09-30, après A7.10, A10 et A11** (B3, puis la re-synchro d'A11 le soir même : 88 composants, 292 cellules, 88 aperçus sur 88 rendus). Rien à lancer tant qu'un composant, ou une copie qu'un aperçu reprend, ne change pas |
| **C. Tes décisions**, une par une | Toi, guidé, avec une recommandation par question | N'importe quelle session | **Tranchées le 2026-09-29** (C18 close à part, par la session D). C23 à C29 tranchées le 2026-09-30, C26 à C29 livrées le même jour, **C25** (la spécification de A7.3, `ENGINE.md` §18) dans sa propre session. **Reste C30**, la validation du niveau 2 du jeu (`GAME-BRIEF.md` §17), avec son propre prompt |
| **D. Tes actions**, pas à pas | Toi, accompagné | Session cloud | Selon ce qui est prêt. D10 (l'indexation) est prêt tout de suite. D2 attend les bons à tirer nº7 et nº8, la recette (D9) et, pour le moteur, tout A7.3 |
| **E. La veille** | Personne | — | Rien à lancer avant un déclencheur |

**L'ordre conseillé** : A7.3.c (prompt A sur « le lot A7.3.c », dans l'ordre
du §18.11) et A7.3.e (son prompt) en parallèle, puis D. Dans la section C,
seule C30 attend (cinq questions, son prompt) : elle débloque A12, et n'a pas à
passer avant le moteur, qui ouvre le premier (C23).

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

Une question produit ou de design rencontrée en route ne se tranche pas en
route : elle part en section C, avec une recommandation.

### A7 — Ce que les décisions du 2026-09-29 demandent

Les réponses d'Antoine à la section C, séance du 2026-09-29. Chaque item dit
ce qui est décidé ; **il ne se rediscute pas en route**. Une question neuve
rencontrée en le faisant repart en section C. Toute copie neuve porte
« TODO: à relire » (convention 6).

**Dans quel ordre.** Les items sont indépendants, sauf :
- A7.3 avant A7.4, parce que les liens promettent ce que le moteur fait ;

Le jeu n'attend rien du moteur.
**A7.1, A7.2, A7.5 à A7.11, A7.12.a, A7.12.b et A7.13 sont livrés (2026-09-30).** **A7.3.a est écrit et A7.3.b est close** : Antoine a validé la spécification le 2026-09-30 (C25, `ENGINE.md` §18.12). **A7.3.c et A7.3.e peuvent partir**, en parallèle.

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

**Dans l'ordre, et chaque étape attend la précédente** (sauf A7.3.e, en
parallèle de A7.3.c) :

| # | Quoi | Précisions |
|---|---|---|
| A7.3.a | **La spécification** — **écrite le 2026-09-30 : `ENGINE.md` §18** | Le catalogue assisté (14 chiffres, 15 depuis Q4 ; trois relais sur leur propre base de 100), le modèle de données (`type` + `motions`, ids `slg.*`, `schemaVersion` 2 et sa migration testée au caractère près), l'hybride en « deux moteurs, un total » et ses garde-fous contre le face-à-face, le deck, l'exemple rempli calculé à la main, les tests et le découpage en PR. Seize questions produit en §18.12, reprises en C25 |
| A7.3.b | **La validation par Antoine** — **close le 2026-09-30** | C25 : treize recos retenues, trois reprises (Q4, Q7, Q8) et Q3 précisée. Les réponses sont datées en `ENGINE.md` §18.12, et les sections qu'elles changent sont corrigées |
| A7.3.c | **Le code**, sur le modèle du moteur actuel — **prêt à partir** | Dans l'ordre du **§18.11** : branche d'intégration `feat/engine-slg`, six PR (S0 contrats et migration → S1 moteur pur → S4 deck → S5 intégration, avec S2 contenu et S3 écrans en parallèle), **un seul merge sur `main`**, drapeau fermé. Se lance avec le prompt A sur « le lot A7.3.c ». S2 attend les slugs d'A7.3.e pour lier les fiches. Moteur pur dans `lib/engine/`, catalogue et copie dans `content/engine-*.ts` (« à relire »), la vue sous `aarrr-funnel-template/_engine/`. Tests du moteur pur avec leur non-vacuité, e2e dans les deux langues, à 1 280 et 390 px, par l'aperçu propriétaire. Le canari « rien ne quitte le navigateur » couvre la nouvelle saisie |
| A7.3.d | **Le bon à tirer** de la copie neuve | Par l'agent des bons à tirer, avec `/bon-a-tirer`, construit depuis le code, **les quatre termes d'A7.3.e compris** |
| A7.3.e | **Les quatre termes du glossaire de l'assisté** (Q8) — **prêt à partir**, en parallèle d'A7.3.c | « Taux de closing », « cycle de vente », « ACV » et « conversion lead → opportunité ». Pages FR et EN, sur le modèle de la vague 2.2 (`JOURNAL.md`, « Glossaire, lot 1 » à « lot 3 ») : FAQ sur la forme des requêtes que lit Search Console, exemples chiffrés repris de l'exemple §18.9 (18 signées sur 75 conclues, cycle médian de 64 jours, ACV 24 000 €, 72 opportunités sur 480 MQL), maillage vers `revenue`, `cac`, `arpu`, `acquisition` et `pql`. Un repère n'entre que s'il a une source primaire publique, et reste du contexte (C1). **Jamais** les ordres de grandeur de l'instrument d'audit (non relus au nº4, et la décision 6 l'interdit). Slugs proposés : `win-rate`, `sales-cycle`, `acv`, `lead-to-opportunity`, à confirmer. Une PR sur `main`, hors drapeau : sitemap, `hreflang`, JSON-LD, IndexNow, et `/llms.txt` et `/llms-full.txt`, qui les reprennent d'eux-mêmes (C27). Le glossaire passe de 24 à 28 termes (56 pages) : les comptes écrits dans les tests et dans `CLAUDE.md` suivent. Copie « à relire ». Prompt : « Prompt A7.3.e », en fin de fichier |
| Hors code | Les textes de lancement disent « v1 : SaaS en libre-service » | `marketing/kit.md:105` et la ligne de risque de `marketing/campaigns/README.md` §8 : ils sont à réécrire quand A7.3.c est livré, pas avant |

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

### A12 — Le niveau 2 du jeu, « Comment les gens vous trouvent » (après C30)

Antoine a retenu le 2026-09-30 un deuxième niveau avant le lancement, et
l'acquisition pour ce niveau (six astuces sur huit absentes du niveau 1, une
autorité déjà connue du jeu, des cas publics récents : `GAME-BRIEF.md`
§17.1). **Fait le même jour** : la spécification (`GAME-BRIEF.md` §17), le
moteur généralisé (un chiffre qui monte comme un chiffre qui baisse, une
boutique comme un abonnement, le niveau 1 identique au bit près) et le modèle
du niveau 2 codé en brouillon, sans page ni texte, avec ses quatre années de
référence en tests (`lib/game/levels/acquisition.ts`, `acquisition.test.ts`).
**Rien d'autre ne se construit avant C30.** Toute copie neuve porte « TODO: à
relire » (convention 6).

| # | Quoi | Détail |
|---|---|---|
| A12.a | **La spécification et le modèle** | **Faits le 2026-09-30.** `GAME-BRIEF.md` §17 : univers (Pédalix), chiffre du board (nouveaux clients par mois), constantes, les dix-sept cartes et leur rôle au niveau 1, le DG, les quatre années de référence, le téléphone, les événements, les fins, et le catalogue vérifié sur les sources primaires. Cinq questions en §17.10, reprises en C30 |
| A12.b | **La validation par Antoine** | C30. Rien ne se construit avant sa réponse |
| A12.c | **La copie** | `content/game/acquisition.ts`, FR et EN, « à relire », avec la série C du §7.1 (parité, mots interdits, liste blanche des marques) |
| A12.d | **L'îlot partagé** | L'îlot du niveau 1 (`app/[locale]/game/retention/`) devient celui de tout niveau ; les composants de `components/game` perdent leurs noms d'emplacement du niveau 1 (`churn`, `subs`, `mrr`), ce qui change leur contrat : re-synchro Claude Design (section B) dans la même série |
| A12.e | **Le téléphone de Pédalix** | Un composant neuf et sa pastille « payé au panier » (§17.7), avec son aperçu pour Claude Design |
| A12.f | **Le branchement** | Le slug passe de `DraftLevelSlug` à `LevelSlug` et le compilateur liste ce qu'il exige (clé de sauvegarde, encart du résultat, analytique) ; page, image de partage, sitemap, hub « Jouable », et la réponse à C30 Q5 (l'encart d'un goulot partagé) |
| A12.g | **Les specs Playwright** | Sur le modèle de P1 à P27, dans les deux langues, à 1 280 et 390 px |
| A12.h | **Le bon à tirer, puis la recette** | Un bon à tirer du niveau 2 (`/bon-a-tirer`), puis une recette (D9) qui couvre les deux niveaux, relecture juridique du catalogue comprise |

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

**Rien d'ouvert.** La prochaine synchro se lance quand un composant change, ou
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

### Tranchées : C1 à C29

Les vingt-deux questions de la séance du 2026-09-29, puis C23 à C29 le
2026-09-30. Chaque réponse est écrite là où vit la question, et leur index
(sujet, réponse, où c'est écrit, suite) est dans `docs/decisions.md`, où une
question tranchée gagne sa ligne.

### Encore ouvert

| # | Question | Aujourd'hui | Reco |
|---|---|---|---|
| C30 | **Valider la spécification du niveau 2 du jeu** (`GAME-BRIEF.md` §17, A12.a, écrite le 2026-09-30) | Le modèle est codé en brouillon et ses quatre années de référence reproduisent le profil du niveau 1 (l'année honnête A a exactement sa patience). Rien d'autre n'est construit. **Cinq questions** (§17.10) : **Q1**, le chiffre du board est le nombre de nouveaux clients par mois, pas le taux de conversion du §11.1 ; **Q2**, le nom Pédalix ; **Q3**, le contrôle finit en transaction pénale de 150 000 €, pas en amende administrative ; **Q4**, les huit cas et leur liste blanche ; **Q5**, l'encart quand l'acquisition et la rétention freinent ensemble (C11) | **Trancher Q1 d'abord**, puis Q3, puis les trois autres en bloc, avec le prompt C30. Ensuite A12.c peut partir |

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
| D10 | **Le Tour au seul SEO, maintenant** (C20, 2026-09-29) | **Indexation : il reste le français**, dès que le quota de Search Console le permet. **Annuaires : Launching Next soumis le 2026-09-30 ; les suivants peuvent partir**, les captures du Tour sont refaites (A7.12.a, 2026-09-30) | Ce ne sont pas des posts, ils partent sans attendre le moteur et le jeu. 1) Search Console, « Demander l'indexation ». **Fait le 2026-09-29** : `/en` (déjà sur Google), les deux pages « porte ouverte » et les cinq « AARRR vs X » en anglais (aucune n'était sur Google), plus trois `/en/glossary/*` (ex-D8). Le sitemap est lu (74 pages, 2026-09-29). **Reste**, le quota étant dépassé le 2026-09-30 au matin (une dizaine de demandes par 24 h glissantes) : `/fr` (déjà sur Google), `/fr/growth-audit-checklist`, `/fr/startup-growth-diagnostic`, `/fr/aarrr-vs-north-star-metric`, `/fr/aarrr-vs-rarra`, `/fr/aarrr-vs-growth-loops`, `/fr/aarrr-vs-okr`, `/fr/aarrr-vs-heart`. 2) Les annuaires restants de la vague 1, dans l'ordre de `GROWTH-PLAN.md` 1.6, avec les liens `relaunch_tour` de `marketing/kit.md` (`node scripts/utm-link.mjs directory:<slug> /en --campaign relaunch_tour`). Launching Next est fait. Pas de fil X/Bluesky pour le Tour |

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
| **Un deuxième niveau du jeu ouvre** | Trancher l'encart d'un goulot partagé entre deux étapes qui ont chacune un niveau. Aujourd'hui, l'ordre AARRR choisit. Reco du 2026-09-29 : une carte qui propose les deux niveaux. **Posée d'avance en C30 Q5** (2026-09-30), puisque le niveau 2 est spécifié | `GAME-BRIEF.md` §15.4 et §17.10, C11 |
| **La Commission publie sa proposition de Digital Fairness Act** (visée pour novembre 2026) | Rien à lancer : le jeu ne sera pas ouvert (C23). Mais la copie du jeu dit la proposition « attendue fin 2026 » (`content/game/retention.ts:487-488`, et son test `game-retention.test.ts:503`). La réécrire d'après le texte publié, en vérifiant ce qu'il dit vraiment du design addictif et des séries, avant l'ouverture du jeu (D2). C'est une copie neuve, donc « à relire » | `GAME-BRIEF.md` §1 et §3, `marketing/campaigns/README.md` §10 |
| **Juin 2027** | La fenêtre Tour de France (R2-30) : Grand Départ le 2 juillet 2027 à Édimbourg. À construire en juin, pour partir pendant le Tour | `GROWTH-PLAN.md` |
| Une demande d'effacement (RGPD) | Supprimer le document **et** purger le cache CDN de `/r/<id>/*` : l'image de partage (depuis le 2026-09-14) et le badge (A3) y sont gardés un an sous une adresse immuable, et le badge l'est aussi chez GitHub (camo), hors de notre main. Vérifier d'abord comment Vercel purge par chemin. Relevé par la relecture de sécurité d'A3 | `legal.ts`, `VERCEL.md` §1.8 |
| Des badges en 429 dans des README | Le proxy compte `/r/<id>/…` dans le budget de lectures (120 par 10 minutes et par IP) **avant** le cache CDN, et les images d'un README passent par les quelques IP de camo. Mesurer avant de conclure ; si c'est réel, sortir `/r/<id>/badge/…` du budget, puisque la route ne lit Firestore qu'au premier passage | `src/proxy.ts`, `isResultReadPath` |
| Une facture Vercel qui surprend | `VERCEL.md` §1.6 et §2.2 | `VERCEL.md` |
| Besoin de `guidelines/` du bundle d'extension 01 | Le demander à Claude Design (son README l'annonce, l'archive ne le contenait pas) | `design/ds-extension-01-return/README.md` |
| Un contrat de largeur qui descend à 320 px | À 320 px, le bandeau d'entrée au jeu passe sur trois lignes (la seconde, ≈ 270 px de texte, pour une colonne de 244). Laissé par décision d'Antoine (2026-09-29) : seule une copie plus courte le tiendrait. 360 px est réglé depuis le même jour. De même, `/r/<id>` déborde de 37 px à 320 px (le `PillarChip`) : hors contrat (`DESIGN-BRIEF.md` fixe 390 et exige 375-430), laissé par Antoine | `game/GameEntry.module.css`, `result/PillarChip.module.css` |
| **A7.3.c est mergé, et C30 tranchée** | Découper `ENGINE.md` (le §18 dans `docs/engine/`) et `GAME-BRIEF.md` (le §17 dans `docs/game/`), comme le journal le 2026-10-01 : texte déplacé tel quel, et en tête de l'original un index qui garde valides les renvois « `ENGINE.md` §18.12 ». Pas avant : #233 écrit dans le §18, une session C30 écrira dans le §17, et un déplacement de texte entre fichiers leur ferait un conflit que git ne sait pas suivre | `JOURNAL.md`, entrée du 2026-10-01 |

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

### Prompt A7.3.e — les quatre termes du glossaire de l'assisté

Écrit le 2026-09-30 à la validation de C25 (Q8 : « on peut créer un prompt à
part »). Il se lance en parallèle d'A7.3.c : les deux ne touchent pas les
mêmes fichiers, et S2 attend seulement ses slugs. Le prompt C25 qui était ici
a servi le même jour.

```text
Tu reprends Tour de Growth en autonomie sur l'item A7.3.e de CHANTIERS.md : les quatre termes de glossaire de la vente assistée, « taux de closing », « cycle de vente », « ACV » et « conversion lead → opportunité ».

1. Lis CLAUDE.md (chargé d'office), l'item A7.3.e de CHANTIERS.md, ENGINE.md §18.4 (les fiches qui renverront à ces termes) et §18.9 (l'exemple chiffré), puis les entrées « Glossaire, lot 1 » à « lot 3 » de JOURNAL.md : la vague 2.2 est le modèle à suivre. Ouvre TESTING.md avant d'annoncer quoi que ce soit comme vérifié, et VERCEL.md avant le merge.
2. Crée ta branche depuis origin/main avant la première édition.
3. Avant d'écrire : relève les requêtes réelles (le rapport Search Console par stats.yml, scope gsc, et les résultats de recherche du jour) pour confirmer les slugs proposés (win-rate, sales-cycle, acv, lead-to-opportunity) et la forme des FAQ. Aucun chiffre du rapport n'entre dans le dépôt.
4. Chaque terme, en FR et en EN : définition, formule, exemple chiffré repris de l'exemple §18.9 (jamais un nouveau jeu de nombres), pièges, FAQ, maillage vers les termes voisins (revenue, cac, arpu, acquisition, pql). Un repère n'entre que s'il a une source primaire publique, citée ; il reste du contexte et ne désigne jamais (C1). Jamais les ordres de grandeur de l'instrument d'audit (audit-catalog.ts) : non relus, et la décision 6 d'ENGINE.md l'interdit. Toute copie neuve porte « // TODO: à relire (convention 6). ».
5. Les pages suivent tout ce que le glossaire fait déjà : sitemap, hreflang, JSON-LD, date de mise à jour, IndexNow, et /llms.txt et /llms-full.txt (C27), qui les reprennent d'eux-mêmes. Les comptes écrits en dur (24 termes, 48 pages) suivent : tests, CLAUDE.md. Vérifie à l'écran, en français et en anglais, à 1280 et 390 px.
6. Avant la PR : tsc, lint, vitest --coverage, build avec GAME_ENABLED=true NEXT_PUBLIC_GOATCOUNTER_CODE=e2e-stub ADMIN_DASHBOARD_PASSWORD=e2e-admin, Playwright complet, et le relecteur-copie. Une PR sur main, mergée quand elle est verte en suivant /livrer (lu, pas appelé). Vérifie en production.
7. Si tu rencontres une question produit, ne la tranche pas : ajoute-la en section C de CHANTIERS.md avec ta recommandation.
8. À la fin : retire A7.3.e de CHANTIERS.md, écris dans l'item A7.3.c les slugs retenus (S2 en a besoin), ajoute l'entrée de JOURNAL.md, mets à jour CLAUDE.md (le nombre de termes et de pages).

Réponds-moi en français, court : ce qui est livré, ce qui est vérifié et comment, ce qui reste.
```

### Prompt C30 — le niveau 2 du jeu

Écrit le 2026-09-30, avec la spécification. C30 se tranche dans sa propre
session : cinq questions, dont une qui change le chiffre du niveau.

```text
Tu es là pour me faire trancher C30 : la validation de la spécification du niveau 2 du jeu, « Comment les gens vous trouvent » (GAME-BRIEF.md §17, écrite le 2026-09-30 : CHANTIERS.md A12.a). Tu n'écris pas de code, sauf pour corriger le modèle brouillon si une réponse le demande.

1. Lis CLAUDE.md, CHANTIERS.md (C30 et A12), puis GAME-BRIEF.md : la section 4, le §6, puis tout le §17, en commençant par §17.0 (en une page) et §17.10 (les cinq questions).
2. Avant de poser une question, vérifie qu'elle est encore ouverte : que §17 dit encore ce que fait src/lib/game/levels/acquisition.ts (lance src/lib/game/__tests__/acquisition.test.ts), et qu'aucune réponse n'est déjà dans JOURNAL.md.
3. Pose d'abord Q1, puis Q3, une par une avec AskUserQuestion. Pour chacune : ce que c'est, ce qui est en jeu, ta recommandation en premier avec « (Recommandé) », et ce qu'on casse si on se trompe. Pour Q1, montre la définition de l'acquisition dans le Tour (content/how-it-works.ts) et les huit astuces rangées par ce qu'elles font monter. Pour Q3, montre la différence entre une amende administrative (niveau 1, C14) et une transaction pénale, avec les montants publiés du §17.3.
4. Puis propose Q2, Q4 et Q5 en bloc : un tableau (question, reco, ce qui casse) et une seule question « je valide ces recos / je veux en reprendre certaines ». Celles que je reprends, pose-les une par une comme au point 3. Pour Q5, montre l'encart actuel sur un résultat (build local avec GAME_ENABLED, /r/sample), pas une description.
5. Après chaque réponse, consigne-la tout de suite dans GAME-BRIEF.md §17.10, datée. Si elle change la spécification, corrige la section de §17 concernée ; si elle change un chiffre du modèle, corrige acquisition.ts, régénère les fixtures de acquisition.test.ts et le §17.6 (jamais une tolérance élargie), et vérifie que F2.5 reste vert. Une question neuve va en section C de CHANTIERS.md, avec sa reco.
6. À la fin :
   - C30 sort de « Encore ouvert » (CHANTIERS.md C) et gagne sa ligne dans docs/decisions.md, A12.b est close, et A12.c est prêt à partir ;
   - mets à jour la ligne « Décisions qui attendent Antoine » de CLAUDE.md, et ajoute l'entrée de JOURNAL.md ;
   - ouvre une PR et merge-la quand elle est verte (/livrer lu, pas appelé). Si une autre session a touché les mêmes fichiers entre-temps, fusionne main d'abord et garde les deux côtés.

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
