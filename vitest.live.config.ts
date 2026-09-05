import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * The LIVE probes — separate from `vitest.config.ts` on purpose.
 *
 * These talk to the real deployed site, real Firestore and real Gemini. They
 * are never part of `npm test` or CI on a pull request: the normal suite must
 * stay offline, deterministic and free. They run only from the
 * "Verify against live services" workflow, which fires by hand.
 *
 * Vitest is the runner rather than a plain script for one reason: it resolves
 * TypeScript and the `@/` alias, so a probe can import the app's own modules
 * instead of re-implementing them and testing a copy.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["scripts/live/**/*.live.ts"],
    // A Deep dive is four Gemini generations, each able to fall back through
    // four models — minutes, not seconds.
    testTimeout: 300_000,
    hookTimeout: 120_000,
    // One file at a time: these share the live database and clean up after
    // themselves, so overlapping runs would fight each other.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
});
