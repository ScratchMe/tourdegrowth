# A · « Jour de course » : notes de direction

## Thèse
Le Tour tel qu'on le regarde à la télévision : le papier reste, l'encre passe au noir d'écran, et le jaune du maillot devient la couleur de l'étape qu'on suit. Le résultat devient un écran de classement en direct, et chaque page est un habillage du même programme.

## Palette (contrastes WCAG calculés, composés sur leur fond réel)
| Rôle | Couleur | Paire mesurée |
|---|---|---|
| Carte / page | `#FBF9F2` / `#EFEBE1` | — |
| Encre | `#151515` | 17,33 sur carte · 15,34 sur page · 13,60 sur `#E3DED2` |
| Gris chrono (texte secondaire) | `#5B5346` | 7,20 carte · 6,37 page · 5,65 fond enfoncé · 5,23 sur jaune |
| Encre discrète (crédit) | encre à 66 % | 5,72 carte · 5,45 page |
| Rouge flamme rouge (texte + action) | `#B8321F` | 5,67 carte · 5,02 page · blanc dessus 5,98 |
| Noir d'écran (plaques) | `#111111` | blanc 18,88 · gris écran `#B9B3A6` 9,05 · texte nuit 16,44 |
| Jaune maillot, **fond seulement** | `#FFD21A` | encre dessus 12,60 · jaune sur noir 13,03 · jaune sur carte 1,38 (jamais seul sur le papier : toujours cerné d'encre ou posé sur noir) |
| Vert maillot (marques du moteur) | `#1B7A3E` | 5,11 carte · 4,52 page ; maillot vert `#2FAE5C` sur noir 6,59 |
| Pois (maillot du grimpeur) | rouge `#B8321F` sur blanc | 5,98 (décor) |
| Marques non textuelles | | triangle rouge sur jaune 4,12 · rouge contre noir 3,16 (bord du bouton, jamais du texte) · barre encre sur rail `#DCD6CA` 12,62 · sur rail de la ligne jaune 8,35 · contour des segments à venir `#7D7566` sur page 3,83 |

**La grammaire du rouge est gardée** : action (boutons, onglet « Prochaine action »), diagnostic (étape qui freine, « Là où tu perds du temps », pastille d'échantillon), conseil. Le jaune ne dit jamais « bien » ni « mal » : il signale **l'étape qu'on suit** (ligne qui freine, question en cours, étape du quiz).

## Polices
- **Saira Extra Condensed 800** pour les titres, le score et les boutons (capitales), jamais sous 21 px. Le sous-ensemble latin chargé ici **n'a pas le №** (il est dans le sous-ensemble cyrillique de Google) ni `▲ ▼ ●` ni U+202F. Le № du dossard retombe sur IBM Plex Mono ; triangles et pastilles sont dessinés en CSS, jamais en glyphes. Le signe moins U+2212 est présent.
- **JetBrains Mono** pour les étiquettes, les rangs, les écarts (« −12 ») et « /100 » : tout sauf U+202F (à remplacer par U+00A0, comme le fait déjà `deck.ts`).
- **Inter** inchangée pour le corps.
- Pour l'image de partage (Satori) : Saira est une famille statique (TTF par graisse, OK) ; JetBrains Mono est variable sur Google Fonts, donc il faut un TTF statique par graisse, à revérifier sur le fichier livré.

## Composant signature : la « tour de chrono »
Sur le résultat, trois pièces empilées d'un seul bloc (sur desktop) :
1. la **plaque noire du score** : « 74 » en condensé géant, « /100 » en mono jaune, un liseré jaune maillot dessous ;
2. **l'étape qui freine**, avec le fanion triangulaire rouge du dernier kilomètre ;
3. le **classement en direct** des cinq étapes : rang, pastille, nom, barre noire sur rail gris, score, écart au leader en mono (« — », « −2 »… « −12 »). **L'étape qui freine porte le fanion rouge et sa ligne passe en jaune.** Barres et écarts sont des entiers sur 20 : aucune précision ajoutée.

S'y ajoutent **la consigne de l'oreillette** (l'action : onglet rouge « Prochaine action », icône radio et « Oreillette » quand il y a la place, onglet jaune de l'étape) et **l'image de partage en bandeau bas d'écran** (lower third : onglets rouge et jaune sur une barre noire qui porte l'action, plaque de score à droite, accroche en capitales, avec la question en rouge).

## Le signe des trois espaces : les trois maillots, en code télé
- **Le Tour = jaune** (classement général : le diagnostic) · **le moteur = vert** (classement par points : les chiffres) · **le jeu = pois** (le grimpeur : le côté obscur). Ce sont des codes génériques du cyclisme (silhouettes de maillot dessinées ici), sans aucun logo.
- **Dans l'en-tête de chaque page** : une bande de 8 px aux couleurs du maillot tout en haut, et un « bug » noir à côté du mot-symbole, avec les trois maillots (celui de l'espace allumé, les deux autres éteints) et « Le Tour / Le moteur / Le jeu » (FR) ou « The Tour / The engine / The game » (EN). Sur mobile, seul le maillot de l'espace reste.
- **Dans la page** : chaque étiquette de section est une plaque noire avec le maillot à gauche. Le titre du moteur et celui du jeu portent une barre à leur couleur (la plaque du score porte le jaune).
- **Là où un lien mène vers un autre espace, il porte le maillot de la destination** : l'encart du jeu sur le résultat a sa bande à pois, et « Où en est ta croissance ? » sur le hub du jeu a le maillot jaune.
- **La landing montre le code une fois** : un petit tableau « Un Tour, trois étapes » (desktop), décoratif ici, qui deviendrait la bande « la suite du Tour » de l'articulation A.

## Ce qui change par espace
- **Tour** : landing en capitales condensées ; la carte d'aperçu est une mini tour de chrono. Le quiz devient un plateau de jeu télé : question sur plaque noire, onglet jaune « Étape 1 sur 5 », réponses avec clé A/B/C, progression en segments (jaune = en cours). Le résultat est décrit plus haut.
- **Moteur** : titre, barre et étiquettes en vert. Un **tableau des points** (« 17 chiffres, par étape » : 3·3·3·3·5, repris de la copie de la page) fait pendant au classement du Tour. Le verdict porte un filet vert en lower third. Rouge inchangé pour l'accent de diagnostic.
- **Jeu** (cinq étapes, cinq entreprises, un DG qui veut le chiffre) : les cinq zones deviennent une liste d'étapes numérotées en condensé. La zone jouable est une plaque noire avec bande à pois, les autres restent en pointillés (« pas encore »). Rien dans ce qui est ajouté ne décrit le jeu par un seul niveau.

## Risques
- **Le jaune au cyclisme veut dire « leader »**, et ici il signale l'étape qui freine. Le fanion rouge, le rang 5 et l'écart « −12 » lèvent l'ambiguïté, mais c'est le point à trancher. Variante : ligne blanche plus fanion rouge, et jaune seulement sur l'onglet de l'oreillette.
- **Le classement trie par score** : l'ordre AARRR se perd visuellement. Dans la maquette le tri est fait en CSS (`order`), ce qui casserait le test d'ordre de lecture du résultat. En vrai, il faut trier dans le DOM, côté serveur.
- Le condensé en capitales se lit moins bien sur les libellés longs (« Jouer le niveau « S'ils reviennent » »). Il faut garder un plancher de 21 px, sinon revenir à Inter 700.
- Sans ombres portées ni stencil, la marque perd un peu de chaleur « peinture routière » : c'est un choix de direction.
- Hors périmètre, mais vu en passant : la copie actuelle de l'encart du jeu sur le résultat (« joue une année comme PM growth d'une appli de streaming ») décrit le jeu par son seul niveau. Elle est à revoir côté copie.

## Coût d'une vraie mise en œuvre
**Tokens et quelques composants, sans illustration** : palette, rayons, ombres et deux polices en tokens. Composants à restyler : ScoreDisplay, Bottleneck, PriorityMove, MetaLabel (variante « plaque »), Button, QuestionCard, AnswerOption, les en-têtes et le hub du jeu. Trois nouveaux : la ligne de classement (qui remplace PillarChip sur le résultat et la landing, tri serveur), le bug des maillots (trois petits SVG) et le tableau des points du moteur. Le gabarit Satori de l'image de partage est à réécrire. Environ 2 à 3 jours, tests de contraste et e2e visuels compris.
