import type { IGamePiece, PieceId } from './GameState';

import { IDestinationMarker } from '../store/destinationsStore';

export interface PieceSelectedEvent {
    pieceId: PieceId;
    selected: boolean;
}

export type DestinationSelectedEvent = IDestinationMarker

export type MoveType = 'move' | 'attack';
export interface MoveMadeEvent {
    piece: IGamePiece;
    type: MoveType;
    from: { x: number, y: number };
    to: { x: number, y: number };
}

export interface GameEvents {
    pieceSelected: (e: PieceSelectedEvent) => void;
    destinationSelected: (e: DestinationSelectedEvent) => void;
    moveMade: (e: MoveMadeEvent) => void;
}