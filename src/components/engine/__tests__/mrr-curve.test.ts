import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { MrrCurve, type MrrCurveProps } from "../MrrCurve";

/**
 * The MRR's curve (design system extension 09, Q8, A20.d T3.a), pinned
 * without a DOM: the drawing is decoration and the caption says it in
 * words; both lines ink, never the leak's red; a range hatched; the names at
 * the lines' ends.
 *
 * Extension 10 (A23 MKT-7a), non-vacuity (2026-10-27, one sabotage at a time,
 * restored after): the ring never drawn drops 2 tests; the note moved above
 * the plot 1; the default markup perturbed by an attribute 3 (the reference,
 * the ring against it, the « no ring » case); the note's ring given without
 * `step` 1; the slide's radius lost 1; the ring's stroke put on a red token 1
 * (whatif-no-red.test.ts reads this sheet too).
 */
const pts = (from: number, to: number, spread = 0) =>
  Array.from({ length: 13 }, (_, i) => {
    const v = from + ((to - from) * i) / 12;
    return [v - spread, v + spread] as [number, number];
  });
const curve = (props: Partial<MrrCurveProps> = {}) =>
  renderToStaticMarkup(
    createElement(MrrCurve, {
      id: "c",
      today: pts(48_000, 80_000),
      keys: { today: "au rythme d'aujourd'hui", whatif: "avec tes « Et si »" },
      start: "48 000 € aujourd'hui",
      xLabels: ["août 2026", "février 2027", "août 2027"],
      summary: "Le MRR mois par mois, de 48 000 € aujourd'hui à ~80 000 € dans 12 mois au rythme actuel.",
      "data-testid": "curve",
      ...props,
    }),
  );

/**
 * Extension 10 (A23 MKT-7a) adds two optional props, `step` and `note`. Without them the curve draws exactly what
 * it drew: these four renders were taken on origin/main (2dbf9d2) before the props existed, from the builder above,
 * and the markup must still match them character for character. A reference that no longer matches is an alarm, not
 * a snapshot to update.
 */
