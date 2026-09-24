import { Button, Callout } from "tour-de-growth";

/*
 * The aside of a prose page. Two tones, and they are not interchangeable —
 * which is why `tone` is required and has no default.
 *
 * Neither is red. Red means one of three things in this system (primary
 * action, diagnosis, advice) and a caveat or a sales line is none of them;
 * these used to be a red-edged Card with an `!important`, a fourth meaning
 * the system does not allow. Never raised either: the page already has its
 * one raised element.
 */

const wrap = { maxWidth: 560 } as const;

/** `caveat` — dashed ink on the page ground. What to know before trusting the score. */
export const Caveat = () => (
  <div style={wrap}>
    <Callout tone="caveat">
      <p>
        Tour de Growth gives a fast, directional estimate — not a professional audit. The score
        reflects your own answers to 15 questions, useful as a conversation starter, not a final
        verdict.
      </p>
    </Callout>
  </div>
);

/** `cta` — paper and an ink edge, leading into its one button. The button is the only red. */
export const Cta = () => (
  <div style={wrap}>
    <Callout
      tone="cta"
      action={
        <Button size="lg" href="/quiz">
          Take the Tour →
        </Button>
      }
    >
      <p>
        The same checklist, in three minutes, with the score worked out and the stage that&apos;s
        holding you back named:
      </p>
    </Callout>
  </div>
);

/** In French, which runs longer — the sentence wraps, the button stays one line. */
export const CtaFrench = () => (
  <div style={wrap}>
    <Callout
      tone="cta"
      action={
        <Button size="lg" href="/quiz">
          Faire le Tour →
        </Button>
      }
    >
      <p>
        La même checklist, en trois minutes, avec le score calculé et l&apos;étape qui te freine
        nommée :
      </p>
    </Callout>
  </div>
);
