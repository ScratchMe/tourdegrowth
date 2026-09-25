# Annuaires — « Le côté obscur » (lancement C)

*TODO: à relire. Canal **conditionnel** pour le jeu (brief §4) : la plupart
des annuaires de lancement listent des outils SaaS, pas des jeux, et un
produit par domaine. Même règle que pour le moteur : vérifier sur chaque
annuaire qu'une seconde fiche du domaine est acceptée ; sinon, **mettre à
jour** la fiche existante d'une phrase. Soumetteur « Tour de Growth »,
`contact@tourdegrowth.com`, aucun champ « fondateur » ne reçoit un nom. Aucune
marque réelle dans aucune description.*

**Lien** : `node scripts/utm-link.mjs directory:<slug> /en/game/retention --campaign launch_game`
(`/fr/game/retention` pour un annuaire francophone).

**Catégories** : Education · Games · Design · Privacy · Product
management. **Pas** les annuaires d'IA : le jeu n'appelle aucun modèle.

**Tags** : `dark-patterns`, `deceptive-design`, `ux`, `serious-game`,
`browser-game`, `subscription`, `retention`, `consumer-protection`,
`open-source`, `free`

## Nom et accroche (≤ 60 caractères)

- **EN** : `The dark side — a game about subscription dark patterns` (55)
- **FR** : `Le côté obscur — un jeu sur les pièges de la résiliation` (56)

## Description — 140 caractères

- **EN** : `Play a year as the growth PM told to cut cancellations. Pick projects, meet the CEO, and learn the eight dark patterns by building them.` (136)
- **FR** : `Une année comme PM growth sommé de réduire les résiliations. Tu choisis, le DG insiste, et tu apprends huit pièges en les fabriquant.` (133)

## Description — 300 caractères

- **EN** : `A free 20-minute browser game. You're the growth PM of a fictional streaming app; the CEO wants cancellations down. Each quarter, pick two projects. Trust and regulator attention stay blurred until December, when the game names each pattern, its law and its tell. No account, no server.` (286)
- **FR** : `Un jeu gratuit de vingt minutes, dans le navigateur. Tu es le PM growth d'une appli de streaming fictive ; le DG veut moins de résiliations. Chaque trimestre, deux chantiers. Confiance et radar du régulateur restent floutés jusqu'en décembre, qui nomme chaque piège, sa loi, son repère.` (286)

## Description — 800 caractères

- **EN** : `Most dark-pattern resources ask you to spot the trick. This game makes you build it. You play a year as the growth PM of a fictional streaming app. The board wants monthly cancellations cut from 6% to 4%, and every quarter the CEO calls you on video with a new demand. You pick two projects from cards named the way they are in meetings — nothing on a card says what it really does. Your dashboard shows cancellations; subscriber trust and regulator attention are blurred until December. Then the game names all eight patterns, gives the law behind each and the tell to spot them in the apps you use. You can also win the year without a single trick. About twenty minutes, free, in English and French, no account, no server: it runs entirely in your browser.` (758)
- **FR** : `La plupart des ressources sur les dark patterns demandent de repérer le piège. Ce jeu te le fait fabriquer. Tu joues une année comme PM growth d'une appli de streaming fictive. Le board veut faire passer les résiliations de 6 % à 4 % par mois, et chaque trimestre le DG t'appelle en visio avec une nouvelle demande. Tu choisis deux chantiers parmi des cartes nommées comme en réunion : aucune ne dit ce qu'elle fait vraiment. Ton tableau de bord montre les résiliations ; confiance des abonnés et radar de la DGCCRF restent floutés jusqu'en décembre. Le jeu nomme alors les huit pratiques, la loi et le repère de chacune. On peut aussi tenir l'année sans une seule astuce. Vingt minutes, gratuit, en français et en anglais, sans compte, sans serveur.` (750)

*Les nombres entre parenthèses se vérifient par `node marketing/check-lengths.mjs` à chaque retouche (`--fix` les réécrit) ; ne jamais les recopier à la main.*

## Visuels (à capturer le jour de l'ouverture)

- La visio du DG et la main de cartes, 1280 et 390, FR et EN.
- Le dashboard avec ses deux tuiles floutées.
- Le téléphone « N clics pour résilier ».
- La page de décembre (courbes et catalogue ouvert sur un pattern).
- Logo : `public/favicon-512.png`, comme le Tour.