const BEFORE_STEP_AND_NOTE = {
  untouched: "<figure class=\"_root_14dc0e\" data-testid=\"curve\"><svg class=\"_svg_14dc0e\" width=\"720\" height=\"200\" viewBox=\"0 0 720 200\" aria-hidden=\"true\" focusable=\"false\"><defs><pattern id=\"c-hatch\" patternUnits=\"userSpaceOnUse\" width=\"6\" height=\"6\" patternTransform=\"rotate(45)\"><rect width=\"2\" height=\"6\" class=\"_hatch_14dc0e\"></rect></pattern></defs><line x1=\"2\" x2=\"542\" y1=\"150.72955974842768\" y2=\"150.72955974842768\" class=\"_level_14dc0e\"></line><g class=\"_today_14dc0e\"><polyline points=\"2.0,150.7 47.0,141.0 92.0,131.3 137.0,121.6 182.0,111.9 227.0,102.2 272.0,92.6 317.0,82.9 362.0,73.2 407.0,63.5 452.0,53.8 497.0,44.1 542.0,34.4\" class=\"_line_14dc0e\"></polyline><circle cx=\"542\" cy=\"34.377358490566024\" r=\"4\" class=\"_dot_14dc0e\"></circle></g><circle cx=\"2\" cy=\"150.72955974842768\" r=\"4\" class=\"_start_14dc0e\"></circle><text x=\"10\" y=\"168.72955974842768\" class=\"_tick_14dc0e _startLabel_14dc0e _halo_14dc0e\" text-anchor=\"start\">48 000 € aujourd&#x27;hui</text><text x=\"2\" y=\"194\" class=\"_tick_14dc0e\" text-anchor=\"start\">août 2026</text><text x=\"272\" y=\"194\" class=\"_tick_14dc0e\" text-anchor=\"middle\">février 2027</text><text x=\"542\" y=\"194\" class=\"_tick_14dc0e\" text-anchor=\"end\">août 2027</text><text x=\"554\" y=\"38.377358490566024\" class=\"_key_14dc0e _keyToday_14dc0e\">au rythme d&#x27;aujourd&#x27;hui</text></svg><figcaption class=\"tdg-visually-hidden\">Le MRR mois par mois, de 48 000 € aujourd&#x27;hui à ~80 000 € dans 12 mois au rythme actuel.</figcaption></figure>",
  moved: "<figure class=\"_root_14dc0e\" data-testid=\"curve\"><svg class=\"_svg_14dc0e\" width=\"720\" height=\"200\" viewBox=\"0 0 720 200\" aria-hidden=\"true\" focusable=\"false\"><defs><pattern id=\"c-hatch\" patternUnits=\"userSpaceOnUse\" width=\"6\" height=\"6\" patternTransform=\"rotate(45)\"><rect width=\"2\" height=\"6\" class=\"_hatch_14dc0e\"></rect></pattern></defs><line x1=\"2\" x2=\"542\" y1=\"150.72955974842768\" y2=\"150.72955974842768\" class=\"_level_14dc0e\"></line><polygon points=\"2.0,150.7 47.0,141.0 92.0,131.3 137.0,121.6 182.0,111.9 227.0,102.2 272.0,92.6 317.0,82.9 362.0,73.2 407.0,63.5 452.0,53.8 497.0,44.1 542.0,34.4 542.0,69.8 497.0,76.5 452.0,83.3 407.0,90.0 362.0,96.8 317.0,103.5 272.0,110.3 227.0,117.0 182.0,123.7 137.0,130.5 92.0,137.2 47.0,144.0 2.0,150.7\" class=\"_gain_14dc0e\"></polygon><g class=\"_today_14dc0e\"><polyline points=\"2.0,150.7 47.0,144.0 92.0,137.2 137.0,130.5 182.0,123.7 227.0,117.0 272.0,110.3 317.0,103.5 362.0,96.8 407.0,90.0 452.0,83.3 497.0,76.5 542.0,69.8\" class=\"_line_14dc0e\"></polyline><circle cx=\"542\" cy=\"69.78889800382828\" r=\"4\" class=\"_dot_14dc0e\"></circle></g><g class=\"_whatif_14dc0e\"><polyline points=\"2.0,150.7 47.0,141.0 92.0,131.3 137.0,121.6 182.0,111.9 227.0,102.2 272.0,92.6 317.0,82.9 362.0,73.2 407.0,63.5 452.0,53.8 497.0,44.1 542.0,34.4\" class=\"_line_14dc0e\"></polyline><circle cx=\"542\" cy=\"34.377358490566024\" r=\"4\" class=\"_dot_14dc0e\"></circle></g><circle cx=\"2\" cy=\"150.72955974842768\" r=\"4\" class=\"_start_14dc0e\"></circle><text x=\"10\" y=\"168.72955974842768\" class=\"_tick_14dc0e _startLabel_14dc0e _halo_14dc0e\" text-anchor=\"start\">48 000 € aujourd&#x27;hui</text><text x=\"2\" y=\"194\" class=\"_tick_14dc0e\" text-anchor=\"start\">août 2026</text><text x=\"272\" y=\"194\" class=\"_tick_14dc0e\" text-anchor=\"middle\">février 2027</text><text x=\"542\" y=\"194\" class=\"_tick_14dc0e\" text-anchor=\"end\">août 2027</text><text x=\"554\" y=\"38.377358490566024\" class=\"_key_14dc0e _keyWhatif_14dc0e\">avec tes « Et si »</text><text x=\"554\" y=\"73.78889800382828\" class=\"_key_14dc0e _keyToday_14dc0e\">au rythme d&#x27;aujourd&#x27;hui</text></svg><figcaption class=\"tdg-visually-hidden\">Le MRR mois par mois, de 48 000 € aujourd&#x27;hui à ~80 000 € dans 12 mois au rythme actuel.</figcaption></figure>",
  range: "<figure class=\"_root_14dc0e\" data-testid=\"curve\"><svg class=\"_svg_14dc0e\" width=\"720\" height=\"200\" viewBox=\"0 0 720 200\" aria-hidden=\"true\" focusable=\"false\"><defs><pattern id=\"c-hatch\" patternUnits=\"userSpaceOnUse\" width=\"6\" height=\"6\" patternTransform=\"rotate(45)\"><rect width=\"2\" height=\"6\" class=\"_hatch_14dc0e\"></rect></pattern></defs><line x1=\"2\" x2=\"542\" y1=\"148.88595092567988\" y2=\"148.88595092567988\" class=\"_level_14dc0e\"></line><polygon points=\"2.0,150.7 47.0,141.3 92.0,132.0 137.0,122.6 182.0,113.2 227.0,103.8 272.0,94.4 317.0,85.0 362.0,75.6 407.0,66.2 452.0,56.8 497.0,47.5 542.0,38.1 542.0,67.7 497.0,74.3 452.0,80.9 407.0,87.5 362.0,94.1 317.0,100.7 272.0,107.4 227.0,114.0 182.0,120.6 137.0,127.2 92.0,133.8 47.0,140.4 2.0,147.0\" class=\"_gain_14dc0e\"></polygon><g class=\"_today_14dc0e\" data-range=\"true\"><polygon points=\"2.0,147.0 47.0,140.4 92.0,133.8 137.0,127.2 182.0,120.6 227.0,114.0 272.0,107.4 317.0,100.7 362.0,94.1 407.0,87.5 452.0,80.9 497.0,74.3 542.0,67.7 542.0,71.4 497.0,78.0 452.0,84.6 407.0,91.2 362.0,97.8 317.0,104.4 272.0,111.0 227.0,117.7 182.0,124.3 137.0,130.9 92.0,137.5 47.0,144.1 2.0,150.7\" class=\"_band_14dc0e\" fill=\"url(#c-hatch)\"></polygon><polyline points=\"2.0,147.0 47.0,140.4 92.0,133.8 137.0,127.2 182.0,120.6 227.0,114.0 272.0,107.4 317.0,100.7 362.0,94.1 407.0,87.5 452.0,80.9 497.0,74.3 542.0,67.7\" class=\"_line_14dc0e _edge_14dc0e\"></polyline><polyline points=\"2.0,150.7 47.0,144.1 92.0,137.5 137.0,130.9 182.0,124.3 227.0,117.7 272.0,111.0 317.0,104.4 362.0,97.8 407.0,91.2 452.0,84.6 497.0,78.0 542.0,71.4\" class=\"_line_14dc0e _edge_14dc0e\"></polyline></g><g class=\"_whatif_14dc0e\" data-range=\"true\"><polygon points=\"2.0,147.0 47.0,137.7 92.0,128.3 137.0,118.9 182.0,109.5 227.0,100.1 272.0,90.7 317.0,81.3 362.0,71.9 407.0,62.5 452.0,53.2 497.0,43.8 542.0,34.4 542.0,38.1 497.0,47.5 452.0,56.8 407.0,66.2 362.0,75.6 317.0,85.0 272.0,94.4 227.0,103.8 182.0,113.2 137.0,122.6 92.0,132.0 47.0,141.3 2.0,150.7\" class=\"_band_14dc0e\" fill=\"url(#c-hatch)\"></polygon><polyline points=\"2.0,147.0 47.0,137.7 92.0,128.3 137.0,118.9 182.0,109.5 227.0,100.1 272.0,90.7 317.0,81.3 362.0,71.9 407.0,62.5 452.0,53.2 497.0,43.8 542.0,34.4\" class=\"_line_14dc0e _edge_14dc0e\"></polyline><polyline points=\"2.0,150.7 47.0,141.3 92.0,132.0 137.0,122.6 182.0,113.2 227.0,103.8 272.0,94.4 317.0,85.0 362.0,75.6 407.0,66.2 452.0,56.8 497.0,47.5 542.0,38.1\" class=\"_line_14dc0e _edge_14dc0e\"></polyline></g><circle cx=\"2\" cy=\"148.88595092567988\" r=\"4\" class=\"_start_14dc0e\"></circle><text x=\"10\" y=\"166.88595092567988\" class=\"_tick_14dc0e _startLabel_14dc0e _halo_14dc0e\" text-anchor=\"start\">48 000 € aujourd&#x27;hui</text><text x=\"2\" y=\"194\" class=\"_tick_14dc0e\" text-anchor=\"start\">août 2026</text><text x=\"272\" y=\"194\" class=\"_tick_14dc0e\" text-anchor=\"middle\">février 2027</text><text x=\"542\" y=\"194\" class=\"_tick_14dc0e\" text-anchor=\"end\">août 2027</text><text x=\"554\" y=\"40.22096731331385\" class=\"_key_14dc0e _keyWhatif_14dc0e\">avec tes « Et si »</text><text x=\"554\" y=\"73.50834883514926\" class=\"_key_14dc0e _keyToday_14dc0e\">au rythme d&#x27;aujourd&#x27;hui</text></svg><figcaption class=\"tdg-visually-hidden\">Le MRR mois par mois, de 48 000 € aujourd&#x27;hui à ~80 000 € dans 12 mois au rythme actuel.</figcaption></figure>",
  slide: "<figure class=\"_root_14dc0e _compact_14dc0e _slide_14dc0e\" data-compact=\"true\" data-testid=\"curve\"><svg class=\"_svg_14dc0e\" width=\"1520\" height=\"260\" viewBox=\"0 0 1520 260\" aria-hidden=\"true\" focusable=\"false\"><defs><pattern id=\"c-hatch\" patternUnits=\"userSpaceOnUse\" width=\"6\" height=\"6\" patternTransform=\"rotate(45)\"><rect width=\"2\" height=\"6\" class=\"_hatch_14dc0e\"></rect></pattern></defs><line x1=\"2\" x2=\"1510\" y1=\"177.1823899371069\" y2=\"177.1823899371069\" class=\"_level_14dc0e\"></line><polygon points=\"2.0,177.2 127.7,164.3 253.3,151.5 379.0,138.7 504.7,125.8 630.3,113.0 756.0,100.1 881.7,87.3 1007.3,74.5 1133.0,61.6 1258.7,48.8 1384.3,35.9 1510.0,23.1 1510.0,70.0 1384.3,78.9 1258.7,87.9 1133.0,96.8 1007.3,105.7 881.7,114.7 756.0,123.6 630.3,132.5 504.7,141.5 379.0,150.4 253.3,159.3 127.7,168.2 2.0,177.2\" class=\"_gain_14dc0e\"></polygon><g class=\"_today_14dc0e\"><polyline points=\"2.0,177.2 127.7,168.2 253.3,159.3 379.0,150.4 504.7,141.5 630.3,132.5 756.0,123.6 881.7,114.7 1007.3,105.7 1133.0,96.8 1258.7,87.9 1384.3,78.9 1510.0,70.0\" class=\"_line_14dc0e\"></polyline><circle cx=\"1510\" cy=\"69.99070276182664\" r=\"4\" class=\"_dot_14dc0e\"></circle></g><g class=\"_whatif_14dc0e\"><polyline points=\"2.0,177.2 127.7,164.3 253.3,151.5 379.0,138.7 504.7,125.8 630.3,113.0 756.0,100.1 881.7,87.3 1007.3,74.5 1133.0,61.6 1258.7,48.8 1384.3,35.9 1510.0,23.1\" class=\"_line_14dc0e\"></polyline><circle cx=\"1510\" cy=\"23.094339622641513\" r=\"4\" class=\"_dot_14dc0e\"></circle></g><circle cx=\"2\" cy=\"177.1823899371069\" r=\"4\" class=\"_start_14dc0e\"></circle><text x=\"12\" y=\"203.1823899371069\" class=\"_tick_14dc0e _startLabel_14dc0e _halo_14dc0e\" text-anchor=\"start\">48 000 € aujourd&#x27;hui</text><text x=\"2\" y=\"252\" class=\"_tick_14dc0e\" text-anchor=\"start\">août 2026</text><text x=\"756\" y=\"252\" class=\"_tick_14dc0e\" text-anchor=\"middle\">février 2027</text><text x=\"1510\" y=\"252\" class=\"_tick_14dc0e\" text-anchor=\"end\">août 2027</text></svg><ul class=\"_legend_14dc0e\" aria-hidden=\"true\"><li class=\"_legendItem_14dc0e _legendWhatif_14dc0e\">avec tes « Et si »</li><li class=\"_legendItem_14dc0e\">au rythme d&#x27;aujourd&#x27;hui</li></ul><figcaption class=\"tdg-visually-hidden\">Le MRR mois par mois, de 48 000 € aujourd&#x27;hui à ~80 000 € dans 12 mois au rythme actuel.</figcaption></figure>",
} as const;
const css = readFileSync(join(__dirname, "..", "MrrCurve.module.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

describe("MrrCurve", () => {
  it("is a figure: the SVG hidden from a screen reader, the curve said in words in its caption", () => {
    const markup = curve();
    expect(markup).toMatch(/<figure[^>]*data-testid="curve"/);
    expect(markup).toMatch(/<svg[^>]*aria-hidden="true"/);
    expect(markup).toMatch(/<figcaption class="tdg-visually-hidden">Le MRR mois par mois/);
  });

  it("untouched: today's line and its name alone; one figure on the curve, today's MRR; three months under the axis", () => {
    const markup = curve();
    expect(markup.match(/<polyline/g)).toHaveLength(1);
    expect(markup).toContain("au rythme d&#x27;aujourd&#x27;hui");
    expect(markup).not.toContain("avec tes");
    expect(markup).toContain("48 000 € aujourd&#x27;hui");
    expect(markup).toContain("février 2027");
  });

  it("moved: two lines, the room between them, both names", () => {
    const markup = curve({ whatif: pts(48_000, 94_000) });
    expect(markup.match(/<polyline/g)).toHaveLength(2);
    expect(markup).toMatch(/<polygon points="[^"]+" class="[^"]*gain/);
    expect(markup).toContain("avec tes « Et si »");
  });

  it("a range is hatched, edged by both paths", () => {
    const markup = curve({ today: pts(180_000, 335_000, 3_600) });
    expect(markup).toMatch(/<pattern id="c-hatch"/);
    expect(markup).toMatch(/<polygon points="[^"]+" class="[^"]*band[^"]*" fill="url\(#c-hatch\)"/);
    expect(markup.match(/<polyline/g)).toHaveLength(2);
    expect(markup).toMatch(/data-range="true"/);
  });

  it("drawn at the width it is given — a slide's — never compact there", () => {
    const markup = curve({ width: 1_520, height: 260 });
    expect(markup).toMatch(/<svg[^>]*width="1520" height="260" viewBox="0 0 1520 260"/);
    expect(markup).not.toContain("data-compact");
  });

  it("no red anywhere: the projection is not a diagnosis", () => {
    expect(curve({ whatif: pts(48_000, 94_000) })).not.toMatch(/alert|red|leak/i);
  });

  it("extension 10: without `step` and `note` the markup is exactly what it was before them", () => {
    expect(curve()).toBe(BEFORE_STEP_AND_NOTE.untouched);
    expect(curve({ whatif: pts(48_000, 94_000) })).toBe(BEFORE_STEP_AND_NOTE.moved);
    expect(curve({ today: pts(180_000, 335_000, 3_600), whatif: pts(180_000, 400_000, 3_600) })).toBe(BEFORE_STEP_AND_NOTE.range);
    expect(curve({ width: 1_520, height: 260, medium: "slide", whatif: pts(48_000, 94_000) })).toBe(BEFORE_STEP_AND_NOTE.slide);
    // Said as props that are off, they change nothing either.
    expect(curve({ whatif: pts(48_000, 94_000), step: false, note: undefined })).toBe(BEFORE_STEP_AND_NOTE.moved);
  });

  it("extension 10: `step` rings the what-if line at month 1 — on its second vertex — after the line and before the start dot", () => {
    const markup = curve({ whatif: pts(48_000, 94_000), step: true });
    expect(markup.match(/<circle[^>]*class="[^"]*_step_/g)).toHaveLength(1);
    const ring = /<circle cx="([\d.]+)" cy="([\d.]+)" r="6" class="[^"]*_step_/.exec(markup);
    expect(ring).not.toBeNull();
    // The what-if line is the second polyline: the ring sits on its vertex at month 1.
    const whatif = [...markup.matchAll(/<polyline points="([^"]+)"/g)][1]![1]!;
    const [x1, y1] = whatif.split(" ")[1]!.split(",").map(Number);
    expect(Number(ring![1])).toBeCloseTo(x1!, 5);
    expect(Number(ring![2])).toBeCloseTo(y1!, 5);
    expect(markup.indexOf("_step_")).toBeGreaterThan(markup.lastIndexOf("<polyline"));
    expect(markup.indexOf("_step_")).toBeLessThan(markup.indexOf("_start_"));
    // The ring is one mark more, and nothing else moves.
    expect(markup.replace(/<circle[^>]*class="[^"]*_step_[^"]*"><\/circle>/, "")).toBe(BEFORE_STEP_AND_NOTE.moved);
  });

  it("extension 10: the ring is bigger on a slide, and sits on a range's middle", () => {
    expect(curve({ width: 1_520, height: 260, medium: "slide", whatif: pts(48_000, 94_000), step: true })).toMatch(/<circle[^>]* r="9" class="[^"]*_step_/);
    const markup = curve({ today: pts(180_000, 335_000, 3_600), whatif: pts(180_000, 400_000, 3_600), step: true });
    const ring = /<circle cx="([\d.]+)" cy="([\d.]+)" r="6" class="[^"]*_step_/.exec(markup);
    const [high, low] = [...markup.matchAll(/<polyline points="([^"]+)"/g)].slice(2).map((m) => m[1]!.split(" ")[1]!.split(",").map(Number));
    expect(Number(ring![2])).toBeCloseTo((high![1]! + low![1]!) / 2, 5);
  });

  it("extension 10: no ring without a what-if to ring, nor without `step`", () => {
    expect(curve({ step: true })).toBe(BEFORE_STEP_AND_NOTE.untouched);
    expect(curve({ whatif: pts(48_000, 94_000) })).not.toContain("_step_");
  });

  it("extension 10: `note` is a line of real text under the plot, before the hidden summary — with `step`, it starts with the ring's twin", () => {
    const plain = curve({ whatif: pts(48_000, 94_000), note: "NOTE" });
    expect(plain).toMatch(/<\/svg><p class="[^"]*_note_[^"]*">NOTE<\/p><figcaption/);
    expect(plain).not.toContain("_noteStep_");
    const stepped = curve({ whatif: pts(48_000, 94_000), step: true, note: "NOTE" });
    expect(stepped).toMatch(/<p class="[^"]*_note_[^"]*_noteStep_[^"]*">NOTE<\/p>/);
    expect(stepped.indexOf("NOTE")).toBeLessThan(stepped.indexOf("<figcaption"));
    // On a slide the keys are a legend under the plot: the note comes after it.
    const slide = curve({ width: 1_520, height: 260, medium: "slide", whatif: pts(48_000, 94_000), note: "NOTE" });
    expect(slide.indexOf("</ul>")).toBeGreaterThan(-1);
    expect(slide.indexOf("</ul>")).toBeLessThan(slide.indexOf("NOTE"));
  });

  it("extension 10: the ring and the note are ink — a jump is a projection, never red", () => {
    expect(curve({ whatif: pts(48_000, 94_000), step: true, note: "NOTE" })).not.toMatch(/alert|red|leak/i);
    expect(css).toMatch(/\.step \{[^}]*stroke: var\(--money-line-whatif\)[^}]*stroke-width: var\(--market-step-ring\)/);
    expect(css).toMatch(/\.noteStep::before \{[^}]*border: var\(--market-step-ring\) solid var\(--money-line-whatif\)/);
    expect(css).toMatch(/\.slide \.note \{[^}]*font: var\(--slide-meta\)/);
  });
});
