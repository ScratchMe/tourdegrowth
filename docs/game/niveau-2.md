# GAME-BRIEF.md, niveau 2 — « Comment les gens vous trouvent » (§17)

*Sortie de `GAME-BRIEF.md` le 2026-10-01, telle quelle : le numéro de section n'a
pas changé, et un renvoi « `GAME-BRIEF.md` §17.10 » se lit ici. Un renvoi « §n »
sans nom de fichier, ou « la section n », désigne `GAME-BRIEF.md`, qui garde ce
qui vaut pour tous les niveaux : le résumé, les décisions de la section 4, le
niveau 1, l'intégration, le drapeau et ce que l'implémentation a tranché. Chaque
niveau spécifié au-delà du premier a son fichier dans `docs/game/`.*

---

## 17. Le niveau 2 « Comment les gens vous trouvent » — spécification, validée (C30, 2026-10-01)

Écrite le 2026-09-30, le jour où Antoine a retenu ce niveau pour le deuxième du jeu, avant le lancement. **Ce qui existe déjà** : le moteur du jeu sert désormais les deux sens (un chiffre qui doit baisser, un chiffre qui doit monter), et le modèle du niveau 2 est codé en brouillon, sans page ni texte (`src/lib/game/levels/acquisition.ts`, testé par `src/lib/game/__tests__/acquisition.test.ts`). Tous les chiffres de cette section sont ceux que ce code produit. **Rien d'autre n'est construit** : ni page, ni téléphone, ni entrée depuis le Tour ; la copie est écrite depuis le 2026-10-01 (A12.c, `content/game/acquisition.ts`). **Antoine l'a validée le 2026-10-01** (C30, §17.10), les cinq recos retenues : la construction peut partir (§17.11).

Les textes en français de cette section sont des **premiers jets** : ils passent au statut « à relire » en entrant dans le code (convention 6), l'anglais s'écrit à ce moment-là, et le tout part dans un bon à tirer. Ce document n'a pas d'espaces insécables : elles se posent à l'entrée dans le code, devant `%` et `€` et dans les groupes de chiffres compris, que la garde de typographie ne voit pas.

### 17.0 En une page

- **L'univers.** Le DG a quitté Flixo et t'a emmené avec lui (§11) : il dirige maintenant **Pédalix**, une boutique en ligne de vélos et d'équipement. 2 000 nouveaux clients par mois en janvier. Le board en veut 3 000 en décembre.
- **Ce qui change par rapport au niveau 1** : le chiffre du board **monte** au lieu de descendre ; une économie de boutique au lieu d'un abonnement ; le téléphone montre le chemin d'un visiteur, du résultat de recherche au panier ; le contrôle de la DGCCRF finit en **transaction pénale**, pas en amende administrative ; huit astuces et neuf chantiers honnêtes neufs.
- **Ce qui ne change pas** : tout le reste. Les décisions de la section 4 tiennent telles quelles : une année, deux chantiers par trimestre, aucun chiffre sur les cartes, le DG en visio avec ses ordres, la confiance et le radar floutés, la révélation de décembre, le catalogue complet.
- **L'équilibrage.** Chaque carte du niveau 2 tient le rôle d'une carte du niveau 1 : même place dans la main, même poids. Les quatre années de référence reproduisent donc le profil qu'Antoine a validé en quatre itérations : l'année honnête A a exactement la patience du niveau 1 (51, 42, 46, 73), l'année qui obéit subit le contrôle au troisième trimestre, l'année timide est virée en juin (§17.6).
- **Tranché le 2026-10-01** : les cinq questions du §17.10, toutes selon la reco. La plus lourde était la première : le chiffre du board est le nombre de **nouveaux clients par mois**, pas le taux de conversion que prévoyait le §11.1.

### 17.1 Pourquoi ce niveau plutôt qu'un autre

Comparaison faite le 2026-09-30 sur le catalogue réel du niveau 1 (`content/game/retention.ts`) et les esquisses du §11 ; Antoine a retenu l'acquisition le même jour.

| | Acquisition | Activation | Referral | Revenue |
|---|---|---|---|---|
| Astuces absentes du niveau 1 | **6 sur 8** | 3 sur 8 | 3 sur 8 | 4 sur 8, encore sur un abonnement |
| Autorité de contrôle | DGCCRF, comme au niveau 1 | CNIL (nouvelle) | CNIL et avis des stores | DGCCRF |
| Sujet déjà traité ailleurs | non | oui : le bandeau cookies (quiz de la CNIL, Cookie Consent Speed.Run, §1.2) | non | non |
| Cas publics | tous « à sourcer » dans le §11.1, vérifiés ici (§17.9) | déjà connus (CNIL) | « à sourcer » | Amazon et Adobe, déjà cités au niveau 1 |

La collection « ce que tu sais reconnaître » (§11.5) est la raison de revenir : un deuxième niveau qui y ajoute six noms neufs la remplit, un qui en ajoute trois la répète. Et le grand public, premier public du jeu (§2.1), a tout vu de ces huit astuces : le stock qui annonce « plus que 3 », le compte à rebours qui repart, le prix barré, « 12 personnes regardent ».

### 17.2 L'univers et le chiffre du board

- **Pédalix**, boutique en ligne de vélos de ville, de route et d'équipement. Un nom inventé : une recherche du 2026-09-30 ne trouve aucune boutique de vélos qui le porte, là où « Braquet », premier candidat, est déjà pris par deux magasins. La vérification à l'INPI reste à faire avant le lancement (Q2).
- **Le chiffre du board : les nouveaux clients du mois.** 2 000 en janvier, objectif de trimestre 2 150, 2 350, 2 600, puis 3 000 en décembre. Ce sont les objectifs du niveau 1 retournés : 4 % au lieu de 6 %, c'est le chiffre multiplié par deux tiers ; 3 000 au lieu de 2 000, c'est le chiffre divisé par deux tiers.
  **Écart assumé au §11.1**, qui prévoyait le taux de conversion d'une fiche produit (2,1 % → 3 %). Le Tour définit l'acquisition comme « comment les gens te trouvent en premier lieu — publicité, contenu, bouche-à-oreille » (`content/how-it-works.ts`) ; le taux de conversion d'une fiche en est la suite, et seules deux des huit astuces parlaient d'être trouvé. Avec les nouveaux clients, les huit servent le même chiffre : les unes amènent des visiteurs (la publicité déguisée, les avis, le classement), les autres les font acheter vite (le stock, le compte à rebours, le prix barré). C'est Q1.
