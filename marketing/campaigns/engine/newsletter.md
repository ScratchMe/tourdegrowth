# Pitch newsletters — le moteur de croissance (lancement B)

*TODO: à relire. Envoyé par Antoine depuis `contact@tourdegrowth.com`, signé
« L'équipe Tour de Growth » / « The Tour de Growth team » — jamais un prénom.
Un envoi par newsletter, personnalisé à la première ligne ; 10 à 15 envois
dans la semaine B+1, pas plus d'un par jour à la même rédaction. Portiers de
`show-hn.md` cochés avant le premier envoi.*

**Pourquoi le pitch ne joint pas « leur propre résultat »** (`GROWTH-PLAN.md`
4.1 le demandait pour le Tour) : le moteur prend les chiffres internes d'une
entreprise, que nous n'avons pas et ne devinerons pas. À la place, le pitch
joint **une slide du jeu d'exemple**, marquée comme telle.

**Lien** (un slug par newsletter, jamais le même pour deux) :
`node scripts/utm-link.mjs newsletter:<slug> /en/aarrr-funnel-template --campaign launch_engine`
— par exemple `…?utm_source=newsletter_growthunhinged&utm_campaign=launch_engine`.
Pour une newsletter francophone : même commande avec `/fr/aarrr-funnel-template`.

## Cibles (à qualifier par Antoine avant l'envoi)

Reprises de `GROWTH-PLAN.md` 4.1, sans affirmation sur leur politique
éditoriale : aucune n'a été contactée, et nous ne savons pas lesquelles
acceptent des outils. Vérifier pour chacune qu'une rubrique « outils » ou
« ressources » existe, et trouver l'adresse de soumission publique — jamais
une adresse personnelle trouvée ailleurs.

- EN : Growth Unhinged, Demand Curve, Product-Led Alliance, la newsletter
  d'Elena Verna, les mentions « tools » de Lenny's Newsletter.
- FR : Growth Makers (devenue Mantra), Le Growth Club. « Kiosque » reste à
  identifier ; GrowthList retirée (c'est une base de données, pas une newsletter).

## EN

**Objet** (≤ 50 caractères, en choisir un) :
1. `A funnel template that never sees your numbers` (46)
2. `Your AARRR funnel, as a deck, in your browser` (45)

**Aperçu** : `Free, open source, nothing you type is sent. One slide attached.`

> Hi [name],
>
> [One line that shows you actually read their last issue — written by hand, never templated.]
>
> We built a free AARRR funnel template that runs entirely in the browser: a growth lead enters fifteen numbers from their own tools, sees where they lose the most people, and exports a 4 to 7 slide deck for their leadership meeting. No account, no server, no AI — there's a test in the public repo that fails if anything they type is sent.
>
> What might interest your readers is less the tool than two rules it holds: it only calls a stage "the leak" against a target the team sets (or a published range, printed with its caveat), and every number it can't find becomes a finding with a repair cost, on its own slide.
>
> I've attached one slide, generated from example data. The tool is here: [link]
>
> If it's useful for a tools section, it's yours to mention; if not, no reply needed.
>
> The Tour de Growth team

## FR

**Objet** (≤ 50 caractères, en choisir un) :
1. `Un modèle de funnel qui ne voit pas tes chiffres` (48)
2. `Ton funnel AARRR en slides, sans rien envoyer` (45)

**Aperçu** : `Gratuit, open source, rien de ce que tu saisis n'est envoyé. Une slide jointe.`

> Bonjour [prénom],
>
> [Une ligne qui montre qu'on a lu le dernier numéro — écrite à la main, jamais un gabarit.]
>
> On a construit un modèle de funnel AARRR gratuit qui tourne entièrement dans le navigateur : un responsable growth y saisit quinze chiffres tirés de ses outils, voit où il perd le plus de monde, et repart avec 4 à 7 slides pour son CODIR. Sans compte, sans serveur, sans IA — un test du dépôt public échoue si quoi que ce soit de saisi est envoyé.
>
> Ce qui pourrait intéresser tes lecteurs, c'est moins l'outil que deux règles qu'il tient : il ne désigne une étape comme « la fuite » que contre une cible fixée par l'équipe (ou une fourchette publiée, imprimée avec sa réserve), et chaque chiffre introuvable devient un constat, chiffré en coût de réparation, sur sa propre slide.
>
> Je joins une slide, faite avec des données d'exemple. L'outil est ici : [lien]
>
> Si ça trouve sa place dans une rubrique outils, c'est avec plaisir ; sinon, pas besoin de répondre.
>
> L'équipe Tour de Growth

*Note* : le tutoiement suit la voix du produit (fiche terminologique, revue de
copie §2). Pour une rédaction qui vouvoie ses lecteurs, passer au vous
(« Bonjour, … vos lecteurs … »), et « Je joins » devient « Nous joignons ».

## Rappels

- Un seul relancement, sept jours plus tard, d'une ligne ; puis plus rien.
- Mention de désinscription inutile : ce sont des messages un à un, pas une
  liste de diffusion. Ne jamais constituer de liste avec ces adresses.
- Noter dans `GROWTH-PLAN.md` §7 : newsletter, date, réponse, visites du slug.
