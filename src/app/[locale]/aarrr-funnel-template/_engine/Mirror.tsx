import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import type { Locale } from "@/lib/i18n/locale";
import type { BridgeRow, DerivedId, MetricId, Mirror as MirrorModel, MirrorVerdict, TrackingLevel } from "@/lib/engine/types";
import type { EngineStrings, ResolvedBridge, ResolvedDerived, ResolvedMetric } from "@/lib/engine/strings";
import { point } from "@/lib/engine/interval";
import { numbered } from "@/lib/engine/phrases";
import { fill } from "./visual-model";
import styles from "./Mirror.module.css";

export interface MirrorProps {
  /** `buildMirror(...)`, or null when no Tour with answers is on this device. */
  mirror: MirrorModel | null;
  /** A Tour was linked (`state.tourLink`) but its result is gone from the device (§6.11). */
  gone?: boolean;
  strings: EngineStrings;
  locale: Locale;
  bridges: ResolvedBridge[];
  metrics: ResolvedMetric[];
  derived: ResolvedDerived[];
}

/** Blind spots first: the argument the section exists for (§8.5). */
const VERDICT_ORDER: readonly MirrorVerdict[] = ["blind-spot", "blind-spot-light", "known-gap", "better", "coherent"];

/** Each verdict's label: the general form under its count (agreeing with it), `…One` on the one card it names. */
const VERDICT_KEY: Record<MirrorVerdict, "blindSpot" | "blindSpotLight" | "knownGap" | "better" | "coherent"> = {
  "blind-spot": "blindSpot",
  "blind-spot-light": "blindSpotLight",
  "known-gap": "knownGap",
  better: "better",
  coherent: "coherent",
};

/**
 * The found side in words. There is no dedicated vocabulary for a tracking
 * level, and the statuses already say it: tracked = « Trouvé », approximate =
 * « Estimé », unknown = « Introuvable ».
 */
const FOUND_STATUS: Record<TrackingLevel, keyof EngineStrings["status"]> = {
  tracked: "measured",
  approximate: "estimated",
  unknown: "missing",
};

/**
 * Declared × measured — engine spec §8.5, the mirror of the Tour.
 *
 * Counters in stencil, one per verdict, blind spots first and in an alert
 * card; then one card per bridge that is NOT coherent, quoting the Tour's
 * answer **word for word** next to what was found here. A coherent bridge
 * is a count, not a card: agreement needs no argument.
 *
 * The Tour is read, never copied (D13): everything here comes from the
 * `Mirror` the pure engine built from `tdg.results.v1`, and the answer text
 * from the bridges the server resolved. Without a Tour, one sentence and a
 * bare link to `/quiz` — `Button hard`, because the quiz lives under
 * another root layout and a prefetch there would be wasted
 * (`cross-root-links.test.ts`).
 */
export function Mirror({ mirror, gone = false, strings, locale, bridges, metrics, derived }: MirrorProps) {
  const m = strings.mirror;

  if (!mirror) {
    return (
      <section className={styles.mirror} data-testid="engine-mirror" data-state={gone ? "gone" : "none"}>
        <h3 className={styles.title}>{m.title}</h3>
        <p className={styles.lead}>{gone ? m.gone : m.noTour}</p>
        {gone ? null : (
          <div>
            <Button variant="secondary" href="/quiz" hard data-testid="mirror-tour-link">
              {strings.page.tourFirst}
            </Button>
          </div>
        )}
      </section>
    );
  }

  const nameOf = (id: MetricId | DerivedId) =>
    metrics.find((x) => x.id === id)?.name ?? derived.find((x) => x.id === id)?.name ?? id;

  const date = new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(mirror.takenAt));
  const takenAt =
    mirror.total === null
      ? fill(strings.visual.mirrorTakenAtNoScore, { date })
      : fill(strings.visual.mirrorTakenAt, { date, score: String(mirror.total) });

  const cards = mirror.rows
    .filter((r): r is BridgeRow & { verdict: MirrorVerdict; found: TrackingLevel } => r.verdict !== null && r.verdict !== "coherent" && r.found !== null)
    .sort((a, b) => VERDICT_ORDER.indexOf(a.verdict) - VERDICT_ORDER.indexOf(b.verdict));

  return (
    <section className={styles.mirror} data-testid="engine-mirror" data-state="linked">
      <div className={styles.head}>
        <h3 className={styles.title}>{m.title}</h3>
        <p className={styles.meta}>{takenAt}</p>
      </div>

      <ul className={styles.counters} aria-label={strings.visual.mirrorCounts}>
        {VERDICT_ORDER.map((verdict) => {
          const count = mirror.counts[verdict];
          const blind = verdict === "blind-spot" && count > 0;
          return (
            <li
              key={verdict}
              className={[styles.counter, blind ? styles.counterAlert : ""].filter(Boolean).join(" ")}
              data-verdict={verdict}
            >
              <span className={styles.count}>{count}</span>
              <span className={styles.countLabel}>{m[numbered(VERDICT_KEY[verdict], point(count), locale)]}</span>
            </li>
          );
        })}
      </ul>

      {cards.length ? (
        <ul className={styles.cards}>
          {cards.map((row) => {
            const bridge = bridges.find((b) => b.questionId === row.questionId);
            const answer = bridge?.options.find((o) => o.points === row.declaredPoints)?.label ?? "";
            const found = strings.status[FOUND_STATUS[row.found]];
            return (
              <li key={row.questionId}>
                <Card
                  tone={row.verdict === "blind-spot" ? "alert" : "paper"}
                  className={styles.card}
                  data-testid={`mirror-card-${row.questionId}`}
                  data-verdict={row.verdict}
                >
                  <p className={styles.cardEyebrow}>{m[`${VERDICT_KEY[row.verdict]}One`]}</p>
                  <h4 className={styles.cardTitle}>{nameOf(row.metric)}</h4>
                  {bridge ? (
                    <p className={styles.question}>
                      <span className={styles.questionLabel}>{strings.visual.mirrorQuestion}</span> {bridge.question}
                    </p>
                  ) : null}
                  <p className={styles.cardBody}>
                    {fill(m.card, {
                      answer,
                      points: String(row.declaredPoints),
                      found: found.charAt(0).toLowerCase() + found.slice(1),
                    })}
                  </p>
                </Card>
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
