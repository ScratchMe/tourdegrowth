# marketing/ — le kit de distribution de Tour de Growth

*Tout ce qu'il faut pour poster, soumettre et pitcher Tour de Growth sans
qu'une personne apparaisse : les textes, les captures, les liens tagués.
C'est la vague 0 de `GROWTH-PLAN.md` (items 0.5 et 0.7). Rien ici ne tourne
dans l'app ; rien ici n'est importé par `src/`.*

## Les trois règles, avant de copier quoi que ce soit

1. **Jamais le nom.** Aucun texte de ce dossier ne nomme l'auteur, ne
   renvoie vers son CV, ni n'est posté depuis un compte personnel. Le
   pseudonyme est `tourdegrowth`, l'adresse est `contact@tourdegrowth.com`.
   Si quelqu'un demande qui est derrière : « the site credits its author in
   the footer; I keep this account pseudonymous » — le site est signé
   (option A, `GROWTH-PLAN.md` §0), la promotion ne l'est pas.
2. **Jamais un lien nu.** Chaque lien sortant passe par
   `node scripts/utm-link.mjs <canal> [chemin]` — sinon GoatCounter ne saura
   pas d'où vient le Tour, et la règle de coupe du plan ne pourra pas
   s'appliquer. Les liens ci-dessous sont déjà tagués. Pour les lancements
   B et C, ajouter `--campaign launch_engine` ou `--campaign launch_game`
   (voir `kit.md`).
3. **Rien ne part sans relecture.** Ces textes sont un premier jet de la
   session (`TODO: à relire`, convention 6 de `CLAUDE.md`). Une page SEO peut
   vivre marquée ; un post public, non.

## Ce qu'il y a dedans

| Fichier | Contenu |
|---|---|
| `kit.md` | Identité : nom, tagline, descriptions en 3 longueurs × FR/EN, catégories, faits vérifiables, liens tagués, la table des annuaires avec ce qui a été vérifié sur chacun |
| `launch/show-hn.md` | Titre, premier commentaire, FAQ des dix objections probables |
| `launch/reddit.md` | Un post par subreddit, dans son ton et sous ses règles (vérifiées, sources dans le fichier) |
| `launch/indiehackers.md` | La page produit et le post « build log » |
| `launch/social.md` | Le fil de lancement X / Bluesky et la cadence de cartes |
| `campaigns/README.md` | *(2026-09-24, à relire)* Le brief de campagne des trois lancements suivants — A : le Tour relancé ; B : le moteur de croissance ; C : le jeu « Le côté obscur » — objectifs mesurables, publics, messages et preuves, canaux, calendrier semaine par semaine, risques, partage main / session, décisions à prendre |
| `campaigns/competitive-brief.md` | *(2026-09-24, à relire)* Le paysage : outils de score growth, gabarits AARRR, éducation aux dark patterns, et les trous de positionnement |
| `campaigns/engine/`, `campaigns/game/` | *(2026-09-24, à relire)* Les textes prêts à coller de B et C : Show HN (titres, premier commentaire, FAQ), Reddit, Indie Hackers, X / Bluesky, pitch newsletter, descriptions d'annuaire 140/300/800 — chacun avec la liste des portiers à cocher avant de poster |
| `campaigns/brand-review.md` | *(2026-09-24)* La relecture de marque de ces textes par la session : constats, corrections faites, points juridiques, longueurs vérifiées par script |
| `assets/` | 22 PNG (2,4 Mo) : landing, question, sélecteur de ton, résultat (FR/EN, 1280 et 390, en 2×), la carte d'aperçu en neutre et en roast, les trois images de partage |

## Comment les captures ont été faites

`scripts/kit-screenshots.mjs`, Playwright contre un **build de production
local** (`npm run build`, puis `NEXT_PUBLIC_GOATCOUNTER_CODE=e2e-stub npx next
start -p 3000`, puis `node scripts/kit-screenshots.mjs`) — pas contre le site
en ligne : depuis le bac à sable de session, Chromium ne traverse pas le
proxy sortant (le tunnel se ferme en cours d'échange) alors que `curl`
passe. Même rendu, même code que la production. Les PNG sont ensuite
réencodés en palette par le même script (`sharp`, déjà dans `node_modules`
via Next) : 7,4 Mo → 2,4 Mo sans perte visible. À refaire quand un écran
change.
