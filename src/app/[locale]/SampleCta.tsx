"use client";

import { Button } from "@/components/core/Button";
import { sampleHref, useSampleTone } from "./sample-tone";

/**
 * The hero's secondary button, « Voir un résultat d'exemple »: it follows
 * the preview's tone (C24) — in roast it opens the roast sample, which is
 * what the preview just showed. A document load, like every way into the
 * result pages from here (`hard`).
 */
export function SampleCta({ label }: { label: string }) {
  const tone = useSampleTone();
  return (
    <Button size="lg" href={sampleHref(tone)} hard variant="secondary" data-testid="hero-sample-cta" data-tone={tone}>
      {label}
    </Button>
  );
}
