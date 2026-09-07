import { ContentHeader } from "@/components/brand/ContentHeader";
import { MetaLabel } from "@/components/brand/MetaLabel";
import { SiteFooter } from "@/components/brand/SiteFooter";
import { CONTACT_EMAIL, EMAIL_PLACEHOLDER, LEGAL_UI, splitOnEmail, type LegalBlock, type LegalDocument } from "@/content/legal";
import type { Locale } from "@/lib/i18n/locale";
import { tc } from "@/lib/i18n/translatable";
import frame from "@/app/[locale]/how-it-works/page.module.css";
import styles from "./LegalPage.module.css";

/**
 * The shell shared by `/privacy` and `/terms` — REVIEW-02.md R2-03, on the
 * model of Ramille's `LegalPage` (ScratchMe/TraceVerte). The content is
 * passed as DATA, not JSX: a legal page is re-read and amended paragraph by
 * paragraph, and nobody should have to wade through markup to do it.
 *
 * Same frame as `/how-it-works` and `/about` (their stylesheet, deliberately
 * shared): these are the prose pages of the site, one family. Server
 * Component, prerendered like the rest of the `[locale]` tree.
 *
 * `{email}` in the copy becomes a real `mailto:` link here, from the one
 * constant that holds the address — so the address lives in exactly one
 * place and every occurrence is a link someone can click.
 */
export function LegalPage({ document, path, locale }: { document: LegalDocument; path: string; locale: Locale }) {
  return (
    <>
      <ContentHeader locale={locale} path={path} />

      <main className={`${frame.main} ${styles.legal}`}>
        <div className={frame.intro}>
          <MetaLabel size="xs" uppercase={false}>
            {tc(LEGAL_UI.updatedAt, locale)} {formatDate(document.updatedAt, locale)}
          </MetaLabel>
          <h1 className={`${frame.title} ${styles.title}`}>{tc(document.title, locale)}</h1>
          <p className={frame.subtitle}>{tc(document.intro, locale)}</p>
        </div>

        {document.sections.map((section) => (
          <section key={tc(section.heading, "en")} className={frame.proseSection}>
            <h2 className={frame.sectionTitle}>{tc(section.heading, locale)}</h2>
            {section.blocks.map((block, index) => (
              <LegalBlockView key={index} block={block} locale={locale} />
            ))}
          </section>
        ))}
      </main>

      <SiteFooter locale={locale} width="reading" />
    </>
  );
}

function LegalBlockView({ block, locale }: { block: LegalBlock; locale: Locale }) {
  if (block.kind === "paragraph") {
    return <p className={frame.sectionBody}>{withEmail(tc(block.text, locale))}</p>;
  }

  if (block.kind === "bullets") {
    return (
      <ul className={styles.list}>
        {block.items.map((item, index) => (
          <li key={index} className={frame.sectionBody}>
            {withEmail(tc(item, locale))}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <dl className={styles.definitions}>
      {block.items.map((item, index) => (
        <div key={index} className={styles.definition}>
          <dt className={styles.term}>{tc(item.term, locale)}</dt>
          <dd className={frame.sectionBody}>{withEmail(tc(item.text, locale))}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Every `{email}` becomes a `mailto:` link. While the address is not set
 * (see `CONTACT_EMAIL`), a visibly bracketed placeholder is rendered
 * instead of a link to nowhere — and the unit test on `legal.ts` keeps the
 * pages from shipping in that state.
 */
function withEmail(text: string) {
  const parts = splitOnEmail(text);
  if (parts.length === 1) return text;
  return parts.map((part, index) =>
    part === EMAIL_PLACEHOLDER ? (
      CONTACT_EMAIL ? (
        <a key={index} href={`mailto:${CONTACT_EMAIL}`} className={styles.link}>
          {CONTACT_EMAIL}
        </a>
      ) : (
        <span key={index} className={styles.missing}>
          [e-mail]
        </span>
      )
    ) : (
      part
    ),
  );
}

/** "6 septembre 2026" / "September 6, 2026" — the date is stored as an ISO day, shown in the reader's language. */
function formatDate(isoDay: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", { dateStyle: "long", timeZone: "UTC" }).format(
    new Date(`${isoDay}T00:00:00Z`),
  );
}
