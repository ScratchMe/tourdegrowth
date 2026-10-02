// The pages and windows brief 08 asks the header to be drawn on. Each page
// passes SiteHeader what it passes today: its column, its space, whether its
// race is linked, and its own right-hand side (board.js, rightSide()).
export const PAGES = [
  { id: "landing", title: "The landing", space: "tour", width: "wide", path: "/" },
  { id: "result", title: "The result (both state tags)", space: "tour", width: "wide", path: "/r/demo" },
  { id: "quiz", title: "The quiz", space: "tour", width: "narrow", bandLinked: false, linkedBrand: false, path: "/quiz" },
  { id: "deepdive", title: "The Deep dive", space: "tour", width: "narrow", bandLinked: false, linkedBrand: false, path: "/deep-dive" },
  { id: "engine", title: "The engine (with its « Et si » figures)", space: "engine", width: "wide", path: "/aarrr-funnel-template" },
  { id: "game", title: "The game's hub", space: "game", width: "reading", path: "/game" },
  { id: "reading", title: "A reading page (glossary, no band)", width: "reading", path: "/glossary/cac" },
];

export const WINDOWS = [
  { w: 1280, h: 720, label: "1280 × 720 · a laptop" },
  { w: 1440, h: 900, label: "1440 × 900" },
  { w: 844, h: 390, label: "844 × 390 · a phone held sideways" },
  { w: 390, h: 844, label: "390 × 844 · a phone held upright (unchanged)" },
];
