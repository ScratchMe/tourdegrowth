/**
 * The game's reducer — the only way the island changes a game.
 *
 * Every refusal returns the SAME state object, not a copy: React bails out of
 * a re-render on an identical reference, and a test can tell "refused" from
 * "accepted with no visible change" by identity alone. The rules it refuses
 * are the brief's (§5.2): no choosing while the CEO is talking, never more
 * than two cards, no quarter without exactly two, and nothing but a reset or
 * a restore once the year is over.
 *
 * Relative imports only — see model.ts.
 */
import { fresh, handIds, picksInHand, runQuarter } from "./model";
import type { GameAction, GameState, LevelDefinition } from "./types";

export function gameReducer<Id extends string>(level: LevelDefinition<Id>) {
  return function reduce(state: GameState<Id>, action: GameAction<Id>): GameState<Id> {
    switch (action.type) {
      case "hangup":
        if (state.over || !state.callOpen) return state;
        return { ...state, callOpen: false };

      case "toggle": {
        if (state.over || state.callOpen) return state;
        // A card that is not on the table cannot be picked — the hand is the
        // only menu, whatever an old save or a stale click says.
        if (!handIds(level, state).includes(action.card)) return state;
        if (state.picks.includes(action.card)) {
          return { ...state, picks: state.picks.filter((id) => id !== action.card) };
        }
        if (state.picks.length >= level.constants.picksPerQuarter) return state;
        return { ...state, picks: [...state.picks, action.card] };
      }

      case "run":
        if (state.over || state.callOpen || state.picks.length !== level.constants.picksPerQuarter) return state;
        // `toggle` only ever builds picks from the hand, but a state can
        // arrive without it; without this, `call` in Q1 went into production
        // twice and its trust and radar hits landed twice.
        if (!picksInHand(level, state)) return state;
        return runQuarter(level, state);

      case "reset":
        return fresh(level);

      case "restore":
        // Shape is the storage layer's job (isGameState); this only refuses a
        // save that belongs to another level or another state version.
        if (action.state.level !== level.slug || action.state.v !== 1) return state;
        // The hand is not part of the shape check (it takes the level's
        // rules to deal it). A pick outside it could be neither run nor
        // unpicked — `toggle` refuses it — so it is dropped, not the year.
        if (!picksInHand(level, action.state)) {
          const hand = handIds(level, action.state);
          const picks = action.state.picks.filter((id, i, all) => hand.includes(id) && all.indexOf(id) === i);
          return { ...action.state, picks };
        }
        return action.state;
    }
  };
}
