# Show HN — le moteur de croissance (lancement B)

*TODO: à relire. Compte HN `tourdegrowth`, jamais un compte personnel. Règle
de [Show HN](https://news.ycombinator.com/showhn.html) : ne demander à personne
de voter ni de commenter. Usage, pas règle : l'URL dans le champ URL, le champ
texte **vide**, l'histoire dans le premier commentaire ; rester
**trois heures** pour répondre. Mardi ou
mercredi, 14-16 h heure de Paris. C'est le premier des **deux** Show HN de ce
pseudonyme au plus (le jeu suit à trois semaines au minimum) : le Tour n'y
retourne pas (décision D1 du brief).*

## Avant de poster — les portiers, un par un

Chaque case se coche **dans le code livré et sur la production**, pas dans la
spécification. Une seule case vide et le post attend.

- [ ] `ENGINE_ENABLED` posé ; `/en/aarrr-funnel-template` et
      `/fr/aarrr-funnel-template` répondent 200 en production.
- [ ] `e2e/engine-canary.spec.ts` existe sur `main` et passe en CI — c'est la
      preuve de la phrase « nothing you type leaves your browser ». Relancée le
      jour même contre le build de production.
- [ ] `src/__tests__/engine-boundary.test.ts` existe et passe (aucun `fetch`,
      aucun import de `lib/gemini`, analytics en vocabulaire fermé).
- [ ] Export PDF, export PNG, copie du texte : essayés à la main dans Chrome
      **et** Safari. Si Safari rate le PNG, le premier commentaire le dit.
- [ ] Les événements `engine_*` apparaissent dans `/admin/stats` (sinon le
      lancement n'est pas lisible — brief §7).
- [ ] Le profil est bien « SaaS en libre-service » seulement ; si un autre
      profil a été livré entre-temps, corriger la section « Known limits ».
- [ ] Le crédit « tourdegrowth.com » en pied de slide est bien **activé par
      défaut et retirable** (décision 2 du 2026-09-24) — la FAQ l'affirme.

## Titre (≤ 80 caractères, en choisir un)

1. `Show HN: An AARRR funnel template that runs in your browser and exports a deck` (78) ← préféré : c'est la requête elle-même
2. `Show HN: A local-only growth funnel tool that won't guess your bottleneck` (73)

*Écarté* : « Put your funnel numbers in, get leadership slides out – nothing is
sent » (82 caractères, trop long).

**URL** : `https://www.tourdegrowth.com/en/aarrr-funnel-template?utm_source=hackernews&utm_campaign=launch_engine`

## Premier commentaire

> Every growth review I've sat through had the same problem: the numbers live in four tools, nobody agrees what "activation" means, and the slide ends up as a funnel drawn in PowerPoint with bars that don't mean anything.
>
> This is an AARRR funnel template that you fill with your own numbers and that runs entirely in your browser. Fifteen numbers, three per stage (acquisition, activation, retention, referral, revenue). It tells you where you lose the most people, turns every number you can't find into a finding with a repair cost, and exports a 4 to 7 slide deck for a leadership meeting — PDF, one PNG per slide, or plain text with speaker notes.
>
> A few decisions that might interest this crowd:
>
> - **Nothing you type leaves the browser.** No account, no server, no AI. There's an end-to-end test that seeds unique strings into every field, plays the whole flow, records every request the browser makes and fails if any of them carries one of those strings. Open the Network tab and check. The page does count visits and a closed list of event names (cookie-less GoatCounter) — never a number or a word you entered.
> - **You enter counts, not percentages.** Numerator and denominator, so the tool knows what the rate is a rate *of*. "12%" of what, over which month, is where most funnel debates die.
> - **No multiplied chain.** The main view follows 100 sign-ups: how many reach first value, how many are still active at day 30, how many pay — all on the same base. Multiplying rates measured on different populations produces a precise-looking number that nobody can defend.
> - **It won't name a leak without a reference.** A stage is only called "the leak" against a target you set, or against one of two published ranges it can cite, with the caveat printed on the slide. Otherwise it says it can't tell — and tells you what to measure first.
> - **Export without a server.** PDF is the browser's print (zero JavaScript); PNG loads a small library only when you click. The deck credits the site in its footer by default; it's your deck, so you can turn that off.
>
> Known limits, so you don't have to find them: v1 assumes a self-serve SaaS (freemium or trial); sales-led B2B, consumer apps and marketplaces aren't modelled yet. There's no PowerPoint export yet — a deck generated in the browser can't carry the display font, and a deck in a substitute font is worse than a PDF.
>
> It sits next to a 3-minute check-up that asks whether you *measure* each stage; this one asks what the numbers *say*. Code is open (AGPL): github.com/ScratchMe/tourdegrowth
>
> What I'd love feedback on: which of the fifteen numbers you couldn't find, and whether the deck would survive your own leadership meeting.

## FAQ — les objections probables, réponse prête

| Objection | Réponse |
|---|---|
| **"Why not just a spreadsheet?"** | A spreadsheet holds numbers; it doesn't know that your activation rate and your retention rate were measured on different populations, and it'll happily multiply them. This refuses to, tells you which number is missing, and turns the result into slides. If you'd rather keep a spreadsheet, the plain-text export is there for exactly that. |
| **"How do I know nothing is sent?"** | Network tab, first. Then the code: there's a test that plants unique strings in every field, plays the flow and fails if any request carries one; another forbids `fetch` and friends in the tool's folder. Both are in the repo. |
| **"But the page loads analytics."** | Yes: cookie-less GoatCounter, page views plus event names from a fixed list (opened, stage saved, deck opened, exported). No values, no labels you typed, no identifiers. The list is in the source. |
| **"Benchmarks are meaningless across companies."** | Agreed, which is why there are only two, each printed with its caveat, and the default comparison is a target *you* set. Most stages say "no publishable reference — set a target". |
| **"Why counts instead of rates?"** | Because a rate without its denominator can't be checked, and half of funnel arguments are two people using two denominators. |
| **"Your funnel math is naive."** | Tell me where. The one deliberate simplification is written on the slide itself: "all else equal, paying customers are assumed to come from activated users." The arithmetic behind every title is shown line by line. |
| **"No PowerPoint?"** | Not in v1. A PPTX generated in the browser can't carry the display font, and every hatch and dotted line would need redrawing as shapes. PNG per slide pastes into your own deck template, which is what most people do with a leadership deck anyway. |
| **"Only self-serve SaaS?"** | For now. The fifteen numbers and where to find them differ for sales-led B2B and marketplaces; I'd rather ship one profile that's right than four that are vague. |
| **"Is there AI in it?"** | No. Every sentence in the tool and on the slides is written in advance and chosen by rules; nothing is generated. |
| **"Business model?"** | It's free and there's no account system to sell you anything through. The deck credits the site by default, and you can remove that. |
| **"Who's behind this?"** | The site credits its author in the footer; I keep this account pseudonymous. |

## Après le post

- Répondre à **chaque** commentaire pendant trois heures, sans se défendre :
  « fair, noted » vaut mieux qu'un paragraphe.
- Si quelqu'un trouve une requête qui porte une donnée : c'est la seule
  critique qui arrête tout. Remercier, retirer le drapeau (`ENGINE_ENABLED`),
  corriger, le dire dans le fil.
- Noter ici les objections nouvelles : elles servent au post r/SaaS du jeudi.
- Relevé `stats.yml` le soir même (session), chiffres gardés hors du dépôt.
