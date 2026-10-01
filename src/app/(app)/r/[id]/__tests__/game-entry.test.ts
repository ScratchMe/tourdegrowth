import { describe, expect, it } from "vitest";
import { GAME_ENTRY_COPY, GAME_ENTRY_SEVERAL } from "@/content/game/entry";
import { GAME_ENTRY_DETAILS, GAME_ENTRY_EVENT } from "@/lib/game/events";
import { resolveBottleneck } from "@/lib/scoring/bottleneck";
import { PILLARS, type Pillar } from "@/lib/scoring/pillars";
import { SAMPLE_RESULT } from "@/lib/submissions/sample";
import { resultGameEntry } from "../game-entry";

/**
 * The result page's game card, from bottleneck to strings — game plan §3.10,
 * GAME-BRIEF.md 13.3 A. Orchestrator decision 3 (2026-09-24): P24 and P25
 * are pinned HERE, on the pure resolver, rather than through a Firestore
 * fixture route — a real result page needs Firestore, which CI does not have,
 * and a test door on the most exposed public route was judged the worse
 * trade. `src/__tests__/game-entry-wiring.test.ts` holds the page to this
 * resolver, so what is proven here is what the page does.
 */
function board(scores: Record<Pillar, number>) {
  return resolveBottleneck(PILLARS.map((pillar) => ({ pillar, score: scores[pillar] })));
}

const RETENTION_CLEAR = resolveBottleneck(SAMPLE_RESULT.pillars);
const ACQUISITION_CLEAR = board({ acquisition: 2, activation: 13, retention: 13, referral: 16, revenue: 13 });
const LEVEL = board({ acquisition: 16, activation: 16, retention: 20, referral: 16, revenue: 20 });
const SHARED_WITH_RETENTION = board({ acquisition: 7, activation: 16, retention: 7, referral: 16, revenue: 20 });
/** Activation and retention at the bottom: only retention has a level. */
const SHARED_ONE_LEVEL = board({ acquisition: 16, activation: 7, retention: 7, referral: 16, revenue: 20 });

const open = { access: "open" as const, hasDeepDive: false };
/** The table as it stood before level 2 (A12.f): the shared-bottleneck rule below is about retention. */
const RETENTION_ONLY = { retention: { slug: "retention" as const, enabled: true } };

describe("resultGameEntry — P23, the sample's own board", () => {
  it("offers the retention level on the sample's clear retention bottleneck", () => {
    expect(RETENTION_CLEAR.sharpness).toBe("clear");
    const entry = resultGameEntry({ bottleneck: RETENTION_CLEAR, locale: "en", ...open });
    expect(entry).not.toBeNull();
    expect(entry!.levels).toHaveLength(1);
    const [level] = entry!.levels;
    expect(level.href).toBe("/en/game/retention?from=result");
    expect(level.event).toEqual({ name: GAME_ENTRY_EVENT, detail: "result/retention" });
    expect(entry!.title).toBe("The dark side of retention");
    expect(level.cta).toBe('Play the level "If they come back"');
  });

  it("speaks the reader's language, href and band included", () => {
    const entry = resultGameEntry({ bottleneck: RETENTION_CLEAR, locale: "fr", ...open })!;
    expect(entry.levels[0].href).toBe("/fr/game/retention?from=result");
    expect(entry.title).toBe("Le côté obscur de la rétention");
    // The level model's 0.06, formatted the French way — a no-break space
    // before the percent sign, so it cannot be the last thing on a line.
    expect(entry.levels[0].metric).toBe("Résiliations 6,0 %");
    expect(entry.band).toEqual({ trust: "Confiance", notOnDashboard: "pas sur ton dashboard" });
    expect(entry.meta).toBe("vingt minutes, gratuit");
  });

  it("quotes the level's starting churn, not a number written in the copy", () => {
    const en = resultGameEntry({ bottleneck: RETENTION_CLEAR, locale: "en", ...open })!;
    expect(en.levels[0].metric).toBe("Churn 6.0%");
    expect(JSON.stringify(GAME_ENTRY_COPY)).not.toMatch(/6[.,]0/);
  });

  it("only ever emits a path the dashboard asks GoatCounter for (R-11)", () => {
    for (const bottleneck of [RETENTION_CLEAR, ACQUISITION_CLEAR, SHARED_WITH_RETENTION]) {
      for (const hasDeepDive of [false, true]) {
        const entry = resultGameEntry({ bottleneck, locale: "en", access: "open", hasDeepDive })!;
        for (const level of entry.levels) {
          expect(level.event.name).toBe("game_entry_clicked");
          expect(GAME_ENTRY_DETAILS).toContain(level.event.detail);
        }
      }
    }
  });
});

