import { Playbook } from "tour-de-growth";

/*
 * What you did clean: a flat paper card listing the honest cards played and
 * what each did, the count of the CEO's orders refused, and the closing
 * sentence that says what the game was measuring. Each card carries the
 * hidden effect the dashboard never showed (trust up, radar down) — none
 * for the data review, which moves neither. The title changes with the
 * ending (worked / could have been enough); the list never ranks.
 *
 * Both stories are finished years played through the reducer
 * (lib/game/__tests__/paths.ts) and built by island-view.ts
 * `decemberContent`. Copy: content/game/retention.ts (`playbook`).
 */

const box = { padding: 24, maxWidth: 720 } as const;

/** The winning year (paths.ts PATH_A, ending "applause"): seven honest cards, every order refused. */
export const ThatWorked = () => (
  <div style={box}>
    <Playbook
      eyebrow="What you did clean"
      title="The playbook that worked"
      refused="CEO orders refused: 3 out of 3."
      items={[
        { id: "pause", name: "Pause offer", effects: ["trust +4", "radar −2"] },
        { id: "survey", name: "Exit survey", effects: ["trust +2"] },
        { id: "onboard", name: "Onboarding project", effects: ["trust +3"] },
        { id: "present", name: "Data review with the CEO", effects: [] },
        { id: "annual", name: "Annual plan", effects: ["trust +3"] },
        { id: "reco", name: "Recommendations project", effects: ["trust +3"] },
        { id: "remind", name: "Pre-billing reminder", effects: ["trust +8", "radar −8"] },
      ]}
      closing="In the game, every honest action pays less this quarter and more over the year, because it raises a counter the dashboard doesn't show. In real life, that's exactly the kind of thing you test."
    />
  </div>
);

/**
 * A year that ended fined, in French (paths.ts PATH_C, ending "fine"): the
 * other title, and only the two honest cards that year played.
 */
export const CouldHaveBeenEnoughFrench = () => (
  <div style={box}>
    <Playbook
      eyebrow="Ce que tu as fait de propre"
      title="Ce qui aurait pu suffire, avec du temps"
      refused="Ordres du DG refusés : 1 sur 3."
      items={[
        { id: "pause", name: "Offre de pause", effects: ["confiance +4", "radar −2"] },
        { id: "remind", name: "Rappel avant prélèvement", effects: ["confiance +8", "radar −8"] },
      ]}
      closing="Dans le jeu, chaque action honnête rapporte moins ce trimestre et davantage sur l'année, parce qu'elle fait monter un compteur que le dashboard n'affiche pas. Dans la vraie vie, c'est exactement le genre de chose qui se teste."
    />
  </div>
);
