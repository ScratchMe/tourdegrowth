# CHANTIERS.md — ce qui reste à faire, et qui le fait

*Établi le 2026-09-29, après la mise en production de #184. Hors bons à tirer
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
| **A. Le travail autonome**, en quatre lots | Une session seule, une PR par lot (A7 : une PR par item) | Session cloud | A1 à A6 livrés le 2026-09-29, A7 et A8 le 2026-09-30. **Reste d'A7** : A7.3.c (le code), **prêt depuis C25** (2026-09-30), A7.3.d après A7.3.c, A7.4 après A7.3, et A7.12.c à l'ouverture. A10 (S-15), A11 et A7.3.e (les quatre termes du glossaire) livrés le 2026-09-30 |
| **B. Design sync** | Une session, cloud ou locale | N'importe où : une session cloud pousse vers Claude Design depuis le 2026-09-29 | **À jour le 2026-09-30, après A7.10, A10 et A11** (B3, puis la re-synchro d'A11 le soir même : 88 composants, 292 cellules, 88 aperçus sur 88 rendus). Rien à lancer tant qu'un composant, ou une copie qu'un aperçu reprend, ne change pas |
| **C. Tes décisions**, une par une | Toi, guidé, avec une recommandation par question | N'importe quelle session | **Tranchées le 2026-09-29** (C18 close à part, par la session D). C23 à C29 tranchées le 2026-09-30, C26 à C29 livrées le même jour, **C25** (la spécification de A7.3, `ENGINE.md` §18) dans sa propre session. **Rien n'est ouvert** |
| **D. Tes actions**, pas à pas | Toi, accompagné | Session cloud | Selon ce qui est prêt. D10 (l'indexation) est prêt tout de suite. D2 attend les bons à tirer nº7 et nº8, la recette (D9) et, pour le moteur, tout A7.3 |
| **E. La veille** | Personne | — | Rien à lancer avant un déclencheur |

**L'ordre conseillé** : A7.3.c (prompt A sur « le lot A7.3.c », dans l'ordre
du §18.11), puis D. A7.3.e, qui se menait en parallèle, est livré le
2026-09-30. Rien n'attend dans la section C : C25 est tranchée le 2026-09-30.

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
| A7.3.c | **Le code**, sur le modèle du moteur actuel — **prêt à partir** | Dans l'ordre du **§18.11** : branche d'intégration `feat/engine-slg`, six PR (S0 contrats et migration → S1 moteur pur → S4 deck → S5 intégration, avec S2 contenu et S3 écrans en parallèle), **un seul merge sur `main`**, drapeau fermé. Se lance avec le prompt A sur « le lot A7.3.c ». **Les slugs d'A7.3.e sont en place** (2026-09-30), dans `GlossaryTermId` : S2 lie `slg.acq.lead-to-opp` à `lead-to-opportunity`, `slg.acq.cycle` à `sales-cycle`, `slg.rev.win-rate` à `win-rate` et `slg.rev.acv` à `acv`. Aucun n'écrit de repère : les « pas de repère publiable » du §18.4 tiennent. Le seul chiffre cité, sur la page `acv` (Janz, 2014), cadre un modèle économique et n'est pas un repère de fiche. Moteur pur dans `lib/engine/`, catalogue et copie dans `content/engine-*.ts` (« à relire »), la vue sous `aarrr-funnel-template/_engine/`. Tests du moteur pur avec leur non-vacuité, e2e dans les deux langues, à 1 280 et 390 px, par l'aperçu propriétaire. Le canari « rien ne quitte le navigateur » couvre la nouvelle saisie |
| A7.3.d | **Le bon à tirer** de la copie neuve | Par l'agent des bons à tirer, avec `/bon-a-tirer`, construit depuis le code, **les quatre termes d'A7.3.e compris** |
| Hors code | Les textes de lancement disent « v1 : SaaS en libre-service » | `marketing/kit.md:105` et la ligne de risque de `marketing/campaigns/README.md` §8 : ils sont à réécrire quand A7.3.c est livré, pas avant |

