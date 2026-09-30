# ENGINE.md — le moteur de growth

*Versionné le 2026-09-25. Jusque-là, cette spécification ne vivait que dans le
répertoire de travail d'une session, qui disparaît avec son conteneur ; c'est la
même raison qui a fait entrer `AUDIT.md` et `AUDIT-PLAN.md` dans le dépôt.*

**Où en est le moteur.** Construit derrière `ENGINE_ENABLED` (fermé ; Antoine le
teste avec l'aperçu propriétaire de `/admin/preview`), route `/{locale}/aarrr-funnel-template`, code dans
`src/lib/engine/` (pur), `src/content/engine-copy.ts` et `engine-catalog.ts`
(toute la copie, `TODO: à relire` jusqu'au bon à tirer nº6) et
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
   (A7.3.a). Elle attend la validation d'Antoine (`CHANTIERS.md` C25, avec
   ses seize questions en §18.12) ; rien ne se code avant.
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

# Le moteur de growth — spécification d'implémentation (v1)

*Phase 1, lecture seule. Synthèse des trois conceptions (`engine-codir.md`,
`engine-collect.md`, `engine-funnel.md`), jugées puis greffées. Ce document est
celui que les agents d'implémentation suivent ; les trois autres restent la
source des raisonnements détaillés. Français, identifiants en anglais. Toute
copie neuve est **`TODO: à relire`** (convention 6) — rien ici n'est approuvé.*

*Vérifications faites pour ce document, contre le build de production de
`localhost:3000` et le code de `main` (`2036297`) — pas contre les documents :
les 20 fichiers produits par les trois angles ont été ouverts et les captures
regardées ; les deux PDF inspectés (1 page, 1440×810 pt, polices embarquées,
`LiberationSerif-Bold` en repli dans `slide.pdf`) ; une maquette de la greffe
rendue à 1280 et 390 px avec les vrais tokens et polices
(`spec-probe/board.html`, `board-1280.png`, `board-390.png`, aucun débordement
horizontal mesuré) ; la couverture de glyphes des trois polices web mesurée dans
Chromium (`spec-probe/glyphs.cjs`) ; les repères du glossaire relus dans
`src/content/glossary-deep.ts` ; les contrastes recalculés depuis
`src/styles/tokens/colors.css`.*

---

## 0. En une page

**Ce que c'est.** Une page publique, gratuite, bilingue,
`/{locale}/aarrr-funnel-template`, nommée « Moteur de growth » / « Growth
engine ». Un Growth PM ou un Head of Growth y va **chercher quinze chiffres**
(trois par étape AARRR, comme le Tour a trois questions par étape), les saisit
**en comptes** (numérateur ÷ dénominateur), voit son moteur sous forme d'un
**peloton de 100 inscrits**, apprend où il perd le plus **contre une cible
nommée**, transforme chaque chiffre introuvable en **constat chiffré en coût de
réparation**, se confronte à ce qu'il avait **déclaré au Tour**, et repart avec
un **deck de 4 à 7 slides** (PDF vectoriel + PNG par slide + texte copiable).
Rien de ce qu'il saisit ne quitte le navigateur, et une spec canari le prouve.

**La greffe, en une ligne par angle.**

| Pris à… | Ce qui est repris |
|---|---|
| **Collecte** (`engine-collect.md`) | Saisie en comptes ; le **peloton de 100 inscrits** comme unité de lecture et visuel principal ; la cohorte mûre calculée ; le triage « je ne le trouve pas » qui fabrique le constat ; la demande copiée par rôle ; le catalogue 15 = 3 × 5 ; la règle de glyphes ; `snapshots[]` dès la v1 |
| **Funnel** (`engine-funnel.md`) | Le frein désigné **seulement contre une référence qui désigne** (drapeau `designates`), la cible d'équipe comme moyen normal de débloquer le diagnostic ; le rapprochement « chaîne prédite × facturation » ; le tiroir inline sur mobile ; la table des états sans couleur seule |
| **CODIR** (`engine-codir.md`) | Le deck pensé comme un argument (où · combien · quoi · comment tu sais) ; l'impact en **€ de MRR par mois en intervalles**, classement avec **intervalles disjoints** ; « dans la référence ⇒ jamais une fuite » ; titre et corps formatés depuis **le même objet** ; la demande par défaut « mesurer d'abord » ; l'export texte avec notes d'orateur ; un seul profil en v1 |

**Ce qui est rejeté** (détail en §2) : les barres proportionnelles aux effectifs
(les trois auteurs les ont vues mentir), la chaîne de survivants à quatre maillons
depuis les visiteurs (multiplie des populations mesurées différemment), les
jauges à domaines différents dans les lignes, les 45 recettes par outil et le
filtrage par outils cochés (v1.1), les titres de slides de données éditables,
le blocage du deck sur incohérence, le PPTX (v2).

**Le rendu cible** — maquette de la greffe, vrais tokens, vraies polices :
`spec-probe/board-1280.png` (peloton pleine largeur, lignes d'étapes + tiroir
collant à droite) et `spec-probe/board-390.png` (une ligne de peloton par
colonne, mini-grille de 118 px à gauche). Slide de référence :
`shots/peloton.png`.

**Chiffrage.** 9 PR (dont la PR d'ouverture), ~10 jours-agent, **~5 jours calendaires** en parallèle,
fusionnées dans une branche d'intégration `feat/engine`, puis **deux merges sur
`main` en tout** : le code, drapeau fermé, et plus tard une PR d'ouverture
minuscule (convention 13 : chaque merge coûte ~47 Mo de Functions Storage sur
30 jours). Le drapeau `ENGINE_ENABLED` est fermé par défaut (précédent :
`lib/game/access.ts`).

---

## 1. Les trois angles, jugés

Notes sur 5. Chaque note s'appuie sur ce que j'ai vu dans les fichiers produits,
pas sur ce que les documents affirment.

| Critère | CODIR | Collecte | Funnel |
|---|---|---|---|
| **Valeur pour un Head of Growth devant un COMEX** | **5** — le seul angle qui pose « combien ça vaut » en € et « que demandes-tu » ; la slide `Cost` (`proto/s2-export.png`) est lisible à trois mètres | 4 — aide réelle à la collecte (demande copiée, triage), mais aucun chiffrage en € | 4 — diagnostic et « et si », mais le titre « Sur 10 000 visiteurs, 23 paient » est fragile (voir honnêteté) |
| **Honnêteté, explicabilité déterministe** | 4 — intervalles propagés, fuite contre comparateur nommé ; mais le modèle est un flux mensuel (approximation assumée) et son propre prototype `s1-export.png` dessine des barres proportionnelles aux effectifs (12 400 → 49 ne tient sur aucune échelle linéaire) | **5** — comptes plutôt que taux, cohorte mûre, refus de nommer un frein sans repère, peloton sans échelle à défendre | 3,5 — bon drapeau `designates` et bon rapprochement ; mais la chaîne multiplie activé → actif M3 → payant parmi actifs, des bases que les outils ne sortent pas ; pistes à domaines différents (0-10 % contre 0-100 %) qui invitent à comparer des longueurs |
| **Confidentialité prouvable** | **5** — canari + balayage statique des `fetch`/`sendBeacon`/`WebSocket` + vocabulaire analytics fermé | **5** — idem, plus : la demande copiée ne contient aucune valeur | 4,5 — canari complet, balayage statique moins détaillé |
| **Faisabilité en jours** | **4,5** — 9 chiffres, 1 profil, 4 slides | 2,5 — 15 chiffres, ~45 recettes × 2 langues, 10 statuts, 11 écrans | 3,5 — 17 chiffres, 2 profils, miroir, rapprochement, 7 slides |
| **Impact visuel** | 3,5 — slides textuelles fortes ; visuel de funnel défaillant | **5** — `shots/peloton.png` est l'image la plus forte des trois dossiers, et elle porte la métaphore du Tour | 4 — route + tampons efficaces ; mais `shots/mock-1280.png` montre « 32 / 1 000 visiteurs » qui sort de sa carte à droite |
| **Bilingue / accessibilité** | 4 — `<dl>` textuel, contraste raisonné | **4,5** — `role="img"` + tableau masqué, règle de glyphes vérifiée | **4,5** — lignes en `<button>`, états jamais par la couleur seule (WCAG 1.4.1) |
| **Total** | **26** | **26** | **24** |

**Lecture.** Les deux premiers sont à égalité, et aucun angle ne gagne seul : CODIR a le meilleur *argument*,
Collecte le meilleur *modèle de données* et le meilleur *visuel*, Funnel la
meilleure *règle de désignation*. La spec prend le squelette de Collecte
(données, peloton), le moteur de diagnostic de Funnel + CODIR, et le deck de
CODIR étendu par deux slides de Collecte.

**Défauts vus dans les maquettes, qui deviennent des règles** :

| Vu dans | Défaut | Règle de cette spec |
|---|---|---|
| `proto/s1-export.png` | barres proportionnelles aux effectifs entre étapes | aucune barre d'effectif entre étapes ; le peloton compte des personnes sur une base commune (§8.1) |
| `proto/s2-export.png` | titre « +2 à +3 k€ », corps « +1 400 à +2 600 € » | titre et corps formatés par la même fonction depuis le même `Impact` (§6.7, test) |
| `proto/s2-export.png` | « 24 % → 30-35 % (bas de la référence) » alors que 24 % est *dans* 20-40 % | une valeur dans sa référence n'est jamais une fuite contre elle (§6.6) |
| `shots/mock-1280.png` | « 32 / 1 000 visiteurs » déborde de la carte | valeurs hors des marques, `white-space` maîtrisé, débordement mesuré en e2e (§13) |
| `shots/mock-mobile.png` | « ≈ 2 à 4 » déborde d'une barre de 14 % | jamais d'étiquette dans une marque étroite |
| `shots/slide.pdf` | `LiberationSerif-Bold` embarquée pour « ≈ » | liste blanche de glyphes + contrôle des polices du PDF (§10.4) |
| `spec-probe/board-1280.png` (ma maquette) | titre « 38 atteignent » au-dessus d'une grille qui en montre 18 | même règle que la ligne 2 : **je l'ai reproduite moi-même en tapant la maquette à la main** |
| `spec-probe/board-1280.png` | le numéral « 100 » colle au bas de la grille | ordre du slide `peloton.png` : numéral → libellé → grille → source |
| `spec-probe/board-1280.png` | « 38 × 20/18 = 42 (+4) » puis « ~+500 € » : 4 × 120 = 480 | la chaîne affichée se recalcule à partir des nombres affichés (§6.7, test) |

---

## 2. Décisions (décision · raison · alternative rejetée)

**D1 — Une page de contenu préfixée qui héberge un îlot client.**
`src/app/[locale]/aarrr-funnel-template/page.tsx` (Server Component prérendu, ●)
+ `EngineWorkbench.tsx` (`"use client"`). *Raison* : indexable (hreflang,
canonical, JSON-LD via les helpers existants), servie par le CDN (R-24), zéro
fonction serveur ; même motif que `LastResult`/`PreviewCard`. *Rejeté* : une
route sous `(app)` sans préfixe (non indexable, et l'audit SEO en fait la
meilleure opportunité de mots-clés du site) ; une route par écran (état
client comme `/quiz`).

**D2 — Slug `aarrr-funnel-template`, nom affiché « Moteur de croissance » /
« Growth engine ».** *Raison* : l'audit SEO (`seo-audit.md` §4.2) trouve
« AARRR funnel template » sans aucun outil concurrent ; la revue de copie
(`copy-review.md` §4.3) fixe le nom « moteur de croissance » et exclut
« diagnostic » (pris par le Tour et par l'instrument d'audit). Slug anglais
dans les deux langues (R2-16). *Rejeté* : `/growth-engine` (ne porte aucune
requête), `/aarrr-metrics` (intention informationnelle déjà saturée de guides).
**À confirmer par Antoine (Q1)** — une URL publiée ne meurt jamais ici.
*Tranché le 2026-09-29 (C2), codé le 2026-09-30 (A7.2)* : le nom affiché devient
« Moteur de growth », l'adresse reste (décision 1 en tête de fichier).

**D3 — Derrière un drapeau `ENGINE_ENABLED`, fermé par défaut, avec cookie de
prévisualisation `?engine=preview`.** Copie conforme de `lib/game/access.ts` +
un bloc dans `src/proxy.ts` qui réécrit une page fermée vers une adresse sans
route (404, pages toujours prérendues). *Raison* : fusionner le travail de huit
PR sans rendre publique une fonctionnalité incomplète, et laisser Antoine la
tester en production. *Rejeté* : `force-dynamic` comme `/metrics` (casserait le
prérendu) ; attendre la fin pour fusionner (une branche vivante des jours).
Sitemap, liens de pied de page et liens entrants **n'arrivent qu'à l'ouverture**
(même raison que R2-28 : le sitemap est construit au build, le drapeau se lit à
la requête).

**D4 — Un profil en v1 : SaaS / produit web en libre-service (essai ou
freemium).** Les trois autres (B2B en vente assistée, app grand public, place de
marché) sont **affichés désactivés avec la raison** (« leur funnel n'a pas la
même forme »). *Raison* : chaque profil change libellés, sources et repères ;
un seul profil fait tenir le catalogue et la copie dans une relecture. Le type
`EngineProfile` est une union pour que la v1.1 n'ait rien à migrer. *Rejeté* :
deux profils en v1 (Funnel, Collecte). *Question Q3* : la vente assistée est le
cas d'AB Tasty.

**D5 — L'unité de lecture est la cohorte de 100 inscrits.** Chaque colonne du
peloton est comptée **sur les mêmes 100 inscrits** (c'est ainsi que Mixpanel,
Amplitude et une jointure produit × facturation sortent les taux). La ligne
amont donne « ~3 200 visiteurs pour 100 inscrits ». *Raison* : aucune échelle à
défendre, des entiers sans fausse décimale, et l'inconnu a une forme propre
(grille pointillée rouge). *Rejeté* : la chaîne de survivants
visiteur → inscrit → activé → actif M3 → payant parmi actifs (Funnel) — elle
multiplie quatre taux mesurés sur des bases différentes, dont deux qu'aucun
outil ne sort ; l'entonnoir à largeurs linéaires (97 % de l'image pour les
visiteurs) ou logarithmiques (juste mais illisible en COMEX).

**D6 — Tout taux se saisit en comptes** (« 144 activés sur 800 inscrits »), un
raccourci « je n'ai que le taux » existe et rend la valeur *approximative*.
*Raison* : élimine « 18 % de quoi ? », permet les contrôles de cohérence, et
fournit **gratuitement** les volumes dont le chiffrage en € a besoin (inscrits
du mois, nouveaux payants, base payante — ce sont des dénominateurs et
numérateurs déjà saisis). *Rejeté* : saisie en pourcentage (CODIR, Funnel), qui
oblige à une « épine » de volumes en plus.

**D7 — Deux mois, pas un.** `referenceMonth` (les flux : visiteurs, inscrits du
mois, dépense, churn, ARPA ; défaut = dernier mois clos) et `cohortMonth` (les
colonnes du peloton ; défaut = la cohorte mûre pour la plus longue fenêtre, via
`matureCohortMonth`). Au 24/09/2026 : flux d'août, cohorte de juillet. *Raison* :
une cohorte d'août n'a pas eu 30 jours pour tous ses inscrits ; c'est le faux
chiffre le plus courant. *Rejeté* : un seul mois de flux avec l'approximation
« flux ≈ cohorte » (CODIR) — juste à la marge, faux dès que l'essai dure.

**D8 — Le frein n'est nommé que contre une cible d'équipe.** *Renversée en
partie le 2026-09-29 (décision 5, `CHANTIERS.md` C1), codée le 2026-09-30
(A7.1).* La v1 laissait deux repères du glossaire désigner (activation 20-40 %
des inscrits, churn logo 1-2 %/mois) ; **aucun ne désigne plus**. Tous les
repères sont du **contexte** (affichés avec leur réserve, jamais utilisés pour
nommer). **La cible de l'équipe désigne toujours**, et c'est le seul moyen de
débloquer le diagnostic. Il faut au moins 2 étapes comparables
pour classer. *Raison* : un COMEX lira « référence » comme « norme » ; la
plupart des taux n'ont aucun repère transférable (le glossaire le dit lui-même
pour ARPU, rétention SaaS, conversion payante, recommandation). *Rejeté* :
classer tous les taux contre des repères (CODIR, où le taux d'inscription 2-5 %
porte sur du trafic froid payant, jamais le mix réel) ; refuser toute
désignation (Collecte, trop sec pour un deck qui doit conclure).

**D9 — Le classement se fait en € de MRR par mois, en intervalles, avec une
marge de netteté.** Pour les étapes de flux, l'impact est
`nouveaux payants/mois × (cible/taux − 1)` — le même multiplicateur pour toutes,
donc **classer en € revient exactement à classer par écart relatif** (vérifié
algébriquement, épinglé par un test) ; l'ARPA ne sert qu'à comparer un flux au
churn. `clear` exige `top.lo > second.hi × 1,25`. *Raison* : la seule unité
commensurable entre acquisition, activation, conversion et churn ; la marge de
25 % est l'analogue de `CLEAR_GAP = 4` points sur 20 du Tour (20 %), arrondi
pour absorber l'erreur de mesure d'entrées déjà approximatives. *Rejeté* :
écart relatif seul (Funnel, ne compare pas au churn) ; intervalles disjoints
sans marge (CODIR : deux montants mesurés à 600 et 610 € seraient « nets »).

**D10 — Titres des slides de données non éditables.** Seuls le libellé de
l'entreprise et la slide `Ask` sont rédigés par l'utilisateur ; l'export texte
permet de réécrire dans *son* deck. *Raison* : un titre édité peut contredire
son corps — l'erreur exacte de `s2-export.png`. *Rejeté* : titres modifiables
avec « revenir à la formulation proposée » (Collecte).

