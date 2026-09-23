# Gemini / API de génération — repli, timeouts, schéma, hygiène de prompt

Extraits du journal de `CLAUDE.md`. La §1 vaut pour n'importe quelle
intégration d'un LLM par API ; la §2 est propre à Tour de Growth.

> **Quand lire ce fichier** : avant de toucher au client de génération, au
> prompt, ou de conclure qu'un échec vient du modèle.

---

## 1. Ce qui vaut sur n'importe quelle intégration

### 1.1 Un nom de modèle se périme en quelques semaines

Un modèle choisi quelques semaines plus tôt a été trouvé **arrêté (404)**.
Conséquence : **jamais un seul nom de modèle codé en dur sans repli.** Une
chaîne de candidats, terminée par un **alias maintenu par le fournisseur** qui
pointe toujours vers un modèle à jour — c'est le filet qui ne casse pas.

Vérifier qu'un modèle est valide avant de l'utiliser, par un vrai appel à
l'endpoint de liste, pas d'après la documentation.

### 1.2 Le bug de repli le plus classique

Dans le code d'origine que nous avons porté, une erreur « non retriable »
(un 400) était levée **à l'intérieur du même bloc `try`** censé la laisser
remonter. Son propre `catch` l'avalait donc, et la fonction rebouclait sur
tous les modèles — contredisant le commentaire du code juste au-dessus.

**Inspecter le statut HTTP hors de tout `try/catch` autour du `fetch`**, pour
qu'une erreur non retriable échoue vraiment immédiatement. Et poser un test de
non-régression dédié : c'est le genre de bug qui se relit comme correct.

### 1.3 Une chaîne de repli sans pause ne protège que du mauvais cas

Notre boucle enchaînait quatre modèles **sans aucune pause**. Elle protégeait
donc contre « ce modèle-là est indisponible », et **pas du tout** contre
« l'API est surchargée pendant deux secondes », qui est de loin le cas le plus
fréquent. Toute la chaîne brûlait en moins d'une seconde.

**Backoff exponentiel avec jitter complet** (500 ms, 1 s, 2 s de plafond,
valeur tirée au hasard en dessous). Deux détails qui ne sont pas décoratifs :

- **Le jitter compte particulièrement quand plusieurs générations partent en
  parallèle.** Sans lui, elles échouent ensemble et repartent ensemble, au même
  instant, contre une API déjà en difficulté.
- **Aucune pause après un 404** : un nom de modèle qui n'existe pas ne se
  mettra pas à exister parce qu'on a attendu. La condition lit le dernier
  statut plutôt que d'attendre aveuglément.

**Injecter `sleepImpl` comme on injecte `fetchImpl`** : sinon les tests dorment
pour de vrai (notre suite est passée de 8 s à 325 ms).

### 1.4 Le timeout par tentative, et le budget de chaîne

Un modèle à raisonnement dépense 1 à 2 k tokens à réfléchir avant quelques
centaines de tokens de réponse. **Un plafond dimensionné pour un appel
classique abandonne des générations qui auraient abouti**, modèle après modèle,
jusqu'à épuiser la chaîne — et l'utilisateur reçoit une erreur alors que rien
n'était en panne.

Notre plafond datait d'un tout autre problème (un appel muet depuis un bac à
sable) et valait 20 s. Une journée lente l'a fait échouer sur un prompt de
vraie longueur.

Deux nombres, liés :

- **`REQUEST_TIMEOUT_MS` par tentative** — assez pour une génération lente qui
  aboutit (45 s chez nous).
- **`CHAIN_BUDGET_MS`** qui borne l'ensemble (modèles **et** pauses), sous le
  plafond d'exécution de la fonction. La dernière tentative est **rognée** à ce
  qui reste plutôt que lancée à plein ; sous quelques secondes restantes, la
  chaîne s'arrête sans tenter le modèle suivant, et le message le dit.

