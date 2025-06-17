/**
 * @file This file defines the `GameLogicProvider` component, which is the core of the game's
 * client-side logic. It manages the game state, including piece positions, player turn, and game phase.
 * It also handles game events, calculates valid moves, and persists the game state to localStorage.
 */

import {
  Accessor,
  Component,
  ParentProps,
  batch,
  createContext,
  createEffect,
  createMemo,
  untrack,
  useContext,
} from "solid-js";
import type {
  GameEndEvent,
  MoveMadeEvent,
  TurnChangeEvent,
} from "../types/GameEvents";
import {
  GamePhase,
  IDestinationMarker,
  IGamePiece,
  IGameState,
  PieceId,
  PlayerColor,
  getPlaneIdsFromShipId,
} from "../types/GameState";
import {
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  BLUE_STALEMATE_OR_DECISIVE,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  INITIAL_PIECES,
  INITIAL_STATE,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  ONE_MOVE_TO_WIN,
} from "../constants/game";
import { SetStoreFunction, createStore, unwrap } from "solid-js/store";
import { useEvent } from "../emitter";
import { getBoardFromPieces, mapPieceToDestinations } from "./Game.util";
import { detailedDiff } from "deep-object-diff";
import { useLocalGame } from "../primitives/useLocalGame";

const GameContext = createContext<{
  game: IGameState;
  setGame: SetStoreFunction<IGameState>;
  pieceToDestinations: Accessor<
    Record<PieceId, IDestinationMarker[] | undefined>
  >;
  initialPieces: Record<PieceId, IGamePiece>;
}>();

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error(`can't find GameContext`);
  }
  return context;
}

function gameIdToLocalStorageKey(gameId: string) {
  return `savedGameState-${gameId}`;
}

function getGameSave(gameId: string): IGameState | undefined {
  const savedGame = localStorage.getItem(gameIdToLocalStorageKey(gameId));
  return savedGame ? (JSON.parse(savedGame) as IGameState) : undefined;
}

interface GameLogicProviderProps extends ParentProps {
  gameId: string;
  player: PlayerColor | "local";
  turn: PlayerColor;
}

/**
 * Provides game logic, state management, and event handling for a game instance.
 *
 * This provider is the core of the game's client-side logic. It manages the game state,
 * including piece positions, player turn, and game phase. It persists the game state
 * to localStorage, allowing games to be resumed.
 *
 * It calculates valid moves for each piece, handles game events like moves and turn changes,
 * and detects end-of-game conditions.
 *
 * @component
 * @param props.gameId - A unique identifier for the game, or "local" for a hot-seat game.
 * @param props.player - The color of the player using this client, or "local" for a hot-seat game.
 * @param props.turn - The color of the player whose turn it is.
 * @param props.children - The child components that will have access to the game logic context.
 *
 * @remarks
 * - Initializes game state from localStorage if a saved game exists for the given `gameId`,
 *   otherwise it uses the initial default state.
 * - Derives the board layout and possible piece destinations from the game state.
 * - Automatically saves the game state to localStorage on any change.
 * - Manages turn progression based on move types. A turn ends after a non-attack move,
 *   or when an attacking piece has no more available moves.
 * - Detects and handles game-ending conditions, such as a player having no more planes or no valid moves.
 * - Listens for and handles game events to update the state.
 */
export const GameProvider: Component<GameLogicProviderProps> = (props) => {
  const initialPieces = ONE_MOVE_TO_WIN;
  const [game, setGame] = createStore<IGameState>(
    getGameSave(untrack(() => props.gameId)) ??
      INITIAL_STATE({
        pieces: initialPieces,
        player: props.player,
        turn: props.turn,
      }),
  );

  // board is derived from game.pieces
  const board = createMemo(() => getBoardFromPieces(game.pieces));

  // Maps pieces to their possible destinations
  const pieceToDestinations = createMemo(() => {
    const map = mapPieceToDestinations({
      pieces: game.pieces,
      turn: game.turn,
      board: board(),
      lastMove: game.lastMove,
      winner: game.winner,
    });
    return map;
  });

  // For local games, use the useLocalGame hook to manage turns and end-of-game conditions.
  if (props.gameId === "local") {
    useLocalGame({
      game,
      pieceToDestinations,
    });
  }

  // Serialize the game store and save to localStorage on every update
  createEffect(() => {
    if (import.meta.env.DEV) {
      console.log(
        "game state change",
        detailedDiff(
          getGameSave(untrack(() => props.gameId)) ?? {},
          unwrap(game),
        ),
      );
    }
    localStorage.setItem(
      gameIdToLocalStorageKey(untrack(() => props.gameId)),
      JSON.stringify(game),
    );
  });

  createEffect((prev) => {
    const deps = `${game.phase}-${game.winner}`;
    if (prev === deps) return prev;

    if (game.phase === GamePhase.Finished && game.winner) {
      setTimeout(() => {
        window.alert(`Game over! ${game.winner?.toLocaleUpperCase()} wins!`);
      }, 0);
    }

    return deps;
  });

  /* Event Handlers */

  /**
   * Handles the `moveMade` event.
   * Updates piece positions, handles captures of opposing pieces, and promotes planes to kamikazes
   * when they reach the opposite side of the board.
   * @param e - The move made event.
   */
  const handleMoveMade = (e: MoveMadeEvent) => {
    batch(() => {
      // remove jumped pieces
      if (e.moveType === "attack") {
        const isEvenRow = e.from.y % 2 === 0;
        const takenPieceX = isEvenRow
          ? Math.max(e.from.x, e.to.x)
          : Math.min(e.from.x, e.to.x);
        // always 2 odds or 2 evens, so there is an integer average
        const takenPieceY = (e.from.y + e.to.y) / 2;

        const takenPiece = board()[takenPieceX][takenPieceY];
        if (takenPiece) {
          setGame("pieces", takenPiece.id, "status", "destroyed");
          const planeIds = getPlaneIdsFromShipId(takenPiece.id);
          // when a ship is destroyed, all its planes are also destroyed
          for (const planeId of planeIds) {
            // planes become kamikazes, which are not destroyed when the ship is destroyed
            if (game.pieces[planeId].type === "plane") {
              setGame("pieces", planeId, "status", "destroyed");
            }
          }
        }
      }

      // execute the move
      setGame("lastMove", e);
      setGame("pieces", e.piece.id, "position", e.to);
      const opposingBackRow = e.piece.owner === "red" ? 7 : 0;
      if (e.to.y === opposingBackRow && e.piece.type === "plane") {
        setGame("pieces", e.piece.id, "type", "kamikaze");
      }
    });
  };
  useEvent("moveMade", handleMoveMade);

  /**
   * Handles the `turnChange` event.
   * Updates the current turn and clears the selected piece.
   * @param e - The turn change event.
   */
  const handleTurnChange = (e: TurnChangeEvent) => {
    batch(() => {
      setGame("turn", e.to);
      setGame("selectedPieceId", undefined);
    });
  };
  useEvent("turnChange", handleTurnChange);

  /**
   * Handles the `gameEnd` event.
   * Sets the game to a finished state and records the winner.
   * @param e - The game end event.
   */
  const handleGameEnd = (e: GameEndEvent) => {
    batch(() => {
      setGame("phase", GamePhase.Finished);
      setGame("winner", e.winner);
    });
  };
  useEvent("gameEnd", handleGameEnd);

  return (
    <GameContext.Provider
      value={{ game, setGame, pieceToDestinations, initialPieces }}
    >
      {props.children}
    </GameContext.Provider>
  );
};
