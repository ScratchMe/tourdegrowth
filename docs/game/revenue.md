# GAME-BRIEF.md, niveau revenue — « Comment vous gagnez de l'argent » (§20)

*Écrite le 2026-10-04 (`CHANTIERS.md` A24), pour qu'un agent construise ce
niveau sans rien avoir à décider : chaque chaîne est écrite en français et en
anglais, chaque chiffre est celui que produit le modèle déjà codé
(`src/lib/game/levels/revenue.ts`, épinglé par
`src/lib/game/__tests__/revenue.test.ts`). Le comment, l'ordre des PR et la
définition de terminé sont dans [`construire-un-niveau.md`](construire-un-niveau.md)
(§21), à lire avant ce fichier. Un renvoi « §n » sans nom de fichier désigne
`GAME-BRIEF.md` ; « §17.x », la spécification du niveau 2
([`niveau-2.md`](niveau-2.md)), dont celle-ci reprend le plan.*

*Les textes de cette spécification passent au statut « à relire » en entrant
dans le code (convention 6) et partent dans un bon à tirer. Ils sont écrits
sans espaces insécables : l'agent les pose en recopiant (§21.5).*

---

## 20. Le niveau revenue — spécification

### 20.0 En une page

- **L'univers.** Le DG dirige maintenant **Gainix**, une appli grand public de
  sport : programmes d'entraînement, défis, un abonnement mensuel ou annuel, et
  une monnaie virtuelle, les gemmes, pour des tenues d'avatar. 200 000
  utilisateurs actifs, qui rapportent 4,00 € chacun par mois. Le board veut
  6,00 € en décembre.
- **Le chiffre du board** : le revenu mensuel par utilisateur actif. Des euros
  au centime, qui doivent **monter**.
- **Le radar est celui de la DGCCRF**, comme aux niveaux 1 et 2. Le contrôle
  finit en **deux procédures** : une transaction pénale avec l'accord du parquet
  pour les pratiques trompeuses, et une amende administrative pour les
  informations manquantes.
- **Ce qui ne change pas** : tout le reste (section 4).
- **L'équilibrage est celui du niveau 2**, carte pour carte par rôle : l'année
  honnête de référence (A) garde la patience validée (51, 42, 46, 73).
- **Le téléphone** montre l'écran des offres, le paiement et la boutique de
  gemmes ; **la pastille** dit ce qui sera prélevé à la fin de l'essai.

### 20.1 Ce qui change depuis l'esquisse du §11.4

La vérification juridique du 2026-10-04 a trouvé quatre erreurs dans l'esquisse
(§20.9) et deux astuces déjà prises par le niveau 2.

| Esquisse §11.4 | Ici | Pourquoi |
|---|---|---|
| Montée de gamme par défaut → Présélection | **reformulée** : une option payante cochée d'avance (`addon`), « option pré-cochée » | Aucun texte ne vise la présélection de l'offre principale ; une option payante cochée d'avance a son article (L121-17) et un arrêt de la CJUE. |
| Frais de service au dernier écran → Frais cachés | **retirée**, remplacée par le programme qui cache un abonnement (`hiddensub`, abonnement caché) | « Frais cachés » est au niveau 2. |
| Remise de minuit → Fausse urgence | **retirée**, remplacée par l'achat d'un seul appui (`express`, achat involontaire) | « Fausse urgence » est au niveau 2 ; l'achat involontaire a un cas net (Epic Games). |
| Renouvellement silencieux → loi Chatel, « article L215-1 » avec une amende | **gardée** (`renewal`), **sans amende** | L215-1 n'a qu'une sanction civile : le consommateur peut résilier à tout moment, remboursé. |
| Coffres à récompenses → loot boxes | **gardée** (`lootbox`), dite **non interdite en France** | Une loot box n'est une loterie interdite que si elle promet un gain réel ; sinon, seule l'information est due. |
| Prix personnalisé → information précontractuelle | **gardée** (`pricing`), article exact : 11° du I de L221-5 | — |

Résultat : **les huit noms officiels sont absents des niveaux 1 et 2**.

### 20.2 L'univers et le chiffre du board

- **Gainix**, appli de sport. Un nom inventé, au double sens voulu : les gains
  musculaires et ceux du board. La recherche du 2026-10-04 est au §20.9 ; la
  vérification INPI reste à faire (D9).
- **Le chiffre du board : le revenu par utilisateur actif.** 4,00 € en janvier ;
  objectifs de trimestre **4,30 €, 4,70 €, 5,20 €, puis 6,00 €** : ceux du
  niveau 2 multipliés par 4 / 2 000, qui tombent juste au centime.
- **L'appli** : 200 000 utilisateurs actifs au 1er janvier ; 10 000 arrivent et
  5 % s'arrêtent chaque mois ; le revenu mensuel est le nombre d'utilisateurs
  actifs multiplié par le chiffre du board. Soit 0,80 M€ en janvier. La base ne
  bouge pas.
- **L'affichage** : la tuile arrondit au centime (« 4,30 € »). Décembre est
  gagné à 6,00 € affiché, soit 5,995 € et plus.

### 20.3 Le modèle

Déjà codé (`levels/revenue.ts`) : **l'agent n'y touche pas** (§21.2).

`revenu par utilisateur = 4,00 € × (1 + hr) × (1 + dr) × (2 − trustMult(lagTrust)) × presse − spike − saison`, plancher 0,80 €

**L'économie** (`Economy.kind = "arpu"`) :

- arrivées = 10 000 × (1 + (confiance − 60) / 150), sur la confiance du moment ;
- utilisateurs actifs = actifs × (1 − 5 % × trustMult(lagTrust)) + arrivées ;
- revenu mensuel = actifs × revenu par utilisateur × multiplicateur de revenu
  (1,02 avec `renewal` : les abonnés inactifs reconduits continuent de payer,
  un revenu que le chiffre « par utilisateur actif » ne compte pas).

**Les constantes**, en regard du niveau 2 :

| Constante | Niveau 2 | Revenue | Rapport |
|---|---|---|---|
| Chiffre de janvier | 2 000 | 4,00 € | ×4/2 000 |
| Objectifs T1 à T4 | 2 150 · 2 350 · 2 600 · 3 000 | 4,30 · 4,70 · 5,20 · 6,00 € | exacts |
| Victoire en décembre | ≥ 2 995 | ≥ 5,995 € | ce que la tuile affiche |
| Plafonds honnête / astuces | 0,43 / 0,82 | identiques | — |
| Plancher | 400 | 0,80 € | ×4/2 000 |
| Saison (mois 4 à 6) | −100 | −0,20 €, une grande appli de sport qui divise son abonnement par deux | idem |
| Spike du contrôle / du fil viral | 500 / 330 | 1,00 € / 0,66 € | idem |
| Décroissance du spike | 170 par mois | 0,34 € par mois | idem |
| Patience perdue par écart | 0,084 par client | 42 par euro, soit 8,4 pour 0,20 € manqué | idem |
| Presse | ×1,05 sur le chiffre | identique | — |
| Courbe de décembre | 1 000 à 4 000 | 2 à 8 €, graduée à 2, 4, 6, 8 | — |

**Le contrôle : deux procédures de la DGCCRF, 375 000 € au total.** Ce que fait
Gainix mêle deux régimes (§20.9) : des **pratiques commerciales trompeuses**
(l'essai qui se change en abonnement, le programme qui cache un abonnement, la
monnaie qui obscurcit les prix), un délit que la DGCCRF règle par une
**transaction pénale** avec l'accord du parquet (L132-2, L523-1) ; et des
**manquements aux obligations d'information** (le prix personnalisé non
signalé, le bouton qui fait payer sans le dire), punis d'une **amende
administrative** de 75 000 € au plus pour une société (L242-10). **Une
transaction de 300 000 € et une amende de 75 000 €, soit 375 000 €**, fixe
(C14), validé par Antoine (C89) : environ 4 % du chiffre d'affaires annuel de
Gainix (9,6 M€). La reconduction sans e-mail n'a pas d'amende (L215-1) ;
l'option cochée d'avance a la sienne, une amende administrative de 15 000 € au
plus (L132-22), que le jeu compte dans les 75 000 € pour rester simple. Le jeu dit « {fine} au total ».

### 20.4 Les cartes

Règle d'écriture inchangée (§5.5), sans marque réelle. Chiffres du niveau 2
pour le même rôle.

**Honnêtes** (`honestOrder` : `fullprice, checkout, downgrade, programs, present, trialmail, roundpacks, renewmail, clean`)

| id | Nom FR | Pitch FR | Nom EN | Pitch EN | gain | ramp | trust | radar | autres | rôle |
|---|---|---|---|---|---|---|---|---|---|---|
| fullprice | Prix complet affiché | Sur l'écran des offres, le prix annuel s'affiche en entier, avant son équivalent mensuel. | Full price shown | On the plans screen, the yearly price shows in full, before its monthly equivalent. | 0,05 | 0,09 | +4 | −2 | perm | pause |
| checkout | Question au paiement abandonné | Une question facultative à ceux qui quittent l'écran de paiement : « Qu'est-ce qui t'a arrêté ? » | Abandoned-checkout question | One optional question for people who leave the payment screen: "What held you back?" | | | +2 | | `insight` | survey |
| downgrade | Offre adaptée | Quand l'usage baisse, l'appli propose de passer au plan Essentiel, moins cher. | Right-sized plan | When usage drops, the app suggests moving to the cheaper Essential plan. | 0 | 0,12 | +3 | | perm | onboard |
| programs | Programmes de coachs | Des programmes conçus avec des coachs diplômés, vendus à l'unité, au prix affiché. | Coach programmes | Programmes designed with qualified coaches, sold one by one, at the price shown. | 0,03 | 0,08 | +3 | | perm | annual |
| present | *(niveau 1, par référence)* | | | | | | | | `present` | present |
| trialmail | Rappel de fin d'essai | Un e-mail et une notification trois jours avant la fin de l'essai, avec le prix et un lien pour arrêter. | Trial-end reminder | An email and a notification three days before the trial ends, with the price and a link to stop. | −0,01 | | +8 | −8 | perm | remind |
| roundpacks | Packs au compte rond | Les packs de gemmes correspondent exactement aux prix des tenues, et chaque tenue dit son prix en euros. | Round packs | Gem packs match the outfit prices exactly, and every outfit shows its price in euros. | 0 | 0,08 | +3 | | perm | reco |
| renewmail | Renouvellement annoncé | Un e-mail un mois avant chaque échéance annuelle, avec la date limite pour arrêter. | Renewal notice | An email a month before each yearly renewal, with the deadline to stop it. | −0,03 | | +10 | −20 | perm, `temp` | three |
| clean | *(nom du niveau 1)* | Revenir aux offres, au paiement et à la boutique d'origine. | *(niveau 1)* | Go back to the original plans, checkout and shop. | | | +6 | −25 | `clean` | clean |

