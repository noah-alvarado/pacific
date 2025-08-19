import type { IGamePiece, PlayerColor } from "./GameState.js";

interface BaseGameEvent {
  eventType: string;
}

export type MoveType = "move" | "attack";
export interface MoveMadeEvent extends BaseGameEvent {
  eventType: "moveMade";
  piece: IGamePiece;
  moveType: MoveType;
  from: { x: number; y: number };
  to: { x: number; y: number };
}

export interface TurnChangeEvent extends BaseGameEvent {
  eventType: "turnChange";
  from: PlayerColor;
  to: PlayerColor;
}

export interface GameEndEvent extends BaseGameEvent {
  eventType: "gameEnd";
  winner: PlayerColor;
  loser: PlayerColor;
  reason: "no-planes" | "no-moves" | "resignation";
}

export interface NegotiationEvent extends BaseGameEvent {
  eventType: "negotiation";
  draw: number;
}

export type GameEvent =
  | MoveMadeEvent
  | TurnChangeEvent
  | GameEndEvent
  | NegotiationEvent;

export interface GameEvents {
  moveMade: (e: MoveMadeEvent) => void;
  turnChange: (e: TurnChangeEvent) => void;
  gameEnd: (e: GameEndEvent) => void;
  negotiation: (e: NegotiationEvent) => void;
}
