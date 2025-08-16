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
  on,
  untrack,
  useContext,
} from "solid-js";
import type {
  GameEndEvent,
  GameEvents,
  MoveMadeEvent,
  TurnChangeEvent,
} from "../types/GameEvents.js";
import {
  GamePhase,
  IGamePiece,
  IGameState,
  PieceId,
  PlayerColor,
  getPlaneIdsFromShipId,
} from "../types/GameState.js";
import { INITIAL_PIECES, INITIAL_STATE } from "../constants/game.js";
import { SetStoreFunction, createStore } from "solid-js/store";
import { createNanoEvents, Emitter } from "nanoevents";
import { useEvent } from "../primitives/useEvent.js";
import {
  saveIdToLocalStorageKey,
  getBoardFromPieces,
  getGameSave,
  mapPieceToDestinations,
  PieceToDestinationsMap,
} from "./Game.util.js";
import { useLocalGame } from "../primitives/useLocalGame.js";
import { useModalContext } from "./Modal.jsx";
import GameOverModal from "../components/GameOverModal.jsx";
import { useP2PGame } from "../primitives/useP2PGame.js";

const GameContext = createContext<{
  emitter: Emitter<GameEvents>;
  gameConfig: GameConfig;
  game: IGameState;
  setGame: SetStoreFunction<IGameState>;
  pieceToDestinations: Accessor<PieceToDestinationsMap>;
  initialPieces: Record<PieceId, IGamePiece>;
}>();

export function useGameContext() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error(`can't find GameContext`);
  }
  return context;
}

export interface LocalGameConfig {
  gameType: "local";
  player: PlayerColor;
  turn: PlayerColor;
}

export interface P2PGameConfig {
  gameType: "p2p";
  player: PlayerColor;
  turn: PlayerColor;
}

type GameConfig = LocalGameConfig | P2PGameConfig;

interface GameProviderProps extends ParentProps {
  gameConfig: GameConfig;
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
 * @param props
 * @param props.gameConfig - See {@link GameConfig} for all available properties.
 *
 * @remarks
 * - Initializes game state from local storage when playing locally, and automatically saves
 *   the game state to local storage on any change.
 * - Derives the board layout and possible piece destinations from the game state.
 * - Manages turn progression based on move types. A turn ends after a non-attack move and
 *   when an attacking piece has no more moves.
 * - Detects and handles game-ending conditions, such as a player having no more planes or
 *   no valid moves.
 * - Listens for and handles game events to update the state.
 */
export const GameProvider: Component<GameProviderProps> = (props) => {
  const initialPieces = INITIAL_PIECES;
  const initialState = untrack(
    () =>
      (props.gameConfig.gameType === "local"
        ? getGameSave("local")
        : undefined) ??
      INITIAL_STATE({
        pieces: initialPieces,
        player: "blue",
        turn: "blue",
      }),
  );
  const [game, setGame] = createStore<IGameState>(initialState);

  const { setModal } = useModalContext();

  // board is derived from game.pieces
  const board = createMemo(() => getBoardFromPieces(game.pieces));

  // Maps pieces to their possible destinations
  const pieceToDestinations = createMemo(() =>
    mapPieceToDestinations({
      pieces: game.pieces,
      turn: game.turn,
      board: board(),
      lastMove: game.lastMove,
      winner: game.winner,
    }),
  );

  // Serialize the game store and save to localStorage on every update
  createEffect(
    on(
      () => JSON.stringify(game),
      async (g, prev) => {
        if (import.meta.env.DEV) {
          await import("deep-object-diff").then(({ detailedDiff }) => {
            console.log(
              "game state change",
              detailedDiff(
                JSON.parse(prev ?? "{}") as IGameState,
                JSON.parse(g) as IGameState,
              ),
            );
          });
        }

        if (props.gameConfig.gameType === "local") {
          localStorage.setItem(saveIdToLocalStorageKey("local"), g);
        }
      },
      { defer: true },
    ),
  );

  // Show a modal once when the game ends
  createEffect(
    on(
      () => [game.phase, game.winner],
      () => {
        if (game.phase === GamePhase.Finished) {
          setModal(<GameOverModal winner={game.winner} />);
        }
      },
      { defer: true },
    ),
  );

  /* Event Handlers */

  const emitter = createNanoEvents<GameEvents>();
  if (props.gameConfig.gameType === "local")
    useLocalGame({
      emitter,
      gameConfig: props.gameConfig,
      game,
      pieceToDestinations,
    });
  if (props.gameConfig.gameType === "p2p")
    useP2PGame({
      emitter,
      gameConfig: props.gameConfig,
      game,
      pieceToDestinations,
    });

  /**
   * Handles the `moveMade` event.
   * Updates piece positions, handles captures of opposing pieces, and promotes planes to kamikazes
   * when they reach the opposite side of the board.
   * @param e - The move made event.
   */
  useEvent(emitter, "moveMade", (e: MoveMadeEvent) => {
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
  });

  /**
   * Handles the `turnChange` event.
   * Updates the current turn and clears the selected piece.
   * @param e - The turn change event.
   */
  useEvent(emitter, "turnChange", (e: TurnChangeEvent) => {
    batch(() => {
      setGame("turn", e.to);
      setGame("selectedPieceId", undefined);
    });
  });

  /**
   * Handles the `gameEnd` event.
   * Sets the game to a finished state and records the winner.
   * @param e - The game end event.
   */
  useEvent(emitter, "gameEnd", (e: GameEndEvent) => {
    batch(() => {
      setGame("phase", GamePhase.Finished);
      setGame("winner", e.winner);
    });
  });

  return (
    <GameContext.Provider
      value={{
        emitter,
        gameConfig: props.gameConfig,
        game,
        setGame,
        pieceToDestinations,
        initialPieces,
      }}
    >
      {props.children}
    </GameContext.Provider>
  );
};
