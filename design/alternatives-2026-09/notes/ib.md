# IB · I en base, les signes de B

**Thèse.** La marque d'aujourd'hui, en mieux (I), à laquelle on ajoute les signes de course de B : un bandeau d'étape qui dit dans quel espace on est, une borne kilométrique qui porte le score, et un profil d'étape qui montre où ça cale. On garde la base propre de I, sans la texture d'affiche de B.

## Ce qui vient de I (toute la base)
- La palette (papier `#FCFAF4` / `#EBE5D7`, encre `#1D1812`, gris `#564E41`) et le rouge, avec ses trois sens : action, diagnostic, conseil.
- Les polices : Stardos Stencil pour les titres, Inter pour le texte, IBM Plex Mono pour les étiquettes et les chiffres. Pas de Source Serif, ni de Big Shoulders.
- L'échelle de titres, les rayons (12 / 14 / 18 px), les pilules, les ombres dures.
- L'en-tête collant en verre dépoli, et le grain du papier.
- Les puces d'étape avec leur jauge.
- La bande « Un Tour, trois étapes » de l'accueil.
- Le mot-symbole géant du pied de page.
- La mise en page de l'image de partage.

## Ce qui vient de B
1. **Le bandeau d'étape**, désormais LE signe des trois espaces. Il est accroché sous l'en-tête collant et reste donc visible au défilement. Il porte :
   - le pictogramme du carnet de route ;
   - « Étape n/3 · type » et le nom de l'espace ;
   - à droite, la course entière (1 · 2 · 3) en pilules, l'étape en cours inversée.

   **Les dossards de I quittent l'en-tête.** L'étiquette « № 15 questions » de l'accueil reste. La bande « trois étapes » de l'accueil reprend les pictogrammes et les couleurs du bandeau : le signe est le même partout.
2. **Le moteur en outremer** (`#1D3F8F`), à la place du papier millimétré de I :
   - bandeau outremer ;
   - étiquette « Le moteur » et encadré de confidentialité à ombre bleue ;
   - filets des durées et filet du tableau de bord ;
   - un chrono au trait à côté de l'intro.

   Le fond redevient le papier uni : le moteur reste lisible. Le verdict garde son rouge, parce que c'est un diagnostic.
3. **Le jeu en ocre** : bandeau ocre, texte encre. L'intro du hub est une affiche de nuit, avec une trame d'étoiles, une lune ambre et le **profil des cinq cols**. Le col ouvert est ocre et marqué d'un drapeau. La légende dit « cinq cols, cinq entreprises » : rien ne décrit le jeu par son seul niveau jouable.
4. **Le résultat :**
   - **La borne** porte le score : pierre claire, chapeau rouge qui porte « Score growth global », puis « 74 » et « /100 » sous un filet. Elle est dessinée au trait propre de I (bord 2,5 px, ombre dure, socle arrondi), sans hachures.
   - **Le profil de l'étape** est posé en tête de la colonne des cinq puces. La hauteur de chaque col vaut les points manquants sur 20, et c'est écrit sur la carte. Chaque col porte son écart (« −8 »). Le col qui freine est teinté du lavis rouge, tracé en rouge et marqué « HC ». Il est déterministe, calculé depuis les scores affichés. Les puces à jauge de I restent dessous : le profil montre la forme, les puces donnent les chiffres.
5. **L'image de partage** garde la mise en page de I : en-tête, grand chiffre à gauche, action en carte pointillée rouge, accroche et adresse en bas. La borne remplace le chiffre nu, le profil remplace le mini-rail, et une pilule « Étape 1 · Le diagnostic » remplace le dossard.

**Le chiffre de la borne est en Stardos Stencil**, pour la cohérence avec I. Il se lit bien, avec la même réserve qu'aujourd'hui : le « 4 » de Stardos a une barre détachée qui fait un petit point à droite (« 74· »). C'est déjà le cas en production, donc ce n'est pas une régression, et Plex Mono garde « /100 ». Si ce point gêne, Big Shoulders plein (le choix de B) le supprime, mais au prix d'une deuxième police de titrage.

## Les deux variantes du bandeau du Tour
- **`ib`, bandeau rouge** (comme B). Le signe du Tour est le plus fort, et la course 1 · 2 · 3 se lit en couleurs : rouge, bleu, ocre. Le prix : sur les écrans du Tour, le rouge décore aussi. Il prend alors un quatrième rôle, « ici c'est le Tour », à côté de l'action, du diagnostic et du conseil, et le bouton rouge ressort moins sous un bandeau rouge.
- **`ib-ink`, bandeau encre.** Seul le pictogramme reste rouge : c'est une marque, pas du texte. Le rouge redevient exclusivement action, diagnostic et conseil. Le Tour se reconnaît au noir, comme l'encre de la marque, face au bleu et à l'ocre des deux autres espaces. Le prix : la course perd sa couleur « rouge = Tour » et le signe du Tour est plus discret.

Recommandation : **`ib-ink`**. La grammaire du rouge est la raison d'être de I, et le bandeau reste un signe net grâce au pictogramme et au nom de l'étape.

