# Comment ce retour est arrivé ici

*Note de la session, 2026-10-01. Tout le reste de ce dossier est le retour de
Claude Design tel quel ; ce fichier seul n'en fait pas partie.*

Claude Design a écrit son retour dans le projet « Tour de Growth »
(`23b9671c-a55b-452e-aa41-39906ee71ba8`), sous `design/ds-extension-06-return/`.
La session l'a recopié ici fichier par fichier (`DesignSync`, `get_file`) :
les huit fichiers texte, aux mêmes chemins (`README.md`, les quatre de `og/`,
les trois de `preview/`).

**Restés dans le projet, et pourquoi** : les quatre images de `render/`
(`engine-og-fr.png`, `engine-og-en.png` et leurs versions à 320 px). L'outil
ne rapatrie pas une image. Elles ne manquent pas : ce sont des rendus des
sources de `og/`, et la session a fait dessiner ces mêmes sources, sans y
toucher, par le Satori du dépôt (`next/og`, avec les cinq polices de
`src/lib/og/fonts/`). Le README dit que les siennes viennent de Satori 0.33.5 ;
celui de `next/og` est une autre version, d'où de petits écarts d'anticrénelage
possibles, jamais de mise en page. C'est contre ce rendu que le portage a été
comparé (`JOURNAL.md`, entrée de T6.2).

**Recopié à la main** : les espaces insécables (U+00A0) ne se distinguent pas
d'une espace ordinaire à la lecture. Dans `og/strings.og.mjs`, la constante
`NB` a été remise à U+00A0, comme son commentaire le demande ; ailleurs, dans
la prose du `README.md`, une insécable a pu devenir une espace. En cas de
doute, la version du projet fait foi.

**Ce que le portage n'a pas repris tel quel** est dit dans le journal et au
§19.11 de `docs/engine/moteur-complet.md`, pas ici : ce dossier reste le
retour, et non son interprétation.
