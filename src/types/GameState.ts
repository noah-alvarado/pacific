import { MoveMadeEvent, MoveType } from "./GameEvents.js";

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

// Single source of truth for ship -> planes grouping. Each ship owns exactly
// two planes (A and B); the relationship is invariant for the lifetime of the game.
const SHIP_TO_PLANES: ReadonlyMap<PieceId, readonly [PieceId, PieceId]> =
  new Map([
    [PieceId.RedShip1, [PieceId.RedPlane1A, PieceId.RedPlane1B]],
    [PieceId.RedShip2, [PieceId.RedPlane2A, PieceId.RedPlane2B]],
    [PieceId.RedShip3, [PieceId.RedPlane3A, PieceId.RedPlane3B]],
    [PieceId.RedShip4, [PieceId.RedPlane4A, PieceId.RedPlane4B]],
    [PieceId.BlueShip1, [PieceId.BluePlane1A, PieceId.BluePlane1B]],
    [PieceId.BlueShip2, [PieceId.BluePlane2A, PieceId.BluePlane2B]],
    [PieceId.BlueShip3, [PieceId.BluePlane3A, PieceId.BluePlane3B]],
    [PieceId.BlueShip4, [PieceId.BluePlane4A, PieceId.BluePlane4B]],
  ]);

const PLANE_TO_SHIP: ReadonlyMap<PieceId, PieceId> = new Map(
  Array.from(SHIP_TO_PLANES.entries()).flatMap(([shipId, planeIds]) =>
    planeIds.map((planeId) => [planeId, shipId] as const),
  ),
);

export function getShipIdFromPlaneId(pieceId: PieceId): PieceId | null {
  return PLANE_TO_SHIP.get(pieceId) ?? null;
}

export function getPlaneIdsFromShipId(pieceId: PieceId): PieceId[] {
  const planes = SHIP_TO_PLANES.get(pieceId);
  return planes ? [...planes] : [];
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
  player: PlayerColor; // The color used by this client
  turn: PlayerColor; // The color of the player whose turn it is
  phase: GamePhase;
  winner: PlayerColor | undefined;
  pieces: Record<PieceId, IGamePiece>;
}
