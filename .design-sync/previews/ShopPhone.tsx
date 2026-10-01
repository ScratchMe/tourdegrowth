import { NightSurface, ShopPhone } from "tour-de-growth";

/*
 * Pédalix's app, drawn as a visitor goes through it — level 2's phone: the
 * search, the product page, the price, the rating, the pressure, the basket.
 * It is someone else's product, so it is white with the --app-* tokens and its
 * own brand green (--shop-brand, 6.47:1 on white), and does not follow the
 * night around it. Same frame as Flixo's phone (`PhoneMock`). The game
 * computes the list of elements (`shopPhoneView` in lib/game/shop-phone.ts);
 * the component only draws them, top to bottom, as text — never a control.
 *
 * Every state below is one the game actually reaches, dumped from
 * `shopPhoneView` for a real path. Copy: content/game/acquisition.ts.
 */

const EN = {
  caption: "The path to purchase as visitors see it",
  appName: "Pédalix",
  time: "21:04",
  video: "My everyday bike",
  videoBy: "@deux_roues_et_moi",
  search: "Results for \"city bike\"",
  resultTop: "Pédalix Ville 7",
  resultSponsored: "Ferlune C3",
  resultMeta: "48 results · sorted by relevance",
  compared: "Compared with 3 sites, delivered prices",
  product: "Pédalix Ville 7",
  productKind: "Electric city bike",
  photos: "12 photos · size, weight, compatibility",
  price: "€1,290",
  priceStruck: "€1,590",
  discount: "−19%",
  priceAllIn: "€1,319 delivered",
  rating: "4.1 ★ · 38 reviews",
  ratingSorted: "4.6 ★ · 29 reviews",
  verified: "24 of them verified (proof of purchase)",
  countdown: "Offer ends in 02:59:41",
  stock: "Only 3 left in stock",
  watchers: "12 people are looking at this bike",
  delivery: "Delivered on Tuesday the 14th · €29",
  guide: "Which frame size is right for you?",
  basketTitle: "Basket",
  basketDelivery: "Delivery €29",
  basketDeliveryIncluded: "Delivery included",
  basketFees: "Service fee €19",
  total: "Total €1,319",
  totalWithFees: "Total €1,338",
  origin: "How did you hear about us? Optional.",
  originAnswers: ["Word of mouth", "Search engine", "Other"],
};

const FR = {
  caption: "Le parcours d'achat tel que les visiteurs le voient",
  appName: "Pédalix",
  time: "21:04",
  video: "Mon vélo de tous les jours",
  videoBy: "@deux_roues_et_moi",
  search: "Résultats pour « vélo de ville »",
  resultTop: "Pédalix Ville 7",
  resultSponsored: "Ferlune C3",
  resultMeta: "48 résultats · triés par pertinence",
  compared: "Comparé à 3 sites, prix livrés",
  product: "Pédalix Ville 7",
  productKind: "Vélo de ville électrique",
  photos: "12 photos · taille, poids, compatibilités",
  price: "1 290 €",
  priceStruck: "1 590 €",
  discount: "−19 %",
  priceAllIn: "1 319 € livré",
  rating: "4,1 ★ · 38 avis",
  ratingSorted: "4,6 ★ · 29 avis",
  verified: "dont 24 vérifiés (achat prouvé)",
  countdown: "Offre valable encore 02:59:41",
  stock: "Plus que 3 en stock",
  watchers: "12 personnes regardent ce vélo",
  delivery: "Livré le mardi 14 · 29 €",
  guide: "Quelle taille de cadre pour vous ?",
  basketTitle: "Panier",
  basketDelivery: "Livraison 29 €",
  basketDeliveryIncluded: "Livraison incluse",
  basketFees: "Frais de service 19 €",
  total: "Total 1 319 €",
  totalWithFees: "Total 1 338 €",
  origin: "Comment nous avez-vous connus ? Facultatif.",
  originAnswers: ["Bouche-à-oreille", "Moteur de recherche", "Autre"],
};

const box = { padding: 20, maxWidth: 380 } as const;

/** The year starts here: the first search result, the product, its price and rating, a basket that adds the delivery. */
export const Start = () => (
  <NightSurface as="div" style={box}>
    <ShopPhone
      labels={EN}
      items={[
        { kind: "appBar" },
        { kind: "results", sponsored: false, compared: false },
        { kind: "product", photos: false },
        { kind: "price", anchor: false, allIn: false },
        { kind: "rating", sorted: false, verified: false },
        { kind: "basket", deliveryIncluded: false, fees: false },
      ]}
    />
  </NightSurface>
);

/**
 * An honest year (path A): results compared on delivered prices, twelve
 * photos, the price shown delivered, the delivery date, a sizing guide, and a
 * basket that adds nothing.
 */
export const Honest = () => (
  <NightSurface as="div" style={box}>
    <ShopPhone
      labels={EN}
      items={[
        { kind: "appBar" },
        { kind: "results", sponsored: false, compared: true },
        { kind: "product", photos: true },
        { kind: "price", anchor: false, allIn: true },
        { kind: "rating", sorted: false, verified: false },
        { kind: "delivery" },
        { kind: "guide" },
        { kind: "basket", deliveryIncluded: true, fees: false },
      ]}
    />
  </NightSurface>
);

/**
 * The dark side at the third-quarter desk (path C): an unlabelled
 * influencer video, a struck "was" price with its discount, the reviews
 * sorted to keep the good ones, a countdown and a stock count, and a service
 * fee that only appears in the basket.
 */
export const Dark = () => (
  <NightSurface as="div" style={box}>
    <ShopPhone
      labels={EN}
      items={[
        { kind: "appBar" },
        { kind: "video" },
        { kind: "results", sponsored: false, compared: false },
        { kind: "product", photos: false },
        { kind: "price", anchor: true, allIn: false },
        { kind: "rating", sorted: true, verified: false },
        { kind: "pressure", line: "countdown" },
        { kind: "pressure", line: "stock" },
        { kind: "basket", deliveryIncluded: false, fees: true },
      ]}
    />
  </NightSurface>
);

/** Every dark card at once, in French — the longest the phone gets: the partner's model takes the top result, unlabelled. */
export const DarkFrench = () => (
  <NightSurface as="div" style={box}>
    <ShopPhone
      labels={FR}
      items={[
        { kind: "appBar" },
        { kind: "video" },
        { kind: "results", sponsored: true, compared: false },
        { kind: "product", photos: false },
        { kind: "price", anchor: true, allIn: false },
        { kind: "rating", sorted: true, verified: false },
        { kind: "pressure", line: "countdown" },
        { kind: "pressure", line: "stock" },
        { kind: "pressure", line: "watchers" },
        { kind: "basket", deliveryIncluded: false, fees: true },
      ]}
    />
  </NightSurface>
);
