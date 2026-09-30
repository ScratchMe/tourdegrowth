import { EndingHero } from "tour-de-growth";

/*
 * December's headline: the first thing on paper after the night. An eyebrow
 * that names the ending, a stamped title, and the year in one paragraph with
 * the real figures filled in. `win` only decides the eyebrow's ink (green or
 * alert red) — the words already say which it is. The stamp animation plays
 * once on the way into December; these stills pass `stamp={false}`, the
 * return-visit form, so they show the settled title.
 *
 * Every prop is what the island builds (`decemberContent().hero`) from a
 * reference year played to its end — the endings' text from
 * content/game/retention.ts, filled with that year's figures.
 */

const box = { padding: 24, maxWidth: 760 } as const;

/** A winning ending, reference year A: the eyebrow in green. */
export const Applause = () => (
  <div style={box}>
    <EndingHero
      win
      eyebrow="December · applause"
      title="You held out. And it worked."
      text="Churn at 4.0%, 105,632 subscribers, trust at 83 that nobody was measuring, and not one subscriber had to call a number on a Monday morning. The CEO pushed you three times. You answered with numbers. That is exactly the job."
      stamp={false}
    />
  </div>
);

/** A losing ending — the reveal, reference year C (fined in Q3): the eyebrow in alert red. */
export const TheReveal = () => (
  <div style={box}>
    <EndingHero
      win={false}
      eyebrow="December · the reveal"
      title="Here is what you did."
      text="The radar climbed all the way to an inspection, the fine landed, the press wrote about it. Churn at 9.1%, trust at 27. The subscribers held back by force in the spring left in the autumn, and told everyone why. What you put into production has names. They are below."
      stamp={false}
    />
  </div>
);

/** In French — fired, but clean (reference year D): a loss said without blame, the longest of the texts. */
export const FiredCleanFrench = () => (
  <div style={box}>
    <EndingHero
      win={false}
      eyebrow="Licencié · mais propre"
      title="Viré. Sans une seule astuce."
      text="La patience du DG est tombée à 19 avant que tes effets lents n'arrivent. Tu es parti avec ton test A/B sous le bras et une confiance à 73. L'année suivante, ton remplaçant a fait ce que tu refusais. L'amende est arrivée en septembre. Le jeu ne récompense pas toujours ceux qui ont raison trop tôt. La vraie vie non plus. Rejoue, et présente tes données plus tôt."
      stamp={false}
    />
  </div>
);
