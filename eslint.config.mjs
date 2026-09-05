import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

/**
 * REVIEW.md R-06 — the repo never had an ESLint configuration.
 *
 * `package.json` shipped `"lint": "next lint"`, but Next.js 16 removed that
 * command, so the script only ever printed "Invalid project directory
 * provided, no such directory: .../lint". And since no config existed even
 * before that, the `// eslint-disable-next-line` comments scattered in the
 * code had never suppressed anything — there was nothing running to
 * suppress.
 *
 * Flat config (ESLint 9). `eslint-config-next` ships both of these as flat
 * arrays already, so they spread in directly; no `FlatCompat` bridge needed.
 */
const config = [
  {
    // `design/` holds the Claude Design handoff bundle verbatim (reference
    // artifacts the app never imports and nobody here maintains) — linting
    // vendored files would only ever produce noise we can't act on.
    ignores: [".next/**", "node_modules/**", "next-env.d.ts", "public/**", "coverage/**", "design/**"],
  },

  ...nextCoreWebVitals,
  ...nextTypeScript,

  {
    name: "tourdegrowth/project",
    rules: {
      /*
       * The codebase deliberately prefixes an intentionally-unused binding
       * with `_` — see Button.tsx, which destructures props it must NOT
       * forward to the DOM element. Keep that as the escape hatch and treat
       * every other unused binding as an error.
       */
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
    },
  },

  {
    // Playwright fixtures receive a `use` callback, which the React Hooks
    // rule reads as React's `use` hook. There is no React in these files at
    // all — the rule simply doesn't apply here.
    name: "tourdegrowth/e2e",
    files: ["e2e/**/*.ts", "playwright.config.ts"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },

  {
    // `scripts/` holds standalone Node utilities (utm-link.mjs) that the app
    // never imports and the build never runs — no browser, no React.
    name: "tourdegrowth/scripts",
    files: ["scripts/**/*.mjs"],
    rules: {
      "no-console": "off",
    },
  },
];

export default config;
