import { Wordmark } from "tour-de-growth";

/*
 * The logotype. "TOUR DE" is ink, "GROWTH" is the brand red — that split is
 * the mark and it never changes.
 *
 * `as` renders another element; the component keeps `h1` for a page whose
 * title the wordmark is. Nothing in the product uses it today: every header
 * renders the default <div>, and the landing's <h1> is its headline, not the
 * mark. A heading looks exactly like the <div>, so it has no cell.
 *
 * In a header, prefer WordmarkLink: the mark is the way home on every screen.
 */

/**
 * The three sizes. `md` (19px, the default) is every header's, and it drops
 * to the `sm` size under 760px on its own — an @media rule this card cannot
 * show. `sm` (15px) is fixed: the engine's slide deck uses it. `lg` (34px) is
 * the hero scale; nothing uses it today.
 */
export const Sizes = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-start" }}>
    <Wordmark size="sm" />
    <Wordmark size="md" />
    <Wordmark size="lg" />
  </div>
);
