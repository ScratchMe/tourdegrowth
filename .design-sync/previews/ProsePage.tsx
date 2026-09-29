import { Button, Callout, HubMountain, MetaLabel, ProseActions, ProsePage, ProseSection, ProseText } from "tour-de-growth";

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
    lead="Fifteen questions, three minutes, one honest AARRR score. Here's what we measure, why, and the limit to keep in mind before you take the number too seriously."
  >
    <ProseSection heading="How the score is calculated">
      <ProseText>
        Fifteen questions, three per stage. Each answer is worth a fixed number of points — nothing
        subjective, nothing an AI decides on the fly. Your five stage scores (out of 20 each) add up
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
        Coût d&apos;Acquisition Client : combien tu dépenses en moyenne pour obtenir un nouveau client.
      </ProseText>
    </ProseSection>
  </ProsePage>
);

/**
 * `introWorld="night"` — the game hub's poster (design I + B, 2026-09-28):
 * the intro set in the night as wide as the screen, stars and an amber glow,
 * the five zones drawn in `note` as a mountain. The column below stays on
 * paper. Only the game's hub wears it.
 */
export const NightIntro = () => (
  <ProsePage
    locale="fr"
    path="/game"
    space="game"
    introWorld="night"
    title="Le côté obscur"
    kicker={<MetaLabel size="xs">Tour de Growth · le jeu</MetaLabel>}
    lead="Le Tour te dit où ta croissance cale et quoi faire. Ici, c'est l'inverse : cinq années dans cinq entreprises, avec un DG qui veut le chiffre."
    note={
      <HubMountain
        zones={[0, 1, 2, 3, 4].map((i) => ({ open: i === 2 }))}
        title="Profil de la montagne"
        legend="cinq cols, cinq entreprises"
      />
    }
  >
    <ProseSection heading="Les cinq zones du Tour">
      <ProseText>Retention — S&apos;ils reviennent. Flixo, une appli de streaming.</ProseText>
    </ProseSection>
  </ProsePage>
);
