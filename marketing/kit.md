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
| Licence | AGPL-3.0, code public : `https://github.com/ScratchMe/tourdegrowth` |
| Logo | `public/favicon-512.png` (carré, fond papier), `public/favicon.svg` |
| Couleurs | papier `#fbf9f2` / encre `#211c15` / rouge `#d2402c` |
| Langues | EN, FR — le résultat partagé se lit dans la langue du lecteur |
| Prix | Gratuit, sans compte, sans e-mail |
| Catégories | Marketing · Growth · Analytics · Startup tools · SaaS · Productivity ; annuaires IA : « AI for business / marketing » (le Deep dive appelle un modèle) |
| Tags | `aarrr`, `growth`, `pirate-metrics`, `startup`, `saas`, `quiz`, `diagnostic`, `open-source`, `free-tool`, `founders` |

## Tagline (≤ 60 caractères)

- **EN** : `A 3-minute AARRR growth check-up, with a roast mode.` (52)
- **FR** : `Le diagnostic growth AARRR en 3 minutes, mode roast inclus.` (58)
- Alternative EN, plus courte : `Where does your growth stall? Find out in 3 minutes.` (51)

## Description — 140 caractères

- **EN** : `15 questions, 3 minutes, a growth score out of 100 across the five AARRR stages — and the one next move to take. Free, no sign-up.` (130)
- **FR** : `15 questions, 3 minutes, un score growth sur 100 sur les cinq étapes AARRR — et la prochaine action à mener. Gratuit, sans compte.` (129)

## Description — 300 caractères

- **EN** : `Tour de Growth is a free, 3-minute growth check-up for founders and product teams. Fifteen questions across Acquisition, Activation, Retention, Referral and Revenue; a deterministic score out of 100; the one stage holding you back and one concrete next move. Two tones: straight up, or roast.` (296)
- **FR** : `Tour de Growth est un diagnostic growth gratuit en 3 minutes pour fondateurs et équipes produit. Quinze questions sur l'Acquisition, l'Activation, la Retention, le Referral et le Revenue ; un score déterministe sur 100 ; l'étape qui te freine et une action concrète. Deux tons : neutre, ou roast.` (298)

## Description — 800 caractères

- **EN** : `Growth rarely stalls everywhere at once. It stalls at one stage, and the four that work keep hiding it. Tour de Growth is a free, 3-minute check-up built on the AARRR framework: fifteen questions about how your product acquires, activates, retains, refers and monetises, each with three honest answers. The score out of 100 is deterministic — fixed points, rounded per stage — and the result page shows the arithmetic, so a shared score can be re-explained in ten seconds. You leave with the one stage holding you back and one next move written for the answer you actually gave. Pick your tone: straight up, or a roast that goes after the strategy, never the person. An optional Deep dive asks ten more questions and returns recommendations per stage. No account, no e-mail, cookie-free analytics, open source (AGPL), in English and French.` (789)
- **FR** : `La croissance cale rarement partout à la fois. Elle cale à une étape, et les quatre qui marchent la masquent. Tour de Growth est un diagnostic gratuit en 3 minutes bâti sur le cadre AARRR : quinze questions sur la façon dont ton produit acquiert, active, retient, fait recommander et monétise, avec trois réponses honnêtes chacune. Le score sur 100 est déterministe — points fixes, arrondi par étape — et la page de résultat montre le calcul : un score partagé se ré-explique en dix secondes. Tu repars avec l'étape qui te freine et une action écrite pour la réponse que tu as réellement donnée. Choisis ton ton : neutre, ou un roast qui vise la stratégie, jamais la personne. Un Deep dive optionnel pose dix questions de plus et renvoie des recommandations par étape. Sans compte, sans e-mail, analytics sans cookie, open source (AGPL), en français et en anglais.` (798)

## Les faits qu'on peut avancer (tous vérifiables dans le dépôt)

- Le score n'est jamais décidé par un modèle : `src/lib/scoring/score.ts`, pur, testé ; 20 / 7 / 0 points par réponse, arrondi par étape avant la somme.
- Le modèle (Gemini, avec une chaîne de repli sur quatre versions) n'écrit que le **Deep dive** ; le résultat rapide, **roast compris**, est une bibliothèque de textes relus (`src/content/copy-library.ts`), servie sans appel réseau.
- Le roast vise la stratégie, jamais la personne : la règle est codée en dur dans le prompt du Deep dive, et tenue par relecture dans les phrases pré-écrites du résultat rapide.
- Un résultat partagé se rend dans la **langue du lecteur**, pas de l'auteur ; l'image de partage porte le score, l'étape qui freine et l'action.
- Aucun compte, aucun e-mail ; les réponses du Tour ne quittent le navigateur que pour calculer le score ; GoatCounter sans cookie ; pages légales complètes.
- Open source, AGPL-3.0, 500+ tests unitaires et 180+ specs Playwright en CI.
- Le glossaire : 24 termes AARRR expliqués longuement dans les deux langues, avec pour chacun la question du Tour qui le mesure.

