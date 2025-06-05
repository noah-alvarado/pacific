import type { IGamePiece } from "../types/GameState";
import { createStore } from "solid-js/store";

const [pieces, setPieces] = createStore<IGamePiece[]>([]);

export function usePieces() {
    return [pieces, setPieces] as const;
}

export function addPiece(piece: IGamePiece) {
    setPieces([...pieces, piece]);
}

export function updatePiece(piece: IGamePiece) {
    setPieces(
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