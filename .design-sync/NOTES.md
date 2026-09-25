# design-sync notes — Tour de Growth

Repo-specific gotchas for `/design-sync`. Read this before re-running.

## This repo is an app, not a component package

There is no `dist/`, no `exports`, no `main`, no Storybook. The design system
lives at `src/components/**` and is consumed only by the Next app in the same
repo. Consequences, all already encoded in `config.json`:

- **`--entry` must be given, and must NOT exist.** The converter derives
  `PKG_DIR` by walking up from `dirname(--entry)` to the nearest named
  `package.json`; without `--entry` it looks for `node_modules/tour-de-growth`
  and dies with `ENOENT`. But if `--entry` *resolves*, `resolveDistEntry`
  succeeds and the synth-from-src path never runs — you get
  `[ZERO_MATCH] no component exports` and a tokens-only bundle. So pass a
  deliberately absent path inside the repo:

  ```sh
  node .ds-sync/package-build.mjs --config .design-sync/config.json \
    --node-modules ./node_modules --entry ./dist/index.js --out ./ds-bundle
  ```

  The `[NO_DIST] --entry ./dist/index.js doesn't exist` line is expected, not
  a failure.
- **`srcDir` is `src/components`, not `src`.** Scanning all of `src/` sweeps
  in every page component (`ResultPage`, `RootShell`, `PreviewCard`, …). The
  seven subdirectories become the seven groups the repo already uses —
  `brand`, `core`, `game`, `glossary`, `quiz`, `result`, `viz` — because
  `GENERIC_DIR` in `lib/source-kit.mjs` skips a `components/` level. The
  game's engine components live under `src/app/**/_engine` and are out of
  `srcDir` on purpose: they read game state, they are not primitives.
- **`cfg.buildCmd` emits declarations, and it is load-bearing.** It runs
  `npx tsc -p .design-sync/tsconfig.dts.json`, which writes real `.d.ts` into
  `dist/types/`. That is where the emitted contracts come from — see
  "The emitted contracts come from `dist/types`" below for what happens
  without it. `npm run build` builds the *app* and produces nothing the
  converter uses.

## `next/link` is shimmed — this is the one that costs a whole afternoon

Six components render a Next `Link` when given an `href` (`Button`,
`WordmarkLink`, `LocaleSwitcher`, `SiteFooter`, `TrackedLink`, `LegalPage`).
Next's compiler replaces a dozen `process.env.__NEXT_*` constants inside that
module; plain esbuild leaves them as real reads, so the IIFE threw
`ReferenceError: process is not defined` **before assigning
`window.TourDeGrowth`**. Symptom: `[BUNDLE_EXPORT] 35/35 not a component`
plus `[RENDER_ERRORS]` on all 35 previews — one root cause, 36 error lines.

`.design-sync/shims/next-link.tsx` renders the `<a href>` that `next/link`
renders anyway; what it drops is client-side routing, which a design canvas
has no use for. Wired by `paths` in `.design-sync/tsconfig.ds.json`. Bundle
went 280 KB → 127 KB (the whole router graph left with it).

**`tsconfig.ds.json` must be standalone and must contain no `"//"` key.**
`tsconfigPathsPlugin` reads the file directly — it does not follow `extends`,
so the `@/*` alias has to be repeated there. And its comment-stripper
(`/(^|[^:])\/\/.*$/gm`) eats a `"//": "..."` documentation key, the JSON then
fails to parse, and the plugin returns `null` **silently**: no alias fires,
`next/link` comes back, and nothing in the log says why. Cost me one full
rebuild to spot.

## Tokens come in through the JS graph, not `cssEntry`

`cfg.cssEntry: src/app/globals.css` **appends** that file verbatim to
`_ds_bundle.css`, where its five `@import "../styles/tokens/*.css"` lines no
longer resolve — `[CSS_IMPORT_MISSING]` ×5 and 95 undefined custom
properties. `cfg.tokensGlob` cannot fix it either: `copyTokens` returns early
unless `cfg.tokensPkg` names a package under `node_modules`, and these tokens
live in the repo.

Fix: `.design-sync/shims/ds-styles.ts` imports `globals.css`, and is wired via
`cfg.extraEntries`. esbuild then resolves and inlines the whole `@import`
chain exactly as it does each component's `.module.css`. Result: 123 tokens
defined against 105 referenced.

## Fonts ship as files

`.design-sync/fonts/` holds four woff2 (104 KB total) and `brand-fonts.css`,
wired through `cfg.extraFonts`. The converter copies them to `ds-bundle/fonts/`
and rewrites the `src` paths.

