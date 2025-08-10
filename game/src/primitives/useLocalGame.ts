/**
 * @file Manages game logic for local (hot-seat) games.
 * This includes turn management and end-of-game detection.
 * It is designed to be used within the `GameLogicProvider` for local games.
 */

import { Accessor, createEffect, on } from "solid-js";
import { Emitter } from "nanoevents";
import {
  GamePhase,
  IDestinationMarker,
  IGameState,
  pieceCanAttack,
  PieceId,
} from "../types/GameState.js";
import { GameEndEvent, GameEvents, TurnChangeEvent } from "../types/GameEvents.js";

/**
 * A SolidJS hook that encapsulates game logic for local (hot-seat) games.
 * It is responsible for automatically managing turn progression and detecting
 * game-ending conditions.
 *
 * @param params - The parameters for the hook.
 * @param params.game - The reactive game state.
 * @param params.pieceToDestinations - An accessor that provides a map of pieces to their possible destinations.
 */
export function useLocalGame(params: {
  emitter: Emitter<GameEvents>;
  game: IGameState;
  pieceToDestinations: Accessor<Record<PieceId, IDestinationMarker[]>>;
}) {
  // Effect to manage turn state progression.
  // A turn ends if the last move was not an attack, or if the attacking piece has no more moves.
  createEffect(
    on(
      () => params.game.lastMove,
      () => {
        if (!params.game.lastMove) return;

        const lastMoveWasNotAttack = params.game.lastMove.moveType !== "attack";
        const attackingPieceHasNoMoves =
          params.pieceToDestinations()[params.game.lastMove.piece.id].length ===
          0;
        if (lastMoveWasNotAttack || attackingPieceHasNoMoves) {
          // If the turn should change, emit a 'turnChange' event.
          // This also implicitly checks for victory conditions before changing the turn.
          params.emitter.emit(
            "turnChange",
            JSON.parse(
              JSON.stringify({
                from: params.game.turn,
                to: params.game.turn === "red" ? "blue" : "red",
              }),
            ) as TurnChangeEvent,
          );
        }
      },
      { defer: true },
    ),
  );

  // Effect to detect the end of the game.
  // This runs whenever the turn changes and checks for win/loss conditions.
  createEffect(
    on(
      () => params.game.turn,
      () => {
        if (params.game.phase === GamePhase.Finished) return;

        const { hasMove, numPlanes } = Object.values(params.game.pieces)
          .filter((piece) => piece.owner === params.game.turn)
          .reduce(
            (acc, piece) => {
              if (pieceCanAttack(piece.type) && piece.status === "in-play") {
                acc.numPlanes++;
              }
              acc.hasMove ||= params.pieceToDestinations()[piece.id].length > 0;
              return acc;
            },
            { hasMove: false, numPlanes: 0 },
          );

        const reason = !numPlanes
          ? "no-planes"
          : !hasMove
            ? "no-moves"
            : undefined;
        if (!reason) return params.game.turn;

        // If there's a reason for the game to end, emit a 'gameEnd' event.
        const winner = params.game.turn === "red" ? "blue" : "red";
        params.emitter.emit(
          "gameEnd",
          JSON.parse(
            JSON.stringify({ winner, loser: params.game.turn, reason }),
          ) as GameEndEvent,
        );
      },
      { defer: true },
    ),
  );
}
