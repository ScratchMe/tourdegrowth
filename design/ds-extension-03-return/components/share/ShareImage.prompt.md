`ShareImage` is the og:image layout for Satori. It is not mounted in the app and reads no CSS variables — every colour is a hex constant copied from `tokens/colors.css`, and any token change has to be re-copied here by hand.

```jsx
<ShareImage score={74} pillar="Retention" pillarScore={8}
  action="Take one month's cohort of new users and count how many are still active thirty days later."
  hookLine1="Retention is where this growth stalls." hookLine2="Where does yours?" />
```

**What gives, and why.** The original card carried five pillar rows on the right. They leave. The numeral (210px stencil, left), the header, the dashed rule and the bottom hook + URL do not move. In their place the right column carries the next move in a dashed-red card — the same "advice" grammar as `PriorityMove` on the page, so a reader who clicks through recognises it. Five scores are the least shareable thing on the image: they are re-derivable from the page, and nobody reposts a table. An action is a reason to post.

**Fit.** The move card is ~490px wide; the action at Inter 600 28px/1.3 wraps to five lines at 144 characters and the card ends above the hook. Do not shrink the type to fit a longer sentence — the library caps at 144.

**Tone.** `roast` adds the 6px red frame and the badge, exactly as before. The action itself has no roast variant; the hook lines carry the voice. The image is rendered in the author's language — the reader's locale is unknown to a crawler.

Level state: `pillar` undefined, `action` the fixed "Nothing is stalling you…" sentence, hook from the level verdict.
