# Instrument d'audit growth — le plan

*Le plan de construction de l'instrument spécifié dans `AUDIT.md`, phase par
phase, étape par étape, avec l'ordre à suivre et ce qui déclenche chaque
passage. Trois documents se partagent le sujet et ne se recouvrent pas :
`AUDIT.md` dit **ce que c'est** (le schéma, les règles que le code applique) ;
ce document dit **dans quel ordre on le construit et pourquoi** ; `CLAUDE.md`
tient **le journal** de ce qui a été livré. Quand une étape est livrée, on met
à jour sa ligne ici et on écrit l'entrée habituelle dans `CLAUDE.md`. Ce
fichier est la référence : si une session se souvient d'un plan différent,
c'est ce fichier qui a raison, et c'est lui qu'on corrige si le plan change.*

*Dernière mise à jour : 2026-09-13 (phase 0 livrée, phase 1 non commencée).*

---

## 0. Le plan en une page

| Phase | Ce qu'elle produit | Déclencheur | Critère de sortie | Qui | État |
|---|---|---|---|---|---|
| **0 — Schéma** | `src/lib/audit/` (types, validateur, compteurs, promotion, quadrants, diff, purge), `src/content/audit-catalog.ts` (39 lignes), garde de frontière, `AUDIT.md` | Les dix réponses d'Antoine à la grille | Les cinq décisions irrattrapables prises et testées | Session | **Livrée** (PR #129, 2026-09-13) |
| **1 — Saisie** | La route `/admin/audit` : créer une mission, renseigner les lignes, enregistrer les définitions, remplir le Tour, écrire les constats, exporter/importer/purger un fichier JSON — sans qu'un octet parte au serveur | Feu vert d'Antoine sur ce plan | Une mission complète fait l'aller-retour fichier ; la spec « canari » prouve que rien ne sort du navigateur | Session | **À faire — prochain chantier** |
| **1 bis — Première mission réelle** | Un fichier de mission AB Tasty, sans mandat, `pending = 0`, exporté ; un journal des frictions ; les entretiens lancés | Phase 1 mergée | Le fichier est valide et complet ; la liste des frictions est écrite | Antoine (la mission), session (les correctifs) | Après la phase 1 |
| **2 — Readouts** | Les quatre artefacts du §6 d'`AUDIT.md`, générés depuis le JSON sans édition manuelle ; les passes multiples et leur diff | Phase 1 bis terminée **et** bon à tirer nº4 signé | Le readout AB Tasty sort de l'outil tel quel et sert en réunion | Session | Après la phase 1 bis |
| **2 bis — Trois à cinq missions réelles** | Autant de fichiers, un journal par mission (source dominante, lignes toujours absentes, ce que la présentation a obtenu) | Phase 2 livrée | Les données du Go/No-Go existent | Antoine | 2-3 mois après la phase 2 |
| **Go / No-Go** | Une décision écrite ici | Phase 2 bis terminée, entretiens faits, contrat de travail vérifié | La décision et ses raisons sont dans ce fichier | Antoine | — |
| **3 — Au-delà** | Un connecteur pour *la* source dominante, une vraie interface de Decision Ledger, puis seulement la conversation produit (dépôt séparé, pricing) | **Go** uniquement | — | — | **Fermée** jusqu'au Go |

**L'ordre n'est pas négociable sur trois points**, parce que chacun protège
contre une erreur déjà payée une fois sur ce dépôt :

1. **Pas de readout avant une mission réelle.** Un générateur de livrable
   écrit avant d'avoir renseigné une seule vraie ligne encode les frictions
   qu'on imagine, pas celles qu'on rencontre. La phase 1 bis existe pour ça,
   et elle est courte.
2. **Pas de livrable imprimé avant le bon à tirer nº4.** Les 39 lignes du
   catalogue sont le texte qui s'imprimera sous le nom d'Antoine ; elles
   n'ont pas été relues (convention 6 de `CLAUDE.md`). La saisie peut les
   afficher (c'est de l'aide à la collecte) ; le readout ne peut pas les
   imprimer.
