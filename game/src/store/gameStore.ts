import { GamePhase, newGameState, type IGameState } from "../types/GameState";

import { createStore } from "solid-js/store";

const [game, setGame] = createStore<IGameState>(newGameState({
  phase: GamePhase.InProgress,
}));

export function useGame() {
  return [game, setGame] as const;
}
