# E « Le Journal du growth »

## Thèse

Le résultat se lit comme une page de quotidien économique : papier rosé, serif de titrage, filets, une cote, un tableau de cours, une « une » et « Notre conseil ». Le site devient un journal en trois rubriques, une par étape de la course : le Tour est « Le Diagnostic », le moteur « Les Chiffres », le jeu « Le Feuilleton ».

## Palette (contrastes mesurés, WCAG 2.x)

| Rôle | Couleur | Sur papier `#F6E9DA` | Sur papier clair `#FBF4EA` |
|---|---|---|---|
| Encre : texte, **action** | `#1A1714` | 14,95 | 16,34 |
| Gris : texte secondaire | `#5E574F` | 5,96 | 6,51 (5,36 sur `#EEDDC8`) |
| Bordeaux : **diagnostic** et rubrique Diagnostic | `#8E1B3A` | 7,43 | 8,12 (6,55 sur le lavis `#F1D8D3`) |
| Bleu nuit : rubrique Chiffres | `#1D3557` | 10,35 | 11,32 |
| Vert : rubrique Feuilleton (choisi ici) | `#22583D` | 6,95 | 7,60 |
| Filet fort : barres, repères, chiffres romains ≥ 32 px | `#8C7F72` | 3,26 | 3,57 |
| Filet : décoratif seulement | `#CFC2B0` | 1,47 | — |

- **Texte papier sur les drapeaux** : bordeaux 7,43, bleu 10,35, vert 6,95. Texte papier clair sur les boutons à l'encre : 16,34.
- **Bande du Feuilleton** : `#E5D6C3` sur le vert, 5,82.
- **Monde de nuit (le niveau du jeu)** : le bordeaux y tomberait à 2,12. Les marques d'alerte prennent un bordeaux de nuit `#E0768F`, à 6,42, 5,96 et 5,23 sur les trois fonds de nuit.
- **Graduations des mini-barres sur la ligne faible** : 2,87, donc décoratives. La valeur est imprimée en texte juste à côté.
- **Le papier n'est la teinte d'aucun titre** : il est plus beige et plus sombre que le saumon d'un quotidien connu. Aucune maquette de une réelle n'est reprise.

**Qui porte quoi.**
- **L'action, c'est l'encre** : tous les boutons pleins (Démarre ton Tour, Fais ton propre Tour, Entre tes chiffres, Jouer le niveau) et « Notre conseil », avec son drapeau noir et son filet de 5 px.
- **Le diagnostic, c'est le bordeaux** : « À la une » (l'étape qui freine), la ligne faible du tableau, les sur-titres de « Là où tu perds du temps », la fin du verdict du moteur et l'étape nommée par son diagnostic.
- **Le bordeaux ne remplit jamais un bouton.** Le bleu et le vert ne disent que la rubrique : ni action, ni jugement.

## Polices et réserves de glyphes

- **Rôles** :
  - Newsreader pour le titrage (axe `opsz` à 72) ;
  - Source Serif 4 pour le corps ;
  - Libre Franklin 600-700 pour les sur-titres, drapeaux, boutons et navigation ;
  - IBM Plex Mono pour la cote « /100 », les notes du tableau et le compteur du quiz.
- **Libre Franklin n'a pas de vraies petites capitales** (pas de `smcp`). Le navigateur les synthétise, ce qui passe à l'écran. **Satori ne sait pas le faire** : dans la vraie image de partage, les sur-titres deviendront des capitales à corps réduit.
- **Aucune des trois polices n'a U+202F, ▲, ▼ ni ●.** L'espace fine se remplace par U+00A0, comme dans `deck.ts`.
- **Si une vraie variation apparaît un jour** (« vs médiane »), ses flèches viendront de JetBrains Mono.
- **Libre Franklin n'a pas → non plus** : la flèche des boutons tombe sur une police de repli. En vrai, il faut une SVG ou Inter.
- **Le № du dossard vient de la mono de next/font**, comme aujourd'hui. Les sous-ensembles web du harnais ne l'ont pas. D'après la planche §3, les TTF complets de Newsreader et de Libre Franklin l'ont, **à revérifier sur le fichier livré**.
- **Satori ne lit pas les polices variables** : il faut des TTF statiques de Newsreader (800, 700, 500 et 400 italique, `opsz` 72).

## Composant signature : la page du résultat

- **La cote** : « 74 » en Newsreader 800 à 168 px, suivi de « /100 » en mono dans un cartouche. **Aucune variation n'est affichée** : la page n'a pas de comparaison réelle, et rien n'a été inventé.
- **À la une** : l'étape qui freine, dans un encadré bordeaux dont le drapeau est posé sur le filet. Le titre « Retention » est en Newsreader 46 px et le verdict en chapô italique.
- **Tableau de cours** : les cinq étapes, avec la note en mono et une mini-barre à l'encre graduée tous les 5 points. La ligne faible est en bordeaux sur un lavis, avec un filet à gauche.
- **Notre conseil** : un drapeau noir et une lettrine sur deux lignes. C'est l'action.
- **Le Roast devient un billet signé** : verdict en italique, filet bordeaux, signature « — Le chroniqueur » / "— The columnist", jamais un nom. Captures hors livrable : `work-e/roast-d.png` et `work-e/roast-m.png`.
- **L'image de partage est une une** (`share-fr.png`, `share-en.png`), dans cet ordre :
  - le folio ;
  - le titre « TOUR DE GROWTH » avec ses filets gras et maigre ;
  - le drapeau de rubrique et l'adresse ;
  - la manchette « **Retention** est là où cette croissance cale. *Et la tienne ?* » ;
  - la cote, puis « Notre conseil ».
  L'aperçu de partage de la page de résultat montre cette une : `e.js` l'embarque en data-URI.

