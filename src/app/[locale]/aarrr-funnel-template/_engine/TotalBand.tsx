import { TotalBand as Band } from "@/components/engine/TotalBand";
import { linkSentence, totalBlocks, totalIn12 } from "@/lib/engine/deck-motions";
import { formatApproxMoneyInterval } from "@/lib/engine/format";
import { addBoth, formatSum, timesTwelve } from "@/lib/engine/total";
import type { SlideTitle } from "@/lib/engine/types";
import { scenarioFor, slgScenarioFor } from "./scenario-view";
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
 * Then, since design system extension 09 (A20.d T3.b), one line of what
 * else adds up, today: the ARR (the total MRR × 12), the MRR in twelve
 * months at today's pace, the cash tied up. A part missing drops its term: a
 * partial total is no total (S9). The MRR in twelve months with the
 * what-ifs is on the card (`BoardLever`'s total line).
 *
 * The new MRR of the month and the two sums, which a reader can redo on a
 * calculator, are on the `total` slide (`SlideTotal`).
 */
export function TotalBand({ view, verdict }: { view: EngineView; verdict: SlideTitle }) {
  const { strings, state, ctx, derived } = view;
  const total = derived.total;
  if (!total) return null;
  const t = strings.total;
  const blocks = totalBlocks(total, state, strings, ctx);
  const sum = formatSum(total.mrr, state.setup.currency, ctx, strings.units);
  const link = linkSentence(total, state, strings, ctx);
  const arr = formatSum(timesTwelve(total.mrr), state.setup.currency, ctx, strings.units);
  const in12 = totalIn12(state, strings, ctx);
  const cash = addBoth(scenarioFor(state, {}, ctx).today.kpis.cash?.tiedUp, slgScenarioFor(state, {}, ctx).today.cash?.tiedUp);
  const totals = [
    arr ? { key: "arr", label: t.sumArr, value: arr.total } : null,
    in12 ? { key: "mrr12", label: t.sumMrr12, value: in12.today } : null,
    cash ? { key: "cash", label: t.sumCash, value: formatApproxMoneyInterval(cash, state.setup.currency, ctx, strings.units) } : null,
  ].filter((x): x is { key: string; label: string; value: string } => x !== null);
  return (
    <Band
      eyebrow={t.title}
      title={titleText(verdict, strings)}
      headingId="engine-verdict"
      engines={blocks.map((b) => ({
        id: b.motion,
        label: b.motion === "plg" ? t.ssMrr : t.saMrr,
        value: <span data-testid={`engine-total-mrr-${b.motion}`}>{b.mrr || strings.slide.noNumber}</span>,
        missing: !b.mrr,
        "data-testid": `engine-total-${b.motion}`,
      }))}
      total={{ label: t.sumMrr, value: sum ? sum.total : strings.slide.noNumber, missing: !sum, "data-testid": "engine-total-sum" }}
      totals={totals}
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
