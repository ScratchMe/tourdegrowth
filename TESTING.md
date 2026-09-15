# Tests et vérification — la méthode, pas les outils

Ce fichier est le plus portable des six : presque rien ici ne dépend de
Vitest, de Playwright ou de ce projet. C'est la discipline qui a réellement
trouvé des bugs, et les façons de se tromper en croyant vérifier.

> **Quand lire ce fichier** : avant d'écrire un test censé protéger une
> correction, et avant d'annoncer que quelque chose est vérifié.

---

## 1. La non-vacuité, et ce qu'elle apprend vraiment

### 1.1 La règle

**Un test qui ne peut pas échouer ne prouve rien.** Après avoir écrit un test
qui protège une correction, **casser la correction** et vérifier que le test
tombe. Noter **combien** de tests tombent et **lesquels** — pas seulement
« ça rougit ».

Le compte fin est l'information utile :

- *« En retirant X, exactement les 4 specs qui affirment la présence tombent,
  et les 2 qui affirment une absence passent dans les deux états — ce qui est
  correct pour des assertions compagnes. »*
- *« En passant la constante de 4 à 1, un seul test tombe »* → c'est ce qui a
  fait ajouter un test de borne dédié, parce que le balayage principal dérivait
  son attendu de la constante et ne pouvait donc pas attraper une mauvaise
  valeur pour elle.

Écrire ce compte **dans le fichier de test**, pas dans un message. C'est la
seule façon qu'a la personne suivante de savoir ce que le test couvre
réellement.

### 1.2 Un contrôle de non-vacuité qui PASSE est lui-même un signal

C'est la leçon la plus rentable du projet. Quatre fois, un sabotage qui aurait
dû faire rougir n'a rien fait, et à chaque fois ça a révélé autre chose :

- **Un bug réel, masqué.** En cassant exprès une couleur pour vérifier qu'axe
  la voyait, la spec est passée — parce qu'un `str.replace` antérieur avait
  dé-scopé une règle CSS et repeignait déjà tout en rouge, ce qui passait le
  contraste. Le sabotage était caché par mon propre bug.
- **Un durcissement non observable.** Une règle CSS renforcée contre un futur
  changement d'ordre d'émission : en la remettant à l'état faible, les specs
  passaient quand même, l'ordre actuel étant favorable. Le durcissement est
  donc une assurance, pas un correctif — et **aucun test ne peut échouer
  dessus**. Écrit tel quel en tête du fichier plutôt que sous-entendu.
- **Un trou dans mes propres specs.** Sept specs passaient avec la persistance
  neutralisée, parce qu'elles relisaient toutes l'état en mémoire et jamais
  l'appareil. La seule assertion qui le prouvait était « recharger sans rien
  effacer ». Sans ce contrôle, la PR partait avec une couverture qui avait
  l'air complète et ne tenait rien.
- **Une garde inatteignable depuis l'UI.** Un plafond gardé à deux endroits :
  saboter le gestionnaire ne fait rien tomber, parce qu'un bouton désactivé ne
  dispatche jamais. Conséquences écrites : la spec affirme aussi le
  **résultat** (pour attraper un futur retrait du `disabled`), et le
  commentaire dit que la garde du gestionnaire couvre le chemin non-UI.

### 1.3 Un sabotage doit prouver qu'il a été appliqué

Deux ratés à ne pas répéter :

- **Un sabotage doit compiler.** Un `return` anticipé qui rend du code
  inatteignable fait échouer le build — donc la suite tourne contre l'**ancien
  build** et « passe ». Lire le code retour du build avant celui des tests.
- **Un `replace` peut ne rien remplacer.** Un motif écrit entre guillemets
  doubles en shell transforme `\n` en vraie nouvelle ligne : le remplacement ne
  trouve rien, le fichier est inchangé, et les tests passent. Toujours
  `assert s != before` avant d'écrire.
- **Un sabotage qui passe demande d'abord de comprendre pourquoi.** Insérer un
  caractère exotique dans un test de couverture de police n'a rien fait —
  parce que le test filtre les emoji à dessein. Refait avec un idéogramme :
  les bons tests tombent.

---

## 2. Vérifier la bonne chose

### 2.1 Une recherche qui ne trouve rien doit prouver qu'elle a regardé

Quatre occurrences dans ce projet, toutes coûteuses :

- Chercher une chaîne dans `/_next/static/chunks/` alors que les fichiers sont
  servis sous `/_next/static/immutable/chunks/` : la boucle ne parcourt aucun
  fichier, et « rien trouvé » se lit comme « pas déployé ».
- Filtrer la sortie d'une sonde au `grep` : rien ne revient, alors que la sonde
  a bien tourné — c'est le motif qui ne matche pas.
- Vérifier une absence **dans le mauvais tiroir** : conclure « ce document n'a
  jamais été ouvert » en interrogeant une collection qui n'est pas la sienne.
- Relever des bornes avec un `grep` qui ne cherche **que les clés qu'on lui a
  nommées** : il ne peut pas montrer la troisième, assise entre les deux.

