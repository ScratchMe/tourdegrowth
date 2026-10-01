# Comment ce retour est arrivé ici

*Note de la session, 2026-10-02. Tout le reste de ce dossier est le retour de
Claude Design tel quel ; ce fichier seul n'en fait pas partie.*

Claude Design a écrit son retour dans le projet « Tour de Growth »
(`23b9671c-a55b-452e-aa41-39906ee71ba8`), sous `design/ds-extension-05-return/`,
en réponse au brief 05 (`design/DS-EXTENSION-BRIEF-05.md`). La session l'a
recopié ici fichier par fichier (`DesignSync`, `get_file`) : **les 22
fichiers, aux mêmes chemins**. Rien n'est resté dans le projet cette fois : la
planche est toute en source, sans PNG ni fichier construit, comme le brief le
demandait après le retour 04.

**La planche s'ouvre depuis le dépôt**, servie en http (les modules ES ne se
chargent pas depuis `file://`). `board.html` cherche les polices à
`../../../fonts/fonts.css`, le chemin du projet Claude Design. Le dépôt ne l'a
pas : les polices du dépôt sont dans `.design-sync/fonts/` (`brand-fonts.css`).
Sans elles, la planche retombe sur les piles système et se lit quand même.
Rejouée le 2026-10-02 dans Chromium avec ces polices, aux huit cadres
(`paper`/`night`, `en`/`fr`, `390`/`1280`) : aucune erreur de script, aucun
défilement horizontal, des lignes d'au moins 44 px, et des jauges de même
longueur sur chaque feuille (220 px au bureau, 166 px au téléphone ; le
retour annonce 223 et 163, mesurés avec ses propres polices).

**Recopié à la main** : les espaces insécables ne se distinguent pas d'une
espace ordinaire à la lecture. `board.js` déclare `const NB` comme U+00A0, ce
que son commentaire dit (« a no-break space before « : » ») : il a été remis.
Ailleurs, dans la prose des `.md` et les exemples de chaînes françaises des
`.prompt.md` et `.d.ts` (« Score par étape, sur 20 », « Acquisition —
définition »), une insécable a pu devenir une espace. En cas de doute, la
version du projet fait foi.

**Ce que Claude Design n'a pas touché, vérifié** : hors de ce dossier, la liste
des fichiers du projet est celle d'avant (le dossier `ds-extension-06` vient
de B5, une autre session). `DefinitionTrigger.jsx` a toujours l'empreinte que
`_ds_sync.json` lui donne (`sha256`, 12 premiers caractères), et les contrats
`PillarChip.prompt.md` et `DefinitionTrigger.prompt.md` du projet sont ceux de
la dernière synchro : aucun ne mentionne l'extension 05.

## Ce qu'Antoine a tranché sur ce retour (2026-10-02)

Posé dans la session qui a recopié le retour, la planche sous les yeux :

- **C34, le rouge des étapes ex aequo** (réponse 8.3, la recommandation de
  Claude Design) : **toutes les étapes à égalité en bas prennent le rouge**.
  Le rouge de la feuille suit la netteté du frein (`Bottleneck`) : une ligne
  sur `clear`, tout le groupe sur `shared`, aucune sur `level`. La feuille dit
  alors la même chose que le profil du parcours, qui signale déjà tout le
  groupe. La règle « au plus une puce rouge » du brief tombe.
- **C35, le nouveau « ? »** (réponse 4) : **partout, quiz compris**. Un seul
  dessin du bouton de définition dans le produit.
- **Le portage se fait dans la même session** : lot A16 de `CHANTIERS.md`.

Le reste du retour est la réponse de Claude Design au brief, et le portage le
suit tel quel : la feuille d'une colonne à toutes les largeurs, le lien sur le
nom de l'étape à l'accueil, le tampon du roast redessiné, la jauge rouge en
`--viz-highlight-text`.
