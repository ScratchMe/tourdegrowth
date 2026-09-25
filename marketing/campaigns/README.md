# Trois lancements, dans l'ordre — le brief de campagne

*TODO: à relire (convention 6). Premier jet de la session, écrit avec la méthode
`campaign-plan` du plugin Marketing, le 2026-09-24. Rien ici n'est posté,
envoyé ni déployé : c'est le plan, les textes prêts à coller sont dans
`engine/` et `game/`, et la relecture de marque de ces textes est dans
`brand-review.md`.*

*Contraintes non négociables, héritées de `GROWTH-PLAN.md` (option A, tranchée
le 2026-09-13) : **pas de LinkedIn**, et **Antoine n'est jamais nommé** dans la
promotion — ni dans un post, ni dans une bio, ni par un lien vers le CV. Le
site, lui, reste signé. Tout part des comptes de marque `tourdegrowth` et de
`contact@tourdegrowth.com`.*

*Ce document est public (le dépôt l'est) : il ne contient **aucun chiffre** de
`/admin/stats` ni de la Search Console au-delà de ce que `CLAUDE.md` affiche
déjà. La ligne de départ de chaque lancement se relève par le workflow
`stats.yml` au moment où il part, et reste dans la conversation.*

---

## 0. Ce qu'on lance, et pourquoi trois fois plutôt qu'une

| | A · Le Tour, relancé | B · Le moteur de croissance | C · Le côté obscur |
|---|---|---|---|
| Ce que c'est | Le diagnostic AARRR de 3 minutes, avec la copie revue (revue de copie v1) et les correctifs SEO | Un modèle de funnel AARRR **local** : tes quinze chiffres, où tu perds du monde, des slides pour ton CODIR | Un jeu de vingt minutes : une année comme PM growth d'une appli de streaming, un DG qui veut du chiffre, huit dark patterns |
| URL | `/{en,fr}` → `/quiz` | `/{en,fr}/aarrr-funnel-template` | `/{en,fr}/game`, `/{en,fr}/game/retention` |
| Portier | L'intégration mergée sur `main` | Bon à tirer nº6 signé + `ENGINE_ENABLED` | Recette du jeu signée (GAME-BRIEF §7.3) + relecture juridique du catalogue + `GAME_ENABLED` |
| Campagne UTM | `relaunch_tour` | `launch_engine` | `launch_game` |

**Pourquoi séquencer au lieu de tout lancer le même jour** — trois raisons,
chacune suffisante :

1. **La mesure.** GoatCounter compte les visites par campagne, mais ne peut pas
   rattacher un événement (`submission_completed`, `engine_exported`,
   `game_ending`) à la campagne qui a amené la personne : un événement est un
   chemin, pas une visite taguée. Vérifié dans le code — `utm_source` n'est lu
   par rien d'autre que GoatCounter, et aucune soumission ne le porte. **La
   seule façon de lire la conversion d'un lancement est donc la fenêtre de
   temps.** Trois lancements le même jour donneraient un seul pic illisible.
2. **Les communautés.** Un même pseudonyme qui poste trois Show HN la même
   semaine est un spammeur ; r/SaaS n'autorise qu'une autopromotion par 60
   jours (`GROWTH-PLAN.md` §3) ; r/SideProject attend qu'on rende des retours
   entre deux posts. L'espacement n'est pas de la prudence, c'est la règle.
3. **Chaque lancement nourrit le suivant.** Le moteur a une passerelle vers le
   Tour (la slide « déclaré × mesuré », décochée par défaut) ; le jeu renvoie
   vers le Tour en fin de niveau (« Où en est ta croissance ? »). Le Tour doit
   donc être au meilleur de sa copie **avant** que B et C y envoient du monde.

---

## 1. Vue d'ensemble

**Nom de campagne** : « Trois étapes » (en interne seulement — le mot *étape*
est celui du produit, et c'est bien ce que c'est : trois étapes d'un même
Tour).

**En une phrase** : relancer le Tour sur sa copie revue, puis ouvrir le moteur
de croissance et le jeu à trois semaines d'intervalle chacun, sous le seul nom
de la marque, en mesurant chaque lancement dans sa propre fenêtre.

**Objectif principal** (un par lancement, voir §7 pour la mesure exacte) :

| Lancement | Objectif principal | Mesuré par | Fenêtre |
|---|---|---|---|
| A | **100 Tours créés** | `submission_completed/*` (GoatCounter) et `/admin/stats` (Firestore) | J0 → J+28 |
| B | **50 decks exportés** | `engine_exported/pdf` + `engine_exported/png` | J0 → J+28 |
| C | **55 % des parties lancées menées jusqu'à décembre** (ou au licenciement) | `game_ending/*` ÷ `game_started/retention/*` | J0 → J+28 |

*Ces cibles sont des hypothèses d'ouverture, posées sans connaître le trafic
qu'un lancement apporte à ce site. Elles se recalent à J+7 sur la première
lecture — c'est écrit ici pour qu'un recalage soit une décision et non un
glissement. La cible de C est celle de `GAME-BRIEF.md` §2.3, reprise telle
quelle : c'est une mesure de la santé du jeu autant que de la campagne.*

**Objectifs secondaires**, tous lisibles dans ce que le produit mesure déjà :
voir §7.

---

## 2. Publics

Trois publics, un par lancement, qui se recoupent assez pour que chaque
lancement serve les deux autres.

| | Qui | Ce qui les bloque | Où ils sont | Étape d'achat |
|---|---|---|---|---|
| **A** | Fondateurs pré-seed à série A, PM et growth en poste | Ils savent que « quelque chose cale » sans savoir quoi ; les outils de score existants demandent un compte avant de rendre un résultat | Google (requêtes définitionnelles, « growth audit checklist », « diagnostic croissance startup »), r/SideProject, r/startups, Indie Hackers | Découverte |
| **B** | Growth PM, Head of Growth, fondateurs qui présentent en CODIR | Leurs chiffres sont dans quatre outils et le CODIR est jeudi ; les gabarits AARRR sont des tableaux vides ou des slides sans chiffres ; les tableurs téléchargeables demandent un e-mail | Google (« AARRR funnel template », SERP sans outil — audit SEO §2), Hacker News (local-first), r/SaaS, r/growthhacking, newsletters growth | Considération : ils ont déjà le problème |
| **C** | Designers produit et UX, PM, curieux du numérique ; en France, quiconque a déjà cherché le bouton « Résilier » | Ils connaissent le mot « dark pattern » sans en connaître les noms officiels ni la loi ; les contenus existants sont des taxonomies et des articles d'avocat | Hacker News (un précédent à 179 points), r/UXDesign (règles à vérifier), X/Bluesky, newsletters design et tech, presse tech FR (exclue : voir §4) | Découverte, par curiosité |

**Profil en une phrase** (format du plugin) :

- **A** : « Fondateur d'un produit SaaS de moins de trois ans, qui voit sa
  croissance plafonner sans savoir à quelle étape, et qui cherche un avis
  rapide et chiffré. Il découvre des outils par Google et par les communautés
  de makers, et il se méfie de tout ce qui demande son e-mail. »
- **B** : « Growth PM qui doit présenter l'état du funnel en CODIR, dont les
  chiffres sont éparpillés, et qui veut un visuel défendable sans envoyer les
  chiffres de son employeur à un service tiers. »
- **C** : « Designer ou PM qui a déjà reçu la consigne de "rendre la
  résiliation moins visible", et qui veut comprendre — ou faire comprendre —
  pourquoi c'est une mauvaise idée, en jouant plutôt qu'en lisant. »

---

## 3. Messages clés

Chaque message a sa preuve, et **chaque preuve est vraie dans le code ou le
sera par un portier nommé**. Une preuve marquée **[portier]** n'existe pas
encore dans `main` au 2026-09-24 : elle est spécifiée, et le lancement
concerné ne part pas tant qu'elle n'est pas vérifiée (§6).

### A · Le Tour

**Message central** : *« Ta croissance cale rarement partout à la fois. En
trois minutes, trouve l'étape qui te freine — et une action à mener. »*

| Message | Preuve | Où la vérifier |
|---|---|---|
| Le score ne sort jamais d'un modèle | 15 questions × 20/7/0 points, arrondi par étape avant la somme, fonction pure testée | `src/lib/scoring/compute.ts`, `score.ts` et leurs tests |
| Le résultat gratuit dit quoi faire, pas seulement où ça cale | Une action choisie par règle dans une bibliothèque relue : la première chose qui manque dans l'étape qui freine | `src/content/next-moves.ts`, `src/lib/scoring/next-move.ts` |
| Le produit refuse de nommer un goulot que les chiffres ne portent pas | Trois états de netteté (`clear`, `shared`, `level`), balayage exhaustif des 59 049 tableaux atteignables | `src/lib/scoring/bottleneck.ts` et son test |
| Le roast vise la stratégie, jamais la personne | Résultat rapide : une bibliothèque de phrases pré-écrites et relues, aucun modèle ; Deep dive : règle codée en dur dans le prompt | `src/content/copy-library.ts`, `src/lib/gemini/prompt.ts` |
| Aucun compte, aucun e-mail | Aucun champ d'identité dans le parcours ; analytics GoatCounter sans cookie | `src/app/root-shell.tsx`, pages légales |

### B · Le moteur de croissance

**Message central** : *« Ton Tour dit si tu mesures. Le moteur montre ce que
disent tes chiffres — et aucun ne quitte ton navigateur. »* (Ligne de
positionnement de la revue de copie §4.3 et de la spec §14.1.)

| Message | Preuve | Où la vérifier |
|---|---|---|
| Rien de ce que tu saisis ne quitte le navigateur | Une spec canari sème des chaînes uniques, joue tout le parcours, enregistre toutes les requêtes et exige qu'aucune ne les porte ; un balayage statique interdit `fetch`, `sendBeacon`, `WebSocket` dans l'outil | **[portier]** `e2e/engine-canary.spec.ts`, `src/__tests__/engine-boundary.test.ts` (spec §11.4, §13.3). Le même mécanisme existe déjà et passe pour `/admin/audit` : `e2e/audit-canary.spec.ts` |
| Tu repars avec un deck, pas avec un tableau | 4 à 7 slides 16:9, en PDF, en PNG par slide et en texte copiable avec notes d'orateur | **[portier]** spec §9-10 ; `html-to-image` est déjà dans `package.json` |
| Il ne nomme une fuite que contre une référence nommée | Une cible que tu fixes, ou l'une des deux fourchettes du glossaire relues (activation 20-40 %, churn de clients 1-2 %/mois), réserve imprimée | **[portier]** spec §5.1, §6.6 ; décision 5 du 2026-09-24 |
| Aucune IA dans le moteur | Aucun import de `lib/gemini` autorisé dans l'outil | **[portier]** `engine-boundary.test.ts` règle 1 |
| C'est gratuit, sans compte | Aucune fonction serveur nouvelle, aucun Route Handler : une page prérendue et un îlot client | **[portier]** spec §10.3 |

### C · Le côté obscur

**Message central** : *« Le Tour dit quoi faire. Le côté obscur montre ce qu'il
ne faut pas faire, de l'intérieur. »* (Revue de copie §4.2.)

| Message | Preuve | Où la vérifier |
|---|---|---|
| Tu joues celui qui fabrique le piège, pas celui qui le repère | Tu choisis deux actions par trimestre, nommées comme en réunion ; le DG en ordonne une | `GAME-BRIEF.md` §5.2, §5.5 ; **[portier]** `src/lib/game/` |
| Le coût arrive plus tard, comme dans la vraie vie | La confiance des abonnés et le radar de la DGCCRF sont floutés jusqu'en décembre | `GAME-BRIEF.md` §5.3 ; **[portier]** implémentation |
| On peut gagner en restant droit | Trois fins propres, dont « Tu as tenu. Et ça a marché. » | `GAME-BRIEF.md` §5.11 |
| Tu repars avec les huit noms officiels, la loi et un cas réel | Catalogue final : obstruction, action forcée, harcèlement d'interface, confirmshaming, fausse preuve sociale, coût caché, présélection, design addictif | `design/game/prototype-s-ils-reviennent.html` (`CARDS`) ; **[portier]** relecture juridique |
| Ta partie n'est gardée que chez toi ; seuls des libellés fixes partent vers la mesure d'audience | Jeu 100 % client, aucune fonction serveur, aucune lecture Firestore ; sauvegarde locale seulement. GoatCounter reçoit une liste fermée d'événements, dont la fin atteinte et l'ordre du DG suivi ou refusé, jamais un texte libre ni un chiffre produit par le joueur | `GAME-BRIEF.md` §9.1, §9.5 ; `src/lib/game/events.ts` ; **[portier]** garde de bundle du jeu |
| Les chiffres sont ceux d'un jeu | Mention sur le bilan : « chiffres du jeu, modèle simple écrit dans le code » | `GAME-BRIEF.md` §3.3 |

**L'accroche d'actualité, à ne pas surjouer** : la résiliation « en trois
clics » est obligatoire en France depuis le 1ᵉʳ juin 2023 (article L215-1-1
du Code de la consommation) ; le DSA (article 25) interdit aux plateformes en
ligne les interfaces trompeuses, hors pratiques déjà couvertes par la directive
sur les pratiques commerciales déloyales ou le RGPD ; la **proposition** de la
Commission sur le Digital Fairness Act est annoncée pour le quatrième trimestre
2026. Le jour où la Commission publie sa proposition, c'est un
créneau réactif (§5, dernière ligne) — jamais une promesse de date dans un
post.

---

## 4. Stratégie de canaux

Tous les canaux viennent de `GROWTH-PLAN.md` §3, sous ses deux contraintes.
Aucun budget payant dans ces trois lancements : le §4 vague 5 du plan le
réserve à un signal, et ces lancements sont précisément ce qui produira le
signal.

| Canal | A | B | C | Pourquoi ce partage | Effort |
|---|---|---|---|---|---|
| **SEO** (déjà en ligne) | ● | ● | ● | Le seul canal qui compose. A : les pages « porte ouverte » et le cluster « AARRR vs X » ; B : « AARRR funnel template », SERP sans outil (audit SEO §2) ; C : aucun contenu interactif en français sur la résiliation (audit SEO §3.2) | Fait / faible |
| **Show HN** | — | ● | ● | Deux Show HN au plus pour ce pseudonyme, à trois semaines d'écart. Le Tour n'y retourne pas (§8, D1) : B (local-first, export sans serveur) et C (un jeu) sont des objets neufs que HN sait juger | Élevé |
| **r/SaaS** (1 fois / 60 j) | — | ● | — | Le seul post de la fenêtre va au moteur, qui parle le plus directement à ce public | Moyen |
| **r/SideProject**, **r/IMadeThis** | selon D1 | ● | ● | Autopromotion voulue, à condition de rendre des retours ; espacer d'au moins trois semaines | Faible |
| **r/startups** (Feedback Friday) | selon D1 | ● | — | Fil hebdomadaire uniquement | Faible |
| **r/growthhacking** | — | ● | — | Le sub débat du contenu : les quinze chiffres s'y discutent mieux que l'outil | Faible |
| **r/UXDesign** | — | — | ○ | Le vrai public du jeu, **règles non documentées dans `GROWTH-PLAN.md`** : lire la barre latérale avant ; si l'autopromotion y est interdite, ne pas poster | Faible |
| **Indie Hackers** | — | ● | ● | Un « build log » par objet ; IH lit des récits de construction | Moyen |
| **X / Bluesky** (EN + FR) | ● | ● | ● | Point d'ancrage ; le fil FR sert surtout C, dont le sujet est français | Faible |
| **Annuaires** | ● (reste de la vague 1) | ● | ○ | Un produit par annuaire en général : vérifier sur chacun qu'une seconde fiche du même domaine est acceptée | Moyen |
| **Newsletters** (depuis `contact@`) | — | ● | ● | Un pitch d'un paragraphe ; B aux newsletters growth, C aux newsletters design et tech, FR et EN | Moyen |
| **IndexNow** | ● | ● | ● | Automatique (workflow quotidien) dès que la page entre au sitemap | Nul |
| LinkedIn, presse, podcasts, messages directs | ✕ | ✕ | ✕ | Exclus (`GROWTH-PLAN.md` §0) | — |
| Product Hunt | ✕ | ✕ | ✕ | Nom complet exigé pour tout compte, comptes d'entreprise refusés | — |

● = canal principal · ○ = conditionnel · — = pas pour ce lancement · ✕ = exclu

**Ce qui ne se fait jamais, quel que soit le canal** (règles de
`GROWTH-PLAN.md` §2, rappelées parce qu'elles mordent sur ces trois
lancements) : promettre un chiffre (« +20 % de rétention »), se comparer
**en premier** et nommément à un concurrent, demander un vote, poster le même
texte dans deux communautés, répondre à une critique en se cachant derrière
« l'équipe ».

---

## 5. Calendrier, semaine par semaine

Les dates sont **au plus tôt**. Chaque lancement glisse avec son portier, mais
l'**espacement** entre deux lancements ne se comprime jamais (règle 2 du §0).
20 % des créneaux sont laissés libres, pour réagir.

| Semaine | Contenu | Canal | Qui / dépendances | Statut |
|---|---|---|---|---|
| **S0** · 24-27 sept | Ce brief, les textes B et C, le kit mis à jour | `marketing/` | Session. Relecture d'Antoine avant tout post | Livré, à relire |
| **S1** · 28 sept-4 oct | **A** : intégration mergée (copie revue, DS v3). Relevé de la ligne de départ par `stats.yml` **le jour même**, avant tout post | `main`, workflow stats | Antoine (merge), session (relevé) | Portier A |
| S1 | A : « Demander l'indexation » dans la Search Console pour `/en`, `/fr`, les deux pages « porte ouverte » et les quatre « AARRR vs X » | Search Console | Antoine, 10 min | Après le merge |
| S1 | A : annuaires restants de la vague 1 (Launching Next d'abord), avec la campagne `relaunch_tour` | Annuaires | Antoine (formulaires), liens déjà dans `kit.md` | — |
| S1 | A : un fil X / Bluesky « ce qui a changé », EN puis FR le lendemain | X, Bluesky | Antoine poste, textes dans `social.md` de la vague 1 à mettre à jour (§8, D2) | — |
| **S2** · 5-11 oct | Lecture A à J+7 : Tours créés, partages, `take_own_tour` ; recalage des cibles | `/admin/stats` | Session (workflow), Antoine décide | — |
| S2 | **Bon à tirer nº6** (copie du moteur) signé ; recette du moteur ; spec canari verte | Revue | Antoine ; **portier B** | — |
| S2 | Comptes : commenter sur HN et dans r/SaaS, r/growthhacking **sans lien**, pour que le compte existe avant le post | HN, Reddit | Antoine, 15 min par jour | Continu |
| **S3** · 12-18 oct | **B** lundi : PR d'ouverture mergée (`ENGINE_ENABLED`, sitemap, liens internes, `legal.ts`) ; vérification en production (page, canari relancée contre le build, export PDF et PNG) | `main` | Session (PR), Antoine (variable + merge) | Portier B |
| S3 | **B** mardi ou mercredi, 14-16 h Paris : **Show HN** | HN | Antoine présent **trois heures** | Dépend : ouverture vérifiée |
| S3 | B jeudi : **r/SaaS** (le post « pourquoi les chiffres ne quittent pas le navigateur ») | Reddit | Antoine | Dépend : compte vieilli |
| S3 | B vendredi : build log Indie Hackers ; fil X / Bluesky EN, FR le samedi | IH, X, Bluesky | Antoine | — |
| **S4** · 19-25 oct | B : r/startups (Feedback Friday, vendredi), r/growthhacking, r/SideProject — un par jour, pas le même jour | Reddit | Antoine | ≥ 1 jour entre deux |
| S4 | B : pitchs newsletters growth, FR et EN (10-15 envois, depuis `contact@`) | E-mail | Session (liste + textes), Antoine (envoi) | — |
| S4 | B : annuaires (seconde fiche du domaine, si acceptée) | Annuaires | Antoine | Vérifier la règle de chaque annuaire |
| S4 | Lecture B à J+7 | `/admin/stats`, GoatCounter | Session | — |
| **S5** · 26 oct-1ᵉʳ nov | Créneau libre : réponses, correctifs annoncés dans les fils, second fil X sur une slide exemple | — | — | Réserve 20 % |
| S5 | **Recette du jeu** (GAME-BRIEF §7.3 : Antoine, cinq testeurs, relecture juridique du catalogue) | Revue | Antoine ; **portier C** | — |
| **S6** · 2-8 nov | **C** lundi : `GAME_ENABLED` posé, rebuild, vérification (hub, niveau, fin de partie, lien copié) | Vercel | Antoine | Portier C ; ≥ 3 semaines après le Show HN B |
| S6 | **C** mardi ou mercredi : **Show HN** | HN | Antoine présent trois heures | — |
| S6 | C : fil X / Bluesky **FR d'abord** (le sujet est français), EN le lendemain ; pitchs newsletters FR et EN | X, Bluesky, e-mail | Antoine | — |
| **S7** · 9-15 nov | C : r/SideProject (≥ 3 semaines après celui de B), r/IMadeThis, r/UXDesign si ses règles le permettent ; build log Indie Hackers | Reddit, IH | Antoine | Un par jour |
| S7 | Lecture C à J+7 : fins, catalogue ouvert, rejeu | GoatCounter, `/admin/stats` | Session | — |
| **S8** · 16-22 nov | Lectures J+28 de A, J+28 de B ; lecture C à J+14 ; règle de coupe (§7) | — | Session, Antoine décide | — |
| **S10** · ~7 déc | Lecture C à J+30, décision sur la place de l'encart de résultat (GAME-BRIEF §13.5) | `/admin/stats` | Antoine | Un mois de données |
| **Réactif** | Le jour où la Commission publie le Digital Fairness Act : un post X / Bluesky FR et EN dans les 48 h, **seulement si C est ouvert** | X, Bluesky | Session (texte le jour même), Antoine | Aucune date promise |

**Coût d'infrastructure des merges** (convention 13) : les ouvertures B et C
sont deux merges de code, chacun ~43 Mo de Functions Storage pendant 30 jours ;
ils sont à trois semaines d'écart. Ce dossier `marketing/`, lui, ne déclenche
aucun build (`scripts/vercel-ignore.sh`). **Mais la branche qui le porte, si** :
le vocabulaire UTM (`scripts/utm-channels.mjs`, `scripts/utm-link.mjs`) et son
test (`src/__tests__/`) sont hors de la liste des chemins sautés. La merger
seule coûterait un déploiement pour rien : la merger **avec** la PR
d'ouverture du moteur, ou dans le même lot qu'un autre merge de code.

---

## 6. Pièces à produire

| Pièce | Où | Priorité | Qui | Statut |
|---|---|---|---|---|
| Show HN B (titres, premier commentaire, FAQ) | `engine/show-hn.md` | Indispensable | Session | Livré, à relire |
| Posts Reddit B (r/SaaS, r/startups, r/growthhacking, r/SideProject) | `engine/reddit.md` | Indispensable | Session | Livré, à relire |
| Build log IH B | `engine/indiehackers.md` | Indispensable | Session | Livré, à relire |
| Fil X / Bluesky B, EN et FR | `engine/social.md` | Indispensable | Session | Livré, à relire |
| Pitch newsletter B, FR et EN | `engine/newsletter.md` | Indispensable | Session | Livré, à relire |
| Descriptions annuaire B, 140/300/800, FR et EN | `engine/directories.md` | Indispensable | Session | Livré, à relire |
| Les mêmes six pièces pour C | `game/*.md` | Indispensable | Session | Livré, à relire |
| Faits avançables et faits à ne pas avancer, B et C | `../kit.md` | Indispensable | Session | Livré, à relire |
| Captures B : page, tableau de bord, une slide exportée (1280 et 390, FR et EN) | `../assets/` | Indispensable | Session, **après** l'ouverture en prévisualisation | À faire, dépend du code |
| Captures C : hub, visio du DG, téléphone, page de décembre | `../assets/` | Indispensable | Session, même moment | À faire, dépend du code |
| Une slide exemple exportée (le peloton de 100 inscrits) pour les fils | `../assets/` | Utile | Session | À faire |
| Relecture de marque des textes | `brand-review.md` | Indispensable | Session | Livré |
| Mise à jour de `launch/social.md` pour la relance A | `../launch/social.md` | Utile | Session sur décision D2 | En attente |

---

## 7. Mesure et règle de coupe

### Ce que le produit sait réellement mesurer

- **Visites par canal** : le widget Campaigns et Referrers de GoatCounter, qui
  lit `utm_source` et `utm_campaign` sur chaque page vue. Chaque lien de ce
  dossier est tagué par `scripts/utm-link.mjs … --campaign <lancement>`.
- **Événements par fenêtre** : GoatCounter (tous les événements, dates au
  choix dans son tableau de bord) et `/admin/stats` (funnel sur 7 jours,
  30 jours et depuis le début), lisibles par la session via `stats.yml`.
- **Ce qu'aucun des deux ne sait** : rattacher un Tour, un deck ou une partie
  au canal qui a amené la personne. D'où le séquencement (§0) et, pendant la
  semaine de chaque lancement, **un canal majeur par jour** : c'est ce qui rend
  une lecture jour par jour interprétable.
- **Biais connu** : une part notable du public de Hacker News bloque les
  scripts de mesure. GoatCounter sous-compte donc ce canal ; comparer des **ratios**
  (actions ÷ visites comptées) plutôt que des volumes entre canaux.

### Indicateurs, par lancement

| | Indicateur | Source | Cible d'ouverture |
|---|---|---|---|
| **A** | Tours créés | `submission_completed/*` | 100 en 28 j |
| A | Partages par Tour | `share/*` ÷ `submission_completed/*` | ≥ 15 % |
| A | Visiteurs qui font leur propre Tour | `take_own_tour` ÷ `share/*` | ≥ 20 % |
| A | K-factor sur la fenêtre | `/admin/stats` (référées ÷ toutes) | ≥ 0,10 |
| A | Impressions de recherche des pages de contenu | Search Console via `stats.yml` | ×2 sur 28 j par rapport aux 28 j précédents (le chiffre de départ reste hors du dépôt) |
| **B** | Decks exportés | `engine_exported/pdf` + `engine_exported/png` | 50 en 28 j |
| B | Ouverture du deck | `engine_deck_opened` ÷ `engine_opened` | ≥ 30 % |
| B | Export une fois le deck ouvert | exports ÷ `engine_deck_opened` | ≥ 50 % |
| B | Passerelle vers le Tour | `engine_tour_linked` ÷ `engine_opened` | observer, pas de cible |
| B | Position de la page sur « AARRR funnel template » | Search Console | dans les 20 premiers à J+60 |
| **C** | Parties menées à leur fin | `game_ending/*` ÷ `game_started/retention/*` | ≥ 55 % (GAME-BRIEF §2.3) |
| C | Catalogue ouvert | `game_catalogue_open` ÷ `game_ending/*` | ≥ 60 % |
| C | Rejeu | `game_replay` ÷ `game_ending/*` | ≥ 15 % |
| C | Répartition des fins | `game_ending/<id>` | aucune fin > 60 %, applaudissements entre 15 et 35 % |
| C | Partage | `game_share` | observer : Antoine doute que les joueurs partagent (GAME-BRIEF §4) |
| C | Non-régression du Tour | passage au Deep dive et partage sur les résultats à goulot rétention, un mois avant et après | ne baisse pas (GAME-BRIEF §13.5) |

**Dépendance de mesure à vérifier avant B et C** : les événements du moteur et
du jeu n'apparaissent dans `/admin/stats` que s'ils sont ajoutés à la liste
exacte que `goatcounter-api.ts` demande à GoatCounter (spec du moteur §11.6,
GAME-BRIEF §9.6). Sinon ils existent dans GoatCounter et manquent en silence
dans le tableau de bord (R-11). Le moteur n'écrit rien dans Firestore, par
construction : la moitié Firestore de `/admin/stats` ne le verra jamais.

**Cadence de lecture** : J+1 (le soir du post principal), J+7, J+28 ; pour C,
J+30 en plus pour la règle de l'encart.

**Règle de coupe** (reprise de `GROWTH-PLAN.md` §6, appliquée par lancement) :
à J+28, un canal qui a amené des visites et aucune action de valeur est retiré
du lancement suivant ; un canal dont la fenêtre montre des partages ou des
exports est redoublé au lancement suivant. **C'est l'action qui compte, pas la
visite.**

---

## 8. Risques et parades

| Risque | Parade |
|---|---|
| **La promesse « rien ne quitte ton navigateur » est fausse le jour du post** (un script, une requête ajoutée plus tard) | Portier B : la spec canari et le balayage statique doivent être sur `main` et verts ; la canari est relancée contre le build de production le jour de l'ouverture. Le premier commentaire HN invite à vérifier dans l'onglet Réseau : on ne l'écrit que si c'est vrai |
| **« Ça existe déjà »** pour le jeu : un Show HN de janvier 2025 (179 points) apprenait déjà à repérer les dark patterns | Le dire avant qu'on le dise : la FAQ de `game/show-hn.md` reconnaît le précédent et dit la différence (on fabrique le piège, sous un DG, et le coût arrive en décembre). Ne jamais le citer en premier ni nommément : répondre si on le cite |
| **Un pseudonyme qui ne poste que ses propres liens** est enterré sur HN et supprimé sur Reddit | Commenter sans lien entre les lancements (S2, S5) ; deux Show HN au plus, à trois semaines d'écart ; jamais le même texte deux fois |
| **Glorification** : le jeu peut se lire comme un manuel de manipulation | Les textes de lancement ne décrivent jamais une astuce comme efficace ; ils parlent du coût différé et de la fin propre possible. La recette (GAME-BRIEF §7.3) le surveille en test |
| **Diffamation** : citer une marque réelle dans un post | Aucune marque réelle dans un post, jamais. Les cas réels restent dans le catalogue du jeu, relus juridiquement |
| **Le Digital Fairness Act glisse** | Aucune date promise ; créneau réactif seulement, et seulement si C est ouvert |
| **Un pic de trafic sur le Tour pendant une panne Gemini** | Le Tour et le moteur n'appellent aucun modèle ; seul le Deep dive tombe, et son écran d'erreur rejoue la requête (`GROWTH-PLAN.md` §8). La limite de débit en mémoire (R-15) est le point faible connu |
| **Le moteur est lu comme un outil pour tous les modèles** | Le kit et les textes disent « v1 : SaaS en libre-service (freemium ou essai) » ; les autres profils sont annoncés comme à venir, sans date |
| **Les cibles d'ouverture sont fausses d'un ordre de grandeur** | Recalage à J+7, écrit (§1) ; la règle de coupe porte sur des ratios, pas sur les cibles |

---

## 9. Ce qui se fait à la main, ce que la session fait

**Antoine, à la main** (aucun de ces gestes ne peut être délégué : comptes,
votes et envois engagent un pseudonyme ou une adresse) :

- Merger l'intégration (A), les PR d'ouverture (B, C), poser `ENGINE_ENABLED`
  et `GAME_ENABLED` dans Vercel.
- Signer le bon à tirer nº6 (B), la recette du jeu et obtenir la relecture
  juridique du catalogue (C).
- Relire chaque texte de ce dossier avant de le coller.
- Poster sous `tourdegrowth` (HN, Reddit, IH, X, Bluesky) et rester trois
  heures sur chaque Show HN.
- Commenter sans lien entre les lancements.
- Remplir les formulaires d'annuaires et cliquer les mails de vérification.
- Envoyer les pitchs newsletters depuis `contact@tourdegrowth.com`.
- « Demander l'indexation » dans la Search Console.

**La session** (sans rien demander, dans ce dépôt) :

- Les textes (fait), leurs mises à jour après chaque lecture.
- Les liens tagués (`scripts/utm-link.mjs`, campagnes `relaunch_tour`,
  `launch_engine`, `launch_game`).
- Les captures des deux produits, en prévisualisation, contre un build local.
- Les relevés `stats.yml` à J0, J+1, J+7, J+28 — chiffres gardés dans la
  conversation, jamais écrits ici.
- La vérification en production des portiers (canari relancée, en-têtes,
  pages en 200, événements présents dans `/admin/stats`).
- Une veille de fils à répondre sur Reddit et IH, sur demande.

**Ce que la session ne fera pas** : créer un compte, poster, voter, envoyer un
e-mail (`GROWTH-PLAN.md` §5 : un compte piloté par un agent est le motif de
bannissement le plus courant).

---

## 10. Décisions à prendre avant de commencer

| # | Décision | Pourquoi elle bloque | Recommandation |
|---|---|---|---|
| **D1** | Qu'est-ce qui est **déjà parti** de la vague 1 (Show HN du Tour, posts r/SideProject, r/roastmystartup, r/SaaS, IH) ? | Rien dans le dépôt ne le dit. Un second Show HN du Tour, ou un second r/SaaS dans les 60 jours, brûle le compte | Si le Show HN du Tour n'est pas parti : **ne pas le faire**, garder les deux créneaux HN pour B et C, plus neufs. Si r/SaaS est déjà parti dans les 60 jours qui précèdent la semaine de B, B passe sans r/SaaS |
| **D2** | Relancer A sur les réseaux, ou laisser A au seul SEO ? | Un fil « nouvelle copie » intéresse peu ; les annuaires et le SEO font l'essentiel | Un seul fil X/Bluesky, court, centré sur la carte de résultat (l'action sur l'image), puis laisser composer |
| **D3** | Les captures B et C : attendre le design final ou prendre la prévisualisation ? | Une capture de prévisualisation qui change avant le lancement est un visuel faux | Attendre la recette de chaque produit, et capturer le jour de l'ouverture |
| **D4** | La réponse à « qui est derrière ? » | Sous l'option A, la seule réponse honnête dit que le site est signé | Garder celle de la vague 1 : « the site credits its author in the footer; I keep this account pseudonymous » |
