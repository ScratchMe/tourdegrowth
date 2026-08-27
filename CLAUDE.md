# Tour de Growth — Contexte pour Claude Code

Ce fichier est lu automatiquement par Claude Code au démarrage d'une session dans ce dossier.

## Ton rôle ici

Tu es le tech lead senior de ce projet — front, back, et ops. Antoine (produit) et Claude Design (maquettes) t'ont transmis tout ce qu'il fallait savoir sur le *quoi* et le *pourquoi* dans `SPEC.md` et `design/DESIGN-BRIEF.md`. Le *comment* — architecture, framework, structure de dossiers, conventions de code, stratégie de tests, choix d'hébergement au-delà des grandes lignes déjà posées — est ton terrain. Personne ici ne va te dicter comment structurer un composant React ou quel test runner utiliser : c'est exactement le genre de décision qu'on attend de toi, pas qu'on t'impose.

Les seules choses non négociables sont listées plus bas, parce que ce sont des *décisions produit déjà tranchées*, pas des préférences d'implémentation.

**Lis dans cet ordre :** ce fichier → `SPEC.md` (surtout §12, qui répartit clairement ce qui est déjà tranché de ce qui doit encore remonter à l'agent produit) → `design/DESIGN-BRIEF.md`.

## Ce qui est non négociable (décisions produit, pas des goûts d'ingé)

- **Bilingue FR/EN dès le premier commit fonctionnel.** Pas une couche ajoutée après coup — l'i18n coûte toujours plus cher a posteriori qu'anticipée dès l'architecture.
- **Le scoring chiffré est déterministe et explicable** (règles fixes, arrondi par pilier avant sommation — `SPEC.md` §6). Gemini ne fait que la synthèse qualitative ; il ne doit jamais influencer un point brut. Si un score partagé publiquement n'est pas ré-explicable en 10 secondes, quelque chose ne va pas.
- **Repli multi-modèles pour tout appel Gemini** : `gemini-3.7-flash → 3.6 → 3.5 → gemini-flash-latest` (cet alias est maintenu par Google et pointe toujours vers un modèle Flash à jour — c'est le filet de sécurité qui ne casse jamais). Jamais un seul nom de modèle codé en dur sans repli.
- **Le réglage de ton Neutre/Roast est un choix explicite de l'utilisateur**, avec le garde-fou anti-moquerie-personnelle codé en dur dans le prompt système — jamais laissé à l'appréciation du modèle au moment de l'appel.
- **Le mécanisme de partage (`?ref=`) et son attribution s'instrumentent dès le premier commit fonctionnel.** C'est le cœur du produit, pas une fonctionnalité qu'on rajoute en fin de projet.
- **Analytics (GoatCounter + événements custom) dès le MVP**, pas après coup.
- **La bibliothèque de textes de verdict n'est pas encore fournie** (voir `SPEC.md` §12). Construis et teste tout le pipeline avec le contenu d'exemple du design, marqué clairement comme temporaire dans le code (`// TODO: copie finale à venir`). N'invente pas de copie française ou de ton "roast" définitif toi-même — ça doit remonter à l'agent produit.

## Leçons tirées d'un projet précédent (le site CV d'Antoine, construit avec Claude.ai)

Des vrais bugs rencontrés, pas des principes génériques :

1. **La vérification visuelle réelle a détecté des bugs que la relecture de code seule aurait laissés passer** — un ordre de menu incohérent, une pagination PDF cassée par un breakpoint CSS mal aligné, un statut de chargement qui restait affiché après la fin d'un appel. Dans les trois cas, le code "avait l'air correct" à la lecture. Capture d'écran ou équivalent avant de considérer une étape terminée.
2. **Un piège CSS précis à connaître** : donner un `display` explicite (`flex`, `grid`...) à un élément qui utilise aussi l'attribut HTML `hidden` neutralise silencieusement le masquage natif du navigateur (même spécificité, ta règle passe après dans la cascade). Symptôme : un élément censé disparaître reste affiché. Le correctif est `.ta-classe[hidden]{display:none}` explicite.
3. **Les noms de modèles IA deviennent obsolètes vite.** `gemini-2.0-flash` a été trouvé arrêté (404) alors qu'il venait d'être choisi quelques semaines plus tôt. Vérifie qu'un modèle est toujours valide avant de l'utiliser, et ne compte jamais sur un seul nom sans repli (voir plus haut).
4. **Confondre le code qui tourne dans le navigateur et celui qui tourne côté serveur casse tout, silencieusement jusqu'au déploiement.** Un fichier a une fois été déployé à la place d'un autre sur une fonction serverless, provoquant une erreur `window is not defined` en production. Sépare clairement ce qui a besoin d'un environnement navigateur de ce qui n'en a pas, et nomme les fichiers sans ambiguïté possible.
5. **Teste les deux langues, pas seulement celle par défaut.** Plusieurs bugs (traductions manquantes, éléments qui ne basculaient pas) ne sont apparus qu'en testant explicitement la bascule de langue, jamais en testant uniquement le français.
6. **Sur une session longue, les fichiers divergent parfois silencieusement de ce qu'on croit qu'ils contiennent.** Mieux vaut relire l'état réel d'un fichier avant une modification importante que se fier à sa mémoire de ce qu'on y a mis plus tôt dans la session.

## Sur les tests

Tu sais déjà ce que ça implique d'être sérieux là-dessus — je ne vais pas te faire la liste. Ce qui compte, écrit ici pour ne pas avoir à en rediscuter : le moteur de scoring (déterministe, donc testable unitairement sans ambiguïté) n'a aucune excuse pour ne pas avoir une couverture solide dès le premier commit qui le touche. Le reste (E2E sur le parcours critique, tests d'intégration sur l'appel Gemini avec repli, vérification visuelle) — choisis tes outils et tes conventions, et documente le choix dans ce fichier une fois pris, pour que la prochaine session n'ait pas à redécouvrir pourquoi.

## Ce fichier est vivant

Complète-le au fil du projet : décisions d'architecture prises, conventions adoptées, pièges rencontrés et leur correctif, structure de dossiers choisie. La même logique qu'un `CONTRIBUTING.md` ou `ARCHITECTURE.md` qu'une équipe d'ingénierie tient à jour — sauf que là, c'est toi l'équipe.

## Décisions d'architecture

### Stack (étape 1 — scaffold)

- **Next.js 16 (App Router) + TypeScript + React 19**, hébergement visé Vercel. Le §8 de `SPEC.md` laissait vanilla JS/CSS par défaut sauf si la complexité d'état le justifiait — décision documentée dans la conversation de build : le vrai déclencheur est la génération d'image OG dynamique (`@vercel/og`/Satori), pensée pour tourner dans des route handlers Next.js sur Vercel.
- **CSS Modules + custom properties** pour les tokens de design (pas de Tailwind) — fidélité pixel au design sans réinterprétation.
- **i18n maison** dans `src/lib/i18n/` : `locale.ts` (résolution pure, testée unitairement), `dictionary.ts` (`UI_STRINGS` + `tc()`), `locale-context.tsx` (provider client). Priorité de résolution : `?lang=` > cookie `tdg_locale` > `Accept-Language` > `en` par défaut.
- **Tests** : Vitest pour toute logique pure (i18n, et le moteur de scoring à l'étape 2) ; Playwright pour la vérification visuelle à chaque étape et l'E2E du parcours critique plus tard. Vitest est appelé directement (`npx vitest run`) plutôt que via un script qui viendrait masquer les warnings de config.

### Piège rencontré : Next.js 16 renomme `middleware` en `proxy`

Next.js 16 déprécie `middleware.ts` / `export function middleware` — mais ne le signale ni au démarrage de `next dev`, ni par une erreur : le fichier est simplement ignoré. Pire, `next build` continue d'afficher `ƒ Proxy (Middleware)` dans le résumé des routes même quand le fichier est totalement inopérant, ce qui masque le problème à la vérification la plus évidente (le build).

Symptôme observé : `?lang=fr` dans l'URL n'avait strictement aucun effet — pas de `Set-Cookie`, langue jamais changée — alors que la même logique fonctionnait très bien en test unitaire (`resolveLocale()` seule est correcte, c'est l'intégration Next.js qui silencieusement ne s'exécutait pas).

Correctif :
1. Le fichier doit s'appeler **`proxy.ts`** et exporter une fonction **`proxy`** (pas `middleware`).
2. Il doit être placé **au même niveau que `app/`** — donc `src/proxy.ts` ici, puisque l'App Router vit dans `src/app/`. Un `proxy.ts` (ou `middleware.ts`) posé à la racine du repo quand le code applicatif est dans `src/` est silencieusement ignoré aussi.
3. Après avoir renommé/déplacé ce fichier, **redémarrer complètement** `next dev` — le hot-reload ne suffit pas à (re)détecter un fichier de convention comme celui-ci.

Next.js 16 ajoute aussi une fonctionnalité qui réinjecte automatiquement un bloc "agent rules" dans `CLAUDE.md` à chaque `next dev` (annonçant justement ce genre de rupture d'API). Désactivée volontairement via `agentRules: false` dans `next.config.mjs` : ce fichier est un document tenu à la main, pas un endroit où laisser un outil de build écrire.

### Moteur de scoring (étape 2)

`src/lib/scoring/` : `pillars.ts` (ordre canonique AARRR), `questions.ts` (structure id → pilier des 15 questions, copie affichée pas encore fournie — voir `TODO` dans le fichier et SPEC.md §12), `score.ts` (`computeScore()`, pur, 24 tests unitaires côté arrondi/départage/erreurs).

**Écart repéré entre SPEC et design (non bloquant, résolu via la propre règle d'arbitrage de SPEC.md §4) :** SPEC.md §6 fixe une échelle de points à 4 valeurs par réponse (0/7/13/20), donc 4 options de réponse par question. Mais l'écran 05 du design (`DESIGN-BRIEF.md`) ne montre que 3 boutons de réponse dans son exemple ("Yes, and we measure it" / "We have one, but don't measure it" / "Not really"). SPEC.md §4 tranche explicitement ce type de divergence : "le dossier `design/` fait foi pour le visuel, ce document fait foi pour la logique produit" — le nombre d'options par question est de la logique de scoring, pas du visuel. Le moteur de scoring (et donc l'UI du questionnaire à l'étape 4) est construit avec **4 options par question**, pas 3. Signalé ici plutôt qu'implémenté silencieusement.

Autre point à connaître : à cause de l'arrondi (§6, chaque pilier arrondi à l'entier le plus proche avant sommation), toutes les valeurs de 0 à 20 ne sont pas atteignables par pilier — l'ensemble réellement atteignable est `{0,2,4,5,7,9,11,13,15,16,18,20}` (voir le test "every pillar score is always an integer" dans `score.test.ts` pour le détail). Ce n'est pas un bug : le résultat échantillon fixe de la landing (`18/12/8/16/20`, SPEC.md §12) est un contenu codé en dur, jamais recalculé — il n'a donc pas besoin d'être atteignable par de vraies réponses.