3. **Rien qui ressemble à un produit avant le Go.** Comptes, connecteurs,
   API, benchmarks agrégés, pricing : tout ça est derrière une porte que seuls
   les entretiens et le contrat de travail ouvrent. Ce n'est pas de la
   prudence, c'est la conclusion des deux passes d'instruction du 2026-09-12
   (voir `CLAUDE.md`, entrée « Instrument d'audit growth, phase 0 »).

---

## 1. Les principes qui ordonnent tout le plan

1. **L'irrattrapable d'abord.** Les cinq décisions de schéma (série, constat
   distinct, prose dans le JSON, catalogue embarqué, coût de réparation)
   étaient les seules qu'on ne pouvait pas corriger après coup. Elles sont
   prises. Tout le reste est réversible, donc se décide au moment où on en a
   besoin, sur un usage réel.
2. **Un usage réel entre chaque phase.** Phase 1 → mission réelle → phase 2
   → missions réelles → décision. Jamais deux phases de construction
   d'affilée sans qu'Antoine ait utilisé ce qui précède.
3. **Le serveur ne voit jamais un chiffre.** Toute la donnée de mission vit
   dans le navigateur et dans un fichier qu'Antoine possède. Cette règle est
   testée à chaque build (`src/__tests__/audit-boundary.test.ts`) et le sera
   à chaque passe e2e (la spec « canari », §3.6). Une étape qui aurait besoin
   de l'enfreindre n'est pas une étape de ce plan.
4. **Une copie ne s'imprime qu'après bon à tirer.** Convention 6 de
   `CLAUDE.md`, appliquée ici à un texte qui engage le nom d'Antoine devant
   une direction.
5. **Un chantier par PR, vérifié en réel, et des merges espacés.** Chaque
   étape ci-dessous est une PR avec ses tests unitaires, ses specs Playwright
   et sa capture. Depuis le 2026-09-13, seul le déploiement de production
   tourne sur Vercel (`vercel.json`), donc chaque merge déploie ; avec le
   stockage de fonctions qui vient de frôler sa limite, on ne merge pas six
   PR dans la même soirée.
6. **On décide seul ce qui coûte une ligne, on remonte ce qui coûte une
   semaine.** Les décisions prises dans ce plan sans Antoine sont listées
   explicitement (§3.3) pour qu'il puisse les contester en une phrase.

---

## 2. Phase 0 — Schéma (livrée le 2026-09-13)

**Ce qui existe** : `src/lib/audit/{schema,validate,coverage,findings,quadrants,diff,purge}.ts`,
tous purs ; `src/content/audit-catalog.ts` (19 lignes de socle + 20 variantes
de profil, version `2026-09-13.1`) ; `src/__tests__/audit-boundary.test.ts` ;
`AUDIT.md`. 91 tests unitaires. Détail complet dans `AUDIT.md` §3-§5 et dans
l'entrée de journal de `CLAUDE.md`.

**Ce que la phase 0 ne fait pas, volontairement** : aucune route, aucun
composant, rien de visible. Le schéma a été livré seul parce que c'était la
seule partie qu'on ne rattrape pas.

**Ce qui reste ouvert et appartient à Antoine, hors code** :

- **Le bon à tirer nº4** (les 39 lignes du catalogue) :
  https://claude.ai/code/artifact/d45d5d7d-fdfa-4155-ba0d-76290e331dc8.
  Il ne bloque pas la phase 1 ; il bloque la phase 2 (règle 2 du §0).
- **Les questions 6 et 7** de la grille ont reçu des défauts (relecture de
  dossiers pour la cause de churn ; plafond de 8 headlines en constante).
  Ils tiennent tant qu'il ne les contredit pas.
- **Les entretiens** (cinq à dix personnes dans sa situation — PM growth ou
  Heads of Growth dans des boîtes moyennes où « on score sous 50 ») ne
  dépendent d'aucun code et peuvent commencer maintenant. Ils sont une entrée
  du Go/No-Go (§7), pas de la phase 1. Question à ajouter à celles du
  document de l'expert : « quand tu arrives dans une nouvelle boîte, combien
  de temps avant d'avoir une vue des chiffres, et qui te les a donnés ? ».

---

## 3. Phase 1 — La saisie (`/admin/audit`)

### 3.1 Objectif et critère de sortie

**Objectif** : qu'Antoine puisse mener la mission AB Tasty de bout en bout
dans l'outil — créer la mission, renseigner chacune des 25 lignes applicables
au profil B2B assisté (statut, cause, coût de réparation, définition,
observations, critère, décision en jeu, pilotage), remplir les 15 réponses du
Tour en tant qu'auditeur, écrire les constats et le bloc de tête — et qu'à
tout moment il puisse emporter ce travail dans un fichier qu'il possède.

**Critère de sortie, vérifiable** :

- Une mission créée dans l'outil, renseignée sur au moins une ligne de
  chaque statut, exportée, le navigateur fermé et ses données de site
  effacées, le fichier réimporté : tout est là, y compris les compteurs.
- `validateMission` est `ok: true` sur ce fichier et les compteurs affichés
  sont ceux que `computeCoverage` calcule (une spec le vérifie en lisant les
  deux).
- Une copie purgée exportée depuis la même mission ne contient ni le nom de
  l'entreprise, ni une valeur, ni une ligne de prose — la mission de travail,
  elle, n'a pas bougé.
- La spec « canari » (§3.6) passe : pendant tout ce parcours, aucune requête
  sortante ne porte un octet de la mission.
- La passe axe est verte sur la route, et le parcours se fait au clavier
  (même exigence que R-19 pour le questionnaire).

### 3.2 Décisions d'architecture déjà fixées (par `AUDIT.md` et la grille)

- **Route** `src/app/(app)/admin/audit/` — derrière le Basic Auth que
  `src/proxy.ts` applique déjà à tout `/admin/*` (`ADMIN_DASHBOARD_PASSWORD`,
  qui échoue fermé). `dynamic = "force-dynamic"`, `robots: noindex`, comme
  `/admin/stats`. Aucune logique d'auth dans la page : elle fait confiance à
  avoir été laissée passer.
- **Server Component + îlot client.** `page.tsx` résout côté serveur tout ce
  qui est du **contenu** — le catalogue à embarquer (`snapshotCatalog()`),
  les fiches longues des termes de glossaire référencés par les lignes
  (`content/glossary-deep.ts`, déjà serveur seulement), les 15 questions du
  Tour avec leurs options et leurs points — et le passe en props à un îlot
  `"use client"` (`AuditWorkbench.tsx`) qui **détient la mission**. L'îlot
  n'importe rien de `content/`, ni directement ni par transitivité.
- **Persistance** : `localStorage`, clé `tdg.audit.v1`, même motif que
  `tdg.results.v1` (`lib/quiz/storage.ts` : SSR-safe, validateur de forme qui
  filtre, jamais une exception). **Le fichier JSON est le stockage durable ;
  `localStorage` n'est que le brouillon de session.** L'outil propose l'export
  à la fin de chaque session et affiche en permanence « modifications non
  exportées depuis … » — le repo documente déjà que `localStorage` se perd au
  changement de machine (R-01).
- **Aucun appel réseau depuis l'îlot.** Pas de `fetch`, pas de Server Action,
  pas de route API. Import et export passent par le sélecteur de fichier et
  un `<a download>` sur un `Blob` (c'est l'app, pas un artifact : le
  téléchargement fonctionne).
- **Le catalogue affiché est celui embarqué dans la mission**, pas celui du
  jour. Si les deux versions diffèrent, l'outil le dit (bandeau « catalogue
  `2026-09-13.1`, version courante `X` ») et ne migre jamais seul.

### 3.3 Décisions prises pour ce plan, à contester en une phrase

1. **Les primitives de formulaire sont locales à la route, pas dans le design
   system.** Le système n'a **aucun `<input>`** — `core/TextArea` se décrit
   comme « the system's only text input » — et la saisie a besoin d'un champ
   nombre, d'un champ date, d'un sélecteur pour chaque vocabulaire fermé
   (sept statuts, quatre causes, six sortes de source…), d'un éditeur de
   matrice. Passer par un brief Claude Design (le circuit des extensions 01
   et 03) coûterait un aller-retour de plusieurs jours pour un outil à un
   utilisateur qui n'est pas une surface produit. Décision : `_ui/` sous la
   route (le `_` en fait un dossier privé pour Next, jamais routé), construit
   aux tokens seuls, **jamais ajouté à `src/components/` ni synchronisé vers
   Claude Design**. Le jour où un de ces champs doit apparaître dans le
   produit, il repasse par un brief. `Segmented` sert pour les vocabulaires à
   deux ou trois valeurs (mandat, cohorte/instantané), `TextArea` pour toute
   prose, `Disclosure` pour les fiches, `Card`/`Button`/`MetaLabel` pour le
   reste.
