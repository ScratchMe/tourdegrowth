# Journal de Tour de Growth — 6. Le SEO, le glossaire et le poids sur Vercel

*Volume archivé : les entrées du 2026-09-14 au 2026-09-15. On y trouve les deux pages « porte ouverte », les trois lots du glossaire, les comparaisons « AARRR vs X », le bon à tirer nº5, la coupe d'`activation-rate`, Functions Storage mesuré, la déduplication du contenu, les conventions rangées par outil.*

*Le texte est celui du journal, déplacé tel quel le 2026-10-01 : rien n'y a été réécrit. Un « plus haut » ou un « voir l'entrée du… » peut donc désigner une entrée d'un autre volume. Le volume courant et la table des volumes sont dans [`JOURNAL.md`](../../JOURNAL.md), et `grep -rn "<motif>" JOURNAL.md docs/journal/` cherche partout.*

---

### Deux pages « porte ouverte » : la checklist et la méthode (2026-09-14)

Première brique de contenu de la vague 2 du plan de distribution. Deux SERP
vides avaient été trouvées en préparant le plan — « growth audit checklist /
template » en anglais, « diagnostic croissance startup gratuit » en français ;
ce sont les deux pages qui s'y logent.

**Deux écarts au plan, assumés et signalés plutôt qu'absorbés :**
1. **Chacune existe dans les DEUX langues, à un slug unique.** Le plan les
   écrivait `/en/growth-audit-checklist` et `/fr/diagnostic-croissance-startup`
   — une page par langue. Impossible ici sans mentir trois fois : le jeu
   hreflang n'aurait pas de contrepartie, le sitemap deviendrait asymétrique,
   et le sélecteur de langue pointerait dans le vide. Les deux pages sont donc
   bilingues, et chacune vise sa requête dans la langue où cette requête a du
   volume.
2. **Les slugs restent anglais dans les deux langues.** R2-16 a déjà tranché
   contre les slugs localisés (coût élevé, gain faible, et une URL publiée ne
   meurt jamais ici). Le contenu pèse de toute façon bien plus qu'un slug.

**Elles ne se redisent pas, et c'est le point.** Le plan les désignait par
deux requêtes différentes ; les livrer comme deux variantes du même texte
aurait fait deux quasi-doublons, ce qui vaut moins que rien en référencement.
L'une est l'**artefact** — les quinze points, le barème, comment se noter à la
main ; l'autre est la **méthode** — par quoi commencer, dans quel ordre
regarder, ce qu'un diagnostic doit produire. Une spec compare les `<h1>` et
les `<h2>` des deux pages et exige zéro intersection.

**La checklist EST le questionnaire**, rendue depuis `copy-library.ts` et
jamais recopiée — même discipline que `/about`. Une seconde copie dériverait,
et la page décrirait alors un questionnaire qui n'existe plus. **Le barème est
visible ici**, là où `AnswerOption` l'interdit : cette règle protège le
parcours de trois minutes (voir les points en répondant fausse les réponses),
et cette page existe précisément pour qu'on puisse se noter à la main.

