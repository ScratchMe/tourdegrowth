import { ProseSection, ProseText } from "tour-de-growth";

/*
 * One section of a prose page: an optional <h2> and what follows it. Two
 * heading styles, chosen by what the heading names — a subject, or the kind
 * of section it is.
 */

const wrap = { maxWidth: 680 } as const;

/** `title` (default) — Inter 19px, a section of an article. */
export const Title = () => (
  <div style={wrap}>
    <ProseSection heading="How the score is calculated">
      <ProseText>
        Fifteen questions, three per pillar. Each answer is worth a fixed number of points — nothing
        subjective, nothing an AI decides on the fly.
      </ProseText>
    </ProseSection>
  </div>
);

/** `label` — tracked mono capitals: the glossary term page's rail ("In practice", "The formula"). */
export const Label = () => (
  <div style={wrap}>
    <ProseSection heading="In practice" headingStyle="label">
      <ProseText>Customer Acquisition Cost: how much you spend on average to acquire one new customer.</ProseText>
    </ProseSection>
  </div>
);
