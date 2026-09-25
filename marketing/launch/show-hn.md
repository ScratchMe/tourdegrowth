# Show HN

*TODO: à relire. Posté depuis le compte HN `tourdegrowth`, jamais un compte
personnel. Règles ([news.ycombinator.com/showhn.html](https://news.ycombinator.com/showhn.html)) :
l'URL dans le champ URL, le champ texte **vide**, l'histoire dans le premier
commentaire ; être là **trois heures** pour répondre ; ne demander d'upvote à
personne. Un seul essai propre — pas de second Show HN sans refonte majeure.
Jour : mardi à jeudi, 14h-16h heure de Paris (matin côte Est).*

## Titre (≤ 80 caractères — choisir un)

1. `Show HN: A 3-minute AARRR growth check-up with a deterministic score` (68) ← préféré
2. `Show HN: Where does your growth stall? 15 questions, a score, one next move` (75)
3. `Show HN: An open-source growth check-up where no model ever touches the score` (77)

**URL** : `https://www.tourdegrowth.com/en?utm_source=hackernews&utm_campaign=launch_week`

## Premier commentaire

> I built this because I kept seeing the same thing in early-stage products: growth rarely stalls everywhere at once. It stalls at one stage — usually retention or activation — and the four stages that work keep hiding it, because the dashboards everyone looks at are acquisition dashboards.
>
> Tour de Growth is a 3-minute check-up on the AARRR framework (Acquisition, Activation, Retention, Referral, Revenue). Fifteen questions, three honest answers each ("yes, tracked" / "roughly" / "no idea"), a score out of 100, the one stage holding you back, and one next move written for the answer you actually gave.
>
> A few decisions that might interest this crowd:
>
> - **The score is deterministic.** 20/7/0 points per answer, rounded per stage before summing. No model decides a number. The result page shows the full arithmetic, because a score you'll share has to be re-explainable in ten seconds.
> - **The LLM only writes the optional deep dive.** The quick result, roast included, is a library of pre-written verdicts (62 of them: a headline and a per-stage sentence for every stage × score band × tone, plus one for a board where nothing is behind), served with zero network calls. For the deep dive, Gemini is behind a four-model fallback chain with a hard timeout, and the anti-mockery guardrail is in the system prompt, not left to the model's mood.
> - **Two tones, your choice.** "Straight up", or "roast me" — the roast goes after the strategy, never the person.
> - **The shared result renders in the reader's language**, not the author's (EN/FR), and the share image carries the score, the weak stage and the next move.
> - **No account, no email.** Cookie-less analytics (GoatCounter). Answers only leave the browser to compute the score. It's open source (AGPL) if you want to read exactly what happens: github.com/ScratchMe/tourdegrowth
>
> Known limits, so you don't have to find them: it's self-reported, so it measures whether you *know* your numbers, not the numbers themselves — that's on purpose, and it's why the questions are about practices ("do you track a retention rate?") rather than values. The sample size is small, so there's no benchmark yet; I'd rather show nothing than a fake percentile.
>
> What I'd love feedback on: the fifteen questions themselves (are any of them the wrong question for your kind of product?), and whether the "one next move" is actually actionable or just plausible-sounding.

## FAQ — les dix objections probables, avec la réponse prête

| Objection | Réponse |
|---|---|
| **"It's just a quiz."** | Yes — deliberately. The insight isn't in the questions, it's in the scoring rule and the "one stage, one move" output. A quiz you can finish is worth more than an audit you never start. |
| **"Self-reported answers are worthless."** | They measure practice maturity, not performance — whether you *know* your CAC, not what it is. That's the honest scope of a 3-minute tool, and it's stated on the result page ("a quick estimate, not an audit"). |
| **"Why not ask for the actual numbers?"** | Because three churn definitions coexist on the same month in our own glossary. Aggregating free-typed numbers would measure definitions, not performance. Practices are comparable; numbers without definitions aren't. |
| **"The roast is a gimmick."** | It's opt-in, off by default, and constrained by a rule: it goes after the strategy, never the person — hard-coded in the prompt for the deep dive, and enforced by review in the pre-written verdicts. It exists because a sharp verdict gets shared and a polite one gets closed — and sharing is how a free tool survives. |
| **"Why is an LLM in there at all?"** | Only in the optional deep dive, the one place where the prose has to be specific to *your* business. The roast in the free result is pre-written, like the rest of it. Everything that produces a number is deterministic and tested. |
| **"Privacy?"** | No account, no email, no cookies. Fifteen answers go to the server to compute and store the score behind an unguessable id; the free-text field of the deep dive is sent to the model and not stored. Legal pages spell it out. |
| **"Why AGPL?"** | The only scenario that would cost anything is someone deploying a copy as a service; AGPL covers exactly that and bothers nobody who just wants to read the code. |
| **"Why Gemini?"** | Price/latency for short generations, and a documented fallback alias. The client is provider-agnostic in shape; swapping is a small PR. |
| **"Can't people game the score?"** | Sure — it's their own score. Nothing is ranked publicly. The only thing that would be gamed is the benchmark, which is why it's gated behind a minimum volume. |
| **"Who's behind this?"** | The site credits its author in the footer; I keep this account pseudonymous. *(Antoine : c'est la seule réponse honnête sous l'option A. Si tu préfères ne pas la donner du tout, remplacer par « a growth PM working on it as a side project ».)* |

## Après le post

- Répondre à **chaque** commentaire pendant trois heures, y compris les négatifs, sans se défendre : « fair, noted » vaut mieux qu'un paragraphe.
- Noter les objections nouvelles ici, dans cette table — elles servent aux posts Reddit du lendemain.
- Lire `/admin/stats` le soir même : Tours créés, Tours **partagés**, `take_own_tour`.
