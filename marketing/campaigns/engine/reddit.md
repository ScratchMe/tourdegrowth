# Reddit — le moteur de croissance (lancement B)

*TODO: à relire. Compte `tourdegrowth`, **vieilli** : il a commenté sans lien
dans chacun de ces subs pendant au moins une semaine (brief §5, S2). Un seul
compte (r/SaaS compte les comptes alternatifs comme un seul acteur). Jamais le
même texte deux fois ; un sub par jour ; rendre des retours à d'autres projets
le jour même là où c'est la règle.*

Règles telles que documentées dans `GROWTH-PLAN.md` §3 (vérifiées le
2026-09-13) : **r/SaaS** une autopromotion par 60 jours depuis avril 2026,
posts + commentaires + mentions ; **r/startups** fils hebdomadaires
uniquement ; **r/SideProject** autopromotion voulue, montrer le produit et
rendre des retours ; **r/growthhacking** aime débattre du contenu.
**Relire les règles dans le sub le jour même** : elles bougent.

Avant tout post : les portiers de `show-hn.md` sont cochés.

---

## r/SaaS — jeudi de la semaine B, le meilleur des textes

**Le seul post r/SaaS de la fenêtre de 60 jours.** Vérifier d'abord (décision
D1) qu'aucun post r/SaaS n'est parti dans les 60 jours précédents ; sinon,
sauter ce sub.

**Lien** : `https://www.tourdegrowth.com/en/aarrr-funnel-template?utm_source=reddit_saas&utm_campaign=launch_engine`

Le sub tolère le produit **en arrière-plan d'une décision racontée**, pas en
titre.

**Titre** : `We built a funnel tool that never sees your numbers. Here's what that forced us to get right.`

**Corps** :

> A growth PM who puts their company's funnel into a web tool is handing their employer's numbers to a stranger. So when we built an AARRR funnel template with a "make me a leadership deck" button, the first rule was that the numbers never leave the browser. No account, no server, no AI.
>
> That one constraint ended up deciding most of the product:
>
> 1. **You can't hide sloppy math behind a backend.** Everything has to be computable, and explainable, on the page. So you enter counts (numerator and denominator), not percentages, and every title on every slide is recomputable from the numbers shown right under it.
> 2. **No multiplied chain.** The main view follows 100 sign-ups — how many reach first value, stay to day 30, pay — all on the same base. Chaining rates measured on different populations gives you a precise number you can't defend in the room.
> 3. **"Where's the leak?" needs a reference.** Without a server there's no pool of other companies to compare against, and honestly that pool would be comparing definitions anyway. So a stage is only called the leak against a target you set, or one of two published ranges printed with its caveat. Otherwise the tool says it can't tell, and the deck's "ask" slide becomes "fund measuring X first" — often the most honest ask a growth lead can bring.
> 4. **Missing numbers are findings, not blanks.** Each one you can't find gets a repair cost, from a meeting to a quarter, and they're ranked on their own slide.
>
> Export is the browser's print for PDF and a small library loaded on click for PNG, so there's still no server involved.
>
> It's free and open source (AGPL) if you want to read how the "nothing leaves the browser" test works: [link] · github.com/ScratchMe/tourdegrowth
>
> Curious how others handle this: when you present funnel numbers, do you show the denominators, or only the rates?

---

## r/startups — fil « Feedback Friday » uniquement, vendredi de la semaine B+1

**Lien** : `https://www.tourdegrowth.com/en/aarrr-funnel-template?utm_source=reddit_startups&utm_campaign=launch_engine`

C'est un commentaire dans un fil, pas un post. Répondre à trois autres projets
du fil avant de poster le sien.

> **Growth engine (Tour de Growth)** — a free AARRR funnel template that runs in your browser: fifteen numbers, where you lose the most people, and a short deck for your next leadership meeting. Nothing you type is sent anywhere. Looking for feedback on one thing: which of the fifteen numbers you couldn't find in your own tools. [link]

---

## r/growthhacking — le débat, pas l'outil

**Lien** : `https://www.tourdegrowth.com/en/aarrr-funnel-template?utm_source=reddit_growthhacking&utm_campaign=launch_engine`

**Titre** : `Fifteen numbers to read a self-serve SaaS funnel — which one would you swap?`

**Corps** (les chiffres **dans** le post : c'est ce qui le rend lisible sans
cliquer) :

> Three per stage, deliberately boring:
>
> - **Acquisition** — sign-up rate (sign-ups ÷ unique visitors), top channel's share of sign-ups, CAC (and which variant: media only, plus team, fully loaded).
> - **Activation** — the activation event itself (named, with its window), activation rate within that window, median time-to-value.
> - **Retention** — day-30 retention of a sign-up cohort, monthly logo churn, main churn cause (and how you know it: data, interviews, or a hunch).
> - **Referral** — whether sharing is built into the product, share of sign-ups that came from a user, K-factor.
> - **Revenue** — sign-up → paid conversion, monthly ARPA, gross margin. LTV, payback and LTV:CAC are computed from these, never typed.
>
> Two rules we held: LTV caps the customer lifetime at 36 months, and never falls back to revenue when gross margin is missing (that's the flattering version).
>
> We put these in a free, local-only tool that turns them into a short deck: [link]. But the list is the interesting part — which one is the wrong number for a self-serve SaaS, and what would you replace it with?

---

## r/SideProject — semaine B+1, un autre jour que r/startups

**Lien** : `https://www.tourdegrowth.com/en/aarrr-funnel-template?utm_source=reddit_sideproject&utm_campaign=launch_engine`

**Visuel** : une slide exportée (le peloton de 100 inscrits, jeu d'exemple) —
à capturer le jour de l'ouverture (brief §6).

**Titre** : `I built an AARRR funnel template that runs entirely in your browser and exports a leadership deck (free, open source)`

**Corps** :

> **What it is**: you enter fifteen numbers from your own tools, three per growth stage. It shows how 100 sign-ups move through your product, where you lose the most people (only against a target you set or a published range it can cite), and what each missing number would cost to measure. Then it exports 4 to 7 slides: PDF, PNG per slide, or text with speaker notes.
>
> **Why local-only**: these are your employer's numbers. No account, no server, no AI; there's a test in the repo that fails if any request carries something you typed.
>
> **Stack**: Next.js, TypeScript, CSS Modules on design tokens. The page is pre-rendered; the tool is a client island. PDF is the browser's print, PNG uses a small library loaded on click. AGPL: github.com/ScratchMe/tourdegrowth
>
> **What I'd like feedback on**: which number you couldn't find, and whether the slides say something you'd actually present.
>
> [link]

---

## Après chaque post

- Répondre à tout dans l'heure ; corriger ce qui se corrige et le dire dans le
  fil.
- Noter dans `GROWTH-PLAN.md` §7 : sub, date, votes à 24 h, visites de la
  campagne `launch_engine` pour cette source (GoatCounter), et les événements
  `engine_*` **du jour** — c'est la seule lecture de conversion possible
  (brief §7).
