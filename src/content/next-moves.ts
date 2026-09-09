import type { Translatable } from "@/lib/i18n/translatable";

/**
 * ---------------------------------------------------------------------------
 * NEXT MOVES — one concrete action for the stage that is holding you back.
 * ---------------------------------------------------------------------------
 *
 * `REVIEW-03.md` lot A, item A2. `SPEC-ADDENDUM-01.md` §0 took Gemini out of
 * the Quick mode — right call, it made the free result instant and
 * deterministic — and the `recommendation` field went with it, because the
 * addendum offered no static replacement. Since then the free result
 * diagnoses and stops: five scores, two strengths, two weaknesses, and not
 * one thing to do. This file is that missing half.
 *
 * **Deterministic, never generated.** Same non-negotiable as the score
 * itself: an action a reader cannot trace back to their own answers is an
 * action they cannot trust. Gemini stays where it earns its latency — the
 * Deep dive, which makes this same action specific to their business.
 *
 * **No tone variants** (Antoine's decision, 2026-09-09). The roast voice
 * lives in the verdicts; an action that mocks you is not an action, and
 * writing "roast actions" would put the anti-mockery guardrail in charge of
 * arbitrating advice, which is not its job.
 *
 * ## How an action is chosen — and why it is keyed this way
 *
 * `REVIEW-03.md` sized this as pillar × band, three alternatives per entry.
 * It is keyed by **question × answer** instead, and the reason is worth
 * keeping: with a pillar × band key, something still has to pick which of
 * the three alternatives to show, and any rule for that is either arbitrary
 * (an index, a rotation) or a re-derivation of the answers — in which case
 * the answers may as well be the key. Keying by answer makes the rule one
 * sentence: *the first thing missing in the stage that is holding you back*.
 * Same volume of copy as the sized estimate (30 actions × 2 languages), and
 * an action that responds to what the reader actually said.
 *
 * The 20-point answer has no entry on purpose: there is nothing to fix
 * there. A pillar whose three answers are all full marks scores 20, which
 * puts it in the strong band, which is `LEVEL_MOVE` below.
 *
 * ## House rules for this copy, so a later addition matches
 *
 * One imperative sentence, roughly 12–20 words, occasionally a second clause
 * naming what it produces. No numbered lists, no checklists, **no time
 * estimates and no promised percentages** — anything that reads like a
 * project plan oversells what fifteen questions can know. Address the reader
 * as "tu" in French, matching the rest of the product.
 *
 * TODO: à relire — premier jet de la session de code, pas de l'agent produit.
 * C'est le premier texte du produit qui dit à quelqu'un quoi faire de son
 * entreprise, donc il mérite la même relecture ligne à ligne que le
 * glossaire long.
 */

/** The point values an action can answer: a partial answer, or none at all. */
export type ActionablePoints = 7 | 0;

/**
 * Keyed by question id. Question ids are plain strings in this codebase
 * (`lib/scoring/questions.ts`), so the type cannot enforce coverage — a unit
 * test does instead, asserting these keys are *exactly* the fifteen ids and
 * that every points value here really exists on that question's options. A
 * test is the stronger guard anyway: it also catches a library that drifts
 * from the copy library's point values, which a union type would not.
 */
