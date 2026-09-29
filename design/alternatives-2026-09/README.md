# Six directions de design, posées sur le vrai site (2026-09-28)

Maquettes de travail, pas du code produit. Aucun fichier d'ici n'est importé par l'application.
Page de comparaison (privée) : https://claude.ai/artifact/XJse5sJWP8uamShXB7qMoj

| Id | Direction | Famille | Signe des trois espaces |
|---|---|---|---|
| `ib` | **La synthèse, piste retenue par Antoine** : la base de I, avec de B le bandeau d'étape, le moteur en outremer, la borne et le profil d'étape | garde l'identité | le bandeau d'étape : Tour rouge, moteur outremer, jeu ocre |
| `ib-ink` | La même, bandeau du Tour à l'encre (généré par `sources/ib/mkink.mjs`) | garde l'identité | Tour encre, rouge gardé au pictogramme |
| `i` | L'existant, en mieux (demandée par Antoine) | garde l'identité | trois dossards : № 1 papier, № 2 millimétré bleu, № 3 nuit ambre |
| `a` | Jour de course | garde l'identité | les maillots : jaune, vert, à pois |
| `b` | Affiche et carnet de route | garde l'identité | le type d'étape : plaine rouge, contre-la-montre outremer, montagne ocre |
| `h` | Heure bleue | change d'identité | l'heure du ciel : crépuscule, heure bleue, pleine nuit |
| `e` | Le Journal du growth | change d'identité | les rubriques : Le Diagnostic, Les Chiffres, Le Feuilleton |
| `f` | L'arcade du côté obscur | change d'identité | les mondes : 1 cyan, 2 vert, 3 magenta |

## Comment c'est fait

Chaque direction est une surcouche du **build de production** : une feuille `designs/<id>.css`, dont toutes les règles sont préfixées par `html[data-alt="<id>"]`, et au besoin un script `designs/<id>.js`, qui n'ajoute que du DOM décoratif, bilingue et `aria-hidden`. `harness.mjs` ouvre le vrai site, y pose la surcouche et capture sept écrans en 1280 et 390 px. Les classes de CSS Modules reçoivent un alias lisible (`Foo-module__h4sh__bar` → `Foo--bar`). Les images de partage sont des maquettes HTML en 1200 × 630 (`share/`). Chaque direction a sa fiche dans `notes/<id>.md` : thèse, contrastes mesurés, polices, risques, coût.

`sources/` contient les fichiers d'où certaines surcouches sont compilées ; les scripts compilés embarquent l'image de partage. Pour `ib`, `sources/ib/` garde aussi le générateur de la variante encre, celui des images de partage et le script d'audit des captures (contraste de chaque nœud de texte composé sur son fond réel, largeur de page) ; ils attendent un dossier `work/` à côté de `designs/`.

## Rejouer

1. Copier ce dossier hors du dépôt, puis lancer `node getfonts.mjs` : il télécharge les polices, qui ne sont pas versionnées.
2. Construire l'app avec `GAME_ENABLED=true`, puis lancer `ADMIN_DASHBOARD_PASSWORD=e2e-admin npx next start -p 3300`.
3. Lancer `node harness.mjs shoot <id>`, puis `node share.mjs <id>`, puis `node build-site.mjs` pour la page de comparaison.

Les chemins absolus des scripts sont ceux de la session qui les a écrits : à adapter.
