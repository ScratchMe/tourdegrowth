# Comment ce retour est arrivé ici

*Note de la session, 2026-10-03. Tout le reste de ce dossier est le retour de
Claude Design tel quel ; ce fichier seul n'en fait pas partie.*

Claude Design a écrit son retour dans le projet « Tour de Growth »
(`23b9671c-a55b-452e-aa41-39906ee71ba8`), sous `design/ds-extension-09-return/`,
en réponse au brief 09 (`design/DS-EXTENSION-BRIEF-09.md`). **Les 106 fichiers
sont recopiés ici, aux mêmes chemins, identiques au caractère près.** La
planche est toute en source, comme celle du retour 07.

**Comment l'identité est garantie.** Une copie qui passe par un modèle perd
les espaces insécables (retours 04 et 05). Ici, chaque fichier a été lu par
`DesignSync` (`get_file`), puis **écrit par un script depuis la réponse brute
de `get_file`**, telle que la gardent les transcriptions de la session (du
JSON, donc au caractère près), sans passer par la main. Aucune réponse n'était
tronquée. Le retour contient 104 U+202F et 2 U+00A0 (la typographie française
de `board/copy.js` et de `board/r07/copy07.js`, et la regex des séparateurs de
`board/sys/NumberField.js`).

**Trois fichiers changés après la copie, pour CodeQL.** Ce sont les trois
mêmes lignes que dans le retour 07, revenues telles qu'avant leur correction
(le retour 09 recopie ses fichiers de planche), et la règle du dépôt est de
corriger une alerte, pas de l'écarter :

- `board/r07/EngineLanding.js` : `engineKnownScript` échappe `<`, `>`, `/`,
  U+2028 et U+2029 dans la clé avant de l'écrire dans le `<script>` en ligne
  (*bad code sanitization*), avec l'assistant du retour 07 ;
- `board/make-copy.mjs` : une cellule échappe les barres obliques inverses
  avant les `|` (*incomplete string escaping*) ;
- `board/board.js` : l'identifiant d'écran est pris dans la liste des écrans
  connus (`SCREENS.find(…)?.id`), plus la chaîne lue dans l'adresse
  (*unvalidated dynamic method call*, relevée par CodeQL sur la PR #309) :
  le retour vérifiait l'écran avec `SCREENS.some(…)`, mais rendait la chaîne
  de l'adresse, ce que CodeQL ne sait pas lire comme une garde.

`COPY.md` régénéré par `make-copy.mjs` après ces changements est identique à
l'octet. **Hors de ces trois fichiers, les 103 autres restent identiques au
retour.**

**La planche se rejoue depuis le dépôt**, servie en http, avec les polices du
dépôt à la place de `../../../fonts/fonts.css` (le chemin du projet Claude
Design) : un dossier où `fonts/fonts.css` est une copie de
`.design-sync/fonts/brand-fonts.css` avec ses quatre `.woff2`, et `design/` le
dossier du dépôt. Rejouée le 2026-10-03 dans Chromium avec `board/measure.cjs`,
sur une copie hors du dépôt (le script réécrit `board/measures.js`) : **les 35
écrans, dans les deux langues, à 1 280, 390 et 320 px (210 états), sans erreur
de script, ni défilement horizontal, ni cible sous 44 px, ni chevauchement**,
et des mesures identiques au chiffre près à celles de `board/measures.js`.
`node board/money-check.mjs` et `node board/contrast.mjs` se rejouent aussi.

**Ce que la planche ne prouve pas.** Son tableau « avant » est redessiné, pas
le vrai : à 1 280 px en français il fait 3 151 px quand celui du produit en
fait 3 438 (le brief, B14), et son panneau ouvert 1 206 px contre 1 774. Ses
écarts avant contre après sont utilisables, ses hauteurs non : la vraie mesure
se prend au portage, avec `scripts/engine-density.capture.ts`. Ses moteurs
« sain » et « assisté » sont inventés (`board/engines.js`), et son modèle
d'argent (`board/money.js`) est une réplique : sur le SaaS du film, elle
retombe exactement sur le moteur (`lib/engine/money.ts`, vérifié chiffre par
chiffre) ; pour l'assisté, le produit garde son propre modèle (A20.a).
