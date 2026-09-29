import type { Space } from "@/components/brand/SpaceBand";
import type { Translatable } from "@/lib/i18n/translatable";

/**
 * space-strip.ts — the words of the landing's strip, « Le Tour en trois
 * parties » (`brand/SpaceStrip`), design I + B retained by Antoine on
 * 2026-09-28.
 *
 * **TODO: à relire** (convention 6): every string here is new copy written
 * by the code session. The spaces' names, kinds and « bientôt » are the
 * band's (`lib/i18n/space-strings.ts`), not repeated here.
 *
 * Its own module rather than `space-strings.ts`: the band renders in the quiz
 * and the result, which ship what it imports to the browser; the strip
 * renders on the landing alone, a Server Component, and these sentences stay
 * on the server.
 *
 * The three spaces are never « étapes » (Antoine, 2026-09-28): « étape » is
 * the AARRR stage, which is exactly what the check-up's pitch talks about.
 */
const t = (fr: string, en: string): Translatable => ({ fr, en });

export const SPACE_STRIP = {
  // TODO: à relire (convention 6).
  /** When each space comes in the race; a space not open yet says « bientôt » instead. */
  when: {
    tour: t("Maintenant", "Now"),
    engine: t("Ensuite", "Next"),
    game: t("Pour finir", "Last"),
  },
  // TODO: à relire (convention 6).
  /** What each space gives, in a sentence or two. */
  pitch: {
    tour: t(
      "15 questions, 3 minutes. Ton score, l'étape qui freine, une action.",
      "15 questions, 3 minutes. Your score, the stage that stalls, one action.",
    ),
    engine: t(
      "Tes 17 vrais chiffres, là où ton funnel perd du monde, et des slides pour ton CODIR.",
      "Your 17 real numbers, where your funnel loses people, and slides for your leadership team.",
    ),
    game: t(
      "Cinq zones, cinq entreprises, un DG qui veut le chiffre. Apprends à reconnaître les astuces avant d'en livrer une.",
      "Five zones, five companies, one CEO who wants the number. Learn to spot the tricks before you ship one.",
    ),
  },
} as const satisfies Record<string, Record<Space, Translatable>>;
