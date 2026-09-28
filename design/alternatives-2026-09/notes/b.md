# B « Affiche et carnet de route » — notes

## Thèse
Le Tour d'avant-guerre et des Trente Glorieuses, tiré en sérigraphie : papier chaud, deux encres par affiche, trames de points, profils d'étape au trait, bornes kilométriques. Le produit devient une série d'affiches. Chaque espace est une affiche de la même série, tirée avec une seconde encre différente.

## Palette (contrastes WCAG mesurés)
| Paire | Ratio | Usage |
|---|---|---|
| encre `#1E1912` / papier `#F3EAD3` | 14,56 | texte courant |
| encre / carte `#FAF4E4` · pierre `#FFFBF2` · creux `#EADFC4` | 15,90 · 16,90 · 13,18 | cartes, borne, colonne du carnet |
| sépia `#6B5E4A` / papier · carte · creux | 5,27 · 5,75 · 4,77 | texte secondaire |
| rouge `#B8321C` / papier · carte | 4,99 · 5,45 | titres, marques, accent du H1 |
| rouge profond `#9E2A17` / papier · carte | 6,26 · 6,84 | petit texte rouge (diagnostic) |
| carte / rouge | 5,45 | boutons, bandeau du Tour, chapeau de la borne, onglet « Prochaine action » |
| outremer `#1D3F8F` / papier ; carte / outremer | 8,11 ; 8,85 | moteur : bandeau, étiquettes |
| encre / ocre `#D99A2B` | 7,16 | jeu : bandeau, puce active |
| ocre / papier | 2,04 | **fond seulement** : jamais de texte, toujours bordé d'encre |
| nuit : texte `#F3EAD3` · sourd `#BFB195` · ocre `#E6AB3C` / `#241E17` | 13,76 · 7,81 · 8,06 | bande de l'encart jeu, panneau de nuit du hub |

Marques non textuelles : rouge sur papier 4,99, outremer 8,11, trait de nuit 4,04 (tous ≥ 3). Un script a relu chaque nœud de texte des 14 captures : aucun sous 4,5 (ou 3 en grand), et aucun défilement horizontal à 390 px.

## Polices et réserves de glyphes
- **Big Shoulders Stencil** 800/900 : titres, mot-symbole, bandeaux. Son « 4 » pochoir a une barre détachée qui se lit « 4· » à grande taille (Stardos a le même défaut). **Les chiffres de la borne et des étapes passent donc en Big Shoulders plein**, de la même famille et de la même chasse, comme la peinture d'une vraie borne.
- **Source Serif 4** : corps de texte et questions. C'est la police la plus complète (U+202F compris). Il lui manque seulement ●.
- **IBM Plex Mono** : données, étiquettes, carnet de route. Le signe moins U+2212 sert au profil (« −12 »).
- Le № et la flèche → existent dans les polices complètes, mais pas dans les sous-ensembles latins du harnais, où ils tombent en police de repli. Au passage réel, il faut les inclure au sous-ensemble next/font et aux TTF statiques de Satori (800/900 pour le pochoir, 900 pour le plein, 400/600 pour le serif).

## Composant signature
- **La borne** : le score est une pierre à chapeau rouge. Le chapeau porte « Score growth global », le fût porte « 74 » puis « /100 » sous un filet. Elle a une ombre hachurée et un socle. Tout est en CSS sur `ScoreDisplay`, sans nouveau DOM.
- **Le profil de l'étape** remplace la grille des cinq piliers. La hauteur de chaque col vaut les points manquants sur 20, et c'est écrit sur la carte. Le col qui freine est tramé en rouge, marqué « HC » et tracé en rouge. Les étiquettes « −2, −8, −12… » donnent la « pente ». L'axe va de 0 à 15 km : 15 questions, 3 par étape. Le profil est déterministe, calculé depuis les scores affichés : aucune précision inventée.
- **La trame** marque les zones faibles, en lisière et jamais sous le texte : frange des cartes « Là où tu perds du temps », col HC.
- **Le carnet de route** du quiz : colonne « km 1 » avec tulipe, repère « KM 1 — Q1 », réglette 0-15 km avec un curseur, options A/B/C.
- **L'affiche de partage** : deux encres sur papier. La borne se dresse sur la route devant un soleil tramé, avec l'action en serif, le profil et son col HC, l'accroche en pochoir. Le cadre de partage du résultat montre cette affiche.

