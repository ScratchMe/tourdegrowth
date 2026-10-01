# Journal de Tour de Growth — 5. L'instrument d'audit, la distribution et les stats

*Volume archivé : les entrées du 2026-09-13 au 2026-09-14. On y trouve l'instrument d'audit (phase 0, puis les étapes 1.1 à 1.6), le compteur Vercel, le plan de distribution et sa vague 0, Fluid Active CPU, l'image de partage versionnée, les stats privées lisibles par la session, Bing.*

*Le texte est celui du journal, déplacé tel quel le 2026-10-01 : rien n'y a été réécrit. Un « plus haut » ou un « voir l'entrée du… » peut donc désigner une entrée d'un autre volume. Le volume courant et la table des volumes sont dans [`JOURNAL.md`](../../JOURNAL.md), et `grep -rn "<motif>" JOURNAL.md docs/journal/` cherche partout.*

---

### Instrument d'audit growth, phase 0 : le schéma (2026-09-13)

Suite du fil ouvert le 2026-09-12 (le « cockpit growth », recadré en instrument d'audit **personnel** après la correction d'Antoine : « pour mon usage personnel, il y a un vrai besoin, je le sais déjà ») : Antoine a répondu aux dix questions bloquantes de la « Grille d'audit growth », et la phase 0 — le schéma, la seule chose qu'on ne rattrape pas une fois figée — est livrée. **`AUDIT.md`** à la racine est la spécification : ce que ses réponses ont tranché, ce que la session a tranché seule, les règles que le code applique, et le plan. Ce qui suit est le journal, pas la spec.

**Où ça vit, et pourquoi là.** `src/lib/audit/` (schema, validate, coverage, findings, quadrants, diff, purge — tous purs) et `src/content/audit-catalog.ts` (19 lignes de socle + 20 variantes de profil, générées depuis la grille). **Navigateur seulement, zéro donnée serveur** : les chiffres sont ceux d'un employeur, et `content/legal.ts` promet qu'aucun nom d'entreprise n'entre dans Firestore. `src/__tests__/audit-boundary.test.ts` rend ça vérifiable au build — rien sous `lib/audit` n'importe Firebase, Gemini, l'analytics ou la couche submissions, et rien hors de l'instrument (et de sa future route `/admin/audit`) ne l'importe.

**Les cinq décisions irrattrapables, toutes prises** : une valeur est une série (`observations[]`) et une mission une série de passes (q8 : « une photo appelée à devenir une série ») ; le constat est un objet distinct qui référence N valeurs, avec les quatre gaps et le Decision Ledger du document de l'expert ; la prose est dans le JSON ; le catalogue est versionné et **embarqué** dans chaque mission ; chaque absence porte un coût de réparation sur une échelle fermée avec commentaire (q10).

**Trois choses trouvées par les tests, pas par la relecture** — et c'est la raison d'écrire les règles en code plutôt qu'en document :
1. **Le demi-point disparaissait.** La grille donnait ½ point à « documenté » pour une ligne « communiquée sans définition » et rien ailleurs : les trois compteurs ne se sommaient plus au dénominateur (23,5 sur 24). L'autre moitié va à « l'entreprise ne l'a pas » — et c'est la lecture honnête : le chiffre existe, personne ne peut le reconstruire.
2. **Un fichier purgé ne se rouvrait pas.** La purge retire les valeurs ; le validateur exige une valeur pour une ligne mesurée. Un drapeau `purged` sur la mission relâche exactement deux règles, et un test vérifie qu'un fichier purgé **sans** le drapeau est bien refusé — sinon le drapeau serait un contournement.
3. **Une assertion de purge trop large** : « le JSON ne contient pas "Stripe" » échouait parce que le catalogue embarqué cite Stripe dans ses fiches. Ce qui doit être propre est ce que la mission a *ajouté* au catalogue, pas le catalogue.