**Le message de timeout rapporte la valeur RÉELLEMENT armée, pas la
nominale** — sans quoi une tentative rognée à 10 s prétendrait avoir attendu
45 s, et la prochaine personne débogue une fiction.

### 1.5 Une réponse tronquée n'est pas une réponse

Notre extraction inspectait `finishReason` **uniquement quand le texte était
absent**. Or une réponse tronquée porte quand même la partie déjà écrite :
elle était renvoyée comme un succès, et n'échouait que bien plus loin, dans
`JSON.parse`, sous une forme qui ne disait rien de ce qui s'était passé.

**Vérifier `finishReason` AVANT le texte**, et lever une erreur nommée pour
tout ce qui n'est pas `STOP`. Lire aussi `promptFeedback.blockReason` : un
prompt refusé pour raisons de sécurité, une réponse coupée au plafond de
tokens et un payload réellement malformé doivent produire trois messages
différents — c'est précisément sur le ton le plus agressif qu'un modèle a le
droit de dire non.

**Aucun de ces cas ne mérite un repli sur un autre modèle** : c'est une
propriété de la requête, pas du modèle.

*Mise en garde méthodologique* : nous avons attribué une troncature au plafond
de tokens, relevé le plafond… et la mesure suivante a montré
`thoughts=765 answer=440` contre un plafond de 4096. **La cause réelle est
restée inconnue**, et c'est écrit tel quel dans le code plutôt qu'une cause
commode. Ce qui reste acquis est le correctif de *signalement*, qui vaut par
lui-même. **Instrumenter avant de conclure** — c'est l'instrumentation qui
nous a contredits.

### 1.6 `responseSchema` : garanti par l'API, pas seulement demandé

Un schéma de réponse garantit les clés et les types. **Il ne remplace pas le
parseur** : une garantie d'un service distant est une seconde ligne de
défense, pas une raison de retirer la sienne. Et il ne dit rien des consignes
de longueur ou de style, donc **l'instruction textuelle reste dans le prompt**.

**Le risque est asymétrique et mérite une procédure** : un schéma mal formé
renvoie **400**, que le client traite comme non retriable → **toutes** les
générations cassent jusqu'à correction, et **aucun test hors ligne ne peut le
voir**.

- La protection est une **sonde qui envoie exactement la requête de
  production** (même fonction, même schéma) à la vraie API, **lançable sur une
  branche avant le merge**. Le run sur la branche est la preuve, pas la
  relecture.
- **Ne pas ajouter de repli « sans schéma » sur un 400** : ça masquerait
  précisément la mauvaise configuration qu'on veut voir.

### 1.7 Une sonde plus légère que la production ne prouve rien

Notre sonde envoyait un sixième du prompt réel. Résultat : elle passait au vert
pendant que la production échouait — et son vert ne valait rien.

**Une sonde doit construire son prompt avec les mêmes fonctions que la route**,
sur des données de vraie longueur. Et **imprimer sa durée à côté du plafond** :
c'est le seul endroit où le pari que représente un timeout se mesure contre la
vraie API.

### 1.8 Hygiène de prompt pour du texte utilisateur

- **Une constante partagée** pour l'instruction qui encadre le texte
  utilisateur, jamais dupliquée entre les variantes de prompt.
- **Délimiter le texte** (`"""`) et ne jamais le fusionner dans le reste du
  prompt.
- **Tronquer à deux niveaux serveur indépendants** : la route, puis la fonction
  d'orchestration. Jamais confiance au seul front, et jamais confiance à un
  seul point de contrôle serveur non plus.
- **Vérifier avec une vraie tentative d'injection** contre la vraie API, pas
  seulement en test unitaire. La nôtre (« Ignore all previous instructions… »)
  a été ignorée par le modèle, qui a produit le JSON attendu en intégrant le
  vrai contexte métier.
