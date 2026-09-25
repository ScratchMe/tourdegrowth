import { DgFace, NightSurface, QuarterReport } from "tour-de-growth";

/*
 * The end of a quarter, as a moment: the period as heading (focused when the
 * report opens), the two cards played, the figures in a fixed order — churn
 * with its target and its status IN WORDS, subscribers, revenue, patience —
 * what each card did, then the private news (the CEO's email), the public
 * news (paper clippings), and the CEO's closing line with his face at that
 * quarter's mood. One button forward. Copy: content/game/retention.ts.
 */

const noop = () => {};
const box = { padding: 24, maxWidth: 760 } as const;

/**
 * Quarter 1, missed by 0.1 pt: the status says it in words and the colour
 * repeats it; the effects line says what each card did; the CEO wrote mid-
 * quarter; nothing public happened yet.
 */
export const MissedByALittle = () => (
  <NightSurface as="div" style={box}>
    <QuarterReport
      q={1}
      period="Quarter 1 · January to March"
      picked={["Pause offer", "Exit survey"]}
      figures={[
        { key: "churn", label: "Churn", value: "5.7%", note: "target 5.6%", status: { text: "missed by 0.1 pt", tone: "bad" } },
        { key: "subs", label: "Subscribers", value: "98,904" },
        { key: "mrr", label: "Revenue", value: "€1.28M" },
        { key: "patience", label: "CEO's patience", value: "58" },
      ]}
      effectsHeading="What your actions did"
      effects={[
        "Pause offer: −5% churn this quarter, and the effect is still growing",
        "Exit survey: exit answers, and numbers to show the CEO",
      ]}
      mail={{ header: "From: CEO · Subject: this week's numbers", body: '"It\'s moving. Keep going."' }}
      boss={{ line: 'The CEO: "That\'s not what we agreed."', mood: "firm", face: <DgFace mood="firm" size="avatar" /> }}
      next={{ label: "The CEO is calling you →", onClick: noop }}
    />
  </NightSurface>
);

/**
 * Quarter 4, target hit — with the dark side's price arriving in public:
 * an inspection clipping and a viral post. The dashboard said "hit"; the
 * press says what it cost. The last quarter's button leads to December.
 */
export const HitWithAClipping = () => (
  <NightSurface as="div" style={box}>
    <QuarterReport
      q={4}
      period="Quarter 4 · October to December"
      picked={["Retention offers", "Contractual notice"]}
      figures={[
        { key: "churn", label: "Churn", value: "3.9%", note: "target 4.0%", status: { text: "target hit", tone: "good" } },
        { key: "subs", label: "Subscribers", value: "92,140" },
        { key: "mrr", label: "Revenue", value: "€1.24M" },
        { key: "patience", label: "CEO's patience", value: "74" },
      ]}
      effectsHeading="What your actions did"
      effects={[
        "Retention offers: −8% churn this quarter",
        "Contractual notice: one more month billed to everyone who leaves",
      ]}
      clippings={[
        {
          kind: "control",
          masthead: "The Business Courier",
          headline: "Flixo caught out by the French consumer watchdog",
          text: "An inspection, an article in the press, a fine. The CEO asks you to take everything down by Friday.",
        },
        {
          kind: "viral",
          handle: "@endless_evening",
          text: '"I tried to cancel Flixo, here are my three hours."',
        },
      ]}
      boss={{ line: 'The CEO: "Well played."', mood: "calm", face: <DgFace mood="calm" size="avatar" /> }}
      next={{ label: "See the year's review →", onClick: noop }}
    />
  </NightSurface>
);

/** In French: a private note from the data presentation, and the CEO's warning. */
export const FrenchWithANote = () => (
  <NightSurface as="div" style={box}>
    <QuarterReport
      q={2}
      period="Trimestre 2 · avril à juin"
      picked={["Point données avec le DG", "Chantier onboarding"]}
      figures={[
        { key: "churn", label: "Résiliations", value: "5,3 %", note: "objectif 5,1 %", status: { text: "manqué de 0,2 pt", tone: "bad" } },
        { key: "subs", label: "Abonnés", value: "97 820" },
        { key: "mrr", label: "Revenu", value: "1,27 M€" },
        { key: "patience", label: "Patience du DG", value: "52" },
      ]}
      effectsHeading="Ce que tes actions ont fait"
      effects={["Point données avec le DG : le DG t'a donné du temps", "Chantier onboarding : rien de visible ce trimestre"]}
      notes={["Ta présentation au DG a tenu : des données, une courbe, une demande de temps. Il t'en donne."]}
      boss={{
        line: "Le DG : « Je ne sais pas combien de temps je peux te couvrir. »",
        mood: "cold",
        face: <DgFace mood="cold" size="avatar" />,
      }}
      next={{ label: "Le DG t'appelle →", onClick: noop }}
    />
  </NightSurface>
);
