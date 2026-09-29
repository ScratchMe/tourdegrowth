---
name: livrer
description: Emmène la branche de travail jusqu'à la production — vérifications locales, PR, CI, merge en squash, contrôle du squash puis de la production. Appelé par Antoine ; la session suit aussi cette séquence d'elle-même pour une PR verte, dans la limite du §0.
disable-model-invocation: true
---

# Livrer

La séquence de merge de ce dépôt, rassemblée depuis `GITHUB.md`, `VERCEL.md`,
`TESTING.md` et les conventions de `CLAUDE.md`. Chaque étape existe parce qu'un
merge est parti de travers sans elle.

**Qui décide du merge** (Antoine, 2026-09-29 : « quand les PR sont vertes, tu
peux merge, n'attends pas forcément mon GO, tant que tu sais que tu ne vas pas
provoquer soudainement une grosse hausse de functions storage côté Vercel ») :
une PR verte se merge sans attendre son accord, en suivant cette séquence, lue
et non appelée. Sauf si elle peut faire grimper Functions Storage : alors on
s'arrête à la PR verte et on lui pose la question (§0).

## 0. Avant tout

- Lire `GITHUB.md` et `VERCEL.md` : « tout merge sur `main` » est leur
  déclencheur (table en tête de `CLAUDE.md`).
- **Un état de dépôt s'énonce d'après GitHub**, jamais d'après un clone ou un
  document (convention 10) : `git fetch --prune origin` d'abord.
- **La barrière Functions Storage**, pour un merge que la session décide
  seule. Le compteur, c'est le poids disque des bundles serveur multiplié
  par chaque déploiement des 30 derniers jours (`VERCEL.md` §1.1). **Ajouter
  une route ou une page ne coûte presque rien ; ce qui coûte, c'est du code,
  une dépendance ou un fichier tiré dans un bundle serveur.** Avant de merger
  sans Antoine :
  - `git diff --stat origin/main...HEAD -- package.json package-lock.json next.config.mjs vercel.json`
    est vide (trois points : ce que la branche change, pas ce que `main` a
    reçu depuis) ;
  - `git diff --name-only --diff-filter=A origin/main...HEAD -- src | grep -vE '\.(tsx?|css|md)$'`
    est vide : aucune police, image, donnée ou autre binaire ajouté sous
    `src/` ;
  - si la branche ajoute du code côté serveur qui pèse (`src/lib/og/`, une
    route d'image, un gros module de contenu importé par une route
    dynamique), mesurer le poids disque avant et après (`VERCEL.md` §1.2).
    Plus d'environ 1 Mo d'écart (2 % des ~47 Mo), c'est une question.
  Sinon, PR verte et question à Antoine, avec le poids mesuré. Un merge qui
  ne touche que de la doc ne déploie rien et passe toujours.

## 1. La branche

- `git branch --show-current` est la branche de travail désignée, jamais `main`
  (le hook `.claude/hooks/refuse-edits-on-main.mjs` refuse d'ailleurs d'écrire
  sur `main`).
- `git status` est propre, et tout le travail est dans des commits.
- Si la PR précédente de cette branche est déjà mergée, repartir de
  `origin/main` (`git checkout -B <branche> origin/main`, en gardant les commits
  non mergés par `git rebase --onto`). Ne jamais empiler sur un historique
  déjà squashé (convention 12).
- **L'entrée de journal (`JOURNAL.md`) et les chiffres de référence de
  `CLAUDE.md` font partie de la PR**, pas d'un commit d'après.

## 2. Les vérifications locales, dans l'ordre de la CI

```
npm run lint
npx tsc --noEmit
npx vitest run --coverage
GAME_ENABLED=true NEXT_PUBLIC_GOATCOUNTER_CODE=e2e-stub ADMIN_DASHBOARD_PASSWORD=e2e-admin npm run build
```

- Avant Playwright, tuer un `next start` resté d'avant, sinon il sert l'ancien
  build (`reuseExistingServer`) : `pgrep -f 'next[-]server'` puis `kill` par PID,
  dans une commande à part. Un `pkill -f` dont le motif figure dans sa propre
  ligne de commande tue le shell.