**Le test dit la même chose que la page.** Ma première version de la spec
citait une question « de mémoire » — et se trompait (« a main acquisition
channel you can name and measure » au lieu de « a primary acquisition channel
that's identified and measured »). Corrigé en **lisant la bibliothèque depuis
la spec** plutôt qu'en recopiant la bonne phrase : c'est la différence entre
« la page contient cette phrase-là » et « la page rend ce que la bibliothèque
contient », et seule la seconde survit à une correction de copie.

**Le H1 français prenait six lignes sur un téléphone** — le cas que l'entrée
des pages légales annonçait (« à revoir si un titre plus long y apparaît un
jour »). Les deux pages réutilisent la feuille de `/how-it-works`, qu'il ne
faut pas bouger : l'override vit donc dans leur propre module, en sélecteur
**élément + classe** (`h1.title`, 0,1,1) et non en classe seule. La règle
qu'il doit battre vient d'un autre module CSS, donc à égalité de spécificité
le gagnant dépendrait de l'ordre d'émission des feuilles — leçon nº2, que R-21
a déjà fait payer une fois. Mesuré dans le navigateur plutôt que supposé, et
non-vacuité faite : en retirant le qualificateur d'élément, exactement cette
spec tombe.

**Maillage appliqué d'emblée** (règle 2.4) : la checklist a son lien de pied
de page — donc un chemin constant depuis n'importe quelle page de contenu —
plus un depuis `/how-it-works` et un depuis la page méthode ; la page méthode
en a deux et sort vers les cinq pages de pilier du glossaire. Une seule des
deux entre au pied de page : à sept liens, un pied de page cesse d'en mettre
aucun en avant.

**Vérifié en réel** : lint, tsc, **662 tests unitaires**, `next build` (les
quatre pages sortent en `●`, donc servies par le CDN — c'est tout l'intérêt
pour des pages qui existent pour être trouvées), **264 specs Playwright**
(+8). Captures relues en 1280 et 390 px, EN et FR, `scrollWidth ===
clientWidth` mesuré aux deux largeurs.

**Toute la copie est neuve, donc `TODO: à relire`** (convention 6) —
`content/open-door.ts`, plus cinq chaînes de chrome dans `dictionary.ts` et
une dans `nav-strings.ts`. À passer au prochain bon à tirer, avec les 39
lignes du catalogue d'audit.

### Glossaire, lot 1 : quatre termes choisis sur les vraies requêtes (2026-09-14)

Première brique de la vague 2.2 du plan de distribution, découpée en lots de
trois ou quatre comme R2-11 l'avait été — relire dix termes de prose d'un coup
n'est pas relire.

**Les termes sont choisis sur des données, pas au jugé**, ce que 2.7 existait
précisément pour rendre possible : le rapport Search Console tiré le matin même
(86 impressions, 20 requêtes) montre que ce qui atteint ces pages, ce sont des
recherches **définitionnelles courtes** — « activation », « what is an
activation », « activation definition », « définition ltv », « definition
cac ». Les quatre livrés sont donc chacun l'enfant d'une page qui reçoit déjà
des impressions : `activation-rate` (12 impressions sur la grappe
« activation »), `cac-payback`, `nrr-grr`, `cohort-analysis`. Nuance honnête
sur ce que la donnée peut et ne peut pas dire : l'absence d'impressions sur
« CAC payback » ou « cohorte » n'est pas un argument contre ces termes, le site
n'ayant aucune page pour en recevoir. Ce que la donnée établit, c'est la
**forme** des requêtes qui arrivent — d'où des FAQ écrites sur les variantes
définitionnelles plutôt que sur des questions d'expert.

**Deux écarts à la liste du plan, assumés :**
- **« expansion revenue » est retiré.** La page `upsell-cross-sell` le couvre
  déjà — 48 occurrences, et sa formule *est* l'identité du MRR. Une page dédiée
  aurait été exactement le quasi-doublon que 2.1 avait pris soin d'éviter.
  Remplacé par **ARPU** au lot 3, qui ne recoupe rien et se lie naturellement à
  `ltv`, une page que Google classe déjà (« valeur totale client », position 4).
- **« growth loop vs funnel » part en 2.3**, où vit le cluster « frameworks
  comparés » ; le laisser ici l'aurait mis en concurrence avec sa propre page.
  Remplacé par **NPS**, qui a du volume, ne recoupe rien, et permet de corriger
  une confusion utile (le NPS n'est pas une mesure de parrainage).

**Les exemples chiffrés prolongent ceux des pages parentes plutôt que
d'inventer un nouveau jeu de nombres.** Le mois partagé par `churn`, `revenue`
et `upsell-cross-sell` — 400 clients, 20 000 € de MRR, 12 résiliations, 8
rétrogradations, 15 montées en gamme — se lit ici comme un **couple de taux** :
GRR 95 %, NRR 99,5 %, puis 100,4 % une fois appliqué le playbook d'expansion de
la page upsell, **la GRR n'ayant pas bougé d'un point**. C'est toute la thèse de
la page en trois lignes, et elle n'aurait pas tenu avec des chiffres inventés.
Le CAC de 500 € vient de la page CAC. Arithmétique recalculée à la main avant
d'être écrite : 0,995¹² ≈ 94 %, 1 ÷ 0,03 ≈ 33 mois, LTV:CAC 2,6:1, 12,5 mois de
payback contre 10 sur le revenu seul.

**Un défaut trouvé en regardant la page, pas en relisant le code.** Les deux
formules de `nrr-grr` étaient jointes par un « · » — qui, dans un bloc de
formule en chasse fixe, se lit comme une **multiplication**. Le composant ne
préserve pas les retours à la ligne (`.formula` n'a pas de `white-space`), donc
plutôt que de changer le CSS de tous les termes pour un seul, la relation est
maintenant énoncée : « et GRR = la même ligne sans le terme d'expansion ». Plus
court, sans ambiguïté d'opérateur, et meilleur contenu — le lecteur n'a plus à
diffier deux chaînes presque identiques. Leçon nº1 de ce fichier, encore : le
code avait l'air correct.

**Maillage (règle 2.4)** : chaque nouveau terme reçoit 2 à 4 liens entrants de
pages existantes (mesuré : 3, 2, 3 et 4). `retention` était au plafond de 4,
donc `ltv` y cède sa place à `cohort-analysis` **plutôt que de desserrer le
test** — retention → analyse de cohortes est un lien plus serré que
retention → LTV, et LTV reste atteignable depuis `churn`, `cac` et `revenue`.

**Une assertion corrigée pour dire ce qu'elle prétend dire** :
`structured-data.spec.ts` affirmait « le set contient TOUS les termes » en
codant `15` en dur. Elle lit maintenant le glossaire — sinon chaque lot demande
une retouche d'un nombre, ce qui finit par transformer une garantie en
formalité.

**Vérifié en réel** : lint, tsc, **662 tests unitaires**, couverture au-dessus
des seuils, `next build` (38 pages de termes en `●`, donc servies par le CDN),
**264 specs Playwright**. Mesuré plutôt que supposé : **909 à 1 160 mots par
langue et par terme** (plancher 500, termes existants 770-1 140), extraits de
recherche 130-155 caractères (fenêtre 70-160), `scrollWidth === clientWidth` en
390 px et 1 280 px sur les quatre pages, et la carte « Dans le Tour » relue en
capture pour vérifier qu'elle rend bien la vraie question et ses trois réponses.

**Copie neuve, donc `TODO: à relire`** (convention 6) : les quatre entrées de
`glossary-terms.ts`, `glossary.ts` et `glossary-deep.ts`. Point à soumettre
avec : le titre FR `cac-payback` donne « CAC payback — délai de remboursement —
Glossaire Tour de Growth » dans la balise `<title>`, deux tirets longs. C'est le
même motif que `north-star-metric`, déjà validé, mais il mérite un regard.

### Glossaire, lot 2 : ce qui se mesure quand on lit un chiffre de travers (2026-09-14)

`dau-mau`, `time-to-value`, `pql`. Là où le lot 1 décrivait ce qu'un produit
**rapporte**, ces trois décrivent comment il est **utilisé** — et les trois
exemples chiffrés portent le même genre de leçon : une métrique qui a l'air
d'aller mieux pendant que le produit va moins bien.

- **DAU/MAU** : un ratio de 0,20 sur 50 000 MAU ne décrit personne. En
  découpant, 8 000 personnes ouvrent l'outil 22 jours par mois et 42 000 en
  ouvrent 3 — (8 000 × 22 + 42 000 × 3) ÷ 30 ≈ 10 000 DAU, le même 0,20, deux
  populations qui n'ont rien en commun. Et la traduction qui rend la métrique
  utilisable : **ratio × 30 = jours d'usage par mois**, ce qui suffit en général
  à trancher si le chiffre est bon, parce qu'une équipe sait à quoi sert son
  produit. C'est aussi ce qui retire toute valeur au seuil des 20 % hors du
  grand public : un outil de paie à 0,05 n'échoue pas, il sert quand la paie
  tombe.
- **Time to value** : le trimestre où la moyenne passe de 8,2 jours à 1,0 jour
  **parce que les traînards ont abandonné** — l'activation tombe de 34 % à 28 %
  au même moment. Vérifié : (200 × 0,5 + 80 × 84 + 60 × 1 000) ÷ 340 ≈ 197 h,
  puis (200 × 0,5 + 80 × 84) ÷ 280 ≈ 24 h. La médiane, elle, n'aurait pas bougé.
  D'où les deux règles de la page, qui ne coûtent rien : médiane, et taux
  d'activation publié juste à côté.
- **PQL** : deux seuils au **lift identique de 3,7×** dont un seul est une
  liste — 900 personnes à 15 % (une dizaine de contacts par jour) contre 3 200 à
  8 % (une liste de diffusion déguisée). Le lift seul les aurait notés à
  égalité ; c'est le second axe, la taille de la liste, que toutes les
  définitions oublient.

**Toute l'arithmétique a été recalculée avant d'être écrite**, pas relue après.
Une imprécision attrapée en regardant la page : la médiane de 340 valeurs n'est
pas « la 170ᵉ valeur » mais les 170ᵉ et 171ᵉ — les deux tombent dans la première
heure, donc la conclusion tenait, mais la phrase était fausse. Corrigée dans les
deux langues.

**Le maillage a coûté plus cher que sur le lot 1, et c'est instructif.** Il ne
restait que trois créneaux libres dans tout le glossaire (`aarrr`,
`viral-coefficient`, `growth-loop`) et **aucun des trois n'était un parent
sémantique** des nouveaux termes. Plutôt que de desserrer le plafond de 2-4
liens, chacun des six liens entrants **échange un lien redondant contre un lien
plus serré** : `cohort-analysis` → `dau-mau` (même leçon, autre axe),
`onboarding` et `aha-moment` → `time-to-value`, `activation-rate` et
`upsell-cross-sell` → `pql` (les « signaux » sur lesquels son playbook se
déclenche *sont* un seuil de PQL). Vérifié après coup plutôt que supposé : aucun
des 22 termes ne descend sous 2 liens entrants, et les cibles déplacées en
gardent 3 à 7. À la prochaine livraison le glossaire sera saturé — le lot 3
devra soit échanger encore, soit poser la question du plafond, et ce sera alors
une vraie décision et non un contournement.

**Vérifié en réel** : lint, tsc, **662 tests unitaires**, couverture au-dessus
des seuils, `next build`, **264 specs Playwright**. Mesuré : 999-1 141 mots par
langue et par terme, extraits de recherche 126-154 caractères,
`scrollWidth === clientWidth` en 390 px et 1 280 px. Captures relues sur
l'exemple PQL (desktop) et sur les exemples DAU/MAU et time-to-value en français
mobile, là où les calculs en ligne risquaient le plus de casser la mise en page.

**Copie neuve, donc `TODO: à relire`** — les trois entrées s'ajoutent au lot 1
dans le bon à tirer nº5.

### Glossaire, lot 3 — la vague 2.2 est complète, et un défaut de typographie française trouvé en regardant une page (2026-09-14)

`product-led-growth`, `arpu`, `nps`. Le glossaire passe de 15 à **25 termes**,
soit 50 pages indexables dans les deux langues (24 et 48 depuis la coupe
d'`activation-rate` le soir même), et la vague 2.2 du plan de
distribution est close.

**ARPU et NPS remplacent** « expansion revenue » (doublon de
`upsell-cross-sell`) et « growth loop vs funnel » (parti en 2.3) — écarts
décidés au lot 1. Les trois angles : PLG reçoit un **test mesurable** à la place
d'une revendication (part self-serve, calculée en clients *et* en revenu : 25 %
et 3 % sur le même trimestre de l'exemple) ; ARPU reçoit la confusion ARPPU
(0,80 € et 20 € le même mois, facteur 25) ; NPS reçoit le correctif qui
intéresse ce site — **ce n'est pas une mesure de parrainage**, ce que `ref-2`
mesure réellement, et deux distributions opposées donnent le même +25.

**Le vrai enseignement de ce lot n'est pas le contenu.** En regardant
`/fr/glossary/arpu` à 390 px, « 5 000 payants » se coupait en fin de ligne, le
« 5 » seul. Cause : **tout le corpus français utilisait des espaces ordinaires**
dans les groupes de chiffres et avant les « % » — 96 groupes et 169 pourcentages
dans `glossary-deep.ts` seul, tous relus et validés. Le défaut était donc latent
**partout** où un nombre tombait près d'une fin de ligne, et aucune capture d'une
page donnée ne pouvait en prouver l'absence.

- **Corrigé avec U+00A0, pas U+202F** (l'espace fine insécable que la
  typographie française préférerait) : ce dépôt a déjà livré un carré vide une
  fois, quand U+2116 s'est révélé absent d'un sous-ensemble de police OG. U+00A0
  est dans toutes les polices. Le compromis est écrit dans la spec.
- **Aucun mot n'a changé**, seulement le caractère d'espace — c'est pourquoi
  toucher de la copie déjà validée était acceptable ici. Vérifié qu'aucune
  chaîne **anglaise** n'est touchée : l'anglais écrit « 100,000 » et « 25% »,
  donc le motif ne peut pas les atteindre. Les deux occurrences restantes du
  motif sont dans des **commentaires de code** (`copy-library.ts`,
  `verdict.ts`), qui ne rendent rien.
- **La spec a trouvé un trou dans mon propre correctif.** Après restauration,
  `nrr-grr at 1280px` échouait toujours : j'avais corrigé `glossary-deep.ts` et
  oublié `glossary.ts`, où vit la copie `extended`. Sans la spec, ça partait en
  production.
- **Non-vacuité mesurée** : en remettant les espaces ordinaires, **3 des 6 specs
  tombent** — et deux d'entre elles à 1 280 px, donc ce n'était jamais un
  problème seulement mobile. Les 3 qui passent sont celles dont les pages n'ont,
  par chance, aucun nombre près d'une fin de ligne : c'est exactement la raison
  pour laquelle la spec mesure la **géométrie rendue** (plusieurs rectangles
  clients pour une même plage) plutôt que les caractères de la source. Une
  source pleine d'U+00A0 qu'une future CSS recasserait passerait un test de
  chaîne.

**Le test de longueur d'extrait a fait son travail** au passage : la définition
française d'ARPU sortait à 161 caractères pour une fenêtre de 160. Raccourcie
d'un groupe de mots redondant plutôt que contournée par un `metaDescription`.

**Maillage** : il restait trois créneaux libres après le lot 2, dont deux
utilisables (`growth-loop` → PLG, `viral-coefficient` → NPS), donc **quatre
échanges** et non six. Mon affirmation du lot 2 — « le glossaire sera saturé » —
était donc un peu forte : il reste un créneau, sur `aarrr`. Les termes ont
tous au moins 2 liens entrants, les cibles déplacées en gardent 3 à 6.

**Vérifié en réel** : lint, tsc, **662 tests unitaires**, couverture au-dessus
des seuils, `next build`, **270 specs Playwright** (+6). Mesuré : 963-1 167 mots
par langue et par terme, extraits 128-153 caractères. Le flake connu de
`locale-routing.spec.ts:75` s'est produit une fois de plus en suite complète et
repasse isolé (21/21) — **quatrième occurrence**, toujours jamais en isolation.

**Copie neuve, donc `TODO: à relire`** — les trois entrées ferment le lot des
dix termes à soumettre au bon à tirer nº5.

### « ACV », développé là où il se lit (2026-09-14, signalé par Antoine)

Question d'Antoine sur l'écran de création de mission de `/admin/audit` : « ACV,
c'est bien pour Annual Contract Value ? Tu aurais pu le préciser, l'acronyme
peut correspondre à d'autres définitions. » Il a raison — ACV désigne aussi la
valeur à neuf en assurance, et rien dans l'outil ne disait laquelle.

**Balayage avant correctif, plutôt qu'un patch d'une ligne** : la liste de tous
les libellés de `Field` de la route (49 au total) confirme que « Tranche d'ACV »
est **le seul** libellé réduit à un acronyme — les autres sont en toutes lettres
ou portent leur symbole entre parenthèses (« Population (N) », « Taille de
l'échantillon (n) »). C'était donc bien un cas isolé, et le savoir vaut mieux
que le supposer.

Développé à trois endroits, chacun pour un lecteur différent : l'indice du champ
(pour Antoine à la saisie), un docblock sur `ACV_BANDS` (pour la prochaine
session), et la définition de la ligne `m06` du catalogue, seule autre occurrence
— elle écrivait « ARPA / ACV » sans développer ni l'un ni l'autre. L'indice dit
aussi **dans quelle devise** : les bornes n'en portent aucune, et la devise de la
mission se déclare deux champs plus bas.

**Vérifié à l'écran, pas dans un module** : la spec lit l'indice réellement rendu
à côté du sélecteur, puisqu'une expansion n'a de valeur que si elle atteint
l'écran. Non-vacuité mesurée — indice retiré et reconstruit, **exactement cette
spec tombe**, les 11 autres du fichier passent.

### Le cluster « frameworks comparés » (2026-09-14) — clôt la vague 2.2/2.3 du plan

Dernier item SEO menable par une session seule. Quatre pages « AARRR vs X »,
aux deux langues, à un slug plat portant la requête telle qu'elle se tape :
`/aarrr-vs-north-star-metric`, `/aarrr-vs-rarra`, `/aarrr-vs-growth-loops`,
`/aarrr-vs-okr`. L'angle vient de `GROWTH-PLAN.md` 2.3 : le concurrent le
mieux placé sur « AARRR » en anglais se classe précisément avec des pages
comparatives — c'est le seul angle du sujet qui ne soit pas saturé de
définitions.

**Ce qui empêche quatre variantes du même texte**, qui est le risque réel
d'un cluster : chacun des quatre cadres est confondu avec AARRR pour une
raison **différente**, et c'est la raison qui fait la page. North Star →
deux couches distinctes (une carte et une boussole). RARRA → les mêmes cinq
étapes dans un autre ordre, donc un débat sur le séquencement et pas sur le
modèle. Growth loops → la même chose dessinée en cercle, c'est-à-dire un
entonnoir dont on a joint les bouts. OKR → un modèle de mesure contre un
rituel de décision, dont les défauts classiques sont le travail l'un de
l'autre. Un test compare les `<h2>` des quatre pages dans les deux langues
et exige zéro intersection.

**Quatre dossiers de route plutôt qu'un segment dynamique**, et c'est un
choix, pas une facilité : un `[comparison]` à la racine de `[locale]`
entrerait en collision avec `glossary`, `about` et tous les autres segments
statiques ; et un préfixe `/compare/` laisserait un chemin orphelin tout en
allongeant l'URL. Chaque route est un fichier de vingt lignes ; le rendu est
partagé (`_comparison/ComparisonView`), le contenu vit dans
`content/comparisons.ts`.

**Le tableau côte à côte n'est pas un `<table>`.** Trois colonnes de prose à
390 px donnent ~114 px par colonne, et les parades habituelles (en-têtes
masqués, libellés injectés en `::before`) mettent du texte dans la CSS, où il
ne se traduit pas. Chaque ligne est donc un `<h3>` suivi de deux blocs qui
portent le nom du cadre **en clair dans le DOM** — côte à côte en desktop,
empilés en mobile, et le nom reste lisible même quand l'en-tête a défilé.
L'ordre des titres est vérifié en réel (h1, h2, h3×4 sous « En un coup
d'œil », puis les h2 des sections) et la page entre dans la passe axe.

**Maillage (règle 2.4)** : les quatre sont liées depuis `/how-it-works` — la
page qui explique le cadre, donc quatre liens y sont du sujet et pas du
remplissage — et se lient entre elles, donc le cluster se parcourt depuis
n'importe laquelle de ses entrées. Pas de septième lien au pied de page : à
six, il cesse d'en mettre aucun en avant. Chaque page sort aussi vers trois
ou quatre termes de glossaire.

**Deux défauts trouvés par la vérification, pas par la relecture :**

1. **Six des huit descriptions de recherche dépassaient la fenêtre de 160
   caractères** (jusqu'à 198 en français). Le test ne rapporte que la
   première : il a fallu mesurer les huit avant de conclure. Hors fenêtre,
   Google réécrit la description et la page perd la ligne qu'elle avait
   choisie pour elle-même.
2. **La copie anglaise citait ses phrases entre guillemets français** — «
   always start with retention » — alors que tout le reste du corpus anglais
   utilise des guillemets droits (`"negative churn"`, `"nights booked"`).
   Vu sur la capture de `/en/aarrr-vs-rarra`, invisible à la relecture :
   `Translatable` est deux chaînes, et les deux étaient valides. Six phrases
   sur deux fichiers, `content/open-door.ts` compris — même défaut, même
   brouillon, corrigé des deux côtés. **Le garde est un balayage du corpus**
   (`src/__tests__/copy-typography.test.ts`) et non une assertion sur une
   page : une seule page ne prouve rien des quarante-neuf autres, et le
   défaut est dans la copie, pas dans le rendu. Le test vérifie d'abord
   qu'il balaie un corpus non vide — sinon il passerait en ne regardant
   rien.

**Vérifié en réel** : lint, tsc, **673 tests unitaires** (+11), couverture
au-dessus des seuils, `next build` (les huit pages sortent en `●`, donc
servies par le CDN — c'est tout l'intérêt pour des pages qui existent pour
être trouvées), **280 specs Playwright** (+10). Mesuré plutôt que supposé :
**563 à 700 mots** par page et par langue, descriptions de 144 à 158
caractères, `scrollWidth === clientWidth` à 390 px sur les quatre pages en
français. Captures relues en EN desktop et FR mobile. Non-vacuité du garde de
typographie prouvée en réinsérant des guillemets dans une chaîne anglaise :
exactement ce test tombe.

**Toute la copie est neuve, donc `TODO: à relire`** (convention 6) :
`content/comparisons.ts` plus six chaînes de chrome dans `dictionary.ts`.

### Les codes de l'instrument d'audit ne s'affichent plus seuls (2026-09-14, signalé par Antoine)

Deux signalements dans la même heure — « ACV, c'est bien pour Annual Contract
Value ? » puis « il faut aussi que tu expliques les T1, T2, etc., les M7,
M12, etc. C'est du travail très bâclé que tu me rends là. » Le second
reproche est fondé, et il décrit une **classe**, pas un cas de plus : j'avais
corrigé l'ACV par un patch d'une ligne sans regarder si le même défaut
existait ailleurs. Il existait, trois fois.

**Ce que le balayage a trouvé**, cette fois avant de corriger :

1. **L'échelle T0-T4 ne vivait que dans un commentaire** de
   `content/audit-catalog.ts`. Elle s'affiche pourtant sur les 25 cartes de
   la collecte, dans les compteurs de reste et dans l'en-tête de l'éditeur de
   ligne. La seule phrase qui l'approchait à l'écran n'expliquait que les
   deux paliers les plus chers.
2. **Le pilier s'affichait BRUT** (`revenue`, en minuscules) sur ces mêmes
   cartes et dans l'en-tête de l'éditeur — alors qu'`AUDIT_PILLAR_LABELS`
   existe et sert partout ailleurs dans l'outil (`RestitutionView`,
   `TourScreen`). Une incohérence, pas un choix.
3. **`m06` n'était expliqué nulle part**, alors qu'on ne peut pas le masquer :
   le fichier de mission, les constats et les définitions (`m06@2`) le
   référencent.

**Le correctif est à deux registres, parce qu'ils servent à deux endroits.**
La **glose** (« libre-service », « file d'analyste ») tient sur une carte à
côté du code — c'est la répétition sur 25 cartes qui fait apprendre un code —
et le compteur la reprend (« reste 1 ligne T4 (mandat requis) »).
L'**explication** complète vit une fois, dans une légende dépliable qui dit
aussi pourquoi elle se lit du moins cher au plus cher alors que la liste trie
dans l'autre sens : les deux ordres sont voulus, et sans cette phrase l'écart
se lit comme un bug.

**Une glose corrigée par son propre test.** J'avais écrit « une session » pour
T2. Le test qui compare la glose aux vraies chaînes `cost` du catalogue a
échoué, et il avait raison : plusieurs lignes T2 ne sont pas une session (un
board pack déjà écrit, des conventions à lire seul). La glose est devenue
« quelques heures », qui tient sur les dix lignes T2. J'ai ensuite **retiré ce
test** : comparer mot à mot une glose de cinq mots à 39 lignes de prose libre
est un détecteur de coïncidences, pas un invariant. Il est remplacé par
celui qui en est un — **le `cost` de chaque ligne s'ouvre sur le palier de
cette ligne** (vérifié : vrai sur les 39), parce que c'est le désaccord qui
tromperait vraiment, les deux s'affichant à deux centimètres l'un de l'autre.

**Le contrôle de non-vacuité a prouvé une limite de mon propre garde, plutôt
que de la suggérer.** Le test statique (`src/__tests__/audit-vocabulary.test.ts`)
exige qu'un fichier qui rend un code importe aussi sa table de libellés. En
remettant le pilier brut sur la carte, il tombe. En remettant le **palier**
brut, **il passe quand même** — parce que la légende dépliable, dans le même
fichier, importe `TIER_GLOSS` de son côté. Ce sont donc les specs e2e qui
portent la glose du palier ; le test statique est un filet pour la classe, pas
la garantie. C'est écrit dans le fichier de test plutôt que laissé à
supposer. (Premier sabotage raté au passage : retirer l'import cassait la
compilation — un sabotage doit compiler pour prouver quoi que ce soit.)

**Vérifié en réel** : lint, tsc, 668 tests unitaires (+6), `next build`, **275
specs Playwright** (+4). Et surtout **à l'écran**, ce qui manquait à la
première passe : collecte en 1280 et 390 px (`T4 · MANDAT REQUIS ·
ACQUISITION`, légende dépliée, compteur glosé), éditeur de ligne (`M07 · T4 ·
MANDAT REQUIS · ACQUISITION` plus la note qui dit ce qu'est `m07`),
`scrollWidth === clientWidth` aux deux largeurs.

**Leçon de méthode, la vraie** : quand un signalement porte sur un code
inexpliqué, la première action est de **lister tous les codes affichés par
l'écran** — pas de corriger celui qui a été nommé. La liste des 49 libellés
de `Field` faite pour l'ACV était le bon geste ; je ne l'avais pas étendue
aux valeurs rendues dans les cartes, où était l'essentiel du problème.

### Bon à tirer nº5, et le bug qui rendait les décisions du nº4 invisibles (2026-09-14)

Les dix marqueurs `TODO: à relire` restants partent en relecture :
[bon à tirer nº5](https://claude.ai/code/artifact/6236cd38-cfbb-4b4c-89c4-fb35a8bca84f)
— 31 cartes, 16 pages de fond (les dix termes de glossaire de la vague 2.2,
les deux pages « porte ouverte », les quatre comparaisons « AARRR vs X ») plus
les 15 libellés de chrome qui les entourent.

**Le document est reconstruit depuis `grep -rn "TODO: à relire" src/`, jamais
de mémoire** (convention 6) — et pour la troisième fois d'affilée c'est le grep
qui a corrigé un compte annoncé ici : l'état du projet disait « six marqueurs »,
il y en avait **dix**. Les textes eux-mêmes sont exportés depuis les vrais
modules par une sonde jetable lancée avec une config Vitest du bac à sable
(le seul runner qui résout TypeScript et l'alias `@/`), jamais retapés : relire
une copie qui aurait dérivé du code serait pire que ne pas relire.

**Bilingue, avec un défaut assumé** : le français est affiché, l'anglais est à
un clic par carte (ou partout d'un coup). 15 800 mots de français et autant
d'anglais est un barrage, et un barrage veut dire que la relecture ne se fait
pas. C'est écrit en tête de l'artifact plutôt que caché : la relecture d'Antoine
porte sur le fond et la voix, la mienne sur le parallèle et la typographie.

**Le vrai enseignement est ailleurs.** En vérifiant le contrat `db` avant de
publier — obligatoire avant de déclarer une capability — j'ai trouvé que le
gabarit du nº4, que je recopiais, lit un instantané de collection comme un
**tableau de documents portant leurs champs** :

```js
db.collection("lines").onSnapshot(function(docs){ (docs || []).forEach(…) })
```

Or `onSnapshot` sur une collection délivre un **`QuerySnapshot`** — `snap.docs`,
et le corps de chaque document derrière `data()`. Le callback levait donc
`TypeError: docs.forEach is not a function` à la première livraison : les
décisions étaient **écrites** (le chemin `doc().set()` est correct) et **jamais
relues**. Quelqu'un qui tranche dix cartes, ferme l'onglet et revient retrouve
une page vierge — la façon la plus sûre de faire abandonner une relecture.

**Et ma propre affirmation « le nº4 n'a jamais été ouvert » était fausse.**
Je l'avais vérifiée sur la collection `reviews/`, le nom des nº1 à nº3 ; le nº4
écrit dans `lines/`. Il contenait bien une décision d'Antoine (`m07`, « ça
passe », 2026-09-13). Vérifier une absence dans le mauvais tiroir, c'est ne
rien avoir vérifié — quatrième occurrence de cette leçon dans ce projet.

Corrigé dans les deux artifacts, avec en plus un message « Reprise de N
décisions déjà enregistrées » (repris du nº1, qui avait la bonne forme depuis
le début) : un rechargement silencieux ne dit pas s'il a retrouvé quelque chose.

**Non-vacuité mesurée** : en remettant exactement la forme du nº4 sur un faux
`db` conforme au contrat, `TypeError: docs.forEach is not a function`, zéro
décision restaurée, et les écritures continuent de passer — exactement le
symptôme qui rendait le défaut invisible. Le correctif du nº4 a ensuite été
rejoué contre la vraie décision `m07` lue en base : restaurée.

**Vérifié** : rendu réel dans Chromium (desktop 1280 et mobile 390),
`scrollWidth === clientWidth` aux deux largeurs — un défaut corrigé au passage,
une clé de dictionnaire comme `comparisonPage.glossaryHeading` est un jeton
insécable qui poussait la carte 41 px hors d'un écran de 390 (`minmax(0,1fr)`
sur la piste de grille, `overflow-wrap:anywhere` sur le titre).

### `activation-rate` est coupé : deux pages enseignaient la même métrique (2026-09-14)

Antoine, en lisant le bon à tirer nº5 : « la page de glossaire activation et
la page "taux d'activation" parlent de la même chose, non ? » Vérifié en
comparant les deux depuis les vrais modules plutôt que de mémoire, et c'est
plus net que « ça se ressemble » :

| | `activation` | `activation-rate` |
|---|---|---|
| Formule | `Taux d'activation = …` | `Taux d'activation = …` |
| Exemple | un outil d'équipe, un mois d'inscriptions | un outil d'équipe, un mois d'inscriptions |
| FAQ | « pas simplement le taux de conversion ? » | « Taux d'activation ou taux de conversion ? » |
| FAQ | « plusieurs métriques d'activation ? » | « un événement ou plusieurs ? » |

La seule ligne de partage tenable était `act-1` (définir le moment) contre
`act-2` (le mesurer) — mais la page `activation` porte déjà la formule du
taux, donc elle ne la tient pas. C'est exactement le quasi-doublon que la
vague 2.1 avait pris soin d'éviter **entre** les deux pages « porte
ouverte », et que je n'avais pas testé **à l'intérieur** du glossaire. Deux
pages qui se cannibalisent : ni l'une ni l'autre ne classe. Décision
d'Antoine : couper `activation-rate`.

**Une URL publiée ne meurt pas ici, même vieille d'un jour.**
`/glossary/activation-rate` a été mis en ligne le matin et soumis à IndexNow
dans la foulée. Sans redirection il renverrait 404, parce que
`dynamicParams = false` (R-26) refuse tout segment absent de
`generateStaticParams`. D'où une 308 dans `next.config.mjs` vers
`/glossary/activation` : permanente parce que la page ne revient pas, et
c'est ce qui transfère le signal au terme qui garde le contenu. L'adresse
non préfixée passe d'abord par la 308 du proxy, donc deux sauts — ce que ce
dépôt pratique déjà pour les URL d'avant R-13.

**Les six liens entrants vont à `activation`**, pas nulle part : là où elle
était déjà citée le lien tombe (3 liés restent, dans la fenêtre 2-4 du
test), sinon il est remplacé. Mesuré après coup plutôt que supposé : 24
termes, **aucun sous 2 liens entrants**.

**Ce qui disparaît et qui n'est pas dans `activation`**, dit franchement
plutôt que folé en silence dans de la copie déjà validée (convention 6) :
l'exemple qui montre le taux passer de 31 % à 64 % selon l'événement retenu,
le levier « compte les étapes entre l'inscription et l'événement, puis
supprimes-en une », la FAQ sur la longueur de la fenêtre, et le rattachement
à `act-2`. À dire si l'un doit être repris — `activation` est de la copie
approuvée le 2026-09-09, donc l'y fondre est une décision, pas un effet de
bord de cette coupe.

**Deux ratés de ma part dans cette heure, tous deux instructifs.**

1. **La CI est passée au rouge sur ma tête, et c'était évitable.**
   `structured-data.spec.ts` affirmait `term.name === "CAC"` ; le balayage
   des acronymes a développé ce titre. J'avais lancé lint, `tsc`, les 706
   tests, les seuils de couverture et `next build` — **mais pas la suite
   Playwright**, après un changement qui touche de la copie rendue. Le
   correctif est la discipline que ce fichier applique déjà deux lignes plus
   haut : lire le titre depuis `GLOSSARY` plutôt que le recopier. Le test du
   sitemap portait le même défaut (`toHaveLength(74)` écrit à la main) — il
   dérive maintenant son compte du glossaire et du cluster comparatif, parce
   qu'un nombre qu'on retouche à chaque lot finit par être retouché sans
   être lu.
2. **J'ai supprimé deux entrées de `glossary-deep.ts` au lieu d'une**, et
   `tsc` l'a dit (« Property 'cac' is missing »). Cause : j'avais relevé les
   bornes avec un `grep` qui ne cherchait **que les deux clés que je lui
   avais nommées** — donc il ne pouvait pas me montrer la troisième, `cac`,
   assise entre elles. C'est la leçon du run nº8 sous une autre forme : une
   recherche ne prouve que ce qu'elle a regardé. Refait en listant **toutes**
   les clés de premier niveau, puis en assertant qu'aucune autre n'entre dans
   l'intervalle avant de couper.

**Vérifié en réel** : lint, tsc, **706 tests unitaires**, seuils de
couverture, `next build` (les pages de terme passent de 50 à 48, en `●`),
**286 specs Playwright** (+1). Non-vacuité : en retirant la redirection et
en reconstruisant, **exactement la nouvelle spec tombe**, les 21 autres du
fichier passent.

### Functions Storage : le modèle était faux, et la mesure aussi (2026-09-15)

Antoine a vérifié auprès de Vercel après un compteur qui ne redescendait pas.
**Deux notes de ce fichier étaient fausses, et elles se corrigeaient l'une
l'autre.**

**1. La rétention des déploiements ne fait rien pour ce compteur.** Functions
Storage est une **somme glissante sur 30 jours** : chaque déploiement ajoute
le poids de ses fonctions, et sort du calcul 30 jours plus tard —
**supprimé ou non**. L'entrée du 2026-09-13 attribuait les 9,24 Go aux
« déploiements retenus » et présentait la politique de rétention comme le
correctif ; c'est faux sur les deux points. Le « 397 Mo » observé ensuite
était un couac côté Vercel, pas un effet de la rétention.

La formule réelle :

```
Functions Storage = poids des fonctions × déploiements des 30 derniers jours
```

**2. La note « un déploiement, c'est six fonctions » était juste, mais pour
une raison qu'il faut connaître avant de mesurer.** Le Build Output contient
~430 entrées `.func` — dont **6 seulement sont des répertoires physiques**,
les autres étant des liens symboliques vers elles. Et depuis Vercel CLI 59,
un `.func` physique ne contient que 5 fichiers : la liste réelle des fichiers
tracés vit dans **`filePathMap` de son `.vc-config.json`** (116 Ko pour la
route Deep dive). Conséquences pour qui remesure :

- `du` sur `.vercel/output/functions` ne mesure **rien** (j'ai obtenu 6 Mo,
  puis 13 Mo, pour un déploiement qui en pèse 47) ;
- sommer tous les `.func` donne 3,4 Go, ce qui est absurde (on compte 430
  fois les mêmes 6 bundles) ;
- la seule mesure juste est : pour chaque `.func` **non-symlink**, sommer les
  tailles des fichiers listés dans son `filePathMap`.

**Mesuré sur `main` au 2026-09-15** (`vercel build` hors ligne, jamais
déployé) : **47,3 Mo par déploiement**, et 154 squash-merges sur 30 jours,
donc **7,29 Go sur 10** — 73 %. Le plafond au poids actuel est de
**211 déploiements par 30 jours** ; la journée du 6 septembre en a produit 41
à elle seule.

Où part le poids :

| Poste | Poids | Présent dans |
|---|---|---|
| Runtime Next.js | 19,5 Mo (41 %) | 6/6 fonctions |
| Notre code applicatif | 10,0 Mo (21 %) | 6/6 |
| Pile gRPC de Firestore (`google-gax`, `@grpc/grpc-js`, `protobufjs`) | 7,3 Mo (15 %) | 3/6 |
| Firestore, auth, polyfills | 6,8 Mo (14 %) | 3/6 |

#### La piste gRPC est fermée, et cette fois c'est prouvé

Firestore sait parler REST (`preferRest`, activable jusqu'en variable
d'environnement `FIRESTORE_PREFER_REST`). Exclure les trois paquets gRPC du
tracing fait bien tomber le déploiement à **39,0 Mo** (−17,5 %).

**Mais le module ne se charge plus.** `google-gax/build/src/index.js:53` fait
un `require("@grpc/grpc-js")` **au niveau module**, et le graphe tire
`protobufjs` de la même façon. Vérifié en déplaçant physiquement les paquets
hors de `node_modules` — la technique employée pour `sharp` le 2026-09-13 :

```
les trois retirés  → MODULE_NOT_FOUND: Cannot find module 'protobufjs'
seul @grpc retiré  → MODULE_NOT_FOUND: Cannot find module '@grpc/grpc-js'
tout restauré      → module chargé OK
```

Aucun sous-ensemble n'est excluable. Le mode d'échec aurait été celui que
`next.config.mjs` documente déjà pour satori — un build vert qui casse la
production — mais sur **toutes** les routes Firestore au lieu des aperçus de
liens. Ne pas y revenir sans que `google-gax` ait changé de structure.

#### Ce qui marche : 6 fonctions → 5, par alignement de `maxDuration`

La règle de regroupement de Vercel, lue dans les `.vc-config.json` plutôt que
supposée : les routes sont groupées par **`operationType`** (`ISR` pour les
pages de contenu, `Page` pour les pages applicatives, `API` pour les Route
Handlers et les images de métadonnées) × **arbre de layout racine** ×
**configuration identique**.

D'où les six groupes, et surtout : **la fonction Deep dive n'est séparée que
parce qu'elle déclare `maxDuration = 120`** (R-15) et que les autres Route
Handlers n'en déclarent aucun. En posant le même `maxDuration` sur
`/api/submissions`, `/admin/stats/json` et `/r/[id]/share/[token]`, les deux
groupes fusionnent :

| | Fonctions | Par déploiement | Sur 30 jours à 154 déploiements |
|---|---|---|---|
| Aujourd'hui | 6 | 47,3 Mo | 7,29 Go (73 %) |
| `maxDuration` unifié | **5** | **38,7 Mo** | **5,97 Go** (60 %) |

Les 8,6 Mo de la fonction Deep dive étaient presque intégralement du runtime
Next et de la pile Firestore déjà présents dans la fonction voisine.

**Le compromis, à décider et non à glisser** : `maxDuration` est un plafond,
pas une réservation, et Vercel facture le CPU actif — donc une route rapide
avec un plafond haut ne coûte rien de plus. Ce qui change est le **chemin
d'échec** : un appel Firestore qui pend sur `/api/submissions` tiendrait
jusqu'à 120 s avant de rendre `SCORING_FAILED`, au lieu d'être coupé par le
défaut de la plateforme. L'écran de chargement est conçu pour une attente
indéfinie depuis l'étape 12bis, donc le coût réel est une erreur qui met plus
longtemps à s'afficher.

**Cinq est le plancher de cette architecture.** Descendre à quatre
demanderait de fusionner les pages de contenu (`ISR`) avec les pages
applicatives (`Page`), c'est-à-dire de revenir aux deux layouts racine de
R-24 — ce qui coûterait le prérendu CDN des 48 pages de contenu. Mauvais
échange, et à ne pas reproposer.


#### Correction du modèle par l'export Vercel : on compte par ROUTE

Antoine a fourni l'export du dernier déploiement de production. Il contredit
ma mesure locale sur le point décisif : **Vercel attribue le poids du bundle
à chaque route, pas à chaque bundle physique.**

| Bundle | Taille | Routes | Cumul |
|---|---|---|---|
| **Pages de contenu** | **4,36 Mo** | **92** | **401 Mo (94 %)** |
| Images OG | 3,31 Mo | 7 | 23 Mo |
| Deep dive | 2,18 Mo | 1 | 2,2 Mo |
| Proxy | 0,56 Mo | 1 | 0,6 Mo |
| **Total** | | **165** | **428,9 Mo** |

Deux conséquences qui changent les priorités :

1. **La fonction des pages de contenu est multipliée par 92.** Tout gramme
   qu'on lui retire compte 92 fois ; tout gramme retiré ailleurs compte une
   ou sept fois. C'est le seul endroit où il faut travailler.
2. **Le gain « 6 → 5 fonctions » est marginal dans cette comptabilité** :
   fusionner la fonction Deep dive économise une route à 2,18 Mo, pas les
   8,6 Mo de disque que ma mesure locale laissait espérer. Le correctif reste
   bon à prendre — il est gratuit — mais ce n'est plus le levier principal.

**Je ne sais pas réconcilier exactement 428,9 Mo/déploiement avec les ~7 Go
observés sur 30 jours** (154 déploiements donneraient 66 Go) : Vercel
déduplique probablement les bundles identiques entre routes, ou entre
déploiements successifs. À demander à leur support plutôt qu'à deviner — mais
le classement relatif des postes, lui, est sûr, et c'est ce qui guide l'action.

#### La vraie cause du 2,2 → 4,4 Mo : notre contenu est recopié six fois

Constat d'Antoine : la fonction des pages est passée de 2,2 à 4,36 Mo.
Cherché dans le build plutôt que supposé — `.next/server/chunks/ssr/`
contient **six fichiers de 397 589 octets, à l'octet près**. Comparés deux à
deux : **cinq octets de différence, uniquement le nom du fichier de source
map**. Ce sont des copies identiques.

```
cmp -l src_1knjr0h._.js src_1k9ffd4._.js  →  5 octets, offset 397576
                                              (//# sourceMappingURL=…)
```

Chaque copie contient **toute la bibliothèque de contenu** — vérifié par
marqueurs : `glossary-deep`, les `extended` du glossaire, `copy-library`,
`comparisons`, `legal`, le crédit Antoine, plus le JSON-LD. Turbopack en émet
**une copie par groupe de routes**, et nous avons ajouté des groupes sans
arrêt depuis le 6 septembre : 4 pages de comparaison, 2 pages « porte
ouverte », 2 pages légales, `/about`.

**Donc ~2,0 Mo des 4,36 Mo de cette fonction sont de la duplication pure** —
et ils sont comptés 92 fois. C'est, de loin, le premier poste à traiter.

Ordre de grandeur des sources : `glossary-deep.ts` pèse **300 Ko** à lui
seul (24 termes × 2 langues de prose longue), devant `audit-catalog.ts`
(64 Ko), `glossary.ts` et `comparisons.ts` (40 Ko chacun).

**Conséquence à retenir pour la suite du plan de croissance** : chaque terme
de glossaire long ajouté grossit un module qui est recopié six fois, puis
compté quatre-vingt-douze fois. La vague 2 du `GROWTH-PLAN.md` a un coût
d'infrastructure que personne n'avait chiffré.

**Pistes à explorer, aucune vérifiée** (c'est le prochain chantier, pas une
conclusion) : import dynamique du contenu depuis les pages pour forcer un
chunk asynchrone partagé ; sortir `src/content/` derrière une frontière que
Next traite en externe (`serverExternalPackages` ne s'applique qu'à
`node_modules`, donc il faudrait un paquet local) ; ou vérifier si le
regroupement change hors Turbopack. À mesurer de la même façon : `npm run
build`, puis comparer les tailles dans `.next/server/chunks/ssr/`.

#### Le levier le plus gros n'est pas le poids : c'est le nombre

À 47,3 Mo, **26 des 154 déploiements (17 %) ne touchaient que `*.md`,
`.github/`, `marketing/`, `design/` ou `scripts/live/`** — site servi
rigoureusement identique, 1,23 Go de compteur dépensés pour rien. Vérifié
qu'aucun de ces chemins n'entre dans le build : aucun `.md` n'est lu au
build, et rien sous `src/` n'importe `marketing/` ni `design/`.

`vercel.json` porte déjà un `ignoreCommand` (2026-09-07) qui saute les builds
hors production. Il peut aussi sauter la production quand le diff ne touche
aucune entrée de build. **Règle non négociable dans son écriture** : en cas
de doute — clone superficiel, `HEAD^` indisponible, erreur git — il doit
**construire** (`exit 1`), jamais sauter. Un déploiement sauté à tort veut
dire qu'un correctif ne part pas en production, ce qui est bien pire que
47 Mo de compteur. `src/__tests__/vercel-config.test.ts` existe parce qu'un
`vercel.json` invalide fait échouer *tous* les déploiements, production
comprise : toute évolution de ce fichier passe par ce test.

Projection combinée :

| Scénario | Consommation | % de 10 Go |
|---|---|---|
| Aujourd'hui | 7,29 Go | 73 % |
| 5 fonctions | 5,97 Go | 60 % |
| 5 fonctions + saut des déploiements « doc seule » | 4,96 Go | 50 % |
| + merges groupés (~60 déploiements de code/mois) | 2,32 Go | **23 %** |

La cadence est le terme dominant, et c'est une convention déjà écrite le
2026-09-07 que nous ne tenons pas : 41 merges le 6 septembre, 27 le 14.

**Rien n'a été poussé ni déployé pour cette mesure** (consigne d'Antoine : le
moindre déploiement peut être de trop). Tout a été fait avec `vercel build`
hors ligne, sur un `.vercel/project.json` fabriqué. `.vercel` **est** désormais
dans `.gitignore` et dans les ignores d'ESLint (corrigé le jour même, voir
l'entrée suivante) ; le supprimer après chaque mesure reste la bonne hygiène,
mais un oubli ne peut plus être committé.

### Déduplication du chunk de contenu : 7,9 → 5,74 Mo par route de contenu (2026-09-15)

Suite directe du diagnostic ci-dessus. Le constat était juste — six chunks SSR
identiques portant toute la bibliothèque de contenu — mais aucune des « pistes
à explorer » que j'avais listées (import dynamique, paquet local,
`serverExternalPackages`) n'était la bonne. **Il n'y avait rien à contourner :
c'était trois fan-in de notre propre code.**

**Fix 1 — `glossary.ts` n'importe plus `glossary-deep.ts`.** L'interface
`GlossaryEntry` portait un champ `deep` renseigné sur les 24 termes, que
**seule** la page de terme lisait. Un module que quatre routes importaient
tirait donc **300 Ko** de prose longue dans chacune. La page de terme lit
maintenant `GLOSSARY_DEEP[term]` directement ; le champ, ses 24 lignes de
câblage et l'assertion de test qui vérifiait le câblage disparaissent.

**Fix 2 — `lib/seo/jsonld.tsx` perd son helper `CRUMBS`.** Il construisait les
fils d'Ariane des neuf familles de pages, donc importait `how-it-works`,
`legal`, `comparisons`, `open-door`, `about` et le glossaire. Or ce module est
traversé par **toutes** les pages de contenu : chacune emportait le contenu des
huit autres. Chaque page construit maintenant son propre fil, en une ligne,
depuis le module qu'elle importait déjà de toute façon — vérifié avant de
toucher quoi que ce soit pour les neuf.

**Fix 3 — ce que la mesure a trouvé et que la lecture n'avait pas vu.** Après
Fix 1 et 2, `glossary.ts` (la copie `extended`, 39 Ko) restait dans **cinq**
chunks. Deux importeurs n'en avaient aucun besoin : `definedTermSetSchema` et
`definedTermSchema` ne lisent que `term` et `definition`, et l'index du
glossaire non plus. Les deux passent sur `content/glossary-terms.ts` (12 Ko),
la moitié courte que R2-14 avait déjà extraite **pour le navigateur** — la même
scission vaut côté serveur, pour la même raison, à un niveau différent.

**Mesuré à chaque étape, jamais déduit** (`npm run build`, sondes de chaîne
uniques à chaque module dans `.next/server/chunks/`, puis `vercel build` hors
ligne) :

| | Chunks portant `glossary-deep` | Chunks portant `glossary.ts` | Fonction de contenu | Disque total |
|---|---|---|---|---|
| Avant | 6 | 5 | 7,9 Mo | 47,3 Mo |
| Fix 1 | **1** | 5 | 6,5 Mo | 45,7 Mo |
| Fix 1+2+3 | **1** | **2** | **5,74 Mo** | **43,55 Mo** |

Plus aucun groupe de chunks identiques à l'octet au-dessus de 50 Ko. Les deux
chunks restants pour `glossary.ts` sont les deux routes qui la rendent
vraiment : la page de terme, et le sitemap (qui lit `updatedAt`).

**Ce que ça vaut côté facture, dit comme une extrapolation et pas comme une
mesure** : Vercel compte par route, et son export rapportait 4,36 Mo là où ma
mesure locale donnait 7,9 (rapport 0,55 — la mienne somme le `filePathMap` non
compressé). Au même rapport, 5,74 Mo local ≈ **3,2 Mo par route de contenu**,
soit ~−27 % sur le poste qui représentait 94 % du déploiement. Le chiffre réel
ne se lira que sur l'export du prochain déploiement.

**Le garde : `src/__tests__/content-fan-in.test.ts`.** Le garde de R2-14 ne
regarde que les Client Components, et **aucun des trois fan-in n'était un
Client Component** — c'est exactement le trou. Celui-ci mesure l'**atteinte** :
pour chaque module de contenu volumineux, combien des 38 points d'entrée de
l'App Router le rejoignent en suivant les imports de valeur (un `import type`
n'est pas une arête, TypeScript l'efface). Un budget par module, avec sa
raison, plus la règle qui aurait attrapé `CRUMBS` : le module JSON-LD ne peut
importer que du contenu que **chaque** page émet.

Non-vacuité mesurée finement, trois sabotages : remettre l'import
`glossary-deep` dans `glossary.ts` → 1 test tombe ; remettre un module de
contenu propre à une page dans `jsonld.tsx` → 2 tombent (le budget **et** la
liste, ce qui est correct : l'un dit le symptôme, l'autre la cause) ; remettre
l'index du glossaire sur la copie longue → 1 tombe.

**Trouvé en route, sans rapport avec le sujet : `npm run lint` sortait
2 366 problèmes.** Pas une régression — `.vercel/` (le Build Output de mes
mesures) n'était ni dans `.gitignore`, ni dans les ignores d'ESLint, donc
ESLint analysait des bundles minifiés (colonnes à `1:10753`, ce qui est le
signe). Les deux ajoutés ; `lint` ressort à 0. **La leçon vaut au-delà du
correctif** : un compteur de lint qui explose après une manipulation d'outil se
lit d'abord en regardant *quels fichiers* sont signalés (`cut -d/ -f1 | sort |
uniq -c`), pas en lisant les règles.

**Ce qui reste, non fait ici** : `content/comparisons.ts` (39 Ko) est atteint
par 6 routes et `copy-library.ts` (34 Ko) par 11. Les deux sont légitimes —
chaque page de comparaison rend son entrée, et les onze pages qui lisent
`copy-library` citent vraiment des questions — mais ce sont les deux prochains
postes si le compteur redevient un sujet. Le garde fixe leur budget actuel
comme plafond, donc une nouvelle route qui les tirerait sans les rendre fera
rougir la CI.

### Les conventions sont rangées par outil, et la sémantique d'`ignoreCommand` est vérifiée (2026-09-15)

Deux demandes d'Antoine pendant le gel (aucun développement applicatif, aucun
déploiement jusqu'au 26 — un push de branche ne construit rien, donc ceci coûte
zéro).

**1. La vérification de doc que j'avais annoncée.** Ma question était : que fait
Vercel sur un code de sortie autre que 0 ou 1 ? La page de référence
`vercel.json` ne dit que « code 0 ignores the build, while code 1 continues
it », ce qui est **insuffisant pour écrire la commande en sécurité**. C'est
l'article du centre d'aide qui tranche : « If the command returns '0', the build
will be skipped. If, however, a code **'1' or greater** is returned, then a new
deployment will be built. » Donc `exit 0` est la **seule** valeur qui saute : un
crash, une erreur git, une variable non définie construisent tous. Mon
inquiétude était infondée — et elle est maintenant vérifiée plutôt que supposée,
ce qui n'est pas la même chose.

Trois trouvailles que je ne cherchais pas, toutes dans `VERCEL.md` §1.6 :
`VERCEL_GIT_PREVIOUS_SHA` (SHA du dernier déploiement **réussi**) vaut mieux que
`HEAD^` dans un cas précis — un merge de code qui **échoue au build** suivi d'un
merge sans effet ferait sauter le second et le code ne partirait jamais ; le
clone est superficiel (`--depth=10`) ; et surtout **un build sauté ne crée aucun
déploiement**, donc aucune fonction, donc l'économie sur Functions Storage est
réelle. Ce dernier point pouvait annuler tout le correctif : une recherche
annonçait que « canceled builds count as full deployments », mais ça vise les
builds annulés **en cours**, qui ont déjà exécuté la commande de build.

**2. Six fichiers d'outil, et une table de déclencheurs.** Les conventions et
pièges propres à chaque outil quittent ce fichier pour `VERCEL.md`, `NEXTJS.md`,
`TESTING.md`, `GITHUB.md`, `GEMINI.md` et `FIRESTORE.md`. Objectif explicite
d'Antoine : **pouvoir retransmettre ces apprentissages à un autre projet** qui
utilise le même outil. Chaque fichier est donc coupé en deux — « ce qui vaut
partout » (portable) et « propre à Tour de Growth » (les chiffres, les routes,
qui ne voyagent pas).

**Le piège que cette forme existe pour éviter.** La convention sur la cadence de
merges était *déjà* dans `CLAUDE.md`, écrite par moi, et je ne l'ai pas suivie.
La déplacer dans `VERCEL.md` ne l'aurait pas sauvée — au contraire : **seul
`CLAUDE.md` est chargé automatiquement**. Sortir une règle sans dire *quand*
aller la chercher, c'est l'enterrer. D'où la **table de déclencheurs** en tête de
ce fichier, qui ne contient pas les règles mais le moment de les ouvrir
(« avant tout merge → `VERCEL.md` »), et les treize conventions qui restent ici
en index d'une ligne avec un renvoi vers le détail.

**Le journal ne se découpe pas** : il est chronologique et narratif, le trier par
outil le détruirait. Seules les règles distillées partent.

**Vérifié** : les dix renvois `FICHIER §x` introduits résolvent tous vers un
titre réel. Au passage, mon premier vérificateur a rapporté cinq renvois cassés
dont quatre étaient **un bug de ma regex** (elle exigeait une espace après le
numéro là où les titres ont un point) et un visait une autre convention de
numérotation. Exactement la leçon de `TESTING.md` §2.1 — une vérification qui
rapporte une anomalie doit d'abord prouver qu'elle a regardé le bon endroit —
appliquée au vérificateur lui-même.
