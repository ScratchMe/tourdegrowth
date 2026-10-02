# COPY — brief 07, the engine simpler

*Every new or changed string of design system extension 07, French and
English side by side, with the screen it sits on. Generated from
`board/copy.js` by `board/make-copy.mjs`: the board draws these very
strings. For Antoine's review before anything ships.*

- **Screens** are the board's ids (`board.html?screen=…`); `return-*`
  means every return state, `number-*` every number screen.
- **French typography**: the strings below carry U+202F (narrow no-break
  space) before « : ; ? ! » and inside « », and in grouped figures
  (« 1 400 »), as the house rule asks. `tu` throughout. Stage names stay
  in English on French screens.
- `{…}` are slots the engine fills (a month, a count, a role, a number's
  name). `{n:one|other}` is the word that agrees with the count `n` (0 and 1
  take the first, as in French); the app's i18n may write it its own way.
- **Not here**: the catalogue's text (CATALOGUE.md — kept word for word, see
  INVENTORY.md), and the deck (out of scope).

## To review: 121 strings (72 new, 49 changed)

### The page around the tool

| Key | Screen | English | Français | Today |
|---|---|---|---|---|
| `landing.promiseLine` | return-* | Nothing you enter leaves this page: your engine lives in this browser only. | Rien de ce que tu saisis ne sort d'ici : ton moteur ne vit que dans ce navigateur. | **new** |
| `landing.reserve` | return-instant | Opening your engine… | Ouverture de ton moteur… | **new** |

### First visit: the start card

| Key | Screen | English | Français | Today |
|---|---|---|---|---|
| `start.legend` | setup, arrival, settings | How do you sell? | Comment vends-tu ? | *was* Self-serve / Sales-assisted (two boxes, no question) |
| `start.ssNote` | setup, settings | People sign up and pay on their own (PLG). | On s'inscrit et on paie seul (PLG). | **new** |
| `start.saNote` | setup, settings | A salesperson signs the deals (SLG). | Un commercial signe les contrats (SLG). | **new** |
| `start.both` | setup, settings | Both | Les deux | **new** |
| `start.bothNote` | setup, settings | Two engines, one total. | Deux moteurs, un total. | **new** |
| `start.plan.ss` | setup, arrival | 17 numbers: 5 take five minutes, 7 about an hour each, 5 come from someone else. | 17 chiffres : 5 se lisent en cinq minutes, 7 demandent environ une heure chacun, 5 sont à demander à quelqu'un. | **new** |
| `start.plan.sa` | setup | 15 numbers: 4 take five minutes, 5 about an hour each, 6 come from someone else. | 15 chiffres : 4 se lisent en cinq minutes, 5 demandent environ une heure chacun, 6 sont à demander à quelqu'un. | **new** |
| `start.plan.both` | setup | 33 numbers: 9 take five minutes, 13 about an hour each, 11 come from someone else. | 33 chiffres : 9 se lisent en cinq minutes, 13 demandent environ une heure chacun, 11 sont à demander à quelqu'un. | **new** |
| `start.defaults` | setup, arrival | Set for a B2B SaaS, in euros, on August 2026's figures and July 2026's sign-ups. | Réglé pour un SaaS B2B, en euros, sur les chiffres d'août 2026 et les inscrits de juillet 2026. | **new** |
| `start.change` | setup, arrival | Change | Modifier | **new** |
| `start.go` | setup, arrival | Start with your first number → | Commencer par ton premier chiffre → | *was* Start step by step → |
| `start.example` | setup, arrival | See a filled-in example | Voir un exemple rempli | *was* See a filled-in example, funnel and slides → |
| `start.import` | setup, arrival | Import a file (.json) | Importer un fichier (.json) | *was* Import a file |

### The engine bar and its menu

| Key | Screen | English | Français | Today |
|---|---|---|---|---|
| `bar.motion.both` | return-hybrid | Self-serve and sales-assisted | Libre-service et assisté | **new** |
| `bar.menu` | return-* | Engine, month and file | Moteur, mois et fichier | *was* the engine line's +, the month selector, the actions row |
| `bar.group.engine` | return-menu | This engine | Ce moteur | **new** |
| `bar.switch` | return-menu | Switch or add an engine | Changer ou ajouter un moteur | *was* + (engine line) |
| `bar.rename` | return-menu | Rename | Renommer | **new** |
| `bar.group.month` | return-menu | Month | Mois | **new** |
| `bar.monthField` | return-menu | Month shown | Mois affiché | **new** |
| `bar.remind` | return-menu | Remind me to start {next} (.ics) | Me rappeler de démarrer {next} (.ics) | *was* Remind me to start September 2026 |
| `bar.group.file` | return-menu | File | Fichier | **new** |
| `bar.erase` | return-menu | Erase this engine | Effacer ce moteur | *was* Erase everything |

