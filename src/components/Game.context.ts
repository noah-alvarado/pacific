import { Accessor, createContext, useContext } from "solid-js";
import { SetStoreFunction } from "solid-js/store";

import { GameConfig } from "../types/GameConfig.js";
import type { MoveMadeEvent } from "../types/GameEvents.js";
import type { IGamePiece, IGameState, PieceId } from "../types/GameState.js";

import type { PieceToDestinationsMap } from "./Game.util.js";

export interface GameContextValue {
  gameConfig: GameConfig;
  game: IGameState;
  setGame: SetStoreFunction<IGameState>; // kept loose so we don't pull in store types here
  pieceToDestinations: Accessor<PieceToDestinationsMap>;
  initialPieces: Record<PieceId, IGamePiece>;
  makeMove: (e: MoveMadeEvent) => void;
}

export const GameContext = createContext<GameContextValue>();

export function useGameContext(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("can't find GameContext");
  return ctx;
}
