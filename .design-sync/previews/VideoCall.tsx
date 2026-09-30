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
 * Messages and moods are the ones the island computes for real states
 * (lib/game/__tests__/paths.ts, `bossMessage`, `moodNow`); labels and pace
 * are content/game/retention.ts (`visio`) and lib/game/ui-timing.ts. Every
 * story passes `animateCaption={false}` and `voice={null}`: the caption is
 * printed whole and there is no "Listen" button. The typing, the ring and
 * the running clock are motion — a still shows the first second of a call,
 * so an open call's clock reads 00:00.
 *
 * A page has ONE full frame (its paths carry test ids); this canvas shows
 * several only to put the states side by side.
 */

const LABELS = {
  label: "Video call with the CEO",
  tag: "CEO · Flixo",
  listen: "Listen to the CEO",
  hangUp: "Hang up and choose your projects",
  hungUp: "hung up",
  ended: "ended",
  ringing: "The CEO is calling you",
  pickUp: "Pick up",
  reread: "Reread the CEO's message",
};

const T1 = "Morning. I'll be direct: the board wants churn at 4% by December, and I promised them. By the end of March I want to see 5.6%. Not 5.7. You have two projects this quarter. I don't want to know how. I want the number.";

const PACE = { charsPerTick: 2, tickMs: 28 };
const box = { padding: 20, maxWidth: 560 } as const;

/**
 * Between two quarters: the eyebrow says which quarter is calling, the one
 * action is to pick up. After a first quarter that hit its target, the CEO
 * is calm.
 */
export const Ringing = () => (
  <NightSurface as="div" style={box}>
    <VideoCall
      state="ringing"
      mood="calm"
      message=""
      ringingEyebrow="Quarter 2 · April to June"
      labels={LABELS}
      animateCaption={false}
      typingPace={PACE}
      voice={null}
      voiceWaitMs={500}
    />
  </NightSurface>
);

/**
 * Open, on the year's first call (the CEO is firm): the caption band holds
 * the whole message, and "Hang up and choose your projects" is the primary —
 * the hand of cards waits behind it. The clock chip counts from 00:00; the
 * still shows it at its start.
 */
export const Open = () => (
  <NightSurface as="div" style={box}>
    <VideoCall
      state="open"
      mood="firm"
      message={T1}
      labels={LABELS}
      animateCaption={false}
      typingPace={PACE}
      voice={null}
      voiceWaitMs={500}
    />
  </NightSurface>
);

/**
 * Angry, in French, after two missed quarters — the longest captions (the
 * third call, with the CEO's order), and the mood the brows and mouth say
 * (never the only carrier). Angry types faster (18 ms a tick).
 */
export const OpenAngryFrench = () => (
  <NightSurface as="div" style={box}>
    <VideoCall
      state="open"
      mood="angry"
      message="Deux trimestres ratés. Le board m'a demandé si tu étais la bonne personne. J'ai dit oui. Prouve-le : 4,6 % fin septembre. Et ce trimestre, on résilie par téléphone, du lundi au vendredi, comme le concurrent. Ses chiffres sont insolents. Ce n'est pas une idée, c'est une demande."
      labels={{
        label: "Visio avec le DG",
        tag: "DG · Flixo",
        listen: "Écouter le DG",
        hangUp: "Raccrocher et choisir tes chantiers",
        hungUp: "raccroché",
        ended: "terminé",
        ringing: "Le DG t'appelle",
        pickUp: "Décrocher",
        reread: "Relire le message du DG",
      }}
      animateCaption={false}
      typingPace={{ charsPerTick: 2, tickMs: 18 }}
      voice={null}
      voiceWaitMs={500}
    />
  </NightSurface>
);

/** Hung up: the picture stays, the timer says so in words, and the message can be reread. The cards are live now. */
export const HungUp = () => (
  <NightSurface as="div" style={box}>
    <VideoCall
      state="hungUp"
      mood="firm"
      message={T1}
      labels={LABELS}
      animateCaption={false}
      typingPace={PACE}
      voice={null}
      voiceWaitMs={500}
    />
  </NightSurface>
);

/** Ended: the year cut short, grey, and his last word — the CEO is cold once he has fired you. */
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
      voiceWaitMs={500}
    />
  </NightSurface>
);
