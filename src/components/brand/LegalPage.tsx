import { MetaLabel } from "@/components/brand/MetaLabel";
import { ProseList, ProsePage, ProseSection, ProseText } from "@/components/brand/ProsePage";
import { CONTACT_EMAIL, EMAIL_PLACEHOLDER, LEGAL_UI, splitOnEmail, type LegalBlock, type LegalDocument } from "@/content/legal";
import type { Locale } from "@/lib/i18n/locale";
import { tc } from "@/lib/i18n/translatable";
import styles from "./LegalPage.module.css";

/**
 * The shell shared by `/privacy` and `/terms` — REVIEW-02.md R2-03, on the
 * model of Ramille's `LegalPage` (ScratchMe/TraceVerte). The content is
 * passed as DATA, not JSX: a legal page is re-read and amended paragraph by
 * paragraph, and nobody should have to wade through markup to do it.
 *
 * Same `ProsePage` frame as `/how-it-works` and `/about`: these are the prose
 * pages of the site, one family. (It used to import how-it-works's page
 * stylesheet to get there — ds-critique M-9.) Server Component, prerendered
 * like the rest of the `[locale]` tree.
 *
 * `{email}` in the copy becomes a real `mailto:` link here, from the one
 * constant that holds the address — so the address lives in exactly one
 * place and every occurrence is a link someone can click.
 */
export function LegalPage({ document, path, locale }: { document: LegalDocument; path: string; locale: Locale }) {
  return (
    <ProsePage
      locale={locale}
      path={path}
      title={tc(document.title, locale)}
      lead={tc(document.intro, locale)}
      kicker={
        <MetaLabel size="xs" uppercase={false}>
          {tc(LEGAL_UI.updatedAt, locale)} {formatDate(document.updatedAt, locale)}
        </MetaLabel>
      }
    >
      {document.sections.map((section) => (
        <ProseSection key={tc(section.heading, "en")} heading={tc(section.heading, locale)}>
          {section.blocks.map((block, index) => (
            <LegalBlockView key={index} block={block} locale={locale} />
          ))}
        </ProseSection>
      ))}
    </ProsePage>
  );
}

function LegalBlockView({ block, locale }: { block: LegalBlock; locale: Locale }) {
  if (block.kind === "paragraph") {
    return <ProseText>{withEmail(tc(block.text, locale))}</ProseText>;
  }

  if (block.kind === "bullets") {
    return (
      <ProseList>
        {block.items.map((item, index) => (
          <li key={index}>{withEmail(tc(item, locale))}</li>
        ))}
      </ProseList>
    );
  }

  return (
    <dl className={styles.definitions}>
      {block.items.map((item, index) => (
        <div key={index} className={styles.definition}>
          <dt className={styles.term}>{tc(item.term, locale)}</dt>
          <dd>
            <ProseText>{withEmail(tc(item.text, locale))}</ProseText>
          </dd>
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
