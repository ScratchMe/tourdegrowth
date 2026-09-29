# Tour de Growth — Contexte pour Claude Code

Ce fichier est lu automatiquement par Claude Code au démarrage d'une session dans ce dossier.

## Ton rôle ici

Tu es le tech lead senior de ce projet — front, back, et ops. Antoine (produit) et Claude Design (maquettes) t'ont transmis tout ce qu'il fallait savoir sur le *quoi* et le *pourquoi* dans `SPEC.md` et `design/DESIGN-BRIEF.md`. Le *comment* — architecture, framework, structure de dossiers, conventions de code, stratégie de tests, choix d'hébergement au-delà des grandes lignes déjà posées — est ton terrain. Personne ici ne va te dicter comment structurer un composant React ou quel test runner utiliser : c'est exactement le genre de décision qu'on attend de toi, pas qu'on t'impose.

Les seules choses non négociables sont listées plus bas, parce que ce sont des *décisions produit déjà tranchées*, pas des préférences d'implémentation.

**Lis dans cet ordre :** ce fichier → `SPEC.md` (surtout §12, qui répartit clairement ce qui est déjà tranché de ce qui doit encore remonter à l'agent produit) → `design/DESIGN-BRIEF.md`.

## Les fichiers d'outil — à ouvrir sur déclencheur, pas au démarrage

Les pièges et conventions propres à **chaque outil** vivent dans leur propre
fichier, pour deux raisons : garder celui-ci lisible, et pouvoir **retransmettre
ces apprentissages à un autre projet** qui utilise le même outil. Chacun est
découpé en « ce qui vaut partout » (portable) et « propre à Tour de Growth »
(ne voyage pas).

**Seul `CLAUDE.md` est chargé automatiquement.** Les fichiers de cette table ne le
sont pas — d'où la table, qui ne contient pas les règles mais **le moment d'aller les
lire**. Si un déclencheur ci-dessous est réuni, ouvrir le fichier avant d'agir,
pas après.

| Fichier | Déclencheur — ouvrir AVANT d'agir |
|---|---|
| **`VERCEL.md`** | Tout merge sur `main` · toucher `vercel.json` ou `next.config.mjs` · affirmer quoi que ce soit sur une facture ou un compteur Vercel · mesurer le poids d'un déploiement |
| **`NEXTJS.md`** | Toucher aux layouts racine, au proxy, aux routes de métadonnées, au 404 · voir des chunks dupliqués · conclure qu'un comportement de rendu est un bug de notre code · se fier à sa mémoire d'une API Next (la doc de la version installée est dans `node_modules/next/dist/docs/`) |
| **`TESTING.md`** | Écrire un test censé protéger une correction · **annoncer que quelque chose est vérifié** · une suite qui rougit ou verdit de façon inattendue |
| **`GITHUB.md`** | Merger · annoncer qu'un item est livré · écrire ou modifier un workflow · affirmer quoi que ce soit sur l'état du dépôt |
| **`GEMINI.md`** | Toucher au client de génération ou au prompt · conclure qu'un échec vient du modèle |
| **`FIRESTORE.md`** | Ajouter une lecture sur un chemin public, un compteur, ou une écriture qui peut entrer en concurrence |
| **`JOURNAL.md`** | Toucher une zone dont on ne connaît pas l'histoire : y chercher son entrée (`grep`) · **chaque livraison : y ajouter l'entrée, à la fin** · suivre un renvoi « `CLAUDE.md`, étape N / entrée du … » écrit avant le 2026-09-27 |

**Pourquoi cette table plutôt qu'un simple lien** : la convention sur la cadence
de merges était *déjà* dans `CLAUDE.md`, écrite par moi, et je ne l'ai pas suivie
(2026-09-15). Déplacer une règle dans un fichier non chargé sans dire **quand**
aller la chercher, c'est l'enterrer. Le déclencheur est la moitié utile.

**Le journal vit dans `JOURNAL.md` depuis le 2026-09-27.** Il faisait 93 % de ce
fichier, soit environ 150 000 tokens chargés dans chaque session. Tout renvoi
antérieur du type « `CLAUDE.md`, étape 5 », « l'entrée R-12 de `CLAUDE.md` » ou
« `CLAUDE.md`, 2026-09-14 », dans le code comme dans les documents, désigne une
entrée de `JOURNAL.md`. Les règles, les leçons et les conventions numérotées,
elles, sont restées ici.

Les autres documents de la racine sont des **plans et des revues**, pas des
conventions : `SPEC.md` et ses addenda (le produit), `REVIEW*.md` (les trois
revues, closes), `AUDIT.md` + `AUDIT-PLAN.md` (l'instrument d'audit),
`GROWTH-PLAN.md` (la distribution), `GAME-BRIEF.md` (le jeu « Le côté obscur ») et
`ENGINE.md` (le moteur de croissance). **`CHANTIERS.md` est la liste de travail**,
rangée par agent (autonome, design sync, décisions, gestes d'Antoine), avec le
prompt de chaque session : on y retire ce qu'on livre, on y ajoute ce qu'on trouve.

## Les plug-ins s'installent à la main, dans le dépôt

**claude.ai ne livre pas les plug-ins aux sessions cloud.** Constaté le 24/09/2026 sur Ramille :
Product Management était activé sur le compte, et la session ne le voyait pas (liste des plug-ins
du compte vide, catalogue « non activé », dossier de synchronisation vide). Le dépôt est la seule
chose qu'une session cloud est sûre d'emporter. Un plug-in arrive donc en `.zip` et s'installe dans
le dépôt, sous `.claude/` :

```
node scripts/installer-un-plugin.mjs <archive.zip | dossier> [--prefixe <court>] [--manuel | --auto] [--licence <fichier>]
node scripts/installer-un-plugin.mjs --retirer <plug-in>
```

- **Relancer le script sur une archive plus récente met le plug-in à jour.** Ce qu'il avait posé
  est retiré d'abord, donc un skill disparu en amont disparaît d'ici. Le préfixe, le mode et la
  licence choisis la première fois sont repris sans qu'on les redise.
- **`--retirer` défait exactement ce que dit `installation.json`**, jamais tout ce qui porte le
  préfixe : un skill écrit ici sous un nom voisin partirait avec. Ce qui cite le plug-in ailleurs
  (ce fichier, un document) reste à relire à la main, et le script le rappelle.
- **Ce qui est installé, et ce qui ne l'est pas, se lit dans
  `.claude/plugins-importes/<plug-in>/installation.json`** : ce qui a été posé, la source et son
  sha256, le préfixe, le mode, et tout ce qui n'a pas été installé. Le manifeste, la licence ou la
  notice et `CONNECTORS.md` sont gardés à côté.
- **Le dépôt est public, donc installer un plug-in, c'est le redistribuer.** Sa licence voyage
  avec la provenance. Quand l'archive n'en porte pas, `--licence <fichier>` la joint : c'est le cas
  de Design d'Anthropic, dont la licence (Apache 2.0) est à la racine du dépôt d'amont et non dans
  le dossier du plug-in. Un plug-in sans licence est signalé.
- **Prérequis** : Node ≥ 20.11 et le binaire `unzip` (vérifié en CI avec `zip` et `python3`).
  `.claude/` est exclu du lint et du type-check, et le test de l'installeur vérifie que ça le reste.

L'outil vient de Ramille (ScratchMe/Ramille#261, `aa06744`), copié et non réécrit. Son
**interface est gardée telle quelle** (nom du script, options en français,
`.claude/plugins-importes/`, clés d'`installation.json`) pour qu'une provenance veuille dire la
même chose dans les deux dépôts ; le code, les messages et le test sont en anglais.

**Les trois règles de l'outil**, détaillées en tête du script et gardées par son test :

1. **Tout nom est préfixé par celui du plug-in** : `/product-management-write-spec`, pas
   `/write-spec`. Marketing et Product Management portent tous deux `competitive-brief`, et
   Engineering apporte un `code-review` qui masquerait la commande intégrée. C'est le **nom du
   dossier** qui nomme le skill, pas le champ `name` (mesuré). Le champ est réécrit quand même. Les
   renvois à d'autres commandes et les liens relatifs dans les consignes sont réécrits aussi. Un
   fichier modifié porte un avis qui le dit, comme Apache 2.0 l'exige. Un nom de plug-in trop long
   pour la limite de 64 caractères se raccourcit par `--prefixe`.
2. **Hooks, connecteurs et agents ne s'installent jamais d'office.** Un hook exécute du code à
   chaque événement, un connecteur ouvre un compte tiers, un agent choisit ses outils. Ils sont
   listés dans `installation.json` et dans la sortie. Un en-tête de skill ou de commande qui
   déclare des hooks est refusé.
3. **Rien n'est écrit avant que tout soit vérifié** : entrées d'archive qui sortent de leur
   dossier, liens symboliques, en-têtes illisibles, collisions de noms, noms relus dans
   `installation.json`. Un refus laisse le dépôt intact.

Ce que le script **ne voit pas**, c'est ce que les consignes disent. Il imprime ce qui mérite un
regard : adresses, commandes shell, `allowed-tools`, liens morts, noms d'amont non réécrits,
fichiers qui ne sont pas des consignes. Les consignes se relisent avant de commettre, avec ces
règles :

- **Les règles du dépôt passent devant les consignes d'un plug-in.** Ces consignes sont écrites
  pour un produit quelconque : le bilinguisme, le déterminisme du score, le garde-fou anti-moquerie
  et tout ce qui précède dans ce fichier restent. Leur texte ne se traduit pas : une traduction
  rendrait chaque mise à jour impossible à rejouer.
- **Une consigne qui se déclare incontournable** (« utilise-moi en premier sur tout… »)
  **s'installe en `--manuel`.** Chaque skill charge sa description dans le contexte de chaque
  session et peut se déclencher seul. En `--manuel`, il sort de la liste présentée à chaque session
  (mesuré) et reste appelable par son nom. Un skill que l'amont réserve à l'agent y est rendu à la
  personne.
- **Aucun contenu du dépôt ne relaie la publicité d'un plug-in.** Sur Ramille, SearchFit SEO
  signait ses gabarits « Powered by SearchFit.ai » : il a été retiré le jour même.
- **Chaque plug-in se décide avec Antoine, un par un, AVANT de s'installer.** Ce sont des
  consignes que l'agent suivra à chaque session, pas un détail d'implémentation. La question se
  pose sous la forme habituelle : ce qu'il fait, ce qui est en jeu, la recommandation, ce qu'on
  casse si on se trompe. Rien ne s'installe avant la réponse. **Brancher un hook ou un connecteur
  est une décision de plus, qui se demande à part.**

## L'outillage Claude Code du dépôt

Retenu le 2026-09-27 en jouant le plug-in Claude Code Setup (sans l'installer), et validé par Antoine :

- **`/livrer`** et **`/bon-a-tirer`** (`.claude/skills/`) : les deux séquences qu'on refaisait à la main, merger jusqu'à la production et construire puis appliquer un bon à tirer. Appelables par Antoine seulement (`disable-model-invocation`) : l'une merge, l'autre publie. **Depuis le 2026-09-29, la session merge d'elle-même une PR verte** en suivant `/livrer` (lu, pas appelé), sauf si le merge touche une dépendance ou un réglage de build, ajoute un binaire sous `src/`, ou alourdit un bundle serveur de plus d'~1 Mo : alors question à Antoine (`/livrer` §0).
- **`relecteur-securite`** et **`relecteur-copie`** (`.claude/agents/`) : deux sous-agents en lecture seule, à lancer sur un diff avant une PR.
- **Un hook** (`.claude/settings.json`) refuse tout Edit ou Write dans ce dépôt tant que la branche courante est `main` (convention 2). Une écriture par Bash passe à travers.
- **Pas de lint ni de type-check après chaque édition** : environ 7 s par édition, mesuré. La CI et `/livrer` s'en chargent.
- **Les plug-ins Data et Design** (Anthropic, installés en `--manuel` le 2026-09-27) : rien n'est chargé, tout s'appelle par son nom. Utiles ici : `/data-validate-data` avant d'annoncer un chiffre ; `/design-critique` et `/design-accessibility-review` sur un nouvel écran. Ce qu'ils tirent des chiffres privés reste dans le scratchpad.

## Ce qui est non négociable (décisions produit, pas des goûts d'ingé)

- **Bilingue FR/EN dès le premier commit fonctionnel.** Pas une couche ajoutée après coup — l'i18n coûte toujours plus cher a posteriori qu'anticipée dès l'architecture.
- **Le scoring chiffré est déterministe et explicable** (règles fixes, arrondi par pilier avant sommation — `SPEC.md` §6). Gemini ne fait que la synthèse qualitative ; il ne doit jamais influencer un point brut. Si un score partagé publiquement n'est pas ré-explicable en 10 secondes, quelque chose ne va pas.
- **Repli multi-modèles pour tout appel Gemini** : `gemini-3.7-flash → 3.6 → 3.5 → gemini-flash-latest` (cet alias est maintenu par Google et pointe toujours vers un modèle Flash à jour — c'est le filet de sécurité qui ne casse jamais). Jamais un seul nom de modèle codé en dur sans repli.
- **Le réglage de ton Neutre/Roast est un choix explicite de l'utilisateur**, avec le garde-fou anti-moquerie-personnelle codé en dur dans le prompt système — jamais laissé à l'appréciation du modèle au moment de l'appel.
- **Le mécanisme de partage (`?ref=`) et son attribution s'instrumentent dès le premier commit fonctionnel.** C'est le cœur du produit, pas une fonctionnalité qu'on rajoute en fin de projet.
- **Analytics (GoatCounter + événements custom) dès le MVP**, pas après coup.
- **~~La bibliothèque de textes de verdict n'est pas encore fournie~~ — règle levée par Antoine le 2026-09-11.** Elle l'était : la voix verdict et la voix roast revenaient entièrement à l'agent produit, et la session ne devait rien en inventer. Antoine a ouvert l'écriture à la session ce jour-là. **Ce qui n'a pas bougé, et ne bouge pas :** le garde-fou anti-moquerie reste codé en dur dans le prompt système (voir plus haut), le roast vise la stratégie ou l'auto-évaluation et **jamais la personne**, et toute copie neuve repart au statut « à relire » (convention 6) — écrire n'est pas approuver. Historique conservé parce que des entrées de `JOURNAL.md` s'y réfèrent.

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

Complète-le au fil du projet — mais il est chargé dans chaque session, donc il ne garde que ce qui doit être su **avant** d'agir : les règles, les déclencheurs, l'état courant, les conventions. L'histoire (la décision prise, les pièges, ce qui a été vérifié en réel) va à la fin de `JOURNAL.md`, une entrée par livraison ; un piège propre à un outil va dans son fichier d'outil. La même logique qu'un `CONTRIBUTING.md` ou `ARCHITECTURE.md` qu'une équipe d'ingénierie tient à jour — sauf que là, c'est toi l'équipe. Claude Code avertit au-delà de 40 000 caractères : c'est le budget de ce fichier.

## État du projet au 2026-09-29 — à lire en premier dans une nouvelle session

Le journal (`JOURNAL.md`) raconte le projet dans l'ordre où les choses se sont passées. Cette section-ci est l'**état courant** : quand une entrée du journal la contredit, c'est celle-ci qui a raison. Ce qui reste **à faire**, et par qui, est dans `CHANTIERS.md`.

### Où en est le produit

**En production depuis le 2026-09-25** (PR groupée [#164](https://github.com/ScratchMe/tourdegrowth/pull/164)) : le design system v3, la revue de copie v1, l'audit SEO v1, les campagnes de lancement v2, et le jeu « Le côté obscur » comme le moteur de croissance, **tous deux fermés derrière leur drapeau** (`GAME_ENABLED`, `ENGINE_ENABLED`) et ouvrables par Antoine seul depuis `/admin/preview`. Depuis, le jeu et le moteur ont reçu deux séries de retours d'Antoine (PR #166 à #168), puis #173 à #175. Pour ouvrir le jeu ou le moteur **à tout le monde** : les bons à tirer nº7 et nº8 d'abord (table ci-dessous), puis la variable dans Vercel et un redéploiement.

En production sur [www.tourdegrowth.com](https://www.tourdegrowth.com), bilingue, avec les deux modes (Quick déterministe, Deep dive généré par Gemini). La revue technique et fonctionnelle du 2026-09-05 est **close** (`REVIEW.md`, 26 constats). **La seconde revue (`REVIEW-02.md`) est close** : les 25 constats techniques et fonctionnels sont livrés (PR #61 à #92), et les cinq décisions produit du lot E ont été tranchées par Antoine le 2026-09-07 — R2-26 et R2-27 faits, R2-28 fait mais **livré fermé** derrière `METRICS_PAGE_ENABLED`, R2-29 parti en brief Claude Design (`design/DS-EXTENSION-BRIEF-02.md`, retour attendu), R2-30 volontairement reporté (la fenêtre Tour de France est un sujet de calendrier, pas de backlog).

**`REVIEW-03.md` est entièrement livré** : lots A, B et C (PR #102 à #113, 2026-09-08 → 2026-09-11), R2-29 close du même coup. C2 (« l'étape qui freine le plus souvent ce mois-ci ») attend l'ouverture de `/metrics`, qui attend elle-même du volume.

**Le design system est synchronisé avec Claude Design** (2026-09-11) : les 34 composants de `src/components/` y sont, avec leurs contrats, 34 aperçus écrits à la main et un en-tête de conventions. Une passe de design construit donc maintenant avec les vrais composants. Les entrées vivent dans `.design-sync/` et **`.design-sync/NOTES.md` est à lire avant toute re-synchro** — ce dépôt est une app, pas un paquet de composants, et trois réglages non évidents en découlent.

**Le check CI est réellement bloquant depuis le passage en public** : un ruleset sur `main` exige `Types, tests, build`. Ce n'est plus la convention manuelle que ce fichier décrivait.

**Ce que le produit fait maintenant et ne faisait pas hier** : un résultat gratuit nomme l'étape qui freine (avec un état de netteté qui refuse de la nommer quand les chiffres ne le portent pas), donne **une action déterministe** — pour le propriétaire comme pour un visiteur arrivé par un lien partagé — montre la carte de partage sur la page plutôt que dans LinkedIn, et met cette action **sur l'image**. La landing prévisualise exactement ça.

**Relecture de la copie** : les bons à tirer nº1, nº2, nº3, nº5 et nº6 sont clos (le détail est dans le journal) ; nº4, nº7 et nº8 sont dans la table ci-dessous. Un nouveau document se construit avec `/bon-a-tirer`, qui repart toujours de `grep -rn "TODO: à relire" src/` et jamais d'un compte de mémoire : trois fois, ce grep a rattrapé un oubli.

**L'instrument d'audit growth** (`AUDIT.md`, `AUDIT-PLAN.md`) : l'outil personnel des diagnostics qu'Antoine mène en entreprise, navigateur seulement, jamais Firestore. La phase 1 (la saisie sous `/admin/audit`) est close ; la suite est côté Antoine (voir la table) ; la phase 3 (tout ce qui ressemble à un produit) reste fermée tant que les entretiens ne sont pas faits et le contrat de travail pas vérifié.

**Chiffres de référence** (à comparer, pas à recopier aveuglément ; mesurés le 2026-09-29 sur la branche de travail, build avec `GAME_ENABLED=true` comme la CI) : **2 236 tests unitaires**, **593 specs Playwright** (588 passées et aucun échec ; 5 ignorées par construction : ce sont les specs « jeu fermé », qui ne tournent que sur un build sans le drapeau ; les specs de l'aperçu propriétaire sautent aussi sans `ADMIN_DASHBOARD_PASSWORD` sur le serveur, que la CI pose), `tsc`/`eslint`/`next build` propres, `npm audit --omit=dev` à zéro, et `vitest --coverage` au-dessus de ses seuils (`src/lib/**` : lignes 82 %, fonctions 77 %). Deux pièges de mesure à connaître avant de conclure qu'une suite est cassée : construire **sans** `NEXT_PUBLIC_GOATCOUNTER_CODE` fait échouer 5 specs analytics en local alors que la CI, qui pose `e2e-stub` au niveau du workflow, les voit passer ; et un `next start` laissé tourner sert l'ancien build (`reuseExistingServer` hors CI).

### Ce qui reste ouvert, et pourquoi ce n'est pas urgent

| Sujet | État | Ce qui le déclencherait |
|---|---|---|
| Hygiène de dépôt public | **Fait le 2026-09-24** : `SECURITY.md` (adresse `contact@`), posture « lecture bienvenue, PR non attendues » dans le README, actions de `ci.yml` épinglées par SHA et `workflows-pinned.test.ts` qui l'exige pour tous les workflows. Restent côté Antoine : les réglages du dépôt vus au passage (`has_projects`, `has_discussions`) | Rien côté code. |
| Limite de débit en mémoire (R-15) | Par instance serverless, arrête le cas naïf | Un abus réel. Passer alors sur un store partagé (Upstash) ou le pare-feu Vercel. |
| Deep dive à ~70 s | Quatre générations en parallèle depuis le bilingue ; l'écran de chargement est conçu pour une attente longue | Si ça devient la norme, regarder le **nombre** de générations, pas le plafond de temps. |
| `/r/<id>` déborde de 37 px à 320 px | Hors contrat (DESIGN-BRIEF fixe 390 et exige 375-430) ; c'est le `PillarChip` | Une décision de design, pas un correctif évident. Antoine a choisi de laisser. |
| Trois avertissements permanents de `design-sync validate` | « Impact » (repli système, police propriétaire) et `GRID_OVERFLOW` sur `DefinitionPopover` et `QuarterNews` (couche supérieure, pas de géométrie) | Rien — les trois sont attendus et documentés dans `.design-sync/NOTES.md`. Ne pas appliquer le `cardMode: "single"` suggéré : il masquerait des histoires. |
| `guidelines/` absent du bundle d'extension 01 | Le README du bundle l'annonce, l'archive ne le contenait pas | Sans conséquence à ce jour ; à demander si on en a besoin. |
| `/metrics` livrée fermée (R2-28) | Le code est en production, la page renvoie 404 tant que `METRICS_PAGE_ENABLED` n'est pas `"true"` dans Vercel, et se cache aussi d'elle-même sous 50 soumissions | Assez de volume pour que des chiffres publics soient crédibles. Poser la variable, rien d'autre à coder. |
| Le primaire du propriétaire est « Refaire le Tour », pas « Partager » | Lecture littérale du retour design : le partage a quitté la rangée de CTA pour un bloc image, et `ShareCard.prompt.md` dit « never primary ». Un essai contraire a été fait puis annulé | Un arbitrage d'Antoine : c'est une décision de croissance, pas d'implémentation. |
| R2-30 (fenêtre Tour de France, SPEC.md §10) | Reporté d'un commun accord : pas d'urgence | À construire **avant** juin 2027, pour que le post parte pendant le vrai Tour et pas après. |
| Les e2e de composition ne passent que par la branche échantillon | `/r/sample` utilise `getSampleNextMove` et `SAMPLE_RESULT.pillars`, pas le vrai chemin. La garde statique est donc seule à protéger le payload | Un id de fixture derrière une variable d'environnement fermée par défaut. À décider : c'est une porte de test sur la route publique la plus sensible. |
| Flake `locale-routing` (`:76`, `:320`) | **Cause trouvée et corrigée le 2026-09-29** : les préchargements de la page quittée réécrivaient le cookie de langue. Le proxy ne l'écrit plus que sur une navigation (`Sec-Fetch-Mode`). 0 échec sur 40 rejeux et 240/240 sur le fichier répété 10 fois, contre 3 sur 10 avant | Un nouvel échec : relire `NEXTJS.md` §1.1 (le proxy ne voit pas les en-têtes du routeur) avant de toucher la spec. |
| TypeScript 7 et ESLint 10 | Tous deux bloqués par des paquets embarqués dans `eslint-config-next` (`typescript-eslint` refuse TS ≥ 6.1 ; `eslint-plugin-react` plante sur ESLint 10). Dependabot les ignore en majeure depuis le 2026-09-08 | Quand `eslint-config-next` suivra. Re-tester en installant, pas en lisant les plages de peer : c'est l'essai qui a montré qu'ESLint 10 plante. |
| Instrument d'audit : phase 1 bis (la vraie mission) | **Le prochain chantier, et il est côté Antoine** : mener AB Tasty dans l'outil jusqu'à `pending = 0`, en tenant le journal des frictions | C'est ce journal qui dira ce que la phase 2 (les readouts) doit construire — il n'y a aucune façon de le deviner d'ici. |
| Copie à relire | **Le bon à tirer nº5 est entièrement clos** : 30 cartes sur 30 tranchées le 2026-09-22 (26 « ok », 4 « à changer »), et les quatre réécritures livrées le 2026-09-23 avec une réponse écrite sous chaque note dans l'artifact. [Nº4](https://claude.ai/code/artifact/d45d5d7d-fdfa-4155-ba0d-76290e331dc8) reste ouvert : les 39 lignes du catalogue d'audit, **1 carte tranchée sur 39** (`m07`, 2026-09-13) — c'est le texte qui s'imprime dans ses livrables sous son nom, et il ferme la phase 2 de l'instrument d'audit | La relecture d'Antoine sur le nº4. Le prochain document se reconstruit depuis `grep -rn "TODO: à relire" src/`, jamais de mémoire ni depuis un compte écrit ici : trois fois de suite ce grep a rattrapé un oubli, et la dernière il a corrigé « six » en « dix ». Les décisions vivent dans la base de chaque artifact — nº4 dans `lines/`, nº5 dans `cards/` ; lire le bon tiroir avant de conclure qu'un artifact n'a pas été ouvert. |
| Vercel (Functions Storage, Fluid CPU) | **Plus une contrainte depuis le 2026-09-26** (Antoine : « Vercel n'est plus un problème »). Les gros postes sont traités : bibliothèque de contenu dédupliquée par route, préchargements retirés, image de partage en cache sous une adresse versionnée, région `cdg1`. Le compteur de stockage suit le poids disque, pas le poids par route. Détail : `VERCEL.md` §1.6 et §2.2 | Rien, sauf une facture qui surprendrait. |
| **Décisions qui attendent Antoine (jeu et moteur)** | Prises par défaut pour avancer, chacune réversible en une phrase : les sept du moteur en tête d'`ENGINE.md` ; celles du jeu (place de l'encart sur le résultat — sur desktop il pousse le CTA principal du visiteur ~30 px sous le bouton de partage —, goulot partagé inclus, « vingt minutes » à garder seulement si le temps mesuré le porte) ; l'état « Tour présent mais non relié » du miroir, qui n'affiche rien ; les deux cas de fuite sans titre vrai, où la slide est omise ; la formule d'amende du jeu (≥ 97 500 € à radar 75, au-dessus du maximum légal de 75 000 € par manquement — fiction inoffensive, un juriste le relèverait) ; D1-D4 des campagnes (`marketing/campaigns/README.md`) | Sa réponse. |
| **Design : la synthèse I + B** | **Retenue par Antoine le 2026-09-28** ([comparaison](https://claude.ai/artifact/XJse5sJWP8uamShXB7qMoj), sources dans `design/alternatives-2026-09/`). **Close** : les cinq PR en production (#177, #178, #181, #182, et #183 pour la fidélité à la maquette, squash `cbe11da`) | Rien pour la passe. Hors d'elle : les constats de l'audit du kit S-8, S-10, S-15 et S-16 (lots A2, A5 et B2 de `CHANTIERS.md` ; S-6, S-11 et S-17 livrés par A1 le 2026-09-29), les écarts laissés que liste le journal. |
| **Repère de churn 1-2 %/mois** | La vérification des faits (ChartMogul : médiane 6,1 % sous 25 $ d'ARPA, 2,2 % au-dessus de 500 $) montre que ce repère vaut pour le SaaS B2B à **panier élevé**, pas pour « les produits vendus aux petites entreprises » comme le disent `engine-catalog.ts` **et** la copie validée de `glossary-deep.ts`. Or dans le moteur ce repère **désigne** la fuite : un produit à petit panier à 4 % serait signalé à tort. Le repère d'activation 20-40 %, qui désigne aussi, n'a aucune source primaire | Une décision d'Antoine : reformuler la population, conditionner la désignation au panier, ou retirer ce pouvoir au repère. |
| Bons à tirer nº7, nº8 | **Le nº6 est clos le 2026-09-29** (37 cartes « ça passe »). **nº7 et nº8 remis d'accord avec le code le 2026-09-28**, aux mêmes adresses. Décisions dans `cards/` : [nº7](https://claude.ai/artifact/65Y8Ft3PCsBR1HDq4bsQSu) (le jeu, 38 cartes : le français validé du prototype est grisé), [nº8](https://claude.ai/artifact/DUjhtzC6kBBN37idxDr1hJ) (le moteur, 82 cartes ; la première est la question des deux repères qui désignent). Construits en lisant les vrais modules, jamais en recopiant. **Hors de tout bon à tirer** : les deux libellés SEO du 2026-09-28 (`relatedComparisonLabel`, `applyAarrrLabel`), le verdict OKR réécrit le 25/09 (`comparisons.ts`), le bandeau (`space-strings.ts`), la bande de l'accueil (`space-strip.ts`), la montagne du hub et le profil du parcours | Les réponses d'Antoine, puis lever les marqueurs et réécrire ce qu'il marque « à changer ». Avant de rouvrir une page, vérifier qu'elle dit encore ce que dit le code (`JOURNAL.md`, 2026-09-28). |
| Design system → Claude Design | **À reconstruire avant de pousser** : A1 (2026-09-29) a changé l'aperçu `Button` (245 cellules attendues), son contrat et `conventions.md`, sans pouvoir reconstruire (le convertisseur `.ds-sync/` n'est pas dans une session cloud). Dernier bundle validé : 77/77, 244 cellules. Le pousser passe par `/design-sync`, que seul Antoine peut lancer depuis sa machine | Quand Antoine lance `/design-sync` (`CHANTIERS.md`, B). |
| Lecture des stats par la session | **Les deux moitiés marchent** (runs réels le 2026-09-14 puis le 2026-09-29 : tableau de bord et Search Console, déchiffrés par la session, aucun chiffre dans le dépôt). La fenêtre « All-time » du funnel a renvoyé une 404 de GoatCounter les deux fois, passée à la relance les deux fois : relancer avant d'enquêter. Les `/en/glossary/*` ne sont pas encore créditées par Search Console (les anciennes adresses le sont encore) : geste D8 de `CHANTIERS.md` | Un relevé par mois (section E de `CHANTIERS.md`) : un `age-keygen` puis un run (`admin`, `gsc` ou `both`). |

Plus rien d'ouvert côté code dans `REVIEW-02.md`. Le lancement, le seeding et le payant sont dans **`GROWTH-PLAN.md`** (2026-09-13 — sans LinkedIn, sans nom ; cinq vagues, la moitié menable par la session seule ; la part autonome de la vague 0 est livrée : IndexNow, UTM, kit et textes dans `marketing/`) ; le SEO a été livré en grande partie par le lot C de cette revue, et sa suite est la vague 2 de ce plan, dont **2.1 et 2.4 sont faites** (les deux pages « porte ouverte » et leur maillage, 2026-09-14) et **2.2 est close** (les dix termes, en trois lots, choisis sur le rapport Search Console du jour — le glossaire passe de 15 à 25 termes, puis 24 après la coupe d'`activation-rate`, soit 48 pages indexables) et **2.3 est faite** (le cluster « AARRR vs X », quatre pages aux deux langues). Il ne reste, menable par une session seule, plus rien dans la vague 2 : **2.5** attend les 50 soumissions de `stats/global`.

**Coût Gemini** : environ 0,04 à 0,06 $ par Deep dive en 2026, le double à partir de 2027, zéro pour le mode Quick. Le détail mesuré est dans `GEMINI.md` §2.

### Les conventions qui comptent pour la suite

*Ces treize lignes sont l'index : la règle en une phrase, toujours chargée au
démarrage. Le raisonnement, les variantes et la méthode de vérification vivent
dans le fichier d'outil indiqué en fin de ligne (voir la table de déclencheurs
en tête de ce fichier). Quand les deux semblent diverger, c'est le fichier
d'outil qui a le détail à jour.*

1. **Vérifier qu'un merge n'est pas vide** (`git show --stat <sha>`) **avant d'annoncer un item livré.** Une CI verte sur une PR vide est verte pour la mauvaise raison — ça s'est produit le 2026-09-06 avec la PR #50, et le bug est resté une demi-journée de plus. → `GITHUB.md` §1.1
2. **`git checkout -B <branche>` AVANT d'éditer**, jamais après. C'est la cause du point 1. Depuis le 2026-09-27, un hook refuse d'écrire sur `main`. → `GITHUB.md` §1.1
3. **`ci.yml` est la barrière, `verify-live.yml` est une sonde.** Ne jamais rendre la seconde obligatoire : elle ne rapporte aucun statut sur une PR, donc l'exiger bloquerait les merges en permanence. → `GITHUB.md` §1.4
4. **Relancer la sonde Gemini sur la branche avant tout changement à `lib/gemini/deep-dive.ts` ou `client.ts`.** Un `responseSchema` mal formé renvoie 400, non retriable : tous les Deep dive casseraient jusqu'à correction, et aucun test hors ligne ne peut le voir. → `GEMINI.md` §1.6 et §2
5. **Un test de non-vacuité qui passe est lui-même un signal.** Deux fois le 2026-09-06 il a révélé autre chose que ce qu'il cherchait : un bug de CSS dé-scopé, puis le fait qu'un durcissement n'était pas observable. Ne pas le traiter comme une formalité. → `TESTING.md` §1.2
6. **Toute nouvelle chaîne de copie repart au statut « à relire ».** Le contenu de `dictionary.ts` et `content/glossary.ts` a été validé par Antoine le 2026-09-06 ; un fichier approuvé est exactement l'endroit où de la copie non relue se glisse sans se voir. → propre au projet — reste ici
7. **Le contraste est vérifié par la CI, sans aucune exception restante.** `KNOWN_CONTRAST_GAPS` est vide dans `e2e/accessibility.spec.ts`. Une nuance plus discrète demande un token qui passe AA, pas une exception — et une couleur translucide se compose **sur son fond réel** avant d'être mesurée. → propre au projet — reste ici
8. **Un numéro de PR écrit dans les docs avant la création se vérifie après.** Dependabot a pris #67 à #70 et #72 au milieu du plan et décalé toutes les prédictions ; les statuts de `REVIEW-02.md` ont dû être corrigés une fois. Créer la PR, lire le numéro renvoyé, puis seulement l'écrire. → `GITHUB.md` §1.1
9. **`expectedHeadSha` au merge, c'est le SHA complet de `git rev-parse <branche>`**, jamais retapé de mémoire : un SHA inventé a fait rejeter le merge de la PR #80 en 409, ce qui est le bon comportement — mais il aurait suffi d'une coïncidence pour merger la mauvaise tête. → `GITHUB.md` §1.1
10. **Un état de dépôt s'énonce d'après GitHub, jamais d'après un clone ou un document.** Le 2026-09-08, deux affirmations fausses sont parties dans une PR : « 35 branches » (les refs `origin/*` d'un clone jamais élagué — `git fetch --prune` avant tout comptage, ou l'API) et « le check CI n'est pas obligatoire » (un statut de `REVIEW.md` vieux de trois jours, relu comme un fait présent alors que `main` était déjà `protected: true`). Ce qui est écrit dans un document est ce qui était vrai quand il a été écrit. → `GITHUB.md` §1.2
11. **Une garde de payload compte ce qui traverse, elle ne nomme pas des props.** Les deux fuites `rawPoints` (#110 puis #115) sont la même erreur à un cran d'écart : la seconde fois la frontière existait et la garde était nominale, donc aveugle au prop suivant. Même chose pour une borne annoncée : la calculer pour **toutes** les variantes, y compris celles qu'aucun e2e ne peut rendre. → `NEXTJS.md` §1.8, `TESTING.md` §2.8
12. **Une branche empilée se rebase avec `git rebase --onto origin/main <ancienne-base> <branche>`** après le merge de la PR du dessous, jamais avec un simple `git rebase main` (qui rejoue aussi les commits déjà squashés et crée des conflits fantômes). → `GITHUB.md` §1.1
13. **Chaque merge sur `main` coûte ~47 Mo de Functions Storage pendant 30 jours** — *plus une contrainte depuis le 2026-09-26 (Antoine : « Vercel n'est plus un problème »), gardé comme mémoire du coût.* Ce n'est plus une question de confort de déploiement : le compteur est une somme glissante que rien ne purge, le plafond est de ~211 merges par 30 jours au poids actuel, et nous étions à 154 le 2026-09-15. Grouper les pushes sur une branche (une vérification complète, un push) et espacer les merges est donc une contrainte chiffrée. Un merge qui ne touche que de la doc ne coûte plus rien depuis le 2026-09-24 (`scripts/vercel-ignore.sh`) — à condition qu'il ne touche QUE de la doc. → `VERCEL.md` §1.1, §1.6 et §2.3

### Carte du repo

```
src/app/[locale]/        pages de contenu, statiques, une URL par langue
src/app/(app)/           quiz, résultat, deep dive, admin — dynamiques, sans préfixe de langue
src/app/api/             deux routes POST : création de soumission, Deep dive
src/components/          core / brand / quiz / result / glossary / game / viz — le design system porté
src/content/             toute la copie du site, validée (agent produit pour l'origine, Antoine le 2026-09-06 et le 2026-09-09 pour le reste)
src/lib/                 scoring (pur), i18n (dont meta.ts), seo (JSON-LD), og (polices, tokens, gabarit et adresse versionnée de l'image de résultat), gemini, submissions (dont segment.ts, benchmark.ts), metrics, analytics
src/lib/game/            le jeu « Le côté obscur » (moteur pur, stockage, vue) ; sa copie dans src/content/game/, sa présentation dans src/components/game/, ses pages sous src/app/[locale]/game/ — GAME-BRIEF.md fait foi
src/lib/engine/          le moteur de croissance (pur : dérivations, diagnostic, « et si », deck, phrases) ; sa copie dans src/content/engine-*.ts, son îlot sous src/app/[locale]/aarrr-funnel-template/ — ENGINE.md fait foi
src/lib/owner-preview.ts l'aperçu propriétaire seul du jeu et du moteur (cookie HMAC sous le mot de passe admin, posé par /admin/preview)
src/lib/viz/             échelles et tracés sans bibliothèque ; composants dans src/components/viz/
src/lib/audit/           l'instrument d'audit growth (AUDIT.md = le schéma, AUDIT-PLAN.md = le plan par phases) — pur, navigateur seulement, jamais Firestore ; son catalogue est dans src/content/audit-catalog.ts
VERCEL.md NEXTJS.md      conventions et pièges par outil, ouverts sur déclencheur (table en tête de ce fichier)
TESTING.md GITHUB.md      — chacun coupé en « portable » / « propre à Tour de Growth »
GEMINI.md FIRESTORE.md
GROWTH-PLAN.md           le plan de distribution (sans LinkedIn, sans nom) ; marketing/ son kit (textes de lancement, captures, annuaires), marketing/campaigns/ les trois lancements séquencés ; REVIEW*.md les revues ; AUDIT*.md l'instrument d'audit
design/                  brief d'origine, extensions 01 et 03 (le brief 02 n'est jamais parti), alternatives-2026-09/ (les maquettes I + B)
e2e/                     specs Playwright contre un build de production (dont les canaris audit et moteur)
scripts/live/            sondes contre les vrais services, lancées à la main
.claude/                 skills/ (/livrer, /bon-a-tirer, plug-ins Data et Design), agents/ (les deux relecteurs), hooks/ + settings.json (la garde sur main), plugins-importes/ (provenance des plug-ins installés)
JOURNAL.md               le journal : chaque décision, chaque piège et ce qui a été vérifié, dans l'ordre
```
