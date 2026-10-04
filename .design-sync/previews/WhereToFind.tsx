import { WhereToFind } from "tour-de-growth";

/*
 * Each tool and the path in it, one tap away (design system extension 07,
 * A18 T1). Folded by default, its summary naming the places; open on first
 * render only when the team's own tools (Settings) fill the number, those
 * listed first and tagged. Then « Aussi dans GA4 : », the other numbers that
 * tool gives, each opening that number's screen. The trap is not in here: it
 * is a TrapNote, above the value.
 *
 * Every prop is the product's own: the `where` slot `MetricSheet`
 * (app/[locale]/aarrr-funnel-template/_engine/MetricSheet.tsx) fills, rendered
 * on the engine's fixtures with the resolved copy — the places from the
 * catalogue (`engine-catalog.ts`) with their placeholders filled, the
 * « also » lists among the numbers the engine's motions ask for. `onOpenNumber`
 * is left out. Width: the sheet's body.
 */

/**
 * Folded, in English: the example's activation rate, whose team ticked no tool. The summary
 * names the places — « Amplitude · Mixpanel or PostHog · GA4 » — so a person sees whether it
 * is worth opening without opening it. Inside (closed here): each tool and its path, then «
 * Also in Amplitude: », « Also in Mixpanel: », « Also in GA4: » and the other numbers each
 * gives.
 */
export const Folded = () => (
  <div style={{ maxWidth: 658 }}>
    <WhereToFind
      label="Where to find it"
      tools={[
        {
          tool: "Amplitude",
          path: "a Funnel Analysis chart: sign-up then \"created a first project\", 7-day conversion window",
          yours: false,
        },
        {
          tool: "Mixpanel or PostHog",
          path: "a funnel from sign-up to \"created a first project\", with a conversion window of 7 days",
          yours: false,
        },
        {
          tool: "GA4",
          path: "a funnel exploration (Explore tab), if \"created a first project\" is sent to GA4",
          yours: false,
        },
      ]}
      yoursLabel="your tool"
      also={[
        {
          tool: "amplitude",
          label: "Also in Amplitude: ",
          items: [
            { id: "act.ttv", label: "median time to value" },
            { id: "ret.d30", label: "day-30 retention" },
          ],
        },
        {
          tool: "mixpanel",
          label: "Also in Mixpanel: ",
          items: [
            { id: "acq.signup-rate", label: "sign-up rate" },
            { id: "ret.d30", label: "day-30 retention" },
            { id: "ref.k-factor", label: "viral coefficient (K)" },
          ],
        },
        {
          tool: "ga4",
          label: "Also in GA4: ",
          items: [
            { id: "acq.signup-rate", label: "sign-up rate" },
            { id: "acq.top-channel-share", label: "top channel share" },
            { id: "act.ttv", label: "median time to value" },
            { id: "ret.d30", label: "day-30 retention" },
          ],
        },
      ]}
    />
  </div>
);

/**
 * Open on the team's own tools, in French: a fresh engine (`emptyState()`'s shape) with GA4
 * and Stripe ticked in the Settings — the tools `e2e/engine-tools.spec.ts` ticks — on the
 * sign-up rate. GA4, one of theirs, comes first and is tagged « ton outil »; then the
 * catalogue's other places in its order, each path word for word; then « Aussi dans GA4 : », «
 * Aussi dans Mixpanel : », « Aussi dans Base produit : » and the numbers each also gives, in
 * ink (another number's screen), not the red of a link.
 */
export const OnYourTools = () => (
  <div style={{ maxWidth: 658 }}>
    <WhereToFind
      label={"Où le trouver"}
      tools={[
        {
          tool: "GA4",
          path: "le total Utilisateurs du mois (la métrique Utilisateurs, à ajouter au rapport Acquisition de trafic si elle n'y est pas), pas Sessions",
          yours: true,
        },
        {
          tool: "Mixpanel ou Amplitude",
          path: "un entonnoir en deux étapes, page vue puis inscription, sur le mois",
          yours: false,
        },
        {
          tool: "Base produit",
          path: "les comptes créés sur le mois : le compte le plus fiable pour les inscrits",
          yours: false,
        },
      ]}
      yoursLabel="ton outil"
      open
      also={[
        {
          tool: "ga4",
          label: "Aussi dans GA4 : ",
          items: [
            { id: "acq.top-channel-share", label: "part du premier canal" },
            { id: "act.rate", label: "taux d'activation" },
            { id: "act.ttv", label: "time-to-value médian" },
            { id: "ret.d30", label: "rétention à J30" },
          ],
        },
        {
          tool: "mixpanel",
          label: "Aussi dans Mixpanel : ",
          items: [
            { id: "act.rate", label: "taux d'activation" },
            { id: "ret.d30", label: "rétention à J30" },
            { id: "ref.k-factor", label: "coefficient viral (K)" },
          ],
        },
        {
          tool: "product-db",
          label: "Aussi dans Base produit : ",
          items: [
            { id: "ref.referred-share", label: "part des inscrits recommandés" },
            { id: "ref.k-factor", label: "coefficient viral (K)" },
          ],
        },
      ]}
    />
  </div>
);

/**
 * Open, in English: the example's CAC with Stripe ticked in the Settings. Its places are a
 * group of ad tools, a person (Finance, for the salaries of the « + team » and « fully loaded
 * » variants) and « Stripe or Chargebee » — the team's, so it comes first, tagged « your tool
 * ». « Also in Stripe: » lists the five other numbers Stripe gives.
 */
export const WithAPerson = () => (
  <div style={{ maxWidth: 658 }}>
    <WhereToFind
      label="Where to find it"
      tools={[
        {
          tool: "Google Ads, Meta Ads Manager, LinkedIn Campaign Manager",
          path: "the amount spent in August 2026, all campaigns together",
          yours: false,
        },
        {
          tool: "Finance",
          path: "marketing and sales salaries and tools, for the \"+ team\" and \"fully loaded\" variants",
          yours: false,
        },
        {
          tool: "Stripe or Chargebee",
          path: "the subscriptions that became paid in August 2026, free trials excluded",
          yours: true,
        },
      ]}
      yoursLabel="your tool"
      open
      also={[
        {
          tool: "stripe",
          label: "Also in Stripe: ",
          items: [
            { id: "ret.logo-churn", label: "monthly logo churn" },
            { id: "rev.paid-conversion", label: "paid conversion" },
            { id: "rev.arpa", label: "monthly ARPA" },
            { id: "rev.expansion", label: "monthly expansion" },
            { id: "rev.contraction", label: "monthly contraction" },
          ],
        },
      ]}
    />
  </div>
);
