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
| **A. Le travail autonome**, en quatre lots | Une session seule, une PR par lot (A7 : une PR par item) | Session cloud | Maintenant. A7 dans l'ordre de ses dépendances ; A8 à tout moment (A1 à A6 livrés le 2026-09-29) |
| **B. Design sync** | Une session sur ta machine | Claude Code en local : l'autorisation Claude Design ne s'obtient que là | Maintenant (A1, A2, A4 et A5 sont livrés), puis de nouveau après A7.10 |
| **C. Tes décisions**, une par une | Toi, guidé, avec une recommandation par question | N'importe quelle session | **Tranchées le 2026-09-29** (C18 close à part, par la session D). Restent C23, pas urgente, C24 (née d'A3), et la validation de la spécification de A7.3 quand elle sera écrite |
| **D. Tes actions**, pas à pas | Toi, accompagné | Session cloud | Selon ce qui est prêt. D10 (l'indexation) est prêt tout de suite. D2 attend les bons à tirer nº7 et nº8, la recette (D9) et, pour le moteur, tout A7.3 |
| **E. La veille** | Personne | — | Rien à lancer avant un déclencheur |

**L'ordre conseillé** : A7 (A7.1 et A7.3.a, la spécification, d'abord :
ce sont les plus longs). B dès que tu as un créneau sur ta machine (A1, A2,
A4 et A5 sont livrés), puis D. La section C a été tranchée
le 2026-09-29.

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
- A7.1 avant A7.6, car la slide sans prix suppose que seule une cible
  désigne ;
- A7.11 avant A7.10, car la vue propriétaire ne se teste que sur
  l'émulateur ;
- A7.3 avant A7.4, parce que les liens promettent ce que le moteur fait ;
- A7.12.a avant les annuaires de D10.

Le jeu (A7.7, A7.8, et A7.9 pour sa part) n'attend rien du moteur.
**Commencer par A7.1 et A7.3.a** : ce sont les plus longs, et A7.3.a
revient à Antoine pour validation.

#### A7.1 — Aucun repère ne désigne l'étape qui freine (C1)

**Décidé** : les repères d'activation (20-40 %) et de churn logo (1-2 %/mois)
restent affichés comme **contexte**, et ne désignent plus rien. Seule une
**cible d'équipe** nomme l'étape qui freine. La population du churn est
reformulée : 1-2 % vaut pour le « SaaS B2B à panier élevé », pas pour « les
produits vendus aux petites entreprises ». Source : ChartMogul, médiane de
6,1 %/mois sous 25 $ d'ARPA et de 2,2 % au-dessus de 500 $.

| Où | Quoi |
|---|---|
| `lib/engine/catalog-shape.ts:174` et `:223` | `designates: false` pour `act.rate` et `ret.logo-churn`. Garder le champ (tous à `false`) ou le retirer : c'est un choix d'implémentation. Mettre à jour les commentaires de `diagnose.ts` (l. 15-35) et de `catalog-shape.ts` (l. 31-32) |
| `lib/engine/example.ts:82` | L'exemple §6.0 n'a aucune cible (`targets: {}`) et ne nommerait plus de fuite. Lui donner des **cibles d'équipe** qui gardent un diagnostic `clear` sur l'activation et la slide « fuite ». Par exemple, activation 20 % et churn logo 2 % ; les valeurs restent libres. L'exemple doit dire que ce sont les cibles de l'équipe fictive |
| `content/engine-catalog.ts:486-487` | La réserve du churn : « pour le SaaS B2B à panier élevé ; les petits paniers tournent bien plus haut… ». En FR comme en EN |
| `content/glossary-deep.ts:758-759` (page churn) et `:886-887` (page rétention, « 97-99 % … pour des produits vendus aux petites entreprises ») | La même affirmation et la même correction. C'est de la copie validée qui change : elle repasse « à relire » |
| `content/engine-copy.ts` | La promesse (l. 89-90, « sauf deux repères publiés que la page nomme ») ; l'encart de durée (l. 122-123, « le moteur compare alors aux deux repères publiés ») ; l'écran des cibles (l. 1408-1409) ; la FAQ 3 (l. 1544, « Deux seulement servent à désigner… ») ; `diagnosis.notEnough` (« Pas assez de repères pour conclure » : ce sont des cibles qui manquent) ; `levelBody` (« ni sur son repère »). Chercher aussi `referenceDesignates` et les phrases `belowReference`, `aboveReference` et `maybeBelow`, qui ne servent plus à désigner |
| `deck/ask-defaults.ts:33` | La valeur par défaut de la demande à copier prend « la borne prudente d'un repère qui désigne » : il n'y en a plus |
| Tests | `catalog-shape.test.ts:39-40` attend désormais zéro repère désignant. `diagnose.test.ts`, `phrases.test.ts:172`, les tests du deck et `e2e/engine-*.spec.ts` suivent. **Non-vacuité** : remettre `designates: true` sur le churn doit faire rougir au moins un test |
| Hors code | La spec §6.6 d'`ENGINE.md` à relire contre la décision 5 renversée. Le bon à tirer nº8 cite l'exemple §6.0 et ces phrases : le signaler à l'agent des bons à tirer, qui remet la page d'accord avec le code |

#### A7.2 — « Moteur de growth » en français (C2)

**Décidé** : le moteur s'appelle « Moteur de growth » en français (« Ton
moteur de growth », avec « growth » en minuscule dans le texte courant),
toujours "Growth engine" en anglais. **L'adresse `/aarrr-funnel-template` ne
change pas.**