- **La boutique** : 60 000 clients déjà au fichier, dont 2 % recommandent chaque mois, et un panier moyen de 380 €. Soit environ 1,22 M€ de chiffre d'affaires en janvier.
- **L'affichage.** Le tableau de bord arrondit les nouveaux clients à la dizaine (« 2 350 »), comme le niveau 1 arrondit le churn au dixième de point. Décembre est gagné à 3 000 affichés, soit 2 995 et plus, comme 4,0 % affiché gagne au niveau 1 jusqu'à 4,04 %.

### 17.3 Le modèle : ce qui est commun, ce qui change

Le moteur est celui du §5.7, sans autre changement que ceux-ci. Tous sont dans le code et couverts par des tests ; le niveau 1 en sort identique au bit près, vérifié le 2026-09-30 sur 3 000 années jouées au hasard avant et après.

- **Le sens du chiffre** (`direction`). Chaque carte a un **gain** (le `red` du §5.5, renommé) qui pousse le chiffre dans le sens du board : il fait baisser le churn au niveau 1 et monter les nouveaux clients au niveau 2. Pour un chiffre qui doit monter, la formule du mois devient :

  `nouveaux clients = 2 000 × (1 + hr) × (1 + dr) × (2 − trustMult(lagTrust)) × presse − spike − saison`, plancher 400

  où `hr` et `dr` sont les gains honnêtes et des astuces, plafonnés à 0,43 et 0,82. `2 − trustMult` lit la même courbe de confiance que le niveau 1, à l'envers : ce qui multiplie le churn par 1,2 à une confiance de 30 multiplie les nouveaux clients par 0,8. Le spike (fil viral, contrôle) et la saison retirent des clients au lieu d'ajouter du churn. L'écart à l'objectif, la victoire de décembre et le courriel de mi-trimestre lisent tous le même signe (`shortfall`).
- **L'économie de boutique** (`economy`). Chaque mois, les clients déjà gagnés recommandent à 2 %, pliés par la confiance du trimestre comme le churn l'est au niveau 1 : une boutique qui a pressé ses clients leur vend moins la deuxième fois. Le chiffre d'affaires du mois vaut `(nouveaux clients + recommandes) × 380 € × multiplicateur`, et le fichier grossit des nouveaux clients.
- **La bonne presse** amène des clients, donc elle agit sur le chiffre lui-même : ×1,05 pendant trois mois. Au niveau 1, elle amenait des abonnés et laissait le churn tranquille.
- **Les réglages qui changent d'unité** vont avec le niveau : la décroissance du spike (0,005 de churn, 170 clients), le seuil d'un raté grave (1 point, 300 clients), le cadre de la courbe de décembre (2 à 9 %, 1 000 à 4 000 clients).

**Les constantes**, en regard du niveau 1 :

| Constante | Niveau 1 | Niveau 2 | Pourquoi |
|---|---|---|---|
| Chiffre de janvier | 6 % | 2 000 | — |
| Objectifs T1 à T4 | 5,6 · 5,1 · 4,6 · 4,0 % | 2 150 · 2 350 · 2 600 · 3 000 | les mêmes marches, retournées |
| Victoire en décembre | ≤ 4,1 % | ≥ 2 995 | ce que la tuile affiche |
| Plafonds honnête / astuces | 0,30 / 0,45 | 0,43 / 0,82 | un gain de x fait moins qu'une baisse de x : ×1/0,70 ≈ 1,43, ×1/0,55 ≈ 1,82 |
| Plancher | 1,2 % | 400 | — |
| Saison (mois 4 à 6) | +0,3 point, l'offre d'un concurrent | −100, une grande enseigne de sport casse ses prix sur les vélos | — |
| Spike du contrôle / du fil viral | 0,015 / 0,01 | 500 / 330 | le quart et le sixième du chiffre de janvier, comme au niveau 1 |
| Décroissance du spike | 0,005 par mois | 170 par mois | trois mois pour s'éteindre |
| Patience perdue par écart | 2 800 par point de churn | 0,084 par client | un écart de 100 clients coûte 8 ; plafond 32 dans les deux niveaux |
| Presse | ×1,2 sur les nouveaux abonnés | ×1,05 sur les nouveaux clients | elle touche ici le chiffre du board |
| Patience, confiance, radar au départ ; seuils du contrôle (75), des signalements (45), du fil viral (35), de la presse (80), du licenciement (25) | | identiques | — |

**Le contrôle finit en transaction pénale.** Au niveau 1, rendre la résiliation difficile est un manquement puni d'une amende administrative, plafonnée à 75 000 € pour une entreprise (C14). Ce que fait Pédalix est différent : un faux prix barré, un faux stock, des avis triés ou une publicité déguisée sont des **pratiques commerciales trompeuses**, un délit (article L132-2 du Code de la consommation) que la DGCCRF règle d'ordinaire par une **transaction pénale**, avec l'accord du parquet (L523-1). Le plafond pour une entreprise qui vend en ligne est de 3,75 M€, ou 10 % du chiffre d'affaires. Les transactions publiées vont de 10 000 € (Disinfluence, 2021, des avis faussement présentés comme certifiés) à 40 M€ (Shein, 2025, faux prix barrés), en passant par 1,3 M€ (PrettyLittleThing, 2025) et 2,33 M€ (Boohoo, 2026). **Proposé : 150 000 €**, environ 1 % du chiffre d'affaires annuel de Pédalix, fixe quel que soit le radar comme depuis C14. C'est Q3. L'événement dit « transaction », jamais « amende administrative ».

