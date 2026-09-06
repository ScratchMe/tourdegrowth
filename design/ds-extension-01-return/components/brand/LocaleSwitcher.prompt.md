Use `LocaleSwitcher` in the header of every page that is not a tunnel: landing, How it works, glossary, and the result page — where it is the only way a reader of a shared link changes the language of the verdict.

```jsx
<header>
  <Wordmark />
  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-8)" }}>
    <LocaleSwitcher current={lang} hrefs={{ en: "/", fr: "/fr" }} />
    <nav>…</nav>              {/* hidden under 760px */}
    <Button size="compact">…</Button>
  </div>
</header>
```

It always sits at the right edge of the header row, before the nav links on desktop; on mobile it is the only thing next to the Wordmark. Both languages are always shown — the filled one is current, and the group is named for screen readers. Never reduce it to a single "FR" link: that hides that a choice exists and is ambiguous about which language it names.

It renders links, not buttons. Switching is a full page load by design (so `<html lang>` and the `hreflang` pair are right); do not wire it to client state.

Never in `/quiz` or `/deep-dive`: the tunnels have no exits and no language change mid-run. Never in the footer — one switch per page, in the header. The result-page header carries only Wordmark + LocaleSwitcher; the "Stage 5/5 — Finished · 15/15 answered" meta line is dropped there (the score is the proof it is finished).
