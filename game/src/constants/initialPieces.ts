import { IGamePiece } from '../types/GameState';

export const INITIAL_PIECES: IGamePiece[] = [
    // red
    { type: 'ship', number: 1, owner: 'red', status: 'in-play', position: { x: 0, y: 0 } },
    { type: 'plane', number: 1, owner: 'red', status: 'in-play', position: { x: 0, y: 1 } },
    { type: 'plane', number: 1, owner: 'red', status: 'in-play', position: { x: 0, y: 2 } },
    { type: 'ship', number: 2, owner: 'red', status: 'in-play', position: { x: 1, y: 0 } },
    { type: 'plane', number: 2, owner: 'red', status: 'in-play', position: { x: 1, y: 1 } },
    { type: 'plane', number: 2, owner: 'red', status: 'in-play', position: { x: 1, y: 2 } },
    { type: 'ship', number: 3, owner: 'red', status: 'in-play', position: { x: 2, y: 0 } },
    { type: 'plane', number: 3, owner: 'red', status: 'in-play', position: { x: 2, y: 1 } },
    { type: 'plane', number: 3, owner: 'red', status: 'in-play', position: { x: 2, y: 2 } },
    { type: 'ship', number: 4, owner: 'red', status: 'in-play', position: { x: 3, y: 0 } },
    { type: 'plane', number: 4, owner: 'red', status: 'in-play', position: { x: 3, y: 1 } },
    { type: 'plane', number: 4, owner: 'red', status: 'in-play', position: { x: 3, y: 2 } },
    // blue
    { type: 'ship', number: 1, owner: 'blue', status: 'in-play', position: { x: 0, y: 7 } },
    { type: 'plane', number: 1, owner: 'blue', status: 'in-play', position: { x: 0, y: 6 } },
    { type: 'plane', number: 1, owner: 'blue', status: 'in-play', position: { x: 0, y: 5 } },
    { type: 'ship', number: 2, owner: 'blue', status: 'in-play', position: { x: 1, y: 7 } },
    { type: 'plane', number: 2, owner: 'blue', status: 'in-play', position: { x: 1, y: 6 } },
    { type: 'plane', number: 2, owner: 'blue', status: 'in-play', position: { x: 1, y: 5 } },
    { type: 'ship', number: 3, owner: 'blue', status: 'in-play', position: { x: 2, y: 7 } },
    { type: 'plane', number: 3, owner: 'blue', status: 'in-play', position: { x: 2, y: 6 } },
    { type: 'plane', number: 3, owner: 'blue', status: 'in-play', position: { x: 2, y: 5 } },
    { type: 'ship', number: 4, owner: 'blue', status: 'in-play', position: { x: 3, y: 7 } },
    { type: 'plane', number: 4, owner: 'blue', status: 'in-play', position: { x: 3, y: 6 } },
    { type: 'plane', number: 4, owner: 'blue', status: 'in-play', position: { x: 3, y: 5 } },
];
