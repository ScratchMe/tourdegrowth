// How the engine prints money, months and ratios — the house rules, so
// every screen and slide prints a figure the same way. Board only (the app
// has its formatters); the rules are the brief's:
//
// - every projected or estimated amount at TWO significant digits, with
//   "~" (~€80,000, not €80,212); a fact (MRR typed, ARR = MRR × 12, a CAC
//   typed, this month's spend) to the unit;
// - a pair "today → with the what-ifs" gains a digit only when the
//   difference would otherwise vanish (`pair`);
// - French: the euro after the figure, figures grouped by a narrow no-break
//   space (48 000 €); English: €48,000;
// - a range prints "€1,500–2,300" / "1 500 à 2 300 €";
// - an unknown prints "?" (never 0).

export const NNBSP = " ";
const MINUS = "−";

export const sig = (n, digits = 2) => {
  if (n === 0) return 0;
  const p = Math.floor(Math.log10(Math.abs(n))) + 1 - digits;
  const f = 10 ** p;
  return Math.round(n / f) * f;
};

const group = (n, lang) => {
  const s = Math.round(Math.abs(n)).toString();
  const g = s.replace(/\B(?=(\d{3})+(?!\d))/g, lang === "fr" ? NNBSP : ",");
  return g;
};

const decimal = (n, d, lang) => {
  const s = n.toFixed(d);
  return lang === "fr" ? s.replace(".", ",") : s;
};

const isRange = (r) => Array.isArray(r) && Math.abs(r[0] - r[1]) > 1e-9;
const mid = (r) => (Array.isArray(r) ? r[0] : r);

/** An amount in euros. `approx`: two significant digits and "~". */
export const eur = (r, lang, { approx = false, digits = 2, sign = false } = {}) => {
  if (r == null) return "?";
  const one = (n) => (approx ? sig(n, digits) : n);
  const signOf = (n) => (sign ? (n < 0 ? MINUS : "+") : n < 0 ? MINUS : "");
  const tilde = approx ? "~" : "";
  if (isRange(r)) {
    const [a, b] = [one(r[0]), one(r[1])];
    // As the live build prints a range (brief 10's screenshots 04 and 07):
    // "~430 000 € à 440 000 €", "~€430,000–€440,000".
    if (lang === "fr") return `${signOf(a)}${tilde}${group(a, lang)}${NNBSP}€ à ${signOf(b) === MINUS ? MINUS : ""}${group(b, lang)}${NNBSP}€`;
    return `${signOf(a)}${tilde}€${group(a, lang)}–${signOf(b) === MINUS ? MINUS : ""}€${group(b, lang)}`;
  }
  const n = one(mid(r));
  return lang === "fr" ? `${signOf(n)}${tilde}${group(n, lang)}${NNBSP}€` : `${signOf(n)}${tilde}€${group(n, lang)}`;
};

/**
 * A pair today → with the what-ifs, at two significant digits, or three
 * when two would print the same figure for different values.
 */
export const pair = (today, whatif, lang) => {
  for (const d of [2, 3, 4]) {
    const a = eur(today, lang, { approx: true, digits: d });
    const b = eur(whatif, lang, { approx: true, digits: d });
    const same = Math.abs(mid(today) - mid(whatif)) < 1e-6;
    if (a !== b || same) return [a, b];
  }
  return [eur(today, lang), eur(whatif, lang)];
};

export const months = (r, lang, { approx = false } = {}) => {
  if (r == null) return "?";
  const word = (n) => (lang === "fr" ? "mois" : Math.round(n) === 1 ? "month" : "months");
  if (isRange(r)) {
    const a = Math.round(r[0]);
    const b = Math.round(r[1]);
    return lang === "fr" ? `${a} à ${b} mois` : `${a}–${b} months`;
  }
  const n = Math.round(mid(r));
  return `${approx ? "~" : ""}${n} ${word(n)}`;
};

export const pct = (x, lang, d = 0) => {
  if (x == null) return "?";
  if (isRange(x)) {
    const [a, b] = [decimal(x[0] * 100, d, lang), decimal(x[1] * 100, d, lang)];
    return lang === "fr" ? `${a} à ${b}${NNBSP}%` : `${a}–${b}%`;
  }
  const s = decimal(mid(x) * 100, d, lang);
  return lang === "fr" ? `${s}${NNBSP}%` : `${s}%`;
};

export const ratio = (r, lang) => {
  if (r == null) return "?";
  if (isRange(r)) return lang === "fr" ? `${decimal(r[0], 2, lang)} à ${decimal(r[1], 2, lang)}` : `${decimal(r[0], 2, lang)}–${decimal(r[1], 2, lang)}`;
  return decimal(mid(r), 2, lang);
};

export const count = (n, lang) => group(n, lang);

/** A small amount to the cent: "€2.34" / "2,34 €" (what one active buyer brings). */
export const cents = (n, lang) => (lang === "fr" ? `${decimal(n, 2, lang)}${NNBSP}€` : `€${decimal(n, 2, lang)}`);

/** A number with decimals: "0.25" / "0,25". */
export const dec = (n, lang, d = 2) => decimal(n, d, lang);

/** "+€42,000" / "+42 000 €" — a change, signed, at two significant digits. */
export const change = (n, lang) => eur(n, lang, { approx: false, sign: true }).replace("~", "");
export const changeApprox = (n, lang) => {
  const v = sig(n, 2);
  return lang === "fr" ? `${v < 0 ? MINUS : "+"}${group(v, lang)}${NNBSP}€` : `${v < 0 ? MINUS : "+"}€${group(v, lang)}`;
};

export const MONTH_NAMES = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  fr: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
};

/** "Aug 2026" / "août 2026", `offset` months after August 2026. */
export const monthLabel = (offset, lang, start = { y: 2026, m: 7 }) => {
  const t = start.m + offset;
  const y = start.y + Math.floor(t / 12);
  return `${MONTH_NAMES[lang][((t % 12) + 12) % 12]} ${y}`;
};
