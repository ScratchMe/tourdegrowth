Use `ShareCard` once on the result page, for owner and visitor alike. It shows the real `og:image` of this result and absorbs the "Share this result" action, which leaves the CTA row — the row then holds the primary alone.

```jsx
<ShareCard
  src={`/og/${id}.png`}
  alt="Share image: 74/100, next move on Retention"
  caption="Your share image"
  saveHref={`/og/${id}.png`}
  onShare={share} />
```

**Position.** Desktop: left column, under the pillar chips — the picture of the result sits under the result. Mobile: after the primary CTA, before the disclaimer.

**Frame.** Sunken paper (`--surface-sunken`), solid ink edge, the image itself on a solid ink edge with `--radius-button`. Sunken because this is an artefact of the result, not a surface of it; the raised card budget is already spent on the score. Width follows the column; height comes from `--ratio-share`.

**Actions.** One secondary `Button` for Share (never primary — the primary on this screen is "Take your own Tour →") and one nav-weight link for Save. Nothing else: no platform icons (the brand has no icon files), no copy-link field.

The image is rendered server-side by Satori in the author's language and tone; the component never re-renders it and never localises it for the reader.
