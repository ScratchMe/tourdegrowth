import { GameJournal, NightSurface } from "tour-de-growth";

/*
 * The year's journal: one row per quarter played, first first. The row
 * carries the period and the churn it ended on, against its target, with its
 * verdict in words; the two cards and what happened sit behind the row's
 * disclosure, closed in these stills (every quarter starts closed). With no
 * quarter played yet it renders nothing at all, so there is no empty state to
 * draw.
 *
 * Entries are what the island builds (`journalEntries`) from a reference year.
 */

const box = { padding: 24, maxWidth: 640 } as const;

/** Reference year M after two quarters: Q1 hit, Q2 missed — the tone repeats the words. */
export const TwoQuarters = () => (
  <NightSurface as="div" style={box}>
    <GameJournal
      title="The year so far"
      entries={[{"q": 1, "period": "Quarter 1 · January to March", "result": {"text": "5.4% · target 5.6% · target hit", "tone": "good"}, "picked": ["Pause up front", "Pause offer"], "lines": ["Pause up front: −6% churn this quarter", "Pause offer: −4% churn this quarter, and the effect is still growing", "Message from the CEO, mid-quarter: \"It's moving. Keep going.\"", "The CEO: \"Well played.\""]}, {"q": 2, "period": "Quarter 2 · April to June", "result": {"text": "5.5% · target 5.1% · missed by 0.4 pts", "tone": "bad"}, "picked": ["Exit survey", "Onboarding project"], "lines": ["Exit survey: three months of answers, below", "Onboarding project: nothing visible this quarter", "Message from the CEO, mid-quarter: \"I can see this week's numbers. It isn't moving enough.\"", "The exit survey's answers are in: 4 leavers in 10 have \"nothing to watch\", 3 in 10 find Flixo \"too expensive\". Your next projects will aim better, and you finally have something to show the CEO: \"Data review with the CEO\" is unlocked.", "A competitor launched an aggressive offer in the spring. Everyone lost subscribers this quarter, you included.", "The CEO: \"That's not what we agreed.\" \"You didn't do what I asked. I've made a note of it.\""]}]}
    />
  </NightSurface>
);

/** In French, reference year A after one quarter (missed). */
export const OneQuarterFrench = () => (
  <NightSurface as="div" style={box}>
    <GameJournal
      title="Journal de l'année"
      entries={[{"q": 1, "period": "Trimestre 1 · janvier à mars", "result": {"text": "5,8 % · objectif 5,6 % · manqué de 0,2 pt", "tone": "bad"}, "picked": ["Offre de pause", "Questionnaire de sortie"], "lines": ["Offre de pause : −4 % de résiliations ce trimestre, l'effet monte encore", "Questionnaire de sortie : trois mois de réponses, à lire ci-dessous", "Message du DG, à mi-trimestre : « Je vois les chiffres de la semaine. Ça ne bouge pas assez. »", "Les réponses du questionnaire sont arrivées : 4 partants sur 10 n'ont « rien à regarder », 3 sur 10 trouvent Flixo « trop cher ». Tes prochains chantiers viseront plus juste, et tu as enfin de quoi montrer au DG : « Point données avec le DG » est débloqué.", "Le DG : « Ce n'est pas ce qu'on avait dit. »"]}]}
    />
  </NightSurface>
);
