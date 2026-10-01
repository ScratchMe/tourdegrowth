# PLUGINS.md — installer un plug-in dans ce dépôt

*Sorti de `CLAUDE.md` le 2026-10-01, où il était chargé dans chaque session
alors qu'il ne sert qu'à installer, mettre à jour ou retirer un plug-in. La
table des déclencheurs de `CLAUDE.md` dit quand l'ouvrir. Le texte est celui
de `CLAUDE.md`, déplacé tel quel, à deux renvois près : « ce fichier » y
désignait `CLAUDE.md`.*

## Les plug-ins s'installent à la main, dans le dépôt

**claude.ai ne livre pas les plug-ins aux sessions cloud.** Constaté le 24/09/2026 sur Ramille :
Product Management était activé sur le compte, et la session ne le voyait pas (liste des plug-ins
du compte vide, catalogue « non activé », dossier de synchronisation vide). Le dépôt est la seule
chose qu'une session cloud est sûre d'emporter. Un plug-in arrive donc en `.zip` et s'installe dans
le dépôt, sous `.claude/` :

```
node scripts/installer-un-plugin.mjs <archive.zip | dossier> [--prefixe <court>] [--manuel | --auto] [--licence <fichier>]
node scripts/installer-un-plugin.mjs --retirer <plug-in>
```

- **Relancer le script sur une archive plus récente met le plug-in à jour.** Ce qu'il avait posé
  est retiré d'abord, donc un skill disparu en amont disparaît d'ici. Le préfixe, le mode et la
  licence choisis la première fois sont repris sans qu'on les redise.
- **`--retirer` défait exactement ce que dit `installation.json`**, jamais tout ce qui porte le
  préfixe : un skill écrit ici sous un nom voisin partirait avec. Ce qui cite le plug-in ailleurs
  (`CLAUDE.md`, ce fichier, un document) reste à relire à la main, et le script le rappelle.
- **Ce qui est installé, et ce qui ne l'est pas, se lit dans
  `.claude/plugins-importes/<plug-in>/installation.json`** : ce qui a été posé, la source et son
  sha256, le préfixe, le mode, et tout ce qui n'a pas été installé. Le manifeste, la licence ou la
  notice et `CONNECTORS.md` sont gardés à côté.
- **Le dépôt est public, donc installer un plug-in, c'est le redistribuer.** Sa licence voyage
  avec la provenance. Quand l'archive n'en porte pas, `--licence <fichier>` la joint : c'est le cas
  de Design d'Anthropic, dont la licence (Apache 2.0) est à la racine du dépôt d'amont et non dans
  le dossier du plug-in. Un plug-in sans licence est signalé.
- **Prérequis** : Node ≥ 20.11 et le binaire `unzip` (vérifié en CI avec `zip` et `python3`).
  `.claude/` est exclu du lint et du type-check, et le test de l'installeur vérifie que ça le reste.

L'outil vient de Ramille (ScratchMe/Ramille#261, `aa06744`), copié et non réécrit. Son
**interface est gardée telle quelle** (nom du script, options en français,
`.claude/plugins-importes/`, clés d'`installation.json`) pour qu'une provenance veuille dire la
même chose dans les deux dépôts ; le code, les messages et le test sont en anglais.

**Les trois règles de l'outil**, détaillées en tête du script et gardées par son test :

1. **Tout nom est préfixé par celui du plug-in** : `/product-management-write-spec`, pas
   `/write-spec`. Marketing et Product Management portent tous deux `competitive-brief`, et
   Engineering apporte un `code-review` qui masquerait la commande intégrée. C'est le **nom du
   dossier** qui nomme le skill, pas le champ `name` (mesuré). Le champ est réécrit quand même. Les
   renvois à d'autres commandes et les liens relatifs dans les consignes sont réécrits aussi. Un
   fichier modifié porte un avis qui le dit, comme Apache 2.0 l'exige. Un nom de plug-in trop long
   pour la limite de 64 caractères se raccourcit par `--prefixe`.
2. **Hooks, connecteurs et agents ne s'installent jamais d'office.** Un hook exécute du code à
   chaque événement, un connecteur ouvre un compte tiers, un agent choisit ses outils. Ils sont
   listés dans `installation.json` et dans la sortie. Un en-tête de skill ou de commande qui
   déclare des hooks est refusé.
3. **Rien n'est écrit avant que tout soit vérifié** : entrées d'archive qui sortent de leur
   dossier, liens symboliques, en-têtes illisibles, collisions de noms, noms relus dans
   `installation.json`. Un refus laisse le dépôt intact.

Ce que le script **ne voit pas**, c'est ce que les consignes disent. Il imprime ce qui mérite un
regard : adresses, commandes shell, `allowed-tools`, liens morts, noms d'amont non réécrits,
fichiers qui ne sont pas des consignes. Les consignes se relisent avant de commettre, avec ces
règles :

- **Les règles du dépôt passent devant les consignes d'un plug-in.** Ces consignes sont écrites
  pour un produit quelconque : le bilinguisme, le déterminisme du score, le garde-fou anti-moquerie
  et tout ce que dit `CLAUDE.md` restent. Leur texte ne se traduit pas : une traduction
  rendrait chaque mise à jour impossible à rejouer.
- **Une consigne qui se déclare incontournable** (« utilise-moi en premier sur tout… »)
  **s'installe en `--manuel`.** Chaque skill charge sa description dans le contexte de chaque
  session et peut se déclencher seul. En `--manuel`, il sort de la liste présentée à chaque session
  (mesuré) et reste appelable par son nom. Un skill que l'amont réserve à l'agent y est rendu à la
  personne.
- **Aucun contenu du dépôt ne relaie la publicité d'un plug-in.** Sur Ramille, SearchFit SEO
  signait ses gabarits « Powered by SearchFit.ai » : il a été retiré le jour même.
- **Chaque plug-in se décide avec Antoine, un par un, AVANT de s'installer.** Ce sont des
  consignes que l'agent suivra à chaque session, pas un détail d'implémentation. La question se
  pose sous la forme habituelle : ce qu'il fait, ce qui est en jeu, la recommandation, ce qu'on
  casse si on se trompe. Rien ne s'installe avant la réponse. **Brancher un hook ou un connecteur
  est une décision de plus, qui se demande à part.**
