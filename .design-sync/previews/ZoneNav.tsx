import { ZoneNav } from "tour-de-growth";

/*
 * The game hub's five zones, one per AARRR stage, on paper. The Tour's stage
 * name stays untranslated in both languages; the game's question form of the
 * zone is translated. A zone that can be played is a link; one that cannot
 * is text with a word ("coming soon") — never a greyed link. On a phone
 * (under 760px of viewport) the five columns give way to `compactLabel`;
 * this canvas shows the wide layout.
 */

/** Level 1 of the game: only Retention is playable, and it is the current zone. */
export const RetentionOpen = () => (
  <div style={{ padding: 24 }}>
    <ZoneNav
      label="The five zones of the Tour de Growth"
      compactLabel="Zone 3/5 · Retention — If they come back"
      items={[
        { id: "acquisition", pillar: "Acquisition", question: "How people find you", soonLabel: "coming soon" },
        { id: "activation", pillar: "Activation", question: "How they understand what you bring", soonLabel: "coming soon" },
        { id: "retention", pillar: "Retention", question: "If they come back", href: "/en/game/retention", current: true },
        { id: "referral", pillar: "Referral", question: "If they recommend you", soonLabel: "coming soon" },
        { id: "revenue", pillar: "Revenue", question: "How you make money", soonLabel: "coming soon" },
      ]}
    />
  </div>
);

/** In French — the longest question form ("Comment ils comprennent…"). */
export const French = () => (
  <div style={{ padding: 24 }}>
    <ZoneNav
      label="Les cinq zones de Tour de Growth"
      compactLabel="Zone 3/5 · Retention — S'ils reviennent"
      items={[
        { id: "acquisition", pillar: "Acquisition", question: "Comment les gens vous trouvent", soonLabel: "bientôt" },
        { id: "activation", pillar: "Activation", question: "Comment ils comprennent ce que vous apportez", soonLabel: "bientôt" },
        { id: "retention", pillar: "Retention", question: "S'ils reviennent", href: "/fr/game/retention", current: true },
        { id: "referral", pillar: "Referral", question: "S'ils vous recommandent", soonLabel: "bientôt" },
        { id: "revenue", pillar: "Revenue", question: "Comment vous gagnez de l'argent", soonLabel: "bientôt" },
      ]}
    />
  </div>
);
