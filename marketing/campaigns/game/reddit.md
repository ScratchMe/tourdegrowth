# Reddit — « Le côté obscur » (lancement C)

*TODO: à relire. Compte `tourdegrowth`, le même qu'au lancement B. Semaine
C+1, un sub par jour, jamais le même texte deux fois. Portiers de
`show-hn.md` cochés avant le premier post. **Aucune marque réelle dans aucun
post** : les cas publics restent dans le catalogue du jeu, relus
juridiquement.*

Règles telles que documentées dans `GROWTH-PLAN.md` §3 (vérifiées le
2026-09-13) : **r/SideProject** autopromotion voulue, montrer le produit et
rendre des retours ; **r/IMadeThis** même esprit. **r/UXDesign n'est pas
documenté** dans le plan : sa barre latérale se lit le jour même, et si
l'autopromotion y est interdite ou réservée à un fil, on s'y plie ou on
s'abstient. **Relire les règles de chaque sub le jour même.**

Pas de r/SaaS (sa fenêtre de 60 jours est prise par le moteur), pas de
r/growthhacking (le jeu n'y apporte rien à débattre), pas de r/startups.

---

## r/SideProject — au moins trois semaines après le post du moteur

**Lien** : `https://www.tourdegrowth.com/en/game/retention?utm_source=reddit_sideproject&utm_campaign=launch_game`

**Visuel** : la visio du DG et, à côté, le téléphone « N clics pour
résilier » — capturés le jour de l'ouverture (brief §6).

**Titre** : `I made a 20-minute game where you play the growth PM who's told to hide the cancel button`

**Corps** :

> **What it is**: a year at a fictional streaming app. The board wants cancellations from 6% down to 4% a month. Each quarter the CEO calls you on video and you pick two projects from a hand of cards named the way they're named in meetings ("Streamline the account page", not "bury the cancel button"). A phone mock-up shows the cancellation flow your choices produce, with a "N clicks to cancel" counter.
>
> **The twist**: subscriber trust and regulator attention are on your dashboard, but blurred until December. Then the game shows you all eight patterns by their real names, what the law says about each, and how to spot them in the apps you use. You can also win without a single trick.
>
> **Stack**: Next.js, TypeScript, CSS Modules. No server at all — pre-rendered pages and one client island, save in localStorage. The CEO's face is inline SVG, his voice is the browser's speech synthesis (optional, subtitles always on). Levels are data. AGPL: github.com/ScratchMe/tourdegrowth
>
> **Feedback I'm after**: which ending you got, and whether a card name fooled you.
>
> [link]

---

## r/IMadeThis — un autre jour de la même semaine

**Lien** : `https://www.tourdegrowth.com/en/game/retention?utm_source=reddit_imadethis&utm_campaign=launch_game`

Plus court, centré sur l'objet ; un visuel seul (la page de décembre, courbe
de confiance défloutée).

**Titre** : `I made a game about the dark patterns in subscription cancellation — you're the one building them`

**Corps** :

> Twenty minutes, free, no signup, English and French. You play a year as a growth PM under a CEO who wants the churn number, and December shows you what your choices cost — with the real names of the eight tricks and how to recognise them afterwards. There's an honest way to win, too.
>
> [link]
>
> Happy to answer anything about how it's built (no backend, everything runs in the browser).

---

## r/UXDesign — conditionnel

**Lien** : `https://www.tourdegrowth.com/en/game/retention?utm_source=reddit_uxdesign&utm_campaign=launch_game`

**Condition** : la barre latérale autorise un post de projet personnel, ou il
existe un fil dédié. Sinon, **ne rien poster** — un post retiré par la
modération coûte plus au compte qu'il ne rapporte.

**Titre** : `A game for the moment someone asks you to "make cancellation less prominent"`

**Corps** :

> Most of us have had the brief. This is a short game (about twenty minutes) that puts you on the other side of it: you're the growth PM, the CEO wants the number, and each quarter you pick two projects with harmless meeting names — "Streamline the account page", "Retention offers", "Personalised decline button".
>
> Nothing on the cards tells you what they do. The dashboard shows cancellations going down; subscriber trust is blurred until December, when the game names each pattern (obstruction, forced action, confirmshaming, preselection and visual interference…), gives the law behind it and the tell to spot it.
>
> I built it as something to send to a stakeholder instead of a slide. If you use it that way, I'd like to know whether it lands.
>
> [link]

---

## Après chaque post

- Répondre à tout dans l'heure ; rendre des retours à d'autres projets le
  jour même sur r/SideProject et r/IMadeThis.
- Si un commentaire dit « it made me want to use these tricks » : ne pas
  débattre, demander quelle fin a été obtenue — c'est la donnée que la
  recette surveille (GAME-BRIEF §3.2).
- Noter dans `GROWTH-PLAN.md` §7 : sub, date, votes à 24 h, visites de la
  campagne `launch_game` pour cette source, et les événements `game_*` **du
  jour** (brief §7).
