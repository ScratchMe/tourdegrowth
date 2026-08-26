# Tour de Growth — Brief Design

**Direction retenue :** B — "Marquage au Sol" (pochoir, pierre chaude, matériau de course cycliste réelle)
**Ce document est distinct de `SPEC.md`** (qui reste la référence produit/technique pour Claude Code). Celui-ci est écrit pour un outil de design (Claude Design) : il fixe les tokens visuels, l'inventaire d'écrans, le texte réel, et les comportements d'interaction.

Aperçu déjà validé avec Antoine : `direction-b-marquage-sol.html` (hero + carte de score). Ce brief formalise et étend cet aperçu à l'ensemble du parcours.

---

## 1. Univers & principe directeur

Le matériau visuel vient de la vraie course, pas d'un imaginaire "growth SaaS" générique : numéros peints au pochoir sur le bitume, dossards de course, lignes pointillées de route, tickets/étiquettes légèrement collés. Le thème "Tour de France" reste **discret** — pas de vélo, pas de maillot jaune affiché, pas de casque. C'est le *matériau* (pochoir, pierre, pointillés, dossard) qui porte la référence, jamais un pictogramme littéral.

**Signature principale (à ne pas diluer) :** le score s'affiche toujours en gros chiffre pochoir (police Stardos Stencil), légèrement texturé comme de la peinture en bombe irrégulière, jamais en jauge circulaire ou barre de progression générique.

**Motif secondaire (discret, en soutien) :** la bordure en pointillés — utilisée pour la barre de progression du questionnaire, les étiquettes de compétence/étape, et les cartes de résultat. Elle relie visuellement tous les composants sans jamais rivaliser avec la signature principale.

## 2. Tokens

**Couleurs**
| Nom | Hex | Usage |
|---|---|---|
| `--stone` | `#E7E1D2` | Fond principal |
| `--stone-2` | `#DED6C2` | Surface secondaire / fond alterné |
| `--ink` | `#211C15` | Texte principal, bordures, le chiffre pochoir |
| `--ink-soft` | `#5B5346` | Texte secondaire, légendes |
| `--red` | `#D2402C` | Accent principal (CTA, mode Roast, points faibles) — jamais en petit texte sur fond clair, réservé aux gros éléments/bordures pour garder le contraste |
| `--red-soft` | `#F3D9D2` | Fond des éléments "point faible" |
| `--paint-white` | `#FBF9F2` | Fond des cartes ("papier/peinture blanche" posée sur la pierre) |

**Typographie (3 rôles, pas plus — la police pochoir perd son impact si elle est partout)**
- **Display / signature :** Stardos Stencil (700) — réservé au H1 de la landing et au chiffre de score. Jamais pour du texte courant.
- **Corps de texte / UI :** Inter (400/500/600) — tout le reste : paragraphes, boutons, navigation.
- **Data / étiquettes :** IBM Plex Mono (500) — scores individuels, tags d'étape, mentions techniques ("Stage 2/5", "№ 15 questions").

**Layout**
- Cartes : fond `--paint-white`, bordure `2px solid var(--ink)`, ombre portée dure sans flou (`7px 7px 0 var(--ink)`) — effet "autocollant/ticket posé sur la table", pas d'ombre douce type Material Design.
- Bordures pointillées (`2px dashed`) pour tout ce qui évoque une séquence/un parcours : barre de progression, tags d'étape.
- Angles légèrement arrondis (4-10px), jamais totalement carrés ni très arrondis — cohérent avec l'esprit "papier/étiquette", pas "app mobile lisse".

**Mouvement (un seul moment orchestré, pas d'animation dispersée)**
- Révélation du score : léger effet de "tampon" — scale-in rapide (~250ms) avec une très légère rotation qui se stabilise, comme un tampon qui vient de frapper le papier. Respecter `prefers-reduced-motion` (dans ce cas, le score apparaît directement, sans animation).
- Barre de progression du questionnaire : chaque étape validée se remplit avec un petit "pulse" bref, pas de transition longue.

## 3. Inventaire des écrans à designer

1. **Landing** (hero) — déjà esquissé dans l'aperçu, à raffiner avec le vrai système de tokens ci-dessus
2. **Questionnaire — une question à la fois**, avec barre de progression en pointillés indiquant l'étape en cours (1 à 5) parmi les 5 piliers AARRR
3. **Sélecteur de ton** (Neutre / Roast) — écran dédié, entre la fin du questionnaire et le calcul du score
4. **État de chargement** — le calcul prend 2-3 secondes ; prévoir des messages qui défilent (voir §4) plutôt qu'un simple spinner, pour la même raison que sur le CV (l'attente sans repère visuel fait perdre confiance)
5. **Page de résultat — mode Neutre**
6. **Page de résultat — mode Roast** (même structure, traitement visuel légèrement différencié — voir §5)
7. **Image de partage (Open Graph)** — le gabarit exact utilisé pour la carte sociale générée dynamiquement ; c'est elle qui fait le travail de conversion sur LinkedIn/X, à soigner en priorité
8. **État d'erreur** — si le calcul échoue (ton de l'interface, pas d'excuse vague ; dire ce qui s'est passé et quoi faire)
9. **Vue mobile** des écrans 1, 5/6 et 7 en priorité (le partage se consomme majoritairement sur mobile)

## 4. Texte réel par écran (à utiliser tel quel ou à adapter, pas de lorem ipsum)

