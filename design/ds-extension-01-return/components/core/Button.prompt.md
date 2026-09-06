Use `Button` for every action. Exactly one `primary` per screen — it is the filled red one, and its scarcity is what makes it work.

```jsx
<Button variant="primary" size="lg" fullWidth>Share my score</Button>
<Button variant="secondary">Take the Tour again</Button>
<Button variant="quiet">← Back</Button>
```

On mobile use `size="lg" fullWidth`; on desktop `size="md"` inline. Focus is a 3px ink outline at 3px offset — do not remove it. "Get my deep dive →" is a `secondary`, never a second primary.
