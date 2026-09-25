import { NightSurface, PhoneMock } from "tour-de-growth";

/*
 * Flixo's cancellation screen, drawn: what the cards in production do to the
 * way out. It is someone else's product, so it is white with its own --app-*
 * tokens and does not follow the night around it. The game computes the list
 * of elements (`phoneView`); the component only draws them, top to bottom.
 *
 * One rule holds even here: the discreet "request cancellation" link is
 * discreet by its size, place and grey (4.74:1), never by being unreadable.
 * Copy: content/game/retention.ts.
 */

const EN = {
  caption: "The cancellation screen as subscribers see it",
  appName: "Flixo",
  time: "21:04",
  streakPush: "Your 12-night streak ends tonight.",
  crumbs: "Account › My subscription",
  crumbsBuried: "Settings › Account › Manage my subscription › Other options › Help",
  plan: "Premium",
  planAnnual: "Premium annual",
  price: "€12.99 a month · next charge on the 3rd",
  priceAnnual: "€129.90 a year · can be cancelled online",
  social: "Léa, Karim and 2 friends are staying without you.",
  reminder: "Reminder sent three days before each charge.",
  number: "09 70 00 00 00",
  call: "To cancel, call {number} Monday to Friday, 9 am to noon. Average wait: 23 min.",
  pauseButton: "Pause for 3 months",
  cancelLink: "or cancel",
  cancelLinkBuried: "request cancellation",
  cancelButton: "Cancel my subscription",
  pauseOffer: "Fancy a break instead? 3 months with no charge, your settings kept.",
  pauseAccept: "Pause",
  pauseDecline: "No, cancel",
  cascadeOffers: ["Wait! 3 months at −50%", "You'll lose your 214 saved films", "Last chance: 1 month free"],
  stay: "I'll stay",
  decline: "No thanks",
  declineShamed: "No thanks, I'd rather be bored",
  confirm: "Are you sure?",
  survey: "Why are you leaving? Optional.",
  surveyAnswers: ["Too expensive", "Nothing to watch", "Other"],
  notice: "Your cancellation will take effect in 30 days. One last charge of €12.99 will be made.",
  threeClicks: "Cancellation effective today. No charge on the 3rd. Access kept until the end of the month.",
};

const box = { padding: 20, maxWidth: 380 } as const;

/** The year starts here: the plan and one plain "Cancel my subscription" button. Nothing in production yet. */
export const Start = () => (
  <NightSurface as="div" style={box}>
    <PhoneMock
      labels={EN}
      items={[
        { kind: "appBar" },
        { kind: "crumbs", buried: false },
        { kind: "plan", annual: false },
        { kind: "cancel", variant: "button", buried: false },
      ]}
    />
  </NightSurface>
);

/** Honest cards in production: a reminder before each charge, a pause offered once, the exit survey, three clicks. */
export const Honest = () => (
  <NightSurface as="div" style={box}>
    <PhoneMock
      labels={EN}
      items={[
        { kind: "appBar" },
        { kind: "crumbs", buried: false },
        { kind: "plan", annual: true },
        { kind: "reminder" },
        { kind: "cancel", variant: "button", buried: false },
        { kind: "pauseOffer" },
        { kind: "exitSurvey" },
        { kind: "effectiveToday" },
      ]}
    />
  </NightSurface>
);

/**
 * The dark side, stacked: a streak push, the link buried five levels deep,
 * fake friends, the pause pushed up front, three offers with a shaming
 * decline, and a thirty-day notice with one last charge.
 */
export const Dark = () => (
  <NightSurface as="div" style={box}>
    <PhoneMock
      labels={EN}
      items={[
        { kind: "appBar" },
        { kind: "streakPush" },
        { kind: "crumbs", buried: true },
        { kind: "plan", annual: false },
        { kind: "socialProof" },
        { kind: "cancel", variant: "pauseFirst", buried: true },
        { kind: "retentionOffers", shamed: true },
        { kind: "noticePeriod" },
      ]}
    />
  </NightSurface>
);

/** The phone wins over everything: once leaving takes a call, there is no button left to style. In French. */
export const PhoneCallFrench = () => (
  <NightSurface as="div" style={box}>
    <PhoneMock
      labels={{
        ...EN,
        caption: "L'écran de résiliation tel que les abonnés le voient",
        crumbs: "Compte › Mon abonnement",
        crumbsBuried: "Paramètres › Compte › Gérer mon abonnement › Autres options › Aide",
        price: "12,99 € par mois · prochain prélèvement le 3",
        call: "Pour résilier, appelez le {number} du lundi au vendredi, de 9 h à 12 h. Temps d'attente moyen : 23 min.",
        social: "Léa, Karim et 2 amis continuent sans vous.",
      }}
      items={[
        { kind: "appBar" },
        { kind: "crumbs", buried: true },
        { kind: "plan", annual: false },
        { kind: "socialProof" },
        { kind: "cancel", variant: "phone", buried: true },
      ]}
    />
  </NightSurface>
);
