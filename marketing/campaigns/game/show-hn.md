# Show HN — « Le côté obscur » (lancement C)

*TODO: à relire. Compte HN `tourdegrowth`, jamais un compte personnel. Mêmes
règles que `../engine/show-hn.md` : l'URL dans le champ URL, le champ texte
**vide**, l'histoire dans le premier commentaire, **trois heures** de
présence, aucune demande de vote. Mardi ou mercredi, 14-16 h heure de Paris,
**au moins trois semaines après le Show HN du moteur** — c'est le second et
dernier Show HN de ce pseudonyme dans cette série.*

## Avant de poster — les portiers, un par un

Chaque case se coche **sur la production**, pas dans le brief. Une seule case
vide et le post attend.

- [ ] Recette du jeu signée (GAME-BRIEF §7.3 : Antoine plus cinq testeurs).
- [ ] **Relecture juridique du catalogue final** faite : cas réels publics,
      formulés au passé, sourcés, et la liste blanche des marques testée
      (GAME-BRIEF §3.3, P19).
- [ ] `GAME_ENABLED` posé puis redéployé ; `/en/game/retention` et
      `/fr/game/retention` répondent 200 en production, et le sitemap les
      liste.
- [ ] Une partie **propre** menée jusqu'aux applaudissements sur la
      production (le parcours de référence du brief §6) — la FAQ affirme
      qu'on peut gagner sans une seule astuce.
- [ ] **« Vingt minutes » est mesuré**, pas supposé : la durée médiane des
      parties de la recette le confirme (décision 5 du 2026-09-24). Sinon,
      remplacer le chiffre dans **tous** les textes de `game/` par la durée
      mesurée.
- [ ] Aucun délai imposé : raccrocher la visio affiche le texte entier et
      débloque les cartes immédiatement ; aucune avance automatique entre
      deux écrans. Vérifié à la main — c'est exactement ce que le fil HN de
      janvier 2025 a reproché à un jeu voisin (`../competitive-brief.md`).
- [ ] Aucune capture d'e-mail, aucune inscription, aucune « newsletter » en
      fin de partie. Le seul bouton de partage copie un lien.
