import { ZoneNav } from "tour-de-growth";

/*
 * The game's five zones, one per AARRR stage, on paper, at the top of a
 * level's page. The Tour's stage name stays untranslated in both languages;
 * the game's question form of the zone is translated. The zone being played
 * leads back to the hub, another open level leads to that level, and a zone
 * with no level yet is text with a word (« Bientôt ») — never a greyed link.
 * On a phone (under 760px of viewport) the five columns give way to
 * `compactLabel`; this canvas shows the wide layout.
 *
 * Props as `_level/LevelPage.tsx` builds them since level 2 opened
 * (2026-10-01): `GAME_HUB.zonesTitle`, `GAME_HUB.zones`, `GAME_HUB.soon`,
 * and `otherLevelHref` for the other open level.
 */

/** Level 1's page: Retention is the zone being played; Acquisition, open too, links to its level. */
export const LevelOne = () => (
  <div style={{ padding: 24 }}>
    <ZoneNav
      label="The five zones of the Tour"
      compactLabel="Zone 3/5 · Retention — If they come back"
      items={[
        { id: "acquisition", pillar: "Acquisition", question: "How people find you", href: "/en/game/acquisition?from=other_level" },
        { id: "activation", pillar: "Activation", question: "How they understand what you bring", soonLabel: "Coming soon" },
        { id: "retention", pillar: "Retention", question: "If they come back", href: "/en/game", current: true },
        { id: "referral", pillar: "Referral", question: "If they recommend you", soonLabel: "Coming soon" },
        { id: "revenue", pillar: "Revenue", question: "How you make money", soonLabel: "Coming soon" },
      ]}
    />
  </div>
);

/** Level 2's page, in French — Acquisition is played, Retention links back to Flixo's year; the longest question form is Activation's. */
export const LevelTwoFrench = () => (
  <div style={{ padding: 24 }}>
    <ZoneNav
      label="Les cinq zones du Tour"
      compactLabel="Zone 1/5 · Acquisition — Comment les gens vous trouvent"
      items={[
        { id: "acquisition", pillar: "Acquisition", question: "Comment les gens vous trouvent", href: "/fr/game", current: true },
        { id: "activation", pillar: "Activation", question: "Comment ils comprennent ce que vous apportez", soonLabel: "Bientôt" },
        { id: "retention", pillar: "Retention", question: "S'ils reviennent", href: "/fr/game/retention?from=other_level" },
        { id: "referral", pillar: "Referral", question: "S'ils vous recommandent", soonLabel: "Bientôt" },
        { id: "revenue", pillar: "Revenue", question: "Comment vous gagnez de l'argent", soonLabel: "Bientôt" },
      ]}
    />
  </div>
);
