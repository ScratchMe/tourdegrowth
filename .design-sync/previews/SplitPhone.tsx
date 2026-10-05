import { NightSurface, SplitPhone } from "tour-de-growth";

/*
 * Partix's app, drawn as the invitation goes: Thomas's screen when he invites,
 * what Léa receives, and the promise at the foot — the referral level's phone.
 * It is someone else's product, so it is white with the --app-* tokens and
 * its own brand orange (--split-brand, 5.29:1 on white, and white on it), and
 * does not follow the night around it. Same frame as the other levels' phones
 * (`PhoneMock`, `ShopPhone`, `PlannerPhone`). The game computes the list of
 * elements (`splitPhoneView` in lib/game/split-phone.ts); the component only
 * draws them, top to bottom, as text — never a control.
 *
 * Every state below is one the game actually reaches, dumped from
 * `splitPhoneView` for a real set of cards. Copy: content/game/referral.ts.
 */

const EN = {
  caption: "The invitation as Thomas sends it and Léa receives it",
  appName: "Partix",
  time: "19:30",
  group: "Weekend in Biarritz · 6 people · €1,284",
  continueExpense: "Expense added · Restaurant · €186",
  continueButton: "Continue",
  continueFine: "inviting the group and 12 suggested contacts",
  continueSkip: "skip",
  bonusLoud: "€10 for you, €10 for your friend",
  bonusLoudFine: "*see conditions",
  bonusClear: "€5 each on their first shared expense",
  bonusClearTerms: "Once per friend · paid within 48 hours",
  locked: "PDF export and reminders: invite 3 friends to unlock them (0/3)",
  inviteTitle: "Invite friends",
  inviteBase: "Pick from your contacts",
  invitePreselected: "214 contacts selected",
  inviteChosen: "2 contacts picked · editable message",
  groupLink: "Or share the group link",
  autoSent: "Invitations sent to your 214 contacts · 2 follow-ups scheduled",
  reviewQuestion: "Enjoying Partix?",
  reviewYes: "Yes → rate the app in the store",
  reviewNo: "Not really → write to us",
  recap: "Weekend recap, readable without the app: Léa owes Thomas €46",
  guestDivider: "What Léa receives",
  guestMessage: "Thomas is inviting you to the \"Weekend in Biarritz\" group on Partix.",
  guestMessagePersonalised: "Thomas is waiting for you on Partix! 3 of your friends are already there.",
  guestShadow: "4 of your contacts use Partix. Join them.",
  guestPage: "See the group and your share without installing the app",
  guestQuestion: "Not signed up yet? What held you back? Optional.",
  guestAnswers: ["No need for one more app", "See the group first", "Other"],
  noBook: "Partix works without your contacts.",
  noBookNumbers: "Non-users' numbers aren't kept.",
};

const FR = {
  caption: "L'invitation telle que Thomas l'envoie et que Léa la reçoit",
  appName: "Partix",
  time: "19:30",
  group: "Week-end à Biarritz · 6 personnes · 1\u00a0284\u00a0€",
  continueExpense: "Dépense ajoutée · Restaurant · 186\u00a0€",
  continueButton: "Continuer",
  continueFine: "en invitant le groupe et 12 contacts suggérés",
  continueSkip: "passer",
  bonusLoud: "10\u00a0€ pour toi, 10\u00a0€ pour ton ami",
  bonusLoudFine: "*voir conditions",
  bonusClear: "5\u00a0€ chacun dès sa première dépense partagée",
  bonusClearTerms: "Une fois par ami · versé sous 48 h",
  locked: "Export PDF et rappels\u00a0: invite 3 amis pour les débloquer (0/3)",
  inviteTitle: "Inviter des amis",
  inviteBase: "Choisir dans tes contacts",
  invitePreselected: "214 contacts sélectionnés",
  inviteChosen: "2 contacts choisis · message modifiable",
  groupLink: "Ou partager le lien du groupe",
  autoSent: "Invitations envoyées à tes 214 contacts · 2 relances prévues",
  reviewQuestion: "Tu aimes Partix\u00a0?",
  reviewYes: "Oui → noter l'appli dans le store",
  reviewNo: "Pas vraiment → nous écrire",
  recap: "Récap du week-end, lisible sans l'appli\u00a0: Léa doit 46\u00a0€ à Thomas",
  guestDivider: "Ce que reçoit Léa",
  guestMessage: "Thomas t'invite dans le groupe «\u00a0Week-end à Biarritz\u00a0» sur Partix.",
  guestMessagePersonalised: "Thomas t'attend sur Partix\u00a0! 3 de tes amis y sont déjà.",
  guestShadow: "4 de tes contacts utilisent Partix. Rejoins-les.",
  guestPage: "Voir le groupe et ta part sans installer l'appli",
  guestQuestion: "Pas encore inscrite\u00a0? Qu'est-ce qui t'a retenue\u00a0? Facultatif.",
  guestAnswers: ["Pas besoin d'une appli de plus", "Voir le groupe d'abord", "Autre"],
  noBook: "Partix marche sans tes contacts.",
  noBookNumbers: "Les numéros des non-inscrits ne sont pas gardés.",
};

