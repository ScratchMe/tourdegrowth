import { QUESTIONS } from "@/content/copy-library";
import { ENGINE_CATALOG, ENGINE_DERIVED_CATALOG } from "@/content/engine-catalog";
import { ENGINE_COPY } from "@/content/engine-copy";
import { DERIVED_SHAPES, ENGINE_BRIDGES, METRIC_SHAPES } from "@/lib/engine/catalog-shape";
import type { ResolvedBridge, ResolvedDerived, ResolvedMetric } from "@/lib/engine/strings";
import type { Locale } from "@/lib/i18n/locale";
import { localePath } from "@/lib/i18n/routes";
import { resolveTree } from "@/lib/i18n/translatable";
import type { EngineWorkbenchProps } from "./EngineWorkbench";

/**
 * Builds the island's props on the server — engine spec §4.4. The ONLY
 * module of the engine that reads content: the page calls it at build time
 * (the page is prerendered) and passes plain strings down. The island must
 * never import this file — `engine-boundary.test.ts` walks the island's
 * value imports and fails if any chain reaches `content/`.
 *
 * Catalogue order is `METRIC_SHAPES`' order, so the prose and the shape
 * always line up index by index as well as by id.
 */
export function resolveEngineProps(locale: Locale): EngineWorkbenchProps {
  const metrics: ResolvedMetric[] = METRIC_SHAPES.map((shape) => ({
    id: shape.id,
    ...resolveTree(ENGINE_CATALOG[shape.id], locale),
    glossaryHref: localePath(locale, `/glossary/${shape.glossary}`),
  }));

  const derived: ResolvedDerived[] = DERIVED_SHAPES.map((shape) => ({
    id: shape.id,
    ...resolveTree(ENGINE_DERIVED_CATALOG[shape.id], locale),
    glossaryHref: localePath(locale, `/glossary/${shape.glossary}`),
  }));

  // Only the eight bridged questions travel, not the fifteen: the island has
  // no use for the others, and the copy library stays on the server.
  const bridges: ResolvedBridge[] = ENGINE_BRIDGES.map(({ questionId, metric }) => {
    const question = QUESTIONS.find((q) => q.id === questionId);
    if (!question) throw new Error(`Engine bridge names an unknown Tour question: ${questionId}`);
    return {
      questionId,
      metric,
      question: resolveTree(question.question, locale),
      options: question.options.map((o) => ({ label: resolveTree(o.label, locale), points: o.points })),
    };
  });

  return { locale, strings: resolveTree(ENGINE_COPY, locale), metrics, derived, bridges };
}
