import type { Metadata } from "next";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { ProsePage, ProseSection, ProseText } from "@/components/brand/ProsePage";
import { Callout } from "@/components/core/Callout";
import { ENGINE_COPY } from "@/content/engine-copy";
import { isEngineOpenAtBuild } from "@/lib/engine/access";
import { isLocale, type Locale } from "@/lib/i18n/locale";
import { contentMetadata } from "@/lib/i18n/meta";
import { tc } from "@/lib/i18n/translatable";
import { EngineWorkbench } from "./EngineWorkbench";
import { resolveEngineProps } from "./engine-props";

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

/**
 * `/{locale}/aarrr-funnel-template` — the growth engine (engine spec §7 E0).
 *
 * P0 SKELETON: the prerendered shell (one `<h1>`, the privacy promise that
 * is never collapsible, D16) and the client island mounted with its full
 * props contract. The static SEO body — the fifteen numbers, the FAQ, the
 * CTA — is P5's; the island's screens are P4's and P6's.
 *
 * Server Component, prerendered (●) like every content page (R-24): the
 * island's props are resolved here, at build time, and nothing reads a
 * header or a cookie. Behind `ENGINE_ENABLED` — the proxy rewrites a closed
 * page to a 404, so the page itself never has to become dynamic.
 */
export default async function EnginePage({ params }: PageProps) {
  const locale = (await params).locale as Locale;
  const props = resolveEngineProps(locale);
  const t = props.strings.page;

  // On the prose frame for now (ds-critique M-9: no page borrows another
  // page's stylesheet any more); P5 owns the tool's own wider layout.
  return (
    <ProsePage
      locale={locale}
      path={PATH}
      title={t.title}
      kicker={<MetaLabel size="xs">{t.eyebrow}</MetaLabel>}
      lead={t.positioning}
    >
      <ProseText>{t.promise}</ProseText>

      <Callout tone="caveat" data-testid="engine-privacy">
        <ProseSection heading={t.privacyTitle}>
          <ProseText>{t.privacyBody}</ProseText>
        </ProseSection>
      </Callout>

      <noscript>
        <ProseText>{t.noscript}</ProseText>
      </noscript>

      <EngineWorkbench {...props} />
    </ProsePage>
  );
}
