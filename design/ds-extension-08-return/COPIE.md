# Comment ce retour est arrivé ici

*Note de la session, 2026-10-02. Tout le reste de ce dossier est le retour de
Claude Design tel quel ; ce fichier seul n'en fait pas partie.*

Claude Design a écrit son retour dans le projet « Tour de Growth »
(`23b9671c-a55b-452e-aa41-39906ee71ba8`), sous `design/ds-extension-08-return/`,
en réponse au brief 08 (`design/DS-EXTENSION-BRIEF-08.md`). La session l'a
recopié ici fichier par fichier (`DesignSync`, `get_file`) : **les 28
fichiers, aux mêmes chemins**. Rien n'est resté dans le projet : la planche est
toute en source, sans PNG ni fichier construit, comme le brief le demandait.

**La planche s'ouvre depuis le dépôt**, servie en http (les modules ES ne se
chargent pas depuis `file://`). `board.html` cherche les polices à
`../../../fonts/fonts.css`, le chemin du projet Claude Design ; celles du dépôt
sont dans `.design-sync/fonts/` (`brand-fonts.css`). Sans elles, la planche
retombe sur les piles système et se lit quand même. Son script de contrôle
(`board/check.cjs`) demande le paquet `playwright` ; le dépôt a
`playwright-core`, que la session lui a donné par `NODE_PATH`.

**Rejouée le 2026-10-02 dans Chromium**, avec les polices du dépôt, par son
propre `check.cjs` : 252 états (7 pages × 2 langues × 9 fenêtres × haut de page
et défilé), **aucun problème** ; 50 cibles mises de côté, toutes celles du
bandeau d'aujourd'hui sous 560 px, comme le README l'annonce (Q8, 3). Le
parcours au clavier, les chiffres « Et si » du moteur (70 px sous l'en-tête
compact, 134 sous l'en-tête plein), le mouvement réduit (aucune transition) et
l'absence de script (l'en-tête d'aujourd'hui, `--sticky-offset` à 118 px)
donnent ce que dit le README.

**Recopié à la main** : une espace insécable ne se distingue pas d'une espace
ordinaire à la lecture. Dans la prose des `.md` et dans les chaînes françaises
de la planche (« Où ton funnel perd-il du monde ? »), une insécable a pu
devenir une espace. Les deux `content: "\b7"` de `SpaceBand.css` sont recopiés
tels quels, avec leur échappement. En cas de doute, la version du projet fait
foi.

**Ce que Claude Design n'a pas touché, vérifié** : hors de ce dossier, la liste
des fichiers du projet est celle d'avant. Le seul autre dossier neuf,
`design/ds-extension-07-return/`, est le retour du brief 07 (B10), qu'une autre
session suit.

## Ce qu'Antoine a tranché sur ce retour (2026-10-02)

Les deux points que le README demande de confirmer, posés dans la session qui a
recopié le retour, avec la recommandation en premier :

- **Les clics sur la course compacte se comptent à part** : le détail
  `space_band_compact` entre dans les listes fermées des entrées du moteur et du
  jeu, et `/admin/stats` le montre. On saura si quelqu'un se sert de la course
  compacte.
- **Le sélecteur de langue passe à 88 px partout**, téléphone tenu droit
  compris : `Segmented` `sm` prend `min-width: 42px`, et ses deux cibles font
  enfin 44 × 44 px.

Le troisième point, la règle de `globals.css` qui coupe le `scroll-padding-top`
quand le focus est dans l'en-tête, corrige un défaut d'aujourd'hui (une
tabulation dans l'en-tête faisait remonter la page) : elle est portée telle
quelle.

Le reste du retour est la réponse de Claude Design au brief, et le portage le
suit tel quel (A18 de `CHANTIERS.md`).
