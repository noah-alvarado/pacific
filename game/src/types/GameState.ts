import { MoveMadeEvent, MoveType } from "./GameEvents";

export type PlayerColor = "red" | "blue";
export type PieceStatus = "in-play" | "destroyed";
export type PieceType = "ship" | "plane" | "kamikaze";

export enum GamePhase {
  InProgress = "in-progress",
  Finished = "finished",
}

export enum PieceId {
  RedShip1 = "red-ship-1",
  RedPlane1A = "red-plane-1a",
  RedPlane1B = "red-plane-1b",
  RedShip2 = "red-ship-2",
  RedPlane2A = "red-plane-2a",
  RedPlane2B = "red-plane-2b",
  RedShip3 = "red-ship-3",
  RedPlane3A = "red-plane-3a",
  RedPlane3B = "red-plane-3b",
  RedShip4 = "red-ship-4",
  RedPlane4A = "red-plane-4a",
  RedPlane4B = "red-plane-4b",
  BlueShip1 = "blue-ship-1",
  BluePlane1A = "blue-plane-1a",
  BluePlane1B = "blue-plane-1b",
  BlueShip2 = "blue-ship-2",
  BluePlane2A = "blue-plane-2a",
  BluePlane2B = "blue-plane-2b",
  BlueShip3 = "blue-ship-3",
  BluePlane3A = "blue-plane-3a",
  BluePlane3B = "blue-plane-3b",
  BlueShip4 = "blue-ship-4",
  BluePlane4A = "blue-plane-4a",
  BluePlane4B = "blue-plane-4b",
}

export function getShipIdFromPlaneId(pieceId: PieceId): PieceId | null {
  switch (pieceId) {
    case PieceId.RedPlane1A:
    case PieceId.RedPlane1B:
      return PieceId.RedShip1;
    case PieceId.RedPlane2A:
    case PieceId.RedPlane2B:
      return PieceId.RedShip2;
    case PieceId.RedPlane3A:
    case PieceId.RedPlane3B:
      return PieceId.RedShip3;
    case PieceId.RedPlane4A:
    case PieceId.RedPlane4B:
      return PieceId.RedShip4;
    case PieceId.BluePlane1A:
    case PieceId.BluePlane1B:
      return PieceId.BlueShip1;
    case PieceId.BluePlane2A:
    case PieceId.BluePlane2B:
      return PieceId.BlueShip2;
    case PieceId.BluePlane3A:
    case PieceId.BluePlane3B:
      return PieceId.BlueShip3;
    case PieceId.BluePlane4A:
    case PieceId.BluePlane4B:
      return PieceId.BlueShip4;
    default:
      return null;
  }
}

export function getPlaneIdsFromShipId(pieceId: PieceId): PieceId[] {
  switch (pieceId) {
    case PieceId.RedShip1:
      return [PieceId.RedPlane1A, PieceId.RedPlane1B];
    case PieceId.RedShip2:
      return [PieceId.RedPlane2A, PieceId.RedPlane2B];
    case PieceId.RedShip3:
      return [PieceId.RedPlane3A, PieceId.RedPlane3B];
    case PieceId.RedShip4:
      return [PieceId.RedPlane4A, PieceId.RedPlane4B];
    case PieceId.BlueShip1:
      return [PieceId.BluePlane1A, PieceId.BluePlane1B];
    case PieceId.BlueShip2:
      return [PieceId.BluePlane2A, PieceId.BluePlane2B];
    case PieceId.BlueShip3:
      return [PieceId.BluePlane3A, PieceId.BluePlane3B];
    case PieceId.BlueShip4:
      return [PieceId.BluePlane4A, PieceId.BluePlane4B];
    default:
      return [];
  }
}

export function pieceCanAttack(pieceType: PieceType) {
  return pieceType === "kamikaze" || pieceType === "plane";
}

export interface IGamePiece {
  id: PieceId;
  type: PieceType;
  number: number | undefined; // for planes and ships
  owner: PlayerColor;
  status: PieceStatus;
  position: { x: number; y: number };
}

export interface IDestinationMarker {
  moveType: MoveType;
  position: { x: number; y: number };
}

export type GameBoard = (IGamePiece | null)[][];
export interface IGameState {
  lastMove: MoveMadeEvent | undefined;
  selectedPieceId: PieceId | undefined;
  player: PlayerColor | "local"; // The color used by this client
  turn: PlayerColor; // The color of the player whose turn it is
  phase: GamePhase;
  winner: PlayerColor | undefined;
  pieces: Record<PieceId, IGamePiece>;
}
