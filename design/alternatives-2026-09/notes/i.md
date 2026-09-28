# I · L'existant, en mieux

**Thèse.** La même marque, deux ans plus tard. Papier, encre, rouge de la route et ses trois sens, Stardos, Inter et Plex Mono, bords durs : tout reste. Tout est plus affirmé : l'échelle, l'air, la hiérarchie et les détails.

**Le signe des trois espaces : trois dossards.** Le « № » qui existe déjà devient la marque de l'espace. Il est épinglé à côté du logo, avec ses deux trous d'épingle.
- **№ 1 Le Tour** : papier nu. Le rouge garde ses rôles : action, diagnostic, conseil.
- **№ 2 Le moteur** : fond de papier millimétré et accent encre bleue `#1F5F8B`. C'est le cahier de calcul.
- **№ 3 Le côté obscur** : dossard de nuit, liseré ambre `#F0B43C`. Le hub s'ouvre sur une bande de nuit, le monde du niveau, à la porte.

Un filet de la couleur de l'espace, sous l'en-tête collant, rappelle le dossard. L'accent de l'espace ne sert qu'au dossard et aux petites marques ; il ne prend jamais un sens du rouge.

Sur l'accueil, une bande « Un Tour, trois étapes » présente les trois dossards dans l'ordre : Maintenant, Ensuite, Pour finir. Le jeu et le moteur sont encore fermés en production ; la bande montre l'offre une fois ouverte.

## Ce qui change, composant par composant
| Composant | Aujourd'hui | I |
|---|---|---|
| En-tête | filet pointillé, statique | collant, verre dépoli (flou 14 px), filet fin + filet de l'espace (3 px), dossard |
| Titre de l'accueil | 62 px | 80 px, interligne 0,92, approche resserrée |
| Étiquette « № 15 questions » | pointillé gris | bord plein, ombre dure, légèrement penchée : un vrai dossard |
| Boutons | rayon 6 | rayon 12, primaire avec ombre dure, jamais sur deux lignes |
| Cartes | rayon 10, ombre 7 px | rayon 18, ombre 6 px, carte d'aperçu 8 px |
| Puces d'étape (x/20) | pointillé beige | pilule blanche à bord plein, **avec une jauge** qui montre la note ; l'étape qui freine en rouge |
| Prochaine action | pointillé rouge | même pointillé + ombre dure rouge : le conseil se voit du premier coup d'œil |
| Question du quiz | 28 px | 34 px, carte rayon 22, options blanches avec un rond de choix |
| Progression | segments pointillés | pilules |
| Fond | papier uni + halo | papier + grain très léger (bruit SVG à 9 %) ; papier millimétré dans le moteur |
| Pied de page | liens | liens + mot-symbole géant « TOUR DE GROWTH » en filigrane |
| Image de partage | score + action | même contenu, dossard № 1, **mini-rail des cinq étapes** sous le score, pilules |

## Contrastes (calculés, WCAG 2.x)
| Paire | Ratio |
|---|---|
| Encre `#1D1812` sur carte `#FCFAF4` | 16,88 |
| Encre sur fond `#EBE5D7` | 14,03 |
| Gris `#564E41` sur carte / fond | 7,85 / 6,53 |
| Rouge texte `#A32E1F` sur carte / fond | 6,78 / 5,63 |
| Rouge d'accent du titre `#D2402C` sur fond | 3,71 : grand texte seulement (80 px) |
| Bleu moteur `#1F5F8B` sur carte / fond | 6,56 / 5,45 |
| Blanc sur bouton rouge `#CC3E2B` | 4,69 |
| Ambre `#F0B43C` sur nuit `#15110D` | 10,11 |
| Crème `#F3EFE4` / `#D9D1C2` sur nuit | 16,35 / 12,39 |

## Polices
Inchangées : Stardos Stencil (titres, sans № : le № vient de Plex Mono), Inter et IBM Plex Mono. Aucune nouvelle police à vérifier pour Satori.

## Risques
- Le grain et le millimétré coûtent peu, mais se règlent finement : au premier essai, un grain trop fort grisait toute la page.
- L'en-tête collant en verre dépoli doit rester lisible au-dessus des cartes à ombre dure.
- La bande « trois étapes » de l'accueil annonce deux espaces encore fermés ; elle attend leur ouverture.

## Coût de la réalisation
Principalement des jetons : rayons, échelle, ombres, grain. S'y ajoutent quelques composants : l'en-tête et son dossard, la jauge de `PillarChip`, la bande « trois étapes » et le mot-symbole du pied de page. L'image de partage suit le même gabarit Satori, avec un rail en plus. **Aucune illustration.** C'est la direction la moins chère : une à deux sessions.
