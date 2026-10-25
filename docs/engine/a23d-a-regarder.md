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
