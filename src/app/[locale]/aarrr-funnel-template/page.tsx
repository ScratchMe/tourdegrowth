import type { Metadata } from "next";
import Link from "next/link";
import { ContentHeader } from "@/components/brand/ContentHeader";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { Stopwatch } from "@/components/brand/Stopwatch";
import { Button } from "@/components/core/Button";
import { Callout } from "@/components/core/Callout";
import { Disclosure } from "@/components/core/Disclosure";
import { EngineLanding } from "@/components/engine/EngineLanding";
import { ENGINE_COPY } from "@/content/engine-copy";
import { isEngineOpenAtBuild, openTypesAtBuild } from "@/lib/engine/access";
import { formatInterval } from "@/lib/engine/format";
import { engineKnownScript } from "@/lib/engine/known-script";
import { staticCatalogueValues } from "@/lib/engine/phrases";
import {
  DERIVED_SHAPES,
  ENGINE_CATALOG_VERSION,
  LINK_METRIC_SHAPES,
  METRIC_SHAPES,
  SLG_DERIVED_SHAPES,
  SLG_METRIC_SHAPES,
  type Benchmark,
  type DerivedShape,
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
    // Its own picture (`opengraph-image.tsx`, design brief 06), not the landing's.
    { ownShareImage: true },
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
    return fill(strings.sheet.referenceContext, { range, caveat: caveat ?? "" });
  }
  if (noReferenceReason) return fill(strings.sheet.noReference, { reason: noReferenceReason });
  return null;
}

