import { QUESTIONS } from "@/content/copy-library";
import { ENGINE_CATALOG, ENGINE_DERIVED_CATALOG } from "@/content/engine-catalog";
import { ENGINE_CATALOG_CONSUMER, ENGINE_DERIVED_CATALOG_CONSUMER, type ConsumerPlgMetricId } from "@/content/engine-catalog-consumer";
import { ENGINE_COPY } from "@/content/engine-copy";
import { displayDerivedShapeOf, displayShapeOf } from "@/lib/engine/business-type";
import {
  ALL_DERIVED_SHAPES,
  ALL_METRIC_SHAPES,
  APP_DERIVED_SHAPES,
  APP_METRIC_SHAPES,
  APP_REPLACED,
  DERIVED_SHAPES,
  ENGINE_BRIDGES,
  METRIC_SHAPES,
  SLG_ENGINE_BRIDGES,
  type MetricShape,
} from "@/lib/engine/catalog-shape";
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
 * Catalogue order is `ALL_METRIC_SHAPES`' order (self-serve, sales-assisted,
 * the link), so the prose and the shape always line up index by index as
 * well as by id. All of it travels whatever the setup (the app's own numbers
 * excepted, below): the motions are the user's, read in the browser, and the
 * island filters with `shapesOf`.
 *
 * The consumer app has its own catalogue (`typeCatalogs`, §21.4.7): the fifteen
 * self-serve numbers it shows in its own words, then its six, and its figures.
 * It travels to every visitor, whatever the setup: a static page cannot know
 * which type the browser will hold. A SaaS's `metrics` and `derived` carry none
 * of the app's ids.
 *
 * Not the `openTypes` prop (§21.3): it comes from the build's environment, which
 * this function does not read — the page adds it (`openTypesAtBuild()`).
 */
export function resolveEngineProps(locale: Locale): Omit<EngineWorkbenchProps, "openTypes"> {
  // The SaaS catalogue only: the app's own numbers (scope "app", ids "app.*") travel in `typeCatalogs` below, never
  // here. The counts (33 numbers, 8 computed figures) are held by a test.
  const metrics: ResolvedMetric[] = ALL_METRIC_SHAPES.filter((shape) => shape.scope !== "app").map((shape) => ({
    id: shape.id,
    ...resolveTree(ENGINE_CATALOG[shape.id], locale),
    glossaryHref: localePath(locale, `/glossary/${shape.glossary}`),
  }));

  const derived: ResolvedDerived[] = ALL_DERIVED_SHAPES.filter((shape) => !shape.id.startsWith("app.")).map((shape) => ({
    id: shape.id,
    ...resolveTree(ENGINE_DERIVED_CATALOG[shape.id], locale),
    glossaryHref: localePath(locale, `/glossary/${shape.glossary}`),
  }));

  // The consumer app's catalogue (§21.4.7): the fifteen self-serve numbers it keeps (not the two it replaces), in
  // `METRIC_SHAPES` order and in its own words, then its six in `APP_METRIC_SHAPES` order; its figures the same way.
  // The glossary link comes from the shape the app DISPLAYS (§21.4.3), not the SaaS's.
  const glossaryHref = (term: string) => localePath(locale, `/glossary/${term}`);
  const isKept = (shape: MetricShape): shape is MetricShape<ConsumerPlgMetricId> => !APP_REPLACED.some((id) => id === shape.id);
  const appMetrics: ResolvedMetric[] = [
    ...METRIC_SHAPES.filter(isKept).map((shape) => ({
      id: shape.id,
      ...resolveTree(ENGINE_CATALOG_CONSUMER[shape.id], locale),
      glossaryHref: glossaryHref(displayShapeOf(shape.id, "consumer-app").glossary),
    })),
    ...APP_METRIC_SHAPES.map((shape) => ({
      id: shape.id,
      ...resolveTree(ENGINE_CATALOG[shape.id], locale),
      glossaryHref: glossaryHref(displayShapeOf(shape.id, "consumer-app").glossary),
    })),
  ];
  const appDerived: ResolvedDerived[] = [
    ...DERIVED_SHAPES.flatMap((shape) =>
      shape.id === "rev.grr" || shape.id === "rev.nrr"
        ? [
            {
              id: shape.id,
              ...resolveTree(ENGINE_DERIVED_CATALOG_CONSUMER[shape.id], locale),
              glossaryHref: glossaryHref(displayDerivedShapeOf(shape.id, "consumer-app").glossary),
            },
          ]
        : [],
    ),
    ...APP_DERIVED_SHAPES.map((shape) => ({
      id: shape.id,
      ...resolveTree(ENGINE_DERIVED_CATALOG[shape.id], locale),
      glossaryHref: glossaryHref(displayDerivedShapeOf(shape.id, "consumer-app").glossary),
    })),
  ];

  // Only the bridged questions travel, not the fifteen: the island has no use
  // for the others, and the copy library stays on the server. Self-serve's
  // eight, then sales-assisted's six (§18.4.9): the mirror keeps the ticked
  // motions' rows, one per (question, motion), in this order.
  const bridges: ResolvedBridge[] = [...ENGINE_BRIDGES, ...SLG_ENGINE_BRIDGES].map(({ questionId, metric }) => {
    const question = QUESTIONS.find((q) => q.id === questionId);
    if (!question) throw new Error(`Engine bridge names an unknown Tour question: ${questionId}`);
    return {
      questionId,
      metric,
      question: resolveTree(question.question, locale),
      options: question.options.map((o) => ({ label: resolveTree(o.label, locale), points: o.points })),
    };
  });

  return {
    locale,
    strings: resolveTree(ENGINE_COPY, locale),
    metrics,
    derived,
    typeCatalogs: { "consumer-app": { metrics: appMetrics, derived: appDerived } },
    bridges,
  };
}
