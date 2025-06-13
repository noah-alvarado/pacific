import { GamePhase, IDestinationMarker, IGamePiece, IGameState, PlayerColor } from '../types/GameState';

import { PieceId } from '../types/GameState';

export const INITIAL_PIECES: Record<PieceId, IGamePiece> = {
    // red
    [PieceId.RedShip1]: { id: PieceId.RedShip1, type: 'ship', number: 1, owner: 'red', status: 'in-play', position: { x: 0, y: 0 } },
    [PieceId.RedPlane1A]: { id: PieceId.RedPlane1A, type: 'plane', number: 1, owner: 'red', status: 'in-play', position: { x: 0, y: 1 } },
    [PieceId.RedPlane1B]: { id: PieceId.RedPlane1B, type: 'plane', number: 1, owner: 'red', status: 'in-play', position: { x: 0, y: 2 } },
    [PieceId.RedShip2]: { id: PieceId.RedShip2, type: 'ship', number: 2, owner: 'red', status: 'in-play', position: { x: 1, y: 0 } },
    [PieceId.RedPlane2A]: { id: PieceId.RedPlane2A, type: 'plane', number: 2, owner: 'red', status: 'in-play', position: { x: 1, y: 1 } },
    [PieceId.RedPlane2B]: { id: PieceId.RedPlane2B, type: 'plane', number: 2, owner: 'red', status: 'in-play', position: { x: 1, y: 2 } },
    [PieceId.RedShip3]: { id: PieceId.RedShip3, type: 'ship', number: 3, owner: 'red', status: 'in-play', position: { x: 2, y: 0 } },
    [PieceId.RedPlane3A]: { id: PieceId.RedPlane3A, type: 'plane', number: 3, owner: 'red', status: 'in-play', position: { x: 2, y: 1 } },
    [PieceId.RedPlane3B]: { id: PieceId.RedPlane3B, type: 'plane', number: 3, owner: 'red', status: 'in-play', position: { x: 2, y: 2 } },
    [PieceId.RedShip4]: { id: PieceId.RedShip4, type: 'ship', number: 4, owner: 'red', status: 'in-play', position: { x: 3, y: 0 } },
    [PieceId.RedPlane4A]: { id: PieceId.RedPlane4A, type: 'plane', number: 4, owner: 'red', status: 'in-play', position: { x: 3, y: 1 } },
    [PieceId.RedPlane4B]: { id: PieceId.RedPlane4B, type: 'plane', number: 4, owner: 'red', status: 'in-play', position: { x: 3, y: 2 } },
    // blue
    [PieceId.BlueShip1]: { id: PieceId.BlueShip1, type: 'ship', number: 1, owner: 'blue', status: 'in-play', position: { x: 0, y: 7 } },
    [PieceId.BluePlane1A]: { id: PieceId.BluePlane1A, type: 'plane', number: 1, owner: 'blue', status: 'in-play', position: { x: 0, y: 6 } },
    [PieceId.BluePlane1B]: { id: PieceId.BluePlane1B, type: 'plane', number: 1, owner: 'blue', status: 'in-play', position: { x: 0, y: 5 } },
    [PieceId.BlueShip2]: { id: PieceId.BlueShip2, type: 'ship', number: 2, owner: 'blue', status: 'in-play', position: { x: 1, y: 7 } },
    [PieceId.BluePlane2A]: { id: PieceId.BluePlane2A, type: 'plane', number: 2, owner: 'blue', status: 'in-play', position: { x: 1, y: 6 } },
    [PieceId.BluePlane2B]: { id: PieceId.BluePlane2B, type: 'plane', number: 2, owner: 'blue', status: 'in-play', position: { x: 1, y: 5 } },
    [PieceId.BlueShip3]: { id: PieceId.BlueShip3, type: 'ship', number: 3, owner: 'blue', status: 'in-play', position: { x: 2, y: 7 } },
    [PieceId.BluePlane3A]: { id: PieceId.BluePlane3A, type: 'plane', number: 3, owner: 'blue', status: 'in-play', position: { x: 2, y: 6 } },
    [PieceId.BluePlane3B]: { id: PieceId.BluePlane3B, type: 'plane', number: 3, owner: 'blue', status: 'in-play', position: { x: 2, y: 5 } },
    [PieceId.BlueShip4]: { id: PieceId.BlueShip4, type: 'ship', number: 4, owner: 'blue', status: 'in-play', position: { x: 3, y: 7 } },
    [PieceId.BluePlane4A]: { id: PieceId.BluePlane4A, type: 'plane', number: 4, owner: 'blue', status: 'in-play', position: { x: 3, y: 6 } },
    [PieceId.BluePlane4B]: { id: PieceId.BluePlane4B, type: 'plane', number: 4, owner: 'blue', status: 'in-play', position: { x: 3, y: 5 } },
};

export const INITIAL_STATE: (params: { player: PlayerColor | 'local', turn: PlayerColor }) => IGameState = ({ player, turn }) => ({
    lastMove: undefined,
    selectedPieceId: undefined,
    player,
    turn,
    phase: GamePhase.InProgress,
    history: [],
    winner: undefined,
    pieces: INITIAL_PIECES,
    destinations: [],
    pieceToDestinations: Object.values(INITIAL_PIECES)
        .reduce((acc, cur) =>
            (acc[cur.id] = [], acc),
            {} as Record<PieceId, IDestinationMarker[]>
        ),
});
