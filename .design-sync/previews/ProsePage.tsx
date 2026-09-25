import { Button, Callout, ProseActions, ProsePage, ProseSection, ProseText } from "tour-de-growth";

/*
 * The whole prose page — header, reading column, footer. Nine families of
 * pages wear it: How it works, About, the glossary index and every term,
 * the four framework comparisons, the checklist, the diagnostic method, the
 * legal pages. They used to borrow How it works's page stylesheet; this is
 * that family as a component.
 *
 * The column is 760px so a table or a card can use it; running text inside
 * is capped at the reading measure and set at 400 weight in full ink. Grey
 * is for the lead and captions only.
 */

/** A content page, top to bottom: title, lead, sections, a caveat, the action. */
export const Page = () => (
  <ProsePage
    locale="en"
    path="/how-it-works"
    title="How Tour de Growth works"
    lead="Fifteen questions, three minutes, one honest AARRR score. Here's exactly what we're measuring, and why — plus the one thing you should know before you take it too seriously."
  >
    <ProseSection heading="How the score is calculated">
      <ProseText>
        Fifteen questions, three per pillar. Each answer is worth a fixed number of points — nothing
        subjective, nothing an AI decides on the fly. Your five pillar scores (out of 20 each) add up
        to your total (out of 100).
      </ProseText>
    </ProseSection>
    <Callout tone="caveat">
      <p>Tour de Growth gives a fast, directional estimate — not a professional audit.</p>
    </Callout>
    <ProseActions>
      <Button size="lg" href="/quiz">
        Start your Tour →
      </Button>
    </ProseActions>
  </ProsePage>
);

/**
 * `titleSize="term"` — a glossary term is a word, not a headline, so it takes
 * the smaller stencil at every width. A back link goes in `kicker`.
 */
export const Term = () => (
  <ProsePage
    locale="fr"
    path="/glossary/cac"
    title="CAC — Coût d'Acquisition Client"
    titleSize="term"
    kicker={<a href="/fr/glossary">← Glossaire</a>}
  >
    <ProseSection heading="En pratique" headingStyle="label">
      <ProseText>
        Coût d&apos;Acquisition Client : combien tu dépenses en moyenne pour obtenir un nouveau client.
      </ProseText>
    </ProseSection>
  </ProsePage>
);
