import React from "react";

/**
 * The 1200×630 og:image, ext-03 layout. Satori target: flexbox only, no CSS
 * variables, no grid, hex constants hand-copied from tokens/colors.css.
 * Fonts: Stardos Stencil 700, Inter 600, IBM Plex Mono 500/600 — load as buffers.
 *
 * What changed from the "highest care" original: the five pillar rows leave;
 * the right column carries the next move. Numeral, header and bottom hook are untouched.
 */
const C = {
  paper1: "#E7E1D2", paper0: "#FBF9F2", paper2: "#DED6C2",
  ink0: "#211C15", ink1: "#5B5346", red: "#D2402C", redDeep: "#A32E1F", redWash: "#F3D9D2",
  divider: "rgba(33,28,21,0.22)",
};

export function ShareImage({ score, total = 100, pillar, pillarScore, pillarTotal = 20, action, hookLine1, hookLine2, labelScore = "Overall growth score", labelMove = "Next move", tone = "straight", tag = "AARRR check-up — 3 min", url = "tourdegrowth.com" }) {
  const roast = tone === "roast";
  return (
    <div style={{ width: 1200, height: 630, display: "flex", flexDirection: "column", background: C.paper1, border: roast ? `6px solid ${C.red}` : `2px solid ${C.ink0}`, fontFamily: "Inter", color: C.ink0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "36px 56px 20px" }}>
        <div style={{ display: "flex", fontFamily: "Stardos Stencil", fontWeight: 700, fontSize: 30, letterSpacing: 0.6 }}>
          <span>TOUR DE&nbsp;</span><span style={{ color: C.red }}>GROWTH</span>
        </div>
        {roast ? (
          <div style={{ display: "flex", fontFamily: "IBM Plex Mono", fontWeight: 600, fontSize: 16, letterSpacing: 1, background: C.red, color: C.paper0, borderRadius: 4, padding: "10px 18px" }}>🔥 ROAST MODE</div>
        ) : (
          <div style={{ display: "flex", fontFamily: "IBM Plex Mono", fontWeight: 500, fontSize: 16, letterSpacing: 1, border: `2px dashed ${C.ink0}`, borderRadius: 4, padding: "10px 18px", color: C.ink0 }}>{tag.toUpperCase()}</div>
        )}
      </div>
      <div style={{ display: "flex", height: 6, borderTop: `6px dashed ${C.divider}` }} />

      <div style={{ display: "flex", flex: 1, padding: "30px 56px 0", gap: 48 }}>
        <div style={{ display: "flex", flexDirection: "column", width: 560 }}>
          <div style={{ fontFamily: "IBM Plex Mono", fontWeight: 500, fontSize: 20, letterSpacing: 2, color: C.ink1 }}>{labelScore.toUpperCase()}</div>
          <div style={{ display: "flex", alignItems: "flex-end", fontFamily: "Stardos Stencil", fontWeight: 700, fontSize: 210, lineHeight: 0.9, marginTop: 10 }}>
            <span>{score}</span>
            <span style={{ fontSize: 64, color: C.ink1, marginLeft: 12, marginBottom: 18 }}>/{total}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, background: C.paper0, border: `3px dashed ${C.red}`, borderRadius: 12, padding: "26px 30px", alignSelf: "flex-start" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "IBM Plex Mono", fontWeight: 600, fontSize: 17, letterSpacing: 1.5, color: C.redDeep }}>
            <span>{labelMove.toUpperCase()}</span>
            {pillar ? <span style={{ color: C.ink1 }}>{pillar.toUpperCase()} · {pillarScore}/{pillarTotal}</span> : null}
          </div>
          <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 28, lineHeight: 1.3, marginTop: 14, color: C.ink0 }}>{action}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 56px 44px" }}>
        <div style={{ display: "flex", flexDirection: "column", fontFamily: "Inter", fontWeight: 600, fontSize: 32, lineHeight: 1.2 }}>
          <span>{hookLine1}</span>
          <span style={{ color: C.ink1 }}>{hookLine2}</span>
        </div>
        <div style={{ display: "flex", fontFamily: "IBM Plex Mono", fontWeight: 600, fontSize: 20, background: C.red, color: C.paper0, borderRadius: 6, padding: "14px 22px" }}>{url}</div>
      </div>
    </div>
  );
}
