# GAME-BRIEF.md, niveau referral — « S'ils vous recommandent » (§19)

*Écrite le 2026-10-04 (`CHANTIERS.md` A24), pour qu'un agent construise ce
niveau sans rien avoir à décider : chaque chaîne est écrite en français et en
anglais, chaque chiffre est celui que produit le modèle déjà codé
(`src/lib/game/levels/referral.ts`, épinglé par
`src/lib/game/__tests__/referral.test.ts`). Le comment, l'ordre des PR et la
définition de terminé sont dans [`construire-un-niveau.md`](construire-un-niveau.md)
(§21), à lire avant ce fichier. Un renvoi « §n » sans nom de fichier désigne
`GAME-BRIEF.md` ; « §17.x », la spécification du niveau 2
([`niveau-2.md`](niveau-2.md)), dont celle-ci reprend le plan.*

*Les textes de cette spécification passent au statut « à relire » en entrant
dans le code (convention 6) et partent dans un bon à tirer. Ils sont écrits
sans espaces insécables : l'agent les pose en recopiant (§21.5).*

---

## 19. Le niveau referral — spécification

### 19.0 En une page

- **L'univers.** Le DG dirige maintenant **Partix**, une appli grand public de
  partage de dépenses entre amis : week-ends, colocations, voyages, qui doit
  combien à qui. Un million d'utilisateurs ; chaque nouveau en amène 0,40
  autre en moyenne. Le board veut 0,60 en décembre.
- **Le chiffre du board** : le coefficient viral (K), le nombre de nouveaux
  utilisateurs qu'amène chaque nouvel utilisateur par ses invitations. Un
  nombre nu, au centième, qui doit **monter**.
- **Le radar est celui de la CNIL** : les astuces touchent au carnet
  d'adresses, aux messages envoyés au nom des gens, aux données de ceux qui
  n'ont rien demandé. Les notes des stores pèsent aussi : ce sont elles qui
  préviennent (les signalements). Le contrôle finit en **amende
  administrative** de la CNIL.
- **Ce qui ne change pas** : tout le reste (section 4).
- **L'équilibrage est celui du niveau 2**, carte pour carte par rôle, à un
  réglage près : les gains et les rampes des cartes honnêtes sont ×0,99 (C86,
  §19.6). Les quatre années de référence gardent la patience validée (51, 42,
  46, 73).
- **Le téléphone** montre l'écran « Inviter des amis », et ce que reçoit
  l'invitée ; **la pastille** compte les messages envoyés au nom de
  l'utilisateur sans qu'il les ait écrits.

### 19.1 Ce qui change depuis l'esquisse du §11.3

| Esquisse §11.3 | Ici | Pourquoi |
|---|---|---|
| Coefficient viral de 0,3, le board veut 0,6 | **0,40 → 0,60** | Le même ×1,5 que le niveau 2 : l'équilibrage validé se reprend tel quel. Un ×2 aurait demandé de tout régler à nouveau. |
| Radar : CNIL et réputation dans les stores | **un seul radar, CNIL** ; les stores dans les signalements | Le moteur a un seul radar. Les avis à une étoile deviennent l'événement « signalements », qui prévient que le contrôle approche. |
| Partage pour débloquer → Action forcée | **gardée** (`unlock`), mais dans le rôle le plus faible (`shame`), sous son nom établi, « pyramide sociale » | Aucune règle ne l'interdit et aucun cas n'est connu (la règle de l'App Store qu'on croyait la viser ne couvre que les notes et les avis, §19.9) : elle ne peut pas porter un ordre du DG. |
| Bouton continuer → Interférence visuelle | **gardée** (`bigshare`), et c'est elle qui prend le rôle fort (`bury`, l'ordre du T4), sous le nom « fausse hiérarchie » | La CNIL a sanctionné ce mécanisme en 2025 : c'est l'autorité du radar. |
| Invitation personnalisée → Fausse preuve sociale | **gardée** (`fakeinvite`), nom officiel « faux message d'activité » | « Fausse preuve sociale » est déjà deux fois dans le jeu ; le nom de la taxonomie est plus précis. |
| Récompense fantôme → Coût caché | **gardée** (`bonus`), nom officiel « conditions cachées » | « Coût caché » est au niveau 1. |
| Rappels d'attente → Design addictif | **retirée** | Ni règle ni cas, et un nom du niveau 1. |
| — | **ajoutée** : demande d'avis ciblée (`reviewgate`, avis filtrés) | Le chemin du bouche-à-oreille qui passe par les stores, et un nom neuf. |

Résultat : **les huit noms officiels sont absents des niveaux 1 et 2**.

### 19.2 L'univers et le chiffre du board

- **Partix**, appli de partage de dépenses entre amis. Un nom inventé, qui ne
  sort sur aucun produit du secteur (recherche du 2026-10-04, §19.9) ; la
  vérification INPI reste à faire (D9).
- **Le chiffre du board : le coefficient viral.** 0,40 en janvier ; objectifs
  de trimestre **0,43, 0,47, 0,52, puis 0,60** en décembre : ceux du niveau 2
  multipliés par 0,40 / 2 000, qui tombent juste au centième.
- **L'appli** : un million d'utilisateurs au 1er janvier ; 26 000 par mois
  arrivent d'ailleurs (stores, recherche, bouche-à-oreille hors invitation) ;
  chacun en amène K, qui en amènent K chacun, et ainsi trois fois par mois
  (1 + K + K²) ; 4 % s'arrêtent chaque mois ; 0,20 € de revenu par utilisateur
  et par mois (l'offre premium et les offres partenaires, en moyenne). Soit
  0,20 M€ de revenu mensuel en janvier. À K = 0,40, la base ne bouge pas.
- **L'affichage** : la tuile arrondit au centième (« 0,43 »). Décembre est
  gagné à 0,60 affiché, soit 0,595 et plus. Un centième pèse plus lourd qu'une
  dizaine de clients au niveau 2 : le niveau pardonnait un peu plus au hasard,
  et il est durci par C86 (§19.6).

### 19.3 Le modèle

Déjà codé (`levels/referral.ts`) : **l'agent n'y touche pas** (§21.2).

**La formule du mois** est celle du niveau 2 (§17.3) :

`K = 0,40 × (1 + hr) × (1 + dr) × (2 − trustMult(lagTrust)) × presse − spike − saison`, plancher 0,08

**L'économie** (`Economy.kind = "viral"`) :

- arrivées extérieures = 26 000 × (1 + (confiance − 60) / 150), sur la confiance du moment ;
- utilisateurs = utilisateurs × (1 − 4 % × trustMult(lagTrust)) + arrivées × (1 + K + K²) ;
- revenu mensuel = utilisateurs × 0,20 € × multiplicateur de revenu (1,02 avec `bonus`).

**Les constantes**, en regard du niveau 2 :

| Constante | Niveau 2 | Referral | Rapport |
|---|---|---|---|
| Chiffre de janvier | 2 000 | 0,40 | ×0,40/2 000 |
| Objectifs T1 à T4 | 2 150 · 2 350 · 2 600 · 3 000 | 0,43 · 0,47 · 0,52 · 0,60 | exacts |
| Victoire en décembre | ≥ 2 995 | ≥ 0,595 | ce que la tuile affiche |
| Plafonds honnête / astuces | 0,43 / 0,82 | identiques | — |
| Plancher | 400 | 0,08 | ×0,40/2 000 |
| Saison (mois 4 à 6) | −100 | −0,02, le parrainage à 5 € d'une appli concurrente | idem |
| Spike du contrôle / du fil viral | 500 / 330 | 0,10 / 0,066 | idem |
| Décroissance du spike | 170 par mois | 0,034 par mois | idem |
| Patience perdue par écart | 0,084 par client | 420 par unité, soit 8,4 pour 0,02 manqué | idem |
| Presse | ×1,05 sur le chiffre | identique | — |
| Courbe de décembre | 1 000 à 4 000 | tracée en centièmes, 20 à 80 (affichée 0,2 à 0,8) | `chartScale` arrondit le cadre à l'unité |

**Le contrôle : une amende administrative de la CNIL, rendue publique**, pour
des données de tiers collectées sans base légale, de la prospection par
messages sans consentement et des personnes non informées. **75 000 €**,
fixe (C14), validé par Antoine (C84) : environ 3 % du chiffre
d'affaires annuel de Partix (2,4 M€), pour des manquements qui s'additionnent
(articles 6 et 14 du RGPD, minimisation, prospection). Les cas sont au §19.9.

### 19.4 Les cartes

Règle d'écriture inchangée (§5.5), sans marque réelle (le mot « store » est un
nom commun). Chiffres du niveau 2 pour le même rôle, sauf les gains et les
rampes positifs des cartes honnêtes, ×0,99 (C86, §19.6) : 0,05 devient 0,0495.

**Honnêtes** (`honestOrder` : `fairbonus, guests, recap, guestpage, present, chosen, grouplink, nobook, clean`)

| id | Nom FR | Pitch FR | Nom EN | Pitch EN | gain | ramp | trust | radar | autres | rôle |
|---|---|---|---|---|---|---|---|---|---|---|
| fairbonus | Parrainage détaillé | 5 € pour chacun, versés dès la première dépense partagée ; les conditions tiennent sur l'écran d'invitation. | Detailed referral | €5 each, paid on the first shared expense; the conditions fit on the invitation screen. | 0,0495 | 0,0891 | +4 | −2 | perm | pause |
| guests | Question aux invités | Une question facultative aux invités qui ne s'inscrivent pas : « Qu'est-ce qui t'a retenu ? » | Question for guests | One optional question for guests who don't sign up: "What held you back?" | | | +2 | | `insight` | survey |
| recap | Récap partageable | Le récap d'un week-end, qui doit quoi à qui, lisible sans installer l'appli. | Shareable recap | A weekend's recap, who owes what to whom, readable without installing the app. | 0 | 0,1188 | +3 | | perm | onboard |
| guestpage | Page de l'invité | L'invité voit le groupe et sa part avant de créer un compte. | Guest page | Guests see the group and their share before creating an account. | 0,0297 | 0,0792 | +3 | | perm | annual |
| present | *(niveau 1, par référence)* | | | | | | | | `present` | present |
| chosen | Invitation choisie | On choisit chaque contact à inviter, et le message se modifie avant l'envoi. | Chosen invitation | You pick each contact to invite, and the message can be edited before sending. | −0,01 | | +8 | −8 | perm | remind |
| grouplink | Lien de groupe | Un lien d'invitation par groupe, à envoyer où l'on veut. | Group link | One invitation link per group, to send wherever you like. | 0 | 0,0792 | +3 | | perm | reco |
| nobook | Carnet facultatif | L'appli marche sans accès aux contacts ; les numéros des non-inscrits ne sont pas gardés. | Optional address book | The app works without access to contacts; non-users' numbers aren't kept. | −0,03 | | +10 | −20 | perm, `temp` | three |
| clean | *(nom du niveau 1)* | Revenir à l'écran d'invitation, aux messages et au parrainage d'origine. | *(niveau 1)* | Go back to the original invitation screen, messages and referral offer. | | | +6 | −25 | `clean` | clean |

