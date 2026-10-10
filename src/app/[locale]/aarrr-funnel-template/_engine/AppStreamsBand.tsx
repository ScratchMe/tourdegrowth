import { TotalBand } from "@/components/engine/TotalBand";
import { hasUsageStream } from "@/lib/engine/app-model";
import { formatApproxMoneyInterval } from "@/lib/engine/format";
import { monetizationOf } from "@/lib/engine/setup-type";
import type { DerivedValue } from "@/lib/engine/types";
import { factMoney } from "./money-view";
import type { EngineView } from "./view";

/**
 * « Deux flux » — a consumer app's two streams of revenue, once, right before
 * the money block (engine spec §21.6.4, D16): the subscriptions, the purchases
 * and/or the ads, and their sum, this month; under them, what adds up — the
 * new revenue a month and the revenue in twelve months at today's pace. It is
 * the hybrid's band (`components/engine/TotalBand`) with an app's words, drawn
 * only when the app has both kinds of stream; nothing else of the board knows.
 *
 * Not `formatSum`, which prints nothing while a part is missing and rounds the
 * parts to one common unit: each part is printed as the money block prints the
 * month's revenue (`factMoney`), and a part that cannot be computed says so
 * (« pas de chiffre ») — the total too, never a part shown as the total (S9).
 * The two sums under are the total alone, at two significant digits; a total
 * that cannot be computed leaves its line out.
 */
export function AppStreamsBand({ view }: { view: EngineView }) {
  const { strings, state, ctx, derived } = view;
  const streams = derived.app?.streams;
  const m = monetizationOf(state.setup);
  if (!streams || !m || !m.subscriptions || !hasUsageStream(m)) return null;
  const w = strings.appStreams;
  const currency = state.setup.currency;
  const title = m.purchases && m.ads ? w.titleBoth : m.purchases ? w.titlePurchases : w.titleAds;
  const usageLabel = m.purchases && m.ads ? w.usageBoth : m.purchases ? w.usagePurchases : w.usageAds;

  const figure = (part: DerivedValue | null) => (part?.kind === "known" ? factMoney(part.value, currency, ctx, strings) : null);
  const part = (id: string, label: string, value: DerivedValue | null) => {
    const text = figure(value);
    return { id, label, value: text ?? strings.slide.noNumber, missing: text === null, "data-testid": `engine-app-streams-${id}` };
  };
  const total = figure(streams.now.total);
  const sum = (key: string, label: string, value: DerivedValue) =>
    value.kind === "known" ? [{ key, label, value: formatApproxMoneyInterval(value.value, currency, ctx, strings.units) }] : [];

  return (
    <TotalBand
      eyebrow={w.eyebrow}
      title={title}
      headingId="engine-app-streams-title"
      engines={[part("subscriptions", w.subscriptions, streams.now.subscriptions), part("usage", usageLabel, streams.now.usage)]}
      total={{ label: w.total, value: total ?? strings.slide.noNumber, missing: total === null, "data-testid": "engine-app-streams-total" }}
      totals={[...sum("new", w.newPerMonth, streams.newPerMonth.total), ...sum("in12", w.in12Months, streams.in12Months.total)]}
      data-testid="engine-app-streams"
    />
  );
}
