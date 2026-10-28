# A23.d — ce que le bon à tirer de la place de marché doit regarder

*Relevé pendant l'exécution d'A23 (à partir de MKT-0, le 2026-10-18) par les
relecteurs copie et par l'orchestrateur, au fil des unités, sur le modèle de
[`a22d-a-regarder.md`](a22d-a-regarder.md). Ce ne sont pas des corrections
faites : ce sont les points que la construction du bon à tirer
(`/bon-a-tirer`, qui repart toujours de `grep -rn "TODO: à relire" src/`) doit
mettre sous les yeux d'Antoine, en plus des cartes que le grep produit. Les
clés citées sont celles d'`ENGINE_COPY` (`src/content/engine-copy.ts`) et,
dès MKT-5, de ses calques de place de marché.*

## Les contrôles et les constats (MKT-4)

- **`sanity.mktRepeatGtFirst`** demande « les deux chiffres portent-ils sur
  la même cohorte et la même fenêtre ? ». Par construction, ils ne portent pas
  sur la même fenêtre : la première commande se mesure sur 7, 30 ou 90 jours
  (30 par défaut), la deuxième sur 60, 90 ou 180 jours (90 par défaut) ;
  elles ne se rejoignent qu'à 90 jours. Le déclencheur (`sanity.ts`,
  `repeat.lo > firstOrder.hi`) peut donc s'allumer sur des chiffres honnêtes :
  un acheteur dont la première commande tombe au jour 45 et la deuxième au
  jour 80 compte dans la deuxième commande, pas dans la première. Deux choses à
  trancher : la question que pose la phrase, et si le contrôle ne doit
  s'allumer que quand les deux fenêtres sont égales (§22.5.7, §22.8.5 f).
  Relevé par la relecture de MKT-4.
- **`findings.verbMkt.repeat`** : « en passent une deuxième » / "place a
  second one". Dans le titre de slide (`clauseRepeat`), « commande » est
  nommée juste avant ; dans le constat, phrase seule (« Sur 100 inscrits, on
  ne sait pas dire combien en passent une deuxième. »), le « en » et le "one"
  n'ont rien à quoi se rattacher. Relevé par la relecture de MKT-4.

## Les calques « produits » (MKT-5)

- **`worth.customers` et `worth.customersOne`** (les deux côtés : « {n}
  acheteurs de plus par mois ») désignent la même quantité que le titre
  `leakClearCustomers` de §22.8.5 c, qui dit « {n} nouveaux acheteurs ». La
  base a un précédent pour cette paire : `worth.customersQuarter` dit
  « {n} nouveaux clients de plus par trimestre », à côté de
  `slgLeakClearCustomers` (« nouveaux clients »). Si le mot du titre est
  voulu : « {n} nouveaux acheteurs de plus par mois » / "{n} more new buyers
  a month". `leakClearPerHundred` peut rester : sur 100 inscrits, tout
  acheteur compté est nouveau par construction. Relevé par l'exécutant et la
  relecture de MKT-5.
- **`money.arr` de l'offre** dit « leur MRR », un MRR nu que la règle du
  calque lit ; c'est le texte de §22.8.5 c, gardé tel quel. Son « ? »,
  **`terms.arr.definition` de l'offre** (réécrite par le lexique seul), dit
  « Ton revenu annuel, extrapolé de ton revenu mensuel » : l'ARR des
  abonnements y passe pour tout le revenu, alors que la place de marché a
  aussi ses commissions, et « avec des contrats au mois » affirme une
  facturation au mois que les feuilles du brief 10 ont retirée des deux côtés.
  Proposition de la relecture : « Le revenu annuel des abonnements, extrapolé
  de leur revenu mensuel : le MRR des abonnements × 12, comme si rien ne
  changeait pendant un an. Ce n'est pas un revenu acquis : des résiliations le
  font baisser dès le mois suivant. » / "The subscriptions' annual revenue,
  extrapolated from their monthly revenue: the subscription MRR × 12, as if
  nothing changed for a year. It isn't guaranteed revenue: cancellations bring
  it down the very next month."
- **`demand.scenario.kpiNewMrr`** dit « Nouveau revenu net par mois » quand le
  lexique et les feuilles voisines mettent l'adjectif après (« revenu net
  nouveau ») : la même alternance que « Nouveau MRR » / « MRR nouveau » dans
  la base. À savoir plutôt qu'à corriger.
