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
  /**
   * Accessible group name, localized by the caller — right in a header (the
   * tone toggle, the language switch). In a form, pass `labelledBy` instead.
   */
  label?: string;
  /**
   * The id of a VISIBLE label that names the group — a Field's `labelId`
   * (design system extension 04, Q15). It replaces `label` as the accessible
   * name: in a form, the name must be the words on screen.
   */
  labelledBy?: string;
  /**
   * `md` is the ToneToggle scale (44px tall). `sm` is header scale: a
   * 32px track, with each option's touch target extended to 44px on the
   * option itself — into 6px of room the group keeps above and below, so
   * never collapse that room to tighten a header.
   */
  size?: "md" | "sm";
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
 * never for on/off (that is a Checkbox). In a form it sits in a Field `group`
 * that shows its label, at `md` whatever the form's density.
 */
export function Segmented<Id extends string>(props: SegmentedProps<Id>) {
  const { options, value, label, labelledBy, size = "md", accent, className } = props;
  const sizeClass = size === "sm" ? styles.sm : styles.md;

  return (
    <div
      role="group"
      aria-labelledby={labelledBy}
      aria-label={labelledBy ? undefined : label}
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
