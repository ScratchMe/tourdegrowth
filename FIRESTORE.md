# Firestore — règles, compteurs, concurrence, quotas

Extraits du journal de `CLAUDE.md`. La §1 vaut pour n'importe quel projet
Firestore accédé côté serveur ; la §2 est propre à Tour de Growth.

> **Quand lire ce fichier** : avant d'ajouter une lecture sur un chemin public,
> un compteur, ou une écriture qui pourrait entrer en concurrence.

---

## 1. Ce qui vaut sur n'importe quel projet

### 1.1 Les règles en deny-all, dans le dépôt, même sans SDK client

Si tout passe par l'Admin SDK côté serveur, les règles sont contournées et un
`firestore.rules` ne change **rien** au fonctionnement. Le committer quand même,
pour deux raisons :

1. L'intention (« aucun client ne touche ces données ») vit sous contrôle de
   version plutôt que dans une console qu'il faut penser à ouvrir.
2. Si un SDK client est ajouté un jour, il démarre **fermé**. Le défaut
   dangereux est l'inverse : des règles laissées permissives par un assistant de
   création de projet, découvertes des mois plus tard.

Un fichier dans le dépôt documente l'intention ; **il ne s'applique qu'une fois
déployé** (`firebase deploy --only firestore:rules`). Le vérifier dans la
console fait partie du travail.

### 1.2 Lire puis écrire est une course — le check-and-set est une transaction

Notre route testait « déjà fait ? » avant un traitement long, puis écrivait
**sans condition**. Deux requêtes passant le test avant que l'une écrive (un
rechargement pendant une génération de 70 s, ou un bouton Réessayer)
produisaient toutes les deux, et la dernière écriture gagnait en silence.

