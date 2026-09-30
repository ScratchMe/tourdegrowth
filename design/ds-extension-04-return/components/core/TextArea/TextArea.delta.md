# TextArea — what extension 04 changes

**TextArea changes to match the new fields**, not the other way round. It
defined "what any future input looks like here", and the fields keep most of
it — the paper fill, the 2px ink edge, the soft limit, the honest counter —
but four things it had are wrong for a family of fields:

| | Was (ext. 01) | Now (ext. 04) | Why |
|---|---|---|---|
| Radius | `--radius-panel` (14px) | `--radius-field` (6px) | A field is not a panel or a button; one radius for every field |
| Value type | `--body-md` (15px) | `--field-value` (16px) | Under 16px, iOS Safari zooms the page on focus |
| Focus offset | `--focus-offset` (3px) | `--focus-offset-tight` (2px) | One ring, drawn the same on every control |
| Over the limit | red edge at 2px | red edge at 3px (`--field-edge-invalid`) | Survives greyscale; the same edge as an invalid field |

And three additions so a `Field` can wrap it (both features already do, by
hand):

- `aria-describedby` passes through, so the Field's hint and message are read
  with it; the counter's id is appended.
- `invalid` (from the Field's `error`) takes the same 3px red edge.
- `label` becomes **optional inside a Field**: the Field's `<label for>`
  names it, and an `aria-label` would override the visible name. It stays
  required where the TextArea stands alone under a `QuestionCard`.

Unchanged: no resize handle, no floating label, nothing inside the field, the
counter under it, right-aligned, always shown (a multi-line field has the room
a one-line field does not), and typing never blocked.

`TextArea.css` and `TextArea.jsx` in this folder are the reference; lines that
changed are marked ◆.
