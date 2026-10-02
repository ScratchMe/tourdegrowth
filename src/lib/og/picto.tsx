import type { CSSProperties } from "react";
import type { Space } from "@/components/brand/SpaceBand";
import { PICTO_VIEWBOX, SPACE_PICTO_PARTS } from "@/components/brand/space-pictos";

/**
 * A space's pictogram for Satori: the band's own drawing
 * (`components/brand/space-pictos.ts`), in a literal colour — Satori reads
 * no `currentColor` from a stylesheet. Drawn beside the space's name in the
 * pill of a share image: « 1/3 · PLAINE » on the result's, « 2/3 ·
 * CONTRE-LA-MONTRE » on the engine's.
 */
export function OgPicto({
  space,
  color,
  width,
  height,
  style,
}: {
  space: Space;
  color: string;
  width: number;
  height: number;
  style?: CSSProperties;
}) {
  return (
    <svg width={width} height={height} viewBox={PICTO_VIEWBOX} style={style}>
      {SPACE_PICTO_PARTS[space].map((part, index) =>
        part.kind === "ring" ? (
          <circle key={index} cx={part.cx} cy={part.cy} r={part.r} fill="none" stroke={color} strokeWidth={part.width} />
        ) : part.kind === "stroke" ? (
          <path key={index} d={part.d} stroke={color} strokeWidth={part.width} fill="none" />
        ) : (
          <path key={index} d={part.d} fill={color} />
        ),
      )}
    </svg>
  );
}