- `CI=1 GAME_ENABLED=true NEXT_PUBLIC_GOATCOUNTER_CODE=e2e-stub ADMIN_DASHBOARD_PASSWORD=e2e-admin npx playwright test`.
  Sans ces variables, les specs analytics et d'aperçu rougissent ou sautent pour
  de mauvaises raisons (`TESTING.md`).
- Un changement qui ne touche que de la doc peut sauter build et Playwright :
  le dire, et dire pourquoi.
- Le flake connu de `e2e/locale-routing.spec.ts:75` se rejoue isolé avant de
  conclure quoi que ce soit. Il ne se durcit pas.

## 3. Relire son propre diff comme un relecteur hostile

- Liste des fichiers conforme à l'intention ; rien de vide, rien de trop.
- Aucun identifiant de modèle, aucun secret, aucun chiffre de `/admin/stats` ni
  de la Search Console (le dépôt est public). Dans `marketing/`, le nom
  d'Antoine seulement dans la réponse à « qui est derrière ? » (C22), et
  jamais LinkedIn pour l'instant.
- Toute copie neuve porte `TODO: à relire` (convention 6).
- Pour un changement qui touche une route, le proxy, un payload vers le client
  ou un workflow : lancer le sous-agent `relecteur-securite`. Pour de la copie :
  `relecteur-copie`.

## 4. Pousser et ouvrir la PR

- `git push -u origin <branche>`, avec quatre reprises (2, 4, 8, 16 s)
  seulement sur une erreur réseau.
- Pas de gabarit de PR dans ce dépôt. Titre et corps en français. Le corps se
  termine par `🤖 Generated with [Claude Code](https://claude.com/claude-code)`
  et le lien de la session.
- **Lire le numéro renvoyé** avant de l'écrire où que ce soit : Dependabot
  s'intercale (convention 8).

## 5. Attendre la CI sans la sonder

- S'abonner à la PR (`subscribe_pr_activity`) et programmer un point de
  contrôle (`send_later`, une vingtaine de minutes). Jamais de `sleep`.
- Il faut `Types, tests, build` vert sur la tête courante, un
  `mergeable_state` à `clean`, et aucun fil de relecture en attente.
- **CI rouge** : lire le log de la job, reproduire en local, corriger, repousser.
  Relancer un job n'est pas un diagnostic.

## 6. Merger

- Squash, avec `expectedHeadSha` = la sortie **complète** de
  `git rev-parse <branche>`, jamais retapée (convention 9).
- Titre de commit en français, avec `(#n)`. Le message se termine par les deux
  lignes d'attribution de la session.

## 7. Contrôler le squash

- `git fetch --prune origin`, puis `git show --stat <sha>` : **non vide**, et le
  même nombre de fichiers que la PR (convention 1 : une CI verte sur une PR vide
  est verte pour la mauvaise raison).
- `git diff <tête de la branche> <sha>` doit être vide.

## 8. Contrôler la production

- Un merge qui ne touche que de la doc n'est pas déployé
  (`scripts/vercel-ignore.sh`) : le dire et s'arrêter là.
- Sinon, attendre le nouveau déploiement avec une boucle en arrière-plan sur
  l'en-tête `age` de `https://www.tourdegrowth.com/en`, qui repart d'une
  valeur basse quand le cache est neuf. Pas de `sleep` au premier plan.
- Vérifier en HTTP les surfaces que le changement touche, dans les deux
  langues. Décoder les entités avant de chercher une phrase, et vérifier qu'un
  corps a une taille plausible avant de conclure à une absence
  (`TESTING.md` §2.3bis). Ce qui est derrière un drapeau reste en 404.

## 9. Après

- Se désabonner de la PR et supprimer le point de contrôle.
- Repartir de la base mergée : `git checkout -B <branche> origin/main`, après
  avoir vérifié que l'arbre est identique.
- Dire à Antoine le lien de la PR, le squash, ce qui a été vérifié en production
  et ce qui ne pouvait pas l'être d'ici.