/**
 * `/{locale}/aarrr-funnel-template` — the growth engine (engine spec §7 E0).
 *
 * The page is two things on purpose. **The tool** is the client island
 * (`EngineWorkbench`), mounted in a frame as wide as the app shell: the
 * peloton needs four grids side by side and the board its five stage tabs
 * in one row, which the 760px prose column cannot hold. **The page around it** is
 * prerendered prose that reads without JavaScript and is what a search
 * engine indexes: the seventeen numbers with their formula, where to find each
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
  const effortCount = (shapes: readonly MetricShape[], effort: MetricShape["effort"]) => shapes.filter((s) => s.effort === effort).length;
  const efforts = (shapes: readonly MetricShape[]) => ({
    quick: String(effortCount(shapes, "self-5min")),
    hour: String(effortCount(shapes, "self-1h")),
    ask: String(effortCount(shapes, "ask")),
  });

  /** One number's card: its formula, where to find it, its trap, its reference, its effort. */
  const metricCard = (shape: MetricShape) => {
    const metric = metricOf(shape.id);
    const reference = referenceLine(shape, metric.benchmarkCaveat, metric.noReferenceReason, strings, locale);
    return (
      <article key={shape.id} className={styles.metric} data-metric={shape.id}>
        {shape.primary ? <p className={styles.primary}>{strings.visual.primaryNumber}</p> : null}
        <h5 className={styles.metricName}>{metric.name}</h5>
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
  };

  /** One motion's numbers, stage by stage, ★ first. `prefix` keeps the stages' test ids apart: self-serve's are the v1 ones. */
  const stages = (shapes: readonly MetricShape[], prefix: string) =>
    PILLARS.map((pillar, index) => {
      const ofStage = shapes.filter((s) => s.stage === pillar).sort((a, b) => Number(b.primary) - Number(a.primary));
      if (ofStage.length === 0) return null;
      return (
        <div key={`${prefix}${pillar}`} className={styles.stage} data-testid={`engine-stage-${prefix}${pillar}`}>
          <MetaLabel size="xs">{fill(strings.sheet.stageEyebrow, { i: String(index + 1), stage: stageLabel(pillar) })}</MetaLabel>
          <h4 className={styles.stageName}>{stageLabel(pillar)}</h4>
          <div className={styles.metrics}>{ofStage.map(metricCard)}</div>
        </div>
      );
    });

  /** The computed figures of one motion: never entered, each with its formula and its reference. */
  const computed = (shapes: readonly DerivedShape[], title: string, testId: string) => (
    <div className={styles.stage} data-testid={testId}>
      <h4 className={styles.stageName}>{title}</h4>
      <div className={styles.metrics}>
        {shapes.map((shape) => {
          const d = props.derived.find((x) => x.id === shape.id)!;
          const unit = shape.id === "rev.cac-payback" || shape.id === "slg.rev.cac-payback" ? "months" : "ratio";
          const reference = shape.benchmark
            ? fill(strings.sheet.referenceContext, {
                range: referenceRange(shape.benchmark, unit, strings, locale),
                caveat: d.caveat ?? d.capNote ?? "",
              })
            : null;
          return (
            <article key={shape.id} className={styles.metric} data-metric={shape.id}>
              <h5 className={styles.metricName}>{d.name}</h5>
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
  );

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
      <ContentHeader locale={locale} path={PATH} width="wide" space="engine" />

      <main id="main" className={styles.main}>
        {/* Before the first paint (A18 T4, brief 07 Q1): a returning reader is known by the storage key alone, and
            the page draws their short version by CSS — `engineKnownScript` reads no value and sends nothing.
            Before any content, so the attribute is there when the landing paints; a search engine, which has no
            storage, always reads the first visit's page. */}
        <script dangerouslySetInnerHTML={{ __html: engineKnownScript() }} />
        {/* The promise comes BEFORE the call to action and never folds away (D16): it is the condition under
            which anyone types an employer's numbers into a web page — a card on a first visit, a line on return. */}
        <EngineLanding
          eyebrow={t.eyebrow}
          title={t.title}
          lede={t.positioning}
          positioning={t.promise}
          promiseTitle={t.privacyTitle}
          promiseBody={t.privacyBody}
          promiseLine={t.promiseLine}
          cta={t.cta}
          ctaNote={t.ctaNote}
          aside={<Stopwatch data-testid="engine-stopwatch" />}
          data-testid="engine-landing"
        />

        <section id="engine" className={styles.tool} aria-label={t.eyebrow}>
          <noscript>
            <p className={styles.text}>{t.noscript}</p>
          </noscript>
          {/* A returning reader's first instant: the tool's place held, dashed (« not yet »), until the island
              renders the board — its height keeps what follows from jumping above the fold. CSS only: shown under
              `[data-engine="known"]`, gone once the island says it is ready. */}
          <p className={styles.reserve} data-testid="engine-reserve">
            {t.reserve}
          </p>
          {/* The types this BUILD opens (§21.3, ENGINE_TYPES): read here, on the server, and handed down as a prop —
              the island never reads the environment. Nothing reads it yet: the start card does, from APP-7. */}
          <EngineWorkbench {...props} openTypes={openTypesAtBuild()} />
        </section>

        {/* How long it takes, under the tool since A18 T4 (the return: the start card says the same counts in one
            line). The counts come from the catalogue's own effort tags, so the sentence cannot promise a split the
            numbers do not have. */}
        <section className={styles.duration} aria-labelledby="engine-duration" data-testid="engine-duration">
          <h2 id="engine-duration" className={styles.durationTitle}>
            {t.durationTitle}
          </h2>
          <p className={styles.text}>{fill(t.durationIntro, efforts(METRIC_SHAPES))}</p>
          <p className={styles.text}>{fill(t.durationIntroSlg, efforts(SLG_METRIC_SHAPES))}</p>
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

        <section className={styles.catalogue} aria-labelledby="engine-catalogue" data-testid="engine-catalogue">
          <div className={styles.sectionHead}>
            <h2 id="engine-catalogue" className={styles.heading}>
              {t.catalogueTitle}
            </h2>
            <p className={styles.note}>
              {fill(t.catalogueVerified, { month: monthLabel(ENGINE_CATALOG_VERSION, locale) })}
            </p>
          </div>

          {/* Folded by default (retours 2026-09-25: the page was too long).
              The cards stay in the prerendered HTML — a closed <details>
              is still read by search engines and by find-in-page. */}
          <Disclosure summary={t.catalogueToggle} data-testid="engine-catalogue-toggle">
            {/* One subsection per motion, then the link (§18.7 E0): « Libre-service : 17 chiffres »,
                « Assisté : 15 chiffres ». Self-serve's stages keep their v1 test ids. */}
            <div className={styles.catalogueBody}>
              <div className={styles.sectionHead} data-testid="engine-catalogue-plg">
                <h3 className={styles.subheading}>{fill(t.catalogueTitlePlg, { n: String(METRIC_SHAPES.length) })}</h3>
                <p className={styles.text}>{t.catalogueIntro}</p>
              </div>
              {stages(METRIC_SHAPES, "")}
              {computed(DERIVED_SHAPES, t.catalogueComputedTitle, "engine-stage-computed")}

              <div className={styles.sectionHead} data-testid="engine-catalogue-slg">
                <h3 className={styles.subheading}>{fill(t.catalogueTitleSlg, { n: String(SLG_METRIC_SHAPES.length) })}</h3>
                <p className={styles.text}>{t.catalogueIntroSlg}</p>
              </div>
              {stages(SLG_METRIC_SHAPES, "slg-")}
              {computed(SLG_DERIVED_SHAPES, t.catalogueComputedTitleSlg, "engine-stage-slg-computed")}

              <div className={styles.stage} data-testid="engine-stage-link">
                <h3 className={styles.subheading}>{t.catalogueLinkTitle}</h3>
                <div className={styles.metrics}>{LINK_METRIC_SHAPES.map(metricCard)}</div>
              </div>
            </div>
          </Disclosure>
        </section>

        <section className={styles.faq} aria-labelledby="engine-faq" data-testid="engine-faq">
          <h2 id="engine-faq" className={styles.heading}>
            {t.faqTitle}
          </h2>
          {/* One row per question, answers folded (Antoine, 2026-09-26: the
              FAQ too, like the catalogue). The questions stay readable as a
              list; a closed <details> keeps its answer in the prerendered
              HTML, so search engines and find-in-page still reach it. */}
          <div className={styles.faqList}>
            {strings.faq.map((item) => (
              <Disclosure
                key={item.q}
                summary={<span className={styles.faqQuestion}>{item.q}</span>}
                data-testid="engine-faq-item"
              >
                <p className={[styles.text, styles.faqAnswer].join(" ")}>{item.a}</p>
              </Disclosure>
            ))}
          </div>
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
