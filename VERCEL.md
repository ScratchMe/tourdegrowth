# Vercel — ce qu'on a appris en payant

Conventions et pièges Vercel, extraits du journal de `CLAUDE.md` et distillés
pour être **réutilisables sur un autre projet**. La §1 vaut partout ; la §2
contient les chiffres et les routes propres à Tour de Growth et ne voyage pas.

Chaque règle cite la date de l'entrée de journal correspondante dans
`CLAUDE.md` — c'est là qu'est l'histoire, ici il n'y a que la règle.

> **Quand lire ce fichier** : avant tout merge sur `main`, avant de toucher
> `vercel.json` ou `next.config.mjs`, et avant d'affirmer quoi que ce soit sur
> une facture Vercel.

---

## 1. Ce qui vaut sur n'importe quel projet Vercel

### 1.1 Le modèle de facturation, et pourquoi il surprend

**Functions Storage est une somme glissante sur 30 jours.** Chaque
déploiement ajoute le poids de ses fonctions ; il sort du calcul 30 jours
plus tard, **qu'il ait été supprimé ou non**.

```
Functions Storage = poids des fonctions × déploiements des 30 derniers jours
```

Deux conséquences que nous avons apprises dans le mauvais sens (2026-09-13,
corrigé le 2026-09-15) :

- **Supprimer des déploiements ne fait rien pour ce compteur.** Une politique
  de rétention agit sur autre chose. Nous avons cru le contraire pendant deux
  jours et écrit un correctif qui ne corrigeait rien.
- **La cadence de merges est un terme de la facture**, au même titre que le
  poids du bundle. À poids constant, diviser les merges par deux divise le
  compteur par deux. C'est souvent le levier le plus gros et le moins cher.

**Vercel compte le poids d'un bundle une fois par ROUTE, pas une fois par
bundle physique.** Un bundle de 4 Mo partagé par 92 routes est facturé
~368 Mo. Conséquence directe sur les priorités : **tout gramme retiré du
bundle le plus partagé compte N fois**, et un gramme retiré d'une fonction
mono-route compte une fois. Regarder le nombre de routes avant de choisir où
optimiser.

> ⚠️ **Point non réconcilié, à ne pas présenter comme un fait.** Notre export
> donnait 428,9 Mo par déploiement, ce qui sur 154 déploiements ferait 66 Go
> alors que le compteur affichait ~7 Go. Vercel déduplique probablement les
> bundles identiques entre routes ou entre déploiements successifs. Le
> **classement relatif** des postes, lui, est fiable et suffit à décider. Si
> le chiffre absolu compte pour une décision, demander à leur support plutôt
> que de modéliser.

### 1.2 Mesurer le poids réel — trois pièges en série

La seule mesure fiable se fait hors ligne, sans rien déployer :

```bash
# .vercel/project.json peut être fabriqué ; l'outil ne le valide pas hors ligne
mkdir -p .vercel && cat > .vercel/project.json <<'EOF'
{"projectId":"prj_offline","orgId":"team_offline","settings":{"framework":"nextjs"}}
EOF
npx vercel build --prod --yes
```

Puis, **et c'est là que tout le monde se trompe** :

1. **`du` sur `.vercel/output/functions` ne mesure rien.** La quasi-totalité
   des répertoires `.func` sont des **liens symboliques** vers une poignée de
   bundles physiques. Nous avons obtenu 6 Mo puis 13 Mo pour un déploiement
   qui en pesait 47.
2. **Sommer tous les `.func` donne un résultat absurde** (3,4 Go chez nous) :
   on compte des centaines de fois les mêmes bundles. Il faut filtrer sur
   `not os.path.islink(p)`.
3. **Un `.func` physique ne contient presque rien.** Depuis Vercel CLI 59, il
   porte 5 fichiers ; la vraie liste des fichiers tracés vit dans
   **`filePathMap` de son `.vc-config.json`** (116 Ko de JSON chez nous).

La mesure juste, en une phrase : *pour chaque `.func` non-symlink, sommer la
taille des fichiers listés dans le `filePathMap` de son `.vc-config.json`.*

Pour le poids **facturé**, multiplier ensuite chaque bundle par le nombre de
`.func` (symlinks compris) qui pointent dessus, en excluant les variantes
`.rsc` et `.segments/` que l'export de Vercel ne semble pas compter.

**`.vercel/` doit être dans `.gitignore` ET dans les ignores du linter.** Nous
l'avions oublié : ESLint s'est mis à analyser des bundles minifiés et à
rapporter 2 366 problèmes. Le signe qui ne trompe pas, ce sont des numéros de
colonne à quatre ou cinq chiffres (`1:10753`).

