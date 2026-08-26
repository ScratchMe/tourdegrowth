# Tour de Growth — Spécification MVP

**Nom :** Tour de Growth
**Auteur :** Antoine Berthaud — side project portfolio, positionnement Growth PM
**Statut :** Draft prêt à construire

---

## 1. Contexte & objectif

Side project destiné à démontrer, par la preuve plutôt que par la description, une maîtrise concrète des mécaniques de croissance produit (framework AARRR : Acquisition, Activation, Retention, Referral, Revenue). L'outil doit lui-même être un cas d'usage de ce qu'il évalue chez les autres : sa distribution doit reposer sur une boucle de croissance mesurable, pas sur de la pub payante.

**Critère de succès du projet (pas de l'outil) :** pouvoir citer en entretien des chiffres réels — nombre d'analyses, taux de partage, coefficient viral (K-factor) — plutôt qu'une capture d'écran statique.

**Sur le nom :** "Tour de Growth" joue sur "tour de force" (une prouesse) et, phonétiquement, sur le Tour de France — une référence culturelle connue même des non-francophones. Le lien avec le produit n'est pas décoratif : un tour a des **étapes**, ce qui correspond directement aux 5 catégories AARRR évaluées (voir §6 et §10).

## 2. Problème & proposition de valeur

Un fondateur, PM ou indie hacker sait rarement où se situe son produit sur les fondamentaux growth, et n'a pas de moyen rapide, actionnable et **partageable** pour s'auto-évaluer.

**Proposition de valeur :** un questionnaire guidé de 2-3 minutes → un score global + 5 sous-scores AARRR + une synthèse qualitative générée par IA (points forts, axes d'amélioration, une recommandation prioritaire) → une page de résultat conçue pour être partagée sur LinkedIn/X.

## 3. Utilisateurs cibles

Fondateurs early-stage, PM growth juniors à mid-level, indie hackers. Profil probable : actif sur LinkedIn/Twitter/Indie Hackers, curieux, aime comparer/benchmarker. Public international dès le départ (voir §5, bilingue).

## 4. Parcours utilisateur (MVP)

**Les maquettes détaillées de ce parcours (Direction B — Marquage au Sol) sont dans `design/DESIGN-BRIEF.md`, avec tokens exacts, copie réelle par écran, et comportements d'interaction.** Ce qui suit reste le résumé fonctionnel de référence ; en cas de divergence de détail, le dossier `design/` fait foi pour le visuel, ce document fait foi pour la logique produit.

1. **Landing page** : proposition de valeur en une phrase + CTA ("Évalue ton produit" / "Check your product")
2. **Questionnaire guidé** : 15 questions à choix simple (QCM/toggle), réparties sur les 5 piliers AARRR, ~2-3 minutes. **Pas de scraping d'URL en V1** (fiabilité et rapidité de build > exhaustivité — voir §9 pour la justification)
3. **Sélecteur de ton** (Neutre / Roast, voir §6bis) — après la dernière question, avant le calcul
4. **Calcul du score** : scoring déterministe basé sur des règles (voir §6) + un appel Gemini pour la synthèse qualitative (mêmes principes que le Fit-Checker du CV : prompt structuré, réponse JSON, repli multi-modèles). Prévoir un état de chargement avec messages progressifs (le calcul prend 2-3s, l'attente sans repère visuel fait perdre confiance — même leçon que sur le CV).
5. **Page de résultat** :
   - Score global (0-100) + 5 sous-scores AARRR
   - Points forts / "Where you're losing time" (axes d'amélioration), 1 recommandation prioritaire (généré par IA)
   - Bouton "Partager mon score" → image Open Graph générée dynamiquement pour cette page précise (le cœur du mécanisme viral, voir §7)
   - URL unique et persistante pour ce résultat
   - CTA secondaire "Analyser un autre produit" (boucle de ré-acquisition)
6. **État d'erreur** si le calcul échoue : les réponses restent sauvegardées localement, réessayer ne fait jamais recommencer le questionnaire.

## 5. Périmètre MVP

**Dans le périmètre (V1) :**
- **Bilingue FR/EN dès le premier jour** — pas un fast-follow. Décision explicite d'Antoine : l'i18n est toujours plus coûteux à ajouter après coup qu'à prévoir dès l'architecture initiale. Réutiliser le pattern déjà éprouvé sur le site CV (dictionnaire de traduction + fonction `tc()` appliquée à chaque champ traduisible, détection de la langue du navigateur avec repli, `?lang=` en priorité dans l'URL).
- Questionnaire guidé (15 questions, pas de scraping)
- Scoring hybride règles + IA
- Page de résultat unique, partageable, avec image OG dynamique
- Capture de l'attribution de parrainage (`?ref=`)
- Analytics basique (GoatCounter + événements custom)
- **Réglage de ton "Neutre / Roast" au choix de l'utilisateur** (voir §6bis) — activable au moment de lancer l'analyse, pas une surprise après coup

**Hors périmètre V1 (fast-follows explicites, pas des oublis) :**
- Comptes utilisateurs / authentification
- Auto-analyse via scraping d'URL + vision IA (V2 : préremplir certaines réponses, le scoring reste basé sur les réponses validées par l'utilisateur, jamais sur une inférence IA seule, pour rester crédible et reproductible)
- Historique de progression (comparer plusieurs analyses dans le temps)
- Classement public / leaderboard communautaire
- Export PDF du rapport
- Thème "Tour de France" étendu en permanence dans le produit (voir §10 — volontairement limité à une activation événementielle)

## 6. Modèle de scoring (point de départ à affiner pendant le build)

5 catégories ("étapes"), 3 questions chacune, chaque réponse vaut 0/7/13/20 points (échelle volontairement simple). Score de catégorie = somme /60, ramené sur 20. Score global = moyenne des 5 catégories, sur 100.

**Règle d'arrondi (résolution de la question ouverte de Claude Design) :** chaque sous-score de pilier est arrondi à l'entier le plus proche *en premier*. Le score global affiché est ensuite la **somme réelle des 5 sous-scores déjà arrondis** (pas une moyenne recalculée sur les valeurs brutes). Objectif : ce qui s'affiche s'additionne toujours correctement à l'écran — jamais de "pourquoi 18+12+8+16+20 ne fait pas 74" en support client. Les valeurs de pilier sont donc toujours des entiers (`08/20`, jamais `07.5/20`).

**Règle de départage du pilier le plus faible (idem) :** en cas d'égalité stricte entre deux piliers sur le score le plus bas, celui qui apparaît en premier dans l'ordre canonique AARRR (Acquisition, Activation, Retention, Referral, Revenue) est désigné "pilier faible" à l'écran et dans l'image de partage. Simple, déterministe, facile à tester.

| Étape (catégorie) | Exemples de questions (à affiner avec Claude Code) |
|---|---|
| **Acquisition** | As-tu un canal d'acquisition principal identifié et mesuré ? As-tu testé plus d'un canal ? Connais-tu ton coût d'acquisition, même approximatif ? |
| **Activation** | As-tu défini un moment "aha" précis ? Sais-tu quel % d'utilisateurs l'atteint ? Ton onboarding a-t-il été testé/itéré au moins une fois ? |
| **Retention** | Suis-tu un taux de rétention (J7/J30) ? As-tu un mécanisme de réengagement (email, notif) ? Connais-tu ta principale cause de churn ? |
| **Referral** | Ton produit a-t-il un mécanisme de partage ou de parrainage ? Est-il intégré au produit ou seulement en communication ? Mesures-tu un coefficient viral ? |
| **Revenue** | Ton modèle de pricing a-t-il été testé (pas juste choisi) ? Connais-tu ta LTV, même grossièrement ? As-tu un playbook d'expansion (upsell/cross-sell) ? |

La synthèse qualitative (Gemini) reçoit les 15 réponses + les 5 sous-scores, et génère forces/axes/recommandation — jamais l'inverse (l'IA ne doit pas influencer le score chiffré, seulement le commenter, pour que le score reste explicable et reproductible).

## 6bis. Réglage de ton : Neutre vs Roast

Deux modes, choix explicite de l'utilisateur avant de lancer l'analyse (pas un réglage caché) :

- **Neutre (par défaut)** : ton consultant, factuel, bienveillant.
- **Roast (opt-in)** : plus mordant, mais **encadré strictement** — le trait d'esprit vise toujours la **stratégie produit**, jamais la personne. Quelques touches de tournures franco-anglaises mesurées (une par réponse maximum, jamais systématique à chaque phrase — l'effet de surprise se perd s'il est prévisible). Exemples de calibrage à donner à Claude Code / au prompt Gemini :

  > *"Votre acquisition a du panache. Votre rétention, elle, a préféré dire au revoir."*
  > *"Pas de mécanisme de referral ? Même vos meilleurs clients ne feront pas de bouche à oreille pour vous."*

  Garde-fou à coder en dur dans le prompt système, non négociable : jamais de moquerie sur la personne, l'équipe, ou des caractéristiques hors du produit lui-même ; le roast reste "playful", jamais humiliant.

## 7. Mécanique de croissance (le cœur du produit)

- Chaque page de résultat a une URL unique (`/r/<id>`).
- Le bouton de partage génère un lien `?ref=<id>` vers la landing page.
- Un nouveau visiteur arrivant avec `?ref=` qui complète le questionnaire est enregistré comme "issu du parrainage de `<id>`".
- **Coefficient K = (nombre de nouvelles analyses attribuées à un `ref`) / (nombre de partageurs uniques).** C'est la métrique reine du projet — celle à citer en entretien.
- L'image Open Graph par résultat doit être soignée : score bien visible, identité visuelle propre. C'est elle qui fait le travail de conversion sur LinkedIn/X, pas le texte du post.

## 8. Stack technique proposée

Cohérente avec ce qui a déjà fait ses preuves sur le site CV — l'objectif est de réutiliser, pas de réinventer :

- **Hébergement + frontend :** Vercel. Contrairement à GitHub Pages (statique pur), Vercel gère nativement la génération d'image OG dynamique par page (`@vercel/og`), ce qui est le morceau technique le plus spécifique de ce projet.
- **Base de données :** Supabase (Postgres) — table `submissions` (réponses, scores, langue, ton choisi, timestamp, `ref_id` parent), réutilise le compte déjà existant.
- **IA :** réutiliser telle quelle la fonction Supabase Edge du Fit-Checker (repli multi-modèles `gemini-3.7-flash → 3.6 → 3.5 → gemini-flash-latest`), adaptée pour ce nouveau prompt (qui doit désormais gérer 2 langues × 2 tons = 4 variantes de prompt système, voir §6bis).
- **i18n :** reprendre le pattern éprouvé sur le CV (dictionnaire `UI_STRINGS`, fonction `tc()` pour les champs de contenu, détection `navigator.language` avec `?lang=` prioritaire dans l'URL).
- **Analytics :** GoatCounter (déjà en place ailleurs, gratuit, sans cookies) + un événement custom par partage et par analyse complétée.
- **Frontend technique :** vanilla JS/CSS pour aller vite, sauf si Claude Code juge que la complexité d'état du questionnaire justifie un framework léger (React) — décision laissée à son appréciation technique une fois le détail du questionnaire posé.

## 9. Pourquoi pas de scraping d'URL en V1

Analyser automatiquement un site via scraping + IA semble séduisant mais introduit un risque de fiabilité (sites qui bloquent le scraping, contenu qui ne reflète pas la réalité produit, résultats inconsistants selon la qualité du design plutôt que la substance growth réelle). Un questionnaire déclaratif est plus lent à remplir mais **produit un score explicable et reproductible** — un prérequis pour que l'outil garde de la crédibilité une fois partagé publiquement.

## 10. Thème "Tour de France" : discret par défaut, événementiel au moment du vrai Tour

Décision explicite d'Antoine : ne pas pousser la métaphore cycliste dans tout le produit en continu (risque de gadget qui lasse). Deux niveaux :

- **Toujours actif (discret)** : les 5 catégories AARRR sont nommées "étapes" dans l'UI. C'est tout pour le quotidien.
- **Activation événementielle** : pendant les dates réelles du Tour de France (à configurer chaque année via une simple constante de date dans le code — pas de calcul automatique à construire, la fenêtre est courte et connue à l'avance), débloquer ponctuellement :
  - Un badge "Maillot Jaune" pour les meilleurs scores
  - Un vocabulaire ponctuel ("échappée" pour un pilier qui sort du lot, "peloton" pour un score dans la moyenne)
  - Éventuellement un post LinkedIn/X dédié d'Antoine pour surfer sur l'actualité du vrai Tour — un vrai prétexte de contenu annuel, pas juste une fonctionnalité produit.

Cette fenêtre événementielle est un **fast-follow**, pas un prérequis MVP — le produit doit être solide et complet sans elle.

## 11. Décisions restant à trancher

- **Nom de domaine** pour "Tour de Growth" — à vérifier avant de s'y attacher.
- **Dates exactes de la fenêtre événementielle** (§10) — à fixer une fois qu'on s'approche de la construction de cette fonctionnalité (fast-follow, non bloquant pour le MVP).

---

## 12. Résolution des questions ouvertes du handoff design

Claude Design a produit un handoff très complet (`design/DESIGN-BRIEF.md`) et a soulevé 10 questions ouvertes avant construction. Certaines sont des décisions produit qu'il m'incombait de trancher avec Antoine ; d'autres sont des décisions d'implémentation laissées au jugement de Claude Code. Voici le partage :

**Tranchées ici (produit) :**
- **Arrondi et cohérence des totaux** → voir §6 ci-dessus (arrondir chaque pilier d'abord, sommer ensuite).
- **Départage du pilier le plus faible en cas d'égalité** → voir §6 ci-dessus (ordre canonique AARRR).
- **Résultat échantillon ("See a sample result")** → un résultat fixe codé en dur, jamais recalculé, toujours étiqueté visuellement comme échantillon (déjà prévu dans le design : "Sample B2B SaaS"). Pas de génération dynamique pour cet écran.
- **Navigation de la landing** ("How it works", "Examples", "Roast mode") → **coupée du MVP.** Ce sont des liens de maquette sans page définie ; le hero explique déjà suffisamment l'outil en une phrase. Si Antoine veut les réintroduire plus tard, ce sera une décision produit explicite, pas une omission à combler silencieusement.
- **Persistance des résultats** → un résultat partagé reste accessible **indéfiniment** (pas d'expiration). Un lien qui meurt casse la boucle de croissance des mois après le partage initial — c'est le contraire de l'objectif du produit.
- **Token `--red-ink` (`#A32E1F`)** ajouté par Claude Design pour l'accessibilité → **approuvé**, à intégrer officiellement dans le design system.
- **OG image par ton** → **oui, une image Open Graph distincte pour le mode Roast** (bordure et badge rouges), pas une image neutre partagée par les deux tons — la distinction de ton doit se voir dès l'aperçu du lien, avant même le clic.

**Laissées au jugement de Claude Code (implémentation) :**
- Mécanisme technique de génération de l'image OG (Satori, Puppeteer, ou autre) — contrainte : la police Stardos Stencil doit être embarquée, jamais un fallback système (le chiffre pochoir EST l'image).
- Choix du framework front (vanilla vs React/autre) — voir §8, laissé à l'appréciation technique.

**Non tranchées ici, à traiter dans une prochaine session avec moi (agent produit) — Claude Code ne doit PAS inventer ce contenu :**
- **Bibliothèque de textes de verdict** (Strengths / "Where you're losing time") par palier de score, par pilier, dans les 2 tons × 2 langues. Les phrases actuelles dans le design sont des exemples de calibrage, pas la copie finale.
- **Le résumé d'une ligne sous le chiffre de score** ("Solid engine, one flat tyre…") ajouté par Claude Design — bon réflexe (le chiffre seul ne dit rien sur mobile), mais les paliers et phrases réels restent à écrire.
- **Copie française complète** des 15 questions, réponses, pages de résultat et voix "roast" — l'écran 07 du design est un test de mise en page, pas une traduction approuvée. Le ton "roast" en particulier ne survit pas à une traduction automatique.

**En attendant cette bibliothèque de textes**, Claude Code peut construire et tester l'intégralité du pipeline technique (questionnaire → scoring → appel Gemini → rendu → partage) avec le contenu d'exemple déjà présent dans le design, clairement marqué comme temporaire dans le code (ex. `// TODO: copie de verdict finale à venir, voir SPEC.md §12`), sans que ça bloque l'avancement du MVP.

---

## 13. Prompt de démarrage pour Claude Code

À copier tel quel dans une nouvelle session Claude Code, dans un dossier de projet vide (avec ce fichier de spec déposé à la racine sous `SPEC.md`) :

```
Je veux construire "Tour de Growth", un outil web public bilingue (FR/EN) qui
fait passer un questionnaire guidé sur les fondamentaux growth (framework
AARRR) à un fondateur/PM, puis génère un score partageable avec une image
Open Graph dynamique par résultat.

Lis d'abord entièrement, dans cet ordre :
1. CLAUDE.md à la racine (contexte général, tes marges de manœuvre, et les
   leçons déjà tirées d'un projet précédent)
2. SPEC.md à la racine (parcours utilisateur, périmètre MVP, modèle de
   scoring, réglage de ton Neutre/Roast, stack technique visée, et surtout
   §12 qui tranche — ou renvoie explicitement à plus tard — les questions
   ouvertes soulevées par le design)
3. design/DESIGN-BRIEF.md (tokens exacts, inventaire d'écrans, copie réelle,
   comportements d'interaction — c'est la référence visuelle à haute fidélité)

Avant d'écrire la moindre ligne de code :
1. Propose-moi un plan de build découpé en étapes vérifiables (pas un gros
   bloc monolithique), et attends ma validation avant de commencer.
2. Si tu identifies un écart entre ce que demande la spec et ce qui est
   réellement raisonnable à construire pour un MVP solo, dis-le-moi
   clairement plutôt que d'implémenter silencieusement une version dégradée.

Contraintes de méthode, non négociables (détaillées dans CLAUDE.md) :
- Le bilingue FR/EN est un prérequis dès le premier commit fonctionnel.
- Le scoring chiffré doit rester déterministe et explicable (règles fixes,
  arrondi par pilier avant sommation — voir SPEC.md §6) ; l'IA (Gemini) ne
  sert qu'à la synthèse qualitative, jamais à modifier les points bruts.
- Pour l'appel Gemini, réutilise le principe de repli multi-modèles :
  gemini-3.7-flash → 3.6 → 3.5 → l'alias gemini-flash-latest en dernier
  recours. Ne code jamais en dur un seul nom de modèle sans repli.
- Le réglage de ton Neutre/Roast doit être un choix explicite de
  l'utilisateur, avec le garde-fou anti-moquerie-personnelle codé en dur
  dans le prompt système Gemini.
- Le mécanisme de partage (`?ref=`) et son attribution sont le cœur du
  produit : instrumente-le dès le premier commit fonctionnel.
- Instrumente les analytics (GoatCounter + événements custom) dès le MVP.
- Le thème "Tour de France" reste discret par défaut (juste "étapes") — la
  fonctionnalité événementielle (Maillot Jaune, dates du vrai Tour) est un
  fast-follow explicite, ne la construis pas dans le MVP.
- La bibliothèque de textes de verdict (forces/axes par palier, en 2 tons ×
  2 langues) n'est pas encore fournie (voir SPEC.md §12) : construis et
  teste tout le pipeline avec le contenu d'exemple du design, marqué
  clairement comme temporaire dans le code, sans bloquer sur son absence.

Une fois le plan validé, avance étape par étape, en me montrant le résultat
concret (visuel + comportement réel testé) à chaque étape plutôt qu'en fin
de parcours.
```

---

## Ce qu'il reste à faire avant de lancer Claude Code

- [ ] Vérifier la disponibilité du nom de domaine pour "Tour de Growth"
- [ ] Créer un nouveau dossier de projet local + `git init` (ou nouveau repo GitHub, même logique que pour le CV)
- [ ] Installer l'App GitHub "Claude" sur ce nouveau repo si tu comptes utiliser Claude Code dessus (voir la procédure `/install-github-app` déjà utilisée pour le CV)
- [ ] Déposer à la racine du projet : `CLAUDE.md`, `SPEC.md` (ce fichier), et le dossier `design/` (DESIGN-BRIEF.md + les fichiers de référence Claude Design)
- [ ] Lancer Claude Code dans ce dossier avec le prompt du §13
- [ ] Prévoir une session avec moi (agent produit) pour écrire la bibliothèque de textes de verdict avant que le MVP soit vraiment "fini" (voir §12) — le pipeline technique peut avancer sans, mais le produit ne sera pas complet tant que ce contenu manque
