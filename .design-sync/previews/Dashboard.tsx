import { Dashboard, NightSurface } from "tour-de-growth";

/*
 * The player's dashboard, at night: churn (the hero figure, with a mini
 * bullet against the quarter's target), subscribers, monthly revenue, the
 * CEO's patience — and the two numbers the job never shows: subscriber trust
 * and the regulator radar. Those two are drawn as a decoy of shapes, not
 * blurred text, until December reveals them.
 *
 * Every figure arrives formatted (lib/game/format.ts); every change carries a
 * sign AND a word. Copy: content/game/retention.ts.
 */

const box = { padding: 20, maxWidth: 820 } as const;

const HIDDEN = {
  hidden: true as const,
  hiddenLabel: "not on your dashboard",
  hiddenNote: "Hidden until December",
};

/** January: the year starts at 6.0%, nothing has moved, the two secrets are hidden. */
export const YearStart = () => (
  <NightSurface as="div" style={box}>
    <Dashboard
      label="Your dashboard"
      churn={{
        label: "Churn",
        value: "6.0%",
        sub: "per month · quarter target: 5.6%",
        bullet: {
          value: 6.0,
          target: 5.6,
          domain: [0, 8],
          ariaLabel: "Churn 6.0% per month, against a quarter target of 5.6%",
        },
      }}
      subs={{ label: "Subscribers", value: "100,000", sub: "January, end of month" }}
      mrr={{ label: "Monthly revenue", value: "€1.30M" }}
      patience={{ label: "CEO's patience", value: "70", bar: 70, low: false }}
      trust={{ label: "Subscriber trust", ...HIDDEN }}
      radar={{ label: "Regulator radar", ...HIDDEN }}
    />
  </NightSurface>
);

/**
 * After a quarter that missed: churn down but not to target, subscribers
 * and revenue down, every tile with its change — and patience under the low
 * line, so its bar turns bad AND its sub line says "at breaking point" in
 * words. The two secrets stay hidden until December.
 */
export const AfterAQuarter = () => (
  <NightSurface as="div" style={box}>
    <Dashboard
      label="Your dashboard"
      churn={{
        label: "Churn",
        value: "5.4%",
        sub: "per month · quarter target: 5.1%",
        delta: { text: "−0.6 pts this quarter", direction: "down", sentiment: "good" },
        bullet: {
          value: 5.4,
          target: 5.1,
          domain: [0, 8],
          ariaLabel: "Churn 5.4% per month, against a quarter target of 5.1%",
        },
      }}
      subs={{
        label: "Subscribers",
        value: "97,312",
        sub: "March, end of month",
        delta: { text: "−2,688 this quarter", direction: "down", sentiment: "bad" },
      }}
      mrr={{
        label: "Monthly revenue",
        value: "€1.26M",
        delta: { text: "−3.1% vs January", direction: "down", sentiment: "bad" },
      }}
      patience={{
        label: "CEO's patience",
        value: "31",
        sub: "at breaking point",
        bar: 31,
        low: true,
        delta: { text: "−39 this quarter", direction: "down", sentiment: "bad" },
      }}
      trust={{ label: "Subscriber trust", ...HIDDEN }}
      radar={{ label: "Regulator radar", ...HIDDEN }}
    />
  </NightSurface>
);

/**
 * December: the two secret tiles are revealed with their value and bar. This
 * still shows the settled state; `revealing` plays the unblur once in the
 * page and is left off here.
 */
export const DecemberRevealed = () => (
  <NightSurface as="div" style={box}>
    <Dashboard
      label="Your dashboard"
      churn={{
        label: "Churn",
        value: "4.3%",
        sub: "per month · board target: 4.0%",
        bullet: {
          value: 4.3,
          target: 4.0,
          domain: [0, 8],
          ariaLabel: "Churn 4.3% per month, against a board target of 4.0%",
        },
      }}
      subs={{ label: "Subscribers", value: "94,870", sub: "December, end of month" }}
      mrr={{ label: "Monthly revenue", value: "€1.23M" }}
      patience={{ label: "CEO's patience", value: "48", bar: 48, low: false }}
      trust={{ hidden: false, label: "Subscriber trust", value: "22", sub: "revealed in December", bar: 22 }}
      radar={{ hidden: false, label: "Regulator radar", value: "81", sub: "revealed in December", bar: 81 }}
    />
  </NightSurface>
);
