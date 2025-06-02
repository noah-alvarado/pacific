import type { GamePieceProps } from './components/GamePiece/GamePiece';

export type PlayerColor = 'red' | 'blue';

export interface ShipState {
    ship: GamePieceProps;
    planes: GamePieceProps[];
}

export interface PlayerBaseState {
    color: PlayerColor;
}

export interface PlayerState extends PlayerBaseState {
    ships: ShipState[];
}
