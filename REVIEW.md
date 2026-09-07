# Revue technique & fonctionnelle — 2026-09-05

**Statut : close le 2026-09-06.** Les 26 constats sont traités — 24 corrigés, R-23 clos sans code sur décision d'Antoine, R-25 livré pour moitié et l'autre moitié écartée. Ce qui reste ouvert est listé en fin de document, et rien n'y est bloquant.

Le document reste utile comme **carte du raisonnement** : chaque item garde son constat d'origine, la preuve `fichier:ligne` qui l'a établi, ce qui a été décidé et pourquoi. Une nouvelle revue partirait d'ici, pas de zéro.

## Comment utiliser ce document

- Chaque constat a un identifiant stable (`R-01` … `R-26`), un type (**F** = fonctionnel/produit, **T** = technique), un effort estimé (XS / S / M / L) et un **statut** tenu à jour ici même : `À faire` → `En cours` → `Fait (PR #n, date)`. Un statut n'est écrit qu'après avoir vérifié que le merge n'était pas vide (`git show --stat <sha>`) — la PR #50 a prouvé que la CI verte ne suffit pas.
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
| `npm run build` | OK — mais **aucune page statique** hors `robots.txt`/`sitemap.xml` : toutes les routes étaient `ƒ` (dynamiques), voir R-13 (moitié SEO) et R-24 (rendu statique). Les 36 pages de contenu sont `●` depuis le PR #39. |
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
| | R-10 | Partage enrichi : métadonnées personnalisées, texte, boutons | F | M | **Fait en partie** (PR #29, 2026-09-05) — boutons LinkedIn/X reportés, voir R-23 |
| | R-11 | Instrumentation du funnel dans GoatCounter | F | S | **Fait** (PR #30, 2026-09-05) |
| | R-12 | Explicabilité : « comment ce score est calculé » | F | M | **Fait** (PR #31, 2026-09-05) — clôt le lot C |
| **D — Architecture i18n / SEO / cache** | R-13 | Locale dans l'URL, `hreflang`, switch de langue | F+T | L | **Fait** (PR #32, 2026-09-05) |
| | R-24 | Rendre les pages de contenu réellement statiques | T | M | **Fait** (PR #39, 2026-09-05) |
| | R-14 | Cache du résultat partagé + OG 404 pour id inconnu | T | M | **Fait** (PR #33, 2026-09-05) — clôt le lot D |
| **E — Robustesse backend** | R-15 | Rate limiting sur les routes POST + `maxDuration` | T | S/M | **Fait** (PR #34, 2026-09-05) — limite en mémoire, pas distribuée |
| | R-16 | Appel Gemini : header, `finishReason`, `maxOutputTokens` | T | M | **Fait en partie** (PR #35, 2026-09-05) — `responseSchema` et l'appel unique reportés en R-25 |
| | R-25 | Gemini : `responseSchema` et un seul appel pour les deux tons | T | M | **Fait** pour `responseSchema` (PR #52, 2026-09-06), **appel unique écarté** avec Antoine |
| | R-17 | Infra versionnée : règles Firestore, env vars documentées | T | S | **Fait** (PR #36, 2026-09-05) |
| | R-18 | Dépendances et config TypeScript | T | S | **Fait** (PR #37, 2026-09-05) — clôt le lot E |
| **F — Expérience** | R-19 | Accessibilité du parcours | F+T | M | **Fait** (PR #38, 2026-09-05) |
| | R-20 | Petits plus produit (dernier score, benchmark, persistance Deep dive) | F | S/M | **Fait** (PR #40, 2026-09-05) |
| | R-21 | La nav de la landing déborde le viewport mobile (FR **et** EN depuis R-13) | F+T | XS | **Fait** (PR #55, 2026-09-06) — la PR #50 annoncée d'abord était **vide**, voir CLAUDE.md |
| | R-22 | Trois paires de couleurs sous le seuil AA de contraste | F+T | S | **Fait** (PR #51, 2026-09-06) |
| | R-23 | Boutons de partage LinkedIn/X : où les mettre sans casser « 2 CTA » | F | S | **Clos** (décision d'Antoine, 2026-09-06 : rester à 2 CTA) |
| | R-26 | Le 404 global n'a ni notre CSS ni notre chrome | F+T | S | **Fait** (PR #48, 2026-09-06) |

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

**Type** T · **Effort** S · **Statut** **Fait** (PR #25, 2026-09-05) — le lint (R-06) et les E2E (R-07) s'ajouteront au workflow avec leurs propres PR. **Rendre le check bloquant s'avère impossible sur le plan actuel** : Antoine a créé le ruleset le 2026-09-05, GitHub répond « Your rulesets won't be enforced on this private repository until you move to GitHub Team organization account ». Les rulesets (et la protection de branche classique) ne sont pas appliqués sur un dépôt **privé** d'une organisation en plan **Free**. Trois issues possibles, aucune urgente : passer le repo en public (cohérent avec sa vocation de portfolio, aucun secret n'y est committé — `.env.local` est ignoré), passer l'organisation en GitHub Team, ou s'en tenir à la convention. La CI **tourne et rapporte** sur chaque PR dans tous les cas : seul le blocage du bouton de merge manque. Convention retenue en attendant, écrite ici pour les prochaines sessions : **ne jamais merger une PR dont le check `Types, tests, build` n'est pas vert.**

**Le blocage a disparu depuis, et personne ne l'a remarqué** (constaté le 2026-09-08) : le dépôt est passé **public** le 2026-09-05 (première des trois issues envisagées ci-dessus, faite pour une autre raison — la vocation portfolio). Or c'est la combinaison « privé + plan Free » qui empêchait l'application des rulesets ; sur un dépôt public, la protection de branche et les rulesets s'appliquent sur le plan gratuit. **Rendre `Types, tests, build` obligatoire sur `main` est donc possible aujourd'hui** — Settings → Rules → Rulesets, ou Settings → Branches, une seule case à cocher. Rien à coder ; à faire par Antoine, et à ne pas confondre avec `verify-live.yml`, qui ne doit **jamais** être un check requis (il ne se déclenche pas sur `pull_request`, donc l'exiger bloquerait les merges en permanence).

> **Suite du 2026-09-05 : Antoine a choisi de passer le dépôt en public.** L'historique complet a été scanné avant (48 commits, contenu des diffs y compris) : aucune clé PEM, aucune clé `AIza…`, aucun e-mail de compte de service, aucun fichier `.env` — seul `.env.local.example` a jamais été committé, et il ne contient que des noms de variables. Les trois correspondances du scan sont des lignes `= originalPassword` dans les tests. Le ruleset devient donc applicable, et `LICENSE` (AGPL-3.0) plus `README.md` ont été ajoutés en même temps, le dépôt n'en ayant aucun.

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

> **Suite du 2026-09-05, sur retour d'Antoine : R-09 ne couvrait que la moitié du problème.** Le verdict Quick suit bien le lecteur, mais dès qu'un Deep dive existe il **remplace** ces phrases par pilier (`ResultView`), et un Deep dive n'était stocké que dans la langue où il avait été généré. Antoine a ouvert son propre résultat anglais en français : explications des notes et action prioritaire restées en anglais. Corrigé en générant chaque langue à l'avance, comme les deux tons l'étaient déjà — détail dans `CLAUDE.md`.

### R-10 — Partage enrichi

**Type** F · **Effort** M · **Statut** **Fait en partie** (PR #29, 2026-09-05) — métadonnées par résultat, texte de partage, URL nettoyée, événements par méthode, et confirmation de copie réelle. **Les boutons LinkedIn/X sont volontairement reportés en R-23** : les ajouter casserait la règle « exactement 2 CTA, jamais 3 » tranchée à l'étape 7, donc c'est un arbitrage design, pas une implémentation.

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

**Type** F · **Effort** S · **Statut** **Fait** (PR #30, 2026-09-05) — 6 événements ajoutés, `/admin/stats` gagne une vue de déperdition, et les specs E2E qui les vérifient sont non triviales (prouvé en les faisant échouer sans le code GoatCounter)

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

**Type** F · **Effort** M · **Statut** **Fait** (PR #31, 2026-09-05) — clôt le lot C. Deux points à relire par Antoine : la copie du panneau (marquée `TODO`) et le fait qu'aucun composant du design system ne couvre un dépliant, donc il est construit aux tokens.

**Constat.** La règle non négociable « un score partagé doit être ré-explicable en 10 secondes » est tenue par le code (`computeScore` est pur et testé), pas par l'interface : la page résultat ne montre jamais les trois réponses derrière chaque sous-score. `Submission.answers` existe en base et n'est jamais lu pour l'affichage.

**Correctif proposé.** Une section dépliable par pilier (élément `<details>` natif, stylé aux tokens) : les trois questions, la réponse choisie, ses points (20/7/0), et le calcul « 47/60 → 16/20 ». **Visible pour le propriétaire uniquement** : les réponses (« Aucune idée du CAC ») en disent plus sur le business que le score, et la page est publique. Pas de fetch authentifié nécessaire : stocker `answers` dans `tdg.results.v1` (R-01) au moment de la soumission et rendre la section côté client depuis localStorage — zéro changement serveur, zéro fuite dans le payload. Copie de la section (titres, formulation du calcul) à valider par Antoine ; aucun composant du design system ne couvre un dépliant, écart à signaler à Claude Design.

**Vérification attendue.** E2E : le propriétaire voit la section avec les bons chiffres ; un visiteur ne la voit pas ; `curl /r/<id>` ne contient pas `answers`.

---

## Lot D — Architecture i18n / SEO / cache

### R-13 — Locale dans l'URL, `hreflang`, switch de langue

**Type** F+T · **Effort** L · **Statut** **Fait** (PR #32, 2026-09-05) — **la moitié SEO seulement**. Le rendu statique, qui exige de restructurer les layouts racine, est découpé en **R-24** : c'est un problème distinct (coût/latence) du problème d'indexation (contenu FR invisible), et le mélanger au changement de routing aurait fait une PR à la fois énorme et difficile à vérifier.

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

> **Suite du 2026-09-05, sur retour d'Antoine : le sélecteur de langue manquait là où il compte le plus.** R-13 l'a posé sur les pages de contenu, qui portent leur langue dans l'URL. La page de résultat, elle, n'en a pas — et c'est justement celle qui rend dans la langue du *lecteur* (R-09). Un lecteur francophone arrivant sur un résultat partagé n'avait donc aucun moyen de basculer, sauf à connaître `?lang=`. Le sélecteur accepte maintenant l'absence de préfixe et pointe sur `?lang=` ; le proxy le replie dans le cookie, donc le choix suit jusqu'au `/quiz`.

### R-14 — Cache du résultat partagé + OG 404 pour id inconnu

**Type** T · **Effort** M · **Statut** **Fait** (PR #33, 2026-09-05) — clôt le lot D. `unstable_cache` retenu plutôt que `"use cache"` : ce dernier exige `cacheComponents`, dont l'activation appartient à R-24.

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

**Type** T · **Effort** S/M · **Statut** **Fait** (PR #34, 2026-09-05) — **avec une limite explicite**. La limite est **en mémoire, par instance serverless** : elle arrête le cas naïf (un client qui martèle, qui sur une app à faible trafic retombe généralement sur la même instance chaude) sans aucune dépendance ni identifiant à configurer. Elle ne couvre **pas** un trafic réparti sur plusieurs instances ni un attaquant motivé. Passer à une limite distribuée demande soit un store partagé (Upstash Redis : un compte, des identifiants), soit les règles de pare-feu Vercel (à vérifier selon le plan) — à faire **si un abus réel apparaît**, pas avant : le vrai coût aujourd'hui serait une dépendance de plus à maintenir pour un risque encore théorique.

**Constat.** `POST /api/submissions` et `POST /api/submissions/[id]/deep-dive` n'ont aucune limite. Un script peut créer des soumissions en boucle (écritures Firestore, quota Spark 20 000/jour) puis déclencher autant de Deep dives, chacun valant deux appels Gemini et jusqu'à huit requêtes HTTP avec le repli. Aucun `export const maxDuration` sur la route Deep dive, la seule qui dure réellement 30 à 60 secondes en production : on dépend de la valeur par défaut du plan Vercel.

**Correctif proposé.** Limite par IP dans les deux routes (ordre de grandeur : 10 soumissions/heure, 3 Deep dives/heure), avec un store externe puisque les fonctions Vercel n'ont pas de mémoire partagée — Upstash Redis (`@upstash/ratelimit`, gratuit à ce volume) est le plus simple ; les règles de rate limiting du firewall Vercel sont une alternative sans code **si le plan le permet** (à vérifier). Cloudflare Turnstile sur « Obtiens ton score » en complément si des bots apparaissent, pas avant. `export const maxDuration = 120` sur la route Deep dive. Réponse 429 propre, affichée par l'écran d'erreur existant.

**Vérification attendue.** Test d'intégration local : la 11ᵉ soumission en une heure depuis la même IP renvoie 429 ; le retry après expiration passe.

### R-16 — Appel Gemini : header, `finishReason`, `maxOutputTokens`

**Type** T · **Effort** M · **Statut** **Fait en partie** (PR #35, 2026-09-05). Livré : clé en en-tête, diagnostic de `finishReason`/`blockReason`, `maxOutputTokens`. **Reporté en R-25** : `responseSchema` et l'appel unique pour les deux tons — les deux modifient la *requête* d'une fonctionnalité IA qui marche aujourd'hui, et aucun des deux n'est vérifiable sans une génération réussie.

**Constat.**
- Clé API dans la query string (`src/lib/gemini/client.ts:69`) : elle se retrouve dans tout log d'URL intermédiaire. L'API accepte le header `x-goog-api-key`.
- Le JSON est demandé par instruction textuelle et nettoyé à la regex (`extractJson`) alors que `generationConfig.responseSchema` garantit la forme côté API.
- `finishReason` n'est jamais lu : une réponse bloquée (`SAFETY`, plausible en mode roast) ou tronquée (`MAX_TOKENS`) produit l'erreur opaque « Unexpected Gemini response shape » au lieu d'un diagnostic clair.
- Deux appels par Deep dive, un par ton (`src/lib/submissions/create-submission.ts:176`) : double latence perçue (le plus lent des deux), double consommation de quota.
- Pas de `maxOutputTokens`.

**Correctif proposé.** Header `x-goog-api-key`. `responseSchema` décrivant `pillarRecommendations` (5 clés obligatoires) + `priorityAction` ; garder `parseDeepDiveVerdict` comme seconde ligne de défense. Lire `candidates[0].finishReason` et `promptFeedback.blockReason` → messages d'erreur explicites, et considérer `SAFETY` comme non retriable (identique sur tous les modèles). **Un seul appel** renvoyant `{ neutral: {…}, roast: {…} }` : le prompt garde le garde-fou anti-moquerie et la calibration roast pour le bloc roast, et le style neutre pour l'autre ; refaire le test d'injection réel de l'addendum 02 après ce changement. La chaîne de repli multi-modèles reste intacte (non négociable). `maxOutputTokens` dimensionné pour les deux tons.

**Vérification attendue.** `client.test.ts` étendu (header, `finishReason` SAFETY → erreur explicite non retriable, `MAX_TOKENS` → erreur explicite). Un vrai Deep dive en conditions réelles avec le nouveau prompt, dans les deux langues.

### R-17 — Infra versionnée

**Type** T · **Effort** S · **Statut** **Fait** (PR #36, 2026-09-05). **Deux actions manuelles restent côté Antoine** : déployer les règles (`npx firebase-tools deploy --only firestore:rules`) et vérifier dans la console Firebase que les règles réellement en place sont bien en deny — ce fichier documente l'intention, il ne s'applique pas tant qu'il n'est pas déployé.

**Constat.** Aucun `firestore.rules`, `firebase.json` ni `vercel.json` dans le repo : la configuration Firebase et Vercel vit uniquement dans les dashboards. `.env.local.example` ne mentionne ni `ADMIN_DASHBOARD_PASSWORD` ni `GOATCOUNTER_API_TOKEN`, pourtant requis en production. Impossible de savoir depuis le repo si les règles Firestore actuelles interdisent bien tout accès client.

**Correctif proposé.** `firestore.rules` en deny-all explicite (l'Admin SDK les contourne ; elles documentent l'intention et protègent contre un futur SDK client), `firebase.json` qui pointe dessus, et la commande de déploiement documentée dans CLAUDE.md. Compléter `.env.local.example` avec toutes les variables et leur portée (build / runtime / admin). Vérifier une fois dans la console Firebase que les règles déployées sont bien en deny (action manuelle, à noter dans CLAUDE.md).

### R-18 — Dépendances et config TypeScript

**Type** T · **Effort** S · **Statut** **Fait** (PR #37, 2026-09-05) — clôt le lot E. **Le remplacement de `firebase-admin` par `@google-cloud/firestore` a été évalué puis écarté, mesure à l'appui** : importer `firebase-admin/firestore` charge 455 modules dont **zéro** venant de `@google-cloud/storage`. Le point d'entrée modulaire évite déjà Storage à l'exécution, et le poids réel (6,2 Mo) est `@google-cloud/firestore` lui-même, chargé dans les deux cas. Le constat initial supposait un gain de cold start qui n'existe pas : `firebase-admin` n'ajoute qu'un mince wrapper de 2,1 Mo. Ne pas y revenir sans une mesure de cold start réelle sur Vercel qui contredirait celle-ci.

**Constat.** `npm audit --omit=dev` : 6 vulnérabilités modérées, toutes transitives via `firebase-admin` → `@google-cloud/storage` / `retry-request` / `teeny-request`. `firebase-admin` embarque Storage, Auth, Messaging… pour trois opérations Firestore, et pèse sur le cold start de chaque fonction. `tsconfig.json` : `baseUrl` est déprécié (`tsc` l'annonce comme erreur future en TS 7), `target: ES2017` est daté, `@types/node` est en 20 alors que Vercel exécute Node 22.

**Correctif proposé.** `npm audit fix` puis suivre le correctif upstream si tout n'est pas résolu. Évaluer `@google-cloud/firestore` seul (même authentification par compte de service) en mesurant le cold start avant/après — ne changer que si le gain est net. `paths: { "@/*": ["./src/*"] }` sans `baseUrl`. `@types/node` 22, champ `engines.node` dans `package.json`.

---

## Lot F — Expérience

### R-19 — Accessibilité du parcours

**Type** F+T · **Effort** M · **Statut** **Fait** (PR #38, 2026-09-05) — les 3 paires de contraste restent ouvertes en **R-22** (couleurs de marque, arbitrage d'Antoine)

**Constat.** Après un clic sur une réponse, le bouton disparaît et le focus retombe sur `body` : au clavier, il faut re-tabuler depuis le début à chaque question. Aucune région `aria-live` (compteur de question, « ✓ » de copie, écran de chargement). `StageProgress` est une suite de `div` sans rôle. La popover glossaire a `role="dialog"` mais ne déplace pas le focus à l'ouverture ni ne le restitue à la fermeture. Le textarea de contexte libre n'a pas de `<label>` associé. Points déjà bons : `aria-pressed` sur les réponses, `aria-expanded` sur les déclencheurs, `focus-visible` et `prefers-reduced-motion` présents dans le CSS.

**Correctif proposé.** Focus programmatique sur le titre de question (`tabIndex={-1}`) à chaque changement ; `aria-live="polite"` sur le compteur, `role="status"` sur le chargement et le toast de copie ; `role="progressbar"` + `aria-valuenow/aria-valuemax` + `aria-label` sur `StageProgress` ; focus dans la popover à l'ouverture, retour au déclencheur à la fermeture ; `aria-labelledby` sur le textarea. Contrôle automatisé via `@axe-core/playwright` (R-07).

### R-20 — Petits plus produit

**Type** F · **Effort** S/M · **Statut** **Fait** (PR #40, 2026-09-05)

Les trois livrés. Copie d'interface écrite ici et marquée `TODO` (même statut que l'écran d'erreur et le dépliant R-12 : ce n'est ni la bibliothèque de verdicts ni la voix roast), à relire. Le benchmark s'appuie sur un document agrégé `stats/global` qui **démarre à zéro le jour du déploiement** et reste masqué sous 30 soumissions — il peut donc légitimement différer du chiffre de `/admin/stats`, qui lit toute la collection. Détail dans `CLAUDE.md`.

Trois compléments indépendants, à faire ensemble ou séparément :

- **Dernier score sur la landing.** Depuis `tdg.results.v1` (R-01) : « Ton dernier score : 74/100 → revoir mon résultat ». Réengagement à coût nul, et la seule façon de retrouver son résultat sans l'URL en l'absence de compte.
- **Benchmark.** « Moyenne de tous les Tours : 58/100 » sur la page résultat. La valeur existe dans `growth-stats.ts` mais son calcul lit toute la collection ; il faut un document agrégé `stats/global` (compteur + somme, mis à jour par `FieldValue.increment` à chaque création) lu en une seule lecture, et n'afficher qu'au-dessus d'un seuil de soumissions. Copie à valider par Antoine.
- **Persistance des réponses Deep dive** en localStorage (clé par id de soumission, même schéma SSR-safe que le quiz). Onze écrans puis jusqu'à une minute d'attente, un reload aujourd'hui perd tout.

Hors périmètre ici, noté pour mémoire : historique de progression / comparaison entre deux Tours (SPEC.md §5, fast-follow explicite).

### R-21 — La nav de la landing déborde le viewport mobile

> **Mise à jour du 2026-09-05 (constaté en mesurant pendant R-20) : ce n'est plus seulement le français.** R-13 a ajouté le sélecteur de langue dans ce même header. À 390 px, `scrollWidth` vaut maintenant **515 en FR et 452 en EN**, pour un viewport de 390 — les deux langues débordent, alors que le constat d'origine ne trouvait le problème qu'en français. Ça reste le même correctif et le même arbitrage visuel (wrapper la nav, la masquer sous 760 px comme le CTA d'en-tête l'est déjà, ou réduire la typo), mais ça touche désormais tous les visiteurs mobiles, pas une partie.

**Type** F+T · **Effort** XS · **Statut** **Fait** (PR #55, 2026-09-06) — option 2 retenue par Antoine après mesure des trois sur le vrai build (360/390/430 px, FR et EN) : masquer les liens est la seule qui corrige sans doubler la hauteur du header (69 px, contre 132-171 px en wrappant ; la typo réduite déborde encore). Spec `e2e/landing-mobile.spec.ts`, 13 specs de 320 à 430 px.

> **La PR #50, annoncée livrée le matin même, était vide** — correctif committé sur `main` local au lieu de la branche, branche poussée périmée, squash vide, CI verte pour la mauvaise raison. Refait en #55. Convention ajoutée : vérifier `git show --stat <sha>` après chaque merge avant d'annoncer. Détail dans `CLAUDE.md`.

> **Reste ouvert, hors contrat** : `/r/<id>` déborde de 37 px à **320 px seulement** (le `PillarChip` met score + nom + déclencheur de glossaire sur une ligne). DESIGN-BRIEF.md fixe le mobile à 390 px et exige 375-430 — 320 est en dehors. Antoine a choisi de laisser en l'état (2026-09-06).

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

**Type** F+T · **Effort** S · **Statut** **Fait** (PR #51, 2026-09-06) — les trois corrigées au niveau des tokens, décision d'Antoine. `KNOWN_CONTRAST_GAPS` est vide et la passe axe reste verte sur les 6 écrans.

> **Correction à la piste proposée plus bas pour le bouton.** « Passer le libellé en gras » ne tient pas : il est **déjà** en 600, et la règle WCAG du texte large (seuil 3:1) exige 18,66 px en gras — le libellé fait 15-16 px. Le fond du bouton a donc été assombri de 3 % (`--paint-red-action: #cc3e2b`, 4,65:1), sur le seul token de fond de bouton ; `--paint-red` est inchangé partout ailleurs. Le crédit passe à 0,65 d'opacité (5,18:1, toujours plus clair que `--text-muted`). Pour le lien, c'est le token `--text-link` lui-même qui pointe désormais sur `--paint-red-deep` : chacun de ses usages (disclaimer, pied de page, termes liés du glossaire, liens du crédit Deep dive) est du texte rouge sur papier, précisément ce pour quoi ce paint existe.

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
### R-23 — Boutons de partage LinkedIn/X : où les mettre sans casser « 2 CTA »

**Type** F · **Effort** S · **Statut** **Clos** (2026-09-06) — décision d'Antoine : **rester à 2 CTA**, aucun bouton réseau. Le partage natif emporte déjà le score et le pilier faible (R-10), la copie desktop couvre le reste, et ces boutons n'auraient aucune valeur SEO. Aucun changement de code.

**D'où ça vient.** Découpé de R-10 au moment de le livrer, plutôt que tranché en silence.

**La tension.** SPEC.md §2 et §7 désignent explicitement LinkedIn et X comme les canaux du produit (« une page de résultat conçue pour être partagée sur LinkedIn/X », « c'est elle qui fait le travail de conversion sur LinkedIn/X »). Mais l'étape 7 a tranché, à partir d'une lecture littérale du design, que l'écran de résultat porte **exactement 2 CTA, jamais 3** — et DESIGN-BRIEF.md décrit le partage comme « native share sheet where available, otherwise copy the result URL », rien de plus.

Ajouter deux boutons de partage réseau casserait donc une décision produit déjà prise, sur l'écran le plus soigné du produit.

**Ce que R-10 a déjà réglé sans y toucher** : le partage natif emporte maintenant un vrai texte (score + pilier faible), la copie desktop confirme visiblement, et le lien copié est propre. Un partage vers LinkedIn reste donc parfaitement faisable — via la feuille native sur mobile, via un collage manuel sur desktop.

**Ce qui reste à décider (Antoine, éventuellement avec Claude Design)** : soit on s'en tient aux 2 CTA et on considère la question close, soit on ouvre un emplacement pour les boutons réseau. Pistes si on ouvre : un petit rang d'icônes/liens **sous** la ligne de CTA (donc pas un 3ᵉ CTA au même niveau), ou une feuille de partage qui s'ouvre au clic sur « Partager » et propose LinkedIn / X / Copier.

**Attention si on le fait** : LinkedIn et X ajoutent `nofollow` à ce qu'ils publient, donc ces boutons n'ont **aucune** valeur SEO — leur intérêt est uniquement le confort de partage. Ne pas les vendre comme un levier de référencement.
### R-24 — Rendre les pages de contenu réellement statiques

**Type** T · **Effort** M · **Statut** **Fait** (PR #39, 2026-09-05)

**Ce qui a changé par rapport au correctif proposé ci-dessous.** Deux points, tous deux découverts en construisant plutôt qu'en relisant :

1. Le layout racine des pages de contenu n'est **pas** `(content)/layout.tsx` mais `[locale]/layout.tsx` directement. Next n'exige pas qu'un layout racine soit à la racine d'un groupe : il exige que chaque route en ait un dans sa chaîne. Et un groupe au-dessus de `[locale]` ne verrait pas le paramètre de langue, donc ne saurait pas quoi mettre dans `<html lang>`.
2. Mettre les routes applicatives dans un groupe `(app)` **renomme leurs routes de métadonnées** : `/r/<id>/opengraph-image` devient `/r/<id>/opengraph-image-<hash>`. Détail traité dans `CLAUDE.md`, avec l'alias de compatibilité et le test qui l'épingle.

**D'où ça vient.** Seconde moitié de R-13, découpée au moment de le livrer.

**Constat.** R-13 a donné une URL par langue, mais **toutes les routes restent rendues à la demande** (`ƒ` dans le résumé de `next build`, y compris `/en/glossary/cac`). La cause n'a pas changé : `<html lang>` vit dans le layout racine, et le layout racine doit connaître la langue de la requête — il lit donc un en-tête, ce qui rend dynamique tout ce qui est en dessous.

**Impact.** Aucun cache CDN sur les 32 pages de contenu, une invocation de fonction par visite, un TTFB plus lent. À ce volume c'est du confort, pas une urgence — mais c'est exactement ce qui coûte cher si le SEO du lot croissance fonctionne.

**Correctif proposé.** Next.js autorise **plusieurs layouts racine** via des groupes de routes, à condition qu'il n'existe aucun `app/layout.tsx` :

```
app/
  (content)/[locale]/layout.tsx   → <html lang={locale}>, aucun header lu → statique
  (app)/layout.tsx                → <html lang={résolu}>, lit l'en-tête → dynamique
```

Le chrome partagé (polices `next/font`, script GoatCounter, `LocaleProvider`, `metadataBase`) doit alors être extrait dans un composant commun appelé par les deux, sinon il diverge silencieusement.

**Points d'attention.** Passer d'un layout racine à l'autre force un chargement complet de page (pas de transition client) — acceptable ici, `/en` → `/quiz` est déjà une vraie navigation. Et `app/not-found.tsx` global doit être rattaché à l'un des deux, ce qui est le point de friction connu de cette structure : à valider empiriquement plutôt qu'à supposer.

**Vérification attendue.** `next build` affiche `○` pour les 32 pages de contenu, `ƒ` pour `/quiz`, `/r/[id]`, `/deep-dive`, `/admin`, `/api`. Les 36 specs E2E restent vertes, `<html lang>` reste correct dans les deux arbres.
### R-26 — Le 404 global n'a ni notre CSS ni notre chrome

**Type** F+T · **Effort** S · **Statut** **Fait** (PR #48, 2026-09-06)

**Le correctif proposé ci-dessous était incomplet sur deux points, tous deux découverts en construisant** : il faut `global-not-found.tsx` (que Next monte comme un layout) et non `not-found.tsx`, et il faut cesser de lever `notFound()` depuis le layout de langue. Détail dans `CLAUDE.md`.

**D'où ça vient.** Trouvé en vérifiant le correctif de la couture de fond (2026-09-05), pas dans la revue initiale.

**Constat.** Une URL inconnue (`/nonsense`, un chemin mal tapé) rend le document d'erreur intégré de Next — `<html id="__next_error__">`, **aucune feuille de style de l'app**, page blanche non marquée. Vérifié par requête HTTP.

**Ce n'est pas une régression de R-24** : reconstruit `main` au commit précédent dans un worktree, le résultat est identique au caractère près. La cause est qu'il n'y a jamais eu d'`app/not-found.tsx` dans ce repo — seulement `r/[id]/not-found.tsx`, qui couvre le cas qui compte vraiment (un lien de résultat partagé devenu mort) et reste correct.

**Impact.** Faible mais réel : c'est la seule surface du produit qui ne ressemble pas au produit. Un lien mal recopié depuis un partage tombe dessus.

**Correctif proposé.** Un `app/not-found.tsx`. Point de friction connu de la structure à deux layouts racine (R-24) : un `not-found` global n'a pas de layout racine dans sa chaîne, donc il devra rendre lui-même son `<html>`/`<body>` via `RootShell` — et il ne peut pas connaître la langue du visiteur autrement qu'en lisant l'en-tête du proxy, ce qui le rendrait dynamique. À valider empiriquement, comme le reste de R-24.

**Vérification attendue.** `/nonsense` renvoie toujours 404, avec le fond, la typo et le wordmark du produit, dans la langue résolue, et sans faire repasser une seule page de contenu de `●` à `ƒ`.

### R-25 — Gemini : `responseSchema` et un seul appel pour les deux tons

**Type** T · **Effort** M · **Statut** **Fait** pour le point 1 (PR #52, 2026-09-06), **point 2 écarté** — décision d'Antoine. Ce qui a débloqué l'item est le workflow `verify-live.yml` : la sonde Gemini envoie désormais exactement la requête de production (`lib/gemini/deep-dive.ts#callDeepDiveGemini`, schéma inclus) et a été lancée **sur la branche, avant merge** — c'est la vérification attendue ci-dessous, obtenue sans qu'aucune clé ne quitte GitHub. Pas de repli « sans schéma » sur 400 : il masquerait précisément la mauvaise configuration qu'on veut voir ; la sonde avant merge est la bonne protection. L'appel unique pour les deux tons est abandonné : gain de quota seulement (pas de latence, les générations partent en parallèle), contre un risque de contamination entre les deux voix sur un différenciateur produit.

**D'où ça vient.** Découpé de R-16 au moment de le livrer, pour une raison précise : ces deux changements modifient la **requête** envoyée à Gemini, sur la seule fonctionnalité IA du produit, qui **fonctionne aujourd'hui en production**. Les livrer sans pouvoir exercer une génération réussie, c'est risquer de casser ce qui marche.

Ce qui a changé depuis l'étape 6 : le endpoint `generateContent` est de nouveau **joignable** depuis ce bac à sable (400 rapide sur clé invalide, vérifié — l'ancien blocage silencieux a disparu). Ce qui manque n'est plus le réseau mais une **clé valide** : sans `.env.local`, impossible d'obtenir une génération réussie et donc de valider ces deux points.

**1. `responseSchema`.** Le JSON est aujourd'hui demandé par instruction textuelle puis nettoyé à la regex (`extractJson` retire les balises markdown). `generationConfig.responseSchema` le garantirait côté API. `parseDeepDiveVerdict` resterait en seconde ligne de défense.

*Le risque à couvrir* : un schéma mal formé fait renvoyer 400 par l'API. Or un 400 est non retriable dans `callGeminiWithFallback` — donc **tous** les Deep dive échoueraient jusqu'à correction. À valider avec une vraie clé avant de livrer, ou à livrer avec un repli sans schéma sur 400.

**2. Un seul appel pour les deux tons.** Aujourd'hui deux appels, un par ton. Le gain n'est **pas** la latence : ils partent déjà en parallèle (`Promise.all`), donc la latence est celle du plus lent, pas la somme. Le gain réel est la consommation de quota, divisée par deux.

*Le risque à couvrir* : un prompt unique contenant à la fois le bloc de style neutre et le bloc roast — avec son garde-fou anti-moquerie — demande au modèle d'appliquer deux voix différentes à deux champs. Le risque de contamination de ton est réel, et la voix roast est un différenciateur produit (SPEC.md §6bis). Ça se juge sur des sorties réelles, pas en relecture.

**Vérification attendue.** Avec une vraie clé : une génération réussie avec `responseSchema`, puis une comparaison des sorties roast et neutres avant/après passage à l'appel unique, dans les deux langues, en vérifiant que le garde-fou tient toujours.
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


---

## Ce qui reste ouvert après la clôture (2026-09-06)

Aucun de ces points ne bloque le produit. Ils sont listés ici pour qu'une prochaine session n'ait pas à les redécouvrir, avec ce qui déclencherait de s'en occuper.

| Sujet | Origine | État | Déclencheur |
|---|---|---|---|
| Limite de débit non distribuée | R-15 | En mémoire, par instance serverless. Arrête un client naïf, pas un trafic réparti. | Un abus réel. Le chemin est un store partagé (Upstash Redis) ou les règles de pare-feu Vercel selon le plan. |
| Latence du Deep dive | Mesurée à ~70 s au run n°6 | Quatre générations en parallèle (2 tons × 2 langues) depuis le bilingue. L'écran de chargement est conçu pour une attente longue et sans fin annoncée. | Si 70 s devient la norme plutôt que l'exception, c'est le **nombre** de générations qu'il faut regarder, pas le plafond de temps par tentative. |
| `/r/<id>` déborde de 37 px à 320 px | Mesuré pendant R-21 | Le `PillarChip` met score, nom et déclencheur de glossaire sur une ligne. Aucun débordement de 360 à 430 px. | Hors contrat : DESIGN-BRIEF.md fixe le mobile à 390 px et exige de tenir 375-430. Redimensionner un composant du design system hors de sa plage annoncée est une décision de design. Antoine a choisi de laisser en l'état. |
| `guidelines/` absent du bundle d'extension 01 | Extension 01 | Le README du bundle l'annonce (planches de référence + `voice.md`), l'archive ne le contenait pas. | Sans conséquence à ce jour. À demander à Claude Design si un futur composant en a besoin. |

### Ce que la revue a appris sur la méthode, au-delà des items

Trois choses valent d'être retenues, parce qu'aucune n'est venue d'une relecture de code :

1. **La sonde contre les vrais services a trouvé ce que les tests ne pouvaient pas.** En sept runs : un bug utilisateur intermittent (réponses tronquées), une faiblesse de conception (chaîne de repli sans pause), un plafond de timeout sous-dimensionné, et le démenti d'une de mes propres théories. Sa valeur n'est pas d'être verte.
2. **Un test de non-vacuité qui passe est un signal, pas une formalité.** Deux fois le 2026-09-06 il a révélé autre chose que ce qu'il cherchait.
3. **Une CI verte peut être verte pour la mauvaise raison.** La PR #50 était vide ; la CI testait un `main` inchangé et le bug a survécu une demi-journée à son propre correctif.
