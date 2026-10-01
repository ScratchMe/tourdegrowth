# Tour de Growth

A guided AARRR growth check-up: fifteen questions, a score out of 100 across
the five stages — Acquisition, Activation, Retention, Referral and Revenue —
the stage holding you back, one action to take, and a result you can share,
in French or English.

**[www.tourdegrowth.com](https://www.tourdegrowth.com)** · a side project by
[Antoine Berthaud](https://cv.antoine.berthaud.me/), Senior Growth PM.

## What it does

### The Tour — live

- **A deterministic score.** Fifteen questions, three per stage, fixed points,
  rounded per stage before summing. No model decides a number: a shared score
  has to be re-explainable in ten seconds, and the result page shows the full
  arithmetic to whoever took the Tour. Two optional questions about the
  product, never scored, compare the result with similar products.
- **A result that says what to do.** It names the stage holding you back — and
  refuses to name one when the numbers don't support it — and gives one action
  picked by a fixed rule from a reviewed library, for the owner and for a
  visitor who arrived through a shared link alike. The share image carries
  that action.
- **Two tones.** "Straight up" or "Roast me", chosen by the user. The roast
  goes after the strategy, never the person: the quick result's roast is a
  library of pre-written, reviewed sentences, and the Deep dive has the rule
  hard-coded into its prompt rather than left to the model's discretion.
- **A Deep dive.** Ten more questions and an optional free-text field turn the
  static verdict into recommendations generated per stage — the only place
  the product calls an LLM, through a fallback chain of Gemini models.
- **Sharing is instrumented.** A visitor who starts their own Tour from a
  shared result carries its `?ref=`, so every Tour a share brings in is
  attributed and measured, with the rest of the funnel, in cookie-less
  analytics.
- **Bilingual throughout**, including the generated text: a shared result
  renders in the *reader's* language, not the author's.

### Around the Tour — live

- **A glossary** of 28 growth terms, each with a long page in both languages.
- **How it works**, which publishes the scoring rules, and **About**.
- Two "open door" pages — a **growth audit checklist** and a **startup growth
  diagnostic** — and five **"AARRR vs …"** comparisons (North Star Metric,
  RARRA, growth loops, OKR, HEART).
- `/llms.txt` and `/llms-full.txt`, generated from the same sources as the
  sitemap and the pages; `robots.txt` names the AI crawlers and lets them in.

### Built, not open yet

Both sit behind a build flag, return 404 to everyone, and can be opened for
one browser only from the owner's preview at `/admin/preview`.

- **The growth engine** (`/{locale}/aarrr-funnel-template`, `ENGINE_ENABLED`).
  You bring your own seventeen numbers; it shows where your funnel loses
  people *against a target your team set*, prices each missing number as a
  finding, and exports a short deck for a leadership meeting (vector PDF, a
  PNG per slide, copyable text). Nothing typed leaves the browser, and a canary
  spec proves it. Sales-assisted and hybrid motions are being added before it
  opens ([`ENGINE.md`](ENGINE.md) §18).
- **The game "The dark side"** (`/{locale}/game`, `GAME_ENABLED`). You play
  the growth PM of a fictional app, under a CEO who wants the number, and
  learn to recognise manipulative interface patterns by being tempted to ship
  them. Level 1, on subscription cancellation, is playable; level 2, on
  acquisition, is specified and modelled ([`docs/game/niveau-2.md`](docs/game/niveau-2.md)).
  Entirely client-side.

A public `/metrics` page is built too, behind `METRICS_PAGE_ENABLED`, and stays
shut until there is enough volume for public numbers to mean something.

## Stack

Next.js 16 (App Router, with `proxy.ts`) · TypeScript · React 19 · CSS Modules
over design tokens, no UI library, charts drawn without a library · Firestore
through `firebase-admin`, server-side only · Gemini with a multi-model fallback
chain · deployed on Vercel · GoatCounter for cookie-less analytics.

Tests: Vitest for the logic (the scoring engine first), Playwright against a
production build for the journeys, axe for accessibility, the Firestore
emulator for real result pages.

## Running it

Node 22 or later.

```bash
npm ci
cp .env.local.example .env.local   # fill in the values it documents
npm run dev
```

`.env.local.example` lists every variable the code reads and what breaks
without each one. Quick results need Firestore only; the Deep dive is the one
feature that needs a Gemini key.

```bash
npm test             # unit tests — pure logic, offline, no credentials
npx tsc --noEmit     # type-check
npm run lint
npm run build
npm run test:e2e     # Playwright against the production build
```

The end-to-end suite expects the same variables as CI (the game built open,
an analytics stub, an admin password) and the Firestore emulator for the specs
that read a real result; [`TESTING.md`](TESTING.md) has the local recipe.

`npm run test:live` exists too, but talks to the real deployed site, Firestore
and Gemini. It runs from the "Verify against live services" workflow, by hand,
and cleans up the data it creates.

The two are deliberately different kinds of thing. **CI is the gate**: it runs
on every push and pull request, it is entirely offline, and it is the check
the `main` branch rule requires. **The live workflow is a probe**: it fires only
by hand, and it can go red because a third party is having a bad day. It must
never gate a merge — it does not even report a status on a pull request, so
requiring it would block merges permanently, and letting an external API's
uptime decide whether you can ship is the wrong trade in any case.

## Where things are

```
src/app/[locale]/   content pages, static, one URL per language — the engine and the game too
src/app/(app)/      quiz, result, Deep dive, admin — dynamic, no language prefix
src/app/api/        the two POST routes: create a result, run a Deep dive
src/components/     the design system, ported from Claude Design
src/content/        all the copy, in both languages
src/lib/            scoring (pure), engine, game, gemini, i18n, seo, og images, analytics…
e2e/                Playwright specs
scripts/            Vercel's ignore step, UTM links, the stats report, the plug-in installer
design/             the design briefs and what came back from Claude Design
marketing/          launch texts, the submission kit, the campaigns
docs/              the journal's archived volumes, the decisions index, and the parts of the engine and game specs that are not current work
```

## The documentation is the point

This repository is a portfolio piece, so the reasoning is kept as carefully as
the code. Most of it is written in French: it is the working language of the
product owner and of the Claude Code sessions that build the product, for whom
these files are written first.

**The product**

| File | What it holds |
| --- | --- |
| [`SPEC.md`](SPEC.md) | The original product specification — scoring rules, tone, sharing mechanics |
| [`design/DESIGN-BRIEF.md`](design/DESIGN-BRIEF.md) | The visual system, screen by screen; the extension briefs `DS-EXTENSION-BRIEF-01` to `04` sit next to it, each with what came back in `ds-extension-0N-return/` |
| [`ENGINE.md`](ENGINE.md) | The growth engine: its decisions and the sales-assisted extension being built (§18); the v1 implementation spec is in [`docs/engine/v1.md`](docs/engine/v1.md) |
| [`GAME-BRIEF.md`](GAME-BRIEF.md) | The game: level 1 in full and the four other levels sketched; level 2's spec is in [`docs/game/niveau-2.md`](docs/game/niveau-2.md) |
| [`GROWTH-PLAN.md`](GROWTH-PLAN.md) | The distribution plan, wave by wave; [`marketing/`](marketing/) holds its texts |
| [`AUDIT.md`](AUDIT.md), [`AUDIT-PLAN.md`](AUDIT-PLAN.md) | A private growth-audit instrument, browser-only, paused since 2026-09-30 |

**How it is built**

| File | What it holds |
| --- | --- |
| [`CLAUDE.md`](CLAUDE.md) | The rules every Claude Code session reads first: what is non-negotiable, when to open which tool file, the current state of the project |
| [`CHANTIERS.md`](CHANTIERS.md) | The work list, by who does it — what a session can do alone, the decisions waiting on the product owner, the product owner's own actions — with a prompt per session; the decisions already taken are indexed in [`docs/decisions.md`](docs/decisions.md) |
| [`JOURNAL.md`](JOURNAL.md) | Every architectural decision, the traps hit along the way, and what was verified how, in the order it happened; the current volume, with the older ones in [`docs/journal/`](docs/journal/) |
| [`VERCEL.md`](VERCEL.md), [`NEXTJS.md`](NEXTJS.md), [`TESTING.md`](TESTING.md), [`GITHUB.md`](GITHUB.md), [`GEMINI.md`](GEMINI.md), [`FIRESTORE.md`](FIRESTORE.md) | What was learnt about each tool, split into what travels to any project and what is specific to this one; [`PLUGINS.md`](PLUGINS.md) says how a Claude Code plug-in gets into the repository |
| [`REVIEW.md`](REVIEW.md), [`REVIEW-02.md`](REVIEW-02.md), [`REVIEW-03.md`](REVIEW-03.md) | Three full technical and functional reviews, every finding with its status — all three closed |

## Contributing

Reading is welcome — the code and the reasoning are here to be read.
Pull requests are not expected: this is a one-person portfolio project, and
every change goes through a review trail that lives in the documents above.

If you spot a bug, an issue is the right place. If it is a security problem,
please do not open an issue — see [`SECURITY.md`](SECURITY.md).

## Licence

[AGPL-3.0](LICENSE). You are free to read, run, modify and redistribute this
code; if you run a modified version as a network service, that version's source
has to be available too.

The licence covers the code. "Tour de Growth", its wordmark and its visual
identity are not licensed with it.
