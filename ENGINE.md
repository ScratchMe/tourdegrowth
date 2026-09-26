# ENGINE.md — le moteur de croissance

*Versionné le 2026-09-25. Jusque-là, cette spécification ne vivait que dans le
répertoire de travail d'une session, qui disparaît avec son conteneur ; c'est la
même raison qui a fait entrer `AUDIT.md` et `AUDIT-PLAN.md` dans le dépôt.*

**Où en est le moteur.** Construit derrière `ENGINE_ENABLED` (fermé ; Antoine le
teste avec l'aperçu propriétaire de `/admin/preview`), route `/{locale}/aarrr-funnel-template`, code dans
`src/lib/engine/` (pur), `src/content/engine-copy.ts` et `engine-catalog.ts`
(toute la copie, `TODO: à relire` jusqu'au bon à tirer nº6) et
`src/app/[locale]/aarrr-funnel-template/` (l'îlot, le tableau de bord, les
slides). Les écarts que l'implémentation a tranchés par rapport à ce document
sont consignés dans le journal de `CLAUDE.md`, pas réécrits ici.

**Décisions prises par défaut le 2026-09-24 pour que le travail avance** —
chacune se renverse en une phrase :

1. Nom « Moteur de croissance » / "Growth engine" ; URL
   `/{locale}/aarrr-funnel-template` (la requête sans concurrent de l'audit SEO).
   Une URL publiée ne meurt jamais ici : c'est définitif dès l'ouverture.
2. Le crédit « tourdegrowth.com » sur les slides exportées : présent par défaut,
   retirable par l'utilisateur (le deck est le sien).
3. La v1 couvre le SaaS libre-service (freemium ou essai) ; le B2B assisté en
   v1.1 ; l'appli B2C et la marketplace plus tard.
4. La slide « déclaré au Tour × mesuré » existe mais n'est pas cochée par défaut.
5. Les deux repères approuvés du glossaire (activation 20-40 %, churn logo
   1-2 %/mois) peuvent désigner un goulot sur une slide, avec leur réserve
   imprimée sur la slide ; une cible d'équipe le peut toujours.
6. Le moteur est public, gratuit et local : ce n'est pas la phase 3 de
   l'instrument d'audit (aucun connecteur, rien ne quitte le navigateur, pas un
   produit commercial). `lib/audit` n'est pas touché.
7. `ENGINE_ENABLED` reste fermé jusqu'à la signature du bon à tirer nº6. Liens
   d'ouverture prévus : `/how-it-works`, les deux pages SEO d'entrée, une section
   de la landing sous la citation — pas de septième lien au pied de page.

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
  (`_engine/WhatIfPanel.tsx`) : on choisit l'étape (celle que le diagnostic
  nomme par défaut), le curseur redessine le funnel à côté
  (`lib/engine/projection.ts` : activation et conversion payante ; les payants
  suivent l'activation) et la chaîne en revenu reste celle du §6.7. Ouvert dans
  le pas à pas, plié sur le tableau (qui montre déjà le funnel au-dessus).
- **Explications à la demande** : les quinze fiches statiques de la page sont
  pliées (toujours dans le HTML prérendu), « où le trouver » est plié dans
  chaque fiche, la liste « à aller chercher » est pliée sur le tableau, et les
  onglets du tableau disparaissent.
- **La durée est dite avant l'outil** : un bloc compte les quinze chiffres par
  effort, depuis les étiquettes du catalogue (5 en cinq minutes, 5 en une
  heure, 5 à demander), puis quatre cas (tout sous la main, il faut demander,
  pas de cible, les slides).
- **Un exemple rempli** (`lib/engine/example.ts`, le jeu du §6.0) : funnel et
  slides, en lecture seule — rien n'est écrit sur l'appareil.
- **Les réglages se modifient après coup** (« Réglages » sur le tableau).
  Changer une fenêtre renvoie le chiffre qu'elle définit « à faire » (il ne
  décrit plus la même chose) ; changer un mois garde les entrées et demande
  de les relire. L'écran le dit avant d'enregistrer.
- Petits correctifs : la confirmation d'effacement ignore la casse et le dit ;
  le champ du nom dit « nom de ton SaaS ou de ton entreprise » ; le peloton dit
  combien d'inscrits réels il ramène à 100, et où changer ce nombre.

---

# Le moteur de croissance — spécification d'implémentation (v1)

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
`/{locale}/aarrr-funnel-template`, nommée « Moteur de croissance » / « Growth
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

**D8 — Le frein n'est nommé que contre une référence qui désigne.** Deux repères
du glossaire désignent en v1 : activation 20-40 % des inscrits et churn logo
1-2 %/mois (PME). Tous les autres repères sont du **contexte** (affichés, jamais
utilisés pour nommer). **La cible de l'équipe désigne toujours**, et c'est le
moyen normal de débloquer le diagnostic. Il faut au moins 2 étapes comparables
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
  benchmark?: { term: GlossaryTermId; lo: number; hi: number; direction: "higher" | "lower"; designates: boolean };
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
`designates: true` pour deux repères seulement (D8). Sinon l'écran dit « Pas de
repère publiable » + la raison, et propose « Fixe une cible ».

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
| ★ `act.rate` | Taux d'activation | inscrits de la cohorte ayant fait l'événement sous *n* jours ÷ inscrits de la cohorte | **Amplitude** Funnel Analysis, Inscription → événement, fenêtre *n* jours · **Mixpanel** Funnels, *conversion window* · **GA4** Explorer › Exploration de l'entonnoir (si l'événement est envoyé) | Seul, ~1 h | **désigne** : 20-40 % des inscrits, ordres de grandeur couramment cités pour l'onboarding SaaS, plus bas en essai gratuit (`activation`) | `activation` · `act-2` |
| `act.ttv` | Time-to-value médian | médiane du délai inscription → événement (médiane/moyenne déclarée) | **Amplitude/Mixpanel** vue *time to convert* de l'entonnoir · **GA4** pas de médiane native → à demander à la data | Seul, ~1 h | aucun (le glossaire le dit : une ambition, pas une norme) | `time-to-value` · — |

`act.rate` dépend d'`act.event` : si l'événement est `missing`, la fiche du taux
s'ouvre sur « Il faut d'abord nommer l'événement » et le constat n'est posé
qu'une fois, sur l'événement.

### 5.4 Rétention

| id | Chiffre | Formule | Où le trouver | Effort | Repère | Glossaire · Tour |
|---|---|---|---|---|---|---|
| ★ `ret.d30` | Rétention à J30 | inscrits de la cohorte encore actifs 30 jours après l'inscription ÷ inscrits de la cohorte (« actif » écrit dans `definitionNote`) | **Amplitude** Retention Analysis, événement de départ Inscription · **Mixpanel** Retention · **GA4** Explorer › Exploration de cohortes | Seul, ~1 h | aucun en libre-service (le 20-30 % à J30 du glossaire porte sur les applis grand public) → cible | `retention` · `ret-1` |
| `ret.logo-churn` | Churn logo mensuel | clients payants perdus dans le mois ÷ clients payants au 1er du mois | **Stripe** Billing, vue d'ensemble, churn des abonnés (selon l'offre) · **Chargebee** RevenueStory (selon l'édition) · **ChartMogul / Baremetrics** churn clients | Seul, 5 min | **désigne** (plus bas = mieux) : ~1-2 % par mois, jugé sain pour des produits vendus aux petites entreprises (`churn`) | `churn` · — |
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

**Comparateur**, dans cet ordre : cible d'équipe (désigne toujours) → repère du
catalogue avec `designates: true` → aucun (`no-comparator`, exclu du classement,
listé avec « fixe une cible »).

**Position** (valeur `[lo, hi]`, comparateur `[cLo, cHi]` — une cible est
`cLo = cHi`) :
- plus haut = mieux : `below` si `hi < cLo` ; `maybe-below` si `lo < cLo ≤ hi`
  (texte seulement, pas de tampon) ; `within` si `cLo ≤ lo ≤ cHi` ; `above` sinon.
- churn : `below` si `lo > cHi` ; symétrique pour le reste.
- **Une valeur dans sa référence n'est jamais une fuite contre elle.** Seule une
  cible peut la rendre candidate, et la phrase dit alors « sous ta cible »,
  jamais « bas de la référence ».

**Impact en €** (`impact.ts`, énoncé « toutes choses égales par ailleurs ») :
- *N* = nouveaux payants par mois : le dénominateur mesuré d'`acq.cac` s'il
  existe, sinon `inscrits du mois × rev.paid-conversion` (approximatif), sinon
  inconnu.
- Flux (`acq.signup-rate`, `act.rate`, `rev.paid-conversion`) :
  `payants en plus = N × (t ÷ taux − 1)` avec `t` = cible, ou borne **basse** du
  repère (la plus prudente). Pour `act.rate`, l'hypothèse « les payants sont
  parmi les activés » est **imprimée** sous le calcul.
- Churn : `clients préservés = base au 1er × (churn − t)` avec `t` = cible ou
  borne **haute** du repère.
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
   comparateur. Si l'un d'eux est `below`, il est rapporté (« {étape} est sous
   son repère ; sans cible sur les autres étapes, impossible de dire si c'est la
   plus grosse fuite »).
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

**Exemple (§6.0)** : `act.rate` 18 % < 20 % (repère) ⇒ `below` ; churn 2,5 % >
2 % ⇒ `below`. *N* = 42 (mesuré). Activation : 42 × 20/18 = 46,7 ⇒ affiché
« 47 (+5) », × 120 € = 600 € ⇒ « ~600 € ». Churn : 400 × (2,5 % − 2 %) = 2
clients ⇒ 2 × 120 = 240 € ⇒ « ~240 € ». 600 > 240 × 1,25 = 300 ⇒ `clear`,
nommé : Activation. `ret.d30` inconnu ⇒ `blind = ["ret.d30"]`. Annuel (churn
2,5 %) : 600 × (1 − 0,975¹²) ÷ 0,025 = 600 × 10,48 = 6 288 ⇒ « ~6 300 € de MRR
de plus au bout d'un an ». (Avec un churn à 3 %, préservés = 4, 480 € : 600 >
480 × 1,25 = 600 est **faux** ⇒ `shared` — la borne du test.)