### 17.4 Les cartes

Règle d'écriture inchangée (§5.5) : un nom et un pitch décrivent le mécanisme, jamais l'effet ni l'intention ; aucun des mots interdits. Chaque ligne donne la carte du niveau 1 dont elle tient le rôle.

**Honnêtes**

| id | Nom | Pitch | gain | ramp | trust | radar | Autres | Rôle au niveau 1 |
|---|---|---|---|---|---|---|---|---|
| delivery | Livraison annoncée | La date et le coût de livraison s'affichent sur la fiche, avant le panier. | 0,05 | 0,09 | +4 | −2 | perm | pause |
| origin | Question d'origine | Une question facultative après chaque première commande : « Comment nous avez-vous connus ? » | | | +2 | | une fois, `insight` | survey |
| guides | Guides de choix | Des guides pour choisir sa taille de cadre, son vélo selon le trajet, son budget. | 0 | 0,12 | +3 | | perm | onboard |
| specs | Fiches complètes | Photos sous tous les angles, dimensions, poids et compatibilités sur chaque fiche. | 0,03 | 0,08 | +3 | | perm | annual |
| present | Point données avec le DG | Une réunion de trente minutes avec les chiffres du trimestre. | | | | | `present` | present |
| allin | Prix livré | Le prix de la fiche comprend la livraison et tous les frais. | −0,01 | | +8 | −8 | perm | remind |
| compare | Comparatif ouvert | Un tableau compare nos vélos de ville à ceux de trois concurrents, prix livrés compris. | 0 | 0,08 | +3 | | perm | reco |
| verified | Avis vérifiés | Seuls les acheteurs peuvent laisser un avis, et la fiche dit combien sont vérifiés. | −0,03 | | +10 | −20 | perm, `temp` | three |
| clean | Retrait des changements | Revenir aux fiches, aux prix et au classement d'origine. | | | +6 | −25 | `clean` | clean |

Le gain négatif de « Prix livré » est le prix affiché qui paraît plus cher que celui des concurrents qui n'y mettent pas la livraison ; celui d'« Avis vérifiés », la note qui baisse le temps que les avis non vérifiés sortent (`temp` : trois mois).

**Astuces**, noms tels qu'on les dit en réunion

| id | Nom | Pitch | gain | trust | radar | Nom officiel | Rôle au niveau 1 |
|---|---|---|---|---|---|---|---|
| stock | Indicateur de stock | Un badge « Plus que 3 en stock » sur les fiches des modèles mis en avant. | 0,12 | −4 | +10 | Fausse rareté | pdef |
| reviews | Avis mis en avant | Les avis cinq étoiles passent en tête ; ceux sous quatre étoiles attendent une modération. | 0,10 | −5 | +15 | Faux avis | bury |
| countdown | Compteur d'offre | Un compte à rebours de trois heures sur les offres, relancé à chaque visite. | 0,08 | −3 | +8 | Fausse urgence | cascade |
| watchers | Alerte d'activité | « 12 personnes regardent ce vélo », affiché près du bouton d'achat. | 0,03 | −2 | +3 | Fausse preuve sociale | shame |
| anchor | Prix de référence | Le prix conseillé du fabricant s'affiche barré au-dessus du prix de vente. | 0,18 | −10 | +25 | Faux prix barré | call |
| native | Partenariats créateurs | Des créateurs vélo reçoivent un vélo et une rémunération, et le montrent comme le leur dans leurs vidéos. | 0,04 | −5 | +12 | Publicité déguisée | social |
| teaser | Prix d'appel | Le prix de la fiche s'affiche hors frais de service ; les frais apparaissent au panier. | 0,04 | −5 | +12 | Frais cachés | notice (`revenueMult` 1,02 : les frais rapportent sur chaque commande) |
| sponsored | Classement partenaires | Les modèles des marques partenaires remontent en tête des résultats de recherche du site. | 0,05 | −4 | +4 | Classement payé non signalé | streak |

**La main** : l'ordre des honnêtes est `delivery, origin, guides, specs, present, allin, compare, verified, clean`, celui des astuces `stock, reviews, countdown, watchers, anchor, native, teaser, sponsored`. Au premier trimestre, seulement `stock, reviews, countdown, watchers`. Tout le reste suit le §5.6 (six honnêtes, cinq astuces, `clean` toujours offerte quand elle s'applique, le point données seulement une fois les réponses arrivées).

### 17.5 Le DG

**Ordres.** Aucun au T1 ; puis `stock` au T2, `anchor` au T3, `reviews` au T4 (les trois du §11.1) ; si la carte est déjà en production, la première disponible de `stock, anchor, reviews, countdown, teaser`. Après un contrôle, il ne demande plus ni `anchor` ni `reviews`.

Textes d'ordre, glissés dans « Et ce trimestre, … Ce n'est pas une idée, c'est une demande. » :

- stock : « tu affiches le stock sur les fiches. « Plus que trois », ça fait bouger les gens. Le concurrent le fait. »
- anchor : « on affiche un prix de référence barré sur toute la gamme. Le prix conseillé du fabricant, ça existe, non ? »
- reviews : « tu mets les bons avis en avant. Les mauvais, on les modère. »
- countdown : « un compteur sur les offres. Trois heures, et ça repart. Personne ne revient vérifier. »
- teaser : « on affiche le prix sans les frais. Les frais, on les montre au panier, comme tout le monde. »

