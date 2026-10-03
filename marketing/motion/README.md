# marketing/motion/ — les films de Tour de Growth

*Quatre films de motion design, proposés le 2026-10-03 : un pour tout Tour de
Growth, puis un par espace. Ils sont en musique, en 16:9, 4:5 et 9:16, en
français et en anglais, avec leur storyboard. Rien ici ne tourne dans l'app ;
rien ici n'est importé par `src/`. **Statut : proposition.** La direction et
le calendrier attendent Antoine ([`CHANTIERS.md`](../../CHANTIERS.md), C45).
Toute la copie écrite pour les films est « à relire » (convention 6).*

<!-- TODO: à relire (convention 6) : la copie neuve des films (entrées p: 0 de l'objet C, et les libellés écrits en dur listés plus bas). -->

**La page publiée :** https://claude.ai/artifact/MDSptVBYtkDuT8vFPJW49Z (privée,
à partager depuis son menu). Elle joue les quatre films, avec un sélecteur de
format, de langue et de son, et le storyboard de chaque film dessous.
`tour-de-growth-motion.html` en est la source, au caractère près.

## Les quatre films

| Film | Durée | Ce qu'il montre | Quand le diffuser |
|---|---|---|---|
| Le Tour, en entier | 52 s | Le problème (une étape cale, les quatre autres la cachent), puis le road book : plaine, contre-la-montre, montagne. Une étape traverse le film, Retention : le diagnostic la nomme, le moteur la chiffre, le jeu, annoncé comme un jeu, apprend ce qu'il ne faut pas faire puis montre ce qui marche. Dernière ligne : « Maintenant, tu sais quoi faire. C'est parti ! » | À l'ouverture du moteur. Si le jeu ouvre plus tard, sa partie porte « bientôt » |
| Le diagnostic | 29 s | De l'accueil au partage : la vraie question de rétention, le ton, le résultat d'exemple 74/100, l'action, le lien qui lance d'autres Tours | La page d'accueil et les annuaires maintenant : il ne montre que ce qui est ouvert. Les réseaux attendent l'ouverture du moteur, comme tout le lancement (C19, C20) |
| Le moteur | 44 s | Le MRR monte, mais un client coûte 1 900 € et rapporte 1 500 € de marge ; « Freine ici » ; « Et si ? » fait passer le MRR dans 12 mois de 80 212 € à 122 402 € et l'ARR de 963 k€ à 1 469 k€ ; trois slides pour le board ; « 17 chiffres, une demi-journée » | À l'ouverture du moteur, **après A20** : le film montre des choses que le moteur n'affiche pas encore (voir plus bas) |
| Le côté obscur | 42 s | Annoncé comme un jeu dès le premier plan (« un jeu pour apprendre ce qu'il ne faut pas faire »). Le DG de Flixo, deux astuces qui font baisser les résiliations, décembre qui défloute la confiance et le radar, le catalogue. Puis l'année rejouée sans tricher, la confiance qui monte, et la fin sur fond clair : « Maintenant, tu sais quoi faire. À toi de jouer. » | À l'ouverture du jeu |

## Ouvrir, exporter

```sh
npm ci                                                  # Playwright et son Chromium
node marketing/motion/films.mjs page                    # out/films.html, à ouvrir dans un navigateur
node marketing/motion/films.mjs mp4                     # les douze MP4 en français (environ 6 min par format)
node marketing/motion/films.mjs mp4 --fmt v --film engine --lang en
node marketing/motion/films.mjs frames --film engine --fmt v --at 2.6,16.2,24.6
```

`mp4` demande ffmpeg. Il sort en 1920×1080, 1080×1350 et 1080×1920, à 30
images par seconde, en H.264 (CRF 18) avec un son AAC normalisé à −14 LUFS,
le niveau des plateformes. Tout atterrit dans `out/`, que git ignore.

**Les MP4 ne sont pas versionnés.** Les douze pèsent environ 55 Mo, plus que
tout le dépôt (44 Mo). Ils resteraient dans l'historique pour toujours, et
chaque checkout de la CI et de Vercel les téléchargerait. Ils se
reconstruisent depuis la source, en une vingtaine de minutes. Pas à l'octet
près : le son que rend Chromium varie au huitième chiffre d'un lancement à
l'autre, et l'encodeur en fait un écart de la taille de son propre bruit. À
l'œil et à l'oreille, c'est le même film (deux exports du diagnostic, le
2026-10-03 : 46 dB de PSNR au pire, sur les mêmes indices de son). Ceux du
2026-10-03 ont été remis à Antoine dans la session.

