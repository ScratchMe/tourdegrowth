# Journal de Tour de Growth — 4. La troisième revue, l'extension 03 et les bons à tirer

*Volume archivé : les entrées du 2026-09-09 au 2026-09-11. On y trouve le premier bon à tirer, les décisions de `REVIEW-03.md`, la bibliothèque d'actions, l'extension 03 du design system et ses deux revues adversariales, la fuite `rawPoints`, le design system envoyé à Claude Design, la relance C1, la phrase de verdict, le bon à tirer nº3.*

*Le texte est celui du journal, déplacé tel quel le 2026-10-01 : rien n'y a été réécrit. Un « plus haut » ou un « voir l'entrée du… » peut donc désigner une entrée d'un autre volume. Le volume courant et la table des volumes sont dans [`JOURNAL.md`](../../JOURNAL.md), et `grep -rn "<motif>" JOURNAL.md docs/journal/` cherche partout.*

---

### Le bon à tirer est signé : 55 éléments relus, 3 retouches, un oubli (2026-09-09)

Antoine a passé les 55 éléments du document de relecture en trois séances (7, 8 et 9 septembre). **52 validés tels quels**, dont les quinze pages de glossaire long à quatre près, la page À propos écrite dans sa voix, les deux pages légales section par section, l'écran de segmentation et la page de métriques. Trois retours de fond, tous en français, tous appliqués le jour même :

- **Moment « aha »** — quatre remarques, dont une qui a trouvé une **erreur dans l'anglais aussi** : « cycle naturel × 3 (le troisième mois pour un outil hebdomadaire) » — trois cycles hebdomadaires, c'est la troisième semaine, pas le troisième mois, et la définition des « partis » (« à la fin du premier mois ») chevauchait celle des fidèles. Les deux cohortes sont maintenant définies autour du cycle dans les deux langues. Plus deux traductions trop littérales (« plié vers », « un moment qui allait à un outil solo ») réécrites, et sa reformulation « chaque écran soit rapproche l'utilisateur du moment « aha », soit disparaît » reprise telle quelle.
- **North Star** — le paragraphe du « test du doublement » ne se lisait pas ; réécrit avec « churner » en franglais comme il le propose, et le même verbe pour les trois exemples pour que le parallèle se voie.
- **Revenue** — « le terme qu'un playbook d'expansion existe pour faire grandir » : « terme » voulait dire un terme de l'identité du MRR, et se lisait comme « le mot ». Il proposait « signe », qui aurait changé le sens ; c'est « la composante de l'identité », dit dans la réponse.

Acquisition, retouchée la veille (les deux taux de la formule nommés, « client » explicité comme payant plutôt que remplacé par « utilisateur actif » — l'exemple calcule un CAC par client), a été **revalidée** sur sa nouvelle version.

**Marqueurs levés partout, `updatedAt` bougé pour les quatre termes retouchés** (acquisition au 8, les trois autres au 9 ; le reste du glossaire garde le 6, sa date de mise en ligne). Le sitemap dit donc la vérité page par page, ce qui était l'objet de R2-08.

**L'oubli.** Les six chaînes de progression de R2-27 n'ont jamais été dans le document : il a été construit avant que R2-27 soit livré, et quand j'y ai ajouté R2-26 et R2-28 le lendemain, j'ai oublié celui-là. Ajoutées au document (56ᵉ élément) et soumises en clair dans le salon, validées dans l'heure ; le dernier marqueur est levé. Le point à retenir : **le document de relecture doit être reconstruit depuis les marqueurs présents dans le code** (`grep "TODO: à relire"`), pas depuis la mémoire de ce qui a été livré — c'est le grep qui a trouvé l'oubli, pas moi.

**Réponses dans le document plutôt que dans le salon.** Les trois retours ont chacun leur réponse écrite sous la note d'Antoine, dans un bloc distinct (champ `reply`, rendu à part de son champ de note depuis le 8 : coller une réponse dans sa zone de texte l'avait rendue invisible sous le pli). La conversation de relecture vit avec la décision, pas dans un fil séparé.

**Vérifié en réel** : lint, tsc, 340 tests (dont le plancher de 500 mots par terme et par langue, et la cohérence FR/EN des `updatedAt`), un seul `TODO: à relire` restant dans `src/` et c'est le bon.

**Piège d'outillage, le soir même : la CI rouge sans qu'une ligne de code y soit pour rien.** Deux runs de suite morts à l'étape `playwright install --with-deps chromium`, avant le premier test — lint, `tsc`, les 340 tests et `next build` verts juste au-dessus dans le même log. Cause : `--with-deps` fait un `apt-get update` sur **toutes** les sources apt de l'image du runner, et le dépôt Chrome de Google (préinstallé sur `ubuntu-latest`, jamais utilisé par ce job — Playwright télécharge son propre Chromium) servait un index dont l'empreinte ne correspondait pas à son fichier Release, de façon stable pendant au moins une demi-heure. Une relance n'y pouvait rien, et il n'y en a eu qu'une, comme le veut la règle. Correctif dans `ci.yml` : supprimer ce fichier de source avant l'installation, pour que la seule dépendance apt du job soit l'archive Ubuntu elle-même. À retenir : quand une CI meurt à l'installation, lire **quel** dépôt a échoué avant de relancer — si c'est un dépôt qu'on n'utilise pas, relancer ne sert à rien, l'enlever si.

### REVIEW-03 : les sept décisions sont prises, et A4 mesure l'avant (2026-09-09)

Antoine a répondu **oui aux sept décisions** du §6 de `REVIEW-03.md`, avec deux précisions qui comptent : la bibliothèque d'actions du mode Quick sera **sans variante de ton** (60 chaînes et non 120 — une action n'a pas à être drôle), et la carte de partage affichée sur la page de résultat **portera la prochaine action sur l'image**. Le plan en trois lots est donc adopté tel quel, et l'ordre du document s'applique : A4 d'abord, puis le brief 03 pour Claude Design, puis la bibliothèque d'actions.

**A4, livré ici, est le seul item qui devait passer en premier** — pas parce qu'il est petit, mais parce qu'il mesure l'**avant**. Tout le lot A change ce que la page de résultat produit ; sans un chiffre posé maintenant, on ne saurait pas dire si ça a marché.

**Deux événements, et un écart assumé par rapport au plan du document.** `REVIEW-03.md` proposait `quiz_started/<first|retake>`. C'est un **événement à part** (`retake_started`, émis **à côté** de `quiz_started`, jamais à sa place) : `quiz_started` est le dénominateur de tous les taux de déperdition depuis R-11, et un suffixe de détail aurait figé ce chemin exact pour en démarrer deux nouveaux — la même fragmentation que `share/<ton>` a subie en R-10, mais cette fois sur le nombre que chaque ratio divise. Le second, `landing_return`, n'entre pas dans le ratio : c'est le dénominateur dont C1 (la relance à 30 jours) aura besoin pour qu'on puisse dire si elle sert à quelque chose.

**Le chiffre s'appelle « actions de valeur par résultat », pas un taux, et n'est pas affiché en pourcentage.** Un même résultat peut être partagé deux fois, ouvert par deux visiteurs **et** mener à un Deep dive : il dépasse donc légitimement 1. L'appeler un taux de conversion referait exactement l'erreur de R2-01 — un ratio qui ne peut pas vivre dans la plage que son nom promet. Et les deux moitiés viennent de **GoatCounter**, jamais une de Firestore : un visiteur qui bloque les scripts est invisible pour l'un et visible pour l'autre, donc un ratio mixte sous-compterait d'autant.

**Le vrai enseignement de cette PR est un défaut trouvé par le test, pas par la relecture.** Tous les événements existants partent d'un clic, donc bien après que `strategy="afterInteractive"` a chargé `count.js`. `landing_return` part **au montage** et perdait la course : l'optional chaining de `trackEvent` (`window.goatcounter?.count?.()`) rendait le raté totalement silencieux — le compteur aurait simplement été bas en production, sans erreur nulle part. La spec e2e l'a vu ; rien d'autre ne l'aurait vu.

Corrigé dans `trackEvent` plutôt qu'au point d'appel, pour que les prochains événements au montage (C1 en aura) soient couverts d'office : un événement non délivré est **mis en file** et rejoué dès que le script arrive, avec un budget borné à 10 s — si le script ne vient jamais (bloqueur de pub), la file est jetée plutôt que tenue indéfiniment, ce qui est le marché que le `?.` silencieux passait déjà, mais assumé cette fois.

**Piège de vérification qui en découle** : une assertion sur un événement émis au montage doit **poller** (`expect.poll`), jamais lire une fois juste après `goto` — même leçon que `expectStoredRefId` en R-07, sur une cause différente (là l'écriture arrivait après l'hydratation, ici la livraison attend le script).

**Vérifié en réel** : lint, tsc, **345 tests unitaires** (+5), `next build`, **144 specs Playwright** (+2). Non-vacuité mesurée finement : en retirant la file d'attente et en reconstruisant, **1 des 3 tests unitaires de file tombe et la spec e2e « return and retake » tombe** ; les deux autres tests unitaires passent dans les deux cas (l'un affirme une absence, l'autre le chemin déjà couvert) — c'est écrit dans le fichier de test plutôt que laissé à supposer.

**Ce qui n'est pas vérifiable depuis ce bac à sable**, comme toujours pour GoatCounter (le proxy sortant bloque `*.goatcounter.com`) : que les deux nouveaux chemins apparaissent réellement dans le tableau de bord. À confirmer par Antoine sur `/admin/stats` après déploiement — la section funnel doit montrer deux lignes de plus et la ligne « Value actions per result ».

### Brief 03 pour Claude Design : le résultat doit dire quoi faire (2026-09-09)

`design/DS-EXTENSION-BRIEF-03.md` + `design/ds-extension-03/*.png` (10 captures 2×, vrai build de production). **Il remplace et absorbe le brief 02**, qui était écrit mais jamais envoyé : la question du roast y devient la §4 au lieu d'être le sujet entier. La raison est celle du §1 de `REVIEW-03.md` — un retour sur le brief 02 aurait été périmé avant qu'on puisse le porter, puisque l'écran qu'il concerne est précisément celui que le lot A change.

**Cinq sections, une seule thèse** : le résultat gratuit diagnostique et s'arrête. Le brief demande (1) le bloc « l'étape qui freine » avec sa netteté en trois états, (2) où placer l'action gratuite, (3) la carte de partage rendue visible sur la page avec l'action **sur** l'image, (4) la carte d'aperçu de la landing + la question du roast, (5) une section « Problème » de deux lignes.

