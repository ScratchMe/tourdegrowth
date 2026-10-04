# GAME-BRIEF.md, niveau activation — « Comment ils comprennent ce que vous apportez » (§18)

*Écrite le 2026-10-04 (`CHANTIERS.md` A24), pour qu'un agent construise ce
niveau sans rien avoir à décider : chaque chaîne est écrite en français et en
anglais, chaque chiffre est celui que produit le modèle déjà codé
(`src/lib/game/levels/activation.ts`, épinglé par
`src/lib/game/__tests__/activation.test.ts`). Le comment, l'ordre des PR et la
définition de terminé sont dans [`construire-un-niveau.md`](construire-un-niveau.md)
(§21), à lire avant ce fichier. Un renvoi « §n » sans nom de fichier désigne
`GAME-BRIEF.md` ; « §17.x », la spécification du niveau 2
([`niveau-2.md`](niveau-2.md)), dont celle-ci reprend le plan.*

*Les textes de cette spécification passent au statut « à relire » en entrant
dans le code (convention 6) et partent dans un bon à tirer. Ils sont écrits
sans espaces insécables : l'agent les pose en recopiant (§21.5).*

---

## 18. Le niveau activation — spécification

### 18.0 En une page

- **L'univers.** Le DG dirige maintenant **Quandi**, un outil de planification
  en ligne pour indépendants : coiffeurs, coachs, kinés, artisans y publient
  leurs créneaux, leurs clients réservent. 10 000 inscriptions par mois, et
  30 % seulement publient un premier planning dans la semaine. Le board veut
  45 % en décembre.
- **Le chiffre du board** : le taux d'activation, la part des inscrits qui
  publient un premier planning sous sept jours. Un taux, comme le churn du
  niveau 1, qui doit **monter**, comme les nouveaux clients du niveau 2.
- **Le radar est celui de la CNIL**, plus de la DGCCRF : les huit astuces
  touchent au consentement et aux données. Le contrôle finit en **amende
  administrative** prononcée par la formation restreinte de la CNIL.
- **Ce qui ne change pas** : tout le reste. Les décisions de la section 4, la
  boucle d'un trimestre, le DG, les ordres, la révélation de décembre.
- **L'équilibrage est celui du niveau 2**, carte pour carte par rôle : les
  quatre années de référence gardent la patience qu'Antoine a validée (51, 42,
  46, 73 pour l'année honnête).
- **Le téléphone** montre l'arrivée d'un indépendant sur l'appli, du bandeau
  des cookies au premier écran ; **la pastille** compte les clics qu'il faut
  pour refuser les cookies.

### 18.1 Ce qui change depuis l'esquisse du §11.2

L'esquisse du 2026-09 tient pour l'univers, le chiffre du board, le radar et la
leçon. Trois écarts, tous à valider (§18.10) :

