# Paysage concurrentiel — ce qui existe à côté des trois lancements

*TODO: à relire (convention 6). Méthode `competitive-brief` du plugin
Marketing, recherche faite le **2026-09-24** (pages ouvertes depuis la session
quand elles se laissaient ouvrir, recherches web sinon — sources en fin de
document). Document **interne** : la règle de voix de `GROWTH-PLAN.md` §2
interdit de se comparer nommément à un concurrent en public ; ce document
existe pour savoir où l'on se place, pas pour être cité.*

*Tout ce qui n'a pas été vu de ses yeux est marqué « non vérifié ». Les
fonctionnalités de nos deux produits à venir sont celles de leurs
spécifications (`GAME-BRIEF.md`, spec du moteur), pas encore celles d'un code
livré.*

---

## 1. En bref

Les trois lancements tombent dans trois paysages différents, et aucun des
trois n'a de concurrent direct sur **l'angle** que nous prenons — chacun en a
sur le **sujet** :

- **Le Tour** : les outils de « score » pour startups existent, mais ceux
  qu'on a pu ouvrir exigent une inscription avant le résultat et mesurent la
  « maturité » en général, pas les cinq étapes AARRR.
- **Le moteur** : les gabarits AARRR sont partout (tableaux blancs, tableurs,
  slides vides) ; **aucun** ne prend tes chiffres, te dit où tu perds du monde
  et sort un deck — et les tableurs téléchargeables passent par un e-mail.
- **Le jeu** : apprendre à *repérer* les dark patterns a déjà son Show HN
  (janvier 2025, 179 points) ; apprendre en *jouant le manipulateur* a sa
  recherche (Bad News, Cambridge) mais pas sur les écrans qui nous font
  cliquer. Personne ne le fait en français, avec la loi française.

**Plus grande opportunité** : « AARRR funnel template » — une requête dont la
page de résultats ne montre que des gabarits statiques, et un produit qui fait
exactement ce que la requête demande, sans formulaire d'e-mail.

**Plus grande menace** : l'autorité de domaine. Miro, les banques de slides et
deceptive.design sont installés sur nos requêtes depuis des années ; un site de
quelques semaines ne les déloge pas par le contenu seul, il doit être
**meilleur à l'usage**, et le montrer.

---

## 2. Les profils

### 2.1 Scores et quiz pour startups (face au Tour)

**Startup Readiness Score** (`startupready.ai`, anciennement
`startupreadinessscore.com`)
- Promesse, citée : « A Free Startup Assessment Tool for Early-Stage
  Founders ».
- 33 questions, environ 20 minutes, six piliers (fondateur, problème, marché,
  modèle, go-to-market, finances), score sur 150, diagnostic écrit, trois
  fiches de travail recommandées.
- **Inscription requise pour voir le résultat** ; gratuit pour deux
  évaluations, puis offre Pro payante.
- Force : un livrable riche, un parcours de travail derrière. Faiblesse pour
  notre public : le mur d'inscription, et un périmètre « prêt à lever » plutôt
  que « où ma croissance cale ».

**Scorecards ScoreApp** (ex. `startup.scoreapp.com`, « Startup Readiness
Assessment Scorecard »)
- Quiz générés sur la plateforme ScoreApp, présentés comme gratuits, avec
  « actionable steps » en sortie.
- Non vérifié : la capture d'e-mail avant le résultat (c'est le modèle
  économique usuel de la plateforme, mais nous n'avons pas rempli le quiz).
- Force : la quantité — il en existe beaucoup. Faiblesse : génériques, sans
  cadre de croissance explicite.

**Ce qui nous distingue, défendable** : pas d'inscription du tout ; cinq
étapes nommées ; un score qu'on refait à la main (règle 20/7/0, arrondi par
étape) ; une action tirée d'une bibliothèque relue ; un résultat qui refuse de
nommer un goulot quand les chiffres ne le portent pas.

### 2.2 Gabarits AARRR et funnels (face au moteur)

