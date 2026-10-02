import { DgFace, NightSurface } from "tour-de-growth";

/*
 * The CEO, drawn — decorative for assistive technology: what he says is
 * always in a caption, and his mood is never the only carrier of meaning.
 * Four moods, and a mood is two brows and a mouth, switched by `data-mood`
 * in CSS, never a second drawing. Colours come from --dg-* tokens; no hex.
 *
 * Every mood shown is one the island passes for a state a reference year
 * reaches (lib/game/__tests__/paths.ts): on the call, `moodNow(level, desk)`
 * (lib/game/model.ts); beside his closing line, the quarter's `mood` from
 * `reportContent` / `newsContent` (_island/island-view.ts).
 */

const MOODS = ["calm", "firm", "angry", "cold"] as const;
const caption = { font: "var(--meta-xs)", textTransform: "uppercase", letterSpacing: "var(--meta-tracking)" } as const;

/**
 * `avatar` — the head alone, 40px, beside his closing line in the quarter
 * report and on the news screen (GameIsland.tsx; the journal draws no face).
 * It carries classes only and no ids, so any number can sit on a page: this
 * is where the four moods are compared side by side. Each is a quarter's
 * end mood the model reaches: calm after reference year C's first quarter
 * (target hit), firm after its second (hit again), angry after reference
 * year A's first (missed), cold after reference year D's second (fired).
 */
export const Avatars = () => (
  <NightSurface as="div" style={{ padding: 20, display: "flex", gap: 24 }}>
    {MOODS.map((mood) => (
      <div key={mood} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <DgFace mood={mood} framing="avatar" />
        <span style={caption}>{mood}</span>
      </div>
    ))}
  </NightSurface>
);

/**
 * `framing="call"` (the default) — the whole call, 16:9, with the office behind him. ONE per page:
 * its strokes and filters carry ids that are unique only once, which is why
 * the moods are compared on the avatars and not on four calls. Firm: the
 * year's first call (`fresh(level)`, every reference year's first state).
 */
export const Call = () => (
  <NightSurface as="div" style={{ padding: 20, maxWidth: 480 }}>
    <DgFace mood="firm" />
  </NightSurface>
);
