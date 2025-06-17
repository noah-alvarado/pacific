/**
 * @file Manages game logic for local (hot-seat) games.
 * This includes turn management and end-of-game detection.
 * It is designed to be used within the `GameLogicProvider` for local games.
 */

import { Accessor, createEffect } from "solid-js";
import {
  GamePhase,
  IDestinationMarker,
  IGameState,
  pieceCanAttack,
  PieceId,
  PlayerColor,
} from "../types/GameState";
import {
  GameEndEvent,
  MoveMadeEvent,
  TurnChangeEvent,
} from "../types/GameEvents";
import emitter from "../emitter";

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
  game: IGameState;
  pieceToDestinations: Accessor<Record<PieceId, IDestinationMarker[]>>;
}) {
  // Effect to manage turn state progression.
  // A turn ends if the last move was not an attack, or if the attacking piece has no more moves.
  createEffect((lastMoveHash?: string) => {
    const moveToHash = (move: MoveMadeEvent) => JSON.stringify(move);
    if (!params.game.lastMove) return lastMoveHash;
    // only run when lastMove changes
    if (moveToHash(params.game.lastMove) === lastMoveHash) return lastMoveHash;

    const lastMoveWasNotAttack = params.game.lastMove.moveType !== "attack";
    const attackingPieceHasNoMoves =
      params.pieceToDestinations()[params.game.lastMove.piece.id].length === 0;
    if (lastMoveWasNotAttack || attackingPieceHasNoMoves) {
      // If the turn should change, emit a 'turnChange' event.
      // This also implicitly checks for victory conditions before changing the turn.
      emitter.emit(
        "turnChange",
        JSON.parse(
          JSON.stringify({
            from: params.game.turn,
            to: params.game.turn === "red" ? "blue" : "red",
          }),
        ) as TurnChangeEvent,
      );
    }

    return moveToHash(params.game.lastMove);
  });

  // Effect to detect the end of the game.
  // This runs whenever the turn changes and checks for win/loss conditions.
  createEffect((turn: PlayerColor | undefined) => {
    // only run when turn changes
    if (params.game.phase === GamePhase.Finished) return turn;
    if (params.game.turn === turn) return turn;

    // Check if the current player has any valid moves or any planes left.
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

    const reason = !numPlanes ? "no-planes" : !hasMove ? "no-moves" : undefined;
    if (!reason) return params.game.turn;

    // If there's a reason for the game to end, emit a 'gameEnd' event.
    const winner = params.game.turn === "red" ? "blue" : "red";
    emitter.emit(
      "gameEnd",
      JSON.parse(
        JSON.stringify({ winner, loser: params.game.turn, reason }),
      ) as GameEndEvent,
    );
    return params.game.turn;
  });
}
