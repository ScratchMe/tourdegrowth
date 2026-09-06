import React from "react";

/** TOUR DE GROWTH in stencil caps. GROWTH is always road-paint red. */
export function Wordmark({ size = "md", as: Tag = "div", style, ...rest }) {
  const fontSize = { sm: 15, md: 19, lg: 34 }[size] || 19;
  return (
    <Tag
      style={{
        font: "var(--display-wordmark)",
        fontSize,
        letterSpacing: "var(--display-letter-spacing)",
        color: "var(--text-body)",
        textTransform: "uppercase",
        ...style,
      }}
      {...rest}
    >
      TOUR DE <span style={{ color: "var(--paint-red)" }}>GROWTH</span>
    </Tag>
  );
}