Le gain négatif d'« Invitation choisie » est le nombre d'invitations qui baisse
quand chacune est choisie ; celui de « Carnet facultatif », les suggestions
d'amis qui disparaissent le temps que les utilisateurs invitent autrement
(`temp`).

**Astuces** (`darkOrder` : `contacts, bigshare, fakeinvite, unlock, autoinvite, shadow, bonus, reviewgate` ; au premier trimestre, seulement `contacts, bigshare, fakeinvite, unlock`)

| id | Nom FR | Pitch FR | Nom EN | Pitch EN | gain | trust | radar | rôle |
|---|---|---|---|---|---|---|---|---|
| contacts | Retrouver mes amis | L'appli demande le carnet d'adresses pour retrouver les amis ; à l'écran d'invitation, tous les contacts sont cochés. | Find my friends | The app asks for the address book to find friends; on the invitation screen, every contact is ticked. | 0,12 | −4 | +10 | pdef |
| bigshare | Bouton Continuer | Après chaque dépense ajoutée, un gros bouton « Continuer » invite le groupe et douze contacts suggérés ; « passer » est un lien gris. | Continue button | After each expense is added, a big "Continue" button invites the group and twelve suggested contacts; "skip" is a grey link. | 0,10 | −5 | +15 | bury |
| fakeinvite | Invitation personnalisée | Quand quelqu'un s'inscrit, ses contacts reçoivent « Thomas t'attend sur Partix ». | Personalised invitation | When someone signs up, their contacts receive "Thomas is waiting for you on Partix". | 0,08 | −3 | +8 | cascade |
| unlock | Fonctions à débloquer | L'export du récap et les rappels de remboursement se débloquent à trois amis invités. | Unlockable features | Exporting the recap and repayment reminders unlock at three friends invited. | 0,03 | −2 | +3 | shame |
| autoinvite | Invitations automatiques | À l'inscription, une invitation part vers chaque contact au nom de l'utilisateur, avec deux relances. | Automatic invitations | At sign-up, an invitation goes out to every contact in the user's name, with two follow-ups. | 0,18 | −10 | +25 | call |
| shadow | Suggestions d'amis | Les numéros des contacts non inscrits sont gardés ; l'appli suggère qui inviter et leur propose de rejoindre. | Friend suggestions | Non-users' numbers from the address books are kept; the app suggests who to invite and asks them to join. | 0,04 | −5 | +12 | social |
| bonus | Bonus de parrainage | « 10 € pour toi, 10 € pour ton ami » en tête de l'écran ; les conditions sont dans l'aide. | Referral bonus | "€10 for you, €10 for your friend" at the top of the screen; the conditions are in the help pages. | 0,04 | −5 | +12 | notice (`revenueMult` 1,02 : les bonus promis sont rarement versés) |
| reviewgate | Demande d'avis ciblée | « Tu aimes Partix ? » : « Oui » mène à la note dans le store, « Pas vraiment » à un formulaire interne. | Targeted review prompt | "Enjoying Partix?": "Yes" leads to the store rating, "Not really" to an internal form. | 0,05 | −4 | +4 | streak |

### 19.5 Le DG

**Ordres** (déjà codés) : aucun au T1 ; puis `contacts` au T2, `autoinvite` au
T3, `bigshare` au T4 ; sinon la première disponible de
`contacts, autoinvite, bigshare, fakeinvite, bonus`. Après un contrôle, il ne
demande plus ni `autoinvite` ni `bigshare`.

| id | FR | EN |
|---|---|---|
| contacts | on demande le carnet d'adresses dès l'inscription, et tous les contacts cochés à l'écran d'invitation. Décocher, c'est leur affaire. | we ask for the address book at sign-up, and every contact ticked on the invitation screen. Unticking is their business. |
| autoinvite | les invitations partent toutes seules, au nom de l'utilisateur, avec deux relances. Personne n'invite ses amis à la main. | invitations go out on their own, in the user's name, with two follow-ups. Nobody invites their friends by hand. |
| bigshare | après chaque dépense, un gros bouton « Continuer » qui invite le groupe et les contacts suggérés. « Passer », en petit. Les gens appuient sur le gros bouton. | after every expense, a big "Continue" button that invites the group and the suggested contacts. "Skip", in small print. People tap the big button. |
| fakeinvite | dès que quelqu'un s'inscrit, ses contacts reçoivent un message à son nom : « il t'attend ». Ça marche mieux qu'une pub. | as soon as someone signs up, their contacts get a message in their name: "they're waiting for you". It works better than an ad. |
| bonus | on affiche 10 € de bonus en gros. Les conditions, dans l'aide. On ne paie que ceux qui les remplissent. | we show a €10 bonus in big letters. The conditions go in the help pages. We only pay the ones who meet them. |

**Messages de visio** écrits pour le niveau (les autres, niveau 1) :

| Clé | FR | EN |
|---|---|---|
| t1 | Bonjour. Nouvelle boîte, même promesse : le board veut un coefficient viral de 0,60 en décembre, et je leur ai promis. Fin mars, je veux voir 0,43. Pas 0,42. Tu as deux chantiers ce trimestre. Je ne veux pas savoir comment, je veux le chiffre. | Morning. New company, same promise: the board wants a viral coefficient of 0.60 by December, and I promised them. By the end of March I want to see 0.43. Not 0.42. You have two projects this quarter. I don't want to know how. I want the number. |
| t2Miss | Tu m'as fait mentir en comité. {metric} au lieu de 0,43. Ça n'arrivera pas deux fois. Fin juin, {target}. | You made me look like a liar in front of the committee. {metric} instead of 0.43. It won't happen twice. End of June, {target}. |
| t4Hit | Dernière ligne droite. 0,60 fin décembre et on fête ça. | Home stretch. 0.60 by the end of December and we celebrate. |
| t4Miss | C'est ton dernier trimestre, tu le sais. 0,60 en décembre, ou je présente quelqu'un d'autre au board en janvier. | This is your last quarter, and you know it. 0.60 in December, or I introduce someone else to the board in January. |

### 19.6 Parcours de référence (fixtures)

Les années du niveau 2 (§17.6), carte pour carte par rôle, sauf l'année épinglée
`cleanMiss` (voir plus bas). Tests F19.1 à F19.5 de `referral.test.ts`, déjà
écrits. **Les specs e2e (T4) les jouent à l'interface d'après ces tables.**

**A** — T1 `fairbonus + guests`, T2 `recap + present`, T3 `guestpage + grouplink`, T4 `chosen + present`

| | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| Coefficient viral | 0,42 | 0,43 | 0,53 | 0,60 |
| Patience | 51 | 42 | 46 | 73 |
| Humeur à l'ouverture | firm | angry | angry | firm |
| Ordre | — | contacts | autoinvite | bigshare |

Fin : `applause`, confiance 83, radar 0. Les utilisateurs passent de 1 000 000
à 1 112 020, le revenu mensuel de 0,20 à 0,22 M€.

**B** — T1 `fairbonus + guests`, T2 `recap + guestpage`, T3 `grouplink + present`, T4 `nobook + present`

| | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| Coefficient viral | 0,42 | 0,45 | 0,56 | 0,60 |
| Patience | 51 | 33 | 52 | 79 |

Fin : `applause`, confiance 85, radar 0.

**C** — T1 `contacts + bigshare`, T2 `autoinvite + fakeinvite`, T3 `shadow + bonus`, T4 `fairbonus + chosen`

| | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| Coefficient viral | 0,46 | 0,48 | 0,46 | 0,19 |
| Patience | 67 | 79 | 45 | 0 |
| Humeur à l'ouverture | firm | calm | firm | angry |
| Ordre | — | autoinvite | bonus | contacts |

Signalements et fil viral au T2, contrôle au T3 : amende de 75 000 €, six
astuces retirées, 14 318 utilisateurs qui suppriment leur compte. Fin : `fine`,
confiance 27, radar 1 ; 881 732 utilisateurs et 0,18 M€ de revenu mensuel en
décembre.

**D** — T1 `guests + chosen`, T2 `present + grouplink`

| | T1 | T2 |
|---|---|---|
| Coefficient viral | 0,40 | 0,39 |
| Patience | 41 | 16 |

Viré en juin. Fin : `firedClean`, confiance 73.

**Les quatre fins épinglées** (`paths-referral.ts`) : `repentant`
(`grouplink + fakeinvite`, `unlock + recap`, `chosen + fairbonus`,
`guestpage + clean`), `labyrinth` (`guests + contacts`,
`fairbonus + guestpage`, `clean + bigshare`, `autoinvite + chosen`), `firedDark`
(`bigshare + chosen`, `guests + recap`), et **`cleanMiss`, la seule qui ne vient
pas du niveau 2** : l'année du niveau 2, jouée ici, finit à 0,5959, et la tuile
affiche 0,60, donc des applaudissements. Celle-ci a été trouvée par recherche
parmi les années honnêtes : `fairbonus + guests`, `recap + present`,
`guestpage + present`, `present + chosen` (0,56 en décembre, patience 51, 42,
61, 57).

