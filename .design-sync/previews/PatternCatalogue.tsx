import { PatternCatalogue } from "tour-de-growth";

/*
 * December's catalogue: every trick of the level under its real name, in
 * three groups — the ones you used (open, with their status), the ones you
 * turned down and the ones that never came your way (each behind a
 * disclosure, closed in these stills). A group with no member is not drawn.
 * Each entry says the hidden effect, what the law says, a real case and how
 * to spot it.
 *
 * Props are what the island passes (`GameIsland.tsx`): the heading, group
 * and fact labels from the level's `catalogue` copy, and `entries` =
 * `decemberContent(ctx, state).catalogue` — always the level's EIGHT tricks,
 * in `darkOrder`, never only the ones played (`patternCatalogue`). A trick's
 * text does not depend on the year, only its group and status do, so each
 * is written once below, as the builder returns it. Copy:
 * content/game/retention.ts (`patterns`, `catalogue`, `cards`).
 */

const GROUPS = {
  used: "The ones you used",
  refused: "The ones you turned down",
  unseen: "The ones that never came your way",
};
const LABELS = { hiddenEffect: "Hidden effect", law: "What the law says", cas: "A real case", tell: "How to spot it" };

const PDEF = {
  id: "pdef",
  official: "Preselection and visual interference",
  meeting: "Pause up front",
  hiddenEffect: "Trust −4, radar +10, once, on the day it goes into production. The cancellations it prevents erode by 30% after three months.",
  law: "The CNIL, France's data protection authority, describes this diversion of attention in its resources on deceptive design: the button pushed forward is not the one the user is looking for.",
  cas: "Offering a pause before cancellation has become common in streaming. Switching it back on without warning is something else.",
  tell: "The big button isn't the one you're looking for.",
};

const BURY = {
  id: "bury",
  official: "Obstruction",
  meeting: "Declutter the subscription page",
  hiddenEffect: "Trust −5, radar +15, once, on the day it goes into production. The cancellations it prevents erode by 30% after three months.",
  law: "Since 1 June 2023, French law has required that a subscription taken out online can be cancelled online, through a direct and easy path. It is article L215-1-1 of the French Consumer Code, known as the \"three-click\" law.",
  cas: "In 2023, Basic-Fit was fined €68,500 by the consumer protection office of France's Nord département, for conduct that predates this law, notably cancellation terms not properly disclosed before people subscribed.",
  tell: "If you've been looking for the button for more than ten seconds, it isn't you. It's on purpose.",
};

const CASCADE = {
  id: "cascade",
  official: "Nagging",
  meeting: "Retention offers",
  hiddenEffect: "Trust −3, radar +8, once, on the day it goes into production. The cancellations it prevents erode by 30% after three months.",
  law: "Repeated and insistent solicitations that hinder the exercise of a right, such as the right to cancel, are an aggressive commercial practice under French law, article L121-6 of the Consumer Code. For online platforms, the EU's Digital Services Act also gives asking again for a choice already made as an example.",
  cas: "The site deceptive.design lists examples of it in its hall of shame, including some from Google.",
  tell: "Every \"No thanks\" opens another door.",
};

const SHAME = {
  id: "shame",
  official: "Confirmshaming",
  meeting: "Custom decline button",
  hiddenEffect: "Trust −2, radar +3, once, on the day it goes into production. The cancellations it prevents erode by 30% after three months.",
  law: "Not specifically banned in France, but the CNIL, France's data protection authority, lists it among deceptive designs, under the name \"emotional blackmail\".",
  cas: "It is one of the best-known dark patterns: the decline button that makes you look like a fool.",
  tell: "The button says no for you, in words it puts in your mouth.",
};

const CALL = {
  id: "call",
  official: "Forced action",
  meeting: "Assisted cancellation",
  hiddenEffect: "Trust −10, radar +25, once, on the day it goes into production. The cancellations it prevents erode by 30% after three months.",
  law: "The same article requires cancellation to be possible online whenever the subscription was taken out online. A mandatory phone call is out of bounds.",
  cas: "In the United States, Amazon agreed in 2025 to pay $2.5 billion, partly over its Prime cancellation flow, known internally as \"Iliad\", after an epic that never ends.",
  tell: "They sold it to you in one click. They keep you on the phone.",
};