describe("resultGameEntry — when there is no card", () => {
  it("offers nothing while the game is closed — the flag, and no preview cookie", () => {
    expect(resultGameEntry({ bottleneck: RETENTION_CLEAR, locale: "en", access: "closed", hasDeepDive: false })).toBeNull();
    expect(resultGameEntry({ bottleneck: SHARED_WITH_RETENTION, locale: "fr", access: "closed", hasDeepDive: true })).toBeNull();
  });

  it("P24 — offers nothing when the bottleneck's stage has no level", () => {
    const activation = board({ acquisition: 13, activation: 2, retention: 13, referral: 16, revenue: 13 });
    expect(activation.pillars.map((p) => p.pillar)).toEqual(["activation"]);
    expect(resultGameEntry({ bottleneck: activation, locale: "en", ...open })).toBeNull();
  });

  it("P24 — offers nothing on a level board, even though retention is lowest-but-strong", () => {
    expect(LEVEL.sharpness).toBe("level");
    expect(resultGameEntry({ bottleneck: LEVEL, locale: "en", ...open })).toBeNull();
  });

  it("offers nothing when retention's level is not enabled yet", () => {
    const levels = { retention: { slug: "retention" as const, enabled: false } };
    expect(resultGameEntry({ bottleneck: RETENTION_CLEAR, locale: "en", ...open, levels })).toBeNull();
  });
});

describe("resultGameEntry — orchestrator decision 2, a shared bottleneck", () => {
  it("offers the card when retention is IN the group, even behind a tie-break", () => {
    expect(SHARED_WITH_RETENTION.sharpness).toBe("shared");
    expect(SHARED_WITH_RETENTION.pillars[0]?.pillar).toBe("acquisition");
    const entry = resultGameEntry({ bottleneck: SHARED_WITH_RETENTION, locale: "en", ...open, levels: RETENTION_ONLY });
    expect(entry?.levels.map((l) => l.event.detail)).toEqual(["result/retention"]);
  });

  it("a shared bottleneck with ONE stage that has a level is that level's own card", () => {
    const entry = resultGameEntry({ bottleneck: SHARED_ONE_LEVEL, locale: "fr", ...open })!;
    expect(entry.levels.map((l) => l.event.detail)).toEqual(["result/retention"]);
    expect(entry.title).toBe("Le côté obscur de la rétention");
  });
});

// C30 Q5 (Antoine, 2026-10-01): when several stages of the bottleneck have a
// level, ONE card offers them all, stage by stage — AARRR order no longer
// picks for the reader.
describe("resultGameEntry — C30 Q5, several levels on one card (A12.f.2)", () => {
  const en = resultGameEntry({ bottleneck: SHARED_WITH_RETENTION, locale: "en", ...open })!;
  const fr = resultGameEntry({ bottleneck: SHARED_WITH_RETENTION, locale: "fr", ...open, hasDeepDive: true })!;

  it("offers both levels, lowest stage first, each with its own door", () => {
    expect(en.levels.map((l) => l.event.detail)).toEqual(["result/acquisition", "result/retention"]);
    expect(en.levels.map((l) => l.href)).toEqual(["/en/game/acquisition?from=result", "/en/game/retention?from=result"]);
    expect(fr.levels.map((l) => l.event.detail)).toEqual(["deep_dive/acquisition", "deep_dive/retention"]);
  });

  it("names each stage, and keeps each level's button and number", () => {
    expect(en.levels.map((l) => l.stage)).toEqual(["Acquisition", "Retention"]);
    expect(en.levels.map((l) => l.cta)).toEqual(['Play the level "How people find you"', 'Play the level "If they come back"']);
    expect(fr.levels.map((l) => l.metric)).toEqual(["Nouveaux clients 2 000", "Résiliations 6,0 %"]);
  });

  it("speaks for both under its own title and body, opening as any card does", () => {
    expect(en.title).toBe(GAME_ENTRY_SEVERAL.title.en);
    expect(en.body).toBe(`${GAME_ENTRY_COPY.retention.opening.result.en} ${GAME_ENTRY_SEVERAL.body.en}`);
    expect(fr.body.startsWith("Tes recommandations sont au-dessus.")).toBe(true);
    expect(fr.meta).toBe(GAME_ENTRY_SEVERAL.meta.fr);
  });

  it("three stages tied, two with a level: the card offers those two, and says « the stages below », not all of them", () => {
    const three = board({ acquisition: 5, activation: 5, retention: 5, referral: 16, revenue: 20 });
    expect(three.pillars.map((p) => p.pillar)).toEqual(["acquisition", "activation", "retention"]);
    const entry = resultGameEntry({ bottleneck: three, locale: "fr", ...open })!;
    expect(entry.levels.map((l) => l.stage)).toEqual(["Acquisition", "Retention"]);
    // The page above says « 3 étapes te freinent »: the card must not claim a level for each of them.
    expect(entry.body).toContain("ci-dessous");
    expect(entry.body).not.toContain("qui te freinent");
  });

  it("never offers the same level twice", () => {
    const twice = { acquisition: { slug: "retention" as const, enabled: true }, retention: { slug: "retention" as const, enabled: true } };
    const entry = resultGameEntry({ bottleneck: SHARED_WITH_RETENTION, locale: "en", ...open, levels: twice })!;
    expect(entry.levels).toHaveLength(1);
  });
});