**Ce qui a été décidé seul, à contester** (détail en `AUDIT.md` §2) : « Diagnostic growth » sans mandat plutôt qu'« audit » (Antoine laissait le choix ; c'est le mot que le produit emploie déjà pour le Deep dive) ; relecture de dossiers par défaut pour la cause de churn (q6, qu'il n'avait pas comprise — réponse écrite dans l'artifact) ; le plafond de 8 headlines reste 8 en constante (q7, idem) ; quatre profils au lieu des trois de `SegmentModel` ; trois exceptions au « le socle s'applique partout », épinglées par un test.

**Le `TODO: à relire` revient dans `src/`**, et c'est normal : les 39 lignes du catalogue sont le texte qui s'imprimera dans ses livrables, sous son nom, et il n'a relu que les questions (convention 6). À passer au prochain bon à tirer.

**Vérifié en réel** : lint, tsc, **499 tests unitaires** (+91), couverture bien au-dessus des seuils (lignes 89,7 %), `next build`. Rien de visible dans l'app : aucune route, aucun composant — la phase 1 (la saisie, sous `/admin/audit`) est le prochain chantier.

### Vercel : le compteur qui débordait n'était pas celui que je croyais (2026-09-13)

Antoine signale que le plan Hobby « approche dangereusement » d'une limite de 10 Go, Tour de Growth y contribuant à 95 %. J'ai d'abord raisonné sur **Fast Origin Transfer** (seule ligne à 10 Go que je connaissais : les octets servis par les fonctions plutôt que par le CDN), relevé sur la production que l'image de partage du résultat est servie en `MISS` à chaque requête (73,6 Ko + un rendu Satori, une fois par vue de résultat depuis l'extension 03), et **construit le correctif** — un route handler avec un jeton de version dans l'URL, cache CDN immutable, alias des anciennes adresses, specs. Puis sa capture d'écran est arrivée : Fast Origin Transfer est à **86 Mo**. Le compteur plein est **Functions Storage : 9,24 Go sur 10** — « le stockage utilisé par les fonctions de vos déploiements ». Un problème de *stock*, pas de trafic : chaque déploiement retenu garde son bundle serveur, et la revue en a produit des dizaines. Chantier « cache CDN de l'image » abandonné avant d'être poussé ; l'approche reste décrite dans le commentaire de `ShareCard.tsx` pour le jour où le rendu coûtera vraiment.

**Mesuré plutôt que supposé** : sur un build de production local, l'union des fichiers tracés pour la fonction serveur pèse **62,3 Mo, dont 48 Mo de `sharp`** — deux builds de libvips à 18,7 Mo chacun (`@img/sharp-libvips-linux-x64` et `-linuxmusl-x64`), un wasm de 9 Mo, et les bindings. Une dépendance optionnelle que Next trace pour `next/image`, **que l'app n'a jamais utilisé** : les seules images sont des fichiers statiques, et l'image de partage est rendue par `next/og`, dont le rastériseur est resvg. Le reste est ce qu'on attend : Next 4,7 Mo, l'app 3,6 Mo, Firestore et sa pile gRPC ~4 Mo.

**Correctif** : `images: { unoptimized: true }` (l'intention : aucune route `/_next/image` à servir) et `outputFileTracingExcludes` sur `sharp` et `@img/**` (ce qui retire réellement les octets). Même build, même mesure : **14,1 Mo**, sharp absent de la trace. Puis la mesure qui compte, avec `vercel build` hors ligne (le Build Output que la plateforme stocke — l'outil accepte un `.vercel/project.json` fabriqué, jamais committé) : **un déploiement, c'est six fonctions**, et quatre d'entre elles portaient chacune les 48 Mo de sharp — **241 Mo par déploiement avant, 48 Mo après**. À 241 Mo, 9,24 Go correspondent à une quarantaine de déploiements retenus, ce qui est à peu près le nombre de merges du mois. Vérifié à l'exécution et pas seulement à la trace : `sharp` et `@img` renommés hors de `node_modules`, `next start` sur le build, pages et les deux images de partage en 200 (PNG 1200×630 valides). `src/__tests__/next-config.test.ts` épingle les deux réglages et l'absence de `next/image` sous `src/`, pour qu'un futur `next/image` soit une décision et pas 48 Mo de plus par fonction.

**Ce que le code ne peut pas faire, et qui compte davantage.** Les 9,24 Go sont le cumul des déploiements **déjà retenus** ; alléger le bundle ne réduit que les suivants. C'est dans le dashboard Vercel que ça se règle : une **politique de rétention des déploiements** (Project Settings → Deployment Retention — production, preview, annulés, en erreur) fait supprimer les anciens automatiquement, et une suppression manuelle des anciens déploiements libère l'espace tout de suite. L'outil MCP Vercel de cette session ne voit pas l'équipe d'Antoine (piège déjà documenté à l'étape 12 — **partiellement levé le 2026-09-23, voir `VERCEL.md` §1.9** : le projet est désormais listable, les déploiements restent refusés en 403), donc c'est une action à lui.

**Leçon de méthode, la même que d'habitude** : j'avais une hypothèse cohérente, une mesure qui la confortait (`x-vercel-cache: MISS` sur l'image) et un correctif prêt — et le compteur n'était pas celui-là. Une capture du tableau de bord aurait dû être la première chose demandée, pas la première chose reçue par hasard. Quand une limite est nommée par son montant, demander **le libellé exact** avant de raisonner.

### Le reste du poids des fonctions, mesuré ligne par ligne (2026-09-13)

Antoine a envoyé la liste des fonctions après déploiement — **3,9 Mo chacune contre 20 Mo avant**, le correctif sharp a donc bien porté — et demandé si on pouvait faire mieux sans rien dégrader. Ventilation par fonction et par paquet sur le Build Output réel :

| Fonction | Avant | Ce qu'elle porte |
|---|---|---|
| `r/[id]/opengraph-image` | 12,2 Mo | next/og 3,2 · Firestore 1,6 · Next 1,7 · app 1,5 · gRPC/gax/auth 2,2 |
| `admin/stats` (groupe `(app)`) | 12,0 Mo | idem |
| `api/submissions/[id]/deep-dive` | 8,7 Mo | Firestore et sa pile, pas d'og — déjà propre |
| `[locale]/about` (toutes les pages de contenu) | 7,0 Mo | **next/og 3,2** · Next 1,5 · app 2,1 — aucun Firestore, déjà propre |
| `[locale]/…/opengraph-image` | 6,7 Mo | next/og 3,2 · Next 1,7 · app 1,6 |
| `_middleware` | 1,8 Mo | le proxy |

**Un seul levier sûr, pris** : `@vercel/og` embarque **deux** rendus, Node et Edge, et Next trace les deux dans toute fonction qui peut l'atteindre. Rien ici ne tourne en Edge (un test l'affirme désormais, c'est ce qui rend l'exclusion valide), donc `index.edge.js` est 734 Ko morts dans quatre fonctions sur six. **48,4 → 45,5 Mo par déploiement.** Vérifié en exécution et pas seulement à la trace : fichier déplacé hors de `node_modules`, build servi, toutes les pages et les **quatre** images de partage répondent en PNG 1200×630 valide.

**Le gros morceau n'est pas prenable, et la tentative mérite d'être consignée.** Les 3,2 Mo restants de satori+resvg sont dans deux fonctions qui ne rendent aucune image — parce que Turbopack place `@vercel/og` dans un chunk que chaque page partage avec l'`opengraph-image` de son propre segment. L'exclure par route a échoué pour une raison qui ne se devine pas : **les clés de `outputFileTracingExcludes` sont des globs**, donc `[id]` et `[locale]` se lisent comme des classes de caractères et non comme des segments littéraux. Ma première tentative a retiré satori de **toutes** les fonctions, images comprises — un build vert de bout en bout qui aurait livré des aperçus de liens cassés en production. Échapper les crochets n'a pas corrigé le tir non plus.

Ce qui l'a attrapé n'est pas un test mais la mesure du Build Output après coup : les deux fonctions d'image étaient passées à `@vercel/og: 0,00 Mo`. **Aucun test du repo ne peut voir ça** — `next build` et les 181 specs passent, parce qu'elles tournent contre `next start`, qui lit `node_modules` et se moque du tracing. Un changement de `outputFileTracingExcludes` se vérifie sur le Build Output, jamais sur la suite.

**Ce qui reste est incompressible ou trop risqué pour le gain** : Firestore et sa pile gRPC (4,2 Mo) sont là où il faut et absents des pages de contenu ; le runtime Next (1,3-1,7 Mo) n'est pas négociable ; les cinq polices TTF des images (279 Ko) voyagent dans le même chunk partagé que satori, donc mêmes limites.

### Le plan de l'instrument d'audit, mis au propre et versionné (2026-09-13)

Demande d'Antoine : « le plan avec les différentes phases — mets-le au propre
et sauvegarde-le dans le dépôt, il ne faut pas qu'on le perde ». Jusqu'ici il
n'existait qu'en deux endroits fragiles : la réponse au document de l'expert
dans une conversation (2026-09-12) et le tableau de cinq lignes du §7
d'`AUDIT.md`. **`AUDIT-PLAN.md`** à la racine est maintenant la référence :
la table des phases avec déclencheur et critère de sortie, les six principes
qui ordonnent le plan, la phase 1 découpée en **six PR** avec pour chacune ce
qu'elle livre, ses tests et ce qui permet de la dire finie, la phase 1 bis
(la mission AB Tasty, jour par jour), la phase 2 en neuf étapes, le
Go/No-Go à cinq entrées dont une qui ferme la branche seule, la liste
explicite de ce qu'on ne fait à aucune phase, et les risques. Les trois
documents ne se recouvrent pas : `AUDIT.md` dit ce que c'est, `AUDIT-PLAN.md`
dans quel ordre on le construit, ce fichier-ci ce qui a été livré.

**Sept décisions prises en écrivant le plan, listées pour être contestées
en une phrase** (`AUDIT-PLAN.md` §3.3) — dont deux qui valent d'être notées
ici parce qu'elles découlent de faits vérifiés dans le code plutôt que de
préférences : le design system n'a **aucun `<input>`** (`TextArea` se décrit
comme « the system's only text input »), donc les primitives de formulaire de
la saisie seront locales à la route et jamais synchronisées vers Claude
Design ; et `lib/audit` tire aujourd'hui **le catalogue et `copy-library`**
par des imports de valeur (`schema.ts#snapshotCatalog`,
`validate.ts#AUDIT_PROFILE_MODELS`, `quadrants.ts` via `computeScore`) — un
îlot client qui l'importerait tel quel embarquerait 65 Ko de texte que la
garde « aucun Client Component n'importe le catalogue » ne verrait pas,
parce qu'elle ne regarde que les imports directs. La première PR de la phase
1 est donc un découplage sans écran, avec une marche transitive ajoutée à la
garde.

**Deux chiffres mesurés pour le plan plutôt que supposés** : le dénominateur
par profil (25 lignes en B2B assisté, 24 en self-serve, 19 en B2C, 22 en
marketplace) et la répartition des formes de valeur (10 scalaires, 12
couples, 9 distributions, 2 matrices, 2 qualitatives, 4 composites) — c'est
ce qui a permis de décider que quatre éditeurs suffisent pour six formes.

**Deux règles d'ordre qui ne se négocient pas** : pas de readout avant une
mission réelle (la phase 1 bis existe pour ça), et pas de livrable imprimé
avant le bon à tirer nº4 — la saisie peut afficher les 39 lignes, le readout
ne peut pas les imprimer.

### Faire connaître Tour de Growth sans LinkedIn et sans nom : le plan (2026-09-13)

Demande d'Antoine : un plan pour faire connaître le site, avec deux
contraintes — **pas LinkedIn**, et **il n'est jamais nommé** — et, si
possible, des actions que la session mène seule. **`GROWTH-PLAN.md`** à la
racine remplace le « Growth Plan » du 2026-08-29 (artifact), dont les trois
leviers les plus forts (post LinkedIn natif, messages directs au réseau,
Product Hunt en maker) tombent sous ces contraintes.

**Ce que la recherche a établi avant d'écrire**, plutôt que supposé :
Product Hunt exige un vrai nom sur les comptes personnels (centre d'aide) ;
r/SaaS limite l'autopromotion à une fois par 60 jours depuis avril 2026 et
compte les comptes alternatifs comme un seul acteur ; r/startups ne
l'accepte que dans ses fils hebdomadaires ; r/SideProject et
r/roastmystartup l'attendent — et le second est bâti sur exactement le
format du mode roast. Deux SERP sont vides de tout outil (« diagnostic
croissance startup gratuit questionnaire AARRR », « growth audit
template ») : ce sont les deux premières pages de contenu du plan. Le dépôt
GitHub a **1 étoile, aucune description, aucun topic et une homepage
périmée** (`tourdegrowth.vercel.app`) — un canal anonyme par construction,
laissé vide. Le Grand Départ 2027 est le vendredi 2 juillet (R2-30).

**Ce qui n'a pas pu être mesuré d'ici** : la Search Console (SEO Gets répond
« abonnement requis »), donc la ligne de départ SEO reste celle de la revue
02 (1 clic, ~50 impressions) ; et `/admin/stats` (mot de passe dans Vercel).
Le plan commence par les faire relever.

**La question que le plan pose avant tout** : le site, lui, nomme Antoine
en sept endroits (pied de page, crédit du score, carte Deep dive, `/about`,
pages légales, JSON-LD, README). Deux lectures — A : promotion anonyme,
site signé (hypothèse retenue) ; B : site anonymisé aussi (une PR, et la
LCEN art. 6 III 2 permet à un éditeur non professionnel de ne publier que
son hébergeur). À trancher avant la première vague.

**Le plan en cinq vagues** : fondations (IndexNow, UTM refaits sans
`linkedin`, kit de soumission, comptes de marque `tourdegrowth` créés avec
`contact@tourdegrowth.com`, textes) ; lancement anonyme un seul jour (Show
HN + Reddit + Indie Hackers + 15 annuaires) ; SEO qui compose (deux pages
« porte ouverte », dix termes de glossaire, un cluster « AARRR vs X », le
benchmark des pratiques à 50 soumissions) ; boucle produit (badge SVG
embarquable, partage natif avec image, échantillon roast canonique) ;
seeding sans visage (newsletters depuis `contact@`, listes awesome si le
profil GitHub n'affiche pas le nom). Payant seulement sur un signal, mesuré
par UTM sans pixel — donc sans bandeau de consentement. Le §5 sépare ce que
la session mène seule (le code, le contenu, les textes, le kit) de ce qui
demande un clic (comptes, posts sous pseudo, mails de vérification) et de
ce qu'elle ne fera pas (créer des comptes, poster à sa place — un compte
piloté par un agent est le motif de bannissement le plus courant).

### Vague 0 du plan de distribution : IndexNow et le vocabulaire UTM (2026-09-13)

Première PR autonome de `GROWTH-PLAN.md` (items 0.3 et 0.4), lancée sur le
« point bonus » d'Antoine. Le même jour il a tranché **l'option A** : le site
garde son nom, la promotion ne le porte jamais — inscrit dans le plan.

**IndexNow.** Un fichier de clé sous `public/` et
`.github/workflows/indexnow.yml` : chaque matin (et à la main via
`workflow_dispatch`), le workflow lit la clé **depuis le checkout** (une seule
source de vérité, jamais recopiée dans le YAML), vérifie que le site sert bien
`<clé>.txt` — sinon la soumission serait acceptée puis ignorée en silence par
les moteurs —, extrait les `<loc>` du vrai `sitemap.xml` et les envoie à
`api.indexnow.org` (Bing, Yandex, Naver, Seznam en une requête ; Google ne lit
pas IndexNow, le sitemap suffit pour lui). **Aucun secret, à dessein** : une
clé IndexNow est publique par construction, la preuve de propriété est le
fichier servi. `src/__tests__/indexnow.test.ts` tient le contrat entre les deux
fichiers (exactement une clé, contenu = nom, pas de clé recopiée dans le
workflow, `contents: read`, action épinglée par SHA comme `verify-live.yml`).

**UTM.** Le vocabulaire quitte `scripts/utm-link.mjs` pour
`scripts/utm-channels.mjs`, importable par un test : la CLI n'est plus que
la ligne de commande autour. `src/__tests__/utm-channels.test.ts` refuse tout
canal que le plan exclut (`linkedin`, `podcast`, `press`, `network_dm`) dans
les clés, les sources et les familles — c'est là que la contrainte est
appliquée, pas dans un document. Deux familles ouvertes, `directory:<slug>` et
`newsletter:<slug>`, donnent une ligne GoatCounter par annuaire ou newsletter
sans les lister d'avance ; l'hôte par défaut passe sur `www` (l'apex 308 vers
`www` en gardant la query, mais autant coller le lien canonique).

**Vérifié en réel** : 517 tests (+13), lint (0 erreur), `tsc`, la CLI (liens
générés, `linkedin` refusé en exit 1), le YAML parsé, et les étapes shell du
workflow rejouées localement contre le vrai sitemap : 42 URL extraites, corps
JSON conforme au protocole. Le fichier de clé répond 404 tant que la PR n'est
pas déployée — **le premier envoi réel se déclenche à la main après le merge**,
et son log dit si Bing a répondu 200/202.

**Piège rencontré** : `git push --force-with-lease` a échoué sur la branche de
travail parce que la branche distante avait été **supprimée automatiquement**
après le merge précédent (réglage GitHub d'Antoine) alors que la référence de
suivi locale la croyait encore là. `git fetch --prune` avant de pousser.

### Vague 0, suite : le kit de soumission et les textes de lancement (2026-09-13)

Items 0.5 et 0.7 de `GROWTH-PLAN.md`, livrés dans **`marketing/`** — hors de
`src/`, rien ne l'importe : `README.md` (les trois règles : jamais le nom,
jamais un lien nu, rien sans relecture), `kit.md` (identité, tagline,
descriptions 140/300/800 × FR/EN, faits avançables et faits à ne pas
avancer, liens déjà tagués, table des annuaires), `launch/` (Show HN avec la
FAQ des dix objections, un post par subreddit sous ses règles, Indie Hackers
en « build log », le fil X/Bluesky), et 22 PNG dans `assets/`. **Aucun
texte ne nomme l'auteur** — vérifié par `grep`, et la seule mention (« the
site credits its author in the footer ») est la réponse prévue à « who's
behind this? » sous l'option A, signalée à Antoine dans le fichier.

**Le premier envoi IndexNow réel est passé** : run nº1 du workflow, déclenché
à la main une fois le fichier de clé servi (20 s après le merge, `HIT`
CDN) — « Submitting 42 URLs », **HTTP 202** de `api.indexnow.org`. La
vérification préalable de la clé a donc bien joué son rôle dans l'ordre
prévu.

**Les annuaires ont été vérifiés en ouvrant leurs pages**, pas listés de
mémoire, et ça change l'ordre du plan : Launching Next est le seul formulaire
**sans compte** (nom, URL, titre 5-8 mots, description ≤ 2 500 caractères,
5-10 tags, un nom et un e-mail de soumetteur — « Tour de Growth »,
`contact@`) ; Uneed aspire la page puis demande une inscription ; Fazier
**exige un backlink** sur son plan gratuit ; BetaList demande un compte X ou
un lien magique ; Futurepedia est payant (247 $ épuisé, 497 $) → écarté ;
Peerlist est un réseau de personnes → écarté ; SaaSHub et There's An AI For
That refusent les robots (403) → à vérifier à la main.

**Piège d'environnement, nouveau** : depuis ce bac à sable, **Chromium ne
traverse pas le proxy sortant** — `page.goto` sur le site en production
meurt en `ERR_CONNECTION_RESET`, et le statut du proxy montre le tunnel
fermé en cours d'échange après 6 s (1,7 Ko envoyés, 39 octets reçus), même
avec l'option `proxy` de Playwright ; `curl` passe. Les captures se font donc
contre un build de production local, ce qui est de toute façon la méthode du
repo ; `scripts/kit-screenshots.mjs` la fixe (seed des 15 réponses en
`localStorage` pour atteindre le sélecteur de ton **via l'écran de
segmentation**, que le premier essai avait pris pour le sélecteur — leçon du
brief 03 : deux fichiers de même taille sont la même image, et un écran
photographié se relit avant d'être nommé).

**Optimisation des PNG sans dépendance nouvelle** : `sharp` est déjà dans
`node_modules` (tiré par Next — c'est celui qu'on a sorti du bundle de
fonction, pas du dépôt) ; un réencodage en palette fait passer les 22
captures de 7,4 à 2,4 Mo sans perte visible sur une UI à aplats.

**Deux surprises dans la copie du produit, vues en photographiant** : le
sélecteur de ton n'est plus l'écran qui suit la 15ᵉ question — l'écran de
segmentation (R2-26) s'intercale ; et la carte d'aperçu roast dit
« Retention is freewheeling » / « roule en roue libre », qui est une bonne
ligne à citer dans les posts.

### Fluid Active CPU : ce qu'une vue de la homepage coûtait en fonctions (2026-09-14)

La rétention Vercel posée par Antoine a vidé le Functions Storage (397 Mo).
Le compteur le plus proche de sa limite est devenu **Fluid Active CPU**
(36 min 46 s sur 4 h par mois, 15 %), avec une hausse ×4-5 la veille, et
Antoine a joint un export HAR d'un chargement de la homepage. Le chiffre est
petit parce que le trafic l'est ; c'est le coût **par visite** qu'il fallait
réduire, avant le lancement.

**Ce que le HAR montre.** Une seule vue de la homepage, c'est la 308 du
proxy, la page en `HIT` CDN, puis la machinerie de préchargement de
`next/link` : quatorze préchargements de pages de contenu (tous `HIT`,
donc gratuits) et **six rendus dynamiques** dans `iad1` — `/quiz`,
`/r/sample` et `/r/<dernier résultat de l'appareil>`, chacun **deux fois**
(un préchargement `/_tree` du cache de segments, puis un « metadata-only »),
tous en `MISS`, entre 190 ms et 1,3 s chacun. Avant que quiconque ait
cliqué. Et ces six réponses ne pouvaient **jamais servir** : depuis R-24 les
pages de contenu et les routes applicatives ont deux layouts racine, donc la
navigation est un chargement complet du document quoi qu'il arrive. Next ne
l'apprend qu'en lisant l'arbre de route qu'il vient de télécharger
(`ppr-navigations.js`, `isNavigatingToNewRootLayout`) : il précharge, puis
retélécharge au clic, puis recharge la page.

**Mesuré, pas supposé** — build de production local, CPU de tout l'arbre de
processus lu dans `/proc/<pid>/stat` (piège : le parent `next start` affiche
0 ms, c'est le worker enfant qui rend ; sommer l'arbre) :

| Requête | 1ʳᵉ fois (instance froide) | à chaud |
|---|---|---|
| Démarrage du runtime, avant toute requête | 510 ms | — |
| `/quiz` en RSC (le préchargement) | 210 ms | 40 ms |
| `/r/sample` en RSC | 340 ms | 40 ms |
| Image de partage d'un résultat (Satori) | 530 ms | ~185 ms |
| Page de contenu prérendue | 20 ms | 0 |
| Le proxy seul (la 308) | sous le tick de 10 ms | — |

À trafic quasi nul, chaque visite paie donc une fonction applicative froide
que la landing réveillait pour rien. Le rendu de la landing elle-même ne
coûte rien : elle est servie par le CDN.

**Le correctif.** `Button` gagne un prop `hard` (rend un `<a>` nu au lieu
de `next/link`), posé sur les sept CTA des pages de contenu vers `/quiz` et
`/r/sample` ; les deux liens de `LastResult` deviennent des `<a>`. Même
précédent que le sélecteur de langue de R-13. Les liens **dans** un même
arbre gardent `Link` : `/r/<id>` → `/quiz?ref=` est une navigation client,
et son préchargement est ce qui rend ce clic instantané.

**Ce qui tient la règle** : `src/__tests__/cross-root-links.test.ts`
(garde statique : tout `Button` du dossier `[locale]` vers une route
applicative est `hard`, aucun `Link` n'y pointe, avec un plancher de sept
liens trouvés pour qu'une dérive de motif ne passe pas en ne trouvant
rien) et `e2e/cross-root-links.spec.ts` (4 specs qui enregistrent **toutes**
les requêtes du navigateur, chaque lien amené dans le viewport et le CTA
survolé — et qui prouvent d'abord que le préchargement tourne, en
constatant celui d'une page de contenu, avant d'affirmer qu'aucune route
applicative n'a été touchée). Non-vacuité : correctif retiré, **les 4
specs tombent** en listant exactement les six requêtes du HAR, et 2 des 3
tests de la garde tombent (le plancher passe dans les deux états, c'est une
assertion compagne).

**Piège de spec** : la première version attendait `networkidle` après le
défilement ; dans la suite complète en parallèle elle a expiré une fois à
30 s (le serveur `next start` est partagé par les workers). Playwright
déconseille lui-même `networkidle`. Remplacé par l'attente du signal
positif (la requête de préchargement d'une page de contenu) et une
attente bornée de 500 ms après le survol, puisqu'un `<a>` nu n'émet rien
qu'on puisse attendre. Rejouée trois fois en isolation et une fois dans la
suite complète : **185 specs vertes**.

**Piège de lint** : `@next/next/no-html-link-for-pages` se déclenche sur
un `<a href="/quiz">` littéral et réclame `next/link` — précisément ce
qu'on ne veut pas ici. Désactivé sur cette seule ligne, avec la raison.

**Pas couvert, volontairement** : les liens dans l'autre sens (app →
contenu : `WordmarkLink`, la nav des en-têtes, le pied de page sur `/r/<id>`)
préchargent des pages statiques en `HIT` CDN, donc ~0 CPU ; laissés. Et
l'image de partage, ~185 ms par vue de résultat : c'est la PR suivante.

**Sur le ×4-5 de la veille** : pas démontrable d'ici (pas de ventilation par
fonction sur le plan Hobby). Deux candidats plausibles, tous deux de mon
fait : cinq déploiements de production le même jour (chacun recycle toutes
les instances, donc les visites suivantes repaient un démarrage à froid),
et le premier envoi IndexNow, qui amène des robots qui **rendent** les
pages (Bing le fait) et déclenchent donc les mêmes préchargements. Quelle
que soit la cause, c'est le coût par visite qui était réductible.

**Signalé, pas corrigé (pas du CPU)** : les fonctions tournent dans `iad1`
(Washington) alors que Firestore est en `eur3` et les lecteurs en Europe —
c'est ce qui donne 1 à 1,3 s à ces requêtes dans le HAR. C'est un réglage
de projet Vercel (Function Region), à faire par Antoine ; `cdg1` ou `fra1`.

### L'image de partage a une adresse versionnée, et le CDN la garde (2026-09-14)

Seconde moitié du chantier Fluid Active CPU. Depuis l'extension 03 la page
de résultat affiche sa propre image de partage, donc **chaque vue d'un
résultat était un rendu Satori** — la chose la plus chère que l'app fait par
requête (185 ms de CPU à chaud, 530 ms sur une instance froide, mesuré le
matin même) — sur une adresse en `max-age=0, must-revalidate` sans ETag.
Y compris `/r/sample`, lié depuis la landing, dont l'image est la même pour
tout le monde. Un `s-maxage` seul avait été essayé et annulé le 2026-09-10 :
le propriétaire qui venait de finir son Deep dive gardait l'ancien badge, et
une route de métadonnées n'étant pas ISR, rien ne pouvait la purger.

**Le mécanisme : un jeton dans l'adresse, pas une durée sur l'adresse.**
`lib/og/share-image.ts` calcule un jeton (SHA-256 sur une constante de
version, le modèle de l'image et **la copie résolue**, 12 hex) ; l'adresse
`/r/<id>/share/<jeton>.png` change donc exactement quand l'image changerait
— un Deep dive terminé, un changement de texte — et jamais autrement. Le
jeton courant est servi `immutable` un an, navigateur et CDN ; tout autre
jeton (le `legacy` vers lequel les deux anciennes adresses sont réécrites,
ou un jeton périmé scrapé avant un Deep dive) rend l'image **courante**
cachée une heure, parce qu'un partage déjà scrapé doit continuer à
prévisualiser (SPEC.md §12) mais que son contenu peut encore bouger ; un
segment qui n'est pas un jeton est un 404.

**Ce que ça a coûté en structure.** La convention `opengraph-image.tsx`
possède son URL et ses en-têtes, sans moyen de changer l'un ou l'autre :
l'image devient un route handler (`/r/[id]/share/[token]`), le gabarit part
tel quel dans `lib/og/result-frame.tsx`, et `og:image`/`twitter:image` sont
déclarés en config dans `generateMetadata`. L'image de la page et le lien
« Enregistrer » utilisent la même adresse : un rendu, une entrée de cache.

Deux choix à connaître :
- **La copie fait partie du hash.** Sans ça, corriger un mot de l'image
  aurait laissé l'ancienne version en cache un an sur toutes les adresses
  déjà servies, et personne n'aurait pensé à incrémenter
  `SHARE_IMAGE_VERSION`. Cette constante reste pour le cas que le hash ne
  voit pas : un changement du gabarit lui-même (mise en page, polices,
  couleurs).
- **Le modèle passe par `toPillarViews`** avant d'être haché (R2-24) : un
  jeton qui varierait avec `rawPoints` les ferait fuir par l'adresse.

**Vérifié en réel** sur le build : jeton courant en
`public, max-age=31536000, s-maxage=31536000, immutable` ; les deux anciennes
adresses (`/opengraph-image`, `/opengraph-image-1u74ed?…`) et un jeton
périmé en `s-maxage=3600` ; quatre formes de non-jeton en 404 ; l'image
rendue par la nouvelle route est **identique octet pour octet** à celle de
l'ancienne, et relue à l'écran. 528 tests unitaires (+8), **186 specs
Playwright** (+1), lint/tsc/build propres. Non-vacuité : en remplaçant
l'en-tête immutable par l'en-tête bref, seule la spec « cacheable » tombe.

**Ce que ça ne change pas, dit franchement** : le proxy tourne toujours
avant le cache sur chaque requête (Vercel exécute le middleware avant de
consulter son cache), à ~2 ms l'appel ; et le cache de réponses de fonction
de Vercel est **vidé à chaque déploiement**, donc la première vue de chaque
résultat après un merge repaie un rendu. À trafic réel, c'est exactement le
comportement voulu ; à cinq merges par jour, c'est un argument de plus pour
grouper.

**Confirmé en production le jour même** : `x-vercel-cache: MISS` au premier
appel de l'adresse déclarée par `/r/sample`, `HIT` aux suivants, en
`max-age=31536000, immutable` ; les anciennes adresses répondent, cachées
une heure. Reste à voir de visu un aperçu LinkedIn/X sur un lien partagé
avant ce changement.

### Les stats privées, lisibles par la session sans qu'un secret entre dans la conversation (2026-09-14)

Deux questions d'Antoine le même après-midi : « qu'est-ce que tu veux
exactement de la Search Console ? » et « on ne peut pas faire en sorte que
tu lises `/admin/stats` par toi-même ? ». La réponse aux deux est la même
mécanique, et elle a un piège qu'il faut nommer d'abord : **le dépôt est
public, donc les logs et les artefacts d'un workflow GitHub sont lisibles
par n'importe qui.** Imprimer `/admin/stats` dans un log défait exactement
la protection posée sur cette page le 2026-08-29.

**Le mécanisme.** `.github/workflows/stats.yml`, `workflow_dispatch`
seulement, lit le tableau de bord avec `ADMIN_DASHBOARD_PASSWORD` et la
Search Console avec `GSC_SERVICE_ACCOUNT_JSON` (deux secrets GitHub, un
compte de service ajouté comme utilisateur **restreint** de la propriété),
puis **chiffre le rapport avec `age`** vers une clé publique éphémère passée
en input du déclenchement. Seul le texte chiffré atteint le log. Côté
session : `age-keygen` dans le scratchpad, déclenchement par l'API GitHub
avec la clé publique en `recipient`, lecture du log de la job,
`scripts/stats-decrypt.sh` avec la clé privée que personne n'a stockée. Une
nouvelle session régénère la sienne. Même principe que `verify-live.yml`
(les clés restent où elles sont) et mêmes règles : jamais `pull_request`,
`contents: read`, actions épinglées par SHA, plus `age` v1.2.1 téléchargé
depuis sa release et vérifié par `sha256sum`.

- **`/admin/stats/json`** : la vue JSON du tableau de bord, derrière la même
  Basic Auth du proxy (`startsWith("/admin")`), `no-store`, code d'erreur
  `STATS_FAILED` (contrat R-04). La page HTML et la route lisent le même
  `lib/submissions/dashboard.ts#loadDashboard()`, pour qu'un chiffre ne
  puisse pas être calculé différemment aux deux endroits.
- **`scripts/gsc-report.mjs`** : JWT RS256 signé en `node:crypto`, échange
  au token endpoint, `sites.list` (propriété `sc-domain:` préférée, sinon
  la première contenant « tourdegrowth », sinon `GSC_SITE`), puis
  `searchAnalytics.query` : totaux, 250 requêtes et 100 pages sur 28 et
  90 jours, 250 couples requête × page sur 90 jours, `dataState: final`,
  fenêtres qui s'arrêtent trois jours avant aujourd'hui (le retard des
  données finales). C'est ce qu'il faut pour choisir les termes de la vague 2
  (requêtes déjà en position 10-50) et mesurer un lancement.
- **Le test de contrat** (`stats-workflow.test.ts`) tient la partie qui
  rend le log public inoffensif : déclenchement manuel seul, lecture seule,
  SHA sur les actions, regex du `recipient`, checksum d'`age`, et **aucune
  ligne qui référence `report/admin.json` ou `report/gsc.json` en dehors des
  trois formes autorisées** (écriture par `curl -o`, redirection, `wc -c <`).
  Non-vacuité mesurée : un `cat` du clair, la suppression de l'étape `age -r`
  et l'ajout d'un déclencheur `pull_request` font chacun tomber le test.

**Vérifié en réel** : `tsc`, `eslint`, 543 tests unitaires (+13), seuils de
couverture, `next build` (`ƒ /admin/stats/json`), sur un serveur avec un mot
de passe de test : 401 sans identifiants, 401 avec le mauvais, 502
`STATS_FAILED` avec le bon (pas de Firestore ici), et **l'aller-retour de
chiffrement en local** : clé éphémère, faux rapport, `age -r`, faux log avec
le préfixe horodaté de l'API GitHub, `stats-decrypt.sh` rend les deux
fichiers intacts. La signature JWT est vérifiée dans le test avec la clé
publique d'une paire générée sur place ; l'appel réel à Google, lui, ne peut
se voir qu'au premier run.

**Piège de session, à connaître** : le garde-fou du mode auto a refusé
toute commande shell dès que ce workflow a été conçu (des secrets, un
chiffrement, un log), en disant explicitement que c'était le contenu de la
conversation et non l'action, et qu'il continuerait. Antoine a sorti la
session du mode auto pour finir. Un travail qui manipule des secrets se
fait donc hors mode auto dès le départ.

### Premier run réel du workflow de stats : le circuit tient, la Search Console attend une API (2026-09-14)

Antoine a posé les deux secrets et ajouté le compte de service à la Search
Console ; deux runs dans le quart d'heure qui a suivi (nº1 `both`, nº2
`admin`).

**Le circuit fonctionne de bout en bout.** La clé éphémère générée dans le
scratchpad de la session, le rapport chiffré par le runner vers cette clé,
le log relu par l'API GitHub, `stats-decrypt.sh` qui rend `admin.json`
intact — rien de tout ça n'avait été exercé contre la vraie chaîne avant.
**La moitié tableau de bord est donc lisible par la session**, et c'est ce
qui donne la ligne de départ du plan de distribution (item 0.1).

**Les chiffres eux-mêmes ne sont pas écrits ici, et ne doivent pas l'être.**
Le dépôt est public ; ce workflow existe précisément pour que le contenu de
`/admin/stats` n'apparaisse pas dans un log public, et le recopier dans ce
fichier défait le même mot de passe par un autre chemin. La ligne de départ
n'a pas besoin d'être figée pour être comparable : chaque soumission porte
son `createdAt` et GoatCounter garde son historique, donc « avant le
lancement » se recalcule à volonté à partir de la **date**. Ce qui se dit
sans rien révéler : l'ordre de grandeur est celui d'un site que personne n'a
encore trouvé, et tout ce qui entre dans le ratio « actions de valeur par
résultat » (A4) existe déjà en base, à un chiffre — la mesure est prête, il
manque le trafic.

**Deux choses apprises par le run, pas par la relecture :**
1. **Un 404 transitoire de GoatCounter.** Au run nº1, la fenêtre « All-time »
   du funnel est revenue en `GoatCounter API returned 404` pendant que
   « Last 30 days », même requête à un paramètre près, répondait. Avant de
   toucher au code, la source de GoatCounter a été lue (le handler `hits`
   n'a aucune règle de plage qui produise un 404 ; `zhttp` ne mappe en 404
   qu'un `sql.ErrNoRows`, qu'aucune lecture de ce chemin ne lève) et le run
   nº2, cinq minutes plus tard, a rendu les deux fenêtres — **identiques**,
   puisque tout l'historique GoatCounter du site tient dans les 30 derniers
   jours. Rien à corriger ; en cas de récidive, relancer avant d'enquêter.
2. **La Search Console répond 403 sur `sites.list`**, alors que l'échange de
   jeton a réussi (sinon l'erreur aurait nommé cette étape). Ce n'est pas le
   compte de service qui manque à la propriété — dans ce cas Google renvoie
   200 avec une liste vide, et `pickSite` l'aurait dit. Un 403 sur la
   première lecture est ce que produit une **API non activée sur le projet
   Cloud** qui porte le compte de service (`accessNotConfigured`). Le script
   n'imprimait que le statut ; il imprime maintenant le `reason` et le
   message de Google (`describeFailure`, tronqués à 300 caractères, deux
   formes de corps — jeton et API), pour que le prochain run le dise
   lui-même au lieu de laisser deviner.

**Action côté Antoine** : activer « Google Search Console API » sur le projet
Google Cloud où le compte de service a été créé (console Cloud → API et
services → Bibliothèque), puis relancer le workflow en `gsc` — c'est le seul
pas restant pour la moitié Search Console.

**Fait dans l'heure (run nº3, `gsc`).** Le diagnostic était le bon : une
fois l'API activée, `sites.list` a rendu la propriété de domaine
`sc-domain:tourdegrowth.com` et le rapport entier est revenu en deux
secondes. **Les deux moitiés du workflow sont donc opérationnelles**, et une
session peut lire à la demande le tableau de bord, la Search Console, ou
les deux.

Ce que la Search Console dit, en agrégat (les requêtes une à une restent
dans la conversation) : sur 28 jours à fin de données finales (15/08 →
11/09), **86 impressions, 1 clic, position moyenne 76** — et la fenêtre de
90 jours donne exactement la même chose, parce que l'historique indexé du
site est plus jeune que 28 jours. Deux faits à retenir plutôt que les
chiffres eux-mêmes :
- **Google crédite encore les anciennes adresses.** Toutes les impressions
  anglaises portent sur `/glossary/<terme>` **sans préfixe** — les URL
  d'avant R-13, qui répondent 308 vers `/en/glossary/<terme>` depuis le
  2026-09-05 — et pas une seule URL `/en/…` n'apparaît. Les URL `/fr/…`, qui
  n'ont jamais existé sous une autre forme, sont bien là. Rien à corriger
  (308, canonical et hreflang sont en place) ; c'est le délai de recrawl.
  **À surveiller au prochain run** : `/en/glossary/*` doit finir par
  remplacer `/glossary/*` dans la liste des pages. S'il ne le fait pas en
  quelques semaines, c'est un sujet.
- **Les pages longues du glossaire (2026-09-06) ne sont pas encore dans la
  mesure** : la fenêtre s'arrête au 11/09 et Google a recrawlé après. Leur
  effet, s'il y en a un, se lira au run suivant, pas à celui-ci.

**Vérifié en réel** : deux runs du workflow contre la production, deux
déchiffrements ; lint, tsc, 547 tests unitaires (+4 : le 403 de `sites.list`
avec un corps à la forme de Google, les deux formes de corps d'erreur, la
troncature).

### Instrument d'audit, étape 1.1 : découpler avant de construire (2026-09-14)

Première PR de la phase 1 (`AUDIT-PLAN.md` §3.4). **Aucun écran** : elle
existe pour que le premier écran soit possible sans casser la règle « le
serveur résout, le client reçoit des props ».

**Le problème, chiffré.** `schema.ts#snapshotCatalog` lisait `AUDIT_CATALOG`
(39 lignes de prose française), `validate.ts` lisait `AUDIT_PROFILE_MODELS`
dans le même module, et `quadrants.ts` lisait `QUESTIONS` de
`copy-library.ts`. Un îlot qui aurait importé `lib/audit` tel quel embarquait
les deux dans son bundle — et la garde « aucun Client Component n'importe le
catalogue » ne regardait que les **imports directs**, donc ne l'aurait pas
vu. C'est exactement R2-14, où trois chemins distincts ramenaient le
dictionnaire après qu'on l'avait sorti.

**Écart assumé par rapport au plan, et pourquoi.** `AUDIT-PLAN.md` demandait
`computeScoreFrom(answers, questions)` **dans `score.ts`**. L'y mettre
n'aurait rien changé : `score.ts` importe `QUESTIONS` au niveau du module,
donc quiconque importe la formule tire aussi la bibliothèque de copie — le
but de l'étape était manqué. La formule et ses types partent donc dans
`lib/scoring/compute.ts`, qui n'importe que `./pillars` ; `score.ts` la
réexporte et n'ajoute que `computeScore`, l'appel avec les 15 vraies
questions. **Aucun importeur existant ne change, et les 42 tests du moteur
passent sans qu'une ligne de test soit touchée** — c'était le critère.

**Le reste du découplage** : `AUDIT_PROFILE_MODELS` et son type déménagent
dans `lib/audit/profiles.ts`, un module qui n'importe rien (le catalogue les
réexporte pour rester le point d'entrée côté contenu) ; `snapshotCatalog()`
et un nouveau `tourQuestions()` partent dans `lib/audit/server.ts`, le SEUL
module de l'instrument qui lit du contenu ; `newMission` reçoit le catalogue
en paramètre ; `quadrants.ts` reçoit les questions en paramètre.
`lib/audit` n'importe plus du catalogue que des **types**, effacés à la
compilation.

**Deux modules neufs.** `storage.ts` (navigateur seulement, une seule clé
`tdg.audit.v1`, un tableau de missions) : **une écriture qui échoue est
RENVOYÉE, jamais avalée** — différence assumée avec `quiz/storage.ts`, où
perdre des réponses coûte trois minutes alors qu'ici perdre la saisie coûte
des heures d'entretiens ; le message d'un quota plein nomme la seule sortie,
exporter le fichier. `io.ts` (pur) : `serializeMission` indente **et trie les
clés** — sans ça, deux exports de la même mission diffèrent sur l'ordre
d'insertion des propriétés et un diff Git devient du bruit ; les tableaux
gardent leur ordre, qui est de la donnée. `parseMissionFile` ne lève jamais
et, surtout, **rend quand même une mission bien formée que le validateur
refuse**, avec ses erreurs : une mission à moitié saisie est exactement ce
qu'on transporte entre deux appareils, et refuser de l'ouvrir ferait perdre
le reste. La tolérance s'arrête à la **version de schéma**, qui est un
contrôle de forme et non de validité (décision 2 du §3.3, relue en cours de
route et pas appliquée du premier coup) : un fichier d'une version future,
on ne sait pas le lire, donc on ne prétend pas l'ouvrir « avec des erreurs »
— ce serait offrir de travailler sur une mission qu'on interprète mal.

**La garde transitive, et ce qu'elle a trouvé.** `audit-boundary.test.ts`
marche maintenant les imports depuis `AuditWorkbench.tsx` (posé vide dans
cette PR, pour que la garde existe avant le premier écran) et échoue si un
**import de valeur** atteint `content/`, à n'importe quelle profondeur. Les
`import type` ne sont pas des arêtes, puisque le compilateur les efface —
avec un test compagnon qui le prouve dans les deux sens, sans quoi une marche
qui ne marche pas passerait en ne prouvant rien.

En vérifiant le cas type-only, l'ancienne règle « aucun Client Component
n'importe le catalogue » s'est révélée **trop stricte** : elle rougissait sur
un `import type` pourtant effacé, donc inoffensif — et l'étape 1.2 en aura
besoin pour typer les props de l'îlot. Corrigée maintenant plutôt que laissée
en piège : elle ne regarde plus que les imports de valeur.

**Non-vacuité mesurée finement.** Îlot → `server.ts` → contenu (deux sauts) :
la marche nomme les deux modules ; un `import type` dans l'îlot : elle passe,
c'est correct. Écriture avalée à la manière du quiz : seul le test de quota
tombe. Tri des clés retiré : seul le test de stabilité tombe.

*Piège de vérification, troisième occurrence dans ce projet* : ma première
tentative de sabotage du tri **n'a rien modifié** — un `python3 -c "…"` entre
guillemets doubles transforme le `\n` du motif recherché en vraie nouvelle
ligne, donc le `replace` n'a rien trouvé, et les 11 tests sont passés. Un
sabotage qui passe doit d'abord prouver qu'il a été appliqué : refait avec un
`assert s != before`, exactement un test tombe. Une vérification qui ne trouve
rien doit prouver qu'elle a regardé quelque part.

**Vérifié en réel** : `tsc`, `eslint`, **570 tests unitaires** (+23),
couverture au-dessus des seuils, `next build`, **186 specs Playwright**
inchangées.

### Bing branché, branches nettoyées, comptes de lancement créés (2026-09-14)

Trois faits venus d'Antoine, consignés parce que deux d'entre eux fermaient
des lignes du tableau des points ouverts et qu'une ligne périmée est pire
qu'une ligne absente.

- **Bing Webmaster Tools est branché** (`GROWTH-PLAN.md` 2.6). IndexNow
  suffisait à l'indexation depuis le 2026-09-13 ; ceci ajoute la mesure côté
  Bing, en plus de la Search Console côté Google.
- **Les branches distantes obsolètes n'existent plus** (R2-31). Vérifié à la
  source plutôt que d'après un document : `git ls-remote --heads` ne renvoie
  que `main` et la branche de travail du jour. La suppression automatique des
  branches de tête, qu'Antoine avait activée, a fait le travail seule. Ligne
  retirée du tableau.
- **Les comptes de marque du lancement sont créés** et Antoine lance les
  communications. La vague 1 de `GROWTH-PLAN.md` passe donc de « à préparer »
  à « en cours, côté Antoine » ; les textes et le kit l'attendaient dans
  `marketing/` depuis le 2026-09-13.
### Instrument d'audit, étape 1.2 : la route, les missions, le fichier (2026-09-14)

`/admin/audit` existe. Antoine peut créer la mission AB Tasty, l'emporter
dans un fichier, la réimporter, en sortir une copie purgée — **avant même
qu'une seule ligne soit saisissable** (c'est 1.3). C'est l'ordre voulu par
`AUDIT-PLAN.md` §3.4 : rien de visible avant que le stockage et la frontière
soient tenus, puis les écrans dans l'ordre où une mission réelle en a besoin.

**Ce qui est à l'écran.** La liste des missions **de cet appareil** (la
phrase est écrite en toutes lettres : il n'y a pas de serveur, donc vider les
données du site perd ce qui n'a pas été exporté, d'où la date du dernier
export affichée à côté de chacune) ; la création d'une mission et de sa
passe 1 dans le même geste ; la barre de mission avec ses **trois compteurs
en fraction** et le titre que prendrait le livrable aujourd'hui ; l'import
avec son écran de confirmation ; les deux purges.

**Les compteurs sont toujours des fractions, jamais des pourcentages.**
« 8 sur 25 » sur 25 lignes ; un pourcentage donnerait une précision que
l'échantillon ne porte pas, et c'est la forme dans laquelle ce chiffre
s'imprime dans le livrable. Le titre vient de `deliverableVocabulary`, donc
**le titre d'escalade apparaît de lui-même** dès que la couverture passe sous
le tiers : l'auditeur voit le coût de l'absence pendant qu'il collecte, pas
au moment d'écrire. Une spec vérifie aussi qu'un livrable sans mandat ne
contient jamais le mot « audit ».

**Les primitives de saisie sont locales à la route** (`_ui/`, le `_` en fait
un dossier privé pour Next), jamais dans `src/components/`, jamais
synchronisées vers Claude Design — décision 1 du §3.3, prise parce que le
système n'a **aucun `<input>`** et qu'un brief coûterait plusieurs jours pour
un outil à un utilisateur. `Segmented` sert aux vocabulaires à deux ou trois
valeurs, un `<select>` natif au-delà (son propre prompt le dit : « past that
it is a list, not a control »).

**Deux pièges de tokens attrapés en écrivant le CSS**, tous deux du genre qui
ne lève aucune erreur : les tokens de typographie sont des raccourcis `font`
et non des tailles (`font-size: var(--meta-xs)` serait silencieusement
invalide, exactement comme `--border-rule` qui est un raccourci `border`
complet), et `--font-body` n'existe pas — c'est `--font-ui`. Vérifiés en
lisant un module existant plutôt qu'en supposant.

**Le vrai enseignement de cette étape est un trou dans mes propres specs,
trouvé par le test de non-vacuité et par rien d'autre.** Avec `saveMission`
neutralisé (il écrit une liste vide), **les 7 specs passaient toujours** — y
compris celle qui vide le stockage, recharge et réimporte. Raison : chaque
spec relisait la mission depuis l'état React, jamais depuis l'appareil ; et
« vider puis recharger montre une liste vide » est vrai que la persistance
marche ou non. Autrement dit je vérifiais le parcours en mémoire et le
fichier, jamais l'écriture.

Corrigé par la seule assertion qui la prouve : **recharger sans rien
effacer**. Sabotage refait : exactement les 2 specs de persistance tombent,
les 6 autres passent — ce qui est correct, ce sont des assertions
compagnes. Sans ce contrôle, cette PR partait avec une couverture qui avait
l'air complète et ne tenait rien.

*Piège d'outillage au passage* : mon premier sabotage (`return` anticipé dans
`saveMission`) a fait échouer le build sur du code inatteignable, donc la
suite a tourné contre l'ancien build. Un sabotage doit compiler pour prouver
quoi que ce soit — et il faut lire le code retour du build avant de lire
celui des tests.

