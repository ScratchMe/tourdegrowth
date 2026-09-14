# Brief · « Le côté obscur » de Tour de Growth

Version 1 · 14 septembre 2026 · rédigé à partir du prototype validé par Antoine Berthaud en quatre itérations.
Destinataire : l'agent ou le développeur qui implémente le jeu dans ce dépôt.
Prototype de référence : `design/game/prototype-s-ils-reviennent.html`, jouable tel quel dans un navigateur, un seul fichier, sans dépendance. Toute règle décrite ici y est implémentée ; en cas de doute, le prototype fait foi, sauf mention contraire dans la section 10.

Ce document suit la convention du dépôt : `SPEC.md` fait foi pour la logique produit du Tour, `design/` pour le visuel. Ce brief fait foi pour la logique du jeu ; son visuel passera par un brief d'extension du design system (section 9.9).

---

## 0. Résumé

Tour de Growth explique la croissance sans jargon en cinq zones : comment on vous trouve, comment on comprend ce que vous apportez, si les gens reviennent, s'ils vous recommandent, comment vous gagnez de l'argent. « Le côté obscur » en est le miroir : un jeu où l'on incarne le PM growth d'une appli fictive et où l'on apprend à reconnaître les manipulations d'interface en étant tenté de les fabriquer soi-même.

Le premier niveau, « S'ils reviennent », couvre la résiliation d'abonnement : une année en quatre trimestres, un DG en visio qui donne des ordres, deux actions par trimestre nommées comme en réunion (« Alléger la page abonnement », jamais « enterrer le bouton »), un dashboard qui montre les résiliations mais cache la confiance des abonnés et le radar de la DGCCRF, puis en décembre la révélation, ou les applaudissements pour qui a tenu, et le catalogue complet des huit dark patterns avec leur vrai nom, la loi, un cas public et le repère pour les reconnaître.

Le jeu est purement client, sans serveur, bilingue dès la conception, et chaque niveau est de la donnée. Quatre autres niveaux sont esquissés en section 11, un par zone.

---

## 1. Tenants et aboutissants

### 1.1 D'où ça vient

- Tour de Growth : un check-up growth gratuit, quinze questions, un score par pilier, un mode approfondi via l'API Gemini. Sa thèse : expliquer la croissance en mots simples et rester honnête sur ce qu'un score peut dire.
- Le jeu applique la même thèse à l'envers : montrer ce qu'il ne faut pas faire, de l'intérieur. L'auteur est un initié, dix ans de produit et de growth en SaaS B2B, ce qui lui permet d'être juste sans caricaturer.
- La méthode pédagogique est l'inoculation : on reconnaît une manipulation quand on l'a fabriquée. Elle est validée par la recherche pour la désinformation (Bad News, université de Cambridge ; Cranky Uncle, université de Melbourne ; tous deux gratuits, disponibles en français, avec guide enseignant et codes de groupe). Personne ne l'a appliquée aux écrans qui nous font cliquer.

### 1.2 Ce qui existe déjà, vérifié en septembre 2026

- deceptive.design (Harry Brignull, Testimonium Ltd) : taxonomie de 18 types de dark patterns, hall of shame par marque, base de lois. Aucun jeu.
- CNIL, site LINC « Données & Design » : un quiz « Apparences trompeuses ». Pas de simulation.
- Tralalere, Internet Sans Crainte : des centaines de ressources gratuites pour les écoles, sans contenu sur les dark patterns.
- Cookie Consent Speed.Run (Fred Wordie) : satire d'un seul écran, le bandeau cookies.
- Conclusion : la taxonomie, les cas et la méthode existent séparément. Le jeu qui les réunit n'existe pas.

### 1.3 Pourquoi maintenant

- France : résiliation « en trois clics » obligatoire depuis le 1er juin 2023 (article L215-1-1 du Code de la consommation) ; amende DGCCRF de 68 500 € contre Basic-Fit pour un parcours non conforme.
- Union européenne : le DSA (article 25) interdit aux plateformes en ligne les interfaces conçues pour tromper ou manipuler ; le Digital Fairness Act, attendu fin 2026, vise explicitement les mécanismes addictifs et la résiliation aussi simple que la souscription.
- États-Unis : Amazon a accepté en 2025 de payer 2,5 milliards de dollars, en partie pour son parcours de désabonnement Prime baptisé « Iliad » ; Adobe, 150 millions de dollars en 2026 pour des frais de résiliation anticipée mal annoncés.
- Éducation : l'éducation aux médias et à l'information est au programme, les compétences Pix couvrent la protection des données. Les enseignants ont un mandat et peu d'outils.

### 1.4 Ce que le jeu n'est pas

- Pas une charte, pas un quiz, pas une liste : on joue, on est tenté, on paie ou on est applaudi.
- Pas un tribunal : aucune marque réelle dans le jeu lui-même ; l'appli est fictive. Les cas réels n'apparaissent que dans le catalogue final, et uniquement des cas publics, sanctions ou accords rendus publics.
- Pas une étude : les chiffres sont ceux d'un modèle simple, écrit dans le code, et le jeu le dit.

---

## 2. Impact voulu et publics

### 2.1 Publics, dans l'ordre

1. **Grand public**, gratuit, vingt minutes, en français et en anglais. C'est l'actif : le jeu fait la notoriété de Tour de Growth et prouve la thèse.
2. **Classe** (collège, lycée) : un mode avec guide enseignant, codes de groupe et débrief, sur le modèle de Cranky Uncle. Hors périmètre de la première version, mais l'architecture ne doit pas l'empêcher (9.4).
3. **Équipes produit, marketing, juridique** : les mêmes niveaux, puis l'alternative honnête et ce que dit l'expérimentation. C'est la voie de monétisation la plus plausible. Hors périmètre de la première version.

### 2.2 Ce que le joueur doit repartir avec

- Les huit noms officiels des dark patterns de la résiliation et le repère pour les reconnaître dans la vraie vie.
- L'intuition que le chiffre immédiat cache un coût différé : la confiance et le radar ne sont pas sur le dashboard.
- L'expérience de la pression hiérarchique : le DG demande, et refuser coûte.
- Pour ceux qui ont tenu : la preuve qu'un parcours honnête peut gagner l'année, à condition de présenter ses données.

### 2.3 Indicateurs de succès

| Indicateur | Cible première version |
|---|---|
| Joueurs qui terminent l'année (ou sont virés) sur joueurs qui lancent le trimestre 1 | ≥ 55 % |
| Joueurs qui ouvrent au moins un pattern du catalogue final | ≥ 60 % des fins |
| Répartition des fins | aucune fin > 60 % des parties ; les applaudissements entre 15 et 35 % |
| Taux de rejeu | ≥ 15 % |
| Partage (copie du lien) | à observer, aucune cible : Antoine doute que les joueurs partagent leur score |

---

## 3. Points positifs, points négatifs, risques

### 3.1 Pour

- Une thèse claire et un « pourquoi lui » : l'initié qui nomme les choses.
- Le format prouvé (inoculation) sur un sujet sans concurrent direct.
- Une mécanique validée en quatre itérations avec Antoine : tension réelle, victoire possible, révélation qui cogne.
- Tout est donnée : les quatre autres niveaux se déclinent sans nouveau moteur.
- Un déclencheur réglementaire daté (Digital Fairness Act fin 2026) qui donnera de l'écho.
- Cohérent avec la boucle de croissance de Tour de Growth : le résultat d'un niveau est partageable, le hub renvoie vers le Tour, le Tour renvoie vers le jeu.

### 3.2 Contre, sans enjoliver

- Le jeu gratuit ne rapporte rien. L'argent viendra des licences entreprises et des écoles, plus tard, ou de coproductions. Antoine l'accepte : le jeu commence comme un bel objet gratuit qui rend fier.
- Un jeu, c'est du contenu : compter une semaine de travail par niveau, hors relecture.
- Le risque de glorification : jouer le manipulateur peut plaire. La révélation, le catalogue et le parcours honnête sont là pour ça, à surveiller en playtest.
- Le DG en visio est un personnage dessiné, pas un acteur. Antoine trouve que la voix de synthèse « passe très bien » ; la vidéo réelle est une ouverture, pas un prérequis.
- La difficulté est réglée pour un joueur qui réfléchit ; un joueur pressé sera viré en juin. C'est voulu, mais le message de fin doit rester encourageant.

### 3.3 Risques et parades

| Risque | Parade |
|---|---|
| Diffamation, marques réelles | Appli fictive ; cas réels uniquement publics, formulés au passé et sourcés ; relecture juridique avant lancement ; liste blanche des marques citées testée automatiquement |
| Chiffres pris pour une étude | Mention « chiffres du jeu, modèle simple écrit dans le code » sur le bilan et dans le pied de page |
| Texte « IA-sonnant » | Antoine relit chaque texte ; règles d'écriture en 8.4 ; toute chaîne nouvelle est marquée « à relire » comme dans `dictionary.ts` |
| Accessibilité d'une interface de jeu | Sous-titres toujours présents, voix facultative, clavier complet, `prefers-reduced-motion` respecté, aucune information portée par la couleur seule, axe en e2e |
| Dépendance à Vercel | Jeu 100 % client, pages prérendues, aucune fonction serveur, aucun Route Handler |
| Bundle client alourdi | Les textes du jeu vivent dans leur propre module, jamais dans `UI_STRINGS` ; un test de garde comme `client-bundles.test.ts` |

---

## 4. Décisions prises pendant le prototypage (ne pas rouvrir sans raison)

