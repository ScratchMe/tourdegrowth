# Comment ce retour est arrivé ici

*Note de la session, 2026-10-05. Tout le reste de ce dossier est le retour de
Claude Design tel quel ; ce fichier seul n'en fait pas partie.*

Claude Design a écrit son retour dans le projet « Tour de Growth »
(`23b9671c-a55b-452e-aa41-39906ee71ba8`), sous `design/ds-extension-10-return/`,
en réponse au brief 10 (`design/DS-EXTENSION-BRIEF-10.md`). **Les 79 fichiers
sont recopiés ici, aux mêmes chemins, identiques au caractère près.** La
planche est toute en source, comme celles des retours 07 et 09. Rien n'a
bougé hors de ce dossier dans le projet : `list_files` n'y montre aucun autre
chemin neuf, et l'ancre de la synchro (`_ds_sync.json`, `bundleSha12`
`9974368b8c6c`) est celle de B15.

**Comment l'identité est garantie.** Chaque fichier a été lu par `DesignSync`
(`get_file`), par deux sous-agents au premier plan, puis **écrit par un script
depuis la réponse brute de `get_file`**, telle que la gardent les
transcriptions de la session (du JSON, donc au caractère près) ; les trois
réponses trop longues pour l'écran (`COPY.md`, `board/copy.js`,
`board/system-snapshot.css`) sont lues dans leur fichier de résultat, du même
JSON. Aucune réponse n'était tronquée. La méthode a d'abord été vérifiée sur un
fichier connu (`design/ds-extension-10/README.md`, relu par script : identique
à l'octet). Le retour contient 168 U+202F et 6 U+00A0.

**Un fichier changé après la copie, pour CodeQL.** C'est la même ligne que
dans les retours 07 et 09, revenue telle qu'avant sa correction, et la règle
du dépôt est de corriger une alerte, pas de l'écarter :

- `board/make-copy.mjs` : une cellule échappe les barres obliques inverses
  avant les `|` (*incomplete string escaping*), comme au retour 09.

`COPY.md` régénéré par `make-copy.mjs` après ce changement est identique à
l'octet. Les deux autres lignes corrigées aux retours précédents n'y sont pas :
`board/board.js` prend déjà l'écran dans la liste connue (`SCREENS.find(…)`),
et la planche n'a pas de `r07/EngineLanding.js`. **Hors de ce fichier, les 78
autres restent identiques au retour.**

**Ce qui se rejoue.** `node board/market-check.mjs` passe ses 37 contrôles
contre la table du brief (le revenu net, le MRR des abonnements, le total, les
fuites, l'économie de chaque côté, la trésorerie). La planche se sert en http
comme celle du retour 09, avec les polices du dépôt à la place de
`../../../fonts/fonts.css` (`.design-sync/fonts/brand-fonts.css` et ses quatre
`.woff2`).

**Ce que la planche ne prouve pas.** Son modèle (`board/market.js`) est une
réplique de §22.5, écrite pour vérifier les écrans : le produit garde
`mkt-model.ts` et les modules de MKT-2 à MKT-4. Ses hauteurs « avant » sont
celles des captures du brief, pas une mesure de la planche ; ses écarts sont
utilisables, la vraie mesure se prend au portage (MKT-7), avec
`scripts/engine-density.capture.ts`. Ses mots ne sont pas tous ceux de §22 :
où le retour et la spécification nomment la même chose autrement (« vendeur
payant » ou « vendeur abonné », les noms des chiffres de §22.4.4), la question
est posée à Antoine (`CHANTIERS.md` C, C94 à C103).
