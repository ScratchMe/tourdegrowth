# Relecture de marque — les textes des lancements A, B et C

*TODO: à relire. Relecture faite par la session sur ses propres brouillons, le
2026-09-24, avec la méthode `brand-review` du plugin Marketing. Ce n'est pas
une approbation : écrire n'est pas approuver (convention 6), et la relecture
d'Antoine reste le portier de chaque texte.*

**Contenu relu** : `README.md` et `competitive-brief.md` de ce dossier, les six
pièces de `engine/`, les six de `game/`, et les ajouts de `../kit.md`.

**Référentiel appliqué**, faute de charte écrite séparée : les règles de
`GROWTH-PLAN.md` §2 (jamais le nom, jamais une comparaison nommée en premier,
jamais un chiffre promis, jamais le même texte deux fois), la voix du produit
(tutoiement, phrases courtes, pas de jargon empilé, pas de « X n'est pas Y,
c'est Z » en série — GAME-BRIEF §8.4), la typographie française du dépôt
(espaces insécables U+00A0), et une règle de fond : **chaque preuve avancée
doit être vraie dans le code, ou marquée [portier]**.

## Synthèse

Le ton tient : les textes parlent de mécanismes, pas de promesses, et chaque
canal a sa forme (histoire pour HN, décision pour r/SaaS, débat pour
r/growthhacking, récit de construction pour IH). Les défauts trouvés sont
presque tous du même genre — **une affirmation plus forte que ce qui est
vérifiable** : un chiffre écrit de mémoire, une anecdote de test inventée pour
faire vivant, une limite de caractères jamais comptée. Tous sont corrigés
sauf ceux qui dépendent d'un fait pas encore établi, qui sont devenus des
cases à cocher dans les portiers.

## Constats

| # | Constat | Où | Gravité | Correction | Statut |
|---|---|---|---|---|---|
| 1 | Le kit disait que les réponses du Tour « ne quittent le navigateur que pour calculer le score » : elles sont envoyées **et gardées** avec le résultat | `../kit.md`, faits avançables | **Haute** (une promesse de confidentialité fausse) | Réécrit : envoyées, gardées sous un identifiant impossible à deviner, sans identité | Corrigé |
| 2 | Les deux descriptions 800 du Tour faisaient **840 et 864** caractères, et 7 des 9 comptes du kit étaient faux | `../kit.md` | Haute (un formulaire les tronque) | Deux incises retirées dans chaque langue ; comptes recalculés | Corrigé |
| 3 | La description 800 FR du moteur faisait 830 caractères | `engine/directories.md` | Haute | Première phrase raccourcie | Corrigé |
| 4 | Trois anecdotes inventées dans le build log du jeu (« a tester said », « players keep looking at them », un ancien libellé de carte cité mot pour mot) | `game/indiehackers.md` | Haute (IH lit des récits : une anecdote fausse est un mensonge) | Remplacées par les décisions réelles de GAME-BRIEF §4 ; titre passé de « playtesting taught me » à « things I changed » | Corrigé |
| 5 | « 60 phrases » de verdict avancé comme preuve | brief, §3 A | Moyenne (le nombre bouge) | « une bibliothèque de phrases pré-écrites et relues » | Corrigé |
| 6 | « Aucun serveur, aucune fonction » pour le moteur | brief, §3 B | Moyenne (le site a des fonctions) | « Aucune fonction serveur nouvelle, aucun Route Handler » | Corrigé |
| 7 | « Vingt minutes » affirmé partout pour le jeu | `game/*` | Moyenne | Portier ajouté : durée mesurée par la recette, sinon remplacée partout (décision 5 du 2026-09-24) | Portier |
| 8 | Noms de cartes cités en anglais alors que seule la copie française existe | `game/*` | Moyenne | Portier : remplacer par les chaînes anglaises livrées (GAME-BRIEF §8.2) | Portier |
| 9 | « the catalogue explains why each one is illegal or on its way to it » | `game/show-hn.md`, FAQ | **Juridique** (tous les patterns ne sont pas illégaux) | « the catalogue gives the law behind each one » | Corrigé |
| 10 | « the DSA's ban on deceptive interfaces » sans périmètre | `game/show-hn.md`, FAQ | Juridique (l'article 25 vise les plateformes en ligne) | « …for online platforms (art. 25) » | Corrigé |
| 11 | « On peut gagner : trois fins propres » confondait fins propres et fins gagnantes | `../kit.md` | Faible | « trois des sept fins sont propres, dont deux gagnantes » | Corrigé |
| 12 | Le coût de réparation présenté sur une échelle qui n'existe pas | `engine/reddit.md` | Faible | « from a meeting to a quarter » | Corrigé |
| 13 | Une phrase à la première personne qui racontait un déclic inventé (« until I noticed ») | `engine/indiehackers.md` | Faible | Remplacée par le défaut réel vu dans les maquettes | Corrigé |
| 14 | Le précédent de janvier 2025 (un jeu voisin sur HN) : risque de le citer nommément | `game/show-hn.md` | Moyenne (règle §2 du plan) | Reconnu dans la FAQ **sans le nommer** ; consigne de réponse s'il est cité | Tenu |
| 15 | Typographie : espaces ordinaires avant `; : ! ? »`, après `«`, dans les groupes de chiffres et avant `%` / `€` / `$` | tous les fichiers français du dossier | Faible | Passe U+00A0 (954 remplacements sur les brouillons, puis cette relecture elle-même) ; aucune chaîne anglaise touchée, vérifié | Corrigé |

