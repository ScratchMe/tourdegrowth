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
