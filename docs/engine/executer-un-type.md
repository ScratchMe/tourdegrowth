# ENGINE.md, partie 7 — Exécuter un type depuis sa spécification (§23)

*Écrit le 2026-10-04, avec la réécriture des deux spécifications qu'il sert :
[`app-grand-public.md`](app-grand-public.md) (§21, A22) et
[`place-de-marche.md`](place-de-marche.md) (§22, A23). La spécification d'un
type dit **quoi** ; ce guide dit **comment** : qui fait quoi, dans quel ordre,
comment s'arrêter et reprendre, et comment savoir que c'est fini. Il suit la
méthode du jeu ([`docs/game/construire-un-niveau.md`](../game/construire-un-niveau.md),
§21.9), éprouvée sur trois niveaux, avec ce qui change pour le moteur.*

---

## 23.0 Pour qui, et la règle

Pour **un orchestrateur** (la session principale) qui lance **un sous-agent
par unité**, chaque unité livrée en **une PR**. Le sous-agent **exécute, il ne
décide pas** : tout ce qui demande un jugement de produit, de copie ou
d'architecture est tranché dans la spécification, ou dans sa table des
décisions d'Antoine. Trois règles en découlent :

1. **Aucune copie inventée.** Chaque chaîne neuve qu'un écran ou une slide
   affiche est écrite, en français et en anglais, dans la spécification (ou
   dans le fichier de contenu qu'elle désigne), **ou produite par une règle
   de réécriture qu'elle donne** : un lexique, la règle qui désigne les
   feuilles à réécrire, et le test qui le vérifie (§21.8.3, §22.8.3). Le
   sous-agent recopie, ou applique le lexique sans rien ajouter ni retrancher
   au sens, typographie posée (§23.8). S'il manque une chaîne qu'un type ou un
   test exige, ou si une feuille ne se réécrit pas par le lexique sans changer
   de sens, il s'arrête et le dit : il ne l'écrit pas. **Les commentaires de
   code ne sont pas de la copie** : ceux qu'une fiche ne donne pas (un
   en-tête, une doc de prop, un commentaire de workflow) s'écrivent en
   anglais, à la densité de leurs voisins, sans s'arrêter (le pilote APP-0).
2. **Aucun chiffre recalculé à la main.** Les chiffres d'une spécification
   sortent des modèles purs déjà codés (§23.2) et de leurs tests, ou d'un
   script de référence que la spécification cite. Si un test d'un modèle pur
   rougit, c'est le code qui a dérivé, pas la table.
3. **Une contradiction arrête le travail.** Si la spécification contredit le
   code de `main`, un test, `CLAUDE.md` ou une autre spécification, le
   sous-agent ne choisit pas : il rend compte, et l'orchestrateur pose la
   question à Antoine au format de `CHANTIERS.md` C (aujourd'hui, la reco, ce
   qui casse si on se trompe). Une réponse qui change la spécification passe
   d'abord par une PR de documentation, puis par le code.

## 23.1 Avant de commencer

- **Les décisions sont tranchées.** La table des questions de la
  spécification porte une colonne « Réponse d'Antoine » ; une case vide
  arrête tout.
- **Ce que lit le sous-agent, dans cet ordre** : `CLAUDE.md` (et sa table de
  déclencheurs : `TESTING.md` avant d'annoncer quoi que ce soit de vérifié,
  `NEXTJS.md` avant de toucher au rendu, `GITHUB.md` avant un workflow) ; ce
  guide, §23.0 à §23.2 et §23.8 ; dans la spécification, la section 0 (en une
  page), la section des décisions de conception, puis **la fiche de son
  unité** et seulement les sections qu'elle cite.
