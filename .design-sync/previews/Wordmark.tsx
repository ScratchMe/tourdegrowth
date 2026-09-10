import { Wordmark } from "tour-de-growth";

/*
 * The logotype. "TOUR DE" is ink, "GROWTH" is the brand red — that split is
 * the mark and it never changes.
 *
 * `as` exists only so the wordmark can be the page's real <h1> where it IS
 * the page title (the landing hero). Everywhere else it is a <div> inside a
 * header, and using "h1" there would give the page two titles.
 *
 * In a header, prefer WordmarkLink: the mark is the way home on every screen.
 */

/** The three sizes: `sm` mobile header, `md` desktop header, `lg` hero. */
export const Sizes = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: "flex-start" }}>
    <Wordmark size="sm" />
    <Wordmark size="md" />
    <Wordmark size="lg" />
  </div>
);

/** As the landing page's heading — the one place `as="h1"` is right. */
export const AsHeading = () => <Wordmark size="lg" as="h1" />;
