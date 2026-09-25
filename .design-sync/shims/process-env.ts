/*
 * A `process.env` for the design-system bundle — listed FIRST in
 * `cfg.extraEntries`, and it has to stay first.
 *
 * `SiteFooter` reads `process.env.TDG_GAME_OPEN_AT_BUILD` at module scope:
 * the literal form Next inlines at build time (the game link exists only if
 * the game was open when the site was built). The converter's esbuild pass
 * defines `process.env.NODE_ENV` and nothing else, so in the IIFE that line
 * was a real read of a global that does not exist in a browser — a
 * `ReferenceError` thrown while the bundle evaluates, BEFORE
 * `window.TourDeGrowth` is assigned. Same symptom as the `next/link` trap in
 * NOTES.md: every component missing, every preview blank, one root cause.
 *
 * The converter's bundle entry is `export * from <each extraEntry>` followed
 * by the component entry, and ES modules evaluate in import order — so this
 * module runs before any component module does. An empty `env` gives the
 * footer exactly what production gives it while the game is closed: no game
 * link. Nothing else in the component graph reads `process`.
 */
const g = globalThis as { process?: { env: Record<string, string | undefined> } };
g.process ??= { env: {} };

/** Marker export — the module has to export something to be a valid entry. */
export const DS_PROCESS_ENV = "tour-de-growth/process-env";
