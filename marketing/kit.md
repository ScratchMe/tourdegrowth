# Le kit — identité, textes courts, liens, annuaires

*TODO: à relire (convention 6). Copie neuve, à passer par Antoine avant
qu'un seul champ de formulaire soit rempli.*

## Identité

| Champ | Valeur |
|---|---|
| Nom | **Tour de Growth** |
| URL canonique | `https://www.tourdegrowth.com` |
| Contact | `contact@tourdegrowth.com` |
| Pseudonyme partout | `tourdegrowth` |
| Licence | AGPL-3.0, code public : `https://github.com/ScratchMe/tourdegrowth` |
| Logo | `public/favicon-512.png` (carré, fond papier), `public/favicon.svg` |
| Couleurs | papier `#fbf9f2` / encre `#211c15` / rouge `#d2402c` |
| Langues | EN, FR — le résultat partagé se lit dans la langue du lecteur |
| Prix | Gratuit, sans compte, sans e-mail |
| Catégories | Marketing · Growth · Analytics · Startup tools · SaaS · Productivity ; annuaires IA : « AI for business / marketing » (le Deep dive appelle un modèle) |
| Tags | `aarrr`, `growth`, `pirate-metrics`, `startup`, `saas`, `quiz`, `diagnostic`, `open-source`, `free-tool`, `founders` |

## Tagline (≤ 60 caractères)

- **EN** : `A 3-minute AARRR growth check-up, with a roast mode.` (52)
- **FR** : `Le diagnostic growth AARRR en 3 minutes, mode roast inclus.` (59)
- Alternative EN, plus courte : `Where does your growth stall? Find out in 3 minutes.` (52)

## Description — 140 caractères

- **EN** : `15 questions, 3 minutes, a growth score out of 100 across the five AARRR stages — and the one next move to take. Free, no sign-up.` (130)
- **FR** : `15 questions, 3 minutes, un score growth sur 100 sur les cinq étapes AARRR — et la prochaine action à mener. Gratuit, sans compte.` (130)

## Description — 300 caractères

- **EN** : `Tour de Growth is a free, 3-minute growth check-up for founders and product teams. Fifteen questions across Acquisition, Activation, Retention, Referral and Revenue; a deterministic score out of 100; the one stage holding you back and one concrete next move. Two tones: straight up, or roast.` (292)
- **FR** : `Tour de Growth est un diagnostic growth gratuit en 3 minutes pour fondateurs et équipes produit. Quinze questions sur l'Acquisition, l'Activation, la Retention, le Referral et le Revenue ; un score déterministe sur 100 ; l'étape qui te freine et une action concrète. Deux tons : neutre, ou roast.` (296)

## Description — 800 caractères

- **EN** : `Growth rarely stalls everywhere at once. It stalls at one stage, and the four that work keep hiding it. Tour de Growth is a free, 3-minute check-up built on the AARRR framework: fifteen questions about how your product acquires, activates, retains, refers and monetises. The score out of 100 is deterministic, and the result page shows the arithmetic, so a shared score can be re-explained in ten seconds. You leave with the one stage holding you back and one next move written for the answer you actually gave. Pick your tone: straight up, or a roast that goes after the strategy, never the person. An optional Deep dive asks ten more questions and returns recommendations per stage. No account, no e-mail, cookie-free analytics, open source (AGPL), in English and French.` (773)
- **FR** : `La croissance cale rarement partout à la fois. Elle cale à une étape, et les quatre qui marchent la masquent. Tour de Growth est un diagnostic gratuit en 3 minutes bâti sur le cadre AARRR : quinze questions sur la façon dont ton produit acquiert, active, retient, fait recommander et monétise. Le score sur 100 est déterministe, et la page de résultat montre le calcul : un score partagé se ré-explique en dix secondes. Tu repars avec l'étape qui te freine et une action écrite pour la réponse que tu as réellement donnée. Choisis ton ton : neutre, ou un roast qui vise la stratégie, jamais la personne. Un Deep dive optionnel pose dix questions de plus et renvoie des recommandations par étape. Sans compte, sans e-mail, analytics sans cookie, open source (AGPL), en français et en anglais.` (791)

## Les faits qu'on peut avancer (tous vérifiables dans le dépôt)