### Next step (“since last time”)

| Key | Screen | English | Français | Today |
|---|---|---|---|---|
| `next.since` | return, return-* | Last visit · {ago} | Dernière visite · {ago} | *was* 7 of 17 numbers found · last visit 12 days ago |
| `next.ago3` | return-found, return-month | 3 days ago | il y a 3 jours | **new** |
| `next.where` | progress-middle, progress-end | Where you are | Où tu en es | **new** |
| `next.toGo` | return | {n} numbers to go: {own} on your own, about an hour each, and {ask} to ask {role}. | {n} chiffres à faire : {own} seul, environ une heure chacun, et {ask} à demander à {role}. | **new** |
| `next.asked` | return, progress-end | Asked {role} for the {number} {ago}: no answer typed yet. | Demandé à {role} {ago} : {number}, pas encore de réponse. | **new** |
| `next.followUp` | return, progress-end | Follow up | Relancer | *was* Follow up: Data |
| `next.backup` | return | Never saved to a file: Safari may erase it after seven days without a visit. | Jamais enregistré dans un fichier : Safari peut l'effacer après sept jours sans visite. | **new** |
| `next.go.ask` | return | Ask {role} for the {number} → | Demander le {number} à {role} → | **new** |
| `next.go.number` | progress-middle, whatif | Next number: {number} → | Chiffre suivant : {number} → | *was* Continue |
| `next.go.requests` | progress-middle | Copy your {n} requests → | Copier tes {n} demandes → | **new** |
| `next.skipRequests` | progress-middle | Type the next number first | Taper d'abord le chiffre suivant | **new** |
| `next.mid` | progress-middle | The {n} quick numbers are in. {ask} come from someone else: send their requests now, fill in the rest while you wait. | Les {n} chiffres rapides sont là. {ask} sont à demander : envoie les demandes maintenant, remplis le reste en attendant. | **new** |
| `next.allFound` | return-found | All {n} numbers found. | Les {n} chiffres sont trouvés. | **new** |
| `next.verdictIsSlide` | return-found, progress-end | Your verdict above is the title of your first slide. | Ton verdict, ci-dessus, est le titre de ta première slide. | **new** |
| `next.endAnswered` | progress-end | Every number has an answer: {found} found, {est} estimated, {cant} can't be found, {asked} asked. | Chaque chiffre a une réponse : {found} {found:trouvé\|trouvés}, {est} {est:estimé\|estimés}, {cant} {cant:introuvable\|introuvables}, {asked} {asked:demandé\|demandés}. | **new** |
| `next.requestsOut` | progress-end | {n} requests out since {date}: their answers go in when they come. | {n} demandes envoyées le {date} : leurs réponses s'ajoutent quand elles arrivent. | **new** |
| `verdict.pending` | progress-middle | Your verdict appears here once a stage's number is in: the engine writes it from your numbers. | Ton verdict s'affiche ici dès que le chiffre d'une étape est là : le moteur l'écrit à partir de tes chiffres. | **new** |
| `next.monthEnded` | return-month | {month} has ended: its figures can be read now. | {month} est terminé : ses chiffres se lisent maintenant. | **new** |
| `next.monthCarries` | return-month | It starts from {prev}'s targets and definitions; the numbers start empty, and {prev} stays, read only, under Month. | Il reprend les cibles et définitions d'{prev} ; les chiffres repartent vides, et {prev} reste, en lecture seule, sous Mois. | **new** |
| `next.go.month` | return-month | Start {month} → | Démarrer {month} → | *was* Start September 2026 (dashed band) |
| `next.keepFilling` | return-month | Keep filling {prev} | Continuer {prev} | **new** |
| `next.past` | return-past | You are reading {month}. Nothing here changes unless you correct it. | Tu lis {month}. Rien ne change ici, sauf si tu le corriges. | **new** |
| `next.go.back` | return-past | Back to {month} → | Revenir à {month} → | **new** |
| `next.refused` | return-refused | Your browser refused to save: what you type now is lost when this tab closes. | Ton navigateur a refusé d'enregistrer : ce que tu tapes maintenant sera perdu à la fermeture de l'onglet. | **new** |
| `next.go.saveFile` | return-refused | Save to a file (.json) → | Enregistrer dans un fichier (.json) → | **new** |