Le gain négatif du « Rappel de fin d'essai » est l'essai qu'on arrête parce
qu'on a été prévenu ; celui du « Renouvellement annoncé », les abonnements
annuels non reconduits, le temps que ceux qui restent soient ceux qui veulent
rester (`temp`).

**Astuces** (`darkOrder` : `addon, lootbox, hiddensub, pricing, trial, express, renewal, gems` ; au premier trimestre, seulement `addon, lootbox, hiddensub, pricing`)

| id | Nom FR | Pitch FR | Nom EN | Pitch EN | gain | trust | radar | rôle |
|---|---|---|---|---|---|---|---|---|
| addon | Coach+ par défaut | À la souscription, l'option « Coach+, 2,99 € par mois » est déjà cochée sous l'offre choisie. | Coach+ by default | At sign-up, the "Coach+, €2.99 a month" option is already ticked under the chosen plan. | 0,12 | −4 | +10 | pdef |
| lootbox | Coffres à récompenses | Des coffres à 300 gemmes, au contenu tiré au hasard : tenues rares, bonus de défis. | Reward chests | Chests at 300 gems, with contents drawn at random: rare outfits, challenge boosts. | 0,10 | −5 | +15 | bury |
| hiddensub | Programme 8 semaines | Un programme affiché « 9,99 € » ; sous le bouton, en petit : « puis 9,99 € par mois ». | 8-week programme | A programme shown at "€9.99"; under the button, in small print: "then €9.99 a month". | 0,08 | −3 | +8 | cascade |
| pricing | Prix ajusté | Le prix de l'abonnement affiché varie selon le modèle de téléphone et l'historique d'achat. | Adjusted price | The subscription price shown varies with the phone model and the purchase history. | 0,03 | −2 | +3 | shame |
| trial | Essai converti | Essai gratuit de 14 jours, carte demandée à l'entrée ; il devient un abonnement annuel à 59,99 €, sans rappel. | Converting trial | A 14-day free trial, card required upfront; it becomes a €59.99 yearly subscription, with no reminder. | 0,18 | −10 | +25 | call |
| express | Achat express | Un seul appui achète une tenue, sur le bouton où l'on appuie pour la voir en aperçu. | Express purchase | A single tap buys an outfit, on the button you press to preview it. | 0,04 | −5 | +12 | social |
| renewal | Reconduction automatique | L'abonnement annuel se renouvelle sans e-mail avant l'échéance. | Automatic renewal | The yearly subscription renews with no email before the renewal date. | 0,04 | −5 | +12 | notice (`revenueMult` 1,02) |
| gems | Packs de gemmes | Les gemmes se vendent par 500, 1 200 ou 2 600 ; la tenue Marathon coûte 800 gemmes. | Gem packs | Gems come in packs of 500, 1,200 or 2,600; the Marathon outfit costs 800 gems. | 0,05 | −4 | +4 | streak |

### 20.5 Le DG

**Ordres** (déjà codés) : aucun au T1 ; puis `addon` au T2, `trial` au T3,
`lootbox` au T4 ; sinon la première disponible de
`addon, trial, lootbox, hiddensub, renewal`. Après un contrôle, il ne demande
plus ni `trial` ni `lootbox`.

| id | FR | EN |
|---|---|---|
| addon | l'option Coach+, tu la coches d'avance à la souscription. Ceux qui n'en veulent pas la décocheront. | the Coach+ add-on, you tick it in advance at sign-up. People who don't want it will untick it. |
| trial | l'essai passe à quatorze jours, avec la carte à l'entrée, et il bascule sur l'annuel. Pas de rappel : un rappel, c'est une résiliation. | the trial goes to fourteen days, card upfront, and it switches to the yearly plan. No reminder: a reminder is a cancellation. |
| lootbox | des coffres à gemmes, au contenu au hasard. Tous les jeux le font, et les gens adorent ouvrir. | gem chests, with random contents. Every game does it, and people love opening them. |
| hiddensub | le programme 8 semaines, on l'affiche à 9,99 €. Le mensuel, c'est écrit sous le bouton. | the 8-week programme, we show it at €9.99. The monthly part is written under the button. |
| renewal | l'annuel se renouvelle tout seul. Pas d'e-mail avant : ça réveille les gens. | the yearly plan renews on its own. No email beforehand: it wakes people up. |

**Messages de visio** écrits pour le niveau (les autres, niveau 1) :

| Clé | FR | EN |
|---|---|---|
| t1 | Bonjour. Nouvelle boîte, même promesse : le board veut 6 € de revenu par utilisateur en décembre, et je leur ai promis. Fin mars, je veux voir 4,30 €. Pas 4,20 €. Tu as deux chantiers ce trimestre. Je ne veux pas savoir comment, je veux le chiffre. | Morning. New company, same promise: the board wants €6 of revenue per user by December, and I promised them. By the end of March I want to see €4.30. Not €4.20. You have two projects this quarter. I don't want to know how. I want the number. |
| t2Miss | Tu m'as fait mentir en comité. {metric} au lieu de 4,30 €. Ça n'arrivera pas deux fois. Fin juin, {target}. | You made me look like a liar in front of the committee. {metric} instead of €4.30. It won't happen twice. End of June, {target}. |
| t4Hit | Dernière ligne droite. 6 € fin décembre et on fête ça. | Home stretch. €6 by the end of December and we celebrate. |
| t4Miss | C'est ton dernier trimestre, tu le sais. 6 € en décembre, ou je présente quelqu'un d'autre au board en janvier. | This is your last quarter, and you know it. €6 in December, or I introduce someone else to the board in January. |

### 20.6 Parcours de référence (fixtures)

Les années du niveau 2 (§17.6), carte pour carte par rôle. Tests F20.1 à F20.5
de `revenue.test.ts`, déjà écrits. **Les specs e2e (T4) les jouent à
l'interface d'après ces tables.**

**A** — T1 `fullprice + checkout`, T2 `downgrade + present`, T3 `programs + roundpacks`, T4 `trialmail + present`

| | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| Revenu par utilisateur | 4,20 € | 4,32 € | 5,31 € | 6,01 € |
| Patience | 51 | 42 | 46 | 73 |
| Humeur à l'ouverture | firm | angry | angry | firm |
| Ordre | — | addon | trial | lootbox |

Fin : `applause`, confiance 83, radar 0. Les utilisateurs actifs passent de
200 000 à 211 455, le revenu mensuel de 0,80 à 1,27 M€.

**B** — T1 `fullprice + checkout`, T2 `downgrade + programs`, T3 `roundpacks + present`, T4 `renewmail + present`

| | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| Revenu par utilisateur | 4,20 € | 4,47 € | 5,61 € | 6,01 € |
| Patience | 51 | 33 | 52 | 79 |

Fin : `applause`, confiance 85, radar 0.

**C** — T1 `addon + lootbox`, T2 `trial + hiddensub`, T3 `express + renewal`, T4 `fullprice + trialmail`

| | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| Revenu par utilisateur | 4,62 € | 4,82 € | 4,64 € | 1,93 € |
| Patience | 67 | 79 | 45 | 0 |
| Humeur à l'ouverture | firm | calm | firm | angry |
| Ordre | — | trial | renewal | addon |

Signalements et fil viral au T2, contrôle au T3 : 375 000 € au total, six
astuces retirées, 2 738 utilisateurs qui ferment leur compte. Fin : `fine`,
confiance 27, radar 1 ; 171 141 utilisateurs actifs et 0,33 M€ de revenu
mensuel en décembre, moins de la moitié de janvier.

**D** — T1 `checkout + trialmail`, T2 `present + roundpacks`

| | T1 | T2 |
|---|---|---|
| Revenu par utilisateur | 3,96 € | 3,89 € |
| Patience | 41 | 16 |

Viré en juin. Fin : `firedClean`, confiance 73.

**Les quatre fins épinglées** (`paths-revenue.ts`), toutes celles du niveau 2
par rôle : `cleanMiss` (`checkout + downgrade`, `roundpacks + present`,
`programs + renewmail`, `present + trialmail` : 5,96 € en décembre),
`repentant` (`roundpacks + hiddensub`, `pricing + downgrade`,
`trialmail + fullprice`, `programs + clean`), `labyrinth` (`checkout + addon`,
`fullprice + programs`, `clean + lootbox`, `trial + trialmail`), `firedDark`
(`lootbox + trialmail`, `checkout + downgrade`).

**Joué au hasard** (cartes tirées dans la main, graine fixe, le même harnais pour les cinq niveaux) :

| Façon de jouer | Niveau 1 | Niveau 2 | Revenue |
|---|---|---|---|
| Honnêtes seulement | applaudissements 35 %, viré 34 %, droit dans tes bottes 19 % | 43 %, 27 %, 19 % | 41 %, 27 %, 21 % |
| Obéit au DG | labyrinthe 65 %, contrôle 23 % | 65 %, 23 % | 65 %, 23 % |
| N'importe quoi | labyrinthe 44 %, viré après astuces 44 % | 53 %, 34 % | 53 %, 34 % |

### 20.7 Le téléphone : l'abonnement et la boutique

Ce que voit un utilisateur de l'appli de Gainix, de l'écran des offres à la
boutique de gemmes et à son compte. Figure de texte, sans faux boutons.

