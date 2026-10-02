import { setupCoverage } from "./coverage";
import { formatMonth } from "./format";
import { loadEngine } from "./storage";

/**
 * resume.ts — the landing's way back into the engine (engine spec §19.10,
 * C32 Q16, A14 T6): « Ton moteur : septembre 2026, 11 sur 17 chiffres ».
 *
 * Read on the device, after mount, by `LastResult` — and loaded only by a
 * dynamic `import()` behind the build's engine flag, so a landing built with
 * the engine closed carries none of it. Read only: nothing is written, and
 * nothing leaves the browser. A month and two counts, never a value nor the
 * company's name — the landing may be on a shared screen.
 */
export interface EngineResume {
  /** The month being filled, as the page's language writes it. */
  month: string;
  found: number;
  total: number;
}

export function engineResume(locale: "en" | "fr"): EngineResume | null {
  // The storage only judges an entry's shape: a draft with no motion, or a month that is not YYYY-MM, would throw
  // below. The landing then shows no line — never an error (the security review of A14 T6).
  try {
    const loaded = loadEngine();
    if (loaded.kind !== "ok") return null;
    const { state } = loaded;
    const snapshot = state.snapshots[state.snapshots.length - 1];
    if (!snapshot) return null;
    const cov = setupCoverage(snapshot, state.setup);
    return { month: formatMonth(snapshot.referenceMonth, locale), found: cov.found, total: cov.denominator };
  } catch {
    return null;
  }
}