### Progress

| Key | Screen | English | Français | Today |
|---|---|---|---|---|
| `progress.toGo` | number-*, return-*, progress-* | {n} to go | {n} à faire | *was* Number 4 of 17 / 7 of 17 numbers found |
| `progress.lastOne` | progress-last | Last one to go | Plus qu'un | **new** |
| `progress.noneToGo` | progress-end, return-found | None to go | Plus rien à faire | **new** |
| `progress.counts` | return-*, progress-* | {found} found · {est} estimated · {asked} asked · {cant} can't find | {found} {found:trouvé\|trouvés} · {est} {est:estimé\|estimés} · {asked} {asked:demandé\|demandés} · {cant} {cant:introuvable\|introuvables} | *was* 7 of 17 numbers found · 2 approximate · 5 in progress · 3 missing |
| `progress.legendLabel` | return-* | What the marks mean | Ce que disent les marques | **new** |
| `status.est` | return-* | Estimated | Estimé | *was* approximate |
| `status.askedAgo` | return | Asked · 12 d | Demandé · 12 j | **new** |
| `status.cant` | return-* | Can't find | Introuvable | *was* missing |
| `status.computed` | return-* | Computed | Calculé | **new** |
| `status.needs` | return | Needs {what} | Il manque {what} | **new** |

### One number

| Key | Screen | English | Français | Today |
|---|---|---|---|---|
| `sheet.position` | number-* | {stage} · {i} of {n} | {stage} · {i} sur {n} | *was* Number 1 of 17 · Acquisition |
| `sheet.tour` | number-open | In the Tour, you answered: {answer} | Dans le Tour, tu as répondu : {answer} | *was* What you declared in the Tour (block) |
| `trap.label` | number-* | The trap, before you type | Le piège, avant de taper | *was* The trap (inside Where to find it, folded) |
| `trap.writeDefinition` | number-* | Write your definition | Écrire ta définition | **new** |
| `trap.hybrid` | number-* (hybrid) | When you sell both ways | Si tu vends des deux façons | **new** |
| `value.cohortHint` | number-target | Take July 2026's sign-ups, not August's: they have had their 7 days to activate. | Prends les inscrits de juillet 2026, pas ceux d'août : ils ont eu leurs 7 jours pour s'activer. | *was* the cohort sentence, a block above the status question |
| `value.result` | number-have, number-target, number-open | {name}: {value} | {name} : {value} | **new** |
| `value.invalid` | number-invalid | More sign-ups than visitors: check that both cover August 2026, and that visitors are Users, not Sessions. | Plus d'inscrits que de visiteurs : vérifie que les deux couvrent août 2026, et que les visiteurs sont des Utilisateurs, pas des Sessions. | *was* the sheet's generic invalid-value message |
| `value.notSaved` | number-invalid | Not saved: one figure to check. | Pas enregistré : un chiffre à vérifier. | **new** |
| `answer.legend` | number-* | No figure to hand? | Pas de chiffre sous la main ? | *was* Where are you with this number? (four choices, before the value) |
| `answer.back` | number-estimate, number-ask, number-cant | ← I have the figure after all | ← J'ai le chiffre, finalement | **new** |
| `ask.copied` | number-ask, asks | Copied on {date}. Your engine reminds you to follow it up. | Copiée le {date}. Ton moteur te rappellera de relancer. | *was* Requested (tag) |
| `where.yours` | number-open | your tool | ton outil | **new** |
| `compare.title` | number-* | How it compares | Comment il se situe | *was* Reference (strip) + the target box + below the target |
| `compare.yours` | number-* | Your figure | Ton chiffre | **new** |
| `compare.reference` | number-* | Reference {range} | Repère {range} | *was* Reference |
| `compare.target` | number-*, settings | Your team's target | La cible de ton équipe | *was* Target for {number} |
| `compare.targetHint` | number-* | Only a target names the stage that holds you back. Without one, the figure still counts. | Seule une cible désigne l'étape qui freine. Sans cible, le chiffre compte quand même. | *was* the targets step's intro |
| `compare.atOrAbove` | number-have | At or above target | À la cible ou au-dessus | **new** |
| `compare.noTargetHere` | number-estimate | This number situates; it does not name a stage. | Ce chiffre situe ; il ne désigne pas d'étape. | **new** |
| `compare.chart` | number-* | {name}: {value}. Reference {range}. {target} | {name} : {value}. Repère {range}. {target} | **new** |
| `compare.chartTarget` | number-* | Target {value}. | Cible {value}. | **new** |
| `compare.chartNoTarget` | number-* | No target. | Pas de cible. | **new** |
| `words.summary` | number-* | Your definition and a note | Ta définition et une note | *was* Your definition (always open) + Note to self (always open) |
| `sheet.saveLast` | progress-last | Save and see your engine → | Enregistrer et voir ton moteur → | **new** |
| `sheet.toList` | number-* | ← Your numbers | ← Tes chiffres | *was* See the full board |
| `sheet.skip` | number-* | Skip for now | Passer pour l'instant | *was* Skip, I'll come back to it |
| `sheet.computed` | return | Computed from your numbers: nothing to type. | Calculé à partir de tes chiffres : rien à taper. | **new** |