- **Une branche par unité.** Créée depuis `origin/main` avant la première
  écriture (`git checkout -B <branche> origin/main`, convention 2 ; un hook
  refuse d'écrire sur `main`). **Si la session a reçu une branche imposée**
  (une session cloud en a une), les unités passent l'une après l'autre sur
  cette branche, repartie de `origin/main` après chaque merge (`/livrer` §9,
  convention 12). `npm ci` si `node_modules` manque.

## 23.2 Ce qui est déjà fait

Le 2026-10-04, avant toute unité, les modèles purs sont codés, isolés (rien ne
les importe encore) et épinglés par leurs tests (journal, « A22.b et A23.b ») :

| Fichier | Ce qu'il porte | Ses tests |
|---|---|---|
| `src/lib/engine/stream.ts` | la boucle commune à tous les flux récurrents (`pathFromNextMonth`, identique à `mrrPath` sans levier), `keptPercentOfChurn`, et les deux règles de prix d'une fuite : `relativeGap`, `flowGain`, `keptGain` | dans `app-model.test.ts` |
| `src/lib/engine/app-model.ts` | l'argent de l'app : les deux flux (`newActivesPerMonth`, `revenuePerActive`, `usagePath`, `appRevenuePath`, `appRevenueToday`), la commission (`storeBilledMargin`), l'économie d'une installation (`installMargins`, `installValue`, `installCumulative`, `costPerInstall`, `installPayback`, `installLossCheck`, `installPaybackWarning`, `valueToCost`) et le classement (`usageFlowGain`, `activeRetentionGain`, `appRankingGain`) | `src/lib/engine/__tests__/app-model.test.ts` |
| `src/lib/engine/mkt-model.ts` | l'argent de la place de marché : la demande (`revenuePerBuyer`, `demandPath`), l'offre (`newPaidSellersPerMonth`, `sellerPath`, `paidSellerCac`), le total (`marketplaceRevenuePath`, `marketplaceRevenueToday`) et l'économie d'un côté (`sideEconomics`) | `src/lib/engine/__tests__/mkt-model.test.ts` |

**Ne pas modifier ces trois modules** en exécutant une unité : on les
**importe**. Une unité qui croit devoir en changer une ligne s'arrête et le
dit (règle 2). Seule exception : ajouter une fonction pure que la fiche de
l'unité nomme et spécifie, avec son test.

## 23.3 Les rôles

- **L'orchestrateur** (la session principale) : il lit l'état du lot dans
  `CHANTIERS.md` (§23.5), choisit l'unité suivante dont les prérequis sont
  mergés, lance un sous-agent avec le prompt de §23.6, lit son compte rendu,
  lance les relecteurs du dépôt (`relecteur-copie` sur toute copie neuve,
  `relecteur-securite` dès qu'une route, le proxy, un payload vers le client
  ou un workflow bouge), ouvre la PR en brouillon, la suit, la merge selon
  `/livrer` (lu, pas appelé), coche l'unité avec le numéro de PR lu sur
  GitHub, et s'arrête au point de pause si on le lui a demandé. **Il ne code
  pas**, sauf une correction d'une ligne trouvée en relisant.
- **Le sous-agent** (outil Agent, `model: "sonnet"`, `subagent_type:
  "general-purpose"`) : une unité, une branche, des commits poussés. Il
  n'ouvre pas de PR et ne merge pas. Il s'arrête et rend compte dès qu'il bute
  sur une des conditions d'arrêt de sa fiche ou de §23.0. Si la CI rougit sur
  sa PR, l'orchestrateur relance **un nouveau sous-agent** sur la même branche,
  avec le journal de la job en entrée (jamais un « relancer la job » comme
  diagnostic, `/livrer` §5).
- **Un seul clone pour les deux** (le pilote U0 du jeu, 2026-10-04) : tant
  que le sous-agent travaille, l'orchestrateur ne change pas de branche et
  n'écrit rien dans le clone ; il peut lire. Les modifications non commitées
  qu'il y voit sont celles du sous-agent.

## 23.4 Le format d'une fiche d'unité

Chaque unité de §21 et §22 a une fiche au même format, qui se suffit à
elle-même avec les sections qu'elle cite :

| Rubrique | Ce qu'elle dit |
|---|---|
| **But** | une phrase : ce que l'unité livre |
| **Prérequis** | les unités mergées avant elle |
| **À lire** | les sections de la spécification et les fichiers du code, avec leurs lignes quand elles comptent |
| **Fichiers** | ceux qu'elle crée ou modifie ; tout autre fichier est hors de son périmètre (sauf ce que le compilateur exige, à dire dans le compte rendu) |
| **Étapes** | numérotées, dans l'ordre où les faire |
| **Acceptation** | les commandes à faire tourner et ce qu'elles doivent rendre ; les captures quand un écran bouge |
| **Arrêt** | les conditions propres à l'unité où le sous-agent s'arrête et rend compte |
| **Relecteurs** | `copie`, `sécurité`, ou aucun |
| **Pause** | ce qui est vrai en production après son merge (en général : rien de visible, le type reste fermé) |

## 23.5 Le tableau d'avancement

**La seule source de vérité** pour reprendre est le tableau du lot dans
`CHANTIERS.md` (A22 pour l'app, A23 pour la place de marché) : une ligne par
unité, une case, le numéro de PR et la date. L'orchestrateur la met à jour
**dans la PR de l'unité** (pas dans un commit d'après), avec l'entrée de
journal que le sous-agent a écrite.

Reprendre, dans une nouvelle session :

1. `git fetch --prune origin` ; lire le tableau du lot sur `origin/main`.
2. Lister les PR ouvertes du dépôt (outils GitHub) : une PR d'unité ouverte,
   c'est une unité en cours. Lire son état (CI, conflits, relectures) et la
   finir avant d'en commencer une autre.
3. Sinon, prendre la première unité non cochée dont les prérequis sont cochés.

Rien d'autre n'a besoin d'être relu : chaque unité mergée a laissé son entrée
au journal, ses tests et sa case.

## 23.6 Le prompt d'une unité

L'orchestrateur remplit les champs entre chevrons et le passe tel quel
(`<DOSSIER>` : le clone, `/home/user/tourdegrowth` en session cloud ;
`<ATTRIBUTION>` : les deux lignes de fin de commit que sa session donne, avec
le nom du modèle du sous-agent) :

```text
Tu exécutes une unité du moteur de growth de Tour de Growth : <UNITÉ>
(par exemple « APP-8, les écrans de l'argent de l'app »). Tu appliques une
spécification déjà tranchée : tu ne décides rien de ce qui touche au produit,
à la copie ou à l'architecture.

Lis d'abord, en entier : CLAUDE.md ; docs/engine/executer-un-type.md (§23.0,
§23.1, §23.2, §23.8) ; puis, dans <SPÉCIFICATION> (docs/engine/app-grand-public.md
ou docs/engine/place-de-marche.md), la section 0, la section des décisions de
conception, et la fiche de ton unité. Lis ensuite exactement ce que la rubrique
« À lire » de la fiche cite, et rien d'autre n'est nécessaire.

Le dépôt est cloné dans <DOSSIER> : travaille là, sur la branche <BRANCHE>,
partie de origin/main avant toute écriture (git fetch origin main && git
checkout -B <BRANCHE> origin/main). Tes fichiers de travail (captures, specs
et scripts jetables, journaux, le jar de l'émulateur) vont hors du dépôt, dans
un dossier temporaire : git status ne montre que les fichiers de l'unité. Fais
exactement les étapes de la fiche, avec les chaînes et les chiffres de la
spécification recopiés tels quels, espaces insécables posées selon §23.8 ; une
chaîne qui existe déjà dans le code se recopie par script, jamais retapée
(§23.8).
Ne touche pas aux fichiers hors de la rubrique « Fichiers », sauf ce que le
compilateur exige (dis-le). Ne modifie pas src/lib/engine/stream.ts,
app-model.ts ni mkt-model.ts : importe-les.

Arrête-toi et rends compte, sans contourner, si : une condition d'arrêt de la
fiche est réunie ; une chaîne exigée manque dans la spécification ; la
spécification contredit le code ou un test ; un test existant rougit et la
fiche ne dit pas qu'il doit changer (un test dont seul l'appel change, parce
qu'une signature a changé, avec les mêmes valeurs attendues, n'est pas un test
qui rougit : retouche l'appel et liste-le dans ton entrée du journal) ; une
sortie d'un golden du moteur bouge ; tu as besoin d'une décision.

Avant de pousser, fais passer les commandes de la rubrique « Acceptation »,
ajoute l'entrée de ton unité à la fin de JOURNAL.md (ce qui est livré, les
choix d'exécution, ce qui est vérifié, avec les chiffres réels des commandes),
remplace dans CLAUDE.md ceux des chiffres de référence (tests unitaires, specs
Playwright) qui ont changé, sans ajouter de phrase, et coche ton unité dans le
tableau de <LOT> de CHANTIERS.md (sans numéro de PR : l'orchestrateur
l'ajoute). Juste avant de pousser : git fetch origin && git merge origin/main
(un conflit dans JOURNAL.md garde les deux entrées entières, la tienne en
dernier ; un conflit sur la ligne des chiffres de référence de CLAUDE.md
prend la ligne d'origin/main et y pose le nombre de tests que vitest rend
sur l'arbre fusionné ; ailleurs, arrête-toi et rends compte), puis tsc et
vitest une dernière fois. Commit et pousse ta branche (git push -u origin <BRANCHE> ; sur
une erreur réseau seulement, jusqu'à quatre reprises après 2, 4, 8 et 16 s).
Tes messages de commit se terminent par ces lignes : <ATTRIBUTION>. N'écris
aucun identifiant de modèle ailleurs (code, commentaires, journal). N'ouvre
pas de PR et ne merge pas. Une relance de correction qui ne touche que des
commentaires, des tests unitaires ou des documents saute le build et
Playwright, et le dit.

Ton compte rendu, en français : ce qui est fait, fichier par fichier ; la
sortie résumée de chaque commande (tests passés sur total) ; les captures
prises et leur chemin ; tout écart à la spécification et pourquoi ; les
questions ouvertes. N'écris « vérifié » que pour ce que tu as fait tourner.
Termine par une section « Ce que j'ai dû deviner » : chaque endroit où la
spécification ou ce guide ne suffisait pas et où tu as dû interpréter, même
légèrement, avec ce que tu as choisi (« rien » si rien).
```

## 23.7 Ce que l'orchestrateur vérifie avant de merger

1. Le compte rendu cite des commandes réellement lancées, et leurs sorties
   sont vertes ; la CI de la PR (`Types, tests, build`) est verte sur la tête.
   **Juste après l'ouverture de la PR**, son `mergeable_state` : `dirty` veut
   dire que la CI ne tournera pas, et la seule trace en est l'absence de
   « Types, tests, build » dans ses checks (le pilote U0 du jeu : deux merges
   d'une autre session pendant l'unité). Relance alors un sous-agent sur la
   même branche avec `git fetch origin && git merge origin/main`.
2. Les relecteurs n'ont rien de bloquant, ou leurs remarques sont corrigées par
   un sous-agent relancé sur la même branche.
3. Les goldens v1 et v2 du moteur n'ont pas bougé : `git diff origin/main --stat
   -- src/lib/engine/__tests__/golden-v1.json src/lib/engine/__tests__/golden-v2.json`
   est vide. Le SaaS B2B ne change pas d'un caractère.
4. Pour une unité qui touche un écran ou une slide, il ouvre lui-même deux
   captures (390 px en anglais, 1 280 px en français) : leçon nº 1 de
   `CLAUDE.md`.
5. Le merge suit `/livrer` (§0 compris : une dépendance ou un réglage de build
   est une question à Antoine). Puis `git show --stat` du squash (convention 1),
   et la case de l'unité complétée avec le numéro de PR lu sur GitHub
   (convention 8), dans la PR suivante si elle est déjà mergée.
6. **Les deux budgets que la CI tient** (`src/__tests__/claude-md-budget.test.ts`) :
   - **`JOURNAL.md` sous 200 000 caractères.** Chaque unité y ajoute son
     entrée (2 000 à 5 000 caractères), et d'autres lots en ajoutent en même
     temps (72 000 le 2026-10-04, juste après l'archivage du douzième volume).
     **Avant de lancer une unité**, l'orchestrateur compte
     (`node -e 'console.log(require("fs").readFileSync("JOURNAL.md","utf8").length)'`) ;
     au-delà de 185 000, il archive d'abord, comme l'en-tête du journal le dit
     (les entrées les plus anciennes, entières et sans rien réécrire, dans un
     volume de plus de `docs/journal/`, et la ligne de la table), dans une PR
     de documentation à part, mergée avant l'unité ;
   - **`CLAUDE.md` sous 40 000 caractères** (38 441 le 2026-10-04). Chaque
     unité y **remplace** les chiffres de référence qui ont changé (tests
     unitaires, specs Playwright, §23.6), sans ajouter de phrase ; APP-11 et
     MKT-10 remplacent aussi la phrase de l'état du moteur. Le test vert est
     un critère de leur acceptation, et un texte qui ne tient pas va au
     journal, pas dans `CLAUDE.md`.
7. **La section « Ce que j'ai dû deviner »** du compte rendu se lit : ce qui y
   relève de ce guide ou d'une spécification s'y corrige, dans une PR de
   documentation, avant l'unité suivante. Une devinette laissée là revient à
   l'unité d'après.

## 23.8 Vérifier avant de pousser, et les pièges connus

```sh
npx tsc --noEmit
npx eslint .
npx vitest run
# build comme la CI (ci.yml, bloc env) ; ENGINE_TYPES=consumer-app,marketplace depuis MKT-10 :
GAME_ENABLED=true ENGINE_TYPES=consumer-app NEXT_PUBLIC_GOATCOUNTER_CODE=e2e-stub ADMIN_DASHBOARD_PASSWORD=e2e-admin npm run build
# Playwright contre ce build ; tuer avant un `next start` resté d'avant (`/livrer` §2)
CI=1 GAME_ENABLED=true ENGINE_TYPES=consumer-app NEXT_PUBLIC_GOATCOUNTER_CODE=e2e-stub ADMIN_DASHBOARD_PASSWORD=e2e-admin npx playwright test e2e/engine-<fichier>.spec.ts
```

Ces commandes reprennent le bloc `env:` de `ci.yml` **tel qu'il est sur la
branche** : `ENGINE_TYPES` y vaut `consumer-app` depuis APP-0, puis
`consumer-app,marketplace` depuis MKT-10 (qui ouvre la place de marché à la CI
avec ses e2e). Avant MKT-10, les e2e se lancent avec `ENGINE_TYPES=consumer-app`
comme la CI, et seules les captures d'une unité de la place de marché se
prennent sur un build `consumer-app,marketplace`. **Une unité sans écran
fait quand même tourner**, contre ce build, `e2e/engine-canary.spec.ts` et
`e2e/engine-collect.spec.ts`. Le pilote APP-1 n'avait pas d'écran et il en a
cassé un : un compte partagé nommait un chiffre que les props du SaaS ne
portent pas. Seuls ces e2e l'ont vu. La suite complète (plus d'une heure en
local) est celle de la CI.

**Les captures** (leçon nº 1 de `CLAUDE.md`) : une spec Playwright jetable,
**hors du dépôt**, sur le modèle de `scripts/engine-density.capture.ts` (ses
tests « brief 09 », et son en-tête pour les commandes), qui pose l'état par
`engineSeed` d'`e2e/engine-helpers.ts` et les fixtures de
`src/lib/engine/__tests__/fixtures.ts` (`consumerState()`…), contre un build
local **ouvert à l'exécution** :
`ENGINE_ENABLED=true GAME_ENABLED=true ENGINE_TYPES=<les types de la CI>
npm run build`, puis `next start` avec les mêmes variables. FR à 1 280 px,
EN à 390 px. Le compte rendu donne le chemin des PNG ; l'orchestrateur les
ouvre (§23.7, point 4).

Les pièges déjà rencontrés sur ce moteur, chacun au moins une relecture :

- **Typographie française** : U+00A0 (jamais U+202F) avant `: ; ! ?`, `%`, `€`,
  après « et avant », dans les milliers (« 12 000 »), et entre un nombre et
  son unité (« 12 mois », comme `engine-catalog.ts`). Les spécifications
  n'en ont pas : le sous-agent les pose en recopiant ;
  `copy-typography.test.ts` les vérifie.
- **Le marqueur** : `TODO: à relire`, avec une espace ordinaire après `TODO`
  (convention 6). Sur toute chaîne neuve ou retouchée, même d'une virgule.
- **Guillemets** : une chaîne anglaise qui cite entre guillemets droits se
  met entre apostrophes simples, ou les échappe (`\"…\"`) si le fichier le
  fait déjà : suivre le fichier (A12.c a cassé l'import d'un module ainsi).
- **Les deux langues** (leçon nº 5) : chaque écran se regarde aussi en
  anglais ; une chaîne anglaise identique à la française est refusée par les
  tests de contrat, sauf les noms propres déjà listés.
- **`hidden` et `display`** (leçon nº 2) : `.classe[hidden]{display:none}`
  explicite.
- **Aucun rouge sur une projection** (S-5) ni sur une perte (C48) : l'encre.
- **Le contraste** : `e2e/accessibility.spec.ts` n'a plus d'exception
  (convention 7).
- **Un golden v1 ou v2 qui bouge** est une alarme, jamais une mise à jour :
  le SaaS B2B ne doit pas changer.
- **Un compteur d'une liste fermée** (les événements GoatCounter, les ids de
  slides) : l'ajouter à la liste ET à son test, jamais l'un sans l'autre.
