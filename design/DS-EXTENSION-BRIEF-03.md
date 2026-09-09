# Design brief 03 — the result has to say what to do next

**This brief replaces brief 02 and absorbs it.** Brief 02 asked one question
(how does anyone learn the roast mode exists before question 15?). It was
written, never sent. An external growth review landed the next day and
changed what the result page is for, which would have made a brief-02 answer
stale before we could port it. The roast question is still here — it is
**section 4** — but it is now asked inside a bigger change, on the screen
that changed.

Screenshots in `design/ds-extension-03/`, all 2×, all from a real production
build. The `10-` one was taken with a temporary local patch that forces the
owner-only card visible; it is not committed.

---

## The finding this comes from

Someone finishes the Tour, gets 74/100, sees five pillar scores, two things
they are good at, two things they are losing time on — and **not one thing to
do**. The reviewer's phrase for it: "So what?"

That gap is not an oversight, it is a decision that outlived its context.
`SPEC-ADDENDUM-01` §0 pulled Gemini out of the Quick mode (good: it made the
free result instant and deterministic) and removed the `recommendation` field
with it, because the addendum offered no static replacement. "One priority
action" became the Deep dive's exclusive. So today the free product
diagnoses and stops, and the only way to get an action is to answer ten more
questions and wait about a minute.

Antoine has decided to close that gap. **The result page will name one
bottleneck and give one action, for everyone, free, instantly** — from a
deterministic library, never from a model. The Deep dive keeps its role: it
makes that action *specific to your business*, which is a real upgrade and a
better offer than an empty locked box.

Everything below serves that one sentence.

---

## What the result page looks like today

`01-result-neutral-en-desktop.png` (visitor, EN, 1280px)
`02-result-neutral-fr-mobile.png` (visitor, FR, 390px)
`10-result-locked-card-en.png` (the same page as its **owner** sees it — the
extra dashed card is the Deep dive teaser)

Reading order as built: score card (with the one-line verdict under the
numeral) · pillar chips · Strengths (2) · Where you're losing time (2) ·
[owner only: Priority move — locked] · pitch line · two CTAs · disclaimer ·
[owner only: a collapsible score breakdown, not in these shots].

Two things worth noticing before you design:

- **The verdict sentence already names the bottleneck** — "Solid engine, one
  flat tyre: retention." It sits in 15px body text under a 100px numeral. The
  most useful sentence on the page is also its quietest element.
- **"Where you're losing time" holds two pillars, side by side, equal
  weight.** Nothing says which of the two to touch first. In the sample,
  Retention is 8 and Activation is 12 — a four-point gap that the layout
  renders as a tie.

---

## 1. The bottleneck block

**The problem to solve.** One stage is holding this product back more than
the others. Say so, in the position and at the size that matches how much it
matters.

**What we can give you, deterministically** (all of it already computed):

- the pillar name and its score out of 20;
- the overall score out of 100 and its band;
- **the sharpness** — how far ahead of the second-worst pillar it is. Three
  states, and the copy differs for each:
  - **clear** — a real gap (≥ 4 points, say): one stage is the bottleneck;
  - **shared** — the two lowest are within a point or two: two stages are
    holding you back together;
  - **level** — all five are in the strong band: nothing is stalling, the
    question is which one to push.
- one sentence, from the existing verdict library.

**Why sharpness matters and is not decoration.** Without it we would stamp
"RETENTION" on a product whose Activation is one point behind — which is
false precision, and this product's whole credibility rests on a score you
can re-explain in ten seconds. The external review asked for a "Confidence:
High" badge; we refused that (it invents a certainty we cannot compute) and
kept the honest, computable version.

**What we need from you**: where this block goes, how big, what it does to
the elements around it. Our instinct is that it belongs directly under the
score card and above the pillar chips, and that it can be big enough to be
the second thing you read. But if you think it replaces the verdict line
inside the score card, or displaces the pillar chips, say so — you own the
page's hierarchy, not us.

**What it must not become**: a traffic light, a gauge, a badge with an emoji.
The brand has exactly one emoji (the roast 🔥) and there are no icon files in
this product at all.

**The copy for this block does not exist yet** — unlike §2, which is written
and approved. Three short strings (one per sharpness state) will be written
against whatever you deliver, so design with placeholder text at the length
you think is right and say what length you assumed. Do not wait for the
words.

---

## 2. The next action, in the free result

**The problem to solve.** Show one concrete action for the bottleneck stage.

**This library is written and approved** — it is not a spec you are designing
against a length. It holds 31 actions, keyed by question and by the answer
that was given: the reader is shown the action for the first question in the
bottleneck stage they did not fully answer. It has **no tone variants** — an
action is an action, the roast voice lives in the verdicts, and an action
that mocks you is not an action.

**The real words, so you can set them rather than imagine them.** Three
actual entries, longest and shortest included, in both languages:

