import { DgFace, NightSurface } from "tour-de-growth";

/*
 * The CEO, drawn — decorative for assistive technology: what he says is
 * always in a caption, and his mood is never the only carrier of meaning.
 * Four moods, and a mood is two brows and a mouth, switched by `data-mood`
 * in CSS, never a second drawing. Colours come from --dg-* tokens; no hex.
 */

const MOODS = ["calm", "firm", "angry", "cold"] as const;
const caption = { font: "var(--meta-xs)", textTransform: "uppercase", letterSpacing: "var(--meta-tracking)" } as const;

/**
 * `avatar` — the head alone, 40px, for his line in the quarter report and the
 * journal. It carries classes only and no ids, so any number can sit on a
 * page: this is where the four moods are compared side by side.
 */
export const Avatars = () => (
  <NightSurface as="div" style={{ padding: 20, display: "flex", gap: 24 }}>
    {MOODS.map((mood) => (
      <div key={mood} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <DgFace mood={mood} size="avatar" />
        <span style={caption}>{mood}</span>
      </div>
    ))}
  </NightSurface>
);

/**
 * `frame` — the whole call, 16:9, with the office behind him. ONE per page:
 * its strokes and filters carry ids that are unique only once, which is why
 * the moods are compared on the avatars and not on four frames.
 */
export const Frame = () => (
  <NightSurface as="div" style={{ padding: 20, maxWidth: 480 }}>
    <DgFace mood="firm" />
  </NightSurface>
);
