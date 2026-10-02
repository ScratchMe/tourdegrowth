# Comment ce retour est arrivé ici

*Note de la session, 2026-10-02. Tout le reste de ce dossier est le retour de
Claude Design tel quel ; ce fichier seul n'en fait pas partie.*

Claude Design a écrit son retour dans le projet « Tour de Growth »
(`23b9671c-a55b-452e-aa41-39906ee71ba8`), sous `design/ds-extension-07-return/`,
en réponse au brief 07 (`design/DS-EXTENSION-BRIEF-07.md`). **Les 101 fichiers
sont recopiés ici, aux mêmes chemins, identiques au caractère près.** Rien ne
reste dans le projet : la planche est toute en source.

**Comment l'identité est garantie.** Une copie qui passe par un modèle perd
les espaces insécables : U+00A0 et U+202F y redeviennent des espaces
ordinaires (c'est arrivé aux retours 04 et 05, dit dans leur `COPIE.md`). Ici,
les fichiers ont d'abord été lus par `DesignSync` (`get_file`) et réécrits à la
main, puis **chacun a été réécrit par un script depuis la réponse brute de
`get_file`**, telle que la gardent les transcriptions de la session (du JSON,
donc au caractère près). Avant ce passage, 95 fichiers étaient déjà identiques
et 6 ne différaient que par des espaces insécables ; après, les 101 le sont.
Le retour contient 86 U+202F et 2 U+00A0, dont `const NNBSP` dans
`board/copy.js` (la typographie française de toute la copie) et la regex des
séparateurs de `board/sys/NumberField.js`.

**La planche se rejoue depuis le dépôt**, servie en http (les modules ES ne se
chargent pas depuis `file://`). `board.html` cherche les polices à
`../../../fonts/fonts.css`, le chemin du projet Claude Design. Le dépôt ne l'a
pas : ses polices sont dans `.design-sync/fonts/` (`brand-fonts.css`). Pour
rejouer, servir un dossier où `fonts/fonts.css` est une copie de
`brand-fonts.css` (avec ses quatre `.woff2`) et `design/` le dossier du dépôt.
Rejouée le 2026-10-02 dans Chromium avec ces polices : **les 27 écrans, dans
les deux langues, à 1 280, 390 et 320 px (162 états)**, sans erreur de script
ni défilement horizontal. À 320 px, la planche s'ouvre sans `w=` : elle ne
connaît que 390 et 1 280, et dessine un cadre de 1 280 px quand on lui en
demande une autre.

**Ce qui n'est pas lancé** : `board/measure.cjs` réécrit `board/measures.js`.
Le lancer ici modifierait le retour ; ses mesures sont celles que le README
cite, prises par Claude Design avec ses propres polices.

**Ce que Claude Design n'a pas touché, vérifié** : hors de ce dossier, la
liste des fichiers du projet est celle d'avant. Seuls s'y ajoutent
`design/DS-EXTENSION-BRIEF-08.md` et `design/ds-extension-08/`, déposés par
une autre session (B11).
