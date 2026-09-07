import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentHeader } from "@/components/brand/ContentHeader";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { Button } from "@/components/core/Button";
import { Card } from "@/components/core/Card";
import { METRICS } from "@/content/metrics";
import { tc } from "@/lib/i18n/translatable";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { contentMetadata } from "@/lib/i18n/meta";
import { localePath } from "@/lib/i18n/routes";
import { getPublicMetrics, isPublicMetricsEnabled, MIN_SUBMISSIONS_TO_PUBLISH } from "@/lib/metrics/public-metrics";
import type { ScoreBandId } from "@/lib/submissions/growth-stats";
import frame from "../how-it-works/page.module.css";
import own from "./page.module.css";

interface PageProps {
  params: Promise<{ locale: string }>;
}

/**
 * Rendered per request, never at build time — two reasons, both load-bearing.
 * The env flag has to be read live so the page can be opened or closed
 * without a deploy; and prerendering it would call Firestore during
 * `next build`, which has no credentials in CI (see R-05: nothing the build
 * touches reaches Firestore). The Firestore read itself is capped at one per
 * hour by `getPublicMetrics`, so "dynamic" costs nothing in reads.
 */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const resolved: Locale = isLocale(locale) ? locale : "en";
  const base = contentMetadata(
    resolved,
    "/metrics",
    tc(METRICS.title, resolved),
    tc(METRICS.metaDescription, resolved),
  );
  // Numbers that move hourly are not a page to rank; the page exists to be
  // read by someone already here, and linked to from a post.
  return { ...base, robots: { index: false, follow: true } };
}

/** `/metrics` — REVIEW-02.md R2-28. Closed until `METRICS_PAGE_ENABLED` says otherwise. */
export default async function MetricsPage({ params }: PageProps) {
  if (!isPublicMetricsEnabled()) notFound();
  const locale = (await params).locale as Locale;
  const m = await getPublicMetrics();

  return (
    <>
      <ContentHeader locale={locale} path="/metrics" />
      <main className={frame.main}>
        <div className={frame.intro}>
          <h1 className={frame.title}>{tc(METRICS.title, locale)}</h1>
          <p className={frame.subtitle}>{tc(METRICS.intro, locale)}</p>
          <MetaLabel size="xs" uppercase={false}>
            {tc(METRICS.freshness, locale)}
          </MetaLabel>
        </div>

        {!m.meaningful && (
          <Card elevation="raised" tone="outlineAlert" className={own.tooEarly}>
            <MetaLabel size="xs">{tc(METRICS.tooEarlyTitle, locale)}</MetaLabel>
            <p className={frame.sectionBody}>
              {tc(METRICS.tooEarly, locale).replace("{min}", String(MIN_SUBMISSIONS_TO_PUBLISH))}
            </p>
          </Card>
        )}

        <section className={own.figures}>
          <Figure label={tc(METRICS.toursLabel, locale)} value={String(m.tours)} help={tc(METRICS.toursHelp, locale)} />
          <Figure label={tc(METRICS.last30Label, locale)} value={String(m.toursLast30Days)} />
          {m.meaningful && (
            <Figure
              label={tc(METRICS.averageLabel, locale)}
              value={`${m.averageScore}/100`}
              help={tc(METRICS.averageHelp, locale)}
            />
          )}
        </section>

        {m.meaningful && (
          <>
            <section className={frame.proseSection}>
              <h2 className={frame.sectionTitle}>{tc(METRICS.distributionTitle, locale)}</h2>
              <p className={frame.sectionBody}>{tc(METRICS.distributionHelp, locale)}</p>
              <Distribution bands={m.scoreBands} total={m.tours} />
            </section>

            <section className={own.figures}>
              <Figure
                label={tc(METRICS.deepDiveLabel, locale)}
                value={percent(m.deepDiveRate)}
                help={tc(METRICS.deepDiveHelp, locale)}
              />
              <Figure
                label={tc(METRICS.kFactorLabel, locale)}
                value={m.kFactor.toFixed(2)}
                help={`${m.referredTours} ${tc(METRICS.referredLabel, locale)}. ${tc(METRICS.kFactorHelp, locale)}`}
              />
            </section>
          </>
        )}

        <section className={frame.proseSection}>
          <h2 className={frame.sectionTitle}>{tc(METRICS.caveatsTitle, locale)}</h2>
          <ul className={own.caveats}>
            {METRICS.caveats.map((c, i) => (
              <li key={i} className={frame.sectionBody}>
                {tc(c, locale)}
              </li>
            ))}
          </ul>
        </section>

        <section className={frame.proseSection}>
          <h2 className={frame.sectionTitle}>{tc(METRICS.methodTitle, locale)}</h2>
          <p className={frame.sectionBody}>{tc(METRICS.method, locale)}</p>
        </section>

        <div className={frame.ctaWrap}>
          <Button size="lg" href={localePath(locale, "/")}>
            {tc(METRICS.cta, locale)}
          </Button>
        </div>
      </main>
      <SiteFooter locale={locale} width="reading" />
    </>
  );
}

function percent(ratio: number): string {
  return `${Math.round(ratio * 100)} %`;
}

function Figure({ label, value, help }: { label: string; value: string; help?: string }) {
  return (
    <div className={own.figure}>
      <MetaLabel size="xs">{label}</MetaLabel>
      <div className={own.value}>{value}</div>
      {help && <p className={own.help}>{help}</p>}
    </div>
  );
}

/**
 * Four labelled bars, drawn with the design system's own surfaces rather than
 * a charting library: the widths ARE the proportions, and every band shows
 * its count next to it, so the figure is readable without measuring the bar.
 */
function Distribution({ bands, total }: { bands: Record<ScoreBandId, number>; total: number }) {
  const order: ScoreBandId[] = ["0-39", "40-59", "60-79", "80-100"];
  return (
    <div className={own.bars}>
      {order.map((band) => {
        const n = bands[band];
        const share = total ? n / total : 0;
        return (
          <div key={band} className={own.barRow}>
            <span className={own.barLabel}>{band}</span>
            <span className={own.barTrack}>
              <span className={own.barFill} style={{ width: `${Math.round(share * 100)}%` }} />
            </span>
            <span className={own.barValue}>
              {n} · {Math.round(share * 100)} %
            </span>
          </div>
        );
      })}
    </div>
  );
}
