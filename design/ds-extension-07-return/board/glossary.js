// The glossary entries the engine's screens point at with GlossaryTerm's "?".
// Five are proposed (COPY.md, "Glossary"): the words brief 07 lists as costly,
// taught where they are first needed instead of on the first screens.
// The board's GlossaryTerm stand-in reads them; in the app they join the
// existing glossary content.

export const GLOSSARY = {
  cohort: {
    en: {
      term: "cohort",
      definition:
        "The sign-ups of one month, followed over the days after. Activation and payment are read on last month's cohort, so they have had time to happen.",
    },
    fr: {
      term: "cohorte",
      definition:
        "Les inscrits d'un même mois, suivis sur les jours qui suivent. L'activation et le paiement se lisent sur la cohorte du mois précédent, pour leur laisser le temps d'arriver.",
    },
  },
  target: {
    en: {
      term: "target",
      definition:
        "The figure your team set itself for this number. Only a target can name the stage that holds the engine back.",
    },
    fr: {
      term: "cible",
      definition:
        "Le chiffre que ton équipe s'est fixé pour ce chiffre. Seule une cible peut désigner l'étape qui freine le moteur.",
    },
  },
  reference: {
    en: {
      term: "reference",
      definition:
        "A range published for comparable companies. It situates your figure; it never names a stage.",
    },
    fr: {
      term: "repère",
      definition:
        "Une fourchette publiée pour des entreprises comparables. Elle situe ton chiffre ; elle ne désigne jamais d'étape.",
    },
  },
  window: {
    en: {
      term: "window",
      definition:
        "How many days a sign-up has for an action to count: activate within 7 days, pay within 30. Change it in Settings.",
    },
    fr: {
      term: "fenêtre",
      definition:
        "Le nombre de jours qu'a un inscrit pour qu'une action compte : s'activer en 7 jours, payer en 30. Elle se règle dans Réglages.",
    },
  },
  sharedCount: {
    en: {
      term: "shared count",
      definition:
        "A count several numbers use, like the month's sign-ups. Typed once: change it in one number, it changes in all of them.",
    },
    fr: {
      term: "nombre partagé",
      definition:
        "Un nombre que plusieurs chiffres utilisent, comme les inscrits du mois. Saisi une fois : le modifier dans un chiffre le modifie dans tous.",
    },
  },
};
