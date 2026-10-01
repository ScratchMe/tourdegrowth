# Journal de Tour de Growth — 3. La deuxième revue

*Volume archivé : les entrées du 2026-09-06 au 2026-09-08. On y trouve la deuxième revue (`REVIEW-02.md`, R2-01 à R2-30), les polices des images OG, les en-têtes de sécurité, le glossaire long, les pages légales, `/metrics` construite fermée, le palier payant de Gemini, Dependabot.*

*Le texte est celui du journal, déplacé tel quel le 2026-10-01 : rien n'y a été réécrit. Un « plus haut » ou un « voir l'entrée du… » peut donc désigner une entrée d'un autre volume. Le volume courant et la table des volumes sont dans [`JOURNAL.md`](../../JOURNAL.md), et `grep -rn "<motif>" JOURNAL.md docs/journal/` cherche partout.*

---

### Deuxième revue technique & fonctionnelle (2026-09-06)

Revue à froid demandée par Antoine, un jour après la clôture de `REVIEW.md`, avec un angle différent : non plus « qu'est-ce qui casse » mais « qu'est-ce qui empêche le site d'être une référence qui valorise le profil ». Les 30 constats, leur preuve `fichier:ligne`, l'ordre par lots et ce qui a été jugé sain sont dans **`REVIEW-02.md`**. Même convention de traitement que la première revue (un PR par item, statut tenu à jour dans le document, entrée ici à chaque livraison).

Ce que cette revue a exécuté réellement plutôt que déduit : toute la toolchain (conforme aux chiffres de référence), une mesure de couverture (95,6 % des fichiers importés, mais `growth-stats.ts` n'est importé par aucun test), Lighthouse sur quatre pages (96-97 / 100 / 96 / 100), des captures des neuf écrans dans les deux langues et deux largeurs, des requêtes HTTP sur la production, et les données Search Console.

Trois faits qui corrigent ou ferment des notes plus haut :
- **Le point « à confirmer après déploiement » de R-24 est confirmé** : `x-vercel-cache: HIT` sur une page glossaire rechargée en production. `NEXT_PUBLIC_SITE_URL` est bien réglé sur `www` (canonical, hreflang et sitemap corrects en production — le repli `https://tourdegrowth.com` de `lib/site.ts` n'est utilisé qu'en local).
- **La définition du K-factor de l'entrée du 2026-08-29 est fausse** : le dénominateur ne compte que les partageurs qui ont déjà converti, donc K ≥ 1 dès qu'il y a un parrainage. Le « K = 2,00 » vérifié ce jour-là illustre le biais, il ne le contredit pas. Voir `REVIEW-02.md` R2-01.
- **Le CTA visiteur de la page de résultat** (« Refaire le Tour » pour quelqu'un qui n'a jamais fait le Tour), noté « à traiter en R-10 » dans l'entrée R-01, n'a pas été traité en R-10. Voir R2-02.

**Piège d'outillage** : Next 16.3 (Turbopack) n'imprime plus les tailles de bundle au build — plus de colonne « First Load JS ». Pour surveiller un budget, mesurer sur disque (`.next/static/chunks`) ou chercher une chaîne connue dans les chunks référencés par une page, ce qui est la méthode qui a révélé que tout `UI_STRINGS` part dans le bundle de chaque page de contenu (R2-14).


---

### Partage et référencement des pages de contenu, et le bug des polices des images OG (2026-09-06, audit du site CV d'Antoine, item « sites liés »)

**Le constat venu de l'audit du CV.** Un partage de `/fr` ou `/en` sur LinkedIn partait sans image et avec le titre anglais du layout racine ; `/fr` portait un `<title>` et une description en anglais ; le JSON-LD `WebApplication` ne déclarait ni auteur ni langue, donc rien ne reliait le produit à la personne qui le signe en bas de page.

**Ce qui a été fait.**
- `src/lib/i18n/meta.ts` — `contentMetadata(locale, path, title, description)` : `<title>`/description dans la langue de la page, le jeu hreflang/canonical (R-13) et le texte Open Graph / Twitter, pour les quatre types de pages de contenu (landing, How it works, glossaire, terme). Les titres et descriptions vivent dans `UI_STRINGS.meta` (`dictionary.ts`), et réutilisent la copie validée quand elle existe (`landing.subtitle`, `HOW_IT_WORKS.intro`).
- `src/app/[locale]/opengraph-image.tsx` — image de partage 1200×630 des pages de contenu, même gabarit que celle du résultat (§03 du brief : bordure ink 2 px, fond stone, ligne de route), avec le titre de l'écran 01 en stencil et son accent rouge, le sous-titre et les cinq piliers. Une image par langue, choisie par le segment `[locale]`. **Next n'hérite pas d'un `opengraph-image` parent** (vérifié sur le build : sans fichier propre, `/fr/glossary` n'avait aucun `og:image`) : `how-it-works/`, `glossary/` et `glossary/[term]/` ré-exportent l'implémentation unique.
- JSON-LD de la landing construit par langue : `description` = sous-titre de la page, `inLanguage`, et `author` = le même nœud `Person` que le site CV (`@id` `https://cv.antoine.berthaud.me/#person`).
- `src/lib/og/` — `fonts.ts` et `tokens.ts` partagés par les deux images (la copie des tokens en constantes hex reste manuelle, voir étape 8).

**Le bug trouvé en route, qui touchait la production.** L'image de résultat — « highest care », le chiffre en stencil *est* l'image — s'affichait en IBM Plex Mono, wordmark et phrase du bas compris, depuis le début. Deux causes empilées :
1. `loadFonts()` construisait le chemin dans un gabarit (`new URL(\`./fonts/${file}\`, import.meta.url)`) ; **Turbopack compile ça en un seul asset statique** (visible dans le chunk : cinq appels, un seul `e.R(id)`), donc les cinq « polices » étaient le même fichier. Corrigé par cinq `new URL("./fonts/<nom>.ttf", import.meta.url)` littéraux — ne jamais les refactorer en boucle.
2. `inter-latin.ttf` était la **police variable** de Google Fonts (`fvar`/`gvar`) ; Satori (opentype.js) la rejette (`Cannot read properties of undefined (reading '257')`) et abandonne la liste entière. Remplacée par les instances statiques Inter 4.1 `Inter-Medium` / `Inter-SemiBold`, sous-ensemble Latin via fonttools (75 Ko chacune).
La vérification visuelle qui aurait dû l'attraper à l'étape 8 a été faite sur un rendu où tout était en mono, et personne n'a comparé au brief. Leçon n°1 de ce fichier, une fois de plus : « le code avait l'air correct ».

**Copie nouvelle, statut « à relire » (convention 6)** : `meta.landingTitle`, `meta.howItWorksTitle`, `meta.glossaryTitle`, `meta.glossaryDescription` (FR), `meta.glossaryTermSuffix`, `meta.shareImageAlt`.

**Vérifié** : `tsc`, `eslint`, 249 tests unitaires, `next build`, e2e Playwright ; HTML pré-rendu de `/fr`, `/en`, `/fr/how-it-works`, `/fr/glossary`, `/fr/glossary/cac` (titre localisé, `og:*`, `twitter:*`, `og:image` avec hash, JSON-LD) ; les trois images (landing FR/EN, résultat échantillon) rendues et regardées, y compris réduites à 320 px (règle « feed-size » : titre, accent rouge et wordmark survivent).

### Le « № » du badge de partage sortait en carré vide, et le test qui l'empêche de revenir (2026-09-06)

**Le constat, sur la production, dix minutes après le merge de la PR #58.** Sur l'image de partage de la landing (`/fr/opengraph-image/fr`), le badge « № 15 questions — 3 min — entrée gratuite » commençait par un rectangle vide : le « № » (U+2116) n'existe pas dans le sous-ensemble Latin d'IBM Plex Mono que sert Google Fonts (229 glyphes), et Satori n'a aucun repli système — un glyphe absent est dessiné vide, sans erreur. Dans le navigateur, le même `bibTag` s'affiche bien : la police web complète a le caractère. Troisième piège des polices OG, ajouté au commentaire de `src/lib/og/fonts.ts`.

**Le correctif.** `ibm-plex-mono-500.ttf` et `-600.ttf` sont désormais découpés avec fonttools depuis les polices **complètes** du paquet npm `@ibm/plex-mono` (1 049 glyphes) : la plage Latin de Google plus U+2116, soit 230 glyphes, ~51 Ko chacune. Les trois autres fichiers ne changent pas.

**Le garde-fou : `src/lib/og/fonts.test.ts`.** Un lecteur de table `cmap` (formats 4 et 12, une soixantaine de lignes, pas de dépendance) et, famille par famille, la liste des chaînes que les deux images dessinent réellement — wordmark, `h1*` et chiffres en Stardos ; sous-titre, phrase du bas et « Et la tienne ? » en Inter ; `bibTag`, piliers, badges, `scoreLabel` et domaine en Plex Mono — vérifiée dans les deux langues, emoji exclus (next/og les dessine avec Twemoji). Ajouter du texte à une image, c'est l'ajouter là aussi. Test de non-vacuité fait : remis sur les anciennes polices, il échoue sur « № » exactement, et sur rien d'autre.

**Vérifié** : les trois images rendues en local avec les nouvelles polices (`№` présent, résultat échantillon inchangé), `tsc`, `eslint`, 255 tests unitaires (+6), puis la production après merge.

### R2-05 + R2-17 : le header des pages de contenu, et ce que l'audit des branches a révélé (2026-09-06)

Première PR du plan de `REVIEW-02.md`. `components/brand/ContentHeader` remplace les trois copies du même header dans `/how-it-works`, `/glossary` et `/glossary/[term]` : les trois modules CSS avaient la règle sans `display: flex`, donc le wordmark et le sélecteur EN|FR se touchaient à gauche sur les 36 pages de contenu, desktop et mobile. Le header ne portait que le wordmark avant R-13 ; le sélecteur y a été ajouté sans adapter le conteneur, et personne n'a relu la capture de ces pages-là après l'extension 01. La spec `e2e/content-header.spec.ts` mesure la géométrie (même ligne, écart réel, sélecteur contre le bord droit de la colonne de lecture) sur les trois types de page et deux largeurs, plutôt que la présence d'une classe. Sur `/how-it-works`, l'eyebrow de chaque carte disait le nom du pilier que le `<h2>` juste dessous répétait ; il dit maintenant le numéro d'étape (`howItWorksPage.stageEyebrowTemplate`, à relire).

