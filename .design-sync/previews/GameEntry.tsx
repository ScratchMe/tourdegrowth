import { GameEntry } from "tour-de-growth";

/*
 * The offer to play the game, on a result page whose stalling stage has a
 * level. It is NOT a third call to action: flat paper, a secondary button,
 * and a thin band of the night world across its top showing the object of
 * the game in one glance — the churn the CEO watches, and the trust that is
 * missing from his dashboard (the empty cell is drawn, not a glyph).
 *
 * Copy is the brief's own (content/game/entry.ts), in both languages.
 */

const wrap = { maxWidth: 560 } as const;

export const English = () => (
  <div style={wrap}>
    <GameEntry
      href="/en/game/retention?from=result"
      title="The dark side of retention"
      body="Now you know what to do. Here is what not to do: play a year as the growth PM of a streaming app, with a CEO who wants the number, and eight tricks you will recognise everywhere afterwards."
      cta={'Play the level "If they come back"'}
      meta="twenty minutes, free"
      band={{ churn: "Churn 6.0%", trust: "Trust", notOnDashboard: "not on your dashboard" }}
      event={{ name: "game_entry_clicked", detail: "result/retention" }}
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
      href="/fr/game/retention?from=deep_dive"
      title="Le côté obscur de la rétention"
      body="Tes recommandations sont au-dessus. Voici ce qu'il ne faut pas faire : joue une année comme PM growth d'une appli de streaming, un DG qui veut du chiffre, et huit astuces que tu reconnaîtras ensuite partout."
      cta="Jouer le niveau « S'ils reviennent »"
      meta="vingt minutes, gratuit"
      band={{ churn: "Résiliations 6,0 %", trust: "Confiance", notOnDashboard: "pas sur ton dashboard" }}
      event={{ name: "game_entry_clicked", detail: "deep_dive/retention" }}
    />
  </div>
);

/**
 * Under 520px of CARD width (a container query, not the viewport: the right
 * column is narrow on small desktops too) the band's two items stack instead
 * of wrapping — a wrap left the "·" dangling at the end of the first line —
 * and the mention drops under the button.
 */
export const Narrow = () => (
  <div style={{ maxWidth: 342 }}>
    <GameEntry
      href="/fr/game/retention?from=result"
      title="Le côté obscur de la rétention"
      body="Tu sais maintenant quoi faire. Voici ce qu'il ne faut pas faire : joue une année comme PM growth d'une appli de streaming."
      cta="Jouer le niveau « S'ils reviennent »"
      meta="vingt minutes, gratuit"
      band={{ churn: "Résiliations 6,0 %", trust: "Confiance", notOnDashboard: "pas sur ton dashboard" }}
      event={{ name: "game_entry_clicked", detail: "result/retention" }}
    />
  </div>
);