**Joué au hasard** (cartes tirées dans la main, graine fixe, le même harnais pour les cinq niveaux) :

| Façon de jouer | Niveau 1 | Niveau 2 | Referral |
|---|---|---|---|
| Honnêtes seulement | applaudissements 35 %, viré 34 %, droit dans tes bottes 19 % | 43 %, 27 %, 19 % | 43 %, 27 %, 18 % (49 %, 27 %, 13 % avant C86) |
| Obéit au DG | labyrinthe 65 %, contrôle 23 % | 65 %, 23 % | 65 %, 23 % |
| N'importe quoi | labyrinthe 44 %, viré après astuces 44 % | 53 %, 34 % | 53 %, 34 % |

**Durci le 2026-10-04 (C86).** Avant, le joueur honnête qui jouait au hasard
était applaudi 49 % du temps : la tuile arrondit au centième, donc une année
finie à 0,595 affiche déjà 0,60 et gagne, une tolérance cinq fois plus large
qu'au niveau 2. Les gains et les rampes positifs des cartes honnêtes ×0,99
ramènent le taux à 43 %, comme au niveau 2, sans toucher aux chiffres du board
ni aux années de référence (mêmes chiffres au centième, même patience). Le test
F19.C86 de `referral.test.ts` le tient : 2 000 années tirées avec une graine
fixe, applaudies moins de 45 % du temps, et plus de 45 % sans le réglage.

### 19.7 Le téléphone : l'invitation, des deux côtés

En haut, l'écran de Thomas, qui invite ; en bas, après un séparateur, ce que
reçoit Léa, une de ses contacts. Le téléphone reflète l'union des cartes en
production et cochées. Figure de texte, sans faux boutons.

