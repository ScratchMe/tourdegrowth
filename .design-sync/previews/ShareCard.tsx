import { ShareCard } from "tour-de-growth";
import shareSample from "./share-sample.png";

/*
 * The share block on a result screen — it shows the actual Open Graph image
 * that a shared link will unfurl into, rather than describing it. That image
 * is the product's most-seen surface, so seeing it on the page is the point
 * of the component.
 *
 * Its button is NEVER primary: the image sells the share, and the primary
 * button on that screen belongs to the CTA row above.
 *
 * The PNG below is the real 1200×630 render of /r/sample, inlined by esbuild.
 */

/** As it ships on desktop, under the pillar chips. */
export const Desktop = () => (
  <div style={{ maxWidth: 420 }}>
    <ShareCard
      src={shareSample}
      alt="Tour de Growth — Where does your growth stall? A guided AARRR check-up, 15 questions, 3 minutes."
      caption="What a shared link shows"
      shareLabel="Share this result"
      saveLabel="Save image"
      saveHref={shareSample}
      saveFileName="tour-de-growth.png"
    />
  </div>
);

/** `mobile` tightens the frame from 14px to 12px. */
export const Mobile = () => (
  <div style={{ maxWidth: 320 }}>
    <ShareCard
      size="mobile"
      src={shareSample}
      alt="Tour de Growth — Where does your growth stall? A guided AARRR check-up, 15 questions, 3 minutes."
      caption="What a shared link shows"
      shareLabel="Share this result"
      saveLabel="Save image"
      saveHref={shareSample}
      saveFileName="tour-de-growth.png"
    />
  </div>
);

/** In French — the caption and both labels are already translated by the caller. */
export const French = () => (
  <div style={{ maxWidth: 420 }}>
    <ShareCard
      src={shareSample}
      alt="Tour de Growth — Où ta croissance cale-t-elle ? Un diagnostic AARRR guidé, 15 questions, 3 minutes."
      caption="Ce que montre un lien partagé"
      shareLabel="Partager ce résultat"
      saveLabel="Enregistrer l'image"
      saveHref={shareSample}
      saveFileName="tour-de-growth.png"
    />
  </div>
);

/** Without a caption, for a placement that already has a heading above it. */
export const NoCaption = () => (
  <div style={{ maxWidth: 420 }}>
    <ShareCard
      src={shareSample}
      alt="Tour de Growth — Where does your growth stall?"
      shareLabel="Share this result"
      saveLabel="Save image"
      saveHref={shareSample}
    />
  </div>
);
