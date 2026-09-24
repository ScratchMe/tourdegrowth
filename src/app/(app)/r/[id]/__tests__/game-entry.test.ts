import { describe, expect, it } from "vitest";
import { GAME_ENTRY_COPY } from "@/content/game/entry";
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

const open = { access: "open" as const, hasDeepDive: false };

describe("resultGameEntry — P23, the sample's own board", () => {
  it("offers the retention level on the sample's clear retention bottleneck", () => {
    expect(RETENTION_CLEAR.sharpness).toBe("clear");
    const entry = resultGameEntry({ bottleneck: RETENTION_CLEAR, locale: "en", ...open });
    expect(entry).not.toBeNull();
    expect(entry!.href).toBe("/en/game/retention?from=result");
    expect(entry!.event).toEqual({ name: GAME_ENTRY_EVENT, detail: "result/retention" });
    expect(entry!.title).toBe("The dark side of retention");
    expect(entry!.cta).toBe('Play the level "If they come back"');
  });

  it("speaks the reader's language, href and band included", () => {
    const entry = resultGameEntry({ bottleneck: RETENTION_CLEAR, locale: "fr", ...open })!;
    expect(entry.href).toBe("/fr/game/retention?from=result");
    expect(entry.title).toBe("Le côté obscur de la rétention");
    // The level model's 0.06, formatted the French way — a no-break space
    // before the percent sign, so it cannot be the last thing on a line.
    expect(entry.band.churn).toBe("Résiliations 6,0 %");
    expect(entry.meta).toBe("vingt minutes, gratuit");
  });

  it("quotes the level's starting churn, not a number written in the copy", () => {
    const en = resultGameEntry({ bottleneck: RETENTION_CLEAR, locale: "en", ...open })!;
    expect(en.band.churn).toBe("Churn 6.0%");
    expect(JSON.stringify(GAME_ENTRY_COPY)).not.toMatch(/6[.,]0/);
  });

  it("only ever emits a path the dashboard asks GoatCounter for (R-11)", () => {
    for (const hasDeepDive of [false, true]) {
      const entry = resultGameEntry({ bottleneck: RETENTION_CLEAR, locale: "en", access: "open", hasDeepDive })!;
      expect(entry.event.name).toBe("game_entry_clicked");
      expect(GAME_ENTRY_DETAILS).toContain(entry.event.detail);
    }
  });
});

describe("resultGameEntry — when there is no card", () => {
  it("offers nothing while the game is closed — the flag, and no preview cookie", () => {
    expect(resultGameEntry({ bottleneck: RETENTION_CLEAR, locale: "en", access: "closed", hasDeepDive: false })).toBeNull();
    expect(resultGameEntry({ bottleneck: RETENTION_CLEAR, locale: "fr", access: "closed", hasDeepDive: true })).toBeNull();
  });

  it("P24 — offers nothing when the bottleneck is acquisition", () => {
    expect(ACQUISITION_CLEAR.pillars.map((p) => p.pillar)).toEqual(["acquisition"]);
    expect(resultGameEntry({ bottleneck: ACQUISITION_CLEAR, locale: "en", ...open })).toBeNull();
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
    const entry = resultGameEntry({ bottleneck: SHARED_WITH_RETENTION, locale: "en", ...open });
    expect(entry?.event.detail).toBe("result/retention");
  });
});

describe("resultGameEntry — P25 and X26, a result with a Deep dive", () => {
  const dd = resultGameEntry({ bottleneck: RETENTION_CLEAR, locale: "fr", access: "open", hasDeepDive: true })!;
  const plain = resultGameEntry({ bottleneck: RETENTION_CLEAR, locale: "fr", ...open })!;

  it("opens on the Deep dive sentence and counts as the Deep dive door", () => {
    expect(dd.body.startsWith("Tes recommandations sont au-dessus.")).toBe(true);
    expect(dd.href).toBe("/fr/game/retention?from=deep_dive");
    expect(dd.event.detail).toBe("deep_dive/retention");
  });

  it("says ONE opening, never both — the card appears once, with one voice", () => {
    for (const locale of ["en", "fr"] as const) {
      const card = resultGameEntry({ bottleneck: RETENTION_CLEAR, locale, access: "open", hasDeepDive: true })!;
      const plainOpening = GAME_ENTRY_COPY.retention.opening.result[locale];
      const ddOpening = GAME_ENTRY_COPY.retention.opening.deepDive[locale];
      expect(card.body.split(ddOpening)).toHaveLength(2);
      expect(card.body).not.toContain(plainOpening);
    }
  });

  it("changes nothing else: same title, button, mention and band", () => {
    expect({ ...dd, body: "", href: "", event: null }).toEqual({ ...plain, body: "", href: "", event: null });
    // …and the rest of the body is the same sentence.
    expect(dd.body.slice(dd.body.indexOf(" Voici"))).toBe(plain.body.slice(plain.body.indexOf(" Voici")));
  });
});