| Esquisse §11.2 | Ici | Pourquoi |
|---|---|---|
| Carte bancaire pour l'essai → Continuité forcée | **retirée** | Le niveau revenue (§20) a l'essai qui se convertit tout seul, avec un cas plus fort : la même astuce dans deux niveaux, c'est un nom de moins dans la collection (§11.5). |
| Écran de refus (« Non, je ne veux pas gagner du temps ») → Confirmshaming | **retirée** | Déjà au niveau 1 (`shame`), même nom officiel. |
| Inscription en amont → Action forcée | **retirée** | Déjà au niveau 1 (`call`), même nom officiel ; et forcer l'inscription fait baisser le taux d'activation (plus d'inscrits curieux), le contraire de ce que veut le DG. |
| Tour guidé obligatoire → Harcèlement d'interface | **gardée** (`tour`) | Le levier d'activation que tout le monde reconnaît ; le seul nom officiel repris d'un autre niveau. |
| — | **ajoutées** : numéro obligatoire (chantage à la sécurité), e-mails suivis (pixel espion), partage partenaires (consentement de dernière minute) | Trois noms neufs, tous dans le champ de la CNIL, avec des cas ou des textes publics. |

Résultat : **sept noms officiels sur huit absents des niveaux 1 et 2**, contre
trois dans l'esquisse. Les noms de l'esquisse qui n'étaient pas des noms de
taxonomie (« Refus caché », « Faux signal ») sont remplacés par ceux de la CNIL,
du CEPD ou de l'OCDE (§18.9).

### 18.2 L'univers et le chiffre du board

- **Quandi** (de « quand »), outil de planification en ligne pour
  indépendants. Un nom inventé ; « Créneo », le premier candidat, est pris par
  deux plateformes de réservation (creneo.fr, creneo.app), et la recherche du
  2026-10-04 est au §18.9. La vérification INPI reste à faire avec la relecture
  juridique (D9).
- **Le chiffre du board : le taux d'activation.** 30,0 % en janvier ; objectifs
  de trimestre **32,3 %, 35,3 %, 39,0 %, puis 45,0 %** en décembre. Ce sont ceux
  du niveau 2 multipliés par 0,30 / 2 000, arrondis au dixième de point que la
  tuile affiche (le calcul exact donnerait 32,25 % et 35,25 %).
- **L'outil** : 60 000 utilisateurs actifs au 1er janvier, 5 % qui s'arrêtent
  chaque mois, 5 € de revenu moyen par utilisateur actif et par mois (l'offre
  payante, ramenée à tous les comptes actifs). Soit 0,30 M€ de revenu mensuel
  en janvier. À 30 % d'activation, la base ne bouge pas.
- **L'affichage** : la tuile arrondit au dixième de point (« 32,3 % »).
  Décembre est gagné à 45,0 % affiché, soit 44,95 % et plus.

### 18.3 Le modèle

Déjà codé (`levels/activation.ts`) : **l'agent n'y touche pas** (§21.2). Ce qui
suit le décrit pour la relecture.

**La formule du mois** est celle du niveau 2 (§17.3), le chiffre étant un
taux :

`activation = 30 % × (1 + hr) × (1 + dr) × (2 − trustMult(lagTrust)) × presse − spike − saison`, plancher 6 %

**L'économie** (`Economy.kind = "activation"`, `model.ts`) :

- inscrits du mois = 10 000 × (1 + (confiance − 60) / 150), sur la confiance du moment ;
- utilisateurs actifs = actifs × (1 − 5 % × trustMult(lagTrust)) + inscrits × activation ;
- revenu mensuel = actifs × 5 € × multiplicateur de revenu (1,02 avec `partners`).

**Les constantes**, en regard du niveau 2 :

| Constante | Niveau 2 | Activation | Rapport |
|---|---|---|---|
| Chiffre de janvier | 2 000 | 30 % | ×0,30/2 000 |
| Objectifs T1 à T4 | 2 150 · 2 350 · 2 600 · 3 000 | 32,3 · 35,3 · 39,0 · 45,0 % | arrondis au dixième |
| Victoire en décembre | ≥ 2 995 | ≥ 44,95 % | ce que la tuile affiche |
| Plafonds honnête / astuces | 0,43 / 0,82 | identiques | — |
| Plancher | 400 | 6 % | ×0,30/2 000 |
| Saison (mois 4 à 6) | −100 | −1,5 point, l'offre gratuite d'un concurrent | idem |
| Spike du contrôle / du fil viral | 500 / 330 | 7,5 / 4,95 points | idem |
| Décroissance du spike | 170 par mois | 2,55 points par mois | idem |
| Patience perdue par écart | 0,084 par client | 560 par unité, soit 5,6 par point manqué | idem |
| Presse | ×1,05 sur le chiffre | identique | — |
| Patience, confiance, radar au départ ; seuils | | identiques | — |

**Le contrôle : une amende administrative de la CNIL, rendue publique.** Les
manquements de Quandi (refus des cookies plus long que l'accord, consentement
en bloc ou par case cochée, finalité détournée, pistage des ouvertures)
relèvent de l'article 82 de la loi Informatique et Libertés et du RGPD, que la
CNIL sanctionne par des amendes administratives prononcées par sa formation
restreinte. **Proposé : 100 000 €**, fixe quel que soit le radar (C14), à valider
(§18.10, Q3) : environ 3 % du chiffre d'affaires annuel de Quandi (3,6 M€),
du même ordre que l'amende publiée d'un courtier en données de neuf salariés
(80 000 €, mai 2025, le cas de `partners` au §18.9). Une sanction rendue publique
suppose la procédure ordinaire : la procédure simplifiée plafonne à 20 000 € et
n'est jamais publiée, ce qui rendrait faux « article dans la presse ». Les cas sont
au §18.9.

### 18.4 Les cartes

Règle d'écriture inchangée (§5.5) : un nom et un pitch décrivent le mécanisme,
jamais l'effet ni l'intention, sans aucun des mots interdits ni marque réelle.
Les chiffres sont ceux du niveau 2 pour le même rôle ; la dernière colonne
donne la carte du niveau 1 dont chacune tient le rôle.

**Honnêtes** (`honestOrder` : `demo, calls, checklist, import, present, refuse, welcome, minimal, clean`)

| id | Nom FR | Pitch FR | Nom EN | Pitch EN | gain | ramp | trust | radar | autres | rôle |
|---|---|---|---|---|---|---|---|---|---|---|
| demo | Démo sans compte | Un planning d'exemple qu'on peut modifier avant de créer un compte. | Demo without an account | A sample schedule you can edit before creating an account. | 0,05 | 0,09 | +4 | −2 | perm | pause |
| calls | Appels aux inscrits | Dix appels de vingt minutes avec des inscrits qui n'ont encore rien publié. | Calls with sign-ups | Ten twenty-minute calls with sign-ups who haven't published anything yet. | | | +2 | | `insight` | survey |
| checklist | Premiers pas | Une liste de trois étapes sur l'écran d'accueil : un client, un créneau, la publication. Elle se ferme d'un geste. | First steps | A three-step list on the home screen: a client, a slot, publishing. It closes with one tap. | 0 | 0,12 | +3 | | perm | onboard |
| import | Import assisté | Reprendre son ancien agenda, en ligne ou depuis un fichier, en un seul écran. | Guided import | Bring over your old calendar, online or from a file, on a single screen. | 0,03 | 0,08 | +3 | | perm | annual |
| present | *(niveau 1, par référence)* | | | | | | | | `present` | present |
| refuse | Refus en un clic | Sur le bandeau des cookies, « Tout refuser » à côté de « Tout accepter », de la même taille. | One-click refusal | On the cookie banner, "Reject all" next to "Accept all", the same size. | −0,01 | | +8 | −8 | perm | remind |
| welcome | E-mail de bienvenue | Un seul e-mail, le lendemain de l'inscription : le planning en cours et un modèle adapté au métier. | Welcome email | A single email, the day after sign-up: the schedule in progress and a template for the trade. | 0 | 0,08 | +3 | | perm | reco |
| minimal | Inscription minimale | L'inscription ne demande que l'e-mail ; le numéro, le métier et l'agenda deviennent facultatifs. | Minimal sign-up | Sign-up asks only for an email; the phone number, the trade and the calendar become optional. | −0,03 | | +10 | −20 | perm, `temp` | three |
| clean | *(nom du niveau 1)* | Revenir à l'inscription, au bandeau et aux demandes d'autorisation d'origine. | *(niveau 1)* | Go back to the original sign-up, banner and permission requests. | | | +6 | −25 | `clean` | clean |

Le gain négatif de « Refus en un clic » est le consentement aux cookies qui
baisse, donc moins de relances ciblées ; celui d'« Inscription minimale », les
relances qui n'ont plus de numéro où partir, le temps que les inscrits
choisissent de le donner (`temp` : trois mois).

**Astuces** (`darkOrder` : `bundle, phone, prechecked, analysis, banner, pixels, partners, tour` ; au premier trimestre, seulement `bundle, phone, prechecked, analysis`)

| id | Nom FR | Pitch FR | Nom EN | Pitch EN | gain | trust | radar | rôle |
|---|---|---|---|---|---|---|---|---|
| bundle | Autorisations au démarrage | Au premier lancement, un écran de l'appli demande d'un coup contacts, agenda, notifications et position, avec un seul bouton « Autoriser ». | Permissions at launch | On first launch, an in-app screen asks for contacts, calendar, notifications and location at once, with a single "Allow" button. | 0,12 | −4 | +10 | pdef |
| phone | Numéro obligatoire | Un numéro de mobile est demandé à l'inscription pour sécuriser le compte ; il sert aussi aux relances par SMS. | Mandatory number | A mobile number is required at sign-up to secure the account; it is also used for text reminders. | 0,10 | −5 | +15 | bury |
| prechecked | Cases préremplies | À l'inscription, « Recevoir nos conseils et offres » est déjà cochée. | Pre-filled boxes | At sign-up, "Receive our tips and offers" is already ticked. | 0,08 | −3 | +8 | cascade |
| analysis | Écran d'analyse | Après l'inscription, une barre de progression de douze secondes : « Nous préparons votre planning sur mesure… » | Analysis screen | After sign-up, a twelve-second progress bar: "We're preparing your tailored schedule…" | 0,03 | −2 | +3 | shame |
| banner | Bandeau optimisé | « Tout accepter » en bouton, « Personnaliser » en lien ; le refus est sur le deuxième écran. | Optimised banner | "Accept all" as a button, "Customise" as a link; refusing is on the second screen. | 0,18 | −10 | +25 | call |
| pixels | E-mails suivis | Chaque e-mail porte un pixel qui enregistre qui l'ouvre et à quelle heure ; les relances partent à cette heure-là. | Tracked emails | Every email carries a pixel that records who opens it and at what time; the follow-ups go out at that hour. | 0,04 | −5 | +12 | social |
| partners | Partage partenaires | Sous « Créer mon compte » : « En créant mon compte, j'accepte que mes coordonnées soient transmises à nos partenaires. » | Partner sharing | Under "Create my account": "By creating my account, I agree that my details may be passed on to our partners." | 0,04 | −5 | +12 | notice (`revenueMult` 1,02 : chaque contact transmis est payé par le partenaire) |
| tour | Visite guidée | Des info-bulles guident le premier planning ; elles restent tant qu'il n'est pas publié. | Guided tour | Tooltips guide the first schedule; they stay until it is published. | 0,05 | −4 | +4 | streak |

### 18.5 Le DG

**Ordres** (`orderSchedule`, `orderPool`, `bannedAfterSanction`, déjà codés) :
aucun au T1 ; puis `bundle` au T2, `banner` au T3, `phone` au T4 ; si la carte
est déjà en production, la première disponible de
`bundle, banner, phone, prechecked, partners`. Après un contrôle, il ne demande
plus ni `banner` ni `phone`.

**Textes d'ordre** (`orders`), glissés dans le `orderWrap` du niveau 1 (« Et ce
trimestre, {order} Ce n'est pas une idée, c'est une demande. »), donc sans
majuscule initiale :

| id | FR | EN |
|---|---|---|
| bundle | tu demandes toutes les autorisations au premier lancement. Contacts, agenda, notifications, tout d'un coup. Après, plus personne ne dit oui. | you ask for every permission on first launch. Contacts, calendar, notifications, all at once. Later on, nobody says yes. |
| banner | tu refais le bandeau des cookies. Un gros « Tout accepter », et le refus plus loin. Sans consentement, on ne mesure rien et on ne relance personne. | you redo the cookie banner. A big "Accept all", and refusing further in. Without consent we can't measure anything or follow up with anyone. |
| phone | on demande un numéro de mobile à l'inscription. Pour la sécurité, et un SMS fait publier plus qu'un e-mail. | we ask for a mobile number at sign-up. For security, and a text gets people publishing more than an email does. |
| prechecked | la case des conseils et offres, tu la coches d'avance. Les gens ne décochent pas. | the tips-and-offers box, you tick it in advance. People don't untick. |
| partners | on transmet les coordonnées des inscrits à nos partenaires. Une banque nous paie pour chaque contact, et c'est dans les conditions. | we pass sign-ups' details on to our partners. A bank pays us for every contact, and it's in the terms. |

**Messages de visio** (`boss`) : seuls ceux qui nomment un chiffre sont écrits ;
`t2Hit`, `t3Hit`, `t3Miss`, `orderWrap`, `yearEnd` et `fired` sont ceux du
niveau 1, par référence.

| Clé | FR | EN |
|---|---|---|
| t1 | Bonjour. Nouvelle boîte, même promesse : le board veut 45 % d'activation en décembre, et je leur ai promis. Fin mars, je veux voir 32,3 %. Pas 32,2. Tu as deux chantiers ce trimestre. Je ne veux pas savoir comment, je veux le chiffre. | Morning. New company, same promise: the board wants 45% activation by December, and I promised them. By the end of March I want to see 32.3%. Not 32.2. You have two projects this quarter. I don't want to know how. I want the number. |
| t2Miss | Tu m'as fait mentir en comité. {metric} au lieu de 32,3 %. Ça n'arrivera pas deux fois. Fin juin, {target}. | You made me look like a liar in front of the committee. {metric} instead of 32.3%. It won't happen twice. End of June, {target}. |
| t4Hit | Dernière ligne droite. 45 % fin décembre et on fête ça. | Home stretch. 45% by the end of December and we celebrate. |
| t4Miss | C'est ton dernier trimestre, tu le sais. 45 % en décembre, ou je présente quelqu'un d'autre au board en janvier. | This is your last quarter, and you know it. 45% in December, or I introduce someone else to the board in January. |

