import Link from "next/link";
import styles from "./ZoneNav.module.css";

export interface ZoneNavItem {
  /** Stable id, one per pillar — used for the test hook, never shown. */
  id: string;
  /** The Tour's name for the zone, untranslated in both languages ("Retention"). */
  pillar: string;
  /** The game's question form of the zone (« S'ils reviennent »). */
  question: string;
  /** Present only on a zone a reader can go to — a zone that cannot be played is text, not a link. */
  href?: string;
  current?: boolean;
  /** Shown next to a zone that cannot be played yet (« bientôt »), so the state is a word, not a colour. */
  soonLabel?: string;
}

export interface ZoneNavProps {
  /** Accessible name of the landmark (« Les cinq zones du Tour »). */
  label: string;
  items: ZoneNavItem[];
  /** The one-line summary a phone shows instead of five columns (« Zone 3/5 · Retention — S'ils reviennent »). */
  compactLabel: string;
}

/**
 * The five zones of the Tour, with the level being played marked — plan §2.6.
 *
 * Paper world, presentation only: every string arrives as a prop, already in
 * the page's language, and nothing here imports from `lib/game` (plan §3.1,
 * guard C7). Built with the level page's shell (G4a); the interface chunk
 * that owns the rest of `components/game/` takes it over from here.
 *
 * Desktop: five columns, the current one underlined with the accent mark,
 * the others on the dashed rule the system uses for "not yet". Phone: five
 * columns of ~60 px would be unreadable (R13 in the plan — the prototype's
 * nav ran to four lines at 390 px), so a single line and five segments stand
 * in for them. Both are rendered and CSS picks one, the same CSS-only switch
 * the rest of the design system uses; the hidden one is `display: none`, so a
 * screen reader meets exactly one of them.
 */
export function ZoneNav({ label, items, compactLabel }: ZoneNavProps) {
  const current = items.find((item) => item.current);
  return (
    <nav aria-label={label} className={styles.nav} data-testid="game-zone-nav">
      <ol className={styles.columns}>
        {items.map((item) => {
          const body = (
            <>
              <span className={styles.pillar}>{item.pillar}</span>
              <span className={styles.question}>{item.question}</span>
              {item.soonLabel && <span className={styles.soon}>{item.soonLabel}</span>}
            </>
          );
          return (
            <li
              key={item.id}
              className={`${styles.zone} ${item.current ? styles.current : ""}`}
              data-testid={`game-zone-${item.id}`}
            >
              {item.href ? (
                <Link href={item.href} className={styles.link} aria-current={item.current ? "page" : undefined}>
                  {body}
                </Link>
              ) : (
                <span className={styles.static}>{body}</span>
              )}
            </li>
          );
        })}
      </ol>

      <div className={styles.compact}>
        {current?.href ? (
          <Link href={current.href} className={styles.compactLabel} aria-current="page">
            {compactLabel}
          </Link>
        ) : (
          <span className={styles.compactLabel}>{compactLabel}</span>
        )}
        <span className={styles.segments} aria-hidden="true">
          {items.map((item) => (
            <span key={item.id} className={`${styles.segment} ${item.current ? styles.segmentCurrent : ""}`} />
          ))}
        </span>
      </div>
    </nav>
  );
}