### 6.7 « Et si » (`impact.ts#whatIf`)

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
- Eyebrow « Le moteur », H1 « Ton moteur de croissance », ligne de
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
1. Eyebrow « Ton moteur de croissance · libre-service · cohorte de juillet 2026 ·
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
- **Kicker** mono 20 px, tracking 0,12em : « Moteur de croissance · {entreprise ·}
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
annex. **Si moins de 2 ★ sont connus**, `visibility` passe en premier (le
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

  `{cible}` : « 20 % (bas de l'ordre de grandeur couramment cité) » ou « 30 %
  (notre cible) » / "20% (low end of the commonly cited range)" or "30% (our
  target)". Exemple : « Ramener l'activation à 20 % vaudrait **~600 € de MRR
  nouveau** chaque mois. »
- Les 4 lignes : « Aujourd'hui · 18 sur 100 activés → 42 nouveaux payants par mois »
  · « Si · l'activation atteint 20 % (bas de l'ordre de grandeur couramment cité) »
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
  Titre : « Définitions et sources » / "Definitions and sources".

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
    Setup.tsx  Board.tsx  Verdict.tsx  Coverage.tsx  Diagnosis.tsx  Peloton.tsx  StageRow.tsx
    StageDrawer.tsx  MetricSheet.tsx  ValueEditor.tsx  MissingTriage.tsx  ComparisonStrip.tsx
    WhatIf.tsx  Mirror.tsx  CollectHub.tsx  RequestCopy.tsx  ResumeBand.tsx  BackupBar.tsx
    ImportPanel.tsx  EraseDialog.tsx  *.module.css
    _ui/  Field.tsx  NumberField.tsx  Select.tsx  TextField.tsx  MonthField.tsx  ui.module.css
    deck/ DeckView.tsx  SlideFrame.tsx  SlidePeloton.tsx  SlideLeak.tsx  SlideVisibility.tsx
          SlideUnitEconomics.tsx  SlideMirror.tsx  SlideAsk.tsx  SlideAnnex.tsx  AskForm.tsx
          export-png.ts  copy-text.ts  deck.module.css
