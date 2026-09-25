import { Playbook } from "tour-de-growth";

/*
 * What you did clean: a flat paper card listing the honest cards played and
 * what each did, the count of the CEO's orders refused, and the closing
 * sentence that says what the game was measuring. Each card carries the
 * hidden effect the dashboard never showed (trust up, radar down). The
 * title changes with the ending (worked / could have been enough); the list never ranks.
 */

const box = { padding: 24, maxWidth: 720 } as const;

/** A winning year. */
export const ThatWorked = () => (
  <div style={box}>
    <Playbook
      eyebrow="What you did clean"
      title="The playbook that worked"
      refused="CEO orders refused: 3 out of 4."
      items={[
        { id: "pause", name: "Pause offer", effects: ["trust +4", "radar −2"] },
        { id: "survey", name: "Exit survey", effects: ["trust +2"] },
        { id: "three", name: "Three-click cancellation", effects: ["trust +10", "radar −20"] },
      ]}
      closing="In the game, every honest action pays less this quarter and more over the year, because it raises a counter the dashboard doesn't show. In real life, that's exactly the kind of thing you test."
    />
  </div>
);

/** A lost year, in French: the same list under the other title. */
export const CouldHaveBeenEnoughFrench = () => (
  <div style={box}>
    <Playbook
      eyebrow="Ce que tu as fait de propre"
      title="Ce qui aurait pu suffire, avec du temps"
      refused="Ordres du DG refusés : 4 sur 4."
      items={[
        { id: "onboard", name: "Chantier onboarding", effects: ["confiance +3"] },
        { id: "pause", name: "Offre de pause", effects: ["confiance +4", "radar −2"] },
      ]}
      closing="Dans le jeu, chaque action honnête rapporte moins ce trimestre et davantage sur l'année, parce qu'elle fait monter un compteur que le dashboard n'affiche pas."
    />
  </div>
);
