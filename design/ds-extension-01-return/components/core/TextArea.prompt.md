Use `TextArea` wherever a person types free text. Today that is one place: the last Deep dive screen. It also defines what any future input looks like in this system — a flat paper `Card` you type into: `--surface-card`, 2px solid ink, `--radius-panel`, 16px padding, `--body-md`.

```jsx
<TextArea
  value={text}
  onChange={setText}
  maxLength={500}
  placeholder="E.g.: we sell to accounting firms, long sales cycle, trust is a bigger blocker than price..."
  label="Any specific context we should know about? (optional)"
  describedBy="free-context-helper"
/>
```

Focus is the system focus ring: 3px `--focus-ring` outline at 3px offset (set it in the CSS Module on `:focus-visible`; the component removes the default outline so the ring can be uniform). No hard shadow, no dashed border — the field spends its one effect on the solid edge.

The counter is right-aligned `--meta-xs` mono and always neutral until the count passes `maxLength`; then it turns `--text-alert` and the field border turns solid `--field-border-alert`. There is no amber, no "50 left" warning, no shake, and input is never blocked. Solid red is diagnosis: the reader is over, they can see it, they decide.

No resize handle, no floating label, no icon inside the field, no character-count inside the field. Placeholder is `--text-muted`, sentence case, and reads as an example ("E.g.: …"), never as the field's name. Minimum height is `--field-min-height` (120px); let it grow with content rather than scroll where the layout allows.
