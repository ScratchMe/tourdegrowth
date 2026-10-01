import { ENGINE_HEADLINE, ENGINE_SHARE } from "@/content/engine-share";
import type { Locale } from "@/lib/i18n/locale";
import { SPACE_STRINGS } from "@/lib/i18n/space-strings";
import { tc } from "@/lib/i18n/translatable";
import { SITE_DOMAIN_LABEL } from "@/lib/site";

/**
 * Every string the engine's share image draws, resolved in one language, and
 * its alt text — the single list both the image (`engine-frame.tsx`) and the
 * font-coverage test (`fonts.test.ts`) read, so the test checks what is drawn
 * rather than a copy of it (design brief 06, `design/ds-extension-06-return/`).
 *
 * Uppercase is applied HERE, not with `textTransform` in the frame — the
 * return's source used it — so the coverage test sees the capitals Satori
 * will actually draw, as `game-hub-share-text.ts` does.
 */

/** One run of a title line; `accent` paints it in the engine's ultramarine. */
export interface EngineTitleSegment {
  text: string;
  accent: boolean;
}

export interface EngineShareText {
  /** « 2/3 · CONTRE-LA-MONTRE »: the band's words, in the pill beside the wordmark. */
  space: string;
  domain: string;
  eyebrow: string;
  /** The page's H1 on two set lines. */
  title: EngineTitleSegment[][];
  line: string;
  promise: string;
  alt: string;
}

/** A line cut around its accent word, kept whole when the word is not in it. */
function segments(line: string, accent: string): EngineTitleSegment[] {
  const words = line.split(" ");
  const at = words.indexOf(accent);
  if (at < 0) return [{ text: line, accent: false }];
  return [
    ...(at > 0 ? [{ text: words.slice(0, at).join(" "), accent: false }] : []),
    { text: accent, accent: true },
    ...(at < words.length - 1 ? [{ text: words.slice(at + 1).join(" "), accent: false }] : []),
  ];
}

/**
 * The H1 on two set lines, `first` and the rest, each cut around the accent
 * word. A renamed H1 that no longer starts with the image's first line, or
 * no longer holds its accent word, throws: the image must fail the build, not
 * draw half a title or a title with no blue in it.
 */
export function titleLines(title: string, first: string, accent: string): EngineTitleSegment[][] {
  if (!title.startsWith(`${first} `)) {
    throw new Error(`engine share image: the H1 « ${title} » does not start with « ${first} »`);
  }
  const lines = [first, title.slice(first.length + 1)].map((line) => segments(line, accent));
  if (!lines.flat().some((segment) => segment.accent)) {
    throw new Error(`engine share image: the H1 « ${title} » has no word « ${accent} »`);
  }
  return lines;
}

export function engineShareText(locale: Locale): EngineShareText {
  const upper = (s: string) => s.toLocaleUpperCase(locale);
  const title = tc(ENGINE_HEADLINE.title, locale);
  const space = `2/3 · ${tc(SPACE_STRINGS.kind.engine, locale)}`;
  const line = tc(ENGINE_SHARE.line, locale);
  const promise = tc(ENGINE_SHARE.promise, locale);
  const alt = tc(ENGINE_SHARE.alt, locale)
    .replace("{space}", space.toLocaleLowerCase(locale))
    .replace("{title}", title)
    .replace("{line}", line)
    .replace("{promise}", promise)
    .replace("{domain}", SITE_DOMAIN_LABEL);
  return {
    space: upper(space),
    domain: SITE_DOMAIN_LABEL,
    eyebrow: upper(tc(ENGINE_HEADLINE.eyebrow, locale)),
    title: titleLines(title, tc(ENGINE_SHARE.titleFirstLine, locale), tc(ENGINE_SHARE.titleAccent, locale)),
    line,
    promise: upper(promise),
    alt,
  };
}
