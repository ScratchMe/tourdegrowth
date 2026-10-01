"use client";

import { useEffect, useState } from "react";
import styles from "./LastResult.module.css";

export interface EngineResumeProps {
  /** « Ton moteur : {month}, {n} sur {N} chiffres », already translated. */
  line: string;
  cta: string;
  href: string;
  locale: "en" | "fr";
  /** Alone on the landing (no Tour on the device): it takes the space the result's link would have taken. */
  alone?: boolean;
}

/**
 * The landing's way back into the engine (engine spec §19.10, C32 Q16, A14
 * T6): the engine on this device, its month and its found numbers — read on
 * the device after mount, never sent, never written.
 *
 * Its own file, apart from `LastResult`, on purpose (the security review of
 * A14 T6): this is the one component outside the engine's route that reads
 * the engine's storage, and `engine-boundary.test.ts` (rule 8) holds it to
 * the engine's rules — no network primitive, no analytics call. A count
 * shown here can then never become an event's detail.
 *
 * The engine's code is loaded by a dynamic `import()` behind the build's
 * flag, read as the literal `process.env` access Next inlines: a landing
 * built with the engine closed folds the condition to `false` and carries no
 * chunk of it at all.
 */
export function EngineResume({ line, cta, href, locale, alone }: EngineResumeProps) {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    if (process.env.TDG_ENGINE_OPEN_AT_BUILD !== "1") return;
    let live = true;
    import("@/lib/engine/resume")
      .then(({ engineResume }) => {
        const resume = engineResume(locale);
        if (live && resume) setText(line.replace("{month}", resume.month).replace("{n}", String(resume.found)).replace("{N}", String(resume.total)));
      })
      // A chunk gone after a deployment, a device that refuses its storage: no line, never an error on the landing.
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [line, locale]);

  if (!text) return null;
  const row = (
    <span className={styles.engine} data-testid="landing-engine-resume">
      {text}
      {" — "}
      {/* A bare anchor: the engine is another root layout's page (R-24). */}
      <a href={href} className={styles.nudgeLink} data-testid="landing-engine-resume-link">
        {cta}
      </a>
    </span>
  );
  return alone ? <span className={`${styles.wrap} ${styles.engineAlone}`}>{row}</span> : row;
}
