# Les trois termes de glossaire de la place de marché (MKT-G, C72)

*Écrit le 2026-10-26 par la session principale, avant MKT-G (fiche de
`place-de-marche.md` §22.12), à partir des seules définitions sourcées de
l'annexe de §22 et sur le modèle des quatre termes d'A7.3.e (`win-rate`,
`sales-cycle`, `acv`, `lead-to-opportunity`). **Toute la copie de ce document
est neuve : chaque chaîne recopiée dans `src/content/` porte « TODO: à
relire » (convention 6) et passe au bon à tirer A23.d.***

## 0. Ce que l'exécutant de MKT-G doit savoir avant de recopier

- **Les slugs** (anglais aux deux langues, R2-16) : `gmv`, `take-rate`,
  `marketplace-liquidity`. Ils s'ajoutent à `GlossaryTermId` après ceux
  d'A7.3.e, sous un commentaire « A23 MKT-G (C72) ».
- **Le texte** se recopie mot pour mot, champ par champ, dans
  `glossary-terms.ts` (`term`, `definition`), `glossary.ts` (`updatedAt`,
  `extended`, `related`) et `glossary-deep.ts` (`formula`, `example`,
  `benchmark`, `howToImprove`, `inTheTour`, `faq`). Les espaces insécables se
  posent selon §23.8 ; ce document écrit des espaces ordinaires.
- **Le marqueur** « TODO: à relire » va dans les **commentaires**, comme pour
  A7.3.e : `glossary.test.ts` refuse « TODO » dans les chaînes des pages
  longues.
- **`updatedAt`** : la date du jour où MKT-G écrit les trois termes, avec le
  commentaire `// A23 MKT-G — created`.