**Un avertissement qui ne ment pas.** `AUDIT-PLAN.md` §3.2 demande un
« modifications non exportées depuis … » affiché en permanence. Le poser
demandait une date de dernière écriture (`DraftMeta.lastSavedAt`) : sans
elle, l'avertissement aurait été une supposition, et une alarme qu'on ne peut
pas justifier est pire qu'aucune. Les deux dates vivent dans la même entrée,
donc `markExported` et `saveMission` ont chacune leur test de non-écrasement
— sinon l'avertissement s'allumerait ou s'éteindrait tout seul. « Jamais
exportée » est traité comme le cas le plus dangereux, pas comme une
exception : c'est celui où un vidage des données du site perd tout.

**Trois défauts trouvés en me relisant, pas en voyant rouge.** Ils valent
d'être nommés parce qu'aucun n'aurait fait échouer quoi que ce soit :
1. **Une mission purgée ne pouvait jamais être retirée de l'appareil.** La
   confirmation demande de retaper le nom de l'entreprise ; une mission
   purgée n'en a plus, donc `matches` restait faux pour toujours et le bouton
   désactivé. C'est le cas d'un exemple purgé qu'on importe pour le montrer
   et dont on veut se débarrasser. Repli : retaper « PURGER ».
2. **Réimporter une copie purgée écrasait la mission de travail.**
   `purgeMission` garde l'`id`, donc une copie purgée entre TOUJOURS en
   collision avec la mission dont elle vient, et le défaut « Remplacer »
   échangeait silencieusement tout le travail contre une copie sans nom ni
   valeurs. Le défaut bascule sur « Garder les deux » dans ce cas précis, et
   l'écran dit pourquoi. Trouvé par la spec du point 1, qui ne retrouvait
   plus l'original — le test cherchait autre chose et a buté dessus.