- **« 100 inscrits », « 100 vendeurs inscrits »** gardent une espace ordinaire
  entre le nombre et ce qu'il compte, comme les 29 occurrences de la base, que
  la garde typographique ne vérifie pas (« 12 mois », « 30 jours » ont
  l'insécable). Si l'insécable est voulue, c'est une passe sur toute la base,
  pas sur la place de marché seule.
- Corrigés avant le merge de MKT-5, pour mémoire : l'anglais des feuilles
  réécrites par le lexique disait "it/its" d'un acheteur ou d'un vendeur
  abonné (21 feuilles par côté), quand les feuilles de §22.8.5 c disent
  "their" ; le français de l'hypothèse d'inscription de l'offre ne nommait
  pas les vendeurs.

## Les mots « services » (MKT-S)

- **`io.mergeRefused.motions`** (« Fusion impossible : les façons de vendre
  cochées ne sont pas les mêmes. ») et **`table.reasons.hidden`** (« ce
  chiffre n'est pas dans les façons de vendre cochées ») sont faux pour
  **toute** place de marché, « produits » compris : une place de marché ne
  coche aucune façon de vendre, et `merge.ts` renvoie la première quand deux
  fichiers diffèrent sur les abonnements des vendeurs (ou des prestataires).
  Laissées telles quelles, nommées dans `SERVICES_NAMED_EXCEPTIONS` : leur
  réécriture pour la place de marché (dans `products.common` et
  `services.common`) est à trancher ici. Relevé par la relecture de MKT-S.
- **`mkt.buy.first-order.trap` en « services »** : « Compte une réservation
  payée, pas une demande envoyée. » La clause « pas un panier » de la version
  « produits » est retirée (le lexique aurait donné « pas un montant de la
  réservation »), donc le piège ne nomme plus qu'un état non payé au lieu de
  deux.
- **`mkt.sell.gross-margin.noReferenceReason` en « services »** : « logiciel
  vendu seul » devient « proposé seul » / "offered on its own" ; une variante
  sans verbe : « portent sur le logiciel seul » / "are for software on its
  own".
- **`mkt.rev.take-rate`** (la version « services » et le `noReferenceReason`
  hérité) parle de « livraison » / "shipping", "delivery" : peu pertinent pour
  des services.
- **`mkt.sell.churn.where` en « services »** : « dernière réservation reçue …
  sans nouvelle réservation reçue », lourd.
- **`findings.verbMkt.repeat`** et `mkt.funnel.clauseRepeat(One)` en
  « services » disent « en font une deuxième » / "make a second one" (choix de
  l'exécutant : « passer une commande » devient « faire une réservation »).
  Seul dans le constat `chainBreak`, ni « en » ni "one" n'ont d'antécédent :
  le défaut de MKT-4 (plus haut), dans les deux offres. Proposition de la
  relecture : « font une deuxième réservation » / "make a second booking", et
  en « produits » « passent une deuxième commande » / "place a second order".
- **Le verbe anglais de la première vente en « services »** : "receive a
  first booking" avec « première réservation », "get booked" employé seul (le
  verbe que le lexique donne pour « vendre ») ; constant d'une feuille à
  l'autre, à confirmer.

## Les trois termes de glossaire (MKT-G)

Publics dès le merge de MKT-G (C72), recopiés de `docs/engine/glossaire-mkt.md`.

- **Le titre du take rate** : « Take rate — taux de commission » en français
  (le mot du produit en tête) ; l'alternative « Taux de commission — take
  rate », sur le modèle de « Taux de closing — win rate », est gardée en
  commentaire dans `glossary-terms.ts`.
- **L'exemple partagé entre les pages** : les pages `take-rate` et
  `marketplace-liquidity` disent « La place de marché de mobilier
  d'occasion », avec l'article défini, alors que l'exemple est présenté sur la
  page `gmv` : un lecteur arrivé par une recherche ne l'a pas lu.
- **La deuxième étape de l'exemple du take rate** se lit mal en français :
  « Par acheteur actif, c'est lui qui donne à une vente sa valeur pour la place
  de marché… ».
- **« jusqu'à ce que les demandes y trouvent preneur nettement plus souvent
  qu'ailleurs »** (`marketplace-liquidity`, le premier levier) : la relecture
  du texte a écarté « la plupart des demandes », qui se lisait comme une norme
  au-dessus de 50 % ; à confirmer.

## La carte de départ et les Réglages (MKT-6)

- **La case des abonnements de la carte de départ** : avec « Clients et
  prestataires de services » choisi juste au-dessus, elle dit toujours « Les
  vendeurs paient un abonnement » (`start.mktSellerSubscriptions`), et la note
  du type « … un abonnement pour les vendeurs » (`start.mktNote`). C'est la
  lettre de §22.8.5 a (la carte de départ nomme les deux vocabulaires et ne
  passe jamais par le calque « services »). La carte de réglage et les
  Réglages, eux, lisent `setup.mktSellerSubscriptions`, qui suit l'offre
  (« Les prestataires paient un abonnement »). À trancher : la case de la
  carte de départ suit-elle l'offre choisie ? Relevé par l'exécutant et la
  relecture de MKT-6.
- **`settings.firstSaleReset` et `settings.firstSalePaidReset` en
  « services », en anglais** : "The first-booking-received window is part of
  the definition of the first booking received…". Le lexique seul aurait donné
  "the first booking received's definition", illisible : l'ordre des mots
  change. Le français, lui, est le lexique seul (« La fenêtre de première
  réservation reçue fait partie de la définition de la première réservation
  reçue… »), lourd.
- Corrigé avant le merge de MKT-6, pour mémoire : `settings.activationReset`
  et `settings.paidReset` (le SaaS) avaient une espace ordinaire entre `{n}`
  et « jours », contre l'insécable partout ailleurs ; la garde typographique
  le vérifie maintenant.

## Le tableau (MKT-7b)

- **`mkt.next.buyersIsSlide`** (sans abonnements) : « Le verdict des
  acheteurs, plus bas, est le titre de ta première slide. » La phrase ne lit
  pas le côté affiché (C94 : le prochain pas n'a pas de côté) : avec « Offre »
  sélectionné, le verdict des acheteurs n'est pas à l'écran. Trois pistes :
  une variante pour l'offre affichée (une feuille neuve, et le côté passé à
  cette ligne), une phrase sans lieu, ou la garder. Même nature :
  `mkt.note.moneyBody` (l'offre sans abonnements) dit « (plus bas, avec leur
  funnel) », alors que la ligne `liquidityAside` n'existe que si le taux de
  service est connu. Relevé par l'exécutant et la relecture de MKT-7b.
- **« SaaS » et « MRR » dans deux définitions** : `mkt.terms.takeRate` (« il
  joue le rôle du MRR d'un SaaS ») et `mkt.terms.netRevenue` (« Le moteur le
  projette comme un MRR »), mot pour mot de §22.8.5 k, contredisent la garde
  de §22.11.3 (« jamais SaaS », et « MRR » dans `DEMAND_WORDS`). À réécrire, ou
  à garder comme exceptions nommées de la garde (MKT-10 les nomme d'ici là).
- **La phrase de la fuite sur le tableau** (`mktLeakLine`) réutilise les mots
  de `slideTitles.leakClearMrrNew` et `…Retained` du côté : « Ramener le taux
  de service à 12 % vaudrait **~470 € de revenu net nouveau** chaque mois. »
  Une carte du bon à tirer doit la montrer sur le tableau, pas seulement en
  titre de slide. Trois points : la cible y est dite deux fois (la ligne de
  l'étape la dit déjà) ; elle finit sur « chaque mois » quand les lignes « À
  côté » juste dessous finissent sur « par mois » ; une étape qui est un
  événement se lit moins bien (« Ramener la première commande à 25 % »).
- **La légende de la colonne des vendeurs inscrits** dit « vendeurs inscrits
  en mai 2026 » sans le compte, quand celle des acheteurs dit « 2 900 inscrits
  en mai 2026, ramenés à 100 » : « inscrits » nu est un mot du SaaS côté
  offre, et aucune feuille ne porte « {n} vendeurs inscrits en {cohort},
  ramenés à 100 ». À écrire (une feuille du calque de l'offre, et sa jumelle
  « services »), ou à laisser.
- **`mkt.terms.gmv.term` en « services »** reste "GMV (gross merchandise
  value)" : le lexique garde le nom du GMV, mais un écran de services affiche
  un mot de marchandise.

## Les slides (MKT-8)

- **La formule de la marge brute** (`mkt.rev.gross-margin`, §22.4, et sa
  jumelle « services ») dit « remboursements à ta charge » / "refunds you
  bear" : les pages d'annexe l'impriment, et une slide ne s'adresse jamais au
  lecteur. Gardée par une exception nommée de `sentences-guard.test.ts` ; à
  réécrire (par exemple « remboursements à la charge de la place de marché »),
  ou à garder.
- **`mkt.total.slide.marginRange`** (la tuile de la LTV) : avec une fourchette,
  « marge estimée à 55 à 65 % », deux « à » de suite ; l'anglais "margin
  estimated at 55–65%" va bien. Pistes : « marge estimée : {range} ».
- **`slide.chartTimeHealthy`** (une feuille du SaaS, relue) : avec une
  fourchette, « remboursé à 20 à 23 mois, puis ~2 à 5 mois de marge » ;
  l'anglais pose deux étiquettes. Piste : « remboursé en {payback}, puis
  {after} de marge ». La place de marché la montre plus souvent, ses montants
  étant des fourchettes ; le SaaS la montre aussi.
- **Les slides « Et si » d'ensemble** n'ont pas de courbe (le retour en
  dessine une) : elle ne tenait pas au-dessus du pied. Une question de mise en
  page, à regarder avec la re-synchro (A23.e).
- **La note de cohorte de la slide du funnel** est retirée : `mkt.funnel.slideSameHundred`
  et `slideSellerSameHundred` n'ont pas de lecteur. À supprimer, ou à placer.
- **Le montant de la fuite d'un churn** : le titre (la chaîne de la fuite) et
  la colonne « À côté » (le classement) n'arrondissent pas au même rang ; ils
  peuvent différer d'un cran.
- **Les coupures de ligne** : une fourchette se coupe dans un titre (« en 20 /
  à 23 mois », "20– / 23 months"), et l'anglais coupe "within 60 / days".
  Des insécables dans le formateur des fourchettes et dans `{n} days`
  l'éviteraient, pour tout le moteur.
