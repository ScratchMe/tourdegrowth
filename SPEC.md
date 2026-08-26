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

1. **Landing page** : proposition de valeur en une phrase + CTA ("Évalue ton produit" / "Check your product")
2. **Questionnaire guidé** : 15 questions à choix simple (QCM/toggle), réparties sur les 5 piliers AARRR, ~2-3 minutes. **Pas de scraping d'URL en V1** (fiabilité et rapidité de build > exhaustivité — voir §9 pour la justification)
3. **Calcul du score** : scoring déterministe basé sur des règles (voir §6) + un appel Gemini pour la synthèse qualitative (mêmes principes que le Fit-Checker du CV : prompt structuré, réponse JSON, repli multi-modèles)
4. **Page de résultat** :
   - Score global (0-100) + 5 sous-scores AARRR
   - 3 points forts, 2 axes d'amélioration, 1 recommandation prioritaire (généré par IA)
   - Bouton "Partager mon score" → image Open Graph générée dynamiquement pour cette page précise (le cœur du mécanisme viral, voir §7)
   - URL unique et persistante pour ce résultat
   - CTA secondaire "Analyser un autre produit" (boucle de ré-acquisition)

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

## 12. Prompt de démarrage pour Claude Code

À copier tel quel dans une nouvelle session Claude Code, dans un dossier de projet vide (avec ce fichier de spec déposé à la racine sous `SPEC.md`) :

```
Je veux construire "Tour de Growth", un outil web public bilingue (FR/EN) qui
fait passer un questionnaire guidé sur les fondamentaux growth (framework
AARRR) à un fondateur/PM, puis génère un score partageable avec une image
Open Graph dynamique par résultat.

Lis d'abord entièrement SPEC.md à la racine de ce dossier : il contient le
parcours utilisateur, le périmètre MVP (et ce qui est explicitement hors
périmètre), un modèle de scoring de départ, le réglage de ton Neutre/Roast,
et la stack technique visée (Vercel + Supabase + Gemini avec repli
multi-modèles + GoatCounter).

Avant d'écrire la moindre ligne de code :
1. Propose-moi un plan de build découpé en étapes vérifiables (pas un gros
   bloc monolithique), et attends ma validation avant de commencer.
2. Signale-moi explicitement les décisions ouvertes listées en §11 de la
   spec plutôt que de trancher seul.
3. Si tu identifies un écart entre ce que demande la spec et ce qui est
   réellement raisonnable à construire pour un MVP solo, dis-le-moi
   clairement plutôt que d'implémenter silencieusement une version dégradée.

Contraintes de méthode, non négociables :
- Vérifie systématiquement le rendu visuel de ce que tu construis (capture
  d'écran ou équivalent) avant de considérer une étape terminée — ne te fie
  jamais uniquement à une relecture de code pour du visuel ou de la mise en
  page.
- Le bilingue FR/EN est un prérequis dès le premier commit fonctionnel, pas
  une couche à ajouter en fin de projet — reprends le pattern dictionnaire +
  fonction de traduction déjà éprouvé, décrit en §8 de la spec.
- Le scoring chiffré doit rester déterministe et explicable (règles fixes) ;
  l'IA (Gemini) ne sert qu'à la synthèse qualitative (forces/axes/recommandation),
  jamais à modifier les points bruts.
- Pour l'appel Gemini, réutilise le principe de repli multi-modèles déjà
  éprouvé : essayer gemini-3.7-flash, puis 3.6, puis 3.5, puis terminer par
  l'alias gemini-flash-latest (maintenu par Google, toujours à jour) en
  dernier recours. Ne code jamais en dur un seul nom de modèle sans repli.
- Le réglage de ton Neutre/Roast (§6bis) doit être un choix explicite de
  l'utilisateur avant analyse, avec le garde-fou anti-moquerie-personnelle
  codé en dur dans le prompt système Gemini, pas laissé à l'appréciation du
  modèle au moment de l'appel.
- Le mécanisme de partage (`?ref=`) et l'attribution qui en découle sont le
  cœur du produit, pas une fonctionnalité annexe : instrumente-le dès le
  premier commit fonctionnel, pas en fin de projet.
- Instrumente les analytics (GoatCounter + événements custom partage/analyse
  complétée) dès le MVP, pas après coup.
- Le thème "Tour de France" reste discret par défaut (juste le mot "étapes"
  pour désigner les catégories) — ne construis PAS la fonctionnalité
  événementielle du §10 (Maillot Jaune, dates du vrai Tour) dans le MVP,
  c'est un fast-follow explicite.

Une fois le plan validé, avance étape par étape, en me montrant le résultat
concret (visuel + comportement réel testé) à chaque étape plutôt qu'en fin
de parcours.
```

---

## Ce qu'il reste à faire avant de lancer Claude Code

- [ ] Vérifier la disponibilité du nom de domaine pour "Tour de Growth"
- [ ] Créer un nouveau dossier de projet local + `git init` (ou nouveau repo GitHub, même logique que pour le CV)
- [ ] Installer l'App GitHub "Claude" sur ce nouveau repo si tu comptes utiliser Claude Code dessus (voir la procédure `/install-github-app` déjà utilisée pour le CV)
- [ ] Déposer ce fichier à la racine du projet sous le nom `SPEC.md`
- [ ] Lancer Claude Code dans ce dossier avec le prompt du §12
