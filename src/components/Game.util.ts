/**
 * @file Utility functions for calculating game state transformations.
 * This file includes functions for determining valid piece destinations,
 * mapping all pieces to their possible moves, and deriving the board state from the pieces.
 * These functions are pure and do not have side effects.
 */
import { BOARD_HEIGHT, BOARD_WIDTH } from "../constants/game.js";
import type { MoveMadeEvent } from "../types/GameEvents.js";
import {
  GameBoard,
  GamePhase,
  getShipIdFromPlaneId,
  IDestinationMarker,
  IGamePiece,
  IGameState,
  pieceCanAttack,
  PieceId,
  PlayerColor,
} from "../types/GameState.js";

interface GetDestinationsForPieceParams {
  piece: IGamePiece;
  pieces: Record<PieceId, IGamePiece>;
  turn: PlayerColor;
  board: GameBoard;
  lastMove: MoveMadeEvent | undefined;
  winner: PlayerColor | undefined;
}

export function getDestinationsForPiece({
  piece,
  pieces,
  turn,
  board,
  lastMove,
  winner,
}: GetDestinationsForPieceParams): IDestinationMarker[] {
  let pieceDestinations: IDestinationMarker[] = [];
  if (winner) return pieceDestinations;
  if (piece.status !== "in-play") return pieceDestinations;
  if (piece.owner !== turn) return pieceDestinations;

  const lastMoveWasThisPlayer = lastMove?.piece.owner === turn;
  const lastMoveWasAttack = lastMove?.moveType === "attack";
  const lastMoveWasThisPiece = lastMove?.piece.id === piece.id;
  if (lastMoveWasThisPlayer && lastMoveWasAttack && !lastMoveWasThisPiece) {
    return pieceDestinations;
  }

  const thisPieceIsAttackChaining =
    lastMoveWasThisPlayer && lastMoveWasAttack && lastMoveWasThisPiece;
  if (piece.type === "plane" && !thisPieceIsAttackChaining) {
    const shipId = getShipIdFromPlaneId(piece.id);
    if (!shipId) {
      return pieceDestinations;
    }
    const ship = pieces[shipId];
    const rowsApart = piece.position.y - ship.position.y;
    if (piece.owner === "red" ? rowsApart >= 3 : rowsApart <= -3) {
      return pieceDestinations;
    }
  }

  const isEvenRow = piece.position.y % 2 === 0;
  const xIncrement = isEvenRow ? 1 : -1;
  const curX = piece.position.x;
  const otherX =
    (isEvenRow || curX > 0) &&
    (!isEvenRow || curX < BOARD_WIDTH - 1) &&
    curX + xIncrement;
  const yIncrement = piece.owner === "red" ? 1 : -1;

  function posIsEmpty(x: number, y: number) {
    return board[x][y] === null;
  }
  function posInBounds(x: number, y: number) {
    return x >= 0 && x <= BOARD_WIDTH - 1 && y >= 0 && y <= BOARD_HEIGHT - 1;
  }
  function posIsOpponent(x: number, y: number) {
    const pos = board[x][y];
    return (
      posInBounds(x, y) && !posIsEmpty(x, y) && pos && pos.owner !== piece.owner
    );
  }

  function addDirectionalDestinations({
    x,
    y,
    xInc,
    yInc,
  }: {
    x: number;
    y: number;
    xInc: number;
    yInc: number;
  }) {
    const nextY = y + yInc;
    if (posIsEmpty(x, nextY) && !thisPieceIsAttackChaining) {
      pieceDestinations.push({
        moveType: "move",
        position: { x, y: nextY },
      });
    } else if (pieceCanAttack(piece.type) && posIsOpponent(x, nextY)) {
      const jumpX = x - xInc;
      const jumpY = nextY + yInc;
      if (posInBounds(jumpX, jumpY) && posIsEmpty(jumpX, jumpY)) {
        pieceDestinations.push({
          moveType: "attack",
          position: { x: jumpX, y: jumpY },
        });
      }
    }
  }

  addDirectionalDestinations({
    x: curX,
    y: piece.position.y,
    xInc: xIncrement,
    yInc: yIncrement,
  });
  if (typeof otherX === "number") {
    addDirectionalDestinations({
      x: otherX,
      y: piece.position.y,
      xInc: 0,
      yInc: yIncrement,
    });
  }
  if (piece.type === "kamikaze") {
    addDirectionalDestinations({
      x: curX,
      y: piece.position.y,
      xInc: xIncrement,
      yInc: -yIncrement,
    });
    if (typeof otherX === "number") {
      addDirectionalDestinations({
        x: otherX,
        y: piece.position.y,
        xInc: 0,
        yInc: -yIncrement,
      });
    }
  }

  if (
    pieceDestinations.some((pd) => pd.moveType === "attack") ||
    thisPieceIsAttackChaining
  ) {
    pieceDestinations = pieceDestinations.filter(
      (pd) => pd.moveType === "attack",
    );
  }

  return pieceDestinations;
}

/**
 * Parameters for the `mapPieceToDestinations` function.
 */
interface MapPieceToDestinationsParams {
  pieces: Record<PieceId, IGamePiece>;
  turn: PlayerColor;
  board: GameBoard;
  lastMove: MoveMadeEvent | undefined;
  winner: PlayerColor | undefined;
}

export type PieceToDestinationsMap = Record<
  PieceId,
  IDestinationMarker[] | undefined
>;

/**
 * Maps each piece to its possible destinations.
 * If any piece can attack, only attack destinations are returned for all pieces.
 *
 * @param params - The parameters for the function.
 * @returns A record mapping each piece ID to an array of its possible destinations.
 */
