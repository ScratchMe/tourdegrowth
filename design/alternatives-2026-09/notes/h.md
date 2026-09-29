# H · « Heure bleue » : notes de direction

## Thèse
La route au crépuscule : une nuit chaude, une serif fine couleur crème et une seule ligne fluo qui trace le parcours. C'est une direction-pont, plus « conseil » que « jeu » : elle quitte le papier sans quitter la route, et elle prolonge le monde de nuit qui existe déjà dans le jeu.

## Palette (contrastes WCAG calculés, composés sur le fond réel)
| Rôle | Couleur | Paires mesurées |
|---|---|---|
| Nuit (page du Tour) | `#0E0D0C` | — |
| Carte / carte haute | `#151311` / `#1E1B17` | — |
| Crème (texte) | `#EFE9DF` | 16,08 nuit · 15,35 carte · 14,85 haut du panneau crépuscule `#1B1613` |
| Gris (secondaire) | `#A39A8C` | 6,99 nuit · 6,67 carte · 6,17 carte haute |
| Crème discrète (crédit) | crème à 58 % | 5,76 carte · 5,88 nuit |
| **Lime (action, route du Tour)** | `#DFF21B` | 15,58 nuit · 14,87 carte · nuit sur lime (boutons) 15,58 |
| **Orange horizon (diagnostic)** | `#F0A33A` | 9,25 nuit · 8,83 carte · 8,42 sur le lavis braise `#1F1710` · nuit sur orange (tampons) 9,25 |
| Panneau heure bleue (moteur) | `#2B3A4F`, page `#101824` | crème 9,55 / 14,76 · **gris monté à `#C2B9AA` : 5,94 / 9,18** (l'ancien `#A39A8C` y faisait 4,15) · 4,95 sur la marche haute `#34465E` |
| Glace (ligne du moteur) | `#9AD3F5` | 7,15 panneau · 11,04 page |
| Orange dans le moteur | `#F0A33A` | 5,49 panneau · 8,49 page |
| Pleine nuit (jeu) | `#07070A`, carte `#121019` | crème 16,66 · gris 7,24 / 6,79 |
| Violet (ligne du jeu) | `#B78CFF` | 7,86 nuit · 7,37 carte |

**En-têtes mesurés au pixel sur le vrai ciel** (le pire pixel sous chaque texte, script `.h/header-contrast.mjs`) : minimum 6,16 (« · le Tour » gris, mobile), mot-symbole ≥ 10,6, liens de navigation ≥ 13, CTA 15,58. Le « 3 min restantes » du quiz passait à 2,76 sous la lueur : il est remonté en crème à 82 % (≥ 5,4).

**Marques non textuelles (≥ 3:1)** : bord des réponses du quiz (crème 42 %) 3,57 · bord du bouton secondaire (crème 50 %) 4,62 · cadre du prochain kilomètre (lime 45 %) 3,83 · bord des faiblesses (orange 60 %) 3,87 · bord des composants `#7A7165` 4,05 nuit / 3,86 carte ; dans le moteur `#95A1B3` 4,41 · cadre moteur (glace 55 %) 3,32 · zone jouable (violet 70 %) 4,26 · route lime ≈ 14,9 et pointillé orange ≈ 8,8 sur le panneau. **Décoratif, sous 3:1 par choix** : filets pointillés `#2E2A26`, courbes de niveau, ticks d'échelle, halo de l'étape qui cale, bords des cartes non interactives (crème 10-12 %), bord de l'encart du jeu, grain.

**Ce qui porte « action » et « diagnostic » sans le rouge** :
- **Action = lime** : boutons principaux (pilule lime, texte nuit), progression du quiz, anneau de focus, et le cadre du **prochain kilomètre** (le conseil est une action : il prend la couleur de la route à suivre, jamais celle du diagnostic).
- **Diagnostic = orange horizon** : « Une étape te freine », le nom et le score de l'étape qui cale, le tronçon pointillé orange de la route et « ça cale ici », les cartes « Là où tu perds du temps », l'accent du verdict du moteur, et les tampons « Sous le repère » / « Freine ici » du moteur, qui empruntaient jusqu'ici le rouge **de l'action** (le rouge disait les deux) et passent à l'orange.
- **Sélection = crème pleine** (langue, onglet choisi). Dans le Tour, la route et l'action partagent le lime à dessein : ici, la route *est* l'action. Dans le moteur et le jeu, le bouton reste lime et c'est la ligne qui change de couleur.

## Polices
- **Newsreader** 300 (et 300 italique, 400) pour les titres, le score, le mot-symbole « Tour de *Growth* ». Elle n'a ni `→` ni `▲ ▼ ●` ni U+202F, et pas de № : les flèches viennent d'Inter (boutons) ou de la mono, le № de la mono. À 212 px, `font-optical-sizing` prend la coupe display (opsz 72), d'où les déliés fins.
- **Inter** 400 pour le corps (400 plutôt que 500 : sur fond sombre le texte s'épaissit à l'œil), 600 pour les boutons.
- **JetBrains Mono** 500/600 pour les étiquettes, « /100 », l'horloge. Le sous-ensemble latin servi ici n'a pas le № (repli sur IBM Plex Mono dans la pastille « № 15 questions ») : le TTF complet l'a, à embarquer tel quel. U+202F → U+00A0 comme dans `deck.ts`.
- **Image de partage (Satori)** : Newsreader est variable (poids × opsz) ; il faut instancier des TTF statiques (300 opsz 72 pour le chiffre, 300 italique et 400 opsz ~24 pour le texte) et revérifier la table `cmap` du fichier livré. Aucun № ni signe moins dans l'image actuelle.

## Composant signature : le profil de route
Sur le résultat, un seul panneau crépuscule : « **74** » en Newsreader 300 à 212 px, « /100 » en mono grise, et à droite « Une étape te freine / *Retention* 8/20 ». Dessous, **les cinq étapes sont cinq points de passage sur une ligne lime qui monte et descend sur un relief sombre** : la hauteur de chaque point est son score sur 20 (échelle « 20 / 10 » discrète en marge), la courbe est monotone entre les points (pas de dépassement : elle ne suggère aucune valeur qui n'existe pas), et le relief sous la crête est tramé de courbes de niveau. **À l'étape qui cale, la ligne passe en pointillé orange**, un halo et « ça cale ici » la marquent. Les pastilles d'étape du produit (score, nom, bouton de définition) deviennent les légendes alignées sous chaque point. Le tracé est calculé en JS à partir des scores réels du DOM (pas un dessin figé) ; le même dessin sert à l'aperçu de la landing et à l'image de partage.

L'action devient **« Le prochain kilomètre »** : une borne kilométrique (chapeau lime) et un titre en serif italique, au-dessus de l'étiquette « Prochaine action · Retention · 8/20 » qui reste.

## Le signe des trois espaces : l'heure qu'il est
Chaque en-tête est **un ciel à son heure, découpé par une crête** : le sol de la page monte dans le ciel en silhouette de relief, et la crête est tracée dans la couleur de la ligne de l'espace. Sous la crête, une étiquette courte avec son pictogramme et une horloge :
- **Tour = crépuscule** — lueur orange chaude à l'horizon, ligne lime, soleil couché à demi. « Crépuscule · le Tour · 21:12 » / « Dusk · the Tour ».
- **Moteur = heure bleue** — ciel bleu profond, dernier reste orangé à l'horizon, panneaux `#2B3A4F`, ligne glace. « Heure bleue · le moteur · 21:47 » / « Blue hour · the engine ».
- **Jeu = pleine nuit** — noir profond étoilé, lueur violette, ligne violette, croissant de lune. « Pleine nuit · le jeu · 23:58 » / « Full night · the game ».

La couleur de la ligne suit l'espace partout où il y a une route : crête de l'en-tête, tiret des sur-titres, route du profil, filets de durée du moteur, fil des cinq zones du jeu, route du pied de page. **Un lien vers un autre espace prend l'heure de sa destination** : l'encart du jeu sur le résultat est en pleine nuit, avec « Pleine nuit · le jeu ». Sur la landing, un petit bloc « Un Tour, trois étapes » montre les trois ciels côte à côte (sans lien : il en attend l'ouverture).

## Ce qui change
- **Tour** (landing, quiz, résultat) : tout passe en nuit chaude. Le H1 en serif fine, « cale-t-elle ? » en italique orange (c'est la question du diagnostic). Le quiz devient une question posée calmement : serif 40 px, réponses à touches A/B/C, progression en pointillé avec cinq bornes et un damier d'arrivée. Le résultat est réorganisé : panneau score + route sur toute la largeur, prochain kilomètre, forces / faiblesses en deux colonnes, bandeau « Fais ton propre Tour », jeu et partage côte à côte.
- **Moteur** : même grammaire en bleu, pensée pour la densité : verdict en serif avec l'accent orange, puces de couverture en pilules, grilles de points lisibles sur le panneau, étape diagnostiquée en italique orange, tampons orange.
- **Jeu** (hub) : pleine nuit étoilée ; les cinq zones sont posées sur un fil violet pointillé, la zone jouable s'allume. Rien dans le design ne réduit le jeu à son premier niveau : le signe dit « le jeu », pas une entreprise.
- **Pied de page** : le mot-symbole géant « Tour ——— de *Growth* » de part et d'autre d'une route à moitié parcourue.
- **Image de partage** : ciel de crépuscule et crête lime en tête, « 74 » en serif, prochain kilomètre à droite, profil complet des cinq étapes (noms et scores) en bas, accroche en serif et `tourdegrowth.com` en pilule lime. Elle remplace l'aperçu sur la page de résultat.

## Risques
- **Tout en sombre** : la carte de partage perd le contraste papier dans un fil clair ; sur un fil sombre, elle tient mieux que l'actuelle.
- **La perte du papier** et de l'imprimé : c'est le prix de la direction. Le lien au Tour tient à la route, au relief et à la borne, des codes génériques du vélo, sans habillage d'organisateur.
- **Le lime** peut faire « SaaS générique » s'il se répand : il est réservé à l'action et à la route du Tour.
- **Deux nuits à accorder** : le niveau du jeu est une nuit chaude (`#14110D`), la pleine nuit du hub est plus froide et violette. Il faut choisir laquelle gagne.
- **L'horloge** (21:12, 21:47, 23:58) est un signe, pas l'heure réelle ; quelqu'un pourrait la lire comme une heure. On peut la retirer sans perdre le signe (le ciel suffit).
- **Serif fine sur fond sombre** : elle ne descend jamais sous 19 px ; tout texte courant reste en Inter.

## Coût d'une mise en œuvre réelle
- **Tokens** (la moitié du travail) : rebind complet du monde papier vers la nuit, trois « heures » comme trois mondes (`data-space`), échelle typographique, rayons, bordures 1 px, ombres douces.
- **Quelques composants** : en-tête (ciel, crête, signe), `Wordmark` (casse mixte en serif, le DOM est en capitales aujourd'hui), `ScoreDisplay`, un nouveau **`RouteProfile`** pur et testable (scores → tracé SVG, partagé avec Satori), `PillarChip` en légende, `PriorityMove`, `StageProgress`, `AnswerOption`, `SiteFooter`, tampons du moteur. L'image de partage est à réécrire sous Satori avec des instances statiques de Newsreader.
- **Aucune illustration** : pas de photo, tout est procédural (dégradés, crête en chemin SVG, route calculée), donc aucun poids d'image.
- **Copie à relire** (convention 6) : « Le prochain kilomètre / The next kilometre », « ça cale ici / it stalls here », « Crépuscule · le Tour » et ses deux sœurs, « Un Tour, trois étapes / One Tour, three stages ».
