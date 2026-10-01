# ENGINE.md — le moteur de growth

*Versionné le 2026-09-25. Jusque-là, cette spécification ne vivait que dans le
répertoire de travail d'une session, qui disparaît avec son conteneur ; c'est la
même raison qui a fait entrer `AUDIT.md` et `AUDIT-PLAN.md` dans le dépôt.*

**Où en est le moteur.** Construit derrière `ENGINE_ENABLED` (fermé ; Antoine le
teste avec l'aperçu propriétaire de `/admin/preview`), route `/{locale}/aarrr-funnel-template`, code dans
`src/lib/engine/` (pur), `src/content/engine-copy.ts` et `engine-catalog.ts`
(toute la copie, `TODO: à relire` jusqu'au bon à tirer nº8) et
`src/app/[locale]/aarrr-funnel-template/` (l'îlot, le tableau de bord, les
slides). Les écarts que l'implémentation a tranchés par rapport à ce document
sont consignés dans le journal (`JOURNAL.md`), pas réécrits ici.

**Décisions prises par défaut le 2026-09-24 pour que le travail avance** —
chacune se renverse en une phrase :

1. Nom « Moteur de croissance » / "Growth engine" ; URL
   `/{locale}/aarrr-funnel-template` (la requête sans concurrent de l'audit SEO).
   Une URL publiée ne meurt jamais ici : c'est définitif dès l'ouverture.
   **Tranché par Antoine le 2026-09-29 (`CHANTIERS.md` C2).** *Le nom* :
   « growth » se garde en français, anglicisme courant. Le moteur s'appelle
   donc « **Moteur de growth** » (« Ton moteur de growth », en minuscule dans
   le texte courant comme « le travail de growth » d'`about.ts`), et reste
   "Growth engine" en anglais. *L'adresse* : Antoine a délégué le choix sur le
   seul critère SEO, et **`/aarrr-funnel-template` est gardée**. Les résultats
   de recherche ont été relevés le jour même :
   - « AARRR funnel template » et « AARRR template » sont occupés par des
     diagrammes et des modèles de slides à remplir (Miro, Creately, Ayoa,
     SlideModel), sans aucun outil qui calcule avec ses propres chiffres.
     Le slug couvre les deux requêtes.
   - « AARRR funnel calculator » ne renvoie ni outil ni intention (des
     calculateurs d'ARR, des articles) : plus étroit, et sans demande visible.
   - « pirate metrics template » est envahi de pages copiées.
   - `/growth-engine` ne porte aucune requête.

   Le slug reste anglais dans les deux langues (R2-16), et le titre français
   « Modèle de funnel AARRR » porte la requête française. Correction de la
   formule d'origine : « sans concurrent » voulait dire « sans **outil**
   concurrent ». La page est bien en concurrence avec des domaines forts, et
   c'est son utilité qui doit gagner, pas le slug. À coder : `CHANTIERS.md`
   A7.2 (le nom seulement).
2. Le crédit « tourdegrowth.com » sur les slides exportées : présent par défaut,
   retirable par l'utilisateur (le deck est le sien).
   **Confirmé par Antoine le 2026-09-29 (`CHANTIERS.md` C3)** : c'est la
   seule boucle de distribution du moteur, et l'utilisateur la retire en un
   clic.
3. La v1 couvre le SaaS libre-service (freemium ou essai) ; le B2B assisté en
   v1.1 ; l'appli B2C et la marketplace plus tard.
   **Renversée par Antoine le 2026-09-29 (`CHANTIERS.md` C4) : le B2B assisté
   entre dans la v1**, « il faut qu'on soit pertinent dès le début ». Le
   réglage sépare deux axes que le sélecteur mélangeait :
   - le **type** : SaaS B2B (ouvert) ; app grand public et place de marché
     (plus tard) ;
   - la **motion** : deux cases, libre-service (PLG) et assisté (SLG), au
     moins une cochée.

   Les deux cochées expriment un modèle **hybride**, rendu en « deux
   moteurs, un total » et **jamais en face-à-face** : les deux motions jouent
   sur des segments différents, et un « PLG vs SLG » pousserait un CODIR à
   chercher un gagnant. Concrètement :
   - deux funnels côte à côte, chacun avec ses cibles et sa fuite ;
   - le MRR additionné ;
   - une slide d'unit economics avec les deux motions en regard (CAC,
     payback, panier, churn) ;
   - un chiffre de liaison optionnel : les comptes qualifiés par le produit
     passés aux commerciaux, parce que dans beaucoup d'hybrides le PLG
     alimente le SLG.

   Le SLG a son propre funnel (leads, opportunités, taux de closing, cycle de
   vente, ACV, sources CRM), donc son propre catalogue. **L'ouverture du
   moteur attend** la spécification, sa validation par Antoine, le code et
   le bon à tirer de cette copie. À faire : `CHANTIERS.md` A7.3.
   **La spécification est écrite le 2026-09-30 : §18 de ce document**
   (A7.3.a). **Validée par Antoine le même jour** (`CHANTIERS.md` C25, ses
   seize réponses en §18.12). Trois recos sont reprises : **une marge brute
   par motion** (Q4), **la liaison devient un levier « Et si » dès la v1**
   (Q7) et **quatre termes de glossaire dès la v1** (Q8). Q3 gagne une
   précision : un passage du libre-service à l'assisté n'est pas un départ.
   Le code (A7.3.c) peut partir, avec les termes (A7.3.e) en parallèle.
4. La slide « déclaré au Tour × mesuré » existe mais n'est pas cochée par défaut.
   **Confirmé par Antoine le 2026-09-29 (`CHANTIERS.md` C5)** : on la choisit
   quand l'écart est l'argument, et personne ne la découvre par surprise dans
   son export.
5. Les deux repères approuvés du glossaire (activation 20-40 %, churn logo
   1-2 %/mois) peuvent désigner un goulot sur une slide, avec leur réserve
   imprimée sur la slide ; une cible d'équipe le peut toujours.
   **Renversée par Antoine le 2026-09-29 (`CHANTIERS.md` C1) : aucun repère ne
   désigne.** Les deux restent affichés comme contexte ; seule une cible
   d'équipe nomme l'étape qui freine. Pourquoi : 1-2 % vaut pour le SaaS B2B
   à panier élevé (ChartMogul : médiane de 6,1 %/mois sous 25 $ d'ARPA, 2,2 %
   au-dessus de 500 $), pas pour « les produits vendus aux petites
   entreprises » ; l'exemple §6.0 (ARPA 120 €, churn 2,5 %) était signalé à
   tort. Le 20-40 % d'activation n'a aucune source primaire. La population du
   churn est reformulée partout où elle est écrite. **Codé le 2026-09-30
   (A7.1)** : le comparateur « repère » a disparu du moteur, l'exemple §6.0
   porte les cibles de son équipe fictive (activation 20 %, churn 2 %), et la
   copie (moteur, catalogue, glossaire churn et rétention) repasse « à relire ».
6. Le moteur est public, gratuit et local : ce n'est pas la phase 3 de
   l'instrument d'audit (aucun connecteur, rien ne quitte le navigateur, pas un
   produit commercial). `lib/audit` n'est pas touché.
   **Confirmé par Antoine le 2026-09-29 (`CHANTIERS.md` C6)**, avec une réserve
   de sa part : l'instrument d'audit fait « carrément doublon » avec le
   moteur, auquel il croit davantage parce qu'il est public, et un audit
   privé n'a de sens que s'il va plus loin. Le sort de l'audit n'est pas
   tranché à froid : la mission de la phase 1 bis le tranche (`AUDIT-PLAN.md`
   §4). S'il s'avère un doublon, ses lignes utiles passent au moteur en copie
   publique relue.
   **Tranché le 2026-09-30** : sans attendre la mission, Antoine met
   l'instrument d'audit entre parenthèses et se concentre sur le moteur
   (`AUDIT-PLAN.md`, en tête). Le catalogue du profil `b2b-assiste` peut
   toujours inspirer A7.3, en copie publique relue, sans importer `lib/audit`.
7. `ENGINE_ENABLED` reste fermé jusqu'à la signature du bon à tirer nº6. Liens
   d'ouverture prévus : `/how-it-works`, les deux pages SEO d'entrée, une section
   de la landing sous la citation — pas de septième lien au pied de page.
   **Revu par Antoine le 2026-09-29 (`CHANTIERS.md` C7).** Les liens sont
   gardés depuis `/how-it-works`, `/growth-audit-checklist` et
   `/startup-growth-diagnostic`, toujours sans lien au pied de page. **La
   section de la landing sous la citation est abandonnée** : la bande « Le
   Tour en trois parties » de la synthèse I + B présente déjà le moteur,
   au-dessus de la citation. C'est sa carte qui devient le lien, selon C15.
   Et le bon à tirer nº6 n'est plus le verrou (il est clos le 2026-09-29) :
   l'ouverture attend le nº8 et le lot A7.3 (décision 3). À coder :
   `CHANTIERS.md` A7.4.

**Refonte de la saisie (2026-09-26, sur les premiers retours d'Antoine).** Ce
qui change par rapport aux §4, §7 et §8 plus bas — le reste tient :

- **Deux façons de remplir.** Après le réglage, « Commencer pas à pas » (par
  défaut) ou « Tout voir d'un coup » (le tableau, pour qui connaît l'outil).
  Le pas à pas suit quatre grandes étapes : tes cibles actuelles → ta base
  (les inscrits) puis un chiffre par écran → « Et si ? » sur tout le funnel →
  tes slides. Il reprend là où tu t'es arrêté (`steps-model.ts#resumePosition`),
  et chaque écran a « Voir le tableau complet ».
- **Une base commune** (`Snapshot.base`, `lib/engine/shared-counts.ts`) : les
  inscrits de la cohorte (dénominateur de cinq chiffres) et ceux du mois (deux
  chiffres) se tapent une fois, puis se propagent dans chaque entrée qui les
  porte — l'entrée reste complète seule, pour le fichier, le deck et le
  validateur. Une entrée que la nouvelle base rendrait impossible est laissée
  telle quelle et la fiche dit « compté sur n, pas sur ta base de m ».
- **« Et si » sort des fiches** et devient un panneau à part
  (`_engine/WhatIfPanel.tsx`), ouvert dans le pas à pas, plié sur le tableau.
  *Le panneau à une étape de ce jour-là (et `projection.ts`) a été remplacé le
  lendemain par les « Et si » cumulés : voir le bloc suivant.*
- **Explications à la demande** : les fiches statiques de la page (dix-sept
  depuis le bloc suivant) sont
  pliées (toujours dans le HTML prérendu), « où le trouver » est plié dans
  chaque fiche, la liste « à aller chercher » est pliée sur le tableau, et les
  onglets du tableau disparaissent.
- **La durée est dite avant l'outil** : un bloc compte les chiffres par
  effort, depuis les étiquettes du catalogue, puis quatre cas (tout sous la
  main, il faut demander, pas de cible, les slides).
- **Un exemple rempli** (`lib/engine/example.ts`, le jeu du §6.0) : funnel et
  slides, en lecture seule — rien n'est écrit sur l'appareil.
- **Les réglages se modifient après coup** (« Réglages » sur le tableau).
  Changer une fenêtre renvoie le chiffre qu'elle définit « à faire » (il ne
  décrit plus la même chose) ; changer un mois garde les entrées et demande
  de les relire. L'écran le dit avant d'enregistrer.
- Petits correctifs : la confirmation d'effacement ignore la casse et le dit ;
  le champ du nom dit « nom de ton SaaS ou de ton entreprise » ; le peloton dit
  combien d'inscrits réels il ramène à 100, et où changer ce nombre.
- **La FAQ se déplie question par question** (même jour, demande d'Antoine) :
  chaque question est un `core/Disclosure` fermé, avec sa réponse dedans. Le
  texte des réponses reste dans le HTML prérendu (un `<details>` fermé le
  garde) — c'est ce qu'un moteur de recherche lit ; la spec sans JavaScript de
  `e2e/engine-page.spec.ts` le vérifie.

**Deuxième série de retours (2026-09-26/27).** Ce qui change encore, par
rapport au bloc précédent et aux §5, §6.7, §8.2 et §9 :

- **Dix-sept chiffres** (décision d'Antoine) : l'étape Revenue collecte aussi
  l'**expansion** et la **rétrogradation** du mois, chacune sur le MRR au
  1er du mois. Deux calculés en plus : **GRR = 100 − churn − rétrogradation**
  et **NRR = GRR + expansion**, mensuelles et toujours « approximatives » :
  le churn logo tient lieu de churn en revenu, et c'est dit sur la slide
  unit economics. Base commune : le MRR saisi pour l'ARPA est le dénominateur
  de la marge brute, le MRR au 1er du mois est partagé par l'expansion et la
  rétrogradation.
- **Une réponse n'est pas un chiffre.** L'événement d'activation, la cause de
  churn et le mécanisme de recommandation sont demandés « sur ce point », le
  pas à pas les titre « Point n sur 17 », et leur triage ne propose plus
  « deux chiffres qui ne collent pas » (deux réponses divergentes sont une
  définition que personne ne partage, déjà proposée). Les grands nombres se
  groupent à la frappe ; les grilles du peloton s'alignent (`subgrid`).
- **Le tableau en onglets par étape** (`_engine/stage-tabs.ts`, pur, et
  `StageTabs.tsx`) remplace les lignes d'étape et leur tiroir (§8.2) : un
  onglet par étape (nom, marques de statut, « trouvés : n/N », tampon
  « Freine ici » sur l'étape nommée et elle seule), un seul panneau dessous,
  **tous les chiffres repliés** ; seul un chiffre ouvert depuis ailleurs
  (« Remplir », « Continuer ») arrive déplié, avec le focus. À 390 px, la
  bande d'onglets défile dans sa propre boîte plutôt que de passer à la ligne.
- **« Et si » cumulés** (`lib/engine/scenario.ts`, pur ; vue dans
  `_engine/scenario-view.ts`) : huit leviers bougent **ensemble** —
  inscription, parrainage, activation, conversion payante, churn,
  rétrogradation, expansion, ARPA des nouveaux clients. Les cibles sont
  gardées dans `EngineState.whatIf` (donc dans le fichier et les slides) ;
  un levier non saisi n'a pas de curseur, et le panneau le dit. Le funnel du
  mois commence aux **visiteurs** et se compte en personnes ; ses grilles
  dépassent 100 points, en rouge, pour ce que les « Et si » ajoutent. Les
  chiffres de croissance bougent avec les curseurs : MRR dans 12 mois,
  nouveau MRR, NRR, GRR, CAC, LTV, payback, chacun disant en mots si c'est
  mieux ou moins bien. Chaque hypothèse du modèle qui a servi est imprimée
  avec le résultat (mêmes visiteurs pour l'inscription, parrainage par-dessus,
  J30 et payants qui suivent l'activation sans la dépasser, nouvel ARPA sur
  les nouveaux clients seulement, CAC à dépense égale, churn logo pour churn
  en revenu, MRR à 12 mois = base retenue à la NRR + nouveau MRR, ni
  saisonnalité ni saturation). À partir de deux leviers : ce que chacun
  rapporte seul, et **l'effet composé** (l'ensemble vaut plus que la somme :
  les taux du funnel se multiplient). Tout montant projeté est arrondi à deux
  chiffres significatifs, jamais au centime — sauf quand l'écart est plus fin
  que l'arrondi : la paire gagne alors un chiffre (§6.2, 2026-09-28 ; « ~100 000 €
  → ~110 000 € » pour +3 000 €). Les écarts des tuiles sont à l'encre, en gras,
  gains comme pertes, comme la colonne « écart » des slides. `impact.ts#whatIf` (§6.7) reste
  la chaîne de la slide `leak` et du diagnostic.
- **Une slide par « Et si »**, après celle de la fuite, dans l'ordre des
  leviers : les chiffres de croissance et le funnel du mois, aujourd'hui /
  avec cet « Et si » / écart. Le titre chiffre le gain du MRR à 12 mois
  (« Si l'activation passait à 24 % (aujourd'hui : 18 %), le MRR dans
  12 mois gagnerait ~X ») seulement quand c'est un gain d'au moins une unité ;
  sinon la question simple. À partir de deux leviers, **une slide
  « ensemble »** : les leviers sur une ligne chacun, les chiffres de
  croissance avec tous les « Et si », la phrase de l'effet composé. Le funnel
  n'y figure pas (il est sur chaque slide de levier et dans l'export texte) :
  trois tableaux côte à côte débordaient. Les hypothèses sont le pied de page,
  en version dense. Un écart ne colle jamais son signe au tilde (« +6 600 € »).
  Chaque slide « Et si » est cochée par défaut et se décoche comme les autres.

---

## Où vit la spécification

*Découpée le 2026-10-01, pour qu'une session ne charge que la partie qu'elle
travaille. Les numéros de section n'ont pas changé : un renvoi « `ENGINE.md`
§9.3 » ou « `ENGINE.md` §18.12 », dans le code comme dans les documents, se lit
dans le fichier que donne ce tableau. Le §14 (l'inventaire de la copie) est
retiré depuis le même jour : la copie vit dans le code.*

| Sections | Où | Quoi |
|---|---|---|
| §0 à §17, et l'annexe des vérifications | [`docs/engine/v1.md`](docs/engine/v1.md) | La spécification d'implémentation de la v1 libre-service, construite du 2026-09-24 au 2026-09-30. Le code fait foi depuis |
| §18 | ci-dessous | Le B2B assisté et l'hybride (A7.3), validé par C25 et en construction (#233). Il rejoindra `docs/engine/` une fois A7.3.c mergé |
| Annexe — Les entretiens | ci-dessous | La trame des entretiens (`CHANTIERS.md` D5) |

---

## 18. Le B2B assisté et l'hybride — spécification A7.3.a, validée le 2026-09-30 (C25)

*Premier jet du 2026-09-30, écrit contre le code de `main` (`c8ec215`, A7.1
livré) et non contre les documents. **Validé par Antoine le 2026-09-30**
(`CHANTIERS.md` C25, A7.3.b) : ses seize réponses sont en §18.12, et les
sections qu'elles changent sont corrigées (Q3, Q4, Q7, Q8). Rien n'est encore
codé : A7.3.c part dans l'ordre de §18.11, et A7.3.e (les termes du glossaire)
en parallèle. Toute la copie citée est de la copie neuve, **`TODO: à relire`**
(convention 6), et la typographie finale (U+00A0 avant `:` `;` `%` `€` `?` et
après `«`) est posée dans `content/engine-*.ts`, pas dans ce document.*

*Vérifié pour ce jet : `types.ts`, `catalog-shape.ts`, `validate.ts`, `io.ts`,
`storage.ts`, `values.ts`, `cohort.ts`, `diagnose.ts`, `impact.ts`,
`peloton.ts`, `unit-economics.ts`, `sanity.ts`, `findings.ts`,
`shared-counts.ts`, `scenario.ts` (en-tête et KPI), `deck.ts` (`buildDeck`,
`buildVisibility`), `example.ts`, `Setup.tsx`, `steps-model.ts`,
`stage-tabs.ts`, `engine-copy.ts` (§ `setup`), `audit-catalog.ts` (socle et
variantes `b2b-assiste`), `glossary-terms.ts` (24 termes) et les blocs
`benchmark` de `glossary-deep.ts` (`cac`, `cac-payback`, `ltv`, `churn`,
`nrr-grr`, `retention`, `referral`, `revenue`, `arpu`, `acquisition`, `pql`).
L'arithmétique de §18.9 est refaite à la main ligne par ligne.*

---

### 18.0 En une page

**Ce qui change.** Le réglage sépare le **type** (« SaaS B2B », seul ouvert)
de la **motion** : deux cases, libre-service (PLG) et assisté (SLG), au moins
une cochée. L'assisté a **son propre catalogue** : 15 chiffres propres, trois
au plus par étape (deux en Referral), plus **sa propre marge brute** en
Revenue (Q4, 2026-09-30 : une marge par motion), un ★ par étape. Il a aussi son propre funnel, dessiné en
**trois relais** et non en peloton : chaque relais a sa base de 100. Il a son
diagnostic, contre **ses** cibles, ses « Et si » et ses slides. Les deux
cochées font l'**hybride** : « deux moteurs, un total ». Concrètement :

- deux funnels côte à côte, chacun avec sa fuite, dans un ordre fixe
  (libre-service à gauche ou au-dessus, assisté ensuite), jamais trié par
  valeur ;
- un bandeau et une slide « un total » : MRR additionné, nouveau MRR du mois
  additionné ;
- une slide d'unit economics avec les deux motions **en regard** : CAC,
  payback, panier, clients perdus sur un an ;
- un chiffre de **liaison** facultatif, la part des opportunités assistées
  venues de comptes du libre-service, qui est aussi un levier « Et si » (Q7).

**Ce qui ne change pas.**
- Le drapeau `ENGINE_ENABLED` reste fermé jusqu'à la fin du lot A7.3 (bon à
  tirer compris).
- Tout reste local : aucun chiffre ni texte saisi ne quitte le navigateur, et
  le canari couvre la nouvelle saisie.
- Tout est bilingue, et la copie neuve est « à relire ».
- La saisie se fait **en comptes**. Le diagnostic est déterministe.
- **C1 vaut pour les deux motions** : seule une cible d'équipe désigne une
  fuite ; un repère du glossaire n'est jamais que du contexte.
- **Jamais de face-à-face**, ni en titre, ni en graphique, ni en classement.
  Aucune fonction ne compare une fuite PLG à une fuite SLG. Aucun gabarit
  hybride ne contient de comparatif (`vs`, « plus rentable », « mieux que »…),
  et un test le garde.
- Un fichier v1 (100 % libre-service) s'ouvre sans perte et donne, au
  caractère près, le même tableau et les mêmes slides.

**Ce que l'hybride ne fait pas.**
- Il ne dit jamais quelle motion « marche le mieux ».
- Il ne transfère aucun crédit d'une motion à l'autre : la liaison n'est pas
  une attribution.
- Il n'additionne jamais deux fuites.
- Il ne propose qu'un « Et si » qui traverse les motions, celui de la
  liaison (Q7, 2026-09-30) : son gain s'écrit dans l'assisté et dans le
  total, et rien n'est jamais retiré au libre-service.

**Chiffrage.** Six PR sur une branche d'intégration, un seul merge sur
`main`, drapeau fermé, plus les quatre termes du glossaire (A7.3.e, Q8) dans
une PR à part : ~12 jours-agent en tout (§18.11).

---

### 18.1 Le réglage (E1)

#### 18.1.1 Ce que la carte montre, dans l'ordre

1. **Ton type d'entreprise** (`Choices`, une seule option active) :
   - « SaaS B2B » / "B2B SaaS" (active, cochée) ;
   - « App grand public » / "Consumer app" — note « Plus tard : leur funnel n'a
     pas la même forme. » / "Later: their funnel has a different shape."
     (désactivée) ;
   - « Place de marché » / "Marketplace" — même note (désactivée).
2. **Comment tu vends** / "How you sell" — deux cases à cocher, dont au moins
   une cochée :
   - ☐ « Libre-service (PLG) : les clients s'inscrivent et paient seuls » /
     "Self-serve (PLG): customers sign up and pay on their own"
   - ☐ « Assisté (SLG) : une équipe commerciale signe les contrats » /
     "Sales-assisted (SLG): a sales team signs the contracts"
   - Aide sous le groupe : « Les deux ? Coche les deux : tu auras deux moteurs
     et leur total, jamais l'un contre l'autre. » / "Both? Tick both: you get
     two engines and their total, never one against the other."
   - Erreur si aucune n'est cochée, sous le groupe et focalisée à l'envoi
     (R-19) : « Coche au moins une façon de vendre. » / "Tick at least one way
     you sell."
   - Défaut à la première visite : libre-service coché, assisté décoché. C'est
     le comportement v1, et c'est une question (Q16).
3. **Réglages de chaque motion cochée**, dépliés sous sa case :
   - libre-service : fenêtre d'activation (7/14/30 j) et fenêtre de paiement
     (30/60/90 j), inchangées ;
   - assisté : **fenêtre de qualification** (30/60/90 j, défaut 30), qui entre
     dans la définition de `slg.acq.lead-to-opp`, et **fenêtre de mise en
     production** (30/60/90 j, défaut 90), qui entre dans celle de
     `slg.act.go-live`.
4. **Mois des flux** : commun, défaut = dernier mois clos. **Cohorte suivie**
   : affichée seulement si le libre-service est coché, inchangée (D7). Si
   l'assisté est coché, une ligne en lecture seule dit ses périodes, calculées
   (§18.2, S4) : « Assisté : les flux de juin à août ; les leads de mai à
   juillet (ils ont eu 30 jours) ; les nouveaux clients de mars à mai (ils ont
   eu 90 jours). » / "Sales-assisted: flows from June to August; leads from
   May to July (they've had 30 days); new customers from March to May
   (they've had 90 days)."
5. Devise, nom sur les slides, liaison du Tour : communs et inchangés.

La carte garde ≤ 560 px aux deux largeurs. Les réglages d'une motion
décochée sont masqués, pas remis à zéro.

#### 18.1.2 Cocher ou décocher après coup (« Réglages » sur le tableau) : rien ne se perd

| Geste | Ce qui se passe | Ce que l'écran dit **avant** d'enregistrer (FR / EN) |
|---|---|---|
| Décocher l'assisté (le libre-service reste coché) | Les entrées `slg.*`, `link.*`, leurs cibles, leurs « Et si » et leurs cases de slides **restent dans l'état, dans le stockage et dans le fichier**. Le tableau, la couverture, le diagnostic et le deck les ignorent | « Décocher l'assisté le retire du tableau et des slides. Ses {n} chiffres, ses cibles et ses « Et si » restent sur cet appareil et dans ton fichier : recoche pour les retrouver. » / "Unticking sales-assisted removes it from the board and the slides. Its {n} numbers, targets and what-ifs stay on this device and in your file: tick it again to get them back." |
| Décocher le libre-service | Symétrique (les 17 chiffres PLG sont gardés, cachés) | même gabarit, motion « le libre-service » / "self-serve" |
| Décocher les deux | Impossible : la case restante est désactivée, avec « Il faut au moins une façon de vendre. » / "You need at least one way you sell." | — |
| Cocher l'assisté sur un moteur PLG | Le catalogue SLG apparaît vide (`todo`) ; le PLG ne bouge pas | « L'assisté commence vide : {n} chiffres à aller chercher. Ton libre-service ne change pas. » / "Sales-assisted starts empty: {n} numbers to go and get. Your self-serve side doesn't change." |
| Recocher une motion décochée | Tout revient tel quel | « On retrouve les {n} chiffres que tu avais saisis. » / "Your {n} numbers are back." |
| Changer une fenêtre SLG | Même règle que le PLG (§ en tête d'ENGINE.md) : le chiffre qu'elle définit repasse « à faire » | gabarits `settings.*Reset` existants, avec la fenêtre nommée |

« Tout effacer » efface les deux motions (une seule clé). L'aperçu d'import
(E7) compte les chiffres cachés à part : « Mon produit · août 2026 ·
libre-service 11 sur 17 · assisté 10 sur 15 (masqué) ».

---

### 18.2 Modèle de données

#### 18.2.1 Types (`src/lib/engine/types.ts`)

```ts
export const ENGINE_STORAGE_KEY = "tdg.engine.v2";
/** Lue une fois, migrée, gardée jusqu'au premier export réussi (§18.3). */
export const LEGACY_STORAGE_KEY_V1 = "tdg.engine.v1";
export const ENGINE_SCHEMA_VERSION = 2 as const;

/** Décision 3 (2026-09-29) : le type, puis la motion. v1 du moteur : un seul type ouvert. */
export type BusinessType = "b2b-saas"; // plus tard : | "consumer-app" | "marketplace"
export type Motion = "plg" | "slg";
/** L'ordre canonique, le seul : écrans, slides, listes. Jamais trié par une valeur. */
export const MOTIONS: readonly Motion[] = ["plg", "slg"];

export interface EngineSetup {
  type: BusinessType;
  /** Au moins une à true (validate.ts). Les deux = hybride : dérivé, jamais stocké. */
  motions: Record<Motion, boolean>;
  currency: Currency;
  activationWindowDays: 7 | 14 | 30;     // PLG — inchangé
  paidWindowDays: 30 | 60 | 90;          // PLG — inchangé
  qualificationWindowDays: 30 | 60 | 90; // SLG, défaut 30 — entre dans slg.acq.lead-to-opp
  goLiveWindowDays: 30 | 60 | 90;        // SLG, défaut 90 — entre dans slg.act.go-live
  companyLabel?: string;
}

export type PlgMetricId = /* les 17 ids actuels, inchangés */;
export type SlgMetricId =
  | "slg.acq.lead-to-opp" | "slg.acq.cac" | "slg.acq.cycle"
  | "slg.act.live-event" | "slg.act.go-live" | "slg.act.time-to-live"
  | "slg.ret.renewal" | "slg.ret.nrr" | "slg.ret.loss-cause"
  | "slg.ref.referred-share" | "slg.ref.referenceable"
  | "slg.rev.win-rate" | "slg.rev.acv" | "slg.rev.arpa" | "slg.rev.gross-margin"; // la marge : Q4
export type LinkMetricId = "link.pql-handoff";
export type MetricId = PlgMetricId | SlgMetricId | LinkMetricId;

export type DerivedId =
  | "rev.ltv" | "rev.cac-payback" | "rev.ltv-cac" | "rev.nrr" | "rev.grr"
  | "slg.rev.ltv" | "slg.rev.cac-payback" | "slg.rev.ltv-cac";

/** Q4 (2026-09-30) : la marge globale reprise en repli, sur les deux fiches de marge et en hybride seulement. */
export type EstimateBasis = /* existants */ | "company-wide";

export type ToolId = /* existants */ | "pipedrive" | "cs-platform"; // « Outil de Customer Success (Gainsight, Vitally, Planhat…) »
export type RoleId = /* existants */ | "sales" | "customer-success";

/** SLG : trois comptes partagés de plus (S6). */
export type SharedCount =
  | "cohortSignups" | "monthSignups" | "mrrEnd" | "mrrStart"
  | "slgOppsCreated" | "slgDealsWon" | "slgCustomers";

export type LeverId =
  | /* les 8 leviers PLG */
  | "slg.acq.lead-to-opp" | "slg.rev.win-rate" | "slg.rev.acv" | "slg.ret.renewal"
  | "link.pql-handoff"; // Q7 : un nombre d'opportunités par trimestre, pas un taux

export type FixedSlideId = "peloton" | "leak" | "visibility" | "unit-economics" | "mirror" | "ask" | "annex";
/** `total` : hybride seulement. Les slides SLG portent le préfixe `slg:` ; celles du PLG gardent leur id v1. */
export type SlideId =
  | FixedSlideId | "total" | "slg:peloton" | "slg:leak" | "slg:scenario"
  | "scenario" | `whatif:${LeverId}` | AnnexPageId;

// Snapshot, MetricEntry, MetricValue, EngineDeck, EngineAsk, EngineState : forme INCHANGÉE.
// `Snapshot.metrics`, `targets`, `base` et `EngineState.whatIf` s'élargissent par les unions ci-dessus.
export interface EngineStore { schemaVersion: 2; state: EngineState }
```

**Forme du catalogue** (`catalog-shape.ts`) :

```ts
export interface MetricShape {
  // … champs existants …
  /** Où le chiffre vit : "link" = hybride seulement. Aucun chiffre commun depuis Q4 (une marge par motion). */
  scope: "plg" | "slg" | "link";
  /** Mois couverts : 1 (PLG), 3 (tout l'assisté, S4), 12 (la NRR sur douze mois, seule exception, codée en S0). */
  span: 1 | 3 | 12;
  window?: "activation" | "paid" | "qualification" | "go-live" | 30;
  /** Hors couverture, jamais un constat, jamais candidat (la liaison). */
  optional?: true;
}
```

Les 17 chiffres PLG, `rev.gross-margin` compris, passent à `scope: "plg"`,
les 15 SLG à `"slg"`, `link.pql-handoff` à `"link"` (Q4 : la marge n'est plus
commune). Aide : `shapesOf(motions): MetricShape[]`, dans l'ordre du
catalogue. Elle rend les `plg` si le PLG est coché, les `slg` si le SLG l'est,
`link` si les deux le sont.

**Types dérivés** (jamais stockés) :

```ts
export type PlgCandidateId = /* les 6 actuels */;
export type SlgCandidateId =
  | "slg.acq.lead-to-opp" | "slg.act.go-live" | "slg.ret.renewal" | "slg.ref.referred-share" | "slg.rev.win-rate";
export type CandidateId = PlgCandidateId | SlgCandidateId;

/** Diagnosis garde sa forme ; il gagne sa motion, et ses positions ne portent que ses candidats. */
export interface Diagnosis { motion: Motion; /* … champs existants … */ }

/** Le funnel assisté : trois relais, chacun sur SA base de 100 (§18.5.1). */
export interface RelayColumn {
  metric: "slg.acq.lead-to-opp" | "slg.rev.win-rate" | "slg.act.go-live";
  base: "leads" | "closed-opps" | "new-customers";
  perHundred: Interval | null;          // null = inconnu, jamais 0
  confidence: Confidence;
  source: SourceRef | null;
  period: { from: YearMonth; to: YearMonth } | null;
  sampleSize: number | null;            // le dénominateur saisi, pour « petits effectifs »
}
export interface Relays {
  leadNoun: "leads" | "mql";            // la variante de slg.acq.lead-to-opp
  leadsPerMonth: Interval | null;       // dénominateur ÷ 3
  columns: RelayColumn[];               // toujours 3 : lead→opp, conclue→signée, signé→en production
  chain: Peloton["chain"];
}

export interface SlgUnitEconomics {
  cacVariant: string | null;
  renewalTerm: "annual" | "monthly" | null;
  lifetimeMonths: DerivedValue;         // min(durée tirée du renouvellement, 36)
  ltv: DerivedValue; payback: DerivedValue; ltvCac: DerivedValue;
}
export type MotionDerived =
  | { motion: "plg"; coverage: Coverage; peloton: Peloton; diagnosis: Diagnosis; unit: UnitEconomics }
  | { motion: "slg"; coverage: Coverage; relays: Relays; diagnosis: Diagnosis; unit: SlgUnitEconomics };

/** « Un total » (hybride seulement). Une somme n'existe que si ses deux parties existent (S9). */
export interface TotalView {
  mrr: Record<Motion | "total", DerivedValue>;
  newMrrPerMonth: Record<Motion | "total", DerivedValue>;
  mrrIn12Months: Record<Motion | "total", DerivedValue>;
  link: { known: Known; fromSelfServe: number | null; oppsCreated: number | null };
}

export interface EngineDerived {
  motions: MotionDerived[];   // cochées, ordre MOTIONS — jamais trié par valeur
  coverage: Coverage;         // l'union des deux motions, la liaison exclue
  total: TotalView | null;    // null hors hybride
  sanity: SanityCheck[];      // SanityCheck gagne `motion?: Motion` (absent = commun)
  findings: Finding[];        // Finding gagne `motion?: Motion`
  mirror: Mirror | null;      // BridgeRow gagne `motion: Motion`
}
```

#### 18.2.2 Décisions (décision · raison · alternative rejetée)

**S1 — Le réglage porte deux axes, `type` et `motions`, et l'hybride n'est
jamais stocké.** *Raison* : c'est la décision 3 mot pour mot (« le réglage
sépare deux axes que le sélecteur mélangeait »). L'hybride se dérive de
`motions` : aucun état ne peut dire « hybride » quand une seule case est
cochée. *Rejeté* : élargir `EngineProfile` en
`"selfserve" | "sales-led" | "hybrid"`. C'est une valeur de plus par
combinaison, le type et la motion y seraient de nouveau mêlés, et le jour où
l'app grand public ouvre, il faudrait `"consumer-selfserve"`.

**S2 — `motions: Record<Motion, boolean>`, pas un tableau.** *Raison* : pas
de doublon ni d'ordre à valider. Le fichier reste stable (clés triées), et
« cocher / décocher » est littéralement le champ. *Rejeté* : `Motion[]`, qui
autorise `["slg","plg","slg"]` et ferait dépendre l'ordre d'affichage d'un
ordre de saisie.

**S3 — Les réglages des deux motions sont toujours présents, à plat.**
*Raison* : décocher ne perd rien (§18.1.2), et `windowDaysOf` reste un
`switch` sur `shape.window`. *Rejeté* : `setup.plg{…}` / `setup.slg{…}`
imbriqués, qui renommeraient les deux champs PLG dans tout le code et dans
chaque fichier v1, pour aucun gain de lecture.

**S4 — Tout l'assisté se lit sur trois mois glissants.** Les flux SLG
couvrent les trois mois qui finissent au mois des flux (juin-août pour
août). Les cohortes SLG couvrent les trois mois qui finissent au mois mûr de
leur fenêtre (`matureCohortMonth(window, today)`, déjà écrit). L'entrée garde
le mois de fin (`MetricEntry.cohortMonth` existe déjà) ; `span: 3` dit
d'afficher « juin à août 2026 ». *Raison* : un mois d'assisté compte trop peu
d'affaires. Avec 6 signatures, une de plus bouge le taux de closing de
plusieurs points. Trois mois lissent la saisonnalité sans mélanger deux
grilles tarifaires, et c'est la maille à laquelle un CODIR B2B lit son
pipeline. *Rejeté* : le mois (bruit), les douze mois de l'instrument d'audit
(lents à refléter un changement), une durée réglable (un réglage de plus pour
un gain que personne n'a demandé). *Question Q2.*
**Tranché par Antoine le 2026-09-30 (C25, Q2) : oui**, trois mois fixes.

**S5 — Un seul `Snapshot.metrics`, les ids SLG préfixés `slg.`, les ids PLG
inchangés.** *Raison* : couverture, validation, constats, annexe et demande
copiée bouclent déjà sur le catalogue ; `scope` suffit à filtrer. Et un
fichier v1 ne renomme aucune clé : sa marge reste `rev.gross-margin`, celle du
libre-service (Q4). *Rejeté* : un second jeu `Snapshot.slg.metrics`, qui
doublerait chaque boucle ; préfixer
aussi le PLG en `plg.*`, qui renommerait les 17 clés de chaque fichier v1 et
chaque test.

**S6 — Trois comptes partagés SLG, saisis une fois (`shared-counts.ts`).**
- `slgOppsCreated` (opportunités créées sur les trois mois) : dénominateur de
  `slg.ref.referred-share` et de `link.pql-handoff`.
- `slgDealsWon` (affaires « nouveau client » gagnées sur les trois mois) :
  numérateur de `slg.rev.win-rate`, dénominateur de `slg.rev.acv` et de
  `slg.acq.cac`.
- `slgCustomers` (clients assistés, fin du mois des flux) : dénominateur de
  `slg.rev.arpa` et de `slg.ref.referenceable`.

*Raison* : la demande d'Antoine du 2026-09-25, « si on l'a déjà saisi une
fois… ». Chaque entrée reste complète seule, comme en PLG.

**S7 — Les cibles restent dans `Snapshot.targets`, par motion par
construction.** Les ids SLG sont distincts : `targets["slg.rev.win-rate"]`
est la cible de l'assisté, et aucune cible n'a deux sens. `comparatorOf`
reste une lecture de cible (C1).

**S8 — Une règle d'appartenance, imprimée partout où un montant est
additionné : un client compte dans la motion qui a signé son contrat en
cours.** Un compte du libre-service qu'un commercial fait passer à un
contrat annuel compte en assisté : dans le MRR assisté, dans les affaires
gagnées, et plus dans la conversion payante ni l'ARPA du libre-service.
*Raison* : sans règle, le même client est compté deux fois dans le MRR total
et dans les deux « nouveaux clients ». C'est la seule fuite silencieuse du
modèle hybride. *Rejeté* : la motion d'origine du compte (un PQL signé par un
commercial resterait PLG, et le taux de closing assisté ne le verrait jamais
gagné). *Question Q3*, la plus lourde.
**Tranché par Antoine le 2026-09-30 (C25, Q3) : oui**, avec un ajout.
**Un passage du libre-service à l'assisté n'est pas un départ du
libre-service** : le compte ne compte ni parmi les perdus de
`ret.logo-churn`, ni dans la rétrogradation (`rev.contraction`), ni dans
l'expansion (`rev.expansion`) du mois où il passe. Il quitte simplement le
libre-service. *Raison* : Stripe annule souvent l'abonnement quand le
contrat est facturé à part. Sur l'exemple §18.9, 5 passages en trois mois
font ~1,7 par mois sur 400 payants, soit **~0,4 point** ajouté à un churn de
2,5 % dont la cible est 2 %. Le piège est écrit dans les fiches concernées,
affiché seulement en hybride (§18.4.6).

**S9 — Un total n'existe que si ses deux parties existent.** Il n'y a jamais
de « MRR total » qui serait le seul MRR connu. Avec une partie inconnue, le
total est `uncomputable` et dit laquelle manque. *Raison* : un total partiel
présenté comme un total est exactement la fausse précision que §16 R1
combat.

**S10 — La liaison est une entrée comme les autres (statuts, source,
estimation, demande), mais `optional`.** Elle est hors couverture, jamais un
constat, jamais candidate. *Raison* : la décision 3 la dit
« optionnelle ». La compter comme un trou pénaliserait l'hybride qui n'a pas
de PQL. **Elle est un levier « Et si » dès la v1** (Q7, tranchée par Antoine
le 2026-09-30 : « c'est justement un point important dans ces organisations
hybrides »), chiffré en nombre d'opportunités et jamais candidat (§18.5.5).

---

### 18.3 Le fichier de sauvegarde et sa migration

#### 18.3.1 `migrate.ts` (nouveau, pur)

`migrateToV2(state: unknown): { state: EngineState; from: 1 | 2 } | null`
ne lève jamais. Il rend `null` pour tout ce qui n'est pas un moteur v1 ou v2
reconnaissable. Pour un v1 :

| Champ v1 | Devient en v2 |
|---|---|
| `schemaVersion: 1` | `2` |
| `setup.profile: "selfserve"` | `setup.type: "b2b-saas"`, `setup.motions: { plg: true, slg: false }` |
| *(absent)* | `setup.qualificationWindowDays: 30`, `setup.goLiveWindowDays: 90` |
| tout le reste (`metrics`, `targets`, `base`, `whatIf`, `deck`, `tourLink`, `id`, dates) | **copié tel quel** : aucun id ne change (S5) |

`setup.profile` ≠ `"selfserve"` dans un v1 : `null` (aucun build v1 n'a pu
l'écrire).

#### 18.3.2 Lecture d'un fichier (`io.ts#parseEngineFile`)

| Fichier | Résultat |
|---|---|
| pas du JSON | `unreadable` (inchangé) |
| `schemaVersion` > 2 | `unknown-version` (inchangé : refus, pas d'ouverture avec erreurs) |
| `schemaVersion: 1`, forme de moteur | migré, puis validé : `{ state, errors, migratedFrom: 1 }`. L'écran d'import dit « Fichier d'une version précédente : il a été mis à jour, rien n'a changé dans tes chiffres. » / "File from an earlier version: it's been updated, nothing changed in your numbers." |
| `schemaVersion: 2` | validé : `{ state, errors }` |
| v2 avec `setup.type` inconnu, ou `motions` sans aucune case vraie | **refus** `unsupported-setup` (nouveau) : le tableau n'aurait rien à montrer. Message : « Ce fichier ne dit pas comment l'entreprise vend : il ne peut pas s'ouvrir. » / "This file doesn't say how the company sells: it can't be opened." |

Un fichier v2 ouvert par un build v1 est déjà refusé en `unknown-version`
(`io.ts` compare `schemaVersion > 1`) : pas de régression à la descente.

#### 18.3.3 Règles de validation neuves (`validate.ts`)

- `setup.type` ∈ `{"b2b-saas"}` ; `setup.motions` est un objet à deux booléens
  dont au moins un est vrai ; `qualificationWindowDays` et `goLiveWindowDays`
  ∈ {30, 60, 90}.
- Les ids `slg.*` et `link.*` sont acceptés quelles que soient les motions
  cochées (§18.1.2 : on garde les chiffres cachés).
- **Deux règles à corriger, car elles refuseraient une NRR réelle.**
  Aujourd'hui, `rate.percent > 100` et `estimate.high > 100` sont refusés
  pour **tout** chiffre en pourcentage. Ils ne doivent plus l'être que pour
  un chiffre **borné** (`shape.bounded`). Sans ce correctif, une NRR estimée
  à 104-108 % ne s'enregistre pas. Le `whatIf` le fait déjà
  (`validate.ts:367`).
- `deck.include` accepte `total`, `slg:peloton`, `slg:leak`, `slg:scenario`
  et `whatif:slg.*` et `whatif:link.pql-handoff` ; `ask.successMetric` et
  `ask.measureFirst` acceptent les ids SLG ; `whatIf` accepte les leviers SLG,
  et `whatIf["link.pql-handoff"]` comme un **entier ≥ 0** (un nombre
  d'opportunités par trimestre, pas un pourcentage, Q7) ; `base` accepte les trois
  comptes SLG (entiers > 0).
- Les impossibles qui **bloquent l'enregistrement** (D11) : numérateur >
  dénominateur sur tout ratio SLG borné (`lead-to-opp`, `go-live`,
  `renewal`, `referred-share`, `referenceable`, `win-rate`,
  `link.pql-handoff`) ; dénominateur nul.
- La base d'estimation `company-wide` (Q4) n'est acceptée que sur
  `rev.gross-margin` et `slg.rev.gross-margin`. Un fichier qui la porte
  ailleurs s'ouvre avec une erreur sur cette entrée, comme toute base
  inconnue. Ne sont **pas** bornés :
  `slg.ret.nrr`, qui peut dépasser 100 %, et les montants.

#### 18.3.4 Stockage (`storage.ts`)

- `loadEngine()` lit `tdg.engine.v2`. S'il est absent et que `tdg.engine.v1`
  est lisible, il migre en mémoire et rend
  `{ kind: "ok", state, migratedFrom: 1 }`. S'il est absent et que v1 est
  illisible, c'est le chemin `unreadable` existant.
- Le premier `saveEngine` écrit **v2** et **laisse v1 en place** (§4.3 : « on
  ne détruit jamais la seule copie »). `.v1` n'est retiré qu'au **premier
  export `.json` réussi** qui suit la migration (`lastExportedAt` postérieur à
  la migration). `clearEngine()` efface les deux clés.
  *Codé en S0 (2026-09-30), sans champ ajouté au stockage* : `.v1` part à la
  première sauvegarde dont `lastExportedAt` est postérieur **à la dernière
  écriture et au dernier export de la copie v1**. Un build v1 ne pouvant plus
  exporter, c'est le même moment que « le premier export qui suit la
  migration », y compris quand l'export est le tout premier geste après
  l'ouverture. Un v1 illisible sans v2 est `unreadable`, et rien ne s'écrit
  avant « Tout effacer ».
- Portée réelle : le moteur est fermé, donc seul Antoine a un `.v1` sur un
  appareil. La migration protège surtout ses fichiers exportés. Un onglet
  resté sur un ancien build écrirait encore dans `.v1` après la migration,
  et ces écritures-là ne remonteraient pas en v2. C'est accepté et dit dans
  le journal ; aucun visiteur n'est concerné.

#### 18.3.5 Tests de non-régression (bloquants)

1. **Golden v1** : pour chaque fixture v1 (`storage-fixtures.ts`, l'exemple
   §6.0, plus trois états tirés des e2e : vide, à moitié, conflit), on compare
   `deriveEngine` et `buildDeck` (FR et EN) avant et après migration, sous la
   même horloge. Peloton, diagnostic, couverture (« 11 sur 17 »), unit
   economics, constats, titres et lignes de chaque slide doivent être
   **identiques au caractère près**. Le build v1 fournit les sorties de
   référence, figées une fois dans `__tests__/golden-v1.json`, avant la
   première ligne de code de la migration.
2. **Aller-retour** : `serialize(migrate(v1))`, puis `parse`, doit rendre un
   état égal, sans erreur.
3. **Idempotence** : `migrate(v2)` rend `v2` inchangé, octet pour octet.
4. **Refus** : `motions` tout faux, `type` inconnu, `schemaVersion: 3`,
   `profile: "sales-led"` dans un v1.
5. **Stockage** : v1 seul ⇒ v2 écrit au premier enregistrement, v1 intact ;
   export ⇒ v1 retiré ; export en échec ⇒ v1 gardé ; v2 illisible ⇒ aucune
   écriture (règle existante).
6. **Non-vacuité** : une migration qui oublie `activationWindowDays` fait
   tomber le golden (le taux d'activation change de fenêtre) ; une qui met
   `slg: true` fait tomber le golden (la couverture passe de 17 à 32).

---

### 18.4 Le catalogue assisté

#### 18.4.1 Comment l'AARRR se lit en vente assistée

Honnêtement, **l'ordre chronologique n'est pas celui des lettres**. Un
client assisté est acquis (lead → opportunité), puis **signé** (Revenue),
puis **mis en production** (Activation), puis **renouvelé** (Retention),
puis il **recommande** (Referral). Le tableau garde l'ordre AARRR des
onglets, commun aux deux motions et au Tour. Le funnel dessiné (§18.5.1) et
le titre de la slide suivent, eux, l'ordre chronologique.

| Étape | Ce qu'elle veut dire en assisté | ★ |
|---|---|---|
| Acquisition | créer du pipeline qualifié, et ce que ça coûte en argent et en temps | passage lead → opportunité |
| Activation | le client **obtient la valeur achetée** : la mise en production, pas le premier rendez-vous (Q1) | mise en production |
| Retention | le contrat **se renouvelle** à l'échéance | renouvellement (logos) |
| Referral | les clients (et partenaires) **amènent des opportunités**, et acceptent d'être cités | part des opportunités recommandées |
| Revenue | le pipeline **se signe**, et à quel prix | taux de closing |

**Pourquoi l'activation est après la signature.** Le passage lead →
opportunité couvre déjà la qualification. Mettre « premier rendez-vous
qualifié » en Activation ferait deux chiffres d'un seul entonnoir de
qualification, et laisserait l'après-vente dans le noir. Or c'est là que
l'assisté meurt en silence : un compte jamais mis en production ne renouvelle
pas, sans laisser de trace dans le CRM. Et « Activation » garde le même sens
dans les deux motions (la valeur obtenue dans le produit), ce qui rend
l'hybride lisible. *Question Q1.* **Tranché par Antoine le 2026-09-30 (C25, Q1) : oui**, la
mise en production.

**Trois au plus par étape.** Acquisition 3, Activation 3, Retention 3,
Referral 2, Revenue 3 : **14 chiffres**, auxquels s'ajoute en Revenue **la
marge brute de l'assisté** (`slg.rev.gross-margin`), comme le libre-service a
la sienne : **15 chiffres propres**. *Q4, tranchée le 2026-09-30 : une marge
par motion*, « ça change tout, il faut qu'on ait la différence ». Le cycle de vente est
rangé en Acquisition (le temps d'acquérir un client, à côté de son coût), ce
qui laisse en Revenue la place de l'ARPA assisté, sans lequel le MRR ne
s'additionne pas (Q15). Referral n'a que deux chiffres : le troisième candidat,
le taux de closing des opportunités recommandées, porterait sur une dizaine
d'affaires par trimestre et ne dirait rien.

**Effort** (paliers existants) : « Seul, 5 min » · « Seul, ~1 h » · « À
demander » · « À construire ».

**Chemins de menu** : ceux qui suivent sont des repères de rédaction, **à
revérifier en écrivant `engine-catalog.ts`** (§14.13). Les interfaces
bougent, et plusieurs champs cités (source, type d'affaire, raison de perte)
sont souvent personnalisés d'un compte à l'autre. La page affiche déjà
« Recettes relues en {mois} ».

**Politique de repères** : inchangée (§5.1). Un repère n'existe que s'il est
écrit et approuvé dans `glossary-deep.ts`, et il ne désigne jamais (C1). Les
ordres de grandeur de l'instrument d'audit sont **exclus** : win rate
25-35 % en PME, 12-18 % en entreprise ; couverture de pipeline de 3× à 6× ;
remise. Ils vivent dans `audit-catalog.ts`, dont le bon à tirer nº4 n'a
tranché qu'une carte sur 39, et la décision 6 interdit de toute façon d'en
importer quoi que ce soit.

**Quatre termes de glossaire neufs dès la v1** (Q8, tranchée par Antoine le
2026-09-30) : « taux de closing », « cycle de vente », « ACV » et
« conversion lead → opportunité ». Ils s'écrivent **avant le code du moteur**,
dans une session à part (`CHANTIERS.md` A7.3.e), sur le modèle de la vague
2.2 : pages publiques FR et EN, exemples chiffrés repris de §18.9, copie « à
relire ». Chaque fiche assistée y renvoie. Un repère n'y entre que s'il a une
source primaire publique ; il s'affiche alors en **contexte** sur la fiche,
jamais pour désigner (C1). Les « pas de repère publiable » ci-dessous valent
jusqu'à ce que le terme en approuve un. Slugs proposés, à confirmer par la
session des termes (anglais dans les deux langues, R2-16) : `win-rate`,
`sales-cycle`, `acv`, `lead-to-opportunity`.

#### 18.4.2 Acquisition

**★ `slg.acq.lead-to-opp`** — Passage lead → opportunité / Lead-to-opportunity rate
- *Formule* : leads créés sur la cohorte de trois mois, devenus une
  opportunité qualifiée sous {n} jours ÷ leads créés sur ces trois mois. EN :
  leads created over the three-month cohort that became a qualified
  opportunity within {n} days ÷ leads created over those three months.
- *Période* : cohorte de trois mois qui finit au mois mûr pour la fenêtre de
  qualification. Au 24/09/2026, avec 30 j : **mai à juillet**. Cohorte, borné.
- *Variante* (fermée, imprimée) : `all-leads` (tout contact entrant) · `mql`
  (seuls les leads qualifiés par le marketing). Elle donne le nom de la base
  du relais : « pour 100 leads » ou « pour 100 MQL ».
- *Où le trouver* :
  - **HubSpot** : contacts créés sur la période, avec la date d'entrée dans
    l'étape « Opportunité » du cycle de vie. Le délai (entrée − création) doit
    être ≤ {n} j. Un export, puis on compte.
  - **Salesforce** : rapport de leads avec les informations de conversion.
    Leads créés sur la période, convertis, et « Converted Date » −
    « Created Date » ≤ {n} j.
  - **Pipedrive** : boîte de réception des leads, ceux de la période convertis
    en affaire. Sinon, un export.
- *Effort* : Seul, ~1 h · rôle `revops` · réparation par défaut : une
  après-midi.
- *Piège* : « lead » n'a pas de définition commune. Des contacts importés ou
  des inscrits à un webinar font chuter le taux sans que rien n'ait changé.
  Écris ce qui compte comme lead, et ce qui compte comme opportunité :
  acceptée par un commercial, pas seulement créée.
- *Glossaire* : « conversion lead → opportunité », terme neuf (Q8, A7.3.e),
  et `acquisition` en voisin.
- *Repère* : pas de repère publiable. Le glossaire n'en écrit aucun, et le
  taux dépend entièrement de ce que l'entreprise appelle un lead.

**`slg.acq.cac`** — CAC assisté / Sales-assisted CAC
- *Formule* : dépense ventes et marketing des trois derniers mois (variante)
  ÷ nouveaux clients assistés signés sur ces trois mois. Montant, non borné.
- *Période* : flux, juin à août. Le dénominateur est `slgDealsWon`.
- *Variante* : `media-only` · `plus-team` · `fully-loaded`, la liste
  existante. La fiche pré-sélectionne `fully-loaded` et dit pourquoi : « en
  vente assistée, le coût est d'abord celui des commerciaux ».
- *Où le trouver* :
  - **Finance** : la dépense ventes et marketing du trimestre, salaires
    chargés compris pour la variante « tout chargé ».
  - **HubSpot / Salesforce / Pipedrive** : les affaires « nouveau client »
    gagnées sur la période (le dénominateur).
  - **Régies** : le coût média, pour la variante « média seul ».
- *Effort* : À demander (finance) · réparation : une réunion.
- *Piège* : si le cycle médian dépasse trois mois, les clients signés ce
  trimestre viennent des dépenses d'avant. Le CAC du trimestre est alors un
  ordre de grandeur, pas une mesure (contrôle `slg-cycle-long`, §18.5.7). En
  hybride, la dépense commune (site, marque, contenu) se répartit entre les
  deux motions selon une clé écrite dans la définition. Sans clé, les deux
  CAC sont faux, et dans le même sens.
- *Glossaire* : `cac` · *Tour* : `acq-3`.
- *Repère* : aucun dans l'absolu. Il se juge contre ce qu'un client rapporte
  (payback, LTV:CAC).

**`slg.acq.cycle`** — Cycle de vente médian / Median sales cycle
- *Formule* : médiane des jours entre la création de l'opportunité et sa
  signature, sur les affaires « nouveau client » gagnées des trois derniers
  mois. `duration`, en jours ; statistique déclarée (`median` | `mean`).
- *Où le trouver* :
  - **Salesforce** : rapport des opportunités gagnées sur la période, champ
    d'ancienneté de l'opportunité (jours entre création et clôture). Export,
    puis médiane.
  - **HubSpot** : transactions gagnées, délai entre la date de création et la
    date de fermeture. Export, puis médiane : les rapports natifs donnent des
    moyennes.
  - **Pipedrive** : Insights, durée des affaires (une moyenne ; la médiane se
    calcule sur un export).
- *Effort* : Seul, ~1 h · rôle `revops` · réparation : une après-midi.
- *Piège* : une affaire à 400 jours déplace la moyenne de plusieurs semaines,
  donc prends la médiane. Et une opportunité créée tard, après la démo,
  raccourcit le cycle sur le papier.
- *Glossaire* : « cycle de vente », terme neuf (Q8, A7.3.e), et `cac`, dont
  la page explique le décalage qu'impose un cycle long.
- *Repère* : pas de repère publiable.

#### 18.4.3 Activation

**`slg.act.live-event`** — Ce que « en production » veut dire / What "live" means
- *Formule* : le résultat concret qui prouve qu'un client a obtenu ce qu'il a
  acheté (120 car.), et non la fin du déploiement technique.
- *Où le trouver* : une décision du produit et du Customer Success, pas un
  chiffre d'outil.
- *Effort* : Seul, 5 min (ou « À construire ») · rôle `customer-success` ·
  réparation : une réunion.
- *Piège* : « déployé » n'est pas « en production ». Un compte livré que
  personne n'utilise ne renouvelle pas.
- *Glossaire* : `aha-moment` · *Tour* : `act-1` · *Dépendance* :
  `slg.act.go-live` dépend de ce chiffre (même règle que `act.rate` →
  `act.event`).

**★ `slg.act.go-live`** — Mise en production / Go-live rate
- *Formule* : nouveaux clients signés sur la cohorte de trois mois, « en
  production » sous {n} jours après la signature ÷ nouveaux clients signés
  sur ces trois mois.
- *Période* : cohorte de trois mois qui finit au mois mûr pour la fenêtre de
  mise en production. Au 24/09/2026, avec 90 j : **mars à mai** (31/05 + 90 j
  = 29/08 ≤ 24/09 ; 30/06 + 90 j = 28/09 > 24/09). Cohorte, borné.
- *Où le trouver* :
  - **Outil de Customer Success** (Gainsight, Vitally, Planhat…) : l'étape
    d'onboarding du compte et sa date.
  - **HubSpot** : un pipeline d'onboarding (tickets ou transactions) avec la
    date de passage « en production ».
  - **Salesforce** : un champ date sur le compte ou sur l'objet d'onboarding,
    s'il existe.
  - **Pipedrive** : les projets d'onboarding, si l'équipe s'en sert.
  - Souvent, un tableur du Customer Success.
- *Effort* : À demander (customer success). « À construire » si aucune date
  n'est gardée. Réparation : un sprint.
- *Piège* : compter les comptes « déployés » plutôt qu'en production double
  le taux. Et le taux se lit sur la cohorte mûre : un client signé en août
  n'a pas eu ses 90 jours.
- *Glossaire* : `activation` · *Tour* : `act-2`.
- *Repère* : pas de repère publiable.

**`slg.act.time-to-live`** — Délai de mise en production / Time to go-live
- *Formule* : médiane des jours entre la signature et la mise en production,
  sur les clients de la cohorte qui y sont arrivés. `duration`, en jours.
- *Où le trouver* : les mêmes sources que la mise en production.
- *Effort* : Seul, ~1 h si la date existe, sinon À demander · réparation :
  une après-midi.
- *Piège* : médiane, et seulement sur ceux qui y sont arrivés : les autres
  sont dans le taux.
- *Glossaire* : `time-to-value` · *Repère* : aucun.

#### 18.4.4 Retention

**★ `slg.ret.renewal`** — Renouvellement des contrats / Contract renewal rate
- *Formule* : contrats renouvelés ÷ contrats arrivés à échéance sur les trois
  derniers mois. En **logos**, jamais en euros.
- *Période* : flux, juin à août. Borné.
- *Variante* (fermée, imprimée, entre dans la durée de vie §18.5.6) :
  `annual` (contrats annuels, défaut) · `monthly` (contrats mensuels : chaque
  mois compte comme une échéance).
- *Sans objet* : `no-renewal-yet` (« aucun contrat n'est encore arrivé à
  échéance »).
- *Où le trouver* :
  - **Salesforce** : opportunités de renouvellement closes sur la période
    (type d'affaire « client existant », ou un type dédié), gagnées ÷ closes.
  - **HubSpot** : un pipeline « Renouvellements », gagnées ÷ closes sur la
    période.
  - **Pipedrive** : un pipeline dédié, même lecture.
  - **Chargebee / Stripe** : les abonnements dont l'échéance tombait sur la
    période, et leur statut aujourd'hui.
- *Effort* : Seul, ~1 h s'il existe un pipeline de renouvellement, sinon À
  demander (finance) · rôle `customer-success` · réparation : une
  après-midi.
- *Piège* :
  - La tacite reconduction ne se « gagne » pas : compte les résiliations
    reçues avant l'échéance.
  - Un contrat pluriannuel qui n'arrive pas à échéance sort du dénominateur.
  - Un renouvellement à la baisse reste un renouvellement en logos : la perte
    se lit dans la NRR.
- *Glossaire* : `retention` · *Tour* : `ret-1`.
- *Repère* : pas de repère publiable. Le glossaire cite un churn logo
  **mensuel** (1-2 % pour le SaaS B2B à panier élevé, texte repassé « à
  relire » par A7.1), pas un taux de renouvellement. Le convertir supposerait
  des contrats mensuels.

**`slg.ret.nrr`** — NRR sur douze mois / 12-month NRR
- *Formule* : ARR aujourd'hui des clients assistés qui l'étaient déjà il y a
  douze mois ÷ leur ARR il y a douze mois. Deux montants, en pourcentage,
  **non borné** (peut dépasser 100 %).
- *Période* : les douze mois qui finissent au mois des flux.
- *Où le trouver* :
  - **ChartMogul** : la rétention nette de revenu par cohorte (selon
    l'offre).
  - **Finance** : le board pack.
  - **Salesforce** : la somme des contrats actifs par compte à deux dates, si
    les contrats y vivent.
- *Effort* : À demander (finance) · réparation : une après-midi.
- *Piège* : publiée seule, elle cache la perte. Une NRR à 110 % peut tenir
  sur une base qui perd un client sur cinq : lis-la avec le renouvellement.
  Les nouveaux clients de l'année n'entrent ni au numérateur ni au
  dénominateur.
- *Glossaire* : `nrr-grr`.
- *Repère* : **contexte**. 110-130 % est « considérée comme solide » en SaaS
  B2B (`nrr-grr`, bloc `benchmark`, approuvé au bon à tirer nº5). Il ne
  désigne jamais (C1), et la NRR n'est pas candidate. Test anti-dérive :
  « 110 » et « 130 » dans le texte du terme, FR et EN.

**`slg.ret.loss-cause`** — Cause principale de non-renouvellement / Main reason for non-renewal
- *Formule* : la cause (120 car.) et comment on la sait : données ·
  entretiens · intuition (`evidence`, comme `ret.churn-cause`).
- *Où le trouver* :
  - **HubSpot** : la raison de perte sur les renouvellements perdus.
  - **Salesforce** : le champ de raison de perte, souvent personnalisé.
  - **Pipedrive** : la raison de perte des affaires perdues.
  - Relire les derniers départs avec le Customer Success.
- *Effort* : À demander (customer success) · réparation : une réunion.
- *Piège* : « le prix » est la case la plus rapide à cocher. Croise la raison
  déclarée avec l'usage des 90 jours d'avant.
- *Glossaire* : `churn` · *Tour* : `ret-3`.

#### 18.4.5 Referral

**★ `slg.ref.referred-share`** — Opportunités recommandées / Referred opportunities
- *Formule* : opportunités créées sur les trois derniers mois dont la source
  est une recommandation client (ou un partenaire, selon la variante) ÷
  opportunités créées sur ces trois mois (`slgOppsCreated`).
- *Variante* : `customers` · `customers-and-partners`.
- *Où le trouver* :
  - **Salesforce** : la source du lead ou de l'opportunité (valeurs de
    recommandation et de partenaire, selon la configuration).
  - **HubSpot** : une propriété de source de la transaction, le plus souvent
    personnalisée ; la « source d'origine » ne sait pas ce qu'est une
    recommandation.
  - **Pipedrive** : le champ de source de l'affaire.
  - En assisté, demander aux commerciaux l'origine de leurs dix dernières
    opportunités va souvent plus vite et plus juste.
- *Effort* : Seul, ~1 h · rôle `sales` · réparation : une après-midi.
- *Piège* : un zéro veut presque toujours dire « personne ne l'a compté », pas
  « ça n'arrive pas ». Et la source « referral » d'un outil web compte des
  sites, pas des personnes.
- *Glossaire* : `referral`.
- *Repère* : pas de repère publiable. Le glossaire dit « de presque zéro à la
  majorité selon le produit » : compare-toi à toi-même.

**`slg.ref.referenceable`** — Clients références / Reference customers
- *Formule* : clients assistés qui ont donné un accord écrit, daté de moins de
  douze mois, pour être cités ou prendre un appel de prospect ÷ clients
  assistés à la fin du mois des flux (`slgCustomers`).
- *Où le trouver* : un tableur du marketing ou du Customer Success ; une
  propriété « client référence » sur la société (HubSpot, Salesforce,
  Pipedrive), si l'équipe l'a créée.
- *Effort* : À demander (marketing) · réparation : une après-midi.
- *Piège* : les logos du site comptent des clients partis et des accords
  jamais renouvelés.
- *Glossaire* : `referral` · *Repère* : aucun.

#### 18.4.6 Revenue

**★ `slg.rev.win-rate`** — Taux de closing / Win rate
- *Formule* : opportunités « nouveau client » gagnées ÷ opportunités
  « nouveau client » conclues (gagnées + perdues) sur les trois derniers
  mois. Le numérateur est `slgDealsWon`.
- *Où le trouver* :
  - **Salesforce** : rapport d'opportunités « nouveau client » closes sur la
    période, gagnées ÷ closes.
  - **HubSpot** : transactions « nouvelle affaire » fermées sur la période,
    gagnées ÷ (gagnées + perdues).
  - **Pipedrive** : Insights, conversion des affaires sur la période.
- *Effort* : Seul, 5 min · rôle `revops` · réparation : une réunion.
- *Piège* : les affaires mortes jamais passées « perdues » gonflent le taux,
  et un « sans décision » est une perte. Les upsells sur des clients
  existants n'ont rien à faire ici.
- *Glossaire* : « taux de closing », terme neuf (Q8, A7.3.e), et `revenue` en
  voisin.
- *Repère* : pas de repère publiable (voir §18.4.1 pour les chiffres de
  l'audit, exclus).

**`slg.rev.acv`** — ACV des nouveaux contrats / New-contract ACV
- *Formule* : valeur annuelle totale des contrats « nouveau client » signés
  sur les trois derniers mois (hors frais de mise en service, un contrat
  pluriannuel ramené à l'année) ÷ nombre de ces contrats (`slgDealsWon`).
- *Où le trouver* :
  - **HubSpot** : la propriété d'ACV des transactions (calculée depuis les
    lignes de produit), sinon le montant.
  - **Salesforce** : le montant des opportunités gagnées (vérifie qu'il porte
    une année et non toute la durée).
  - **Pipedrive** : la valeur des affaires gagnées.
  - **Finance** : les contrats signés.
- *Effort* : Seul, 5 min · rôle `finance` · réparation : une réunion.
- *Piège* : un montant qui porte trois ans de contrat triple l'ACV, et les
  frais de mise en service ne sont pas récurrents. Une moyenne se laisse
  tirer par un gros contrat : regarde aussi la médiane.
- *Glossaire* : « ACV », terme neuf (Q8, A7.3.e), et `arpu` en voisin.
- *Repère* : aucun (« trois ordres de grandeur entre catégories », `arpu`).

**`slg.rev.arpa`** — ARPA assisté / Sales-assisted ARPA
- *Formule* : MRR des clients assistés à la fin du mois des flux ÷ clients
  assistés (`slgCustomers`). Le numérateur est le MRR assisté, qui entre dans
  le total.
- *Où le trouver* : **Stripe / Chargebee / ChartMogul**, le MRR et les
  clients filtrés sur les clients assistés (un segment, un plan, une
  propriété) ; **Finance**, l'ARR assisté ÷ 12.
- *Effort* : Seul, 5 min si les clients assistés sont marqués, sinon À
  demander (finance) · réparation : une réunion.
- *Piège* : en hybride, un client compte dans la seule motion qui a signé son
  contrat en cours (S8). Un client du libre-service passé par un commercial
  compte ici, et plus dans l'ARPA libre-service.
- *Glossaire* : `arpu` · *Repère* : aucun.

**`slg.rev.gross-margin`** — Marge brute de l'assisté / Sales-assisted gross margin
- *Formule* : (revenu assisté − coût pour le servir, mise en service et
  Customer Success compris) ÷ revenu assisté, sur les trois derniers mois.
  Pourcentage, borné. `rev.gross-margin` reste celle du libre-service,
  inchangée.
- *Période* : flux, juin à août.
- *Où le trouver* : **Finance**, le compte de résultat par offre ou par
  segment quand elle le tient ; sinon, la marge globale, en repli.
- *Effort* : À demander (finance) · rôle `finance` · réparation : une
  réunion.
- *Repli sur la marge globale* (Q4, tranchée le 2026-09-30), **en hybride
  seulement** : la fiche propose « Reprendre la marge globale » / "Use the
  company-wide margin". La valeur s'enregistre en **estimation**, base
  `company-wide` (« marge globale de l'entreprise » / "company-wide
  margin"). Elle compte donc **approximative, jamais trouvée**, et les
  trois calculés qui en découlent portent « ~ ». Par symétrie, la fiche de
  `rev.gross-margin` offre le même repli en hybride : une marge globale n'est
  pas plus celle du libre-service. Si l'autre fiche porte déjà une marge
  globale, sa valeur est pré-remplie. En libre-service seul, rien ne change :
  la marge de l'entreprise est celle du libre-service.
- *Piège* : « Une marge globale flatte l'assisté quand son offre comprend de
  la mise en service : demande la marge par motion à la finance. » / "A
  company-wide margin flatters sales-assisted when its offer includes
  onboarding: ask finance for the margin by motion." Sur l'exemple §18.9,
  75 % de marge globale donnent un payback assisté de 13 mois, et 60 % de
  marge réelle en donnent 16.
- *Glossaire* : `cac-payback` (comme `rev.gross-margin`) · *Repère* : aucun.

**Pièges du libre-service, en hybride seulement** (Q3, tranchée le
2026-09-30). Cinq fiches du libre-service gagnent une ligne de piège,
affichée seulement si les deux motions sont cochées :
- `ret.logo-churn`, `rev.contraction` et `rev.expansion` : « Un compte passé
  à l'assisté n'est ni perdu, ni en baisse, ni en hausse : il quitte le
  libre-service. Si ton outil de facturation l'annule, retire-le des
  perdus. » / "An account that moved to sales-assisted isn't lost,
  downgraded or expanded: it leaves self-serve. If your billing tool cancels
  it, take it out of the lost accounts." ;
- `rev.paid-conversion` et `rev.arpa` : « Un compte signé par un commercial
  compte en assisté, même s'il est né ici. » / "An account signed by a
  salesperson counts as sales-assisted, even if it started here."

Copie neuve, « à relire ». Les tests de contenu vérifient qu'aucune de ces
lignes ne s'affiche hors hybride.

#### 18.4.7 Les trois calculés assistés (jamais saisis)

| id | Formule | Existe si | Repère (contexte) | Glossaire · Tour |
|---|---|---|---|---|
| `slg.rev.ltv` | ACV ÷ 12 × marge brute de l'assisté × durée de vie, en mois (§18.5.6) | ACV, marge de l'assisté, renouvellement connus ou estimés | durée plafonnée à 36 mois, comme en PLG (Q6) | `ltv` · `rev-2` |
| `slg.rev.cac-payback` | CAC assisté ÷ (ACV ÷ 12 × marge brute de l'assisté), en mois | CAC, ACV, marge de l'assisté | le même que le PLG : < 12 mois pour un SaaS vendu aux petites entreprises, 18-24 mois en vente entreprise (`cac-payback`) | `cac-payback` · — |
| `slg.rev.ltv-cac` | LTV ÷ CAC | les deux | autour de 3:1, « un repère, pas une loi » (`ltv`) | `ltv` · — |

Ces chiffres partent de l'**ACV des nouveaux contrats**, et non de l'ARPA
assisté, parce que le CAC porte sur eux. Mêmes règles qu'en PLG : jamais 0,
« incalculable — manque : {entrée} », et jamais de repli sur le revenu quand
la marge manque. La marge est `slg.rev.gross-margin`, jamais celle du
libre-service (Q4).

#### 18.4.8 La liaison

**`link.pql-handoff`** — Opportunités venues du libre-service / Opportunities from self-serve
- *Formule* : opportunités assistées créées sur les trois derniers mois à
  partir d'un compte du libre-service (un PQL passé aux commerciaux) ÷
  opportunités assistées créées sur ces trois mois (`slgOppsCreated`). Borné.
- *Définition recommandée* (`definitionNote`, déjà prévue) : le seuil PQL,
  par exemple « espace avec 3 membres actifs ».
- *Où le trouver* :
  - **HubSpot** : la source de la transaction, ou une propriété « PQL »
    posée par l'intégration produit.
  - **Salesforce** : la source du lead, ou une campagne dédiée aux PQL.
  - **Pipedrive** : le champ de source ou un libellé.
  - **Data** : la jointure base produit × CRM sur le domaine de l'entreprise.
- *Effort* : Seul, ~1 h si la source est posée, sinon « À construire ».
- *Piège* : une opportunité issue d'un compte du libre-service n'est pas
  forcément « amenée par le produit » : le compte avait peut-être déjà parlé à
  un commercial. C'est une part du pipeline, pas une attribution. Et elle ne
  s'additionne pas à la part recommandée : une opportunité peut être les
  deux.
- *Glossaire* : `pql`.
- *Repère* : aucun. Le glossaire le dit : « la seule référence qui vaille est
  ton propre taux de base ».
- `scope: "link"`, `optional` (S10). *Question Q7*, tranchée le 2026-09-30 :
  **un levier « Et si » dès la v1**, en nombre d'opportunités par trimestre,
  jamais candidat (§18.5.5).

#### 18.4.9 Le pont avec le Tour (assisté)

Même règle qu'en §6.11 : un pont seulement là où la question porte
**littéralement** sur le fait de mesurer ce chiffre. Six ponts :

| Question | Chiffre |
|---|---|
| `acq-3` | `slg.acq.cac` |
| `act-1` | `slg.act.live-event` |
| `act-2` | `slg.act.go-live` |
| `ret-1` | `slg.ret.renewal` (« un taux de rétention, ou équivalent ») |
| `ret-3` | `slg.ret.loss-cause` |
| `rev-2` | `slg.rev.ltv` (calculé) |

`acq-1` n'a pas de pont en assisté (pas de chiffre « canal principal »), et
`ref-3` non plus (le coefficient viral n'a pas d'équivalent). En hybride,
une question pontée dans les deux motions donne **une ligne par motion**
(`BridgeRow.motion`), et la carte cite la réponse du Tour une fois : « Au
Tour : « Oui, et on le mesure » (20 pts). Libre-service : trouvé. Assisté :
introuvable. » Les compteurs du miroir comptent les lignes.

---

### 18.5 Les calculs assistés — purs, déterministes, dans `lib/engine/`

Les modules existants gagnent un paramètre `motion`. Les nouveaux sont
`relays.ts`, `total.ts`, `slg-impact.ts` et `slg-scenario.ts`. Aucun ne lit
un chiffre de l'autre motion, sauf `total.ts`, qui additionne, et `sanity.ts`
pour `cac-variants-differ`. Un test d'indépendance le garde (§18.10).

#### 18.5.1 Les trois relais (`relays.ts`)

Le peloton PLG compte chaque colonne sur **les mêmes** 100 inscrits (D5).
L'assisté ne le peut pas : le taux de closing porte sur les opportunités
conclues du trimestre, pas sur les leads d'une cohorte (il faudrait remonter
un cycle entier en arrière). Le funnel assisté est donc dessiné en **trois
relais**, chacun sur **sa** base de 100, dans l'ordre chronologique :

| Relais | Base (100) | Chiffre | Période |
|---|---|---|---|
| 1 | leads (ou MQL) de la cohorte | `slg.acq.lead-to-opp` → « deviennent une opportunité » | cohorte, ex. mai-juillet |
| 2 | opportunités conclues | `slg.rev.win-rate` → « sont signées » | flux, ex. juin-août |
| 3 | nouveaux clients de la cohorte | `slg.act.go-live` → « sont en production à {n} jours » | cohorte, ex. mars-mai |

- `perHundred = round(100 × taux)`, borne par borne ; un inconnu vaut `null`,
  jamais 0.
- **Pas de chaîne multiplicative** : on n'imprime jamais « {x} clients pour
  100 leads ». La légende le dit : « Chaque grille a sa propre base de 100 :
  ce ne sont pas les mêmes personnes. » / "Each grid has its own base of 100:
  they aren't the same people."
- `chain` reprend `peloton.ts#chainOf` sur les trois relais (`complete`,
  `gap`, `tail-break`, `empty`) : « on ne voit pas ce relais », même si les
  bases diffèrent.
- `leadsPerMonth = dénominateur ÷ 3`, la ligne amont : « ~160 MQL par mois ·
  HubSpot · mai à juillet ».
- **Petits effectifs, version assistée** : tout ratio SLG borné dont le
  dénominateur est < 100 perd ses décimales (règle §6.2), et sa fiche dit
  « Sur {d} {base}, un de plus ou de moins bouge le taux de {p} point(s) : lis
  la direction. » / "Out of {d} {base}, one more or less moves the rate by
  {p} point(s): read the direction.", avec `p = 100 ÷ d` formaté comme un
  taux. Le tableau affiche la phrase du ★ au plus petit dénominateur.

#### 18.5.2 Le diagnostic assisté (`diagnose.ts`, `motion: "slg"`)

**Candidats** : `slg.acq.lead-to-opp`, `slg.rev.win-rate`, `slg.act.go-live`,
`slg.ret.renewal`, `slg.ref.referred-share`. Tous se lisent « plus haut =
mieux » : le renouvellement est un taux de ce qu'on garde, pas de ce qu'on
perd.

**Comparateur** : la cible d'équipe, sinon aucun (C1). Les positions, les
états (`not-enough`, `level`, `clear`, `shared`), `CLEAR_MARGIN` = 1,25 et la
tolérance de `clearlyAbove` sont **inchangés**, appliqués aux seuls candidats
SLG.

**Non chiffrés en €** : `slg.act.go-live` (il faudrait un modèle qui relie la
mise en production au renouvellement) et `slg.ref.referred-share` (la
boucle). Ils vont en `belowUnpriced`, comme `ret.d30` et `ref.referred-share`
en PLG.

**`blind`** : tout ★ assisté dont la valeur est inconnue. Les cinq ★ sont
aussi les cinq candidats, donc il n'y a pas d'équivalent du churn à ajouter
comme en PLG. Même phrase qu'en PLG.

Une phrase fixe, affichée une fois sous le diagnostic assisté : « Le cycle ne
bouge pas l'argent dans ce calcul : le raccourcir avance les signatures sans
en créer. » / "The cycle doesn't move the money in this calculation:
shortening it brings signatures forward without creating any."

#### 18.5.3 L'impact en € (`slg-impact.ts`), en trimestre puis par mois

- *W* = nouveaux clients assistés sur les trois mois : `slgDealsWon` mesuré
  (numérateur du taux de closing ou dénominateur du CAC). Sinon, les
  opportunités conclues × le taux de closing (approximatif). Sinon, inconnu.
  *Codé en S1 (2026-10-01)* : la seconde voie n'existe pas dans les données.
  Un taux de closing saisi en comptes porte déjà W au numérateur, et sans
  comptes il n'y a pas d'opportunités conclues à multiplier. W se lit donc
  sur le compte partagé (`knownSharedCount`), et il est inconnu sinon.
- *ACV mensuel* = ACV ÷ 12. *ARPA assisté* = `slg.rev.arpa`. *D* = contrats
  arrivés à échéance sur les trois mois (dénominateur du renouvellement).
- **Flux** (`lead-to-opp`, `win-rate`) : clients en plus sur trois mois =
  `W × (t ÷ r − 1)` ; MRR nouveau par mois = `W × (t ÷ r − 1) × ACV ÷ 12 ÷ 3`.
  C'est le même *W* et le même ACV pour les deux : **classer en € revient à
  classer par écart relatif**, la même identité qu'en PLG (D9), épinglée par
  un test.
  - Hypothèse imprimée pour `lead-to-opp` : « les opportunités en plus se
    signent au même taux que les autres ».
  - Pour `win-rate` : « le même nombre d'opportunités conclues ».
- **Renouvellement** : contrats gardés en plus sur trois mois =
  `D × (t − r) ÷ 100` ; MRR préservé par mois = `D × (t − r) ÷ 100 × ARPA
  assisté ÷ 3`. Hypothèse imprimée : « les contrats sauvés valent l'ARPA
  assisté ».
- Sans ACV ni ARPA : impact en clients (`customers`). Sans *W* : « pour 100 »
  sur la base du relais, jamais une chaîne. Exemples : « +{x} opportunités
  pour 100 leads », « +{x} signatures pour 100 opportunités conclues ».
- **La chaîne affichée** (lignes recalculables à la calculette, comme §6.7) :

| Clé | FR | EN |
|---|---|---|
| `today` (flux) | « Aujourd'hui · {rate} {phrase} → {n} nouveaux clients sur 3 mois » | "Today · {rate} {phrase} → {n} new customers over 3 months" |
| `today` (renouvellement) | « Aujourd'hui · {rate} des contrats échus renouvelés, sur {d} contrats échus en 3 mois » | "Today · {rate} of contracts up for renewal renewed, out of {d} in 3 months" |
| `if` | « Si · {stage} atteint {target} (cible de l'équipe) » | "If · {stage} reaches {target} (team target)" |
| `then` (flux) | « Alors · {n} × {t}/{r} = {m} (+{delta}) sur 3 mois » | "Then · {n} × {t}/{r} = {m} (+{delta}) over 3 months" |
| `then` (renouvellement) | « Alors · {d} × ({target} − {rate}) = {kept} contrat(s) gardé(s) en plus sur 3 mois » | "Then · {d} × ({target} − {rate}) = {kept} more contract(s) kept over 3 months" |
| `times` (flux) | « × ACV ÷ 12 · {delta} × {acvMonthly} = {quarter} de MRR nouveau par trimestre » | "× ACV ÷ 12 · {delta} × {acvMonthly} = {quarter} of new MRR per quarter" |
| `times` (renouvellement) | « × ARPA assisté · {kept} × {arpa} = {quarter} de MRR préservé par trimestre » | "× sales-assisted ARPA · {kept} × {arpa} = {quarter} of retained MRR per quarter" |
| `per-month` | « soit {amount} par mois » | "that is {amount} a month" |
| `annual` | « Soit {amount} de MRR de plus au bout d'un an (contrats annuels : aucun ne se renouvelle dans l'année). » | "That's {amount} more MRR after a year (annual contracts: none comes up for renewal within the year)." |

  `{quarter}` est un entier × un montant affiché, donc exact. `{amount}` vaut
  `{quarter} ÷ 3`, arrondi à deux chiffres significatifs avec « ~ ». La ligne
  `annual` vaut `{amount} × 12`, seulement si le renouvellement est connu en
  variante `annual`. En variante `monthly`, elle reprend la décroissance
  PLG, `Σ (r/100)^k`. Un écart de moins d'un client (ou d'un contrat) donne
  `less-than-one`, sans montant, comme en PLG.

  *Codé en S1 (2026-10-01)*, trois précisions :
  - **Pas de « → » sur une slide** : les trois fontes ne portent pas la
    flèche (§10.4, le test des glyphes l'a refusée). La ligne `today` des
    flux s'écrit donc comme en PLG, « 24 % de closing, soit 18 nouveaux
    clients sur 3 mois », et le sujet du passage lead → opportunité est
    « le passage des leads en opportunités ».
  - `{acvMonthly}` est l'ACV ÷ 12 **arrondi à l'unité monétaire**, pour que
    « 6 × 2 000 € » se refasse à la calculette quand l'ACV n'est pas un
    multiple de 12.
  - La ligne `annual` vaut aussi pour le renouvellement : les contrats
    sauvés d'un trimestre restent un an en contrats annuels.
- **Titre = corps** : le titre de `slg:leak` cite `{amount}`, lu sur la
  ligne `per-month` du même objet (`impactHeadline`, étendu). C'est le
  gabarit PLG existant (`leakClearMrrNew` / `leakClearMrrRetained`) : « chaque
  mois » dit la même chose que « par mois ».

#### 18.5.4 Ce qui n'est jamais chiffré

- La mise en production et la part recommandée (§18.5.2).
- Le cycle, qui avance l'argent sans en créer.
- Les clients références.
- La NRR, qui est du contexte et non une candidate.
- La liaison, qui ne vaut jamais « X € du libre-service ». Son « Et si »
  (Q7) chiffre du MRR **assisté** en plus, jamais une fuite ni un montant
  pris au libre-service.
- **Aucune fuite d'une motion n'est jamais rapportée en € à l'autre**, ni
  additionnée à l'autre.

#### 18.5.5 « Et si » assisté (`slg-scenario.ts`)

- **Leviers**, dans cet ordre : `slg.acq.lead-to-opp`, `slg.rev.win-rate`,
  `slg.ret.renewal`, `slg.rev.acv`, puis, en hybride, `link.pql-handoff`
  (Q7). Même panneau, mêmes curseurs (pas de
  `scenario.ts#stepOf`), mêmes slides `whatif:<lever>`, et une slide
  `slg:scenario` « ensemble » à partir de deux leviers.
- **Modèle, à régime établi** (chaque règle est imprimée avec le résultat) :
  - `W' = W × (t_lead ÷ r_lead) × (t_win ÷ r_win) × (O' ÷ O)` : les leviers
    se composent, comme activation et conversion en PLG. `O` = opportunités
    créées sur le trimestre (`slgOppsCreated`), `O' = O + (L' − L)`, où `L`
    est le nombre d'opportunités venues du libre-service (numérateur de
    `link.pql-handoff`, ou part × `O`) et `L'` la valeur du curseur.
  - Nouveau MRR par mois = `W' ÷ 3 × ACV' ÷ 12` : le nouvel ACV porte sur les
    nouveaux contrats seulement.
  - Base dans 12 mois = MRR assisté × NRR' (ou × renouvellement', en
    approximation « logos pour revenu », si la NRR manque). Avec
    `NRR' = NRR + (t_ren − r_ren)` points : « un point de renouvellement
    compte comme un point de NRR ; les contrats sauvés valent la moyenne ».
  - MRR dans 12 mois = base dans 12 mois + 12 × nouveau MRR par mois
    (contrats annuels : aucun nouveau ne se renouvelle dans l'année).
  - CAC' = même dépense ÷ W'. LTV' et payback' par §18.5.6.
- **Le levier de la liaison** (Q7, tranchée le 2026-09-30), en hybride
  seulement :
  - curseur « Opportunités venues du libre-service, par trimestre » /
    "Opportunities from self-serve, per quarter", en entiers, de 0 à
    `2 × L` au moins ; pas de curseur si `L` ou `O` est inconnu (règle
    existante : un levier non saisi n'a pas de curseur) ;
  - il vit dans le panneau de l'assisté, et son gain s'écrit dans l'assisté
    et dans la ligne du total. **Rien n'est retiré au libre-service** ;
  - hypothèses imprimées : « les autres opportunités ne changent pas » ;
    « celles venues du libre-service se signent au même taux que les
    autres » ; « on ne sait pas combien de ces comptes auraient payé seuls :
    rien n'est retiré au libre-service » ;
  - la liaison reste facultative, hors couverture, **jamais candidate ni
    constat** : elle ne nomme jamais de fuite, cible d'équipe ou pas ;
  - exemple §18.9, 31 → 40 : `O'` = 139, `W'` = 18 × 139/130 = 19,25
    (+1,25 signature par trimestre) × 2 000 € = ~2 500 € de MRR nouveau par
    trimestre, **soit ~830 € par mois**, et ~10 000 € de MRR de plus au bout
    d'un an.
- **Pas de levier sur le cycle** (il avance, il ne crée pas), ni sur la
  mise en production (non chiffrée).
- **En hybride** : deux panneaux, un par motion, chacun sur ses leviers. Une
  seule ligne les relie, le **MRR total dans 12 mois**, aujourd'hui → avec
  les « Et si » des deux panneaux. C'est une somme, pas une comparaison ;
  elle suit la règle d'affichage de §18.6.2.

#### 18.5.6 Unit economics assistées (`unit-economics.ts`, branche SLG)

- Durée de vie, en mois :
  - `annual` : `min(12 ÷ (1 − r/100), 36)` ;
  - `monthly` : `min(1 ÷ (1 − r/100), 36)` ;
  - `r = 100` donne 36. Les bornes s'inversent (un renouvellement plus haut
    donne une vie plus longue).
- LTV = ACV ÷ 12 × marge ÷ 100 × durée ; payback = CAC ÷ (ACV ÷ 12 × marge
  ÷ 100) ; LTV:CAC = LTV ÷ CAC, où la marge est `slg.rev.gross-margin` (Q4).
  Tout en intervalles. Marge inconnue : les trois sont incalculables, et
  **jamais de repli sur le revenu** ni sur la marge du libre-service. Une
  marge reprise de la marge globale est une estimation : les trois portent
  « ~ ».
- « Clients perdus sur un an », pour la slide en regard (Q5) :
  - assisté `annual` : `100 − r` (« des contrats échus ») ;
  - assisté `monthly` : `100 × (1 − (r/100)^12)` ;
  - libre-service : `100 × (1 − (1 − churn/100)^12)`, composé, affiché
    « ~26 % (2,5 % par mois, composé) ».

#### 18.5.7 Contrôles de cohérence assistés (`sanity.ts`), « à vérifier », jamais bloquants

| Id | Condition | Message (FR / EN) |
|---|---|---|
| `num-gt-den` | ratio SLG borné, numérateur > dénominateur | bloque, message existant |
| `slg-cycle-long` | cycle médian > 90 jours (tout l'intervalle) | « Ton cycle médian dépasse les trois mois de la fenêtre : le CAC du trimestre divise sa dépense par des clients venus des dépenses d'avant. Lis-le comme un ordre de grandeur. » / "Your median cycle is longer than the three-month window: this quarter's CAC divides its spend by customers from earlier spend. Read it as an order of magnitude." |
| `slg-cycle-mean`, `slg-ttl-mean` | statistique `mean` | le message de `ttv-mean`, repris |
| `slg-acv-vs-arpa` | (ACV ÷ 12) ÷ ARPA assisté entièrement hors de [0,5 ; 2] | « Un nouveau contrat vaut {x} fois le panier moyen du portefeuille : hausse de prix, nouveau segment, ou deux définitions du revenu ? » / "A new contract is worth {x} times the book's average: price rise, new segment, or two definitions of revenue?" |
| `cac-variants-differ` | hybride, les deux CAC connus avec des variantes différentes | « Les deux CAC ne comptent pas les mêmes dépenses : {v1} en libre-service, {v2} en assisté. » / "The two CACs don't count the same spend: {v1} self-serve, {v2} sales-assisted." Imprimé aussi au pied de la slide en regard |

Les seuils (90 j, [0,5 ; 2]) sont des déclencheurs de relecture, jamais des
repères. Ils n'apparaissent sur aucune slide comme une norme.

#### 18.5.8 Constats assistés (`findings.ts`)

Mêmes kinds et mêmes rangs, avec `motion` posé :
- `chain-break` : un relais inconnu et introuvable ; `go-live` avec sa
  définition introuvable fait un seul constat, sur la définition.
- `no-definition`, `blind-spot` (ponts §18.4.9), `below-comparator`,
  `conflict`.
- `unit-econ-uncomputable` : payback assisté.
- `small-cohort` : il devient `small-sample` en assisté, avec le chiffre et
  `p`. *Codé en S1* : un seul constat, sur le ★ compté au plus petit
  dénominateur, comme la phrase du tableau (§18.5.1), et non un par chiffre,
  qui ferait jusqu'à six constats de rang 4 pour un seul fait.
- `hidden-knowledge`.

Pas de constat de liaison. Règle inchangée : **aucune phrase n'affirme une
cause**.

---

### 18.6 L'hybride : deux moteurs, un total

#### 18.6.1 Ce qui se dédouble, ce qui reste unique, ce qui s'additionne

| Objet | Hybride |
|---|---|
| Couverture | une par motion, dans sa colonne. L'union (liaison exclue) sert au pied des slides communes et à la slide `visibility` |
| Funnel | deux : le peloton PLG et les relais SLG, **côte à côte**, sans axe ni échelle commune |
| Diagnostic | deux, chacun contre **ses** cibles. Chaque motion peut nommer sa fuite. **Aucune fonction ne classe les deux ensemble** : il n'existe pas de « plus grosse fuite des deux moteurs » |
| « Et si » | deux panneaux ; une ligne commune, le MRR total dans 12 mois |
| MRR, nouveau MRR du mois, MRR dans 12 mois | **additionnés** (`total.ts`) |
| Unit economics | une slide, deux colonnes **en regard** |
| Miroir du Tour | un seul, une ligne par (question, motion) |
| Demande copiée, « À aller chercher » | un seul, groupé par rôle, les chiffres de chaque motion sous son intertitre |
| Ask | une seule slide (§18.8) |

#### 18.6.2 Le total (`total.ts`)

- **MRR** = MRR libre-service (numérateur de `rev.arpa`, compte `mrrEnd`) +
  MRR assisté (numérateur de `slg.rev.arpa`). Deux montants saisis en
  comptes donnent une somme **exacte**, sans « ~ ». Une partie estimée ou
  approximative donne une somme en intervalle, avec « ~ ». Une partie
  inconnue donne `uncomputable`, qui nomme la partie manquante (S9).
- **Nouveau MRR du mois** = N × ARPA (PLG, comme `scenario.ts`) + W ÷ 3 × ACV
  ÷ 12 (SLG).
- **MRR dans 12 mois, au rythme actuel** = `mrr12` PLG (`scenario.ts`, sans
  « Et si ») + la projection SLG (§18.5.5, sans « Et si »). Seulement si les
  deux existent (Q11).
- **Règle d'affichage d'une somme** : les parties sont arrondies à une unité
  commune, celle des deux chiffres significatifs de la plus petite partie, et
  **le total affiché est la somme des parties affichées**. Le lecteur refait
  l'addition à la calculette : même règle que la chaîne de §6.7, même test.

#### 18.6.3 La liaison libre-service → ventes

- **Définition** : §18.4.8. En hybride seulement, facultative.
- **Où elle apparaît** :
  - la bande du total (tableau) et la slide `total` : « {n} des {m}
    opportunités assistées viennent de comptes du libre-service ({période}). »
    / "{n} of the {m} sales-assisted opportunities came from self-serve
    accounts ({period})." ;
  - l'onglet Acquisition de l'assisté, sous ses trois chiffres, en bloc
    « Liaison avec le libre-service », que la prop `optional` marque
    facultatif (C29, 2026-09-30 : le mot sort des libellés) ;
  - l'annexe ;
  - une flèche **SVG** dans la bande du total, du bloc libre-service vers le
    bloc assisté (jamais un glyphe, §8.6).
- **Ce qu'on n'en conclut pas**, en note de la bande et de la slide : « Une
  part du pipeline, pas une attribution : on ne sait pas combien de ces
  comptes auraient signé sans le libre-service. » / "A share of the pipeline,
  not an attribution: we don't know how many of these accounts would have
  signed without self-serve." La liaison ne déplace aucun client ni aucun
  euro d'une motion à l'autre. S8 décide qui compte où.
- **Jamais** : ni candidate, ni constat, ni valeur « en € du libre-service ».
  **Un levier « Et si » depuis Q7** (2026-09-30), dont le gain est du MRR
  assisté (§18.5.5).

#### 18.6.4 Garde-fous du « jamais face-à-face »

1. **Ordre fixe** : libre-service puis assisté, partout (colonnes, lignes,
   titres, listes), quelles que soient les valeurs. Un test échange les
   valeurs des deux motions et vérifie que l'ordre ne bouge pas.
2. **Aucun comparatif** dans les gabarits hybrides. Un test balaie la copie
   `hybrid.*`, `total.*` et `slide.unitEconomicsBoth*` à la recherche de
   `vs`, `versus`, « contre », « face à », « plus rentable », « mieux »,
   « meilleur », « moins bien », « fois plus », "better", "worse", "than",
   "against".
3. **Aucun graphique commun** : pas de barres, d'empilement ni de jauge qui
   mette les deux motions sur un même axe. Le total est du texte.
4. **Une phrase fixe**, sous les deux diagnostics et au pied de la slide en
   regard : « Deux motions, deux segments : chacune se lit contre ses cibles,
   pas contre l'autre. » / "Two motions, two segments: each is read against
   its own targets, not against the other."

---

### 18.7 Les écrans (E1-E5 revus)

**E0 (la page statique)** : la section « Les dix-sept chiffres » devient deux
sous-sections :
- « Libre-service : 17 chiffres » ;
- « Assisté : 15 chiffres », avec formule, « où le
  trouver » et glossaire, pliées comme aujourd'hui.

Une question de FAQ s'ajoute : « Et si on vend avec une équipe
commerciale ? » / "What if we sell through a sales team?". Réponse : les deux
motions, l'hybride, jamais l'un contre l'autre. `meta.title` ne change pas.

**E1** : §18.1.

**E2, une seule motion** : l'écran actuel. En assisté seul, les relais
remplacent le peloton, et l'eyebrow dit « Ton moteur de growth · assisté ·
flux : juin à août 2026 ».

**E2, hybride, à 1 280 px**, de haut en bas :
1. Eyebrow : « Ton moteur de growth · libre-service et assisté · flux :
   août 2026 ».
2. **Bande « Deux moteurs, un total »** (`Card`, pleine largeur) :
   - le titre-verdict en stencil, c'est-à-dire le titre de la slide `total` ;
   - deux blocs texte côte à côte (MRR, nouveau MRR du mois), avec la flèche
     de liaison et sa phrase entre eux ;
   - la phrase fixe de §18.6.4.
3. **Grille `minmax(0,1fr) minmax(0,1fr)`**, libre-service à gauche, assisté
   à droite. Chaque colonne a son eyebrow de motion, ses puces de couverture,
   son diagnostic (grammaire `Diagnosis`, eyebrow « Libre-service — une
   étape freine le moteur »), puis son funnel **en format compact** :
   - peloton en quatre lignes, mini-grilles de 118 px à gauche (le rendu
     mobile actuel) ;
   - relais en trois lignes, même format, séparés par un filet et
     l'étiquette « nouvelle base ».

   Les deux colonnes ont la même hauteur de bloc (`subgrid`) : aucune
   longueur ne se compare d'une colonne à l'autre.
4. **Sélecteur de motion** (`Segmented`, « Libre-service · Assisté ») : il
   choisit quels onglets d'étape (`StageTabs`) et quel panneau « Et si »
   s'affichent en dessous. Par défaut, la motion dont un chiffre a été ouvert
   en dernier, sinon le libre-service. La ligne « MRR total dans 12 mois »
   reste sous le panneau, quelle que soit la motion.
5. Déclaré × mesuré, barre d'actions, bandeau de sauvegarde : uniques,
   inchangés.

**E2, hybride, à 390 px** : même ordre, **empilé**. Bande du total (les deux
blocs l'un sous l'autre, la flèche de liaison verticale), carte libre-service,
carte assisté, puis le sélecteur de motion pleine largeur, les onglets (bande
qui défile, comme aujourd'hui) et le panneau. « Côte à côte » devient « l'un
après l'autre, dans l'ordre fixe » : c'est dit ici pour que personne ne
l'invente autrement.

**E3, la fiche** : même structure. Trois ajouts :
- la ligne de période, en assisté (« Prends les affaires conclues de juin à
  août : trois mois, parce qu'un mois compte trop peu d'affaires. » / "Take
  the deals closed from June to August: three months, because one month has
  too few deals.") ;
- la phrase « petits effectifs » assistée (§18.5.1) ;
- le repli « Reprendre la marge globale » sur les deux fiches de marge
  (§18.4.6, Q4).

**Le pas à pas** (`steps-model.ts`) garde ses quatre grandes étapes :
1. **Cibles** : un écran, deux groupes (libre-service, assisté).
2. **Base** : celle du libre-service, puis celle de l'assisté (les trois
   comptes S6).
3. **Chiffres** : ceux du libre-service, puis ceux de l'assisté, puis la
   liaison (facultative, sautable). La numérotation est **par motion** :
   « Assisté · point 4 sur 15 », jamais « point 21 sur 32 ». Chaque motion a
   « Passer à l'assisté → » pour sauter.
4. **« Et si »** : les deux panneaux, puis les slides.

`resumePosition` reprend au premier chiffre `todo` le moins cher des motions
cochées, dans l'ordre canonique.

**E4, « À aller chercher »** : groupé par rôle, avec deux rôles neufs,
« Commercial » / "Sales" et « Customer Success » / "Customer success" (Q9).
Une demande par rôle couvre les deux motions, les chiffres étant listés sous
« Libre-service » et « Assisté ». Aucune valeur saisie dans le message,
inchangé.

**E5, les slides** : les vignettes se rangent sous quatre intertitres, « Les
deux moteurs » (`total`), « Libre-service », « Assisté », « Pour conclure ».
Au-dessus, « {n} points à vérifier avant de projeter » compte les deux
motions.

**E6 et E7** : la bande de reprise compte par motion (« Libre-service 11 sur
17 · assisté 10 sur 15 »). L'import est §18.3.

**Vérification visuelle** (leçon nº 1) : E1 avec les deux cases, E2 hybride
(bande, deux colonnes, sélecteur), relais seuls, fiche assistée, E4 et E5
hybride, en FR et EN, à 390 et 1 280 px. On mesure l'égalité de hauteur des
deux colonnes et l'absence de débordement.

---

### 18.8 Le deck

#### 18.8.1 Sélection et ordre (`deck.ts`)

| Slide | Présente si | Défaut « inclure » | Nature |
|---|---|---|---|
| `total` | hybride | oui | **s'additionne** |
| `peloton` | PLG coché | oui | par motion |
| `leak` | PLG, même règle qu'en §9.2 et C9 | oui | par motion |
| `whatif:<lever PLG>`, `scenario` | PLG, leviers bougés | oui | par motion |
| `slg:peloton` (les relais) | SLG coché | oui | par motion |
| `slg:leak` | SLG, même règle | oui | par motion |
| `whatif:slg.*`, `whatif:link.pql-handoff`, `slg:scenario` | SLG, leviers bougés (la liaison en hybride, Q7) | oui | par motion (la liaison avec l'assisté) |
| `visibility` | toujours | oui | une slide, deux colonnes ; titre sur l'union |
| `unit-economics` | un CAC connu ou un calculé calculable, dans une motion | oui | une slide, **en regard** en hybride |
| `mirror` | Tour relié | **non** (D13) | une slide, lignes par motion |
| `ask` | toujours | oui | une slide |
| `annex` | toujours | oui | une case, pages groupées par motion |

**Ordre en hybride** : `total` → `peloton` → `leak` → leviers PLG → `scenario`
→ `slg:peloton` → `slg:leak` → leviers SLG (la liaison en dernier) → `slg:scenario` → `visibility`
→ `unit-economics` → `mirror` → `ask` → `annex`.

En **assisté seul**, c'est le même ordre sans `total` ni les slides PLG. En
**libre-service seul**, rien ne change par rapport à la v1 (golden,
§18.3.5).

**Moins de 2 ★ connus dans une motion** : sa `leak` est omise, son funnel
reste. Si les deux motions sont aveugles, `visibility` monte juste après
`total`.

**Kicker** : inchangé, plus un marqueur de motion sur les slides d'une
motion (« · libre-service » / « · assisté »). La **pastille de données**
compte la motion de la slide, ou l'union sur les slides communes. Le
**pied** d'une slide assistée : « Flux assistés de {juin à août 2026} ·
leads de {mai à juillet} · sources : {outils} ».

#### 18.8.2 Gabarits exacts (FR / EN), copie neuve « à relire »

**`total` : « deux moteurs, un total »**

| Cas | FR | EN |
|---|---|---|
| les deux MRR connus | « Le MRR atteint **{total}** : {plg} en libre-service, {slg} en assisté. » | "MRR stands at **{total}**: {plg} self-serve, {slg} sales-assisted." |
| un MRR inconnu | « **On ne peut pas encore additionner les deux moteurs** : le MRR {du libre-service\|de l'assisté} n'est pas mesuré. » | "**We can't add the two engines up yet**: {self-serve\|sales-assisted} MRR isn't measured." |

- *Corps* : deux blocs, libre-service puis assisté (MRR, nouveau MRR du
  mois, étape nommée par son diagnostic suivie de « (slide {i}) », ou « rien
  ne freine » ou « pas assez de cibles »), la ligne de liaison entre les
  deux, puis les totaux :
  - « Nouveau MRR du mois : {a} + {b} = {c} » ;
  - « Dans 12 mois, au rythme actuel : {a} + {b} = {c} », si calculable.
- *Pied* : « MRR à fin {mois} · un client compte dans la motion qui a signé
  son contrat en cours · sources : {outils} ». La règle S8 est imprimée.
- **Titre = corps** : `{total}`, `{plg}` et `{slg}` sont les mêmes chaînes
  que la première ligne du corps (test).

**`slg:peloton` : les relais.** Clauses :
- r1 « sur 100 {leads}, {q} deviennent une opportunité » / "out of 100
  {leads}, {q} become an opportunity" ;
- r2 « sur 100 opportunités conclues, {w} sont signées » / "out of 100
  closed opportunities, {w} are signed" ;
- r3 « sur 100 nouveaux clients, {g} sont en production à {n} jours » / "out
  of 100 new customers, {g} are live within {n} days".

Première majuscule, clauses jointes par « ; ».

| Cas | FR | EN |
|---|---|---|
| `complete` | « {r1} ; {r2} ; **{r3}**. » | "{r1}; {r2}; **{r3}**." |
| `gap` | « {clauses connues}. **Entre les deux, on ne voit rien : {étapes} n'{est\|sont} pas mesurée(s).** » | "{known clauses}. **In between, we see nothing: {stages} {isn't\|aren't} measured.**" |
| `tail-break` | « {clauses connues}. **Au-delà, on ne sait pas les suivre : {étapes} n'{est\|sont} pas mesurée(s).** » | "{known clauses}. **Beyond that, we can't follow them: {stages} {isn't\|aren't} measured.**" |
| `empty` | « **On ne sait pas encore suivre 100 leads jusqu'à la mise en production.** » | "**We can't yet follow 100 leads all the way to go-live.**" |

Ce sont les accords `…One` existants, et `{leads}` suit la variante (« leads
» / « MQL »). *Pied* : « Chaque grille a sa propre base de 100 · {sources
par relais} ».

**`slg:leak`** : les gabarits `leak*` existants, avec les noms d'étape
assistés (`phrases.ts`) :
- « le passage des {leads} en opportunités » / "{leads}-to-opportunity
  conversion" ;
- « le taux de closing » / "the win rate" ;
- « le renouvellement » / "renewals" ;
- « la mise en production » / "go-live" ;
- « la part des opportunités recommandées » / "the referred opportunity
  share".

Les lignes suivent §18.5.3, et le pied les hypothèses de §18.5.3.

**`unit-economics` en hybride : « deux motions en regard »**

| Cas | FR | EN |
|---|---|---|
| les deux paybacks calculables | « Un client libre-service rembourse son coût d'acquisition en **{m1} mois**, un client assisté en **{m2} mois**. » | "A self-serve customer pays back their acquisition cost in **{m1} months**, a sales-assisted one in **{m2} months**." |
| un seul calculable | « Un client {libre-service\|assisté} rembourse son coût d'acquisition en **{m} mois**. Côté {assisté\|libre-service}, **on ne peut pas encore le dire** : {entrée} n'est pas mesurée. » | "A {self-serve\|sales-assisted} customer pays back their acquisition cost in **{m} months**. On the {sales-assisted\|self-serve} side, **we can't say yet**: {input} isn't measured." |
| aucun, les deux marges manquent (Q4) | « **On ne peut pas encore dire ce que rapporte un client** : la marge brute n'est mesurée dans aucune des deux motions. » | "**We can't yet say what a customer is worth**: gross margin isn't measured for either motion." |
| aucun, entrées différentes | « **On ne peut pas encore dire ce que rapporte un client** : il manque {entrée 1} en libre-service et {entrée 2} en assisté. » | "**We can't yet say what a customer is worth**: {input 1} is missing self-serve and {input 2} sales-assisted." |

Dans les gabarits, l'ordre est toujours libre-service puis assisté, et aucun
comparatif (§18.6.4).

- *Corps* : un tableau de cinq lignes et deux colonnes (« Libre-service » |
  « Assisté »).

  | Ligne | Libre-service | Assisté |
  |---|---|---|
  | CAC (variante écrite) | CAC PLG | CAC assisté |
  | Payback | en mois | en mois |
  | Panier | « ARPA {x} par mois » | « ACV {y} par an ({y÷12} par mois) » |
  | Clients perdus sur un an (§18.5.6) | annualisé, composé | des contrats échus |
  | LTV:CAC | | |

  Un calculé incalculable s'écrit « incalculable — manque : {entrée} ».
- *Pied* : la phrase fixe de §18.6.4 · « durée de vie plafonnée à 36 mois »
  · « marge globale reprise dans {motion} » si un repli est en jeu (Q4) ·
  `cac-variants-differ` si levé ·
  le repère de payback en **contexte**, tel qu'imprimé aujourd'hui.

**`visibility` en hybride** : le titre existant, calculé sur l'**union**
(« On documente **{n} chiffres sur {N}**… »). Corps : deux colonnes d'étapes
× pastilles, puis les introuvables triés par coût de réparation, chacun avec
sa motion (« assisté · mise en production · pas suivie · Customer Success ·
un sprint »).

**`ask`** : une slide. En hybride, **pas de pré-remplissage** de la métrique
de succès quand les deux motions nomment une étape. Le formulaire propose
les deux, sans ordre de valeur, pour ne pas choisir à la place de l'équipe
(Q13). « Ce qu'il faut d'abord mesurer » est pré-coché avec les introuvables
les moins chers des deux motions, départagés par l'ordre canonique.

**`annex`** : les pages se groupent en « Libre-service », « Assisté » et
« Liaison » (chaque motion avec sa marge, Q4). Mêmes colonnes, et la période s'écrit
en trois mois pour l'assisté.

#### 18.8.3 Notes d'orateur neuves (§9.4)

- « Pourquoi ne pas comparer les deux ? » → « Les deux motions vendent à des
  segments différents : chacune se lit contre ses cibles (slides {i} et
  {j}). »
- « Le libre-service alimente-t-il les ventes ? » → la phrase de liaison, et
  « ce n'est pas une attribution ». Si son levier a bougé : « Si le
  libre-service en passait {L'} au lieu de {L}, l'assisté signerait ~{n} de
  plus par trimestre (slide {k}). »
- « Pourquoi trois mois ? » → « Un mois compte trop peu d'affaires ; trois
  mois lissent sans mélanger deux grilles tarifaires. »
- « Et le cycle ? » → « Cycle médian de {c} jours. » Si `slg-cycle-long` est
  levé, on ajoute la réserve sur le CAC.
- « Qui compte où ? » → la règle S8.

---

### 18.9 L'exemple rempli d'un hybride

**Entreprise fictive**, et **toutes les valeurs sont fictives**, cibles
comprises. Le libre-service est **exactement le jeu §6.0** (inchangé, donc
tous ses tests tiennent). L'assisté et la liaison sont neufs.

- `referenceMonth = 2026-08` ; aujourd'hui = 24/09/2026 ; EUR.
- Fenêtres PLG : 7 j et 30 j. Fenêtres SLG : qualification 30 j, mise en
  production 90 j.
- Périodes assistées :
  - flux de **juin à août** ;
  - leads de **mai à juillet** (juillet est le mois mûr à 30 j) ;
  - nouveaux clients de **mars à mai** (mai est le mois mûr à 90 j).
- CRM : HubSpot. Facturation : Stripe.
- `lib/engine/example.ts` gagne `exampleSlgMetrics(words)` et
  `EXAMPLE_SLG_TARGETS`. La vue « exemple » montre l'exemple **dans les
  motions cochées** au réglage : libre-service seul (§6.0), assisté seul, ou
  les deux.

#### 18.9.1 Valeurs saisies

| id | Statut | Valeur saisie |
|---|---|---|
| `slg.acq.lead-to-opp` | measured · HubSpot · variante `mql` | 72 ÷ 480 MQL (mai à juillet) = 15 % |
| `slg.acq.cac` | measured · finance (une personne) · `fully-loaded` | 342 000 € ÷ 18 nouveaux clients (juin à août) = 19 000 € |
| `slg.acq.cycle` | measured · HubSpot | 64 jours, médiane |
| `slg.act.live-event` | measured | « premier rapport partagé avec l'équipe du client » |
| `slg.act.go-live` | **missing** · not-tracked · un sprint · customer-success | — |
| `slg.act.time-to-live` | **todo** | — |
| `slg.ret.renewal` | measured · HubSpot · `annual` | 22 ÷ 25 contrats échus (juin à août) = 88 % |
| `slg.ret.nrr` | estimated · ancien chiffre | 104 à 108 % |
| `slg.ret.loss-cause` | measured · intuition | « départ du sponsor chez le client » |
| `slg.ref.referred-share` | measured · HubSpot · `customers-and-partners` | 26 ÷ 130 opportunités créées (juin à août) = 20 % |
| `slg.ref.referenceable` | **requested** · marketing · il y a 3 j | — |
| `slg.rev.win-rate` | measured · HubSpot | 18 ÷ 75 opportunités conclues (juin à août) = 24 % |
| `slg.rev.acv` | measured · HubSpot | 432 000 € ÷ 18 contrats = 24 000 € |
| `slg.rev.arpa` | measured · Stripe | 180 000 € de MRR ÷ 100 clients assistés (fin août) = 1 800 € |
| `rev.gross-margin` (libre-service) | **missing** · no-access (déjà dans §6.0) | — |
| `slg.rev.gross-margin` | **missing** · no-access · une réunion · finance | — |
| `link.pql-handoff` | measured · HubSpot · « espace avec 3 membres actifs » | 31 ÷ 130 opportunités créées = 24 % (23,8) |

- Base assistée : `slgOppsCreated` = 130, `slgDealsWon` = 18,
  `slgCustomers` = 100.
- **Cibles de l'équipe fictive** : passage lead → opportunité 18 %, taux de
  closing 32 %, renouvellement 92 %. Le libre-service garde §6.0 :
  activation 20 %, churn 2 %.

#### 18.9.2 Couverture

| Périmètre | Trouvés | Approximatifs | Demandés / à faire | Introuvables | Total |
|---|---|---|---|---|---|
| Libre-service (17) | 11 | 2 | 1 | 3 | 17 |
| Assisté (15, sa marge comprise) | 10 | 1 | 2 (1 demandé, 1 à faire) | 2 (mise en production, marge de l'assisté) | 15 |
| Union (32, liaison exclue) | 21 | 3 | 3 | 5 | 32 |

La slide `visibility` compte « documentés » = trouvés + approximatifs : « On
documente **24 chiffres sur 32**. Les 8 qui manquent se réparent entre une
réunion et un sprint. »

#### 18.9.3 Les relais assistés

- Relais 1 : 72 ÷ 480 = 15 % ⇒ **15 sur 100 MQL**. Mesuré, HubSpot, mai à
  juillet. Ligne amont : 480 ÷ 3 = 160 ⇒ « ~160 MQL par mois ».
- Relais 2 : 18 ÷ 75 = 24 % ⇒ **24 sur 100 opportunités conclues**. Petits
  effectifs : 75 < 100, donc « un de plus ou de moins bouge le taux de ~1,3
  point » (100 ÷ 75 = 1,33).
- Relais 3 : inconnu (introuvable) ⇒ `chain = tail-break`.
- Titre : « Sur 100 MQL, 15 deviennent une opportunité ; sur 100 opportunités
  conclues, 24 sont signées. **Au-delà, on ne sait pas les suivre : la mise
  en production n'est pas mesurée.** »
- Le renouvellement porte sur 25 contrats, donc « un contrat de plus ou de
  moins bouge le taux de 4 points » (100 ÷ 25). La cible (92 %) est
  exactement un contrat au-dessus de la valeur (88 %), et la fiche le dit.

#### 18.9.4 Le diagnostic assisté, calculé à la main

*W* = 18 (mesuré), ACV ÷ 12 = 2 000 €, ARPA assisté = 1 800 €, *D* = 25.

| Candidat | Valeur | Cible | Position | Impact exact (classement) |
|---|---|---|---|---|
| passage lead → opp. | 15 % | 18 % | below | 18 × (18/15 − 1) = 3,6 clients / 3 mois × 2 000 € ÷ 3 = **2 400 €/mois** |
| taux de closing | 24 % | 32 % | below | 18 × (32/24 − 1) = 6 clients / 3 mois × 2 000 € ÷ 3 = **4 000 €/mois** |
| renouvellement | 88 % | 92 % | below | 25 × 4 % = 1 contrat / 3 mois × 1 800 € ÷ 3 = **600 €/mois** |
| mise en production | inconnu | — | unknown | — |
| part recommandée | 20 % | — | no-comparator | — |

- Trois candidats comparables, donc pas `not-enough`, et trois `below`. La
  base est `mrr`.
- Classement : 4 000 > 2 400 > 600. **`clear`**, parce que 4 000 > 2 400 ×
  1,25 = 3 000. Nommé : **Revenue (taux de closing)**. `belowUnpriced = []`,
  `blind = ["slg.act.go-live"]`.
- **Borne du test** : avec une cible de closing à 30 %, on a 18 × 0,25 × 2 000
  ÷ 3 = 3 000, et 3 000 > 2 400 × 1,25 = 3 000 est **faux**. L'état est
  `shared` : le taux de closing et le passage lead → opportunité (2 400 ≥
  3 000 ÷ 1,25). Le renouvellement (600) sort du groupe. La tolérance de
  `clearlyAbove` absorbe le résidu flottant de 18/15 − 1.
- **Chaîne affichée** (slide `slg:leak`) :
  - « Aujourd'hui · 24 % de closing → 18 nouveaux clients sur 3 mois »
  - « Si · le taux de closing atteint 32 % (cible de l'équipe) »
  - « Alors · 18 × 32/24 = 24 (+6) sur 3 mois »
  - « × ACV ÷ 12 · 6 × 2 000 € = 12 000 € de MRR nouveau par trimestre »
  - « soit ~4 000 € par mois »
  - « Soit ~48 000 € de MRR de plus au bout d'un an (contrats annuels :
    aucun ne se renouvelle dans l'année). » (4 000 × 12)
- **Titre** : « Ramener le taux de closing à 32 % vaudrait **~4 000 € de MRR
  nouveau** chaque mois. »
- **À côté** (les autres candidats), chaque montant venant de sa propre chaîne
  affichée :
  - passage : 18 × 18/15 = 21,6 ⇒ 22 (+4), puis 4 × 2 000 € = 8 000 € par
    trimestre, soit ~2 700 € par mois ;
  - renouvellement : 25 × (92 % − 88 %) = 1 contrat, puis 1 × 1 800 € =
    1 800 € par trimestre, soit ~600 € par mois.

  Comme en PLG (560 € exact contre ~600 € affiché), l'écart entre la chaîne
  arrondie et l'impact exact est normal : le classement lit l'exact.
- **Sous le diagnostic** : « La mise en production n'est pas mesurée : le vrai
  frein peut s'y cacher. »

**Le libre-service**, inchangé (§6.6) : **Activation**, ~600 € de MRR
nouveau par mois, `clear` contre les ~240 € du churn, et le J30 en `blind`.
Les deux fuites sont affichées chacune dans sa colonne. **Rien ne dit
qu'« ~4 000 € » pèse plus que « ~600 € »** : ce sont deux moteurs, et chacun
se lit contre ses cibles.

#### 18.9.5 Le total

- MRR : 48 000 € + 180 000 € = **228 000 €**, exact (deux montants saisis).
  Titre : « Le MRR atteint **228 000 €** : 48 000 € en libre-service,
  180 000 € en assisté. »
- Nouveau MRR du mois :
  - libre-service : 42 × 120 € = 5 040 €, soit « ~5 000 € » ;
  - assisté : 18 ÷ 3 × 2 000 € = 12 000 €, soit « ~12 000 € » ;
  - total affiché : « ~5 000 € + ~12 000 € = ~17 000 € » (le réel, 17 040 €,
    s'arrondit aussi à 17 000 €).
- MRR dans 12 mois, au rythme actuel :
  - libre-service, par `scenario.ts` : q = 1 − 2,5 % − 1,0256 % + 3,0769 % =
    99,5513 % par mois, puis 48 000 × q¹² + 5 040 × (1 − q¹²) ÷ (1 − q) =
    45 478 + 59 009 = 104 487 € ;
  - assisté : 180 000 × [1,04 ; 1,08] + 12 × 12 000 = [331 200 ; 338 400] € ;
  - unité commune (deux chiffres significatifs de la plus petite partie) :
    10 000 €, d'où « ~100 000 € + ~330 000 € à ~340 000 € = ~430 000 € à
    ~440 000 € ».
- Liaison : « 31 des 130 opportunités assistées viennent de comptes du
  libre-service (juin à août). »

#### 18.9.6 Unit economics en regard

| Ligne | Libre-service | Assisté |
|---|---|---|
| CAC | 500 € (média seul) | 19 000 € (tout chargé) |
| Payback | incalculable — manque : marge brute | incalculable — manque : marge brute de l'assisté |
| Panier | ARPA 120 € par mois | ACV 24 000 € par an (2 000 € par mois) |
| Clients perdus sur un an | ~26 % (2,5 % par mois, composé : 1 − 0,975¹² = 0,262) | 12 % des contrats échus (contrats annuels) |
| LTV:CAC | incalculable — manque : marge brute | incalculable — manque : marge brute de l'assisté |

- Titre : les deux marges manquent ⇒ « **On ne peut pas encore dire ce que
  rapporte un client** : la marge brute n'est mesurée dans aucune des deux
  motions. » (Q4 : deux marges, deux entrées manquantes.)
- Pied : `cac-variants-differ` (« Les deux CAC ne comptent pas les mêmes
  dépenses : média seul en libre-service, tout chargé en assisté. »).
- **Cas de test**, pas de l'exemple affiché : avec une marge de 75 % (et une
  durée de vie de 12 ÷ 0,12 = 100 mois, plafonnée à 36) :
  - PLG : payback = 500 ÷ 90 = 5,6 mois ;
  - SLG : payback = 19 000 ÷ 1 500 = 12,7 ⇒ « 13 mois » ; LTV = 1 500 × 36 =
    54 000 € ; LTV:CAC = 2,8.
  - Titre : « Un client libre-service rembourse son coût d'acquisition en
    **5,6 mois**, un client assisté en **13 mois**. »
- **Cas de test de Q4** : la même marge de 75 % au libre-service, mais **60 %**
  à l'assisté (sa mise en service comprise) :
  - SLG : payback = 19 000 ÷ 1 200 = 15,8 ⇒ « 16 mois » ; LTV = 1 200 × 36 =
    43 200 € ; LTV:CAC = 2,3 ;
  - PLG inchangé (5,6 mois) : aucune marge d'une motion ne bouge l'autre.
  - Même cas, l'assisté en **repli sur la marge globale** de 75 % : payback
    « ~13 mois », approximatif, et le pied dit « marge globale reprise dans
    l'assisté ».

#### 18.9.7 Deck par défaut de l'exemple

`total` → `peloton` → `leak` (Activation) → `slg:peloton` → `slg:leak` (taux
de closing) → `visibility` → `unit-economics` → `ask` → `annex` (sur
plusieurs pages). `mirror` est absent (pas de Tour relié), et il n'y a
aucune slide « Et si » : aucun levier n'a bougé.

---

### 18.10 Plan de tests

Chaque test porte son commentaire de non-vacuité (convention 5).

#### 18.10.1 Unitaires (`src/lib/engine/__tests__/`, `src/content/__tests__/`)

- **`catalog-shape`**
  - 15 ids `slg.*` ; au plus 3 `scope: "slg"` par étape hors marge (2 en
    Referral) ; un ★ par étape.
  - Aucun `shared` (Q4) : `rev.gross-margin` est `plg`,
    `slg.rev.gross-margin` est `slg`, `link.pql-handoff` est le seul `link`.
  - Chaque `glossary` existe (28 termes, avec les quatre d'A7.3.e).
  - Les ids de `engine-catalog.ts` sont les ids de la forme.
  - Six ponts SLG épinglés.
- **`shapesOf`** : les quatre combinaisons de motions, avec leurs effectifs
  (17 / 15 / 33 avec la liaison / refus sans motion).
- **`migrate`, `io`, `storage`** : §18.3.5 en entier, golden v1 compris.
- **`validate`** :
  - motions et type ;
  - fenêtres SLG ;
  - **NRR à 106 % acceptée** en `rate`, en estimation et en comptes, et un
    renouvellement à 106 % refusé (borné) ;
  - ids SLG et liaison acceptés avec une motion décochée.
- **`shared-counts`** : les trois comptes SLG se propagent dans leurs
  entrées, et un compte qui rendrait une entrée impossible la laisse telle
  quelle (règle existante).
- **`cohort`** : périodes de trois mois ; mois mûrs 30 j ⇒ juillet et 90 j
  ⇒ mai au 24/09/2026 ; affichage « mars à mai 2026 » / "March to May 2026".
- **`relays`**
  - l'exemple (15, 24, `null`, `tail-break`, ~160 MQL par mois) ;
  - les quatre `chain` ;
  - jamais 0 pour un inconnu ;
  - `leadNoun` suit la variante ;
  - la phrase des petits effectifs (p = 1,3 pour 75, 4 pour 25).
- **`diagnose` (SLG)**
  - l'exemple : `clear`, taux de closing, 4 000 contre 2 400 et 600 ;
  - la borne : 30 % donne `shared` (closing et passage), sans le
    renouvellement ;
  - `go-live` et `referred-share` jamais chiffrés ;
  - aucun repère ne désigne ;
  - l'équivalence € ↔ écart relatif sur une grille pour les deux flux.
- **Indépendance des motions**
  - Tirer au hasard (graine fixe) 1 000 états SLG, puis vérifier que
    `diagnose(state, "plg")`, le peloton et les unit economics PLG sont
    **identiques** à ceux de l'état sans SLG. La réciproque vaut pour le
    PLG.
  - Non-vacuité : un `diagnose` qui lirait `slg.rev.win-rate` dans les
    candidats PLG fait tomber le test.
- **`slg-impact`**
  - La chaîne de l'exemple, au caractère près, FR et EN.
  - **Invariant d'affichage** : chaque ligne se recalcule depuis les nombres
    affichés de la précédente, `{amount}` = `{quarter}` ÷ 3 arrondi, et
    `annual` = `{amount}` × 12.
  - Moins d'un client ⇒ pas de montant.
  - Titre et corps de `slg:leak` contiennent la même chaîne formatée.
- **`slg-scenario`, levier de la liaison** (Q7)
  - l'exemple 31 → 40 : `O'` = 139, `W'` = 19,25 (+1,25), ~830 € par mois,
    ~10 000 € en un an ;
  - le peloton, le diagnostic, les unit economics et le MRR du libre-service
    sont **identiques** avant et après le curseur (rien n'est retiré au
    libre-service) ;
  - pas de curseur si `L` ou `O` est inconnu, ni hors hybride ;
  - la liaison n'entre jamais dans les candidats, même avec une cible
    d'équipe ;
  - `whatIf["link.pql-handoff"]` refuse un nombre négatif ou décimal.
- **`total`**
  - 228 000 € exact ;
  - une partie inconnue ⇒ `uncomputable`, qui nomme la partie, **jamais**
    la partie connue présentée comme total ;
  - somme affichée = somme des parties affichées, sur une grille de
    montants (dont l'exemple : 100 000 + [330 000 ; 340 000]).
- **`unit-economics` (SLG)**
  - durée de vie `annual` / `monthly`, plafond 36, r = 100 ;
  - marge inconnue ⇒ trois incalculables, **pas de repli sur le revenu** ni
    sur la marge du libre-service ;
  - le cas « marge 75 % » de §18.9.6, et celui de Q4 (60 % à l'assisté,
    repli sur la marge globale) ;
  - clients perdus sur un an : ~26 % (PLG) et 12 % (SLG).
- **`sanity`** : chaque contrôle SLG a un cas qui déclenche et un qui ne
  déclenche pas ; `cac-variants-differ` seulement en hybride.
- **`findings`** : `motion` posé ; `small-sample` ; pas de constat de
  liaison ; `go-live` avec sa définition introuvable donne un seul
  `chain-break`.
- **`bridge`** : une ligne par (question, motion) en hybride ; les
  compteurs.
- **`deck`**
  - Les règles de §18.8.1 : présence, ordre des trois configurations,
    `visibility` qui monte si les deux motions sont aveugles.
  - Les ids PLG inchangés en libre-service seul.
  - Chaque gabarit neuf a un cas qui le déclenche et un qui ne le déclenche
    pas.
  - Titre = corps pour `total` et `slg:leak`.
  - **Ordre fixe** : échanger les valeurs des deux motions ne change ni
    l'ordre des slides ni celui des colonnes.
- **Contenu**
  - Garde « aucun comparatif » (§18.6.4) sur la copie hybride.
  - Les pièges « passage à l'assisté » (§18.4.6, Q3) : présents sur les
    cinq fiches en hybride, absents en libre-service seul.
  - Repère anti-dérive : « 110 » et « 130 » (NRR) dans `nrr-grr`, FR et EN.
  - Placeholders présents dans les deux langues.
  - Glyphes (§10.4) sur tous les gabarits neufs.
  - U+00A0 en français (`copy-typography.test.ts`).
  - Chaque rôle et chaque outil neuf a son libellé FR et EN (`satisfies
    Record<…>`).

#### 18.10.2 Gardes statiques

`engine-boundary.test.ts` couvre les nouveaux modules sans changement de
règle : aucun import de `lib/audit` ni de `content/audit-catalog` (décision
6). Une recherche de source vérifie que « b2b-assiste » n'apparaît nulle
part sous `lib/engine`.

#### 18.10.3 E2E (Playwright, build de production, par l'aperçu propriétaire)

- **`engine-hybrid-journey.spec.ts`**, paramétré **FR/EN × 1 280/390** :
  1. réglage avec les deux motions ;
  2. saisie de l'exemple §18.9 (PLG par l'exemple §6.0, SLG par les fiches) ;
  3. titre du total exact ;
  4. deux diagnostics exacts (Activation, taux de closing) ;
  5. couverture par motion ;
  6. **rechargement** : tout est là ;
  7. décocher l'assisté (le tableau n'a plus que le PLG, et le texte
     d'avertissement s'affiche), puis recocher (les 10 trouvés reviennent) ;
  8. export, `localStorage` vidé, import : fractions identiques.
- **`engine-canary.spec.ts`**, étendu : les canaris sont semés **aussi** dans
  la définition de mise en production, la cause de non-renouvellement, la
  `definitionNote` de la liaison, un compte à 9 chiffres dans
  `slg.rev.win-rate` et une note SLG. On vérifie qu'ils sont dans le `.json`
  et le texte copié, qu'aucune requête ne porte un canari, et qu'il n'y a
  aucune requête non-`GET` de la session, **réglage des motions compris**.
- **`engine-migration.spec.ts`** — *écrite dès S0 (2026-09-30), avec le
  chemin qu'elle vérifie*
  - Semer `tdg.engine.v1` (l'exemple §6.0), ouvrir : même titre, même
    couverture « 11 sur 17 », mêmes slides. `tdg.engine.v2` est écrit au
    premier enregistrement, et `tdg.engine.v1` est présent jusqu'à l'export
    puis absent.
  - Importer un fichier v1 affiche le message de mise à jour.
- **`engine-setup.spec.ts`** : impossible de décocher les deux cases
  (clavier compris) ; les réglages SLG n'apparaissent que cochés ; « App
  grand public » et « Place de marché » sont désactivées, avec leur note.
- **`engine-deck.spec.ts`**, étendu :
  - hybride : pages du PDF = slides incluses ; la slide `total` est
    présente ;
  - `unit-economics` a deux colonnes, dans l'ordre libre-service puis
    assisté ;
  - polices embarquées : les trois familles seulement ;
  - assisté seul : ni `total` ni slides PLG.
- **`engine-mobile.spec.ts`**, à créer (le §13.3 le prévoyait, il n'a jamais
  existé : les mesures de largeur du moteur sont réparties dans
  `engine-board-tabs`, `engine-collect`, `engine-deck`, `engine-whatif`…,
  constaté le 2026-09-30) : `scrollWidth === clientWidth` sur E1
  (deux motions dépliées), E2 hybride, les relais, la fiche SLG, E4 et E5
  hybrides, à 320 (mesure seulement), 360, 390 et 430, FR et EN. Aucun
  libellé de relais hors de sa carte ; les deux colonnes ont la même hauteur
  à 1 280.
- **Ajouts** :
  - `accessibility.spec.ts` : axe sur E2 hybride, avec un diagnostic
    assisté visible (surface rouge) ;
  - `keyboard.spec.ts` : cocher l'assisté, puis renseigner
    `slg.rev.win-rate` sans souris ;
  - `analytics.spec.ts` : le vocabulaire neuf, si Q14 est tranchée oui.

#### 18.10.4 Non-vacuité à mesurer à la livraison

| Sabotage | Doit faire tomber | Ne doit pas faire tomber |
|---|---|---|
| la migration met `slg: true` | golden v1, migration e2e | diagnose SLG |
| `validate` garde « > 100 refusé » pour tout pourcentage | validate (NRR 106 %) | golden |
| `total` rend la partie connue quand l'autre manque | total (unitaire), hybrid-journey | diagnose |
| `diagnose(plg)` lit un candidat SLG | indépendance | relays |
| le deck trie les colonnes par payback | ordre fixe (deck) | unit-economics |
| décocher supprime les entrées SLG | hybrid-journey (recocher) | migration |
| un `fetch` de l'état au changement de motion | canary (non-GET) | hybrid-journey |
| le levier de la liaison retire du MRR au libre-service (Q7) | slg-scenario (liaison), total | diagnose SLG |
| la liaison entre dans les candidats de l'assisté (Q7) | slg-scenario (liaison), diagnose SLG | relays |

---

### 18.11 Découpage en PR

Le lot A7.3.c. Branche d'intégration `feat/engine-slg` : chaque PR vise
cette branche (la CI tourne quelle que soit la base), et **un seul merge sur
`main`**, drapeau fermé, puis la vérification `git show --stat`
(convention 1). A7 dit « une PR par item » : c'est cette PR d'intégration.
*En pratique (2026-09-30)* : le lot se construit dans la session d'Antoine,
sur sa branche de travail, qui tient lieu de branche d'intégration. Chaque
étape y est un commit (S0, S1…), et **une seule PR brouillon** vers `main`
porte le tout jusqu'au merge.

**S0 est livré le 2026-09-30** (le golden v1 d'abord, `37e9dfe`, puis le
contrat). Ce que S0 a laissé aux étapes suivantes, pour que le libre-service
ne bouge pas d'un caractère en attendant (golden vert) :
- **S1** : `CandidateId` reste celui du libre-service (`SlgCandidateId` est
  déclaré à côté) ; les types dérivés neufs (`RelayColumn`, `Relays`,
  `SlgUnitEconomics`, `MotionDerived`, `TotalView`) et les ids de contrôles
  et de constats neufs arrivent avec leur calcul ; `UnitInputId` aussi.
- **S2** : `ENGINE_CATALOG` et `ENGINE_DERIVED_CATALOG` restent typés sur le
  libre-service jusqu'à la prose de l'assisté ; le test des libellés partagés
  ne couvre les trois comptes neufs qu'à ce moment-là.
- **S3** : l'écran de réglage crée un moteur libre-service
  (`SETUP_V2_DEFAULTS`), et le tableau dit « libre-service » quoi qu'il arrive.
- **S4** : `DeckView` refuse `total` et `slg:*`, que `deck.ts` ne produit pas
  encore.
- `METRIC_SHAPES` reste le catalogue du libre-service, et chaque module le
  lit comme avant ; un module qui apprend les motions lit
  `shapesOf(motions)`.

**S1 est livré le 2026-10-01** : `relays.ts`, `slg-impact.ts`,
`slg-scenario.ts` (levier de la liaison compris), `total.ts`, et le
diagnostic, les unit economics, les contrôles, les constats, le miroir, la
couverture et la demande copiée qui apprennent leur motion ; l'exemple
hybride §18.9 (`exampleEngine(words, motions)`). Tous les chiffres de §18.9
sortent exacts. Deux écarts à la forme de §18.2.1, voulus :
- `Diagnosis` est générique sur ses candidats (`Diagnosis<C>`, le
  libre-service par défaut) plutôt qu'un seul type portant les onze : ses
  positions ne portent que ceux de sa motion, et le compilateur refuse
  qu'on lise un candidat de l'autre ;
- `EngineDerived` garde `peloton`, `diagnosis` et `unit` **du libre-service**
  en plus de `motions` et `total`, les mêmes objets que l'entrée `plg` de
  `motions` : chaque écran et le deck v1 les lisent, et le golden v1 aussi.

Ce que S1 laisse :
- **S2** : la prose des 15 chiffres et de la liaison, puis le placeholder
  `{period}` de `catalogueValues` (« juin à août 2026 ») et son équivalent
  statique ; la copie neuve de S1 (sujets, entrées manquantes, chaîne
  `slgChain`, constats et contrôles assistés, mots de l'exemple, intertitres
  de la demande) est « à relire » ; les hypothèses de l'« Et si » assisté
  (`SlgScenarioAssumption`) n'ont pas encore de copie ; les pièges hybrides
  des cinq fiches du libre-service (§18.4.6).
- **S3** : les écrans lisent `motions` et `total` (bande du total par
  `total.formatSum`, deux colonnes, relais) ; le curseur de la liaison est
  `unit: "count"` (`scenario-view.ts` ne sait encore formater que pourcent
  et monnaie) ; `Diagnosis.tsx`, `StageTabs`, `MetricSheet` sont typés sur le
  libre-service ; les deux phrases fixes (le cycle, « deux motions, deux
  segments ») ; la vue exemple dans les motions cochées.
- **S4** : le deck lit `motions` (`slg:peloton` sur les relais, `slg:leak`
  par `slgWhatIf` et `slgChainTemplate`, `slg:scenario` et les `whatif:`
  assistés par `slg-scenario.ts`, `total`, la slide d'unit economics en
  regard avec `lostInAYear` et `marginIsCompanyWide`) ; ensuite seulement,
  `EngineDerived` perd ses trois champs du libre-service. La note d'orateur
  de `slg-cycle-long` (§18.8.3) s'écrit à part : le message du contrôle
  tutoie (« Ton cycle médian »), il est fait pour l'écran « à vérifier ».

**S2 est livré le 2026-10-01** : la prose des quinze chiffres de l'assisté,
de la liaison et des trois calculés (`engine-catalog.ts`, les deux
dictionnaires typés sur **tous** les identifiants : une fiche sans prose ne
compile plus) ; le placeholder `{period}`, qui porte sa préposition
(« de mai à juillet 2026 », « d'août à octobre 2026 », « en août 2026 »),
rempli par `catalogueValues`, par la fiche (`catalogFill`) et, en crochets,
par la page statique ; la copie de §18.1, §18.6 à §18.8 (réglage, réglages
après coup, `hybrid`, `total`, `relays`, titres et pieds de slides, notes
d'orateur, fiche, pas à pas, « Et si » assisté et ses hypothèses, reprise,
import) et la sixième question de la FAQ, tout « à relire » ; les pièges
hybrides des cinq fiches du libre-service, et `phrases.ts#hybridTrapOf` qui
ne les rend qu'en hybride. Un test balaie `hybrid.*`, `total.*` et les titres
des deux motions à la recherche d'un comparatif (seule la négation de la
phrase fixe passe), et un autre vérifie l'ordre libre-service puis assisté.
Trois formulations s'écartent du texte de §18.8.2 :
- les titres `gap` et `tail-break` des relais disent « on ne mesure pas
  {étapes} » : « le taux de closing » et « la mise en production » n'ont pas
  le même genre, et « n'est pas mesuré(e) » devrait s'accorder avec chacun ;
- le cas « un seul payback calculable » dit « il manque {entrée} », comme la
  slide d'unit economics du libre-service, plutôt que « {entrée} n'est pas
  mesurée » ;
- et il a **deux gabarits** (`unitEconomicsOneSidePlg`, `…Slg`) au lieu d'un
  `{libre-service|assisté}` : quand seul l'assisté est calculable, le titre
  nomme quand même le libre-service d'abord (« Côté libre-service, on ne peut
  pas encore le dire… Un client assisté rembourse… »). Le tableau de §18.8.2
  et la règle 1 de §18.6.4 se contredisaient ; c'est la règle qui gagne.

Ce que S2 laisse :
- **S3** pose la copie sur les écrans : le réglage (`setup.companyType`,
  `types`, `motions*`, les deux fenêtres, `slgPeriods` ; `setup.models` et
  `modelSoon` partent alors), `board.eyebrowNoCohort`, `hybrid.*`, la bande
  du total (`total.*`), les relais (`relays.*`), la fiche
  (`sheet.periodSlg*`, `companyWide*`, `hybridTrap` par `hybridTrapOf`),
  le pas à pas (`steps.*Motion`, `baseTitleSlg`…), `settings.motion*` et les
  deux remises à zéro, le panneau assisté (`scenario.linkSlider`,
  `totalIn12*`, `slgAssumption`…), `resume.bandMotions*`,
  `io.importPreviewMotions` ; et sur E0, les deux sous-sections
  (`page.catalogueTitlePlg`/`Slg`…), en réécrivant ce qui compte encore
  dix-sept chiffres (`page.promise`, `noscript`, `catalogueToggle`,
  `durationIntro`, `catalogueTitle`, `catalogueIntro`).
- **S4** construit les titres neufs : `sentences-guard.test.ts` les tient
  dans `AWAITING_DECK`, une liste que S4 vide (le test tombe dès qu'un titre
  de la liste est produit) ; plus `slide.kickerMotion`, `footerSlg`, les
  lignes de la slide en regard, `relays.clause*`, les notes neuves et les
  intertitres `deck.group*`.

| PR | Contenu | Fichiers possédés | Dépend de | Jours-agent |
|---|---|---|---|---|
| **S0 — Contrats et migration** | `types.ts`, `catalog-shape.ts` (formes SLG, `scope`, `span`, `shapesOf`), `migrate.ts`, `validate.ts` (règles §18.3.3, dont le correctif > 100), `io.ts`, `storage.ts`, **golden v1 figé avant toute ligne**, `shared-counts.ts`, `cohort.ts` (trois mois), clés de copie vides | `lib/engine/{types,catalog-shape,migrate,validate,io,storage,shared-counts,cohort}.ts` + tests | — | 1,5 |
| **S1 — Moteur pur SLG** | `relays`, `diagnose` (motion), `slg-impact`, `unit-economics` (SLG), `total`, `sanity`, `findings`, `bridge`, `slg-scenario`, `request` (rôles), `derive`, `phrases`, `example.ts` (hybride) | `lib/engine/*.ts` hors S0 et `deck.ts` | S0 | 2,5 |
| **S2 — Contenu** | prose des 15 chiffres et de la liaison, copie `setup.*` / `hybrid.*` / `total.*` / `relays.*` / slides / notes / FAQ, FR et EN, « à relire » ; les tests de contenu | `content/engine-*.ts`, `content/__tests__/engine-*` | S0 | 1,5 |
| **S3 — Écrans** | `Setup.tsx` (type, motions), `Board.tsx` (bande du total, deux colonnes, sélecteur), `Relays.tsx`, `TotalBand.tsx`, `StageTabs`/`steps-model` (par motion), `MetricSheet` (période, petits effectifs, repli sur la marge globale), `CollectHub` (rôles), `ExampleView` | `aarrr-funnel-template/_engine/**` hors `deck/` | S0 ; S1 par interfaces | 2,5 |
| **S4 — Deck** | `deck.ts` (sélection, ordre, gabarits), `SlideTotal.tsx`, `SlideRelays.tsx`, `SlideUnitEconomics.tsx` (en regard), `SlideAnnex` (groupes), `copy-text.ts` | `lib/engine/deck.ts`, `_engine/deck/**` | S1 | 1,5 |
| **A7.3.e — Les quatre termes du glossaire** (Q8) | « taux de closing », « cycle de vente », « ACV », « conversion lead → opportunité » : pages FR et EN, FAQ, JSON-LD, sitemap, maillage, sur le modèle de la vague 2.2. **Hors de la branche d'intégration** : une PR sur `main`, dans une session à part (`CHANTIERS.md` A7.3.e, avec son prompt) | `content/glossary-*.ts` et leurs tests | — (en parallèle de S0) ; **S2 attend ses slugs** | 1,5 |
| **S5 — Intégration** | e2e §18.10.3, captures relues FR/EN × 390/1 280, analytics (Q14), `legal.ts` si Q14, entrée de `JOURNAL.md`, mise à jour d'ENGINE.md (état) | `e2e/engine-*`, `e2e/helpers.ts`, `lib/analytics/*` | S1-S4 | 1 |

Total ≈ **12 jours-agent** avec A7.3.e (Q8), et un peu plus avec la
deuxième marge (Q4) et le levier de la liaison (Q7), absorbés par S0, S1, S2
et S4. Chemin critique S0 → S1 → S4 → S5 ≈ **6 jours**, avec S2 et S3 en
parallèle, et A7.3.e en parallèle de S0. Ensuite viennent **A7.3.d** (le bon à
tirer de la copie neuve, construit depuis `grep -rn "TODO: à relire" src/`)
et, hors code, la réécriture de `marketing/kit.md:105` et de la ligne de
risque de `marketing/campaigns/README.md` §8. **Toute évolution des types
passe par S0.**

---

### 18.12 Questions produit — tranchées le 2026-09-30 (C25)

Posées à Antoine le 2026-09-30 (`CHANTIERS.md` C25) : Q3, Q1 et Q2 une par
une, avec l'exemple §18.9 ; Q4 à Q16 en bloc, Q10 et Q12 sur l'écran actuel
du moteur et un croquis de l'écran hybride. Treize recos retenues, trois
reprises (Q4, Q7, Q8), et une précision ajoutée à Q3. « Aujourd'hui » est ce
que le jet supposait ; « Si on se trompe » dit ce qui casse ; « Tranché » est
la réponse, et la section corrigée quand elle change la spécification.

| # | Question | Aujourd'hui | Reco | Tranché |
|---|---|---|---|---|
| Q1 | **L'activation assistée est-elle la mise en production ?** (§18.4.1) | Activation = le client obtient ce qu'il a acheté, après la signature, et non le premier rendez-vous qualifié. Le funnel dessiné suit la chronologie (acquis → signé → en production → renouvelé), les onglets gardent l'ordre AARRR | **Oui** : le passage lead → opportunité couvre déjà la qualification, et l'après-vente est l'angle mort qui explique les non-renouvellements. *Si on se trompe* : les équipes qui appellent « activation » le premier rendez-vous ne trouvent pas leur chiffre. Corriger après coup change un ★, un candidat, un relais et les fichiers remplis | **2026-09-30 : oui, la reco.** La spécification ne change pas |
| Q2 | **Tout l'assisté se lit-il sur trois mois glissants, fixes ?** (S4) | Flux de juin à août pour août ; cohortes de trois mois qui finissent au mois mûr de leur fenêtre ; pas de réglage | **Oui en v1**. *Si on se trompe* : 40 affaires par mois voudraient le mois, 3 par mois voudraient six mois. Rendre la durée réglable plus tard ne migre rien (`span` est dans la forme, pas dans le fichier) | **2026-09-30 : oui, la reco.** Montré sur l'exemple : au mois (~6 signées sur 25), une seule signature de plus fait passer l'étape nommée du taux de closing au passage lead → opportunité ; sur trois mois, elle ne la change pas. La spécification ne change pas |
| Q3 | **Un client compte-t-il dans la motion qui a signé son contrat en cours ?** (S8, la plus lourde) | Oui, et la règle est imprimée au pied de la slide `total`. Un compte du libre-service signé par un commercial compte en assisté, et sort de la conversion payante et de l'ARPA du libre-service | **Oui** : c'est la seule règle qui empêche de compter deux fois le MRR et les nouveaux clients. *Si on se trompe* : avec « la motion d'origine », un PQL signé par un commercial ne serait jamais gagné pour l'assisté ; sans règle, le MRR total est faux sans que rien ne le montre | **2026-09-30 : oui, la reco**, avec un ajout de la séance : un passage du libre-service à l'assisté **n'est pas un départ du libre-service** (ni perdu au churn, ni rétrogradation). Montré sur l'exemple : 5 comptes à 2 000 € par mois comptés des deux côtés font un total de 228 000 € pour 218 000 € réels, et 5 passages comptés comme départs ajoutent ~0,4 point au churn. S8 et §18.4.6 corrigés le même jour |
| Q4 | **Une seule marge brute, commune aux deux motions ?** | `rev.gross-margin` est `shared`, avec un piège : une marge unique flatte l'assisté s'il comprend de la mise en service | **Oui en v1**, la finance la donne rarement par motion. *Si on se trompe* : le payback assisté paraît trop court. Deux marges plus tard = un id de plus, sans migration | **2026-09-30 : non, une marge par motion.** Antoine : « ça change tout, il faut qu'on ait la différence ». L'assisté gagne `slg.rev.gross-margin` (15 chiffres propres, union 32) ; `rev.gross-margin` reste au libre-service, **sans migration**. **Repli sur la marge globale**, en hybride seulement : « Reprendre la marge globale » l'enregistre en estimation (base `company-wide`), comptée approximative, jamais trouvée, sur les deux fiches de marge. Montré sur l'exemple : payback assisté de 13 mois à 75 %, de 16 à 60 %. Corrigés le même jour : §18.0, §18.2, S5, §18.3.3, §18.4.1, §18.4.6, §18.4.7, §18.5.6, §18.6.1, §18.7, §18.8.2, §18.9, §18.10.1, §18.11 |
| Q5 | **La rétention assistée se lit-elle en renouvellement des contrats échus, et la slide en regard en « clients perdus sur un an » ?** | ★ = renouvellement (logos), avec une variante contrats annuels / mensuels. Sur la slide : libre-service annualisé (~26 %, composé), assisté en contrats échus (12 %) | **Oui** : c'est le chiffre honnête en contrats annuels, et une seule unité par ligne. *Si on se trompe* : garder le natif des deux côtés met un taux mensuel en regard d'un taux annuel, exactement la comparaison piégée que la décision 3 écarte | **2026-09-30 : oui, la reco** (validée en bloc) |
| Q6 | **Durée de vie plafonnée à 36 mois aussi en assisté ?** | 36 mois ; le plafond mord dès 67 % de renouvellement annuel | **Oui** : le bas de « trois à cinq ans », et un seul plafond pour les deux motions. *Si on se trompe* : le glossaire dit « cinq ans ou plus » en entreprise ; 60 mois donneraient une LTV assistée 1,7 fois plus haute, imprimée dans le deck | **2026-09-30 : oui, la reco** (validée en bloc) |
| Q7 | **La liaison = la part des opportunités assistées venues du libre-service ; facultative ; jamais levier, candidate ni constat ?** (S10) | Un ratio en comptes (31 ÷ 130) sur le dénominateur partagé des opportunités créées ; la phrase « une part du pipeline, pas une attribution » | **Oui**, et un « Et si » croisé en v2 seulement s'il est demandé. *Si on se trompe* : s'il fallait le nombre de PQL passés et leur taux d'acceptation, c'est une entrée de plus ; un « Et si » croisé dès la v1 rouvrirait le « mets l'argent dans le PLG », donc le face-à-face | **2026-09-30 : oui pour la définition, et le levier dès la v1** (Antoine : « c'est justement un point important dans ces organisations hybrides »). Un curseur **en nombre** d'opportunités venues du libre-service par trimestre, dans le panneau de l'assisté ; les autres opportunités ne bougent pas, les nouvelles se signent au taux actuel ; le gain s'écrit dans l'assisté et le total, **rien n'est retiré au libre-service** ; la liaison reste facultative, **jamais candidate ni constat**. Montré sur l'exemple : 31 → 40 donne +1,25 signature par trimestre, ~830 € de MRR nouveau par mois. Corrigés le même jour : §18.0, S10, §18.2.1, §18.3.3, §18.4.8, §18.5.4, §18.5.5, §18.6.3, §18.8.1, §18.8.3, §18.10 |
| Q8 | **Aucun repère pour le closing, le cycle, le passage lead → opportunité et l'ACV ; trois termes de glossaire à créer ?** | Liens vers des termes voisins (`revenue`, `cac`, `acquisition`, `arpu`). Les ordres de grandeur de l'instrument d'audit (win rate 25-35 % / 12-18 %, couverture de pipeline 3×-6×) restent dehors : non relus (nº4) et interdits d'import (décision 6) | **Oui** ; créer « taux de closing », « cycle de vente » et « ACV » dans une vague SEO hors v1 (même chemin que 2.2), repères éventuels compris. *Si on se trompe* : reprendre les chiffres de l'audit les imprimerait, non relus, sous le nom du site, dans le deck d'un CODIR | **2026-09-30 : pas de repère repris de l'audit (inchangé), mais les termes dès la v1.** Antoine : « Go rajouter au glossaire dès la V1 ». **Quatre termes**, « conversion lead → opportunité » compris (§18.4.2 l'annonçait déjà) : le glossaire passe à 28 termes, 56 pages. **Écrits par une session à part** (`CHANTIERS.md` A7.3.e, son prompt), en parallèle de S0, sur `main` ; S2 attend leurs slugs. Un repère n'y entre que sourcé, et reste du contexte (C1). Corrigés le même jour : §18.4.1, §18.4.2, §18.4.6, §18.10.1, §18.11 |
| Q9 | **Deux rôles neufs : « Commercial » et « Customer Success » ?** | Les demandes copiées vont à eux pour la mise en production, le renouvellement, les références et l'origine des opportunités | **Oui** : sinon ces demandes partent au Support ou au RevOps, qui n'ont pas ces chiffres. *Si on se trompe* : deux libellés à relire, rien d'autre | **2026-09-30 : oui, la reco** (validée en bloc) |
| Q10 | **L'écran hybride : résumés côte à côte, collecte par motion ?** (§18.7) | À 1 280 px : bande du total, deux colonnes (couverture, diagnostic, funnel compact), puis un sélecteur de motion pour les onglets. À 390 px : empilé, ordre fixe | **Oui** : deux tableaux complets ne tiennent pas côte à côte à 1 280 px. *Si on se trompe* : deux tableaux entiers imposent un défilement horizontal ou des fiches en modale, ce que le moteur a évité jusqu'ici | **2026-09-30 : oui, la reco** (validée en bloc) |
| Q11 | **La slide « Deux moteurs, un total » ouvre-t-elle le deck hybride, avec le MRR dans 12 mois ?** | Présente et cochée. Le « dans 12 mois au rythme actuel » n'apparaît que si les deux projections existent ; total = somme des parties affichées | **Oui**, les deux : c'est ce que « un total » veut dire pour un COMEX. *Si on se trompe* : la ligne à 12 mois empile les hypothèses des deux modèles ; la retirer coûte une ligne | **2026-09-30 : oui, la reco** (validée en bloc) |
| Q12 | **Les montants des deux fuites peuvent-ils être visibles côte à côte ?** | Chaque diagnostic dans sa colonne, ordre fixe, phrase fixe « chacune se lit contre ses cibles » ; ni somme ni classement des fuites | **Oui, c'est suffisant**. *Si on se trompe* : un CODIR lira quand même « ~4 000 € » contre « ~600 € » (§18.9.4) ; masquer les montants en hybride retirerait au deck son argument dans les deux motions | **2026-09-30 : oui, la reco** (validée en bloc, sur croquis). Vérifié en la posant : le bloc de diagnostic du tableau ne montre **aucun montant** (`Diagnosis.tsx`), aujourd'hui comme en hybride ; chaque montant n'existe que sur la slide de sa fuite (`leak`, `slg:leak`), à deux slides d'écart, dans l'ordre fixe. « Côte à côte » se lit donc : deux diagnostics sans montant côte à côte, deux montants sur deux slides |
| Q13 | **Pas de pré-remplissage de la slide `ask` quand les deux motions nomment une étape ?** | Le formulaire propose les deux, sans ordre de valeur | **Oui** : pré-remplir, c'est choisir une motion à la place de l'équipe. *Si on se trompe* : un clic de plus | **2026-09-30 : oui, la reco** (validée en bloc) |
| Q14 | **Compter la motion choisie dans GoatCounter ?** | Non spécifié. Proposition : `engine_setup/<plg\|slg\|hybrid>` et des étapes préfixées (`engine_stage_saved/slg-revenue`), liste fermée | **Oui** : seule façon de savoir si l'assisté trouve son public. C'est une case cochée, pas un chiffre ni un texte ; relire la phrase de confidentialité (D16) pour qu'elle reste exacte. *Si on se trompe* : on pilote le catalogue à l'aveugle, ou la promesse se discute pour une case cochée | **2026-09-30 : oui, la reco** (validée en bloc) |
| Q15 | **Le cycle de vente en Acquisition, et la couverture de pipeline hors v1 ?** | Acquisition = passage, CAC, cycle ; Revenue = closing, ACV, ARPA assisté. C'est ce qui tient « trois par étape » tout en gardant le MRR assisté, sans lequel rien ne s'additionne | **Oui**. La couverture de pipeline, seul indicateur avancé, suppose un objectif de revenu et un seuil qui dépend du ticket, donc un repère qu'on n'a pas. *Si on se trompe* : on cherchera le cycle en Revenue ; le déplacer ne change que `stage` | **2026-09-30 : oui, la reco** (validée en bloc) |
| Q16 | **Libellés et défauts du réglage** | « Plus tard » (pas « Bientôt ») pour l'app grand public et la place de marché ; « taux de closing » ; « assisté » / "sales-assisted" ; libre-service coché et assisté décoché par défaut | **Garder**, et laisser le bon à tirer trancher les mots. *Si on se trompe* : de la copie à reprendre. Pour le défaut, un visiteur en vente assistée doit décocher avant de cocher ; aucune case cochée serait plus neutre, mais la carte ne démarrerait plus valide | **2026-09-30 : oui, la reco** (validée en bloc) |

---

## Annexe — Les entretiens (`CHANTIERS.md` D5)

*Trame validée par Antoine le 2026-09-30, quand l'instrument d'audit a été mis
entre parenthèses (`AUDIT-PLAN.md`, en tête). Les entretiens y servaient le
Go / No-Go de l'audit ; ils servent désormais le moteur. Leur question de fond
était déjà la sienne : **« quelqu'un taperait-il ses chiffres à la main, et
pour obtenir quoi ? »***

**Ce qu'ils éprouvent** : les paris du moteur. On tape ses chiffres à la main ;
ils ne quittent pas le navigateur ; seule une cible d'équipe désigne la fuite
(décision 5) ; le deck part en CODIR (§9) ; le libre-service et l'assisté se
lisent en « deux moteurs, un total » (décision 3, `CHANTIERS.md` A7.3).

**Qui** : cinq à dix PM growth, Heads of Growth ou fondateurs de SaaS B2B de
10 à 100 personnes, dont **au moins deux en vente assistée ou hybrides**,
puisque le B2B assisté entre en v1. Ce sont des conversations une à une, pas
de la promotion.

**Format** : 30 minutes en visio. Le moteur n'apparaît que dans les dix
dernières minutes, pour ne pas orienter les réponses. Les questions portent
sur ce que la personne a fait, pas sur ce qu'elle ferait.

1. **Contexte** (2 min) : le rôle, la taille de l'équipe, le modèle
   (libre-service, vente assistée, les deux).
2. **La dernière fois** qu'elle a présenté son funnel à un CODIR ou à un board :
   quels chiffres, d'où ils venaient, combien de temps pour les réunir, dans
   quel support.
3. **En arrivant dans sa boîte actuelle** : combien de temps avant d'avoir une
   vue des chiffres, et qui les lui a donnés.
4. **La dernière fois** qu'elle a choisi l'étape du funnel à travailler :
   comment, et par rapport à quoi (une cible d'équipe, un benchmark,
   l'intuition).
5. **A-t-elle déjà recopié ses chiffres à la main** dans un outil ou un tableur
   pour obtenir quelque chose ? Quoi ? Qu'est-ce qui l'aurait retenue (le
   temps, la confidentialité, autre chose) ?
6. *Si les deux motions coexistent* : comment les présente-t-elle ? Séparées,
   additionnées, comparées ?
7. **Démo** (10 min, en partage d'écran depuis l'aperçu propriétaire) : elle
   saisit ses chiffres. Noter ceux qu'elle n'a pas, le temps que ça prend, et
   ce qu'elle attendait en sortie.
8. **Clôture** : s'en servirait-elle sur ses vrais chiffres la semaine
   prochaine ? L'enverrait-elle à quelqu'un ? Et surtout : **l'a-t-elle demandé
   sans qu'on le propose ?**

**À noter pour chaque entretien** : le profil, anonymisé ; les chiffres
manquants ; le temps de collecte ; la référence de décision ; la réaction à
l'hybride ; la phrase exacte sur la saisie à la main.

**Ce qui entre dans le dépôt** : rien des notes. Ni nom, ni entreprise, ni
chiffre ; elles restent sur la machine d'Antoine. À partir de cinq entretiens,
une session écrit ici une **synthèse anonyme**, et ce qu'elle change au moteur
part en section C de `CHANTIERS.md`, comme une question.
