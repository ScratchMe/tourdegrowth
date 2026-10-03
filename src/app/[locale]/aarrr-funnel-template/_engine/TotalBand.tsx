import { TotalBand as Band } from "@/components/engine/TotalBand";
import { linkSentence, totalBlocks } from "@/lib/engine/deck-motions";
import { formatSum } from "@/lib/engine/total";
import type { SlideTitle } from "@/lib/engine/types";
import { titleText } from "./Verdict";
import type { EngineView } from "./view";

/**
 * « Deux moteurs, un total » — the hybrid board's band, once, at its top
 * (engine spec §18.7 E2, §18.6.2-§18.6.3; design system extension 07,
 * `TotalBand`, A18 T5). Its title is the `total` slide's
 * (`deck-motions.ts#totalTitle`); then each engine's MRR, self-serve then
 * sales-assisted, and the total set off by a rule — a sum, never a
 * comparison, its order never following the values. Its last line is the
 * link, said as a share of the pipeline, never as an attribution.
 *
 * Its title is the hybrid board's heading and focus target (`engine-verdict`),
 * without the red accent: at 19px semi-bold the red would not read at AA.
 *
 * The new MRR of the month and the two sums, which a reader can redo on a
 * calculator, are on the `total` slide (`SlideTotal`); the MRR in twelve
 * months with the what-ifs is in the full « Et si » panel.
 */
export function TotalBand({ view, verdict }: { view: EngineView; verdict: SlideTitle }) {
  const { strings, state, ctx, derived } = view;
  const total = derived.total;
  if (!total) return null;
  const t = strings.total;
  const blocks = totalBlocks(total, state, strings, ctx);
  const sum = formatSum(total.mrr, state.setup.currency, ctx, strings.units);
  const link = linkSentence(total, state, strings, ctx);
  return (
    <Band
      eyebrow={t.title}
      title={titleText(verdict, strings)}
      headingId="engine-verdict"
      engines={blocks.map((b) => ({
        id: b.motion,
        label: b.motion === "plg" ? t.ssMrr : t.saMrr,
        value: <span data-testid={`engine-total-mrr-${b.motion}`}>{b.mrr || strings.slide.noNumber}</span>,
        "data-testid": `engine-total-${b.motion}`,
      }))}
      total={{ label: t.sumMrr, value: sum ? sum.total : strings.slide.noNumber, "data-testid": "engine-total-sum" }}
      link={
        link ? (
          <div data-testid="engine-total-link">
            <p>{link}</p>
            <p>{t.linkNote}</p>
          </div>
        ) : null
      }
      data-testid="engine-total-band"
    />
  );
}
