# CHANTIERS.md — ce qui reste à faire, et qui le fait

*Établi le 2026-09-29, après la mise en production de #184. Hors bons à tirer
(nº4, nº7, nº8 et les libellés que `CLAUDE.md` liste « hors de tout bon à
tirer ») : un autre agent les mène avec Antoine.*

Ce document est la **liste de travail**, rangée par agent. Chaque section se
traite dans une session à part, lancée avec son prompt (section **Les prompts**,
en fin de document). `CLAUDE.md` garde l'état courant, `JOURNAL.md` l'histoire.

- **Quand un item est livré**, la session qui l'a livré le retire d'ici et
  l'écrit au journal.
- **Quand une session découvre du travail**, elle l'ajoute ici, dans la bonne
  section : du code en A, une question pour Antoine en C, un geste d'Antoine
  en D.
- **Les chiffres cités ont été mesurés le 2026-09-29.** Une session les
  re-mesure avant d'agir : un constat déjà résolu se retire, il ne se corrige
  pas.

## Vue d'ensemble

| Groupe | Qui | Où | Quand |
|---|---|---|---|
| **A. Le travail autonome**, en cinq lots | Une session seule, une PR par lot | Session cloud | Maintenant. A2 à A5 l'un après l'autre ; A6 à tout moment (A1 livré le 2026-09-29) |
| **B. Design sync** | Une session sur ta machine | Claude Code en local : l'autorisation Claude Design ne s'obtient que là | Maintenant (A1 est livré), puis de nouveau après A2 et A5 |
| **C. Tes décisions**, une par une | Toi, guidé, avec une recommandation par question | N'importe quelle session | Maintenant : 21 questions, environ 45 minutes |
| **D. Tes actions**, pas à pas | Toi, accompagné | Session cloud | Selon ce qui est prêt (D2 attend les bons à tirer nº7 et nº8) |
| **E. La veille** | Personne | — | Rien à lancer avant un déclencheur |

**L'ordre conseillé** : C et A2 en parallèle dès maintenant, car ils ne
touchent pas les mêmes fichiers. B dès que tu as un créneau sur ta machine
(A1 est livré), puis D.

**Deux sessions en parallèle** écrivent toutes deux à la fin de `JOURNAL.md`
et dans ce fichier. La seconde à merger fusionne `main` dans sa branche avant
sa PR et garde les deux entrées. Les lots A, eux, se suivent : ils touchent les
mêmes feuilles de style.

---

## A. Ce que la session fait seule

**Pour chaque lot :**
- une branche depuis `origin/main` ;
- chaque correctif a son test ou sa garde, avec sa non-vacuité (`TESTING.md`) ;
- une vérification à l'écran, dans les deux langues, à 1 280 et 390 px ;
- une PR, mergée par la session quand elle est verte, en suivant `/livrer`
  (lu, pas appelé) et sa barrière §0.

Une question produit ou de design rencontrée en route ne se tranche pas en
route : elle part en section C, avec une recommandation.

### A2 — Les slides et la grille de points du moteur

| # | Constat | Correctif attendu |
|---|---|---|
| A2.1 | **S-8.** Les slides ont 23 tailles de police littérales, jusqu'à 14 px sur une slide projetée de 1 920 px | Compléter l'échelle `--slide-*`, avec rien sous 18 px. Un e2e mesure la plus petite taille rendue d'une slide. L'export PNG est vérifié aussi **Plancher de 18 px confirmé par Antoine le 2026-09-29** : un tableau qui ne tient pas à 18 px se coupe en deux slides, il ne s'écrit pas plus petit |
| A2.2 | **S-10.** Le funnel en points est dessiné trois fois hors du système : le peloton, « Et si » et les slides, à trois tailles | Un `viz/DotGrid` que les trois vues composent, avec son aperçu design-sync. Décider là de l'usage des 15 jetons `--viz-cat-*` et `--viz-seq-*`, qui n'ont aucun lecteur : les employer ou les retirer (`dead-tokens.test.ts` les tient en attente) La case « inconnu » du peloton (`outline: 1.5px`, la dernière épaisseur hors jeton, listée dans `border-width.test.ts`) prend le trait de `DotGrid` ; retirer alors sa ligne de la garde |

