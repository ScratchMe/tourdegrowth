# A22.d — ce que le bon à tirer de l'app grand public doit regarder

*Relevé pendant l'exécution d'A22 (APP-1 à APP-11, du 2026-10-05 au
2026-10-11) par les relecteurs copie et par l'orchestrateur, et écrit ici le
2026-10-12 à la demande d'Antoine. Ce ne sont pas des corrections faites : ce
sont les points que la construction du bon à tirer (`/bon-a-tirer`, qui repart
toujours de `grep -rn "TODO: à relire" src/`) doit mettre sous les yeux
d'Antoine, en plus des cartes que le grep produit. Les clés citées sont celles
d'`ENGINE_COPY` (`src/content/engine-copy.ts`), de son calque
`ENGINE_COPY_CONSUMER` (`engine-copy-consumer.ts`) et du catalogue de l'app
(`engine-catalog-consumer.ts`).*

## 1. Avant tout : la page ouvre avec le moteur (C104)

- **L'introduction de la page** dit encore « Dix-sept chiffres en
  libre-service, quinze en assisté… » quand l'app est ouverte. D15 (C63) n'y
  ajoute rien : seule la cinquième réponse de la FAQ gagne une phrase. Comme
  l'app ouvre en même temps que le moteur (C104), l'introduction est lue par
  quelqu'un qui peut choisir une app dès le premier jour.
- **La phrase de la FAQ** (`faqTypeNote.consumerApp`) : « Il sert aussi les
  apps grand public : choisis-la sur la carte de départ. » « la » renvoie à
  un pluriel (« les apps ») ; et « Il », collé après « …si tu as fait le Tour
  sur cet appareil. », peut se rapporter au Tour plutôt qu'au moteur (FR et
  EN). Les deux variantes de la place de marché (MKT-10, §22.8.4 h) ont la
  même tournure : les changer ensemble.

## 2. Des chaînes que le calque de l'app n'a pas réécrites (APP-3)

Sautées volontairement par APP-3 (`APP_OVERLAY_SKIPPED`), donc affichées
telles que le SaaS les écrit :

- `scenario.assumption.referral-on-top` s'affiche pour une app avec
  « inscrits » et « qui s'inscrivent ». Proposition du relecteur : « Les
  installations recommandées s'ajoutent aux autres, qui restent les mêmes ;
  elles viennent de visiteurs de la fiche, au taux d'installation
  d'aujourd'hui. » / "store page visitors who install".
- `io.sharedCount.mrrEnd` et `mrrStart` disent « MRR » à une app.
  Proposition : « revenu des abonnements en fin / début de mois » /
  "subscription revenue at the month's end / start".
- `scenario.assumption.same-spend` : jamais affichée pour une app, mais le
  lexique en changerait le sens (« plus d'abonnés font baisser le coût par
  installation », faux) si elle l'était un jour.
- `scenario.leavesFirst` : faux positif du lexique (« paying back » est un
  verbe), la raison de l'exclusion tient.

## 3. Les mots de l'app

- **« actifs »** : employé seul comme nom, il peut se lire « actifs
  financiers » sur une slide d'investisseurs (vaut aussi pour « achats par
  actif », « nouveaux actifs »). Il est ambigu à côté d'« activés » dans
  `d30-drives-paying`, `sanity.paidGtRetained` et `sanity.retainedGtActivated`.
- **"active retention"** se lit aussi « rétention active ». Le même texte est
  dans `leverSubject`, `subject`, `unitInput` et le nom du catalogue
  ("Monthly active retention") : les changer ensemble. « mensuelle »
  disparaît du sujet alors que « à J30 » reste.
- **Deux libellés anglais pour les actifs du mois** : "the month's actives"
  (`scenario.missingActives`, décidé le 2026-10-10) et "actives in the month"
  (`io.sharedCount.appActives`, la ligne qui regroupe le chiffre partagé). Le
  français dit « actifs du mois » aux deux endroits.
- **« pub » et « Publicité »** se côtoient dans la même bande des deux flux
  (`appStreams.titleAds`, `usageBoth` contre `usageAds`).
- `workbench.modelShort.app` : « App grand public » prend une majuscule au
  milieu de la barre, où ses voisines sont en minuscules.

