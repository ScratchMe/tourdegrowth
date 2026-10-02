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
| **Extension 05** : les puces d'étape, une valeur qui a l'allure d'un bouton (loi de similarité, A15.19) | 2026-10-01 | [`DS-EXTENSION-BRIEF-05.md`](DS-EXTENSION-BRIEF-05.md), captures dans `ds-extension-05/`, retour dans [`ds-extension-05-return/`](ds-extension-05-return/README.md) (avec `COPIE.md`, et C34 et C35) | Retour reçu le 2026-10-02 : la feuille de score. Portée le 2026-10-02 (A16, [#271](https://github.com/ScratchMe/tourdegrowth/pull/271)) ; sa re-synchro est `CHANTIERS.md` B9 |
| **Extension 06** : l'image de partage du moteur (B5, C32 Q17) | 2026-10-01 | [`DS-EXTENSION-BRIEF-06.md`](DS-EXTENSION-BRIEF-06.md), captures dans `ds-extension-06/` (les images de partage du site, la page du moteur, son peloton), retour dans [`ds-extension-06-return/`](ds-extension-06-return/README.md) | Portée (T6.2, 2026-10-01) : le chronomètre et le pictogramme sont ceux du produit, pas leurs redessins (`COPIE.md`, `JOURNAL.md`) |
| **Extension 07** : le moteur plus simple, sans perdre son expertise (B10) | 2026-10-02 | [`DS-EXTENSION-BRIEF-07.md`](DS-EXTENSION-BRIEF-07.md), captures dans `ds-extension-07/` (seize écrans, en français à 1 280 px et en anglais à 390 px, mesurés), avec `CATALOGUE.md` (chaque chiffre tel que la page l'imprime) | Retour reçu le 2026-10-02 dans [`ds-extension-07-return/`](ds-extension-07-return/README.md) (avec `COPIE.md`, et C38, C40 à C42) : le pas à pas fondu dans le tableau, une liste par étape, une seule prochaine étape. Portage : `CHANTIERS.md` A18 |
| **Extension 08** : l'en-tête collant, compact une fois la page défilée en paysage (B11) | 2026-10-02 | [`DS-EXTENSION-BRIEF-08.md`](DS-EXTENSION-BRIEF-08.md), captures dans `ds-extension-08/` (l'en-tête sur chaque sorte de page, à 1 280 × 720, en paysage et en portrait sur téléphone, mesuré) | Retour reçu le 2026-10-02 dans [`ds-extension-08-return/`](ds-extension-08-return/README.md) (avec `COPIE.md`, et C43, C44) : une ligne de 48 px en paysage une fois la page défilée, 54 px peints au lieu de 118. **Porté le même jour** : `CHANTIERS.md` A19. Numéroté 08 : le 07 (le moteur plus simple, B10) était déjà dans le projet |

Dans l'autre sens, le système du code part vers le projet Claude Design par la
design sync : `.design-sync/` (lire `NOTES.md` avant toute re-synchro).
