import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";
import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { resolveRequestLocale } from "@/lib/i18n/resolve-request-locale";
import { getSampleNextMove, getSampleVerdicts, SAMPLE_RESULT } from "@/lib/submissions/sample";
import { getBenchmarkFor } from "@/lib/submissions/benchmark";
import { getCachedSubmissionById } from "@/lib/submissions/cached-repository";
import { isValidSubmissionId } from "@/lib/submissions/referral";
import { stallSentence } from "@/lib/submissions/stall-sentence";
import { buildQuickVerdicts, toDeepDiveView, toPillarViews } from "@/lib/submissions/view-model";
import { primaryBottleneck, resolveBottleneck } from "@/lib/scoring/bottleneck";
import { resolveNextMove } from "@/lib/scoring/next-move";
import { sampleShareImageModel, SHARE_IMAGE_ALT, shareImageModel, shareImageSrc } from "@/lib/og/share-image";
import { QUESTIONS } from "@/content/copy-library";
import type { BreakdownData } from "./ScoreBreakdown";
import type { Locale } from "@/lib/i18n/locale";
import type { Pillar } from "@/lib/scoring/pillars";
import { GAME_PREVIEW_COOKIE, resolveGameAccess, type GameAccess } from "@/lib/game/access";
import { hasOwnerPreview } from "@/lib/owner-preview";
import { resultGameEntry } from "./game-entry";
import { ResultView } from "./ResultView";

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * `generateMetadata` and the page component both need the submission and run
 * in the SAME request, so `cache()` dedupes them into one call; that call in
 * turn goes through the cross-request cache (REVIEW.md R-14), so a shared
 * result that many people open costs one Firestore read per hour rather than
 * one per view. Route handlers keep importing `getSubmissionById` directly.
 */
const loadSubmission = cache(getCachedSubmissionById);

/**
 * REVIEW-02.md R2-19. Every distinct id is a cache miss and therefore one
 * billed Firestore read, whether or not the document exists — so a route
 * parameter that cannot possibly be one of ours (ids are UUID v4, see
 * `referral.ts`) must 404 before anything is looked up. Same reasoning the
 * `?ref=` path has applied since R-03: a bad id costs zero reads. It also
 * keeps exotic path segments away from the Firestore client, whose own
 * validation only rejects empty strings and `//`.
 */
function rejectImplausibleId(id: string): void {
  if (id !== "sample" && !isValidSubmissionId(id)) notFound();
}

/**
 * The shared link's preview text — REVIEW.md R-10. Every result used to
 * carry the same generic title and description, so a link posted to
 * LinkedIn or X said nothing about the score: only the OG image did the
 * work, and the text beside it was wasted.
 *
 * Resolved in the SUBMISSION's locale, not the reader's — deliberately the
 * same rule as the share image (see `lib/og/share-image.ts`): a social
 * crawler sends no cookies, so there is no reader locale to honour here. The
 * `title` is kept language-neutral ("74/100 — Tour de Growth") so it reads
 * correctly as a browser tab title in either language.
 *
 * `imageUrl` is the share image's versioned address. Declared here, config
 * style, rather than by the `opengraph-image.tsx` file convention: the
 * convention always wins over these fields and serves an uncacheable URL —
 * the whole point of the token (2026-09-14).
 */
