import styles from "./Segmented.module.css";

export interface SegmentedOption<Id extends string> {
  id: Id;
  label: string;
  /** Only for the link form. */
  href?: string;
  /** BCP-47 tag for a link that changes language — sets `hreflang` and `lang`. */
  lang?: string;
}

interface SegmentedBaseProps<Id extends string> {
  /** Two, at most three. Past that it is a list, not a control. */
  options: readonly SegmentedOption<Id>[];
  /** The selected id. */
  value: Id;
  /** Accessible group name, localized by the caller. */
  label: string;
  /** `md` is the ToneToggle scale; `compact` is header scale. */
  size?: "md" | "compact";
  /** Returns true for an option whose selected fill is red rather than ink — the roast tone only. */
  accent?: (id: Id) => boolean;
  className?: string;
}

interface SegmentedButtonProps<Id extends string> extends SegmentedBaseProps<Id> {
  as?: "button";
  onChange: (id: Id) => void;
}

interface SegmentedLinkProps<Id extends string> extends SegmentedBaseProps<Id> {
  as: "a";
  onChange?: never;
}

export type SegmentedProps<Id extends string> = SegmentedButtonProps<Id> | SegmentedLinkProps<Id>;

/**
 * Two-to-three option segmented control — design system extension 01.
 *
 * One 2px ink border around the group, a 2px ink divider between segments,
 * the selected one filled ink (or red, for the roast tone alone). It is the
 * base `ToneToggle` and `LocaleSwitcher` share; reach for it directly only if
 * a third such control appears.
 *
 * Never for navigation between pages of different content (that is tabs), and
 * never for on/off (that is a checkbox, which this system does not have).
 */
export function Segmented<Id extends string>(props: SegmentedProps<Id>) {
  const { options, value, label, size = "md", accent, className } = props;
  const sizeClass = size === "compact" ? styles.compact : styles.md;

  return (
    <div
      role="group"
      aria-label={label}
      className={[styles.group, sizeClass, className ?? ""].filter(Boolean).join(" ")}
    >
      <div className={styles.track}>
        {options.map((option) => {
          const on = option.id === value;
          const classes = [styles.option, on ? styles.on : "", on && accent?.(option.id) ? styles.onAccent : ""]
            .filter(Boolean)
            .join(" ");

          if (props.as === "a") {
            return (
              <a
                key={option.id}
                href={option.href}
                hrefLang={option.lang}
                lang={option.lang}
                aria-current={on ? "true" : undefined}
                className={classes}
              >
                {option.label}
              </a>
            );
          }

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={on}
              onClick={() => !on && props.onChange(option.id)}
              className={classes}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
