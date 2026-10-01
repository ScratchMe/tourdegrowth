import { NightSurface, ResumePrompt } from "tour-de-growth";

/*
 * Takes the call's place, at night, when a save with at least one quarter
 * played is found on the device: a question, what happened before (one line
 * per quarter), and two actions — resume is the primary, start over the
 * secondary. Nothing is stored anywhere but this browser.
 *
 * Each story is `resumeContent(ctx, saved)` (_island/island-view.ts) for a
 * save a reference year leaves (lib/game/__tests__/paths.ts), as
 * GameIsland.tsx passes it: `title`, `previously`, and the two labels.
 */

const noop = () => {};
const box = { padding: 24, maxWidth: 620 } as const;

/** Two quarters played: resume or start over. Reference year A saved after its second quarter. */
export const MidYear = () => (
  <NightSurface as="div" style={box}>
    <ResumePrompt
      title="Pick up the year where you left it?"
      previously={{
        heading: "Previously at Flixo",
        lines: [
          "Quarter 1: Pause offer, Exit survey. Churn at 5.8%.",
          "Quarter 2: Onboarding project, Data review with the CEO. Churn at 5.7%.",
        ],
      }}
      accept={{ label: "Resume", onClick: noop }}
      restart={{ label: "Start over", onClick: noop }}
    />
  </NightSurface>
);

/** A finished year, in French: the last headline, and the review offered again. Reference year A, whole (ending `applause`). */
export const FinishedYearFrench = () => (
  <NightSurface as="div" style={box}>
    <ResumePrompt
      title="Ta dernière année chez Flixo s'est terminée ainsi : « Tu as tenu. Et ça a marché. »"
      accept={{ label: "Revoir le bilan", onClick: noop }}
      restart={{ label: "Rejouer l'année", onClick: noop }}
    />
  </NightSurface>
);
