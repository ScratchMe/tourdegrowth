# Design brief 02 — the roast is the hook, and nobody sees it

*Tour de Growth · from the codebase to Claude Design · 2026-09-07*

## The one question

**How does a first-time visitor learn that the roast tone exists, before
answering fifteen questions?**

Everything below is context for answering that. We are not asking for a
component we already know we want — we are asking you to decide whether one
belongs on the landing page at all, and if so, what it is.

## Why this is being reopened

The roast tone is the most shareable thing this product has. The original
brief gave it its own screen (§06a), its own result treatment (§04, the
stamped weakest pillar), and its own share image (§03, red border and a
`🔥 ROAST MODE` badge). It is the reason a result gets posted rather than
closed.

A visitor arriving on the landing page cannot know it exists. The nav item
"Roast mode" was **deliberately cut** from the MVP — `SPEC.md` §12 says so
explicitly, and that decision was correct at the time: there was no page
behind the link. The tone selector is the first and only place the roast is
offered, and it appears **after the fifteenth question** (screenshot 04).

So this is not an omission to quietly fill. It is a decision to revisit now
that the product's goal has moved from "ship an MVP" to "become a reference
people link to". Antoine has asked for your read on it rather than ours
(2026-09-07).

## What is on the landing page today

Screenshots `01-landing-en-desktop.png` and `02-landing-fr-mobile.png`,
2× retina from a real production build.

Reading down: header (wordmark, "How it works", "Glossary", `EN|FR`, compact
CTA), H1 with the red accent on "stall?", subtitle, two CTAs, and a **preview
score card** — a sample 74/100 with its five pillar chips (`03-preview-card-en.png`).

That preview card is the only place on the page where the product's actual
output is shown. It is currently the neutral tone, silently. A reader has no
way to know there is another one.

On mobile, the header drops both nav links and the compact CTA (`REVIEW.md`
R-21: keeping them made the page scroll sideways in French). Whatever you
propose has to survive that: **the mobile header has no room left.**

## The three shapes we can see, and what is wrong with each

We are listing these to save you time, not to steer you. If the answer is a
fourth shape, or "do nothing", say so with your reasoning.

**A — a tone toggle on the preview card.** `core/Segmented` already exists,
and `result/ToneToggle` is already built on it (ported in extension 01,
never wired — see below). Flipping it would swap the sample card's verdict
sentence between the two tones, in place, on the landing. It shows rather
than tells, which is the strongest version of this. The risk: the landing
page's job is to start the Tour, and an interactive toy above the fold can
absorb the click the CTA needs.

**B — a line of roast copy under the subtitle.** Cheapest, and honest about
what it is: a promise, not a demonstration. The risk is that it reads as a
feature list on a page whose whole design avoids feature lists.

**C — a second preview card, or a card that alternates.** Shows both tones
without asking for a click. The risk is doubling the heaviest element on the
page, and the mobile layout is already tight.

## Constraints that are not up for discussion

Restated because each one bites on at least one of the shapes above.

- **The primary CTA stays the primary CTA.** Whatever this is, "Start your
  Tour →" must remain the single most prominent action on the page.
- **Neutral remains the default everywhere** (`SPEC.md` §6bis). Roast is an
  explicit opt-in; nothing on the landing may make it look like the standard
  mode, or pre-select it.
- **The anti-mockery guardrail is not a design element.** The roast targets
  the strategy, never the person. It is hard-coded in the model prompt. If a
  landing treatment implies personal mockery, it misrepresents the product.
- **One emoji, ever.** The `🔥` of the roast badge is the only emoji the
  brand uses (`ToneToggle.prompt.md`). Do not introduce a second glyph.
- **AA contrast is enforced in CI**, on six screens, with **no exceptions
  left** (`e2e/accessibility.spec.ts`, `KNOWN_CONTRAST_GAPS` is empty). A
  pair below 4.5:1 for normal text turns the build red. If a treatment needs
  a quieter or louder red, it needs a token that passes — not an exception.
  The reds available: `--paint-red #D2402C` (accent), `--paint-red-action
  #CC3E2B` (any white label on red), `--paint-red-deep #A32E1F` (red text on
  paper), `--paint-red-wash #F3D9D2` (soft red surface).