> Pick the single channel that brought your last ten customers, and give it
> your full attention for one cycle.
> *Choisis le seul canal qui a amené tes dix derniers clients, et
> consacre-lui un cycle entier.*

> Write your aha moment as a single event you could log, then log it — a
> moment you can't count isn't defined yet.
> *Écris ton moment « aha » comme un événement que tu pourrais tracer, puis
> trace-le — un moment qu'on ne peut pas compter n'est pas encore défini.*

> Take one month's cohort of new users and count how many are still active
> thirty days later.
> *Prends la cohorte de nouveaux utilisateurs d'un mois et compte combien
> sont encore actifs trente jours plus tard.*

One imperative sentence each, 15–23 words in English, no lists and no
numbers promised. French runs 10–20% longer, as everywhere: the longest entry
in the library is 144 characters in French. Size the slot for that, not for
the shortest.

**One more string, for the case where nothing is behind**: when the weakest
stage is itself strong — which can only happen when all five are — there is
no bottleneck to name, and the slot carries this instead:

> Nothing is stalling you — every stage is solid. The question now is which
> one you push, not which one you fix.

That state has no pillar, no score and no sharpness. If your layout for §1
and §2 assumes a named stage, tell us what it degrades to.

**The hard part, and the reason this is a design question and not a coding
one.** Look at `10-result-locked-card-en.png`. The owner today sees a dashed,
empty "PRIORITY MOVE — LOCKED" card whose whole persuasive force is that it is
empty (a deliberate call from 2026-08-28: completing the Deep dive fills that
exact slot rather than adding a new one). Once the free result carries a real
action, that emptiness is gone. So:

- Is the free action **in that same slot**, with the Deep dive offer becoming
  "make this specific to my business" underneath it?
- Or is the free action somewhere else (near the bottleneck block, say), with
  the locked card left as it is?

We lean towards the first: showing the generic action and offering to
personalise it is a stronger offer than an empty box, because the reader can
see the shape of what they would get. But this is exactly the kind of call
we want you to make on the layout, not us. **Whichever you choose, a visitor
who does not own the result must still see the action** — they are the
numerator of the whole sharing loop, and the action is what makes a shared
link worth opening.

---

## 3. The share card, visible on the page

**The problem to solve.** Every result already has a 1200×630 share image
(`08-og-neutral-en.png`, `09-og-roast.png`) — genuinely the most carefully
made asset in the product. The author never sees it. It exists only as a link
preview inside LinkedIn or Slack, discovered after posting. Nobody shares
well what they have not seen.

**What we want**: the real image shown on the result page, in a block, with
the existing Share action and a way to save the image.

**Antoine's decision, which is a constraint here**: the **next action goes on
the image**. So the card stops being a score badge and becomes something with
a reason to be posted — the number is the hook, the action is the substance.
You are re-opening a layout the original brief called "highest care", so
treat the numeral as untouchable and tell us what gives.

Practical facts about that image: it is rendered by Satori, not by a browser
— no CSS files, no shared components, tokens are hand-copied hex constants,
flexbox only, no grid. It carries the author's language, not the reader's
(a social crawler sends no cookies). There are two treatments already, neutral
and roast; the roast one has a red border and a "🔥 ROAST MODE" badge.

---

## 4. The landing preview card — and the roast question (this was brief 02)

`03-landing-en-desktop.png`, `04-landing-fr-mobile.png`,
`05-preview-card-en.png` (the card on its own).

Two jobs, one element.

**4a. The preview card should promise what the result now delivers.** It is a
smaller version of the result card — same components, `size="mobile"` — and it
currently shows a score and five pillar chips. If the result page now names a
bottleneck and an action, the preview must show that, or the landing is
advertising the old product.

**4b. Nothing on the landing says the roast mode exists.** This is brief 02's
question, unchanged, and it belongs on this card because this card is the
only place on the landing where the product's *output* is shown — and it is
currently, silently, in the neutral tone.

The facts, so the answer is informed rather than guessed:

- The tone is chosen **after** question 15 (`06-tone-selector-en.png`) —
  three minutes in, with no prior mention.
- Neutral must stay the default (SPEC.md §6bis, non-negotiable).
- `07-result-roast-en.png` and `09-og-roast.png` show what roast actually
  looks like downstream, so whatever you propose neither over- nor
  under-promises it.
- `result/ToneToggle` exists in the design system, ported at extension 01 and
  **never wired**, because the result page shows exactly two CTAs and adding
  a third was refused. Using it **on the landing** does not reopen that
  decision — it is a different screen.
- The mobile header is full. R-21 hid both nav links below 760px to stop the
  page scrolling sideways, so there is no room up there.

Three shapes we can see, each with its defect, offered to save you time and
not to steer you: a **toggle on the card** (demonstrates it, but adds an
interactive control competing with the primary CTA); a **line of copy** ("Not
in the mood to be nice? There's a roast mode.") (cheap, but telling is weaker
than showing); an **alternating card** (shows it without a control, but
motion near a CTA, and it may look broken on first paint). "None of these,
leave it alone" is an acceptable answer if that is your read.

