/*
 * Pulls the design tokens into the bundle through the JS graph.
 *
 * `globals.css` is the token entry: it `@import`s the five files in
 * `src/styles/tokens/`. Handing it to the converter as `cfg.cssEntry` APPENDS
 * it verbatim to `_ds_bundle.css`, where its `../styles/tokens/*` paths no
 * longer resolve (they were relative to `src/app/`) — the bundle then shipped
 * component CSS with every `var(--paint-red)` undefined.
 *
 * Imported from the JS entry instead, esbuild resolves and INLINES the whole
 * `@import` chain, exactly as it already does for each component's
 * `.module.css`. Wired through `cfg.extraEntries`.
 *
 * `tokensGlob` cannot do this job: `copyTokens` returns early unless
 * `tokensPkg` names a package under `node_modules`, and these tokens live in
 * the repo.
 */
import "../../src/app/globals.css";

/** Marker export — the module has to export something to be a valid entry. */
export const DS_STYLES = "tour-de-growth/tokens";
