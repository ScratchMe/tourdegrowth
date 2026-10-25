# A23.d — ce que le bon à tirer de la place de marché doit regarder

*Relevé pendant l'exécution d'A23 (à partir de MKT-0, le 2026-10-18) par les
relecteurs copie et par l'orchestrateur, au fil des unités, sur le modèle de
[`a22d-a-regarder.md`](a22d-a-regarder.md). Ce ne sont pas des corrections
faites : ce sont les points que la construction du bon à tirer
(`/bon-a-tirer`, qui repart toujours de `grep -rn "TODO: à relire" src/`) doit
mettre sous les yeux d'Antoine, en plus des cartes que le grep produit. Les
clés citées sont celles d'`ENGINE_COPY` (`src/content/engine-copy.ts`) et,
dès MKT-5, de ses calques de place de marché.*

## Les contrôles et les constats (MKT-4)

- **`sanity.mktRepeatGtFirst`** demande « les deux chiffres portent-ils sur
  la même cohorte et la même fenêtre ? ». Par construction, ils ne portent pas
  sur la même fenêtre : la première commande se mesure sur 7, 30 ou 90 jours
  (30 par défaut), la deuxième sur 60, 90 ou 180 jours (90 par défaut) ;
  elles ne se rejoignent qu'à 90 jours. Le déclencheur (`sanity.ts`,
  `repeat.lo > firstOrder.hi`) peut donc s'allumer sur des chiffres honnêtes :
  un acheteur dont la première commande tombe au jour 45 et la deuxième au
  jour 80 compte dans la deuxième commande, pas dans la première. Deux choses à
  trancher : la question que pose la phrase, et si le contrôle ne doit
  s'allumer que quand les deux fenêtres sont égales (§22.5.7, §22.8.5 f).
  Relevé par la relecture de MKT-4.
- **`findings.verbMkt.repeat`** : « en passent une deuxième » / "place a
  second one". Dans le titre de slide (`clauseRepeat`), « commande » est
  nommée juste avant ; dans le constat, phrase seule (« Sur 100 inscrits, on
  ne sait pas dire combien en passent une deuxième. »), le « en » et le "one"
  n'ont rien à quoi se rattacher. Relevé par la relecture de MKT-4.
