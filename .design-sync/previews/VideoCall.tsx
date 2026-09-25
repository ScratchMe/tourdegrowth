import { NightSurface, VideoCall } from "tour-de-growth";

/*
 * The call with the CEO, at night. Four states: ringing between two
 * quarters, open while he talks (the cards wait), hung up (the picture stays,
 * his message folds into "Reread"), ended when the year is over.
 *
 * The subtitles live in a band UNDER the picture, never over it: on a 390px
 * phone an overlay cut its own first lines, and the face is never covered.
 * Every word arrives resolved and every number (typing pace, voice) computed:
 * the component imports nothing but types from the game engine.
 *
 * A page has ONE full frame (its paths carry test ids); this canvas shows
 * several only to put the states side by side. Copy: content/game/retention.ts.
 */

const LABELS = {
  label: "Video call with the CEO",
  tag: "CEO · Flixo",
  listen: "Listen to the CEO",
  hangUp: "Leave the call",
  hungUp: "hung up",
  ended: "ended",
  ringing: "The CEO is calling you",
  pickUp: "Pick up",
  reread: "Reread the CEO's message",
};

const T1 =
  "Morning. I'll be direct: the board wants churn at 4% by December, and I promised them. By the end of March I want to see 5.6%. Not 5.7. You have two projects this quarter. I don't want to know how. I want the number.";

const PACE = { charsPerTick: 2, tickMs: 28 };
const box = { padding: 20, maxWidth: 560 } as const;

/** Between two quarters: the eyebrow says which quarter is calling, the one action is to pick up. */
export const Ringing = () => (
  <NightSurface as="div" style={box}>
    <VideoCall
      state="ringing"
      mood="firm"
      message=""
      ringingEyebrow="Quarter 2 · April to June"
      labels={LABELS}
      animateCaption={false}
      typingPace={PACE}
      voice={null}
      voiceWaitMs={1200}
    />
  </NightSurface>
);

/**
 * Open: he talks, the caption band holds the whole message, the clock runs.
 * "Leave the call" is the primary — the hand of cards waits behind it. With
 * `voice={null}` there is no "Listen" button, whatever the browser can do.
 */
export const Open = () => (
  <NightSurface as="div" style={box}>
    <VideoCall
      state="open"
      mood="calm"
      message={T1}
      labels={LABELS}
      animateCaption={false}
      typingPace={PACE}
      voice={null}
      voiceWaitMs={1200}
    />
  </NightSurface>
);

/** Angry, in French — the longest captions, and the mood the brows and mouth say (never the only carrier). */
export const OpenAngryFrench = () => (
  <NightSurface as="div" style={box}>
    <VideoCall
      state="open"
      mood="angry"
      message="Deux trimestres ratés. Le board m'a demandé si tu étais la bonne personne. J'ai dit oui. Prouve-le : 4,6 % fin septembre."
      labels={{
        label: "Visio avec le DG",
        tag: "DG · Flixo",
        listen: "Écouter le DG",
        hangUp: "Quitter la visio",
        hungUp: "raccroché",
        ended: "terminé",
        ringing: "Le DG t'appelle",
        pickUp: "Décrocher",
        reread: "Relire le message du DG",
      }}
      animateCaption={false}
      typingPace={{ charsPerTick: 2, tickMs: 18 }}
      voice={null}
      voiceWaitMs={1200}
    />
  </NightSurface>
);

/** Hung up: the picture stays, the timer says so in words, and the message can be reread. The cards are live now. */
export const HungUp = () => (
  <NightSurface as="div" style={box}>
    <VideoCall
      state="hungUp"
      mood="calm"
      message={T1}
      labels={LABELS}
      animateCaption={false}
      typingPace={PACE}
      voice={null}
      voiceWaitMs={1200}
    />
  </NightSurface>
);

/** Ended: the year is over, grey, and his last word. */
export const Ended = () => (
  <NightSurface as="div" style={box}>
    <VideoCall
      state="ended"
      mood="cold"
      message="We'll stop there. Thanks for everything."
      labels={LABELS}
      animateCaption={false}
      typingPace={PACE}
      voice={null}
      voiceWaitMs={1200}
    />
  </NightSurface>
);
