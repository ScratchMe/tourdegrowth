import { NightSurface, PlannerPhone } from "tour-de-growth";

/*
 * Quandi's app, drawn as a freelancer arrives on it — the activation level's
 * phone: the permissions sheet, the cookie banner, the sign-up form, the
 * first screen, what follows by email and push. It is someone else's product,
 * so it is white with the --app-* tokens and its own brand violet
 * (--planner-brand, 5.82:1 on white, and white on it), and does not follow the
 * night around it. Same frame as the other levels' phones (`PhoneMock`,
 * `ShopPhone`). The game computes the list of elements (`plannerPhoneView` in
 * lib/game/planner-phone.ts); the component only draws them, top to bottom, as
 * text — never a control.
 *
 * Every state below is one the game actually reaches, dumped from
 * `plannerPhoneView` for a real path. Copy: content/game/activation.ts.
 */

const EN = {
  caption: "Arriving on the app as a freelancer sees it",
  appName: "Quandi",
  time: "08:12",
  permissions: "To get started, Quandi needs your contacts, your calendar, your notifications and your location.",
  permissionsAllow: "Allow",
  bannerText: "Audience measurement cookies",
  bannerTextNudged: "We use cookies to improve your experience.",
  bannerAccept: "Accept",
  bannerContinue: "Continue without accepting",
  bannerAcceptAll: "Accept all",
  bannerRejectAll: "Reject all",
  bannerCustomise: "Customise",
  demo: "Try it without an account: a sample schedule to edit",
  signupTitle: "Create my account",
  fields: "Email · Password · Trade",
  fieldsMinimal: "Email · sign-in link sent by email",
  phoneRequired: "Mobile (required) · to secure your account",
  phoneOptional: "Mobile (optional)",
  prechecked: "☑ Receive our tips and offers",
  partners: "By creating my account, I agree that my details may be passed on to our partners.",
  submit: "Create my account",
  analysis: "We're preparing your tailored schedule… 64%",
  homeEmpty: "Your schedule is empty.",
  homeCreate: "Create a first slot",
  checklist: "First steps · 1 Add a client · 2 Create a slot · 3 Publish",
  checklistClose: "Close",
  importer: "Bring over your old calendar",
  tour: "Step 1 of 7 · Create your first slot · Next",
  push: "You haven't opened our email yet. It has your schedule in it.",
  welcome: "Tomorrow's email: your schedule in progress and a template for your trade",
  calls: "Twenty minutes on the phone? Tell us what stopped you. Optional.",
  callsAnswers: ["Didn't know where to start", "A calendar to bring over", "Other"],
};

const FR = {
  caption: "L'arrivée sur l'appli telle qu'un indépendant la voit",
  appName: "Quandi",
  time: "08:12",
  permissions: "Pour bien démarrer, Quandi a besoin de vos contacts, de votre agenda, de vos notifications et de votre position.",
  permissionsAllow: "Autoriser",
  bannerText: "Cookies de mesure d'audience",
  bannerTextNudged: "Nous utilisons des cookies pour améliorer votre expérience.",
  bannerAccept: "Accepter",
  bannerContinue: "Continuer sans accepter",
  bannerAcceptAll: "Tout accepter",
  bannerRejectAll: "Tout refuser",
  bannerCustomise: "Personnaliser",
  demo: "Essayer sans compte\u00a0: un planning d'exemple à modifier",
  signupTitle: "Créer mon compte",
  fields: "E-mail · Mot de passe · Métier",
  fieldsMinimal: "E-mail · lien de connexion envoyé par e-mail",
  phoneRequired: "Mobile (obligatoire) · pour sécuriser votre compte",
  phoneOptional: "Mobile (facultatif)",
  prechecked: "☑ Recevoir nos conseils et offres",
  partners: "En créant mon compte, j'accepte que mes coordonnées soient transmises à nos partenaires.",
  submit: "Créer mon compte",
  analysis: "Nous préparons votre planning sur mesure… 64\u00a0%",
  homeEmpty: "Votre planning est vide.",
  homeCreate: "Créer un premier créneau",
  checklist: "Premiers pas · 1 Ajouter un client · 2 Créer un créneau · 3 Publier",
  checklistClose: "Fermer",
  importer: "Reprendre votre ancien agenda",
  tour: "Étape 1 sur 7 · Créez votre premier créneau · Suivant",
  push: "Vous n'avez pas encore ouvert notre e-mail. Il contient votre planning.",
  welcome: "E-mail de demain\u00a0: votre planning en cours et un modèle pour votre métier",
  calls: "Vingt minutes au téléphone\u00a0? Dites-nous ce qui vous a arrêté. Facultatif.",
  callsAnswers: ["Pas su par où commencer", "Un agenda à reprendre", "Autre"],
};

