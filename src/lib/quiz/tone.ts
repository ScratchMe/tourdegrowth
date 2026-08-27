/**
 * SPEC.md §6bis: "neutral" ("Straight up") is the explicit default; "roast"
 * is opt-in. Lives here (not in the ToneSelector component) so lib-layer
 * code (submissions, Gemini prompts) can reference it without importing a
 * "use client" component file.
 */
export type Tone = "neutral" | "roast";
