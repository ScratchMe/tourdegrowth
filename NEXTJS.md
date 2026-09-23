# Next.js (App Router) — pièges rencontrés et leur correctif

Extraits du journal de `CLAUDE.md`, distillés pour être réutilisables. La §1
vaut sur n'importe quel projet App Router ; la §2 est propre à Tour de Growth.

Version de référence : **Next.js 16 / React 19 / Turbopack**. Les points datés
d'une rupture d'API sont signalés comme tels.

> **Quand lire ce fichier** : avant de toucher aux layouts racine, au proxy,
> aux routes de métadonnées, au découpage des chunks, ou avant de conclure
> qu'un comportement de rendu est un bug de notre code.

---

## 1. Ce qui vaut sur n'importe quel projet App Router

### 1.1 Next 16 renomme `middleware` en `proxy`, en silence

`middleware.ts` / `export function middleware` sont dépréciés — et **rien ne
le signale** : ni au démarrage de `next dev`, ni par une erreur. Le fichier
est simplement ignoré. Pire, `next build` continue d'afficher
`ƒ Proxy (Middleware)` dans le résumé des routes même quand le fichier est
totalement inopérant, ce qui masque le problème à la vérification la plus
évidente.

Trois conditions, toutes nécessaires :

1. Le fichier s'appelle **`proxy.ts`** et exporte une fonction **`proxy`**.
2. Il est **au même niveau que `app/`** — donc `src/proxy.ts` si l'App Router
   vit dans `src/app/`. Un fichier posé à la racine du dépôt est ignoré.
3. Après renommage ou déplacement, **redémarrer complètement `next dev`** : le
   hot-reload ne redétecte pas un fichier de convention.

Symptôme typique : une logique parfaitement testée unitairement qui n'a
strictement aucun effet à l'exécution.

*Au passage* : Next 16 réinjecte un bloc « agent rules » dans `CLAUDE.md` à
chaque `next dev`. Désactivable par `agentRules: false` dans
`next.config.mjs` — un fichier tenu à la main n'est pas un endroit où laisser
un outil de build écrire.

### 1.2 Layouts racine : la frontière la plus chère du framework

**Traverser une frontière de layout racine force un chargement de document
complet.** `window` est réinitialisé, l'état client est perdu, et une
navigation qui était instantanée devient un rechargement.

Trois conséquences qui ne se devinent pas :

- **Next ne l'apprend qu'après avoir préchargé.** Il télécharge l'arbre de
  route, découvre qu'il change de layout racine
  (`ppr-navigations.js#isNavigatingToNewRootLayout`), puis retélécharge au
  clic, puis recharge la page. Le préchargement est donc **du coût pur**.
  → voir `VERCEL.md` §1.7.
- **Un layout racine n'a pas besoin d'être à la racine d'un groupe de
  routes.** Next exige seulement que chaque route en ait un dans sa chaîne.
  C'est ce qui permet à `app/[locale]/layout.tsx` d'être lui-même le layout
  racine des pages de contenu (et donc de lire le paramètre de langue pour
  `<html lang>`), pendant que `app/(app)/layout.tsx` sert les autres.
- **Le chrome commun doit vivre dans un composant partagé**, appelé par
  chaque layout racine — sinon il diverge en silence entre les deux arbres.

### 1.3 Un groupe de routes renomme les routes de métadonnées

Passer une route sous un groupe `(app)` transforme
`/r/<id>/opengraph-image` en `/r/<id>/opengraph-image-1u74ed`. Ce n'est pas un
hasard : Next ajoute un hash à toute route de métadonnées dont le chemin
parent contient un segment de groupe, pour que deux groupes ne se marchent pas
dessus (`next/dist/lib/metadata/get-metadata-route.js`,
`getMetadataRouteSuffix`).