## Avant / après — les trois qui comptent

**1. La promesse de confidentialité du Tour** (`../kit.md`)
- Avant : « les réponses du Tour ne quittent le navigateur que pour calculer le score »
- Après : « les réponses du Tour sont envoyées pour calculer le score et gardées avec le résultat, sous un identifiant impossible à deviner, sans aucune donnée d'identité »
- Pourquoi : la première se lit « rien n'est gardé ». Un lecteur de HN qui ouvre `src/lib/submissions/types.ts` trouve `answers`. C'est précisément la phrase qui ruinerait la crédibilité de la promesse **vraie** du moteur (« rien ne quitte ton navigateur »), lancée juste après.

**2. Le build log du jeu** (`game/indiehackers.md`)
- Avant : « A tester said there was nothing in it to be proud of. »
- Après : « …and the feedback was blunt: nothing in it to be proud of. »
- Pourquoi : la remarque existe (GAME-BRIEF §4), mais elle vient d'Antoine, pas d'un testeur. La nommer « testeur » inventait un fait ; l'attribuer à Antoine le nommerait.

**3. La FAQ juridique du jeu** (`game/show-hn.md`)
- Avant : « the catalogue explains why each one is illegal or on its way to it »
- Après : « the catalogue gives the law behind each one »
- Pourquoi : les notifications de série (« design addictif ») ne sont pas illégales en France aujourd'hui ; le Digital Fairness Act qui les vise n'est qu'attendu. La relecture juridique du catalogue tranchera ce que le catalogue dit ; un post n'a pas à aller plus loin que lui.

## Points juridiques à faire valider

Aucun ne bloque l'écriture ; tous bloquent la publication du texte concerné.

- **Aucune marque réelle dans aucun post** — vérifié par recherche dans toutes les lignes collables (`>` et `**EN**`/`**FR**`) : aucune occurrence des marques citées dans le brief du jeu ni des concurrents du brief concurrentiel.
- **Article L215-1-1 du Code de la consommation**, résiliation « en trois clics » depuis le 1ᵉʳ juin 2023, et **DSA article 25** : repris de `GAME-BRIEF.md` §1.3. À confirmer par la relecture juridique du catalogue, qui est de toute façon un portier du lancement C.
- **Digital Fairness Act** : jamais une date, seulement « attendu fin 2026 » ; le créneau réactif s'écrit d'après la publication elle-même.
- **Le crédit de l'auteur** : sous l'option A, la seule réponse à « qui est derrière ? » est « the site credits its author in the footer; I keep this account pseudonymous ». Elle est vraie et elle renvoie au site signé ; ce n'est pas un anonymat au sens juridique, et le site garde ses mentions légales (LCEN).

## Anonymat — vérifié

Recherche de `Antoine`, `Berthaud`, `LinkedIn`, `cv.` dans toutes les lignes
collables de `engine/` et `game/` : **aucune occurrence**. Les seules mentions
d'Antoine sont dans les notes internes (en italique, hors blocs collables) qui
disent qui envoie et qui relit.

## Longueurs

Vérifiées par `node marketing/check-lengths.mjs` — **61 longueurs, 0 écart** au
2026-09-24 : chaque `texte` (n) des brouillons et du kit, contre la limite de
sa section, plus les 24 posts X / Bluesky (un lien compté 23 caractères, comme
X le fait). Le script a d'abord trouvé **16 comptes faux** et **3 textes hors
limite** (voir constats 2 et 3), puis `--fix` a réécrit les comptes. Sa
non-vacuité est vérifiée : un compte faussé et un texte de 150 caractères
glissé sous une limite de 140 sont tous deux signalés, avec un code de sortie
1.

| Pièce | Limite | Plus long, EN / FR |
|---|---|---|
| Accroche d'annuaire | 60 | 55 / 59 |
| Description courte | 140 | 136 / 133 |
| Description moyenne | 300 | 292 / 296 |
| Description longue | 800 | 773 / 791 |
| Titre Show HN | 80 | 78 |
| Objet d'e-mail | 50 | 46 / 49 |
| Post X | 280 | 220 |

## Ce que cette relecture ne peut pas trancher

- **Le registre** : la machine vérifie qu'une phrase est vraie et tient dans
  sa case, pas qu'elle sonne juste. C'est la leçon du bon à tirer nº3, et
  c'est la part d'Antoine.
- **Les faits [portier]** : tant que le moteur et le jeu ne sont pas sur
  `main`, leurs preuves sont des spécifications. Chaque pièce porte la liste
  des cases à cocher avant de partir.