2. **L'import est tolérant, le readout est strict.** Une mission en cours est
   *souvent* invalide au sens de `validateMission` (une ligne passée en
   « mesuré » dont l'observation n'est pas encore saisie). Refuser de rouvrir
   son propre brouillon serait le piège déjà rencontré avec la purge en phase
   0. Donc : l'import accepte tout fichier qui passe le **contrôle de forme**
   (`schemaVersion === 1`, les tableaux et objets attendus) et affiche les
   erreurs du validateur comme une liste de choses à finir ; l'export
   fonctionne toujours ; c'est la génération d'un readout (phase 2) qui exige
   `ok: true` et `pending === 0`.
3. **La purge est deux actions, pas une.** « Exporter une copie purgée »
   (non destructif : la mission de travail reste intacte — c'est ce qui
   produit un exemple montrable) et « Purger et retirer de cet appareil »
   (destructif : pour la fin de mission ou une obligation de NDA ; demande de
   retaper le nom de l'entreprise, comme la suppression d'un dépôt GitHub).
4. **La vue collecte compte des lignes par palier, pas des heures.** La
   grille demandait « un cumul d'heures estimées » ; le catalogue porte le
   palier (T0-T4) et un texte libre de coût, pas un nombre d'heures.
   Inventer une table palier → heures serait une fausse précision. Phase 1 :
   « reste 1 ligne T4, 3 lignes T3, 12 lignes T2… » ; on verra après la
   première mission si un nombre d'heures par ligne mérite d'entrer dans le
   catalogue (ce serait une nouvelle version).
5. **Les formes de valeur sont rendues par quatre éditeurs, pas six.**
   `valueShape` est un indice, pas une contrainte (phase 0). `scalar` (10
   lignes) → un nombre ; `qualitative` (2) → un texte court ; `matrix` (2) →
   l'éditeur de matrice (colonnes × lignes, avec le N de chaque ligne) ;
   `couple` (12), `distribution` (9) et `composite` (4) → **la même matrice
   réduite à une ligne** (un couple = deux colonnes, une distribution = N
   colonnes). `ObservationValue` accepte déjà `Matrix` : aucun changement de
   schéma.
