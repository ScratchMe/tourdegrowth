"use client";

import { ErrorScreen, type ErrorScreenProps } from "@/components/brand/ErrorScreen";
import { useLocale } from "@/lib/i18n/locale-context";

/**
 * Error boundary for this tree — REVIEW-02.md R2-23. Rendered INSIDE the root
 * layout, so the shell (fonts, tokens, locale context) is already there; only
 * the segment that threw is replaced. `global-error.tsx` covers the rarer
 * case of the root layout itself failing.
 */
export default function SegmentError(props: Pick<ErrorScreenProps, "error" | "reset">) {
  const { locale } = useLocale();
  return <ErrorScreen locale={locale} {...props} />;
}
