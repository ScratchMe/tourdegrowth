"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { saveRefId } from "@/lib/quiz/storage";

/**
 * The only interactive thing the landing page does — REVIEW.md R-13.
 *
 * SPEC.md §7: a visitor arriving through a shared result's `?ref=<id>` is
 * captured here (or on `/quiz`, whichever they reach first) and carried
 * through the whole questionnaire in localStorage.
 *
 * Isolated into its own client island so the landing itself can be a Server
 * Component: it used to be `"use client"` in its entirety just for this
 * effect, which sent the whole page's markup logic to the browser for no
 * reason.
 */
export function RefCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) saveRefId(ref);
  }, [searchParams]);

  return null;
}