**Couleur de marque** : un vert d'eau profond, en jeton (§21.3 T2, jamais
d'hexadécimal dans le module) : `--fit-brand: #0b7a73; /* 5.19 as text on white, and white on it */`
dans `src/styles/tokens/game.css` (bloc `:root`, après `--shop-brand`) ; dans les
`PAIRS` de `src/__tests__/game-token-contrast.test.ts`, après la ligne de
`shop-brand` :
`{ fg: "fit-brand", bg: "app-bg", stated: 5.19, role: "text", why: "Gainix's teal as text, and under white on its buttons" }`.
`FitPhone.module.css` pose `.fit { --phone-brand: var(--fit-brand); }`. Le vert
passe 4,5:1 sur blanc dans les deux sens.

**Le type et l'ordre** (`src/lib/game/fit-phone.ts`, composant `FitPhone`) :

```ts
import type { RevenueCardId } from "./levels/revenue";

export type FitPhoneItem =
  | { kind: "appBar" }
  /** The trial offer: `trial` (14 days, card, the yearly price in small print) or the base 7-day trial; `fullPrice` adds the yearly total first. */
  | { kind: "offer"; trial: boolean; fullPrice: boolean }
  /** The plan picked: the monthly price (`personal` with `pricing`), and `addon` ticked under it. */
  | { kind: "plans"; personal: boolean; addon: boolean }
  /** `trialmail`. */
  | { kind: "trialReminder" }
  /** `hiddensub`: the programme and its small print. */
  | { kind: "programme" }
  /** `programs`. */
  | { kind: "coaching" }
  /** `downgrade`. */
  | { kind: "downgrade" }
  /** The gem shop: `odd` packs with `gems` unless `roundpacks`; the euro price with `roundpacks`. */
  | { kind: "shop"; odd: boolean; euros: boolean }
  /** `lootbox`. */
  | { kind: "chest" }
  /** `express`. */
  | { kind: "express" }
  /** The account's renewal line: `notice` with `renewmail`, else `silent` with `renewal`, else `plain`. */
  | { kind: "renewal"; style: "plain" | "silent" | "notice" }
  /** `checkout`. */
  | { kind: "checkoutQuestion" };

export function fitPhoneView(ids: readonly string[]): FitPhoneItem[] {
  const has = (id: RevenueCardId) => ids.includes(id);
  const items: FitPhoneItem[] = [{ kind: "appBar" }];
  items.push({ kind: "offer", trial: has("trial"), fullPrice: has("fullprice") });
  items.push({ kind: "plans", personal: has("pricing"), addon: has("addon") });
  if (has("trialmail")) items.push({ kind: "trialReminder" });
  if (has("hiddensub")) items.push({ kind: "programme" });
  if (has("programs")) items.push({ kind: "coaching" });
  if (has("downgrade")) items.push({ kind: "downgrade" });
  items.push({ kind: "shop", odd: has("gems") && !has("roundpacks"), euros: has("roundpacks") });
  if (has("lootbox")) items.push({ kind: "chest" });
  if (has("express")) items.push({ kind: "express" });
  items.push({ kind: "renewal", style: has("renewmail") ? "notice" : has("renewal") ? "silent" : "plain" });
  if (has("checkout")) items.push({ kind: "checkoutQuestion" });
  return items;
}
```

**Les chaînes** (`RevenuePhoneCopy`) :

| Champ | Montré par | FR | EN |
|---|---|---|---|
| caption | toujours | L'abonnement et la boutique tels que les utilisateurs les voient | The subscription and the shop as users see them |
| appName | `appBar` | Gainix | Gainix |
| time | `appBar` | 07:02 | 07:02 |
| offerBase | `offer`, sans `trial` | Essai gratuit 7 jours, puis 7,99 € par mois | 7-day free trial, then €7.99 a month |
| offerTrial | `offer.trial` | 14 jours gratuits · carte bancaire demandée | 14 days free · card required |
| offerTrialSmall | `offer.trial`, en petit | puis 59,99 € par an | then €59.99 a year |
| fullPrice | `offer.fullPrice`, en premier | Annuel : 59,99 € par an, soit 5,00 € par mois | Yearly: €59.99 a year, that's €5.00 a month |
| plansTitle | `plans` | Les formules | Plans |
| monthly | `plans`, sans `personal` | Mensuel : 7,99 € par mois | Monthly: €7.99 a month |
| monthlyPersonal | `plans.personal` | Mensuel : 8,49 € par mois | Monthly: €8.49 a month |
| addon | `plans.addon` | ☑ Coach+ · 2,99 € par mois | ☑ Coach+ · €2.99 a month |
| trialReminder | `trialReminder` | Rappel envoyé 3 jours avant la fin de l'essai | Reminder sent 3 days before the trial ends |
| programme | `programme` | Programme 8 semaines · 9,99 € | 8-week programme · €9.99 |
| programmeSmall | `programme`, en petit | puis 9,99 € par mois, sans engagement | then €9.99 a month, cancel at any time |
| coaching | `coaching` | Programmes de coachs · 14,99 € l'unité | Coach programmes · €14.99 each |
| downgrade | `downgrade` | Tu t'entraînes moins ? Passe au plan Essentiel à 3,99 € | Training less? Switch to the Essential plan at €3.99 |
| shopTitle | `shop` | Boutique de gemmes | Gem shop |
| shopItem | `shop` | Tenue Marathon · 800 gemmes | Marathon outfit · 800 gems |
| packsRound | `shop`, sans `odd` | Packs : 400 · 800 · 1 600 gemmes | Packs: 400 · 800 · 1,600 gems |
| packsOdd | `shop.odd` | Packs : 500 · 1 200 · 2 600 gemmes | Packs: 500 · 1,200 · 2,600 gems |
| euros | `shop.euros` | soit 7,99 € la tenue | that's €7.99 for the outfit |
| chest | `chest` | Coffre Sprint · 300 gemmes · contenu au hasard | Sprint chest · 300 gems · random contents |
| express | `express` | Achat en un appui : toucher une tenue l'achète | One-tap buying: touching an outfit buys it |
| renewalPlain | `renewal` plain | Abonnement annuel · prochaine échéance le 3 mars | Yearly subscription · next renewal on 3 March |
| renewalSilent | `renewal` silent | Renouvelé automatiquement le 3 mars · 59,99 € prélevés | Renewed automatically on 3 March · €59.99 charged |
| renewalNotice | `renewal` notice | E-mail du 3 février : renouvellement le 3 mars, date limite pour arrêter le 2 mars | Email of 3 February: renews on 3 March, deadline to stop on 2 March |
| checkoutQuestion | `checkoutQuestion` | Paiement interrompu ? Dis-nous ce qui t'a arrêté. Facultatif. | Stopped at checkout? Tell us what held you back. Optional. |
| checkoutAnswers | `checkoutQuestion` | Trop cher pour ce que c'est · Essayer un programme d'abord · Autre | Too expensive for what it is · Try a programme first · Other |

**Le dessin, élément par élément** :
- `offer` : `fullPrice` en premier quand il y est, puis `offerBase` ; ou,
  avec `trial`, `offerTrial` puis `offerTrialSmall` en petit.
- `plans` : `plansTitle`, `monthly` ou `monthlyPersonal`, puis `addon` quand il
  y est.
- `shop` : `shopTitle`, `shopItem`, `packsRound` ou `packsOdd`, puis `euros`
  quand il y est. Sans `gems`, la boutique montre déjà les packs ronds :
  `roundpacks` n'ajoute que la ligne `euros`.
- `programme` : la ligne, puis `programmeSmall` en petit.
- `renewal` : une seule des trois lignes ; `checkoutQuestion` et ses trois
  `checkoutAnswers` en puces, comme `originAnswers` au niveau 2.
- Les lignes « en petit » prennent le style `.meta` de `ShopPhone`.
  `trialReminder`, `renewalNotice` et `euros` sont en vert « ok »
  (`--app-ok-text`). Rien en alerte sur le téléphone : la pastille porte le
  problème.

**Les identifiants de test et l'éclair** : `<figure data-testid="game-phone">` ;
chaque élément sauf `appBar` porte `data-testid="game-fit-<kind>"`. La clé de
l'éclair, exportée : `fitItemKey(item)` rend `offer:${trial}:${fullPrice}`,
`plans:${personal}:${addon}`, `shop:${odd}:${euros}`, `renewal:${style}`,
sinon `kind`.

**Ce qui ne se voit pas** : seules `present` et `clean` ne changent rien au
téléphone.

`checkoutAnswers` est un tableau de trois chaînes ; `events.surveyAnswers` (§20.8)
cite ses deux premières mot pour mot, en minuscules, comme les niveaux 1 et 2.

**La pastille** : ce qui sera prélevé à la fin de l'essai, sans que rien ne
l'annonce. Un fait mesurable ; le corail dit le problème, jamais une loi qui
n'existe pas (aucun texte français n'impose de rappel avant la fin d'un essai,
§20.9).

```ts
export const MONTHLY_EUR = 7.99;          // the copy's « 7,99 € »
export const MONTHLY_PERSONAL_EUR = 8.49; // `pricing`
export const YEARLY_EUR = 59.99;          // `trial`
export const ADDON_EUR = 2.99;            // `addon`
export interface TrialCharge { amount: number; silent: boolean; addon: boolean }
export function trialCharge(ids: readonly string[]): TrialCharge {
  const has = (id: RevenueCardId) => ids.includes(id);
  const base = has("trial") ? YEARLY_EUR : has("pricing") ? MONTHLY_PERSONAL_EUR : MONTHLY_EUR;
  const amount = Math.round((base + (has("addon") ? ADDON_EUR : 0)) * 100) / 100;
  return { amount, silent: has("trial") && !has("trialmail"), addon: has("addon") };
}
```

