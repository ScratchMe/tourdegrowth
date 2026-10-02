# GitHub — branches, merges, workflows, secrets

Extraits du journal (`JOURNAL.md`). La §1 vaut partout ; la §2 est propre à
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

**Un clone superficiel ment sur l'ascendance.** Un clone fait avec une
profondeur (50 commits dans une session cloud) ne voit qu'un bout de
l'historique. `git merge-base --is-ancestor` et `git log main..branche` y
calculent sur ce bout. Le 2026-10-02, une branche entièrement contenue dans
`main` est ressortie « pas ancêtre, 5 commits d'avance ». Après
`git fetch --unshallow`, elle avait 0 commit d'avance. Avant d'affirmer qu'une
branche est mergée ou de compter ses commits : `git rev-parse
--is-shallow-repository`, puis `git fetch --unshallow` s'il répond `true`. On
peut aussi passer par l'API de comparaison.

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

### 1.8 Une PR en conflit n'a pas de CI, et rien ne le dit

**Une PR que `main` a mise en conflit ne lance pas les workflows
`pull_request`** : GitHub ne sait pas construire la référence de fusion
qu'ils testent. Les checks dynamiques (CodeQL) tournent quand même, si bien
que la PR montre des checks verts et un « Types, tests, build » qui n'apparaît
simplement pas. Ni rouge, ni en attente. Ça nous est arrivé deux fois de
suite le 2026-10-01 (A14 T0) : deux autres PR ont été mergées pendant que la
nôtre attendait.

La règle : quand le check requis **manque** au lieu d'être en cours, lire
`mergeable_state` (`dirty` = conflit) et `git log origin/main` **avant** de
soupçonner le workflow. Le correctif est de fusionner `main` dans la branche.
Relancer la PR ne sert à rien.

### 1.9 Git écrase un dossier ignoré sans prévenir

Un `git worktree` avec un `node_modules` partagé par lien symbolique, puis un
`git add -A` dans ce worktree : le lien est **suivi**, parce que la règle
`node_modules/` de `.gitignore` ne vise que les dossiers, pas un lien qui
porte ce nom. Rejouer ensuite ce commit dans le dépôt principal a **remplacé le
vrai dossier `node_modules` par le lien**, puis l'a supprimé avec le commit
suivant. Git considère un fichier ignoré comme jetable et l'écrase sans
message. Le 2026-10-01 (A14 T1), c'est un `npm ci` qui a réparé.

La règle : écrire `/node_modules` **sans** barre finale dans `.gitignore`
(fait ici le même jour), pour que le lien d'un worktree soit ignoré lui aussi ;
et relire `git show --stat` d'un commit de travail avant de le rejouer
ailleurs. Dernier piège du même worktree : Turbopack refuse de construire avec
un `node_modules` lié par un lien symbolique (« points out of the filesystem
root ») ; le build se fait dans le dépôt principal.

### 1.10 Regrouper ses commits sur une base qui a bougé annule le travail des autres

`git fetch origin main && git reset --soft origin/main && git commit` regroupe
les commits d'une branche en un seul : l'index garde l'arbre de la branche, et
le commit se pose sur `origin/main`. C'est juste tant que `origin/main` est la
base de la branche. **Si le `fetch` vient de faire avancer `main`**, l'arbre
de la branche ne contient pas ce qui vient d'y entrer, et le commit regroupé
le **défait** sans un message ni un conflit. Le 2026-10-01 (A14 T7), une PR de
design mergée par une autre session pendant la vérification : le commit
regroupé de T7 touchait 36 fichiers au lieu de 24 : il défaisait la PR de
l'autre. Vu avant toute PR, sur le `--stat`, puis reconstruit sur sa
vraie base et rebasé.

La règle : regrouper sur la base réelle (`git merge-base HEAD origin/main`),
puis rebaser ; et lire `git diff origin/main --stat` avant chaque `push` : il
ne doit lister que les fichiers de la PR.

---

## 2. Propre à Tour de Growth

