# Faire connaître Tour de Growth — le plan, sans LinkedIn et sans nom

*Le plan de distribution de Tour de Growth sous deux contraintes posées par
Antoine le 2026-09-13 : **on ne passe pas par LinkedIn**, et **il n'est jamais
nommé**. Il remplace le « Growth Plan » du 2026-08-29 (artifact, cinq
phases), dont les trois leviers les plus forts — le post LinkedIn natif, les
20-30 messages directs au réseau personnel, le lancement Product Hunt avec
l'histoire du maker — tombent tous les trois sous ces contraintes. Ce qui
reste est un plan où **le produit est le porte-parole** et où la moitié des
actions ne demandent aucun humain visible. Même règle de tenue que
`AUDIT-PLAN.md` : quand une action est faite, sa ligne change ici, et
`CLAUDE.md` reçoit l'entrée de journal.*

*Dernière mise à jour : 2026-09-13 (option A tranchée ; vague 0 : IndexNow, UTM, kit et textes de lancement livrés — le reste de la vague 0 est côté Antoine).*

---

## 0. Ce que les deux contraintes coûtent, et ce qu'elles laissent

**LinkedIn était le canal où vit la cible** (PM growth, fondateurs SaaS,
Heads of Growth) et le seul où le repo avait déjà un plan chiffré (post
natif, lien en premier commentaire, carrousel AARRR). Son exclusion retire
aussi, de fait, le réseau personnel : un message direct « peux-tu casser
ça ? » à trente personnes est le levier le plus convertissant de tout
lancement, et il nomme celui qui l'envoie.