> **Règle de diagnostic générale, apprise ici** : quand un compteur d'outil
> explose après une manipulation, regarder d'abord **quels fichiers** sont
> concernés (`cut -d/ -f1 | sort | uniq -c`), pas les règles.

### 1.3 Comment Vercel groupe les routes en fonctions

Lu dans les `.vc-config.json` plutôt que supposé. Les routes sont groupées
par :

**`operationType`** (`ISR` / `Page` / `API`) **× arbre de layout racine ×
configuration identique** (`maxDuration`, `supportsResponseStreaming`, …).

Conséquence pratique : **deux Route Handlers dont l'un déclare
`maxDuration` et l'autre non sont deux fonctions distinctes.** Les aligner
les fusionne. C'est souvent un gain apparent important sur le disque — et
quasi nul une fois recompté par route (§1.1), donc à évaluer avec la bonne
métrique avant de payer le prix en clarté de configuration.

### 1.4 `outputFileTracingExcludes` : les clés sont des globs

Piège coûteux (2026-09-13). Les clés de `outputFileTracingExcludes` sont des
**globs**, donc `[id]` et `[locale]` se lisent comme des **classes de
caractères**, jamais comme des segments littéraux. Une tentative d'exclusion
ciblée par route a retiré la dépendance de **toutes** les fonctions, images
comprises — un build vert de bout en bout qui aurait livré des aperçus de
liens cassés en production. Échapper les crochets n'a pas suffi non plus.

**Un changement de tracing ne se vérifie jamais sur la suite de tests.**
`next build` et les tests e2e tournent contre `next start`, qui lit
`node_modules` et ignore complètement le tracing. La seule vérification
valable est de **mesurer le Build Output après coup**, bundle par bundle.

**La vérification en exécution, elle, se fait en déplaçant physiquement le
paquet hors de `node_modules`** puis en servant le build. C'est la seule
façon de prouver qu'une exclusion est sûre :

```bash
mv node_modules/<paquet> /tmp/ && npx next start   # puis exercer les routes
```

C'est ce qui a prouvé qu'une piste séduisante était mortelle :
`google-gax/build/src/index.js` fait un `require("@grpc/grpc-js")` **au
niveau module**, donc exclure la pile gRPC du tracing (−17,5 % de poids) casse
le chargement de Firestore. Aucun sous-ensemble n'est excluable.

### 1.5 Deux dépendances qui pèsent sans servir

- **`sharp` (~48 Mo)** est tracé dès que `next/image` *pourrait* être utilisé
  — deux builds de libvips à 18,7 Mo, un wasm de 9 Mo, les bindings. Si
  l'app ne l'utilise pas, `images: { unoptimized: true }` déclare l'intention
  et `outputFileTracingExcludes` sur `sharp` + `@img/**` retire réellement
  les octets. Poser un test qui épingle l'absence de `next/image` dans les
  sources, sinon un futur usage réintroduit 48 Mo par fonction sans bruit.
- **`@vercel/og` embarque deux rendus, Node et Edge**, et Next trace les deux
  dans toute fonction qui peut l'atteindre. Si rien ne tourne en Edge,
  `index.edge.js` est ~734 Ko morts par fonction concernée. **Poser un test
  qui affirme qu'aucune route ne déclare `runtime = "edge"`** : c'est ce qui
  rend l'exclusion légitime plutôt que chanceuse.

### 1.6 `ignoreCommand` — sémantique exacte, vérifiée à la source

La page de référence `vercel.json` ne dit que « code 0 ignores the build,
code 1 continues it », ce qui est **insuffisant pour écrire la commande en
sécurité**. L'article du centre d'aide tranche :

> If the command returns '0', the build will be skipped. If, however, a code
> **'1' or greater** is returned, then a new deployment will be built.

**`exit 0` est donc la seule valeur qui saute.** Un crash du script (`127`),
une erreur git (`128`), une variable non définie : tout est ≥ 1, donc tout
construit. Le mode d'échec est sûr par construction — mais l'écrire en
sachant *pourquoi* c'est sûr vaut mieux que de l'espérer.

**Règle non négociable : en cas de doute, on construit.** Un déploiement
sauté à tort veut dire qu'un correctif ne part pas en production. C'est bien
pire que le coût qu'on essaie d'économiser.

Trois faits qui changent l'écriture de la commande :