**La règle** : compter ce qu'on a examiné, pas seulement ce qu'on a trouvé. Et
quand une mesure rapporte une anomalie, prouver d'abord qu'elle a regardé le
bon élément — deux « défauts » se sont révélés être des artefacts de sélecteur
(`querySelector` renvoyant le premier élément du document, pas celui visé).

### 2.2 Mesurer ce que l'utilisateur vit, pas ce qui est commode

- **« 3 éléments focalisables sur 10 hors ordre » et « ce bloc est annoncé cinq
  places trop tôt » décrivent la même page.** La première mesure rassure et
  est la mauvaise : un lecteur d'écran lit tout, pas seulement ce qui prend le
  focus.
- **Une spec d'accessibilité qui vérifie un comportement bat une spec qui
  vérifie des attributs.** Un `tabindex` correct sur chaque champ ne dit rien
  du parcours réel — il suffit d'un conteneur qui intercale un piège.
- **Mesurer la géométrie rendue, pas les caractères de la source.** Un test de
  césure qui cherche des espaces insécables dans le code passerait sur une
  source correcte qu'une future CSS recasserait. Compter les rectangles clients
  d'une plage de texte, lui, mesure ce qui s'affiche.
- **Une passe d'accessibilité automatique ne voit que le visible.** Un
  `<details>` fermé ne prouve rien : l'ouvrir dans la spec avant d'asserter.

### 2.3 Lire la source servie quand c'est elle qui compte

Sur une route dont le contenu dépend du JavaScript, **le HTML brut en HTTP et
le DOM sont deux choses différentes**, et un crawler ne fait pas tourner les
effets. Une spec qui lit le DOM ne prouve rien sur ce que voit un moteur.

La non-vacuité le prouve élégamment : retirer l'élément partout fait tomber
trois specs ; le retirer **seulement de l'enveloppe rendue côté serveur** en
fait tomber deux — les deux lectures HTTP — pendant que la spec DOM passe.
C'est exactement la distinction que les specs revendiquent.

### 2.4 Une assertion se lit depuis la source de vérité

Deux formes du même défaut :

- **Citer un texte de mémoire dans un test.** La citation était fausse d'un
  mot. Corrigé en **lisant la bibliothèque depuis la spec** : c'est la
  différence entre « la page contient cette phrase-là » et « la page rend ce
  que la bibliothèque contient », et seule la seconde survit à une correction
  de copie.
- **Un nombre codé en dur qu'on retouche à chaque lot** (`toHaveLength(74)`)
  finit par être retouché sans être lu : la garantie devient une formalité. Le
  dériver de sa source.

### 2.5 `toContain` ne dit rien de ce qui ne doit PAS être là

Une assertion de présence laisse passer exactement la moitié qui compte quand
la règle est « ces champs-ci et **aucun autre** ». Un test unitaire est passé
sur un sabotage que seule la spec e2e a vu, pour cette raison. Asserter le
**jeu exact**.

### 2.6 Une garde à branches ne vaut que pour la branche empruntée

Un test qui épingle « chaque valeur de la constante correspond à telle
phrase » n'exerce que la valeur courante. Le nôtre portait une regex
**impossible à matcher** dans sa branche non empruntée — verte pendant un
jour entier, sans rien vérifier, jusqu'à ce que la configuration bascule.

Après correction d'une telle garde : **refaire la non-vacuité sur la branche
qui vient de s'activer**, c'est la seule preuve qu'elle tient.

### 2.7 Le motif « canari » pour prouver qu'une donnée ne sort pas

Trois assertions, et la troisième est celle qu'on oublie :

1. Semer des chaînes uniques dans les champs sensibles, jouer le parcours,
   enregistrer **toutes** les requêtes du navigateur, vérifier qu'aucune ne les
   porte.
2. Vérifier qu'il n'y a **aucune requête non-`GET`** de toute la session —
   ça attrape une fuite même encodée, hachée ou découpée, trois façons dont une
   recherche de sous-chaîne ne verrait rien.
3. **Vérifier que le fichier exporté, lui, CONTIENT bien les canaris** — sans
   quoi une spec qui aurait cessé de saisir quoi que ce soit passerait en ne
   prouvant rien.

### 2.8 Une garde compte ce qui traverse, elle ne nomme pas des props

Deux fuites identiques à un cran d'écart : la première fois la frontière
manquait ; la seconde, elle existait mais la garde **nommait un prop**, donc
était aveugle au prop suivant — ajouté neuf lignes plus bas dans le même
fichier. Une garde utile exige que **tout** usage de la donnée passe par la
narrowing, en excluant les commentaires du comptage.

Même logique pour une borne annoncée : la calculer pour **toutes** les
variantes, y compris celles qu'aucun test e2e ne peut rendre.

---

## 3. La vérification visuelle

**La leçon nº1 du projet, et elle s'est vérifiée une dizaine de fois : une
capture montre ce qu'une relecture de code ne montre pas.** Une liste non
exhaustive de ce qui n'est apparu qu'à l'écran :

- Un champ de formulaire **sans libellé visible** — trois fois, parce que le
  composant de saisie ne rend qu'un nom *accessible*.
