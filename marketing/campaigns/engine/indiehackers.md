# Indie Hackers — build log du moteur de croissance (lancement B)

*TODO: à relire. Compte `tourdegrowth`. IH lit des récits de construction, pas
des pitchs. Vendredi de la semaine B, après le Show HN : on peut y raconter ce
que HN a appris. Portiers de `show-hn.md` cochés avant.*

**Lien** : `https://www.tourdegrowth.com/en/aarrr-funnel-template?utm_source=indiehackers&utm_campaign=launch_engine`

## Mise à jour de la page produit

Ajouter à la page produit existante (celle du Tour, créée à la vague 1) une
ligne dans la description : « Also: a free, local-only AARRR funnel template
that exports a leadership deck. » — pas une seconde page produit : c'est le
même site.

## Post

**Titre** : `Building a funnel tool with no backend taught me that most funnel slides can't be defended`

> I run a free 3-minute growth check-up (15 questions, a score, the one stage holding you back). The obvious next step was letting people put their *real* numbers in. The constraint I set: those numbers never leave the browser — they belong to someone's employer. No account, no server, no AI. Here's what that constraint did to the design.
>
> **1. The first prototype drew a funnel with bars proportional to counts.** 12,400 visitors down to 49 customers doesn't fit on any linear scale, so the bars were decoration pretending to be data. It went. The main visual now follows **100 sign-ups** — how many reach first value, how many are still there at day 30, how many pay — all on the same base, drawn as dots. No chained percentages, because rates measured on different populations don't multiply into anything honest.
>
> **2. "Where's the leak?" turned out to be the hard question.** An early mock called 24% activation a leak — while 24% sits *inside* the commonly cited 20-40% range it was comparing against. Rule now: a value inside its reference is never a leak against that reference, and a stage is only named against a target you set or one of two published ranges, printed with its caveat. Otherwise the tool says so.
>
> **3. The best slide is often "we can't see this yet".** If day-30 retention isn't measured, the honest deck says "in between, we see nothing" and asks for the budget to measure it before deciding where to invest. Missing numbers get a repair cost and a slide of their own.
>
> **4. The title and the body of a slide must come from the same object.** An early mock had "+2-3k€" in the title and "+1,400-2,600€" in the body. Both are now formatted by one function from one computed range, with a test.
>
> **5. Proving "nothing leaves the browser" is a test, not a sentence.** An end-to-end test plants unique strings in every field, plays the whole flow, records every network request and fails if any carries one. A static check forbids `fetch` and friends in the tool's folder.
>
> Export is the browser's print for PDF (no JS at all) and a ~7 KB library loaded on click for PNG. No PPTX yet: the display font can't be embedded, and a deck in the wrong font looks worse than a PDF.
>
> Revenue: $0, no account system. The deck credits the site in its footer by default; you can switch it off.
>
> Code: github.com/ScratchMe/tourdegrowth · Try it: [link]
>
> What I'd like to hear: which of the fifteen numbers you couldn't find in your own tools.

*Notes pour la relecture* : les points 1, 2 et 4 sont des défauts réellement
vus dans les maquettes des trois conceptions du moteur (spec, §1, tableau
« défauts vus dans les maquettes ») — vrais, et racontables. Le « ~7 KB » est
la mesure de la spec (`html-to-image` 1.11.13, 6,7 Ko gzip) : **revérifier sur
le build livré** avant de le laisser.
