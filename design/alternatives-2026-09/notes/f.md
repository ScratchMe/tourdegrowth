# F · « L'arcade du côté obscur »

## Thèse
Le growth comme un jeu vidéo : le score devient une barre de vie, les cinq étapes deviennent des niveaux, l'étape qui freine est le **boss** et l'action est la **quête**. Le produit et le jeu « Le côté obscur » parlent enfin la même langue : un Tour en trois mondes, chacun avec les cinq mêmes niveaux AARRR.

## La grammaire des couleurs : qui dit quoi
- **Action = jaune `#FFD84D`.** Tous les boutons pleins (bloc pixel avec ombre interne), la quête (l'action du résultat), les liens. Le jaune ne dit jamais « bien » ni « mal ».
- **Diagnostic = magenta `#FF3E9A`.** Le boss (l'étape qui freine), sa part de la barre de vie, les cartes « Là où tu perds du temps », la fin du verdict du moteur, le mode difficile. Il est toujours accompagné d'une forme (tête de mort, étiquette « BOSS »), jamais seul.
- **Donnée = crème `#F5F3EE`** sur la nuit, **encre nuit `#1B1030`** sur le monde clair : chiffres, barres, textes.
- **La couleur du monde** (cyan, vert, magenta) ne dit que **où l'on est** : le badge, le sol, les numéros de niveau, l'accent du mot-symbole.

## Palette et contrastes mesurés (WCAG 2.x)
| Paire | Ratio |
|---|---|
| Crème `#F5F3EE` sur nuit `#1B1030` / carte `#241641` | 16,28 / 14,96 |
| Lavande (texte secondaire) `#B4A9D3` sur nuit / carte / lavis boss `#3A1846` | 8,21 / 7,55 / 6,83 |
| Jaune sur nuit / carte ; nuit sur jaune (boutons) | 13,05 / 11,99 ; 13,05 |
| Cyan `#3FD0FF` sur carte ; nuit sur cyan (badge Monde 1) | 9,22 ; 10,04 |
| Vert `#79E274` sur carte ; nuit sur vert (badge Monde 2) | 10,22 ; 11,13 |
| Magenta sur nuit / carte (grand texte, marques) ; nuit sur magenta (badge Monde 3, étiquette BOSS) | 5,51 / 5,06 ; 5,51 |
| Magenta clair `#FF6FB2` (petit texte de diagnostic) sur carte / lavis | 6,45 / 5,84 |
| **Monde clair (moteur)** : encre sur `#F5F3EE` / blanc | 16,28 / 18,05 |
| Encre secondaire `#554C6E` sur clair / blanc / `#EAE6DC` | 7,16 / 7,94 / 6,37 |
| Vert texte `#1A6E34` sur clair / blanc | 5,70 / 6,32 |
| Magenta foncé `#B8166A` (diagnostic du moteur) sur clair / blanc / lavis `#FBE3EE` ; blanc dessus | 5,63 / 6,25 / 5,15 ; 6,25 |
| Marques : cellule allumée crème / magenta contre cellule vide `#3B2C66` | 10,90 / 3,69 |
| Cadres : lavande de contrôle `#8C7CC6` sur nuit ; lavande passive `#6B5A9E` sur nuit | 5,00 ; 3,08 |

Le vert pixel, le cyan et le jaune ne servent **jamais** de texte ni de trait seul sur le monde clair (1,25 à 1,62) : ils y sont toujours cernés d'encre. Le bleu ciel `#2D8EE6` de la planche n'est pas utilisé.

## Polices et réserves de glyphes
- **Pixelify Sans** : titres courts seulement (titre de l'accueil, « Le côté obscur », nom du boss, mot-symbole, « Monde 1 », « PV »). **Trouvé en maquette : son C ferme son ouverture sur un pixel.** En capitales, « CROISSANCE » se lit « OROISSANOE » à toutes les tailles, et en minuscules le « c » devient un « o » sous 32 px environ. Règle : **toujours en casse de phrase, jamais sous 32 px dès qu'un c est possible**. Les intertitres passent donc en Bricolage. Pixelify n'a ni → ni ● ▲ ▼ ni U+202F.
- **Bricolage Grotesque** : le corps, les boutons et tous les titres du moteur. Elle a → et U+202F, mais ni ● ▲ ▼ : ces formes sont dessinées en SVG.
- **JetBrains Mono** : tous les chiffres (74, /100, 18/20, 3-1), les étiquettes et les badges. Le signe moins U+2212 est présent. U+202F manque : on le remplace par U+00A0, comme `deck.ts`. **Le № n'est pas dans le sous-ensemble latin web** : ici, celui de « № 15 questions » retombe sur IBM Plex Mono. À vérifier sur le TTF embarqué.
- Carte de partage (Satori) : les trois familles sont variables, il faut donc un TTF statique par graisse. Satori ne sait faire ni `border-image` ni `mask` : les cadres crantés et les icônes y deviennent des SVG en data-URI.

## Composant signature : l'écran de résultat en HUD
- **« PV 74/100 »** : un cœur pixel, « 74 » en JetBrains Mono 800, et une **barre de vie segmentée faite des cinq niveaux** (cinq groupes de dix cellules, deux points par cellule). La barre, c'est la somme des cinq notes : 18 + 12 + 8 + 16 + 20. Elle se ré-explique donc en dix secondes et n'invente aucune précision (une note impaire donne une demi-cellule).
- **Les niveaux** : chaque puce d'étape devient une ligne « 1-1 Acquisition ▮▮▮▮▮▮▮▮▮▯ 18/20 » avec sa barre d'XP, qui est le même groupe de cellules que dans la barre de vie.
- **Le boss** : « ☠ BOSS 1-3 » sur l'étape qui freine. Son nom est en Pixelify magenta, et sa part de la barre de vie comme sa ligne passent en magenta.
- **La quête** : l'action dans une boîte de dialogue à double cadre jaune, étiquette « ! QUÊTE » / "! QUEST".
- **Le Roast = mode difficile** : sur l'aperçu de l'accueil, le sélecteur de ton se lit « Difficulté : Neutre | Roast me 🔥 ». En Roast, la carte passe au cadre magenta et porte « ☠ MODE DIFFICILE » / "HARD MODE". Captures hors livrable : `work-f/roast-d.png` et `work-f/roast-m.png`.
- **La carte de partage est un écran de jeu** : un HUD en haut (mot-symbole, badge Monde 1, « DIAGNOSTIC AARRR — 3 MIN »), le sol pixel, la barre de vie, « Retention est là où cette croissance cale. » et « Et la tienne ? » en jaune, façon « CONTINUE ? ». En bas, la quête dans sa boîte de dialogue, avec tourdegrowth.com en invite ▼. L'aperçu de la page de résultat affiche cette image.

## Le signe des trois espaces : trois mondes
- **Monde 1 · Le Tour** en cyan, icône drapeau ; **Monde 2 · Le moteur** en vert pixel, icône histogramme ; **Monde 3 · Le jeu** en magenta, icône croissant de lune (le monde de nuit du niveau).
- **Dans l'en-tête de chaque espace** : un badge HUD cranté (tuile d'icône et libellé sur la couleur du monde, texte encre nuit), un **sol tramé en pixels** de la couleur du monde sous l'en-tête (sur le monde clair, posé sur une ligne d'encre), et « GROWTH » à la couleur du monde. Sur mobile, le badge garde l'icône et « MONDE 1 ».
- **La numérotation des niveaux porte le monde** : 1-1 à 1-5 dans le Tour (sur la barre de vie, les lignes d'étape, la progression du quiz), 2-1 à 2-5 sur les onglets du moteur, et 3-1 à 3-5 dans le hub du jeu. La planche proposait « Monde 1 : Acquisition », qui entrait en collision avec les mondes-espaces. La notation monde-niveau des jeux de plateforme résout la collision.
- **Un lien vers un autre espace porte le badge de sa destination** : l'encart du jeu sur le résultat porte « MONDE 3 · LE JEU », et « Où en est ta croissance ? » dans le hub porte « MONDE 1 · LE TOUR ».
- **L'accueil montre la carte** : « Un Tour, trois mondes », trois cartes reliées par un chemin pointillé (Tu es ici / Ensuite / Pour finir). Chacune a sa rangée de cinq niveaux ; celle du jeu montre 3-3 ouvert et quatre niveaux à venir, sans jamais décrire le jeu par ce seul niveau.

## Ce qui change par espace
- **Tour (monde de nuit violette)** :
  - l'accueil est un écran-titre : titre Pixelify, bouton « bloc » jaune, et « Le parcours · 5 niveaux », un profil d'étape en pixels avec cinq drapeaux (un code cycliste générique) ;
  - le quiz est une boîte de dialogue de RPG : cadre crème double, plaque de nom « Étape 1 sur 5 — Acquisition », invite ▼ jaune, réponses en menu avec curseur ▶, progression en niveaux 1-1 à 1-5 ;
  - le résultat est décrit plus haut.
- **Moteur (monde clair, calme)** :
  - aucune typo pixel dans la donnée : titres et verdict en Bricolage, en casse de phrase (le verdict ne crie plus en capitales), chiffres du peloton en JetBrains Mono ;
  - le pixel n'apparaît que dans les accents : cadres crantés, carrés verts, ombre verte de la carte de confidentialité, filet vert du verdict ;
  - l'intro passe sur deux colonnes pour occuper la largeur ;
  - c'est l'espace qui part en CODIR, et il doit en supporter la lecture.
- **Jeu (monde de nuit, magenta)** : le hub devient un écran de sélection de niveau. Les tuiles 3-1 à 3-5 sont reliées par un chemin ; les quatre niveaux à venir sont en pointillé avec un cadenas, et le niveau jouable est allumé, avec un halo magenta et « Jouer le niveau » en jaune. Le titre « Le côté obscur » est en Pixelify, avec une ombre pixel.

## Risques
- **Le ton.** Le pixel peut sembler ludique devant un public CODIR. La maquette le contient : Pixelify est réservé à quelques titres, tout le texte est en Bricolage, et le moteur reste clair et sobre. Mais c'est le pari de la direction. Si Antoine hésite, le repli naturel est celui de la planche : F comme **habillage du seul jeu** (Monde 3) et de la carte de partage.
- **Le magenta a deux rôles** : le diagnostic et la couleur du monde du jeu. Les deux disent « là où ça fait mal » (le boss, le côté obscur), mais le badge « MONDE 3 » et le boss peuvent se croiser sur le résultat (encart du jeu). Garde-fou : le diagnostic porte toujours la tête de mort et « BOSS ».
- **La lisibilité de Pixelify** (le C fermé) : c'est une contrainte de rédaction, puisque tout titre en Pixelify doit être relu à sa taille réelle.
- **Le Tour passe de nuit** : le texte long sur fond sombre fatigue davantage. Le corps reste à 14,96:1 et le secondaire à 7,55:1, mais c'est un changement d'identité fort pour la page qui convertit.
- **L'ordre de lecture** : dans les lignes de niveau, l'ordre visuel est inversé en CSS grid (nom avant note). En vrai, il faut l'ordonner dans le DOM.
- **L'accueil annonce des espaces encore fermés** : le moteur et le jeu sont derrière leur drapeau en production, et la carte « trois mondes » attend leur ouverture.
- **Hors périmètre, vu en passant** : la copie de l'encart du jeu sur le résultat (« joue une année comme PM growth d'une appli de streaming ») décrit le jeu par son seul niveau. C'est à revoir côté copie. Le libellé « Roast me 🔥 » pourrait devenir « Difficile 🔥 », à relire par Antoine.

## Coût d'une vraie mise en œuvre
**Des jetons, quelques composants et un peu de pixel, sans illustrateur.**
- **Les jetons** : la palette par monde (nuit ou clair), trois polices `next/font`, les rayons à 0 et un utilitaire de cadre cranté (un SVG 7×7 en `border-image`).
- **Les composants** :
  - à restyler : l'en-tête et son badge de monde avec le sol, `Button`, `ScoreDisplay` (et la barre de vie), `PillarChip`, qui devient une ligne de niveau avec sa barre d'XP (ordre dans le DOM), `Bottleneck` (boss), `PriorityMove` (quête), `QuestionCard` et sa plaque, `StageProgress` et les tuiles du hub ;
  - à créer : la carte « trois mondes » et le parcours de l'accueil.
- **Le pixel** : onze icônes de 9×9 écrites en cartes ASCII, avec le profil d'étape et le relief du pied de page générés par code. Aucun dessin à commander.
- **La carte de partage** : le gabarit Satori est à réécrire (cadres et icônes en SVG, TTF statiques), et le № et le signe moins sont à vérifier sur les fichiers livrés.
- **Estimation** : trois à quatre sessions, contrastes et e2e visuels compris.

Source de la maquette : `work-f/f.src.css`, `work-f/f.src.js` et `work-f/share-tpl.html`, assemblés par `work-f/make.sh`.