The app self-hosts these through `next/font/google`, which binds
`--font-ui`/`--font-mono`/`--font-display` on `<body>` at build time. None of
that exists in a canvas, and `typography.css`'s `:root` fallback would have
rendered every design in system-ui, silently.

**Shipped rather than `@import`-ed from the font host**, which is what this
first did: a remote import makes every headless render wait on the network,
and the render check went from about two minutes to an estimated eighteen.

**Inter is ONE file, not four.** Google serves the latin subset as a variable
font and returns the same URL for all four weights — verified against the
css2 endpoint, not assumed. It is declared once as `font-weight: 100 900`,
which instantiates the wght axis; four single-weight faces shipped the same
48 KB four times. Plex Mono is not variable, so 500 and 600 are genuinely
different files. Verified in Chromium by measuring rendered text: Inter gives
four distinct widths across 400/500/600/700, and the two Plex Mono weights
render different pixels (a monospace font has one advance width, so width
alone proves nothing there).

Use `format("woff2")`, not `format("woff2-variations")` — the latter is
deprecated syntax that some parsers reject, and Google's own CSS uses the
plain form for this same variable file.

The five `.ttf` files in `src/lib/og/fonts/` are **not** usable here: they are
~230-glyph subsets cut for Satori's share images. Fine for that image's fixed
strings, a silent glyph hole for anything a designer types.

`"Impact"` shows up in `[FONT_MISSING]` and stays there — it is the middle of
`--font-display: "Stardos Stencil", "Impact", sans-serif`, a system-font
fallback. It is also a proprietary Microsoft face we have no right to
redistribute, so this warning is permanent and correct.

**Font debugging trap.** Fonts are always fetched in CORS mode, and
`page.setContent()` gives a page `origin: null` — so a harness built that way
reports every family falling back to the same substitute, which looks exactly
like broken `@font-face` rules. Serve the test page from the same origin as
the fonts. Three unrelated typefaces measuring identical widths is the tell.

## The emitted contracts come from `dist/types`

`findTypesRoot` prefers `dist/types` over the package root, and the ts-morph
project loads **only `.d.ts`, never `.tsx`**. If `dist/types/` is missing or
stale, the search falls back to the repo root — where the only `.d.ts` files
are the handoff bundles under `design/ds-extension-0{1,3}-return/`. Those
describe the API the design *asked for*, not the one that shipped, and the
converter will happily emit them: measured drift included `ScoreDisplay`
still carrying `verdict` (removed in extension 03), `PriorityMove` missing
`pillar`/`score`/`total`/`upgrade`, and `Button` missing `href`/`compact`.

Check the build log for `[DTS] parsed N .d.ts files from .../dist/types` — if
that path is not `dist/types`, the contracts are wrong.

`tsconfig.dts.json`'s `include` is narrowed to `../src/components/**/*` on
purpose. Widening it reaches `src/proxy.ts` and `lib/i18n/meta.ts`, which
import Next, which pulls in `@vercel/og`'s `declare module 'react'` — and a
Tailwind `tw?: string` prop then appears on 21 of the 34 contracts. Verify
with `grep -rl 'from "next' dist/types/` returning nothing.

`next-env.d.ts` is deliberately out of the graph (it drags in Next's global
JSX augmentation); `.design-sync/types/css-modules.d.ts` replaces the part
that is actually needed.

## `LegalPage` is excluded on purpose

`componentSrcMap: {"LegalPage": null}`. It is the only component with an
inline destructured prop type instead of a named `<Name>Props` interface, so
`propsBodyFor` finds nothing and emits `[key: string]: unknown` — a contract
that says nothing. It also imports a page-level CSS module. It renders whole
legal documents from data and is not a design primitive.

## Every component is pinned in `componentSrcMap` — and a guard keeps it so

The converter has a trap that looks like a config typo. In synth-from-src
mode (`--entry` absent, see above), `lib/source-kit.mjs#resolvePackage`
derives the component list from `srcDir` **only if `componentSrcMap` adds
nothing non-null**. The moment one entry pins a file, the pinned entries
become the WHOLE list. The first DS v3 pass pinned four components to fix
their contracts and the bundle silently shrank from 70 components to 4 —
with 36 previews left pointing at components that no longer existed.