Humeur, visage, voix : inchangés (§5.10).

### 18.6 Parcours de référence (fixtures)

Les années du niveau 2 (§17.6), jouées carte pour carte par rôle. Le taux est
affiché comme la tuile l'arrondit, la patience en entier. Elles sont les tests
F18.1 à F18.4 de `activation.test.ts` (déjà écrits), et F18.5 tient les
invariants du §6. **Les specs e2e (T4) les jouent à l'interface d'après ces
tables.**

**A · Honnête, refuse les trois ordres, présente ses données** — T1 `demo + calls`, T2 `checklist + present`, T3 `import + welcome`, T4 `refuse + present`

| | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| Activation | 31,5 % | 32,4 % | 39,8 % | 45,0 % |
| Patience | 51 | 42 | 46 | 73 |
| Humeur à l'ouverture | firm | angry | angry | firm |
| Ordre | — | bundle | banner | phone |

Fin : `applause`, confiance 83, radar 0. Les utilisateurs actifs passent de
60 000 à 71 887, le revenu mensuel de 0,30 à 0,36 M€.

**B · Honnête, variante** — T1 `demo + calls`, T2 `checklist + import`, T3 `welcome + present`, T4 `minimal + present`

| | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| Activation | 31,5 % | 33,5 % | 42,1 % | 45,0 % |
| Patience | 51 | 33 | 52 | 79 |

Fin : `applause`, confiance 85, radar 0.

**C · Obéit à tout** — T1 `bundle + phone`, T2 `banner + prechecked`, T3 `pixels + partners`, T4 `demo + refuse`

| | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| Activation | 34,6 % | 36,2 % | 34,8 % | 14,5 % |
| Patience | 67 | 79 | 45 | 0 |
| Humeur à l'ouverture | firm | calm | firm | angry |
| Ordre | — | banner | partners | bundle |

Plaintes et fil viral au T2, contrôle au T3 : amende de 100 000 €, six astuces
retirées, 871 utilisateurs qui suppriment leur compte. Fin : `fine`,
confiance 27, radar 1. 50 090 utilisateurs actifs en décembre, et un revenu
mensuel de 0,25 M€, sous celui de janvier.

**D · Honnête sans rien de fort** — T1 `calls + refuse`, T2 `present + welcome`

| | T1 | T2 |
|---|---|---|
| Activation | 29,7 % | 29,2 % |
| Patience | 40 | 15 |

Viré en juin. Fin : `firedClean`, confiance 73. (Niveau 2 : 41, 16 ; l'écart
d'un point vient des objectifs arrondis au dixième.)

**Les quatre fins qu'aucune année de référence n'atteint**, épinglées dans
`paths-activation.ts` : `cleanMiss` (`calls + checklist`, `welcome + present`,
`import + minimal`, `present + refuse` : 44,7 % en décembre), `repentant`
(`welcome + prechecked`, `analysis + checklist`, `refuse + demo`,
`import + clean`), `labyrinth` (`calls + bundle`, `demo + import`,
`clean + phone`, `banner + refuse`), `firedDark` (`phone + refuse`,
`calls + checklist`).

**Joué au hasard**, 4 000 années par façon de jouer, le même harnais pour les
cinq niveaux (cartes tirées dans la main, graine fixe) :

| Façon de jouer | Niveau 1 | Niveau 2 | Activation |
|---|---|---|---|
| Honnêtes seulement | applaudissements 35 %, viré 34 %, droit dans tes bottes 19 % | 43 %, 27 %, 19 % | 42 %, 28 %, 18 % |
| Obéit au DG | labyrinthe 65 %, contrôle 23 % | 65 %, 23 % | 65 %, 23 % |
| N'importe quoi | labyrinthe 44 %, viré après astuces 44 % | 53 %, 34 % | 53 %, 35 % |

### 18.7 Le téléphone : l'arrivée d'un indépendant

Au niveau 2, le téléphone montrait le chemin d'un visiteur jusqu'au panier.
Ici, il montre ce que voit un indépendant qui arrive sur l'appli de Quandi, du
premier lancement au premier écran, et reflète l'union des cartes en
production et des cartes cochées. Une figure de texte, sans faux boutons (E9).
Couleur de marque : un violet, `--phone-brand: #6A4BD8` (à vérifier au contraste
sur son fond réel, convention 7).

**Le type et l'ordre** (`src/lib/game/planner-phone.ts`, nom du composant
`PlannerPhone`) :

```ts
export type PlannerPhoneItem =
  | { kind: "appBar" }
  /** `bundle`: one sheet asking for everything, one button. */
  | { kind: "permissions" }
  /** The cookie banner: `equal` with `refuse`, else `nudged` with `banner`, else `plain`. */
  | { kind: "banner"; style: "plain" | "nudged" | "equal" }
  /** `demo`: a sample schedule before any account. */
  | { kind: "demo" }
  /** The sign-up form. `phone`: `required` with `phone`, `optional` when `minimal` is there too, else `none`. */
  | { kind: "signup"; minimal: boolean; phone: "none" | "required" | "optional"; prechecked: boolean; partners: boolean }
  /** `analysis`: the progress bar. */
  | { kind: "analysis" }
  /** The first screen: the checklist (`checklist`), the import (`import`), the tooltip (`tour`). */
  | { kind: "home"; checklist: boolean; importer: boolean; tour: boolean }
  /** `pixels`: the push that gives the tracking away. */
  | { kind: "push" }
  /** `welcome`: tomorrow's email. */
  | { kind: "welcome" }
  /** `calls`: the call offer. */
  | { kind: "calls" };

/** Top to bottom, the way someone arriving scrolls. */
export function plannerPhoneView(ids: readonly string[]): PlannerPhoneItem[] {
  const has = (id: ActivationCardId) => ids.includes(id);
  const items: PlannerPhoneItem[] = [{ kind: "appBar" }];
  if (has("bundle")) items.push({ kind: "permissions" });
  items.push({ kind: "banner", style: has("refuse") ? "equal" : has("banner") ? "nudged" : "plain" });
  if (has("demo")) items.push({ kind: "demo" });
  items.push({
    kind: "signup",
    minimal: has("minimal"),
    phone: has("phone") ? (has("minimal") ? "optional" : "required") : "none",
    prechecked: has("prechecked"),
    partners: has("partners"),
  });
  if (has("analysis")) items.push({ kind: "analysis" });
  items.push({ kind: "home", checklist: has("checklist"), importer: has("import"), tour: has("tour") });
  if (has("pixels")) items.push({ kind: "push" });
  if (has("welcome")) items.push({ kind: "welcome" });
  if (has("calls")) items.push({ kind: "calls" });
  return items;
}
```

**Les chaînes** (`ActivationPhoneCopy`, un champ par ligne que montre le
téléphone ; les « boutons » sont des `<span>` stylés) :

