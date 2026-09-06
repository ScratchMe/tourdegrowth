Use `SiteFooter` at the bottom of every page that is not a tunnel — landing, result (real and sample), How it works, glossary index and terms, both 404s. Its `width` matches the page container above it so the links align with the content.

```jsx
<SiteFooter
  width="reading"
  links={[{ label: "How it works", href: "/how-it-works" }, { label: "Glossary", href: "/glossary" }]}
  credit={<>A side project by <a href="https://…" rel="author">Antoine Berthaud — Senior Growth PM</a>.</>}
/>
```

The footer is text on stone under the same 2px dashed rule as the header: the page is a ticket with a top and a bottom edge, and that rule *is* the footer's signature. Do not add a card, a Tag, a bib, a second rule or a wordmark to give it "more presence" — a footer that competes for the screen's effects budget steals from the score.

Nav links are `--label-nav` muted with a 2px underline in `--border-divider` (every line in this system is 2px; there is no 1px anything), turning `--border-hard` on hover. The credit link is a normal link: `--text-link` (red-deep, AA on stone), hover `--text-link-hover` (ink) — the same direction as every other link, not the reverse. Both links carry a 44px hit height.

The credit line is `--meta-xs` sentence case, one sentence, verbatim from `UI_STRINGS.footer`. The CV link must stay followable with its descriptive anchor — it exists for search as much as for people.

Never in `/quiz` or `/deep-dive`. Never a third link, a copyright line, social links or a language switch — the switch lives in the header.