**D11 — Le deck n'est jamais bloqué par une incohérence ; les impossibles
bloquent l'enregistrement.** Numérateur > dénominateur sur un taux borné,
dénominateur nul : refusés à la saisie. Tout le reste (« plus d'actifs à J30
que d'activés », churn mensuel > 30 %…) s'affiche « à vérifier » sur le tableau
et en tête de l'écran d'export (« 2 points à vérifier avant de projeter »).
*Raison* : bloquer à 20 h la veille d'un CODIR fait abandonner l'outil ;
l'honnêteté est servie par l'affichage. *Rejeté* : blocage jusqu'à annotation
(CODIR).

**D12 — Export v1 : PDF par impression navigateur + PNG par slide
(`html-to-image`, import dynamique au clic) + texte copiable avec notes.**
PPTX en v2. Détail et mesures en §10. *Rejeté* : `pptxgenjs` en v1 (~140-157 Ko
gz, n'embarque pas Stardos Stencil, second rendu à maintenir).

**D13 — Le Tour est lu, jamais copié ; il n'apparaît sur une slide que sur
demande explicite.** L'îlot lit `tdg.results.v1` via `loadStoredResults()` (le
plus récent résultat avec `answers`) ; le moteur ne garde que `resultId`. La
slide « Déclaré × mesuré » existe mais est **décochée par défaut** avec la
phrase « Le Tour est une auto-évaluation : à montrer seulement si l'écart est ton
argument ». *Raison* : c'est l'argument le plus fort (« on croyait mesurer,
on ne peut pas sortir le chiffre ») et le plus exposant. *Rejeté* : jamais
(CODIR) ou toujours (Funnel). *Question Q4.*

**D14 — Une seule entrée `localStorage` versionnée, `snapshots[]` dès la v1,
un seul moteur par appareil.** *Raison* : la série mensuelle (« l'activation est
passée de 18 à 24 % ») est la raison de revenir, et « une valeur est une série »
(`AUDIT.md` §3, décision irrattrapable nº1) ; plusieurs moteurs par appareil ne
sont pas un besoin v1 et s'ajoutent sans migration douloureuse. *Rejeté* :
`workbooks[]` (Collecte) ; un seul état plat sans snapshot (CODIR, Funnel).

**D15 — Écriture qui échoue = renvoyée et affichée, jamais avalée.** Même règle
que `lib/audit/storage.ts`, à l'inverse de `quiz/storage.ts` : perdre des
chiffres cherchés dans quatre outils coûte une demi-journée. Le message d'un
quota plein nomme la seule sortie : sauvegarder le fichier.

**D16 — La promesse de confidentialité est exacte, pas large.** Elle ne dit pas
« rien ne quitte ton navigateur » tout court — la page charge GoatCounter comme
tout le site — mais « **aucun chiffre ni aucun texte que tu saisis** ne quitte
ton navigateur ; la page compte ses visites sans cookie, jamais ce que tu y
écris ». *Raison* : c'est ce que la spec canari prouve, mot pour mot.

**D17 — Composants de saisie locaux à la route**
(`aarrr-funnel-template/_engine/_ui/`), construits aux tokens, sur le modèle
(recopié, pas importé) des primitives de `/admin/audit/_ui`. *Raison* : le
design system n'a aucun `<input>` hormis `TextArea` ; un brief Claude Design
retarderait de plusieurs jours ; importer depuis le dossier privé d'une autre
route couple deux fonctionnalités. Promotion au design system en v1.1 si le
moteur trouve son public. *Rejeté* : importer `admin/audit/_ui`.
**Remplacée le 2026-09-30** (`CHANTIERS.md` A10, extension 04 du design
system) : les trois copies avaient dérivé — trois anneaux de focus, une
raison « bientôt » à 1,91:1, une case qui lisait « 26 000 » comme rien. Le
moteur saisit maintenant par `src/components/core/` (`Field`, `TextField`,
`NumberField`, `Select`, `DateField`, `Choices`, `Checkbox`), et
`_engine/_ui/` n'existe plus ; `form-controls-source.test.ts` empêche une
quatrième copie.

**D18 — Le diagnostic garde la grammaire visuelle de `Bottleneck` sans le
réutiliser.** `result/Bottleneck` impose `pillars: {pillar, score}[]` et un
`total` sur 20 ; le moteur manipule des taux et des euros. Composant local
`Diagnosis` : même eyebrow, même nom en stencil, même phrase de réserve.
*Rejeté* : réutiliser `Bottleneck` avec de faux « scores ».

**D19 — Le deck suit la langue de la page.** Pour un deck anglais, l'utilisateur
bascule la page en EN (`LocaleSwitcher`, chargement complet) : ses chiffres le
suivent, `localStorage` est par origine, pas par langue. *Raison* : zéro coût,
zéro doublement du payload. *Rejeté* : un sélecteur de langue du deck (les deux
langues de tout le catalogue en props).

---

## 3. Périmètre

**Dans la v1** : profil libre-service ; 15 chiffres + 3 calculés ; saisie en
comptes, estimation en fourchette, triage des introuvables, demande copiée par
rôle ; peloton + lignes d'étapes + tiroir ; diagnostic, « et si » par étape,
économie unitaire, contrôles de cohérence, rapprochement ; miroir Tour ; deck de
4 à 7 slides + annexe ; PDF, PNG, copie d'image, texte ; export/import JSON,
« tout effacer » ; FR/EN ; drapeau ; canari.

**Hors v1** : voir §15.

---

## 4. Modèle de données

### 4.1 Types (`src/lib/engine/types.ts` — navigateur, aucun import de valeur depuis `content/`)

```ts
import type { Pillar } from "@/lib/scoring/pillars";
import type { GlossaryTermId } from "@/content/glossary-terms"; // type seulement : effacé à la compilation

export const ENGINE_STORAGE_KEY = "tdg.engine.v1";
export const ENGINE_SCHEMA_VERSION = 1 as const;

/** v1 : un seul profil. Les autres existent pour que la v1.1 ne migre rien. */
export type EngineProfile = "selfserve"; // v1.1: | "sales-led" | "consumer-app"   v2: | "marketplace"
export type Currency = "EUR" | "USD" | "GBP" | "CHF";
/** "YYYY-MM", validé par /^\d{4}-(0[1-9]|1[0-2])$/. */
export type YearMonth = string;

export type MetricId =
  | "acq.signup-rate" | "acq.top-channel-share" | "acq.cac"
  | "act.event" | "act.rate" | "act.ttv"
  | "ret.d30" | "ret.logo-churn" | "ret.churn-cause"
  | "ref.mechanism" | "ref.referred-share" | "ref.k-factor"
  | "rev.paid-conversion" | "rev.arpa" | "rev.gross-margin";
export type DerivedId = "rev.ltv" | "rev.cac-payback" | "rev.ltv-cac";

export type ToolId =
  | "ga4" | "mixpanel" | "amplitude" | "posthog" | "stripe" | "chargebee" | "chartmogul"
  | "hubspot" | "salesforce" | "google-ads" | "meta-ads" | "linkedin-ads"
  | "app-store-connect" | "play-console" | "product-db" | "spreadsheet";
export type RoleId = "finance" | "data" | "product" | "marketing" | "revops" | "support";
export type SourceRef = { kind: "tool"; tool: ToolId } | { kind: "person"; role: RoleId } | { kind: "other" };

/**
 * Aucun défaut autre que "todo" : une ligne non regardée est en cours, jamais absente
 * (règle de /admin/audit 1.3a).
 */
export type MetricStatus =
  | "todo"            // pas encore regardé
  | "requested"       // demandé à un rôle, en attente
  | "measured"        // valeur sourcée
  | "estimated"       // fourchette + base, OBLIGATOIRES
  | "conflicting"     // deux lectures qui divergent : se lit comme une fourchette
  | "missing"         // introuvable : cause + coût de réparation OBLIGATOIRES
  | "not-applicable"; // sort du dénominateur, raison fermée OBLIGATOIRE

export type MissingCause = "not-tracked" | "not-computed" | "no-access" | "no-definition";
export type RepairScale = "meeting" | "afternoon" | "sprint" | "quarter";
export type EstimateBasis = "team-hunch" | "old-number" | "sample" | "other";
export type Effort = "self-5min" | "self-1h" | "ask" | "build";

/** Unité portée par le catalogue ; un taux est stocké en comptes ou en pourcentage 0-100. */
export type MetricValue =
  | { kind: "ratio"; numerator: number; denominator: number }
  | { kind: "rate"; percent: number }                     // raccourci : confiance "approximate"
  | { kind: "amount"; amount: number }                    // raccourci ARPA/CAC : confiance "approximate"
  | { kind: "duration"; value: number; unit: "hours" | "days"; statistic: "median" | "mean" }
  | { kind: "text"; text: string }                        // ≤ 120 car. (événement, cause)
  | { kind: "choice"; choice: string };                   // id d'une liste fermée du catalogue

export interface Reading { value: MetricValue; source: SourceRef }

export interface MetricEntry {
  status: MetricStatus;
  value?: MetricValue;             // measured
  source?: SourceRef;              // measured
  variant?: string;                // liste fermée par chiffre (CAC : "media-only" | "plus-team" | "fully-loaded")
  cohortMonth?: YearMonth;         // chiffres de cohorte ; défaut = setup
  estimate?: { low: number; high: number; basis: EstimateBasis }; // unité d'affichage (%, devise, jours)
  conflict?: { a: Reading; b: Reading };
  request?: { role: RoleId; requestedAt: string; remindedAt?: string };
  missing?: { cause: MissingCause; repair: RepairScale; repairComment?: string; ownerRole?: RoleId };
  naReason?: string;               // liste fermée par chiffre
  definitionNote?: string;         // ≤ 200 car. « actif = au moins un projet modifié »
  note?: string;                   // ≤ 400 car. — JAMAIS sur une slide, seulement dans le .json
  updatedAt: string;               // ISO, horloge client
}

export interface Snapshot {
  id: string;                      // crypto.randomUUID()
  referenceMonth: YearMonth;       // les flux
  cohortMonth: YearMonth;          // les colonnes du peloton
  createdAt: string;
  metrics: Partial<Record<MetricId, MetricEntry>>; // absent = "todo"
  /** Cibles d'équipe, unité d'affichage (%, devise). Désignent toujours (D8). */
  targets: Partial<Record<MetricId, number>>;
}

export interface EngineSetup {
  profile: EngineProfile;
  currency: Currency;
  activationWindowDays: 7 | 14 | 30;  // défaut 7 — entre dans la définition d'act.rate
  paidWindowDays: 30 | 60 | 90;       // défaut 30 — entre dans la définition de rev.paid-conversion
  companyLabel?: string;              // ≤ 60 car. — n'apparaît que sur les slides si showCompany
}

export type SlideId = "peloton" | "leak" | "visibility" | "unit-economics" | "mirror" | "ask" | "annex";

export interface EngineAsk {
  what: string;                       // ≤ 120
  cost?: { kind: "money"; amount: number } | { kind: "team"; weeks: number; people: number };
  horizon?: { year: number; quarter: 1 | 2 | 3 | 4 };
  successMetric?: MetricId;
  successTarget?: number;
  bullets: string[];                  // ≤ 3 × 90
  measureFirst: MetricId[];           // ≤ 3 — pré-rempli avec les introuvables les moins chers à réparer
}

export interface EngineDeck {
  include: Partial<Record<SlideId, boolean>>; // défauts en §9.2
  showCompany: boolean;               // défaut true si companyLabel
  showSiteCredit: boolean;            // défaut : question Q2
  ask: EngineAsk;
}

export interface EngineState {
  schemaVersion: typeof ENGINE_SCHEMA_VERSION;
  id: string;
  createdAt: string;
  updatedAt: string;
  lastExportedAt?: string;            // dernier .json téléchargé
  setup: EngineSetup;
  snapshots: Snapshot[];              // v1 : exactement un
  tourLink: { resultId: string; linkedAt: string } | null;
  deck: EngineDeck;
}

/** La valeur stockée sous ENGINE_STORAGE_KEY. */
export interface EngineStore { schemaVersion: 1; state: EngineState }
```

### 4.2 Types dérivés (jamais stockés)

```ts
export interface Interval { lo: number; hi: number }       // mesuré : lo === hi
export type Confidence = "solid" | "approximate" | "unknown";
export type Known =
  | { kind: "known"; value: Interval; confidence: Exclude<Confidence, "unknown"> }
  | { kind: "unknown"; why: "todo" | "requested" | MissingCause | "not-applicable" };

export type CandidateId = "acq.signup-rate" | "act.rate" | "ret.d30" | "rev.paid-conversion" | "ref.referred-share" | "ret.logo-churn";
export interface Comparator { kind: "target" | "reference"; lo: number; hi: number; direction: "higher" | "lower"; term?: GlossaryTermId }
export type Position = "below" | "maybe-below" | "within" | "above" | "no-comparator" | "unknown";

export interface ImpactLine { key: "today" | "if" | "then" | "times"; values: Record<string, string> } // nombres DÉJÀ formatés
export interface Impact {
  metric: CandidateId;
  kind: "new-mrr" | "retained-mrr" | "customers" | "per-hundred";
  from: Interval; to: number;
  customersPerMonth?: Interval;       // payants en plus (flux) ou préservés (churn)
  mrrPerMonth?: Interval;
  mrrAfter12Months?: Interval;        // seulement si le churn est connu
  lines: ImpactLine[];                // la chaîne affichée, recalculable (§6.7)
}

export type DiagnosisState = "clear" | "shared" | "level" | "not-enough";
export interface Diagnosis {
  state: DiagnosisState;
  named: CandidateId[];               // clear : 1 ; shared : tout le groupe ; sinon []
  basis: "mrr" | "relative-gap" | "none";
  belowUnpriced: CandidateId[];       // sous la cible, non chiffrables en € (rétention J30, recommandation)
  blind: MetricId[];                  // ★ ou churn inconnus : « le vrai frein peut s'y cacher »
  positions: Record<CandidateId, { position: Position; comparator?: Comparator; impact?: Impact }>;
}
```

### 4.3 Stockage et fichier

- `src/lib/engine/storage.ts` : `loadEngine(): EngineState | null` (SSR-safe,
  parse défensif : illisible ⇒ `null` + l'îlot propose « Reprendre depuis un
  fichier »), `saveEngine(state): { ok: true } | { ok: false; error: "quota" | "unavailable" }`
  (**jamais avalée**, D15), `clearEngine()`. Lecture **après montage** uniquement
  (leçon d'hydratation de l'étape 4). Écriture à la validation d'un champ
  (`blur`/`change`), pas à chaque frappe. Taille attendue < 15 Ko.
- `navigator.storage.persist()` demandé une fois, au premier enregistrement
  (Chromium/Firefox l'honorent ; aucune requête réseau). Avertissement permanent
  tant que `lastExportedAt` est absent ou antérieur à `updatedAt` : « Ton moteur
  n'existe que dans ce navigateur. Safari efface les données d'un site non
  visité depuis 7 jours. » → [Sauvegarder (.json)].
- `src/lib/engine/io.ts` : `serializeEngine(state)` (JSON indenté, **clés
  triées**, tableaux dans leur ordre — repris de `lib/audit/io.ts`, réécrit,
  pas importé), `parseEngineFile(text): { state: EngineState | null; errors: string[] }`
  qui **ne lève jamais** et rend un état incomplet avec ses avertissements,
  **sauf** version de schéma inconnue (refus explicite). Fichier
  `tdg-moteur-{referenceMonth}.json` / `tdg-engine-{referenceMonth}.json`.
- Migration : une v2 lit `.v1`, écrit `.v2`, **garde `.v1` jusqu'au premier
  export réussi** — on ne détruit jamais la seule copie.
- « Tout effacer » : confirmation en retapant le libellé de l'entreprise, ou
  « EFFACER » / « ERASE » s'il est vide (même garde que la purge de l'audit).

### 4.4 Ce que le serveur passe à l'îlot (props, jamais d'import de contenu côté client)

```ts
// src/lib/engine/strings.ts — types seulement, aucun texte
export type Resolved<T> = T extends { en: string; fr: string } ? string : { [K in keyof T]: Resolved<T[K]> };
export type EngineStrings = Resolved<typeof import("@/content/engine-copy").ENGINE_COPY>; // import type

export interface ResolvedMetric {
  id: MetricId;
  name: string; oneLiner: string; formula: string; trap: string;
  inputs?: { numerator: string; denominator: string };      // libellés des deux comptes
  where: { tool: ToolId; label: string; path: string }[];   // ≤ 3
  request: string;                                          // « ce qu'il faut sortir », gabarit {month}/{cohort}/{n}
  noReferenceReason?: string;                               // pourquoi aucun repère
  benchmarkCaveat?: string;                                 // la réserve imprimée à côté d'un repère
  variants?: { id: string; label: string }[];
  naReasons?: { id: string; label: string }[];
  choices?: { id: string; label: string }[];
  glossaryHref?: string;                                    // localePath(locale, `/glossary/${term}`)
}
export interface ResolvedBridge { questionId: string; question: string; options: { label: string; points: number }[] }
```

La page résout avec un helper générique pur ajouté à `lib/i18n/translatable.ts` :
`resolveTree<T>(tree: T, locale: Locale): Resolved<T>` (récursif sur les
`Translatable`). La **forme** du catalogue (étape, unité, bornes, repères
numériques, effort, sources, rôle, pont Tour) vit côté client dans
`src/lib/engine/catalog-shape.ts`, sans prose ; la **prose** vit côté serveur
dans `src/content/engine-catalog.ts`. Un test vérifie que les deux ont
exactement les mêmes ids.

---

## 5. Catalogue des métriques (profil libre-service)

### 5.1 Structure

15 chiffres, **3 par étape**, un ★ par étape (le chiffre qui porte la colonne du
peloton ou la ligne d'étape) + 3 calculés. « Quinze questions pour la méthode,
quinze chiffres pour la réalité. »

```ts
// src/lib/engine/catalog-shape.ts
export interface MetricShape {
  id: MetricId; stage: Pillar; primary: boolean;
  valueKinds: readonly MetricValue["kind"][];
  unit: "percent" | "money" | "ratio" | "duration" | "text" | "choice";
  bounded: boolean;                     // numérateur ≤ dénominateur
  flow: "month" | "cohort" | "none";    // referenceMonth ou cohortMonth
  window?: "activation" | "paid" | 30;  // fenêtre qui entre dans la définition
  effort: Effort; defaultRole: RoleId; sources: readonly ToolId[];
  glossary: GlossaryTermId; tourQuestionId?: string;
  benchmark?: { term: GlossaryTermId; lo: number; hi: number; direction: "higher" | "lower" }; // contexte, ne désigne jamais (C1)
  defaultRepair: RepairScale;
  dependsOn?: MetricId;                 // act.rate dépend d'act.event
}
export const ENGINE_CATALOG_VERSION = "2026-10";
```

**Effort** (paliers T1-T4 de l'audit, en mots, jamais en codes — leçon du
2026-09-14) : « Seul, 5 min » (un rapport natif) · « Seul, ~1 h » (un filtre,
une cohorte, une exploration) · « À demander » (finance, data, RevOps) · « À
construire » (n'existe nulle part tant que rien n'est instrumenté).

**Politique de repères** : un repère n'existe que s'il est déjà **écrit et
approuvé** dans `glossary-deep.ts` (bons à tirer nº1-5) ; un test vérifie que
ses bornes figurent dans le texte du terme lié, dans les deux langues (§13.1).
Un repère ne désigne jamais (D8, C1) : il est affiché « pour situer, sans
désigner d'étape ». Sans repère, l'écran dit « Pas de repère publiable » + la
raison. Dans les deux cas, seule une cible d'équipe nomme une étape.

### 5.2 Acquisition

| id | Chiffre | Formule (saisie) | Où le trouver | Effort | Repère | Glossaire · Tour |
|---|---|---|---|---|---|---|
| ★ `acq.signup-rate` | Taux d'inscription | inscrits du mois ÷ visiteurs uniques du mois | **GA4** Rapports › Acquisition › Acquisition de trafic, colonne *Utilisateurs* (pas *Sessions*) ; l'inscription en événement clé · **Mixpanel/Amplitude** entonnoir Page vue → Inscription sur le mois · **Base produit** comptes créés sur le mois (plus fiable pour le numérateur) | Seul, 5 min | **contexte** : 2-5 % pour du trafic payant froid, bien plus pour du trafic chaud (`acquisition`) — ne désigne jamais : ton trafic est un mélange | `acquisition` · — |
| `acq.top-channel-share` | Part du premier canal | inscrits du canal nº 1 ÷ inscrits du mois (+ nom du canal, 40 car.) | **GA4** Acquisition d'utilisateurs, dimension *Groupe de canaux par défaut du premier utilisateur* · **HubSpot** propriété *Source d'origine* des contacts créés sur le mois · **Salesforce** champ *Lead Source* | Seul, ~1 h | aucun — part et nom affichés, sans verdict | `acquisition` · `acq-1` |
| `acq.cac` | CAC (variante déclarée) | dépense d'acquisition du mois ÷ nouveaux clients payants du mois ; variante : média seul · + équipe marketing · tout chargé | **Google Ads / Meta Ads Manager / LinkedIn Campaign Manager** coût du mois · **Finance** masse salariale ventes & marketing (variante tout chargé) · **Stripe/Chargebee** abonnements créés et payés dans le mois, hors essais | À demander (finance) | aucun dans l'absolu — jugé via payback et LTV:CAC | `cac` · `acq-3` |

### 5.3 Activation

| id | Chiffre | Formule | Où le trouver | Effort | Repère | Glossaire · Tour |
|---|---|---|---|---|---|---|
| `act.event` | Événement d'activation | le nom de l'action qui marque la première valeur (120 car.) + sa fenêtre (7/14/30 j) | une décision produit : l'équipe produit, pas un outil | Seul, 5 min (ou « À construire ») | — | `aha-moment` · `act-1` |
| ★ `act.rate` | Taux d'activation | inscrits de la cohorte ayant fait l'événement sous *n* jours ÷ inscrits de la cohorte | **Amplitude** Funnel Analysis, Inscription → événement, fenêtre *n* jours · **Mixpanel** Funnels, *conversion window* · **GA4** Explorer › Exploration de l'entonnoir (si l'événement est envoyé) | Seul, ~1 h | **contexte** (ne désigne plus depuis C1) : 20-40 % des inscrits, ordres de grandeur couramment cités pour l'onboarding SaaS, plus bas en essai gratuit (`activation`) | `activation` · `act-2` |
| `act.ttv` | Time-to-value médian | médiane du délai inscription → événement (médiane/moyenne déclarée) | **Amplitude/Mixpanel** vue *time to convert* de l'entonnoir · **GA4** pas de médiane native → à demander à la data | Seul, ~1 h | aucun (le glossaire le dit : une ambition, pas une norme) | `time-to-value` · — |

`act.rate` dépend d'`act.event` : si l'événement est `missing`, la fiche du taux
s'ouvre sur « Il faut d'abord nommer l'événement » et le constat n'est posé
qu'une fois, sur l'événement.

### 5.4 Rétention

| id | Chiffre | Formule | Où le trouver | Effort | Repère | Glossaire · Tour |
|---|---|---|---|---|---|---|
| ★ `ret.d30` | Rétention à J30 | inscrits de la cohorte encore actifs 30 jours après l'inscription ÷ inscrits de la cohorte (« actif » écrit dans `definitionNote`) | **Amplitude** Retention Analysis, événement de départ Inscription · **Mixpanel** Retention · **GA4** Explorer › Exploration de cohortes | Seul, ~1 h | aucun en libre-service (le 20-30 % à J30 du glossaire porte sur les applis grand public) → cible | `retention` · `ret-1` |
| `ret.logo-churn` | Churn logo mensuel | clients payants perdus dans le mois ÷ clients payants au 1er du mois | **Stripe** Billing, vue d'ensemble, churn des abonnés (selon l'offre) · **Chargebee** RevenueStory (selon l'édition) · **ChartMogul / Baremetrics** churn clients | Seul, 5 min | **contexte** (plus bas = mieux ; ne désigne plus depuis C1) : ~1-2 % par mois, jugé sain pour le SaaS B2B à panier élevé ; les petits paniers tournent bien plus haut (ChartMogul : médiane 6,1 %/mois sous 25 $ d'ARPA, 2,2 % au-dessus de 500 $) (`churn`) | `churn` · — |
| `ret.churn-cause` | Cause principale de churn | la cause (120 car.) + comment on la sait : données · entretiens · intuition | **HubSpot/Salesforce** champ raison de perte · relecture des derniers départs avec le support | À demander (support) | — | `churn` · `ret-3` |

### 5.5 Referral