3. **Le téléchargement était fragile** : un anchor détaché ne déclenche pas
   le téléchargement partout, et révoquer l'URL dans la même pile peut couper
   un transfert qui n'a pas démarré. C'est le seul chemin par lequel le
   travail quitte l'appareil ; il est maintenant dans le document, et l'URL
   est révoquée plus tard.

**Prérequis CI, comme le plan l'annonçait** : il n'existait aucune spec sur
`/admin/*`, qui **échoue fermé** (sans `ADMIN_DASHBOARD_PASSWORD`, tout
`/admin` est un 401 pour tout le monde). `ci.yml` pose donc `e2e-admin` au
niveau du workflow, les specs admin utilisent `test.use({ httpCredentials })`,
et sans la variable elles **sautent avec un message** — jamais faussement
vertes (le piège de R-11) ni faussement rouges (son inverse de R2-26).
Vérifié dans les deux sens.

**Vérifié en réel** : `tsc`, `eslint`, 572 tests unitaires, couverture
au-dessus des seuils, `next build` (`ƒ /admin/audit`), **196 specs
Playwright** (+10), passe axe verte sur les trois écrans. Le téléchargement
est un vrai téléchargement de navigateur (`URL.createObjectURL` +
`<a download>`), relu depuis le disque et repassé au validateur dans le test.