---

## 5. A two-line "Problem" section on the landing

The landing goes from the headline straight to the mechanics. There is no
sentence stating the belief the product is built on. Two lines, somewhere
above or beside the preview card, roughly:

> Growth rarely stalls everywhere at once. Most teams have one stage holding
> the rest back — and it is usually not the one they are working on.

(Draft copy, to be reviewed. Design against the length, not the words.)

The H1 stays as it is — "Where does your growth **stall?**" is approved copy
and it poses the problem well. What is missing is the line that says what
you get, and that is a copy decision Antoine will take separately.

---

## What already exists that you may reuse

From the extension 01 bundle (all in `design/ds-extension-01-return/`) and the
original 17: `Card` (4 tones), `MetaLabel`, `ScoreDisplay`, `PillarChip`,
`InsightCard`, `PriorityMove`, `ModeTag`, `StampedPillar`, `Button`,
`Segmented`, `Disclosure`, `DetourCard`, `TextArea`, `Tag`, `ToneToggle`,
`GlossaryTerm`, `SiteFooter`, `ScoreBreakdown`, `LocaleSwitcher`.

Prefer a composition of these over a new component, and say so explicitly if
that is what you are proposing. New components are welcome where the system
genuinely has no answer — that is what extension 01 was for.

## Constraints that are not up for discussion

1. **The primary CTA stays the most prominent thing on its screen.**
2. **Neutral stays the default tone** (SPEC.md §6bis).
3. **Contrast is checked in CI with no remaining exceptions.** Every text/
   background pair must clear WCAG AA 4.5:1 (3:1 for text ≥ 24px, or ≥ 18.66px
   bold). A quieter shade needs a token that passes, not an exception — R2-22
   emptied that list and we intend to keep it empty. Note `--paint-red` (the
   brand red) fails AA for body text on paper; `--paint-red-action` and
   `--paint-red-deep` are its passing siblings.
4. **One emoji in the whole brand** (the roast 🔥). No icon files exist.
5. **Both languages, both widths.** French runs 10–20% longer than English;
   pillar names are untranslated, so those stay the same width.
6. **The score must stay re-explainable in ten seconds.** Nothing may imply a
   precision the arithmetic does not have.
7. **The anti-mockery guardrail is not a design element** — it lives in the
   Gemini system prompt and never appears on screen.

## The copy that exists, so you can design against real words

Landing: "Where does" / "your growth" / "**stall?**" · "№ 15 questions — 3 min
— free entry" · "Start your Tour →" · "See a sample result".

Result: "OVERALL GROWTH SCORE" · "74/100" · "Solid engine, one flat tyre:
retention." · "STRENGTHS" · "WHERE YOU'RE LOSING TIME" · "Your own score in 3
minutes — 15 questions, free, no sign-up." · "Take your own Tour →" · "Share
this result" · "A quick estimate, not an audit — see How it works."

Deep dive teaser (owner only, today): "PRIORITY MOVE — LOCKED" · "Answer 10
more questions to unlock your personalized priority action." · "Unlock my
priority action →".

French equivalents exist for all of these and are the same register.

## What we need back

Same shape as the extension 01 bundle, so the port is mechanical:

- your answer to each of the five sections, with the reasoning — including
  "leave this alone" where that is your read;
- for a component: React + `.d.ts` + `.prompt.md`, the `.prompt.md` usage
  rules being the part we rely on most;
- for a composition of existing components: a note saying so, with the
  arrangement;
- any **new tokens** in `tokens/*.css`, never a new hex inline;
- both languages, 390px and 1280px;
- inline styles are fine — we port to CSS Modules.

## Open questions, please resolve before delivering

1. Does the bottleneck block sit above the pillar chips, or does it replace
   the verdict line inside the score card?
2. Does the free action fill the existing "Priority move" slot (with the Deep
   dive offer moving under it), or does it live elsewhere?
3. On the share image: where does the action go, and what gives to make room?
4. On the landing card: toggle, line, alternation, or nothing (§4b)?
5. If a toggle: does it switch only the verdict sentence, or the whole card
   treatment (stamped pillar, red border) as on a real roast result?
6. Does the mobile landing show the roast at all, given the header is full
   and the page already scrolls to the CTA? Desktop-only is an acceptable
   answer if you say it explicitly.
7. `ToneToggle` labels default to "Straight up" / "Roast me 🔥". On the
   landing, is the 🔥 on the label, on a badge, or absent?
8. Does the "Problem" section (§5) sit above the preview card, beside it, or
   between the H1 and the CTA?

## Handoff back

Drop the bundle under `design/ds-extension-03-return/`, or send it through
"Send to Claude Code Web". Direct `DesignSync` access needs an authorization
that only works from an interactive session on Antoine's machine, so the file
drop is the route that works.
