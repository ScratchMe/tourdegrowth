import { Button, Callout, Card, HubMountain, MetaLabel, ProseActions, ProsePage, ProseSection, ProseText } from "tour-de-growth";

/*
 * The whole prose page — header, reading column, footer. Nine families of
 * pages wear it: How it works, About, the glossary index and every term,
 * the four framework comparisons, the checklist, the diagnostic method, the
 * legal pages. They used to borrow How it works's page stylesheet; this is
 * that family as a component.
 *
 * The column is 760px so a table or a card can use it; running text inside
 * is capped at the reading measure and set at 400 weight in full ink. Grey
 * is for the lead and captions only. Every string below is the page's own.
 */

/** A content page, top to bottom: title, lead, a section, the caveat, the action — How it works, in its own words. */
export const Page = () => (
  <ProsePage locale="en" path="/how-it-works" title={"How Tour de Growth works"} lead={"Fifteen questions, three minutes, one honest AARRR score. Here's what we measure, why, and the limit to keep in mind before you take the number too seriously."}>
    <ProseSection heading={"How the score is calculated"}>
      <ProseText>{"Fifteen questions, three per stage. Each answer is worth a fixed number of points — nothing subjective, nothing an AI decides on the fly. Your five stage scores (out of 20 each) add up to your total (out of 100). The wording of your results comes from a set of pre-written verdicts matched to your score — the same wording for everyone with the same score."}</ProseText>
    </ProseSection>
    <Callout tone="caveat">
      <p>{"Tour de Growth gives a fast, directional estimate — not a professional audit. The score reflects your own answers to 15 questions, useful as a conversation starter, not a final verdict."}</p>
    </Callout>
    <ProseActions>
      <Button size="lg" href="/quiz">
        {"Start your Tour →"}
      </Button>
    </ProseActions>
  </ProsePage>
);

/* The term page's own two styles (`glossary/[term]/page.module.css`): the back
   link is a muted mono line, the definition a large line of body text. */
const BACK_LINK = {
  font: "var(--meta-md)",
  color: "var(--text-muted)",
  textDecoration: "underline",
  textUnderlineOffset: 3,
  width: "fit-content",
} as const;
const DEFINITION = { font: "var(--body-lg)", color: "var(--text-body)" } as const;

/**
 * `titleSize="term"` — a glossary term is a word, not a headline, so it takes
 * the smaller stencil at every width. The back link goes in `kicker`, styled
 * by the page (muted mono, underlined); the definition sits in the page's one
 * raised card, and "En pratique" carries the longer explanation — as
 * /fr/glossary/cac is built.
 */
export const Term = () => (
  <ProsePage
    locale="fr"
    path="/glossary/cac"
    title={"CAC — Coût d'Acquisition Client"}
    titleSize="term"
    kicker={
      <a href="/fr/glossary" style={BACK_LINK}>
        {"← Glossaire"}
      </a>
    }
  >
    <Card elevation="raised">
      <p style={DEFINITION}>{"Coût d'Acquisition Client : combien tu dépenses en moyenne pour obtenir un nouveau client."}</p>
    </Card>
    <ProseSection heading={"En pratique"} headingStyle="label">
      <ProseText>{"Le calcul de base : dépenses totales de vente et marketing sur une période, divisées par le nombre de nouveaux clients obtenus sur cette même période. Le piège le plus fréquent est d'oublier d'y inclure les salaires de l'équipe commerciale/marketing et le coût des outils — un CAC qui ne compte que la pub payante est presque toujours sous-estimé. Le CAC n'a de sens qu'à côté de la LTV : un CAC bas sur un produit à faible valeur peut coûter plus cher qu'un CAC élevé sur un produit à forte rétention."}</ProseText>
    </ProseSection>
  </ProsePage>
);

/**
 * `introWorld="night"` — the game hub's poster (design I + B, 2026-09-28):
 * the intro set in the night as wide as the screen, stars and an amber glow,
 * the eyebrow in the night's amber, the five zones drawn in `note` as a
 * mountain (the third, retention, the one open). The column below stays on
 * paper — here the hub's way back to the Tour. Only the game's hub wears it.
 * A page of a space sets its header and footer on the app shell's 1040px
 * column, not the reading one (2026-10-02), so the band is as wide as the
 * engine's. At this card's width it is still in its under-900px form: the
 * legs' names go to screen readers.
 */
export const NightIntro = () => (
  <ProsePage
    locale="fr"
    path="/game"
    space="game"
    introWorld="night"
    title={"Le côté obscur"}
    kicker={
      <MetaLabel size="xs" style={{ color: "var(--space-game-night-accent)" }}>
        {"Tour de Growth · le jeu"}
      </MetaLabel>
    }
    lead={"Le Tour te dit où ta croissance cale et quoi faire. Ici, c'est l'inverse : cinq années dans cinq entreprises, avec un DG qui veut le chiffre et des astuces pour l'obtenir, nommées comme on les nomme en réunion. Tu y apprends à les reconnaître."}
    note={
      <HubMountain
        zones={[0, 1, 2, 3, 4].map((i) => ({ open: i === 2 }))}
        title={"Profil de la montagne"}
        legend={"cinq cols, cinq entreprises"}
      />
    }
  >
    <ProseSection heading={"Où en est ta croissance ?"}>
      <ProseText>{"Quinze questions, trois minutes, et l'étape qui te freine — pour de vrai, cette fois."}</ProseText>
      <div>
        <Button href="/quiz" variant="secondary">
          {"Faire le Tour →"}
        </Button>
      </div>
    </ProseSection>
  </ProsePage>
);