**Couleur de marque** : un orange brûlé, en jeton (§21.3 T2, jamais
d'hexadécimal dans le module) : `--split-brand: #b04f12; /* 5.29 as text on white, and white on it */`
dans `src/styles/tokens/game.css` (bloc `:root`, après `--shop-brand`) ; dans les
`PAIRS` de `src/__tests__/game-token-contrast.test.ts`, après la ligne de
`shop-brand` :
`{ fg: "split-brand", bg: "app-bg", stated: 5.29, role: "text", why: "Partix's orange as text, and under white on its big button" }`.
`SplitPhone.module.css` pose `.split { --phone-brand: var(--split-brand); }`.
L'orange passe 4,5:1 sur blanc dans les deux sens : le gros bouton « Continuer »
est un `<span>` à fond de marque, texte `--app-on-brand`.

**Le type et l'ordre** (`src/lib/game/split-phone.ts`, composant `SplitPhone`) :

```ts
import type { ReferralCardId } from "./levels/referral";

export type SplitPhoneItem =
  | { kind: "appBar" }
  /** Always: the group and its total. */
  | { kind: "group" }
  /** `bigshare`: the expense just added, the big button, the grey link. */
  | { kind: "continue" }
  /** The referral offer: `clear` with `fairbonus`, else `loud` with `bonus`, else nothing (no item). */
  | { kind: "bonus"; style: "loud" | "clear" }
  /** `unlock`: the locked features. */
  | { kind: "locked" }
  /** The invitation screen: every contact ticked (`contacts` without `chosen`), picked one by one (`chosen`), the group link (`grouplink`). */
  | { kind: "invite"; preselected: boolean; chosen: boolean; groupLink: boolean }
  /** `autoinvite`: what went out on its own. */
  | { kind: "autoSent" }
  /** `reviewgate`: the two-way prompt. */
  | { kind: "review" }
  /** `recap`: the readable recap. */
  | { kind: "recap" }
  /** Always: « Ce que reçoit Léa ». */
  | { kind: "guestDivider" }
  /** Always: Léa's message, personalised with `fakeinvite`. */
  | { kind: "guestMessage"; personalised: boolean }
  /** `shadow`: what the app already knows about Léa. */
  | { kind: "guestShadow" }
  /** `guestpage`: the group without installing. */
  | { kind: "guestPage" }
  /** `guests`: the question to guests who don't join. */
  | { kind: "guestQuestion" }
  /** `nobook`: the promise at the bottom; its second sentence only without `shadow`, which keeps the numbers. */
  | { kind: "noBook"; numbers: boolean };

export function splitPhoneView(ids: readonly string[]): SplitPhoneItem[] {
  const has = (id: ReferralCardId) => ids.includes(id);
  const items: SplitPhoneItem[] = [{ kind: "appBar" }, { kind: "group" }];
  if (has("bigshare")) items.push({ kind: "continue" });
  if (has("fairbonus")) items.push({ kind: "bonus", style: "clear" });
  else if (has("bonus")) items.push({ kind: "bonus", style: "loud" });
  if (has("unlock")) items.push({ kind: "locked" });
  items.push({ kind: "invite", preselected: has("contacts") && !has("chosen"), chosen: has("chosen"), groupLink: has("grouplink") });
  if (has("autoinvite")) items.push({ kind: "autoSent" });
  if (has("reviewgate")) items.push({ kind: "review" });
  if (has("recap")) items.push({ kind: "recap" });
  items.push({ kind: "guestDivider" }, { kind: "guestMessage", personalised: has("fakeinvite") });
  if (has("shadow")) items.push({ kind: "guestShadow" });
  if (has("guestpage")) items.push({ kind: "guestPage" });
  if (has("guests")) items.push({ kind: "guestQuestion" });
  if (has("nobook")) items.push({ kind: "noBook", numbers: !has("shadow") });
  return items;
}
```

**Les chaînes** (`ReferralPhoneCopy`) :

| Champ | Montré par | FR | EN |
|---|---|---|---|
| caption | toujours | L'invitation telle que Thomas l'envoie et que Léa la reçoit | The invitation as Thomas sends it and Léa receives it |
| appName | `appBar` | Partix | Partix |
| time | `appBar` | 19:30 | 19:30 |
| group | `group` | Week-end à Biarritz · 6 personnes · 1 284 € | Weekend in Biarritz · 6 people · €1,284 |
| continueExpense | `continue` | Dépense ajoutée · Restaurant · 186 € | Expense added · Restaurant · €186 |
| continueButton | `continue` | Continuer | Continue |
| continueFine | `continue` | en invitant le groupe et 12 contacts suggérés | inviting the group and 12 suggested contacts |
| continueSkip | `continue` | passer | skip |
| bonusLoud | `bonus` loud | 10 € pour toi, 10 € pour ton ami | €10 for you, €10 for your friend |
| bonusLoudFine | `bonus` loud | *voir conditions | *see conditions |
| bonusClear | `bonus` clear | 5 € chacun dès sa première dépense partagée | €5 each on their first shared expense |
| bonusClearTerms | `bonus` clear | Une fois par ami · versé sous 48 h | Once per friend · paid within 48 hours |
| locked | `locked` | Export PDF et rappels : invite 3 amis pour les débloquer (0/3) | PDF export and reminders: invite 3 friends to unlock them (0/3) |
| inviteTitle | `invite` | Inviter des amis | Invite friends |
| inviteBase | `invite` sans `preselected` ni `chosen` | Choisir dans tes contacts | Pick from your contacts |
| invitePreselected | `invite.preselected` | 214 contacts sélectionnés | 214 contacts selected |
| inviteChosen | `invite.chosen` | 2 contacts choisis · message modifiable | 2 contacts picked · editable message |
| groupLink | `invite.groupLink` | Ou partager le lien du groupe | Or share the group link |
| autoSent | `autoSent` | Invitations envoyées à tes 214 contacts · 2 relances prévues | Invitations sent to your 214 contacts · 2 follow-ups scheduled |
| reviewQuestion | `review` | Tu aimes Partix ? | Enjoying Partix? |
| reviewYes | `review` | Oui → noter l'appli dans le store | Yes → rate the app in the store |
| reviewNo | `review` | Pas vraiment → nous écrire | Not really → write to us |
| recap | `recap` | Récap du week-end, lisible sans l'appli : Léa doit 46 € à Thomas | Weekend recap, readable without the app: Léa owes Thomas €46 |
| guestDivider | `guestDivider` | Ce que reçoit Léa | What Léa receives |
| guestMessage | `guestMessage` | Thomas t'invite dans le groupe « Week-end à Biarritz » sur Partix. | Thomas is inviting you to the "Weekend in Biarritz" group on Partix. |
| guestMessagePersonalised | `guestMessage.personalised` | Thomas t'attend sur Partix ! 3 de tes amis y sont déjà. | Thomas is waiting for you on Partix! 3 of your friends are already there. |
| guestShadow | `guestShadow` | 4 de tes contacts utilisent Partix. Rejoins-les. | 4 of your contacts use Partix. Join them. |
| guestPage | `guestPage` | Voir le groupe et ta part sans installer l'appli | See the group and your share without installing the app |
| guestQuestion | `guestQuestion` | Pas encore inscrite ? Qu'est-ce qui t'a retenue ? Facultatif. | Not signed up yet? What held you back? Optional. |
| guestAnswers | `guestQuestion` | Pas besoin d'une appli de plus · Voir le groupe d'abord · Autre | No need for one more app · See the group first · Other |
| noBook | `noBook` | Partix marche sans tes contacts. | Partix works without your contacts. |
| noBookNumbers | `noBook.numbers` | Les numéros des non-inscrits ne sont pas gardés. | Non-users' numbers aren't kept. |

`guestAnswers` est un tableau de trois chaînes ; `events.surveyAnswers` (§19.8)
cite ses deux premières mot pour mot, en minuscules, comme les niveaux 1 et 2.
`noBookNumbers` suit `noBook` sur la même ligne quand `numbers` est vrai : avec
`shadow` en production, les deux phrases se contrediraient. Léa est au féminin dans
`guestQuestion` (« inscrite », « retenue ») : c'est elle qui lit.

**La pastille** : les messages envoyés au nom de Thomas, qu'il n'a pas écrits.
Un fait que la loi encadre (prospection par message sans consentement, §19.9).

```ts
export const CONTACTS = 214;              // the copy's « 214 contacts »
export const MESSAGES_PER_CONTACT = 3;    // one invitation, two follow-ups
export function sentInYourName(ids: readonly string[]): { messages: number; alert: boolean } {
  const auto = ids.includes("autoinvite") ? CONTACTS * MESSAGES_PER_CONTACT : 0; // 642
  const personalised = ids.includes("fakeinvite") ? CONTACTS : 0;                // 214
  const messages = auto + personalised;
  return { messages, alert: messages > 0 };
}
```

| Cartes en production ou cochées | Pastille FR | Corail |
|---|---|---|
| ni `autoinvite` ni `fakeinvite` | 0 message envoyé au nom de Thomas | non |
| `fakeinvite` | 214 messages envoyés au nom de Thomas · des messages qu'il n'a pas écrits | oui |
| `autoinvite` | 642 messages envoyés au nom de Thomas · des messages qu'il n'a pas écrits | oui |
| les deux | 856 messages envoyés au nom de Thomas · des messages qu'il n'a pas écrits | oui |

**Le dessin, élément par élément** : la moitié de Thomas a la barre d'appli
(`appName`, `time`), celle de Léa n'en a pas ; `guestDivider` les sépare.
- `group` : la ligne du groupe, en tête.
- `continue` : `continueExpense`, `continueButton` en gros bouton plein,
  `continueFine` en petit sous le bouton, `continueSkip` en lien gris : c'est ce
  que la carte met en production.
- `bonus` : la ligne (`bonusClear` ou `bonusLoud`), puis sa mention
  (`bonusClearTerms` ou `bonusLoudFine`, en petit).
- `locked` : une ligne, avec un cadenas dessiné en CSS (aucune chaîne de plus).
- `invite` : `inviteTitle`, puis une seule des trois lignes (`invitePreselected`
  ou `inviteChosen` **remplacent** `inviteBase`), puis `groupLink` quand il y
  est.
- `autoSent`, `review` (`reviewQuestion`, puis `reviewYes` et `reviewNo`),
  `recap` : dans cet ordre, une ligne ou un bloc chacun.
- Côté Léa : `guestMessage` est une bulle sans expéditeur ni heure ;
  `guestMessagePersonalised` la **remplace** (comme `resultSponsored` remplace
  `resultTop` au niveau 2) ; puis `guestShadow`, `guestPage`, `guestQuestion`
  et ses trois `guestAnswers` en puces.
- `noBook` se dessine en pied de téléphone, hors des deux moitiés, sous un
  filet : il parle de l'appli, pas à Léa ; `noBookNumbers` suit sur la même
  ligne quand il y est.

**Les identifiants de test et l'éclair** : `<figure data-testid="game-phone">` ;
chaque élément sauf `appBar` porte `data-testid="game-split-<kind>"`. La clé de
l'éclair, exportée : `splitItemKey(item)` rend `bonus:${style}`,
`invite:${preselected}:${chosen}:${groupLink}`,
`guestMessage:${personalised}`, `noBook:${numbers}`, sinon `kind`.

**Ce qui ne se voit pas** : seules `present` et `clean` ne changent rien au
téléphone. `chosen` et `nobook` ne
changent pas la pastille : un écran honnête ne coupe
pas une automatisation, seul `clean` la retire. Chaînes (`SentPillCopy`, sous la clé `sent`) :
`none` « 0 message envoyé au nom de Thomas » / "0 messages sent in Thomas's name" ;
`some` « {n} messages envoyés au nom de Thomas » / "{n} messages sent in Thomas's name"
(`{n}` formaté par `formatInt`) ; `suffix` « des messages qu'il n'a pas
écrits » / "messages he didn't write". Gabarit déclaré :
`REFERRAL_COPY_TEMPLATES = { ...LEVEL_COPY_TEMPLATES, "sent.some": ["n"] }`.

**C13, en deux temps.** En REF-1 (`game-referral.test.ts`, la copie seule) :
« 214 » dans `phone.invitePreselected` et `phone.autoSent`, en français et en
anglais ; « 2 relances » / « 2 follow-ups » dans `autoSent` ; ni `642` ni `856`
dans aucune feuille (`/\b(642|856)\b/`). En REF-2
(`game-split-phone.test.ts`) : `phone.invitePreselected` et `phone.autoSent`
contiennent `formatInt(locale, CONTACTS)`, et `autoSent` contient
`MESSAGES_PER_CONTACT − 1`.

**La pastille** (`src/components/game/SentPill.tsx`, qui importe
`ClickPill.module.css` comme `BasketPill`) :
`SentPill({ count, alert, labels, size, announce, className }: { count: string; alert: boolean; labels: SentPillCopy; size?: "md" | "sm"; announce?: boolean; className?: string })`,
rendue `<p data-testid="game-sent" data-alert={alert}>` : `none` quand `!alert`,
sinon `some` rempli avec `count` (déjà formaté), suivi de
`<span> · {suffix}</span>` ; corail quand `alert` ; `aria-live="polite"` sauf
avec `announce={false}`. Elle n'importe `lib/game` qu'en `import type`.

**Le côté de l'îlot** (`sides.tsx`), à recopier :

```tsx
type ReferralSideCopy = Pick<ReferralCopy, "phone" | "sent">;

/** The pill's sentence: the messages sent in Thomas's name, and that he didn't write them. */
export function sentSentence(copy: ReferralSideCopy, locale: Locale, r: ReturnType<typeof sentInYourName>): string {
  return r.alert ? `${fill(copy.sent.some, { n: formatInt(locale, r.messages) })} · ${copy.sent.suffix}` : copy.sent.none;
}

export const REFERRAL_SIDE: IslandSide<ReferralSideCopy> = {
  render: ({ ids, copy, locale }) => {
    const r = sentInYourName(ids);
    return (
      <>
        <SplitPhone items={splitPhoneView(ids)} labels={copy.phone} />
        <SentPill count={formatInt(locale, r.messages)} alert={r.alert} labels={copy.sent} announce={false} />
      </>
    );
  },
  pill: ({ ids, copy, locale }) => {
    const r = sentInYourName(ids);
    return { text: r.alert ? fill(copy.sent.some, { n: formatInt(locale, r.messages) }) : copy.sent.none, alert: r.alert };
  },
  announce: ({ before, after, copy, locale }) => {
    const was = sentInYourName(before);
    const now = sentInYourName(after);
    return was.messages === now.messages ? null : sentSentence(copy, locale, now);
  },
};
```

### 19.8 La copie, clé par clé

**Repris du niveau 1 par référence** (`L1.<clé>`, jamais recopiés) : `months`,
`monthInitials`, `quarterPeriod`, `timeline`, `dashboard.label`,
`dashboard.quarterTarget`, `dashboard.boardTarget`, `dashboard.monthEnd`,
`dashboard.revenue`, `dashboard.revenueDelta`, `dashboard.patience`,
`dashboard.patienceLow`, `dashboard.notOnDashboard`, `dashboard.hiddenValue`,
`dashboard.revealed`, `dashboard.delta`, `visio` (sauf `tag`), les clés de
`boss` que le §19.5 n'écrit pas (`t2Hit`, `t3Hit`, `t3Miss`, `orderWrap`,
`yearEnd`, `fired`), `hand` (sauf `unlocked` et `productionEmpty`),
`cards.present`, `cards.clean.name`, `report` (sauf les clés écrites
ci-dessous), `journal`, `effects.insight`, `effects.present`, `effects.none`,
`events.midMailMoving`, `events.midMailStalled`, `events.present`,
`clippings.control.masthead`, `clippings.why.controlHeading`,
`clippings.why.controlRemoved`, `clippings.why.controlNone`,
`clippings.why.reportsHeading`, `news` (tampon « Amende · {fine}» compris :
c'est bien une amende), `bossLines`, les `eyebrow` des sept fins, les `title`
des fins sauf `cleanMiss` et `labyrinth`, `december.cells.outOf`,
`december.gameNumbers`, `december.metricChart.caption`,
`december.metricChart.reference`, `december.trustChart.reference`,
`december.trend`, `december.dataToggle`, `december.table.month`,
`december.table.trust`, `playbook`, `catalogue` (sauf `hiddenEffect`),
`share.replay`, `share.copy`, `share.copied`, `tourLoop`, `resume.title`,
`resume.resume`, `resume.restart`, `resume.review`, `footer`, `a11y.handLabel`,
`a11y.resumed`, et `nextLevel` (après U0 : `eyebrow` « Niveau suivant »,
`status` « jouable » ; `nextLevel: L1.nextLevel`).

**Écrit pour le niveau** :

| Clé | FR | EN |
|---|---|---|
| dashboard.metric | Coefficient viral | Viral coefficient |
| dashboard.metricUnit | par nouvel utilisateur | per new user |
| dashboard.customers | Utilisateurs | Users |
| dashboard.trust | Confiance des utilisateurs | User trust |
| dashboard.radar | Radar CNIL | Regulator radar |
| visio.tag | DG · Partix | CEO · Partix |
| hand.unlocked | Débloqué par la question aux invités | Unlocked by the question for guests |
| hand.productionEmpty | Rien en production pour l'instant. L'écran d'invitation actuel : choisir dans ses contacts, un message tout fait. | Nothing in production yet. The current invitation screen: pick from your contacts, a ready-made message. |
| report.metric | Coefficient viral | Viral coefficient |
| report.customers | Utilisateurs | Users |
| report.driversHeading | Pourquoi le coefficient viral a bougé : {delta} | Why the viral coefficient moved: {delta} |
| report.drivers.word | Ce que tes utilisateurs disent de Partix | What your users say about Partix |
| report.drivers.market | Le parrainage à 5 € d'une appli concurrente | A rival app's €5 referral offer |
| effects.clean | astuces retirées, le coefficient viral baisse un peu | tricks removed, the viral coefficient dips a little |
| effects.gain | +{pct} % d'invitations acceptées ce trimestre | +{pct}% accepted invitations this quarter |
| effects.gainRising | +{pct} % d'invitations acceptées ce trimestre, l'effet monte encore | +{pct}% accepted invitations this quarter, and the effect is still growing |
| effects.loss | −{pct} % d'invitations acceptées ce trimestre, des invitations que les gens ont choisies | −{pct}% accepted invitations this quarter, invitations people actually chose |
| events.surveyAnswers | Les réponses des invités sont arrivées : 4 sur 10 n'avaient « pas besoin d'une appli de plus », 3 sur 10 voulaient « voir le groupe d'abord ». Tes prochains chantiers viseront plus juste, et tu as enfin de quoi montrer au DG : « Point données avec le DG » est débloqué. | The guests' answers are in: 4 in 10 had "no need for one more app", 3 in 10 wanted to "see the group first". Your next projects will aim better, and you finally have something to show the CEO: "Data review with the CEO" is unlocked. |
| events.control | Contrôle de la CNIL, article dans la presse, amende administrative de {fine} prononcée par sa formation restreinte. Le DG te demande de tout retirer avant vendredi. {leavers} utilisateurs suppriment leur compte. | An inspection by the CNIL, France's data protection authority, an article in the press, and an administrative fine of {fine} imposed by its sanctions committee. The CEO asks you to take everything down by Friday. {leavers} users delete their accounts. |
| events.reports | Des centaines d'avis à une étoile dans les stores, et des plaintes déposées auprès de la CNIL. Un journaliste pose des questions au service presse. | Hundreds of one-star reviews in the app stores, and complaints filed with the CNIL. A journalist is asking the press office questions. |
| events.viral | Un fil viral : « Partix, j'ai désinstallé, voici pourquoi. » Les invités ne s'inscrivent plus. | A viral thread: "Partix, I uninstalled it, here's why." Guests stop signing up. |
| events.press | Un média tech cite Partix en exemple d'une appli qui ne force pas la main. Les utilisateurs invitent leurs amis d'eux-mêmes. | A tech outlet cites Partix as an app that doesn't push people around. Users invite their friends of their own accord. |
| events.competitor | Une appli concurrente a offert 5 € par parrainage au printemps. Tout le monde a perdu des invitations ce trimestre, toi compris. | A rival app offered €5 a referral in the spring. Everyone lost invitations this quarter, you included. |
| clippings.control.headline | Partix sanctionné par la CNIL | Partix fined by France's data protection watchdog |
| clippings.reports.masthead | L'Écho des applis | The App Echo |
| clippings.reports.headline | Les avis à une étoile contre Partix s'accumulent | One-star reviews of Partix pile up |
| clippings.viral.handle | @coloc_en_paix | @peaceful_flatshare |
| clippings.press.masthead | Le Fil tech | The Tech Wire |
| clippings.press.headline | Partix, l'appli qui ne force pas la main | Partix, the app that doesn't push |
| clippings.competitor.masthead | La Lettre des applis | The App Letter |
| clippings.competitor.headline | Les parrainages à 5 € se multiplient | €5 referrals are everywhere |
| clippings.why.controlRadar | Chaque astuce mise en production a fait monter le radar CNIL, la tuile masquée de ton tableau de bord. Ce trimestre, il a franchi le seuil du contrôle. | Every trick you put into production pushed up the regulator radar, the hidden tile on your dashboard. This quarter it crossed the inspection threshold. |
| clippings.why.reports | Les avis des stores et les plaintes arrivent à la CNIL : ton radar CNIL, la tuile masquée de ton tableau de bord, approche du seuil du contrôle. Chaque nouvelle astuce l'en rapproche. | Store reviews and complaints are reaching the CNIL: your regulator radar, the hidden tile on your dashboard, is nearing the inspection threshold. Every new trick brings it closer. |
| december.cells.metric | Coefficient viral en {month} | Viral coefficient in {month} |
| december.cells.trust | Confiance des utilisateurs | User trust |
| december.cells.radar | Radar CNIL | Regulator radar |
| december.metricChart.title | Coefficient viral par mois | Viral coefficient per month |
| december.metricChart.label | Coefficient viral sur l'année, mois par mois | Viral coefficient over the year, month by month |
| december.trustChart.title | Confiance des utilisateurs, le compteur que personne n'affichait | User trust, the counter nobody displayed |
| december.trustChart.caption | De 0 à 100. À 35 ou moins, les utilisateurs le racontent, et les invités ne viennent plus. | From 0 to 100. At 35 or below, users talk, and guests stop coming. |
| december.trustChart.label | Confiance des utilisateurs sur l'année | User trust over the year |
| december.table.metric | Coefficient viral | Viral coefficient |
| catalogue.hiddenEffect | Confiance {trust}, radar {radar}, une seule fois, le jour où elle entre en production. Les invitations qu'elle fait accepter baissent de 30 % après trois mois. | Trust {trust}, radar {radar}, once, on the day it goes into production. The invitations it gets accepted drop by 30% after three months. |
| share.text | Une année chez Partix : {title} Coefficient viral à {metric}, confiance à {trust}. Et toi, tu tiendrais ? {url} | A year at Partix: {title} Viral coefficient at {metric}, trust at {trust}. Would you hold out? {url} |
| resume.previously | Précédemment chez Partix | Previously at Partix |
| resume.quarterLine | Trimestre {q} : {cards}. Coefficient viral à {metric}. | Quarter {q}: {cards}. Viral coefficient at {metric}. |
| resume.finished | Ta dernière année chez Partix s'est terminée ainsi : « {title} » | Your last year at Partix ended like this: "{title}" |
| a11y.quarterEnd | Fin du trimestre {q} : coefficient viral {metric}, objectif {target} {status}, patience {patience}. | End of quarter {q}: viral coefficient {metric}, target {target} {status}, patience {patience}. |

**Les fins** (`{metric}` arrive formaté : « 0,60 ») : `win` est un littéral,
`true` pour `applause` et `cleanMiss`, `false` pour les cinq autres, comme dans
`acquisition.ts` ; `eyebrow` et les titres non listés viennent du niveau 1.

| id | Titre (si écrit) | Texte FR | Texte EN |
|---|---|---|---|
| applause | — | Coefficient viral à {metric} en décembre, {customers} utilisateurs, une confiance à {trust} que personne ne mesurait. Pas un message envoyé à la place de quelqu'un, pas un contact coché d'avance. Le DG t'a pressé trois fois. Tu as répondu avec des chiffres. C'est exactement le métier. | Viral coefficient at {metric} in December, {customers} users, trust at {trust} that nobody was measuring. Not one message sent in someone else's name, not one contact ticked in advance. The CEO pushed you three times. You answered with numbers. That is exactly the job. |
| cleanMiss | Pas encore 0,60. Mais tout est propre. / Not 0.60 yet. But everything is clean. | Coefficient viral à {metric}, confiance à {trust}. La courbe monte encore, parce que les effets lents ne s'arrêtent pas en décembre. Le board voulait un chiffre, tu as construit une pente. Regarde la confiance : c'est elle qui fera le 0,60 au printemps. | Viral coefficient at {metric}, trust at {trust}. The curve is still climbing, because slow effects don't stop in December. The board wanted a number; you built a slope. Look at trust: that's what will deliver the 0.60 in the spring. |
| firedClean | — | La patience du DG est tombée à {patience} avant que tes effets lents n'arrivent. Confiance à {trust}. L'année suivante, ton remplaçant a fait écrire à tous les contacts sans demander. Le jeu ne récompense pas toujours ceux qui ont raison trop tôt. La vraie vie non plus. Rejoue, et présente tes données plus tôt. | The CEO's patience fell to {patience} before your slow effects could arrive. Trust at {trust}. The next year, your replacement had every contact messaged without asking. The game doesn't always reward people who are right too early. Neither does real life. Play again, and show your data sooner. |
| firedDark | — | Tu as pris des astuces, et la patience du DG est quand même tombée à {patience}. Confiance à {trust}, radar à {radar}. Ce que le DG voulait, c'était le chiffre, tout de suite, et il ne se souvient pas de ce qu'il a demandé. | You used tricks, and the CEO's patience still fell to {patience}. Trust at {trust}, radar at {radar}. What the CEO wanted was the number, right now, and he doesn't remember what he asked for. |
| fine | — | Le radar est monté jusqu'au contrôle, l'amende est tombée, la presse a écrit. Coefficient viral à {metric} en décembre, confiance à {trust}. Les amis invités de force ont désinstallé, et ils l'ont raconté. Ce que tu as mis en production a des noms. Ils sont en dessous. | The radar climbed all the way to an inspection, the fine landed, the press wrote about it. Viral coefficient at {metric} in December, trust at {trust}. The friends invited by force uninstalled, and told everyone why. What you put into production has names. They are below. |
| labyrinth | Les invitations tiennent. Regarde ce qu'elles coûtent. / The invitations hold. Look at what they cost. | Pas de contrôle cette année. Coefficient viral à {metric}, et une confiance à {trust} que ton dashboard ne t'a jamais montrée. Les utilisateurs que tu as pressés partent plus vite qu'ils ne sont venus. Le radar est à {radar}. Il ne redescend pas tout seul. | No inspection this year. Viral coefficient at {metric}, and trust at {trust} that your dashboard never showed you. The users you pushed leave faster than they came. The radar is at {radar}. It doesn't come down on its own. |
| repentant | — | Tu as mis des astuces en production, puis tu les as retirées. Coefficient viral à {metric}, confiance à {trust}, radar à {radar}. La confiance remonte plus lentement qu'elle ne tombe. C'est la seule règle du jeu qui est aussi celle de la vraie vie. | You put tricks into production, then took them out. Viral coefficient at {metric}, trust at {trust}, radar at {radar}. Trust climbs back more slowly than it falls. It's the one rule of the game that is also a rule of real life. |

### 19.9 Le catalogue : les huit astuces, vérifiées

Vérifié le 2026-10-04 par un agent de recherche, sur les sources primaires
quand elles étaient lisibles (garanteprivacy.it, bundesgerichtshof.de, le
jugement Perkins c. LinkedIn, asa.org.uk, accc.gov.au, cnil.fr, Légifrance, les
règles de l'App Store du 8 juin 2026 et celles de Google Play, Gray et al.
2018, que cette session a relu elle-même). Ce qui n'a été lu que dans une source
secondaire est signalé ; tout reste à relire par Antoine avant l'ouverture
(D9). Les sanctions de la CNIL sont citées sans le nom de l'entreprise (QC3,
§21.8) ; un accord transactionnel ou une décision contestée est dit comme tel.