| Cartes en production ou cochées | Pastille FR | Pastille EN | Corail |
|---|---|---|---|
| aucune | Prélevé à la fin de l'essai : 7,99 € | Charged when the trial ends: €7.99 | non |
| `pricing` | Prélevé à la fin de l'essai : 8,49 € | Charged when the trial ends: €8.49 | non |
| `trial` | Prélevé à la fin de l'essai : 59,99 € · sans rappel avant le prélèvement | Charged when the trial ends: €59.99 · with no reminder before the charge | oui |
| `trial` + `pricing` | Prélevé à la fin de l'essai : 59,99 € · sans rappel avant le prélèvement (`pricing` ignoré) | Charged when the trial ends: €59.99 · with no reminder before the charge | oui |
| `trial` + `trialmail` | Prélevé à la fin de l'essai : 59,99 € | Charged when the trial ends: €59.99 | non |
| `addon` | Prélevé à la fin de l'essai : 10,98 € · dont une option cochée d'avance | Charged when the trial ends: €10.98 · including an add-on ticked in advance | oui |
| `pricing` + `addon` | Prélevé à la fin de l'essai : 11,48 € · dont une option cochée d'avance | Charged when the trial ends: €11.48 · including an add-on ticked in advance | oui |
| `trial` + `addon` | Prélevé à la fin de l'essai : 62,98 € · sans rappel avant le prélèvement · dont une option cochée d'avance | Charged when the trial ends: €62.98 · with no reminder before the charge · including an add-on ticked in advance | oui |
| `trial` + `trialmail` + `addon` | Prélevé à la fin de l'essai : 62,98 € · dont une option cochée d'avance | Charged when the trial ends: €62.98 · including an add-on ticked in advance | oui |

Chaînes (`ChargePillCopy`, sous la clé `charge`) : `amount` « Prélevé à la fin
de l'essai : {amount} » / "Charged when the trial ends: {amount}" (`{amount}`
formaté par `formatEuros`) ; `silentSuffix` « sans rappel avant le
prélèvement » / "with no reminder before the charge" ; `addonSuffix` « dont une
option cochée d'avance » / "including an add-on ticked in advance".
Composition : `amount`, puis ` · silentSuffix` si `silent`, puis
` · addonSuffix` si `addon` ; corail si l'un des deux. Gabarit déclaré :
`REVENUE_COPY_TEMPLATES = { ...LEVEL_COPY_TEMPLATES, "charge.amount": ["amount"] }`.

**C13, en deux temps.** En REV-1 (`game-revenue.test.ts`, la copie seule, sans
importer `fit-phone.ts`), avec un lecteur de montants : FR
`/(\d+(?:[\u00a0 ]\d{3})*),(\d{2})[\u00a0 ]€/g`, EN `/€(\d+(?:,\d{3})*)\.(\d{2})/g` :
- mêmes montants en français et en anglais pour `offerBase`,
  `offerTrialSmall`, `fullPrice`, `monthly`, `monthlyPersonal`, `addon`,
  `programme`, `programmeSmall`, `coaching`, `downgrade`, `euros`,
  `renewalSilent` ;
- 59,99 identique dans `offerTrialSmall`, `fullPrice` (1er montant),
  `renewalSilent` et `cards.trial.pitch` ; 7,99 dans `offerBase`, `monthly` et
  `hand.productionEmpty` ; 9,99 dans `programme`, `programmeSmall`,
  `cards.hiddensub.pitch` et `orders.hiddensub` ; 2,99 dans `phone.addon` et
  `cards.addon.pitch` ;
- le 2e montant de `fullPrice` vaut `Math.round(1er / 12 × 100) / 100`
  (5,00) ;
- les 800 gemmes de `shopItem` sont un pack de `packsRound` et pas de
  `packsOdd` ; les packs de `cards.gems.pitch` sont ceux de `packsOdd` ; 300
  dans `chest` et dans `cards.lootbox.pitch`.

En REV-2 (`game-fit-phone.test.ts`), dans les deux langues : `offerBase` et
`monthly` contiennent `formatEuros(locale, MONTHLY_EUR)`, `monthlyPersonal`
`MONTHLY_PERSONAL_EUR`, `offerTrialSmall`, `fullPrice` et `renewalSilent`
`YEARLY_EUR`, `addon` `ADDON_EUR`. `euros` (le prix de la tenue) n'est lié à
aucune constante.

**La pastille** (`src/components/game/ChargePill.tsx`, qui importe
`ClickPill.module.css` comme `BasketPill`) :
`ChargePill({ amount, silent, addon, labels, size, announce, className }: { amount: string; silent: boolean; addon: boolean; labels: ChargePillCopy; size?: "md" | "sm"; announce?: boolean; className?: string })`,
rendue `<p data-testid="game-charge" data-silent={silent} data-addon={addon}>` :
`charge.amount` rempli avec `amount` (déjà formaté), puis
`<span> · {silentSuffix}</span>` si `silent`, puis `<span> · {addonSuffix}</span>`
si `addon` ; corail (`styles.over`) si l'un des deux ; `aria-live="polite"` sauf
avec `announce={false}`. Elle n'importe `lib/game` qu'en `import type`. À
390 px, la forme courte de la barre d'action est en capitales : si la capture
la montre sur deux lignes, s'arrêter et le dire.

**Le côté de l'îlot** (`sides.tsx`), à recopier :

```tsx
type RevenueSideCopy = Pick<RevenueCopy, "phone" | "charge">;

/** The pill's sentence: what the trial's end charges, and why it is a problem. */
export function chargeSentence(copy: RevenueSideCopy, locale: Locale, c: TrialCharge): string {
  let text = fill(copy.charge.amount, { amount: formatEuros(locale, c.amount) });
  if (c.silent) text += ` · ${copy.charge.silentSuffix}`;
  if (c.addon) text += ` · ${copy.charge.addonSuffix}`;
  return text;
}

export const REVENUE_SIDE: IslandSide<RevenueSideCopy> = {
  render: ({ ids, copy, locale }) => {
    const c = trialCharge(ids);
    return (
      <>
        <FitPhone items={fitPhoneView(ids)} labels={copy.phone} />
        <ChargePill amount={formatEuros(locale, c.amount)} silent={c.silent} addon={c.addon} labels={copy.charge} announce={false} />
      </>
    );
  },
  pill: ({ ids, copy, locale }) => {
    const c = trialCharge(ids);
    return { text: fill(copy.charge.amount, { amount: formatEuros(locale, c.amount) }), alert: c.silent || c.addon };
  },
  announce: ({ before, after, copy, locale }) => {
    const was = trialCharge(before);
    const now = trialCharge(after);
    return was.amount === now.amount && was.silent === now.silent && was.addon === now.addon ? null : chargeSentence(copy, locale, now);
  },
};
```

### 20.8 La copie, clé par clé

**Repris du niveau 1 par référence** (`L1.<clé>`, jamais recopiés) : `months`,
`monthInitials`, `quarterPeriod`, `timeline`, `dashboard.label`,
`dashboard.quarterTarget`, `dashboard.boardTarget`, `dashboard.monthEnd`,
`dashboard.revenue`, `dashboard.revenueDelta`, `dashboard.patience`,
`dashboard.patienceLow`, `dashboard.notOnDashboard`, `dashboard.hiddenValue`,
`dashboard.revealed`, `dashboard.delta`, `visio` (sauf `tag`), les clés de
`boss` que le §20.5 n'écrit pas (`t2Hit`, `t3Hit`, `t3Miss`, `orderWrap`,
`yearEnd`, `fired`), `hand` (sauf `unlocked` et `productionEmpty`),
`cards.present`, `cards.clean.name`, `report` (sauf les clés écrites
ci-dessous), `journal`, `effects.insight`, `effects.present`, `effects.none`,
`events.midMailMoving`, `events.midMailStalled`, `events.present`,
`clippings.control.masthead`, `clippings.why.controlHeading`,
`clippings.why.controlRemoved`, `clippings.why.controlNone`,
`clippings.why.reportsHeading`, `news` sauf son tampon `fine`, écrit ci-dessous (`{ ...L1.news, stamps: { ...L1.news.stamps, fine: … } }`, comme au niveau 2), `bossLines`, les `eyebrow` des sept fins, les `title`
des fins sauf `cleanMiss` et `labyrinth`, `december.cells.outOf`,
`december.gameNumbers`, `december.metricChart.caption`,
`december.metricChart.reference`, `december.trustChart.reference`,
`december.trend`, `december.dataToggle`, `december.table.month`,
`december.table.trust`, `playbook`, `catalogue` (sauf `hiddenEffect`),
`share.replay`, `share.copy`, `share.copied`, `tourLoop`, `resume.title`,
`resume.resume`, `resume.restart`, `resume.review`, `footer`, `a11y.handLabel`,
`a11y.resumed`, et `nextLevel` (après U0 : `eyebrow` « Niveau suivant »,
`status` « jouable » ; `nextLevel: L1.nextLevel`).

**Et en plus, parce que l'autorité est la DGCCRF comme au niveau 1** :
`dashboard.radar`, `december.cells.radar`, `events.reports`,
`clippings.reports.masthead` et tout `clippings.why`.

**Écrit pour le niveau** :