### Instrument d'audit, étape 1.3a : le triage des 25 lignes (2026-09-14)

Le cœur de la phase 1, coupé en deux comme le plan l'autorisait — mais **la
coupe est décalée d'un cran par rapport à ce qu'il proposait**, et pour une
raison mécanique : le plan mettait les vues en 1.3b, or sans vue l'éditeur
n'a aucun point d'entrée. 1.3a livre donc la **liste des lignes** et
l'éditeur limité au **statut, à l'absence et à l'accès** ; 1.3b prend les
définitions versionnées, la série d'observations, le critère, la décision en
jeu, l'exposition, la gouvernance, les dates de pilotage et la vue
restitution. Ce que ça rend possible dès maintenant : trier les 25 lignes de
bout en bout et marquer les absences — le cas modal en entreprise financée,
et la moitié du travail d'une première passe.

**Triées par palier décroissant, pas par pilier.** Une ligne T4 demande un
mandat et une T3 une file d'analyste : elles doivent partir le premier jour.
Trier par thème mettrait le travail le plus long en bas de page. La spec
l'affirme comme un **ordre réel sur les 25 lignes** et non sur la première et
la dernière, que deux lignes chanceuses satisferaient.

**Rien n'est présélectionné.** Le sélecteur de statut s'ouvre sur « pas
encore examinée » et le bouton d'enregistrement est désactivé tant que rien
n'est choisi : une ligne que personne n'a regardée est **en attente**, jamais
absente — c'est ce qui empêche la couverture de devenir une opinion.
`not-applicable` n'est jamais proposé : il vient du catalogue via
`newPass`, et le validateur le refuse sur une ligne applicable, donc l'offrir
reviendrait à proposer une erreur.

**`lib/audit/entry-fields.ts` — les champs dérivent du statut, et c'est
testé contre le validateur.** Un champ montré au mauvais statut laisse saisir
une donnée que l'export refusera, et le seul endroit où ça se voit est un
message d'erreur des semaines plus tard. La fonction est pure et ses tests
exercent la règle du validateur plutôt que de la répéter.

**Le test de non-vacuité a trouvé un trou dans mon propre test unitaire.** En
faisant fuir les champs d'absence dans les statuts « mesuré », **le test
unitaire est passé** et seule la spec e2e a vu la régression : mes assertions
utilisaient `toContain`, qui dit ce qui doit être là et rien de ce qui ne
doit pas y être — or c'est cette moitié-là qui compte. Remplacé par le
**jeu exact par statut** ; sabotage refait, le test unitaire tombe cette fois.
Troisième occurrence de la règle « un contrôle de non-vacuité qui passe est
lui-même un signal ».