**`main` avait bougé sous l'audit.** En dressant la liste des branches (demande d'Antoine), deux PR d'une autre session sont apparues, mergées pendant l'audit : #58 (métadonnées et Open Graph localisés sur les pages de contenu, JSON-LD par langue avec `author`, polices OG déplacées dans `lib/og/`) et #59 (glyphe « № », test de couverture des polices, 255 tests unitaires). R2-06, R2-07 et R2-15 étaient donc en partie déjà traités au moment où le plan a démarré : revérifiés sur le build de `main` (`curl` des balises, image OG en 200) et leur statut corrigé dans `REVIEW-02.md` plutôt que de refaire un travail déjà livré. Leçon : quand un audit dure plus d'une heure, refaire `git fetch` et relire `git log origin/main` avant d'écrire un statut.

**Audit des branches (R2-31)** : onze branches distantes, toutes issues de PR mergées (#1 à #60), aucun travail non repris — vérifié par l'API GitHub (PR par branche) et non d'après les noms. La suppression revient à Antoine ; il a activé la suppression automatique des branches de tête, donc celles de ce plan disparaîtront seules. **Clos le 2026-09-14** : `git ls-remote --heads` ne renvoie plus que `main` et la branche de travail du jour — la suppression automatique a bien tout nettoyé. Constaté depuis GitHub, pas depuis un clone (convention 10).

**Vérifié en réel** : lint, tsc, 255 tests unitaires, `next build`, **86 specs Playwright** (+6), captures du header sur `/en/how-it-works` desktop et `/fr/glossary/cac` mobile.

---

### R2-01 + R2-10 : un K-factor qui peut valoir moins de 1, et le test qui aurait dû exister (2026-09-06)

**Le défaut.** `growth-stats.ts` divisait les soumissions référées par le nombre de résultats **ayant déjà converti au moins une personne** — ce que le tableau de bord appelait « partageurs uniques » et qui n'en est pas : un résultat partagé qui ne convertit personne est invisible pour Firestore, donc jamais compté. Chaque résultat du dénominateur contribuant par construction à au moins une soumission du numérateur, le ratio valait ≥ 1 dès qu'il était défini. Le « K = 2,00 » vérifié le 2026-08-29 (2 référées ÷ 1 parraineur) illustrait le biais, pas la métrique : trois partages dont un seul convertit deux fois, c'est 0,67, pas 2.

**Deux chiffres à la place, tous deux honnêtes.** `kFactor` = soumissions référées ÷ **toutes** les soumissions (la définition standard : nouveaux utilisateurs générés par utilisateur existant, chaque résultat étant un partageur potentiel). Et « conversion par partage » = soumissions référées ÷ événements `share` GoatCounter, calculé dans la page `/admin/stats` à partir de la fenêtre « All-time » déjà chargée — Firestore ne sait pas qui a partagé, seul GoatCounter le sait. L'ancien ratio reste affiché sous son vrai nom (« référées par résultat qui convertit »), parce qu'il dit quelque chose de vrai ; il ne s'appelle simplement plus K-factor.

**Pourquoi personne ne l'avait vu** : `growth-stats.ts` n'était importé par aucun test. La couverture « 95 % » ne portait que sur les fichiers qu'un test importe ; un fichier jamais importé n'apparaissait pas à 0 %, il n'apparaissait pas. `computeGrowthStats` est scindé en `summarizeSubmissions(submissions, now)` (pure, 9 tests dont le jeu de données exact qui donnait 2,00 et donne maintenant 0,40) et un wrapper Firestore. `@vitest/coverage-v8` entre dans le repo avec `coverage.include: src/lib/**` — tout l'arbre, pas seulement ce qui est importé — et des seuils posés juste sous la mesure du jour (lignes 82 %, mesuré 85 %) : un plancher qui fait rougir la CI si un nouveau module reste sans test, pas un objectif. `src/app` est exclu à dessein : les routes et les pages sont couvertes par Playwright contre un vrai build.

**Vérifié en réel** : lint, tsc, 264 tests unitaires (+9), `npx vitest run --coverage` avec seuils, `next build`. Le rendu de `/admin/stats` n'est pas vérifiable ici (Firestore), mais la page ne fait qu'afficher des champs dont le calcul est maintenant testé.

---

### R2-02 : la page de résultat parle enfin au visiteur (2026-09-06)

Deux CTA, toujours — la règle de l'étape 7 tient — mais **les deux du bon lecteur**. Le propriétaire garde sa paire (« Partager mon score » + « Refaire le Tour », ou le retour au neutre en roast). Un visiteur — quelqu'un qui vient d'ouvrir un lien partagé, le numérateur du K-factor — recevait jusqu'ici exactement cette paire : partager le score de quelqu'un d'autre en primaire, et « Refaire » un Tour qu'il n'avait jamais fait. Il a maintenant « Fais ton propre Tour → » en primaire (avec le `?ref=`, c'est la boucle de SPEC.md §7), une ligne au-dessus qui dit ce que c'est (« Ton propre score en 3 minutes — 15 questions, gratuit, sans compte »), et le partage en secondaire, reformulé « Partager ce résultat ». Trois chaînes nouvelles, marquées à relire.

- **Le premier rendu est la version visiteur**, par construction : `isOwner` n'est connu qu'après montage (R-01), et sur une page atteinte surtout par un lien partagé, c'est le bon défaut — le propriétaire voit ses libellés apparaître un instant après, pas l'inverse.
- **Le lien du propriétaire ne porte plus jamais le ref**, c'était déjà l'intention de R-03 ; la garde de soumission côté client reste en place derrière.
- **Un événement de plus, `take_own_tour`** : le clic que cette page existe pour produire n'était mesuré nulle part. Ajouté au vocabulaire, à la liste exacte que `goatcounter-api.ts` demande à GoatCounter (sinon le tableau de bord le sous-compterait en silence — R-11), et affiché dans la vue de déperdition de `/admin/stats` en pourcentage des partages.
- En roast, un visiteur perd le bouton « Repasser en neutre » : le ton est le choix de l'auteur, et l'assurance « ce n'est pas irréversible » que ce bouton donne (étape 7) ne concerne que lui.

**Limite de vérification, dite plutôt que contournée** : `/r/sample` ne porte pas d'id, donc il est toujours la version visiteur — ce qui est aussi ce qu'une page d'exemple doit être. La spec `e2e/visitor-cta.spec.ts` (3 specs) couvre cette moitié, événement compris (la navigation est retenue un instant par un `preventDefault` posé côté test pour lire l'événement dans le document qui l'a émis). La version propriétaire a été vérifiée en navigateur avec un patch **local et jamais committé** donnant un id à l'échantillon et un jeton semé, même méthode que R-12 ; patch retiré et absence de trace vérifiée avant commit.

**Vérifié en réel** : lint, tsc, 264 tests, `next build`, **89 specs Playwright** (+3), captures visiteur EN desktop / FR mobile et propriétaire EN.

---

### R2-18 : les en-têtes de sécurité que l'app ne posait pas (2026-09-06)

Jusqu'ici la seule protection d'en-tête en production était le HSTS que Vercel ajoute lui-même. `next.config.mjs` pose maintenant, sur toutes les routes : `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, un `Permissions-Policy` minimal, et `Content-Security-Policy: frame-ancestors 'none'` doublé de `X-Frame-Options: DENY` — `/r/<id>`, page publique avec de vraies actions, pouvait être embarquée dans une iframe par n'importe quel site.

Deux absences volontaires, écrites dans le fichier pour qu'on ne les « corrige » pas : pas de CSP `script-src` (elle exigerait un nonce par requête dans le proxy, donc re-dynamiserait les 36 pages de contenu et déferait R-24 — décision séparée, à commencer en Report-Only), et pas de HSTS en doublon de Vercel (`includeSubDomains` serait un engagement sur des sous-domaines dont personne n'a décidé). Et une valeur à ne jamais durcir : `Referrer-Policy` reste à `strict-origin-when-cross-origin`, jamais `no-referrer`, sinon les liens vers le CV (volontairement `noopener` sans `noreferrer`) perdraient leur attribution — ce que la suppression de `noreferrer` du 2026-09-05 existait précisément pour éviter.

`e2e/security-headers.spec.ts` lit les en-têtes réellement servis sur une page statique, une page dynamique, le questionnaire et une route API, et vérifie explicitement que la politique de referrer n'est pas `no-referrer`.

**Vérifié en réel** : `curl -I` sur le build, lint, tsc, 264 tests, `next build`, 93 specs Playwright (+4).

---

### R2-19 + R2-23 + R2-25 : le chemin de lecture d'un résultat, et ce qui se passe quand il casse (2026-09-06)

**R2-19, trois choses sur le chemin `/r/<id>`.** (1) Un id qui ne peut pas être l'un des nôtres (les ids sont des UUID v4) est un 404 **avant** toute lecture Firestore — `page.tsx`, `generateMetadata` et l'image OG appellent tous `isValidSubmissionId`, la même garde que le `?ref=` a depuis R-03 ; chaque id distinct étant un miss de cache et donc une lecture facturée, c'était le trou le moins cher à fermer. (2) Les cinq fichiers de police des images OG étaient relus **à chaque rendu** ; `loadOgFonts` mémoïse maintenant la promesse au niveau du module, sans mettre en cache un échec. (3) Un budget de lecture sur `/r/` dans le proxy (120 requêtes par 10 minutes et par IP, `/r/sample` exclu), avec le même limiteur en mémoire que R-15 et la même franchise sur ce qu'il arrête. Les chiffres sont volontairement larges : les dépliants de liens de LinkedIn, X et Slack viennent d'un petit nombre d'IP partagées et chargent la page **et** son image à chaque partage — un budget assez serré pour ressembler à une protection renverrait des 429 au crawler dont la boucle de croissance dépend.

**R2-23, une page d'erreur qui ressemble au produit.** `components/brand/ErrorScreen` (le ton `fault` de `DetourCard`, la copie de l'écran d'erreur du quiz, donc rien de nouveau à relire, le `digest` de Next en petit sous la carte), monté par `(app)/error.tsx` et `[locale]/error.tsx`, plus un `global-error.tsx` minimal pour le cas où un layout racine lui-même échoue.

**Une limite du framework, mesurée et acceptée plutôt que contournée.** Quand la panne survient dans le **shell initial** d'une page (ici : `loadSubmission` qui lève au premier `await` de `/r/<id>`), Next ne rend pas la frontière d'erreur côté serveur : il sert son document minimal (`<html id="__next_error__">`, statut 500, corps vide) et la frontière est rendue **côté client** après hydratation — `curl` voit le document nu, un lecteur avec JavaScript voit notre écran en une fraction de seconde. Un `notFound()` au même endroit, lui, est rendu côté serveur : c'est un cas que Next traite spécialement. Obtenir un rendu serveur de l'écran de panne demanderait de déplacer la lecture derrière un `<Suspense>` pour que le shell parte avant, ce qui change le chargement de **toutes** les pages de résultat — pas le sujet de cet item. Deuxième découverte du même ordre : une erreur levée dans `generateMetadata` contourne complètement `error.tsx` ; la lecture y est donc enveloppée, et c'est le composant de page, qui voit le même rejet via `cache()`, qui lève dans la frontière.

**R2-25.** La spec OG « lien mort » utilise maintenant un id refusé avant toute lecture (404 déterministe partout) ; la ligne « Firebase Admin credentials are missing » du stderr ne vient plus que de la spec de page d'erreur, qui le dit dans son commentaire. `Internal: NoFallbackError` reste : c'est Next.

**Vérifié en réel** : lint, tsc, 268 tests unitaires (+4 sur le budget de lecture du proxy), `next build`, 95 specs Playwright (+2), et le HTML réellement servi relu au `curl` pour établir la limite ci-dessus au lieu de la supposer.

---

### R2-20 + R2-24 : ne plus garder ce qu'on ne relit pas, et quatre petites dettes (2026-09-06)

**Le texte libre n'est plus stocké.** `DeepDiveResult.freeContext` — un fondateur décrivant son entreprise dans ses mots — était conservé indéfiniment, et la seule chose qui le relisait était un `if (freeContext)` dans le tableau de bord. Il devient `freeContextProvided: boolean` ; `contextAnswers` (les dix réponses de contexte résolues en libellés) n'est plus écrit non plus, rien ne le relisait. Les deux restent dans le type en optionnels « legacy » pour que les documents antérieurs se lisent, et `growth-stats.ts` retombe sur la truthiness de l'ancien texte quand le booléen manque — testé avec un document de chaque génération. Le texte part toujours dans le prompt Gemini, délimité comme donnée (`FREE_CONTEXT_INSTRUCTION`) ; la troncature à 500 caractères se vérifie maintenant sur le prompt, puisqu'il n'y a plus de champ stocké à mesurer. **Correction du constat en le livrant** : `modelUsed` est bien relu — par la sonde de production, qui rapporte quel modèle a répondu — donc il reste écrit ; c'est de l'observabilité, pas une donnée sur quelqu'un.

**Quatre dettes courtes.** `rawPoints` sort du payload public de `/r/<id>` : `ScoreBreakdown` recalcule le numérateur à partir des réponses du propriétaire et des points de chaque option, qu'il avait déjà — le champ était redondant, et avec des options à 20/7/0 chaque somme atteignable trahissait exactement le multiset de réponses. Le corps d'erreur de l'API Gemini est tronqué à 300 caractères avant d'être journalisé (Google peut y faire écho à la requête, qui contient le texte libre). `.github/dependabot.yml` (npm et actions, mensuel, groupé, Playwright ignoré à cause de l'épinglage de R-07). Et les deux actions de `verify-live.yml` — le seul workflow qui tient les secrets Firebase et Gemini — sont épinglées par SHA de commit, résolu avec `git ls-remote` sur les dépôts d'actions plutôt que recopié.

**Vérifié en réel** : lint, tsc, 268 tests, `next build`, 95 specs Playwright. Le nouveau champ ne peut se voir en base qu'après déploiement : le prochain run de « Verify against live services » écrit un vrai Deep dive, et la sonde vérifie déjà que ni `freeContext` ni `contextAnswers` n'apparaissent dans la page.

---

### R2-21 + R2-22 : l'écriture du Deep dive ne s'écrase plus, et le mot de passe admin se compare correctement (2026-09-06)

**R2-21.** La route Deep dive testait « déjà complété ? » avant de générer, puis écrivait sans condition : deux requêtes passant le test avant que l'une écrive (un rechargement pendant les ~70 s de génération suivi d'un renvoi, ou le bouton Réessayer) généraient toutes les deux, et la dernière écriture gagnait en silence. `saveDeepDive` est maintenant un check-and-set dans une transaction Firestore et renvoie `"saved"` ou `"already-present"` ; la route envoie le perdant vers la même page de résultat, sans invalider le cache (le gagnant l'a fait). **Ce que ça ne règle pas, dit clairement** : la double *génération* — les huit appels Gemini au lieu de quatre — reste possible, parce que l'empêcher demanderait un marqueur de réservation posé avant de générer, avec une fenêtre d'expiration pour qu'une génération plantée ne verrouille pas le résultat pour toujours. Borné par la limite de 5 Deep dive par heure, c'est une question de quota, pas d'intégrité ; la transaction seule est le bon niveau d'ingénierie tant que la dépense Gemini n'est pas un sujet. Testé au niveau de `getDb` bouchonné (`repository.test.ts`, premier test de ce fichier) : écrit quand rien n'existe, refuse et le dit quand un Deep dive est déjà là.

**R2-22.** Deux défauts dans `isAuthorizedForAdmin`. `atob` décode en Latin-1 alors qu'un navigateur envoie les identifiants en UTF-8 : un mot de passe avec un accent ne pouvait jamais correspondre — le test le prouve avec « clé-d'été-très-sûre ». Et la comparaison `===` s'arrêtait au premier caractère différent, un canal temporel sur un secret ; pas exploitable en pratique à travers le jitter d'un edge, mais le repo faisait déjà ça correctement pour le jeton de propriétaire, et l'incohérence est le genre qui se copie. `constantTimeEqual` compare octet par octet sans court-circuit, sans `node:crypto` (le proxy ne doit pas dépendre de Node) ; seule la longueur peut fuir, comme pour `timingSafeEqual`.

**Vérifié en réel** : lint, tsc, 273 tests (+5), `next build`, 95 specs Playwright.

---

### R2-09 : dire qu'on va attendre une minute (2026-09-06)

Un Deep dive réel prend environ 70 s (quatre générations en parallèle depuis le bilingue), et rien ne le disait : le bouton « Obtenir mon diagnostic → » menait dans cette minute sans prévenir, et les trois messages de l'écran de chargement avaient été écrits pour une attente de 2-3 s. Deux lignes, toutes deux à relire : `deepDive.waitNotice` sous le bouton du dernier écran, **avant** que l'attente commence (« Environ une minute — on rédige tes recommandations dans les deux tons et les deux langues »), et `loading.stillWorkingHint` sous les segments de l'écran de chargement, uniquement une fois les trois messages écoulés (« Environ une minute en tout — rien n'est bloqué »). Pas un quatrième message : les trois segments sont le design ; une ligne en dessous. Les points de suspension animés disaient déjà que c'était vivant ; ceci dit que c'est **attendu**.

`e2e/deep-dive-wait.spec.ts` (2 specs) : l'avertissement est là avant de soumettre ; avec une génération simulée à 9 s, l'indication n'apparaît pas pendant les trois messages et apparaît après, puis le parcours se termine bien sur la page de résultat. La question de fond — faut-il quatre générations — reste celle notée dans l'état du projet ; ceci rend l'attente honnête sans la trancher.

**Vérifié en réel** : lint, tsc, 273 tests, `next build`, 97 specs Playwright (+2), captures des deux écrans.

---

### R2-08 : ce que Google doit voir de `/quiz`, de `/deep-dive` et du sitemap (2026-09-06)

Les deux pages applicatives sont des Client Components et ne peuvent pas exporter de métadonnées : un `layout.tsx` de passage le fait pour chacune. **`/quiz` reste indexable, avec un vrai titre et une vraie description** (`meta.quizTitle`/`quizDescription`, à relire, résolus dans la langue du lecteur via l'en-tête du proxy) — c'est la page la plus liée du site et « growth quiz » est une requête légitime pour elle ; jusqu'ici elle héritait du titre racine et concurrençait la landing sous le même nom. **`/deep-dive/[id]` passe en `noindex, follow`** : une URL par résultat, atteignable depuis chaque `/r/<id>`, identique pour quiconque n'en est pas le propriétaire — un stock illimité de pages minces. Jamais de `Disallow` dans `robots.txt`, même raison que pour `/r/`.

**Sitemap.** `lastmod` était le seul champ absent et c'est le seul que Google lit ; `changefreq` et `priority` étaient là et sont ignorés depuis des années. Les dates viennent de `content/updated-at.ts`, **tenu à la main** : un `new Date()` au build prétendrait que tout change à chaque déploiement, ce qui est exactement ce qui fait qu'un crawler cesse de croire le champ. À mettre à jour quand les mots d'une page changent, pas son chrome. Les termes du glossaire peuvent porter leur propre `updatedAt` (R2-11 s'en servira) et retombent sinon sur la date d'approbation de la copie longue. `x-default` rejoint les alternates du sitemap pour dire la même chose que le `<head>`.

**Reliquat de R2-06.** Les longueurs relevées à l'audit (179 caractères) comptaient les entités HTML ; mesurées sur la source, seules deux descriptions sortaient de la fenêtre 70-160 : `acquisition` en anglais (55) et `viral-coefficient` en français (164). Plutôt que trente nouvelles chaînes, `GlossaryEntry` gagne un `metaDescription` **optionnel**, posé sur ces deux termes seulement ; un test vérifie que toutes les descriptions effectives sont dans la fenêtre **et** qu'aucun override ne double une définition qui tenait déjà — pour que le champ ne devienne pas l'endroit où l'on réécrit la copie approuvée par habitude.

**Vérifié en réel** : lint, tsc, 278 tests (+5), `next build`, 97 specs Playwright, et par `curl` sur le build : titre et description de `/quiz` en FR et en EN, `robots` de `/deep-dive/sample`, `lastmod` et `x-default` dans le XML.

---

### R2-14 : ce que le navigateur télécharge pour rien, et les trois chemins par lesquels ça revenait (2026-09-06)

Le constat disait deux choses : `SiteFooter` était `"use client"` pour un seul `onClick` et embarquait tout `UI_STRINGS` dans le chunk de chaque page indexable ; `GlossaryTerm` importait `content/glossary.ts` entier, `extended` compris, sur `/quiz` et `/r/<id>`. Les deux sont corrigés — le pied de page redevient un Server Component avec un îlot `TrackedLink` de dix lignes, et le glossaire est scindé en `content/glossary-terms.ts` (terme + définition, la seule partie que le popover affiche) et `content/glossary.ts` (qui spreade la première et ajoute le long) — **mais la mesure après coup a montré que le dictionnaire était toujours là**, et par trois chemins que la lecture du code n'avait pas vus :

1. **`tc()` vivait dans `dictionary.ts`.** Tout Client Component qui importait la fonction pour traduire une prop reçue — le déclencheur de glossaire, le texte des questions — importait le module entier, `UI_STRINGS` compris. `tc` et `Translatable` sont maintenant dans `lib/i18n/translatable.ts` ; le dictionnaire les réexporte, rien côté serveur n'a changé.
2. **L'écran d'erreur de R2-23, livré une heure plus tôt.** `error.tsx` est un Client Component présent dans le bundle de **chaque** route de son arbre, et `ErrorScreen` importait `UI_STRINGS` pour quatre chaînes. Les quatre sont dans `lib/i18n/error-screen-strings.ts`, que le dictionnaire spreade dans `quiz` pour que le questionnaire les lise sous leurs noms habituels.
3. **Le pied de page dans l'écran d'erreur.** Un Server Component importé **par** un Client Component devient client : `SiteFooter` sans directive ne suffisait pas, il fallait aussi qu'il n'importe plus le dictionnaire pour ses deux libellés de nav — `lib/i18n/nav-strings.ts`.

**Mesuré, pas supposé** : les chunks réellement référencés par le HTML servi ont été lus et fouillés avant et après. Avant : « Drafting your race report », « dead last » et « Roast Mode » dans les chunks de `/en/glossary/cac` ; le texte long du glossaire (« 7 amis en 10 jours ») dans ceux de `/quiz`. Après : tous absents ; ~185 Ko gzip de JavaScript par page de contenu, ~199 sur `/quiz`, le plancher React + App Router. `src/__tests__/client-bundles.test.ts` transforme la leçon en garde statique : aucun Client Component hors des trois écrans qui en ont besoin n'importe le dictionnaire, rien sous `components/` n'importe `content/glossary`, et le pied de page comme l'écran d'erreur n'importent ni l'un ni l'autre. Le probe « Dave McClure » utilisé au départ était mauvais — il figure aussi dans la définition courte d'AARRR ; « 7 amis en 10 jours » ne figure que dans le long.

**Vérifié en réel** : lint, tsc, 282 tests (+4), `next build`, 97 specs Playwright, chunks fouillés.

---

### R2-13 + R2-12 + R2-16 : lier le glossaire depuis les pages qui comptent, nommer le cadre, titrer en français (2026-09-06)

**Maillage (R2-13).** Le glossaire n'était lié que par l'index, le pied de page et ses propres `related`. Quatre liens ajoutés là où l'autorité et le trafic sont : les cinq `<h2>` de pilier de `/how-it-works` (les ids de pilier **sont** les ids de terme, aucune table de correspondance) ; les cinq chips de la carte d'aperçu de la landing, enveloppées dans un lien en `display: contents` pour ne rien changer au rendu ; un « En savoir plus → » dans le popover de définition — le cul-de-sac le plus fréquenté du site, sur `/quiz` et sur `/r/<id>` (qui est `noindex, follow`, donc c'est aussi le seul lien que chaque résultat partagé transmet au glossaire) ; et `aarrr`, le terme de tête du sujet et jusqu'ici le moins lié, ajouté aux `related` des cinq piliers — la borne du test passe de 3 à 4, décision écrite dans le test. Nuance honnête sur le popover : un crawler ne lit son balisage que s'il est ouvert, donc ce lien-là sert d'abord le lecteur.

**« AARRR » nommé (R2-12).** Le mot n'apparaissait dans aucun texte visible de la landing ni de `/how-it-works`, alors que la meta description de cette dernière promettait « The AARRR framework explained ». Un mot inséré dans le sous-titre de la landing et dans l'intro de `/how-it-works` — deux chaînes approuvées retouchées, donc marquées à relire.

**Titres FR (R2-16).** « coût d'acquisition client » est la requête française de tête et n'apparaissait ni dans le H1 ni dans le titre de `/fr/glossary/cac`. `term.fr` devient « CAC — Coût d'Acquisition Client », « LTV — Lifetime Value », « North Star Metric — métrique phare » (à relire) ; « Moment « aha » » prend enfin ses guillemets français. Ces termes sont aussi les titres des popovers : c'est voulu, le popover gagne à dire le nom complet. **Pas fait, et dit pourquoi** : pointer `x-default` sur le chemin non préfixé, qui répond par une 308 — Google demande que toute URL d'un jeu `hreflang` réponde 200 ; `x-default` reste sur `/en`, une vraie page. Les slugs FR ne bougent pas non plus (coût élevé, gain faible, et une URL publiée ne meurt jamais ici).

**Vérifié en réel** : lint, tsc, 283 tests (+1), `next build`, **101 specs Playwright** (+4 : les cinq liens de `/how-it-works`, les cinq chips de la landing en FR, le lien du popover sur `/r/sample`, le lien AARRR d'une page de pilier), captures relues (popover EN desktop et FR mobile sur le quiz, index FR mobile avec les nouveaux titres, survol d'un titre lié sur `/how-it-works`).

---

### R2-15 : le glossaire dit enfin ce qu'il est aux moteurs (2026-09-06)

La PR #58 (autre session) avait localisé le bloc `WebApplication` de la landing et lui avait donné un `author`. Restait le reste : `lib/seo/jsonld.tsx` regroupe maintenant tout le structured data du site — `webApplicationSchema` (déplacé de la landing ; `url` devient l'adresse de la page elle-même et non le site nu, `priceCurrency` passe en EUR), `definedTermSetSchema` sur l'index du glossaire (les quinze termes comme un seul vocabulaire, avec leur auteur), `definedTermSchema` sur chaque page de terme (rattaché au set par `@id`, avec la définition courte), et `breadcrumbSchema` sur les quatre types de page de contenu — le fil d'Ariane était rendu visuellement (« ← Glossaire ») et jamais déclaré. `JsonLd` rend le bloc en échappant `<`, ceinture et bretelles sur du contenu pourtant entièrement rédigé par nous. Module **serveur seulement** : il importe le glossaire long, et le test statique de R2-14 empêche qu'un Client Component l'importe un jour. `aggregateRating` reste absent, comme l'addendum 02 le demande tant qu'il n'y a pas de volume.

**Vérifié en réel** : 4 tests unitaires sur les formes émises, lint, tsc, 287 tests, `next build`, 104 specs Playwright (+3 : les blocs présents et bien typés sur la landing, l'index et une page de terme, lus dans le HTML servi), et le Rich Results Test de Google **reste à passer sur la production** — il ne peut pas tourner sur un build local.

---

### R2-04 : une page qui dit qui a fait ça, et comment le score est calculé — publiquement (2026-09-06)

`/[locale]/about`, prérendue comme les autres pages de contenu, même feuille de style que `/how-it-works` (les deux sont une seule famille de pages de prose). Six sections : qui a construit l'outil et pourquoi ; pourquoi ces quinze questions — **rendues depuis `copy-library.ts`**, groupées par étape, pas de seconde copie qui dériverait ; la règle de calcul exacte, en cinq points, avec un exemple chiffré ; où il y a de l'IA et où il n'y en a pas ; construit en public, avec le lien vers le dépôt ; me contacter (LinkedIn et CV, deux nouveaux emplacements `profile_click/about_*`, ajoutés **en fin** de liste parce que `ResultView` et le pied de page lisent les leurs par position). JSON-LD `AboutPage` dont `mainEntity` est le nœud `Person` déjà utilisé partout, avec le titre de poste ; fil d'Ariane ; lien « À propos » dans le pied de page ; `/about` non préfixé redirige comme les autres ; sitemap à 38 URL.

**Toute la copie de `content/about.ts` est un premier jet écrit à la première personne, dans la voix d'Antoine, par la session de code** — pas une copie livrée par l'agent produit. Les faits viennent d'`antoine-credit.ts` (dix ans, AB Tasty, SNCF Connect & Tech) ; l'arithmétique est celle de `lib/scoring/score.ts` et **un test l'épingle** : l'exemple « 20 + 7 + 7 = 34, 34 ÷ 3 = 11,33, arrondi à 11 » est recalculé par `computeScore`, et les trois valeurs de points nommées dans le texte sont celles des options. La voix, elle, est la sienne à approuver — marqué en tête du fichier.

**Vérifié en réel** : lint, tsc, 289 tests (+2), `next build` (`/en/about` et `/fr/about` en `●`), 108 specs Playwright (+4 : les deux langues avec les quinze questions et les liens de contact, la redirection de l'adresse non préfixée, le JSON-LD), captures EN desktop et FR mobile sans débordement.

### R2-03 : les deux pages légales, livrées bloquées exprès (2026-09-06)

`/[locale]/privacy` et `/[locale]/terms`, sur le modèle de Ramille (`ScratchMe/TraceVerte`) : le contenu est **de la donnée** (`src/content/legal.ts`, types `LegalDocument` → sections → blocs paragraphe/puces/définitions), rendu par un seul composant (`components/brand/LegalPage`) dans le cadre de `/how-it-works` — une page légale se relit et s'amende paragraphe par paragraphe, personne ne doit traverser du balisage pour ça. Régime de l'article 6 III-2 de la LCEN (édition non professionnelle) : nom de l'éditeur, e-mail, hébergeur avec adresse — ni adresse postale, ni téléphone, ni statut. Même règle d'écriture que Ramille, tenue : **chaque phrase est vérifiable dans le code** (clés de `lib/quiz/storage.ts`, champs de `lib/submissions/types.ts` après R2-20, hachage du jeton de R-01, first-touch de R-03, limite de débit en mémoire de R-15, règles Firestore en deny-all de R-17, GoatCounter sans cookie). Liens dans le pied de page partout, `/privacy` et `/terms` non préfixés redirigés, sitemap à 42 URL, fil d'Ariane JSON-LD, page ajoutée à la passe axe.

**La PR est rouge exprès, et le restera tant qu'Antoine n'a pas renseigné l'adresse.** `CONTACT_EMAIL` est vide dans `legal.ts` ; le `{email}` de la copie devient un lien `mailto:` au rendu, et un test unitaire (`legal.test.ts`, « the guard that keeps R2-03 a draft ») plus les quatre specs E2E qui exigent ce lien échouent tant que la constante est vide. Une politique de confidentialité qui renvoie vers une adresse qui n'existe pas est pire que pas de politique (RGPD art. 12 : un mois pour répondre, et la personne croit avoir écrit). Deux autres constantes (`FIRESTORE_REGION`, `GEMINI_TIER`) précisent la notice quand elles sont connues et restent vraies à « unknown ».

**Une phrase du correctif proposé dans `REVIEW-02.md` était fausse, corrigée avant d'être écrite.** La ligne sous le champ de contexte libre devait dire que le texte « n'apparaît jamais sur la page partagée » — or le premier run de la sonde de production (2026-09-05) a établi que Gemini reprend ce contexte dans les recommandations, qui s'affichent sur la page. La ligne dit donc : envoyé à Gemini, pas conservé, et il peut façonner le texte affiché ; lien vers la politique en nouvel onglet (la personne est au milieu d'un formulaire). Les conditions le redisent dans « Ta page de résultat ».

**Vérifié en réel**, en deux temps parce que la constante vide bloque le chemin heureux : (1) avec une adresse factice **locale, jamais committée** (`grep` d'absence avant commit) — lint, tsc, 301 tests, `next build` (les quatre pages en `●`), les 36 specs des fichiers touchés vertes, captures EN desktop, FR mobile et l'écran de contexte libre FR relues ; (2) constante remise à vide, rebuild — **exactement** les quatre assertions `mailto:` et le seul test de garde tombent, rien d'autre. Le premier passage a aussi trouvé un débordement : « Politique de confidentialité » à la taille hero de 62 px fait 416 px pour une colonne de 342 — le titre passe à `--display-hero-mobile` sous 760 px, en sélecteur à deux classes (leçon n°2). À noter : `/how-it-works` et `/about` gardent leur H1 à 62 px sur mobile, leurs titres tiennent ; à revoir si un titre plus long y apparaît un jour.

### R2-11, lot 1 : les pages de glossaire pèsent enfin ce qu'une page qui range pèse (2026-09-06)

Le glossaire anglais entier faisait 1 402 mots — à peu près une seule page « CAC » chez ceux qui rangent — et Search Console le confirmait : indexé, sur les bonnes requêtes, en position 70-95. Premier lot : `cac`, `ltv`, `churn`, les trois termes les plus recherchés commercialement.

**La structure, pas seulement du volume.** `content/glossary-deep.ts` (nouveau, serveur seulement — le garde de R2-14 couvre maintenant `glossary(-deep)?`) : pour chaque terme, la formule écrite puis expliquée terme à terme, un exemple chiffré en étapes avec sa conclusion, des ordres de grandeur **toujours avec leur réserve** (jamais un chiffre présenté comme « le » benchmark), trois à cinq leviers, et une FAQ de vraies requêtes (« CAC ou CPA ? », « comment convertir un churn mensuel en annuel ? »). `definition` n'est pas touchée : elle alimente le popover. Un terme sans `deep` garde sa page courte — le rendu est conditionnel, pas une deuxième page.

**L'angle que personne d'autre n'a : « Dans le Tour ».** Chaque terme cite **la question du questionnaire qui le mesure**, ses trois réponses et leurs points — rendus depuis `copy-library.ts` par `questionId`, donc la page ne peut pas déformer le questionnaire — puis explique dans quelle bande de score ça vous met. C'est la seule chose qu'un glossaire adossé à un outil qui marche peut dire, et c'est aussi le pont naturel vers `/quiz`.

**Les faits sont les faits couramment cités, avec leur formulation prudente** : le ratio LTV:CAC de 3:1 « que citent la plupart des investisseurs SaaS », le CAC payback sous 12 mois en PME et 18-24 en entreprise « couramment cités », la composition du churn mensuel (3 %/mois = 31 %/an, pas 36 %), le plafonnement de la durée de vie à 3-5 ans « chez la plupart des praticiens ». Les exemples chiffrés se répondent d'une page à l'autre (le CAC de 500 € de la page CAC est réutilisé par la page LTV). Aucune statistique inventée, aucune source nommée qu'on ne pourrait pas défendre.

**Pas de `FAQPage` en JSON-LD**, volontairement : depuis août 2023 Google ne montre plus ce résultat enrichi qu'aux sites gouvernementaux et de santé ; le balisage n'apporterait rien et la FAQ en prose cible déjà les requêtes de longue traîne.

**Copie : premier jet de la session de code, à relire ligne à ligne** — c'est de la copie de fond qui porte le nom d'Antoine, même statut que les `extended` du 2026-08-29 avant leur validation. Marqué en tête du fichier et sur les libellés de section dans `dictionary.ts`.

**Vérifié en réel** : lint, tsc, 295 tests (+6, dont un plancher de **500 mots par terme et par langue** — mesuré entre 773 et 1 004), `next build`, 24 specs Playwright sur les fichiers touchés (+4 : les six sections et la question citée en EN, la même chose en FR, la page courte d'un terme sans contenu long, aucun débordement à 390 px), captures EN desktop et FR mobile relues. Piège d'outillage : après un changement de branche, `tsc` a signalé deux modules introuvables sous `.next/types/validator.ts` — ce fichier est généré par le build précédent (celui d'une autre branche) ; un rebuild le régénère, ce n'était pas une erreur du code.

### R2-11, lot 2 : rétention, activation, coefficient viral (2026-09-06)

Même structure que le lot 1 (`content/glossary-deep.ts`), trois termes de plus : `retention` (924 mots EN / 1 051 FR), `activation` (904 / 1 016), `viral-coefficient` (907 / 1 028). Trois choses propres à ce lot :

- **Les exemples chiffrés sont vérifiés à la main avant d'être écrits**, pas seulement relus : deux cohortes au même J30 (25 %) dont l'une s'aplatit et l'autre glisse ; un taux d'activation qui passe de 23 % à 31 % en déplaçant la fin de l'onboarding ; et la géométrie du K < 1 (K = 0,15 → 1 000 ÷ 0,85 ≈ 1 176 ; K = 0,3 → ≈ 1 429, soit +43 %, ce qui à 500 € de CAC vaut environ 215 € par utilisateur payé — 429 × 500 ÷ 1 000). Les formules de composition (1 − 0,97¹² ≈ 31 %) et les bornes 1,25-1,7 pour K = 0,2-0,4 (1 ÷ (1 − K)) ont été recalculées.
- **La FAQ du coefficient viral dit comment le site mesure son propre K** — directement (Tours parrainés ÷ tous les Tours, premier contact, auto-parrainages exclus, R2-01/R-03), pas par « invitations × conversion » — et assume qu'il sous-compte. Conséquence à relire : la phrase « calcule d'ailleurs son propre K-factor en continu, exactement selon cette formule » de l'`extended` validé le 2026-08-29 est devenue approximative depuis R2-01. Pas modifiée ici (copie approuvée), signalée dans `REVIEW-02.md`.
- **Les affirmations sur « ce que font la plupart des équipes » ont été adoucies** en relisant (« une façon typique », « beaucoup d'équipes ») : ce sont des observations de praticien, pas des statistiques, et le texte ne doit pas leur donner l'air d'en être.

**Vérifié en réel** : lint, tsc, 295 tests (le plancher de 500 mots couvre les six termes), `next build`, 16 specs Playwright sur les fichiers touchés (+2 : la question Retention citée, le coefficient viral à 390 px), passe axe verte sur la page de terme.

### R2-11, lot 3 : acquisition, referral, revenue — les cinq piliers ont leur page longue (2026-09-06)

`acquisition` (947 mots EN / 1 115 FR), `referral` (914 / 1 058), `revenue` (919 / 1 094). Avec les lots 1 et 2, les cinq piliers du Tour et les quatre termes commerciaux sont couverts ; restent six termes de vocabulaire.

**Un pilier n'a pas « une formule » comme le CAC en a une** — chacun a reçu l'identité qui structure vraiment sa lecture : le rendement d'un canal (visiteurs × taux d'inscription × inscription → client, dont le CAC du canal découle), la part du parrainage (arrivés par un utilisateur ÷ tous les nouveaux, complémentaire du K déjà traité), et l'identité du MRR (mois prochain = ce mois + nouveau + expansion − contraction − résilié), qui donne la NRR en une ligne. Les exemples se répondent toujours entre pages : la page Revenue rejoue **le même mois** que la page Churn (400 clients, 20 000 € de MRR, 12 résiliations, 8 rétrogradations, 15 montées en gamme) lu cette fois côté revenu — mêmes chiffres, autre pilier, ce qui est exactement ce que le cadre AARRR veut faire comprendre.

**Recalculé avant d'être écrit** : 48 + 72 = 120 clients, 72/120 = 60 % pour un sixième du trafic, 250 € vs 28 € de CAC contre 117 € en mixte ; 410 × 120 € = 49 200 € ; 15 montées de 50 € à 110 € = +900 €, à 130 € = +1 200 €, NRR (20 000 + 1 200 − 400 − 600) ÷ 20 000 = 101 %. La première version de l'exemple Acquisition disait « un cinquième du trafic » pour 4 000 sur 24 000 — c'est un sixième, corrigé au calcul.

**« Dans le Tour »** cite `acq-1`, `ref-1` et `rev-1` — la première question de chaque pilier, celle qui ouvre l'échelle des trois. La page Referral dit que le bouton de partage du Tour et le lien « fais ton propre Tour » de chaque résultat partagé (R2-02) sont la réponse du site à sa propre première question ; la page Revenue explique pourquoi le pilier est noté sur « le modèle a-t-il été testé » et non sur le montant, ce qui est la question qu'un lecteur se pose devant ce score.

**Vérifié en réel** : lint, tsc, 295 tests (plancher de 500 mots et cohérence `questionId` sur les neuf termes), `next build`, 19 specs Playwright sur les fichiers touchés (+2 : la question de pricing citée, la page Referral FR à 390 px), passe axe verte, capture EN desktop de la page Revenue relue.

### R2-11, lot 4 : AARRR, moment « aha », onboarding (2026-09-06)

`aarrr` (905 mots EN / 1 025 FR), `aha-moment` (896 / 1 011), `onboarding` (873 / 994). Trois termes de vocabulaire plutôt que des métriques, ce qui a demandé de choisir pour chacun ce qui tient lieu de « formule » :

- **AARRR** reçoit l'arithmétique de l'entonnoir — chaque étape est un taux, les taux se multiplient (10 % de mieux à quatre étapes = 1,1⁴ ≈ +46 %, pas +40 %), le parrainage referme la boucle — et l'exemple qui justifie tout le cadre : 10 000 visiteurs × 25 % × 40 % × 10 % = 100 clients ; doubler l'acquisition en donne 200, réparer d'abord activation (35 %) et rétention (50 %) en donne 175 à coût nul puis 350 en doublant. « Dans le Tour » y explique comment les quinze questions, les points 20/7/0 et le score sur 100 dérivent du cadre, et pourquoi la page de résultat montre d'abord l'étape la plus faible.
- **Le moment « aha »** reçoit une méthode pour le trouver plutôt qu'une définition de plus : le levier d'une action candidate (part des fidèles qui l'ont faite en semaine 1 ÷ part des partis), avec un exemple à deux candidates (78/35 = 2,2 contre 64/6 = 10,7 — c'est la facture *envoyée*, pas créée) et la mise en garde corrélation/causalité écrite dans la note de la formule, pas en bas de page.
- **L'onboarding** reçoit le time-to-value (médiane, pas moyenne) et un exemple entièrement en soustraction (4,5 jours → 38 minutes sans ajouter une fonctionnalité), parce que c'est la leçon que ce terme a à donner.

Les exemples célèbres cités sont ceux déjà validés dans les `extended` (7 amis en 10 jours) ou de notoriété publique (2 000 messages chez Slack, un fichier chez Dropbox), sans chiffre inventé.

**Vérifié en réel** : lint, tsc, 295 tests (plancher de 500 mots sur douze termes), `next build`, 17 specs Playwright sur les fichiers touchés (+2 : la page AARRR cite bien la première question du Tour et parle des quinze questions, la page onboarding FR tient à 390 px). La spec « un terme sans contenu long garde sa page courte » pointe maintenant sur `growth-loop`, dernier terme sans `deep` — le lot 5 devra la remplacer par son contraire (tous les termes ont une page longue).

### R2-11, lot 5 : boucle de croissance, North Star, upsell — le glossaire long est complet (2026-09-06)

`growth-loop` (972 mots EN / 1 115 FR), `north-star-metric` (920 / 1 087), `upsell-cross-sell` (965 / 1 136). Les quinze termes ont maintenant leur page longue : de 76-105 mots par terme au départ de la revue à 770-970 en EN et 910-1 140 en FR.

- **La boucle de croissance prend ce site pour exemple, avec sa vraie mécanique** : l'aperçu du lien partagé, le lien « fais ton propre Tour » du visiteur (R2-02) et la référence portée par ce lien (R-03) sont présentés comme les trois termes de la formule — retire l'un d'eux et la boucle redevient un entonnoir. Les chiffres de l'exemple (20 % partagent, 12 lecteurs, 6 % convertissent → 0,144) sont une hypothèse de calcul présentée comme telle, pas une mesure du site.
- **La North Star** reçoit la décomposition étendue × fréquence × profondeur, le « test du doublement », et un « Dans le Tour » qui cite `act-2` et `ret-1` comme les deux questions dont une North Star se construit. Piège attrapé par `tsc`, pas à la relecture : j'avais cité la question `act-2` de mémoire (« atteint le moment "aha" ») avec des guillemets non échappés — la vraie formulation est « atteint ce moment ». Corrigé en citant le texte exact de `copy-library.ts` ; c'est précisément pour ça que la carte « Dans le Tour » rend la question depuis le code plutôt que depuis la prose.
- **L'upsell** reçoit un playbook écrit à trois lignes dont l'arithmétique prolonge l'exemple partagé par les pages Churn et Revenue (mêmes 400 clients et 20 000 € de MRR) : expansion 2,4 % → 5,4 %, churn revenu net +2,6 % → −0,4 %, vérifié à la main.

**`GLOSSARY_DEEP` passe de `Partial<Record<…>>` à `Record<…>`** : un terme ajouté au glossaire sans page longue ne compile plus. Le test unitaire « couvre tous les termes » le redit à l'exécution, et la spec E2E « un terme sans contenu long garde sa page courte » est remplacée par son contraire. Le rendu conditionnel du composant est conservé pour qu'un futur terme puisse malgré tout être livré court d'abord, en assumant le `deep` manquant dans le type.

**Ce qui reste de R2-11 n'est pas du code : c'est la relecture** de quinze pages × deux langues, marquées en tête de `glossary-deep.ts` et sur les libellés de section dans `dictionary.ts`. Une fois relues, mettre à jour `updatedAt` des termes retouchés et lever les marqueurs, comme pour les `extended` le 2026-09-06.

**Vérifié en réel** : lint, tsc, 295 tests, `next build`, 24 specs Playwright sur les fichiers touchés, passe axe verte, capture EN desktop de la page upsell relue.

### Quota Vercel épuisé par la cadence de la revue, et `vercel.json` pour que ça ne se reproduise pas (2026-09-07)

**Ce qui s'est passé.** Le 2026-09-06, la revue 02 a été livrée en vingt PR mergées, une trentaine de pushes de branche et cinq PR Dependabot. Chaque push déclenche un déploiement de prévisualisation sur Vercel et chaque merge un déploiement de production : le plan Hobby a plafonné en soirée et **la production a été gelée 24 heures** sur `main` à la PR #82 — les PR #83 et #84 (lots 4 et 5 du glossaire) sont restées non déployées jusqu'au lendemain. Vercel ne rattrape pas les commits arrivés pendant un blocage : il a fallu un « Redeploy » du dernier commit de `main`, ou attendre le merge suivant.

**Le correctif.** `vercel.json` avec un `ignoreCommand` qui saute tout build hors production (`exit 0` = ignoré, `exit 1` = construit, c'est le contrat de Vercel). Les prévisualisations ne servaient à rien sur ce projet : la vérification se fait en local contre un build de production, puis en CI. R-17 disait « pas de `vercel.json`, rien à y mettre » — c'est maintenant faux pour exactement une ligne. Un test unitaire (`src/__tests__/vercel-config.test.ts`) garde le fichier valide (un `vercel.json` invalide fait échouer **tous** les déploiements, production comprise) et vérifie que la branche `production` reste du côté `exit 1`.

**Convention qui en découle** : regrouper les pushes sur une branche de PR (une vérification complète, un push), et ne pas empiler plus de quelques merges dans la même journée quand chacun déploie la production — ou vérifier la consommation Vercel avant. Le blocage n'a rien cassé, mais il a retardé d'un jour la mise en ligne de travail déjà vérifié.
### `Vary: Accept-Language` sur ce qui dépend de la langue du navigateur (2026-09-07)

Point parti d'une alerte Search Console (« page avec redirection » sur `www.tourdegrowth.com`), vérifiée avant d'être traitée : les chaînes de redirection que voit Googlebot sont saines (trois sauts au plus, aucune boucle, 308 partout, 200 à l'arrivée) et la config de domaines Vercel est la bonne (apex en 308 vers `www`). Ce que Google liste, ce sont les URL qui redirigent par construction : `/` vers `/en` ou `/fr`, les anciennes adresses non préfixées d'avant R-13, l'apex. Rien à corriger là.

Ce qui manquait, mineur : la redirection de la racine (et celle des anciennes adresses non préfixées) ne disait pas que sa destination dépend d'`Accept-Language`. Le proxy pose maintenant `Vary: Accept-Language` sur ces 308 — ce que Google demande pour les réponses adaptées à la langue, et de la correction HTTP ordinaire pour tout cache intermédiaire. **Jamais sur une page de contenu préfixée** : là, la langue est dans l'URL, et un `Vary` fragmenterait par navigateur le cache CDN que R-24 a construit.

**Limite trouvée en vérifiant sur le build, pas en relisant.** Les pages qui rendent dans la langue du lecteur (`/quiz`, `/r/<id>`, `/deep-dive/<id>`, R-09) devraient porter le même en-tête, et ne le peuvent pas : le moteur de rendu de l'App Router pose son propre `Vary` (`rsc, next-router-*`) et **remplace** celui qu'on met, que ce soit sur un `NextResponse.next()` dans le proxy ou par une règle `headers()` de `next.config.mjs` — les deux ont été essayés et relus au `curl` sur un build de production (le `X-Content-Type-Options` de la même règle, lui, passe). Coût faible : `/r` et `/deep-dive` sont `noindex`, `/quiz` est `no-store`. Le code ne prétend donc rien sur ces pages ; les tests unitaires couvrent les 308 dans les deux sens (redirections marquées, pages préfixées non marquées) et une spec lit l'en-tête réellement servi par le build.

### Les deux faits manquants de la notice, et ce que coûte le palier payant de Gemini (2026-09-07)

`FIRESTORE_REGION` et `GEMINI_TIER` étaient à `"unknown"` depuis la livraison des pages légales. Antoine a donné les deux : Firestore est sur **`eur3`** (multi-région Europe de Google), et la clé Gemini est sur le **palier gratuit**.

**Le second n'était pas une imprécision anodine.** La branche de repli disait « Google traite ce texte dans les conditions de son API Gemini » — vrai mais vide, alors que les conditions des deux paliers diffèrent précisément sur ce qui compte pour un fondateur qui décrit son entreprise dans le champ libre. Lu sur les conditions de l'API, pas de mémoire : le palier gratuit prévoit que les requêtes et les réponses servent « to provide, improve, and develop Google products » et que « human reviewers may read, annotate, and process » l'entrée et la sortie ; le palier payant dit que Google « doesn't use your prompts … or responses to improve our products ». La notice dit donc maintenant lequel s'applique, avec la conséquence pratique (« n'écris rien que tu ne voudrais pas voir lu »). Un test épingle chaque valeur de la constante à la phrase correspondante : basculer `GEMINI_TIER` sans que le texte suive fait rougir la CI.

**Coût mesuré du passage au palier payant**, pour que la décision se prenne sur des chiffres et non sur une intuition. Le prompt réel du Deep dive (15 questions Quick + 10 de contexte + 210 caractères de texte libre, ton roast, FR) fait **5 255 caractères**, mesuré en construisant le vrai prompt. Les tokens de sortie, eux, sont **réellement observés** dans les runs de la sonde : `thoughts` de 765 à 2 801, `answer` de 440 à 530 — et les tokens de réflexion sont facturés comme de la sortie. Un Deep dive = 4 générations (2 tons × 2 langues) : environ 6 400 tokens d'entrée et 8 400 à 13 300 de sortie, soit **0,036 à 0,055 $ par Deep dive** aux tarifs Flash en vigueur jusqu'au 31 décembre 2026 (0,75 $ / 3,75 $ le million), et le double ensuite. Le mode Quick ne coûte rien : il n'appelle plus Gemini depuis l'étape 13. La dépense suit donc le parcours optionnel, pas le trafic.

Deux choses à retenir de ce calcul plutôt que le seul montant : **le facteur 4 est notre choix** (générer les deux tons et les deux langues d'avance) et reste le seul levier si le coût devenait un sujet ; et le plafond d'abus est borné par la limite de débit de R-15 (5 Deep dive/h/IP = 20 générations, soit environ 2,4 $/jour pour une IP acharnée), ce qu'un plafond de dépense mensuel referme complètement.

**Ce qui reste vague et pourquoi c'est assumé** : le nombre de tokens d'entrée est déduit du nombre de caractères, pas mesuré — la sonde imprime pourtant `promptTokenCount`, donc le prochain run contre les vrais services donnera le chiffre exact. La fourchette de sortie, elle, vient de mesures réelles.
### R2-28 : la page de métriques publique, construite fermée (2026-09-07)

Décision d'Antoine : construire, mais garder la page close tant que les chiffres ne valent pas la peine d'être lus. **Deux garde-fous distincts**, parce qu'ils répondent à deux questions différentes — et les confondre aurait donné soit une page vide en ligne, soit un drapeau qu'il faut redéployer pour bouger.

- `isPublicMetricsEnabled()` — *la page doit-elle exister ?* Lit `METRICS_PAGE_ENABLED` **à chaque requête**, donc la basculer dans Vercel ouvre ou ferme ~~sans redéploiement~~ — **faux, corrigé le 2026-09-24** : une variable Vercel modifiée n'atteint que les **nouveaux** déploiements, donc chaque bascule demande un redéploiement (et coûte son Functions Storage, convention 13). Même chose pour `GAME_ENABLED` et `ENGINE_ENABLED`. Fermée par défaut et fermée pour toute valeur autre que `"true"` exactement (`"yes"`, `"1"`, `"TRUE"` laissent la page en 404 — vérifié sur un vrai serveur, pas seulement en test).
- `MIN_SUBMISSIONS_TO_PUBLISH` (50) — *les chiffres veulent-ils dire quelque chose ?* En dessous, la page s'affiche et dit qu'il est trop tôt, au lieu de publier des ratios que le premier partage converti ferait bouger de plusieurs points.

**`toPublicMetrics` est une liste blanche, pas un passe-plat.** Elle recopie champ par champ ce qui est publiable depuis `GrowthStats` : un champ ajouté au tableau de bord privé ne devient jamais public par accident. Un test épingle la liste exacte des clés et vérifie l'absence des ventilations par langue et par ton.

**Piège de build évité par conception.** Une page de contenu est prérendue (R-24), et prérendre celle-ci appellerait Firestore pendant `next build` — or la CI n'a aucun identifiant (R-05 : rien de ce que le build touche ne va jusqu'à Firestore). D'où `dynamic = "force-dynamic"`, et la lecture Firestore enveloppée dans `unstable_cache` à une heure : le rendu est par requête (il doit lire le drapeau), mais la collection n'est scannée qu'une fois par heure quel que soit le trafic — même discipline que R-14, et elle compte davantage ici puisque c'est la collection entière, pas un document.

**Volontairement pas encore liée.** Ni dans le pied de page, ni dans le sitemap. Le pied de page est rendu par les frontières d'erreur, qui sont des Client Components (R2-14) : il ne peut pas lire une variable serveur, et le lien manquerait donc sur les seules pages d'erreur — une incohérence silencieuse. Le sitemap, lui, est généré au build alors que le drapeau se lit à la requête. La découverte se livrera avec l'ouverture, en une ligne ; une spec vérifie qu'aucun lien ne pointe vers `/metrics` d'ici là, pour que ce ne soit pas oublié dans l'autre sens.

`scoreBands` s'ajoute au passage à `GrowthStats` (répartition en 0-39 / 40-59 / 60-79 / 80-100) : une moyenne seule ne dit pas si l'outil rencontre surtout des produits en difficulté ou surtout des produits sains, ce qui est la première chose qu'on cherche sur une page de métriques.

**Vérifié en réel** : lint, tsc, 318 tests (+6), `next build` (`/[locale]/metrics` bien en `ƒ`, et le build passe **sans** identifiants Firestore, ce qui était le risque), 3 specs Playwright sur le garde, les quatre comportements du drapeau contrôlés sur un vrai serveur, et la page regardée avec des chiffres fixes via un patch **local jamais committé** (même méthode que R-12 et R2-02) — captures EN desktop et FR mobile, aucun débordement, patch retiré et absence de trace vérifiée avant commit.

### R2-29 : brief Claude Design sur la visibilité du roast (2026-09-07)

Décision d'Antoine : oui, mais par le circuit Claude Design, pas au jugé. `design/DS-EXTENSION-BRIEF-02.md` + `design/ds-extension-02/` (7 captures 2×, vrai build de production).

**Un brief à une seule question**, contrairement au brief 01 qui en portait cinq : *comment un visiteur apprend-il que le ton roast existe, avant d'avoir répondu à quinze questions ?* Le brief ne demande pas un composant décidé d'avance — il demande à Claude Design de trancher si quelque chose a sa place sur la landing, et quoi. « Ne rien faire » est explicitement listé comme une réponse recevable.

Ce qui est fourni pour que la réponse soit informée plutôt que devinée : l'état actuel de la landing aux deux largeurs, la carte d'aperçu isolée (le seul endroit où la sortie du produit est montrée, aujourd'hui silencieusement en neutre), le sélecteur de ton — c'est-à-dire l'endroit où le roast apparaît pour la première fois, après la quinzième question —, et **ce à quoi le roast ressemble en aval** : l'écran de résultat roast et son image de partage, pour que le traitement proposé ne sur-promette ni ne sous-promette. Trois formes possibles sont décrites avec leur défaut respectif, pour gagner du temps sans orienter.

**Contraintes rappelées parce que chacune mord sur au moins une des formes** : le CTA principal reste le plus proéminent ; le neutre reste le défaut (SPEC.md §6bis) ; le garde-fou anti-moquerie n'est pas un élément de design ; un seul emoji dans toute la marque ; **AA vérifié en CI sans aucune exception restante**, donc une nuance plus discrète demande un token qui passe, pas une dérogation ; et le header mobile est plein depuis R-21.

Point signalé plutôt que caché : `result/ToneToggle` existe, porté à l'extension 01 et **jamais câblé** — parce que l'écran de résultat montre exactement deux CTA (R-23, réaffirmé par Antoine). Le brief dit explicitement que l'utiliser **sur la landing** ne rouvre pas cette décision-là.

Captures prises avec le même patch **local jamais committé** que d'habitude pour l'écran roast (`initialTone` de l'échantillon basculé le temps des captures) — retiré, absence de trace vérifiée avant commit.

### Palier Gemini payant, et le test de garde qui a rattrapé sa propre assertion (2026-09-08)

Antoine a activé la facturation sur le projet derrière la clé (Tier 1, prépayé, plafond mensuel), sur la base du chiffrage de la veille : 4 à 6 centimes de dollar par Deep dive jusqu'au 31 décembre 2026, le double ensuite. `GEMINI_TIER` passe à `"paid"` et la notice dit maintenant que Google n'utilise pas ce texte pour améliorer ses produits — vrai, cette fois, et vérifié sur le HTML servi dans les deux langues.

**Ce qui vaut d'être noté n'est pas la bascule mais ce qu'elle a révélé.** Le test posé la veille (« chaque valeur de la constante épinglée à sa phrase ») est passé au rouge — non parce que la copie était fausse, mais parce que **mon assertion française l'était** : elle cherchait `n['’]utilise pas pour améliorer` alors que la phrase dit « ne **l'**utilise pas ». Ce motif n'aurait jamais pu correspondre, à aucune version de la phrase — et personne ne pouvait le voir tant que le palier était `"free"`, puisque la branche `paid` du test n'était jamais exercée.

C'est le cas d'école d'une assertion morte : verte pendant un jour entier, sans rien vérifier. Elle a été rattrapée par le seul événement capable de l'exercer. Deux choses en découlent, à garder : une garde à branches ne vaut que pour la branche que la configuration courante emprunte, et **la non-vacuité a été refaite après correction** (phrase remplacée par une version neutre → le test tombe bien), ce qui est la seule preuve que la garde tient vraiment.
### R2-27 : la progression entre deux Tours (2026-09-08)

`SPEC.md` §5 listait l'historique de progression en fast-follow, et depuis R-01 et R-20 la donnée dormait déjà sur l'appareil : `tdg.results.v1` garde jusqu'à 20 résultats datés avec leur score. Il ne manquait que la lecture — et c'est la seule raison de revenir dans trois mois que le produit n'avait pas.

**Le choix de la paire est la partie qui a des cas limites, donc c'est la partie qui est pure et testée** (`lib/quiz/progression.ts`). Deux fonctions plutôt qu'une : `latestProgression` compare les deux Tours notés les plus récents (la landing), `progressionFor` s'ancre sur **un résultat donné** (sa propre page). La différence n'est pas cosmétique : quelqu'un qui rouvre un vieux résultat doit être comparé au Tour qui précédait **celui-là**, sinon une page ancienne annoncerait une progression survenue après elle. Le tri se fait sur les dates, pas sur l'ordre du tableau, et les entrées d'avant R-20 (sans score) sont ignorées — un appareil peut donc contenir plusieurs résultats et n'avoir rien à comparer.

`progression-copy.ts` résout les trois formes (hausse, baisse, égalité) en un seul endroit, partagé par la landing et la page de résultat, pour qu'elles ne divergent pas sur le signe. Il reçoit les gabarits déjà traduits plutôt que le dictionnaire : l'îlot de la landing ne doit pas rapatrier `UI_STRINGS` dans son bundle (R2-14). Une égalité a sa propre phrase au lieu de « +0 », qui se lit comme un bug.

**Défaut visible seulement à l'écran, attrapé à la capture** : la page de résultat affichait « 16 points depuis ton Tour précédent » — sans le plus, ça se lit aussi bien comme une baisse. Le gabarit porte maintenant le `+`, le `-` venant du nombre lui-même. C'est exactement le genre de chose qu'une relecture de code ne montre pas.

**Vérifié en réel** : lint, tsc, 329 tests (+9), `next build`, **5 specs Playwright** (+5) — la landing avec deux Tours, un premier Tour sans delta, une baisse en français, un visiteur sans historique, et l'échantillon qui n'affiche jamais rien puisqu'il n'est le Tour de personne. Non-vacuité prouvée : en neutralisant le calcul, 2 des 5 tombent. La ligne sur une **vraie** page de résultat a été vue via un patch local jamais committé (un id donné à l'échantillon) : « +16 points depuis ton Tour précédent (58/100) » en EN et FR, mobile et desktop, patch retiré et absence de trace vérifiée avant commit.

### R2-26 : à qui on se compare (2026-09-08)

« Moyenne de tous les Tours : 61/100 » (R-20) est un chiffre honnête et faible : un indie hacker pré-lancement et une scale-up n'ont rien à se dire à travers cette moyenne. Deux questions facultatives — stade, modèle économique — la rendent comparable.

**L'écran, et son coût assumé.** Un onzième écran s'intercale entre la 15ᵉ question et le sélecteur de ton (`SegmentSelector`, phase `"segment"`), dans un parcours vendu « 3 minutes ». Les deux questions sont donc **pré-répondues à « Je préfère ne pas dire »** : « Continuer → » n'est jamais bloqué et le coût de refuser est un clic, pas une friction. Les options sont des chips, volontairement différentes des boutons de réponse du questionnaire — répondre ici n'est pas répondre au Tour, et rien de ce qui s'y dit n'entre dans le score. Comme le ton (étape 5), le segment n'est **pas persisté** : le reperdre à un rechargement coûte deux clics.

**Un demi-segment n'est pas un segment.** `segmentId` renvoie `null` dès qu'un des deux axes vaut « unknown ». Moyenner « B2B, stade inconnu » remettrait un prototype pré-lancement à côté d'une scale-up — exactement ce que la fonctionnalité existe pour empêcher. La conséquence est volontaire : quelqu'un qui ne répond qu'à une question n'alimente aucun agrégat et reçoit la moyenne globale.

**La cascade est la vraie décision de conception.** `getBenchmarkFor` : moyenne du segment quand ce segment atteint le même seuil de 30, moyenne globale sinon, rien du tout si aucune des deux ne qualifie. Douze segments découpent le même trafic en douze, donc la plupart ne qualifieront pas avant longtemps ; retomber plutôt que masquer garde la ligne à l'écran pendant que les données se remplissent. Chaque lecture est cachée une heure, comme `stats/global` (discipline R-14) — et l'incrément `stats/<segment>` est avalé en cas d'échec pour la même raison qu'en R-20 : à ce moment-là le résultat est déjà écrit, et lever coûterait un 502 pour un Tour qui a réussi.

**`segment_answered`** dit quels axes ont été renseignés (`both`/`stage`/`model`/`neither`) — sans ça, rien ne permettrait de juger si cet écran mérite sa place ou si tout le monde clique droit au travers. Ajouté au vocabulaire de `goatcounter.ts`, à la liste exacte que `goatcounter-api.ts` demande à GoatCounter (sinon le tableau de bord le sous-compterait en silence, R-11) et à la vue de déperdition de `/admin/stats`.

**Le plancher de couverture de R2-10 a fait exactement son travail.** La première version laissait `getBenchmarkFor` (la cascade) et `segmentDetail` sans test : `vitest --coverage` est passé sous les seuils et la CI aurait rougi. Corrigé par six tests, jamais en baissant le seuil — c'est précisément le cas que ce plancher existe pour attraper (« un nouveau module qui reste sans test »), et c'est la première fois qu'il se déclenche depuis sa pose.

**Vérifié en réel** : lint, tsc, **340 tests unitaires** (+6), `next build`, **142 specs Playwright** (+5). Non-vacuité prouvée finement : en retirant `segment` du corps du POST **et** l'événement, 3 des 5 nouvelles specs tombent, et les 2 qui ne portent que sur le placement de l'écran passent toujours — elles mesurent bien deux choses distinctes. Captures relues : EN desktop et FR mobile 390 px, `scrollWidth === clientWidth` dans les deux cas.

**Piège d'outillage qui a coûté un aller-retour** : un build local **sans** `NEXT_PUBLIC_GOATCOUNTER_CODE` ne rend pas la balise du script, donc `trackEvent` ne fait rien et 5 specs analytics échouent — alors que la CI, qui pose `NEXT_PUBLIC_GOATCOUNTER_CODE: e2e-stub` au niveau du workflow, les voit passer. Le contraire du piège de R-11 (là, l'absence rendait une assertion *vacuously verte*) : ici elle rend des specs *faussement rouges*. Reconstruire avec la variable avant de conclure quoi que ce soit sur une spec analytics en local.

### Run n°8 de la sonde : R2-26 vérifié contre le vrai Firestore, et Gemini à 9 s (2026-09-08)

Sonde production lancée **sur la branche avant merge**, contre la production qui venait de recevoir R2-26 : **10 sondes sur 10 vertes**.

- **`stats/first-customers__b2b` : `{ before: 0, after: 1 }`.** C'est la preuve que R2-26 attendait, et elle ne pouvait venir que de là : l'incrément par segment est **volontairement avalé en cas d'échec** (à ce moment-là le résultat est déjà écrit, et lever coûterait un 502 pour un Tour réussi), donc un no-op silencieux aurait été indiscernable d'un succès vu de l'API. Le champ `segment` survit aussi à l'aller-retour Firestore.
- **Les deux compteurs sont maintenant comparés en delta**, pas à zéro. `count > 0` ne prouvait que « quelque chose a été compté un jour », ce qui était déjà vrai avant la fonctionnalité. Comparaison en `>=` et non en égalité, pour qu'une vraie soumission concurrente ne rende pas la sonde rouge.
- **Le nettoyage annule les deux incréments.** Le second comptait plus que le premier : douze segments découpent le même trafic en douze, donc un score de test pèse bien plus lourd dans une moyenne de segment. Conséquence bénigne à connaître : le document `stats/<segment>` reste en base à zéro après le nettoyage plutôt que d'être supprimé — le supprimer serait faux le jour où de vrais utilisateurs y auront contribué, et un compteur à zéro passe de toute façon sous le seuil de 30.
- **Deep dive : 9 s pour quatre générations**, contre ~70 s au run n°6 (`gemini-3.7-flash` a répondu aux deux langues, aucun repli). Un seul point de mesure, donc pas une nouvelle norme — mais la latence de ce produit dépend visiblement plus de la charge de Gemini que de notre code, et le passage au palier payant a pu y contribuer.
- **Le français reste du français**, garde-fou anti-moquerie tenu : « Pour un outil pensé pour un usage quotidien, constater l'essentiel des départs dès la première semaine démontre que l'ancrage de la routine échoue. » Vise la stratégie, jamais la personne.

**Piège de vérification, encore le même, encore attrapé de justesse** : avant de lancer la sonde j'ai voulu confirmer que R2-26 était bien déployé en cherchant une chaîne du segment dans les chunks de `/quiz`. La recherche est revenue vide et j'ai conclu « pas déployé » — alors que **mon motif était faux** : les chunks sont servis sous `/_next/static/immutable/chunks/`, pas `/_next/static/chunks/`. La boucle ne parcourait aucun fichier. Une vérification qui ne trouve rien doit d'abord prouver qu'elle a regardé quelque part : compter ce qu'on a examiné, pas seulement ce qu'on a trouvé.

### Dependabot #72 : essayé plutôt que trié sur les plages de peer (2026-09-08)

La PR groupée proposait six mises à jour de dev. Plutôt que d'accepter ou de refuser sur la foi des `peerDependencies`, chacune a été **installée et exercée** (lint, 340 tests, seuils de couverture, `tsc`, `vitest list` sur la config des sondes) :

- **Vitest 5 + `@vitest/coverage-v8` 5 : pris.** Tout passe. Le comptage de couverture change légèrement (632 instructions contre 652 avec la v4 — la v5 compte un peu autrement), les seuils tiennent avec de la marge. `@types/react-dom` 19.2.7 pris aussi.
- **ESLint 10 : refusé, et pas pour la raison attendue.** Les plages de peer de `typescript-eslint` et `eslint-config-next` acceptent le 10 ; c'est `eslint-plugin-react` (embarqué par `eslint-config-next`) qui **plante au chargement** : `context.getFilename is not a function`, une API qu'ESLint 10 a retirée. Lire les plages n'aurait rien montré ; installer, si.
- **TypeScript 7 : refusé** — `typescript-eslint` déclare `<6.1.0`, et cette fois la plage dit vrai.
- **`@types/node` 26 : refusé par principe** — les types doivent suivre le runtime (Node 22 sur Vercel et en CI), jamais le précéder.

`dependabot.yml` ignore désormais ces trois **majeures** avec la raison en commentaire ; les mineures et patchs continuent d'arriver. Une majeure est une décision, pas une PR à valider par habitude. La #72 est fermée.