| Clé | FR | EN |
|---|---|---|
| dashboard.metric | Revenu par utilisateur | Revenue per user |
| dashboard.metricUnit | actif, par mois | active, per month |
| dashboard.customers | Utilisateurs actifs | Active users |
| dashboard.trust | Confiance des utilisateurs | User trust |
| visio.tag | DG · Gainix | CEO · Gainix |
| hand.unlocked | Débloqué par la question au paiement | Unlocked by the checkout question |
| hand.productionEmpty | Rien en production pour l'instant. L'offre actuelle : sept jours d'essai, puis 7,99 € par mois, et une boutique de gemmes. | Nothing in production yet. The current offer: a seven-day trial, then €7.99 a month, and a gem shop. |
| report.metric | Revenu par utilisateur | Revenue per user |
| report.customers | Utilisateurs actifs | Active users |
| report.driversHeading | Pourquoi le revenu par utilisateur a bougé : {delta} | Why revenue per user moved: {delta} |
| report.drivers.word | Ce que tes utilisateurs disent de Gainix | What your users say about Gainix |
| report.drivers.market | L'abonnement à moitié prix d'une grande appli | A big app's half-price subscription |
| effects.clean | astuces retirées, le revenu par utilisateur baisse un peu | tricks removed, revenue per user dips a little |
| effects.gain | +{pct} % de revenu par utilisateur ce trimestre | +{pct}% revenue per user this quarter |
| effects.gainRising | +{pct} % de revenu par utilisateur ce trimestre, l'effet monte encore | +{pct}% revenue per user this quarter, and the effect is still growing |
| effects.loss | −{pct} % de revenu par utilisateur ce trimestre, des paiements que les gens ont voulus | −{pct}% revenue per user this quarter, payments people actually meant |
| events.surveyAnswers | Les réponses sont arrivées : 4 personnes sur 10 qui quittent le paiement répondent « trop cher pour ce que c'est », 3 sur 10 veulent « essayer un programme d'abord ». Tes prochains chantiers viseront plus juste, et tu as enfin de quoi montrer au DG : « Point données avec le DG » est débloqué. | The answers are in: 4 in 10 people who leave the checkout answer "too expensive for what it is", 3 in 10 want to "try a programme first". Your next projects will aim better, and you finally have something to show the CEO: "Data review with the CEO" is unlocked. |
| events.control | Contrôle de la DGCCRF, article dans la presse : une transaction pénale proposée avec l'accord du parquet, et une amende administrative, {fine} au total. Le DG te demande de tout retirer avant vendredi. {leavers} utilisateurs ferment leur compte. | An inspection by the DGCCRF, France's consumer protection authority, and an article in the press: a criminal settlement offered with the prosecutor's agreement, and an administrative fine, {fine} in all. The CEO asks you to take everything down by Friday. {leavers} users close their accounts. |
| events.viral | Un fil viral : « Gainix, j'ai supprimé ma carte de l'appli, voici pourquoi. » Les utilisateurs n'achètent plus rien. | A viral thread: "Gainix, I removed my card from the app, here's why." Users stop buying anything. |
| events.press | Un magazine de sport cite Gainix en exemple d'une appli qui ne force pas la main. Les utilisateurs paient plus volontiers ce qu'ils ont choisi. | A sports magazine cites Gainix as an app that doesn't push people around. Users pay more willingly for what they chose. |
| events.competitor | Une grande appli de sport a divisé son abonnement par deux au printemps. Tout le monde a dû faire des remises, toi compris. | A big fitness app halved its subscription in the spring. Everyone had to offer discounts, you included. |
| clippings.control.headline | Gainix épinglé par la répression des fraudes | Gainix caught out by the French consumer watchdog |
| clippings.reports.headline | Les signalements contre Gainix s'accumulent | Complaints against Gainix pile up |
| clippings.viral.handle | @cardio_du_dimanche | @sunday_runner |
| clippings.press.masthead | Le Mag du sport | Sport Mag |
| clippings.press.headline | Gainix, l'appli qui ne force pas la main | Gainix, the app that doesn't push |
| clippings.competitor.masthead | La Lettre du fitness | The Fitness Letter |
| clippings.competitor.headline | L'abonnement à moitié prix gagne le sport | Half-price subscriptions hit fitness apps |
| news.stamps.fine | Contrôle · {fine} | Inspection · {fine} |
| december.cells.metric | Revenu par utilisateur en {month} | Revenue per user in {month} |
| december.cells.trust | Confiance des utilisateurs | User trust |
| december.metricChart.title | Revenu par utilisateur, par mois | Revenue per user, per month |
| december.metricChart.label | Revenu par utilisateur actif sur l'année, mois par mois | Revenue per active user over the year, month by month |
| december.trustChart.title | Confiance des utilisateurs, le compteur que personne n'affichait | User trust, the counter nobody displayed |
| december.trustChart.caption | De 0 à 100. À 35 ou moins, les utilisateurs le racontent, et plus personne n'achète. | From 0 to 100. At 35 or below, users talk, and nobody buys any more. |
| december.trustChart.label | Confiance des utilisateurs sur l'année | User trust over the year |
| december.table.metric | Revenu par utilisateur | Revenue per user |
| catalogue.hiddenEffect | Confiance {trust}, radar {radar}, une seule fois, le jour où elle entre en production. Le revenu qu'elle rapporte baisse de 30 % après trois mois. | Trust {trust}, radar {radar}, once, on the day it goes into production. The revenue it brings in drops by 30% after three months. |
| share.text | Une année chez Gainix : {title} Revenu par utilisateur à {metric}, confiance à {trust}. Et toi, tu tiendrais ? {url} | A year at Gainix: {title} Revenue per user at {metric}, trust at {trust}. Would you hold out? {url} |
| resume.previously | Précédemment chez Gainix | Previously at Gainix |
| resume.quarterLine | Trimestre {q} : {cards}. Revenu par utilisateur à {metric}. | Quarter {q}: {cards}. Revenue per user at {metric}. |
| resume.finished | Ta dernière année chez Gainix s'est terminée ainsi : « {title} » | Your last year at Gainix ended like this: "{title}" |
| a11y.quarterEnd | Fin du trimestre {q} : revenu par utilisateur {metric}, objectif {target} {status}, patience {patience}. | End of quarter {q}: revenue per user {metric}, target {target} {status}, patience {patience}. |

**Les fins** (`{metric}` arrive formaté : « 6,01 € ») : `win` est un littéral,
`true` pour `applause` et `cleanMiss`, `false` pour les cinq autres, comme dans
`acquisition.ts` ; `eyebrow` et les titres non listés viennent du niveau 1.

| id | Titre (si écrit) | Texte FR | Texte EN |
|---|---|---|---|
| applause | — | Revenu par utilisateur à {metric} en décembre, {customers} utilisateurs actifs, une confiance à {trust} que personne ne mesurait. Pas une option cochée d'avance, pas un essai qui se change en abonnement en silence. Le DG t'a pressé trois fois. Tu as répondu avec des chiffres. C'est exactement le métier. | Revenue per user at {metric} in December, {customers} active users, trust at {trust} that nobody was measuring. Not one add-on ticked in advance, not one trial quietly turning into a subscription. The CEO pushed you three times. You answered with numbers. That is exactly the job. |
| cleanMiss | Pas encore 6 €. Mais tout est propre. / Not €6 yet. But everything is clean. | Revenu par utilisateur à {metric}, confiance à {trust}. La courbe monte encore, parce que les effets lents ne s'arrêtent pas en décembre. Le board voulait un chiffre, tu as construit une pente. Regarde la confiance : c'est elle qui fera les 6 € au printemps. | Revenue per user at {metric}, trust at {trust}. The curve is still climbing, because slow effects don't stop in December. The board wanted a number; you built a slope. Look at trust: that's what will deliver the €6 in the spring. |
| firedClean | — | La patience du DG est tombée à {patience} avant que tes effets lents n'arrivent. Confiance à {trust}. L'année suivante, ton remplaçant a fait payer les essais sans prévenir. Le jeu ne récompense pas toujours ceux qui ont raison trop tôt. La vraie vie non plus. Rejoue, et présente tes données plus tôt. | The CEO's patience fell to {patience} before your slow effects could arrive. Trust at {trust}. The next year, your replacement charged for trials without warning. The game doesn't always reward people who are right too early. Neither does real life. Play again, and show your data sooner. |
| firedDark | — | Tu as pris des astuces, et la patience du DG est quand même tombée à {patience}. Confiance à {trust}, radar à {radar}. Ce que le DG voulait, c'était le chiffre, tout de suite, et il ne se souvient pas de ce qu'il a demandé. | You used tricks, and the CEO's patience still fell to {patience}. Trust at {trust}, radar at {radar}. What the CEO wanted was the number, right now, and he doesn't remember what he asked for. |
| fine | — | Le radar est monté jusqu'au contrôle, la transaction a été signée et l'amende est tombée, la presse a écrit. Revenu par utilisateur à {metric} en décembre, confiance à {trust}. Ceux qui avaient payé plus qu'ils ne le voulaient ont demandé à être remboursés, et ils l'ont raconté. Ce que tu as mis en production a des noms. Ils sont en dessous. | The radar climbed all the way to an inspection, the settlement was signed and the fine landed, the press wrote about it. Revenue per user at {metric} in December, trust at {trust}. The people who had paid more than they meant to asked for their money back, and told everyone why. What you put into production has names. They are below. |
| labyrinth | La caisse tient. Regarde ce qu'elle coûte. / The till holds. Look at what it costs. | Pas de contrôle cette année. Revenu par utilisateur à {metric}, et une confiance à {trust} que ton dashboard ne t'a jamais montrée. Les utilisateurs que tu as pressés partent plus vite qu'ils ne sont venus. Le radar est à {radar}. Il ne redescend pas tout seul. | No inspection this year. Revenue per user at {metric}, and trust at {trust} that your dashboard never showed you. The users you pushed leave faster than they came. The radar is at {radar}. It doesn't come down on its own. |
| repentant | — | Tu as mis des astuces en production, puis tu les as retirées. Revenu par utilisateur à {metric}, confiance à {trust}, radar à {radar}. La confiance remonte plus lentement qu'elle ne tombe. C'est la seule règle du jeu qui est aussi celle de la vraie vie. | You put tricks into production, then took them out. Revenue per user at {metric}, trust at {trust}, radar at {radar}. Trust climbs back more slowly than it falls. It's the one rule of the game that is also a rule of real life. |

### 20.9 Le catalogue : les huit astuces, vérifiées

Vérifié le 2026-10-04 par un agent de recherche, sur le Code de la consommation
consolidé au 2026-10-01 (relu par cette session pour L121-17, L132-22, L215-1,
L221-5 I 11°, L221-14, L241-3 et L242-10), la guidance de la Commission sur la
directive 2005/29 (2021), les communiqués de la Commission et de la FTC, les
principes clés du réseau CPC sur les monnaies virtuelles, la réponse
ministérielle de 2019 sur les loot boxes et l'arrêt néerlandais de 2022. Les
pages de la DGCCRF étaient bloquées : ce qui en vient est signalé. Tout reste à
relire par Antoine avant l'ouverture (D9). Deux cas sont déjà pris ailleurs et
évités ici : Amazon Prime et Adobe (niveau 1).