const box = { padding: 20, maxWidth: 380 } as const;

/** The year starts here: the plain banner, the sign-up as it is, an empty first screen. */
export const Start = () => (
  <NightSurface as="div" style={box}>
    <PlannerPhone
      labels={EN}
      items={[
        { kind: "appBar" },
        { kind: "banner", style: "plain" },
        { kind: "signup", minimal: false, phone: "none", prechecked: false, partners: false },
        { kind: "home", checklist: false, importer: false, tour: false },
      ]}
    />
  </NightSurface>
);

/**
 * An honest year (path A): the refusal as easy as the acceptance, a sample
 * schedule before any account, the checklist and the import on the first
 * screen, tomorrow's email, and the offer of a call.
 */
export const Honest = () => (
  <NightSurface as="div" style={box}>
    <PlannerPhone
      labels={EN}
      items={[
        { kind: "appBar" },
        { kind: "banner", style: "equal" },
        { kind: "demo" },
        { kind: "signup", minimal: false, phone: "none", prechecked: false, partners: false },
        { kind: "home", checklist: true, importer: true, tour: false },
        { kind: "welcome" },
        { kind: "calls" },
      ]}
    />
  </NightSurface>
);

/**
 * The dark side at the third-quarter desk (path C): one sheet asking for
 * everything, the banner with « Accept all » as the button and the refusal
 * further in, the number required, the box ticked in advance, the partners
 * line under the button, and the push that gives the tracking away.
 */
export const Dark = () => (
  <NightSurface as="div" style={box}>
    <PlannerPhone
      labels={EN}
      items={[
        { kind: "appBar" },
        { kind: "permissions" },
        { kind: "banner", style: "nudged" },
        { kind: "signup", minimal: false, phone: "required", prechecked: true, partners: true },
        { kind: "home", checklist: false, importer: false, tour: false },
        { kind: "push" },
      ]}
    />
  </NightSurface>
);

/** A minimal sign-up: an email and a link, the number optional, the refusal as easy as the acceptance. */
export const Minimal = () => (
  <NightSurface as="div" style={box}>
    <PlannerPhone
      labels={EN}
      items={[
        { kind: "appBar" },
        { kind: "banner", style: "equal" },
        { kind: "signup", minimal: true, phone: "optional", prechecked: false, partners: false },
        { kind: "home", checklist: true, importer: false, tour: false },
      ]}
    />
  </NightSurface>
);

/** Every dark card at once, in French — the longest the phone gets: the progress bar, and a tooltip that cannot be closed. */
export const DarkFrench = () => (
  <NightSurface as="div" style={box}>
    <PlannerPhone
      labels={FR}
      items={[
        { kind: "appBar" },
        { kind: "permissions" },
        { kind: "banner", style: "nudged" },
        { kind: "signup", minimal: false, phone: "required", prechecked: true, partners: true },
        { kind: "analysis" },
        { kind: "home", checklist: false, importer: false, tour: true },
        { kind: "push" },
      ]}
    />
  </NightSurface>
);