## Le signe des trois espaces : les rubriques du journal

- **Sous le titre, une bande de rubriques** : « 1 Le Diagnostic · 2 Les Chiffres · 3 Le Feuilleton ».
  - La rubrique courante est un **drapeau plein** à sa couleur : bordeaux, bleu nuit, vert.
  - Les deux autres restent visibles, avec un carré de couleur et leur nom en gris.
  - Les trois étapes se lisent donc partout, et on sait où l'on est.
- **Au-dessus, la ligne de folio** : « Édition française / English edition », la devise « Un Tour, trois étapes », puis le sélecteur de langue.
- **Page par page** :
  - landing, quiz et résultat : drapeau bordeaux ;
  - moteur : drapeau bleu ;
  - hub du jeu : drapeau vert.
- **La couleur de rubrique teinte aussi les sur-titres et le filet haut des encadrés** de l'espace : l'encadré de confidentialité du moteur, la zone jouable du jeu.
- **Renvois entre rubriques** :
  - l'encart du jeu sur le résultat porte le drapeau « Le Feuilleton » (bande verte) ;
  - le retour au Tour du hub porte la puce « Le Diagnostic » ;
  - la une (la landing) a un sommaire « Dans ce numéro » qui annonce les trois rubriques. **C'est la bande « la suite du Tour » de l'option A.**
- **Le Feuilleton, ce sont les cinq entreprises** (chapitres I à V), jamais le seul niveau jouable.
- **Au téléphone**, les numéros disparaissent de la bande pour qu'elle tienne sur une ligne ; le compteur du quiz passe dans le folio.

## Ce qui change par espace

- **Tour.**
  - **La landing devient une une** : manchette « Où ta croissance / *cale-t-elle ?* » (fin en italique bordeaux), chapô et appels à l'encre dans la colonne de gauche, citation en exergue et sommaire dessous, et à droite l'encadré d'exemple avec la même cote, la même une, le même tableau et le même conseil que le résultat.
  - **Le quiz devient un questionnaire de lecteur** : question en titrage, réponses lettrées A, B, C, progression en filets.
- **Moteur** : une page « marchés ».
  - Titre sur toute la largeur, article à gauche, encadré de confidentialité en colonne.
  - Le tableau « Combien de temps ça prend » est un vrai tableau à colonnes filetées ; au téléphone, il passe à deux colonnes, intitulé et texte.
  - Le verdict du tableau de bord est en titrage, sa fin en italique bordeaux.
- **Jeu** : le hub est un feuilleton.
  - Titre en italique, chapitres I à V en chiffres romains, zones à venir en gris.
  - La zone jouable est un encadré à filet vert.
  - Le monde de nuit du niveau n'est pas redessiné : seul son rouge d'alerte est rendu lisible (voir la palette).

## Risques

- **La parenté « presse économique »** : papier rosé et titre en capitales à empattements. Rien n'est repris d'un titre existant, mais c'est le registre qui fait penser à un journal précis.
- **Moins de sport, moins de fun** : le vélo ne survit que dans « Tour » et les étapes numérotées. La direction reste proche de B par le papier.
- **Densité** : petites capitales synthétisées à 11-13 px et tableaux au téléphone. C'est lisible dans les captures, mais c'est la zone à surveiller.
- **Texte ajouté, à relire (convention 6)** : folio, devise, noms de rubriques, « À la une », « Notre conseil », « Les cinq étapes / Note sur 20 », « Dans ce numéro » et ses trois lignes, « Le chroniqueur ».
- **Une bande de rubriques non cliquable n'a pas de sens en vrai** : elle deviendrait la navigation des trois espaces, ce qui suppose le moteur et le jeu ouverts.
- **L'encart du jeu sur le résultat** garde sa propre copie produit, qui cite l'appli de streaming. Le drapeau ajouté, lui, nomme le feuilleton.

## Coût d'une vraie mise en œuvre

- **Jetons** : palette, trois polices via next/font, rayons à 0, filets de 1 px, plus d'ombres. Cela fait environ 40 % de l'effet.
- **Une dizaine de composants** :
  - un en-tête « masthead » unique avec une prop `section`, qui remplace les quatre en-têtes actuels ;
  - des variantes « À la une » pour `Bottleneck`, « Notre conseil » pour `PriorityMove` et « ligne de tableau » pour `PillarChip` ;
  - la bande de `GameEntry` ;
  - les grilles de la landing (exergue, sommaire), de l'intro du moteur et de la liste du hub ;
  - le gabarit Satori de la une, avec des TTF statiques.
- **Aucune illustration.**

## Fichiers

- `designs/e.css` : la direction.
- `designs/e.js` : le DOM décoratif. Il est généré par `work-e/build.mjs` depuis `work-e/e.src.js`, qui embarque une une réduite de moitié.
- `share/e-fr.html`, `share/e-en.html` et leur feuille commune `share/e-une.css`.
- `shots/e/` : les captures.