Le moteur est fermé derrière `ENGINE_ENABLED` : les e2e passent par
l'aperçu propriétaire, comme le canari moteur.

### A3 — La boucle de croissance (`GROWTH-PLAN.md`, vague 3)

| # | Quoi | Précautions |
|---|---|---|
| A3.1 | **Un badge embarquable** `/r/<id>/badge.svg` (« Tour de Growth · 74/100 », style shields), et un extrait Markdown « ajoute-le à ton README » sur le résultat du **propriétaire** | **Firestore** : c'est une lecture sur un chemin public, et un badge dans un README est lu à chaque vue. Il faut un cache CDN sous une adresse versionnée, comme l'image de partage (`FIRESTORE.md`, `VERCEL.md` §2.2). **Barrière §0** : aucun fichier de police dans le bundle serveur. **Relecture** : `relecteur-securite`, car le badge ne doit rien dire de plus que l'image de partage. **Analytics** : un événement pour la copie de l'extrait. La copie repart « à relire » |
| A3.2 | **Le partage natif emporte l'image** : `navigator.share({ files })` là où `navigator.canShare({ files })` le permet, sinon le partage de lien actuel | Aujourd'hui, `ResultView.tsx:241` ne partage que l'URL. Un événement doit distinguer les deux chemins |
| A3.3 | **Un exemple roast canonique** : `/r/sample?tone=roast`, ou un second échantillon, pour que la landing et les posts aient une carte roast à montrer sans exposer un vrai résultat. Son image de partage aussi | La copie roast est neuve : garde-fou anti-moquerie (le roast vise la stratégie, jamais la personne), et statut « à relire » |

Le percentile (3.4 du plan) attend quelques centaines de soumissions : il est
en section E.

### A4 — Ce que la plateforme offre déjà (audit du kit, §6)

Ce sont les remplacements natifs pointés par les guides Modern Web de Chrome.
Ces douze-là n'étaient pas encore dans `src/` le 2026-09-29 (vérifié par
`grep`).

| Où | Quoi |
|---|---|
| `QuarterNews` | Entrée en `@starting-style`, sortie en `allow-discrete` : une fermeture animée sans JS |
| `QuarterNews` | « Passer au bilan » en `command="request-close"` : un seul chemin de sortie, avec Escape |
| `GlossaryTerm`, `DefinitionPopover` | Un seul popover en couche supérieure, positionné par ancre, au lieu de deux variantes rendues et de trois `z-index` |
| `Disclosure` | `::details-content` et `interpolate-size` : un accordéon animé sans JS |
| `StageTabs` | `hidden="until-found"` : Ctrl+F trouve un chiffre replié et ouvre sa ligne |
| Onglets du moteur | Un indice dur quand la bande d'onglets défile, au lieu d'un troisième onglet coupé |
| `Segmented` | Le remplissage qui glisse, positionné par ancre, en CSS seul |
| Tampons | Des propriétés de transformation individuelles (`rotate:`) : une seule keyframe partagée |
| `motion.css` | Le dépassement du tampon en `linear()`, réglé par un seul jeton |
| Monde nuit | `color-scheme: dark` sous `[data-world="night"]` : barres de défilement et contrôles natifs en sombre |
| Deck | `content-visibility: auto` sur les vignettes, forcé à `visible` pendant l'export PNG |
| Barres collantes | Une requête de conteneur `scroll-state` : le filet seulement quand la barre recouvre du contenu |

**Tout s'ajoute en amélioration progressive** : la page doit rester juste
sans. Pour chaque ajout :
- vérifier le support (MDN, Baseline) avant de l'écrire ;
- garder les gardes `prefers-reduced-motion`.