**La vraie question de design, celle qui ne se code pas** : la carte « Action prioritaire — verrouillée » tire toute sa force persuasive de son vide (décision d'Antoine du 2026-08-28 : compléter le Deep dive **remplit** ce créneau plutôt que d'ajouter un élément). Une action gratuite dans le résultat supprime ce vide. Le brief pose donc explicitement le choix — l'action gratuite occupe ce créneau avec l'offre Deep dive qui devient « rends-la spécifique à mon entreprise », ou elle vit ailleurs et la carte verrouillée reste — avec notre penchant dit et la décision laissée au design. Une contrainte non négociable est ajoutée dans les deux cas : **un visiteur non propriétaire doit voir l'action**, c'est lui le numérateur de toute la boucle de partage.

**Capture obtenue avec le patch local jamais committé** habituel (`10-result-locked-card-en.png` — la carte verrouillée est réservée au propriétaire) ; patch retiré et absence de trace vérifiée avant commit. Les captures du roast et de son image OG sont reprises telles quelles du brief 02, prises de la même façon.

**Ce que le brief impose plutôt que suggère** : le CTA principal reste le plus proéminent, le neutre reste le défaut, le contraste est vérifié en CI **sans aucune exception restante** (donc `--paint-red` est nommé comme échouant pour du corps de texte, avec ses deux frères qui passent), un seul emoji dans la marque, et le score doit rester ré-explicable en dix secondes — ce dernier point étant la raison pour laquelle la « netteté » est calculée et le badge « Confidence: High » de la revue externe refusé.

**Action d'Antoine** : envoyer le brief à Claude Design. La session n'a pas accès au projet (`DesignSync` demande une autorisation qui ne s'obtient que depuis une session interactive sur sa machine), donc le retour se fait par dépôt sous `design/ds-extension-03-return/` ou par « Send to Claude Code Web », comme les deux fois précédentes.

### L'image OG « roast » des briefs n'en était pas une (2026-09-09)

Trouvé en relisant le résumé du merge du brief 03 : `08-og-neutral-en.png` et `09-og-roast.png` faisaient **exactement le même nombre d'octets**. Somme de contrôle : identiques, et identiques aussi à `design/ds-extension-02/07-og-roast.png`. Autrement dit le brief 02 avait capturé une image neutre en croyant capturer le roast, et le brief 03 en a hérité — j'aurais envoyé à Claude Design deux fois la même image en lui demandant de comparer les deux traitements.

**La cause, qui vaut d'être notée parce qu'elle piège deux fois.** `loadOgData()` traite `/r/sample` dans une **branche précoce qui code `roast: false` en dur** ; la ligne `roast: …` qu'on voit en lisant le reste de la fonction appartient à la branche des vraies soumissions. Un patch local posé sur cette seconde ligne ne change donc rien à l'échantillon — c'est exactement ce qui s'est passé, deux fois : au brief 02, puis à ma première tentative de correction.

**Et il a failli me piéger une troisième fois** : j'avais lancé le rebuild avec `>/dev/null 2>&1 &&`, donc quand `next build` a échoué (un fichier en cours d'écriture pour A2 avait une erreur de type), le `&&` a court-circuité en silence et le `curl` qui suivait a interrogé **l'ancien serveur**. La capture « après correctif » était en fait la capture d'avant. Ne jamais faire taire la sortie d'un build dont on va utiliser le résultat.

