import type { Metadata } from "next";
import Link from "next/link";
import { ContentHeader } from "@/components/brand/ContentHeader";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import { Disclosure } from "@/components/core/Disclosure";
import { ENGINE_COPY } from "@/content/engine-copy";
import { isEngineOpenAtBuild } from "@/lib/engine/access";
import { formatInterval } from "@/lib/engine/format";
import { staticCatalogueValues } from "@/lib/engine/phrases";
import {
  DERIVED_SHAPES,
  ENGINE_CATALOG_VERSION,
  METRIC_SHAPES,
  type Benchmark,
  type MetricShape,
} from "@/lib/engine/catalog-shape";
import { EFFORT_KEY, type EngineStrings } from "@/lib/engine/strings";
import { PILLARS } from "@/lib/scoring/pillars";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { contentMetadata } from "@/lib/i18n/meta";
import { breadcrumbSchema, JsonLd, webApplicationSchema } from "@/lib/seo/jsonld";
import { tc } from "@/lib/i18n/translatable";
import { EngineWorkbench } from "./EngineWorkbench";
import { resolveEngineProps } from "./engine-props";
import { fill, monthLabel, stageLabel } from "./_engine/visual-model";
import styles from "./page.module.css";

const PATH = "/aarrr-funnel-template";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  const base = contentMetadata(
    resolved,
    PATH,
    // The brand as a suffix, like the other content pages' titles (spec §11.3).
    `${tc(ENGINE_COPY.meta.title, resolved)} — Tour de Growth`,
    tc(ENGINE_COPY.meta.description, resolved),
  );
  // Prerendered, so this is decided at BUILD time: the page stays noindex
  // until a build runs with ENGINE_ENABLED open. The proxy 404s it per
  // request meanwhile; a preview cookie must never make it indexable, which
  // is why the build flag reads the env var only (lib/engine/access.ts).
  return isEngineOpenAtBuild() ? base : { ...base, robots: { index: false, follow: true } };
}

/** A reference, in the metric's own unit — the same rule the sheet will print (§7 E3). */
function referenceRange(benchmark: Benchmark, unit: "percent" | "ratio" | "months", strings: EngineStrings, locale: Locale) {
  const ctx = { locale, today: new Date(0) };
  if (unit === "months") return fill(strings.units.months, { n: formatInterval(benchmark, "ratio", ctx, strings.units) });
  return formatInterval(benchmark, unit === "percent" ? "percent" : "ratio", ctx, strings.units);
}

function referenceLine(
  shape: MetricShape,
  caveat: string | undefined,
  noReferenceReason: string | undefined,
  strings: EngineStrings,
  locale: Locale,
): string | null {
  if (shape.benchmark) {
    const range = referenceRange(shape.benchmark, shape.unit === "percent" ? "percent" : "ratio", strings, locale);
    const template = shape.benchmark.designates ? strings.sheet.referenceDesignates : strings.sheet.referenceContext;
    return fill(template, { range, caveat: caveat ?? "" });
  }
  if (noReferenceReason) return fill(strings.sheet.noReference, { reason: noReferenceReason });
  return null;
}

/**
 * `/{locale}/aarrr-funnel-template` — the growth engine (engine spec §7 E0).
 *
 * The page is two things on purpose. **The tool** is the client island
 * (`EngineWorkbench`), mounted in a frame as wide as the app shell: the
 * peloton needs four grids side by side and the board a drawer next to its
 * rows, which the 760px prose column cannot hold. **The page around it** is
 * prerendered prose that reads without JavaScript and is what a search
 * engine indexes: the fifteen numbers with their formula, where to find each
 * one and what to know before quoting it, the three computed ones, the FAQ,
 * and a way to the Tour. It is built from the SAME resolved catalogue the
 * island receives, so the page cannot describe a number the tool does not
 * ask for.
 *
 * Server Component, prerendered (●) like every content page (R-24):
 * nothing here reads a header or a cookie. Behind `ENGINE_ENABLED` — the
 * proxy rewrites a closed page to a 404, so the page never has to become
 * dynamic to stay closed.
 */
