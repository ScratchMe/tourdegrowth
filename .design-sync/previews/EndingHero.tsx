import { EndingHero } from "tour-de-growth";

/*
 * December's headline: the first thing on paper after the night. An eyebrow
 * that names the ending, a stamped title, and the year in one paragraph with
 * the real figures filled in. `win` only decides the eyebrow's ink (green or
 * alert red) — the words already say which it is. The stamp animation plays
 * once on the way into December and not on a return visit; these stills
 * show the settled state. Copy: content/game/retention.ts (`endings`).
 */

const box = { padding: 24, maxWidth: 760 } as const;

/** A winning ending: the eyebrow in green. */
export const Applause = () => (
  <div style={box}>
    <EndingHero
      win
      eyebrow="December · applause"
      title="You held out. And it worked."
      text="Churn at 3.9%, 96,480 subscribers, trust at 71 that nobody was measuring, and not one subscriber had to call a number on a Monday morning. The CEO pushed you three times. You answered with numbers. That is exactly the job."
    />
  </div>
);

/** A losing ending — the reveal: the eyebrow in alert red. */
export const TheReveal = () => (
  <div style={box}>
    <EndingHero
      win={false}
      eyebrow="December · the reveal"
      title="Here is what you did."
      text="The radar climbed all the way to an inspection, the fine landed, the press wrote about it. Churn at 4.1%, trust at 18. The subscribers held back by force in the spring left in the autumn, and told everyone why. What you put into production has names. They are below."
    />
  </div>
);

/** In French — fired, but clean: a loss said without blame. */
export const FiredCleanFrench = () => (
  <div style={box}>
    <EndingHero
      win={false}
      eyebrow="Licencié · mais propre"
      title="Viré. Sans une seule astuce."
      text="La patience du DG est tombée à 0 avant que tes effets lents n'arrivent. Tu es parti avec ton test A/B sous le bras et une confiance à 64. L'année suivante, ton remplaçant a fait ce que tu refusais. L'amende est arrivée en septembre."
    />
  </div>
);
