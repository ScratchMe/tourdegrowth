// The board's states, as brief 07's "The states we need" lists them. Every
// screen draws in both languages and at both widths from the same
// components: board.html?screen=<id>&lang=en|fr&w=390|1280. `key` marks the
// key screens the brief wants in both languages; the others are drawn in both
// too.
export const SCREENS = [
  { id: "journey", group: "The journey", title: "Today and proposed, screens and decisions on each path", key: true },
  { id: "arrival", group: "First visit", title: "Arrival: the page, the promise, then the tool", key: true },
  { id: "setup", group: "First visit", title: "The start card: one question", key: true },
  { id: "number-untouched", group: "One number", title: "The first number reached, untouched", key: true },
  { id: "number-have", group: "One number", title: "“I have it” filled, with the shared-count hint", key: true },
  { id: "number-estimate", group: "One number", title: "“I can estimate it”" },
  { id: "number-ask", group: "One number", title: "“I'll ask for it”, the request copied" },
  { id: "number-cant", group: "One number", title: "“I can't find it”, the triage" },
  { id: "number-open", group: "One number", title: "The knowledge open: where, trap, reference", key: true },
  { id: "number-invalid", group: "One number", title: "A value that cannot be saved" },
  { id: "number-target", group: "The targets", title: "The target, asked on its number's screen", key: true },
  { id: "progress-middle", group: "Progress", title: "The middle: the quick numbers in, requests next" },
  { id: "asks", group: "Progress", title: "To ask for: every request in one step" },
  { id: "progress-last", group: "Progress", title: "The last number" },
  { id: "progress-end", group: "Progress", title: "The end: every number answered", key: true },
  { id: "whatif", group: "What if", title: "One lever, untouched" },
  { id: "whatif-moved", group: "What if", title: "One lever moved" },
  { id: "return-instant", group: "Return, self-serve", title: "The first instant, before the engine is read", key: true },
  { id: "return", group: "Return, self-serve", title: "Numbers left and a request pending (the brief's “returning”)", key: true },
  { id: "return-menu", group: "Return, self-serve", title: "The menu open: engines, month, file" },
  { id: "return-found", group: "Return, self-serve", title: "Everything found" },
  { id: "return-month", group: "Return, self-serve", title: "A new month to start" },
  { id: "return-past", group: "Return, self-serve", title: "A past month, read only" },
  { id: "return-refused", group: "Return, self-serve", title: "The browser refused to save" },
  { id: "return-hybrid", group: "Return, hybrid", title: "Two engines, one total", key: true },
  { id: "settings", group: "Settings", title: "Settings, with the window warning", key: true },
  { id: "compare", group: "Beside today", title: "One sheet beside today's 06, same width, same state", key: true },
];
