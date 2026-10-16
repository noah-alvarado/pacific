import { Accessor, createContext, Setter, useContext } from "solid-js";
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
  // board rotated 180deg so red sits at the bottom
  flipped: Accessor<boolean>;
  setFlipped: Setter<boolean>;
  undo: () => void;
  canUndo: Accessor<boolean>;
  redo: () => void;
  canRedo: Accessor<boolean>;
}

export const GameContext = createContext<GameContextValue>();

export function useGameContext(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("can't find GameContext");
  return ctx;
}
