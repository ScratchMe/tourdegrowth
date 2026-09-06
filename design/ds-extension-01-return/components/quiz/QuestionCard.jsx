import React from "react";

/** The raised card holding the current question. Inter 600, never mono, never uppercase. */
export function QuestionCard({ size = "desktop", children, style, ...rest }) {
  const desktop = size === "desktop";
  return (
    <div
      style={{
        background: "var(--surface-card)",
        border: "var(--border-solid)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
        padding: desktop ? "30px 32px" : "22px 20px",
        ...style,
      }}
      {...rest}
    >
      <h2
        style={{
          font: desktop ? "var(--title-question-lg)" : "var(--title-question-sm)",
          color: "var(--text-body)",
          margin: 0,
          textWrap: "pretty",
        }}
      >
        {children}
      </h2>
    </div>
  );
}
