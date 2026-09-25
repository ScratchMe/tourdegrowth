import { GameJournal, NightSurface } from "tour-de-growth";

/*
 * The year's journal: one row per quarter played, first first. The row
 * carries the period and the churn it ended on with its verdict in words;
 * the two cards and what happened (one sentence each) sit behind the row's
 * disclosure, closed in these stills. With no quarter played yet it renders
 * nothing at all, so there is no empty state to draw.
 */

const box = { padding: 24, maxWidth: 640 } as const;

/** Two quarters in: one missed, one hit — the tone repeats the words. */
export const TwoQuarters = () => (
  <NightSurface as="div" style={box}>
    <GameJournal
      title="The year's journal"
      entries={[
        {
          q: 1,
          period: "Quarter 1 · January to March",
          result: { text: "5.7% · missed by 0.1 pt", tone: "bad" },
          picked: ["Pause offer", "Exit survey"],
          lines: [
            "Pause offer: −5% churn this quarter, and the effect is still growing",
            'The CEO: "That\'s not what we agreed."',
          ],
        },
        {
          q: 2,
          period: "Quarter 2 · April to June",
          result: { text: "5.0% · target hit", tone: "good" },
          picked: ["Data review with the CEO", "Pre-billing reminder"],
          lines: [
            "Your presentation to the CEO held up: data, a curve, a request for time. He gives you some.",
            'The CEO: "Well played."',
          ],
        },
      ]}
    />
  </NightSurface>
);

/** In French, one quarter. */
export const OneQuarterFrench = () => (
  <NightSurface as="div" style={box}>
    <GameJournal
      title="Journal de l'année"
      entries={[
        {
          q: 1,
          period: "Trimestre 1 · janvier à mars",
          result: { text: "5,7 % · manqué de 0,1 pt", tone: "bad" },
          picked: ["Offre de pause", "Questionnaire de sortie"],
          lines: [
            "Offre de pause : −5 % de résiliations ce trimestre, l'effet monte encore",
            "Le DG : « Ce n'est pas ce qu'on avait dit. »",
          ],
        },
      ]}
    />
  </NightSurface>
);
