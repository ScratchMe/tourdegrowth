import { Dashboard, NightSurface } from "tour-de-growth";

/*
 * The player's dashboard, at night: churn (the hero figure, with a mini
 * bullet against the target), subscribers, monthly revenue, the CEO's
 * patience — and the two numbers the job never shows: subscriber trust and
 * the regulator radar. Those two are drawn as a decoy of shapes, not blurred
 * text, until December reveals them.
 *
 * Every prop below is what the level's island builds (`dashboardProps` in
 * game/retention/island-view.ts) from a state PLAYED on a reference year
 * (lib/game/__tests__/paths.ts), never typed by hand. After a quarter the
 * churn tile already shows the NEXT quarter's target, and each change carries
 * a sign AND a word.
 */

// No side padding: the dashboard gets the full 880px, the widest a card may
// take. Below ~870px of dashboard width (a window under ~920px) the tiles'
// 20px figures run out of room and "100,000" breaks mid-number — in the
// product too; that is the component's to fix, not the card's to hide.
const box = { padding: "16px 0", maxWidth: 880 } as const;

/** The first of January: churn 6.0% against Q1's 5.6%, 100,000 subscribers, patience at its starting 55, the two secrets hidden. */
export const YearStart = () => (
  <NightSurface as="div" style={box}>
    <Dashboard
      label="Your dashboard"
      churn={{"label": "Churn · per month", "value": "6.0%", "sub": "quarter target: 5.6%", "bullet": {"value": 0.06, "target": 0.056, "domain": [0.02, 0.09], "ariaLabel": "Churn 6.0%, quarter target: 5.6%"}}}
      subs={{"label": "Subscribers", "value": "100,000", "sub": "January"}}
      mrr={{"label": "Monthly revenue", "value": "€1.30M"}}
      patience={{"label": "CEO's patience", "value": "55", "bar": 55, "low": false}}
      trust={{"hidden": true, "label": "Subscriber trust", "hiddenLabel": "not on your dashboard", "hiddenNote": "Hidden until December"}}
      radar={{"hidden": true, "label": "Regulator radar", "hiddenLabel": "not on your dashboard", "hiddenNote": "Hidden until December"}}
    />
  </NightSurface>
);

/**
 * End of June on reference year B: Q2 missed (5.5% against 5.1%), and the
 * tile now aims at Q3's 4.6%. Patience fell 20 to 31, under the low line of
 * 35, so its bar turns bad AND its sub line says "at breaking point" in
 * words. Revenue says how far it is from January. The secrets stay hidden.
 */
export const AfterAQuarter = () => (
  <NightSurface as="div" style={box}>
    <Dashboard
      label="Your dashboard"
      churn={{"label": "Churn · per month", "value": "5.5%", "sub": "quarter target: 4.6%", "delta": {"text": "−0.2 pts this quarter", "direction": "down", "sentiment": "good"}, "bullet": {"value": 0.05545, "target": 0.046, "domain": [0.02, 0.09], "ariaLabel": "Churn 5.5%, quarter target: 4.6%"}}}
      subs={{"label": "Subscribers", "value": "98,253", "sub": "June, end of month", "delta": {"text": "−162 this quarter", "direction": "down", "sentiment": "bad"}}}
      mrr={{"label": "Monthly revenue", "value": "€1.24M", "sub": "−€0.06M vs January", "delta": {"text": "−€0.04M this quarter", "direction": "down", "sentiment": "bad"}}}
      patience={{"label": "CEO's patience", "value": "31", "sub": "at breaking point", "delta": {"text": "−20 this quarter", "direction": "down", "sentiment": "bad"}, "bar": 31, "low": true}}
      trust={{"hidden": true, "label": "Subscriber trust", "hiddenLabel": "not on your dashboard", "hiddenNote": "Hidden until December"}}
      radar={{"hidden": true, "label": "Regulator radar", "hiddenLabel": "not on your dashboard", "hiddenNote": "Hidden until December"}}
    />
  </NightSurface>
);

/**
 * December on reference year C, the one that obeyed every order: the board's
 * 4.0% missed by a mile (9.1%, off the top of the bullet's scale), and the two
 * secret tiles revealed — trust 27, radar 1, back down after the Q3
 * inspection reset it. This still shows the settled state; `revealing` plays
 * the unblur once in the page and is left off here.
 */
export const DecemberRevealed = () => (
  <NightSurface as="div" style={box}>
    <Dashboard
      label="Your dashboard"
      churn={{"label": "Churn · per month", "value": "9.1%", "sub": "board target: 4.0%", "delta": {"text": "+4.0 pts this quarter", "direction": "up", "sentiment": "bad"}, "bullet": {"value": 0.09066, "target": 0.04, "domain": [0.02, 0.09], "ariaLabel": "Churn 9.1%, board target: 4.0%"}}}
      subs={{"label": "Subscribers", "value": "79,659", "sub": "December, end of month", "delta": {"text": "−13,645 this quarter", "direction": "down", "sentiment": "bad"}}}
      mrr={{"label": "Monthly revenue", "value": "€1.03M", "sub": "−€0.26M vs January", "delta": {"text": "−€0.24M this quarter", "direction": "down", "sentiment": "bad"}}}
      patience={{"label": "CEO's patience", "value": "12", "sub": "at breaking point", "delta": {"text": "−45 this quarter", "direction": "down", "sentiment": "bad"}, "bar": 12, "low": true}}
      trust={{"hidden": false, "label": "Subscriber trust", "value": "27", "sub": "revealed in December", "bar": 27, "revealing": false}}
      radar={{"hidden": false, "label": "Regulator radar", "value": "1", "sub": "revealed in December", "bar": 1, "revealing": false}}
    />
  </NightSurface>
);
