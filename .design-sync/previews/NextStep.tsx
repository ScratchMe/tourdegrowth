import { Button, NextStep } from "tour-de-growth";

/*
 * The board's next step (design system extension 07, A18 T2.a): under the
 * verdict, the reason, the screen's ONE primary action, then what else
 * waits under a rule — a request to follow up, the backup, the verdict that
 * is a slide. Dashed edges only for « not yet » (pending) and, red, for
 * advice; never a red wash.
 *
 * Every prop is the product's own: `BoardNextStep` (app/[locale]/aarrr-
 * funnel-template/_engine/BoardHead.tsx) rendered on the engine's fixtures
 * with the resolved copy, its step chosen by `nextStepFor` (_engine/
 * next-step.ts) on the collect plan, the month series and the last visit
 * built as EngineWorkbench builds them; its element's props are what it
 * hands NextStep. Under 760px of viewport the primary takes the full width
 * (a media query, not drawn at card width).
 */

const noop = () => {};

/**
 * A new engine with nothing typed yet (`emptyState()`, `lib/engine/__tests__/fixtures.ts`), in
 * English, during the visit that created it (no last visit, so « Where you are »):
 * `nextStepFor` picks rank 4, the first five-minute number in the funnel's order, the sign-up
 * rate. The reason, then the one primary; under the rule, the backup in the dashed red edge of
 * advice, with its quiet « Save (.json) ».
 */
export const FirstVisit = () => (
  <div style={{ maxWidth: 760 }}>
    <NextStep
      eyebrow={"Where you are"}
      lead={"The quickest first: this one you can find on your own, in about five minutes."}
      primary={{ label: "Next number: sign-up rate →", onClick: noop }}
      lines={[
        { text: "Never saved to a file: Safari may erase it after seven days of use without a visit here.", tone: "advice", action: <Button variant="quiet" size="sm" onClick={noop}>{"Save (.json)"}</Button> },
      ]}
      headingId="engine-next-first"
    />
  </div>
);

/**
 * The page's example (`exampleState()`) in French, opened again on 28 September, three days
 * after its last change: the eyebrow says the last visit. Nothing is left to type and one
 * request is out, so rank 7 makes the slides the primary. Under the rule: the request to Data,
 * asked seven days ago, past the five-day follow-up (dashed « not yet » edge, its quiet
 * « Relancer » — the island's `RequestCopy`, drawn as the quiet `Button` it renders), the
 * verdict-is-a-slide line, and the backup.
 */
export const ReturnSlides = () => (
  <div style={{ maxWidth: 760 }}>
    <NextStep
      eyebrow={"Dernière visite · il y a 3 jours"}
      lead={"Plus rien à taper : un chiffre demandé attend sa réponse."}
      primary={{ label: "Prépare tes slides →", onClick: noop }}
      lines={[
        { text: "Demandé à l'équipe Data il y a 7 jours : coefficient viral (K), réponse pas encore saisie.", tone: "pending", action: <Button variant="quiet" onClick={noop}>{"Relancer"}</Button> },
        { text: "Ton verdict, ci-dessus, est le titre de ta première slide." },
        { text: "Jamais sauvegardé dans un fichier : Safari peut l'effacer après sept jours d'utilisation sans passage ici.", tone: "advice", action: <Button variant="quiet" size="sm" onClick={noop}>{"Sauvegarder (.json)"}</Button> },
      ]}
      headingId="engine-next-return"
    />
  </div>
);

/**
 * The example with only its five-minute numbers typed, everything else still to do, in
 * English, in the session that typed them: five numbers need someone else, so rank 5 makes
 * « Ask for your 5 numbers → » the primary (the requests' screen), with the one quiet
 * alternative beside it — type the next number first, an hour-long one.
 */
export const AskAll = () => (
  <div style={{ maxWidth: 760 }}>
    <NextStep
      eyebrow={"Where you are"}
      lead={"5 numbers come from someone else: send the requests now, fill in the rest while you wait."}
      primary={{ label: "Ask for your 5 numbers →", onClick: noop }}
      secondary={<Button variant="quiet" onClick={noop}>{"Type the next number first"}</Button>}
      lines={[
        { text: "Never saved to a file: Safari may erase it after seven days of use without a visit here.", tone: "advice", action: <Button variant="quiet" size="sm" onClick={noop}>{"Save (.json)"}</Button> },
      ]}
      headingId="engine-next-ask"
    />
  </div>
);

/**
 * The same half-filled engine in French, opened again on 5 October: September's flows are
 * over, so rank 3 makes starting September the primary, and « Continuer à remplir août 2026 »
 * is the quiet alternative (it opens the requests August still owes). Under the rule, the
 * backup.
 */
export const NewMonth = () => (
  <div style={{ maxWidth: 760 }}>
    <NextStep
      eyebrow={"Dernière visite · il y a 10 jours"}
      lead={"Mois clos : septembre 2026. Ses chiffres peuvent commencer ; les cibles et les définitions suivent, les valeurs jamais."}
      primary={{ label: "Démarre septembre 2026 →", onClick: noop }}
      secondary={<Button variant="quiet" onClick={noop}>{"Continuer à remplir août 2026"}</Button>}
      lines={[
        { text: "Jamais sauvegardé dans un fichier : Safari peut l'effacer après sept jours d'utilisation sans passage ici.", tone: "advice", action: <Button variant="quiet" size="sm" onClick={noop}>{"Sauvegarder (.json)"}</Button> },
      ]}
      headingId="engine-next-month"
    />
  </div>
);

/**
 * The example with a month before it (`withMonthBefore(exampleState())`), in English, July
 * picked in the bar's menu, in a session that is not a return (the engine just imported, say):
 * rank 2 — back to August is the primary, « Correct this month » the alternative. The backup
 * line stays on a past month.
 */
export const PastMonth = () => (
  <div style={{ maxWidth: 760 }}>
    <NextStep
      eyebrow={"Where you are"}
      lead={"You're looking at July 2026, read-only."}
      primary={{ label: "Go back to August 2026 →", onClick: noop }}
      secondary={<Button variant="quiet" onClick={noop}>{"Correct this month"}</Button>}
      lines={[
        { text: "Never saved to a file: Safari may erase it after seven days of use without a visit here.", tone: "advice", action: <Button variant="quiet" size="sm" onClick={noop}>{"Save (.json)"}</Button> },
      ]}
      headingId="engine-next-past"
    />
  </div>
);

/**
 * The example in French when the browser refused the last write (quota, private mode): rank 1.
 * The lead is the risk, in the advice edge, read out as an alert (`announce`); the primary
 * saves to a file. No backup line: the lead already says it.
 */
export const SaveRefused = () => (
  <div style={{ maxWidth: 760 }}>
    <NextStep
      eyebrow={"Où tu en es"}
      lead={"Impossible d'enregistrer sur cet appareil. Sauvegarde ta saisie dans un fichier pour ne rien perdre."}
      leadTone="advice"
      announce
      primary={{ label: "Sauvegarde ton moteur dans un fichier (.json) →", onClick: noop }}
      headingId="engine-next-refused"
    />
  </div>
);
