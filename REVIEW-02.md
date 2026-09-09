# Revue technique & fonctionnelle n°2 — 2026-09-06

**Statut : ouverte.** Seconde revue à froid du repo, un jour après la clôture de `REVIEW.md` (26 constats, tous traités). Elle repart de là où la première s'est arrêtée : ce qui a déjà été audité et jugé sain n'est pas ré-audité (liste en fin de document), et les items de la première revue ne sont pas rouverts.

**L'angle de cette revue est différent de la première.** `REVIEW.md` demandait « qu'est-ce qui casse, fuit ou fausse les chiffres ». Celle-ci demande « qu'est-ce qui empêche ce site d'être ce pour quoi il existe » : un side project qui valorise, sans le dire frontalement, le profil de Senior Growth PM de son auteur, en devenant une référence sur le sujet qu'il évalue. Chaque constat est donc pesé d'abord à cette aune — ce qu'un fondateur, un PM growth ou un recruteur verrait en cinq minutes — puis seulement ensuite à l'aune technique.

## Comment utiliser ce document

- Mêmes conventions que `REVIEW.md` : identifiant stable (`R2-01` … `R2-30`), type (**F** = fonctionnel/produit, **T** = technique), effort (XS / S / M / L), statut tenu à jour ici (`À faire` → `En cours` → `Fait (PR #n, date)`), un statut écrit seulement après `git show --stat <sha>` non vide.
- Les lots sont dans l'ordre de traitement proposé. Le lot E est différent des autres : ce sont des **décisions produit à prendre par Antoine**, pas des correctifs — ils sont là pour ne pas être oubliés, pas pour être exécutés sans arbitrage.
- Toute nouvelle chaîne de copie créée en traitant un item repart au statut « à relire » (`CLAUDE.md`, convention 6).
- Instantané du repo au commit `11758de`. Les références `fichier:ligne` sont celles de ce commit.

## État vérifié au moment de la revue

Tout a été exécuté réellement dans ce conteneur, pas déduit de la lecture.

