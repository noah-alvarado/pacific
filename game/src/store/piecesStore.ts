import type { IGamePiece, PieceId } from "../types/GameState";

import { createStore } from "solid-js/store";

const [pieces, setPieces] = createStore<IGamePiece[]>([]);

export function usePieces() {
    return [pieces, setPieces] as const;
}

export function getPieceById(id: PieceId) {
    return pieces.find(p => p.id === id);
}

export function addPiece(piece: IGamePiece) {
    setPieces([...pieces, piece]);
}

export function updatePiece(piece: IGamePiece) {
    setPieces(
        (p) => p.id === piece.id,
        (p) => ({ ...p, ...piece })
    );
}

export function setPiece(piece: IGamePiece) {
    const curPiece = getPieceById(piece.id);
    if (curPiece) {
        updatePiece(piece);
    } else {
        addPiece(piece);
    }
}