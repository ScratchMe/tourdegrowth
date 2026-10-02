// Every string the board draws, French and English, with the screen it sits
// on and whether it is new, changed or kept. COPY.md is generated from this
// file (board/make-copy.mjs), so the board and the review sheet cannot drift.
//
// French typography: strings are written with ordinary spaces; `frTypo`
// (below) puts the narrow no-break space (U+202F) before : ; ? ! and inside
// « », as the house rule asks, both on the board and in COPY.md.
//
// Status:
//   new      — a string that does not exist today;
//   changed  — replaces today's string, given in `was`;
//   kept     — today's string, drawn for context. Not listed in COPY.md's
//              review table (it is in its "kept" appendix).
//   example  — the output of a function that stays (the verdict, a request):
//              drawn with the example's data, not new copy.

const NNBSP = " ";

export const frTypo = (text) =>
  String(text)
    .replace(/ ([:;?!»])/g, `${NNBSP}$1`)
    .replace(/« /g, `«${NNBSP}`)
    .replace(/(\d) (\d{3})\b/g, `$1${NNBSP}$2`);

const s = (en, fr, on, status = "new", was) => ({ en, fr, on, status, was });

export const COPY = {
  // ── The page around the tool ──────────────────────────────────────────
  "landing.eyebrow": s("The engine", "Le moteur", ["arrival", "return-*"], "kept"),
  "landing.h1": s("Your growth engine", "Ton moteur de growth", ["arrival", "return-*"], "kept"),
  "landing.lede": s(
    "Your Tour tells you whether you measure. The engine shows what your numbers say.",
    "Ton Tour dit si tu mesures. Le moteur montre ce que disent tes chiffres.",
    ["arrival"], "kept"),
  "landing.positioning": s(
    "Seventeen numbers for self-serve, fifteen for sales-assisted: go and get them, see where your engine loses people and leave with slides ready for your leadership meeting. Your numbers are compared only with your own target: published references are there to situate, never to name a stage.",
    "Dix-sept chiffres en libre-service, quinze en assisté : va les chercher, vois où ton moteur perd du monde et repars avec des slides prêtes pour ton CODIR. Tes chiffres ne sont comparés qu'à ta propre cible : les repères publiés sont là pour situer, jamais pour désigner une étape.",
    ["arrival"], "kept"),
  "landing.promiseTitle": s("Nothing you enter leaves this page", "Rien de ce que tu saisis ne sort d'ici", ["arrival"], "kept"),
  "landing.promiseBody": s(
    "No number and no text you type leaves your browser. No account, no server: everything stays on this device, and you can check it in your browser's Network tab. The page counts its visits, without a cookie — never what you write in it.",
    "Aucun chiffre ni aucun texte que tu saisis ne quitte ton navigateur. Pas de compte, pas de serveur : tout reste sur cet appareil, et tu peux le vérifier dans l'onglet Réseau de ton navigateur. La page compte ses visites, sans cookie — jamais ce que tu y écris.",
    ["arrival"], "kept"),
  "landing.cta": s("Enter your numbers →", "Entre tes chiffres →", ["arrival"], "kept"),
  "landing.ctaNote": s("Free, no account. Everything stays on your device.", "Gratuit, sans compte. Tout reste sur ton appareil.", ["arrival"], "kept"),
  "landing.promiseLine": s(
    "Nothing you enter leaves this page: your engine lives in this browser only.",
    "Rien de ce que tu saisis ne sort d'ici : ton moteur ne vit que dans ce navigateur.",
    ["return-*"]),
  "landing.reserve": s("Opening your engine…", "Ouverture de ton moteur…", ["return-instant"]),
  "landing.belowTitle": s("How long it takes", "Combien de temps ça prend", ["arrival"], "kept"),
  "landing.belowNote": s(
    "Moved under the tool, with the catalogue and the FAQ: the setup card now says the same counts in one line.",
    "Déplacé sous l'outil, avec le catalogue et la FAQ : la carte de départ dit les mêmes comptes en une ligne.",
    ["arrival"], "board"),

  // ── First visit: the start card ────────────────────────────────────────
  "start.title": s("Before you start", "Avant de commencer", ["setup", "arrival"], "kept"),
  "start.legend": s("How do you sell?", "Comment vends-tu ?", ["setup", "arrival", "settings"], "changed", "Self-serve / Sales-assisted (two boxes, no question)"),
  "start.ss": s("Self-serve", "Libre-service", ["setup", "settings"], "kept"),
  "start.ssNote": s("People sign up and pay on their own (PLG).", "On s'inscrit et on paie seul (PLG).", ["setup", "settings"]),
  "start.sa": s("Sales-assisted", "Assisté", ["setup", "settings"], "kept"),
  "start.saNote": s("A salesperson signs the deals (SLG).", "Un commercial signe les contrats (SLG).", ["setup", "settings"]),
  "start.both": s("Both", "Les deux", ["setup", "settings"]),
  "start.bothNote": s("Two engines, one total.", "Deux moteurs, un total.", ["setup", "settings"]),
  "start.plan.ss": s(
    "17 numbers: 5 take five minutes, 7 about an hour each, 5 come from someone else.",
    "17 chiffres : 5 se lisent en cinq minutes, 7 demandent environ une heure chacun, 5 sont à demander à quelqu'un.",
    ["setup", "arrival"]),
  "start.plan.sa": s(
    "15 numbers: 4 take five minutes, 5 about an hour each, 6 come from someone else.",
    "15 chiffres : 4 se lisent en cinq minutes, 5 demandent environ une heure chacun, 6 sont à demander à quelqu'un.",
    ["setup"]),
  "start.plan.both": s(
    "33 numbers: 9 take five minutes, 13 about an hour each, 11 come from someone else.",
    "33 chiffres : 9 se lisent en cinq minutes, 13 demandent environ une heure chacun, 11 sont à demander à quelqu'un.",
    ["setup"]),
  "start.defaults": s(
    "Set for a B2B SaaS, in euros, on August 2026's figures and July 2026's sign-ups.",
    "Réglé pour un SaaS B2B, en euros, sur les chiffres d'août 2026 et les inscrits de juillet 2026.",
    ["setup", "arrival"]),
  "start.change": s("Change", "Modifier", ["setup", "arrival"]),
  "start.go": s("Start with your first number →", "Commencer par ton premier chiffre →", ["setup", "arrival"], "changed", "Start step by step →"),
  "start.example": s("See a filled-in example", "Voir un exemple rempli", ["setup", "arrival"], "changed", "See a filled-in example, funnel and slides →"),
  "start.import": s("Import a file (.json)", "Importer un fichier (.json)", ["setup", "arrival"], "changed", "Import a file"),

  // ── The engine bar ─────────────────────────────────────────────────────
  "bar.engine": s("Unnamed engine", "Moteur sans nom", ["return-*"], "kept"),
  "bar.motion.ss": s("Self-serve", "Libre-service", ["return-*"], "kept"),
  "bar.motion.both": s("Self-serve and sales-assisted", "Libre-service et assisté", ["return-hybrid"]),
  "bar.month": s("{month}", "{month}", ["return-*"], "kept"),
  "bar.readOnly": s("read only", "lecture seule", ["return-past"], "kept"),
  "bar.menu": s("Engine, month and file", "Moteur, mois et fichier", ["return-*"], "changed", "the engine line's +, the month selector, the actions row"),
  "bar.settings": s("Settings", "Réglages", ["return-*"], "kept"),
  "bar.neverSaved": s("Never saved", "Jamais enregistré", ["return-*"], "kept"),
  "bar.group.engine": s("This engine", "Ce moteur", ["return-menu"]),
  "bar.switch": s("Switch or add an engine", "Changer ou ajouter un moteur", ["return-menu"], "changed", "+ (engine line)"),
  "bar.rename": s("Rename", "Renommer", ["return-menu"]),
  "bar.group.month": s("Month", "Mois", ["return-menu"]),
  "bar.monthField": s("Month shown", "Mois affiché", ["return-menu"]),
  "bar.compare": s("Compare two months", "Comparer deux mois", ["return-menu"], "kept"),
  "bar.remind": s("Remind me to start {next} (.ics)", "Me rappeler de démarrer {next} (.ics)", ["return-menu"], "changed", "Remind me to start September 2026"),
  "bar.group.file": s("File", "Fichier", ["return-menu"]),
  "bar.save": s("Save (.json)", "Enregistrer (.json)", ["return-menu"], "kept"),
  "bar.import": s("Import a file", "Importer un fichier", ["return-menu"], "kept"),
  "bar.table": s("Enter as a table", "Saisir en tableau", ["return-menu"], "kept"),
  "bar.erase": s("Erase this engine", "Effacer ce moteur", ["return-menu"], "changed", "Erase everything"),
  "bar.backup": s(
    "Your engine only exists in this browser. Safari may erase a site's data after seven days of Safari use without a visit to that site: save it to a file.",
    "Ton moteur n'existe que dans ce navigateur. Safari peut effacer les données d'un site après sept jours d'utilisation de Safari sans visite de ce site : enregistre-le dans un fichier.",
    ["return-menu"], "kept"),

  // ── Next step: "since last time" and the one primary ──────────────────
  "next.since": s("Last visit · {ago}", "Dernière visite · {ago}", ["return", "return-*"], "changed", "7 of 17 numbers found · last visit 12 days ago"),
  "next.ago12": s("12 days ago", "il y a 12 jours", ["return"], "kept"),
  "next.ago3": s("3 days ago", "il y a 3 jours", ["return-found", "return-month"]),
  "next.where": s("Where you are", "Où tu en es", ["progress-middle", "progress-end"]),
  "next.toGo": s(
    "{n} numbers to go: {own} on your own, about an hour each, and {ask} to ask {role}.",
    "{n} chiffres à faire : {own} seul, environ une heure chacun, et {ask} à demander à {role}.",
    ["return"]),
  "next.asked": s(
    "Asked {role} for the {number} {ago}: no answer typed yet.",
    "Demandé à {role} {ago} : {number}, pas encore de réponse.",
    ["return", "progress-end"]),
  "next.followUp": s("Follow up", "Relancer", ["return", "progress-end"], "changed", "Follow up: Data"),
  "next.backup": s(
    "Never saved to a file: Safari may erase it after seven days without a visit.",
    "Jamais enregistré dans un fichier : Safari peut l'effacer après sept jours sans visite.",
    ["return"]),
  "next.saveNow": s("Save (.json)", "Enregistrer (.json)", ["return"], "kept"),
  "next.go.ask": s("Ask {role} for the {number} →", "Demander le {number} à {role} →", ["return"]),
  "next.go.number": s("Next number: {number} →", "Chiffre suivant : {number} →", ["progress-middle", "whatif"], "changed", "Continue"),
  "next.go.requests": s("Copy your {n} requests →", "Copier tes {n} demandes →", ["progress-middle"]),
  "next.skipRequests": s("Type the next number first", "Taper d'abord le chiffre suivant", ["progress-middle"]),
  "next.mid": s(
    "The {n} quick numbers are in. {ask} come from someone else: send their requests now, fill in the rest while you wait.",
    "Les {n} chiffres rapides sont là. {ask} sont à demander : envoie les demandes maintenant, remplis le reste en attendant.",
    ["progress-middle"]),
  "next.allFound": s("All {n} numbers found.", "Les {n} chiffres sont trouvés.", ["return-found"]),
  "next.verdictIsSlide": s("Your verdict above is the title of your first slide.", "Ton verdict, ci-dessus, est le titre de ta première slide.", ["return-found", "progress-end"]),
  "next.endAnswered": s(
    "Every number has an answer: {found} found, {est} estimated, {cant} can't be found, {asked} asked.",
    "Chaque chiffre a une réponse : {found} {found:trouvé|trouvés}, {est} {est:estimé|estimés}, {cant} {cant:introuvable|introuvables}, {asked} {asked:demandé|demandés}.",
    ["progress-end"]),
  "next.requestsOut": s(
    "{n} requests out since {date}: their answers go in when they come.",
    "{n} demandes envoyées le {date} : leurs réponses s'ajoutent quand elles arrivent.",
    ["progress-end"]),
  "verdict.pending": s(
    "Your verdict appears here once a stage's number is in: the engine writes it from your numbers.",
    "Ton verdict s'affiche ici dès que le chiffre d'une étape est là : le moteur l'écrit à partir de tes chiffres.",
    ["progress-middle"]),
  "next.go.slides": s("Prepare your slides →", "Préparer tes slides →", ["return-found", "progress-end"], "kept"),
  "next.monthEnded": s(
    "{month} has ended: its figures can be read now.",
    "{month} est terminé : ses chiffres se lisent maintenant.",
    ["return-month"]),
  "next.monthCarries": s(
    "It starts from {prev}'s targets and definitions; the numbers start empty, and {prev} stays, read only, under Month.",
    "Il reprend les cibles et définitions d'{prev} ; les chiffres repartent vides, et {prev} reste, en lecture seule, sous Mois.",
    ["return-month"]),
  "next.go.month": s("Start {month} →", "Démarrer {month} →", ["return-month"], "changed", "Start September 2026 (dashed band)"),
  "next.keepFilling": s("Keep filling {prev}", "Continuer {prev}", ["return-month"]),
  "next.past": s(
    "You are reading {month}. Nothing here changes unless you correct it.",
    "Tu lis {month}. Rien ne change ici, sauf si tu le corriges.",
    ["return-past"]),
  "next.go.back": s("Back to {month} →", "Revenir à {month} →", ["return-past"]),
  "next.correct": s("Correct this month", "Corriger ce mois", ["return-past"], "kept"),
  "next.refused": s(
    "Your browser refused to save: what you type now is lost when this tab closes.",
    "Ton navigateur a refusé d'enregistrer : ce que tu tapes maintenant sera perdu à la fermeture de l'onglet.",
    ["return-refused"]),
  "next.go.saveFile": s("Save to a file (.json) →", "Enregistrer dans un fichier (.json) →", ["return-refused"]),

  // ── Progress ───────────────────────────────────────────────────────────
  "progress.toGo": s("{n} to go", "{n} à faire", ["number-*", "return-*", "progress-*"], "changed", "Number 4 of 17 / 7 of 17 numbers found"),
  "progress.lastOne": s("Last one to go", "Plus qu'un", ["progress-last"]),
  "progress.noneToGo": s("None to go", "Plus rien à faire", ["progress-end", "return-found"]),
  "progress.counts": s(
    "{found} found · {est} estimated · {asked} asked · {cant} can't find",
    "{found} {found:trouvé|trouvés} · {est} {est:estimé|estimés} · {asked} {asked:demandé|demandés} · {cant} {cant:introuvable|introuvables}",
    ["return-*", "progress-*"], "changed", "7 of 17 numbers found · 2 approximate · 5 in progress · 3 missing"),
  "progress.legendLabel": s("What the marks mean", "Ce que disent les marques", ["return-*"]),
  "status.found": s("Found", "Trouvé", ["return-*", "number-*"], "kept"),
  "status.est": s("Estimated", "Estimé", ["return-*"], "changed", "approximate"),
  "status.asked": s("Asked", "Demandé", ["return-*"], "kept"),
  "status.askedAgo": s("Asked · 12 d", "Demandé · 12 j", ["return"]),
  "status.cant": s("Can't find", "Introuvable", ["return-*"], "changed", "missing"),
  "status.todo": s("To do", "À faire", ["return-*", "number-*"], "kept"),
  "status.computed": s("Computed", "Calculé", ["return-*"]),
  "status.needs": s("Needs {what}", "Il manque {what}", ["return"]),

  // ── One number ─────────────────────────────────────────────────────────
  "sheet.position": s("{stage} · {i} of {n}", "{stage} · {i} sur {n}", ["number-*"], "changed", "Number 1 of 17 · Acquisition"),
  "sheet.definition": s("Definition →", "Définition →", ["number-*"], "kept"),
  "sheet.formula": s("Formula", "Formule", ["number-*"], "kept"),
  "sheet.tour": s("In the Tour, you answered: {answer}", "Dans le Tour, tu as répondu : {answer}", ["number-open"], "changed", "What you declared in the Tour (block)"),
  "sheet.tourAnswer": s("“we measure it every month”", "« on le mesure chaque mois »", ["number-open"], "example"),
  "trap.label": s("The trap, before you type", "Le piège, avant de taper", ["number-*"], "changed", "The trap (inside Where to find it, folded)"),
  "trap.writeDefinition": s("Write your definition", "Écrire ta définition", ["number-*"]),
  "trap.hybrid": s("When you sell both ways", "Si tu vends des deux façons", ["number-* (hybrid)"]),
  "value.joiner": s("out of", "sur", ["number-*"], "kept"),
  "value.signupsMonth": s("Sign-ups in August 2026", "Inscrits en août 2026", ["number-*"], "kept"),
  "value.visitorsMonth": s("Unique visitors in August 2026", "Visiteurs uniques en août 2026", ["number-*"], "kept"),
  "value.activatedCohort": s("Activated within 7 days", "Activés sous 7 jours", ["number-target"], "kept"),
  "value.cohortSignups": s("Sign-ups in July 2026", "Inscrits en juillet 2026", ["number-target"], "kept"),
  "value.cohortHint": s(
    "Take July 2026's sign-ups, not August's: they have had their 7 days to activate.",
    "Prends les inscrits de juillet 2026, pas ceux d'août : ils ont eu leurs 7 jours pour s'activer.",
    ["number-target"], "changed", "the cohort sentence, a block above the status question"),
  "value.shared": s(
    "Same number as for Top channel share: changing it here changes it everywhere.",
    "Même nombre que pour Part du premier canal : le modifier ici le modifie partout.",
    ["number-have", "number-open"], "kept"),
  "value.sharedTarget": s(
    "Same number as for Day-30 retention and Paid conversion: changing it here changes it everywhere.",
    "Même nombre que pour Rétention à J30 et Conversion en payant : le modifier ici le modifie partout.",
    ["number-target"], "kept"),
  "value.downgrades": s("MRR lost to downgrades, August 2026", "MRR perdu en rétrogradation, août 2026", ["progress-last"], "kept"),
  "value.mrrStart": s("MRR at the start of August 2026", "MRR au début d'août 2026", ["progress-last"], "kept"),
  "value.sharedExpansion": s(
    "Same number as for Monthly expansion: changing it here changes it everywhere.",
    "Même nombre que pour Expansion mensuelle : le modifier ici le modifie partout.",
    ["progress-last"], "kept"),
  "page.catalogue": s("The engine's numbers", "Les chiffres du moteur", ["arrival", "return-*"], "kept"),
  "page.faq": s("Frequently asked questions", "Questions fréquentes", ["arrival", "return-*"], "kept"),
  "settings.consumer": s("Consumer app", "App grand public", ["settings"], "kept"),
  "value.result": s("{name}: {value}", "{name} : {value}", ["number-have", "number-target", "number-open"]),
  "value.onlyRate": s("I only have the rate", "Je n'ai que le taux", ["number-*"], "kept"),
  "value.source": s("Where does it come from?", "D'où vient ce chiffre ?", ["number-have", "number-open"], "kept"),
  "value.choose": s("Choose…", "Choisir…", ["number-have"], "kept"),
  "value.otherTool": s("The denominator comes from another tool", "Le dénominateur vient d'un autre outil", ["number-have", "number-open"], "kept"),
  "value.invalid": s(
    "More sign-ups than visitors: check that both cover August 2026, and that visitors are Users, not Sessions.",
    "Plus d'inscrits que de visiteurs : vérifie que les deux couvrent août 2026, et que les visiteurs sont des Utilisateurs, pas des Sessions.",
    ["number-invalid"], "changed", "the sheet's generic invalid-value message"),
  "value.notSaved": s("Not saved: one figure to check.", "Pas enregistré : un chiffre à vérifier.", ["number-invalid"]),
  "answer.legend": s("No figure to hand?", "Pas de chiffre sous la main ?", ["number-*"], "changed", "Where are you with this number? (four choices, before the value)"),
  "answer.estimate": s("I can estimate it", "Je peux l'estimer", ["number-*"], "kept"),
  "answer.ask": s("I'll ask for it", "Je le demande", ["number-*"], "kept"),
  "answer.cant": s("I can't find it", "Je ne le trouve pas", ["number-*"], "kept"),
  "answer.back": s("← I have the figure after all", "← J'ai le chiffre, finalement", ["number-estimate", "number-ask", "number-cant"]),
  "estimate.low": s("Low estimate", "Estimation basse", ["number-estimate"], "kept"),
  "estimate.high": s("High estimate", "Estimation haute", ["number-estimate"], "kept"),
  "estimate.joiner": s("to", "à", ["number-estimate"], "kept"),
  "estimate.unit": s("days", "jours", ["number-estimate"], "kept"),
  "estimate.basis": s("What is it based on?", "Sur quoi repose-t-elle ?", ["number-estimate"], "kept"),
  "estimate.basisValue": s(
    "Ten accounts from July opened by hand in the admin.",
    "Dix comptes de juillet ouverts à la main dans l'admin.",
    ["number-estimate"], "example"),
  "ask.role": s("Who has it?", "Qui l'a ?", ["number-ask"], "kept"),
  "ask.role.product": s("Product", "Produit", ["number-ask"], "kept"),
  "ask.role.sales": s("Sales", "Ventes", ["number-ask"], "kept"),
  "ask.preview": s("The request you copy", "La demande que tu copies", ["number-ask"], "kept"),
  "ask.copy": s("Copy the request", "Copier la demande", ["number-ask", "asks"], "kept"),
  "ask.copied": s(
    "Copied on {date}. Your engine reminds you to follow it up.",
    "Copiée le {date}. Ton moteur te rappellera de relancer.",
    ["number-ask", "asks"], "changed", "Requested (tag)"),
  "ask.text.cac": s(
    "Hi, for our growth review I need last month's CAC: acquisition spend in August 2026 ÷ new paying customers in August 2026, free trials excluded. Could you send me the two figures? Thanks.",
    "Bonjour, pour notre revue de growth j'ai besoin du CAC du mois dernier : dépenses d'acquisition d'août 2026 ÷ nouveaux clients payants d'août 2026, essais gratuits exclus. Peux-tu m'envoyer les deux chiffres ? Merci.",
    ["number-ask", "asks"], "example"),
  "cant.repairLabel": s("To repair", "Pour réparer", ["number-cant"], "kept"),
  "cant.legend": s("Why can't you find it?", "Pourquoi tu ne le trouves pas ?", ["number-cant"], "kept"),
  "cant.notTracked": s("Nothing is tracked to count it", "Rien n'est suivi pour le compter", ["number-cant"], "kept"),
  "cant.noAccess": s("It exists, but I can't reach it", "Il existe, mais je n'y ai pas accès", ["number-cant"], "kept"),
  "cant.undefined": s("We haven't defined it", "On ne l'a pas défini", ["number-cant"], "kept"),
  "cant.repair": s(
    "Count the accounts of July 2026 still active 30 days after sign-up, from the product database. Until then, the engine says the stage is not measured: it may hide what holds you back.",
    "Compte les comptes de juillet 2026 encore actifs 30 jours après l'inscription, dans la base produit. D'ici là, le moteur dit que l'étape n'est pas mesurée : elle peut cacher ce qui freine.",
    ["number-cant"], "example"),
  "where.label": s("Where to find it", "Où le trouver", ["number-*"], "kept"),
  "where.also": s("Also in {tool}:", "Aussi dans {tool} :", ["number-open"], "kept"),
  "where.yours": s("your tool", "ton outil", ["number-open"]),
  "compare.title": s("How it compares", "Comment il se situe", ["number-*"], "changed", "Reference (strip) + the target box + below the target"),
  "compare.yours": s("Your figure", "Ton chiffre", ["number-*"]),
  "compare.reference": s("Reference {range}", "Repère {range}", ["number-*"], "changed", "Reference"),
  "compare.target": s("Your team's target", "La cible de ton équipe", ["number-*", "settings"], "changed", "Target for {number}"),
  "compare.optional": s("optional", "facultatif", ["number-*", "settings"], "kept"),
  "compare.targetHint": s(
    "Only a target names the stage that holds you back. Without one, the figure still counts.",
    "Seule une cible désigne l'étape qui freine. Sans cible, le chiffre compte quand même.",
    ["number-*"], "changed", "the targets step's intro"),
  "compare.below": s("Below target", "Sous la cible", ["number-target", "return-*"], "kept"),
  "compare.atOrAbove": s("At or above target", "À la cible ou au-dessus", ["number-have"]),
  "compare.noTargetHere": s(
    "This number situates; it does not name a stage.",
    "Ce chiffre situe ; il ne désigne pas d'étape.",
    ["number-estimate"]),
  "compare.chart": s(
    "{name}: {value}. Reference {range}. {target}",
    "{name} : {value}. Repère {range}. {target}",
    ["number-*"]),
  "compare.chartTarget": s("Target {value}.", "Cible {value}.", ["number-*"]),
  "compare.chartNoTarget": s("No target.", "Pas de cible.", ["number-*"]),
  "words.summary": s("Your definition and a note", "Ta définition et une note", ["number-*"], "changed", "Your definition (always open) + Note to self (always open)"),
  "words.definition": s("Your definition", "Ta définition", ["number-*"], "kept"),
  "words.definitionHint": s(
    "For example “active = at least one project edited”. It appears in the slides' annex and in the requests you copy.",
    "Par exemple « actif = au moins un projet modifié ». Elle apparaît dans l'annexe des slides et dans les demandes que tu copies.",
    ["number-*"], "kept"),
  "words.note": s("Note to self", "Note pour toi", ["number-*"], "kept"),
  "words.noteHint": s("Never on a slide.", "Jamais sur une slide.", ["number-*"], "kept"),
  "sheet.save": s("Save and continue →", "Enregistrer et continuer →", ["number-*"], "kept"),
  "sheet.saveLast": s("Save and see your engine →", "Enregistrer et voir ton moteur →", ["progress-last"]),
  "sheet.toList": s("← Your numbers", "← Tes chiffres", ["number-*"], "changed", "See the full board"),
  "sheet.skip": s("Skip for now", "Passer pour l'instant", ["number-*"], "changed", "Skip, I'll come back to it"),
  "sheet.computed": s("Computed from your numbers: nothing to type.", "Calculé à partir de tes chiffres : rien à taper.", ["return"]),

  // ── The board ──────────────────────────────────────────────────────────
  "diag.eyebrow": s("One stage holds the engine back", "Une étape freine le moteur", ["return*", "progress-end"], "kept"),
  "diag.value": s("{number}: {value}, below your target ({target})", "{number} : {value}, sous ta cible ({target})", ["return*"], "changed", "18 %, sous ta cible (20 %)"),
  "diag.hiding": s(
    "Without a figure for day-30 retention and the share of referred sign-ups, the stage that really holds you back may be hiding there.",
    "Sans chiffre pour la rétention à J30 et la part des inscrits recommandés, l'étape qui freine vraiment peut s'y cacher.",
    ["return"], "kept"),
  "diag.top": s(
    "The biggest loss in number is always at the top of the funnel; that is not what names the stage that holds you back.",
    "La plus grosse perte en nombre est toujours en haut du funnel ; ce n'est pas ce qui désigne l'étape qui freine.",
    ["return*"], "kept"),
  "diag.none": s(
    "No stage named: none of the six numbers that can name one has a target yet.",
    "Aucune étape désignée : aucun des six chiffres qui peuvent en désigner une n'a encore de cible.",
    ["progress-middle"], "changed", "(silence)"),
  "diag.addTargets": s("Add your targets", "Ajouter tes cibles", ["progress-middle"]),
  "peloton.title": s("Your 100 sign-ups", "Tes 100 inscrits", ["return*"], "changed", "(the peloton, untitled)"),
  "peloton.lead": s("~3,200 visitors in the month for 100 sign-ups · GA4 · August 2026", "~3 200 visiteurs du mois pour 100 inscrits · GA4 · août 2026", ["return*"], "kept"),
  "peloton.c1": s("Sign-ups", "Inscrits", ["return*"], "kept"),
  "peloton.c2": s("Activated", "Activés", ["return*"], "kept"),
  "peloton.c3": s("Active at day 30", "Actifs à J30", ["return*"], "kept"),
  "peloton.c4": s("Paying at day 30", "Payants à J30", ["return*"], "kept"),
  "peloton.s1": s("800 sign-ups in July 2026, brought to 100", "800 inscrits en juillet 2026, ramenés à 100", ["return*"], "kept"),
  "peloton.s2": s("Amplitude · July 2026", "Amplitude · juillet 2026", ["return*"], "kept"),
  "peloton.s3": s("not measured", "non mesuré", ["return*"], "kept"),
  "peloton.s3found": s("Product database · July 2026", "Base produit · juillet 2026", ["return-found"], "example"),
  "peloton.s4": s("estimated range · July 2026", "fourchette estimée · juillet 2026", ["return*"], "kept"),
  "peloton.s4found": s("Stripe · July 2026", "Stripe · juillet 2026", ["return-found"], "example"),
  "list.title": s("Your numbers", "Tes chiffres", ["return*", "progress-*"], "changed", "the five stage tabs and their panel"),
  "list.found": s("{found} of {n} found", "{found} sur {n} {found:trouvé|trouvés}", ["return*"], "changed", "found: 2/3"),
  "list.holds": s("Holds you back", "Freine ici", ["return*"], "kept"),
  "list.computed": s("Computed from yours ({n})", "Calculés à partir des tiens ({n})", ["return*"]),
  "list.link": s("The link between the two", "La liaison entre les deux", ["return-hybrid"], "changed", "The link, if you sell both ways"),
  "whatif.title": s("What if?", "Et si ?", ["whatif", "return*"], "kept"),
  "whatif.untouched": s(
    "Move the lever of the stage that holds you back, and see what follows.",
    "Bouge le levier de l'étape qui freine, et vois ce qui suit.",
    ["whatif", "return"]),
  "whatif.untouchedNoStage": s(
    "Move one lever and see what follows. With a target, the lever of the stage that holds you back comes first.",
    "Bouge un levier et vois ce qui suit. Avec une cible, le levier de l'étape qui freine passe en premier.",
    ["progress-middle"]),
  "whatif.moved": s("If {lever} went from {from} to {to}", "Si {lever} passait de {from} à {to}", ["whatif-moved"]),
  "whatif.lever": s("{lever}, today {value}", "{lever}, aujourd'hui {value}", ["whatif", "whatif-moved"], "changed", "the lever's slider label"),
  "whatif.mrr12": s("MRR in 12 months", "MRR dans 12 mois", ["whatif", "whatif-moved"], "kept"),
  "whatif.newPaying": s("New paying customers a month", "Nouveaux payants par mois", ["whatif", "whatif-moved"], "changed", "new MRR"),
  "whatif.today": s("today {value}", "aujourd'hui {value}", ["whatif", "whatif-moved"]),
  "whatif.all": s("All 8 levers and what the calculation assumes →", "Les 8 leviers et ce que le calcul suppose →", ["whatif", "whatif-moved"], "changed", "What if? (folded panel) / What the calculation assumes"),
  "whatif.reset": s("Back to today", "Revenir à aujourd'hui", ["whatif-moved"]),
  "tour.title": s("The Tour and your numbers", "Le Tour et tes chiffres", ["return*"], "changed", "What you declared in the Tour × what you find here"),
  "tour.invite": s("Take the Tour on this device to see what you declared beside what you measure.", "Fais le Tour sur cet appareil pour voir ce que tu as déclaré à côté de ce que tu mesures.", ["return*"], "kept"),
  "tour.go": s("Take the Tour →", "Faire le Tour →", ["return*"], "kept"),
  "slides.quiet": s("Prepare your slides with what you have →", "Préparer tes slides avec ce que tu as →", ["return", "return-month"]),

  // ── To ask for ─────────────────────────────────────────────────────────
  "asks.title": s("To ask for ({n})", "À demander ({n})", ["asks"], "changed", "To go and get (5)"),
  "asks.lead": s("Send the requests today, fill in the rest while waiting.", "Envoie les demandes aujourd'hui, remplis le reste en attendant les réponses.", ["asks"], "kept"),
  "asks.role.finance": s("Finance", "Finance", ["asks", "number-ask", "return"], "kept"),
  "asks.role.data": s("Data", "Data", ["asks", "return"], "kept"),
  "asks.role.cs": s("Customer success", "Succès client", ["asks"], "kept"),
  "asks.numbers": s("{list}", "{list}", ["asks"], "kept"),
  "asks.text.data": s(
    "Hi, for our growth review I need two figures for July 2026's sign-ups: the share who paid within 30 days, and how many sign-ups each account brought by invitation. Could you send them? Thanks.",
    "Bonjour, pour notre revue de growth j'ai besoin de deux chiffres sur les inscrits de juillet 2026 : la part qui a payé sous 30 jours, et combien d'inscrits chaque compte a amenés par invitation. Peux-tu me les envoyer ? Merci.",
    ["asks"], "example"),
  "asks.text.cs": s(
    "Hi, for our growth review: what was the main reason customers gave for leaving in August 2026? One line is enough. Thanks.",
    "Bonjour, pour notre revue de growth : quelle est la principale raison donnée par les clients partis en août 2026 ? Une ligne suffit. Merci.",
    ["asks"], "example"),
  "asks.text.finance": s(
    "Hi, for our growth review I need, for August 2026: the acquisition spend and the new paying customers (for the CAC), and the gross margin. Could you send me these figures? Thanks.",
    "Bonjour, pour notre revue de growth j'ai besoin, pour août 2026 : des dépenses d'acquisition et des nouveaux clients payants (pour le CAC), et de la marge brute. Peux-tu m'envoyer ces chiffres ? Merci.",
    ["asks"], "example"),
  "asks.done": s("Sent, next number →", "C'est envoyé, chiffre suivant →", ["asks"]),

  // ── The hybrid ─────────────────────────────────────────────────────────
  "total.eyebrow": s("Two engines, one total", "Deux moteurs, un total", ["return-hybrid"], "kept"),
  "total.title": s(
    "€119,600 of MRR in August 2026, from two engines.",
    "119 600 € de MRR en août 2026, venus de deux moteurs.",
    ["return-hybrid"], "example"),
  "total.ss": s("Self-serve MRR", "MRR libre-service", ["return-hybrid"], "kept"),
  "total.sa": s("Sales-assisted MRR", "MRR assisté", ["return-hybrid"], "kept"),
  "total.sum": s("Total MRR", "MRR total", ["return-hybrid"], "kept"),
  "total.link": s("{n} opportunities came from self-serve in August 2026", "{n} opportunités sont venues du libre-service en août 2026", ["return-hybrid"], "changed", "Opportunities from self-serve (a row)"),
  "total.shown": s("Engine shown", "Moteur affiché", ["return-hybrid"], "changed", "Motion shown: stages and what-ifs"),
  "total.sample": s(
    "Sales-assisted counts are small (26 customers): one deal moves a rate by several points.",
    "Les comptes de l'assisté sont petits (26 clients) : un contrat déplace un taux de plusieurs points.",
    ["return-hybrid"], "kept"),
  "rename.relays": s("the steps of a deal", "les relais", ["return-hybrid (sales-assisted shown)"], "changed", "relays"),
  "total.mrr12": s("Total MRR in 12 months", "MRR total dans 12 mois", ["return-hybrid"], "kept"),

  // ── Settings ───────────────────────────────────────────────────────────
  "settings.title": s("Settings", "Réglages", ["settings"], "kept"),
  "settings.lead": s(
    "Everything here has a default. Change it when a number asks for it.",
    "Tout ici a une valeur par défaut. Change-la quand un chiffre le demande.",
    ["settings"]),
  "settings.month": s("The month", "Le mois", ["settings"], "kept"),
  "settings.flows": s("Figures of", "Chiffres de", ["settings"], "changed", "Flows month"),
  "settings.flowsHint": s(
    "Flows (sign-ups, visitors, MRR) are read on this month; activation and payment on the month before's sign-ups, so they have had time to happen.",
    "Les flux (inscrits, visiteurs, MRR) se lisent sur ce mois ; l'activation et le paiement sur les inscrits du mois d'avant, pour leur laisser le temps d'arriver.",
    ["settings"], "kept"),
  "settings.activation": s("Activation counts within", "L'activation compte sous", ["settings"], "kept"),
  "settings.windowHint": s(
    "The window: how many days a sign-up has for it to count.",
    "La fenêtre : le nombre de jours qu'a un inscrit pour que ça compte.",
    ["settings"]),
  "settings.payment": s("Payment counts within", "Le paiement compte sous", ["settings"], "kept"),
  "settings.days": s("{n} days", "{n} jours", ["settings"], "kept"),
  "settings.windowWarn": s(
    "Changing this window sends Activation rate back to “to do”: its figure was counted within 7 days.",
    "Changer cette fenêtre renvoie Taux d'activation à « à faire » : son chiffre était compté sous 7 jours.",
    ["settings"], "changed", "(said only on saving)"),
  "settings.targets": s("Targets", "Cibles", ["settings"], "changed", "Your current targets (step 1)"),
  "settings.targetsLead": s(
    "The same boxes as on each number's screen, all in one place, for a team that keeps its targets in a sheet.",
    "Les mêmes cases que sur l'écran de chaque chiffre, toutes au même endroit, pour une équipe qui garde ses cibles dans un tableau.",
    ["settings"]),
  "settings.shared": s("Shared counts", "Nombres partagés", ["settings"], "changed", "Your base (step)"),
  "settings.sharedHint": s("Used by {list}.", "Utilisé par {list}.", ["settings"]),
  "settings.currency": s("Currency", "Devise", ["settings"], "kept"),
  "settings.name": s("Company name, on the slides", "Nom de l'entreprise, sur les slides", ["settings"], "kept"),
  "settings.tools": s("Your tools", "Tes outils", ["settings"], "kept"),
  "settings.toolsHint": s("They come first in “Where to find it”.", "Ils passent en premier dans « Où le trouver ».", ["settings"], "changed", "(optional, folded in the setup)"),
  "settings.company": s("Company type", "Type d'entreprise", ["settings"], "kept"),
  "settings.later": s("later", "plus tard", ["settings"], "kept"),
  "settings.tourLink": s("Link the Tour taken on this device", "Lier le Tour fait sur cet appareil", ["settings"], "kept"),
  "settings.save": s("Save settings", "Enregistrer les réglages", ["settings"]),
  "settings.cancel": s("Cancel", "Annuler", ["settings"], "kept"),

  // ── The board's own labels (not product copy) ─────────────────────────
  "board.today": s("Today — 06, production build", "Aujourd'hui — 06, build de production", ["compare"], "board"),
  "board.proposed": s("Proposed — the same number, the same moment", "Proposé — le même chiffre, au même moment", ["compare"], "board"),
};

export const translator = (lang) => (key, vars = {}) => {
  const entry = COPY[key];
  if (!entry) return `‹${key}›`;
  let text = entry[lang];
  for (const [k, v] of Object.entries(vars)) {
    // {k:one|other}: the word that agrees with the count (0 and 1 singular, as in French).
    text = text.replace(new RegExp(`\\{${k}:([^|}]*)\\|([^}]*)\\}`, "g"), (_, one, other) => (Number(v) <= 1 ? one : other));
    text = text.split(`{${k}}`).join(String(v));
  }
  return lang === "fr" ? frTypo(text) : text;
};
