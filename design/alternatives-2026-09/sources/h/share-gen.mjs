// Generates share/h-fr.html and share/h-en.html (1200×630) for direction H.
import { writeFileSync } from "node:fs";
const HERE = new URL("..", import.meta.url).pathname;
const NB = " ";
const scores = [18, 12, 8, 16, 20];
const stall = 2;
const f1 = (n) => n.toFixed(1);
const monotone = (xs, ys) => {
  const n = xs.length, d = [], m = new Array(n).fill(0);
  for (let i = 0; i < n - 1; i++) d[i] = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]);
  m[0] = d[0]; m[n - 1] = d[n - 2];
  for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
  return (x) => {
    let i = 0; while (i < n - 2 && x > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i], t = Math.min(1, Math.max(0, (x - xs[i]) / h)), t2 = t * t, t3 = t2 * t;
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1];
  };
};
function route(W, H, labels, flag) {
  const tp = 34, bp = 32;
  const y = (s) => tp + (1 - s / 20) * (H - tp - bp);
  const wx = scores.map((_, i) => (W * (i + 0.5)) / 5), wy = scores.map(y);
  const f = monotone([0, ...wx, W], [y(scores[0] - 6), ...wy, y(scores[4] - 4)]);
  const pts = []; for (let x = 0; x <= W; x += 2) pts.push([x, f(x)]);
  const poly = (a, dy = 0) => a.map(([x, v], i) => `${i ? "L" : "M"}${f1(x)} ${f1(v + dy)}`).join("");
  const base = H - bp;
  const relief = `${poly(pts)}L${W} ${base}L0 ${base}Z`;
  const b = [0, ...wx.slice(0, -1).map((x, i) => (x + wx[i + 1]) / 2), W];
  const seg = (i) => pts.filter(([x]) => x >= b[i] - 1 && x <= b[i + 1] + 1);
  let s = `<svg class="route" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg"><defs>
  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dff21b" stop-opacity=".16"/><stop offset=".5" stop-color="#dff21b" stop-opacity=".03"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
  <radialGradient id="o" gradientUnits="userSpaceOnUse" cx="${f1(wx[stall])}" cy="${f1(wy[stall])}" r="${f1(W / 5)}"><stop offset="0" stop-color="#f0a33a" stop-opacity=".3"/><stop offset=".6" stop-color="#f0a33a" stop-opacity=".07"/><stop offset="1" stop-color="#f0a33a" stop-opacity="0"/></radialGradient>
  <clipPath id="c"><path d="${relief}"/></clipPath></defs>`;
  s += `<path d="${relief}" fill="#0b0a09"/><path d="${relief}" fill="url(#g)"/><g clip-path="url(#c)">`;
  for (let k = 1; k <= 6; k++) s += `<path d="${poly(pts, k * 11)}" fill="none" stroke="#efe9df" stroke-opacity="${(0.08 - k * 0.01).toFixed(3)}"/>`;
  s += `<rect width="${W}" height="${H}" fill="url(#o)"/></g>`;
  s += `<line x1="0" x2="${W}" y1="${base + 0.5}" y2="${base + 0.5}" stroke="#efe9df" stroke-opacity=".18"/>`;
  wx.forEach((x, i) => { s += `<line x1="${f1(x)}" x2="${f1(x)}" y1="${f1(wy[i] + 9)}" y2="${base}" stroke="#efe9df" stroke-opacity=".22" stroke-dasharray="1 4"/>`; });
  s += `<path d="${poly(pts)}" fill="none" stroke="#dff21b" stroke-width="8" stroke-opacity=".16" style="filter:blur(4px)"/>`;
  for (let i = 0; i < 5; i++) s += i === stall
    ? `<path d="${poly(seg(i))}" fill="none" stroke="#f0a33a" stroke-width="3.4" stroke-linecap="round" stroke-dasharray="0.1 8"/>`
    : `<path d="${poly(seg(i))}" fill="none" stroke="#dff21b" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
  wx.forEach((x, i) => {
    if (i === stall) s += `<circle cx="${f1(x)}" cy="${f1(wy[i])}" r="14" fill="#f0a33a" fill-opacity=".16" stroke="#f0a33a" stroke-opacity=".5"/><circle cx="${f1(x)}" cy="${f1(wy[i])}" r="6.5" fill="#0e0d0c" stroke="#f0a33a" stroke-width="2.4"/>`;
    else s += `<circle cx="${f1(x)}" cy="${f1(wy[i])}" r="5.5" fill="#0e0d0c" stroke="#dff21b" stroke-width="2.2"/><circle cx="${f1(x)}" cy="${f1(wy[i])}" r="2.1" fill="#dff21b"/>`;
    s += `<text x="${f1(x)}" y="${H - 6}" text-anchor="middle" class="rl${i === stall ? " rl-s" : ""}">${labels[i]} <tspan class="rv">${scores[i]}/20</tspan></text>`;
  });
  s += `<line x1="${f1(wx[stall])}" x2="${f1(wx[stall])}" y1="${f1(wy[stall] - 26)}" y2="${f1(wy[stall] - 16)}" stroke="#f0a33a" stroke-opacity=".7"/>`;
  s += `<text x="${f1(wx[stall])}" y="${f1(wy[stall] - 32)}" text-anchor="middle" class="flag">${flag}</text>`;
  return s + `</svg>`;
}
const T = {
  fr: {
    lang: "fr", kicker: `DIAGNOSTIC AARRR — 3${NB}MIN`, score: "SCORE GROWTH GLOBAL",
    move: "PROCHAINE ACTION", stage: "RETENTION · 8/20", km: "Le prochain kilomètre",
    body: "Prends la cohorte de nouveaux utilisateurs d'un mois et compte combien sont encore actifs trente jours plus tard.",
    line1: "Retention est là où cette croissance cale.", line2: `Et la tienne${NB}?`,
    labels: ["ACQUISITION", "ACTIVATION", "RETENTION", "REFERRAL", "REVENUE"], flag: "ÇA CALE ICI",
  },
  en: {
    lang: "en", kicker: "AARRR CHECK-UP — 3 MIN", score: "OVERALL GROWTH SCORE",
    move: "NEXT MOVE", stage: "RETENTION · 8/20", km: "The next kilometre",
    body: "Take one month's cohort of new users and count how many are still active thirty days later.",
    line1: "Retention is where this growth stalls.", line2: "Where does yours?",
    labels: ["ACQUISITION", "ACTIVATION", "RETENTION", "REFERRAL", "REVENUE"], flag: "IT STALLS HERE",
  },
};
const sky = `radial-gradient(40% 120% at 78% 100%, rgba(255,184,92,.92) 0%, rgba(242,132,52,.55) 24%, rgba(170,70,30,.22) 50%, transparent 74%), radial-gradient(34% 90% at 14% 100%, rgba(240,150,60,.24), transparent 70%), linear-gradient(180deg, #0b0a0a 0%, #151013 34%, #351e17 74%, #653419 100%)`;
const crest = "M0 30C60 29 104 32 160 29S262 17 330 18S448 33 520 32S630 13 696 12S808 25 866 25S962 11 1016 10S1134 21 1186 21S1276 12 1316 12S1386 15 1440 15";
const skyMask = "M0 0H1440V15C1386 15 1356 12 1316 12S1238 21 1186 21S1070 9 1016 10S924 25 866 25S762 11 696 12S592 32 520 32S398 17 330 18S216 29 160 29S60 32 0 30z";
for (const k of ["fr", "en"]) {
  const t = T[k];
  const html = `<!doctype html>
<html lang="${t.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1200">
<title>Tour de Growth — ${t.lang.toUpperCase()}</title>
<link rel="stylesheet" href="/fonts.css">
<style>
  :root { --night:#0e0d0c; --card:#151311; --cream:#efe9df; --grey:#a39a8c; --lime:#dff21b; --orange:#f0a33a; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 1200px; height: 630px; overflow: hidden; background: var(--night); }
  body { position: relative; color: var(--cream); font-family: "Inter", sans-serif; -webkit-font-smoothing: antialiased;
    background: radial-gradient(60% 70% at 78% 18%, rgba(240,163,58,.10), transparent 70%), var(--night); }
  .sky { position: absolute; inset: 0 0 auto; height: 136px; background: ${sky};
    -webkit-mask: linear-gradient(#000,#000) 0 0/100% 97px no-repeat, url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 40' preserveAspectRatio='none'%3E%3Cpath d='${skyMask}'/%3E%3C/svg%3E") 0 96px/100% 40px no-repeat; }
  .crest { position: absolute; left: 0; right: 0; top: 96px; height: 40px;
    background: linear-gradient(90deg, rgba(223,242,27,.2), rgba(223,242,27,.95) 20%, rgba(223,242,27,.8) 60%, rgba(223,242,27,.15));
    -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 40' preserveAspectRatio='none'%3E%3Cpath d='${crest}' fill='none' stroke='%23000' stroke-width='2' vector-effect='non-scaling-stroke'/%3E%3C/svg%3E") 0 0/100% 100% no-repeat; }
  .top { position: absolute; left: 64px; right: 64px; top: 34px; display: flex; justify-content: space-between; align-items: center; }
  .wordmark { font: 400 38px/1 "Newsreader", serif; letter-spacing: -.01em; color: var(--cream); display: flex; align-items: baseline; gap: 10px; }
  .wordmark em { font-weight: 300; }
  .wordmark i { width: 9px; height: 9px; border-radius: 50%; background: var(--lime); box-shadow: 0 0 14px rgba(223,242,27,.9); display: inline-block; margin-left: 2px; transform: translateY(-4px); }
  .kicker { font: 500 15px/1 "JetBrains Mono", monospace; letter-spacing: .14em; color: var(--cream); padding: 11px 18px; border: 1px solid rgba(239,233,223,.38); border-radius: 999px; background: rgba(11,10,10,.72); }
  .label { font: 500 14px/1 "JetBrains Mono", monospace; letter-spacing: .16em; color: var(--grey); }
  .left { position: absolute; left: 64px; top: 160px; width: 480px; }
  .num { display: flex; align-items: baseline; margin-top: 58px; }
  .num b { font: 300 196px/.62 "Newsreader", serif; letter-spacing: -.05em; color: var(--cream); }
  .num span { font: 400 28px/1 "JetBrains Mono", monospace; color: var(--grey); margin-left: 16px; }
  .route { position: absolute; left: 64px; top: 390px; overflow: visible; }
  .rl { font: 500 12.5px/1 "JetBrains Mono", monospace; letter-spacing: .1em; fill: var(--grey); }
  .rl .rv { fill: var(--cream); }
  .rl-s, .rl-s .rv { fill: var(--orange); }
  .flag { font: 600 12px/1 "JetBrains Mono", monospace; letter-spacing: .14em; fill: var(--orange); }
  .card { position: absolute; left: 592px; right: 64px; top: 158px; height: 232px; border-radius: 22px; padding: 26px 32px;
    border: 1px solid rgba(223,242,27,.42); background: linear-gradient(100deg, rgba(223,242,27,.08), rgba(223,242,27,0) 60%), var(--card); }
  .kmrow { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
  .kmrow svg { width: 24px; height: 33px; flex: none; }
  .km { font: 300 30px/1 "Newsreader", serif; font-style: italic; letter-spacing: -.015em; }
  .eyebrow { display: flex; justify-content: space-between; font: 500 13px/1 "JetBrains Mono", monospace; letter-spacing: .14em; margin-bottom: 14px; }
  .eyebrow .m { color: var(--lime); }
  .eyebrow .s { color: var(--grey); }
  .body { font: 400 22px/1.42 "Inter", sans-serif; letter-spacing: -.008em; color: var(--cream); text-wrap: pretty; }
  .bottom { position: absolute; left: 64px; right: 64px; bottom: 40px; display: flex; justify-content: space-between; align-items: center; gap: 24px; }
  .line { font: 300 31px/1.1 "Newsreader", serif; letter-spacing: -.01em; }
  .line em { color: var(--grey); }
  .url { font: 600 18px/1 "JetBrains Mono", monospace; letter-spacing: .02em; color: var(--night); background: var(--lime); border-radius: 999px; padding: 14px 22px; white-space: nowrap; box-shadow: 0 16px 36px -14px rgba(223,242,27,.6); }
</style>
</head>
<body>
  <div class="sky"></div><div class="crest"></div>
  <div class="top">
    <div class="wordmark">Tour de <em>Growth</em><i></i></div>
    <div class="kicker">${t.kicker}</div>
  </div>
  <div class="left">
    <div class="label">${t.score}</div>
    <div class="num"><b>74</b><span>/100</span></div>
  </div>
  ${route(1072, 142, t.labels, t.flag)}
  <div class="card">
    <div class="kmrow"><svg viewBox="0 0 46 64"><path d="M4.5 63.5V23a18.5 18.5 0 0 1 37 0v40.5z" fill="rgba(239,233,223,.06)" stroke="rgba(239,233,223,.6)" stroke-width="2"/><path d="M5.3 22.5a17.7 17.7 0 0 1 35.4 0z" fill="#dff21b"/><path d="M15 46h16" stroke="#dff21b" stroke-width="2.4"/></svg><span class="km">${t.km}</span></div>
    <div class="eyebrow"><span class="m">${t.move}</span><span class="s">${t.stage}</span></div>
    <p class="body">${t.body}</p>
  </div>
  <div class="bottom">
    <p class="line">${t.line1} <em>${t.line2}</em></p>
    <span class="url">tourdegrowth.com</span>
  </div>
</body>
</html>
`;
  writeFileSync(`${HERE}share/h-${k}.html`, html);
  console.log("wrote", k);
}