## Le signe des trois espaces
Un **bandeau d'étape** sous chaque en-tête, en aplat de la couleur de l'espace. Sa lisière est tramée, comme une affiche en deux tons. Il porte le pictogramme du type d'étape du carnet de route, « Étape n/3 · type » et le nom de l'espace. À droite, la course entière (1 · 2 · 3), où l'étape courante est inversée.
- **Tour** (landing, quiz, résultat) : étape de **plaine**, rouge. Pictogramme : profil plat et drapeau d'arrivée.
- **Moteur** : **contre-la-montre**, outremer. Pictogramme : chrono. Une grande affiche de chrono accompagne l'intro.
- **Jeu** : étape de **montagne**, ocre, avec texte encre. Pictogramme : sommets. Le profil des cinq cols est un panneau de nuit, lune ocre, col ouvert en ocre ; sa légende dit « cinq cols, cinq entreprises ».

La règle s'applique partout : le mot-symbole géant du pied de page est tramé dans l'encre de l'espace, et l'encart qui mène au jeu depuis le résultat porte déjà le pictogramme montagne en ocre. Sur téléphone, le bandeau passe sur deux lignes et la course disparaît. Sous 940 px de large, la course garde ses pictogrammes et perd ses libellés.

## Ce qui change par espace
- **Tour** : H1 en pochoir capitales. La vignette de la landing (soleil tramé, deux chaînes hachurées, route, petite borne) remplit la colonne sous les CTA. Rayons gravés derrière l'exemple. Résultat : borne, profil, action en onglet rouge.
- **Moteur** : même grammaire, seconde encre outremer : étiquettes, filets des durées, encadré de confidentialité, filet tramé du tableau de bord. Le verdict garde son accent rouge (diagnostic). Les pages denses restent en serif lisible, sans trame sous les chiffres.
- **Jeu** : ocre comme fond seulement. Les zones à venir sont en pointillé sépia, la zone ouverte a une lisière ocre et une ombre pleine. Le bouton reste rouge (action).
- **Grammaire du rouge conservée** : action (boutons), diagnostic (col HC, cartes faibles, étiquette « Une étape te freine », accent du verdict), conseil (carte d'action).

## Risques
- **Dans le Tour, le rouge est à la fois le signe de l'espace et le sens** (action, diagnostic). Le bandeau, le chapeau de la borne, le soleil de la vignette et le mot-symbole du pied de page sont rouges par décor. Dans le moteur et le jeu, le rouge ne garde que son sens.
- **Lourdeur** : l'affiche tient sur les cinq écrans vus. Il faut la vérifier sur l'admin, le glossaire et le bas du moteur (non capturés).
- La borne et le nom de l'étape tiennent pour « Retention ». Un goulot long (« Acquisition ») demandera un corps plus petit.
- L'aiguille du chrono est décorative : quelqu'un pourrait la lire comme une durée.
- L'image de partage affiche maintenant le profil, donc les cinq scores. Ils sont déjà publics sur `/r/<id>`, mais la garde de payload (convention 11) doit les compter.
- Le mode « Roast » n'a pas été capturé.

## Coût d'une vraie mise en œuvre
- **Jetons** (petit) : palette, rayons, polices via next/font, couleur par espace (`data-space`).
- **Quelques composants** (moyen) : bandeau d'étape dans les trois en-têtes, borne (CSS de `ScoreDisplay`), `StageProfile` en SVG pur calculé depuis les scores (testable unitairement), colonne du carnet de route, onglet de `PriorityMove`.
- **Illustration** (réel) : la vignette de la landing, le chrono, le panneau de nuit et l'affiche de partage. Tout est déjà tracé de façon procédurale en SVG, mais il faut les figer en assets. Satori ne lit ni `mask` ni `conic-gradient` : les trames (rayons, points) doivent être pré-rendues en PNG.