### The board

| Key | Screen | English | Français | Today |
|---|---|---|---|---|
| `diag.value` | return* | {number}: {value}, below your target ({target}) | {number} : {value}, sous ta cible ({target}) | *was* 18 %, sous ta cible (20 %) |
| `diag.none` | progress-middle | No stage named: none of the six numbers that can name one has a target yet. | Aucune étape désignée : aucun des six chiffres qui peuvent en désigner une n'a encore de cible. | *was* (silence) |
| `diag.addTargets` | progress-middle | Add your targets | Ajouter tes cibles | **new** |
| `peloton.title` | return* | Your 100 sign-ups | Tes 100 inscrits | *was* (the peloton, untitled) |
| `list.title` | return*, progress-* | Your numbers | Tes chiffres | *was* the five stage tabs and their panel |
| `list.found` | return* | {found} of {n} found | {found} sur {n} {found:trouvé\|trouvés} | *was* found: 2/3 |
| `list.computed` | return* | Computed from yours ({n}) | Calculés à partir des tiens ({n}) | **new** |
| `list.link` | return-hybrid | The link between the two | La liaison entre les deux | *was* The link, if you sell both ways |
| `whatif.untouched` | whatif, return | Move the lever of the stage that holds you back, and see what follows. | Bouge le levier de l'étape qui freine, et vois ce qui suit. | **new** |
| `whatif.untouchedNoStage` | progress-middle | Move one lever and see what follows. With a target, the lever of the stage that holds you back comes first. | Bouge un levier et vois ce qui suit. Avec une cible, le levier de l'étape qui freine passe en premier. | **new** |
| `whatif.moved` | whatif-moved | If {lever} went from {from} to {to} | Si {lever} passait de {from} à {to} | **new** |
| `whatif.lever` | whatif, whatif-moved | {lever}, today {value} | {lever}, aujourd'hui {value} | *was* the lever's slider label |
| `whatif.newPaying` | whatif, whatif-moved | New paying customers a month | Nouveaux payants par mois | *was* new MRR |
| `whatif.today` | whatif, whatif-moved | today {value} | aujourd'hui {value} | **new** |
| `whatif.all` | whatif, whatif-moved | All 8 levers and what the calculation assumes → | Les 8 leviers et ce que le calcul suppose → | *was* What if? (folded panel) / What the calculation assumes |
| `whatif.reset` | whatif-moved | Back to today | Revenir à aujourd'hui | **new** |
| `tour.title` | return* | The Tour and your numbers | Le Tour et tes chiffres | *was* What you declared in the Tour × what you find here |
| `slides.quiet` | return, return-month | Prepare your slides with what you have → | Préparer tes slides avec ce que tu as → | **new** |

### To ask for

| Key | Screen | English | Français | Today |
|---|---|---|---|---|
| `asks.title` | asks | To ask for ({n}) | À demander ({n}) | *was* To go and get (5) |
| `asks.done` | asks | Sent, next number → | C'est envoyé, chiffre suivant → | **new** |

### The hybrid

| Key | Screen | English | Français | Today |
|---|---|---|---|---|
| `total.link` | return-hybrid | {n} opportunities came from self-serve in August 2026 | {n} opportunités sont venues du libre-service en août 2026 | *was* Opportunities from self-serve (a row) |
| `total.shown` | return-hybrid | Engine shown | Moteur affiché | *was* Motion shown: stages and what-ifs |

