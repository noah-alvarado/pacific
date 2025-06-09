import { IGamePiece } from '../types/GameState';
import { PieceId } from '../types/GameState';

export const INITIAL_PIECES: IGamePiece[] = [
    // red
    { id: PieceId.RedShip1, type: 'ship', number: 1, owner: 'red', status: 'in-play', position: { x: 0, y: 0 } },
    { id: PieceId.RedPlane1A, type: 'plane', number: 1, owner: 'red', status: 'in-play', position: { x: 0, y: 1 } },
    { id: PieceId.RedPlane1B, type: 'plane', number: 1, owner: 'red', status: 'in-play', position: { x: 0, y: 2 } },
    { id: PieceId.RedShip2, type: 'ship', number: 2, owner: 'red', status: 'in-play', position: { x: 1, y: 0 } },
    { id: PieceId.RedPlane2A, type: 'plane', number: 2, owner: 'red', status: 'in-play', position: { x: 1, y: 1 } },
    { id: PieceId.RedPlane2B, type: 'plane', number: 2, owner: 'red', status: 'in-play', position: { x: 1, y: 2 } },
    { id: PieceId.RedShip3, type: 'ship', number: 3, owner: 'red', status: 'in-play', position: { x: 2, y: 0 } },
    { id: PieceId.RedPlane3A, type: 'plane', number: 3, owner: 'red', status: 'in-play', position: { x: 2, y: 1 } },
    { id: PieceId.RedPlane3B, type: 'plane', number: 3, owner: 'red', status: 'in-play', position: { x: 2, y: 2 } },
    { id: PieceId.RedShip4, type: 'ship', number: 4, owner: 'red', status: 'in-play', position: { x: 3, y: 0 } },
    { id: PieceId.RedPlane4A, type: 'plane', number: 4, owner: 'red', status: 'in-play', position: { x: 3, y: 1 } },
    { id: PieceId.RedPlane4B, type: 'plane', number: 4, owner: 'red', status: 'in-play', position: { x: 3, y: 2 } },
    // blue
    { id: PieceId.BlueShip1, type: 'ship', number: 1, owner: 'blue', status: 'in-play', position: { x: 0, y: 7 } },
    { id: PieceId.BluePlane1A, type: 'plane', number: 1, owner: 'blue', status: 'in-play', position: { x: 0, y: 6 } },
    { id: PieceId.BluePlane1B, type: 'plane', number: 1, owner: 'blue', status: 'in-play', position: { x: 0, y: 5 } },
    { id: PieceId.BlueShip2, type: 'ship', number: 2, owner: 'blue', status: 'in-play', position: { x: 1, y: 7 } },
    { id: PieceId.BluePlane2A, type: 'plane', number: 2, owner: 'blue', status: 'in-play', position: { x: 1, y: 6 } },
    { id: PieceId.BluePlane2B, type: 'plane', number: 2, owner: 'blue', status: 'in-play', position: { x: 1, y: 5 } },
    { id: PieceId.BlueShip3, type: 'ship', number: 3, owner: 'blue', status: 'in-play', position: { x: 2, y: 7 } },
    { id: PieceId.BluePlane3A, type: 'plane', number: 3, owner: 'blue', status: 'in-play', position: { x: 2, y: 6 } },
    { id: PieceId.BluePlane3B, type: 'plane', number: 3, owner: 'blue', status: 'in-play', position: { x: 2, y: 5 } },
    { id: PieceId.BlueShip4, type: 'ship', number: 4, owner: 'blue', status: 'in-play', position: { x: 3, y: 7 } },
    { id: PieceId.BluePlane4A, type: 'plane', number: 4, owner: 'blue', status: 'in-play', position: { x: 3, y: 6 } },
    { id: PieceId.BluePlane4B, type: 'plane', number: 4, owner: 'blue', status: 'in-play', position: { x: 3, y: 5 } },
];