| Carte | Nom officiel FR / EN | Source du nom |
|---|---|---|
| contacts | Aspiration du carnet d'adresses / Address book leeching | Bösch et al., PoPETs 2016 ; OCDE 2022 |
| bigshare | Fausse hiérarchie / False hierarchy | OCDE 2022 (« Visual interference » chez deceptive.design) |
| fakeinvite | Faux message d'activité / Fake activity message | Mathur et al. 2019 (« Activity messages ») ; OCDE 2022 |
| unlock | Pyramide sociale / Social pyramid | Gray et al., CHI 2018 |
| autoinvite | Spam d'amis / Friend spam | Brignull, 2010 (aujourd'hui rangé sous « Forced action ») |
| shadow | Profils fantômes / Shadow profiles | Bösch et al., PoPETs 2016 (« Shadow user profiles ») |
| bonus | Conditions cachées / Hidden information | OCDE 2022 ; Gray et al. 2018 |
| reviewgate | Avis filtrés / Review gating | FTC, guides sur les recommandations (16 CFR 255.2) |

**Les textes** (`patterns.<id>`), à recopier tels quels :

**contacts**
- law FR : L'appli qui récupère un carnet d'adresses traite les données de personnes qui n'ont rien demandé : il lui faut une base légale (RGPD, article 6), et elle doit les informer (article 14). La CNIL recommande de supprimer les contacts dès la recherche d'amis terminée, et les règles de l'App Store interdisent de cocher tous les contacts d'avance.
- law EN : An app that collects an address book processes data about people who asked for nothing: it needs a legal basis (GDPR, article 6), and it must inform them (article 14). The CNIL, France's data protection authority, recommends deleting the contacts as soon as the friend search is over, and the App Store's rules forbid ticking every contact in advance.
- cas FR : En 2022, l'autorité italienne de protection des données a infligé 2 millions d'euros à l'éditeur de Clubhouse, qui collectait les carnets d'adresses de ses utilisateurs sans informer les personnes qui y figuraient.
- cas EN : In 2022, Italy's data protection authority fined the publisher of Clubhouse €2 million for collecting its users' address books without informing the people listed in them.
- tell FR : Si tous tes contacts sont cochés d'avance, c'est l'appli qui invite, pas toi.
- tell EN : If all your contacts are ticked in advance, it's the app inviting, not you.
- Sources : Garante per la protezione dei dati personali, ordonnance nº 377 du 6 octobre 2022, annoncée le 5 décembre 2022 (lue par un outil) ; App Store Review Guidelines, 5.1.2(v) (« do not include a Select All option or default the selection of all contacts », lu) ; recommandation de la CNIL sur les applications mobiles, 2024 (lue). Un recours éventuel n'a pas été vérifié.

