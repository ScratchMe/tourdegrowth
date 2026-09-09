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
  const path = detail ? `${name}/${detail}` : name;
  if (!send(path)) queue(path);
}

/** Hands one path to GoatCounter, reporting whether the script was there to take it. */
function send(path: string): boolean {
  try {
    const count = window.goatcounter?.count;
    if (!count) return false;
    count({ path, event: true });
    return true;
  } catch {
    // Analytics must never break the feature it's attached to. A throw here
    // is not "try again later" — the script answered, badly.
    return true;
  }
}

/**
 * Events fired before the script finished loading — REVIEW-03.md A4.
 *
 * Every event up to now was fired from a click, long after
 * `strategy="afterInteractive"` had loaded `count.js`. `landing_return`
 * fires at mount instead, which races that load and lost to it: the
 * optional chaining above made the miss completely silent, so the count
 * would simply have run low in production with nothing to show for it. An
 * e2e assertion caught it; nothing else would have.
 *
 * So a missed event waits instead of vanishing. The poll is bounded: if the
 * script never arrives — an ad blocker, a request that fails — the queue is
 * dropped rather than held forever, which is the same bargain the silent
 * `?.` was already making, only deliberate.
 */
const PENDING: string[] = [];
const RETRY_MS = 150;
const GIVE_UP_MS = 10_000;
let timer: ReturnType<typeof setInterval> | null = null;
let waitedMs = 0;

function queue(path: string): void {
  PENDING.push(path);
  if (timer) return;
  waitedMs = 0;
  timer = setInterval(() => {
    waitedMs += RETRY_MS;
    const ready = typeof window !== "undefined" && Boolean(window.goatcounter?.count);
    if (!ready && waitedMs < GIVE_UP_MS) return;

    if (ready) {
      // Splice as we go: a send that somehow throws must not replay the
      // whole queue on the next tick.
      while (PENDING.length > 0) send(PENDING.shift()!);
    } else {
      PENDING.length = 0;
    }
    clearInterval(timer!);
    timer = null;
  }, RETRY_MS);
}

/** Test-only: drops any queued event and stops the poller between cases. */
export function resetPendingEventsForTests(): void {
  PENDING.length = 0;
  if (timer) clearInterval(timer);
  timer = null;
  waitedMs = 0;
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
 *   segment_answered/<both|stage|model|neither>  the two context questions (REVIEW-02.md R2-26)
 *   tone_selected/<neutral|roast>       "Get my score" pressed
 *   submission_completed/<tone>         a result exists (SPEC.md §8)
 *   share/<tone>/<native|copy>          a share actually happened (SPEC.md §8)
 *   take_own_tour                       a VISITOR of a shared result clicked into their own Tour (REVIEW-02.md R2-02)
 *   retake_started                      a Tour begun on a device that already holds a result (REVIEW-03.md A4)
 *   landing_return                      the landing loaded for someone who already has a result (REVIEW-03.md A4)
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

/**
 * How much of the segment screen was answered (REVIEW-02.md R2-26). Both
 * questions default to "rather not say", so this is the one number that says
 * whether the screen earns the extra step — and whether the segment averages
 * will ever have the volume to appear.
 */
export const SEGMENT_DETAILS = ["both", "stage", "model", "neither"] as const;

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
 *  - `about_cv` / `about_linkedin` — the contact section of `/about` (REVIEW-02.md R2-04).
 */
export const PROFILE_CLICK_DETAILS = ["footer_cv", "card_cv", "card_linkedin", "sitefooter_cv", "about_cv", "about_linkedin"] as const;

/**
 * The one click a shared result page exists to produce: a visitor starting
 * their own Tour (REVIEW-02.md R2-02). Before this event the page's primary
 * CTA was the owner's share button and nothing measured the visitor at all.
 */
export const OWN_TOUR_EVENT = "take_own_tour";

/**
 * The two return signals — REVIEW-03.md A4.
 *
 * `REVIEW-03.md` proposed these as a `quiz_started/<first|retake>` detail.
 * They are separate events instead, and the reason matters: `quiz_started`
 * is the funnel's own denominator since R-11, and adding a detail suffix
 * would freeze the exact path `quiz_started` and start two new ones — the
 * same fragmentation `share/<tone>` took in R-10, but this time on the
 * number every drop-off ratio divides by. A companion event leaves both the
 * funnel and its history intact, and a retake is still counted once.
 *
 *  - `retake_started` — fired ALONGSIDE `quiz_started`, only when the device
 *    already holds at least one result. This is the tool's own Retention:
 *    the one thing a self-assessment has no natural reason to produce.
 *  - `landing_return` — the landing rendered for someone who already has a
 *    result. It is not part of the value-action ratio; it is the
 *    denominator C1's 30-day nudge will need ("how many people came back at
 *    all") before anyone can say whether the nudge works.
 */
export const RETAKE_STARTED_EVENT = "retake_started";
export const LANDING_RETURN_EVENT = "landing_return";
