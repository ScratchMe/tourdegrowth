# ENGINE.md, partie 4 — l'argent du moteur (§20)

*Écrite le 2026-10-03, directement dans `docs/engine/` : le numéro de section
suit le §19, et un renvoi « `ENGINE.md` §20.4 » se lit ici. C'est la
spécification du lot A20 (`CHANTIERS.md`), « le moteur à la hauteur de son
film ». Les décisions du moteur restent dans [`ENGINE.md`](../../ENGINE.md) ;
la v1 libre-service est dans [`v1.md`](v1.md), le B2B assisté et l'hybride
dans [`assiste-et-hybride.md`](assiste-et-hybride.md), le moteur complet dans
[`moteur-complet.md`](moteur-complet.md).*

---

## 20. L'argent du moteur — spécification A20, le 2026-10-03

*Écrite contre le code de `main` (`db7fc72`), pas contre les documents. **Le
modèle de §20.1 à §20.7 est codé** (A20.a, `lib/engine/money.ts`,
`scenario.ts`, `slg-scenario.ts`, `total.ts`, sans écran). **Antoine a tranché
C45 à C55 le 2026-10-03** (§20.13), sur le retour du brief 09
([`design/ds-extension-09-return/`](../../design/ds-extension-09-return/README.md)) :
l'alerte de §20.8 et le constat de perte dans `findings()` sont codés (A20.d
T1), les écrans se portent étape par étape. Aucune copie n'est écrite ici : les
phrases citées sont des exemples de sens, la copie neuve naît au portage, « à
relire » (convention 6).*