| id | Chiffre | Formule | Où le trouver | Effort | Repère | Glossaire · Tour |
|---|---|---|---|---|---|---|
| `ref.mechanism` | Mécanisme de recommandation | choix : aucun · en communication seulement · dans le produit | l'équipe produit | Seul, 5 min | — | `referral` · — |
| ★ `ref.referred-share` | Part des inscrits recommandés | inscrits arrivés par un utilisateur (code, lien d'invitation, réponse « comment nous as-tu connus ? ») ÷ inscrits de la cohorte | outil de parrainage · table d'invitations · **HubSpot** propriété « comment nous avez-vous connus » ; **piège** : `referral` dans GA4 = site référent, pas recommandation | Seul, ~1 h (ou « À construire ») | aucun (« de presque zéro à la majorité selon le produit ») → cible | `referral` · — |
| `ref.k-factor` | Coefficient viral K | inscrits invités par la cohorte ÷ taille de la cohorte | **Mixpanel/Amplitude** + table d'invitations | À demander (data) | **contexte** : 0,15-0,5 réaliste pour la plupart des produits ; K > 1 durable rare (`viral-coefficient`) | `viral-coefficient` · `ref-3` |

`ref.mechanism = none` ⇒ `ref.k-factor` passe `not-applicable` (raison « pas de
mécanisme d'invitation »), **mais pas** `ref.referred-share` : le bouche-à-oreille
existe sans mécanisme, et ne pas le mesurer est un constat.

### 5.6 Revenue

| id | Chiffre | Formule | Où le trouver | Effort | Repère | Glossaire · Tour |
|---|---|---|---|---|---|---|
| ★ `rev.paid-conversion` | Conversion inscrit → payant | inscrits de la cohorte ayant payé sous *n* jours ÷ inscrits de la cohorte | **Data** jointure base produit × Stripe/Chargebee sur l'identifiant client · **HubSpot/Salesforce** affaires gagnées de la cohorte si une vente intervient | À demander (data) | aucun (« mélange essai, freemium et carte à l'inscription : compare-toi à toi-même ») → cible | `revenue` · — |
| `rev.arpa` | ARPA mensuel | MRR ÷ clients payants | **Stripe** Billing (MRR, clients actifs) · **Chargebee** · **ChartMogul** | Seul, 5 min | aucun (trois ordres de grandeur entre catégories, `arpu`) | `arpu` · — |
| `rev.gross-margin` | Marge brute | (revenu − coût direct de service : hébergement, frais de paiement, support) ÷ revenu | **Finance** | À demander (finance) | **contexte** : 70-85 % en SaaS, bien moins avec de la prestation humaine (`cac-payback`, dans les termes de sa formule — pas dans son bloc `benchmark`) | `cac-payback` · — |

### 5.7 Les trois calculés (jamais saisis)

| id | Formule | Existe si | Repère | Glossaire · Tour |
|---|---|---|---|---|
| `rev.ltv` | ARPA × marge brute × min(1 ÷ churn mensuel, **36**) | ARPA, marge, churn connus ou estimés | durée plafonnée à 36 mois : « la plupart des praticiens plafonnent à trois à cinq ans ; on prend le bas » (`ltv`) | `ltv` · `rev-2` |
| `rev.cac-payback` | CAC ÷ (ARPA × marge brute), en mois | CAC, ARPA, marge | **contexte** : < 12 mois pour un SaaS vendu aux petites entreprises, 18-24 mois en vente entreprise — la vraie comparaison est la trésorerie (`cac-payback`) | `cac-payback` · — |
| `rev.ltv-cac` | LTV ÷ CAC | les deux | **contexte** : autour de 3:1, « un repère, pas une loi » (`ltv`) | `ltv` · — |

Un calculé dont une entrée manque ne s'affiche **jamais 0** : « incalculable —
manque : marge brute ». **Jamais de repli sur le revenu** quand la marge manque
(le glossaire le dit : c'est la version qui flatte).

### 5.8 Les liens glossaire

Chaque chiffre porte `glossary` (tous existent dans les 24 termes de
`glossary-terms.ts`, test). Le lien s'ouvre dans un nouvel onglet
(`target="_blank" rel="noopener"`) : la saisie est persistée à chaque champ, mais
on ne fait pas perdre le fil du tiroir.

---
## 6. Calculs dérivés — purs, déterministes, dans `src/lib/engine/`

Aucun module de `lib/engine` n'importe `lib/scoring/score.ts`, `bottleneck.ts`,
`verdict.ts` ni `next-move.ts` : tous tirent `content/copy-library.ts` en valeur
(vérifié : `lib/scoring/questions.ts` ligne 1). Seuls `lib/scoring/pillars.ts`
et `lib/scoring/compute.ts` (types `Answers`, `AnswerIndex`) sont importables.

### 6.0 Le jeu d'exemple (sert à tous les exemples et aux tests e2e)

Libre-service, `referenceMonth = 2026-08`, `cohortMonth = 2026-07`, EUR,
activation sous 7 j, paiement sous 30 j.

| id | Statut | Valeur saisie |
|---|---|---|
| `acq.signup-rate` | measured · GA4 | 820 inscrits ÷ 26 000 visiteurs (août) |
| `acq.top-channel-share` | measured · GA4 | 410 ÷ 820, « Recherche naturelle » |
| `acq.cac` | measured · finance, média seul | 21 000 € ÷ 42 nouveaux payants (août) |
| `act.event` | measured | « a créé un premier projet », 7 j |
| `act.rate` | measured · Amplitude | 144 ÷ 800 inscrits (juillet) |
| `act.ttv` | estimated · intuition d'équipe | 1 à 3 jours, médiane |
| `ret.d30` | **missing** · not-tracked · un sprint · data | — |
| `ret.logo-churn` | measured · Stripe | 10 perdus ÷ 400 payants au 1er août |
| `ret.churn-cause` | **missing** · no-definition · une réunion | — |
| `ref.mechanism` | measured | dans le produit |
| `ref.referred-share` | measured · table d'invitations | 48 ÷ 800 |
| `ref.k-factor` | **requested** · data · il y a 4 j | — |
| `rev.paid-conversion` | estimated · ancien chiffre | 6 à 9 % |
| `rev.arpa` | measured · Stripe | 48 000 € MRR ÷ 400 |
| `rev.gross-margin` | **missing** · no-access · une réunion · finance | — |

Couverture : **9 sur 15 trouvés · 2 approximatifs · 1 demandé · 3 introuvables**
(9 + 2 + 1 + 3 = 15).

**Cibles de l'équipe fictive** (depuis le 2026-09-30, A7.1) : activation 20 %,
churn logo 2 % par mois (`EXAMPLE_TARGETS`, `lib/engine/example.ts`). Seule une
cible nomme une étape (C1) : sans elles, l'exemple ne nommerait rien. Ce sont
les bornes que les deux repères lui prêtaient, donc son diagnostic (§6.6) ne
change pas, et son bandeau dit à qui sont ces cibles.

### 6.1 Intervalles (`interval.ts`)

- Toute valeur connue devient un `Interval` : mesurée ⇒ `lo = hi` ; estimée ⇒
  `[low, high]` ; `conflicting` ⇒ `[min(a,b), max(a,b)]` ; raccourci `rate`/
  `amount` ⇒ `lo = hi`, confiance `approximate`.
- Arithmétique monotone : `add`, `sub`, `mul`, `div` combinent les bornes aux
  bons coins ; division par un intervalle qui contient 0 ⇒ `unknown`. Bornes
  inversées refusées (`low > high` rejeté à la saisie).
- Toute fonction publique accepte et rend des intervalles ; il n'existe **pas**
  de chemin « scalaire » qui contournerait la propagation.

### 6.2 Formatage (`format.ts`) — la ligne d'honnêteté

Une seule fonction par type de nombre, utilisée par l'écran, les slides et
l'export texte.

| Nombre | Règle | FR | EN |
|---|---|---|---|
| Taux | 2 chiffres significatifs ; ≥ 10 % entier ; < 1 % deux décimales | « 18 % », « 3,2 % », « 0,42 % » | "18%", "3.2%", "0.42%" |
| « Pour 100 » | entier arrondi ; < 0,5 ⇒ « moins de 1 sur 100 (4 sur 1 000) » | « 18 sur 100 » | "18 in 100" |
| Volume amont | 2 chiffres significatifs, préfixe « ~ » | « ~3 200 visiteurs » | "~3,200 visitors" |
| Montant saisi | tel que saisi, groupé | « 21 000 € » | "€21,000" |
| Montant dérivé | 2 chiffres significatifs, préfixe « ~ » | « ~600 € » | "~€600" |
| Fourchette | bornes formatées séparément ; égales après arrondi ⇒ une seule valeur | « 6 à 9 » | "6–9" |
| Durée | entier + unité | « 1 à 3 jours » | "1–3 days" |
| Paire aujourd'hui → avec les « Et si » | les deux côtés gagnent un chiffre, puis un second, tant que leur différence imprimée s'écarte de plus de moitié de l'écart réel (`pairPrecision`) ; au-delà, même texte des deux côtés ⇒ pas d'écart | « ~104 000 € → ~107 000 € », « 96,5 % → 95,9 % » | "~€104,000 → ~€107,000", "96.5% → 95.9%" |

- Français : `Intl.NumberFormat("fr-FR")` puis **U+202F → U+00A0** (Stardos
  Stencil et IBM Plex Mono n'ont pas U+202F — mesuré dans les TTF de `lib/og/fonts`
  et cohérent avec la convention déjà tenue dans la copie du glossaire) ; espace
  insécable U+00A0 avant `%` et `€`.
- **« ≈ » interdit** (absent des trois polices, mesuré) : « ~ » ou « environ ».
- **Petits effectifs** : dénominateur de cohorte < 100 ⇒ bandeau « petits
  effectifs : lis la direction, pas les décimales » (reprend l'idée approuvée
  de `cohort-analysis`) et les taux de cette cohorte n'ont **aucune décimale**.

### 6.3 Cohorte mûre (`cohort.ts`)

`matureCohortMonth(windowDays: number, today: Date): YearMonth` = le dernier
mois M tel que `dernier jour de M + windowDays ≤ today`. `today` injecté.

- Au 24/09/2026 : fenêtre 7 j → août ; 30 j → juillet (31/08 + 30 j = 30/09 >
  24/09) ; 60 j → juin ; 90 j → mai.
- Défaut de `cohortMonth` = `matureCohortMonth(max(30, paidWindowDays), today)`
  (J30 est toujours dans le peloton). Défaut de `referenceMonth` = mois
  précédent `today`.
- Une valeur de cohorte saisie sur un mois plus récent que la cohorte mûre de
  sa fenêtre ⇒ confiance `approximate` + « cohorte pas encore complète ».

### 6.4 Valeurs, confiance, couverture (`values.ts`, `coverage.ts`)

- `knownOf(entry, shape): Known`.
- `confidenceOf` — **dérivée, jamais saisie** :
  - `solid` : `measured`, en comptes (`ratio`/`duration`/`text`/`choice`), source
    = outil, cohorte mûre ;
  - `approximate` : `measured` en raccourci (`rate`/`amount`), ou source =
    personne, ou cohorte immature, ou `estimated`, ou `conflicting` ;
  - `unknown` : `todo`, `requested`, `missing`.
- `coverage(snapshot): { denominator, found, approximate, missing, inProgress }`
  avec `denominator = 15 − not-applicable`, `found = measured`,
  `approximate = estimated + conflicting`, `missing = missing`,
  `inProgress = todo + requested`. **Invariant testé** :
  `found + approximate + missing + inProgress === denominator` pour toutes les
  combinaisons de statuts (leçon du demi-point perdu de l'audit).
- Affichage **toujours en fraction**, jamais en pourcentage de complétude.

### 6.5 Le peloton (`peloton.ts`)

```ts
export interface PelotonColumn {
  metric: "act.rate" | "ret.d30" | "rev.paid-conversion";
  perHundred: Interval | null;        // null = inconnu, jamais 0
  confidence: Confidence;
  sourceLabel: string | null;         // « Amplitude · juillet »
}
export interface Peloton {
  visitorsPerHundred: Interval | null; // 100 ÷ acq.signup-rate
  referredPerHundred: Interval | null; // points rouges dans la grille des inscrits
  columns: PelotonColumn[];            // toujours 3, dans l'ordre act → ret → rev
  chain: "complete" | "gap" | "tail-break" | "empty";
}
```

- `perHundred = round(100 × taux)` borne par borne. Exemple : act 144/800 =
  18 % ⇒ 18 ; paid 6-9 % ⇒ 6 à 9 ; d30 inconnu ⇒ `null` ; visiteurs
  100 ÷ (820/26 000) = 3 171 ⇒ « ~3 200 » ; recommandés 48/800 = 6 %.
- **Pas de chaîne multiplicative** : les trois colonnes portent sur les mêmes
  100 inscrits ; la légende le dit.
- `chain` : `complete` (3 colonnes connues) ; `gap` (une inconnue *entre* deux
  connues — l'exemple) ; `tail-break` (inconnue(s) à la fin) ; `empty`.

### 6.6 Diagnostic (`diagnose.ts`)

**Candidats** : `acq.signup-rate`, `act.rate`, `ret.d30`, `rev.paid-conversion`,
`ref.referred-share` (plus haut = mieux) ; `ret.logo-churn` (plus bas = mieux).

**Comparateur** : la cible d'équipe, sinon aucun (`no-comparator`, exclu du
classement, listé avec « fixes-en une »). Aucun repère du catalogue ne désigne
(décision 5 renversée, C1, 2026-09-29 ; codé le 2026-09-30).

**Position** (valeur `[lo, hi]`, comparateur `[cLo, cHi]` — une cible est
`cLo = cHi`) :
- plus haut = mieux : `below` si `hi < cLo` ; `maybe-below` si `lo < cLo ≤ hi`
  (texte seulement, pas de tampon) ; `within` si `cLo ≤ lo ≤ cHi` ; `above` sinon.
- churn : `below` si `lo > cHi` ; symétrique pour le reste.
- **Une valeur hors de son repère n'est jamais une fuite pour autant** : le
  repère ne compare rien (C1). Seule une cible la rend candidate, et la phrase
  dit « sous ta cible », jamais « sous le repère ».

**Impact en €** (`impact.ts`, énoncé « toutes choses égales par ailleurs ») :
- *N* = nouveaux payants par mois : le dénominateur mesuré d'`acq.cac` s'il
  existe, sinon `inscrits du mois × rev.paid-conversion` (approximatif), sinon
  inconnu.
- Flux (`acq.signup-rate`, `act.rate`, `rev.paid-conversion`) :
  `payants en plus = N × (t ÷ taux − 1)` avec `t` = la cible d'équipe. Pour
  `act.rate`, l'hypothèse « les payants sont parmi les activés » est
  **imprimée** sous le calcul.
- Churn : `clients préservés = base au 1er × (churn − t)` avec `t` = la cible.
- `× ARPA` ⇒ MRR/mois (`new-mrr` ou `retained-mrr`). ARPA inconnu ⇒ impact en
  clients/mois (`customers`). *N* inconnu ⇒ impact pour 100 inscrits
  (`per-hundred`).
- `ret.d30` et `ref.referred-share` : **jamais chiffrés en €** en v1 (il faudrait
  modéliser la rétention et la boucle) ⇒ `belowUnpriced`.
- Ligne annuelle, seulement si le churn est connu :
  `Σ_{k=0}^{11} impact × (1 − churn)^k`, dite « MRR de plus au bout d'un an,
  churn compris ».

**Équivalence à épingler** : pour les trois flux, l'impact vaut
`N × (t/r − 1)` — même *N* pour tous. Classer en € ou par écart relatif `t/r`
donne **le même ordre** ; l'ARPA ne sert qu'à comparer un flux au churn. Sans
ARPA, les flux se classent par écart relatif (`basis: "relative-gap"`) et le
churn est listé à part « non comparable sans ARPA ». Un test le vérifie sur une
grille de valeurs.

**États**, décidés dans cet ordre :
1. `not-enough` — moins de 2 candidats ont une valeur connue **et** un
   comparateur, c'est-à-dire une cible. Si l'un d'eux est `below`, il est
   rapporté (« {étape} est sous la cible. Sans cible sur les autres étapes,
   impossible de dire si c'est la plus grosse fuite »).
2. `level` — aucun candidat `below`.
3. `clear` — un seul `below` chiffrable, ou le premier chiffrable a
   `lo > second.hi × CLEAR_MARGIN` (1,25). Si les seuls `below` sont non
   chiffrables et qu'il n'y en a qu'un, il est `clear`.
4. `shared` — sinon ; **tout le groupe** dont l'intervalle atteint
   `top.lo ÷ 1,25` est nommé, jamais plafonné à deux (même écart assumé que
   `lib/scoring/bottleneck.ts` contre son `.d.ts`).

**Superposition `blind`** : tout ★ (`act.rate`, `ret.d30`,
`rev.paid-conversion`, `ref.referred-share`, `acq.signup-rate`) ou
`ret.logo-churn` dont la valeur est inconnue ⇒ listé ; phrase obligatoire sous
le diagnostic : « {étapes} n'{est|sont} pas mesurée(s) : le vrai frein peut s'y
cacher. »

Et une phrase fixe, affichée une fois, qui répond à la première objection d'un
CODIR : « La plus grosse perte en nombre est toujours en haut du tunnel ; ce
n'est pas ce qui désigne un frein. »

**Exemple (§6.0)** : `act.rate` 18 % < 20 % (cible de l'équipe fictive) ⇒ `below` ; churn 2,5 % >
2 % ⇒ `below`. *N* = 42 (mesuré). Activation : 42 × 20/18 = 46,7 ⇒ affiché
« 47 (+5) », × 120 € = 600 € ⇒ « ~600 € ». Churn : 400 × (2,5 % − 2 %) = 2
clients ⇒ 2 × 120 = 240 € ⇒ « ~240 € ». 600 > 240 × 1,25 = 300 ⇒ `clear`,
nommé : Activation. `ret.d30` inconnu ⇒ `blind = ["ret.d30"]`. Annuel (churn
2,5 %) : 600 × (1 − 0,975¹²) ÷ 0,025 = 600 × 10,48 = 6 288 ⇒ « ~6 300 € de MRR
de plus au bout d'un an ». (Avec un churn à 3 %, préservés = 4, 480 € : 600 >
480 × 1,25 = 600 est **faux** ⇒ `shared` — la borne du test.)

### 6.7 « Et si » (`impact.ts#whatIf`)

*Depuis le 2026-09-26, le panneau « Et si » n'utilise plus cette fonction :
il lit `scenario.ts` (plusieurs leviers à la fois, voir le bloc en tête).
Ce qui suit reste vrai pour la slide `leak`.*

`whatIf(state, candidate, target): Impact` — la même fonction pour le tiroir et
pour la slide `leak`.

- Curseur par étape dans le tiroir. Position de départ : la cible si elle
  existe ; sinon la borne basse du repère si la valeur est dessous ; sinon la
  valeur actuelle (**aucun gain affiché tant que l'utilisateur n'a pas bougé**).
  Pas : 1 point au-dessus de 10 %, 0,1 point en dessous. Churn : vers le bas.
- **Les quatre lignes affichées sont calculées à partir des nombres affichés** :
  `Aujourd'hui` (taux affiché, *N* affiché) → `Si` (cible affichée) →
  `Alors` (`round(N × t/r)` et l'écart entier) → `× ARPA` (écart entier × ARPA
  affiché, puis arrondi à 2 chiffres significatifs avec « ~ »). Chaque ligne se
  refait à la calculette depuis la précédente. Écart < 1 client ⇒ « moins d'un
  client de plus par mois » et pas de montant.
- Phrase fixe sous le résultat : « Dans un funnel, les taux se multiplient :
  +20 % sur n'importe quelle étape donne +20 % de clients. Ce qui distingue les
  étapes, c'est l'écart à leur cible. » et « Un calcul, pas une prévision. »
- **Titre et corps de la slide `leak` sont produits par la même fonction depuis
  le même `Impact`** (test : les deux chaînes rendues contiennent la même
  fourchette formatée).

### 6.8 Économie unitaire (`unit-economics.ts`)

LTV, payback, LTV:CAC (§5.7) en intervalles. Variante du CAC toujours écrite
(« CAC média seul » ≠ « CAC tout chargé »). Exemple : marge inconnue ⇒ payback
et LTV incalculables ; la tentation de prendre le revenu (500 ÷ 120 = 4,2 mois,
flatteur) est **refusée** et le constat dit pourquoi.

### 6.9 Contrôles de cohérence (`sanity.ts`) — « à vérifier », jamais bloquants (D11)

| Id | Condition | Message |
|---|---|---|
| `num-gt-den` | numérateur > dénominateur (taux borné) | **bloque l'enregistrement** : « Plus de {num} que de {den} : un des deux n'est pas le bon. » |
| `retained-gt-activated` | `ret.d30` > `act.rate` (pour 100) | « Plus d'actifs à J30 que d'activés : ta définition d'activation est peut-être trop stricte. » |
| `paid-gt-retained` | `rev.paid-conversion` > `ret.d30` | « Plus de payants que d'actifs à J30 : paiement annuel d'avance ? » |
| `churn-high` | churn mensuel > 30 % | « C'est bien un churn mensuel ? » |
| `margin-odd` | marge > 95 % ou < 0 | « Vérifie ce qui est compté dans les coûts directs. » |
| `ttv-mean` | statistique `mean` | « Une moyenne baisse quand les traînards abandonnent : prends la médiane. » |
| `cohort-mismatch` | colonnes du peloton sur des mois différents | « Les colonnes du peloton ne portent pas sur la même cohorte. » |
| `reconcile-gap` | `inscrits du mois × rev.paid-conversion` vs *N* mesuré : ratio entièrement hors de [0,67 ; 1,5] | « Ta chaîne prédit ~{p} nouveaux payants en {mois} ; ta facturation en compte {n}. Au moins une définition ne porte pas sur la même population. » |

Exemple : 820 × 6-9 % = 49 à 74 prédits contre 42 comptés ⇒ ratio [0,57 ;
0,86], chevauche la bande ⇒ pas d'alerte.

### 6.10 Constats (`findings.ts`) — liste fermée, un rang, zéro texte généré par un modèle

| kind | Déclencheur | Rang |
|---|---|---|
| `chain-break` | un ★ du peloton inconnu | 1 |
| `no-definition` | cause `no-definition` | 2 |
| `blind-spot` | pont Tour à 20 pts + chiffre `missing` | 2 |
| `below-comparator` | diagnostic `clear`/`shared` | 2 |
| `conflict` | `conflicting` | 3 |
| `unit-econ-uncomputable` | un calculé incalculable | 3 |
| `reconcile-gap` | §6.9 | 3 |
| `small-cohort` | dénominateur < 100 | 4 |
| `hidden-knowledge` | pont Tour à 0 pt + chiffre `measured` (le constat positif) | 4 |

Les phrases viennent de gabarits résolus serveur (§14.9). Règle de rédaction :
**aucune phrase n'affirme une cause** (« l'activation est sous son repère et la
complétion de l'onboarding n'est pas suivie », jamais « c'est l'onboarding »).

### 6.11 Pont avec le Tour (`bridge.ts`)

Seulement là où la question du Tour porte **littéralement** sur le fait de
mesurer ce chiffre (règle `tourQuestionId` de l'audit), huit ponts :

| Question | Chiffre |
|---|---|
| `acq-1` canal principal identifié et mesuré | `acq.top-channel-share` |
| `acq-3` CAC connu, même approximativement | `acq.cac` |
| `act-1` moment clé défini | `act.event` |
| `act-2` % qui atteint ce moment | `act.rate` |
| `ret-1` taux de rétention suivi | `ret.d30` |
| `ret-3` cause principale de churn connue | `ret.churn-cause` |
| `ref-3` coefficient viral mesuré | `ref.k-factor` |
| `rev-2` LTV connue | `rev.ltv` (calculé) |

Déclaré (points de l'option choisie, lus via `answers[questionId]` → index →
`points` résolus serveur) : 20 → suivi, 7 → approximatif, 0 → inconnu. Trouvé :
`measured` → suivi, `estimated`/`conflicting` → approximatif, `missing` →
inconnu, `todo`/`requested`/`not-applicable` → **pas de verdict**.

| Déclaré \ Trouvé | suivi | approximatif | inconnu |
|---|---|---|---|
| suivi | cohérent | angle mort léger | **angle mort** |
| approximatif | mieux que déclaré | cohérent | angle mort léger |
| inconnu | mieux que déclaré | mieux que déclaré | lacune connue |

Le plus récent résultat de `tdg.results.v1` **qui porte `answers`**, affiché avec
sa date ; lecture seule (aucune écriture dans les clés du Tour) ; si le résultat
disparaît, le miroir disparaît et le dit.

### 6.12 Le deck (`deck.ts`) — sélection et gabarits, sans texte

`buildDeck(state, derived): DeckModel` choisit les slides, leur ordre, le
gabarit de titre de chacune (une clé, pas une phrase) et **tous les nombres déjà
formatés**. Les composants de slide ne font que placer ces chaînes. Règles §9.

### 6.13 Demande copiée (`request.ts`)

`buildRequest(role, metrics, strings, state): string` — un message par rôle
listant tous les chiffres à lui demander, avec période et définition. **Aucune
valeur saisie** n'y figure ; seule la `definitionNote` de l'utilisateur (son
propre texte) peut y être reprise. Le clic passe les chiffres concernés en
`requested` avec `requestedAt`. À relancer au-delà de **5 jours**, horloge qui
repart à la relance (`remindedAt`) — reprise de `lib/audit/tracking.ts`, pour la
même raison.

---
## 7. Parcours, écran par écran (390 et 1280)

Une seule route ; l'îlot porte une petite machine à états
`view: "setup" | "board" | "collect" | "deck"` (comme `/quiz`, pas d'URL par
écran ; l'écran courant n'est pas persisté — rouvrir coûte un clic, la saisie,
elle, l'est). Lecture de `localStorage` **après montage** : le HTML serveur est
l'état vide, identique au premier rendu client.

### E0 — La page (prérendue, visible sans JavaScript, indexée)

- `ContentHeader` (wordmark + `LocaleSwitcher`), `SiteFooter` en bas.
- Eyebrow « Le moteur », H1 « Ton moteur de growth », ligne de
  positionnement « Ton Tour dit si tu mesures. Le moteur montre ce que disent tes
  chiffres. » (copie de `copy-review.md` §4.3, à relire).
- **La promesse de confidentialité**, dans une `Card` bord plein, avant le CTA,
  jamais repliable (D16) : « Aucun chiffre ni aucun texte que tu saisis ne quitte
  ton navigateur. Pas de compte, pas de serveur : ils restent sur cet appareil,
  et tu peux le vérifier dans l'onglet Réseau. La page compte ses visites, sans
  cookie — jamais ce que tu y écris. »
- CTA `Button` primaire « Entre tes chiffres → » (le seul rouge plein de
  l'écran), mention « Gratuit, sans compte. Tout reste sur ton appareil. » ;
  secondaire, si aucun Tour sur l'appareil (connu seulement après montage — le
  lien est donc rendu par l'îlot), « Faire le Tour d'abord (3 min) » : `Button
  hard` vers `/quiz` (`cross-root-links.test.ts`).
- Contenu statique indexable, rendu par le serveur depuis le catalogue résolu :
  « Les quinze chiffres » par étape (nom, formule, où le trouver, lien
  glossaire), puis une FAQ de cinq questions (§14.12). C'est aussi ce qu'un
  visiteur sans JS lit.
- 390 : pile, CTA pleine largeur. 1280 : colonne de lecture (`--width-reading`).

### E1 — Réglage (première visite ; une carte, ≤ 560 px, identique aux deux largeurs)

1. **Modèle** : `Segmented` avec une seule option active « SaaS / produit web en
   libre-service » ; les trois autres affichées **désactivées** avec
   « bientôt — leur funnel n'a pas la même forme ».
2. **Mois des flux** (défaut : dernier mois clos) et **cohorte suivie** (défaut :
   la cohorte mûre, avec la phrase « On suit les inscrits de juillet : ceux
   d'août n'ont pas encore eu 30 jours. »).
3. **Devise** (EUR/USD/GBP/CHF), **fenêtre d'activation** (7/14/30 j), **fenêtre
   de paiement** (30/60/90 j).
4. **Nom affiché sur les slides** (facultatif, 60 car., « reste sur cet
   appareil »).
5. Si un Tour avec réponses est sur l'appareil : « Tu as fait le Tour le 12/09
   (58/100). On comparera ce que tu y as déclaré à ce que tu retrouves ici. »
   (case cochée par défaut, décochable ; on dit qu'on lit, on ne copie rien).
- « Commencer → » crée l'état, l'écrit, passe à E2 ; focus sur le H2 d'E2 (R-19).

### E2 — Le moteur (l'écran principal)

Maquette : `spec-probe/board-1280.png`, `spec-probe/board-390.png`.

De haut en bas :
1. Eyebrow « Ton moteur de growth · libre-service · cohorte de juillet 2026 ·
   flux d'août 2026 ».
2. **Titre-verdict** en stencil (`--display-hero-mobile` sur les deux largeurs —
   le hero plein est réservé à la landing) : la phrase du peloton (§9.3, slide 1),
   dernier segment en `--paint-red` (texte large, 3,57:1 sur `--paper-1` ≥ 3:1).
3. **Couverture** en puces : plein « 9 chiffres sur 15 trouvés » · pointillé
   « 2 approximatifs » · pointillé « 1 demandé » · rouge « 3 introuvables ». Jamais
   de pourcentage.
4. **Barre d'onglets** `Segmented` : « Le moteur » / « À aller chercher ({n}) »
   (→ E4), `n` = chiffres `todo` + `requested` (1 dans l'exemple). Sur mobile elle reste sous la couverture.
5. **Diagnostic** (grammaire `Bottleneck`, composant local, D18) : eyebrow
   « Une étape freine le moteur » / « {n} étapes freinent autant » / « Rien ne
   freine » / « Pas assez de repères pour conclure » ; nom d'étape en stencil ;
   phrase du comparateur ; phrase `blind` ; phrase fixe « la plus grosse perte en
   nombre est toujours en haut ».
6. **Le peloton** (§8.1) dans une `Card` `elevation="raised"`.
7. **Les cinq lignes d'étapes** (§8.2), dans l'ordre AARRR ; chaque ligne est un
   `<button aria-expanded aria-controls>` qui ouvre le tiroir de l'étape.
8. **Déclaré × mesuré** (si Tour relié, §8.5).
9. **Barre d'actions** : « Préparer mes slides → » (primaire), « Sauvegarder
   (.json) », « Importer », « Tout effacer » (quiet).
10. **Bandeau de sauvegarde** tant que non exporté (§4.3).

1280 : peloton pleine largeur (4 grilles ≈ 210 px), puis grille
`minmax(0,1.3fr) minmax(0,1fr)` : lignes à gauche, **tiroir collant** à droite
(`position: sticky; top: 16px`) montrant l'étape sélectionnée (Activation par
défaut si elle est nommée par le diagnostic, sinon la première étape à
compléter). 390 : peloton en une ligne par colonne (mini-grille 118 px à gauche,
nombre + libellé + source à droite), lignes pleine largeur, **tiroir déplié sous
la ligne** (pas de modale, pas de feuille du bas).

### E3 — Le tiroir d'une étape et la fiche d'un chiffre

Tiroir = eyebrow « Étape 2 / 5 · Activation », titre stencil, puis les trois
chiffres de l'étape (le ★ d'abord), chacun en `Disclosure` ouvert pour le ★,
fermé pour les deux autres. Focus au titre du tiroir à l'ouverture, retour à la
ligne à la fermeture (R-19).

**La fiche d'un chiffre**, dans cet ordre :
1. Nom, badge d'effort (« Seul, ~1 h »), lien « Définition → » (glossaire,
   nouvel onglet).
2. **La formule** en mono sur `--surface-sunken`, fenêtre comprise.
3. **La cohorte à prendre** (pour les chiffres de cohorte) : « Prends la cohorte
   de juillet : celle d'août n'a pas encore eu 30 jours. »
4. **Statut** — `Segmented` 2×2, rien de présélectionné : « Je l'ai » · « Je peux
   l'estimer » · « Je le demande » · « Je ne le trouve pas ».
   - **Je l'ai** : les deux comptes (`inputmode="numeric"`, séparateurs acceptés
     puis normalisés), « sur » entre les deux ; le taux calculé **en direct** en
     dessous : « 18 %, soit 18 sur 100 inscrits » ; la source (liste d'outils +
     « quelqu'un me l'a donné » + « autre ») ; la variante fermée s'il y en a une ;
     lien discret « Je n'ai que le taux » (bascule vers le raccourci
     approximatif) ; `definitionNote` facultative (200 car.).
   - **Je peux l'estimer** : bas / haut + base (intuition d'équipe · ancien
     chiffre · échantillon · autre). Refus si bas > haut ; si haut ÷ bas > 3 :
     « Une fourchette aussi large ne dit presque rien — c'est déjà une
     information. »
   - **Je le demande** : le rôle (pré-rempli avec `defaultRole`), bouton
     « Copier la demande » (§6.13) ; le chiffre passe `requested`.
   - **Je ne le trouve pas** : le triage (E3bis).
5. **Où le trouver** (`Disclosure` ouvert la première fois, fermé ensuite) : ≤ 3
   outils, un chemin chacun ; le piège ; « Aussi dans Stripe : ARPA, churn »
   (liens internes vers les fiches qui partagent une source).
6. **Repère et cible** : la bande de comparaison (§8.3) avec la réserve, ou « Pas
   de repère publiable : {raison} » ; champ « Ta cible » (facultatif).
7. **Et si** (★ seulement, dès qu'un comparateur existe) : curseur + les quatre
   lignes (§6.7), carte `Card tone="outlineAlert"`.
8. **Déclaré au Tour** (si pont) : encadré « Au Tour : « Oui, un chiffre
   solide » (20 pts). Ici : introuvable. » → étiquette « Angle mort ».
9. Note locale (400 car., « jamais sur une slide »).

**Enregistrer** : désactivé tant qu'aucun statut ; les impossibles (§6.9)
bloquent avec le message sous le champ ; le reste s'affiche « à vérifier » sans
bloquer. Une écriture qui échoue s'affiche sous le bouton (D15).

**E3bis — « Je ne le trouve pas »** : une question, « Pourquoi ? », cinq réponses
fermées, chacune produit un statut et un constat :

| Réponse | Statut | Coût proposé (modifiable, échelle fermée) |
|---|---|---|
| « On ne le mesure pas » | `missing` · `not-tracked` | du catalogue (souvent « un sprint ») |
| « Ça existe, mais personne ne l'a calculé » | `missing` · `not-computed` | « une après-midi » |
| « Ça existe, mais je n'y ai pas accès » | `missing` · `no-access` + rôle | « une réunion » ; propose « Copier la demande » |
| « Personne n'est d'accord sur la définition » | `missing` · `no-definition` | « une réunion » ; lien vers la définition du glossaire |
| « J'ai deux chiffres qui ne collent pas » | `conflicting` (les deux lectures et leurs sources) | « une après-midi » |
| « Ça ne s'applique pas à nous » | `not-applicable` + raison fermée | — (sort du dénominateur) |

Mobile : la fiche remplace le contenu du tiroir déplié ; « Enregistrer » en bas
de la fiche (pas collé à l'écran : la fiche est courte).

### E4 — « À aller chercher » (la collecte qui se planifie)

Deux listes, déterministes :
- **À faire toi-même** : chiffres `todo` groupés par badge d'effort (« Seul,
  5 min » d'abord), chacun avec « Renseigner » (ouvre sa fiche dans E2).
- **À demander** : groupés **par rôle** (finance, data, produit…) ; un bouton
  « Copier une demande pour les {n} chiffres » par rôle ; les demandes de plus de
  5 jours remontent en tête avec « à relancer » et un bouton « Relancer »
  (recopie le message, met `remindedAt`).
- Ligne d'aide en tête : « Lance les demandes aujourd'hui, remplis le reste en
  attendant. »
- 1280 : deux colonnes. 390 : les deux listes l'une sous l'autre, « À demander »
  en premier (ce sont les plus longues à revenir).

### E5 — Les slides

- Vignettes 16:9 : les slides rendues **à taille réelle** (1920×1080) dans un
  conteneur mis à l'échelle par `transform` ; case « Inclure » par slide ;
  numérotation recalculée.
- Au-dessus : « {n} points à vérifier avant de projeter » (liste des
  contrôles §6.9 non résolus, D11), et la phrase « Ces fichiers contiennent les
  chiffres que tu as saisis. »
- Formulaire **Ce que tu demandes** (slide `ask`) : quoi (120), coût (montant
  **ou** « {semaines} semaines d'une équipe de {k} »), horizon (trimestre),
  métrique de succès et cible (pré-remplies depuis le diagnostic et le
  « et si »), 3 puces (90), « Ce qu'il faut d'abord mesurer » (cases, ≤ 3,
  pré-cochées avec les introuvables les moins chers). Aperçu live du titre.
- Bascules : « Nom de l'entreprise sur les slides », « Mention
  tourdegrowth.com » (défaut : Q2), « Slide Déclaré × mesuré » (décochée,
  D13).
- Actions : par vignette « Image (PNG) » et « Copier l'image » (si
  `ClipboardItem` existe) ; pour le deck « Télécharger le PDF », « Copier le texte
  et les notes », « Sauvegarder (.json) ». Option « Haute définition » (PNG
  3840×2160).
- 390 : vignettes empilées ; le PDF est annoncé « plus fiable depuis un
  ordinateur » (feuille d'impression iOS imprévisible) mais pas bloqué ; le PNG
  marche partout. 1280 : grille 2 colonnes, aperçu agrandi au clic.

### E6 — Revenir

Au retour (état présent), l'îlot saute à E2 et affiche en tête une bande de
reprise calculée : « Tu as trouvé 9 chiffres sur 15. Depuis ta dernière visite
(il y a 3 jours) : 1 demande à relancer (Data, coefficient viral). » →
[Reprendre] (ouvre le premier chiffre `todo` le moins cher, jamais « le dernier
écran visité » : une seule source de vérité, comme la reprise du quiz) ·
[Relancer la data].

### E7 — Changer d'appareil, recommencer

Import d'un `.json` : écran de confirmation avec aperçu (« Mon produit · août
2026 · 9 sur 15 ») et, si un moteur existe déjà, « Remplacer » / « Annuler » (pas
de fusion en v1). « Tout effacer » : confirmation retapée (§4.3).

---

## 8. Visualisation

### 8.1 Le peloton (`_engine/Peloton.tsx`)

Référence visuelle : `shots/peloton.png` (slide) et `spec-probe/board-*.png`
(écran).

- **Ligne amont** : flèche **SVG** (jamais un glyphe) + « ~3 200 visiteurs du
  mois pour 100 inscrits · GA4 · août ».
- **Quatre colonnes** : Inscrits (100, dont les recommandés en points
  `--paint-red`), Activés, Actifs à J30, Payants à J{n}. Ordre dans chaque
  colonne : **numéral stencil → libellé → grille 10 × 10 → source**. (Ma maquette
  a mis le numéral sous la grille et il touche les points : l'ordre de la slide
  est le bon.)
- **États d'un point** : mesuré (`--ink-0` plein) · recommandé (`--paint-red`
  plein, grille des inscrits seulement) · fourchette (hachuré `--ink-1`, de *lo*
  à *hi*) · vide (contour `--ink-1` 1,5 px) · inconnu (toute la grille en
  pointillé `--paint-red`, « ? » stencil `--paint-red-deep` **sur un disque
  papier** pour ne pas chevaucher les points).
- **Leak** : la colonne de l'étape nommée reçoit le tampon « Sous le repère » /
  « Sous ta cible » (grammaire `StampedPillar`, rotation −1,5°).
- **Tailles** : desktop points ≈ 17 px, gap 4 px, grille ≤ 210 px ; mobile
  mini-grille 118 px (points ≈ 9,6 px, gap 2 px) à gauche, texte à droite —
  mesuré lisible et sans débordement à 390 (`spec-probe/board-390.png`).
- **Légende** : recommandé · mesuré · fourchette estimée · non mesuré. Phrase :
  « Chaque colonne est comptée sur les mêmes 100 inscrits. »
- **Accessibilité** : chaque grille `role="img"` avec un `aria-label` complet
  (« 18 sur 100 inscrits activés sous 7 jours — mesuré, Amplitude, cohorte de
  juillet ») ; les points `aria-hidden` ; un `<table>` visuellement masqué
  reprend les quatre colonnes (nombre, statut, source). Contraste des marques :
  `--ink-0` 16:1, `--paint-red` 4,42:1 sur `--paper-0` (≥ 3:1, WCAG 1.4.11).

### 8.2 La ligne d'étape (`_engine/StageRow.tsx`)

*Remplacée le 2026-09-26 par les onglets d'étape (`stage-tabs.ts`,
`StageTabs.tsx`, voir le bloc en tête) ; les pastilles et les états
ci-dessous vivent maintenant dans l'onglet et en tête de son panneau.*

`[nom d'étape stencil + 3 pastilles de statut] · [comparateur en texte] · [valeur
stencil + libellé mono]`.

- **Pas de jauge dans la ligne** : les taux vivent dans des décades différentes
  (3 % contre 18 %), et une jauge par ligne impose des domaines différents qui
  invitent à comparer des longueurs — exactement le risque que l'angle Funnel a
  documenté après l'avoir dessiné. La bande de comparaison est dans le tiroir,
  avec ses bornes écrites (§8.3).
- **Pastilles** (12 px) : plein = trouvé · hachuré = approximatif · pointillé
  rouge = introuvable · contour = en cours · tiret = sans objet ; `aria-hidden`,
  doublées d'un texte masqué « 2 trouvés, 1 introuvable ».
- **États de la ligne** (jamais par la couleur seule, WCAG 1.4.1) :

| État | Rendu | Texte toujours présent |
|---|---|---|
| Sous la référence/cible | fond `--surface-alert`, bord `--paint-red`, tampon | « sous le repère » / « sous ta cible » |
| Peut-être sous | bord pointillé `--ink-1` | « peut-être sous le repère » |
| Dans / au-dessus | fond carte | « dans le repère » / « au-dessus du repère » |
| Sans comparateur | fond carte | « sans repère · fixe une cible » |
| ★ inconnu | valeur « ? » en `--text-alert` | la cause (« non mesuré », « pas d'accès »…) |
| À renseigner | valeur « — » | « à renseigner » |

- Texte rouge sous 24 px : **`--paint-red-deep`** (`--text-alert`, 5,28:1 sur
  `--paint-red-wash`) ; `--paint-red` seulement pour le texte large et les
  marques.

### 8.3 La bande de comparaison (dans le tiroir)

Piste `--surface-sunken` de 12 px ; domaine `[0, d]` avec
`d` = le plus petit de {5 %, 10 %, 20 %, 50 %, 100 %} contenant
`max(valeur haute, comparateur haut) × 1,2` — **bornes écrites aux deux bouts**
(« 0 » … « 50 % »). Bande du repère dessinée **au-dessus** de la valeur
(pointillé `--ink-1`, fond translucide) ; valeur = repère vertical 4 px
(`--ink-0`, `--paint-red` si sous) ou segment hachuré si fourchette. Cible =
trait plein `--ink-0` étiqueté « ta cible ». Jamais d'étiquette dans la piste.
`aria-hidden` + phrase textuelle adjacente.

### 8.4 Le diagnostic (`_engine/Diagnosis.tsx`)

Bloc sous la couverture : eyebrow mono, nom(s) d'étape en stencil (30 px mobile,
36 px desktop, `--paint-red` — texte large), phrase du comparateur, phrase
`blind` en `--text-alert`, `belowUnpriced` (« Aussi sous ta cible, non chiffré en
€ : rétention »). `level` et `not-enough` en `--ink-0`, sans rouge (le rouge plein
reste un diagnostic).

### 8.5 Déclaré × mesuré (`_engine/Mirror.tsx`)

Compteurs en stencil par verdict (angles morts d'abord, carte `tone="alert"`),
puis une carte par pont non cohérent citant **la réponse du Tour mot pour mot** et
le statut trouvé. Pont cohérent : un compteur, pas de carte. Sans Tour : une
ligne « Fais le Tour pour comparer ce que ton équipe déclare à ce que tu
trouves » (`Button hard` vers `/quiz`).

**Tour présent mais non relié — tranché par Antoine le 2026-09-29
(`CHANTIERS.md` C8).** Jusque-là, rien ne s'affichait : c'était « leur choix »
(D13). Mais la case « Comparer avec ce Tour » n'existe que sur la carte de
départ, et l'invitation « Fais le Tour » menait donc à une impasse : Tour
fait, retour au tableau, miroir disparu, et aucun moyen de le relier.
Désormais :
- à la place du miroir, **une ligne et un bouton** : « Tu as fait le Tour le
  {date} ({score}/100). Le relier compare ce que tu y as déclaré à ce que tu
  retrouves ici. » et « Relier ce Tour », dans le style de l'invitation sans
  Tour ;
- la case de liaison entre aussi **dans les Réglages**, pour relier ou délier
  après coup.

**Codé le 2026-09-30 (A7.5)** : `Mirror` a un troisième état,
`data-state="unlinked"` (date et score du Tour, bouton « Relier ce Tour »,
qui pose `tourLink` et compte `engine_tour_linked`). Les Réglages portent la
case : cochée, elle garde le lien existant ou relie ce Tour ; décochée, elle
délie, et une ligne dit que le Tour reste sur l'appareil.

### 8.6 Ce qu'on ne dessine volontairement pas

Pas de score global ni de note sur 100 (le seul /100 du produit est le Tour) ;
pas d'entonnoir à largeurs proportionnelles ni logarithmiques ; pas de feu
tricolore ni de vert (absent de la marque, et un vert sur une estimation serait
une fausse assurance) ; pas d'emoji (le 🔥 appartient au roast) ; aucun glyphe
de flèche, de coche ou de puce ronde (§10.4).

---

## 9. Le deck CODIR / COMEX

### 9.1 Format commun

- 1920 × 1080 px CSS (16:9) ; marges 120 × 96 ; fond `--paper-1` avec le
  dégradé `--ground-lift` (comme `peloton.png`) ; tokens CSS de l'app (on est dans
  le DOM, pas dans Satori : aucune copie hex).
- **Kicker** mono 20 px, tracking 0,12em : « Moteur de growth · {entreprise ·}
  {mois} · données internes » ; numéro « {i}/{N} » à droite.
- **Pastille de données**, bord pointillé `--ink-1`, sur chaque slide : « Données :
  {m} mesurées · {a} approximatives · {x} introuvables ».
- **Titre** en Stardos Stencil 72-84 px, une phrase complète qui contient le
  chiffre ; accent en `--paint-red` (texte large). Un titre, un message, un
  visuel.
- **Pied** mono 18 px : « Cohorte d'inscrits de {mois} · flux de {mois} · sources :
  {outils} » ; à droite « tourdegrowth.com » si `showSiteCredit`.
- **Jamais** : score du Tour (sauf slide `mirror` opt-in, en pied), nom
  d'Antoine, id de résultat, note locale de collecte, note ou score composite,
  zone verte/rouge sans comparateur, repère non validé, roast.

### 9.2 Sélection et ordre (`deck.ts`, déterministe)

| Slide | Présente si | Défaut « inclure » |
|---|---|---|
| `peloton` | toujours | oui |
| `leak` | diagnostic `clear`, `shared`, `level`, ou `not-enough` avec un `below` | oui |
| `visibility` | toujours | oui |
| `unit-economics` | CAC connu, ou un calculé calculable | oui |
| `mirror` | Tour relié | **non** (D13) |
| `ask` | toujours | oui |
| `annex` | toujours | oui |

Ordre normal : peloton → leak → visibility → unit-economics → mirror → ask →
annex. L'annexe court sur **deux pages ou plus** depuis le 2026-09-29 (A2.1 :
rien sous 18 px sur une slide) : `annex`, `annex:2`…, une seule case
« inclure » pour toutes (`lib/engine/annex-pages.ts`). **Si moins de 2 ★ sont connus**, `visibility` passe en premier (le
message est alors « on ne voit pas encore le moteur ») et `leak` est omise.

### 9.3 Les slides, avec leurs gabarits exacts (FR / EN)

Les accords (`one`/`other`) sont des gabarits distincts dans `ENGINE_COPY`
(§14.8). `{…}` sont des nombres **déjà formatés** par `format.ts`.

**Slide 1 — `peloton` · « où en est le moteur »**
- Visuel : le peloton en grand (`peloton.png`), ligne amont, légende, tampon sur
  la colonne nommée.
- Titre, première règle qui s'applique :

| Cas | FR | EN |
|---|---|---|
| `complete` | « Sur 100 inscrits, {a} atteignent la première valeur, {r} sont encore là à J30 et **{p} paient**. » | "Out of 100 sign-ups, {a} reach first value, {r} are still active at day 30 and **{p} pay**." |
| `gap` | « Sur 100 inscrits, {clauses connues}. **Entre les deux, on ne voit rien : {étapes} n'{est\|sont} pas mesurée(s).** » | "Out of 100 sign-ups, {known clauses}. **In between, we see nothing: {stages} {isn't\|aren't} measured.**" |
| `tail-break` | « Sur 100 inscrits, {clauses connues}. **Au-delà, on ne sait pas les suivre : {étapes} n'{est\|sont} pas mesurée(s).** » | "Out of 100 sign-ups, {known clauses}. **Beyond that, we can't follow them: {stages} {isn't\|aren't} measured.**" |
| `empty` | « **On ne sait pas encore suivre 100 inscrits jusqu'au paiement.** » | "**We can't yet follow 100 sign-ups all the way to payment.**" |

  Clauses : act « {a} atteignent la première valeur » / "{a} reach first value" ;
  ret « {r} sont encore là à J30 » / "{r} are still active at day 30" ; rev
  « {p} paient » / "{p} pay". Exemple §6.0 : « Sur 100 inscrits, 18 atteignent la
  première valeur et 6 à 9 paient. **Entre les deux, on ne voit rien : la
  rétention à J30 n'est pas mesurée.** »
- Pied : « ~3 200 visiteurs pour 100 inscrits · {sources par colonne} ».

**Slide 2 — `leak` · « où ça fuit, et ce que ça vaut »**
- Visuel : à gauche la carte « Le calcul » en 4 lignes (`s2-export.png`, corrigée),
  à droite « À côté » : les autres candidats classés, « dans le repère »,
  « sans repère — fixe une cible », « non mesuré — ne peut pas être exclu ».
- Titre :

| Cas | FR | EN |
|---|---|---|
| `clear` · MRR | « Ramener {étape} à {cible} vaudrait **{montant} de MRR {nouveau\|préservé}** chaque mois. » | "Bringing {stage} to {target} would be worth **{amount} of {new\|retained} MRR** every month." |
| `clear` · clients | « Ramener {étape} à {cible} ajouterait **{n} clients payants** par mois. » | "Bringing {stage} to {target} would add **{n} paying customers** a month." |
| `clear` · pour 100 | « Ramener {étape} à {cible} ajouterait **{n} payants pour 100 inscrits**. » | "Bringing {stage} to {target} would add **{n} paying customers per 100 sign-ups**." |
| `shared` | « **{n} étapes** sont sous leur cible sans que l'une pèse nettement plus : {liste}. » | "**{n} stages** sit below their target, none clearly heavier: {list}." |
| `not-enough` + below | « **{Étape} est sous son repère.** Sans cible sur les autres étapes, impossible de dire si c'est la plus grosse fuite. » | "**{Stage} sits below its reference.** Without targets on the other stages, we can't say whether it's the biggest leak." |
| `level` | « Aucune étape n'est sous sa cible : **le levier est le volume ou le prix**. » | "No stage sits below its target: **the lever is volume or price**." |

**`clear` sur une étape sans prix — tranché par Antoine le 2026-09-29
(`CHANTIERS.md` C9).** Jusque-là, la slide était omise (`deck.ts#buildLeak`)
dans deux cas : quand l'étape nommée n'a pas de prix (rétention à J30, part
recommandée) et quand combler l'écart rapporterait moins d'un client.
Désormais :
- **Étape sans prix : la slide existe**, avec un titre sans argent
  (« **{Étape} freine le moteur** : {valeur}, pour {cible}. ») et un pied qui
  dit pourquoi il n'y a pas de montant (le modèle ne relie pas ce chiffre à
  des euros). Sans elle, le deck perdait sans rien dire la conclusion que le
  tableau affiche.