`saveX` devient un **check-and-set dans une transaction** et renvoie
`"saved"` ou `"already-present"` ; l'appelant perdant est redirigé sans
invalider le cache (le gagnant l'a fait).

**Dire clairement ce que ça ne règle pas.** La transaction protège
l'**intégrité**, pas le **coût** : le travail cher a déjà eu lieu deux fois.
L'empêcher demanderait un marqueur de réservation posé *avant*, avec une
expiration pour qu'un traitement planté ne verrouille pas l'objet pour
toujours. Borné par une limite de débit, c'est une question de quota, pas
d'intégrité — la transaction seule est le bon niveau d'ingénierie tant que la
dépense n'est pas un sujet.

### 1.3 Les lectures sont la ressource qui s'épuise si ça marche

Une page publique partagée est par définition lue plusieurs fois, et la page,
ses métadonnées et son image veulent toutes le même document.

- **Partager la lecture dans une même requête** (`cache()` de React) : sans ça,
  personnaliser les métadonnées **double** le coût de chaque vue.
- **Cacher la lecture par tag**, invalidée explicitement au seul moment où
  l'objet change. Le TTL n'est pas le mécanisme mais le **filet** : si une
  invalidation est ratée, la page se répare toute seule dans l'heure au lieu de
  rester périmée indéfiniment.
- **Ne PAS cacher la lecture qui sert de test de concurrence** : elle doit voir
  l'état courant, sinon deux traitements simultanés se croient tous deux les
  premiers.
- **Valider la forme de l'identifiant AVANT toute lecture.** Chaque id distinct
  est un miss de cache, donc une lecture facturée : refuser ce qui ne peut pas
  être un de nos ids (un UUID v4, par exemple) ferme le trou le moins cher.

### 1.4 Un compteur agrégé plutôt qu'un scan — et trois garde-fous

Pour une moyenne ou un total lu souvent : un document agrégé
(`count` + `sum`, via `FieldValue.increment`), jamais un parcours de la
collection à chaque vue.

1. **L'incrément ne doit JAMAIS faire échouer la requête qu'il décore.** Quand
   il tourne, le travail est déjà écrit ; lever rendrait une erreur pour une
   opération réussie. Avalé et journalisé — le pire cas est une entrée absente
   d'une moyenne sur des centaines. **Le tester** : un incrément qui rejette
   doit laisser passer un 201.
2. **Conséquence à documenter sur place** : un compteur ne couvre que ce qui
   est créé **après son déploiement**, donc il peut légitimement différer d'un
   tableau de bord qui scanne toute la collection. Le dire dans le code plutôt
   que le laisser découvrir.
3. **Le nettoyage d'un test doit annuler ses incréments** (`increment(-1)`),
   dans un bloc qui tourne **même si une assertion a échoué** — sinon chaque
   vérification fausse le chiffre affiché aux vrais utilisateurs.

*Corollaire de vérification* : un compteur se vérifie **en delta**, pas en
`> 0`. « Quelque chose a été compté un jour » était déjà vrai avant la
fonctionnalité. Comparer avant/après en `>=` (pas en égalité) pour qu'une vraie
écriture concurrente ne rende pas la sonde rouge.

### 1.5 Ne pas stocker ce qu'on ne relit pas

Un champ de texte libre où quelqu'un décrit son entreprise était conservé
indéfiniment, et la seule chose qui le relisait était un `if (champ)` dans un
tableau de bord. Il est devenu un **booléen**. Le texte part toujours dans le
traitement ; il n'est simplement plus écrit.

Garder les anciens champs en **optionnels « legacy »** dans le type pour que
les documents antérieurs se lisent, et faire retomber le calcul sur l'ancienne
valeur quand le booléen manque — **testé avec un document de chaque
génération**.

### 1.6 La pile gRPC est une dépendance dure

`google-gax` fait un `require("@grpc/grpc-js")` **au niveau module**, et tire
`protobufjs` de la même façon. Donc **la pile gRPC n'est pas excluable du
tracing**, quel que soit le sous-ensemble, même si le SDK sait parler REST.
Voir `VERCEL.md` §1.4 pour la méthode de vérification (déplacer le paquet hors
de `node_modules`) et le détail de la mesure.

### 1.7 `firebase-admin` vs `@google-cloud/firestore` : mesuré, puis écarté

L'hypothèse était un gain de démarrage à froid. **Mesuré** : le point d'entrée
modulaire (`firebase-admin/firestore`) charge 455 modules dont **zéro** venant
du paquet Storage — il évite déjà le poids qu'on lui reprochait. Et le vrai
poids est `@google-cloud/firestore` (6,2 Mo), chargé dans les deux cas ; le
wrapper n'ajoute que 2,1 Mo.

**Ne pas y revenir sans une mesure de démarrage à froid réelle qui contredirait
celle-ci.** C'est le socle de données d'une app qui marche.

---

## 2. Propre à Tour de Growth

- **Région `eur3`** (multi-région Europe). Les fonctions ont été déplacées en
  `cdg1` le 2026-09-14 pour ne plus traverser l'Atlantique à chaque requête.
- **Collection `submissions`** + document agrégé `stats/global` et
  `stats/<segment>` (compteur + somme des scores).
- **Init paresseuse** de l'Admin SDK depuis trois variables d'environnement,
  avec **erreur explicite si absentes** plutôt qu'un échec opaque du SDK.
- **Le contrat d'erreur ne fuit jamais l'interne** : détail complet dans
  `console.error`, **code court et stable** au navigateur (`SCORING_FAILED`,
  `DEEP_DIVE_FAILED`). La preuve que ça comptait : avant ce changement, une
  soumission parfaitement valide sans identifiants renvoyait au navigateur le
  message qui **nomme les trois variables d'environnement**.
- **Seuil d'affichage** : rien ne s'affiche publiquement sous 30 soumissions
  (un benchmark auquel on ne peut pas se fier est pire qu'aucun).
- **Aucun nom d'entreprise n'entre dans Firestore** — c'est une promesse écrite
  dans les pages légales, et l'instrument d'audit est navigateur seulement pour
  cette raison (`AUDIT.md`).