| Champ | Montré par | FR | EN |
|---|---|---|---|
| caption | toujours | L'arrivée sur l'appli telle qu'un indépendant la voit | Arriving on the app as a freelancer sees it |
| appName | `appBar` | Quandi | Quandi |
| time | `appBar` | 08:12 | 08:12 |
| permissions | `permissions` | Pour bien démarrer, Quandi a besoin de vos contacts, de votre agenda, de vos notifications et de votre position. | To get started, Quandi needs your contacts, your calendar, your notifications and your location. |
| permissionsAllow | `permissions` | Autoriser | Allow |
| bannerText | `banner` plain et equal | Cookies de mesure d'audience | Audience measurement cookies |
| bannerTextNudged | `banner` nudged | Nous utilisons des cookies pour améliorer votre expérience. | We use cookies to improve your experience. |
| bannerAccept | plain | Accepter | Accept |
| bannerContinue | plain | Continuer sans accepter | Continue without accepting |
| bannerAcceptAll | nudged et equal | Tout accepter | Accept all |
| bannerRejectAll | equal | Tout refuser | Reject all |
| bannerCustomise | nudged et equal | Personnaliser | Customise |
| demo | `demo` | Essayer sans compte : un planning d'exemple à modifier | Try it without an account: a sample schedule to edit |
| signupTitle | `signup` | Créer mon compte | Create my account |
| fields | `signup`, sans `minimal` | E-mail · Mot de passe · Métier | Email · Password · Trade |
| fieldsMinimal | `signup`, avec `minimal` | E-mail · lien de connexion envoyé par e-mail | Email · sign-in link sent by email |
| phoneRequired | `phone: "required"` | Mobile (obligatoire) · pour sécuriser votre compte | Mobile (required) · to secure your account |
| phoneOptional | `phone: "optional"` | Mobile (facultatif) | Mobile (optional) |
| prechecked | `prechecked` | ☑ Recevoir nos conseils et offres | ☑ Receive our tips and offers |
| partners | `partners` | En créant mon compte, j'accepte que mes coordonnées soient transmises à nos partenaires. | By creating my account, I agree that my details may be passed on to our partners. |
| submit | `signup` | Créer mon compte | Create my account |
| analysis | `analysis` | Nous préparons votre planning sur mesure… 64 % | We're preparing your tailored schedule… 64% |
| homeEmpty | `home` | Votre planning est vide. | Your schedule is empty. |
| homeCreate | `home` | Créer un premier créneau | Create a first slot |
| checklist | `home.checklist` | Premiers pas · 1 Ajouter un client · 2 Créer un créneau · 3 Publier | First steps · 1 Add a client · 2 Create a slot · 3 Publish |
| checklistClose | `home.checklist` | Fermer | Close |
| importer | `home.importer` | Reprendre votre ancien agenda | Bring over your old calendar |
| tour | `home.tour` | Étape 1 sur 7 · Créez votre premier créneau · Suivant | Step 1 of 7 · Create your first slot · Next |
| push | `push` | Vous n'avez pas encore ouvert notre e-mail. Il contient votre planning. | You haven't opened our email yet. It has your schedule in it. |
| welcome | `welcome` | E-mail de demain : votre planning en cours et un modèle pour votre métier | Tomorrow's email: your schedule in progress and a template for your trade |
| calls | `calls` | Vingt minutes au téléphone ? Dites-nous ce qui vous a arrêté. Facultatif. | Twenty minutes on the phone? Tell us what stopped you. Optional. |
| callsAnswers | `calls` | Pas su par où commencer · Un agenda à reprendre · Autre | Didn't know where to start · A calendar to bring over · Other |

`callsAnswers` est un tableau de trois chaînes, comme `originAnswers` au niveau 2.
`events.surveyAnswers` (§18.8) cite ses deux premières mot pour mot, en
minuscules, comme les niveaux 1 et 2 citent les leurs.
`tour` n'a ni « Passer » ni croix : c'est ce que la carte met en production.

