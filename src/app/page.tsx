"use client";

// TODO: page de scaffold temporaire — remplacée par le vrai écran Landing
// (étape 3 du plan de build, voir design/DESIGN-BRIEF.md §01 — Landing).
// Le seul but de cette page est de prouver, de bout en bout, que le
// scaffold Next.js, les tokens de design et la résolution FR/EN
// fonctionnent avant de construire le premier vrai écran.

import { tc, UI_STRINGS } from "@/lib/i18n/dictionary";
import { useLocale } from "@/lib/i18n/locale-context";

export default function ScaffoldCheckPage() {
  const { locale, setLocale } = useLocale();
  const t = UI_STRINGS.scaffold;

  return (
    <main
      style={{
        maxWidth: "var(--content-max-width)",
        margin: "0 auto",
        padding: "var(--space-9) var(--space-6)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: ".08em",
          color: "var(--ink-soft)",
        }}
      >
        Scaffold check — step 1/12
      </p>

      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          fontSize: 40,
          marginTop: "var(--space-5)",
        }}
      >
        {tc(t.placeholderTitle, locale)}
      </h1>

      <p style={{ marginTop: "var(--space-5)", maxWidth: 560, color: "var(--ink-soft)" }}>
        {tc(t.placeholderBody, locale)}
      </p>

      <p style={{ marginTop: "var(--space-6)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
        {tc(t.localeLabel, locale)}: <strong>{locale}</strong>
      </p>

      <div style={{ marginTop: "var(--space-6)", display: "flex", gap: "var(--space-3)" }}>
        <button type="button" onClick={() => setLocale("en")} style={buttonStyle}>
          EN
        </button>
        <button type="button" onClick={() => setLocale("fr")} style={buttonStyle}>
          FR
        </button>
      </div>
    </main>
  );
}

const buttonStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: 13,
  fontWeight: 600,
  padding: "8px 16px",
  border: "2px solid var(--ink)",
  borderRadius: "var(--radius-button)",
  background: "var(--paint-white)",
  color: "var(--ink)",
  cursor: "pointer",
};