La balise `og:image` reste cohérente, donc **tout nouveau scrape fonctionne** —
mais l'ancienne adresse est celle que les plateformes ont déjà aspirée. Prévoir
une réécriture de compatibilité, et **épingler le hash par un test** qui
demande l'ancien chemin et exige une vraie image : le hash est généré au build,
donc le coder en dur n'est acceptable que si un test rougit quand Next change
d'algorithme.

### 1.4 404 : `global-not-found.tsx`, et `dynamicParams` plutôt que `notFound()`

Deux corrections nécessaires **ensemble** pour qu'une URL inconnue rende votre
page plutôt que le document d'erreur nu de Next.

1. **`app/not-found.tsx` ne suffit pas** dans une structure à plusieurs layouts
   racine : il se fait imbriquer *dans* le document d'erreur de Next, qui
   revient en `<html id="__next_error__">` sans attribut `lang`. La convention
   correcte est **`global-not-found.tsx`**, que Next monte comme un **layout**
   et non comme une page (`app-render.js#createNotFoundLoaderTree`) — c'est ce
   qui lui permet de rendre son propre `<html>`/`<body>`.
2. **Un `notFound()` levé depuis un layout racine n'a aucune frontière où se
   rendre.** Une route qui *matche puis lève* retombe donc sur le document nu.
   Remplacer le garde par **`dynamicParams = false`** : le segment ne matche
   plus du tout, et `global-not-found` le traite normalement.

> **Le piège de dynamisme qui vient avec.** Si `global-not-found` lit un
> en-tête ou un cookie, **toutes** les routes qui pourraient lever
> `notFound()` deviennent dynamiques — chez nous 36 pages prérendues sont
> repassées en rendu à la demande. La tension se résout en supprimant les
> `notFound()` de l'arbre concerné (point 2) : plus rien ne lève, donc la
> lecture d'en-tête peut revenir sans contaminer personne. **Vérifier le
> résumé de `next build` (`●` vs `ƒ`) après tout changement touchant le 404.**

*Bruit connu* : Next journalise `Internal: NoFallbackError` à chaque 404 sur un
paramètre refusé par `dynamicParams = false`. La réponse est correcte ; c'est
son mécanisme interne qui s'affiche.

### 1.5 `error.tsx` a deux angles morts, mesurés

- **Une panne dans le *shell initial* d'une page n'est pas rendue côté
  serveur.** Si le composant lève au premier `await`, Next sert son document
  minimal (`<html id="__next_error__">`, statut 500, corps vide) et la
  frontière est rendue **côté client après hydratation**. `curl` voit le
  document nu ; un lecteur avec JavaScript voit votre écran. Un `notFound()`
  au même endroit, lui, *est* rendu côté serveur — Next le traite
  spécialement. Y remédier demanderait de déplacer la lecture derrière un
  `<Suspense>` pour que le shell parte avant, ce qui change le chargement de
  toutes les pages concernées.
- **Une erreur levée dans `generateMetadata` contourne complètement
  `error.tsx`.** Envelopper la lecture, et laisser le composant de page (qui
  voit le même rejet via `cache()`) lever dans la frontière.

### 1.6 Turbopack duplique un chunk SSR par groupe de routes

**C'est le piège le plus coûteux de cette liste**, parce qu'il est invisible
et qu'il grossit tout seul.

Turbopack émet **une copie du chunk SSR par groupe de routes**. Donc un module
de contenu importé par un module partagé est **recopié dans chaque groupe** —
et si la facturation est par route (`VERCEL.md` §1.1), multiplié encore.

Chez nous : six fichiers de **397 589 octets à l'octet près**, cinq octets de
différence (le nom de la source map), chacun portant toute la bibliothèque de
contenu.

```bash
# le signe : des chunks de taille identique
find .next/server -name '*.js' -size +50k -exec md5sum {} \; \
  | awk '{print $1}' | sort | uniq -c | awk '$1>1'
```

**La cause n'est presque jamais Turbopack : c'est un fan-in de votre propre
code.** Chez nous, trois :

