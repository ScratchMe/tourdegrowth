# Disclosure — delta (design system extension 07)

**Why.** Two of the engine's new screens open a disclosure from elsewhere:

- the trap (`TrapNote`) says "Write it in your definition" and carries a
  quiet button, "Write your definition", that opens the sheet's closed
  "Your definition and a note";
- a returning person who chose their tools in Settings gets "Where to find
  it" open on the number they are filling, and the board's states need a
  disclosure drawn open.

Today `Disclosure` is a native `<details>` with no way to set or read
`open`.

## Props: three new, all optional — nothing changes for today's callers

```ts
export interface DisclosureProps {
  summary: React.ReactNode;
  children: React.ReactNode;
  size?: "md" | "sm";
  rule?: boolean;
  className?: string;
  "data-testid"?: string;
  /** NEW: open on first render, then the reader's (uncontrolled). */
  defaultOpen?: boolean;
  /** NEW: controlled. With `open`, pass `onOpenChange`. */
  open?: boolean;
  /** NEW: called from the native `toggle` event with the new state. */
  onOpenChange?: (open: boolean) => void;
  /** NEW: so another control can point at it (aria-controls) and scroll. */
  id?: string;
}
```

## Behaviour

Still a native `<details>`/`<summary>`: keyboard, find-in-page and the
search engines' reading of a closed `<details>` are unchanged (brief 07,
"What must stay" 11). `open` maps to the attribute; `onOpenChange` listens
to `toggle`. No markup or CSS change.

## Usage rule to add to Disclosure.prompt.md

> Open a disclosure from elsewhere only when the other control names what it
> opens ("Write your definition" → "Your definition and a note"). Never open
> one on first paint because it "might help": folded is the default.