- **Moins d'un client : l'omission est gardée.** Un tel écart n'est pas un
  argument de comité.

Le gabarit exact est de la copie neuve, « à relire ». **Codé le 2026-09-30
(A7.6)** : titre `leakClearUnpriced` — « **{Étape} freine le moteur** :
{valeur}, pour {cible}. » / "**{Stage} is holding the engine back**: {value},
against {target}." —, pied `slide.leakFooterUnpriced` — « Sans montant : le
moteur ne relie pas ce chiffre au MRR » / "No amount: the engine doesn't link
this number to MRR" —, pas de carte « Le calcul » (la colonne « À côté » prend
alors toute la largeur), et le même contenu dans l'export texte et les notes.

  `{cible}` : « 20 % (cible de l'équipe) » / "20% (team target)" — seule une
  cible nomme une étape (C1) ; le gabarit « bas de l'ordre de grandeur
  couramment cité » est retiré le 2026-09-30 (A7.1). Exemple : « Ramener l'activation à 20 % vaudrait **~600 € de MRR
  nouveau** chaque mois. »
- Les 4 lignes : « Aujourd'hui · 18 sur 100 activés → 42 nouveaux payants par mois »
  · « Si · l'activation atteint 20 % (cible de l'équipe) »
  · « Alors · 42 × 20/18 = 47 (+5) » · « × ARPA · 120 € → ~600 € de MRR ajouté
  chaque mois ». Ligne annuelle si churn connu : « Soit ~6 300 € de MRR de plus au
  bout d'un an, churn compris. »
- Sous-titre `blind` le cas échéant : « La rétention à J30 n'est pas mesurée :
  le vrai frein peut s'y cacher. »
- Pied : « Toutes choses égales par ailleurs · les payants sont supposés parmi
  les activés · {réserve du repère} ».