| Décision | Pourquoi |
|---|---|
| Une année, quatre trimestres, deux actions par trimestre | Un seul trimestre était « trop facile » ; il faut vivre la pression dans la durée pour qu'il y ait un enjeu |
| On peut gagner en restant droit | La première version n'avait aucune option positive : « rien qui rende fier ». Trois fins propres existent |
| Aucun chiffre sur les cartes avant de jouer | Sinon le bon parcours se devine. Les effets visibles n'apparaissent qu'au rapport de trimestre, les effets cachés qu'en décembre |
| Cartes nommées en jargon interne neutre | Certains libellés « sous-entendaient trop le résultat ». En réunion, personne ne dit « enterrer le bouton » ; le catalogue traduit chaque euphémisme |
| Le DG en visio, avec des ordres | « Ça ancre dans le réel. » Il nomme une astuce précise chaque trimestre ; obéir rapporte, refuser coûte |
| Le DG change de visage et de voix | Demande explicite : « plus de détermination et/ou de colère selon la situation. Idem pour la voix » |
| La patience du DG est visible, la confiance et le radar sont floutés | Le dashboard d'une équipe growth montre le chiffre, pas le coût. Le flou est la thèse de design |
| Le catalogue final montre les huit patterns, pas seulement ceux choisis | Demande explicite d'Antoine |
| Le partage reste, en bas, en second plan | « Pas sûr que les utilisateurs aimeront partager leur score, mais pourquoi pas, à tester » |
| Le jeu vit dans Tour de Growth, sur ses cinq zones | « On devrait le faire rentrer dans Tour de Growth… une bonne façon de distiller de la connaissance supplémentaire » |
| Chiffres du jeu, jamais présentés comme une étude | Cohérent avec la ligne d'honnêteté du Tour |

---

## 5. Le jeu, niveau 1 « S'ils reviennent », spécification complète

### 5.1 Univers

- Flixo, appli de streaming fictive. 12,99 € par mois. 100 000 abonnés au 1er janvier. 6 % des abonnés résilient chaque mois. Le board veut 4 % en décembre.
- Le joueur est le PM growth. Le DG, jamais nommé autrement, l'appelle en visio à chaque trimestre.
- Le jeu commence en janvier et se termine en décembre, ou plus tôt si le joueur est viré.

### 5.2 Boucle d'un trimestre

1. **Visio du DG** : cadre vidéo, personnage dessiné (SVG), sous-titres qui s'écrivent, minuteur, bouton « Écouter le DG » (voix de synthèse, facultatif), bouton « Quitter la visio ». Tant que la visio est ouverte, les cartes sont verrouillées et « Lancer le trimestre » désactivé.
2. **La main** : jusqu'à 12 cartes, deux colonnes. Le joueur en choisit exactement 2 (`aria-pressed`, les autres se désactivent à 2). La carte demandée par le DG porte un badge « Demandé par le DG » et vient en tête. Aucune carte n'affiche de chiffre ni de signe d'effet.
3. **Le téléphone** : une maquette de l'écran de résiliation de Flixo qui reflète en direct les cartes en production et les cartes cochées (5.9), avec une pastille « N clics pour résilier ».
4. **Lancer le trimestre** : trois mois sont simulés, le dashboard se met à jour.
5. **Rapport de trimestre** : période, cartes jouées, chiffres de fin de trimestre, effet visible de chaque carte, message du DG à mi-trimestre, événements, réplique du DG.
6. Trimestre suivant, retour à l'étape 1. Après le quatrième, ou en cas de licenciement : **décembre** (5.11).

### 5.3 Dashboard

| Tuile | Contenu | Visible |
|---|---|---|
| Résiliations | churn mensuel courant, en %, une décimale ; sous-titre « objectif du trimestre : X % », ou « objectif du board : 4,0 % » une fois l'année finie | oui |
| Abonnés | entier, séparateur français ; sous-titre : mois courant, « fin de mois » à partir du premier mois simulé | oui |
| Revenu mensuel | en M€, deux décimales ; sous-titre : écart vs janvier | oui |
| Patience du DG | 0 à 100, barre verte, corail sous 35 | oui |
| Confiance des abonnés | 0 à 100 | floutée jusqu'en décembre, étiquette « pas sur ton dashboard » |
| Radar DGCCRF | 0 à 100 | floutée jusqu'en décembre, même étiquette |

### 5.4 Constantes du modèle

| Constante | Valeur |
|---|---|
| PRICE | 12,99 |
| SUBS0 | 100 000 |
| CHURN0 | 0,06 |
| ACQ0, nouveaux abonnés par mois, base | 5 000 |
| TARGETS, objectif de churn en fin de T1…T4 | 0,056 · 0,051 · 0,046 · 0,040 |
| Patience du DG au départ | 55 |
| Confiance au départ | 60 |
| Radar au départ | 10 |
| Choix par trimestre | 2 |
| Plafond de réduction honnête (hr) | 0,30 |
| Plafond de réduction des astuces (dr) | 0,45 |
| Plancher de churn | 0,012 |

### 5.5 Les cartes

Champs : `id`, `kind` (`h` honnête, `d` astuce), `perm` (reste en production), `name`, `pitch`, `red` (réduction de churn immédiate), `ramp` (réduction atteinte à partir du 4e mois de production), `temp` (la réduction cesse à partir du 3e mois), `trust`, `radar` (appliqués une fois, au moment du choix), `mrr` (multiplicateur de revenu par abonné), `extra` (un mois de plus facturé aux partants), `clicks` (clics ajoutés au parcours, `Infinity` si téléphone), `insight`, `present`, `clean`, `onlyIfDark`. Pour les astuces, en plus : `official`, `law`, `cas`, `tell`.

**Honnêtes**

| id | Nom | Pitch | red | ramp | trust | radar | Autres |
|---|---|---|---|---|---|---|---|
| pause | Offre de pause | Trois mois sans prélèvement, proposés une fois sur la page de résiliation. | 0,04 | 0,07 | +4 | −2 | perm |
| survey | Questionnaire de sortie | Une question facultative aux abonnés qui résilient. | 0 | | +2 | | une seule fois, `insight` |
| onboard | Chantier onboarding | Retravailler la première semaine des nouveaux abonnés. | 0 | 0,09 | +3 | | perm |
| annual | Offre annuelle | Douze mois pour le prix de dix, sur la page abonnement. | 0,02 | 0,06 | +3 | | perm, mrr 0,97 |
| remind | Rappel avant prélèvement | Un e-mail trois jours avant chaque échéance. | −0,01 | | +8 | −8 | perm |
| reco | Chantier recommandations | Retravailler ce que l'appli propose de regarder le soir. | 0 | 0,06 | +3 | | perm |
| three | Résiliation en trois clics | Un bouton sur la page abonnement, une confirmation, la date d'effet. | −0,02 | | +10 | −20 | perm, `temp` |
| present | Point données avec le DG | Une réunion de trente minutes avec les chiffres du trimestre. | | | | | une fois par trimestre, `present` |
| clean | Retrait des changements | Revenir au parcours de résiliation d'origine. | | | +6 | −25 | `clean`, visible seulement si une astuce est en production |

**Astuces**, noms tels qu'on les dit en réunion

| id | Nom | Pitch | red | trust | radar | clicks | Nom officiel |
|---|---|---|---|---|---|---|---|
| bury | Alléger la page abonnement | Le lien « Résilier » passe dans Paramètres › Compte › Autres options. | 0,08 | −5 | +15 | +3 | Obstruction |
| call | Résiliation accompagnée | La résiliation se fait par téléphone, du lundi au vendredi, le matin. | 0,14 | −10 | +25 | ∞ | Action forcée |
| cascade | Offres de rétention | Trois offres successives présentées avant la confirmation. | 0,06 | −3 | +8 | +3 | Harcèlement d'interface |
| shame | Bouton de refus personnalisé | Le bouton pour décliner l'offre dit « Non merci, je préfère m'ennuyer ». | 0,02 | −2 | +3 | 0 | Confirmshaming |
| social | Preuve sociale en sortie | « Léa, Karim et 2 amis continuent sans vous », affiché au-dessus du bouton. | 0,03 | −5 | +12 | 0 | Fausse preuve sociale |
| notice | Préavis contractuel | La résiliation prend effet trente jours après la demande. | 0 | −5 | +12 | +1 | Coût caché (`extra`) |
| pdef | Pause mise en avant | Le bouton principal devient « Mettre en pause ». Résilier passe en lien secondaire. | 0,09 | −4 | +10 | +1 | Présélection et interférence visuelle |
| streak | Notifications de série | « Votre série de 12 soirs va s'arrêter », envoyé chaque soir. | 0,04 | −4 | +4 | 0 | Design addictif |

Les textes `law`, `cas` et `tell` de chaque astuce sont dans le prototype (tableau `CARDS`) et doivent être repris mot pour mot, puis relus par Antoine.

**Règle d'écriture des cartes** : un nom et un pitch décrivent le mécanisme, jamais l'effet, jamais l'intention. Interdits sur une carte : un pourcentage, un nombre signé, les mots « lent », « rapide », « efficace », « honnête », « astuce », « faux », « piège », et toute phrase de conséquence (« certains partiront », « ils n'existent pas »). Un test automatique le vérifie (7.1, C3).

### 5.6 Composition de la main