**bigshare**
- law FR : Un gros bouton qui partage, à côté d'un petit lien gris qui passe, oriente le choix : la CNIL juge qu'un accord obtenu ainsi n'est pas libre (RGPD, articles 4 et 7).
- law EN : A big button that shares, next to a small grey link that skips, steers the choice: the CNIL considers that agreement obtained that way isn't free (GDPR, articles 4 and 7).
- cas FR : En mai 2025, la CNIL a infligé 900 000 euros à une société de marketing : ses formulaires mettaient en valeur de gros boutons d'acceptation, à côté de liens de refus minuscules qui se confondaient avec le texte.
- cas EN : In May 2025, the CNIL fined a marketing company €900,000: its forms highlighted big accept buttons, next to tiny refusal links that blended into the text.
- tell FR : Gros bouton pour partager, petit lien gris pour refuser : le choix est orienté.
- tell EN : Big button to share, small grey link to say no: the choice is being steered.
- Sources : délibération SAN-2025-001 du 15 mai 2025 (cnil.fr, lue par un outil : « La mise en valeur des boutons […] comparée aux liens hypertextes […] d'une taille nettement inférieure et se confondant avec le corps du texte pousse fortement l'utilisateur à accepter ») ; nominative jusqu'en mai 2027 environ, citée sans le nom (QC3).

**fakeinvite**
- law FR : Donner l'impression qu'un message vient d'un ami, quand il vient de l'entreprise, fait partie des pratiques trompeuses interdites en toutes circonstances : se présenter faussement comme un consommateur (article L121-4 du Code de la consommation). Un message de prospection ne doit pas non plus cacher pour le compte de qui il est envoyé (article L34-5 du Code des postes et des communications électroniques).
- law EN : Making a message look as if it comes from a friend, when it comes from the company, is one of the misleading practices banned in all circumstances under French law: falsely presenting oneself as a consumer (article L121-4 of the Consumer Code). A marketing message must not hide on whose behalf it is sent either (article L34-5 of the Postal and Electronic Communications Code).
- cas FR : En 2009, le réseau social Tagged a accepté de payer 500 000 dollars pour clore les poursuites de l'État de New York, sans reconnaître sa responsabilité : ses e-mails, maquillés pour sembler venir des membres eux-mêmes, annonçaient des photos partagées qui n'existaient pas.
- cas EN : In 2009, the social network Tagged agreed to pay $500,000 to settle New York State's case, without admitting liability: its emails, disguised to look as if members had sent them, announced shared photos that didn't exist.
- tell FR : Si l'ami cité n'a rien fait, le message vient de l'appli, pas de lui.
- tell EN : If the friend named didn't do anything, the message comes from the app, not from them.
- Sources : communiqué du procureur général de New York du 9 juillet 2009 (intention de poursuivre, lu par un outil) ; accord du 9 novembre 2009, 500 000 $ (source secondaire, NBC News : à relire) ; C. consom. L121-4 21° (lu dans le Code consolidé) ; CPCE L34-5. Ne pas citer Classmates.com, une action collective privée.

**unlock**
- law FR : Aucune règle ne l'interdit en soi : les règles de l'App Store interdisent d'exiger une note ou un avis pour accéder à une fonction, pas une invitation. Mais chaque invitation envoyée reste de la prospection, avec ses règles.
- law EN : No rule bans it as such: the App Store's rules forbid requiring a rating or a review to unlock a feature, not an invitation. But every invitation sent is still marketing, with its own rules.
- cas FR : En 2018, des chercheurs de l'université Purdue l'ont décrite à partir de FarmVille, où certains objectifs restaient inaccessibles sans amis recrutés dans le jeu.
- cas EN : In 2018, researchers at Purdue University described it using FarmVille, where some goals stayed out of reach without friends recruited into the game.
- tell FR : Une fonction qui se débloque en recrutant des amis te fait travailler pour l'appli.
- tell EN : A feature that unlocks when you recruit friends has you working for the app.
- Sources : Gray, Kou, Battles, Hoggatt et Toombs, « The Dark (Patterns) Side of UX Design », CHI 2018 (lu par cette session : « Social Pyramid requires users to recruit other users to use the service […] FarmVille »), App Store Review Guidelines 3.2.2(x) (lu : « store-related actions » seulement). Aucun cas d'autorité : c'est la « zone grise » du niveau, et son radar (+3) est le plus faible.

**autoinvite**
- law FR : Envoyer des messages de promotion par SMS ou par e-mail à des personnes qui n'ont rien accepté est interdit (article L34-5 du Code des postes et des communications électroniques). Pour le parrainage, la CNIL précise que les coordonnées d'un ami ne servent qu'une fois : les relances automatiques en sortent.
- law EN : Sending promotional texts or emails to people who agreed to nothing is prohibited under French law (article L34-5 of the Postal and Electronic Communications Code). For referrals, the CNIL specifies that a friend's details can be used only once: automatic follow-ups fall outside that.
- cas FR : En 2016, la Cour fédérale de justice allemande a interdit à Facebook ses e-mails d'invitation « Trouver des amis » : même déclenchés par l'utilisateur, ils étaient une publicité de Facebook. Aux États-Unis, LinkedIn a accepté de verser 13 millions de dollars pour clore une action collective sur ses invitations et leurs relances.
- cas EN : In 2016, Germany's Federal Court of Justice barred Facebook's "Find friends" invitation emails: even when triggered by the user, they were Facebook's advertising. In the United States, LinkedIn agreed to pay $13 million to settle a class action over its invitations and their follow-ups.
- tell FR : Une invitation que tu n'as pas écrite part quand même en ton nom.
- tell EN : An invitation you didn't write still goes out in your name.
- Sources : BGH, 14 janvier 2016, I ZR 65/14 (communiqué lu par un outil : « Die Einladungs-E-Mails sind Werbung der Beklagten, auch wenn ihre Versendung durch den […] Nutzer ausgelöst wird ») — une action en cessation, sans amende ; Perkins c. LinkedIn, nº 13-cv-04303-LHK, approbation définitive du 16 février 2016 (lue : un accord, LinkedIn « contested its liability ») ; fiche de la CNIL « Parrainage et jeux concours », 2016 (lue, antérieure au RGPD).

**shadow**
- law FR : Garder les numéros de personnes qui ne se sont jamais inscrites demande de les informer (RGPD, article 14) et de ne garder que le nécessaire (article 5). La CNIL demande de supprimer les contacts une fois la recherche d'amis faite, et les règles de l'App Store interdisent d'en faire une base pour soi.
- law EN : Keeping the numbers of people who never signed up requires informing them (GDPR, article 14) and keeping only what is needed (article 5). The CNIL asks for contacts to be deleted once the friend search is done, and the App Store's rules forbid building a database of them for yourself.
- cas FR : En 2021, l'autorité irlandaise de protection des données a infligé 225 millions d'euros à WhatsApp, notamment pour n'avoir pas informé les non-utilisateurs dont les numéros figuraient dans les carnets d'adresses. WhatsApp conteste la décision en justice.
- cas EN : In 2021, Ireland's data protection authority fined WhatsApp €225 million, notably for not informing non-users whose numbers appeared in address books. WhatsApp is challenging the decision in court.
- tell FR : Tes amis jamais inscrits ont peut-être déjà une fiche chez l'appli.
- tell EN : Your friends who never signed up may already have a file at the app.
- Sources : décision de la DPC du 2 septembre 2021, après la décision contraignante 1/2021 du CEPD (citée par la recommandation de la CNIL, lue) ; CJUE, C-97/23 P, 10 février 2026 (communiqué nº 11/26, lu : le recours de WhatsApp est recevable et renvoyé au Tribunal). La part de 75 M€ attribuée à l'article 14 vient de sources secondaires : ne pas l'écrire. App Store 5.1.2(iv) (lu).

