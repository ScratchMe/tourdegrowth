(() => {
  const html = document.documentElement;
  const fr = (html.lang || "fr").startsWith("fr");
  const space = html.dataset.space;
  const BIBS = {
    tour: { n: "1", fr: "Le Tour", en: "The Tour" },
    moteur: { n: "2", fr: "Le moteur", en: "The engine" },
    jeu: { n: "3", fr: "Le côté obscur", en: "The dark side" },
  };
  // The space's bib, pinned next to the wordmark.
  const mark = document.querySelector("header .WordmarkLink--link, header .Wordmark--wordmark, .WordmarkLink--link");
  if (mark && !document.querySelector(".i-bib")) {
    const b = BIBS[space] ?? BIBS.tour;
    const bib = document.createElement("span");
    bib.className = "i-bib";
    bib.dataset.space = space;
    bib.setAttribute("aria-hidden", "true");
    bib.innerHTML = `<span class="i-bib-n">№ ${b.n}</span><span class="i-bib-l">${fr ? b.fr : b.en}</span>`;
    const row = document.createElement("span");
    row.className = "i-markrow";
    mark.parentElement.insertBefore(row, mark);
    row.append(mark, bib);
  }
  // Pillar chips carry a tiny meter: the score read from their own text (« 18/20 »).
  for (const chip of document.querySelectorAll(".PillarChip--chip")) {
    const m = chip.textContent.match(/(\d+)\s*\/\s*20/);
    if (m) chip.style.setProperty("--i-pct", `${(Number(m[1]) / 20) * 100}%`);
  }
  // Landing: the three stages of one Tour, as three bibs.
  const main = document.querySelector(".page--main");
  const hero = document.querySelector(".page--hero");
  if (space === "tour" && main && hero && !document.querySelector(".i-stages")) {
    const t = fr
      ? { kicker: "Un Tour, trois étapes", s: [
          ["1", "Le Tour", "15 questions, 3 minutes. Ton score, l'étape qui freine, une action.", "Maintenant"],
          ["2", "Le moteur", "Tes 17 vrais chiffres, là où ton funnel perd du monde, et des slides pour ton CODIR.", "Ensuite"],
          ["3", "Le côté obscur", "Cinq étapes, cinq entreprises, un DG qui veut le chiffre. Apprends à reconnaître les astuces avant d'en livrer une.", "Pour finir"],
        ] }
      : { kicker: "One Tour, three stages", s: [
          ["1", "The Tour", "15 questions, 3 minutes. Your score, the stage that stalls, one action.", "Now"],
          ["2", "The engine", "Your 17 real numbers, where your funnel leaks, and slides for your leadership meeting.", "Next"],
          ["3", "The dark side", "Five stages, five companies, one CEO who wants the number. Learn to spot the tricks before you ship one.", "Last"],
        ] };
    const sec = document.createElement("section");
    sec.className = "i-stages";
    sec.innerHTML = `<p class="i-kicker">${t.kicker}</p><div class="i-stage-grid">${t.s
      .map(([n, name, text, when], k) => `<article class="i-stage" data-k="${k}"><header><span class="i-stage-bib">№ ${n}</span><span class="i-stage-when">${when}</span></header><h3>${name}</h3><p>${text}</p></article>`)
      .join("")}</div>`;
    hero.insertAdjacentElement("afterend", sec);
  }
})();
