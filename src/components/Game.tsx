import { Emitter } from "nanoevents";
import {
  batch,
  Component,
  createEffect,
  createMemo,
  on,
  untrack,
} from "solid-js";
import { createStore } from "solid-js/store";

import { INITIAL_PIECES, INITIAL_STATE } from "../constants/game.js";
import { useEvent } from "../primitives/useEvent.js";
import { useGameLogic } from "../primitives/useGameLogic.js";
import { useModalContext } from "../providers/Modal.jsx";
import { GameConfig } from "../types/GameConfig.js";
import type {
  GameEndEvent,
  GameEventsHandlers,
  MoveMadeEvent,
  TurnChangeEvent,
} from "../types/GameEvents.js";
import {
  GamePhase,
  getPlaneIdsFromShipId,
  IGameState,
} from "../types/GameState.js";

import { Board } from "./Board.jsx";
import { Controls } from "./Controls.jsx";
import { GameContext } from "./Game.context.js";
import styles from "./Game.module.css";
import {
  getBoardFromPieces,
  getGameSave,
  mapPieceToDestinations,
  saveIdToLocalStorageKey,
} from "./Game.util.js";
import GameOverModal from "./GameOverModal.jsx";

interface GameProps {
  gameConfig: GameConfig; // loosen validation for HMR stability
  emitter: Emitter<GameEventsHandlers>;
}

/**
 * Provides game logic, state management, and event handling for a game instance.
 *
 * This component is the core of the game's client-side logic. It manages the game state,
 * including piece positions, player turn, and game phase. It persists the game state
 * to localStorage, allowing games to be resumed.
 *
 * It calculates valid moves for each piece, handles game events like moves and turn changes,
 * and detects end-of-game conditions.
 *
 * @component
 * @param props
 * @param props.gameConfig - See {@link GameConfig} for all available properties.
 * @param props.emitter - An event emitter for game events.
 *
 * @remarks
 * - Listens for and handles game events to update the state.
 * - Derives the board layout and possible piece destinations from the game state.
 * - Manages turn progression based on move types. A turn ends after a non-attack
 *      move or when an attacking piece has no more moves.
 * - Detects and handles game-over: a player having neither planes nor valid moves.
 * - When playing locally, initializes game state from local storage and automatically saves
 */
export const Game: Component<GameProps> = (props) => {
  const initialPieces = INITIAL_PIECES;
  const initialState = untrack(
    () =>
      (props.gameConfig.gameType === "local"
        ? getGameSave("local")
        : undefined) ??
      INITIAL_STATE({
        pieces: initialPieces,
        player:
          props.gameConfig.gameType !== "local"
            ? props.gameConfig.player
            : "blue",
        turn: props.gameConfig.turn,
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
  if (import.meta.env.DEV || props.gameConfig.gameType === "local") {
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
  }

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
  useGameLogic({
    emitter: props.emitter,
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
  useEvent(props.emitter, "moveMade", (e: MoveMadeEvent) => {
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
  useEvent(props.emitter, "turnChange", (e: TurnChangeEvent) => {
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
  useEvent(props.emitter, "gameEnd", (e: GameEndEvent) => {
    batch(() => {
      setGame("phase", GamePhase.Finished);
      setGame("winner", e.winner);
    });
  });

  function makeMove(e: MoveMadeEvent) {
    props.emitter.emit("moveMade", e);
    if (props.gameConfig.gameType === "online") {
      props.gameConfig.sendGameEvent(e);
    }
  }

  return (
    <GameContext.Provider
      // cast to avoid pulling store types into context file
      value={{
        gameConfig: props.gameConfig,
        game,
        setGame,
        pieceToDestinations,
        initialPieces,
        makeMove,
      }}
    >
      <div class={styles.container}>
        <Controls />
        <Board />
      </div>
    </GameContext.Provider>
  );
};