- Le score n'est jamais décidé par un modèle : `src/lib/scoring/score.ts`, pur, testé ; 20 / 7 / 0 points par réponse, arrondi par étape avant la somme.
- Le modèle (Gemini, avec une chaîne de repli sur quatre versions) n'écrit que le **Deep dive** ; le résultat rapide, **roast compris**, est une bibliothèque de textes relus (`src/content/copy-library.ts`), servie sans appel réseau.
- Le roast vise la stratégie, jamais la personne : la règle est codée en dur dans le prompt du Deep dive, et tenue par relecture dans les phrases pré-écrites du résultat rapide.
- Un résultat partagé se rend dans la **langue du lecteur**, pas de l'auteur ; l'image de partage porte le score, l'étape qui freine et l'action.
- Aucun compte, aucun e-mail : les réponses du Tour sont envoyées pour calculer le score et gardées avec le résultat, sous un identifiant impossible à deviner, sans aucune donnée d'identité (`src/lib/submissions/types.ts`, pages légales). *Corrigé le 2026-09-24 : la version précédente disait qu'elles « ne quittent le navigateur que pour calculer le score », ce qui laissait entendre qu'elles ne sont pas gardées.* GoatCounter sans cookie ; pages légales complètes.
- Open source, AGPL-3.0, 700+ tests unitaires et 280+ specs Playwright en CI.
- Le glossaire : 24 termes AARRR expliqués longuement dans les deux langues, avec pour chacun la question du Tour qui le mesure.

**À ne pas avancer** : un nombre d'utilisateurs, un pourcentage de quoi que ce soit, une comparaison nommée à un concurrent, une promesse chiffrée d'amélioration.

---

## Le moteur de croissance (lancement B)

*TODO: à relire. Ajouté le 2026-09-24. Les descriptions 140/300/800 et les
textes prêts à coller sont dans `campaigns/engine/` ; ce bloc ne garde que ce
qui sert à **vérifier** un texte avant de le poster.*

| Champ | Valeur |
|---|---|
| Nom | **Moteur de croissance** / **Growth engine** |
| URL | `/fr/aarrr-funnel-template`, `/en/aarrr-funnel-template` — définitive une fois ouverte (une URL publiée ne meurt pas ici) |
| Portier | Bon à tirer nº6 signé, puis `ENGINE_ENABLED` ; d'ici là, prévisualisation seule (`?engine=preview`) |
| Campagne UTM | `launch_engine` (`--campaign launch_engine`) |
| Catégories | Analytics · Productivity · SaaS tools · Startup tools · Marketing — **jamais** un annuaire d'IA |

**Les faits qu'on peut avancer** — chacun porte sa preuve ; **[portier]** veut
dire « spécifié, pas encore sur `main` au 2026-09-24 », et le texte qui
l'utilise attend que la case soit cochée dans `campaigns/engine/show-hn.md`.

- Quinze chiffres, trois par étape AARRR, saisis **en comptes** (numérateur et
  dénominateur), pas en pourcentages. **[portier]** spec du moteur.
- La vue principale suit **100 inscrits sur une même base** ; aucune chaîne de
  taux multipliés. **[portier]**
- Une étape n'est appelée « la fuite » que contre une cible fixée par
  l'utilisateur, ou contre l'une des **deux** fourchettes du glossaire relues
  (activation 20-40 %, churn de clients 1-2 % par mois), réserve imprimée sur
  la slide. **[portier]** — décision 5 du 2026-09-24.
- Chaque chiffre introuvable devient un constat, avec un coût de réparation.
  **[portier]**
- Export de 4 à 7 slides : PDF (impression du navigateur), une image PNG par
  slide (`html-to-image`, chargé au clic — déjà dans `package.json`), ou texte
  avec notes d'orateur. **Pas de PowerPoint.** **[portier]**
- Aucune IA : aucun import de `lib/gemini` dans l'outil. **[portier]**
  `src/__tests__/engine-boundary.test.ts`.
