import Link from "next/link";
import styles from "./ZoneNav.module.css";

export interface Zone {
  /** The Tour's step name, untranslated like everywhere in the product (« Retention »). */
  pillar: string;
  /** The zone's title (« S'ils reviennent »). */
  title: string;
  /** Only a playable zone is a link; the others are text plus `soonLabel`. */
  href?: string;
  current: boolean;
}

export interface ZoneNavProps {
  /** « Les cinq zones de Tour de Growth ». */
  label: string;
  /** The five zones, AARRR order. */
  zones: readonly Zone[];
  /** « bientôt ». */
  soonLabel: string;
  /** The compact phone form: « Zone 3/5 ». */
  position: string;
  /** The current zone in one line, already filled from `zones.current`: « Retention — S'ils reviennent ». */
  currentLabel: string;
}

/**
 * The five zones of the Tour, on paper — game plan §2.6 and R13.
 *
 * Desktop: the five zones in a row, the current one underlined with the
 * brand's red mark. Phone: the prototype wrapped this row over four lines at
 * 390px, so it becomes one line (« Zone 3/5 · Retention — S'ils
 * reviennent ») over five segments. Both forms are in the markup and CSS
 * picks one, like every responsive switch in this system — never a width read
 * in JavaScript, which the prerendered HTML could not know.
 *
 * A zone that cannot be played yet is not a link: a link to nowhere is a
 * promise, « bientôt » is a fact.
 */
export function ZoneNav({ label, zones, soonLabel, position, currentLabel }: ZoneNavProps) {
  const current = zones.find((zone) => zone.current);

  return (
    <nav className={styles.nav} aria-label={label} data-testid="game-zone-nav">
      <ol className={styles.list}>
        {zones.map((zone) => {
          const body = (
            <>
              <span className={styles.pillar}>{zone.pillar}</span>
              <span className={styles.title}>{zone.title}</span>
            </>
          );
          return (
            <li key={zone.pillar} className={[styles.zone, zone.current ? styles.current : ""].filter(Boolean).join(" ")}>
              {zone.href ? (
                <Link href={zone.href} className={styles.link} aria-current={zone.current ? "page" : undefined}>
                  {body}
                </Link>
              ) : (
                <span className={styles.static} aria-current={zone.current ? "page" : undefined}>
                  {body}
                  <span className={styles.soon}>{soonLabel}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {current ? (
        <div className={styles.compact}>
          <p className={styles.compactLine}>
            <span className={styles.position}>{position}</span>
            <span aria-hidden="true"> · </span>
            {current.href ? (
              <Link href={current.href} className={styles.link}>
                {currentLabel}
              </Link>
            ) : (
              <span>{currentLabel}</span>
            )}
          </p>
          <span className={styles.segments} aria-hidden="true">
            {zones.map((zone) => (
              <span key={zone.pillar} className={[styles.segment, zone.current ? styles.segmentCurrent : ""].filter(Boolean).join(" ")} />
            ))}
          </span>
        </div>
      ) : null}
    </nav>
  );
}
