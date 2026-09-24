import type { HTMLAttributes, ReactNode } from "react";
import type { Locale } from "@/lib/i18n/locale";
import { ContentHeader } from "./ContentHeader";
import { SiteFooter } from "./SiteFooter";
import styles from "./ProsePage.module.css";

export interface ProsePageProps {
  locale: Locale;
  /** This page's path without the locale prefix — what the language switch links to. */
  path: string;
  /** The page's one `<h1>`, already resolved in the reader's language. */
  title: string;
  /**
   * `page` — stencil hero, dropping to the mobile hero under 760px (a long
   * French title at 62px runs six lines on a phone). `term` — the mobile
   * hero at every width: a glossary term is a word, not a headline.
   */
  titleSize?: "page" | "term";
  /** Muted standfirst under the title. The one place prose stays grey. */
  lead?: ReactNode;
  /** Above the title: a back link, a "last updated" line. */
  kicker?: ReactNode;
  /** Under the lead: a freshness note, a caption. */
  note?: ReactNode;
  /** Extra class on `<main>` — for a page that adds something the frame doesn't have. */
  className?: string;
  children: ReactNode;
}

/**
 * The prose page — ds-critique M-3 / M-9, 2026-09-24.
 *
 * Nine pages (How it works, About, the glossary index and its terms, the four
 * comparisons, the two open-door pages, the legal pages) were one family
 * built by importing `how-it-works/page.module.css` from each other — a page
 * stylesheet used as a component, invisible to design-sync and patched per
 * page with `h1.title` overrides. This is that family as a component.
 *
 * The frame is the reading column (`--width-reading`) with its header and
 * footer; inside it, `ProseSection`, `ProseText` and `ProseList` set running
 * text in the reading type (`--body-read`, 400 weight, `--text-body`,
 * capped at `--measure-read`). Grey is kept for the lead and for captions:
 * body copy in grey at 500 was the thing that made 60 pages tiring to read.
 *
 * Server Component: nothing here is interactive.
 */
export function ProsePage({
  locale,
  path,
  title,
  titleSize = "page",
  lead,
  kicker,
  note,
  className,
  children,
}: ProsePageProps) {
  return (
    <>
      <ContentHeader locale={locale} path={path} />

      <main id="main" className={[styles.main, className ?? ""].filter(Boolean).join(" ")}>
        <div className={styles.intro}>
          {kicker}
          <h1 className={`${styles.title} ${styles[titleSize]}`}>{title}</h1>
          {lead && <p className={styles.lead}>{lead}</p>}
          {note}
        </div>

        {children}
      </main>

      <SiteFooter locale={locale} width="reading" />
    </>
  );
}

export interface ProseSectionProps extends HTMLAttributes<HTMLElement> {
  /** The section's `<h2>`, resolved. Omit for a heading-less run of prose (a pair of cross-links). */
  heading?: ReactNode;
  /**
   * `title` — Inter 19px, a section of an article. `label` — tracked mono
   * capitals, the glossary term page's "In practice" / "The formula" rail,
   * where the headings name the KIND of section rather than its subject.
   */
  headingStyle?: "title" | "label";
}

/** One section of a prose page: an optional `<h2>` and whatever follows it. */
export function ProseSection({ heading, headingStyle = "title", className, children, ...rest }: ProseSectionProps) {
  return (
    <section className={[styles.section, className ?? ""].filter(Boolean).join(" ")} {...rest}>
      {heading && <h2 className={styles[headingStyle === "label" ? "headingLabel" : "heading"]}>{heading}</h2>}
      {children}
    </section>
  );
}

/** A paragraph of running text, in the reading type and measure. */
export function ProseText({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={[styles.text, className ?? ""].filter(Boolean).join(" ")} {...rest} />;
}

export interface ProseListProps extends HTMLAttributes<HTMLOListElement | HTMLUListElement> {
  /** `<ol>` when the order means something (a scoring rule, the steps of an example). */
  ordered?: boolean;
}

/** A bulleted or numbered list of running text; each `<li>` child takes the reading type. */
export function ProseList({ ordered = false, className, ...rest }: ProseListProps) {
  const classes = [styles.list, className ?? ""].filter(Boolean).join(" ");
  return ordered ? <ol className={classes} {...rest} /> : <ul className={classes} {...rest} />;
}

/**
 * The page's closing actions — one primary `Button`, sometimes a secondary.
 * Side by side on a wide screen, stacked and full width on a phone.
 */
export function ProseActions({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={[styles.actions, className ?? ""].filter(Boolean).join(" ")} {...rest} />;
}