export const NEXT_MOVES: Record<string, Record<ActionablePoints, Translatable>> = {
  // --- Acquisition ---
  "acq-1": {
    7: {
      en: "Put one number on your main channel this month — signups it brought, and what it cost.",
      fr: "Mets un chiffre sur ton canal principal ce mois-ci : les inscriptions qu'il a amenées, et ce qu'il a coûté.",
    },
    0: {
      en: "Pick the single channel that brought your last ten customers, and give it your full attention for one cycle.",
      fr: "Choisis le seul canal qui a amené tes dix derniers clients, et consacre-lui un cycle entier.",
    },
  },
  "acq-2": {
    7: {
      en: "Give your second channel the same budget and the same measurement as the first, so the comparison means something.",
      fr: "Donne à ton second canal le même budget et la même mesure que le premier, pour que la comparaison veuille dire quelque chose.",
    },
    0: {
      en: "Test one second channel small and on purpose — a single channel is a single point of failure.",
      fr: "Teste un second canal, petit et délibéré — un canal unique est un point de défaillance unique.",
    },
  },
  "acq-3": {
    7: {
      en: "Turn your estimate into a real number: total spend divided by customers won, for one clean month.",
      fr: "Transforme ton estimation en vrai chiffre : dépense totale divisée par clients gagnés, sur un mois propre.",
    },
    0: {
      en: "Add up everything you spent to win customers last month and divide by how many you won.",
      fr: "Additionne tout ce que tu as dépensé pour gagner des clients le mois dernier et divise par le nombre gagné.",
    },
  },

  // --- Activation ---
  "act-1": {
    7: {
      en: "Write your aha moment as a single event you could log, then log it — a moment you can't count isn't defined yet.",
      fr: "Écris ton moment « aha » comme un événement que tu pourrais tracer, puis trace-le — un moment qu'on ne peut pas compter n'est pas encore défini.",
    },
    0: {
      en: "Ask your five most loyal customers what made them stay, and look for the action they all took early.",
      fr: "Demande à tes cinq clients les plus fidèles ce qui les a fait rester, et cherche l'action qu'ils ont tous faite tôt.",
    },
  },
  "act-2": {
    7: {
      en: "Measure the share of new users who reach that moment in their first week — a hunch and a rate rarely match.",
      fr: "Mesure la part de nouveaux utilisateurs qui atteignent ce moment dès la première semaine — une intuition et un taux coïncident rarement.",
    },
    0: {
      en: "Instrument the one event that marks your aha moment, and read the rate before changing anything else.",
      fr: "Instrumente l'unique événement qui marque ton moment « aha », et lis le taux avant de changer quoi que ce soit d'autre.",
    },
  },
  "act-3": {
    7: {
      en: "Turn your next onboarding tweak into a real before-and-after on one number, instead of a judgement call.",
      fr: "Fais de ton prochain ajustement d'onboarding un vrai avant/après sur un chiffre, plutôt qu'un choix à l'instinct.",
    },
    0: {
      en: "Watch three new users go through your onboarding without helping them, and cut the first step that stops them.",
      fr: "Regarde trois nouveaux utilisateurs traverser ton onboarding sans les aider, et supprime la première étape qui les bloque.",
    },
  },

  // --- Retention ---
  "ret-1": {
    7: {
      en: "Put your retention curve in front of the team on a fixed day each month — a number nobody reads changes nothing.",
      fr: "Mets ta courbe de rétention sous les yeux de l'équipe à date fixe chaque mois — un chiffre que personne ne lit ne change rien.",
    },
    0: {
      en: "Take one month's cohort of new users and count how many are still active thirty days later.",
      fr: "Prends la cohorte de nouveaux utilisateurs d'un mois et compte combien sont encore actifs trente jours plus tard.",
    },
  },
  "ret-2": {
    7: {
      en: "Compare your re-engagement message against sending nothing at all — basic and untested is a guess with a schedule.",
      fr: "Compare ton message de réengagement au fait de ne rien envoyer du tout — basique et non testé, c'est une supposition avec un calendrier.",
    },
    0: {
      en: "Send one message to users who went quiet last month, and see how many come back.",
      fr: "Envoie un message aux utilisateurs devenus silencieux le mois dernier, et regarde combien reviennent.",
    },
  },
  "ret-3": {
    7: {
      en: "Talk to five customers who left and check your hunch against what they say — most hunches survive that badly.",
      fr: "Parle à cinq clients partis et confronte ton intuition à ce qu'ils disent — la plupart des intuitions y survivent mal.",
    },
    0: {
      en: "Ask every departing customer one question — why now? — and read the answers together at the end of the month.",
      fr: "Pose une seule question à chaque client qui part — pourquoi maintenant ? — et relis les réponses ensemble en fin de mois.",
    },
  },

  // --- Referral ---
  "ref-1": {
    7: {
      en: "Move the invitation into the product, at the moment your customer is most pleased with it.",
      fr: "Déplace l'invitation dans le produit, au moment où ton client en est le plus content.",
    },
    0: {
      en: "Give customers one thing worth passing on — a result, a page, a number — and a link that carries it.",
      fr: "Donne à tes clients une chose qui vaut d'être transmise — un résultat, une page, un chiffre — et un lien qui la porte.",
    },
  },
  "ref-2": {
    7: {
      en: "Find where your sharing flow loses people, and cut one step out of it before adding an incentive.",
      fr: "Trouve où ton parcours de partage perd les gens, et retire-lui une étape avant d'ajouter une récompense.",
    },
    0: {
      en: "Ask three customers why they never shared — a mechanism nobody uses is usually asking at the wrong moment.",
      fr: "Demande à trois clients pourquoi ils n'ont jamais partagé — un mécanisme inutilisé demande en général au mauvais moment.",
    },
  },
  "ref-3": {
    7: {
      en: "Count it properly: new customers who arrived through an existing one, divided by all your customers.",
      fr: "Compte-le vraiment : nouveaux clients arrivés via un client existant, divisés par l'ensemble de tes clients.",
    },
    0: {
      en: "Tag every referred signup at the source so the number exists next month without any archaeology.",
      fr: "Marque chaque inscription parrainée à la source, pour que le chiffre existe le mois prochain sans archéologie.",
    },
  },

  // --- Revenue ---
  "rev-1": {
    7: {
      en: "Put your price in front of new prospects at two levels and watch which one they actually buy.",
      fr: "Présente ton prix à deux niveaux à de nouveaux prospects et regarde lequel ils achètent vraiment.",
    },
    0: {
      en: "Ask ten customers what they would pay and what they compared you to before deciding.",
      fr: "Demande à dix clients ce qu'ils paieraient et à quoi ils t'ont comparé avant de décider.",
    },
  },
  "rev-2": {
    7: {
      en: "Tighten your LTV with one real number — your monthly churn — instead of an assumed lifetime.",
      fr: "Affine ta LTV avec un vrai chiffre — ton churn mensuel — plutôt qu'une durée de vie supposée.",
    },
    0: {
      en: "Take your average monthly revenue per customer and divide it by your monthly churn rate.",
      fr: "Prends ton revenu mensuel moyen par client et divise-le par ton taux de churn mensuel.",
    },
  },
  "rev-3": {
    7: {
      en: "Turn your best expansion idea into a written trigger — who gets offered what, and when.",
      fr: "Transforme ta meilleure idée d'expansion en déclencheur écrit : qui reçoit quoi, et quand.",
    },
    0: {
      en: "Look at the customers who already outgrew their plan and offer them the next one on purpose.",
      fr: "Regarde les clients qui ont déjà dépassé leur offre, et propose-leur délibérément la suivante.",
    },
  },
};

/**
 * Shown when the stage holding you back is itself in the strong band — which
 * can only happen when all five are. There is no bottleneck to name, so
 * naming one would be false precision, and this product's credibility rests
 * on a score you can re-explain in ten seconds.
 */
export const LEVEL_MOVE: Translatable = {
  en: "Nothing is stalling you — every stage is solid. The question now is which one you push, not which one you fix.",
  fr: "Rien ne te freine — chaque étape tient. La question n'est plus laquelle réparer, mais laquelle pousser.",
};