| Acteur | Format | Tes chiffres ? | Diagnostic ? | Sortie présentable ? | Friction |
|---|---|---|---|---|---|
| **Miro** — « Free AARRR template » | Tableau blanc | À la main, dans des post-it | Non | Le tableau lui-même | Compte Miro |
| **Hustle Badger** — « Pirate Metrics (AARRR) », Google Sheet | Tableur | Oui : conversions entre étapes, valeur par utilisateur, effet d'une intervention sur le revenu | Non (des calculs, pas un verdict) | Le tableur | Inscription à la newsletter proposée pour accéder aux ressources |
| **SlideModel**, **SlideBazaar** | Slides PowerPoint / Google Slides | Non, une forme vide | Non | Oui, mais sans données | Téléchargement, parfois payant (non vérifié) |
| **Milanote** | Tableau | À la main | Non | Le tableau | Compte |
| **Sourcetable** — « Pirate Metrics Excel Template Generator » | Tableur généré par IA | Oui | Non vérifié | Le tableur | Compte (non vérifié) |
| **Calculateurs de K-factor** (UserJot, LaunchList — cités par l'audit SEO) | Calculateur à une métrique | Une seule métrique | Non | Non | Faible |
| **Moteur de croissance** (spécifié) | Page + îlot local | Oui, en comptes (numérateur ÷ dénominateur) | Oui, contre une cible nommée ou une fourchette relue | Oui : 4 à 7 slides, PDF, PNG, texte | Aucune, rien n'est envoyé |

**Lecture** : le marché sépare trois gestes que le moteur réunit — *saisir*
(tableur), *juger* (personne), *présenter* (banque de slides). Le point faible
commun est l'honnêteté du chiffre : aucun gabarit vu ne dit d'où vient un
taux, ni ne refuse de conclure quand il manque une donnée.

### 2.3 Éducation aux dark patterns (face au jeu)

**deceptive.design** (Harry Brignull)
- La référence : taxonomie (le vocabulaire « deceptive patterns », dark
  patterns auparavant), « hall of shame » par marque, base de lois,
  publications 2026 sur la réglementation et les patterns de l'IA.
- **Aucun jeu.** Force : l'autorité ; c'est lui qui a fixé le vocabulaire.
  C'est une source, pas un rival : le jeu y renvoie par son vocabulaire.

**Dark Patterns Detective** (`games.productartistry.com`, **Show HN du
17 janvier 2025, 179 points, 64 commentaires**)
- Le joueur **repère** des patterns dans des scénarios d'interface (« trouve le
  bouton qui permet vraiment d'annuler »), explications psychologiques,
  Next.js + TypeScript.
- Ce que le fil HN a reproché, et qui nous sert de liste de contrôle :
  objectifs flous au départ, avancée automatique et délais imposés entre
  niveaux, confusion entre l'interface simulée et les consignes, performance
  mobile, une explication linguistiquement fausse — et, relevé avec ironie par
  plusieurs commentateurs, **une inscription à une newsletter en fin de partie
  qui ressemblait aux patterns enseignés**.
- Ce que le fil a salué : le concept, la valeur pédagogique, les « aha
  moments ».

**Bad News** (DROG et université de Cambridge, 2018) et sa famille (Harmony
Square, Go Viral!), **Cranky Uncle** (John Cook)
- Le joueur **incarne le manipulateur** (magnat des fausses nouvelles) : la
  méthode d'**inoculation**, étudiée et publiée pour la désinformation.
- Gratuits, disponibles en plusieurs langues. Aucun ne traite des interfaces.

**CNIL — LINC « Données & Design »** : un quiz « Apparences trompeuses »
(d'après `GAME-BRIEF.md` §1.2, non revérifié le 2026-09-24). Pas de
simulation.

**Recherche** : des « serious games » académiques (« Deception Detected! »,
« Mind the Dark », pour enfants) — des prototypes étudiés, pas des produits
grand public.

**Cookie Consent Speed.Run** : une satire d'un seul écran (d'après
`GAME-BRIEF.md` §1.2).

---

## 3. Matrice des messages

| Dimension | Tour de Growth (Tour / moteur / jeu) | Startup Readiness Score | Hustle Badger (gabarit) | Dark Patterns Detective | Bad News |
|---|---|---|---|---|---|
| Accroche | « Où ta croissance cale-t-elle ? » | « A Free Startup Assessment Tool… » | Définition d'AARRR | « Uncover the hidden design tricks… » | « Get Bad News » (non revérifié) |
| Public | Fondateurs, PM growth, designers | Fondateurs pré-traction, accélérateurs | PM, growth | Grand public, designers | Grand public, écoles |
| Différenciateur | Honnêteté du chiffre ; rien d'envoyé ; roast optionnel | Profondeur + programme | Calculs d'impact | Détection guidée | Inoculation validée |
| Ton | Sec, drôle quand il faut, cycliste | Coach | Didactique | Ludique | Satirique |
| Friction | Aucune | Inscription | Newsletter | Newsletter en fin de partie (relevé HN) | Aucune |

**Récits** (cadre « méchant / héros / transformation ») :

- *Startup Readiness* : méchant = l'improvisation ; héros = le programme ;
  transformation = « prêt à lever ».
- *Gabarits* : pas de récit — un outil vide.
- *Dark Patterns Detective* : méchant = les designers qui trompent ; héros = le
  joueur qui repère.
- *Le côté obscur* : méchant = **le chiffre immédiat**, pas une personne ;
  héros = le joueur qui tient ou qui apprend en décembre ; transformation =
  « je sais les nommer, et je sais ce qu'ils coûtent ». C'est la seule
  narration du lot qui ne désigne pas une catégorie de gens comme coupable —
  cohérent avec la règle du roast (la stratégie, jamais la personne).

---

## 4. Contenus : les trous

| Sujet | Nous | Concurrence | Trou ? |
|---|---|---|---|
| AARRR expliqué | Glossaire long (24 termes), `/how-it-works`, quatre « AARRR vs X » | Articles partout (Amplitude, PostHog, ProductPlan…) | Parité ; la valeur est dans « Dans le Tour » (la question qui mesure chaque terme) |
| AARRR vs HEART | Absent | Un article générique, aucun comparatif dédié (audit SEO §3.1) | **Oui, pour nous** |
| Gabarit AARRR avec tes chiffres + deck | Le moteur | Gabarits statiques | **Oui, pour nous** — le plus grand |
| Dark patterns de la résiliation, en français, pédagogique | Le jeu (et la page texte proposée par l'audit SEO §3.2) | Contenu juridique (avocats, DGCCRF, presse) | **Oui, pour nous** |
| Dark patterns : jouer le manipulateur | Le jeu | Bad News sur un autre sujet | **Oui, pour nous** |
| Kit enseignant, codes de groupe | Hors v1 (GAME-BRIEF §2.1) | Bad News, Cranky Uncle en ont | Trou **chez nous**, assumé |
| Benchmarks de pratiques | `/metrics` fermé sous 50 soumissions | Benchmarks de résultats (ARR, NRR) payants | Opportunité différée (`GROWTH-PLAN.md` 2.5) |

---

## 5. Opportunités

1. **Posséder « AARRR funnel template »** avec un outil qui fait ce que la
   requête demande, là où la page de résultats ne propose que des formes vides.
   Le slug de la page est déjà la requête (décision 1 du 2026-09-24).
2. **La confidentialité comme preuve, pas comme promesse** : « ouvre l'onglet
   Réseau » est un argument que ni un tableur à e-mail ni une plateforme à
   compte ne peut faire. Il ne vaut que parce qu'une spec canari le prouve.
3. **Le seul jeu de dark patterns qui place le joueur du côté de celui qui les
   fabrique**, avec la pression hiérarchique et le coût différé — l'angle que
   le Show HN de 2025 n'a pas pris.
4. **Le français** : ni gabarit AARRR outillé, ni jeu sur la résiliation. La
   loi « trois clics » est française ; le public qui la connaît aussi.
5. **Une partie sans aucune friction** : pas de newsletter en fin de jeu. Le
   reproche le plus moqué du fil HN de 2025 est une règle gratuite à tenir.

## 6. Menaces

1. **Autorité de domaine** sur « AARRR template » (Miro, banques de slides) :
   le moteur doit gagner par l'usage et les liens, pas par le mot-clé seul.
2. **« Déjà vu »** sur HN pour le jeu : le précédent de 2025 est connu. Parade
   dans la FAQ de `game/show-hn.md`.
3. **Les outils d'IA** qui génèrent un tableur AARRR à la demande (Sourcetable
   et d'autres) : ils répondent vite à « un gabarit », moins à « un deck
   défendable avec la source de chaque chiffre ».
4. **deceptive.design** peut un jour faire un jeu : son autorité le rendrait
   dominant. Notre avance est la mécanique (un an, un DG, des fins), pas le
   sujet.

## 7. Recommandations

**Tout de suite (semaine du lancement)**

1. Écrire la FAQ « ça existe déjà » **avant** le Show HN du jeu — fait dans
   `game/show-hn.md`.
2. Vérifier, sur la recette du jeu, les cinq reproches du fil de 2025
   (objectifs clairs, pas d'avancée automatique, pas de délai imposé,
   interface simulée distincte des consignes, mobile fluide) : c'est la grille
   de lecture que les commentateurs appliqueront.
3. Garder le moteur **sans aucune capture d'e-mail**, y compris « pour recevoir
   le deck » : c'est l'avantage sur les tableurs.

**Plus tard (stratégique)**

4. La page texte « Dark patterns de la résiliation » (audit SEO §3.2) avant le
   jeu, pour que la requête française trouve le site avant que le jeu ouvre.
5. La cinquième comparaison, « AARRR vs HEART » (audit SEO §3.1).
6. Un mode classe pour le jeu (GAME-BRIEF §2.1, §9.4) : c'est là que Bad News
   et Cranky Uncle ont construit leur diffusion.

---

## Sources (consultées le 2026-09-24)

- [Show HN: Interactive game teaching dark patterns in UX design](https://news.ycombinator.com/item?id=42737778) — titre, points, commentaires, date et résumé du fil
- [Dark Patterns Detective](https://games.productartistry.com/games/dark-patterns)
- [Startup Readiness Score](https://startupready.ai/) (redirection depuis startupreadinessscore.com)
- [Startup Readiness Assessment Scorecard (ScoreApp)](https://startup.scoreapp.com/)
- [Hustle Badger — Pirate Metrics: AARRR](https://www.hustlebadger.com/metrics/pirate-metrics/)
- [Miro — AARRR template](https://miro.com/templates/aarrr/)
- [SlideModel — AARRR Metrics Funnel Diagram](https://slidemodel.com/templates/aarrr-metrics-funnel-diagram-powerpoint/), [SlideBazaar](https://slidebazaar.com/templates/pirate-metrics-aarrr-funnel-powerpoint-google-slides/)
- [Milanote — AARRR metrics](https://milanote.com/templates/startups/AARRR-metrics), [Sourcetable — Pirate Metrics](https://sourcetable.com/excel-templates/pirate-metrics)
- [deceptive.design — reading list](https://www.deceptive.design/reading-list/primary-reading), [Dark pattern (Wikipédia)](https://en.wikipedia.org/wiki/Dark_pattern)
- [Bad News Game — Social Decision-Making Lab, Cambridge](https://www.sdmlab.psychol.cam.ac.uk/research/bad-news-game), [Inoculation Science — games](https://inoculation.science/inoculation-games/)
- [« Deception Detected! » (Springer)](https://link.springer.com/chapter/10.1007/978-3-031-78269-5_18), [« Mind the Dark »](https://pith.science/paper/2506.23017)
- Pour le reste : `GAME-BRIEF.md` §1.2, audit SEO du 2026-09-24 (§2, §3)