#### A7.4 — Les liens d'ouverture du moteur (C7)

**Décidé** : un lien vers le moteur depuis `/how-it-works`,
`/growth-audit-checklist` et `/startup-growth-diagnostic`, là où le texte
parle déjà de chiffres. **Pas de section à part sur l'accueil** : la carte
« Le moteur » de la bande « trois parties » (`SpaceStrip`) devient le lien,
avec la règle de C15. **Pas de lien au pied de page.**

| Où | Quoi |
|---|---|
| Les trois pages | Un lien en contexte (une phrase, pas un bandeau), en FR et en EN. Il n'apparaît que si le moteur est ouvert au build : même garde que la bande, `SPACE_OPEN_AT_BUILD.engine` (`SpaceBand.tsx:27`), et même raison que le sitemap (R2-28). La copie neuve est « à relire » |
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
d'après A5** avant d'être écrits ici. Chacun est petit ; ils peuvent partir
dans une seule PR, ou avec le lot qui touche le même fichier.

| # | Quoi | Où, et comment le voir |
|---|---|---|
| A9.1 | **Les guillemets de l'audit portent des espaces ordinaires** — **fait le 2026-09-30 avec A10.c** (46 guillemets, 26 chaînes à ponctuation haute, et la garde étendue au dossier) : `« mot »` au lieu de U+00A0, sur 17 lignes de copie (les commentaires non comptés) | Sous `src/app/(app)/admin/audit/` : les `hint` de `DefinitionEditor` (4), `RowEditor` (3), `NewMissionForm` (3), `CriterionEditor` (2), `ContextEditor` (2), `ObservationList`, le libellé de purge d'`AuditWorkbench` et `labels.ts`. La garde `copy-typography.test.ts` ne lit que `src/content` et `src/lib/i18n` : l'étendre à ce dossier, pour que la correction tienne |
| A9.2 | **Le tableau de bord du jeu coupe « 100,000 » sur deux lignes** entre 761 et 850 px de large (une ligne à 920) | La tuile « Subscribers » de `Dashboard`, dans la rangée de six : `StatTile` laisse le chiffre se couper au milieu. Mesuré dans l'aperçu `YearStart` par les rectangles du texte. Un chiffre ne se coupe jamais (`white-space: nowrap` sur la valeur, et une tuile qui s'élargit ou passe à la ligne) |
| A9.3 | **La courbe de churn touche l'étiquette « target 4.0% »** dans la fin `DarkYear` | `EndingCharts` : l'étiquette de la ligne d'objectif est posée au-dessus de la ligne, là où passe une courbe proche de 5 %. Placer l'étiquette du côté sans données, ou lui donner un fond |
| A9.4 | **Une règle morte dans `SpaceBand.module.css`** : `.inner { padding-block: 7px }` sous `@container (max-width: 560px)` | `.inner` est lui-même le conteneur, et une requête de conteneur ne s'applique jamais au conteneur qu'elle interroge. Soit la retirer, soit la poser sur un enfant (et vérifier à 360 px que la bande ne change pas) |


### A10 — S-15 : les primitives de formulaire (extension 04 du design system)

Le retour de Claude Design sur `design/DS-EXTENSION-BRIEF-04.md` est arrivé le
2026-09-30 : `design/ds-extension-04-return/`, qui fait autorité comme les
retours 01 et 03. Il répond aux dix-huit questions sans contredire aucune des
dix contraintes. **Antoine a tranché le 2026-09-30 que l'audit est porté lui
aussi**, bien qu'il soit entre parenthèses (#210) : c'est un portage qui retire
une copie, pas une fonctionnalité. **Clos le 2026-09-30** : les quatre sous-lots sont livrés, et la re-synchro qui envoie les primitives est B3. Une PR par sous-lot, dans cet ordre :

