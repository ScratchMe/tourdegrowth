import { resolveEngineProps } from "@/app/[locale]/aarrr-funnel-template/engine-props";
import type { EngineCalcContext } from "../types";
import { EXAMPLE_TODAY } from "./fixtures";

/**
 * The real, resolved copy for the unit tests — the same props the page
 * hands the island. Tests that assert a sentence read it through the real
 * templates, so a copy change that breaks a placeholder breaks a test
 * rather than a slide. (A test file may reach content; `lib/engine` itself
 * may not — engine-boundary.test.ts skips `__tests__/`.)
 */
export const FR = resolveEngineProps("fr");
export const EN = resolveEngineProps("en");
export const CTX_FR: EngineCalcContext = { today: EXAMPLE_TODAY, locale: "fr" };
export const CTX_EN: EngineCalcContext = { today: EXAMPLE_TODAY, locale: "en" };