### Other

| Key | Screen | English | Français | Today |
|---|---|---|---|---|
| `rename.relays` | return-hybrid (sales-assisted shown) | the steps of a deal | les relais | *was* relays |

### Settings

| Key | Screen | English | Français | Today |
|---|---|---|---|---|
| `settings.lead` | settings | Everything here has a default. Change it when a number asks for it. | Tout ici a une valeur par défaut. Change-la quand un chiffre le demande. | **new** |
| `settings.flows` | settings | Figures of | Chiffres de | *was* Flows month |
| `settings.windowHint` | settings | The window: how many days a sign-up has for it to count. | La fenêtre : le nombre de jours qu'a un inscrit pour que ça compte. | **new** |
| `settings.windowWarn` | settings | Changing this window sends Activation rate back to “to do”: its figure was counted within 7 days. | Changer cette fenêtre renvoie Taux d'activation à « à faire » : son chiffre était compté sous 7 jours. | *was* (said only on saving) |
| `settings.targets` | settings | Targets | Cibles | *was* Your current targets (step 1) |
| `settings.targetsLead` | settings | The same boxes as on each number's screen, all in one place, for a team that keeps its targets in a sheet. | Les mêmes cases que sur l'écran de chaque chiffre, toutes au même endroit, pour une équipe qui garde ses cibles dans un tableau. | **new** |
| `settings.shared` | settings | Shared counts | Nombres partagés | *was* Your base (step) |
| `settings.sharedHint` | settings | Used by {list}. | Utilisé par {list}. | **new** |
| `settings.toolsHint` | settings | They come first in “Where to find it”. | Ils passent en premier dans « Où le trouver ». | *was* (optional, folded in the setup) |
| `settings.save` | settings | Save settings | Enregistrer les réglages | **new** |

## Glossary entries: 5 new

For the `?` (GlossaryTerm) where each word is first needed (README, Q19).
If the glossary already holds one of these terms, keep its text and drop
this one.

