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
  // An event still waiting for the script goes out first. The poller only
  // ticks every RETRY_MS, so without this a click in that gap overtook the
  // mount event queued before it (`game_hangup/1` before `game_started`,
  // seen in the game's e2e): counts were right, the session's order was not.
  if (PENDING.length > 0 && !flushPending()) {
    queue(path);
    return;
  }
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
    // Ready: the queue goes out. Budget spent: it is dropped.
    if (!flushPending()) PENDING.length = 0;
    clearInterval(timer!);
    timer = null;
  }, RETRY_MS);
}

/** Sends the whole queue, in order, if the script is there; `false` when it is not yet. */
function flushPending(): boolean {
  if (typeof window === "undefined" || !window.goatcounter?.count) return false;
  // Splice as we go: a send that somehow throws must not replay the whole
  // queue on the next tick.
  while (PENDING.length > 0) send(PENDING.shift()!);
  return true;
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
 *   share/<tone>/<native|image|copy>    a share actually happened (SPEC.md §8); `image` carried the picture (A3.2)
 *   badge_copied                        the owner copied the README badge's Markdown (A3.1)
 *   take_own_tour                       a VISITOR of a shared result clicked into their own Tour (REVIEW-02.md R2-02)
 *   retake_started                      a Tour begun on a device that already holds a result (REVIEW-03.md A4)
 *   landing_return                      the landing loaded for someone who already has a result (REVIEW-03.md A4)
 *   deep_dive_started                   the owner opened the Deep dive
 *   deep_dive_completed/<with_context|no_context>
 *   profile_click/<placement>           a credit link to Antoine's CV
 *   tour_entry_clicked/<where>          the landing strip's Tour card (A7.9)
 *
 * These names are also what `goatcounter-api.ts` asks GoatCounter for, by
 * exact path — a name typed differently in the two places is a click the
 * dashboard silently under-counts, which is why the lists below are shared
 * rather than repeated.
 */

/** Both tones, as they appear in event paths. Mirrors `lib/quiz/tone.ts`. */
export const TONES = ["neutral", "roast"] as const;

/**
 * How a share actually happened: the native sheet with the link, the native
 * sheet carrying the share image itself (`image`, CHANTIERS.md A3.2 — where
 * `navigator.canShare({ files })` allows it), or the desktop clipboard
 * fallback. `goatcounter-api.ts` sums all three into the funnel's shares.
 */
export const SHARE_METHODS = ["native", "image", "copy"] as const;

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
 * The owner copied the README badge's Markdown (CHANTIERS.md A3.1). A copy,
 * not a paste: what happens in the README is out of sight. Counted on its
 * own line in the dashboard, not in the value-action ratio, whose definition
 * (REVIEW-03.md A4) this does not change without saying so.
 */
export const BADGE_COPIED_EVENT = "badge_copied";

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
/**
 * REVIEW-03.md C1 — the 30-day nudge was clicked.
 *
 * `retake_started` alone cannot answer whether the nudge works: it counts
 * every retake, nudged or not. This is the one event that separates them,
 * against `landing_return` as the denominator.
 */
export const RETAKE_NUDGE_EVENT = "retake_nudge_clicked";

/**
 * The Tour's card on the landing's strip was clicked (CHANTIERS.md A7.9,
 * C15, 2026-09-29) — `tour_entry_clicked/<where>`. A click, not a start:
 * `quiz_started` is the funnel's own denominator and takes no detail (the
 * `retake_started` note above says why), so where a Tour came from is a
 * companion event, read next to it.
 */
export const TOUR_ENTRY_EVENT = "tour_entry_clicked";
export const TOUR_ENTRY_DETAILS = ["home_strip"] as const;
export type TourEntryDetail = (typeof TOUR_ENTRY_DETAILS)[number];

/**
 * ---------------------------------------------------------------------------
 * The growth engine's vocabulary — engine spec §11.6.
 * ---------------------------------------------------------------------------
 *
 *   engine_opened                               the island's first view in a session
 *   engine_setup/<plg|slg|hybrid>               the motions ticked when the engine is created, or changed (Q14)
 *   engine_stage_saved/<stage>                  first number saved in that stage, once a session;
 *                                               sales-assisted's stages prefixed: slg-revenue (Q14)
 *   engine_month_started                        the next month was started: the one sign of repeated use (§19.12)
 *   engine_request_copied                       a request was put on the clipboard
 *   engine_deck_opened                          the slide screen was opened
 *   engine_exported/<png|pdf|text|json|ics|csv> a file downloaded, or the deck's text copied
 *   engine_tour_linked                          the engine was tied to a Tour result on the device
 *   engine_entry_clicked/<where>                a door into the engine was clicked (A7.9, A7.4, §19.10)
 *
 * PATHS ONLY, and every segment comes from the lists below. The page
 * promises in writing that nothing typed leaves the browser (D16), and an
 * event path is a way out like any other: never a diagnosis state, a status,
 * a number or a label someone entered. `engine-boundary.test.ts` rule 5
 * checks every call site under the engine's folders against these lists.
 *
 * Here rather than in the engine's folder for the R-11 reason: the
 * dashboard (`goatcounter-api.ts`) asks GoatCounter for exact paths, and a
 * path spelled on one side only is an event counted and never shown.
 */
export const ENGINE_OPENED_EVENT = "engine_opened";
/**
 * `engine_month_started` — the next month was started (engine spec §19.12,
 * A14 T7): the one signal that the engine is used month after month, which
 * is what the series has to prove. No detail: never which month.
 */
export const ENGINE_MONTH_STARTED_EVENT = "engine_month_started";
export const ENGINE_STAGE_SAVED_EVENT = "engine_stage_saved";
export const ENGINE_REQUEST_COPIED_EVENT = "engine_request_copied";
export const ENGINE_DECK_OPENED_EVENT = "engine_deck_opened";
export const ENGINE_EXPORTED_EVENT = "engine_exported";
export const ENGINE_TOUR_LINKED_EVENT = "engine_tour_linked";

/**
 * `engine_entry_clicked/<where>` — a door into the engine was clicked
 * (CHANTIERS.md A7.9 and A7.4, C7 and C15): the landing's strip, the space
 * band's pill; then the two doors of engine spec §19.10 (A14 T7): the line
 * under a result's action, for its owner, and the landing's « Ton moteur… »
 * line. A7.4 adds the three pages that link to it. Fired on the click,
 * before the page it opens, so `/admin/stats` can say where the openings
 * come from.
 */
export const ENGINE_ENTRY_EVENT = "engine_entry_clicked";
export const ENGINE_ENTRY_DETAILS = ["home_strip", "space_band", "result_owner", "landing_resume"] as const;
export type EngineEntryDetail = (typeof ENGINE_ENTRY_DETAILS)[number];

/**
 * A door into the engine, counted (§19.12, A14 T7): the detail is one of the
 * list, typed — never a free string, so no stage, score or count from the
 * page around the door can ride it. `engine-boundary.test.ts` rule 9 holds
 * every door outside the route to it, with a literal.
 */
export function trackEngineEntry(where: EngineEntryDetail): void {
  trackEvent(ENGINE_ENTRY_EVENT, where);
}

/** `engine_stage_saved/<stage>` — the five AARRR stages, in the product's canonical order. */
export const ENGINE_STAGES = ["acquisition", "activation", "retention", "referral", "revenue"] as const;

/**
 * Sales-assisted's five, prefixed (C25 Q14, 2026-09-30): a stage saved in
 * the assisted motion counts apart from self-serve's, so the dashboard can
 * say whether sales-assisted finds its public. Spelled out, never built:
 * a template here would be a path no list holds.
 */
export const ENGINE_SALES_STAGES = ["slg-acquisition", "slg-activation", "slg-retention", "slg-referral", "slg-revenue"] as const;

/** Every detail `engine_stage_saved` may carry: self-serve's five, then sales-assisted's. */
export const ENGINE_STAGE_DETAILS = [...ENGINE_STAGES, ...ENGINE_SALES_STAGES] as const;
export type EngineStageDetail = (typeof ENGINE_STAGE_DETAILS)[number];

/** A stage's detail in a motion: self-serve's is the stage itself (the v1 paths), sales-assisted's its prefixed twin. */
export function engineStageDetail(stage: (typeof ENGINE_STAGES)[number], motion: "plg" | "slg"): EngineStageDetail {
  return motion === "slg" ? ENGINE_SALES_STAGES[ENGINE_STAGES.indexOf(stage)]! : stage;
}

/**
 * `engine_setup/<motions>` — which motions the engine was set up with (C25
 * Q14): a box ticked, never a number nor a word anyone typed (D16).
 */
export const ENGINE_SETUP_EVENT = "engine_setup";
export const ENGINE_SETUP_DETAILS = ["plg", "slg", "hybrid"] as const;
export type EngineSetupDetail = (typeof ENGINE_SETUP_DETAILS)[number];

/** The detail for a setup's two boxes. */
export function engineSetupDetail(motions: { plg: boolean; slg: boolean }): EngineSetupDetail {
  return motions.plg && motions.slg ? "hybrid" : motions.slg ? "slg" : "plg";
}

/**
 * `engine_exported/<format>` — the ways a file (or the deck's text) leaves,
 * none of them sending anything: the deck's three (png, pdf, text), the
 * backup's json, then a reminder's `.ics` and the table's CSV template
 * (engine spec §19.12, A14 T7).
 */
export const ENGINE_EXPORT_FORMATS = ["png", "pdf", "text", "json", "ics", "csv"] as const;

/** The events that carry no detail at all. */
export const ENGINE_SIMPLE_EVENTS = [
  ENGINE_OPENED_EVENT,
  ENGINE_MONTH_STARTED_EVENT,
  ENGINE_REQUEST_COPIED_EVENT,
  ENGINE_DECK_OPENED_EVENT,
  ENGINE_TOUR_LINKED_EVENT,
] as const;

/** Every path the engine can emit, built from the lists above — the island and the dashboard read the same. */
export function engineEventPaths(): string[] {
  return [
    ...ENGINE_SIMPLE_EVENTS,
    ...ENGINE_SETUP_DETAILS.map((motions) => `${ENGINE_SETUP_EVENT}/${motions}`),
    ...ENGINE_STAGE_DETAILS.map((stage) => `${ENGINE_STAGE_SAVED_EVENT}/${stage}`),
    ...ENGINE_EXPORT_FORMATS.map((format) => `${ENGINE_EXPORTED_EVENT}/${format}`),
    ...ENGINE_ENTRY_DETAILS.map((where) => `${ENGINE_ENTRY_EVENT}/${where}`),
  ];
}