6. **La première passe est créée avec la mission.** `newPass` existe déjà ;
   l'écran « créer une mission » crée la mission et sa passe 1 d'un coup
   (date d'arrêté demandée). Une seconde passe est un besoin à six mois : son
   écran est en phase 2 (§5.2, étape 2.6).
7. **La cause de churn (m16) et le Tour (m19) sont des lignes T0** — produites
   par l'audit lui-même. Elles apparaissent dans la vue collecte comme les
   autres, avec une mention « à produire par l'auditeur » ; m19 se remplit
   depuis l'écran du Tour (étape 1.4), jamais à la main.

### 3.4 Les étapes, dans l'ordre — une PR chacune

Chaque étape liste ce qu'elle livre, où, comment elle est testée et ce qui
permet de la dire finie. L'ordre est celui des dépendances : rien de visible
avant que le stockage et la frontière soient tenus ; les écrans dans l'ordre
où une mission réelle en a besoin (créer → collecter → renseigner → scorer →
conclure).

#### 1.1 — Découpler `lib/audit` du contenu, et le stockage

*Sans écran. C'est la PR qui rend l'îlot possible sans casser la règle « le
serveur résout, le client reçoit des props ».*

Aujourd'hui `schema.ts#snapshotCatalog` importe `AUDIT_CATALOG` (65 Ko de
texte), `validate.ts` importe `AUDIT_PROFILE_MODELS` depuis le même module,
et `quadrants.ts` importe `QUESTIONS` de `copy-library` et `computeScore`
(qui l'importe aussi). Un îlot qui importerait `lib/audit` tel quel
embarquerait le catalogue et la bibliothèque de copie dans son bundle — la
garde « aucun Client Component n'importe le catalogue » ne regarde que les
imports directs et ne le verrait pas.

- **Livre** :
  - `AUDIT_PROFILE_MODELS` déménage dans un petit module sans import
    (`lib/audit/profiles.ts`) ; le catalogue et `schema.ts` l'importent de
    là. `lib/audit` n'importe plus du catalogue que des **types**
    (`import type`, effacés à la compilation).
  - `snapshotCatalog()` part dans un module serveur `lib/audit/server.ts`
    avec `tourQuestions()` (id, pilier, texte FR, options avec points) ;
    `newMission` reçoit `catalog` en paramètre.
  - `quadrants.ts` reçoit les questions en paramètre (`practicePoints`,
    `declaresMeasured`, `tourScore`) ; `lib/scoring/score.ts` gagne
    `computeScoreFrom(answers, questions)`, dont `computeScore` devient un
    appel avec `QUESTIONS` — refactor mécanique, **aucun test du moteur ne
    change**, c'est le critère.
  - `lib/audit/storage.ts` (navigateur seulement) : `loadMissions()`,
    `saveMission()`, `deleteMission()`, `loadDraftMeta()` (date du dernier
    export par mission). Une seule clé `tdg.audit.v1`, un tableau de
    missions ; quota-safe (une écriture qui échoue est signalée à l'écran,
    jamais silencieuse — contrairement au quiz, ici perdre la saisie coûte
    des heures).
  - `lib/audit/io.ts` (pur) : `serializeMission()` (JSON indenté, stable —
    le fichier doit se relire dans un diff Git), `fileNameFor(mission)`
    (`diagnostic-growth-<entreprise-slug>-<date>.json`, suffixe `-purge`
    pour une copie purgée), `parseMissionFile(text)` → contrôle de forme puis
    `validateMission`, renvoie `{ mission, errors }` et jamais une exception.
- **Tests** : `storage.test.ts` avec un faux `window` (motif de
  `quiz/__tests__/storage.test.ts`) ; `io.test.ts` (aller-retour
  sérialisation, nom de fichier, fichier invalide en forme refusé, fichier
  valide en forme mais invalide au validateur accepté avec ses erreurs) ;
  `audit-boundary.test.ts` gagne une **marche transitive** : depuis
  `AuditWorkbench.tsx`, aucun module atteint par les imports relatifs ou
  `@/` n'est sous `content/`. Non-vacuité à prouver : importer volontairement
  le catalogue dans l'îlot doit faire tomber ce test.
- **Fini quand** : `tsc`, lint, la suite complète, et le test transitif
  vert avec un `AuditWorkbench.tsx` vide (posé dans cette PR pour que la
  garde existe avant le premier écran).

#### 1.2 — La route, les missions, le fichier

*Après cette PR, Antoine peut créer la mission AB Tasty et emporter le
fichier — même si aucune ligne n'est encore saisissable.*

- **Livre** :
  - `page.tsx` (Server Component) : résout catalogue, fiches de glossaire
    long pour les lignes qui en ont, questions du Tour ; rend l'en-tête
    admin (wordmark, lien vers `/admin/stats`) et l'îlot.
  - **Écran « missions »** : la liste des missions de l'appareil (entreprise,
    profil, date de création, couverture de la dernière passe, date du
    dernier export, badge « purgée ») ; « Nouvelle mission » ; « Importer un
    fichier ».
  - **Écran « nouvelle mission »** : le `MissionHeader` complet —
    entreprise, mandat (`Segmented`, `no-mandate` présélectionné, q1),
    profil (modèle, tranche d'ACV, durée d'engagement), périmètre
    (placeholder « tout »), devise, langue du livrable, `showTourScore`
    (q3, décoché par défaut), date d'arrêté de la passe 1. Crée mission +
    passe 1.
  - **Barre de mission**, présente sur tous les écrans d'une mission
    ouverte : les **trois compteurs en fraction** (« 8 documentées sur 25 ·
    l'entreprise n'en a pas 3 · sans accès 1 · en attente 13 »), le titre
    que donnerait le livrable (`deliverableVocabulary` — donc le titre
    d'escalade apparaît dès que la couverture passe sous le tiers),
    « Exporter », « Exporter une copie purgée », « Fermer ».
  - **Import** : sélecteur de fichier, `parseMissionFile`, écran de
    confirmation qui montre l'en-tête lu, la version de catalogue embarquée,
    et la liste des erreurs du validateur s'il y en a (décision 2 du §3.3) ;
    une mission dont l'`id` existe déjà sur l'appareil demande « remplacer /
    garder les deux ».
  - **Purge** : les deux actions de la décision 3.
- **Tests** : specs Playwright `e2e/audit-missions.spec.ts` — créer,
  exporter (lire le fichier téléchargé, le passer à `validateMission` dans le
  test), effacer les données de site, réimporter, retrouver ; importer un
  fichier purgé du fixtures ; le titre d'escalade quand la couverture est
  sous le tiers ; la purge destructive exige le nom. Passe axe sur les trois
  écrans.
- **Prérequis CI** : la route est derrière le Basic Auth et il n'existe
  aujourd'hui **aucune spec sur `/admin/*`**. `ci.yml` pose
  `ADMIN_DASHBOARD_PASSWORD: e2e-admin` au niveau du workflow (même
  mécanisme que `NEXT_PUBLIC_GOATCOUNTER_CODE: e2e-stub`), les specs admin
  utilisent `test.use({ httpCredentials })`, et `e2e/helpers.ts` gagne un
  helper qui lit le mot de passe depuis l'environnement — en local, sans la
  variable, ces specs sont **sautées avec un message**, jamais faussement
  vertes ni faussement rouges (le piège de R-11 et son inverse de R2-26).
- **Fini quand** : la mission AB Tasty peut être créée, exportée, réimportée
  sur le vrai build.

#### 1.3 — L'éditeur de ligne, et les deux vues

*Le cœur de la phase. La plus grosse PR ; si elle dépasse ce qu'une revue
peut relire, la couper en 1.3a (statuts, absence, définitions, observations)
et 1.3b (critère, décision, exposition, gouvernance, pilotage, vues).*

- **Livre — la vue collecte** (la vue par défaut d'une mission ouverte,
  grille §8) : les lignes applicables **triées par palier décroissant**
  (T4 et T3 en tête : elles doivent partir le premier jour), groupées par
  `tracking.routedTo` quand il est renseigné et par système source sinon ;
  pour chaque ligne le statut, les dates `requestedOn` / `chasedOn` /
  `receivedOn` éditables en place, et les demandes sans réponse remontées en
  haut ; le compteur de lignes restantes par palier (décision 4).
- **Livre — la vue restitution** : les mêmes lignes groupées par pilier
  AARRR, avec leur quadrant méthode × réalité (étape 1.4 le rendra complet ;
  avant, `pending`/`known-gap`/`unverifiable` suffisent).
- **Livre — l'éditeur d'une ligne**, en deux colonnes : à gauche **la fiche
  du catalogue** (définition, piège, où le trouver, décision en jeu, ce que
  dit son absence, et la fiche de glossaire long dépliable quand la ligne en
  a une) ; à droite la saisie, dont les champs apparaissent **selon le
  statut** :
  - `status` (sept valeurs, `not-applicable` grisé et non sélectionnable
    sur une ligne applicable — le validateur le refuse, l'UI ne le propose
    pas) ;
  - `absent` → `absentCause` (défaut `type-not-established`, affiché comme
    tel, jamais pré-rempli sur autre chose), `repairCost` (échelle + commentaire,
    **requis**), `systemCause` (liste fermée, aucun champ libre) ;
  - `measured` / `estimated` / `reported-without-definition` / `contested` →
    la **définition** (créer ou choisir une `MetricDefinition` : unité,
    population numérateur, population dénominateur, périmètre requis ; les
    axes optionnels dépliés ; **modifier une définition déjà référencée
    frappe une nouvelle version**, `registerDefinition` le garantit) et les
    **observations** (la série : période et type, valeur selon l'éditeur de
    la décision 5, système source, sorte de source, mode d'obtention, rôle
    fournisseur — jamais un nom —, date de tirage distincte de la fin de
    période, délai de fraîcheur, `contradicts` vers une autre observation) ;
    `contested` exige deux observations et l'écran le dit avant le
    validateur ; la **confiance dérivée** (`confidenceOf`) s'affiche à côté
    de chaque observation, jamais saisissable ;
  - pour toute ligne : `criterion` (repère public avec source, population,
    n, année ; seuil argumenté avec **justification requise** ; tendance
    interne — et la mention « rétrogradé en tendance interne, pas de repère
    externe » affichée dès que `effectiveCriterion` le décide),
    `decisionAtStake` **pré-rempli depuis `row.decision` du catalogue** mais
    éditable et effaçable (vide = la ligne n'entre pas dans les constats, et
    l'écran l'écrit), `canonicalDeviation` (avec la règle d'écriture d'`AUDIT.md`
    §5 en aide : une convention, jamais un chiffre), `exposure` (inputs
    fournis par l'entreprise, calcul, fourchette), `ownerRole`,
    `lastReviewedInADecision`, `tracking.mandateLevel` et `routedTo`.
  - les erreurs de `validateMission` qui concernent **cette ligne**
    s'affichent en place ; le total de la mission reste dans la barre.
- **Tests** : unitaires sur les helpers d'écran purs qu'on extraira
  (dérivation des champs visibles par statut, tri par palier, groupement) ;
  specs Playwright : renseigner une ligne de chaque statut et retrouver
  exactement les compteurs attendus ; un `contested` à une observation
  montre l'erreur ; changer un axe d'une définition référencée crée `@2` et
  laisse `@1` ; l'exposition refuse un input sans source ; le clavier fait
  tout le tour d'une ligne ; axe vert.
- **Fini quand** : les 25 lignes de la mission AB Tasty sont saisissables
  jusqu'à `pending = 0` sur le vrai build, et une mission complète exportée
  est `ok: true`.

#### 1.4 — Le Tour, et le croisement méthode × réalité

- **Livre** : l'écran des 15 questions avec les composants du questionnaire
  (`QuestionCard`, `AnswerOption` — les textes arrivent en props, comme sur
  `/quiz`), rempli **par l'auditeur** avec un rappel visible « tes réponses
  d'auditeur, jamais une auto-évaluation envoyée à l'équipe » ; réponses
  partielles autorisées ; le score n'apparaît qu'à 15/15 (`tourScore`) et
  toujours avec son détail par question (`showTourScore` ne concerne que le
  livrable, pas cet écran) ; m19 passe en `measured` automatiquement à
  15/15, avec une observation dont la valeur est le score, la source
  `raw-extract-self`, et une définition enregistrée d'office (unité :
  points sur 100 ; numérateur et dénominateur : les 15 questions du Tour et
  leurs points ; périmètre : celui de la mission) — sans elle le validateur
  refuserait la ligne. La vue restitution affiche alors le **quadrant
  complet** par ligne, et une colonne « angles morts » (`blind-spot`) en
  tête : c'est le quadrant le plus rentable de l'exercice.
- **Tests** : specs — un 20 points sur `acq-3` avec un CAC `absent` donne
  `blind-spot` ; les 15 réponses font apparaître le score et m19 ; 14
  réponses ne le font pas.
- **Fini quand** : le Tour AB Tasty est rempli et les angles morts listés.

#### 1.5 — Les constats et le bloc de tête

- **Livre** : l'écran des constats — la liste des lignes **promouvables**
  (`isPromotable` : critère + décision en jeu), « nouveau constat » depuis
  une ou plusieurs d'entre elles (`refs`), le formulaire 5C (critères,
  condition, cause depuis la liste fermée, conséquence, action corrective),
  le `gap` (quatre valeurs), le Decision Ledger (problème → preuves →
  hypothèse → décision → attendu ; obtenu / appris / suite laissés vides
  jusqu'à la passe suivante), `agreedAction` avec la mention « à remplir en
  entretien, pas à la rédaction » ; les bascules **headline** (grisée au
  plafond de 8, `canMarkHeadline`) et **priorité** (`setPriority` — en
  marquer une seconde démarque la première, et l'écran le montre plutôt que
  de l'expliquer). Le **bloc de tête** (`brief` : constat principal, une
  action, la preuve) avec le compteur de mots sur 400 (`wordCount`,
  `splitAtBudget` : ce qui dépasse est montré comme « basculera en annexe »,
  jamais coupé).
- **Tests** : specs — le neuvième headline est refusé ; deux priorités
  impossibles ; un constat sans référence impossible ; le compteur de mots
  et son dépassement.
- **Fini quand** : la mission AB Tasty a ses constats et son bloc de tête
  dans le fichier.

#### 1.6 — Recette de bout en bout, canari, documentation

- **Livre** : `e2e/audit-canary.spec.ts` (§3.6) ; la passe axe étendue à
  tous les écrans de la route ; `e2e/keyboard.spec.ts` étendu à l'éditeur de
  ligne ; captures relues en 1280 et 390 (l'outil est d'abord un outil de
  bureau, mais une relance depuis un téléphone entre deux réunions doit
  rester possible : lecture, dates de pilotage, pas la saisie complète) ;
  `AUDIT.md` §7 et ce fichier mis à jour ; l'entrée de journal dans
  `CLAUDE.md` avec les chiffres de référence.
- **Fini quand** : tout le §3.1 est vérifié sur le vrai build.

### 3.5 Ce que la phase 1 ne fait pas

- Aucun readout, aucun HTML imprimable, aucun bloc Markdown — phase 2.
- Aucune seconde passe ni diff à l'écran (le code existe, pas l'écran) —
  phase 2.
