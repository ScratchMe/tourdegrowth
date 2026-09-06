Use `Wordmark` wherever the brand name appears — headers, OG cards, the landing hero — never retype it by hand, and never colour the whole thing red.

```jsx
<Wordmark size="md" />
<Wordmark size="lg" as="h1" />
```

Sizes map to real placements: `sm` mobile header, `md` desktop header, `lg` hero and artboard titles. The word GROWTH carries `--paint-red`; TOUR DE stays ink. Uppercase is baked in — do not pass a lowercase string.
