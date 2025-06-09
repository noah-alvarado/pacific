import type { IGamePiece, PieceId } from "../types/GameState";

import { INITIAL_PIECES } from "../constants/initialPieces";
import { createStore } from "solid-js/store";

const [pieces, setPieces] = createStore<Record<PieceId, IGamePiece>>(INITIAL_PIECES);

export function usePieces() {
    return [pieces, setPieces] as const;
}