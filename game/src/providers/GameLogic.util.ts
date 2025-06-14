import { GameBoard, IDestinationMarker, IGamePiece, PieceId, PlayerColor, getShipIdFromPlaneId, pieceCanAttack } from '../types/GameState';

import type { MoveMadeEvent } from '../types/GameEvents';

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
    if (piece.status !== 'in-play') return pieceDestinations;
    if (piece.owner !== turn) return pieceDestinations;

    const lastMoveWasThisPlayer = lastMove?.piece.owner === turn;
    const lastMoveWasAttack = lastMove?.moveType === 'attack';
    const lastMoveWasThisPiece = lastMove?.piece.id === piece.id;
    if (lastMoveWasThisPlayer && lastMoveWasAttack && !lastMoveWasThisPiece) {
        return pieceDestinations;
    }

    const thisPieceIsAttackChaining = lastMoveWasThisPlayer && lastMoveWasAttack && lastMoveWasThisPiece;
    if (piece.type === 'plane' && !thisPieceIsAttackChaining) {
        const shipId = getShipIdFromPlaneId(piece.id);
        if (!shipId) {
            return pieceDestinations;
        }
        const ship = pieces[shipId];
        const rowsApart = piece.position.y - ship.position.y;
        console.log(piece.id, 'rowsApart', rowsApart, 'shipId', shipId);
        if (piece.owner === 'red' ? rowsApart >= 3 : rowsApart <= -3) {
            return pieceDestinations;
        }
    }

    const isEvenRow = piece.position.y % 2 === 0;
    const xIncrement = isEvenRow ? 1 : -1;
    const curX = piece.position.x;
    const otherX = (isEvenRow || curX > 0)
        && (!isEvenRow || curX < 3)
        && curX + xIncrement;
    const yIncrement = piece.owner === 'red' ? 1 : -1;

    function posIsEmpty(x: number, y: number) {
        return board[x][y] === null;
    }
    function posInBounds(x: number, y: number) {
        return x >= 0 && x <= 3 && y >= 0 && y <= 7;
    }
    function posIsOpponent(x: number, y: number) {
        const pos = board[x][y];
        return posInBounds(x, y) && !posIsEmpty(x, y) && pos && pos.owner !== piece.owner;
    }

    function addDirectionalDestinations({ x, y, xInc, yInc }: { x: number, y: number, xInc: number, yInc: number }) {
        const nextY = y + yInc;
        if (posIsEmpty(x, nextY) && !thisPieceIsAttackChaining) {
            pieceDestinations.push({
                moveType: 'move',
                position: { x, y: nextY },
            });
        } else if (pieceCanAttack(piece.type) && posIsOpponent(x, nextY)) {
            const jumpX = x - xInc;
            const jumpY = nextY + yInc;
            if (posInBounds(jumpX, jumpY) && posIsEmpty(jumpX, jumpY)) {
                pieceDestinations.push({
                    moveType: 'attack',
                    position: { x: jumpX, y: jumpY },
                });
            }
        }
    }

    addDirectionalDestinations({ x: curX, y: piece.position.y, xInc: xIncrement, yInc: yIncrement });
    if (typeof otherX === 'number') {
        addDirectionalDestinations({ x: otherX, y: piece.position.y, xInc: 0, yInc: yIncrement });
    }
    if (piece.type === 'kamikaze') {
        addDirectionalDestinations({ x: curX, y: piece.position.y, xInc: xIncrement, yInc: -yIncrement });
        if (typeof otherX === 'number') {
            addDirectionalDestinations({ x: otherX, y: piece.position.y, xInc: 0, yInc: -yIncrement });
        }
    }

    if (pieceDestinations.some(pd => pd.moveType === 'attack') || thisPieceIsAttackChaining) {
        pieceDestinations = pieceDestinations.filter(pd => pd.moveType === 'attack');
    }

    return pieceDestinations;
}

interface MapPieceToDestinationsParams {
    pieces: Record<PieceId, IGamePiece>;
    turn: PlayerColor;
    board: GameBoard;
    lastMove: MoveMadeEvent | undefined;
    winner: PlayerColor | undefined;
}

export function mapPieceToDestinations({
    pieces,
    turn,
    board,
    lastMove,
    winner,
}: MapPieceToDestinationsParams): Record<PieceId, IDestinationMarker[]> {
    const map = {} as Record<PieceId, IDestinationMarker[]>;

    let somePieceCanAttack = false;
    for (const id in pieces) {
        const piece = pieces[id as PieceId];
        if (piece.status === 'in-play') {
            const pieceDestinations = getDestinationsForPiece({
                piece, pieces, turn, board, lastMove, winner
            });
            map[piece.id] = pieceDestinations;
            somePieceCanAttack ||= map[piece.id].some(d => d.moveType === 'attack');
        }
    }

    // if any piece can attack, we only show attack destinations
    if (somePieceCanAttack) {
        Object.keys(map).forEach((id) => {
            map[id as PieceId] = map[id as PieceId].filter(d => d.moveType === 'attack');
        });
    }

    return map;
}

export function getBoardFromPieces(pieces: Record<PieceId, IGamePiece>): GameBoard {
    const board: GameBoard = Array.from({ length: 4 }, () => Array.from({ length: 8 }, () => null));
    Object.values(pieces).forEach(piece => {
        if (piece.status === 'in-play') {
            board[piece.position.x][piece.position.y] = piece;
        }
    });
    return board;
}