- **Rien de ce qui est saisi ne quitte le navigateur** : spec canari et
  balayage statique. **[portier]** `e2e/engine-canary.spec.ts` — le même
  mécanisme passe déjà pour `/admin/audit` (`e2e/audit-canary.spec.ts`).
  Seuls partent des pages vues et des noms d'événements d'une liste fermée
  (`engine_opened`, `engine_stage_saved/<étape>`, `engine_deck_opened`,
  `engine_exported/<format>`…), jamais une valeur.
- Aucune fonction serveur nouvelle : une page prérendue et un îlot client.
  **[portier]**
- Le crédit « tourdegrowth.com » en pied de slide est **activé par défaut et
  retirable** (décision 2 du 2026-09-24).
- La slide « déclaré × mesuré », qui croise avec le Tour, existe mais est
  **décochée par défaut** (décision 4).

**À ne pas avancer** :
- que le moteur couvre le B2B piloté par les ventes, les applis grand public
  ou les places de marché — la v1 ne couvre que le **SaaS en libre-service**
  (freemium ou essai) ;
- un « benchmark » : il n'y en a pas, seulement deux fourchettes publiées et
  la cible de l'équipe ;
- une taille de bibliothèque (« ~7 Ko ») tant qu'elle n'est pas remesurée sur
  le build livré ;
- que les slides « convaincront » un comité, ou tout gain chiffré ;
- un export PowerPoint, même « bientôt ».

---

## Le côté obscur (lancement C)

*TODO: à relire. Ajouté le 2026-09-24. Textes prêts à coller dans
`campaigns/game/`.*

| Champ | Valeur |
|---|---|
| Nom | **Le côté obscur** ; le niveau 1 : « S'ils reviennent » / « If they come back » (nom anglais du jeu à confirmer avec la copie livrée — GAME-BRIEF §8.2) |
| URL | `/fr/game`, `/en/game` (le hub), `/fr/game/retention`, `/en/game/retention` (le niveau) — les posts pointent vers le niveau |
| Portier | Recette signée (GAME-BRIEF §7.3), relecture juridique du catalogue, puis `GAME_ENABLED` et redéploiement |
| Campagne UTM | `launch_game` (`--campaign launch_game`) |
| Catégories | Education · Games · Design · Privacy · Product management — jamais un annuaire d'IA |

**Les faits qu'on peut avancer** :

- Tu joues le PM growth d'une appli de streaming **fictive** (Flixo), une
  année en quatre trimestres, deux chantiers par trimestre ; le DG appelle en
  visio et ordonne une astuce à partir du deuxième trimestre. `GAME-BRIEF.md`
  §5.1-5.2, §5.10 ; **[portier]** `src/lib/game/`.
- Les cartes portent des noms de réunion et **aucun chiffre** avant d'être
  jouées. GAME-BRIEF §4, §5.5.
- La confiance des abonnés et le radar de la DGCCRF sont sur le tableau de
  bord, **floutés jusqu'en décembre**. GAME-BRIEF §5.3.
- Décembre nomme **les huit** pratiques, qu'on les ait utilisées ou non :
  obstruction, action forcée, harcèlement d'interface, confirmshaming, fausse
  preuve sociale, coût caché, présélection et interférence visuelle, design
  addictif — avec la loi, un cas public et le repère. GAME-BRIEF §5.5,
  §5.11 ; **[portier]** relecture juridique.
- **On peut gagner sans une seule astuce** (la fin « Tu as tenu. Et ça a
  marché. ») ; trois des sept fins sont propres, dont deux gagnantes.
  GAME-BRIEF §5.11 ; à vérifier sur la production avant le post.
- La voix du DG est la synthèse vocale du navigateur, **facultative** ; les
  sous-titres sont toujours affichés. GAME-BRIEF §5.10, §9.7.
- Jeu 100 % navigateur : aucune fonction serveur, aucune lecture Firestore,
  sauvegarde dans `localStorage`. GAME-BRIEF §9.1, §9.5 ; **[portier]**.
- Le seul partage est « Copier un lien avec ton résultat » ; aucune
  inscription, aucune capture d'e-mail en fin de partie.
- Français et anglais.
- Les accroches légales, avec leur source : résiliation « en trois clics »
  obligatoire en France depuis le 1ᵉʳ juin 2023 (article L215-1-1 du Code de
  la consommation) ; interfaces trompeuses interdites aux plateformes par le
  DSA (article 25).

