import { DgFace, NightSurface, QuarterReport } from "tour-de-growth";

/*
 * The end of a quarter, as a moment: the period as heading (focused when the
 * report opens), the two cards played, the figures in a fixed order — churn
 * with its target and its status IN WORDS, subscribers, revenue, patience —
 * what each card did, why churn moved (the move split by cause, adding up to
 * the total in its heading), then the private news (the CEO's mid-quarter
 * email, every quarter), the public news (paper clippings), and the CEO's
 * closing line with his face at that quarter's mood. One button forward.
 *
 * Every story is a quarter played through the reducer
 * (lib/game/__tests__/paths.ts) and built by island-view.ts `reportContent`
 * — the same strings and numbers the island hands the component.
 */

const noop = () => {};
const box = { padding: 24, maxWidth: 760 } as const;

/**
 * Quarter 1 missed by 0.1 pts (paths.ts PATH_FIRED_DARK): the status says it
 * in words and the colour repeats it; the effects line says what each card
 * did; the CEO's mid-quarter mail still said "it's moving"; nothing public
 * happened yet.
 */
export const MissedByALittle = () => (
  <NightSurface as="div" style={box}>
    <QuarterReport
      q={1}
      period="Quarter 1 · January to March"
      picked={["Pause up front", "Pre-billing reminder"]}
      figures={[
        { key: "churn", label: "Churn", value: "5.7%", note: "target 5.6%", status: { text: "missed by 0.1 pts", tone: "bad" } },
        { key: "subs", label: "Subscribers", value: "98,756" },
        { key: "mrr", label: "Revenue", value: "€1.28M" },
        { key: "patience", label: "CEO's patience", value: "53" },
      ]}
      effectsHeading="What your actions did"
      effects={["Pause up front: −6% churn this quarter", "Pre-billing reminder: +1% churn this quarter, fewer disputes"]}
      drivers={{ heading: "Why churn moved: −0.3 pts", lines: ["Your two projects this quarter: −0.3 pts"] }}
      mail={{ header: "From: CEO · Subject: this week's numbers", body: "Message from the CEO, mid-quarter: \"It's moving. Keep going.\"" }}
      boss={{ line: "The CEO: \"That's not what we agreed.\"", mood: "angry", face: <DgFace mood="angry" size="avatar" /> }}
      next={{ label: "The CEO is calling you →", onClick: noop }}
    />
  </NightSurface>
);

/**
 * Quarter 2, target hit (paths.ts PATH_C) — with the dark side's price
 * arriving in public: complaints, a viral thread, and the competitor's
 * spring offer on top. The dashboard said "hit"; the press says what it cost.
 */
export const HitWithAClipping = () => (
  <NightSurface as="div" style={box}>
    <QuarterReport
      q={2}
      period="Quarter 2 · April to June"
      picked={["Assisted cancellation", "Retention offers"]}
      figures={[
        { key: "churn", label: "Churn", value: "5.0%", note: "target 5.1%", status: { text: "target hit", tone: "good" } },
        { key: "subs", label: "Subscribers", value: "97,624" },
        { key: "mrr", label: "Revenue", value: "€1.27M" },
        { key: "patience", label: "CEO's patience", value: "79" },
      ]}
      effectsHeading="What your actions did"
      effects={["Assisted cancellation: −10% churn this quarter", "Retention offers: −4% churn this quarter"]}
      drivers={{ heading: "Why churn moved: −0.3 pts", lines: ["Your two projects this quarter: −0.9 pts", "What your subscribers say about Flixo: +0.3 pts", "The competitor's spring offer: +0.3 pts"] }}
      mail={{ header: "From: CEO · Subject: this week's numbers", body: "Message from the CEO, mid-quarter: \"It's moving. Keep going.\"" }}
      clippings={[
        { kind: "reports", masthead: "SignalConso", headline: "Complaints against Flixo pile up", text: "Dozens of complaints on SignalConso, the French government's consumer reporting site. A journalist is asking the press office questions.", why: { heading: "What it signals", lines: ["The authorities read SignalConso: your regulator radar, the hidden tile on your dashboard, is nearing the inspection threshold. Every new trick brings it closer."] } },
        { kind: "viral", handle: "@endless_evening", text: "A viral thread: \"I tried to cancel Flixo, here are my three hours.\" Cancellations speed up." },
        { kind: "competitor", masthead: "The Streaming Letter", headline: "A price offensive in the spring", text: "A competitor launched an aggressive offer in the spring. Everyone lost subscribers this quarter, you included." },
      ]}
      boss={{ line: "The CEO: \"Well played.\" \"Thanks for doing what I asked.\"", mood: "firm", face: <DgFace mood="firm" size="avatar" /> }}
      next={{ label: "The CEO is calling you →", onClick: noop }}
    />
  </NightSurface>
);

/** In French (paths.ts PATH_A, quarter 2): the data review's note from the team, the competitor's clipping, and the CEO's warning. */
export const FrenchWithANote = () => (
  <NightSurface as="div" style={box}>
    <QuarterReport
      q={2}
      period="Trimestre 2 · avril à juin"
      picked={["Chantier onboarding", "Point données avec le DG"]}
      figures={[
        { key: "churn", label: "Résiliations", value: "5,7 %", note: "objectif 5,1 %", status: { text: "manqué de 0,6 pt", tone: "bad" } },
        { key: "subs", label: "Abonnés", value: "97 577" },
        { key: "mrr", label: "Revenu", value: "1,27 M€" },
        { key: "patience", label: "Patience du DG", value: "42" },
      ]}
      effectsHeading="Ce que tes actions ont fait"
      effects={["Chantier onboarding : rien de visible ce trimestre", "Point données avec le DG : le DG t'a donné du temps"]}
      notes={["Ta présentation au DG a tenu : des données, une courbe, une demande de temps. Il t'en donne."]}
      drivers={{ heading: "Pourquoi le churn a bougé : −0,1 pt", lines: ["Ce qui tournait déjà en production : −0,2 pt", "Ce que tes abonnés disent de Flixo : −0,2 pt", "L'offre de printemps du concurrent : +0,3 pt"] }}
      mail={{ header: "De : DG · Objet : les chiffres de la semaine", body: "Message du DG, à mi-trimestre : « Je vois les chiffres de la semaine. Ça ne bouge pas assez. »" }}
      clippings={[
        { kind: "competitor", masthead: "La Lettre du streaming", headline: "Offensive tarifaire au printemps", text: "Un concurrent a lancé une offre agressive au printemps. Tout le monde a perdu des abonnés ce trimestre, toi compris." },
      ]}
      boss={{ line: "Le DG : « Ce n'est pas ce qu'on avait dit. » « Tu n'as pas fait ce que j'ai demandé. Je l'ai noté. »", mood: "angry", face: <DgFace mood="angry" size="avatar" /> }}
      next={{ label: "Le DG t'appelle →", onClick: noop }}
    />
  </NightSurface>
);
