import { Emitter } from "nanoevents";
import { Accessor } from "solid-js";
import { GameEvents } from "../types/GameEvents.js";
import { IGameState } from "../types/GameState.js";
import { PieceToDestinationsMap } from "../providers/Game.util.js";
import { P2PGameConfig } from "../providers/Game.jsx";

/**
 * A SolidJS hook that encapsulates game logic for P2P games via WebRTC.
 * It is responsible for accepting move signals from the other player and
 * updating the game state accordingly. It also signals to the other player
 * when making a move. Turn and game state is negotiated between clients.
 *
 * @param params - The parameters for the hook.
 * @param params.emitter - The event emitter for game events.
 * @param params.game - The reactive game state.
 * @param params.pieceToDestinations - An accessor that provides a map of pieces to their possible destinations.
 */
export function useP2PGame(params: {
  emitter: Emitter<GameEvents>;
  gameConfig: P2PGameConfig;
  game: IGameState;
  pieceToDestinations: Accessor<PieceToDestinationsMap>;
}) {
  // This hook can be used to set up any P2P game-specific logic or state management.
  // Currently, it does not have any specific implementation.
  // You can add functionality here as needed for the P2P game.
}
