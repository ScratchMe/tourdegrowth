Use `Segmented` when a reader picks one of two (at most three) states that are all visible at once. It is the base of `ToneToggle` and `LocaleSwitcher`; reach for it directly only if a third such control appears.

```jsx
<Segmented size="md" label="Tone" value={tone} onChange={setTone}
  options={[{ id: "straight", label: "Straight up" }, { id: "roast", label: "Roast me 🔥" }]}
  activeColor={(id) => id === "roast" ? "var(--paint-red)" : undefined} />

<Segmented size="compact" as="a" label="Language" value="en"
  options={[{ id: "en", label: "EN", href: "/en" }, { id: "fr", label: "FR", href: "/fr" }]} />
```

Rules. Every option is shown; never collapse to "the other one". The selected segment is filled `--ink-0` (or `--paint-red` for the roast tone, the only exception). Unselected segments are `--text-muted` on transparent — no sunken fill, the border does the work. `compact` is for headers only: mono uppercase, 32px tall, and the 6px transparent pad around it is what makes the 44px hit — do not strip it to "tighten" a header.

Never use it for navigation between pages of different content (tabs) or for on/off (that is a checkbox, which this system does not have yet). Never more than three options — past that it is a list.