So `componentSrcMap` now pins all 70 exported components to their file
(`"LegalPage": null` stays), and `.design-sync/check-inventory.mjs`, chained
last in `cfg.buildCmd`, fails the build if a component exported from
`src/components/**` is missing from the map, pinned to the wrong file, or
pinned but no longer exported. Its success line is
`[inventory] 70 components pinned, 1 excluded on purpose, none missing`.
Adding a component therefore means adding it to the map, which is the point:
a new component shows up in Claude Design by decision, not by accident.

## `process-env.ts` must stay first in `extraEntries`

`SiteFooter` reads `process.env.TDG_GAME_OPEN_AT_BUILD` at module scope (the
form Next inlines at build time). The converter's esbuild defines only
`NODE_ENV`, so in the IIFE that was a read of a global that does not exist
in a browser: a `ReferenceError` while the bundle evaluates, before
`window.TourDeGrowth` is assigned — every preview blank, one cause.
`.design-sync/shims/process-env.ts` installs an empty `process.env` and is
listed FIRST in `cfg.extraEntries` (ES modules evaluate in import order). The
file's header says the same; do not reorder the list.

## The two standing validate warnings

Both are non-blocking and both are expected:

- `[FONT_MISSING] "Impact"` — the system-font fallback above.
- `[GRID_OVERFLOW] DefinitionPopover (Docked)` — the check is a **property**
  test, not a geometry one: `package-validate.mjs` flags any visible
  descendant with computed `position: fixed`, which the docked placement has
  by design. The suggested fix (`cardMode: "single"`) would show one story and
  hide the other three. The `Docked` story instead frames the sheet in a
  transformed, clipped 300×240 box that stands in for a phone viewport, which
  was **checked in the screenshot** and presents correctly. Keeping the grid
  also keeps the card under `compare.mjs`'s `[PORTAL?]` monitoring, which
  `single` would exempt it from.

Wide components get `cardMode: "column"` in `cfg.overrides` (one full-width
card per story) — 21 of them now: most of `game`, the two charts, `Button`
(its `States` grid) and `GlossaryTerm`. Add one when validate prints
`[GRID_OVERFLOW] … stories render wider than their grid cells`; that warning
is always a real crop. `QuarterReport` and `Hand` were not flagged but still
need it: squeezed into a third-width cell, their desktop layout (chosen by a
viewport media query, not the cell) overlapped its own figure labels.

## Previews are all repo-owned

All 70 live in `.design-sync/previews/` (215 story cells) — none are
generated. Copy is the product's own, pulled from `dictionary.ts`,
`copy-library.ts`, `how-it-works.ts` and, for the game, `content/game/*.ts`
rather than invented, so the cards read as the real product. The game's
numbers follow the real level (`lib/game/levels/retention.ts`: 100,000
subscribers, 6.0% churn, targets 5.6/5.1/4.6/4.0%, each card's trust and
radar effects) and are formatted the way `lib/game/format.ts` formats them.
French strings carry U+00A0 before `: ; ! ? % »`, after `«`, in digit groups
and before units. Check it in Python (`re` on each `"…"` literal, looking for
`[0-9A-Za-zé] [:;!?%»]`, `« ` and `\d \d{3}`), not with `grep -P`: in byte
mode `»`'s first byte is also U+00A0's, so grep reports every correct
insécable as a hit.

Game components that live at night are previewed inside `NightSurface`, so
they get the night tokens exactly as in the page; `EventClipping` stays paper
inside the night, which is its whole point. The paper ones (`ZoneNav`, the
December components) are previewed bare.

Three kinds of state a still cannot show, and each story says so rather than
pretending: **viewport** forms (`ActionBar`'s phone bar with counter and
clicks pill, `ZoneNav`'s compact line, `RevealCells` stacking — all chosen by
`@media`, not by the card width), **closed disclosures** (`ChartFrame`'s
data table, `GameJournal`'s entries, `PatternCatalogue`'s turned-down and
unseen groups), and **hover/press/animation** (`Button`'s `HoverAndPress`,
`VideoCall`'s typing and clock, the December unblur and stamp).

`ShareCard.tsx` imports `share-sample.png`, a real 1200×630 render of
`/r/sample` captured from a production build; esbuild inlines it as a data URI
via the same `.png` loader the bundler uses. **Do not** reuse the OG captures
in `design/ds-extension-03/` for this — they predate extension 03 and still
show the five pillar rows that release removed.

`PillarChip`'s `Stretch` story used to reproduce a real production defect (the
row spaced all four children apart instead of pairing the score). Fixed in the
component's CSS on 2026-09-11; the story now shows the intended shape, and its
doc comment says why the layout uses an auto margin rather than
`justify-content`.

## Synced

