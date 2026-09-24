import { ProseText } from "tour-de-growth";

/*
 * A paragraph of running text: 17px, 400 weight, full ink, capped at the
 * reading measure (16px on a phone). The 500 weight belongs to the UI —
 * buttons, options — and grey belongs to leads and captions. Body copy in
 * grey at 500 is what made the prose pages tiring to read.
 */

/** In a column wider than the measure, the line still stops at a readable length. */
export const Paragraph = () => (
  <div style={{ maxWidth: 760 }}>
    <ProseText>
      Fifteen questions, three per pillar. Each answer is worth a fixed number of points — nothing
      subjective, nothing an AI decides on the fly. Your five pillar scores (out of 20 each) add up to
      your total (out of 100). The wording of your results comes from a set of pre-written verdicts
      matched to your score — same transparency, every time, for everyone.
    </ProseText>
  </div>
);

/** A link inside prose takes the system's link colour, not the browser's blue. */
export const WithLink = () => (
  <div style={{ maxWidth: 760 }}>
    <ProseText>
      Want the list itself, ready to work through? <a href="/en/growth-audit-checklist">The 15-point growth audit checklist</a>
    </ProseText>
  </div>
);