src/lib/engine/             pur, navigateur, testé ; aucun import de valeur depuis content/
  types.ts  strings.ts  catalog-shape.ts  access.ts  storage.ts  io.ts  validate.ts
  interval.ts  format.ts  cohort.ts  values.ts  coverage.ts  peloton.ts  diagnose.ts  impact.ts
  unit-economics.ts  sanity.ts  findings.ts  bridge.ts  deck.ts  request.ts
  __tests__/*.test.ts
src/content/engine-catalog.ts   serveur : prose des 15 chiffres (Translatable) — TODO: à relire
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
FR « … et, si tu utilises le moteur de croissance, les chiffres et les textes que
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
| **P4 — Collecte** | îlot (machine à états, persistance), E1, E2 hors peloton/diagnostic, tiroir, fiche, éditeur, triage, demande, E4, E6, E7, `_ui/` | `EngineWorkbench.tsx`, `_engine/{Setup,Board,Verdict,Coverage,StageRow,StageDrawer,MetricSheet,ValueEditor,MissingTriage,ComparisonStrip,RequestCopy,CollectHub,ResumeBand,BackupBar,ImportPanel,EraseDialog}.tsx`, `_engine/_ui/**` | P0 (P1/P2 par interfaces, bouchonnables) | 2 |
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
  - un repère `designates: false` ne désigne jamais ; la cible désigne toujours.
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
  - `accessibility.spec.ts` : axe sur E0, E2 (avec une ligne « sous le repère »
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
| `diagnose` forcé à `clear` | diagnosis (« pas assez de repères », « dans le repère ») | journey |
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
| `meta.breadcrumb` | Moteur de croissance | Growth engine |
| `page.eyebrow` | Le moteur | The engine |
| `page.title` | Ton moteur de croissance | Your growth engine |
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
| `board.eyebrow` | Ton moteur de croissance · {model} · cohorte de {cohort} · flux de {month} | Your growth engine · {model} · {cohort} cohort · {month} flows |
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
| `sheet.referenceDesignates` | {range} · ordre de grandeur couramment cité, {caveat} | {range} · commonly cited order of magnitude, {caveat} |
| `sheet.referenceContext` | {range} · contexte seulement, {caveat} | {range} · context only, {caveat} |
| `sheet.noReference` | Pas de repère publiable : {reason} | No reference worth publishing: {reason} |
| `sheet.target` | Ta cible (facultatif) | Your target (optional) |
| `sheet.targetHint` | Une cible d'équipe sert de repère pour désigner un frein. | A team target acts as the reference for naming a bottleneck. |
| `sheet.dependsOnEvent` | Il faut d'abord nommer l'événement d'activation. | Name the activation event first. |
| `sheet.note` | Note pour toi | Note to self |
| `sheet.noteHint` | Jamais sur une slide. | Never on a slide. |
| `sheet.save` | Enregistrer | Save |
| `sheet.close` | Fermer | Close |
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
| `diagnosis.notEnough` | Pas assez de repères pour conclure | Not enough references to conclude |
| `diagnosis.belowReference` | {value}, sous l'ordre de grandeur couramment cité ({range}) | {value}, below the commonly cited range ({range}) |
| `diagnosis.belowTarget` | {value}, sous ta cible ({target}) | {value}, below your target ({target}) |
| `diagnosis.maybeBelow` | {value} : peut-être sous le repère ({range}) | {value}: possibly below the reference ({range}) |
| `diagnosis.notEnoughBody` | Fixe une cible sur au moins deux étapes : c'est ce qui permet de dire laquelle freine. | Set a target on at least two stages: that's what lets us say which one holds you back. |
| `diagnosis.notEnoughBelow` | {stage} est sous son repère ; sans cible sur les autres étapes, impossible de dire si c'est la plus grosse fuite. | {stage} is below its reference; without targets on the other stages, we can't say whether it's the biggest leak. |
| `diagnosis.levelBody` | Aucune étape n'est sous sa cible : le levier est le volume ou le prix. | No stage is below its target: the lever is volume or price. |
| `diagnosis.blind` | {stages} n'est pas mesurée : le vrai frein peut s'y cacher. | {stages} isn't measured: the real bottleneck may be hiding there. |
| `diagnosis.blind.other` | {stages} ne sont pas mesurées : le vrai frein peut s'y cacher. | {stages} aren't measured: the real bottleneck may be hiding there. |
| `diagnosis.unpriced` | Aussi sous ta cible, non chiffré en € : {stages} | Also below your target, not priced in €: {stages} |
| `diagnosis.noArpa` | Le churn n'est pas comparable aux autres étapes sans ARPA. | Churn can't be compared with the other stages without ARPA. |
| `diagnosis.topOfFunnel` | La plus grosse perte en nombre est toujours en haut du tunnel ; ce n'est pas ce qui désigne un frein. | The biggest loss in numbers is always at the top of the funnel; that's not what names a bottleneck. |
| `diagnosis.stampReference` | Sous le repère | Below reference |
| `diagnosis.stampTarget` | Sous ta cible | Below target |
| `diagnosis.within` | dans le repère | within the reference |
| `diagnosis.above` | au-dessus du repère | above the reference |
| `diagnosis.noComparator` | sans repère · fixe une cible | no reference · set a target |
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
| `whatIf.targetReference` | {value} (bas de l'ordre de grandeur couramment cité) | {value} (low end of the commonly cited range) |
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
| `slide.kicker` | Moteur de croissance · {company}{month} · données internes | Growth engine · {company}{month} · internal data |
| `slide.dataPill` | Données : {m} mesurées · {a} approximatives · {x} introuvables | Data: {m} measured · {a} approximate · {x} missing |
| `slide.footer` | Cohorte d'inscrits de {cohort} · flux de {month} · sources : {tools} | {cohort} sign-up cohort · {month} flows · sources: {tools} |
| `slide.leakFooter` | Toutes choses égales par ailleurs · {assumption} · {caveat} | All else being equal · {assumption} · {caveat} |
| `slide.leakAside` | À côté | Alongside |
| `slide.withinReference` | dans le repère | within the reference |
| `slide.cannotExclude` | non mesuré — ne peut pas être exclu | not measured — can't be ruled out |
| `slide.calcTitle` | Le calcul | The calculation |
| `slide.visibilityLeft` | Ce qu'on voit | What we can see |
| `slide.visibilityRight` | Ce qui manque, du plus rapide au plus long à réparer | What's missing, quickest to slowest to fix |
| `slide.unitCap` | durée de vie plafonnée à 36 mois | lifetime capped at 36 months |
| `slide.askFunds` | Ce que ça finance | What it funds |
| `slide.askKnow` | Comment nous saurons | How we'll know |
| `slide.askMeasure` | Ce qu'il faut d'abord mesurer | What to measure first |
| `slide.askCheckpoint` | relevé mensuel, premier point le {date} | monthly reading, first checkpoint on {date} |
| `slide.annexTitle` | Définitions et sources | Definitions and sources |
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
