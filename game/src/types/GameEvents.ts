import type { IGamePiece } from './GameState';

export type MoveType = 'move' | 'attack';
export interface MoveMadeEvent {
    piece: IGamePiece;
    type: MoveType;
    from: { x: number, y: number };
    to: { x: number, y: number };
}

export type GameEvent = MoveMadeEvent;

export interface GameEvents {
    moveMade: (e: MoveMadeEvent) => void;
}