`text-wrap: pretty` est déjà posé (18 usages) : il reste à vérifier que la
modale en profite.

### A5 — Le nommage des variantes (S-16)

**Le constat** : quatre vocabulaires coexistent dans les props de variante.
- `desktop|mobile` ;
- `sm|md|lg` ;
- `md|compact` ;
- des noms propres.

`alert` et `red` désignent le même rôle.

**Ce qui est attendu :**
- une table de nommage dans `.design-sync/conventions.md` ;
- une migration progressive, une famille de composants par PR ;
- à chaque renommage, les aperçus design-sync suivent.

C'est à faire avant la seconde passe de B.

### A6 — Les relevés chiffrés

**Tout ce que la session peut lire seule.** La méthode est la ligne « Lecture
des stats par la session » de `CLAUDE.md`, et l'entrée du 2026-09-14 de
`JOURNAL.md` (`grep stats.yml`). **Aucun chiffre n'entre dans le dépôt**,
qui est public : on n'y écrit que « vérifié, présent » ou « absent ».

| # | Quoi |
|---|---|
| A6.1 | **Les événements `retake_started` et `landing_return`** n'ont jamais été vus dans le vrai GoatCounter. Lancer `stats.yml` avec la portée `admin`, déchiffrer, et vérifier deux choses : qu'ils figurent dans la section funnel, et que la ligne « Value actions per result » existe |
| A6.2 | **Search Console** (portée `gsc`) : les URL `/en/glossary/*` ont-elles remplacé les anciennes URL non préfixées dans les pages créditées ? |
| A6.3 | **Les déclencheurs de volume de la section E** : 50 soumissions, quelques centaines, signes d'abus. Dire si l'un d'eux est atteint, sans écrire le compte |

---

## B. Design sync — sur ta machine

**Pourquoi en local** : l'outil `DesignSync` demande une autorisation qui ne
s'obtient que depuis une session interactive sur ta machine (`JOURNAL.md`,
brief d'extension 03). Une session cloud construit et valide le bundle, mais
ne peut pas le pousser.

| # | Quoi | Détail |
|---|---|---|
| B1 | **Pousser le bundle** vers le projet Claude Design existant (`23b9671c-a55b-452e-aa41-39906ee71ba8`, créé le 2026-09-11) | Au 2026-09-29 : 77 composants, 244 cellules, 77 aperçus sur 77 rendus. Lire `.design-sync/NOTES.md` avant toute commande : ce dépôt est une app, pas un paquet. Trois avertissements sont permanents et attendus : « Impact », et `GRID_OVERFLOW` sur `DefinitionPopover` et `QuarterNews`. **Ne pas appliquer** le `cardMode: "single"` suggéré, qui masquerait des histoires |
| B2 | **Le brief S-15 : les primitives de formulaire.** Elles vivent hors du système, en deux copies. Côté moteur : `Field`, `NumberField`, `TextField`, `Select`, `Choices`, `CheckField`, `MonthField` et `SegmentedField`, sous `src/app/[locale]/aarrr-funnel-template/_engine/_ui/`. Côté audit : sous `src/app/(app)/admin/audit/` | Écrire `design/DS-EXTENSION-BRIEF-04.md`, sur la forme des briefs 01 et 03, puis l'envoyer à Claude Design. Le retour arrive par `design/ds-extension-04-return/` ou par « Send to Claude Code Web ». La promotion dans `core/` devient ensuite un lot A |
| B3 | **Re-synchroniser** après A1, A2 et A5 | Ces lots changent des composants et leurs aperçus. **A1 n'a pas pu reconstruire le bundle** : le convertisseur (`.ds-sync/`) n'est pas dans une session cloud. Il a changé l'aperçu `Button` (une histoire `Quiet` de plus, donc 245 cellules attendues), le contrat de `Button` et `conventions.md` (le bouton texte, les trois épaisseurs de trait). À reconstruire et valider avant de pousser |

---

