import type { GamePieceProps } from './components/GamePiece/GamePiece';

export type PlayerColor = 'red' | 'blue';

export interface ShipState {
    ship: GamePieceProps;
    planes: GamePieceProps[];
}

// Enum for game phases
export enum GamePhase {
    Setup = 'setup',
    InProgress = 'in-progress',
    Finished = 'finished',
}

// Represents a cell on the board
export interface BoardCell {
    x: number;
    y: number;
    piece?: GamePiece;
    // Add more cell-specific info as needed
}

// Represents a game piece (can be extended for different types)
export interface GamePiece {
    type: string;
    owner: PlayerColor;
    // Add more piece-specific info as needed
}

// Represents a player in the game
export interface PlayerState {
    color: PlayerColor;
    name?: string;
    pieces?: GamePiece[];
    score?: number;
    // Add more player-specific info as needed
}

// Define possible payloads for game actions
export type GameActionPayload =
    | { from: { x: number; y: number }; to: { x: number; y: number } } // move
    | { piece: GamePiece; position: { x: number; y: number } } // place
    | Record<string, unknown>; // fallback for future extensibility

// Represents an action taken in the game (for history, undo, etc.)
export interface GameAction {
    player: PlayerColor;
    type: string;
    payload: GameActionPayload;
    timestamp: number;
}

// The main game state
export interface GameState {
    players: PlayerState[];
    board: BoardCell[][];
    turn: PlayerColor;
    phase: GamePhase;
    history?: GameAction[];
    winner?: PlayerColor | null;
}

// This file has been migrated to ./types/GameState.ts. Please import from './types' or './types/GameState' instead.
