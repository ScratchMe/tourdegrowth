import type { AuditProfileModel } from "@/lib/audit/profiles";
import type { GlossaryTermId } from "./glossary-terms";
import type { Pillar } from "@/lib/scoring/pillars";

/**
 * audit-catalog.ts — Tour de Growth
 *
 * Le catalogue de l'instrument d'audit growth (`AUDIT.md`) : les lignes
 * qu'une mission peut renseigner, 19 pour le socle et 20 variantes de
 * profil. Il vient de la « Grille d'audit growth » construite le 2026-09-11
 * et dont Antoine a tranché les dix questions le 2026-09-13 ; le texte des
 * lignes, lui, n'a pas encore été relu ligne à ligne.
 *
 * TODO: à relire — copie neuve (convention 6 de CLAUDE.md). C'est le texte
 * qui sera imprimé dans les livrables d'Antoine, sous son nom.
 *
 * SERVEUR SEULEMENT, comme `glossary-deep.ts` : le Server Component de
 * `/admin/audit` résout ce qu'il faut et le passe en props à l'îlot client.
 * Rien sous `components/` ni aucun `"use client"` ne l'importe
 * (`src/__tests__/audit-boundary.test.ts`).
 *
 * Trois champs n'existaient pas dans la grille et sont des décisions de la
 * phase 0 (AUDIT.md §2) :
 * - `appliesTo` : les profils pour lesquels la ligne compte. C'est LUI le
 *   dénominateur des trois compteurs — une ligne ne sort du dénominateur que
 *   par ce champ, jamais par une saisie. Le socle s'applique partout sauf
 *   trois exceptions argumentées (NRR/GRR et consommation ÷ engagement en
 *   B2B seulement, churn logo et concentration hors B2C qui ont leur propre
 *   forme) ; une variante ne s'applique qu'à son profil.
 * - `betterWhen` : le sens d'un « mieux », pour que le croisement méthode ×
 *   réalité puisse dire « mesuré et bon » sans deviner. `contextual` veut
 *   dire qu'aucun seuil n'a de sens sans le contexte : le readout écrit
 *   alors « mesuré, sans repère » plutôt qu'un verdict.
 * - `tourQuestionId` : la question du Tour qui mesure la même chose, quand
 *   elle existe littéralement (« Connais-tu ton coût d'acquisition ? » pour
 *   le CAC). C'est l'axe « méthode » du croisement ; il n'est posé que là où
 *   la question porte sur le fait de MESURER cette ligne, jamais par
 *   analogie.
 *
 * Le catalogue est versionné (`AUDIT_CATALOG_VERSION`) et chaque fichier de
 * mission en EMBARQUE une copie : deux missions se comparent sur le
 * catalogue qui les a produites, pas sur celui du jour.
 *
 * Le catalogue est en français. Un livrable en anglais (champ
 * `deliverableLocale` de la mission) demandera sa traduction — Phase 2.
 */

/**
 * Les quatre profils de mission vivent dans `lib/audit/profiles.ts`, un
 * module sans aucun import : `validate.ts` a besoin de la LISTE (une valeur),
 * et la lire ici ferait entrer les 39 lignes de prose de ce fichier dans le
 * bundle de tout îlot qui importe `lib/audit`. Réexportés ici pour que le
 * catalogue reste le point d'entrée naturel côté contenu.
 */
export { AUDIT_PROFILE_MODELS } from "@/lib/audit/profiles";
export type { AuditProfileModel } from "@/lib/audit/profiles";

export type AuditPillar = Pillar | "transverse";
/** Coût de collecte : T0 produit par l'audit lui-même, T1 libre-service, T2 une session avec un tiers, T3 file d'analyste, T4 mandat requis. */
export type AuditTier = "T0" | "T1" | "T2" | "T3" | "T4";
export type BetterWhen = "higher" | "lower" | "contextual";
/** Un indice pour l'UI de saisie et le readout, pas une contrainte de validation en phase 0. */
export type ValueShape =
  | "scalar"
  | "couple"
  | "distribution"
  | "matrix"
  | "qualitative"
  | "composite";

export interface AuditCatalogRow {
  id: string;
  pillar: AuditPillar;
  name: string;
  tier: AuditTier;
  cost: string;
  definition: string;
  /** Le piège de mesure le plus courant sur cette ligne. */
  trap?: string;
  /** Où et comment on obtient le chiffre. */
  where?: string;
  /** La décision que ce chiffre ferait bouger — le `decisionAtStake` par défaut d'une entrée. */
  decision?: string;
  /** Ce que dit son absence. */
  absence?: string;
  /** Variantes seulement : pourquoi cette ligne existe pour ce profil. */
  why?: string;
  glossary?: GlossaryTermId;
  tourQuestionId?: string;
  appliesTo: readonly AuditProfileModel[];
  betterWhen: BetterWhen;
  valueShape: ValueShape;
}

/** Date de la dernière modification du catalogue, suffixée d'un compteur. À bouger à CHAQUE changement de ligne. */
export const AUDIT_CATALOG_VERSION = "2026-09-13.1";

