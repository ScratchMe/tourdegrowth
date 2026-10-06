import { FitPhone, NightSurface } from "tour-de-growth";

/*
 * Gainix's app, drawn from the plans screen to the gem shop and the account's
 * renewal line — the revenue level's phone. It is someone else's product, so
 * it is white with the --app-* tokens and its own brand teal (--fit-brand,
 * 5.19:1 on white, and white on it), and does not follow the night around it.
 * Same frame as the other levels' phones (`PhoneMock`, `ShopPhone`,
 * `PlannerPhone`, `SplitPhone`). The game computes the list of elements
 * (`fitPhoneView` in lib/game/fit-phone.ts); the component only draws them,
 * top to bottom, as text — never a control, and nothing in the alert colours:
 * the pill under the phone carries the problem.
 *
 * Every state below is one the game actually reaches, dumped from
 * `fitPhoneView` for a real set of cards. Copy: content/game/revenue.ts.
 */

const EN = {
  caption: "The subscription and the shop as users see them",
  appName: "Gainix",
  time: "07:02",
  offerBase: "7-day free trial, then €7.99 a month",
  offerTrial: "14 days free · card required",
  offerTrialSmall: "then €59.99 a year",
  fullPrice: "Yearly: €59.99 a year, that's €5.00 a month",
  plansTitle: "Plans",
  monthly: "Monthly: €7.99 a month",
  monthlyPersonal: "Monthly: €8.49 a month",
  addon: "\u2611 Coach+ · €2.99 a month",
  trialReminder: "Reminder sent 3 days before the trial ends",
  programme: "8-week programme · €9.99",
  programmeSmall: "then €9.99 a month, cancel at any time",
  coaching: "Coach programmes · €14.99 each",
  downgrade: "Training less? Switch to the Essential plan at €3.99",
  shopTitle: "Gem shop",
  shopItem: "Marathon outfit · 800 gems",
  packsRound: "Packs: 400 · 800 · 1,600 gems",
  packsOdd: "Packs: 500 · 1,200 · 2,600 gems",
  euros: "that's €7.99 for the outfit",
  chest: "Sprint chest · 300 gems · random contents",
  express: "One-tap buying: touching an outfit buys it",
  renewalPlain: "Yearly subscription · next renewal on 3 March",
  renewalSilent: "Renewed automatically on 3 March · €59.99 charged",
  renewalNotice: "Email of 3 February: renews on 3 March, deadline to stop on 2 March",
  checkoutQuestion: "Stopped at checkout? Tell us what held you back. Optional.",
  checkoutAnswers: ["Too expensive for what it is", "Try a programme first", "Other"],
};

const FR = {
  caption: "L'abonnement et la boutique tels que les utilisateurs les voient",
  appName: "Gainix",
  time: "07:02",
  offerBase: "Essai gratuit 7 jours, puis 7,99\u00a0€ par mois",
  offerTrial: "14 jours gratuits · carte bancaire demandée",
  offerTrialSmall: "puis 59,99\u00a0€ par an",
  fullPrice: "Annuel\u00a0: 59,99\u00a0€ par an, soit 5,00\u00a0€ par mois",
  plansTitle: "Les formules",
  monthly: "Mensuel\u00a0: 7,99\u00a0€ par mois",
  monthlyPersonal: "Mensuel\u00a0: 8,49\u00a0€ par mois",
  addon: "\u2611 Coach+ · 2,99\u00a0€ par mois",
  trialReminder: "Rappel envoyé 3 jours avant la fin de l'essai",
  programme: "Programme 8 semaines · 9,99\u00a0€",
  programmeSmall: "puis 9,99\u00a0€ par mois, sans engagement",
  coaching: "Programmes de coachs · 14,99\u00a0€ l'unité",
  downgrade: "Tu t'entraînes moins\u00a0? Passe au plan Essentiel à 3,99\u00a0€",
  shopTitle: "Boutique de gemmes",
  shopItem: "Tenue Marathon · 800 gemmes",
  packsRound: "Packs\u00a0: 400 · 800 · 1\u00a0600 gemmes",
  packsOdd: "Packs\u00a0: 500 · 1\u00a0200 · 2\u00a0600 gemmes",
  euros: "soit 7,99\u00a0€ la tenue",
  chest: "Coffre Sprint · 300 gemmes · contenu au hasard",
  express: "Achat en un appui\u00a0: toucher une tenue l'achète",
  renewalPlain: "Abonnement annuel · prochaine échéance le 3 mars",
  renewalSilent: "Renouvelé automatiquement le 3 mars · 59,99\u00a0€ prélevés",
  renewalNotice: "E-mail du 3 février\u00a0: renouvellement le 3 mars, date limite pour arrêter le 2 mars",
  checkoutQuestion: "Paiement interrompu\u00a0? Dis-nous ce qui t'a arrêté. Facultatif.",
  checkoutAnswers: ["Trop cher pour ce que c'est", "Essayer un programme d'abord", "Autre"],
};