Pour republier la page à la même adresse, depuis une session Claude Code :
l'outil Artifact, avec ce fichier et `url` = l'adresse ci-dessus. La page
publiée est le corps du document : le lecteur ajoute `<!doctype>` et `<head>`
autour, comme le fait `films.mjs page`.

## Comment la page est faite

- **Une seule horloge.** Chaque élément est animé en CSS (`animation-delay` =
  sa place dans le film). Au chargement, toutes les animations sont mises en
  pause (`getAnimations()`), puis chaque image règle leur `currentTime`. Les
  compteurs et les sous-titres qui s'écrivent lisent la même horloge. C'est
  ce qui permet d'avancer, de reculer, et d'exporter image par image.
- **Un décalage global, `TS`.** Pour insérer une scène au milieu d'un film
  sans retaper les temps qui la suivent : tant que `TS` vaut 3,2, un élément
  écrit à 10 s part à 13,2 s. `an()`, `cue()`, les compteurs, les sous-titres,
  l'horloge de la visio et le point du road book le lisent. Chaque film
  repart de `TS = 0`. Le film du jeu s'en sert pour son annonce (3,2 s), le
  film d'ensemble pour celle du jeu (2 s) et pour la bascule positive (2,4 s).
- **Trois formats, une timeline.** La scène fait 1280×720, 960×1200 ou
  720×1280. Chaque bloc est placé par format (`pick({ h, s, v })`, `P()`,
  `blk()`), et son contenu garde ses propres coordonnées. Le minutage est le
  même dans les trois formats. **La clé `s` désigne le 4:5 depuis le
  2026-10-03** ; c'était le 1:1, et Antoine a retenu le 4:5, qui prend plus
  de hauteur dans un fil sur téléphone. Ses positions sont celles du carré,
  étirées verticalement de 1,25, puis retouchées scène par scène.
- **Le son est synthétisé par le code.** Aucun échantillon, aucune piste de
  banque : libre de droits par construction.
  - Chaque film a ses sections de musique (`music`, à 120 bpm, en la mineur).
  - Les bruitages viennent des animations elles-mêmes (`CUE_OF` : un tampon à
    l'écran, c'est un tampon à l'oreille) et de quelques repères posés à la
    main (`cue()`).
  - Le rendu se fait hors ligne, par tranches de 3 s, plus une passe pour les
    bourdons, puis une compression sur le mélange. En une seule passe, il
    prenait 15 s ; par tranches, environ 1,5 s.
  - La page lance l'image tout de suite et la musique la rejoint dès qu'elle
    est prête.
- **Les polices sont embarquées** en base64 (sous-ensemble latin de Stardos
  Stencil, Inter et IBM Plex Mono, licence OFL). Un export ne dépend donc
  jamais du réseau : en session, Google Fonts n'a pas chargé pendant l'un
  des rendus de contrôle.
- **`window.__tdg`** sert à l'enregistrement : choix du film, du format et de
  la langue, une image à un instant donné, le mode export, la bande son en
  WAV.

## Ce qui doit rester vrai

- **La copie du film vit dans l'objet `C`**, une entrée par texte, avec son
  origine dans le champ `p` : 1 = repris mot pour mot du site, 0 = écrit pour
  les films, donc à relire. Le storyboard affiche ces étiquettes (`produit`,
  `neuf · à relire`) pour les textes qu'il cite, pas pour tous. **Le bon à
  tirer se construit donc depuis `C`**, pas depuis le storyboard. S'y
  ajoutent quelques libellés écrits en dur hors de `C`, tous neufs : les axes
  « AUJ. » et « M+12 », les petites lignes sous les chiffres du moteur
  (« cible : 24 % », « 820 / 26 000 »…), « au lieu de », le titre du radar
  de confiance du jeu, « Flixo Premium » et les dossards « ÉTAPE 4 SUR 5 »
  et « ÉTAPE 5 SUR 5 ».
- **« Produit » ne veut pas dire approuvé.** Plusieurs entrées `p: 1`
  reprennent des chaînes encore « à relire » dans `src/` : le bandeau et la
  bande de l'accueil, « Moteur de growth », la copie du moteur (bon à tirer
  nº9) et celle du jeu (nº7). Quand ces bons à tirer changent une chaîne, le
  film se remet d'accord avec elle.