**« Jamais nommé » retire trois choses de plus** : Product Hunt en tant que
maker (la plateforme exige un vrai prénom et nom sur les comptes personnels
— voir [son centre d'aide](https://help.producthunt.com/en/articles/771527-personal-account-vs-company-account)),
les podcasts (une voix est une identité), et la presse (un journaliste veut
un fondateur).

**Ce qui reste, et c'est plus qu'il n'y paraît** :

| Famille | Qui parle | Exemples |
|---|---|---|
| **Personne ne parle** | Le produit et Google | SEO (contenu + technique), la boucle de partage du produit, les annuaires, le dépôt GitHub |
| **La marque parle** | Un compte `tourdegrowth`, pseudonyme, jamais un nom | Hacker News (Show HN), Reddit, Indie Hackers, X / Bluesky, pitchs de newsletters signés « l'équipe » |
| **De l'argent parle** | Un annonceur | Reddit Ads, Google Search Ads — anonymes par nature |

**Le point à trancher avant tout, parce qu'il change le sens de la
contrainte.** Le site, lui, te nomme : le pied de page (« Un side project
d'Antoine Berthaud — Senior Growth PM », lien vers le CV), le crédit sous le
score, la carte de crédit du Deep dive, `/about` écrite à la première
personne, l'éditeur des pages légales, l'`author` du JSON-LD, et le
`README.md` du dépôt public. **Quiconque clique depuis un post trouve ton nom
en trois secondes.** Deux lectures possibles :

- **A — La promotion est anonyme, le site reste signé** (le plan ci-dessous
  est écrit sous cette hypothèse). Les posts, les comptes, les pitchs ne te
  nomment jamais, ne partent jamais de tes comptes, ne renvoient jamais vers
  le CV ; mais le produit continue de créditer son auteur, parce que c'est un
  projet de portfolio (SPEC.md §1) et que le lien vers le CV est un choix SEO
  délibéré (2026-09-05). Un lecteur curieux peut te trouver ; la promotion,
  elle, ne te met pas en avant.
- **B — Le site aussi devient anonyme.** Six emplacements à retirer ou
  neutraliser (une demi-journée), plus `/about` à réécrire, plus le README.
  Point juridique précis : la LCEN, art. 6 III 2, autorise un éditeur **non
  professionnel** à ne publier que le nom et l'adresse de son hébergeur, à
  condition de lui avoir communiqué son identité — les pages légales peuvent
  donc être anonymisées légalement, elles n'ont pas à te nommer. Mais B
  défait le lien CV ← site qui était l'objet du pied de page, et le crédit
  Deep dive de SPEC-ADDENDUM-02 §2.

**Tranché par Antoine le 2026-09-13 : option A.** Le site garde son nom ;
la promotion, elle, ne le porte jamais — aucun post, aucun compte, aucun
pitch ne le nomme ni ne renvoie vers le CV.

---

## 1. La ligne de départ, mesurée là où c'était possible

- **Recherche** : la donnée Search Console est lisible par la session
  depuis le 2026-09-14 (`stats.yml`, scope `gsc`). Relevé du jour : **1 clic,
  86 impressions, position moyenne 76** du 15/08 au 11/09, le glossaire
  indexé en position 60-98 sauf trois requêtes (« valeur totale client » en
  4ᵉ, « cross-sell » en 21ᵉ, « airbnb north star metric » en 32ᵉ), et
  Google crédite encore les URL d'avant R-13. Les deux requêtes que
  cette recherche a testées ont une **SERP sans concurrent direct** —
  « diagnostic croissance startup gratuit questionnaire AARRR » ne renvoie
  que des articles explicatifs, aucun outil ; « growth audit template » ne
  renvoie que des audits de site web ou de réseaux sociaux. Ce sont deux
  portes ouvertes.
- **Usage** : `stats/global` valait `count: 4` début septembre ; le chiffre
  du jour est sur `/admin/stats`, que je ne peux pas lire d'ici (mot de
  passe dans Vercel). **Première action de la semaine : relever ce
  tableau** (analyses, partages, K, `take_own_tour`), pour avoir un avant.
- **GitHub** : dépôt public, AGPL, **1 étoile, aucune description, aucun
  topic, homepage `tourdegrowth.vercel.app`** (l'ancienne URL). C'est un
  canal anonyme par construction, et il est vide.
- **Le produit est prêt** : boucle `?ref=` instrumentée, carte de partage
  avec l'action sur l'image, K-factor honnête, 42 URL indexables en deux
  langues, `/metrics` construite et fermée sous 50 soumissions.
- **Ce qui existe déjà pour mesurer** : `scripts/utm-link.mjs` (la
  nomenclature UTM, à mettre à jour — elle contient `linkedin`), GoatCounter
  (referrers + campagnes), `/admin/stats` (funnel complet).

---

## 2. La voix, puisque ce n'est pas la tienne

Sans nom, **c'est le produit qui parle, dans la voix que sa copie a déjà** :
« Où ta croissance cale-t-elle ? », le vocabulaire du Tour (étapes,
peloton, maillot), les deux tons. Concrètement :

- **Un pseudonyme unique**, `tourdegrowth`, sur chaque plateforme (HN,
  Reddit, Indie Hackers, X, Bluesky), créé avec `contact@tourdegrowth.com`
  (l'adresse existe, elle est dans les pages légales). Jamais tes comptes,
  jamais ton prénom dans un pseudo, jamais le lien CV dans une bio.
- **La première personne est permise, le nom non.** « I built this » sur
  Show HN est ce que la communauté attend ; c'est un « je » sans identité,
  pas un « nous » corporate qui sonnerait faux pour un side project.
- **Les cartes de partage sont le contenu.** L'image OG d'un résultat
  (score, étape qui freine, action) et sa version roast sont des visuels
  faits pour un fil — sans photo, sans visage, sans signature. Un compte X
  ou Bluesky qui ne poste *que* des cartes roast anonymisées (les nôtres,
  celles de l'échantillon, celles que des utilisateurs repartagent) a une
  ligne éditoriale sans avoir besoin d'une personne.
- **Le roast est l'angle d'entrée sur Reddit.** Il existe un subreddit
  entier construit sur ce format ([r/roastmystartup](https://www.reddit.com/r/roastmystartup/)),
  et le produit a un mode qui fait exactement ça, avec un garde-fou
  anti-moquerie codé en dur. C'est le seul endroit où « roast mode » est
  un avantage compétitif plutôt qu'un risque.

Ce que la voix ne fait jamais : promettre un résultat chiffré, se comparer
nommément à un concurrent, répondre à une critique en se réfugiant derrière
« l'équipe ». Un side project anonyme qui assume ses limites est crédible ;
une « entreprise » sans nom ne l'est pas.

---

## 3. La carte des canaux, sous les deux contraintes

| Canal | Anonyme ? | Ce que ça demande | Qui fait | Portée attendue |
|---|---|---|---|---|
| **SEO — contenu** (glossaire, pages « checklist », pages « vs ») | Oui, par nature | Écrire, relire, indexer | **Moi** (rédaction), toi (bon à tirer) | Le seul canal qui compose ; 4-8 semaines avant le premier mouvement |
| **SEO — technique** (IndexNow, métadonnées GitHub, liens internes) | Oui | Du code | **Moi** | Faible mais gratuit et permanent |
| **La boucle produit** (badge embarquable, carte téléchargeable, `/metrics`) | Oui | Du code | **Moi** | Le K-factor est le multiplicateur de tout le reste |
| **GitHub** (description, topics, README, listes « awesome ») | Oui si le profil qui contribue n'affiche pas ton nom | 2 min de réglages + des PR externes | Toi (réglages), moi (textes) | Faible, mais c'est là que les fondateurs techniques cherchent « open source AARRR » |
| **Show HN** | Oui (pseudo) | Un compte, être présent 3 h pour répondre | Toi sous pseudo, moi pour le texte et la FAQ | Fort si ça prend, nul sinon ; un seul essai propre |
| **Reddit** — r/SideProject, r/roastmystartup, r/IMadeThis, r/SaaS (1×/60 j), r/startups (fil Feedback Friday), r/growthhacking, r/Entrepreneur | Oui (pseudo) | Un compte **vieilli** (commenter 1-2 semaines avant), un texte par sub | Toi sous pseudo, moi pour les textes | Moyen, cumulatif ; c'est aussi de la preuve sociale pour les annuaires |
| **Indie Hackers** (page produit + post « build log ») | Oui (pseudo) | Un compte | Toi sous pseudo, moi pour le texte | Moyen ; l'audience lit les logs de construction, pas les pitchs |
| **Annuaires** — Uneed, Fazier, MicroLaunch, Peerlist, SaaSHub, AlternativeTo, BetaList, LaunchingNext, DevHunt, Smol Launch, StartupBase ; **annuaires IA** (There's An AI For That, Futurepedia, Toolify) puisque le Deep dive appelle un modèle | Oui, la plupart acceptent un compte de marque | Un e-mail de marque, 15 formulaires, parfois une vérification par mail | **Moi** pour le kit complet ; toi pour cliquer « envoyer » là où un mail de vérification arrive | Chacun un backlink et un filet de visites ; ensemble, un socle |
| **X / Bluesky** (compte de marque) | Oui | Un compte, un rythme (2-3 posts/semaine) | Toi (compte), moi (les cartes et les textes) | Faible au départ ; utile surtout comme point d'ancrage pour les autres canaux |
| **Newsletters growth** (pitch depuis `contact@`) | Oui, signé « l'équipe Tour de Growth » | Un mail par newsletter, 10-15 cibles | Moi (pitch + liste), toi (envoi) | Fort quand une répond, rare |
| **Communautés Slack/Discord FR** (Growth Makers, French Makers Club…) | **Difficile** : un Slack sait qui tu es | — | À écarter sauf sous une identité de marque acceptée | — |
| **Payant** — Reddit Ads, Google Search Ads | Oui (annonceur) | Une carte, 100-200 € de test, **mesure par UTM seulement** (aucun pixel → aucun bandeau de consentement à construire) | Toi (compte), moi (annonces, mots-clés, pages) | À décider sur un signal, jamais avant |
| **Product Hunt** | **Non** en tant que maker (vrai nom exigé) | — | Possible sans maker déclaré : portée faible. Dernier de la liste | — |
| LinkedIn, podcasts, presse, messages directs | Non | — | **Exclus** | — |

Sources vérifiées pour les règles ci-dessus : [Show HN](https://news.ycombinator.com/showhn.html)
(« don't ask friends to upvote », être là pour répondre, pas de page
d'inscription), [r/SaaS](https://www.redditmaster.com/subreddit-rules/saas)
(une autopromotion par 60 jours depuis avril 2026, comptes alternatifs
comptés comme un seul acteur), [r/startups](https://www.redditmaster.com/subreddit-rules/startups)
(fils hebdomadaires uniquement), [r/SideProject](https://www.growreddit.com/blog/reddit-self-promotion-rules-sideproject)
(autopromotion voulue, mais montrer le produit et rendre des retours aux
autres), [annuaires](https://startupbase.io/blog/product-hunt-alternatives)
et [lesquels sont gratuits](https://smollaunch.com/best-of/directories-to-submit-startup-2026).

---

## 4. Le plan, en vagues

Pas des « phases » (le mot est pris par `AUDIT-PLAN.md`) : des vagues, parce
que plusieurs tournent en parallèle et que la seconde ne dépend pas de la
première.

### Vague 0 — Fondations (semaine 1)

*Tout ce qui doit exister avant qu'un seul lien soit posté. Presque tout
est autonome.*

| # | Action | Qui | Détail |
|---|---|---|---|
| 0.1 | **Relever `/admin/stats`** : analyses totales, partages, K, `take_own_tour`, funnel | Toi | L'avant, sans quoi rien ne se mesure. Coller les chiffres ici, §7 | **Depuis le 2026-09-14, la session le fait seule** : `.github/workflows/stats.yml`, rapport chiffré vers une clé éphémère, voir `CLAUDE.md`.
| 0.2 | **Dépôt GitHub** : description (« A 3-minute AARRR growth check-up — deterministic score, roast mode, open source »), homepage `https://www.tourdegrowth.com`, topics (`aarrr`, `growth`, `saas`, `startup`, `nextjs`, `gemini`, `open-source`, `quiz`, `pirate-metrics`) | Toi (2 min, Settings) | Je ne peux pas régler ça par l'API dont je dispose. Le README reste tel quel sous l'hypothèse A |
| 0.3 | **IndexNow** : fichier de clé sous `public/`, workflow GitHub quotidien + manuel qui soumet les 42 URL du sitemap à `api.indexnow.org` (Bing, Yandex, Naver, Seznam en une requête) | **Moi** — PR | **Livré le 2026-09-13** (`.github/workflows/indexnow.yml`, `src/__tests__/indexnow.test.ts`). Google n'utilise pas IndexNow ; Bing/DuckDuckGo si. Gratuit, sans compte, sans secret : la clé est publique par construction. Premier envoi réel à déclencher à la main après le déploiement |
| 0.4 | **Nomenclature UTM** : retirer `linkedin`, `network_dm`, `podcast`, `paid_linkedin` ; ajouter `reddit_sideproject`, `reddit_roastmystartup`, `reddit_imadethis`, `reddit_entrepreneur`, `bluesky`, `directory:<slug>` par annuaire, `newsletter:<slug>` | **Moi** — même PR | **Livré le 2026-09-13** (`scripts/utm-channels.mjs`, testé : un canal exclu ne peut pas revenir). Sans ça, la semaine 2 ne dit pas ce qui a marché (leçon du plan d'août) |
| 0.5 | **Le kit de soumission** : nom, tagline (60 car.), descriptions en 3 longueurs (140 / 300 / 800 car.) × FR + EN, catégories, captures (landing, question, sélecteur de ton, résultat, carte d'aperçu neutre et roast) en 1280 et 390, logo carré 512 depuis `favicon-512.png`, les trois images OG | **Moi** — dossier `marketing/` dans le dépôt | **Livré le 2026-09-13** (`marketing/kit.md`, 22 PNG dans `marketing/assets/`, régénérables par `scripts/kit-screenshots.mjs`). La table des annuaires dit ce qui a été vérifié sur chacun : Launching Next en premier (formulaire sans compte), Futurepedia et Peerlist écartés, Fazier exige un backlink. Copie au statut « à relire » |
| 0.6 | **Les comptes de marque** : HN, Reddit, Indie Hackers, X, Bluesky — pseudo `tourdegrowth`, mail `contact@tourdegrowth.com`, bio = la tagline, lien = le site, **aucun lien vers le CV** | Toi (30 min) | Reddit : commencer à **commenter** tout de suite dans les subs visés — un compte de 3 jours sans karma qui poste un lien est supprimé avant d'être lu |
| 0.7 | **Les textes de la vague 1** : Show HN (titre + premier commentaire + FAQ des 10 objections probables), un post par subreddit dans son ton et sous ses règles, le post Indie Hackers, le fil X/Bluesky (un pilier par post, la carte roast en dernier) | **Moi** — `marketing/` | **Livré le 2026-09-13** (`marketing/launch/{show-hn,reddit,indiehackers,social}.md`). Rien de copié-collé entre communautés ; aucun texte ne nomme l'auteur (vérifié par `grep`). À relire avant de coller |
| 0.8 | **Vérifier la rétention des déploiements Vercel** | Toi | Chaque PR ci-dessous déploie la production (`vercel.json`) |

### Vague 1 — Le lancement anonyme (semaines 2-3)

*Un seul jour, mardi-jeudi, tout ensemble : HN et Reddit se nourrissent
mutuellement dans les premières heures. Tu dois être disponible trois heures
pour répondre sous pseudo — un Show HN silencieux meurt vite.*

| # | Action | Qui | Ce qui compte |
|---|---|---|---|
| 1.1 | **Show HN** — titre du type « Show HN: A 3-minute AARRR growth check-up with a deterministic score (and a roast mode) », URL = le site, texte vide, **premier commentaire** = pourquoi ça existe, ce qui est différent (score déterministe, jamais un modèle qui décide d'un chiffre ; le modèle ne fait que le roast et le Deep dive ; open source AGPL ; bilingue ; zéro compte) | Toi sous pseudo | Répondre à tout pendant 3 h. Ne demander d'upvote à personne (règle HN, et un pattern de vote anormal enterre le post) |
| 1.2 | **r/roastmystartup** — poster **ta propre carte roast** (le résultat de Tour de Growth passé au Tour) : « we built a growth quiz with a roast mode, so we roasted ourselves first » | Toi sous pseudo | Le format du sub, exactement. La carte OG roast est déjà le bon visuel |
| 1.3 | **r/SideProject** et **r/IMadeThis** — ce que c'est, pourquoi, la stack, ce qu'on veut comme retour ; montrer le produit (capture), jamais une page d'inscription — il n'y en a pas | Toi sous pseudo | Rendre des retours à cinq autres projets le même jour : c'est le contrat social du sub |
| 1.4 | **r/startups** (fil Feedback Friday du vendredi) et **r/SaaS** (une fois — les 60 jours suivants sont brûlés, donc le texte doit être le meilleur) | Toi sous pseudo | Pour r/SaaS : le récit d'une décision technique (« why our score is deterministic and the LLM only writes the roast ») avec le produit en arrière-plan, pas en titre |
| 1.5 | **Indie Hackers** — page produit + post « build log » : le K-factor qui ne pouvait pas descendre sous 1 (R2-01), la boucle `?ref=`, le mode Quick sorti du LLM | Toi sous pseudo | IH lit des logs, pas des pitchs. Le dépôt public est un atout : tout est vérifiable |
| 1.6 | **Annuaires** — les 15 du §3, dans l'ordre : ceux qui suivent (dofollow) d'abord (Smol Launch, LaunchingNext, DevHunt), puis Uneed, Fazier, MicroLaunch, Peerlist, StartupBase, BetaList ; SaaSHub et AlternativeTo (positionner comme alternative aux calculateurs de métriques SaaS type FounderPath / SaaS Club Tools, la seule catégorie où quelqu'un pourrait nous chercher) ; les trois annuaires IA | Moi (formulaires sans vérification), toi (clic sur les mails de vérification) | Chaque fiche porte son UTM `directory_<nom>` |
| 1.7 | **X / Bluesky** — le fil de lancement, puis le rythme : une carte roast (anonymisée, ou celle de l'échantillon) tous les 2-3 jours | Toi (poste), moi (fournit) | Pas une source de trafic ; un point d'ancrage que les annuaires et HN demandent |

**Après la vague 1, deux semaines de lecture** : `/admin/stats` + les
referrers GoatCounter, canal par canal. Ce qui a produit zéro Tour est coupé ;
ce qui a produit des Tours **partagés** (pas seulement des Tours) est
redoublé — c'est le K qui compte, pas le trafic.

### Vague 2 — Le référencement qui compose (semaines 2-12, en parallèle, autonome)

*Le seul canal qui n'a besoin de personne pour parler, et le seul dont
l'effet grandit tout seul. Il commence en même temps que la vague 1, pas
après, parce que ce qui est publié maintenant est ce qui apparaît dans deux
mois.*

| # | Action | Détail |
|---|---|---|
| 2.1 | **Deux pages « porte ouverte »** | **Faites le 2026-09-14.** `/{locale}/growth-audit-checklist` (l'ARTEFACT : les 15 points rendus depuis `copy-library.ts`, le barème, comment se noter à la main) et `/{locale}/startup-growth-diagnostic` (la MÉTHODE : par quoi commencer, dans quel ordre, ce qu'un diagnostic doit produire). **Deux écarts au plan, assumés** : (1) chacune existe dans les DEUX langues, à un slug unique, plutôt qu'une page par langue — sinon le jeu hreflang, le sitemap et le sélecteur de langue mentiraient tous les trois ; (2) les slugs restent anglais dans les deux langues, R2-16 ayant déjà tranché contre les slugs localisés. Elles répondent à deux intentions DIFFÉRENTES et se lient l'une à l'autre : deux variantes du même texte auraient fait deux quasi-doublons. Copie neuve → « à relire » |
| 2.2 | **Dix termes de glossaire de plus**, choisis sur les requêtes que les pages actuelles frôlent | **FAIT le 2026-09-14**, en trois lots : `activation-rate`, `cac-payback`, `nrr-grr`, `cohort-analysis` — choisis sur le rapport Search Console du jour, qui montre que ce qui atteint ces pages sont des recherches définitionnelles courtes (« activation », « what is an activation », « définition ltv »), donc chacun est l'enfant d'une page qui reçoit déjà des impressions. **Deux écarts à la liste ci-dessus** : « expansion revenue » retiré (la page `upsell-cross-sell` le couvre déjà — ç'aurait été le quasi-doublon que 2.1 a évité), remplacé par **ARPU** ; « growth loop vs funnel » part en 2.3, où vit le cluster comparatif, remplacé par **NPS**. Les dix : `activation-rate`, `cac-payback`, `nrr-grr`, `cohort-analysis` (lot 1) ; `dau-mau`, `time-to-value`, `pql` (lot 2) ; `product-led-growth`, `arpu`, `nps` (lot 3). **Le glossaire passe de 15 à 25 termes, soit 50 pages indexables dans les deux langues.** Point à connaître pour la suite : le maillage est presque saturé (plafond de 2-4 liens par terme, un seul créneau libre restant sur `aarrr`), donc tout nouveau terme obtiendra ses liens entrants par échange. Même structure que les 15 existants, 500 mots minimum par langue — le test existe déjà, et mesure 909-1 160 sur le lot 1. Copie neuve → « à relire » |
| 2.3 | **Un cluster « frameworks comparés »** : AARRR vs North Star, AARRR vs RARRA, AARRR vs growth loops, AARRR vs OKR — le concurrent le mieux placé sur « AARRR » en anglais se classe précisément avec des pages « X vs Y » | 4 pages × 2 langues, courtes (600-800 mots), chacune finissant sur « mesure la tienne » |
| 2.4 | **Maillage** : chaque nouvelle page reçoit un lien depuis au moins deux pages existantes | **Appliqué d'emblée pour 2.1** : la checklist a son lien de pied de page (donc un chemin constant depuis n'importe où) plus un lien depuis `/how-it-works` et un depuis la page méthode ; la page méthode en a deux (`/how-it-works` et la checklist) et sort vers les cinq pages de pilier. Un pied de page à sept liens cesse d'en mettre aucun en avant — d'où une seule des deux |
| 2.5 | **Le benchmark des pratiques** — dès que `stats/global` ≥ 50 : ouvrir `/metrics` (`METRICS_PAGE_ENABLED`) et publier une page narrative « l'étape qui freine le plus souvent » (C2 de `REVIEW-03.md`) | La seule donnée que personne d'autre ne peut publier : tous les benchmarks mesurent des résultats, aucun ne mesure les *pratiques* du pré-1 M$. Immunisée au problème de définition puisque l'échelle est la nôtre. Et c'est un vrai lien à obtenir |
| 2.6 | **Bing Webmaster Tools** | **Fait le 2026-09-14** par Antoine. IndexNow suffisait à l'indexation ; ceci ajoute la mesure côté Bing, en plus de la Search Console côté Google |
| 2.7 | **Search Console** : soit réactiver l'accès SEO Gets, soit m'exporter les requêtes toutes les deux semaines | Sans ça, 2.2 et 2.3 se choisissent au jugé. Avec, on écrit ce que Google frôle déjà | **Réglé le 2026-09-14** : le même workflow lit la Search Console par compte de service (`scripts/gsc-report.mjs`), plus d'export à faire — premier rapport réel le jour même, une fois l'API activée sur le projet Cloud.

### Vague 3 — La boucle produit (en parallèle, autonome, du code)

*Ces chantiers ne demandent pas d'audience : ils font mieux convertir et
mieux repartager celle qui vient. Chacun est une PR avec ses specs, comme
d'habitude.*

| # | Action | Pourquoi |
|---|---|---|
| 3.1 | **Badge embarquable** `/r/<id>/badge.svg` (« Tour de Growth · 74/100 », style shields) + snippet Markdown « ajoute-le à ton README » sur la page de résultat du **propriétaire** | La cible d'HN et d'Indie Hackers vit sur GitHub ; un badge dans un README est un lien permanent, anonyme, et un `?ref=` qui travaille tout seul. Public par nature : le score l'est déjà via l'OG |
| 3.2 | **Le partage natif emporte l'image** (`navigator.share` avec `files`) là où c'est supporté, au lieu du seul lien | Sur mobile, une image partagée dans WhatsApp/iMessage/Slack s'ouvre ; un lien nu se lit moins. La carte existe déjà |
| 3.3 | **Une page « exemple roast »** `/r/sample?tone=roast` ou un second échantillon roast, pour que la landing et les posts aient une carte roast **canonique** à montrer sans exposer un vrai résultat | Aujourd'hui l'échantillon est neutre ; le toggle de la landing change une phrase, pas la carte partagée |
| 3.4 | **Percentile** (« mieux que X % des Tours ») — **pas avant quelques centaines** de soumissions | L'accroche compétitive la plus forte, malhonnête sous ce volume. Noté ici, déclenché par `/admin/stats` |

### Vague 4 — Le seeding sans visage (mois 2-3)

| # | Action | Qui |
|---|---|---|
| 4.1 | **Pitch de newsletters** growth / SaaS / PM (10-15 : Growth Unhinged, Demand Curve, Product-Led Alliance, Elena Verna, Lenny's « tools » mentions ; côté FR : Growth Makers, Kiosque, GrowthList, Le Growth Club) — depuis `contact@`, signé « l'équipe Tour de Growth », un paragraphe, le lien, **et leur propre résultat** : passer le produit de l'auteur au Tour honnêtement (réponses publiques réelles, jamais devinées) et joindre la carte | Moi (pitchs + les Tours), toi (envoi) |
| 4.2 | **Listes « awesome »** sur GitHub (awesome-growth-hacking, awesome-saas-tools, awesome-product-management, awesome-indie) : une PR par liste, une ligne, sans adjectif | Moi (textes) ; la PR part de **ton** compte GitHub — donc **seulement si ton profil n'affiche pas ton nom** (à vérifier sur github.com/ScratchMe avant), sinon on écarte |
| 4.3 | **Répondre aux vraies questions** sur Reddit et Indie Hackers (« how do I audit my growth », « what metrics should I track pre-PMF ») — la réponse complète d'abord, l'outil en une ligne, déclaré comme le nôtre | Toi sous pseudo, au fil de l'eau ; je peux fournir une veille hebdomadaire de fils à répondre |
| 4.4 | **Échanges avec des outils adjacents** (onboarding, analytics légère, CRM indie) : un lien contre un lien, depuis `contact@` | Toi |

### Vague 5 — Payant (mois 3+, uniquement sur un signal)

Un test de **100-200 €** sur Reddit Ads (r/SaaS, r/startups, r/Entrepreneur)
et/ou Google Search Ads sur les **deux ou trois requêtes** que la vague 2
aura montrées convertir — jamais un pari large. Annonceur = la marque,
anonyme par nature. **Mesure par UTM et GoatCounter uniquement, sans pixel
de conversion** : c'est ce qui évite le bandeau de consentement que le plan
d'août signalait comme le vrai coût du payant. Le prix : pas de retargeting,
pas d'optimisation automatique des enchères — acceptable pour un test.

### La fenêtre Tour de France 2027 (R2-30 de `REVIEW-02.md`)

Le Grand Départ 2027 est le **vendredi 2 juillet à Édimbourg** ([Wikipédia](https://fr.wikipedia.org/wiki/Tour_de_France_2027)),
trois semaines jusqu'au 25 juillet. C'est la seule fenêtre où le nom du
produit fait le travail tout seul : une deuxième vague de lancement calée
sur « Grand Départ » (HN, Reddit, X : un post par étape-clé, « maillot à
pois » pour la meilleure rétention…), la landing habillée pour trois
semaines, et une page « Étape du jour » si le volume le justifie. **À
construire en juin 2027**, pour que ça parte pendant le vrai Tour, pas
après. Aucun code à écrire aujourd'hui ; une ligne ici pour ne pas l'oublier.

---

## 5. Ce que je peux mener seul, ce qui demande un clic de toi, ce qui est exclu

**Seul, sans rien te demander** (chaque item = une PR vérifiée, ou un
fichier dans `marketing/`) :

- 0.3 IndexNow · 0.4 nomenclature UTM · 0.5 kit de soumission · 0.7 tous
  les textes de lancement · 2.1 à 2.4 tout le contenu SEO (au statut « à
  relire ») · 2.5 la page benchmark quand le seuil est atteint · 3.1 à 3.3
  les trois chantiers produit · 4.1 les pitchs et les Tours des auteurs de
  newsletters · 4.3 la veille hebdomadaire de fils à répondre.

**Un clic ou un compte de toi, le reste est prêt** :

- 0.1 le relevé de `/admin/stats` · 0.2 les réglages GitHub · 0.6 les cinq
  comptes de marque · 0.8 la rétention Vercel · 1.1 à 1.5 poster, sous
  pseudo, et répondre · 1.6 les mails de vérification des annuaires · 1.7 X
  et Bluesky · 2.6 Bing Webmaster · 2.7 l'accès Search Console · 4.1 l'envoi
  des pitchs · 5 la carte bancaire du test payant.

**Ce que je ne peux pas faire, et pourquoi c'est mieux ainsi** : créer des
comptes (vérification par mail, CAPTCHA, et des conditions d'utilisation qui
interdisent l'automatisation), poster sur Reddit ou HN à ta place (un compte
piloté par un agent est le motif de bannissement le plus courant, et il
brûlerait le pseudonyme pour de bon), envoyer des mails (aucune boîte que je
lise). Tout ce que je prépare est écrit pour être collé tel quel.

---

## 6. Mesure et règle de coupe

- **Chaque lien sortant porte un UTM** de `scripts/utm-link.mjs`, jamais
  tapé à la main (leçon du plan d'août : une nomenclature bricolée fragmente
  un canal en cinq lignes).
- **Lecture hebdomadaire**, le lundi : `/admin/stats` (analyses, partages,
  K, `take_own_tour`, funnel) et les referrers/campagnes GoatCounter.
- **Le chiffre qui décide n'est pas le trafic mais les Tours partagés** :
  un canal qui amène 200 visiteurs et zéro partage vaut moins qu'un canal
  qui en amène 20 dont 4 partagent — le second alimente le K, le premier
  non.
- **Règle de coupe** : deux à quatre semaines après la vague 1, tout canal à
  zéro Tour est abandonné, tout canal à Tours partagés est redoublé. Un plan
  comme celui-ci vaut par ce qu'il coupe, pas par ce qu'il maintient.
- **Le SEO ne se juge pas à quatre semaines** : première lecture sérieuse à
  huit, sur les impressions et les positions, pas sur les clics.

---

## 7. Journal

| Date | Ce qui a été fait | Chiffres |
|---|---|---|
| 2026-09-13 | Plan écrit. Baseline connue : 1 clic / ~50 impressions GSC (15/08-04/09), `stats/global` = 4 début septembre, GitHub 1 étoile sans description | À relever : `/admin/stats` du jour |
| 2026-09-13 | Option A tranchée (site signé, promotion anonyme). Vague 0 : IndexNow (clé + workflow quotidien) et vocabulaire UTM refait sans `linkedin`, avec familles ouvertes `directory:`/`newsletter:` | — |
| 2026-09-14 | Bing Webmaster Tools branché (2.6). Comptes de marque créés ; Antoine lance les communications de la vague 1. Search Console lisible par la session depuis le workflow chiffré (2.7) | — |
| 2026-09-13 | Premier envoi IndexNow réel : 42 URL, **HTTP 202** de `api.indexnow.org` (run nº1 du workflow, déclenché à la main). Kit de soumission et textes de lancement livrés dans `marketing/` ; reste de la vague 0 côté Antoine : relevé de `/admin/stats`, réglages GitHub, comptes de marque, rétention Vercel | — |
| 2026-09-14 | **0.1 relevé** par la session elle-même (`stats.yml`, deux runs, rapport déchiffré). Les chiffres restent dans la conversation et non ici : ce document est public, le tableau de bord ne l'est pas, et la ligne de départ se recalcule par date. Réglages GitHub et rétention Vercel faits. 2.7 réglé dans l'heure : API activée, premier rapport Search Console lu par la session | Ligne de départ : un site que personne n'a encore trouvé — tout le funnel est mesuré, à un chiffre. Recherche : 1 clic / 86 impressions / position 76 sur 28 jours, Google crédite encore les URL d'avant R-13 |

---

## 8. Risques

| Risque | Parade |
|---|---|
| **Le nom fuit quand même** — pied de page, `/about`, README, JSON-LD | C'est la question A/B du §0 : à trancher avant la vague 1, pas après une capture d'écran sur HN |
| **Comptes Reddit supprimés** (âge, karma, lien trop tôt) | Créer les comptes en semaine 1, commenter sans lien pendant 1-2 semaines, un seul compte par plateforme (r/SaaS compte les alternatifs comme un acteur) |
| **Show HN silencieux** | Un seul essai, bien préparé, un jour où tu as trois heures ; pas de second Show HN pour le même produit sans refonte majeure |
| **Un pic de trafic pendant une panne Gemini** | Le mode Quick n'appelle plus Gemini : la landing, le quiz et le résultat tiennent ; seul le Deep dive tombe, et son écran d'erreur rejoue la requête. La limite de débit en mémoire (R-15) est le seul point faible — acceptable pour un pic HN |
| **Copie publiée sans relecture** | Tout texte nouveau part « à relire » ; les pages SEO peuvent vivre marquées (le glossaire long l'a fait), les posts publics **non** : ils passent par toi avant d'être collés |
| **Six PR déploient six fois la production** | Rétention Vercel en place avant (0.8), merges espacés |
| **Le plan s'oublie** | Ce fichier ; le journal du §7 ; l'entrée `CLAUDE.md` à chaque vague |