**Landing**
- Bib tag : `№ 15 questions — 3 min — free entry`
- H1 : `Where does your growth stall?`
- Sous-titre : `A guided check-up across Acquisition, Activation, Retention, Referral and Revenue — scored, explained, and built to share.`
- CTA primaire : `Start your Tour →`
- CTA secondaire : `See a sample result`

**Questionnaire (exemple, étape Activation)**
- Repère de progression : `Stage 2 of 5 — Activation`
- Question : `Have you defined a specific "aha" moment for new users?`
- Réponses : `Yes, and we measure it` / `We have one, but don't measure it` / `Not really`

**Sélecteur de ton**
- Titre : `How do you want your results?`
- Option Neutre : `Straight up` — `Clear, constructive, no sugar-coating.`
- Option Roast : `Roast me` — `Same insights, sharper tongue. All in good fun.`
- CTA : `Get my score →`

**Chargement (messages qui défilent, ~1,3s chacun)**
- `Reviewing your answers...`
- `Calculating your stage times...`
- `Drafting your race report...`

**Résultat — mode Neutre**
- Libellé : `Overall Growth Score`
- Section : `Strengths`
- Section : `Where you're losing time` *(notez le clin d'œil course, discret, cohérent avec le thème)*
- CTA : `Share my score` / `Take the Tour again`

**Résultat — mode Roast**
- Badge : `🔥 Roast Mode`
- Exemple de ton (à donner à Claude Design comme référence de calibrage, pas à afficher tel quel) : *"Your retention took one look at your product and rode straight past the finish line."*

**État d'erreur**
- `Your results took a wrong turn.`
- `Something broke on our end — try again in a moment.`
- CTA : `Try again`

## 5. Différenciation visuelle Neutre / Roast

Ne pas construire deux designs séparés — un seul système, un accent qui change :
- **Neutre :** badges/tags en `--ink-soft` sur `--stone`, ton visuel sobre.
- **Roast :** le badge `🔥 Roast Mode` apparaît, les tags de points faibles passent en `--red`/`--red-soft` de façon plus appuyée, éventuellement un léger effet "tag à la bombe" (texte légèrement désaligné/tamponné) sur un ou deux éléments clés — jamais sur tout l'écran à la fois.

## 6. Périmètre appareils

**Mobile d'abord** (375-430px) pour les écrans 1, 5, 6, 7 — c'est là que le partage se consomme réellement. Adapter ensuite vers desktop (jusqu'à ~1040px de contenu, cohérent avec l'aperçu déjà validé). Le questionnaire (écran 2) doit être confortable au pouce (zones de réponse cliquables larges, pas de petits boutons serrés).

## 7. Plancher qualité (non négociable, même pour un side project)

- Focus clavier visible sur tous les éléments interactifs (boutons, options de réponse, toggle de ton).
- Respect de `prefers-reduced-motion` (voir §2).
- Contraste texte vérifié, en particulier le rouge `--red` : réservé aux gros éléments/bordures, jamais en petit texte sur fond clair.
- Les 15 questions et les 2 pages de résultat doivent fonctionner en français ET en anglais (voir `SPEC.md` §5) — prévoir que les libellés en anglais ci-dessus ont un équivalent français à produire, pas seulement une traduction automatique a posteriori.

---

## 8. Prompt de démarrage pour Claude Design

```
Je veux des maquettes pour "Tour de Growth", un outil web qui fait passer un
questionnaire guidé sur les fondamentaux growth (framework AARRR) et génère
un score partageable.

Lis d'abord entièrement ce fichier (DESIGN-BRIEF.md) : il contient la
direction visuelle retenue (tokens de couleur/typo précis), l'inventaire
complet des écrans à produire, le texte réel à utiliser, et les règles de
différenciation entre le mode Neutre et le mode Roast.

Un aperçu de la direction a déjà été validé (direction-b-marquage-sol.html,
joint) — pars de ce système de tokens et de cette ambiance "pochoir sur
pierre chaude", ne repars pas d'une feuille blanche stylistique.

Produis les écrans dans cet ordre de priorité :
1. Landing (déjà esquissée, à raffiner avec le système complet)
2. Page de résultat (mode Neutre) — c'est l'écran le plus vu après la landing
3. Image de partage Open Graph — soigne-la particulièrement, c'est elle qui
   déclenche les nouveaux visiteurs sur les réseaux sociaux
4. Page de résultat (mode Roast)
5. Questionnaire (une question à la fois + barre de progression)
6. Sélecteur de ton, état de chargement, état d'erreur

Contraintes non négociables :
- Le chiffre du score reste toujours en typo pochoir (signature principale) ;
  ne le remplace jamais par une jauge circulaire ou une barre de progression
  générique.
- Une seule bordure/effet signature à la fois par écran — n'accumule pas les
  effets de style (ombre dure + pointillés + texture) sur un même élément
  sans raison.
- Chaque écran doit fonctionner en version mobile (375-430px) avant la
  version desktop, en particulier les écrans 2 et 3.
- Le mode Roast se distingue par un changement d'accent (rouge, badge), pas
  par un système graphique entièrement différent.

Si un élément du brief te semble sous-spécifié pour produire une maquette
juste, dis-le-moi explicitement plutôt que de deviner en silence.
```

---

## Ce qu'il reste à faire avant de lancer Claude Design

- [ ] Joindre `direction-b-marquage-sol.html` en référence dans la session Claude Design
- [ ] Déposer ce fichier sous le nom `DESIGN-BRIEF.md` aux côtés de `SPEC.md`
- [ ] Une fois les maquettes produites, les rapprocher de `SPEC.md` §4 (parcours utilisateur) pour vérifier qu'aucun écran ne manque avant de transmettre à Claude Code
