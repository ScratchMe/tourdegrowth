import { PatternCatalogue } from "tour-de-growth";

/*
 * December's catalogue: every trick of the level under its real name, in
 * three groups — the ones you used (open, with their status), the ones you
 * turned down and the ones that never came your way (each behind a
 * disclosure, closed in these stills). A group with no member is not drawn.
 * Each entry says the hidden effect, what the law says, a real case and how
 * to spot it. Copy: content/game/retention.ts (`patterns`, `catalogue`).
 */

const GROUPS = {
  used: "The ones you used",
  refused: "The ones you turned down",
  unseen: "The ones that never came your way",
};
const LABELS = { hiddenEffect: "Hidden effect", law: "What the law says", cas: "A real case", tell: "How to spot it" };

const BURY = {
  id: "bury",
  official: "Obstruction",
  meeting: "Declutter the subscription page",
  hiddenEffect: "Trust −5, radar +15, once, on the day it goes into production. The cancellations it prevents erode by 30% after three months.",
  law: 'Since 1 June 2023, French law has required that a subscription taken out online can be cancelled online, through a direct and easy path. It is article L215-1-1 of the French Consumer Code, known as the "three-click" law.',
  cas: "Basic-Fit was fined €68,500 by the DGCCRF, France's consumer protection authority, for a cancellation path that did not comply.",
  tell: "If you've been looking for the button for more than ten seconds, it isn't you. It's on purpose.",
};
const CALL = {
  id: "call",
  official: "Forced action",
  meeting: "Assisted cancellation",
  hiddenEffect: "Trust −10, radar +25, once, on the day it goes into production. The cancellations it prevents erode by 30% after three months.",
  law: "The same article requires cancellation to be possible online whenever the subscription was taken out online. A mandatory phone call is out of bounds.",
  cas: 'In the United States, Amazon agreed in 2025 to pay $2.5 billion, partly over its Prime cancellation flow, known internally as "Iliad", after an epic that never ends.',
  tell: "They sold it to you in one click. They keep you on the phone.",
};
const CASCADE = {
  id: "cascade",
  official: "Nagging",
  meeting: "Retention offers",
  hiddenEffect: "Trust −3, radar +8, once, on the day it goes into production. The cancellations it prevents erode by 30% after three months.",
  law: "The EU's Digital Services Act, the DSA, bans online platforms from interfaces designed to deceive or manipulate, including asking again for something already refused.",
  cas: "The site deceptive.design lists dozens of examples in its hall of shame, with Amazon and Google at the top.",
  tell: 'Every "No thanks" opens another door.',
};

const SHAME = {
  id: "shame",
  official: "Confirmshaming",
  meeting: "Custom decline button",
  hiddenEffect: "Trust −2, radar +3, once, on the day it goes into production. The cancellations it prevents erode by 30% after three months.",
  law: "Not banned outright in France, but the CNIL, France's data protection authority, lists it among deceptive designs, and it weighs when a practice is judged unfair.",
  cas: "It is the most documented dark pattern online: the decline button that makes you look like a fool.",
  tell: "The button says no for you, in words it puts in your mouth.",
};

const box = { padding: 24, maxWidth: 820 } as const;

/** All three groups: one used and still in production, one used then removed, one refused, one never seen. */
export const ThreeGroups = () => (
  <div style={box}>
    <PatternCatalogue
      eyebrow="The full catalogue"
      title="The eight tricks in this level, with their real names"
      lead="The ones you used, the ones you turned down, and the ones that never came your way. In meetings, they go by quiet names. Here are the real ones, and what the law says."
      groups={GROUPS}
      labels={LABELS}
      entries={[
        { ...BURY, group: "used", status: { label: "in production", removed: false } },
        { ...CASCADE, group: "used", status: { label: "removed", removed: true } },
        { ...CALL, group: "refused", status: null },
        { ...SHAME, group: "unseen", status: null },
      ]}
    />
  </div>
);

/** A clean year: nothing used, so the "used" group is not drawn at all. */
export const NothingUsed = () => (
  <div style={box}>
    <PatternCatalogue
      eyebrow="The full catalogue"
      title="The eight tricks in this level, with their real names"
      lead="The ones you used, the ones you turned down, and the ones that never came your way. In meetings, they go by quiet names. Here are the real ones, and what the law says."
      groups={GROUPS}
      labels={LABELS}
      entries={[
        { ...CALL, group: "refused", status: null },
        { ...BURY, group: "unseen", status: null },
        { ...CASCADE, group: "unseen", status: null },
      ]}
    />
  </div>
);