- **`main` porte un ruleset** : `Types, tests, build` est un check **requis**,
  une PR est obligatoire, `deletion` et `non_fast_forward` sont bloqués. Une PR
  dont le check n'est pas vert affiche `mergeable_state: blocked`. Vérifié à la
  source (`/rules/branches/main`), pas d'après un document.
- **Quatre workflows** :
  - `ci.yml` — la barrière. Un seul job, étapes du moins cher au plus cher
    (`lint` → `tsc` → `vitest` → `next build` → émulateur Firestore →
    Playwright). Aucun secret nécessaire : rien de ce que le build touche ne va
    jusqu'à une base ou une API, et l'émulateur (A7.11, 2026-09-30) tourne sur
    un projet `demo-` avec une clé jetable (`TESTING.md` §5). Node 22 (le major
    que la plateforme exécute).
  - `verify-live.yml` — la sonde contre les services réels, `workflow_dispatch`
    seulement. **À relancer sur la branche avant tout changement au client
    Gemini** (voir `GEMINI.md`).
  - `stats.yml` — la lecture chiffrée des données privées (motif §1.5).
  - `indexnow.yml` — soumission quotidienne du sitemap. Aucun secret : une clé
    IndexNow est publique par construction, la preuve de propriété est le
    fichier servi.
- **Toute action de tout workflow est épinglée par SHA de commit** (§1.5), et
  `src/__tests__/workflows-pinned.test.ts` l'exige : un workflow neuf ou une
  étape ajoutée rougit la CI sinon. Posé avec l'hygiène de dépôt public du
  2026-09-24 (`SECURITY.md`, posture « lecture bienvenue, PR non attendues »
  dans le README).
- **Une PR verte se merge sans attendre Antoine** (sa décision du 2026-09-29),
  en suivant `.claude/skills/livrer/SKILL.md`, sauf si elle peut faire grimper
  Functions Storage (dépendance, réglage de build, binaire sous `src/`, code
  serveur qui pèse — une route de plus, elle, ne coûte presque rien) : la
  barrière et les commandes qui la vérifient sont au §0 de ce skill.
- **La suppression automatique des branches de tête est activée** : les
  branches de PR mergées disparaissent seules. Ne pas s'en étonner au prochain
  `--force-with-lease`. Elle ne touche que la branche d'une PR mergée.
  Une branche de session recréée depuis `main` après un merge, puis jamais
  reprise, n'a pas de PR, donc elle reste. C'était le cas de
  `claude/repo-technical-functional-audit-e9xr8t`, trouvée le 2026-10-02 :
  son bout était le squash même de #185, donc elle avait été repoussée après
  le merge. Une session ne peut pas la supprimer : le proxy git refuse en 403
  toute écriture hors de la branche désignée, suppression comprise. C'est un
  geste d'Antoine, sur la page *Branches* du dépôt.
- **Une PR Dependabot ne se merge jamais sans Antoine** : elle touche
  `package.json` et le lockfile (`/livrer` §0). La session qui en voit une
  ouverte mesure le poids des bundles serveur avant et après (`VERCEL.md`
  §1.2) et la pose en question dans `CHANTIERS.md` C. Sinon, elle reste
  ouverte sans que personne le sache : #239 et #244 l'étaient le 2026-10-02,
  absentes de tout document, et la seconde ajoutait 11,4 Mo à chaque
  déploiement. Deux PR groupées se touchent toujours dans `package.json` :
  après le merge de l'une, l'autre est en conflit. C'est Dependabot qui la
  refait, jamais une résolution à la main.
- **Majeures ignorées** avec leur raison dans `dependabot.yml` : TypeScript 7,
  ESLint 10, et toute majeure de `@types/node` (elle suit à la main le major
  de Node qu'exécutent Vercel et la CI). **Une mineure aussi** depuis le
  2026-10-02 : `firebase-admin` ≥ 14.4, pour son poids (`VERCEL.md` §2.2,
  C36).
