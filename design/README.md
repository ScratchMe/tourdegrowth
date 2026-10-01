# design/ — ce que Claude Design a dessiné, et ce qu'on lui a demandé

Rien ici n'est importé par l'application : le code (`src/components/`,
`src/styles/tokens/`) fait foi pour l'état actuel du système. Ce dossier garde
les briefs, ce qui est revenu, et les maquettes de travail, dans l'ordre où
c'est arrivé. Un retour de Claude Design fait autorité pour son extension,
comme le brief d'origine pour le lancement.

| Quoi | Date | Fichiers | État |
|---|---|---|---|
| **Le handoff d'origine** (direction B, « Marquage au sol ») | août 2026 | [`DESIGN-BRIEF.md`](DESIGN-BRIEF.md), `Tour de Growth.dc.html` (les 9 écrans sur une toile, à ouvrir dans un navigateur ; `support.js` le fait tourner), `direction-b-marquage-sol.html` | Porté au lancement |
| **Extension 01** : cinq composants construits hors du système | 2026-09-06 | [`DS-EXTENSION-BRIEF-01.md`](DS-EXTENSION-BRIEF-01.md), captures dans `ds-extension-01/`, retour dans `ds-extension-01-return/` | Portée |
| **Brief 02** : le roast invisible avant la 15ᵉ question | 2026-09-07 | [`DS-EXTENSION-BRIEF-02.md`](DS-EXTENSION-BRIEF-02.md), captures dans `ds-extension-02/` | **Jamais envoyé** : le brief 03 l'a remplacé |
| **Extension 03** : le résultat doit dire quoi faire | 2026-09-09 | [`DS-EXTENSION-BRIEF-03.md`](DS-EXTENSION-BRIEF-03.md), captures dans `ds-extension-03/`, retour dans `ds-extension-03-return/` (avec `ANSWERS-EXT-03.md`) | Portée (`REVIEW-03.md`) |
| **Six directions, puis la synthèse I + B** | 2026-09-28 | [`alternatives-2026-09/`](alternatives-2026-09/README.md) : brief, notes par direction, outils de rendu | I + B retenue, en production |
| **Extension 04** : les primitives de formulaire | 2026-09-29 | [`DS-EXTENSION-BRIEF-04.md`](DS-EXTENSION-BRIEF-04.md), captures dans `ds-extension-04/`, retour dans [`ds-extension-04-return/`](ds-extension-04-return/README.md) | Portée (A10, 2026-09-30) |
| **Le prototype du jeu** | 2026-09 | `game/prototype-s-ils-reviennent.html`, jouable seul dans un navigateur | Référence de `GAME-BRIEF.md` |
| **Les lois de l'UX, traduites** | 2026-10-01 | [`LOIS-UX.md`](LOIS-UX.md) : les règles tirées de [Laws of UX](https://lawsofux.com/), avec l'état du produit ce jour-là | À relire avant de dessiner un écran (correctifs : `CHANTIERS.md` A15) |
| **Extension 05** : les puces d'étape, une valeur qui a l'allure d'un bouton (loi de similarité, A15.19) | 2026-10-01 | [`DS-EXTENSION-BRIEF-05.md`](DS-EXTENSION-BRIEF-05.md), captures dans `ds-extension-05/`, retour attendu dans `ds-extension-05-return/` | **Déposé** dans le projet Claude Design le 2026-10-01, retour attendu (`CHANTIERS.md` B7, D11) |
| **Extension 06** : l'image de partage du moteur (B5, C32 Q17) | 2026-10-01 | [`DS-EXTENSION-BRIEF-06.md`](DS-EXTENSION-BRIEF-06.md), captures dans `ds-extension-06/` (les images de partage du site, la page du moteur, son peloton), retour attendu dans `ds-extension-06-return/` | **Déposé** dans le projet Claude Design le 2026-10-01, retour attendu (`CHANTIERS.md` B5, D12) ; le retour se porte en T6.2 |

Dans l'autre sens, le système du code part vers le projet Claude Design par la
design sync : `.design-sync/` (lire `NOTES.md` avant toute re-synchro).
