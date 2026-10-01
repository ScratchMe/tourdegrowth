# DefinitionTrigger — what extension 05 changes

Once the stage rows stop looking pressable, the `?` is the one thing on a
row to touch, and it has to say so. Today it says the opposite:

- In this system a **dashed** edge means "not yet" (in red, "advice"). A
  dashed ring around a `?` also reads as a loading spinner, which is how it
  looks in the production screenshots.
- It has **no hover**. Its "open" state is a border colour shift on a 16px
  ring, invisible unless two triggers sit side by side (its own story says
  so).

| | Was | Now |
|---|---|---|
| Edge | 2px **dashed**, the tone's colour | 2px **solid**, `currentColor`: a real edge, the system's sign of a control |
| Size | 16px drawn, 44px tapped | the same, now `--trigger-size` |
| Glyph | `--meta-2xs` | the same at 700, so the `?` holds inside a 12px hole |
| Hover | none | pointer only: ring and glyph go to body ink (`--trigger-hover`) |
| Open | ink border | **the inverse fill**: ink disc with a paper `?` on paper, an amber disc with a night `?` at night (`--trigger-open-*` = `--state-selected-*`). The panel's trigger says "I'm the one talking" in the system's one language for "this one" |
| Focus | the system ring, tight offset | unchanged |
| Tones | muted · ink · alert | unchanged |

**It reaches the quiz too**, where the trigger sits inside question text,
right after a jargon term ("Do you know your customer acquisition cost [?],
even roughly?"). I think it helps there for the same reasons: a dashed ring inside a
question is the same "not yet" spinner. Inside 25–34px question type, a solid
16px ring is just as quiet. Check `QuestionCard` and `GlossaryTerm`'s `Open`
and `French` stories during the port. Nothing else about the trigger
changes: same `<button>`, same label, same 44px disc, same `aria-expanded`.

`DefinitionPopover` and `GlossaryTerm` do not change.

`DefinitionTrigger.css` in this folder is the reference; lines that changed
are marked ◆.

Contrast: the ring and glyph at rest measure 5.81 on the page and 7.20 on a
card (paper), and 8.28 / 7.70 at night. On the alert wash they measure 5.28
on paper and 5.56 at night. Open, the glyph on the disc is 16.06 on paper and
10.13 at night, and the disc against the page is 12.97 on paper and 10.13 at
night.