- **Aucun chiffre de référence hors de l'annexe** : la seule fourchette est
  celle du take rate (« du bas d'un chiffre au milieu des trente pour cent »,
  Lenny's Newsletter et a16z). Tous les autres nombres sont ceux de l'exemple
  de §22.10 (la place de marché de mobilier d'occasion d'août 2026) et de ce
  que le moteur en sort (§22.10.2), jamais un jeu neuf.
- **Les sources**, à garder en commentaire au-dessus de chaque entrée de
  `glossary-deep.ts`, comme la source de Janz pour `acv` :
  [Lenny's Newsletter, The most important marketplace metrics](https://lennysnewsletter.com/p/the-most-important-marketplace-metrics) ;
  [a16z, 13 metrics for marketplace companies](https://a16z.com/13-metrics-for-marketplace-companies/) ;
  [a16z, The marketplace glossary](https://a16z.com/the-marketplace-glossary/) ;
  [Causo, Marketplace liquidity](https://hub.causo.ai/guides/marketplace-liquidity-seed).
- **Les acronymes** (`acronyms.test.ts`) : `GMV` se développe dans son titre
  (« Gross Merchandise Value ») ; MKT-G ajoute `gmv: /gross merchandise
  value/i` à `EXPANSION`. La page `gmv` écrit « LTV » une fois, développé (« lifetime
  value ») dans la même phrase ; aucune
  autre abréviation (pas d'« AOV » : « panier moyen » / "average order
  value").
- **Les tests** : la règle « chaque terme est lié depuis au moins deux autres,
  dont deux plus anciens pour un terme neuf » (`glossary.test.ts`) s'étend aux
  trois : MKT-G ajoute une liste `NEW_MARKETPLACE_TERMS` à côté de
  `NEW_SALES_TERMS`, avec la même exigence et un sabotage noté.

## 1. Le maillage

### Les `related` des trois termes

| Terme | `related` |
|---|---|
| `gmv` | `take-rate`, `marketplace-liquidity`, `revenue`, `north-star-metric` |
| `take-rate` | `gmv`, `revenue`, `arpu`, `ltv` |
| `marketplace-liquidity` | `gmv`, `activation`, `retention`, `growth-loop` |

### Les six échanges (termes existants, tous déjà à quatre `related`)

Chaque terme neuf reçoit deux liens de termes plus anciens. Comme pour A7.3.e,
chaque lien neuf est un **échange** contre un lien vers une page qui en reçoit
plus que deux, et aucune cible ne descend sous deux liens entrants. Aucun lien
vers un terme d'A7.3.e n'est retiré (leur règle des deux liens plus anciens
tient toujours).

| Terme existant | Gagne | Perd | Liens entrants du terme perdu, avant → après |
|---|---|---|---|
| `revenue` | `gmv` | `upsell-cross-sell` | 4 → 3 |
| `north-star-metric` | `gmv` | `cohort-analysis` | 4 → 3 |
| `arpu` | `take-rate` | `cac-payback` | 5 → 4 |
| `ltv` | `take-rate` | `cac-payback` | 4 → 3 |
| `activation` | `marketplace-liquidity` | `retention` | 6 → 5 |
| `growth-loop` | `marketplace-liquidity` | `acquisition` | 5 → 4 |

`revenue` garde `aarrr` (R2-13). Mesuré le 2026-10-26 sur `main` (`8778e80`) :
chaque terme existant a de 2 à 6 liens entrants ; après les échanges, le
minimum reste 2.

### La question du Tour de chaque terme (`inTheTour.questionId`)

| Terme | Question | Pourquoi |
|---|---|---|
| `gmv` | `rev-2` (« Connais-tu ta LTV, même grossièrement ? ») | l'erreur la plus courante d'une LTV de place de marché est de la calculer sur le GMV |
| `take-rate` | `rev-1` (« Ton modèle de pricing a-t-il été testé, pas juste choisi ? ») | le take rate est le prix d'une place de marché |
| `marketplace-liquidity` | `act-2` (« Sais-tu quel pourcentage d'utilisateurs atteint ce moment ? ») | le premier moment de valeur d'un acheteur est une demande qui trouve preneur |

## 2. `gmv`

### `glossary-terms.ts`

- `term` : `same("GMV — Gross Merchandise Value")`
- `definition` :
  - fr : Le volume total des ventes qui passent par une place de marché sur une période : ce que dépensent les acheteurs, avant que la plateforme ne prenne sa part.
  - en : The total value of the sales that go through a marketplace over a period: what buyers spend, before the platform takes its share.

### `glossary.ts`

- `related` : `["take-rate", "marketplace-liquidity", "revenue", "north-star-metric"]`
- `extended` :
  - fr : Le GMV est le chiffre dont une place de marché est la plus fière, et celui qu'on lit le plus souvent de travers. Il dit combien les acheteurs ont dépensé sur la plateforme, pas combien la plateforme a gagné : entre les deux se trouve le take rate, souvent une petite fraction, et les confondre gonfle tous les chiffres construits dessus — le chiffre d'affaires annoncé, la valeur d'un acheteur sur sa durée de vie, le budget qu'un canal d'acquisition peut se permettre. Bien lu, le GMV est le produit de trois facteurs, les acheteurs actifs, les commandes par acheteur et le panier moyen, et chacun répond à une question différente sur le marché que tu héberges. Il se gonfle aussi sans le vouloir : compte les commandes annulées, inclus les taxes et la livraison, ou paie des remises de ta poche, et le GMV monte pendant que ce que tu gardes ne bouge pas. C'est pour ça qu'il ne se lit jamais seul : toujours avec le revenu net à côté, et le take rate qui relie les deux.
  - en : GMV is the number a marketplace is proudest of, and the one most often misread. It says how much buyers spent through the platform, not how much the platform earned: between the two sits the take rate, often a small fraction, and confusing them inflates every figure built on top — the revenue announced, what a buyer is worth over their lifetime, the budget an acquisition channel can afford. Read properly, GMV is the product of three factors, active buyers, orders per buyer and the average order value, and each answers a different question about the market you host. It is also easy to inflate without meaning to: count cancelled orders, include taxes and delivery, or pay for discounts out of your own pocket, and GMV climbs while what you keep does not move. That is why it is never read alone: always with net revenue beside it, and the take rate that links the two.

### `glossary-deep.ts`

#### `formula`

- `expression` :
  - fr : GMV = somme des montants des commandes payées par les acheteurs sur la place de marché, sur la période = acheteurs actifs × commandes par acheteur × panier moyen
  - en : GMV = sum of the order values paid by buyers through the marketplace, over the period = active buyers × orders per buyer × average order value
- `terms` :
  1. `symbol` : fr « Commandes » / en "Orders" ; `meaning` :
     - fr : Toutes les commandes payées sur la place de marché pendant la période. Décide une fois pour toutes si une commande annulée ou remboursée sort du compte, et écris-le : un même mois peut se publier brut, avant annulations, ou net, après.
     - en : Every order paid through the marketplace in the period. Decide once whether a cancelled or refunded order leaves the count, and write it down: the same month can be reported gross, before cancellations, or net, after them.
  2. `symbol` : fr « Montant d'une commande » / en "Order value" ; `meaning` :
     - fr : Ce que l'acheteur a payé pour elle. Les taxes, la livraison et les frais de service de l'acheteur y entrent ou non selon l'entreprise : le chiffre n'est comparable qu'à lui-même, mois après mois, à définition constante.
     - en : What the buyer paid for it. Taxes, delivery and the buyer's service fees are in or out depending on the company: the number is only comparable with itself, month after month, under one definition.
  3. `symbol` : fr « Acheteurs actifs, commandes par acheteur, panier moyen » / en "Active buyers, orders per buyer, average order value" ; `meaning` :
     - fr : Les trois facteurs du GMV. Ils bougent pour des raisons différentes et appellent des leviers différents : un GMV qui monte mérite d'être décomposé avant d'être fêté.
     - en : The three factors GMV breaks into. They move for different reasons and call for different levers, so a GMV that grows is worth splitting before it is celebrated.
- `note` :
  - fr : Le GMV est un volume, pas un revenu : la place de marché n'en garde qu'une part, son take rate, et le reste va aux vendeurs. Lenny's Newsletter et a16z le définissent tous deux comme la valeur totale des ventes passées par la place de marché sur une période.
  - en : GMV is volume, not revenue: the marketplace keeps only a share of it, its take rate, and the rest goes to the sellers. Lenny's Newsletter and a16z both define it as the total value of the sales transacted through the marketplace over a period.

#### `example`

- `title` : fr « 273 780 € de ventes, et les 32 853,60 € que la place de marché garde » / en "€273,780 of sales, and the €32,853.60 the marketplace keeps"
- `steps` :
  1. fr : Une place de marché de mobilier d'occasion, en août : 4 212 commandes, 273 780 € payés par les acheteurs. C'est son GMV du mois.
     en : A second-hand furniture marketplace, in August: 4,212 orders, €273,780 paid by buyers. That is its GMV for the month.
  2. fr : Le même GMV, décomposé : 14 040 acheteurs actifs en fin de mois × 0,3 commande chacun = 4 212 commandes, × un panier moyen de 65 € = 273 780 €.
     en : The same GMV, split into its factors: 14,040 active buyers at the end of the month × 0.3 orders each = 4,212 orders, × an average order value of €65 = €273,780.
  3. fr : La place de marché en garde 12 % : 273 780 € × 0,12 = 32 853,60 € de revenu net. Les 240 926,40 € restants vont aux vendeurs.
     en : The marketplace keeps 12% of it: €273,780 × 0.12 = €32,853.60 of net revenue. The other €240,926.40 goes to the sellers.
  4. fr : Annualisé, le GMV affiche 3 285 360 € (× 12). Le présenter comme « 3,3 millions de chiffre d'affaires » est la confusion classique : le revenu est de 394 243,20 € par an, un peu plus de huit fois moins.
     en : Annualised, the GMV reads €3,285,360 (× 12). Presenting it as "€3.3 million of revenue" is the classic confusion: the revenue is €394,243.20 a year, a little over eight times less.
- `takeaway` :
  - fr : Le GMV mesure la taille du marché que tu héberges ; le revenu, la part que tu en gardes. Publie-les côte à côte, et ne les additionne jamais.
  - en : GMV measures the size of the market you host; revenue, the share of it you keep. Publish them side by side, and never add one to the other.

#### `benchmark`

1. fr : Il n'y a pas de bon GMV en général : une place de marché de meubles d'occasion et une autre de machines industrielles peuvent avoir le même nombre de commandes et des GMV qui n'ont rien à voir. Le GMV dit la taille d'un marché, pas sa santé.
   en : There is no good GMV in general: a marketplace of second-hand furniture and one of industrial machines can have the same number of orders and GMVs that have nothing in common. GMV says how big a market is, not how healthy it is.
2. fr : Les GMV publiés sont rarement comparables : certains comptent les taxes, la livraison ou les commandes annulées, d'autres non, et quelques-uns la valeur des annonces plutôt que celle des ventes. Avant de comparer deux GMV, vérifie ce que chacun compte.
   en : Published GMV figures are rarely comparable: some include taxes, delivery or cancelled orders, others don't, and a few report the value of listings rather than of sales. Before comparing two GMVs, check what each one counts.
3. fr : La comparaison qui vaut la peine est ton propre GMV mois après mois, décomposé en ses trois facteurs, avec le revenu net à côté. Un GMV qui monte pendant que le revenu net stagne veut dire que le take rate baisse : remises, remboursements, ou des ventes qui se déplacent vers ce qui rapporte moins.
   en : The comparison worth making is your own GMV month after month, split into its three factors, with net revenue beside it. A GMV that grows while net revenue stays flat means the take rate is falling: discounts, refunds, or sales shifting towards what earns less.

#### `howToImprove`

1. fr : Travaille un facteur à la fois. Plus d'acheteurs actifs, plus de commandes par acheteur et un panier moyen plus élevé sont trois problèmes différents : l'acquisition et la première commande pour le premier, le réachat pour le deuxième, le catalogue et l'offre pour le troisième.
   en : Work on one factor at a time. More active buyers, more orders per buyer and a higher average order value are three different problems: acquisition and the first order for the first, repeat purchase for the second, the catalogue and the offer for the third.
2. fr : Répare les recherches qui ne trouvent rien. Un acheteur qui cherche et repart les mains vides, c'est du GMV qui n'a jamais eu lieu, et le taux de service le compte : chaque point de taux de service gagné, ce sont des commandes qui avaient déjà un acheteur.
   en : Fix the searches that find nothing. A buyer who looks and leaves empty-handed is GMV that never happened, and the fill rate counts it: every point of fill rate gained is orders that already had a buyer.
3. fr : Fais revenir les acheteurs pour une deuxième commande. Dans l'exemple, 5 inscrits acheteurs sur 100 en passent une deuxième dans les 90 jours : c'est par le réachat que le GMV d'une place de marché cesse de dépendre de la seule acquisition.
   en : Bring buyers back for a second order. In the example, 5 buyer sign-ups out of 100 place a second order within 90 days: repeat purchase is how a marketplace's GMV stops depending on acquisition alone.
4. fr : Ne l'achète pas. Les remises et subventions payées par la place de marché font monter le GMV et baisser ce qu'elle garde ; retire-les du revenu net, et lis le take rate à côté du GMV chaque mois.
   en : Don't buy it. Discounts and subsidies paid by the marketplace raise GMV and lower what it keeps; take them out of net revenue, and read the take rate beside the GMV every month.

#### `inTheTour`

- `questionId` : `rev-2`
- `body` :
  - fr : Le Tour demande si tu connais ta LTV (lifetime value), même grossièrement — 20 points pour une estimation solide, 7 pour une estimation très approximative, 0 si tu n'en as aucune idée. Sur une place de marché, l'erreur la plus courante est là : une LTV calculée sur le GMV plutôt que sur ce que la place de marché garde. Dans l'exemple, le panier moyen d'un acheteur est de 65 €, mais la place de marché en garde 7,80 € (65 × 12 %) : une LTV construite sur les 65 € est plus de huit fois trop haute, et chaque budget d'acquisition qu'on en tire l'est aussi. Une estimation solide part du revenu net par acheteur, jamais du GMV.
  - en : The Tour asks whether you know your LTV (lifetime value), even roughly — 20 points for a solid estimate, 7 for a very rough guess, 0 for no idea. On a marketplace, the most common error sits right here: an LTV computed on GMV rather than on what the marketplace keeps. In the example, a buyer's average order value is €65, but the marketplace keeps €7.80 of it (65 × 12%): an LTV built on the €65 is more than eight times too high, and so is every acquisition budget derived from it. A solid estimate starts from net revenue per buyer, never from GMV.

#### `faq`

1. Q fr « C'est quoi le GMV ? » / en "What is GMV?"
   - fr : Le gross merchandise value : la valeur totale des ventes qui passent par une place de marché sur une période, ce que dépensent les acheteurs. Ce n'est pas le revenu de la place de marché, qui n'en est que la part gardée.
   - en : Gross merchandise value: the total value of the sales that go through a marketplace over a period, what buyers spend. It is not the marketplace's revenue, which is only the share it keeps.
2. Q fr « Comment calculer le GMV ? » / en "How do you calculate GMV?"
   - fr : Additionne le montant de toutes les commandes payées sur la place de marché pendant la période. Pour le comprendre, décompose-le : acheteurs actifs × commandes par acheteur × panier moyen. 14 040 acheteurs × 0,3 commande × 65 € = 273 780 €.
   - en : Add up the value of every order paid through the marketplace in the period. To understand it, split it: active buyers × orders per buyer × average order value. 14,040 buyers × 0.3 orders × €65 = €273,780.
3. Q fr « Quelle différence entre le GMV et le chiffre d'affaires ? » / en "What is the difference between GMV and revenue?"
   - fr : Le GMV est ce que les acheteurs dépensent sur la place de marché ; le chiffre d'affaires, ce que la place de marché en garde, en commissions et en frais. Le rapport des deux est le take rate : 32 853,60 € gardés sur 273 780 € de GMV, c'est 12 %.
   - en : GMV is what buyers spend through the marketplace; revenue is what the marketplace keeps of it, in commissions and fees. The ratio of the two is the take rate: €32,853.60 kept on €273,780 of GMV is 12%.
4. Q fr « Faut-il compter les commandes annulées dans le GMV ? » / en "Should GMV include cancelled orders?"
   - fr : Les deux se défendent, pourvu que ce soit écrit et que ça ne change plus. Les retirer donne un chiffre plus petit et plus juste ; les garder en publiant le taux d'annulation à côté donne la même information. Passer de l'un à l'autre d'un mois sur l'autre ne donne ni l'un ni l'autre.
   - en : Either can be defended, as long as it is written down and never changes. Leaving them out gives a smaller, truer number; keeping them in and publishing the cancellation rate beside it gives the same information. Switching from one to the other between months gives neither.

## 3. `take-rate`

### `glossary-terms.ts`

- `term` : fr « Take rate — taux de commission » / en "Take rate" (« take rate » en tête aux deux langues : c'est le mot du produit, « Commission (take rate) », et la requête la plus courante ; à trancher au bon à tirer si « Taux de commission — take rate » est préféré, comme « Taux de closing — win rate »)
- `definition` :
  - fr : La part du volume d'affaires (GMV) qu'une place de marché garde pour elle : son revenu net divisé par ce que les acheteurs y ont dépensé.
  - en : The share of the GMV that a marketplace keeps for itself: its net revenue divided by what buyers spent through it.

### `glossary.ts`

- `related` : `["gmv", "revenue", "arpu", "ltv"]`
- `extended` :
  - fr : Le take rate est le prix d'une place de marché, exprimé en part de ce qui y passe. C'est le levier le plus direct sur le revenu — un point de plus sur le même GMV, c'est un point de revenu en plus, sans coût d'acquisition — et le plus dangereux, parce que les deux côtés du marché y réagissent. Les vendeurs qui paient trop montent leurs prix, partent, ou font sortir la transaction de la plateforme dès qu'acheteur et vendeur se sont rencontrés ; les acheteurs qui paient des frais visibles les comparent à un achat ailleurs. Ce qu'une place de marché peut garder dépend donc moins de son ambition que de ce qu'elle apporte à chaque transaction : le paiement, la confiance, l'assurance, la logistique, une demande que les vendeurs ne trouveraient pas seuls. La bonne lecture n'est pas le taux seul mais le taux à côté du GMV : un take rate qui monte pendant que le GMV baisse, c'est une hausse de prix que le marché paie en partant.
  - en : The take rate is a marketplace's price, expressed as a share of what goes through it. It is the most direct lever on revenue — one point more on the same GMV is one point more of revenue, at no acquisition cost — and the most dangerous one, because both sides of the market react to it. Sellers who pay too much raise their prices, leave, or take the transaction off the platform as soon as buyer and seller have met; buyers who pay a visible fee compare it with buying elsewhere. What a marketplace can keep therefore depends less on its ambition than on what it brings to each transaction: payment, trust, insurance, logistics, demand that sellers could not find on their own. The right reading is not the rate alone but the rate beside the GMV: a take rate that rises while GMV falls is a price increase the market pays for by leaving.

### `glossary-deep.ts`

#### `formula`

- `expression` :
  - fr : Take rate = revenu net de la place de marché sur les transactions (commissions et frais) ÷ GMV, sur la même période
  - en : Take rate = the marketplace's net revenue from transactions (commissions and fees) ÷ GMV, over the same period
- `terms` :
  1. `symbol` : fr « Revenu net » / en "Net revenue" ; `meaning` :
     - fr : Ce que la place de marché garde de chaque transaction : la commission prélevée aux vendeurs, les frais de service facturés aux acheteurs, les frais de paiement refacturés. Les abonnements des vendeurs, s'il y en a, sont une ligne de revenu à part : ils ne sont pas une part des transactions.
     - en : What the marketplace keeps from each transaction: the commission taken from sellers, the service fees charged to buyers, payment fees passed on. Sellers' subscriptions, if any, are a separate revenue line: they are not a share of transactions.
  2. `symbol` : fr « GMV » / en "GMV" ; `meaning` :
     - fr : La valeur totale des commandes payées sur la place de marché sur la même période, définie de la même façon : si les commandes remboursées sortent du GMV, les commissions remboursées avec elles sortent aussi du revenu.
     - en : The total value of the orders paid through the marketplace over the same period, defined the same way: if refunded orders leave the GMV, the commissions refunded with them leave the revenue too.
- `note` :
  - fr : La commission affichée et le take rate ne sont pas le même chiffre : remises, remboursements, livraisons offertes et vendeurs à conditions spéciales tirent tous le taux réalisé sous la grille tarifaire. Mesure le take rate dans la comptabilité, pas sur la page des tarifs.
  - en : The advertised commission and the take rate are not the same number: discounts, refunds, free delivery and sellers on special terms all pull the realised rate below the price list. Measure the take rate from the books, not from the pricing page.

#### `example`

- `title` : fr « 12 % de 273 780 €, et ce que vaut un point » / en "12% of €273,780, and what one point is worth"
- `steps` :
  1. fr : La place de marché de mobilier d'occasion, en août : 273 780 € de GMV, 32 853,60 € gardés en commissions et en frais. Take rate = 32 853,60 ÷ 273 780 = 12 %.
     en : The second-hand furniture marketplace, in August: €273,780 of GMV, €32,853.60 kept in commissions and fees. Take rate = 32,853.60 ÷ 273,780 = 12%.
  2. fr : Par acheteur actif, c'est lui qui donne à une vente sa valeur pour la place de marché : 0,3 commande par mois × 65 € × 12 % = 2,34 € de revenu net par acheteur et par mois.
     en : Per active buyer, it is what makes a sale worth something to the marketplace: 0.3 orders a month × €65 × 12% = €2.34 of net revenue per buyer per month.
  3. fr : À 13 %, à GMV égal, le mois rapporterait 273 780 € × 0,13 = 35 591,40 €, soit 2 737,80 € de plus — et 2,535 € par acheteur au lieu de 2,34 €.
     en : At 13%, with the same GMV, the month would bring in €273,780 × 0.13 = €35,591.40, that is €2,737.80 more — and €2.535 per buyer instead of €2.34.
  4. fr : Ce « à GMV égal » est toute la question. Si un point de commission en plus poussait les vendeurs à monter leurs prix ou à partir, et que le GMV baissait de plus d'un treizième (environ 7,7 %), la place de marché gagnerait moins qu'avant.
     en : That "with the same GMV" is the whole question. If one more point of commission made sellers raise their prices or leave, and GMV fell by more than one thirteenth (about 7.7%), the marketplace would earn less than before.
- `takeaway` :
  - fr : Un take rate ne se lit jamais seul. Un point de commission n'est un gain que si le GMV tient, et la seule façon de le savoir est de le changer sur une partie du marché et de regarder les deux chiffres.
  - en : A take rate is never read alone. One point of commission is only a gain if GMV holds, and the only way to know is to change it on part of the market and watch both numbers.

#### `benchmark`

1. fr : Les take rates publiés pour des places de marché connues vont du bas d'un chiffre au milieu des trente pour cent. L'écart n'est pas du bruit : il suit la fragmentation de chaque côté, la facilité de conclure ailleurs, et ce que la plateforme apporte à la transaction (Lenny's Newsletter, « The most important marketplace metrics » ; a16z, « 13 metrics for marketplace companies »).
   en : The take rates published for well-known marketplaces run from the low single digits to the mid-thirties of percent. The spread is not noise: it follows how fragmented each side is, how easy it is to transact elsewhere, and how much the platform brings to the transaction (Lenny's Newsletter, "The most important marketplace metrics"; a16z, "13 metrics for marketplace companies").
2. fr : Cette fourchette dit où se trouvent les places de marché, pas où la tienne devrait être : un taux recopié d'une autre catégorie ignore ce qui fait payer les vendeurs de cette catégorie. La comparaison qui vaut la peine est ton propre taux réalisé, mois après mois, à côté de ton GMV.
   en : That range says where marketplaces sit, not where yours should: a rate copied from another category ignores what makes that category's sellers pay. The comparison worth making is your own realised rate, month after month, beside your GMV.
3. fr : Lis le taux réalisé, pas le taux affiché. Une commission peut afficher un taux et en réaliser bien moins une fois les remises et les remboursements passés, et l'écart entre les deux est en soi une trouvaille.
   en : Read the realised rate, not the advertised one. A commission can advertise one rate and realise far less once discounts and refunds have gone through, and the gap between the two is a finding in itself.

#### `howToImprove`

1. fr : Fais payer ce que tu apportes. La protection du paiement, une assurance, la livraison ou une garantie sont des raisons de payer que vendeurs et acheteurs voient ; une commission sans rien de visible derrière est la première qu'ils cherchent à contourner.
   en : Charge for what you add. Payment protection, insurance, delivery or a guarantee are reasons to pay that sellers and buyers can see; a commission with nothing visible behind it is the first one they try to get around.
2. fr : Teste avant de changer partout. Bouge le taux sur une catégorie, une région ou les nouveaux vendeurs seulement, et regarde le GMV et le nombre de vendeurs actifs à côté du revenu, sur au moins un cycle complet de commandes.
   en : Test before you change it everywhere. Move the rate on one category, one region or new sellers only, and watch GMV and the number of active sellers beside revenue, over at least one full cycle of orders.
3. fr : Ferme les fuites entre le taux affiché et le taux réalisé : remises que personne ne revoit, remboursements qui rendent toute la commission, vendeurs restés aux conditions du lancement. Elles coûtent des points sans que personne l'ait décidé.
   en : Close the leaks between the advertised and the realised rate: discounts nobody reviews, refunds that return the whole commission, sellers left on launch terms. They cost points without anyone having decided it.
4. fr : Surveille les transactions qui sortent de la plateforme. Un acheteur et un vendeur qui se rencontrent une fois et traitent en direct la suivante, c'est un take rate à zéro ; des réachats qui restent sur la plateforme sont le signe que le taux est accepté.
   en : Watch for transactions leaving the platform. A buyer and a seller who meet once and deal directly the next time are a take rate of zero; repeat orders that stay on the platform are the sign the rate is accepted.

#### `inTheTour`

- `questionId` : `rev-1`
- `body` :
  - fr : Le Tour demande si ton pricing a été testé plutôt que simplement choisi — 20 points s'il a été testé face à des alternatives, 7 s'il a été choisi avec une logique, 0 s'il l'a été un peu arbitrairement. Sur une place de marché, le take rate est le prix, et c'est celui qu'on fixe le plus souvent une fois au lancement pour ne plus jamais y toucher : recopié d'un concurrent, ou arrondi à un chiffre qui semblait juste. Le tester, c'est le changer sur une partie du marché et regarder ce que font les deux côtés — le GMV, les vendeurs qui restent, les acheteurs qui reviennent — pas seulement le revenu du mois suivant.
  - en : The Tour asks whether your pricing has been tested rather than just chosen — 20 points for tested against alternatives, 7 for chosen with some reasoning, 0 for picked arbitrarily. On a marketplace, the take rate is the price, and it is the one most often set once at launch and never touched again: copied from a competitor, or rounded to a number that felt fair. Testing it means changing it on part of the market and watching what both sides do — the GMV, the sellers who stay, the buyers who come back — not only the revenue of the following month.

#### `faq`

1. Q fr « C'est quoi le take rate ? » / en "What is a take rate?"
   - fr : La part du GMV qu'une place de marché garde comme revenu : ses commissions et ses frais divisés par ce que les acheteurs y ont dépensé. 32 853,60 € gardés sur 273 780 € de GMV, c'est un take rate de 12 %.
   - en : The share of a marketplace's GMV that it keeps as revenue: its commissions and fees divided by what buyers spent through it. €32,853.60 kept on €273,780 of GMV is a 12% take rate.
2. Q fr « C'est quoi un bon take rate ? » / en "What is a good take rate?"
   - fr : Les taux publiés pour des places de marché connues vont du bas d'un chiffre au milieu des trente pour cent, et l'écart suit ce que chaque plateforme apporte à la transaction. Un bon taux est celui que ton marché continue de payer sans que le GMV baisse ni que les transactions sortent de la plateforme.
   - en : Published rates for well-known marketplaces run from the low single digits to the mid-thirties of percent, and the spread follows what each platform brings to the transaction. A good rate is the one your market keeps paying without GMV falling or transactions leaving the platform.
3. Q fr « Le take rate, c'est la commission ? » / en "Is the take rate the same as the commission?"
   - fr : Pas tout à fait. La commission est le prix affiché aux vendeurs ; le take rate, ce que tu gardes vraiment, frais des acheteurs compris, remises et remboursements déduits. Les deux peuvent être loin l'un de l'autre, et c'est le take rate que le revenu suit.
   - en : Not quite. The commission is the price advertised to sellers; the take rate is what you actually keep, buyer fees included, discounts and refunds deducted. The two can be far apart, and revenue follows the take rate.
4. Q fr « Les abonnements des vendeurs comptent-ils dans le take rate ? » / en "Do sellers' subscriptions count in the take rate?"
   - fr : Non. Un abonnement se paie que quelque chose se vende ou non : c'est une ligne de revenu à part, récurrente. L'ajouter aux commissions fait paraître le take rate plus haut que ce que rapportent vraiment les transactions.
   - en : No. A subscription is paid whether or not anything sells: it is a separate, recurring revenue line. Adding it to the commissions makes the take rate look higher than what transactions actually bring in.

## 4. `marketplace-liquidity`

### `glossary-terms.ts`

- `term` : fr « Liquidité d'une place de marché » / en "Marketplace liquidity"
- `definition` :
  - fr : La probabilité qu'une demande trouve une offre dans un délai raisonnable. Elle se mesure par le taux de service : la part des demandes qui aboutissent.
  - en : The likelihood that a request finds supply within a reasonable time. It is measured by the fill rate: the share of requests that end in a transaction.

### `glossary.ts`

- `related` : `["gmv", "activation", "retention", "growth-loop"]`
- `extended` :
  - fr : La liquidité est la promesse qu'une place de marché fait aux deux côtés : qu'un acheteur qui vient chercher trouvera, et qu'un vendeur qui publie vendra, dans un délai raisonnable. C'est elle qui fait revenir, et c'est ce qu'une place de marché vide ne peut pas simuler. Elle n'a pas de formule unique, parce que ce qui compte comme une rencontre dépend du marché : une recherche qui finit en commande, une demande de réservation acceptée, une annonce vendue dans la semaine. Le moteur la mesure par le taux de service, la part des demandes ou des recherches qui aboutissent à une transaction, et Lenny's Newsletter tient cette part pour la mesure ultime de la santé d'une place de marché. Deux choses la rendent difficile à lire : elle dépend de la définition d'une demande, qui ne doit jamais changer d'un mois à l'autre, et c'est une propriété de chaque segment plus que de l'ensemble — une place de marché peut être liquide dans une ville ou une catégorie et vide dans la suivante.
  - en : Liquidity is the promise a marketplace makes to both sides: that a buyer who comes looking will find, and a seller who lists will sell, within a reasonable time. It is what brings people back, and what an empty marketplace cannot fake. It has no single formula, because what counts as a match depends on the market: a search that ends in an order, a booking request accepted, a listing sold within the week. The engine measures it by the fill rate, the share of requests or searches that end in a transaction, and Lenny's Newsletter calls that share the ultimate measure of a marketplace's health. Two things make it hard to read: it depends on the definition of a request, which must never change from one month to the next, and it is a property of each segment more than of the whole — a marketplace can be liquid in one city or category and empty in the next.

### `glossary-deep.ts`

#### `formula`

- `expression` :
  - fr : Taux de service = demandes (ou recherches) avec une intention qui aboutissent à une transaction ÷ demandes (ou recherches) avec une intention, sur la même période
  - en : Fill rate = requests (or searches) with intent that end in a transaction ÷ requests (or searches) with intent, over the same period
- `terms` :
  1. `symbol` : fr « Demandes avec une intention » / en "Requests with intent" ; `meaning` :
     - fr : Ce que fait un acheteur quand il veut quelque chose : une recherche, une demande de réservation, une demande de devis. Écris laquelle tu comptes et ne mélange jamais deux sortes dans un même taux : une recherche ne coûte rien et une demande de devis si, et leurs taux n'ont rien en commun.
     - en : What a buyer does when they want something: a search, a booking request, a quote request. Write down which one you count and never mix two kinds in the same rate: a search costs nothing and a quote request does, and their rates have nothing in common.
  2. `symbol` : fr « Qui aboutissent » / en "Ending in a transaction" ; `meaning` :
     - fr : La demande a mené à une commande, une réservation confirmée ou un devis accepté, dans un délai que tu écris aussi. Une demande servie après que l'acheteur est allé ailleurs n'est pas une rencontre.
     - en : The request led to an order, a confirmed booking or an accepted quote, within a window you also write down. A request served after the buyer has gone elsewhere is not a match.
- `note` :
  - fr : On dit aussi « match rate ». La liquidité elle-même est une probabilité — la chance qu'une demande trouve une offre dans un délai raisonnable (Causo, « Marketplace liquidity ») — et le taux de service est la façon dont une place de marché la mesure en pratique. Sa définition dépend de chaque place de marché (a16z, « The marketplace glossary »).
  - en : Also called match rate. Liquidity itself is a probability — the chance that a request finds supply within a reasonable time (Causo, "Marketplace liquidity") — and the fill rate is how a marketplace measures it in practice. Its definition depends on each marketplace (a16z, "The marketplace glossary").

#### `example`

- `title` : fr « 26 000 recherches, 2 340 commandes » / en "26,000 searches, 2,340 orders"
- `steps` :
  1. fr : La place de marché de mobilier d'occasion, en août : 26 000 recherches avec une intention, dont 2 340 ont abouti à une commande. Taux de service = 2 340 ÷ 26 000 = 9 %.
     en : The second-hand furniture marketplace, in August: 26,000 searches with intent, 2,340 of which ended in an order. Fill rate = 2,340 ÷ 26,000 = 9%.
  2. fr : Neuf recherches sur cent trouvent ce que l'acheteur était venu chercher. Les 91 autres sont des acheteurs qui ont cherché et sont repartis sans rien, et chacun d'eux a une raison de ne pas revenir.
     en : Nine searches out of a hundred find what the buyer came for. The other 91 are buyers who looked and left with nothing, and each of them has a reason not to come back.
  3. fr : La cible de l'équipe est 12 %. Si les rencontres en plus ne touchaient que les nouveaux acheteurs — l'hypothèse du moteur —, les 600 nouveaux acheteurs du mois deviendraient 800 (600 × 12 ÷ 9), 200 de plus, soit environ 470 € de revenu net par mois à 2,34 € par acheteur.
     en : The team's target is 12%. If the extra matches reached new buyers only — the engine's assumption — the month's 600 new buyers would become 800 (600 × 12 ÷ 9), 200 more, worth about €470 of net revenue a month at €2.34 per buyer.
  4. fr : Découpé par catégorie, le même 9 % peut cacher un marché liquide et un marché vide : une catégorie où beaucoup de recherches aboutissent à côté d'une autre où presque aucune n'aboutit. Le remède n'est pas le même dans les deux.
     en : Split by category, the same 9% can hide a liquid market and an empty one: a category where many searches end in an order beside one where almost none do. The fix is not the same in both.
- `takeaway` :
  - fr : La liquidité se lit par segment et sur une définition fixe de la demande. Un taux global dit comment va la place de marché en moyenne ; un taux découpé dit où elle déçoit, et de quel côté manque l'offre.
  - en : Liquidity is read per segment and over a fixed definition of a request. A blended rate says how the marketplace does on average; a split rate says where it lets buyers down, and where supply is missing.

#### `benchmark`

1. fr : Aucun taux de service ne voyage d'une place de marché à l'autre : une recherche, une demande de réservation et une demande de devis ne sont pas le même geste, et la définition d'une demande dépend de chaque place de marché (a16z, « The marketplace glossary »). Un chiffre sans sa définition ne dit rien.
   en : No fill rate travels between marketplaces: a search, a booking request and a quote request are not the same act, and the definition of a request depends on each marketplace (a16z, "The marketplace glossary"). A figure without its definition says nothing.
2. fr : Lenny's Newsletter tient la part des sessions avec une intention qui convertissent pour la mesure ultime de la santé d'une place de marché. Son usage est de comparer la place de marché à elle-même, segment par segment et mois après mois, à définition constante.
   en : Lenny's Newsletter calls the share of sessions with intent that convert the ultimate measure of a marketplace's health. Its use is in comparing the marketplace with itself, segment by segment and month after month, with the definition held constant.
3. fr : La liquidité suit la densité plus que la taille : une place de marché avec moins de vendeurs concentrés dans une ville peut mieux servir ses acheteurs qu'une plus grande éparpillée. Lis le taux là où les acheteurs cherchent vraiment, pas sur tout le marché.
   en : Liquidity follows density more than size: a marketplace with fewer sellers concentrated in one city can serve its buyers better than a larger one spread thin. Read the rate where buyers actually search, not over the whole market.

#### `howToImprove`

1. fr : Commence étroit. Concentre l'offre sur une ville, une catégorie ou un usage jusqu'à ce que la plupart des demandes y trouvent preneur, puis élargis : un petit marché dense vaut mieux qu'un grand marché clairsemé.
   en : Start narrow. Concentrate supply on one city, one category or one use until most requests there find a match, then widen: a small dense market beats a large thin one.
2. fr : Lis les recherches qui ne trouvent rien. C'est la liste de ce que les acheteurs veulent et que tu n'as pas, et le cahier des charges le plus direct pour recruter des vendeurs.
   en : Read the searches that find nothing. They are the list of what buyers want and you don't have, and the most direct brief for recruiting sellers.
3. fr : Rends l'offre plus facile à trouver avant d'en ajouter. La recherche, les filtres et la vitesse à laquelle les vendeurs répondent aux demandes font souvent perdre des rencontres que le catalogue pouvait déjà servir.
   en : Make supply easier to find before adding more of it. Search, filters and how fast sellers answer requests often lose matches the catalogue could already serve.
4. fr : Garde les vendeurs actifs, pas seulement inscrits. Une annonce périmée ou un vendeur qui ne répond plus compte comme de l'offre et ne sert personne ; le churn des vendeurs actifs fait partie de la liquidité.
   en : Keep sellers active, not just listed. An out-of-date listing or a seller who no longer answers counts as supply and serves nobody; the churn of active sellers is part of liquidity.

#### `inTheTour`

- `questionId` : `act-2`
- `body` :
  - fr : Le Tour demande si tu sais quelle part de tes utilisateurs atteint son moment « aha » — 20 points si c'est suivi précisément, 7 pour une intuition approximative, 0 sans aucune visibilité. Sur une place de marché, le premier moment de valeur d'un acheteur est une demande qui trouve ce qu'il était venu chercher : le taux de service est cette part, mesurée sur chaque recherche plutôt qu'une fois par utilisateur. Une équipe qui le suit par segment sait où ses acheteurs sont déçus ; une équipe qui ne le suit pas l'apprend par les acheteurs qui ne reviennent plus.
  - en : The Tour asks whether you know what share of your users reach their "aha" moment — 20 points if it is tracked precisely, 7 for a rough sense of it, 0 for no visibility. On a marketplace, a buyer's first moment of value is a request that finds what they came for: the fill rate is that share, measured on every search rather than once per user. A team that tracks it per segment knows where its buyers are let down; a team that doesn't learns it from the buyers who stopped coming back.

#### `faq`

1. Q fr « C'est quoi la liquidité d'une place de marché ? » / en "What is marketplace liquidity?"
   - fr : La probabilité qu'une demande d'un côté trouve preneur de l'autre dans un délai raisonnable : l'acheteur trouve ce qu'il veut, le vendeur vend. Elle se mesure par le taux de service, la part des demandes qui aboutissent à une transaction.
   - en : The likelihood that a request on one side finds a match on the other within a reasonable time: the buyer finds what they want, the seller sells. It is measured by the fill rate, the share of requests that end in a transaction.
2. Q fr « Comment mesurer la liquidité ? » / en "How do you measure liquidity?"
   - fr : Choisis une sorte de demande — recherches, demandes de réservation ou de devis — et compte la part qui aboutit à une transaction dans un délai écrit. 2 340 commandes sur 26 000 recherches, c'est un taux de service de 9 %.
   - en : Pick one kind of request — searches, booking requests or quote requests — and count the share that ends in a transaction within a written window. 2,340 orders from 26,000 searches is a 9% fill rate.
3. Q fr « Quelle différence entre le taux de service et le taux de conversion ? » / en "What is the difference between fill rate and conversion rate?"
   - fr : Un taux de conversion compte les visiteurs qui achètent ; le taux de service, les demandes qui trouvent une offre. Un visiteur qui cherche trois fois sans rien trouver fait baisser le taux de service trois fois, et le taux de conversion une seule.
   - en : A conversion rate counts visitors who buy; the fill rate counts requests that find supply. A visitor who searches three times and finds nothing lowers the fill rate three times, and the conversion rate once.
4. Q fr « Pourquoi ma place de marché est-elle liquide dans une ville et pas dans une autre ? » / en "Why is my marketplace liquid in one city and not in another?"
   - fr : Parce que la liquidité dépend de la densité, pas de la taille : acheteurs et vendeurs doivent être assez proches, par le lieu ou la catégorie, pour se rencontrer. Mesure le taux de service par segment, et remplis les segments vides un à un.
   - en : Because liquidity depends on density, not size: buyers and sellers have to be close enough, in place or in category, to meet. Measure the fill rate per segment, and fill the empty segments one at a time.