**Un défaut vu à l'écran et invisible à la relecture** : le champ de
commentaire du coût de réparation n'avait **aucun libellé visible**. Le
`label` de `core/TextArea` est un nom **accessible** seulement, jamais rendu
— c'est sa conception (R-19 : l'intitulé visible vit dans une `QuestionCard`
au-dessus, sur le quiz). Ici il n'y a pas de `QuestionCard`, donc l'opérateur
voyait une boîte sans explication. Enveloppé dans un `Field`. Leçon nº1 de ce
fichier, encore.

**Signalé plutôt que corrigé** : trois lignes du catalogue citent des chemins
de fichiers de ce dépôt dans leur texte de piège (`glossary-deep.ts`,
`growth-stats.ts:30-42`). C'est de la provenance utile pour Antoine, qui a
relu ces fichiers — mais une plage de lignes se périme. C'est de la copie du
catalogue, donc la sienne à trancher au bon à tirer nº4, pas la mienne à
réécrire.

**Décision d'écran à connaître** : quelle mission est ouverte n'est **pas
persisté**. Un rechargement revient à la liste, et rouvrir coûte un clic —
même arbitrage que le ton et le segment. Ce qui est persisté, c'est la
saisie, et une spec le prouve en rechargeant sans rien effacer.

**Vérifié en réel** : `tsc`, `eslint`, **579 tests unitaires** (+7),
couverture au-dessus des seuils, `next build`, **203 specs Playwright** (+7,
dont la passe axe sur les deux nouveaux écrans). Captures relues en 1280 et
390 px, `scrollWidth === clientWidth` aux deux largeurs.

### Instrument d'audit, étape 1.3b-i : la définition versionnée (2026-09-14)

1.3b a été coupée en trois pour la même raison que 1.3 l'avait été en deux :
une PR qu'une revue ne peut pas tenir n'est pas relue, elle est approuvée.
Ce premier temps ne livre que la définition — la série d'observations et le
reste de l'entrée suivent.

**Ce que ce module décide, et pourquoi il existe.** Une `MetricDefinition`
est immuable et adressée par `id@version` (AUDIT.md §3). La raison n'est pas
la pureté : une observation référence une version précise, donc éditer une
définition en place changerait **rétroactivement** ce que des chiffres déjà
relevés veulent dire, et personne ne s'en apercevrait. `registerDefinition`
refusait déjà d'écraser une référence avec un autre contenu ;
`lib/audit/definitions.ts` est ce qui décide, à l'écran, quelle version
écrire. Trois cas dans cet ordre : contenu identique → on réutilise la
référence ; aucune version → v1 ; contenu différent → max + 1, l'ancienne
reste.

**Le max, pas le compte.** Une v3 suit une v2 même si la v1 a disparu du
fichier — compter les versions donnerait un `id@2` déjà pris. Un test dédié,
parce que c'est le genre d'erreur qui ne se voit qu'au moment où elle jette
une exception chez l'utilisateur.

**La règle ne tient que grâce à `normalizeDraft`, et c'est le test de
non-vacuité qui me l'a appris.** Un `<input>` rend `""` là où le schéma n'a
rien : sans normalisation, rouvrir un formulaire et l'enregistrer frapperait
une v2 dont le seul contenu serait des chaînes vides. J'avais écrit la spec
e2e « rouvrir et enregistrer sans rien changer ne frappe pas de v2 » — et
**elle est passée avec la normalisation retirée**. Cause : le brouillon est
seedé depuis la définition ENREGISTRÉE, déjà normalisée, donc il n'y a aucun
vide à normaliser sur ce chemin-là. Le geste qui produit vraiment le bug est
autre : commencer à taper dans un axe optionnel puis se raviser, ou coller
une valeur avec une espace au bout. La spec exécute maintenant ces deux
gestes-là, et le même sabotage la fait tomber. **Une non-vacuité qui passe
est un signal** (convention 5) — troisième fois que ça sert dans ce projet.

**La normalisation est à la frontière, pas aux points d'appel** : `""`,
`[]` et les espaces de bord sont retirés par `upsertDefinition` lui-même,
donc l'écran peut être négligent sans que la règle cède. C'est la leçon des
deux fuites `rawPoints` (#110 puis #115), où une garde nominale ne couvrait
que le champ auquel on avait pensé.

**L'écran.** `DefinitionEditor` : les quatre champs que le validateur exige
(unité, population au numérateur, population au dénominateur, périmètre —
ce dernier pré-rempli au périmètre de la mission, jamais vide), puis les neuf
axes qui font qu'un chiffre veut dire deux choses derrière un dépliant. Ce
n'est pas l'outil qui dit lesquels comptent pour une ligne donnée : c'est le
**piège de la fiche**, à gauche, écrit ligne par ligne par le catalogue.
Prétendre le deviner ici serait inventer du contenu.

**Une définition incomplète n'est pas enregistrée, et ne bloque pas la
ligne.** L'écran nomme ce qui manque, la ligne s'enregistre quand même, et le
fichier signale l'incomplétude. Le contraire — un bouton désactivé — perdrait
le statut et le reste de la saisie pour un champ qu'on ira chercher demain.
Une définition incomplète ne retire pas non plus la référence déjà posée.

**Un avis, pas un silence** : frapper une v2 affiche « Définition m07@2
frappée. La version précédente reste dans la mission. » Sans ça, l'auditeur
croit avoir corrigé l'ancienne, ce qui est exactement l'inverse de ce qui
s'est passé. L'avis ne survit pas à un changement d'écran (`goTo`) : un
message qui reste affiché pendant qu'on navigue finit par décrire une action
qu'on ne se rappelle plus avoir faite.

**Deux corrections venues de la capture, pas de la relecture** : la phrase
sous la case « réglage par défaut de l'outil » interpolait le nom de la ligne
et donnait « … le vrai constat de la ligne — dépense ventes & marketing
chargée compris » ; et l'aide disait « sans eux, l'export refusera la ligne »,
ce qui est faux — l'export écrit le fichier, c'est le validateur qui signale.
Le texte dit maintenant ce que le code fait.

**Vérifié en réel** : `tsc`, `eslint`, **598 tests unitaires** (+19),
couverture au-dessus des seuils (lignes 90,7 %), `next build`, **207 specs
Playwright** (+4), passe axe étendue au formulaire de définition avec ses
axes dépliés (axe ne voit que le visible : un `<details>` fermé n'aurait rien
prouvé, donc la spec l'ouvre et l'assert). Captures relues en 1280 et 390 px,
`scrollWidth === clientWidth` aux deux largeurs. Non-vacuité mesurée
finement : normalisation retirée → **une seule** spec tombe, la bonne ;
référence non posée sur l'entrée → trois tombent et celle qui ne porte que
sur le formulaire passe ; et côté unitaire, retirer le court-circuit
« contenu identique » en fait tomber trois, retirer le tri des clés une
seule, remplacer le max par le compte une seule.

### Trois écrans sans titre de document, et `/quiz` qui n'envoyait rien du tout (2026-09-14)

Antoine, via Bing Webmaster Tools : quatre URL sans `<h1>` — `/r/sample` sous
ses trois formes et `/quiz`. Vérifié sur le build avant de corriger quoi que
ce soit, parce qu'un rapport d'outil se relit contre le HTML réellement
servi : les neuf pages de contenu en ont bien exactement un, et les **trois**
écrans applicatifs (`/quiz`, `/r/[id]`, `/deep-dive/[id]`) n'ont **aucun**
titre, ni `h1` ni `h2`. Bing n'en signalait que deux parce que le troisième
est `noindex` et redirige un visiteur.

**Le vrai défaut était plus grand que le symptôme.** En regardant pourquoi
`/quiz` n'avait pas de titre, le document servi fait 12 ko dont **zéro
contenu** : `if (!mounted) return null`, la garde d'hydratation de l'étape 4,
renvoie `null` pour tout le composant. Un moteur reçoit donc une page vide sur
celle que R2-08 a délibérément laissée indexable et qui reçoit plus de liens
internes qu'aucune autre — en-tête et pied de page de chaque page de contenu y
pointent. Le `<h1>` manquant n'était qu'une conséquence.

**Correctif, et sa limite dite franchement.** L'enveloppe ne dépend pas de
`localStorage` : wordmark, titre, langue. Elle part donc toujours, et le corps
attend le montage comme avant. Le premier rendu client est identique au HTML
du serveur — c'est ce même rendu qui valait `null` — donc aucun mismatch n'est
introduit. Ce que ça **ne** règle pas : le corps du questionnaire reste
client-only. Le rendre côté serveur demanderait de peindre la question 1 puis
de corriger après montage pour qui reprend un parcours, c'est-à-dire un flash
visible sur l'écran que tout le funnel existe pour faire terminer. Il n'existe
pas de moyen d'avoir les deux (`useSyncExternalStore` a exactement le même
flash, son snapshot serveur étant vide par définition). **C'est un arbitrage
produit, pas une implémentation** — posé à Antoine plutôt que tranché ici.

**Le titre est visuellement masqué, et c'est un choix argumenté.** Ces trois
écrans n'ont pas de titre dessiné : leur premier élément peint est une carte
de question ou le numéral du score, et le design ne prévoit rien au-dessus. En
ajouter un visible changerait une maquette livrée. Sur `/r/[id]`, le candidat
visible existe pourtant — le numéral — mais en faire un `<h1>` demanderait de
changer `ScoreDisplay`, que la carte d'aperçu de la landing réutilise, où un
second `<h1>` serait faux. Le score est dans le texte du titre masqué
(« Résultat du Tour — 74/100 »), donc rien n'est perdu.

`clip-path` et non `display: none` : les deux autres retirent l'élément de
l'arbre d'accessibilité, donc masqueraient le titre aux lecteurs d'écran
aussi — ce qui reviendrait à ne pas en avoir mis. C'est exactement ce que la
spec vérifie, par le **nom accessible** et pas par la propriété CSS.

**Ce que la spec tient, et la preuve qu'elle le tient.** `document-headings.spec.ts`
lit le **HTML brut en HTTP**, pas le DOM — sur ces trois routes précisément,
ce sont deux choses différentes, et un crawler ne fait pas tourner les effets.
Non-vacuité mesurée en deux temps : retirer le `h1` partout fait tomber trois
specs ; le retirer **seulement de l'enveloppe** en le gardant après montage en
fait tomber **deux** (les deux lectures HTTP) pendant que la spec DOM passe —
c'est la distinction que la spec revendique, prouvée plutôt qu'affirmée.

**Une spec existante corrigée, pas assouplie** : `progression.spec.ts`
utilisait `getByRole("heading", { level: 1 }).or(locator("main"))` comme
contrôle « la page a chargé ». Il n'y avait pas de `h1`, donc la branche
`main` gagnait ; il y en a un maintenant et il n'est pas visible, donc le
contrôle échouait pour une raison étrangère au sujet de la spec. Remplacé par
une assertion sur ce que cette page dessine vraiment (`bottleneck`).

**Trois chaînes neuves, statut « à relire »** (convention 6) :
`meta.quizHeading`, `meta.resultHeading` (gabarit `{score}`),
`meta.deepDiveHeading`. Distinctes des `meta.*Title` existants, qui portent le
suffixe de marque : un `<h1>` nomme la page, il ne répète pas le nom du site.

**Vérifié en réel** : `tsc`, `eslint`, 598 tests unitaires, `next build`,
**221 specs Playwright** (+14), passe axe inchangée. Et par requête HTTP sur
les quatre URL du rapport plus `/deep-dive/sample` : un `h1` chacune, dans la
langue du lecteur, avec le score pour la page de résultat.

### Instrument d'audit 1.3b-ii : la série d'observations (2026-09-14)

Second temps de 1.3b. Une valeur est une **série**, jamais un scalaire
(AUDIT.md §3, décision 1) : un NRR stable à 105 % et un NRR qui descend de
120 % sont deux entreprises. L'écran reflète ça — on ajoute des observations,
on ne remplace pas « la » valeur.

