import type {
  GameEndEvent,
  GameEvent,
  MoveMadeEvent,
  MoveType,
  NegotiationEvent,
  ReadyEvent,
  TurnChangeEvent,
} from "./GameEvents.js";
import type {
  IGamePiece,
  PieceStatus,
  PieceType,
  PlayerColor,
} from "./GameState.js";
import { PieceId } from "./GameState.js";

const PIECE_IDS: ReadonlySet<string> = new Set(Object.values(PieceId));
const PIECE_TYPES: ReadonlySet<PieceType> = new Set([
  "ship",
  "plane",
  "kamikaze",
]);
const PIECE_STATUSES: ReadonlySet<PieceStatus> = new Set([
  "in-play",
  "destroyed",
]);
const MOVE_TYPES: ReadonlySet<MoveType> = new Set(["move", "attack"]);
const GAME_END_REASONS: ReadonlySet<GameEndEvent["reason"]> = new Set([
  "no-planes",
  "no-moves",
  "resignation",
]);

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isPlayerColor(v: unknown): v is PlayerColor {
  return v === "red" || v === "blue";
}

function isCoord(v: unknown): v is { x: number; y: number } {
  return (
    isObject(v) &&
    typeof v.x === "number" &&
    Number.isFinite(v.x) &&
    typeof v.y === "number" &&
    Number.isFinite(v.y)
  );
}

function isPieceId(v: unknown): v is PieceId {
  return typeof v === "string" && PIECE_IDS.has(v);
}

function isPiece(v: unknown): v is IGamePiece {
  if (!isObject(v)) return false;
  if (!isPieceId(v.id)) return false;
  if (typeof v.type !== "string" || !PIECE_TYPES.has(v.type as PieceType)) {
    return false;
  }
  if (v.number !== undefined && typeof v.number !== "number") return false;
  if (!isPlayerColor(v.owner)) return false;
  if (
    typeof v.status !== "string" ||
    !PIECE_STATUSES.has(v.status as PieceStatus)
  ) {
    return false;
  }
  if (!isCoord(v.position)) return false;
  return true;
}

function validateMoveMade(data: Record<string, unknown>): MoveMadeEvent | null {
  if (typeof data.moveType !== "string") return null;
  if (!MOVE_TYPES.has(data.moveType as MoveType)) return null;
  if (!isPiece(data.piece)) return null;
  if (!isCoord(data.from) || !isCoord(data.to)) return null;
  return {
    eventType: "moveMade",
    piece: data.piece,
    moveType: data.moveType as MoveType,
    from: data.from,
    to: data.to,
  };
}

function validateTurnChange(
  data: Record<string, unknown>,
): TurnChangeEvent | null {
  if (!isPlayerColor(data.from) || !isPlayerColor(data.to)) return null;
  return { eventType: "turnChange", from: data.from, to: data.to };
}

function validateGameEnd(data: Record<string, unknown>): GameEndEvent | null {
  if (!isPlayerColor(data.winner) || !isPlayerColor(data.loser)) return null;
  if (
    typeof data.reason !== "string" ||
    !GAME_END_REASONS.has(data.reason as GameEndEvent["reason"])
  ) {
    return null;
  }
  return {
    eventType: "gameEnd",
    winner: data.winner,
    loser: data.loser,
    reason: data.reason as GameEndEvent["reason"],
  };
}

function validateNegotiation(
  data: Record<string, unknown>,
): NegotiationEvent | null {
  if (typeof data.draw !== "number" || !Number.isFinite(data.draw)) return null;
  return { eventType: "negotiation", draw: data.draw };
}

function validateReady(): ReadyEvent {
  return { eventType: "ready" };
}

/**
 * Hand-rolled discriminated-union validator for {@link GameEvent}.
 * Returns the typed event when the payload matches the schema, or `null`
 * otherwise. Callers should drop and log invalid payloads rather than crash.
 */
export function validateGameEvent(data: unknown): GameEvent | null {
  if (!isObject(data)) return null;
  switch (data.eventType) {
    case "moveMade":
      return validateMoveMade(data);
    case "turnChange":
      return validateTurnChange(data);
    case "gameEnd":
      return validateGameEnd(data);
    case "negotiation":
      return validateNegotiation(data);
    case "ready":
      return validateReady();
    default:
      return null;
  }
}
