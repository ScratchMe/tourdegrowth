# Tour de Growth

A guided AARRR growth check-up: fifteen questions, a scored diagnosis across
Acquisition, Activation, Retention, Referral and Revenue, and a verdict you
can share — in French or English.

**[www.tourdegrowth.com](https://www.tourdegrowth.com)** · a side project by
[Antoine Berthaud](https://cv.antoine.berthaud.me/), Senior Growth PM.

## What it does

- **A deterministic score.** Fifteen questions, three answers each, fixed
  points, rounded per pillar before summing. No model decides a number — a
  shared score has to be re-explainable in ten seconds, and the result page
  shows the full arithmetic to whoever took the Tour.
- **Two tones.** "Straight up" or "Roast me", chosen by the user, with an
  anti-mockery guardrail hard-coded into the prompt rather than left to the
  model's discretion.
- **A Deep dive.** Ten more questions and an optional free-text field turn the
  static verdict into recommendations generated per pillar — the only place
  the product calls an LLM.
- **Bilingual throughout**, including the generated text: a shared result
  renders in the *reader's* language, not the author's.

## Stack

Next.js 16 (App Router) · TypeScript · React 19 · CSS Modules over design
tokens · Firestore · Gemini with a multi-model fallback chain · deployed on
Vercel · GoatCounter for cookie-less analytics.

## Running it

```bash
npm ci
cp .env.local.example .env.local   # fill in the values it documents
npm run dev
```

`.env.local.example` lists every variable the code reads and what breaks
without each one. Quick results need Firestore only; the Deep dive is the one
feature that needs a Gemini key.

```bash
npm test          # unit tests — pure logic, offline, no credentials
npm run test:e2e  # Playwright against a production build
npm run lint
```

`npm run test:live` exists too, but talks to the real deployed site, Firestore
and Gemini. It runs from the "Verify against live services" workflow, by hand,
and cleans up the data it creates.

The two are deliberately different kinds of thing. **CI is the gate**: it runs
on every push and pull request, it is entirely offline, and it is the check a
branch rule should require. **The live workflow is a probe**: it fires only by
hand, and it can go red because a third party is having a bad day. It must
never gate a merge — it does not even report a status on a pull request, so
requiring it would block merges permanently, and letting an external API's
uptime decide whether you can ship is the wrong trade in any case.

## The documentation is the point

This repository is a portfolio piece, so the reasoning is kept as carefully as
the code:

| File | What it holds |
| --- | --- |
| [`SPEC.md`](SPEC.md) | The product specification — scoring rules, tone, sharing mechanics |
| [`design/DESIGN-BRIEF.md`](design/DESIGN-BRIEF.md) | The visual system, screen by screen |
| [`CLAUDE.md`](CLAUDE.md) | Every architectural decision, the traps hit along the way, and what was verified how |
| [`REVIEW.md`](REVIEW.md) | A full technical and functional review, with each finding's status |

## Licence

[AGPL-3.0](LICENSE). You are free to read, run, modify and redistribute this
code; if you run a modified version as a network service, that version's source
has to be available too.

The licence covers the code. "Tour de Growth", its wordmark and its visual
identity are not licensed with it.
