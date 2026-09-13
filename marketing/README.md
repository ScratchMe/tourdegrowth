# marketing/ — le kit de distribution de Tour de Growth

*Tout ce qu'il faut pour poster, soumettre et pitcher Tour de Growth sans
qu'une personne apparaisse : les textes, les captures, les liens tagués.
C'est la vague 0 de `GROWTH-PLAN.md` (items 0.5 et 0.7). Rien ici ne tourne
dans l'app ; rien ici n'est importé par `src/`.*

## Les trois règles, avant de copier quoi que ce soit

1. **Jamais le nom.** Aucun texte de ce dossier ne nomme l'auteur, ne
   renvoie vers son CV, ni n'est posté depuis un compte personnel. Le
   pseudonyme est `tourdegrowth`, l'adresse est `contact@tourdegrowth.com`.
   Si quelqu'un demande qui est derrière : « the site credits its author in
   the footer; I keep this account pseudonymous » — le site est signé
   (option A, `GROWTH-PLAN.md` §0), la promotion ne l'est pas.
2. **Jamais un lien nu.** Chaque lien sortant passe par
   `node scripts/utm-link.mjs <canal> [chemin]` — sinon GoatCounter ne saura
   pas d'où vient le Tour, et la règle de coupe du plan ne pourra pas
   s'appliquer. Les liens ci-dessous sont déjà tagués.
3. **Rien ne part sans relecture.** Ces textes sont un premier jet de la
   session (`TODO: à relire`, convention 6 de `CLAUDE.md`). Une page SEO peut
   vivre marquée ; un post public, non.

## Ce qu'il y a dedans

| Fichier | Contenu |
|---|---|
| `kit.md` | Identité : nom, tagline, descriptions en 3 longueurs × FR/EN, catégories, faits vérifiables, liens tagués, la table des annuaires avec ce qui a été vérifié sur chacun |
| `launch/show-hn.md` | Titre, premier commentaire, FAQ des dix objections probables |
| `launch/reddit.md` | Un post par subreddit, dans son ton et sous ses règles (vérifiées, sources dans le fichier) |
| `launch/indiehackers.md` | La page produit et le post « build log » |
| `launch/social.md` | Le fil de lancement X / Bluesky et la cadence de cartes |
| `assets/` | 22 PNG (2,4 Mo) : landing, question, sélecteur de ton, résultat (FR/EN, 1280 et 390, en 2×), la carte d'aperçu en neutre et en roast, les trois images de partage |

## Comment les captures ont été faites

`scripts/kit-screenshots.mjs`, Playwright contre un **build de production
local** (`npm run build`, puis `NEXT_PUBLIC_GOATCOUNTER_CODE=e2e-stub npx next
start -p 3000`, puis `node scripts/kit-screenshots.mjs`) — pas contre le site
en ligne : depuis le bac à sable de session, Chromium ne traverse pas le
proxy sortant (le tunnel se ferme en cours d'échange) alors que `curl`
passe. Même rendu, même code que la production. Les PNG sont ensuite
réencodés en palette par le même script (`sharp`, déjà dans `node_modules`
via Next) : 7,4 Mo → 2,4 Mo sans perte visible. À refaire quand un écran
change.
