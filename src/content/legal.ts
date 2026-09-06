import type { Translatable } from "@/lib/i18n/translatable";

/**
 * legal.ts — Tour de Growth
 * Copy for `/privacy` and `/terms` (REVIEW-02.md R2-03), on the model of
 * Ramille's two legal pages (ScratchMe/TraceVerte): a natural person
 * publishing a site on a non-professional basis (LCEN art. 6 III-2), so no
 * postal address, phone, legal form or publication director — only the
 * host's identity, plus the publisher's name and an email because GDPR
 * art. 13 requires the controller's identity and a way to reach them.
 *
 * Writing rule, borrowed from Ramille and kept: describe ONLY what the
 * product actually does. Every claim below is checkable in the code —
 * storage keys in `lib/quiz/storage.ts`, stored fields in
 * `lib/submissions/types.ts`, the Gemini call in `lib/gemini/`, GoatCounter
 * in `app/root-shell.tsx`. A promise the code doesn't keep is worse than
 * no page at all.
 *
 * TODO: à relire (REVIEW-02) — first draft by the coding session. Three
 * facts need Antoine before this ships (see `CONTACT_EMAIL`, `FIRESTORE_REGION`
 * and `GEMINI_TIER` below).
 */

/**
 * The address that RECEIVES privacy requests, given by Antoine on
 * 2026-09-07. It must keep receiving: GDPR art. 12 gives a month to answer,
 * and an address that lands nowhere is the worst case, since the person
 * believes they wrote. Receiving needs an MX record at IONOS — separate
 * from anything set up for sending. Ramille verified its own MX before
 * publishing the same kind of page.
 */
export const CONTACT_EMAIL = "contact@tourdegrowth.com";

/** TODO(Antoine): the Firestore location of the `tourdegrowth` project (Firebase console → Firestore). Drives the "where your data lives" sentence. */
export const FIRESTORE_REGION = "unknown" as "eu" | "us" | "unknown";

/** TODO(Antoine): whether the Gemini API key is on the paid tier. On the unpaid tier, Google may use prompts to improve its products; on the paid tier it may not. */
export const GEMINI_TIER = "unknown" as "paid" | "free" | "unknown";

export const HOST = {
  name: "Vercel Inc.",
  address: "440 N Barranca Ave #4133, Covina, CA 91723, United States",
};

export const PUBLISHER_NAME = "Antoine Berthaud";

/**
 * Where the copy below says "write to {email}", the page renders the contact
 * address as a `mailto:` link (see `components/brand/LegalPage.tsx`). One
 * token, one constant: the address is never typed into the prose itself.
 */
export const EMAIL_PLACEHOLDER = "{email}";

/** `"write to {email}."` → `["write to ", "{email}", "."]`; a text without the token comes back whole. */
export function splitOnEmail(text: string): string[] {
  return text.split(/(\{email\})/).filter((part) => part !== "");
}

/** The one line of chrome the legal pages need beyond their own copy. */
export const LEGAL_UI: { updatedAt: Translatable } = {
  updatedAt: { fr: "Dernière mise à jour :", en: "Last updated:" },
};

export type LegalBlock =
  | { kind: "paragraph"; text: Translatable }
  | { kind: "bullets"; items: Translatable[] }
  | { kind: "definitions"; items: { term: Translatable; text: Translatable }[] };

export interface LegalSection {
  heading: Translatable;
  blocks: LegalBlock[];
}

export interface LegalDocument {
  title: Translatable;
  metaDescription: Translatable;
  updatedAt: string; // ISO date, shown on the page and used as the sitemap lastmod
  intro: Translatable;
  sections: LegalSection[];
}

const p = (fr: string, en: string): LegalBlock => ({ kind: "paragraph", text: { fr, en } });
const t = (fr: string, en: string): Translatable => ({ fr, en });

const dataLocation: Translatable =
  FIRESTORE_REGION === "eu"
    ? t("Tes données sont hébergées dans l'Union européenne.", "Your data is hosted in the European Union.")
    : FIRESTORE_REGION === "us"
      ? t(
          "Tes données sont hébergées aux États-Unis, chez Google Cloud, dans le cadre des garanties contractuelles que Google fournit pour les transferts hors de l'Union européenne.",
          "Your data is hosted in the United States, at Google Cloud, under the contractual safeguards Google provides for transfers outside the European Union.",
        )
      : t(
          "Tes données sont hébergées chez Google Cloud (Firestore).",
          "Your data is hosted at Google Cloud (Firestore).",
        );

