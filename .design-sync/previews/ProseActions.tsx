import { Button, ProseActions } from "tour-de-growth";

/*
 * The closing actions of a prose page: one primary, sometimes a secondary.
 * Side by side on a wide screen; stacked and full width under 760px.
 */

/** One action — the usual ending. */
export const Single = () => (
  <ProseActions>
    <Button size="lg" href="/quiz">
      Start your Tour →
    </Button>
  </ProseActions>
);

/** A primary and a secondary, as a glossary term page ends. */
export const Pair = () => (
  <ProseActions>
    <Button size="lg" href="/quiz">
      Start your Tour →
    </Button>
    <Button size="lg" variant="secondary" href="/en/how-it-works">
      How it works
    </Button>
  </ProseActions>
);