| Carte | Nom officiel FR / EN | Source du nom |
|---|---|---|
| addon | Option pré-cochée / Pre-ticked add-on | C. consom. L121-17 (« options payantes qu'il n'a pas sollicitées ») ; « Preselection » chez deceptive.design |
| lootbox | Coffre à butin payant / Paid loot box | réponse ministérielle du 12 mars 2019 (« loot boxes (ou coffres à butin) ») |
| hiddensub | Abonnement caché / Hidden subscription | deceptive.design |
| pricing | Prix personnalisé non signalé / Undisclosed personalised pricing | C. consom. L221-5 I 11° ; directive (UE) 2019/2161 |
| trial | Continuité forcée / Forced continuity | Brignull, 2010 (aujourd'hui rangé par deceptive.design sous « Hidden subscription ») |
| express | Achat involontaire / Unintended purchase | FTC, affaire Epic Games (« unintended in-game purchases ») |
| renewal | Reconduction tacite sans information / Silent auto-renewal | C. consom. L215-1 (loi Chatel) |
| gems | Monnaie virtuelle opaque / Opaque virtual currency | principes clés du réseau CPC sur les monnaies virtuelles (2025), principes 2 et 3 |

**Les textes** (`patterns.<id>`), à recopier tels quels :

**addon**
- law FR : Avant tout contrat, le vendeur doit obtenir l'accord exprès du consommateur pour chaque paiement qui s'ajoute au prix principal : une option payante cochée d'avance n'en est pas un, et le consommateur peut se faire rembourser (article L121-17 du Code de la consommation). Le manquement est puni d'une amende administrative.
- law EN : Before any contract, the seller must get the consumer's express agreement for every payment added to the main price: a paid option ticked in advance is not that, and the consumer can get a refund under French law (article L121-17 of the Consumer Code). The breach carries an administrative fine.
- cas FR : En 2012, la Cour de justice de l'Union européenne a jugé, à propos d'une assurance annulation proposée par l'agence de voyages en ligne ebookers.com, qu'un supplément de prix facultatif doit être choisi activement par le client, jamais coché à sa place.
- cas EN : In 2012, the Court of Justice of the European Union ruled, in a case about cancellation insurance offered by the online travel agency ebookers.com, that an optional price supplement must be actively chosen by the customer, never ticked for them.
- tell FR : Une option déjà cochée est celle qu'on veut te vendre : décoche avant de payer.
- tell EN : An option already ticked is the one they want to sell you: untick it before you pay.
- Sources : C. consom. L121-17 et L132-22 (15 000 € au plus pour une société ; relus) ; CJUE, 19 juillet 2012, C-112/11, ebookers.com Deutschland (titre du JO de l'UE lu : obligation d'un intermédiaire de faire accepter les suppléments facultatifs « sur la base d'un consentement », dont le prix d'une assurance annulation ; dispositif à relire). L'arrêt porte sur le transport aérien (règlement 1008/2008, article 23) : le texte le dit « à propos d'une assurance annulation proposée par une agence de voyages », sans en faire une règle générale.

**lootbox**
- law FR : Pas d'interdiction en France : un coffre payant n'est une loterie interdite (article L322-1 du Code de la sécurité intérieure) que s'il fait espérer un gain réel, comme de l'argent ou un objet revendable. Sinon, le droit de la consommation s'applique, et la Commission européenne demande d'afficher les chances de gain avant l'achat.
- law EN : Not banned in France: a paid chest is only a prohibited lottery (article L322-1 of the French Internal Security Code) if it holds out the hope of a real gain, such as money or a resellable item. Otherwise consumer law applies, and the European Commission asks for the odds of winning to be shown before purchase.
- cas FR : En janvier 2025, l'éditeur de Genshin Impact a accepté de payer 20 millions de dollars pour clore les accusations de la FTC, notamment sur des coffres payants dont les chances et le coût réel étaient mal présentés, vendus aussi à des adolescents. L'accord a été soumis à un juge fédéral.
- cas EN : In January 2025, the publisher of Genshin Impact agreed to pay $20 million to settle the FTC's allegations, notably about paid chests whose odds and real cost were poorly presented, sold to teenagers among others. The settlement was submitted to a federal judge.
- tell FR : Un coffre payant au hasard : demande les chances avant de payer.
- tell EN : A paid chest at random: ask for the odds before you pay.
- Sources : réponse ministérielle à la question écrite nº 14570, JO du 12 mars 2019 (lue) ; guidance de la Commission sur la directive 2005/29, 2021, §4.2.9 (lue) ; FTC, communiqué du 17 janvier 2025 (lu : une proposition d'accord, son approbation n'a pas été vérifiée). Le cadre « JONUM » de la loi du 21 mai 2024 ne vise que les objets revendables : une tenue d'avatar n'en est pas un. Aux Pays-Bas, il n'y a jamais eu d'amende de 10 M€ contre EA : une astreinte, annulée par le Conseil d'État le 9 mars 2022 ; la Belgique a donné en 2018 une interprétation, pas un jugement. Ne citer ni l'une ni l'autre.

**hiddensub**
- law FR : Présenter un abonnement comme un achat unique trompe sur la nature et le prix du service : c'est une pratique commerciale trompeuse, un délit (articles L121-2 et L121-3 du Code de la consommation). Et juste avant la commande, le prix et la durée doivent être rappelés de façon lisible (article L221-14).
- law EN : Presenting a subscription as a one-off purchase misleads about the nature and price of the service: it is a misleading commercial practice, a criminal offence under French law (articles L121-2 and L121-3 of the Consumer Code). And just before the order, the price and duration must be restated legibly (article L221-14).
- cas FR : En 2019, la SFAM a accepté une transaction proposée par la DGCCRF avec l'accord du parquet de Paris : sous couvert d'une offre de remboursement, des clients avaient souscrit, sans toujours le savoir, une assurance payante.
- cas EN : In 2019, SFAM accepted a settlement offered by the DGCCRF, France's consumer protection authority, with the agreement of the Paris prosecutor: under cover of a refund offer, customers had signed up, not always knowingly, for a paid insurance policy.
- tell FR : Un prix sans « par mois » peut cacher un abonnement : lis sous le bouton.
- tell EN : A price without "a month" can hide a subscription: read under the button.
- Sources : communiqué de la DGCCRF du 14 juin 2019, lu dans sa reprise (lemondedudroit.fr) : la page de la DGCCRF était bloquée, à relire ; la DGCCRF n'a pas publié le montant (le chiffre de la presse n'est pas à citer). Ne pas nommer l'enseigne qui distribuait l'offre : elle n'était pas mise en cause.

**pricing**
- law FR : Quand un prix est personnalisé par une décision automatisée, le vendeur doit le dire avant le contrat (article L221-5 du Code de la consommation, 11°). Personnaliser n'est pas interdit ; le cacher l'est, sous peine d'une amende administrative.
- law EN : When a price is personalised by an automated decision, the seller must say so before the contract under French law (article L221-5 of the Consumer Code, point 11). Personalising isn't banned; hiding it is, on pain of an administrative fine.
- cas FR : En mars 2024, Tinder s'est engagé auprès de la Commission européenne et des autorités de consommation à dire quand ses remises sont personnalisées par des moyens automatisés. Ce sont des engagements, pas une sanction.
- cas EN : In March 2024, Tinder committed to the European Commission and consumer authorities to say when its discounts are personalised by automated means. These are commitments, not a sanction.
- tell FR : Si le prix change selon ton téléphone, on doit te le dire.
- tell EN : If the price changes with your phone, they have to tell you.
- Sources : C. consom. L221-5 I 11° et L242-10 (75 000 € au plus pour une société ; relus) ; Commission européenne, IP/24/1344 du 7 mars 2024 (lu). Ne pas citer Orbitz (2012, non vérifié, et pas illégal).

**trial**
- law FR : Aucune loi française n'impose de rappel avant la fin d'un essai gratuit. Mais le prix, la durée et le renouvellement doivent être annoncés avant la souscription et rappelés juste avant la commande (articles L221-5 et L221-14 du Code de la consommation) ; les rendre illisibles est une omission trompeuse (article L121-3).
- law EN : No French law requires a reminder before a free trial ends. But the price, the duration and the renewal must be stated before sign-up and restated just before the order (articles L221-5 and L221-14 of the French Consumer Code); making them illegible is a misleading omission (article L121-3).
- cas FR : Aux États-Unis, Instacart a accepté en décembre 2025 de rembourser 60 millions de dollars à ses clients pour clore une action de la FTC : l'inscription à l'essai gratuit de son abonnement ne disait pas assez qu'il deviendrait payant à la fin.
- cas EN : In the United States, Instacart agreed in December 2025 to refund $60 million to customers to settle an FTC lawsuit: signing up for its subscription's free trial didn't make clear enough that it would become paid at the end.
- tell FR : Si l'essai gratuit exige ta carte, note le jour où il devient payant.
- tell EN : If the free trial wants your card, write down the day it starts charging.
- Sources : C. consom. L221-5, L221-14, L121-3 (relus ; recherche « essai » et « gratuit » dans tout le Code, sans résultat) ; FTC, communiqué du 18 décembre 2025 (lu) : un accord transactionnel, l'ordonnance signée n'a pas été vérifiée. Le Digital Fairness Act, qui pourrait créer une obligation de rappel, n'est pas encore proposé : ne pas le citer comme une loi.

**express**
- law FR : Le bouton qui valide une commande doit dire clairement qu'elle oblige à payer : « commande avec obligation de paiement », ou une formule sans ambiguïté (article L221-14 du Code de la consommation). Un achat d'un seul appui n'est pas interdit ; le confondre avec un aperçu l'est.
- law EN : The button that confirms an order must say clearly that it means paying: "order with obligation to pay", or an unambiguous equivalent, under French law (article L221-14 of the Consumer Code). One-tap buying isn't banned; mixing it up with a preview is.
- cas FR : En 2023, Epic Games a accepté de verser 245 millions de dollars de remboursements, dans une ordonnance de la FTC : les boutons de Fortnite faisaient acheter d'un seul appui, parfois en voulant seulement réveiller le jeu ou voir un objet.
- cas EN : In 2023, Epic Games agreed to pay $245 million in refunds under an FTC order: Fortnite's buttons made people buy with a single press, sometimes when they only meant to wake the game or look at an item.
- tell FR : Le bouton qui fait payer doit le dire, pas ressembler à « voir ».
- tell EN : The button that charges you has to say so, not look like "view".
- Sources : C. consom. L221-14 alinéa 2 et L242-10 (relus) ; FTC, communiqué du 14 mars 2023 (lu : une ordonnance administrative sur consentement, des remboursements, pas une amende). Les 275 M$ de la COPPA sont une autre affaire : ne pas les additionner.