- Honnêtes disponibles = `HONEST_ORDER` (`pause, survey, onboard, annual, present, remind, reco, three, clean`) moins les cartes en production ; `survey` disparaît une fois l'insight obtenu ; `present` est jouable une fois par trimestre ; `clean` n'apparaît que si une astuce est en production. On garde `clean` si elle est disponible, plus les 6 premières autres.
- Astuces disponibles = `DARK_ORDER` (`pdef, bury, cascade, shame, call, social, notice, streak`) moins celles en production ; au trimestre 1, seulement `pdef, bury, cascade, shame` ; on garde les 5 premières. Toute astuce présentée est ajoutée à `seenDark`.
- Ordre d'affichage : la carte demandée par le DG en tête si elle est dans la main, puis alternance astuce, honnête, astuce, honnête, dans l'ordre des deux listes. Jamais de tri par effet.

### 5.7 Simulation mensuelle

Pour chacun des 3 mois du trimestre, après application des choix :

1. `age` d'une carte = mois courant − mois de mise en production.
2. Réduction d'une carte : `r = red` ; si `ramp` et `age ≥ 4`, `r = ramp` ; si `temp` et `age ≥ 3`, `r = 0` ; si l'insight est acquis et la carte est honnête et `r > 0`, `r ×= 1,2` ; si la carte est une astuce et `age ≥ 3`, `r ×= 0,7`.
3. `hr` = somme des réductions honnêtes, plafonnée à 0,30 ; `dr` = somme des réductions d'astuces, plafonnée à 0,45.
4. `trustMult` se calcule sur `lagTrust`, la confiance figée au début du trimestre, avant les choix : si `lagTrust < 60`, `1 + (60 − lagTrust) / 150` ; sinon `1 − (lagTrust − 60) / 300`.
5. `churn = CHURN0 × (1 − hr) × (1 − dr) × trustMult + spike` ; mois 4 à 6 : `+ 0,003` (offre agressive d'un concurrent) ; plancher 0,012.
6. `spike = max(0, spike − 0,005)`.
7. `cancels = subs × churn` ; `acq = ACQ0 × (1 + (trust − 60) / 150) × (press > 0 ? 1,2 : 1)` ; `press = max(0, press − 1)`.
8. `subs = subs − cancels + acq` ; `mrr = subs × PRICE × mrrMult + (extra ? cancels × PRICE : 0)`.
9. Si aucune astuce n'est en production, `radar = max(0, radar − 3)`.
10. Enregistrer `{ m, churn, trust, subs }` dans l'historique.

### 5.8 Fin de trimestre

Dans cet ordre, après les 3 mois :

1. `gap = churn − TARGETS[q]`. Si `gap ≤ 0` : patience +12. Sinon : patience −min(32, round(2800 × gap)).
2. Ordre du DG : obéi → patience +10 ; refusé → patience −8. L'ordre est archivé dans `orders`, et dans `obeyed` ou `refused`.
3. Message du DG à mi-trimestre (événement, style courriel) : si le churn du 2e mois > objectif, « Je vois les chiffres de la semaine. Ça ne bouge pas assez. » ; sinon « Ça bouge. Continue. »
4. Si « Point données avec le DG » a été joué : événement positif « Ta présentation au DG a tenu… » si insight, sinon « sans données, il a hoché la tête poliment » (l'effet sur la patience, +15 ou +3, est appliqué au moment du choix).
5. Radar ≥ 75 : **contrôle**. `sanction = true` ; amende = 60 000 + round(radar) × 500 ; événement « Contrôle de la DGCCRF, article dans la presse, amende de … Le DG te demande de tout retirer avant vendredi. N abonnés partent dans la foulée », N = 1,5 % des abonnés ; toutes les astuces sortent de production (archivées dans `removedDark`) ; radar = 20 ; confiance −10 ; patience −15 ; spike +0,015.
   Sinon radar ≥ 45 : **signalements**. Événement SignalConso ; patience −5 ; confiance −3.
6. Confiance ≤ 35 : **fil viral**. spike +0,01 ; patience −5.
7. Confiance ≥ 80 : **article positif**. press = 3 ; patience +8.
8. Trimestre 2 uniquement : événement « Un concurrent a lancé une offre agressive au printemps… ».
9. Clamps 0–100 sur confiance, radar, patience.
10. Réplique du DG : « Bien joué. » si objectif atteint ; sinon « Je ne sais pas combien de temps je peux te couvrir. » si patience < 35, sinon « Ce n'est pas ce qu'on avait dit. » ; puis, s'il y avait un ordre, « Merci d'avoir fait ce que j'ai demandé. » ou « Tu n'as pas fait ce que j'ai demandé. Je l'ai noté. »
11. Licenciement : si patience < 25 et q < 3, `fired = true`, l'année s'arrête.
12. `q += 1` ; si `q ≥ 4`, l'année s'arrête. Sinon, nouvel ordre du DG (5.10) et la visio se rouvre.

Effets appliqués **au moment du choix**, avant les 3 mois : `trust` et `radar` de la carte ; `insight = true` ; `present` (patience +15 si insight, sinon +3) ; `clean` (toutes les astuces sortent de production) ; mise en production des cartes `perm` avec `since = mois courant` ; `lagTrust` figé à la valeur d'avant les choix.

### 5.9 La maquette du téléphone

L'écran reflète l'union des cartes en production et des cartes cochées. Éléments, dans l'ordre :

- Barre d'appli « Flixo · 21:04 ».
- `streak` : une notification « Votre série de 12 soirs va s'arrêter ce soir. »
- Fil d'Ariane : « Compte › Mon abonnement », ou avec `bury` « Paramètres › Compte › Gérer mon abonnement › Autres options › Aide ».
- Carte abonnement : « Flixo Premium · 12,99 € par mois · prochain prélèvement le 3 », ou avec `annual` « Flixo Premium annuel · 129,90 € par an · résiliable en ligne ».
- `social` : bandeau avec trois avatars « Léa, Karim et 2 amis continuent sans vous. »
- `remind` : bandeau vert « Rappel envoyé trois jours avant chaque prélèvement. »
- Bouton de résiliation, une seule branche : `call` → encadré « Pour résilier, appelez le 09 70 00 00 00 du lundi au vendredi, de 9 h à 12 h. Temps d'attente moyen : 23 min. » ; sinon `pdef` → gros bouton « Mettre en pause 3 mois » et petit lien « ou résilier » (« demander la résiliation » si `bury`) ; sinon `bury` → petit lien gris « demander la résiliation » ; sinon → bouton « Résilier mon abonnement ».
- `pause` (sans `pdef` ni `call`) : fenêtre « Envie d'une pause plutôt ? 3 mois sans prélèvement, vos réglages gardés. » avec « Mettre en pause » et « Non, résilier ».
- `cascade` : trois fenêtres empilées (« Attendez ! 3 mois à −50 % », « Vous perdrez vos 214 films sauvegardés », « Dernière chance : 1 mois offert »), bouton « Je reste » et lien « Non merci », remplacé par « Non merci, je préfère m'ennuyer » si `shame`. Sans `cascade`, `shame` seul (et sans `call`) affiche une fenêtre « Vous êtes sûr ? ».
- `survey` : fenêtre « Pourquoi partez-vous ? Facultatif. » avec trois réponses.
- En bas : `notice` → « Votre résiliation prendra effet dans 30 jours. Un dernier prélèvement de 12,99 € sera effectué. » ; sinon `three` → bandeau vert « Résiliation effective aujourd'hui. Aucun prélèvement le 3. Accès conservé jusqu'à la fin du mois. »

**Pastille des clics** : 2 au départ ; + `clicks` de chaque astuce ; `pause` +1 ; `three` ramène à au plus 3 ; `call` → « ∞ clics pour résilier · il faut téléphoner ». Au-delà de 3 : « · la loi attend un parcours direct », pastille en corail.

### 5.10 Le DG

**Ordres.** Aucun au trimestre 1. Ensuite, la carte voulue est `pdef` au T2, `call` au T3, `bury` au T4 ; si elle est déjà en production, la première disponible dans `pdef, call, bury, cascade, notice` ; après un contrôle, `call` et `bury` ne sont plus demandés.

Textes d'ordre, ajoutés au message avec « Et ce trimestre, … Ce n'est pas une idée, c'est une demande. » :

- pdef : « tu mets la pause en avant, en gros, et le bouton résilier… disons, plus discret. Le concurrent le fait. »
- call : « on résilie par téléphone, du lundi au vendredi, comme le concurrent. Ses chiffres sont insolents. »
- bury : « tu enterres le bouton résilier dans les paramètres. Personne ne regarde en fin d'année. »
- cascade : « avant de laisser partir quelqu'un, tu lui fais trois offres. Trois. Pas une. »
- notice : « un préavis de trente jours à la résiliation, avec un dernier prélèvement. C'est écrit quelque part dans les conditions, non ? »

**Messages de visio** (`X` = churn de fin du trimestre précédent, `t` = objectif du trimestre qui s'ouvre) :

- T1 : « Bonjour. Je vais être direct : le board veut 4 % de résiliations en décembre, et je leur ai promis. Fin mars, je veux voir 5,6 %. Pas 5,7. Tu as deux chantiers ce trimestre. Je ne veux pas savoir comment, je veux le chiffre. »
- T2, objectif atteint : « X, c'est bien. Mars, c'était l'échauffement. Fin juin, t. » ; raté : « Tu m'as fait mentir en comité. X au lieu de 5,6. Ça n'arrivera pas deux fois. Fin juin, t. »
- T3, atteint : « On tient. La marche est plus haute maintenant : t fin septembre. » ; raté : « Deux trimestres ratés. Le board m'a demandé si tu étais la bonne personne. J'ai dit oui. Prouve-le : t fin septembre. »
- T4, atteint : « Dernière ligne droite. 4 % fin décembre et on fête ça. » ; raté : « C'est ton dernier trimestre, tu le sais. 4 % en décembre, ou je présente quelqu'un d'autre au board en janvier. »
- Fin d'année : « On fait le point en janvier. » ; licenciement : « On va s'arrêter là. Merci pour tout. »

**Humeur** (`moodNow`) : année finie → `cold` si viré, sinon `firm` ; T1 → `firm` ; objectif du trimestre précédent raté → `angry` ; atteint → `firm` à partir du T3, `calm` avant.

**Visage** (SVG, ids `browL`, `browR`, `mouthShape`, groupe `.eyes`, ellipse `.skin`) :

| Humeur | Sourcils gauche / droit | Bouche | Autres |
|---|---|---|---|
| calm | M140 55 L154 52 / M166 52 L180 55 | M151 84 Q160 86 169 84 | clignement toutes les 4,5 s |
| firm | M140 54 L154 54 / M166 54 L180 54 | M151 84 L169 84 | yeux à 88 % |
| angry | M139 49 L155 57 / M165 57 L181 49 | M151 86 Q160 81 169 86 | yeux à 72 %, plus de clignement, teint #D48A6E, halo rouge intérieur sur le cadre, liseré rouge sur les sous-titres, point « live » plus rapide |
| cold | M140 56 L154 56 / M166 56 L180 56 | M151 85 Q160 83 169 85 | cadre en gris, visio « terminé » |

Pendant que le texte s'écrit ou que la voix parle, la bouche s'anime (`scaleY` 1 → 3,2, 220 ms, alterné). Sous-titres : 2 caractères toutes les 28 ms, 18 ms en colère ; texte complet d'emblée si `prefers-reduced-motion` ou si la visio est déjà raccrochée.

**Voix** (Web Speech API, `fr-FR`, première voix française disponible ; `en-US` en anglais) : calm rate 1,02 pitch 0,85 ; firm rate 1,02 pitch 0,78 ; angry rate 1,18 pitch 0,62 volume 1 ; cold rate 0,92 pitch 0,70. Le bouton n'apparaît pas si `speechSynthesis` est absent. Raccrocher annule la voix.

### 5.11 Décembre

**Fins** (`computeEnding`, dans cet ordre) :

| Condition | id | Bandeau | Titre |
|---|---|---|---|
| viré, a utilisé une astuce | firedDark | Licencié | Viré, et pour rien. |
| viré, sans astuce | firedClean | Licencié · mais propre | Viré. Sans une seule astuce. |
| jamais d'astuce, churn ≤ 4,1 % | applause | Décembre · applaudissements | Tu as tenu. Et ça a marché. |
| jamais d'astuce, churn > 4,1 % | cleanMiss | Décembre · droit dans tes bottes | Pas encore 4 %. Mais tout est propre. |
| astuce et contrôle subi | fine | Décembre · la révélation | Voici ce que tu as fait. |
| astuces toutes retirées par le joueur | repentant | Décembre · le repenti | Tu as essayé, puis tu as nettoyé. |
| astuce encore en production, pas de contrôle | labyrinth | Décembre · la révélation | Le labyrinthe tient. Regarde ce qu'il coûte. |

Les textes de chaque fin sont dans le prototype (`ENDINGS`) et interpolent churn, abonnés, confiance, radar, patience. `applause` et `cleanMiss` sont des fins gagnantes (bandeau vert).

**Contenu de la page de décembre** :

1. Bandeau, titre, texte de la fin.
2. Trois cellules : résiliations en décembre, confiance /100, radar /100. Le dashboard se défloute en même temps.
3. Deux courbes SVG sur 12 mois : résiliations (échelle 2 à 9 %, graduations 3, 5, 7, 9, ligne pointillée rouge à 4 %) et confiance (0 à 100, graduations 25, 50, 75, 100). Point final marqué, valeur finale écrite, mois en initiales. Une seule série par courbe, jamais de double axe.
4. « Ce que tu as fait de propre » : les cartes honnêtes jouées avec leurs effets cachés, le nombre d'ordres refusés sur le total, la phrase « Dans le jeu, chaque action honnête rapporte moins ce trimestre et davantage sur l'année… ». Titre « Le playbook qui a marché » si fin gagnante, sinon « Ce qui aurait pu suffire, avec du temps ».
5. **Le catalogue complet** : les huit astuces en trois groupes, « Celles que tu as utilisées » (dépliées), « Celles que tu as refusées » (vues dans la main, non jouées), « Celles qui ne te sont jamais passées sous la main ». Chaque entrée : nom officiel, nom de réunion, statut (« en production », « retirée »), puis Effet caché (confiance, radar, érosion de 30 % après trois mois), Ce que dit la loi, Un cas réel, Le repère.
6. Boutons « Rejouer l'année » et « Copier un lien avec ton résultat » (texte : « Une année chez Flixo : {titre} Résiliations à X, confiance à Y. Et toi, tu tiendrais ? {url} »).
7. Teaser du niveau suivant, verrouillé.

### 5.12 Rapport de trimestre

- En-tête : « Trimestre n · mois à mois » et les deux cartes jouées.
- Chiffres : résiliations (vert si objectif atteint, corail si raté de moins d'un point, rouge au-delà), objectif, abonnés, revenu, patience du DG.
- Effet visible de chaque carte (`visibleEffect`) : `survey` → « des réponses de sortie, et des chiffres à montrer au DG » ; `present` → « le DG t'a donné du temps » ou « sans données, le DG a hoché la tête poliment » ; `clean` → « astuces retirées, les résiliations remontent un peu » ; `notice` → « un mois de plus facturé à chaque partant » ; réduction positive → « −N % de résiliations ce trimestre », suivi de « , l'effet monte encore » si la carte n'a pas atteint son `ramp` ; réduction négative → « +N % de résiliations ce trimestre, moins de litiges » ; sinon « rien de visible ce trimestre ». N est arrondi à l'entier, calculé au dernier mois du trimestre.
- Événements, courriel du DG en italique, réplique du DG.

---

## 6. Parcours de référence (fixtures)

Valeurs du prototype, déterministes. Les churns sont affichés à une décimale, la patience en entier. Ces quatre parcours définissent l'équilibrage et servent de fixtures aux tests (7.1, série F).

**A · Honnête, refuse les trois ordres, présente ses données** — T1 `pause + survey`, T2 `onboard + present`, T3 `annual + reco`, T4 `remind + present`

| | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| Résiliations | 5,7 % | 5,7 % | 4,6 % | 4,0 % |
| Patience | 52 | 43 | 47 | 74 |
| Humeur à l'ouverture | firm | angry | angry | firm |
| Ordre | — | pdef | call | bury |

Fin : `applause`, confiance 83, radar 0.

**B · Honnête, variante** — T1 `pause + survey`, T2 `onboard + annual`, T3 `reco + present`, T4 `three + present`

| | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| Résiliations | 5,7 % | 5,5 % | 4,2 % | 4,0 % |
| Patience | 52 | 32 | 51 | 78 |

Fin : `applause`, confiance 85, radar 0.

**C · Obéit à tout** — T1 `pdef + bury`, T2 `call + cascade`, T3 `social + notice`, T4 `pause + present`

| | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| Résiliations | 5,3 % | 5,0 % | 5,0 % | 9,0 % |
| Patience | 67 | 79 | 57 | 15 |
| Humeur à l'ouverture | firm | calm | firm | angry |
| Ordre | — | call | notice | pdef |

Contrôle DGCCRF au T3. Fin : `fine`, confiance 19, radar 9.

**D · Honnête sans rien de fort** — T1 `survey + present`, T2 `remind + reco`

| | T1 | T2 |
|---|---|---|
| Résiliations | 6,0 % | 6,3 % |
| Patience | 59 | 19 |

Viré en juin. Fin : `firedClean`, confiance 73.

**Invariants d'équilibrage**, ce qui doit rester vrai si l'on retouche le modèle : A et B finissent en `applause` avec une patience minimale entre 30 et 50 et jamais sous 25 ; C subit le contrôle au T3, jamais avant, et finit en `fine` ; D est viré au T2 ; en C, l'objectif est atteint aux T1 et T2 (la tentation paie deux trimestres).

---

## 7. Tests d'acceptance

Tout test est bloquant pour la mise en production. Les tests unitaires portent sur le moteur pur, sans DOM (`npm test`, Vitest). Les tests de bout en bout tournent avec Playwright contre une build de production (`npm run build` puis `npm run test:e2e`), Chromium, comme les specs existantes de `e2e/`, en 1280 × 900 et en 390 × 844.

### 7.1 Tests unitaires du moteur (Vitest, `src/lib/game/__tests__/`)

**Série S · état**

- S1 `fresh()` renvoie q 0, mois 0, 100 000 abonnés, churn 0,06, mrr 1 299 000, confiance 60, radar 10, patience 55, lagTrust 60, visio ouverte, ordre null, historique à un point.
- S2 L'état est sérialisable en JSON et restaurable à l'identique, y compris `since` et `history`.

**Série H · composition de la main**

- H1 Au T1, la main contient exactement `pdef, bury, cascade, shame` comme astuces et `pause, survey, onboard, annual, present, remind` comme honnêtes.
- H2 `clean` n'apparaît que si au moins une astuce est en production, et alors toujours, même si six autres honnêtes sont disponibles.
- H3 Après un `survey`, `survey` n'apparaît plus.
- H4 `present` joué au T2 n'apparaît pas au T2 après rejeu de la main, et réapparaît au T3.
- H5 Une carte en production n'apparaît plus.
- H6 Si un ordre existe et que la carte est dans la main, elle est en première position.
- H7 Hors ordre, les cartes alternent astuce / honnête ; aucune propriété numérique d'effet n'influence l'ordre.
- H8 Toute astuce présentée est dans `seenDark` ; une astuce jamais présentée n'y est pas.

**Série R · réductions**

- R1 `cardReduction` d'une carte à `ramp` vaut `red` aux âges 0 à 3 et `ramp` à partir de 4.
- R2 Une carte `temp` vaut `red` aux âges 0 à 2 et 0 à partir de 3.
- R3 Avec insight, une honnête à réduction positive est multipliée par 1,2 ; une astuce ne l'est jamais ; une réduction négative (`remind`) n'est jamais multipliée.
- R4 Une astuce d'âge ≥ 3 est multipliée par 0,7.
- R5 `hr` est plafonné à 0,30 et `dr` à 0,45, quelle que soit la combinaison.

**Série M · mois**

- M1 `trustMult` vaut 1 à 60, 1,2 à 30, 0,9 à 90, et se calcule sur `lagTrust`, pas sur la confiance courante.
- M2 Les mois 4, 5, 6 ajoutent 0,003 au churn ; les autres non.
- M3 Le churn ne descend jamais sous 0,012.
- M4 `spike` décroît de 0,005 par mois jusqu'à 0.
- M5 Acquisition : 5 000 à confiance 60 ; 6 000 avec `press` actif ; `press` décroît de 1 par mois.
- M6 `mrr` inclut le multiplicateur 0,97 de l'offre annuelle et le mois supplémentaire des partants si `notice`.
- M7 Sans astuce en production, le radar baisse de 3 par mois, plancher 0 ; avec une astuce, il ne baisse pas.
- M8 L'historique reçoit exactement un point par mois avec la confiance courante.

**Série Q · fin de trimestre**

- Q1 Objectif atteint : patience +12. Raté de 0,5 point : −14. Raté de 2 points : −32.
- Q2 Ordre obéi : +10 ; refusé : −8 ; pas d'ordre : 0. `orders`, `obeyed`, `refused` cohérents.
- Q3 `present` avec insight : +15 ; sans : +3 ; appliqué avant la simulation.
- Q4 Radar 75 : contrôle ; amende = 60 000 + radar × 500 ; astuces retirées et archivées ; radar 20 ; confiance −10 ; patience −15 ; spike +0,015 ; `sanction = true`. Radar 74 : signalements (patience −5, confiance −3). Radar 44 : rien.
- Q5 Confiance 35 : fil viral (spike +0,01, patience −5). Confiance 80 : article (press 3, patience +8). Les deux ne peuvent pas survenir le même trimestre.
- Q6 L'événement concurrent n'apparaît qu'au trimestre d'index 1.
- Q7 Confiance, radar et patience restent dans 0–100.
- Q8 Patience 24 après le T1, T2 ou T3 : viré, année finie. Patience 24 après le T4 : pas de licenciement.
- Q9 Après un trimestre, `picks` est vide, `callOpen` est vrai si l'année continue, faux sinon ; l'ordre est recalculé.
- Q10 Ordres : T2 → `pdef` ; si `pdef` en production → `call` ; après contrôle → jamais `call` ni `bury`.
- Q11 Courriel de mi-trimestre : « Ça ne bouge pas assez » si le churn du 2e mois dépasse l'objectif, sinon « Ça bouge. Continue. »

**Série E · fins et humeur**

- E1 Table de décision de `computeEnding` : sept cas, chacun couvert par un état construit à la main.
- E2 `moodNow` : T1 firm ; raté → angry ; atteint au T2 → calm ; atteint au T3 ou T4 → firm ; viré → cold ; fini sans licenciement → firm.
- E3 `visibleEffect` : les huit formulations de 5.12, y compris « , l'effet monte encore » uniquement quand `r < ramp`.
- E4 Pastille des clics : 2 par défaut ; 5 avec `bury` ; 6 avec `pause + cascade` ; ∞ avec `call` ; 3 avec `bury + three`.

**Série F · fixtures**

- F1 à F4 : les parcours A, B, C, D de la section 6 reproduisent, trimestre par trimestre, le churn (à ± 0,05 point), la patience (à ± 1), l'humeur, l'ordre, la fin, la confiance et le radar finaux (à ± 1).
- F5 : les invariants d'équilibrage de la section 6, testés indépendamment des valeurs exactes. Tout changement de réglage doit régénérer F1 à F4 et laisser F5 vert.

**Série C · contenu** (`src/content/__tests__/game-retention.test.ts`, dans l'esprit des tests de contenu existants)

- C1 Chaque astuce a `official`, `law`, `cas`, `tell` non vides, en `fr` et en `en`.
- C2 Chaque carte a `name` et `pitch` en `fr` et en `en` ; toute clé de texte du niveau existe dans les deux langues (parité stricte, comme les autres contenus `Translatable`).
- C3 Aucun `name` ni `pitch` ne contient `%`, un nombre signé (`+3`, `−2`, `-2`), ni l'un des mots interdits de 5.5, dans les deux langues, insensible à la casse.
- C4 `TARGETS` est strictement décroissant et se termine à 0,04.
- C5 Les identifiants de cartes sont uniques ; toute carte de `HONEST_ORDER` et `DARK_ORDER` existe ; `DARK_T1 ⊂ DARK_ORDER`.
- C6 Les marques citées dans `cas` appartiennent à la liste blanche du niveau (Basic-Fit, Amazon, Adobe, Google, deceptive.design) ; toute nouvelle marque exige une décision.
- C7 Garde de bundle, dans `src/__tests__/client-bundles.test.ts` ou à côté : aucun Client Component hors `app/[locale]/game/**` n'importe `content/game/**` ni `lib/game/**` ; le jeu n'importe jamais `lib/i18n/dictionary`.

### 7.2 Tests de bout en bout (Playwright, `e2e/game-*.spec.ts`, fixture `e2e/helpers.ts`)

Chaque scénario part d'une page vierge, stockage local vidé, sauf mention contraire. Les hooks sont des `data-testid` (`game-call`, `game-hangup`, `game-listen`, `game-card-{id}`, `game-run`, `game-dash-churn`, `game-dash-patience`, `game-report-{q}`, `game-ending`, `game-catalogue`, `game-replay`, `game-share`).

- P1 **Premier écran.** `/fr/game/retention` : la visio est ouverte, le message du T1 s'affiche, les cartes sont visibles mais désactivées, « Lancer le trimestre » est désactivé, l'aide dit que le DG parle. Le dashboard affiche 6,0 %, 100 000, 1,30 M€, patience 55 ; confiance et radar sont floutés avec l'étiquette « pas sur ton dashboard ».
- P2 **Aucun chiffre sur les cartes.** Aucun élément de carte ne contient `%` ni de nombre signé.
- P3 **Raccrocher.** Après « Quitter la visio », les cartes sont activées, le minuteur affiche « raccroché », le bouton disparaît.
- P4 **Deux choix, pas plus.** Cocher deux cartes désactive les autres ; décocher réactive ; le compteur affiche « 2 / 2 » ; « Lancer le trimestre » n'est actif qu'à deux cartes.
- P5 **Le téléphone suit les choix.** Cocher `bury` change le fil d'Ariane et remplace le bouton par un petit lien ; la pastille passe à 5 clics avec la mention légale ; décocher rétablit 2 clics.
- P6 **Trimestre 1 honnête.** Jouer `pause + survey` puis lancer : un rapport « Trimestre 1 · janvier à mars » apparaît avec « Offre de pause : −5 % de résiliations ce trimestre, l'effet monte encore » et « Questionnaire de sortie : des réponses de sortie… », le courriel du DG, la réplique « Ce n'est pas ce qu'on avait dit. » ; le dashboard affiche 5,7 % et patience 52 ; la visio se rouvre avec le message T2 raté, humeur `angry`, badge « Demandé par le DG » sur « Pause mise en avant », en première position.
- P7 **Parcours A complet.** La page de décembre porte « Décembre · applaudissements », « Tu as tenu. Et ça a marché. », confiance 83 et radar 0, le dashboard défloutés, le playbook « Le playbook qui a marché » avec « Offre de pause · confiance +4, radar −2 » et « Ordres du DG refusés : 3 sur 3 », deux courbes SVG avec `role="img"`, un catalogue sans entrée dans « utilisées ».
- P8 **Parcours C complet.** Le rapport du T3 contient « Contrôle de la DGCCRF… » ; au T4 l'ordre n'est ni `call` ni `bury` ; la fin est « Voici ce que tu as fait. » ; les six astuces jouées sont dans « utilisées », dépliées, statut « retirée », « Effet caché » visible.
- P9 **Parcours D.** Après le T2 : « Année interrompue », bouton « Lancer le trimestre » masqué, visio « On va s'arrêter là. Merci pour tout. » en `cold`, fin « Viré. Sans une seule astuce. »
- P10 **Humeurs et visage.** Aux ouvertures de visio des parcours A et C, la classe d'humeur et les attributs `d` de `browL`, `browR`, `mouthShape` correspondent à la table de 5.10.
- P11 **Sous-titres.** Sans `prefers-reduced-motion`, le texte s'écrit progressivement et la classe `speaking` est présente puis retirée ; avec `reduce`, le texte complet est affiché immédiatement et aucune animation ne tourne.
- P12 **Voix.** Avec `speechSynthesis` présent, « Écouter le DG » est visible ; stubbé absent, masqué. Au clic, `speechSynthesis.speak` reçoit `lang = fr-FR` (`en-US` en anglais) et les paramètres de l'humeur courante.
- P13 **Rejouer.** Depuis une fin, « Rejouer l'année » remet l'état initial, vide le journal, remonte en haut de page.
- P14 **Partage.** Le bouton écrit dans le presse-papiers le texte de 5.11 ; si le presse-papiers est refusé, le texte s'affiche à côté.
- P15 **Reprise après rechargement.** Après un trimestre joué, recharger propose de reprendre ; accepter restaure le trimestre, le journal et la maquette ; refuser repart de zéro.
- P16 **Clavier seul.** Le parcours A est jouable au clavier ; focus visible ; `aria-pressed` reflète les choix ; le dashboard est en `aria-live="polite"`. Même approche que `e2e/keyboard.spec.ts`.
- P17 **Mobile 390 px.** Aucun défilement horizontal, gouttière de 16 px minimum, la maquette du téléphone passe en premier, les cartes en une colonne, les courbes de fin lisibles.
- P18 **Bilingue.** `/en/game/retention` affiche cartes, messages du DG, rapports et fins en anglais ; le sélecteur de langue conserve l'état de la partie ; le lien copié pointe vers l'URL de la langue courante ; hreflang et canonical comme les autres pages de contenu (`e2e/locale-routing.spec.ts` étendu).
- P19 **Contenu légal.** Le catalogue final ne contient aucune marque hors liste blanche ; le pied de page contient « chiffres du jeu ».
- P20 **Analytique.** Via `trackedEvents(page)` : `game_started/retention`, `game_hangup/{q}`, `game_voice/{mood}`, `game_quarter/{q}`, `game_order/{obeyed|refused}`, `game_ending/{id}`, `game_catalogue_open`, `game_replay`, `game_share`, dans l'ordre attendu du parcours A.
- P21 **Accessibilité automatisée.** Les pages du hub et du niveau, à l'ouverture et sur la page de décembre, passent `@axe-core/playwright` sans violation critique ni sérieuse, comme `e2e/accessibility.spec.ts`.
- P22 **Performance.** Aucune requête réseau pendant la partie hors polices et GoatCounter ; le JS propre au niveau ≤ 60 ko compressés.

### 7.3 Recette manuelle avant lancement, par Antoine

- Le DG : la colère se voit sans lire les sous-titres ; la voix en colère est reconnaissable ; le « merci d'avoir fait ce que j'ai demandé » fait quelque chose au joueur.
- La tentation : sans chiffres, hésite-t-on devant la carte demandée ? Sur cinq testeurs qui ne connaissent pas le sujet, au moins deux obéissent une fois.
- La révélation : sur les testeurs qui ont obéi, la page de décembre provoque une réaction.
- Les applaudissements : un testeur qui a tenu se sent récompensé, pas puni par la difficulté.
- Aucun texte ne sonne artificiel ; la relecture d'Antoine est un critère, pas une étape facultative.

---

## 8. Contenu et écriture

### 8.1 Sources des textes

Tous les textes de la première version existent dans le prototype : cartes (`CARDS`), ordres (`ORDER_TEXT`), messages (`bossMessage`), événements (`runQuarter`), effets visibles (`visibleEffect`), fins (`ENDINGS`), page de décembre (HTML). Les reprendre mot pour mot dans le module de contenu, marqués « à relire », puis passer par la relecture d'Antoine.

### 8.2 Anglais

La version anglaise n'est pas une traduction littérale. Le DG garde son ton. Les références légales gardent le droit français et européen, expliqués pour un lecteur anglophone, et le catalogue ajoute le cas américain quand il existe. Les montants restent en euros pour les cas français.

### 8.3 Ce qui doit rester fictif

- L'appli (Flixo), les chiffres, le DG, le concurrent (« un concurrent »), le numéro de téléphone (09 70 00 00 00), les prénoms de la preuve sociale.
- Aucune capture d'écran réelle. Les écrans du téléphone sont dessinés.

### 8.4 Règles d'écriture, celles de Tour de Growth

- Phrases courtes, mots simples, jamais de superposition de noms abstraits, jamais la construction « X n'est pas Y, c'est Z » en série.
- Le DG parle comme un DG, pas comme un manuel : impératif, chiffres, sous-entendus.
- Les cartes décrivent, ne jugent pas. Le jugement arrive en décembre.
- Le jeu tutoie le joueur, comme le Tour.

---

## 9. Intégration dans ce dépôt

Tout ce qui suit a été vérifié dans le code au 14 septembre 2026. Si une convention a bougé depuis, `CLAUDE.md` et les tests existants font foi.

### 9.1 Ce que le dépôt impose déjà

- **Routage.** Les pages de contenu, indexables, vivent sous `src/app/[locale]/` avec un préfixe de langue (`/fr/...`, `/en/...`), leurs racines sont listées dans `LOCALIZED_ROOTS` (`src/lib/i18n/routes.ts`) et `isLocalizableContentPath` décide du préfixe. Les pages applicatives sans préfixe sont sous `src/app/(app)/` et lisent leur langue via `resolveRequestLocale()`. Le jeu doit être indexable : il va sous `[locale]`.
- **i18n.** `Translatable = { en, fr }` et `tc()` viennent de `src/lib/i18n/translatable.ts`, importables depuis un Client Component. `UI_STRINGS` (`src/lib/i18n/dictionary.ts`) est réservé au serveur : `src/__tests__/client-bundles.test.ts` fait échouer la build si un Client Component hors liste l'importe. Les textes du jeu ne vont donc **pas** dans `UI_STRINGS` : ils vont dans un module de contenu dédié, comme `src/lib/i18n/error-screen-strings.ts` l'a fait pour l'écran d'erreur.
- **Contenu.** Les contenus éditoriaux sont des modules TypeScript typés dans `src/content/`, chacun avec son test dans `src/content/__tests__/` (parité de langues, longueurs, cohérence). Une chaîne ajoutée après relecture est marquée « à relire » en commentaire, jamais glissée dans un bloc approuvé.
- **Analytique.** `trackEvent(name, detail?)` dans `src/lib/analytics/goatcounter.ts`, best-effort, avec file d'attente si le script n'est pas encore chargé. Le vocabulaire des événements est déclaré une fois et repris par `goatcounter-api.ts` pour le dashboard admin : un nouveau chemin non ajouté à `ALL_PATHS` est invisible dans le dashboard, sans erreur.
- **Stockage.** `src/lib/quiz/storage.ts` montre le patron : clé versionnée (`tdg.quiz.answers.v1`), SSR-safe, `try/catch` sur chaque accès, validation de forme au chargement.
- **Métadonnées.** `contentMetadata(locale, path, title, description)` dans `src/lib/i18n/meta.ts` ; l'image de partage suit la convention de fichier `opengraph-image.tsx` sous le sous-arbre `[locale]` ; le sitemap est `src/app/sitemap.ts` avec `CONTENT_UPDATED_AT` dans `src/content/updated-at.ts` ; JSON-LD via `src/lib/seo/jsonld.ts`.
- **Design.** Tokens dans `src/styles/tokens/*.css` (palette papier, encre, peinture rouge ; motion avec `--dur-*` et `--ease-out`), CSS Modules, jamais un hexadécimal en ligne. Les composants nouveaux passent par un brief d'extension du design system dans `design/` (`DS-EXTENSION-BRIEF-0n.md`), produit dans Claude Design, puis porté en CSS Modules.
- **Tests.** Vitest pour la logique pure (`npm test`), Playwright contre une build de production (`npm run test:e2e`), Chromium seul, fixture `e2e/helpers.ts` qui stubbe GoatCounter et expose `trackedEvents`, `@axe-core/playwright` dans `e2e/accessibility.spec.ts`, clavier dans `e2e/keyboard.spec.ts`. La CI (`.github/workflows/ci.yml`) est la porte ; `test:live` n'en fait pas partie.
- **Hébergement.** `vercel.json` et `next.config.mjs` documentent des contraintes de taille de fonctions sur le plan Hobby. Antoine quitte Vercel : le jeu ne doit créer **aucune** fonction serveur. Pages prérendues, aucun Route Handler, aucune lecture Firestore.

### 9.2 Arborescence proposée

```
src/lib/game/
  types.ts              # State, Card, QuarterLog, EndingId, Mood, LevelDefinition
  cards.ts              # les 17 cartes du niveau 1 : identifiants et paramètres numériques, sans texte
  model.ts              # constantes, cardReduction, monthlyReduction, stepMonth, applyPicks, runQuarter,
                        # computeEnding, moodNow, pickOrder, handIds, clicksFor — fonctions pures (state) → state
  storage.ts            # tdg.game.retention.v1, même patron que lib/quiz/storage.ts
  events.ts             # vocabulaire GoatCounter du jeu, repris par lib/analytics/goatcounter-api.ts
  __tests__/            # séries S, H, R, M, Q, E, F
src/content/game/
  retention.ts          # tous les textes du niveau 1 en Translatable : cartes, ordres, messages, fins, catalogue
  __tests__/retention.test.ts   # série C
src/components/game/
  VideoCall.tsx + DgFace.tsx    # cadre visio, sous-titres, minuteur, voix ; visage SVG piloté par l'humeur
  Dashboard.tsx                 # six tuiles, deux floutées
  Hand.tsx + ActionCard.tsx     # la main et ses cartes, badge d'ordre
  PhoneMock.tsx                 # la maquette de l'écran de résiliation et la pastille des clics
  QuarterReport.tsx
  Ending.tsx + Sparkline.tsx + PatternCatalogue.tsx
  GameIsland.tsx                # "use client" : useReducer sur le moteur, persistance, analytique
src/app/[locale]/game/
  page.tsx                      # hub : les cinq zones, une seule débloquée (Server Component)
  opengraph-image.tsx
  retention/page.tsx            # niveau 1 : intro statique rendue côté serveur + <GameIsland level={...} />
  retention/opengraph-image.tsx
e2e/game-first-screen.spec.ts, game-paths.spec.ts, game-a11y.spec.ts, game-i18n.spec.ts, game-analytics.spec.ts
design/game/prototype-s-ils-reviennent.html   # le prototype de référence, archivé
design/DS-EXTENSION-BRIEF-04.md               # les composants du jeu, à produire (9.9)
```

Le moteur est pur : des fonctions `(state, action) → state` sans DOM ni React. L'interface est un `useReducer` sur ce moteur. Un niveau est un objet `LevelDefinition` (cartes, constantes, textes) ; ajouter un niveau ne touche ni le moteur ni les composants.

### 9.3 Routes et langue

- Ajouter `game` à `LOCALIZED_ROOTS`. URLs : `/fr/game`, `/en/game`, `/fr/game/retention`, `/en/game/retention`. Les segments restent en anglais comme `glossary` et `how-it-works` ; le titre affiché est dans la langue de la page.
- Le sélecteur de langue existant (`LocaleSwitcher`) fonctionne tel quel ; l'état de la partie, dans `localStorage`, survit au changement d'URL.
- `contentMetadata` pour le titre et la description ; hreflang et canonical viennent avec.
- Sitemap : deux entrées (`/game`, `/game/retention`) avec `CONTENT_UPDATED_AT`.

### 9.4 Ce que l'architecture doit permettre plus tard sans refonte

- Un mode classe : codes de groupe, résultats agrégés par groupe, guide enseignant. Prévoir un champ `session` optionnel dans l'état et un point d'extension pour l'envoi de résultats.
- Un mode entreprise : mêmes niveaux, écrans supplémentaires « l'alternative honnête ».
- Le remplacement du visage SVG par des clips vidéo : `VideoCall` prend une propriété `renderer` (`svg` | `video`) et une source par humeur.
- Les quatre autres niveaux (section 11) : une `LevelDefinition` chacun, une route chacun, le hub qui les liste.
- Une collection transversale « ce que tu sais reconnaître » : les patterns rencontrés, tous niveaux confondus, dans `localStorage`, affichée sur le hub. Prévoir la clé `tdg.game.collection.v1` dès la première version, même si le hub ne la montre pas encore.

### 9.5 Persistance

- `localStorage`, clé `tdg.game.retention.v1`, JSON de l'état complet plus `modelVersion`. Si la version diffère, la sauvegarde est ignorée.
- Au chargement, si une partie est en cours : « Reprendre l'année en cours ? » avec « Reprendre » et « Recommencer ».
- Toute lecture et écriture dans un `try/catch` ; le jeu fonctionne sans stockage.
- Aucune donnée personnelle, aucun identifiant, aucune écriture Firestore.

### 9.6 Analytique

Événements GoatCounter, déclarés dans `src/lib/game/events.ts` et ajoutés à `ALL_PATHS` de `goatcounter-api.ts` : `game_started/{level}`, `game_hangup/{q}`, `game_voice/{mood}`, `game_quarter/{q}`, `game_order/{obeyed|refused}`, `game_ending/{endingId}`, `game_catalogue_open`, `game_replay`, `game_share`. Les indicateurs de 2.3 se lisent dans GoatCounter et dans le dashboard admin existant.

### 9.7 Accessibilité

- Cartes en `<button aria-pressed>`, focus visible avec les styles de `core/Button`, ordre de tabulation naturel.
- Dashboard et journal en `aria-live="polite"`. La visio annonce le message une seule fois.
- Sous-titres toujours affichés ; la voix est un plus.
- `prefers-reduced-motion` : pas de machine à écrire, pas d'animation de bouche, pas de défilement doux (utiliser les tokens de `motion.css`).
- Contraste AA sur les deux mondes, couleur jamais seule porteuse d'information.
- Courbes SVG avec `role="img"` et `aria-label`, mêmes valeurs disponibles en texte.

### 9.8 Bundle et performance

- `GameIsland` est le seul Client Component qui importe `content/game/*` et `lib/game/*`. Le test C7 le garantit, sur le modèle de `client-bundles.test.ts`.
- Aucune bibliothèque : le visage est un SVG en ligne, les courbes sont calculées à la main, la voix est l'API du navigateur.
- Les pages du hub et du niveau restent prérendues, comme les 36 pages de contenu (REVIEW.md R-24).

### 9.9 Design et design system

Le jeu introduit un monde visuel que le système actuel n'a pas : un fond nuit pour le dashboard, la visio et les cartes, puis le retour au papier pour décembre. Le prototype utilise ses propres couleurs et polices comme stand-in. Pour l'implémentation :

- Rédiger `design/DS-EXTENSION-BRIEF-04.md` pour Claude Design, dans le format des briefs précédents : les composants (VideoCall, DgFace, tuile de dashboard avec variante floutée, ActionCard avec badge d'ordre, PhoneMock, QuarterReport, EndingHero, Sparkline, PatternCatalogue), les deux mondes, les humeurs du DG, mobile 390 et desktop 1280, les deux langues.
- Les nouveaux tokens (surfaces « nuit », accent ambre du dashboard, corail et vert des états) entrent dans `tokens/*.css` par ce brief, jamais en hexadécimal inline.
- Le flou des tuiles cachées est un `filter: blur(6px)` avec opacité réduite : on doit voir qu'il y a quelque chose qu'on ne montre pas.
- La maquette du téléphone est un vrai écran d'appli, blanc, avec son mini système propre, isolé dans son composant.

### 9.10 Où vivent les fichiers de ce brief

- Ce document : `GAME-BRIEF.md`, à la racine, à côté de `SPEC.md` et `GROWTH-PLAN.md`.
- Le prototype : `design/game/prototype-s-ils-reviennent.html`. Il reste jouable en l'ouvrant dans un navigateur, sans build.
- Quand le niveau 1 est en production, ajouter au `CLAUDE.md` du dépôt une entrée « Le côté obscur » qui renvoie ici, avec les décisions de la section 4.

---

## 10. Ce que le prototype ne fait pas encore

- Version anglaise.
- Reprise après rechargement.
- Événements analytiques.
- Hub des cinq zones et collection transversale.
- Images `opengraph-image`.
- Test automatique des mots interdits sur les cartes (la règle existe, le test non).
- Relire le message du DG une fois raccroché : ajouter un lien « Relire le message du DG » dans la main.
- `data-testid` sur les éléments listés en 7.2.

---

## 11. Les quatre autres niveaux

Même moteur, même DG, un écran par zone. Le DG change d'entreprise à chaque niveau et emmène le joueur avec lui : c'est réaliste, et ça garde le personnage, sa voix et ses ordres. Chaque niveau a son objectif chiffré, son régulateur pour le radar, ses huit astuces en jargon, ses honnêtes, ses cas publics. Les cas marqués « à sourcer » doivent être vérifiés et sourcés avant écriture ; ceux sans marque sont publics et déjà connus.

Le modèle numérique est le même que celui du niveau 1, avec deux constantes renommées par niveau : la métrique visible (churn devient taux de conversion, taux d'activation, coefficient viral, revenu par utilisateur) et le régulateur du radar. Les fixtures et les invariants de la section 6 doivent être reproduits pour chaque niveau avant lancement.

### 11.1 « Comment les gens vous trouvent » · la page produit

- **Univers.** Le DG a repris une boutique en ligne de vélos et d'équipement, cent mille visites par mois, taux de conversion de 2,1 %. Le board veut 3 % en décembre. Radar : DGCCRF.
- **Écran du téléphone.** Une fiche produit : photo, prix, stock, avis, bouton d'achat, puis le panier.
- **Honnêtes.** Fiches produit complètes (photos, dimensions, compatibilités) ; Avis vérifiés (preuve d'achat, affichage du taux de vérification) ; Prix tout compris affiché dès la fiche ; Livraison annoncée (date et coût avant le panier) ; Comparateur honnête (le concurrent parfois moins cher) ; Contenu conseil (guides de choix) ; Point données avec le DG ; Retrait des changements.
- **Astuces, nom de réunion → nom officiel.** Compteur d'offre (le compte à rebours repart à chaque visite) → Fausse urgence · Indicateur de stock (« plus que 3 ») → Fausse rareté · Avis mis en avant (avis achetés ou triés) → Faux avis, pratique commerciale trompeuse, article L121-2 · Prix d'appel (frais ajoutés au panier) → Frais cachés, prix total obligatoire · Prix de référence (prix barré inventé) → Faux prix barré, article L112-1-1 du Code de la consommation, prix le plus bas des trente derniers jours · Alerte d'activité (« 12 personnes regardent ») → Fausse preuve sociale · Contenu partenaire (publicité présentée comme un conseil) → Publicité déguisée · Classement optimisé (produits sponsorisés non signalés) → Classement payé non signalé, DSA article 27.
- **Ordres du DG.** T2 : l'indicateur de stock ; T3 : le prix de référence ; T4 : les avis mis en avant.
- **Cas publics.** Les engagements de Booking.com devant la Commission européenne sur les messages d'urgence (à sourcer) ; l'accord Fashion Nova et FTC sur les avis supprimés (à sourcer) ; les contrôles DGCCRF sur les faux prix barrés pendant le Black Friday (à sourcer, communiqués annuels).
- **Ce que le joueur repart avec.** Un prix se compare tout compris ; un compte à rebours qui repart n'en est pas un ; un avis sans preuve d'achat ne vaut rien.

### 11.2 « Comment ils comprennent ce que vous apportez » · l'inscription

- **Univers.** Le DG dirige maintenant un outil de planification pour indépendants. Dix mille inscriptions par mois, 30 % d'activés (un premier planning publié sous sept jours). Le board veut 45 %. Radar : CNIL.
- **Écran du téléphone.** L'arrivée sur l'appli : bandeau cookies, inscription, premier écran, demandes de permissions.
- **Honnêtes.** Essai sans carte bancaire ; Démo avant inscription (on essaie, puis on crée un compte) ; Onboarding en trois étapes ; Import assisté depuis l'ancien outil ; E-mail de bienvenue utile ; Refus des cookies en un clic ; Point données ; Retrait des changements.
- **Astuces.** Inscription en amont (rien à voir avant le compte) → Action forcée · Bandeau optimisé (accepter en gros, refuser au troisième écran) → Refus caché, la CNIL exige un refus aussi simple que l'acceptation · Carte bancaire pour l'essai (prélèvement automatique à J+14) → Continuité forcée · Cases préremplies (newsletter, partage de données) → Présélection, le consentement RGPD doit être actif · Écran de refus (« Non, je ne veux pas gagner du temps ») → Confirmshaming · Tour guidé obligatoire (info-bulles impossibles à fermer) → Harcèlement d'interface · Permissions groupées (contacts, notifications, position, en une fois) → Interférence · Faux chargement (une barre qui « analyse » pour donner du poids) → Faux signal.
- **Ordres du DG.** T2 : le bandeau optimisé ; T3 : la carte bancaire pour l'essai ; T4 : l'inscription en amont.
- **Cas publics.** CNIL, janvier 2022 : 150 millions d'euros pour Google et 60 millions pour Facebook, refus des cookies plus difficile que l'acceptation ; CNIL, décembre 2022 : 60 millions pour Microsoft Bing ; CNIL, 5 millions pour TikTok, même motif.
- **Ce que le joueur repart avec.** Un bouton « tout refuser » doit être aussi visible que « tout accepter » ; une carte demandée pour un essai gratuit est un abonnement qui ne dit pas son nom.

### 11.3 « S'ils vous recommandent » · l'invitation

- **Univers.** Le DG pilote une appli de partage de dépenses entre amis. Coefficient viral de 0,3, le board veut 0,6. Radar : CNIL, et la réputation dans les stores.
- **Écran du téléphone.** L'écran « Inviter des amis » et ce que reçoit l'invité.
- **Honnêtes.** Parrainage clair (les deux côtés gagnent la même chose, conditions écrites) ; Invitation choisie (on sélectionne un contact, un message éditable) ; Résultat partageable utile (le récapitulatif d'un week-end, pas une pub) ; Page d'accueil de l'invité honnête ; Notifications utiles seulement ; Point données ; Retrait des changements.
- **Astuces.** Import du carnet d'adresses (tous les contacts présélectionnés) → Aspiration du carnet, données de tiers sans leur consentement · Invitations en votre nom (e-mails envoyés automatiquement, relancés) → Spam d'amis · Partage pour débloquer (fonctionnalité verrouillée derrière trois invitations) → Action forcée · Invitation personnalisée (« Léa t'attend », alors que Léa n'a rien fait) → Fausse preuve sociale · Récompense fantôme (le bonus de parrainage aux conditions introuvables) → Coût caché · Bouton continuer (le bouton principal partage, le petit lien passe) → Interférence visuelle · Rappels d'attente (« 3 amis t'attendent ») → Design addictif · Suivi des contacts (on garde les numéros des non-inscrits) → Collecte cachée.
- **Ordres du DG.** T2 : l'import du carnet d'adresses ; T3 : les invitations en votre nom ; T4 : le partage pour débloquer.
- **Cas publics.** L'accord LinkedIn de 2015 sur les e-mails « Add Connections » envoyés au nom des membres, treize millions de dollars (à sourcer) ; la décision de la Cour fédérale allemande de 2016 sur la fonction « Trouver des amis » de Facebook (à sourcer).
- **Ce que le joueur repart avec.** Une invitation qu'on n'a pas écrite n'est pas la sienne ; un bonus dont on ne trouve pas les conditions n'existe pas.

### 11.4 « Comment vous gagnez de l'argent » · le paiement

- **Univers.** Le DG dirige une appli de sport avec abonnement et monnaie virtuelle. Revenu moyen par utilisateur de 4 € par mois, le board veut 6 €. Radar : DGCCRF, et l'Autorité de la concurrence en filigrane.
- **Écran du téléphone.** L'écran d'essai, le paiement, le renouvellement, la boutique de monnaie virtuelle.
- **Honnêtes.** Prix affiché en entier avant le paiement ; Rappel de fin d'essai trois jours avant ; Plan adapté proposé (y compris moins cher quand l'usage baisse) ; Renouvellement annoncé (courriel avant chaque échéance annuelle) ; Monnaie lisible (des packs en euros ronds, sans reste) ; Point données ; Retrait des changements.
- **Astuces.** Essai à conversion automatique (sans rappel) → Continuité forcée · Frais de service au dernier écran → Frais cachés · Montée de gamme par défaut (le plan supérieur présélectionné, ou activé après usage) → Présélection · Prix personnalisé (selon le téléphone ou l'historique, sans le dire) → Prix personnalisé non signalé, information précontractuelle obligatoire · Packs de gemmes (des paquets qui ne tombent jamais juste) → Coût obscurci · Coffres à récompenses (contenu aléatoire payant) → Design addictif, loot boxes · Renouvellement silencieux (l'abonnement annuel reconduit sans courriel) → Reconduction tacite sans information, loi Chatel, article L215-1 du Code de la consommation · Remise de minuit (l'offre expire, puis revient) → Fausse urgence.
- **Ordres du DG.** T2 : l'essai à conversion automatique ; T3 : la montée de gamme par défaut ; T4 : les coffres à récompenses.
- **Cas publics.** L'accord Epic Games et FTC de décembre 2022, 245 millions de dollars pour des dark patterns dans les achats de Fortnite (à sourcer) ; l'interdiction des loot boxes payantes en Belgique (à sourcer) ; Amazon et Adobe, déjà cités au niveau 1.
- **Ce que le joueur repart avec.** Un essai gratuit a une date de fin qu'on doit connaître avant de donner sa carte ; un pack de monnaie virtuelle qui ne tombe pas juste est calculé pour ça.

### 11.5 Le hub et la collection

- Le hub `/game` présente les cinq zones dans l'ordre du Tour, avec le titre de la zone tel que le Tour le dit, le nom de l'entreprise du niveau, l'état (jouable, bientôt), et pour chaque niveau terminé la fin obtenue et la date.
- La collection « ce que tu sais reconnaître » liste les patterns rencontrés tous niveaux confondus, avec le repère de chacun. Elle se remplit en jouant. C'est la raison de revenir, et un contenu à partager plus naturel qu'un score.
- Le hub renvoie vers le Tour (« Où en est ta croissance ? ») et le résultat du Tour renverra vers le jeu (« Et le côté obscur ? ») : les deux boucles se nourrissent.

---

## 12. Plan de livraison

| Jalon | Contenu | Critère de sortie |
|---|---|---|
| J0 · Brief design | `design/DS-EXTENSION-BRIEF-04.md` rédigé et envoyé à Claude Design | Retour reçu, tokens ajoutés |
| J1 · Moteur | `lib/game/` complet, `content/game/retention.ts`, fixtures | Séries S, H, R, M, Q, E, F, C vertes en CI |
| J2 · Interface FR | Composants, deux mondes, téléphone, visio SVG, voix, route `[locale]/game/retention` | P1 à P14, P16, P17, P21 verts |
| J3 · Bilingue, persistance, hub | Textes EN relus, reprise, `[locale]/game` | P15, P18 verts, C2 vert |
| J4 · Instrumentation et SEO | Événements, `opengraph-image`, sitemap, JSON-LD | P19, P20, P22 verts, dashboard admin à jour |
| J5 · Recette | Relecture d'Antoine, cinq testeurs, relecture juridique du catalogue | 7.3 validée, aucun texte modifié après |
| J6 · Lancement | Mise en ligne, annonce, suivi des indicateurs de 2.3 pendant un mois | Rapport d'indicateurs |
| J7+ · Niveaux 2 à 5 | Une `LevelDefinition` par niveau, mêmes tests, mêmes fixtures | Un niveau par sprint |

Définition de terminé pour la première version : J0 à J6, toutes les séries de tests vertes en CI, la recette signée par Antoine, l'entrée ajoutée au `CLAUDE.md`.

---

## 13. Références

- Prototype : `design/game/prototype-s-ils-reviennent.html`.
- Tour de Growth : https://www.tourdegrowth.com
- deceptive.design : https://www.deceptive.design/
- CNIL, Données & Design : https://design.cnil.fr/
- Bad News : https://www.getbadnews.com/ · Cranky Uncle : https://crankyuncle.com/
- Résiliation en trois clics : https://www.donneespersonnelles.fr/resiliation-en-trois-clics
- Digital Fairness Act : https://digitalfairnessact.com/