| # | Quoi | Détail |
|---|---|---|
| A10.a | **Les primitives dans `src/components/core/`, sans rien câbler** | **Livré le 2026-09-30** ([#218](https://github.com/ScratchMe/tourdegrowth/pull/218), squash `675f4f3`). `Field` (et `FieldRow`), `TextField`, `NumberField`, `Select`, `DateField`, `Choices`, `Checkbox`, `FormSummary` ; `TextArea` et `Segmented` selon leurs deltas ; `AnswerOption` lit `--size-mark` et `--mark-inset`. Jetons répartis dans les couches existantes (`colors.css` et `tokens.ts` pour les couleurs, `typography.css`, `shape.css`, `spacing.css`), pas dans un fichier à part. Tests unitaires (la logique pure dans `src/lib/forms/`, le balisage par rendu statique), aperçus dans `.design-sync/previews/`, contrats dans `componentSrcMap`. Gardes : un seul anneau de focus sur toutes les primitives, aucune opacité pour dessiner un état. Vérification à l'écran sur une page d'échafaudage jamais commitée, papier et nuit, FR et EN, 390 et 1 280 |
| A10.b | **Le moteur sur les primitives** | **Livré le 2026-09-30** ([#221](https://github.com/ScratchMe/tourdegrowth/pull/221), squash `ce0f91d`). Tous les champs du moteur, constructeur de slides compris (`deck/AskForm.tsx` perd son `Field`, son `DraftInput` et son analyseur ; les cinq cases à cocher du deck deviennent des `Checkbox`). Plus rien n'importe `_engine/_ui/`. Unités dans la boîte, placées par la langue et nommées par `Intl` pour les lecteurs d'écran ; `--form-gap-*` avec leurs lecteurs. Corrigé en passant : le deck lisait « 26,000 » comme 26, et le signe d'un `NumberField` collait au bord quand l'unité avait un nom. Gardes (`e2e/engine-forms.spec.ts`) : « 26 000 » lu dans la fiche et dans le deck, un seul anneau de focus sur huit sortes de contrôles |
| A10.c | **L'audit sur les primitives, avec A9.1** | **Livré le 2026-09-30** ([#223](https://github.com/ScratchMe/tourdegrowth/pull/223), squash `cb13646`). Les 85 champs de l'audit sur `core/`, les dates en trois listes françaises (`IsoDateField`, une composition de `DateField` qui garde le format `aaaa-mm-jj` du fichier), l'état `missing` et un `FormSummary` à la place du paragraphe rouge, l'anneau d'encre jusque sur le bouton d'import. Gardes : « 1 200 000 » lu et exporté (`audit-rows.spec.ts`), la typographie du dossier (`copy-typography.test.ts`). Prévu : `admin/audit/_ui/` (ses cinq fichiers), le paragraphe rouge des champs manquants remplacé par l'état `missing` et un `FormSummary`, la date en trois listes en français, l'anneau d'encre à la place du rouge. A9.1 (les guillemets) dans la même PR, puisqu'il touche les mêmes fichiers, et `copy-typography.test.ts` étendu à ce dossier. Garde : « 26 000 » lu dans l'audit aussi |
| A10.d | **Les trois copies supprimées, et une garde contre une quatrième** | **Fait le 2026-09-30.** `form-controls-source.test.ts` refuse tout `<select>` et tout `<input>` écrit à la main hors de `core/`, sauf le bouton de fichier et le curseur du « et si » (le retour pose ses conditions pour les porter, hors A10) ; il rougissait sur les neuf contrôles des deux copies avant leur suppression. D17 (`ENGINE.md`) et la décision 1 de `AUDIT-PLAN.md` sont marquées remplacées. Prévu : les dossiers `_ui/` du moteur et de l'audit (le `Field` et le `.control` de `deck/` sont partis avec A10.b, dont c'étaient les seuls lecteurs). La garde refuse tout `<input>`, `<select>` ou case à cocher écrit à la main hors de `src/components/core/` |

**Écarts assumés contre le retour, signalés plutôt qu'absorbés** (le détail
dans l'entrée de `JOURNAL.md` du lot a) :
- `NumberField` prend et rend un nombre (`number | null`) et garde le texte
  tapé en interne, comme le moteur aujourd'hui. Le retour le voulait en texte,
  analysé par l'appelant, mais cela aurait redonné à chaque appelant du moteur
  et de l'audit une copie de la logique de brouillon. L'analyse et le
  regroupement sont ceux du moteur (`number.ts`, plus complet que
  `groupAsTyped`), déplacés dans `src/lib/forms/`.
- `--mark-color: currentColor` n'est pas un jeton de couleur (les gardes
  exigent une couleur littérale) : les marques écrivent `currentColor`.
- `--field-count-reveal`, `--form-row-min` et `--choices-columns-min` ne
  deviennent pas des jetons, puisqu'aucune feuille ne peut les lire (un seuil
  lu par du JS, deux largeurs de requête de conteneur) : ce sont des
  constantes commentées. `--form-gap-sm` et `--form-gap-md` arrivent en b,
  avec leur premier lecteur (`dead-tokens.test.ts`).

**Reste hors d'A10** : mesurer `--select-inset` dans WebKit et Gecko (cette
session n'a que Chromium), porter le curseur du « et si » et les deux boutons
d'import de fichier (le retour pose ses conditions : un `Field`, et un
`NumberField` à côté du curseur), et la garde générale que le retour suggère
contre toute opacité sur du texte. La ligne « Pour enregistrer, il manque :
… » de la fiche du moteur deviendrait naturellement un `FormSummary`, mais il
lui faut un titre qui compte, donc de la copie neuve : une décision, pas un
portage.