export default async function EnginePage({ params }: PageProps) {
  const locale = (await params).locale as Locale;
  const props = resolveEngineProps(locale);
  const { strings } = props;
  const t = strings.page;
  // No setup here: no event named, no window chosen. Generic words and bracketed slots fill the catalogue
  // (« … ayant déclenché l'événement d'activation sous n jours », « inscrits en [mois de cohorte] »), from the
  // same helper that fills the requests and the annex with a real setup — never a raw `{event}`.
  const fills = staticCatalogueValues(strings);
  const metricOf = (id: MetricShape["id"]) => props.metrics.find((m) => m.id === id)!;
  const effortCount = (effort: MetricShape["effort"]) => METRIC_SHAPES.filter((s) => s.effort === effort).length;

  return (
    <>
      {/* §11.3: a WebApplication (free, no rating) and its breadcrumb — no HowTo nor
          FAQPage, whose rich results Google has withdrawn. Name and description are
          the page's own copy, handed to the builder rather than imported by it. */}
      <JsonLd
        data={webApplicationSchema(locale, {
          path: PATH,
          name: tc(ENGINE_COPY.meta.breadcrumb, locale),
          description: tc(ENGINE_COPY.meta.description, locale),
        })}
      />
      <JsonLd data={breadcrumbSchema(locale, [{ name: tc(ENGINE_COPY.meta.breadcrumb, locale), path: PATH }])} />
      <ContentHeader locale={locale} path={PATH} width="wide" />

      <main id="main" className={styles.main}>
        <div className={styles.intro}>
          <MetaLabel size="xs">{t.eyebrow}</MetaLabel>
          <h1 className={styles.title}>{t.title}</h1>
          <p className={styles.lead}>{t.positioning}</p>
          <p className={styles.text}>{t.promise}</p>

          {/* The promise comes BEFORE the call to action and never folds
              away (D16): it is the condition under which anyone types an
              employer's numbers into a web page. */}
          <Callout tone="caveat" data-testid="engine-privacy" className={styles.privacy}>
            <h2 className={styles.privacyTitle}>{t.privacyTitle}</h2>
            <p>{t.privacyBody}</p>
          </Callout>

          <div className={styles.cta}>
            {/* An in-page anchor to the island, not a route: without
                JavaScript it still lands on the tool's section and its
                noscript line. `hard` renders a bare <a>. */}
            <Button href="#engine" hard size="lg" data-testid="engine-cta">
              {t.cta}
            </Button>
            <p className={styles.ctaNote}>{t.ctaNote}</p>
          </div>
        </div>

        {/* How long it takes, said BEFORE the tool (retours d'Antoine
            2026-09-25): the counts come from the catalogue's own effort
            tags, so the sentence cannot promise a split the fifteen
            numbers do not have. */}
        <section className={styles.duration} aria-labelledby="engine-duration" data-testid="engine-duration">
          <h2 id="engine-duration" className={styles.durationTitle}>
            {t.durationTitle}
          </h2>
          <p className={styles.text}>
            {fill(t.durationIntro, {
              quick: String(effortCount("self-5min")),
              hour: String(effortCount("self-1h")),
              ask: String(effortCount("ask")),
            })}
          </p>
          <dl className={styles.durationList}>
            {(
              [
                [t.durationReadyLabel, t.durationReady],
                [t.durationAskLabel, t.durationAsk],
                [t.durationTargetsLabel, t.durationTargets],
                [t.durationDeckLabel, t.durationDeck],
              ] as const
            ).map(([label, body]) => (
              <div key={label} className={styles.durationItem}>
                <dt>{label}</dt>
                <dd>{body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="engine" className={styles.tool} aria-label={t.eyebrow}>
          <noscript>
            <p className={styles.text}>{t.noscript}</p>
          </noscript>
          <EngineWorkbench {...props} />
        </section>

        <section className={styles.catalogue} aria-labelledby="engine-catalogue" data-testid="engine-catalogue">
          <div className={styles.sectionHead}>
            <h2 id="engine-catalogue" className={styles.heading}>
              {t.catalogueTitle}
            </h2>
            <p className={styles.text}>{t.catalogueIntro}</p>
            <p className={styles.note}>
              {fill(t.catalogueVerified, { month: monthLabel(ENGINE_CATALOG_VERSION, locale) })}
            </p>
          </div>

          {/* Folded by default (retours 2026-09-25: the page was too long).
              The cards stay in the prerendered HTML — a closed <details>
              is still read by search engines and by find-in-page. */}
          <Disclosure summary={t.catalogueToggle} data-testid="engine-catalogue-toggle">
            <div className={styles.catalogueBody}>
              {PILLARS.map((pillar, index) => (
                <div key={pillar} className={styles.stage} data-testid={`engine-stage-${pillar}`}>
                  <MetaLabel size="xs">
                    {fill(strings.sheet.stageEyebrow, { i: String(index + 1), stage: stageLabel(pillar) })}
                  </MetaLabel>
                  <h3 className={styles.stageName}>{stageLabel(pillar)}</h3>
                  <div className={styles.metrics}>
                    {METRIC_SHAPES.filter((s) => s.stage === pillar)
                      .sort((a, b) => Number(b.primary) - Number(a.primary))
                      .map((shape) => {
                        const metric = metricOf(shape.id);
                        const reference = referenceLine(
                          shape,
                          metric.benchmarkCaveat,
                          metric.noReferenceReason,
                          strings,
                          locale,
                        );
                        return (
                          <article key={shape.id} className={styles.metric} data-metric={shape.id}>
                            {shape.primary ? <p className={styles.primary}>{strings.visual.primaryNumber}</p> : null}
                            <h4 className={styles.metricName}>{metric.name}</h4>
                            <p className={styles.oneLiner}>{metric.oneLiner}</p>
                            <dl className={styles.facts}>
                              <dt>{strings.sheet.formula}</dt>
                              <dd className={styles.formula}>{fill(metric.formula, fills)}</dd>
                              <dt>{strings.sheet.whereTitle}</dt>
                              <dd>
                                <ul className={styles.where}>
                                  {metric.where.map((w) => (
                                    <li key={`${w.label}-${w.path}`}>
                                      <span className={styles.whereTool}>{w.label}</span> — {fill(w.path, fills)}
                                    </li>
                                  ))}
                                </ul>
                              </dd>
                              <dt>{strings.sheet.trapTitle}</dt>
                              <dd>{fill(metric.trap, fills)}</dd>
                              {reference ? (
                                <>
                                  <dt>{strings.sheet.reference}</dt>
                                  <dd>{reference}</dd>
                                </>
                              ) : null}
                              <dt>{strings.visual.effort}</dt>
                              <dd>{strings.effort[EFFORT_KEY[shape.effort]]}</dd>
                            </dl>
                            <Link href={metric.glossaryHref} className={styles.glossary}>
                              {strings.sheet.definition}
                            </Link>
                          </article>
                        );
                      })}
                  </div>
                </div>
              ))}

              <div className={styles.stage} data-testid="engine-stage-computed">
                <h3 className={styles.stageName}>{t.catalogueComputedTitle}</h3>
                <div className={styles.metrics}>
                  {DERIVED_SHAPES.map((shape) => {
                    const d = props.derived.find((x) => x.id === shape.id)!;
                    const unit = shape.id === "rev.cac-payback" ? "months" : "ratio";
                    const reference = shape.benchmark
                      ? fill(strings.sheet.referenceContext, {
                          range: referenceRange(shape.benchmark, unit, strings, locale),
                          caveat: d.caveat ?? d.capNote ?? "",
                        })
                      : null;
                    return (
                      <article key={shape.id} className={styles.metric} data-metric={shape.id}>
                        <h4 className={styles.metricName}>{d.name}</h4>
                        <dl className={styles.facts}>
                          <dt>{strings.sheet.formula}</dt>
                          <dd className={styles.formula}>{d.formula}</dd>
                          {d.capNote ? (
                            <>
                              <dt>{strings.sheet.trapTitle}</dt>
                              <dd>{d.capNote}</dd>
                            </>
                          ) : null}
                          {reference ? (
                            <>
                              <dt>{strings.sheet.reference}</dt>
                              <dd>{reference}</dd>
                            </>
                          ) : null}
                        </dl>
                        <Link href={d.glossaryHref} className={styles.glossary}>
                          {strings.sheet.definition}
                        </Link>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </Disclosure>
        </section>

        <section className={styles.faq} aria-labelledby="engine-faq" data-testid="engine-faq">
          <h2 id="engine-faq" className={styles.heading}>
            {t.faqTitle}
          </h2>
          {strings.faq.map((item) => (
            <div key={item.q} className={styles.faqItem}>
              <h3 className={styles.faqQuestion}>{item.q}</h3>
              <p className={styles.text}>{item.a}</p>
            </div>
          ))}
        </section>

        {/* `hard`: /quiz lives under the app's root layout, so next/link
            would prefetch a dynamic route it can never use
            (`cross-root-links.test.ts`). */}
        <Callout
          tone="cta"
          className={styles.tour}
          action={
            <Button variant="secondary" size="lg" href="/quiz" hard data-testid="engine-tour-link">
              {t.tourFirst}
            </Button>
          }
        >
          <h2 className={styles.tourTitle}>{strings.visual.tourTitle}</h2>
          <p>{strings.mirror.noTour}</p>
        </Callout>
      </main>

      <SiteFooter locale={locale} width="wide" />
    </>
  );
}
