---
name: bon-a-tirer
description: Construit le prochain bon à tirer — la page où Antoine tranche, carte par carte, la copie marquée « TODO: à relire » — puis applique ses décisions une fois qu'il a tranché. Appelé par Antoine, jamais de lui-même.
disable-model-invocation: true
---

# Bon à tirer

Toute chaîne neuve ou retouchée repart au statut « à relire » (convention 6 de
`CLAUDE.md`) : c'est Antoine qui approuve, jamais la session. Le bon à tirer est
la page où il le fait. Il y en a eu huit, et chacun a appris quelque chose à ses
dépens. Ce skill en garde la méthode.

Argument facultatif : `appliquer` pour passer directement à l'étape 5 sur le
dernier bon à tirer ouvert.

## 1. L'inventaire vient du grep, jamais de la mémoire

```
grep -rn "TODO: à relire" src/
```

C'est la seule liste qui compte. Trois fois, ce grep a rattrapé un oubli que la
mémoire avait laissé passer : six chaînes de progression, trois de la relance à
30 jours, puis « six marqueurs » annoncés pour dix réels. Un compte écrit dans
`CLAUDE.md` ou dans le journal est ce qui était vrai quand on l'a écrit.

- Grouper par **unité de décision**, pas par chaîne : une question avec ses
  actions côte à côte, un terme de glossaire, les libellés d'un même écran. La
  vraie question de relecture (« ces deux textes disent-ils deux choses
  différentes ? ») ne se voit que si les deux sont sur la même carte.
- Retirer ce qui est déjà dans un bon à tirer **encore ouvert** : la table
  « Ce qui reste ouvert » de `CLAUDE.md` les liste. Une chaîne ne se tranche pas
  dans deux documents.
- Une vraie décision (un fait douteux, un repère qui désigne sans source) va dans
  une section « À trancher », en tête, séparée de la relecture.

## 2. Les textes viennent du code, jamais d'une recopie

Relire une copie retapée qui aurait dérivé du code serait pire que ne pas
relire : on validerait un texte qui n'est pas celui qui s'affiche.

- Sonde jetable, `scripts/live/_bat-export.live.ts`, lancée avec
  `npx vitest run --config vitest.live.config.ts scripts/live/_bat-export.live.ts`.
  C'est le seul lanceur du dépôt qui résout TypeScript **et** l'alias `@/` : la
  sonde importe les vrais modules (`@/content/...`, `@/lib/i18n/dictionary`) et
  écrit un JSON dans le scratchpad, pas dans le dépôt.
- La supprimer ensuite, et vérifier `git status` propre.
- Les deux langues, toujours : une `Translatable` est deux textes, et Antoine ne
  relit que le français. Le parallèle et la typographie de l'anglais sont la part
  de la session.

## 3. La page : le gabarit du dernier bon à tirer, pas un nouveau

- **Lire le dernier bon à tirer publié** avec l'outil Artifact (`action: read`),
  sur l'URL que donne la table de `CLAUDE.md`, et repartir de ce fichier. Ne
  remplacer que le bloc `<script type="application/json" id="payload">`, le
  bandeau et le titre. Le moteur de rendu (environ 250 lignes) ne se réécrit
  pas de mémoire : c'est ce qu'on a fait au nº4, et il ne relisait pas ses
  propres décisions.
- **Le contrat de décision**, inchangé depuis le nº5 : un document par carte,
  `cards/<id>`, avec `{ status: "ok" | "change" | "cut" | null, note, reply }`.
  Un `onSnapshot` sur une collection livre un **`QuerySnapshot`** : on lit
  `snap.docs`, puis `doc.data()`. Le nº4 lisait un tableau et levait
  `docs.forEach is not a function` à la première livraison : les décisions
  s'écrivaient et ne revenaient jamais.
- **Des ids uniques**, vérifiés par script avant de publier : un id en double
  écrase en silence la décision d'une autre carte.
- **Le français affiché, l'anglais à un clic** (par carte, ou partout d'un
  coup). Chaque `{gabarit}` est expliqué dans le paragraphe gris de sa carte ;
  quand c'est utile, un exemple montre le texte rempli.
- **Publier** comme un nouvel artifact (nº N+1), avec `capabilities: { db: {} }`
  et une icône. Le payload tient sur une ligne : un motif d'extraction doit
  s'ancrer sur la balise fermante, pas sur un point-virgule.
- **Vérifier le rendu** dans Chromium à 1280 et 390 px, avec
  `scrollWidth === clientWidth` aux deux largeurs. Une clé comme
  `comparisonPage.glossaryHeading` est un jeton insécable qui a déjà poussé une
  carte 41 px hors d'un écran de 390 : `minmax(0, 1fr)` sur la piste,
  `overflow-wrap: anywhere` sur le titre.

## 4. Consigner avant de le donner

- Une ligne dans la table « Ce qui reste ouvert » de `CLAUDE.md` : le lien, le
  nombre de cartes, la collection (`cards/`).
- L'entrée habituelle à la fin de `JOURNAL.md`.

## 5. Quand Antoine a tranché

- **Lire la base de la bonne page, dans le bon tiroir** (outil `ArtifactData`,
  liste de la collection). Les nº1 à nº3 écrivent dans `reviews/`, le nº4 dans
  `lines/`, les nº5 et suivants dans `cards/`. Avoir conclu « jamais ouvert »
  en lisant le mauvais tiroir est arrivé une fois.
- **« ok »** : lever le marqueur `TODO: à relire` de ces chaînes, et de
  celles-là seulement.
- **« change »** : réécrire dans les deux langues, puis **répondre sous sa note**
  (`cards/<id>.reply`, par `ArtifactData`), pas dans le salon : la conversation
  vit avec la décision. La réponse dit aussi ce qu'on n'a **pas** touché.
  Chercher la **classe** du défaut signalé, pas seulement son instance : un
  calque signalé sur une page était souvent aussi ailleurs (et dans l'anglais,
  qu'il ne relit pas).
- **« cut »** : retirer, puis dire ce que la coupe a entraîné (liens, maillage,
  redirections : une URL publiée ne meurt jamais ici).
- Quand des mots de contenu changent : bouger `updatedAt` du terme ou
  `CONTENT_UPDATED_AT` (`src/content/updated-at.ts`), jamais pour un simple
  changement de chrome ou de typographie.
- Vérifier sur le build, pas dans le module : décoder les entités HTML avant de
  chercher une phrase (`&#x27;` pour l'apostrophe, `TESTING.md` §2.3bis).
- Entrée de journal, puis ligne mise à jour ou retirée dans la table de
  `CLAUDE.md`.
