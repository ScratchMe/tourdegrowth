import { RevealCells } from "tour-de-growth";

/*
 * December's three paper tiles: churn in December, and the two counters the
 * night never showed — subscriber trust and the regulator radar — with the
 * honesty note right under them (these are game numbers, not a study). The
 * unblur plays once in the page; these stills show the settled state.
 */

const box = { padding: 24, maxWidth: 760 } as const;

/** A dark year: churn looks fine, trust and radar say otherwise. */
export const DarkYear = () => (
  <div style={box}>
    <RevealCells
      figures={{ churn: "4.1%", trust: "18 / 100", radar: "81 / 100" }}
      labels={{ churn: "Churn in December", trust: "Subscriber trust", radar: "Regulator radar" }}
      note="Game numbers: a simple model written in code, not a study."
    />
  </div>
);

/** A clean year, in French. (On a phone viewport under 560px the three tiles stack; this canvas shows them in a row.) */
export const CleanYearFrench = () => (
  <div style={box}>
    <RevealCells
      figures={{ churn: "4,4 %", trust: "71 / 100", radar: "6 / 100" }}
      labels={{ churn: "Résiliations en décembre", trust: "Confiance des abonnés", radar: "Radar DGCCRF" }}
      note="Chiffres du jeu : un modèle simple écrit dans le code, pas une étude."
    />
  </div>
);
