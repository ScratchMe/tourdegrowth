import { TourLoop } from "tour-de-growth";

/*
 * The loop back to the Tour at the end of the game: one question and the
 * landing's own call to action, so the game hands its reader to the product.
 * `refId` carries the referral when the player arrived from a shared result.
 */

const box = { padding: 24, maxWidth: 720 } as const;

export const Default = () => (
  <div style={box}>
    <TourLoop question="Where does your growth stand?" cta="Start your Tour →" />
  </div>
);

export const French = () => (
  <div style={box}>
    <TourLoop question="Où en est ta croissance ?" cta="Démarre ton Tour →" />
  </div>
);