Project `23b9671c-a55b-452e-aa41-39906ee71ba8` ("Tour de Growth"), pinned as
`projectId` in `config.json`. Last upload (2026-09-11): 182 files, 34
components, 116 story cells.

**Not uploaded yet:** the DS v3 inputs (70 components, 215 story cells,
~360 files, the night world, `viz`, `game`, the prose family). The bundle
builds and validates clean from this directory; the upload is Antoine's next
`/design-sync` run — sessions do not upload.

The authorization that blocked the first attempt is obtained by running
`/design-login` once from an interactive Claude Code session on this machine;
headless runs then reuse it.

## A fresh clone needs two installs before anything runs

`npm ci` (the repo's own deps — `cfg.buildCmd` shells out to `npx tsc`, and the
converter resolves React out of `./node_modules`), then the converter's own
deps in `.ds-sync/`. Neither directory is committed.

Playwright's browser is **not** in the repo either. `package-validate.mjs` and
`package-capture.mjs` need Chromium; the repo pins `playwright-core@1.56.1`,
which wants chromium build **1194**. `npx playwright install chromium` from the
repo root gets the matching one. Nothing was cached on this machine on the
first run — do not assume a sandbox has it.

## `relativize-dts.mjs` — without it, half the contracts are useless

`tsc` copies path aliases into the emitted declarations verbatim, so
`dist/types/**` was full of `import type { Locale } from "@/lib/i18n/locale"`.
The converter reads that tree with ts-morph in a project that has **no `paths`
mapping**, so every aliased import was unresolved, every referenced type became
an error type, and the extractor printed the bare alias name instead of
expanding it. The emitted contracts — the thing the design agent codes against
— said `locale: Locale` and `sharpness: Sharpness` with neither type defined
anywhere in the file.

`.design-sync/relativize-dts.mjs` rewrites those specifiers to relative paths
and is chained into `cfg.buildCmd` after `tsc`. With it, `Locale` expands to
`"en" | "fr"` across 9 components and `Sharpness` to
`"clear" | "shared" | "level"`. Do not drop it from `buildCmd`; the failure is
silent and only visible by reading a `.d.ts`.

**Still unresolved, deliberately:** `BottleneckPillar`, `SegmentedOption` and
`ToneToggleValue` (the last only inside an `onChange` signature). These are
interfaces and non-union aliases, and ts-morph's `getText()` prints the alias
name for those even when resolvable — only `dtsPropsFor` can inline them. Left
alone because both previews pass the literal shape (`{ pillar, score }`,
`{ id, label, href? }`) and those examples are carried into the `.prompt.md`,
so the agent has the shape from the code that actually runs. Hand-writing the
bodies would duplicate the contract and silently rot.

Seven components **are** pinned in `cfg.dtsPropsFor`: `NotFoundScreen`
(below), `ProseText`, `ProseActions`, `StatTile` (a union of known / unknown /
hidden), `Sparkline`, `EventClipping` (a discriminated union on `kind`) and
`PhoneMock`. Other named object types (`HandCard`, `DashboardChurnTile`,
`DataTableColumn`, `ChartLegendItem`, `TypingPace`, …) still print as bare
names; their previews pass the literal shape. Each pin is a drift risk.

`cfg.dtsPropsFor.NotFoundScreen` **is** pinned, because that one had neither:
four props typed `Translatable` (a `Record`, so never expanded) and examples
that spread a `{...UNKNOWN_PAGE}` constant defined off-screen. **Drift risk:** a
prop added to `NotFoundScreen` will not appear in its contract until this entry
is updated by hand.

## Per-component docs are deliberately NOT wired

`[DOCS_UNMAPPED]` lists all 70, and that is correct — do not "fix" it by
pointing `cfg.docsDir` at `design/ds-extension-0{1,3}-return/`. Those 29
handoff `.prompt.md` files describe the API the design asked for, not the one
that shipped, and 25 of them would *replace* a synthesized doc that is strictly
better: the components carry rich JSDoc, so the synthesized `.prompt.md` gets
that prose **plus** the real props from `dist/types` **plus** worked examples
lifted from the authored previews. Compared side by side on `PriorityMove`, the
synthesized file wins on every axis.

## Traps the previews hit — all six found by grading, none by reading code

The render check passed 34/34 on the first run with zero flags. Every one of
these was a card that rendered perfectly and said something false:

- **`Disclosure.rule` defaults to `true`.** The story named `NoRule` omitted the
  prop and therefore drew a rule. Pass `rule={false}`.