**bonus**
- law FR : Des conditions qui changent la valeur d'une offre sont une information essentielle : les cacher dans l'aide, ou les donner trop tard, est une pratique commerciale trompeuse (articles L121-2 et L121-3 du Code de la consommation).
- law EN : Conditions that change what an offer is worth are essential information: hiding them in the help pages, or giving them too late, is a misleading commercial practice under French law (articles L121-2 and L121-3 of the Consumer Code).
- cas FR : En 2024, l'autorité britannique de la publicité a donné tort à Beer52 : son offre de parrainage promettait une caisse gratuite, à condition, écrit seulement dans les conditions générales, que l'ami en paie une deuxième au prix fort.
- cas EN : In 2024, the UK's advertising regulator ruled against Beer52: its referral offer promised a free case, on condition, written only in the terms and conditions, that the friend paid full price for a second one.
- tell FR : Bonus en gros, conditions dans l'aide : c'est l'aide qui dit vrai.
- tell EN : Bonus in big letters, conditions in the help pages: the help pages tell the truth.
- Sources : ASA, décision Beer52 Ltd du 18 décembre 2024, A24-1251988, plainte « Upheld » (lue par un outil) — une décision d'autorégulation, sans amende ; C. consom. L121-2 et L121-3. L'autorité française serait la DGCCRF : la carte sort du champ de la CNIL, ce que le radar unique du jeu simplifie.

**reviewgate**
- law FR : Aucun texte français ne vise expressément ce tri en amont, mais les règles des deux stores l'interdisent : il faut passer par leur demande d'avis officielle, sans question avant. Une note gonflée ainsi peut aussi tromper ceux qui la lisent (article L121-2 du Code de la consommation).
- law EN : No French text expressly targets this upstream sorting, but both app stores' rules forbid it: the official review prompt must be used, with no question before it. A rating inflated this way can also mislead the people who read it (article L121-2 of the French Consumer Code).
- cas FR : En 2018, la justice australienne a condamné le groupe hôtelier Meriton à 3 millions de dollars australiens : il retirait des invitations à laisser un avis les clients susceptibles d'en écrire un mauvais.
- cas EN : In 2018, an Australian court ordered the hotel group Meriton to pay A$3 million: it had kept guests likely to write a bad review out of the invitations to leave one.
- tell FR : Si seuls les contents sont envoyés vers le store, la note ment.
- tell EN : If only happy users get sent to the store, the rating lies.
- Sources : ACCC, communiqué du 31 juillet 2018 (lu par un outil : pénalité civile prononcée par la Federal Court) ; App Store Review Guidelines 5.6.1 (« we will disallow custom review prompts », lu) ; Google, guide de l'In-App Review API, 30 janvier 2026 (« shouldn't ask the user any questions before […] such as "Do you like the app?" », lu) ; FTC, 16 CFR 255.2(e)(11). La règle FTC de 2024 sur les avis (16 CFR 465) ne couvre pas le review gating : ne pas la citer. Ne pas citer Fashion Nova (une suppression d'avis, déjà au niveau 2).

**Liste blanche des marques** (série C6) : Clubhouse, Tagged, FarmVille, Facebook,
LinkedIn, WhatsApp, Beer52, Meriton. « App Store » paraît dans les textes de loi,
pas dans les `cas`. Les institutions (CNIL, Cour fédérale de justice
allemande, université Purdue…) sont des mots ordinaires du test. Pour le test
(§21.3 T1), exactement, calculés avec `CAPITALISED` sur les seize `cas` de ce
§19.9 :
- `BRANDS = ["Clubhouse", "Tagged", "FarmVille", "Facebook", "LinkedIn", "WhatsApp", "Beer52", "Meriton"]` ;
- `BRAND_WORDS = new Set([...BRANDS.flatMap((b) => [b, `${b}'s`]), "Beer"])` :
  `CAPITALISED` coupe « Beer52 » en « Beer » et garde le possessif
  « Facebook's » ;
- `NOT_BRANDS = new Set(["A", "Australian", "Aux", "CNIL", "Cour", "Court", "En", "Federal", "Find", "Germany's", "In", "Ireland's", "Italy's", "Justice", "May", "New", "Purdue", "State's", "States", "Trouver", "UK's", "United", "University", "York", "États-Unis"])` ;
- aucun domaine.

**La nature de chaque cas** (C6) : `patterns.fakeinvite.cas` contient « sans
reconnaître sa responsabilité » / "without admitting liability" ;
`patterns.autoinvite.cas` « pour clore une action collective » / "to settle a
class action" ; `patterns.shadow.cas` « conteste la décision en justice » / "is
challenging the decision in court".

**Le nom de l'entreprise** : « Splitto » (une appli existe), « Quotix »,
« Divizo » (trop proche de Divido), « Rembix », « Partagea » écartés ;
**« Partix »** ne sort sur aucun produit du secteur (recherche web du
2026-10-04). Repli : « Cagnotix ». INPI à faire (D9). Ne jamais citer les
applis réelles du secteur (Tricount, Splitwise…).

**Corrigé dans l'esquisse du §11.3** : les 800 000 $ de Path visent la COPPA (les
enfants), pas le carnet d'adresses ; l'accord LinkedIn est une action collective
approuvée en 2016 ; Tagged, c'est 2009 et non 2010 ; la règle 3.2.2 de l'App
Store ne couvre pas le partage pour débloquer.

### 19.10 Questions pour Antoine

Les questions communes sont au §21.8.