**À ne pas avancer** :
- **le nom d'une entreprise réelle**, dans aucun post, même condamnée, même
  sourcée : les cas publics vivent dans le catalogue du jeu, relus
  juridiquement, et nulle part ailleurs ;
- qu'une appli existante « utilise des dark patterns » ;
- que le jeu est « scientifiquement validé » ou « prouvé » : la méthode
  d'inoculation est étudiée pour la désinformation (Bad News, Cranky Uncle),
  **pas** ce jeu ;
- les chiffres du jeu comme ceux d'une étude : « chiffres du jeu, modèle
  simple écrit dans le code » ;
- une date pour le Digital Fairness Act : il est « attendu fin 2026 », rien
  de plus ;
- « vingt minutes » tant que la recette ne l'a pas mesuré (décision 5 du
  2026-09-24) ;
- un mode classe, un guide enseignant ou une offre entreprise : hors
  première version ;
- les quatre autres niveaux comme s'ils étaient jouables : ils sont
  esquissés, seul « S'ils reviennent » l'est.

## Les liens, déjà tagués

Générés par `node scripts/utm-link.mjs` ; refaire avec le script si un chemin change.

| Usage | Lien |
|---|---|
| Show HN | `https://www.tourdegrowth.com/en?utm_source=hackernews&utm_campaign=launch_week` |
| r/SideProject | `https://www.tourdegrowth.com/en?utm_source=reddit_sideproject&utm_campaign=launch_week` |
| r/roastmystartup | `https://www.tourdegrowth.com/en?utm_source=reddit_roastmystartup&utm_campaign=launch_week` |
| r/IMadeThis | `https://www.tourdegrowth.com/en?utm_source=reddit_imadethis&utm_campaign=launch_week` |
| r/startups (Feedback Friday) | `https://www.tourdegrowth.com/en?utm_source=reddit_startups&utm_campaign=launch_week` |
| r/SaaS | `https://www.tourdegrowth.com/en?utm_source=reddit_saas&utm_campaign=launch_week` |
| r/growthhacking | `https://www.tourdegrowth.com/en?utm_source=reddit_growthhacking&utm_campaign=launch_week` |
| r/Entrepreneur | `https://www.tourdegrowth.com/en?utm_source=reddit_entrepreneur&utm_campaign=launch_week` |
| Indie Hackers | `https://www.tourdegrowth.com/en?utm_source=indiehackers&utm_campaign=launch_week` |
| X | `https://www.tourdegrowth.com/en?utm_source=twitter&utm_campaign=launch_week` |
| Bluesky | `https://www.tourdegrowth.com/en?utm_source=bluesky&utm_campaign=launch_week` |
| Annuaire *x* | `node scripts/utm-link.mjs directory:<slug> /en` → `…?utm_source=directory_<slug>&utm_campaign=directories` |
| Newsletter *x* | `node scripts/utm-link.mjs newsletter:<slug> /en` |

Pour un public francophone, remplacer `/en` par `/fr` (même UTM).

**Les lancements B et C** gardent les mêmes sources mais portent leur propre
campagne, pour se lire séparément dans GoatCounter : ajouter
`--campaign launch_engine` ou `--campaign launch_game` (ou `relaunch_tour`
pour la relance du Tour), par exemple
`node scripts/utm-link.mjs hackernews /en/game/retention --campaign launch_game`.
Un nom de campagne inconnu est refusé par le script plutôt que de fragmenter
les lignes du tableau de bord (`scripts/utm-channels.mjs`).

## Les annuaires — ce qui a été vérifié le 2026-09-13

Vérifié en ouvrant la page de soumission depuis la session (quand elle se
laissait ouvrir) ; le reste est à confirmer au moment de remplir.