**Ce qui a permis de le voir** : une taille de fichier identique dans le `--stat` d'un merge. C'est le genre de détail qu'on lit sans le voir ; ici, deux PNG censés être différents ne peuvent pas peser le même nombre d'octets. Les deux fichiers sont corrigés (brief 02 compris, même s'il ne part pas — un fichier mal étiqueté au dépôt est un piège pour la prochaine lecture).

### A2 : la bibliothèque d'actions, et la règle qui choisit laquelle (2026-09-09)

Le trou que `REVIEW-03.md` désigne comme le seul vrai P0. `SPEC-ADDENDUM-01.md` §0 avait sorti Gemini du mode Quick — bon choix, ça a rendu le résultat gratuit instantané et déterministe — et le champ `recommendation` est parti avec, faute de remplacement statique prévu par l'addendum. Depuis, le résultat gratuit diagnostique et s'arrête.

`content/next-moves.ts` (30 actions × 2 langues) + `lib/scoring/next-move.ts` (résolveur pur). **L'affichage n'est volontairement pas câblé** : où l'action se place est une question posée au brief 03, et c'est exactement le découpage que le plan prévoyait (« peut être écrite pendant que le design travaille »).

**Écart de dimensionnement par rapport au plan, assumé.** `REVIEW-03.md` dimensionnait la bibliothèque en **pilier × bande**, trois alternatives par entrée. Elle est indexée en **question × réponse**. La raison vaut d'être gardée : avec une clé pilier × bande, quelque chose doit *encore* choisir laquelle des trois montrer — et toute règle pour ça est soit arbitraire (un index, une rotation), soit une re-dérivation des réponses, auquel cas autant que les réponses soient la clé. Avec cette clé-ci, la règle tient en une phrase : **la première chose qui manque dans l'étape qui te freine**. Même volume de copie que l'estimation validée, pour une action qui répond à ce que la personne a réellement dit — « choisis un canal » et « mesure celui que tu as » sont deux conseils différents, et les deux se lisent aujourd'hui « Acquisition est ton point faible ».

L'ordre des trois questions d'un pilier va du fondamental à l'avancé (canal → second canal → CAC), donc « la première non satisfaite » est un départage qui a du sens, pas un artefact d'ordre de déclaration. La réponse à 20 points n'a **pas** d'entrée : il n'y a rien à y corriger, et un pilier dont les trois réponses sont pleines score 20, donc bande forte, donc `LEVEL_MOVE` — le message unique quand rien ne freine (nommer un goulot là serait de la fausse précision, exactement ce que le §3 refusait au badge « Confidence: High » de la revue externe).

**Résolu côté serveur, et ce n'est pas un détail d'implémentation.** Les réponses vivent sur la soumission et ne sont jamais dans le payload public (R-02, R2-19). Le serveur résout donc une seule phrase et n'envoie que ça — même motif que R-09. Conséquence voulue : **un visiteur voit l'action**, alors qu'il n'a aucune réponse sur son appareil pour la dériver. C'est lui le numérateur de toute la boucle de partage, et c'est l'action qui rend un lien partagé digne d'être ouvert.

**Les tests portent les règles d'écriture, pas seulement la structure** : couverture exacte des 15 questions (les ids sont des `string`, donc le type ne peut rien garantir), chaque valeur de points réellement présente sur les options de la question concernée (donc la bibliothèque ne peut pas dériver de `copy-library.ts`), une seule phrase par action, jamais de pourcentage ni de délai promis — une fois arrivé à l'écran, ce texte a un seul créneau, et « en deux semaines » ou « +20 % » survendrait ce que quinze questions peuvent savoir.

**Un test m'a repris sur mon propre découpeur de phrases** : « Ask every departing customer one question — why now? — and read the answers » comptait pour deux phrases. La copie était juste, l'assertion naïve — une frontière de phrase, c'est une ponctuation terminale **suivie d'une majuscule**, pas un `?` au milieu d'une incise.

**Non-vacuité prouvée finement** : en ignorant la réponse donnée (toujours l'action « 0 point »), 1 test tombe ; en remplaçant « la première question non satisfaite » par « la dernière », 2 tombent. Les deux règles sont donc bien testées séparément.

**Vérifié en réel** : lint, tsc, **357 tests unitaires** (+12), couverture au-dessus des seuils, `next build`.

**Ce qui reste** : la relecture d'Antoine (c'est le premier texte du produit qui dit à quelqu'un quoi faire de son entreprise — marqueur `TODO: à relire` en tête du fichier, convention 6), puis le câblage à l'écran quand le retour du brief 03 arrive.

### La bibliothèque d'actions est validée (2026-09-09)

Les 31 actions de `content/next-moves.ts` sont passées dans le même document que le reste (« Bon à tirer du Tour », nouveau bloc « Prochaine action ») : **16 cartes, toutes approuvées sans une seule note**. Marqueur levé ; plus aucun `TODO: à relire` dans `src/`.

**Deux choses valent d'être notées sur la façon dont le bloc a été monté**, parce qu'elles se réutiliseront :

1. **Les textes viennent du code, pas d'une recopie.** Le payload a été exporté en important les vrais modules (`content/next-moves.ts` + `copy-library.ts`) depuis une sonde jetable lancée avec `vitest.live.config.ts` — le seul runner du repo qui résout TypeScript et l'alias `@/` — puis supprimée (`git status` vérifié propre). Relire une copie retapée qui aurait dérivé du code serait pire que ne pas relire : on validerait un texte qui n'est pas celui qui s'affichera.
2. **Une carte par question, pas une par action.** Les deux actions d'une question sont montrées côte à côte, étiquetées par la réponse exacte qu'elles traitent et ses points. C'est ce découpage qui rend la seule vraie question de relecture visible : est-ce que les deux disent bien deux choses différentes, ou la même en d'autres mots ? Trente cartes isolées l'auraient cachée.

**Piège d'injection rencontré** : le payload de l'artifact est une seule ligne `<script>window.__BAT__={…};</script>`, avec un **point-virgule** avant la balise fermante — le premier motif d'extraction l'incluait dans le JSON et `json.loads` échouait sur « Extra data ». Corrigé en l'ancrant dans le motif. Vérifié ensuite que le moteur de rendu (les ~200 lignes qui suivent) est **inchangé au diff près**, et que les 72 ids restent uniques : les décisions vivent dans la base `reviews/<itemId>`, donc un id dupliqué aurait silencieusement écrasé une décision existante.

**Trois cartes restent marquées « à changer » dans la base** (aha-moment, North Star, Revenue) : ce sont celles du 2026-09-09 matin, corrigées et répondues le jour même. Le statut n'a pas été rebasculé parce que la conversation vit sous la note ; ne pas le lire comme du travail ouvert.

### B1 + B3 : la landing dit ce qu'on en repart avec, et qui l'a faite (2026-09-09)

Les deux petites PR de copie du lot B, livrées ensemble : elles touchent le même écran et la même question — que dit la landing en plus du problème posé par le H1 ?

**B1 — la promesse.** Le H1 reste (« Où ta croissance cale-t-elle ? ») : il pose le problème, c'est son travail, et le changer serait un pari sur de la copie approuvée sans moyen de mesurer. Ce qui manquait est le livrable. **La chaîne proposée par `REVIEW-03.md` n'a pas été retenue** : « 15 questions · 5 étapes · 1 priorité claire » répète « 15 questions » alors que le `bibTag` deux lignes plus haut dit déjà « № 15 questions — 3 min — entrée gratuite » — deux fois le même chiffre à quelques centimètres se lit comme du remplissage. La ligne ne dit donc que la moitié absente : « Tu repars avec l'étape qui te freine — et une action à mener. » Rendue en mono (`--meta-sm`), la voix « scannée » du site, pour qu'elle se lise comme un fait sur le produit et non comme un second sous-titre. **Elle n'était pas écrivable honnêtement avant A2** : jusqu'à hier le résultat gratuit ne donnait aucune action.

**B3 — la phrase de fondateur.** `LANDING_PULL` dans `content/about.ts` — pas dans `dictionary.ts`, parce que c'est la voix d'Antoine et que ce fichier-là est fait pour ça. La citation est **la même proposition que `ABOUT.intro`**, simplement capitalisée et ponctuée puisqu'elle est isolée. J'ai d'abord écrit « verbatim » dans le commentaire : c'était faux, et un test le dit maintenant mieux qu'un adjectif — il compare les deux en ignorant la casse et la ponctuation finale, exactement la liberté prise et pas une de plus. Sans ça, la landing et `/about` finissent par raconter deux versions légèrement différentes de la même chose.

**Deux défauts trouvés par les tests, pas par la relecture :**
1. **Mon sélecteur de CTA attrapait celui du header** (`y = 26`), pas celui de la hero — donc « la promesse est avant le CTA » passait pour fausse alors que le placement était bon. Le CTA de la hero a maintenant un `data-testid` ; se fier au libellé seul ne marche pas quand deux boutons le partagent.
2. **La ligne fondateur n'est pas sous la ligne de flottaison** à 1280×900 : elle est à y=709. Mon assertion `y > 900` encodait une lecture littérale de `REVIEW-03.md`, et la satisfaire aurait voulu dire rembourrer la page pour franchir une ligne arbitraire — concevoir contre un test. L'assertion dit maintenant la propriété qui porte vraiment l'intention (après **tout** le hero, colonne de droite comprise), et le nom du test a été corrigé pour ce qu'il vérifie, pas pour ce que je croyais vérifier.

**Piège CSS évité de justesse** : `--border-rule` est un raccourci `border` complet (`2px dashed var(--border-divider)`), pas une couleur — `border-top: 2px dashed var(--border-rule)` se serait développé en absurdité silencieuse. Vérifié sur les usages existants (`SiteFooter`, `ContentHeader`) plutôt que supposé.

**Vérifié en réel** : lint, tsc, 360 tests unitaires (+3), `next build`, **150 specs Playwright** (+6). Non-vacuité prouvée : en retirant la ligne promesse et en reconstruisant, 4 des 6 nouvelles specs tombent. Captures relues en EN desktop, FR desktop et FR mobile 390 px — aucun débordement, la promesse tient sur deux lignes en français sans casser le rythme jusqu'au CTA.

**Les deux chaînes repartent au statut « à relire »** (convention 6) — la phrase citée de B3, elle, est déjà validée ; seuls l'attribution et le libellé du lien sont neufs.

**Signalé plutôt qu'absorbé** : le brief 03 §5 demande à Claude Design où placer une section « Problème » — potentiellement entre le H1 et le CTA, c'est-à-dire là où la ligne B1 vient de s'installer. C'est exactement ce que la passe design doit arbitrer ; si les deux se gênent, c'est la ligne B1 qui bouge.

---

### Extension 03 du design system, lot 1 : les primitives, rien de câblé (2026-09-10)

Retour de la session Claude Design sur `design/DS-EXTENSION-BRIEF-03.md`, déposé tel quel sous `design/ds-extension-03-return/` — le bundle fait autorité, comme celui de l'étape 13 et de l'extension 01. Cinq composants (`Bottleneck`, `ShareCard`, `PriorityMove` modifié, `ToneToggle` modifié, `ShareImage`), deux tokens, et `guidelines/compositions-ext-03.md` qui décrit les deux pages recomposées.

**Le port est découpé en quatre PR, et celle-ci ne câble rien.** Les trois autres suivent : la page de résultat (score card + colonne de droite + carte de partage), l'image OG (les cinq lignes de piliers sortent, l'action entre), la landing (énoncé du problème + toggle de ton dans la carte d'aperçu). Découpé parce que chacune touche un écran différent et se vérifie différemment ; empilées, ça aurait donné une PR impossible à relire.

**Les réponses du design aux 8 questions du brief**, pour ne pas avoir à rouvrir le document : le bloc bottleneck va **dans** la carte de score, sous le numéral, **à la place de la ligne de verdict** (le verdict devient sa dernière ligne) ; l'action gratuite **remplit le créneau autrefois verrouillé** et ce créneau **monte en tête de colonne de droite**, l'offre Deep dive passant sous un filet **dans la même carte**, propriétaire uniquement ; « Partager ce résultat » quitte la rangée de CTA pour une `ShareCard` sous les bandeaux de piliers, la rangée ne gardant que le primaire ; la landing reçoit un `ToneToggle size="compact"` dans l'en-tête de la carte d'aperçu et un énoncé du problème en deux lignes **au-dessus** de la carte, aux deux largeurs.

**`lib/scoring/bottleneck.ts` — la seule vraie logique nouvelle, et elle est pure.** Le prompt du composant appelle la netteté « the honesty mechanism » : un nom de pilier en stencil 36px est une affirmation, et `sharpness` dit si les chiffres la portent. Trois états, décidés dans cet ordre : `level` (tous les piliers dans la bande forte — rien ne freine, donc rien n'est nommé), `clear` (le plus bas est à ≥4 points du suivant — un nom), `shared` (le bas est encombré). `sharpness` est **requis** dans le type, pas défaulté à `"clear"` comme dans le bundle : laisser l'affirmation la plus forte par défaut est exactement l'échec que ce prop existe pour empêcher.

**Écart assumé contre le bundle, signalé plutôt qu'absorbé** : `Bottleneck.d.ts` dit de son prop `pillars` « clear reads [0]; shared reads [0] and [1] » — deux noms, jamais plus. Deux est juste pour le cas dessiné sur la planche, et faux pour celui que le moteur produit souvent : avec trois options de réponse un score de pilier ne peut tomber que sur `{0,2,5,7,9,11,13,16,20}`, neuf valeurs pour cinq piliers, donc les égalités en bas de tableau sont courantes et une égalité à trois n'a rien d'exceptionnel. Plafonner à deux reviendrait à retenir les deux qui viennent en premier dans l'ordre canonique AARRR et à taire silencieusement un troisième pilier au même score — un choix arbitraire présenté comme un diagnostic, précisément ce que la netteté existe pour empêcher. `shared` renvoie donc tout le groupe du bas, et le libellé sera écrit avec un compteur (`{n}`) plutôt qu'avec le mot « deux ». **Vérifié à l'écran avant d'être décidé** : trois noms empilés tiennent très bien, en 1280 comme en 390.

**11 tests unitaires**, dont deux qui portent plus que la structure :
- Un **balayage exhaustif des 9⁵ = 59 049 tableaux atteignables** (l'espace entier, pas un échantillon) qui vérifie les invariants — le groupe commence bien au minimum, il contient exactement les piliers dans la fenêtre, `clear` en nomme un seul — **et que les trois états sont réellement atteints**, sans quoi un balayage qui n'exercerait qu'une branche passerait en ne prouvant rien.
- Une **contre-vérification avec `resolveNextMove`** : `sharpness === "level"` doit valoir exactement `move === LEVEL_MOVE`. L'échec que ça épingle est une page qui dirait « rien ne te freine » dans la carte d'action tout en tamponnant un nom de pilier juste au-dessus.
- La borne des 4 points a son propre test des deux côtés (écart 4 → `clear`, écart 2 → `shared`), parce que le balayage dérive son attendu de `CLEAR_GAP` et ne peut donc pas attraper une mauvaise valeur pour cette constante.

Non-vacuité mesurée finement : en neutralisant la garde `level`, **4 tests tombent** ; en passant `CLEAR_GAP` de 4 à 1, **un seul** — ce qui est le signal qui a fait ajouter le test de borne.

**Ce qui a été vérifié à l'écran, et pourquoi il a fallu un échafaudage.** `Bottleneck` et `ShareCard` ne sont montés nulle part dans cette PR : sans rien, elles seraient parties sans que personne ne les ait jamais vues. Page de prévisualisation **locale, jamais committée**, montant les trois états de netteté, les trois états de `PriorityMove` (visiteur, propriétaire avec le seuil d'upgrade, niveau) et les deux tailles de `ShareCard` — captures relues en 1280 et 390, retirée ensuite, absence de trace vérifiée avant commit (même méthode que R-12, R2-02 et R2-28).

Mesuré plutôt que jugé à l'œil : `ToneToggle size="compact"` sort bien à **32px de piste pour 44px de zone tactile** en mono 11px, le nom de pilier fait **36px en desktop et 30px sous 760px** (la convention CSS-only de `ScoreDisplay`), le verdict 15px/14,5px, l'image de `ShareCard` tient le ratio **1,905 = 1200/630**, et son cadre passe de 14px à 12px sous 760px. Le rouge du nom en roast est bien `--paint-red` (#d2402c) : à 36px stencil 700 c'est du texte large, seuil AA 3:1, et cette paire mesure 4,42:1 — même raisonnement que l'accent du H1 de la landing.

**Deux pièges d'outillage rencontrés, tous deux dans la vérification et non dans le code.**
1. Un dossier de route commençant par `_` est un **dossier privé** pour Next : `app/(app)/__ds03/` n'a jamais été routé et répondait 404 sans qu'aucun message ne le dise. Renommé, la route est apparue.
2. Ma première passe de mesure a rapporté « `PriorityMove.eyebrow` est en `display: block` » et « la carte fait 0px de padding bas » — **les deux étaient des artefacts de sélecteur**, pas des défauts : `querySelector('div[class*="eyebrow"]')` renvoie le premier du document, qui est celui de `ScoreDisplay`, et ma page d'échafaudage passait `padding="mobile"` à `Card`, dont le prop `padding` est une **chaîne CSS brute** — `padding: mobile` est invalide, donc 0. Vidé les vrais noms de classes hachés avant de conclure. Une mesure qui rapporte une anomalie doit d'abord prouver qu'elle a regardé le bon élément, exactement comme une recherche qui ne trouve rien doit prouver qu'elle a regardé quelque part (leçon du run n°8).

**Reste sans couverture automatisée jusqu'au lot 2**, dit franchement : `Bottleneck` et `ShareCard` n'ont aucune spec e2e, parce que la convention de ce repo est que les assertions de composant vivent dans `e2e/` contre de vraies pages et qu'aucune page ne les monte encore. Elles arrivent avec le lot 2 (page de résultat) et le lot 4 (landing).

**Flake observé une fois, noté plutôt que tu** : `e2e/locale-routing.spec.ts:75` (« switching language carries over to the unprefixed app pages ») a échoué une fois sur une passe complète et repassé seul puis en passe complète — 150 specs vertes deux fois de suite ensuite. Aucun rapport avec ce changement ; à surveiller si ça se reproduit.
### `rawPoints` partait dans le payload de chaque résultat partagé (2026-09-10)

Trouvé en cartographiant la page de résultat avant de porter l'extension 03 — pas cherché, rencontré.

**R2-24 avait retiré `rawPoints` de `BreakdownData` pour une raison précise** : avec des options à 20, 7 et 0, chaque somme atteignable (0, 7, 14, 20, 21, 27, 34, 40, 41, 47, 54, 60) identifie exactement le multiensemble de réponses derrière elle, ce que le score arrondi ne fait pas — 7/20 recouvre aussi bien 20+0+0 que 7+7+7. Mais le même item n'a pas touché **l'autre** chemin, qui est le plus exposé des deux : `page.tsx` passait `submission.pillars` tel quel à un Client Component.

**Pourquoi rien n'a protesté.** Le prop est *déclaré* `{pillar, score}[]`, et TypeScript accepte un objet plus large dès qu'il n'est pas un littéral. Le typage était donc correct, le compilateur muet, et RSC sérialisait l'objet **à l'exécution** — `rawPoints` compris — dans le payload de chaque `/r/<id>` public. Une déclaration de type n'est pas une frontière ; `toPillarViews` en est une.

`toPillarViews` fait pour ce champ ce que `toDeepDiveView` fait déjà pour le contexte libre, et vit au même endroit. `/r/sample` n'est pas passé à travers, volontairement : ses données sont fixes et publiques par construction, il n'y a rien à y cacher, et ajouter un appel qui ne fait rien laisserait croire le contraire.

**Le test qui compte n'est pas celui de la fonction.** `toPillarViews` ne se trompera pas ; ce qui peut revenir, c'est un futur recâblage de `page.tsx`. D'où une garde statique ajoutée à `client-bundles.test.ts` (même précédent : « une déclaration de type n'est pas une frontière », un cran plus haut) qui exige que `pillars` passe par le view-model. Non-vacuité vérifiée : en remettant `pillars={submission.pillars}`, exactement ce test tombe. Plus deux tests unitaires, dont un en liste blanche — le second vérifie qu'un champ *futur* est écarté lui aussi, pas seulement celui qu'on connaît aujourd'hui.

**Aucun e2e ne peut couvrir ça**, dit franchement : `/r/sample` n'a pas de `rawPoints` par construction, et un vrai résultat demande Firestore, que la CI n'a pas. La garde statique est ce qui reste, et c'est pour ça qu'elle existe.

Vérifié : `tsc`, `eslint`, 363 tests unitaires (+3), seuils de couverture, `next build`.

### Extension 03, lot 2 : la page de résultat dit quoi faire (2026-09-10)

Le lot 1 avait livré les composants sans rien câbler. Celui-ci recompose `/r/[id]` selon `guidelines/compositions-ext-03.md`.

**Ce qui change à l'écran.** Le verdict quitte `ScoreDisplay` et devient la dernière ligne d'un bloc `Bottleneck` tamponné sous le numéral, dans la même carte : numéral → filet → « une étape te freine » → RETENTION 8/20 → verdict. L'action gratuite (`content/next-moves.ts`, écrite en A2 et relue le 2026-09-09) remplit le créneau que la carte « verrouillée » occupait, et ce créneau monte **en tête de colonne de droite** — donc juste sous la carte de score sur mobile. « Partager ce résultat » quitte la rangée de CTA pour une `ShareCard` qui montre la vraie image OG du résultat, avec un lien « Enregistrer l'image ».

**Un visiteur voit l'action.** C'est le point le plus important du lot, et il tient à une décision d'architecture : `resolveNextMove` est appelé **sur le serveur**, comme `buildQuickVerdicts` depuis R-09. Les réponses dont l'action dérive ne quittent jamais le serveur (R-02, R2-19), et un visiteur n'a rien sur son appareil pour la dériver — mais c'est lui le numérateur de toute la boucle de partage, et une action est ce qui rend un lien partagé digne d'être ouvert. Le créneau vide n'allait jamais y arriver.

**L'ordre de lecture mobile ne peut pas venir de l'ordre du DOM.** Le design demande : score+bottleneck · action · piliers · points forts · pertes · CTA · partage · disclaimer. Les colonnes contiennent respectivement {score, piliers, partage} et {action, forts, pertes, CTA, disclaimer} : l'alternance L,R,L,R,R,R,L,R rend l'ordre demandé **impossible** à obtenir en groupant par colonne. D'où `display: contents` sur les deux colonnes en mobile et un `order` par enfant. Les mêmes valeurs sont croissantes **à l'intérieur** de chaque colonne desktop (1,3,8 à gauche ; 2,4,5,6,7,9,10 à droite), donc rien n'est à réinitialiser au point de rupture et les deux mises en page ne peuvent pas diverger.

**J'ai cru avoir introduit un défaut d'accessibilité, et la mesure m'a détrompé.** `order` découple l'ordre visuel de l'ordre de tabulation, et une spec existante (`visitor-cta`) affirmait précisément « Document order = reading order = focus order ». Plutôt que de réécrire l'assertion ou de théoriser, j'ai relevé les deux ordres dans le navigateur : **3 éléments focalisables sur 10 hors ordre visuel en 390px, 4 sur 10 en 1280px**, et dans les deux cas c'est un échange **adjacent** en bas de page — les deux contrôles de la carte de partage sont atteints juste avant le CTA principal au lieu de juste après. C'est la conséquence ordinaire d'une mise en page à deux colonnes (on tabule la colonne de gauche, puis celle de droite), pas une dispersion. L'assertion porte maintenant sur l'ordre **visuel**, qui est ce qu'un lecteur vit, avec la mesure et sa raison écrites dans la spec plutôt que sous-entendues.

**Deux points que le retour du design ne couvrait pas, tranchés ici et pas en silence :**
- **Quel bouton est le primaire du propriétaire.** Le retour ne raisonne que sur l'écran visiteur, dont le primaire est « Fais ton propre Tour ». Le partage parti de la rangée, « Refaire le Tour » est promu. J'ai essayé de faire du bouton de `ShareCard` le primaire du propriétaire — c'est l'action que SPEC.md §7 appelle le cœur du produit — puis **annulé** : `ShareCard.prompt.md` dit « never primary », et l'ordre mobile du design place la rangée de CTA **au-dessus** du bloc de partage, donc un primaire dans la carte se retrouverait sous un secondaire. C'est l'image qui vend le partage ici, pas un bouton plein. À signaler quand même à Antoine : sur le résultat d'un propriétaire, le plus voyant devient « refaire », pas « partager ».
- **Un propriétaire en roast garde « Repasser en neutre ».** Le retirer supprimerait le seul chemin de retour depuis un ton, et cette réassurance est exactement ce que l'étape 7 promettait en refusant un toggle symétrique (réaffirmé par Antoine à R-23). Le partage a quitté la rangée ; le chemin de retour, non.

**Copie retirée parce que le produit l'a rendue fausse, pas par goût.** `teaserText`/`teaserCta` disaient « débloquer ton action prioritaire » — vrai tant que le résultat Quick n'avait aucune action. Depuis A2 il en a une, et l'extension 03 la met dans la carte que cette copie appelait verrouillée. « Débloquer » serait désormais un mensonge sur notre propre produit. Remplacés par `upgradeText`/`upgradeCta` (« Rends-la spécifique à ton entreprise »), au statut « à relire ». `priorityMoveLockedLabel`, `ctaShare` et `ctaShareRoast` deviennent morts et sont supprimés (discipline R-08), ainsi que le prop `verdict` de `ScoreDisplay` et ses trois classes CSS.

**Défaut préexistant corrigé au passage** : `ResultView` appliquait `styles.headerRoast`, une classe **jamais définie** dans son module — l'en-tête en roast rendait donc `class="header undefined"` depuis toujours. Retiré ; le signal roast venait déjà du seul badge.

**Défaut préexistant repéré et NON corrigé ici, pour ne pas brouiller ce que ce lot change** : sur desktop, `PillarChip stretch` étale ses quatre enfants en `space-between`, ce qui donne « 18 … /20 … Acquisition … ? » au lieu du « 18/20 … Acquisition » que l'étape 12bis décrivait. Visible en production aujourd'hui, invisible sur mobile (où `stretch` est inerte). À traiter séparément. *(Fait le 2026-09-11 — voir l'entrée « une régression de portage, pas un défaut d'origine » : la règle venait de ce lot-ci, recopiée d'un balisage à deux éléments flex sur un balisage qui en a quatre.)*

**Vérifié en réel** : `tsc`, `eslint`, 373 tests unitaires, seuils de couverture, `next build`, **159 specs Playwright** (+9, nouveau fichier `e2e/result-composition.spec.ts`), passe axe verte sur `/r/sample`. Captures relues : visiteur EN desktop et FR mobile, propriétaire EN desktop et FR mobile (via un patch **local jamais committé** donnant un id à l'échantillon — retiré, absence de trace vérifiée avant commit).

**Non-vacuité mesurée, et une leçon dedans.** En retirant les règles `order`, **la spec d'ordre de lecture tombe** — mais une seconde tombait aussi, et pour une mauvaise raison : supprimer la seule règle d'une classe fait que **CSS Modules ne l'émet plus du tout**, donc `styles.slotScore` devenait `undefined` et mon sélecteur ne trouvait rien. Sabotage refait autrement (le bloc `Bottleneck` déplacé hors de la carte de score) : **exactement une** spec tombe, la bonne. Et ma première version de cette assertion cherchait un `data-testid` sur l'élément dont elle partait — elle ne pouvait que passer ; remplacée par une mesure de boîte englobante.

### Extension 03, lot 3 : l'image de partage porte une action, plus un tableau (2026-09-10)

Les cinq lignes de piliers quittent l'image OG du résultat ; l'action prend leur place dans une carte au pointillé rouge, même grammaire que `PriorityMove` sur la page — dashed red is advice — pour qu'un lecteur qui clique reconnaisse ce qu'il a vu dans l'aperçu. Le numéral, l'en-tête, le filet, la relance du bas et le badge de domaine ne bougent pas. Raison du design, reprise telle quelle : cinq scores sont la chose la moins partageable de cette image (ils sont re-dérivables depuis la page, et personne ne repartage un tableau) ; une action est une raison de poster.

**L'image montre toujours l'action de la bibliothèque, jamais celle du Deep dive**, même quand un Deep dive existe. Deux raisons : la bibliothèque plafonne à 144 caractères, ce pour quoi cette carte est dimensionnée, alors qu'une phrase de Gemini n'a aucun plafond et déborderait ou forcerait à réduire le corps ; et un aperçu de lien est la seule surface qui doit s'afficher à l'identique pour tout le monde — déterministe vaut mieux que personnalisé ici.

**Le pire cas a été rendu, pas supposé.** La plus longue entrée de la bibliothèque fait **exactement 144 caractères** (`act-1`/7 en français, avec guillemets français et accents). Rendue en vrai : cinq lignes, la carte tient largement entre le filet de route et la relance du bas. La borne du test passe donc de 160 à **144**, avec la raison écrite dedans — ce n'est pas un nombre rond, c'est la largeur de cette carte à Inter 600 28px/1.3. Plafonner la phrase, jamais le corps.

**État « rien ne freine ».** La relance du bas nommait le pilier le plus faible ; quand aucune étape n'est derrière, elle nommerait un goulot que les chiffres ne portent pas — la même règle d'honnêteté que le bloc `Bottleneck`. Nouvelle chaîne `og.stallSentenceLevel` (à relire), et l'en-tête de la carte perd son `PILIER · score/20`.

**Le test de couverture des polices s'étend à toute la bibliothèque d'actions**, pas à un échantillon : un seul caractère accentué absent du sous-ensemble est un carré vide sur le lien partagé de quelqu'un, et seulement le sien. Non-vacuité vérifiée — et instructive : ma première tentative a inséré `✂` et **le test est passé**, parce que `isEmoji` filtre les `Extended_Pictographic` (que next/og dessine avec Twemoji, donc c'est correct). Refaite avec `漢` : les deux tests Inter tombent. Un sabotage qui passe demande d'abord de comprendre pourquoi.

**Vérifié en réel** : les trois variantes rendues en PNG 1200×630 et regardées — neutre, roast (cadre et badge rouges, la carte d'action ne change pas : l'addendum ne prévoit pas de variante roast pour l'action), et « niveau ». Plus `tsc`, `eslint`, 373 tests unitaires, seuils de couverture, `next build`, 159 specs Playwright. Les variantes roast et niveau ne sont pas atteignables sans Firestore : rendues via un patch **local jamais committé** piloté par variable d'environnement, retiré et absence de trace vérifiée avant commit.

### Extension 03, lot 4 : la landing montre ce qu'elle promet (2026-09-10) — clôt le portage

La carte d'aperçu reflète maintenant l'écran de résultat, dans les mêmes composants en `size="mobile"` : score → bottleneck → piliers → prochaine action. Plus un énoncé du problème en deux lignes au-dessus de la carte, aux deux largeurs.

**Pourquoi la landing reçoit un contrôle de ton et pas la page de résultat.** L'écran de résultat montre exactement deux CTA et un troisième a été refusé (R-23). Cette carte est une démo, et une démo qu'on peut manipuler promet plus fort qu'une ligne de copie disant qu'un mode roast existe. `ToneToggle size="compact"` (32px de piste, 44px de zone tactile — la taille que `Segmented` implémentait déjà) reste visiblement subordonné à « Démarre ton Tour → », qui demeure le seul élément rouge plein de l'écran. Le basculement **échange la phrase de verdict et peint le nom du pilier en rouge, rien d'autre** : le traitement roast complet (bordure rouge, bandeau tamponné) mettrait une carte rouge en relief à côté du CTA principal, et promettrait un vrai résultat roast à partir d'un échantillon.

**La carte fait 448px, pas la largeur que la planche du design supposait.** Mesuré, pas jugé à l'œil : le toggle compact en prend 219, et l'en-tête qui portait « Score growth global — Exemple SaaS B2B » **plus** le toggle repliait la légende sur trois lignes. Corrigé en donnant son eyebrow à `ScoreDisplay`, exactement comme sur la page de résultat — ce qui rapproche encore l'aperçu de ce qu'il prévisualise. La rangée du haut ne garde que ce à côté de quoi le toggle doit se poser. À 390px elle passe quand même à la ligne (310px utiles contre 350 nécessaires) ; `margin-left: auto` garde le toggle contre le bord droit dans les deux cas.

**L'aperçu devient un îlot client, et ne rapatrie rien.** Le toggle a besoin d'un état, donc la carte est un Client Component — sur une page pré-rendue (R-24) dont R2-14 a défendu le budget JS. Toutes ses chaînes arrivent **déjà traduites** en props ; il n'importe ni le dictionnaire, ni `copy-library`, ni la bibliothèque d'actions. Vérifié par mesure, pas par lecture : les 11 chunks réellement demandés par `/en` font **156 Ko gzip** et aucune des quatre sondes de contenu serveur (dictionnaire, glossaire long, verdict, action) n'y apparaît. Non-vacuité prouvée en important volontairement `UI_STRINGS` dans l'îlot : la sonde du dictionnaire passe à `true` **et** la garde statique de `client-bundles.test.ts` tombe.

**Copie nouvelle, à relire** : l'énoncé du problème (`landing.problemClaim` / `problemProof`) et le nom accessible du groupe de segments (`toneSelector.groupLabel`). L'énoncé dit le **problème** ; la ligne `promise` de B1, dans la colonne de gauche, dit ce qu'on en repart avec. Elles sont sur le même écran, donc aucune ne redit l'autre — celle-ci ne mentionne jamais le livrable et s'arrête à pourquoi un diagnostic est nécessaire : quatre étapes qui marchent sont très bonnes pour masquer celle qui ne marche pas. **À l'œil d'Antoine quand même** : « une étape » apparaît des deux côtés de l'écran. `sample.stageLabel` (« Étape 5/5 ») devient morte et part (discipline R-08).

**Vérifié en réel** : `tsc`, `eslint`, 373 tests unitaires, seuils de couverture, `next build`, **167 specs Playwright** (+8, nouveau `e2e/landing-preview.spec.ts`). Captures relues : landing EN desktop, FR mobile, et les deux tons — le rouge du nom de pilier en roast est bien `rgb(210, 64, 44)` (`--paint-red`, texte large, 4,42:1 contre un seuil de 3:1), assert dans la spec plutôt que constaté.

### Deux passes de revue adversariale sur le portage, et six correctifs (2026-09-10)

Une fois l'extension 03 portée (#109, #111, #112, #113), le diff complet est
passé en revue adversariale — cinq lentilles indépendantes, chaque constat
soumis à des sceptiques dont le travail est de le **réfuter**, et un critique
de complétude à la fin. Deux passes : la première a perdu 16 agents sur une
limite de session, la seconde a été relancée sur l'état final, correctifs
compris.

Bilan des deux : **12 constats confirmés, 15 réfutés**. Deux des confirmés
étaient des régressions introduites le jour même, et deux autres portaient
sur des affirmations que j'avais écrites et qui étaient fausses. Ce que ça
dit du procédé mérite d'être noté : la valeur d'une passe adversariale n'est
pas de trouver des bugs exotiques, c'est de contredire ce que l'auteur croit
avoir vérifié.

**1. `rawPoints` repartait dans le payload de chaque résultat partagé**
(#115). Le correctif de la veille (#110) avait posé `toPillarViews` comme
frontière sur le prop `pillars` ; le portage a ajouté **neuf lignes plus bas
dans le même fichier** `bottleneck={resolveBottleneck(submission.pillars)}`.
`resolveBottleneck` est générique : il renvoie les objets qu'on lui donne. Un
type *déclaré* côté composant n'engage rien à l'exécution, et RSC sérialise
l'objet réel.

La garde de #110 ne pouvait pas l'attraper : elle affirmait un prop **nommé**,
et une assertion par prop ne couvre que les props qui existent déjà. Elle
exige maintenant que **tout** usage de `submission.pillars` passe par la
narrowing (commentaires exclus du comptage, puisqu'ils citent la règle). Plus
un test qui épingle la vraie cause : `resolveBottleneck` rend les mêmes
références qu'on lui passe — c'est un résolveur, pas une frontière.

**2. La page se contredisait quand rien ne freine** (#116). `SUMMARY_HEADLINES`
est indexé par le pilier le plus faible et ses 20 lignes affirment toutes
qu'une étape est en retard. Un tableau 20/20/7 sur les cinq piliers (16/20
chacun, 80/100) affichait « RIEN NE TE FREINE » puis, une ligne dessous,
« mais l'acquisition reste à muscler ». Corrigé à la source (`LEVEL_HEADLINE`
substituée dans `buildQuickVerdict`), donc tout consommateur d'un verdict
Quick reçoit la ligne corrigée, pas seulement l'écran où ça se voyait.

**La capture a montré quatre autres formes du même défaut** que la relecture
de code n'avait pas données : bandeau rouge, tampon roast, cartes d'alerte, et
« Là où tu perds du temps » au-dessus de deux phrases de bande forte —
c'est-à-dire des éloges dans des cartes rouges sous un titre alarmant. Plus
`og:description`. Leçon n°1 de ce fichier, encore.

**3. Le texte du partage natif était la cinquième surface** (#119), manquée
par le balayage de #116. Corrigé structurellement : quatre surfaces
construisaient chacune la même phrase et se voient ensemble dans un aperçu de
lien. `lib/submissions/stall-sentence.ts` la construit une fois ; une
cinquième ne peut plus diverger. Un test épingle mot pour mot que la sortie
ne change pas pour un tableau qui a bien un goulot — une refonte de gabarit
déplace une virgule sans qu'on le voie.

**4. L'ordre de lecture mobile, et une borne que j'avais annoncée fausse**
(#117 puis #120). En livrant le lot 2 j'avais mesuré l'écart DOM/visuel **en
ne comptant que les éléments focalisables** et conclu à « une permutation de
voisins ». Au niveau des blocs, la carte de partage était annoncée **cinq
places** avant d'être vue — un lecteur d'écran lit tout, pas seulement ce qui
prend le focus. Elle sort des deux colonnes et se place par sa propre zone de
grille : pire écart 4 → 1.

Puis la revue a montré que **la borne de 1 était fausse pour le
propriétaire**, dont la page rend aussi le dépliant du calcul, qui
s'intercale : écart réel 2. `src/__tests__/result-reading-order.test.ts`
calcule les deux ordres depuis les fichiers réels et épingle le chiffre exact
pour les **quatre** variantes, dont les deux qu'aucun e2e ne peut rendre.
Chiffres exacts et non un plafond : le but est de connaître le coût.

Une correction a été construite et mesurée puis abandonnée : sortir le
dépliant de la colonne ramène tout à 1, mais lui donne sa propre rangée de
grille sous la plus haute des deux colonnes, ce qui ouvre ~230 px de colonne
droite vide sur le desktop de chaque propriétaire. Un trou visible partout
vaut moins qu'un bloc annoncé deux places trop tôt sur un téléphone.

**5. Cinq liens que la souris pouvait suivre et le clavier non** (#120).
`display: contents` sur le `<a>` qui enveloppe chaque bandeau de la carte
d'aperçu (posé par R2-13) : un élément avec ce display ne génère aucune
boîte, et Chromium sort alors l'ancre de la navigation séquentielle. Mesuré
sur le vrai build : **17 tabulations sur `/en`, pas une qui touche un lien de
glossaire**. WCAG 2.1.1 niveau A. `display: flex` fait du lien l'élément flex
à la place du bandeau — même boîte, mêmes cinq rectangles au pixel. La spec
vérifie **en tabulant**, parce que le balisage était correct de bout en bout
et que seul l'ordre de focus montrait le défaut.

**6. Un `s-maxage` que j'avais justifié à tort** (#118). L'image de partage
n'était demandée que par les crawlers ; le lot 2 en a fait une requête par
vue (72 972 octets, ~150 ms de Satori, aucun ETag donc rien à revalider).
`loading="lazy"` règle l'essentiel. J'y avais ajouté un `s-maxage=3600` en
affirmant que `max-age=0` gardait la fraîcheur côté navigateur : **c'est
faux**, `max-age=0, must-revalidate` renvoie le navigateur revalider et un
cache partagé encore frais répond à sa place. Le propriétaire qui vient de
finir son Deep dive verrait l'ancien badge jusqu'à une heure, et cette route
n'étant pas ISR, `revalidateTag` ne peut pas la purger. Retiré ; la façon
correcte (jeton de version dans l'URL, donc reprise à la main de la route de
métadonnées) est écrite dans le composant pour que la prochaine tentative
parte du bon endroit.

**Ce qui a été soumis aux sceptiques et n'a pas survécu**, pour ne pas le
ré-auditer : le ton de la landing qui changerait le verdict sans annonce (le
focus reste sur le contrôle activé, donc c'est annoncé) ; la zone tactile de
`Segmented compact` (géométrie exacte, mais `elementFromPoint` tombe bien sur
le bouton) ; l'image de partage de l'échantillon en anglais pour un lecteur
français (c'est la règle documentée depuis l'étape 8 — un crawler n'envoie
pas les cookies) ; « nextMove révèle quelle réponse l'auteur a ratée » ; et la
taille du bouton de partage sur mobile.

#### Ce que ces passes disent sur la méthode

- **Une garde par prop ne couvre que les props qui existent.** Les deux fuites
  `rawPoints` sont la même erreur à un cran d'écart : la première fois la
  frontière manquait, la seconde fois elle existait mais la garde était
  nominale. Une garde utile compte ce qui traverse, pas ce qu'on a pensé à
  nommer.
- **Mesurer la bonne chose.** « 3 focalisables sur 10 hors ordre » et « la
  carte de partage annoncée cinq blocs trop tôt » décrivent la même page. La
  première mesure m'a rassuré et était la mauvaise.
- **Une capture montre ce qu'une relecture ne montre pas** — quatre des cinq
  formes du défaut « niveau » ne sont apparues qu'à l'écran.
- **Écrire une justification ne la rend pas vraie.** Le commentaire du
  `s-maxage` était confiant et faux ; la sémantique HTTP se vérifie, elle ne
  se raisonne pas de mémoire.

#### Reste ouvert

- **À trancher par Antoine (copie, pas code)** : `SUMMARY_HEADLINES` n'a pas
  d'axe de bande de score. Un tableau à **0/100, cinq piliers à 0/20**
  affiche « 5 ÉTAPES TE FREINENT » puis « Bon moteur global, mais
  l'acquisition reste à muscler » — et en roast « Beau vélo, mais personne ne
  sait encore comment tu recrutes tes coureurs ». Idem à 35/100 (tous les
  piliers à 7/20), qui est un score plausible. Les 20 lignes sont écrites
  pour un tableau moyen ou bon avec **un** point faible. Deux formes
  possibles : un axe de bande (5 piliers × 3 bandes × 2 tons × 2 langues), ou
  une phrase « plancher » plus un prédicat. Non corrigé ici : c'est de la voix
  verdict, que CLAUDE.md réserve à l'agent produit — et j'ai déjà étiré cette
  règle une fois aujourd'hui avec `LEVEL_HEADLINE`.
- **Piste de couverture, pas un défaut** : toutes les assertions e2e sur la
  composition tournent sur `/r/sample`, qui prend une **branche différente**
  pour les deux choses que ces correctifs touchent (`getSampleNextMove` au
  lieu de `resolveNextMove`, `SAMPLE_RESULT.pillars` au lieu de la narrowing).
  La garde statique est donc la seule chose entre une future modification et
  `rawPoints` de retour dans le payload. Un id de fixture derrière une
  variable d'environnement (même schéma que `NEXT_PUBLIC_GOATCOUNTER_CODE:
  e2e-stub`, donc fermé par défaut) ferait passer les specs par le vrai
  chemin. À décider : c'est une porte de test sur la route publique la plus
  sensible.
- **Flake confirmé** : `e2e/locale-routing.spec.ts:75` (« switching language
  carries over to the unprefixed app pages ») a échoué deux fois aujourd'hui,
  toujours dans la suite complète en parallèle, jamais isolée (8/8) ni sur
  deux suites complètes rejouées ensuite. Donc rare et dépendant de la charge.
  **Ne pas la durcir en attendant le cookie** : si le cookie n'est parfois pas
  posé, c'est une course produit qu'une spec durcie masquerait. La config a
  déjà `retries: 1` et `trace: "on-first-retry"` en CI, et le rapport HTML est
  téléversé en cas d'échec — la prochaine occurrence en CI laisse donc une
  trace exploitable. C'est là qu'il faut regarder.

**Vérifié** : `tsc`, `eslint`, **390 tests unitaires**, seuils de couverture,
`next build`, **170 specs Playwright**. Chaque correctif a sa non-vacuité
mesurée finement (quel test tombe, et lesquels ne tombent pas), écrite dans
son fichier de test plutôt que laissée à supposer.

### Le design system part vers Claude Design (2026-09-11)

`/design-sync` convertit `src/components/` en un bundle que Claude Design
consomme, pour que la prochaine passe de design construise avec les vrais
composants au lieu de les redessiner. Projet créé et synchronisé
(`23b9671c-a55b-452e-aa41-39906ee71ba8`, 182 fichiers). Les entrées durables
sont dans `.design-sync/` ; `ds-bundle/` et `dist/` sont générés et gitignorés.

**Ce dépôt est une app, pas un paquet de composants**, et le convertisseur
suppose l'inverse — d'où trois réglages non évidents, tous documentés en détail
dans **`.design-sync/NOTES.md`**, à lire avant toute re-synchro : `--entry` doit
être donné ET ne pas exister (s'il résout, la synthèse depuis `src/` ne tourne
jamais et on obtient un bundle vide) ; `next/link` est shimmé (sans ça les
`process.env.__NEXT_*` font échouer les 35 composants d'un coup) ; les tokens
entrent par le graphe JS, pas par `cssEntry`.

**Les contrats émis décrivaient l'API voulue par le design, pas celle qui est
livrée.** Le convertisseur ne lit que des `.d.ts`, et les seuls du dépôt étaient
les bundles de handoff sous `design/ds-extension-0{1,3}-return/` —
`ScoreDisplay` y portait encore `verdict` (retiré à l'extension 03),
`PriorityMove` n'avait ni `pillar` ni `upgrade`. `cfg.buildCmd` génère
maintenant `dist/types` depuis les vraies sources.

**Puis un second défaut du même trajet, plus subtil, trouvé par la session
locale d'Antoine et pas par moi** : `tsc` recopie les alias `@/…` tels quels
dans les déclarations, et le projet ts-morph du convertisseur n'a aucun mapping
`paths`. Douze contrats référençaient donc des types **jamais définis** —
`sharpness: Sharpness`, `locale: Locale`. Autrement dit l'agent design lisait,
sur le prop qui existe précisément pour empêcher `Bottleneck` de mentir, un nom
sans valeurs. `relativize-dts.mjs` réécrit ces specifiers et entre dans
`buildCmd` : `sharpness: "clear" | "shared" | "level"`, `locale: "en" | "fr"`.
Ma vérification de `dist/types` cherchait les imports `next` et la pollution
`tw` ; je n'ai jamais vérifié que les types référencés **se résolvaient**.

**Polices embarquées, et Inter est un seul fichier.** Un `@import` distant
faisait attendre chaque rendu headless (la passe de vérification passait
d'environ deux minutes à dix-huit estimées). Google sert le sous-ensemble latin
d'Inter en police **variable** et renvoie la même URL pour les quatre graisses —
vérifié contre l'endpoint css2, pas supposé. Déclarée une fois en
`font-weight: 100 900`, ce qui instancie l'axe wght : 237 Ko → 104 Ko. Vérifié
en mesurant le texte rendu dans Chromium, pas en relisant le CSS.

*Piège de vérification à retenir* : les polices sont **toujours** chargées en
mode CORS, et `page.setContent()` donne à la page `origin: null` — un harnais
construit ainsi rapporte trois familles qui retombent sur le même substitut, ce
qui ressemble exactement à des `@font-face` cassés. Le signe : trois
typographies sans rapport qui mesurent la même largeur.

**Six aperçus rendaient parfaitement et affirmaient quelque chose de faux**,
trouvés à la notation des 116 cellules — tous passés par le render check, aucun
visible à la relecture de code. Trois sont la même erreur de ma part : avoir
écrit un nom d'état sans vérifier que le rendu le produisait. `rule` vaut `true`
par défaut, donc la story « NoRule » dessinait un filet ; `total` vaut `20`,
donc « WithTotal » était identique à « Chips » au pixel ; et « OverLimit »
faisait 490 caractères pour une limite de 500, donc n'a jamais montré l'état
rouge qu'il nommait.

**Une septième « correction » a été annulée après vérification** : le lien
anglais dans le disclaimer français n'était pas un oubli — la copie produit est
littéralement « … voir How it works. » et `ResultView` découpait les deux
langues sur ce littéral exact. L'observation de départ était juste pour autant
(le pied de page traduisait la même destination), et Antoine a tranché pour
traduire — voir l'entrée suivante.

**Deux avertissements de validation sont permanents et attendus** : `"Impact"`
(repli système dans `--font-display`, police Microsoft qu'on n'a pas le droit de
redistribuer) et `GRID_OVERFLOW` sur `DefinitionPopover` — un test de
**propriété** (`position: fixed` présent), pas de géométrie ; le `cardMode:
"single"` qu'il suggère masquerait trois histoires sur quatre alors que la
capture montre que l'encadrement tient. Ne pas les « corriger ».

**Reproductibilité prouvée plutôt qu'affirmée** : un clone frais de la branche,
sans rien de l'environnement de session, produit un bundle **identique octet
pour octet**.

*Note d'outillage* : `.design-sync/`, `.ds-sync/`, `ds-bundle/` et `dist/`
rejoignent `design/` dans les ignores d'ESLint. Ce n'est pas du confort :
`no-html-link-for-pages` exigeait `next/link` dans un aperçu qui doit justement
utiliser un `<a>` nu, puisque `next/link` est shimmé hors du bundle. Suivre la
règle aurait cassé le bundle.

### « Comment ça marche » aussi dans le disclaimer français (2026-09-11)

Décision d'Antoine. Le pied de page traduisait cette destination
(`nav-strings.ts`) pendant que la phrase sous le score disait « How it works »
en français — le même lien, deux noms selon l'écran.

Corrigé à la cause : `ResultView` découpait la phrase sur un littéral anglais
**codé en dur**, appliqué aux deux langues, ce qui empêchait mécaniquement la
version française d'avoir son propre libellé. Il découpe maintenant sur
`tc(NAV_STRINGS.howItWorks, locale)` — le libellé du lien et celui du pied de
page sont la même chaîne, ils ne peuvent plus diverger. Vérifié sur un build de
production dans les deux langues, point final bien en dehors du lien.

### C1 : la seule relance qu'un produit sans email peut envoyer (2026-09-11)

Dernier item du plan de `REVIEW-03.md`. Le produit a une raison honnête de
revenir — un score bouge — et rien ne le disait jamais, faute de canal : ni
email ni compte (SPEC.md §5). L'appareil **est** le canal, et la donnée y
dormait depuis R-20 : `tdg.results.v1` garde jusqu'à 20 résultats datés.

`progression.ts#retakeNudge(results, nowMs)` — pur, `nowMs` injecté pour que
les seuils soient testables sans bouger l'horloge. Au-delà de 30 jours, la
landing ajoute une troisième ligne sous le lien de retour : « Ton dernier Tour
date de 5 semaines — le refaire ? ».

**Volontairement pas restreint aux résultats notés**, contrairement à la
lecture de progression juste au-dessus : la question est « c'était quand, la
dernière fois », et une entrée écrite avant R-20 y répond aussi bien qu'une
récente.

**Semaines jusqu'à deux mois, mois au-delà.** « 52 semaines » se lit moins
bien que « 12 mois ». La bascule est à 60 jours, sans trou ni recouvrement
(59 j → 8 semaines, 60 j → 2 mois).

**Trois cas limites tenus par des tests, pas par de la relecture** : une date
dans le futur (horloge d'appareil en avance) ne produit pas « -1 semaines »
mais rien du tout ; une date illisible est ignorée sans passer pour ancienne ;
et c'est le plus récent des résultats **par date** qui compte, quel que soit
l'ordre de stockage.

**Un événement de plus, et il n'est pas décoratif.** `retake_started` (A4) ne
peut pas dire si la relance fonctionne : il compte tous les re-tests, relancés
ou non. `retake_nudge_clicked` sépare les deux, contre `landing_return` comme
dénominateur — c'est exactement ce que A4 avait posé d'avance. Ajouté à la
liste exacte que `goatcounter-api.ts` demande à GoatCounter, sans quoi le
tableau de bord le sous-compterait en silence (R-11).

**Piège évité en écrivant la spec, pas après** : la landing et le quiz vivent
sous deux layouts racine différents (R-24), donc ce lien est un chargement
complet de document et `window.__tdgEvents` a disparu quand le quiz s'affiche.
Même parade que la spec de R2-02 : un premier clic retenu par `preventDefault`
pour lire l'événement dans le document qui l'a émis, un second qui navigue.

**Second piège, dans la spec elle-même** : les dates y sont **relatives** à
l'instant du test, jamais littérales. La spec de progression utilise des dates
fixes — inoffensif pour elle, mais une spec de fraîcheur écrite comme ça
affirmerait le contraire de son intention un mois plus tard, sans que personne
n'y touche.

**Vérifié en réel** : 398 tests unitaires (+8), **176 specs Playwright** (+6),
lint/tsc/build propres, couverture au-dessus des seuils. Non-vacuité mesurée
finement — en neutralisant `retakeNudge`, **exactement les 4 specs qui
affirment la présence tombent** et les 2 qui affirment une absence passent
dans les deux états, ce qui est correct pour des assertions compagnes.
Mesuré plutôt que jugé à l'œil : le pire cas (français, « 7 semaines ») finit
à 370 px sur 390, une seule ligne, aucun débordement dans les quatre
combinaisons testées.

**Copie neuve, donc `TODO: à relire`** (convention 6) : trois chaînes, une
question plutôt qu'un impératif — quelqu'un qui revient sait déjà où est le
bouton.

### `PillarChip stretch` : une régression de portage, pas un défaut d'origine (2026-09-11)

Le défaut traînait dans le tableau des points ouverts depuis le portage de
l'extension 03 : sur desktop, la ligne d'un pilier étalait ses quatre enfants,
donc « 18 … /20 … Acquisition … ? » au lieu de « 18/20 … Acquisition ». Visible
en production, inerte sous 761 px.

**Ce que l'enquête a trouvé et que je n'aurais pas deviné** : la règle n'a
jamais été fausse, c'est le balisage qui a changé sous elle. Le `PillarTag`
d'avant l'étape 13 mettait le score et son dénominateur dans **un seul**
élément et n'avait pas de créneau glossaire — deux éléments flex, pour
lesquels `justify-content: space-between` produisait exactement la forme
voulue. L'étape 13 a réécrit le balisage à la forme du design system (score et
« /20 » séparés, plus `{children}` pour le déclencheur de glossaire), soit
**quatre** éléments, et a recopié la règle telle quelle. `space-between` a
alors divisé l'espace libre en trois écarts au lieu d'un.

Correctif : `justify-content` retiré, une seule marge automatique sur le nom du
pilier (Flexbox §8.1 — les marges auto prennent l'espace libre avant que
`justify-content` ne s'applique). Deux classes (`.stretch .label`) pour battre
la règle de base de façon déterministe ; les deux vivent dans le même module
CSS, donc le piège d'ordre d'émission entre modules (leçon nº2) ne s'applique
pas ici. `padding-left: 6px` conservé comme plancher si la colonne devenait un
jour plus étroite que son contenu — pas atteignable aujourd'hui, les noms de
piliers restant en anglais.

**Le `justify-content` devait être retiré, pas seulement neutralisé** : mesuré,
le garder donne une géométrie identique au pixel (la marge auto prend l'espace
en premier), donc il aurait survécu comme déclaration morte qui ressemble
toujours à la cause — la prochaine personne à déboguer cette ligne serait
retombée dessus.

**Vérifié en réel** : mesure dans le navigateur plutôt qu'à l'œil — écart
score→« /20 » de 87 px avant, 0 après ; l'espace libre passe entre les deux
moitiés. Non-vacuité prouvée en réintroduisant exactement l'ancienne règle :
**seule la nouvelle spec tombe**, les dix autres du fichier passent. Captures
relues en EN et FR desktop, et mobile FR inchangé (la règle est derrière
`@media (min-width: 761px)`).

L'avertissement « ne recopiez pas ça » est retiré de l'aperçu design-sync et de
`.design-sync/NOTES.md` — le design system montre à nouveau la forme voulue.

### La phrase de verdict devient vraie sur tout l'espace des scores (2026-09-11)

Dernier point ouvert de la revue 03, et le seul qui demandait une décision
d'Antoine. Il a répondu « A+D+E, B » — donc tout — **et a ouvert l'écriture de
la voix verdict à la session**, règle inscrite en tête de ce fichier.

**Le défaut.** `SUMMARY_HEADLINES` était indexé par le seul pilier le plus
faible, et ses dix phrases affirmaient toutes que le reste du moteur allait
bien (« Bon moteur global, mais X »). Énuméré sur les **59 049 tableaux
atteignables** : **9,5 % seulement** recevaient une phrase qui ne contredisait
rien d'affiché deux centimètres plus haut. Le pire n'était pas le tableau à
0/100 où l'écran dit « 5 étapes te freinent » puis « bon moteur global » — mais
les **30 %** où le bandeau dit « une étape » et le verdict « bon moteur global »
alors que les quatre autres sont à 5/20 : la carte est cohérente avec
elle-même, et entièrement fausse.

**Trois découvertes que mon propre brief avait manquées**, trouvées parce que
le relecteur a énuméré l'espace avant de lire la copie plutôt que de juger au
goût. Elles valent d'être gardées, parce qu'elles se reproduiront :

1. **Ma règle « ne compte pas » ne marchait que dans un sens.** Le bandeau
   compte le *groupe de goulots*, pas les étapes faibles — et il affiche « une
   étape te freine » sur **43 %** des tableaux « mixed ». Neuf des dix phrases
   « mixed » affirmaient le pluriel : elles contredisaient le bandeau dans
   l'autre direction. La forme juste ne compte jamais, et ne classe pas non
   plus (« la plus basse » est faux dès que le bas est à égalité, ce qui est
   ordinaire).
2. **« Floor » ne veut pas dire « rien ne marche ».** La bande plafonne à
   **65/100** et **54 %** de ses tableaux contiennent un pilier à 13/20.
   « Rien ne tient encore » y est faux une fois sur deux ; « aucune étape n'est
   encore solide » est la définition de la bande, donc vraie partout.
3. **Un score de pilier est l'empreinte de ses trois réponses.** Avec des
   options à 20/7/0, **13/20 = deux questions sur trois répondues pleinement**.
   Donc « personne ne sait d'où sortent tes coureurs » s'affichait au-dessus
   d'`ACQUISITION 13/20` pour quelqu'un qui avait répondu « oui, clairement
   identifié et suivi » deux fois — et le pilier nommé est à 9 ou plus sur
   **43 %** des tableaux « solid ». En « solid » surtout, préférer le relatif
   (cette étape est en retard sur les autres) à l'absolu (rien n'existe).

**La correction de mon propre plan.** L'option B que j'avais proposée disait
« donner un axe de bande de score ». Fausse telle quelle : bander sur le score
du pilier **nommé** ne corrige rien, `[0,0,0,0,0]` et `[0,20,20,20,20]` ayant
tous deux leur plus faible en bande faible. L'axe lit **les autres** piliers —
`boardBand` : `solid` (tous forts), `floor` (aucun fort), `mixed` entre les
deux. Un test dédié épingle cette paire précise, pour que le piège soit
consigné et pas seulement évité.

**Un pilier fort n'est plus nommé comme frein** (le morceau qui était du code
et pas de la copie) : un tableau `13/13/13/13/16` annonçait « 2 étapes te
freinent » alors qu'un des deux était dans la bande que la même carte lit
ensuite sous « Points forts ». 180 tableaux. Le test exhaustif existant
encodait l'ancien contrat et tombait — mis à jour vers le nouveau plutôt
qu'assoupli, avec une assertion de plus.

**Ce qui tient la copie mécaniquement, plutôt que par relecture** : un balayage
qui interdit tout mot de comptage ou de classement dans les 60 chaînes ; une
garde anti-doublon (deux agents avaient écrit indépendamment la même phrase
d'ouverture anglaise) ; et une marche sur les 59 049 tableaux qui vérifie
qu'une phrase « solid » n'est servie que quand tous les autres piliers sont
forts, qu'une phrase « floor » ne l'est que quand aucun ne l'est, et que la
phrase « rien ne te freine » n'est jamais servie en même temps qu'un nom
d'étape. Les comptes de bandes sont épinglés en dur (560 / 41 650 / 16 807 /
32) : si `scoreBand` ou `CLEAR_GAP` bouge, le test le dit avec des chiffres.

**Vérifié en réel** : 408 tests unitaires, non-vacuité mesurée finement — en
forçant `boardBand` à renvoyer toujours « solid », **6 tests tombent et 2
passent**, et les deux qui passent sont exactement ceux qui ne dépendent pas de
la bande.

**Les 60 chaînes repartent au statut « à relire »** (convention 6). La règle
levée autorise à écrire, pas à approuver.

### Un conteneur ajouté pour l'accessibilité avait emporté le rythme des écrans de questions (2026-09-11)

**Ce qu'Antoine a vu** : sur le questionnaire, la carte de question et le premier
bouton de réponse se touchent. Mesuré plutôt que jugé à l'œil : **0 px** entre le
bas de la carte et le haut du bouton — et comme la carte porte `--shadow-card`
(7px 7px 0), son ombre portée tombait *derrière* le bouton au lieu de tomber sur
la page. C'est ce qui rendait le défaut illisible : ça ressemblait à un artefact
de rendu, pas à une marge manquante.

**La cause, et elle n'est pas dans le CSS qu'on soupçonne.** R-19 (2026-09-05) a
enveloppé la carte, les réponses et le pied dans un `role="group"` nommé par le
compteur, pour qu'un lecteur d'écran annonce « Q 3 / 15 » puis la question. Les
trois étaient jusque-là des enfants **directs** de `.main`, dont le `gap: 20px`
les espaçait. Le nouveau conteneur n'avait aucune mise en page à lui : le gap de
`.main` s'est donc appliqué à un enfant unique, et les trois blocs se sont
retrouvés collés. Aucune règle n'a été modifiée ce jour-là — `git show` le
confirme, la feuille de style n'est pas dans le diff du commit. **Ajouter un
conteneur est un changement de mise en page, même quand on l'ajoute pour de la
sémantique.**

**Deux écrans, pas un.** Le Deep dive porte le même `questionRegion`, avec
**cinq** enfants au lieu de trois : la barre de progression, le compteur, la
carte, les réponses et le pied étaient tous collés. Trouvé en cherchant les
autres conteneurs posés par le même commit plutôt qu'en corrigeant seulement
l'écran signalé. Les deux autres que R-19 a touchés (sélecteur de ton, écran
d'erreur) vont bien : le premier focalise un `<h2>` à l'intérieur d'un `.wrap`
qui a déjà sa mise en page, le second est `.detour`, qui a son propre `gap`.

**Le correctif restaure, il ne redécide pas.** `gap: var(--space-8)` — les 20 px
que `.main` fournissait — porté par le conteneur lui-même. La valeur n'est pas un
nouveau choix d'espacement, et c'est écrit dans le fichier pour que personne ne
la « corrige » vers autre chose.

**Vérifié par la mesure** (`e2e/question-rhythm.spec.ts`, 4 specs) : la distance
réelle entre les deux boîtes sur `/quiz` à 1280 et 390 px, sur le Deep dive, et
entre la dernière réponse et le pied — fenêtre serrée des deux côtés (19-21) et
non un plancher, puisqu'un écart qui grandit serait autant un changement qu'un
écart qui disparaît. La spec affirme aussi les 12 px propres à la pile de
réponses (DESIGN-BRIEF.md §05), pour qu'un correctif qui espacerait tout
uniformément soit attrapé lui aussi. Non-vacuité : sans le correctif, **les 4
tombent**, et la valeur reçue est bien `0`.

**Les deux pièges d'outillage déjà documentés ont mordu à nouveau dans la même
heure**, ce qui vaut d'être noté puisque les connaître n'a pas suffi :
`npx playwright test` ne type-vérifie pas les specs — quatre erreurs
`TS2532` sur des accès indexés n'ont été signalées que par `next build`. Et un
build local **sans** `NEXT_PUBLIC_GOATCOUNTER_CODE` a fait échouer 8 specs (7
analytics + le flake connu de `locale-routing.spec.ts:75`) ; reconstruit avec
`e2e-stub` comme le fait la CI, **181 specs vertes, zéro échec**. Ne pas conclure
sur une spec analytics en local sans la variable.

**Détail signalé, non corrigé** (hors périmètre, et préexistant) : `npm run lint`
sort un avertissement sur une directive `eslint-disable` devenue inutile dans
`src/app/[locale]/LastResult.tsx`. Zéro erreur, donc la CI passe.

### Bon à tirer nº3 : les 60 phrases de verdict sont signées, une case corrigée (2026-09-11)

Antoine a passé les **15 cases** du document (5 étapes × 3 bandes, 4 phrases
chacune — neutre et roast, FR et EN). **14 validées sans note.** Une seule
retouche, et elle porte sur quelque chose qu'aucun test ne pouvait attraper.

**`referral/mixed` : le neutre sonnait plus roast que le roast.** Sa note :
« Je trouve que le ton neutre fait plus roast. En fait, je remplacerais le roast
par le neutre et j'adoucirai le neutre. » En regardant les deux lignes côte à
côte, la mécanique est visible : le neutre portait une pique adressée
(« … — et **chez toi**, tout ne tient pas encore », avec le retournement après
tiret qui est une cadence de roast), pendant que le roast faisait presque un
compliment (« Tes clients **peuvent bien relayer** … »). Les deux registres
étaient intervertis.

Appliqué tel qu'il l'a demandé : l'ancienne neutre devient la roast, et une
neutre plus calme est écrite. La nouvelle prend une tournure **propre au
parrainage** plutôt que la formule de la bande : « pas assez solide pour
compenser » servait déjà dans deux des cinq neutres « mixed » (activation,
retention), et une troisième aurait rendu la bande formulaire. Le parrainage a
sa propre logique — il amplifie, il ne compense pas — d'où « pas encore assez
régulier pour **lui donner de la matière** ».

**Un troisième changement qu'il n'avait pas demandé, signalé plutôt que glissé** :
la roast anglaise dit maintenant « not all of **yours** holds yet » et non
« not everything **here** holds yet ». La morsure du français vient de l'adresse
directe (« chez toi ») ; « here » ne la porte pas, donc un déplacement verbatim
aurait mis les deux langues dans deux registres différents dans le même créneau.
La raison est écrite dans le fichier, à côté des chaînes.

**Ce que cette relecture dit de la méthode.** Les gardes mécaniques posées avec
ces 60 chaînes (balayage des 59 049 tableaux, interdiction de compter ou de
classer, garde anti-doublon) vérifient qu'une phrase est **vraie** là où elle
s'affiche. Aucune ne peut vérifier qu'elle est dans le **bon ton** — et c'est
exactement la seule chose que la relecture a trouvée. Le partage du travail est
donc net : la machine tient la vérité, l'œil tient le registre.

**Vérifié en réel** : la bascule a été contrôlée par `buildQuickVerdict` sur deux
vrais tableaux de la case (`20/13/7/2/5`, bandeau « 2 étapes te freinent », et
`13/20/20/9/20`, bandeau « Une étape te freine ») plutôt que sur la constante —
les deux nouvelles lignes tiennent avec le singulier comme avec le pluriel.
408 tests unitaires, lint (0 erreur), `tsc`, `next build` propres. Sonde jetable
supprimée, `git status` vérifié.

*Piège de vérification, encore le même* : ma première passe de sonde a filtré sa
sortie au `grep` et n'a **rien** renvoyé. Refaite en écrivant dans un fichier et
en affichant le tout — la sonde avait bien tourné, c'est le motif qui ne
matchait pas. Une vérification qui ne trouve rien doit d'abord prouver qu'elle a
regardé quelque part (leçon du run nº8, troisième occurrence).

**Marqueur levé** : plus aucun `TODO: à relire` dans `src/`.