- **`PillarChip.total` defaults to `20`.** `Chips` and `WithTotal` were
  byte-identical; the second was dropped. There is no prop that yields a bare
  "18" — the denominator always prints.
- **`TextArea` over-limit needs `length > maxLength`.** The `OverLimit` story
  was 490/500, i.e. it never showed the red state it is named for. Now 567.
- **`TrackedLink` ships no styles at all.** It is a bare `<a>` that inherits
  colour from its container, so previewed standalone it renders browser-default
  blue. The preview applies `--text-link` the way the real containers do.
- **A French story had an English link label** ("voir How it works"). Test the
  FR cells, not just that they render.
- **`DefinitionTrigger open`** only shifts a border on a 16px glyph — invisible
  unless the closed and open states sit side by side, which the story now does.

Two components have no way to show their most useful state without help:
`Disclosure` (no `open` prop — `<details>` owns it) and any leaf that needs a
parent. For `Disclosure` the preview passes the **native** `open` attribute,
which reaches the element through the component's `...rest`. That is not in
`DisclosureProps`, and it type-checks only because TypeScript's `include` globs
skip dot-directories, so `.design-sync/previews/**` is outside the repo's
`tsc`. If that ever changes, this line errors.

Because the repo's `tsc` never sees the previews, type-check them by hand
after writing one: a scratch `tsconfig.json` that extends the repo's, maps
`tour-de-growth` to an index re-exporting every file in `componentSrcMap`,
and includes `.design-sync/previews/*.tsx`. Keep only lines starting with
`.design-sync` (component files error on CSS-module types without
`next-env.d.ts`, which is noise here). Expected residue: the two `Disclosure`
`open` lines above and `ShareCard`'s `.png` import. Anything else is a real
contract mismatch — this is what caught an undefined month in `ChartFrame`.

### Found in the DS v3 pass, all by reading the screenshots

- **`ActionBar`'s counter and pill are phone-only.** The first stories were
  named for the red "over the law" pill; the desktop canvas never draws it.
- **`GameJournal` entries are closed disclosures**, so "the two cards and
  what happened" were not on the card the doc described.
- **`PatternCatalogue`'s `ThreeGroups` showed two groups** until an unseen
  entry was added — a group with no member is not drawn.
- **Invented numbers creep in.** Hidden effects in `Playbook` and
  `PatternCatalogue` were first written by hand; they now match the level's
  constants. Same for copy: a catalogue `tell` was paraphrased until checked
  against `retention.ts`.

## Re-sync risks

- **`cfg.buildCmd` is two commands now**, and the second one is load-bearing.
  Simplifying it back to a bare `tsc` degrades a dozen contracts silently — no
  warning, no failed check, just alias names where unions should be. After any
  build change, spot-check that
  `ds-bundle/components/brand/ContentHeader/ContentHeader.d.ts` says
  `locale: "en" | "fr"` and not `locale: Locale`.
- **The seven `cfg.dtsPropsFor` entries are hand-written** and will not follow
  their components. If one gains or renames a prop, update the config entry
  or the contract lies.
- **`componentSrcMap` is the component list** (see above). `check-inventory`
  fails the build on drift; do not weaken it to a warning.
- **The Chromium build is pinned by the repo's `playwright-core`.** Bump that
  dependency and the cached browser stops matching (`browserType.launch:
  Executable doesn't exist`); re-run `npx playwright install chromium`.
- **The grades in `.design-sync/.cache/` are not committed.** What makes
  verification durable is the uploaded `_ds_sync.json`. If that anchor is ever
  lost or the project is recreated, all 70 components re-verify from scratch —
  which is a few hours of reading sheets, not minutes.
- **The `--entry ./dist/index.js` trick breaks the day the repo gains a real
  `dist/`.** If a build is ever added, drop the flag and set `cfg.buildCmd`.
- **`next-link.tsx` mirrors an API surface that can drift.** If a component
  starts using a `next/link` prop the shim doesn't accept, TypeScript in the
  app stays happy and only the converter notices. Re-read it against
  `next/link`'s props on any Next major.
- **The shipped fonts are a snapshot.** They were downloaded from Google
  Fonts once. Nothing re-fetches them, which is the point — but if Inter's
  latin subset is ever re-cut upstream, this copy will not follow.
- **`dist/types/` is generated, not committed.** `cfg.buildCmd` regenerates
  it, but a run that skips the build step against a stale or missing
  `dist/types/` silently emits the wrong contracts (see above).
- **Nothing pins the converter's own version.** `.ds-sync/` is re-copied from
  the skill on every run, so a future skill release can change the output
  contract under an unchanged config.
