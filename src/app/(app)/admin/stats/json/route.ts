import { NextResponse } from "next/server";
import { loadDashboard } from "@/lib/submissions/dashboard";

/**
 * `GET /admin/stats/json` — the growth dashboard as data.
 *
 * Same numbers as the HTML page, from the same loader (`lib/submissions/
 * dashboard.ts`). Same protection too, and none of its own: `proxy.ts` gates
 * every path under `/admin` behind `ADMIN_DASHBOARD_PASSWORD` (Basic Auth),
 * so this handler only ever runs for a request that was let through.
 *
 * Its one intended reader is `.github/workflows/stats.yml`, which holds the
 * password as a GitHub secret and encrypts what it reads before it touches a
 * log. Never cached: real submission volume must be current.
 */
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    const data = await loadDashboard();
    return NextResponse.json(data, { headers: NO_STORE });
  } catch (err) {
    // Same contract as the two POST routes (REVIEW.md R-04): the detail goes
    // to the server log, the caller gets a short stable code.
    console.error("[admin/stats/json] failed", err);
    return NextResponse.json({ error: "STATS_FAILED" }, { status: 502, headers: NO_STORE });
  }
}