- **`VERCEL_GIT_PREVIOUS_SHA` vaut mieux que `HEAD^`.** Il contient le SHA du
  dernier déploiement **réussi**, et n'est exposé que si un Ignored Build Step
  est configuré. L'écart compte dans un cas précis : si un merge de code
  **échoue au build** puis qu'un merge sans effet suit, `HEAD^..HEAD` ne voit
  rien à déployer → saut → **le code du merge échoué ne part jamais**. Prévoir
  un repli : la variable est connue pour être parfois vide.
- **Le clone est superficiel : `git clone --depth=10`.** Un SHA plus ancien
  que dix commits n'est pas dans le clone, `git diff` échoue, donc le build
  se déclenche. Sûr, mais à savoir avant de déboguer.
- **Un build sauté ne crée aucun déploiement** — « No build minutes consumed,
  no new production deployment created ». Donc aucune fonction, donc aucune
  contribution à Functions Storage : l'économie est réelle. (Ne pas
  confondre avec un build **annulé en cours**, qui a déjà exécuté la commande
  de build et compte, lui, dans les quotas.)

Forme recommandée : ne sortir en 0 que sur une détermination **positive et
vérifiée**, et sortir en 1 partout ailleurs, y compris sur le chemin d'erreur.

**Un `vercel.json` invalide fait échouer TOUS les déploiements, production
comprise.** Toute évolution de ce fichier passe par un test unitaire qui le
parse et vérifie qu'une branche de production reste du côté « construire ».

### 1.7 Ce qui coûte du CPU par visite

`Fluid Active CPU` facture le temps CPU actif des fonctions. Deux postes que
personne ne soupçonne :

- **Le préchargement de `next/link` vers des routes dynamiques.** Sur une page
  statique servie par le CDN, chaque lien vers une route rendue à la demande
  déclenche un préchargement — donc une invocation de fonction — **avant que
  quiconque ait cliqué**. Et si le lien traverse une frontière de layout
  racine, la réponse préchargée **ne peut jamais servir** : la navigation sera
  un chargement de document complet quoi qu'il arrive. Rendre ces liens-là en
  `<a>` nu, et poser une garde statique plus une spec qui enregistre **toutes**
  les requêtes du navigateur.
- **Toute génération d'image à la requête.** Un rendu Satori coûte ~150-200 ms
  de CPU à chaud, ~500 ms sur une instance froide. Si l'image est affichée sur
  la page (et pas seulement lue par les crawlers), c'est un rendu par vue.

Mesurer le CPU réel plutôt que le supposer : lire `/proc/<pid>/stat` sur
**tout l'arbre de processus** — le parent `next start` affiche 0, c'est le
worker enfant qui rend.

### 1.8 Cache CDN : le motif qui marche, et celui qui échoue

**Ce qui échoue : mettre un `s-maxage` sur une adresse stable.** Nous l'avons
fait puis annulé. `max-age=0, must-revalidate` **ne garde pas la fraîcheur
côté navigateur** comme on le croit souvent : le navigateur va revalider, et
un cache partagé encore frais répond à sa place. Un contenu qui change
(après un traitement asynchrone, par exemple) reste donc périmé, et sur une
route qui n'est pas ISR, rien ne peut la purger.

**Ce qui marche : un jeton de version dans l'adresse.** Hacher ce qui définit
le contenu (le modèle de données **et** la copie résolue), mettre le hash dans
l'URL, servir `immutable` un an. L'adresse change exactement quand le contenu
changerait, et jamais autrement. Prévoir une adresse « legacy » servie avec un
TTL court pour ce qui a déjà été aspiré par les plateformes.

Mettre **la copie dans le hash**, pas seulement les données : sinon corriger
un mot laisse l'ancienne version en cache un an sur toutes les adresses déjà
servies, et personne ne pense à incrémenter la constante de version à la main.

Deux faits à garder en tête :

- **Le middleware (`proxy`) tourne avant le cache, à chaque requête.** Vercel
  l'exécute avant de consulter son cache de réponses. ~2 ms, mais jamais zéro.
- **Le cache de réponses de fonction est vidé à chaque déploiement.** Donc la
  première vue de chaque ressource après un merge repaie un rendu — un
  argument de plus pour grouper les merges.

### 1.9 Deux limites d'outillage à connaître d'avance