- Aucune traduction du catalogue — phase 2, et seulement si une mission
  réelle a `deliverableLocale: "en"`.
- Aucune migration entre versions de catalogue — l'outil affiche l'écart,
  c'est tout.
- Aucun composant nouveau dans le design system, aucun brief Claude Design.
- Aucune télémétrie : la route est déjà comptée en pageviews par GoatCounter
  (comme `/admin/stats`), et on n'ajoute **aucun événement custom** sur ce
  qui se passe dans l'outil — le nom d'une entreprise n'a rien à faire dans
  un chemin d'événement, même hashé.

### 3.6 Vérification transverse

- **La spec canari** (`e2e/audit-canary.spec.ts`) : une mission créée avec
  un nom d'entreprise et une valeur d'observation qui sont des chaînes
  canari (`TDG-CANARY-…`), tout le parcours joué (créer, saisir, exporter,
  réimporter, purger), pendant que `page.route("**/*")` enregistre **toute**
  requête ; assertions : aucune requête non-`GET` pendant toute la session,
  aucune requête dont l'URL ou le corps contient un canari, et le fichier
  exporté contient bien les deux (sinon la spec ne prouve rien). Même
  raisonnement que la sonde de production du 2026-09-05 : on teste
  l'invariant, pas un proxy de l'invariant.
- **La garde statique transitive** (étape 1.1), qui vaut à chaque build.
- **La règle d'écran commune** : tout ce que le validateur refuse est
  montré au plus près du champ ; l'export n'est jamais bloqué ; la barre de
  mission dit toujours combien d'erreurs restent.
- **Les pièges d'outillage déjà connus, à relire avant de conclure** : un
  build sans `NEXT_PUBLIC_GOATCOUNTER_CODE` fait échouer 5 specs analytics
  en local ; `npx playwright test` ne type-vérifie pas les specs, `next
  build` si ; un `next-server` resté en mémoire sert l'ancien build.

### 3.7 Estimation et cadence