## Contrastes des paires nouvelles (WCAG 2.x, calculés)
| Paire | Ratio | Usage |
|---|---|---|
| papier-0 `#FCFAF4` / rouge d'action `#CC3E2B` | 4,69 | texte du bandeau du Tour (`ib`), chapeau de la borne |
| rouge profond `#A32E1F` / papier-0 | 6,78 | pastille active du bandeau du Tour, « RET. » et « −12 » du profil |
| papier-0 / outremer `#1D3F8F` | 9,32 | texte du bandeau moteur |
| outremer / papier-0 · papier-1 | 9,32 · 7,74 | étiquettes et intertitres du moteur |
| encre / ocre `#D99A2B` | 7,22 | texte du bandeau jeu |
| ocre / papier-1 | 1,94 | **fond seulement**, toujours bordé d'encre |
| papier-0 / encre | 16,88 | texte du bandeau `ib-ink` |
| rouge route `#D2402C` / encre | 3,78 | pictogramme de `ib-ink` : une marque (≥ 3), jamais du texte |
| rouge route / papier-0 | 4,46 | tracé du col HC, marque |
| rouge route / lavis `#F3D9D2` | 3,47 | tracé du col HC sur son lavis, marque |
| gris `#564E41` / papier-0 | 7,85 | légendes du profil |
| ambre `#F0B43C` / nuit `#15110D` | 10,11 | légende et drapeau du hub |
| `#C9BFAE` / nuit | 10,33 | légende secondaire du hub |
| ocre / nuit | 7,70 | col ouvert, marque |

## Vérification sur les captures (`work/audit.mjs`, 2026-09-28)
Le script relit chaque nœud de texte visible des 7 écrans, aux deux largeurs, et compose une couleur translucide sur son fond réel. Il lit le `fill` pour le texte SVG et prend le fond de nuit pour l'intro du hub.
- **`ib` comme `ib-ink` : 0 texte sous le seuil AA** sur les 7 écrans en 1 280 px (78 à 527 nœuds par écran).
- **En 390 px**, une seule alerte par écran : « GROWTH » du mot-symbole, à 15 px, mesure 4,26 sur l'en-tête en verre. C'est un logotype, que WCAG 1.4.3 exempte. La production est à 3,57 au même endroit : l'en-tête plus clair de I l'améliore déjà.
- **Aucun défilement horizontal** : `scrollWidth` vaut 1 280 et 390 partout. Le seul élément qui dépasse est la table masquée du moteur, dans un conteneur de 1 px en `overflow: hidden`, et elle dépasse déjà en production.
- **Corrigé pendant les passes** :
  - la carte d'aperçu de l'accueil débordait à 502 px en mobile : la grille borne + goulot n'était pas placée ;
  - la pastille active du jeu était invisible, encre sur encre ; elle passe en ocre sur encre (7,22) ;
  - la pastille « Contre-la-montre » de la bande de l'accueil poussait « Ensuite » à la ligne ; le type d'étape y est masqué en desktop ;
  - les étoiles de l'intro du jeu, trop denses sous le texte, sont éclaircies ;
  - la lune chevauchait la légende du profil en mobile.

## Coût d'une vraie mise en œuvre, composant par composant
| Composant | Travail | Taille |
|---|---|---|
| Jetons | Les jetons de I (rayons, échelle, ombres, grain) et trois couleurs d'espace (`--space-accent` par `data-space`) | petit |
| `StageBand` (nouveau) | Rendu dans `page.tsx`, `ResultView`, le quiz et `ContentHeader` ; trois pictogrammes SVG ; libellés FR/EN dans le dictionnaire (à relire, convention 6) ; `aria-hidden` ou un vrai `nav` de la course, à trancher | moyen |
| En-tête | Collant en verre dépoli (I), sans dossard | petit |
| `ScoreDisplay` → borne | Du CSS seulement, le DOM ne change pas ; deux tailles (carte du résultat, aperçu de l'accueil) | petit |
| `ScoreCard` / `Bottleneck` | Grille borne + étape qui freine ; un nom d'étape long (« Acquisition ») est à vérifier à 390 px | petit |
| `StageProfile` (nouveau) | SVG pur, calculé depuis les cinq scores, testable unitairement (hauteur = 20 − score, le HC suit `isWeak`) ; même fonction pour la page et pour Satori | moyen |
| `PillarChip` | La jauge de I | petit |
| Bande « trois étapes » de l'accueil | Composant de I, avec les pictogrammes du bandeau | petit |
| Moteur | Accents outremer sur `Callout`, les durées et le tableau de bord ; le chrono est une illustration SVG fixe | petit |
| Hub du jeu | Intro de nuit, et `StageProfile` en variante de nuit pour les cinq cols | petit (réutilise `StageProfile`) |
| Image de partage | Gabarit Satori de I, avec la borne (des `div` à coins arrondis, rendus par Satori) et le profil (SVG inline, accepté par Satori). Le № disparaît de l'image. | moyen |
| Pied de page | Mot-symbole de I | petit |

**Aucune illustration à commander.** Le chrono et les pictogrammes sont des SVG simples, déjà tracés. En tout, deux à trois sessions : une pour les jetons, l'en-tête et le bandeau, une pour la borne, le profil et l'image de partage, une pour le moteur, le hub et les vérifications (contraste en CI, 390 px, les deux langues).

## Risques
- **Le mot « étape » sert deux fois.** Le produit appelle déjà « étapes » les cinq étapes AARRR (« Une étape te freine », « Étape 1 sur 5 — Acquisition »). Le bandeau dit « Étape 1/3 » juste au-dessus : sur le quiz et sur le résultat, les deux compteurs se lisent ensemble. Piste : « 1/3 · Plaine » sans le mot « étape », dans le bandeau comme sur l'image de partage.
- Sous 940 px, le bandeau garde la course en pictogrammes seuls ; sous 760 px, il la masque et passe sur deux lignes.
- Un goulot au nom long, ou deux goulots, n'ont pas été rendus. Ils demanderont un corps plus petit à côté de la borne.
- Le mode « Roast » n'a pas été capturé.
- L'image de partage montre maintenant la forme des cinq scores. Ils sont déjà publics sur `/r/<id>`, mais la garde de payload (convention 11) doit les compter.
