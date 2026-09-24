# Indie Hackers — page produit et post « build log »

*TODO: à relire. Compte `tourdegrowth`. IH lit des logs de construction,
pas des pitchs ; le dépôt public est l'atout : tout ce qui est dit est
vérifiable.*

**Lien** : `https://www.tourdegrowth.com/en?utm_source=indiehackers&utm_campaign=launch_week`

## Page produit

- **Nom** : Tour de Growth
- **Tagline** : A 3-minute AARRR growth check-up, with a roast mode.
- **Description** : la version 300 de `kit.md`.
- **Revenue** : $0 — free tool, no plan to charge (dire-le : IH respecte un side project assumé).
- **Captures** : `01-landing-en-desktop`, `04-result-en-desktop`, `03-tone-en-desktop`, `og-r-sample`.

## Post

**Titre** : `Built a free growth check-up. Shipping it taught me my own K-factor couldn't go below 1.`

> Tour de Growth is a 3-minute AARRR check-up (15 questions → score out of 100 → your weak stage → one next move), free, no sign-up, open source. This is the build log — three things that were more interesting than the product itself.
>
> **1. My K-factor was mathematically flattering.** The first version divided referred sign-ups by "unique sharers" — but the only sharers Firestore could see were the ones who had *already converted someone*. Every result in the denominator contributed at least one to the numerator, so K ≥ 1 by construction. A single user retaking the Tour three times produced K = 3.00. Now: referred ÷ all results, first-touch, self-referrals excluded. Honest K is lower and worth more.
>
> **2. The free result stopped calling the LLM — and got better.** The quick result used to ask Gemini for a verdict. Replacing it with a library of 62 pre-written verdicts (a headline and a per-stage sentence for every stage × score band × tone, plus one for a board where nothing is behind) made it instant, deterministic, and — after enumerating all 59,049 reachable score boards — provably non-contradictory with the card above it. The roast is part of that library. The LLM now only writes the optional deep dive.
>
> **3. The share loop is the product.** Every result has its own share image (score, weak stage, next move on the image), the shared link renders in the *reader's* language, and the visitor's primary CTA is "take your own Tour" with a referral tag. A shared result with no reason to click is a dead end; the next move is the reason.
>
> Numbers so far are small and I'd rather not dress them up. What I'm watching: Tours *shared* per Tour created, not traffic.
>
> Code: github.com/ScratchMe/tourdegrowth · Try it: [link]
>
> Happy to answer anything about the scoring, the fallback chain, or why AGPL.