| Où | Quoi |
|---|---|
| `content/engine-copy.ts` | `breadcrumb` (l. 76), `title` (l. 81), l'en-tête du tableau (l. 189) et le pied de slide (l. 1017). Les deux demandes à copier (l. 523 et 533, « un point sur notre moteur de croissance ») parlent du moteur **de l'entreprise**, pas de l'outil : elles gardent « croissance » |
| `content/legal.ts:239` et `:253` | La confidentialité nomme l'outil : elle suit, et `e2e/legal.spec.ts` avec elle |
| `app/(app)/admin/preview/page.tsx:40` | Le nom affiché dans l'aperçu propriétaire |
| Commentaires | `updated-at.ts:30` et `i18n/routes.ts:41` |
| Ne change pas | `comparisons.ts:316` (« pas un moteur de croissance » : l'usage générique) et le titre `meta.title` (« Modèle de funnel AARRR… », qui porte la requête) |
| Hors `src/` | Les textes de lancement qui nomment l'outil : `marketing/kit.md`, `marketing/README.md`, `marketing/campaigns/README.md`, `competitive-brief.md` et `marketing/campaigns/engine/*.md`. Une recherche `grep -rn "oteur de croissance"` fait l'inventaire ; garder chaque usage générique |
| Copie | Chaque chaîne renommée repasse « à relire ». Le bon à tirer nº8 suit (agent des bons à tirer) |

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

**Dans l'ordre, et chaque étape attend la précédente :**

| # | Quoi | Précisions |
|---|---|---|
| A7.3.a | **La spécification**, écrite par une session dans `ENGINE.md` (une section neuve, sur la forme du §4 au §9) | Le catalogue SLG : ses étapes, ses chiffres (même règle qu'aujourd'hui : des comptes, pas des pourcentages ; trois par étape), leurs formules, leurs sources par outil (CRM) et leurs pièges. La vue hybride, la liaison PLG → ventes, le deck (quelles slides se dédoublent, lesquelles s'additionnent), le fichier de sauvegarde et sa migration (`EngineProfile` est déjà une union), et l'exemple rempli d'un hybride. Le catalogue de l'instrument d'audit (`audit-catalog.ts`, profil `b2b-assiste`) peut inspirer les chiffres, mais la décision 6 interdit d'importer `lib/audit`. **Toute question produit rencontrée part en section C, avec une recommandation** |
| A7.3.b | **La validation par Antoine** | La spécification revient en section C, comme une question. Rien ne se code avant sa réponse |
| A7.3.c | **Le code**, sur le modèle du moteur actuel | Moteur pur dans `lib/engine/`, catalogue et copie dans `content/engine-*.ts` (« à relire »), la vue sous `aarrr-funnel-template/_engine/`. Tests du moteur pur avec leur non-vacuité, e2e dans les deux langues, à 1 280 et 390 px, par l'aperçu propriétaire. Le canari « rien ne quitte le navigateur » couvre la nouvelle saisie |
| A7.3.d | **Le bon à tirer** de la copie neuve | Par l'agent des bons à tirer, avec `/bon-a-tirer`, construit depuis le code |
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
| Mesure | Chaque lien porte un événement d'entrée avec sa source, sur le modèle de `game_entry_clicked` (`detail` = la page), déclaré dans le vocabulaire de `lib/analytics/`, pour que `/admin/stats` dise d'où viennent les ouvertures |
| Tests | Un e2e par page : le lien existe moteur ouvert et mène à `/{locale}/aarrr-funnel-template`. Un test sur un build fermé : il n'existe pas (les specs « jeu fermé » montrent la façon de faire) |
| Quand | Construit avant l'ouverture (D2), après A7.3 : les liens promettent ce que le moteur fait, hybride compris |

#### A7.5 — Relier un Tour après coup (C8)

**Le constat** : la case « Comparer avec ce Tour » n'existe que sur la carte
de départ (`Setup.tsx:209`, `tour && !editing`). Un Tour fait après le début
du moteur, ou une case décochée par mégarde, ne peut donc plus jamais être
relié. Le tableau n'affiche alors rien (`Board.tsx:170-182`), alors que le
miroir sans Tour invite justement à en faire un.

**Décidé** (`ENGINE.md` §8.5) :

| Où | Quoi |
|---|---|
| `_engine/Mirror.tsx` et `Board.tsx` | Un troisième état du miroir, `data-state="unlinked"`, quand un Tour est sur l'appareil et `state.tourLink` est nul : le titre du miroir, une ligne (« Tu as fait le Tour le {date} ({score}/100). Le relier compare ce que tu y as déclaré à ce que tu retrouves ici. »), et un bouton « Relier ce Tour » qui pose `tourLink` comme le fait la carte de départ. Même style que l'état `none`. Sans score, la variante sans score qui existe déjà (`mirrorTakenAtNoScore`) |
| `_engine/Setup.tsx` | La case de liaison apparaît aussi dans les Réglages (`editing`), pour relier ou délier. Délier ne supprime pas le Tour de l'appareil |
| Copie | La ligne et le bouton, en FR et en EN, « à relire » |
| Tests | Un e2e du parcours complet : moteur commencé sans Tour → invitation → un Tour déposé sur l'appareil → retour au tableau → état `unlinked` → « Relier ce Tour » → miroir `linked`. Et relier puis délier par les Réglages. Dans les deux langues, à 1 280 et 390 px. Le canari « rien ne quitte le navigateur » tient toujours : relier ne fait que lire `tdg.results.v1` |

#### A7.6 — La slide « fuite » d'une étape sans prix (C9)

**Décidé** (`ENGINE.md` §9.3) : quand le diagnostic est `clear` sur une
étape **sans prix** (rétention à J30, part recommandée), la slide `leak`
existe au lieu d'être omise. Quand le gain est **inférieur à un client**,
l'omission est gardée.

| Où | Quoi |
|---|---|
| `lib/engine/deck.ts#buildLeak` (l. 355-356) | Séparer les deux cas que la condition `!impact \|\| less-than-one` confond. Sans prix : un titre `leakClearUnpriced` (« {Étape} freine le moteur : {valeur}, pour {cible}. »), sans la carte « Le calcul » en quatre lignes (il n'y a pas de chaîne à montrer), avec la colonne « À côté » comme d'habitude, et un pied qui dit pourquoi il n'y a pas de montant. Titre et corps sortent de la même fonction (`ENGINE.md` §9.3, règle « titre = corps ») |
| `content/engine-copy.ts` | Le gabarit du titre et le pied, en FR et en EN, « à relire ». `{cible}` suit `targetPhrase`, qui après A7.1 ne dit plus que « notre cible » |
| Export texte et notes | `deckMarkdown` et les notes d'orateur suivent la même slide |
| Tests | Un état où la rétention à J30 est seule sous sa cible : la slide existe, son titre ne contient aucun montant, et aucune chaîne « Le calcul » n'est rendue. Un état où le gain vaut moins d'un client : pas de slide. **Non-vacuité** : remettre l'omission fait rougir le premier test |
| Ordre | Après A7.1 : sans repère qui désigne, le cas `clear` ne vient plus que d'une cible |

#### A7.7 — L'encart du jeu sous le bouton principal, sur desktop (C10)

**Décidé** (`GAME-BRIEF.md` §15.4) : sur desktop, l'encart du jeu passe
**sous** la rangée de boutons du résultat, dans la colonne de droite. Sur
mobile, rien ne change : il est déjà après le bouton et la carte de partage.

| Où | Quoi |
|---|---|
| `app/(app)/r/[id]/ResultView.module.css` (`.slotGame`, l. 176 et 297) et le commentaire de `ResultView.tsx:556-564` | L'ordre desktop : l'encart après `.slotCta`. Même ordre pour le visiteur et le propriétaire (le premier rendu est celui du visiteur, et un ordre qui dépend de `isOwner` décalerait la page après le montage) |
| `src/__tests__/result-reading-order.test.ts` et `e2e/result-composition.spec.ts` | L'ordre de lecture épinglé suit, pour les quatre variantes |
| Un e2e de mesure | Sur `/r/sample`, en vue visiteur, à 1 280 px : le haut du bouton « Fais ton propre Tour » est **au-dessus** du haut de l'encart. Même mesure à 390 px. **Non-vacuité** : l'ancien ordre fait rougir le test |
| Hors code | `CLAUDE.md` citait « ~30 px » : c'était 350 px mesurés le 2026-09-29, et la ligne est corrigée dans la même séance |

#### A7.8 — L'amende du jeu plafonnée à 75 000 € (C14)

**Décidé** (`GAME-BRIEF.md` §5, règle 5) : le contrôle DGCCRF inflige
**75 000 €**, le maximum légal pour une entreprise, au lieu de
60 000 + radar × 500 (de 97 500 € à 110 000 €).

| Où | Quoi |
|---|---|
| `lib/game/levels/retention.ts:84` | L'amende du contrôle vaut 75 000 €. La forme est libre (un plafond, ou une constante qui remplace `fineBase` et `finePerPoint`), mais l'amende ne doit jamais dépasser le plafond, à tout radar |
| La source | Vérifier sur Légifrance l'article qui fixe le plafond de l'amende administrative pour un manquement aux règles de résiliation (15 000 € pour une personne physique, 75 000 € pour une personne morale), et le citer dans le commentaire du code et dans la règle 5 de `GAME-BRIEF.md`. **Si le texte dit autre chose, s'arrêter et remonter en section C** |
| Tests | Les tests du moteur du jeu (série Q4 de `GAME-BRIEF.md`) : l'amende vaut 75 000 € à radar 75 et à radar 100. **Non-vacuité** : l'ancienne formule fait rougir le test |
| Copie | L'événement dit « amende de {fine} » : le texte ne change pas, seul le nombre change. Les textes de lancement qui citeraient un montant sont à vérifier (`grep -rn "97 500\|110 000" marketing src`) |

#### A7.9 — La bande de l'accueil en liens mesurés, et le bandeau mesuré (C15)

**Décidé** (`GAME-BRIEF.md` §13.3 E) : chaque carte de la bande « Le Tour en
trois parties » (`components/brand/SpaceStrip.tsx`) devient un lien vers son
espace **quand cet espace est ouvert**. Un espace fermé reste une carte
« bientôt », sans lien. Toutes les entrées de la bande et du bandeau sont
mesurées.

| Où | Quoi |
|---|---|
| `SpaceStrip.tsx` | La carte entière est cliquable (un seul lien par carte, pas de bouton en plus) : le Tour vers `/quiz`, le moteur vers `/{locale}/aarrr-funnel-template`, le jeu vers `/{locale}/game`. Elle reste visuellement secondaire sous « Démarre ton Tour » : un survol et un focus visibles, et pas de remplissage rouge. Le lien vers `/quiz` est `hard`, comme ailleurs (`cross-root-links.test.ts`) |
| Mesure | Le jeu : `game_entry_clicked` avec `home_strip` depuis la bande et `space_band` depuis les pastilles de `SpaceBand.tsx`, les deux ajoutés au vocabulaire (`lib/game/events.ts`, `goatcounter-api.ts:112`). Le moteur : son événement d'entrée (A7.4) avec les mêmes sources. Le Tour : l'événement de démarrage existant, avec la source `home_strip`. `/admin/stats` affiche ces nouvelles sources |
| Tests | Un e2e par carte ouverte (lien et événement), la carte fermée sans lien (build sans drapeau), et la même chose pour les pastilles. Accessibilité : un seul nom accessible par carte, et le contraste des états de survol (convention 7) |
| Quand | Le jeu peut en profiter dès son ouverture. La carte du moteur suit A7.4 |

#### A7.10 — Chez le propriétaire, « Partager » est le primaire (C16)

**Décidé** (2026-09-29, captures de la vue propriétaire à l'appui) : sur son
propre résultat, le propriétaire a **« Partager ce résultat » comme seul
bouton plein** (rouge, primaire). « Refaire le Tour » devient secondaire
(contour). La vue du **visiteur ne change pas** : son primaire reste « Fais
ton propre Tour → », et le bouton de la carte de partage reste secondaire
chez lui.

**Pourquoi il n'y a pas de brief design** : le « never primary » de
`design/ds-extension-03-return/components/result/ShareCard.prompt.md` se
justifie par le primaire du visiteur, et le retour design n'avait pas couvert
le propriétaire (commentaire de `ResultView.tsx`, au-dessus de la rangée de
boutons). La décision comble ce trou. Le contrat est précisé dans le dépôt, et
part chez Claude Design à la prochaine synchro (B3).

| Où | Quoi |
|---|---|
| `components/result/ShareCard` | Une variante « primaire » du bouton de partage, choisie par la page (`isOwner`), jamais par défaut |
| `app/(app)/r/[id]/ResultView.tsx` et `.module.css` | Chez le propriétaire, « Refaire le Tour » passe en `secondary`. **Sur mobile, la carte de partage passe au-dessus de la rangée de boutons** chez le propriétaire, pour que le primaire ne tombe pas sous un secondaire (la raison de l'essai annulé). Réécrire le commentaire de la rangée de boutons. `isOwner` n'est connu qu'après le montage : le premier rendu reste celui du visiteur. Mesurer le décalage que la bascule produit (le texte du bouton change déjà aujourd'hui) et le garder sous le seuil CLS des e2e existants |
| Contrat de design | `ShareCard.prompt.md` et son aperçu design-sync disent : « secondary for a visitor, primary for the owner ». Même chose dans `.design-sync/` si le contrat y est recopié |
| Tests | `result-reading-order.test.ts` et `e2e/result-composition.spec.ts` : l'ordre propriétaire à 390 px (partage avant la rangée). Un e2e propriétaire, dans les deux langues, à 1 280 et 390 px, dit que le seul bouton `primary` visible est « Partager ». Le propriétaire se simule avec `seedOwnedResult`. Mais `/r/sample` ne passe pas d'identifiant à `ResultView` et ne rend donc **jamais** la vue propriétaire : ces e2e passent par un vrai `/r/<id>` sur l'émulateur Firestore (A7.11, à faire avant) |
| Mesure | L'événement de partage existe déjà. Noter dans le journal la date du changement, pour lire l'avant et l'après dans `/admin/stats` |

#### A7.11 — Les e2e de `/r/<id>` par le vrai chemin, sur l'émulateur Firestore (C17)

**Décidé** (Antoine a délégué, la session a tranché le 2026-09-29) : **aucune
porte de test dans le code de production.** Les e2e rendent un vrai
`/r/<id>` lu dans l'**émulateur Firestore**, en CI. Pourquoi : `firebase-admin`
lit `FIRESTORE_EMULATOR_HOST` nativement, donc la lecture Firestore et la
sérialisation vers le client (là où `rawPoints` a fui deux fois) se testent
sans ajouter une seule branche à la route publique la plus sensible.

| Où | Quoi |
|---|---|
| `.github/workflows/ci.yml` | Démarrer l'émulateur Firestore avant Playwright. Deux façons possibles : `firebase-tools` épinglé, ou l'image officielle de l'émulateur épinglée par digest. La session chiffre les deux (temps de job, poids) et prend la plus légère. `workflows-pinned.test.ts` doit rester vert : tout est épinglé. Un nouveau `devDependency` déclenche la barrière §0 de `/livrer`, et donc la question à Antoine au merge |
| Identifiants | `lib/firebase/admin.ts` exige trois variables. En CI : un projet `demo-…` (le préfixe que les émulateurs traitent comme hors ligne) et une clé RSA jetable générée au début du job, jamais commitée. Vérifier que `cert()` l'accepte. **Aucun changement à `admin.ts`** ; s'il en fallait un, s'arrêter et remonter en C |
| Les données | Un global setup Playwright écrit dans l'émulateur deux ou trois résultats (un goulot net, un partagé, un « à niveau »), par `lib/submissions/repository.ts` lui-même plutôt que par un doublon |
| Les specs | Les e2e de composition de `/r/sample` sont doublés sur un vrai `/r/<id>` : payload compté (convention 11, `NEXTJS.md` §1.8), action déterministe, image de partage, encart du jeu. La vue propriétaire (`seedOwnedResult` avec l'identifiant écrit) sert à A7.10. **Sans `FIRESTORE_EMULATOR_HOST`, ces specs sautent** avec leur raison, comme celles de l'admin sans mot de passe |
| Non-vacuité | Remettre un prop brut (`rawPoints`) dans le payload du vrai chemin doit faire rougir la spec de payload |
| Doc | `TESTING.md` : comment lancer l'émulateur en local, et pourquoi il n'y a pas de porte. `relecteur-securite` sur le diff du workflow (une clé jetable dans un log public ne doit rien ouvrir) |
| Ordre | Avant A7.10, qui en a besoin pour tester la vue propriétaire |

#### A7.12 — Les captures : le Tour à jour, le moteur et le jeu provisoires (C21)

**Décidé** (`marketing/campaigns/README.md` §10, réponse D3) : capturer
maintenant, refaire à l'ouverture.

| # | Quoi | Comment |
|---|---|---|
| A7.12.a | **Refaire les captures du Tour** (`marketing/assets/01` à `05`, `og-*`). Elles datent du 2026-09-14, d'avant la synthèse I + B | Mêmes noms, même format que `marketing/kit.md` « Les captures » (2×, PNG palette, deux langues, desktop et mobile). Contre un build de production local. **À faire avant D10**, puisque les annuaires s'en servent. Si A7.7 (l'encart) ou A7.10 (le partage) sont livrés entre-temps, les captures de résultat suivent |
| A7.12.b | **Des captures provisoires du moteur et du jeu** | Dans `marketing/assets/`, préfixées `provisoire-` et listées dans `kit.md` comme telles. Le moteur par l'aperçu propriétaire ou un build local ouvert ; l'exemple rempli (§6.0) plutôt qu'un vrai jeu de chiffres. Le jeu : le hub, un trimestre, la page de décembre |
| A7.12.c | **Les refaire à l'ouverture** de chaque produit (D2), contre la production, et supprimer les `provisoire-` | Fait partie de la vérification d'ouverture |

#### A7.13 — « Qui est derrière ? » : une réponse qui nomme Antoine (C22)

**Décidé** (`GROWTH-PLAN.md`, option A précisée le 2026-09-29) : c'est une
question de calendrier, pas d'anonymat. La réponse nomme Antoine,
simplement. La promotion reste discrète pour l'instant : pas de LinkedIn, pas
de lancement en grande pompe, et `linkedin` reste dans `EXCLUDED`
(`scripts/utm-channels.mjs`) tant qu'Antoine ne lève pas la réserve.

| Où | Quoi |
|---|---|
| `marketing/launch/show-hn.md:49`, `marketing/campaigns/engine/show-hn.md:77`, `marketing/campaigns/game/show-hn.md:90` | La ligne « Who's behind this? » : une réponse courte qui donne son nom et renvoie au pied de page et à `/about`, sans insister et sans lien vers LinkedIn. En FR là où le texte existe en FR. « À relire » |
| `marketing/README.md:14`, `marketing/campaigns/brand-review.md:78` et le §8 de `marketing/campaigns/README.md` | La règle « pseudonyme » décrite comme « discrète pour l'instant » |
| **D'abord, l'outillage** | Deux consignes appliquent encore l'ancienne règle et arrêteraient cet item : `.claude/agents/relecteur-copie.md` §5 (« Jamais le nom d'Antoine ») et `.claude/skills/livrer/SKILL.md` §3 (« jamais le nom d'Antoine dans `marketing/` »). Les réécrire : le nom seulement dans la réponse à « qui est derrière ? » (C22), et jamais LinkedIn pour l'instant. Même chose pour le commentaire de `src/__tests__/utm-channels.test.ts:21-25` (« the author is never named » devient « not for now »), le test gardant `linkedin` exclu. Non fait dans la PR de la séance : `.claude/` n'est pas dans la liste « doc » de `scripts/vercel-ignore.sh`, et la PR devait rester de la doc seule |
| Ne change pas | Le compte qui poste reste celui du projet (`tourdegrowth`). `CLAUDE.md` et `GROWTH-PLAN.md` sont déjà à jour |

### A8 — L'audit GEO, joué sans installer le plug-in

**D'où ça vient** : le 2026-09-29, Antoine a proposé le plug-in
« claude-site-audit » (Rob Spence, MIT, 1.0.0). Il a été lu, **pas installé** :
- l'archive ne contient pas ses 17 contrôles (`references/checks.md`), sa
  notation (`scoring.md`) ni son générateur de PDF ;
- il appelle des outils de claude.ai (`web_fetch`, `present_files`) ;
- il est cadré pour le secteur public américain (ADA Title II, HUD) ;
- il n'a pas de fichier de licence.

**Décidé** : garder l'idée, pas l'outil. L'angle **GEO** (être lu et cité par
les moteurs de réponse IA) n'a jamais été audité ici : le site n'a pas de
`llms.txt`, `robots.ts` laisse tout passer (`userAgent: "*"`), et ni
`JOURNAL.md` ni `GROWTH-PLAN.md` n'en parlent. L'audit SEO du 25/09 ne l'a pas
couvert.

| # | Quoi | Comment |
|---|---|---|
| A8.1 | **Relever l'état GEO de la production**, en lecture seule contre `www.tourdegrowth.com`, dans les deux langues | Ce que servent `/robots.txt` et `/llms.txt`. Le JSON-LD par type de page (accueil, glossaire, comparaisons, pages « porte ouverte », `/how-it-works`) et sa validité. Une réponse citable dans le HTML servi sans JavaScript : la définition en tête de page, une date visible, un auteur. Le `lang` et les `hreflang`. Ne pas refaire ce que la CI couvre déjà (accessibilité, contraste, métadonnées de base) |
| A8.2 | **Corriger ce qui ne demande aucun choix** : un JSON-LD invalide, un `hreflang` manquant, une définition absente du HTML servi | Une PR, avec ses gardes. Toute copie neuve est « à relire » |
| A8.3 | **Remonter en section C ce qui est une décision**, avec une recommandation | Au moins deux décisions : **laisser ou bloquer les robots d'IA** (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot), qui entraînent des modèles autant qu'ils citent ; et **publier un `llms.txt`**, dont le contenu est de la copie et une vitrine publique |

Le plug-in n'entre pas dans le dépôt, même en `--manuel`. Si l'amont publie
les fichiers manquants, la question repart en section C.

---

## B. Design sync — sur ta machine

**Pourquoi en local** : l'outil `DesignSync` demande une autorisation qui ne
s'obtient que depuis une session interactive sur ta machine (`JOURNAL.md`,
brief d'extension 03). Une session cloud construit et valide le bundle, mais
ne peut pas le pousser.

| # | Quoi | Détail |
|---|---|---|
| B1 | **Pousser le bundle** vers le projet Claude Design existant (`23b9671c-a55b-452e-aa41-39906ee71ba8`, créé le 2026-09-11) | Au 2026-09-29 : 77 composants, 244 cellules, 77 aperçus sur 77 rendus. Lire `.design-sync/NOTES.md` avant toute commande : ce dépôt est une app, pas un paquet. Trois avertissements sont permanents et attendus : « Impact », et `GRID_OVERFLOW` sur `DefinitionPopover` et `QuarterNews`. **Ne pas appliquer** le `cardMode: "single"` suggéré, qui masquerait des histoires |
| B2 | **Le brief S-15 : les primitives de formulaire.** Elles vivent hors du système, en deux copies. Côté moteur : `Field`, `NumberField`, `TextField`, `Select`, `Choices`, `CheckField`, `MonthField` et `SegmentedField`, sous `src/app/[locale]/aarrr-funnel-template/_engine/_ui/`. Côté audit : sous `src/app/(app)/admin/audit/` | Écrire `design/DS-EXTENSION-BRIEF-04.md`, sur la forme des briefs 01 et 03, puis l'envoyer à Claude Design. Le retour arrive par `design/ds-extension-04-return/` ou par « Send to Claude Code Web ». La promotion dans `core/` devient ensuite un lot A |
| B3 | **Re-synchroniser** après A1, A2, A4, A5 et A7.10 | Ces lots changent des composants et leurs aperçus. **Ni A1, ni A2, ni A4, ni A5 n'ont pu reconstruire le bundle** : le convertisseur (`.ds-sync/`) n'est pas dans une session cloud. A1 a changé l'aperçu `Button` (une histoire `Quiet` de plus), le contrat de `Button` et `conventions.md` (le bouton texte, les trois épaisseurs de trait). A2 ajoute deux composants, `DotGrid` et `DotLegend` (`viz/DotGrid.tsx`, trois histoires chacun, dans `componentSrcMap`), l'échelle `--slide-*` complétée et les quinze jetons `--viz-cat-*` / `--viz-seq-*` retirés, et deux passages de `conventions.md`. Attendu : 79 composants, 251 cellules (244 + 1 + 6). A4 n'ajoute aucune cellule mais change quatre contrats : `DefinitionPopover` (un placement `auto`, un seul panneau en couche supérieure, que monte `GlossaryTerm` ; le `docked` dessiné en place perd son bouton de fond et ses `z-index`), `GlossaryTerm` (ses histoires `Open` et `French` ouvrent maintenant un popover en couche supérieure : **regarder la capture de ces deux cartes**, le panneau peut sortir de sa cellule), `Segmented` (le remplissage est le `::before` de la piste, positionné par ancre) et `Disclosure` (l'ouverture glisse), plus un passage de `conventions.md`. A5 renomme des props et des histoires sans ajouter de cellule, et ajoute la section « Variant names » de `conventions.md`. Les histoires : `Mobile` → `Small` et `Desktop` → `Medium` (quiz et résultat), `Compact` → `Small` (`Button`, `Segmented`, `ToneToggle`, `ClickPill`), `Frame` → `Call` et `FrameMoods` → `CallMoods` (`DgFace`). Les props : `size` en `xs`/`sm`/`md`/`lg`/`auto` partout, `DotGrid`/`DotLegend` en `medium`, `DgFace` en `framing`, `Tag` en `tone="alert"`. Le contrat écrit de `StatTile` dans `config.json` suit. À reconstruire et valider avant de pousser. A7.10 changera le contrat de `ShareCard` (primaire chez le propriétaire) |

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
| C1 | Les repères qui désignent la fuite | **Aucun repère ne désigne** : seule une cible d'équipe nomme l'étape. Population du churn reformulée (« SaaS B2B à panier élevé »). Non tranchée auparavant dans le nº8, sa carte y est désormais remplie | `ENGINE.md` décision 5 | A7.1 |
| C2 | Nom et adresse du moteur | **« Moteur de growth »** en français, "Growth engine" en anglais. **Adresse `/aarrr-funnel-template` gardée** : Antoine a délégué le choix sur le seul critère SEO, et la session l'a vérifié sur les résultats de recherche du jour | `ENGINE.md` décision 1 | A7.2 |
| C3 | Crédit tourdegrowth.com sur les slides | Gardé : présent, retirable | `ENGINE.md` décision 2 | — |
| C4 | Périmètre de la v1 | **Le B2B assisté entre en v1.** Un type (SaaS B2B), puis deux motions cochables, PLG et SLG. L'hybride en « deux moteurs, un total », jamais en face-à-face. L'ouverture du moteur attend | `ENGINE.md` décision 3 | A7.3 (spécification, validation, code, bon à tirer) |
| C5 | Slide « déclaré × mesuré » | Gardée décochée | `ENGINE.md` décision 4 | — |
| C6 | Moteur public, distinct de l'audit | Confirmé. Antoine tient l'audit privé pour un doublon : **la mission D4 tranche**, avec une colonne « le moteur le faisait déjà ? ». Les trois clauses du contrat sont précisées en D5 | `ENGINE.md` décision 6, `AUDIT-PLAN.md` §4 | D4, D5 |
| C7 | Liens d'ouverture du moteur | Les trois pages gardent leur lien ; **pas de section à part sur l'accueil** (la carte de la bande devient le lien) ; pas de pied de page | `ENGINE.md` décision 7 | A7.4 |
| C8 | Le miroir, Tour présent non relié | **Une ligne et un bouton « Relier ce Tour »**, et la liaison dans les Réglages. L'invitation « Fais le Tour » menait à une impasse | `ENGINE.md` §8.5 | A7.5 |
| C9 | Slide fuite d'une étape sans prix | **La slide existe**, avec un titre sans argent. Sous un client, l'omission est gardée | `ENGINE.md` §9.3 | A7.6 |
| C10 | Place de l'encart du jeu | **Sous le bouton principal sur desktop**, comme sur mobile. Mesuré : il faisait descendre le bouton du visiteur de 350 px | `GAME-BRIEF.md` §15.4 | A7.7 |
| C11 | Quand montrer l'encart | Gardé : la rétention dans le groupe, partagé compris. Le cas de plusieurs niveaux se tranche à l'ouverture d'un deuxième niveau | `GAME-BRIEF.md` §15.4 | Section E |
| C12 | Noms de zones bilingues | Gardés : « Retention — S'ils reviennent » | `GAME-BRIEF.md` §15.3 | — |
| C13 | « Vingt minutes » | Chronométré à la recette : gardé si la médiane des testeurs tombe entre 15 et 25 minutes | `GAME-BRIEF.md` §7.3 | D9 |
| C14 | Amende du jeu | **Plafonnée à 75 000 €**, le maximum légal pour une entreprise | `GAME-BRIEF.md` §5, règle 5 | A7.8 |
| C15 | Cartes de la bande de l'accueil | **Des liens mesurés** à l'ouverture (`home_strip`), et les pastilles du bandeau mesurées aussi (`space_band`) | `GAME-BRIEF.md` §13.3 E | A7.9 |
| C16 | Primaire du propriétaire | **« Partager » devient le primaire** chez le propriétaire ; « Refaire le Tour » passe secondaire. Le visiteur ne change pas | Ici et en A7.10 | A7.10 |
| C17 | Porte de test pour `/r/<id>` | Déléguée à la session : **pas de porte, l'émulateur Firestore en CI** | Ici et en A7.11 | A7.11 |
| C18 | Projects et Discussions | **Déjà désactivés** (constaté par l'API GitHub). Question non posée : la session D l'a close en parallèle avec D1, le même jour | `JOURNAL.md`, « D1 : les réglages du dépôt » | — |
| C19 | Ce qui est parti de la vague 1 | **Rien.** Et rien ne part avant que le moteur et le jeu soient prêts | `marketing/campaigns/README.md` §10 | D6 |
| C20 | Relancer le Tour sur les réseaux | **Le Tour au seul SEO**, sans fil. L'indexation et les annuaires partent maintenant | `marketing/campaigns/README.md` §10 | D10, A7.12.a |
| C21 | Captures de B et C | **Capturer maintenant**, provisoires, puis refaire à l'ouverture. Celles du Tour datent d'avant I + B | `marketing/campaigns/README.md` §10 | A7.12 |
| C22 | « Qui est derrière ? » | **La réponse nomme Antoine.** C'est une question de calendrier, pas d'anonymat : pas de LinkedIn ni de lancement en grande pompe pour l'instant | `GROWTH-PLAN.md` option A, `marketing/campaigns/README.md` §10 | A7.13 |

### Encore ouvert

| # | Question | Aujourd'hui | Reco |
|---|---|---|---|
| C24 | **La landing mène-t-elle à l'exemple roast ?** Né d'A3.3 (2026-09-29) | `/r/sample?tone=roast` existe : l'échantillon ouvert sur son verdict roast, avec sa propre carte de partage, dans la page et en `og:image`. Mais l'aperçu de la landing a son propre sélecteur de ton, qui change une phrase, et « Voir un exemple » mène toujours à l'échantillon neutre | Que « Voir un exemple » suive le sélecteur : en roast, il mène à `/r/sample?tone=roast`. Le lien tient alors ce que l'aperçu vient de montrer. Pour un post, l'adresse est prête dès maintenant |
| C23 | **L'ordre des lancements du moteur (B) et du jeu (C).** Née de C4 : le moteur attend désormais le lot A7.3, alors que le jeu peut être prêt bien avant. Mais rien ne part avant que les deux soient prêts (C19) | Le calendrier dit B puis C, avec trois semaines entre les deux Show HN | Trancher quand les deux sont prêts. Par défaut, l'ordre du calendrier. Si le jeu attend plus d'un mois après sa recette, C d'abord : un jeu prêt qui attend perd son sujet (le Digital Fairness Act est attendu au quatrième trimestre 2026) |

---

## D. Tes actions, pas à pas

Ce qui ne peut venir que de toi. **Jamais de secret dans une conversation**, et
rien de privé dans le dépôt, qui est public. Cela vaut pour les chiffres de
`/admin/stats`, les données d'une mission d'audit et les noms de clients.

| # | Action | Prête ? | Détail |
|---|---|---|---|
| D2 | **Ouvrir le jeu et le moteur à tout le monde** | Non : il faut les bons à tirer nº7 et nº8 signés, C1 à C15 tranchés, et les liens d'ouverture (C7) construits. **Pour le moteur, en plus : tout le lot A7.3** (le B2B assisté et l'hybride, décidés le 2026-09-29), bon à tirer compris. Le jeu peut ouvrir avant lui | Poser `GAME_ENABLED` et/ou `ENGINE_ENABLED` à `true` dans Vercel (Production), puis **redéployer** (`VERCEL.md` §1.11). Ensuite, la session vérifie la production : pages en 200, sitemap, pied de page, bandeau. Toi, tu demandes l'indexation des nouvelles pages dans Search Console |
| D3 | **Lancer la design sync** | Oui | C'est la section B, sur ta machine |
| D4 | **L'instrument d'audit, phase 1 bis : la mission AB Tasty** | Oui | Voir `AUDIT-PLAN.md` §4. Créer la mission sous `/admin/audit` (profil `b2b-assiste`, sans mandat), et faire partir le jour 1 ce qui est lent (T3, T4). Les T1 se font en libre-service, la définition d'abord. Les T2 se font par système. **Tenir le journal des frictions** dans un fichier local jamais commité dès qu'une friction cite l'entreprise. **Depuis le 2026-09-29 (C6), une colonne de plus par friction : « le moteur le faisait déjà ? »** C'est elle qui dira si l'audit fait doublon avec le moteur public. Critère de sortie : `pending = 0`, exporté. La session corrige les frictions en petites PR, et rien de la phase 2 |
| D5 | **À côté de l'outil** | Oui | Les cinq à dix entretiens (`AUDIT-PLAN.md` §2). La vérification de ton contrat de travail : elle conditionne la phase 3, et c'est la seule question qui la ferme à elle seule. **Trois clauses à relire** (précisées le 2026-09-29) : la **non-concurrence** (couvre-t-elle un outil vendu à des équipes produit B2B, pendant et après le contrat ?), l'**exclusivité ou l'activité annexe** (une activité commerciale à côté demande-t-elle une autorisation ?) et la **propriété intellectuelle** (un logiciel créé « dans l'exercice de ses fonctions » appartient à l'employeur, CPI art. L113-9, et la clause peut aller plus loin). Si une clause est floue, une consultation d'avocat en droit du travail. Le moteur public et gratuit n'est pas concerné au même titre : rien n'y est vendu |
| D6 | **La distribution, vague 1** | **Non : rien ne part avant que le moteur et le jeu soient prêts** (C19, 2026-09-29). Rien n'est encore parti. Le Tour n'aura ni Show HN ni r/SaaS | Textes dans `marketing/launch/` et `marketing/campaigns/`. Tu postes sous pseudo, la session fournit et met à jour les textes. Annuaires dans l'ordre de `GROWTH-PLAN.md` 1.6. **Pas de LinkedIn ni de lancement en grande pompe pour l'instant** (C22 : une question de calendrier, pas d'anonymat) |
| D7 | **La distribution, vague 4** | Après deux semaines de lecture de la vague 1 | La session écrit les pitchs de newsletters et passe honnêtement le produit de chaque auteur au Tour ; tu envoies depuis `contact@`. Pour les listes « awesome », seulement si ton profil GitHub n'affiche pas ton nom (à vérifier d'abord sur github.com/ScratchMe) |
| D8 | **Search Console : les pages du glossaire anglais** | Oui | Au relevé du 2026-09-29, Search Console crédite encore les anciennes adresses `/glossary/*` et aucune `/en/glossary/*` (les `/fr/glossary/*` sont créditées). Côté site, tout pointe vers `/en/` : la 308, la canonique, `hreflang`, `x-default` et le sitemap, vérifiés en production le même jour. Dans Search Console, **Inspection de l'URL** sur deux ou trois `/en/glossary/*` : lire la « canonique sélectionnée par Google », puis **Demander l'indexation**. Si Google a choisi l'ancienne adresse comme canonique, le dire à une session : c'est le seul cas qui demanderait d'agir côté code |
| D9 | **La recette du jeu** (`GAME-BRIEF.md` §7.3), avant d'ouvrir le jeu (D2) | Oui, dès que le nº7 est signé | Cinq testeurs qui ne connaissent pas le sujet, et les critères de §7.3. **Chronomètre chaque partie complète** (C13, 2026-09-29) : « vingt minutes » reste si la médiane tombe entre 15 et 25 minutes. Sinon, donne-moi la médiane : une session réécrit l'encart (`content/game/entry.ts:65`) et les textes de lancement. La relecture juridique du catalogue des cas réels est aussi à toi (`marketing/campaigns/README.md` §9) |
| D10 | **Le Tour au seul SEO, maintenant** (C20, 2026-09-29) | Oui pour l'indexation. **Les annuaires attendent A7.12.a** (les captures du Tour datent d'avant I + B) | Ce ne sont pas des posts, ils partent sans attendre le moteur et le jeu. 1) Search Console, « Demander l'indexation » pour `/en`, `/fr`, les deux pages « porte ouverte » et les quatre « AARRR vs X » (10 min). 2) Les annuaires restants de la vague 1, dans l'ordre de `GROWTH-PLAN.md` 1.6 (Launching Next d'abord), avec les liens `relaunch_tour` de `marketing/kit.md`. Pas de fil X/Bluesky pour le Tour |

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

### Prompt B — la design sync (Claude Code sur ta machine)

```text
Tu tournes sur ma machine, dans mon clone de tourdegrowth. Mission : la section B de CHANTIERS.md.

1. git switch main, git pull, npm ci.
2. Lis .design-sync/NOTES.md en entier avant toute commande : ce dépôt est une app, pas un paquet de composants, et trois réglages non évidents en découlent.
3. B1 — Lance /design-sync pour mettre à jour le projet Claude Design existant (23b9671c-a55b-452e-aa41-39906ee71ba8), sans en créer un nouveau. Recompte les composants, les cellules et les aperçus rendus : au 2026-09-29, c'était 77, 244 et 77/77. Trois avertissements sont attendus (« Impact », GRID_OVERFLOW sur DefinitionPopover et QuarterNews) ; n'applique pas le cardMode "single" suggéré. Tout autre avertissement ou erreur : arrête-toi et explique-moi avant de corriger.
4. Si le bundle ne se construit pas, corrige sur une branche (jamais sur main) et documente la cause dans .design-sync/NOTES.md.
5. B2 — Écris design/DS-EXTENSION-BRIEF-04.md sur les primitives de formulaire (S-15), sur la forme des briefs 01 et 03 : ce qui existe en deux copies (moteur et audit), ce qu'on attend (des primitives dans core/, leurs états, les deux langues, la version nuit), les contraintes (tokens, contraste AA, cibles de 44 px). Montre-le-moi avant de l'envoyer à Claude Design.
6. À la fin, sur une branche : mets à jour la section B de CHANTIERS.md, la ligne « Design system → Claude Design » de CLAUDE.md, et une entrée de JOURNAL.md. Ouvre la PR ; merge-la quand elle est verte.

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