**À ne pas avancer** : un nombre d'utilisateurs, un pourcentage de quoi que ce soit, une comparaison nommée à un concurrent, une promesse chiffrée d'amélioration.

## Les liens, déjà tagués

Générés par `node scripts/utm-link.mjs` ; refaire avec le script si un chemin change.

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

## Les annuaires — ce qui a été vérifié le 2026-09-13

Vérifié en ouvrant la page de soumission depuis la session (quand elle se
laissait ouvrir) ; le reste est à confirmer au moment de remplir.

| Annuaire | Page | Compte ? | Gratuit ? | Ce qu'il demande | Verdict |
|---|---|---|---|---|---|
| **Launching Next** | `launchingnext.com/submit/` | Non (un e-mail) | Oui ; 99 $ pour passer en 1 jour | Nom, URL, titre 5-8 mots, description ≤ 2 500 car., 5-10 tags, type « side project », budget marketing 90 j, **nom + e-mail du soumetteur** | **Premier à faire.** Soumetteur : « Tour de Growth », `contact@` |
| **Uneed** | `uneed.best/submit-a-tool` | Pas pour commencer ; inscription pour enregistrer | Oui (file d'attente) ; « fast-track » payant | Nom + URL, le reste est aspiré de la page | À faire ; l'inscription se fait avec `contact@` |
| **Fazier** | `fazier.com/submit` | Probable | Oui (« reviewed & listed within 30 days ») ; 29 / 49 / 139 $ | Le formulaire n'était pas visible ; le plan gratuit **exige un backlink** vers Fazier | À faire si le backlink retour est acceptable (un lien dans le pied de page ? non — plutôt dans `/about`, ou refuser) |
| **BetaList** | `betalist.com/submit` | **Oui** (X ou lien magique) | Oui + option payante | Non vu (page de connexion) | À faire avec le compte de marque X |
| **Smol Launch** | `smollaunch.com` | À vérifier | Annoncé gratuit et dofollow | À vérifier | À faire |
| **DevHunt** | `devhunt.org` | Compte GitHub | Gratuit | Outils pour développeurs | **Écarter sauf sous un compte GitHub de marque** : le compte `ScratchMe` est le dépôt de l'auteur |
| **StartupBase** | `startupbase.io` | Probable | Gratuit | À vérifier | À faire |
| **SaaSHub** | `saashub.com/submit` | À vérifier (la page refuse les robots) | Gratuit ; le dofollow est payant | Nom, URL, catégories, **alternatives** | À faire ; positionner en alternative aux calculateurs de métriques SaaS (FounderPath, SaaS Club Tools) |
| **AlternativeTo** | `alternativeto.net` | **Oui** | Gratuit | Fiche + « alternative à » | À faire, même positionnement |
| **MicroLaunch** | `microlaunch.net` | Oui | La page ne montre que l'offre Pro à 39 $ | — | **Vérifier s'il reste une file gratuite ; sinon écarter** |
| **Peerlist Launch** | `peerlist.io` | **Profil personnel** | Gratuit | — | **Écarter** : c'est un réseau de personnes, un profil de marque y sonne faux |
| **There's An AI For That** | `theresanaiforthat.com/submit/` | À vérifier (la page refuse les robots) | Historiquement payant pour un passage rapide | — | À vérifier ; n'y aller que si une file gratuite existe |
| **Futurepedia** | `futurepedia.io/submit-tool` | — | **Non** : 247 $ (épuisé) / 497 $ | — | **Écarter** |
| **Toolify** | `toolify.ai` | À vérifier | À vérifier | — | À vérifier en dernier |
| **Product Hunt** | — | Vrai nom exigé pour un maker | — | — | Dernier de la liste, sans maker déclaré, si jamais |

Règle pour tous : le champ « description » reçoit la version 300 (ou 140 si
le champ est court), le champ « tagline » la tagline, le lien est celui de
la famille `directory:<slug>`, et le logo est `favicon-512.png`. Aucun champ
« fondateur » ne reçoit un nom : « Tour de Growth » ou vide.

## Les captures (`assets/`)

| Fichier | Quoi | Usage |
|---|---|---|
| `01-landing-{en,fr}-{desktop,mobile}.png` | La landing avec la carte d'aperçu | Capture principale des annuaires |
| `02-question-{en,fr}-{desktop,mobile}.png` | La première question du Tour | « Comment ça marche » |
| `03-tone-{en,fr}-desktop.png`, `03-tone-en-mobile.png` | Le sélecteur de ton (neutre / roast) | Le différenciateur |
| `04-result-{en,fr}-{desktop,mobile}.png` | Le résultat d'exemple (74/100, Retention 8/20, action) | Ce qu'on obtient |
| `05-preview-card-{neutral,roast}-{en,fr}.png` | La carte d'aperçu seule, dans les deux tons | Visuel carré-ish pour X / Bluesky et les fiches |
| `og-en.png`, `og-fr.png` | L'image de partage de la landing (1200×630) | Bannière des annuaires qui en demandent une |
| `og-r-sample.png` | L'image de partage d'un résultat | Montrer ce qu'un partage produit |

Toutes en 2× (2560 px de large en desktop, 780 en mobile), PNG palette.