**Slide 3 — `visibility` · « ce qu'on voit, ce qu'on ne voit pas »** (la slide
qui confronte à la réalité ; elle tient aussi lieu d'Evidence)
- Visuel : à gauche, les 5 étapes × 3 pastilles avec les noms des chiffres ;
  à droite, les introuvables **triés par coût de réparation** (réunion →
  trimestre) avec la cause et le rôle — jamais une personne.
- Titre : « On documente **{n} chiffres sur {N}**. Les {k} qui manquent se
  réparent {entre une réunion et un trimestre\|en une réunion\|…}. » / "We
  document **{n} of {N} numbers**. The {k} missing ones take {between a meeting
  and a quarter\|a meeting\|…} to fix." ; `k = 0` : « Les {N} chiffres du moteur
  sont documentés. » / "All {N} engine numbers are documented."

**Slide 4 — `unit-economics` · « ce que rapporte un client »**
- Visuel : barre horizontale CAC → payback → LTV, graduations fines « repère
  couramment cité », variante du CAC écrite, plafond de 36 mois écrit.
- Titre : calculable « Un client rembourse son coût d'acquisition en **{m} mois**
  et rapporte **{x} fois** ce qu'il coûte. » / "A customer pays back their
  acquisition cost in **{m} months** and brings in **{x}×** what they cost." ;
  sinon « **On ne peut pas encore dire ce que rapporte un client** : {entrée}
  n'est pas mesurée. » / "**We can't yet say what a customer is worth**: {input}
  isn't measured." (exemple §6.0 : la marge brute).

**Slide 5 — `mirror` · « ce qu'on déclare, ce qu'on mesure »** (opt-in)
- Titre : « L'équipe déclare suivre **{k}** de ces chiffres ; on a pu en sortir
  **{m}**. » / "The team says it tracks **{k}** of these numbers; we could pull
  **{m}**." Deux colonnes par pont (réponse du Tour citée / statut trouvé). Pied
  facultatif « Tour de Growth : {score}/100, {date} ».

**Slide 6 — `ask` · « ce que nous demandons »**
- Titre : « Nous demandons **{quoi}** pour amener {métrique} de {actuel} à
  {cible} d'ici {horizon}. » / "We're asking for **{what}** to take {metric} from
  {current} to {target} by {horizon}."
- Défaut si diagnostic `not-enough` ou `blind` : « Nous demandons **{coût de
  réparation}** pour mesurer {chiffre} avant de décider où investir. » / "We're
  asking for **{repair cost}** to measure {metric} before deciding where to
  invest." — souvent l'argument le plus honnête qu'un Head of Growth puisse porter.
- Corps : « Ce que ça finance » (≤ 3 puces), « Comment nous saurons » (métrique,
  valeur actuelle, cible, premier point de contrôle), « Ce qu'il faut d'abord
  mesurer » (≤ 3 introuvables, coût, rôle).

**Annexe — `annex` · « définitions et sources »**
- Tableau : chiffre · formule · fenêtre · cohorte/mois · source · statut ·
  confiance. C'est ce qui rend chaque nombre ré-explicable en dix secondes.
  Titre : « Définitions et sources ({i}/{n}) » / "Definitions and sources
  ({i}/{n})" — la page et leur nombre, depuis que l'annexe se découpe au lieu
  de rétrécir (2026-09-29, à relire).

### 9.4 Export texte et notes d'orateur

« Copier le texte et les notes » met dans le presse-papiers un Markdown : pour
chaque slide incluse, le titre, les lignes du corps, puis des **notes d'orateur**
pré-écrites contre les objections classiques, alimentées par les mêmes données :
« Comparé à quoi ? » → la source du comparateur ; « D'où vient ce chiffre ? » →
outil, période, cohorte ; « Et si c'est saisonnier ? » → « un seul mois mesuré ;
la comparaison mois à mois viendra » ; « Pourquoi pas l'acquisition ? » → le
classement des autres candidats. Local, `navigator.clipboard.writeText`.

---
## 10. Export — technologie et stratégie de bundle

### 10.1 Évaluation (mesures des trois angles, recoupées)

| Critère | **PDF** (impression, `@media print`) | **PNG** (`html-to-image` 1.11.13) | PPTX (`pptxgenjs` 4.0.1) |
|---|---|---|---|
| Fidélité à la marque | vectorielle, identique à l'écran — vérifié : `proto/deck.pdf` = 1 page 1440×810 pt, `StardosStencil-Bold` + `IBMPlexMono-Medium/SemiBold` embarquées en sous-ensembles | pixel-identique — vérifié : `proto/s1-export.png`, `shots/slide-h2i.png` rendent Stardos, Inter, Plex | faible : Stardos Stencil **non embarquable**, remplacée chez le destinataire ; hachures et pointillés à refaire en formes |
| Éditabilité | nulle (texte sélectionnable) | nulle, mais se colle dans *leur* gabarit de deck — l'usage réel d'un CODIR | totale |
| Poids JS | **0 Ko** | **6,7 Ko gz** (20,6 Ko brut), `import()` au clic | 140-157 Ko gz, `import()` au clic |
| Deux rendus à maintenir | non (même DOM) | non (même DOM) | **oui** (chaque slide redécrite en API) |
| Mobile | aléatoire (iOS) | oui | oui |
| Réseau | aucun | GET même origine des polices (aucune donnée) | aucun |
| Risque | `@page size` et fonds selon navigateur (Safari à vérifier) | Safari : polices parfois absentes au premier rendu | maintenance |

**Choix v1 : PDF + PNG + copie d'image + texte.** PPTX en v2, en « version
modifiable, typographie système » assumée à l'écran, et seulement si les retours
le demandent.

### 10.2 Implémentation

- Les slides sont des composants (`_engine/deck/Slide*.tsx`) rendus **à taille
  réelle** 1920×1080 à l'intérieur d'un conteneur mis à l'échelle
  (`transform: scale(...)` sur le **parent**, jamais sur le nœud exporté).
- **PNG** : `const { toPng } = await import("html-to-image")` au clic ;
  `await document.fonts.ready` ; un premier rendu à blanc (contournement Safari
  connu) ; `toPng(node, { pixelRatio: 1 | 2, width: 1920, height: 1080 })` ;
  téléchargement `Blob` + `<a download>` **attaché au document** (leçon de
  l'audit 1.2), URL révoquée plus tard. Nom : `moteur-{slide}-{referenceMonth}.png`
  / `engine-{slide}-{referenceMonth}.png`. En cas d'échec : message + « le PDF
  marche depuis ce navigateur ».
- **Copier l'image** : `navigator.clipboard.write([new ClipboardItem({ "image/png": blob })])`,
  bouton rendu seulement si `ClipboardItem` existe.
- **PDF** : `window.print()` après `document.fonts.ready`. Feuille d'impression
  dans `deck/deck.module.css` via `:global` :
  `@page { size: 1920px 1080px; margin: 0 }` ; tout sauf `#engine-deck` en
  `display: none !important` (**avec** la règle `[hidden] { display: none }`
  explicite, leçon nº 2) ; parent sans transform ; `break-after: page` entre
  slides ; `print-color-adjust: exact` (sinon les points noirs et le papier
  disparaissent) ; slides exclues masquées.
- **Texte** : Markdown assemblé par `deck.ts` + `navigator.clipboard.writeText`.

### 10.3 Stratégie de bundle

- `html-to-image` en `dependencies` de `package.json`, **uniquement** atteint par
  `import()` dynamique dans `_engine/deck/export-png.ts` (chunk séparé, chargé au
  premier clic d'export). Garde statique : aucun `import … from "html-to-image"`
  dans `src/` (§13.2).
- L'îlot n'importe ni `lib/i18n/dictionary`, ni `content/*` en valeur, ni
  `lib/scoring/{score,bottleneck,verdict,next-move,questions}`, ni `lib/og`, ni
  `lib/audit`. Il reçoit ~25 Ko de chaînes résolues en props (UI + catalogue
  d'une langue), soit ~8 Ko gz dans le payload RSC.
- Côté serveur, `content/engine-catalog.ts` et `content/engine-copy.ts` ne sont
  atteints **que** par `app/[locale]/aarrr-funnel-template/page.tsx` (budget 1
  route chacun, `content-fan-in.test.ts`). `copy-library.ts` gagne un point
  d'entrée (la page résout les 8 questions du pont) : décision écrite dans le
  test, pas un contournement.
- Coût Vercel : deux routes prérendues de plus dans la fonction des pages de
  contenu (qui se compte par route — `VERCEL.md` §2.2), zéro fonction nouvelle,
  zéro Route Handler.

### 10.4 Glyphes (mesuré dans Chromium sur le build, `spec-probe/glyphs.cjs`)

| Glyphe | Stardos Stencil | Inter | IBM Plex Mono | Règle |
|---|---|---|---|---|
| `↓ ↑` | **absent** | présent | présent | dessinés en SVG/CSS partout (cohérence) |
| `→ ←` | absent | absent | absent | SVG/CSS |
| `≈ ≤ ≥ ‰ ▸ ◀ ✓ ●` | absent | absent | absent | interdits ; « ~ », mots, pastilles CSS |
| `ʳ ᵉ` (1ʳᵉ) | absent | présent | absent | interdits ; « 1re » ou « première » |
| U+202F | absent (TTF `lib/og`) | présent | absent | normalisé en U+00A0 (§6.2) |
| `× ÷ · – — ’ « » … € ± %` et U+00A0 | présents | présents | présents | autorisés |

- Test unitaire : toutes les chaînes de gabarits de slides et du peloton (FR+EN)
  ne contiennent que Latin-1 imprimable + `– — ’ « » … € · × ÷ ±` et U+00A0 ;
  plus toute sortie de `format.ts` sur une grille de valeurs.
- Test e2e : le PDF produit n'embarque **aucune** police hors des trois familles
  (`/BaseFont` sans `DejaVu`, `Liberation`, `Arial`, `Helvetica`, `Times`) — la
  méthode qui a trouvé `LiberationSerif-Bold` dans `slide.pdf`.

---

## 11. Routes, fichiers, drapeau, gardes, SEO, légal, analytics

### 11.1 Arborescence

```
src/app/[locale]/aarrr-funnel-template/
  page.tsx                  Server Component prérendu (●) : contentMetadata(), JSON-LD
                            (webApplicationSchema paramétré + breadcrumbSchema), resolveTree(ENGINE_COPY),
                            catalogue résolu, 8 ponts résolus depuis copy-library ; contenu statique SEO ;
                            monte <EngineWorkbench strings metrics bridges locale />
  page.module.css
  opengraph-image.tsx       ré-export de ../opengraph-image (Next n'hérite pas)
  EngineWorkbench.tsx       "use client" — l'îlot : état, lecture/écriture après montage, vues
  _engine/                  dossier privé (non routé)
    Setup.tsx  Steps.tsx  Board.tsx  StageTabs.tsx  Verdict.tsx  Coverage.tsx  Diagnosis.tsx
    Peloton.tsx  MetricSheet.tsx  ValueEditor.tsx  MissingTriage.tsx  ComparisonStrip.tsx
    WhatIfPanel.tsx  Mirror.tsx  CollectHub.tsx  RequestCopy.tsx  ResumeBand.tsx  BackupBar.tsx
    ImportPanel.tsx  EraseDialog.tsx  ExampleView.tsx  *.module.css
    stage-tabs.ts  steps-model.ts  scenario-view.ts  visual-model.ts  …  (vues pures, testées)
    _ui/  Field.tsx  NumberField.tsx  Select.tsx  TextField.tsx  MonthField.tsx  ui.module.css
    deck/ DeckView.tsx  SlideFrame.tsx  SlidePeloton.tsx  SlideLeak.tsx  SlideVisibility.tsx
          SlideUnitEconomics.tsx  SlideMirror.tsx  SlideAsk.tsx  SlideAnnex.tsx  SlideWhatIf.tsx
          SlideScenario.tsx  AskForm.tsx  deck-rows.ts
          export-png.ts  copy-text.ts  deck.module.css
src/lib/engine/             pur, navigateur, testé ; aucun import de valeur depuis content/
  types.ts  strings.ts  catalog-shape.ts  access.ts  storage.ts  io.ts  validate.ts
  interval.ts  format.ts  cohort.ts  values.ts  coverage.ts  peloton.ts  diagnose.ts  impact.ts
  unit-economics.ts  sanity.ts  findings.ts  bridge.ts  deck.ts  request.ts  scenario.ts
  shared-counts.ts  phrases.ts  sentences.ts  derive.ts  example.ts
  __tests__/*.test.ts
src/content/engine-catalog.ts   serveur : prose des 17 chiffres (Translatable) — TODO: à relire
src/content/engine-copy.ts      serveur : UI, gabarits de slides, constats, FAQ — TODO: à relire
```

**Fichiers existants modifiés** : `src/proxy.ts` (bloc drapeau),
`src/lib/i18n/routes.ts` (`"aarrr-funnel-template"` dans `LOCALIZED_ROOTS` : 308
de l'adresse non préfixée), `src/lib/i18n/translatable.ts` (`resolveTree`),
`src/lib/seo/jsonld.tsx` (`webApplicationSchema` accepte `{ path, name,
description }`), `src/lib/analytics/goatcounter.ts` + `goatcounter-api.ts`
(vocabulaire), `src/content/legal.ts` (§11.5), `package.json`/lockfile
(`html-to-image`), `src/__tests__/content-fan-in.test.ts` (budgets),
`src/__tests__/client-bundles.test.ts` (assertions), `e2e/helpers.ts`
(`openEngine`, `seedTourResult`).

**À l'ouverture seulement** (PR séparée, §12) : `src/app/sitemap.ts`,
`src/content/updated-at.ts`, liens depuis `/how-it-works`,
`/growth-audit-checklist`, `/startup-growth-diagnostic` et la landing (section
sous la citation d'Antoine, deux cartes secondaires, `copy-review.md` §4.1) ;
**pas** de 7ᵉ lien au pied de page (règle des six).

### 11.2 Le drapeau (`src/lib/engine/access.ts`)

> **Mise à jour 2026-09-25 — l'aperçu est au propriétaire seul.** Le paramètre
> `?engine=preview` décrit plus bas était public (écrit dans ce dépôt public,
> donc ouvrable par n'importe quel lecteur). Il est **inerte** : le cookie
> `tdg_engine_preview` vaut désormais une signature HMAC-SHA256 sous
> `ADMIN_DASHBOARD_PASSWORD`, posée uniquement par `POST /admin/preview`
> derrière la Basic Auth (`src/lib/owner-preview.ts`), et
> `resolveEngineAccess({ env, ownerPreview })` reçoit le verdict vérifié.
> Les specs passent par `grantOwnerPreview` (`e2e/helpers.ts`).

Copie conforme de `lib/game/access.ts` : `resolveEngineAccess({ env, cookie })`
(`"open"` seulement si `ENGINE_ENABLED === "true"` ou cookie `tdg_engine_preview
= "1"`), `previewRequest("preview" | "off")`, `isEnginePath(rest)` (vrai pour
`/aarrr-funnel-template` exactement). Dans `proxy.ts`, sur le modèle du bloc du
jeu (lignes 207-243) : `?engine=preview` pose le cookie, `?engine=off` l'efface ;
une page fermée est **réécrite** vers `/{locale}/engine-unavailable` (aucune
route) ⇒ 404, pages toujours prérendues. Seul `access.ts` lit
`process.env.ENGINE_ENABLED`. Ne pas généraliser le module du jeu dans cette PR
(il appartient à la tâche #39) : la factorisation est un suivi.

### 11.3 SEO

- `<title>` FR « Modèle de funnel AARRR — tes chiffres, en local » / EN "AARRR
  funnel template — your numbers, kept local" (+ suffixe du site) ; description
  ≤ 160 (§14.1).
- JSON-LD : `WebApplication` (`applicationCategory: "BusinessApplication"`,
  `isAccessibleForFree: true`, sans `aggregateRating`) + `BreadcrumbList`. Pas de
  `HowTo`, pas de `FAQPage` (résultats enrichis retirés par Google).
- Un seul `<h1>` dans le HTML servi ; le contenu statique (15 chiffres, formules,
  « où le trouver », FAQ) est dans le HTML prérendu.
- `hreflang`/canonical via `contentMetadata()`.

### 11.4 Gardes (tests statiques)

- **Nouveau `src/__tests__/engine-boundary.test.ts`** :
  1. rien sous `lib/engine/**` ni `app/[locale]/aarrr-funnel-template/**`
     n'importe `firebase`, `@/lib/gemini`, `@/lib/submissions`, `@/lib/audit`,
     `@/content/audit-catalog`, `@/lib/og`, `@/lib/i18n/dictionary` ;
  2. **marche transitive** depuis `EngineWorkbench.tsx` (algorithme
     d'`audit-boundary.test.ts`) : aucun import de valeur n'atteint `content/`,
     `lib/scoring/{score,questions,bottleneck,verdict,next-move}` ;
  3. balayage de source : aucun `fetch(`, `XMLHttpRequest`, `sendBeacon`,
     `WebSocket`, `EventSource`, `<form`, `new Image(` dans ces dossiers ;
  4. aucun import statique de `html-to-image` dans tout `src/` ;
  5. tout `trackEvent(` de ces dossiers utilise un nom et un détail pris dans les
     listes fermées exportées (§11.6) — aucun nombre, aucun libellé saisi ;
  6. non-vacuité : l'îlot existe, la marche trouve ≥ 10 modules.
- `content-fan-in.test.ts` : budgets `content/engine-catalog.ts` max 1,
  `content/engine-copy.ts` max 1 ; rien d'autre ne bouge.
- `client-bundles.test.ts` : **aucun ajout** à `DICTIONARY_ALLOWED_ON_CLIENT` ;
  nouvelle assertion « aucun Client Component sous `aarrr-funnel-template/`
  n'importe `@/content/` en valeur ».
- `cross-root-links.test.ts` : couvre déjà le dossier `[locale]` ; les liens vers
  `/quiz` sont des `Button hard`.
- `copy-typography.test.ts` : couvre les deux nouveaux modules de contenu.

### 11.5 Légal

`content/legal.ts` énumère les clés `localStorage` (« Ton navigateur garde… »,
ligne ~231) : la phrase **devient fausse** sans ajout. Ajouter (TODO: à relire) :
FR « … et, si tu utilises le moteur de growth, les chiffres et les textes que
tu y saisis. Rien de tout cela n'est envoyé : les seules sorties sont des fichiers
que tu télécharges ou ce que tu copies toi-même. » / EN "… and, if you use the
growth engine, the numbers and text you enter there. None of it is sent: the only
ways out are files you download and what you copy yourself." Un test e2e vérifie
que `/privacy` mentionne le moteur. `updatedAt` de la page légale bougé.

### 11.6 Analytics (GoatCounter, chemins seulement)

Vocabulaire fermé exporté depuis `lib/analytics/goatcounter.ts`, ajouté à
`goatcounter-api.ts` (sinon sous-compté, R-11) :
- `engine_opened` (première vue de l'îlot dans la session) ;
- `engine_stage_saved/<acquisition|activation|retention|referral|revenue>`
  (premier enregistrement d'un chiffre de l'étape dans la session) ;
- `engine_request_copied` ;
- `engine_deck_opened` ;
- `engine_exported/<png|pdf|text|json>` ;
- `engine_tour_linked`.

**Jamais** un état de diagnostic, un statut, un nombre, un libellé.

---

## 12. Découpage en PR — agents parallèles

**Stratégie de fusion** : branche d'intégration `feat/engine` ; chaque PR vise
`feat/engine` (la CI tourne sur `pull_request` quelle que soit la base, et
Vercel ne construit rien hors production) ; **un seul merge `feat/engine → main`**
à la fin, drapeau fermé ; puis une PR d'ouverture minuscule. Deux merges sur
`main` au total (convention 13). Après chaque merge : `git show --stat` pour
vérifier qu'il n'est pas vide (convention 1).

| PR | Contenu | Fichiers possédés (personne d'autre ne les touche) | Dépend de | Jours-agent |
|---|---|---|---|---|
| **P0 — Contrats** (lead) | `types.ts`, `strings.ts`, `catalog-shape.ts` (formes + repères numériques), `access.ts` + bloc `proxy.ts` + `routes.ts`, squelettes : `page.tsx` qui monte un îlot vide, `content/engine-catalog.ts` et `engine-copy.ts` avec **les clés** et des valeurs provisoires, `resolveTree`, budgets de fan-in, `engine-boundary.test.ts` (gardes 1-3, 6) | `lib/engine/{types,strings,catalog-shape,access}.ts`, `proxy.ts`, `routes.ts`, `translatable.ts`, `page.tsx` (squelette), les deux tests de garde | — | 0,5 |
| **P1 — Moteur pur** | `interval`, `format`, `cohort`, `values`, `coverage`, `peloton`, `diagnose`, `impact`, `unit-economics`, `sanity`, `findings`, `bridge`, `deck`, `request` + tests | `lib/engine/*.ts` sauf P0 et P2 | P0 | 2 |
| **P2 — Stockage** | `storage`, `io`, `validate` + tests | `lib/engine/{storage,io,validate}.ts` | P0 | 0,5 |
| **P3 — Contenu** | toute la prose FR+EN (catalogue, UI, gabarits, constats, FAQ, légal), tests de contenu (ids, glossaire, repères anti-dérive, gabarits, glyphes, typographie) | `content/engine-*.ts`, `content/legal.ts`, `content/__tests__/engine-*.test.ts` | P0 | 1,5 |
| **P4 — Collecte** | îlot (machine à états, persistance), E1, E2 hors peloton/diagnostic, tiroir, fiche, éditeur, triage, demande, E4, E6, E7, `_ui/` | `EngineWorkbench.tsx`, `_engine/{Setup,Board,Verdict,Coverage,StageRow,StageDrawer (remplacés par StageTabs le 2026-09-26),MetricSheet,ValueEditor,MissingTriage,ComparisonStrip,RequestCopy,CollectHub,ResumeBand,BackupBar,ImportPanel,EraseDialog}.tsx`, `_engine/_ui/**` | P0 (P1/P2 par interfaces, bouchonnables) | 2 |
| **P5 — Visuel** | peloton, diagnostic, « et si », miroir ; contenu statique de la page | `_engine/{Peloton,Diagnosis,WhatIf,Mirror}.tsx`, `page.tsx` (corps), `page.module.css` | P0 (P1 par interfaces) | 1 |
| **P6 — Deck** | slides, aperçu, formulaire `ask`, feuille d'impression, PNG, copie, texte ; dépendance `html-to-image` | `_engine/deck/**`, `package.json`, lockfile | P0, P1 (`deck.ts`) | 1,5 |
| **P7 — Intégration** | branchement final, analytics, `opengraph-image.tsx`, JSON-LD, e2e complets (§13.3), passe axe, captures relues FR/EN × 390/1280, entrée de journal `CLAUDE.md` | `e2e/engine-*.spec.ts`, `e2e/helpers.ts`, `lib/analytics/*`, `lib/seo/jsonld.tsx`, `opengraph-image.tsx`, `client-bundles.test.ts`, `CLAUDE.md` | P1-P6 | 1 |
| **P8 — Ouverture** (après relecture de la copie) | sitemap, `updated-at`, liens entrants, `ENGINE_ENABLED=true` dans Vercel | `sitemap.ts`, `updated-at.ts`, pages liantes | bon à tirer nº6 | 0,25 |

Total ≈ **10 jours-agent** (P8 compris) ; chemin critique P0 → P1 → P6 → P7 ≈ **5 jours**
calendaires, P2/P3/P4/P5 en parallèle. P4 et P5 démarrent sur des bouchons des
fonctions de P1 (signatures figées par P0) ; P3 livre les vraies chaînes pendant
que l'UI se construit sur les clés.

**Règles de coordination** : un seul propriétaire par fichier (tableau) ;
`proxy.ts` est aussi touché par le jeu (#39) — P0 rebase avant de pousser et
n'ajoute qu'un bloc ; toute évolution des types passe par une PR sur P0 ; chaque
PR lance `npx tsc --noEmit` avant de conclure (Playwright ne type-vérifie pas les
specs) et reconstruit avec `NEXT_PUBLIC_GOATCOUNTER_CODE=e2e-stub` avant toute
conclusion sur une spec analytics.

---
## 13. Plan de tests

Chaque test porte un commentaire de non-vacuité : quel sabotage le fait tomber,
et lesquels ne tombent pas (convention 5).

### 13.1 Unitaires (Vitest, `src/lib/engine/__tests__/`, `src/content/__tests__/`)

- **`interval`** : combinaisons de bornes aux bons coins sur une grille
  exhaustive ; largeur nulle ; division par un intervalle contenant 0 ⇒ inconnu ;
  bornes inversées refusées.
- **`format`** : les règles §6.2 en FR et EN ; **aucune sortie ne contient
  U+202F ni « ≈ »** (balayage d'une grille de 10⁻⁴ à 10⁷) ; « moins de 1 sur
  100 » ; fourchette réduite à une valeur quand les bornes arrondies sont égales.
- **`cohort`** : fins de mois, février, année bissextile, 29/30/31 ; `today`
  injecté ; les quatre exemples du 24/09/2026 (§6.3).
- **`coverage`** : l'invariant de somme pour **toutes** les combinaisons de
  statuts sur les 15 chiffres (7¹⁵ est trop : produit cartésien par étape + tirage
  déterministe de 10 000 cas) ; seul `not-applicable` bouge le dénominateur.
- **`values` / confiance** : table cas → niveau (raccourci ⇒ approximatif,
  personne ⇒ approximatif, cohorte immature ⇒ approximatif).
- **`peloton`** : exemple §6.0 (18, `null`, 6 à 9, ~3 200, 6 recommandés) ; les
  quatre valeurs de `chain` ; jamais 0 pour un inconnu.
- **`diagnose`** :
  - une valeur **dans** sa référence n'est jamais `below` (le piège de
    `s2-export.png`) ; seule une cible la rend candidate ;
  - `maybe-below` ne tamponne pas ;
  - borne de netteté des deux côtés : 600 € vs 240 € ⇒ `clear` ; 600 € vs 480 €
    ⇒ `shared` (600 > 600 est faux) ;
  - `shared` nomme tout le groupe (cas à 3 égaux) ;
  - `not-enough` avec et sans `below` ; `level` ;
  - `blind` superposé quand `ret.d30` est inconnu ;
  - **équivalence** : sur une grille de taux et de cibles, l'ordre des flux par
    € == l'ordre par écart relatif (`basis` différent, même `named`) ;
  - `ret.d30` et `ref.referred-share` jamais chiffrés en € ;
  - aucun repère ne désigne, pas même les deux qui le faisaient (C1) ; la cible
    désigne toujours.
- **`impact`** : exemple §6.6 (« 42 × 20/18 = 47 (+5) », « ~600 € », annuel
  « ~6 300 € ») ; **invariant d'affichage** : pour une grille d'entrées, chaque
  ligne se recalcule à partir des nombres *affichés* de la ligne précédente ;
  écart < 1 ⇒ pas de montant ; hypothèse « payants parmi les activés » présente
  pour `act.rate`.
- **`unit-economics`** : plafond 36 mois ; marge inconnue ⇒ incalculable (**pas de
  repli sur le revenu**) ; variante du CAC propagée.
- **`sanity`** : un cas qui déclenche et un qui ne déclenche pas par contrôle ;
  `reconcile-gap` sur l'exemple (pas d'alerte) et sur un cas hors bande.
- **`findings`** : table cas → kinds, rangs stables.
- **`bridge`** : la matrice 3 × 3 complète ; `todo`/`requested`/`not-applicable`
  ⇒ aucun verdict ; le plus récent résultat **avec** `answers` ; liste exacte des
  8 ponts épinglée (un ajout est une décision) ; chaque `tourQuestionId` existe
  dans `QUESTIONS` (le test peut importer `copy-library`).
- **`deck`** : règles §9.2 (présence, ordre, `visibility` en tête sous 2 ★) ;
  chaque gabarit de titre a un cas qui le déclenche et un qui ne le déclenche
  pas ; **titre et corps de `leak` contiennent la même chaîne formatée**.
- **`request`** : le message contient période, noms et définitions, **aucune
  valeur saisie** ; horloge de relance qui repart à `remindedAt`.
- **`storage` / `io`** : aller-retour stable (clés triées) ; écriture en échec
  **renvoyée** (quota simulé) ; état illisible ⇒ `null` ; fichier incomplet
  accepté avec avertissements ; version inconnue refusée ; `.v1` jamais écrasé
  par une migration avant export.
- **`access`** : les combinaisons env × cookie ; `previewRequest` ignore tout sauf
  les deux valeurs exactes.
- **Contenu (`content/__tests__/engine-catalog.test.ts`, `engine-copy.test.ts`)** :
  - ids de `catalog-shape.ts` == ids de `engine-catalog.ts` ; 15 chiffres, 3 par
    étape, 1 ★ par étape ;
  - chaque `glossary` ∈ `GLOSSARY_TERMS` (24 termes) ;
  - **repères anti-dérive** : pour chaque `benchmark`, `lo` et `hi` **formatés
    dans la langue** (« 20 » et « 40 » ; « 0,15 » FR / « 0.15 » EN ; « 70 » et
    « 85 ») apparaissent dans le texte **complet** de l'entrée
    `GLOSSARY_DEEP[term]` de la même langue — pas seulement dans son bloc
    `benchmark` : le 70-85 % de la marge brute vit dans les termes de la formule
    de `cac-payback`, et le français de l'activation dit « entre 20 % et 40 % »,
    pas « 20-40 » ;
  - chaque `{placeholder}` existe dans les deux langues, et aucun n'est orphelin ;
  - FR et EN non vides partout ; U+00A0 avant `%`/`€` en français
    (`copy-typography.test.ts` étendu) ;
  - **glyphes** : liste blanche §10.4 sur tous les gabarits de slides et du
    peloton.

### 13.2 Gardes statiques

`engine-boundary.test.ts` (6 règles §11.4), budgets de `content-fan-in.test.ts`,
nouvelle assertion de `client-bundles.test.ts`, `cross-root-links.test.ts`
inchangé mais couvrant la nouvelle page. Non-vacuité mesurée pour chacune : un
`import … from "@/content/engine-catalog"` dans l'îlot fait tomber la marche ; un
`fetch("/x", { method: "POST" })` fait tomber le balayage ; un
`import { toPng } from "html-to-image"` statique fait tomber la règle 4.

### 13.3 E2E (Playwright, build de production, Chromium)

Helper `openEngine(page, locale)` : visite
`/{locale}/aarrr-funnel-template` après `grantOwnerPreview` (la CI ne pose pas
`ENGINE_ENABLED` : c'est le vrai défaut fermé qui est testé) ;
`seedTourResult(page, answers)` : écrit un résultat **avec** `answers` dans
`tdg.results.v1`.

- **`engine-canary.spec.ts`** — calqué sur `audit-canary.spec.ts` :
  - canaris semés : libellé d'entreprise `TDG-CANARY-CO-{stamp}`, un compte à
    9 chiffres dans `act.rate`, une `definitionNote`, une `note`, deux lectures
    de conflit, le texte de l'`ask` ;
  - parcours complet : réglage, 4 fiches (mesuré, estimé, triage introuvable,
    conflit), demande copiée, onglet « À aller chercher », deck, **PNG
    téléchargé**, **copie d'image**, **copie du texte**, **`.json` exporté puis
    réimporté**, impression émulée (`emulateMedia({ media: "print" })` +
    `page.pdf()`) ;
  - assertions : les canaris **sont** dans le `.json` exporté et dans le texte
    copié (sinon la spec ne prouve rien) ; aucune requête ne porte un canari (URL
    ni corps) ; **aucune requête non-`GET` de toute la session** ; tous les
    événements du stub GoatCounter (`window.__tdgEvents`) sont dans la liste
    fermée et ne contiennent aucun chiffre ; `seen.length > 5`. Les GET de
    polices même origine faits par `html-to-image` sont attendus et sans donnée.
- **`engine-journey.spec.ts`** : saisie du jeu §6.0 ; titre-verdict exact ;
  couverture « 9 sur 15 » ; **rechargement sans rien effacer** ⇒ tout est là (la
  seule assertion qui prouve l'écriture, leçon de l'audit 1.2) ; export ⇒
  `localStorage` réellement vidé ⇒ import ⇒ fractions identiques au caractère
  près ; « Tout effacer » demande la confirmation retapée.
- **`engine-diagnosis.spec.ts`** : diagnostic `clear` sur l'exemple, tampon sur
  la ligne Activation, phrase `blind` ; « et si » : déplacer le curseur change le
  montant et les 4 lignes restent recalculables (lire les nombres affichés et
  refaire le calcul dans le test) ; une valeur dans le repère n'est jamais
  tamponnée ; sans cible ni second repère ⇒ « pas assez de repères ».
- **`engine-bridge.spec.ts`** : Tour semé avec `ret-1` = option à 20 pts et
  `ret.d30` introuvable ⇒ carte « angle mort » qui cite la réponse mot pour mot ;
  sans Tour ⇒ lien `/quiz` présent **et** `<a>` nu (pas de préchargement de route
  applicative).
- **`engine-deck.spec.ts`** : `page.pdf()` en média print ⇒ nombre de pages =
  nombre de slides incluses ; **polices embarquées = les trois familles
  seulement** (§10.4) ; PNG téléchargé = PNG valide 1920×1080 (IHDR lu dans le
  test) et 3840×2160 en haute définition ; slide `mirror` absente par défaut,
  présente après coche ; une slide décochée n'est pas imprimée.
- **`engine-flag.spec.ts`** : sans cookie ⇒ 404 ; `?engine=preview` et un
  cookie deviné (`1`) ⇒ 404 ; `/admin/preview` ⇒ cookie signé, 200 ; « Refermer »
  ⇒ 404 de nouveau ; `/aarrr-funnel-template`
  non préfixé ⇒ 308 vers la forme localisée (en preview).
- **`engine-mobile.spec.ts`** : 320 (hors contrat, mesuré seulement), 360, 390,
  430 × FR/EN : `scrollWidth === clientWidth` sur E0, E1, E2, tiroir ouvert, E4,
  E5 ; aucun libellé de ligne ou de colonne ne sort de sa carte (mesure des
  boîtes — le défaut de `mock-1280.png`).
- **Ajouts aux specs existantes** :
  - `accessibility.spec.ts` : axe sur E0, E2 (avec une ligne « sous la cible »
    **visible** — la seule surface rouge, là où une régression de contraste se
    cacherait), tiroir ouvert avec fiche, E3bis, E4, E5 ;
  - `keyboard.spec.ts` : renseigner `act.rate` et l'enregistrer **sans souris** ;
    Entrée sur une ligne ouvre le tiroir et le focus va à son titre ; fermeture ⇒
    focus rendu à la ligne ; les champs qu'un statut fait apparaître entrent dans
    l'ordre de tabulation ;
  - `document-headings.spec.ts` : un `<h1>` dans le HTML servi (FR/EN) ;
  - `structured-data.spec.ts` : `WebApplication` + `BreadcrumbList` ;
  - `legal.spec.ts` : `/privacy` mentionne le moteur dans les deux langues ;
  - `locale-routing.spec.ts` : la redirection 308 ;
  - `analytics.spec.ts` : `engine_opened`, `engine_stage_saved/activation`,
    `engine_exported/png` émis, avec un stub **réellement injecté** (build avec
    `NEXT_PUBLIC_GOATCOUNTER_CODE=e2e-stub`).
- **i18n** : le parcours complet est joué **dans les deux langues**
  (`engine-journey` paramétré) ; une spec vérifie qu'une bascule EN ↔ FR garde
  les chiffres (`localStorage` par origine) et change les titres de slides.

### 13.4 Vérification visuelle (leçon nº 1)

Avant de dire une PR finie : captures relues de E0, E1, E2 (tiroir ouvert), E4,
E5 et des 7 slides, en FR et EN, à 390 et 1280 ; le PDF rendu page par page
(`page.pdf` puis capture) ; comparer avec `shots/peloton.png` et
`spec-probe/board-*.png`. Vérifier en particulier : le numéral au-dessus de la
grille, aucune étiquette dans une marque, le « ? » sur son disque papier, le
titre qui dit les mêmes nombres que la grille.

### 13.5 Non-vacuité à mesurer à la livraison

| Sabotage | Doit faire tomber | Ne doit pas faire tomber |
|---|---|---|
| `saveEngine` n'écrit plus | journey (rechargement), canary (import) | diagnosis, deck |
| un `fetch` POST de l'état dans `saveEngine` | canary (non-GET) | journey |
| `diagnose` forcé à `clear` | diagnosis (« pas assez de cibles », « à la cible ») | journey |
| U+202F laissé par `format` | format (unitaire), glyphes | e2e hors FR |
| `import` statique de `html-to-image` | engine-boundary règle 4 | e2e |
| titre de `leak` formaté par une autre fonction | deck (titre = corps) | diagnosis |

---
## 14. Inventaire de la copie — tout est `TODO: à relire`

Deux modules serveur : `src/content/engine-copy.ts` (UI, gabarits, constats,
FAQ) et `src/content/engine-catalog.ts` (prose des 15 chiffres). En tête de
chacun : `// TODO: à relire — copie neuve (convention 6), rédigée par la session
de code`. Le bon à tirer nº6 se reconstruit **depuis `grep -rn "TODO: à relire"
src/`**, jamais depuis cette liste. Français avec U+00A0 avant `%`, `€`, `:`,
`?`, `!`, `»` et après `«` ; anglais avec guillemets droits (garde de
`copy-typography.test.ts`). Libellés des piliers inchangés (non traduits).

### 14.1 Page (E0) et métadonnées — `page.*`, `meta.*`

| Clé | FR | EN |
|---|---|---|
| `meta.title` | Modèle de funnel AARRR — tes chiffres, en local | AARRR funnel template — your numbers, kept local |
| `meta.description` | Entre les chiffres de tes cinq étapes AARRR, vois où tu perds le plus de monde et exporte des slides pour ton CODIR. Rien n'est envoyé. | Enter the numbers for your five AARRR stages, see where you lose the most people and export slides for your leadership meeting. Nothing is sent. |
| `meta.breadcrumb` | Moteur de growth | Growth engine |
| `page.eyebrow` | Le moteur | The engine |
| `page.title` | Ton moteur de growth | Your growth engine |
| `page.positioning` | Ton Tour dit si tu mesures. Le moteur montre ce que disent tes chiffres. | Your Tour tells you whether you measure. The engine shows what your numbers say. |
| `page.promise` | Quinze chiffres, trois par étape : trouve-les, vois où ton moteur perd du monde, et repars avec des slides prêtes pour ton CODIR. | Fifteen numbers, three per stage: find them, see where your engine loses people, and leave with slides ready for your leadership meeting. |
| `page.privacyTitle` | Rien de ce que tu saisis ne sort d'ici | Nothing you enter leaves this page |
| `page.privacyBody` | Aucun chiffre ni aucun texte que tu saisis ne quitte ton navigateur. Pas de compte, pas de serveur : ils restent sur cet appareil, et tu peux le vérifier dans l'onglet Réseau. La page compte ses visites, sans cookie — jamais ce que tu y écris. | No number and no text you enter leaves your browser. No account, no server: they stay on this device, and you can check it in the Network tab. The page counts its visits, without cookies — never what you type. |
| `page.cta` | Entre tes chiffres → | Enter your numbers → |
| `page.ctaNote` | Gratuit, sans compte. Tout reste sur ton appareil. | Free, no sign-up. Everything stays on your device. |
| `page.tourFirst` | Faire le Tour d'abord (3 min) | Take the Tour first (3 min) |
| `page.catalogueTitle` | Les quinze chiffres | The fifteen numbers |
| `page.catalogueIntro` | Trois par étape, comme les trois questions du Tour. Pour chacun : sa formule, où le trouver, et ce qu'il faut savoir avant de le citer. | Three per stage, like the Tour's three questions. For each: its formula, where to find it, and what to know before quoting it. |
| `page.faqTitle` | Questions fréquentes | Frequently asked questions |

### 14.2 Réglage (E1) — `setup.*`

| Clé | FR | EN |
|---|---|---|
| `setup.title` | Avant de commencer | Before you start |
| `setup.model` | Ton modèle | Your model |
| `setup.model.selfserve` | SaaS / produit web en libre-service (essai ou freemium) | SaaS / web product, self-serve (trial or freemium) |
| `setup.model.salesLed` | B2B avec équipe commerciale | B2B with a sales team |
| `setup.model.consumerApp` | App grand public | Consumer app |
| `setup.model.marketplace` | Place de marché | Marketplace |
| `setup.model.soon` | Bientôt — leur funnel n'a pas la même forme. | Coming soon — their funnel has a different shape. |
| `setup.referenceMonth` | Mois des flux | Month for flows |
| `setup.referenceMonthHint` | Visiteurs, inscriptions, dépense, churn et ARPA de ce mois-là. Par défaut : le dernier mois clos. | Visitors, sign-ups, spend, churn and ARPA for that month. Default: the last closed month. |
| `setup.cohortMonth` | Cohorte suivie | Cohort you follow |
| `setup.cohortHint` | On suit les inscrits de {cohort} : ceux de {next} n'ont pas encore eu {n} jours. | We follow {cohort}'s sign-ups: {next}'s haven't had {n} days yet. |
| `setup.currency` | Devise | Currency |
| `setup.activationWindow` | Fenêtre d'activation | Activation window |
| `setup.paidWindow` | Fenêtre de paiement | Payment window |
| `setup.windowDays` | {n} jours | {n} days |
| `setup.companyLabel` | Nom affiché sur les slides (facultatif) | Name shown on the slides (optional) |
| `setup.companyHint` | Reste sur cet appareil. | Stays on this device. |
| `setup.tourFound` | Tu as fait le Tour le {date} ({score}/100). On comparera ce que tu y as déclaré à ce que tu retrouves ici. | You took the Tour on {date} ({score}/100). We'll compare what you declared there with what you find here. |
| `setup.tourLink` | Comparer avec mon Tour | Compare with my Tour |
| `setup.start` | Commencer → | Start → |

### 14.3 Le moteur (E2) — `board.*`, `coverage.*`, `actions.*`

| Clé | FR | EN |
|---|---|---|
| `board.eyebrow` | Ton moteur de growth · {model} · cohorte de {cohort} · flux de {month} | Your growth engine · {model} · {cohort} cohort · {month} flows |
| `board.tabEngine` | Le moteur | The engine |
| `board.tabCollect` | À aller chercher ({n}) | To go and get ({n}) |
| `coverage.found` | {n} chiffres sur {N} trouvés | {n} of {N} numbers found |
| `coverage.found.one` | 1 chiffre sur {N} trouvé | 1 of {N} numbers found |
| `coverage.approximate` | {n} approximatifs | {n} approximate |
| `coverage.approximate.one` | 1 approximatif | 1 approximate |
| `coverage.inProgress` | {n} en cours | {n} in progress |
| `coverage.requested` | {n} demandés | {n} requested |
| `coverage.requested.one` | 1 demandé | 1 requested |
| `coverage.missing` | {n} introuvables | {n} missing |
| `coverage.missing.one` | 1 introuvable | 1 missing |
| `actions.deck` | Préparer mes slides → | Prepare my slides → |
| `actions.save` | Sauvegarder (.json) | Save (.json) |
| `actions.import` | Importer un fichier | Import a file |
| `actions.erase` | Tout effacer | Erase everything |
| `board.smallCohort` | Petits effectifs : moins de 100 inscrits dans cette cohorte. Lis la direction, pas les décimales. | Small numbers: fewer than 100 sign-ups in this cohort. Read the direction, not the decimals. |

### 14.4 Vocabulaires fermés — `status.*`, `effort.*`, `repair.*`, `cause.*`, `role.*`, `basis.*`, `variant.*`, `na.*`, `choice.*`

| Clé | FR | EN |
|---|---|---|
| `status.todo` | À renseigner | To fill in |
| `status.requested` | Demandé | Requested |
| `status.measured` | Trouvé | Found |
| `status.estimated` | Estimé | Estimated |
| `status.conflicting` | Deux chiffres | Two numbers |
| `status.missing` | Introuvable | Missing |
| `status.notApplicable` | Sans objet | Not applicable |
| `effort.self5` | Seul, 5 min | On your own, 5 min |
| `effort.self1h` | Seul, ~1 h | On your own, ~1 h |
| `effort.ask` | À demander | Ask someone |
| `effort.build` | À construire | Needs building |
| `repair.meeting` | une réunion | a meeting |
| `repair.afternoon` | une après-midi | an afternoon |
| `repair.sprint` | un sprint | a sprint |
| `repair.quarter` | un trimestre | a quarter |
| `cause.notTracked` | On ne le mesure pas | We don't measure it |
| `cause.notComputed` | Ça existe, mais personne ne l'a calculé | It exists, but nobody has computed it |
| `cause.noAccess` | Ça existe, mais je n'y ai pas accès | It exists, but I have no access |
| `cause.noDefinition` | Personne n'est d'accord sur la définition | Nobody agrees on the definition |
| `cause.conflicting` | J'ai deux chiffres qui ne collent pas | I have two numbers that don't match |
| `cause.notApplicable` | Ça ne s'applique pas à nous | It doesn't apply to us |
| `role.finance` | Finance | Finance |
| `role.data` | Data | Data |
| `role.product` | Produit | Product |
| `role.marketing` | Marketing | Marketing |
| `role.revops` | RevOps | RevOps |
| `role.support` | Support | Support |
| `basis.teamHunch` | Intuition d'équipe | Team hunch |
| `basis.oldNumber` | Un ancien chiffre | An old number |
| `basis.sample` | Un échantillon | A sample |
| `basis.other` | Autre | Other |
| `variant.cac.mediaOnly` | Média seul | Media only |
| `variant.cac.plusTeam` | + équipe marketing | + marketing team |
| `variant.cac.fullyLoaded` | Tout chargé | Fully loaded |
| `variant.ttv.median` | Médiane | Median |
| `variant.ttv.mean` | Moyenne | Average |
| `choice.mechanism.none` | Aucun | None |
| `choice.mechanism.communication` | En communication seulement | In communication only |
| `choice.mechanism.product` | Dans le produit | In the product |
| `choice.causeHow.data` | Par les données | From data |
| `choice.causeHow.interviews` | Par des entretiens | From interviews |
| `choice.causeHow.hunch` | Par intuition | From gut feel |
| `na.noInviteMechanism` | Pas de mécanisme d'invitation | No invite mechanism |
| `na.noFreeTier` | Pas de version gratuite ni d'essai | No free tier or trial |
| `na.notSubscription` | Pas d'abonnement | No subscription |
| `source.someoneTold` | Quelqu'un me l'a donné | Someone gave it to me |
| `source.other` | Autre | Other |

### 14.5 Tiroir, fiche, triage, demande (E3, E3bis, E4) — `sheet.*`, `triage.*`, `request.*`, `collect.*`

| Clé | FR | EN |
|---|---|---|
| `sheet.stageEyebrow` | Étape {i} / 5 · {stage} | Stage {i} / 5 · {stage} |
| `sheet.definition` | Définition → | Definition → |
| `sheet.formula` | Formule | Formula |
| `sheet.cohortToUse` | Prends la cohorte de {cohort} : celle de {next} n'a pas encore eu {n} jours. | Use the {cohort} cohort: {next}'s hasn't had {n} days yet. |
| `sheet.statusQuestion` | Où en es-tu avec ce chiffre ? | Where are you with this number? |
| `sheet.haveIt` | Je l'ai | I have it |
| `sheet.canEstimate` | Je peux l'estimer | I can estimate it |
| `sheet.willAsk` | Je le demande | I'll ask for it |
| `sheet.cantFind` | Je ne le trouve pas | I can't find it |
| `sheet.over` | sur | out of |
| `sheet.live` | {rate}, soit {n} sur 100 {population} | {rate}, i.e. {n} in 100 {population} |
| `sheet.rateOnly` | Je n'ai que le taux | I only have the rate |
| `sheet.rateOnlyHint` | Sans les deux comptes, le chiffre sera marqué approximatif. | Without both counts, the number will be marked approximate. |
| `sheet.source` | D'où vient ce chiffre ? | Where does it come from? |
| `sheet.variant` | Ce qui est compté | What's counted |
| `sheet.definitionNote` | Ta définition (facultatif) | Your definition (optional) |
| `sheet.definitionNoteHint` | Par exemple « actif = au moins un projet modifié ». Elle apparaît dans l'annexe du deck. | For example "active = at least one project edited". It appears in the deck's appendix. |
| `sheet.low` | Au moins | At least |
| `sheet.high` | Au plus | At most |
| `sheet.basis` | Sur quoi repose l'estimation ? | What is the estimate based on? |
| `sheet.wideRange` | Une fourchette aussi large ne dit presque rien — c'est déjà une information. | A range this wide says almost nothing — that is already information. |
| `sheet.whereTitle` | Où le trouver | Where to find it |
| `sheet.trapTitle` | Le piège | The trap |
| `sheet.alsoIn` | Aussi dans {tool} : {metrics} | Also in {tool}: {metrics} |
| `sheet.reference` | Repère | Reference |
| `sheet.referenceContext` | {range} · contexte seulement, {caveat} | {range} · context only, {caveat} |
| `sheet.noReference` | Pas de repère publiable : {reason} | No reference worth publishing: {reason} |
| `sheet.target` | Ta cible (facultatif) | Your target (optional) |
| `sheet.targetHint` | Une cible d'équipe sert de repère pour désigner un frein. | A team target acts as the reference for naming a bottleneck. |
| `sheet.dependsOnEvent` | Il faut d'abord nommer l'événement d'activation. | Name the activation event first. |
| `sheet.note` | Note pour toi | Note to self |
| `sheet.noteHint` | Jamais sur une slide. | Never on a slide. |
| `sheet.save` | Enregistrer | Save |
| ~~`sheet.close`~~ | *retirée le 2026-09-26 : une fiche se replie par l'en-tête de sa ligne* | |
| `triage.question` | Pourquoi ? | Why? |
| `triage.repair` | Le réparer prendrait | Fixing it would take |
| `triage.repairComment` | Précision (facultatif) | Detail (optional) |
| `triage.owner` | Qui l'a ? | Who has it? |
| `triage.readingA` | Premier chiffre | First number |
| `triage.readingB` | Second chiffre | Second number |
| `triage.naReason` | Pourquoi ça ne s'applique pas ? | Why doesn't it apply? |
| `request.copy` | Copier la demande | Copy the request |
| `request.copyGroup` | Copier une demande pour les {n} chiffres | Copy one request for the {n} numbers |
| `request.copied` | Demande copiée | Request copied |
| `request.remind` | Relancer | Follow up |
| `request.stale` | à relancer · demandé il y a {n} jours | follow up · asked {n} days ago |
| `request.message` | Bonjour — je prépare un point sur notre moteur de croissance. Pourrais-tu me sortir : {list} Des chiffres bruts me suffisent, pas de mise en forme. Merci ! | Hi — I'm preparing a review of our growth engine. Could you pull: {list} Raw numbers are enough, no formatting needed. Thanks! |
| `request.item` | – {what} ({definition}) | – {what} ({definition}) |
| `collect.self` | À faire toi-même | To do yourself |
| `collect.ask` | À demander | To ask for |
| `collect.hint` | Lance les demandes aujourd'hui, remplis le reste en attendant. | Send the requests today, fill in the rest while you wait. |
| `collect.fill` | Renseigner | Fill in |
| `collect.empty` | Plus rien à aller chercher. | Nothing left to go and get. |

### 14.6 Diagnostic, comparateur, « et si » — `diagnosis.*`, `whatIf.*`

| Clé | FR | EN |
|---|---|---|
| `diagnosis.clear` | Une étape freine le moteur | One stage holds the engine back |
| `diagnosis.shared` | {n} étapes freinent autant l'une que l'autre | {n} stages hold it back about equally |
| `diagnosis.level` | Rien ne freine le moteur | Nothing holds the engine back |
| `diagnosis.notEnough` | Pas assez de cibles pour conclure | Not enough targets to conclude |
| `diagnosis.belowTarget` | {value}, sous ta cible ({target}) | {value}, below your target ({target}) |
| `diagnosis.notEnoughBody` | Fixe une cible sur au moins deux étapes : c'est ce qui permet de dire laquelle freine. | Set a target on at least two stages: that's what lets us say which one holds you back. |
| `diagnosis.notEnoughBelow` | {stage} est {side}. Sans cible sur les autres étapes, impossible de dire si c'est la plus grosse fuite. | {stage} sits {side}. Without targets on the other stages, we can't say whether it's the biggest leak. |
| `diagnosis.levelBody` | Aucune étape n'est sous sa cible : le levier est le volume ou le prix. | No stage is below its target: the lever is volume or price. |
| `diagnosis.blind` | {stages} n'est pas mesurée : le vrai frein peut s'y cacher. | {stages} isn't measured: the real bottleneck may be hiding there. |
| `diagnosis.blind.other` | {stages} ne sont pas mesurées : le vrai frein peut s'y cacher. | {stages} aren't measured: the real bottleneck may be hiding there. |
| `diagnosis.unpriced` | Aussi sous ta cible, non chiffré en € : {stages} | Also below your target, not priced in €: {stages} |
| `diagnosis.noArpa` | Le churn n'est pas comparable aux autres étapes sans ARPA. | Churn can't be compared with the other stages without ARPA. |
| `diagnosis.topOfFunnel` | La plus grosse perte en nombre est toujours en haut du tunnel ; ce n'est pas ce qui désigne un frein. | The biggest loss in numbers is always at the top of the funnel; that's not what names a bottleneck. |
| `side.*` (depuis P7a et C1) | sous la cible · au-dessus de la cible · à la cible · peut-être sous / au-dessus de la cible — choisis par la direction du chiffre (`phrases.ts#sideKey`) ; les mots « repère » sont retirés le 2026-09-30 (A7.1) | below / above / at the target · possibly below / above the target |
| `diagnosis.noComparator` | sans cible · fixes-en une | no target · set one |
| `whatIf.title` | Et si · toutes choses égales par ailleurs | What if · all else being equal |
| `whatIf.today` | Aujourd'hui | Today |
| `whatIf.if` | Si | If |
| `whatIf.then` | Alors | Then |
| `whatIf.times` | × ARPA | × ARPA |
| `whatIf.todayFlow` | {rate} → {n} nouveaux payants par mois | {rate} → {n} new paying customers a month |
| `whatIf.ifFlow` | {stage} atteint {target} | {stage} reaches {target} |
| `whatIf.thenFlow` | {n} × {target}/{rate} = {m} (+{delta}) | {n} × {target}/{rate} = {m} (+{delta}) |
| `whatIf.timesFlow` | {arpa} → {amount} de MRR ajouté chaque mois | {arpa} → {amount} of MRR added every month |
| `whatIf.todayChurn` | {churn} de churn sur {base} clients payants | {churn} churn on {base} paying customers |
| `whatIf.thenChurn` | {base} × ({churn} − {target}) = {n} clients préservés par mois | {base} × ({churn} − {target}) = {n} customers kept a month |
| `whatIf.timesChurn` | {arpa} → {amount} de MRR préservé chaque mois | {arpa} → {amount} of MRR kept every month |
| `whatIf.annual` | Soit {amount} de MRR de plus au bout d'un an, churn compris. | That's {amount} more MRR after a year, churn included. |
| `whatIf.lessThanOne` | Moins d'un client de plus par mois. | Less than one more customer a month. |
| `whatIf.assumptionActivation` | Hypothèse : les payants sont parmi les activés. | Assumption: paying customers are among the activated. |
| `whatIf.multiplication` | Dans un funnel, les taux se multiplient : +20 % sur n'importe quelle étape donne +20 % de clients. Ce qui distingue les étapes, c'est l'écart à leur cible. | In a funnel, rates multiply: +20% at any stage gives +20% customers. What sets stages apart is the gap to their target. |
| `whatIf.notForecast` | Un calcul, pas une prévision. | A calculation, not a forecast. |
| `whatIf.targetTeam` | {value} (ta cible) | {value} (your target) |

### 14.7 Peloton et miroir — `peloton.*`, `mirror.*`

| Clé | FR | EN |
|---|---|---|
| `peloton.upstream` | ~{n} visiteurs du mois pour 100 inscrits · {source} · {month} | ~{n} visitors a month for 100 sign-ups · {source} · {month} |
| `peloton.signups` | Inscrits | Sign-ups |
| `peloton.activated` | Activés | Activated |
| `peloton.d30` | Actifs à J30 | Active at day 30 |
| `peloton.paid` | Payants à J{n} | Paying by day {n} |
| `peloton.legendReferred` | venus par recommandation ({n}) | came through a referral ({n}) |
| `peloton.legendMeasured` | mesuré | measured |
| `peloton.legendRange` | fourchette estimée | estimated range |
| `peloton.legendUnknown` | non mesuré | not measured |
| `peloton.sameHundred` | Chaque colonne est comptée sur les mêmes 100 inscrits. | Every column is counted on the same 100 sign-ups. |
| `peloton.lessThanOne` | moins de 1 sur 100 ({n} sur 1 000) | fewer than 1 in 100 ({n} in 1,000) |
| `peloton.aria` | {n} sur 100 inscrits {population} — {status}, {source}, cohorte de {cohort} | {n} in 100 sign-ups {population} — {status}, {source}, {cohort} cohort |
| `peloton.title.*` | voir §9.3, slide 1 (mêmes gabarits, un seul module) | see §9.3, slide 1 |
| `mirror.title` | Ce que tu as déclaré au Tour × ce que tu retrouves ici | What you declared in the Tour × what you find here |
| `mirror.blindSpot` | Angles morts | Blind spots |
| `mirror.blindSpotLight` | Angles morts légers | Minor blind spots |
| `mirror.coherent` | Cohérent | Consistent |
| `mirror.better` | Mieux que déclaré | Better than declared |
| `mirror.knownGap` | Lacunes connues | Known gaps |
| `mirror.card` | Au Tour : « {answer} » ({points} pts). Ici : {found}. | In the Tour: "{answer}" ({points} pts). Here: {found}. |
| `mirror.noTour` | Fais le Tour pour comparer ce que ton équipe déclare à ce que tu trouves. | Take the Tour to compare what your team declares with what you find. |
| `mirror.gone` | Le résultat du Tour relié n'est plus sur cet appareil : la comparaison est retirée. | The linked Tour result is no longer on this device: the comparison is removed. |

### 14.8 Écran des slides et chrome des slides — `deck.*`, `slide.*`

| Clé | FR | EN |
|---|---|---|
| `deck.title` | Tes slides | Your slides |
| `deck.include` | Inclure | Include |
| `deck.checks` | {n} points à vérifier avant de projeter | {n} things to check before presenting |
| `deck.checks.one` | 1 point à vérifier avant de projeter | 1 thing to check before presenting |
| `deck.containsData` | Ces fichiers contiennent les chiffres que tu as saisis. | These files contain the numbers you entered. |
| `deck.showCompany` | Nom de l'entreprise sur les slides | Company name on the slides |
| `deck.showCredit` | Mention tourdegrowth.com | tourdegrowth.com credit |
| `deck.showMirror` | Slide « Déclaré × mesuré » | "Declared × measured" slide |
| `deck.showMirrorHint` | Le Tour est une auto-évaluation : à montrer seulement si l'écart est ton argument. | The Tour is a self-assessment: show it only if the gap is your argument. |
| `deck.png` | Image (PNG) | Image (PNG) |
| `deck.pngHd` | Haute définition | High definition |
| `deck.copyImage` | Copier l'image | Copy image |
| `deck.pdf` | Télécharger le PDF | Download the PDF |
| `deck.pdfMobile` | Plus fiable depuis un ordinateur. | More reliable from a computer. |
| `deck.copyText` | Copier le texte et les notes | Copy the text and notes |
| `deck.textCopied` | Texte copié | Text copied |
| `deck.pngFailed` | L'image n'a pas pu être créée dans ce navigateur. Le PDF fonctionne. | The image couldn't be created in this browser. The PDF works. |
| `deck.englishHint` | Pour un deck en anglais, passe la page en EN : tes chiffres te suivent. | For a deck in French, switch the page to FR: your numbers follow you. |
| `ask.title` | Ce que tu demandes | What you're asking for |
| `ask.what` | Quoi (120 caractères) | What (120 characters) |
| `ask.cost` | Ce que ça coûte | What it costs |
| `ask.costMoney` | Un montant | An amount |
| `ask.costTeam` | {weeks} semaines d'une équipe de {people} | {weeks} weeks of a team of {people} |
| `ask.horizon` | D'ici | By |
| `ask.successMetric` | Comment nous saurons | How we'll know |
| `ask.bullets` | Ce que ça finance (3 puces au plus) | What it funds (3 bullets at most) |
| `ask.measureFirst` | Ce qu'il faut d'abord mesurer | What to measure first |
| `slide.kicker` | Moteur de growth · {company}{month} · données internes | Growth engine · {company}{month} · internal data |
| `slide.dataPill` | Données : {m} mesurées · {a} approximatives · {x} introuvables | Data: {m} measured · {a} approximate · {x} missing |
| `slide.footer` | Cohorte d'inscrits de {cohort} · flux de {month} · sources : {tools} | {cohort} sign-up cohort · {month} flows · sources: {tools} |
| `slide.leakFooter` | Toutes choses égales par ailleurs · {assumption} | All else being equal · {assumption} |
| `slide.leakAside` | À côté | Alongside |
| `slide.cannotExclude` | non mesuré — ne peut pas être exclu | not measured — can't be ruled out |
| `slide.calcTitle` | Le calcul | The calculation |
| `slide.visibilityLeft` | Ce qu'on voit | What we can see |
| `slide.visibilityRight` | Ce qui manque, du plus rapide au plus long à réparer | What's missing, quickest to slowest to fix |
| `slide.unitCap` | durée de vie plafonnée à 36 mois | lifetime capped at 36 months |
| `slide.askFunds` | Ce que ça finance | What it funds |
| `slide.askKnow` | Comment nous saurons | How we'll know |
| `slide.askMeasure` | Ce qu'il faut d'abord mesurer | What to measure first |
| `slide.askCheckpoint` | relevé mensuel, premier point le {date} | monthly reading, first checkpoint on {date} |
| `slide.annexTitle` | Définitions et sources ({i}/{n}) | Definitions and sources ({i}/{n}) |
| `slide.annexCols` | Chiffre · Formule · Fenêtre · Période · Source · Statut · Confiance | Number · Formula · Window · Period · Source · Status · Confidence |
| `slide.titles.*` | les gabarits de §9.3, un par cas et par accord | the §9.3 templates, one per case and plural form |
| `notes.compared` | Comparé à quoi ? — {comparator}. | Compared with what? — {comparator}. |
| `notes.source` | D'où vient ce chiffre ? — {tool}, {period}, cohorte de {cohort}. | Where does this number come from? — {tool}, {period}, {cohort} cohort. |
| `notes.seasonal` | Et si c'est saisonnier ? — Un seul mois est mesuré ; la comparaison mois à mois viendra. | What if it's seasonal? — Only one month is measured; month-on-month comparison will come. |
| `notes.whyNot` | Pourquoi pas {stage} ? — {ranking}. | Why not {stage}? — {ranking}. |

(La clé `deck.englishHint` est affichée dans la langue de la page et pointe vers
l'autre : FR dit « passe la page en EN », EN dit "switch the page to FR".)

### 14.9 Constats — `findings.*`

| Clé | FR | EN |
|---|---|---|
| `findings.chainBreak` | Sur 100 inscrits, on ne sait pas dire combien {verb}. | Out of 100 sign-ups, we can't say how many {verb}. |
| `findings.verb.activated` | atteignent la première valeur | reach first value |
| `findings.verb.d30` | sont encore là à J30 | are still active at day 30 |
| `findings.verb.paid` | paient | pay |
| `findings.noDefinition` | Il n'existe pas de définition partagée de {metric} — tout chiffre qu'on en donnerait serait l'opinion de quelqu'un. | There's no shared definition of {metric} — any number given for it would be someone's opinion. |
| `findings.blindSpot` | L'équipe déclare suivre {metric} ; personne n'a pu le sortir. | The team says it tracks {metric}; nobody could pull it. |
| `findings.belowComparator` | {metric} : {value}, sous {comparator}. | {metric}: {value}, below {comparator}. |
| `findings.conflict` | {metric} : {a} selon {sourceA}, {b} selon {sourceB}. | {metric}: {a} according to {sourceA}, {b} according to {sourceB}. |
| `findings.unitEcon` | Impossible de dire en combien de mois un client rembourse son coût : {input} n'est pas mesurée. | We can't say how many months a customer takes to pay back their cost: {input} isn't measured. |
| `findings.reconcile` | Ta chaîne prédit ~{p} nouveaux payants en {month} ; ta facturation en compte {n}. Au moins une définition ne porte pas sur la même population. | Your chain predicts ~{p} new paying customers in {month}; your billing counts {n}. At least one definition doesn't cover the same population. |
| `findings.smallCohort` | Moins de 100 inscrits dans la cohorte : chaque inscrit pèse plus d'un point. | Fewer than 100 sign-ups in the cohort: each one weighs more than a point. |
| `findings.hiddenKnowledge` | Tu en sais plus que ton Tour ne le dit : {metric} est suivi. | You know more than your Tour says: {metric} is tracked. |

### 14.10 Contrôles de cohérence — `sanity.*`

Les huit messages FR de §6.9, plus : EN
`numGtDen` "More {num} than {den}: one of the two isn't the right one." ·
`retainedGtActivated` "More active users at day 30 than activated ones: your
activation definition may be too strict." · `paidGtRetained` "More paying
customers than active users at day 30: annual prepayment?" · `churnHigh` "Is that
really a monthly churn?" · `marginOdd` "Check what's counted in direct costs." ·
`ttvMean` "An average drops when stragglers give up: use the median." ·
`cohortMismatch` "The peloton's columns don't cover the same cohort." ·
`reconcileGap` = `findings.reconcile`.

### 14.11 Stockage, fichier, reprise, effacement — `storage.*`, `io.*`, `resume.*`, `erase.*`

| Clé | FR | EN |
|---|---|---|
| `storage.backupWarning` | Ton moteur n'existe que dans ce navigateur. Safari efface les données d'un site non visité depuis 7 jours. | Your engine only exists in this browser. Safari erases data from a site not visited for 7 days. |
| `storage.neverExported` | Jamais sauvegardé | Never saved |
| `storage.lastExported` | Dernière sauvegarde : {date} | Last saved: {date} |
| `storage.writeFailed` | Impossible d'enregistrer sur cet appareil. Sauvegarde ta saisie dans un fichier pour ne rien perdre. | Can't save on this device. Save your entries to a file so you lose nothing. |
| `storage.unreadable` | Les données enregistrées sur cet appareil sont illisibles. Reprends depuis un fichier sauvegardé. | The data saved on this device can't be read. Start again from a saved file. |
| `io.importTitle` | Importer un moteur | Import an engine |
| `io.importPreview` | {company} · {month} · {n} chiffres sur {N} | {company} · {month} · {n} of {N} numbers |
| `io.replace` | Remplacer celui de cet appareil | Replace the one on this device |
| `io.cancel` | Annuler | Cancel |
| `io.warnings` | Fichier ouvert avec {n} avertissements : | File opened with {n} warnings: |
| `io.unknownVersion` | Ce fichier vient d'une version plus récente du moteur : il ne peut pas être lu ici. | This file comes from a newer version of the engine: it can't be read here. |
| `io.notEngine` | Ce fichier n'est pas un moteur Tour de Growth. | This file isn't a Tour de Growth engine. |
| `resume.band` | Tu as trouvé {n} chiffres sur {N}. Depuis ta dernière visite (il y a {days} jours) : {pending}. | You've found {n} of {N} numbers. Since your last visit ({days} days ago): {pending}. |
| `resume.pendingRequests` | {n} demande(s) à relancer ({role}, {metric}) | {n} request(s) to follow up ({role}, {metric}) |
| `resume.continue` | Reprendre | Continue |
| `resume.remind` | Relancer {role} | Follow up with {role} |
| `erase.title` | Tout effacer | Erase everything |
| `erase.body` | Tes chiffres seront supprimés de cet appareil. Sauvegarde-les d'abord si tu veux les garder. | Your numbers will be deleted from this device. Save them first if you want to keep them. |
| `erase.confirmLabel` | Tape « {word} » pour confirmer | Type "{word}" to confirm |
| `erase.fallbackWord` | EFFACER | ERASE |
| `erase.confirm` | Effacer définitivement | Erase permanently |

### 14.12 FAQ de la page (E0, statique) — `faq.*`

| Q / R | FR | EN |
|---|---|---|
| Q1 | Mes chiffres sont-ils envoyés quelque part ? | Are my numbers sent anywhere? |
| R1 | Non. Ils sont enregistrés dans le stockage local de ton navigateur, sur cet appareil. Aucune requête ne les transporte ; les seules façons de les faire sortir sont un fichier que tu télécharges ou ce que tu copies toi-même. | No. They're stored in your browser's local storage, on this device. No request carries them; the only ways out are a file you download or what you copy yourself. |
| Q2 | Pourquoi des comptes plutôt que des pourcentages ? | Why counts rather than percentages? |
| R2 | Parce qu'un pourcentage sans sa base ne se vérifie pas. « 144 sur 800 » se recompte ; « 18 % » ne dit pas de quoi. | Because a percentage without its base can't be checked. "144 out of 800" can be recounted; "18%" doesn't say of what. |
| Q3 | D'où viennent les repères ? | Where do the references come from? |
| R3 | Seulement des ordres de grandeur déjà publiés et relus dans le glossaire du site, avec leur réserve. La plupart des étapes n'en ont pas : ta propre cible est alors la référence. | Only orders of magnitude already published and reviewed in the site's glossary, with their caveat. Most stages have none: your own target is then the reference. |
| Q4 | Que faire d'un chiffre introuvable ? | What do I do with a number I can't find? |
| R4 | Le dire. Un chiffre introuvable est un constat : l'outil te demande pourquoi, ce que coûterait de le réparer, et le met sur une slide. | Say so. A number you can't find is a finding: the tool asks why, what fixing it would cost, and puts it on a slide. |
| Q5 | En quoi est-ce différent du Tour ? | How is this different from the Tour? |
| R5 | Le Tour mesure en trois minutes si ton équipe suit ses chiffres. Le moteur te fait aller les chercher, et confronte les deux si tu as fait le Tour. | The Tour measures in three minutes whether your team tracks its numbers. The engine has you go and get them, and compares the two if you've taken the Tour. |

### 14.13 Catalogue — `content/engine-catalog.ts`, par chiffre

Pour chaque chiffre : `name`, `oneLiner`, `formula`, `inputs` (taux), `where[]`
(`label` = outil, `path` = chemin), `trap`, `request` (ce qu'il faut sortir),
`noReferenceReason` ou `benchmarkCaveat`. Les chemins de menu sont **à revérifier
à la rédaction** (les interfaces bougent) ; le fichier porte
`ENGINE_CATALOG_VERSION` et la page affiche « chemins vérifiés en {mois} ».

**`acq.signup-rate`**
- name : Taux d'inscription / Sign-up rate
- oneLiner : La part des visiteurs du mois qui créent un compte. / The share of the month's visitors who create an account.
- formula : inscrits du mois ÷ visiteurs uniques du mois / sign-ups in the month ÷ unique visitors in the month
- inputs : Inscriptions du mois · Visiteurs uniques du mois / Sign-ups in the month · Unique visitors in the month
- where : GA4 — Rapports › Acquisition › Acquisition de trafic, colonne Utilisateurs (pas Sessions) / Reports › Acquisition › Traffic acquisition, the Users column (not Sessions) · Mixpanel ou Amplitude — un entonnoir Page vue → Inscription sur le mois / a Page view → Sign-up funnel over the month · Base produit — les comptes créés sur le mois, plus fiable pour le numérateur / accounts created in the month, more reliable for the numerator
- trap : Numérateur et dénominateur viennent souvent de deux outils qui ne comptent pas pareil : dis-le dans ta définition. / Numerator and denominator often come from two tools that count differently: say so in your definition.
- request : le nombre de visiteurs uniques et le nombre d'inscriptions sur {month} / the number of unique visitors and the number of sign-ups in {month}
- benchmarkCaveat : pour du trafic payant froid, bien plus pour du trafic chaud — ton trafic est un mélange, donc ce repère ne désigne pas de frein / for cold paid traffic, far higher for warm traffic — your traffic is a mix, so this reference never names a bottleneck

**`acq.top-channel-share`**
- name : Part du premier canal / Top channel share
- oneLiner : Combien de tes inscrits viennent de ton meilleur canal. / How many of your sign-ups come from your best channel.
- formula : inscrits venus du premier canal ÷ inscrits du mois / sign-ups from the top channel ÷ sign-ups in the month
- inputs : Inscrits du premier canal · Inscrits du mois / Sign-ups from the top channel · Sign-ups in the month ; + « Nom du canal » / "Channel name"
- where : GA4 — Acquisition d'utilisateurs, dimension Groupe de canaux par défaut du premier utilisateur / User acquisition, dimension First user default channel group · HubSpot — propriété Source d'origine des contacts créés sur le mois / the Original Source property of contacts created in the month · Salesforce — champ Lead Source / the Lead Source field
- trap : Dans GA4, « Referral » veut dire « site référent », pas « recommandation d'un client ». / In GA4, "Referral" means "referring site", not "a customer's recommendation".
- request : le nombre d'inscrits de {month} par canal d'origine / the number of {month} sign-ups by original channel
- noReferenceReason : aucun seuil de dépendance n'est publiable ; la part et le nom du canal suffisent à ouvrir la discussion / no dependency threshold is worth publishing; the share and the channel's name are enough to open the discussion

**`acq.cac`**
- name : CAC / CAC
- oneLiner : Ce que coûte un nouveau client payant. / What a new paying customer costs.
- formula : dépense d'acquisition du mois ÷ nouveaux clients payants du mois / acquisition spend in the month ÷ new paying customers in the month
- inputs : Dépense d'acquisition du mois · Nouveaux clients payants du mois / Acquisition spend in the month · New paying customers in the month
- where : Google Ads, Meta Ads Manager, LinkedIn Campaign Manager — le coût du mois, toutes campagnes / the month's cost, all campaigns · Finance — la masse salariale ventes et marketing, pour la variante « tout chargé » / sales and marketing payroll, for the "fully loaded" variant · Stripe ou Chargebee — les abonnements créés et payés dans le mois, hors essais / subscriptions created and paid in the month, trials excluded
- trap : Dépense du mois ÷ clients du mois est faux dès que le cycle de vente dépasse un mois : dis-le. / This month's spend ÷ this month's customers is wrong as soon as the sales cycle is longer than a month: say so.
- request : la dépense d'acquisition de {month} ({variant}) et le nombre de nouveaux clients payants du mois / {month}'s acquisition spend ({variant}) and the number of new paying customers that month
- noReferenceReason : il n'y a pas de bon CAC dans l'absolu — il se juge contre ce qu'un client rapporte (payback, LTV:CAC) / there's no good CAC in absolute terms — it's judged against what a customer brings in (payback, LTV:CAC)

**`act.event`**
- name : Événement d'activation / Activation event
- oneLiner : L'action qui prouve qu'un inscrit a touché la valeur du produit. / The action that proves a sign-up has reached the product's value.
- formula : le nom de l'action, et sa fenêtre en jours / the action's name, and its window in days
- where : Produit — c'est une décision de l'équipe produit, pas un chiffre d'outil / Product — it's a product team decision, not a tool figure
- trap : Un événement choisi parce qu'il est facile à compter n'est pas un moment de valeur. / An event picked because it's easy to count isn't a moment of value.
- request : le nom de l'événement qui marque la première valeur, et sa fenêtre / the name of the event that marks first value, and its window

**`act.rate`**
- name : Taux d'activation / Activation rate
- oneLiner : La part des inscrits qui atteignent la première valeur à temps. / The share of sign-ups who reach first value in time.
- formula : inscrits de la cohorte ayant fait {event} sous {n} jours ÷ inscrits de la cohorte / cohort sign-ups who did {event} within {n} days ÷ cohort sign-ups
- inputs : Activés sous {n} jours · Inscrits de {cohort} / Activated within {n} days · {cohort} sign-ups
- where : Amplitude — Funnel Analysis, Inscription → {event}, fenêtre de conversion {n} jours / Funnel Analysis, Sign-up → {event}, {n}-day conversion window · Mixpanel — rapport Funnels, conversion window de {n} jours / Funnels report, {n}-day conversion window · GA4 — Explorer › Exploration de l'entonnoir, si l'événement est envoyé / Explore › Funnel exploration, if the event is sent
- trap : Change l'événement et le taux change d'un facteur trois : écris ta définition. / Change the event and the rate moves threefold: write your definition down.
- request : pour la cohorte des inscrits de {cohort}, combien ont fait {event} sous {n} jours, et la taille de la cohorte / for the {cohort} sign-up cohort, how many did {event} within {n} days, and the cohort size
- benchmarkCaveat : pour un onboarding SaaS, souvent plus bas en essai gratuit ; dépend entièrement de l'exigence de ton événement / for SaaS onboarding, often lower for free trials; depends entirely on how demanding your event is

**`act.ttv`**
- name : Time-to-value médian / Median time to value
- oneLiner : Combien de temps il faut à un inscrit pour atteindre la première valeur. / How long a sign-up takes to reach first value.
- formula : médiane du délai entre l'inscription et {event} / median delay between sign-up and {event}
- where : Amplitude ou Mixpanel — la vue « time to convert » de l'entonnoir / the funnel's "time to convert" view · GA4 — pas de médiane native : à demander à la data / no native median: ask the data team
- trap : Une moyenne baisse quand les traînards abandonnent : prends la médiane. / An average drops when stragglers give up: use the median.
- request : le délai médian entre l'inscription et {event}, cohorte de {cohort} / the median delay between sign-up and {event}, {cohort} cohort
- noReferenceReason : « dès la première session » est une ambition souvent citée, pas une norme mesurée / "within the first session" is an often-quoted ambition, not a measured norm

**`ret.d30`**
- name : Rétention à J30 / Day-30 retention
- oneLiner : La part des inscrits encore actifs un mois après. / The share of sign-ups still active a month later.
- formula : inscrits de la cohorte encore actifs 30 jours après l'inscription ÷ inscrits de la cohorte / cohort sign-ups still active 30 days after signing up ÷ cohort sign-ups
- inputs : Actifs à J30 · Inscrits de {cohort} / Active at day 30 · {cohort} sign-ups
- where : Amplitude — Retention Analysis, événement de départ Inscription / Retention Analysis, starting event Sign-up · Mixpanel — rapport Retention / Retention report · GA4 — Explorer › Exploration de cohortes / Explore › Cohort exploration
- trap : « Actif » doit être écrit : une connexion n'est pas un usage. / "Active" must be written down: a login isn't usage.
- request : pour la cohorte des inscrits de {cohort}, combien étaient encore actifs 30 jours après leur inscription, et la taille de la cohorte / for the {cohort} sign-up cohort, how many were still active 30 days after signing up, and the cohort size
- noReferenceReason : les ordres de grandeur publiés portent sur les applis grand public ; en SaaS, la forme de la courbe compte plus que le niveau / the published orders of magnitude are for consumer apps; in SaaS, the curve's shape matters more than its level

**`ret.logo-churn`**
- name : Churn logo mensuel / Monthly logo churn
- oneLiner : La part des clients payants qui partent dans le mois. / The share of paying customers who leave in the month.
- formula : clients payants perdus dans le mois ÷ clients payants au 1er du mois / paying customers lost in the month ÷ paying customers on the 1st
- inputs : Clients perdus en {month} · Clients payants au 1er {month} / Customers lost in {month} · Paying customers on {month} 1
- where : Stripe — Billing, vue d'ensemble, churn des abonnés (selon ton offre) / Billing, overview, subscriber churn (depending on your plan) · Chargebee — RevenueStory (selon l'édition) / RevenueStory (depending on edition) · ChartMogul ou Baremetrics — churn clients / customer churn
- trap : Un churn mensuel au-dessus de 30 % est souvent un chiffre annuel : vérifie. / A monthly churn above 30% is often an annual figure: check.
- request : le nombre de clients payants au 1er {month} et le nombre de clients perdus dans le mois / the number of paying customers on {month} 1 and the number lost during the month
- benchmarkCaveat : pour des produits vendus aux petites entreprises ; les produits entreprise visent bien plus bas, les abonnements grand public tournent bien plus haut / for products sold to small businesses; enterprise products aim much lower, consumer subscriptions run much higher

**`ret.churn-cause`**
- name : Cause principale de churn / Main churn cause
- oneLiner : Pourquoi les clients partent, et comment tu le sais. / Why customers leave, and how you know.
- formula : la cause, et sa source : données, entretiens ou intuition / the cause, and its source: data, interviews or gut feel
- where : HubSpot ou Salesforce — le champ raison de perte / the loss-reason field · Support — relire les derniers départs / read the latest cancellations
- trap : Une intuition partagée par toute l'équipe reste une intuition. / A hunch shared by the whole team is still a hunch.
- request : la raison la plus fréquente des départs de ces trois derniers mois, et d'où elle vient / the most frequent reason for cancellations over the last three months, and where it comes from

**`ref.mechanism`**
- name : Mécanisme de recommandation / Referral mechanism
- oneLiner : Ce qui permet à un utilisateur d'en amener un autre. / What lets one user bring in another.
- where : Produit — l'équipe produit / Product — the product team
- trap : Le bouche-à-oreille existe sans mécanisme : ne pas en avoir ne dispense pas de mesurer la part recommandée. / Word of mouth exists without a mechanism: not having one doesn't excuse you from measuring the referred share.

**`ref.referred-share`**
- name : Part des inscrits recommandés / Referred sign-up share
- oneLiner : La part des inscrits amenés par un utilisateur. / The share of sign-ups brought in by a user.
- formula : inscrits arrivés par un utilisateur (code, lien d'invitation, réponse « comment nous as-tu connus ? ») ÷ inscrits de la cohorte / sign-ups who came through a user (code, invite link, "how did you hear about us?" answer) ÷ cohort sign-ups
- inputs : Inscrits recommandés · Inscrits de {cohort} / Referred sign-ups · {cohort} sign-ups
- where : Outil de parrainage ou table d'invitations — les inscrits avec un parrain / referral tool or invitations table — sign-ups with a referrer · HubSpot — la propriété « comment nous avez-vous connus » / the "how did you hear about us" property
- trap : La source « referral » de GA4 compte des sites, pas des recommandations. / GA4's "referral" source counts websites, not recommendations.
- request : pour la cohorte de {cohort}, combien d'inscrits sont arrivés par un code, une invitation ou une recommandation déclarée / for the {cohort} cohort, how many sign-ups came through a code, an invite or a declared recommendation
- noReferenceReason : de presque zéro à la majorité selon que le produit se voit ou non : compare-toi à toi-même / from nearly zero to a majority depending on whether the product is visible to others: compare with yourself

**`ref.k-factor`**
- name : Coefficient viral (K) / Viral coefficient (K)
- oneLiner : Combien de nouveaux inscrits chaque utilisateur amène. / How many new sign-ups each user brings in.
- formula : inscrits invités par la cohorte ÷ taille de la cohorte / sign-ups invited by the cohort ÷ cohort size
- inputs : Inscrits invités par la cohorte · Inscrits de {cohort} / Sign-ups invited by the cohort · {cohort} sign-ups
- where : Mixpanel ou Amplitude, avec la table d'invitations / Mixpanel or Amplitude, with the invitations table
- trap : K se divise par tous les utilisateurs, pas seulement ceux qui ont partagé. / K divides by every user, not just those who shared.
- request : pour la cohorte de {cohort}, le nombre d'inscrits amenés par ses invitations / for the {cohort} cohort, the number of sign-ups its invitations brought in
- benchmarkCaveat : fourchette réaliste pour la plupart des produits ; un K durable au-dessus de 1 est rare et temporaire / realistic range for most products; a sustained K above 1 is rare and temporary

**`rev.paid-conversion`**
- name : Conversion inscrit → payant / Sign-up to paid conversion
- oneLiner : La part des inscrits qui paient dans la fenêtre. / The share of sign-ups who pay within the window.
- formula : inscrits de la cohorte ayant payé sous {n} jours ÷ inscrits de la cohorte / cohort sign-ups who paid within {n} days ÷ cohort sign-ups
- inputs : Payants sous {n} jours · Inscrits de {cohort} / Paying within {n} days · {cohort} sign-ups
- where : Data — une jointure entre la base produit et Stripe ou Chargebee sur l'identifiant client / a join between the product database and Stripe or Chargebee on the customer id · HubSpot ou Salesforce — les affaires gagnées de la cohorte, si une vente intervient / the cohort's won deals, if sales is involved
- trap : Les chiffres qui circulent mélangent essai, freemium et carte à l'inscription : ne compare qu'à toi-même. / The numbers that circulate mix trials, freemium and card-at-sign-up: compare only with yourself.
- request : pour la cohorte des inscrits de {cohort}, combien ont payé sous {n} jours, et la taille de la cohorte / for the {cohort} sign-up cohort, how many paid within {n} days, and the cohort size
- noReferenceReason : aucun taux publié ne porte sur la même base que le tien / no published rate uses the same base as yours

**`rev.arpa`**
- name : ARPA mensuel / Monthly ARPA
- oneLiner : Le revenu mensuel moyen d'un client payant. / The average monthly revenue of a paying customer.
- formula : MRR ÷ clients payants / MRR ÷ paying customers
- inputs : MRR de {month} · Clients payants / {month} MRR · Paying customers
- where : Stripe — Billing, MRR et clients actifs / Billing, MRR and active customers · Chargebee — le rapport MRR / the MRR report · ChartMogul — ARPA / ARPA
- trap : Un ARPA qui monte pendant que la base baisse, ce sont souvent les petits clients qui partent. / An ARPA rising while the base shrinks is usually small customers leaving.
- request : le MRR de fin {month} et le nombre de clients payants / {month}'s closing MRR and the number of paying customers
- noReferenceReason : il varie de trois ordres de grandeur entre catégories / it varies by three orders of magnitude between categories

**`rev.gross-margin`**
- name : Marge brute / Gross margin
- oneLiner : Ce qu'il reste d'un paiement après le coût de le servir. / What's left of a payment after the cost of serving it.
- formula : (revenu − coût direct de service : hébergement, frais de paiement, support) ÷ revenu / (revenue − direct cost of service: hosting, payment fees, support) ÷ revenue
- inputs : Marge brute du mois · Revenu du mois / Gross profit in the month · Revenue in the month
- where : Finance — le compte de résultat du mois / Finance — the month's income statement
- trap : Prendre le revenu au lieu de la marge flatte le payback : c'est la marge qui rembourse le CAC. / Using revenue instead of margin flatters the payback: margin is what pays the CAC back.
- request : la marge brute du dernier trimestre clos, et ce qu'elle inclut / gross margin for the last closed quarter, and what it includes
- benchmarkCaveat : en SaaS ; bien moins dès qu'il y a de la prestation humaine / in SaaS; much lower as soon as there's human delivery

**Calculés** (`rev.ltv`, `rev.cac-payback`, `rev.ltv-cac`) : `name` LTV / LTV ·
CAC payback / CAC payback · LTV:CAC / LTV:CAC ; `formula` comme §5.7 ;
`uncomputable` : « incalculable — manque : {input} » / "can't be computed —
missing: {input}" ; `capNote` : « durée de vie plafonnée à 36 mois : la plupart
des praticiens plafonnent à trois à cinq ans ; on prend le bas » / "lifetime
capped at 36 months: most practitioners cap it at three to five years; we take
the low end" ; `paybackCaveat` : « la vraie comparaison est ta trésorerie » /
"the real comparison is your runway".

### 14.14 Légal

La phrase de §11.5, dans `content/legal.ts`.

---

## 15. Reporté

**v1.1** (dès la v1 stable, sans nouveau modèle de données) :
- profil **B2B en vente assistée** (deux pelotons : 100 leads avant vente, 100
  nouveaux clients après ; ~6 chiffres différents) — le cas d'AB Tasty (Q3) ;
- profil **app grand public** (libellés et sources ; le repère 20-30 % à J30
  devient désignant) ;
- outils cochés au réglage + « À faire toi-même » groupé par outil ; recettes
  détaillées par outil (2-5 étapes de menu, `verifiedAt` par recette) ;
- lien depuis la page de résultat du propriétaire (« Tu mesures déjà cette
  étape ? Mets tes vrais chiffres dans le moteur », `copy-review.md` §4.3) et
  ligne de reprise dans `LastResult` sur la landing ;
- rappel `.ics` généré localement (« me le rappeler dans 5 jours ») ;
- contrôle « numérateur et dénominateur viennent de deux outils » ;
- promotion des primitives `_ui/` au design system (brief Claude Design) ;
- image OG propre à la page (aujourd'hui : l'image de contenu générique) ;
- factorisation `lib/game/access.ts` + `lib/engine/access.ts` en un module de
  drapeaux.

**v2** :
- **la série** : « démarrer le mois suivant » (deuxième `Snapshot`), deltas mois
  à mois sur l'écran et en slide (« l'activation est passée de 18 à 24 % ») ;
- **PPTX** éditable (typographie système assumée) si les retours le demandent ;
- place de marché (deux funnels, offre et demande) ;
- NRR/GRR, expansion ; monétisation de la boucle de recommandation
  (multiplicateur 1 ÷ (1 − part)) et de la rétention J30 ;
- « et si » combiné sur plusieurs étapes, et dans le deck ;
- plusieurs moteurs par appareil ; fusion à l'import ;
- « coller un export CSV » pour remplir plusieurs chiffres d'un coup ;
- thème de slide « neutre » (fond blanc) pour les gabarits d'entreprise ;
- superposition « étape nommée par le Tour » vs « étape nommée par les chiffres ».

---

## 16. Risques

| # | Risque | Parade |
|---|---|---|
| R1 | **Fausse précision** — le risque central ; les deux prototypes CODIR et ma propre maquette l'ont montré | intervalles propagés, « pour 100 » entiers, 2 chiffres significatifs, une seule fonction de formatage, chaîne affichée recalculable, titre = corps (tests) |
| R2 | Repères lus comme des normes en COMEX | deux repères désignants seulement, réserve toujours imprimée, cible d'équipe au premier plan, « pas de repère publiable » dit franchement, test anti-dérive contre le glossaire approuvé |
| R3 | Hypothèses cachées dans l'impact | « toutes choses égales par ailleurs » et « payants parmi les activés » imprimés sur l'écran et la slide ; rétention J30 et recommandation non chiffrées |
| R4 | Chiffres d'employeur (confidentialité) | tout local, prouvé par la canari ; kicker « données internes » ; note de collecte jamais sur une slide ; avertissement avant export ; `legal.ts` à jour |
| R5 | **Perte du stockage** (Safari efface après 7 jours sans visite) — l'outil se complète sur plusieurs jours | bandeau de sauvegarde permanent tant que non exporté, `.json` en un clic, `navigator.storage.persist()` |
| R6 | Impression : `@page size` et fonds selon navigateur, Safari | `print-color-adjust: exact`, repli PNG annoncé, spec print sur Chromium ; Safari et Firefox vérifiés **à la main** avant l'ouverture (limite dite) |
| R7 | `html-to-image` sous Safari (polices au premier rendu) | premier rendu à blanc, `document.fonts.ready`, message + repli PDF |
| R8 | Glyphes absents (arrows, ≈, U+202F) | liste blanche + normalisation + contrôle des polices du PDF |
| R9 | Chemins de menu des outils qui bougent | version du catalogue affichée, formulation au conditionnel sur l'édition, revue annuelle |
| R10 | Cohortes immatures, définitions hétérogènes | cohorte mûre calculée, saisie en comptes, `definitionNote`, contrôles de cohérence, rapprochement |
| R11 | Volume de copie (≈ 250 chaînes × 2 langues) | un bon à tirer dédié (nº6) ; les nombres des repères repris du glossaire approuvé |
| R12 | Coût Vercel | 2 routes prérendues, zéro fonction, un seul merge sur `main` via `feat/engine` |
| R13 | Dérive vers l'instrument d'audit ou le « cockpit » | 15 chiffres, pas de série en v1, pas de connecteur, pas d'import de `lib/audit` ; confirmation de la ligne `AUDIT.md` §0 (Q6) |
| R14 | Conflit de fichiers avec le jeu (`proxy.ts`) | un seul bloc ajouté, rebase avant push, propriétaire unique |
| R15 | Hydratation (compteurs qui clignotent) | rien de lu dans l'état initial ; le HTML serveur est l'état vide |

---

## 17. Questions pour Antoine (décisions produit)

1. **Nom et adresse** : « Moteur de croissance » à `/{fr,en}/aarrr-funnel-template`
   (la requête sans concurrent repérée par l'audit SEO), ou `/growth-engine` ?
   Irréversible une fois publié.
2. **Mention « tourdegrowth.com » sur les slides** : activée par défaut et
   désactivable (boucle de distribution — recommandé), ou désactivée par défaut
   (le deck appartient à l'utilisateur) ?
3. **Vente assistée en v1.1** (ton cas, et celui de beaucoup de Heads of Growth
   B2B) : d'accord pour une v1 en libre-service seul ?
4. **Le déclaré du Tour sur une slide** : slide « Déclaré × mesuré » disponible
   mais décochée par défaut — ou jamais sur une slide ?
5. **Repères externes comme comparateurs désignants** (activation 20-40 %, churn
   1-2 %/mois, avec réserve imprimée) — ou seulement des cibles d'équipe ?
6. **La ligne de la phase 3** (`AUDIT.md` §0 : le « cockpit growth » attend une
   vérification du contrat de travail) : ce moteur gratuit, public, local, sans
   connecteur ni saisie récurrente, est-il bien hors de ce périmètre pour toi ?
7. **Critère d'ouverture et annonce** : poser `ENGINE_ENABLED` après le bon à
   tirer nº6 et une vérification manuelle Safari/Firefox — et l'annoncer depuis
   `/how-it-works`, les pages porte ouverte et une section de landing sous la
   citation, sans 7ᵉ lien de pied de page ?

---

## 18. Le B2B assisté et l'hybride — spécification A7.3.a, à valider

*Premier jet du 2026-09-30, écrit contre le code de `main` (`c8ec215`, A7.1
livré) et non contre les documents. Rien ici n'est codé ni validé. Il revient
à Antoine comme une question (`CHANTIERS.md` A7.3.b) et rien ne se code avant
sa réponse. Toute la copie citée est de la copie neuve, **`TODO: à relire`**
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
une cochée. L'assisté a **son propre catalogue** : 14 chiffres propres, trois
au plus par étape (deux en Referral), un ★ par étape, plus la marge brute,
**commune** aux deux motions. Il a aussi son propre funnel, dessiné en
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
  venues de comptes du libre-service.

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
- Il ne propose aucun « Et si » qui traverse les motions en v1.

**Chiffrage.** Six PR sur une branche d'intégration, ~10 jours-agent, un seul
merge sur `main`, drapeau fermé (§18.11).

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
  | "slg.rev.win-rate" | "slg.rev.acv" | "slg.rev.arpa";
export type LinkMetricId = "link.pql-handoff";
export type MetricId = PlgMetricId | SlgMetricId | LinkMetricId;

export type DerivedId =
  | "rev.ltv" | "rev.cac-payback" | "rev.ltv-cac" | "rev.nrr" | "rev.grr"
  | "slg.rev.ltv" | "slg.rev.cac-payback" | "slg.rev.ltv-cac";

export type ToolId = /* existants */ | "pipedrive" | "cs-platform"; // « Outil de Customer Success (Gainsight, Vitally, Planhat…) »
export type RoleId = /* existants */ | "sales" | "customer-success";

/** SLG : trois comptes partagés de plus (S6). */
export type SharedCount =
  | "cohortSignups" | "monthSignups" | "mrrEnd" | "mrrStart"
  | "slgOppsCreated" | "slgDealsWon" | "slgCustomers";

export type LeverId =
  | /* les 8 leviers PLG */
  | "slg.acq.lead-to-opp" | "slg.rev.win-rate" | "slg.rev.acv" | "slg.ret.renewal";

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
  /** Où le chiffre vit : "shared" = une seule entrée, montrée dès qu'une motion est cochée ; "link" = hybride seulement. */
  scope: "plg" | "slg" | "shared" | "link";
  /** Mois couverts : 1 (PLG), 3 (tout l'assisté, S4). */
  span: 1 | 3;
  window?: "activation" | "paid" | "qualification" | "go-live" | 30;
  /** Hors couverture, jamais un constat, jamais candidat (la liaison). */
  optional?: true;
}
```

`rev.gross-margin` passe à `scope: "shared"`. Les 16 autres chiffres PLG
passent à `scope: "plg"`, les 14 SLG à `"slg"`, `link.pql-handoff` à
`"link"`. Aide : `shapesOf(motions): MetricShape[]`, dans l'ordre du
catalogue. Elle rend les `plg` si le PLG est coché, les `slg` si le SLG l'est,
`shared` si l'une des deux l'est, `link` si les deux le sont.

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
  coverage: Coverage;         // l'union : la marge comptée une fois, la liaison exclue
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

**S5 — Un seul `Snapshot.metrics`, les ids SLG préfixés `slg.`, les ids PLG
inchangés.** *Raison* : couverture, validation, constats, annexe et demande
copiée bouclent déjà sur le catalogue ; `scope` suffit à filtrer. La marge
commune a une seule entrée, donc une seule saisie. Et un fichier v1 ne
renomme aucune clé. *Rejeté* : un second jeu `Snapshot.slg.metrics`, qui
doublerait chaque boucle et forcerait la marge à choisir un camp ; préfixer
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

**S9 — Un total n'existe que si ses deux parties existent.** Il n'y a jamais
de « MRR total » qui serait le seul MRR connu. Avec une partie inconnue, le
total est `uncomputable` et dit laquelle manque. *Raison* : un total partiel
présenté comme un total est exactement la fausse précision que §16 R1
combat.

**S10 — La liaison est une entrée comme les autres (statuts, source,
estimation, demande), mais `optional`.** Elle est hors couverture, jamais un
constat, jamais candidate, jamais un levier. *Raison* : la décision 3 la dit
« optionnelle ». La compter comme un trou pénaliserait l'hybride qui n'a pas
de PQL.

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
  et `whatif:slg.*` ; `ask.successMetric` et `ask.measureFirst` acceptent les
  ids SLG ; `whatIf` accepte les leviers SLG ; `base` accepte les trois
  comptes SLG (entiers > 0).
- Les impossibles qui **bloquent l'enregistrement** (D11) : numérateur >
  dénominateur sur tout ratio SLG borné (`lead-to-opp`, `go-live`,
  `renewal`, `referred-share`, `referenceable`, `win-rate`,
  `link.pql-handoff`) ; dénominateur nul. Ne sont **pas** bornés :
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
l'hybride lisible. *Question Q1.*

**Trois au plus par étape.** Acquisition 3, Activation 3, Retention 3,
Referral 2, Revenue 3 : **14 chiffres propres**. La marge brute s'y ajoute,
commune aux deux motions et montrée dans l'onglet Revenue avec l'étiquette
« commun aux deux motions » / "shared by both motions". Le cycle de vente est
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
- *Glossaire* : `acquisition` (terme à créer : « conversion lead →
  opportunité », Q8).
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
- *Glossaire* : `cac`, dont la page explique le décalage qu'impose un cycle
  long (terme à créer : « cycle de vente », Q8).
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
- *Glossaire* : `revenue` (terme à créer : « taux de closing », Q8).
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
- *Glossaire* : `arpu` (terme à créer : « ACV », Q8).
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

**Commun : `rev.gross-margin`** — le chiffre existant, inchangé, `scope:
"shared"`. Un piège de plus, affiché seulement si l'assisté est coché : « Si
l'offre assistée comprend de la mise en service, sa marge est plus basse
qu'une marge moyenne : une seule marge flatte l'assisté. » / "If the
sales-assisted offer includes onboarding services, its margin is lower than
an average one: a single margin flatters sales-assisted." *Question Q4.*

#### 18.4.7 Les trois calculés assistés (jamais saisis)

| id | Formule | Existe si | Repère (contexte) | Glossaire · Tour |
|---|---|---|---|---|
| `slg.rev.ltv` | ACV ÷ 12 × marge brute × durée de vie, en mois (§18.5.6) | ACV, marge, renouvellement connus ou estimés | durée plafonnée à 36 mois, comme en PLG (Q6) | `ltv` · `rev-2` |
| `slg.rev.cac-payback` | CAC assisté ÷ (ACV ÷ 12 × marge brute), en mois | CAC, ACV, marge | le même que le PLG : < 12 mois pour un SaaS vendu aux petites entreprises, 18-24 mois en vente entreprise (`cac-payback`) | `cac-payback` · — |
| `slg.rev.ltv-cac` | LTV ÷ CAC | les deux | autour de 3:1, « un repère, pas une loi » (`ltv`) | `ltv` · — |

Ces chiffres partent de l'**ACV des nouveaux contrats**, et non de l'ARPA
assisté, parce que le CAC porte sur eux. Mêmes règles qu'en PLG : jamais 0,
« incalculable — manque : {entrée} », et jamais de repli sur le revenu quand
la marge manque.

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
- `scope: "link"`, `optional` (S10). *Question Q7.*

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
- **Titre = corps** : le titre de `slg:leak` cite `{amount}`, lu sur la
  ligne `per-month` du même objet (`impactHeadline`, étendu). C'est le
  gabarit PLG existant (`leakClearMrrNew` / `leakClearMrrRetained`) : « chaque
  mois » dit la même chose que « par mois ».

#### 18.5.4 Ce qui n'est jamais chiffré

- La mise en production et la part recommandée (§18.5.2).
- Le cycle, qui avance l'argent sans en créer.
- Les clients références.
- La NRR, qui est du contexte et non une candidate.
- La liaison, qui ne vaut jamais « X € du libre-service ».
- **Aucune fuite d'une motion n'est jamais rapportée en € à l'autre**, ni
  additionnée à l'autre.

#### 18.5.5 « Et si » assisté (`slg-scenario.ts`)

- **Leviers**, dans cet ordre : `slg.acq.lead-to-opp`, `slg.rev.win-rate`,
  `slg.ret.renewal`, `slg.rev.acv`. Même panneau, mêmes curseurs (pas de
  `scenario.ts#stepOf`), mêmes slides `whatif:<lever>`, et une slide
  `slg:scenario` « ensemble » à partir de deux leviers.
- **Modèle, à régime établi** (chaque règle est imprimée avec le résultat) :
  - `W' = W × (t_lead ÷ r_lead) × (t_win ÷ r_win)` : les deux leviers se
    composent, comme activation et conversion en PLG.
  - Nouveau MRR par mois = `W' ÷ 3 × ACV' ÷ 12` : le nouvel ACV porte sur les
    nouveaux contrats seulement.
  - Base dans 12 mois = MRR assisté × NRR' (ou × renouvellement', en
    approximation « logos pour revenu », si la NRR manque). Avec
    `NRR' = NRR + (t_ren − r_ren)` points : « un point de renouvellement
    compte comme un point de NRR ; les contrats sauvés valent la moyenne ».
  - MRR dans 12 mois = base dans 12 mois + 12 × nouveau MRR par mois
    (contrats annuels : aucun nouveau ne se renouvelle dans l'année).
  - CAC' = même dépense ÷ W'. LTV' et payback' par §18.5.6.
- **Pas de levier sur le cycle** (il avance, il ne crée pas), ni sur la
  mise en production (non chiffrée), ni sur la liaison (Q7).
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
  ÷ 100) ; LTV:CAC = LTV ÷ CAC. Tout en intervalles. Marge inconnue : les
  trois sont incalculables, et **jamais de repli sur le revenu**.
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
  `p`.
- `hidden-knowledge`.

Pas de constat de liaison. Règle inchangée : **aucune phrase n'affirme une
cause**.

---

### 18.6 L'hybride : deux moteurs, un total

#### 18.6.1 Ce qui se dédouble, ce qui reste unique, ce qui s'additionne

| Objet | Hybride |
|---|---|
| Couverture | une par motion, dans sa colonne. L'union (marge une fois, liaison exclue) sert au pied des slides communes et à la slide `visibility` |
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
    « Liaison avec le libre-service (facultatif) » ;
  - l'annexe ;
  - une flèche **SVG** dans la bande du total, du bloc libre-service vers le
    bloc assisté (jamais un glyphe, §8.6).
- **Ce qu'on n'en conclut pas**, en note de la bande et de la slide : « Une
  part du pipeline, pas une attribution : on ne sait pas combien de ces
  comptes auraient signé sans le libre-service. » / "A share of the pipeline,
  not an attribution: we don't know how many of these accounts would have
  signed without self-serve." La liaison ne déplace aucun client ni aucun
  euro d'une motion à l'autre. S8 décide qui compte où.
- **Jamais** : ni candidate, ni levier, ni constat, ni valeur « en € ».

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
- « Assisté : 14 chiffres, et la marge brute commune », avec formule, « où le
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
- l'étiquette « commun aux deux motions » sur la marge.

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
| `whatif:slg.*`, `slg:scenario` | SLG, leviers bougés | oui | par motion |
| `visibility` | toujours | oui | une slide, deux colonnes ; titre sur l'union |
| `unit-economics` | un CAC connu ou un calculé calculable, dans une motion | oui | une slide, **en regard** en hybride |
| `mirror` | Tour relié | **non** (D13) | une slide, lignes par motion |
| `ask` | toujours | oui | une slide |
| `annex` | toujours | oui | une case, pages groupées par motion |

**Ordre en hybride** : `total` → `peloton` → `leak` → leviers PLG → `scenario`
→ `slg:peloton` → `slg:leak` → leviers SLG → `slg:scenario` → `visibility`
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
| aucun, même entrée manquante | le gabarit existant `unitEconomicsUnknown` : « **On ne peut pas encore dire ce que rapporte un client** : {entrée} n'est pas mesurée. » | existing |
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
- *Pied* : la phrase fixe de §18.6.4 · « durée de vie plafonnée à 36 mois ·
  marge brute commune aux deux motions » · `cac-variants-differ` si levé ·
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

**`annex`** : les pages se groupent en « Libre-service », « Assisté »,
« Commun » (la marge) et « Liaison ». Mêmes colonnes, et la période s'écrit
en trois mois pour l'assisté.

#### 18.8.3 Notes d'orateur neuves (§9.4)

- « Pourquoi ne pas comparer les deux ? » → « Les deux motions vendent à des
  segments différents : chacune se lit contre ses cibles (slides {i} et
  {j}). »
- « Le libre-service alimente-t-il les ventes ? » → la phrase de liaison, et
  « ce n'est pas une attribution ».
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
| `rev.gross-margin` (commun) | **missing** · no-access (déjà dans §6.0) | — |
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
| Assisté (15, marge comprise) | 10 | 1 | 2 (1 demandé, 1 à faire) | 2 (mise en production, marge) | 15 |
| Union (31 : marge une fois, liaison exclue) | 21 | 3 | 3 | 4 | 31 |

La slide `visibility` compte « documentés » = trouvés + approximatifs : « On
documente **24 chiffres sur 31**. Les 7 qui manquent se réparent entre une
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
| Payback | incalculable — manque : marge brute | incalculable — manque : marge brute |
| Panier | ARPA 120 € par mois | ACV 24 000 € par an (2 000 € par mois) |
| Clients perdus sur un an | ~26 % (2,5 % par mois, composé : 1 − 0,975¹² = 0,262) | 12 % des contrats échus (contrats annuels) |
| LTV:CAC | incalculable — manque : marge brute | incalculable — manque : marge brute |

- Titre : même entrée manquante des deux côtés ⇒ « **On ne peut pas encore
  dire ce que rapporte un client** : la marge brute n'est pas mesurée. » Une
  seule marge manque aux deux motions, et c'est ce que montre le « commun ».
- Pied : `cac-variants-differ` (« Les deux CAC ne comptent pas les mêmes
  dépenses : média seul en libre-service, tout chargé en assisté. »).
- **Cas de test**, pas de l'exemple affiché : avec une marge de 75 % (et une
  durée de vie de 12 ÷ 0,12 = 100 mois, plafonnée à 36) :
  - PLG : payback = 500 ÷ 90 = 5,6 mois ;
  - SLG : payback = 19 000 ÷ 1 500 = 12,7 ⇒ « 13 mois » ; LTV = 1 500 × 36 =
    54 000 € ; LTV:CAC = 2,8.
  - Titre : « Un client libre-service rembourse son coût d'acquisition en
    **5,6 mois**, un client assisté en **13 mois**. »

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
  - 14 ids `slg.*` ; au plus 3 `scope: "slg"` par étape (2 en Referral) ; un
    ★ par étape.
  - `rev.gross-margin` est le seul `shared`, `link.pql-handoff` le seul
    `link`.
  - Chaque `glossary` existe (24 termes).
  - Les ids de `engine-catalog.ts` sont les ids de la forme.
  - Six ponts SLG épinglés.
- **`shapesOf`** : les quatre combinaisons de motions, avec leurs effectifs
  (17 / 15 / 32 avec la liaison / refus sans motion).
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
- **`total`**
  - 228 000 € exact ;
  - une partie inconnue ⇒ `uncomputable`, qui nomme la partie, **jamais**
    la partie connue présentée comme total ;
  - somme affichée = somme des parties affichées, sur une grille de
    montants (dont l'exemple : 100 000 + [330 000 ; 340 000]).
- **`unit-economics` (SLG)**
  - durée de vie `annual` / `monthly`, plafond 36, r = 100 ;
  - marge inconnue ⇒ trois incalculables, **pas de repli sur le revenu** ;
  - le cas « marge 75 % » de §18.9.6 ;
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
- **`engine-migration.spec.ts`**
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
- **`engine-mobile.spec.ts`**, étendu : `scrollWidth === clientWidth` sur E1
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

---

### 18.11 Découpage en PR

Le lot A7.3.c. Branche d'intégration `feat/engine-slg` : chaque PR vise
cette branche (la CI tourne quelle que soit la base), et **un seul merge sur
`main`**, drapeau fermé, puis la vérification `git show --stat`
(convention 1). A7 dit « une PR par item » : c'est cette PR d'intégration.

| PR | Contenu | Fichiers possédés | Dépend de | Jours-agent |
|---|---|---|---|---|
| **S0 — Contrats et migration** | `types.ts`, `catalog-shape.ts` (formes SLG, `scope`, `span`, `shapesOf`), `migrate.ts`, `validate.ts` (règles §18.3.3, dont le correctif > 100), `io.ts`, `storage.ts`, **golden v1 figé avant toute ligne**, `shared-counts.ts`, `cohort.ts` (trois mois), clés de copie vides | `lib/engine/{types,catalog-shape,migrate,validate,io,storage,shared-counts,cohort}.ts` + tests | — | 1,5 |
| **S1 — Moteur pur SLG** | `relays`, `diagnose` (motion), `slg-impact`, `unit-economics` (SLG), `total`, `sanity`, `findings`, `bridge`, `slg-scenario`, `request` (rôles), `derive`, `phrases`, `example.ts` (hybride) | `lib/engine/*.ts` hors S0 et `deck.ts` | S0 | 2,5 |
| **S2 — Contenu** | prose des 14 chiffres et de la liaison, copie `setup.*` / `hybrid.*` / `total.*` / `relays.*` / slides / notes / FAQ, FR et EN, « à relire » ; les tests de contenu | `content/engine-*.ts`, `content/__tests__/engine-*` | S0 | 1,5 |
| **S3 — Écrans** | `Setup.tsx` (type, motions), `Board.tsx` (bande du total, deux colonnes, sélecteur), `Relays.tsx`, `TotalBand.tsx`, `StageTabs`/`steps-model` (par motion), `MetricSheet` (période, petits effectifs, « commun »), `CollectHub` (rôles), `ExampleView` | `aarrr-funnel-template/_engine/**` hors `deck/` | S0 ; S1 par interfaces | 2,5 |
| **S4 — Deck** | `deck.ts` (sélection, ordre, gabarits), `SlideTotal.tsx`, `SlideRelays.tsx`, `SlideUnitEconomics.tsx` (en regard), `SlideAnnex` (groupes), `copy-text.ts` | `lib/engine/deck.ts`, `_engine/deck/**` | S1 | 1,5 |
| **S5 — Intégration** | e2e §18.10.3, captures relues FR/EN × 390/1 280, analytics (Q14), `legal.ts` si Q14, entrée de `JOURNAL.md`, mise à jour d'ENGINE.md (état) | `e2e/engine-*`, `e2e/helpers.ts`, `lib/analytics/*` | S1-S4 | 1 |

Total ≈ **10,5 jours-agent**. Chemin critique S0 → S1 → S4 → S5 ≈ **6
jours**, avec S2 et S3 en parallèle. Ensuite viennent **A7.3.d** (le bon à
tirer de la copie neuve, construit depuis `grep -rn "TODO: à relire" src/`)
et, hors code, la réécriture de `marketing/kit.md:105` et de la ligne de
risque de `marketing/campaigns/README.md` §8. **Toute évolution des types
passe par S0.**

---

### 18.12 Questions produit ouvertes (prêtes pour la section C)

Au format de `CHANTIERS.md` C, « Encore ouvert ». La numérotation C25 et
suivantes est à confirmer au collage. « Aujourd'hui » est ce que ce jet
suppose ; « Si on se trompe » dit ce qui casse.

| # | Question | Aujourd'hui | Reco |
|---|---|---|---|
| Q1 | **L'activation assistée est-elle la mise en production ?** (§18.4.1) | Activation = le client obtient ce qu'il a acheté, après la signature, et non le premier rendez-vous qualifié. Le funnel dessiné suit la chronologie (acquis → signé → en production → renouvelé), les onglets gardent l'ordre AARRR | **Oui** : le passage lead → opportunité couvre déjà la qualification, et l'après-vente est l'angle mort qui explique les non-renouvellements. *Si on se trompe* : les équipes qui appellent « activation » le premier rendez-vous ne trouvent pas leur chiffre. Corriger après coup change un ★, un candidat, un relais et les fichiers remplis |
| Q2 | **Tout l'assisté se lit-il sur trois mois glissants, fixes ?** (S4) | Flux de juin à août pour août ; cohortes de trois mois qui finissent au mois mûr de leur fenêtre ; pas de réglage | **Oui en v1**. *Si on se trompe* : 40 affaires par mois voudraient le mois, 3 par mois voudraient six mois. Rendre la durée réglable plus tard ne migre rien (`span` est dans la forme, pas dans le fichier) |
| Q3 | **Un client compte-t-il dans la motion qui a signé son contrat en cours ?** (S8, la plus lourde) | Oui, et la règle est imprimée au pied de la slide `total`. Un compte du libre-service signé par un commercial compte en assisté, et sort de la conversion payante et de l'ARPA du libre-service | **Oui** : c'est la seule règle qui empêche de compter deux fois le MRR et les nouveaux clients. *Si on se trompe* : avec « la motion d'origine », un PQL signé par un commercial ne serait jamais gagné pour l'assisté ; sans règle, le MRR total est faux sans que rien ne le montre |
| Q4 | **Une seule marge brute, commune aux deux motions ?** | `rev.gross-margin` est `shared`, avec un piège : une marge unique flatte l'assisté s'il comprend de la mise en service | **Oui en v1**, la finance la donne rarement par motion. *Si on se trompe* : le payback assisté paraît trop court. Deux marges plus tard = un id de plus, sans migration |
| Q5 | **La rétention assistée se lit-elle en renouvellement des contrats échus, et la slide en regard en « clients perdus sur un an » ?** | ★ = renouvellement (logos), avec une variante contrats annuels / mensuels. Sur la slide : libre-service annualisé (~26 %, composé), assisté en contrats échus (12 %) | **Oui** : c'est le chiffre honnête en contrats annuels, et une seule unité par ligne. *Si on se trompe* : garder le natif des deux côtés met un taux mensuel en regard d'un taux annuel, exactement la comparaison piégée que la décision 3 écarte |
| Q6 | **Durée de vie plafonnée à 36 mois aussi en assisté ?** | 36 mois ; le plafond mord dès 67 % de renouvellement annuel | **Oui** : le bas de « trois à cinq ans », et un seul plafond pour les deux motions. *Si on se trompe* : le glossaire dit « cinq ans ou plus » en entreprise ; 60 mois donneraient une LTV assistée 1,7 fois plus haute, imprimée dans le deck |
| Q7 | **La liaison = la part des opportunités assistées venues du libre-service ; facultative ; jamais levier, candidate ni constat ?** (S10) | Un ratio en comptes (31 ÷ 130) sur le dénominateur partagé des opportunités créées ; la phrase « une part du pipeline, pas une attribution » | **Oui**, et un « Et si » croisé en v2 seulement s'il est demandé. *Si on se trompe* : s'il fallait le nombre de PQL passés et leur taux d'acceptation, c'est une entrée de plus ; un « Et si » croisé dès la v1 rouvrirait le « mets l'argent dans le PLG », donc le face-à-face |
| Q8 | **Aucun repère pour le closing, le cycle, le passage lead → opportunité et l'ACV ; trois termes de glossaire à créer ?** | Liens vers des termes voisins (`revenue`, `cac`, `acquisition`, `arpu`). Les ordres de grandeur de l'instrument d'audit (win rate 25-35 % / 12-18 %, couverture de pipeline 3×-6×) restent dehors : non relus (nº4) et interdits d'import (décision 6) | **Oui** ; créer « taux de closing », « cycle de vente » et « ACV » dans une vague SEO hors v1 (même chemin que 2.2), repères éventuels compris. *Si on se trompe* : reprendre les chiffres de l'audit les imprimerait, non relus, sous le nom du site, dans le deck d'un CODIR |
| Q9 | **Deux rôles neufs : « Commercial » et « Customer Success » ?** | Les demandes copiées vont à eux pour la mise en production, le renouvellement, les références et l'origine des opportunités | **Oui** : sinon ces demandes partent au Support ou au RevOps, qui n'ont pas ces chiffres. *Si on se trompe* : deux libellés à relire, rien d'autre |
| Q10 | **L'écran hybride : résumés côte à côte, collecte par motion ?** (§18.7) | À 1 280 px : bande du total, deux colonnes (couverture, diagnostic, funnel compact), puis un sélecteur de motion pour les onglets. À 390 px : empilé, ordre fixe | **Oui** : deux tableaux complets ne tiennent pas côte à côte à 1 280 px. *Si on se trompe* : deux tableaux entiers imposent un défilement horizontal ou des fiches en modale, ce que le moteur a évité jusqu'ici |
| Q11 | **La slide « Deux moteurs, un total » ouvre-t-elle le deck hybride, avec le MRR dans 12 mois ?** | Présente et cochée. Le « dans 12 mois au rythme actuel » n'apparaît que si les deux projections existent ; total = somme des parties affichées | **Oui**, les deux : c'est ce que « un total » veut dire pour un COMEX. *Si on se trompe* : la ligne à 12 mois empile les hypothèses des deux modèles ; la retirer coûte une ligne |
| Q12 | **Les montants des deux fuites peuvent-ils être visibles côte à côte ?** | Chaque diagnostic dans sa colonne, ordre fixe, phrase fixe « chacune se lit contre ses cibles » ; ni somme ni classement des fuites | **Oui, c'est suffisant**. *Si on se trompe* : un CODIR lira quand même « ~4 000 € » contre « ~600 € » (§18.9.4) ; masquer les montants en hybride retirerait au deck son argument dans les deux motions |
| Q13 | **Pas de pré-remplissage de la slide `ask` quand les deux motions nomment une étape ?** | Le formulaire propose les deux, sans ordre de valeur | **Oui** : pré-remplir, c'est choisir une motion à la place de l'équipe. *Si on se trompe* : un clic de plus |
| Q14 | **Compter la motion choisie dans GoatCounter ?** | Non spécifié. Proposition : `engine_setup/<plg\|slg\|hybrid>` et des étapes préfixées (`engine_stage_saved/slg-revenue`), liste fermée | **Oui** : seule façon de savoir si l'assisté trouve son public. C'est une case cochée, pas un chiffre ni un texte ; relire la phrase de confidentialité (D16) pour qu'elle reste exacte. *Si on se trompe* : on pilote le catalogue à l'aveugle, ou la promesse se discute pour une case cochée |
| Q15 | **Le cycle de vente en Acquisition, et la couverture de pipeline hors v1 ?** | Acquisition = passage, CAC, cycle ; Revenue = closing, ACV, ARPA assisté. C'est ce qui tient « trois par étape » tout en gardant le MRR assisté, sans lequel rien ne s'additionne | **Oui**. La couverture de pipeline, seul indicateur avancé, suppose un objectif de revenu et un seuil qui dépend du ticket, donc un repère qu'on n'a pas. *Si on se trompe* : on cherchera le cycle en Revenue ; le déplacer ne change que `stage` |
| Q16 | **Libellés et défauts du réglage** | « Plus tard » (pas « Bientôt ») pour l'app grand public et la place de marché ; « taux de closing » ; « assisté » / "sales-assisted" ; libre-service coché et assisté décoché par défaut | **Garder**, et laisser le bon à tirer trancher les mots. *Si on se trompe* : de la copie à reprendre. Pour le défaut, un visiteur en vente assistée doit décocher avant de cocher ; aucune case cochée serait plus neutre, mais la carte ne démarrerait plus valide |

---

## Annexe — Vérifications faites pour ce document

- **Lu en entier** : `engine-codir.md` (956 l.), `engine-collect.md` (1 049 l.),
  `engine-funnel.md` (988 l.), `mock.html`, `mock2.html` ; sections moteur de
  `seo-audit.md` (§4.2) et `copy-review.md` (§4.1, §4.3).
- **Regardé** : `proto/s1-export.png`, `proto/s2-export.png`,
  `shots-codir/rsample-full.png` (référence), `shots/peloton.png`,
  `shots/slide-h2i.png`, `shots/mock-desktop.png`, `shots/mock-mobile.png`,
  `shots/mock-1280.png`, `shots/mock-1280-fold.png`, `shots/mock-390.png`,
  `shots/mock-390-top.png`.
- **PDF** (lus octet par octet, pas de poppler dans le bac à sable) :
  `proto/deck.pdf` et `shots/slide.pdf` = 1 page, MediaBox 1440 × 810 ; polices
  `IBMPlexMono-Medium`, `StardosStencil-Bold`, `IBMPlexMono-SemiBold` (deck) ;
  `LiberationSerif-Bold` en repli dans `slide.pdf`.
- **Maquette de la greffe** (`spec-probe/board.html`) injectée dans l'origine du
  build (`/fr`), rendue à 1280 et 390 : `scrollWidth === clientWidth` aux deux
  largeurs, aucun libellé hors de sa carte (mesure des boîtes). Trois défauts
  vus à l'écran et convertis en règles (§1).
- **Glyphes** : `spec-probe/glyphs.cjs` mesure dans Chromium, sur le build, la
  largeur de chaque caractère avec trois polices de repli différentes ; résultat
  en §10.4. U+202F vérifié par lecture de la `cmap` des TTF de `src/lib/og/fonts`.
- **Code** : `e2e/audit-canary.spec.ts`, `client-bundles.test.ts`,
  `content-fan-in.test.ts`, `audit-boundary.test.ts` (règles), `lib/quiz/storage.ts`,
  `lib/i18n/routes.ts`, `lib/i18n/meta.ts`, `lib/game/access.ts` + `proxy.ts`
  (drapeau), `content/glossary-terms.ts` (24 termes), `content/glossary-deep.ts`
  (textes des repères, EN et FR), `content/copy-library.ts` (ids et points des
  questions), `content/legal.ts` (phrase « Sur ton appareil »),
  `components/**` (props de `Button`, `Segmented`, `Disclosure`, `Card`, `Tag`,
  `TextArea`, `DetourCard`, `Bottleneck`, `PriorityMove`), `tokens/colors.css`.
- **Contrastes recalculés** : `--paint-red` 3,57:1 sur `--paper-1`, 4,42:1 sur
  `--paper-0`, 3,22:1 sur `--paper-2`, 3,47:1 sur `--paint-red-wash` ;
  `--paint-red-deep` 5,28:1 sur `--paint-red-wash`, 5,42:1 sur `--paper-1` ;
  `--ink-1` 5,23:1 sur `--paper-2`.
- **Arithmétique de l'exemple** recalculée : 100 ÷ (820/26 000) = 3 171 ;
  42 × 20/18 = 46,7 ; 0,975¹² = 0,738 ; 600 × 10,48 = 6 288.

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
