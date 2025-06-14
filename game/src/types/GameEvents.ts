import type { IGamePiece, PlayerColor } from './GameState';

export type MoveType = 'move' | 'attack';
export interface MoveMadeEvent {
    piece: IGamePiece;
    moveType: MoveType;
    from: { x: number, y: number };
    to: { x: number, y: number };
}

export interface TurnChangeEvent {
    from: PlayerColor;
    to: PlayerColor;
}

export interface GameEndEvent {
    winner: PlayerColor;
    loser: PlayerColor;
    reason: 'no-planes' | 'no-moves' | 'resignation';
}

export type GameEvent = MoveMadeEvent | TurnChangeEvent | GameEndEvent;

export interface GameEvents {
    moveMade: (e: MoveMadeEvent) => void;
    turnChange: (e: TurnChangeEvent) => void;
    gameEnd: (e: GameEndEvent) => void;
}