| Term | Where its `?` sits | English | Français |
|---|---|---|---|
| cohort / cohorte | number-target (the denominator's hint of every cohort number) | The sign-ups of one month, followed over the days after. Activation and payment are read on last month's cohort, so they have had time to happen. | Les inscrits d'un même mois, suivis sur les jours qui suivent. L'activation et le paiement se lisent sur la cohorte du mois précédent, pour leur laisser le temps d'arriver. |
| target / cible | number-* (the target box's hint), settings (Targets) | The figure your team set itself for this number. Only a target can name the stage that holds the engine back. | Le chiffre que ton équipe s'est fixé pour ce chiffre. Seule une cible peut désigner l'étape qui freine le moteur. |
| reference / repère | number-* (How it compares) — offered, not drawn on the board | A range published for comparable companies. It situates your figure; it never names a stage. | Une fourchette publiée pour des entreprises comparables. Elle situe ton chiffre ; elle ne désigne jamais d'étape. |
| window / fenêtre | settings (the activation window's hint) | How many days a sign-up has for an action to count: activate within 7 days, pay within 30. Change it in Settings. | Le nombre de jours qu'a un inscrit pour qu'une action compte : s'activer en 7 jours, payer en 30. Elle se règle dans Réglages. |
| shared count / nombre partagé | settings (Shared counts) | A count several numbers use, like the month's sign-ups. Typed once: change it in one number, it changes in all of them. | Un nombre que plusieurs chiffres utilisent, comme les inscrits du mois. Saisi une fois : le modifier dans un chiffre le modifie dans tous. |

## The example's data, drawn on the board (not copy)

Outputs of functions that stay (the verdict, a generated request, the
triage's repair) and the example's answers, drawn with the brief's
"returning" data. Listed so nobody mistakes them for new copy.

| Key | Screen | English | Français |
|---|---|---|---|
| `sheet.tourAnswer` | number-open | “we measure it every month” | « on le mesure chaque mois » |
| `estimate.basisValue` | number-estimate | Ten accounts from July opened by hand in the admin. | Dix comptes de juillet ouverts à la main dans l'admin. |
| `ask.text.cac` | number-ask, asks | Hi, for our growth review I need last month's CAC: acquisition spend in August 2026 ÷ new paying customers in August 2026, free trials excluded. Could you send me the two figures? Thanks. | Bonjour, pour notre revue de growth j'ai besoin du CAC du mois dernier : dépenses d'acquisition d'août 2026 ÷ nouveaux clients payants d'août 2026, essais gratuits exclus. Peux-tu m'envoyer les deux chiffres ? Merci. |
| `cant.repair` | number-cant | Count the accounts of July 2026 still active 30 days after sign-up, from the product database. Until then, the engine says the stage is not measured: it may hide what holds you back. | Compte les comptes de juillet 2026 encore actifs 30 jours après l'inscription, dans la base produit. D'ici là, le moteur dit que l'étape n'est pas mesurée : elle peut cacher ce qui freine. |
| `peloton.s3found` | return-found | Product database · July 2026 | Base produit · juillet 2026 |
| `peloton.s4found` | return-found | Stripe · July 2026 | Stripe · juillet 2026 |
| `asks.text.data` | asks | Hi, for our growth review I need two figures for July 2026's sign-ups: the share who paid within 30 days, and how many sign-ups each account brought by invitation. Could you send them? Thanks. | Bonjour, pour notre revue de growth j'ai besoin de deux chiffres sur les inscrits de juillet 2026 : la part qui a payé sous 30 jours, et combien d'inscrits chaque compte a amenés par invitation. Peux-tu me les envoyer ? Merci. |
| `asks.text.cs` | asks | Hi, for our growth review: what was the main reason customers gave for leaving in August 2026? One line is enough. Thanks. | Bonjour, pour notre revue de growth : quelle est la principale raison donnée par les clients partis en août 2026 ? Une ligne suffit. Merci. |
| `asks.text.finance` | asks | Hi, for our growth review I need, for August 2026: the acquisition spend and the new paying customers (for the CAC), and the gross margin. Could you send me these figures? Thanks. | Bonjour, pour notre revue de growth j'ai besoin, pour août 2026 : des dépenses d'acquisition et des nouveaux clients payants (pour le CAC), et de la marge brute. Peux-tu m'envoyer ces chiffres ? Merci. |
| `total.title` | return-hybrid | €119,600 of MRR in August 2026, from two engines. | 119 600 € de MRR en août 2026, venus de deux moteurs. |

## Kept as they are today: 117 strings

Drawn on the board for context, unchanged. Where the board could not read
today's exact wording from the screenshots, it writes the closest it could
and the app keeps its own.

| Key | English | Français |
|---|---|---|
| `landing.eyebrow` | The engine | Le moteur |
| `landing.h1` | Your growth engine | Ton moteur de growth |
| `landing.lede` | Your Tour tells you whether you measure. The engine shows what your numbers say. | Ton Tour dit si tu mesures. Le moteur montre ce que disent tes chiffres. |
| `landing.positioning` | Seventeen numbers for self-serve, fifteen for sales-assisted: go and get them, see where your engine loses people and leave with slides ready for your leadership meeting. Your numbers are compared only with your own target: published references are there to situate, never to name a stage. | Dix-sept chiffres en libre-service, quinze en assisté : va les chercher, vois où ton moteur perd du monde et repars avec des slides prêtes pour ton CODIR. Tes chiffres ne sont comparés qu'à ta propre cible : les repères publiés sont là pour situer, jamais pour désigner une étape. |
| `landing.promiseTitle` | Nothing you enter leaves this page | Rien de ce que tu saisis ne sort d'ici |
| `landing.promiseBody` | No number and no text you type leaves your browser. No account, no server: everything stays on this device, and you can check it in your browser's Network tab. The page counts its visits, without a cookie — never what you write in it. | Aucun chiffre ni aucun texte que tu saisis ne quitte ton navigateur. Pas de compte, pas de serveur : tout reste sur cet appareil, et tu peux le vérifier dans l'onglet Réseau de ton navigateur. La page compte ses visites, sans cookie — jamais ce que tu y écris. |
| `landing.cta` | Enter your numbers → | Entre tes chiffres → |
| `landing.ctaNote` | Free, no account. Everything stays on your device. | Gratuit, sans compte. Tout reste sur ton appareil. |
| `landing.belowTitle` | How long it takes | Combien de temps ça prend |
| `start.title` | Before you start | Avant de commencer |
| `start.ss` | Self-serve | Libre-service |
| `start.sa` | Sales-assisted | Assisté |
| `bar.engine` | Unnamed engine | Moteur sans nom |
| `bar.motion.ss` | Self-serve | Libre-service |
| `bar.month` | {month} | {month} |
| `bar.readOnly` | read only | lecture seule |
| `bar.settings` | Settings | Réglages |
| `bar.neverSaved` | Never saved | Jamais enregistré |
| `bar.compare` | Compare two months | Comparer deux mois |
| `bar.save` | Save (.json) | Enregistrer (.json) |
| `bar.import` | Import a file | Importer un fichier |
| `bar.table` | Enter as a table | Saisir en tableau |
| `bar.backup` | Your engine only exists in this browser. Safari may erase a site's data after seven days of Safari use without a visit to that site: save it to a file. | Ton moteur n'existe que dans ce navigateur. Safari peut effacer les données d'un site après sept jours d'utilisation de Safari sans visite de ce site : enregistre-le dans un fichier. |
| `next.ago12` | 12 days ago | il y a 12 jours |
| `next.saveNow` | Save (.json) | Enregistrer (.json) |
| `next.go.slides` | Prepare your slides → | Préparer tes slides → |
| `next.correct` | Correct this month | Corriger ce mois |
| `status.found` | Found | Trouvé |
| `status.asked` | Asked | Demandé |
| `status.todo` | To do | À faire |
| `sheet.definition` | Definition → | Définition → |
| `sheet.formula` | Formula | Formule |
| `value.joiner` | out of | sur |
| `value.signupsMonth` | Sign-ups in August 2026 | Inscrits en août 2026 |
| `value.visitorsMonth` | Unique visitors in August 2026 | Visiteurs uniques en août 2026 |
| `value.activatedCohort` | Activated within 7 days | Activés sous 7 jours |
| `value.cohortSignups` | Sign-ups in July 2026 | Inscrits en juillet 2026 |
| `value.shared` | Same number as for Top channel share: changing it here changes it everywhere. | Même nombre que pour Part du premier canal : le modifier ici le modifie partout. |
| `value.sharedTarget` | Same number as for Day-30 retention and Paid conversion: changing it here changes it everywhere. | Même nombre que pour Rétention à J30 et Conversion en payant : le modifier ici le modifie partout. |
| `value.downgrades` | MRR lost to downgrades, August 2026 | MRR perdu en rétrogradation, août 2026 |
| `value.mrrStart` | MRR at the start of August 2026 | MRR au début d'août 2026 |
| `value.sharedExpansion` | Same number as for Monthly expansion: changing it here changes it everywhere. | Même nombre que pour Expansion mensuelle : le modifier ici le modifie partout. |
| `page.catalogue` | The engine's numbers | Les chiffres du moteur |
| `page.faq` | Frequently asked questions | Questions fréquentes |
| `settings.consumer` | Consumer app | App grand public |
| `value.onlyRate` | I only have the rate | Je n'ai que le taux |
| `value.source` | Where does it come from? | D'où vient ce chiffre ? |
| `value.choose` | Choose… | Choisir… |
| `value.otherTool` | The denominator comes from another tool | Le dénominateur vient d'un autre outil |
| `answer.estimate` | I can estimate it | Je peux l'estimer |
| `answer.ask` | I'll ask for it | Je le demande |
| `answer.cant` | I can't find it | Je ne le trouve pas |
| `estimate.low` | Low estimate | Estimation basse |
| `estimate.high` | High estimate | Estimation haute |
| `estimate.joiner` | to | à |
| `estimate.unit` | days | jours |
| `estimate.basis` | What is it based on? | Sur quoi repose-t-elle ? |
| `ask.role` | Who has it? | Qui l'a ? |
| `ask.role.product` | Product | Produit |
| `ask.role.sales` | Sales | Ventes |
| `ask.preview` | The request you copy | La demande que tu copies |
| `ask.copy` | Copy the request | Copier la demande |
| `cant.repairLabel` | To repair | Pour réparer |
| `cant.legend` | Why can't you find it? | Pourquoi tu ne le trouves pas ? |
| `cant.notTracked` | Nothing is tracked to count it | Rien n'est suivi pour le compter |
| `cant.noAccess` | It exists, but I can't reach it | Il existe, mais je n'y ai pas accès |
| `cant.undefined` | We haven't defined it | On ne l'a pas défini |
| `where.label` | Where to find it | Où le trouver |
| `where.also` | Also in {tool}: | Aussi dans {tool} : |
| `compare.optional` | optional | facultatif |
| `compare.below` | Below target | Sous la cible |
| `words.definition` | Your definition | Ta définition |
| `words.definitionHint` | For example “active = at least one project edited”. It appears in the slides' annex and in the requests you copy. | Par exemple « actif = au moins un projet modifié ». Elle apparaît dans l'annexe des slides et dans les demandes que tu copies. |
| `words.note` | Note to self | Note pour toi |
| `words.noteHint` | Never on a slide. | Jamais sur une slide. |
| `sheet.save` | Save and continue → | Enregistrer et continuer → |
| `diag.eyebrow` | One stage holds the engine back | Une étape freine le moteur |
| `diag.hiding` | Without a figure for day-30 retention and the share of referred sign-ups, the stage that really holds you back may be hiding there. | Sans chiffre pour la rétention à J30 et la part des inscrits recommandés, l'étape qui freine vraiment peut s'y cacher. |
| `diag.top` | The biggest loss in number is always at the top of the funnel; that is not what names the stage that holds you back. | La plus grosse perte en nombre est toujours en haut du funnel ; ce n'est pas ce qui désigne l'étape qui freine. |
| `peloton.lead` | ~3,200 visitors in the month for 100 sign-ups · GA4 · August 2026 | ~3 200 visiteurs du mois pour 100 inscrits · GA4 · août 2026 |
| `peloton.c1` | Sign-ups | Inscrits |
| `peloton.c2` | Activated | Activés |
| `peloton.c3` | Active at day 30 | Actifs à J30 |
| `peloton.c4` | Paying at day 30 | Payants à J30 |
| `peloton.s1` | 800 sign-ups in July 2026, brought to 100 | 800 inscrits en juillet 2026, ramenés à 100 |
| `peloton.s2` | Amplitude · July 2026 | Amplitude · juillet 2026 |
| `peloton.s3` | not measured | non mesuré |
| `peloton.s4` | estimated range · July 2026 | fourchette estimée · juillet 2026 |
| `list.holds` | Holds you back | Freine ici |
| `whatif.title` | What if? | Et si ? |
| `whatif.mrr12` | MRR in 12 months | MRR dans 12 mois |
| `tour.invite` | Take the Tour on this device to see what you declared beside what you measure. | Fais le Tour sur cet appareil pour voir ce que tu as déclaré à côté de ce que tu mesures. |
| `tour.go` | Take the Tour → | Faire le Tour → |
| `asks.lead` | Send the requests today, fill in the rest while waiting. | Envoie les demandes aujourd'hui, remplis le reste en attendant les réponses. |
| `asks.role.finance` | Finance | Finance |
| `asks.role.data` | Data | Data |
| `asks.role.cs` | Customer success | Succès client |
| `asks.numbers` | {list} | {list} |
| `total.eyebrow` | Two engines, one total | Deux moteurs, un total |
| `total.ss` | Self-serve MRR | MRR libre-service |
| `total.sa` | Sales-assisted MRR | MRR assisté |
| `total.sum` | Total MRR | MRR total |
| `total.sample` | Sales-assisted counts are small (26 customers): one deal moves a rate by several points. | Les comptes de l'assisté sont petits (26 clients) : un contrat déplace un taux de plusieurs points. |
| `total.mrr12` | Total MRR in 12 months | MRR total dans 12 mois |
| `settings.title` | Settings | Réglages |
| `settings.month` | The month | Le mois |
| `settings.flowsHint` | Flows (sign-ups, visitors, MRR) are read on this month; activation and payment on the month before's sign-ups, so they have had time to happen. | Les flux (inscrits, visiteurs, MRR) se lisent sur ce mois ; l'activation et le paiement sur les inscrits du mois d'avant, pour leur laisser le temps d'arriver. |
| `settings.activation` | Activation counts within | L'activation compte sous |
| `settings.payment` | Payment counts within | Le paiement compte sous |
| `settings.days` | {n} days | {n} jours |
| `settings.currency` | Currency | Devise |
| `settings.name` | Company name, on the slides | Nom de l'entreprise, sur les slides |
| `settings.tools` | Your tools | Tes outils |
| `settings.company` | Company type | Type d'entreprise |
| `settings.later` | later | plus tard |
| `settings.tourLink` | Link the Tour taken on this device | Lier le Tour fait sur cet appareil |
| `settings.cancel` | Cancel | Annuler |
