# Revue technique & fonctionnelle — 2026-09-05

**Statut :** constats validés par Antoine le 2026-09-05, traitement à venir item par item, dans l'ordre ci-dessous.

## Comment utiliser ce document

- Chaque constat a un identifiant stable (`R-01` … `R-20`), un type (**F** = fonctionnel/produit, **T** = technique), un effort estimé (XS / S / M / L) et un **statut** à tenir à jour ici même : `À faire` → `En cours` → `Fait (PR #n, date)`.
- Les items sont regroupés en **lots** et l'ordre des lots est l'ordre de traitement. À l'intérieur d'un lot, l'ordre est indicatif sauf quand une dépendance est notée.
- Un PR par item, sauf quand le détail indique explicitement « à faire avec R-xx ».
- Quand un item est livré : mettre à jour la colonne statut ci-dessous, et ajouter l'entrée habituelle dans `CLAUDE.md` (décision prise, pièges rencontrés, ce qui a été vérifié en réel).
- Ce document est un instantané du repo au 2026-09-05 (commit `1a3f8f4`, après le PR #19). Les références `fichier:ligne` sont celles de ce commit et peuvent glisser ensuite.

## État vérifié au moment de la revue

Tout a été exécuté réellement dans le repo, pas déduit de la lecture.

| Vérification | Résultat |
|---|---|
| `npx vitest run` | 128 tests verts, 17 fichiers |
| `npx tsc --noEmit` | OK (une dépréciation `baseUrl`, voir R-18) |
| `npm run build` | OK — mais **aucune page statique** hors `robots.txt`/`sitemap.xml` : toutes les routes sont `ƒ` (dynamiques), voir R-13 |
| `npm run lint` | **Cassé** : `next lint` n'existe plus en Next.js 16, aucune config ESLint dans le repo, voir R-06 |
| `npm audit --omit=dev` | 6 vulnérabilités modérées, toutes via `firebase-admin` → `@google-cloud/storage` / `teeny-request`, voir R-18 |
| `.github/` | Absent — aucune CI, voir R-05 |
| Playwright | Aucune config ni spec committée malgré les `data-testid` posés partout, voir R-07 |

## Vue d'ensemble et ordre de traitement

| Lot | ID | Titre | Type | Effort | Statut |
|---|---|---|---|---|---|
| **A — Stopper les dégâts sur les données réelles** | R-01 | Deep dive : jeton de propriétaire | F+T | S/M | **Fait** (PR #21, 2026-09-05) |
| | R-02 | Ne plus exposer `freeContext`/`contextAnswers` dans la page publique | T | XS | **Fait** (PR #21, 2026-09-05) |
| | R-03 | Attribution `?ref=` : anti auto-parrainage + validation serveur | F+T | S | **Fait** (PR #22, 2026-09-05) |
| | R-04 | Validation API stricte et messages d'erreur génériques | T | S | **Fait** (PR #23, 2026-09-05) |
| **B — Filet automatisé** | R-05 | CI GitHub Actions (tsc, tests, build, puis lint et E2E) | T | S | **Fait** (PR #25, 2026-09-05) |
| | R-06 | Réparer le lint (ESLint flat config) | T | S | **Fait** (PR #26, 2026-09-05) |
| | R-07 | Playwright committé : parcours critique en E2E | T | M | **Fait** (PR #27, 2026-09-05) |
| | R-08 | Supprimer le code mort | T | XS | **Fait** (PR #26, 2026-09-05) |
| **C — Boucle de partage (cœur du produit)** | R-09 | Verdict Quick résolu dans la langue du visiteur | F | S | **Fait** (PR #28, 2026-09-05) |
| | R-10 | Partage enrichi : métadonnées personnalisées, texte, boutons | F | M | À faire |
| | R-11 | Instrumentation du funnel dans GoatCounter | F | S | À faire |
| | R-12 | Explicabilité : « comment ce score est calculé » | F | M | À faire |
| **D — Architecture i18n / SEO / cache** | R-13 | Locale dans l'URL, `hreflang`, pages statiques, switch de langue | F+T | L | À faire |
| | R-14 | Cache du résultat partagé + OG 404 pour id inconnu | T | M | À faire |
| **E — Robustesse backend** | R-15 | Rate limiting sur les routes POST + `maxDuration` | T | S/M | À faire |
| | R-16 | Appel Gemini : header, `responseSchema`, `finishReason`, un seul appel | T | M | À faire |
| | R-17 | Infra versionnée : règles Firestore, env vars documentées | T | S | À faire |
| | R-18 | Dépendances et config TypeScript | T | S | À faire |
| **F — Expérience** | R-19 | Accessibilité du parcours | F+T | M | À faire |
| | R-20 | Petits plus produit (dernier score, benchmark, persistance Deep dive) | F | S/M | À faire |
| | R-21 | La nav FR de la landing déborde le viewport mobile | F+T | XS | À faire |
| | R-22 | Trois paires de couleurs sous le seuil AA de contraste | F+T | S | À faire |

### Pourquoi cet ordre

1. **Lot A d'abord** parce que ce sont les seuls points qui abîment des données réelles aujourd'hui, ou qui faussent la métrique reine (le K-factor) que le projet existe pour produire. Ce sont aussi des correctifs courts.
2. **Lot B ensuite**, avant tout gros chantier : une fois la CI, le lint et deux ou trois specs E2E en place, tout ce qui suit (et en particulier le lot D, qui touche le routing de toute l'app) se fait avec un filet.
3. **Lot C** parce que le partage est le cœur du produit (SPEC.md §7) et que ces items sont indépendants du refactor i18n.
4. **Lot D** est le chantier le plus lourd et le plus structurant. Il vient après C pour ne pas bloquer les gains rapides du partage derrière lui, et après B pour être couvert par les E2E.
5. **Lots E et F** : robustesse et polish, importants mais sans urgence tant que le volume reste celui d'un side project. À ré-évaluer à la hausse si le lancement (plan de croissance, phase 1) approche.

---

## Lot A — Stopper les dégâts sur les données réelles

### R-01 — Deep dive : jeton de propriétaire

**Type** F+T · **Effort** S/M · **Statut** **Fait** (PR #21, 2026-09-05) — voir `CLAUDE.md` pour les décisions prises et ce qui a été vérifié en réel

**Constat.** La route `POST /api/submissions/[id]/deep-dive` et la page `/deep-dive/[id]` sont accessibles à quiconque connaît l'id d'un résultat, c'est-à-dire à tous les destinataires d'un lien partagé. La carte « Action prioritaire — verrouillée » et son bouton « Débloquer mon action prioritaire → » s'affichent pour tous les visiteurs (`src/app/r/[id]/ResultView.tsx`, condition `!isSample && id`). Un visiteur qui clique complète le Deep dive avec **son** contexte et **son** texte libre ; la page du partageur affiche alors des recommandations Gemini basées sur l'activité d'un inconnu. L'idempotence de la route (`src/app/api/submissions/[id]/deep-dive/route.ts:60`, « si `deepDive` existe déjà, renvoyer tel quel ») rend ça définitif : le vrai auteur ne pourra plus jamais faire le sien.

**Impact.** Corruption irréversible d'un résultat réel par un tiers, sur la surface la plus exposée du produit (le lien partagé). Pas hypothétique : c'est le chemin normal d'un destinataire curieux.

**Correctif proposé.**
- À la création (`POST /api/submissions`), générer un `ownerToken` (`crypto.randomUUID()` suffit), stocker uniquement son **hash SHA-256** sur le document Firestore (`ownerTokenHash`), renvoyer le jeton en clair une seule fois dans la réponse 201.
- Côté client, nouvelle clé localStorage `tdg.results.v1` : liste `{ id, ownerToken, createdAt }` des résultats créés depuis ce navigateur (réutilisée par R-03, R-12 et R-20).
- `POST .../deep-dive` exige `ownerToken` dans le body ; comparaison du hash ; `403` sinon. Ne jamais renvoyer le hash dans aucune réponse ni payload de page.
- `ResultView` reçoit un flag `isOwner` calculé **après montage** (lecture localStorage dans un `useEffect`, jamais dans l'état initial, cf. leçon d'hydratation de l'étape 4). La carte verrouillée n'apparaît que pour le propriétaire. Pour les autres, le slot reste vide (ou une carte « Fais ton propre Tour » pointant vers `/quiz?ref=<id>`, cohérent avec R-03).
- `/deep-dive/[id]` redirige vers `/r/[id]` si aucun jeton n'existe en local pour cet id.
- Les soumissions antérieures à ce changement n'ont pas de hash : leur Deep dive devient impossible. Volume faible, à accepter plutôt que d'ouvrir une exception contournable.

**Limites assumées.** Un propriétaire qui change d'appareil ou vide son localStorage perd l'accès au Deep dive de ce résultat. C'est le prix de « pas de compte utilisateur » (SPEC.md §5), à documenter dans `/how-it-works` si besoin.

**Vérification attendue.** Tests unitaires sur la route (403 sans jeton, 403 mauvais jeton, 200 bon jeton, 403 sur une soumission sans hash). E2E : un visiteur sans jeton ne voit pas la carte verrouillée ; `curl` de `/r/<id>` ne contient jamais `ownerTokenHash`.

### R-02 — Ne plus exposer `freeContext`/`contextAnswers` dans la page publique

**Type** T · **Effort** XS · **Statut** **Fait** (PR #21, 2026-09-05) — livré avec R-01, même PR comme prévu ici

**Constat.** `src/app/r/[id]/page.tsx:70` passe l'objet `submission.deepDive` **entier** au Client Component `ResultView`. `DeepDiveResult` contient `freeContext` (le texte libre où un fondateur décrit son business, ses freins, ses clients), `contextAnswers` et `modelUsed`. Rien de tout ça n'est rendu, mais tout est sérialisé dans le payload RSC de la page, donc lisible par n'importe quel destinataire du lien (ou n'importe quel crawler) en ouvrant la source.

**Impact.** Fuite de données confidentielles saisies sous la promesse implicite « ça sert à ta recommandation », sur une page conçue pour être partagée publiquement.

**Correctif proposé.** Construire un view-model minimal côté serveur : `{ verdicts: { neutral: { pillarRecommendations, priorityAction }, roast: { … } } }`, et ne passer que ça. Même principe pour la réponse de `POST .../deep-dive`, qui renvoie aujourd'hui la soumission complète : renvoyer `{ id }` suffit, le client redirige. À faire avec R-01 (même fichier, même PR).

**Vérification attendue.** Sur une soumission réelle avec texte libre, `curl /r/<id>` puis `grep` d'un fragment du texte libre : absent du HTML et du payload RSC.

### R-03 — Attribution `?ref=` : anti auto-parrainage + validation serveur

**Type** F+T · **Effort** S · **Statut** **Fait** (PR #22, 2026-09-05) — politique retenue : **first-touch**, voir `CLAUDE.md`

**Constat.**
- Le bouton « Refaire le Tour » d'un résultat pointe vers `/quiz?ref=<id de ce résultat>` (`src/app/r/[id]/ResultView.tsx:276`) **y compris pour l'auteur**. Chaque re-test par la même personne est donc compté comme une analyse parrainée, avec elle-même comme « partageur unique ». K = analyses parrainées ÷ partageurs uniques : un utilisateur seul qui refait trois fois le Tour produit un K-factor de 3,00.
- `saveRefId` (`src/lib/quiz/storage.ts:67`) écrase sans condition : attribution last-touch implicite, jamais décidée explicitement.
- Côté serveur, `refId` est accepté tel quel (toute chaîne non vide). Rien n'empêche `?ref=hello` ni `?ref=<son propre futur id>`.

**Impact.** La métrique que SPEC.md §1 désigne comme le critère de succès du projet (« à citer en entretien ») est gonflée par construction.

**Correctif proposé.**
- Client : ne pas générer `?ref=` sur « Refaire le Tour » quand `isOwner` (R-01). En complément, à la soumission, ignorer un `refId` présent dans `tdg.results.v1` (mes propres résultats), pour couvrir le cas où le ref a été capturé avant.
- Serveur : `refId` doit avoir un format UUID v4, exister en Firestore (une lecture, coût négligeable), et être différent de l'id en cours de création ; sinon stocké `null`. Ne pas rejeter la soumission pour autant : un ref invalide ne doit jamais bloquer un utilisateur.
- Décider et documenter la politique first-touch vs last-touch. Recommandation : **first-touch** (le premier partage qui a amené la personne est celui qui compte ; un `?ref=` ultérieur ne remplace pas un ref déjà stocké tant qu'aucune soumission n'a été faite), c'est la lecture la plus fidèle de « issu du parrainage de `<id>` » (SPEC.md §7). Réinitialiser le ref stocké après une soumission réussie, pour qu'un second Tour parte propre.

**Vérification attendue.** Tests unitaires `storage` (first-touch, reset) et route (UUID invalide → `null`, inexistant → `null`, self-ref → `null`). E2E : l'auteur clique « Refaire » → soumission sans `refId` ; un visiteur → avec.

### R-04 — Validation API stricte et messages d'erreur génériques

**Type** T · **Effort** S · **Statut** **Fait** (PR #23, 2026-09-05) — clôt le lot A

**Constat.**
- `isAnswers` (`src/app/api/submissions/route.ts:21`) vérifie seulement que chaque valeur vaut 0, 1 ou 2. Il accepte des **clés arbitraires** (écrites telles quelles dans Firestore avec la soumission) et n'exige pas les 15 ids. Un `answers` incomplet passe la validation, puis `computeScore` lève une exception → réponse **502** avec le message interne, alors que c'est une erreur client (400).
- Les deux `catch` de fin de route (`route.ts:76` et l'équivalent deep-dive) renvoient `err.message` au navigateur. Selon l'échec, ce message contient une erreur Firestore, le JSON brut de la réponse Gemini (`extractGeminiText`, `parseDeepDiveVerdict` font `JSON.stringify(data)` dans leurs messages), ou la sortie d'erreur de l'API Gemini. Le front l'affiche dans `errorDetail`.

**Correctif proposé.** Valider que les clés de `answers` sont **exactement** les 15 ids de `QUESTIONS` (ni plus, ni moins) → 400 sinon. Dans les `catch` : `console.error` complet côté serveur (Vercel logs), réponse `{ error: "<code court stable>" }` (ex. `SCORING_FAILED`, `DEEP_DIVE_FAILED`) ; le front continue d'afficher ce code en petit mono sous la phrase du brief (utile au support), sans contenu interne. Pas besoin de bibliothèque de schéma pour deux routes : les validateurs à la main suffisent, il faut juste les compléter.

**Vérification attendue.** Tests de route : clé en trop → 400, clé manquante → 400, valeur hors 0-2 → 400, échec Firestore simulé → 502 avec message générique.

---

## Lot B — Filet automatisé

### R-05 — CI GitHub Actions

**Type** T · **Effort** S · **Statut** **Fait** (PR #25, 2026-09-05) — le lint (R-06) et les E2E (R-07) s'ajouteront au workflow avec leurs propres PR. **Reste une action manuelle d'Antoine** : rendre le check obligatoire sur `main` dans les paramètres GitHub du repo (Settings → Branches → Branch protection rules), ce qui ne peut pas se faire depuis le code.

**Constat.** Pas de `.github/workflows`. Vercel construit à chaque push, mais ni Vitest ni `tsc` ne tournent jamais automatiquement. Les 19 PR mergées à ce jour l'ont été sans aucun check.

**Correctif proposé.** `.github/workflows/ci.yml` déclenché sur `push` et `pull_request` : Node 22 avec cache npm, `npm ci`, `npx tsc --noEmit`, `npx vitest run`, `npm run build` (le build n'a besoin d'aucun secret : les pages qui lisent Firestore sont dynamiques). Ajouter le lint (R-06) et les E2E (R-07) au fur et à mesure. Côté GitHub, activer la protection de `main` (check requis) — action manuelle d'Antoine dans les paramètres du repo.

**Vérification attendue.** Un PR qui casse un test apparaît rouge.

### R-06 — Réparer le lint

**Type** T · **Effort** S · **Statut** **Fait** (PR #26, 2026-09-05) — ESLint 9 flat config, livré avec R-08 comme prévu ici

**Constat.** Next.js 16 a retiré la commande `next lint` ; `npm run lint` (`package.json:10`) échoue avec « Invalid project directory provided, no such directory: …/lint ». Le repo n'a **jamais** eu de config ESLint. Les commentaires `// eslint-disable-next-line …` (dans `src/app/quiz/page.tsx` et `src/app/page.tsx`) n'ont donc jamais désactivé quoi que ce soit.

**Correctif proposé.** `eslint.config.mjs` (flat config) avec `eslint-config-next` (core-web-vitals + TypeScript), script `"lint": "eslint ."`, corriger ce qui remonte, réévaluer chaque `eslint-disable` existant avec la règle enfin active (celui de `quiz/page.tsx` sur `exhaustive-deps` est volontaire et doit rester, avec sa justification en commentaire). Optionnel : Prettier avec la largeur déjà pratiquée (~120) pour verrouiller le style existant. Alternative acceptable : Biome (lint + format, plus rapide) — mais un seul outil, pas les deux. Faire R-08 dans le même PR.

**Vérification attendue.** `npm run lint` exit 0 en local et en CI.

### R-07 — Playwright committé : parcours critique en E2E

**Type** T · **Effort** M · **Statut** **Fait** (PR #27, 2026-09-05) — 17 specs, clôt le lot B. A révélé R-22 dès son premier passage.

**Constat.** Chaque étape du projet a été vérifiée visuellement avec Playwright (voir CLAUDE.md), mais toujours via des scripts jetables jamais committés. Résultat : zéro protection contre une régression du parcours critique, alors que les hooks sont déjà là (`data-testid` : `answer-option`, `back-button`, `get-score-cta`, `tone-option`, `retry-button`, `deep-dive-answer-option`, `free-context-textarea`, `skip-button`, `submit-button`).

**Correctif proposé.** `@playwright/test` en devDependency, `playwright.config.ts` (webServer sur `next build && next start`, Chromium seul), dossier `e2e/` avec trois specs :
1. **Parcours complet** : 15 réponses → sélecteur de ton → `POST /api/submissions` intercepté pour renvoyer `{ id: "sample" }` → redirection effective vers `/r/sample` (page réelle, sans Firestore). Vérifie aussi que `localStorage` contient les 15 réponses avant soumission.
2. **Erreur et reprise** : API interceptée en 500 → écran d'erreur → « Réessayer » repasse par le chargement et jamais par la question 1 (promesse SPEC.md §4).
3. **Attribution et langue** : `/?ref=abc` → `/quiz` → ref toujours en localStorage ; `/?lang=fr` → UI en français, `/?lang=en` → anglais (leçon n°5 de CLAUDE.md : tester les deux langues).

Ajouter `@axe-core/playwright` sur landing, quiz et `/r/sample` (lien avec R-19). Captures de référence (`toHaveScreenshot`) : optionnel, à n'activer que si les polices sont stables en CI, sinon ça produit du bruit. Brancher dans la CI (R-05) avec `npx playwright install --with-deps chromium`.

**Vérification attendue.** Les trois specs vertes en CI ; une régression volontaire (ex. retirer la redirection) les fait échouer.

### R-08 — Supprimer le code mort

**Type** T · **Effort** XS · **Statut** **Fait** (PR #26, 2026-09-05) — `clearRefId` finalement conservé : R-03 l'utilise, comme ce constat l'anticipait

**Constat.** `countSubmissionsReferredBy` (`src/lib/submissions/repository.ts`, jamais appelé — `growth-stats.ts` fait un seul passage), `ctaSwitchToRoast` (`src/lib/i18n/dictionary.ts`, jamais lu — cohérent avec la décision « exactement 2 CTA » de l'étape 7), `clearRefId` (`src/lib/quiz/storage.ts`, seul usage : son propre test — deviendra utile avec R-03, à garder si R-03 l'emploie, sinon supprimer).

**À ne pas toucher.** `components/result/ToneToggle` et `components/core/Tag` sont conservés volontairement (portage complet du design system, documenté dans CLAUDE.md étape 13).

**Correctif proposé.** Supprimer, avec R-06 dans le même PR.

---

## Lot C — Boucle de partage (cœur du produit)

### R-09 — Verdict Quick résolu dans la langue du visiteur

**Type** F · **Effort** S · **Statut** **Fait** (PR #28, 2026-09-05) — le champ `verdicts` a bien été retiré de `Submission`, comme proposé ici

**Constat.** `createSubmissionFlow` résout les deux verdicts avec `input.locale` (la langue de l'auteur) et les **stocke** (`src/lib/submissions/create-submission.ts:51`). `ResultView` affiche ces textes stockés, mais tout le reste de l'UI suit `useLocale()` du **visiteur**. Un Français qui partage à un collègue anglophone lui montre une page en anglais avec un headline et des phrases de piliers en français, et inversement. C'est la première impression du produit pour chaque personne qui arrive par un lien.

**Correctif proposé.** Le verdict Quick est un pur lookup (`buildQuickVerdict(tone, locale, pillars, weakestPillar)`, synchrone, déjà utilisé ainsi pour `/r/sample`). Le résoudre **au rendu**, dans la langue du visiteur, à partir de `pillars`/`weakestPillar`. Extraire un helper pur `buildResultViewModel(submission, viewerLocale)` testable unitairement. Arrêter de stocker `verdicts` sur la soumission (donnée dérivée, reproductible à volonté ; rendre le champ optionnel dans le type pendant la transition, les anciens documents le gardent sans conséquence). Les recommandations Deep dive (texte Gemini) restent dans la langue où le Deep dive a été fait — inévitable, acceptable.

**Vérification attendue.** Test unitaire du helper (soumission `en` + visiteur `fr` → headline FR). E2E : `/r/sample?lang=fr` → headline français.

### R-10 — Partage enrichi

**Type** F · **Effort** M · **Statut** À faire

**Constat.**
- `handleShare` (`src/app/r/[id]/ResultView.tsx:91`) partage `window.location.href` avec un `title` générique, **sans `text`** : sur mobile, la feuille de partage arrive vide de tout message.
- Sur desktop (pas de `navigator.share`), repli presse-papiers avec un « ✓ » pendant deux secondes, sans libellé ni indication de ce qui s'est passé. Aucun bouton LinkedIn / X alors que ce sont les canaux cibles (SPEC.md §2).
- `generateMetadata` (`src/app/r/[id]/page.tsx:15`) : même `title` et `description` pour tous les résultats. Le texte de la carte LinkedIn/X ne dit ni le score ni le pilier faible ; seule l'image le fait. Pas d'`og:locale`.
- L'URL partagée conserve un éventuel `?lang=` présent dans la barre d'adresse.

**Correctif proposé.**
- `generateMetadata` lit la soumission (dédupliquer la lecture Firestore avec la page via `React.cache`, voir R-14) : titre « 74/100 — Tour de Growth », description construite depuis `og.stallSentenceTemplate` + `whereDoesYours`, `openGraph.locale` selon la langue de la soumission.
- `shareData.text` bilingue : « J'ai fait 74/100 à mon bilan growth — c'est sur la Retention que ça cale. Et toi ? » (**copie à valider par Antoine**, marquée `TODO` dans le code conformément au non-négociable sur la copie).
- Desktop : trois actions explicites — « LinkedIn » (`https://www.linkedin.com/sharing/share-offsite/?url=`), « X » (`https://twitter.com/intent/tweet?url=&text=`), « Copier le lien » avec un vrai toast « Lien copié ». À cadrer avec le design system (aucun composant existant pour un groupe de boutons de partage ; le brief dit « native share sheet where available, otherwise copy the URL », on va au-delà — écart à signaler à Claude Design, pas à improviser visuellement).
- Construire l'URL partagée sans `?lang=` (`new URL(location.href)` puis supprimer le paramètre).
- Événement `share/<tone>/<method>` (`native`, `linkedin`, `x`, `copy`) — nomenclature à poser avec R-11.

**Vérification attendue.** `curl` des metas sur un vrai résultat ; E2E : clic « Copier » → presse-papiers = URL sans `?lang=`, toast visible.

### R-11 — Instrumentation du funnel dans GoatCounter

**Type** F · **Effort** S · **Statut** À faire

**Constat.** Événements existants : `submission_completed/<tone>`, `share/<tone>`, `profile_click/<emplacement>`, plus les pageviews. Rien entre l'arrivée sur `/quiz` et la soumission : impossible de savoir où les gens décrochent, ni combien choisissent le roast, ni combien commencent un Deep dive sans le finir. Pour un projet qui veut démontrer une maîtrise de l'AARRR, l'**Activation** de l'outil lui-même n'est pas mesurée.

**Correctif proposé.** Ajouter, via le `trackEvent` existant :
- `quiz_started` (première réponse à la question 1),
- `quiz_stage_completed/<1..5>` (cinq événements au lieu de quinze : la chute par pilier suffit),
- `tone_selected/<tone>` (au clic « Obtiens ton score »),
- `deep_dive_started`, `deep_dive_completed/<with_context|no_context>`,
- `share/<tone>/<method>` (R-10).

Documenter la nomenclature complète en tête de `src/lib/analytics/goatcounter.ts` (une seule source de vérité, comme `PROFILE_CLICK_DETAILS`). Étendre `/admin/stats` avec ces chemins via l'API déjà câblée (`include_paths`) : taux quiz → soumission, soumission → partage, résultat → Deep dive.

**Vérification attendue.** Tests unitaires des points d'appel avec `window.goatcounter` mocké (pattern de l'étape 11). Vérification réelle dans le dashboard GoatCounter après déploiement (impossible depuis le bac à sable, cf. CLAUDE.md).

### R-12 — Explicabilité : « comment ce score est calculé »

**Type** F · **Effort** M · **Statut** À faire

**Constat.** La règle non négociable « un score partagé doit être ré-explicable en 10 secondes » est tenue par le code (`computeScore` est pur et testé), pas par l'interface : la page résultat ne montre jamais les trois réponses derrière chaque sous-score. `Submission.answers` existe en base et n'est jamais lu pour l'affichage.

**Correctif proposé.** Une section dépliable par pilier (élément `<details>` natif, stylé aux tokens) : les trois questions, la réponse choisie, ses points (20/7/0), et le calcul « 47/60 → 16/20 ». **Visible pour le propriétaire uniquement** : les réponses (« Aucune idée du CAC ») en disent plus sur le business que le score, et la page est publique. Pas de fetch authentifié nécessaire : stocker `answers` dans `tdg.results.v1` (R-01) au moment de la soumission et rendre la section côté client depuis localStorage — zéro changement serveur, zéro fuite dans le payload. Copie de la section (titres, formulation du calcul) à valider par Antoine ; aucun composant du design system ne couvre un dépliant, écart à signaler à Claude Design.

**Vérification attendue.** E2E : le propriétaire voit la section avec les bons chiffres ; un visiteur ne la voit pas ; `curl /r/<id>` ne contient pas `answers`.

---

## Lot D — Architecture i18n / SEO / cache

### R-13 — Locale dans l'URL, `hreflang`, pages statiques, switch de langue

**Type** F+T · **Effort** L · **Statut** À faire

**Constat.**
- Le root layout lit `cookies()` et `headers()` (`src/app/layout.tsx:76`). Conséquence : **toutes** les routes sont rendues dynamiquement à chaque requête (`ƒ` dans le résumé de `next build`), landing, `/how-it-works` et les 15 pages glossaire comprises. Aucune n'est servie depuis le CDN. La note « 24 pages statiques » de CLAUDE.md (étape 13) est le compteur de `generateStaticParams`, pas des pages statiques.
- La même URL sert le français ou l'anglais selon le cookie ou `Accept-Language`. Googlebot ne voit qu'une langue par URL (l'anglais, en pratique) : **le contenu français du glossaire et de How it works est invisible pour les moteurs**, alors que la phase 2 du plan de croissance repose dessus. Aucun `hreflang` / `alternates.languages`.
- Aucun switch de langue dans l'interface : `setLocale` du `LocaleProvider` n'est appelé nulle part. Seul `?lang=` (que personne ne devine) permet de changer.
- La landing est entièrement `"use client"` (pour `useSearchParams` et `useLocale`), donc pas de rendu statique possible même en dehors du problème de layout.
- Commentaires obsolètes qui parlent encore de `middleware.ts` (`layout.tsx`, `locale.ts`) alors que le fichier est `proxy.ts`.

**Correctif proposé.**
- Segment de route `[locale]` pour les **pages de contenu indexables** : `/en`, `/fr`, `/en/how-it-works`, `/fr/glossary/cac`, etc. Préfixer les deux langues (symétrique, un seul cas à raisonner). `generateStaticParams` sur `locale` × termes → ces pages deviennent réellement statiques (`○`).
- `/` : redirection 308 dans `proxy.ts` vers `/en` ou `/fr` selon `?lang=` > cookie > `Accept-Language` (la logique `resolveLocale` existante, inchangée).
- Les **pages applicatives** restent non préfixées : `/quiz`, `/r/[id]`, `/deep-dive/[id]`, `/api/*`, `/admin`. Elles sont dynamiques par nature ou `noindex`, et surtout les liens `/r/<id>` déjà partagés doivent continuer à fonctionner indéfiniment (SPEC.md §12). Elles gardent la résolution cookie/header actuelle.
- `metadata.alternates.languages` (+ `x-default`) et `canonical` par locale sur toutes les pages de contenu ; `sitemap.ts` liste les deux langues.
- Le pied de page (`components/brand/SiteFooter`, ajouté le 2026-09-05) pointe vers `/how-it-works` et `/glossary` en dur : ces deux liens devront être préfixés par la locale en même temps que le reste.
- Switch de langue visible dans le header des pages de contenu : un simple lien vers la même page dans l'autre locale, qui pose aussi le cookie (via `?lang=` ou le proxy), pas d'état client.
- Landing en Server Component, avec un îlot client `RefCapture` (`useSearchParams` sous `<Suspense>`) pour `?ref=`.
- Nettoyer les commentaires `middleware.ts`.

**Points d'attention.** C'est le seul item qui touche le routing de toute l'app : le faire **après** R-07 (E2E en place, spec langue incluse). Vérifier le comportement des crawlers sociaux sur `/r/<id>` (inchangé, mais à re-tester). `useLocale()` reste l'API des composants client ; seule la source du `initialLocale` change.

**Vérification attendue.** `next build` montre `○` pour landing, How it works et glossaire dans les deux langues. `curl -I -H 'Accept-Language: fr' /` → 308 vers `/fr`. `curl /fr/glossary/cac` contient les balises `hreflang` `en`, `fr`, `x-default`. E2E FR/EN sur les pages migrées. Les anciennes URL `/glossary/cac` redirigent (308) vers la version localisée pour ne pas casser les liens déjà indexés.

### R-14 — Cache du résultat partagé + OG 404 pour id inconnu

**Type** T · **Effort** M · **Statut** À faire

**Constat.**
- Chaque vue de `/r/[id]` = une lecture Firestore ; l'image OG en fait une deuxième à chaque passage de crawler ; `generateMetadata` (R-10) en ajouterait une troisième. Aucun cache. Le quota Spark (50 000 lectures/jour) est loin pour l'instant, mais c'est exactement la ressource qui s'épuise si un partage devient viral, c'est-à-dire si le produit réussit.
- `loadOgData` (`src/app/r/[id]/opengraph-image.tsx`) renvoie une image « 0/100 » pour un id inconnu : un lien mort présente un faux score dans l'aperçu.

**Correctif proposé.**
- Dans la requête : `React.cache(getSubmissionById)` pour qu'une page, ses métadonnées et l'image OG partagent une seule lecture.
- Entre requêtes : cache tagué `submission:<id>` (`"use cache"` avec `cacheComponents`, ou `unstable_cache` selon ce que Next 16 rend le plus simple au moment de faire — évaluer après R-13, car `cacheComponents` change le modèle de rendu), invalidé par `revalidateTag` à la fin du Deep dive (le seul moment où une soumission change). Une soumission ne change jamais autrement : le cache peut être long.
- OG : `return new Response(null, { status: 404 })` quand la soumission n'existe pas.

**Vérification attendue.** Logs Firestore (console Firebase) : une seule lecture pour page + OG + metadata sur une vue ; zéro lecture sur la vue suivante ; `curl -I /r/inexistant/opengraph-image` → 404.

---

## Lot E — Robustesse backend

### R-15 — Rate limiting sur les routes POST + `maxDuration`

**Type** T · **Effort** S/M · **Statut** À faire

**Constat.** `POST /api/submissions` et `POST /api/submissions/[id]/deep-dive` n'ont aucune limite. Un script peut créer des soumissions en boucle (écritures Firestore, quota Spark 20 000/jour) puis déclencher autant de Deep dives, chacun valant deux appels Gemini et jusqu'à huit requêtes HTTP avec le repli. Aucun `export const maxDuration` sur la route Deep dive, la seule qui dure réellement 30 à 60 secondes en production : on dépend de la valeur par défaut du plan Vercel.

**Correctif proposé.** Limite par IP dans les deux routes (ordre de grandeur : 10 soumissions/heure, 3 Deep dives/heure), avec un store externe puisque les fonctions Vercel n'ont pas de mémoire partagée — Upstash Redis (`@upstash/ratelimit`, gratuit à ce volume) est le plus simple ; les règles de rate limiting du firewall Vercel sont une alternative sans code **si le plan le permet** (à vérifier). Cloudflare Turnstile sur « Obtiens ton score » en complément si des bots apparaissent, pas avant. `export const maxDuration = 120` sur la route Deep dive. Réponse 429 propre, affichée par l'écran d'erreur existant.

**Vérification attendue.** Test d'intégration local : la 11ᵉ soumission en une heure depuis la même IP renvoie 429 ; le retry après expiration passe.

### R-16 — Appel Gemini : header, `responseSchema`, `finishReason`, un seul appel

**Type** T · **Effort** M · **Statut** À faire

**Constat.**
- Clé API dans la query string (`src/lib/gemini/client.ts:69`) : elle se retrouve dans tout log d'URL intermédiaire. L'API accepte le header `x-goog-api-key`.
- Le JSON est demandé par instruction textuelle et nettoyé à la regex (`extractJson`) alors que `generationConfig.responseSchema` garantit la forme côté API.
- `finishReason` n'est jamais lu : une réponse bloquée (`SAFETY`, plausible en mode roast) ou tronquée (`MAX_TOKENS`) produit l'erreur opaque « Unexpected Gemini response shape » au lieu d'un diagnostic clair.
- Deux appels par Deep dive, un par ton (`src/lib/submissions/create-submission.ts:176`) : double latence perçue (le plus lent des deux), double consommation de quota.
- Pas de `maxOutputTokens`.

**Correctif proposé.** Header `x-goog-api-key`. `responseSchema` décrivant `pillarRecommendations` (5 clés obligatoires) + `priorityAction` ; garder `parseDeepDiveVerdict` comme seconde ligne de défense. Lire `candidates[0].finishReason` et `promptFeedback.blockReason` → messages d'erreur explicites, et considérer `SAFETY` comme non retriable (identique sur tous les modèles). **Un seul appel** renvoyant `{ neutral: {…}, roast: {…} }` : le prompt garde le garde-fou anti-moquerie et la calibration roast pour le bloc roast, et le style neutre pour l'autre ; refaire le test d'injection réel de l'addendum 02 après ce changement. La chaîne de repli multi-modèles reste intacte (non négociable). `maxOutputTokens` dimensionné pour les deux tons.

**Vérification attendue.** `client.test.ts` étendu (header, `finishReason` SAFETY → erreur explicite non retriable, `MAX_TOKENS` → erreur explicite). Un vrai Deep dive en conditions réelles avec le nouveau prompt, dans les deux langues.

### R-17 — Infra versionnée

**Type** T · **Effort** S · **Statut** À faire

**Constat.** Aucun `firestore.rules`, `firebase.json` ni `vercel.json` dans le repo : la configuration Firebase et Vercel vit uniquement dans les dashboards. `.env.local.example` ne mentionne ni `ADMIN_DASHBOARD_PASSWORD` ni `GOATCOUNTER_API_TOKEN`, pourtant requis en production. Impossible de savoir depuis le repo si les règles Firestore actuelles interdisent bien tout accès client.

**Correctif proposé.** `firestore.rules` en deny-all explicite (l'Admin SDK les contourne ; elles documentent l'intention et protègent contre un futur SDK client), `firebase.json` qui pointe dessus, et la commande de déploiement documentée dans CLAUDE.md. Compléter `.env.local.example` avec toutes les variables et leur portée (build / runtime / admin). Vérifier une fois dans la console Firebase que les règles déployées sont bien en deny (action manuelle, à noter dans CLAUDE.md).

### R-18 — Dépendances et config TypeScript

**Type** T · **Effort** S · **Statut** À faire

**Constat.** `npm audit --omit=dev` : 6 vulnérabilités modérées, toutes transitives via `firebase-admin` → `@google-cloud/storage` / `retry-request` / `teeny-request`. `firebase-admin` embarque Storage, Auth, Messaging… pour trois opérations Firestore, et pèse sur le cold start de chaque fonction. `tsconfig.json` : `baseUrl` est déprécié (`tsc` l'annonce comme erreur future en TS 7), `target: ES2017` est daté, `@types/node` est en 20 alors que Vercel exécute Node 22.

**Correctif proposé.** `npm audit fix` puis suivre le correctif upstream si tout n'est pas résolu. Évaluer `@google-cloud/firestore` seul (même authentification par compte de service) en mesurant le cold start avant/après — ne changer que si le gain est net. `paths: { "@/*": ["./src/*"] }` sans `baseUrl`. `@types/node` 22, champ `engines.node` dans `package.json`.

---

## Lot F — Expérience

### R-19 — Accessibilité du parcours

**Type** F+T · **Effort** M · **Statut** À faire

**Constat.** Après un clic sur une réponse, le bouton disparaît et le focus retombe sur `body` : au clavier, il faut re-tabuler depuis le début à chaque question. Aucune région `aria-live` (compteur de question, « ✓ » de copie, écran de chargement). `StageProgress` est une suite de `div` sans rôle. La popover glossaire a `role="dialog"` mais ne déplace pas le focus à l'ouverture ni ne le restitue à la fermeture. Le textarea de contexte libre n'a pas de `<label>` associé. Points déjà bons : `aria-pressed` sur les réponses, `aria-expanded` sur les déclencheurs, `focus-visible` et `prefers-reduced-motion` présents dans le CSS.

**Correctif proposé.** Focus programmatique sur le titre de question (`tabIndex={-1}`) à chaque changement ; `aria-live="polite"` sur le compteur, `role="status"` sur le chargement et le toast de copie ; `role="progressbar"` + `aria-valuenow/aria-valuemax` + `aria-label` sur `StageProgress` ; focus dans la popover à l'ouverture, retour au déclencheur à la fermeture ; `aria-labelledby` sur le textarea. Contrôle automatisé via `@axe-core/playwright` (R-07).

### R-20 — Petits plus produit

**Type** F · **Effort** S/M · **Statut** À faire

Trois compléments indépendants, à faire ensemble ou séparément :

- **Dernier score sur la landing.** Depuis `tdg.results.v1` (R-01) : « Ton dernier score : 74/100 → revoir mon résultat ». Réengagement à coût nul, et la seule façon de retrouver son résultat sans l'URL en l'absence de compte.
- **Benchmark.** « Moyenne de tous les Tours : 58/100 » sur la page résultat. La valeur existe dans `growth-stats.ts` mais son calcul lit toute la collection ; il faut un document agrégé `stats/global` (compteur + somme, mis à jour par `FieldValue.increment` à chaque création) lu en une seule lecture, et n'afficher qu'au-dessus d'un seuil de soumissions. Copie à valider par Antoine.
- **Persistance des réponses Deep dive** en localStorage (clé par id de soumission, même schéma SSR-safe que le quiz). Onze écrans puis jusqu'à une minute d'attente, un reload aujourd'hui perd tout.

Hors périmètre ici, noté pour mémoire : historique de progression / comparaison entre deux Tours (SPEC.md §5, fast-follow explicite).

### R-21 — La nav FR de la landing déborde le viewport mobile

**Type** F+T · **Effort** XS · **Statut** À faire

**Constat, trouvé en vérifiant autre chose.** Repéré pendant la recette du pied de page (2026-09-05), pas pendant la revue initiale — et confirmé **préexistant sur `main`**, indépendant du pied de page : mesuré à l'identique avec et sans lui.

Sur la landing en **français** à 390px de large, `document.documentElement.scrollWidth` vaut **418px** pour un viewport de 390 : la page défile horizontalement. Le coupable est le lien de nav « Comment ça marche » du header (`x=268..418`, 150px de large) : la nav du header est en `flex-wrap: nowrap`, et la traduction française est plus large que « How it works », qui tient tout juste. En anglais, `scrollWidth` vaut exactement 390 — aucun débordement. Le problème persiste à 360px et disparaît à 430px.

C'est exactement la classe de bug que la leçon n°5 de `CLAUDE.md` décrit (« teste les deux langues, pas seulement celle par défaut ») : invisible en anglais, bien réel en français. Probablement introduit le 2026-08-28 avec l'ajout du lien « Glossaire » à côté de « Comment ça marche » — avant, un seul lien tenait.

**Impact.** La landing est la page d'entrée principale et la seule page où cette nav existe. Un défilement horizontal parasite sur mobile, dans une des deux langues du produit, sur la page qui reçoit le trafic.

**Correctif proposé.** Trois options, à trancher visuellement plutôt que par le code :
1. `flex-wrap: wrap` sur `.nav` — la nav passe sur deux lignes en FR, aucune perte de fonctionnalité ;
2. masquer les liens de nav sous 760px, comme le CTA d'en-tête l'est déjà (`CLAUDE.md` étape 3 : « sur mobile, le CTA d'en-tête est masqué ») — le pied de page ajouté depuis porte désormais ces deux mêmes liens, donc rien ne devient inaccessible ;
3. réduire la taille de police / l'espacement de la nav sous 760px.

L'option 2 est la plus cohérente avec la décision déjà prise pour le CTA d'en-tête, et elle est maintenant sans coût d'accessibilité grâce au pied de page. À confirmer par Antoine, c'est une décision visuelle.

**Vérification attendue.** À 360, 390 et 430px, en FR **et** en EN : `scrollWidth === innerWidth`, sur la landing et sur toute page portant ce header.
### R-22 — Trois paires de couleurs sous le seuil AA de contraste

**Type** F+T · **Effort** S · **Statut** À faire

**Constat.** Relevé par la passe axe ajoutée en R-07, dès son premier passage. Trois paires échouent au seuil WCAG AA (4,5:1 pour du texte normal), toutes des choix de **tokens du design system**, pas des erreurs de page — elles se répètent donc partout où le token sert :

| Paire | Mesuré | Où | Token |
|---|---|---|---|
| `#fbf9f2` sur `#d2402c` | **4,41:1** | Le bouton d'action principal, donc quasiment chaque écran | `--action-primary-text` sur `--action-primary-bg` |
| `#99968f` sur `#fbf9f2` | **2,80:1** | La ligne de crédit « Built by… » de la carte de score | `--text-faint` sur `--surface-card` |
| `#d2402c` sur `#e7e1d2` | **3,56:1** (à 11,5px) | Le lien du disclaimer sous les CTA du résultat | `--text-link` sur `--surface-page` |

**Impact.** Le premier est le plus large : il rate le seuil de 0,09 seulement, mais il concerne l'élément le plus cliqué du produit. Le deuxième est le plus sévère (2,80:1 est nettement sous le seuil) — ironiquement sur la ligne qui pointe vers le CV d'Antoine, donc du texte qu'on veut voir lu. Le troisième est du petit texte rouge sur fond papier.

**Correctif proposé.** Le troisième est le plus simple et le mieux fondé : le design system **livre déjà** `--paint-red-deep` (`#a32e1f`) dont le commentaire dit exactement « red text on light grounds (AA on --paper-0) », et SPEC.md §12 note que ce token a été approuvé par Antoine pour l'accessibilité. Le disclaimer utilise `--text-link` là où `--text-alert` conviendrait — c'est un mésusage du système par lui-même, pas un arbitrage de marque.

Les deux autres demandent une décision d'Antoine, parce qu'ils touchent la couleur de marque :
1. bouton principal — assombrir très légèrement `--paint-red` pour le fond de bouton, ou passer le libellé en `--font-weight: 600` (le seuil tombe à 3:1 pour du gras ≥ 14pt, ce qui règle le cas sans toucher aux couleurs) ;
2. `--text-faint` — remonter l'opacité (il est à `rgba(33,28,21,0.45)`) jusqu'à atteindre 4,5:1, en acceptant que la ligne soit un peu moins discrète que ce que SPEC-ADDENDUM-02.md §2.1 demandait.

**Ne pas corriger en silence** : ce sont des couleurs de marque livrées par Claude Design. À arbitrer avec Antoine, éventuellement en remontant l'écart au design.

**En attendant**, la spec axe (`e2e/accessibility.spec.ts`) liste ces trois paires explicitement, **par couleur** (stable) et non par sélecteur (un hash de build) : toute **nouvelle** violation de contraste fait rougir la CI, tandis que ces trois-là restent visibles dans le code plutôt que cachées derrière une règle désactivée.

**Vérification attendue.** Les trois paires passent 4,5:1, et l'entrée correspondante disparaît de `KNOWN_CONTRAST_GAPS` sans que la suite ne rougisse.
---

## Ce qui a été vérifié et jugé sain

Pour éviter de re-auditer ce qui tient déjà :

- **Moteur de scoring** (`src/lib/scoring/`) : pur, arrondi par pilier avant sommation, départage AARRR, 3 options lues depuis la bibliothèque de contenu, bien couvert par les tests.
- **Prompt Gemini** : persona, instruction « le score est définitif », garde-fou anti-moquerie et calibration roast codés en dur ; texte libre délimité par `"""` avec instruction d'hygiène, tronqué à 500 caractères à deux niveaux serveur indépendants ; test d'injection réel déjà mené.
- **Client Gemini** : repli multi-modèles, timeout par tentative, erreurs non retriables qui échouent vraiment vite (bug de `gemini-fit` corrigé).
- **i18n** : dictionnaire `UI_STRINGS` typé, `tc()` avec repli, résolution `?lang=` > cookie > `Accept-Language` testée. Le problème n'est pas la couche i18n, c'est son couplage au layout et à l'URL (R-13).
- **Persistance quiz** : SSR-safe, défensive, testée ; reprise après reload dérivée des seules réponses.
- **SEO de base** : `noindex` sur `/r/*` sans `disallow` robots (le bon choix), sitemap, JSON-LD, favicons, `metadataBase`.
- **Admin** : Basic Auth fail-closed, `force-dynamic`, funnel GoatCounter codé contre le vrai code source de l'API plutôt qu'une doc supposée.
- **Documentation** : CLAUDE.md est un modèle du genre. Ce document s'y ajoute, il ne le remplace pas.