const geminiUse: Translatable =
  GEMINI_TIER === "paid"
    ? t(
        "Google traite ce texte pour produire la réponse et ne l'utilise pas pour entraîner ou améliorer ses modèles (conditions de l'API payante).",
        "Google processes that text to produce the answer and does not use it to train or improve its models (paid API terms).",
      )
    : t(
        "Google traite ce texte pour produire la réponse, dans les conditions de son API Gemini.",
        "Google processes that text to produce the answer, under the terms of its Gemini API.",
      );

export const PRIVACY: LegalDocument = {
  title: t("Politique de confidentialité", "Privacy policy"),
  metaDescription: t(
    "Ce que Tour de Growth enregistre quand tu fais le Tour, où ça va, combien de temps ça reste, et ce que tu peux demander.",
    "What Tour de Growth records when you take the Tour, where it goes, how long it stays, and what you can ask for.",
  ),
  updatedAt: "2026-09-06",
  intro: t(
    "Tour de Growth enregistre le strict nécessaire pour calculer ton score, te le redonner par son lien, et mesurer si l'outil fonctionne. Cette page dit précisément quoi, pourquoi, pendant combien de temps, et ce que tu peux exiger.",
    "Tour de Growth records the bare minimum needed to compute your score, hand it back to you through its link, and measure whether the tool works. This page says exactly what, why, for how long, and what you can ask for.",
  ),
  sections: [
    {
      heading: t("Qui est responsable de tes données", "Who is responsible for your data"),
      blocks: [
        p(
          `Tour de Growth est un projet personnel, développé et publié par ${PUBLISHER_NAME} à titre non professionnel et sans but lucratif. C'est donc une personne physique, et non une société, qui est responsable du traitement de tes données.`,
          `Tour de Growth is a personal project, built and published by ${PUBLISHER_NAME} on a non-professional, non-commercial basis. The controller of your data is therefore a natural person, not a company.`,
        ),
        p(
          "Pour toute question sur tes données, ou pour exercer les droits décrits plus bas, écris à {email}.",
          "For any question about your data, or to exercise the rights described below, write to {email}.",
        ),
      ],
    },
    {
      heading: t("Ce qu'on enregistre, et pourquoi", "What we record, and why"),
      blocks: [
        p(
          "Il n'y a pas de compte. Tu n'as jamais à donner ton nom, ton e-mail ou le nom de ton entreprise pour faire le Tour.",
          "There is no account. You never have to give your name, your email or your company's name to take the Tour.",
        ),
        {
          kind: "definitions",
          items: [
            {
              term: t("Tes quinze réponses et ton score", "Your fifteen answers and your score"),
              text: t(
                "Le choix fait à chacune des quinze questions, les cinq scores d'étape, le total, l'étape la plus faible, le ton choisi (neutre ou roast), la langue, et la date. C'est ce que la page de ton résultat affiche, et ce qui permet de la ré-afficher à quiconque a son lien.",
                "The option chosen at each of the fifteen questions, the five stage scores, the total, the weakest stage, the tone you picked (straight up or roast), the language, and the date. It is what your result page shows, and what lets it be shown again to anyone who has its link.",
              ),
            },
            {
              term: t("D'où tu viens, si c'est d'un partage", "Where you came from, if it was a share"),
              text: t(
                "Si tu as ouvert Tour de Growth depuis le lien de résultat de quelqu'un d'autre, l'identifiant de ce résultat est enregistré avec le tien. C'est ce qui permet de mesurer si l'outil se propage — le coefficient viral — et rien d'autre : il ne dit pas qui a partagé, seulement quel résultat.",
                "If you opened Tour de Growth from someone else's result link, that result's identifier is recorded with yours. It is what lets us measure whether the tool spreads — the viral coefficient — and nothing more: it does not say who shared, only which result.",
              ),
            },
            {
              term: t("Le Deep dive, si tu le fais", "The Deep dive, if you take it"),
              text: t(
                "Les recommandations générées, dans les deux tons et les deux langues, et le nom du modèle qui les a écrites. Tes dix réponses de contexte et le texte libre que tu as éventuellement saisi servent à écrire ces recommandations et ne sont pas conservés ensuite : seul le fait que le champ libre ait été rempli ou non est gardé.",
                "The generated recommendations, in both tones and both languages, and the name of the model that wrote them. Your ten context answers and any free text you typed are used to write those recommendations and are not kept afterwards: only whether the free-text field was filled in is retained.",
              ),
            },
            {
              term: t("Un jeton de propriété", "An ownership token"),
              text: t(
                "À la création de ton résultat, ton navigateur reçoit un jeton secret dont seule une empreinte (un hachage) est enregistrée de notre côté. C'est ce qui prouve que c'est bien toi qui peux lancer le Deep dive de ton résultat, et pas n'importe qui à qui tu l'as envoyé.",
                "When your result is created, your browser receives a secret token of which only a fingerprint (a hash) is stored on our side. It is what proves that you, and not anyone you sent the link to, can run the Deep dive on your result.",
              ),
            },
          ],
        },
        p(
          "La base légale est l'exécution du service que tu demandes en lançant le calcul. Pour la mesure d'audience et de propagation décrites ci-dessous, c'est notre intérêt légitime : savoir si l'outil est utilisé et se propage, ce qui est précisément ce qu'il existe pour démontrer.",
          "The legal basis is the performance of the service you request when you start the calculation. For the audience and spread measurement described below, it is our legitimate interest: knowing whether the tool is used and spreads, which is exactly what it exists to demonstrate.",
        ),
      ],
    },
    {
      heading: t("Ce qu'on n'enregistre pas", "What we don't record"),
      blocks: [
        {
          kind: "bullets",
          items: [
            t(
              "Aucun compte, aucun e-mail, aucun nom, aucun nom d'entreprise. Si tu en écris un dans le champ libre du Deep dive, il sert à la génération et n'est pas conservé.",
              "No account, no email, no name, no company name. If you type one into the Deep dive's free-text field, it is used for the generation and not kept.",
            ),
            t(
              "Aucun cookie publicitaire, aucun traceur tiers. Le seul cookie posé mémorise ta langue.",
              "No advertising cookie, no third-party tracker. The only cookie set remembers your language.",
            ),
            t(
              "Aucune adresse IP conservée par l'application. Elle est utilisée en mémoire, quelques minutes, pour limiter le nombre de requêtes qu'une même connexion peut envoyer, puis oubliée. L'hébergeur tient ses propres journaux techniques, selon sa propre politique.",
              "No IP address kept by the application. It is used in memory, for a few minutes, to limit how many requests one connection can send, then forgotten. The host keeps its own technical logs, under its own policy.",
            ),
            t(
              "Aucune revente, location ou cession de tes données à qui que ce soit.",
              "No sale, rental or transfer of your data to anyone.",
            ),
          ],
        },
      ],
    },
    {
      heading: t("Sur ton appareil", "On your device"),
      blocks: [
        p(
          "Ton navigateur garde, dans son stockage local, tes réponses en cours (pour qu'un rechargement ne te fasse pas recommencer), l'identifiant du résultat qui t'a éventuellement amené ici, la liste des résultats que tu as créés avec leur jeton de propriété, et la progression d'un Deep dive en cours. Rien de tout ça ne quitte ton appareil autrement que par les requêtes décrites plus haut, et effacer les données du site dans ton navigateur l'efface entièrement — y compris la possibilité de lancer le Deep dive d'un résultat déjà créé.",
          "Your browser keeps, in its local storage, your answers in progress (so a reload doesn't make you start over), the identifier of the result that may have brought you here, the list of results you created with their ownership token, and the progress of a Deep dive under way. None of it leaves your device other than through the requests described above, and clearing the site's data in your browser clears it entirely — including the ability to run the Deep dive on a result already created.",
        ),
      ],
    },
    {
      heading: t("Mesure d'audience", "Audience measurement"),
      blocks: [
        p(
          "Les pages vues et quelques événements (Tour commencé, étape terminée, résultat créé, partage, Deep dive) sont comptés avec GoatCounter, un service de mesure d'audience sans cookie et sans identifiant individuel. Il ne permet pas de te suivre d'un site à l'autre ni de savoir qui tu es. C'est pourquoi aucune bannière de consentement ne t'est présentée : il n'y a rien à consentir.",
          "Page views and a few events (Tour started, stage finished, result created, share, Deep dive) are counted with GoatCounter, a cookie-free audience measurement service with no individual identifier. It cannot follow you across sites or tell who you are. That is why no consent banner is shown: there is nothing to consent to.",
        ),
      ],
    },
    {
      heading: t("Où sont tes données, et qui les traite pour nous", "Where your data is, and who processes it for us"),
      blocks: [
        { kind: "paragraph", text: dataLocation },
        {
          kind: "definitions",
          items: [
            {
              term: t("Google Cloud (Firestore)", "Google Cloud (Firestore)"),
              text: t("La base de données où les résultats sont enregistrés.", "The database where results are stored."),
            },
            {
              term: t("Google (API Gemini)", "Google (Gemini API)"),
              text: {
                fr: `Uniquement si tu fais le Deep dive : tes vingt-cinq réponses, ton score et ton éventuel texte libre lui sont envoyés pour rédiger tes recommandations. ${geminiUse.fr}`,
                en: `Only if you take the Deep dive: your twenty-five answers, your score and any free text are sent to it to write your recommendations. ${geminiUse.en}`,
              },
            },
            {
              term: t("Vercel", "Vercel"),
              text: t("L'hébergement du site et l'exécution de son code.", "Hosting the site and running its code."),
            },
            {
              term: t("GoatCounter", "GoatCounter"),
              text: t("La mesure d'audience décrite ci-dessus.", "The audience measurement described above."),
            },
          ],
        },
        p(
          "Aucun de ces prestataires ne reçoit tes données à d'autres fins que celle indiquée, et aucune application tierce ne peut lire la base : ses règles d'accès refusent tout accès direct, seul le serveur de Tour de Growth y écrit et y lit.",
          "None of these providers receives your data for any purpose other than the one stated, and no third-party application can read the database: its access rules refuse any direct access; only Tour de Growth's server writes to and reads from it.",
        ),
      ],
    },
    {
      heading: t("Combien de temps on les garde", "How long we keep it"),
      blocks: [
        {
          kind: "bullets",
          items: [
            t(
              "Ton résultat (réponses, scores, ton, langue, recommandations du Deep dive) est conservé sans limite de durée : son lien est fait pour être partagé, et un lien qui meurt des mois après un partage casserait ce pour quoi tu l'as envoyé. Tu peux en demander la suppression à tout moment (voir plus bas).",
              "Your result (answers, scores, tone, language, Deep dive recommendations) is kept with no time limit: its link is meant to be shared, and a link that dies months after a share would break the very thing you sent it for. You can ask for it to be deleted at any time (see below).",
            ),
            t(
              "Le texte libre et les réponses de contexte du Deep dive ne sont pas conservés après la génération des recommandations.",
              "The Deep dive's free text and context answers are not kept once the recommendations have been generated.",
            ),
            t(
              "Les données de mesure d'audience sont agrégées et ne permettent pas de te retrouver individuellement.",
              "Audience measurement data is aggregated and cannot single you out.",
            ),
          ],
        },
      ],
    },
    {
      heading: t("Tes droits", "Your rights"),
      blocks: [
        p(
          "Conformément au RGPD, tu disposes d'un droit d'accès, de rectification, d'effacement, de portabilité, de limitation et d'opposition sur tes données.",
          "Under the GDPR, you have the right to access, rectify, erase, port, restrict and object to the processing of your data.",
        ),
        p(
          "Comme il n'y a pas de compte, la seule preuve que tu es l'auteur d'un résultat est son lien : pour demander la suppression ou une copie d'un résultat, écris à {email} en joignant l'adresse de la page (https://www.tourdegrowth.com/r/…). Nous répondons dans un délai d'un mois.",
          "Since there is no account, the only proof that you authored a result is its link: to ask for a result to be deleted or copied, write to {email} with the page's address (https://www.tourdegrowth.com/r/…). We answer within a month.",
        ),
        p(
          "Si tu estimes que tes droits ne sont pas respectés, tu peux introduire une réclamation auprès de la CNIL (Commission nationale de l'informatique et des libertés), 3 place de Fontenoy, 75007 Paris, ou sur cnil.fr.",
          "If you believe your rights are not respected, you can lodge a complaint with the CNIL (the French data protection authority), 3 place de Fontenoy, 75007 Paris, France, or at cnil.fr.",
        ),
      ],
    },
    {
      heading: t("Évolutions de ce document", "Changes to this document"),
      blocks: [
        p(
          "Si cette politique change de manière significative, la date en haut de cette page change avec elle. Le code du site étant public, chaque modification y est aussi visible.",
          "If this policy changes significantly, the date at the top of this page changes with it. The site's code being public, every change is visible there too.",
        ),
      ],
    },
  ],
};