const box = { padding: 20, maxWidth: 380 } as const;

/** The year starts here: no card in production — the invitation screen as it is, and Léa's plain message. */
export const Start = () => (
  <NightSurface as="div" style={box}>
    <SplitPhone
      labels={EN}
      items={[
        { kind: "appBar" },
        { kind: "group" },
        { kind: "invite", preselected: false, chosen: false, groupLink: false },
        { kind: "guestDivider" },
        { kind: "guestMessage", personalised: false },
      ]}
    />
  </NightSurface>
);

/**
 * An honest year (path A): the offer with its terms, the group link and the
 * contacts picked one by one, the readable recap, the group without
 * installing, and the question to guests who do not join.
 */
export const Honest = () => (
  <NightSurface as="div" style={box}>
    <SplitPhone
      labels={EN}
      items={[
        { kind: "appBar" },
        { kind: "group" },
        { kind: "bonus", style: "clear" },
        { kind: "invite", preselected: false, chosen: true, groupLink: true },
        { kind: "recap" },
        { kind: "guestDivider" },
        { kind: "guestMessage", personalised: false },
        { kind: "guestPage" },
        { kind: "guestQuestion" },
      ]}
    />
  </NightSurface>
);

/**
 * The dark side at the third-quarter desk (path C): every contact ticked, the
 * big « Continue » button, the offer shouted, what went out on its own, Léa's
 * message in Thomas's name, and what the app already knows about her.
 */
export const Dark = () => (
  <NightSurface as="div" style={box}>
    <SplitPhone
      labels={EN}
      items={[
        { kind: "appBar" },
        { kind: "group" },
        { kind: "continue" },
        { kind: "bonus", style: "loud" },
        { kind: "invite", preselected: true, chosen: false, groupLink: false },
        { kind: "autoSent" },
        { kind: "guestDivider" },
        { kind: "guestMessage", personalised: true },
        { kind: "guestShadow" },
      ]}
    />
  </NightSurface>
);

/** The promise at the foot: no address book needed — and, with no `shadow`, that the numbers are not kept. */
export const NoAddressBook = () => (
  <NightSurface as="div" style={box}>
    <SplitPhone
      labels={EN}
      items={[
        { kind: "appBar" },
        { kind: "group" },
        { kind: "invite", preselected: false, chosen: true, groupLink: false },
        { kind: "guestDivider" },
        { kind: "guestMessage", personalised: false },
        { kind: "noBook", numbers: true },
      ]}
    />
  </NightSurface>
);

/** Every dark card at once, in French — the longest the phone gets: the padlock, the review prompt, the big button. */
export const DarkFrench = () => (
  <NightSurface as="div" style={box}>
    <SplitPhone
      labels={FR}
      items={[
        { kind: "appBar" },
        { kind: "group" },
        { kind: "continue" },
        { kind: "bonus", style: "loud" },
        { kind: "locked" },
        { kind: "invite", preselected: true, chosen: false, groupLink: false },
        { kind: "autoSent" },
        { kind: "review" },
        { kind: "guestDivider" },
        { kind: "guestMessage", personalised: true },
        { kind: "guestShadow" },
      ]}
    />
  </NightSurface>
);
