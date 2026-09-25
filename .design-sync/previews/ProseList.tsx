import { ProseList } from "tour-de-growth";

/*
 * A list of running text. Each <li> takes the reading type. `ordered` when
 * the order means something — a scoring rule, the steps of an example.
 * Copy from /about, where this list explains the score.
 */

const wrap = { maxWidth: 680 } as const;

/** `ordered` — the scoring rule, where the order is the content. */
export const Ordered = () => (
  <div style={wrap}>
    <ProseList ordered>
      <li>
        Each question has three answers, worth 20, 7 or 0 points. No middle tier: either it is in
        place and measured, in place but unmeasured, or not there.
      </li>
      <li>
        A stage&apos;s raw total (0 to 60) is divided by 3 and rounded to the nearest whole number:
        that is the stage score, out of 20.
      </li>
      <li>The five rounded stage scores are added up to give the total out of 100.</li>
    </ProseList>
  </div>
);

/** Bullets — the same list when its order carries nothing. */
export const Bullets = () => (
  <div style={wrap}>
    <ProseList>
      <li>
        No AI touches the number. The score is a fixed rule, the same for everyone, and you can redo
        it by hand.
      </li>
      <li>
        The weakest stage is the one with the lowest score; ties go to whichever comes first in AARRR
        order.
      </li>
    </ProseList>
  </div>
);
