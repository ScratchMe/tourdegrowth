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
sont consignés dans le journal (`JOURNAL.md`), pas réécrits ici. **Le moteur
complet (§19, A14) est codé depuis le 2026-10-01** (T0 à T7, neuf PR de #255 à #266,
puis son image de partage, T6.2, [#272](https://github.com/ScratchMe/tourdegrowth/pull/272), dessinée par Claude Design), drapeau
fermé ; sa copie neuve attend le bon à tirer A14.d, et l'ouverture l'attend, en
plus du reste de `CHANTIERS.md` D2.

**Le moteur simplifié (2026-10-02)** : Antoine jugeait la saisie « extrêmement
dense », au retour comme dans le pas à pas. Claude Design l'a redessinée (brief
07, [retour](design/ds-extension-07-return/README.md), `CHANTIERS.md` B10), et
Antoine a tranché sur la planche : **le pas à pas et le tableau ne font plus
qu'un**, avec une seule prochaine étape et **un écran « Cibles » gardé au
début** (C40), **une liste par étape à la place des onglets** (C41, qui
renverse le bloc du 2026-09-27 ci-dessous), **les renommages** relus au bon à
tirer (C42), et **le portage avant un bon à tirer unique** (C38). Le modèle de
données ne change pas.

**Le moteur simplifié, porté (A18, du 2026-10-02 au 2026-10-03).** Le portage
est `CHANTIERS.md` A18, T0 à T7, une PR par étape. Ce qui suit est le code
d'aujourd'hui. Dans les blocs plus bas, ce qui le contredit est de
l'histoire : le pas à pas, « Tout voir d'un coup », l'écran de la base, les
onglets, la liste « à aller chercher » pliée.

- **Un seul parcours.** La première visite pose une question, le type de
  moteur (libre-service par défaut), sur la carte de départ (`EngineStart`).
  Elle dit les réglages par défaut en une phrase et les ouvre sur
  « Changer ». « Commencer » mène à l'écran « Cibles », gardé au début et
  sautable (C40), puis au premier chiffre.
- **Chaque chiffre a son écran** (`_engine/NumberScreen.tsx`, la fiche
  recomposée sur `NumberSheet`). On y trouve les quatre réponses
  (`AnswerSwitch`), « Ta définition et une note » plié, « Où le trouver »
  plié, le piège (`TrapNote`) et « Comment il se compare »
  (`HowItCompares`), où se saisit aussi la cible.
- **« Enregistre et continue » mène à la prochaine étape.** Une seule
  fonction pure la choisit (`_engine/next-step.ts`) : les chiffres de cinq
  minutes d'abord, puis **toutes les demandes sur un écran** (`AskList`),
  puis les chiffres d'une heure, puis les slides.
- **La base n'a plus d'écran.** Un nombre partagé se tape dans le premier
  chiffre qui le porte, et se propage comme avant (`shared-counts.ts`).
- **Le tableau** :
  - en tête, la barre du moteur (`EngineBar`, son menu « Moteur, mois et
    fichier » replié) et la prochaine étape (`NextStep`), seule ;
  - puis le verdict, le diagnostic, le peloton « Pour 100 inscrits » et
    **« Tes chiffres », une liste par étape** (C41 ; `NumberList` et
    `EngineProgress`), où chaque ligne ouvre l'écran du chiffre ;
  - le levier « Et si » (`LeverCard`), avec le panneau complet plié derrière
    lui ;
  - ce que quitte le réglage est dans les **Réglages** : les cibles et les
    nombres partagés.
- **Ce qui est retiré** : les onglets (`stage-tabs.ts`), le pas à pas
  (`steps-model.ts`) et « Tout voir d'un coup ».
- **La page** (`EngineLanding`) :
  - à la première visite, la promesse en carte avant l'appel, et la durée
    sous l'outil ;
  - au retour, un script en ligne ne lit que l'existence de la clé du moteur
    (`lib/engine/known-script.ts`) et rend la page courte avant le premier
    rendu (la CSP : `NEXTJS.md` §2.2). L'outil y commence à environ 360 px
    au lieu de 1 267 ;
  - le HTML prérendu, celui que lisent les moteurs de recherche, est celui
    de la première visite.
- **L'hybride** : « Deux moteurs, un total » une fois, en tête (`TotalBand`).
  C'est une somme, jamais une comparaison : ni signe, ni ordre qui suive les
  valeurs. Puis un moteur affiché à la fois, au sélecteur « Moteur affiché ».
- **Les mots** (C42) :
  - les renommages ;
  - cinq « ? » : cohorte, cible, repère, fenêtre, nombre partagé. Chacun est
    là où son mot sert d'abord, et une seule définition est ouverte à la fois
    (`_engine/EngineTerm.tsx`).
- **Ce qui n'a pas bougé** :
  - le modèle de données et le fichier ;
  - les slides : golden-v1 et golden-v2 sont inchangés, et celles qui disent
    encore « motion » attendent A18.d.
- **La copie neuve** porte « TODO: à relire » jusqu'au bon à tirer unique
  A18.d, qui absorbe A7.3.d et A14.d (C38).
- **Mesures et captures** : l'avant (B10), la proposition du retour et le
  portage, mesurés de la même façon (`scripts/engine-density.capture.ts`),
  sont dans le journal, à l'entrée d'A18 T7. Les captures du portage sont
  dans `design/ds-extension-07-after/`.

**L'argent du moteur (A20, ouvert le 2026-10-03)** : le film « Le moteur »
(`marketing/motion/`) montre un MRR qui monte, un client qui coûte plus qu'il
ne rapporte, « Et si ? » qui fait bouger le MRR dans 12 mois et l'ARR, des
slides pour un board ou un investisseur. Le moteur n'en montrait qu'une
partie. **La spécification est §20, dans
[`docs/engine/argent.md`](docs/engine/argent.md)** ; son modèle pur est codé
le même jour (A20.a : `lib/engine/money.ts`, et les champs de `ScenarioKpis`
et `SlgScenarioKpis`), sans écran. Le retour du brief 09 est arrivé le même
jour (`design/ds-extension-09-return/`), et **Antoine a tranché C45 à C55 le
2026-10-03**, toutes sur la reco, avec deux précisions à C49 : le mot
« runway », expliqué par un « ? » (« tes mois de trésorerie »), et, sans runway
saisi, **un plancher : un CAC payback de 30 mois ou plus alerte**. Les réponses
sont en §20.13 ; l'ouverture du moteur attend le portage (C46).

**L'app grand public et la place de marché (A22, A23, spécifiées le
2026-10-04)** : les deux types que la décision 3 laissait « plus tard ». Ce ne
sont pas des motions : le **type** est l'autre axe du réglage. Les deux
spécifications ont été tranchées par Antoine (C56 à C74, C92, C93), puis
réécrites le même jour **en guides d'exécution** : un orchestrateur lance un
sous-agent par unité, une PR par unité, avec des points d'arrêt, selon
**§23, [`docs/engine/executer-un-type.md`](docs/engine/executer-un-type.md)**.
Leurs modèles purs sont codés et testés (A22.b, A23.b, #329) ; des scripts de
référence (`docs/engine/reference/`) refont leurs exemples sans le code du
moteur.
- **§21, [`docs/engine/app-grand-public.md`](docs/engine/app-grand-public.md)** :
  une app grand public gagne par abonnements, achats intégrés ou publicité
  (deux flux), paie une commission aux stores, se lit par installation
  (un graphique de remboursement en courbe) ; douze unités, ~19,5 jours-agent ;
- **§22, [`docs/engine/place-de-marche.md`](docs/engine/place-de-marche.md)** :
  deux côtés, chacun son diagnostic, jamais comparés : la demande gagne une
  commission (le revenu net), l'offre des abonnements de vendeurs (une case) ;
  un total ; deux vocabulaires, « produits » et « services » ; ses écrans
  passent d'abord par Claude Design (le brief 10) ; quatorze unités, ~31
  jours-agent, après §21.
Les types s'ouvrent par `ENGINE_TYPES`, et **l'ouverture du moteur ne les
attend pas** (C62).

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
     (plus tard ; spécifiées le 2026-10-04, §21 et §22) ;
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
   **La spécification est écrite le 2026-09-30 : §18, dans
   [`docs/engine/assiste-et-hybride.md`](docs/engine/assiste-et-hybride.md)**
   (A7.3.a). **Validée par Antoine le même jour** (`CHANTIERS.md` C25, ses
   seize réponses en §18.12). Trois recos sont reprises : **une marge brute
   par motion** (Q4), **la liaison devient un levier « Et si » dès la v1**
   (Q7) et **quatre termes de glossaire dès la v1** (Q8). Q3 gagne une
   précision : un passage du libre-service à l'assisté n'est pas un départ.
   Le code (A7.3.c) peut partir, avec les termes (A7.3.e) en parallèle.
   **Le code est livré le 2026-10-01** (#233, drapeau fermé) : reste le bon
   à tirer de sa copie (A7.3.d).
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

**Refonte de la saisie (2026-09-26, sur les premiers retours d'Antoine ;
le pas à pas, la base et les onglets sont remplacés par A18, bloc plus haut).** Ce
qui change par rapport aux §4, §7 et §8 (dans `docs/engine/v1.md`) — le reste tient :

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
| §18 | [`docs/engine/assiste-et-hybride.md`](docs/engine/assiste-et-hybride.md) | Le B2B assisté et l'hybride (A7.3), validé par C25 et construit par A7.3.c (#233, 2026-10-01). Le code fait foi depuis |
| §19 | [`docs/engine/moteur-complet.md`](docs/engine/moteur-complet.md) | Le moteur complet pour le SaaS B2B (A14) : la série mensuelle, la rétention J30 et la part recommandée en €, la couverture du pipeline, les outils, le tableau collé, plusieurs moteurs, la fusion, le fond blanc, les rappels, les portes d'entrée. Écrit et validé le 2026-10-01 (C32), construit par A14.c le même jour (T0 à T7, neuf PR de #255 à #266), sauf l'image de partage (T6.2, après B5). Le code fait foi depuis ; l'ouverture du moteur attend aussi T6.2 et le bon à tirer A14.d (le reste dans `CHANTIERS.md` D2) |
| §20 | [`docs/engine/argent.md`](docs/engine/argent.md) | L'argent du moteur (A20, 2026-10-03) : l'ARR, la courbe du MRR, le LTV:CAC dans « Et si », le constat de perte, le payback face à la durée de vie, la trésorerie immobilisée, les sommes de l'hybride, et l'alerte de payback long (le runway de l'équipe, sinon un plancher de 30 mois, C49). Le modèle est codé (A20.a, puis T1) ; C45 à C55 sont tranchées (§20.13) et les écrans se portent (A20.d) |
| §21 | [`docs/engine/app-grand-public.md`](docs/engine/app-grand-public.md) | L'app grand public (A22, 2026-10-04) : un deuxième type, en libre-service ; abonnements, achats intégrés et publicité en deux flux, la commission des stores, l'économie d'une installation ; ses mots, ses sources et son seul repère (J30) ; le drapeau `ENGINE_TYPES`, le calque de copie par type. Tranchée (C56 à C63, C92) ; guide d'exécution en douze unités (APP-0 à APP-11), prompt G |
| §22 | [`docs/engine/place-de-marche.md`](docs/engine/place-de-marche.md) | La place de marché (A23, 2026-10-04) : une motion dérivée, `"mkt"` ; deux côtés (la demande et ses commissions, l'offre et ses abonnements), chacun son diagnostic, jamais comparés, et un total ; deux vocabulaires ; le brief 10 à Claude Design pour ses écrans. Tranchée (C64 à C74, C93) ; guide d'exécution en quatorze unités (MKT-B, MKT-0 à MKT-10, MKT-S, MKT-G), prompt H, après §21 |
| §23 | [`docs/engine/executer-un-type.md`](docs/engine/executer-un-type.md) | Exécuter un type depuis sa spécification (2026-10-04) : l'orchestrateur et ses sous-agents, le format d'une fiche, le tableau d'avancement dans `CHANTIERS.md`, le prompt d'une unité, ce qui se vérifie avant de merger, et comment reprendre après une pause |
| Annexe — Les entretiens | ci-dessous | La trame des entretiens (`CHANTIERS.md` D5) |

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