export function mapPieceToDestinations({
  pieces,
  turn,
  board,
  lastMove,
  winner,
}: MapPieceToDestinationsParams): PieceToDestinationsMap {
  const map = {} as PieceToDestinationsMap;

  let somePieceCanAttack = false;
  for (const id in pieces) {
    const piece = pieces[id as PieceId];
    if (piece.status === "in-play") {
      const pieceDestinations = getDestinationsForPiece({
        piece,
        pieces,
        turn,
        board,
        lastMove,
        winner,
      });
      map[piece.id] = pieceDestinations;
      somePieceCanAttack ||= (map[piece.id] ?? []).some(
        (d) => d.moveType === "attack",
      );
    }
  }

  // if any piece can attack, we only show attack destinations
  if (somePieceCanAttack) {
    Object.keys(map).forEach((id) => {
      map[id as PieceId] = (map[id as PieceId] ?? []).filter(
        (d) => d.moveType === "attack",
      );
    });
  }

  return map;
}

/**
 * Derives the game board from the current state of the pieces.
 * The board is represented as a 2D array, where each cell contains either a game piece or null.
 *
 * @param pieces - A record of all pieces in the game.
 * @returns The game board.
 */
export function getBoardFromPieces(
  pieces: Record<PieceId, IGamePiece>,
): GameBoard {
  const board: GameBoard = Array.from({ length: BOARD_WIDTH }, () =>
    Array.from({ length: BOARD_HEIGHT }, () => null),
  );
  Object.values(pieces).forEach((piece) => {
    if (piece.status === "in-play") {
      board[piece.position.x][piece.position.y] = JSON.parse(
        JSON.stringify(piece),
      ) as IGamePiece;
    }
  });
  return board;
}

export function saveIdToLocalStorageKey(saveId: string) {
  return `savedGame-${saveId}`;
}

const PLAYER_COLORS: ReadonlySet<string> = new Set(["red", "blue"]);
const PIECE_TYPES: ReadonlySet<string> = new Set(["ship", "plane", "kamikaze"]);
const PIECE_STATUSES: ReadonlySet<string> = new Set(["in-play", "destroyed"]);
const GAME_PHASES: ReadonlySet<string> = new Set(
  Object.values(GamePhase) as string[],
);
const PIECE_IDS: ReadonlySet<string> = new Set(
  Object.values(PieceId) as string[],
);
const MOVE_TYPES: ReadonlySet<string> = new Set(["move", "attack"]);

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isPosition(v: unknown): v is { x: number; y: number } {
  return (
    isObject(v) &&
    typeof v.x === "number" &&
    Number.isFinite(v.x) &&
    typeof v.y === "number" &&
    Number.isFinite(v.y)
  );
}

function isGamePiece(v: unknown): v is IGamePiece {
  if (!isObject(v)) return false;
  if (typeof v.id !== "string" || !PIECE_IDS.has(v.id)) return false;
  if (typeof v.type !== "string" || !PIECE_TYPES.has(v.type)) return false;
  if (typeof v.owner !== "string" || !PLAYER_COLORS.has(v.owner)) return false;
  if (typeof v.status !== "string" || !PIECE_STATUSES.has(v.status))
    return false;
  if (!isPosition(v.position)) return false;
  if (
    v.number !== undefined &&
    !(typeof v.number === "number" && Number.isFinite(v.number))
  ) {
    return false;
  }
  return true;
}

function isMoveMadeEvent(v: unknown): v is MoveMadeEvent {
  if (!isObject(v)) return false;
  if (v.eventType !== "moveMade") return false;
  if (typeof v.moveType !== "string" || !MOVE_TYPES.has(v.moveType))
    return false;
  if (!isPosition(v.from) || !isPosition(v.to)) return false;
  if (!isGamePiece(v.piece)) return false;
  return true;
}

/**
 * Validates that an unknown value (typically parsed from localStorage) matches
 * the IGameState shape closely enough that the app can resume from it without
 * crashing. Optional/`undefined` fields are accepted as missing keys because
 * `JSON.stringify` drops them.
 */
export function isValidGameState(v: unknown): v is IGameState {
  if (!isObject(v)) return false;
  if (typeof v.player !== "string" || !PLAYER_COLORS.has(v.player))
    return false;
  if (typeof v.turn !== "string" || !PLAYER_COLORS.has(v.turn)) return false;
  if (typeof v.phase !== "string" || !GAME_PHASES.has(v.phase)) return false;
  if (
    v.winner !== undefined &&
    !(typeof v.winner === "string" && PLAYER_COLORS.has(v.winner))
  ) {
    return false;
  }
  if (
    v.selectedPieceId !== undefined &&
    !(typeof v.selectedPieceId === "string" && PIECE_IDS.has(v.selectedPieceId))
  ) {
    return false;
  }
  if (v.lastMove !== undefined && !isMoveMadeEvent(v.lastMove)) return false;
  if (!isObject(v.pieces)) return false;
  for (const id of Object.values(PieceId)) {
    const piece = v.pieces[id];
    if (!isGamePiece(piece) || piece.id !== id) return false;
  }
  return true;
}

export function getGameSave(saveId: string): IGameState | undefined {
  const key = saveIdToLocalStorageKey(saveId);
  const savedGame = localStorage.getItem(key);
  if (!savedGame) return undefined;

  let parsed: unknown;
  try {
    parsed = JSON.parse(savedGame);
  } catch {
    console.warn(
      `Discarding saved game "${saveId}": stored value is not valid JSON.`,
    );
    localStorage.removeItem(key);
    return undefined;
  }

  if (!isValidGameState(parsed)) {
    console.warn(
      `Discarding saved game "${saveId}": stored value does not match the expected game state shape.`,
    );
    localStorage.removeItem(key);
    return undefined;
  }

  return parsed;
}