| # | Question | Reco | Si on se trompe | Réponse |
|---|---|---|---|---|
| Q1 | **Le chiffre du board : le coefficient viral, de 0,40 à 0,60** (l'esquisse disait 0,3 à 0,6) ? | **Oui** : le même ×1,5 que le niveau 2, donc l'équilibrage validé. Un ×2 demanderait de tout régler à nouveau. | Changer le chiffre change la tuile, les messages du DG et les tables. | **Oui** (C82, Antoine, 2026-10-04). |
| Q2 | **Le nom : Partix** ? | **Oui**. Repli : Cagnotix. | Un nom propre à remplacer en une passe avant T1. | **Oui** (C83, Antoine, 2026-10-04). |
| Q3 | **Le contrôle : une amende administrative de 75 000 €, rendue publique** ? | **Oui** : environ 3 % du chiffre d'affaires, pour des manquements qui s'additionnent. | Un montant, sans effet sur l'équilibrage. | **Oui** (C84, Antoine, 2026-10-04). |
| Q4 | **Les huit astuces du §19.4** : le partage pour débloquer dans le rôle faible, le gros bouton « Continuer » dans le rôle fort, les rappels d'attente retirés, la demande d'avis ciblée ajoutée ? | **Oui** : huit noms neufs, chacun avec un texte et un cas réels, sauf la zone grise assumée. | Une PR de spécification avant T1. | **Oui** (C85, Antoine, 2026-10-04). |
| Q5 | **Le niveau pardonne un peu plus au hasard** (49 % d'applaudissements pour un joueur honnête qui joue au hasard, contre 43 % au niveau 2), à cause du centième de la tuile ? | **Laisser**, et que la recette tranche, comme pour le niveau 2. Durcir voudrait dire afficher trois décimales, ou régler à nouveau. | Rien de visible pour un vrai joueur avant la recette. | **Durcir maintenant** (C86, Antoine, 2026-10-04) : les gains et les rampes positifs des cartes honnêtes ×0,99, appliqués dans `levels/referral.ts` ; 43 % au lieu de 49 %, les années de référence inchangées (§19.6, test F19.C86). |

### 19.11 La copie autour du jeu

| Où | Clé | FR | EN |
|---|---|---|---|
| `meta.ts` | `GAME_META.referral.title` | Partix : le jeu du referral — Tour de Growth | Partix: the referral game — Tour de Growth |
| `meta.ts` | `GAME_META.referral.description` | Joue une année comme PM growth d'une appli de partage de dépenses : un DG qui veut un coefficient viral de 0,60, et huit astuces à reconnaître. | Play a year as the growth PM of an expense-sharing app: a CEO who wants a viral coefficient of 0.60, and eight tricks to learn to spot. |
| `meta.ts` | `GAME_META.referral.breadcrumb` | Une année chez Partix | A year at Partix |
| `meta.ts` | `GAME_META.referral.shareImageAlt` | Une année chez Partix : un coefficient viral de 0,40, la confiance et le radar CNIL absents du dashboard. | A year at Partix: a viral coefficient of 0.40, user trust and the regulator's radar missing from the dashboard. |
| `meta.ts` | `REFERRAL_INTRO.eyebrow` | Le côté obscur · referral | The dark side · referral |
| `meta.ts` | `REFERRAL_INTRO.title` | Une année chez Partix | A year at Partix |
| `meta.ts` | `REFERRAL_INTRO.lead` | Ton DG dirige maintenant Partix, une appli de partage de dépenses entre amis, et il t'a emmené avec lui comme PM growth. Un million d'utilisateurs, et chaque nouveau en amène 0,40 autre en moyenne par ses invitations : c'est le coefficient viral. Le board veut 0,60 d'ici décembre. Chaque trimestre, le DG t'appelle en visio, puis tu as droit à deux actions, nommées comme on les nomme en réunion. Tu ne sauras ce qu'elles valent qu'une fois le trimestre passé. Le DG, lui, sait déjà ce qu'il veut. | Your CEO now runs Partix, an app for splitting costs with friends, and he brought you along as growth PM. A million users, and each new one brings in 0.40 more on average through their invitations: that's the viral coefficient. The board wants 0.60 by December. Every quarter the CEO calls you on video, then you get two actions, named the way they are named in meetings. You will only learn what they are worth once the quarter is over. The CEO already knows what he wants. |
| `meta.ts` | `REFERRAL_INTRO.stepsTitle`, `steps`, `glossaryLead` | *(niveau 1, par référence)* | |
| `entry.ts` | `GAME_ENTRY_COPY.referral.title` | Le côté obscur du referral | The dark side of referral |
| `entry.ts` | `…body` | Voici ce qu'il ne faut pas faire : joue une année comme PM growth d'une appli de partage de dépenses, un DG qui veut que chaque utilisateur en amène d'autres, et huit astuces que tu reconnaîtras ensuite partout. | Here is what not to do: play a year as the growth PM of an expense-sharing app, with a CEO who wants every user to bring in more, and eight tricks you will recognise everywhere afterwards. |
| `entry.ts` | `…cta` | Jouer le niveau « S'ils vous recommandent » | Play the level "If they recommend you" |
| `entry.ts` | `…band.metric` | Coefficient viral {metric} | Viral coefficient {metric} |
| `entry.ts` | `…opening`, `meta`, `band.trust`, `band.notOnDashboard` | *(les constantes partagées du fichier)* | |
| `hub.ts` | `zones.referral.company` | Partix, une appli de partage de dépenses entre amis | Partix, an app for splitting costs with friends |
| `hub.ts` | `ENDINGS_BY_LEVEL.referral` | *(aucune entrée : « le contrôle et l'amende » du niveau 1 est juste)* | |
| `hub.ts` | `LEVEL_TEASERS.referral` (REF-3, quand `referral` entre dans `LevelSlug` ; le mécanisme est celui de T0) | « S'ils vous recommandent » : les invitations envoyées pour toi, le carnet aspiré, le bonus aux conditions introuvables | "If they recommend you": invitations sent for you, the scraped address book, the bonus with conditions nowhere to be found |
| `page.tsx` | les deux mots du glossaire | `["referral", "viral-coefficient"]` | |

### 19.12 Plan d'exécution

Les PR T1 à T4 du §21.3, avec ce qui est propre au niveau (unités REF-1 à
REF-4 du §21.9).

- **T1, la copie (REF-1)** : `ReferralCopy`, `ReferralOrderId` (`contacts`,
  `autoinvite`, `bigshare`, `fakeinvite`, `bonus`), `ReferralPhoneCopy` (§19.7,
  un champ par ligne du tableau, la colonne « Montré par » servant de
  doc-comment, en anglais ; `guestAnswers: readonly string[]`) et
  `SentPillCopy` (`none`, `some`, `suffix`), la pastille sous la clé `sent` ;
  `REFERRAL_COPY_TEMPLATES = { ...LEVEL_COPY_TEMPLATES, "sent.some": ["n"] }`.
  `src/content/game/referral.ts`, `REFERRAL_INTRO` et `GAME_META.referral`. Ce
  qui reste fictif, pour l'en-tête « What stays fictional » : Partix, Thomas,
  Léa, @coloc_en_paix / @peaceful_flatshare, L'Écho des applis, Le Fil tech, La
  Lettre des applis ; les vraies marques n'apparaissent que dans les `cas`.
  Le test `src/content/__tests__/game-referral.test.ts` :
  - **C1** (une sous-chaîne, pas la regex du niveau 2) : chaque `law.fr`
    contient l'un de « RGPD », « Code de la consommation », « Code des postes
    et des communications électroniques », « App Store » ; chaque `law.en` l'un
    de « GDPR », « Consumer Code », « Postal and Electronic Communications
    Code », « App Store » ;
  - **la règle du contrôle**, qui remplace C14 (après
    `text.replace(/\{fine\}/g, "")`) : `events.control` correspond à
    `/amende/` et contient « CNIL » (EN `/\bfine\b/` et « CNIL ») ;
    `news.stamps.fine`, repris du niveau 1, à `/Amende/` (EN `/Fined/`) ;
    `endings.fine.text` à `/amende/` (EN `/\bfine\b/`) ; aucune feuille du
    niveau ne correspond à `/transaction/i` en français ni à
    `/\bsettlement\b/i` en anglais (« to settle » apparaît dans deux `cas`,
    voulu) ;
  - **C4** : `targets[0]` vaut 0.43, `targets[3]` vaut 0.6, `metric0` vaut
    0.4 ; `boss.t1` contient « 0,43 » / "0.43" ; `boss.t2Miss` contient « au
    lieu de 0,43. » / "instead of 0.43." ; « 0,60 » / "0.60" dans `boss.t1`,
    `boss.t4Hit`, `boss.t4Miss`, `REFERRAL_INTRO.lead` et
    `endings.cleanMiss.title` ; « 0,40 » / "0.40" dans `REFERRAL_INTRO.lead` ;
  - **C6** : les listes et la nature des cas du §19.9 ;
  - **C13** : la partie copie du §19.7 ;
  - `endings.*.win` et `nextLevel` comme le §19.8 le dit ;
  - `src/content/__tests__/game-hub.test.ts` étendu à `GAME_META.referral` et
    `REFERRAL_INTRO` (§21.3 T1).
- **T2, le téléphone (REF-2)** : `src/lib/game/split-phone.ts`
  (`splitPhoneView`, `sentInYourName`, `CONTACTS`,
  `MESSAGES_PER_CONTACT` ; ce sont les noms du gabarit `<téléphone>-phone.ts` du §21.3 T2, comme `shop-phone.ts` au niveau 2), `src/components/game/SplitPhone.tsx`
  (qui exporte `splitItemKey`, comme `ShopPhone.tsx` exporte `shopItemKey` :
  règle 2 de `game-bundles.test.ts`) et son `.module.css`, `SentPill.tsx` (qui importe `ClickPill.module.css`), le
  jeton `--split-brand` et sa ligne de contraste (§19.7), `REFERRAL_SIDE` dans
  `sides.tsx` (le code du §19.7), les aperçus, l'inscription de `SplitPhone`
  et `SentPill` dans `.design-sync/config.json` (`componentSrcMap`, et
  `SplitPhone` dans `dtsPropsFor`), et `src/__tests__/game-split-phone.test.ts`
  (chaque ligne de la table de la pastille ; `fairbonus` l'emporte sur
  `bonus` ; `chosen` annule la présélection de `contacts` ; `shadow` retire la
  seconde phrase de `nobook` ; la partie téléphone de C13).
- **T3, le branchement (REF-3)** : la table du §21.3 ; le niveau prend sa place
  entre la rétention et le revenue dans `GAME_LEVELS_BY_PILLAR`. L'en-tête de
  `levels/referral.ts` : « in DRAFT (`DraftLevelSlug`): no page, no copy, no
  save yet. » devient « wired on <date> (A24, REF-3): its copy is
  `content/game/referral.ts`, its page `app/[locale]/game/referral/`. ». Et :
  - `e2e/real-results.ts` : `referralClear: { id: "7d3c9e2a-0b1f-4c5d-8e6f-1a2b3c4d5e10", tone: "neutral", locale: "en", answers: answersFor({ acquisition: 1, activation: 0, retention: 1, referral: 2, revenue: 0 }), total: 54 }`
    (le referral seul à 0/20 : un goulot `clear`) ; `e2e/result-real.spec.ts`
    attend `game-entry-cta` vers `/en/game/referral?from=result`, la bande
    `game-entry-band` « Viral coefficient 0.40 », sur une ligne (hauteur ≤ 44 px
    à 1 280 px) ;
  - `e2e/game-helpers.ts` : `REFERRAL_PATH = { en: "/en/game/referral", fr: "/fr/game/referral" }` ;
  - les liens de décembre des niveaux déjà construits, recalculés (§21.3 T3 :
    ouvrir le referral fait viser le referral au décembre de la rétention).
- **T4, les specs (REF-4)** : `e2e/game-referral.spec.ts`, d'après le §19.6 ; le
  coefficient s'affiche au centième, sans unité : jamais « % » ni « pt » sur la
  tuile, la frise, le premier chiffre du bilan, la cellule et la courbe de
  décembre (les lignes d'effet en ont). Et :
  - **le premier écran (fr)** : le coefficient « 0,40 », sous-titre « objectif
    du trimestre : 0,43 » ; utilisateurs « 1 000 000 », patience « 55 »,
    revenu « 0,20 M€ » (en : « €0.20M ») ;
  - **P5 (T1, en français)**, avec la pastille `game-sent` :

    | Coché | Le téléphone affiche | La pastille dit | `data-alert` |
    |---|---|---|---|
    | (rien) | — | « 0 message envoyé au nom de Thomas » | `false` |
    | `contacts` | « 214 contacts sélectionnés » | inchangée | `false` |
    | `contacts` + `chosen` | « 2 contacts choisis · message modifiable » | inchangée | `false` |
    | `fakeinvite` | « Thomas t'attend sur Partix ! 3 de tes amis y sont déjà. » | « 214 messages envoyés au nom de Thomas · des messages qu'il n'a pas écrits » | `true` |

  - **année C (en)** : au T2, `autoinvite` et `fakeinvite` cochés avant de
    lancer, la pastille dit « 856 messages sent in Thomas's name · messages he
    didn't write » ; `game-report-3` contient « inspection by the CNIL » ;
    `game-report-1` ne contient pas « CNIL » ; `game-report-2` contient
    « complaints filed with the CNIL » (les signalements du T2, pas un
    contrôle : ne pas recopier le « jamais DGCCRF » du niveau 2) ; le tampon
    dit « Fined · €75,000 », les départs « 14,318 » ; la fin contient « Here is
    what you did. » et « fine », jamais « settlement » ;
  - **année D (fr)** : au T1, « manqué de 0,03 » ;
  - **décembre** : graduations « 0,2 0,4 0,6 0,8 », repère « objectif 0,60 » ;
  - **le bloc « Niveau suivant »** (C75) : les deux décembres semés du §21.3
    T4, avec les `href` calculés par `nextLevelFor` (le revenue est après le
    referral dans l'ordre du Tour : s'il est ouvert, c'est lui ; sinon on
    boucle sur l'acquisition).