| Annuaire | Page | Compte ? | Gratuit ? | Ce qu'il demande | Verdict |
|---|---|---|---|---|---|
| **Launching Next** | `launchingnext.com/submit/` | Non (un e-mail) | Oui ; 99 $ pour passer en 1 jour | Nom, URL, titre 5-8 mots, description ≤ 2 500 car., 5-10 tags, type « side project », budget marketing 90 j, **nom + e-mail du soumetteur** | **Premier à faire.** Soumetteur : « Tour de Growth », `contact@` |
| **Uneed** | `uneed.best/submit-a-tool` | Pas pour commencer ; inscription pour enregistrer | Oui (file d'attente) ; « fast-track » payant | Nom + URL, le reste est aspiré de la page | À faire ; l'inscription se fait avec `contact@` |
| **Fazier** | `fazier.com/submit` | Probable | Oui (« reviewed & listed within 30 days ») ; 29 / 49 / 139 $ | Le formulaire n'était pas visible ; le plan gratuit **exige un backlink** vers Fazier | À faire si le backlink retour est acceptable (un lien dans le pied de page ? non — plutôt dans `/about`, ou refuser) |
| **BetaList** | `betalist.com/submit` | **Oui** (X ou lien magique) | Oui + option payante | Non vu (page de connexion) | À faire avec le compte de marque X |
| **Smol Launch** | `smollaunch.com` | À vérifier | Annoncé gratuit et dofollow | À vérifier | À faire |
| **DevHunt** | `devhunt.org` | Compte GitHub | Gratuit | Outils pour développeurs | **Écarter sauf sous un compte GitHub de marque** : le compte `ScratchMe` est le dépôt de l'auteur |
| **StartupBase** | `startupbase.io` | Probable | Gratuit | À vérifier | À faire |
| **SaaSHub** | `saashub.com/submit` | À vérifier (la page refuse les robots) | Gratuit ; le dofollow est payant | Nom, URL, catégories, **alternatives** | À faire ; positionner en alternative aux calculateurs de métriques SaaS (FounderPath, SaaS Club Tools) |
| **AlternativeTo** | `alternativeto.net` | **Oui** | Gratuit | Fiche + « alternative à » | À faire, même positionnement |
| **MicroLaunch** | `microlaunch.net` | Oui | La page ne montre que l'offre Pro à 39 $ | — | **Vérifier s'il reste une file gratuite ; sinon écarter** |
| **Peerlist Launch** | `peerlist.io` | **Profil personnel** | Gratuit | — | **Écarter** : c'est un réseau de personnes, un profil de marque y sonne faux |
| **There's An AI For That** | `theresanaiforthat.com/submit/` | À vérifier (la page refuse les robots) | Historiquement payant pour un passage rapide | — | À vérifier ; n'y aller que si une file gratuite existe |
| **Futurepedia** | `futurepedia.io/submit-tool` | — | **Non** : 247 $ (épuisé) / 497 $ | — | **Écarter** |
| **Toolify** | `toolify.ai` | À vérifier | À vérifier | — | À vérifier en dernier |
| **Product Hunt** | — | Vrai nom exigé pour un maker | — | — | Dernier de la liste, sans maker déclaré, si jamais |

Règle pour tous : le champ « description » reçoit la version 300 (ou 140 si
le champ est court), le champ « tagline » la tagline, le lien est celui de
la famille `directory:<slug>`, et le logo est `favicon-512.png`. Aucun champ
« fondateur » ne reçoit un nom : « Tour de Growth » ou vide.

## Les captures (`assets/`)

| Fichier | Quoi | Usage |
|---|---|---|
| `01-landing-{en,fr}-{desktop,mobile}.png` | La landing avec la carte d'aperçu | Capture principale des annuaires |
| `02-question-{en,fr}-{desktop,mobile}.png` | La première question du Tour | « Comment ça marche » |
| `03-tone-{en,fr}-desktop.png`, `03-tone-en-mobile.png` | Le sélecteur de ton (neutre / roast) | Le différenciateur |
| `04-result-{en,fr}-{desktop,mobile}.png` | Le résultat d'exemple (74/100, Retention 8/20, action) | Ce qu'on obtient |
| `05-preview-card-{neutral,roast}-{en,fr}.png` | La carte d'aperçu seule, dans les deux tons | Visuel carré-ish pour X / Bluesky et les fiches |
| `og-en.png`, `og-fr.png` | L'image de partage de la landing (1200×630) | Bannière des annuaires qui en demandent une |
| `og-r-sample.png` | L'image de partage d'un résultat | Montrer ce qu'un partage produit |

Toutes en 2× (2560 px de large en desktop, 780 en mobile), PNG palette.