**Six formes de valeur, quatre éditeurs**, comme la décision 5 d'`AUDIT-PLAN.md`
le prévoyait. `lib/audit/observation-fields.ts#valueEditorFor` : `scalar` → un
nombre, `qualitative` → un texte, `matrix` → la matrice, et `couple` /
`distribution` / `composite` → **la même matrice réduite à une ligne**. Un test
compte les lignes du catalogue par éditeur et vérifie que les quatre servent —
et que l'éditeur « ligne » est le plus employé des quatre, ce qui est
exactement la raison de ne pas l'avoir écrit trois fois. `ObservationValue`
accepte déjà `Matrix` : aucun changement de schéma.

**`observationGaps` dit ce qui manque, et rien de plus.** Liste fermée, testée
en faisant **tourner le validateur** plutôt qu'en redisant sa règle : une ligne
mesurée sans observation valuée est refusée, un contesté à une seule
observation aussi, et — le cas qu'on aurait pu croire symétrique — un contesté
n'exige **pas** de valeur non nulle : deux observations en attente restent un
désaccord documenté, et le validateur ne l'exige pas non plus.

**Un défaut trouvé en capture, pas à la relecture.** Sur une ligne scalaire,
l'écran disait bien « il manque une valeur » ; sur une ligne matrice, non.
Cause : `blankObservation` posait une matrice vide comme valeur de départ, et
une matrice de cellules vides n'est pas `null`, donc elle compte comme une
valeur pour le validateur. La valeur part maintenant à `null` dans tous les
cas, et la matrice affichée avant saisie est **locale** — elle n'est écrite
qu'au premier changement.

**Un second défaut, purement visuel, et lui aussi vu en capture.** La ligne de
matrice mettait le N et les cellules dans la même grille ; la phrase d'aide du
N le rend deux fois plus haut qu'une cellule, donc GRR passait à la rangée
suivante et le couple ne se lisait plus côte à côte — ce qui est précisément ce
que la ligne du catalogue (« NRR et GRR, toujours en couple ») demande. Le N a
maintenant sa propre ligne pleine largeur : il décrit la ligne, il n'en est pas
une valeur. Vérifié par **mesure** et non à l'œil : les deux cellules ont le
même `y` en 1280 px, des `y` différents en 390 px, aucun débordement aux deux
largeurs.

**La confiance est dérivée et affichée, jamais saisie.** `confidenceOf` lit la
sorte de source et la complétude de la définition. Sa signature a été
**réduite** aux quatre champs qu'elle lit réellement (`Pick<MetricDefinition, …>`)
plutôt qu'une `MetricDefinition` entière : l'écran veut la confiance pendant
que la définition est encore un brouillon, et un brouillon n'a pas de numéro de
version — exiger l'objet complet aurait obligé à en fabriquer un avec une
version fausse, qui aurait fini par fuir. Tous les appelants existants
compilent sans changement.

**Trois pièges de saisie tenus par l'écran** : la date de tirage (`asOf`) est un
champ distinct de la fin de période, avec la phrase qui dit pourquoi (un mois
d'août tiré le 2 septembre n'a pas fini de bouger) ; le rôle du fournisseur est
un **rôle**, jamais un nom ; et `contradicts` ne propose que les autres
observations de la même ligne, parce que le lien entre deux chiffres qui
divergent **est** le constat.

**Aucune date n'est pré-remplie** sur une observation neuve : deviner un mois
clos enregistrerait une période que personne n'a choisie, et c'est exactement
le genre de défaut qui finit dans un livrable.

**Vérifié en réel** : `tsc`, `eslint`, **605 tests unitaires** (+7), couverture
au-dessus des seuils (lignes 90,8 %), `next build`, **226 specs Playwright**
(+5). Captures relues en 1280 et 390 px, `scrollWidth === clientWidth` aux
deux largeurs. Non-vacuité mesurée finement : `observationGaps` qui ne rend
jamais rien → **deux** specs tombent ; confiance figée à « haute » → **une**,
la bonne ; une colonne ajoutée qui ne touche pas les lignes → **une**, celle
qui tient l'invariant qu'aucun type n'impose (autant de cellules que de
colonnes).

### Instrument d'audit 1.3b-iii : le repère, la décision, le pilotage (2026-09-14) — clôt 1.3b

Dernier temps de 1.3b. Une entrée porte maintenant tout ce que le schéma
prévoit ; il reste le Tour de l'auditeur (1.4) et les constats (1.5).

**Le contexte s'applique à TOUS les statuts, `absent` compris — et c'est là
qu'il porte le plus.** Une ligne que l'entreprise n'a pas, dont personne
n'est propriétaire et qui n'a jamais servi dans une décision est le constat
type de cet outil. Le bloc est donc replié parce qu'il est facultatif, jamais
masqué parce qu'il serait hors sujet. Seul le **repère** vit avec la valeur :
sans chiffre à comparer, il n'a rien à dire.

**Deux niveaux d'exigence sur un repère, volontairement distincts à l'écran.**
Le validateur n'exige qu'une chose (q5) : l'argument d'un seuil argumenté —
affiché en rouge, il refusera le fichier. La **provenance** d'un repère public
(source, population, année) est du **conseil** — en gris, « le fichier
l'accepte, une réunion moins ». Les confondre ferait bloquer sur ce qui n'est
pas bloquant, ou taire ce qui l'est ; un test épingle les deux en faisant
tourner le validateur plutôt qu'en redisant sa règle.

**Changer de sorte de repère jette ce qui n'a plus de sens.** Une
justification collée à un repère public partirait telle quelle dans le fichier
sans que rien ne l'affiche — exactement le genre de champ qu'on retrouve un
mois plus tard sans savoir d'où il vient. La valeur, elle, est conservée :
c'est le même seuil, lu autrement.

**L'horloge de relance repart à la relance, pas à la demande.** « Demandé il y
a dix jours, relancé hier » et « demandé il y a dix jours, jamais relancé »
sont deux situations différentes, et seule la seconde appelle une action.
Confondre les deux ferait remonter en tête de la liste une ligne dont on vient
de s'occuper, et l'auditeur relancerait deux fois le même interlocuteur. Le
seuil (7 jours) est une constante en clair : un diagnostic se mène en jours,
et une demande sans réponse au bout d'une semaine est un fait sur l'accès —
ce que `not-accessible` finit par dire.

**Une date illisible ou dans le futur n'invente pas un retard.** Sans
certitude, la ligne reste « en attente » plutôt que d'être remontée en tête
d'une liste d'actions — une alarme qu'on ne peut pas justifier est pire
qu'aucune (même raisonnement que l'avertissement d'export de 1.2).

**La vue collecte gagne trois choses, et chacune répond à une question que
l'auteur se pose vraiment** : les compteurs par palier sont des **restes**, pas
des totaux (« reste 1 ligne T4, 2 lignes T3 » dit combien de temps il faut
encore, « il y a 25 lignes » ne dit rien) ; la liste « à relancer », la plus
ancienne d'abord, avec l'interlocuteur ; et le groupement **par interlocuteur,
sinon par système source** — parce qu'une collecte se prépare par réunion
(« tout ce que je dois demander au DAF ») ou par export (« tout ce qui sort de
Stripe »). Un groupement par pilier serait la vue du livrable, pas celle du
travail. « Non attribué » ferme toujours la marche : c'est le tas dans lequel
on pioche, pas une réunion.

**Un raccourci plutôt qu'une valeur par défaut** : la décision en jeu peut être
reprise de la fiche du catalogue d'un clic, et le bouton disparaît dès qu'il y
a quelque chose — il n'écraserait plus, il détruirait. La pré-remplir
automatiquement aurait fait passer le texte du catalogue pour une observation
de l'auditeur.

**Piège de spec, coûté trois échecs à 30 s** : `getByRole("group", { name })`
sur un `Disclosure` n'a jamais matché — le composant enveloppe son résumé dans
un `<span>` et pose un marqueur en `::before`, donc le nom accessible n'est pas
celui qu'on lit. Il accepte un `data-testid`, qui est la convention du repo ;
s'en servir plutôt que deviner une forme de nom accessible.

**Vérifié en réel** : `tsc`, `eslint`, **627 tests unitaires** (+22), couverture
au-dessus des seuils (lignes 91,2 %), `next build`, **232 specs Playwright**
(+6). Captures relues en 1280 et 390 px, `scrollWidth === clientWidth` aux deux
largeurs sur les trois écrans.

**Non-vacuité mesurée finement, six sabotages, un test tombé chacun** : côté
unitaire — l'horloge qui ne repart pas à la relance, « non attribué » qui n'est
plus poussé en dernier, la provenance qui devient bloquante ; côté écran — le
changement de sorte qui garde tout, les compteurs qui deviennent des totaux, et
la même horloge vue depuis la liste. Aucun sabotage n'en a fait tomber deux, ce
qui est le signe que les règles sont testées séparément.

### Instrument d'audit, étape 1.4 : le Tour de l'auditeur, et ce qu'il révèle (2026-09-14)

L'étape qui rend l'outil différent d'un formulaire de 25 lignes. Jusqu'ici la
couverture disait ce que l'entreprise peut **montrer** ; le Tour ajoute l'autre
axe — ce qu'elle déclare **mesurer** — et c'est le croisement des deux qui
structure tout le readout.

**Le quadrant qui vaut le déplacement.** Une réponse à 20 points (« oui, notre
CAC est clairement identifié et suivi ») posée à côté d'une ligne CAC marquée
absente est un **angle mort** : la maturité déclarée est haute, le système réel
ne suit pas. C'est un constat qu'aucun des deux axes ne produit seul — ni un
questionnaire de maturité, ni un inventaire de chiffres.

