# Comment ce retour est arrivé ici

*Note de la session, 2026-09-30. Tout le reste de ce dossier est le retour de
Claude Design tel quel ; ce fichier seul n'en fait pas partie.*

Claude Design a écrit son retour dans le projet « Tour de Growth »
(`23b9671c-a55b-452e-aa41-39906ee71ba8`), sous `design/ds-extension-04-return/`.
La session l'a recopié ici fichier par fichier (`DesignSync`, `get_file`) :
les 46 fichiers texte, aux mêmes chemins.

**Restés dans le projet, et pourquoi** :
- `board/png/` (les huit planches rendues) : des images, que l'outil ne sait
  pas rapatrier. La session a rejoué la planche sur les vrais composants à la
  place (`JOURNAL.md`, entrée d'A10.a).
- `board/board.js` et `board/system-snapshot.css`, que `board.html` charge :
  le build de `board.jsx` et une copie des feuilles du système telles que le
  projet les avait. Sans eux `board.html` ne s'ouvre pas depuis ce dossier ;
  `board.jsx` en est la source.

**Recopié à la main** : les espaces insécables (U+00A0, U+202F) ne se
distinguent pas d'une espace ordinaire à la lecture. Là où le texte disait
lequel il fallait (`NumberField.jsx`, les chaînes françaises de `board.jsx`),
ils ont été remis ; ailleurs, dans la prose des `.md`, une insécable a pu
devenir une espace. En cas de doute, la version du projet fait foi.
