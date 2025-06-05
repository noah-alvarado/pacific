import type { IGamePiece } from "../types/GameState";
import { createStore } from "solid-js/store";

export const [pieces, _setPieces] = createStore<IGamePiece[]>([]);
export function setPieces(newPieces: IGamePiece[]) {
    _setPieces(newPieces);
}

export function usePieces() {
    return [pieces, setPieces] as const;
}

export function addPiece(piece: IGamePiece) {
    _setPieces([...pieces, piece]);
}

export function updatePiece(piece: IGamePiece) {
    _setPieces(
        (p) => piece.type === p.type && piece.number === p.number && piece.owner === p.owner,
        (p) => ({ ...p, ...piece })
    );
}

export function setPiece(piece: IGamePiece) {
    const curPiece = pieces.find(p => p.type === piece.type && p.number === piece.number && p.owner === piece.owner);
    if (curPiece) {
        updatePiece(piece);
    }
    else {
        addPiece(piece);
    }
}