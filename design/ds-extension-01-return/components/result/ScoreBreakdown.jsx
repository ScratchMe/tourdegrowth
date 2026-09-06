import React from "react";
import { Disclosure } from "../core/Disclosure.jsx";

/**
 * Owner-only "How this score is calculated". One Disclosure; inside it the five
 * pillar heads with their maths are always visible, and each pillar's three
 * answers sit behind a nested sm Disclosure.
 */
export function ScoreBreakdown({ pillars, strings, style, ...rest }) {
  const s = {
    summary: "How this score is calculated",
    intro: "Three questions per stage. Your answers, and what each one was worth.",
    note: "Only visible to you — your answers are stored on this device, never on the shared page.",
    pts: (n) => `${n} pts`,
    maths: (raw, score) => `${raw}/60 → ${score}/20`,
    ...strings,
  };
  return (
    <Disclosure summary={s.summary} style={style} {...rest}>
      <p style={{ font: "var(--body-sm)", color: "var(--text-muted)", margin: "0 0 var(--space-8)", textWrap: "pretty" }}>{s.intro}</p>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {pillars.map((p) => (
          <Disclosure
            key={p.id}
            size="sm"
            rule={false}
            style={{ borderTop: "2px dashed var(--border-divider)" }}
            summary={
              <span style={{ display: "flex", justifyContent: "space-between", gap: "var(--space-5)", width: "100%", alignItems: "baseline" }}>
                <span style={{ font: "var(--meta-md)", letterSpacing: "var(--meta-tracking)", color: "var(--text-body)" }}>{p.name}</span>
                <span style={{ font: "var(--meta-sm)", letterSpacing: 0, textTransform: "none", color: "var(--text-muted)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                  {s.maths(p.raw, p.score)}
                </span>
              </span>
            }
          >
            <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {p.answers.map((a, i) => (
                <li
                  key={i}
                  style={{
                    padding: "var(--space-5) 0",
                    borderTop: i ? "2px dashed var(--border-divider)" : "none",
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) auto",
                    columnGap: "var(--space-7)",
                    rowGap: "var(--space-1)",
                  }}
                >
                  <div style={{ font: "var(--body-sm)", color: "var(--text-body)", gridColumn: "1 / -1", textWrap: "pretty" }}>{a.question}</div>
                  <div style={{ font: "var(--body-sm)", color: "var(--text-muted)", textWrap: "pretty" }}>{a.answer}</div>
                  <div
                    style={{
                      font: "var(--meta-sm)",
                      fontVariantNumeric: "tabular-nums",
                      whiteSpace: "nowrap",
                      alignSelf: "end",
                      color: a.points === 0 ? "var(--text-alert)" : "var(--text-muted)",
                    }}
                  >
                    {s.pts(a.points)}
                  </div>
                </li>
              ))}
            </ol>
          </Disclosure>
        ))}
      </div>
      <p style={{ font: "var(--meta-xs)", color: "var(--text-faint)", margin: "var(--space-8) 0 0", textWrap: "pretty" }}>{s.note}</p>
    </Disclosure>
  );
}