### A11 — Ce que la design sync B3 du 2026-09-30 a trouvé dans le produit

Vus en reprenant les aperçus des primitives sur leurs vrais appels. Le
défaut du trait de `Checkbox` est corrigé dans la PR de la synchro (#226), avec
sa garde. **Les quatre suivants sont traités le soir même** ([#227](https://github.com/ScratchMe/tourdegrowth/pull/227)), avec C28
et C29 qu'Antoine a tranchées entre-temps, et la re-synchro de Claude Design
qui les suit.

| # | Quoi | État |
|---|---|---|
| A11.1 | **« 1 days » / « 1 jours »** : l'estimation d'une durée prenait un pluriel fixe | **Livré le 2026-09-30.** `wordUnit` choisit le mot par `Intl.PluralRules` (nouvelle clé `workbench.day`, « à relire ») : « 1 jour », « 1,5 jour », « 2 jours » ; « 1 day », « 0 days ». Chaque borne de l'estimation prend l'unité de son propre chiffre. Test sur 0, 1, 1,5 et 2 dans les deux langues (`sources.test.ts`) |
| A11.2 | **Un jour qui n'existe pas n'avait pas de bord rouge** | **Livré le 2026-09-30.** `DayField` : quand les trois parties sont choisies et que la date est refusée, les trois boîtes passent en invalide (bord de 3 px, `aria-invalid`) ; une date incomplète ne marque que ses parties vides. Test : le 31 février donne trois `aria-invalid` (`form-primitives.test.ts`) |
| A11.3 | **Le joint d'une `FieldRow` s'écartait de sa boîte** | **Livré le 2026-09-30.** Le premier champ couvre aussi la colonne du joint, et son libellé et son indice ne dimensionnent plus les colonnes (`contain: inline-size`) : « sur » se pose contre la boîte, un libellé long passe au-dessus des deux. Garde e2e sur la fiche du CAC en français : 9 px entre la boîte et « sur » (l'écart de colonne est de 12), contre 114 px avant (`engine-forms.spec.ts`) |
| A11.4 | **Une espace ordinaire entre un nombre et son mot** dans la copie du moteur | **Clos sans changement : ce n'est pas un défaut isolé.** La copie validée n'a pas de convention unique, mesuré le 2026-09-30 sur les chaînes françaises évaluées : « {n} jours » s'écrit avec une espace ordinaire dans 25 chaînes (glossaire, catalogue d'audit, jeu, moteur) et avec l'insécable dans 16 ; « mois » et « min » sont partagés de même, et un compte de choses (« 15 questions », « 42 inscrits ») prend partout l'espace ordinaire. La garde proposée rougirait sur de la copie validée par Antoine. Harmoniser serait une passe de copie à lui faire relire, pas un correctif |

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

### Séance du 2026-09-29 : les vingt-deux questions sont tranchées

Chaque réponse est écrite là où vit la question, avec son raisonnement.
Ce tableau n'en est que l'index. Les questions de design ont été posées
avec des captures du vrai écran : un build local avec le jeu et le moteur
ouverts, et, pour la vue propriétaire, un build jetable jamais commité.

| # | Sujet | Réponse | Écrit dans | Suite |
|---|---|---|---|---|
| C1 | Les repères qui désignent la fuite | **Aucun repère ne désigne** : seule une cible d'équipe nomme l'étape. Population du churn reformulée (« SaaS B2B à panier élevé »). Non tranchée auparavant dans le nº8, sa carte y est désormais remplie | `ENGINE.md` décision 5 | A7.1, livré le 2026-09-30 |
| C2 | Nom et adresse du moteur | **« Moteur de growth »** en français, "Growth engine" en anglais. **Adresse `/aarrr-funnel-template` gardée** : Antoine a délégué le choix sur le seul critère SEO, et la session l'a vérifié sur les résultats de recherche du jour | `ENGINE.md` décision 1 | A7.2, livré le 2026-09-30 |
| C3 | Crédit tourdegrowth.com sur les slides | Gardé : présent, retirable | `ENGINE.md` décision 2 | — |
| C4 | Périmètre de la v1 | **Le B2B assisté entre en v1.** Un type (SaaS B2B), puis deux motions cochables, PLG et SLG. L'hybride en « deux moteurs, un total », jamais en face-à-face. L'ouverture du moteur attend | `ENGINE.md` décision 3 | A7.3 (spécification, validation, code, bon à tirer) |
| C5 | Slide « déclaré × mesuré » | Gardée décochée | `ENGINE.md` décision 4 | — |
| C6 | Moteur public, distinct de l'audit | Confirmé. Antoine tient l'audit privé pour un doublon ; la mission D4 devait trancher. **Tranché autrement le 2026-09-30 : l'audit est mis entre parenthèses, priorité au moteur** | `ENGINE.md` décision 6, `AUDIT-PLAN.md` en tête | D5 (les entretiens, réorientés vers le moteur) |
| C7 | Liens d'ouverture du moteur | Les trois pages gardent leur lien ; **pas de section à part sur l'accueil** (la carte de la bande devient le lien) ; pas de pied de page | `ENGINE.md` décision 7 | A7.4 |
| C8 | Le miroir, Tour présent non relié | **Une ligne et un bouton « Relier ce Tour »**, et la liaison dans les Réglages. L'invitation « Fais le Tour » menait à une impasse | `ENGINE.md` §8.5 | A7.5, livré le 2026-09-30 |
| C9 | Slide fuite d'une étape sans prix | **La slide existe**, avec un titre sans argent. Sous un client, l'omission est gardée | `ENGINE.md` §9.3 | A7.6, livré le 2026-09-30 |
| C10 | Place de l'encart du jeu | **Sous le bouton principal sur desktop**, comme sur mobile. Mesuré : il faisait descendre le bouton du visiteur de 350 px | `GAME-BRIEF.md` §15.4 | A7.7, livré le 2026-09-30 |
| C11 | Quand montrer l'encart | Gardé : la rétention dans le groupe, partagé compris. Le cas de plusieurs niveaux se tranche à l'ouverture d'un deuxième niveau | `GAME-BRIEF.md` §15.4 | Section E |
| C12 | Noms de zones bilingues | Gardés : « Retention — S'ils reviennent » | `GAME-BRIEF.md` §15.3 | — |
| C13 | « Vingt minutes » | Chronométré à la recette : gardé si la médiane des testeurs tombe entre 15 et 25 minutes | `GAME-BRIEF.md` §7.3 | D9 |
| C14 | Amende du jeu | **Plafonnée à 75 000 €**, le maximum légal pour une entreprise | `GAME-BRIEF.md` §5, règle 5 | A7.8, livré le 2026-09-30 |
| C15 | Cartes de la bande de l'accueil | **Des liens mesurés** à l'ouverture (`home_strip`), et les pastilles du bandeau mesurées aussi (`space_band`) | `GAME-BRIEF.md` §13.3 E | A7.9, livré le 2026-09-30 |
| C16 | Primaire du propriétaire | **« Partager » devient le primaire** chez le propriétaire ; « Refaire le Tour » passe secondaire. Le visiteur ne change pas | Ici et en A7.10 | A7.10, livré le 2026-09-30 |
| C17 | Porte de test pour `/r/<id>` | Déléguée à la session : **pas de porte, l'émulateur Firestore en CI** | Ici et en A7.11 | A7.11, livré le 2026-09-30 |
| C18 | Projects et Discussions | **Déjà désactivés** (constaté par l'API GitHub). Question non posée : la session D l'a close en parallèle avec D1, le même jour | `JOURNAL.md`, « D1 : les réglages du dépôt » | — |
| C19 | Ce qui est parti de la vague 1 | **Rien.** Et rien ne part avant que le moteur et le jeu soient prêts | `marketing/campaigns/README.md` §10 | D6 |
| C20 | Relancer le Tour sur les réseaux | **Le Tour au seul SEO**, sans fil. L'indexation et les annuaires partent maintenant | `marketing/campaigns/README.md` §10 | D10, A7.12.a |
| C21 | Captures de B et C | **Capturer maintenant**, provisoires, puis refaire à l'ouverture. Celles du Tour datent d'avant I + B | `marketing/campaigns/README.md` §10 | A7.12.a et A7.12.b livrés le 2026-09-30 ; A7.12.c à l'ouverture |
| C22 | « Qui est derrière ? » | **La réponse nomme Antoine.** C'est une question de calendrier, pas d'anonymat : pas de LinkedIn ni de lancement en grande pompe pour l'instant | `GROWTH-PLAN.md` option A, `marketing/campaigns/README.md` §10 | A7.13, livré le 2026-09-30 |
| C23 | L'ordre des lancements (tranchée le 2026-09-30) | **On attend les deux, le moteur d'abord** : C19 tient, le calendrier garde B puis C. Le jeu, prêt plus tôt, reste fermé jusqu'à l'ouverture du moteur. **Le créneau réactif du Digital Fairness Act est abandonné**, alors que la proposition est visée pour novembre 2026 (MLex, 23/09) | `marketing/campaigns/README.md` §10, `GAME-BRIEF.md` | D2, section E (le fait DFA du jeu) |
| C24 | « Voir un exemple » en roast | **Oui, tranchée le 2026-09-30** (la reco) : le bouton suit le sélecteur de ton de l'aperçu, et en roast il mène à `/r/sample?tone=roast` | Ici | Livré le 2026-09-30 avec A7.9 |
| C26 | Laisser ou bloquer les robots d'IA (née d'A8) | **Tout laisser, et l'écrire** (la reco, tranchée le 2026-09-30) : `robots.txt` nomme les onze robots d'IA, entraînement et réponses dans deux groupes, tous en `Allow: /`. Un test refuse tout `Disallow` : en ajouter un, c'est rouvrir C26 | `src/lib/seo/ai-agents.ts`, `src/app/robots.ts` | Livré le 2026-09-30 |
| C27 | Publier un `llms.txt` (née d'A8) | **Court et généré, plus `llms-full.txt`** (tranchée le 2026-09-30 ; la reco était sans `llms-full.txt`). `/llms.txt` liste exactement les adresses du sitemap, drapeaux compris, en anglais avec l'adresse française à côté ; `/llms-full.txt` porte le texte anglais des articles et des 24 termes, construit depuis les champs que les pages impriment. Deux tests les tiennent au sitemap et aux pages. En-têtes « à relire » | `src/lib/seo/llms.ts`, `llms-full.ts`, `GROWTH-PLAN.md` 2.8 | Livré le 2026-09-30 ; sa copie ira au prochain bon à tirer |
| C28 | L'espace entre une unité et son chiffre (tranchée le 2026-09-30) | **L'unité porte son espace** (la reco) : la boîte n'en ajoute plus. Collée en anglais (« €500 », « 20% »), insécable en français (« 21 000 € », « 20 % »), ce que `Intl` donne ; `moneyUnit` reprend l'espace qu'`Intl` met à côté du signe | `Field.module.css`, `NumberField.tsx`, `.design-sync/conventions.md` | Livré le 2026-09-30 avec A11 |
| C25 | La spécification du B2B assisté et de l'hybride (tranchée le 2026-09-30, dans sa propre session) | **Validée.** Q3 : un client compte dans la motion qui a signé son contrat en cours, et un passage n'est pas un départ. Q1 : l'activation assistée est la mise en production. Q2 : trois mois glissants, fixes. **Reprises** : Q4, une marge brute par motion, avec repli sur la marge globale ; Q7, la liaison devient un levier « Et si » dès la v1, en nombre, jamais candidate ; Q8, quatre termes de glossaire dès la v1, par une session à part. Les dix autres recos retenues. Posée sur l'exemple §18.9, Q10 et Q12 sur l'écran actuel et un croquis | `ENGINE.md` §18.12, et les sections du §18 corrigées | A7.3.c, A7.3.e |
| C29 | « Facultatif » : dans le libellé, ou par la prop `optional` (tranchée le 2026-09-30) | **Par la prop** (la reco) : le mot sort des quatre libellés du moteur et se dessine plus discret après eux, comme le retour 04 le dessine ; nouvelle clé `workbench.optional`. Les quatre libellés raccourcis et la clé sont « à relire » | `engine-copy.ts`, `.design-sync/conventions.md` | Livré le 2026-09-30 avec A11 |

### Encore ouvert

Rien. C25 est tranchée le 2026-09-30 (plus haut).

---

## D. Tes actions, pas à pas

Ce qui ne peut venir que de toi. **Jamais de secret dans une conversation**, et
rien de privé dans le dépôt, qui est public. Cela vaut pour les chiffres de
`/admin/stats`, les données d'une mission d'audit et les noms de clients.

| # | Action | Prête ? | Détail |
|---|---|---|---|
| D2 | **Ouvrir le jeu et le moteur à tout le monde** | Non : il faut les bons à tirer nº7 et nº8 signés, C1 à C15 tranchés, et les liens d'ouverture (C7) construits. **Pour le moteur, en plus : tout le lot A7.3** (le B2B assisté et l'hybride, décidés le 2026-09-29), bon à tirer compris. **Le jeu n'ouvre pas avant le moteur** (C23, 2026-09-30), et sa phrase sur le Digital Fairness Act est remise à jour avant d'ouvrir (section E) | Poser `GAME_ENABLED` et/ou `ENGINE_ENABLED` à `true` dans Vercel (Production), puis **redéployer** (`VERCEL.md` §1.11). Ensuite, la session vérifie la production : pages en 200, sitemap, pied de page, bandeau. Toi, tu demandes l'indexation des nouvelles pages dans Search Console |
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
| `eslint-config-next` suit | TypeScript 7 et ESLint 10, testés en installant, pas en lisant les plages de peer | `CLAUDE.md` |
| Un mois après l'ouverture du jeu | La place de l'encart (C10) et le bouton principal (C16), sur les chiffres | Section C |
| **Un deuxième niveau du jeu ouvre** | Trancher l'encart d'un goulot partagé entre deux étapes qui ont chacune un niveau. Aujourd'hui, l'ordre AARRR choisit. Reco du 2026-09-29 : une carte qui propose les deux niveaux | `GAME-BRIEF.md` §15.4, C11 |
| **La Commission publie sa proposition de Digital Fairness Act** (visée pour novembre 2026) | Rien à lancer : le jeu ne sera pas ouvert (C23). Mais la copie du jeu dit la proposition « attendue fin 2026 » (`content/game/retention.ts:487-488`, et son test `game-retention.test.ts:501`). La réécrire d'après le texte publié, en vérifiant ce qu'il dit vraiment du design addictif et des séries, avant l'ouverture du jeu (D2). C'est une copie neuve, donc « à relire » | `GAME-BRIEF.md` §1 et §3, `marketing/campaigns/README.md` §10 |
| **Juin 2027** | La fenêtre Tour de France (R2-30) : Grand Départ le 2 juillet 2027 à Édimbourg. À construire en juin, pour partir pendant le Tour | `GROWTH-PLAN.md` |
| Une demande d'effacement (RGPD) | Supprimer le document **et** purger le cache CDN de `/r/<id>/*` : l'image de partage (depuis le 2026-09-14) et le badge (A3) y sont gardés un an sous une adresse immuable, et le badge l'est aussi chez GitHub (camo), hors de notre main. Vérifier d'abord comment Vercel purge par chemin. Relevé par la relecture de sécurité d'A3 | `legal.ts`, `VERCEL.md` §1.8 |
| Des badges en 429 dans des README | Le proxy compte `/r/<id>/…` dans le budget de lectures (120 par 10 minutes et par IP) **avant** le cache CDN, et les images d'un README passent par les quelques IP de camo. Mesurer avant de conclure ; si c'est réel, sortir `/r/<id>/badge/…` du budget, puisque la route ne lit Firestore qu'au premier passage | `src/proxy.ts`, `isResultReadPath` |
| Une facture Vercel qui surprend | `VERCEL.md` §1.6 et §2.2 | `VERCEL.md` |
| Besoin de `guidelines/` du bundle d'extension 01 | Le demander à Claude Design (l'archive ne le contenait pas) | `CLAUDE.md` |
| Un contrat de largeur qui descend à 320 px | À 320 px, le bandeau d'entrée au jeu passe sur trois lignes (la seconde, ≈ 270 px de texte, pour une colonne de 244). Laissé par décision d'Antoine (2026-09-29) : seule une copie plus courte le tiendrait. 360 px est réglé depuis le même jour | `game/GameEntry.module.css` |

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
2. Avant de poser une question, vérifie qu'elle est encore ouverte : dans le code, le journal et le document source. Pour C1, demande-moi d'abord si je l'ai déjà tranchée dans le bon à tirer nº8.
3. Pose-les une par une avec AskUserQuestion, dans l'ordre. Pour chacune : ce que c'est, ce qui est en jeu, ce qui est en place aujourd'hui, ta recommandation en premier avec « (Recommandé) », et ce qu'on casse si on se trompe. Une question de design se pose avec une capture du vrai écran (build local avec GAME_ENABLED et ENGINE_ENABLED, ou l'aperçu propriétaire), pas avec sa description.
4. Après chaque réponse, consigne-la tout de suite, datée, là où vit la question (ENGINE.md, marketing/campaigns/README.md, CHANTIERS.md), puis passe à la suivante. « On verra » se note aussi.
5. Toute réponse qui demande du code devient un item de la section A de CHANTIERS.md, assez précis pour qu'une session autonome le fasse sans me reposer la question. Toute réponse qui demande un geste de ma part devient un item de la section D.
6. À la fin : mets à jour la ligne « Décisions qui attendent Antoine » de CLAUDE.md, ajoute l'entrée de JOURNAL.md, ouvre une PR de doc seule et merge-la quand elle est verte (/livrer lu, pas appelé).

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