## C. Tes décisions, une par une

Chaque question a :
- **Aujourd'hui** : ce qui est en place ;
- **Source** : où elle vit ;
- **Reco** : ma recommandation.

La session qui les pose recopie chaque réponse, avec sa date, à l'endroit où
vit la question. Une réponse qui demande du code devient un item de la
section A.

### Le moteur

| # | Question | Aujourd'hui | Source | Reco |
|---|---|---|---|---|
| C1 | **Le repère de churn logo de 1-2 %/mois peut-il désigner la fuite ?** La vérification des faits dit qu'il ne vaut que pour le SaaS B2B à panier élevé (ChartMogul : médiane de 6,1 % sous 25 $ d'ARPA, 2,2 % au-dessus de 500 $). Un produit à petit panier à 4 % serait signalé à tort. Le repère d'activation de 20-40 %, qui désigne aussi, n'a aucune source primaire. C'est aussi la première carte du bon à tirer nº8 : vérifier d'abord qu'elle n'y est pas déjà tranchée | Les deux repères désignent, avec une réserve imprimée (décision 5 d'`ENGINE.md`). La copie dit « les produits vendus aux petites entreprises » | `ENGINE.md` en tête, `engine-catalog.ts`, `glossary-deep.ts` | **Retirer le pouvoir de désigner aux deux repères** : ils restent affichés comme contexte, et une cible d'équipe désigne toujours. Et reformuler la population du churn (« SaaS B2B à panier élevé »). C'est honnête et simple, sans saisie de plus. Un repère faux pour la moitié du public ne doit pas nommer la fuite |
| C2 | Le nom et l'adresse du moteur : « Moteur de croissance » / "Growth engine", à `/{locale}/aarrr-funnel-template`. **Définitif dès l'ouverture** | Pris par défaut | `ENGINE.md`, décision 1 | Garder : c'est la requête sans concurrent de l'audit SEO |
| C3 | Le crédit « tourdegrowth.com » sur les slides exportées | Présent par défaut, retirable | Décision 2 | Garder |
| C4 | Le périmètre de la v1 : le SaaS libre-service. Le B2B assisté en v1.1, le B2C et la marketplace plus tard | Pris par défaut | Décision 3 | Garder |
| C5 | La slide « déclaré au Tour × mesuré » | Non cochée par défaut | Décision 4 | Garder : elle cite les réponses du Tour mot pour mot, dans un deck qui part en CODIR |
| C6 | Le moteur est public, gratuit et local. Ce n'est pas la phase 3 de l'instrument d'audit | Pris par défaut | Décision 6 | Garder |
| C7 | Les liens d'ouverture : `/how-it-works`, les deux pages SEO d'entrée, une section de la landing sous la citation. Pas de septième lien au pied de page | Prévus, pas encore construits. Aujourd'hui, seuls le bandeau d'étape et le sitemap y mènent, une fois le moteur ouvert (vérifié : `ENGINE_PATH` n'est lu que par `SpaceBand`, `sitemap.ts` et `/admin/preview`) | Décision 7 | Garder. Les construire devient un item A avant l'ouverture (D2) |
| C8 | Le miroir, quand un Tour est présent sur l'appareil mais non relié au moteur | Il n'affiche rien (sans Tour du tout, il invite à faire le Tour) | `ENGINE.md` §8.5, `CLAUDE.md` | Afficher une ligne et le bouton qui relie le Tour. Sinon, la comparaison ne se découvre jamais |
| C9 | La slide « fuite » quand l'étape nommée n'a pas de prix (rétention à J30, part recommandée) ou qu'elle rapporte moins d'un client | La slide est omise | `lib/engine/deck.ts#buildLeak` | Garder l'omission : pas de slide plutôt qu'un titre faux |

### Le jeu

*Décisions prises par défaut le 2026-09-24, pour avancer. Elles n'étaient
écrites que dans le répertoire de travail d'une session, et le sont ici
désormais.*

| # | Question | Aujourd'hui | Reco |
|---|---|---|---|
| C10 | **La place de l'encart du jeu sur le résultat.** Sur desktop, il pousse le bouton principal du visiteur environ 30 px sous le bouton de partage. **Question à poser avec une capture du vrai écran** | Desktop : entre « Là où tu perds du temps » et la rangée de CTA. Mobile : après la carte de partage | Garder jusqu'à un mois de chiffres après l'ouverture (section E), puis décider sur les chiffres |
| C11 | Montrer l'encart quand la rétention est dans le **groupe** qui freine, netteté « partagée » comprise | Oui, et jamais sur un tableau « à niveau » | Garder |
| C12 | Les noms de zones bilingues : « Retention — S'ils reviennent » | Oui | Garder |
| C13 | La mention « vingt minutes » | Gardée seulement si le temps mesuré la porte ; pas encore mesuré | Chronométrer une partie complète à la recette. Garder si on est entre 15 et 25 minutes, sinon écrire le vrai chiffre |
| C14 | **La formule d'amende** donne au moins 97 500 € à radar 75, au-dessus du maximum légal de 75 000 € par manquement | Fiction inoffensive, qu'un juriste relèverait | **Plafonner à 75 000 € par manquement.** Le jeu tient sa crédibilité de faits vérifiés, et le changement tient en une ligne |
| C15 | **Les cartes de la bande de l'accueil : des liens ou non**, et comment les mesurer. Ni le bandeau ni cette bande ne passent par `game_entry_clicked` | Pas des liens. À trancher à l'ouverture du jeu | En faire des liens à l'ouverture, avec une source `home_strip` dans le vocabulaire de `game_entry_clicked` pour que `/admin/stats` les compte |

### Le résultat, la croissance, le dépôt

| # | Question | Aujourd'hui | Reco |
|---|---|---|---|
| C16 | **Le bouton principal du propriétaire sur son résultat** | « Refaire le Tour ». Le partage est un bloc image juste en dessous, et `ShareCard.prompt.md` dit « never primary ». Un essai contraire a été fait puis annulé | Garder. À revoir après A3.2 (le partage avec l'image) et un mois de chiffres |
| C17 | **Une porte de test pour les e2e de composition** : un identifiant de résultat de test derrière une variable d'environnement, fermée par défaut, pour que les e2e passent par le vrai chemin de `/r/<id>`. Aujourd'hui, seul `/r/sample` est testé, et il prend une branche à part | Pas de porte : la garde statique protège seule le payload | Oui, mais fermée par construction en production : refusée dès que `VERCEL` est posé, avec un test qui l'exige. C'est la route publique la plus sensible, et c'est aussi celle qui a fui deux fois (`rawPoints`) |

### Les campagnes

Source : `marketing/campaigns/README.md`, §8. Les recommandations sont celles
de ce tableau.

| # | Question | Reco |
|---|---|---|
| C19 | **D1 : qu'est-ce qui est déjà parti de la vague 1 ?** (Show HN du Tour, posts r/SideProject, r/roastmystartup, r/SaaS, Indie Hackers.) Un second Show HN, ou un second r/SaaS dans les 60 jours, brûle le compte | *Un fait que toi seul connais.* Si le Show HN du Tour n'est pas parti, ne pas le faire : garder les deux créneaux HN pour B et C |
| C20 | **D2 : relancer A sur les réseaux, ou le laisser au seul SEO ?** | Un seul fil X/Bluesky, court, centré sur la carte de résultat, puis laisser composer |
| C21 | **D3 : les captures de B et C**, attendre le design final ou prendre la prévisualisation ? | Attendre la recette de chaque produit, et capturer le jour de l'ouverture |
| C22 | **D4 : la réponse à « qui est derrière ? »** | Garder celle de la vague 1 : « the site credits its author in the footer; I keep this account pseudonymous » |

---

## D. Tes actions, pas à pas

Ce qui ne peut venir que de toi. **Jamais de secret dans une conversation**, et
rien de privé dans le dépôt, qui est public. Cela vaut pour les chiffres de
`/admin/stats`, les données d'une mission d'audit et les noms de clients.

| # | Action | Prête ? | Détail |
|---|---|---|---|
| D2 | **Ouvrir le jeu et le moteur à tout le monde** | Non : il faut les bons à tirer nº7 et nº8 signés, C1 à C15 tranchés, et les liens d'ouverture (C7) construits | Poser `GAME_ENABLED` et/ou `ENGINE_ENABLED` à `true` dans Vercel (Production), puis **redéployer** (`VERCEL.md` §1.11). Ensuite, la session vérifie la production : pages en 200, sitemap, pied de page, bandeau. Toi, tu demandes l'indexation des nouvelles pages dans Search Console |
| D3 | **Lancer la design sync** | Oui | C'est la section B, sur ta machine |
| D4 | **L'instrument d'audit, phase 1 bis : la mission AB Tasty** | Oui | Voir `AUDIT-PLAN.md` §4. Créer la mission sous `/admin/audit` (profil `b2b-assiste`, sans mandat), et faire partir le jour 1 ce qui est lent (T3, T4). Les T1 se font en libre-service, la définition d'abord. Les T2 se font par système. **Tenir le journal des frictions** dans un fichier local jamais commité dès qu'une friction cite l'entreprise. Critère de sortie : `pending = 0`, exporté. La session corrige les frictions en petites PR, et rien de la phase 2 |
| D5 | **À côté de l'outil** | Oui | Les cinq à dix entretiens (`AUDIT-PLAN.md` §2). La vérification de ton contrat de travail (non-concurrence, cession de propriété intellectuelle) : elle conditionne la phase 3, et c'est la seule question qui la ferme à elle seule |
| D6 | **La distribution, vague 1** | Selon C19 à C22 | Textes dans `marketing/launch/` et `marketing/campaigns/`. Tu postes sous pseudo, la session fournit et met à jour les textes. Annuaires dans l'ordre de `GROWTH-PLAN.md` 1.6. **Jamais ton nom, jamais LinkedIn** |
| D7 | **La distribution, vague 4** | Après deux semaines de lecture de la vague 1 | La session écrit les pitchs de newsletters et passe honnêtement le produit de chaque auteur au Tour ; tu envoies depuis `contact@`. Pour les listes « awesome », seulement si ton profil GitHub n'affiche pas ton nom (à vérifier d'abord sur github.com/ScratchMe) |

---

## E. La veille : rien à faire avant un déclencheur

| Déclencheur | Ce qu'on fait alors | Où c'est décrit |
|---|---|---|
| 50 soumissions | Poser `METRICS_PAGE_ENABLED`, publier la page benchmark (vague 2.5), et C2 de `REVIEW-03.md` (l'étape qui freine le plus ce mois-ci) | `CLAUDE.md`, `GROWTH-PLAN.md` |
| Quelques centaines de soumissions | Le percentile, « mieux que X % des Tours » (vague 3.4) | `GROWTH-PLAN.md` |
| Un abus réel | La limite de débit sur un stockage partagé (Upstash) ou le pare-feu Vercel (R-15) | `REVIEW.md` |
| Le Deep dive à ~70 s devient la norme | Réduire le **nombre** de générations, pas le plafond de temps | `GEMINI.md` §2 |
| `eslint-config-next` suit | TypeScript 7 et ESLint 10, testés en installant, pas en lisant les plages de peer | `CLAUDE.md` |
| Un mois après l'ouverture du jeu | La place de l'encart (C10) et le bouton principal (C16), sur les chiffres | Section C |
| **Juin 2027** | La fenêtre Tour de France (R2-30) : Grand Départ le 2 juillet 2027 à Édimbourg. À construire en juin, pour partir pendant le Tour | `GROWTH-PLAN.md` |
| Une facture Vercel qui surprend | `VERCEL.md` §1.6 et §2.2 | `VERCEL.md` |
| Besoin de `guidelines/` du bundle d'extension 01 | Le demander à Claude Design (l'archive ne le contenait pas) | `CLAUDE.md` |
| Un contrat de largeur qui descend à 320 px | À 320 px, le bandeau d'entrée au jeu passe sur trois lignes (la seconde, ≈ 270 px de texte, pour une colonne de 244). Laissé par décision d'Antoine (2026-09-29) : seule une copie plus courte le tiendrait. 360 px est réglé depuis le même jour | `game/GameEntry.module.css` |

Une session de relevé (A6), une fois par mois, suffit à voir passer les trois
premiers.

---

## Les prompts

À copier dans une nouvelle session. Chaque prompt suppose `main` à jour :
ce fichier doit y être avant de lancer.

### Prompt A — le travail autonome (une session par lot)

Remplace `A1` par le lot voulu. Pour enchaîner plusieurs lots dans une même
session, écris « les lots A1 à A3, dans l'ordre, une PR par lot ».

```text
Tu reprends Tour de Growth en autonomie sur le lot A1 de CHANTIERS.md.

1. Lis CLAUDE.md (chargé d'office), la section A de CHANTIERS.md et ton lot, puis les fichiers d'outil que ses déclencheurs imposent (VERCEL.md avant tout merge, TESTING.md avant d'annoncer quoi que ce soit comme vérifié, FIRESTORE.md si tu ajoutes une lecture publique).
2. Re-mesure chaque constat avant d'y toucher : les chiffres datent du 2026-09-29. Un constat déjà résolu se retire, il ne se corrige pas.
3. Crée ta branche depuis origin/main avant la première édition.
4. Chaque correctif a son test ou sa garde, et sa non-vacuité. Vérifie à l'écran, en français et en anglais, à 1280 et 390 px. Toute copie neuve porte « // TODO: à relire (convention 6). ».
5. Avant la PR : tsc, lint, vitest --coverage, build avec GAME_ENABLED=true NEXT_PUBLIC_GOATCOUNTER_CODE=e2e-stub ADMIN_DASHBOARD_PASSWORD=e2e-admin, Playwright complet, et les relecteurs qui s'appliquent (relecteur-securite pour une route, le proxy ou un payload ; relecteur-copie pour de la copie).
6. Une PR par lot. Merge-la toi-même quand elle est verte, en suivant /livrer (lu, pas appelé), sauf si sa barrière §0 dit de me demander. Vérifie en production.
7. Si tu rencontres une question produit ou de design, ne la tranche pas : ajoute-la en section C de CHANTIERS.md avec ta recommandation, et continue le reste.
8. À la fin : retire de CHANTIERS.md ce qui est livré, ajoute l'entrée de JOURNAL.md, mets à jour CLAUDE.md si l'état courant change.

Réponds-moi en français, court : ce qui est livré, ce qui est vérifié et comment, ce qui reste.
```

### Prompt B — la design sync (Claude Code sur ta machine)

```text
Tu tournes sur ma machine, dans mon clone de tourdegrowth. Mission : la section B de CHANTIERS.md.

1. git switch main, git pull, npm ci.
2. Lis .design-sync/NOTES.md en entier avant toute commande : ce dépôt est une app, pas un paquet de composants, et trois réglages non évidents en découlent.
3. B1 — Lance /design-sync pour mettre à jour le projet Claude Design existant (23b9671c-a55b-452e-aa41-39906ee71ba8), sans en créer un nouveau. Recompte les composants, les cellules et les aperçus rendus : au 2026-09-29, c'était 77, 244 et 77/77. Trois avertissements sont attendus (« Impact », GRID_OVERFLOW sur DefinitionPopover et QuarterNews) ; n'applique pas le cardMode "single" suggéré. Tout autre avertissement ou erreur : arrête-toi et explique-moi avant de corriger.
4. Si le bundle ne se construit pas, corrige sur une branche (jamais sur main) et documente la cause dans .design-sync/NOTES.md.
5. B2 — Écris design/DS-EXTENSION-BRIEF-04.md sur les primitives de formulaire (S-15), sur la forme des briefs 01 et 03 : ce qui existe en deux copies (moteur et audit), ce qu'on attend (des primitives dans core/, leurs états, les deux langues, la version nuit), les contraintes (tokens, contraste AA, cibles de 44 px). Montre-le-moi avant de l'envoyer à Claude Design.
6. À la fin, sur une branche : mets à jour la section B de CHANTIERS.md, la ligne « Design system → Claude Design » de CLAUDE.md, et une entrée de JOURNAL.md. Ouvre la PR ; merge-la quand elle est verte.

Réponds-moi en français.
```

### Prompt C — tes décisions, une par une

```text
Tu es là pour me faire trancher, une par une, les décisions de la section C de CHANTIERS.md. Tu n'écris pas de code.

1. Lis CLAUDE.md, la section C, et pour chaque question sa source.
2. Avant de poser une question, vérifie qu'elle est encore ouverte : dans le code, le journal et le document source. Pour C1, demande-moi d'abord si je l'ai déjà tranchée dans le bon à tirer nº8.
3. Pose-les une par une avec AskUserQuestion, dans l'ordre. Pour chacune : ce que c'est, ce qui est en jeu, ce qui est en place aujourd'hui, ta recommandation en premier avec « (Recommandé) », et ce qu'on casse si on se trompe. Une question de design se pose avec une capture du vrai écran (build local avec GAME_ENABLED et ENGINE_ENABLED, ou l'aperçu propriétaire), pas avec sa description.
4. Après chaque réponse, consigne-la tout de suite, datée, là où vit la question (ENGINE.md, marketing/campaigns/README.md, CHANTIERS.md), puis passe à la suivante. « On verra » se note aussi.
5. Toute réponse qui demande du code devient un item de la section A de CHANTIERS.md, assez précis pour qu'une session autonome le fasse sans me reposer la question. Toute réponse qui demande un geste de ma part devient un item de la section D.
6. À la fin : mets à jour la ligne « Décisions qui attendent Antoine » de CLAUDE.md, ajoute l'entrée de JOURNAL.md, ouvre une PR de doc seule et merge-la quand elle est verte (/livrer lu, pas appelé).

Réponds-moi en français.
```

### Prompt D — tes actions, pas à pas

```text
Tu m'accompagnes pas à pas dans les actions qui ne peuvent venir que de moi : la section D de CHANTIERS.md.

1. Lis CLAUDE.md, la section D, et pour chaque action sa source (AUDIT-PLAN.md §4, GROWTH-PLAN.md, marketing/, VERCEL.md §1.11).
2. Commence par me dire ce qui est prêt maintenant et ce qui attend quelque chose. Demande-moi ensuite par quoi on commence (AskUserQuestion).
3. Une action à la fois, en étapes courtes : où aller, quoi cliquer ou taper, ce que je dois voir. Attends ma confirmation avant l'étape suivante.
4. Vérifie toi-même tout ce qui se vérifie d'ici (la production par curl, GitHub par l'API, les stats par le workflow chiffré) et dis-moi ce que tu as constaté. Pour le reste, demande-moi ce que je vois.
5. Ne me demande jamais un mot de passe, une clé ou un secret. Rien de privé ne va dans le dépôt : il est public (chiffres de /admin/stats, données d'une mission d'audit, noms de clients).
6. Promotion : jamais mon nom, jamais LinkedIn. Tu fournis les textes, je poste sous pseudo.
7. Quand une action est faite : retire-la de CHANTIERS.md, mets à jour CLAUDE.md si l'état change, ajoute l'entrée de JOURNAL.md ; PR de doc seule, mergée quand elle est verte. Si une action révèle du code à écrire, ne l'écris pas ici : ajoute-le en section A.

Réponds-moi en français.
```