function resultMetadata(total: number, stalling: Pillar | null, locale: Locale, isSample: boolean, imageUrl: string): Metadata {
  // `stalling` is null when no stage is behind — the same call the share
  // image makes (`lib/og/share-image.ts`, lot 3). The two sit side by side in
  // a link preview, so a description naming a stall next to an image saying
  // nothing is stalling would contradict itself in the one place the product
  // gets a first impression.
  const stall = stallSentence(locale, stalling);
  const description = isSample
    ? `${stall} ${tc(UI_STRINGS.og.whereDoesYours, locale)} — ${tc(UI_STRINGS.result.sampleBadge, locale)}`
    : `${stall} ${tc(UI_STRINGS.og.whereDoesYours, locale)}`;
  const title = `${total}/100 — Tour de Growth`;

  return {
    title,
    description,
    openGraph: { title, description, locale, images: [{ url: imageUrl, width: 1200, height: 630, alt: SHARE_IMAGE_ALT }] },
    twitter: { card: "summary_large_image", title, description, images: [imageUrl] },
    // SPEC-ADDENDUM-02.md §3.3, non-negotiable: individual result pages
    // (this whole route, sample included — see CLAUDE.md) never get
    // indexed. A `noindex` meta tag, not a robots.txt disallow: shared
    // results get real inbound links from the growth loop itself, and
    // blocking the crawl would stop Google from ever seeing this tag,
    // which can leave a linked-but-unindexable page showing up with no
    // snippet anyway — `noindex` alone is the correct way to keep a page
    // truly out of the index while it's still linked to.
    robots: { index: false, follow: true },
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  rejectImplausibleId(id);

  if (id === "sample") {
    // The sample's share image is fixed to English (`sampleShareImageModel`),
    // so its preview text matches rather than contradicting the picture.
    return resultMetadata(
      SAMPLE_RESULT.total,
      primaryBottleneck(resolveBottleneck(SAMPLE_RESULT.pillars)),
      "en",
      true,
      shareImageSrc("sample", sampleShareImageModel()),
    );
  }

  // A read that FAILS (as opposed to one that finds nothing) must not throw
  // from here: an error thrown while resolving metadata bypasses the
  // segment's `error.tsx` and lands on Next's bare error document — the
  // very thing REVIEW-02.md R2-23 removes. Return the minimal metadata and
  // let the page component, whose `cache()`d call sees the same rejection,
  // throw inside the boundary that renders our fault screen.
  let submission;
  try {
    submission = await loadSubmission(id);
  } catch {
    return { title: "Tour de Growth", robots: { index: false, follow: true } };
  }
  if (!submission) return { title: "Tour de Growth", robots: { index: false, follow: true } };

  return resultMetadata(
    submission.total,
    primaryBottleneck(resolveBottleneck(toPillarViews(submission.pillars))),
    submission.locale,
    false,
    shareImageSrc(submission.id, shareImageModel(submission)),
  );
}

/**
 * The data behind "how this score is calculated" (REVIEW.md R-12), resolved
 * to display text HERE rather than shipped as the copy library.
 *
 * `content/copy-library.ts` is 483 lines across two languages; importing it
 * into the result page's client bundle to render 15 questions would be the
 * same mistake R-09 avoided. These are ~60 short strings instead, already in
 * the reader's language — and they're public content anyway (anyone can read
 * all 15 questions by opening /quiz). The ANSWERS, which are not public,
 * never come from here: they are read from the owner's own device.
 */
function buildBreakdownData(locale: Locale): BreakdownData {
  return {
    questions: QUESTIONS.map((q) => ({
      id: q.id,
      pillar: q.pillar,
      question: tc(q.question, locale),
      options: q.options.map((o) => ({ label: tc(o.label, locale), points: o.points })),
    })),
  };
}

/**
 * Whether this reader may see the game — GAME-BRIEF.md 13.1-13.2. Read on
 * every request, exactly as the proxy reads it for the game's own routes
 * (`GAME_ENABLED`, or the owner's signed preview cookie, verified here the
 * same way — `lib/owner-preview.ts`): this page is dynamic anyway, so the
 * preview works here per request. `GAME_ENABLED` itself only changes with a
 * redeploy on Vercel (`lib/game/build-flag.ts`).
 *
 * A closed game must leave NO trace in the payload: a card that links to a
 * 404 is a bug, and the card's text in the RSC stream of a closed page would
 * announce a feature that does not exist yet. Closed access makes
 * `resultGameEntry` return null, and null is all that crosses.
 */
async function readGameAccess(): Promise<GameAccess> {
  return resolveGameAccess({
    env: process.env.GAME_ENABLED,
    ownerPreview: await hasOwnerPreview("game", (await cookies()).get(GAME_PREVIEW_COOKIE)?.value),
  });
}

// `/r/sample` is the fixed, hard-coded "See a sample result" screen
// (SPEC.md §12) — never a real Firestore lookup, never recalculated.
export default async function ResultPage({ params }: PageProps) {
  const { id } = await params;
  rejectImplausibleId(id);

  if (id === "sample") {
    // Same locale-resolution priority as the root layout (cookie/header —
    // the proxy has already folded ?lang= into the cookie by this point) so
    // the fixed sample verdict's language matches everything else on first
    // paint, without needing a client fetch just for demo copy.
    const locale = await resolveRequestLocale();
    const sampleBottleneck = resolveBottleneck(SAMPLE_RESULT.pillars);

    return (
      <ResultView
        total={SAMPLE_RESULT.total}
        pillars={SAMPLE_RESULT.pillars}
        weakestPillar={SAMPLE_RESULT.weakestPillar}
        verdicts={getSampleVerdicts(locale)}
        bottleneck={sampleBottleneck}
        nextMove={getSampleNextMove(locale)}
        // The picture IN the page follows the reader (copy review v1, DS
        // critique L-5); the one declared to crawlers above stays English.
        shareImageSrc={shareImageSrc("sample", sampleShareImageModel(locale))}
        initialTone="neutral"
        isSample
        // The sample's own board has a clear retention bottleneck (8 against
        // 12 and up), so it is where the card is seen before any real result
        // exists — and the only result page an e2e can render.
        gameEntry={resultGameEntry({
          bottleneck: sampleBottleneck,
          access: await readGameAccess(),
          locale,
          hasDeepDive: false,
        })}
      />
    );
  }

  const submission = await loadSubmission(id);
  if (!submission) notFound();

  // REVIEW.md R-09: the verdict follows whoever is READING, not whoever
  // created the result — the rest of this page already did. Same resolution
  // as the sample branch above, and the same helper, so the two can't drift.
  const locale = await resolveRequestLocale();

  // REVIEW.md R-20. Cached for an hour and null-safe by construction (see
  // `benchmark.ts`), so this adds no per-view Firestore read and can never
  // be the reason a result page fails to render. Not offered on `/r/sample`
  // above: its numbers aren't real, and a real average beside them would
  // blur exactly the line the "not your data" badge draws.
  const benchmark = await getBenchmarkFor(submission.segment ?? null);

  // The ONE narrowing, and everything below reads from it — including the
  // helpers that only return strings, which do not need it but must not be
  // the reason `submission.pillars` stays quotable in this file.
  //
  // `PillarScore` carries `rawPoints` on top of `{pillar, score}`, and RSC
  // serialises the runtime object regardless of how a prop is declared.
  // Narrowing at the single point of use was not enough: `resolveBottleneck`
  // is generic and hands back the very objects it was given, so nine lines
  // below the `toPillarViews` fix a second prop put `rawPoints` straight
  // back into every shared result's payload. The invariant is therefore
  // stated where it can be checked — every read of `submission.pillars` in
  // this file goes through `toPillarViews` — and pinned by the guard in
  // `src/__tests__/client-bundles.test.ts`.
  const pillars = toPillarViews(submission.pillars);
  const bottleneck = resolveBottleneck(pillars);
  // REVIEW.md R-02: only the generated verdicts cross to the client.
  // `deepDive` also holds the founder's free-text context and their 10
  // Deep dive answers, which would otherwise ride along in this public
  // page's RSC payload without ever being rendered.
  const deepDive = toDeepDiveView(submission.deepDive, locale);

  return (
    <ResultView
      id={submission.id}
      total={submission.total}
      pillars={pillars}
      weakestPillar={submission.weakestPillar}
      verdicts={buildQuickVerdicts(locale, pillars, submission.weakestPillar)}
      // Both resolved on the server, for the two reasons R-09 gave: the
      // answers behind the action never leave the server (R-02, R2-19), and
      // resolving here keeps the payload one short string instead of shipping
      // the action library to the browser. A VISITOR therefore sees the
      // action too — they are the numerator of the whole sharing loop, and
      // they have nothing on their device to derive it from.
      bottleneck={bottleneck}
      nextMove={resolveNextMove(locale, pillars, submission.weakestPillar, submission.answers)}
      // Minted here, on the server, so the CDN can cache the picture as
      // immutable (`lib/og/share-image.ts`); the view only displays it. In
      // the READER's language, like the rest of this page (copy review v1,
      // DS critique L-5) — `og:image`, above, stays in the author's.
      shareImageSrc={shareImageSrc(submission.id, shareImageModel(submission, locale))}
      initialTone={submission.tone}
      breakdown={buildBreakdownData(locale)}
      deepDive={deepDive}
      benchmark={benchmark}
      segment={submission.segment ?? null}
      // GAME-BRIEF.md 13.3 A. Same rule for the owner and for a visitor who
      // arrived through a shared link — a reader is a reader. The Deep dive
      // variant is keyed on what the page SHOWS (the view above), so the card
      // never says "your recommendations are above" when none are.
      gameEntry={resultGameEntry({
        bottleneck,
        access: await readGameAccess(),
        locale,
        hasDeepDive: deepDive !== null,
      })}
    />
  );
}
