import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // REVIEW-02.md R2-10. Coverage is measured over ALL of src/lib, not just
    // the files a test happens to import: the 95 % the default view reported
    // hid `growth-stats.ts` — the file that computes the K-factor — at 0 %,
    // simply because nothing imported it. Listing the whole tree makes an
    // untested module show up as a number instead of not showing up at all.
    // `src/app` is left out on purpose: route handlers and pages are covered
    // by Playwright against a real build, not by unit tests.
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts"],
      exclude: ["src/lib/**/*.test.ts", "src/lib/**/__tests__/**", "src/lib/**/types.ts"],
      reporter: ["text-summary"],
      // A floor, not a target: set just under what the tree measures today so
      // a PR that leaves a new module untested goes red, while an honest
      // I/O wrapper (repository.ts, firebase/admin.ts) doesn't have to be
      // mocked into a test for the sake of a percentage.
      thresholds: { lines: 82, statements: 80, functions: 77, branches: 76 },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
});