*Vérifié pour ce jet : `scenario.ts` (`twelveMonths`, `newPayers`, `kpis`,
les facteurs des leviers), `slg-scenario.ts` (`baseFactor`,
`twelveMonthsOfNew`, `kpis`), `unit-economics.ts` (`lifetimeMonths`,
`slgLifetimeMonths`, `unitEconomics`), `findings.ts`, `total.ts`,
`catalog-shape.ts` (`LTV_CAP_MONTHS`, les repères de `rev.cac-payback`),
`example.ts`, `deck.ts` (l'ordre, `pelotonTitle`), `golden-v1.test.ts` et
`golden-v2.test.ts` (leurs entrées figées), et côté îlot `Board.tsx`,
`BoardLever.tsx`, `WhatIfPanel.tsx`, `scenario-view.ts`, `TotalBand.tsx`,
`SlideWhatIf.tsx`, `SlideScenario.tsx`, `SlideUnitEconomics.tsx` ; la fiche
`cac-payback` de `glossary-deep.ts` ; `marketing/motion/` (la source du film
et ses chiffres d'exemple).*

---

### 20.0 En une page

Le film « Le moteur » (44 s, `marketing/motion/`) montre l'argent : un MRR qui
monte, un client qui coûte 1 900 € et rapporte 1 500 € de marge, « Et si ? »
qui fait passer le MRR dans 12 mois de 80 212 € à 122 402 € et l'ARR de 963 k€
à 1 469 k€, trois slides pour un board ou un investisseur. Le moteur calculait
déjà presque tout (le MRR dans 12 mois, le LTV, le payback, l'effet composé),
mais il n'en montrait qu'une partie, et pas l'ARR, ni la courbe, ni la perte,
ni la trésorerie.

A20 ajoute, **par motion** et dans « Et si » (aujourd'hui, puis avec les
leviers) :

| Ajout | Formule | § |
|---|---|---|
| L'ARR | MRR × 12, aujourd'hui et dans 12 mois | 20.1 |
| La courbe du MRR | 13 points, de la même boucle que le MRR dans 12 mois, qui en est le dernier point | 20.2 |
| Le LTV:CAC dans « Et si » | LTV ÷ CAC, aujourd'hui et projeté | 20.3 |
| Le constat de perte | LTV entièrement sous le CAC ; « peut-être » quand ils se chevauchent | 20.4 |
| Le payback face à la durée de vie | durée de vie comptée − payback | 20.5 |
| La trésorerie immobilisée | dépense d'un mois d'acquisition × payback ÷ 2 | 20.6 |
| Les sommes de l'hybride | l'ARR et la courbe, additionnés, les deux parts ou rien | 20.7 |
| L'alerte de payback long | le payback au-delà du runway saisi, sinon de 30 mois ou plus (C49) | 20.8 |

**Ce qui ne bouge pas, et vaut pour chaque ajout :**

- **Aucun repère ne désigne** (C1). Rien ici ne se compare à un repère
  publié pour nommer quoi que ce soit, et rien ne nomme une étape : le constat
  de perte est de l'arithmétique sur les chiffres de l'équipe.
- **Un chiffre incalculable n'est jamais 0** : il vaut `null` dans le modèle,
  « ? » à l'écran, et la vue dit ce qui manque.
- **Jamais sur le revenu.** Sans marge brute, pas de LTV, pas de payback, donc
  ni LTV:CAC, ni constat de perte, ni trésorerie (§5.7, §18.5.6). Jamais non
  plus la marge d'une motion pour l'autre (C25 Q4).
- **Des intervalles partout** (§6.1) : chaque borne d'un résultat vient des
  bornes des entrées qui la poussent dans le même sens.
- **Une projection n'est jamais rouge** (audit S-5). Le rouge reste à la
  fuite, et le constat de perte ne prend pas celui de « Freine ici » : il ne
  nomme aucune étape (§20.4, et le brief 09).
- **Les goldens v1 et v2 tiennent** au caractère près : les champs ajoutés
  sont retirés de leur projection (`golden-projection.ts#asBeforeA20`), et le
  MRR dans 12 mois est identique au bit (§20.2).

---

### 20.1 L'ARR

- **Formule** : `ARR = MRR × 12`. `arr` vient du MRR du mois lu (`mrrToday`,
  ou `slgMrrToday`) ; `arr12` du MRR dans 12 mois (`mrr12`).
- **Intervalles** : `scale(mrr, 12)`, les deux bornes × 12.
- **Incalculable** : quand le MRR l'est (ni MRR saisi, ni ARPA × clients), ou
  quand le MRR dans 12 mois l'est (§20.2).
- **Hypothèse imprimée** : « l'ARR est le MRR × 12 : un an de revenu récurrent
  au rythme de ce mois, pas un chiffre d'affaires ». C'est la définition de
  la fiche du glossaire (`glossary-deep.ts`, « MRR, ARR et chiffre
  d'affaires »).
- **Dans « Et si »** : l'ARR d'aujourd'hui ne bouge jamais (le MRR du mois lu
  est un fait) ; `arr12` bouge comme le MRR dans 12 mois.
- **En hybride** : `timesTwelve(row)` (`total.ts`) fait l'ARR de chaque ligne
  du total (`mrr`, `mrrIn12Months`). Une part connue garde sa confiance, une
  part manquante reste manquante, et le total n'existe que si les deux parts
  existent (S9). `formatSum` l'imprime par la règle de §18.6.2.

### 20.2 Le MRR mois par mois

**Libre-service.** La boucle de `twelveMonths`, qui donnait le seul MRR dans
12 mois, rend maintenant ses treize points :

```
M₀ = MRR du mois
Mₘ = Mₘ₋₁ × NRR + nouveau MRR        (m = 1 … 12)
MRR dans 12 mois = M₁₂
```

- **Une seule source** : `mrr12` est `mrrPath[12]`, calculé par les mêmes
  opérations qu'avant. Le MRR dans 12 mois du panneau, de la carte du levier,
  des slides et du total est donc le dernier point de la courbe, au bit près.
- **Intervalles** : la courbe basse vient de (MRR bas, nouveau MRR bas, NRR
  basse), la haute des bornes hautes. La fonction est croissante en chaque
  entrée, donc chaque point est un intervalle honnête.
- **Incalculable** : sans MRR, sans nouveau MRR ou sans churn, comme le MRR
  dans 12 mois aujourd'hui. Une rétrogradation ou une expansion non saisie
  compte 0, et c'est déjà dit (`contraction-unknown`, `expansion-unknown`).
- **Hypothèses imprimées** : celles du MRR dans 12 mois (`twelve-months` :
  ni saisonnalité, ni saturation), rien de plus.

**Assisté.** Le MRR dans 12 mois assisté est `MRR × f + 12 mois de nouveau
MRR`, où `f` est la NRR sur 12 mois (ou le renouvellement, en logos pour du
revenu) et le nouveau MRR celui des contrats du trimestre (§18.5.5). Pour les
points intermédiaires, une hypothèse de forme, **imprimée sous la courbe** :

| Contrats | La base au mois *m* | Le nouveau MRR au mois *m* |
|---|---|---|
| annuels, ou durée inconnue | `MRR × (1 − m/12) + MRR × f × (m/12)` : les renouvellements tombent également répartis sur l'année, la base va en ligne droite de `MRR` à `MRR × f` | `m × nouveau MRR` : aucun contrat neuf n'arrive à échéance dans l'année |
| mensuels | `MRR × f^(m/12)` : ils se renouvellent mois après mois | `nouveau MRR × (1 − qᵐ) ÷ (1 − q)`, `q` le renouvellement mensuel |

- **Une seule source** là aussi : `mrr12` est `slgMrrPath[12]`. La ligne
  droite s'écrit `MRR × (1 − m/12) + MRR × f × (m/12)` et non
  `MRR × (1 + (f − 1) × m/12)` : au douzième point, la première donne
  `MRR × f` par les opérations d'avant. (Sur les NRR de l'exemple, 1,04 et
  1,08, les deux formes donnent le même nombre ; la première le garantit pour
  toutes.)
- **Hypothèse imprimée, neuve** : « les contrats annuels arrivent à échéance
  également répartis sur l'année ». Elle ne change aucun chiffre déjà imprimé
  (ni le MRR dans 12 mois, ni le nouveau MRR) : elle ne décrit que la forme de
  la courbe entre aujourd'hui et le douzième mois.

**En hybride** : `sumPaths(plg, slg)` additionne les deux courbes point par
point, ou rend `null` si l'une manque (S9). C'est une somme : jamais deux
courbes en face-à-face (§18.6.4), même si l'écran les dessine empilées.

### 20.3 Le LTV:CAC dans « Et si »

- **Formule** : `LTV ÷ CAC`, avec le LTV et le CAC de la même colonne
  (aujourd'hui, ou avec les « Et si »).
- **Intervalles** : `div(ltv, cac)`.
- **Incalculable** : sans LTV (donc sans marge, §20.0) ou sans CAC, ou quand
  le CAC contient 0.
- **Aujourd'hui**, c'est le chiffre de la slide d'unit economics
  (`unitEconomics().ltvCac`), au bit près (test).
- **Ce qui le bouge** (§20.9) : l'ARPA et le churn par le LTV, les leviers du
  funnel par le CAC à dépense égale. La rétrogradation et l'expansion ne le
  bougent pas : le LTV n'en tient pas compte, et c'est déjà la règle de §5.7.
- **Repère** : « autour de 3:1 », en contexte seulement, tel que le catalogue
  l'imprime déjà (`rev.ltv-cac`) ; il ne déclenche rien (C1).

### 20.4 Le constat de perte

- **Ce qu'il dit** : un nouveau client coûte plus que la marge qu'il rapporte
  sur sa durée de vie comptée. Le film le dit « −400 € par nouveau client ».
- **Règle** (`money.ts#lossCheck`), sur le LTV et le CAC d'une motion :

| Verdict | Condition | Ce que l'écran dirait |
|---|---|---|
| `loss` | `LTV.hi < CAC.lo` : toute lecture du LTV sous toute lecture du CAC | le constat, affirmé |
| `maybe` | les fourchettes se chevauchent, et la perte est possible | le constat, au conditionnel (« peut-être ») |
| `none` | `LTV.lo ≥ CAC.hi` : le LTV couvre le CAC, l'équilibre compris | rien |
| `null` | le LTV ou le CAC est inconnu | rien (le constat `unit-econ-uncomputable` existant parle déjà d'une entrée introuvable) |

- **L'écart** : `gap = LTV − CAC` (`sub`), « par nouveau client ». Négatif
  dans une perte.
- **Ce n'est pas un repère** (C1) : aucune référence publiée n'entre dans la
  règle, et le verdict ne porte ni chiffre du catalogue ni comparateur, donc
  il ne désigne aucune étape (test : ses seules clés sont `verdict` et `gap`).
- **Par motion, jamais additionné** : en hybride, deux constats, chacun sur sa
  motion, jamais comparés (§18.6.4). Il n'y a pas de LTV « mixte ».
- **Dans « Et si »** : le constat projeté dit si les leviers sortent le client
  de la perte (dans l'exemple du film : `loss` aujourd'hui, `none` avec les
  trois leviers).
- **Dans `findings()` depuis A20.d T1** (C48) : `unit-econ-loss`, rang 1
  (aussi grave qu'un maillon introuvable), quand la perte est certaine ;
  `unit-econ-loss-maybe`, rang 2, au conditionnel. Sur le LTV et le CAC
  d'aujourd'hui de chaque motion, jamais additionnés. Ses valeurs : le CAC tel
  que saisi (à l'unité, ou sa fourchette), le LTV et l'écart en estimations
  (« ~1 500 € »). Sa phrase (`findings.unitEconLoss`, « à relire ») dit
  l'argent une fois, sans cause : « Chaque nouveau client coûte 1 900 € et
  rapporte ~1 500 € de marge : tu perds ~400 € sur chacun. » Le tableau la
  montre dans son bloc d'argent, avec une étiquette à l'encre « Perte », jamais
  rouge ; certaine, elle titre la slide d'unit economics, qui monte en nº 2.

### 20.5 Le payback face à la durée de vie d'un client

- **La durée de vie comptée** (`lifetime`) : celle du LTV, `min(1 ÷ churn, 36)`
  en libre-service (`lifetimeMonths`), `min(12 ÷ (1 − r), 36)` ou
  `min(1 ÷ (1 − r), 36)` en assisté (`slgLifetimeMonths`). Le plafond de
  36 mois est compris : c'est celui du LTV, « on prend le bas » de trois à cinq
  ans.
- **Le fait** : `afterPayback = lifetime − payback` (`sub`), en mois. Positif,
  ce sont les mois de marge qui restent une fois le CAC remboursé (la fiche
  `cac-payback` le calcule ainsi : « il reste à peu près 20 mois de marge
  après le remboursement ») ; négatif, le client part avant d'avoir remboursé.
- **Incalculable** : sans payback (donc sans marge ou sans CAC) ou sans churn
  (ou renouvellement).
- **C'est le constat de perte, lu en temps.** Avec le même plafond, `LTV =
  marge mensuelle × durée de vie` et `payback = CAC ÷ marge mensuelle`, donc
  `loss ⟺ afterPayback.hi < 0` et `none ⟺ afterPayback.lo > 0`, hors
  frontière exacte. Un test le vérifie sur 2 000 cas tirés au hasard (graine
  fixe), les trois verdicts rencontrés. La fiche du glossaire dit la même
  chose : « un payback plus long que la durée de vie moyenne d'un client n'est
  pas une entreprise lente, c'est une entreprise qui perd de l'argent à chaque
  vente ». **L'écran ne dit donc jamais les deux comme deux nouvelles** : la
  perte est un constat, les mois après le remboursement sont son chiffre.
- **Hypothèse imprimée** : « la durée de vie est 1 ÷ churn, plafonnée à 36 mois,
  comme le LTV ».

### 20.6 La trésorerie qu'un mois d'acquisition immobilise

- **La dépense d'un mois** (`spend`) : les nouveaux clients du mois × le CAC.
  En libre-service, les nouveaux payants de `newPayers` (le dénominateur
  mesuré du CAC, sinon inscrits du mois × conversion payante) ; en assisté,
  le tiers des contrats du trimestre (`W ÷ 3`). Quand le CAC est saisi en
  comptes, c'est exactement la dépense saisie.
- **Le fait** (`tiedUp`) : `dépense × payback ÷ 2`. Chaque mois de dépense
  revient en *P* mois, à parts égales ; une cohorte doit encore
  `S × (1 − t ÷ P)` au bout de *t* mois. Au rythme d'une cohorte par mois, ce
  qui reste dehors est la somme sur les cohortes qui remboursent encore :
  `∫₀ᴾ S × (1 − t ÷ P) dt = S × P ÷ 2`. C'est le besoin de trésorerie de la
  croissance à ce rythme.
- **Intervalles** : `scale(mul(spend, payback), 1/2)`. La dépense et le
  payback partagent le CAC ; comme tout est positif et croissant en lui, les
  coins choisis par `mul` sont les bons (aucune borne n'est comptée deux fois
  dans des sens opposés).
- **Incalculable** : sans payback, ou sans nouveaux clients du mois, ou sans
  CAC.
- **Dans « Et si », à dépense égale** : la dépense est celle d'aujourd'hui,
  quels que soient les leviers (c'est l'hypothèse `same-spend` qui fait déjà
  baisser le CAC). Recalculée depuis les payants projetés × le CAC projeté,
  elle s'élargirait par l'arithmétique des intervalles sans que rien n'ait
  bougé (le test « la dépense ne bouge jamais » le verrait). Seul le payback
  bouge, donc la trésorerie immobilisée bouge avec lui.
- **Hypothèses imprimées** (`CashAssumption`, ordre fixe) :
  1. `cash-linear` : la marge mensuelle d'un client rembourse son CAC à parts
     égales ;
  2. `cash-steady-pace` : au rythme de ce mois, une fois qu'il a duré le temps
     du payback ;
  3. `cash-losses-not-counted` : les départs et la rétrogradation, qui
     allongent le retour, ne sont pas comptés : **c'est un plancher** ;
     *ou* `cash-expansion-outpaces`, quand l'expansion peut dépasser les
     départs (NRR au-dessus de 100 % : mensuelle saisie en libre-service, sur
     12 mois en assisté) : elle raccourcit le retour, et le chiffre n'est plus
     un plancher (`floor: false`) ;
  4. `cash-billed-monthly` : payé au mois ; une année payée d'avance revient
     plus vite (la FAQ de `cac-payback`). L'hypothèse pèse surtout en assisté,
     où les contrats annuels sont souvent encaissés d'avance.
- **Quand le client part avant d'avoir remboursé** (`loss`), cette trésorerie
  ne revient pas entièrement : c'est le constat de perte qui parle, et l'écran
  ne présente pas le chiffre comme une avance qui reviendra.
- **Ce n'est pas l'alerte** : c'est un fait, toujours calculable sans repère.
  L'alerte (§20.8) le lirait.

### 20.7 L'hybride : des sommes, les deux parts ou rien

| Chiffre | Total | Fonction |
|---|---|---|
| ARR, aujourd'hui et dans 12 mois | somme des deux parts, par `timesTwelve` sur les lignes du total | `total.ts` |
| La courbe du MRR | somme point par point | `sumPaths` |
| La trésorerie immobilisée | somme des deux, si les deux existent | `addBoth` |
| LTV, LTV:CAC, payback, durée de vie, constat de perte | **aucun total** : chaque motion a les siens. Un payback mixte est une moyenne sur des canaux qui diffèrent d'un facteur cinq (`cac-payback`, « par canal, pas en mixte ») | — |

### 20.8 L'alerte de payback long — tranchée (C49) et codée (A20.d T1)

**Ce qu'elle dirait** : « on gagne de l'argent, mais tard ». C'est un
**avertissement, pas une alarme** : elle ne prend pas le rouge de la fuite, et
elle se distingue du constat de perte (on perd de l'argent à chaque client).
Elle ne désigne aucune étape.

**Son déclencheur était C49**, trois options, tranchée le 2026-10-03 (plus bas) :

1. **La trésorerie de l'équipe, en mois** (saisie facultative) : l'alerte
   quand le payback la dépasse, « peut-être » quand les fourchettes se
   chevauchent, rien sans saisie. C'est la comparaison que la fiche du
   glossaire appelle décisive (« celle avec ta trésorerie, pas avec une
   référence »). Coût : un champ facultatif de plus dans l'état (le mois lu,
   ou les réglages), sa validation, sa place dans le fichier ; rien ne sort
   du navigateur.
2. **Une cible de payback de l'équipe**, sur le modèle des autres cibles.
   Elle est neuve : les cibles ne portent aujourd'hui que sur les chiffres
   saisis (`Snapshot.targets`, des `MetricId`), et le payback est calculé.
   Elle ne nommerait aucune étape (le payback n'est pas candidat au
   diagnostic).
3. **Les repères du glossaire** : moins de 12 mois pour un SaaS vendu aux
   petites entreprises, 18 à 24 mois en vente entreprise. Ils situent sans
   désigner (C1) : ils peuvent s'imprimer en contexte (la slide d'unit
   economics le fait déjà avec sa graduation de 12 mois), mais une alerte
   déclenchée par eux serait un repère qui juge, ce que C1 a retiré.

**La règle tranchée** (Antoine, 2026-10-03) : l'option 1, plus un plancher.

- **Le runway saisi** (`setup.runwayMonths`, facultatif, en mois, de 0 exclu à
  240) : l'alerte quand le payback le dépasse (strictement : un payback égal au
  runway n'alerte pas), « peut-être » quand la fourchette du payback le
  chevauche. Une seule trésorerie par entreprise : les deux motions d'un
  hybride se comparent au même runway.
- **Sans runway saisi, un plancher** : un CAC payback de **30 mois ou plus**
  (deux ans et demi) alerte (30 compris), « peut-être » quand la fourchette
  chevauche 30. C'est une règle du produit, pas un repère publié : ceux-là
  sont 12 et 18-24 mois (C1 tient). `money.ts#PAYBACK_FLOOR_MONTHS`.
- **Jamais avec la perte certaine** : un client qui part avant d'avoir
  remboursé, c'est la perte, pas un retour tardif. Une perte seulement
  possible laisse l'alerte parler.
- **Le mot** : « runway » à l'écran, expliqué par un « ? » qui dit « tes mois
  de trésorerie » (le terme du moteur, `EngineTerm`).

**Codée en A20.d T1** : `paybackLimit(runwayMonths)` puis
`paybackWarning(payback, loss, limit) → { verdict: "long" | "maybe", limit } | null`,
par motion, aujourd'hui et projetée (`MoneyKpis.warning`), avec sa
non-vacuité (`money.test.ts`). Sa phrase, à l'écran en T5, dit les deux faits
de §20.5 et §20.6, jamais une cause.

### 20.9 Ce qui bouge avec quel levier

Vérifié dans `scenario.ts` et `slg-scenario.ts`, et tenu par des tests
(`money.test.ts`, « which levers move the payback and the cash »).

**Libre-service :**

| Levier | MRR dans 12 mois, courbe, ARR dans 12 mois | CAC | LTV | LTV:CAC, perte | Payback | Durée de vie, mois après | Trésorerie |
|---|---|---|---|---|---|---|---|
| Inscription, parrainage, activation, J30, conversion payante | oui | baisse (dépense égale) | non | oui | baisse | mois après : oui | baisse |
| ARPA des nouveaux clients | oui | non | oui | oui | baisse | mois après : oui | baisse |
| Churn | oui | non | oui (durée de vie) | oui | **non** | oui | **non** |
| Rétrogradation, expansion | oui | non | non | non | non | non | non (l'expansion peut lever le plancher) |

**Assisté :**

| Levier | MRR dans 12 mois, courbe | CAC | LTV | Payback | Durée de vie | Trésorerie |
|---|---|---|---|---|---|---|
| Lead → opportunité, closing, part recommandée, liaison | oui | baisse | non | baisse | non | baisse |
| ACV des nouveaux contrats | oui | non | oui | baisse | non | baisse |
| Renouvellement | oui (la base) | non | oui (durée de vie, plafonnée) | non | oui | non |

**Jamais** : le MRR et l'ARR d'aujourd'hui, la dépense d'un mois
d'acquisition.

### 20.10 L'exemple chiffré

**Le SaaS du film** (`marketing/motion/README.md`) : MRR 48 000 €, ARPA
120 €, marge 75 %, churn 6 %, rétrogradation 1 %, expansion 2 % par mois,
820 inscrits par mois, 6 % qui paient, activation 18 %, CAC 1 900 €. Ses
chiffres sont tenus par `money.test.ts`, de sorte que le film ne montre que
ce que le moteur calcule :

| | Aujourd'hui | Churn 4 %, expansion 3 %, activation 24 % |
|---|---|---|
| LTV (plafonnée à 36 mois) | 1 500 € | 2 250 € |
| CAC | 1 900 € | 1 425 € (dépense égale) |
| LTV:CAC | 0,79 | 1,58 |
| Constat | perte, −400 € par nouveau client | aucun, +825 € |
| CAC payback | 21 mois | 16 mois |
| Durée de vie comptée | ~17 mois | 25 mois |
| Mois de marge après le remboursement | −4,4 (part avant) | +9,2 |
| Dépense d'un mois d'acquisition | 93 480 € | 93 480 € |
| Trésorerie immobilisée (plancher) | ~987 000 €, qui ne revient pas entièrement | ~740 000 € |
| MRR dans 12 mois | 80 212 € | 122 402 € |
| ARR dans 12 mois | 963 k€ | 1 469 k€ |

Le film imprime des montants projetés à l'euro (80 212 €) et calcule ses
écarts sur ces montants arrondis (13 344 € = 93 556 − 80 212). Le moteur
imprime une projection à deux chiffres significatifs (§6.2, « ~80 000 € ») :
**c'est le film qui se remet d'accord**, au prompt F, comme pour le rouge.

**L'exemple de l'assisté** (§18.9, avec une marge assistée de 75 %) : payback
~13 mois, durée de vie 36 mois (88 % de renouvellement annuel, plafonnée),
LTV:CAC ~2,8, aucun constat ; un mois d'acquisition coûte 114 000 € (six
contrats à 19 000 €), la trésorerie immobilisée est ~722 000 € et **n'est pas
un plancher** (NRR estimée à 104-108 %).

**L'exemple intégré** (§6.0) a une marge depuis C50 (A20.d T6) : estimée,
70 à 80 % (« ancien chiffre »), donc tout son argent en fourchettes. Durée de
vie 40 mois (churn 2,5 %), plafonnée à 36 ; LTV ~3 000 à 3 500 € ; payback 5
à 6 mois ; LTV:CAC 6 à 6,9 ; ~30 à 31 mois de marge après le remboursement ;
trésorerie immobilisée ~55 000 à 63 000 €, un plancher (NRR 100 %) ; ni
constat, ni alerte. Avant, il n'en avait pas : ni LTV, ni payback, donc ni
constat, ni trésorerie. Ce que fait le moteur sans marge se teste maintenant
sur `noMarginState()` et `hybridNoMarginState()` (`__tests__/fixtures.ts`),
l'exemple tel qu'il était.

### 20.11 Tests et non-vacuité

`src/lib/engine/__tests__/money.test.ts`, trente tests : le SaaS du film de
bout en bout, l'ARR, la courbe (13 points, le dernier égal au MRR dans
12 mois), le LTV:CAC égal à celui de la slide, le constat (les trois verdicts,
l'équilibre, l'entrée manquante), l'équivalence perte ⟺ payback au-delà de la
durée de vie sur 2 000 cas, la trésorerie (formule, plancher, leviers), la
courbe assistée (ligne droite, contrats mensuels), les sommes de l'hybride.
`golden-v2.test.ts` vérifie que la projection retire exactement les champs
ajoutés (neuf par côté depuis l'alerte) et que le MRR dans 12 mois gardé est le dernier point
de la courbe.

Non-vacuité mesurée le 2026-10-03, chaque sabotage prouvé appliqué :

| Sabotage | Ce qui rougit |
|---|---|
| La dépense recalculée depuis les payants et le CAC projetés | « la dépense ne bouge jamais » |
| `LTV.hi ≤ CAC.lo` pour une perte | « l'équilibre n'est pas une perte » |
| La trésorerie sans « ÷ 2 » | trois tests (le film, la formule, l'assisté) |
| La base annuelle assistée en géométrique | « à mi-année, la moitié de la NRR » |
| La ligne droite écrite `MRR × (1 + (f − 1) × m/12)` | **rien** : une assurance, écrite en tête du test (`TESTING.md` §1.2) |

### 20.12 Découpage

Le détail, avec qui fait quoi, est dans `CHANTIERS.md`, A20 :

- **A20.a**, le modèle pur : **livré** avec cette spécification.
- **A20.b**, le brief 09 : écrit, déposé, lancé et revenu le 2026-10-03
  (`CHANTIERS.md` B14).
- **A20.c**, les décisions : C46 à C55, **tranchées le 2026-10-03** (§20.13).
- **A20.d**, le portage, une PR par étape, `ENGINE_ENABLED` fermé : T1 (le
  constat de perte, l'alerte et le runway dans l'état) est le premier.
- **A20.e**, le bon à tirer de la copie neuve ; **A20.f**, la re-synchro ;
  **A20.g**, le film remis d'accord.

### 20.13 Les décisions du 2026-10-03 (C45 à C55)

Posées dans `CHANTIERS.md`, section C, le retour du brief 09 sous les yeux,
et **toutes tranchées sur la reco** par Antoine le 2026-10-03, avec deux
précisions à C49. L'index est dans [`docs/decisions.md`](../decisions.md).

| # | La question | La réponse |
|---|---|---|
| C46 | L'ouverture du moteur attend-elle A20 ? | **Oui** : elle attend le portage (A20.d) et son bon à tirer (A20.e), pas la re-synchro ni le film remis d'accord, qui suivent de quelques jours |
| C47 | Où l'ARR s'affiche-t-il ? | À côté du MRR, en second (« ARR, le MRR × 12 ») dans le bloc d'argent ; l'ARR dans 12 mois dans la carte « Et si » et les slides ; en hybride, le total seul |
| C48 | Le constat de perte | Une étiquette à l'encre « Perte » (« Perte possible » en pointillé au conditionnel), jamais rouge ; rang 1 certain, rang 2 au conditionnel ; certain, il titre la slide d'unit economics, qui monte en nº 2 ; la première slide reste le funnel |
| C49 | Le déclencheur de l'alerte | **Le runway de l'équipe**, champ facultatif des Réglages ; **le mot « runway »**, avec un « ? » qui dit « tes mois de trésorerie » ; **sans runway saisi, un payback de 30 mois ou plus alerte** (§20.8) |
| C50 | Une marge pour l'exemple intégré | **Estimée, 70 à 80 %** : l'argent en fourchettes, l'exemple sain (payback de 5 à 6 mois, LTV:CAC de 6 à 7, ni perte ni alerte) |
| C51 | « Et si » déplié par défaut ? | **Non** : le panneau reste plié, la carte porte la courbe du MRR, le MRR et l'ARR dans 12 mois |
| C52 | Board et investisseurs dans la promesse | **Oui, une fois A20 porté** : « … et ce que te rapporte chaque nouveau client, et repars avec des slides pour ton CODIR, ton board ou tes investisseurs » |
| C53 | Les chiffres des titres de slides | **À l'encre grasse dans tout le deck** ; le rouge reste au verdict et au diagnostic (d-verdict-red du nº9) |
| C54 | Le tableau réordonné | **Oui, en bloc** : le diagnostic, le bloc d'argent, la carte « Et si » remontée avant le peloton ; le LTV:CAC hors du tableau ; le panneau en trois tableaux |
| C55 | Le bon à tirer de la copie d'A20 | **Un nº10 à part** ; la carte de la promesse du nº9 y passe |
| C45 | Les films | La direction gardée, le calendrier proposé suivi, un bon à tirer à part pour leur copie (`marketing/motion/README.md`) |