**renewal**
- law FR : Pour un abonnement à durée fixe qui se renouvelle tout seul, le prestataire doit prévenir par écrit, entre trois mois et un mois avant l'échéance, avec la date limite pour arrêter (article L215-1 du Code de la consommation, loi Chatel). Sinon, l'abonné peut résilier gratuitement à tout moment, et il est remboursé. Pas d'amende : la sanction, c'est l'abonné qui la prend.
- law EN : For a fixed-term subscription that renews on its own, the provider must warn in writing, between three months and one month before the renewal date, with the deadline to stop, under French law (article L215-1 of the Consumer Code, the Chatel law). Otherwise the subscriber can cancel free of charge at any time, and gets refunded. No fine: the subscriber is the one who imposes the penalty.
- cas FR : Aux États-Unis, l'éditeur d'ABCmouse a accepté en 2020 de payer 10 millions de dollars pour clore les accusations de la FTC : ses formules à prix réduit de douze mois se renouvelaient indéfiniment sans que les clients en soient prévenus.
- cas EN : In the United States, the publisher of ABCmouse agreed in 2020 to pay $10 million to settle FTC charges: its discounted twelve-month plans renewed indefinitely without customers being told.
- tell FR : Pas d'e-mail avant la reconduction annuelle ? Tu peux résilier quand tu veux.
- tell EN : No email before the yearly renewal? You can cancel whenever you like.
- Sources : C. consom. L215-1 et L241-3 (relus : aucune amende, des intérêts au taux légal) ; FTC, communiqué du 2 septembre 2020 (lu). Repli sans paiement : les engagements de Microsoft auprès de la CMA sur les abonnements Xbox (26 janvier 2022), « not an admission ».

**gems**
- law FR : Aucune règle française ne vise les monnaies virtuelles, mais le prix doit se lire en euros, clairement, avant l'achat (articles L221-5 et L121-2 du Code de la consommation). Les autorités de consommation européennes demandent de ne pas vendre de monnaie par paquets qui ne correspondent pas aux prix des objets.
- law EN : No French rule targets virtual currencies, but the price must be readable in euros, clearly, before purchase (articles L221-5 and L121-2 of the French Consumer Code). European consumer authorities ask traders not to sell currency in bundles that don't match the prices of the items.
- cas FR : En mars 2025, les autorités de consommation européennes ont ouvert une action contre l'éditeur du jeu Star Stable, notamment sur sa monnaie virtuelle. C'est une procédure, pas une sanction.
- cas EN : In March 2025, European consumer authorities opened an action against the publisher of the game Star Stable, notably over its virtual currency. It is a procedure, not a sanction.
- tell FR : S'il te reste toujours des gemmes, les packs sont calibrés pour ça.
- tell EN : If you always have gems left over, the packs are designed that way.
- Sources : principes clés du réseau CPC sur les monnaies virtuelles dans les jeux, 21 mars 2025, principe 3 (« Offering in-game virtual currencies only in bundles mismatching the value of purchasable in-game digital content », lu) ; Commission européenne, IP/25/831 (lu ; aucune issue publiée). L'action contre neuf éditeurs du 30 septembre 2026 n'est confirmée que par la presse : ne pas la citer.

**Liste blanche des marques** (série C6) : ebookers.com, Genshin Impact, SFAM,
Tinder, Instacart, Epic Games, Fortnite, ABCmouse, Star Stable. Les
institutions (Cour de justice de l'Union européenne, FTC, DGCCRF, Commission
européenne…) sont des mots ordinaires du test. Pour le test (§21.3 T1),
exactement, calculés avec `CAPITALISED` sur les seize `cas` de ce §20.9 :
- `BRANDS = ["ebookers.com", "Genshin Impact", "SFAM", "Tinder", "Instacart", "Epic Games", "Fortnite", "ABCmouse", "Star Stable"]` ;
- `BRAND_WORDS = new Set(BRANDS.flatMap((b) => b.split(" ")).flatMap((w) => [w, `${w}'s`]))`
  (le cas anglais d'`express` dit « Fortnite's ») ;
- `NOT_BRANDS = new Set(["En", "Cour", "In", "Court", "Justice", "European", "Union", "FTC", "L'accord", "January", "FTC's", "The", "DGCCRF", "Paris", "France's", "Commission", "Ce", "March", "These", "Aux", "États-Unis", "United", "States", "December", "C'est", "It"])` ;
- un seul domaine, `ebookers.com`, admis par `BRANDS`.

**La nature de chaque cas** (C6) : `pricing` contient « s'est engagé » / /committed/ ;
`pricing` et `gems` contiennent « pas une sanction » / "not a sanction", et
`gems` « procédure » / "procedure" ; `hiddensub` « transaction » /
"settlement" ; `lootbox`, `trial` et `renewal` « pour clore » / "to settle" ;
`express` « ordonnance » / "order" ; `addon` « a jugé » / "ruled" ; aucun `cas`
ne correspond à `/amende|condamn/` (EN `/\bfine[ds]?\b|convicted/`).

Les lignes « Sources » de ce §20.9 ne sont pas de la copie : elles vont en
commentaire au-dessus de `patterns`, comme dans `acquisition.ts`.

