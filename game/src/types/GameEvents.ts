import { PieceId } from './GameState';

export interface PieceSelectedEvent {
    pieceId: PieceId;
}

export interface MoveMadeEvent {
    pieceId: PieceId;
    from: { x: number, y: number };
    to: { x: number, y: number };
}

export interface GameEvents {
    pieceSelected: (e: PieceSelectedEvent) => void;
    moveMade: (e: MoveMadeEvent) => void;
}