## 4. Des phrases qui se contredisent ou se répètent

- Après un verdict « peut-être » (« elle ne rembourse peut-être pas »),
  `money.monthsApp` enchaîne « Elle rembourse son coût en 13 mois ».
- Deux hypothèses presque identiques s'impriment l'une sous l'autre
  (`scenario.assumption.*` de l'app).
- `slide.unitAssumeApp` dit « le remboursement se lit sur cette courbe » même
  quand la courbe montre une perte, donc aucun remboursement.
- Sur de très petits chiffres, la chaîne de la rétention des actifs imprime
  « 5 × (92 % – 90 %) = 0 actif gardé de plus par mois » juste avant « Moins
  d'un actif gardé de plus par mois. »
- En anglais, `money.noLtv` dit "Missing: {input}." (décidé le 2026-10-10) et
  `money.noCac`, juste en dessous, "{input} is missing.".

## 5. Recopiés du SaaS, à revoir pour une app

- `app.rev.gross-margin.oneLiner` : « d'un euro encaissé » / "each euro you
  receive", dans un moteur dont la devise se règle.
- Le chemin Finance d'`app.acq.cpi`, recopié d'`acq.cac` : « + équipe »
  (variante « + équipe marketing »), « équipes marketing et ventes » pour une
  app en libre-service.
- `ret.logo-churn.noReferenceReason` : « l'écart entre formules mensuelles et
  annuelles » contre "the mix of monthly and annual plans" (écart ≠ mix).
- `acq.top-channel-share.noReferenceReason` dit « canal » / "channel" alors
  que l'entrée de l'app dit « source ».
- `example.churnCauseApp` (« l'essai se termine avant la troisième séance »)
  suppose un abonnement. Sans objet aujourd'hui : l'exemple s'ouvre toujours
  avec ses trois façons de gagner (décidé le 2026-10-11).
- `terms.arr.definition` parle de « contrats au mois » pour une app.
- Les rôles « Finance », « Support » et « Data » sont identiques en FR et en
  EN (l'usage du catalogue).

## 6. Petites notes

- `lever.curveSummaryWhatif` (EN) "The revenue month by month" contre
  `curveSummary` "Revenue month by month".
- `worth.perHundred(One)` (EN) "paying subscribers" contre « abonnés ».
- `slide.leakAssumption` : « parmi les activées », sans nom.
- `leverSubject["rev.arpa"]` est redondant pour une app.
- `sanity.commissionHigh` écrit « 30 % » en dur, alors que le code lit
  `COMMISSION_HIGH_PERCENT` (aucun test ne les lie ; même défaut pour
  `slgCycleLong`, « trois mois »). 30 % est aussi le plafond habituel des
  stores.
- `settings.streamOff*` (EN) : "if you tick it again", où « it » est la case,
  derrière un sujet pluriel.
- Le peloton imprime « ~330 visiteurs de la fiche pour 100 installations »
  (333,33, à deux chiffres significatifs).

## 7. Déjà tranché par Antoine pendant A22 (à relire seulement)

Ces chaînes sont neuves et portent « à relire » ; leur sens est décidé :

- `settings.streamLast` et le compte par façon (`settings.streamOff*`,
  `streamOn*`), APP-7, 2026-10-07 ; `setup.typeFixed` seulement quand plus
  d'un type est ouvert.
- `scenario.missingActives`, seuls le revenu du mois et le revenu dans 12 mois
  l'annoncent ; `money.noLtv` en anglais, APP-8, 2026-10-10.
- La formule du taux d'installation sans « ta fiche » ; les quatre feuilles
  « moins d'un actif (gardé) de plus par mois », APP-9, 2026-10-10.
- L'exemple d'une app s'ouvre toujours avec ses trois façons de gagner, APP-10,
  2026-10-11.

## Hors copie

- `InstallPaybackChart` n'a ni aperçu `.design-sync` ni entrée `cardMode` :
  à faire à la prochaine synchro avec Claude Design.
- Son `figcaption` reste vide quand `summary` est absent (une perte sans
  valeur ni écart, cas théorique) : à rendre conditionnel à l'occasion.
- `CONTENT_UPDATED_AT["/aarrr-funnel-template"]` avance à l'ouverture (A22.e).