- **Vitest ne monte aucun composant** (environnement `node`, seuls les
  `*.test.ts`) : un « test de `Setup` » ou d'un autre composant teste une
  fonction pure extraite du composant, dans le module de logique voisin
  (A22 APP-2 : `savedTools` dans `tools.ts`).
- **Recopier par script, jamais retaper** (le pilote U0 du jeu) : les
  fichiers de copie contiennent déjà des U+00A0 invisibles ; une chaîne
  existante retapée à la main n'est plus la même, et un remplacement qui la
  cherche échoue ou, pire, la change. Lire la chaîne dans le fichier (ou
  `git show origin/main:…`) et la recopier par script.
- **Les commentaires que ton changement rend faux** (doc-comments, en-têtes,
  commentaires de test) se corrigent dans les fichiers que tu touches, et
  seulement là.
- **`pkill -f` tue ton propre shell** quand son motif figure dans sa propre
  ligne de commande : `pgrep -f 'next[-]server'` (ou `firestore`), puis
  `kill <PID>`, dans une commande à part.
- **Les fichiers de travail hors du dépôt** : captures, specs et scripts
  jetables, journaux, le jar de l'émulateur Firestore (`TESTING.md` §5) ;
  `git status` ne montre que les fichiers de l'unité. Le reporter JSON de
  Vitest écrit par défaut un dossier `.vitest/` à la racine (le pilote
  APP-0) : `--outputFile.json=` vers le dossier de travail ; `.gitignore`
  le connaît depuis.

## 23.9 Définition de terminé, pour un type

- Toutes les unités de la spécification mergées, CI verte sur chacune, cochées
  avec leur numéro de PR.
- Les tests des modèles purs n'ont pas bougé d'un chiffre ; les goldens v1 et v2
  non plus.
- Le type se crée, se remplit, se diagnostique et se présente, derrière
  `ENGINE_TYPES`, dans les deux langues, à 1 280 et 390 px.
- Toute chaîne neuve porte « à relire » ; l'item du bon à tirer existe dans le
  lot ; l'ouverture (la variable dans Vercel, puis un redéploiement) reste un
  geste d'Antoine, après son bon à tirer.
- L'entrée du journal de chaque unité ; `CLAUDE.md` (l'état du moteur, les
  chiffres de référence) et `ENGINE.md` à jour à la dernière unité.
