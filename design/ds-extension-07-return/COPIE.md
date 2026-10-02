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

**Quatre lignes changées après la copie, pour CodeQL** (alertes de la PR
#282, deux hautes et deux moyennes). La règle du dépôt est de corriger une
alerte, pas de l'écarter, et deux d'entre elles touchent ce que le portage
reprendra :

- `components/engine/EngineLanding/EngineLanding.js` : `engineKnownScript`
  échappe `<`, `>`, `/`, U+2028 et U+2029 dans la clé avant de l'écrire dans le
  `<script>` en ligne (*bad code sanitization*). La clé est une constante du
  moteur, mais c'est la règle que le portage doit garder ;
- `board/board.js` : l'écran demandé dans l'adresse n'appelle une fonction de
  `RENDER` que si `RENDER` la possède (*unvalidated dynamic method call*) ;
  sinon, l'écran du retour ;
- `board/make-copy.mjs` : une cellule échappe les barres obliques inverses
  avant les `|` (*incomplete string escaping*), et le remplacement de U+202F
  par lui-même, qui ne faisait rien, est retiré (*replacement of a substring
  with itself*).

`COPY.md` régénéré par `make-copy.mjs` après ces changements est identique à
l'octet, et la planche se rejoue de même (ci-dessous). **Hors de ces trois
fichiers, les 98 autres restent identiques au retour.**

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

## Ce qu'Antoine a tranché sur ce retour (2026-10-02)

Posé dans la session qui a recopié le retour, la planche sous les yeux (le
retour au moteur à 1 280 et 390 px, et l'écran d'un chiffre) :

- **C40, le pas à pas et le tableau** (réponses 11, 12 et 14) : **fondus en
  un**, comme le propose le retour, **mais un écran « Cibles » est gardé au
  début**, sautable, pour une équipe qui a ses cibles sous la main. La cible
  se saisit aussi sur l'écran de son chiffre (« Comment il se situe ») et dans
  les Réglages. L'écran « Base » part.
- **C41, les onglets d'étape** (réponse 16) : **une liste par étape**, la
  reco. La décision du 2026-09-26 est renversée.
- **C42, les mots** (réponse 19) : **tous les renommages**, relus au bon à
  tirer.
- **C38, l'ordre** : **le portage d'abord**, puis un seul bon à tirer qui
  absorbe A7.3.d et A14.d.

Le portage est le lot A18 de `CHANTIERS.md`. Le reste du retour est la réponse
de Claude Design au brief, et le portage le suit tel quel. La trouvaille 9 (la
clause rouge du verdict peut nommer une autre étape que le diagnostic) est
posée au bon à tirer, comme le retour le propose.