**La pastille, sous le téléphone** : les clics qu'il faut pour refuser les
cookies. Un fait mesurable que la CNIL encadre (refuser doit être aussi simple
qu'accepter, §18.9), jamais un jugement — le « N clics pour résilier » du
niveau 1.

```ts
/** Clicks to refuse the cookies — `refuse` wins over `banner`, as `three` does over the clicks on level 1. */
export const REFUSE_CLICKS_EASY = 1;
export const REFUSE_CLICKS_HIDDEN = 3; // « Personnaliser », tout décocher, « Enregistrer »
export function cookieRefusal(ids: readonly string[]): { clicks: 1 | 3; alert: boolean } {
  const hidden = ids.includes("banner") && !ids.includes("refuse");
  return { clicks: hidden ? REFUSE_CLICKS_HIDDEN : REFUSE_CLICKS_EASY, alert: hidden };
}
```

| Cartes en production ou cochées | Pastille FR | Corail |
|---|---|---|
| aucune des deux | Refuser les cookies : 1 clic | non |
| `banner` | Refuser les cookies : 3 clics · le refus doit être aussi simple que l'accord | oui |
| `refuse` | Refuser les cookies : 1 clic | non |
| `banner` + `refuse` | Refuser les cookies : 1 clic | non |

Chaînes de la pastille (`CookiePillCopy`, sous la clé `cookies`) : `easy` « Refuser les cookies : 1
clic » / "Refusing cookies: 1 click" ; `hidden` « Refuser les cookies : 3
clics » / "Refusing cookies: 3 clicks" ; `lawSuffix` « le refus doit être aussi
simple que l'accord » / "refusing must be as easy as agreeing". Le côté de
l'îlot (`ACTIVATION_SIDE`) compose `hidden · lawSuffix` comme `ACQUISITION_SIDE`
compose `basket.extra · feesSuffix`. **Test C13 du niveau** : le « 1 » et le
« 3 » des chaînes, dans les deux langues, sont `REFUSE_CLICKS_EASY` et
`REFUSE_CLICKS_HIDDEN`.

### 18.8 La copie, clé par clé

**Repris du niveau 1 par référence** (`L1.<clé>`, jamais recopiés) : `months`,
`monthInitials`, `quarterPeriod`, `timeline`, `dashboard.label`,
`dashboard.quarterTarget`, `dashboard.boardTarget`, `dashboard.monthEnd`,
`dashboard.revenue`, `dashboard.revenueDelta`, `dashboard.patience`,
`dashboard.patienceLow`, `dashboard.notOnDashboard`, `dashboard.hiddenValue`,
`dashboard.revealed`, `dashboard.delta`, `visio` (sauf `tag`), les clés de
`boss` listées au §18.5, `hand` (sauf `unlocked` et `productionEmpty`),
`cards.present`, `cards.clean.name`, `report` (sauf les clés écrites
ci-dessous), `journal`, `effects.insight`, `effects.present`, `effects.none`,
`events.midMailMoving`, `events.midMailStalled`, `events.present`,
`clippings.control.masthead`, `clippings.why.controlHeading`,
`clippings.why.controlRemoved`, `clippings.why.controlNone`,
`clippings.why.reportsHeading`, `news` (tampon « Amende · {fine} » compris :
c'est bien une amende), `bossLines`, les `eyebrow` des sept fins, les `title`
des fins sauf `cleanMiss` et `labyrinth`, `december.cells.outOf`,
`december.gameNumbers`, `december.metricChart.caption`,
`december.metricChart.reference`, `december.trustChart.reference`,
`december.trend`, `december.dataToggle`, `december.table.month`,
`december.table.trust`, `playbook`, `catalogue` (sauf `hiddenEffect`),
`share.replay`, `share.copy`, `share.copied`, `tourLoop`, `resume.title`,
`resume.resume`, `resume.restart`, `resume.review`, `footer`, `a11y.handLabel`,
`a11y.resumed`.

**Écrit pour le niveau** (en plus des cartes §18.4, des ordres et messages
§18.5, du téléphone et de la pastille §18.7, du catalogue §18.9) :

| Clé | FR | EN |
|---|---|---|
| dashboard.metric | Activation | Activation |
| dashboard.metricUnit | des inscrits, sous 7 jours | of sign-ups, within 7 days |
| dashboard.customers | Utilisateurs actifs | Active users |
| dashboard.trust | Confiance des utilisateurs | User trust |
| dashboard.radar | Radar CNIL | Regulator radar |
| visio.tag | DG · Quandi | CEO · Quandi |
| hand.unlocked | Débloqué par les appels | Unlocked by the calls |
| hand.productionEmpty | Rien en production pour l'instant. L'inscription actuelle : un e-mail, un mot de passe, un métier, puis un planning vide. | Nothing in production yet. The current sign-up: an email, a password, a trade, then an empty schedule. |
| report.metric | Activation | Activation |
| report.customers | Utilisateurs actifs | Active users |
| report.driversHeading | Pourquoi l'activation a bougé : {delta} | Why activation moved: {delta} |
| report.drivers.word | Ce que tes utilisateurs disent de Quandi | What your users say about Quandi |
| report.drivers.market | L'offre gratuite d'un concurrent | A competitor's free plan |
| effects.clean | astuces retirées, l'activation baisse un peu | tricks removed, activation dips a little |
| effects.gain | +{pct} % d'inscrits activés ce trimestre | +{pct}% activated sign-ups this quarter |
| effects.gainRising | +{pct} % d'inscrits activés ce trimestre, l'effet monte encore | +{pct}% activated sign-ups this quarter, and the effect is still growing |
| effects.loss | −{pct} % d'inscrits activés ce trimestre, des inscrits qui choisissent ce qu'ils donnent | −{pct}% activated sign-ups this quarter, sign-ups who choose what they give |
| events.surveyAnswers | Les appels sont faits : 4 inscrits sur 10 n'ont « pas su par où commencer », 3 sur 10 avaient « un agenda à reprendre ». Tes prochains chantiers viseront plus juste, et tu as enfin de quoi montrer au DG : « Point données avec le DG » est débloqué. | The calls are done: 4 sign-ups in 10 "didn't know where to start", 3 in 10 had "a calendar to bring over". Your next projects will aim better, and you finally have something to show the CEO: "Data review with the CEO" is unlocked. |
| events.control | Contrôle de la CNIL, article dans la presse, amende administrative de {fine} prononcée par sa formation restreinte. Le DG te demande de tout retirer avant vendredi. {leavers} utilisateurs suppriment leur compte. | An inspection by the CNIL, France's data protection authority, an article in the press, and an administrative fine of {fine} imposed by its sanctions committee. The CEO asks you to take everything down by Friday. {leavers} users delete their accounts. |
| events.reports | Des dizaines de plaintes déposées auprès de la CNIL. Un journaliste pose des questions au service presse. | Dozens of complaints filed with the CNIL. A journalist is asking the press office questions. |
| events.viral | Un fil viral dans un groupe d'indépendants : « Quandi, je ne leur confie plus rien, voici pourquoi. » Les inscrits repartent sans rien publier. | A viral thread in a freelancers' group: "Quandi, I don't trust them with anything any more, here's why." Sign-ups leave without publishing anything. |
| events.press | Un magazine pour indépendants cite Quandi en exemple d'un outil qui ne force pas la main. Les inscrits arrivent en sachant ce qu'ils viennent chercher. | A magazine for freelancers cites Quandi as a tool that doesn't push people around. Sign-ups arrive knowing what they came for. |
| events.competitor | Un concurrent a lancé une offre gratuite à vie au printemps. Des curieux se sont inscrits partout sans rien publier, chez toi aussi. | A competitor launched a free-for-life plan in the spring. Curious people signed up everywhere without publishing anything, with you too. |
| clippings.control.headline | Quandi sanctionné par la CNIL | Quandi fined by France's data protection watchdog |
| clippings.reports.masthead | La Lettre des indépendants | The Freelancer's Letter |
| clippings.reports.headline | Les plaintes contre Quandi s'accumulent | Complaints against Quandi pile up |
| clippings.viral.handle | @independant_et_fier | @freelance_and_proud |
| clippings.press.masthead | Indépendants Magazine | Freelancer Magazine |
| clippings.press.headline | Quandi, l'outil qui ne force pas la main | Quandi, the tool that doesn't push |
| clippings.competitor.masthead | La Lettre du logiciel | The Software Letter |
| clippings.competitor.headline | Le gratuit à vie arrive dans la planification | Free for life comes to scheduling tools |
| clippings.why.controlRadar | Chaque astuce mise en production a fait monter le radar CNIL, la tuile masquée de ton tableau de bord. Ce trimestre, il a franchi le seuil du contrôle. | Every trick you put into production pushed up the regulator radar, the hidden tile on your dashboard. This quarter it crossed the inspection threshold. |
| clippings.why.reports | Les plaintes arrivent à la CNIL : ton radar CNIL, la tuile masquée de ton tableau de bord, approche du seuil du contrôle. Chaque nouvelle astuce l'en rapproche. | Complaints are reaching the CNIL: your regulator radar, the hidden tile on your dashboard, is nearing the inspection threshold. Every new trick brings it closer. |
| december.cells.metric | Activation en {month} | Activation in {month} |
| december.cells.trust | Confiance des utilisateurs | User trust |
| december.cells.radar | Radar CNIL | Regulator radar |
| december.metricChart.title | Activation par mois | Activation per month |
| december.metricChart.label | Activation des inscrits sur l'année, mois par mois | Sign-up activation over the year, month by month |
| december.trustChart.title | Confiance des utilisateurs, le compteur que personne n'affichait | User trust, the counter nobody displayed |
| december.trustChart.caption | De 0 à 100. À 35 ou moins, les utilisateurs le racontent, et les inscrits repartent. | From 0 to 100. At 35 or below, users talk, and sign-ups leave. |
| december.trustChart.label | Confiance des utilisateurs sur l'année | User trust over the year |
| december.table.metric | Activation | Activation |
| catalogue.hiddenEffect | Confiance {trust}, radar {radar}, une seule fois, le jour où elle entre en production. Les inscrits qu'elle fait publier baissent de 30 % après trois mois. | Trust {trust}, radar {radar}, once, on the day it goes into production. The sign-ups it gets publishing drop by 30% after three months. |
| share.text | Une année chez Quandi : {title} Activation à {metric}, confiance à {trust}. Et toi, tu tiendrais ? {url} | A year at Quandi: {title} Activation at {metric}, trust at {trust}. Would you hold out? {url} |
| nextLevel.eyebrow | Niveau suivant | Next level |
| nextLevel.status | jouable | playable |
| resume.previously | Précédemment chez Quandi | Previously at Quandi |
| resume.quarterLine | Trimestre {q} : {cards}. Activation à {metric}. | Quarter {q}: {cards}. Activation at {metric}. |
| resume.finished | Ta dernière année chez Quandi s'est terminée ainsi : « {title} » | Your last year at Quandi ended like this: "{title}" |
| a11y.quarterEnd | Fin du trimestre {q} : activation {metric}, objectif {target} {status}, patience {patience}. | End of quarter {q}: activation {metric}, target {target} {status}, patience {patience}. |

**Les fins** (`endings`) : `win`, `eyebrow` et les titres non listés viennent du
niveau 1 ; `{metric}` arrive formaté (« 45,0 % »).

| id | Titre (si écrit) | Texte FR | Texte EN |
|---|---|---|---|
| applause | — | Activation à {metric} en décembre, {customers} utilisateurs actifs, une confiance à {trust} que personne ne mesurait. Pas une case cochée d'avance, pas un refus caché. Le DG t'a pressé trois fois. Tu as répondu avec des chiffres. C'est exactement le métier. | Activation at {metric} in December, {customers} active users, trust at {trust} that nobody was measuring. Not one box ticked in advance, not one hidden refusal. The CEO pushed you three times. You answered with numbers. That is exactly the job. |
| cleanMiss | Pas encore 45 %. Mais tout est propre. / Not 45% yet. But everything is clean. | Activation à {metric}, confiance à {trust}. La courbe monte encore, parce que les effets lents ne s'arrêtent pas en décembre. Le board voulait un chiffre, tu as construit une pente. Regarde la confiance : c'est elle qui fera les 45 % au printemps. | Activation at {metric}, trust at {trust}. The curve is still climbing, because slow effects don't stop in December. The board wanted a number; you built a slope. Look at trust: that's what will deliver the 45% in the spring. |
| firedClean | — | La patience du DG est tombée à {patience} avant que tes effets lents n'arrivent. Confiance à {trust}. L'année suivante, ton remplaçant a caché le refus des cookies. Le jeu ne récompense pas toujours ceux qui ont raison trop tôt. La vraie vie non plus. Rejoue, et présente tes données plus tôt. | The CEO's patience fell to {patience} before your slow effects could arrive. Trust at {trust}. The next year, your replacement hid the cookie refusal. The game doesn't always reward people who are right too early. Neither does real life. Play again, and show your data sooner. |
| firedDark | — | Tu as pris des astuces, et la patience du DG est quand même tombée à {patience}. Confiance à {trust}, radar à {radar}. Ce que le DG voulait, c'était le chiffre, tout de suite, et il ne se souvient pas de ce qu'il a demandé. | You used tricks, and the CEO's patience still fell to {patience}. Trust at {trust}, radar at {radar}. What the CEO wanted was the number, right now, and he doesn't remember what he asked for. |
| fine | — | Le radar est monté jusqu'au contrôle, l'amende est tombée, la presse a écrit. Activation à {metric} en décembre, confiance à {trust}. Les inscrits que tu as pressés ont fermé leur compte, et ils l'ont raconté. Ce que tu as mis en production a des noms. Ils sont en dessous. | The radar climbed all the way to an inspection, the fine landed, the press wrote about it. Activation at {metric} in December, trust at {trust}. The sign-ups you pushed closed their accounts, and told everyone why. What you put into production has names. They are below. |
| labyrinth | L'inscription tient. Regarde ce qu'elle coûte. / The sign-up holds. Look at what it costs. | Pas de contrôle cette année. Activation à {metric}, et une confiance à {trust} que ton dashboard ne t'a jamais montrée. Les utilisateurs que tu as pressés partent plus vite qu'ils ne sont venus. Le radar est à {radar}. Il ne redescend pas tout seul. | No inspection this year. Activation at {metric}, and trust at {trust} that your dashboard never showed you. The users you pushed leave faster than they came. The radar is at {radar}. It doesn't come down on its own. |
| repentant | — | Tu as mis des astuces en production, puis tu les as retirées. Activation à {metric}, confiance à {trust}, radar à {radar}. La confiance remonte plus lentement qu'elle ne tombe. C'est la seule règle du jeu qui est aussi celle de la vraie vie. | You put tricks into production, then took them out. Activation at {metric}, trust at {trust}, radar at {radar}. Trust climbs back more slowly than it falls. It's the one rule of the game that is also a rule of real life. |

Chaque texte dit ce que fait le modèle (E11) : les inscrits qui arrivent avec
la confiance du moment, les actifs qui partent plus vite quand elle baisse, les
rampes qui continuent, le radar qui ne baisse que sans astuce en production.
Aucun événement ne nomme une carte (§21.5). Deux fins nomment une astuce sans
la dire jouée : `applause`, la fin d'une année qui n'en a joué aucune, et
`firedClean`, où c'est le remplaçant qui la met en production, l'année
suivante.

### 18.9 Le catalogue : les huit astuces, vérifiées

Vérifié le 2026-10-04 par un agent de recherche, sur les sources primaires
quand elles étaient lisibles (cnil.fr, Légifrance par extraction, le Conseil
d'État, le communiqué de la CJUE, la FTC, le Cahier IP nº 6 de la CNIL, les
lignes directrices du CEPD, la recommandation de la CNIL sur les pixels). Ce qui
n'a été lu que dans une source secondaire est signalé ; tout le catalogue reste à
relire par Antoine avant l'ouverture (D9). Les cas sont au passé ; une
recommandation ou un arrêt d'interprétation n'est jamais présenté comme une
sanction.

**Deux règles propres à ce niveau** :

- **Les sanctions de la CNIL sont citées sans le nom de l'entreprise** (question
  commune QC3, §21.8). La CNIL anonymise ses délibérations deux ans après leur
  publication : Google, Facebook, Microsoft et TikTok sont déjà « [X] » sur
  Légifrance pour leurs amendes sur les cookies. Une entreprise n'est nommée que
  quand un tribunal la nomme (Google, par le Conseil d'État en 2020) ou quand
  l'autorité n'est pas la CNIL (Twitter, par la FTC).
- **Les indépendants sont des professionnels** : l'article 82 et le RGPD les
  protègent comme tout utilisateur, mais le Code de la consommation ne leur
  étend que les pratiques trompeuses (article L121-5), et la prospection entre
  professionnels, en rapport avec leur métier, n'exige qu'un droit
  d'opposition. Les textes ci-dessous en tiennent compte.

| Carte | Nom officiel FR / EN | Source du nom |
|---|---|---|
| banner | Rallonger le parcours / Longer than necessary | CEPD, lignes directrices 03/2022 ; typologie de la CNIL (LINC, 2026) |
| bundle | Consentement en bloc / Bundled consent | CEPD, lignes directrices 05/2020 sur le consentement, §42-44 |
| phone | Chantage à la sécurité / Safety blackmail | CNIL, « La forme des choix » (Cahier IP nº 6, 2019), p. 28 |
| prechecked | Réglage intrusif par défaut / Deceptive snugness | typologie de la CNIL (LINC, 2026) ; CEPD 03/2022 |
| analysis | Illusion de travail / Labor illusion | Buell et Norton, *Management Science*, 2011 (lu en source secondaire) ; « Labor » est l'orthographe de l'article, gardée telle quelle |
| pixels | Pixel espion / Tracking pixel | CNIL, recommandation sur les pixels de suivi (2026) |
| partners | Consentement de dernière minute / Last-minute consent | CNIL, Cahier IP nº 6 (2019) |
| tour | Harcèlement d'interface / Nagging | OCDE (2022) ; le seul nom déjà porté par une carte du niveau 1 (`cascade`) |

**Les textes** (`patterns.<id>`), à recopier tels quels :

**banner**
- law FR : Déposer des cookies de mesure ou de publicité demande l'accord de l'utilisateur : article 82 de la loi Informatique et Libertés. La CNIL précise que refuser doit être aussi simple qu'accepter, sur le même écran, par exemple avec deux boutons « Tout accepter » et « Tout refuser » de même format.
- law EN : Placing measurement or advertising cookies requires the user's agreement under French law, article 82 of the Data Protection Act. The CNIL, France's data protection authority, specifies that refusing must be as easy as accepting, on the same screen, for example with "Accept all" and "Reject all" buttons in the same format.
- cas FR : En décembre 2021, la CNIL a infligé une amende de 150 millions d'euros à un moteur de recherche et de 60 millions à un réseau social : refuser les cookies y demandait plusieurs clics, les accepter un seul.
- cas EN : In December 2021, the CNIL fined a search engine €150 million and a social network €60 million: refusing cookies took several clicks there, accepting them took one.
- tell FR : Si refuser te demande plus de clics qu'accepter, ce n'est pas un vrai choix.
- tell EN : If saying no takes more clicks than saying yes, it isn't a real choice.
- Sources : délibérations SAN-2021-023 et SAN-2021-024 du 31 décembre 2021 (Légifrance, anonymisées : refus en « au moins cinq actions » et « pas moins de trois actions ») ; lignes directrices et recommandation de la CNIL sur les cookies (délibérations 2020-091, §30, et 2020-092, §31-32). L'annonce date de janvier 2022, la décision du 31 décembre 2021 : écrire « décembre 2021 ».

**bundle**
- law FR : Un consentement doit être libre, spécifique et éclairé : quand plusieurs usages sont demandés, chacun doit l'être à part (RGPD, articles 4 et 7). Pour les contacts, l'agenda ou la position stockés sur le téléphone, l'article 82 de la loi Informatique et Libertés s'ajoute, et la CNIL recommande de demander chaque accès au moment où il sert.
- law EN : Consent must be free, specific and informed: when several uses are asked for, each one must be asked for separately (GDPR, articles 4 and 7). For contacts, calendar or location stored on the phone, French law adds article 82 of the Data Protection Act, and the CNIL recommends asking for each access at the moment it is needed.
- cas FR : En 2019, la CNIL a infligé 50 millions d'euros à Google, notamment pour un consentement recueilli d'un bloc pour toutes les finalités. Le Conseil d'État a confirmé la sanction en 2020 : un tel consentement « ne peut être regardé comme éclairé ».
- cas EN : In 2019, the CNIL fined Google €50 million, notably for consent collected in one block for every purpose. France's Council of State upheld the fine in 2020: such consent "cannot be regarded as informed".
- tell FR : Chaque accès se demande à part, au moment où l'appli en a besoin.
- tell EN : Each access gets asked for separately, when the app actually needs it.
- Sources : Conseil d'État, 19 juin 2020, nº 430810 (lu) ; recommandation de la CNIL sur les applications mobiles (24 septembre 2024), page « permissions » (lue) ; CEPD 05/2020, §42-44. Le pitch dit « un écran de l'appli » : iOS et Android affichent une fenêtre par permission, un seul bouton ne peut être qu'un écran maison qui enchaîne les demandes.

**phone**
- law FR : Une donnée collectée pour une finalité ne peut pas servir à une autre qui lui est incompatible : RGPD, article 5. La CNIL en donne l'exemple : un numéro présenté comme servant à l'authentification, qui sert en réalité à la prospection.
- law EN : Data collected for one purpose cannot be used for another, incompatible one: GDPR, article 5. The CNIL gives this very example: a phone number presented as being for authentication, actually used for marketing.
- cas FR : Aux États-Unis, Twitter a accepté en 2022 de payer 150 millions de dollars pour clore des poursuites de la FTC, l'autorité fédérale de la consommation : des numéros de téléphone et des adresses e-mail, demandés pour sécuriser les comptes, avaient servi à cibler de la publicité.
- cas EN : In the United States, Twitter agreed in 2022 to pay $150 million to settle charges by the FTC, the federal consumer protection agency: phone numbers and email addresses requested to secure accounts had been used to target advertising.
- tell FR : Un numéro donné pour ta sécurité ne doit jamais servir à te relancer.
- tell EN : A number you gave for your security should never be used to chase you.
- Sources : communiqué de la FTC du 25 mai 2022 (lu) ; Cahier IP nº 6 de la CNIL, p. 28 (lu : « faire croire que la collecte du numéro de téléphone servira […] à l'authentification à deux facteurs, alors qu'en réalité elle servirait à de la prospection »). Un accord transactionnel, pas une condamnation.

**prechecked**
- law FR : Une case cochée d'avance n'est jamais un consentement : RGPD, considérant 32. Une offre en rapport avec leur métier aurait pu s'envoyer à des indépendants sans case, avec un simple droit de s'y opposer ; mais Quandi a choisi de demander un accord, et un accord se donne par un geste.
- law EN : A box ticked in advance is never consent: GDPR, recital 32. An offer related to their trade could have been sent to freelancers without any box, with a simple right to object; but Quandi chose to ask for agreement, and agreement is given by an action.
- cas FR : En 2019, la Cour de justice de l'Union européenne a jugé, à propos des cookies d'un jeu-concours en ligne, qu'une case cochée d'avance ne vaut pas consentement.
- cas EN : In 2019, the Court of Justice of the European Union ruled, in a case about an online competition's cookies, that a box ticked in advance is not consent.
- tell FR : Une case cochée d'avance n'a jamais valu un oui.
- tell EN : A box ticked in advance has never meant yes.
- Sources : CJUE, 1er octobre 2019, C-673/17, Planet49 (communiqué de presse nº 125/19 lu ; arrêt intégral non lu) ; CEPD 05/2020, §79 et §123 ; page de la CNIL sur la prospection par courrier électronique (lue). Un arrêt d'interprétation, pas une sanction. La case de Planet49 portait sur les cookies, d'où « à propos des cookies ».

**analysis**
- law FR : Aucune règle ne la nomme. Mais faire croire qu'un service accomplit un travail qu'il ne fait pas trompe sur ses qualités : article L121-2 du Code de la consommation, que l'article L121-5 étend aux pratiques qui visent les professionnels. C'est l'affaire de la DGCCRF, pas de la CNIL.
- law EN : No rule names it. But making people believe a service does work it doesn't do misleads them about its qualities: article L121-2 of the French Consumer Code, which article L121-5 extends to practices aimed at professionals. That's for the DGCCRF, France's consumer protection authority, not the CNIL.
- cas FR : En 2011, deux chercheurs de la Harvard Business School ont montré qu'un service qui montre son travail pendant l'attente paraît plus précieux. Les barres de progression qui ne calculent rien imitent ce travail.
- cas EN : In 2011, two Harvard Business School researchers showed that a service that shows its work while you wait seems more valuable. Progress bars that compute nothing imitate that work.
- tell FR : Si l'attente ne calcule rien, elle sert à te faire croire quelque chose.
- tell EN : If the wait isn't computing anything, it's there to make you believe something.
- Sources : C. consom. L121-2 2° b et L121-5 (lus sur Légifrance) ; Buell et Norton, « The Labor Illusion », *Management Science* 57(9), 2011 (lu en source secondaire seulement : à relire). Aucun cas d'autorité : la carte est la « zone grise » du niveau, et son radar (+3) est le plus faible.

**pixels**
- law FR : Un pixel qui enregistre qui ouvre un e-mail, et quand, est un traceur : il demande l'accord du destinataire (article 82 de la loi Informatique et Libertés). Seule une mesure réduite, la date de la dernière ouverture, peut s'en passer, pour vérifier que les e-mails arrivent.
- law EN : A pixel that records who opens an email, and when, is a tracker: it needs the recipient's agreement (article 82 of the French Data Protection Act). Only a reduced measure, the date of the last opening, can do without it, to check that emails are getting through.
- cas FR : En avril 2026, la CNIL a publié sa recommandation sur les pixels de suivi dans les e-mails : mesurer les ouvertures pour optimiser les envois demande un accord. Ce n'est pas une sanction, c'est la règle telle que la CNIL la lit.
- cas EN : In April 2026, the CNIL published its recommendation on tracking pixels in emails: measuring openings to optimise mailings requires agreement. It is not a sanction; it is the rule as the CNIL reads it.
- tell FR : Savoir quand tu ouvres un e-mail, c'est un traceur : il faut ton accord.
- tell EN : Knowing when you open an email is tracking: it needs your agreement.
- Sources : recommandation de la CNIL relative aux pixels de suivi dans les courriels, adoptée le 12 mars 2026, publiée le 14 avril 2026 (lue) : elle range les e-mails de bienvenue parmi les courriels transactionnels, d'où le pitch « pour caler les relances » (une mesure de performance, pas de délivrabilité). Du droit souple, pas une sanction.

**partners**
- law FR : Un consentement n'est pas libre quand un service est subordonné à un traitement dont il n'a pas besoin (RGPD, article 7). Transmettre des coordonnées à des partenaires demande un accord à part, qu'on peut refuser sans perdre son compte.
- law EN : Consent is not free when a service is made conditional on processing it doesn't need (GDPR, article 7). Passing details on to partners needs a separate agreement, one you can refuse without losing your account.
- cas FR : En mai 2025, la CNIL a infligé 80 000 euros à un courtier en données de neuf salariés, notamment pour avoir transmis des adresses à ses partenaires sans le consentement des personnes.
- cas EN : In May 2025, the CNIL fined a data broker with nine employees €80,000, notably for passing addresses on to its partners without people's consent.
- tell FR : Si refuser le partage t'empêche de t'inscrire, ton accord n'est pas libre.
- tell EN : If refusing to share stops you signing up, your agreement isn't free.
- Sources : délibération SAN-2025-002 du 15 mai 2025 (cnil.fr et Légifrance, lues ; nominative jusqu'en mai 2027 environ, citée ici sans le nom, QC3) ; CEPD 05/2020, §26.

**tour**
- law FR : Aucune loi ne l'interdit à un outil comme Quandi. Le règlement européen sur les services numériques interdit de redemander un choix déjà fait, mais il ne vise que les plateformes en ligne, et pas les petites.
- law EN : No law forbids it for a tool like Quandi. The EU's Digital Services Act bans asking again for a choice already made, but it only covers online platforms, and not small ones.
- cas FR : En 2022, l'OCDE l'a rangée dans sa classification des dark patterns : des demandes répétées de faire ce que l'entreprise préfère.
- cas EN : In 2022, the OECD listed it in its classification of dark patterns: repeated requests to do what the company prefers.
- tell FR : Une aide qu'on ne peut pas fermer n'aide plus : elle pousse.
- tell EN : Help you can't close isn't helping any more: it's pushing.
- Sources : règlement (UE) 2022/2065, articles 19 et 25 (lus au JO de l'UE) ; OCDE, *Dark Commercial Patterns*, 2022.

**Liste blanche des marques** (série C6) : Google, Twitter. Tout autre nom propre
d'un `cas` est un nom d'institution (CNIL, FTC, Conseil d'État, Cour de justice
de l'Union européenne, OCDE, Harvard Business School) ou un mot ordinaire, que
le test liste.

**Le nom de l'entreprise** : « Créneo » (pris : creneo.fr, creneo.app),
« Slotix » (slotix.io), « Planibo », « Agendix », « Rendezo » et « Créneau+ »
écartés ; « Plannea » libre mais trop proche de Planity, le leader de la
réservation pour coiffeurs ; **« Quandi »** ne sort sur aucun produit (recherche
web du 2026-10-04, domaines muets). INPI à faire (D9).

**Corrigé dans l'esquisse du §11.2** : les amendes « de janvier 2022 » sont du
31 décembre 2021 ; celles des cookies reposent sur l'article 82 de la loi
Informatique et Libertés, pas sur le RGPD ; TikTok, ce sont deux sociétés à
2,5 M€ chacune ; « Refus caché », « Action forcée » et « Faux signal » ne sont
pas les noms des taxonomies pour ces mécanismes.

### 18.10 Questions pour Antoine

Au format de `CHANTIERS.md` C. Les questions communes aux trois niveaux (le bloc
« niveau suivant », les bandeaux, les sanctions de la CNIL sans nom) sont au
§21.8. La spécification est écrite selon chaque reco ; une autre réponse la
change avant le code (§21.1).

| # | Question | Reco | Si on se trompe | Réponse |
|---|---|---|---|---|
| Q1 | **Le chiffre du board : le taux d'activation, de 30 % à 45 %**, objectifs 32,3 · 35,3 · 39,0 · 45,0 % ? | **Oui** : c'est la définition de l'activation dans le Tour, et l'équilibrage du niveau 2 s'y reprend tel quel. | Un autre chiffre change la tuile, les messages du DG et les tables, pas les cartes. | **Oui** (C78, Antoine, 2026-10-04). |
| Q2 | **Le nom : Quandi** ? | **Oui** : rien ne le porte dans le secteur. Écartés : Créneo (pris), Plannea (trop proche de Planity). | Un nom propre dans toute la copie, remplaçable en une passe avant T1. | **Oui** (C79, Antoine, 2026-10-04). |
| Q3 | **Le contrôle : une amende administrative de 100 000 €, rendue publique** ? | **Oui** : environ 3 % du chiffre d'affaires, du même ordre que l'amende publiée d'un courtier en données de neuf salariés (80 000 €). Écarté : 20 000 € (la procédure simplifiée, jamais publiée, donc pas d'article de presse). | Un montant dans `levels/activation.ts`, sans effet sur l'équilibrage. | **Oui** (C80, Antoine, 2026-10-04). |
| Q4 | **Les huit astuces du §18.4**, dont trois retirées de l'esquisse et trois ajoutées (§18.1) ? | **Oui** : sept noms neufs sur huit, au lieu de trois. | Changer une astuce change sa carte, sa ligne de téléphone et son catalogue : une PR de spécification avant T1. | **Oui** (C81, Antoine, 2026-10-04). |

### 18.11 La copie autour du jeu

Ce que les autres pages disent du niveau (§21.3, T3), à recopier :

| Où | Clé | FR | EN |
|---|---|---|---|
| `meta.ts` | `GAME_META.activation.title` | Quandi : le jeu de l'activation — Tour de Growth | Quandi: the activation game — Tour de Growth |
| `meta.ts` | `GAME_META.activation.description` | Joue une année comme PM growth d'un outil de planification pour indépendants : un DG qui veut 45 % d'activation, et huit astuces à reconnaître. | Play a year as the growth PM of a scheduling tool for freelancers: a CEO who wants 45% activation, and eight tricks to learn to spot. |
| `meta.ts` | `GAME_META.activation.breadcrumb` | Une année chez Quandi | A year at Quandi |
| `meta.ts` | `GAME_META.activation.shareImageAlt` | Une année chez Quandi : 30,0 % d'activation, la confiance et le radar CNIL absents du dashboard. | A year at Quandi: 30.0% activation, user trust and the regulator's radar missing from the dashboard. |
| `meta.ts` | `ACTIVATION_INTRO.eyebrow` | Le côté obscur · activation | The dark side · activation |
| `meta.ts` | `ACTIVATION_INTRO.title` | Une année chez Quandi | A year at Quandi |
| `meta.ts` | `ACTIVATION_INTRO.lead` | Ton DG dirige maintenant Quandi, un outil de planification en ligne pour indépendants, et il t'a emmené avec lui comme PM growth. 10 000 inscriptions par mois, et 30 % seulement publient un premier planning dans la semaine. Le board en veut 45 % d'ici décembre. Chaque trimestre, le DG t'appelle en visio, puis tu as droit à deux actions, nommées comme on les nomme en réunion. Tu ne sauras ce qu'elles valent qu'une fois le trimestre passé. Le DG, lui, sait déjà ce qu'il veut. | Your CEO now runs Quandi, an online scheduling tool for freelancers, and he brought you along as growth PM. 10,000 sign-ups a month, and only 30% publish a first schedule within the week. The board wants 45% by December. Every quarter the CEO calls you on video, then you get two actions, named the way they are named in meetings. You will only learn what they are worth once the quarter is over. The CEO already knows what he wants. |
| `meta.ts` | `ACTIVATION_INTRO.stepsTitle`, `steps`, `glossaryLead` | *(niveau 1, par référence)* | |
| `entry.ts` | `GAME_ENTRY_COPY.activation.title` | Le côté obscur de l'activation | The dark side of activation |
| `entry.ts` | `…body` | Voici ce qu'il ne faut pas faire : joue une année comme PM growth d'un outil de planification pour indépendants, un DG qui veut des inscrits activés, et huit astuces que tu reconnaîtras ensuite partout. | Here is what not to do: play a year as the growth PM of a scheduling tool for freelancers, with a CEO who wants activated sign-ups, and eight tricks you will recognise everywhere afterwards. |
| `entry.ts` | `…cta` | Jouer le niveau « Comment ils comprennent ce que vous apportez » | Play the level "How they understand what you bring" |
| `entry.ts` | `…band.metric` | Activation {metric} | Activation {metric} |
| `entry.ts` | `…opening`, `meta`, `band.trust`, `band.notOnDashboard` | *(les constantes partagées du fichier)* | |
| `hub.ts` | `zones.activation.company` | Quandi, un outil de planification pour indépendants | Quandi, a scheduling tool for freelancers |
| `hub.ts` | `ENDINGS_BY_LEVEL.activation` | *(aucune entrée : « le contrôle et l'amende » du niveau 1 est juste)* | |
| `hub.ts` | `LEVEL_TEASERS.activation` (T0) | « Comment ils comprennent ce que vous apportez » : le refus des cookies au bout du parcours, la case cochée d'avance, le numéro demandé pour la sécurité | "How they understand what you bring": the cookie refusal at the end of the path, the box ticked in advance, the number asked for security |
| `page.tsx` | les deux mots du glossaire | `["activation", "aha-moment"]` | |

### 18.12 Plan d'exécution

Les PR T1 à T4 du §21.3, avec ce qui est propre au niveau. Le découpage en
unités pour les sous-agents est au §21.9 (unités ACT-1 à ACT-4).

- **T1, la copie** : `ActivationCopy`, `ActivationOrderId` (`bundle`, `banner`,
  `phone`, `prechecked`, `partners`), `ActivationPhoneCopy` (§18.7, un champ par
  ligne du tableau, `callsAnswers: readonly string[]`) et `CookiePillCopy`
  (`easy`, `hidden`, `lawSuffix`), la pastille sous la clé `cookies`, dans
  `src/lib/game/copy.ts` ; aucun gabarit propre au niveau
  (`ACTIVATION_COPY_TEMPLATES = { ...LEVEL_COPY_TEMPLATES }`, déclaré quand même,
  comme `ACQUISITION_COPY_TEMPLATES`, pour que le test vérifie les gabarits
  communs). `src/content/game/activation.ts`, `ACTIVATION_INTRO` et
  `GAME_META.activation` dans `meta.ts`. Le test
  `src/content/__tests__/game-activation.test.ts` : C1 exige dans chaque `law`
  l'un de « loi Informatique et Libertés », « RGPD », « Code de la
  consommation », « règlement européen sur les services numériques » (et leurs
  équivalents anglais « Data Protection Act », « GDPR », « Consumer Code »,
  « Digital Services Act ») ; la règle du contrôle remplace C14 : l'événement
  `control` dit « amende » et « CNIL » (EN « fine » et « CNIL ») ; le tampon,
  repris du niveau 1, dit « Amende » (EN « Fined ») ; la fin `fine` dit
  « amende » (EN « fine ») ; aucune chaîne du niveau ne dit « transaction »
  (EN « settlement ») ;
  C6 avec la liste blanche Google, Twitter ; C13 tient les « 1 » et « 3 » de la
  pastille.
- **T2, le téléphone** : `src/lib/game/planner-phone.ts` (`plannerPhoneView`,
  `cookieRefusal`, `REFUSE_CLICKS_EASY`, `REFUSE_CLICKS_HIDDEN`, recopiés du
  §18.7), `src/components/game/PlannerPhone.tsx` et `CookiePill.tsx`, leurs
  `.module.css`, `ACTIVATION_SIDE` dans `sides.tsx`, les aperçus
  `.design-sync/previews/PlannerPhone.tsx` et `CookiePill.tsx`, et
  `src/__tests__/game-planner-phone.test.ts` (chaque ligne de la table de la
  pastille, l'ordre des éléments pour aucune carte, pour toutes, et pour
  `banner` avec et sans `refuse`).
- **T3, le branchement** : la table du §21.3 ; la page
  `src/app/[locale]/game/activation/page.tsx` ; le niveau prend sa place entre
  l'acquisition et la rétention dans `GAME_LEVELS_BY_PILLAR`.
- **T4, les specs** : `e2e/game-activation.spec.ts`, d'après le §18.6 ; le
  taux s'affiche au dixième de point avec « % », jamais « clients ».
