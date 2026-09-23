# GitHub — branches, merges, workflows, secrets

Extraits du journal de `CLAUDE.md`. La §1 vaut partout ; la §2 est propre à
Tour de Growth.

> **Quand lire ce fichier** : avant de merger, avant d'annoncer qu'un item est
> livré, avant d'écrire ou de modifier un workflow, et avant d'affirmer quoi
> que ce soit sur l'état du dépôt.

---

## 1. Ce qui vaut sur n'importe quel dépôt

### 1.1 Les cinq règles de branche et de merge

1. **Vérifier qu'un merge n'est pas vide** (`git show --stat <sha>`) **avant
   d'annoncer un item livré.** Ça nous est arrivé : un correctif committé sur
   `main` local au lieu de la branche, la branche poussée restée périmée, donc
   une PR sans aucun fichier et un squash vide. **La CI était verte — elle
   testait `main` inchangé.** Une CI verte sur une PR vide est verte pour la
   mauvaise raison.
2. **`git checkout -B <branche>` AVANT d'éditer**, jamais après. C'est la cause
   directe du point 1.
3. **`expectedHeadSha` au merge, c'est le SHA complet de `git rev-parse
   <branche>`**, jamais retapé de mémoire. Un SHA inventé fait rejeter le merge
   en 409 — ce qui est le bon comportement, mais il aurait suffi d'une
   coïncidence pour merger la mauvaise tête.
4. **Une branche empilée se rebase avec `git rebase --onto origin/main
   <ancienne-base> <branche>`** après le merge de la PR du dessous, jamais avec
   un simple `git rebase main` : celui-ci rejoue aussi les commits déjà
   squashés et crée des conflits fantômes.
5. **Un numéro de PR écrit dans un document avant la création se vérifie
   après.** Des PR automatiques (Dependabot) s'intercalent et décalent toutes
   les prédictions. Créer la PR, lire le numéro renvoyé, puis seulement
   l'écrire.

### 1.2 Un état de dépôt s'énonce d'après GitHub, jamais d'après un clone

Deux affirmations fausses sont parties dans une PR le même jour :

- **« 35 branches »** — c'étaient les refs `origin/*` d'un clone jamais élagué.
  `git fetch --prune` avant tout comptage, ou passer par l'API.
- **« le check CI n'est pas obligatoire »** — un statut de document vieux de
  trois jours, relu comme un fait présent alors que la branche était déjà
  protégée.

**Ce qui est écrit dans un document est ce qui était vrai quand il a été
écrit.** Corollaire opérationnel : quand un audit dure plus d'une heure,
refaire `git fetch` et relire `git log origin/main` avant d'écrire un statut —
une autre session peut avoir mergé entre-temps. C'est arrivé, et deux items
avaient déjà été traités au moment où le plan démarrait.

*Piège associé* : avec la suppression automatique des branches de tête activée,
un `git push --force-with-lease` échoue parce que la référence de suivi locale
croit encore que la branche distante existe. `git fetch --prune` avant de
pousser.

### 1.3 Rulesets : l'API classique ment

Sur un dépôt où l'exigence de check vit dans un **ruleset**, l'API classique
`/branches/main/protection` renvoie une liste de checks **vide**. Le bon
endpoint est **`/rules/branches/main`**.

À savoir aussi : **GitHub n'applique pas les rulesets (ni la protection de
branche classique) sur un dépôt privé d'une organisation en plan Free.** Passer
le dépôt en public les rend applicables.

### 1.4 Une barrière et une sonde ne se confondent jamais

Deux workflows qui se ressemblent et n'ont pas le même rôle :

- **La barrière** (`ci.yml` chez nous) : `push` + `pull_request`, entièrement
  hors-ligne, déterministe. C'est **ce check-là, et lui seul**, qu'un ruleset
  doit exiger.
- **La sonde** (`verify-live.yml`) : `workflow_dispatch` uniquement, touche des
  services réels.

**Ne jamais rendre une sonde obligatoire**, pour deux raisons indépendantes :

1. **Mécanique** : ne se déclenchant pas sur `pull_request`, elle ne rapporte
   aucun statut sur une PR. GitHub attendrait donc indéfiniment un statut qui
   n'arrive jamais, et les merges seraient bloqués **en permanence** — pas
   seulement pendant une panne.
2. **De conception** : faire dépendre la capacité à livrer de la disponibilité
   d'un service tiers est un mauvais échange.

**Mais un rouge qui ne veut rien dire finit par ne plus être lu.** Le correctif
n'est pas de la rendre ignorable : c'est de lui faire **nommer le type de
rouge**. Une chaîne de repli épuisée sur des statuts retriables lève une erreur
`UPSTREAM UNAVAILABLE` qui dit explicitement que ce n'est pas une régression.
Elle **échoue quand même** plutôt que d'être sautée : un `skip` cacherait une
panne durable, alors que savoir qu'une fonctionnalité est indisponible a de la
valeur.

*Détail qui coûte un run* : mettre les étapes indépendantes en
`if: ${{ !cancelled() && … }}`, sinon l'échec de la première masque le
résultat de la seconde alors qu'on avait demandé les deux.

### 1.5 Secrets, et les logs publics

**Les secrets GitHub ne sont injectés que dans les exécutions de workflows.**
Une session d'agent est un conteneur séparé : elle ne peut pas les lire, et le
seul moyen d'y arriver serait un workflow qui les affiche — exactement
l'anti-pattern qu'ils existent pour empêcher.

La bonne idée est l'inverse : **déplacer la vérification là où sont les clés**,
plutôt que d'amener les clés à la session.

**Sur un dépôt public, les logs et les artefacts de workflow sont lisibles par
n'importe qui.** Imprimer des données privées dans un log défait la protection
qu'on a mise ailleurs. Le motif qui marche :

1. La session génère une paire de clés éphémère (`age-keygen`) dans son
   scratchpad.
2. Elle déclenche le workflow en passant la **clé publique** en input (validée
   par une regex).
3. Le workflow lit les données avec ses secrets, **chiffre le rapport vers
   cette clé publique**, et n'imprime que le texte chiffré.
4. La session déchiffre en local. Une nouvelle session régénère la sienne.

Règles qui vont avec, toutes vérifiables par un test de contrat sur le YAML :
`workflow_dispatch` seulement, **jamais `pull_request_target`** (il exécute du
code de fork **avec** accès aux secrets — c'est comme ça que les dépôts
fuient), `permissions: contents: read`, actions **épinglées par SHA de commit**
(résolu avec `git ls-remote`, pas recopié), tout binaire téléchargé vérifié par
`sha256sum`, et **aucune ligne qui référence un fichier en clair** hors des
formes autorisées.

> *Note de session* : un travail qui manipule des secrets déclenche les
> garde-fous du mode automatique. Le faire hors mode auto dès le départ.

### 1.6 Quand la CI meurt à l'installation, lire QUEL dépôt a échoué

Deux runs de suite morts avant le premier test, avec tout le reste vert
juste au-dessus. Cause : une installation de dépendances système faisait un
`apt-get update` sur **toutes** les sources apt de l'image du runner, et un
dépôt tiers préinstallé — **que le job n'utilise pas** — servait un index
corrompu, de façon stable pendant une demi-heure.

**Une relance n'y peut rien.** Le correctif est de supprimer la source
inutilisée avant l'installation. La règle : lire **quel** dépôt a échoué avant
de relancer ; si c'est un dépôt qu'on n'utilise pas, relancer ne sert à rien.

### 1.7 Dependabot : essayer, pas lire les plages de peer

Sur une PR groupée de mises à jour majeures, **installer et exercer** chacune
(lint, tests, seuils de couverture, `tsc`) plutôt que d'accepter ou refuser sur
la foi des `peerDependencies`. Notre cas le montre : les plages de peer
acceptaient ESLint 10, mais un plugin embarqué **plantait au chargement** sur
une API retirée. Lire les plages n'aurait rien montré ; installer, si.

**Une majeure est une décision, pas une PR à valider par habitude.** Celles
qu'on refuse s'ignorent dans `dependabot.yml` **avec la raison en
commentaire** ; les mineures et patchs continuent d'arriver.

Et un principe : **les types suivent le runtime, jamais ils ne le précèdent**
(`@types/node` reste sur le major réellement exécuté en production).

---

## 2. Propre à Tour de Growth

- **`main` porte un ruleset** : `Types, tests, build` est un check **requis**,
  une PR est obligatoire, `deletion` et `non_fast_forward` sont bloqués. Une PR
  dont le check n'est pas vert affiche `mergeable_state: blocked`. Vérifié à la
  source (`/rules/branches/main`), pas d'après un document.
- **Trois workflows** :
  - `ci.yml` — la barrière. Un seul job, étapes du moins cher au plus cher
    (`lint` → `tsc` → `vitest` → `next build` → Playwright). Aucun secret
    nécessaire : rien de ce que le build touche ne va jusqu'à une base ou une
    API. Node 22 (le major que la plateforme exécute).
  - `verify-live.yml` — la sonde contre les services réels, `workflow_dispatch`
    seulement. **À relancer sur la branche avant tout changement au client
    Gemini** (voir `GEMINI.md`).
  - `stats.yml` — la lecture chiffrée des données privées (motif §1.5).
  - `indexnow.yml` — soumission quotidienne du sitemap. Aucun secret : une clé
    IndexNow est publique par construction, la preuve de propriété est le
    fichier servi.
- **La suppression automatique des branches de tête est activée** : les
  branches de PR mergées disparaissent seules. Ne pas s'en étonner au prochain
  `--force-with-lease`.
- **Majeures ignorées** avec leur raison dans `dependabot.yml` : TypeScript 7,
  ESLint 10, `@types/node` 26.