- **The mobile header is full.** See above.
- **No new page.** "Roast mode" as a nav destination is out of scope here;
  the question is about the landing page itself.

## What already exists that you may reuse

| Component | State | Note |
|---|---|---|
| `core/Segmented` | shipped | two- or three-option segmented control, button or link form |
| `result/ToneToggle` | **built, never wired** | `Segmented` wrapper with the two tone labels and the `🔥`. Ported in extension 01 for completeness; deliberately not used on the result screen, because that screen shows exactly two CTAs and a symmetric toggle would reopen that decision (`REVIEW.md` R-23, reaffirmed by Antoine). Using it **on the landing** does not conflict with that. |
| `result/ScoreDisplay`, `result/PillarChip` | shipped | what the preview card is made of |
| `core/Card` | shipped | four tones, including `alert` (solid red wash) and `outlineAlert` (dashed red on paper) |
| `brand/MetaLabel` | shipped | the mono eyebrow used everywhere |

## The copy that exists, so you can design against real words

Final, approved product copy — not placeholder.

| Where | EN | FR |
|---|---|---|
| Tone selector title | How do you want your results? | Comment veux-tu tes résultats ? |
| Neutral option | **Straight up** — Clear, constructive, no sugar-coating. | **Neutre** — Clair, constructif, sans détour. |
| Roast option | **Roast me** — Same insights, sharper tongue. All in good fun. | **Roast me** — Mêmes constats, un ton plus mordant. Toujours bienveillant. |
| Result badge | 🔥 Roast Mode | 🔥 Roast Mode |
| Share image badge | 🔥 ROAST MODE | 🔥 ROAST MODE |
| Weakest pillar, roast | 08/20 RETENTION — dead last | 08/20 RETENTION — bon dernier |

Note that "Roast me" is **not translated** — same treatment as the AARRR
pillar names, it is a product label rather than a sentence.

**If your proposal needs new copy, write it in both languages and mark it as
new.** It goes through Antoine's review like everything else; we will not
invent the roast voice on our side.

## What the roast actually looks like downstream

So the landing treatment doesn't over- or under-promise:

- `06-result-roast-en.png` — the roast result screen: red badge in the
  header, the weakest pillar stamped and rotated, "Credit where it's due"
  instead of "Strengths".
- `07-og-roast.png` — the share image a roast result produces. This is the
  artefact the growth loop actually moves.
- `04-tone-selector-en.png` — where the choice is offered today.
- `05-how-it-works-en.png` — the page a curious visitor reaches from the
  header; it explains the two tones in prose, which is the only place the
  roast is described before question fifteen.

## What we need back

Same shape as the extension 01 bundle, so the port is mechanical:

- **your answer to the one question**, with the reasoning — including "none
  of these, do nothing" if that is your read;
- if it is a component: React + `.d.ts` + `.prompt.md`, the `.prompt.md`
  usage rules being the part we rely on most;
- if it is a composition of existing components: a note saying so, with the
  arrangement;
- any **new tokens** in `tokens/*.css`, never a new hex inline;
- both languages, mobile 390px and desktop 1280px;
- inline styles are fine — we port to CSS Modules.

## Open questions, please resolve before delivering

1. Does the roast belong **above** the fold (competing for attention with
   the CTA) or **at** the preview card, which sits below it?
2. If a toggle: what does it switch — only the sample verdict sentence, or
   the whole card treatment (stamped pillar, red border) as on a real roast
   result? The second is a stronger demonstration and a much heavier
   element.
3. Should the mobile version show anything at all, given the header is full
   and the page already scrolls to the CTA? A treatment that only exists on
   desktop is acceptable if that is your call — say it explicitly.
4. `ToneToggle` labels default to "Straight up" / "Roast me 🔥". On the
   landing, is the `🔥` on the label, on a badge, or absent?

## Handoff back

Drop the bundle under `design/ds-extension-02-return/`, or send it through
"Send to Claude Code Web". Direct `DesignSync` access needs an authorization
that only works from an interactive session on Antoine's machine, so the
file drop is the route that works.
