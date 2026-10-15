import { Emitter } from "nanoevents";
import {
  batch,
  Component,
  createEffect,
  createMemo,
  createSignal,
  on,
  untrack,
} from "solid-js";
import { createStore, reconcile, unwrap } from "solid-js/store";

import {
  BOARD_HEIGHT,
  INITIAL_PIECES,
  INITIAL_STATE,
} from "../constants/game.js";
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
import { PlayerCard } from "./PlayerCard.jsx";

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
 *      Game event handlers are wrapped by the batch() SolidJS utility so that any store updates
 *      calculated are performed as one operation, the full result of processing the move.
 * - Derives the board layout and possible piece destinations from the game state.
 * - Manages turn progression based on move types. A turn ends after a non-attack
 *      move or when an attacking piece has no more moves.
 * - Detects and handles game-over: a player having neither planes nor valid moves.
 * - When playing locally, initializes game state from local storage and automatically saves
 */
export const Game: Component<GameProps> = (props) => {
  const initialPieces = INITIAL_PIECES;
  const initialState = untrack(() => {
    // if a gameSave exists, return that
    let gameSave;
    switch (props.gameConfig.gameType) {
      case "local":
        gameSave = getGameSave("local");
    }
    if (gameSave) return gameSave;

    // build initial state based on config
    return INITIAL_STATE({
      pieces: initialPieces,
      player:
        props.gameConfig.gameType !== "local"
          ? props.gameConfig.player
          : "blue",
      turn: props.gameConfig.turn,
    });
  });
  const [game, setGame] = createStore<IGameState>(initialState);

  const { setModal, closeModal } = useModalContext();

  const [flipped, setFlipped] = createSignal(
    untrack(
      () =>
        props.gameConfig.gameType === "online" &&
        props.gameConfig.player === "red",
    ),
  );

  // snapshots taken before each local move; not persisted across reloads
  const [history, setHistory] = createSignal<IGameState[]>([]);
  const canUndo = () => history().length > 0;

  // a reset clears lastMove, which invalidates earlier snapshots
  createEffect(
    on(
      () => game.lastMove === undefined,
      (cleared) => {
        if (cleared) setHistory([]);
      },
      { defer: true },
    ),
  );

  function undo() {
    const snapshots = history();
    if (snapshots.length === 0) return;
    const previous = snapshots[snapshots.length - 1];
    batch(() => {
      setHistory((h) => h.slice(0, -1));
      closeModal();
      setGame(reconcile(previous));
    });
  }

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
    if (props.gameConfig.gameType === "local") {
      const snapshot = structuredClone(unwrap(game));
      setHistory((h) => [...h, snapshot]);
    }

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

          // when a ship is destroyed, all its planes are also destroyed
          // planes can become kamikazes, which are not destroyed when the ship is destroyed
          if (takenPiece.type === "ship") {
            const planeIds = getPlaneIdsFromShipId(takenPiece.id);
            for (const planeId of planeIds) {
              switch (game.pieces[planeId].type) {
                case "plane":
                  setGame("pieces", planeId, "status", "destroyed");
                  break;
                case "kamikaze":
                  break;
              }
            }
          }
        }
      }

      // execute the move
      setGame("lastMove", e);
      setGame("pieces", e.piece.id, "position", e.to);

      // planes can become kamikazes by reaching the opponent's back row
      if (e.piece.type === "plane") {
        const opposingBackRow = e.piece.owner === "red" ? BOARD_HEIGHT - 1 : 0;
        if (e.to.y === opposingBackRow) {
          setGame("pieces", e.piece.id, "type", "kamikaze");
        }
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
        flipped,
        setFlipped,
        undo,
        canUndo,
      }}
    >
      <div
        class={styles.container}
        data-testid="game"
        data-player={game.player}
        data-turn={game.turn}
        data-phase={game.phase}
        data-winner={game.winner ?? ""}
        data-flipped={flipped()}
      >
        <div class={styles.top}>
          <PlayerCard color={flipped() ? "blue" : "red"} />
        </div>
        <div class={styles.boardArea}>
          <Board />
        </div>
        <div class={styles.bottom}>
          <PlayerCard color={flipped() ? "red" : "blue"} />
          <Controls />
        </div>
      </div>
    </GameContext.Provider>
  );
};
