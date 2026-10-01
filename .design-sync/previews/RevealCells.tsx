import { RevealCells } from "tour-de-growth";

/*
 * December's three paper tiles: churn in December, and the two counters the
 * night never showed — subscriber trust and the regulator radar — with the
 * honesty note right under them (these are game numbers, not a study). The
 * unblur plays once in the page; these stills show the settled state.
 */

const box = { padding: 24, maxWidth: 760 } as const;

/**
 * A dark year that looks fine: churn ends on the board's 4.0% target, while
 * trust has fallen under the viral line and the radar sits at 74 — the maze
 * ending. A year played through the reducer, found by search, not a
 * reference year: onboard + reco, call + bury, cascade + shame, pdef + social.
 * Built by `decemberContent`.
 */
export const DarkYear = () => (
  <div style={box}>
    <RevealCells
      figures={{ metric: "4.0%", trust: "31 / 100", radar: "74 / 100" }}
      labels={{ metric: "Churn in December", trust: "Subscriber trust", radar: "Regulator radar" }}
      note="Game numbers: a simple model written in code, not a study."
    />
  </div>
);

/**
 * A clean year, in French: reference year A (lib/game/__tests__/paths.ts),
 * the applause — the board's 4,0 % reached with trust at 83 and the radar
 * at zero. (The tiles stack when the row itself is 520px wide or less — a
 * container query, about a 560px window in the page; this card is wider, so
 * they sit in a row.)
 */
export const CleanYearFrench = () => (
  <div style={box}>
    <RevealCells
      figures={{ metric: "4,0 %", trust: "83 / 100", radar: "0 / 100" }}
      labels={{ metric: "Résiliations en décembre", trust: "Confiance des abonnés", radar: "Radar DGCCRF" }}
      note="Chiffres du jeu : un modèle simple écrit dans le code, pas une étude."
    />
  </div>
);
