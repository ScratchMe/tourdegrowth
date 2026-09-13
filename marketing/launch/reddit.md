# Reddit — un post par subreddit

*TODO: à relire. Compte `tourdegrowth`, créé en semaine 1, qui a **commenté
sans lien pendant une à deux semaines** avant de poster quoi que ce soit —
un compte de trois jours sans karma qui poste un lien est supprimé avant
d'être lu. Un seul compte : r/SaaS compte les alternatifs comme un seul
acteur. Jamais le même texte deux fois : plusieurs modérateurs suppriment à
vue. Rendre des retours à cinq autres projets le jour du post, dans chaque
sub qui le demande.*

Règles vérifiées le 2026-09-13 : [r/SaaS](https://www.redditmaster.com/subreddit-rules/saas)
(une autopromotion par 60 jours depuis avril 2026, posts + commentaires +
mentions), [r/startups](https://www.redditmaster.com/subreddit-rules/startups)
(fils hebdomadaires uniquement), [r/SideProject](https://www.growreddit.com/blog/reddit-self-promotion-rules-sideproject)
(voulu, mais montrer le produit et rendre des retours), [liste des subs qui
acceptent un lancement](https://redship.io/blog/reddit-self-promotion-rules).
Relire les règles **dans le sub** le jour même : elles bougent.

---

## r/roastmystartup — le premier, parce que c'est notre format

**Lien** : `https://www.tourdegrowth.com/en?utm_source=reddit_roastmystartup&utm_campaign=launch_week`
**Visuel** : la carte de partage **roast** du vrai résultat de Tour de Growth passé à son propre Tour (à générer le jour même : faire le Tour honnêtement, ton roast, enregistrer l'image depuis la carte de partage). À défaut, `assets/05-preview-card-roast-en.png`.

**Titre** : `We built a growth check-up with a roast mode, so we ran it on ourselves first. 74/100, retention is "freewheeling".`

**Corps** :

> Tour de Growth is a free 3-minute AARRR check-up: 15 questions, a score out of 100, the one stage holding you back, one next move. It has a roast mode. It seemed dishonest to ship a roast mode without eating it first, so here's our own card.
>
> The roast is fair. Our retention is the weak stage — people take the Tour once, share it, and there's no reason to come back for three months. The "next move" it gave us is the one we're actually doing next.
>
> Now roast the tool itself: the questions, the score, the tone. What would make you *not* share your card?
>
> [link]

---

## r/SideProject

**Lien** : `https://www.tourdegrowth.com/en?utm_source=reddit_sideproject&utm_campaign=launch_week`
**Visuel** : `assets/01-landing-en-desktop.png` ou `assets/04-result-en-desktop.png`.

**Titre** : `I built a 3-minute AARRR growth check-up that gives you a score, your weak stage, and one next move (free, no sign-up, open source)`

**Corps** :

> **What it is**: 15 questions about how your product acquires, activates, retains, refers and monetises — three honest answers each. You get a score out of 100, the stage holding you back, and one concrete next move written for the answer you gave. Two tones: straight up, or roast.
>
> **Why**: growth rarely stalls everywhere at once. It stalls at one stage and the four that work hide it. I wanted something a founder finishes in three minutes and can argue with.
>
> **Stack**: Next.js 16, TypeScript, CSS Modules on design tokens, Firestore, Gemini behind a 4-model fallback (only for the roast + the optional deep dive — the score itself is deterministic and tested), GoatCounter for cookie-less analytics, Vercel. Open source, AGPL: github.com/ScratchMe/tourdegrowth
>
> **What I'd like feedback on**: whether the 15 questions fit *your* kind of product (B2C? marketplace?), and whether the next move is actually useful or just sounds good.
>
> [link]

---

## r/IMadeThis

**Lien** : `https://www.tourdegrowth.com/en?utm_source=reddit_imadethis&utm_campaign=launch_week`

**Titre** : `Made a "where does your growth stall?" check-up — 15 questions, a deterministic score, and a roast mode with a hard-coded anti-mockery rule`

**Corps** : la version courte du post r/SideProject (les deux premiers paragraphes + le lien), plus une phrase sur le garde-fou : « the roast goes after the strategy, never the person — that's in the system prompt, not left to the model ».

---

## r/startups — fil « Feedback Friday » uniquement

**Lien** : `https://www.tourdegrowth.com/en?utm_source=reddit_startups&utm_campaign=launch_week`

> **Tour de Growth** — a free 3-minute AARRR check-up: 15 questions, a score out of 100, your weak stage, one next move. No sign-up. Looking for feedback on the questions (do they fit your model?) and on whether the result is something you'd actually share with a co-founder. [link]

Court : c'est un commentaire dans un fil, pas un post. Répondre à trois autres projets du fil avant de poster le sien.

---

## r/SaaS — une seule fois, les 60 jours suivants sont brûlés

**Lien** : `https://www.tourdegrowth.com/en?utm_source=reddit_saas&utm_campaign=launch_week`

Le sub tolère le produit **en arrière-plan d'une décision technique racontée**, pas en titre. Le texte doit être le meilleur des cinq.

**Titre** : `Why we made the growth score deterministic and let the LLM write only the roast`

**Corps** :

> We shipped a small free tool (an AARRR growth check-up) and made one decision early that shaped everything: **no model ever decides a number.**
>
> The score is 15 questions × fixed points (20/7/0), rounded per stage, summed. Boring on purpose. A score you'll share has to be re-explainable in ten seconds, and "the AI said 74" isn't an explanation. The result page shows the arithmetic.
>
> What the LLM *does* write: the roast tone (opt-in), and an optional deep dive with per-stage recommendations. Two things we learned running it in production:
>
> 1. **Truncated responses look like valid ones.** Our extractor checked `finishReason` only when the text was empty. A response cut at `MAX_TOKENS` still carries the partial text, so it sailed through and blew up three frames later in `JSON.parse`. Check the finish reason *before* the text.
> 2. **A fallback chain without backoff protects against "this model is down", not "the API is overloaded for two seconds."** Four models failed in under a second, together. Exponential backoff with full jitter fixed it — jitter matters when you fire four generations in parallel.
>
> The tool is free and open source (AGPL) if you want to see the fallback client or the scoring engine: [link] · github.com/ScratchMe/tourdegrowth
>
> Curious how others draw the line between "deterministic" and "generated" in products that show a number.

---

## r/growthhacking

**Lien** : `https://www.tourdegrowth.com/en?utm_source=reddit_growthhacking&utm_campaign=launch_week`

**Titre** : `Free AARRR self-check: 15 practice questions, one weak stage, one next move — would you change any of the questions?`

**Corps** : lister les 15 questions **dans le post** (elles sont publiques, et c'est ce qui rend le post lisible sans cliquer), puis : « Score is deterministic, the roast is optional, no sign-up. Which question would you replace, and by what? » + lien. Ce sub aime débattre du contenu, pas de l'outil.

---

## r/Entrepreneur

**Lien** : `https://www.tourdegrowth.com/en?utm_source=reddit_entrepreneur&utm_campaign=launch_week`

Vérifier le jour même si le sub exige le fil hebdomadaire. Si post autonome permis : la version r/SideProject sans le paragraphe « Stack », avec un titre côté problème : `Growth rarely stalls everywhere at once — a free 3-minute way to find the one stage that's stalling yours`.

---

## Après chaque post

- Répondre à tout dans l'heure, remercier les critiques, corriger ce qui est corrigeable (et le dire dans le fil quand c'est fait — c'est le meilleur second post possible).
- Noter dans `GROWTH-PLAN.md` §7 : sub, date, upvotes à 24 h, Tours et Tours partagés attribués à l'UTM.