- **L'outil MCP Vercel d'une session agent ne donne pas forcément accès à ce
  qu'on croit.** L'état à re-tester plutôt qu'à supposer, parce qu'il a déjà
  changé une fois : chez nous, l'équipe était d'abord totalement invisible
  (2026-09, sur deux projets), puis `list_projects` a fini par résoudre le
  projet **alors que `list_deployments` répond `403 forbidden`** (2026-09-23).
  Le périmètre est donc par *permission*, pas par visibilité de compte — et il
  bouge. Ce qui ne bouge pas : **les compteurs de consommation ne sont pas
  lisibles par l'agent**, et la configuration se fait à la main dans le tableau
  de bord. En tirer la règle : *quand une ressource que je ne peux pas lire est
  en jeu, je demande le chiffre avant d'agir, pas après* — et retester l'accès
  plutôt que citer une note d'il y a deux semaines.
- **La région des fonctions est un réglage de projet**, pas de code. Une région
  par défaut aux États-Unis avec une base de données en Europe ajoute 1 s et
  plus par requête. Le vérifier avec `x-vercel-id` sur une vraie réponse.

### 1.10 Les prévisualisations coûtent, et ne servent pas toujours

Chaque push de branche déclenche un déploiement de prévisualisation. Si la
vérification se fait en local contre un build de production puis en CI, ces
prévisualisations ne servent à rien et consomment le quota :

```json
{ "ignoreCommand": "if [ \"$VERCEL_ENV\" = \"production\" ]; then exit 1; else exit 0; fi" }
```

**Corollaire utile** : une fois cette ligne posée, **un push de branche ne
construit plus rien**. Travailler et pousser sur une branche devient gratuit ;
seul le merge coûte.

---

## 2. Propre à Tour de Growth

*Cette section ne voyage pas — ce sont nos chiffres, à un instant donné.*

### 2.1 Chiffres de référence (2026-09-15)

| | Valeur |
|---|---|
| Fonctions physiques par déploiement | 6 |
| Poids disque par déploiement | 43,55 Mo (47,3 avant la déduplication de contenu) |
| Routes facturées | ~92 sur la fonction des pages de contenu |
| Pages de contenu au sitemap | 72 |
| Merges sur 30 jours | 154 |
| Functions Storage | ~7,29 Go sur 10 (73 %) |
| Plafond au poids actuel | ~211 merges par 30 jours |

> **72 et 92 ne se contredisent pas.** Le sitemap compte des URL indexables ;
> l'export Vercel compte des routes pour la même fonction, dont des variantes
> qu'un sitemap n'a pas à lister. Ce ne sont pas les mêmes objets, et les deux
> chiffres sont justes.

Répartition du poids : runtime Next.js 19,5 Mo (41 %), notre code 10,0 Mo
(21 %), pile gRPC Firestore 7,3 Mo (15 %), Firestore + auth + polyfills
6,8 Mo (14 %).

### 2.2 Décisions prises, à ne pas rouvrir sans raison

- **`maxDuration` NON unifié.** Fusionner la fonction Deep dive avec ses
  voisines économise **une route à 2,18 Mo sur 428,9** — 0,5 % du total
  facturé — contre un plafond de 120 s hérité par `/api/submissions`, la route
  qui crée chaque résultat. Et recopier ce plafond ferait dire au code quelque
  chose de faux : ces routes ne peuvent pas légitimement durer deux minutes.
  Réversible en dix minutes si le compteur redevient critique.
- **`ignoreCommand` étendu aux merges « doc seule » : OUI**, pas encore
  implémenté (gel jusqu'au 2026-09-26). 26 des 154 déploiements ne touchaient
  que `*.md` à la racine, `LICENSE`, `.github/`, `marketing/`, `design/`,
  `.design-sync/` ou `scripts/live/` — aucun n'entre dans le build, vérifié.
  Conception arrêtée : `VERCEL_GIT_PREVIOUS_SHA` en premier, `HEAD^` en repli,
  `exit 1` sur tout le reste. Glob racine (`*.md`), **jamais** `**/*.md`.
- **Cinq fonctions est le plancher de cette architecture.** Descendre à quatre
  demanderait de fusionner les pages de contenu (`ISR`) avec les pages
  applicatives (`Page`), donc de revenir aux deux layouts racine — ce qui
  coûterait le prérendu CDN des 72 pages de contenu. Mauvais échange.

### 2.3 Convention de cadence

Chaque merge sur `main` coûte ~43,5 Mo pendant 30 jours. Grouper les pushes
sur une branche (une vérification complète, un push) et espacer les merges
n'est pas une question de confort : c'est une contrainte chiffrée. Nous avons
fait 41 merges le 6 septembre et 27 le 14 — alors que la convention était
écrite depuis le 7.

**Avant la première vague de merges d'une session : demander la capture du
tableau de bord Vercel, en déduire un budget, s'y tenir.**