export const TERMS: LegalDocument = {
  title: t("Conditions d'utilisation", "Terms of use"),
  metaDescription: t(
    "Ce que Tour de Growth est, ce qu'il ne prétend pas être, et ce sur quoi chacun s'engage. Gratuit, sans compte, sans publicité.",
    "What Tour de Growth is, what it does not claim to be, and what each side commits to. Free, no account, no ads.",
  ),
  updatedAt: "2026-09-06",
  intro: t(
    "Tour de Growth est gratuit et sans publicité. Cette page dit ce que le service fait, ce qu'il ne prétend pas faire, et ce sur quoi chacun s'engage.",
    "Tour de Growth is free and ad-free. This page says what the service does, what it does not claim to do, and what each side commits to.",
  ),
  sections: [
    {
      heading: t("Objet", "Purpose"),
      blocks: [
        p(
          "Tour de Growth est un service gratuit qui estime la maturité growth d'un produit à partir de tes réponses à quinze questions réparties sur les cinq étapes du cadre AARRR, te donne un score sur 100 et une lecture par étape, et te propose un Deep dive optionnel de dix questions supplémentaires pour obtenir des recommandations rédigées par un modèle de langage.",
          "Tour de Growth is a free service that estimates a product's growth maturity from your answers to fifteen questions across the five stages of the AARRR framework, gives you a score out of 100 and a reading per stage, and offers an optional Deep dive of ten more questions to obtain recommendations written by a language model.",
        ),
        p(
          "Ces conditions régissent l'utilisation du service. En l'utilisant, tu les acceptes.",
          "These terms govern the use of the service. By using it, you accept them.",
        ),
      ],
    },
    {
      heading: t("Ce que le score est, et ce qu'il n'est pas", "What the score is, and what it is not"),
      blocks: [
        p(
          "Le score est le résultat d'une règle fixe appliquée à tes propres réponses : chaque réponse vaut un nombre de points connu, rien n'est pondéré à la volée et aucune IA n'y touche. Il est reproductible et ré-explicable — la page « À propos » donne la règle complète.",
          "The score is the result of a fixed rule applied to your own answers: each answer is worth a known number of points, nothing is weighted on the fly and no AI touches it. It is reproducible and explainable — the About page gives the full rule.",
        ),
        {
          kind: "bullets",
          items: [
            t(
              "C'est une estimation rapide et directionnelle, pas un audit : il reflète ce que tu déclares, pas ce que tes données diraient.",
              "It is a fast, directional estimate, not an audit: it reflects what you declare, not what your data would say.",
            ),
            t(
              "Les recommandations du Deep dive sont générées par un modèle de langage à partir de tes réponses. Elles peuvent être imprécises, incomplètes ou inadaptées à ta situation ; elles sont un point de départ de réflexion, pas un conseil professionnel.",
              "The Deep dive's recommendations are generated by a language model from your answers. They may be imprecise, incomplete or ill-suited to your situation; they are a starting point for thinking, not professional advice.",
            ),
            t(
              "Le ton « roast » est un choix explicite de ta part. Il vise la stratégie décrite par tes réponses, jamais la personne — c'est une règle codée en dur, et si un texte la franchit, signale-le.",
              "The \"roast\" tone is an explicit choice on your part. It targets the strategy your answers describe, never the person — that rule is hard-coded, and if a text crosses it, report it.",
            ),
          ],
        },
      ],
    },
    {
      heading: t("Ta page de résultat", "Your result page"),
      blocks: [
        p(
          "Chaque résultat a une adresse unique, publique, sans mot de passe : toute personne qui a le lien peut la voir. C'est fait pour être partagé ; ne partage donc que ce que tu es prêt à rendre visible. Le champ libre du Deep dive façonne les recommandations qui s'affichent sur cette page — ce que tu y écris peut donc transparaître dans un texte que tu partageras ensuite.",
          "Each result has a unique, public address with no password: anyone with the link can see it. It is made to be shared, so only share what you are ready to make visible. The Deep dive's free-text field shapes the recommendations shown on that page — what you write there may therefore surface in a text you later share.",
        ),
      ],
    },
    {
      heading: t("Ce que tu t'engages à ne pas faire", "What you commit not to do"),
      blocks: [
        {
          kind: "bullets",
          items: [
            t(
              "Tenter de lancer le Deep dive d'un résultat qui n'est pas le tien, ou de contourner les protections du service.",
              "Try to run the Deep dive on a result that is not yours, or circumvent the service's protections.",
            ),
            t(
              "Perturber le fonctionnement du service, notamment par des requêtes automatisées massives ; des limites de débit s'appliquent.",
              "Disrupt the service, in particular through mass automated requests; rate limits apply.",
            ),
            t(
              "Saisir dans le champ libre des données personnelles concernant d'autres personnes, ou des contenus illicites.",
              "Enter personal data about other people, or unlawful content, in the free-text field.",
            ),
          ],
        },
      ],
    },
    {
      heading: t("Disponibilité", "Availability"),
      blocks: [
        p(
          "Le service est fourni en l'état, sans garantie de disponibilité continue. Il peut être interrompu, évoluer ou cesser d'être proposé. Le Deep dive dépend d'un service tiers (l'API Gemini de Google) et peut être temporairement indisponible pour cette raison, sans que tes réponses soient perdues.",
          "The service is provided as is, with no guarantee of continuous availability. It may be interrupted, evolve or be discontinued. The Deep dive depends on a third-party service (Google's Gemini API) and may be temporarily unavailable for that reason, without your answers being lost.",
        ),
      ],
    },
    {
      heading: t("Responsabilité", "Liability"),
      blocks: [
        p(
          "Tour de Growth ne saurait être tenu responsable des décisions que tu prends sur la base d'un score ou d'une recommandation, ni des conséquences d'une indisponibilité du service. Aucune limitation ci-dessus ne vise à écarter une responsabilité qui ne peut légalement l'être.",
          "Tour de Growth cannot be held liable for decisions you make on the basis of a score or a recommendation, nor for the consequences of the service being unavailable. Nothing above seeks to exclude a liability that cannot legally be excluded.",
        ),
      ],
    },
    {
      heading: t("Propriété intellectuelle", "Intellectual property"),
      blocks: [
        p(
          "Le code du service est publié sous licence AGPL-3.0 : tu peux le lire, l'exécuter, le modifier et le redistribuer aux conditions de cette licence. Le nom « Tour de Growth », son logotype et son identité visuelle n'en font pas partie et restent la propriété de son éditeur.",
          "The service's code is published under the AGPL-3.0 licence: you may read, run, modify and redistribute it under that licence's terms. The name \"Tour de Growth\", its wordmark and its visual identity are not part of it and remain the property of its publisher.",
        ),
        p(
          "Tes réponses restent les tiennes. Elles ne servent qu'au service décrit ici et à la mesure agrégée de son usage.",
          "Your answers remain yours. They are used only for the service described here and for the aggregate measurement of its use.",
        ),
      ],
    },
    {
      heading: t("Modification des conditions", "Changes to these terms"),
      blocks: [
        p(
          "Ces conditions peuvent évoluer. La date de dernière mise à jour figure en haut de cette page, et le code du site étant public, chaque modification y est visible.",
          "These terms may change. The date of the last update is at the top of this page, and the site's code being public, every change is visible there.",
        ),
      ],
    },
    {
      heading: t("Droit applicable et litiges", "Governing law and disputes"),
      blocks: [
        p(
          "Ces conditions sont soumises au droit français. En cas de différend, une solution amiable sera recherchée en priorité, en écrivant à {email}.",
          "These terms are governed by French law. In the event of a dispute, an amicable solution will be sought first, by writing to {email}.",
        ),
      ],
    },
    {
      heading: t("Éditeur et hébergeur", "Publisher and host"),
      blocks: [
        p(
          `Tour de Growth est édité par ${PUBLISHER_NAME}, à titre non professionnel et sans but lucratif. Contact : {email}.`,
          `Tour de Growth is published by ${PUBLISHER_NAME} on a non-professional, non-commercial basis. Contact: {email}.`,
        ),
        p(
          `Hébergement du site : ${HOST.name}, ${HOST.address}. Hébergement des données : Google Cloud (Firestore).`,
          `Site hosting: ${HOST.name}, ${HOST.address}. Data hosting: Google Cloud (Firestore).`,
        ),
        p(
          "L'article 6 III-2 de la loi du 21 juin 2004 pour la confiance dans l'économie numérique permet à une personne éditant un service en ligne à titre non professionnel de ne rendre publiques que les coordonnées de son hébergeur, celles-ci étant indiquées ci-dessus. Les éléments d'identification de l'éditeur ont été communiqués à l'hébergeur et restent à la disposition de l'autorité judiciaire.",
          "Article 6 III-2 of the French law of 21 June 2004 on confidence in the digital economy allows a person publishing an online service on a non-professional basis to make public only their host's details, given above. The publisher's identification details have been provided to the host and remain available to the judicial authority.",
        ),
      ],
    },
  ],
};
