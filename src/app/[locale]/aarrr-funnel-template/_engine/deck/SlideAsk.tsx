import { shapeOf } from "@/lib/engine/catalog-shape";
import { REPAIR_KEY, ROLE_KEY } from "@/lib/engine/strings";
import { linesOf } from "./deck-lines";
import { SlideFrame, type SlideProps } from "./SlideFrame";
import { SlideText } from "./slide-text";
import styles from "./deck.module.css";

/**
 * Slide 6 — "what we are asking for" (§9.3). The only slide whose words the
 * user writes (D10): the request itself, and up to three bullets of what it
 * funds. Everything else is the engine's — "how we'll know" (the success
 * metric, its current value, its target, the first checkpoint) comes from
 * the model already formatted, and "what to measure first" is the missing
 * numbers the user kept checked, each with its repair cost and the role that
 * holds it.
 *
 * When the diagnosis can't name a leak, the model's title asks for the
 * measurement instead ("we're asking for a sprint to measure day-30 retention
 * before deciding where to invest") — often the most honest thing a Head of
 * Growth can put in front of a leadership team.
 */
export function SlideAsk({ slide, context }: SlideProps) {
  const { strings, state, metrics } = context;
  const ask = state.deck.ask;
  const entries = state.snapshots[0]?.metrics ?? {};
  const know = linesOf(slide, "know");
  const bullets = ask.bullets.map((b) => b.trim()).filter(Boolean);
  const measureFirst = ask.measureFirst.map((id) => {
    const missing = entries[id]?.missing;
    return {
      id,
      name: metrics.find((m) => m.id === id)?.name ?? id,
      repair: missing ? strings.repair[REPAIR_KEY[missing.repair]] : null,
      role: strings.role[ROLE_KEY[missing?.ownerRole ?? shapeOf(id).defaultRole]],
    };
  });

  return (
    <SlideFrame slide={slide} context={context}>
      <div className={styles.ask}>
        {bullets.length > 0 ? (
          <section className={styles.askBlock}>
            <h4 className={styles.cardEyebrow}>{strings.slide.askFunds}</h4>
            <ul className={styles.askList}>
              {bullets.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {know.length > 0 ? (
          <section className={styles.askBlock}>
            <h4 className={styles.cardEyebrow}>{strings.slide.askKnow}</h4>
            <ul className={styles.askList}>
              {know.map((line, i) => (
                <li key={i}>
                  <SlideText text={line.text} accent={false} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {measureFirst.length > 0 ? (
          <section className={`${styles.askBlock} ${styles.askMeasure}`}>
            <h4 className={styles.cardEyebrow}>{strings.slide.askMeasure}</h4>
            <ul className={styles.askList}>
              {measureFirst.map((m) => (
                <li key={m.id}>
                  <span className={styles.askMetric}><SlideText text={m.name} accent={false} /></span>
                  <span className={styles.askMeta}>{[m.repair, m.role].filter(Boolean).join(" · ")}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </SlideFrame>
  );
}