export const AUDIT_CATALOG: readonly AuditCatalogRow[] = [
  {
    id: "m01",
    pillar: "revenue",
    name: "MRR / ARR sur base déclarée (et la base elle-même)",
    tier: "T1",
    cost: "T1 — libre-service, ~30 min (un export), plus une question au DAF pour trancher la base",
    definition:
      "Revenu récurrent mensuel du dernier mois clos, sur une base explicitement choisie parmi quatre : signatures (bookings), facturé (billings), revenu reconnu, MRR normalisé. Contrats pluriannuels ramenés au douzième, frais de mise en service exclus, net de remises, à taux de change constant. La base fait partie de la valeur : « 1,2 M€ » sans elle n'est pas une donnée.",
    trap: "Quatre nombres différents que toute la maison appelle « le revenu », avec un écart courant de 15 à 40 % dès qu'il y a de l'annuel prépayé et du setup. C'est le premier endroit où deux interlocuteurs donnent deux valeurs en croyant parler de la même chose. Sous-piège : le contrat annuel comptabilisé au mois de signature plutôt que lissé, qui fabrique un MRR en dents de scie et rend toute série temporelle illisible.",
    where:
      "Export de facturation (Stripe, Chargebee, ERP) tiré soi-même si l'accès existe, sinon une demande au DAF. Demander la même chose au growth et à la finance : l'écart est une donnée, pas une erreur.",
    decision:
      "Quelle base fait référence pour toute la maison. Arbitrage qui se prend en séance en une minute et débloque toutes les autres lignes argent : tant que finance et growth divisent par deux dénominateurs différents, aucun ratio de la grille n'est opposable.",
    absence:
      "Une absence pure est quasi impossible ; ce qui manque, c'est la base. Statut attendu : `contesté` ou `communiqué sans définition`. Quatre interlocuteurs qui donnent quatre nombres veut dire qu'il n'existe pas de définition d'entreprise du revenu — et que l'objectif annuel affiché ailleurs est indexé sur un chiffre que personne ne sait reproduire.",
    glossary: "revenue",
    appliesTo: ["b2b-assiste", "b2b-selfserve", "b2c", "marketplace"],
    betterWhen: "higher",
    valueShape: "scalar",
  },
  {
    id: "m02",
    pillar: "revenue",
    name: "Mouvement de MRR décomposé",
    tier: "T2",
    cost: "T2 — une session avec la facturation ou RevOps, 1-3 h",
    definition:
      "Les cinq flux disjoints du mois qui se somment à la variation : nouveau, expansion, contraction, churn, réactivation. En euros, jamais en logos. Date d'arrêté explicite, distincte de la fin de période — un MRR de septembre tiré le 3 octobre et le même tiré le 28 ne sont pas le même objet.",
    trap: "Le « net new MRR » seul, qui cache lequel des cinq bouge : +40 k€ peut être 40 k€ de nouveau sans aucune perte, ou 120 k€ de nouveau contre 80 k€ qui partent. Second piège : ranger une réduction de volume ou de sièges en churn plutôt qu'en contraction — ça gonfle le churn et efface l'expansion dans le même geste, alors que ce sont deux problèmes aux remèdes opposés.",
    where:
      "Export de facturation ligne à ligne sur 13 mois, recollé par compte. Le rapport existe nativement dans Stripe et Chargebee sous « MRR movements ».",
    decision:
      "Arbitre entre « vendre plus » et « garder mieux », qui est l'allocation budgétaire la plus lourde de l'année. Si la contraction dépasse l'expansion, aucun euro d'acquisition supplémentaire ne rattrape le seau percé.",
    absence:
      "Presque toujours `non calculé` et non `non instrumenté` : la donnée est dans la facturation par construction. Que personne ne l'ait jamais décomposée veut dire que la direction pilote sur un solde, sans pouvoir distinguer un bon mois de vente d'un churn qui a pris du retard. Correctif : une après-midi.",
    glossary: "revenue",
    appliesTo: ["b2b-assiste", "b2b-selfserve", "b2c", "marketplace"],
    betterWhen: "contextual",
    valueShape: "composite",
  },
  {
    id: "m03",
    pillar: "revenue",
    name: "NRR et GRR, toujours en couple",
    tier: "T2",
    cost: "T2 si le rapport existe déjà (board pack), T3 — file d'analyste 2-5 j — sinon ; à lancer le premier jour",
    definition:
      "Sur une cohorte fermée de clients présents en M, leur revenu en M+12 ÷ leur revenu en M. NRR : expansion incluse, sans plafond, peut légitimement dépasser 100 %. GRR : même calcul plafonné client par client au niveau de départ, donc ≤ 100 %. Calcul par client puis agrégation, jamais somme agrégée d'abord. Une seule ligne, deux valeurs — elles ne se demandent jamais séparément, sinon deux définitions divergent entre les deux demandes.",
    trap: "Publier le NRR seul. Un NRR à 110 % avec une GRR à 82 % décrit une entreprise qui perd un client sur cinq et le masque avec l'expansion des survivants. L'écart normal est de 15 à 25 points ; au-delà de 30, il signale une concentration du revenu sur quelques comptes et non une performance. Troisième piège : le revenu variable, qui déplace la GRR de 5 à 8 points à NRR identique quand il pèse un quart de la facture — comparer à un repère externe sans dire la part de variable n'a aucun sens.",
    where:
      "Facturation et finance, deux arrêtés à 12 mois d'écart sur la même cohorte. Demander la SÉRIE sur huit trimestres et pas un point : une agrégation annuelle masque un mauvais trimestre.",
    decision:
      "Financer l'acquisition ou la rétention le prochain trimestre. Une GRR sous 85 % rend la moitié de chaque euro d'acquisition perdue d'avance, et c'est l'argument qui fait réallouer un budget en séance plutôt qu'au trimestre suivant.",
    absence:
      "Rarement absent dans une boîte financée : le statut modal est `communiqué sans définition`. Un NRR existe, il vient du board pack, il est juste, et personne dans l'entreprise ne sait dire s'il inclut les nouveaux clients ni s'il plafonne l'expansion. C'est le constat le plus rentable de la grille — le chiffre est piloté par le conseil et l'équipe qui décide chaque semaine ne peut pas le reconstruire.",
    glossary: "upsell-cross-sell",
    appliesTo: ["b2b-assiste", "b2b-selfserve"],
    betterWhen: "higher",
    valueShape: "couple",
  },
  {
    id: "m04",
    pillar: "retention",
    name: "Churn logo",
    tier: "T1",
    cost: "T1 — libre-service, ~30 min, depuis le même export que la ligne 1",
    definition:
      "Clients perdus sur la période ÷ clients présents en début de période. Unité : le logo, jamais l'euro, jamais l'utilisateur. Base mensuelle, composée en annuel par 1 − (1 − m)¹². Règle écrite sur trois cas limites : le client en préavis, le client migré vers une autre entité, le non-renouvellement tacite.",
    trap: "Le churn mensuel multiplié par douze : 3 %/mois donne 31 %/an et non 36 %. Le dénominateur pris en clients moyens ou en clôture plutôt qu'en ouverture, qui flatte mécaniquement en croissance. Et le churn « non regrettable » (hors ICP) exclu sans que l'exclusion soit écrite — on ne compare alors plus rien à rien.",
    where:
      "Facturation, export des résiliations sur 12 mois glissants. En contrats annuels, le chiffre honnête n'est pas un churn mensuel reconstitué mais le taux de renouvellement de la cohorte échue — c'est la ligne 14, pas celle-ci.",
    decision:
      "Combien de nouveaux clients il faut gagner uniquement pour rester stable. C'est ce chiffre qui transforme un objectif d'acquisition en objectif tenable ou en objectif arithmétiquement impossible, et il se pose sur la table en trente secondes.",
    absence:
      "Rarement absent, souvent non tranché. Quand les trois cas limites n'ont pas de règle écrite, le churn affiché est négociable — et il l'a très probablement déjà été au moins une fois avant un conseil. Statut attendu : `contesté`, avec les deux valeurs conservées.",
    glossary: "churn",
    appliesTo: ["b2b-assiste", "b2b-selfserve", "marketplace"],
    betterWhen: "lower",
    valueShape: "scalar",
  },
  {
    id: "m05",
    pillar: "revenue",
    name: "Concentration du revenu",
    tier: "T1",
    cost: "T1 — libre-service, 5 min, aucune demande supplémentaire",
    definition:
      "Part du MRR portée par les dix plus gros comptes, et part portée par le premier. Même base de calcul et même mois clos que la ligne 1.",
    trap: "Se contenter du ticket moyen, qui écrase la distribution. Un ARPA de 3 k€ peut être 400 clients à 3 k€ ou 380 clients à 1 k€ plus 20 clients à 45 k€ : ces deux entreprises n'ont ni le même risque, ni la même équipe, ni le même plan.",
    where:
      "Le même export de facturation, trié par compte. Cinq minutes une fois l'export en main : la ligne la plus rapide de toute la grille.",
    decision:
      "Qualifie toutes les lignes de rétention : décide si un NRR élevé est une bonne nouvelle ou un risque de dépendance, et si un suivi nominatif des grands comptes est justifié. Sous actionnaire financier ou après une fusion, c'est le risque numéro un et le comité le comprend immédiatement.",
    absence:
      "Jamais vraiment absente — l'export la donne. Que personne ne l'ait regardée veut dire que personne ne sait quel départ ferait mal ; et comme c'est la ligne la moins chère de la grille, son absence mesure l'attention portée au risque, pas la capacité à mesurer.",
    appliesTo: ["b2b-assiste", "b2b-selfserve", "marketplace"],
    betterWhen: "lower",
    valueShape: "couple",
  },
  {
    id: "m06",
    pillar: "revenue",
    name: "ARPA / ACV médian et dispersion",
    tier: "T1",
    cost: "T1 — libre-service, ~15 min, même fichier",
    definition:
      "Revenu moyen par compte (ARPA) ET médian par compte payant sur le mois clos, avec les déciles ; ou la valeur annuelle d'un contrat (ACV, Annual Contract Value) quand l'entreprise pilote en contrats plutôt qu'en mois. Unité déclarée (compte facturé, logo, siège) et identique à celle du dénominateur du CAC.",
    trap: "La moyenne seule sur une distribution presque toujours asymétrique en B2B : elle ne décrit aucun client réel, et toutes les valeurs qui en découlent deviennent des fictions. Second piège : mélanger les cohortes de signature — les clients signés avant le dernier changement de grille tirent la médiane vers le bas, ce qui fait condamner une hausse de prix qui avait pourtant pris.",
    where:
      "Le même export de facturation que les lignes 1, 4 et 5. Le découpage par cohorte de signature est le seul point de friction.",
    decision:
      "Entrée obligatoire du CAC payback calculé au readout. Décide aussi la cible commerciale de l'année : monter l'ARPA et monter le volume ne demandent ni la même équipe ni le même produit.",
    absence:
      "Jamais absent, souvent non segmenté. Qu'on ne puisse pas le sortir par cohorte de signature veut dire que l'entreprise ne sait pas si ses hausses de prix passées ont pris — donc qu'elle ne saura pas davantage pour la prochaine.",
    glossary: "ltv",
    appliesTo: ["b2b-assiste", "b2b-selfserve", "b2c", "marketplace"],
    betterWhen: "contextual",
    valueShape: "distribution",
  },
  {
    id: "m07",
    pillar: "acquisition",
    name: "Dépense ventes & marketing chargée",
    tier: "T4",
    cost: "T4 — mandat requis : une ventilation de masse salariale par fonction ne se demande pas sans sponsor",
    definition:
      "Toutes les dépenses ventes et marketing d'un trimestre : média, outils, agences, contenu, ET la masse salariale chargée des personnes qui vendent et qui font le marketing, variable inclus. Le périmètre inclus et le périmètre exclu sont écrits, pas supposés. La clé de répartition des salaires est une convention explicite : une estimation assumée et datée vaut mieux qu'un zéro implicite.",
    trap: "Le média seul. Le repo chiffre l'écart sur un même trimestre : 18 000 € de média contre 60 000 € chargés, soit 150 € ou 500 € de CAC pour la même entreprise (glossary-deep.ts, entrée `cac`). En vente assistée, le coût est dominé par la masse salariale — un CAC qui l'exclut ne mesure pas ce qu'il prétend mesurer. Piège inverse en amorçage : compter 100 % des salaires alors qu'une partie du temps de ces personnes va au produit.",
    where:
      "Finance uniquement, jamais la régie (qui ne connaît que sa propre ligne). Maille trimestrielle, parce que les factures d'agence arrivent avec un trimestre de retard.",
    decision:
      "C'est le numérateur du CAC : sans elle, aucune décision d'allocation budgétaire n'est défendable en comité, et c'est le budget du trimestre suivant qui en dépend directement.",
    absence:
      "Le refus le plus fréquent de la grille, et il est politique et non technique. Distinguer impérativement `non accessible` (je n'ai pas le mandat — un fait sur MA mission, qui baisse le compteur « documenté » et ne dit rien de l'entreprise) de `non calculé` (personne n'a jamais rapproché la masse salariale du marketing — un vrai constat, et l'un des plus rentables). Les mélanger est la faute qui se retourne en réunion.",
    glossary: "cac",
    appliesTo: ["b2b-assiste", "b2b-selfserve", "b2c", "marketplace"],
    betterWhen: "contextual",
    valueShape: "scalar",
  },
  {
    id: "m08",
    pillar: "revenue",
    name: "Marge brute",
    tier: "T2",
    cost: "T2 si la ligne est déjà publiée, T4 si elle doit être ventilée par ligne de produit",
    definition:
      "(Revenu − coûts directs de service : hébergement, support, exploitation de la plateforme, licences tierces) ÷ revenu. Le détail des postes inclus fait partie de la valeur, pas du commentaire.",
    trap: "Le périmètre des coûts directs varie énormément : le support client dedans ou dehors change la marge de 5 à 15 points en SaaS assisté. Une marge annoncée sans son périmètre n'est comparable ni à un repère public, ni à elle-même l'année précédente.",
    where:
      "Finance. Demander le détail des postes inclus, pas seulement le pourcentage — c'est le détail qui rend la ligne exploitable.",
    decision:
      "Entrée du CAC payback. Toute conclusion d'efficacité d'acquisition calculée sur le chiffre d'affaires au lieu de la marge est optimiste d'exactement le complément de la marge — à 75 % de marge, un payback annoncé à 10 mois en est à 13,3.",
    absence:
      "Quand le growth ne connaît pas la marge brute, il optimise le chiffre d'affaires et pas la valeur : un canal apparemment rentable peut détruire de la marge sans que personne le voie. Si elle n'est pas disponible par ligne de produit, c'est que le coût de service n'est pas réparti — l'entreprise ne sait pas quelle offre est rentable, et c'est un constat qui dépasse largement le growth.",
    glossary: "ltv",
    appliesTo: ["b2b-assiste", "b2b-selfserve", "b2c", "marketplace"],
    betterWhen: "higher",
    valueShape: "scalar",
  },
  {
    id: "m09",
    pillar: "acquisition",
    name: "CAC — trois variantes déclarées, et la convention d'attribution",
    tier: "T2",
    cost: "T2 pour lire les conventions (2 h, seul) ; T4 pour la variante chargée, qui hérite de la dépendance de la ligne 7",
    definition:
      "Trois valeurs dans une seule fiche, jamais un chiffre unique : CAC mixte (dépense chargée ÷ tous les nouveaux clients payants), CAC payant (dépense payante ÷ clients attribués au payant), CAC du canal principal. Chacune porte sa fenêtre, son modèle d'attribution (dernier clic, premier contact, déclaratif, multi-touche) et un décalage égal au cycle de vente médian. La définition du mot « client » (payant, logo, compte facturé) se déclare ici et vaut pour toute la grille.",
    trap: "L'écart documenté entre CAC payant et CAC mixte va jusqu'à un facteur cinq sans qu'aucun des deux ne soit faux — le mixte flatte, le payant dit ce qu'un euro de plus achète. Piège arithmétique en vente assistée : à 90-180 jours de cycle, les clients gagnés ce mois-ci viennent de dépenses d'il y a deux trimestres, donc « dépense du mois ÷ clients du mois » est faux et pas approximatif. Et le modèle d'attribution est rarement unique : la régie applique le sien, le CRM un autre, le formulaire déclaratif un troisième, et personne n'a tranché.",
    where:
      "Composée à la main depuis les lignes 7 et 1. Le modèle d'attribution se CONSTATE en lisant les paramétrages de la régie, du CRM et du formulaire — ça ne se demande pas, ça se regarde, et c'est deux heures très rentables.",
    decision:
      "Où va l'euro marginal de budget. C'est la seule ligne de la grille qui arbitre entre deux canaux, ce qui justifie son coût de collecte.",
    absence:
      "L'absence de convention d'attribution ÉCRITE est un constat plus fort que l'absence de CAC : elle rend irreproductible tout chiffre de CAC par canal, y compris par la personne qui l'a produit, donc elle invalide d'autres lignes. À signaler au readout : le Tour récompense l'inverse — acq-3 donne 7 points à « une estimation grossière » et 0 à « aucune idée » (copy-library.ts:81-88), alors qu'à 90 jours de cycle l'estimation récitée est arithmétiquement fausse et l'aveu est rigoureux. C'est l'écart le plus net entre l'axe pratiques et l'axe chiffres, et il se dit plutôt qu'il se tait.",
    glossary: "cac",
    tourQuestionId: "acq-3",
    appliesTo: ["b2b-assiste", "b2b-selfserve", "b2c", "marketplace"],
    betterWhen: "lower",
    valueShape: "composite",
  },
  {
    id: "m10",
    pillar: "acquisition",
    name: "Mix de sources des nouveaux clients, et concentration du premier canal",
    tier: "T2",
    cost: "T2 — une session avec l'administrateur du CRM, 1-3 h",
    definition:
      "Répartition des clients payants gagnés sur 12 mois par source de premier contact, en part du VOLUME et en part du REVENU, plus la part portée par la première source. Sources mutuellement exclusives, une seule par client, arbitrage écrit en cas de multi-touche. Le taux de remplissage du champ fait partie de la valeur.",
    trap: "Répartir les leads ou le trafic plutôt que les clients payants : le canal qui apporte le plus de volume est rarement celui qui apporte le plus de revenu, et un second canal à 30 % du trafic pour 4 % des clients n'est pas une diversification, c'est un coût. Second piège : additionner des canaux définis à des grains différents (« SEO » face à « LinkedIn Ads » face à « bouche-à-oreille »), ce qui fait varier la part du premier de vingt points selon le regroupement. Troisième : les régies revendiquent chacune le même client, donc un mix dont les parts dépassent 100 % en cumulé n'est pas un mix mais une somme de revendications commerciales.",
    where:
      "CRM, champ source de l'opportunité ; ou le champ déclaratif à la signature. En vente assistée, le déclaratif rempli par le commercial est plus fiable qu'une attribution technique — à condition d'écrire que c'est déclaratif.",
    decision:
      "Deux décisions pour une seule collecte : ouvrir un second canal ou creuser le premier (au-delà d'environ 70 % sur une source, c'est un risque de dépendance à présenter comme tel, pas une réussite d'efficacité), et quel canal est sous-financé au regard de ce qu'il produit en revenu.",
    absence:
      "Un champ source vide à plus de 40 % ne veut pas dire « on ne sait pas » : il veut dire que personne ne s'en sert pour décider, sinon il serait rempli. Le taux de remplissage mesure ici la maturité mieux que la répartition elle-même. Et sans lui aucun CAC par canal n'est calculable : l'absence se propage à la ligne 9.",
    glossary: "acquisition",
    tourQuestionId: "acq-1",
    appliesTo: ["b2b-assiste", "b2b-selfserve", "b2c", "marketplace"],
    betterWhen: "lower",
    valueShape: "distribution",
  },
  {
    id: "m11",
    pillar: "activation",
    name: "Événement de première valeur — nommé ou non",
    tier: "T2",
    cost: "T2 — un entretien de 20 min plus une lecture du schéma d'événements, ~1 h",
    definition:
      "Le seul événement produit dont l'occurrence signe que l'utilisateur ou le compte a vécu la promesse. La valeur de cette ligne n'est PAS un nombre : c'est le nom de l'événement, son unité (utilisateur ou compte), et la date de mise en place de son suivi.",
    trap: "Confondre un événement nommé dans un document produit et un événement réellement émis et requêtable. Confondre l'événement de valeur avec une étape d'inscription (compte créé, profil complété) ou une action fréquente mais creuse (connexion) — le test : si l'action peut être accomplie sans qu'aucun bénéfice n'ait été obtenu, ce n'est pas le bon événement. Et en B2B : activer un utilisateur n'est pas activer un compte.",
    where:
      "Deux sources à croiser obligatoirement — le discours produit (un entretien de vingt minutes avec le PM) et le schéma d'événements réel de l'analytics. L'écart entre les deux EST le constat.",
    decision:
      "Conditionne tout le pilier : sans événement nommé, ni le taux d'activation ni le time-to-value ne sont calculables, donc aucune itération d'onboarding n'est mesurable, donc aucune n'est finançable. Fixe accessoirement la définition d'« utilisateur actif » partout ailleurs dans l'entreprise.",
    absence:
      "L'absence la plus révélatrice de la grille et la moins chère à corriger — nommer l'événement est une décision produit d'une réunion, pas un chantier technique. Deux personnes qui citent deux événements différents : statut `contesté`, les deux réponses se conservent. Aucune réponse du tout : l'entreprise ne sait pas dire ce que son produit est censé faire arriver, son équipe optimise des écrans plutôt que des résultats, et c'est le premier chantier du trimestre.",
    glossary: "aha-moment",
    tourQuestionId: "act-1",
    appliesTo: ["b2b-assiste", "b2b-selfserve", "b2c", "marketplace"],
    betterWhen: "contextual",
    valueShape: "qualitative",
  },
  {
    id: "m12",
    pillar: "activation",
    name: "Taux d'activation",
    tier: "T3",
    cost: "T3 — file d'analyste, 2-5 j ouvrés : à demander le PREMIER jour, avec la définition déjà écrite pour éviter un aller-retour",
    definition:
      "Part d'une cohorte d'entrants (inscrits en self-serve, comptes livrés en assisté) qui atteint l'événement de la ligne 11 dans une fenêtre fixe et déclarée. L'unité, la fenêtre et le dénominateur (tous les entrants, ou les seuls entrants dans la cible) font partie intégrante de la définition et se saisissent avec la valeur.",
    trap: "Trois axes changent le nombre sans que personne ne le dise : l'événement retenu, la longueur de la fenêtre et le dénominateur — un taux passe couramment de 23 % à 45 % en excluant les inscriptions hors cible. Piège de restitution, plus grave : ce taux ne se compare JAMAIS à une autre entreprise, puisque l'événement diffère par construction. Il ne se compare qu'à lui-même dans le temps, et le readout doit l'interdire face à un repère externe.",
    where:
      "Analytics produit (Amplitude, Mixpanel, GA4) ou entrepôt de données. Première ligne de la grille qui exige typiquement une requête d'analyste.",
    decision:
      "Porter l'effort du trimestre sur l'acquisition ou sur l'onboarding. Un taux d'activation bas rend toute dépense d'acquisition supplémentaire destructrice de valeur : on paie pour remplir un seau troué par le haut.",
    absence:
      "Deux états d'ampleur incomparable, à ne jamais fondre dans une même case : `non instrumenté` (aucun événement en place — un trimestre de chantier) et `non calculé` (l'événement existe, personne n'a jamais tiré la cohorte — une après-midi). Les confondre est l'erreur la plus coûteuse du livrable, et un tableur les affiche de façon identique. Quand la distinction n'a pas pu être établie en une question, le statut reste `absent, type non établi` — on ne devine pas.",
    glossary: "activation",
    tourQuestionId: "act-2",
    appliesTo: ["b2b-assiste", "b2b-selfserve", "b2c", "marketplace"],
    betterWhen: "higher",
    valueShape: "scalar",
  },
  {
    id: "m13",
    pillar: "activation",
    name: "Time-to-first-value médian",
    tier: "T3",
    cost: "T3 — file d'analyste, aucune demande supplémentaire si elle part avec la ligne 12",
    definition:
      "Délai médian entre l'entrée (inscription en self-serve, signature ou mise à disposition en assisté) et l'atteinte de l'événement de la ligne 11, sur les seuls entrants qui l'atteignent. Médiane obligatoire. Le point de départ et l'unité de temps (minutes, jours, semaines selon le modèle) sont des champs déclarés, pas des conventions implicites.",
    trap: "La moyenne, tirée par les comptes qui activent six mois plus tard et qui ne décrivent personne. Et le calcul sur tous les entrants en comptant les non-activés comme un délai infini ou nul — ceux-là appartiennent à la ligne 12, pas à celle-ci. Troisième piège : un chiffre sans unité affichée est indéfendable, l'échelle allant de quelques minutes en self-serve à plusieurs semaines en déploiement enterprise.",
    where:
      "Même requête de cohorte que la ligne 12 — à demander dans la même phrase : c'est le même travail pour l'analyste et le même délai.",
    decision:
      "Ce qu'on RETIRE de l'onboarding. C'est la métrique qui se pilote par soustraction : le levier est presque toujours une étape à supprimer, pas un accompagnement à ajouter.",
    absence:
      "Accompagne presque toujours l'absence de la ligne 12, pour la même cause. Quand le taux existe mais pas le délai, c'est que l'analytics mesure des proportions et pas des durées : l'équipe sait combien échouent, jamais où. En enterprise, l'absence de ce chiffre est fréquemment corrélée à un churn de première année que personne n'explique.",
    glossary: "onboarding",
    appliesTo: ["b2b-assiste", "b2b-selfserve", "b2c", "marketplace"],
    betterWhen: "lower",
    valueShape: "scalar",
  },
  {
    id: "m14",
    pillar: "retention",
    name: "Rétention par cohorte — forme déclarée par le profil",
    tier: "T3",
    cost: "T3 en self-serve (2-5 j ouvrés, à lancer le 1er jour) ; T2 en assisté (facturation + CRM, 1-3 h)",
    definition:
      "Se stocke comme une MATRICE cohorte × période, jamais comme un scalaire. Deux formes, choisies par le profil de mission et non par préférence. Self-serve / B2C : part de chaque cohorte d'entrée encore active à J7/J30/J90/M6, avec la règle de comptage déclarée (exactement au jour N / au jour N ou après / par plage), la définition d'« actif » et la base (anniversaire ou calendaire). Vente assistée sur contrats annuels : taux de renouvellement par cohorte d'ÉCHÉANCE, en logos et en revenu, avec l'effectif N de chaque cohorte.",
    trap: "Importer la forme self-serve dans une boîte en contrats annuels : l'objet ne répond à aucune question qu'un comité se pose, il est le plus lent à obtenir de toute la grille, et il revient vide. Dans la forme self-serve, la règle de comptage est un réglage d'écran que l'outil tranche à ta place — « au jour N ou après » est toujours supérieur à « exactement au jour N » sur les mêmes utilisateurs le même jour, et Amplitude comme Mixpanel rapportent le second par défaut. Dans la forme assistée : un taux de renouvellement sur six contrats se présente exactement comme un taux sur deux cents si le N n'est pas affiché à côté.",
    where:
      "Forme self-serve : analytics produit, requête d'analyste — la demande la plus lente de la grille. Forme assistée : facturation et CRM, donc bien moins cher que la forme PLG que tout le monde demande par réflexe.",
    decision:
      "La courbe s'aplatit-elle, et à quel niveau. C'est le seul constat de la grille capable d'arrêter un plan de croissance entier : si elle ne s'aplatit jamais, toute dépense d'acquisition est définitivement perdue. C'est aussi le seul graphique qu'une direction regardera deux fois.",
    absence:
      "Quand elle est impossible à produire, ce n'est pas une case vide, c'est le titre de la présentation. Une entreprise incapable de dire si ses clients reviennent ne peut pas conclure sur sa croissance, et le readout doit l'écrire en ces termes plutôt que de présenter les autres piliers comme si la question ne se posait pas. Nuance à faire apparaître : ret-1 du Tour accepte « on peut le sortir, mais on regarde rarement » à 7 points — quand c'est la réponse, la donnée existe, le statut est `non calculé`, et le correctif tient en une demi-journée.",
    glossary: "retention",
    tourQuestionId: "ret-1",
    appliesTo: ["b2b-assiste", "b2b-selfserve", "b2c", "marketplace"],
    betterWhen: "higher",
    valueShape: "matrix",
  },
  {
    id: "m15",
    pillar: "retention",
    name: "Consommation réelle ÷ engagement contractuel",
    tier: "T2",
    cost: "T2 — 1-3 h ; le seul vrai travail est de recoller l'identifiant de compte entre les deux systèmes",
    definition:
      "Part de ce qui est payé qui est effectivement consommé, sur 30 jours ou sur la période contractuelle, PAR COMPTE, avec la distribution en déciles et pas seulement la moyenne. L'unité est un champ déclaré et suit le modèle de facturation : sièges, sessions, crédits, requêtes API, volume, GMV. « Consommé » se définit par l'événement de la ligne 11, jamais par la connexion.",
    trap: "L'unité codée en dur. « Sièges actifs ÷ sièges vendus » ne parle qu'aux SaaS vendus au siège et devient non applicable dès qu'on facture à l'usage — alors que la donnée existe par construction puisqu'elle sert à facturer. Second piège : la moyenne d'entreprise, qui cache exactement les comptes à 15 % de consommation qui ne renouvelleront pas. Troisième : « actif » défini comme une connexion, ce qui double le chiffre et détruit toute valeur prédictive (un SSO d'entreprise fabrique des connexions sans usage).",
    where:
      "Facturation pour le dénominateur — elle compte déjà, c'est ce qui facture — et analytics ou plateforme pour le numérateur. Ne passe PAS par la finance : c'est une des rares lignes à forte valeur accessible sans mandat.",
    decision:
      "Quels comptes relancer avant leur date de renouvellement, et lesquels sont mûrs pour une expansion — donc où le Customer Success passe son temps le trimestre prochain. C'est le meilleur prédicteur de non-renouvellement disponible et il est actionnable un à trois trimestres avant l'échéance, ce que ni le churn ni le NRR ne savent faire : eux constatent après coup.",
    absence:
      "L'entreprise découvre ses non-renouvellements au moment du renouvellement. Distinguer `non instrumenté` (aucun événement d'usage n'existe) de `non recoupé` (les deux systèmes existent, personne ne les a joints) : le second est de loin le plus fréquent et se corrige en quelques jours. C'est un constat commercial autant qu'analytique, et il se présente à la direction commerciale, pas à la data.",
    appliesTo: ["b2b-assiste", "b2b-selfserve"],
    betterWhen: "higher",
    valueShape: "distribution",
  },
  {
    id: "m16",
    pillar: "retention",
    name: "Cause de churn documentée",
    tier: "T0",
    cost: "T0 — produit par l'audit : ~2 h en relecture de dossiers, ~12 h en entretiens",
    definition:
      "Répartition des départs par motif sur une taxonomie fermée d'une demi-douzaine de causes, adossée à des éléments de première main et non à une intuition, avec le nombre de cas examinés et les verbatims conservés. La valeur est le couple (N examiné, répartition) — un pourcentage sans son N n'est pas une valeur.",
    trap: "Le motif saisi par le commercial au moment de la résiliation, qui dit « prix » dans une majorité de cas parce que c'est la case la plus rapide à cocher. Le prix est ce qu'on dit quand la valeur n'a pas été perçue, et les deux causes appellent des actions opposées. Croiser systématiquement le motif déclaré et le comportement d'usage des 90 jours précédents : l'écart entre les deux est souvent le vrai constat.",
    where:
      "Méthode par défaut, compatible avec un plein temps : relire les quinze derniers dossiers perdus ou résiliés dans le CRM et les enregistrements d'appels associés — deux heures, sans dépendre de personne. Méthode haute, si le mandat et le temps existent : dix à quinze entretiens de clients partis, en passant par le CS.",
    decision:
      "Quel chantier de rétention lancer en premier : produit, onboarding, ciblage commercial ou prix. Sans elle, toute action de rétention est un pari sur une hypothèse non testée, et on améliore le produit là où c'est le plus facile plutôt que là où ça fait partir.",
    absence:
      "Que personne n'ait jamais regardé pourquoi les clients partent est l'indice le plus fiable d'une organisation qui traite le churn comme une fatalité comptable — et ret-3 du Tour accepte « une intuition, non confirmée » à 7 points, donc une équipe peut scorer honorablement en agissant depuis des mois sur une hypothèse jamais testée. C'est aussi la ligne que l'audit peut combler seul : dans une mission où tout le reste est refusé, elle reste, et elle nomme une cause.",
    glossary: "churn",
    tourQuestionId: "ret-3",
    appliesTo: ["b2b-assiste", "b2b-selfserve", "b2c", "marketplace"],
    betterWhen: "contextual",
    valueShape: "qualitative",
  },
  {
    id: "m17",
    pillar: "referral",
    name: "Part des nouveaux clients venus d'une recommandation, et temps de cycle",
    tier: "T2",
    cost: "T2 — 1-3 h par le CRM, ou 20 min si on se contente des dix derniers deals",
    definition:
      "Part des clients payants gagnés sur 12 mois dont le premier contact est un client existant, un partenaire ou une mise en relation identifiée — en volume ET en revenu — plus le délai médian entre l'arrivée d'un client et la première recommandation qu'il produit. Origine déclarative acceptée et signalée comme telle. Auto-parrainages exclus. Les deux nombres se stockent ensemble ou la ligne reste incomplète.",
    trap: "Le coefficient viral à la place, qui n'a de sens qu'avec une boucle intégrée au produit et qui est de toute façon dominé par le temps de cycle (glossary-deep.ts, entrée `viral-coefficient` : K = 0,5 avec un cycle d'un jour dépasse longtemps K = 0,8 avec un cycle de deux mois). Et le piège vécu dans ce repo même : un dénominateur limité aux parrains ayant déjà converti rend le ratio structurellement ≥ 1, donc incapable de délivrer une mauvaise nouvelle (growth-stats.ts:30-42, correctif R2-01). Troisième piège : ne compter que le parrainage outillé et rater le bouche-à-oreille, qui est l'essentiel en vente assistée.",
    where:
      "CRM, champ source filtré sur les valeurs de recommandation. En vente assistée, demander aux commerciaux l'origine de leurs dix derniers deals gagnés donne une réponse plus fiable que l'export, en vingt minutes — ils la connaissent.",
    decision:
      "Financer un programme de recommandation client, un programme partenaires, ou ni l'un ni l'autre — et la décision se prend en part de REVENU, pas en part de volume. Un referral déjà à 20 % du volume sans aucun mécanisme est le meilleur retour sur investissement de la grille ; à 2 % dans un produit sans boucle, ce n'est pas un chantier, c'est une caractéristique du modèle qu'il faut arrêter de vouloir corriger.",
    absence:
      "Attention au faux négatif : en vente assistée, un zéro veut presque toujours dire « personne ne l'a jamais compté », pas « ça n'arrive pas ». Et le pilier Referral du Tour, qui exige un mécanisme intégré au produit (copy-library.ts:178-214, ref-1 à ref-3), donne mécaniquement 0 à 2/20 à tout éditeur vendu en devis — 18 points amputés avant la moindre question de fond. Ce défaut de la grille publique ne doit jamais atterrir tel quel dans un livrable de direction, et le readout le neutralise explicitement (voir readout_spec).",
    glossary: "referral",
    tourQuestionId: "ref-3",
    appliesTo: ["b2b-assiste", "b2b-selfserve", "b2c", "marketplace"],
    betterWhen: "higher",
    valueShape: "couple",
  },
  {
    id: "m18",
    pillar: "transverse",
    name: "Cadence d'apprentissage",
    tier: "T2",
    cost: "T2 — une session avec le produit ou l'équipe d'expérimentation, 1-3 h",
    definition:
      "Quatre nombres sur les deux derniers trimestres : décisions prises sur la base d'un résultat mesuré (un test, une cohorte, une analyse), changements réellement mis en ligne face à de vrais utilisateurs, part de ces changements dont la métrique primaire déclarée était du revenu ou de la rétention, et délai médian entre la formalisation d'une hypothèse et sa mise en ligne. Médianes, jamais moyennes.",
    trap: "Compter les tests conçus, planifiés ou en backlog plutôt que mis en ligne — l'écart est souvent d'un facteur trois, et c'est cet écart, pas le volume, qui est le constat. Second piège : accepter une métrique primaire « proxy » (un clic) comptée comme rattachée au revenu, alors que la corrélation est précisément l'hypothèse que le test devait vérifier. Troisième : mesurer le délai à partir du démarrage du développement plutôt que de la formalisation — le temps d'attente en amont est en général plus long que le temps de construction, et c'est celui qu'on peut réduire sans embaucher.",
    where:
      "Outil d'expérimentation ou de feature flags ; sinon le suivi produit (Jira, Linear) croisé aux dates de mise en ligne.",
    decision:
      "Faut-il réparer la chaîne de décision avant de réparer une métrique. C'est la ligne qui plafonne la valeur de toutes les autres : on ne peut pas agir sur un constat plus vite qu'on ne sait livrer et mesurer, et une cadence d'un à deux changements mesurés par trimestre rend la moitié des recommandations de l'audit inapplicables dans l'année.",
    absence:
      "Sans historique conservé, chaque décision repart de zéro : l'organisation paie le coût d'apprentissage sans jamais en capitaliser le bénéfice — un constat de mémoire organisationnelle, pas de compétence. Chez une entreprise dont le métier EST l'expérimentation, cette ligne passe en tête du readout, avant l'AARRR : c'est le constat le plus gênant, le plus chiffrable sans demander la permission à personne, et le plus réparable dans le trimestre.",
    appliesTo: ["b2b-assiste", "b2b-selfserve", "b2c", "marketplace"],
    betterWhen: "higher",
    valueShape: "composite",
  },
  {
    id: "m19",
    pillar: "transverse",
    name: "Score de pratiques AARRR (le Tour)",
    tier: "T0",
    cost: "T0 — produit par l'audit, ~20 min une fois les entretiens faits",
    definition:
      "Le score déterministe sur 100 des 15 questions du Tour, rempli par l'auditeur au fil des entretiens et jamais envoyé en auto-évaluation — le déclaratif d'une équipe sur ses propres pratiques est un objet différent du constat d'un tiers. Trois questions par pilier, options à 20/7/0, chaque pilier arrondi avant sommation (score.ts:66-86). Le détail par question se conserve avec le score.",
    trap: "Le lire comme une mesure de performance alors qu'il mesure des pratiques déclarées. Deux défauts de comparabilité à connaître et à neutraliser au readout : le pilier Referral donne mécaniquement 0 à 2/20 à tout produit vendu en assisté, et acq-3 récompense davantage un CAC récité qu'un aveu d'incertitude. Et il ne se moyenne JAMAIS avec les compteurs de couverture : ce sont deux axes, pas deux notes.",
    where:
      "Rempli par l'auditeur, gratuitement, à partir de ce que les entretiens ont déjà appris. Aucune demande à personne.",
    decision:
      "Quel pilier ouvre la présentation, et — croisé avec le compteur « documenté » — dans lequel des quatre quadrants chaque étape se range : mesuré et bon, mesuré et mauvais, angle mort, non applicable. C'est ce croisement qui structure tout le readout.",
    absence:
      "Ne peut pas être absent : c'est ton outil. Son intérêt est d'être le seul chiffre comparable d'une mission à l'autre sans rien demander à personne. Un score bas à côté d'une couverture basse et un score bas à côté d'une couverture haute ne disent pas la même chose : le premier est une équipe qui ne fait pas, le second une équipe qui fait sans pouvoir le prouver. Deux plans d'action différents, et « sous 50 » les confond systématiquement.",
    glossary: "aarrr",
    appliesTo: ["b2b-assiste", "b2b-selfserve", "b2c", "marketplace"],
    betterWhen: "higher",
    valueShape: "scalar",
  },
  {
    id: "va-01",
    pillar: "acquisition",
    name: "Couverture de pipeline, rapportée à la tranche d'ACV",
    tier: "T2",
    cost: "T2 — variante de profil : même source que les lignes du socle du même pilier",
    definition:
      "Pipeline ouvert pondéré ÷ objectif de revenu de la période, exprimé en multiple, avec la tranche d'ACV de l'entreprise affichée à côté. Les opportunités sans date de clôture réaliste ou sans mouvement depuis 90 jours sont exclues et le nombre exclu est indiqué.",
    why: "C'est le seul indicateur AVANCÉ de la grille : toutes les autres lignes décrivent le passé, et sur un cycle de 90 à 180 jours elles ne disent rien du trimestre à venir — or c'est la seule chose qu'un comité achète. Le seuil dépend entièrement du ticket (de l'ordre de 3× sous 25 k€ jusqu'à 6× au-delà de 250 k€), donc un même 4× est bon ou alarmant selon la tranche, et le comparer à un seuil unique n'a aucun sens. Il sort du même rapport CRM que le win rate, pour zéro coût marginal.",
    appliesTo: ["b2b-assiste"],
    betterWhen: "contextual",
    valueShape: "scalar",
  },
  {
    id: "va-02",
    pillar: "acquisition",
    name: "Win rate et cycle médian, par segment",
    tier: "T2",
    cost: "T2 — variante de profil : même source que les lignes du socle du même pilier",
    definition:
      "Deals gagnés ÷ deals conclus (gagnés + perdus) sur la même cohorte des 12 derniers mois, découpé par segment ou tranche d'ACV ; et délai médian entre création de l'opportunité et signature. Médiane obligatoire — une affaire à 400 jours déplace la moyenne de plusieurs semaines.",
    why: "Un win rate global sur une base hétérogène ne décrit aucune réalité (l'ordre de grandeur va de 25-35 % en PME à 12-18 % en enterprise) et le cycle médian est ce qui fixe le décalage temporel de TOUS les CAC de la grille — sans lui, la ligne 9 repose sur une hypothèse implicite de cycle court que personne n'a validée. Absorbe au passage le taux MQL→SQL, qui n'est qu'une étape du même entonnoir.",
    appliesTo: ["b2b-assiste"],
    betterWhen: "higher",
    valueShape: "couple",
  },
  {
    id: "va-03",
    pillar: "activation",
    name: "Délai de mise en service et taux de passage en production",
    tier: "T2",
    cost: "T2 — variante de profil : même source que les lignes du socle du même pilier",
    definition:
      "Jours médians entre le début de contrat et le premier résultat concret obtenu par le client (pas la fin du déploiement technique), et part des comptes effectivement passés en production à 90 jours.",
    why: "Les trois lignes d'activation du socle démarrent à l'« entrée » ; dans un modèle déployé par intégration, il n'y a pas d'inscrits, il y a des comptes livrés. C'est exactement là que l'enterprise meurt en silence : un compte jamais passé en production churne au renouvellement sans laisser la moindre trace dans la donnée produit, donc sans jamais apparaître dans un taux d'activation. Décide entre industrialiser l'onboarding client et embaucher du Customer Success.",
    appliesTo: ["b2b-assiste"],
    betterWhen: "contextual",
    valueShape: "couple",
  },
  {
    id: "va-04",
    pillar: "revenue",
    name: "Taux de remise et sa dispersion",
    tier: "T2",
    cost: "T2 — variante de profil : même source que les lignes du socle du même pilier",
    definition:
      "Écart entre prix de grille en vigueur à la signature et prix réellement facturé, sur les deals des 12 derniers mois : moyenne, médiane, et part des deals au-delà de 20 % de remise. Les remises non tarifaires (mois offerts, sièges gratuits, services inclus) sont incluses.",
    why: "Un produit self-serve a un prix public et une remise quasi nulle ; en vente assistée, la remise est la forme dominante et elle n'apparaît jamais dans le champ « discount » du CRM. Décide si la grille tarifaire est réelle ou décorative — donc si un chantier de pricing produira quoi que ce soit : au-delà d'un tiers de deals fortement remisés, retravailler la grille ne changera rien tant que la discipline n'est pas rétablie.",
    appliesTo: ["b2b-assiste"],
    betterWhen: "lower",
    valueShape: "distribution",
  },
  {
    id: "va-05",
    pillar: "retention",
    name: "Couverture et rotation du champion (en agrégat uniquement)",
    tier: "T2",
    cost: "T2 — variante de profil : même source que les lignes du socle du même pilier",
    definition:
      "Part des comptes ayant un champion identifié et toujours en poste, et part des comptes dont le champion a changé sur 12 mois. Se stocke et se restitue en agrégat : jamais une liste nominative dans le livrable.",
    why: "En enterprise, la personne qui renouvelle n'est pas celle qui utilise, et le départ du champion est souvent plus prédictif du churn que l'usage lui-même. Aucune grille d'origine PLG ne porte cette ligne. Elle décide de l'allocation du Customer Success du trimestre, ce que ni le NRR ni le churn logo ne savent faire. C'est la seule ligne de tout l'instrument qui touche des personnes nommées, d'où la règle d'agrégation stricte.",
    appliesTo: ["b2b-assiste"],
    betterWhen: "higher",
    valueShape: "couple",
  },
  {
    id: "va-06",
    pillar: "referral",
    name: "Références activables par verticale",
    tier: "T2",
    cost: "T2 — variante de profil : même source que les lignes du socle du même pilier",
    definition:
      "Nombre de clients ayant donné un accord écrit et daté pour être cités, témoigner ou prendre un appel de référence, ventilé par verticale et par tranche de taille. Test d'activabilité : combien pourraient prendre un appel cette semaine.",
    why: "C'est le substitut légitime du pilier Referral quand aucun mécanisme intégré au produit ne peut exister. Décide si le commerce peut attaquer une nouvelle verticale au prix normal : une verticale sans référence activable se vend avec un cycle sensiblement plus long, ce qui est un coût chiffrable. Compter les logos du site plutôt que les accords datés est le piège — ils incluent des clients partis et des accords de trois ans jamais renouvelés.",
    appliesTo: ["b2b-assiste"],
    betterWhen: "higher",
    valueShape: "distribution",
  },
  {
    id: "vs-01",
    pillar: "acquisition",
    name: "Taux visiteur → inscription",
    tier: "T2",
    cost: "T2 — variante de profil : même source que les lignes du socle du même pilier",
    definition:
      "Inscriptions ÷ visiteurs uniques sur la même période et un périmètre de pages explicitement déclaré (tout le site, le site marketing seul, ou les seules pages d'offre).",
    why: "Le périmètre du dénominateur fait varier le ratio d'un facteur 3 à 5 et les trois versions s'appellent « le taux de conversion du site ». En self-serve, gagner un point ici vaut souvent plus qu'augmenter le budget média du même montant — l'arbitrage se prend sur cette ligne.",
    appliesTo: ["b2b-selfserve"],
    betterWhen: "higher",
    valueShape: "scalar",
  },
  {
    id: "vs-02",
    pillar: "revenue",
    name: "Conversion gratuit ou essai → payant, et son délai",
    tier: "T2",
    cost: "T2 — variante de profil : même source que les lignes du socle du même pilier",
    definition:
      "Part d'une cohorte d'inscrits gratuits qui devient payante, et délai médian entre l'inscription et le premier paiement. Lecture par cohorte d'entrée, jamais en ratio de période.",
    why: "Le ratio de période mélange plusieurs générations et bouge fortement sans que rien n'ait bougé. Et le taux sans le délai ne décide rien : 25 % en trois semaines et 25 % en sept mois n'ont pas le même besoin de trésorerie. C'est la charnière du modèle self-serve, et elle n'existe pas en vente assistée où il n'y a pas de gratuit à convertir.",
    appliesTo: ["b2b-selfserve"],
    betterWhen: "higher",
    valueShape: "couple",
  },
  {
    id: "vs-03",
    pillar: "activation",
    name: "Complétion de l'onboarding, étape par étape",
    tier: "T2",
    cost: "T2 — variante de profil : même source que les lignes du socle du même pilier",
    definition:
      "Part des utilisateurs franchissant chaque étape du parcours, dans l'ordre, sur une cohorte d'inscription donnée, affichée en taux conditionnel ET en taux cumulé.",
    why: "C'est la seule ligne qui désigne directement un écran à retravailler, et elle n'a de sens que là où l'onboarding est un parcours produit plutôt qu'un projet d'intégration. Lire les étapes comme indépendantes est le piège : une étape à 90 % placée après une étape à 30 % ne concerne que 30 % des inscrits.",
    tourQuestionId: "act-3",
    appliesTo: ["b2b-selfserve"],
    betterWhen: "higher",
    valueShape: "distribution",
  },
  {
    id: "vs-04",
    pillar: "activation",
    name: "Activation par canal d'acquisition",
    tier: "T2",
    cost: "T2 — variante de profil : même source que les lignes du socle du même pilier",
    definition:
      "Taux d'activation de la ligne 12 découpé par canal d'origine des inscrits, à fenêtre égale et à ancienneté de cohorte égale.",
    why: "C'est le croisement qui peut inverser complètement le classement des canaux établi au CAC seul : un canal bon marché qui apporte des inscrits qui n'activent jamais coûte plus cher qu'un canal cher. Il exige que la source voyage jusque dans l'analytics produit, ce qui n'est possible que dans un modèle où l'inscription est en ligne — d'où la variante.",
    appliesTo: ["b2b-selfserve"],
    betterWhen: "contextual",
    valueShape: "distribution",
  },
  {
    id: "vs-05",
    pillar: "referral",
    name: "Expansion par invitation intra-compte",
    tier: "T2",
    cost: "T2 — variante de profil : même source que les lignes du socle du même pilier",
    definition:
      "Part des comptes où au moins un utilisateur existant a invité un collègue sur 12 mois, et nombre médian de sièges ajoutés par ce canal rapporté aux sièges vendus initialement.",
    why: "C'est la vraie boucle produit d'un self-serve B2B : elle ne fait pas venir de nouvelles entreprises mais elle fait grandir les comptes sans aucun coût commercial, et elle est directement instrumentable puisque l'invitation est un événement produit. Décide si l'expansion passe par un playbook commercial ou par une fonctionnalité.",
    appliesTo: ["b2b-selfserve"],
    betterWhen: "higher",
    valueShape: "couple",
  },
  {
    id: "vc-01",
    pillar: "referral",
    name: "Coefficient viral K et temps de cycle",
    tier: "T2",
    cost: "T2 — variante de profil : même source que les lignes du socle du même pilier",
    definition:
      "Le couple, jamais K seul : invitations envoyées par utilisateur × taux de conversion des invitations, ET le nombre de jours entre l'arrivée d'un utilisateur et l'arrivée de celui qu'il amène. Dénominateur déclaré (tous les utilisateurs, ou les seuls exposés au mécanisme), auto-parrainages exclus.",
    why: "K n'a de sens qu'avec une vraie boucle intégrée au produit, ce qui est la norme en B2C et l'exception ailleurs. Le contenu est déjà écrit et relu dans le glossaire, y compris la démonstration que le temps de cycle domine la valeur de K. Décide si une stratégie virale est réaliste : sous K = 0,1, le budget doit aller ailleurs.",
    glossary: "viral-coefficient",
    tourQuestionId: "ref-3",
    appliesTo: ["b2c"],
    betterWhen: "higher",
    valueShape: "couple",
  },
  {
    id: "vc-02",
    pillar: "retention",
    name: "Fréquence d'usage rapportée au cycle naturel",
    tier: "T2",
    cost: "T2 — variante de profil : même source que les lignes du socle du même pilier",
    definition:
      "DAU/MAU, ou la fréquence pertinente pour le cycle d'usage réel du produit (hebdomadaire sur mensuel pour un outil hebdomadaire). Le cycle de référence est déclaré avec la valeur.",
    why: "En B2C, l'ancrage dans une routine est le mécanisme de rétention dominant, et c'est ce ratio qui le mesure. Appliqué à un produit dont l'usage naturel n'est pas quotidien, il mesure l'inadéquation de la métrique et pas le produit — d'où l'obligation de déclarer le cycle. Décide entre une stratégie de réengagement et une stratégie de moments déclencheurs.",
    appliesTo: ["b2c"],
    betterWhen: "higher",
    valueShape: "scalar",
  },
  {
    id: "vc-03",
    pillar: "retention",
    name: "Rétention J1 / J7 / J30 par cohorte d'installation",
    tier: "T2",
    cost: "T2 — variante de profil : même source que les lignes du socle du même pilier",
    definition:
      "Part de chaque cohorte d'installation encore active à J1, J7 et J30, avec la règle de comptage déclarée et l'effectif de chaque cohorte.",
    why: "C'est la forme self-serve de la ligne 14, resserrée sur les trois points qui décident en B2C — la chute des premières 24 heures est le signal que les modèles B2B n'ont pas, et J1 est souvent le seul point d'action réel dans un produit grand public.",
    glossary: "retention",
    tourQuestionId: "ret-1",
    appliesTo: ["b2c"],
    betterWhen: "higher",
    valueShape: "matrix",
  },
  {
    id: "vc-04",
    pillar: "revenue",
    name: "Part du revenu portée par le premier centile de dépensiers",
    tier: "T2",
    cost: "T2 — variante de profil : même source que les lignes du socle du même pilier",
    definition:
      "Part du revenu de la période apportée par les 1 % d'utilisateurs les plus dépensiers, et par les 10 %.",
    why: "Le pendant B2C de la concentration du revenu du socle : là où le B2B concentre sur quelques logos, le B2C concentre sur une frange d'utilisateurs, et le chiffre décide si le plan de monétisation vise l'élargissement de la base payante ou l'approfondissement de la frange. Une ARPU moyenne le cache entièrement.",
    appliesTo: ["b2c"],
    betterWhen: "lower",
    valueShape: "couple",
  },
  {
    id: "vm-01",
    pillar: "activation",
    name: "Liquidité — part de l'offre qui trouve preneur",
    tier: "T2",
    cost: "T2 — variante de profil : même source que les lignes du socle du même pilier",
    definition:
      "Part des annonces, créneaux ou lots publiés qui trouvent preneur dans une fenêtre déclarée, par maille pertinente (géographie, catégorie, créneau horaire). La fenêtre et la maille font partie de la définition.",
    why: "C'est l'activation d'une place de marché : la promesse tenue n'est pas qu'un utilisateur s'inscrive, c'est qu'une transaction se noue. Une liquidité moyenne au niveau national masque systématiquement des mailles mortes et des mailles saturées, et c'est la maille qui décide où ouvrir ou fermer.",
    appliesTo: ["marketplace"],
    betterWhen: "higher",
    valueShape: "distribution",
  },
  {
    id: "vm-02",
    pillar: "acquisition",
    name: "Taux de conversion par côté, offre et demande séparés",
    tier: "T2",
    cost: "T2 — variante de profil : même source que les lignes du socle du même pilier",
    definition:
      "Deux taux distincts, jamais agrégés : visiteur → offreur inscrit puis offreur inscrit → première annonce publiée d'un côté ; visiteur → acheteur inscrit puis acheteur inscrit → première transaction de l'autre.",
    why: "Une place de marché a deux entonnoirs qui se conditionnent l'un l'autre, et un taux unique ne décrit ni l'un ni l'autre. Décide de quel côté financer l'acquisition le trimestre suivant — l'erreur la plus coûteuse d'une marketplace étant de financer le côté déjà excédentaire.",
    appliesTo: ["marketplace"],
    betterWhen: "higher",
    valueShape: "composite",
  },
  {
    id: "vm-03",
    pillar: "revenue",
    name: "Take rate effectif contre take rate affiché",
    tier: "T2",
    cost: "T2 — variante de profil : même source que les lignes du socle du même pilier",
    definition:
      "Commission réellement encaissée ÷ GMV de la période, comparée au taux de commission affiché. Les remises, exonérations promotionnelles et transactions hors plateforme identifiées sont incluses dans l'écart.",
    why: "Le socle est écrit en MRR ; une marketplace n'en a pas, son équivalent est le couple GMV × take rate. L'écart entre effectif et affiché est le constat : il chiffre à la fois la pression concurrentielle sur la commission et la désintermédiation, deux risques qu'aucune autre ligne ne voit.",
    appliesTo: ["marketplace"],
    betterWhen: "contextual",
    valueShape: "couple",
  },
  {
    id: "vm-04",
    pillar: "retention",
    name: "Répétition par côté, sur le trimestre suivant",
    tier: "T2",
    cost: "T2 — variante de profil : même source que les lignes du socle du même pilier",
    definition:
      "Part des offreurs actifs au trimestre T encore actifs en T+1, et la même chose côté acheteurs. Deux valeurs, jamais moyennées.",
    why: "Les deux côtés partent pour des raisons opposées — un offreur part faute de demande, un acheteur faute d'offre — et un churn agrégé rend les deux invisibles. C'est la forme marketplace de la ligne 14, et c'est le seul chiffre qui dit lequel des deux côtés est en train de se vider.",
    appliesTo: ["marketplace"],
    betterWhen: "higher",
    valueShape: "couple",
  },
  {
    id: "vm-05",
    pillar: "transverse",
    name: "Équilibre offre / demande par maille",
    tier: "T2",
    cost: "T2 — variante de profil : même source que les lignes du socle du même pilier",
    definition:
      "Rapport entre volume d'offre disponible et volume de demande exprimée, calculé sur la même maille que la liquidité, avec la distribution entre mailles et pas seulement la valeur globale.",
    why: "C'est la variable de commande d'une place de marché : elle décide de l'allocation du budget d'acquisition entre les deux côtés, maille par maille, et c'est la seule ligne qui rend une décision géographique ou catégorielle possible. Un équilibre global sain avec la moitié des mailles déséquilibrées est le cas normal, et l'agrégat le cache.",
    appliesTo: ["marketplace"],
    betterWhen: "contextual",
    valueShape: "distribution",
  },
];