const SOCIAL = {
  id: "social",
  official: "Fake social proof",
  meeting: "Social proof at exit",
  hiddenEffect: "Trust −5, radar +12, once, on the day it goes into production. The cancellations it prevents erode by 30% after three months.",
  law: "Inventing friends or figures to sway a decision is a misleading commercial practice under French law, article L121-2 of the Consumer Code.",
  cas: "Fake stock gauges and fake visitor counters are among the practices the DGCCRF, France's consumer protection authority, checks on shopping sites.",
  tell: "First names you don't know, round numbers that land just right.",
};

const NOTICE = {
  id: "notice",
  official: "Hidden cost",
  meeting: "Contractual notice",
  hiddenEffect: "Trust −5, radar +12, once, on the day it goes into production. The cancellations it prevents erode by 30% after three months.",
  law: "Cancellation terms, notice period included, must be stated before you subscribe, not when you try to leave. Article L221-5 of the French Consumer Code.",
  cas: "In the United States, Adobe agreed in 2026 to a $150 million settlement, half a civil penalty and half free services, to resolve claims that it had not properly disclosed its early termination fees.",
  tell: "One last charge nobody had told you about.",
};

const STREAK = {
  id: "streak",
  official: "Addictive design",
  meeting: "Streak notifications",
  hiddenEffect: "Trust −4, radar +4, once, on the day it goes into production. The cancellations it prevents erode by 30% after three months.",
  law: "The EU's upcoming Digital Fairness Act, with a proposal expected at the end of 2026, is set to address addictive design; the Commission's consultation gives losing a streak as an example. In France, the 2024 \"Children and screens\" expert commission already denounced addictive designs and endless notifications.",
  cas: "Daily streaks have become a central hook in many learning and gaming apps. They play on the fear of losing, not on the wish to come back.",
  tell: "The app talks about what you'll lose, never about what you'll find.",
};

const box = { padding: 24, maxWidth: 820 } as const;

/**
 * All three groups, and both statuses: a year played through the reducer,
 * found by a random walk (`handIds` + `toggle` + `run`) — annual plan + pause
 * offer, assisted cancellation + pre-billing reminder, recommendations +
 * three-click cancellation, then cleanup + declutter the subscription page
 * (the CEO's last order); it ends `labyrinth`. That last quarter's cleanup
 * took the assisted cancellation out ("removed") while the decluttered page
 * went live ("in production"); four tricks were dealt and turned down, two
 * never came.
 */
export const ThreeGroups = () => (
  <div style={box}>
    <PatternCatalogue
      eyebrow="The full catalogue"
      title="The eight tricks in this level, with their real names"
      lead="The ones you used, the ones you turned down, and the ones that never came your way. In meetings, they go by quiet names. Here are the real ones, and what the law says."
      groups={GROUPS}
      labels={LABELS}
      entries={[
        { ...PDEF, group: "refused", status: null },
        { ...BURY, group: "used", status: { label: "in production", removed: false } },
        { ...CASCADE, group: "refused", status: null },
        { ...SHAME, group: "refused", status: null },
        { ...CALL, group: "used", status: { label: "removed", removed: true } },
        { ...SOCIAL, group: "refused", status: null },
        { ...NOTICE, group: "unseen", status: null },
        { ...STREAK, group: "unseen", status: null },
      ]}
    />
  </div>
);

/**
 * A clean year — reference year A (`PATH_A`, ending `applause`): nothing
 * used, so the "used" group is not drawn at all; the five tricks the hands
 * dealt are turned down, the three later ones never came.
 */
export const NothingUsed = () => (
  <div style={box}>
    <PatternCatalogue
      eyebrow="The full catalogue"
      title="The eight tricks in this level, with their real names"
      lead="The ones you used, the ones you turned down, and the ones that never came your way. In meetings, they go by quiet names. Here are the real ones, and what the law says."
      groups={GROUPS}
      labels={LABELS}
      entries={[
        { ...PDEF, group: "refused", status: null },
        { ...BURY, group: "refused", status: null },
        { ...CASCADE, group: "refused", status: null },
        { ...SHAME, group: "refused", status: null },
        { ...CALL, group: "refused", status: null },
        { ...SOCIAL, group: "unseen", status: null },
        { ...NOTICE, group: "unseen", status: null },
        { ...STREAK, group: "unseen", status: null },
      ]}
    />
  </div>
);