**Messages de visio** (`X` = nouveaux clients de fin du trimestre précédent, `t` = objectif du trimestre qui s'ouvre) :

- T1 : « Bonjour. Nouvelle boîte, même promesse : le board veut 3 000 nouveaux clients par mois en décembre, et je leur ai promis. Fin mars, je veux en voir 2 150. Pas 2 100. Tu as deux chantiers ce trimestre. Je ne veux pas savoir comment, je veux le chiffre. »
- T2, atteint : « X, c'est bien. Mars, c'était l'échauffement. Fin juin, t. » ; raté : « Tu m'as fait mentir en comité. X au lieu de 2 150. Ça n'arrivera pas deux fois. Fin juin, t. »
- T3, atteint : « On tient. La marche est plus haute maintenant : t fin septembre. » ; raté : « Deux trimestres ratés. Le board m'a demandé si tu étais la bonne personne. J'ai dit oui. Prouve-le : t fin septembre. »
- T4, atteint : « Dernière ligne droite. 3 000 fin décembre et on fête ça. » ; raté : « C'est ton dernier trimestre, tu le sais. 3 000 en décembre, ou je présente quelqu'un d'autre au board en janvier. »
- Fin d'année et licenciement : ceux du niveau 1.

Humeur, visage, voix : inchangés (§5.10).

### 17.6 Parcours de référence (fixtures)

Les quatre années du §6, jouées carte pour carte par rôle. Les nouveaux clients sont affichés à la dizaine, la patience en entier. Elles sont les tests F2.1 à F2.4 de `acquisition.test.ts`, et F2.5 y tient les invariants du §6.

**A · Honnête, refuse les trois ordres, présente ses données** — T1 `delivery + origin`, T2 `guides + present`, T3 `specs + compare`, T4 `allin + present`

| | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| Nouveaux clients | 2 100 | 2 160 | 2 650 | 3 000 |
| Patience | 51 | 42 | 46 | 73 |
| Patience au niveau 1 | 51 | 42 | 46 | 73 |
| Humeur à l'ouverture | firm | angry | angry | firm |
| Ordre | — | stock | anchor | reviews |

Fin : `applause`, confiance 83, radar 0. Le fichier passe de 60 000 à 89 750 clients, le chiffre d'affaires de 1,22 à 1,83 M€.

**B · Honnête, variante** — T1 `delivery + origin`, T2 `guides + specs`, T3 `compare + present`, T4 `verified + present`

| | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| Nouveaux clients | 2 100 | 2 230 | 2 800 | 3 000 |
| Patience | 51 | 33 | 52 | 79 |

Fin : `applause`, confiance 85, radar 0 (niveau 1 : patience 51, 31, 50, 77).

**C · Obéit à tout** — T1 `stock + reviews`, T2 `anchor + countdown`, T3 `native + teaser`, T4 `delivery + allin`

| | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| Nouveaux clients | 2 310 | 2 410 | 2 320 | 970 |
| Patience | 67 | 79 | 45 | 0 |
| Humeur à l'ouverture | firm | calm | firm | angry |
| Ordre | — | anchor | teaser | stock |

Signalements et fil viral au T2, contrôle au T3 : transaction de 150 000 €, six astuces retirées, 1 219 clients qui demandent la suppression de leur compte. Fin : `fine`, confiance 27, radar 1. Le chiffre d'affaires de décembre tombe à 0,81 M€, sous celui de janvier : le contrecoup est la leçon, comme les 9,1 % de churn du niveau 1 (patience 67, 79, 57, 12).

**D · Honnête sans rien de fort** — T1 `origin + allin`, T2 `present + compare`

| | T1 | T2 |
|---|---|---|
| Nouveaux clients | 1 980 | 1 950 |
| Patience | 41 | 16 |

Viré en juin, malgré le point données. Fin : `firedClean`, confiance 73 (niveau 1 : 42, 19).

**Invariants**, les mêmes qu'au §6, testés indépendamment des valeurs : A et B finissent en `applause` avec une patience minimale entre 30 et 50 et jamais sous 25 ; C subit le contrôle au T3, jamais avant, et finit en `fine` ; D est viré au T2 ; en C, l'objectif est atteint aux T1 et T2. Les quatre fins qu'aucun parcours de référence n'atteint (`cleanMiss`, `repentant`, `labyrinth`, `firedDark`) ont chacune une année épinglée dans le test, pour qu'un réglage qui en rendrait une inaccessible se voie.

**Joué au hasard**, 4 000 années par façon de jouer (cartes tirées dans la main) :

| Façon de jouer | Niveau 1 | Niveau 2 |
|---|---|---|
| Honnêtes seulement | applaudissements 35 %, viré 35 %, droit dans tes bottes 19 % | applaudissements 43 %, viré 28 %, droit dans tes bottes 17 % |
| Obéit au DG | labyrinthe 66 %, contrôle 22 % | labyrinthe 66 %, contrôle 22 % |
| N'importe quoi | viré après astuces 45 %, labyrinthe 44 % | labyrinthe 53 %, viré après astuces 34 % |

Le niveau 2 pardonne un peu plus au joueur honnête qui joue au hasard. Ce n'est pas un joueur : la recette tranche (§7.3), et durcir coûte un réglage, pas une refonte.

### 17.7 Le téléphone : le chemin d'un visiteur

Au niveau 1, le téléphone montrait l'écran de résiliation. Ici, il montre le chemin d'un visiteur sur l'appli de Pédalix, de la recherche au panier, et reflète comme au niveau 1 l'union des cartes en production et des cartes cochées. Une figure de texte, sans faux boutons (E9). De haut en bas :

- Barre d'appli « Pédalix · 21:04 ».
- `native` : une vignette vidéo « Mon vélo de tous les jours », signée d'un créateur fictif (@deux_roues_et_moi), sans mention.
- Résultats pour « vélo de ville » : le premier est le modèle le mieux noté ; avec `sponsored`, c'est celui d'une marque partenaire (Ferlune, une marque inventée), sans mention ; avec `compare`, une ligne « Comparé à 3 sites, prix livrés ».
- La fiche du « Pédalix Ville 7 », vélo de ville électrique de la maison : photo ; avec `specs`, « 12 photos · taille, poids, compatibilités ». *(« Urbain 7 » jusqu'au 2026-10-01 : trop proche d'un « Urban 7 » réel, vu en écrivant la copie, A12.c.)*
- Le prix : « 1 290 € » ; avec `anchor`, « ~~1 590 €~~ 1 290 € · −19 % » ; avec `allin`, « 1 319 € livré ».
- La note : « 4,1 ★ · 38 avis » ; avec `reviews`, « 4,6 ★ · 29 avis », puisque les avis sous quatre étoiles attendent une modération qui ne vient pas ; avec `verified`, « dont 24 vérifiés (achat prouvé) » à la suite. *(« 4,9 ★ · 1 204 avis » et « 31 vérifiés » jusqu'au 2026-10-01 : trier ne fait pas apparaître d'avis, et 31 vérifiés ne tiennent pas dans 29 avis — relecture de copie d'A12.c.)*
- La pression, une ligne par carte : `countdown` « Offre valable encore 02:59:41 » ; `stock` « Plus que 3 en stock » ; `watchers` « 12 personnes regardent ce vélo ».
- `delivery` : « Livré le mardi 14 · 29 € ».
- `guides` : un lien « Quelle taille de cadre pour vous ? ».
- Le panier : « Livraison 29 € · Total 1 319 € » ; avec `teaser`, « Frais de service 19 € » ajoutés, total 1 338 €.
- `origin` : après la commande, « Comment nous avez-vous connus ? Facultatif. » et trois réponses.

**La pastille, sous le téléphone** : ce que le panier ajoute au prix de la fiche. « +29 € au panier » au départ (la livraison, annoncée au panier seulement) ; « 0 € de plus qu'annoncé » avec `delivery` ou `allin` ; avec `teaser`, 19 € de plus et la mention « · des frais obligatoires hors du prix affiché », pastille en corail. C'est le « N clics pour résilier » du niveau 1 : un fait mesurable que la loi encadre (L121-3 et l'arrêté du 3 décembre 1987, §17.9), jamais un jugement.

### 17.8 Tableau de bord, événements, décembre

**Les six tuiles** : Nouveaux clients (par mois, objectif du trimestre), Clients (au fichier, fin de mois), Chiffre d'affaires mensuel (écart à janvier), Patience du DG, Confiance des clients et Radar DGCCRF, ces deux derniers floutés jusqu'en décembre, « pas sur ton dashboard ».

**Les événements**, dans l'ordre du §5.8 :

- Courriel de mi-trimestre : ceux du niveau 1.
- Réponses de la question d'origine : « Les réponses sont arrivées : 4 nouveaux clients sur 10 sont venus par le bouche-à-oreille, 3 sur 10 par un moteur de recherche. Tes prochains chantiers viseront plus juste, et tu as enfin de quoi montrer au DG : « Point données avec le DG » est débloqué. »
- Point données : celui du niveau 1.
- Contrôle : « Contrôle de la DGCCRF sur le site, article dans la presse, transaction de {fine} proposée avec l'accord du parquet. Le DG te demande de tout retirer avant vendredi. {leavers} clients demandent la suppression de leur compte. » Le tampon dit « Transaction · 150 000 € ».
- Signalements : « Des dizaines de signalements sur SignalConso. Un journaliste pose des questions au service presse. »
- Fil viral : « Un fil viral sur un forum de cyclistes : « Pédalix, je ne leur fais plus confiance, voici pourquoi ». Les visiteurs repartent sans commander. »
- Presse : « Un magazine vélo cite Pédalix en exemple d'une boutique qui ne force pas la main. Les visiteurs arrivent d'eux-mêmes. »
- Concurrent (T2) : « Une grande enseigne de sport a cassé ses prix sur les vélos au printemps. Tout le monde a perdu des clients ce trimestre, toi compris. »
- « Pourquoi le chiffre a bougé » : les cinq lignes du niveau 1, en dizaines de clients.

Les coupures de presse gardent des titres de journaux fictifs (§8.3). Aucun texte d'événement ne nomme une carte : les événements se déclenchent sur des seuils (radar, confiance), pas sur ce qui a été joué. Les astuces retirées par un contrôle sont nommées par la ligne « pourquoi » du niveau 1, qui lit la liste réelle.

**Les fins**, mêmes identifiants et même ordre que le §5.11 :

| id | Bandeau | Titre | Texte (premier jet) |
|---|---|---|---|
| applause | Décembre · applaudissements | Tu as tenu. Et ça a marché. | {metric} nouveaux clients en décembre, {customers} clients au fichier, une confiance à {trust} que personne ne mesurait. Pas un prix barré inventé, pas un avis trié. Le DG t'a pressé trois fois. Tu as répondu avec des chiffres. C'est exactement le métier. |
| cleanMiss | Décembre · droit dans tes bottes | Pas encore 3 000. Mais tout est propre. | {metric} nouveaux clients, confiance à {trust}. La courbe monte encore, parce que les effets lents ne s'arrêtent pas en décembre. Le board voulait un chiffre, tu as construit une pente. |
| firedClean | Licencié · mais propre | Viré. Sans une seule astuce. | La patience du DG est tombée à {patience} avant que tes effets lents n'arrivent. Confiance à {trust}. L'année suivante, ton remplaçant a barré les prix. Le jeu ne récompense pas toujours ceux qui ont raison trop tôt. Rejoue, et présente tes données plus tôt. |
| firedDark | Licencié | Viré, et pour rien. | Tu as pris des astuces, et la patience du DG est quand même tombée à {patience}. Confiance à {trust}, radar à {radar}. Il voulait le chiffre, tout de suite, et il ne se souvient pas de ce qu'il a demandé. |
| fine | Décembre · la révélation | Voici ce que tu as fait. | Le radar est monté jusqu'au contrôle, la transaction a été signée, la presse a écrit. {metric} nouveaux clients en décembre, confiance à {trust}. Les clients pressés au printemps ne sont pas revenus, et ils l'ont raconté. Ce que tu as mis en production a des noms. Ils sont en dessous. |
| repentant | Décembre · le repenti | Tu as essayé, puis tu as nettoyé. | Tu as mis des astuces en production, puis tu les as retirées. {metric} nouveaux clients, confiance à {trust}, radar à {radar}. La confiance remonte plus lentement qu'elle ne tombe. |
| labyrinth | Décembre · la révélation | La vitrine tient. Regarde ce qu'elle coûte. | Pas de contrôle cette année. {metric} nouveaux clients, et une confiance à {trust} que ton dashboard ne t'a jamais montrée. Les clients que tu as pressés commandent moins la deuxième fois. Le radar est à {radar}. Il ne redescend pas tout seul. |

Chaque texte dit ce que fait le modèle (E11) : la recommande pliée par la confiance, les rampes qui continuent, le radar qui ne baisse que sans astuce en production. Aucun ne nomme une carte que l'année n'aurait pas jouée : l'année D, virée, n'a par exemple écrit aucun guide.

**Décembre** : les trois cellules (nouveaux clients, confiance, radar), la courbe des nouveaux clients de 1 000 à 4 000 avec le 3 000 du board en pointillé, celle de la confiance, le playbook, le catalogue, le partage (« Une année chez Pédalix : {title} {metric} nouveaux clients, confiance à {trust}. Et toi, tu tiendrais ? {url} »), **l'autre niveau** et la boucle vers le Tour. Le bloc « Niveau suivant » du niveau 1 annonce le niveau 2 ; celui du niveau 2 annonce le niveau 1, « jouable », et non un troisième niveau qui n'existe pas : **tranché par Antoine le 2026-10-01** (C31), les deux niveaux se renvoient l'un à l'autre.

### 17.9 Le catalogue : les huit astuces, vérifiées

Vérifié le 2026-09-30 sur les sources primaires : Légifrance, les communiqués de la DGCCRF (economie.gouv.fr), de la Commission européenne, de la FTC et de la CMA. Chaque texte de loi est à relire sur Légifrance avant d'entrer dans le produit (une citation passée par un outil de lecture en a déformé un mot), et la relecture juridique du catalogue reste à Antoine (D9). Cas publics au passé ; un engagement ou une notification n'est jamais présenté comme une sanction.

| Astuce | Ce que dit la loi | Un cas réel | Le repère |
|---|---|---|---|
| **Fausse rareté** (Indicateur de stock) | Affirmer faussement qu'un produit ne sera disponible que peu de temps ou sous conditions, pour presser la décision, est une pratique commerciale trompeuse interdite en toutes circonstances (L121-4 7°) ; un faux stock trompe aussi sur la disponibilité du bien (L121-2 2° a). La DGCCRF range les « faux stocks » parmi les dark patterns illicites. | En 2019, Booking.com s'est engagé auprès de la Commission européenne et des autorités de consommation à préciser qu'une « dernière chambre disponible » ne l'est que sur son propre site. | Un stock qui reste à trois pendant trois semaines n'est pas un stock. |
| **Faux avis** (Avis mis en avant) | Diffuser de faux avis, ou modifier des avis pour promouvoir un produit, est interdit en toutes circonstances (L121-4 28°), comme affirmer qu'ils viennent d'acheteurs sans l'avoir vérifié (27°). Le site doit dire si ses avis sont contrôlés, et comment (L111-7-2). | Aux États-Unis, Fashion Nova a payé 4,2 millions de dollars en 2022 pour clore des accusations de la FTC : l'enseigne aurait bloqué pendant quatre ans les avis de moins de quatre étoiles. En France, une entreprise a été condamnée fin 2024 à 80 000 € d'amende par le tribunal correctionnel de Paris pour de faux avis. | Que des cinq étoiles, et aucun avis daté : quelqu'un a trié. |
| **Fausse urgence** (Compteur d'offre) | Même article que la fausse rareté (L121-4 7°). La DGCCRF cite en exemple « un compte à rebours qui recommence indéfiniment ». | En 2024, la Commission européenne et les autorités de consommation ont notifié à Temu des pratiques qu'elles jugeaient illicites, dont de fausses dates limites d'achat. | Recharge la page : si le compteur repart, il n'y a pas d'offre. |
| **Fausse preuve sociale** (Alerte d'activité) | Aucun point de la liste noire ne la nomme : c'est une pratique commerciale trompeuse (L121-2), et la DGCCRF range la « fausse activité » (« X consommateurs sont en train de regarder le produit ») parmi les dark patterns illicites. | En 2019, six sites de réservation d'hôtels, dont Booking.com et Expedia, se sont engagés devant l'autorité britannique de la concurrence à préciser, quand ils disent que d'autres regardent le même hôtel, que ces personnes cherchent peut-être d'autres dates. | Douze personnes regardent toujours. À trois heures du matin aussi. |
| **Faux prix barré** (Prix de référence) | Le prix barré doit être le plus bas pratiqué par le vendeur dans les trente jours avant la réduction (L112-1-1). Sinon, c'est une pratique commerciale trompeuse (L121-2 2° c) : un délit, que la DGCCRF règle souvent par une transaction pénale. | En 2025, Shein a accepté une transaction de 40 millions d'euros proposée par la DGCCRF avec l'accord du parquet de Paris : 57 % des réductions contrôlées n'en étaient pas, 11 % cachaient une hausse de prix. | Un prix barré se vérifie : c'est le prix le plus bas des trente derniers jours, pas un prix conseillé. |
| **Publicité déguisée** (Partenariats créateurs) | Financer un contenu présenté comme éditorial sans le dire clairement est interdit en toutes circonstances (L121-4 11°). Depuis la loi du 9 juin 2023, un créateur payé doit dire clairement l'intention commerciale de sa publication (« publicité », « collaboration commerciale » ou une mention équivalente). | En 2023, la DGCCRF a indiqué que 60 % de la soixantaine d'influenceurs qu'elle avait contrôlés depuis 2021 étaient en anomalie, tous pour ne pas avoir signalé clairement le caractère commercial de leurs publications. | Un vélo qu'on te montre sans dire qui l'a payé est une publicité. |
| **Frais cachés** (Prix d'appel) | Le prix toutes taxes comprises et les frais de livraison sont des informations substantielles : les taire est une omission trompeuse (L121-3 3°). Le prix affiché est la somme effectivement payée ; seule la livraison peut être indiquée à part, si elle est annoncée (arrêté du 3 décembre 1987). | En 2019, Booking.com s'est engagé auprès de la Commission européenne à afficher clairement le prix total, frais et taxes inévitables compris. | Le vrai prix est celui du dernier écran. Compare celui-là. |
| **Classement payé non signalé** (Classement partenaires) | Donner des résultats de recherche sans dire clairement qu'un tiers a payé pour être mieux classé est interdit en toutes circonstances (L121-4 25°). | En 2019, Booking.com s'est engagé à dire si les paiements des hôteliers influencent leur place dans les résultats ; la même année, les sites de réservation contrôlés par l'autorité britannique ont pris le même engagement sur les commissions. | En tête de liste ne veut pas dire meilleur : cherche la mention « sponsorisé ». |

**Les marques citées**, liste blanche du niveau (série C6) : Booking.com, Expedia, Temu, Shein, Fashion Nova. Les autres noms de la recherche (PrettyLittleThing, Boohoo, Disinfluence) n'entrent que dans ce document.

**Corrigé dans le §11.1 par cette vérification** : « Classement payé non signalé, DSA article 27 » était faux (l'article 27 porte sur les paramètres des systèmes de recommandation des plateformes, et une boutique qui vend son propre stock n'est pas une plateforme) ; « Faux avis, article L121-2 » était imprécis (L121-4 28° et 27°) ; « prix total obligatoire » allait trop loin (la livraison peut être indiquée à part si elle est annoncée) ; le faux prix barré n'a pas d'amende administrative à lui (l'article L131-5 ne vise que l'article L112-1 et ses arrêtés, lu sur Légifrance le 2026-09-30) : c'est une pratique commerciale trompeuse ; et les engagements de Booking.com datent du 20 décembre 2019, sans être une sanction.

**Corrigé dans la copie par la vérification du 2026-10-01** (A12.c, le texte d'`content/game/acquisition.ts` relu sur les sources primaires) :
- **28°** dit « modifier des avis », pas « déformer » : « déformer » est le mot de la directive Omnibus, pas celui du Code. Le 27° vise l'affirmation faite « sans avoir pris les mesures nécessaires pour le vérifier ».
- **Article 5-2 de la loi du 9 juin 2023** (rédaction de l'ordonnance 2024-978, en vigueur depuis le 8 novembre 2024) : « publicité » ou « collaboration commerciale » **ou une mention équivalente**. Seul l'article 5 d'origine imposait les deux mentions.
- **Frais cachés** : de tous les frais imposés, seule la livraison peut être indiquée à part, **avec son montant** (arrêté du 3 décembre 1987, art. 2) ; « si elle est annoncée » ne suffisait pas.
- **Temu** : la notification de novembre 2024 suit une enquête coordonnée, et l'action du réseau CPC est **toujours en cours** au 2026-10-01 (page de la Commission). L'amende de 200 M€ infligée à Temu le 28 mai 2026 l'a été au titre du DSA, pour les produits illicites, pas pour les fausses échéances : le texte n'en parle pas. Une veille est posée (`CHANTIERS.md` E).
- **CMA** : des engagements pris **auprès de** l'autorité britannique, qui ne valent pas aveu (« devant » évoquait un tribunal) ; « les six sites visés par l'enquête » plutôt que « contrôlés », lisible comme « détenus ».
- **Shein** : les 40 M€ couvraient aussi des allégations environnementales, d'où « notamment pour de fausses réductions ». **Influenceurs** : la DGCCRF dit que **la totalité** des influenceurs en anomalie manquaient à la transparence commerciale (« tous », comme ce tableau ; la copie avait dérivé vers « notamment »). **Fashion Nova** : « a accepté de payer », pendant « près de » quatre ans (fin 2015 à novembre 2019).
- **Faux prix barré** : la DGCCRF « peut régler » ce délit par une transaction pénale ; « souvent » n'était étayé que par des chiffres tous délits confondus.

Lus sur Légifrance par un outil de lecture : le 28° et l'article 5-2 sont à relire à l'œil avant l'ouverture (D9).

**Sources primaires** :
- Code de la consommation, articles L112-1-1, L111-7-2, L121-2, L121-3, L121-4, L132-2, L523-1, sur Légifrance ; arrêté du 3 décembre 1987 relatif à l'information du consommateur sur les prix ; loi n° 2023-451 du 9 juin 2023, art. 5-2.
- DGCCRF : « Pièges sur les sites de commerce en ligne : attention aux dark patterns » (fiche du 08/11/2023) ; communiqué Shein du 3 juillet 2025 ; « Marketing d'influence : 60 % des influenceurs ciblés par la DGCCRF en anomalie » (23/01/2023) ; « Black Friday : gare aux fausses promesses » (24/11/2025), qui cite la condamnation de fin 2024.
- Commission européenne : IP/19/6812 (Booking.com, 20 décembre 2019), IP/24/5707 (Temu, 8 novembre 2024).
- CMA : « Hotel booking sites to make major changes after CMA probe » (6 février 2019).
- FTC : « Fashion Nova will pay $4.2 million… » (25 janvier 2022).

### 17.10 Questions pour Antoine (C30), tranchées le 2026-10-01

Au format de `CHANTIERS.md` C. « Aujourd'hui » est ce que le brouillon suppose ; la reco dit aussi ce qui casse si on se trompe. **Les cinq réponses d'Antoine, le 2026-10-01** (posées dans la session qui avait écrit la spécification, chacune avec sa reco en premier, Q1 et Q3 avec leurs éléments chiffrés, Q5 avec un croquis des deux encarts), sont dans la dernière colonne.

| # | Question | Aujourd'hui | Reco | Réponse (2026-10-01) |
|---|---|---|---|---|
| Q1 | **Le chiffre du board : les nouveaux clients par mois, pas le taux de conversion du §11.1 ?** | 2 000 en janvier, 3 000 en décembre (§17.2) | **Oui** : c'est la définition de l'acquisition dans le Tour, et les huit astuces servent alors le même chiffre. *Si on se trompe* : revenir au taux de conversion change la tuile, les messages du DG et deux cartes qui ne le servent plus (la publicité déguisée, le classement), pas le moteur | **Nouveaux clients par mois**, la reco. Rien ne change dans le modèle ni dans la spécification |
| Q2 | **Le nom : Pédalix ?** | Aucune boutique de vélos ne le porte sur le web (2026-09-30) ; INPI non consulté | **Oui**, sous réserve d'une recherche INPI, à faire avec la relecture juridique (D9). *Si on se trompe* : un nom propre dans toute la copie, remplaçable en une passe | **Pédalix**, la reco. La recherche INPI reste à faire avec la relecture juridique (D9) |
| Q3 | **Le contrôle : une transaction pénale de 150 000 € ?** | Fixe, quel que soit le radar, comme au niveau 1 depuis C14 (§17.3) | **Oui** : c'est la procédure réelle pour ces pratiques, et le montant tient entre les transactions publiées des petits acteurs et celles des grandes plateformes. *Si on se trompe* : une « amende administrative » serait fausse en droit ; un montant plus proche de Shein ferait croire qu'une boutique paie comme une plateforme mondiale | **150 000 €**, la reco. Écartés : 1,3 M€ (le plus petit montant publié pour des prix barrés, mais pour une enseigne bien plus grosse) et le plafond de 3,75 M€ (une transaction se fait sous le plafond ; ~20 % du chiffre d'affaires de Pédalix) |
| Q4 | **Les huit cas et leur liste blanche** (Booking.com, Expedia, Temu, Shein, Fashion Nova) ? | Trois cas sont des engagements (Booking.com, la CMA) et un une notification en cours (Temu), dits comme tels (§17.9) | **Oui**, relecture juridique comprise. *Si on se trompe* : un engagement présenté comme une sanction serait inexact et attaquable ; c'est pourquoi le texte ne le fait jamais | **Les huit tels quels**, la reco : Temu reste, dit comme une notification en cours. Écarté : le remplacer par un engagement de Booking.com, plus sûr mais qui aurait donné cinq cas sur huit à Booking.com et aux sites d'hôtels |
| Q5 | **L'encart du résultat quand l'acquisition et la rétention freinent ensemble** (C11) ? | Une seule carte, celle de la première étape du groupe dans l'ordre AARRR, donc l'acquisition | **Une carte qui propose les deux niveaux**, la reco du 2026-09-29. *Si on se trompe* : garder une seule carte fait choisir l'ordre AARRR, précisément l'artefact que C11 écartait | **Une carte, deux niveaux**, la reco : quand plusieurs étapes du goulot ont un niveau, une seule carte les propose tous, étape par étape. Se construit avec A12.f ; §15.4 est mis à jour |

### 17.11 Ce qui reste à construire (C30 tranchée)

Dans l'ordre, une PR chacun :

1. **La copie** : `content/game/acquisition.ts`, français et anglais, tout « à relire », avec la série C du §7.1 (parité, mots interdits, marques de la liste blanche) et ses propres tests de contenu. **Faite le 2026-10-01** (A12.c) : ce que le niveau 1 dit déjà de toute année (les mois, la visio, les nouvelles du trimestre, le playbook…) est repris par référence, et trois tests s'ajoutent à la série C : les espaces insécables des nombres (C12), l'arithmétique du téléphone (C13), et jamais « amende » pour une transaction pénale (C14).
2. **L'îlot partagé** — **fait le 2026-10-01** (A12.d) : l'îlot vit sous `app/[locale]/game/_island/`, chaque niveau y apporte son modèle, sa copie, le format de son chiffre et son téléphone (`sides.tsx`). Le constat d'origine : l'îlot du niveau 1 vivait sous `app/[locale]/game/retention/` et parlait de churn ; il devient celui de tout niveau, chaque niveau n'apportant que sa copie, son téléphone et ses formats. Les composants de `components/game` gardent aujourd'hui des noms d'emplacement du niveau 1 (`churn`, `subs`, `mrr`) : les renommer change leur contrat, donc une re-synchronisation avec Claude Design (`.design-sync/NOTES.md`).
3. **Le téléphone de Pédalix** et sa pastille (§17.7) — **faits le 2026-10-01** (A12.e) : `ShopPhone` et `BasketPill`, ce qu'ils montrent calculé par `lib/game/shop-phone.ts`, le cadre du téléphone partagé avec celui de Flixo. La pastille additionne ce que la fiche n'annonce pas : la livraison tant que ni `delivery` ni `allin` ne la montre, plus les 19 € de `teaser` (donc « +48 € » quand `teaser` arrive seul, « +19 € » quand la livraison est déjà annoncée). Avec `allin`, la ligne du panier devient « Livraison incluse ».
4. **Le branchement** : le slug passe de `DraftLevelSlug` à `LevelSlug`, et le compilateur liste ce qu'il exige (clé de sauvegarde, encart du résultat, vocabulaire analytique) ; la page, son image de partage, le sitemap, le hub qui l'affiche « Jouable », et la réponse à Q5. **En deux PR** : **A12.f.1, faite le 2026-10-01**, rend le niveau jouable. Elle donne la page sur une page de niveau commune aux deux (`app/[locale]/game/_level/LevelPage.tsx`), avec l'acquisition et le CAC pour mots du glossaire. Viennent ensuite l'image de partage, la clé `tdg.game.acquisition.v1`, le sitemap et le hub « jouable », avec sa fin « le contrôle et la transaction ». Les deux pages se renvoient l'une à l'autre (zones et bloc de décembre, C31), et l'encart du résultat sur un goulot acquisition. Les fins se comptent désormais par niveau. **A12.f.2, faite le même jour**, fait l'encart qui propose les deux niveaux quand ils freinent ensemble (Q5) : une carte, une rangée par étape, la plus faible d'abord.
5. **Les specs Playwright** du niveau, sur le modèle de P1 à P27.
6. **Le bon à tirer** du niveau 2 (`/bon-a-tirer`), puis une recette qui couvre les deux niveaux (§7.3, D9).