- [ ] Les événements `game_*` apparaissent dans `/admin/stats` (sinon le
      lancement n'est pas lisible — brief §7).
- [ ] La mention « chiffres du jeu, modèle simple écrit dans le code » est sur
      la page de décembre.
- [ ] Les noms de cartes cités en anglais (« Streamline the account page »,
      « Assisted cancellation », « Retention offers ») sont remplacés par les
      chaînes anglaises **livrées** : le brief n'a que le français, et
      l'anglais n'est pas une traduction littérale (GAME-BRIEF §8.2). Idem
      dans `reddit.md`, `indiehackers.md` et `social.md`.
- [ ] Le jeu se joue entièrement au clavier et sur un téléphone de 390 px
      (GAME-BRIEF §9.7, P-specs).

## Titre (≤ 80 caractères, en choisir un)

1. `Show HN: A game where you're the growth PM who ships the dark patterns` (70) ← préféré : il dit le renversement en une ligne
2. `Show HN: Play a year as a growth PM whose CEO wants the cancel button hidden` (76)

*Écarté* : tout titre qui cite une loi ou une amende — HN lit ça comme de
l'agitation, et le jeu n'est pas un tribunal.

**URL** : `https://www.tourdegrowth.com/en/game/retention?utm_source=hackernews&utm_campaign=launch_game`

## Premier commentaire

> Most things that teach dark patterns ask you to spot them: here's a screen, find the trick. This goes the other way. You're the growth PM of a streaming app (fictional, called Flixo). The board wants monthly cancellations down from 6% to 4% by December. Every quarter the CEO calls you on video, and you pick two projects out of a hand of cards, named the way they're named in meetings: "Streamline the account page", "Assisted cancellation", "Retention offers". Nobody in a meeting says "bury the cancel button".
>
> A few things I tried to get right:
>
> - **The dashboard shows the number, not the cost.** Cancellations, subscribers, revenue and the CEO's patience are visible. Subscriber trust and regulator attention are on the dashboard too, but blurred, labelled "not on your dashboard", until December. That blur is the whole thesis.
> - **No card shows a number before you play it.** Otherwise the right path is obvious. Visible effects show up in the quarterly report; hidden ones in December.
> - **You can win clean.** An earlier version had no good option, and the feedback was blunt: nothing in it to be proud of. There are now three honest endings, including one where you hit the target without a single trick — if you bring your data to the CEO.
> - **December is the reveal.** All eight patterns, whether you used them or not, with their standard names (obstruction, forced action, nagging, confirmshaming, fake social proof, hidden costs, preselection and visual interference, addictive design), what the law says, one public case, and a tell to spot it in the wild.
>
> Practical bits: about twenty minutes, English and French, no account, no signup at the end. It runs entirely in the browser — no server, your save lives in localStorage. The CEO's voice is the browser's speech synthesis and it's optional; subtitles are always on, and you can hang up on him any time. The numbers come from a simple model written in the code, and the game says so; it's not a study.
>
> Levels are data, so four more stages of the funnel are sketched; only retention is playable today.
>
> Code is open (AGPL): github.com/ScratchMe/tourdegrowth — it lives inside a free growth check-up, which is where the "what to do" side is.
>
> What I'd like to hear: which ending you got, and whether any card name fooled you until December.

## FAQ — les objections probables, réponse prête

| Objection | Réponse |
|---|---|
| **"This already exists."** | Games where you *spot* dark patterns do — and they're good. Here you *ship* them, under a boss, and the bill arrives nine months later. It's the same inoculation idea as the misinformation games where you play the manipulator, applied to the screens that make us click. |
| **"Isn't this a tutorial for manipulation?"** | That's the risk the design is built around. Every trick is paid for in December, the catalogue gives the law behind each one, and the best ending is the honest one. If anyone finishes it thinking the tricks pay, tell me which ending you got. |
| **"The numbers are made up."** | They come from a simple model, written in the code and readable in the repo, and the game says so on the December page. It's a game, not a study; the point is the shape — the immediate number against the delayed cost. |
| **"Why a CEO who yells?"** | Because that's where these decisions come from. He doesn't yell, he escalates: the orders get more specific each quarter, obeying helps, refusing costs you his patience. You can still refuse. |
| **"Text-to-speech is grating."** | It's optional and off until you press "Listen". Subtitles are always there, and reduced-motion users get the full text at once. |
| **"Why France-specific law?"** | The law cited is mostly French consumer law — three-click cancellation (Consumer Code, art. L215-1-1, since June 2023), cancellation terms disclosed before you subscribe (L221-5), misleading and aggressive practices (L121-2, L121-6) — plus the CNIL's guidance on deceptive design and, for streaks, the EU's upcoming Digital Fairness Act. The English version explains each one for a non-French reader, and the catalogue cites a US case where one exists, in both languages. |
| **"Where are the real companies?"** | Only in the final catalogue, only public cases (fines or settlements already published), in the past tense, with sources. The app you play is fictional on purpose. |
| **"Does it track me?"** | Cookie-less GoatCounter: page views plus a fixed list of event labels — level started, quarter played, whether you followed or refused the CEO's order, which ending you reached, catalogue opened. Fixed labels only: no free text, no number you produced, no account, no identifier. The full list is in the source (`src/lib/game/events.ts`). |
| **"Can I use it in a class?"** | Please do. A classroom mode (group codes, teacher guide) isn't built yet; if you'd use one, say so — it decides what gets built next. |
| **"Why twenty minutes?"** | A single quarter was too easy to game. The cost only shows over a year, so the year stays. |
| **"Who's behind this?"** | The site credits its author in the footer; I keep this account pseudonymous. |

*Note pour la relecture* : la réponse « This already exists » reconnaît le
précédent **sans le nommer** (règle de `GROWTH-PLAN.md` §2 : ne jamais se
comparer en premier et nommément). Si un commentaire le cite, répondre sur le
fond, sans rabaisser : « It's good — it's about spotting; this is about
building. »

## Après le post

- Répondre à chaque commentaire pendant trois heures ; ne jamais défendre une
  carte, expliquer la mécanique.
- Si quelqu'un signale une marque réelle dans le jeu lui-même, ou une phrase
  du catalogue juridiquement fragile : c'est l'objection qui arrête tout.
  Remercier, fermer `GAME_ENABLED`, corriger, le dire dans le fil.
- Relevé `stats.yml` le soir même (session) : `game_started`, `game_ending/*`,
  `game_catalogue_open` — chiffres gardés hors du dépôt.
