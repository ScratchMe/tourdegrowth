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