- **Tronquer le corps d'erreur avant de le journaliser** (300 caractères) : le
  fournisseur peut y faire écho à la requête, qui contient le texte utilisateur.
- **La clé API passe en en-tête**, jamais en query string — une URL est
  journalisée par tout intermédiaire : proxy, traqueur d'erreurs, export
  devtools. Vérifier que l'en-tête est bien lu : sans clé du tout la réponse
  diffère (« unregistered callers ») d'une clé refusée (« API key not valid »),
  et c'est cette différence qui prouve que l'en-tête est pris en compte.

### 1.9 Paliers de service : la différence n'est pas qu'un prix

Les conditions diffèrent **précisément sur ce qui compte** quand un
utilisateur décrit son entreprise dans un champ libre. Lu sur les conditions,
pas de mémoire :

- **Palier gratuit** : les requêtes et réponses servent « to provide, improve,
  and develop » les produits du fournisseur, et « human reviewers may read,
  annotate, and process » l'entrée et la sortie.
- **Palier payant** : le fournisseur « doesn't use your prompts … or responses
  to improve our products ».

Si une notice de confidentialité en parle, **épingler chaque valeur de la
constante de palier à la phrase correspondante par un test** — basculer le
palier sans que le texte suive devient alors une CI rouge. (Attention au piège
de la garde à branches : voir `TESTING.md` §2.6.)

### 1.10 Chiffrer le coût, ne pas l'estimer

Les tokens de **réflexion sont facturés comme de la sortie**. Mesurer :
construire le vrai prompt pour compter les caractères d'entrée, et lire les
compteurs réels (`thoughts`, `answer`) imprimés par une sonde — pas une
estimation.

Deux choses à retenir d'un tel calcul, plus que le montant : **le multiplicateur
est un choix** (générer plusieurs variantes d'avance), et c'est le seul levier
si le coût devient un sujet ; et le **plafond d'abus est borné par la limite de
débit**, qu'un plafond de dépense mensuel referme complètement.

---

## 2. Propre à Tour de Growth

- **Chaîne de repli** : `gemini-3.7-flash → 3.6 → 3.5 → gemini-flash-latest`
  (non négociable, `CLAUDE.md`). `REQUEST_TIMEOUT_MS` 45 s,
  `CHAIN_BUDGET_MS` 100 s sous un `maxDuration` de 120 s.
- **Un seul appel Gemini dans tout le produit** : `lib/gemini/deep-dive.ts`,
  utilisé par la route **et** par la sonde. Le mode Quick n'appelle plus rien
  depuis `SPEC-ADDENDUM-01` §0 — il résout tout dans `content/copy-library.ts`.
- **Un Deep dive = 4 générations** (2 tons × 2 langues), en parallèle. Latence
  observée : 9 s, 11 s, 70 s selon la charge du service — donc elle dépend plus
  de Gemini que de notre code. Coût mesuré : **~0,04 à 0,06 $ par Deep dive**
  en 2026, le double à partir de 2027.
- **Le garde-fou anti-moquerie est codé en dur dans le prompt système**, jamais
  laissé à l'appréciation du modèle (non négociable). Il vise la stratégie ou
  l'auto-évaluation, **jamais la personne**.
- **Palier payant** depuis le 2026-09-07, avec plafond de dépense.
- **Avant tout changement à `lib/gemini/deep-dive.ts` ou `client.ts`** :
  relancer `verify-live.yml` sur la branche, cible `gemini`. C'est la
  convention nº4 de `CLAUDE.md`.

### 2.1 Ce que la sonde a trouvé en huit runs

Elle mérite d'exister même quand elle est rouge : un bug utilisateur réel et
intermittent (les réponses tronquées), une faiblesse de conception (la chaîne
sans pause), un démenti d'une de nos propres théories (le plafond de tokens),
et la confirmation sur un vrai document de ce qui n'était prouvé que sur
l'échantillon. **Sa valeur n'est pas d'être verte.**
