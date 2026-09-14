import { describe, expect, it } from "vitest";
import type { FunnelWindow } from "@/lib/analytics/goatcounter-api";
import { conversionPerShare } from "@/lib/submissions/dashboard";

function window(label: string, shares: number | null): FunnelWindow {
  return shares === null
    ? { label, stats: null, error: "unavailable" }
    : { label, stats: { shares } as unknown as NonNullable<FunnelWindow["stats"]> };
}

describe("conversionPerShare (REVIEW-02.md R2-01)", () => {
  it("divides referred submissions by the ALL-TIME share count, never another window's", () => {
    const funnel = [window("Last 30 days", 2), window("All-time", 8)];
    expect(conversionPerShare({ referredSubmissions: 2 }, funnel)).toBe(0.25);
  });

  it("is null when nothing was shared yet or GoatCounter is unavailable", () => {
    expect(conversionPerShare({ referredSubmissions: 2 }, [window("All-time", 0)])).toBeNull();
    expect(conversionPerShare({ referredSubmissions: 2 }, [window("All-time", null)])).toBeNull();
    expect(conversionPerShare({ referredSubmissions: 2 }, [])).toBeNull();
  });
});
