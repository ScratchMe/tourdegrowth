Use `ToneToggle` on the result screen to swap between the two pre-written tones.

```jsx
<ToneToggle value={tone} onChange={setTone} />
```

The 🔥 in "Roast me" is the only emoji the brand uses, and only in this label and its matching tag. Switching tone must never change the score or the pillar breakdown — same numbers, different words. Active roast is red; active straight is ink.

Since extension 01 the same grammar exists as `core/Segmented` (`size="md"`, `activeColor` red for roast). ToneToggle can be rebased on it with no visual change; keep this wrapper so call sites do not carry the option list.