- **Les chiffres du moteur viennent de ses formules** : `scenario.ts#twelveMonths`
  pour le MRR dans 12 mois, `unit-economics.ts` pour le LTV et le payback.
  Ils portent l'étiquette « Chiffres d'exemple » sur les écrans du moteur,
  mais pas encore partout (voir « Ce qui reste à reprendre »). Le SaaS
  d'exemple n'est pas celui d'`example.ts` : ce dernier n'a pas de marge, donc
  ni LTV ni payback.

  | Hypothèse | Valeur |
  |---|---|
  | MRR | 48 000 € |
  | ARPA | 120 € |
  | Marge brute | 75 % |
  | Churn logo, contraction, expansion | 6 %, 1 %, 2 % par mois |
  | Inscrits par mois, conversion en payant | 820, 6 % |
  | CAC | 1 900 € |

  | Résultat | Aujourd'hui | Avec les trois leviers |
  |---|---|---|
  | LTV (plafonnée à 36 mois) | 1 500 € | 2 250 € |
  | LTV:CAC | 0,79 | 1,58 |
  | CAC payback | 21 mois | 16 mois |
  | MRR dans 12 mois | 80 212 € | 122 402 € |
  | ARR (MRR × 12) | 963 k€ | 1 469 k€ |

  Les trois leviers sont : churn de 6 à 4 %, expansion de 2 à 3 %,
  activation de 18 à 24 % (à dépense égale, le CAC tombe à 1 425 €). Pris
  seuls, ils ajoutent 13 344 €, 6 362 € et 18 091 € de MRR dans 12 mois.
  Ensemble, ils ajoutent 42 190 €, soit 4 393 € d'effet composé.
- **Aucun nom, aucun LinkedIn pour l'instant**, comme dans le reste de `marketing/` (C22, une question de calendrier).
- **Le résultat du diagnostic est l'échantillon du site** (74/100, Retention
  à 08/20), étiqueté « Résultat d'exemple ».
- **En 9:16, les textes restent hors des 20 % du bas**, que couvrent les
  légendes et les boutons des applications.

## Ce qui reste à reprendre

- **Le rouge des projections.** Le film du moteur et la partie moteur du film
  d'ensemble colorent en rouge ce que les « Et si » ajoutent (les barres du
  MRR) et l'ARR projeté. Le design system l'interdit : une projection n'est
  jamais rouge, le rouge est réservé à la fuite (audit S-5). Les films se
  remettent d'accord avec le moteur porté à la fin d'A20 (prompt F de
  `CHANTIERS.md`).
- **Ce que le film du moteur montre et que le moteur n'affiche pas encore** :
  l'ARR, la trajectoire du MRR mois par mois, le LTV:CAC dans « Et si », le
  constat « chaque nouveau client coûte plus qu'il ne rapporte ». Tout cela
  est le lot A20, qui ajoute aussi l'alerte de trésorerie quand le CAC
  payback est long.
- **Des chiffres sans leur étiquette.** « Chiffres d'exemple » manque sur la
  partie moteur du film d'ensemble (de 22,3 à 24,9 s, et ses slides), au
  début du film du moteur (0 à 4,2 s) et sur ses slides (30 à 37 s) ;
  « Résultat d'exemple » manque sur la carte de partage du diagnostic. À
  poser avant toute diffusion.
- **Les MP4 en anglais** ne sont pas exportés : `--lang en`.
- **La copie neuve** passe au bon à tirer une fois la direction validée (C45).
