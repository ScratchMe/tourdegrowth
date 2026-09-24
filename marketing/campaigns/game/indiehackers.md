# Indie Hackers — build log du jeu (lancement C)

*TODO: à relire. Compte `tourdegrowth`. Semaine C+1, après le Show HN : on
peut y raconter ce que HN et les testeurs ont appris. Portiers de
`show-hn.md` cochés avant. Aucune marque réelle.*

**Lien** : `https://www.tourdegrowth.com/en/game/retention?utm_source=indiehackers&utm_campaign=launch_game`

## Mise à jour de la page produit

Une ligne de plus dans la description de la page existante (pas une nouvelle
page : c'est le même site) : « Also: a 20-minute game where you play the
growth PM who ships the dark patterns. »

## Post

**Titre** : `Five things I changed in a game where you play the bad guy`

> I run a free growth check-up. It tells people what to do about their weakest stage. The retention stage kept raising the opposite question — what *not* to do — so I built a short game about it: you're the growth PM of a fictional streaming app, the CEO wants monthly cancellations from 6% to 4%, and every quarter you pick two projects. Some of them are dark patterns with meeting-room names. December shows you the bill.
>
> What changed between the first prototype and the version that shipped:
>
> **1. There was no good option.** The first version only let you pick between degrees of bad, and the feedback was blunt: nothing in it to be proud of. There are now three honest endings, one where you hit 4% without a single trick — it takes the whole year and a data review with the CEO.
>
> **2. Honest names gave the game away.** Some early card labels hinted at the outcome, which made the right path obvious. In a real meeting nobody says "bury the cancel button"; they say "Streamline the account page", so that's what the card says now, and December translates each euphemism into its standard name. A test forbids judgement words ("trick", "fast", "honest"…) on any card, and no card shows a number before it's played.
>
> **3. The blur is the design.** Trust and regulator attention sit on the dashboard from day one, blurred and labelled "not on your dashboard". They're meant to nag at you. That's the thing growth dashboards actually do: show the number, not the cost.
>
> **4. One quarter was too easy.** There was no stake. The cost only appears over months, so the game is a year long — about twenty minutes. A rushed player gets fired in June; the ending says so kindly.
>
> **5. The CEO is what makes it real.** He calls on video every quarter and names one specific project he wants; obeying helps the number, refusing costs his patience. His drawn face and his voice (the browser's speech synthesis, optional, subtitles always on) get firmer or angrier as the year goes.
>
> Stack: Next.js and TypeScript, no server at all — pre-rendered pages, one client island, the save in localStorage. Levels are data; the other four stages of the funnel are sketched, retention is the only playable one.
>
> Revenue: $0. It's a free object, and it lives next to the check-up.
>
> Code: github.com/ScratchMe/tourdegrowth · Play: [link]
>
> What I'd like to hear: which ending you got on the first try.

*Notes pour la relecture* : les points 1, 2 et 4 viennent du tableau des
décisions de prototypage (GAME-BRIEF §4) et sont vrais tels quels ; les
points 3 et 5 reprennent la « thèse de design » et les lignes « Le DG en
visio » du même tableau, sans citer personne. Le test du point 2 est un
**[portier]** (GAME-BRIEF §7.1, C3) : ne pas le citer s'il n'est pas sur
`main`. Si la recette change un de ces faits, corriger ici avant de
poster.
