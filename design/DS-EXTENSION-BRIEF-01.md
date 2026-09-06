# Design system extension brief 01 — five components built outside the system

*Tour de Growth · from the codebase to Claude Design · 2026-09-06*

## Why this brief

Since the "évolutions" bundle (17 components, `tokens/*.css`, `guidelines/`),
the product has shipped through a full technical and functional review
(`REVIEW.md`, 26 items, all closed). Five interface pieces were built along
the way that **no component in the bundle covers**. Each was assembled from
the design tokens only, flagged in `CLAUDE.md` as "to be reviewed by Claude
Design" rather than invented silently, and shipped because the product needed
it. They are all live at https://www.tourdegrowth.com today.

This brief asks you to bring them **into** the system: either as new
components in the same format as the 17, or as documented compositions of
existing ones, with your own decisions on what the tokens-only versions got
right or wrong.

Screenshots of every one of them, as currently shipped, are in
`ds-extension-01/` next to this file (2× retina, real production build).

## What we need back

The same deliverable shape as the bundle, so the port is mechanical:

- one component per piece (or a note saying "composition of X and Y, no new
  component"), as React + `.d.ts` + `.prompt.md` — the `.prompt.md` usage
  rules are the part we rely on most, they are what stops future misuse;
- any **new tokens** added to `tokens/*.css`, never a new hex inline;
- both languages (copy is final and provided below — French strings are
  approved product copy, not a layout test this time);
- mobile at 390px and desktop at 1280px, like the rest of the system;
- inline styles are fine in your deliverable; we port them to CSS Modules.

## What changed in the tokens since the bundle

Three things you must design **with**, not around:

| Token | Now | Why |
|---|---|---|
| `--paint-red-action` `#CC3E2B` | new; `--action-primary-bg` uses it | the primary button label (`--paper-0` on `--paint-red`) measured 4.42:1, under AA. Darkened 3%: 4.65:1. `--paint-red` itself is unchanged everywhere it is an accent. |
| `--text-link` → `--paint-red-deep` | was `--paint-red` | every link is red text on paper, which is what `--paint-red-deep` exists for. 5.42:1 on `--paper-1`. |
| `--ink-faint` `rgba(33,28,21,.65)` | was `.45` | the "Built by" credit line measured 2.80:1. Still visibly lighter than `--text-muted`. |

**AA contrast is now enforced in CI** (axe, serious/critical, on six screens)
with **no exceptions left**. Any pair you propose below 4.5:1 for normal text
turns the build red — so if a design needs a quieter tone somewhere, it needs
a token that still passes, not an exception.

## Constraints that are not up for discussion

Restated from the original brief and `CLAUDE.md`, because every one of them
bites on at least one component below:

- **No icons, no images, no SVG.** The only glyphs are `🔥`, `→`, `←`, `№`.
  This is why the disclosure marker below is a typographic `+` / `−`.
- **Three type roles, no more**: Stardos Stencil (display), Inter (UI),
  IBM Plex Mono (data / labels).
- **One signature effect per element**: hard shadow *or* dashed border, never
  both.
- **The result page shows exactly two CTAs.** Nothing below may add a third.
- **Bilingual from the same component** — never two layouts for two
  languages. French runs ~20% longer; it broke the landing header once (R-21),
  which is how the switcher ended up where it is.
- **`/quiz` and `/deep-dive` are tunnels**: no footer, no language switch, no
  exits. The footer and switcher decisions below already respect this.

## Existing components you may reuse

From the bundle, the ones these pieces sit next to: `core/Card` (four tones,
raised elevation), `core/Button` (`primary` / `secondary` / `quiet`, sizes
`md` / `lg`, plus an app-side `compact` used only in headers), `core/Tag`,
`brand/Wordmark`, `brand/MetaLabel`, `quiz/QuestionCard`,
`quiz/StageProgress`, `result/ToneToggle` (a two-option segmented control,
**ported but never wired** — see component 2).

---

## 1. Disclosure — "How this score is calculated"

**Where**: result page (`/r/<id>`), **owner only**, after the two CTAs and the
disclaimer. Never shown to someone who opened a shared link. Closed by default.
Screenshots: `breakdown-desktop-en-closed.png`, `breakdown-desktop-en-open.png`,
`breakdown-mobile-fr-closed.png`, `breakdown-mobile-fr-open.png` (illustrative
answers — the sample result has none of its own).

**Why it exists**: `CLAUDE.md` makes it non-negotiable that a shared score be
re-explainable in ten seconds. It was true of the code and invisible in the
product. This panel lists, per pillar, the three questions, the answer chosen,
its points (20 / 7 / 0) and the maths `54/60 → 18/20`.

**Current build** (tokens only, native `<details>`):

- summary: `--meta-sm`, uppercase, `--meta-tracking`, `--text-muted`, hover
  `--text-body`; marker `+` (closed) / `−` (open) in `--meta-md`, typographic;
- top rule `--border-rule`, `--space-8` above and below;
- per pillar: name in `--meta-md` uppercase, maths right-aligned in
  `--meta-sm`, `--border-rule` under the head; questions separated by
  `1px dashed --border-divider`, `--space-5` vertical padding;
- question `--body-sm --text-body`, answer `--body-sm --text-muted`, points
  right-aligned `--meta-sm`;
- closing note `--meta-xs --text-muted`.

**What feels right**: it is quiet. The result screen you designed is visually
untouched until someone asks. The maths line reads like a data label, which
is what it is.

**What feels off**: the answer rows are 15 identical dashed rows — long on
mobile (one full screen per pillar). The typographic marker is a workaround
for the no-icons rule, and the summary has no affordance beyond it.

**Questions**
1. Should this become a generic `Disclosure` component (summary + marker +
   content) — it would also serve future FAQ-style content on How it works —
   or stay a one-off result-page composition?
2. Is `+` / `−` the right marker under the no-icons rule, or is there a better
   typographic or border-based cue in this language (a dashed underline that
   becomes solid, a stage-tag style chip)?
3. Density on mobile: keep 15 rows, or collapse per pillar (five sub-
   disclosures), or show only the maths line per pillar with answers on tap?
4. The "20 pts" column: mono label, or should points be the same `PillarChip`
   number treatment used elsewhere for scores?

**Copy (final, EN / FR)**: summary "How this score is calculated" / "Comment
ce score est calculé"; intro "Three questions per stage. Your answers, and
what each one was worth." / "Trois questions par étape. Tes réponses, et ce
que chacune valait."; maths template `{raw}/60 → {score}/20`; points `{n} pts`;
note "Only visible to you — your answers are stored on this device, never on
the shared page." / "Visible par toi seul — tes réponses sont sur cet
appareil, jamais sur la page partagée."

---

## 2. Language switch

**Where**: every header except the two tunnels — landing, How it works,
glossary, **and the result page**, where it is the only way a reader can
change the language of a shared result (the verdict follows the *reader's*
language since R-09; results have no language of their own).
Screenshots: `switcher-landing-desktop-en.png`, `switcher-result-mobile-fr.png`.

**Current build**: two plain links `EN` / `FR` in `--meta-2xs` uppercase,
`--text-muted`; the current one in `--text-body` on a `--surface-sunken`
chip, `--radius-tag`; `--space-2` between them. Sits left of the nav links
on desktop; on mobile it is the only thing left in the header besides the
wordmark (the nav links hide under 760px, R-21). It is a real page load, not
a client navigation — deliberate, so `<html lang>` is always right.

**What feels right**: quiet, chrome-like, fits the meta-label family.

**What feels off**: it is a bespoke pair of links in a system that already
has a two-option control. `ToneToggle` (segmented, `--border-solid`, the
selected side filled `--ink-0` / `--text-inverse`) was ported from your
bundle and never used — the result page kept its two-CTA rule instead. A
`EN | FR` segmented control in that language would be the first *reuse* of
that component, at header scale.

**Questions**
5. Reuse the `ToneToggle` language (a small segmented control) or keep the
   link-pair? If the toggle: which size, given it sits in a 24px-padded
   header next to a 13.5px nav and a compact button?
6. Placement on the result page header, where it shares the row with
   `STAGE 5/5 — FINISHED · 15/15 ANSWERED` (see the mobile screenshot).
7. Should the current language be shown at all (`EN` highlighted, `FR`
   plain), or only the *other* language as a single link ("FR")? The second
   is smaller but hides that a choice exists.

**Copy**: labels `EN` / `FR`; accessible group name "Language" / "Langue".

---

## 3. Site footer

**Where**: every page except the two tunnels — landing, result (real and
sample), How it works, glossary index and terms, both 404s. Two widths,
matching the page container: `wide` (`--content-max-width`, landing/result)
and `reading` (`--width-reading`, prose pages).
Screenshots: `footer-landing-desktop-en.png`, `footer-landing-mobile-fr.png`,
`footer-glossary-desktop-en.png`.

**Why it exists**: an SEO recommendation — link Antoine's CV from every
indexable page, with a followable link and a descriptive anchor. It carries
the two internal links too, so crawlers (and people) always have a path to
How it works and the glossary; that is also what allowed the header to drop
those links on mobile.

**Current build**: `--border-rule` top (the same dashed rule as the header),
`--space-15` above, padding `--space-10` / `--space-12`; nav links in
`--label-nav --text-muted` with a `1px solid --border-divider` underline that
turns `--text-body` on hover, `--space-8` apart; credit line in
`--meta-xs --text-muted`, link underlined, hover `--text-link`.

**What feels right**: it mirrors the header's dashed rule, so the page reads
as a ticket with a top and a bottom edge.

**What feels off**: it is the only element in the product that is *only*
text on stone — no card, no tag, no bib. It may be right (a footer should be
quiet), but it was never designed, only assembled.

**Questions**
8. Is "text on stone under a dashed rule" the footer, or does the footer
   deserve one signature element (a small bib tag with the credit, a stage-
   tag style "№" line)?
9. Two container widths: keep them (footer aligns with page content) or one
   fixed width for the whole site?

**Copy (final)**: links "How it works" / "Comment ça marche", "Glossary" /
"Glossaire"; credit "A side project by *Antoine Berthaud — Senior Growth PM*."
/ "Un side project d'*Antoine Berthaud — Senior Growth PM*." (the italic span
is the link).

---

## 4. Not-found screen

**Where**: two 404s that share one screen and differ only in words — an
unknown address (`/anything`), and a result id that names nothing
(`/r/<unknown>`, the "this shared link may be wrong" case). Both keep the
footer: a dead link is a real entry point, it must not be a cul-de-sac.
Screenshots: `notfound-desktop-fr.png`, `notfound-mobile-en.png`.

**Current build**: wordmark link, title in `--display-section` at 36px,
body `--body-md --text-muted` max 480px, one primary `Button` to the
landing; left-aligned in the `--content-max-width` container, 80px vertical
padding, 18px gaps; then the footer.

**What feels right**: it finally looks like the product (before R-26 it was
the framework's bare error page).

**What feels off**: it is the plainest screen in the product — the error
screen you designed (06c, "Detour", red-outlined card, stencil H2) has far
more character, and a 404 is the same emotional moment.

**Questions**
10. Should the 404 reuse the 06c "Detour" language (red-outlined card, mono
    eyebrow, stencil title) — making "wrong turn" one family of screens — or
    stay the sober landing-like layout?
11. Same screen for both 404s, or a different eyebrow for the "shared result
    not found" case, which is the one real visitors hit?

**Copy (final)**: unknown address — "This page doesn't exist." / "Cette page
n'existe pas."; body "The address may be mistyped, or the page may have
moved. Everything else is still where you left it." / "L'adresse est
peut-être mal recopiée, ou la page a changé de place. Le reste est là où tu
l'as laissé."; CTA "Back to Tour de Growth →" / "Retour à Tour de Growth →".
Result not found — "No result at this address." / "Aucun résultat à cette
adresse." (all strings in `UI_STRINGS.notFound` and `UI_STRINGS.result.notFound*`).

---

## 5. Free-text context field

**Where**: the Deep dive's 11th and last screen, under a `QuestionCard`
("Any specific context we should know about? (optional)") and a helper line;
`Skip` and `Get my results →` below.
Screenshots: `freecontext-desktop-en-empty.png`, `freecontext-desktop-en-filled.png`,
`freecontext-desktop-en-overlimit.png`, `freecontext-mobile-fr-empty.png`.

**Current build**: exact values from SPEC-ADDENDUM-02 §1.2, which was
written specifically so no new mock would be needed — a textarea in
`--surface-card`, `--border-solid`, `--radius-panel`, 16px padding,
`--body-md`, min-height 120px, no resize handle; placeholder in
`--text-muted`; focus ring `--border-hard`; a right-aligned mono counter
`190/500` at 11px in `--text-muted` that turns red **only past** the limit
(never a warning before, per the spec) — typing is not blocked, the server
truncates.

**What feels right**: it obeys the card grammar. The counter is honest.

**What feels off**: the system has **no text-input primitive at all** — this
is the only place a person types free text, and it was specified in a
document rather than designed. The over-limit counter used `--paint-red` on
stone (3.57:1); it now uses `--text-alert`, in line with the token change
above — fixed in the same commit as this brief.

**Questions**
12. Should this become `core/TextArea` (and, by extension, define what a
    text input looks like in this system), or remain a one-off?
13. Over-limit behaviour: red counter only (current), or also a
    `--border-alert` outline on the field?
14. The `Skip` secondary button sits between `← Back` and the primary CTA —
    three actions on one row, the only screen in the product with three. Is
    that the right shape, or should Skip be a quiet link like Back?

**Copy (final, `content/free-context.ts`)**: placeholder "E.g.: we sell to
accounting firms, long sales cycle, trust is a bigger blocker than price..." /
"Ex. : on vend à des cabinets comptables, cycle de vente long, le vrai frein
c'est la confiance plus que le prix..."; buttons "Skip" / "Skip" and "Get my
results →" / "Obtenir mon diagnostic →"; counter `{n}/500`.

---

## Open questions — please resolve before delivering

The fourteen numbered questions above, plus two that cut across:

15. **Naming and grouping.** Where do these live in the system's
    categorisation — `core` (Disclosure, TextArea), `brand` (LocaleSwitcher,
    SiteFooter, NotFoundScreen)? Your call; we mirror it in `src/components/`.
16. **Anything you would change in the five as shipped that this brief did
    not ask about.** They were built by an engineer from tokens. Say so where
    it shows.

## Handoff back

Return the bundle the way the last one arrived — either "Send to Claude Code
Web" from the Claude Design project, or the files dropped under `design/` in
this repository. Nothing is needed beyond the files: the port, the tests and
the screenshots against the real build are on our side.