describe("resultGameEntry — level 2 (A12.f, 2026-10-01)", () => {
  it("offers the acquisition level on a clear acquisition bottleneck", () => {
    expect(ACQUISITION_CLEAR.pillars.map((p) => p.pillar)).toEqual(["acquisition"]);
    const entry = resultGameEntry({ bottleneck: ACQUISITION_CLEAR, locale: "en", ...open })!;
    expect(entry.levels).toHaveLength(1);
    expect(entry.levels[0].href).toBe("/en/game/acquisition?from=result");
    expect(entry.levels[0].event).toEqual({ name: GAME_ENTRY_EVENT, detail: "result/acquisition" });
    expect(entry.title).toBe("The dark side of acquisition");
    expect(entry.levels[0].cta).toBe('Play the level "How people find you"');
  });

  it("quotes level 2's starting number in its own format — new customers to the ten, never a percentage", () => {
    expect(resultGameEntry({ bottleneck: ACQUISITION_CLEAR, locale: "en", ...open })!.levels[0].metric).toBe("New customers 2,000");
    const fr = resultGameEntry({ bottleneck: ACQUISITION_CLEAR, locale: "fr", ...open, hasDeepDive: true })!;
    expect(fr.levels[0].metric).toBe("Nouveaux clients 2 000");
    expect(fr.levels[0].metric).not.toMatch(/%|pt/);
    expect(fr.levels[0].event.detail).toBe("deep_dive/acquisition");
    expect(JSON.stringify(GAME_ENTRY_COPY)).not.toMatch(/2[\s ,.]?000/);
  });
});

describe("resultGameEntry — P25 and X26, a result with a Deep dive", () => {
  const dd = resultGameEntry({ bottleneck: RETENTION_CLEAR, locale: "fr", access: "open", hasDeepDive: true })!;
  const plain = resultGameEntry({ bottleneck: RETENTION_CLEAR, locale: "fr", ...open })!;

  it("opens on the Deep dive sentence and counts as the Deep dive door", () => {
    expect(dd.body.startsWith("Tes recommandations sont au-dessus.")).toBe(true);
    expect(dd.levels[0].href).toBe("/fr/game/retention?from=deep_dive");
    expect(dd.levels[0].event.detail).toBe("deep_dive/retention");
  });

  it("says ONE opening, never both — the card appears once, with one voice", () => {
    for (const locale of ["en", "fr"] as const) {
      for (const bottleneck of [RETENTION_CLEAR, SHARED_WITH_RETENTION]) {
        const card = resultGameEntry({ bottleneck, locale, access: "open", hasDeepDive: true })!;
        const plainOpening = GAME_ENTRY_COPY.retention.opening.result[locale];
        const ddOpening = GAME_ENTRY_COPY.retention.opening.deepDive[locale];
        expect(card.body.split(ddOpening)).toHaveLength(2);
        expect(card.body).not.toContain(plainOpening);
      }
    }
  });

  it("changes nothing else: same title, button, mention and band", () => {
    const strip = (v: typeof dd) => ({ ...v, body: "", levels: v.levels.map((l) => ({ ...l, href: "", event: null })) });
    expect(strip(dd)).toEqual(strip(plain));
    // …and the rest of the body is the same sentence.
    expect(dd.body.slice(dd.body.indexOf(" Voici"))).toBe(plain.body.slice(plain.body.indexOf(" Voici")));
  });
});