**Un angle mort ne demande PAS les 15 réponses, et c'est le point de
conception de l'écran.** Le croisement se fait question par question
(`row.tourQuestionId`), donc une seule réponse à 20 points en révèle un ; seul
le SCORE attend le Tour complet. Lier les deux ferait attendre la fin des
entretiens pour voir ce qui se voyait dès le premier — et une spec l'épingle
dans les deux sens (une réponse suffit, zéro réponse n'établit rien).

**`m19` est produite, jamais saisie.** À la quinzième réponse, la ligne passe
en `measured` avec une observation valuée (`raw-extract-self`, période
`point` : le Tour photographie des pratiques, il ne couvre pas un intervalle)
et **sa définition**. Sans elle le validateur refuserait précisément la ligne
que l'outil produit le mieux. Tout part en **une seule écriture** : une réponse
posée sans son `m19` sur un quota plein laisserait la mission dans un état que
rien ne rattrape.

**Deux règles du produit public volontairement inversées ici**, signalées
plutôt qu'absorbées :
- **Les 15 questions sur un seul écran**, là où `/quiz` en montre une à la
  fois. Ce n'est pas un parcours de trois minutes : c'est un formulaire qu'on
  remplit par morceaux entre deux entretiens, et une question à la fois
  obligerait à traverser quatorze écrans pour corriger la quinzième.
- **Les points sont affichés**, là où `AnswerOption.prompt.md` dit « never
  label an option with its score — scoring stays invisible to the user ».
  Cette règle vaut pour le questionnaire public, où voir le barème fausserait
  les réponses. Ici c'est l'auditeur qui note : lui cacher le barème
  reviendrait à lui demander de noter à l'aveugle.

**Un écart de plan corrigé en écrivant.** `buildTourEntry` utilisait
`registerDefinition`, qui **lève** si la même référence existe avec un contenu
différent — or la définition du Tour porte le périmètre de la mission. Passé à
`upsertDefinition`, c'est-à-dire exactement ce que `saveRow` fait déjà pour la
saisie manuelle : le module pur dit le contenu voulu, l'appelant qui connaît la
mission décide de la version.

**Le titre d'escalade nomme enfin une étape.** `deliverableVocabulary` recevait
« cette étape » en dur depuis 1.3b. Il reçoit maintenant l'étape la plus faible
— mais **seulement à 15/15** : le départage à égalité suit l'ordre canonique
AARRR (SPEC.md §6), donc l'appliquer à un Tour partiel désignerait une étape
par un artefact d'ordre de déclaration plutôt que par une mesure.

**Deux défauts trouvés en essayant d'utiliser l'écran, pas en le relisant** —
le script de capture s'est arrêté sur un bouton qui n'existait pas :
1. **La restitution était un cul-de-sac.** Aucun retour vers la mission. La
   `MissionBar` n'est rendue que sur l'écran d'accueil d'une mission, donc rien
   ne ramenait en arrière. Bouton ajouté, plus une spec qui vérifie les deux
   écrans.
2. **Le docblock de `MissionBar` mentait** depuis 1.3a : « la barre présente
   sur tous les écrans d'une mission ouverte » — elle n'a jamais été sur
   l'éditeur de ligne non plus. Corrigé, parce qu'un commentaire faux est ce
   qui envoie la prochaine session chercher un bug ailleurs.

**Piège CSS évité en regardant la capture.** Ma carte d'angles morts posait
`border-color: var(--paint-red)` — un sélecteur à une classe, à égalité de
spécificité avec celui de `Card`, donc l'issue dépendait de l'ordre d'émission
des feuilles (leçon nº2, et R-21 l'a déjà montré une fois). Et le rouge ne
s'affichait effectivement pas. Remplacé par `tone="alert"` du design system,
dont la doc dit exactement « marks a diagnosed weakness » — ce qu'un angle mort
est. La spec axe **exige maintenant que cette carte soit visible pendant la
passe** : c'est la seule surface rouge de l'outil, donc le seul endroit où une
régression de contraste pourrait se cacher.

**Vérifié en réel** : lint, tsc, **646 tests unitaires** (+20), couverture
au-dessus des seuils, `next build`, **242 specs Playwright** (+10, dont la
passe axe sur les deux écrans). Captures relues en 1280 et 390 px,
`scrollWidth === clientWidth` mesuré sur les deux écrans aux deux largeurs.

**Non-vacuité mesurée finement, deux sabotages** : en n'ajoutant pas l'entrée
produite à la passe, **3 specs tombent** — exactement les trois qui affirment
que `m19` est écrite — et les 7 autres passent, ce qui est correct pour des
assertions compagnes. En vidant la liste des angles morts, **1 spec e2e et 3
tests unitaires** tombent, et les deux assertions d'ABSENCE d'angle mort
passent dans les deux états. Fait notable du second sabotage : le quadrant
affiché sur la ligne restait juste (« Angle mort ») pendant que la liste de
tête était vide — les deux chemins sont bien indépendants, et la spec affirme
les deux.

### Instrument d'audit, étape 1.5 : les constats et le bloc de tête (2026-09-14)

Ce qui transforme 25 lignes renseignées en un document qu'on peut poser sur
une table. `findings.ts` posait les règles depuis la phase 0 ; cet écran est
le premier à les faire tenir.

**Seules les lignes promouvables** — un repère ET une décision en jeu
(`isPromotable`). Sans repère, un nombre reste un nombre et se range en
annexe ; sans décision en jeu, il est intéressant et ne fait rien bouger.
L'écran montre les deux moitiés : ce qui est prêt, et combien de lignes n'y
sont pas.

**Trois champs seulement bloquent** (`missingFindingFields` : les valeurs
référencées, l'écart, la cause système). Le reste du 5C et le Decision Ledger
partent en chaînes vides — le fichier dit ce qui reste à faire plutôt que
d'interdire de l'enregistrer, comme partout ailleurs ici. L'écart et la cause
bloquent pour une raison précise : ce sont des **vocabulaires fermés**, donc
il n'existe pas de « vide » valide, et en défauter un reviendrait à écrire à
la place de l'auditeur une phrase qui s'imprimera dans un livrable (la règle
du statut d'une ligne, 1.3a).

**Trois choses ne sont jamais écrites**, chacune testée : `actual`,
`learning` et `next` du Ledger (ils se remplissent à la passe suivante ; les
poser vides en ferait des cases à remplir à la rédaction, l'inverse de leur
usage) ; une action convenue vide (un objet vide promettrait un accord qui
n'a pas eu lieu) ; et un nom de personne, puisque la cause système est une
liste fermée — « personne n'en est propriétaire » est un constat sur
l'organisation, « Marc ne l'a jamais fait » est un constat sur Marc.

**La rareté est structurelle, et l'écran la montre au lieu de l'expliquer.**
La bascule « à la une » se grise au plafond de 8 ; marquer une seconde action
prioritaire démarque la première sous les yeux. Retirer de la une retire
aussi la priorité — une action prioritaire qui ne serait pas à la une n'a pas
de sens, et le validateur la compterait quand même.

**Le budget du bloc de tête porte sur le BLOC**, pas sur chacun de ses trois
champs : le §4.1 du readout donne 400 mots au bloc entier. Le dépassement se
calcule donc sur les trois mis bout à bout dans l'ordre de lecture, et ce qui
dépasse est **montré** comme ce qui basculera en annexe — jamais coupé. Un
texte tronqué en silence dans un livrable est la pire des issues.

**Ce que le test de non-vacuité a appris, et que je n'aurais pas deviné.**
J'ai d'abord saboté la garde de plafond dans le *gestionnaire* : **les 7
specs sont passées**. Le plafond vit à deux endroits, et un test d'écran ne
peut atteindre que le premier — un bouton désactivé ne dispatche pas, donc la
garde du gestionnaire est **inatteignable depuis l'UI**. Refait sur le rendu
(bouton toujours actif) : exactement 1 spec tombe, la bonne. Deux
conséquences écrites plutôt que sous-entendues : la spec affirme maintenant
aussi le **résultat** (le compteur reste à 8 après un clic forcé), pour
qu'elle attrape encore un état hors plafond si quelqu'un retire un jour le
`disabled` ; et le commentaire du gestionnaire dit que sa garde est
redondante **par construction** et couvre le chemin non-UI (un import, un
fichier écrit à la main). Troisième fois que « un contrôle de non-vacuité qui
passe est lui-même un signal » rend quelque chose.

**Défaut vu à la capture, invisible à la relecture** : « 1 sur 15 lignes
renseignées » comptait les entrées que `newPass` sème d'office
(`not-applicable` pour chaque ligne hors profil). Quelqu'un qui en a rempli
une seule lisait qu'il en avait quinze. Le dénominateur ne compte plus que
les lignes applicables, et une spec l'épingle. Les libellés du 5C portaient
aussi leur explication (« Critère — ce à quoi on compare, et d'où il
vient ») ; passés en libellé court + indice, la convention des autres champs
de l'outil.

**Vérifié en réel** : lint, tsc, **662 tests unitaires** (+16), couverture
au-dessus des seuils, `next build`, **249 specs Playwright** (+7, dont la
passe axe sur les deux écrans). Captures relues en 1280 et 390 px,
`scrollWidth === clientWidth` sur les deux écrans aux deux largeurs.

**Non-vacuité, trois sabotages** : la garde de plafond côté gestionnaire → 0
spec (voir plus haut, c'est le résultat qui compte) ; le même plafond côté
rendu → 1 spec, la bonne ; l'exclusivité de la priorité remplacée par un
simple marquage → 1 spec, la bonne aussi. Aucun sabotage n'en a fait tomber
deux.

### Instrument d'audit, étape 1.6 : la recette, le canari — la phase 1 est close (2026-09-14)

Les cinq étapes précédentes couvrent chacune un écran. Celle-ci couvre la
**promesse**, et c'est pour ça qu'elle trouve des choses qu'aucune d'elles
n'aurait pu voir.

**La spec canari** (`e2e/audit-canary.spec.ts`). `AUDIT.md` et
`content/legal.ts` promettent la même chose : rien ne quitte le navigateur.
Une garde statique vérifie qu'aucun module serveur n'est importé, mais elle
ne dit rien d'un `fetch` écrit à la main, d'un `<img>` à l'URL construite, ou
d'un formulaire qui partirait un jour par erreur. Des chaînes canari uniques
sont semées dans le nom de l'entreprise, une valeur d'observation et un texte
de constat ; tout le parcours est joué ; **toutes** les requêtes du navigateur
sont enregistrées. Trois assertions : aucune ne porte un canari, aucune
requête non-`GET` de toute la session (celle-là attrape une fuite même
encodée, hachée ou coupée en morceaux — trois façons dont une recherche de
sous-chaîne ne verrait rien), et **le fichier exporté contient bien les
canaris**, sans quoi une spec qui aurait cessé de saisir quoi que ce soit
passerait en ne prouvant rien. Non-vacuité faite avec une vraie fuite (un
`fetch` POST de la mission dans `persist`) : la spec la voit.

**La recette du critère de sortie** (`e2e/audit-acceptance.spec.ts`). Le
§3.1 du plan demande qu'une mission renseignée sur une ligne de chaque
statut survive à un export, un vidage des données du site et une
réimportation. La spec **vide réellement le `localStorage`** entre les deux :
sans ça on vérifierait que l'état React a survécu à un clic, pas que le
fichier porte le travail — et le fichier est la seule copie qui survit. Les
compteurs sont comparés au caractère près, le `validateMission` importé est
celui de l'app (pas une réimplémentation), et la copie purgée est vérifiée
absolu par absolu pendant que la mission de travail, elle, ne bouge pas.

**Trois défauts trouvés par la recette, aucun visible à la relecture :**
1. **Le champ de confirmation de purge n'avait aucun nom accessible.** La
   phrase au-dessus est un `<p>`, pas un `<label>`. Cet écran — le seul de
   l'outil qui détruit du travail — n'était traversé par aucune spec avant
   que la passe axe soit étendue à toute la route. Enveloppé dans un `Field`.
   C'est la troisième fois que ce défaut exact apparaît (1.3a, 1.4, ici) :
   `core/TextArea` et `_ui/TextInput` ne rendent **jamais** de libellé
   visible, donc tout champ hors `Field` est anonyme.
2. **Une observation neuve part sans ses dates**, et le validateur les exige.
   C'est le bon comportement (une observation sans période ne se compare à
   rien) — la recette fait ce que l'auditeur fait, elle les remplit. Noté
   parce que c'était mon premier réflexe de croire à un bug de l'app.
3. **Le `<summary>` de `Disclosure` ne s'atteint pas par son rôle.** Le
   composant enveloppe son libellé dans un `<span>` et ajoute un marqueur
   `::before`, donc le nom accessible n'est pas le texte visible. Troisième
   rencontre ; écrit dans les specs cette fois plutôt que redécouvert.

**Le parcours clavier** (`e2e/keyboard.spec.ts`, bloc audit) affirme un
comportement et non des attributs : une ligne se renseigne et s'enregistre
**sans souris**, et les champs qu'un statut fait apparaître entrent dans
l'ordre de tabulation. Un `tabindex` correct sur chaque champ ne dit rien de
ça — il suffit d'un conteneur qui intercale un piège pour que le parcours
casse alors que tous les attributs sont justes.

**La phase 1 est close.** `/admin/audit` fait tout ce que `AUDIT-PLAN.md` §3
demandait : créer une mission, trier 25 lignes par palier, saisir statut,
absence, définition versionnée, observations, repère, décision en jeu,
exposition et pilotage, remplir le Tour de l'auditeur, lire le croisement
méthode × réalité, écrire les constats et le bloc de tête, exporter,
réimporter, purger — sans qu'un octet parte au serveur.

**Le prochain chantier n'est pas du code : c'est la phase 1 bis**, et elle
est côté Antoine. Mener la vraie mission AB Tasty dans l'outil, en tenant le
journal des frictions. C'est lui qui dira ce que la phase 2 (les readouts)
doit construire, et il n'y a aucune façon de le deviner d'ici.

**Vérifié en réel** : lint, tsc, **662 tests unitaires**, couverture
au-dessus des seuils, `next build`, **256 specs Playwright** (+7). Capture du
seul écran neuf relue en 390 px.

**Non-vacuité, trois sabotages** : une vraie fuite réseau → la spec canari
tombe ; le libellé du champ de purge retiré → la passe axe tombe ; les
constats retirés du fichier sérialisé → la recette d'aller-retour tombe.
Chacun exactement une spec.