const box = { padding: 20, maxWidth: 380 } as const;

/** The year starts here: no card in production — the base offer, the plans, the shop with its round packs, the plain renewal line. */
export const Start = () => (
  <NightSurface as="div" style={box}>
    <FitPhone
      labels={EN}
      items={[
        { kind: "appBar" },
        { kind: "offer", trial: false, fullPrice: false },
        { kind: "plans", personal: false, addon: false },
        { kind: "shop", odd: false, euros: false },
        { kind: "renewal", style: "plain" },
      ]}
    />
  </NightSurface>
);

/**
 * An honest year (path A): the yearly total shown first, the reminder before the
 * trial ends, the coaches' programmes, the cheaper plan, the euro price of the
 * outfit, and the question at checkout.
 */
export const Honest = () => (
  <NightSurface as="div" style={box}>
    <FitPhone
      labels={EN}
      items={[
        { kind: "appBar" },
        { kind: "offer", trial: false, fullPrice: true },
        { kind: "plans", personal: false, addon: false },
        { kind: "trialReminder" },
        { kind: "coaching" },
        { kind: "downgrade" },
        { kind: "shop", odd: false, euros: true },
        { kind: "renewal", style: "plain" },
        { kind: "checkoutQuestion" },
      ]}
    />
  </NightSurface>
);

/** The renewal announced a month ahead, with the deadline to stop it (`renewmail`). */
export const Renewal = () => (
  <NightSurface as="div" style={box}>
    <FitPhone
      labels={EN}
      items={[
        { kind: "appBar" },
        { kind: "offer", trial: false, fullPrice: false },
        { kind: "plans", personal: false, addon: false },
        { kind: "trialReminder" },
        { kind: "shop", odd: false, euros: false },
        { kind: "renewal", style: "notice" },
      ]}
    />
  </NightSurface>
);

/**
 * The dark side at the third-quarter desk (path C): the 14-day trial with the
 * card, the add-on ticked under the plan, the programme with its small print,
 * the chest, the one-tap purchase and the silent renewal.
 */
export const Dark = () => (
  <NightSurface as="div" style={box}>
    <FitPhone
      labels={EN}
      items={[
        { kind: "appBar" },
        { kind: "offer", trial: true, fullPrice: false },
        { kind: "plans", personal: false, addon: true },
        { kind: "programme" },
        { kind: "shop", odd: false, euros: false },
        { kind: "chest" },
        { kind: "express" },
        { kind: "renewal", style: "silent" },
      ]}
    />
  </NightSurface>
);

/** Every dark card at once, in French — the longest the phone gets: the personalised price, the odd packs, the chest, the one-tap purchase. */
export const DarkFrench = () => (
  <NightSurface as="div" style={box}>
    <FitPhone
      labels={FR}
      items={[
        { kind: "appBar" },
        { kind: "offer", trial: true, fullPrice: false },
        { kind: "plans", personal: true, addon: true },
        { kind: "programme" },
        { kind: "shop", odd: true, euros: false },
        { kind: "chest" },
        { kind: "express" },
        { kind: "renewal", style: "silent" },
      ]}
    />
  </NightSurface>
);