**Le nom de l'entreprise** : « Sportix » (une appli et une marque existent),
« Cardiox » (une plateforme pour équipes sportives), « Fitéo », « Foulix »,
« Bougix » écartés ; **« Gainix »** ne sort sur aucun produit (seul existe
Gainax, un studio d'animation). Repli : « Muscléo ». INPI à faire (D9).

**Corrigé dans l'esquisse du §11.4** : L215-1 ne prévoit aucune amende ; le
prix personnalisé est au 11° du I de L221-5 ; les Pays-Bas n'ont jamais infligé
10 M€ à EA ; les loot boxes ne sont pas interdites en France ; « Forced
continuity » et « Hidden subscription » sont aujourd'hui un seul type chez
deceptive.design, qui garde le premier comme son ancêtre.

### 20.10 Questions pour Antoine

Les questions communes sont au §21.8.

| # | Question | Reco | Si on se trompe | Réponse |
|---|---|---|---|---|
| Q1 | **Le chiffre du board : le revenu par utilisateur actif, de 4,00 € à 6,00 €** ? | **Oui** : le même ×1,5 que le niveau 2, donc l'équilibrage validé, et l'esquisse le disait. | Un autre chiffre change la tuile, les messages du DG et les tables. | **Oui** (C87, Antoine, 2026-10-04). |
| Q2 | **Le nom : Gainix** ? | **Oui**, pour le double sens. Repli : Muscléo. | Un nom propre à remplacer en une passe avant T1. | **Oui** (C88, Antoine, 2026-10-04). |
| Q3 | **Le contrôle : une transaction de 300 000 € et une amende administrative de 75 000 €, 375 000 € au total** ? | **Oui** : c'est la procédure réelle pour ce mélange de pratiques, environ 4 % du chiffre d'affaires. Écarté : 300 000 € en quatre amendes administratives cumulées, plus simple à dire mais qui oublie le délit. Le tampon de la coupure dit « Contrôle · 375 000 € » : « Sanctions » rangerait la transaction parmi les sanctions (§21.5), et « Transaction et amende » ne tient pas sur une ligne à 390 px. | Un montant et une phrase d'événement, sans effet sur l'équilibrage. | **Oui** (C89, Antoine, 2026-10-04). |
| Q4 | **Les huit astuces du §20.4**, dont deux remplacées (frais cachés et fausse urgence, déjà au niveau 2) et une reformulée (l'option cochée d'avance) ? | **Oui** : huit noms neufs, chacun avec un texte relu et un cas réel. | Une PR de spécification avant T1. | **Oui** (C90, Antoine, 2026-10-04). |
| Q5 | **Le bandeau de l'encart du résultat** : « Revenu par utilisateur 4,00 € » tient-il sur sa ligne de 44 px ? | **Le garder**, et si la spec P23 voit la bande passer à la ligne à 1 280 px, le remplacer par « ARPU {metric} » (le mot du glossaire), dans les deux langues, sans redemander. | Une bande sur deux lignes, vue par la spec. | **Oui** (C91, Antoine, 2026-10-04). Vérifié par `result-real` (fixture `revenueClear`, §20.12 T3), pas par P23, qui ne montre que la rétention. |

### 20.11 La copie autour du jeu

| Où | Clé | FR | EN |
|---|---|---|---|
| `meta.ts` | `GAME_META.revenue.title` | Gainix : le jeu du revenue — Tour de Growth | Gainix: the revenue game — Tour de Growth |
| `meta.ts` | `GAME_META.revenue.description` | Joue une année comme PM growth d'une appli de sport : un DG qui veut 6 € de revenu par utilisateur, et huit astuces à reconnaître. | Play a year as the growth PM of a fitness app: a CEO who wants €6 of revenue per user, and eight tricks to learn to spot. |
| `meta.ts` | `GAME_META.revenue.breadcrumb` | Une année chez Gainix | A year at Gainix |
| `meta.ts` | `GAME_META.revenue.shareImageAlt` | Une année chez Gainix : 4,00 € de revenu par utilisateur, la confiance et le radar DGCCRF absents du dashboard. | A year at Gainix: €4.00 of revenue per user, user trust and the regulator's radar missing from the dashboard. |
| `meta.ts` | `REVENUE_INTRO.eyebrow` | Le côté obscur · revenue | The dark side · revenue |
| `meta.ts` | `REVENUE_INTRO.title` | Une année chez Gainix | A year at Gainix |
| `meta.ts` | `REVENUE_INTRO.lead` | Ton DG dirige maintenant Gainix, une appli de sport avec abonnement et monnaie virtuelle, et il t'a emmené avec lui comme PM growth. 200 000 utilisateurs actifs, qui rapportent 4 € chacun par mois. Le board veut 6 € d'ici décembre. Chaque trimestre, le DG t'appelle en visio, puis tu as droit à deux actions, nommées comme on les nomme en réunion. Tu ne sauras ce qu'elles valent qu'une fois le trimestre passé. Le DG, lui, sait déjà ce qu'il veut. | Your CEO now runs Gainix, a fitness app with a subscription and a virtual currency, and he brought you along as growth PM. 200,000 active users, who bring in €4 each a month. The board wants €6 by December. Every quarter the CEO calls you on video, then you get two actions, named the way they are named in meetings. You will only learn what they are worth once the quarter is over. The CEO already knows what he wants. |
| `meta.ts` | `REVENUE_INTRO.stepsTitle`, `steps`, `glossaryLead` | *(niveau 1, par référence)* | |
| `entry.ts` | `GAME_ENTRY_COPY.revenue.title` | Le côté obscur du revenue | The dark side of revenue |
| `entry.ts` | `…body` | Voici ce qu'il ne faut pas faire : joue une année comme PM growth d'une appli de sport, un DG qui veut du revenu par utilisateur, et huit astuces que tu reconnaîtras ensuite partout. | Here is what not to do: play a year as the growth PM of a fitness app, with a CEO who wants revenue per user, and eight tricks you will recognise everywhere afterwards. |
| `entry.ts` | `…cta` | Jouer le niveau « Comment vous gagnez de l'argent » | Play the level "How you make money" |
| `entry.ts` | `…band.metric` | Revenu par utilisateur {metric} | Revenue per user {metric} |
| `entry.ts` | `…opening`, `meta`, `band.trust`, `band.notOnDashboard` | *(les constantes partagées du fichier)* | |
| `hub.ts` | `zones.revenue.company` | Gainix, une appli de sport avec abonnement | Gainix, a fitness app with a subscription |
| `hub.ts` | `ENDINGS_BY_LEVEL.revenue` | `{ fine: « le contrôle, la transaction et l'amende » }` | `{ fine: "the inspection, the settlement and the fine" }` |
| `hub.ts` | `LEVEL_TEASERS.revenue` (REV-3, quand `revenue` entre dans `LevelSlug` ; le mécanisme est celui de T0) | « Comment vous gagnez de l'argent » : l'essai qui se change en abonnement, l'option cochée d'avance, le coffre au hasard | "How you make money": the trial that turns into a subscription, the pre-ticked add-on, the random chest |
| `page.tsx` | les deux mots du glossaire | `["revenue", "arpu"]` | |

### 20.12 Plan d'exécution

Les PR T1 à T4 du §21.3, avec ce qui est propre au niveau (unités REV-1 à
REV-4 du §21.9).

- **T1, la copie (REV-1)** : `RevenueCopy`, `RevenueOrderId` (`addon`, `trial`,
  `lootbox`, `hiddensub`, `renewal`), `RevenuePhoneCopy` (§20.7, un champ par
  ligne du tableau, la colonne « Montré par » servant de doc-comment, en
  anglais ; `checkoutAnswers: readonly string[]`) et `ChargePillCopy`
  (`amount`, `silentSuffix`, `addonSuffix`), la pastille sous la clé `charge` ;
  `REVENUE_COPY_TEMPLATES = { ...LEVEL_COPY_TEMPLATES, "charge.amount": ["amount"] }`.
  `src/content/game/revenue.ts`, `REVENUE_INTRO` et `GAME_META.revenue`. Ce
  qui reste fictif, pour l'en-tête « What stays fictional » : Gainix, Coach+,
  la tenue Marathon, le coffre Sprint, @cardio_du_dimanche / @sunday_runner,
  Le Mag du sport, La Lettre du fitness ; les vraies marques n'apparaissent
  que dans les `cas`. Le test `src/content/__tests__/game-revenue.test.ts` :
  - **C1**, avec ces expressions, vérifiées sur les huit `law` (pluriels
    « articles L… et L… » et « of the French … Code » compris) : FR
    `/articles? L\d+-\d+(?:-\d+)?(?: et L\d+-\d+(?:-\d+)?)? du Code (?:de la consommation|de la sécurité intérieure)/`,
    EN `/articles? L\d+-\d+(?:-\d+)?(?: and L\d+-\d+(?:-\d+)?)? of the (?:French )?(?:Consumer|Internal Security) Code/` ;
  - **la règle du contrôle**, qui remplace C14 (après
    `text.replace(/\{fine\}/g, "")`) : `events.control` correspond à
    `/transaction pénale/`, `/amende administrative/` et contient « parquet »
    (EN `/settlement/`, `/administrative fine/` et « prosecutor ») ;
    `news.stamps.fine` contient « Contrôle » (EN « Inspection ») ;
    `endings.fine.text` correspond à `/transaction/` et `/amende/` (EN
    `/settlement/` et `/\bfine\b/`) ;
  - **C4** : `targets[0]` vaut 4.3, `targets[3]` vaut 6, `metric0` vaut 4,
    objectifs strictement croissants ; `boss.t1` contient « 4,30 € » et
    « 6 € » (EN « €4.30 », « €6 ») ; `boss.t2Miss` contient « au lieu de
    4,30 €. » (EN « instead of €4.30. ») ; `boss.t4Hit`, `boss.t4Miss`,
    `REVENUE_INTRO.lead` et `endings.cleanMiss.title` contiennent « 6 € » (EN
    « €6 ») ; le chapeau contient aussi « 4 € » et « 200 000 » (EN « €4 »,
    « 200,000 ») ; `GAME_META.revenue.shareImageAlt` contient « 4,00 € » (EN
    « €4.00 ») (U+00A0 avant « € » en français) ;
  - **C6** : les listes et la nature des cas du §20.9 ;
  - **C13** : la partie copie du §20.7 ;
  - `endings.*.win` et `nextLevel` comme le §20.8 le dit ;
  - `src/content/__tests__/game-hub.test.ts` étendu à `GAME_META.revenue` et
    `REVENUE_INTRO` (§21.3 T1).
- **T2, le téléphone (REV-2)** : `src/lib/game/fit-phone.ts` (`fitPhoneView`,
  `fitItemKey`, `trialCharge` et ses constantes ; ce sont les noms du gabarit `<téléphone>-phone.ts` du §21.3 T2, comme `shop-phone.ts` au niveau 2),
  `src/components/game/FitPhone.tsx` et son `.module.css`, `ChargePill.tsx`
  (qui importe `ClickPill.module.css`), le jeton `--fit-brand` et sa ligne de
  contraste (§20.7), `REVENUE_SIDE` (le code du §20.7), les aperçus,
  l'inscription de `FitPhone` et `ChargePill` dans `.design-sync/config.json`
  (`componentSrcMap`, et `FitPhone` dans `dtsPropsFor`), et
  `src/__tests__/game-fit-phone.test.ts` (chaque ligne de la table de la
  pastille ; `roundpacks` l'emporte sur `gems` ; `renewmail` sur `renewal` ;
  la partie téléphone de C13).
- **T3, le branchement (REV-3)** : la table du §21.3 ; le niveau prend la
  dernière place de `GAME_LEVELS_BY_PILLAR`. `ENDINGS_BY_LEVEL.revenue` reçoit
  sa fin `fine`. L'en-tête de `levels/revenue.ts` : « in DRAFT
  (`DraftLevelSlug`): no page, no copy, no save yet. » devient « wired on
  <date> (A24, REV-3): its copy is `content/game/revenue.ts`, its page
  `app/[locale]/game/revenue/`. ». Et :
  - `e2e/real-results.ts` : `revenueClear: { id: "7d3c9e2a-0b1f-4c5d-8e6f-1a2b3c4d5e10", tone: "neutral", locale: "fr", answers: answersFor({ acquisition: 1, activation: 0, retention: 1, referral: 0, revenue: 2 }), total: 54 }`
    (le revenue seul à 0/20 : un goulot `clear`) ; dans
    `e2e/result-real.spec.ts`, à 1 280 px en `?lang=fr`, `game-entry-cta` vers
    `/fr/game/revenue?from=result`, et `game-entry-band` contient « Revenu par
    utilisateur 4,00 € » avec une hauteur ≤ 44 px. **Si ce test rougit sur la
    hauteur** (C91) : `band.metric` devient « ARPU {metric} » dans les deux
    langues, l'assertion devient « ARPU 4,00 € », et le compte rendu le dit ;
    sans redemander ;
  - `e2e/game-helpers.ts` : `REVENUE_PATH = { en: "/en/game/revenue", fr: "/fr/game/revenue" }` ;
  - les liens de décembre des niveaux déjà construits, recalculés (§21.3 T3 :
    ouvrir le revenue fait viser le revenue au décembre du referral, s'il est
    ouvert).
- **T4, les specs (REV-4)** : `e2e/game-revenue.spec.ts`, d'après le §20.6 ;
  le chiffre s'affiche en euros au centime, jamais « % » ni « pt » sur la
  tuile, la frise, le premier chiffre du bilan, la cellule et la courbe de
  décembre (les lignes d'effet en ont). Et :
  - **P1 (fr)** : « 4,00 € » ; « 200 000 » ; « 55 » ; la pastille à 7,99 €,
    sans alerte ;
  - **P5 (T1, fr)** : cocher `addon` affiche « ☑ Coach+ · 2,99 € par mois », et
    la pastille « Prélevé à la fin de l'essai : 10,98 € · dont une option cochée
    d'avance », en alerte ; cocher aussi `pricing` affiche « Mensuel : 8,49 €
    par mois » et 11,48 € ; tout décocher, puis cocher `trialmail` affiche
    « Rappel envoyé 3 jours avant la fin de l'essai », la pastille à 7,99 €,
    sans alerte (`trial` n'est pas dans la main du T1) ;
  - **année C (en)** : « €4.62 », « €4.82 », « €4.64 », « €1.93 » ; au T2, une
    fois `trial` et `hiddensub` cochées, la pastille a `data-silent="true"` et
    contient « €62.98 », « with no reminder before the charge » et « including
    an add-on ticked in advance » ; le catalogue des astuces utilisées
    contient six cartes retirées : addon, lootbox, trial, hiddensub, express,
    renewal ; la fin contient « Here is what you did. », « settlement » **et**
    « fine » (ne pas recopier le « jamais fine » du niveau 2) ;
  - **P17 (en)** : la barre d'action contient « Charged when the trial ends » ;
  - **le bloc « Niveau suivant »** (C75) : les deux décembres semés du §21.3
    T4 ; le revenue est le dernier de l'ordre du Tour, donc sans collection on
    boucle sur l'acquisition (`/fr/game/acquisition?from=other_level`) ; les
    `href` se calculent avec `nextLevelFor`.