**`main` a bougé pendant la revue.** Deux PR d'une autre session ont été mergées entre le début de l'audit (commit `11758de`) et le début des travaux : [#58](https://github.com/ScratchMe/tourdegrowth/pull/58) (métadonnées et Open Graph localisés sur les pages de contenu, JSON-LD par langue avec `author`, polices des images OG) et [#59](https://github.com/ScratchMe/tourdegrowth/pull/59) (glyphe « № » des images OG, test de couverture des polices). Les constats qu'elles touchent (R2-06, R2-07, R2-15, R2-19) ont été **revérifiés sur `1166ebd`** avant la première PR de ce plan ; leur statut ci-dessous reflète cet état, pas celui du commit audité. Les chiffres de l'annexe A.2 datent, eux, de `11758de`.

| Vérification | Résultat |
|---|---|
| `npm ci` | 590 paquets, 0 vulnérabilité ; 3 avertissements de dépréciation transitifs (`node-domexception`, `glob@10`, `eslint@9.39` « no longer supported ») |
| `npx tsc --noEmit` | 0 sortie |
| `npm run lint` | 0 erreur, 0 avertissement |
| `npx vitest run` | **249 tests verts, 26 fichiers**, 1,9 s, aucun bruit console |
| `next build` | 36 pages de contenu `●`, routes applicatives `ƒ`, alias OG `opengraph-image-1u74ed` toujours juste ; **Next 16 n'imprime plus les tailles de bundle** — mesuré sur disque : 892 Ko de chunks client, le plus gros 223 Ko |
| `npx playwright test` | **80 specs vertes**, 24 s, 0 flaky ; stderr non vide (5× `NoFallbackError`, 1× identifiants Firebase manquants — tous deux attendus et documentés) |
| `npm audit` / `--omit=dev` | 0 / 0 |
| `npm outdated` | 8 en retard, dont 4 majeures (eslint 10, TypeScript 7, vitest 5, `@types/node` 26) ; Playwright épinglé à 1.56.1 volontairement (R-07) |
| Couverture (mesurée avec `@vitest/coverage-v8`, non committé) | 95,6 % des lignes **des fichiers importés par un test** ; 8 fichiers de `src/lib` ne sont importés par aucun test, dont `growth-stats.ts` (voir R2-01) |
| Lighthouse mobile (build local, 4 pages) | Performance 96-97, Accessibilité 100, Bonnes pratiques 96, SEO 100 (63 sur `/r/sample`, attendu : `noindex`) ; LCP 2,5-2,8 s = le H1 en Stardos Stencil |
| Production (`curl` sur www.tourdegrowth.com) | `NEXT_PUBLIC_SITE_URL` bien réglé sur `www` (canonical/hreflang/sitemap corrects) ; `x-vercel-cache: HIT` sur une page glossaire rechargée — **le point « à confirmer » de R-24 est confirmé** ; un seul en-tête de sécurité présent (`strict-transport-security`, posé par Vercel) |
| Search Console (via SEO Gets, 15/08 → 04/09) | 1 clic, ~50 impressions ; pages glossaire indexées mais en **position 70 à 95** sur `virality coefficient`, `aha moment`, `activation definition`, `what is an activation` ; les URL vues par Google sont encore les anciennes non préfixées (`/glossary/…`), la migration R-13 date de la veille |
| Captures Playwright (desktop 1280 + mobile 390, FR + EN, 9 écrans) | Aucun débordement horizontal ; **un bug visuel trouvé** (R2-05) |

## Vue d'ensemble et ordre de traitement

La colonne **Autonomie** dit ce que chaque item attend d'Antoine : **Auto** = je fais et je merge sans rien demander ; **Relecture** = je livre avec de la copie nouvelle marquée « à relire », Antoine relit après coup (par lots, pas PR par PR) ; **Toi** = il manque une information ou une décision avant de pouvoir livrer.

| Lot | ID | Titre | Type | Effort | Autonomie | Statut |
|---|---|---|---|---|---|---|
| **A — Crédibilité devant le public visé** | R2-01 | Le K-factor ne peut jamais être entre 0 et 1 | F+T | S | Auto | **Fait** (PR #62, 2026-09-06) |
| | R2-02 | La page de résultat parle au propriétaire, jamais au visiteur | F | S | Relecture | **Fait** (PR #63, 2026-09-06) — copie relue le 2026-09-09 |
| | R2-03 | Ni mentions légales ni information RGPD | F | M | Toi (1 info) + Relecture | **Fait** (PR #79, mergée le 2026-09-06) — `CONTACT_EMAIL` renseignée (`contact@tourdegrowth.com`), `FIRESTORE_REGION` = `eu` et `GEMINI_TIER` = `paid` posés depuis ; copie relue le 2026-09-09 |
| | R2-04 | Rien ne rattache le contenu à Antoine : ni page, ni entité | F | M | Relecture | **Fait** (PR #78, 2026-09-06) — toute la copie de `content/about.ts` relue et validée telle quelle le 2026-09-09 |
| | R2-05 | Wordmark et sélecteur de langue collés sur les 36 pages de contenu | F+T | XS | Auto | **Fait** (PR #61, 2026-09-06) |
| **B — Boucle de partage et mesure** | R2-06 | Métadonnées : descriptions anglaises sur les URL françaises, titre sans mot-clé | F | S | Relecture | **Fait pour l'essentiel par la PR #58** (autre session) — le reliquat (descriptions de terme, `/quiz`) est repris dans R2-08 |
| | R2-07 | Zéro balise Open Graph sur les pages de contenu | F | M | Auto | **Fait** (PR #58, autre session ; vérifié sur le build le 2026-09-06) |
| | R2-08 | `/quiz` et `/deep-dive/[id]` indexables ; `lastmod` absent du sitemap | F+T | S | Auto | **Fait** (PR #74, 2026-09-06) — reliquat de R2-06 inclus ; copie relue le 2026-09-09 |
| | R2-09 | Le Deep dive dure ~70 s et rien ne prévient | F | S | Relecture | **Fait** (PR #73, 2026-09-06) — copie relue le 2026-09-09 |
| | R2-10 | Le calcul de la métrique reine n'a aucun test | T | S | Auto | **Fait** (PR #62, 2026-09-06) |
| **C — Contenu de référence** | R2-11 | Glossaire : 76 à 105 mots par terme, contre 600 à 1 500 chez ceux qui rangent | F | L | Relecture (lourde) | **Fait — les cinq lots** (PR #80 : `cac`, `ltv`, `churn` ; #81 : `retention`, `activation`, `viral-coefficient` ; #82 : `acquisition`, `referral`, `revenue` ; #83 : `aarrr`, `aha-moment`, `onboarding` ; #84 : `growth-loop`, `north-star-metric`, `upsell-cross-sell` — 2026-09-06). Les quinze pages font 770 à 970 mots en EN et 910 à 1 140 en FR, contre 76 à 105 avant. **Tout relu et validé le 2026-09-09**, quatre termes retouchés à la relecture (acquisition le 8 ; aha-moment, north-star-metric et revenue le 9) — c'était le plus gros bloc de copie de la revue |
| | R2-12 | « AARRR » n'apparaît ni sur la landing ni sur `/how-it-works` | F | S | Relecture | **Fait** (PR #76, 2026-09-06) — 2 chaînes retouchées, relues le 2026-09-09 |
| | R2-13 | Maillage interne : le glossaire n'est lié depuis aucune page qui a de l'autorité | F | S/M | Auto | **Fait** (PR #76, 2026-09-06) — copie relue le 2026-09-09 |
| | R2-14 | Le dictionnaire bilingue entier et tout le glossaire partent dans le bundle client | T | S | Auto | **Fait** (PR #75, 2026-09-06) — gardé par un test statique |
| | R2-15 | Structured data : un seul bloc JSON-LD, identique en FR et en EN | F | M | Auto | **Fait** (PR #58 pour la localisation et `author`, PR #77 pour le reste, 2026-09-06) |
| | R2-16 | Titres FR non localisés là où la requête française diffère | F | S | Relecture | **Fait** (PR #76, 2026-09-06) — `x-default` laissé sur `/en`, voir la section |
| | R2-17 | `/how-it-works` répète chaque nom de pilier deux fois | F | XS | Auto | **Fait** (PR #61, 2026-09-06) |
| **D — Robustesse et sécurité** | R2-18 | Aucun en-tête de sécurité hors HSTS | T | S | Auto | **Fait** (PR #64, 2026-09-06) — CSP `script-src` complète volontairement hors périmètre |
| | R2-19 | Amplification de lectures Firestore non authentifiée sur `/r/<id>` | T | S | Auto | **Fait** (PR #65, 2026-09-06) |
| | R2-20 | `freeContext` conservé indéfiniment pour calculer un booléen | T | S | Auto | **Fait** (PR #66, 2026-09-06) — `modelUsed` conservé, il est lu par la sonde |
| | R2-21 | Deep dive : deux requêtes concurrentes génèrent deux fois | T | S | Auto | **Fait** (PR #71, 2026-09-06) — l'écriture est protégée ; la double génération reste possible, voir CLAUDE.md |
| | R2-22 | Basic Auth admin : comparaison non constante, `atob` Latin-1 | T | XS | Auto | **Fait** (PR #71, 2026-09-06) |
| | R2-23 | Aucun `error.tsx` : une panne rend le document nu de Next | T | S | Auto | **Fait** (PR #65, 2026-09-06) — limite : une panne dans le shell initial reste rendue côté client, voir CLAUDE.md |
| | R2-24 | Petites dettes : `rawPoints` public, logs Gemini non tronqués, pas de Dependabot | T | XS | Auto | **Fait** (PR #66, 2026-09-06) |
| | R2-25 | Le stderr de Playwright n'est pas vide, donc plus lu | T | XS | Auto | **Fait en partie** (PR #65) — la ligne Firebase ne vient plus que de la spec qui l'annonce ; `NoFallbackError` est à Next |
| **E — Décisions produit (Antoine)** | R2-26 | Segmenter le benchmark : « la moyenne des SaaS B2B à ton stade » | F | M | Toi | **Fait** (PR #92, 2026-09-08) — copie de `content/segments.ts` relue le 2026-09-09 |
| | R2-27 | Historique de progression : les données sont déjà sur l'appareil | F | S | Toi | **Fait** (PR #91, 2026-09-08) — copie relue le 2026-09-09 (à part du bon à tirer, où la session avait oublié ces 6 chaînes) |
| | R2-28 | Une page de métriques publique : l'outil montre son propre AARRR | F | M | Toi | **Fait, fermée** (PR #88, 2026-09-07) — `METRICS_PAGE_ENABLED` à basculer dans Vercel quand tu veux l'ouvrir ; copie de `content/metrics.ts` relue le 2026-09-09 |
| | R2-29 | Le roast est le crochet viral et il est invisible avant la 15ᵉ question | F | S | Toi | **Brief envoyé** (PR #89, 2026-09-07) — `design/DS-EXTENSION-BRIEF-02.md` ; en attente du retour Claude Design |
| | R2-30 | Fenêtre Tour de France (SPEC.md §10) : à caler dans le calendrier | F | S | Toi | **Tranché** (Antoine, 2026-09-07) : pas d'urgence, à caler dans le plan de croissance pour juin 2027 |
| **F — Hygiène du dépôt** | R2-31 | Branches distantes obsolètes : audit fait, suppression à faire | T | XS | Toi | **Audit fait** (PR #61) — **10 branches à supprimer au 2026-09-08**, toutes issues de PR mergées ; la suppression automatique fonctionne (les branches mergées depuis le 6 disparaissent seules) |

### Pourquoi cet ordre

1. **Lot A d'abord** parce que ce sont les cinq choses qu'un lecteur du public visé remarquerait en cinq minutes, et que trois d'entre elles se corrigent en moins d'une journée. Le K-factor en particulier : c'est le chiffre que SPEC.md §1 désigne comme le critère de succès du projet, celui « à citer en entretien », et sa définition actuelle le rend indéfendable devant quelqu'un qui connaît la métrique.
2. **Lot B** parce que le partage est le cœur du produit et que ces items conditionnent ce qui se passe *après* un partage (aperçu du lien, page sur laquelle on atterrit, ce que Google en fait).
3. **Lot C** est le chantier long. Il vient après A et B parce qu'un contenu de référence sur un site qui n'a ni mentions légales ni page auteur n'inspire pas confiance, et parce que R2-14 doit précéder R2-11 sous peine de gonfler le bundle du questionnaire à chaque paragraphe ajouté.
4. **Lot D** : rien n'y est en feu, mais R2-18 et R2-19 coûtent une heure chacun et ferment deux trous réels.
5. **Lot E** ne se traite pas : il se discute.

## Plan d'exécution : les PR dans l'ordre

Une PR par ligne, mergée dès que le check `Types, tests, build` est vert (jamais avant), en squash, avec le `git show --stat` non vide vérifié avant de cocher. Chaque PR met à jour la colonne Statut ci-dessus et ajoute son entrée dans `CLAUDE.md`. L'ordre suit les lots, avec deux exceptions justifiées : les items de robustesse à une heure de travail (lot D) sont intercalés tôt parce qu'ils ne coûtent rien et ferment des trous réels, et R2-14 précède tout le lot C parce que chaque paragraphe de contenu écrit avant lui gonfle le bundle du questionnaire.

| # | Items | Ce qui est livré | Autonomie |
|---|---|---|---|
| 1 | R2-05 + R2-17 | Header des pages de contenu aligné sur la landing (composant `ContentHeader`), eyebrow de pilier remplacé par le numéro d'étape | Auto |
| 2 | R2-01 + R2-10 | K-factor redéfini (deux chiffres), `computeGrowthStats` scindé en fonction pure testée, couverture mesurée en CI avec seuil sur `src/lib` | Auto |
| 3 | R2-02 | CTA visiteur / propriétaire sur la page de résultat, événement `take_own_tour`, spec E2E | Relecture (3 chaînes) |
| 4 | R2-18 | En-têtes de sécurité statiques dans `next.config.mjs`, spec qui les lit | Auto |
| 5 | R2-19 + R2-23 + R2-25 | Validation de l'id avant toute lecture Firestore, polices OG mémoïsées, limite de débit sur les GET `/r/`, `error.tsx` + `global-error.tsx` sur `DetourCard`, stderr Playwright réduit au silence | Auto |
| 6 | R2-20 + R2-24 | `freeContextProvided` à la place du texte, `contextAnswers`/`modelUsed` plus écrits, `rawPoints` retiré du payload public, `errText` tronqué, `dependabot.yml`, actions épinglées par SHA dans `verify-live.yml` | Auto |
| 7 | R2-21 + R2-22 | `saveDeepDive` transactionnel, Basic Auth en comparaison constante et UTF-8 | Auto |
| 8 | R2-09 | Copie d'attente avant et pendant le Deep dive | Relecture (2 chaînes) |
| 9 | R2-08 (+ reliquat de R2-06) | `metaDescription` par terme, `noindex` sur `/deep-dive/[id]`, titre et description propres pour `/quiz` (gardé indexable — c'est une cible légitime pour « growth quiz », à contredire si tu préfères l'inverse), `lastmod` et `x-default` dans le sitemap. Le reste de R2-06 (titres et descriptions localisés, titre de landing) a été livré par la PR #58 | Relecture (titres et descriptions) |
| 10 | R2-14 | `SiteFooter` en Server Component, `glossary.ts` scindé en moitié popover et moitié serveur | Auto |
| 11 | R2-13 + R2-12 + R2-16 | Liens depuis `/how-it-works`, la landing et le popover ; « AARRR » nommé ; H1/titres FR localisés ; guillemets français ; `x-default` → `/` | Relecture (quelques chaînes) |
| 12 | R2-07 | ~~`openGraph`/`twitter` par défaut + image OG statique pour les pages de contenu~~ Livré par la PR #58 avant le début du plan ; vérifié sur le build : balises et image présentes sur les quatre types de page | Rien à livrer |
| 13 | R2-15 | Module `lib/seo/jsonld.ts` : `DefinedTerm`, `DefinedTermSet`, `BreadcrumbList` ; `url` et devise du `WebApplication` par langue (le bloc est déjà localisé avec `author` depuis la PR #58) | Auto |
| 14 | R2-03 | Deux pages, `/[locale]/privacy` et `/[locale]/terms`, sur le modèle de Ramille ; liens dans le pied de page ; ligne sous le champ de contexte libre | Toi (voir ci-dessous) + Relecture |
| 15 | R2-04 | Page `/[locale]/about` avec méthodologie complète et `Person` | Relecture (c'est ta voix) |
| 16 à 20 | R2-11 | Contenu long du glossaire par lots de trois termes, en commençant par `cac`, `ltv`, `churn`, puis `retention`, `activation`, `viral-coefficient`, puis le reste | Relecture (lourde, lot par lot) |
| — | R2-31 | Rien à livrer côté code : la liste des branches à supprimer est dans la section R2-31, la suppression se fait dans l'interface GitHub | Toi |

### Ce dont j'ai besoin de toi

**Pour merger la PR 14 (R2-03, #79, en draft).** Les deux pages sont écrites et vérifiées ; il ne manque que les constantes en tête de `src/content/legal.ts`. Tranché le 2026-09-06 avec Antoine : même modèle que Ramille (`ScratchMe/TraceVerte`, `src/app/confidentialite.tsx` et `conditions.tsx`) — deux pages, régime « personne physique, à titre non professionnel » de l'article 6 III-2 de la LCEN, donc ni adresse postale, ni téléphone, ni statut juridique, ni directeur de la publication ; Vercel nommé comme hébergeur avec son adresse ; le nom de l'éditeur et une adresse e-mail restent affichés parce que le RGPD article 13 l'exige. Il manque encore :
1. **L'adresse e-mail de contact**, qui doit pouvoir *recevoir* du courrier (Ramille en a fait l'expérience : une adresse qui n'arrive nulle part serait un manquement à l'article 12). Une adresse dédiée sur tourdegrowth.com demande un enregistrement MX chez IONOS ; une adresse existante marche aussi.
2. Deux faits pour la notice, pas des décisions : **la région Firestore** du projet (pour écrire ou non « hébergées dans l'Union européenne ») et **le palier de la clé Gemini** (gratuit ou payant — sur le palier gratuit Google peut utiliser les requêtes pour améliorer ses produits, ce qui change la phrase à écrire et mérite peut-être de changer de palier vu ce que contient le champ de contexte libre).

Les deux pages sont rédigées en entier, bilingues, en ne décrivant que ce que le produit fait réellement (même règle que Ramille) — sur la PR #79. Sans la région ni le palier, la notice reste vraie mais moins précise (« hébergées chez Google Cloud », « dans les conditions de son API Gemini ») ; sans l'e-mail, elle ne peut pas partir : un test unitaire et quatre specs E2E restent rouges tant que `CONTACT_EMAIL` est vide, exprès. Tu relis, tu renseignes les trois constantes, je merge.

**Pour le lot E, une réponse par ligne suffit.** Ma recommandation entre parenthèses :
- R2-26 segmentation du benchmark : oui / non / plus tard (oui, mais après le lot C — deux questions de plus se justifient quand le contenu qui les exploite existe).
- R2-27 progression entre deux Tours : oui / non (oui, c'est quasi gratuit et c'est la seule raison de revenir).
- R2-28 page de métriques publique : oui / non / plus tard (oui, après R2-01, avec un seuil d'affichage ou l'étiquette « en construction, en public »).
- R2-29 roast visible sur la landing : oui / non (oui, par le circuit Claude Design, pas au jugé).
- R2-30 fenêtre Tour de France : date cible (mai 2027 pour le code, juin pour le post).

**Relecture de copie.** Toutes les chaînes nouvelles seront marquées `TODO: à relire (REVIEW-02)` dans le code, et je te les listerai en un seul message quand le lot concerné sera mergé, pour que tu relises en une fois plutôt qu'à chaque PR — même mécanique que la validation du 2026-09-06.

---

## Lot A — Crédibilité devant le public visé

### R2-01 — Le K-factor ne peut jamais être entre 0 et 1

**Type** F+T · **Effort** S · **Statut** À faire

**Constat.** `src/lib/submissions/growth-stats.ts:72-80` définit `uniqueSharers` comme le nombre de `refId` **distincts référencés par au moins une soumission**, puis `kFactor = referredSubmissions / uniqueSharers` (ligne 95). Le dénominateur ne compte donc que les partageurs qui ont déjà converti quelqu'un. Chaque id de l'ensemble contribue par construction à au moins une soumission référée, donc `referredSubmissions ≥ uniqueSharers`, donc **K ≥ 1 dès qu'il existe un seul parrainage**, et 0 sinon. Le tableau de bord affiche ce chiffre sous le libellé « SPEC.md §7 — referred submissions ÷ unique sharers » (`src/app/(app)/admin/stats/page.tsx:146-148`). La vérification du 2026-08-29 (CLAUDE.md : « K-factor = 2.00 pour 2 soumissions référées / 1 parraineur unique ») illustre exactement le biais : trois personnes qui partagent dont une seule convertit deux fois donnent K = 2,00 au lieu de 0,67.

**Impact.** La métrique que le projet existe pour produire ne peut pas prendre une valeur dans l'intervalle où vit un vrai coefficient viral de produit early-stage. Un interlocuteur qui connaît la métrique le verra en une question (« combien de gens ont partagé ? »). C'est le contraire de la démonstration visée.

**Correctif proposé.** Firestore ne sait pas qui a partagé ; seul GoatCounter le sait (`share/<ton>/<méthode>`), et `/admin/stats` récupère déjà ces événements via l'API (`stats.shares`). Deux chiffres honnêtes, à afficher tous les deux :
- **K = soumissions référées ÷ soumissions totales** — la définition standard (nouveaux utilisateurs générés par utilisateur existant : chaque résultat est un partageur potentiel). Calculable dans `growth-stats.ts` seul.
- **Conversion par partage = soumissions référées ÷ événements `share`** — le taux qu'un partage produit une analyse. Calculable avec la donnée GoatCounter déjà chargée.
L'ancien ratio peut rester s'il est renommé pour ce qu'il est (« référées par partageur ayant converti »), mais il ne doit plus s'appeler K-factor. Mettre à jour le libellé, le commentaire de `types.ts`/`growth-stats.ts`, et l'entrée CLAUDE.md du 2026-08-29.

**Vérification attendue.** Tests unitaires sur `computeGrowthStats` avec la lecture Firestore mockée (voir R2-10) : le cas « 3 partageurs, 1 convertit 2 fois » doit donner K < 1.

### R2-02 — La page de résultat parle au propriétaire, jamais au visiteur

**Type** F · **Effort** S · **Statut** À faire

**Constat.** Pour un visiteur arrivant par un lien partagé — c'est-à-dire le numérateur du K-factor —, `ResultView.tsx:362-372` affiche exactement les deux CTA du propriétaire : « Partager mon score » en primaire, « Refaire le Tour » en secondaire. Le lien du second est bon (il porte le `?ref=`, R-03), c'est le libellé qui est faux pour quelqu'un qui n'a jamais fait le Tour — R-01 l'avait noté « à traiter en R-10 », ce n'a pas été fait. Et rien sur la page ne dit au visiteur ce qu'est le site : pas de « 15 questions, 3 minutes, gratuit », qui n'existe que dans l'image OG et sur la landing. Vérifié en capture (`/r/sample`, EN et FR, desktop et mobile).

**Impact.** L'écran qui convertit le trafic de parrainage est optimisé pour la personne qui l'a déjà fait. Le seul bouton qui invite le visiteur à agir pour lui-même est en secondaire, avec un libellé qui suppose qu'il est déjà passé par là.

**Correctif proposé.** `isOwner` existe déjà (R-01). Pour un non-propriétaire : primaire = « Fais ton propre Tour → » (vers `/quiz?ref=<id>`), secondaire = « Partager ce résultat », plus une ligne courte au-dessus des CTA (« 15 questions, 3 minutes, gratuit, sans compte »). Toujours exactement deux CTA — la règle de l'étape 7 tient, seuls les rôles changent selon qui regarde. Comme `isOwner` n'est connu qu'après montage, l'état de départ doit être la version visiteur (c'est le cas majoritaire sur un lien partagé), et un test doit vérifier qu'un propriétaire retrouve bien ses libellés après montage. Copie nouvelle → à relire.

**Vérification attendue.** Spec E2E : sur `/r/sample` sans jeton, le bouton primaire mène à `/quiz` ; avec un jeton semé, il redevient « Partager ». Événement analytics distinct pour le clic visiteur (`take_own_tour`) afin de mesurer ce taux, qui est aujourd'hui invisible.

### R2-03 — Ni mentions légales ni information RGPD

**Type** F · **Effort** M · **Statut** À faire

**Constat.** `grep -ri "privacy\|confidentialit\|mentions légales\|RGPD\|GDPR" src` ne renvoie aucune copie produit. Or le produit persiste dans Firestore les 15 réponses, les 10 réponses de contexte, et `freeContext`, un champ dont le placeholder invite littéralement à décrire son entreprise (« we sell to accounting firms, long sales cycle, trust is a bigger blocker than price… », `src/content/free-context.ts:23`), puis envoie ce texte à l'API Gemini de Google. Aucune page ne le dit. Le pied de page ne porte que « How it works », « Glossary » et le lien CV.

**Impact.** Deux obligations distinctes, toutes deux non remplies : LCEN art. 6-III (identification de l'éditeur d'un site publié en France) et RGPD art. 13 (information : quoi, pourquoi, base légale, durée, sous-traitants — Google Cloud, Google Gemini, Vercel — et le fait qu'un texte libre part chez un LLM). GoatCounter sans cookie évite le bandeau, pas la notice : ce sont deux sujets. Et au-delà du droit, c'est l'impression exacte à ne pas donner au public visé : un site de Growth PM qui demande à un fondateur de décrire son business et ne dit pas où ça va.

**Correctif proposé** (précisé avec Antoine le 2026-09-06). Deux pages sur le modèle de Ramille (`ScratchMe/TraceVerte`) : `/[locale]/privacy` (qui est responsable, ce qui est collecté et pourquoi, où ça va — Firestore, Gemini, Vercel, GoatCounter —, combien de temps, tes droits, CNIL) et `/[locale]/terms` (objet, ce que le score est et n'est pas, ce qu'on s'engage à ne pas faire, disponibilité, responsabilité, propriété, éditeur et hébergeur). Régime non professionnel de la LCEN 6 III-2 : nom et e-mail de l'éditeur, hébergeur avec adresse, rien d'autre. Bilingues, prérendues, liées depuis `SiteFooter`, plus une ligne sous le champ de contexte libre (« Ce texte est envoyé à Gemini pour rédiger ta recommandation, et n'apparaît jamais sur la page partagée »). Trois choses que Ramille n'a pas à dire et que nous devons dire : le texte libre part chez Gemini ; le score et les réponses sont conservés sans limite parce qu'un lien partagé doit rester valide ; la suppression d'un résultat se demande par e-mail en joignant son URL, faute de compte pour prouver qu'on en est l'auteur. À faire après R2-20, qui réduit ce qu'il y a à déclarer.

**Vérification attendue.** Page présente dans le sitemap, liée depuis le pied de page de toutes les pages, `curl` des deux langues.

**Livraison (PR #79, en draft).** Une correction au correctif proposé ci-dessus : la ligne sous le champ de contexte libre ne peut pas dire que le texte « n'apparaît jamais sur la page partagée » — le premier run de la sonde de production (CLAUDE.md, 2026-09-05) a établi que Gemini reprend ce contexte dans les recommandations, qui s'affichent sur la page. La ligne dit donc la vérité : envoyé à Gemini, pas conservé ensuite, et il peut façonner le texte affiché. Les conditions le redisent dans la section « Ta page de résultat ». La PR est bloquée par construction tant que l'adresse manque : un test unitaire (`src/content/__tests__/legal.test.ts`) et les quatre specs qui exigent un lien `mailto:` sont rouges avec `CONTACT_EMAIL` vide.

### R2-04 — Rien ne rattache le contenu à Antoine : ni page, ni entité

**Type** F · **Effort** M · **Statut** À faire

**Constat.** Sur les 36 pages indexables, le seul signal d'auteur est l'ancre du pied de page (`SiteFooter.tsx:69-77`). La bio (`content/antoine-credit.ts:26-29`, `DEEP_DIVE_CREDIT`) n'apparaît qu'après un Deep dive complété — la surface la plus profonde et la moins visitée du site. Le bloc JSON-LD `WebApplication` de la landing (`src/app/[locale]/page.tsx:29-38`) n'a ni `author` ni `creator`. Il n'existe aucune page « à propos » ni « méthodologie » : `/how-it-works` explique la forme du score en 63 mots (`content/how-it-works.ts:71-72`) sans jamais donner les valeurs de points (20/7/0), la règle d'arrondi par pilier, ni un exemple chiffré — tout ça n'est montré qu'au propriétaire d'un résultat (`ScoreBreakdown`, R-12). Le « ré-explicable en 10 secondes » que CLAUDE.md pose comme non négociable n'est pas public. Pas de contact non plus : LinkedIn n'est cité qu'après un Deep dive.

**Impact.** L'objectif du site est de valoriser un profil, et Google n'a aucune entité `Person` à laquelle rattacher ce contenu. Un visiteur curieux de « qui a fait ça et pourquoi ces 15 questions » n'a nulle part où aller.

**Correctif proposé.** Une page `/[locale]/about` (ou `/methodology`, qui sonne plus « outil » et moins « CV ») : qui a construit ça et pourquoi, les 15 questions et ce qu'elles mesurent, la règle de scoring exacte avec un exemple, la séparation déterministe / Gemini. JSON-LD `Person` (`sameAs` : CV, LinkedIn), et `author` ajouté au `WebApplication` de la landing. Lien dans le pied de page, entrée dans le sitemap. Une page qui ferme à la fois le trou d'entité, le trou de méthodologie publique et le trou de contact. Le texte de la page est de la copie nouvelle : premier jet possible ici, relecture par Antoine obligatoire — c'est sa voix.

**Vérification attendue.** Rich Results Test de Google sur la page ; le `Person` visible dans le JSON-LD ; lien pied de page présent partout.

### R2-05 — Wordmark et sélecteur de langue collés sur les 36 pages de contenu

**Type** F+T · **Effort** XS · **Statut** À faire

**Constat.** Sur `/how-it-works`, `/glossary` et les 15 pages de terme, dans les deux langues, desktop comme mobile, le wordmark « TOUR DE GROWTH » et le contrôle segmenté EN|FR se touchent, à gauche du header. Cause : `.headerInner` de ces trois modules (`src/app/[locale]/how-it-works/page.module.css:6-10`, et les mêmes lignes dans `glossary/page.module.css` et `glossary/[term]/page.module.css`) n'a ni `display: flex` ni `justify-content: space-between`, contrairement à celui de la landing (`src/app/[locale]/page.module.css:6-14`). Le header de ces pages ne contenait que le wordmark avant R-13 ; le sélecteur y a été ajouté sans que le conteneur soit adapté, et l'extension 01 l'a ensuite remplacé par `Segmented` sans que la capture ait été relue sur ces pages-là.

**Impact.** Le défaut visuel le plus visible du site, sur exactement les pages destinées à être indexées et partagées.

**Correctif proposé.** Aligner les trois `.headerInner` sur celui de la landing (flex, `space-between`, `align-items: center`, `gap`). Mieux : extraire un composant `ContentHeader` utilisé par les quatre pages de contenu, pour que le prochain ajout au header ne se fasse pas quatre fois.

**Vérification attendue.** Une spec qui mesure que le bord droit du sélecteur est proche du bord droit du conteneur (et pas du wordmark) sur une page de terme, à 390 et 1 280 px.

---

## Lot B — Boucle de partage et mesure

### R2-06 — Métadonnées : descriptions anglaises sur les URL françaises, titre sans mot-clé

**Type** F · **Effort** S · **Statut** À faire

**Constat** (relevé sur le HTML prérendu des 36 pages).
- `/fr`, `/fr/how-it-works`, `/fr/glossary` servent une **description anglaise** : `generateMetadata` de la landing ne renvoie que `alternates` (`src/app/[locale]/page.tsx:47-50`) et hérite donc du `rootMetadata` anglais ; `how-it-works/page.tsx:22-24` et `glossary/page.tsx:21-23` codent l'anglais en dur.
- Le titre de la landing est « Tour de Growth » (14 caractères, aucun mot-clé), et il est aussi le titre hérité de `/quiz` et `/deep-dive/[id]`.
- 13 des 15 titres de terme sont identiques en FR et en EN (gabarit `${term} — Tour de Growth Glossary`, `glossary/[term]/page.tsx:35`, suffixe anglais partout).
- Deux descriptions FR dépassent 160 caractères (`growth-loop`, `viral-coefficient` : 179), une EN fait 55 (`acquisition`) — parce que la description réutilise `definition`, calibrée pour le popover.

**Impact.** Un chercheur francophone voit un extrait anglais sur trois pages clés ; le titre de la page la plus forte du site ne dit pas de quoi elle parle.

**Correctif proposé.** Localiser les trois `generateMetadata` ; titre de landing du type « Tour de Growth — bilan croissance AARRR en 3 minutes » / « … AARRR growth check-up in 3 minutes » ; suffixe glossaire localisé ; champ `metaDescription: Translatable` dédié dans `GlossaryEntry` plutôt que la réutilisation de `definition`. Copie nouvelle → à relire.

### R2-07 — Zéro balise Open Graph sur les pages de contenu

**Type** F · **Effort** M · **Statut** À faire

**Constat.** `og:*` et `twitter:*` : 0 occurrence sur `/en`, `/en/how-it-works`, `/en/glossary/cac`, `/fr/glossary/cac` (HTML prérendu). Seule `/r/[id]` en émet (`page.tsx:51-53`) et seule elle a une `opengraph-image`. Next ne dérive **pas** `og:*` de `title`/`description` (vérifié dans `resolve-opengraph.js` : `if (!openGraph) return null`).

**Impact.** Un lien vers une page glossaire ou `/how-it-works` collé sur LinkedIn, Slack ou X donne une carte grise sans image ni titre — sur un site dont le modèle de croissance est le partage. Le pipeline Satori existe déjà (polices converties, tokens recopiés) : il n'est simplement pas branché sur ces pages.

**Correctif proposé.** `openGraph`/`twitter` par défaut dans `rootMetadata` (`root-shell.tsx:113`, `type: "website"`) surchargés par page avec titre/description localisés et `og:locale` ; une `opengraph-image.tsx` statique sous `src/app/[locale]/` (héritée par toutes les routes de contenu), qui affiche le nom du terme pour `/glossary/[term]`.

**Vérification attendue.** `curl` des balises ; image récupérée en 200 `image/png` ; aperçu vérifié dans l'inspecteur de LinkedIn ou de X après déploiement.

### R2-08 — `/quiz` et `/deep-dive/[id]` indexables ; `lastmod` absent du sitemap

**Type** F+T · **Effort** S · **Statut** À faire

**Constat.** Ni `quiz/page.tsx` ni `deep-dive/[id]/page.tsx` ne posent de `robots` (seuls `/admin/stats` et `/r/[id]` le font). `/quiz` reçoit 18 liens internes par arbre de langue — plus que n'importe quelle page de contenu — et s'indexera comme une page mince sous le titre hérité « Tour de Growth », en concurrence avec la landing. `/deep-dive/[id]` est atteignable depuis `/r/[id]` (`noindex, follow`) et peut générer autant d'URL minces qu'il y a de résultats. Côté sitemap (`src/app/sitemap.ts:28-37`) : `changefreq` et `priority` présents (Google les ignore depuis des années), `lastModified` absent (le seul champ qu'il lit), `x-default` absent des alternates du sitemap alors qu'il est dans le `<head>`.

**Correctif proposé.** `robots: { index: false, follow: true }` sur `/deep-dive/[id]` ; pour `/quiz`, un vrai titre et une vraie description (c'est une cible légitime pour « growth quiz ») ou le même `noindex` — décision à prendre, pas à laisser par défaut. Jamais de `Disallow` dans `robots.txt` (même raison que pour `/r/`, `robots.ts:43-48`). `lastModified` alimenté par une date tenue à la main par entrée de contenu (jamais `new Date()` au build, qui mentirait à chaque déploiement).

### R2-09 — Le Deep dive dure ~70 s et rien ne prévient

**Type** F · **Effort** S · **Statut** À faire

**Constat.** Le run n°6 du workflow de vérification a mesuré un Deep dive de production à 70 s (quatre générations en parallèle depuis le bilingue). L'écran de chargement tient (état « toujours en cours », étape 12bis), mais **aucune copie ne prévient de la durée** : ni sous le bouton « Get my results → » de l'écran de contexte libre (`deep-dive/[id]/page.tsx:270-271`), ni sur l'écran de chargement, dont les trois messages ont été écrits pour une attente de 2-3 s (`dictionary.ts` `loading.*`). `grep "minute\|may take\|peut prendre"` sur la copie : rien.

**Impact.** Une minute d'attente sans avoir été prévenu se lit comme un plantage, quelle que soit la qualité de l'animation. Le bouton Réessayer existe, mais son usage sur une génération encore en cours est précisément le cas de course de R2-21.

**Correctif proposé.** Une ligne sous le bouton de soumission (« Environ une minute — on génère tes recommandations dans les deux tons et les deux langues ») et un quatrième message de chargement qui dit la même chose une fois les trois premiers écoulés. Copie nouvelle → à relire. La question de fond — faut-il quatre générations — reste celle notée dans l'état du projet de CLAUDE.md ; ceci ne la tranche pas, ça rend l'attente honnête.

### R2-10 — Le calcul de la métrique reine n'a aucun test

**Type** T · **Effort** S · **Statut** À faire

**Constat.** `src/lib/submissions/growth-stats.ts` (97 lignes : K-factor, taux de Deep dive, taux de contexte libre, fenêtres 7/30 jours) n'est importé par aucun test — c'est ainsi que R2-01 a pu tenir depuis le 2026-08-29. Sept autres fichiers de `src/lib` sont dans le même cas, mais ce sont des wrappers d'I/O (`repository.ts`, `cached-repository.ts`, `firebase/admin.ts`, `resolve-request-locale.ts`, `site.ts`, `tone.ts`, `types.ts`) où un test unitaire apporterait peu. Le repo n'a aucune configuration de couverture : le 95,6 % mesuré pour cette revue ne porte que sur les fichiers qu'un test importe, ce qui est exactement le chiffre qui cache un fichier jamais testé.

**Correctif proposé.** Séparer `computeGrowthStats` en une fonction pure `summarize(submissions, now)` testée, et un wrapper qui lit Firestore. Ajouter `@vitest/coverage-v8` avec `coverage.include: ["src/lib/**"]` et `coverage.all: true` pour que les fichiers jamais importés apparaissent à 0 % au lieu de ne pas apparaître ; un seuil bas mais réel (par exemple 80 % lignes sur `src/lib`) dans la CI.

---

## Lot C — Contenu de référence

### R2-11 — Glossaire : 76 à 105 mots par terme, contre 600 à 1 500 chez ceux qui rangent

**Type** F · **Effort** L · **Statut** À faire

**Constat.** Comptage sur `src/content/glossary.ts` (`definition` + `extended`) : de 76 mots (`upsell-cross-sell`) à 105 (`viral-coefficient`) en EN, médiane 92 ; **tout le glossaire EN fait 1 402 mots**, soit à peu près une seule page « CAC » d'un glossaire concurrent (Amplitude, Mixpanel, Reforge, Lenny's : 600 à 1 500 mots avec formule, exemple chiffré, benchmark, « comment l'améliorer », FAQ). Les termes les plus recherchés commercialement (`cac`, `ltv`, `churn`, `retention`, `acquisition`) sont parmi les plus courts ; la `definition` d'`acquisition` fait 9 mots. Trois termes évoquent une formule en prose sans jamais la poser (`cac`, `ltv`, `viral-coefficient`). Search Console confirme le diagnostic : les pages sont indexées et apparaissent sur les bonnes requêtes, en position 70 à 95.

**Impact.** C'est la thèse SEO du site — devenir une référence sur le vocabulaire growth — et les pages actuelles ne peuvent pas ranger sur des requêtes de tête. Elles rangeront sur de la longue traîne si, et seulement si, elles apportent quelque chose que les autres n'ont pas.

**Correctif proposé.** Ajouter à `GlossaryEntry` des sections structurées (`formula`, `example`, `benchmark`, `howToImprove`, `faq`) rendues **uniquement** sur `/glossary/[term]` — ne jamais allonger `definition`, qui alimente le popover. Cibler d'abord les six termes commerciaux, 500 à 800 mots chacun. L'angle différenciant, qui est aussi celui du site : chaque terme relié à la question du Tour qui le mesure et à la bande de score qui va avec — personne d'autre n'a un outil derrière son glossaire. **Prérequis : R2-14**, sinon chaque paragraphe ajouté part dans le bundle de `/quiz`. Le contenu lui-même n'est pas à écrire par la session de code : premier jet possible, mais c'est de la copie de fond qui porte le nom d'Antoine, à relire ligne à ligne (même statut que les `extended` du 2026-08-29).

**Livraison, lot 1 (PR #80).** Sections structurées dans `content/glossary-deep.ts` (formule expliquée terme à terme, exemple chiffré, ordres de grandeur avec leur réserve, leviers, « Dans le Tour », FAQ), rendues uniquement sur `/glossary/[term]` ; `definition` intacte. « Dans le Tour » cite la vraie question et ses trois réponses depuis `copy-library.ts` (aucune recopie). Un test fixe le plancher à 500 mots par terme et par langue ; mesuré : 773/909 (`cac`), 819/970 (`ltv`), 829/1 004 (`churn`) en EN/FR. Pas de `FAQPage` en JSON-LD : Google ne montre plus ce résultat enrichi qu'aux sites institutionnels et de santé depuis 2023, le balisage ne rapporterait rien. **Lot 2 (PR #81)** : `retention` (924/1 051), `activation` (904/1 016), `viral-coefficient` (907/1 028), même structure ; la FAQ du coefficient viral explique comment le site mesure son propre K depuis R2-01 (Tours parrainés ÷ tous les Tours, premier contact, auto-parrainages exclus) — la phrase « exactement selon cette formule » de l'`extended` validé le 2026-08-29 est devenue approximative depuis R2-01 (le K du site est mesuré directement, pas par invitations × conversion), à relire avec le reste. **Lot 3 (PR #82)** : `acquisition` (947/1 115), `referral` (914/1 058), `revenue` (919/1 094). Les formules sont celles qu'un pilier admet — le rendement d'un canal (visiteurs × inscription × inscription→client), la part du parrainage, l'identité du MRR (nouveau + expansion − contraction − résilié) avec la NRR qui en découle — et chaque exemple est recalculé (CAC par canal 250 € vs 28 € contre 117 € en mixte ; 410 × 120 € ; 20 000 + 2 000 + 900 − 400 − 600 = 21 900, NRR 99,5 % → 101 % avec l'offre supérieure à 130 €). **Lot 4 (PR #83)** : `aarrr` (905/1 025), `aha-moment` (896/1 011), `onboarding` (873/994). La page AARRR porte l'arithmétique de l'entonnoir (les étapes se multiplient : 1,1⁴ ≈ +46 %) et l'exemple « réparer avant d'alimenter » (200 clients en doublant l'acquisition, 350 en réparant d'abord activation et rétention puis en doublant) ; son « Dans le Tour » explique comment les quinze questions dérivent du cadre. La page « moment aha » donne une méthode chiffrée pour le trouver (levier = part des fidèles ÷ part des partis ayant fait l'action ; 78/35 = 2,2 contre 64/6 = 10,7 dans l'exemple). **Lot 5 (PR #84)** : `growth-loop` (972/1 115), `north-star-metric` (920/1 087), `upsell-cross-sell` (965/1 136). La page boucle de croissance prend pour exemple la boucle de ce site avec sa vraie mécanique (aperçu, appel à l'action visiteur, référence sur le lien) ; la North Star reçoit la décomposition étendue × fréquence × profondeur et le test du doublement ; l'upsell reçoit un playbook écrit à trois lignes dont l'arithmétique (2,4 % → 5,4 % d'expansion, churn net +2,6 % → −0,4 %) prolonge l'exemple des pages Churn et Revenue. `GLOSSARY_DEEP` passe de `Partial<Record>` à `Record` : un terme ajouté au glossaire sans page longue ne compile plus. R2-11 est clos côté code ; ce qui reste est la relecture.

### R2-12 — « AARRR » n'apparaît ni sur la landing ni sur `/how-it-works`

**Type** F · **Effort** S · **Statut** À faire

**Constat.** Occurrences de « AARRR » dans le `<body>` rendu : 0 sur `/en`, 0 sur `/en/how-it-works`, 1 sur `/en/glossary` (nom du terme). Le mot n'existe que dans le JSON-LD et dans la meta description de `/how-it-works`, qui promet « The AARRR framework explained » sur une page qui n'emploie pas le mot. Le sous-titre de la landing (`dictionary.ts:55`) énumère les cinq piliers sans nommer le cadre.

**Correctif proposé.** Nommer le cadre dans le titre ou l'intro de `/how-it-works` (`content/how-it-works.ts:19-23`) et dans le sous-titre de la landing. Copie nouvelle → à relire.

### R2-13 — Maillage interne : le glossaire n'est lié depuis aucune page qui a de l'autorité

**Type** F · **Effort** S/M · **Statut** À faire

**Constat** (graphe de liens extrait du HTML des 18 pages EN, FR identique).
- `/how-it-works` ne lie **aucune** page de terme : il explique les cinq piliers et le scoring, et ses seuls liens internes sont la landing, `/quiz` et `/glossary` (pied de page).
- Les cinq `PillarChip` de la landing (`src/app/[locale]/page.tsx:133`) ne sont pas des liens, alors que le composant a un slot `children` prévu pour ça.
- Sur `/r/[id]` — `noindex, follow`, donc une page dont les liens sortants transmettent encore du signal, et celle où atterrit chaque lien partagé — les piliers ouvrent un popover (`GlossaryTerm`) qui **ne lie pas** vers `/glossary/<id>` (`DefinitionPopover.tsx` : aucun `href`). Même chose sur `/quiz` pour les six questions à déclencheur.
- `aarrr` — la requête de tête du sujet — est le terme le **moins** lié (3 liens entrants : l'index et `north-star-metric`).

**Correctif proposé.** Quatre petits diffs : lier les cinq `<h2>` de pilier de `/how-it-works` (les ids de pilier sont déjà les ids de terme) ; lier les chips de la landing ; un lien « En savoir plus → » dans `DefinitionPopover` (améliore aussi le produit, le popover est aujourd'hui un cul-de-sac) ; `aarrr` ajouté aux `related` des cinq piliers (le test `2 à 3 related` passe à 4, décision explicite).

### R2-14 — Le dictionnaire bilingue entier et tout le glossaire partent dans le bundle client

**Type** T · **Effort** S · **Statut** À faire

**Constat** (vérifié en cherchant des chaînes dans les chunks réels du build).
- `SiteFooter.tsx:1` est `"use client"` pour un seul `onClick` de tracking, et importe `UI_STRINGS` (`dictionary.ts`, 340 lignes). Résultat : « Drafting your race report », « dead last », « Roast Mode » et leurs équivalents FR sont dans le chunk de `/en/glossary/cac` — ~7 Ko gzip de copie du questionnaire, du roast et de l'écran d'erreur sur chaque page indexable.
- `GlossaryTerm.tsx:1-3` (client) importe `GLOSSARY` entier, `extended` compris, pour n'utiliser que `term` et `definition` : « Dave McClure » est dans les chunks de `/quiz` et `/r/[id]`. Ce poids croît proportionnellement à R2-11.

**Correctif proposé.** `SiteFooter` en Server Component avec un îlot client `TrackedLink` de dix lignes ; scinder `glossary.ts` en `glossary-terms.ts` (`term` + `definition`, sûr pour le popover) et `glossary-extended.ts` (`extended`, `related`, futures sections — serveur uniquement). Faire ceci **avant** R2-11.

**Vérification attendue.** `grep` d'une chaîne `extended` dans les chunks référencés par `/quiz` : absente. Taille du chunk de la page de terme avant/après.

### R2-15 — Structured data : un seul bloc JSON-LD, identique en FR et en EN

**Type** F · **Effort** M · **Statut** À faire

**Constat.** Un seul bloc `application/ld+json` sur tout le site : le `WebApplication` de la landing, octet pour octet identique sur `/en` et `/fr` — description anglaise sur la page FR, pas d'`inLanguage`, `url: SITE_URL` (donc `/fr` déclare une URL qui n'est pas elle-même), `priceCurrency: "USD"` pour un outil français, et surtout pas d'`author` (voir R2-04). Aucun `DefinedTerm` / `DefinedTermSet` sur le glossaire (le schéma conçu pour ça), aucun `BreadcrumbList` alors que le fil d'Ariane « ← Glossary » est rendu visuellement.

**Correctif proposé.** Un module `src/lib/seo/jsonld.ts` (`webApplication(locale)`, `person()`, `definedTerm(entry, locale)`, `definedTermSet(locale)`, `breadcrumbs(...)`), branché sur la landing, l'index et les pages de terme. `inLanguage` et `url` par locale. `aggregateRating` reste absent tant qu'il n'y a pas de volume (décision de l'addendum 02, toujours juste).

### R2-16 — Titres FR non localisés là où la requête française diffère

**Type** F · **Effort** S · **Statut** À faire

**Constat.** Les slugs sont anglais dans l'arbre FR (`/fr/glossary/cac`), ce qui est acceptable pour la plupart des termes (les praticiens francophones cherchent `CAC`, `churn`, `LTV`, `onboarding`). Mais la requête de tête française pour `cac` est « coût d'acquisition client », et cette expression n'est **ni dans le H1, ni dans le titre** de `/fr/glossary/cac` (H1 : « CAC »). `viral-coefficient` a un terme FR localisé (« Coefficient viral ») mais un slug anglais. Détails : `glossary.ts:123` écrit `Moment "aha"` avec des guillemets ASCII alors que le commentaire du fichier dit « moment « aha » » ; `routes.ts:130` pointe `x-default` sur `/en` plutôt que sur `/`, l'URL qui négocie la langue.

**Correctif proposé.** La moitié bon marché d'abord : `term.fr` = « CAC — Coût d'Acquisition Client », « LTV — Lifetime Value », « North Star Metric — métrique phare » ; guillemets français ; `x-default` → chemin non préfixé. **Livré sauf le dernier point, volontairement** : le chemin non préfixé répond par une redirection 308 selon `Accept-Language`, et Google demande que toute URL d'un jeu `hreflang` réponde 200 — un `x-default` qui redirige est précisément ce que ses consignes déconseillent. Il reste sur `/en`, la page de la langue par défaut, qui est une vraie page. Ne pas localiser les slugs pour l'instant (second axe de `generateStaticParams`, table slug→id, canonicals par langue, et toute URL FR publiée doit vivre pour toujours) — sauf peut-être `coefficient-viral`, à décider quand le contenu de R2-11 sera là.

### R2-17 — `/how-it-works` répète chaque nom de pilier deux fois

**Type** F · **Effort** XS · **Statut** À faire

**Constat.** `how-it-works/page.tsx:60-61` rend un `MetaLabel` puis un `<h2>` avec la même chaîne : « ACQUISITION / Acquisition / How people find you… ». Visible en capture.

**Correctif proposé.** L'eyebrow devient le numéro d'étape (« Étape 1 sur 5 »), le `<h2>` garde le nom — et devient un lien (R2-13).

---

## Lot D — Robustesse et sécurité

### R2-18 — Aucun en-tête de sécurité hors HSTS

**Type** T · **Effort** S · **Statut** À faire

**Constat.** `next.config.mjs` n'a pas de `headers()`, il n'y a pas de `vercel.json`, et `proxy.ts` n'ajoute que `x-tdg-locale` et le cookie. En production, le seul en-tête de sécurité est `strict-transport-security`, posé par Vercel. Pas de `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, ni de `frame-ancestors` : `/r/<id>` — page publique avec de vraies actions — peut être embarquée dans une iframe par n'importe quel site.

**Correctif proposé.** Un bloc `headers()` statique dans `next.config.mjs` : `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` minimal, `Content-Security-Policy: frame-ancestors 'none'`. Deux garde-fous : **jamais `no-referrer`** (les liens CV sont volontairement `noopener` sans `noreferrer` pour que l'analytics du CV attribue le trafic — un `Referrer-Policy` trop strict annulerait ça silencieusement) ; et **pas de CSP `script-src` complète dans cet item** : elle exigerait un nonce par requête, donc re-dynamiserait les 36 pages et déferait R-24. Une CSP complète est une décision séparée, à commencer en `Report-Only`.

**Vérification attendue.** `curl -I` en production ; spec E2E qui lit les en-têtes sur `/r/sample` et `/en`.

### R2-19 — Amplification de lectures Firestore non authentifiée sur `/r/<id>`

**Type** T · **Effort** S · **Statut** À faire

**Constat.** `r/[id]/page.tsx:128` et `opengraph-image.tsx:80` lisent la soumission via `unstable_cache` clé par id : **chaque id distinct est un miss, donc une lecture Firestore facturée**, que le document existe ou non. L'id vient du paramètre de route sans aucune validation. Aucune limite de débit sur les GET (`rateLimit()` n'est appelé que dans les deux POST). Une boucle `curl /r/$(uuidgen)` consomme le quota Spark (50 000 lectures/jour) sans effort, et l'épuiser rend **tout** le plan de données indisponible — résultats existants compris. La route OG est la plus chère par requête : `loadOgFonts()` (`src/lib/og/fonts.ts`, depuis la PR #58 — c'était `loadFonts()` dans `opengraph-image.tsx:98` au moment de l'audit) relit **cinq** fichiers de police **à chaque appel**, avant un rendu Satori complet, y compris pour `/r/sample` qui ne touche pas Firestore — et désormais aussi pour les 36 images OG des pages de contenu, qui sont prérendues au build mais partagent le même chargeur.

**Correctif proposé.** Du moins cher au plus utile : (1) `isValidSubmissionId` existe déjà (`referral.ts:28`) — l'appliquer dans `page.tsx` et `opengraph-image.tsx` avant toute lecture (`notFound()` sinon), ce qui ferme aussi le cas d'un id exotique qui ferait lever `INVALID_ARGUMENT` côté Firestore et tomber sur le document nu de Next (R2-23) ; (2) mémoïser `loadOgFonts()` au niveau du module ; (3) appliquer `rateLimit()` aux GET `/r/` dans le proxy avec un budget large, ou les règles de pare-feu Vercel — même caveat « en mémoire, par instance » que R-15, mais une limite vaut mieux qu'aucune sur le chemin de lecture.

### R2-20 — `freeContext` conservé indéfiniment pour calculer un booléen

**Type** T · **Effort** S · **Statut** À faire

**Constat.** `create-submission.ts:251-252` persiste `contextAnswers` et `freeContext`. Trace de chaque lecture après écriture : `freeContext` n'est lu qu'à `growth-stats.ts:70`, **en truthiness** (le texte lui-même n'est relu par rien) ; `contextAnswers`, `modelUsed`, `completed`, `locale` du Deep dive ne sont relus par rien du tout. Aucune TTL Firestore, aucune suppression nulle part. Le champ le plus sensible que le produit détient — un fondateur décrivant son entreprise dans ses mots — est donc conservé pour toujours afin de compter combien de personnes l'ont rempli.

**Correctif proposé.** Écrire `freeContextProvided: boolean` à la place du texte, cesser d'écrire `contextAnswers`, lire le booléen dans `growth-stats.ts`. (Correction au moment de livrer : `modelUsed` **est** relu — par la sonde `scripts/live/production.live.ts`, qui rapporte quel modèle a répondu ; c'est de l'observabilité, pas une donnée personnelle, il reste écrit.) Garder `freeContext` optionnel dans le type pour que les documents existants se lisent encore. Si le texte brut est vraiment voulu « pour déboguer », la version honnête est un champ dédié avec une TTL Firestore déclarée et une durée écrite dans la notice de R2-03. Aucune IP, aucun user agent, aucun identifiant n'est stocké — ça, c'est propre.

### R2-21 — Deep dive : deux requêtes concurrentes génèrent deux fois

**Type** T · **Effort** S · **Statut** À faire

**Constat.** `deep-dive/route.ts` : lecture non cachée (ligne 94, volontaire), test « déjà complété ? » (118), génération (133, quatre appels Gemini), puis `saveDeepDive` = `.update()` inconditionnel (138 ; `repository.ts:21-23`). Deux requêtes qui passent la ligne 118 avant que l'une atteigne 138 génèrent toutes les deux : huit générations, dernier écrit gagne. Le scénario n'est pas théorique depuis que R-20 persiste la progression : un utilisateur qui recharge pendant les 70 s (R2-09) et ressoumet, ou qui clique Réessayer, produit exactement cette course. Borné par la limite 5/h, donc un problème de quota, pas de disponibilité.

**Correctif proposé.** `saveDeepDive` dans une transaction : relire, renoncer si `deepDive` existe déjà, écrire sinon ; la route renvoie le résultat du gagnant. Empêcher la *génération* double (et pas seulement l'écriture) demanderait un marqueur de réservation avec fenêtre d'expiration ; vu la limite 5/h, la transaction seule est probablement le bon niveau d'ingénierie — noter le marqueur comme escalade si la dépense Gemini devient un sujet.

### R2-22 — Basic Auth admin : comparaison non constante, `atob` Latin-1

**Type** T · **Effort** XS · **Statut** À faire

**Constat.** `proxy.ts:36-37` compare le mot de passe avec `===`. Inexploitable en pratique à travers le jitter d'un edge Vercel, mais le repo traite ce sujet correctement ailleurs (`owner-token.ts:41-56`, `timingSafeEqual` avec pré-vérification de longueur) et l'incohérence est le genre qui se copie. À côté, `atob` (ligne 29) décode en Latin-1 : un mot de passe contenant un caractère non-ASCII ne correspondra jamais à ce qu'envoie un navigateur — pas une faille, mais ça y ressemblera le jour où ça arrivera.

**Correctif proposé.** Comparer les digests SHA-256 des deux côtés avec `timingSafeEqual` (ou `crypto.subtle` + boucle constante si le runtime edge l'exige) ; décoder en UTF-8.

### R2-23 — Aucun `error.tsx` : une panne rend le document nu de Next

**Type** T · **Effort** S · **Statut** À faire

**Constat.** `find src -name "error.tsx" -o -name "global-error.tsx"` : rien. R-26 a réglé cette classe de problème pour le 404 ; le 500 l'a toujours : une panne Firestore pendant `/r/<id>`, ou l'id exotique de R2-19, rend le document d'erreur intégré de Next, sans aucune feuille de style du produit.

**Correctif proposé.** `src/app/(app)/error.tsx` sur `DetourCard tone="fault"` (le composant existe, c'est celui de l'écran d'erreur du quiz) et un `global-error.tsx` pour le niveau layout. Spec E2E qui force une erreur serveur (route de test ou id invalide) et vérifie le chrome.

### R2-24 — Petites dettes : `rawPoints` public, logs Gemini non tronqués, pas de Dependabot

**Type** T · **Effort** XS · **Statut** À faire

Regroupées parce qu'aucune ne mérite un PR seule :
- **`rawPoints` dans le payload RSC de tout visiteur.** `r/[id]/page.tsx:151` passe `breakdown` (avec la somme brute 0-60 par pilier) à tous ; `ResultView` ne l'affiche qu'au propriétaire, mais le serveur ne peut pas filtrer. Avec des options à 20/7/0, chaque somme atteignable correspond à un unique multiset de réponses : un visiteur peut retrouver exactement combien de « oui / partiel / non » l'auteur a donnés par pilier. Le score affiché en révèle déjà presque autant, mais `rawPoints` est **redondant** : `ScoreBreakdown` reçoit déjà `answers` et les points de chaque option et peut le recalculer. Le retirer du view-model.
- **`errText` de l'API Gemini** (`client.ts:223-224`) est journalisé sans troncature ; une erreur `INVALID_ARGUMENT` de Google peut faire écho à la requête, qui contient `freeContext`. Tronquer à 300 caractères comme `response.ts` le fait déjà.
- **Aucun `dependabot.yml`**, ni Renovate ; l'advisory `uuid` de R-18 a été trouvée par un `npm audit` manuel et rien ne signalera la suivante. Actions GitHub sur tags flottants `@v4` (acceptable, sauf dans `verify-live.yml` qui porte les secrets Firebase et Gemini : y épingler par SHA).
- **3 dépréciations à `npm ci`** (`eslint@9.39.5` « no longer supported » en tête) et 4 majeures disponibles (eslint 10, TS 7, vitest 5, `@types/node` 26) — pas urgent, mais à ne pas laisser dériver un trimestre.

### R2-25 — Le stderr de Playwright n'est pas vide, donc plus lu

**Type** T · **Effort** XS · **Statut** À faire

**Constat.** La suite est verte mais son stderr contient 5× `Internal: NoFallbackError` (bruit connu de `dynamicParams = false`, R-26) et 1× l'erreur d'identifiants Firebase (attendue, spec « unknown result never previews as a real image »). Une vraie erreur serveur nouvelle serait noyée dans du bruit que tout le monde a appris à ignorer.

**Correctif proposé.** Soit faire disparaître le bruit à la source (rendre la spec OG « lien mort » indépendante de Firestore avec un id refusé par R2-19 avant toute lecture ; le `NoFallbackError` dépend de Next), soit une assertion de fin de suite qui compare le stderr du serveur à une liste blanche de motifs connus et échoue sur tout le reste.

---

## Lot E — Décisions produit (à trancher par Antoine)

Ces cinq points ne sont pas des correctifs. Ce sont les leviers qui, à mon avis, séparent « un bon outil » de « une référence », et chacun change le produit — donc chacun se décide, pas se code.

### R2-26 — Segmenter le benchmark : « la moyenne des SaaS B2B à ton stade »

**Type** F · **Effort** M · **Statut** **Fait** (PR #92, 2026-09-08) — copie de `content/segments.ts` relue le 2026-09-09

« Moyenne de tous les Tours : 61/100 » (R-20) est un chiffre honnête mais faible : un indie hacker pré-lancement et une scale-up n'ont rien à se dire à travers cette moyenne. Une ou deux questions de contexte en mode Quick — stade (pré-lancement / premiers clients / >100 clients / >1 000) et modèle (B2B / B2C / marketplace) — permettraient « la moyenne des SaaS B2B à ton stade », qui est un chiffre qu'on a envie de partager et de battre. Deux champs sur la soumission, un document `stats/<segment>` par combinaison (même mécanisme que `stats/global`), le même seuil de 30. C'est aussi la matière première d'un contenu « État de la croissance des produits early-stage, édition 2027 » — le format classique par lequel un outil devient une référence citée. Le coût : deux questions de plus dans un parcours vendu « 3 minutes », et une conversation avec l'agent produit sur leur formulation.

### R2-27 — Historique de progression : les données sont déjà sur l'appareil

**Type** F · **Effort** S · **Statut** **Fait** (PR #91, 2026-09-08) — copie relue le 2026-09-09 (à part du bon à tirer, où la session avait oublié ces 6 chaînes)

SPEC.md §5 liste « historique de progression » en fast-follow. Depuis R-01/R-20, `tdg.results.v1` garde déjà jusqu'à 20 résultats datés avec leur score. Il manque seulement l'affichage : « Ton Tour précédent : 58 → 66 » sur la landing (à côté du dernier score) et sur le résultat (sous le score). Quasi gratuit, et c'est la rétention de l'outil lui-même — la raison de revenir dans trois mois, qui n'existe pas aujourd'hui. À décider : voulu ou non, et si oui, la copie.

### R2-28 — Une page de métriques publique : l'outil montre son propre AARRR

**Type** F · **Effort** M · **Statut** À trancher

Le projet existe pour « démontrer par la preuve plutôt que par la description » (SPEC.md §1). La preuve la plus directe est une page publique `/metrics` (ou une section de `/about`) avec les chiffres réels de l'outil : Tours complétés, répartition des scores, taux de Deep dive, taux de partage, K-factor — tel que redéfini en R2-01 — et la boucle de croissance dessinée. C'est le format « open metrics » que les fondateurs et les PM growth reconnaissent immédiatement, et c'est la version publique de ce que `/admin/stats` calcule déjà. Risques à peser : des chiffres petits les premiers mois (seuils d'affichage, ou l'assumer explicitement « en construction, en public »), et le fait qu'un K < 1 affiché est honnête mais pas flatteur — ce qui est précisément ce qui le rend crédible. Dépend de R2-01 ; la lecture GoatCounter existe déjà côté serveur.

### R2-29 — Le roast est le crochet viral et il est invisible avant la 15ᵉ question

**Type** F · **Effort** S · **Statut** À trancher

Le ton roast est ce que le produit a de plus partageable (le brief lui consacre un écran et une image OG distincte), et un visiteur de la landing ne peut pas savoir qu'il existe : la nav « Roast mode » a été coupée du MVP (SPEC.md §12, décision explicite), et le sélecteur de ton n'apparaît qu'après 15 réponses. Ce n'est pas une omission à combler en silence — SPEC.md §12 dit exactement le contraire — mais c'est une décision à reprendre à la lumière de l'objectif « référence » : une phrase du headline roast sur la carte d'aperçu de la landing (un petit toggle « Straight up / Roast me » sur la carte, réutilisant `Segmented`), ou une ligne sous le sous-titre. Décision de design autant que de produit : à passer par le circuit Claude Design si retenu.

### R2-30 — Fenêtre Tour de France (SPEC.md §10) : à caler dans le calendrier

**Type** F · **Effort** S · **Statut** À trancher

Le fast-follow événementiel (badge « Maillot Jaune », vocabulaire « échappée / peloton » pendant les dates du vrai Tour) est le prétexte de contenu annuel le plus naturel du projet et n'a pas de date. Le code est petit (une constante de dates, un badge, trois chaînes) ; ce qui compte, c'est de le construire **avant** juin 2027 pour que le post LinkedIn parte pendant le Tour, pas après. À mettre dans le plan de croissance avec une échéance, pas dans le backlog technique.

---

## Lot F — Hygiène du dépôt

### R2-31 — Branches distantes obsolètes : audit fait, suppression à faire

**Type** T · **Effort** XS · **Statut** **Audit fait** (PR #61, 2026-09-06) — suppression à faire par Antoine dans l'interface GitHub

**Constat.** Onze branches distantes en plus de `main` au 2026-09-06, toutes issues de PR déjà mergées : GitHub ne supprimait pas les branches de tête après merge (option activée par Antoine le 2026-09-06, donc le problème ne se reproduira plus pour les PR à venir — la branche de l'audit, `claude/repo-technical-functional-audit-e9xr8t`, a d'ailleurs été supprimée automatiquement au merge de la PR #60).

**Une affirmation à corriger, relayée par Antoine depuis une autre session** (« `main` n'a que trois commits, un commit sans parent depuis la PR #57, l'historique complet vit dans la branche de revue et les six branches `feat/`, la branche d'audit n'est pas mergée »). Mesuré le 2026-09-06 à 18 h 45 : `main` compte **56 commits**, la PR #60 est mergée et sa branche déjà supprimée. Ce qui est vrai, et qui vaut pour **toutes** les branches sans exception : l'historique commence à un commit **sans parent**, `739b7a2` (« Step 7 », squash de la PR #8, 2026-08-27). Les commits des PR #1 à #7 (scaffold, scoring, landing, questionnaire, sélecteur de ton, backend) ne sont atteignables depuis aucune branche — ni `main`, ni la branche de revue, ni `claude/tour-de-growth-tool-6q3tui`, qui ont exactement la même racine. Leur **contenu** est dans `main` (l'app en est faite) et leurs commits restent consultables sur les pages des PR GitHub ; seul le découpage commit par commit des sept premières étapes n'est plus dans l'arbre. Supprimer les branches ne change rien à cet état : elles ne contiennent pas cet historique non plus.

**Mesure refaite le 2026-09-08, et une fausse alerte à ne pas répéter.** Une première lecture a annoncé « 35 branches, la suppression automatique ne marche pas » : c'était le compte des refs `origin/*` d'un clone local jamais élagué (`git fetch` sans `--prune` conserve indéfiniment les branches que GitHub a déjà supprimées). Recompté contre l'API GitHub : **12 branches**, dont `main` et `dependabot/npm_and_yarn/development-a88db2cecc` (la PR #72, encore ouverte). Restent donc **10 branches à supprimer** — exactement les onze de l'audit ci-dessous moins `claude/repo-technical-functional-audit-e9xr8t`, déjà supprimée automatiquement au merge de la PR #60. Et l'option fonctionne bien : toutes les branches mergées depuis son activation (y compris les deux de ce soir) ont disparu seules.

**Vérification faite, branche par branche**, avant de dire qu'on peut supprimer : pour chacune, la ou les PR ouvertes depuis cette branche (une branche a servi à plusieurs PR successives) et leur date de merge, relevées par l'API GitHub — pas devinées d'après le nom.

| Branche | PR mergées depuis cette branche | Dernier commit | Verdict |
|---|---|---|---|
| `claude/tour-de-growth-tool-6q3tui` | #1 à #13 | 2026-08-27 | Tout est dans `main` (0 commit d'avance). Supprimer. |
| `feat/growth-tour-evolutions` | #14 | 2026-08-28 | Trois commits d'avance sur le merge-base, mais leur contenu (incentive Deep dive « verrouillé », `teaserText`/`teaserCta`) est bien dans `main` et documenté dans CLAUDE.md. Supprimer. |
| `feat/addendum-02-context-credit-seo` | #15 | 2026-08-28 | Supprimer. |
| `feat/nav-glossary-link-home-logo` | #16 | 2026-08-29 | Supprimer. |
| `feat/growth-dashboard-and-profile-click-tracking` | #17 | 2026-08-29 | Supprimer. |
| `feat/goatcounter-funnel-api` | #18 | 2026-08-29 | Supprimer. |
| `feat/utm-discipline-and-glossary-hub` | #19 | 2026-08-29 | Supprimer. |
| `claude/repo-technical-functional-review-w75nho` | #20 à #57 | 2026-09-06 | Supprimer. |
| `claude/og-content-pages` | #58 | 2026-09-06 | Supprimer. |
| `claude/og-bib-numero` | #59 | 2026-09-06 | Supprimer. |
| `claude/repo-technical-functional-audit-e9xr8t` | #60 | 2026-09-06 | Déjà supprimée automatiquement au merge (option activée). |

Aucune branche ne porte de travail non repris. Les différences de contenu qu'on observe entre ces branches et `main` sont celles de `main` qui a continué d'avancer après leur merge (squash), pas du travail perdu.

**Ce qui reste à faire.** Supprimer les dix branches restantes (GitHub → Branches, ou `git push origin --delete <branche>`). Les branches des PR de ce plan se suppriment seules au merge grâce à l'option activée — vérifié sur les PR #60 à #64.

---

## Ce qui a été audité et jugé sain (ne pas ré-auditer)

- **Toolchain** : `tsc`, ESLint, 249 tests, 80 specs, build, audit — tout vert et conforme aux chiffres de CLAUDE.md. La CI reproduit exactement cette séquence.
- **Performance** : Lighthouse 96-97 sur quatre pages ; polices correctement chargées (`next/font`, 4 fichiers, 82 Ko, `swap`, sous-ensemble `latin` suffisant pour le français — vérifié sur les plages unicode émises) ; aucune image raster ; CLS 0 ; le seul tiers est GoatCounter. Le LCP de 2,5-2,8 s en mobile émulé est le H1 en Stardos Stencil et n'appelle pas d'action.
- **i18n / indexation** : canonical + hreflang + `x-default` corrects sur les 36 URL (auto-référents, réciproques), `<html lang>` juste dans les deux arbres y compris avec un cookie contradictoire, copie FR réellement française, un H1 par page sans saut de niveau, `/r/[id]` en `noindex, follow` sans `Disallow` (le bon réglage), `NEXT_PUBLIC_SITE_URL` bien sur `www` en production, CDN Vercel en `HIT` sur les pages de contenu.
- **Sécurité déjà en place** (re-vérifiée ligne à ligne, pas supposée) : jeton de propriétaire (hash, `timingSafeEqual`, vérifié avant la branche idempotente), validation stricte des payloads, codes d'erreur courts, limite de débit appelée en premier dans les deux POST, `x-forwarded-for` non falsifiable sur Vercel (documenté par Vercel, vérifié), clé Gemini en en-tête, `responseSchema`, intégrité du `?ref=` (forme puis existence, jamais bloquant), double troncature du contexte libre, `firestore.rules` en deny-all (à déployer — toujours une action manuelle ouverte de R-17), gate admin sur tous les chemins `/admin*` et `force-dynamic`, workflows (`workflow_dispatch` seul, pas de `pull_request_target`, secrets jamais imprimés, artefact sans secret).
- **Payload public de `/r/<id>`** : tracé de bout en bout — `freeContext`, `contextAnswers`, `modelUsed`, `ownerTokenHash` ne peuvent pas atteindre le client. Seul `rawPoints` (R2-24) est discutable.
- **Robustesse déjà bonne** : invalidation de cache qui ne peut pas faire échouer un Deep dive écrit, incrément `stats/global` avalé en cas d'échec, hygiène de prompt (`FREE_CONTEXT_INSTRUCTION`, délimitation), dates des stats sans dépendance au fuseau.

## Ce que cette revue n'a pas pu vérifier

- Les événements GoatCounter réels et le tableau de bord GoatCounter (proxy sortant du bac à sable, limite documentée depuis l'étape 11).
- Que `firestore.rules` est déployé (console Firebase, compte d'Antoine).
- Le comportement de Vercel Web Analytics / logs d'exécution : l'outil MCP Vercel ne voit toujours pas l'équipe du projet (même limite qu'à l'étape 12).
- La qualité éditoriale du texte roast en production autrement qu'à travers les extraits déjà consignés dans CLAUDE.md.

---

## Annexe — mesures brutes

Les chiffres derrière les constats, pour ne pas avoir à les remesurer. Tous relevés le 2026-09-06 sur le commit `11758de`.

### A.1 Longueur du glossaire (`src/content/glossary.ts`), en mots

| Terme | EN définition | EN extended | **EN total** | **FR total** |
|---|---|---|---|---|
| upsell-cross-sell | 17 | 59 | **76** | 92 |
| retention | 14 | 74 | **88** | 105 |
| ltv | 16 | 72 | **88** | 106 |
| aha-moment | 15 | 74 | **89** | 99 |
| onboarding | 20 | 69 | **89** | 92 |
| acquisition | 9 | 81 | **90** | 107 |
| cac | 14 | 76 | **90** | 102 |
| north-star-metric | 18 | 74 | **92** | 112 |
| churn | 15 | 78 | **93** | 105 |
| referral | 15 | 79 | **94** | 106 |
| activation | 20 | 79 | **99** | 104 |
| growth-loop | 20 | 82 | **102** | 108 |
| aarrr | 19 | 84 | **103** | 117 |
| revenue | 20 | 84 | **104** | 115 |
| viral-coefficient | 22 | 83 | **105** | 112 |
| **Total** | | | **1 402** | **1 582** |

Corps rendu des autres pages : landing 59 mots (EN) / 62 (FR) ; `/how-it-works` 320 / 340 ; index du glossaire 291 / 314.

### A.2 Métadonnées émises (HTML prérendu au commit `11758de` — la PR #58 a corrigé les quatre premiers points depuis, voir R2-06/R2-07)

- Titre de landing : « Tour de Growth », 14 caractères, hérité par `/quiz` et `/deep-dive/[id]`.
- Descriptions anglaises servies sur `/fr`, `/fr/how-it-works`, `/fr/glossary`.
- Titres de terme identiques FR/EN : 13 sur 15 (seuls `aha-moment` et `viral-coefficient` ont un `term` localisé).
- Descriptions hors gabarit : `growth-loop` FR 179 caractères, `viral-coefficient` FR 179, `aarrr` FR 163, `acquisition` EN 55.
- Balises `og:*` / `twitter:*` sur les pages de contenu : 0. JSON-LD : 1 bloc (`WebApplication`, landing, identique FR/EN).
- Canonical, `hreflang` en/fr, `x-default` : présents et corrects sur les 36 URL. `<html lang>` correct dans les deux arbres.
- Sitemap : 36 URL, `changefreq` + `priority` présents, `lastmod` absent, `x-default` absent.

### A.3 Lighthouse (build local, `next start`, émulation mobile, Chromium 1194)

| Page | Performance | Accessibilité | Bonnes pratiques | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/en` | 96 | 100 | 96 | 100 | 2,7 s | 0 | 40 ms |
| `/quiz` | 96 | 100 | 96 | 100 | 2,8 s | 0 | 30 ms |
| `/r/sample` | 97 | 100 | 96 | 63 (`noindex`, attendu) | 2,7 s | 0 | 30 ms |
| `/en/glossary/cac` | 97 | 100 | 96 | 100 | 2,5 s | 0 | 40 ms |

Le LCP est le H1 en Stardos Stencil dans les quatre cas. Polices : 4 fichiers préchargés, 82 432 octets au total (Inter variable 48 Ko, Stardos Stencil 14 Ko, IBM Plex Mono 500 et 600 à 10 Ko chacun), `display: swap`, sous-ensemble `latin` suffisant pour le français (plages unicode vérifiées dans le CSS émis).

### A.4 Bundles (Next 16.3.3 n'imprime plus les tailles ; mesuré sur disque)

- `.next` : 77 Mo ; `.next/static` : 1,5 Mo ; `.next/static/chunks` : 892 Ko sur 20 fichiers.
- Cinq plus gros chunks : 222,6 Ko · 157,4 Ko · 110,0 Ko · 63,7 Ko · 45,9 Ko (CSS).
- JavaScript total d'une page de contenu : 9 chunks, ~578 Ko bruts / ~176 Ko gzip — le plancher React 19 + App Router pour une page avec un îlot client.
- Chunk propre à une page de terme : 19 020 octets bruts / 7 689 gzip, contenant tout `UI_STRINGS` (chaînes « Drafting your race report », « dead last », « Roast Mode » et leurs équivalents FR retrouvées dedans).
- Chaîne `extended` du glossaire (« Dave McClure ») retrouvée dans les chunks de `/quiz` et `/r/[id]`.

### A.5 Couverture unitaire (`@vitest/coverage-v8`, non committé)

Sur les fichiers importés par au moins un test : 95,6 % lignes, 93,4 % instructions, 90,1 % branches, 94,7 % fonctions.

Fichiers de `src/lib`, `src/app/api` et `src/proxy.ts` **jamais importés par un test** : `submissions/growth-stats.ts` (97 lignes), `submissions/repository.ts` (82), `submissions/cached-repository.ts` (57), `firebase/admin.ts` (41), `i18n/resolve-request-locale.ts` (21), `site.ts` (12), `quiz/tone.ts` (7), `submissions/types.ts` (136, types seuls).

Fichiers importés les moins couverts : `rate-limit.ts` 76 % lignes, `api/submissions/[id]/deep-dive/route.ts` 89 %, `owner-token.ts` 90 %, `proxy.ts` 91 %.

### A.6 Maillage interne (liens entrants depuis les pages de contenu, arbre EN)

`/en`, `/en/glossary`, `/en/how-it-works`, `/quiz` : 18 chacun (header + pied de page partout) · `activation`, `retention`, `ltv` : 7 · `cac` : 6 · `acquisition`, `revenue`, `churn`, `onboarding`, `growth-loop` : 5 · `referral`, `aha-moment`, `viral-coefficient`, `upsell-cross-sell`, `north-star-metric` : 4 · **`aarrr` : 3** · `/r/sample` : 1. `/how-it-works` ne lie aucun terme ; le popover de définition ne lie rien.

### A.7 Search Console (propriété `sc-domain:tourdegrowth.com`, 15/08 → 04/09, via SEO Gets)

Total : 1 clic, 50 impressions. Première impression le 29/08 (le jour de la mise en ligne du glossaire étendu).

| Page (URL telle que vue par Google) | Impressions | Position moyenne |
|---|---|---|
| `/` | 4 (1 clic) | 2,8 |
| `/glossary/viral-coefficient` | 14 | 91,6 |
| `/glossary/activation` | 9 | 82,4 |
| `/glossary/aha-moment` | 7 | 82,1 |
| `/glossary/ltv` | 4 | 90,8 |
| `/glossary/upsell-cross-sell` | 3 | 90,0 |
| `/glossary/aarrr`, `/churn` | 2 chacun | 71,5 / 83,5 |
| `/glossary`, `/acquisition`, `/north-star-metric`, `/retention` | 1 chacun | 87 / 82 / 32 / 75 |

Requêtes : `virality coefficient` (7 impressions, pos. 92), `a ha moment` (4, 84), `what is an activation` (3, 80), `activation definition` (2, 83), `activation short form` (2, 89), `virality factor` (2, 93), et une impression chacune pour `a-ha moment`, `activation`, `aha moment meaning`, `airbnb north star metric nights booked` (pos. 32), `churn works`, `viral coefficient`.

Les URL sont encore celles d'avant R-13 (sans préfixe de langue) : la redirection 308 est en place, il faudra vérifier dans quelques semaines que les URL `/en/...` les ont remplacées dans l'index.

### A.8 Production (`curl` sur `https://www.tourdegrowth.com`)

- `/en/glossary/cac` : première requête `x-vercel-cache: PRERENDER`, seconde `HIT` ; `cache-control: public, max-age=0, must-revalidate` ; `set-cookie: tdg_locale=en` sur chaque réponse.
- Canonical, `hreflang` et sitemap sur `https://www.tourdegrowth.com` (donc `NEXT_PUBLIC_SITE_URL` bien réglé) ; l'apex redirige en 308 vers `www`.
- En-têtes de sécurité présents : `strict-transport-security: max-age=63072000` uniquement.
- `/r/sample` : `cache-control: private, no-cache, no-store`, `x-vercel-cache: MISS` (attendu).

### A.9 Dépendances en retard (`npm outdated`)

| Paquet | Installé | Dernière |
|---|---|---|
| `@playwright/test`, `playwright-core` | 1.56.1 | 1.63.0 (épinglage volontaire, R-07) |
| `next` | 16.3.3 | 16.3.4 |
| `@types/react-dom` | 19.2.5 | 19.2.7 |
| `eslint` | 9.39.5 | 10.10.0 (9.39 « no longer supported ») |
| `typescript` | 5.9.3 | 7.0.2 |
| `vitest` | 4.1.11 | 5.0.0 |
| `@types/node` | 22.20.1 | 26.4.1 |

Dépréciations à l'installation : `node-domexception@1.0.0`, `glob@10.5.0`, `eslint@9.39.5`.