1. Un module de contenu léger qui importait un module de contenu lourd pour
   exposer un champ qu'**une seule page** lisait.
2. Un helper partagé (nos fils d'Ariane) qui importait neuf modules de contenu
   pour construire une chaîne par page — alors qu'il est traversé par toutes
   les pages. **Un helper partagé reçoit les données de la page en paramètre.**
3. Deux consommateurs qui ne lisaient que deux champs d'un module dont ils
   importaient tout.

**La garde qui l'empêche de revenir mesure l'ATTEINTE, pas le style
d'import** : pour chaque module de contenu volumineux, combien de points
d'entrée de l'App Router le rejoignent en suivant les **imports de valeur**.
Un budget par module, avec sa raison. Un `import type` n'est pas une arête —
TypeScript l'efface, et le test doit le prouver dans les deux sens.

### 1.7 Frontière client : trois chemins qui ramènent ce qu'on croyait sorti

Sortir un gros module du bundle navigateur est facile ; **l'y garder sorti**
demande une garde, parce qu'il revient par des chemins qu'aucune relecture ne
montre :

1. **Une fonction utilitaire qui vit dans le gros module.** Importer `tc()`
   depuis le dictionnaire importe le dictionnaire entier. Extraire la fonction
   dans son propre module ; le gros module la réexporte.
2. **`error.tsx` est un Client Component présent dans le bundle de chaque
   route de son arbre.** Tout ce qu'il importe est expédié partout.
3. **Un Server Component importé PAR un Client Component devient client.**
   Retirer la directive `"use client"` ne suffit donc pas : il faut aussi que
   ses propres imports soient propres.

La garde statique correspondante liste les Client Components (directive dans
les trois premières lignes) et vérifie leurs imports. **Elle ne doit regarder
que les imports de valeur** — un `import type` est effacé, donc inoffensif, et
l'interdire est une fausse alerte qui finit par bloquer un usage légitime.

### 1.8 Un type déclaré n'est pas une frontière

TypeScript accepte un objet **plus large** que le type déclaré dès qu'il n'est
pas un littéral. Donc déclarer `pillars: {pillar, score}[]` sur un composant et
lui passer un objet qui porte trois champs de plus **compile sans un mot** — et
RSC sérialise l'objet réel, champs supplémentaires compris, dans le payload
public.

Une fonction de narrowing explicite est la frontière. Et la garde qui la
protège doit **compter ce qui traverse**, pas nommer des props : nous avons
posé une garde nominale sur un prop, et la fuite est revenue **neuf lignes
plus bas dans le même fichier** par un prop qui n'existait pas encore.

### 1.9 Petits pièges qui coûtent une demi-heure chacun

- **Un dossier de route commençant par `_` est privé** : il n'est jamais
  routé, et rien ne le dit — la route répond simplement 404.
- **CSS Modules n'émet pas une classe qui n'a plus aucune règle.**
  `styles.maClasse` devient `undefined`, donc un sélecteur de test ne trouve
  rien. Piège vicieux lors d'un test de non-vacuité : retirer la seule règle
  d'une classe fait échouer une spec **pour la mauvaise raison**.
- **`npm run build` se lance depuis la racine du paquet quel que soit le
  répertoire courant ; `npx next start` non** — lancé depuis un sous-dossier,
  il échoue sur « Could not find a production build » alors que le build vient
  de réussir.
- **Le moteur de rendu de l'App Router pose son propre `Vary`**
  (`rsc, next-router-*`) et **remplace** celui qu'on met, que ce soit depuis le
  proxy ou via `headers()` dans `next.config.mjs`. D'autres en-têtes de la même
  règle passent, eux. Ne pas prétendre dans le code qu'on contrôle cet en-tête
  sur une page rendue.
- **`revalidateTag` prend un deuxième argument obligatoire** en Next 16 (un
  profil de cache). `{ expire: 0 }` est le cas « oublie ça tout de suite » ; la
  doc renvoie vers `updateTag`, réservé aux Server Actions.
- **Une invalidation de cache ne doit jamais faire échouer la requête.**
  `revalidateTag` lève hors contexte Next : appelé après une écriture réussie,
  il faisait renvoyer une erreur pour un travail **déjà fait et déjà écrit**.
  L'envelopper dans un `try/catch` qui journalise ; le TTL couvre le pire cas.
- **`unstable_cache` plutôt que `"use cache"`** tant qu'on ne veut pas de
  `cacheComponents` dans `next.config` : ce dernier change tout le modèle de
  rendu.
- **Turbopack n'imprime plus les tailles de bundle au build.** Pour surveiller
  un budget : mesurer sur disque, ou chercher une chaîne connue dans les chunks
  réellement référencés par le HTML servi. Attention au chemin : les chunks
  sont servis sous `/_next/static/immutable/chunks/`.

### 1.10 `next/og` et Satori — quatre pièges de police

Satori tourne dans un pipeline de rendu **totalement séparé** : aucune classe
CSS, aucun composant partagé. Les valeurs de tokens sont recopiées à la main.

1. **`fetch(new URL('./fonts/x', import.meta.url))`**, le pattern documenté,
   échoue en Node (`fetch` ne lit pas les URL `file://`). Utiliser
   `readFile(fileURLToPath(...))`.
2. **Un gabarit dans `new URL()` est compilé par Turbopack en un SEUL asset
   statique.** Cinq appels avec un nom de fichier interpolé → cinq fois le même
   fichier, sans erreur. Écrire cinq `new URL("./fonts/<nom>.ttf",
   import.meta.url)` **littéraux**, et ne jamais les refactorer en boucle.
3. **woff2 est refusé** (`Unsupported OpenType signature wOF2`) et **une police
   variable aussi** (`Cannot read properties of undefined`) — et dans ce cas
   Satori abandonne **toute la liste**, donc tout retombe sur une police de
   repli. Convertir en `.ttf` statique une fois pour toutes, et committer.
4. **Un glyphe absent du sous-ensemble est dessiné vide, sans erreur.** Le
   navigateur affiche le caractère (police web complète), l'image non. Poser un
   test qui lit la table `cmap` des polices embarquées et vérifie, famille par
   famille, **toutes les chaînes que les images dessinent réellement**.

---

## 2. Propre à Tour de Growth

### 2.1 Structure

- `src/app/[locale]/` — pages de contenu, **prérendues** (`●`), une URL par
  langue. Son `layout.tsx` **est** le layout racine de cet arbre.
- `src/app/(app)/` — quiz, résultat, deep dive, admin. Dynamiques (`ƒ`), sans
  préfixe de langue : les liens `/r/<id>` sont déjà partagés dans la nature et
  doivent vivre indéfiniment, et un résultat n'a pas de langue propre (il rend
  dans celle du lecteur).
- `src/app/root-shell.tsx` — le chrome commun aux deux layouts racine.
- `src/proxy.ts` — résout la locale une fois et la transmet en en-tête
  `x-tdg-locale`.

### 2.2 Invariants que des tests tiennent

- Les **72** pages de contenu (celles du sitemap) sortent en `●` du build. Tout ce qui les
  redynamise est une régression — vérifier le résumé de `next build`.
- Aucun `Button` du dossier `[locale]` vers une route applicative n'utilise
  `next/link` (garde statique + spec qui enregistre les requêtes réseau).
- Budgets d'atteinte par module de contenu (`src/__tests__/content-fan-in.test.ts`).
- Aucun Client Component hors des trois écrans autorisés n'importe le
  dictionnaire (`src/__tests__/client-bundles.test.ts`).
- Aucune route ne déclare `runtime = "edge"`, et rien sous `src/` n'importe
  `next/image` (`src/__tests__/next-config.test.ts`).
