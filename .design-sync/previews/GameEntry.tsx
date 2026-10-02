import { GameEntry } from "tour-de-growth";

/*
 * The offer to play the game, on a result page whose stalling stage has a
 * level. It is NOT a third call to action: flat paper, a secondary button,
 * and a thin band of the night world across its top showing the object of
 * the game in one glance — the churn the CEO watches, and the trust that is
 * missing from his dashboard (the empty cell is drawn, not a glyph). Above
 * the card, outside the band, « In the game » / « Dans le jeu » says those
 * numbers are the game's, not the reader's (C33, 2026-10-01).
 *
 * Copy is content/game/entry.ts, in both languages: the brief's own for a
 * one-level card, the code session's for the card offering several.
 *
 * `levels` holds what the card offers, lowest stage first: one level is the
 * brief's card; several (stages tied at the bottom that each have a level,
 * C30 Q5) is one card offering them all, stage by stage.
 */

const wrap = { maxWidth: 560 } as const;

export const English = () => (
  <div style={wrap}>
    <GameEntry
      eyebrow="In the game"
      title="The dark side of retention"
      body="Now you know what to do. Here is what not to do: play a year as the growth PM of a streaming app, with a CEO who wants the number, and eight tricks you will recognise everywhere afterwards."
      meta="twenty minutes, free"
      band={{ trust: "Trust", notOnDashboard: "not on your dashboard" }}
      levels={[
        {
          stage: "Retention",
          href: "/en/game/retention?from=result",
          cta: 'Play the level "If they come back"',
          metric: "Churn 6.0%",
          event: { name: "game_entry_clicked", detail: "result/retention" },
        },
      ]}
    />
  </div>
);

/**
 * French, which runs longer — the band still holds on one line at this width.
 * The Deep dive variant of the opening sentence ("Tes recommandations sont
 * au-dessus"), and the door it counts as (`deep_dive/retention`).
 */
export const French = () => (
  <div style={wrap}>
    <GameEntry
      eyebrow="Dans le jeu"
      title="Le côté obscur de la rétention"
      body="Tes recommandations sont au-dessus. Voici ce qu'il ne faut pas faire : joue une année comme PM growth d'une appli de streaming, un DG qui veut du chiffre, et huit astuces que tu reconnaîtras ensuite partout."
      meta="vingt minutes, gratuit"
      band={{ trust: "Confiance", notOnDashboard: "pas sur ton dashboard" }}
      levels={[
        {
          stage: "Retention",
          href: "/fr/game/retention?from=deep_dive",
          cta: "Jouer le niveau « S'ils reviennent »",
          metric: "Résiliations 6,0 %",
          event: { name: "game_entry_clicked", detail: "deep_dive/retention" },
        },
      ]}
    />
  </div>
);

/**
 * Under 520px of CARD width (a container query, not the viewport: the right
 * column is narrow on small desktops too) the band's two items stack instead
 * of wrapping — a wrap left the "·" dangling at the end of the first line —
 * and the mention drops under the button. Under 350px the game's sign leaves
 * the band too, so the two figures keep their room.
 */
export const Narrow = () => (
  <div style={{ maxWidth: 342 }}>
    <GameEntry
      eyebrow="Dans le jeu"
      title="Le côté obscur de la rétention"
      body="Tu sais maintenant quoi faire. Voici ce qu'il ne faut pas faire : joue une année comme PM growth d'une appli de streaming, un DG qui veut du chiffre, et huit astuces que tu reconnaîtras ensuite partout."
      meta="vingt minutes, gratuit"
      band={{ trust: "Confiance", notOnDashboard: "pas sur ton dashboard" }}
      levels={[
        {
          stage: "Retention",
          href: "/fr/game/retention?from=result",
          cta: "Jouer le niveau « S'ils reviennent »",
          metric: "Résiliations 6,0 %",
          event: { name: "game_entry_clicked", detail: "result/retention" },
        },
      ]}
    />
  </div>
);

/**
 * Two stages tied at the bottom, each with its level (C30 Q5): one card offers
 * both, lowest stage first. The band lists both numbers before the missing
 * trust; each stage has its row, its name before its button; the mention
 * comes once. The reader chooses — AARRR order does not choose for them.
 */
export const TwoLevels = () => (
  <div style={wrap}>
    <GameEntry
      eyebrow="In the game"
      title="The dark side of your stages"
      body="Now you know what to do. Here is what not to do: a level for each of the stages below, a year as a growth PM, a CEO who wants the number, and eight tricks a level you will recognise everywhere afterwards."
      meta="twenty minutes a level, free"
      band={{ trust: "Trust", notOnDashboard: "not on your dashboard" }}
      levels={[
        {
          stage: "Acquisition",
          href: "/en/game/acquisition?from=result",
          cta: 'Play the level "How people find you"',
          metric: "New customers 2,000",
          event: { name: "game_entry_clicked", detail: "result/acquisition" },
        },
        {
          stage: "Retention",
          href: "/en/game/retention?from=result",
          cta: 'Play the level "If they come back"',
          metric: "Churn 6.0%",
          event: { name: "game_entry_clicked", detail: "result/retention" },
        },
      ]}
    />
  </div>
);

/** The same card in French at phone width: the band's items stack, each row puts its button under its stage. */
export const TwoLevelsNarrow = () => (
  <div style={{ maxWidth: 342 }}>
    <GameEntry
      eyebrow="Dans le jeu"
      title="Le côté obscur de tes étapes"
      body="Tes recommandations sont au-dessus. Voici ce qu'il ne faut pas faire : un niveau pour chacune des étapes ci-dessous, une année comme PM growth, un DG qui veut du chiffre, et huit astuces par niveau que tu reconnaîtras ensuite partout."
      meta="vingt minutes par niveau, gratuit"
      band={{ trust: "Confiance", notOnDashboard: "pas sur ton dashboard" }}
      levels={[
        {
          stage: "Acquisition",
          href: "/fr/game/acquisition?from=deep_dive",
          cta: "Jouer le niveau « Comment les gens vous trouvent »",
          metric: "Nouveaux clients 2 000",
          event: { name: "game_entry_clicked", detail: "deep_dive/acquisition" },
        },
        {
          stage: "Retention",
          href: "/fr/game/retention?from=deep_dive",
          cta: "Jouer le niveau « S'ils reviennent »",
          metric: "Résiliations 6,0 %",
          event: { name: "game_entry_clicked", detail: "deep_dive/retention" },
        },
      ]}
    />
  </div>
);
