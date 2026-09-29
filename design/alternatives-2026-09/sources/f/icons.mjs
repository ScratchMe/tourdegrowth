// Pixel icons as ASCII maps. X = lit pixel. Rendered to SVG (one rect per run) with crisp edges.
export const MAPS = {
  flag: [
    "XX.......",
    "XXXXXX...",
    "XXXXXXXX.",
    "XXXXXXXXX",
    "XXXXXX...",
    "XX.......",
    "XX.......",
    "XX.......",
    "XX.......",
  ],
  bars: [
    ".......XX",
    ".......XX",
    "....XX.XX",
    "....XX.XX",
    ".XX.XX.XX",
    ".XX.XX.XX",
    ".XX.XX.XX",
    ".........",
    "XXXXXXXXX",
  ],
  moon: [
    "...XXXX..",
    ".XXXX....",
    ".XXX.....",
    "XXX......",
    "XXX......",
    "XXX......",
    ".XXX.....",
    ".XXXX....",
    "...XXXX..",
  ],
  heart: [
    ".XX...XX.",
    "XXXX.XXXX",
    "XXXXXXXXX",
    "XXXXXXXXX",
    ".XXXXXXX.",
    "..XXXXX..",
    "...XXX...",
    "....X....",
  ],
  skull: [
    "..XXXXX..",
    ".XXXXXXX.",
    "XXXXXXXXX",
    "X..XXX..X",
    "X..XXX..X",
    "XXXX.XXXX",
    ".XXXXXXX.",
    "..X.X.X..",
    "..XXXXX..",
  ],
  lock: [
    "..XXXX..",
    ".XX..XX.",
    ".X....X.",
    ".X....X.",
    "XXXXXXXX",
    "XXX..XXX",
    "XXX..XXX",
    "XXXX.XXX",
    "XXXXXXXX",
  ],
  quest: [
    "XXXXXXXX",
    "XXX..XXX",
    "XXX..XXX",
    "XXX..XXX",
    "XXX..XXX",
    "XXXXXXXX",
    "XXX..XXX",
    "XXXXXXXX",
  ],
  star: [
    "....X....",
    "...XXX...",
    "...XXX...",
    "XXXXXXXXX",
    ".XXXXXXX.",
    "..XXXXX..",
    "..XX.XX..",
    ".XX...XX.",
    ".X.....X.",
  ],
  play: [
    "X....",
    "XX...",
    "XXX..",
    "XXXX.",
    "XXXXX",
    "XXXX.",
    "XXX..",
    "XX...",
    "X....",
  ],
  down: [
    "XXXXXXXXX",
    ".XXXXXXX.",
    "..XXXXX..",
    "...XXX...",
    "....X....",
  ],
  check: [
    "........X",
    ".......XX",
    "X.....XX.",
    "XX...XX..",
    ".XX.XX...",
    "..XXX....",
    "...X.....",
  ],
  // Dither floor tile: density grows downwards (4 wide x 6 tall).
  dither: [
    "X...",
    "..X.",
    "X.X.",
    ".X.X",
    "XXX.",
    "XXXX",
  ],
  // Stepped staircase edge (used as a divider).
  steps: [
    "XXXXXXXX........",
    "XXXXXXXXXXXXXXXX",
  ],
};
export function svg(name, fill = "#000") {
  const m = MAPS[name];
  const h = m.length, w = m[0].length;
  let rects = "";
  m.forEach((row, y) => {
    let x = 0;
    while (x < w) {
      if (row[x] === "X") { let e = x; while (e < w && row[e] === "X") e++; rects += `M${x} ${y}h${e - x}v1h-${e - x}z`; x = e; } else x++;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" shape-rendering="crispEdges"><path fill="${fill}" d="${rects}"/></svg>`;
}
export function dataUri(name, fill) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg(name, fill)).replace(/%20/g, " ").replace(/%3D/g, "=").replace(/%3A/g, ":").replace(/%2F/g, "/").replace(/%22/g, "'")}")`;
}
export function dims(name) { return [MAPS[name][0].length, MAPS[name].length]; }