Six PR, dont une grosse. À la cadence de ce dépôt quand une session y est
consacrée, la phase tient dans **une à deux semaines de calendrier**, avec les
merges espacés (règle 5 du §1 : le stockage de fonctions Vercel vient de
frôler sa limite — vérifier que la politique de rétention est en place avant
de commencer). L'estimation du 2026-09-12 (« quatre à six semaines à cadence
réaliste ») supposait deux PR par semaine ; elle reste la bonne si le sujet
avance en pointillé.

---

## 4. Phase 1 bis — La première mission réelle (AB Tasty, sans mandat)

*C'est le travail d'Antoine ; la session ne fait que corriger ce que la
mission révèle. Rien de la phase 2 ne commence avant que ce fichier existe.*

**Le fichier attendu** : profil `b2b-assiste` (25 lignes applicables — 2 en
T0, 4 en T1, 15 en T2, 3 en T3, 1 en T4), mandat `no-mandate`, `pending = 0`,
`validateMission` vert, exporté.

**Déroulé proposé, à adapter** :

1. **Jour 1 — créer la mission et faire partir ce qui est lent.** L'en-tête
   (périmètre écrit en toutes lettres — entité, ligne de produit, région —
   plutôt que laissé vide) ; puis, dans la vue collecte, la ligne T4 (m07,
   dépense ventes & marketing chargée : celle que le mandat bloque) et les
   trois T3 (m12 taux d'activation, m13 time-to-first-value, m14 rétention
   par cohorte : celles qui passent par une file d'analyste) reçoivent leur
   `requestedOn`, leur `routedTo` et leur `mandateLevel` le jour même.
2. **Semaine 1 — ce qui se fait seul.** Les quatre T1 (m01 MRR sur base
   déclarée, m04 churn logo, m05 concentration, m06 ARPA) en libre-service ;
   pour chacune, la **définition d'abord**, l'observation ensuite — c'est la
   discipline que l'outil impose et c'est là qu'on saura si elle tient à
   l'usage. Les 15 réponses du Tour au fil des premiers entretiens.
3. **Semaines 1-3 — les sessions T2.** Une session par système ou par
   interlocuteur (la vue collecte est groupée pour ça), jamais par pilier ;
   `receivedOn` posé à la réception, `chasedOn` à chaque relance — ces dates
   mesurent autant la qualité des demandes que la file d'attente d'en face,
   c'est pour ça qu'elles ne s'impriment jamais.
4. **En continu — le journal des frictions**, dans un fichier à part
   (`AUDIT-PLAN.md` §4 lui-même, ou un fichier local jamais committé si une
   friction cite l'entreprise) : chaque fois que l'outil demande quelque
   chose que la réalité n'a pas (un champ impossible à remplir, un statut
   qui manque, une définition qui ne rentre pas dans les axes, une ligne du
   catalogue qui ne veut rien dire pour ce profil), une ligne. **C'est
   l'entrée principale de la phase 2** : elle décide de l'ordre des
   correctifs, et de si le catalogue passe en version `2`.
5. **À la fin — exporter, et écrire les constats** (étape 1.5) avec le bloc
   de tête. Sans readout encore : le bloc de tête à 400 mots et les constats
   5C sont déjà, tels quels, la matière d'une présentation.

**Critère de sortie** : le fichier ci-dessus, plus la liste des frictions.
**Durée** : deux à trois semaines de calendrier, pilotées par les
interlocuteurs, pas par l'outil.

**En parallèle, et indépendamment de l'outil** : les cinq à dix entretiens
(§2), et **la vérification du contrat de travail** (clause de
non-concurrence, cession de propriété intellectuelle) — elle ne concerne pas
l'instrument personnel, elle conditionne la phase 3, et elle est la seule
question du Go/No-Go qui ferme la branche à elle seule. Autant la poser tôt.

**Ce que la session fait pendant ce temps** : les correctifs que le journal
des frictions demande, en petites PR — et rien de la phase 2. Un correctif
qui touche `content/audit-catalog.ts` bouge `AUDIT_CATALOG_VERSION` et
repart au statut « à relire ».

---

## 5. Phase 2 — Les readouts

### 5.1 Objectif et critère de sortie

**Objectif** : que le fichier de la phase 1 bis produise, sans une ligne
éditée à la main, le document qu'Antoine présente à une direction — et que
les trois autres artefacts en dérivent du même JSON.

**Critère de sortie** : le build lecture AB Tasty généré par l'outil, relu
par Antoine, **utilisé tel quel** dans la réunion de restitution ; les
`agreedAction` remplis en séance et réimportés ; le diff entre la passe 1 et
une passe 2 (même vide) rendu à l'écran.

**Prérequis durs** : phase 1 bis terminée ; **bon à tirer nº4 signé** (le
readout imprime les libellés du catalogue) ; les 60 phrases de verdict et les
libellés d'interface nouveaux passés au bon à tirer suivant avant la
première impression.

### 5.2 Les étapes, dans l'ordre

Le build lecture d'abord — c'est le livrable ; le reste en dérive.

#### 2.1 — Le modèle de readout, pur

`lib/audit/readout.ts` : `readoutModel(mission, passId, questions)` →
un objet de sections dans l'ordre du §6 d'`AUDIT.md` (bloc de tête avec sa
thèse par mandat et son titre d'escalade ; les deux axes côte à côte, jamais
moyennés ; « ce qui n'est pas mesuré » classé par **coût de réparation** puis
par cause, avec la colonne « à qualifier » pour `type-not-established` ; bloc
accès rendu ou renvoyé en annexe selon le mandat ; les constats 5C groupés
par pilier, l'action prioritaire en premier ; l'annexe générée). Tout ce qui
est une règle (`deliverableVocabulary`, `effectiveCriterion`,
`isPromotable`, la promotion, les deux neutralisations du §6) s'applique
**ici**, pas dans le composant. Testé sur des fixtures : mandaté / sans
mandat, couverture sous le tiers, benchmark rétrogradé, ligne à qualifier,
zéro constat promouvable. Un test balaie la sortie **sans mandat** contre
`FORBIDDEN_WITHOUT_MANDATE`.

#### 2.2 — Le build lecture

Un écran d'impression dans l'îlot (la donnée ne quitte pas le navigateur,
donc le rendu est côté client, `window.print()` et feuille `@media print`) :
phrases autoportantes, chiffre et source dans la phrase, la fraction de
couverture et jamais un pourcentage nu, le score du Tour **jamais en titre**
et seulement avec son détail si `showTourScore`. Les fiches de glossaire long
dépliables sous les constats qui en ont (props déjà résolues en phase 1).
Refuse de se générer tant que `pending > 0` ou que le validateur n'est pas
vert — c'est la strictesse promise en 3.3-2. Spec : le PDF imprimé depuis
Chromium (`page.pdf`) sur la fixture, relu en captures ; **en français
seulement** à ce stade (le catalogue l'est), l'anglais attend l'étape 2.8.

#### 2.3 — Les blocs Markdown copiables

Un bouton par constat, `navigator.clipboard`, le bloc 5C + ledger en
Markdown. Pas d'export global (les slides finales se montent dans le gabarit
du client — grille §3). Petit, et c'est ce qui sert le lendemain de la
réunion.

#### 2.4 — La coupe par interlocuteur

Une page par `routedTo` : son périmètre, ses lignes, ses trous avec leur
`systemCause`, les actions proposées — **sans compteur global, sans score,
sans comparaison**. Sans mandat (le cas AB Tasty) : intitulée « notes de
préparation », jamais envoyée. Mandaté : c'est l'artefact primaire, envoyé
au milieu de la mission. Spec : un canari posé sur une autre coupe n'apparaît
pas dans celle-ci.

#### 2.5 — Le build projection

Dérivé du même modèle : un titre et un nombre par écran, navigation au
clavier, **jamais le même fichier que le build lecture**. Le dernier des
quatre parce qu'une première restitution se fait très bien sur le build
lecture projeté.

#### 2.6 — Passes multiples et diff à l'écran

« Nouvelle passe » (date d'arrêté ; option « reprendre les définitions et les
statuts de la passe précédente comme point de départ », jamais les valeurs) ;
l'écran de diff (`diffPasses`) : « la couverture est passée de 16 sur 25 à
21 sur 25 », les lignes dont le statut a changé, dans l'ordre du catalogue.
C'est la phrase qui prouve que l'instrument a servi, et celle qui vaut en
entretien.

#### 2.7 — Les règles de readout qui ne sont pas encore dans le code

À câbler dans `validate.ts` ou `readout.ts` selon le cas, avec un test
chacune : **Referral « non comparable »** en profil B2B assisté (la grille
publique suppose un mécanisme intégré au produit) ; l'annotation « estimation
déclarée, convention d'attribution absente » sur une réponse à 7 points à
`acq-3` avec un CAC (m09) en `not-computed` ; la ligne d'activation qui **ne
peut pas** être rendue face à un repère externe (`criterion.kind` forcé à
`internal-trend`) ; et la règle d'exposition « jamais un taux estimé par
l'auditeur en entrée » — celle-ci demande un marqueur sur
`Exposure.inputs[]` (« fourni par l'entreprise »), donc une **version 2 du
schéma** avec sa migration à l'import : la seule modification de schéma
prévue par ce plan, à faire en une fois avec ce que la phase 1 bis aura
révélé.

#### 2.8 — Le catalogue en anglais (conditionnel)

Seulement si une mission réelle a `deliverableLocale: "en"`. Les 39 lignes
traduites dans le même fichier (motif FR/EN de `content/glossary.ts`),
nouvelle version de catalogue, bon à tirer. L'interface de l'outil reste en
français (q9).

#### 2.9 — L'écart de version de catalogue

Quand la mission embarque une version plus ancienne que la courante : un
écran qui montre les lignes ajoutées, retirées, modifiées (diff de texte),
et un bouton « adopter la version courante pour la **prochaine** passe » —
jamais pour une passe déjà renseignée. Aucune migration automatique.

### 5.3 Ce que la phase 2 ne fait pas

Aucune donnée agrégée entre missions (même localement : deux missions ne se
comparent qu'à la main, tant que le Go n'a pas été prononcé) ; aucun envoi
(mail, lien) — le fichier et le papier suffisent ; aucune génération de
texte par Gemini dans le readout — la prose est celle qu'Antoine a écrite
dans le JSON, et c'est le but.

---

## 6. Phase 2 bis — Trois à cinq missions réelles

Le réseau d'Antoine, des équipes partenaires, des boîtes d'amis ; deux à
trois mois. Chaque mission est un **point de donnée** pour le Go/No-Go,
consigné dans un journal par mission (dans un fichier local si le contenu
cite l'entreprise ; ici sous forme anonymisée) :

- quel système source a dominé la collecte (c'est ce qui dirait *quel*
  connecteur unique construire, s'il y en a un) ;
- quelles lignes du catalogue étaient toujours absentes, et pour quelle
  cause système — ce qui décide de la version 2 du catalogue ;
- le temps de collecte par palier (les dates `requestedOn` → `receivedOn`,
  qui ne s'impriment jamais mais se lisent) ;
- ce que la présentation a obtenu : quelles `agreedAction` ont été remplies
  en séance, et lesquelles ont réellement bougé une décision à la passe
  suivante (le champ `lastReviewedInADecision`) ;
- si quelqu'un a **demandé** l'outil, sans qu'on le propose.

L'instrument évolue par petites PR depuis ces journaux. Aucun chantier de
fond pendant cette phase : on mesure.

---

## 7. Le Go / No-Go

Une décision écrite dans ce fichier, à la fin de la phase 2 bis, sur cinq
entrées. **La première ferme la branche à elle seule, quoi que disent les
autres.**

1. **Le contrat de travail autorise-t-il un outil growth commercialisé ?**
   Un instrument personnel ne pose aucune question ; un SaaS qui lit des
   expériences et vend à des équipes produit B2B est adjacent à la catégorie
   de l'employeur actuel. Si la réponse est non : No-Go, l'instrument reste
   personnel, et ce plan s'arrête à la maintenance.
2. **Quel public s'est présenté** pendant les phases 1 bis et 2 bis et dans
   les entretiens : des fondateurs early-stage (le public du quiz), des
   équipes SaaS 10-100 avec de la donnée (le public de l'expert), ou des
   praticiens qui auditent plusieurs boîtes (l'hypothèse du 2026-09-12 : le
   troisième public, peu nombreux, très expert, et chacun sur plusieurs
   entreprises).
3. **Quelqu'un a-t-il demandé l'outil** — ou payé, ou proposé de le
   white-labeler — sans qu'on le lui propose ? C'est le seul signal marché
   non ambigu.
4. **Ce que l'instrument a mesuré sur lui-même** (§6) : une source dominante
   nette ou non ; des lignes systématiquement absentes ou non ; un temps de
   collecte qui justifie un connecteur ou non.
5. **Les cinq à dix entretiens** : faits, et ce qu'ils disent de la question
   empirique unique — « quelqu'un taperait-il ses chiffres à la main, et pour
   obtenir quoi ? ».

Le document de l'expert pose ses propres critères de Go/No-Go ; il n'est pas
dans le dépôt. Si Antoine veut qu'ils comptent ici, il les dépose sous
`design/` ou les recopie dans cette section — les cinq entrées ci-dessus sont
celles que nos deux passes d'instruction ont retenues, dont trois qu'il
n'avait pas.

**No-Go** : l'instrument reste ce qu'il est, entretenu au fil des missions
d'Antoine ; rien d'autre ne se construit. C'est une issue honorable, pas un
échec : il aura servi à chaque mission.

**Go** : la phase 3 s'ouvre, **dans un dépôt séparé** dès le premier
utilisateur externe — la frontière se déclenche sur un événement, pas sur une
date (`CLAUDE.md`, 2026-09-12).

---

## 8. Phase 3 — Uniquement sur Go

Dans cet ordre, et pas avant :

1. **Un** connecteur, pour **la** source que les missions ont montrée
   dominante. Pas trois, pas « les principaux ».
2. Le Decision Ledger avec une vraie interface (le schéma le porte depuis la
   phase 0 ; la phase 1 le saisit ; ici il devient l'objet central).
3. Seulement alors : la conversation produit — dépôt séparé, comptes,
   pricing, nom. Avec la question de la limite de débit partagée (Upstash ou
   pare-feu Vercel, R-15) qui devient réelle le jour où il y a des
   utilisateurs.

---

## 9. Ce qu'on ne fait pas, à aucune phase de ce plan

Liste explicite, pour qu'une session n'ait pas à redécouvrir pourquoi :

- **Stocker un chiffre de mission côté serveur**, sous quelque forme que ce
  soit — y compris un hash, un agrégat, un compteur, un événement analytics.
  `content/legal.ts` promet « aucun nom d'entreprise » aux utilisateurs du
  produit, et un NDA ne distingue pas un serveur d'un disque.
- **Des paliers de prix, des connecteurs, de la détection d'anomalie, une
  couche d'interprétation par LLM, le nom « Growth OS »** — la phase 3 de
  l'expert, écrite en détail là où c'est la phase 0 qui manquait.
- **Un benchmark chiffré agrégé** entre missions ou entre utilisateurs du
  quiz : trois churns différents cohabitent sur le même mois dans notre
  propre glossaire ; un agrégat de saisies libres mesurerait des définitions,
  pas des performances.
- **Une auto-évaluation envoyée à l'équipe auditée** : les 15 réponses du
  Tour sont celles de l'auditeur, c'est ce qui rend l'axe « méthode »
  défendable.
- **Un score par équipe ou par service** dans quoi que ce soit qui
  s'imprime : un score global sur l'entreprise passe, un score par service
  se lit comme une mise en cause (grille §7).
- **Un champ libre nominatif** dans tout ce qui s'imprime : rôles, jamais
  noms ; `routedTo` ne traverse jamais un constat.
- **Faire générer la prose du livrable par Gemini.** Le readout est une
  fonction pure du JSON qu'Antoine a écrit ; c'est ce qui le rend
  régénérable, diffable et purgeable.

---

## 10. Risques et dépendances

| Risque | Effet | Parade |
|---|---|---|
| Le stockage de fonctions Vercel (9,24 / 10 Go le 2026-09-13) | Un merge de plus peut geler la production 24 h, comme le 2026-09-06 | Politique de rétention posée par Antoine **avant** la phase 1 ; merges espacés ; un déploiement pèse 45,5 Mo depuis #131 |
| `localStorage` perdu (changement de machine, données de site effacées) | Des heures de saisie perdues | Le fichier est le stockage durable ; export proposé à chaque fin de session ; bandeau « non exporté depuis … » permanent (étape 1.2) |
| Le mot de passe admin est unique et partagé | Une fuite ouvre `/admin/audit` — mais **pas les données**, qui ne sont pas sur le serveur | C'est l'atout de l'architecture : la route n'expose que l'outil, jamais une mission. Rien de plus à construire |
| Le catalogue n'est pas relu | Un libellé maladroit s'imprime sous le nom d'Antoine | Règle 2 du §0 : le readout attend le bon à tirer ; la saisie, elle, peut afficher le texte |
| Aucune primitive de formulaire dans le design system | Une saisie qui ne ressemble pas au produit | Décision 3.3-1 : primitives locales aux tokens ; c'est un outil, pas une surface produit |
| Le mode « sans mandat » reste à éprouver | Un livrable dont le vocabulaire sonne faux dans la pièce | La phase 1 bis est faite pour ça ; `FORBIDDEN_WITHOUT_MANDATE` est testé sur tout ce que le code produit, le reste se juge en réunion |
| Le schéma devra bouger (marqueur d'exposition, frictions de la mission) | Des fichiers de la phase 1 bis à migrer | Une seule version 2, en 2.7, avec migration à l'import testée sur les vrais fichiers de la phase 1 bis |
| La seconde passe n'a pas d'écran avant la phase 2 | Une mission ne peut pas être re-passée à six mois d'ici là | Sans conséquence : la première passe AB Tasty n'aura pas six mois avant la phase 2 |
| Les entretiens ne se font pas | Le Go/No-Go se prend sur une seule mission et une intuition | Ils ne dépendent d'aucun code : les lancer maintenant (§2) |

---

## 11. Tenue de ce document

- **À chaque étape livrée** : la ligne de la table du §0 passe à « Livrée
  (PR #n, date) », l'étape du §3 ou du §5 reçoit une ligne « *Livrée le …* »
  avec ce qui a divergé du plan, et `CLAUDE.md` reçoit l'entrée habituelle
  (décision, pièges, ce qui a été vérifié en réel).
- **Quand le plan change** — une étape sautée, réordonnée, ajoutée — on
  modifie ce fichier **avant** de coder, en disant pourquoi. Un plan qui ne
  reflète plus ce qui se fait est pire qu'aucun plan : la prochaine session
  le suivrait.
- **Le journal des frictions** de la phase 1 bis vit ici (§4) ou dans un
  fichier local jamais committé si une ligne cite l'entreprise ; la version
  committée est anonymisée.
- **Les numéros de PR** s'écrivent après leur création, jamais avant
  (convention 8 de `CLAUDE.md`).
- **La décision du Go/No-Go** s'écrit au §7, datée, signée du nom de celui
  qui la prend.
