# Les décisions d'Antoine — l'index

*Sorti de `CHANTIERS.md` le 2026-10-01 : la liste de travail ne garde que ce
qui est ouvert. Chaque réponse est écrite **là où vit la question**, avec son
raisonnement ; ce tableau n'en est que l'index, dans l'ordre des numéros. Une
question tranchée plus tard y gagne sa ligne, dans le même format.*

C1 à C22 ont été tranchées dans la séance du 2026-09-29. Les questions de
design y ont été posées avec des captures du vrai écran : un build local avec
le jeu et le moteur ouverts, et, pour la vue propriétaire, un build jetable
jamais commité. C23 à C29 l'ont été le 2026-09-30. Les questions encore
ouvertes sont dans `CHANTIERS.md`, section C.

| # | Sujet | Réponse | Écrit dans | Suite |
|---|---|---|---|---|
| C1 | Les repères qui désignent la fuite | **Aucun repère ne désigne** : seule une cible d'équipe nomme l'étape. Population du churn reformulée (« SaaS B2B à panier élevé »). Non tranchée auparavant dans le nº8, sa carte y est désormais remplie | `ENGINE.md` décision 5 | A7.1, livré le 2026-09-30 |
| C2 | Nom et adresse du moteur | **« Moteur de growth »** en français, "Growth engine" en anglais. **Adresse `/aarrr-funnel-template` gardée** : Antoine a délégué le choix sur le seul critère SEO, et la session l'a vérifié sur les résultats de recherche du jour | `ENGINE.md` décision 1 | A7.2, livré le 2026-09-30 |
| C3 | Crédit tourdegrowth.com sur les slides | Gardé : présent, retirable | `ENGINE.md` décision 2 | — |
| C4 | Périmètre de la v1 | **Le B2B assisté entre en v1.** Un type (SaaS B2B), puis deux motions cochables, PLG et SLG. L'hybride en « deux moteurs, un total », jamais en face-à-face. L'ouverture du moteur attend | `ENGINE.md` décision 3 | A7.3 (spécification, validation, code, bon à tirer) |
| C5 | Slide « déclaré × mesuré » | Gardée décochée | `ENGINE.md` décision 4 | — |
| C6 | Moteur public, distinct de l'audit | Confirmé. Antoine tient l'audit privé pour un doublon ; la mission D4 devait trancher. **Tranché autrement le 2026-09-30 : l'audit est mis entre parenthèses, priorité au moteur** | `ENGINE.md` décision 6, `AUDIT-PLAN.md` en tête | D5 (les entretiens, réorientés vers le moteur) |
| C7 | Liens d'ouverture du moteur | Les trois pages gardent leur lien ; **pas de section à part sur l'accueil** (la carte de la bande devient le lien) ; pas de pied de page | `ENGINE.md` décision 7 | A7.4 |
| C8 | Le miroir, Tour présent non relié | **Une ligne et un bouton « Relier ce Tour »**, et la liaison dans les Réglages. L'invitation « Fais le Tour » menait à une impasse | `ENGINE.md` §8.5 | A7.5, livré le 2026-09-30 |
| C9 | Slide fuite d'une étape sans prix | **La slide existe**, avec un titre sans argent. Sous un client, l'omission est gardée | `ENGINE.md` §9.3 | A7.6, livré le 2026-09-30 |
| C10 | Place de l'encart du jeu | **Sous le bouton principal sur desktop**, comme sur mobile. Mesuré : il faisait descendre le bouton du visiteur de 350 px | `GAME-BRIEF.md` §15.4 | A7.7, livré le 2026-09-30 |
| C11 | Quand montrer l'encart | Gardé : la rétention dans le groupe, partagé compris. Le cas de plusieurs niveaux se tranche à l'ouverture d'un deuxième niveau | `GAME-BRIEF.md` §15.4 | Section E |
| C12 | Noms de zones bilingues | Gardés : « Retention — S'ils reviennent » | `GAME-BRIEF.md` §15.3 | — |
| C13 | « Vingt minutes » | Chronométré à la recette : gardé si la médiane des testeurs tombe entre 15 et 25 minutes | `GAME-BRIEF.md` §7.3 | D9 |
| C14 | Amende du jeu | **Plafonnée à 75 000 €**, le maximum légal pour une entreprise | `GAME-BRIEF.md` §5, règle 5 | A7.8, livré le 2026-09-30 |
| C15 | Cartes de la bande de l'accueil | **Des liens mesurés** à l'ouverture (`home_strip`), et les pastilles du bandeau mesurées aussi (`space_band`) | `GAME-BRIEF.md` §13.3 E | A7.9, livré le 2026-09-30 |
| C16 | Primaire du propriétaire | **« Partager » devient le primaire** chez le propriétaire ; « Refaire le Tour » passe secondaire. Le visiteur ne change pas | Ici et en A7.10 | A7.10, livré le 2026-09-30 |
| C17 | Porte de test pour `/r/<id>` | Déléguée à la session : **pas de porte, l'émulateur Firestore en CI** | Ici et en A7.11 | A7.11, livré le 2026-09-30 |
| C18 | Projects et Discussions | **Déjà désactivés** (constaté par l'API GitHub). Question non posée : la session D l'a close en parallèle avec D1, le même jour | `JOURNAL.md`, « D1 : les réglages du dépôt » | — |
| C19 | Ce qui est parti de la vague 1 | **Rien.** Et rien ne part avant que le moteur et le jeu soient prêts | `marketing/campaigns/README.md` §10 | D6 |
| C20 | Relancer le Tour sur les réseaux | **Le Tour au seul SEO**, sans fil. L'indexation et les annuaires partent maintenant | `marketing/campaigns/README.md` §10 | D10, A7.12.a |
| C21 | Captures de B et C | **Capturer maintenant**, provisoires, puis refaire à l'ouverture. Celles du Tour datent d'avant I + B | `marketing/campaigns/README.md` §10 | A7.12.a et A7.12.b livrés le 2026-09-30 ; A7.12.c à l'ouverture |
| C22 | « Qui est derrière ? » | **La réponse nomme Antoine.** C'est une question de calendrier, pas d'anonymat : pas de LinkedIn ni de lancement en grande pompe pour l'instant | `GROWTH-PLAN.md` option A, `marketing/campaigns/README.md` §10 | A7.13, livré le 2026-09-30 |
| C23 | L'ordre des lancements (tranchée le 2026-09-30) | **On attend les deux, le moteur d'abord** : C19 tient, le calendrier garde B puis C. Le jeu, prêt plus tôt, reste fermé jusqu'à l'ouverture du moteur. **Le créneau réactif du Digital Fairness Act est abandonné**, alors que la proposition est visée pour novembre 2026 (MLex, 23/09) | `marketing/campaigns/README.md` §10, `GAME-BRIEF.md` | D2, section E (le fait DFA du jeu) |
| C24 | « Voir un exemple » en roast | **Oui, tranchée le 2026-09-30** (la reco) : le bouton suit le sélecteur de ton de l'aperçu, et en roast il mène à `/r/sample?tone=roast` | Ici | Livré le 2026-09-30 avec A7.9 |
| C25 | La spécification du B2B assisté et de l'hybride (tranchée le 2026-09-30, dans sa propre session) | **Validée.** Q3 : un client compte dans la motion qui a signé son contrat en cours, et un passage n'est pas un départ. Q1 : l'activation assistée est la mise en production. Q2 : trois mois glissants, fixes. **Reprises** : Q4, une marge brute par motion, avec repli sur la marge globale ; Q7, la liaison devient un levier « Et si » dès la v1, en nombre, jamais candidate ; Q8, quatre termes de glossaire dès la v1, par une session à part. Les dix autres recos retenues. Posée sur l'exemple §18.9, Q10 et Q12 sur l'écran actuel et un croquis | `ENGINE.md` §18.12, et les sections du §18 corrigées | A7.3.c, A7.3.e |
| C26 | Laisser ou bloquer les robots d'IA (née d'A8) | **Tout laisser, et l'écrire** (la reco, tranchée le 2026-09-30) : `robots.txt` nomme les onze robots d'IA, entraînement et réponses dans deux groupes, tous en `Allow: /`. Un test refuse tout `Disallow` : en ajouter un, c'est rouvrir C26 | `src/lib/seo/ai-agents.ts`, `src/app/robots.ts` | Livré le 2026-09-30 |
| C27 | Publier un `llms.txt` (née d'A8) | **Court et généré, plus `llms-full.txt`** (tranchée le 2026-09-30 ; la reco était sans `llms-full.txt`). `/llms.txt` liste exactement les adresses du sitemap, drapeaux compris, en anglais avec l'adresse française à côté ; `/llms-full.txt` porte le texte anglais des articles et des 24 termes, construit depuis les champs que les pages impriment. Deux tests les tiennent au sitemap et aux pages. En-têtes « à relire » | `src/lib/seo/llms.ts`, `llms-full.ts`, `GROWTH-PLAN.md` 2.8 | Livré le 2026-09-30 ; sa copie ira au prochain bon à tirer |
| C28 | L'espace entre une unité et son chiffre (tranchée le 2026-09-30) | **L'unité porte son espace** (la reco) : la boîte n'en ajoute plus. Collée en anglais (« €500 », « 20% »), insécable en français (« 21 000 € », « 20 % »), ce que `Intl` donne ; `moneyUnit` reprend l'espace qu'`Intl` met à côté du signe | `Field.module.css`, `NumberField.tsx`, `.design-sync/conventions.md` | Livré le 2026-09-30 avec A11 |
| C29 | « Facultatif » : dans le libellé, ou par la prop `optional` (tranchée le 2026-09-30) | **Par la prop** (la reco) : le mot sort des quatre libellés du moteur et se dessine plus discret après eux, comme le retour 04 le dessine ; nouvelle clé `workbench.optional`. Les quatre libellés raccourcis et la clé sont « à relire » | `engine-copy.ts`, `.design-sync/conventions.md` | Livré le 2026-09-30 avec A11 |
