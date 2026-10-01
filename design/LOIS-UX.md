# Les lois de l'UX, traduites pour Tour de Growth

*Établi le 2026-10-01 à la demande d'Antoine, à partir du recueil
[Laws of UX](https://lawsofux.com/) (trente lois). Une loi y est un principe ;
ici, chaque loi retenue devient une **règle vérifiable** sur nos trois parcours
(l'accueil et le quiz, le résultat, le moteur et le jeu), avec l'état du
produit le jour où elle a été écrite. Trois agents en lecture seule ont
confronté les lois au code ; chaque écart retenu ici a été revérifié à la
source avant d'être écrit. Les correctifs vivent dans `CHANTIERS.md`, A15.*

**Quand le relire** : avant de dessiner un écran ou un parcours, avant de juger
un reel d'UX (la méthode d'A15), et avant d'annoncer qu'un écran est fini. Un
état écrit ici est celui du 2026-10-01 : le revérifier avant de s'y fier.

## Les règles retenues

| Loi | La règle chez nous | État au 2026-10-01 |
|---|---|---|
| **Fitts** | Toute cible se touche sur 44 × 44 px au moins, sans prendre le doigt d'un voisin ; dessinée plus petite, elle porte une bande transparente (`Button` `quiet` et `sm`, `styles/hit.module.css`) | Tenu (A15.1, `e2e/targets.spec.ts`) |
| **Hick, surcharge de choix** | Trois réponses par question, un seul appel principal par écran, aucun choix obligatoire avant la première question | Tenu (15 questions × 3 réponses ; le ton se choisit après) |
| **Doherty (< 400 ms)** | Aucune attente artificielle au-delà de 400 ms ; un retour visible à l'image suivante d'un clic ; une attente longue se raconte honnêtement | Tenu, l'attente du Deep dive racontée par l'horloge (A15.6) |
| **Gradient d'objectif** | La progression se montre (« Q n / 15 », l'étape), et elle ne dit pas « fini » quand il reste des écrans | Écart mineur : « 15 / 15 répondues » au-dessus de deux écrans encore à passer (A15.7) |
| **Zeigarnik** | Un parcours interrompu se reprend, et le produit le dit | Écart : le quiz et le moteur se reprennent, l'accueil n'en dit rien (A15.16) |
| **Jakob** | Les conventions du web : le logo ramène à l'accueil, on peut revenir en arrière, un formulaire s'envoie avec Entrée, « télécharger » télécharge | Écarts : pas de retour après la 15ᵉ question (A15.7), « Télécharger le PDF » ouvre l'impression (A15.11), Entrée n'enregistre pas une fiche (A15.20) |
| **Postel** | Être large dans ce qu'on accepte : un nombre s'écrit comme le lecteur l'écrit, avec l'unité que la case affiche déjà ; ne jamais garder en silence autre chose que ce qui a été tapé | Écarts (A15.8 à A15.10) |
| **Tesler** | La complexité reste chez nous : le produit calcule, le lecteur ne fait pas d'arithmétique | Tenu, sauf les bornes d'une estimation, à taper dans l'unité du chiffre |
| **Miller, découpage, mémoire de travail** | Rien à retenir d'un écran à l'autre ; ce qui va ensemble se groupe par étape | Tenu (cinq étapes de trois) |
| **Pic et fin** | Le pic (le score) et la fin d'un parcours se soignent : on ne finit pas sur une mention légale ni sur un bloc pour développeurs | Écart, décision de design (A15.17) |
| **Position sérielle** | Ce qui compte vient en premier ou en dernier ; un appel principal revient en fin de page longue | Écart sur téléphone : aucun appel après le premier écran de l'accueil (A15.15) |
| **Von Restorff** | Une seule chose ressort par écran, et la couleur dit toujours la même chose (`.design-sync/conventions.md`, « Red means one of three things ») | Tenu dans le système ; voir la carte du jeu (A15.18) |
| **Similarité, proximité, région commune** | Ce qui a l'air cliquable l'est, et l'inverse ; une explication vit près de ce qu'elle explique | Écart, décision de design : les puces d'étape ont l'allure d'un bouton secondaire sans en être un (A15.19) |
| **Modèle mental** | Un chiffre affiché se lit sans mode d'emploi : son échelle, sa source, son effectif | Écart : « Points forts » peut montrer des étapes faibles (A15.14) |
| **Paradoxe de l'utilisateur actif** | On commence sans lire ; aucune consigne obligatoire n'est cachée dans un texte | Tenu (l'appel est dans le premier écran à 390 px) |
| **Attention sélective** | Ce qui ressemble à une publicité est sauté : une offre vers un autre produit ne prend pas l'allure d'une bannière, et ne mêle pas ses chiffres à ceux du lecteur | Voir A15.18 |

## Les lois laissées de côté, et pourquoi

- **Effet esthétique-utilisabilité** : c'est le travail du design system, tenu
  par les captures et les contrastes en CI ; rien à vérifier de plus ici.
- **Biais cognitifs** : la règle existe déjà, sous un autre nom : « Never
  claim more than the numbers support » (`conventions.md`), et le repère moyen
  qui ne s'affiche pas sous 30 soumissions.
- **Rasoir d'Occam, Pareto, Parkinson** : trop généraux pour une règle qui se
  vérifie. Parkinson est couvert par la durée annoncée avant de commencer
  (« 3 min »).
- **Prägnanz, connexion uniforme** : couverts par le système (une forme par
  sens, une sélection par langage, `conventions.md`).
- **Flow** (le jeu) : les attentes forcées y sont courtes, les longues se
  passent, rien à corriger.
