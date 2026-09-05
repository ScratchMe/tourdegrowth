/**
 * GoatCounter custom events (SPEC.md §8: "GoatCounter + un événement custom
 * par partage et par analyse complétée"). GoatCounter's own pageview script
 * is loaded conditionally in layout.tsx (only when a site code is
 * configured) — this module only wraps its *custom event* API
 * (`window.goatcounter.count`), which the script attaches to `window` once
 * it has loaded.
 *
 * Never throws, never blocks the UI it's called from: analytics is
 * strictly best-effort. Every call point in this app treats it as fire-and-
 * forget for that reason — this module just enforces the same rule.
 */

interface GoatCounterCountArgs {
  path: string;
  title?: string;
  event?: boolean;
}

declare global {
  interface Window {
    goatcounter?: { count?: (args: GoatCounterCountArgs) => void };
  }
}

/**
 * Fires one custom event. `name` becomes GoatCounter's "path" for the event
 * (shown as a pseudo-page in its dashboard) — kept short and stable so
 * dashboards don't fragment over time. `detail`, when given, is appended as
 * `name/detail` (e.g. `share/roast`) so a per-tone breakdown is visible
 * without needing a second event type per SPEC.md's "one event per share".
 *
 * No-ops silently — on the server (no `window`), before the GoatCounter
 * script has loaded, if it failed to load (ad-blocker, no site code
 * configured yet — see layout.tsx), or on any unexpected error calling it.
 */
export function trackEvent(name: string, detail?: string): void {
  if (typeof window === "undefined") return;
  try {
    window.goatcounter?.count?.({
      path: detail ? `${name}/${detail}` : name,
      event: true,
    });
  } catch {
    // Analytics must never break the feature it's attached to.
  }
}

/**
 * ---------------------------------------------------------------------------
 * The event vocabulary, in one place — REVIEW.md R-11.
 * ---------------------------------------------------------------------------
 *
 * Before this, only the two ENDS of the funnel were measured
 * (`submission_completed`, `share`): we could see how many people finished,
 * never where the rest dropped out. For a project whose whole point is
 * demonstrating AARRR fluency (SPEC.md §1), the tool's own Activation was
 * the one thing not instrumented.
 *
 *   /                                   pageview, GoatCounter does this itself
 *   quiz_started                        first answer recorded, once per run
 *   quiz_stage_completed/<1..5>         a pillar's 3 questions answered
 *   tone_selected/<neutral|roast>       "Get my score" pressed
 *   submission_completed/<tone>         a result exists (SPEC.md §8)
 *   share/<tone>/<native|copy>          a share actually happened (SPEC.md §8)
 *   deep_dive_started                   the owner opened the Deep dive
 *   deep_dive_completed/<with_context|no_context>
 *   profile_click/<placement>           a credit link to Antoine's CV
 *
 * These names are also what `goatcounter-api.ts` asks GoatCounter for, by
 * exact path — a name typed differently in the two places is a click the
 * dashboard silently under-counts, which is why the lists below are shared
 * rather than repeated.
 */

/** Both tones, as they appear in event paths. Mirrors `lib/quiz/tone.ts`. */
export const TONES = ["neutral", "roast"] as const;

/** How a share actually happened — the native sheet, or the desktop clipboard fallback. */
export const SHARE_METHODS = ["native", "copy"] as const;

/** The five AARRR stages, as stage-completion suffixes. */
export const QUIZ_STAGES = ["1", "2", "3", "4", "5"] as const;

/** Whether the Deep dive's optional free-text field was filled in (SPEC-ADDENDUM-02.md §1). */
export const DEEP_DIVE_CONTEXT_DETAILS = ["with_context", "no_context"] as const;

/**
 * The `profile_click` detail suffixes instrumented on every Antoine credit
 * link. Shared with `goatcounter-api.ts`'s server-side funnel fetch so the
 * two lists can never drift apart — the API module needs the exact same path
 * names to ask GoatCounter for, and a suffix missing from this list is a
 * click the funnel silently under-counts.
 *
 *  - `footer_cv`      — the score card's own footer line (SPEC-ADDENDUM-02.md §2.1)
 *  - `card_cv` / `card_linkedin` — the assertive Deep dive card (§2.2)
 *  - `sitefooter_cv`  — the site-wide footer (`components/brand/SiteFooter`),
 *    added 2026-09-05. Named apart from `footer_cv`, which despite its name
 *    is about the score card, not the page footer.
 */
export const PROFILE_CLICK_DETAILS = ["footer_cv", "card_cv", "card_linkedin", "sitefooter_cv"] as const;
