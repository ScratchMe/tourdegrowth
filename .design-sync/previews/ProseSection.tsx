import { ProseSection, ProseText } from "tour-de-growth";

/*
 * One section of a prose page: an optional <h2> and what follows it. Two
 * heading styles, chosen by what the heading names — a subject, or the kind
 * of section it is.
 */

const wrap = { maxWidth: 680 } as const;

/** `title` (default) — Inter 19px, a section of an article: How it works's scoring section. */
export const Title = () => (
  <div style={wrap}>
    <ProseSection heading="How the score is calculated">
      <ProseText>
        Fifteen questions, three per stage. Each answer is worth a fixed number of points — nothing subjective, nothing
        an AI decides on the fly. Your five stage scores (out of 20 each) add up to your total (out of 100). The wording
        of your results comes from a set of pre-written verdicts matched to your score — the same wording for everyone
        with the same score.
      </ProseText>
    </ProseSection>
  </div>
);

/** `label` — tracked mono capitals: the glossary term page's rail ("In practice", "The formula"). */
export const Label = () => (
  <div style={wrap}>
    <ProseSection heading="In practice" headingStyle="label">
      <ProseText>
        The basic calculation: total sales and marketing spend over a period, divided by the number of new customers
        acquired in that same period. The most common trap is forgetting to include sales/marketing salaries and tool
        costs — a CAC that only counts paid ad spend is almost always underestimated. CAC only means something next to
        LTV: a low CAC on a low-value product can end up costing more than a high CAC on a highly retentive one.
      </ProseText>
    </ProseSection>
  </div>
);