- Un `+` manquant devant un delta (« 16 points » se lit aussi bien comme une
  baisse).
- Une phrase qui interpolait un nom au mauvais endroit et donnait une absurdité.
- Une aide qui décrivait un comportement que le code n'avait pas.
- Quatre formes d'un même défaut d'état (bandeau, tampon, cartes, titre) dont
  la relecture n'avait donné qu'une seule.
- Un opérateur ambigu : deux formules jointes par un « · » se lisant comme une
  multiplication dans un bloc en chasse fixe.

**Mesurer plutôt que juger à l'œil** quand c'est possible :
`scrollWidth === clientWidth` aux deux largeurs, les `y` de deux éléments
censés être sur la même ligne, l'écart réel entre deux boîtes dans une fenêtre
serrée des deux côtés (un écart qui **grandit** est autant une régression qu'un
écart qui disparaît).

---

## 4. Pièges d'outillage (Playwright / Vitest / CI)

- **Un serveur laissé tourner sert l'ancien build.** Avec
  `reuseExistingServer: !process.env.CI`, une vérification précédente encore
  vivante fait échouer des specs de façon incompréhensible. Tuer les processus
  avant — et attention, le motif de `pkill` peut se retrouver dans la ligne de
  commande du shell lui-même et **tuer le shell** : utiliser `pgrep -f
  'next[-]server'` puis `kill` par PID.
- **Le runner Playwright ne type-vérifie pas les specs ; `next build` si.**
  Une spec qui passe au runner peut casser le build. Lancer `tsc --noEmit`
  avant de conclure qu'une nouvelle spec est bonne.
- **Une variable d'environnement absente fausse dans les DEUX sens.** Sans le
  code d'analytics, le script n'est pas injecté : une assertion passe *à vide*
  (elle ne prouve rien) — et une autre échoue *faussement* en local alors que
  la CI, qui pose la variable, la voit passer. **Reconstruire avec la variable
  avant de conclure quoi que ce soit.** La parade durable : faire du stub une
  **fixture** que toutes les specs utilisent, et poser la variable au niveau du
  workflow.
- **Ne jamais attendre `networkidle`.** Playwright le déconseille lui-même, et
  dans une suite parallèle partageant un serveur, ça expire. Attendre un
  **signal positif** (une requête précise, un élément), ou une attente bornée
  quand il n'y a rien à attendre.
- **Poller ce qui arrive après l'hydratation.** Une écriture faite dans un
  `useEffect`, ou un événement livré après le chargement d'un script tiers,
  n'est pas là juste après `goto()`. `expect.poll`, jamais `waitForTimeout`.
- **Les dates d'une spec de fraîcheur sont relatives**, jamais littérales —
  sinon elle affirmera le contraire de son intention dans un mois, sans que
  personne n'y touche.
- **Un composant peut ne pas être atteignable par son rôle.** Un `<summary>`
  qui enveloppe son libellé dans un `<span>` et pose un marqueur en `::before`
  n'a pas le nom accessible qu'on lit à l'écran. Utiliser un `data-testid`
  plutôt que deviner une forme de nom accessible.
- **Un seuil de couverture posé juste sous la mesure du jour est un plancher
  utile**, pas un objectif : il fait rougir la CI quand un nouveau module reste
  sans test. Le nôtre s'est déclenché exactement pour ça. **Corriger par des
  tests, jamais en baissant le seuil.**
- **Une mesure de couverture doit inclure tout l'arbre**, pas seulement les
  fichiers qu'un test importe. Un fichier jamais importé n'apparaît pas à 0 % :
  il n'apparaît pas du tout. C'est comme ça qu'un module au cœur d'une
  métrique est resté sans aucun test.

---

## 5. Propre à Tour de Growth

- **Vitest** pour toute logique pure ; appelé directement (`npx vitest run`)
  plutôt que via un script qui masquerait les warnings de config.
- **Playwright** contre un **build de production** (`next start`), jamais
  `next dev` : hydratation, payload RSC et redirections ne se comportent pas
  pareil. Chromium seul.
- **Les assertions de composant vivent dans `e2e/`**, contre de vraies pages :
  le runner unitaire ne peut pas rendre un composant (environnement `node`, ni
  jsdom ni RTL). Un composant non monté par une page n'a donc pas de couverture
  tant qu'une page ne le monte pas — le dire plutôt que de le laisser croire.
- **Les routes `/admin/*` échouent fermé** : sans mot de passe configuré, tout
  `/admin` est un 401. La CI le pose au niveau du workflow, et les specs
  concernées **sautent avec un message** s'il manque — jamais faussement
  vertes, jamais faussement rouges.
- Chiffres de référence au 2026-09-15 : **709 tests unitaires**, **286 specs
  Playwright**, seuils de couverture `src/lib/**` à 82 % de lignes.
- **Flake connu** : `e2e/locale-routing.spec.ts:75`, quatre occurrences,
  toujours en suite complète parallèle, jamais en isolation. **Ne pas durcir la
  spec** en attendant le cookie : ça masquerait une éventuelle course produit.
  La config a `retries: 1` et `trace: "on-first-retry"` en CI.
